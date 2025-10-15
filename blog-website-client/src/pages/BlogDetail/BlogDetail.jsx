/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaFolder,
  FaClock,
  FaUser,
  FaArrowLeft,
  FaComment,
  FaPaperPlane,
  FaHeart,
  FaShare,
  FaBookmark,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';

import { BASE_URL } from '../../config';
import useAxiosJWT from '../../config/axiosConfig';

import './BlogDetail.css';
function PostDetail() {
  const { postId } = useParams();
  const user = useSelector((state) => state?.auth?.user);
  const getAxiosJWT = useAxiosJWT();
  const axiosJWT = getAxiosJWT();

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [postDetail, setPostDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingComment, setLoadingComment] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return '2 ngày trước';

    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    return formatDate(dateString);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    const text = newComment.trim();
    if (!text) {
      toast.error('Vui lòng nhập nội dung bình luận');
      return;
    }

    if (!user) {
      toast.error('Vui lòng đăng nhập để bình luận');
      return;
    }

    setLoadingComment(true);
    try {
      const res = await axiosJWT.post(
        `${BASE_URL}/comments`,
        {
          newsId: postId,
          content: text,
        },
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );
      const result = res.data;
      if (result.success) {
        toast.success('Bình luận thành công!');
        setNewComment('');
        // Reload comments
        handleGetComments();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra';
      toast.error(errorMessage);
      
      // If user is blocked, show additional warning
      if (error.response?.status === 403) {
        toast.warning('Vui lòng liên hệ quản trị viên để được hỗ trợ');
      }
    } finally {
      setLoadingComment(false);
    }
  };

  const handleGetComments = async () => {
    setCommentLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/comments/${postId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.accessToken}`,
        },
        withCredentials: true,
      });
      const result = res.data;
      if (result.success) {
        setComments(result.data.comments);
      }
    } catch (error) {
      console.error('Get comments error:', error);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleToggleLike = async (commentId) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để thích bình luận');
      return;
    }

    try {
      const res = await axiosJWT.post(
        `${BASE_URL}/comments/like/${commentId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );
      const result = res.data;
      if (result.success) {
        // Update with server response
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment._id === commentId
              ? {
                  ...comment,
                  likedBy: result.data.likedBy || comment.likedBy,
                  likes: result.data.likes,
                }
              : comment
          )
        );
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra';
      toast.error(errorMessage);
      
      // If user is blocked, show additional warning
      if (error.response?.status === 403) {
        toast.warning('Vui lòng liên hệ quản trị viên để được hỗ trợ');
      }
    }
  };

  const handleGetNewsDetail = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/news/${postId}`, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });
      const result = res.data;
      if (result.success) {
        setPostDetail(result.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetNewsDetail();
    handleGetComments();
  }, [postId]);

  if (loading) {
    return (
      <div className="page page-post-detail">
        <div className="container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Đang tải bài viết...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!postDetail) {
    return (
      <div className="page page-post-detail">
        <div className="container">
          <div className="not-found">
            <h1>404</h1>
            <p>Không tìm thấy bài viết</p>
            <Link to="/" className="btn-primary">
              <FaArrowLeft /> Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page page-post-detail">
      <div className="container">
        <Link to="/" className="back-link">
          <FaArrowLeft /> Quay lại
        </Link>

        <article className="post-article">
          {postDetail?.thumbnail && (
            <div className="post-thumbnail">
              <img src={postDetail?.thumbnail} alt={postDetail.title} />
            </div>
          )}

          <div className="post-header">
            <div className="post-meta-top">
              <span className="post-category">
                <FaFolder />
                {postDetail.category}
              </span>
            </div>

            <h1 className="post-title">{postDetail.title}</h1>

            <div className="post-author-info">
              <div className="author-avatar">
                <FaUser />
              </div>
              <div className="author-details">
                <div className="author-name">{postDetail.authorName}</div>
                <div className="author-meta">
                  <FaClock /> {formatDate(postDetail.publishedAt) || '2 ngày trước'}
                </div>
              </div>
            </div>
          </div>

          <div className="post-actions">
            <button
              className={`action-btn ${liked ? 'active' : ''}`}
              onClick={() => setLiked(!liked)}
            >
              <FaHeart /> {liked ? 'Đã thích' : 'Thích'}
            </button>
            <button className="action-btn">
              <FaComment /> Bình luận
            </button>
            <button
              className={`action-btn ${bookmarked ? 'active' : ''}`}
              onClick={() => setBookmarked(!bookmarked)}
            >
              <FaBookmark /> {bookmarked ? 'Đã lưu' : 'Lưu'}
            </button>
            <button className="action-btn">
              <FaShare /> Chia sẻ
            </button>
          </div>
          <div className="post-content">
            {postDetail.content && Array.isArray(postDetail.content) ? (
              postDetail.content
                .sort((a, b) => a.order - b.order)
                .map((block, index) => {
                  if (block.type === 'paragraph') {
                    return (
                      <p key={index} className="content-paragraph">
                        {block.text}
                      </p>
                    );
                  } else if (block.type === 'image') {
                    return (
                      <figure key={index} className="content-image">
                        <img src={block.url} alt={block.alt || postDetail.title} />
                        {block.caption && <figcaption>{block.caption}</figcaption>}
                      </figure>
                    );
                  }
                  return null;
                })
            ) : (
              <p>{postDetail.excerpt || 'Nội dung đang được cập nhật...'}</p>
            )}
          </div>
        </article>

        <section className="comments-section">
          <div className="comments-header">
            <h2 className="comments-title">
              <FaComment /> Bình luận ({comments.length})
            </h2>
          </div>

          <form onSubmit={handleAddComment} className="comment-form">
            <div className="comment-input-wrapper">
              <div className="comment-avatar">
                <FaUser />
              </div>
              <textarea
                className="comment-input"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Viết bình luận của bạn..."
                rows="3"
              />
            </div>
            <div className="comment-form-actions">
              <button type="submit" className="btn-comment" disabled={loadingComment}>
                {loadingComment ? (
                  <>
                    <span className="spinner-small"></span>
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <FaPaperPlane /> Gửi bình luận
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="comment-list">
            {commentLoading ? (
              <div className="loading-comments">
                <span className="spinner-small"></span>
                <p>Đang tải bình luận...</p>
              </div>
            ) : comments.length > 0 ? (
              comments.map((c) => (
                <div key={c._id} className="comment-item">
                  <div className="comment-avatar">
                    <FaUser />
                  </div>
                  <div className="comment-body">
                    <div className="comment-header">
                      <span className="comment-author">{c.author}</span>
                      <span className="comment-date">
                        <FaClock /> {formatTimeAgo(c.createdAt)}
                      </span>
                    </div>
                    <div className="comment-content">{c.content}</div>
                    <div className="comment-actions">
                      <button
                        className={`comment-action-btn ${
                          c.likedBy?.includes(user?._id) ? 'liked' : ''
                        }`}
                        onClick={() => handleToggleLike(c._id)}
                      >
                        <FaHeart /> {c.likedBy?.includes(user?._id) ? 'Đã thích' : 'Thích'} (
                        {c.likes})
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-comments">
                <FaComment />
                <p>Chưa có bình luận nào</p>
                <p className="no-comments-hint">Hãy là người đầu tiên bình luận về bài viết này!</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default PostDetail;
