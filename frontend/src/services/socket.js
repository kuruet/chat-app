import { io } from "socket.io-client";

const URL = "https://chat-app-production-e81b.up.railway.app";

const socket = io(URL, {
  autoConnect: false,
  transports: ["websocket"], // 🔥 FORCE WEBSOCKET
});

export default socket;