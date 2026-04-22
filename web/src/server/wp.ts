export * from "./client";
export type {
  Connection,
  NextInit,
  PolylangTranslation,
  PostDetail,
  PostLanguage,
  PostListItem,
  PostsConnectionResponse,
  PostTranslation,
  SearchPostsArgs,
  Tag,
  Term,
  WPAuthor,
  WPImage,
  WPPostCard,
} from "./types";
export {
  mapGraphQLEnumToUi,
  mapUiToGraphQLEnum,
  parseTranslations,
} from "./types";
