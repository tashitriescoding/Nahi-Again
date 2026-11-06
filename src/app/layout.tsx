import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import Navbar from "@/components/Navbar";
import { getSidebarNavigation } from "@/lib/sanity/queries";

import "./globals.css";

const serif = Cormorant_Garamond({
 subsets: ["latin"],
 variable: "--font-serif",
 weight: ["300", "400", "500"],
});

const sans = Montserrat({
 subsets: ["latin"],
 variable: "--font-sans",
 weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
 title: "NAHI HOUSE | Bespoke Haute Couture",
 description: "Made-to-order luxury garments crafted on demand.",
};

export default async function RootLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 const navItems = await getSidebarNavigation();

 return (
  <html
   lang="en"
   className={`${serif.variable} ${sans.variable} scroll-smooth`}
  >
   <body className="bg-white text-[#111111] antialiased selection:bg-black selection:text-white flex flex-col min-h-screen">
    <Navbar navItems={navItems} />
    <main className="flex-1 w-full">{children}</main>
    <footer className="border-t border-black/10 py-12 text-center text-[10px] tracking-widest uppercase opacity-60">
     © {new Date().getFullYear()} NAHI. All Rights Reserved.
    </footer>
   </body>
  </html>
 );
}
