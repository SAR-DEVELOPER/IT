import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ThemeProviderWrapper from "../components/providers/ThemeProviderWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IT Operations | SAR Tax & Management Consultant",
  description: "IT Infrastructure and Service Management Platform - SAR Tax & Management Consultant",
};

/**
 * Root Layout for IT Operations App
 *
 * Authentication is handled by:
 * - middleware.ts: Route protection and auth checks
 * - lib/auth/client.ts: Client-side user info utilities
 * - lib/hooks/useAuth.ts: React hook for accessing user data in components
 *
 * This layout remains simple and delegates auth concerns to the middleware layer.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProviderWrapper>
          {children}
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}
