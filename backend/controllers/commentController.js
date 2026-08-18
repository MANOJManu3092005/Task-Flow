const Comment = require('../models/Comment');

exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ task: req.params.id })
      .populate('user', 'name email')
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching comments.' });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required.' });
    }

    const comment = await Comment.create({
      task: req.params.id,
      user: req.user.id,
      text: text.trim()
    });

    const populated = await comment.populate('user', 'name email');

    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while adding the comment.' });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found.' });

    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own comments.' });
    }

    await comment.deleteOne();
    res.json({ message: 'Comment deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while deleting the comment.' });
  }
};
