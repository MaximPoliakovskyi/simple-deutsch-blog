// Minimal types for the blog UI

export type WpSeo = {
  title?: string | null;
  metaDesc?: string | null;
} | null;

export type WpCategory = { name: string; slug: string };

export type WpPost = {
  slug: string;
  title: string;
  content: string;
  date: string; // ISO string
  author?: { node?: { name?: string | null } | null } | null;
  categories?: { nodes: WpCategory[] } | null;
  seo?: WpSeo;
};

export type WpPostListItem = {
  slug: string;
  title: string;
  excerpt?: string | null;
  date: string;
  featuredImage?: {
    node?: { sourceUrl?: string | null; altText?: string | null } | null;
  } | null;
};
