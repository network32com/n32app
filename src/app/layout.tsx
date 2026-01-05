import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "sonner";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Network32 - Professional Dental Network",
    template: "%s | Network32",
  },
  description: "Connect, share, and learn with dental professionals worldwide. The exclusive community for clinical excellence, case sharing, and practice growth.",
  keywords: ["dentistry", "dental network", "clinical cases", "dental education", "dentist community", "practice growth"],
  authors: [{ name: "Network32 Team" }],
  creator: "Network32",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://network32.com",
    title: "Network32 - Professional Dental Network",
    description: "Connect, share, and learn with dental professionals worldwide.",
    siteName: "Network32",
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "Network32 Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Network32 - Professional Dental Network",
    description: "Connect, share, and learn with dental professionals worldwide.",
    images: ["/logo.svg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {process.env.NODE_ENV === "development" && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
