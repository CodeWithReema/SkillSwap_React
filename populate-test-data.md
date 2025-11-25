# How to Populate Test Data

To add test users to your database, you can either:

## Option 1: Run SQL directly in PostgreSQL

1. Connect to your database:
```bash
docker exec -it skillswap-db psql -U postgres -d skillswap
```

2. Copy and paste the contents of `src/main/resources/test-data.sql`

3. Or run it from file:
```bash
docker exec -i skillswap-db psql -U postgres -d skillswap < src/main/resources/test-data.sql
```

## Option 2: Add to schema.sql (for automatic loading)

Add the test data SQL to the end of `src/main/resources/schema.sql` and restart the database.

## Option 3: Use Spring Boot SQL initialization

The test-data.sql file is ready to use. You can add it to your application.properties:

```properties
spring.sql.init.data-locations=classpath:test-data.sql
spring.sql.init.mode=always
```

Note: This will run every time the app starts, so you might want to use Option 1 or 2 instead.

