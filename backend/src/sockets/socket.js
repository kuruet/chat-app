import Message from "../models/Message.js";
import mongoose from "mongoose";

const onlineUsers = new Map(); // userId -> socketId

const initSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // ✅ register user (FIXED — single active socket per user)
    socket.on("register", (userId) => {
      const existingSocketId = onlineUsers.get(userId);

      // disconnect old socket if exists
      if (existingSocketId && existingSocketId !== socket.id) {
        const existingSocket = io.sockets.sockets.get(existingSocketId);
        if (existingSocket) {
          existingSocket.disconnect(true);
        }
      }

      onlineUsers.set(userId, socket.id);
      socket.userId = userId;

      console.log(`User registered: ${userId}`);
    });

    // SEND MESSAGE
    socket.on("send_message", async (data) => {
      try {
        const { senderId, receiverId, content } = data;

        // validation
        if (!senderId || !receiverId || !content) {
          return socket.emit("error", "Invalid message data");
        }

        // store message
        const message = await Message.create({
          senderId: new mongoose.Types.ObjectId(senderId),
          receiverId: new mongoose.Types.ObjectId(receiverId),
          content,
          status: "sent",
        });

        const receiverSocketId = onlineUsers.get(receiverId);

        // deliver to receiver
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receive_message", message);

          message.status = "delivered";
          await message.save();
        }

        // send back to sender
        socket.emit("message_sent", message);
      } catch (error) {
        console.error("Message error:", error.message);
        socket.emit("error", "Message sending failed");
      }
    });

    // MARK AS SEEN
    socket.on("mark_seen", async ({ senderId }) => {
      try {
        if (!senderId || !socket.userId) return;

        await Message.updateMany(
          {
            senderId: new mongoose.Types.ObjectId(senderId),
            receiverId: new mongoose.Types.ObjectId(socket.userId),
            status: { $ne: "seen" },
          },
          { status: "seen" }
        );

        const senderSocketId = onlineUsers.get(senderId);

        if (senderSocketId) {
          io.to(senderSocketId).emit("messages_seen", {
            by: socket.userId,
          });
        }
      } catch (error) {
        console.error("Seen error:", error.message);
      }
    });

    // disconnect
    socket.on("disconnect", () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        console.log(`User disconnected: ${socket.userId}`);
      }
    });
  });
};

export default initSocket;