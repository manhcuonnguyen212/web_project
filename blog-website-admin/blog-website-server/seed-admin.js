import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

// Kiểm tra môi trường
if (process.env.NODE_ENV === 'production') {
  console.error('❌ This script is DISABLED in production for security');
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UserSchema = new mongoose.Schema(
  {
    username: String,
    email: String,
    password: String,
    year: Number,
    phone: String,
    address: String,
    role: {
      type: String,
      enum: ['user', 'admin', 'supervisor admin'],
      default: 'user',
    },
    status: String,
    previousStatus: String,
  },
  { timestamps: true }
);

const UserModel = mongoose.model('users', UserSchema);

async function seedAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_CONNECTION);
    console.log('✅ Connected to MongoDB\n');

    // Đọc file admin-user.json
    const adminFilePath = path.join(__dirname, '..', 'data', 'admin-user.json');
    
    if (!fs.existsSync(adminFilePath)) {
      console.error('❌ File admin-user.json not found');
      process.exit(1);
    }

    const adminData = JSON.parse(fs.readFileSync(adminFilePath, 'utf-8'));

    // Kiểm tra xem admin đã tồn tại chưa
    const existingAdmin = await UserModel.findOne({ 
      email: adminData.email 
    });

    if (existingAdmin) {
      console.log('⚠️  Admin already exists:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   Status: ${existingAdmin.status}\n`);
      
      // Hỏi có muốn cập nhật không (chỉ trong dev)
      console.log('ℹ️  To update, delete the existing admin first from MongoDB');
    } else {
      // Tạo admin mới từ file JSON
      const admin = new UserModel({
        ...adminData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await admin.save();
      
      console.log('✅ Supervisor Admin created successfully!');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Username: ${admin.username}`);
      console.log(`   Role: ${admin.role}`);
      console.log('⚠️  Password is pre-hashed in admin-user.json\n');
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedAdmin();
