import { Link } from 'react-router-dom';
import { PackageX } from 'lucide-react';
import Button from '../components/ui/Button';
import PageTransition from '../components/ui/PageTransition';

export default function NotFound() {
  return (
    <PageTransition className="container-app flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-100 text-brand-500">
        <PackageX size={36} />
      </div>
      <h1 className="mt-6 font-display text-4xl font-extrabold">404</h1>
      <p className="mt-2 max-w-sm text-sm text-ink-muted">
        This page seems to have been borrowed and never returned. Let's get you back somewhere useful.
      </p>
      <div className="mt-6 flex gap-3">
        <Link to="/"><Button>Go home</Button></Link>
        <Link to="/explore"><Button variant="outline">Explore items</Button></Link>
      </div>
    </PageTransition>
  );
}
