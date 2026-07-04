import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });

    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);

      // Update role to super_admin if it's the legacy 'admin'
      if (existingAdmin.role === 'admin') {
        existingAdmin.role = 'super_admin';
        await existingAdmin.save();
        console.log('Admin role updated to super_admin successfully!');
      }
    } else {
      // Create new admin user
      const admin = await User.create({
        name: 'Super Admin',
        email: 'admin@example.com',
        password: 'Admin@123', // Change this to your preferred password
        role: 'super_admin',
        status: 'Active'
      });

      console.log('✅ Admin user created successfully!');
      console.log('Email:', admin.email);
      console.log('Password: Admin@123'); // Change this to match the password above
      console.log('Role:', admin.role);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createAdmin();
