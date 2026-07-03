'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/useAuth'
import { getEventByUser } from '@/lib/supabase'

const EVENT_TYPES = [
  {
    emoji: '💍',
    title: 'Wedding',
    description: 'Church, civil, beach, or garden — we cover every Filipino wedding tradition.',
    color: 'bg-rose-50 border-rose-100',
  },
  {
    emoji: '🎂',
    title: 'Birthday',
    description: 'From intimate gatherings to grand debut-style celebrations for any age.',
    color: 'bg-amber-50 border-amber-100',
  },
  {
    emoji: '👗',
    title: 'Debut',
    description: '18 roses, 18 candles, cotillion — plan every detail of the grand 18th.',
    color: 'bg-purple-50 border-purple-100',
  },
  {
    emoji: '🙏',
    title: 'Christening',
    description: 'Church booking, ninong/ninang coordination, reception — all in one place.',
    color: 'bg-sky-50 border-sky-100',
  },
  {
    emoji: '💼',
    title: 'Corporate Event',
    description: 'Team building, product launches, galas — professional planning made simple.',
    color: 'bg-teal-50 border-teal-100',
  },
  {
    emoji: '🎉',
    title: 'Reunion / Party',
    description: 'Barkada, family reunion, or milestone party — make every gathering count.',
    color: 'bg-green-50 border-green-100',
  },
]

const FEATURES = [
  {
    icon: '✨',
    title: 'AI Checklist Generator',
    description: 'Tell it your event type, date, budget, and city — it builds a complete, culturally-aware checklist in seconds.',
    color: 'bg-teal-50 border-teal-100',
  },
  {
    icon: '💰',
    title: 'Budget Tracker',
    description: "Track every peso without the spreadsheet headache. See exactly where your money's going before it's gone.",
    color: 'bg-amber-50 border-amber-100',
  },
  {
    icon: '🤝',
    title: 'Vendor List',
    description: 'One place for every supplier — photographers, caterers, florists. Track who you booked, who ghosted you, and who still owes you a quote.',
    color: 'bg-sky-50 border-sky-100',
  },
  {
    icon: '🎉',
    title: 'Event Countdown',
    description: 'A live ticking countdown to your big day. Motivating when you\'re on track. Terrifying when you\'re not.',
    color: 'bg-green-50 border-green-100',
  },
]

const TESTIMONIALS = [
  {
    text: '"The checklist knew about 18 roses AND cotillion rehearsals. I didn\'t have to add a single thing manually."',
    name: 'Andrea R.',
    location: 'Quezon City — Debut',
  },
  {
    text: '"Our christening had 200 guests. The budget tracker saved us from going ₱60k over before the day even came."',
    name: 'Paolo & Maricel',
    location: 'Davao City — Christening',
  },
  {
    text: '"We used it for our company anniversary gala. The AI checklist even reminded us about AV runthrough and emcee briefing."',
    name: 'Riza T.',
    location: 'Makati — Corporate Event',
  },
]

export default function HomePage() {
  const { user } = useAuth()
  const [savedId, setSavedId] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      getEventByUser(user.id).then((e) => {
        if (e) {
          localStorage.setItem('ganap_event_id', e.id)
          setSavedId(e.id)
        }
      })
    } else {
      setSavedId(localStorage.getItem('ganap_event_id'))
    }
  }, [user])

  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-4 left-4 right-4 z-50">
        <div className="max-w-5xl mx-auto bg-white/90 backdrop-blur-xl border border-teal-100 rounded-2xl px-5 py-3 flex items-center justify-between shadow-sm">
          <div className="font-serif font-bold text-xl text-teal-600">Ganap PH 🎉</div>
          <div className="flex items-center gap-3">
            <Link href="/directory" className="text-sm font-semibold text-gray-500 hover:text-teal-600 transition-colors hidden sm:block">
              Find Vendors
            </Link>
            {savedId ? (
              <Link href={`/dashboard?id=${savedId}`} className="btn-primary text-sm px-4 py-2">
                Continue Planning →
              </Link>
            ) : user ? (
              <Link href="/onboarding" className="btn-primary text-sm px-4 py-2">
                Start Planning
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-semibold text-gray-500 hover:text-teal-600 transition-colors">
                  Sign In
                </Link>
                <Link href="/onboarding" className="btn-primary text-sm px-4 py-2">
                  Start Planning
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-soft" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-teal-200/30 rounded-full blur-3xl -z-10" />

        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-teal-200 text-teal-600 text-sm font-semibold px-4 py-2 rounded-full mb-6 shadow-sm">
            <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse-slow" />
            Built for Filipino celebrations
          </div>

          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl text-gray-900 leading-[1.1] tracking-tight mb-6">
            Plan any Filipino celebration,{' '}
            <span className="text-gradient-teal">without losing your mind.</span>
          </h1>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Ganap PH is the event planner you actually need — AI-generated checklists, budget tracking, vendor management, and a countdown for any celebration.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {savedId ? (
              <>
                <Link href={`/dashboard?id=${savedId}`} className="btn-primary text-lg px-8 py-4">
                  🎉 Continue Planning
                </Link>
                <Link href="/onboarding" className="text-sm text-gray-400 hover:text-teal-500 transition-colors">
                  Start a new plan instead →
                </Link>
              </>
            ) : (
              <>
                <Link href="/onboarding" className="btn-primary text-lg px-8 py-4">
                  🎉 Start Planning — It&apos;s Free
                </Link>
                <p className="text-sm text-gray-400">No sign-up needed. Takes 2 minutes.</p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Countdown demo */}
      <section className="py-12 px-4">
        <div className="max-w-sm mx-auto">
          <div className="card p-6 text-center bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
            <div className="font-serif text-gray-500 text-sm mb-2">Your event is in</div>
            <div className="flex justify-center gap-4 my-4">
              {[{ n: '247', l: 'Days' }, { n: '08', l: 'Hours' }, { n: '32', l: 'Minutes' }].map((t) => (
                <div key={t.l} className="text-center">
                  <div className="text-4xl font-black text-teal-600 tabular-nums">{t.n}</div>
                  <div className="text-xs text-gray-400 font-medium mt-1">{t.l}</div>
                </div>
              ))}
            </div>
            <div className="font-serif text-gray-600 text-sm italic">Andrea R. · June 14, 2027</div>
          </div>
        </div>
      </section>

      {/* Event types */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl sm:text-4xl text-gray-900 mb-3">For every Filipino celebration.</h2>
            <p className="text-gray-500 text-lg">Whatever the occasion, Ganap PH has you covered.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {EVENT_TYPES.map((e) => (
              <div key={e.title} className={`card p-5 border ${e.color}`}>
                <div className="text-3xl mb-3">{e.emoji}</div>
                <h3 className="font-bold text-gray-900 text-base mb-1.5">{e.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{e.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-gradient-soft">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl sm:text-4xl text-gray-900 mb-3">Everything you need. Nothing you don&apos;t.</h2>
            <p className="text-gray-500 text-lg">One app for the whole journey, from &quot;sige, itutuloy natin&quot; to the big day.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className={`card p-6 border ${f.color}`}>
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Checklist highlight */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
                ✨ Powered by AI
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl text-gray-900 mb-4 leading-snug">
                A checklist that actually knows Filipino events.
              </h2>
              <p className="text-gray-500 leading-relaxed mb-6">
                Not some generic Western template. Ganap PH knows about Pre-Cana for weddings, 18 roses for debuts, ninong/ninang for christenings, and lechon for everything else. It builds your list around your exact event, budget, and city.
              </p>
              <ul className="space-y-2">
                {[
                  'Pre-Cana seminar booking (weddings)',
                  'Debut cotillion choreography schedule',
                  'Ninong/Ninang confirmation tracker',
                  'LGU civil registration requirements',
                  'Lechon and catering coordination',
                  'Corporate AV runthrough and emcee briefing',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* Mock checklist */}
            <div className="card p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="font-bold text-gray-900 text-sm">Your Checklist</div>
                <div className="text-xs text-teal-500 font-semibold">12/40 done</div>
              </div>
              <div className="space-y-2">
                {[
                  { done: true, task: 'Book the venue', phase: '6-9 months' },
                  { done: true, task: 'Lock in event date', phase: '6-9 months' },
                  { done: false, task: 'Confirm guest list', phase: '3-6 months' },
                  { done: false, task: 'Book photo & video team', phase: '3-6 months' },
                  { done: false, task: 'Finalize catering menu', phase: '1-3 months' },
                  { done: false, task: 'Print and send invitations', phase: '1-3 months' },
                ].map((item) => (
                  <div key={item.task} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-teal-500 border-teal-500' : 'border-gray-200'}`}>
                      {item.done && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm ${item.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>{item.task}</span>
                    <span className="ml-auto text-[10px] text-gray-300 whitespace-nowrap">{item.phase}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full w-[30%] bg-gradient-to-r from-teal-500 to-teal-400 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-gradient-soft">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl text-gray-900 mb-2">Families who stopped winging it</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="card p-5">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed italic mb-3">{t.text}</p>
                <div className="font-bold text-gray-900 text-sm">{t.name}</div>
                <div className="text-gray-400 text-xs">{t.location}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-hero text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-4xl sm:text-5xl mb-4">Ready to actually enjoy planning?</h2>
          <p className="text-teal-200 text-xl mb-10">Free. No account needed. Set up in 2 minutes.</p>
          <Link href="/onboarding" className="inline-flex items-center gap-2 bg-white text-teal-600 font-black px-10 py-4 rounded-xl text-lg hover:bg-teal-50 transition-colors duration-200 shadow-lg cursor-pointer">
            🎉 Start Planning Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900 text-center">
        <div className="font-serif font-bold text-white text-xl mb-2">Ganap PH 🎉</div>
        <p className="text-gray-500 text-sm">For Filipino families who have enough to worry about.</p>
        <p className="text-gray-600 text-xs mt-2">© 2026 Ganap PH. All rights reserved.</p>
      </footer>
    </main>
  )
}
