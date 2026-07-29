export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto animate-pulse">
      <div className="h-8 w-56 bg-gray-200 rounded mb-2"></div>
      <div className="h-5 w-72 bg-gray-100 rounded mb-6"></div>
      <div className="h-24 bg-gray-100 rounded-lg mb-6"></div>
      <div className="h-5 w-40 bg-gray-200 rounded mb-3"></div>
      <div className="grid grid-cols-3 gap-4">
        <div className="h-28 bg-gray-100 rounded-lg"></div>
        <div className="h-28 bg-gray-100 rounded-lg"></div>
        <div className="h-28 bg-gray-100 rounded-lg"></div>
      </div>
    </div>
  );
}
