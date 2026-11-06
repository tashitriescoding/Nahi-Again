import { defineType, defineField } from "sanity";

export const product = defineType({
 name: "product",
 title: "Product",
 type: "document",
 fields: [
  defineField({
   name: "title",
   title: "Title",
   type: "string",
   validation: (Rule) => Rule.required(),
  }),
  defineField({
   name: "productCode",
   title: "Product Code / Reference",
   type: "string",
   description: "Unique identifier or SKU for this piece (e.g., NH-2026-001)",
  }),
  defineField({
   name: "slug",
   title: "Slug",
   type: "slug",
   options: { source: "title", maxLength: 96 },
   validation: (Rule) => Rule.required(),
  }),
  defineField({
   name: "status",
   title: "Availability Status",
   type: "string",
   options: {
    list: [
     { title: "Available", value: "Available" },
     { title: "Sold Out", value: "Sold Out" },
    ],
    layout: "radio",
   },
   initialValue: "Available",
  }),
  defineField({
   name: "price",
   title: "Price (USD)",
   type: "number",
  }),
  defineField({
   name: "collection",
   title: "Collection / Subtitle",
   type: "string",
   description: "e.g., Fall-Winter 2026",
  }),
  defineField({
   name: "categories",
   title: "Categories",
   type: "array",
   of: [{ type: "reference", to: [{ type: "category" }] }],
   description: "Select one or more categories for this product",
  }),
  defineField({
   name: "description",
   title: "Description",
   type: "text",
   rows: 4,
  }),
  defineField({
   name: "origins",
   title: "Origins & Provenance",
   type: "text",
   rows: 3,
   description:
    "Material sources, weaver notes, or regional lineage (e.g., Hand-loomed in Lumban, Laguna).",
  }),
  defineField({
   name: "craftsmanship",
   title: "Craftsmanship & Technique",
   type: "text",
   rows: 3,
   description:
    "Production method details (e.g., 120 hours of hand embroidery using archival techniques).",
  }),
  defineField({
   name: "measurements",
   title: "Measurements & Dimensions",
   type: "array",
   of: [{ type: "string" }],
   description: "Bullet points for garment dimensions or fit guidance.",
  }),
  defineField({
   name: "details",
   title: "Atelier Details & Care",
   type: "array",
   of: [{ type: "string" }],
   description:
    "Quick bullet points for care instructions, materials, or bespoke options.",
  }),
  defineField({
   name: "images",
   title: "Product Gallery",
   type: "array",
   of: [{ type: "image", options: { hotspot: true } }],
  }),
 ],
 // --- ADDED PREVIEW CONFIGURATION ---
 preview: {
  select: {
   title: "title",
   productCode: "productCode",
   media: "images.0", // Grabs the first image in the array for the thumbnail
  },
  prepare(selection) {
   const { title, productCode, media } = selection;
   return {
    title: title,
    // If a product code exists, display it. Otherwise, show a fallback message.
    subtitle: productCode ? `Code: ${productCode}` : "No product code set",
    media: media,
   };
  },
 },
});
