import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    axiosClient.get(`/posts/${id}`).then((res) => setPost(res.data));
    axiosClient.get(`/comments/post/${id}`).then((res) => setComments(res.data));
  }, [id]);

  const handleAddComment = async () => {
    await axiosClient.post("/comments", {
      post_id: id,
      user_id: 1, // TODO: lấy từ user đang đăng nhập
      content: newComment,
    });
    setNewComment("");
    const res = await axiosClient.get(`/comments/post/${id}`);
    setComments(res.data);
  };

  if (!post) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>{post.title}</h1>
      <p>{post.content}</p>

      <h3>Bình luận</h3>
      {comments.map((c) => (
        <div key={c.comment_id}>
          <b>User {c.user_id}:</b> {c.content}
        </div>
      ))}

      <textarea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Viết bình luận..."
      />
      <br />
      <button onClick={handleAddComment}>Gửi</button>
    </div>
  );
}
