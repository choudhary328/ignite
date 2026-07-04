import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const updateToAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    // Find and update the user
    const user = await User.findOne({ email: 'admin@example.com' });
    
    if (!user) {
      console.log('❌ User with email admin@example.com not found!');
      console.log('Creating new admin user...');
      
      const newAdmin = await User.create({
        name: 'Admin',
        email: 'admin@example.com',
        password: 'Admin@123',
        role: 'admin',
        status: 'Active'
      });
      
      console.log('✅ Admin user created successfully!');
      console.log('Email:', newAdmin.email);
      console.log('Password: Admin@123');
      console.log('Role:', newAdmin.role);
    } else {
      // Update role and password
      user.role = 'admin';
      user.password = 'Admin@123'; // This will be hashed by the pre-save hook
      user.status = 'Active';
      await user.save();
      
      console.log('✅ User updated to admin successfully!');
      console.log('Email:', user.email);
      console.log('Password: Admin@123');
      console.log('Role:', user.role);
      console.log('Status:', user.status);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

updateToAdmin();
