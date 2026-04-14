import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import http from "http";
import { Server } from "socket.io";
import initSocket from "./sockets/socket.js";

dotenv.config();

// connect DB
connectDB();

// create HTTP server
const server = http.createServer(app);

// setup socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // later restrict to frontend domain
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"], // ✅ important
  allowEIO3: true, // ✅ compatibility
});

// debug connection (VERY IMPORTANT)
io.on("connection", (socket) => {
  console.log("🔥 New socket connected:", socket.id);
});

// initialize your socket logic
initSocket(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});