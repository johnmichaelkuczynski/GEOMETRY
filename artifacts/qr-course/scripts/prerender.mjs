#!/usr/bin/env node
/**
 * Post-build prerender script for the four-week Geometry course.
 * Generates crawler-readable static HTML for each lecture and week route.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TOPICS, WEEK_META } from "./course-data.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "..", "dist", "public");
const publicDir = path.resolve(__dirname, "..", "public");

function getPublishedOrigin() {
  const suppliedUrl = process.env.PUBLISHED_URL?.trim();
  if (!suppliedUrl) return null;

  let url;
  try {
    url = new URL(suppliedUrl);
  } catch {
    throw new Error("[prerender] PUBLISHED_URL must be a valid published HTTPS URL.");
  }
  if (
    url.protocol !== "https:" ||
    !url.hostname ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      "[prerender] PUBLISHED_URL must be a published HTTPS origin without a path, query, or fragment.",
    );
  }
  return url.origin;
}

const SITE_ORIGIN = getPublishedOrigin();
const BASE_PATH = `/${(process.env.BASE_PATH ?? "/").split("/").filter(Boolean).join("/")}`;
const BASE_PREFIX = BASE_PATH === "/" ? "" : BASE_PATH;
const publishedUrl = (route) =>
  SITE_ORIGIN ? `${SITE_ORIGIN}${BASE_PREFIX}/${route.replace(/^\/+/, "")}` : null;

// ---------------------------------------------------------------------------
// 1. Load the built shell HTML
// ---------------------------------------------------------------------------
const shellPath = path.join(distDir, "index.html");
if (!fs.existsSync(shellPath)) {
  console.error(`[prerender] ERROR: ${shellPath} not found. Run vite build first.`);
  process.exit(1);
}
const shellHtml = fs.readFileSync(shellPath, "utf8");

// ---------------------------------------------------------------------------
// 2. Get verified lecture IDs from the seeded database. IDs are not stable
//    across course replacements, so never guess them from the lesson order.
// ---------------------------------------------------------------------------

/** @returns {Promise<Array<{id: number, title: string, weekNumber: number}>>} */
async function fetchLectureIds() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error("[prerender] DATABASE_URL is required to verify Geometry lecture links.");
  }
  let output;
  try {
    const { execFileSync } = await import("node:child_process");
    output = execFileSync(
      "psql",
      ["-d", dbUrl, "-t", "-A", "-F", "|", "-c", "SELECT id, title, week_number FROM lectures ORDER BY id"],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
    );
  } catch {
    // Do not include the database URL (or command arguments) in logs.
    throw new Error("[prerender] Could not read seeded Geometry lectures from the database.");
  }
  const rows = output
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [id, title, weekNumber] = line.split("|");
      return { id: Number(id), title, weekNumber: Number(weekNumber) };
    });
  const byTitle = new Map(rows.map((row) => [row.title, row]));
  if (
    rows.length !== TOPICS.length ||
    byTitle.size !== TOPICS.length ||
    TOPICS.some((topic) => {
      const row = byTitle.get(topic.lectureTitle);
      return !row || !Number.isInteger(row.id) || row.id <= 0 || row.weekNumber !== topic.weekNumber;
    })
  ) {
    throw new Error("[prerender] Database lectures do not match the current Geometry curriculum.");
  }
  console.log(`[prerender] Verified ${rows.length} Geometry lecture IDs from DATABASE_URL`);
  return rows;
}

const lectureIds = await fetchLectureIds();
const titleToId = new Map(lectureIds.map((lecture) => [lecture.title, lecture.id]));
const lectures = TOPICS.map((topic) => ({
  ...topic,
  id: titleToId.get(topic.lectureTitle),
}));

// ---------------------------------------------------------------------------
// 3. Helpers for metadata, JSON-LD, and HTML
// ---------------------------------------------------------------------------

function escHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function metaDescription(description) {
  const normalized = description.replace(/\s+/g, " ").trim();
  if (normalized.length <= 160) return normalized;
  return `${normalized.slice(0, 157).replace(/\s+\S*$/, "")}…`;
}

function serializeStructuredData(structuredData) {
  return JSON.stringify(structuredData, null, 2)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

function pageStructuredData({ kind, title, description, canonical, weekNumber, lecture }) {
  const websiteId = SITE_ORIGIN ? `${SITE_ORIGIN}/#website` : undefined;
  const organizationId = SITE_ORIGIN ? `${SITE_ORIGIN}/#organization` : undefined;
  const breadcrumbId = canonical ? `${canonical}#breadcrumb` : undefined;
  const pageId = canonical ? `${canonical}#webpage` : undefined;
  const rootUrl = publishedUrl("");
  const weekUrl = weekNumber ? publishedUrl(`weeks/${weekNumber}`) : null;
  const breadcrumbItems = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Geometry",
      ...(rootUrl ? { item: rootUrl } : {}),
    },
  ];

  if (weekNumber) {
    breadcrumbItems.push({
      "@type": "ListItem",
      position: breadcrumbItems.length + 1,
      name: WEEK_META[weekNumber].title,
      ...(weekUrl ? { item: weekUrl } : {}),
    });
  }

  if (kind === "lecture") {
    breadcrumbItems.push({
      "@type": "ListItem",
      position: breadcrumbItems.length + 1,
      name: lecture.lectureTitle,
      ...(canonical ? { item: canonical } : {}),
    });
  }

  const organization = {
    "@type": "Organization",
    ...(organizationId ? { "@id": organizationId } : {}),
    name: "Geometry",
    ...(rootUrl ? { url: rootUrl } : {}),
  };
  const website = {
    "@type": "WebSite",
    ...(websiteId ? { "@id": websiteId } : {}),
    name: "Geometry",
    ...(rootUrl ? { url: rootUrl } : {}),
    ...(organizationId ? { publisher: { "@id": organizationId } } : {}),
  };
  const graph = [
    organization,
    website,
    {
      "@type": "BreadcrumbList",
      ...(breadcrumbId ? { "@id": breadcrumbId } : {}),
      itemListElement: breadcrumbItems,
    },
  ];

  if (kind === "lecture") {
    const articleId = canonical ? `${canonical}#article` : undefined;
    graph.push(
      {
        "@type": "WebPage",
        ...(pageId ? { "@id": pageId } : {}),
        ...(canonical ? { url: canonical } : {}),
        name: title,
        description,
        ...(websiteId ? { isPartOf: { "@id": websiteId } } : {}),
        ...(breadcrumbId ? { breadcrumb: { "@id": breadcrumbId } } : {}),
        ...(articleId ? { mainEntity: { "@id": articleId } } : {}),
      },
      {
        "@type": "Article",
        ...(articleId ? { "@id": articleId } : {}),
        ...(canonical ? { url: canonical } : {}),
        headline: lecture.lectureTitle,
        name: lecture.lectureTitle,
        description,
        articleSection: `Week ${lecture.weekNumber}`,
        author: organizationId ? { "@id": organizationId } : organization,
        publisher: organizationId ? { "@id": organizationId } : organization,
        ...(websiteId ? { isPartOf: { "@id": websiteId } } : {}),
        ...(pageId ? { mainEntityOfPage: { "@id": pageId } } : {}),
        ...(breadcrumbId ? { breadcrumb: { "@id": breadcrumbId } } : {}),
        learningResourceType: "Lecture",
        educationalLevel: "Beginner",
        inLanguage: "en",
      },
    );
  } else {
    const weekLectures = lectures.filter((item) => item.weekNumber === weekNumber);
    graph.push({
      "@type": ["WebPage", "CollectionPage"],
      ...(pageId ? { "@id": pageId } : {}),
      ...(canonical ? { url: canonical } : {}),
      name: title,
      description,
      ...(websiteId ? { isPartOf: { "@id": websiteId } } : {}),
      ...(breadcrumbId ? { breadcrumb: { "@id": breadcrumbId } } : {}),
      mainEntity: {
        "@type": "ItemList",
        ...(canonical ? { "@id": `${canonical}#lectures` } : {}),
        name: `${WEEK_META[weekNumber].title} lessons`,
        numberOfItems: weekLectures.length,
        itemListElement: weekLectures.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.lectureTitle,
          ...(publishedUrl(`lectures/${item.id}`)
            ? { url: publishedUrl(`lectures/${item.id}`) }
            : {}),
        })),
      },
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

function buildPage({ title, description, canonical, bodyHtml, structuredData }) {
  let html = shellHtml;
  html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escHtml(title)}</title>`);
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${escHtml(description)}" />`,
  );
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:title" content="${escHtml(title)}" />`,
  );
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:title" content="${escHtml(title)}" />`,
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:description" content="${escHtml(description)}" />`,
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:description" content="${escHtml(description)}" />`,
  );

  // Strip any stale shell URL metadata, and add URL-bearing tags only for a
  // supplied, validated published origin.
  html = html.replace(/<link\s+rel=["']canonical["'][^>]*>/gi, "");
  html = html.replace(/<meta\s+property=["']og:url["'][^>]*>/gi, "");
  if (canonical) {
    html = html.replace(
      /<\/head>/i,
      `  <link rel="canonical" href="${escHtml(canonical)}" />\n  <meta property="og:url" content="${escHtml(canonical)}" />\n</head>`,
    );
  }

  const structuredDataScript = `<script id="page-structured-data" type="application/ld+json">\n${serializeStructuredData(structuredData)}\n</script>`;
  if (/\<script id="course-structured-data" type="application\/ld\+json">[\s\S]*?<\/script>/i.test(html)) {
    html = html.replace(
      /<script id="course-structured-data" type="application\/ld\+json">[\s\S]*?<\/script>/i,
      structuredDataScript,
    );
  } else {
    html = html.replace(/<\/head>/i, `${structuredDataScript}\n</head>`);
  }

  html = html.replace(/<div id="root"><\/div>/, `<div id="root">${bodyHtml}</div>`);
  return html;
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

function updateRobotsSitemap(sitemapUrl) {
  for (const robotsPath of [
    path.join(distDir, "robots.txt"),
    path.join(publicDir, "robots.txt"),
  ]) {
    if (!fs.existsSync(robotsPath)) continue;
    const robots = fs
      .readFileSync(robotsPath, "utf8")
      .replace(/^Sitemap:\s*.*(?:\r?\n|$)/gim, "")
      .trimEnd();
    writeFile(robotsPath, `${robots}${sitemapUrl ? `\n\nSitemap: ${sitemapUrl}` : ""}\n`);
  }
}

// ---------------------------------------------------------------------------
// 4. Generate lecture pages
// ---------------------------------------------------------------------------

console.log(`[prerender] Generating ${lectures.length} Geometry lecture pages…`);

for (const lecture of lectures) {
  const canonical = publishedUrl(`lectures/${lecture.id}`);
  const title = `${lecture.lectureTitle} — Geometry`;
  const description = metaDescription(
    lecture.metaDescription ??
      `${lecture.lectureTitle}: ${lecture.blurb} Learn geometry concepts and theorems.`,
  );
  const bodyHtml = `<article style="padding:2rem;max-width:860px;margin:0 auto;font-family:Georgia,serif;line-height:1.7">
<p style="font-size:.85rem;color:#666;margin-bottom:.5rem">Week ${lecture.weekNumber} — ${escHtml(WEEK_META[lecture.weekNumber].title)}</p>
<h1 style="font-size:2rem;font-weight:700;margin-bottom:1.5rem">${escHtml(lecture.lectureTitle)}</h1>
${lecture.body
  .split("\n\n")
  .map((paragraph) => `<p>${escHtml(paragraph.replace(/^#+\s*/, ""))}</p>`)
  .join("\n")}
</article>`;
  const html = buildPage({
    title,
    description,
    canonical,
    bodyHtml,
    structuredData: pageStructuredData({
      kind: "lecture",
      title,
      description,
      canonical,
      weekNumber: lecture.weekNumber,
      lecture,
    }),
  });
  writeFile(path.join(distDir, "lectures", String(lecture.id), "index.html"), html);
}

// ---------------------------------------------------------------------------
// 5. Generate week pages
// ---------------------------------------------------------------------------

console.log("[prerender] Generating Geometry week pages…");

for (const [weekNumberString, meta] of Object.entries(WEEK_META)) {
  const weekNumber = Number(weekNumberString);
  const canonical = publishedUrl(`weeks/${weekNumber}`);
  const title = `${meta.title} — Geometry`;
  const description = metaDescription(meta.metaDescription ?? meta.summary);
  const weekLectures = lectures.filter((lecture) => lecture.weekNumber === weekNumber);
  const lectureListHtml = weekLectures
    .map(
      (lecture) =>
        `<li><a href="${escHtml(`${BASE_PREFIX}/lectures/${lecture.id}`)}">${escHtml(lecture.lectureTitle)}</a> — ${escHtml(lecture.blurb)}</li>`,
    )
    .join("\n");
  const bodyHtml = `<main style="padding:2rem;max-width:860px;margin:0 auto;font-family:Georgia,serif;line-height:1.7">
<h1 style="font-size:2rem;font-weight:700;margin-bottom:1rem">${escHtml(meta.title)}</h1>
<p style="font-size:1.1rem;color:#444;margin-bottom:2rem">${escHtml(meta.summary)}</p>
<h2 style="font-size:1.3rem;font-weight:600;margin-bottom:1rem">Lessons</h2>
<ul style="list-style:disc;padding-left:1.5rem;display:flex;flex-direction:column;gap:.5rem">
${lectureListHtml}
</ul>
</main>`;
  const html = buildPage({
    title,
    description,
    canonical,
    bodyHtml,
    structuredData: pageStructuredData({
      kind: "week",
      title,
      description,
      canonical,
      weekNumber,
    }),
  });
  writeFile(path.join(distDir, "weeks", String(weekNumber), "index.html"), html);
}

// ---------------------------------------------------------------------------
// 6. Generate a sitemap only when a real published origin was supplied
// ---------------------------------------------------------------------------

const sitemapPaths = [
  "",
  ...Object.keys(WEEK_META).map((weekNumber) => `weeks/${weekNumber}`),
  ...lectures.map((lecture) => `lectures/${lecture.id}`),
];

if (SITE_ORIGIN) {
  const today = new Date().toISOString().slice(0, 10);
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapPaths
  .map(
    (route) => `  <url>
    <loc>${escHtml(publishedUrl(route))}</loc>
    <lastmod>${today}</lastmod>
  </url>`,
  )
  .join("\n")}
</urlset>
`;
  writeFile(path.join(distDir, "sitemap.xml"), sitemap);
  writeFile(path.join(publicDir, "sitemap.xml"), sitemap);
  updateRobotsSitemap(publishedUrl("sitemap.xml"));
  console.log(`[prerender] Wrote sitemap.xml for ${sitemapPaths.length} Geometry routes.`);
} else {
  for (const sitemapPath of [
    path.join(distDir, "sitemap.xml"),
    path.join(publicDir, "sitemap.xml"),
  ]) {
    if (fs.existsSync(sitemapPath)) fs.unlinkSync(sitemapPath);
  }
  updateRobotsSitemap(null);
  console.log(
    "[prerender] No PUBLISHED_URL supplied; omitted canonical URLs and removed sitemap.xml.",
  );
}

console.log(
  `[prerender] Done. Generated ${lectures.length} lecture pages and ${Object.keys(WEEK_META).length} week pages.`,
);