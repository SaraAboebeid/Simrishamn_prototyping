# connect to the database and create schema
```bash
psql -U dbuser -d database -c "CREATE SCHEMA IF NOT EXISTS schema_name;"
exit
```
# dump tables - server
```bash
(sudo) pg_dump -U dbuser -h host -Fc database \
-t raw_data.table1 \
-t raw_data.table2 \
-t raw_data.table3 \
-f selected_tables.dump
```

# restore_tables
```bash
pg_restore -U dbuser -h host \
-d database \
--no-owner \
--no-privileges \
selected_tables.dump
```