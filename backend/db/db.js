const postgres = require('postgres');

const connectionString = process.env.DATABASE_URL;
const psql = postgres(connectionString);

module.exports = psql;