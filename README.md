# FluxDev Blog (Panel de Administración)

## Descripción

Este proyecto es el panel de administración central del Blog FluxDev. Funciona como un gestor de contenido (CMS) donde el administrador puede escribir, editar y organizar los artículos que posteriormente se muestran al público en la página web.

## Características

- **Gestión Simple**: Interfaz gráfica que permite redactar artículos y crear contenido fácilmente usando un editor visual.
- **Soporte Multilingüe**: Opción para agregar la traducción de un artículo (español e inglés) directamente desde la misma pantalla.
- **Gestor de Archivos**: Permite subir y organizar todas las imágenes utilizadas en las publicaciones de manera centralizada.
- **Disponibilidad Automática**: El contenido guardado se estructura y se proporciona automáticamente a través de una API para que el sitio web lo pueda consumir.

## Secciones

1. **Artículos (Posts)**: La vista principal donde se redactan, editan y publican las entradas del blog.
2. **Archivos (Media)**: Sección dedicada para almacenar y organizar todas las fotografías e ilustraciones.
3. **Usuarios (Users)**: Apartado para gestionar el acceso al panel, con roles de administrador y autor.

## Uso

- **Acceso Restringido**: Navega a la ruta principal de administración e inicia sesión con las credenciales correspondientes.
- **Creación de Contenido**: Ingresa a la sección de artículos para redactar y añadir imágenes a una nueva publicación.
- **Gestión Continua**: Revisa el listado de publicaciones para editar contenido existente o gestionar configuraciones adicionales.

## Tecnologías Utilizadas

- Payload CMS v3
- Next.js 15
- PostgreSQL (Base de datos)
- Node.js
- Bun


## Créditos

Este es el proyecto interno que maneja los datos y artículos mostrados en el portafolio web.

- Desarrollado por Ivan Cruz.

## Despliegue

Este proyecto está preparado para funcionar mediante contenedores Docker y se despliega y administra a través de plataformas como **Dokploy**.

- **Fluxdev API (Swagger):** https://fluxblog-api.liuma.app/api/docs
- **Fluxdev Admin:** https://fluxblog-api.liuma.app/admin

## Licencia

[MIT](LICENSE) © 2026 Ivan Cruz
