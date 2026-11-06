import Image from "next/image";
import Link from "next/link";

export interface ProductCardProps {
 category?: any;
 product?: any;
 [key: string]: any;
}

export default function ProductCard({
 category,
 product,
 ...rest
}: ProductCardProps) {
 // Gracefully pick up product, category, or generic props
 const item = product || category || rest;

 // Extract slug string safely
 const slug = typeof item?.slug === "object" ? item?.slug?.current : item?.slug;

 const imageSrc =
  item?.imageUrl || (typeof item?.image === "string" ? item.image : "");

 // Determine if item is a product page link or collection link
 const isProduct = Boolean(
  product || item?.price !== undefined || item?.stock !== undefined,
 );
 const href = isProduct
  ? `/product/${slug ?? ""}`
  : `/collection/${slug ?? ""}`;

 // Availability check
 const isUnavailable =
  Boolean(item?.isOutOfStock) ||
  (typeof item?.stock === "number" && item.stock <= 0) ||
  item?.status === "Sold Out" ||
  item?.status === "Unavailable";

 return (
  <Link href={href} className="group block space-y-1.5 sm:space-y-3">
   <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F5F5F3] border border-black/5">
    {imageSrc ? (
     <Image
      src={imageSrc}
      alt={item?.title || "Item"}
      fill
      className={`object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
       isUnavailable ? "opacity-60 grayscale" : ""
      }`}
      sizes="(max-width: 640px) 33vw, (max-width: 1200px) 33vw, 33vw"
     />
    ) : (
     <div className="w-full h-full bg-[#EAEAEA]" />
    )}

    {/* Unavailable Badge Overlay */}
    {isUnavailable && (
     <div className="absolute inset-0 bg-black/20 flex items-center justify-center p-1">
      <span className="bg-stone-900 text-stone-100 px-1.5 py-0.5 sm:px-3 sm:py-1.5 text-[8px] sm:text-[10px] uppercase tracking-wider sm:tracking-[0.25em] font-mono font-medium text-center">
       Unavailable
      </span>
     </div>
    )}
   </div>

   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline pt-0.5 gap-0.5 sm:gap-2">
    <h3 className="font-serif text-[11px] sm:text-base md:text-xl font-medium tracking-tight sm:tracking-wide text-black group-hover:opacity-70 transition-opacity line-clamp-1">
     {item?.title}
    </h3>
    <span
     className={`text-[9px] sm:text-[10px] tracking-wider sm:tracking-[0.2em] font-medium uppercase transition-colors shrink-0 ${
      isUnavailable
       ? "text-stone-400 font-mono"
       : "text-black/70 group-hover:text-black"
     }`}
    >
     {isUnavailable ? "Sold Out" : item?.price ? `₱${item.price}` : "Explore"}
    </span>
   </div>
  </Link>
 );
}
