import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const pathname = req.nextUrl.pathname;

  const isApiRoute = pathname.startsWith("/api/");
  if (isApiRoute) {
    return NextResponse.next();
  }

  const protectedRoutes = ["/", "/cctvTest", "/survei-proporsi", "/manajemen-kamera", "/survei-pergerakan", "/survei-simpang", "/survei-lhrk", "/trainning-export", "/form-sa-ii", "/form-sa-i", "/form-sa-iii", "/form-sa-iv"];
  const validRoutes = ["/", "/auth", "/not-found", "/cctvTest", "/simpang", "/manajemen-kamera","/survei-pergerakan", "/survei-simpang", "/survei-lhrk", "/survei-proporsi", "/trainning-export", "/form-sa-ii", "/form-sa-i", "/form-sa-iii", "/form-sa-iv"];
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
