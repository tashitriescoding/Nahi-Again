import Image from "next/image";
import Link from "next/link";

export interface Release {
 _id: string;
 title: string;
 slug: string | { current: string };
 price?: string | number;
 collection?: string;
 image?: any;
 imageUrl?: string;
 status?: "Available" | "Sold Out" | string;
}

export default function ReleaseCard({ release }: { release: Release }) {
 // Safely extract slug string regardless of Sanity format
 const slug =
  typeof release?.slug === "object" ? release?.slug?.current : release?.slug;
 const imageSrc =
  release?.imageUrl ||
  (typeof release?.image === "string" ? release.image : "");

 const status = release?.status ?? "Available";
 const isSoldOut = status === "Sold Out";

 return (
  <Link
   href={`/product/${slug ?? ""}`}
   className="group block space-y-1.5 sm:space-y-3"
  >
   <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F5F5F3] border border-black/5">
    {imageSrc ? (
     <Image
      src={imageSrc}
      alt={release?.title || "Release item"}
      fill
      className={`object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
       isSoldOut ? "opacity-80" : "opacity-100"
      }`}
      sizes="(max-width: 640px) 33vw, (max-width: 1200px) 33vw, 33vw"
     />
    ) : (
     <div className="w-full h-full bg-[#EAEAEA]" />
    )}

    {/* Scaled Status Badge */}
    <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 z-10">
     <span
      className={`inline-block px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[7px] sm:text-[9px] tracking-wider sm:tracking-[0.25em] uppercase font-medium backdrop-blur-md transition-colors ${
       isSoldOut
        ? "bg-black/85 text-white"
        : "bg-white/90 text-black border border-black/10 shadow-xs"
      }`}
     >
      {status}
     </span>
    </div>
   </div>

   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline pt-0.5 gap-0.5 sm:gap-2">
    <div className="min-w-0 flex-1">
     <h3 className="font-serif text-[11px] sm:text-base md:text-xl font-medium tracking-tight sm:tracking-wide text-black group-hover:opacity-70 transition-opacity line-clamp-1">
      {release?.title}
     </h3>
     {release?.collection && (
      <p className="text-[8px] sm:text-[10px] tracking-wider sm:tracking-[0.2em] text-black/70 font-medium uppercase mt-0.5 line-clamp-1">
       {release.collection}
      </p>
     )}
    </div>
    {release?.price && (
     <span className="text-[9px] sm:text-xs font-medium tracking-wider sm:tracking-widest text-black shrink-0">
      {typeof release.price === "number" ? `₱${release.price}` : release.price}
     </span>
    )}
   </div>
  </Link>
 );
}
