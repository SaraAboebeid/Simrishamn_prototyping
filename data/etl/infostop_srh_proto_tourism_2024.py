# -*- coding: utf-8 -*-
"""
Infostop
--------------------------------
Runs Infostop clustering on stop data,
creates:
1) stop-level GeoDataFrame
2) HoWDe aggregated stops
and saves both to PostGIS in memory-safe batches.
"""

print("Starting...", flush=True)

import pandas as pd
import geopandas as gpd
from sqlalchemy import create_engine, text
from infostop import Infostop
from geoalchemy2 import Geometry
from tqdm import tqdm
import logging
import sys
import gc

print("Libraries imported!", flush=True)

# ---------------- Configuration ----------------
PARAMS = {
    "r1": 30,
    "r2": 30,
    "min_stay": 15 * 60,
    "max_gap": 4 * 3600,
    "batch_size": 100,
    "db_url": "postgresql://mobiledata:m0bil3Dat4%232025@localhost:5432/se_mobile_data",
    "schema_source": "extracts",
    "schema_target": "extracts",
    "source": "extracts.srh_proto_tourism_mpd_2024_city",
    "dest_howde": "srh_proto_tourism_infostops_howde_2024_city",
    "dest_stops": "srh_proto_tourism_infostops_stops_2024_city"
}

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
log = logging.getLogger(__name__)

# ---------------- Database ----------------
def get_engine():
    print("Connecting to database...", flush=True)
    return create_engine(PARAMS["db_url"], connect_args={"client_encoding": "utf8"})

# ---------------- Data Loading ----------------
def get_device_uids(engine):
    q = text(f"SELECT DISTINCT device_uid FROM {PARAMS['source']}")
    uids = pd.read_sql(q, con=engine)['device_uid'].dropna().tolist()
    print(f"Found {len(uids)} unique device_uids.", flush=True)
    return uids

def load_data_for_uids(engine, uid_list):
    if not uid_list:
        return pd.DataFrame()

    uid_str = ','.join([f"'{str(uid)}'" for uid in uid_list])

    q = text(f"""
        SELECT device_uid, x AS longitude, y AS latitude, timestamp_se AS timestamp
        FROM {PARAMS['source']}
        WHERE device_uid IN ({uid_str})
          AND x IS NOT NULL AND y IS NOT NULL AND timestamp_se IS NOT NULL
    """)

    df = pd.read_sql(q, con=engine)
    return df.sort_values(['device_uid', 'timestamp']).reset_index(drop=True)

# ---------------- Infostop ----------------
def run_infostop(uid, df):

    df = df.dropna(subset=['latitude', 'longitude', 'timestamp']) \
           .drop_duplicates() \
           .sort_values('timestamp')

    if df.empty:
        return pd.DataFrame(), pd.DataFrame()

    df['timestamp'] = pd.to_datetime(df['timestamp'], utc=True).dt.tz_convert(None)
    df['timestamp_sec'] = df['timestamp'].astype('int64') // 10**9

    model = Infostop(
        r1=PARAMS["r1"],
        r2=PARAMS["r2"],
        min_staying_time=PARAMS["min_stay"],
        max_time_between=PARAMS["max_gap"]
    )

    try:
        df['loc'] = model.fit_predict(
            df[['latitude', 'longitude', 'timestamp_sec']].values
        )
    except Exception as e:
        log.warning(f"Infostop failed for {uid}: {e}")
        return pd.DataFrame(), pd.DataFrame()

    df = df[df['loc'] > 0]
    if df.empty:
        return pd.DataFrame(), pd.DataFrame()

    med = model.compute_label_medians()
    df['stop_latitude'] = df['loc'].map({k: v[0] for k, v in med.items()})
    df['stop_longitude'] = df['loc'].map({k: v[1] for k, v in med.items()})

    df['interval'] = (
        ~(
            (df['loc'] == df['loc'].shift()) &
            ((df['timestamp'] - df['timestamp'].shift()).dt.total_seconds() < PARAMS["max_gap"])
        )
    ).cumsum()

    # ---------------- STOP LEVEL ----------------
    stops_gdf = gpd.GeoDataFrame(
        df.copy(),
        geometry=gpd.points_from_xy(df.stop_longitude, df.stop_latitude),
        crs="EPSG:4326"
    )

    # ---------------- HOWDE ----------------
    howde_df = (
        df.groupby(['device_uid', 'interval'])
          .agg(
              loc=('loc', 'first'),
              start=('timestamp', 'min'),
              end=('timestamp', 'max'),
              latitude=('stop_latitude', 'first'),
              longitude=('stop_longitude', 'first'),
              size=('loc', 'count')
          )
          .reset_index()
    ).rename(columns={'device_uid': 'device_aid'})

    howde_gdf = gpd.GeoDataFrame(
        howde_df,
        geometry=gpd.points_from_xy(howde_df.longitude, howde_df.latitude),
        crs="EPSG:4326"
    )

    return stops_gdf, howde_gdf

# ---------------- Save ----------------
def save_gdf(gdf, engine, table):
    if not gdf.empty:
        gdf.to_postgis(
            name=table,
            con=engine,
            schema=PARAMS["schema_target"],
            if_exists="append",
            index=False,
            dtype={"geometry": Geometry("POINT", srid=4326)}
        )
        log.info(f"Saved {len(gdf)} rows to {table}")
    else:
        log.info(f"No data to save for {table}")

# ---------------- MAIN ----------------
def main():

    print("Starting main()...", flush=True)
    engine = get_engine()

    uids = get_device_uids(engine)
    if not uids:
        log.warning("No device_uids found.")
        return

    batches = (len(uids) + PARAMS["batch_size"] - 1) // PARAMS["batch_size"]

    for i in tqdm(range(batches), file=sys.stdout):

        batch_uids = uids[i * PARAMS["batch_size"]:(i + 1) * PARAMS["batch_size"]]
        log.info(f"Batch {i+1}/{batches} | {len(batch_uids)} devices")

        try:
            batch_data = load_data_for_uids(engine, batch_uids)
        except Exception as e:
            log.error(f"Load error batch {i+1}: {e}")
            continue

        if batch_data.empty:
            continue

        all_stops = []
        all_howde = []

        for uid in batch_uids:
            user_data = batch_data[batch_data.device_uid == uid]
            if not user_data.empty:
                stops, howde = run_infostop(uid, user_data)
                if not stops.empty:
                    all_stops.append(stops)
                if not howde.empty:
                    all_howde.append(howde)

        if all_stops:
            save_gdf(pd.concat(all_stops, ignore_index=True), engine, PARAMS["dest_stops"])

        if all_howde:
            save_gdf(pd.concat(all_howde, ignore_index=True), engine, PARAMS["dest_howde"])

        del batch_data, all_stops, all_howde
        gc.collect()

        log.info(f"Batch {i+1} done")

    engine.dispose()
    log.info("DONE")

# ---------------- RUN ----------------
if __name__ == "__main__":
    print("Running script...", flush=True)
    try:
        main()
    except Exception as e:
        print(f"Fatal error: {e}", file=sys.stderr, flush=True)
        raise










