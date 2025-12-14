import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { readSheet, appendToSheet, updateSheet, findRowIndexById, generateId, formatDate } from './google-sheets';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SHEET_NAME = 'users';

// Hash password
export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

// Compare password
export async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// Generate JWT token
export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Get user by email
export async function getUserByEmail(email) {
  try {
    const users = await readSheet(SHEET_NAME);
    return users.find((user) => user.email === email);
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}

// Get user by username
export async function getUserByUsername(username) {
  try {
    const users = await readSheet(SHEET_NAME);
    return users.find((user) => user.username === username);
  } catch (error) {
    console.error('Error getting user by username:', error);
    return null;
  }
}

// Get user by ID
export async function getUserById(id) {
  try {
    const users = await readSheet(SHEET_NAME);
    return users.find((user) => user.id === id);
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
}

// Create user
export async function createUser(userData) {
  try {
    const id = generateId();
    const now = formatDate();
    const passwordHash = await hashPassword(userData.password);

    const values = [
      id,
      userData.username,
      userData.email,
      passwordHash,
      userData.full_name || '',
      userData.role || 'user',
      'true', // is_active
      '', // last_login
      now, // created_at
      now, // updated_at
    ];

    await appendToSheet(SHEET_NAME, values);

    return {
      id,
      username: userData.username,
      email: userData.email,
      full_name: userData.full_name,
      role: userData.role || 'user',
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Update last login
export async function updateLastLogin(userId) {
  try {
    const rowIndex = await findRowIndexById(SHEET_NAME, userId);
    if (rowIndex === -1) return false;

    const user = await getUserById(userId);
    if (!user) return false;

    const values = [
      user.id,
      user.username,
      user.email,
      user.password_hash,
      user.full_name,
      user.role,
      user.is_active,
      formatDate(), // last_login
      user.created_at,
      formatDate(), // updated_at
    ];

    await updateSheet(SHEET_NAME, rowIndex, values);
    return true;
  } catch (error) {
    console.error('Error updating last login:', error);
    return false;
  }
}

// Validate session from cookies
export function validateSession(request) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    return decoded;
  } catch (error) {
    return null;
  }
}