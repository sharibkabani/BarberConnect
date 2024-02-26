import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../UserContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import CurrencyInput from "react-currency-input-field";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";

const BarberForm = () => {
	useEffect(() => {
		document.title = "Barber Form - BarberConnect";
	}, []);

	const navigate = useNavigate();
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

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		try {
			console.log({
				pricing,
				instagram_username,
				shop_address,
				days_of_week,
				time_range,
				profile_picture_url,
				id,
			});

			const formData = new FormData();
			formData.append("pricing", pricing);
			formData.append("instagram_username", instagram_username);
			formData.append("shop_address", shop_address);
			formData.append("days_of_week", selectedDays.join(", "));
			formData.append("time_range", time_range);
			formData.append("profile_picture_url", profile_picture_url);
			formData.append("id", id);

			const response = await axios.put(
				"http://localhost:5000/barber/barber-form/" + id,
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
				}
			);

			const user = await axios.get("http://localhost:5000/barber/" + id);

			console.log(user.data[0]);

			localStorage.setItem("user", JSON.stringify(user.data[0]));
			setUser(user.data[0]);
			navigate("/dashboard");
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
					/>
				</div>
				<div className="mb-4">
					<label className="mr-2">Shop Address:</label>
					<GooglePlacesAutocomplete
						apiKey={import.meta.env.VITE_GOOGLE_API_KEY}
						selectProps={{
							value: shop_address,
							onChange: (value) => setShopAddress(value.label),
						}}
					/>
				</div>
				<div className="mb-4">
					<label className="mr-2">Days Available:</label>
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
							className={`border border-gray-300 px-2 py-1 rounded ${
								selectedDays.includes(day) ? "bg-blue-500 text-white" : ""
							}`}
						>
							{day}
						</button>
					))}
				</div>
				<div className="mb-4">
					<label className="mr-2">Hours Available:</label>
					<input
						type="text"
						value={time_range}
						onChange={(e) => setHoursAvailable(e.target.value)}
						className="border border-gray-300 px-2 py-1 rounded"
					/>
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
