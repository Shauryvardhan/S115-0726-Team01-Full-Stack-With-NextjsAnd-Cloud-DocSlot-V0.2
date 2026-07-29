export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto animate-pulse">
      <div className="h-8 w-48 bg-gray-200 rounded mb-6"></div>
      <div className="h-5 w-32 bg-gray-200 rounded mb-3"></div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="h-32 bg-gray-100 rounded-lg"></div>
        <div className="h-32 bg-gray-100 rounded-lg"></div>
      </div>
      <div className="h-5 w-32 bg-gray-200 rounded mb-3"></div>
      <div className="h-16 bg-gray-100 rounded-lg mb-2"></div>
      <div className="h-16 bg-gray-100 rounded-lg mb-2"></div>
      <div className="h-16 bg-gray-100 rounded-lg"></div>
    </div>
  );
}
