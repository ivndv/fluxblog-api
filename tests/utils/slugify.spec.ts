import { describe, expect, it } from 'vitest'
import { slugify } from '../../src/utils/slugify'

describe('slugify', () => {
  it('keeps Spanish letters without diacritics', () => {
    expect(slugify('Transición a Biome.js: Dile adiós a Prettier')).toBe(
      'transicion-a-biome-js-dile-adios-a-prettier',
    )
  })

  it('handles ñ and uppercase', () => {
    expect(slugify('¡Astro y Payload CMS son increíbles!')).toBe(
      'astro-y-payload-cms-son-increibles',
    )
  })

  it('collapses separators and trims edges', () => {
    expect(slugify('  De NPM y PNPM a Bun  ')).toBe('de-npm-y-pnpm-a-bun')
  })
})
