import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import User from '../models/User.js';
import generateToken from '../utils/Generatetoken.js';
import sendEmail from '../utils/sendEmail.js';

// @desc    Auth user & get token (Login)
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    // Generate token with appropriate expiry
    const tokenExpiry = rememberMe ? '30d' : '1d';
    const token = generateToken(user._id, user.role, tokenExpiry);

    res.json({
      _id: user._id,
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      imageUrl: user.imageUrl,
      contact: user.contact,
      contact2: user.contact2,
      college: user.college,
      address: user.address,
      createdAt: user.createdAt,
      token,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Send password reset email
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('No account found with that email address');
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash token and save to DB
  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

  await user.save({ validateBeforeSave: false });

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem;">
      <h1 style="color: #4f46e5; font-size: 1.5rem; margin-bottom: 0.5rem;">Ignite</h1>
      <h2 style="color: #111827; font-size: 1.25rem;">Password Reset Request</h2>
      <p style="color: #6b7280; line-height: 1.6;">
        Hi <strong>${user.name}</strong>, you requested a password reset. Click the button below to set a new password. This link expires in <strong>15 minutes</strong>.
      </p>
      <a href="${resetUrl}" style="display: inline-block; background: #4f46e5; color: white; padding: 0.75rem 1.5rem; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 1rem 0;">
        Reset Password
      </a>
      <p style="color: #9ca3af; font-size: 0.875rem; margin-top: 1.5rem;">
        If you didn't request this, please ignore this email. Your password will remain unchanged.
      </p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 1.5rem 0;" />
      <p style="color: #9ca3af; font-size: 0.75rem;">© ${new Date().getFullYear()} Ignite Platform</p>
    </div>
  `;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Ignite – Password Reset',
      html,
    });

    res.json({ message: 'Password reset email sent successfully' });
  } catch (err) {
    // Clean up if email fails
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(500);
    throw new Error('Email could not be sent. Please try again later.');
  }
});

// @desc    Reset password with token
// @route   PUT /api/users/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  // Hash the token from URL to compare with DB
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ message: 'Password reset successful. You can now log in.' });
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, contact, contact2, college, address } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Validate role - only allow 'user' and 'org_admin' during self-registration
  const allowedRoles = ['user', 'org_admin'];
  const assignedRole = allowedRoles.includes(role) ? role : 'user';

  const user = await User.create({
    name,
    email,
    password,
    role: assignedRole,
    contact: contact || '',
    contact2: contact2 || '',
    college: college || '',
    address: address || '',
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      imageUrl: user.imageUrl,
      contact: user.contact,
      contact2: user.contact2,
      college: user.college,
      address: user.address,
      createdAt: user.createdAt,
      token: generateToken(user._id, user.role),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  // 'req.user' is attached by the 'protect' middleware
  const user = req.user;

  if (user) {
    res.json({
      _id: user._id,
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      imageUrl: user.imageUrl,
      contact: user.contact,
      contact2: user.contact2,
      college: user.college,
      address: user.address,
      createdAt: user.createdAt,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check current password if user is trying to change it
  if (req.body.newPassword) {
    if (!req.body.currentPassword) {
      res.status(400);
      throw new Error('Please provide your current password to set a new one.');
    }
    if (!(await user.matchPassword(req.body.currentPassword))) {
      res.status(401);
      throw new Error('Invalid current password');
    }
    // Hash and set the new password
    user.password = req.body.newPassword;
  }

  // Update other fields
  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  user.contact = req.body.contact || user.contact;
  user.contact2 = req.body.contact2 !== undefined ? req.body.contact2 : user.contact2;
  user.college = req.body.college || user.college;
  user.address = req.body.address || user.address;

  if (req.file) {
    user.imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
  }

  const updatedUser = await user.save();

  // Send back ALL user data and a new token
  res.json({
    _id: updatedUser._id,
    userId: updatedUser.userId,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    status: updatedUser.status,
    imageUrl: updatedUser.imageUrl,
    contact: updatedUser.contact,
    contact2: updatedUser.contact2,
    college: updatedUser.college,
    address: updatedUser.address,
    createdAt: updatedUser.createdAt,
    token: generateToken(updatedUser._id, updatedUser.role),
  });
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // --- SAFETY CHECK ---
  // Prevent an admin from deleting themselves
  if (req.user._id.toString() === user._id.toString()) {
    res.status(400);
    throw new Error('Cannot delete your own admin account');
  }

  await user.deleteOne();
  res.json({ message: 'User removed' });
});

// @desc    Toggle user status (Active/Blocked)
// @route   PUT /api/users/:id/toggle-status
// @access  Private/Admin
const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Prevent admin from blocking themselves
  if (req.user._id.toString() === user._id.toString()) {
    res.status(400);
    throw new Error('Cannot block your own admin account');
  }

  // Toggle status
  user.status = user.status === 'Active' ? 'Blocked' : 'Active';
  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    status: updatedUser.status,
    createdAt: updatedUser.createdAt,
  });
});

// @desc    Toggle organization verification status
// @route   PUT /api/users/:id/toggle-verify
// @access  Private/Admin
const toggleOrgVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role !== 'org_admin') {
    res.status(400);
    throw new Error('Only organization admins can be verified');
  }

  user.isVerified = !user.isVerified;
  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    isVerified: updatedUser.isVerified,
    role: updatedUser.role,
  });
});

// @desc    Impersonate user (Login as User)
// @route   POST /api/users/:id/impersonate
// @access  Private/SuperAdmin
const loginAsUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Generate a standard token for the target user
  const token = generateToken(user._id, user.role, '1d');

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    imageUrl: user.imageUrl,
    token,
  });
});

export {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  toggleUserStatus,
  toggleOrgVerification,
  loginAsUser,
  forgotPassword,
  resetPassword,
};
