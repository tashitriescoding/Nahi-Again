import Link from "next/link";
import BrandStory from "@/components/BrandStory";
import {
 getCategories,
 getAllCategories,
 getHomepageContent,
} from "@/lib/sanity/queries";
import ProductCard from "@/components/ProductCard";
import ReleaseCard from "@/components/ReleaseCard";
import Hero from "@/components/Hero";

export const revalidate = 60;

export default async function HomePage() {
 const visibleCategories = await getCategories();
 const allCategories = await getAllCategories();
 const { hero, releaseHeading, releases, campaign } =
  await getHomepageContent();

 // Campaign fallbacks
 const campaignTitle = campaign?.title || "Explore unique 1-1 pieces";
 const campaignCtaText = campaign?.ctaText || "Shop Now";
 const campaignCtaLink = campaign?.ctaLink || "/collection/products";
 const campaignImageUrl =
  campaign?.imageUrl ||
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=3270&auto=format&fit=crop";

 const matchedCategory = allCategories.find((c) => {
  const title = c.title?.toLowerCase() || "";
  const slugStr =
   (typeof c.slug === "object" ? c.slug?.current : c.slug)?.toLowerCase() || "";
  const heading = releaseHeading?.toLowerCase() || "";

  return (
   title === heading ||
   slugStr === heading ||
   slugStr.includes("latest") ||
   title.includes("latest") ||
   slugStr.includes("release")
  );
 });

 const targetSlug = matchedCategory
  ? typeof matchedCategory.slug === "object"
    ? matchedCategory.slug.current
    : matchedCategory.slug
  : null;

 const browseHref = targetSlug ? `/collection/${targetSlug}` : "#collection";

 return (
  <div>
   <Hero data={hero} />

   <section
    id="latest"
    className="max-w-[1600px] mx-auto px-3 sm:px-6 md:px-12 lg:px-20 pt-8 sm:pt-12 pb-2 sm:pb-4 scroll-mt-24"
   >
    <div className="text-center mb-6 sm:mb-8 flex flex-col items-center gap-1.5">
     <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl tracking-wide">
      {releaseHeading}
     </h2>
     <Link
      href={browseHref}
      className="text-[9px] uppercase tracking-[0.25em] font-sans text-black/50 hover:text-black underline underline-offset-4 transition-colors"
     >
      Browse collection
     </Link>
    </div>

    <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 gap-y-6 md:gap-y-10">
     {releases && releases.length > 0 ? (
      releases.map((release) => (
       <ReleaseCard key={release._id} release={release} />
      ))
     ) : (
      <div className="col-span-full text-center py-12 text-[10px] tracking-[0.2em] uppercase font-sans text-black/40">
       [ Archives currently being updated ]
      </div>
     )}
    </div>
   </section>

   <div className="w-full h-px bg-black/5 max-w-[1600px] mx-auto my-2 sm:my-4" />

   <section
    id="collection"
    className="max-w-[1600px] mx-auto px-3 sm:px-6 md:px-12 lg:px-20 pt-2 sm:pt-4 pb-20 sm:pb-32"
   >
    <div className="text-center mb-6 sm:mb-10">
     <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl tracking-wide">
      The Collection
     </h2>
    </div>
    

    <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 gap-y-6 sm:gap-y-12 lg:gap-y-16">
     {visibleCategories.map((category) => (
      <ProductCard key={category._id} category={category} />
     ))}
    </div>
   </section>
   <BrandStory />

   {/* --- EDITORIAL / CAMPAIGN BLOCK --- */}
   <section className="max-w-[1600px] mx-auto px-3 sm:px-6 md:px-12 lg:px-20 pb-12 sm:pb-24">
    <div className="flex flex-col-reverse lg:flex-row w-full group border border-black/5 overflow-hidden">
     {/* Text Area connected to Sanity */}
     <div className="w-full lg:w-[25%] bg-[#F5F5F3] px-6 py-12 lg:p-10 flex flex-col items-center justify-center text-center lg:border-r border-black/5 shrink-0">
      <h2 className="font-serif text-2xl sm:text-3xl text-black tracking-wide mb-5 leading-snug">
       {campaignTitle}
      </h2>
      <Link
       href={campaignCtaLink}
       className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] font-sans text-black/50 hover:text-black underline underline-offset-8 transition-colors"
      >
       {campaignCtaText}
      </Link>
     </div>

     {/* Image Area connected to Sanity */}
     <div className="relative w-full lg:w-[75%] aspect-[4/3] lg:aspect-[3/2] overflow-hidden bg-[#EAEAEA]">
      <img
       src={campaignImageUrl}
       alt={campaignTitle}
       className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
      />
     </div>
    </div>
   </section>
  </div>
 );
}
