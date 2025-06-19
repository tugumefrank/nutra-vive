import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Nutra-Vive | Premium Organic Juices & Herbal Teas",
    template: "%s | Nutra-Vive",
  },
  description:
    "Discover premium organic cold-pressed juices, herbal teas, and wellness beverages. Natural, delicious, and crafted for your health journey.",
  keywords: [
    "organic juice",
    "herbal tea",
    "cold pressed",
    "wellness",
    "natural beverages",
    "detox",
    "health drinks",
  ],
  authors: [{ name: "Nutra-Vive Team" }],
  creator: "Nutra-Vive",
  publisher: "Nutra-Vive",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Nutra-Vive",
    title: "Nutra-Vive | Premium Organic Juices & Herbal Teas",
    description:
      "Discover premium organic cold-pressed juices, herbal teas, and wellness beverages.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Nutra-Vive - Premium Organic Beverages",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nutra-Vive | Premium Organic Juices & Herbal Teas",
    description:
      "Discover premium organic cold-pressed juices, herbal teas, and wellness beverages.",
    images: ["/og-image.png"],
    creator: "@nutravive",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body className={`${inter.variable}  font-sans antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              <div className="relative flex min-h-screen flex-col">
                <div className="flex-1">{children}</div>
              </div>
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: "hsl(var(--background))",
                    color: "hsl(var(--foreground))",
                    border: "1px solid hsl(var(--border))",
                  },
                }}
              />
            </QueryProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
