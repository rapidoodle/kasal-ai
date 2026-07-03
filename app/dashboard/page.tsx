'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getEvent } from '@/lib/supabase'
import { useAuth } from '@/lib/useAuth'
import type { Event, EventDetails } from '@/lib/types'
import { EVENT_TYPE_EMOJIS, EVENT_TYPE_LABELS } from '@/lib/types'

function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 })

  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate).getTime() - Date.now()
      if (diff <= 0) return setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 })
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        total: diff,
      })
    }
    calc()
    const timer = setInterval(calc, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  return timeLeft
}

const NAV_ITEMS = [
  { href: 'checklist', label: 'Checklist', emoji: '✅' },
  { href: 'budget', label: 'Budget', emoji: '💰' },
  { href: 'vendors', label: 'Vendors', emoji: '🤝' },
]

function DashboardContent() {
  const params = useSearchParams()
  const router = useRouter()
  const id = params.get('id')
  const { user, signOut } = useAuth()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!id) return router.push('/')
    const data = await getEvent(id)
    if (!data) return router.push('/')
    setEvent(data)
    setLoading(false)
  }, [id, router])

  useEffect(() => { load() }, [load])

  const [copied, setCopied] = useState(false)

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const details: EventDetails | null = event?.details ?? null
  const checklist = event?.checklist ?? []
  const completedCount = checklist.filter((i) => i.completed).length
  const totalCount = checklist.length
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const countdown = useCountdown(details?.event_date ?? '')

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-soft flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-bounce">🎉</div>
          <div className="font-serif text-gray-600">Loading your event...</div>
        </div>
      </main>
    )
  }

  const eventDateStr = details?.event_date
    ? new Date(details.event_date).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })
    : ''

  const eventTypeEmoji = details?.event_type ? EVENT_TYPE_EMOJIS[details.event_type] : '🎉'
  const eventTypeLabel = details?.event_type ? EVENT_TYPE_LABELS[details.event_type] : 'Event'

  const displayName = details?.event_type === 'wedding'
    ? `${details.organizer_name} & ${details.partner_name}`
    : details?.event_name || details?.organizer_name || 'Your Event'

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="font-serif font-bold text-teal-600 text-lg">Ganap PH 🎉</div>
          <div className="flex items-center gap-3">
            <button
              onClick={copyLink}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-teal-500 transition-colors font-medium"
            >
              {copied ? (
                <><svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg><span className="text-emerald-500">Copied!</span></>
              ) : (
                <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Share</>
              )}
            </button>
            {user ? (
              <button
                onClick={() => { signOut(); router.push('/') }}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors font-medium"
                title={user.email}
              >
                <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-bold text-[10px]">
                  {(user.email ?? '?')[0].toUpperCase()}
                </div>
                Sign out
              </button>
            ) : (
              <Link href="/login" className="text-xs text-gray-400 hover:text-teal-500 transition-colors font-medium">
                Sign in to save
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Hero countdown */}
        <div className="card overflow-hidden">
          <div className="bg-gradient-hero p-6 text-white text-center">
            <div className="text-2xl mb-1">{eventTypeEmoji}</div>
            <div className="font-serif text-2xl font-bold mb-0.5">
              {displayName}
            </div>
            <div className="text-teal-200 text-sm mb-1">{eventTypeLabel}</div>
            <div className="text-teal-200 text-sm mb-5">{eventDateStr} · {details?.city}</div>
            <div className="text-teal-200 text-xs mb-3 font-medium">Your event is in</div>
            <div className="flex justify-center gap-5">
              {[
                { n: countdown.days, l: 'Days' },
                { n: countdown.hours, l: 'Hours' },
                { n: countdown.minutes, l: 'Mins' },
                { n: countdown.seconds, l: 'Secs' },
              ].map((t) => (
                <div key={t.l} className="text-center">
                  <div className="text-4xl font-black tabular-nums leading-none">{String(t.n).padStart(2, '0')}</div>
                  <div className="text-teal-200 text-xs mt-1 font-medium">{t.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress */}
          {totalCount > 0 && (
            <div className="px-6 py-4 bg-white border-t border-gray-50">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold text-gray-700">Checklist Progress</span>
                <span className="font-bold text-teal-600">{completedCount}/{totalCount}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs text-gray-400 mt-1.5">{progress}% complete</div>
            </div>
          )}
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Budget', value: `₱${((details?.budget ?? 0) / 1000).toFixed(0)}k`, emoji: '💰', color: 'text-emerald-600' },
            { label: 'Guest Count', value: details?.guest_count ?? 0, emoji: '👥', color: 'text-blue-600' },
            { label: 'Event Type', value: eventTypeLabel, emoji: eventTypeEmoji, color: 'text-teal-600' },
          ].map((s) => (
            <div key={s.label} className="card p-4 text-center">
              <div className="text-2xl mb-1">{s.emoji}</div>
              <div className={`font-black text-lg ${s.color} capitalize`}>{s.value}</div>
              <div className="text-xs text-gray-400 mt-0.5 leading-tight">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Navigation cards */}
        <div className="space-y-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={`/${item.href}?id=${id}`}
              className="card p-5 flex items-center justify-between hover:border-teal-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.emoji}</span>
                <span className="font-bold text-gray-900">{item.label}</span>
              </div>
              <svg className="w-5 h-5 text-gray-300 group-hover:text-teal-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>

        {/* Checklist CTA if empty */}
        {totalCount === 0 && (
          <div className="card p-6 text-center bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
            <div className="text-3xl mb-2">✨</div>
            <div className="font-bold text-gray-900 mb-1">Generate Your AI Checklist</div>
            <p className="text-sm text-gray-500 mb-4">A personalized to-do list built around your actual event details — type, date, budget, and all.</p>
            <Link href={`/checklist?id=${id}`} className="btn-primary">
              Generate Checklist
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-gradient-soft flex items-center justify-center"><div className="text-4xl animate-bounce">🎉</div></main>}>
      <DashboardContent />
    </Suspense>
  )
}
