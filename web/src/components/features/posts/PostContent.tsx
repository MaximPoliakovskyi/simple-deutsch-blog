type Props = {
  html: string;
  className?: string;
};

export default function PostContent({ html, className = "" }: Props) {
  const classes = [
    "prose prose-slate md:prose-lg lg:prose-xl max-w-none",
    "prose-a:underline hover:prose-a:no-underline",
    "prose-img:rounded-xl prose-pre:rounded-xl prose-pre:overflow-x-auto",
    "dark:prose-invert dark:prose-a:text-gray-200",
    className,
  ];

  return <article className={classes.join(" ")} dangerouslySetInnerHTML={{ __html: html }} />;
}
