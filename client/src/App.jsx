import React from "react";
import { Routes, Route } from "react-router-dom";
import { UserProvider } from "./UserContext";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import BarberForm from "./pages/BarberForm";
<<<<<<< HEAD
import ClientDashboard from "./pages/ClientDashboard";
import BarberDashboard from "./pages/BarberDashboard";
import BarberProfile from "./pages/BarberProfile";
import { disableReactDevTools } from "@fvilers/disable-react-devtools";

if (process.env.NODE_ENV === "production") {
	disableReactDevTools();
}
=======
>>>>>>> parent of 6b56b84 (added appointments and barber profiles)

const App = () => {
	return (
		<UserProvider>
			<Routes>
				<Route path="/" element={<Welcome />} />
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />
				<Route path="/dashboard" element={<Dashboard />} />
				<Route path="/barber-form/:id" element={<BarberForm />} />
			</Routes>
		</UserProvider>
	);
};

export default App;
