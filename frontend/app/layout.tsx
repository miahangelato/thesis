import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ConsentProvider } from "../contexts/ConsentContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Printalyzer",
  description: "Your fingerprint, your health insights.",
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
        <ConsentProvider>{children}</ConsentProvider>
      </body>
    </html>
  );
}
