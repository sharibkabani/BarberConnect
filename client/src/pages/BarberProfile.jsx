import React, { useState, useEffect, useContext } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { UserContext } from "../UserContext";

const BarberProfile = () => {
	const { id } = useParams();
	const navigate = useNavigate();

	const { user } = useContext(UserContext);

	useEffect(() => {
		if (user && user.user_type === "barber") {
			navigate("/client-dashboard");
		}
	}, [user, navigate]);

	if (!user) {
		navigate("/login");
	}

	const [availability, setAvailability] = useState({ days: [], hours: [] });
	const [appointments, setAppointments] = useState([]);
	const [selectedDay, setSelectedDay] = useState(null);
	const [selectedTime, setSelectedTime] = useState(null);
	const [bookedAppointments, setBookedAppointments] = useState({});
	const [barber, setBarber] = useState(null);
	const [activeTimeButton, setActiveTimeButton] = useState(null);

	useEffect(() => {
		document.title = "Barber Profile - BarberConnect";
		fetchAvailability();
		fetchAppointments();
		getBarber();
	}, []);

	const getBarber = () => {
		axios
			.get("https://technotes-api.onrender.com/barber/" + id)
			.then((response) => {
				setBarber(response.data[0]);
			})
			.catch((error) => {
				console.log(error);
			});
	};

	const fetchAvailability = async () => {
		let response = await axios.get(`https://technotes-api.onrender.com/barber/${id}`);
		const barber = response.data[0];
		if (barber.days_of_week && barber.time_range) {
			const days_of_week = barber.days_of_week.split(", ").map((day) => {
				switch (day) {
					case "Sunday":
						return 0;
					case "Monday":
						return 1;
					case "Tuesday":
						return 2;
					case "Wednesday":
						return 3;
					case "Thursday":
						return 4;
					case "Friday":
						return 5;
					case "Saturday":
						return 6;
					default:
						return -1;
				}
			});
			const hours_of_day = barber.time_range.split(", ");
			setAvailability({ days: days_of_week, hours: hours_of_day });
		}
	};

	const fetchAppointments = async () => {
		const response = await axios.get(
			"https://technotes-api.onrender.com/appointments/barber/" + id
		);
		const appointmentsData = response.data;
		setAppointments(appointmentsData);

		const bookedAppointments = {};
		appointmentsData.forEach((appointment) => {
			const date = new Date(appointment.date);
			const formattedDate = `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1)
				.toString()
				.padStart(2, "0")}-${date.getUTCDate().toString().padStart(2, "0")}`;
			if (!bookedAppointments[formattedDate]) {
				bookedAppointments[formattedDate] = [];
			}
			const time = appointment.time.split(":").slice(0, 2).join(":");
			bookedAppointments[formattedDate].push(time);
		});
		setBookedAppointments(bookedAppointments);
	};

	const isDayAvailable = (date) => {
		const dayOfWeek = date.getDay();
		const formattedDate = `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1)
			.toString()
			.padStart(2, "0")}-${date.getUTCDate().toString().padStart(2, "0")}`;

		// Check if all time slots are booked for this day
		const isFullyBooked =
			bookedAppointments[formattedDate] &&
			bookedAppointments[formattedDate].length >= availability.hours.length;

		return availability.days.includes(dayOfWeek) && !isFullyBooked;
	};

	const isTimeBooked = (time) => {
		const date = new Date(selectedDay).toISOString().split("T")[0];
		const [hours, minutes] = time.split(":");
		const formattedTime = `${hours.padStart(2, "0")}:${minutes}`;

		return (
			bookedAppointments[date] &&
			bookedAppointments[date].includes(formattedTime)
		);
	};

	const convertTo12HrFormat = (time) => {
		let [hour, minute] = time.split(":");
		hour = Number(hour);
		const period = hour >= 12 ? "PM" : "AM";
		hour = hour % 12;
		hour = hour ? hour : 12;
		return `${hour}:${minute} ${period}`;
	};

	const convertTo24HrFormat = (time12h) => {
		const [time, period] = time12h.split(" ");
		let [hours, minutes] = time.split(":");

		if (!period) {
			return time12h;
		}

		if (period.toLowerCase() === "pm") {
			hours = hours === "12" ? "00" : Number(hours) + 12;
		}

		return `${hours}:${minutes}`;
	};

	const bookAppointment = async () => {
		const date = selectedDay.toISOString().split("T")[0];
		const response = await axios.post("https://technotes-api.onrender.com/appointments/", {
			client_id: user.id,
			barber_id: id,
			date,
			time: selectedTime,
		});
		navigate("/client-dashboard");
	};

	return (
		<div className="flex flex-col items-center justify-center h-screen">
			<div
				className="w-full flex justify-between items-start px-4 py-2"
				style={{ position: "fixed", top: 0, right: 0 }}
			>
				<div></div>
				<Link
					to="/client-dashboard"
					className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
				>
					Back to Dashboard
				</Link>
			</div>
			{barber && (
				<div className="flex items-center space-x-4">
					{barber.profile_picture_url && (
						<img
							src={barber.profile_picture_url}
							alt="Barber profile"
							className="w-24 h-24 rounded-full object-cover"
						/>
					)}
					<div>
						<h2 className="text-2xl font-bold">
							{barber.first_name.charAt(0).toUpperCase() +
								barber.first_name.slice(1)}{" "}
							{barber.last_name.charAt(0).toUpperCase() +
								barber.last_name.slice(1)}
						</h2>
						<p className="text-sm text-gray-800">@{barber.username}</p>
						<p className="text-sm text-gray-800">Email: {barber.email}</p>
						<p className="text-sm text-gray-800">
							Instagram:{" "}
							<a
								href={`https://www.instagram.com/${barber.instagram_username}`}
								target="_blank"
								rel="noopener noreferrer"
							>
								@{barber.instagram_username}
							</a>
						</p>
						<p className="text-sm text-gray-800">
							{" "}
							Shop Address:{" "}
							<a
								href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
									barber.shop_address
								)}`}
								target="_blank"
								rel="noopener noreferrer"
							>
								{barber.shop_address}
							</a>
						</p>
						<p className="text-sm text-gray-800">
							Days Available: {barber.days_of_week}
						</p>
						<p className="text-sm text-gray-800">
							Times Available:{" "}
							{barber.time_range
								.split(", ")
								.map(convertTo12HrFormat)
								.join(", ")}
						</p>
					</div>
				</div>
			)}
			<div className="mt-4"></div>
			<div className="flex justify-center items-center">
				<Calendar
					className="mb-4"
					tileDisabled={({ date }) => !isDayAvailable(date)}
					defaultValue={new Date()}
					minDate={new Date()}
					onChange={(date) => setSelectedDay(new Date(date))}
				/>
			</div>
			{selectedDay && (
				<div className="flex justify-center items-center space-x-4">
					{availability.hours.map((hour) => {
						const time24h = convertTo24HrFormat(hour);
						const timeBooked = isTimeBooked(time24h);
						return (
							<button
								key={hour}
								disabled={timeBooked}
								className={`py-2 px-4 rounded ${
									timeBooked
										? "bg-gray-300 cursor-not-allowed"
										: hour === activeTimeButton
										? "bg-blue-900" // This is the style for the active button
										: "bg-blue-500 hover:bg-blue-600 cursor-pointer"
								}`}
								onClick={() => {
									setSelectedTime(hour);
									setActiveTimeButton(hour); // Add this line
								}}
							>
								{convertTo12HrFormat(hour)}
							</button>
						);
					})}
				</div>
			)}
			{selectedTime && (
				<button
					className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
					onClick={bookAppointment}
				>
					Book Appointment
				</button>
			)}
		</div>
	);
};

export default BarberProfile;
