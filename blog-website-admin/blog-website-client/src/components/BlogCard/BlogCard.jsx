
import { Link } from "react-router-dom";
import { FaFolder, FaArrowRight, FaClock, FaUser } from "react-icons/fa";
import { BASE_IMAGE_URL } from "../../config";
import "./BlogCard.css";

function BlogCard({ post }) {
  // Format date to dd/mm/yyyy
  const formatDate = (dateString) => {
    if (!dateString) return "2 ngày trước";

    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  return (
    <article className="blog-card">
      {post.thumbnail && (
        <div className="blog-thumbnail">
          <img
            src={
              post.thumbnail.startsWith('http')
                ? post.thumbnail
                : `${BASE_IMAGE_URL}${post.thumbnail}`
            }
            alt={post.title}
          />
          <span className="blog-category-badge">
            <FaFolder />
            {post.category}
          </span>
        </div>
      )}
      <div className="blog-card-content">
        <div className="blog-card-header">
          {!post.thumbnail && (
            <span className="blog-category">
              <FaFolder />
              {post.category}
            </span>
          )}
        </div>
        <h3 className="blog-title">{post.title}</h3>
        <p className="blog-excerpt">{post.excerpt}</p>
        <div className="blog-card-footer">
          <div className="blog-meta">
            <span className="blog-author">
              <FaUser />
              {post.authorName}
            </span>
            <span className="blog-date">
              <FaClock />
              {formatDate(post.publishedAt || post.createdAt)}
            </span>
          </div>
          <Link to={`/post/${post._id}`} className="blog-read-more">
            Đọc tiếp
            <FaArrowRight />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default BlogCard;
