import type { Metadata } from "next";
import { Poppins, Playfair_Display } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='10' fill='%23c8a45a'/%3E%3Ctext x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' font-family='Georgia,serif' font-style='italic' font-weight='600' font-size='34' fill='white'%3EIJ%3C/text%3E%3C/svg%3E";

const OG_IMAGE =
  "https://images.pexels.com/photos/210186/pexels-photo-210186.jpeg?auto=compress&cs=tinysrgb&w=1600";

export const metadata: Metadata = {
  title: "Imperial Journeys — The World, Beautifully Curated",
  description:
    "Imperial Journeys — A travel brand of Imperial Healthcare Systems Pvt Ltd. Cinematic, bespoke journeys across India and the world.",
  icons: { icon: FAVICON },
  openGraph: {
    type: "website",
    title: "Imperial Journeys — The World, Beautifully Curated",
    description:
      "Cinematic, bespoke journeys across India and the world.",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Imperial Journeys — The World, Beautifully Curated",
    description: "Cinematic, bespoke journeys across India and the world.",
    images: [OG_IMAGE],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  );
}
