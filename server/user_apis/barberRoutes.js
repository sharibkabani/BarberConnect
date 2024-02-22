const express = require("express");
const router = express.Router();
const pool = require("../db");

// See all barbers
router.get("/", async (req, res) => {
    try {
        const allBarbers = await pool.query("SELECT * FROM barbers");
        res.json(allBarbers.rows);
    } catch (err) {
        console.error(err.message);
    }
});

// Create a barber
router.post("/", async (req, res) => {
    try {
        const { username, password, email, first_name, last_name } = req.body;
        const newBarber = await pool.query(
            "INSERT INTO barbers (username, password, email, first_name, last_name) VALUES($1, $2, $3, $4, $5) RETURNING *",
            [username, password, email, first_name, last_name]
        );
        res.json(newBarber.rows);
    } catch (err) {
        console.error(err.message);
    }
});

// See a barber
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const barber = await pool.query("SELECT * FROM barbers WHERE id = $1", [id]);
        res.json(barber.rows);
    } catch (err) {
        console.error(err.message);
    }
});

// Delete a barber
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deleteBarber = await pool.query("DELETE FROM barbers WHERE id = $1", [id]);
        res.json("Barber was deleted");
    } catch (err) {
        console.error(err.message);
    }
});


module.exports = router;



