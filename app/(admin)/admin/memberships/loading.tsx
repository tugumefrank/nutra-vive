// app/admin/memberships/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function MembershipsLoading() {
  return (
    <div className="flex flex-col h-full animate-in fade-in-50 duration-500">
      {/* Header Skeleton */}
      <div className="flex-none border-b bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="flex-none border-b bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="container mx-auto px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="relative overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className="flex-none border-b bg-background/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-3">
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-9 w-28" />
              <Skeleton className="h-9 w-36" />
              <Skeleton className="h-9 w-24" />
            </div>
            <Skeleton className="h-9 w-64" />
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="flex-1 container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <CardHeader className="relative">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-6 rounded" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </CardHeader>

              <CardContent className="relative space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />

                <div className="flex items-baseline gap-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <div className="space-y-1">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <Skeleton className="h-3 w-3 rounded-full" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-8" />
                  </div>

                  <div className="flex gap-2">
                    <Skeleton className="h-8 flex-1" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className="flex items-center justify-between mt-8">
          <Skeleton className="h-4 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </div>
    </div>
  );
}
