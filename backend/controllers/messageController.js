const Message = require('../models/Message');

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    const message = new Message({
      sender: req.user.id,
      receiver: receiverId,
      text
    });
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: userId },
        { sender: userId, receiver: req.user.id }
      ]
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};