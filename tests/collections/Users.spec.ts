import { describe, it, expect } from 'vitest'
import { Users } from '../../src/collections/Users'

describe('Users collection', () => {
  it('should have slug "users"', () => {
    expect(Users.slug).toBe('users')
  })

  it('should have auth enabled', () => {
    expect(Users.auth).toBe(true)
  })
})
