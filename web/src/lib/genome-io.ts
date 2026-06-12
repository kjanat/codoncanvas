// File and share helpers for genomes: .genome import/export, PNG export, and
// shareable URLs (genome encoded in the query string so hash routing still
// works on GitHub Pages).

export interface GenomeFile {
	version: string;
	title: string;
	genome: string;
	created: string;
}

const FORMAT_VERSION = '1.0.0';

/** Derives a title from the first non-comment, non-empty line of a genome. */
export function deriveTitle(genome: string): string {
	for (const line of genome.split('\n')) {
		const code = line.split(';')[0]?.trim();
		if (code) return code.slice(0, 40);
	}
	return 'Untitled genome';
}

function triggerDownload(blob: Blob, filename: string): void {
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}

/** Downloads a genome as a `.genome` JSON file. */
export function saveGenome(genome: string, title = deriveTitle(genome)): void {
	const data: GenomeFile = {
		version: FORMAT_VERSION,
		title,
		genome,
		created: new Date().toISOString(),
	};
	const safe = title.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase();
	triggerDownload(
		new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
		`${safe || 'genome'}.genome`,
	);
}

/** Parses an imported `.genome` file. Accepts the JSON format or raw codons. */
export function parseGenomeFile(text: string): string {
	const trimmed = text.trim();
	if (trimmed.startsWith('{')) {
		const data = JSON.parse(trimmed) as Partial<GenomeFile>;
		if (typeof data.genome !== 'string') {
			throw new Error('File has no "genome" field');
		}
		return data.genome;
	}
	// Fall back to treating the file as a raw genome.
	return trimmed;
}

/** Exports the current canvas as a PNG download. */
export function savePng(canvas: HTMLCanvasElement, name = 'codoncanvas'): void {
	canvas.toBlob((blob) => {
		if (blob) triggerDownload(blob, `${name}.png`);
	}, 'image/png');
}

/** Builds a shareable URL with the genome encoded in the query string. */
export function shareUrl(genome: string, route = 'playground'): string {
	const url = new URL(window.location.href);
	url.search = `?g=${encodeURIComponent(genome)}`;
	url.hash = `/${route}`;
	return url.toString();
}

/** Reads a genome from the current URL's `?g=` parameter, if present. */
export function genomeFromLocation(): string | null {
	const g = new URLSearchParams(window.location.search).get('g');
	return g ? g : null;
}
