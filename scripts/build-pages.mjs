/* ==========================================================================
   Haven Estates — static page assembler
   Combines the shared layout with each page partial, injects per-page SEO
   metadata and writes real HTML files at the project root. Also generates
   robots.txt and sitemap.xml so hosting needs no server-side routing.
   ========================================================================== */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const configPath = path.join(root, "scripts", "pages.json");
const layoutPath = path.join(root, "partials", "layout.html");

const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const layout = fs.readFileSync(layoutPath, "utf8");
const site = config.siteUrl.replace(/\/+$/, "");

function readPartial(partial) {
  const file = path.join(root, "partials", "pages", partial);
  if (!fs.existsSync(file)) throw new Error(`Missing page partial: ${partial}`);
  return fs.readFileSync(file, "utf8");
}

function absoluteUrl(relativePath) {
  return `${site}/${relativePath.replace(/^\/+/, "")}`;
}

function canonicalFor(page) {
  return page.path === "/" ? `${site}/` : `${site}${page.path}`;
}

function scriptMarkup(scripts) {
  return scripts
    .map((src) => {
      if (!fs.existsSync(path.join(root, src))) throw new Error(`Missing script: ${src}`);
      return `<script defer src="${src}"></script>`;
    })
    .join("\n  ");
}

function fill(template, tokens, label) {
  let output = template;
  for (const [key, value] of Object.entries(tokens)) {
    output = output.split(`{{${key}}}`).join(String(value));
  }

  const unresolved = output.match(/\{\{[A-Z0-9_]+\}\}/g);
  if (unresolved) {
    throw new Error(`${label} has unresolved placeholders: ${[...new Set(unresolved)].join(", ")}`);
  }

  return output;
}

const seen = new Set();

for (const page of config.pages) {
  if (!page.file || !page.partial || !page.title || !page.description) {
    throw new Error(`Page config is incomplete: ${JSON.stringify(page)}`);
  }
  if (seen.has(page.file)) throw new Error(`Duplicate output file: ${page.file}`);
  seen.add(page.file);

  const content = readPartial(page.partial);
  const canonical = canonicalFor(page);
  const image = page.image || config.defaultImage;
  const imageAlt = page.imageAlt || config.defaultImageAlt;
  const scripts = page.scripts || [];

  const tokens = {
    TITLE: page.title,
    DESCRIPTION: page.description,
    ROBOTS: page.robots || "index, follow",
    CANONICAL: canonical,
    OG_TYPE: page.ogType || "website",
    OG_TITLE: page.ogTitle || page.title,
    OG_DESCRIPTION: page.ogDescription || page.description,
    OG_IMAGE: absoluteUrl(image),
    OG_IMAGE_ALT: imageAlt,
    SITE_URL: `${site}/`,
    BODY_CLASS: page.bodyClass || "",
    SECTION: page.section || "",
    HEADER_CLASS: page.header || "site-header",
    CONTENT: content.trimEnd(),
    BLOG_DATA_SCRIPT: page.blog ? `<script defer src="js/blog-data.js"></script>` : "",
    PAGE_SCRIPTS: scriptMarkup(scripts)
  };

  const html = fill(layout, tokens, page.file);
  fs.writeFileSync(path.join(root, page.file), html, "utf8");
  console.log(`built ${page.file}`);
}

const sitemapPages = config.pages.filter((page) => page.sitemap !== false);
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...sitemapPages.flatMap((page) => [
    "  <url>",
    `    <loc>${canonicalFor(page)}</loc>`,
    `    <lastmod>${config.lastmod}</lastmod>`,
    "    <changefreq>monthly</changefreq>",
    `    <priority>${page.priority || "0.5"}</priority>`,
    "  </url>"
  ]),
  "</urlset>",
  ""
].join("\n");

const robots = [
  "User-agent: *",
  "Allow: /",
  "Disallow: /404.html",
  "Disallow: /partials/",
  "Disallow: /scripts/",
  "",
  `Sitemap: ${site}/sitemap.xml`,
  ""
].join("\n");

fs.writeFileSync(path.join(root, "sitemap.xml"), sitemap, "utf8");
fs.writeFileSync(path.join(root, "robots.txt"), robots, "utf8");
console.log(`built sitemap.xml (${sitemapPages.length} URLs) and robots.txt`);
