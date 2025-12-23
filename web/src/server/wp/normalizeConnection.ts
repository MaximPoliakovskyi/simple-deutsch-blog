export function extractConnectionNodes<T>(conn: unknown): T[] {
  if (!conn) return [];
  if (Array.isArray(conn)) return conn.filter(Boolean) as T[];

  const obj = conn as Record<string, unknown>;
  if (Array.isArray(obj.nodes)) return obj.nodes.filter(Boolean) as T[];
  if (Array.isArray(obj.edges)) {
    return obj.edges.map((e: any) => e?.node).filter(Boolean) as T[];
  }

  return [];
}
