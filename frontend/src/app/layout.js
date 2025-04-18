import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers"; // Ganti dari cookies() ke headers()
import "./globals.css";
import LoadingBar from "@/app/components/loadingBar";
import LayoutMain from "@/app/components/layoutMain";
import { AuthProvider } from "@/app/context/authContext";
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: "Dishub Viana",
  description: "Viana",
};

export default function RootLayout({ children }) {
  // const cookieHeader = headers().get("cookie") || "";
  // const isAuthenticated = cookieHeader.includes("token="); // Periksa apakah ada token

  return (
    <html lang="en" data-theme="light" attribute="class">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <LayoutMain>
            <LoadingBar />
            {children}
          </LayoutMain>
        </AuthProvider>
      </body>
    </html>
  );
}
