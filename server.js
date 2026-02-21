if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User'); // Import User model
const bcrypt = require('bcryptjs'); // Import bcryptjs

const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // Built-in parsing
app.use(express.urlencoded({ extended: true }));
// app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Global Error Handler for JSON parsing errors
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ error: 'Invalid JSON body' });
    }
    next();
});

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/qb_system';
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log('MongoDB Connected');
    await seedAdmin(); // Seed admin on startup
})
    .catch(err => console.log(err));

// Seed Admin Function
const seedAdmin = async () => {
    try {
        const adminExists = await User.findOne({ role: 'admin' });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('bitqb', 10);
            const admin = new User({
                name: 'Admin',
                username: 'adminbitqbs',
                email: 'admin@bitqb.com',
                password: hashedPassword,
                role: 'admin'
            });
            await admin.save();
            console.log('Default Admin Account Created');
        }
    } catch (err) {
        console.error('Failed to seed admin:', err);
    }
};

// Routes Placeholders
app.use('/api/auth', require('./routes/auth'));
app.use('/api/debug', require('./routes/debug'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/users', require('./routes/users'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/comments', require('./routes/comments'));

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running' });
});

// Catch-all for API 404
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message || 'Something went wrong!' });
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/dist')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
