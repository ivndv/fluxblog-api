import { describe, it, expect } from 'vitest'
import { Posts } from '../../src/collections/Posts'

describe('Posts collection', () => {
  it('should have slug "posts"', () => {
    expect(Posts.slug).toBe('posts')
  })

  it('should have required fields (title, slug)', () => {
    const titleField = Posts.fields.find(f => 'name' in f && f.name === 'title')
    const slugField = Posts.fields.find(f => 'name' in f && f.name === 'slug')
    expect(titleField).toBeDefined()
    expect(slugField).toBeDefined()
  })

  it('should expose only published posts to anonymous users', () => {
    const read = Posts.access?.read as (args: { req: { user: unknown } }) => unknown
    expect(read({ req: { user: null } })).toEqual({ _status: { equals: 'published' } })
    expect(read({ req: { user: { id: 1 } } })).toBe(true)
  })

  it('should have excerpt and featured fields', () => {
    const excerptField = Posts.fields.find(f => 'name' in f && f.name === 'excerpt')
    const featuredField = Posts.fields.find(f => 'name' in f && f.name === 'featured')
    expect(excerptField).toBeDefined()
    expect(featuredField).toBeDefined()
  })
})
