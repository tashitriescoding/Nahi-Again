"use client";

import { useCartStore } from "@/lib/store/useCartStore";

interface AddToCartButtonProps {
 product: {
  _id: string;
  title: string;
  price: number;
  slug: string | { current: string };
  productCode?: string; // 👈 1. Added productCode to props interface
  imageUrl?: string | null;
  images?: string[];
  status?: string;
 };
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
 console.log("1. AddToCartButton Product:", product);
 const addItem = useCartStore((state) => state.addItem);
 const openCart = useCartStore((state) => state.openCart);

 const primaryImage =
  product.imageUrl || (product.images && product.images[0]) || "";

 const slugString =
  typeof product.slug === "string" ? product.slug : product.slug?.current || "";

 const handleAddToCart = () => {
  addItem({
   _id: product._id,
   productCode: product.productCode || "", // 👈 2. Passed productCode into cart store
   title: product.title,
   price: product.price,
   slug: slugString,
   image: primaryImage,
  });
  openCart();
 };

 if (product.status !== "Available") {
  return (
   <button
    disabled
    className="w-full bg-black/10 text-black/60 text-[10px] tracking-[0.3em] uppercase py-4 font-sans font-medium cursor-not-allowed"
   >
    Archive Piece - Fully Commissioned
   </button>
  );
 }

 return (
  <button
   onClick={handleAddToCart}
   className="w-full bg-black text-white text-[10px] tracking-[0.3em] uppercase py-4 font-sans font-medium hover:bg-black/80 transition-colors cursor-pointer"
  >
   Add to Cart
  </button>
 );
}
