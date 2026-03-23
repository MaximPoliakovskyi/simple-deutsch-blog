"use client";

import dynamic from "next/dynamic";
import type { PostCardPost } from "@/features/posts/PostCard";
import PostCard from "@/features/posts/PostCard";

const CardCarousel = dynamic(() => import("@/shared/ui/CardCarousel"));

type Props = {
  description?: string;
  posts: PostCardPost[];
  title: string;
};

export default function SuccessStoriesSlider({ posts = [], title, description = "" }: Props) {
  if (!posts.length) return null;

  const displayPosts = posts.map((post) => ({
    ...post,
    categories: {
      nodes:
        post?.categories?.nodes?.filter(
          (category) =>
            category?.slug !== "success-stories" &&
            category?.slug !== "success-stories-uk" &&
            category?.slug !== "success-stories-ru",
        ) ?? [],
    },
  }));

  return (
    <CardCarousel
      description={description}
      items={displayPosts.map((post, index) => ({
        key: String(post.id ?? post.slug ?? index),
        node: <PostCard post={post} priority={false} />,
      }))}
      title={title}
      tone="contrast"
    />
  );
}
