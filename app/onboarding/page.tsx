'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { WeddingDetails, WeddingType, WeddingTheme } from '@/lib/types'
import { saveWedding } from '@/lib/supabase'

const WEDDING_TYPES: { value: WeddingType; label: string; emoji: string }[] = [
  { value: 'church', label: 'Church', emoji: '⛪' },
  { value: 'civil', label: 'Civil', emoji: '🏛️' },
  { value: 'beach', label: 'Beach', emoji: '🌊' },
  { value: 'garden', label: 'Garden', emoji: '🌸' },
  { value: 'destination', label: 'Destination', emoji: '✈️' },
]

const THEMES: { value: WeddingTheme; label: string }[] = [
  { value: 'classic', label: 'Classic Elegance' },
  { value: 'rustic', label: 'Rustic Charm' },
  { value: 'garden', label: 'Garden Romance' },
  { value: 'beach', label: 'Beach Vibes' },
  { value: 'modern', label: 'Modern Minimalist' },
  { value: 'bohemian', label: 'Bohemian' },
  { value: 'vintage', label: 'Vintage' },
  { value: 'glamorous', label: 'Glamorous' },
]

const CITIES = [
  'Metro Manila', 'Cebu City', 'Davao City', 'Quezon City', 'Makati',
  'Taguig', 'Pasig', 'Mandaluyong', 'Muntinlupa', 'Alabang',
  'Batangas', 'Tagaytay', 'Palawan', 'Boracay', 'Bohol',
  'Iloilo', 'Bacolod', 'Cagayan de Oro', 'Zamboanga', 'General Santos',
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<Partial<WeddingDetails>>({
    wedding_type: 'church',
    theme: 'classic',
    guest_count: 150,
    budget: 500000,
    city: 'Metro Manila',
  })

  const update = (key: keyof WeddingDetails, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const canNext = () => {
    if (step === 1) return !!(form.partner1_name && form.partner2_name)
    if (step === 2) return !!(form.wedding_date)
    if (step === 3) return !!(form.wedding_type && form.city)
    if (step === 4) return !!(form.budget && form.guest_count)
    return true
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const wedding = await saveWedding({
        details: form as WeddingDetails,
        checklist: [],
      })
      if (wedding) {
        localStorage.setItem('kasal_wedding_id', wedding.id)
        router.push(`/dashboard?id=${wedding.id}`)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-wedding flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="font-serif font-bold text-2xl text-rose-600 mb-1">Kasal.ai 💍</div>
          <div className="text-gray-500 text-sm">Step {step} of 4</div>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${s <= step ? 'bg-rose-500' : 'bg-rose-100'}`} />
          ))}
        </div>

        <div className="card p-8">
          {/* Step 1: Names */}
          {step === 1 && (
            <div>
              <h2 className="font-serif text-2xl text-gray-900 mb-2">Who&apos;s getting married? 🥂</h2>
              <p className="text-gray-500 text-sm mb-6">Enter both your names so we can personalize everything for you.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Partner 1</label>
                  <input
                    type="text"
                    placeholder="e.g. Maria Santos"
                    className="input-field"
                    value={form.partner1_name || ''}
                    onChange={(e) => update('partner1_name', e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-rose-100" />
                  <span className="text-rose-400 text-lg">💕</span>
                  <div className="flex-1 h-px bg-rose-100" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Partner 2</label>
                  <input
                    type="text"
                    placeholder="e.g. Jose Dela Cruz"
                    className="input-field"
                    value={form.partner2_name || ''}
                    onChange={(e) => update('partner2_name', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Wedding date */}
          {step === 2 && (
            <div>
              <h2 className="font-serif text-2xl text-gray-900 mb-2">When&apos;s the big day? 📅</h2>
              <p className="text-gray-500 text-sm mb-6">This is what the countdown timer will count down to. No pressure.</p>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Wedding Date</label>
                <input
                  type="date"
                  className="input-field"
                  value={form.wedding_date || ''}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => update('wedding_date', e.target.value)}
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Venue Name (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Fernwood Gardens, Manila Cathedral"
                  className="input-field"
                  value={form.venue_name || ''}
                  onChange={(e) => update('venue_name', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 3: Type & theme */}
          {step === 3 && (
            <div>
              <h2 className="font-serif text-2xl text-gray-900 mb-2">What kind of wedding? 🎊</h2>
              <p className="text-gray-500 text-sm mb-6">This helps us tailor your checklist and vendor suggestions.</p>

              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2.5">Wedding Type</label>
                <div className="grid grid-cols-5 gap-2">
                  {WEDDING_TYPES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => update('wedding_type', t.value)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${form.wedding_type === t.value ? 'border-rose-500 bg-rose-50' : 'border-gray-100 hover:border-rose-200'}`}
                    >
                      <span className="text-2xl">{t.emoji}</span>
                      <span className="text-[10px] font-semibold text-gray-600 text-center leading-tight">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Theme</label>
                <div className="grid grid-cols-2 gap-2">
                  {THEMES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => update('theme', t.value)}
                      className={`text-sm px-3 py-2 rounded-lg border-2 text-left transition-all ${form.theme === t.value ? 'border-rose-500 bg-rose-50 text-rose-700 font-semibold' : 'border-gray-100 text-gray-600 hover:border-rose-200'}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">City / Location</label>
                <select className="input-field" value={form.city} onChange={(e) => update('city', e.target.value)}>
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Step 4: Budget & guests */}
          {step === 4 && (
            <div>
              <h2 className="font-serif text-2xl text-gray-900 mb-2">Budget & headcount 💸</h2>
              <p className="text-gray-500 text-sm mb-6">Be honest — this is just between you and the app.</p>

              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Total Budget <span className="text-rose-500">₱{(form.budget || 0).toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min={100000}
                  max={5000000}
                  step={50000}
                  value={form.budget || 500000}
                  onChange={(e) => update('budget', Number(e.target.value))}
                  className="w-full accent-rose-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>₱100k</span>
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
                  Guest Count <span className="text-rose-500">{form.guest_count}</span>
                </label>
                <input
                  type="range"
                  min={20}
                  max={1000}
                  step={10}
                  value={form.guest_count || 150}
                  onChange={(e) => update('guest_count', Number(e.target.value))}
                  className="w-full accent-rose-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>20</span>
                  <span>1,000+</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button onClick={() => setStep(s => s - 1)} className="flex-1 btn-secondary">
                ← Back
              </button>
            )}
            {step < 4 ? (
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
                ) : "💍 Let's go!"}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
