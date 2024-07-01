const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;

// Middleware to get user's IP address
app.use((req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    req.userIP = ip;
    next();
});

// Route to get user's location
app.get('/location', async (req, res) => {
    try {
        const ip = req.userIP;
        // Use a free IP geolocation API (e.g., ipapi.co)
        const response = await axios.get(`https://ipapi.co/${ip}/json/`);
        const locationData = response.data;

        res.json({
            ip,
            location: locationData,
            });
    } catch (error) {
        res.status(500).send('Error retrieving location data');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
