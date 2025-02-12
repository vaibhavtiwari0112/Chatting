const express = require("express");
const router = express.Router();

router.get("/:userId/chats", async (req, res) => {
  try {
    const { userId } = req.params;

    const chats = await Chat.find({ participants: userId }).populate(
      "participants"
    );

    const chatContacts = chats.map((chat) => {
      const contact = chat.participants.find((p) => p !== userId);
      return { id: contact._id, name: contact.name };
    });

    res.json(chatContacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
