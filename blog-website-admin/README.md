# Blog Website Project (MERN Stack)

## Mô tả
Hệ thống website blog gồm 3 ứng dụng:
- **Server (Backend):** Node.js, Express.js, MongoDB
- **Client (Frontend):** React.js cho người dùng
- **Admin (Frontend):** React.js cho quản trị viên

## Cấu trúc thư mục
```
web_project/
├── blog-website-server/   # Express + MongoDB
├── blog-website-client/   # React Client
├── blog-website-admin/    # React Admin
└── data/                  # Seed data
```

## Công nghệ sử dụng
- Node.js, Express.js, MongoDB, Mongoose
- React 18, Redux Toolkit, React Router, Axios
- JWT, Bcrypt, Nodemailer
- Vite, React Toastify, React Icons

## Cài đặt & chạy dự án
1. **Clone repo:**
   ```bash
   git clone <repo-url>
   ```
2. **Cài đặt package:**
   ```bash
   cd blog-website-server && npm install
   cd ../blog-website-client && npm install
   cd ../blog-website-admin && npm install
   ```
3. **Cấu hình biến môi trường:**
   - Tạo file `.env` trong `blog-website-server` với các biến cần thiết (MONGO_CONNECTION, JWT_SECRET, ...)
4. **Chạy server:**
   ```bash
   cd blog-website-server
   npm start
   ```
5. **Chạy client:**
   ```bash
   cd blog-website-client
   npm run dev
   ```
6. **Chạy admin:**
   ```bash
   cd blog-website-admin
   npm run dev
   ```

## Tài khoản mẫu
- Đăng ký tài khoản user trực tiếp trên client.
- Tài khoản admin: tạo thủ công trong database hoặc qua seed script (nếu có).

## Bảo mật
- Không commit file `.env`, dữ liệu nhạy cảm, file seed, file test cá nhân lên git.
- Đã cấu hình `.gitignore` để loại trừ các file quan trọng.

## License
MIT
