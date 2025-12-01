import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
      <body className={`${geistSans.variable} ${geistMono.variable}`}>


        {/* ========== TOP BLACK BAR ========== */}
        <div className="w-full bg-black text-white text-sm py-2 px-6 flex justify-between">
          <span>100% HÀNG CHÍNH HÃNG</span>
          <span>GIAO HÀNG TOÀN QUỐC</span>
        </div>


        {/* ========== MAIN HEADER ========== */}
        <header className="w-full bg-white border-b border-gray-200 shadow-sm px-6 py-4 flex items-center justify-between">

          {/* LOGO */}
          <div className="flex items-center gap-3">
            <img src="/images/logo.png" className="h-12 w-auto" alt="Logo" />
            <span className="text-2xl font-bold text-black">E-Commerce Shop</span>
          </div>

          {/* SEARCH BAR */}
          <div className="flex-1 mx-10">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring focus:ring-red-300"
            />
          </div>

          {/* ICONS */}
          <div className="flex items-center gap-6 text-black text-xl">
            <i className="fa-solid fa-phone hover:text-red-600 cursor-pointer"></i>
            <i className="fa-solid fa-user hover:text-red-600 cursor-pointer"></i>
            <i className="fa-solid fa-cart-shopping hover:text-red-600 cursor-pointer"></i>
          </div>

        </header>


        {/* ========== RED MENU BAR ========== */}
      {/* ========== RED MENU BAR ========== */}
{/* ========== RED MENU BAR ========== */}
<nav className="w-full bg-red-600 text-white font-semibold px-6 py-3">
  <ul className="flex space-x-10">

    <li>
      <a href="#whey" className="hover:text-yellow-300">Whey Protein</a>
    </li>

    <li>
      <a href="#mass" className="hover:text-yellow-300">Mass Gainer</a>
    </li>

    <li>
      <a href="#vitamin" className="hover:text-yellow-300">Vitamin & Khoáng Chất</a>
    </li>

  </ul>
</nav>

        {/* MAIN CONTENT */}
        <main className="bg-white">{children}</main>


        {/* FOOTER */}
        <footer className="bg-white text-black p-4 rounded-lg shadow-md border border-gray-200 mt-12">
          <p>&copy; 2025 E-Commerce Shop. All rights reserved.</p>
        </footer>

      </body>
    </html>
  );
}
