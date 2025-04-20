import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const pathname = req.nextUrl.pathname;

  const isApiRoute = pathname.startsWith("/api/");
  if (isApiRoute) {
    return NextResponse.next(); // <--- langsung loloskan API, jangan diapa-apain
  }

  const protectedRoutes = ["/", "/survei"];
  const validRoutes = ["/", "/auth", "/not-found", "/survei"];
  const isRouteValid = (path) => validRoutes.includes(path);
  //  || path.startsWith("/camera/");
  // Jika halaman bukan valid route, redirect ke not-found
  if (!isRouteValid(pathname)) {
    return NextResponse.redirect(new URL("/not-found", req.url));
  }

  // Jika auth, izinkan akses tanpa token
  if (pathname === "/auth") {
    return NextResponse.next();
  }

  // Jika path = protectedRoutes dan tidak ada token, redirect ke login
  if (protectedRoutes.includes(pathname) && !token) {
    return NextResponse.redirect(new URL("/auth", req.url));
  }

  return NextResponse.next();
}
// export const config = {
//   matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
// };
// export const config = {
//   matcher: ["/:path*"]
// }
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public|models/|api/upload|.*\\.(?:svg|jpg|png|jpeg|gif|webp|json)$).*)",
  ],
};
