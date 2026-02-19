export function HeroBannerSkeleton() {
    return (
        <div className="relative h-[65vh] sm:h-[70vh] md:h-[75vh] lg:h-[85vh] w-full overflow-hidden bg-gray-900">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 animate-pulse" />

            {/* Gradient Overlays matching real banner */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

            <div className="absolute inset-0 flex items-center pb-8 sm:pb-12 md:pb-16 lg:pb-20 xl:pb-24 pt-20 z-20">
                <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-24 ml-0 sm:ml-4 lg:ml-8 xl:ml-10">
                    <div className="max-w-3xl space-y-6">
                        {/* Type Badge */}
                        <div className="h-8 bg-gray-800 rounded-lg w-24 animate-pulse relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite]" />
                        </div>

                        {/* Title */}
                        <div className="space-y-3">
                            <div className="h-12 md:h-16 lg:h-20 bg-gray-800 rounded-xl w-3/4 animate-pulse relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite]" />
                            </div>
                            <div className="h-12 md:h-16 lg:h-20 bg-gray-800 rounded-xl w-1/2 animate-pulse relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite]" />
                            </div>
                        </div>

                        {/* Metadata */}
                        <div className="flex gap-4 pt-2">
                            <div className="h-6 bg-gray-800 rounded w-16 animate-pulse" />
                            <div className="h-6 bg-gray-800 rounded w-16 animate-pulse" />
                            <div className="h-6 bg-gray-800 rounded w-24 animate-pulse" />
                        </div>

                        {/* Description */}
                        <div className="space-y-3 pt-2 max-w-2xl hidden sm:block">
                            <div className="h-4 bg-gray-800 rounded w-full animate-pulse" />
                            <div className="h-4 bg-gray-800 rounded w-5/6 animate-pulse" />
                            <div className="h-4 bg-gray-800 rounded w-4/6 animate-pulse" />
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-4 pt-6">
                            <div className="h-12 md:h-14 bg-gray-800 rounded-lg w-40 animate-pulse relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite]" />
                            </div>
                            <div className="h-12 md:h-14 bg-gray-800 rounded-lg w-32 animate-pulse" />
                            <div className="h-12 md:h-14 bg-gray-800 rounded-lg w-12 animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
