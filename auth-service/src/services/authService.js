import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const getJwtConfig = () => ({
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRE || '7d'
});

const getSaltRounds = () => {
  const rounds = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);
  return Number.isNaN(rounds) ? 10 : rounds;
};

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  lastLoginAt: user.lastLoginAt
});

const createToken = (user) => {
  const { secret, expiresIn } = getJwtConfig();

  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role
    },
    secret,
    { expiresIn }
  );
};

export const registerUser = async ({ name, email, password, role }) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    const error = new Error('User already exists with this email');
    error.statusCode = 409;
    error.code = 'USER_EXISTS';
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, getSaltRounds());

  const user = await User.create({
    name: String(name).trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role: role && ['candidate', 'admin'].includes(role) ? role : 'candidate'
  });

  const token = createToken(user);

  return {
    user: sanitizeUser(user),
    token,
    expiresIn: process.env.JWT_EXPIRE || '7d'
  };
};

export const loginUser = async ({ email, password }) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('Account is disabled');
    error.statusCode = 403;
    error.code = 'ACCOUNT_DISABLED';
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = createToken(user);

  return {
    user: sanitizeUser(user),
    token,
    expiresIn: process.env.JWT_EXPIRE || '7d'
  };
};
