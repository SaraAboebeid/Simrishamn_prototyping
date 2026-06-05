\echo 'Creating table srh_proto_tourism_mpd_2024_city...'

DROP TABLE IF EXISTS extracts.srh_proto_tourism_mpd_2024_city;

CREATE TABLE extracts.srh_proto_tourism_mpd_2024_city AS
SELECT *
FROM processed.point_types_2024
WHERE device_uid IN (
    SELECT DISTINCT a.device_uid
    FROM processed.point_types_2024 AS a
    CROSS JOIN boundaries.srh_city_boundary AS b
    WHERE a.geom && b.geom
);

\echo 'Creating spatial index...'

CREATE INDEX srh_proto_tourism_mpd_2024_city_geom_sidx
ON extracts.srh_proto_tourism_mpd_2024_city
USING GIST (geom);

\echo 'Done.'