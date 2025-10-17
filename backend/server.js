const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://link-in-bio-bit-seven.vercel.app',
    /\.vercel\.app$/ // Allow all Vercel preview URLs
  ],
  credentials: true
}));
app.use(express.json());

// Supabase Connection (initialized in db.js)
const supabase = require('./db');
console.log('✅ Supabase client initialized');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/tips', require('./routes/tips'));
app.use('/api/analytics', require('./routes/analytics'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
