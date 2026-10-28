'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="bg-slate-950 text-slate-100 flex min-h-screen items-center justify-center p-4"
      >
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <p className="text-slate-400 mb-6 text-sm">{error?.message || 'An unexpected error occurred.'}</p>
          <button
            type="button"
            onClick={() => reset()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium transition cursor-pointer"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
