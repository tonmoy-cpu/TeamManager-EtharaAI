const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/teams', require('./routes/teamRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Serve frontend in production
// Root route for Railway health check
app.get('/', (req, res) => {
  res.send('Backend API is running successfully');
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Initialize Socket.io
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

app.set('io', io); // Make it available in routes/controllers

// Track connected users
const userSockets = new Map();

io.on('connection', (socket) => {
  socket.on('setup', (userId) => {
    userSockets.set(userId, socket.id);
    socket.join(userId);
  });

  socket.on('join_team', (teamId) => {
    socket.join(teamId);
  });
  
  socket.on('join_project', (projectId) => {
    socket.join(projectId);
  });

  socket.on('disconnect', () => {
    for (const [key, value] of userSockets.entries()) {
      if (value === socket.id) {
        userSockets.delete(key);
        break;
      }
    }
  });
});
