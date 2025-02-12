require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const contactRoutes = require("./src/routes/contactRoutes");

connectDB();
const app = express();
const server = http.createServer(app);

// Setup WebSocket Server
const io = new Server(server, {
  cors: { origin: "*" },
  path: "/socket.io/",
});

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/contacts", contactRoutes);

// WebSocket Chat Routes
const chatRoutes = require("./src/routes/chatRoutes")(io);
app.use("/api/chats", chatRoutes);

io.on("connection", (socket) => {
  console.log(`New WebSocket connection: ${socket.id}`);

  socket.on("joinRoom", ({ senderId, receiverId }) => {
    const room = [senderId, receiverId].sort().join("_");
    socket.join(room);
    console.log(`User ${senderId} joined room: ${room}`);
  });

  socket.on("sendMessage", (message) => {
    console.log("Message received:", message);
    const room = [message.senderId, message.receiverId].sort().join("_");
    io.to(room).emit("newMessage", message);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start the Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
