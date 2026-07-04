import jwt from 'jsonwebtoken';

// This function now accepts the user's ID, their ROLE, and an optional expiry override
const generateToken = (id, role, expiresInOverride) => {
  let secret;
  let expiresIn = expiresInOverride || '30d'; // Use override or default

  // Choose the correct secret based on the user's role
  if (role === 'admin' || role === 'org_admin' || role === 'super_admin') {
    secret = process.env.JWT_ADMIN_SECRET;
  } else {
    secret = process.env.JWT_USER_SECRET;
  }

  if (!secret) {
    secret = process.env.JWT_USER_SECRET || 'fallbacksecret';
  }

  // Include the 'role' in the token payload as well
  return jwt.sign({ id, role }, secret, {
    expiresIn: expiresIn,
  });
};

export default generateToken;