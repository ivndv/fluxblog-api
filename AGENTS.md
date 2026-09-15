# AGENTS.md — Guía para Agentes en FluxBlog API

Guía operativa y técnica para agentes de Inteligencia Artificial que colaboren en el desarrollo, mantenimiento, testing y optimización del backend headless CMS **FluxBlog API**.

---

## 1. Visión General del Proyecto

**FluxBlog API** es el motor central de gestión de contenido (Headless CMS) y panel de administración del ecosistema de blogs técnicos de FluxDev. Está construido sobre **Payload CMS 3.0** integrado con **Next.js 15 (App Router)** y respaldado por una base de datos relacional **PostgreSQL**.

* **Propósito:** Proveer una API REST/GraphQL y un panel de control intuitivo para la redacción, edición, versionado, localización multilingüe (Español / Inglés) y publicación de artículos técnicos, gestión centralizada de medios multimedia y control de acceso basado en roles (RBAC).
* **Dominio en Producción:** [https://fluxblog-api.fluxdv.icu/](https://fluxblog-api.fluxdv.icu/)
* **Documentación Interactiva (SwaggerUI):** `https://fluxblog-api.fluxdv.icu/docs`
* **Especificación OpenAPI 3.0:** `https://fluxblog-api.fluxdv.icu/api/openapi.json`
* **Panel de Administración:** `https://fluxblog-api.fluxdv.icu/admin`
* **Repositorio:** [https://github.com/Ivandv19/blog-personal-fluxdev-backend.git](https://github.com/Ivandv19/blog-personal-fluxdev-backend.git)

---

## 2. Antes de Tocar Código (Contexto con CodeGraph)

* **Uso del MCP CodeGraph:** Antes de realizar búsquedas masivas de texto o explorar múltiples archivos a ciegas, invoca la herramienta `codegraph_explore` para inspeccionar el flujo de llamadas, blast radius y el código fuente verbatim de los símbolos en una sola llamada eficiente.
* **Estado y Sincronización:**
  ```bash
  # Verificar el estado del índice de CodeGraph
  codegraph status /home/ivan/software-dev/fluxblog-api

  # Sincronizar cambios en el árbol de archivos tras crear o renombrar módulos
  codegraph sync /home/ivan/software-dev/fluxblog-api
  ```

---

## 3. Stack Tecnológico

| Capa | Tecnología | Versión / Detalle |
| :--- | :--- | :--- |
| **Runtime & Gestor** | **Bun** | `v1.3.x` (`bun.lock`) |
| **Framework Headless CMS** | **Payload CMS 3** | `payload ^3.89.0`, `@payloadcms/next ^3.89.0`, `@payloadcms/ui ^3.89.0` |
| **Meta-Framework Web** | **Next.js 15** | `next 15.4.11` (App Router, Server Components y Server Actions) |
| **Librería de UI** | **React 19** | `react ^19.3.0`, `react-dom ^19.3.0` |
| **Base de Datos & Adaptador** | **PostgreSQL 18** | `@payloadcms/db-postgres ^3.89.0` (`postgresAdapter` con pool de conexiones) |
| **Editor de Contenido** | **Lexical RichText** | `@payloadcms/richtext-lexical ^3.89.0` (árbol AST estructurado) |
| **Documentación de API** | **OpenAPI 3.0 + Swagger** | `payload-oapi ^0.2.5` con endpoint `/docs` y `/api/openapi.json` |
| **Procesamiento de Imágenes** | **Sharp** | `sharp ^0.34.5` (redimensionamiento automático thumbnail/medium) |
| **Lenguaje** | **TypeScript** | `typescript 5.7.3` (Modo estricto, tipos sincronizados en `payload-types.ts`) |
| **Testing Automatizado** | **Vitest** | `vitest ^4.0.18` con `@testing-library/react` y `jsdom` |
| **Linter & Formatter** | **ESLint 9 + Prettier** | `eslint 9.39.4`, `eslint-config-next 15.4.11`, `prettier 3.8.3` |
| **Contenedores & Despliegue** | **Docker & Dokploy** | `Dockerfile`, `docker-compose.yml`, orquestado en VPS Linux |

---

## 4. Estructura del Código

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

---

## 5. Arquitectura de Colecciones y Modelo de Datos

### 👥 1. Users (`src/collections/Users.ts`)
- **Autenticación:** Habilitada de forma nativa (`auth: true`) con sesiones seguras y hashing.
- **Roles:** `admin` (acceso total a usuarios y contenidos) y `author` (redactor).
- **Control de Acceso (RBAC):**
  - Lectura/Actualización: Los administradores ven y editan todos los usuarios; los autores solo su propio registro.
  - Creación/Eliminación y cambio de rol: Exclusivo para administradores.

### 📝 2. Posts (`src/collections/Posts.ts`)
- **Localización (i18n):** Campos `title`, `slug` y `content` localizados de forma nativa en español (`es`) e inglés (`en`).
- **Control de Versiones y Borradores:** `versions: { drafts: true }` con campo de estado automático `_status` (`draft` / `published`).
- **Generación Automática de Slugs:** Hook `beforeValidate` que transforma automáticamente el título a formato kebab-case URL-friendly si el campo slug viene vacío.
- **Relaciones:** Vinculación obligatoria con `author` (`Users`) y opcional con `featuredImage` (`Media`).
- **Contenido Enriquecido:** Editor Lexical moderno estructurado en bloques y nodos serializables.
- **Acceso:** Lectura pública (`read: () => true`) para consumo desde el frontend cliente.

### 🖼️ 3. Media (`src/collections/Media.ts`)
- **MimeTypes Permitidos:** `image/png`, `image/jpeg`, `image/webp`, `application/pdf`.
- **Redimensionamiento Automático (Sharp):**
  - `thumbnail`: 400x300 px.
  - `medium`: 800x600 px.
- **Accesibilidad y SEO:** Campo `alt` obligatorio y localizado (`localized: true`).

---

## 6. Comandos Útiles (Bun)

### 🚀 Desarrollo y Ejecución
```bash
# Iniciar servidor de desarrollo en puerto configurado (ej: 3050)
bun run dev

# Iniciar limpiando la caché de compilación de Next.js (.next)
bun run devsafe

# Compilar para producción
bun run build

# Iniciar servidor compilado en producción
bun run start
```

### ⚙️ Payload CMS CLI y Tipos
```bash
# Generar mapa de importaciones dinámicas para componentes del panel admin
bun run generate:importmap

# Compilar y regenerar tipos de TypeScript (src/payload-types.ts)
bun run generate:types

# Ejecutar comandos directos de Payload CLI
bun run payload
```

### 🧪 Testing y Calidad de Código
```bash
# Ejecutar todas las pruebas unitarias y de integración con Vitest
bun run test

# Ejecutar pruebas en modo observador (watch)
bun x vitest

# Análisis estático de código con ESLint
bun run lint
```

---

## 7. Variables de Entorno

Archivo `.env` en la raíz del proyecto:

```env
# Clave secreta para firma de cookies y tokens JWT de Payload
PAYLOAD_SECRET=da49a0fb4b4d0aa85b0a1fd9

# URL de conexión a la base de datos PostgreSQL
# Local: postgresql://postgres:postgres@localhost:5432/fluxdev-db
# VPS / Producción: postgresql://<user>:<pass>@<host>:5432/fluxdev-db
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fluxdev-db

# URL base del servidor (utilizada para links absolutos y CORS)
SERVER_URL=http://localhost:3050

# Puerto de escucha local
PORT=3050
```

---

## 8. Qué NO Hacer (Reglas Estrictas para Agentes)

1. **NO hacer commit ni push a Git sin autorización explícita:** Nunca ejecutes comandos de `git commit` o `git push` a menos que el usuario lo solicite de forma directa.
2. **NO actualizar Next.js a la versión 16 a ciegas:** Payload CMS 3.x depende estrictamente del ecosistema de Next.js 15 (`^15.x`). Subir a Next 16 provocará fallos de compilación con `@next/env` y el App Router.
3. **NO desincronizar versiones de Payload:** Todos los paquetes que inicien con `@payloadcms/*` y el paquete `payload` deben mantener **la misma versión exacta** (actualmente `3.89.0`).
4. **NO modificar colecciones sin regenerar tipos:** Si agregas o modificas un campo en `src/collections/`, ejecuta de inmediato `bun run generate:types` para mantener `src/payload-types.ts` al día.
5. **NO romper la suite de tests:** Siempre ejecuta `bun run test` y `bun run lint` tras realizar cambios para garantizar que los 9 tests existentes sigan en verde.
