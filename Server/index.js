require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const accountCodeRoutes = require('./routes/adminUserRoutes');
const aCodeRoutes = require('./routes/aCodeRoutes');
const connectDB = require('./db'); // Add this for separate DB connection
const adminUserRoutes = require('./routes/adminUserRoutes');
const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB via db.js
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminUserRoutes);
app.use('/api/code', aCodeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));