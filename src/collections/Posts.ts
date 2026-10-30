import type { CollectionConfig } from 'payload'
import { slugify } from '../utils/slugify'

export const Posts: CollectionConfig = {
  slug: 'posts',
  access: {
    // Public API only exposes published documents; authenticated users (admin) see everything.
    read: ({ req: { user } }) => (user ? true : { _status: { equals: 'published' } }),
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'updatedAt'],
  },
  // Habilita el sistema nativo de borradores de Payload (agrega campo _status automáticamente)
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      required: true,
      localized: true,
      admin: {
        position: 'sidebar',
      },
      hooks: {
        // Genera el slug automáticamente desde el título si se deja vacío
        beforeValidate: [
          ({ data, originalDoc }) => {
            // Never regenerate an existing slug on partial updates (e.g. toggling `featured`).
            if (data?.slug) return data.slug
            if (originalDoc?.slug) return originalDoc.slug
            if (data?.title) return slugify(data.title)
            return undefined
          },
        ],
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Short summary used in cards, SEO descriptions and the RSS feed.',
      },
    },
    {
      name: 'content',
      type: 'richText',
      localized: true,
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Highlight this post on the home page.',
      },
    },
    {
      name: 'tags',
      type: 'array',
      labels: {
        singular: 'Tag',
        plural: 'Tags',
      },
      fields: [
        {
          name: 'value',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'date',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
}
