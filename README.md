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
   - Tạo file `.env` trong `blog-website-server` với nội dung mẫu như sau:

     ```env
     PORT=5000
     MONGO_CONNECTION=your_mongodb_connection_string
     JWT_ACCESSTOKEN_KEY=your_access_token_secret
     JWT_REFRESHTOKEN_KEY=your_refresh_token_secret
     CLIENT_URL=http://localhost:5173
     NODE_ENV=development
     EMAIL_USER=your_email@gmail.com
     EMAIL_PASSWORD=your_email_app_password
     ```
   - Thay thế các giá trị `your_*` bằng thông tin thực tế của bạn.

- Tạo file `.env` trong `blog-website-admin` với nội dung mẫu như sau:
      VITE_MAIN_SITE_URL = đường dẫn tới client (ví dụ nếu local là http://localhost:5173, hoặc domain name nếu có deloy)
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
