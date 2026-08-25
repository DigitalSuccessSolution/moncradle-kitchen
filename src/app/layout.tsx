import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import KitchenAppShell from "@/components/KitchenAppShell";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MONCRADEL - Cloud Kitchen Portal",
  description: "Pediatric Meal Production, Recipe Management & Inventory Control for Cloud Kitchens",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MONCRADEL Kitchen",
  },
};

export const viewport: Viewport = {
  themeColor: "#A5D8FF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-[#F8F9FA] text-slate-800 antialiased selection:bg-[#A5D8FF] font-sans overflow-x-hidden"
        suppressHydrationWarning
      >
        <KitchenAppShell>{children}</KitchenAppShell>
      </body>
    </html>
  );
}
