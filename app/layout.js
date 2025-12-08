import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
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
       <Footer />
      </body>
    </html>
  );
}