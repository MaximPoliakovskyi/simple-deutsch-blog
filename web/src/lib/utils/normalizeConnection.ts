/**
 * Small runtime helper to normalize GraphQL connection shapes to an array of nodes.
 * Accepts either { nodes: T[] } or { edges: Array<{ node?: T | null }> } or a plain array.
 * Avoids use of `any` in callers by returning T[] with runtime checks.
 */
export function extractConnectionNodes<T>(conn: unknown): T[] {
  if (!conn) return [];
  if (Array.isArray(conn)) return conn.filter(Boolean) as T[];
  if (typeof conn === "object") {
    const asObj = conn as Record<string, unknown>;
    if (Array.isArray(asObj.nodes)) return asObj.nodes.filter(Boolean) as T[];
    if (Array.isArray(asObj.edges)) {
      const edges = asObj.edges as Array<unknown>;
      const nodes: T[] = [];
      for (const e of edges) {
        if (e && typeof e === "object") {
          const ee = e as Record<string, unknown>;
          const node = ee.node as unknown;
          if (node) nodes.push(node as T);
        }
      }
      return nodes;
    }
    return (asObj.edges as Array<unknown>)
      .map((e) => {
        if (e && typeof e === "object") return (e as Record<string, unknown>).node as unknown;
        return null;
      })
      .filter(Boolean) as T[];
  }
  return [];
}
