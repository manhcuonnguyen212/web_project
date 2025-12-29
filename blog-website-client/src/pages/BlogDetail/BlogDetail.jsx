/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
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
  FaFlag,
  FaReply,
  FaTrash,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';

import { BASE_URL } from '../../config';
import useAxiosJWT from '../../config/axiosConfig';

import './BlogDetail.css';
function PostDetail() {
  const { postId } = useParams();
  const [searchParams] = useSearchParams();
  const user = useSelector((state) => state?.auth?.user);
  const getAxiosJWT = useAxiosJWT();
  const axiosJWT = getAxiosJWT();
  const commentsRef = useRef(null);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [postDetail, setPostDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingComment, setLoadingComment] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [highlightCommentId, setHighlightCommentId] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState({ type: '', id: '' });
  const [replyingTo, setReplyingTo] = useState(null);

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
        `${BASE_URL}/comment`,
        {
          newsId: postId,
          content: text,
          parentId: replyingTo?.id || null,
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
        setReplyingTo(null);
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
      const res = await axios.get(`${BASE_URL}/comment/${postId}`, {
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
        `${BASE_URL}/comment/like/${commentId}`,
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

  const handleDeleteComment = async (commentId) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để xóa bình luận');
      return;
    }

    if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
      return;
    }

    try {
      const res = await axiosJWT.delete(
        `${BASE_URL}/comment/${commentId}`,
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
        toast.success('Xóa bình luận thành công!');
        // Reload comments
        handleGetComments();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Không thể xóa bình luận';
      toast.error(errorMessage);
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
        setLikesCount(result.data.likes || 0);
        // Check if user đã like và save chưa
        if (user) {
          setLiked(result.data.likedBy?.includes(user._id) || false);
          setBookmarked(result.data.savedBy?.includes(user._id) || false);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle like bài viết
  const handleToggleLikePost = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để thích bài viết');
      return;
    }

    try {
      const res = await axiosJWT.post(
        `${BASE_URL}/news/like/${postId}`,
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
        setLiked(result.data.isLiked);
        setLikesCount(result.data.likes);
        toast.success(result.message);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra';
      toast.error(errorMessage);
      
      if (error.response?.status === 403) {
        toast.warning('Vui lòng liên hệ quản trị viên để được hỗ trợ');
      }
    }
  };

  // Toggle save bài viết
  const handleToggleSavePost = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để lưu bài viết');
      return;
    }

    try {
      const res = await axiosJWT.post(
        `${BASE_URL}/news/save/${postId}`,
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
        setBookmarked(result.data.isSaved);
        toast.success(result.message);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra';
      toast.error(errorMessage);
      
      if (error.response?.status === 403) {
        toast.warning('Vui lòng liên hệ quản trị viên để được hỗ trợ');
      }
    }
  };

  // Share bài viết
  const handleSharePost = async () => {
    const url = window.location.href;
    
    // Kiểm tra Web Share API
    if (navigator.share) {
      try {
        await navigator.share({
          title: postDetail.title,
          text: postDetail.excerpt || 'Đọc bài viết này!',
          url: url,
        });
        toast.success('Chia sẻ thành công!');
      } catch (error) {
        // User hủy share hoặc lỗi
        if (error.name !== 'AbortError') {
          // Fallback: copy link
          copyToClipboard(url);
        }
      }
    } else {
      // Fallback: copy link
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        toast.success('Đã sao chép link bài viết!');
      }).catch(() => {
        toast.error('Không thể sao chép link');
      });
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast.success('Đã sao chép link bài viết!');
      } catch (err) {
        toast.error('Không thể sao chép link');
      }
      document.body.removeChild(textArea);
    }
  };

  // Report bài viết hoặc comment
  const handleReportClick = (type, id) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để báo cáo');
      return;
    }
    setReportTarget({ type, id });
    setShowReportModal(true);
  };

  const handleSubmitReport = async (reason, description) => {
    try {
      const res = await axiosJWT.post(
        `${BASE_URL}/reports`,
        {
          targetType: reportTarget.type,
          targetId: reportTarget.id,
          reason,
          description,
        },
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
          withCredentials: true,
        }
      );

      const result = res.data;
      if (result.success) {
        toast.success('Báo cáo của bạn đã được gửi');
        setShowReportModal(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể gửi báo cáo');
    }
  };

  const handleReply = (commentId, authorName) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để trả lời bình luận');
      return;
    }
    setReplyingTo({ id: commentId, author: authorName });
    setNewComment(`@${authorName} `);
    // Scroll to comment form
    const commentForm = document.querySelector('.comment-form');
    if (commentForm) {
      commentForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Focus textarea
      setTimeout(() => {
        const textarea = commentForm.querySelector('textarea');
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(textarea.value.length, textarea.value.length);
        }
      }, 300);
    }
  };

  useEffect(() => {
    handleGetNewsDetail();
    handleGetComments();

    // Check for commentId query param to highlight
    const commentId = searchParams.get('commentId');
    if (commentId) {
      setHighlightCommentId(commentId);
      // Scroll to comment after data loads
      setTimeout(() => {
        const commentElement = document.getElementById(`comment-${commentId}`);
        if (commentElement) {
          commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }
  }, [postId, user]);

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
              onClick={handleToggleLikePost}
              title={liked ? 'Bỏ thích' : 'Thích bài viết'}
            >
              <FaHeart /> {liked ? 'Đã thích' : 'Thích'} ({likesCount})
            </button>
            <button 
              className="action-btn"
              onClick={() => {
                const commentsSection = document.querySelector('.comments-section');
                commentsSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              title="Xem bình luận"
            >
              <FaComment /> Bình luận ({comments.length})
            </button>
            <button
              className={`action-btn ${bookmarked ? 'active' : ''}`}
              onClick={handleToggleSavePost}
              title={bookmarked ? 'Bỏ lưu' : 'Lưu bài viết'}
            >
              <FaBookmark /> {bookmarked ? 'Đã lưu' : 'Lưu'}
            </button>
            <button 
              className="action-btn"
              onClick={handleSharePost}
              title="Chia sẻ bài viết"
            >
              <FaShare /> Chia sẻ
            </button>
            <button 
              className="action-btn report-btn"
              onClick={() => handleReportClick('news', postId)}
              title="Báo cáo vi phạm"
            >
              <FaFlag /> Báo cáo
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

        <section className="comments-section">
          <div className="comments-header">
            <h2 className="comments-title">
              <FaComment /> Bình luận ({comments.length})
            </h2>
          </div>

          <form onSubmit={handleAddComment} className="comment-form">
            {replyingTo && (
              <div className="replying-to-notice">
                <span>Đang trả lời <strong>@{replyingTo.author}</strong></span>
                <button 
                  type="button" 
                  className="cancel-reply-btn"
                  onClick={() => {
                    setReplyingTo(null);
                    setNewComment('');
                  }}
                >
                  ✕
                </button>
              </div>
            )}
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
                <div 
                  key={c._id} 
                  id={`comment-${c._id}`}
                  className={`comment-item ${highlightCommentId === c._id ? 'highlighted' : ''}`}
                >
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
                      <button
                        className="comment-action-btn"
                        onClick={() => handleReply(c._id, c.author)}
                      >
                        <FaReply /> Trả lời
                      </button>
                      {user?.username === c.author && (
                        <button
                          className="comment-action-btn delete-btn"
                          onClick={() => handleDeleteComment(c._id)}
                          title="Xóa bình luận"
                        >
                          <FaTrash /> Xóa
                        </button>
                      )}
                      <button
                        className="comment-action-btn report-btn"
                        onClick={() => handleReportClick('comment', c._id)}
                        title="Báo cáo bình luận"
                      >
                        <FaFlag /> Báo cáo
                      </button>
                    </div>

                    {/* Replies */}
                    {c.replies && c.replies.length > 0 && (
                      <div className="comment-replies">
                        {c.replies.map((reply) => (
                          <div key={reply._id} className="comment-item reply-item">
                            <div className="comment-avatar">
                              <FaUser />
                            </div>
                            <div className="comment-body">
                              <div className="comment-header">
                                <span className="comment-author">{reply.author}</span>
                                <span className="comment-date">
                                  <FaClock /> {formatTimeAgo(reply.createdAt)}
                                </span>
                              </div>
                              <div className="comment-content">{reply.content}</div>
                              <div className="comment-actions">
                                <button
                                  className={`comment-action-btn ${
                                    reply.likedBy?.includes(user?._id) ? 'liked' : ''
                                  }`}
                                  onClick={() => handleToggleLike(reply._id)}
                                >
                                  <FaHeart /> {reply.likedBy?.includes(user?._id) ? 'Đã thích' : 'Thích'} (
                                  {reply.likes})
                                </button>
                                <button
                                  className="comment-action-btn"
                                  onClick={() => handleReply(c._id, reply.author)}
                                >
                                  <FaReply /> Trả lời
                                </button>
                                {user?.username === reply.author && (
                                  <button
                                    className="comment-action-btn delete-btn"
                                    onClick={() => handleDeleteComment(reply._id)}
                                    title="Xóa bình luận"
                                  >
                                    <FaTrash /> Xóa
                                  </button>
                                )}
                                <button
                                  className="comment-action-btn report-btn"
                                  onClick={() => handleReportClick('comment', reply._id)}
                                  title="Báo cáo bình luận"
                                >
                                  <FaFlag /> Báo cáo
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
      </article>

      {/* Report Modal */}
      {showReportModal && (
        <ReportModal
          onClose={() => setShowReportModal(false)}
          onSubmit={handleSubmitReport}
        />
      )}
      </div>
    </div>
  );
}

// Report Modal Component
function ReportModal({ onClose, onSubmit }) {
  const [reason, setReason] = useState('spam');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(reason, description);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content report-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Báo cáo vi phạm</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Lý do báo cáo</label>
            <select value={reason} onChange={(e) => setReason(e.target.value)} required>
              <option value="spam">Spam</option>
              <option value="inappropriate">Nội dung không phù hợp</option>
              <option value="harassment">Quấy rối</option>
              <option value="misinformation">Thông tin sai lệch</option>
              <option value="violence">Bạo lực</option>
              <option value="other">Khác</option>
            </select>
          </div>
          <div className="form-group">
            <label>Mô tả chi tiết (tùy chọn)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả chi tiết..."
              rows={4}
              maxLength={500}
            />
            <small>{description.length}/500 ký tự</small>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn-submit">
              Gửi báo cáo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PostDetail;
