export default function Loading() {
    return (
        <div className="min-h-screen bg-background">
            {/* Breadcrumb skeleton */}
            <div className="border-b border-border/20 pt-24" style={{ backgroundColor: 'var(--washi)' }}>
                <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-16 h-3 rounded animate-pulse" style={{ background: 'var(--muted)' }} />
                        <span className="text-border/50 text-xs">·</span>
                        <div className="w-12 h-3 rounded animate-pulse" style={{ background: 'var(--muted)' }} />
                        <span className="text-border/50 text-xs">·</span>
                        <div className="w-24 h-3 rounded animate-pulse" style={{ background: 'var(--muted)' }} />
                    </div>
                </div>
            </div>

            {/* Product detail skeleton */}
            <div style={{ backgroundColor: 'var(--washi)' }}>
                <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-10">
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
                        {/* Gallery skeleton */}
                        <div className="w-full lg:w-[58%]">
                            <div
                                className="animate-pulse rounded-sm"
                                style={{
                                    height: 'clamp(400px, 50vh, 600px)',
                                    background: 'var(--muted)',
                                    borderRadius: '2px',
                                }}
                            />
                        </div>

                        {/* Info skeleton */}
                        <div className="w-full lg:w-[42%]">
                            <div className="space-y-6">
                                <div className="w-20 h-3 rounded animate-pulse" style={{ background: 'var(--muted)' }} />
                                <div className="w-3/4 h-6 rounded animate-pulse" style={{ background: 'var(--muted)' }} />
                                <div className="w-1/3 h-5 rounded animate-pulse" style={{ background: 'var(--muted)' }} />
                                <div className="space-y-3 mt-8">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="h-3 rounded animate-pulse"
                                            style={{ background: 'var(--muted)', width: `${70 + Math.random() * 30}%`, opacity: 0.6 }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
