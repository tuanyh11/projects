export default function Loading() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero skeleton */}
            <div className="relative w-full h-[60vh] md:h-[70vh] animate-pulse" style={{ background: 'var(--muted)' }} />

            {/* Content skeleton */}
            <div className="container max-w-3xl mx-auto px-6 py-16">
                <div className="flex items-center justify-center mb-12 gap-3">
                    <div className="w-12 h-px" style={{ background: 'var(--border)' }} />
                    <div className="w-4 h-4 rounded-full animate-pulse" style={{ background: 'var(--muted)' }} />
                    <div className="w-12 h-px" style={{ background: 'var(--border)' }} />
                </div>

                <div className="space-y-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-4 rounded animate-pulse"
                            style={{
                                background: 'var(--muted)',
                                width: `${85 + Math.random() * 15}%`,
                                opacity: 0.5,
                                animationDelay: `${i * 100}ms`,
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
