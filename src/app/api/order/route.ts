import { NextResponse } from "next/server";
import { createClient } from "next-sanity";
import { Resend } from "resend";
import { revalidatePath } from "next/cache";

const sanityWriteClient = createClient({
 projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
 dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
 apiVersion: "2024-01-01",
 token: process.env.SANITY_API_WRITE_TOKEN,
 useCdn: false,
});

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
 try {
  const body = await req.json();
  const { client, items, subtotal } = body;

  if (!client || !items || !Array.isArray(items) || items.length === 0) {
   return NextResponse.json(
    { error: "Missing required order details or item list is empty." },
    { status: 400 },
   );
  }

  const generatedOrderId = `NH-${Math.floor(100000 + Math.random() * 900000)}`;

  const formattedItems = items.map((item: any, index: number) => ({
   _key: item._key || `item-${index}-${Date.now()}`,
   productId: String(item.productId || item._id || item.id || ""),
   productCode: String(
    item.productCode || item.code || item.sku || item.product_code || "",
   ),
   title: String(item.title || "Untitled Piece"),
   price: Number(item.price || 0),
   quantity: Number(item.quantity || 1),
  }));

  // 1. Save Order Document
  const orderDoc = {
   _type: "order",
   orderId: generatedOrderId,
   createdAt: new Date().toISOString(),
   status: "pending",
   subtotal: Number(subtotal || 0),
   client: {
    fullName: String(client.fullName || ""),
    email: String(client.email || ""),
    phone: String(client.phone || ""),
    address: String(client.address || ""),
    city: String(client.city || ""),
    country: String(client.country || ""),
    postalCode: String(client.postalCode || ""),
    notes: String(client.notes || ""),
   },
   items: formattedItems,
  };

  const createdOrder = await sanityWriteClient.create(orderDoc);

  // 2. Patch Product Status to "Sold Out"
  const productPatchPromises = formattedItems
   .filter((item) => item.productId)
   .map((item) =>
    sanityWriteClient
     .patch(item.productId)
     .set({ status: "Sold Out" })
     .commit()
     .catch((err) => {
      console.error(
       `Failed to mark product ${item.productId} as Sold Out:`,
       err,
      );
     }),
   );

  await Promise.all(productPatchPromises);

  // Revalidate cached catalog and home pages
  revalidatePath("/collection");
  revalidatePath("/");

  // Revalidate individual product detail pages for purchased items
  formattedItems.forEach((item) => {
   if (item.productId) {
    revalidatePath(`/product/${item.productId}`);
   }
  });

  // 3. Email Dispatch via Resend
  if (process.env.RESEND_API_KEY) {
   const itemsHtml = formattedItems
    .map(
     (item) => `
          <tr style="border-bottom: 1px solid #eaeaea;">
            <td style="padding: 12px 0;">
              <strong style="font-size: 13px;">${item.title}</strong><br/>
              <span style="font-size: 10px; color: #666; font-family: monospace;">CODE: ${item.productCode || "N/A"}</span>
            </td>
            <td style="padding: 12px 0; text-align: right; font-size: 13px;">
              $${item.price.toLocaleString()} USD
            </td>
          </tr>
        `,
    )
    .join("");

   // Default testing sender address for Resend until domain DNS is verified
   const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

   const clientEmail = resend.emails.send({
    from: `NAHI HOUSE Concierge <${fromEmail}>`,
    to: [client.email],
    subject: `Order Request Confirmation - ${generatedOrderId}`,
    html: `
          <div style="font-family: serif; max-width: 600px; margin: 0 auto; color: #111; padding: 20px;">
            <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.25em; color: #777;">Private Client Request</p>
            <h2 style="font-weight: normal; margin-top: 4px;">Thank you, ${client.fullName}</h2>
            <p style="font-size: 13px; color: #444; line-height: 1.6;">We have received your bespoke request <strong>${generatedOrderId}</strong>. Our atelier concierge will review your selections and contact you regarding final fulfillment and delivery timelines.</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 24px 0; font-family: sans-serif;">
              <thead>
                <tr style="border-bottom: 1px solid #111; text-align: left; text-transform: uppercase; font-size: 9px; letter-spacing: 0.2em;">
                  <th style="padding-bottom: 8px;">Creation</th>
                  <th style="padding-bottom: 8px; text-align: right;">Value</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>

            <p style="font-size: 14px; font-weight: bold; text-align: right; font-family: sans-serif;">
              Subtotal: $${Number(subtotal).toLocaleString()} USD
            </p>
          </div>
        `,
   });

   const conciergeEmail = resend.emails.send({
    from: `Atelier System <${fromEmail}>`,
    to: [process.env.ATELIER_CONCIERGE_EMAIL || "concierge@nahihouse.com"],
    subject: `NEW ORDER REQUEST [${generatedOrderId}] - ${client.fullName}`,
    html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; font-size: 12px; color: #111;">
            <h2 style="font-size: 16px; margin-bottom: 16px;">New Bespoke Order Request (${generatedOrderId})</h2>
            <p><strong>Client:</strong> ${client.fullName}</p>
            <p><strong>Email:</strong> ${client.email}</p>
            <p><strong>Phone:</strong> ${client.phone}</p>
            <p><strong>Destination:</strong> ${client.address}, ${client.city}, ${client.postalCode}, ${client.country}</p>
            <p><strong>Notes:</strong> ${client.notes || "None provided"}</p>
            
            <h3 style="font-size: 13px; margin-top: 20px; border-bottom: 1px solid #111; padding-bottom: 4px;">Order Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tbody>${itemsHtml}</tbody>
            </table>
            <p style="font-size: 14px; font-weight: bold; margin-top: 12px;">Subtotal: $${Number(subtotal).toLocaleString()} USD</p>
          </div>
        `,
   });

   // Dispatch emails non-fatally so an email failure won't block the API return
   await Promise.allSettled([clientEmail, conciergeEmail]).catch((err) =>
    console.error("Non-fatal email dispatch error:", err),
   );
  }

  return NextResponse.json(
   {
    success: true,
    orderId: createdOrder.orderId || generatedOrderId,
    _id: createdOrder._id,
   },
   { status: 201 },
  );
 } catch (err: any) {
  console.error("Sanity Order Mutation Error:", err);
  return NextResponse.json(
   { error: err?.message || "Failed to record order in Sanity." },
   { status: 500 },
  );
 }
}
