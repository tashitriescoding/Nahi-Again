"use client";

export default function ContactButton() {
 const handleOpenContact = () => {
  window.dispatchEvent(new CustomEvent("open-contact-drawer"));
 };

 return (
  <button
   type="button"
   onClick={handleOpenContact}
   className="block w-full border border-black/30 text-black text-[10px] tracking-[0.3em] uppercase py-4 text-center font-sans font-medium hover:border-black transition-colors cursor-pointer"
  >
   CONTACT NAHI HOUSE
  </button>
 );
}
