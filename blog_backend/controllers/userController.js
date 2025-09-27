const pool = require("../db");

exports.getUsers = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT user_id, username, email, name, role, created_at FROM users");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT user_id, username, email, name, role, birth_year, address, phone FROM users WHERE user_id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, birth_year, address, phone } = req.body;
    await pool.query("UPDATE users SET name=?, birth_year=?, address=?, phone=? WHERE user_id=?", 
      [name, birth_year, address, phone, req.params.id]);
    res.json({ message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await pool.query("DELETE FROM users WHERE user_id=?", [req.params.id]);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
