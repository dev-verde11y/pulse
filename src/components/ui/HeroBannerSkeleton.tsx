export function HeroBannerSkeleton() {
    return (
        <div className="relative h-[70vh] w-full bg-gray-900 animate-pulse overflow-hidden">
            {/* Content Container */}
            <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 bg-gradient-to-t from-black via-black/50 to-transparent">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Logo/Title Placeholder */}
                    <div className="h-16 w-64 bg-gray-800 rounded-lg" />

                    {/* Metadata */}
                    <div className="flex gap-4">
                        <div className="h-6 w-12 bg-gray-800 rounded" />
                        <div className="h-6 w-16 bg-gray-800 rounded" />
                        <div className="h-6 w-20 bg-gray-800 rounded" />
                    </div>

                    {/* Description */}
                    <div className="space-y-2 max-w-2xl">
                        <div className="h-4 bg-gray-800 rounded w-full" />
                        <div className="h-4 bg-gray-800 rounded w-11/12" />
                        <div className="h-4 bg-gray-800 rounded w-4/5" />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4 pt-4">
                        <div className="h-12 w-32 bg-gray-800 rounded-full" />
                        <div className="h-12 w-32 bg-gray-800 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    )
}
