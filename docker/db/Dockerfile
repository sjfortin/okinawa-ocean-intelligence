FROM postgis/postgis:17-3.5

# TODO(provider verification): verify this package name when updating the Postgres base image.
RUN apt-get update \
    && apt-get install -y --no-install-recommends postgresql-17-pgvector \
    && rm -rf /var/lib/apt/lists/*

