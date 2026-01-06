export function BannerSkeleton() {
    return (
        <div className="animate-pulse relative aspect-video w-full rounded-xl overflow-hidden bg-gray-800">
            {/* Overlay Gradient Skeleton */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-50" />

            {/* Content Skeleton */}
            <div className="absolute bottom-6 left-6 right-6">
                <div className="h-8 bg-gray-700 rounded w-2/3 mb-3" />
                <div className="flex gap-2 mb-3">
                    <div className="h-5 bg-gray-700 rounded w-16" />
                    <div className="h-5 bg-gray-700 rounded w-16" />
                </div>
                <div className="h-4 bg-gray-700 rounded w-full mb-2" />
                <div className="h-4 bg-gray-700 rounded w-3/4" />
            </div>
        </div>
    )
}
