import { neon } from '@neondatabase/serverless'

const H = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export default async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: H })

  const sql = neon(process.env.NEON_DATABASE_URL)

  try {
    if (req.method === 'GET') {
      const rows = await sql`SELECT * FROM projects ORDER BY created_at DESC`
      return Response.json(rows, { headers: H })
    }
    if (req.method === 'POST') {
      const b = await req.json()
      const [row] = await sql`
        INSERT INTO projects (name,status,gha,prog,repo,supa,supid,dep,plat,notes)
        VALUES (${b.name},${b.status||'progress'},${b.gha||''},${b.prog||'0'},
                ${b.repo||''},${b.supa||''},${b.supid||''},${b.dep||''},
                ${b.plat||''},${b.notes||''}) RETURNING *`
      return Response.json(row, { headers: H })
    }
    if (req.method === 'PUT') {
      const b = await req.json()
      const [row] = await sql`
        UPDATE projects SET name=${b.name},status=${b.status},gha=${b.gha||''},
        prog=${b.prog||'0'},repo=${b.repo||''},supa=${b.supa||''},
        supid=${b.supid||''},dep=${b.dep||''},plat=${b.plat||''},notes=${b.notes||''}
        WHERE id=${b.id} RETURNING *`
      return Response.json(row, { headers: H })
    }
    if (req.method === 'DELETE') {
      const b = await req.json()
      await sql`DELETE FROM projects WHERE id=${b.id}`
      return Response.json({ ok: true }, { headers: H })
    }
    return Response.json({ error: 'method not allowed' }, { status: 405, headers: H })
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500, headers: H })
  }
}

export const config = { path: '/api/projects' }
