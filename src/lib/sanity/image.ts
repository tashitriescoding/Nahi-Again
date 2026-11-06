import imageUrlBuilder from "@sanity/image-url";
import { client } from "./client"; // Adjust this path to wherever your configured Sanity client is exported

const builder = imageUrlBuilder(client);

export function urlFor(source: any) {
 return builder.image(source);
}
