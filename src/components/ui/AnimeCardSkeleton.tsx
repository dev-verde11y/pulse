export function AnimeCardSkeleton() {
    return (
        <div className="animate-pulse">
            {/* Poster Skeleton */}
            <div className="aspect-[2/3] bg-gray-800 rounded-md mb-2" />

            {/* Title Skeleton */}
            <div className="h-3 bg-gray-800 rounded w-3/4 mb-1" />

            {/* Metadata Skeleton */}
            <div className="flex justify-between items-center mb-1">
                <div className="h-2 bg-gray-800 rounded w-1/4" />
                <div className="h-2 bg-gray-800 rounded w-1/4" />
            </div>

            {/* Genre Skeleton */}
            <div className="h-2 bg-gray-800 rounded w-1/2" />
        </div>
    )
}

export function MediumAnimeCardSkeleton() {
    return (
        <div className="animate-pulse">
            {/* Poster Skeleton */}
            <div className="aspect-[3/4] bg-gray-800 rounded-lg mb-3" />

            {/* Title Skeleton */}
            <div className="h-4 bg-gray-800 rounded w-3/4 mb-2" />

            {/* Metadata Skeleton */}
            <div className="flex items-center gap-2 mb-2">
                <div className="h-3 bg-gray-800 rounded w-8" />
                <div className="h-3 bg-gray-800 rounded w-12" />
            </div>

            {/* Genres Skeleton */}
            <div className="flex gap-1">
                <div className="h-3 bg-gray-800 rounded w-12" />
                <div className="h-3 bg-gray-800 rounded w-16" />
            </div>
        </div>
    )
}
