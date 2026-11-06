import { NextResponse } from "next/server";
import { createClient } from "next-sanity";

const readClient = createClient({
 projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
 dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
 apiVersion: "2024-01-01",
 useCdn: true,
});

export async function GET(req: Request) {
 const { searchParams } = new URL(req.url);
 const query = searchParams.get("q")?.trim();

 if (!query || query.length < 2) {
  return NextResponse.json({ products: [] });
 }

 try {
  const products = await readClient.fetch<any[]>(
   `*[_type == "product" && (title match $term || category match $term)] [0..6] {
        _id,
        title,
        "slug": slug.current,
        price,
        "imageUrl": mainImage.asset->url
      }`,
   { term: `*${query}*` } as Record<string, unknown>,
  );

  return NextResponse.json({ products });
 } catch (error) {
  console.error("Search API error:", error);
  return NextResponse.json(
   { error: "Failed to search atelier items" },
   { status: 500 },
  );
 }
}
