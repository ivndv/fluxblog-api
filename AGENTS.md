# AGENTS.md — FluxBlog API

Guía operativa y técnica para agentes de IA que colaboren en el desarrollo, mantenimiento, testing y optimización del backend headless CMS **FluxBlog API**.

## 1. Visión general

**FluxBlog API** es el motor central de gestión de contenido (Headless CMS) y panel de administración del ecosistema de blogs técnicos de FluxDev. Está construido sobre **Payload CMS 3.0** integrado con **Next.js 15 (App Router)** y respaldado por una base de datos relacional **PostgreSQL**.

- **Propósito:** proveer una API REST/GraphQL y un panel de control para la redacción, edición, versionado, localización multilingüe (español / inglés) y publicación de artículos técnicos, la gestión centralizada de medios multimedia y el control de acceso basado en roles (RBAC).
- **Dominio en producción:** [https://fluxblog-api.fluxdv.icu/](https://fluxblog-api.fluxdv.icu/)
- **Documentación interactiva (SwaggerUI):** `https://fluxblog-api.fluxdv.icu/docs`
- **Especificación OpenAPI 3.0:** `https://fluxblog-api.fluxdv.icu/api/openapi.json`
- **Panel de administración:** `https://fluxblog-api.fluxdv.icu/admin`
- **Repositorio:** [https://github.com/ivndv/fluxblog-api](https://github.com/ivndv/fluxblog-api)

## 2. Antes de tocar código

**CodeGraph** (índice de símbolos del repo): usa `codegraph_explore` (`query`, `maxFiles`, `projectPath`) antes de un grep masivo o de leer varios archivos; devuelve fuente verbatim, rutas de llamada e impacto.

- `codegraph sync /home/ivan/software-dev/fluxblog-api` tras editar, pull o cambiar de rama (incremental, uso normal).
- `codegraph index /home/ivan/software-dev/fluxblog-api` solo al crear el índice, tras `codegraph upgrade` o si `status` avisa `built by vX` (rebuild completo).
- `codegraph status /home/ivan/software-dev/fluxblog-api` para comprobar el estado.

## 3. Stack tecnológico

| Capa | Tecnología | Versión / Detalle |
| :--- | :--- | :--- |
| **Runtime y gestor** | **Bun / Node** | `Bun v1.4.x` (`bun.lock`), `Node >=24.22.1` |
| **Framework headless CMS** | **Payload CMS 3** | `payload 3.92.1`, `@payloadcms/next 3.92.1`, `@payloadcms/ui 3.92.1` |
| **Meta-framework web** | **Next.js 15** | `next 15.4.11` (App Router, Server Components y Server Actions) |
| **Librería de UI** | **React 19** | `react 19.3.1`, `react-dom 19.3.1` |
| **Base de datos y adaptador** | **PostgreSQL 18** | `@payloadcms/db-postgres 3.92.1` (`postgresAdapter` con pool de conexiones) |
| **Editor de contenido** | **Lexical RichText** | `@payloadcms/richtext-lexical 3.92.1` (árbol AST estructurado) |
| **Documentación de API** | **OpenAPI 3.0 + Swagger** | `payload-oapi ^0.3.1` con endpoints `/docs` y `/api/openapi.json` |
| **Procesamiento de imágenes** | **Sharp** | `sharp ^0.35.5` (redimensionamiento automático thumbnail/medium) |
| **Lenguaje** | **TypeScript** | `typescript 5.9.3` (modo estricto, tipos sincronizados en `payload-types.ts`) |
| **Testing automatizado** | **Vitest** | `vitest ^5.0.5` (+ `vite ^8.3.5`) con `@testing-library/react` y `jsdom` |
| **Linter y formatter** | **ESLint 9 + Prettier** | `eslint ^9.39.5`, `eslint-config-next 15.4.11`, `prettier ^3.9.10` |
| **Contenedores y despliegue** | **Docker y Dokploy** | `Dockerfile`, `docker-compose.yml`, orquestado en VPS Linux |

## 4. Estructura del código

```
fluxblog-api/
├── .github/                       → Workflows de integración y pruebas continuas
├── public/                        → Archivos y assets públicos servidos por Next.js
│   └── media/                     → Directorio de subida local de archivos e imágenes
├── src/                           → Código fuente principal de la aplicación
│   ├── app/                       → App Router de Next.js 15
│   │   ├── (frontend)/            → Vistas públicas del frontend (home, landing)
│   │   ├── (payload)/             → Rutas integradas del CMS Payload
│   │   │   ├── admin/             → Vistas del panel de administración
│   │   │   ├── api/               → Endpoints REST, GraphQL y OpenAPI de Payload
│   │   │   └── layout.tsx         → Root layout con estilos e importmaps de Payload
│   │   └── my-route/              → Rutas personalizadas del servidor
│   ├── collections/               → Definición de colecciones y esquemas de datos
│   │   ├── Media.ts               → Colección de medios, subida de archivos y tamaños
│   │   ├── Posts.ts               → Colección de artículos con i18n, borradores y hooks
│   │   └── Users.ts               → Colección de usuarios con autenticación y RBAC
│   ├── payload-types.ts           → Tipos generados automáticamente por Payload CLI
│   └── payload.config.ts          → Configuración central de Payload (DB, i18n, plugins, endpoints)
├── tests/                         → Suites de pruebas automatizadas con Vitest
│   ├── collections/               → Pruebas unitarias sobre esquemas y reglas de acceso
│   │   ├── Media.spec.ts          → Validación de configuración de uploads y mimeTypes
│   │   ├── Posts.spec.ts          → Validación de campos obligatorios y acceso público
│   │   └── Users.spec.ts          → Validación de roles y permisos de lectura/edición
│   └── int/                       → Pruebas de integración de la API
│       └── api.int.spec.ts        → Pruebas de endpoints REST
├── Dockerfile                     → Imagen de contenedor para despliegue
├── docker-compose.yml             → Orquestación de servicios en desarrollo/producción
├── next.config.mjs                → Configuración de Next.js con soporte de Payload
├── tsconfig.json                  → Configuración estricta de compilador TypeScript
└── vitest.config.mts              → Configuración de pruebas unitarias con Vitest
```

## 5. Arquitectura y flujo de datos

El modelo de datos se define en tres colecciones de Payload que alimentan el frontend desacoplado.

### 5.1 Users (`src/collections/Users.ts`)

- **Autenticación:** habilitada de forma nativa (`auth: true`) con sesiones seguras y hashing.
- **Roles:** `admin` (acceso total a usuarios y contenidos) y `author` (redactor).
- **Control de acceso (RBAC):**
  - Lectura/actualización: los administradores ven y editan todos los usuarios; los autores solo su propio registro.
  - Creación/eliminación y cambio de rol: exclusivo para administradores.

### 5.2 Posts (`src/collections/Posts.ts`)

- **Localización (i18n):** campos `title`, `slug`, `content` y `excerpt` localizados de forma nativa en español (`es`) e inglés (`en`).
- **Control de versiones y borradores:** `versions: { drafts: true }` con campo de estado automático `_status` (`draft` / `published`).
- **Acceso público:** solo se exponen documentos `published`; los usuarios autenticados ven todo. El frontend además filtra `where[_status][equals]=published`.
- **Campos de presentación:** `excerpt` (resumen para cards/SEO/RSS) y `featured` (destacar en portada).
- **Generación automática de slugs:** hook `beforeValidate` que transforma el título a kebab-case URL-friendly si el campo slug viene vacío.
- **Relaciones:** vinculación obligatoria con `author` (`Users`) y opcional con `featuredImage` (`Media`).
- **Contenido enriquecido:** editor Lexical moderno estructurado en bloques y nodos serializables.
- **Acceso:** lectura pública (`read: () => true`) para consumo desde el frontend cliente.

### 5.3 Media (`src/collections/Media.ts`)

- **MimeTypes permitidos:** `image/png`, `image/jpeg`, `image/webp`, `application/pdf`.
- **Redimensionamiento automático (Sharp):** `thumbnail` 400x300 px y `medium` 800x600 px.
- **Accesibilidad y SEO:** campo `alt` obligatorio y localizado (`localized: true`).

## 6. Variables de entorno

El archivo `.env` vive en la raíz del proyecto. Nunca documentar valores reales de secretos: este archivo es público.

| Variable | Descripción |
| :--- | :--- |
| `PAYLOAD_SECRET` | Clave secreta para la firma de cookies y tokens JWT de Payload. |
| `DATABASE_URL` | Cadena de conexión a PostgreSQL, tanto en local como en VPS/producción (base `fluxdev-db`). |
| `SERVER_URL` | URL base del servidor, usada para links absolutos y CORS. |
| `PORT` | Puerto de escucha local. |

## 7. Comandos

```bash
# Iniciar servidor de desarrollo en puerto configurado (ej: 3050)
bun run dev

# Iniciar limpiando la caché de compilación de Next.js (.next)
bun run devsafe

# Compilar para producción
bun run build

# Iniciar servidor compilado en producción
bun run start

# Generar mapa de importaciones dinámicas para componentes del panel admin
bun run generate:importmap

# Compilar y regenerar tipos de TypeScript (src/payload-types.ts)
bun run generate:types

# Ejecutar comandos directos de Payload CLI
bun run payload

# Ejecutar todas las pruebas unitarias y de integración con Vitest
bun run test

# Ejecutar pruebas en modo observador (watch)
bun x vitest

# Análisis estático de código con ESLint
bun run lint
```

## 8. Convenciones y reglas críticas

1. **Commit y push:** prohibido ejecutar `git commit` o `git push` sin autorización explícita del usuario.
2. **No actualizar Next.js a la versión 16 a ciegas:** Payload CMS 3.x depende estrictamente del ecosistema de Next.js 15 (`^15.x`). Subir a Next 16 provoca fallos de compilación con `@next/env` y el App Router.
3. **No desincronizar versiones de Payload:** todos los paquetes `@payloadcms/*` y el paquete `payload` deben mantener la misma versión exacta (actualmente `3.92.1`).
4. **No modificar colecciones sin regenerar tipos:** tras agregar o modificar un campo en `src/collections/`, ejecutar de inmediato `bun run generate:types` para mantener `src/payload-types.ts` al día.
5. **No romper la suite de tests:** ejecutar siempre `bun run test` y `bun run lint` tras realizar cambios para garantizar que los 9 tests existentes sigan en verde.

## 9. Flujo de Git y despliegue

- **Prohibido:** hacer `git commit` o `git push` sin la aprobación explícita del usuario.
- **Ramas:** todo el desarrollo se realiza en `develop`; el merge a `main` solo se hace con aprobación explícita.
- **Mensajes:** Conventional Commits en minúsculas y en español (`feat: ...`, `fix: ...`, `chore: ...`, `docs: ...`).
- **Despliegue:** imagen definida en `Dockerfile` y orquestada con `docker-compose.yml` mediante Dokploy sobre un VPS Linux; los workflows de `.github/` cubren integración y pruebas continuas.
