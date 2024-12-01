// app/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Định nghĩa các routes được phép cho từng role
const STAFF_ALLOWED_PATHS = [
  '/staffmanage',
  '/products/exchange-eyeglass',
  '/sales/staff-orders',
  '/welcomestaff'
];

const ADMIN_ALLOWED_PATHS = [
  '/dashboard',
  '/products',
  '/adminmanage', 
  '/sales/orders',
  '/kiosk',
  '/coupons',
  '/welcomeadmin'
];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const roleId = request.cookies.get('roleId')?.value;
  const token = request.cookies.get('token')?.value;

  // Nếu không có token, redirect về login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Kiểm tra quyền dựa trên role
  if (roleId === '2') { // Staff
    const isAccessingAdminRoute = ADMIN_ALLOWED_PATHS.some(adminPath => 
      path.startsWith(`/en${adminPath}`) || path.startsWith(`/vi${adminPath}`)
    );

    if (isAccessingAdminRoute) {
      return NextResponse.redirect(new URL('/en/welcomestaff', request.url));
    }
  } else if (roleId === '3') { // Admin
    const isAccessingStaffRoute = STAFF_ALLOWED_PATHS.some(staffPath => 
      path.startsWith(`/en${staffPath}`) || path.startsWith(`/vi${staffPath}`)
    );

    if (isAccessingStaffRoute) {
      return NextResponse.redirect(new URL('/en/welcomeadmin', request.url));
    }
  }

  return NextResponse.next();
}

// Cấu hình middleware chạy trên những routes nào
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/products/:path*',
    '/adminmanage/:path*',
    '/staffmanage/:path*',
    '/sales/:path*',
    '/kiosk/:path*',
    '/coupons/:path*',
    '/welcomeadmin',
    '/welcomestaff'
  ]
}