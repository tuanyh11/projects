export default function Loading() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="flex flex-col items-center gap-6">
                {/* Enso circle — loading animation */}
                <svg
                    width="48"
                    height="48"
                    viewBox="0 0 48 48"
                    fill="none"
                    className="animate-spin"
                    style={{ animationDuration: '2s' }}
                >
                    <path
                        d="M24 4 C35,4 44,12 44,24 C44,35 36,44 24,44 C12,44 4,36 5,24 C6,14 14,6 22,4.5"
                        stroke="var(--matcha)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        fill="none"
                        opacity="0.4"
                    />
                </svg>
                <p
                    className="text-muted-foreground text-xs tracking-[0.3em] uppercase font-light"
                    style={{ fontFamily: "'Noto Serif JP', serif" }}
                >
                    Đang tải...
                </p>
            </div>
        </div>
    )
}
