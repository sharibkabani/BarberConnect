const LocalStrategy = require("passport-local").Strategy;
const pool = require("./db");
const bcrypt = require("bcrypt");

function initialize(passport) {
	const authenticateUser = async (username, password, done) => {
		pool.query(
			"SELECT * FROM clients WHERE username = $1",
			[username],
			(err, results) => {
				if (err) {
					throw err;
				}

				if (results.rows.length > 0) {
					const user = results.rows[0];

					bcrypt.compare(password, user.password, (err, isMatch) => {
						if (err) {
							throw err;
						}
						if (isMatch) {
							return done(null, user);
						} else {
							return done(null, false, {
								message: "Password is incorrect",
							});
						}
					});
				} else {
					pool.query(
						"SELECT * FROM barbers WHERE username = $1",
						[username],
						(err, results) => {
							if (err) {
								throw err;
							}

							if (results.rows.length > 0) {
								const user = results.rows[0];

								bcrypt.compare(password, user.password, (err, isMatch) => {
									if (err) {
										throw err;
									}
									if (isMatch) {
										return done(null, user);
									} else {
										return done(null, false, {
											message: "Password is incorrect",
										});
									}
								});
							} else {
								return done(null, false, {
									message: "Username is not registered",
								});
							}
						}
					);
				}
			}
		);
	};

	passport.use(
		new LocalStrategy(
			{
				usernameField: "username",
				passwordField: "password",
			},
			authenticateUser
		)
	);

	passport.serializeUser((user, done) => done(null, user.id));
	passport.deserializeUser((id, done) => {
		pool.query(`SELECT * FROM clients WHERE id = $1`, [id], (err, results) => {
			if (err) {
				return done(err);
			}

			if (results.rows.length > 0) {
				const user = results.rows[0];
				return done(null, user);
			} else {
				pool.query(
					"SELECT * FROM barbers WHERE id = $1",
					[id],
					(err, results) => {
						if (err) {
							return done(err);
						}
						const user = results.rows[0];
						return done(null, user);
					}
				);
			}
		});
	});
}

module.exports = initialize;
