"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/store/useCartStore";

export default function CartDrawer() {
 const { items, isOpen, closeCart, removeItem } = useCartStore();

 const subtotal = items.reduce((sum, item) => sum + item.price, 0);

 return (
  <>
   {/* Backdrop */}
   <div
    className={`fixed inset-0 bg-black/30 backdrop-blur-xs z-50 transition-opacity duration-700 ease-in-out ${
     isOpen
      ? "opacity-100 pointer-events-auto"
      : "opacity-0 pointer-events-none"
    }`}
    onClick={closeCart}
   />

   {/* Cart Drawer */}
   <aside
    className={`fixed top-0 right-0 bottom-0 w-[85vw] max-w-md bg-[#FAF9F6] text-black z-50 p-8 md:p-10 flex flex-col justify-between shadow-2xl transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
     isOpen ? "translate-x-0" : "translate-x-full"
    }`}
   >
    {/* Header */}
    <div className="flex justify-between items-center pb-6 border-b border-black/10">
     <div className="flex items-center gap-2">
      <span className="font-serif text-xl md:text-2xl font-medium tracking-wide">
       Your Cart
      </span>
      <span className="text-[10px] font-sans font-medium text-black/50 tracking-widest">
       ({items.length})
      </span>
     </div>
     <button
      onClick={closeCart}
      className="text-[10px] tracking-[0.25em] uppercase font-medium text-black hover:opacity-50 transition-opacity cursor-pointer"
     >
      Close ✕
     </button>
    </div>

    {/* Item List */}
    <div className="flex-1 overflow-y-auto py-6 space-y-6 scrollbar-thin">
     {items.length === 0 ? (
      <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
       <p className="text-xs tracking-widest uppercase text-black/50 font-medium">
        Your cart is currently empty
       </p>
       <button
        onClick={closeCart}
        className="text-[10px] tracking-[0.3em] uppercase underline underline-offset-4 font-medium hover:opacity-60 transition-opacity cursor-pointer"
       >
        Explore Collection
       </button>
      </div>
     ) : (
      items.map((item) => (
       <div
        key={item._id}
        className="flex gap-4 pb-6 border-b border-black/10 last:border-none"
       >
        <div className="relative w-20 h-28 bg-black/5 flex-shrink-0 overflow-hidden">
         {item.image && (
          <Image
           src={item.image}
           alt={item.title}
           fill
           className="object-cover"
          />
         )}
        </div>

        <div className="flex flex-col justify-between flex-1 py-0.5">
         <div className="space-y-1">
          <span className="text-[9px] tracking-[0.25em] uppercase text-black/40 font-medium block">
           1-of-1 Creation
          </span>
          <h3 className="font-serif text-lg font-medium leading-snug">
           {item.title}
          </h3>
          <p className="text-xs font-sans tracking-wide text-black/70">
           ₱{item.price.toLocaleString()}
          </p>
         </div>

         <button
          onClick={() => removeItem(item._id)}
          className="self-start text-[9px] tracking-[0.2em] uppercase text-black/50 hover:text-black hover:underline underline-offset-2 transition-all cursor-pointer"
         >
          Remove
         </button>
        </div>
       </div>
      ))
     )}
    </div>

    {/* Footer & Checkout Action */}
    {items.length > 0 && (
     <div className="pt-6 border-t border-black/10 space-y-6">
      <div className="space-y-2">
       <div className="flex justify-between items-center text-xs tracking-wider uppercase font-medium">
        <span>Subtotal</span>
        <span>₱{subtotal.toLocaleString()}</span>
       </div>
       <p className="text-[10px] text-black/50 tracking-wide font-normal">
        Taxes, shipping, and bespoke fitting details confirmed during order
        review.
       </p>
      </div>

      <div className="space-y-3">
       <Link
        href="/checkout"
        onClick={closeCart}
        className="block w-full bg-black text-white text-[10px] tracking-[0.3em] uppercase py-4 text-center font-medium hover:bg-black/80 transition-colors"
       >
        Request Order
       </Link>
       <button
        onClick={closeCart}
        className="block w-full border border-black/30 text-black text-[10px] tracking-[0.3em] uppercase py-4 text-center font-medium hover:border-black transition-colors cursor-pointer"
       >
        Continue Browsing
       </button>
      </div>
     </div>
    )}
   </aside>
  </>
 );
}
