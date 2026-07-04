import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  AlertCircle,
  MapPin,
  Clock,
  ShieldCheck,
  Mail,
  MessageSquare,
  FileSearch
} from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function AdminDashboard() {
  const session = await auth()
  if (!session?.user?.email) redirect('/admin/login')

  const admin = await db.admin.findUnique({
    where: { email: session.user.email },
  })

  if (!admin) redirect('/admin/login')

  const lastLoginFormatted = admin.lastLoginAt 
    ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(admin.lastLoginAt)
    : 'Unknown'

  const [productCount, activeSessions, unreadContact, unreadCart, unreadSamples, unreadProductRequests] = await Promise.all([
    db.product.count({ where: { isActive: true } }),
    db.adminSession.count({ where: { revokedAt: null, expiresAt: { gt: new Date() } } }),
    db.contactSubmission.count({ where: { isRead: false } }),
    db.cartInquiry.count({ where: { isRead: false } }),
    db.sampleRequest.count({ where: { isRead: false } }),
    db.productRequest.count({ where: { isRead: false } }),
  ])

  const totalInquiries = unreadContact + unreadCart + unreadSamples + unreadProductRequests
  const inquiryRate = productCount > 0 ? ((totalInquiries / productCount) * 100).toFixed(1) : '0.0'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          Welcome back, {admin.name.split(' ')[0]}
        </h1>
        <p className="text-[var(--color-text-tertiary)]">Here&apos;s what&apos;s happening with Calendula Herbs today.</p>
      </div>

      <div className="bg-white border border-[var(--color-border-subtle)] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--color-calendula-500)]/15 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-[var(--color-calendula-500)]" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-[var(--color-text-primary)]">Last Login Information</h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-[var(--color-text-tertiary)]">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {lastLoginFormatted}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {admin.lastLoginCountry || 'Unknown Location'} ({admin.lastLoginIp || 'Unknown IP'})</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Products"
          value={productCount}
          icon={ShoppingBag}
        />
        <StatCard
          title="Active Sessions"
          value={activeSessions}
          icon={Users}
        />
        <StatCard
          title="Unread Inquiries"
          value={totalInquiries}
          icon={Mail}
          highlight={totalInquiries > 0}
        />
        <StatCard
          title="Inquiry Rate"
          value={`${inquiryRate}%`}
          icon={TrendingUp}
          highlighted
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white border border-[var(--color-border-subtle)] rounded-xl p-5">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Recent Inquiries</h2>
            {totalInquiries > 0 ? (
              <div className="space-y-3">
                {unreadContact > 0 && (
                  <div className="flex gap-3 items-start p-3 rounded-lg bg-[var(--color-calendula-500)]/10 border border-[var(--color-calendula-500)]/20">
                    <MessageSquare className="w-5 h-5 text-[var(--color-calendula-500)] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">{unreadContact} new contact message{unreadContact > 1 ? 's' : ''}</p>
                      <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Awaiting your response</p>
                    </div>
                  </div>
                )}
                {unreadCart > 0 && (
                  <div className="flex gap-3 items-start p-3 rounded-lg bg-[var(--color-calendula-500)]/10 border border-[var(--color-calendula-500)]/20">
                    <ShoppingBag className="w-5 h-5 text-[var(--color-calendula-500)] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">{unreadCart} new cart quote{unreadCart > 1 ? 's' : ''}</p>
                      <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Product inquiry from potential buyer</p>
                    </div>
                  </div>
                )}
                {unreadSamples > 0 && (
                  <div className="flex gap-3 items-start p-3 rounded-lg bg-[var(--color-calendula-500)]/10 border border-[var(--color-calendula-500)]/20">
                    <TrendingUp className="w-5 h-5 text-[var(--color-calendula-500)] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">{unreadSamples} new sample request{unreadSamples > 1 ? 's' : ''}</p>
                      <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Quality evaluation request</p>
                    </div>
                  </div>
                )}
                {unreadProductRequests > 0 && (
                  <div className="flex gap-3 items-start p-3 rounded-lg bg-[var(--color-calendula-500)]/10 border border-[var(--color-calendula-500)]/20">
                    <FileSearch className="w-5 h-5 text-[var(--color-calendula-500)] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">{unreadProductRequests} new product request{unreadProductRequests > 1 ? 's' : ''}</p>
                      <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Custom product sourcing request</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center text-[var(--color-text-tertiary)] border-2 border-dashed border-[var(--color-border-default)] rounded-lg min-h-[200px]">
                No inquiries yet
              </div>
            )}
          </div>
        </div>
        <div>
          <div className="bg-white border border-[var(--color-border-subtle)] rounded-xl p-5 min-h-96">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Quick Actions</h2>
            <div className="space-y-4">
              {productCount === 0 && (
                <div className="flex gap-3 items-start p-3 rounded-lg bg-[var(--color-calendula-500)]/10 border border-[var(--color-calendula-500)]/20">
                  <AlertCircle className="w-5 h-5 text-[var(--color-calendula-500)] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">No products yet</p>
                    <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Add your first product to start receiving inquiries.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ 
  title, 
  value, 
  icon: Icon,
  highlight = false,
  highlighted = false
}: { 
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  highlight?: boolean
  highlighted?: boolean
}) {
  return (
    <div className={`bg-white border border-[var(--color-border-subtle)] rounded-xl p-5 ${
      highlight || highlighted ? 'border-[var(--color-calendula-500)]/20 bg-[var(--color-calendula-500)]/[0.02]' : ''
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-[var(--color-text-tertiary)]">{title}</h3>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          highlight || highlighted ? 'bg-[var(--color-calendula-500)]/15 text-[var(--color-calendula-500)]' : 'bg-black/[0.03] text-[var(--color-text-tertiary)]'
        }`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-2xl font-bold text-[var(--color-text-primary)] mb-1">{value}</div>
    </div>
  )
}
