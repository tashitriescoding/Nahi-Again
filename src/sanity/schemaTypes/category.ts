import { defineType, defineField } from "sanity";

export const category = defineType({
 name: "category",
 title: "Category",
 type: "document",
 fields: [
  defineField({
   name: "title",
   title: "Category Title",
   type: "string",
   validation: (Rule) => Rule.required(),
  }),
  defineField({
   name: "isVisible",
   title: "Display Category",
   type: "boolean",
   description:
    "Turn this on to display the category on the website. Turn off to hide it.",
   initialValue: true,
  }),
  defineField({
   name: "slug",
   title: "Slug",
   type: "slug",
   options: { source: "title", maxLength: 96 },
   validation: (Rule) => Rule.required(),
  }),
  defineField({
   name: "description",
   title: "Description",
   type: "text",
   rows: 3,
  }),
  defineField({
   name: "image",
   title: "Cover Image",
   type: "image",
   options: { hotspot: true },
  }),
 ],
});
