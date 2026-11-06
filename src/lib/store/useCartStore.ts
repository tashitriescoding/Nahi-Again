import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
 _id: string;
 title: string;
 slug: string;
 productCode?: string; // 👈 Added productCode to cart item contract
 price: number;
 image: string;
}

interface CartStore {
 items: CartItem[];
 isOpen: boolean;
 openCart: () => void;
 closeCart: () => void;
 addItem: (item: CartItem) => void;
 removeItem: (id: string) => void;
 clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
 persist(
  (set, get) => ({
   items: [],
   isOpen: false,

   openCart: () => set({ isOpen: true }),
   closeCart: () => set({ isOpen: false }),

   addItem: (newItem) => {
    const { items } = get();
    const index = items.findIndex((item) => item._id === newItem._id);

    if (index > -1) {
     // Merge and update existing cart item with latest properties
     const updatedItems = [...items];
     updatedItems[index] = { ...updatedItems[index], ...newItem };
     set({ items: updatedItems, isOpen: true });
    } else {
     set({ items: [...items, newItem], isOpen: true });
    }
   },

   removeItem: (id) => {
    set({ items: get().items.filter((item) => item._id !== id) });
   },

   clearCart: () => set({ items: [] }),
  }),
  {
   name: "nahi-house-cart",
  },
 ),
);
