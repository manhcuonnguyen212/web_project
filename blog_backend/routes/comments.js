const express = require("express");
const router = express.Router();
const { getCommentsByPost, addComment, deleteComment } = require("../controllers/commentController");

router.get("/post/:postId", getCommentsByPost);
router.post("/", addComment);
router.delete("/:id", deleteComment);

module.exports = router;
