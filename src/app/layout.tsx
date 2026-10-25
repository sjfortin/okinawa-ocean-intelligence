import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kadena North Wall · Ocean / Okinawa",
  description: "Kadena North Wall weather, marine forecasts, and local references for shore diving and snorkeling planning.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

