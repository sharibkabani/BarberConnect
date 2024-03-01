import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { UserContext } from "../UserContext";
import { useNavigate } from "react-router-dom";

const Login = () => {

	useEffect(() => {
		document.title = "Login - BarberConnect";
	}, []);

	const navigate = useNavigate();
    const { setUser } = useContext(UserContext);
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const response = await axios.post(
				"https://barberconnectbackend.onrender.com/login/authenticate-user",
				{
					username,
					password,
				}
			);
			localStorage.setItem("user", JSON.stringify(response.data));
			setUser(response.data);
			navigate("/dashboard");
		} catch (error) {
			setError(error.response.data.message); // Handle login error
		}
	};

	return (
		<div className="flex flex-col items-center justify-center h-screen">
			<h2 className="text-2xl font-bold mb-4">Login</h2>
			{error && <p className="text-red-500 mb-4">{error}</p>}
			<form onSubmit={handleSubmit} className="flex flex-col items-center">
				<div className="mb-4">
					<label className="mr-2">Username:</label>
					<input
						type="text"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						className="border border-gray-300 px-2 py-1 rounded"
					/>
				</div>
				<div className="mb-4">
					<label className="mr-2">Password:</label>
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="border border-gray-300 px-2 py-1 rounded"
					/>
				</div>
				<div>
					<button
						type="submit"
						className="bg-blue-500 text-white px-4 py-2 rounded"
					>
						Login
					</button>
				</div>
				<div>
					<Link
						to="/register"
						className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
					>
						Don't have an account? Register
					</Link>
				</div>
			</form>
		</div>
	);
};

export default Login;
