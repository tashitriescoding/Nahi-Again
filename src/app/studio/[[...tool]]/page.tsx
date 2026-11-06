"use client";

import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config"; // Adjust relative path to your sanity.config file

export default function StudioPage() {
 return <NextStudio config={config} />;
}
