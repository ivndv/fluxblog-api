/**
 * URL-safe slug. Removes diacritics so Spanish titles keep their letters:
 * "Transición a Biome.js" → "transicion-a-biome-js".
 */
export function slugify(value: string): string {
	return value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)+/g, '');
}
