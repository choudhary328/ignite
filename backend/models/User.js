import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      unique: true,
      sparse: true, // Allows null values for existing users
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    // --- THIS IS THE FIX ---
    // We provide default values for 'role' and 'status'
    // This stops your app from crashing when it reads old users.
    role: {
      type: String,
      required: true,
      enum: ['user', 'org_admin', 'super_admin'],
      default: 'user',
    },
    status: {
      type: String,
      required: true,
      default: 'Active',
    },
    // --- NEW: User Profile Fields (User Side Features) ---
    contact: {
      type: String,
      default: "",
    },
    contact2: {
      type: String,
      default: "",
    },
    college: {
      type: String, // College or School name
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    // --- Password Reset Fields ---
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate unique user ID before saving
userSchema.pre('save', async function (next) {
  // Generate unique userId if it doesn't exist
  if (!this.userId) {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    this.userId = `ignite${timestamp}${randomStr}`;
  }

  // Hash password if modified
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', userSchema);

export default User;