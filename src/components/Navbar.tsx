"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import MenuSidebar from "./MenuSidebar";
import CartDrawer from "./CartDrawer";
import { useCartStore } from "@/lib/store/useCartStore";
import type { Category, NavItem } from "@/lib/sanity/queries";

interface Product {
 _id: string;
 title: string;
 slug: string;
 price: number;
 imageUrl?: string;
}

interface NavbarProps {
 categories?: Category[];
 navItems?: NavItem[];
}

export default function Navbar({ navItems = [] }: NavbarProps) {
 const [isMenuOpen, setIsMenuOpen] = useState(false);
 const [isContactOpen, setIsContactOpen] = useState(false);
 const [isSearchOpen, setIsSearchOpen] = useState(false);
 const [isScrolled, setIsScrolled] = useState(false);
 const [isHovered, setIsHovered] = useState(false);
 const pathname = usePathname();

 // Search state
 const [searchQuery, setSearchQuery] = useState("");
 const [searchResults, setSearchResults] = useState<Product[]>([]);
 const [searchLoading, setSearchLoading] = useState(false);
 const searchInputRef = useRef<HTMLInputElement>(null);
 const searchContainerRef = useRef<HTMLDivElement>(null);

 const cartItems = useCartStore((state) => state.items);
 const openCart = useCartStore((state) => state.openCart);

 const isHomepage = pathname === "/";

 useEffect(() => {
  const handleScroll = () => {
   setIsScrolled(window.scrollY > 20);
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
 }, []);

 // Listen for custom event to open contact drawer from product details or anywhere else
 useEffect(() => {
  const handleOpenContact = () => {
   setIsMenuOpen(false);
   setIsSearchOpen(false);
   setIsContactOpen(true);
  };

  window.addEventListener("open-contact-drawer", handleOpenContact);
  return () => {
   window.removeEventListener("open-contact-drawer", handleOpenContact);
  };
 }, []);

 // Focus input when search opens
 useEffect(() => {
  if (isSearchOpen) {
   setTimeout(() => searchInputRef.current?.focus(), 50);
  } else {
   setSearchQuery("");
   setSearchResults([]);
  }
 }, [isSearchOpen]);

 // Click outside search container or press ESC to close
 useEffect(() => {
  const handleClickOutside = (e: MouseEvent) => {
   if (
    searchContainerRef.current &&
    !searchContainerRef.current.contains(e.target as Node)
   ) {
    setIsSearchOpen(false);
   }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
   if (e.key === "Escape") setIsSearchOpen(false);
   if ((e.metaKey || e.ctrlKey) && e.key === "k") {
    e.preventDefault();
    setIsSearchOpen((prev) => !prev);
   }
  };

  document.addEventListener("mousedown", handleClickOutside);
  window.addEventListener("keydown", handleKeyDown);
  return () => {
   document.removeEventListener("mousedown", handleClickOutside);
   window.removeEventListener("keydown", handleKeyDown);
  };
 }, []);

 // Debounced search query
 useEffect(() => {
  if (searchQuery.trim().length < 2) {
   setSearchResults([]);
   setSearchLoading(false);
   return;
  }

  setSearchLoading(true);
  const timer = setTimeout(async () => {
   try {
    const res = await fetch(
     `/api/products/search?q=${encodeURIComponent(searchQuery)}`,
    );
    const data = await res.json();
    setSearchResults(data.products || []);
   } catch (err) {
    console.error("Search error:", err);
   } finally {
    setSearchLoading(false);
   }
  }, 250);

  return () => clearTimeout(timer);
 }, [searchQuery]);

 const isSolid = !isHomepage || isScrolled || isHovered || isSearchOpen;
 const textColor = isSolid ? "text-black" : "text-white";
 const lineColor = isSolid ? "bg-black" : "bg-white";
 const strokeColor = isSolid ? "stroke-black" : "stroke-white";
 const badgeBg = isSolid ? "bg-black text-white" : "bg-white text-black";

 const closeDrawers = () => {
  setIsMenuOpen(false);
  setIsContactOpen(false);
  setIsSearchOpen(false);
 };

 return (
  <>
   <header
    onMouseEnter={() => setIsHovered(true)}
    onMouseLeave={() => setIsHovered(false)}
    className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-in-out ${
     isSolid
      ? "bg-white/95 backdrop-blur-md border-b border-black/10 shadow-[0_4px_20px_rgb(0,0,0,0.04)]"
      : "bg-transparent border-b border-transparent"
    }`}
   >
    <div className="relative w-full px-4 sm:px-6 md:px-10 h-20 flex items-center justify-between">
     {/* Left Controls: Menu & Search Icons */}
     <div
      className="flex items-center gap-3 sm:gap-5 relative"
      ref={searchContainerRef}
     >
      <button
       onClick={() => {
        closeDrawers();
        setIsMenuOpen(true);
       }}
       aria-label="Open Menu"
       className={`p-1.5 ${textColor} hover:opacity-70 transition-all duration-300 ease-in-out cursor-pointer group`}
      >
       <span className="w-5 flex flex-col gap-1.5">
        <span
         className={`h-[1.5px] ${lineColor} w-full transition-all duration-300 ease-in-out group-hover:w-3.5`}
        />
        <span
         className={`h-[1.5px] ${lineColor} w-full transition-all duration-300 ease-in-out`}
        />
       </span>
      </button>

      <button
       onClick={() => {
        const nextState = !isSearchOpen;
        closeDrawers();
        setIsSearchOpen(nextState);
       }}
       aria-label="Search"
       className={`p-1.5 ${textColor} hover:opacity-70 transition-all duration-300 ease-in-out cursor-pointer group`}
      >
       <svg
        className={`w-5 h-5 ${strokeColor} fill-none transition-all duration-300 ease-in-out group-hover:scale-110`}
        viewBox="0 0 24 24"
        strokeWidth="1.5"
       >
        <circle cx="11" cy="11" r="7" />
        <line x1="16" y1="16" x2="21" y2="21" />
       </svg>
      </button>

      {/* Anchored Search Panel */}
      {isSearchOpen && (
       <div className="absolute top-full left-0 mt-3 w-72 md:w-80 bg-[#FAF9F6] border border-black/10 shadow-2xl p-4 text-black z-50 animate-in fade-in slide-in-from-top-2 duration-300 ease-in-out">
        <div className="flex items-center gap-2.5 border-b border-black/20 pb-2">
         <svg
          className="w-4 h-4 stroke-black fill-none shrink-0"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
         >
          <circle cx="11" cy="11" r="7" />
          <line x1="16" y1="16" x2="21" y2="21" />
         </svg>
         <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="SEARCH CREATIONS..."
          className="w-full bg-transparent text-[10px] tracking-[0.2em] font-sans text-black placeholder:text-black/40 focus:outline-none"
         />
         <button
          onClick={() => setIsSearchOpen(false)}
          className="text-[10px] uppercase font-mono text-black/40 hover:text-black transition-all duration-300 ease-in-out shrink-0"
         >
          ✕
         </button>
        </div>

        <div className="mt-3">
         {searchLoading && (
          <p className="text-[9px] tracking-widest uppercase text-black/40 font-mono py-3 text-center animate-pulse">
           Searching...
          </p>
         )}

         {!searchLoading &&
          searchQuery.length >= 2 &&
          searchResults.length === 0 && (
           <p className="text-xs text-black/60 font-sans py-3 text-center">
            No matches found.
           </p>
          )}

         {!searchLoading && searchResults.length > 0 && (
          <div className="space-y-2">
           <span className="text-[8px] tracking-[0.25em] uppercase text-black/40 font-mono block border-b border-black/5 pb-1">
            Results ({searchResults.length})
           </span>

           <div className="max-h-56 overflow-y-auto divide-y divide-black/5">
            {searchResults.map((product) => (
             <Link
              key={product._id}
              href={`/product/${product.slug}`}
              onClick={() => setIsSearchOpen(false)}
              className="flex items-center justify-between py-2 hover:bg-black/5 px-1.5 transition-all duration-300 ease-in-out group"
             >
              <div className="flex items-center gap-2.5">
               {product.imageUrl && (
                <div className="w-7 h-9 relative bg-black/5 shrink-0">
                 <Image
                  src={product.imageUrl}
                  alt={product.title}
                  fill
                  className="object-cover"
                 />
                </div>
               )}
               <span className="text-xs font-serif text-black group-hover:opacity-70 transition-all duration-300 ease-in-out truncate max-w-[140px]">
                {product.title}
               </span>
              </div>
              <span className="text-[10px] font-mono text-black/60">
               ${product.price?.toLocaleString()}
              </span>
             </Link>
            ))}
           </div>
          </div>
         )}

         {searchQuery.length < 2 && (
          <p className="text-[8px] tracking-[0.2em] uppercase font-mono text-black/40 text-center py-1.5">
           Type 2+ characters to search
          </p>
         )}
        </div>
       </div>
      )}
     </div>

     {/* Centered Brand Logo */}
     <Link
      href="/"
      className={`absolute left-1/2 -translate-x-1/2 font-serif text-xs sm:text-sm md:text-3xl lg:text-4xl font-medium tracking-[0.15em] sm:tracking-[0.2em] md:tracking-[0.25em] ${textColor} uppercase transition-all duration-300 ease-in-out whitespace-nowrap`}
     >
      Nahi House
     </Link>

     {/* Right Controls */}
     <div className="flex items-center gap-4 sm:gap-6">
      {/* Track Order Icon */}
      <Link
       href="/track-order"
       aria-label="Track Order"
       className="hidden md:flex p-1.5 hover:opacity-70 transition-all duration-300 ease-in-out cursor-pointer group"
      >
       <svg
        className={`w-5 h-5 ${strokeColor} fill-none transition-all duration-300 ease-in-out group-hover:scale-110`}
        viewBox="0 0 24 24"
        strokeWidth="1.5"
       >
        <path
         strokeLinecap="round"
         strokeLinejoin="round"
         d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
        />
       </svg>
      </Link>

      {/* Contact Concierge Icon */}
      <button
       onClick={() => {
        closeDrawers();
        setIsContactOpen(true);
       }}
       aria-label="Contact Concierge"
       className="p-1.5 hover:opacity-70 transition-all duration-300 ease-in-out cursor-pointer group"
      >
       <svg
        className={`w-5 h-5 ${strokeColor} fill-none transition-all duration-300 ease-in-out group-hover:scale-110`}
        viewBox="0 0 24 24"
        strokeWidth="1.5"
       >
        <path
         strokeLinecap="round"
         strokeLinejoin="round"
         d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
        />
       </svg>
      </button>

      {/* Shopping Cart Bag Icon */}
      <button
       onClick={() => {
        closeDrawers();
        openCart();
       }}
       aria-label="Shopping Cart"
       className="p-1.5 hover:opacity-70 transition-all duration-300 ease-in-out cursor-pointer group relative flex items-center justify-center"
      >
       <svg
        className={`w-5 h-5 ${strokeColor} fill-none transition-all duration-300 ease-in-out group-hover:scale-110`}
        viewBox="0 0 24 24"
        strokeWidth="1.5"
       >
        <path
         strokeLinecap="round"
         strokeLinejoin="round"
         d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
        />
       </svg>
       {cartItems.length > 0 && (
        <span
         className={`absolute -top-1 -right-1.5 text-[9px] font-mono w-4 h-4 rounded-full flex items-center justify-center font-bold transition-all duration-300 ease-in-out ${badgeBg}`}
        >
         {cartItems.length}
        </span>
       )}
      </button>
     </div>
    </div>
   </header>

   {/* Dimmed Overlay */}
   <div
    className={`fixed inset-0 bg-black/20 backdrop-blur-xs z-30 transition-all duration-300 ease-in-out ${
     isMenuOpen || isContactOpen || isSearchOpen
      ? "opacity-100 pointer-events-auto"
      : "opacity-0 pointer-events-none"
    }`}
    onClick={closeDrawers}
   />

   <MenuSidebar
    isOpen={isMenuOpen}
    onClose={closeDrawers}
    navItems={navItems}
   />

   <CartDrawer />

   {/* Contact Concierge Sidebar */}
   <aside
    className={`fixed top-0 right-0 bottom-0 w-[85vw] max-w-md bg-[#FAF9F6] text-black z-50 p-8 md:p-12 flex flex-col justify-between shadow-2xl transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
     isContactOpen ? "translate-x-0" : "translate-x-full"
    }`}
   >
    <div className="flex justify-between items-center pb-8 border-b border-black/10">
     <span className="text-[10px] tracking-[0.25em] uppercase font-medium text-black/60">
      Client Care & Inquiries
     </span>
     <button
      onClick={() => setIsContactOpen(false)}
      className="text-[10px] tracking-[0.25em] uppercase font-medium text-black hover:opacity-50 transition-all duration-300 ease-in-out cursor-pointer"
     >
      Close ✕
     </button>
    </div>

    <div className="my-auto space-y-8 py-6">
     <h2 className="font-serif text-2xl md:text-3xl font-medium tracking-wide">
      Client Inquiries
     </h2>

     <div className="space-y-6">
      {/* Email */}
      <div className="space-y-1">
       <span className="text-[9px] tracking-[0.25em] uppercase text-black/60 block font-medium">
        Email
       </span>
       <a
        href="nahihouse@gmail.com"
        className="text-sm font-normal tracking-wide text-black hover:opacity-70 transition-opacity block"
       >
        concierge@nahihouse.com
       </a>
      </div>

      {/* Contact Number */}
      <div className="space-y-1">
       <span className="text-[9px] tracking-[0.25em] uppercase text-black/60 block font-medium">
        Direct Line
       </span>
       <a
        href="tel:+630288009000"
        className="text-sm font-normal tracking-wide text-black hover:opacity-70 transition-opacity block"
       >
        +63 (02) 8800 9000
       </a>
      </div>

      {/* Social Links */}
      <div className="space-y-3 pt-6 border-t border-black/10">
       <span className="text-[9px] tracking-[0.25em] uppercase text-black/60 block font-medium">
        Social Media
       </span>
       <div className="flex flex-col gap-2">
        <a
         href="https://www.instagram.com/nahi__house/"
         target="_blank"
         rel="noopener noreferrer"
         className="text-xs tracking-[0.15em] uppercase text-black hover:opacity-60 transition-opacity flex items-center justify-between py-2 border-b border-black/5"
        >
         <span>Instagram</span>
         <span className="text-[10px]">↗</span>
        </a>
       </div>
      </div>
     </div>
    </div>

    <div className="pt-8 border-t border-black/10 flex justify-between items-center text-[9px] tracking-[0.2em] uppercase font-medium text-black/60">
     <span>Manila</span>
     <span>•</span>
     <span>Paris</span>
     <span>•</span>
     <span>Tokyo</span>
    </div>
   </aside>
  </>
 );
}
