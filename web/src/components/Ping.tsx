"use client";
export default function Ping() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  return <p>Public URL: {siteUrl}</p>;
}