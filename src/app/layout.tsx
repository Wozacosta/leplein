import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";

import { Analytics } from "@vercel/analytics/next";
import { GeolocationProvider } from "@/contexts/GeolocationContext";

import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "lepleink - Carburant moins cher",
  description: "Trouvez le carburant le moins cher près de chez vous",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${geist.variable} font-sans antialiased bg-gray-50`}>
        <GeolocationProvider>{children}</GeolocationProvider>
        <Analytics />
      </body>
    </html>
  );
}
