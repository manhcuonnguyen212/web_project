// import lib and routes
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import newsRoutes from './routes/news.js';
import commentRoutes from './routes/comment.js';
import categoryRoutes from './routes/category.js';
import notificationRoutes from './routes/notification.js';
import reportRoutes from './routes/report.js';

// config
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// connect database
mongoose.set('strictQuery', false);
const connectDB = async () => {
  try {
    if (!process.env.MONGO_CONNECTION) {
      throw new Error('MONGO_CONNECTION environment variable is not set');
    }
    await mongoose.connect(process.env.MONGO_CONNECTION);
    console.log('✅ connect database successful');
  } catch (error) {
    console.error('❌ connect database failed:', error.message);
  }
};

// middlewares
app.use(cookieParser());
const allowedOrigins = [
  'https://blogmoingay.id.vn',
  'https://admin.blogmoingay.id.vn'
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Cho phép cả request không có origin (như từ Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
app.disable('x-powered-by');
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);


import path from "path";
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
// routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/news', newsRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/comment', commentRoutes);
app.use('/api/v1/category', categoryRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/reports', reportRoutes);

// start server
app.listen(PORT, () => {
  connectDB();
  console.log(`Server running on port ${PORT}`);
});
