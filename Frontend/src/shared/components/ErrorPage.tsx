import React from 'react';
import { Link } from 'react-router-dom';

const ErrorPage: React.FC<{ error?: Error | null }> = ({ error = null }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background-gray)] p-6">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-md p-8 text-center">
        <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
        <p className="text-sm text-slate-500 mb-4">An unexpected error occurred. Try refreshing the page or contact support if the problem persists.</p>
        {error && (
          <pre className="text-sm text-rose-600 bg-rose-50 p-3 rounded mb-4 overflow-auto">{String(error.message)}</pre>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded font-medium"
          >
            Reload
          </button>
          <Link to="/" className="px-4 py-2 border rounded font-medium text-slate-700">Home</Link>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
