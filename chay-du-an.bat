@echo off
chcp 65001 >nul
echo ========================================
echo    CHẠY DỰ ÁN BLOG WEBSITE
echo ========================================
echo.

echo [1/3] Đang khởi động Server (Backend)...
start "Server - Backend" cmd /k "cd /d %~dp0blog-website-server && npm start"
timeout /t 3 >nul

echo [2/3] Đang khởi động Client (Website)...
start "Client - Website" cmd /k "cd /d %~dp0blog-website-client && npm run dev"
timeout /t 2 >nul

echo [3/3] Đang khởi động Admin Dashboard...
start "Admin Dashboard" cmd /k "cd /d %~dp0blog-website-admin && npm run dev"
timeout /t 2 >nul

echo.
echo ✓ Đã khởi động thành công!
echo.
echo ========================================
echo THÔNG TIN TRUY CẬP:
echo ========================================
echo.
echo → Client Website:  http://localhost:5173
echo → Admin Dashboard: http://localhost:5174/admin/login
echo → Server API:      http://localhost:5000
echo.
echo ========================================
echo ĐĂNG NHẬP ADMIN:
echo ========================================
echo Email:    fuuvip2808@gmail.com
echo Password: admin123
echo ========================================
echo.
echo Nhấn phím bất kỳ để mở trình duyệt...
pause >nul

start http://localhost:5173
start http://localhost:5174/admin/login

echo.
echo Các cửa sổ terminal đã được mở.
echo Để dừng server, đóng các cửa sổ terminal đó.
echo.
pause
