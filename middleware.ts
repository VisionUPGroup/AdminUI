// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Lấy và validate thông tin auth
  const roleId = request.cookies.get('roleId')?.value
  const token = request.cookies.get('token')?.value

  console.log("Access attempt - Path:", path, "RoleId:", roleId) // Log để debug

  // 1. Check token exists
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. Check roleId exists
  if (!roleId) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 3. Validate role permissions
  const adminRoutes = [
    '/adminmanage',
    '/dashboard', 
    '/welcomeadmin'
  ]

  const staffRoutes = [
    '/staffmanage',
    '/welcomestaff'
  ]

  // Convert path to base route without language prefix
  const baseRoute = path.replace(/^\/(en|vi)/, '')

  // Check if current path matches any admin routes
  const isAdminRoute = adminRoutes.some(route => baseRoute.startsWith(route))
  
  // Check if current path matches any staff routes  
  const isStaffRoute = staffRoutes.some(route => baseRoute.startsWith(route))

  // Staff restrictions
  if (roleId === '2' && isAdminRoute) {
    console.log("Staff attempting to access admin route - redirecting")
    return NextResponse.redirect(new URL('/en/welcomestaff', request.url))
  }

  // Admin restrictions  
  if (roleId === '3' && isStaffRoute) {
    console.log("Admin attempting to access staff route - redirecting")
    return NextResponse.redirect(new URL('/en/welcomeadmin', request.url))
  }

  return NextResponse.next()
}

// Cập nhật matcher để cover tất cả routes cần bảo vệ
export const config = {
  matcher: [
    '/:locale(en|vi)/(dashboard|products|adminmanage|staffmanage|sales|kiosk|welcomeadmin|welcomestaff)/:path*'
  ]
}