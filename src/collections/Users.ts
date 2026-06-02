import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'name',
  },
  access: {
    // Solo admins ven todos los usuarios, los demás solo ven su propio perfil
    read: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      return { id: { equals: user?.id } }
    },
    update: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      return { id: { equals: user?.id } }
    },
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Author', value: 'author' },
      ],
      defaultValue: 'author',
      required: true,
      access: {
        // Solo los admins pueden cambiar el rol de alguien
        update: ({ req: { user } }) => user?.role === 'admin',
      },
    },
  ],
}
