import { neon } from '@neondatabase/serverless'

const H = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export default async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: H })

  const sql = neon(process.env.NEON_DATABASE_URL)

  try {
    if (req.method === 'GET') {
      const rows = await sql`SELECT * FROM accounts ORDER BY created_at DESC`
      return Response.json(rows, { headers: H })
    }
    if (req.method === 'POST') {
      const b = await req.json()
      const [row] = await sql`
        INSERT INTO accounts (type,name,email,key_enc,url)
        VALUES (${b.type||'otro'},${b.name},${b.email||''},${b.key_enc||''},${b.url||''})
        RETURNING *`
      return Response.json(row, { headers: H })
    }
    if (req.method === 'DELETE') {
      const b = await req.json()
      await sql`DELETE FROM accounts WHERE id=${b.id}`
      return Response.json({ ok: true }, { headers: H })
    }
    return Response.json({ error: 'method not allowed' }, { status: 405, headers: H })
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500, headers: H })
  }
}

export const config = { path: '/api/accounts' }
