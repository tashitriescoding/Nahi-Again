import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug } from "@/lib/sanity/queries";
import AddToCartButton from "@/components/AddToCartButton";
import ContactButton from "@/components/ContactButton";

interface ProductPageProps {
 params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
 const { slug } = await params;
 const product = await getProductBySlug(slug);

 if (!product) {
  notFound();
 }

 // Safe cast to access stock properties from Sanity without TS errors
 const rawProduct = product as any;

 // Availability calculation
 const isUnavailable =
  Boolean(rawProduct.isOutOfStock) ||
  (typeof rawProduct.stock === "number" && rawProduct.stock <= 0) ||
  rawProduct.status === "Sold Out";

 const primaryImage =
  product.imageUrl || (product.images && product.images[0]) || null;

 return (
  <div className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto min-h-screen">
   {/* Breadcrumb Navigation */}
   <div className="mb-8 flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase font-sans text-black/60 font-medium">
    <Link href="/" className="hover:text-black transition-colors">
     Home
    </Link>
    <span>/</span>
    <span className="text-black font-medium">{product.title}</span>
   </div>

   <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
    {/* Left Column: Gallery / Product Imagery */}
    <div className="lg:col-span-7 space-y-6">
     <div className="aspect-[3/4] bg-[#FAF9F6] border border-black/10 overflow-hidden flex items-center justify-center relative">
      {primaryImage ? (
       <>
        <img
         src={primaryImage}
         alt={product.title}
         className={`w-full h-full object-cover transition-all ${
          isUnavailable ? "opacity-60 grayscale" : ""
         }`}
        />
        {isUnavailable && (
         <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <span className="bg-stone-900 text-stone-100 px-4 py-2 text-[11px] uppercase tracking-[0.25em] font-mono font-medium">
           Piece Unavailable
          </span>
         </div>
        )}
       </>
      ) : (
       <div className="text-[11px] tracking-[0.3em] uppercase text-black/50 font-sans font-medium">
        [ High Resolution Gallery ]
       </div>
      )}
     </div>

     {/* Secondary Thumbnail Strip */}
     {product.images && product.images.length > 1 && (
      <div className="grid grid-cols-4 gap-4">
       {product.images.map((imgUrl, index) => (
        <div
         key={index}
         className="aspect-[3/4] bg-[#FAF9F6] border border-black/10 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
        >
         <img
          src={imgUrl}
          alt={`${product.title} view ${index + 1}`}
          className={`w-full h-full object-cover ${
           isUnavailable ? "grayscale opacity-60" : ""
          }`}
         />
        </div>
       ))}
      </div>
     )}
    </div>

    {/* Right Column: Garment Information & Bespoke CTA */}
    <div className="lg:col-span-5 flex flex-col justify-between space-y-10 lg:sticky lg:top-32">
     <div>
      <div className="flex justify-between items-center mb-2">
       {product.collection && (
        <span className="text-[10px] tracking-[0.3em] uppercase text-black/70 font-sans font-medium">
         {product.collection}
        </span>
       )}
       {product.productCode && (
        <span className="text-[10px] tracking-[0.2em] uppercase text-black/50 font-sans font-medium">
         REF: {product.productCode}
        </span>
       )}
      </div>

      <h1 className="font-serif text-3xl md:text-4xl tracking-wide font-medium text-black mb-3">
       {product.title}
      </h1>
      <p className="font-sans text-lg font-medium tracking-wider text-black mb-6">
       {isUnavailable ? (
        <span className="text-stone-400 font-mono uppercase text-sm">
         Piece Sold / Unavailable
        </span>
       ) : (
        `₱${product.price?.toLocaleString()}`
       )}
      </p>

      <div className="border-t border-b border-black/10 py-6 space-y-4">
       <div className="flex justify-between items-center text-[10px] tracking-[0.2em] uppercase font-sans">
        <span className="text-black/70 font-medium">Status</span>
        <span
         className={
          isUnavailable
           ? "text-rose-800 font-bold font-mono"
           : "text-emerald-700 font-medium"
         }
        >
         {isUnavailable ? "Unavailable / Archived" : "Available"}
        </span>
       </div>
       <div className="flex justify-between items-center text-[10px] tracking-[0.2em] uppercase font-sans">
        <span className="text-black/70 font-medium">Craftsmanship</span>
        <span className="text-black font-medium">Handmade / On-Demand</span>
       </div>
      </div>

      {/* Main Overview Description */}
      {product.description && (
       <div className="mt-8 font-sans text-xs md:text-sm font-normal text-black/80 leading-relaxed tracking-wide">
        {product.description}
       </div>
      )}

      {/* Extended Atelier Information Sections */}
      <div className="mt-8 space-y-6 border-t border-black/10 pt-6">
       {product.origins && (
        <div className="space-y-1">
         <span className="text-[10px] tracking-[0.25em] uppercase text-black/70 font-sans font-medium block">
          Origins & Provenance
         </span>
         <p className="font-sans text-xs font-normal text-black/80 leading-relaxed tracking-wide">
          {product.origins}
         </p>
        </div>
       )}

       {product.craftsmanship && (
        <div className="space-y-1">
         <span className="text-[10px] tracking-[0.25em] uppercase text-black/70 font-sans font-medium block">
          Craftsmanship & Technique
         </span>
         <p className="font-sans text-xs font-normal text-black/80 leading-relaxed tracking-wide">
          {product.craftsmanship}
         </p>
        </div>
       )}

       {product.measurements && product.measurements.length > 0 && (
        <div className="space-y-2">
         <span className="text-[10px] tracking-[0.25em] uppercase text-black/70 font-sans font-medium block">
          Measurements & Dimensions
         </span>
         <ul className="space-y-1">
          {product.measurements.map((item, index) => (
           <li
            key={index}
            className="font-sans text-xs font-normal text-black/80 tracking-wide flex items-center gap-2"
           >
            <span className="w-1 h-1 bg-black/70 rounded-full" />
            {item}
           </li>
          ))}
         </ul>
        </div>
       )}

       {product.details && product.details.length > 0 && (
        <div className="space-y-2">
         <span className="text-[10px] tracking-[0.25em] uppercase text-black/70 font-sans font-medium block">
          Atelier Notes & Care
         </span>
         <ul className="space-y-1">
          {product.details.map((detail, index) => (
           <li
            key={index}
            className="font-sans text-xs font-normal text-black/80 tracking-wide flex items-center gap-2"
           >
            <span className="w-1 h-1 bg-black/70 rounded-full" />
            {detail}
           </li>
          ))}
         </ul>
        </div>
       )}
      </div>
     </div>

     {/* CTAs */}
     <div className="space-y-3 pt-6 border-t border-black/10">
      <AddToCartButton product={product} />
      <ContactButton />
     </div>
    </div>
   </div>
  </div>
 );
}
