require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const { mongoSanitizeMiddleware } = require('./utils/mongoSanitize');

const app = express();

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for development to avoid blocking web requests
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// Basic Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// NoSQL Injection Protection (Custom implementation for Express v5 compatibility)
app.use(mongoSanitizeMiddleware);

// Validate JWT_SECRET on startup
if (!process.env.JWT_SECRET) {
    console.error('❌ FATAL: JWT_SECRET is not defined in .env file!');
    process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
    console.error('❌ FATAL: JWT_SECRET must be at least 32 characters long for security!');
    console.error('💡 Generate a strong secret with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
    process.exit(1);
}

console.log('✅ JWT_SECRET validated');

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/workouts', require('./routes/workouts'));
app.use('/progress', require('./routes/progress'));
app.use('/templates', require('./routes/templates'));
app.use('/schedule', require('./routes/schedule'));
app.use('/user', require('./routes/user'));
app.use('/exercises', require('./routes/exercises'));

app.get('/', (req, res) => {
    res.send('PHYSQ API is running');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
