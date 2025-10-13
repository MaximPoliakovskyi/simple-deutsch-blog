// src/app/rss.xml/route.ts
/**
 * RSS 2.0 feed for simple-deutsch.de at /rss.xml
 *
 * Docs:
 * - Route Handlers: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
 * - Caching & revalidate: https://nextjs.org/docs/app/building-your-application/caching#time-based-revalidation
 * - Edge runtime: https://nextjs.org/docs/app/building-your-application/rendering/edge-and-nodejs-runtimes#opting-into-a-runtime
 * - RSS 2.0: https://www.rssboard.org/rss-specification
 */

import type { NextRequest } from "next/server";
import { getPosts } from "@/lib/wp/api"; // ✅ use your actual export

export const revalidate = 900; // 15 minutes
export const runtime = "edge";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://simple-deutsch.de";
const SITE_TITLE = process.env.NEXT_PUBLIC_SITE_TITLE ?? "Simple Deutsch";
const SITE_DESCRIPTION =
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION ?? "Einfache, klare Inhalte auf Simple Deutsch.";

function xmlEscape(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

type RssPost = {
  slug: string;
  title: string;
  excerpt?: string | null;
  date?: string | null;
};

function postToRssItem(post: RssPost): string {
  const url = `${SITE_URL}/posts/${post.slug}`;
  const title = xmlEscape(post.title ?? "Ohne Titel");
  const descriptionPlain = xmlEscape((post.excerpt ?? "").replace(/(<([^>]+)>)/gi, "").trim());
  const pubDate = post.date ? new Date(post.date).toUTCString() : new Date().toUTCString();

  return `
    <item>
      <title>${title}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description><![CDATA[${post.excerpt ?? descriptionPlain}]]></description>
      <pubDate>${pubDate}</pubDate>
    </item>`;
}

export async function GET(_req: NextRequest): Promise<Response> {
  // Your getPosts likely accepts { first, after }. We only need the latest batch.
  const { posts } = await getPosts({ first: 30 });

  // Handle either an array (posts[]) or a connection (posts.nodes[])
  const list: RssPost[] = Array.isArray(posts)
    ? posts
    : ((posts?.nodes as RssPost[] | undefined) ?? []);

  const lastBuildDate = new Date().toUTCString();
  const selfUrl = `${SITE_URL}/rss.xml`;

  const itemsXml = list.map(postToRssItem).join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <atom:link href="${selfUrl}" rel="self" type="application/rss+xml" />
    <description>${xmlEscape(SITE_DESCRIPTION)}</description>
    <language>de</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
${itemsXml}
  </channel>
</rss>`;

  return new Response(rss, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=900, stale-while-revalidate=59",
    },
  });
}
