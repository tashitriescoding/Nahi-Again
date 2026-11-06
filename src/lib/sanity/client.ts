import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

export const client = createClient({
 projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "demo-project",
 dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
 apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-01-01",
 useCdn: false,
});

const builder = imageUrlBuilder(client);

export function urlFor(source: any) {
 return builder.image(source);
}
