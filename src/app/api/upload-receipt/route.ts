import { NextResponse } from "next/server";
import { createClient } from "next-sanity";

const token =
 process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN;

const writeClient = createClient({
 projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
 dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
 apiVersion: "2024-01-01",
 token: token,
 useCdn: false,
});

export async function POST(req: Request) {
 try {
  if (!token) {
   return NextResponse.json(
    { error: "Server Configuration Error: Missing write token in .env.local" },
    { status: 500 },
   );
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const orderId = formData.get("orderId") as string;

  if (!file || !orderId) {
   return NextResponse.json(
    { error: "Missing uploaded file or order ID reference" },
    { status: 400 },
   );
  }

  // 1. Resolve internal Sanity _id matching custom orderId string
  const documentId = await writeClient.fetch(
   `*[_type == "order" && (orderId == $orderId || _id == $orderId)][0]._id`,
   { orderId },
  );

  if (!documentId) {
   return NextResponse.json(
    { error: `Order reference "${orderId}" was not found in Sanity.` },
    { status: 404 },
   );
  }

  // 2. Upload screenshot file asset to Sanity
  const buffer = Buffer.from(await file.arrayBuffer());
  const imageAsset = await writeClient.assets.upload("image", buffer, {
   filename: file.name,
   contentType: file.type,
  });

  // 3. Patch document with uploaded image reference and update status
  await writeClient
   .patch(documentId)
   .set({
    status: "awaiting_verification",
    paymentProofImage: {
     _type: "image",
     asset: {
      _type: "reference",
      _ref: imageAsset._id,
     },
    },
   })
   .commit();

  return NextResponse.json({ success: true, assetId: imageAsset._id });
 } catch (error: any) {
  console.error("❌ Upload route error:", error);
  return NextResponse.json(
   { error: error.message || "Failed to process receipt upload" },
   { status: 500 },
  );
 }
}
