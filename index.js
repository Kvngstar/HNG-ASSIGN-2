const express = require("express");
const ipAddress = require("request-ip");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/api/hello", async (req, res) => {
	try {
		let ip = ipAddress.getClientIp(req);
		console.log(ip);
		if (!req.query.visitor_name) {
			res.status(400).send({ message: "visitor_name query param is required" });
			return;
		}
		console.log(req.headers["x-forwarded-for"],"forwarded");

		if (ip.startsWith("::ffff:")) {
			ip = ip.split("::ffff:")[1];
		}
		console.log(ip);
		// get location
		const response = await axios.get(
			`https://ipgeolocation.abstractapi.com/v1/?api_key=67cc41c2e55b46b0a7b8936cf2cfe824&ip_address=${ip}`
		);
		console.log(response.data);

		res.status(200).send("Dont play");
	} catch (error) {
		console.log(error);
	}
});
app.listen(PORT, () => {
	console.log(`Listening to PORT ${PORT}`);
});
