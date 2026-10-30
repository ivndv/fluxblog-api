import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { openapi } from 'payload-oapi'

// Importación de las definiciones de colecciones
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Posts } from './collections/Posts'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// R2 storage is enabled only when all credentials are present.
// Local development keeps using Payload's default disk storage.
const r2Enabled = Boolean(
  process.env.R2_BUCKET &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_ENDPOINT &&
    process.env.R2_PUBLIC_URL,
)

// Configuración central de Payload CMS
export default buildConfig({
  serverURL: process.env.SERVER_URL || process.env.NEXT_PUBLIC_SERVER_URL || '',
  admin: {
    user: Users.slug, // Colección que maneja el acceso al panel admin
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  // Localización (i18n)
  localization: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
    fallback: true,
  },
  // Lista de colecciones registradas en el sistema
  collections: [Users, Media, Posts],
  // Editor de texto enriquecido moderno Lexical
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  // Autogeneración de tipos de TypeScript
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // Adaptador de base de datos Postgres
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [
    openapi({
      openapiVersion: '3.0',
      metadata: {
        title: 'Fluxdev Blog API',
        description: 'Documentación oficial de la API del CMS Fluxdev.',
        version: '1.0.0',
      },
    }),
    s3Storage({
      enabled: r2Enabled,
      collections: {
        media: {
          prefix: 'fluxblog/media',
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename }) =>
            `${process.env.R2_PUBLIC_URL}/${filename}`,
        },
      },
      bucket: process.env.R2_BUCKET || '',
      config: {
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
        region: 'auto',
        endpoint: process.env.R2_ENDPOINT,
        forcePathStyle: true,
      },
    }),
  ],
  endpoints: [
    {
      path: '/docs',
      method: 'get',
      handler: async () => {
        return new Response(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="utf-8" />
            <title>SwaggerUI</title>
            <link href="https://cdn.jsdelivr.net/npm/swagger-ui@5.20.0/dist/swagger-ui.min.css" rel="stylesheet">
          </head>
          <body>
          <div id="swagger-ui"></div>
          <script src="https://cdn.jsdelivr.net/npm/swagger-ui@5.20.0/dist/swagger-ui-bundle.min.js"></script>
          <script>
            window.onload = () => {
              window.ui = SwaggerUIBundle({
                url: '/api/openapi.json',
                dom_id: '#swagger-ui',
              });
            };
          </script>
          </body>
          </html>
        `, {
          headers: {
            'content-type': 'text/html',
          },
        })
      },
    },
    {
      path: '/health',
      method: 'get',
      handler: async () => {
        return Response.json({
          status: 'ok',
          service: 'fluxblog-api',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
        })
      },
    },
  ],
})
