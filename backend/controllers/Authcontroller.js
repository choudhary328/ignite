import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// This function replaces the old generateToken.js utility
// It now chooses the correct secret based on the user's role
const generateToken = (id, role) => {
  const secret =
    role === 'admin'
      ? process.env.JWT_ADMIN_SECRET
      : process.env.JWT_USER_SECRET;
      
  const expiresIn = role === 'admin' ? '1d' : '30d'; // Admins re-login daily

  return jwt.sign({ id, role }, secret, {
    expiresIn: expiresIn,
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Determine role (you can make this admin-only later)
  const role = email.toLowerCase().includes('admin@') ? 'admin' : 'user';

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role), // Use new token function
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc    Auth user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Check for user by email
  const user = await User.findOne({ email });

  // Check user and password
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role), // Use new token function
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

export { registerUser, loginUser };