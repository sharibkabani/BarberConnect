import React, { useEffect } from "react";
import { Link } from "react-router-dom";


const Welcome = () => {
	useEffect(() => {
		document.title = "Welcome - BarberConnect";
	}, []);

	return (
		<div className="flex flex-col items-center justify-center h-screen">
			<h1 className="text-4xl font-bold mb-8">Home</h1>
			<div className="mb-4">
				<Link
					to="/login"
					className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
				>
					Login
				</Link>
			</div>
			<div>
				<Link
					to="/register"
					className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
				>
					Register
				</Link>
			</div>
		</div>
	);
};

export default Welcome;
