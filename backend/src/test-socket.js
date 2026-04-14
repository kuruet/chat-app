import { io } from "socket.io-client";

const USER1 = "69de0742a093e76063560e56"; // your current user
const USER2 = "69de1443dbb7c11dcb1f58f9";      // new user

const socket1 = io("http://localhost:5000");
const socket2 = io("http://localhost:5000");

socket1.on("connect", () => {
  console.log("User1 connected");
  socket1.emit("register", USER1);
});

socket2.on("connect", () => {
  console.log("User2 connected");
  socket2.emit("register", USER2);
});

socket2.on("receive_message", (msg) => {
  console.log("User2 received:", msg.content);
});

setTimeout(() => {
  console.log("User1 sending message...");
  socket1.emit("send_message", {
    senderId: USER1,
    receiverId: USER2,
    content: "Hello from user1",
  });
}, 3000);