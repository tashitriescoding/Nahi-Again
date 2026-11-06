import { NextResponse } from "next/server";
import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const secret = process.env.SANITY_WEBHOOK_SECRET || "";

export async function POST(req: Request) {
 try {
  const signature = req.headers.get(SIGNATURE_HEADER_NAME) || "";
  const body = await req.text();

  // 1. Verify that the request actually came from Sanity
  if (secret && !isValidSignature(body, signature, secret)) {
   return NextResponse.json(
    { error: "Invalid webhook signature." },
    { status: 401 },
   );
  }

  const payload = JSON.parse(body);
  const { before, after } = payload;

  // 2. Only trigger if the status field actually changed
  if (before && after && before.status !== after.status) {
   const clientEmail = after.client?.email;
   const clientName = after.client?.fullName || "Valued Client";
   const newStatus = after.status;
   const orderId = after.orderId || "Order";

   if (clientEmail) {
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

    await resend.emails.send({
     from: `NAHI HOUSE Concierge <${fromEmail}>`,
     to: [clientEmail],
     subject: `Order Update: ${orderId} is now ${newStatus}`,
     html: `
            <div style="font-family: serif; max-width: 600px; margin: 0 auto; color: #111; padding: 20px;">
              <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.25em; color: #777;">Private Client Update</p>
              <h2 style="font-weight: normal; margin-top: 4px;">Hello, ${clientName}</h2>
              <p style="font-size: 13px; color: #444; line-height: 1.6;">
                The status of your order request <strong>${orderId}</strong> has been updated.
              </p>
              
              <div style="background-color: #FAF9F6; border: 1px solid #eaeaea; padding: 16px; margin: 20px 0; text-align: center;">
                <span style="font-size: 9px; text-transform: uppercase; letter-spacing: 0.2em; color: #666; display: block; margin-bottom: 4px;">Current Status</span>
                <strong style="font-size: 16px; font-family: sans-serif; text-transform: uppercase; letter-spacing: 0.1em; color: #111;">${newStatus}</strong>
              </div>

              <p style="font-size: 12px; color: #666; line-height: 1.5;">
                If you have any questions regarding your bespoke order, feel free to reply directly to this email to reach your client concierge.
              </p>
            </div>
          `,
    });
   }
  }

  return NextResponse.json({ success: true, message: "Webhook processed." });
 } catch (err: any) {
  console.error("Sanity Webhook Error:", err);
  return NextResponse.json(
   { error: err?.message || "Webhook processing failed." },
   { status: 500 },
  );
 }
}
