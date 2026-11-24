import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-[var(--hwe-page-pad)]">
      <div className="w-full min-w-0 rounded-xl bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-semibold text-[var(--hwe-sky)]">404</p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--hwe-slate)]">Page not found</h1>
        <p className="mt-2 text-sm text-gray-600">The page you requested could not be found.</p>
        <Link to="/" className="mt-5 inline-block btn-primary">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
