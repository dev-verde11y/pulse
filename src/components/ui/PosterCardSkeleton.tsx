export default function PosterCardSkeleton() {
    return (
        <div className="animate-pulse">
            {/* Poster Skeleton */}
            <div className="aspect-[2/3] bg-gray-800 rounded-lg mb-3" />

            {/* Title Skeleton */}
            <div className="h-4 bg-gray-800 rounded w-3/4 mb-2 mx-auto" />

            {/* Metadata Skeleton */}
            <div className="h-3 bg-gray-800 rounded w-1/2 mx-auto" />
        </div>
    )
}
