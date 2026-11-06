import { defineField, defineType } from "sanity";

export const order = defineType({
 name: "order",
 title: "Client Orders",
 type: "document",
 fieldsets: [
  {
   name: "paymentVerification",
   title: "💳 Payment & Receipt Verification",
   options: { collapsible: true, collapsed: false },
  },
  {
   name: "clientDetails",
   title: "👤 Client Information",
   options: { collapsible: true, collapsed: false },
  },
  {
   name: "orderSummary",
   title: "📦 Order Summary & Items",
   options: { collapsible: true, collapsed: false },
  },
 ],
 fields: [
  defineField({
   name: "orderId",
   title: "Order ID",
   type: "string",
   readOnly: true,
  }),
  defineField({
   name: "status",
   title: "Order Status",
   type: "string",
   options: {
    list: [
     { title: "⏳ Pending Review", value: "pending" },
     {
      title: "🔍 Awaiting Payment Verification",
      value: "awaiting_verification",
     },
     { title: "💳 Approved - Payment Requested", value: "approved" },
     { title: "✅ Payment Received / Processing", value: "paid" },
     { title: "🚚 Fulfilled / Shipped", value: "fulfilled" },
     { title: "❌ Declined / Cancelled", value: "cancelled" },
    ],
   },
   initialValue: "pending",
  }),

  // --- PAYMENT & RECEIPT VERIFICATION ---
  defineField({
   name: "paymentQrImage",
   title: "Payment QR Code Image",
   type: "image",
   fieldset: "paymentVerification",
   description: "Drag and drop a GCash or Bank QR code PNG/JPG for this order.",
   options: {
    hotspot: true,
   },
  }),
  defineField({
   name: "paymentProofImage",
   title: "Payment Receipt Screenshot",
   type: "image",
   fieldset: "paymentVerification",
   description:
    "Client uploaded screenshot or receipt proof. Click thumbnail to expand.",
   options: {
    hotspot: true,
   },
  }),

  // --- CLIENT DETAILS ---
  defineField({
   name: "client",
   title: "Client Details",
   type: "object",
   fieldset: "clientDetails",
   fields: [
    { name: "fullName", title: "Full Name", type: "string" },
    { name: "email", title: "Email", type: "string" },
    { name: "phone", title: "Phone", type: "string" },
    { name: "address", title: "Address", type: "string" },
    { name: "city", title: "City", type: "string" },
    { name: "country", title: "Country", type: "string" },
    { name: "postalCode", title: "Postal Code", type: "string" },
    { name: "notes", title: "Bespoke Notes", type: "text" },
   ],
  }),

  // --- ORDER SUMMARY ---
  defineField({
   name: "subtotal",
   title: "Subtotal",
   type: "number",
   fieldset: "orderSummary",
  }),
  defineField({
   name: "items",
   title: "Ordered Items",
   type: "array",
   fieldset: "orderSummary",
   of: [
    {
     type: "object",
     name: "orderItem",
     title: "Order Item",
     fields: [
      { name: "productId", title: "Product ID", type: "string" },
      { name: "productCode", title: "Product Code", type: "string" },
      { name: "title", title: "Title", type: "string" },
      { name: "price", title: "Price", type: "number" },
      { name: "quantity", title: "Quantity", type: "number" },
     ],
     preview: {
      select: {
       title: "title",
       code: "productCode",
       price: "price",
       quantity: "quantity",
      },
      prepare({ title, code, price, quantity }) {
       const formattedPrice = price ? `$${price.toLocaleString()}` : "$0";
       const codeDisplay = code ? `Code: ${code}` : "No Code";
       const qtyDisplay = quantity && quantity > 1 ? ` (x${quantity})` : "";

       return {
        title: title || "Untitled Piece",
        subtitle: `${codeDisplay} • ${formattedPrice}${qtyDisplay}`,
       };
      },
     },
    },
   ],
  }),
  defineField({
   name: "createdAt",
   title: "Created At",
   type: "datetime",
   readOnly: true,
  }),
 ],

 // --- STUDIO LIST PREVIEW ---
 preview: {
  select: {
   orderId: "orderId",
   clientName: "client.fullName",
   status: "status",
   media: "paymentProofImage",
   subtotal: "subtotal",
  },
  prepare({ orderId, clientName, status, media, subtotal }) {
   const statusMap: Record<string, string> = {
    pending: "⏳ Pending Review",
    awaiting_verification: "🔍 Awaiting Verification",
    approved: "💳 Approved - Awaiting Payment",
    paid: "✅ Paid & Processing",
    fulfilled: "🚚 Fulfilled",
    cancelled: "❌ Cancelled",
   };

   const statusText = statusMap[status] || status || "Pending";
   const totalText = subtotal ? ` • $${subtotal.toLocaleString()}` : "";

   return {
    title: `${orderId || "Draft Order"} — ${clientName || "Guest"}`,
    subtitle: `${statusText}${totalText}`,
    media: media,
   };
  },
 },
});
