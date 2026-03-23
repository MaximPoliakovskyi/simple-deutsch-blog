type Props = {
  html: string;
  className?: string;
};

export default function PostContent({ html, className = "" }: Props) {
  const classes = [
    "sd-prose prose max-w-none md:prose-lg lg:prose-xl",
    "prose-a:underline hover:prose-a:no-underline prose-headings:scroll-mt-[calc(var(--main-nav-h)+var(--space-6))]",
    "prose-img:rounded-xl prose-pre:rounded-xl prose-pre:overflow-x-auto",
    className,
  ];

  return <article className={classes.join(" ")} dangerouslySetInnerHTML={{ __html: html }} />;
}
