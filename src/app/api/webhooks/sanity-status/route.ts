import { NextResponse } from "next/server";
import { createClient } from "next-sanity";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const writeClient = createClient({
 projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
 dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
 apiVersion: "2024-01-01",
 token: process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
 useCdn: false,
});

export async function POST(req: Request) {
 try {
  const { searchParams } = new URL(req.url);
  const secretParam = searchParams.get("secret");
  const secretHeader = req.headers.get("x-sanity-secret");
  const expectedSecret = process.env.SANITY_WEBHOOK_SECRET;

  // Verify secret via query string or header
  if (
   expectedSecret &&
   secretParam !== expectedSecret &&
   secretHeader !== expectedSecret
  ) {
   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { orderId, status, client, items } = body;

  if (!orderId || !status || !client?.email) {
   return NextResponse.json(
    { message: "Payload missing required fields" },
    { status: 400 },
   );
  }

  const origin = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const confirmationUrl = `${origin}/order-confirmation/${orderId}`;
  const clientName = client.fullName
   ? client.fullName.split(" ")[0]
   : "Valued Client";

  let subject = "";
  let statusTitle = "";
  let statusText = "";
  let statusColor = "#1c1917";

  switch (status) {
   case "approved":
    subject = `Order Approved — ${orderId}`;
    statusTitle = "Payment Requested";
    statusText = `Your order request for <strong>${orderId}</strong> has been reviewed and approved by our atelier. Please proceed to the payment hub to submit your transfer receipt.`;
    statusColor = "#0284c7";
    break;
   case "paid":
    subject = `Payment Confirmed — Order ${orderId}`;
    statusTitle = "Payment Verified & Processing";
    statusText = `We have verified your payment receipt for order <strong>${orderId}</strong>. Your piece is now officially confirmed and undergoing final quality review in our atelier.`;
    statusColor = "#047857";
    break;
   case "fulfilled":
    subject = `Creation Dispatched — Order ${orderId}`;
    statusTitle = "Dispatched / In Transit";
    statusText = `Your order <strong>${orderId}</strong> has been carefully prepared and handed over to private courier transport.`;
    statusColor = "#1c1917";
    break;
   case "cancelled":
    subject = `Order Update — ${orderId}`;
    statusTitle = "Order Cancelled";
    statusText = `Your order request <strong>${orderId}</strong> has been cancelled. If you have any questions, please reach out to our concierge team.`;
    statusColor = "#dc2626";

    // Restore product stock if order is cancelled
    if (items && Array.isArray(items)) {
     await Promise.all(
      items.map(async (item: { productId?: string }) => {
       if (!item.productId) return;
       const cleanId = item.productId.replace(/^drafts\./, "");

       const product = await writeClient.fetch(
        `*[_type == "product" && _id == $id][0]{ stock }`,
        { id: cleanId },
       );

       if (product) {
        const newStock = (product.stock || 0) + 1;
        await writeClient
         .patch(cleanId)
         .set({ stock: newStock, isOutOfStock: false })
         .commit();
       }
      }),
     );
    }
    break;
   default:
    return NextResponse.json({
     message: `No action required for status: ${status}`,
    });
  }

  const emailResult = await resend.emails.send({
   from: "Nahi House <onboarding@resend.dev>",
   to: client.email,
   subject,
   html: `
        <div style="font-family: Georgia, serif; max-width: 580px; margin: 0 auto; color: #1c1917; padding: 32px 24px; border: 1px solid #e7e5e4; background-color: #ffffff;">
          <div style="text-align: center; border-bottom: 1px solid #e7e5e4; padding-bottom: 24px; margin-bottom: 24px;">
            <p style="text-transform: uppercase; font-size: 10px; letter-spacing: 0.25em; color: #78716c; margin: 0;">Nahi House Atelier</p>
            <h1 style="font-weight: normal; font-size: 22px; margin: 8px 0 0 0;">${subject}</h1>
          </div>

          <p style="font-size: 14px; line-height: 1.6; color: #44403c;">Dear ${clientName},</p>
          <p style="font-size: 14px; line-height: 1.6; color: #44403c;">${statusText}</p>

          <div style="background-color: #faf9f6; border: 1px solid #e7e5e4; padding: 20px; margin: 24px 0; text-align: center;">
            <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #78716c; margin: 0 0 4px 0;">Status Update</p>
            <p style="font-size: 14px; font-weight: bold; margin: 0 0 16px 0; color: ${statusColor};">${statusTitle}</p>
            
            <a href="${confirmationUrl}" style="display: inline-block; background-color: #1c1917; color: #ffffff; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; text-decoration: none; padding: 14px 24px;">
              View Order Hub
            </a>
          </div>
        </div>
      `,
  });

  if (emailResult?.error) {
   console.error("Resend API Error:", emailResult.error);
   return NextResponse.json(
    { error: emailResult.error.message },
    { status: 400 },
   );
  }

  return NextResponse.json({ success: true, data: emailResult?.data });
 } catch (error) {
  console.error("Sanity status webhook error:", error);
  return NextResponse.json(
   { error: "Failed to process webhook" },
   { status: 500 },
  );
 }
}
