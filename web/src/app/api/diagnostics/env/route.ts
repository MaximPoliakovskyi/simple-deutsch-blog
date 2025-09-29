export const revalidate = 0
export async function GET(req: Request) {
  const url = new URL(req.url)
  const key = url.searchParams.get('key') // e.g. REVALIDATION_TOKEN
  const val = key ? process.env[key] : undefined
  return Response.json({
    key,
    defined: typeof val === 'string',
    length: typeof val === 'string' ? val.length : 0,
  })
}
