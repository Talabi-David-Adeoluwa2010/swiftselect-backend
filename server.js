// server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// Endpoint to initialize a transaction
app.post('/api/paystack/initialize', async (req, res) => {
    // 1. Destructure callback_url from the request body
    const { email, amount, callback_url } = req.body; 

    try {
        const response = await axios.post(
            'https://api.paystack.co/transaction/initialize',
            { 
                email, 
                amount,
                callback_url: callback_url || 'https://swiftselect.onrender.com' // 2. Pass it to Paystack, with a fallback
            },
            { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } }
        );
        // Send back the access_code and reference to the frontend
        res.json(response.data.data);
    } catch (error) {
        console.error('Paystack initialization error:', error.response ? error.response.data : error.message);
        res.status(500).json({ status: false, message: 'Failed to initialize transaction' });
    }
});

// Endpoint to verify a transaction
app.get('/api/paystack/verify/:reference', async (req, res) => {
    const { reference } = req.params;
    try {
        const response = await axios.get(
            `https://api.paystack.co/transaction/verify/${reference}`,
            { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } }
        );
        // Send the verification result back to the frontend
        res.json(response.data);
    } catch (error) {
        console.error('Paystack verification error:', error.response ? error.response.data : error.message);
        res.status(500).json({ status: false, message: 'Failed to verify transaction' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
