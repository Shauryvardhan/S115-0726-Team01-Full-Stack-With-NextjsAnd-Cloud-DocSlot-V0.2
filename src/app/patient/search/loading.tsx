export default function Loading() {
  return (
    <div className="grid grid-cols-4 gap-6 animate-pulse">
      <div className="col-span-1 h-64 bg-gray-100 rounded-lg"></div>
      <div className="col-span-3 grid grid-cols-2 gap-4">
        <div className="h-40 bg-gray-100 rounded-lg"></div>
        <div className="h-40 bg-gray-100 rounded-lg"></div>
        <div className="h-40 bg-gray-100 rounded-lg"></div>
        <div className="h-40 bg-gray-100 rounded-lg"></div>
      </div>
    </div>
  );
}
