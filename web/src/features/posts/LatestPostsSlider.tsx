"use client";

import dynamic from "next/dynamic";
import type { PostCardPost } from "@/features/posts/PostCard";
import PostCard from "@/features/posts/PostCard";

const CardCarousel = dynamic(() => import("@/shared/ui/CardCarousel"));

type Props = {
  posts: PostCardPost[];
  title: string;
};

export default function LatestPostsSlider({ posts = [], title }: Props) {
  if (!posts.length) return null;

  return (
    <CardCarousel
      items={posts.map((post, index) => ({
        key: String(post.id ?? post.slug ?? index),
        node: <PostCard post={post} priority={false} />,
      }))}
      title={title}
    />
  );
}
