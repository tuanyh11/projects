export default function Loading() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero skeleton */}
            <div className="relative overflow-hidden pt-28 pb-16 zen-hero-dark">
                <div className="container max-w-6xl mx-auto px-4">
                    <div className="w-32 h-3 rounded bg-white/5 animate-pulse mb-6" />
                    <div className="w-64 h-8 rounded bg-white/5 animate-pulse mb-4" />
                    <div className="w-96 h-4 rounded bg-white/5 animate-pulse" />
                </div>
            </div>

            {/* Product grid skeleton */}
            <div className="container max-w-6xl mx-auto px-4 py-12">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="flex flex-col gap-4">
                            <div
                                className="aspect-square rounded-sm animate-pulse"
                                style={{ background: 'var(--muted)', opacity: 0.5, animationDelay: `${i * 100}ms` }}
                            />
                            <div className="w-3/4 h-3 rounded animate-pulse" style={{ background: 'var(--muted)' }} />
                            <div className="w-1/2 h-3 rounded animate-pulse" style={{ background: 'var(--muted)', opacity: 0.7 }} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
