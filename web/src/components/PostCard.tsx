import Image from "next/image";
import Link from "next/link";

type Props = {
  slug: string;
  title: string;
  date: string;           // ISO from WP
  excerpt?: string | null;
  image?: {
    url?: string | null;
    alt?: string | null;
    width?: number | null;
    height?: number | null;
  };
};

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, "").trim();
}

export default function PostCard({ slug, title, date, excerpt, image }: Props) {
  const plain = excerpt ? stripHtml(excerpt) : "";
  return (
    <article className="grid grid-cols-[120px_1fr] gap-4">
      {image?.url && image?.width && image?.height ? (
        <Link href={`/posts/${slug}`} className="block aspect-[4/3] relative">
          <Image
            src={image.url}
            alt={image.alt || ""}
            width={image.width}
            height={image.height}
            className="rounded-xl object-cover"
            sizes="(max-width: 640px) 40vw, 120px"
            priority={false}
          />
        </Link>
      ) : (
        <div className="bg-gray-100 rounded-xl" aria-hidden />
      )}
      <div>
        <h2 className="text-lg font-medium leading-snug">
          <Link href={`/posts/${slug}`} className="hover:underline">{title}</Link>
        </h2>
        <p className="text-sm text-gray-500 mt-1">{new Date(date).toLocaleDateString()}</p>
        {plain && <p className="text-sm mt-2 line-clamp-3">{plain}</p>}
      </div>
    </article>
  );
}