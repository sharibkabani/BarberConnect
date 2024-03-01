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

		// Fetch the barber's available time range
		const barber = await pool.query(
			"SELECT time_range FROM barbers WHERE id = $1",
			[barber_id]
		);
		const time_range = barber.rows[0].time_range.split(", ");

		// Check if the appointment time is within the barber's available time range
		if (!time_range.includes(time)) {
			return res
				.status(400)
				.json({
					message:
						"The selected time is not within the barber's available time range",
				});
		}

		// Check if the client already has an appointment
		const existingAppointment = await pool.query(
			"SELECT * FROM appointments WHERE client_id = $1",
			[client_id]
		);

		// Check if the time and date are already booked
		const bookedAppointment = await pool.query(
			"SELECT * FROM appointments WHERE date = $1 AND time = $2",
			[date, time]
		);

		if (existingAppointment.rows.length > 0) {
			res
				.status(400)
				.json({ message: "Client already has an appointment booked" });
		} else if (bookedAppointment.rows.length > 0) {
			res
				.status(400)
				.json({ message: "The selected time and date are already booked" });
		} else {
			const newAppointment = await pool.query(
				"INSERT INTO appointments (client_id, barber_id, date, time) VALUES($1, $2, $3, $4) RETURNING *",
				[client_id, barber_id, date, time]
			);
			res.json(newAppointment.rows);
		}
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ message: "Appointment could not be created" });
	}
});

// See client's appointments
router.get("/client/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const findAppointments = await pool.query(
			"SELECT * FROM appointments WHERE client_id = $1",
			[id]
		);
		res.json(findAppointments.rows);
	} catch (err) {
		console.error(err.message);
	}
});

// See barber's appointments
router.get("/barber/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const findAppointments = await pool.query(
			"SELECT * FROM appointments WHERE barber_id = $1",
			[id]
		);
		res.json(findAppointments.rows);
	} catch (err) {
		console.error(err.message);
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
