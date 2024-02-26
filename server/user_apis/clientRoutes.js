const express = require("express");
const router = express.Router();
const pool = require("../db");

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
		const findClient = await pool.query("SELECT * FROM clients WHERE id = $1", [id]);

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
	try {
		const { id } = req.params;
		const deleteUser = await pool.query("DELETE FROM clients WHERE id = $1", [
			id,
		]);
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

module.exports = router;
