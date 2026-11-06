import { notFound } from "next/navigation";
import Link from "next/link";
import { getCategoryWithProducts } from "@/lib/sanity/queries";

interface CategoryPageProps {
 params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
 const { slug } = await params;
 const category = await getCategoryWithProducts(slug);

 if (!category) {
  notFound();
 }

 return (
  <div className="pt-24 sm:pt-32 pb-16 sm:pb-24 px-3 sm:px-6 md:px-12 max-w-7xl mx-auto min-h-screen flex flex-col">
   {/* Breadcrumb Navigation */}
   <div className="mb-6 sm:mb-12 flex items-center gap-1.5 sm:gap-2 text-[8px] sm:text-[10px] tracking-wider sm:tracking-[0.2em] uppercase font-sans text-black/60 font-medium">
    <Link href="/" className="hover:text-black transition-colors">
     Home
    </Link>
    <span>/</span>
    <span className="text-black/80">Collections</span>
    <span>/</span>
    <span className="text-black truncate">{category.title}</span>
   </div>

   {/* Category Header */}
   <div className="mb-8 sm:mb-16 max-w-2xl">
    <span className="text-[8px] sm:text-[10px] tracking-wider sm:tracking-[0.3em] uppercase text-black/70 font-sans font-medium block mb-2 sm:mb-3">
     Curated Collection
    </span>
    <h1 className="font-serif text-2xl sm:text-3xl md:text-5xl tracking-normal sm:tracking-[0.15em] uppercase font-medium mb-3 sm:mb-6 text-black">
     {category.title}
    </h1>
    {category.description ? (
     <p className="font-sans text-[11px] sm:text-xs md:text-sm font-normal text-black/80 leading-relaxed tracking-wide">
      {category.description}
     </p>
    ) : (
     <p className="font-sans text-[11px] sm:text-xs md:text-sm font-normal text-black/70 leading-relaxed tracking-wide">
      A curated selection of garments under the {category.title} atelier
      discipline, handcrafted with archival techniques.
     </p>
    )}
   </div>

   {/* Product Grid - 3 Columns across all screen sizes */}
   {category.products && category.products.length > 0 ? (
    <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 gap-y-6 sm:gap-y-12 lg:gap-y-16">
     {category.products.map((product) => {
      const displayImage =
       product.imageUrl || (product.images && product.images[0]) || null;

      return (
       <Link
        key={product._id}
        href={`/product/${product.slug.current}`}
        className="group block space-y-1.5 sm:space-y-3"
       >
        {/* Image Frame */}
        <div className="aspect-[3/4] bg-[#FAF9F6] border border-black/10 overflow-hidden relative flex items-center justify-center">
         {displayImage ? (
          <img
           src={displayImage}
           alt={product.title}
           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          />
         ) : (
          <div className="text-[8px] sm:text-[10px] tracking-widest uppercase text-black/50 font-sans font-medium text-center p-1">
           [ NAHI ATELIER ]
          </div>
         )}

         {/* Status Tag */}
         {product.status === "Sold Out" && (
          <span className="absolute top-1.5 right-1.5 sm:top-4 sm:right-4 bg-black/90 text-white text-[7px] sm:text-[9px] tracking-wider sm:tracking-[0.25em] uppercase px-1.5 py-0.5 sm:px-3 sm:py-1 font-sans font-medium">
           Sold
          </span>
         )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline pt-0.5 gap-0.5 sm:gap-2">
         <div className="min-w-0 flex-1">
          {product.collection && (
           <span className="text-[8px] sm:text-[9px] tracking-wider sm:tracking-[0.25em] uppercase text-black/70 font-sans font-medium block line-clamp-1">
            {product.collection}
           </span>
          )}
          <h3 className="font-serif text-[11px] sm:text-base md:text-lg tracking-tight sm:tracking-wide text-black font-medium group-hover:opacity-70 transition-opacity line-clamp-1">
           {product.title}
          </h3>
         </div>
         <p className="font-sans text-[9px] sm:text-xs font-medium tracking-wider text-black shrink-0">
          ₱{product.price?.toLocaleString()}
         </p>
        </div>
       </Link>
      );
     })}
    </div>
   ) : (
    <div className="flex-1 flex flex-col items-center justify-center py-16 sm:py-24 text-center border-t border-b border-black/10 mt-8">
     <span className="text-[8px] sm:text-[10px] tracking-wider sm:tracking-[0.3em] uppercase text-black/70 font-sans font-medium block mb-3 sm:mb-4">
      Inventory Notice
     </span>
     <p className="font-serif text-base sm:text-lg text-black/80 tracking-wider font-medium">
      No releases currently available in this category.
     </p>
     <Link
      href="/"
      className="mt-6 sm:mt-8 text-[9px] sm:text-[10px] tracking-[0.2em] uppercase font-sans font-medium text-black border-b border-black pb-1 hover:text-black/60 hover:border-black/60 transition-colors"
     >
      Return to Homepage
     </Link>
    </div>
   )}
  </div>
 );
}
