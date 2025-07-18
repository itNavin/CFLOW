import "./globals.css"; // keep this!
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My App",
  description: "Using DB Heavent font globally",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
