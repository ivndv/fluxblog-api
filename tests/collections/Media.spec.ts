import { describe, it, expect } from 'vitest'
import { Media } from '../../src/collections/Media'

describe('Media collection', () => {
  it('should have slug "media"', () => {
    expect(Media.slug).toBe('media')
  })

  it('should have upload enabled', () => {
    expect(Media.upload).toBeTruthy()
  })

  it('should have alt text field', () => {
    const altField = Media.fields.find(f => 'name' in f && f.name === 'alt')
    expect(altField).toBeDefined()
  })
})
