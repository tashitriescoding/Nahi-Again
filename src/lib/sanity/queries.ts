import { client } from "./client";

export interface Category {
 _id: string;
 title: string;
 slug: { current: string };
 description?: string;
 images?: any[];
 imageUrl?: string;
 products?: Release[];
}

export interface Release {
 _id: string;
 title: string;
 slug: { current: string };
 productCode?: string;
 price: number;
 status: "Available" | "Sold Out";
 collection?: string;
 categories?: { _id: string; title: string; slug: { current: string } }[];
 description?: string;
 origins?: string;
 craftsmanship?: string;
 measurements?: string[];
 details?: string[];
 images?: any[];
 imageUrl?: string;
}

const isSanityConfigured =
 Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) &&
 process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== "demo-project";

// Fetches ONLY categories enabled for grid display
export async function getCategories(): Promise<Category[]> {
 if (!isSanityConfigured) {
  return [
   {
    _id: "c1",
    title: "Philippine Heritage",
    slug: { current: "philippine-heritage" },
    images: [],
   },
   {
    _id: "c2",
    title: "Jackets & Coats",
    slug: { current: "jackets-and-coats" },
    images: [],
   },
   { _id: "c3", title: "Menswear", slug: { current: "menswear" }, images: [] },
   {
    _id: "c4",
    title: "Womenswear",
    slug: { current: "womenswear" },
    images: [],
   },
   {
    _id: "c5",
    title: "Evening & Bridal",
    slug: { current: "evening-and-bridal" },
    images: [],
   },
   {
    _id: "c6",
    title: "Leather Goods",
    slug: { current: "leather-goods" },
    images: [],
   },
  ];
 }

 const query = `*[_type == "category" && isVisible != false] {
    _id,
    title,
    slug,
    "images": images[].asset->url,
    "imageUrl": image.asset->url
  }`;

 try {
  return await client.fetch(query, {}, { cache: "no-store" });
 } catch (error) {
  console.error("Failed to fetch categories from Sanity:", error);
  return [];
 }
}

// Fetches ALL categories regardless of visibility (for route resolution)
export async function getAllCategories(): Promise<Category[]> {
 if (!isSanityConfigured) {
  return getCategories();
 }

 const query = `*[_type == "category"] {
    _id,
    title,
    slug,
    "images": images[].asset->url,
    "imageUrl": image.asset->url
  }`;

 try {
  return await client.fetch(query, {}, { cache: "no-store" });
 } catch (error) {
  console.error("Failed to fetch all categories from Sanity:", error);
  return [];
 }
}

export async function getLatestReleases(): Promise<Release[]> {
 if (!isSanityConfigured) {
  return [
   {
    _id: "r1",
    title: "Structured Piña Silk Overcoat",
    slug: { current: "structured-pina-silk-overcoat" },
    productCode: "NH-2026-001",
    price: 3200,
    status: "Available",
    collection: "Fall-Winter 2026",
    images: [],
   },
   {
    _id: "r2",
    title: "Asymmetric Draped Gown",
    slug: { current: "asymmetric-draped-gown" },
    productCode: "NH-2026-002",
    price: 2100,
    status: "Sold Out",
    collection: "Fall-Winter 2026",
    images: [],
   },
   {
    _id: "r3",
    title: "Bespoke Pleated Trousers",
    slug: { current: "bespoke-pleated-trousers" },
    productCode: "NH-2026-003",
    price: 980,
    status: "Available",
    collection: "Fall-Winter 2026",
    images: [],
   },
  ];
 }

 const query = `*[_type == "homepage"][0].latestReleases[]-> {
    _id,
    title,
    slug,
    productCode,
    price,
    status,
    collection,
    "images": images[].asset->url,
    "imageUrl": images[0].asset->url
  }`;

 try {
  const results = await client.fetch(query, {}, { cache: "no-store" });
  if (!results || results.length === 0) {
   const fallbackQuery = `*[_type == "product"] | order(_createdAt desc)[0..5] {
        _id,
        title,
        slug,
        productCode,
        price,
        status,
        collection,
        "images": images[].asset->url,
        "imageUrl": images[0].asset->url
      }`;
   return await client.fetch(fallbackQuery, {}, { cache: "no-store" });
  }
  return results;
 } catch (error) {
  console.error("Failed to fetch latest releases from Sanity:", error);
  return [];
 }
}

export async function getProductBySlug(slug: string): Promise<Release | null> {
 if (!isSanityConfigured) {
  const releases = await getLatestReleases();
  const found = releases.find((item) => item.slug.current === slug);

  if (!found) return null;

  return {
   ...found,
   productCode: found.productCode || "NH-2026-000",
   description: `Handcrafted ${found.title.toLowerCase()} featuring bespoke tailored precision, hand-finished seams, and premium archival fabric.`,
   origins:
    "Woven with raw Piña-Seda harvested and processed in Aklan, Philippines.",
   craftsmanship:
    "120 hours of delicate hand-embroidery and precision tailoring in our Manila Atelier.",
   measurements: [
    "Chest Width: 54cm",
    "Shoulder Span: 46cm",
    "Garment Length: 115cm",
    "Bespoke adjustments available upon consultation.",
   ],
   details: [
    "Sustainably Sourced Raw Materials",
    "Handcrafted in Manila Atelier",
    "Dry Clean Only",
   ],
  };
 }

 const query = `*[_type == "product" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    productCode,
    price,
    status,
    collection,
    "categories": categories[]->{
      _id,
      title,
      slug
    },
    description,
    origins,
    craftsmanship,
    measurements,
    details,
    "images": images[].asset->url,
    "imageUrl": images[0].asset->url
  }`;

 try {
  return await client.fetch(query, { slug }, { cache: "no-store" });
 } catch (error) {
  console.error(`Failed to fetch product with slug ${slug}:`, error);
  return null;
 }
}

// Fetches any existing category page regardless of homepage visibility state
export async function getCategoryWithProducts(
 slug: string,
): Promise<Category | null> {
 if (!isSanityConfigured) {
  const categories = await getCategories();
  const category = categories.find((c) => c.slug.current === slug);

  if (!category) return null;

  const products: Release[] = [
   {
    _id: `${slug}-1`,
    title: `${category.title} Archetype I`,
    slug: { current: "structured-pina-silk-overcoat" },
    productCode: "NH-2026-001",
    price: 2800,
    status: "Available",
    collection: "Atelier Selection",
    images: [],
   },
   {
    _id: `${slug}-2`,
    title: `${category.title} Archetype II`,
    slug: { current: "asymmetric-draped-gown" },
    productCode: "NH-2026-002",
    price: 1950,
    status: "Sold Out",
    collection: "Atelier Selection",
    images: [],
   },
   {
    _id: `${slug}-3`,
    title: `${category.title} Archetype III`,
    slug: { current: "bespoke-pleated-trousers" },
    productCode: "NH-2026-003",
    price: 1100,
    status: "Available",
    collection: "Atelier Selection",
    images: [],
   },
  ];

  return {
   ...category,
   description: `A curated selection of garments under the ${category.title} atelier discipline, handcrafted with archival techniques.`,
   products,
  };
 }

 const query = `*[_type == "category" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    description,
    "products": *[_type == "product" && references(^._id)] {
      _id,
      title,
      slug,
      productCode,
      price,
      status,
      collection,
      "images": images[].asset->url,
      "imageUrl": images[0].asset->url
    }
  }`;

 try {
  return await client.fetch(query, { slug }, { cache: "no-store" });
 } catch (error) {
  console.error(`Failed to fetch category ${slug}:`, error);
  return null;
 }
}

export interface HeroData {
 title?: string;
 subtitle?: string;
 imageUrl?: string;
 ctaText?: string;
 ctaLink?: string;
}

export interface CampaignData {
 title?: string;
 ctaText?: string;
 ctaLink?: string;
 imageUrl?: string;
}

export interface HomepageData {
 hero?: HeroData;
 releaseHeading: string;
 releases: Release[];
 campaign?: CampaignData;
}

export async function getHomepageContent(): Promise<HomepageData> {
 const defaultCampaign = {
  title: "Explore unique 1-1 pieces",
  ctaText: "Shop Now",
  ctaLink: "/collection",
  imageUrl:
   "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=3270&auto=format&fit=crop",
 };

 if (!isSanityConfigured) {
  return {
   hero: {
    title: "NAHI HOUSE",
    subtitle: "Made-To-Order & Bespoke Atelier",
    imageUrl: "",
    ctaText: "Explore Collection",
    ctaLink: "#latest",
   },
   releaseHeading: "Fall-Winter 2026",
   releases: [
    {
     _id: "r1",
     title: "Structured Piña Silk Overcoat",
     slug: { current: "structured-pina-silk-overcoat" },
     productCode: "NH-2026-001",
     price: 3200,
     status: "Available",
     collection: "Fall-Winter 2026",
     images: [],
    },
    {
     _id: "r2",
     title: "Asymmetric Draped Gown",
     slug: { current: "asymmetric-draped-gown" },
     productCode: "NH-2026-002",
     price: 2100,
     status: "Sold Out",
     collection: "Fall-Winter 2026",
     images: [],
    },
    {
     _id: "r3",
     title: "Bespoke Pleated Trousers",
     slug: { current: "bespoke-pleated-trousers" },
     productCode: "NH-2026-003",
     price: 980,
     status: "Available",
     collection: "Fall-Winter 2026",
     images: [],
    },
   ],
   campaign: defaultCampaign,
  };
 }

 const query = `*[_type == "homepage"][0] {
    "hero": {
      "title": heroTitle,
      "subtitle": heroSubtitle,
      "ctaText": heroCtaText,
      "ctaLink": heroCtaLink,
      "image": heroImage,
      "imageUrl": heroImage.asset->url
    },
    releaseHeading,
    "releases": latestReleases[]-> {
      _id,
      title,
      slug,
      productCode,
      price,
      status,
      collection,
      "images": images[].asset->url,
      "imageUrl": images[0].asset->url,
      "image": images[0] 
    },
    "campaign": {
      "title": campaignTitle,
      "ctaText": campaignCtaText,
      "ctaLink": campaignCtaLink,
      "imageUrl": campaignImage.asset->url
    }
  }`;

 try {
  const data = await client.fetch(query, {}, { cache: "no-store" });

  if (!data) {
   return {
    hero: {
     title: "NAHI HOUSE",
     subtitle: "Made-To-Order & Bespoke Atelier",
     ctaText: "Explore Collection",
     ctaLink: "#latest",
    },
    releaseHeading: "Latest Releases",
    releases: [],
    campaign: defaultCampaign,
   };
  }

  return data;
 } catch (error) {
  console.error("Failed to fetch homepage data:", error);
  return {
   hero: {
    title: "NAHI HOUSE",
    subtitle: "Made-To-Order & Bespoke Atelier",
    ctaText: "Explore Collection",
    ctaLink: "#latest",
   },
   releaseHeading: "Latest Releases",
   releases: [],
   campaign: defaultCampaign,
  };
 }
}

export interface NavItem {
 label: string;
 href: string;
}

export async function getSidebarNavigation(): Promise<NavItem[]> {
 const fallbackNav: NavItem[] = [
  { label: "Shop All", href: "/collection" },
  { label: "Latest Releases", href: "/collection/latest-releases" },
  { label: "Kimonos", href: "/collection/kimonos" },
  { label: "Jackets & Vests", href: "/collection/jackets-and-vests" },
  { label: "About Us", href: "/about" },
  { label: "Search", href: "/search" },
 ];

 if (!isSanityConfigured) return fallbackNav;

 const query = `*[_type == "navigation"][0].sidebarItems[] {
    label,
    "href": select(
      linkType == "category" => "/collection/" + categoryRef->slug.current,
      customUrl
    )
  }`;

 try {
  const results = await client.fetch(query, {}, { cache: "no-store" });
  return results && results.length > 0 ? results : fallbackNav;
 } catch (error) {
  console.error("Failed to fetch navigation from Sanity:", error);
  return fallbackNav;
 }
}
