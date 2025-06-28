export default function CustomersLoading() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Analytics Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>

      {/* Segments Skeleton */}
      <div className="h-48 bg-gray-200 rounded-lg animate-pulse" />

      {/* Filters Skeleton */}
      <div className="h-20 bg-gray-200 rounded-lg animate-pulse" />

      {/* Customer List Skeleton */}
      <div className="space-y-4">
        <div className="h-16 bg-gray-200 rounded-lg animate-pulse" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );
}