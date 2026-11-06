import { NextResponse } from "next/server";
import { createClient } from "next-sanity";

const readClient = createClient({
 projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
 dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
 apiVersion: "2024-01-01",
 useCdn: false,
});

export async function GET(req: Request) {
 const { searchParams } = new URL(req.url);
 const query = searchParams.get("query")?.trim();

 if (!query) {
  return NextResponse.json(
   { error: "Please enter an order code or email address." },
   { status: 400 },
  );
 }

 try {
  const orders = await readClient.fetch<any[]>(
   `*[_type == "order" && (orderId == $query || lower(client.email) == lower($query))] | order(createdAt desc) {
        _id,
        orderId,
        status,
        client,
        subtotal,
        createdAt,
        items
      }`,
   { query } as Record<string, unknown>,
  );

  return NextResponse.json({ orders });
 } catch (error) {
  console.error("Order lookup error:", error);
  return NextResponse.json(
   { error: "Failed to search orders." },
   { status: 500 },
  );
 }
}
