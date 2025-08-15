import { NextResponse } from 'next/server';

export function middleware() {
  const res = NextResponse.next();
  if (process.env.VERCEL_ENV === 'preview') {
    res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }
  return res;
}

export const config = {
  matcher: ['/((?!_next|static|images|favicon.ico|robots.txt|sitemap.xml).*)'],
};

