import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function POST() {
  try {
    const cookieStore = cookies();
    const refreshToken = cookieStore.get('labourlens_refresh_token')?.value;

    if (refreshToken) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
      } catch {
        // Continue clearing cookies regardless
      }
    }

    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });

    // Clear all session cookies
    response.cookies.delete('labourlens_access_token');
    response.cookies.delete('accessToken');
    response.cookies.delete('labourlens_refresh_token');
    response.cookies.delete('refreshToken');
    response.cookies.delete('labourlens_user_role');

    return response;
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Logout failed' }, { status: 500 });
  }
}
