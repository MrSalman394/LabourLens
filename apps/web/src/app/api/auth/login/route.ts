import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cnic, password, rememberMe } = body;

    const backendRes = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cnic, password }),
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(
        {
          message: backendRes.status === 401
            ? 'Invalid CNIC or password'
            : Array.isArray(data.message)
              ? data.message.join(', ')
              : data.message || 'Unable to sign in',
        },
        { status: backendRes.status },
      );
    }

    const { accessToken, refreshToken, user } = data;
    const isProd = process.env.NODE_ENV === 'production';

    const maxAge = rememberMe
      ? 7 * 24 * 60 * 60 // 7 days
      : 15 * 60; // 15 minutes

    const response = NextResponse.json({
      success: true,
      user,
    });

    // Set secure httpOnly cookies (Tokens NEVER stored in localStorage)
    response.cookies.set('labourlens_access_token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge,
    });

    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge,
    });

    response.cookies.set('labourlens_refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    // Store user role for Next.js Edge Middleware route verification
    response.cookies.set('labourlens_user_role', JSON.stringify(user.roles || []), {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'An error occurred during sign in' },
      { status: 500 },
    );
  }
}
