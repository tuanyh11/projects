import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/20 to-background" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 text-center px-6">
        <div className="text-8xl mb-6">🍃</div>
        <h1 className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/40 mb-4">
          404
        </h1>
        <p className="text-xl text-foreground font-semibold mb-2">Trang không tồn tại</p>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary text-white font-bold text-sm px-8 py-3.5 rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-xl transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
            Về trang chủ
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-white text-foreground font-semibold text-sm px-8 py-3.5 rounded-xl border border-border/50 hover:bg-muted/50 transition-all"
          >
            Xem sản phẩm
          </Link>
        </div>
      </div>
    </div>
  )
}
