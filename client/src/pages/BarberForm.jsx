import React, { useContext, useEffect, useState, useRef } from "react";
import { UserContext } from "../UserContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import CurrencyInput from "react-currency-input-field";

const BarberForm = () => {
	const inputRef = useRef();

	const { user } = useContext(UserContext);
	const navigate = useNavigate();

	useEffect(() => {
		if (user.user_type === "client") {
			navigate("/client-dashboard");
		}
	}, [user, navigate]);

	if (!user) {
		navigate("/login");
	}

	useEffect(() => {
		document.title = "Barber Form - BarberConnect";

		const script = document.createElement("script");
		script.src =
			"http://maps.googleapis.com/maps/api/js?key=" +
			import.meta.env.VITE_GOOGLE_API_KEY +
			"&libraries=places";
		script.async = true;
		document.body.appendChild(script);

		script.addEventListener("load", initAutocomplete);

		return () => {
			document.body.removeChild(script);
		};
	}, []);

	function initAutocomplete() {
		window.autocomplete = new window.google.maps.places.Autocomplete(
			inputRef.current,
			{
				componentRestrictions: { country: "ca" },
				fields: ["place_id", "geometry", "name"],
			}
		);

		window.autocomplete.addListener("place_changed", () => {
			const place = window.autocomplete.getPlace();
			setShopAddress(place.name);
		});
	}

	const { setUser } = useContext(UserContext);

	let id = null;

	try {
		const findID = JSON.parse(localStorage.getItem("user")).id;
		id = findID;
	} catch (error) {
		console.log(error);
		navigate("/login");
	}

	const [pricing, setPricing] = useState("");
	const [instagram_username, setInstagram] = useState("");
	const [shop_address, setShopAddress] = useState("");
	const [days_of_week, setDaysAvailable] = useState([]);
	const [time_range, setHoursAvailable] = useState("");
	const [profile_picture_url, setProfilePicture] = useState(null);
	const [error, setError] = useState("");

	const [isLoading, setIsLoading] = useState(false);

	const [selectedDays, setSelectedDays] = useState([]);
	const handleDayClick = (day) => {
		if (selectedDays.includes(day)) {
			setSelectedDays(
				selectedDays.filter((selectedDay) => selectedDay !== day)
			);
		} else {
			setSelectedDays([...selectedDays, day]);
		}
	};

	const [selectedHours, setSelectedHours] = useState([]);
	const handleHourClick = (hour) => {
		if (selectedHours.includes(hour)) {
			setSelectedHours(
				selectedHours.filter((selectedHour) => selectedHour !== hour)
			);
		} else {
			setSelectedHours([...selectedHours, hour]);
		}
	};

	function convertTo24Hour(time) {
		const [hour, minutePeriod] = time.split(":");
		const [minute, period] = minutePeriod.split(/(AM|PM)/);
		let hourIn24 = parseInt(hour, 10);
		if (period === "PM" && hourIn24 < 12) {
			hourIn24 += 12;
		}
		if (period === "AM" && hourIn24 === 12) {
			hourIn24 = 0;
		}
		return `${hourIn24}:${minute}`;
	}

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		const timeRange24Hour = selectedHours.map(convertTo24Hour).join(", ");
		try {
			const formData = new FormData();
			formData.append("pricing", pricing);
			formData.append("instagram_username", instagram_username);
			formData.append("shop_address", shop_address);
			formData.append("days_of_week", selectedDays.sort().join(", "));
			formData.append(
				"time_range",
				selectedHours.sort().map(convertTo24Hour).join(", ")
			);
			formData.append("profile_picture_url", profile_picture_url);
			formData.append("id", id);

			const response = await axios.put(
				"https://barberconnectbackend.onrender.com/barber/barber-form/" + id,
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
				}
			);

			const user = await axios.get(
				"https://barberconnectbackend.onrender.com/barber/" + id
			);

			localStorage.setItem("user", JSON.stringify(user.data[0]));
			setUser(user.data[0]);
			navigate("/barber-dashboard");
		} catch (error) {
			setError(error.response.data.message);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div
			className={`flex flex-col items-center justify-center h-screen ${
				isLoading ? "loading" : ""
			}`}
			style={{ cursor: isLoading ? "progress" : "auto" }}
		>
			<h2 className="text-2xl font-bold mb-4">Barber Form</h2>
			{error && <p className="text-red-500 mb-4">{error}</p>}
			<form onSubmit={handleSubmit} className="flex flex-col items-center">
				<div className="mb-4">
					<label className="mr-2">Pricing:</label>
					<CurrencyInput
						prefix="$"
						value={pricing}
						placeholder="Enter pricing"
						onValueChange={(value) =>
							setPricing(parseInt(value.replace(/\D/g, "")))
						}
						className="border border-gray-300 px-2 py-1 rounded"
					/>
				</div>
				<div className="mb-4">
					<label className="mr-2">Instagram Username:</label>
					<input
						type="text"
						value={instagram_username}
						onChange={(e) => setInstagram(e.target.value)}
						className="border border-gray-300 px-2 py-1 rounded"
						placeholder="Enter Instagram username"
					/>
				</div>
				<div className="mb-4 flex flex-row items-center">
					<label className="mr-2">Shop Address:</label>
					<input
						ref={inputRef}
						type="text"
						id="shop_address"
						className="border border-gray-300 px-2 py-1 rounded"
						placeholder="Enter shop address"
						onChange={(e) => setShopAddress(e.target.value)}
					/>
				</div>
				<div className="w-1/2 mb-4 flex flex-col items-center">
					<label className="mb-2">Days Available:</label>
					<div className="grid grid-flow-col auto-cols-auto gap-2">
						{[
							"Sunday",
							"Monday",
							"Tuesday",
							"Wednesday",
							"Thursday",
							"Friday",
							"Saturday",
						].map((day) => (
							<button
								key={day}
								type="button"
								onClick={() => handleDayClick(day)}
								className={`border border-gray-300 px-2 py-1 rounded whitespace-nowrap ${
									selectedDays.includes(day) ? "bg-blue-500 text-white" : ""
								}`}
							>
								{day}
							</button>
						))}
					</div>
				</div>
				<div className="w-1/2 mb-4 flex flex-col items-center">
					<label className="mb-2">Hours Available:</label>
					<div className="grid grid-flow-col auto-cols-auto gap-2 overflow-x-auto max-w-xs">
						{Array.from({ length: 24 }, (_, i) => {
							const hour = i === 0 ? 12 : i > 12 ? i - 12 : i;
							const period = i >= 12 ? "PM" : "AM";
							return `${hour}:00${period}`;
						}).map((time) => (
							<button
								key={time}
								type="button"
								onClick={() => handleHourClick(time)}
								className={`border border-gray-300 px-2 py-1 rounded whitespace-nowrap ${
									selectedHours.includes(time) ? "bg-blue-500 text-white" : ""
								}`}
							>
								{time}
							</button>
						))}
					</div>
				</div>
				<div className="mb-4">
					<label className="mr-2">Profile Picture:</label>
					<input
						type="file"
						onChange={(e) => setProfilePicture(e.target.files[0])}
						className="border border-gray-300 px-2 py-1 rounded"
					/>
				</div>
				<button
					type="submit"
					className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
				>
					Submit
				</button>
			</form>
		</div>
	);
};

export default BarberForm;
