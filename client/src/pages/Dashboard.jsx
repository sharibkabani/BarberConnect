import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";

const Dashboard = () => {
	useEffect(() => {
		document.title = "Dashboard - BarberConnect";
	}, []);

	const { user, logout } = useContext(UserContext);
	const navigate = useNavigate();

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	const capitalizeFirstLetter = (name) => {
		return name.charAt(0).toUpperCase() + name.slice(1);
	};

	console.log(user);

	const welcomeMsg = () => {
		if (user && user.user_type === "client") {
			return `Let's get fresh, ${capitalizeFirstLetter(user.first_name)}!`;
		} else if (user && user.user_type === "barber") {
			return `Who's next, ${capitalizeFirstLetter(user.first_name)}?`;
		}
	};

	return (
		<div className="flex justify-center items-center h-screen">
			<div className="text-center">
				{user && user.first_name ? (
					<>
						<h1 className="text-2xl font-bold mt-8">{welcomeMsg()}</h1>
						<Link
							to="/"
							onClick={handleLogout}
							className="inline-block mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
						>
							Logout
						</Link>
					</>
				) : (
					<>
						<h1 className="text-2xl font-bold mt-8">Welcome, Guest!</h1>
						<Link
							to="/login"
							className="inline-block mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
						>
							Login
						</Link>
						<Link
							to="/register"
							className="inline-block mt-4 ml-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
						>
							Register
						</Link>
					</>
				)}
			</div>
		</div>
	);
};

export default Dashboard;
