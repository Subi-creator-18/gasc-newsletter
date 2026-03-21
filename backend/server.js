require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://visionary-muffin-285c95.netlify.app/'] 
    : [
        'http://localhost:3000',
        'http://127.0.0.1:5500',
        'http://127.0.0.1:5501'
      ],
  credentials: true,
}));
/*app.use(cors({
  origin: [
        process.env.FRONTEND_URL,
        'http://127.0.0.1:5500',
        'http://localhost:5500',
        'http://localhost:3000'
    ],
  credentials: true
}));*/
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth',        require('./routes/auth.routes'));
app.use('/api/submissions', require('./routes/submission.routes'));
app.use('/api/review',      require('./routes/review.routes'));
app.use('/api/volumes',     require('./routes/volume.routes'));
app.use('/api/admin',       require('./routes/admin.routes'));

// Health check
app.get('/', (req, res) => res.json({ message: 'GASC Newsletter API Running ✅' }));

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 GASC Newsletter Server running on port ${PORT}`));
