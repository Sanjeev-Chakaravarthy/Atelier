require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const analyticsRoutes = require('./routes/analytics');

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500 });
app.use('/api/', limiter);

// Logging + Parsing
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/analytics', analyticsRoutes);


// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));


// Global DB Logger Helper
global.logToDB = async (type, data) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.collection('vercel_logs').insertOne({
        timestamp: new Date(),
        type,
        data
      });
    } else {
      console.log('DB Logger: Mongoose not connected yet.');
    }
  } catch (e) {
    console.error('Failed to log to DB:', e);
  }
};

// Route to inspect production logs
app.get('/api/vercel-logs', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database not connected' });
    }
    const logs = await mongoose.connection.db.collection('vercel_logs')
      .find({})
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route to clear production logs
app.delete('/api/vercel-logs', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database not connected' });
    }
    await mongoose.connection.db.collection('vercel_logs').deleteMany({});
    res.json({ success: true, message: 'Logs cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (global.logToDB) {
    global.logToDB('EXPRESS_ERROR', {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method
    });
  }
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

// DB Connection
const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexus-task-os';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    if (global.logToDB) {
      global.logToDB('SERVER_STARTUP', { message: 'Server started and MongoDB connected successfully.' });
    }
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
  });

if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

module.exports = app;
