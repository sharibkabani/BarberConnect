const express = require("express");
const router = express.Router();
const pool = require("../db");

// See all appointments
router.get("/", async (req, res) => {
    try {
        const allAppointments = await pool.query("SELECT * FROM appointments");
        res.json(allAppointments.rows);
    } catch (err) {
        console.error(err.message);
    }
});

// Create an appointment
router.post("/", async (req, res) => {
    try {
        const { client_id, barber_id, date, time } = req.body;
        const newAppointment = await pool.query(
            "INSERT INTO appointments (client_id, barber_id, date, time) VALUES($1, $2, $3, $4) RETURNING *",
            [client_id, barber_id, date, time]
        );
        res.json(newAppointment.rows);
    } catch (err) {
        console.error(err.message);
        res.json({ message: "Appointment could not be created" });
    }
});


// Delete an appointment
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deleteAppointment = await pool.query(
            "DELETE FROM appointments WHERE id = $1",
            [id]
        );
        res.json("Appointment was deleted");
    } catch (err) {
        console.error(err.message);
    }
});


module.exports = router;