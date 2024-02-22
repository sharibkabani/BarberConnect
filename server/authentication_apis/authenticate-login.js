const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../db");

const router = express.Router();

// Middleware to authenticate the user
const authenticateUser = async (req, res, next) => {
	console.log(req.body);
	pool.query(
		"SELECT * FROM clients WHERE username = $1",
		[req.body.username],
		(err, results) => {
			if (err) {
				console.log(err);
			}

			if (results.rows.length > 0) {
				const user = results.rows[0];

				bcrypt.compare(req.body.password, user.password, (err, isMatch) => {
					if (err) {
						throw err;
					}
					if (isMatch) {
						return next();
					} else {
						return res.status(401).json({ message: "Password is incorrect" });
					}
				});
			} else {
				pool.query(
					"SELECT * FROM barbers WHERE username = $1",
					[req.body.username],
					(err, results) => {
						if (err) {
							throw err;
						}

						if (results.rows.length > 0) {
							const user = results.rows[0];

							bcrypt.compare(
								req.body.password,
								user.password,
								(err, isMatch) => {
									if (err) {
										throw err;
									}
									if (isMatch) {
										return next();
									} else {
										return res
											.status(401)
											.json({ message: "Password is incorrect" });
									}
								}
							);
						} else {
							return res
								.status(401)
								.json({ message: "Username is not registered" });
						}
					}
				);
			}
		}
	);
};

// Example protected route
router.post("/authenticate-user", authenticateUser, (req, res) => {
	pool.query(
		"SELECT * FROM clients WHERE username = $1",
		[req.body.username],
		(err, results) => {
			if (err) {
				throw err;
			}

			if (results.rows.length > 0) {
				const user = results.rows[0];
				res
					.status(200)
					.json({
						first_name: user.first_name,
						last_name: user.last_name,
						user_type: "client",
						username: user.username,
						email: user.email,
						id: user.id,
					});
			} else {
				pool.query(
					"SELECT * FROM barbers WHERE username = $1",
					[req.body.username],
					(err, results) => {
						if (err) {
							throw err;
						}

						if (results.rows.length > 0) {
							const user = results.rows[0];
							res.status(200).json({
								first_name: user.first_name,
								last_name: user.last_name,
								user_type: "client",
								username: user.username,
								email: user.email,
								id: user.id,
							});
						}
					}
				);
			}
		}
	);
});

module.exports = router;
