'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { EventDetails, EventType } from '@/lib/types'
import { EVENT_TYPE_LABELS, EVENT_TYPE_EMOJIS } from '@/lib/types'
import { saveEvent } from '@/lib/supabase'

const EVENT_TYPES: EventType[] = ['wedding', 'birthday', 'debut', 'christening', 'corporate', 'reunion']

const CITIES = [
  'Metro Manila', 'Cebu City', 'Davao City', 'Quezon City', 'Makati',
  'Taguig', 'Pasig', 'Mandaluyong', 'Muntinlupa', 'Alabang',
  'Batangas', 'Tagaytay', 'Palawan', 'Boracay', 'Bohol',
  'Iloilo', 'Bacolod', 'Cagayan de Oro', 'Zamboanga', 'General Santos',
]

const THEMES = [
  'Classic Elegance', 'Rustic Charm', 'Garden Romance', 'Beach Vibes',
  'Modern Minimalist', 'Bohemian', 'Vintage', 'Glamorous',
]

function getStepTitle(step: number, eventType: EventType): string {
  if (step === 0) return 'What are you planning? 🎉'
  if (step === 1) {
    const titles: Record<EventType, string> = {
      wedding: "Who's getting married? 💍",
      birthday: "Who's the celebrant? 🎂",
      debut: "Who's the debutante? 👗",
      christening: "Who's the baby? 🙏",
      corporate: "What's the event? 💼",
      reunion: "What's the occasion? 🎉",
    }
    return titles[eventType]
  }
  if (step === 2) return "When & where? 📅"
  if (step === 3) return "Budget & headcount 💸"
  return ''
}

function getStepSubtitle(step: number, eventType: EventType): string {
  if (step === 0) return 'Choose the type of celebration you\'re planning.'
  if (step === 1) {
    const subtitles: Record<EventType, string> = {
      wedding: 'Enter both names so we can personalize everything for you.',
      birthday: 'Tell us who we\'re celebrating and who\'s organizing.',
      debut: 'Enter the debutante\'s name and the organizer\'s name.',
      christening: 'Enter the baby\'s name and the parent\'s name.',
      corporate: 'Enter the event name and the organizer\'s name.',
      reunion: 'Enter the occasion name and the organizer\'s name.',
    }
    return subtitles[eventType]
  }
  if (step === 2) return 'This is what the countdown timer will count down to. No pressure.'
  if (step === 3) return 'Be honest — this is just between you and the app.'
  return ''
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<Partial<EventDetails>>({
    event_type: undefined,
    guest_count: 100,
    budget: 300000,
    city: 'Metro Manila',
  })

  const update = (key: keyof EventDetails, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const canNext = () => {
    if (step === 0) return !!form.event_type
    if (step === 1) {
      if (form.event_type === 'wedding') return !!(form.organizer_name && form.partner_name)
      return !!(form.event_name && form.organizer_name)
    }
    if (step === 2) return !!form.event_date
    if (step === 3) return !!(form.budget && form.guest_count)
    return true
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const eventData: EventDetails = {
        event_name: form.event_name ?? (form.event_type === 'wedding' ? `${form.organizer_name} & ${form.partner_name} Wedding` : ''),
        organizer_name: form.organizer_name ?? '',
        partner_name: form.partner_name,
        event_date: form.event_date ?? '',
        event_type: form.event_type!,
        theme: form.theme,
        guest_count: form.guest_count ?? 100,
        budget: form.budget ?? 300000,
        city: form.city ?? 'Metro Manila',
        venue_name: form.venue_name,
      }
      const event = await saveEvent({
        details: eventData,
        checklist: [],
      })
      if (event) {
        localStorage.setItem('ganap_event_id', event.id)
        router.push(`/dashboard?id=${event.id}`)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const TOTAL_STEPS = 4 // 0-3, displayed as steps 1-4
  const displayStep = step + 1
  const eventType = form.event_type ?? 'wedding'

  return (
    <main className="min-h-screen bg-gradient-soft flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="font-serif font-bold text-2xl text-teal-600 mb-1">Ganap PH 🎉</div>
          <div className="text-gray-500 text-sm">Step {displayStep} of {TOTAL_STEPS}</div>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[0, 1, 2, 3].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${s <= step ? 'bg-teal-500' : 'bg-teal-100'}`} />
          ))}
        </div>

        <div className="card p-8">
          <h2 className="font-serif text-2xl text-gray-900 mb-2">{getStepTitle(step, eventType)}</h2>
          <p className="text-gray-500 text-sm mb-6">{getStepSubtitle(step, eventType)}</p>

          {/* Step 0: Event Type */}
          {step === 0 && (
            <div className="grid grid-cols-2 gap-3">
              {EVENT_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => update('event_type', type)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${form.event_type === type ? 'border-teal-500 bg-teal-50' : 'border-gray-100 hover:border-teal-200'}`}
                >
                  <span className="text-3xl">{EVENT_TYPE_EMOJIS[type]}</span>
                  <span className="text-sm font-semibold text-gray-700 text-center leading-tight">{EVENT_TYPE_LABELS[type]}</span>
                </button>
              ))}
            </div>
          )}

          {/* Step 1: Names */}
          {step === 1 && (
            <div className="space-y-4">
              {form.event_type === 'wedding' ? (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Partner 1 (Organizer)</label>
                    <input
                      type="text"
                      placeholder="e.g. Maria Santos"
                      className="input-field"
                      value={form.organizer_name || ''}
                      onChange={(e) => update('organizer_name', e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-teal-100" />
                    <span className="text-teal-400 text-lg">💕</span>
                    <div className="flex-1 h-px bg-teal-100" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Partner 2</label>
                    <input
                      type="text"
                      placeholder="e.g. Jose Dela Cruz"
                      className="input-field"
                      value={form.partner_name || ''}
                      onChange={(e) => update('partner_name', e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      {form.event_type === 'birthday' ? 'Celebrant Name' :
                       form.event_type === 'debut' ? 'Debutante Name' :
                       form.event_type === 'christening' ? "Baby's Name" :
                       'Event Name'}
                    </label>
                    <input
                      type="text"
                      placeholder={
                        form.event_type === 'birthday' ? 'e.g. Lola Coring' :
                        form.event_type === 'debut' ? 'e.g. Andrea Reyes' :
                        form.event_type === 'christening' ? 'e.g. Baby Lucas' :
                        form.event_type === 'corporate' ? 'e.g. TechCorp 10th Anniversary Gala' :
                        'e.g. Santos Family Reunion 2027'
                      }
                      className="input-field"
                      value={form.event_name || ''}
                      onChange={(e) => update('event_name', e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Name (Organizer)</label>
                    <input
                      type="text"
                      placeholder="e.g. Paolo Reyes"
                      className="input-field"
                      value={form.organizer_name || ''}
                      onChange={(e) => update('organizer_name', e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 2: Date & Location */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Event Date</label>
                <input
                  type="date"
                  className="input-field"
                  value={form.event_date || ''}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => update('event_date', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Venue Name (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Fernwood Gardens, Manila Cathedral"
                  className="input-field"
                  value={form.venue_name || ''}
                  onChange={(e) => update('venue_name', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">City / Location</label>
                <select className="input-field" value={form.city} onChange={(e) => update('city', e.target.value)}>
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Theme (optional)</label>
                <div className="grid grid-cols-2 gap-2">
                  {THEMES.map((t) => (
                    <button
                      key={t}
                      onClick={() => update('theme', t)}
                      className={`text-sm px-3 py-2 rounded-lg border-2 text-left transition-all ${form.theme === t ? 'border-teal-500 bg-teal-50 text-teal-700 font-semibold' : 'border-gray-100 text-gray-600 hover:border-teal-200'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Budget & Guests */}
          {step === 3 && (
            <div>
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Total Budget <span className="text-teal-500">₱{(form.budget || 0).toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min={50000}
                  max={5000000}
                  step={50000}
                  value={form.budget || 300000}
                  onChange={(e) => update('budget', Number(e.target.value))}
                  className="w-full accent-teal-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>₱50k</span>
                  <span>₱5M</span>
                </div>
                <input
                  type="number"
                  placeholder="Or type an amount"
                  className="input-field mt-2"
                  value={form.budget || ''}
                  onChange={(e) => update('budget', Number(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Guest Count <span className="text-teal-500">{form.guest_count}</span>
                </label>
                <input
                  type="range"
                  min={10}
                  max={1000}
                  step={10}
                  value={form.guest_count || 100}
                  onChange={(e) => update('guest_count', Number(e.target.value))}
                  className="w-full accent-teal-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>10</span>
                  <span>1,000+</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} className="flex-1 btn-secondary">
                ← Back
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canNext()}
                className="flex-1 btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !canNext()}
                className="flex-1 btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving...
                  </span>
                ) : "🎉 Let's go!"}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
