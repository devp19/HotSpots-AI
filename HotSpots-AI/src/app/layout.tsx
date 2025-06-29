import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "HotSpots AI",
  description: "ML-powered heat vulnerability model with 3D visualization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta property="og:title" content="HotSpots AI" />
        <meta property="og:description" content="Explore Toronto's heat vulnerability hotspots through interactive 3D mapping and data visualization!" />
        <meta property="og:image" content="/ogimage.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hotspots-ai.vercel.app/" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="HotSpots AI" />
        <meta name="twitter:description" content="Explore Toronto's heat vulnerability hotspots through interactive 3D mapping and data visualization!" />
        <meta name="twitter:image" content="/ogimage.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
