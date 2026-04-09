import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CubeCoach",
  description: "AI-powered Rubik's Cube coaching",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
