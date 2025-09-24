import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPost, addComment } from "../services/api";

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [text, setText] = useState("");

  useEffect(() => {
    getPost(id).then(res => setPost(res.data));
  }, [id]);

  function handleComment() {
    if (!text.trim()) return;
    addComment(id, { userId: 1, text }).then(() => {
      setText("");
      getPost(id).then(res => setPost(res.data));
    });
  }

  if (!post) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
      <div className="mb-6">{post.content}</div>

      <h2 className="text-lg font-semibold mb-2">Comments</h2>
      <div className="space-y-2 mb-4">
        {post.comments?.map(c => (
          <div key={c.id} className="border rounded p-2 bg-gray-50">
            <p className="text-sm">{c.text}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input value={text} onChange={e=>setText(e.target.value)} placeholder="Write a comment..." className="border p-2 flex-1 rounded" />
        <button onClick={handleComment} className="bg-blue-500 text-white px-3 py-1 rounded">Post</button>
      </div>
    </div>
  );
}
