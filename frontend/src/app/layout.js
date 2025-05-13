import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers"; // Ganti dari cookies() ke headers()
import "./globals.css";
import LoadingBar from "@/app/components/loadingBar";
import LayoutMain from "@/app/components/layoutMain";
import { AuthProvider } from "@/app/context/authContext";
import { Suspense } from "react";
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: "Dishub Viana",
  description: "Viana",
};

export function PageLoadingFallback() {
  return <div className="flex items-center justify-center min-h-screen">
    <div className="animate-pulse text-center">
      <div className="h-8 w-32 bg-gray-200 rounded mb-4 mx-auto"></div>
      <div className="h-4 w-48 bg-gray-200 rounded mx-auto"></div>
    </div>
  </div>;
}

export default function RootLayout({ children }) {
  // const cookieHeader = headers().get("cookie") || "";
  // const isAuthenticated = cookieHeader.includes("token="); // Periksa apakah ada token

  return (
    <html lang="en" data-theme="light" attribute="class">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <LayoutMain>
            <LoadingBar />
            <Suspense fallback={<PageLoadingFallback/>}>
              {children}
            </Suspense>
          </LayoutMain>
        </AuthProvider>
      </body>
    </html>
  );
}
