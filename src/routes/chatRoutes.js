const express = require("express");
const mongoose = require("mongoose");
const Chat = require("../models/Chat");
const User = require("../models/User"); // Import User model
const router = express.Router();

module.exports = (io) => {
  // Fetch all chats for a user
  router.get("/:userId", async (req, res) => {
    try {
      const { userId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: "Invalid User ID" });
      }

      // Find all chats where the user is a participant
      const chats = await Chat.find({ participants: userId })
        .sort({ "messages.timestamp": -1 }) // Sort by last message timestamp
        .populate("participants", "_id phone name"); // Populate user details

      const formattedChats = chats.map((chat) => {
        const otherParticipant = chat.participants.find(
          (participant) => participant?._id?.toString() !== userId
        );

        return {
          _id: chat._id,
          name: otherParticipant?.name || "Unknown",
          phone: otherParticipant?.phone || "Unknown",
          otherParticipantId: otherParticipant?._id || "Unknown",
          lastMessage: chat.messages.length
            ? chat.messages[chat.messages.length - 1]
            : null,
        };
      });

      res.status(200).json(formattedChats);
    } catch (error) {
      console.error("Error fetching chats:", error);
      res.status(500).json({ error: "Error fetching chats" });
    }
  });

  // Fetch messages in a specific chat
  router.get("/:userId/:contactId", async (req, res) => {
    try {
      const { userId, contactId } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(userId) ||
        !mongoose.Types.ObjectId.isValid(contactId)
      ) {
        return res.status(400).json({ error: "Invalid User IDs" });
      }

      const chat = await Chat.findOne({
        participants: { $all: [userId, contactId] },
      }).populate("messages.sender", "_id name phone"); // Populate sender details

      res.status(200).json(chat ? chat.messages : []);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ error: "Error fetching chat messages" });
    }
  });

  // Send a new message
  router.post("/", async (req, res) => {
    try {
      const { senderId, receiverId, text } = req.body;

      if (
        !mongoose.Types.ObjectId.isValid(senderId) ||
        !mongoose.Types.ObjectId.isValid(receiverId)
      ) {
        return res.status(400).json({ error: "Invalid User IDs" });
      }

      let chat = await Chat.findOne({
        participants: { $all: [senderId, receiverId] },
      });

      if (!chat) {
        chat = new Chat({ participants: [senderId, receiverId], messages: [] });
      }

      const newMessage = {
        sender: senderId,
        text,
        timestamp: new Date(),
      };

      chat.messages.push(newMessage);
      await chat.save();

      // Construct the response object
      const responseMessage = {
        ...newMessage,
        isSentByUser: true, // Mark messages sent by the user
      };

      // Emit message to room
      const roomId = [senderId, receiverId].sort().join("-");
      io.to(roomId).emit("receiveMessage", responseMessage);

      res.status(201).json(responseMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Error sending message" });
    }
  });

  return router;
};
