const express = require("express");
const router = express.Router();
const pool = require("../db");

const NodeGeocoder = require("node-geocoder");

const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");

require("dotenv").config();

// Google Maps API Geocoder
const options = {
	provider: "google",
	apiKey: process.env.GOOGLE_MAPS_API_KEY,
};

const geocoder = NodeGeocoder(options);

// Amazon S3
const s3Client = new S3Client({
	region: process.env.AWS_REGION,
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	},
});

const upload = multer({
	storage: multerS3({
		s3: s3Client,
		bucket: process.env.AWS_BUCKET_NAME,
		metadata: function (req, file, cb) {
			cb(null, { fieldName: file.fieldname });
		},
		key: function (req, file, cb) {
			const date = new Date();
			const formattedDate = `${date.getFullYear()}-${
				date.getMonth() + 1
			}-${date.getDate()}_${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
			cb(null, formattedDate);
		},
	}),
});

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
		const findBarber = await pool.query("SELECT * FROM barbers WHERE id = $1", [
			id,
		]);

		// Add user_type to each barber
		const barber = findBarber.rows.map((row) => ({
			...row,
			user_type: "barber",
		}));

		res.json(barber);
	} catch (err) {
		console.error(err.message);
	}
});

// Delete a barber
router.delete("/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const deleteAppointments = await pool.query(
			"DELETE FROM appointments WHERE barber_id = $1",
			[id]
		);
		const deleteBarber = await pool.query("DELETE FROM barbers WHERE id = $1", [
			id,
		]);
		res.json("Barber was deleted");
	} catch (err) {
		console.error(err.message);
	}
});

// Add additional barber info here
router.put(
	"/barber-form/:id",
	upload.single("profile_picture_url"),
	async (req, res) => {
		try {
			const { id } = req.params;
			const {
				pricing,
				instagram_username,
				shop_address,
				days_of_week,
				time_range,
			} = req.body;

			if (!req.file) {
				return res
					.status(400)
					.json({ message: "Please upload a profile picture" });
			}

			if (
				!pricing ||
				!instagram_username ||
				!shop_address ||
				!days_of_week ||
				!time_range
			) {
				return res.status(400).json({ message: "Please fill out all fields" });
			}

			const profile_picture_url = req.file.location;

			const geoData = await geocoder.geocode(shop_address);
			const latitude = geoData[0].latitude;
			const longitude = geoData[0].longitude;

			const updateBarber = await pool.query(
				"UPDATE barbers SET pricing = $1, instagram_username = $2, shop_address = $3, shop_address_latitude = $4, shop_address_longitude = $5, days_of_week = $6, time_range = $7, profile_picture_url = $8 WHERE id = $9",
				[
					pricing,
					instagram_username,
					shop_address,
					latitude,
					longitude,
					days_of_week,
					time_range,
					profile_picture_url,
					id,
				]
			);

			if (updateBarber.rowCount === 0) {
				return res.status(400).json({ message: "Barber not found" });
			}

			res.json("Barber info was updated");
		} catch (err) {
			console.error(err.message);
		}
	}
);

module.exports = router;
