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
        // Get client's public IP address from the request headers
        const clientIp = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
        console.log(`Client IP: ${clientIp}`);

        // Location data using GeoIPify
        const geoResponse = await axios.get(`https://geo.ipify.org/api/v2/country,city?apiKey=${process.env.GEOIPIFY_API_KEY}&ipAddress=${clientIp}`);
        const locationData = geoResponse.data.location;
        console.log(`GeoIPify Response: ${JSON.stringify(locationData)}`);

        let city = locationData.city || locationData.region;

        // If city is still empty, handle fallback or default city
        if (!city) {
            city = 'Lagos'; // Default city if no city data is available
            console.log(`No city found, using default city: ${city}`);
        }

        // Clean up the city name (remove spaces or any other characters)
        city = city.trim(); // Trim whitespace
        console.log(`City: ${city}`);

        // Weather data using OpenWeather
        const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`);
        const temperature = weatherResponse.data.main.temp;
        console.log(`Weather Response: ${JSON.stringify(weatherResponse.data)}`);

        // Dynamic greeting response
        const greeting = `Hello, ${visitorName}! The temperature is ${temperature} degrees Celsius in ${city}.`;

        res.json({
            client_ip: clientIp,
            location: city,
            greeting
        });

    } catch (error) {
        console.error('Error fetching data', error);
        res.status(500).json({ error: 'An error occurred while fetching data.', details: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;
