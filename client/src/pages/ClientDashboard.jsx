import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";
import axios from "axios";
import { FiInstagram } from "react-icons/fi";
import { FaLocationDot } from "react-icons/fa6";

const ClientDashboard = () => {
	const [loading, setLoading] = useState(true);
	const { user, logout } = useContext(UserContext);
	const navigate = useNavigate();

	useEffect(() => {
		if (user && user.user_type === "barber") {
			navigate("/barber-dashboard");
		}
	}, [user, navigate]);

	if (!user) {
		navigate("/login");
	}

	const [appointments, setAppointments] = useState([]);
	const [barbers, setBarbers] = useState([]);
	const [error, setError] = useState("");
	const [barber, setBarber] = useState(null);
	const [userLongitude, setUserLongitude] = useState(null);
	const [userLatitude, setUserLatitude] = useState(null);
	const [locationBlocked, setLocationBlocked] = useState(false);

	const handleLogout = () => {
		logout();
		navigate("/");
	};

	const capitalizeFirstLetter = (name) => {
		return name.charAt(0).toUpperCase() + name.slice(1);
	};

	const welcomeMsg = () => {
		if (user && user.first_name) {
			return `Let's get fresh, ${capitalizeFirstLetter(user.first_name)}!`;
		}
	};

	const checkAppointment = async () => {
		try {
			const response = await axios.get(
				"http://localhost:5000/appointments/client/" + user.id
			);
			setAppointments(response.data);

			if (response.data.length > 0) {
				const barberResponse = await axios.get(
					"http://localhost:5000/barber/" + response.data[0].barber_id
				);
				setBarber(barberResponse.data[0]);
			}
		} catch (error) {
			setError(error.response.data.message);
		}
	};

	const getBarbers = async () => {
		try {
			const response = await axios.get("http://localhost:5000/barber/");

			// Fetch distances for each barber and add them to the barber objects
			const barbersWithDistances = await Promise.all(
				response.data.map(async (barber) => {
					const distance = await getDistance(barber);
					return { ...barber, distance };
				})
			);

			setBarbers(barbersWithDistances);
		} catch (error) {
			setError(error.response.data.message);
		}
	};

	const cancelAppointment = async (appointmentId) => {
		try {
			const response = await axios.delete(
				"http://localhost:5000/appointments/" + appointmentId
			);

			setAppointments(
				appointments.filter((appointment) => appointment.id !== appointmentId)
			);
			checkAppointment();
		} catch (error) {
			setError(error.response.data.message);
		}
	};

	const getDistance = async (barber) => {
		if (userLongitude === null || userLatitude === null) {
			return null;
		}
		try {
			const response = await axios.post(
				"http://localhost:5000/client/getDistance",
				{
					userLongitude,
					userLatitude,
					shop_address_longitude: barber.shop_address_longitude,
					shop_address_latitude: barber.shop_address_latitude,
				}
			);
			const distance = response.data.distance;
			return distance; // Return the distance
		} catch (error) {
			setError(error.response.data.message);
		}
	};

	useEffect(() => {
		document.title = "Client Dashboard - BarberConnect";
		navigator.geolocation.getCurrentPosition(
			(position) => {
				setUserLongitude(position.coords.longitude);
				setUserLatitude(position.coords.latitude);
				setLoading(false);
			},
			(error) => {
				if (error.code === error.PERMISSION_DENIED) {
					setLocationBlocked(true);
				}
				setLoading(false);
			}
		);
	}, []);

	useEffect(() => {
		getBarbers();
		if (userLongitude && userLatitude) {
			checkAppointment();
		}
	}, [userLongitude, userLatitude]);

	if (loading) {
		return (
			<div className="fixed inset-0 flex items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	return (
		<div className="text-center flex flex-col items-center justify-center h-screen">
			<h1 className="text-2xl font-bold mb-4">{welcomeMsg()}</h1>
			{appointments.length > 0 ? (
				<div>
					<h2 className="text-xl font-bold mb-2">Pending Appointment:</h2>
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
							<div key={appointment.id} className="mb-4">
								<p className="text-lg font-semibold">
									<span>{formattedDate}</span> at{" "}
									<span>
										{formattedTime} with{" "}
										{barber &&
											`${capitalizeFirstLetter(
												barber.first_name
											)} ${capitalizeFirstLetter(barber.last_name)}`}
									</span>
								</p>
								<button
									className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
									onClick={() => cancelAppointment(appointment.id)}
								>
									Cancel Appointment
								</button>
							</div>
						);
					})}
				</div>
			) : (
				<div>
					<h2 className="text-xl font-bold mb-2">Available Barbers</h2>
					{barbers.map((barber) => (
						<div key={barber.id} className="relative">
							<a
								href={`https://www.instagram.com/${barber.instagram_username}`}
								target="_blank"
								rel="noopener noreferrer"
								className="absolute top-2 right-2 -mr-6 -mt-6"
							>
								<FiInstagram size={24} />
							</a>
							<a
								href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
									barber.shop_address
								)}`}
								target="_blank"
								rel="noopener noreferrer"
								className="absolute top-2 left-2 -ml-6 -mt-6"
							>
								<FaLocationDot size={24} />
							</a>
							<Link
								to={`/barber-profile/${barber.id}`}
								className="flex items-center mb-4 border border-gray-300 p-4 rounded"
							>
								<img
									src={barber.profile_picture_url}
									alt={barber.first_name}
									className="w-16 h-16 rounded-full mr-4"
								/>
								<div>
									<p className="text-lg font-semibold">
										{capitalizeFirstLetter(barber.first_name)}{" "}
										{capitalizeFirstLetter(barber.last_name)}
									</p>
									<p>Price: ${barber.pricing}</p>
									{!locationBlocked && <p>Distance: {barber.distance}</p>}
								</div>
							</Link>
						</div>
					))}
				</div>
			)}

			<Link
				to="/"
				onClick={handleLogout}
				className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
			>
				Logout
			</Link>
		</div>
	);
};

export default ClientDashboard;
