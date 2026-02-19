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

export function TrendingCardSkeleton() {
    return (
        <div className="animate-pulse relative w-full h-full">
            {/* Poster Skeleton */}
            <div className="aspect-[2/3] bg-gray-800 rounded-xl mb-0 shadow-lg" />

            {/* Rank Placeholder */}
            <div className="absolute -bottom-6 -left-4 hidden sm:block">
                <div className="h-24 w-16 bg-gray-800 rounded-lg transform -skew-x-6 opacity-50" />
            </div>
        </div>
    )
}

export function LandscapeCardSkeleton() {
    return (
        <div className="animate-pulse">
            {/* Poster Skeleton (4:3) */}
            <div className="aspect-[4/3] bg-gray-800 rounded-xl mb-2" />

            {/* Title Skeleton */}
            <div className="h-3 bg-gray-800 rounded w-3/4 mb-1" />

            {/* Metadata Skeleton */}
            <div className="h-2 bg-gray-800 rounded w-1/2" />
        </div>
    )
}

// Skeleton para carrosseis horizontais (Continue Assistindo, Minha Lista)
export function CarouselSkeleton() {
    return (
        <div className="flex overflow-hidden py-4 -my-2 -mx-4 md:-mx-0">
            <div className="flex px-4 md:px-0 w-full gap-4 md:gap-0">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="flex-shrink-0 w-[65vw] sm:w-[45vw] md:w-[25%] lg:w-[20%] xl:w-[16.666%] px-0 md:px-3 sm:px-4"
                    >
                        <LandscapeCardSkeleton />
                    </div>
                ))}
            </div>
        </div>
    )
}
