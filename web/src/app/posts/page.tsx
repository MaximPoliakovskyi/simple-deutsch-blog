import type { ReactElement } from "react";
import PostsIndex from "./PostsIndex";

export default async function Page(): Promise<ReactElement> {
  return <PostsIndex locale={"en"} />;
}
