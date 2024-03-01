import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";
import axios from "axios";

const BarberDashboard = () => {
	const [loading, setLoading] = useState(true);
	const { user, logout } = useContext(UserContext);
	const navigate = useNavigate();

	useEffect(() => {
		if (user && user.user_type === "client") {
			navigate("/client-dashboard");
		}
	}, [user, navigate]);

	if (!user) {
		navigate("/login");
	}

	const [appointments, setAppointments] = useState([]);
	const [error, setError] = useState("");

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	const checkAppointments = async () => {
		try {
			const response = await axios.get(
				"https://barberconnectbackend.onrender.com/appointments/barber/" +
					user.id
			);

			const clientPromises = response.data.map((appointment) =>
				axios.get(
					"https://barberconnectbackend.onrender.com/client/" +
						appointment.client_id
				)
			);
			const clients = await Promise.all(clientPromises);

			const appointmentsWithClientData = response.data.map(
				(appointment, index) => ({
					...appointment,
					client: clients[index].data,
				})
			);

			setAppointments(appointmentsWithClientData);
		} catch (error) {
			setError(error.response.data.message);
		}
	};

	const cancelAppointment = async (appointmentId) => {
		try {
			const response = await axios.delete(
				"https://barberconnectbackend.onrender.com/appointments/" +
					appointmentId
			);
			setAppointments(
				appointments.filter((appointment) => appointment.id !== appointmentId)
			);
			checkAppointments();
		} catch (error) {
			setError(error.response.data.message);
		}
	};

	const capitalizeFirstLetter = (name) => {
		return name.charAt(0).toUpperCase() + name.slice(1);
	};

	useEffect(() => {
		document.title = "Barber Dashboard - BarberConnect";
		checkAppointments().then(() => setLoading(false));
	}, []);

	if (loading) {
		return (
			<div className="fixed inset-0 flex items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
			</div>
		);
	}

	return (
		<div className="flex justify-center items-center h-screen">
			{appointments.length === 0 ? (
				<div>
					<p className="text-2xl font-bold">No appointments yet!</p>
					<div className="flex justify-center">
						<Link
							className="inline-block mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-center"
							onClick={handleLogout}
						>
							Logout
						</Link>
					</div>
				</div>
			) : (
				<div>
					<h2 className="text-2xl font-bold mb-4 text-center">Appointments</h2>
					{appointments.map((appointment) => {
						const appointmentDateTime = new Date(appointment.date);
						const [hours, minutes, seconds] = appointment.time
							.split(":")
							.map(Number);
						appointmentDateTime.setHours(hours, minutes, seconds);
						const formattedDate = appointmentDateTime.toLocaleDateString(
							undefined,
							{
								weekday: "short",
								year: "numeric",
								month: "long",
								day: "numeric",
							}
						);
						const formattedTime = appointmentDateTime.toLocaleTimeString(
							undefined,
							{
								hour: "2-digit",
								minute: "2-digit",
								hour12: true,
							}
						);

						return (
							<div
								key={appointment.id}
								className="mb-4 flex justify-between items-center"
							>
								<div>
									{appointment.client.map((client) => (
										<p key={client.id} className="text-lg font-semibold">
											Client: {capitalizeFirstLetter(client.first_name)}{" "}
											{capitalizeFirstLetter(client.last_name)}
										</p>
									))}
									<p className="text-lg font-semibold">Time: {formattedTime}</p>
									<p className="text-lg font-semibold">Date: {formattedDate}</p>
								</div>
								<div className="ml-10">
									{" "}
									{/* Add this container */}
									<button
										className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
										onClick={() => cancelAppointment(appointment.id)}
									>
										Cancel
									</button>
								</div>
							</div>
						);
					})}

					<div className="flex justify-center">
						<Link
							className="inline-block  px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-center"
							onClick={handleLogout}
						>
							Logout
						</Link>
					</div>
				</div>
			)}
		</div>
	);
};

export default BarberDashboard;
