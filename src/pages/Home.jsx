import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPosts } from "../services/api";

export default function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    getPosts().then(res => setPosts(res.data));
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Blog Posts</h1>
      <div className="space-y-4">
        {posts.map(p => (
          <Link key={p.id} to={`/post/${p.id}`} className="block border rounded p-4 bg-white hover:shadow">
            <h2 className="text-lg font-semibold">{p.title}</h2>
            <p className="mt-2 line-clamp-2">{p.content}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
