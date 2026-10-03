# 💬 MERN Stack Real-Time Chat Application

A full-stack real-time messaging application built using MongoDB, Express.js, React, Node.js, and Socket.io.

## 🚀 Features
- **User Authentication:** Secure Signup & Login with JWT authentication.
- **Real-time Messaging:** Instant messaging powered by Socket.io.
- **Message History:** Persistent chat history stored in MongoDB.
- **User Directory:** View registered users and initiate conversations.
- **API Documentation:** Fully tested and documented REST APIs via Postman.

## 🛠️ Tech Stack
- **Frontend:** React.js, Vite, Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (MongoDB Atlas)
- **Real-time Communication:** Socket.io
- **API Documentation:** Postman Collection

## 📌 API Endpoints Summary

### Auth Routes
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate existing user

### User & Chat Routes
- `GET /api/users` - Fetch all registered users
- `GET /api/messages/:userId` - Fetch chat history with a specific user
-