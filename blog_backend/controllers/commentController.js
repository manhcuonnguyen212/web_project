const pool = require("../db");

exports.getCommentsByPost = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.comment_id, c.content, c.created_at, u.username 
       FROM comments c 
       JOIN users u ON c.user_id = u.user_id 
       WHERE c.post_id=? 
       ORDER BY c.created_at DESC`,
      [req.params.postId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { post_id, user_id, content } = req.body;
    await pool.query("INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)", 
      [post_id, user_id, content]);
    res.json({ message: "Comment added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    await pool.query("DELETE FROM comments WHERE comment_id=?", [req.params.id]);
    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
