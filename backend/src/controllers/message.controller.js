import Message from "../models/Message.js";
import mongoose from "mongoose";

// @desc    Get messages with pagination
// @route   GET /api/messages/:userId
export const getMessages = async (req, res) => {
  try {
    const currentUserId = new mongoose.Types.ObjectId(req.user._id);
    const otherUserId = new mongoose.Types.ObjectId(req.params.userId);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const skip = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId },
      ],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      page,
      limit,
      count: messages.length,
      messages,
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};