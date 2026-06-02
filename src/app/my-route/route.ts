export async function GET() {
  return Response.json({ 
    message: 'Esta es una ruta personalizada de ejemplo.',
    status: 'ok'
  })
}
