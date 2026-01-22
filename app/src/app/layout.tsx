/**
 * Root layout for Content Engine application.
 * Provides global styles, metadata, and font configuration.
 */
import "../../styles/global.css";
import { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Content Engine - AI Video Creation",
  description:
    "Transform your ideas into polished YouTube Shorts and Instagram Reels with AI-powered video creation.",
  keywords: ["video", "ai", "shorts", "reels", "content creation"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
