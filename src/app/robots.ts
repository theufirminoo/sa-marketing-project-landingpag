import type { MetadataRoute } from "next";

import { temProvisorios } from "@/content/provisorios";
import { site } from "@/content/site";

/** Enquanto houver dado provisório, a indexação fica bloqueada. */
export default function robots(): MetadataRoute.Robots {
  if (temProvisorios) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/ds"] },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
