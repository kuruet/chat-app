import { io } from "socket.io-client";

const URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000"
    : "https://chat-app-production-e81b.up.railway.app";

// ✅ SINGLETON SOCKET (IMPORTANT)
const socket = io(URL, {
  autoConnect: false,
  transports: ["websocket"],
  reconnection: false, // 🔥 prevent multiple connections
});

export default socket;