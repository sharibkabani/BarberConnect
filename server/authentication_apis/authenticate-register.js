const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");

router.post("/register-new-user", async (req, res) => {
	const {
		username,
		first_name,
		last_name,
		email,
		password,
		password2,
		user_type,
	} = req.body;

	let errors = [];

	// Validation checks
	if (
		!username ||
		!first_name ||
		!last_name ||
		!email ||
		!password ||
		!password2
	) {
		errors.push({ message: "Please enter all fields" });
	}
	if (password.length < 6) {
		errors.push({ message: "Password must be at least 6 characters" });
	}
	if (password !== password2) {
		errors.push({ message: "Passwords do not match" });
	}
	if (user_type !== "client" && user_type !== "barber") {
		errors.push({ message: "Select user type" });
	}

	// Check if email is already registered
	const emailCheckQuery =
		user_type === "client"
			? "SELECT * FROM clients WHERE email = $1"
			: "SELECT * FROM barbers WHERE email = $1";
	const emailCheckResult = await pool.query(emailCheckQuery, [email]);
	if (emailCheckResult.rows.length > 0) {
		errors.push({ message: "Email already registered" });
	}

	// Check if username is already registered in clients table
	const usernameCheckQueryClients = "SELECT * FROM clients WHERE username = $1";
	const usernameCheckResultClients = await pool.query(
		usernameCheckQueryClients,
		[username]
	);

	// Check if username is already registered in barbers table
	const usernameCheckQueryBarbers = "SELECT * FROM barbers WHERE username = $1";
	const usernameCheckResultBarbers = await pool.query(
		usernameCheckQueryBarbers,
		[username]
	);

	if (
		usernameCheckResultClients.rows.length > 0 ||
		usernameCheckResultBarbers.rows.length > 0
	) {
		errors.push({ message: "Username already registered" });
	}

	if (errors.length > 0) {
		res.status(400).json({ errors });
	} else {
		// Hash the password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Insert the new user into the appropriate table
		const insertQuery =
			user_type === "client"
				? "INSERT INTO clients (username, first_name, last_name, email, password) VALUES ($1, $2, $3, $4, $5) RETURNING id"
				: "INSERT INTO barbers (username, first_name, last_name, email, password) VALUES ($1, $2, $3, $4, $5) RETURNING id";

		const insertResult = await pool.query(insertQuery, [
			username,
			first_name,
			last_name,
			email,
			hashedPassword,
		]);
		const userId = insertResult.rows[0].id;

		res
			.status(201)
			.json({
				first_name: first_name,
				last_name: last_name,
				user_type: user_type,
				id: userId,
				username: username,
				email: email,
			});
	}
});

module.exports = router;
