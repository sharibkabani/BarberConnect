import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../UserContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Register = () => {
	useEffect(() => {
		document.title = "Register - BarberConnect";
	}, []);

	const navigate = useNavigate();
	const { setUser } = useContext(UserContext);
	const [username, setUsername] = useState("");
	const [first_name, setFirstName] = useState("");
	const [last_name, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [password2, setConfirmPassword] = useState("");
	const [user_type, setUserType] = useState("");
	const [error, setError] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const response = await axios.post(
				"http://localhost:5000/register/register-new-user",
				{
					username,
					first_name,
					last_name,
					email,
					password,
					password2,
					user_type,
				}
			);
			localStorage.setItem("user", JSON.stringify(response.data));
			setUser(response.data);
			if (user_type === "barber") {
				navigate("/barber-form/" + response.data.id);
			} else {
				navigate("/client-dashboard");
			}
		} catch (error) {
			setError(error.response.data.errors);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center h-screen">
			<h2 className="text-2xl font-bold mb-4">Register</h2>
			{error && Array.isArray(error) && (
				<ul className="text-red-500 mb-4" style={{ listStyleType: "disc" }}>
					{error.map((errorMessage, index) => (
						<li key={index}>{errorMessage.message}</li>
					))}
				</ul>
			)}
			<form
				onSubmit={handleSubmit}
				className="flex flex-col items-center text-center"
			>
				<div className="mb-4">
					<label className="mr-2">User Type:</label>
					<select
						value={user_type}
						onChange={(e) => setUserType(e.target.value)}
						className="border border-gray-300 px-2 py-1 rounded"
					>
						<option value="" disabled>
							Select User Type
						</option>
						<option value="client">Client</option>
						<option value="barber">Barber</option>
					</select>
				</div>
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
					<label className="mr-2">First Name:</label>
					<input
						type="text"
						value={first_name}
						onChange={(e) => setFirstName(e.target.value)}
						className="border border-gray-300 px-2 py-1 rounded"
					/>
				</div>
				<div className="mb-4">
					<label className="mr-2">Last Name:</label>
					<input
						type="text"
						value={last_name}
						onChange={(e) => setLastName(e.target.value)}
						className="border border-gray-300 px-2 py-1 rounded"
					/>
				</div>
				<div className="mb-4">
					<label className="mr-2">Email:</label>
					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="border border-gray-300 px-2 py-1 rounded"
					/>
				</div>
				<div className="mb-4 flex items-center">
					<label className="mr-2">Password:</label>
					<div className="relative">
						<input
							type={showPassword ? "text" : "password"}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="border border-gray-300 px-2 py-1 rounded"
						/>
						{showPassword ? (
							<FaEyeSlash
								className="absolute top-1/2 right-2 transform -translate-y-1/2 cursor-pointer"
								onClick={() => setShowPassword(false)}
							/>
						) : (
							<FaEye
								className="absolute top-1/2 right-2 transform -translate-y-1/2 cursor-pointer"
								onClick={() => setShowPassword(true)}
							/>
						)}
					</div>
				</div>
				<div className="mb-4">
					<label className="mr-2">Confirm Password:</label>
					<input
						type="password"
						value={password2}
						onChange={(e) => setConfirmPassword(e.target.value)}
						className="border border-gray-300 px-2 py-1 rounded"
					/>
				</div>
				<div className="mb-4">
					<button
						type="submit"
						className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
					>
						Register
					</button>
				</div>
				<div className="mt-2">
					{" "}
					{/* Add margin-top to create space */}
					<Link
						to="/login"
						className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
					>
						Already have an account? Login
					</Link>
				</div>
			</form>
		</div>
	);
};

export default Register;
