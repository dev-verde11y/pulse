export function EpisodeListSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4 p-4 border border-gray-800 rounded-lg bg-gray-900/50">
                    {/* Thumbnail */}
                    <div className="w-32 h-20 bg-gray-800 rounded-lg flex-shrink-0" />

                    <div className="flex-1 space-y-2 py-1">
                        {/* Title */}
                        <div className="h-4 bg-gray-800 rounded w-3/4" />

                        {/* Episode Number */}
                        <div className="h-3 bg-gray-800 rounded w-1/4" />

                        {/* Description lines */}
                        <div className="space-y-1 pt-1">
                            <div className="h-2 bg-gray-800 rounded w-full" />
                            <div className="h-2 bg-gray-800 rounded w-2/3" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
