"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "next-sanity";

const sanityClient = createClient({
 projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
 dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
 apiVersion: "2024-01-01",
 useCdn: false,
});

interface OrderItem {
 productId?: string;
 productCode?: string;
 title: string;
 price: number;
 quantity?: number;
}

interface OrderData {
 _id: string;
 orderId: string;
 createdAt?: string;
 status:
  | "pending"
  | "awaiting_verification"
  | "approved"
  | "paid"
  | "fulfilled"
  | "cancelled";
 paymentProofImage?: {
  asset?: {
   _ref?: string;
  };
 };
 client?: {
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  notes?: string;
 };
 items?: OrderItem[];
 subtotal?: number;
}

export default function OrderConfirmationPage() {
 const routeParams = useParams();
 const rawId = routeParams?.id;
 const orderId =
  typeof rawId === "string" ? rawId : Array.isArray(rawId) ? rawId[0] : "";

 const [order, setOrder] = useState<OrderData | null>(null);
 const [loading, setLoading] = useState(true);
 const [file, setFile] = useState<File | null>(null);
 const [uploading, setUploading] = useState(false);
 const [errorMsg, setErrorMsg] = useState("");

 const fetchOrder = async () => {
  if (!orderId) {
   setLoading(false);
   return;
  }

  try {
   const data = await sanityClient.fetch(
    `*[_type == "order" && (orderId == $orderId || _id == $orderId)][0]{
            _id,
            orderId,
            createdAt,
            status,
            paymentProofImage,
            client,
            items,
            subtotal
          }`,
    { orderId },
   );

   setOrder(data || null);
  } catch (err) {
   console.error("Failed to load order:", err);
  } finally {
   setLoading(false);
  }
 };

 useEffect(() => {
  if (orderId) {
   fetchOrder();
  } else {
   setLoading(false);
  }
 }, [orderId]);

 const handleUpload = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!file || !orderId) return;

  setUploading(true);
  setErrorMsg("");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("orderId", orderId);

  try {
   const res = await fetch("/api/upload-receipt", {
    method: "POST",
    body: formData,
   });

   if (res.ok) {
    await fetchOrder();
   } else {
    const data = await res.json().catch(() => ({}));
    setErrorMsg(data.error || "Failed to upload receipt");
   }
  } catch (err) {
   console.error(err);
   setErrorMsg("Error uploading receipt. Please try again.");
  } finally {
   setUploading(false);
  }
 };

 if (loading) {
  return (
   <div className="min-h-screen pt-32 pb-24 px-6 flex items-center justify-center text-stone-900 font-sans">
    <span className="text-xs tracking-[0.3em] uppercase text-stone-400 animate-pulse">
     Retrieving Atelier Record...
    </span>
   </div>
  );
 }

 if (!order) {
  return (
   <div className="min-h-screen pt-32 pb-24 px-6 max-w-md mx-auto text-center text-stone-900 font-sans">
    <h1 className="text-2xl font-serif mb-2">Order Not Found</h1>
    <p className="text-xs text-stone-500 mb-6">
     We could not locate reference code{" "}
     <span className="font-mono font-bold">{orderId || "N/A"}</span>.
    </p>
   </div>
  );
 }

 const isPaid = order.status === "paid" || order.status === "fulfilled";
 const isAlreadySubmitted =
  order.status === "awaiting_verification" ||
  isPaid ||
  !!order.paymentProofImage;

 return (
  <div className="max-w-3xl mx-auto px-6 py-20 text-stone-900 font-sans">
   {/* Header */}
   <div className="border-b border-stone-200 pb-6 mb-8 text-center">
    <span className="text-xs uppercase tracking-widest text-stone-500 font-mono">
     {isPaid ? "Payment Receipt" : "Nahi House Concierge"}
    </span>
    <h1 className="text-3xl font-serif mt-2">Nahi House Atelier</h1>
    <p className="text-sm text-stone-600 mt-1">
     Reference Code:{" "}
     <span className="font-mono font-bold">{order.orderId || orderId}</span>
    </p>
   </div>

   {/* Live Status Banner */}
   <div className="bg-stone-50 border border-stone-200 p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
    <div>
     <span className="text-[10px] uppercase tracking-[0.2em] text-stone-500 block font-medium">
      Current Order Status
     </span>
     <p className="text-base font-serif font-medium mt-1 uppercase tracking-wide">
      {order.status === "pending" && "Awaiting Payment Proof"}
      {order.status === "awaiting_verification" && "Payment Proof Under Review"}
      {order.status === "approved" && "Approved - Awaiting Transfer"}
      {order.status === "paid" && "Payment Confirmed & Processing"}
      {order.status === "fulfilled" && "Order Dispatched / Shipped"}
      {order.status === "cancelled" && "Order Cancelled"}
     </p>
    </div>
    <span
     className={`px-4 py-1.5 text-[10px] uppercase tracking-widest font-mono font-bold ${
      isPaid
       ? "bg-emerald-900 text-white"
       : order.status === "awaiting_verification"
         ? "bg-amber-800 text-white"
         : "bg-stone-900 text-white"
     }`}
    >
     {order.status}
    </span>
   </div>

   {/* Enlarged Payment Instructions Image (Unpaid State) */}
   {!isPaid && (
    <div className="bg-stone-50 border border-stone-200 p-6 md:p-8 mb-8 flex flex-col items-center justify-center">
     <span className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-mono mb-4">
      Payment Instructions & QR Code
     </span>
     <div className="max-w-2xl w-full bg-white border border-stone-300 p-3 shadow-sm">
      <img
       src="/images/gcash-qr.png"
       alt="Payment Details & QR Code"
       className="w-full h-auto object-contain mx-auto"
      />
     </div>
    </div>
   )}

   {/* Customer Full Details */}
   <div className="bg-white border border-stone-200 p-6 mb-8">
    <h3 className="text-xs uppercase tracking-widest font-bold text-stone-900 border-b border-stone-200 pb-3 mb-4 font-mono">
     Customer & Delivery Details
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
     <div>
      <p className="text-stone-400 uppercase tracking-wider text-[10px] mb-0.5">
       Full Name
      </p>
      <p className="font-semibold text-stone-900">
       {order.client?.fullName || "N/A"}
      </p>
     </div>
     <div>
      <p className="text-stone-400 uppercase tracking-wider text-[10px] mb-0.5">
       Email Address
      </p>
      <p className="font-semibold text-stone-900">
       {order.client?.email || "N/A"}
      </p>
     </div>
     <div>
      <p className="text-stone-400 uppercase tracking-wider text-[10px] mb-0.5">
       Phone Number
      </p>
      <p className="font-semibold text-stone-900">
       {order.client?.phone || "N/A"}
      </p>
     </div>
     <div>
      <p className="text-stone-400 uppercase tracking-wider text-[10px] mb-0.5">
       Full Address
      </p>
      <p className="font-semibold text-stone-900">
       {[
        order.client?.address,
        order.client?.city,
        order.client?.postalCode,
        order.client?.country,
       ]
        .filter(Boolean)
        .join(", ") || "N/A"}
      </p>
     </div>
     {order.client?.notes && (
      <div className="col-span-full pt-2 border-t border-stone-100">
       <p className="text-stone-400 uppercase tracking-wider text-[10px] mb-0.5">
        Bespoke Notes
       </p>
       <p className="text-stone-800 italic">{order.client.notes}</p>
      </div>
     )}
    </div>
   </div>

   {/* Itemized Breakdown & Total */}
   <div className="bg-white border border-stone-200 p-6 mb-8">
    <h3 className="text-xs uppercase tracking-widest font-bold text-stone-900 border-b border-stone-200 pb-3 mb-4 font-mono">
     Items & Summary
    </h3>

    {order.items && order.items.length > 0 ? (
     <div className="space-y-3 mb-6">
      {order.items.map((item, idx) => (
       <div
        key={idx}
        className="flex justify-between items-center text-xs py-1 border-b border-stone-100 last:border-none"
       >
        <div>
         <p className="text-stone-900 font-medium">{item.title}</p>
         {item.productCode && (
          <p className="text-[10px] text-stone-400 font-mono">
           Code: {item.productCode}
          </p>
         )}
        </div>
        <div className="text-right">
         <span className="font-mono text-stone-900 font-semibold">
          ₱{(item.price || 0).toLocaleString()}
         </span>
         {item.quantity && item.quantity > 1 && (
          <p className="text-[10px] text-stone-400">Qty: {item.quantity}</p>
         )}
        </div>
       </div>
      ))}
     </div>
    ) : (
     <p className="text-xs text-stone-400 mb-6 italic">
      No items listed in this order.
     </p>
    )}

    <div className="border-t border-stone-200 pt-4 flex justify-between items-center">
     <span className="uppercase tracking-widest font-mono text-xs text-stone-600 font-bold">
      Total Price
     </span>
     <span className="font-mono text-lg text-stone-900 font-bold">
      ₱{(order.subtotal || 0).toLocaleString()}
     </span>
    </div>
   </div>

   {/* Proof of Payment Upload Form */}
   {!isPaid && (
    <div className="border border-stone-200 p-8 text-center bg-white">
     {isAlreadySubmitted ? (
      <div className="py-6 space-y-3">
       <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold mb-1">
        ✓
       </div>
       <h3 className="text-sm uppercase tracking-wider font-semibold text-emerald-900">
        Payment Receipt Received
       </h3>
       <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
        Your payment screenshot is securely recorded in our system. Our atelier
        concierge is verifying the transfer and will confirm your creation
        shortly.
       </p>
      </div>
     ) : (
      <form onSubmit={handleUpload} className="space-y-4">
       <h3 className="text-sm uppercase tracking-wider font-semibold">
        Upload Payment Receipt
       </h3>
       <p className="text-xs text-stone-500 max-w-md mx-auto">
        Please attach a screenshot of your successful GCash or Bank Transfer
        transaction below to confirm your order.
       </p>
       {errorMsg && <p className="text-xs text-rose-600">{errorMsg}</p>}
       <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="block w-full text-xs text-stone-500 file:mr-4 file:py-2 file:px-4 file:border file:border-stone-900 file:bg-stone-900 file:text-white file:text-xs file:uppercase hover:file:bg-stone-800 cursor-pointer"
        required
       />
       <button
        type="submit"
        disabled={uploading || !file}
        className="w-full bg-stone-900 text-white py-3 text-xs uppercase tracking-widest hover:bg-stone-800 disabled:bg-stone-300 transition cursor-pointer"
       >
        {uploading ? "Submitting Proof..." : "Submit Proof of Payment"}
       </button>
      </form>
     )}
    </div>
   )}
  </div>
 );
}
