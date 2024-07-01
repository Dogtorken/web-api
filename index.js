const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());

app.get('/api/hello', async (req, res) => {
    const visitorName = req.query.visitor_name;

    try {
        // Location data using GeoIPify
        const geoResponse = await axios.get(`https://geo.ipify.org/api/v2/country?apiKey=${process.env.GEOIPIFY_API_KEY}&ipAddress`);
        const userIp = geoResponse.data.ip;
        const locationData = geoResponse.data.location;
        let city = geoResponse.data.location.region;
        let cityIndex = city.indexOf(" ");
        if (cityIndex !== -1) {
            city = city.slice(0, cityIndex);
        }

        // Weather data using OpenWeather
        const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`);
        const temperature = weatherResponse.data.main.temp;

        // Dynamic greeting respons
        const greeting = `Hello, ${visitorName}! The temperature is ${temperature} degrees Celsius in ${city}.`;

        res.json({
            client_ip: userIp,
            location: city,
            greeting});

    } catch (error) {
        console.error('Error fetching data', error);
        res.status(500).json({ error: 'An error occurred while fetching data.' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
