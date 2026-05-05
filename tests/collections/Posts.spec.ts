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

  it('should have public read access', () => {
    expect(Posts.access?.read?.()).toBe(true)
  })
})
