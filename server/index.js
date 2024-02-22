const express = require("express");
const app = express();
const cors = require("cors");
const clientRoutes = require("./user_apis/clientRoutes");
const barberRoutes = require("./user_apis/barberRoutes");
const loginAuth = require("./authentication_apis/authenticate-login");
const registerAuth = require("./authentication_apis/authenticate-register");

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/clients", clientRoutes);
app.use("/barbers", barberRoutes);
app.use("/", loginAuth);
app.use("/", registerAuth);

app.get("/", (req, res) => {
	return res.status(200).send("Welcome to the server");
});

app.listen(5000, () => {
	console.log("Server is running on port 5000");
});
