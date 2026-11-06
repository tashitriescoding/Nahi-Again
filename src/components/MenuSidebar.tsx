"use client";

import Link from "next/link";
import type { NavItem } from "@/lib/sanity/queries";

interface MenuSidebarProps {
 isOpen: boolean;
 onClose: () => void;
 navItems?: NavItem[];
}

export default function MenuSidebar({
 isOpen,
 onClose,
 navItems = [],
}: MenuSidebarProps) {
 // 1. Find Shop All and Track Order from queries (so they stay connected to your backend)
 const shopItem = navItems.find(
  (item) => item.label.toLowerCase() === "shop all",
 ) || { label: "Shop All", href: "/collection" };

 const trackItem = navItems.find(
  (item) => item.label.toLowerCase() === "track order",
 ) || { label: "Track Order", href: "/track-order" };

 // 2. Filter out all 3 permanent items so they don't duplicate in the dynamic list
 const filteredNavItems = navItems.filter((item) => {
  const label = item.label.toLowerCase();
  return !["shop all", "about us", "track order"].includes(label);
 });

 return (
  <aside
   className={`fixed top-0 left-0 bottom-0 w-[85vw] max-w-md bg-[#FAF9F6]/95 backdrop-blur-md border-r border-black/10 text-black z-50 shadow-2xl transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
    isOpen ? "translate-x-0" : "-translate-x-full"
   }`}
  >
   <div className="pt-8 px-8 pb-6 flex justify-start">
    <button
     onClick={onClose}
     className="p-1 -ml-1 text-black/70 hover:text-black transition-colors cursor-pointer"
     aria-label="Close Menu"
    >
     <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
     >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
     </svg>
    </button>
   </div>

   <div className="mx-8 border-b border-black/10" />

   <nav className="mt-8 px-8 flex flex-col space-y-5">
    {/* --- PERMANENT LINKS --- */}

    {/* Shop All (Connected to Queries) */}
    <Link
     href={shopItem.href}
     onClick={onClose}
     className="text-base md:text-lg font-sans font-medium tracking-wider text-black hover:opacity-60 hover:translate-x-1 transition-all duration-300"
    >
     {shopItem.label}
    </Link>

    {/* Track Order (Connected to Queries) */}
    <Link
     href={trackItem.href}
     onClick={onClose}
     className="text-base md:text-lg font-sans font-medium tracking-wider text-black hover:opacity-60 hover:translate-x-1 transition-all duration-300"
    >
     {trackItem.label}
    </Link>

    {/* About Us (Hardcoded to Instagram) */}
    <a
     href="https://www.instagram.com/p/Db0QfXbAfBs/?img_index=1"
     target="_blank"
     rel="noopener noreferrer"
     onClick={onClose}
     className="text-base md:text-lg font-sans font-medium tracking-wider text-black hover:opacity-60 hover:translate-x-1 transition-all duration-300"
    >
     About Us
    </a>

    {/* Optional divider before CMS categories */}
    {filteredNavItems.length > 0 && (
     <div className="w-8 border-b border-black/10 my-2 pt-2" />
    )}

    {/* --- DYNAMIC SANITY LINKS --- */}
    {filteredNavItems.map((item) => (
     <Link
      key={item.label}
      href={item.href}
      onClick={onClose}
      className="text-base md:text-lg font-sans font-medium tracking-wider text-black/70 hover:text-black hover:translate-x-1 transition-all duration-300"
     >
      {item.label}
     </Link>
    ))}
   </nav>

   <div className="absolute bottom-12 left-8 flex flex-col space-y-4">
    <span className="text-[10px] font-sans font-medium tracking-[0.25em] uppercase text-black/40">
     Made-To-Order & Bespoke Atelier
    </span>
   </div>
  </aside>
 );
}
