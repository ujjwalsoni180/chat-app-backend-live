const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const Message = require('./models/Message');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

app.get('/', (req, res) => {
  res.send('API is running successfully');
});

// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Socket.io Real-time Logic
io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // User Room Join Event
  socket.on('join_room', (userId) => {
    socket.join(userId);
    console.log(`User with ID: ${userId} joined room`);
  });

  // Send & Receive Message Event
  socket.on('send_message', async (data) => {
    const { sender, receiver, content } = data;

    try {
      // 1. Save message in MongoDB Database
      const newMessage = await Message.create({
        sender,
        receiver,
        content,
      });

      // 2. Send message in real-time to Receiver
      io.to(receiver).emit('receive_message', newMessage);
      
      // 3. Send back confirmation to Sender
      io.to(sender).emit('receive_message', newMessage);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User Disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

// Listen on HTTP server (not app.listen)
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});