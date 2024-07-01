const express = require('express');
const axios = require('axios');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 3000;
const geoIpifyApiKey = process.env.geoIpifyApiKey;
const openWeatherApiKey = process.env.openWeatherApiKey;

app.get('/api/hello', async (req, res) => {
    const visitorName = req.query.visitor_name || 'Visitor';
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    try {
        // Get geolocation data
        const geoResponse = await axios.get(`https://geo.ipify.org/api/v2/country`, {
            params: {
                apiKey: geoIpifyApiKey,
                ipAddress: clientIp
            }
        });
        const { city } = geoResponse.data.location;

        // Get weather data
        const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
            params: {
                q: city,
                appid: openWeatherApiKey,
                units: 'metric'
            }
        });
        const temperature = weatherResponse.data.main.temp;

        res.json({
            client_ip: clientIp,
            location: city,
            greeting: `Hello, ${visitorName}!, the temperature is ${temperature} degrees Celsius in ${city}`
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching data' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
