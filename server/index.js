const express = require("express");
const app = express();
const cors = require("cors");
const clientRoutes = require("./user_apis/clientRoutes");
const barberRoutes = require("./user_apis/barberRoutes");
const loginAuth = require("./authentication_apis/authenticate-login");
const registerAuth = require("./authentication_apis/authenticate-register");
const appointmentRoutes = require("./appointment_apis/appointments");

// Middleware
app.use(cors({}));
app.use(express.json());

// Routes
app.use("/client", clientRoutes);
app.use("/barber", barberRoutes);
app.use("/login", loginAuth);
app.use("/register", registerAuth);
app.use("/appointments", appointmentRoutes);

app.get("/", (req, res) => {
	return res.status(200).send("Welcome to the server");
});

app.listen(5000, () => {
	console.log("Server is running on port 5000");
});
