const Message = require('../models/Message');

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ team: req.params.teamId })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  const { text } = req.body;
  try {
    const message = await Message.create({
      sender: req.user._id,
      team: req.params.teamId,
      text
    });
    
    const populatedMessage = await Message.findById(message._id).populate('sender', 'name email');
    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
