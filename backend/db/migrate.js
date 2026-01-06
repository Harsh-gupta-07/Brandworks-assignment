const fs = require('fs');
const path = require('path');
const postgres = require('postgres');
const dotenv = require('dotenv');
dotenv.config();
const connectionString = process.env.DATABASE_URL;

async function migrate() {
    const psql = postgres(connectionString);

    try {
        console.log('Starting database migration...\n');

        // Drop all existing tables and types
        console.log('Dropping existing tables and types...');
        await psql.unsafe(`
            DROP TABLE IF EXISTS parked_cars CASCADE;
            DROP TABLE IF EXISTS drivers CASCADE;
            DROP TABLE IF EXISTS managers CASCADE;
            DROP TABLE IF EXISTS cars CASCADE;
            DROP TABLE IF EXISTS parking_spots CASCADE;
            DROP TABLE IF EXISTS users CASCADE;
            DROP TYPE IF EXISTS parking_status CASCADE;
            DROP TYPE IF EXISTS role CASCADE;
            DROP TABLE IF EXISTS payments CASCADE;
            DROP TYPE IF EXISTS payment_status CASCADE;
            DROP TYPE IF EXISTS payment_method CASCADE;
            DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
        `);
        console.log('Dropped all existing tables and types.\n');

        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf-8');

        await psql.unsafe(schema);

        console.log('Database migration completed successfully!');
        console.log('Created tables: users, parking_spots, cars, managers, drivers, parked_cars');

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await psql.end();
        process.exit(0);
    }
}

migrate();
