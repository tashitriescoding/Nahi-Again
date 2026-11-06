import { defineType, defineField } from "sanity";

export const homepage = defineType({
 name: "homepage",
 title: "Homepage Curation",
 type: "document",
 fields: [
  defineField({
   name: "title",
   title: "Page Title / Identifier",
   type: "string",
   initialValue: "Main Homepage",
   readOnly: true,
  }),
  // Hero Curation Fields
  defineField({
   name: "heroTitle",
   title: "Hero Title",
   type: "string",
   initialValue: "NAHI HOUSE",
   validation: (Rule) => Rule.required(),
  }),
  defineField({
   name: "heroSubtitle",
   title: "Hero Subtitle / Tagline",
   type: "text",
   rows: 2,
   initialValue: "Made-To-Order & Bespoke Atelier",
  }),
  defineField({
   name: "heroImage",
   title: "Hero Cover Image",
   type: "image",
   options: { hotspot: true },
  }),
  defineField({
   name: "heroCtaText",
   title: "Hero Button Text",
   type: "string",
   initialValue: "Explore Collection",
  }),
  defineField({
   name: "heroCtaLink",
   title: "Hero Button Link",
   type: "string",
   initialValue: "#latest",
  }),
  // Latest Releases Fields
  defineField({
   name: "releaseHeading",
   title: "Latest Releases Heading",
   type: "string",
   description:
    'The seasonal title displayed above product cards (e.g., "Fall-Winter 2026").',
   initialValue: "Fall-Winter 2026",
   validation: (Rule) => Rule.required(),
  }),
  defineField({
   name: "latestReleases",
   title: "Featured Latest Releases",
   description:
    "Select and reorder products to feature in the Latest Releases section.",
   type: "array",
   of: [
    {
     type: "reference",
     to: [{ type: "product" }],
    },
   ],
  }),
  // Campaign / Editorial Block Fields
  defineField({
   name: "campaignTitle",
   title: "Campaign Section Title",
   type: "string",
   initialValue: "Explore unique 1-1 pieces",
  }),
  defineField({
   name: "campaignCtaText",
   title: "Campaign Button Text",
   type: "string",
   initialValue: "Shop Now",
  }),
  defineField({
   name: "campaignCtaLink",
   title: "Campaign Button Link",
   type: "string",
   initialValue: "/collection",
  }),
  defineField({
   name: "campaignImage",
   title: "Campaign Image",
   type: "image",
   options: { hotspot: true },
  }),
 ],
});
