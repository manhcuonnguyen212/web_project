// Mock database dùng localStorage để lưu dữ liệu giả lập

const STORAGE_KEY = "blog_posts";

// Lấy danh sách bài viết
export function getPosts() {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  return data;
}

// Lấy chi tiết bài viết theo ID
export function getPostById(id) {
  const posts = getPosts();
  return posts.find((p) => p.id === id);
}

// Thêm bài viết mới
export function addPost(post) {
  const posts = getPosts();
  const newPost = {
    id: Date.now(),
    title: post.title,
    content: post.content,
    excerpt: post.content.slice(0, 100) + "...",
  };
  posts.push(newPost);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  return newPost;
}

// Xóa bài viết theo ID
export function deletePost(id) {
  let posts = getPosts();
  posts = posts.filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}
