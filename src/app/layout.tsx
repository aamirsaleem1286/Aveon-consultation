import type { Metadata, Viewport } from "next";
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
  title: "AVEON (Private) Limited - Your Global Education Journey Starts Here",
  description: "Expert guidance and AI-powered insights to help you choose the right university, course and study destination. International education consultancy with offices in Islamabad and Kuala Lumpur.",
  keywords: ["education consultancy", "study abroad", "university guidance", "scholarships", "visa guidance", "AVEON", "Islamabad", "Kuala Lumpur"],
  authors: [{ name: "AVEON (Private) Limited" }],
  creator: "AVEON (Private) Limited",
  publisher: "AVEON (Private) Limited",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://aveon-consultancy.com",
    title: "AVEON (Private) Limited - Global Education Consultancy",
    description: "Expert guidance and AI-powered insights for your global education journey",
    siteName: "AVEON",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AVEON Education Consultancy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AVEON (Private) Limited",
    description: "Your Global Education Journey Starts With AVEON",
    images: ["/og-image.jpg"],
  },
  verification: {
    google: "google-site-verification-code",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0a0a0f" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0f" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.whatsapp.com" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}