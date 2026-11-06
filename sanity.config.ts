import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./src/sanity/schemaTypes"; // Adjust import path if schemaTypes is inside src/ or sanity/

export default defineConfig({
 name: "default",
 title: "Nahi House Studio",

 projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
 dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",

 plugins: [structureTool()],

 schema: {
  types: schemaTypes,
 },
});
