import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "E-Commerce Shop",
  description: "An online store with amazing products.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* HEADER (HeroUI + top bar + menu đỏ) */}
        <Header />

        {/* MAIN CONTENT */}
        <main className="bg-white">{children}</main>

        {/* FOOTER */}
        <footer className="bg-white text-black p-4 rounded-lg shadow-md border border-gray-200 mt-12">
          <p>&copy; 2025 E-Commerce Shop. All rights reserved.</p>
           <span className="text-xs text-gray-500">
    Hotline: 0909 999 999 • Mở cửa 8:00 – 22:00
  </span>
        </footer>
      </body>
    </html>
  );
}