const express = require("express");
const ipAddress = require("request-ip");
const axios = require("axios");
const dotenv = require("dotenv");
const app = express();

// for configuring environment variables
dotenv.config({ path: ".env" });

const PORT = process.env.PORT || 3002;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/api/hello", async (req, res) => {
	try {
		// get the IP address using the getClientIp package
		let ip = ipAddress.getClientIp(req);

		// verify if a the required qquery is provided
		if (!req.query.visitor_name) {
			res.status(400).send({ message: "visitor_name query param is required" });
			return;
		}
		// check if its IPV6 or IPV4 and modify to server
		if (ip.startsWith("::ffff:")) {
			ip = ip.split("::ffff:")[1];
		}

		// get location, longitude nnd latitude using ipgeolocation api

		// https://api.ip2location.io/?key=7FC1EAF000B80517A32CDEEFC9A1AECD&ip=
		const response = await axios.get(
			`https://api.ip2location.io/?key=${process.env.API_KEY_IPGEOLOCATION}&ip=${ip}`
		);
		

		// enusre latitude and longitude is available
		if (!response.data.latitude || !response.data.longitude) {
			res.status(401).send({
				message:
					"Error: Unable to get Longitude and Lantitude of your location",
			});
			return;
		}
		//  using ninja weather api, dynamically get visitor's location weather
		const response2 = await axios.get(
			`https://api.api-ninjas.com/v1/weather?lat=${response.data.latitude}&lon=${response.data.longitude}`,
			{
				headers: {
					"X-Api-Key": process.env.API_KEY_NINJAS,
				},
			}
		);

		res.status(200).send({
			client_ip: ip,
			location: response.data.country_name,
			greeting: `Hello, ${req.query.visitor_name}!, the temperature is ${response2.data.temp} degree Celcius in ${response.data.region_name}, wind speeed of ${response2.data.wind_speed} and humidity ${response2.data.humidity}`,
		});
	} catch (error) {
		console.log(error);
		res.status(400).send({ message: "An unknown error occured" });
	}
});
app.listen(PORT, () => {
	console.log(`Listening to PORT ${PORT}`);
});
