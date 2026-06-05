"""
HoWDe Labelling Pipeline
------------------------
Processes Infostop stop data in batches, applies HoWDe labelling using Spark,
and saves the results to a PostGIS database.
"""

import logging
from typing import List
import geopandas as gpd
from shapely import wkt
from sqlalchemy import create_engine, text
from pyspark.sql import SparkSession
from geoalchemy2 import Geometry
from howde import HoWDe_labelling
from tqdm import tqdm


# ---------------- 1. Configuration ----------------
PARAMS = {
    "db_url": "postgresql://mobiledata:m0bil3Dat4#2025@localhost:5432/se_mobile_data",
    "schema": "extracts",
    "source_table": "extracts.srh_proto_tourism_infostops_howde_2024_city",
    "dest_table": "srh_proto_tourism_howde_2024_city",
    "batch_size": 100,
    "spark_memory": "16g"
}


# ---------------- 2. Setup Functions ----------------
def setup_logger() -> None:
    """Configure logging for console output."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s",
        handlers=[logging.StreamHandler()]
    )


def create_db_engine():
    """Establish PostgreSQL database connection."""
    engine = create_engine(
        PARAMS["db_url"],
        connect_args={"client_encoding": "utf8"}
    )
    logging.info("Database engine created successfully.")
    return engine


def initialize_spark():
    """Initialize Spark session."""
    spark = (
        SparkSession.builder
        .appName("HoWDePipeline")
        .config("spark.driver.memory", PARAMS["spark_memory"])
        .getOrCreate()
    )
    logging.info("Spark session initialized.")
    return spark


# ---------------- 3. Core Functions ----------------
def fetch_device_uids(engine) -> List[str]:
    """Fetch unique device_aid values from the database."""
    query = text(f"SELECT DISTINCT device_aid FROM {PARAMS['source_table']}")
    with engine.connect() as conn:
        result = conn.execute(query).fetchall()
    uids = [row[0] for row in result]
    logging.info(f" Retrieved {len(uids)} unique devices.")
    return uids


def process_batch(spark, engine, batch_uids: List[str], batch_idx: int, num_batches: int) -> None:
    """Process a single batch of users through the HoWDe labelling pipeline."""
    logging.info(f"Processing batch {batch_idx + 1}/{num_batches} with {len(batch_uids)} users...")

    query = text(f"""
        SELECT device_aid, start, "end", geometry
        FROM {PARAMS['source_table']}
        WHERE device_aid = ANY(:uids)
        ORDER BY device_aid;
    """)

    with engine.connect() as conn:
        gdf = gpd.read_postgis(query, conn, geom_col="geometry", params={"uids": batch_uids})

    if gdf.empty:
        logging.warning(f"Batch {batch_idx + 1}: No data found, skipping.")
        return

    # Prepare for Spark processing
    gdf = gdf.rename(columns={"device_aid": "useruuid", "geometry": "loc"})
    gdf["useruuid"] = gdf["useruuid"].astype(str)
    gdf["loc"] = gdf["loc"].apply(lambda geom: geom.wkt)

    spark_df = spark.createDataFrame(gdf)

    # Run HoWDe labelling
    labeled_pd = HoWDe_labelling(spark_df, verbose=True).toPandas()

    # Convert back to GeoDataFrame
    labeled_pd["loc"] = labeled_pd["loc"].apply(wkt.loads)
    labeled_gdf = gpd.GeoDataFrame(labeled_pd, geometry="loc", crs="EPSG:4326")

    # Rename columns
    labeled_gdf = labeled_gdf.rename(columns={"useruuid": "device_uid", "loc": "geom"}).set_geometry("geom")

    # Write to PostGIS
    with engine.begin() as conn:
        labeled_gdf.to_postgis(
            name=PARAMS["dest_table"],
            con=conn,
            schema=PARAMS["schema"],
            if_exists="append",
            index=False,
            dtype={"geom": Geometry("POINT", srid=4326, spatial_index=True)}
        )

    logging.info(f"Batch {batch_idx + 1}/{num_batches} saved successfully.")


# ---------------- 4. Main Pipeline ----------------
def main():
    setup_logger()
    logging.info("Starting HoWDe labelling pipeline...")

    # Initialize database and Spark
    engine = create_db_engine()
    spark = initialize_spark()

    # Retrieve unique devices
    uids = fetch_device_uids(engine)
    batch_size = PARAMS["batch_size"]
    num_batches = (len(uids) + batch_size - 1) // batch_size
    logging.info(f"Total devices: {len(uids)} across {num_batches} batches.")

    # Process batches
    for batch_idx in tqdm(range(num_batches), desc="Processing HoWDe batches"):
        batch_uids = uids[batch_idx * batch_size:(batch_idx + 1) * batch_size]
        try:
            process_batch(spark, engine, batch_uids, batch_idx, num_batches)
        except Exception as e:
            logging.error(f"Error processing batch {batch_idx + 1}: {e}", exc_info=True)
            continue

    # Cleanup
    spark.stop()
    logging.info("Pipeline complete. All batches processed successfully.")


if __name__ == "__main__":
    main()



