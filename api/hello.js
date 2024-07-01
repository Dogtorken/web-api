const axios = require('axios');
require('dotenv').config();

const geoIpifyApiKey = process.env.geoIpifyApiKey;
const openWeatherApiKey = process.env.openWeatherApiKey;

module.exports = async (req, res) => {
    const visitorName = req.query.visitor_name || 'Visitor';
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    try {
        console.log(`Fetching geolocation data for IP: ${clientIp}`);
        // Get geolocation data
        const geoResponse = await axios.get(`https://geo.ipify.org/api/v2/country`, {
            params: {
                apiKey: geoIpifyApiKey,
                ipAddress: clientIp
            }
        });

        console.log(`GeoResponse: ${JSON.stringify(geoResponse.data)}`);
        const { city } = geoResponse.data.location;

        console.log(`Fetching weather data for city: ${city}`);
        // Get weather data
        const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
            params: {
                q: city,
                appid: openWeatherApiKey,
                units: 'metric'
            }
        });

        console.log(`WeatherResponse: ${JSON.stringify(weatherResponse.data)}`);
        const temperature = weatherResponse.data.main.temp;

        res.json({
            client_ip: clientIp,
            location: city,
            greeting: `Hello, ${visitorName}!, the temperature is ${temperature} degrees Celsius in ${city}`
        });
    } catch (error) {
        console.error(`Error fetching data: ${error.message}`);
        if (error.response) {
            console.error(`Error response data: ${JSON.stringify(error.response.data)}`);
        }
        res.status(500).json({ error: 'Error fetching data' });
    }
};
