import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { AppQueryProvider } from "@/lib/query-client";
import "./globals.css";

export const metadata: Metadata = {
  title: "TerraScope AI — Real-Time Global Intelligence Platform",
  description:
    "A live 3D globe streaming earthquakes, weather, and flight activity from public intelligence feeds.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} dark`}>
      <body>
        <AppQueryProvider>{children}</AppQueryProvider>
      </body>
    </html>
  );
}
