import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Okinawa Ocean Intelligence",
  description: "Site-specific planning intelligence for Okinawa snorkelers and divers.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

