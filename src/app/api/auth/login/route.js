import { NextResponse } from 'next/server';
import { getUserByEmail, comparePassword, generateToken, updateLastLogin } from '@/lib/auth';

export async function POST(request) {
  try {
    console.log('🔐 Login attempt started');
    
    const body = await request.json();
    const { email, password } = body;

    console.log('📧 Email:', email);

    // Validation
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get user
    console.log('🔍 Looking up user...');
    const user = await getUserByEmail(email);
    
    if (!user) {
      console.log('❌ User not found');
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('✅ User found:', user.username);

    // Check if user is active
    if (user.is_active !== 'TRUE' && user.is_active !== 'true' && user.is_active !== true) {
      console.log('❌ User inactive');
      return NextResponse.json(
        { error: 'Account is inactive' },
        { status: 401 }
      );
    }

    // Verify password
    console.log('🔑 Verifying password...');
    const isValidPassword = await comparePassword(password, user.password_hash);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('✅ Password valid');

    // Generate token
    const token = generateToken(user);
    console.log('🎟️ Token generated');

    // Update last login
    await updateLastLogin(user.id);
    console.log('📝 Last login updated');

    // Set cookie
    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    console.log('✅ Login successful');
    return response;

  } catch (error) {
    console.error('❌ Login error:', error);
    return NextResponse.json(
      { error: 'Failed to login: ' + error.message },
      { status: 500 }
    );
  }
}