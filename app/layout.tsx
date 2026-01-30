import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sbacem - Fonogramas",
  description: "Gerenciamento inteligente de fonogramas",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-br" className="dark"> 
      <body
        className={`${geistSans.variable} antialiased bg-[#131314] text-[#e3e3e3] selection:bg-blue-500/30`}
      >
        {/* Estrutura principal estilo Gemini */}
        <div className="flex h-screen overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}