import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function GET() {
  try {
    const cookieStore = cookies();
    let accessToken = cookieStore.get('labourlens_access_token')?.value;
    const refreshToken = cookieStore.get('labourlens_refresh_token')?.value;

    if (!accessToken && !refreshToken) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const isProd = process.env.NODE_ENV === 'production';
    let response: NextResponse | null = null;

    // Try fetching /auth/me with existing access token
    if (accessToken) {
      const backendRes = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Cookie': `accessToken=${accessToken}`,
        },
      });

      if (backendRes.ok) {
        const user = await backendRes.json();
        return NextResponse.json({
          authenticated: true,
          user,
        });
      }
    }

    // If access token is missing or expired, attempt refresh if refresh token is present
    if (refreshToken) {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `refreshToken=${refreshToken}`,
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        const newAccessToken = refreshData.accessToken;
        const newRefreshToken = refreshData.refreshToken;

        // Fetch /auth/me with the freshly rotated access token
        const meRes = await fetch(`${API_BASE_URL}/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${newAccessToken}`,
            'Cookie': `accessToken=${newAccessToken}`,
          },
        });

        if (meRes.ok) {
          const user = await meRes.json();
          response = NextResponse.json({
            authenticated: true,
            user,
          });

          // Update cookies with rotated tokens
          response.cookies.set('labourlens_access_token', newAccessToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            path: '/',
            maxAge: 15 * 60,
          });

          if (newRefreshToken) {
            response.cookies.set('labourlens_refresh_token', newRefreshToken, {
              httpOnly: true,
              secure: isProd,
              sameSite: 'lax',
              path: '/',
              maxAge: 7 * 24 * 60 * 60,
            });
          }

          if (user.roles) {
            response.cookies.set('labourlens_user_role', JSON.stringify(user.roles), {
              httpOnly: true,
              secure: isProd,
              sameSite: 'lax',
              path: '/',
              maxAge: 7 * 24 * 60 * 60,
            });
          }

          return response;
        }
      }
    }

    // If both access token and refresh failed, clear stale cookies
    const clearResponse = NextResponse.json(
      { authenticated: false, user: null, message: 'Session expired' },
      { status: 401 },
    );
    clearResponse.cookies.delete('labourlens_access_token');
    clearResponse.cookies.delete('labourlens_refresh_token');
    clearResponse.cookies.delete('labourlens_user_role');
    return clearResponse;
  } catch (error: any) {
    return NextResponse.json(
      { authenticated: false, user: null, message: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}
