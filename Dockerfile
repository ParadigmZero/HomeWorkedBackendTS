FROM postgres:16.1 as db
WORKDIR /app
COPY ./db/init.sh /docker-entrypoint-initdb.d
COPY ./db/dump.sql ./scripts/db/dump.sql