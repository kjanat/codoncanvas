import { Link } from "@tanstack/react-router";
import { DnaIcon, GalleryIcon, HomeIcon } from "@/ui/icons";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
          <DnaIcon className="h-12 w-12 text-primary" />
        </div>

        <h1 className="mb-2 text-6xl font-bold text-primary">404</h1>
        <h2 className="mb-4 text-2xl font-semibold text-text">
          Genome Not Found
        </h2>
        <p className="mb-8 text-text-muted">
          The page you're looking for seems to have mutated beyond recognition.
          Perhaps a frameshift occurred?
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary/90"
            to="/"
          >
            <HomeIcon className="h-5 w-5" />
            Return Home
          </Link>

          <Link
            className="inline-flex items-center gap-2 rounded-lg bg-bg-light px-6 py-3 font-medium text-text transition-colors hover:bg-border"
            to="/gallery"
          >
            <GalleryIcon className="h-5 w-5" />
            Browse Gallery
          </Link>
        </div>
      </div>
    </div>
  );
}
