const Pool = require("pg").Pool;
require("dotenv").config();

const pool = new Pool({
	connectionString: process.env.POSTGRES_URL,
});

pool.connect((err, client, release) => {
    if (err) {
        return console.error("Error acquiring client", err.stack);
    }
    console.log("Connected to PostgreSQL");
});

module.exports = pool;
