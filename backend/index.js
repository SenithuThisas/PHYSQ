require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/workouts', require('./routes/workouts'));
app.use('/progress', require('./routes/progress'));
app.use('/templates', require('./routes/templates'));
app.use('/user', require('./routes/user'));

app.get('/', (req, res) => {
    res.send('PHYSQ API is running');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
