import { useEffect } from "react";
import socket from "../services/socket";

const Chat = () => {
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return;

    // decode token to get userId
    const payload = JSON.parse(atob(token.split(".")[1]));
    const userId = payload.userId;

    // connect socket
    socket.connect();

    // register user
    socket.emit("register", userId);

    console.log("Socket connected & user registered:", userId);

    // cleanup
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="h-screen flex items-center justify-center">
      <h1 className="text-2xl font-bold">Chat Page (Socket Connected)</h1>
    </div>
  );
};

export default Chat;