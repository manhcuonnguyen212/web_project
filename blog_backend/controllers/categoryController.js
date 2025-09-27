const pool = require("../db");

exports.getCategories = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM categories");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM categories WHERE category_id=?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Category not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    await pool.query("INSERT INTO categories (name, description) VALUES (?, ?)", [name, description]);
    res.json({ message: "Category created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    await pool.query("UPDATE categories SET name=?, description=? WHERE category_id=?", [name, description, req.params.id]);
    res.json({ message: "Category updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    await pool.query("DELETE FROM categories WHERE category_id=?", [req.params.id]);
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
