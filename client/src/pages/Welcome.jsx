import React, { useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../UserContext";

const Welcome = () => {
	useEffect(() => {
		document.title = "Welcome - BarberConnect";
	}, []);

	const { logout } = useContext(UserContext);

	logout();

	return (
		<div className="flex flex-col items-center justify-center h-screen">
			<h1 className="text-4xl font-bold mb-8">Home</h1>
			<div className="mb-4">
				<Link
					to="/login"
					className="px-4 py-2 font-bold bg-blue-500 text-white rounded-md hover:bg-blue-600"
				>
					Login
				</Link>
			</div>
			<div>
				<Link
					to="/register"
					className="px-4 py-2 font-bold bg-green-500 text-white rounded-md hover:bg-green-600"
				>
					Register
				</Link>
			</div>
		</div>
	);
};

export default Welcome;
