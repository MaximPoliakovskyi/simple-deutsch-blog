// Re-export the global not-found UI so localized not-found routes render the
// same Page Not Found screen instead of returning an empty fragment.
// Use a relative import to avoid resolving issues in the dev server bundler.
export { default } from "../../not-found";
