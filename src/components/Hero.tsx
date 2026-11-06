import Link from "next/link";
import { HeroData } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";

export default function Hero({ data }: { data?: HeroData & { image?: any } }) {
 const tag = data?.subtitle || "Women";
 const title = data?.title || "Heritage Season";
 const ctaText = data?.ctaText || "Discover the Collection";
 const ctaLink = data?.ctaLink || "#collection";

 let bgImage =
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop";

 if (data?.image) {
  bgImage = urlFor(data.image).url();
 } else if (data?.imageUrl) {
  bgImage = data.imageUrl;
 }

 return (
  <section className="relative w-full h-screen min-h-[600px] bg-[#161616] flex flex-col justify-end items-center overflow-hidden pb-24 px-6">
   {/* Background Image */}
   <div
    className="absolute inset-0 bg-cover bg-center opacity-70 scale-105 transition-transform duration-1000 ease-out"
    style={{
     backgroundImage: `url('${bgImage}')`,
    }}
   >
    {/* Existing bottom shadow for text readability */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

    {/* NEW: Soft top shadow to separate the background from the navbar */}
    <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/60 to-transparent" />
   </div>

   {/* Hero Content - Strict 3-Line Layout */}
   <div className="relative z-10 text-center flex flex-col items-center">
    <span className="text-[9px] tracking-[0.4em] uppercase text-white/60 mb-3">
     {tag}
    </span>

    <h1 className="font-serif text-3xl sm:text-4xl font-extralight tracking-widest text-white mb-6">
     {title}
    </h1>

    <Link
     href={ctaLink}
     className="inline-block border-b border-white/30 hover:border-white text-white/90 hover:text-white text-[9px] tracking-[0.3em] uppercase pb-1.5 transition-all duration-300"
    >
     {ctaText}
    </Link>
   </div>
  </section>
 );
}
