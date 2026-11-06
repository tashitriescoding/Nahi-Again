"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

interface Product {
 _id: string;
 title: string;
 slug: string;
 price: number;
 imageUrl?: string;
}

interface SearchModalProps {
 isOpen: boolean;
 onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
 const [query, setQuery] = useState("");
 const [results, setResults] = useState<Product[]>([]);
 const [loading, setLoading] = useState(false);
 const inputRef = useRef<HTMLInputElement>(null);

 // Focus input on open & listen for ESC key
 useEffect(() => {
  if (isOpen) {
   setTimeout(() => inputRef.current?.focus(), 50);
   document.body.style.overflow = "hidden";
  } else {
   document.body.style.overflow = "unset";
   setQuery("");
   setResults([]);
  }

  const handleKeyDown = (e: KeyboardEvent) => {
   if (e.key === "Escape" && isOpen) onClose();
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => {
   window.removeEventListener("keydown", handleKeyDown);
   document.body.style.overflow = "unset";
  };
 }, [isOpen, onClose]);

 // Debounced Search API call
 useEffect(() => {
  if (query.trim().length < 2) {
   setResults([]);
   setLoading(false);
   return;
  }

  setLoading(true);
  const timer = setTimeout(async () => {
   try {
    const res = await fetch(
     `/api/products/search?q=${encodeURIComponent(query)}`,
    );
    const data = await res.json();
    setResults(data.products || []);
   } catch (err) {
    console.error("Error searching products:", err);
   } finally {
    setLoading(false);
   }
  }, 300);

  return () => clearTimeout(timer);
 }, [query]);

 if (!isOpen) return null;

 return (
  <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
   {/* Backdrop */}
   <div
    className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
    onClick={onClose}
   />

   {/* Modal Card */}
   <div className="relative bg-white w-full max-w-2xl shadow-2xl border border-stone-200 z-10 overflow-hidden font-sans">
    {/* Search Header */}
    <div className="flex items-center border-b border-stone-200 px-6 py-4">
     <svg
      className="w-4 h-4 text-stone-400 mr-3 shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
     >
      <path
       strokeLinecap="round"
       strokeLinejoin="round"
       strokeWidth={1.5}
       d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
     </svg>

     <input
      ref={inputRef}
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search luxury creations, apparel, objects..."
      className="w-full text-sm font-serif placeholder:font-sans placeholder:text-stone-400 focus:outline-none text-stone-900 bg-transparent"
     />

     {query && (
      <button
       onClick={() => setQuery("")}
       className="text-stone-400 hover:text-stone-900 text-xs uppercase font-mono px-2"
      >
       Clear
      </button>
     )}

     <button
      onClick={onClose}
      className="ml-3 text-stone-400 hover:text-stone-900 text-xs font-mono tracking-widest uppercase border border-stone-200 px-2 py-1"
     >
      ESC
     </button>
    </div>

    {/* Results Area */}
    <div className="max-h-[60vh] overflow-y-auto p-6">
     {loading && (
      <p className="text-center text-xs text-stone-400 font-mono py-8 tracking-widest uppercase animate-pulse">
       Searching Atelier Archives...
      </p>
     )}

     {!loading && query.length >= 2 && results.length === 0 && (
      <div className="text-center py-10">
       <p className="text-stone-500 font-serif text-sm">
        No creations found matching &ldquo;{query}&rdquo;
       </p>
       <p className="text-stone-400 text-xs mt-1">
        Try searching for specific collections or materials.
       </p>
      </div>
     )}

     {!loading && results.length > 0 && (
      <div className="space-y-4">
       <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-mono mb-3">
        Atelier Results ({results.length})
       </p>

       <div className="grid grid-cols-1 divide-y divide-stone-100">
        {results.map((product) => (
         <Link
          key={product._id}
          href={`/product/${product.slug}`}
          onClick={onClose}
          className="flex items-center gap-4 py-3 group hover:bg-stone-50 transition px-2"
         >
          <div className="w-12 h-14 bg-stone-100 relative shrink-0 overflow-hidden border border-stone-200">
           {product.imageUrl ? (
            <Image
             src={product.imageUrl}
             alt={product.title}
             fill
             className="object-cover group-hover:scale-105 transition duration-500"
            />
           ) : (
            <div className="w-full h-full flex items-center justify-center text-[9px] font-mono text-stone-400">
             NH
            </div>
           )}
          </div>

          <div className="flex-1 min-w-0">
           <h4 className="text-stone-900 font-serif text-sm group-hover:text-stone-600 transition truncate">
            {product.title}
           </h4>
           <p className="text-xs text-stone-500 font-mono mt-0.5">
            ${product.price?.toLocaleString()}
           </p>
          </div>

          <span className="text-stone-400 group-hover:text-stone-900 text-xs font-mono transition pr-2">
           View →
          </span>
         </Link>
        ))}
       </div>
      </div>
     )}

     {!query && (
      <div className="text-center py-8">
       <p className="text-xs uppercase tracking-widest text-stone-400 font-mono">
        Press ESC or click outside to dismiss
       </p>
      </div>
     )}
    </div>
   </div>
  </div>
 );
}
