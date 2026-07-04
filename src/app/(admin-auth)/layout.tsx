export default function AdminAuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[var(--color-bg-void)] flex flex-col">
      {children}
    </div>
  )
}
