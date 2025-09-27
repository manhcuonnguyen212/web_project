const express = require("express");
const cors = require('cors');
const app = express();
const PORT = 5000;

// Cho phép frontend gọi API
app.use(cors({
    origin: "http://localhost:5173", // frontend đang chạy ở đây
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

// Middleware
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// Import routes
app.use("/auth", require("./routes/auth"));
app.use("/users", require("./routes/users"));
app.use("/posts", require("./routes/posts"));
app.use("/categories", require("./routes/categories"));
app.use("/comments", require("./routes/comments"));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
