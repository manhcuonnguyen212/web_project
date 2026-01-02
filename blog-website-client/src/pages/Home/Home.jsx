import { useEffect, useState, useCallback } from "react";
import { useRef } from "react";
import { FaSearch, FaFilter } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";

import { BASE_URL } from "../../config/index";
import BlogCard from "../../components/BlogCard/BlogCard";


import "./Home.css";

function Home() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tất cả");
  const [categories, setCategories] = useState(["Tất cả"]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState("");
    // Fetch categories from backend
    useEffect(() => {
      const fetchCategories = async () => {
        setCategoriesLoading(true);
        setCategoriesError("");
        try {
          const res = await axios.get(`${BASE_URL}/category`);
          if (res.data.success && Array.isArray(res.data.data)) {
            const names = res.data.data.map((cat) => cat.name);
            setCategories(["Tất cả", ...names]);
          } else {
            setCategoriesError("Không thể tải danh mục");
          }
        } catch (err) {
          setCategoriesError("Không thể tải danh mục");
        } finally {
          setCategoriesLoading(false);
        }
      };
      fetchCategories();
    }, []);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [news, setNews] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const postsGridRef = useRef(null);

  const handleGetNews = useCallback(
    async (page = 1, searchQuery = "", categoryFilter = "Tất cả") => {
      try {
        setLoading(true);

        // Build query params
        let url = `${BASE_URL}/news?page=${page}`;

        if (searchQuery) {
          url += `&search=${encodeURIComponent(searchQuery)}`;
        }

        if (categoryFilter && categoryFilter !== "Tất cả") {
          url += `&category=${encodeURIComponent(categoryFilter)}`;
        }

        const res = await axios.get(url, {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });

        const result = res.data;
        if (result.success) {
          setNews(result.data.news);
          setPagination(result.data.pagination);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Lỗi khi tải bài viết");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Load initial data
  useEffect(() => {
    handleGetNews(1, "", "Tất cả");
  }, [handleGetNews]);

  // Handle search and filter with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      handleGetNews(1, search, category);
    }, 500);

    return () => clearTimeout(timer);
  }, [search, category, handleGetNews]);

  // Handle page change
  const handlePageChange = (page) => {
    // Then update page and fetch data
    setCurrentPage(page);
    handleGetNews(page, search, category);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  return (
    <div className="page page-home">
      <div className="container">
        <div className="hero-section">
          <h1 className="hero-title">Khám phá thế giới qua từng bài viết aaa</h1>
          <p className="hero-subtitle">
            Chia sẻ kiến thức, trải nghiệm và đam mê của bạn với cộng đồng
          </p>
        </div>

        <section className="filters">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm theo tiêu đề, nội dung..."
              className="search-input"
            />
          </div>
          <div className="category-wrapper">
            <FaFilter className="filter-icon" />
            <div
              className="category-select"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>{category}</span>
              <span
                className={`dropdown-arrow ${isDropdownOpen ? "open" : ""}`}
              >
                ▼
              </span>
            </div>
            {isDropdownOpen && (
              <>
                <div
                  className="dropdown-overlay"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="dropdown-menu">
                  {categoriesLoading ? (
                    <div className="dropdown-item">Đang tải...</div>
                  ) : categoriesError ? (
                    <div className="dropdown-item error">{categoriesError}</div>
                  ) : (
                    categories.map((c) => (
                      <div
                        key={c}
                        className={`dropdown-item ${c === category ? "active" : ""}`}
                        onClick={() => {
                          setCategory(c);
                          setIsDropdownOpen(false);
                        }}
                      >
                        {c}
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </section>

        <section className="posts-grid" ref={postsGridRef}>
          {loading ? (
            <div className="loading">Đang tải...</div>
          ) : (
            <>
              {news.map((post) => (
                <BlogCard key={post._id} post={post} />
              ))}
              {news.length === 0 && (
                <div className="empty">
                  <p>Không có bài viết phù hợp.</p>
                  <p className="empty-hint">
                    Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác.
                  </p>
                </div>
              )}
            </>
          )}
        </section>

        {pagination && pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
            >
              ‹ Trước
            </button>

            <div className="pagination-numbers">
              {Array.from(
                { length: pagination.totalPages },
                (_, i) => i + 1
              ).map((page) => {
                // Hiển thị: trang đầu, trang cuối, trang hiện tại và 1 trang xung quanh
                if (
                  page === 1 ||
                  page === pagination.totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      className={`pagination-number ${
                        page === currentPage ? "active" : ""
                      }`}
                      onClick={() => handlePageChange(page)}
                      disabled={loading}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return (
                    <span key={page} className="pagination-dots">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>

            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.totalPages || loading}
            >
              Sau ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
