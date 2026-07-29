"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-3xl mx-auto text-center py-16">
      <p className="text-gray-500 mb-4">
        Something went wrong loading your dashboard.
      </p>
      <button
        onClick={reset}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
      >
        Try again
      </button>
    </div>
  );
}
