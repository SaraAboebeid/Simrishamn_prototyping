-- getting complete set of stops using IDs, required for when we don't have destination boundaries
DROP TABLE IF EXISTS extracts.srh_proto_tourism_mpd_2024_city;

CREATE TABLE extracts.srh_proto_tourism_mpd_2024_city AS
    SELECT * FROM processed.point_types_2024
    WHERE device_uid IN
        (SELECT a.device_uid
          FROM processed.point_types_2024 AS a,
            (SELECT geom FROM boundaries.srh_city_boundary_4326) AS b
            WHERE a.geom && b.geom
        );

CREATE INDEX srh_proto_tourism_mpd_2024_city_geom_sidx ON extracts.srh_proto_tourism_mpd_2024_city USING GIST (geom);

-- keep stops >= 10 minutes
DROP TABLE IF EXISTS extracts.srh_proto_tourism_infostops_stops_2024_city_10min;

CREATE TABLE extracts.srh_proto_tourism_infostops_stops_2024_city_10min AS
SELECT
    device_uid,
    loc,
    MIN("timestamp") AS start_time,
    MAX("timestamp") AS end_time,

    -- duration as a timestamp-like value: 00:10:00 to 16:00:00
    (TIME '00:00:00' + (MAX("timestamp") - MIN("timestamp"))) AS duration,

    ST_SetSRID(
        ST_Centroid(ST_Collect(geometry)),
        4326
    ) AS geometry
FROM extracts.srh_proto_tourism_infostops_stops_2024_city
GROUP BY device_uid, loc
HAVING MAX("timestamp") - MIN("timestamp") >= INTERVAL '10 minutes';

CREATE INDEX IF NOT EXISTS srh_proto_tourism_infostops_stops_2024_city_10min_geom_sidx
ON extracts.srh_proto_tourism_infostops_stops_2024_city_10min
USING GIST (geometry);

CREATE INDEX IF NOT EXISTS srh_proto_tourism_infostops_stops_2024_city_10min_device_loc_idx
ON extracts.srh_proto_tourism_infostops_stops_2024_city_10min
(device_uid, loc);