"use client";

import { useState } from "react";
import Link from "next/link";

interface Order {
 _id: string;
 orderId: string;
 status: "pending" | "paid" | "fulfilled";
 client: { fullName: string; email: string };
 subtotal: number;
 createdAt: string;
 items: Array<{ title: string; price: number }>;
}

export default function TrackOrderPage() {
 const [query, setQuery] = useState("");
 const [loading, setLoading] = useState(false);
 const [orders, setOrders] = useState<Order[] | null>(null);
 const [error, setError] = useState<string | null>(null);

 const handleTrack = async (e: React.FormEvent) => {
  e.preventDefault();
  const cleanQuery = query.trim();
  if (!cleanQuery) return;

  setLoading(true);
  setError(null);
  setOrders(null);

  try {
   const res = await fetch(
    `/api/orders/lookup?query=${encodeURIComponent(cleanQuery)}`,
   );
   const data = await res.json();

   if (!res.ok) throw new Error(data.error || "Failed to search");

   setOrders(data.orders);
  } catch (err: any) {
   setError(err.message || "An error occurred while fetching your orders.");
  } finally {
   setLoading(false);
  }
 };

 const getStatusBadge = (status: Order["status"]) => {
  switch (status) {
   case "paid":
    return (
     <span className="text-emerald-800 bg-emerald-50 border border-emerald-200 text-[10px] tracking-widest uppercase px-2.5 py-1 font-mono">
      Payment Verified
     </span>
    );
   case "fulfilled":
    return (
     <span className="text-stone-900 bg-stone-100 border border-stone-300 text-[10px] tracking-widest uppercase px-2.5 py-1 font-mono">
      Dispatched
     </span>
    );
   default:
    return (
     <span className="text-amber-800 bg-amber-50 border border-amber-200 text-[10px] tracking-widest uppercase px-2.5 py-1 font-mono">
      Awaiting Receipt
     </span>
    );
  }
 };

 return (
  <div className="max-w-xl mx-auto px-6 py-24 text-stone-900 font-sans">
   <div className="text-center">
    <span className="text-xs uppercase tracking-widest text-stone-500 font-mono">
     Client Services
    </span>
    <h1 className="text-2xl font-serif mt-2 mb-3">Track Your Order</h1>
    <p className="text-xs text-stone-500 mb-8 leading-relaxed max-w-md mx-auto">
     Enter your order reference code (e.g.,{" "}
     <strong className="font-mono">NH-980468</strong>) or your registered{" "}
     <strong>Email Address</strong> to view payment status and order details.
    </p>

    <form onSubmit={handleTrack} className="space-y-4 max-w-md mx-auto mb-10">
     <input
      type="text"
      placeholder="NH-XXXXXX or client@domain.com"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      className="w-full px-4 py-3 border border-stone-300 text-center font-mono text-sm tracking-wider uppercase focus:outline-none focus:border-stone-900"
      required
     />
     <button
      type="submit"
      disabled={loading}
      className="w-full bg-stone-900 text-white py-3 text-xs uppercase tracking-widest hover:bg-stone-800 transition disabled:opacity-50 font-sans"
     >
      {loading ? "Searching..." : "Search Reservations"}
     </button>
    </form>
   </div>

   {/* Error state */}
   {error && (
    <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs text-center mb-8 font-sans">
     {error}
    </div>
   )}

   {/* Results view */}
   {orders !== null && (
    <div className="space-y-6">
     {orders.length === 0 ? (
      <div className="text-center py-10 border border-dashed border-stone-300 bg-stone-50/50 p-6">
       <p className="text-stone-600 text-xs">
        No matching orders found for &ldquo;{query}&rdquo;.
       </p>
       <p className="text-stone-400 text-[11px] mt-1">
        Please double-check your code or email address.
       </p>
      </div>
     ) : (
      <div className="space-y-4">
       <p className="text-xs uppercase tracking-widest text-stone-500 font-mono text-center mb-4">
        Found {orders.length} Order(s)
       </p>

       {orders.map((order) => (
        <div
         key={order._id}
         className="border border-stone-200 bg-white p-5 flex flex-col gap-3 text-left shadow-sm"
        >
         <div className="flex justify-between items-start border-b border-stone-100 pb-3">
          <div>
           <span className="font-mono text-sm font-bold text-stone-900">
            {order.orderId}
           </span>
           <p className="text-[11px] text-stone-400 mt-0.5">
            {new Date(order.createdAt).toLocaleDateString("en-US", {
             month: "short",
             day: "numeric",
             year: "numeric",
            })}
           </p>
          </div>
          {getStatusBadge(order.status)}
         </div>

         <div className="text-xs text-stone-600 space-y-1">
          <p>
           <strong className="font-normal text-stone-400">Client:</strong>{" "}
           {order.client.fullName}
          </p>
          <p>
           <strong className="font-normal text-stone-400">Items:</strong>{" "}
           {order.items?.map((i) => i.title).join(", ") || "Bespoke Creation"}
          </p>
          <p>
           <strong className="font-normal text-stone-400">Total:</strong> $
           {order.subtotal?.toLocaleString()}
          </p>
         </div>

         <div className="pt-2 flex justify-end">
          <Link
           href={`/order-confirmation/${order.orderId}`}
           className="bg-stone-900 text-white text-[10px] font-sans uppercase tracking-widest px-4 py-2 hover:bg-stone-800 transition"
          >
           {order.status === "pending"
            ? "Upload Receipt →"
            : "View Order Hub →"}
          </Link>
         </div>
        </div>
       ))}
      </div>
     )}
    </div>
   )}
  </div>
 );
}
