import { defineField, defineType } from "sanity";

export const navigation = defineType({
 name: "navigation",
 title: "Navigation & Sidebar",
 type: "document",
 fields: [
  defineField({
   name: "sidebarItems",
   title: "Sidebar Menu Items",
   type: "array",
   of: [
    {
     type: "object",
     name: "navItem",
     title: "Navigation Item",
     fields: [
      defineField({
       name: "label",
       title: "Button Label",
       type: "string",
       validation: (Rule) => Rule.required(),
      }),
      defineField({
       name: "linkType",
       title: "Link Type",
       type: "string",
       options: {
        list: [
         { title: "Custom Path (e.g. /collection, /about)", value: "custom" },
         { title: "Sanity Category Link", value: "category" },
        ],
        layout: "radio",
       },
       initialValue: "custom",
      }),
      defineField({
       name: "customUrl",
       title: "URL Path",
       type: "string",
       hidden: ({ parent }) => parent?.linkType === "category",
      }),
      defineField({
       name: "categoryRef",
       title: "Select Category",
       type: "reference",
       to: [{ type: "category" }],
       hidden: ({ parent }) => parent?.linkType !== "category",
      }),
     ],
    },
   ],
  }),
 ],
});
