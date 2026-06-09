// FORCE NODE.JS TO USE GOOGLE & CLOUDFLARE DNS RESOLVERS (Fixes querySrv ECONNREFUSED)
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path'); // Core Node module for file path manipulation
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Link Auth & Task Routes
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// MongoDB Connection Logic
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI)
    .then(() => console.log('Successfully connected to MongoDB!'))
    .catch((err) => console.error('MongoDB connection error:', err));


// --- SERVE FRONT-END PRODUCTION BUILD STATIC ASSETS ---
// Point Express to your front-end compiled "dist" folder
app.use(express.static(path.join(__dirname, './client/dist')));

// Fixed for Express 5: Changed '*' to '*any' to provide a parameter name
app.get('*any', (req, res) => {
    res.sendFile(path.resolve(__dirname, './client', 'dist', 'index.html'));
});


// Start Server
app.listen(PORT, () => {
    console.log(`Server is operating on port ${PORT}`);
});
