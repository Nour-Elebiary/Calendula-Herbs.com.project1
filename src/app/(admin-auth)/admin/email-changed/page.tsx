import Link from 'next/link'

export default function EmailChangedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'var(--font-display)' }}>
          Email Changed Successfully
        </h1>
        <p className="text-gray-600 mb-2">
          Your primary login email has been updated.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          For security, all active sessions have been revoked. Please sign in with your new email.
        </p>

        <Link
          href="/admin/login"
          className="inline-flex items-center justify-center w-full px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
        >
          Go to Login
        </Link>
      </div>
    </div>
  )
}
