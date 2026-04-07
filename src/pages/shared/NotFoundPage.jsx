import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-semibold text-[#2E75B6]">404</p>
        <h1 className="mt-2 text-2xl font-semibold text-[#1F4E79]">Page not found</h1>
        <p className="mt-2 text-sm text-gray-600">The page you requested could not be found.</p>
        <Link to="/" className="mt-5 inline-block rounded-lg bg-[#1F4E79] px-4 py-2 text-sm font-medium text-white">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
