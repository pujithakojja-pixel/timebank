require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const { initializeSocket } = require('./socket/socketManager');
const notificationService = require('./services/notificationService');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Initialize socket
initializeSocket(io);
notificationService.setIO(io);

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: false }));

// CORS - accept both 5173 and 5174 (Vite fallback port)
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(null, true); // allow all origins in dev
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting - relaxed for development
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 500,                  // 500 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please slow down.' }
});
app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Root redirect — sends browser users to the frontend app
app.get('/', (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8"/>
      <title>TimeBank API</title>
      <meta http-equiv="refresh" content="2;url=${frontendUrl}" />
      <style>
        body { font-family: Nunito, sans-serif; background: #FFF8F0; display: flex;
               align-items: center; justify-content: center; height: 100vh; margin: 0; flex-direction: column; gap: 16px; }
        h1   { background: linear-gradient(135deg,#FF6B2B,#FF4FA3);
               -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 2.5rem; }
        p    { color: #6B3A00; font-size: 1.1rem; }
        a    { background: linear-gradient(135deg,#FF6B2B,#FF4FA3); color: #fff;
               padding: 12px 28px; border-radius: 50px; text-decoration: none;
               font-weight: 800; box-shadow: 0 4px 16px rgba(255,107,43,0.4); }
      </style>
    </head>
    <body>
      <div style="font-size:3rem">⏱</div>
      <h1>TimeBank API</h1>
      <p>⚡ This is the backend server. Redirecting you to the app...</p>
      <a href="${frontendUrl}">🚀 Open TimeBank App</a>
    </body>
    </html>
  `);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/skills', require('./routes/skills'));
app.use('/api/trades', require('./routes/trades'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/vouches', require('./routes/vouches'));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 TimeBank Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`✅ Socket.io ready\n`);
});

module.exports = { app, server, io };
