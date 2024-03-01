const express = require("express");
const router = express.Router();
const pool = require("../db");
const axios = require("axios");

function haversineDistance(lat1, lon1, lat2, lon2) {
	const R = 6371; // Radius of the earth in km
	const dLat = deg2rad(lat2 - lat1);
	const dLon = deg2rad(lon2 - lon1);
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(deg2rad(lat1)) *
			Math.cos(deg2rad(lat2)) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c; // Distance in km
}

function deg2rad(deg) {
	return deg * (Math.PI / 180);
}

// See all users
router.get("/", async (req, res) => {
	try {
		const allUsers = await pool.query("SELECT * FROM clients");
		res.json(allUsers.rows);
	} catch (err) {
		console.error(err.message);
	}
});

// See a user
router.get("/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const findClient = await pool.query("SELECT * FROM clients WHERE id = $1", [
			id,
		]);

		// Add user_type to each client
		const client = findClient.rows.map((row) => ({
			...row,
			user_type: "client",
		}));

		res.json(client);
	} catch (err) {
		console.error(err.message);
	}
});

// Create a user
router.post("/", async (req, res) => {
	try {
		const { username, first_name, last_name, email, password } = req.body;
		const newUser = await pool.query(
			"INSERT INTO clients (username, first_name, last_name, email, password) VALUES($1, $2, $3, $4, $5) RETURNING *",
			[username, first_name, last_name, email, password]
		);
		res.json(newUser.rows);
	} catch (err) {
		console.error(err.message);
	}
});

// Delete a user
router.delete("/:id", async (req, res) => {
	// TODO: Delete any appointments associated with the client
	try {
		const { id } = req.params;
		const deleteUser = await pool.query("DELETE FROM clients WHERE id = $1", [
			id,
		]);
		const deleteAppointments = await pool.query(
			"DELETE FROM appointments WHERE client_id = $1",
			[id]
		);
		res.json("User was deleted");
	} catch (err) {
		console.error(err.message);
	}
});

// Edit a user
router.put("/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const { username, first_name, last_name, email } = req.body;
		const editUser = await pool.query(
			"UPDATE clients SET username = $1, first_name = $2, last_name = $3, email = $4 WHERE id = $5",
			[username, first_name, last_name, email, id]
		);
		res.json("User #${id} was updated");
	} catch (err) {
		console.error(err.message);
	}
});

router.post("/getDistance", async (req, res) => {
	const {
		userLongitude,
		userLatitude,
		shop_address_longitude,
		shop_address_latitude,
	} = req.body;

	const response = await axios.get(
		`https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${userLatitude},${userLongitude}&destinations=${shop_address_latitude},${shop_address_longitude}&key=` +
			process.env.GOOGLE_MAPS_API_KEY
	);

	const distance = response.data.rows[0].elements[0].distance.text;

	res.json({ distance });
});

module.exports = router;
