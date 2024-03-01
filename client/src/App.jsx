import React from "react";
import { Routes, Route } from "react-router-dom";
import { UserProvider } from "./UserContext";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BarberForm from "./pages/BarberForm";
import ClientDashboard from "./pages/ClientDashboard";
import BarberDashboard from "./pages/BarberDashboard";
import BarberProfile from "./pages/BarberProfile";
import { disableReactDevTools } from "@fvilers/disable-react-devtools";

if (process.env.NODE_ENV === "production") {
	disableReactDevTools();
}

const App = () => {
	return (
		<UserProvider>
			<Routes>
				<Route path="/" element={<Welcome />} />
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />
				<Route path="/barber-form/:id" element={<BarberForm />} />
				<Route path="/client-dashboard" element={<ClientDashboard />} />
				<Route path="/barber-dashboard" element={<BarberDashboard />} />
				<Route path="/barber-profile/:id" element={<BarberProfile />} />
			</Routes>
		</UserProvider>
	);
};

export default App;
