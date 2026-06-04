import Link from 'next/link'

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-navy-950 flex items-center justify-center px-6">
      <div className="card max-w-sm text-center animate-slide-up">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-800 text-brand-400">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636a9 9 0 010 12.728m-2.829-9.9a5 5 0 010 7.072M6.343 6.343a8 8 0 0111.314 11.314M3 3l18 18"
            />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-navy-50">You are offline</h1>
        <p className="mt-2 text-sm text-navy-400">
          SignaTempu could not reach the network. Reconnect, then try again.
        </p>
        <Link href="/clock" className="btn-primary btn-sm mt-5">
          Return to Clock
        </Link>
      </div>
    </main>
  )
}
