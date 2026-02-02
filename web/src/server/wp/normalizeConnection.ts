export function extractConnectionNodes<T>(conn: unknown): T[] {
  if (!conn) return [];
  if (Array.isArray(conn)) return conn.filter(Boolean) as T[];

  const obj = conn as Record<string, unknown>;
  if (Array.isArray(obj.nodes)) return obj.nodes.filter(Boolean) as T[];
  if (Array.isArray(obj.edges)) {
    return (obj.edges as unknown[])
      .map((edge) => {
        if (!edge || typeof edge !== "object") return null;
        return (edge as { node?: unknown }).node ?? null;
      })
      .filter(Boolean) as T[];
  }

  return [];
}
