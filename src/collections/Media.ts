import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true, // Público para que se puedan mostrar las imágenes en el blog
  },
  upload: {
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'medium',
        width: 800,
        height: 600,
        position: 'centre',
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true, // Crucial para SEO en múltiples idiomas
    },
  ],
}
