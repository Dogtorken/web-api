const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.set('trust proxy', true);
const port = process.env.PORT || 7000;

app.use(express.json());

app.get('/api/hello/', async (req, res) => {
    const visitorName = req.query.visitor_name;

    try {
        // User's public IP address 
        //const ipResponse = await axios.get('https://api.ipify.org?format=json');
        //const clientIp = ipResponse.data.ip;
        const clientIp =
        req.headers["cf-connecting-ip"] ||
        req.headers["x-real-ip"] ||
        req.headers["x-forwarded-for"] ||
        req.socket.remoteAddress ||
        "";

        // Location data using GeoIPify
        const geoResponse = await axios.get(`https://geo.ipify.org/api/v2/country,city?apiKey=${process.env.GEOIPIFY_API_KEY}&ipAddress=${clientIp}`);
        const locationData = geoResponse.data.location;
        let city = locationData.region;
        let cityIndex = city.indexOf(" ");
        if (cityIndex !== -1) {
            city = city.slice(0, cityIndex);
        }

        // Weather data using OpenWeather
        const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`);
        const temperature = weatherResponse.data.main.temp;

        // Dynamic greeting response
        const greeting = `Hello, ${visitorName}! The temperature is ${temperature} degrees Celsius in ${city}.`;

        res.json({
            client_ip: clientIp,
            location: city,
            greeting
        });

    } catch (error) {
        console.error('Error fetching data', error);
        res.status(500).json({ error: 'An error occurred while fetching data.' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;
