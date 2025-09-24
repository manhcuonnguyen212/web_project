import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-white shadow p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link to="/" className="font-bold text-xl">MyBlog</Link>
        <Link to="/" className="text-sm">Home</Link>
        <Link to="/admin" className="text-sm">Admin</Link>
      </div>
      <div className="flex items-center gap-3">
        <Link to="/auth" className="px-3 py-1 rounded bg-blue-500 text-white">Login / Register</Link>
      </div>
    </nav>
  );
}
