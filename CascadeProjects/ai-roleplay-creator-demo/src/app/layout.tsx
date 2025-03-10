import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SidebarMenu from "@/components/SidebarMenu";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Learning Experience Studio | Imperial College Business School",
  description: "Create immersive educational experiences with AI-powered learning interactions for Imperial College Business School faculty",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex min-h-screen">
          <SidebarMenu />
          <div className="flex-1 transition-all duration-300 ml-16 md:ml-16">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
