import type { Metadata } from "next";
import { Libre_Franklin } from "next/font/google";
import Navbar from "@/components/site/nav/Navbar";
import Footer from "@/components/site/footer/Footer"
import "./globals.css";

const libreFranklin = Libre_Franklin({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-libre-franklin",
  adjustFontFallback: false, // Disables automatic fallback generation
  fallback: ["sans-serif"], // Manual fallback chain
});

export const metadata: Metadata = {
  title: "Portfolio Website",
  description: "Max Lichter Portfolio",
    icons: {
    icon: "/images/other/logoWhite.png", 
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />

        <link rel="icon" type="image/png" href="/images/other/logoWhite.png" />
      </head>
      <body className={`${libreFranklin.variable} antialiased`}>
        <Navbar />
        <main className=" bg-[#FBFBFB]">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}