
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: "Care Clans",
  description: "A live trivia game for teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans antialiased flex flex-col">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <Toaster />
      </body>
    </html>
  );
}
