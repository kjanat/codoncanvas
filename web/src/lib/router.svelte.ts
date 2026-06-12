// A minimal hash router as a Svelte 5 rune-based store. Hash routing keeps the
// app a single static artifact that works on GitHub Pages without server
// rewrites.

export type Route =
	| 'playground'
	| 'gallery'
	| 'mutations'
	| 'evolution'
	| 'reference'
	| 'about';

const ROUTES: Route[] = [
	'playground',
	'gallery',
	'mutations',
	'evolution',
	'reference',
	'about',
];

function parseHash(): Route {
	const raw = window.location.hash.replace(/^#\/?/, '').split('?')[0];
	return (ROUTES as string[]).includes(raw) ? (raw as Route) : 'playground';
}

class Router {
	current = $state<Route>('playground');

	constructor() {
		if (typeof window !== 'undefined') {
			this.current = parseHash();
			window.addEventListener('hashchange', () => {
				this.current = parseHash();
			});
		}
	}

	go(route: Route): void {
		window.location.hash = `/${route}`;
	}
}

export const router = new Router();
