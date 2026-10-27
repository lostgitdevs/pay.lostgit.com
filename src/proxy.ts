import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js 16 Proxy (replaces middleware.ts).
 * Handles Supabase auth session refresh and route protection.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Create a response to pass through
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session — this is critical for server components
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // --- Route protection ---

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/terms',
    '/privacy',
    '/refund-policy',
    '/contact',
    '/payment/success',
    '/payment/failed',
    '/payment/pending',
  ];

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route
  );
  const isPaymentLink = pathname.startsWith('/pay/');
  const isApiRoute = pathname.startsWith('/api/');
  const isStaticAsset = pathname.startsWith('/_next/') || pathname.startsWith('/favicon');

  // Allow public routes, payment links, API routes (they handle their own auth), and static assets
  if (isPublicRoute || isPaymentLink || isApiRoute || isStaticAsset) {
    return supabaseResponse;
  }

  // Protected routes — redirect to login if not authenticated
  if (!user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Admin/staff routes — require additional role check (done in layout/page level)
  // Client routes — require client role (done in layout/page level)
  // We don't check roles here because proxy can't access the database.
  // Role checks happen in the server components and API route handlers.

  // Set security headers
  supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff');
  supabaseResponse.headers.set('X-Frame-Options', 'DENY');
  supabaseResponse.headers.set('X-XSS-Protection', '1; mode=block');
  supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
