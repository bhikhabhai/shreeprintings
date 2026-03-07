import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/sidebar";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shree Printings — Attendance Management",
  description:
    "Admin dashboard for managing employee attendance, shifts, and salary computation at Shree Printings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="flex min-h-screen bg-slate-950">
          <Sidebar />
          <main className="ml-64 flex-1 overflow-auto">
            <div className="p-8">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
