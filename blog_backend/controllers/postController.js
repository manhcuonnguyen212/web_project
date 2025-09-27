const pool = require("../db");

exports.getPosts = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM posts ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM posts WHERE post_id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Post not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { title, content, category_id, author_id } = req.body;
    await pool.query("INSERT INTO posts (title, content, category_id, author_id) VALUES (?, ?, ?, ?)", 
      [title, content, category_id, author_id]);
    res.json({ message: "Post created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { title, content, category_id, status } = req.body;
    await pool.query("UPDATE posts SET title=?, content=?, category_id=?, status=? WHERE post_id=?", 
      [title, content, category_id, status, req.params.id]);
    res.json({ message: "Post updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    await pool.query("DELETE FROM posts WHERE post_id = ?", [req.params.id]);
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
