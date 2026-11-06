"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store/useCartStore";

export default function CheckoutPage() {
 const [mounted, setMounted] = useState(false);
 const { items, clearCart } = useCartStore();
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [errorMessage, setErrorMessage] = useState<string | null>(null);
 const router = useRouter();

 const [formData, setFormData] = useState({
  fullName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  country: "",
  postalCode: "",
  notes: "",
 });

 useEffect(() => {
  setMounted(true);
 }, []);

 if (!mounted) {
  return (
   <div className="min-h-screen pt-32 pb-24 px-6 max-w-7xl mx-auto flex items-center justify-center">
    <span className="text-xs tracking-[0.3em] uppercase text-black/40 animate-pulse">
     Loading Checkout...
    </span>
   </div>
  );
 }

 const subtotal = items.reduce((sum, item) => sum + (item.price || 0), 0);

 const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
 ) => {
  setFormData({ ...formData, [e.target.name]: e.target.value });
 };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  setErrorMessage(null);

  try {
   console.log("2. Checkout Items Payload:", items);
   const response = await fetch("/api/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
     client: formData,
     items: items.map((i: any) => ({
      productId: i._id || i.id || "",
      // Checks common variations in case your store object uses a different key
      productCode:
       i.productCode || i.code || i.sku || i.slug?.current || i.slug || "",
      title: i.title || "Untitled Creation",
      price: i.price || 0,
      quantity: i.quantity || 1,
     })),
     subtotal,
    }),
   });

   const data = await response.json().catch(() => ({}));

   // Handle failed API responses without throwing exceptions
   if (!response.ok) {
    console.error("API Order Error (Status", response.status, "):", data);

    const rawError = data?.error;
    const message =
     typeof rawError === "string"
      ? rawError
      : rawError?.message ||
        (Array.isArray(rawError) ? rawError[0]?.message : null) ||
        `Server error (Status ${response.status})`;

    setErrorMessage(message);
    setIsSubmitting(false);
    return;
   }

   const rawOrderId =
    data?.orderId || data?._id || data?.id || data?.documentId;
   const generatedOrderId = rawOrderId ? String(rawOrderId).trim() : "";

   if (!generatedOrderId) {
    console.error("API response missing reference code:", data);
    setErrorMessage(
     "Order was recorded, but server returned no Reference Code.",
    );
    setIsSubmitting(false);
    return;
   }

   clearCart();
   router.push(`/order-confirmation/${encodeURIComponent(generatedOrderId)}`);
  } catch (err: any) {
   console.error("Network or submit error:", err);
   setErrorMessage("Failed to transmit request. Please check server logs.");
  } finally {
   setIsSubmitting(false);
  }
 };

 if (items.length === 0) {
  return (
   <div className="min-h-screen pt-32 pb-24 px-6 max-w-md mx-auto text-center flex flex-col justify-center items-center">
    <h1 className="font-serif text-2xl md:text-3xl font-medium mb-4">
     Your Selection is Empty
    </h1>
    <p className="text-xs text-black/60 mb-8 leading-relaxed">
     Please select a creation from our active collection before requesting an
     order.
    </p>
    <Link
     href="/collection"
     className="bg-black text-white text-[10px] tracking-[0.3em] uppercase py-4 px-8 font-medium hover:bg-black/80 transition-colors"
    >
     Explore Collection
    </Link>
   </div>
  );
 }

 return (
  <div className="min-h-screen pt-28 md:pt-36 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
   <div className="mb-12 border-b border-black/10 pb-6">
    <span className="text-[10px] font-sans font-medium tracking-[0.3em] uppercase text-black/50 block mb-2">
     Concierge Order Request
    </span>
    <h1 className="font-serif text-3xl md:text-5xl font-medium tracking-wide">
     Private Client Checkout
    </h1>
   </div>

   <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
    <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-8">
     {errorMessage && (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs tracking-wide font-sans">
       {errorMessage}
      </div>
     )}

     <div className="space-y-6">
      <h2 className="text-xs tracking-[0.25em] uppercase font-medium text-black/60 border-b border-black/10 pb-3">
       1. Contact Information
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
       <div>
        <label className="block text-[10px] uppercase tracking-widest text-black/70 mb-2 font-medium">
         Full Name *
        </label>
        <input
         required
         type="text"
         name="fullName"
         value={formData.fullName}
         onChange={handleChange}
         placeholder="E.g. Gabriel Vance"
         className="w-full bg-[#FAF9F6] border border-black/15 p-3 text-xs tracking-wide text-black focus:outline-none focus:border-black transition-colors"
        />
       </div>
       <div>
        <label className="block text-[10px] uppercase tracking-widest text-black/70 mb-2 font-medium">
         Email Address *
        </label>
        <input
         required
         type="email"
         name="email"
         value={formData.email}
         onChange={handleChange}
         placeholder="client@nahihouse.com"
         className="w-full bg-[#FAF9F6] border border-black/15 p-3 text-xs tracking-wide text-black focus:outline-none focus:border-black transition-colors"
        />
       </div>
      </div>

      <div>
       <label className="block text-[10px] uppercase tracking-widest text-black/70 mb-2 font-medium">
        Phone Number (for Private Delivery) *
       </label>
       <input
        required
        type="tel"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        placeholder="+63 900 000 0000"
        className="w-full bg-[#FAF9F6] border border-black/15 p-3 text-xs tracking-wide text-black focus:outline-none focus:border-black transition-colors"
       />
      </div>
     </div>

     <div className="space-y-6 pt-4">
      <h2 className="text-xs tracking-[0.25em] uppercase font-medium text-black/60 border-b border-black/10 pb-3">
       2. Shipping Destination
      </h2>
      <div>
       <label className="block text-[10px] uppercase tracking-widest text-black/70 mb-2 font-medium">
        Street Address *
       </label>
       <input
        required
        type="text"
        name="address"
        value={formData.address}
        onChange={handleChange}
        placeholder="Avenue, Suite, Residence"
        className="w-full bg-[#FAF9F6] border border-black/15 p-3 text-xs tracking-wide text-black focus:outline-none focus:border-black transition-colors"
       />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
       <div>
        <label className="block text-[10px] uppercase tracking-widest text-black/70 mb-2 font-medium">
         City *
        </label>
        <input
         required
         type="text"
         name="city"
         value={formData.city}
         onChange={handleChange}
         className="w-full bg-[#FAF9F6] border border-black/15 p-3 text-xs tracking-wide text-black focus:outline-none focus:border-black transition-colors"
        />
       </div>
       <div>
        <label className="block text-[10px] uppercase tracking-widest text-black/70 mb-2 font-medium">
         Country *
        </label>
        <input
         required
         type="text"
         name="country"
         value={formData.country}
         onChange={handleChange}
         className="w-full bg-[#FAF9F6] border border-black/15 p-3 text-xs tracking-wide text-black focus:outline-none focus:border-black transition-colors"
        />
       </div>
       <div>
        <label className="block text-[10px] uppercase tracking-widest text-black/70 mb-2 font-medium">
         Postal Code *
        </label>
        <input
         required
         type="text"
         name="postalCode"
         value={formData.postalCode}
         onChange={handleChange}
         className="w-full bg-[#FAF9F6] border border-black/15 p-3 text-xs tracking-wide text-black focus:outline-none focus:border-black transition-colors"
        />
       </div>
      </div>
     </div>

     <div className="space-y-4 pt-4">
      <h2 className="text-xs tracking-[0.25em] uppercase font-medium text-black/60 border-b border-black/10 pb-3">
       3. Bespoke Inquiries & Tailoring Notes (Optional)
      </h2>
      <textarea
       name="notes"
       rows={4}
       value={formData.notes}
       onChange={handleChange}
       placeholder="Specify height, proportions, or specific delivery timelines for our master tailors..."
       className="w-full bg-[#FAF9F6] border border-black/15 p-3 text-xs tracking-wide text-black focus:outline-none focus:border-black transition-colors resize-none"
      />
     </div>

     <button
      type="submit"
      disabled={isSubmitting}
      className="w-full bg-black text-white text-[10px] tracking-[0.3em] uppercase py-5 font-medium hover:bg-black/80 transition-colors disabled:opacity-50 cursor-pointer"
     >
      {isSubmitting
       ? "Transmitting Order Request..."
       : "Submit Bespoke Request"}
     </button>
    </form>

    <div className="lg:col-span-5 bg-[#FAF9F6] border border-black/10 p-6 md:p-8 h-fit space-y-6">
     <h2 className="text-xs tracking-[0.25em] uppercase font-medium text-black border-b border-black/10 pb-4">
      Order Selection ({items.length})
     </h2>

     <div className="space-y-6 max-h-[380px] overflow-y-auto pr-2">
      {items.map((item) => (
       <div
        key={item._id}
        className="flex gap-4 pb-4 border-b border-black/10 last:border-none"
       >
        <div className="relative w-16 h-22 bg-black/5 flex-shrink-0">
         {item.image && (
          <Image
           src={item.image}
           alt={item.title || "Product Image"}
           fill
           className="object-cover"
          />
         )}
        </div>
        <div className="flex flex-col justify-center space-y-1">
         <span className="text-[8px] uppercase tracking-[0.2em] text-black/40 font-medium">
          1-of-1 Piece
         </span>
         <h3 className="font-serif text-base font-medium">{item.title}</h3>
         <p className="text-xs font-sans tracking-wide text-black/70">
          ₱{(item.price || 0).toLocaleString()}
         </p>
        </div>
       </div>
      ))}
     </div>

     <div className="border-t border-black/10 pt-4 space-y-2">
      <div className="flex justify-between items-center text-xs tracking-wider uppercase font-medium">
       <span>Estimated Subtotal</span>
       <span>₱{subtotal.toLocaleString()}</span>
      </div>
      <p className="text-[10px] text-black/50 leading-relaxed font-normal">
       Final costs including localized taxes and white-glove shipping are
       validated upon approval.
      </p>
     </div>
    </div>
   </div>
  </div>
 );
}
