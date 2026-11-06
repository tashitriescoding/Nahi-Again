export default {
 name: "order",
 title: "Order Requests",
 type: "document",
 fields: [
  { name: "orderId", title: "Order ID", type: "string", readOnly: true },
  {
   name: "status",
   title: "Order Status",
   type: "string",
   options: {
    list: [
     { title: "Pending Review", value: "pending_review" },
     { title: "Approved - Payment Requested", value: "payment_requested" },
     { title: "Paid", value: "paid" },
     { title: "In Production", value: "in_production" },
     { title: "Shipped", value: "shipped" },
     { title: "Cancelled", value: "cancelled" },
    ],
   },
   initialValue: "pending_review",
  },
  {
   name: "customerName",
   title: "Customer Name",
   type: "string",
   readOnly: true,
  },
  {
   name: "customerEmail",
   title: "Customer Email",
   type: "string",
   readOnly: true,
  },
  {
   name: "shippingAddress",
   title: "Shipping Address",
   type: "text",
   readOnly: true,
  },
  {
   name: "items",
   title: "Requested Items",
   type: "array",
   of: [
    {
     type: "object",
     fields: [
      {
       name: "product",
       title: "Product",
       type: "reference",
       to: [{ type: "product" }],
      },
      { name: "size", title: "Size", type: "string" },
      { name: "quantity", title: "Quantity", type: "number" },
     ],
    },
   ],
  },
  {
   name: "totalAmount",
   title: "Total Amount",
   type: "number",
   readOnly: true,
  },
  { name: "adminNotes", title: "Internal Owner Notes", type: "text" },
 ],
};
