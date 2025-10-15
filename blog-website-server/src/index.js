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
app.use(
  cors({
    origin: true,
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

// routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/news', newsRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/category', categoryRoutes);

// start server
app.listen(PORT, () => {
  connectDB();
  console.log(`Server running on port ${PORT}`);
});
