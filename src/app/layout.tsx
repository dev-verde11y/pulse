import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Pulse - Streaming de Animes",
  description: "A melhor plataforma de streaming de animes com qualidade premium",
  keywords: "anime, streaming, video, entretenimento, series, filmes",
  authors: [{ name: "Pulse Team" }],
  creator: "Pulse",
  publisher: "Pulse",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Pulse",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192x192.png",
  },
  openGraph: {
    type: "website",
    siteName: "Pulse",
    title: "Pulse - Streaming de Animes",
    description: "A melhor plataforma de streaming de animes com qualidade premium",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pulse - Streaming de Animes",
    description: "A melhor plataforma de streaming de animes com qualidade premium",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3b82f6" },
    { media: "(prefers-color-scheme: dark)", color: "#3b82f6" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Execute immediately to prevent hydration mismatch
                if (document.documentElement.hasAttribute('data-arp')) {
                  document.documentElement.removeAttribute('data-arp');
                }
              })();
            `
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
          <PWAInstallPrompt />
        </AuthProvider>
      </body>
    </html>
  );
}
