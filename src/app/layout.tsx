import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { AppQueryProvider } from "@/lib/query-client";
import "./globals.css";

const title = "TerraScope AI — Real-Time Global Intelligence Platform";
const description =
  "A live 3D globe streaming earthquakes, weather, flights, wildfires, and air quality from public data feeds — plus an AI copilot that can answer questions against the live data.";

export const metadata: Metadata = {
  metadataBase: new URL("https://terrascope-ai.vercel.app"),
  title,
  description,
  openGraph: {
    title,
    description,
    url: "https://terrascope-ai.vercel.app",
    siteName: "TerraScope AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
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
