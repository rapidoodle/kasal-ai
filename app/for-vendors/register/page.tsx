'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const CATEGORIES = [
  'Photography', 'Videography', 'Catering', 'Venue', 'Florals & Styling',
  'Hair & Makeup', 'Wedding Gown', 'Suits & Barong', 'Cake', 'Entertainment',
  'Invitations', 'Lights & Sounds', 'Event Coordinator', 'Transportation', 'Other',
]

const CITIES = [
  'Metro Manila', 'Cebu City', 'Davao City', 'Tagaytay', 'Batangas',
  'Boracay', 'Palawan', 'Bohol', 'Iloilo', 'Bacolod',
  'Cagayan de Oro', 'Zamboanga', 'Pampanga', 'Bataan', 'Other',
]

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function VendorRegisterPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    business_name: '',
    category: '',
    tagline: '',
    description: '',
    city: '',
    province: '',
    price_min: '',
    price_max: '',
    price_label: '',
    contact_name: '',
    contact_email: '',
    contact_number: '',
    website_url: '',
    facebook_url: '',
    instagram_url: '',
    tiktok_url: '',
  })

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }))

  const canNext = () => {
    if (step === 1) return !!(form.business_name && form.category && form.city)
    if (step === 2) return !!(form.contact_name && form.contact_email)
    return true
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const slug = slugify(form.business_name) + '-' + slugify(form.city)
      const { error: err } = await supabase.from('vendor_listings').insert({
        business_name: form.business_name,
        slug,
        category: form.category,
        tagline: form.tagline || null,
        description: form.description || null,
        city: form.city,
        province: form.province || null,
        price_min: form.price_min ? Number(form.price_min) : null,
        price_max: form.price_max ? Number(form.price_max) : null,
        price_label: form.price_label || null,
        contact_name: form.contact_name,
        contact_email: form.contact_email,
        contact_number: form.contact_number || null,
        website_url: form.website_url || null,
        facebook_url: form.facebook_url || null,
        instagram_url: form.instagram_url || null,
        tiktok_url: form.tiktok_url || null,
        approved: false,
      })
      if (err) throw err

      // Fire-and-forget admin notification
      fetch('/api/notify-vendor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: form.business_name,
          category: form.category,
          city: form.city,
          contact_name: form.contact_name,
          contact_email: form.contact_email,
        }),
      })

      setSubmitted(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-gradient-wedding flex items-center justify-center px-4">
        <div className="max-w-md w-full card p-10 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="font-serif text-3xl text-gray-900 mb-3">You&apos;re on the list!</h2>
          <p className="text-gray-500 leading-relaxed mb-6">
            We received your listing for <strong>{form.business_name}</strong>. Our team will review and approve it within 24 hours. We&apos;ll email you at <strong>{form.contact_email}</strong> when you&apos;re live.
          </p>
          <div className="space-y-3">
            <Link href="/directory" className="block btn-primary text-center">
              Browse the Directory
            </Link>
            <Link href="/for-vendors" className="block btn-secondary text-center">
              Back to Vendor Page
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-wedding flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/for-vendors" className="font-serif font-bold text-2xl text-rose-600">
            Kasal.ai 💍
          </Link>
          <p className="text-gray-500 text-sm mt-1">List your business · Step {step} of 3</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${s <= step ? 'bg-rose-500' : 'bg-rose-100'}`} />
          ))}
        </div>

        <div className="card p-8">
          {/* Step 1: Business info */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="font-serif text-2xl text-gray-900 mb-1">Your business</h2>
                <p className="text-gray-500 text-sm mb-5">Tell couples what you do and where you&apos;re based.</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Business Name *</label>
                <input className="input-field" placeholder="e.g. Juan Santos Photography" value={form.business_name} onChange={e => set('business_name', e.target.value)} autoFocus />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Category *</label>
                <select className="input-field" value={form.category} onChange={e => set('category', e.target.value)}>
                  <option value="">Select a category</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">City *</label>
                <select className="input-field" value={form.city} onChange={e => set('city', e.target.value)}>
                  <option value="">Select a city</option>
                  {CITIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Tagline <span className="text-gray-400 font-normal">(optional)</span></label>
                <input className="input-field" placeholder="e.g. Capturing love stories since 2018" value={form.tagline} onChange={e => set('tagline', e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">About your business <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea className="input-field resize-none" rows={3} placeholder="Tell couples a bit about your style, experience, and what makes you special..." value={form.description} onChange={e => set('description', e.target.value)} />
              </div>
            </div>
          )}

          {/* Step 2: Contact & pricing */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="font-serif text-2xl text-gray-900 mb-1">Contact & pricing</h2>
                <p className="text-gray-500 text-sm mb-5">How couples will reach you, and what to expect on price.</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Your Name *</label>
                <input className="input-field" placeholder="e.g. Juan Santos" value={form.contact_name} onChange={e => set('contact_name', e.target.value)} autoFocus />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Email Address *</label>
                <input type="email" className="input-field" placeholder="you@example.com" value={form.contact_email} onChange={e => set('contact_email', e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Phone / WhatsApp <span className="text-gray-400 font-normal">(optional)</span></label>
                <input type="tel" className="input-field" placeholder="09xx xxx xxxx" value={form.contact_number} onChange={e => set('contact_number', e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Pricing <span className="text-gray-400 font-normal">(optional)</span></label>
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div>
                    <input type="number" className="input-field" placeholder="Min price (₱)" value={form.price_min} onChange={e => set('price_min', e.target.value)} />
                  </div>
                  <div>
                    <input type="number" className="input-field" placeholder="Max price (₱)" value={form.price_max} onChange={e => set('price_max', e.target.value)} />
                  </div>
                </div>
                <input className="input-field" placeholder='e.g. "Packages starting at ₱15,000"' value={form.price_label} onChange={e => set('price_label', e.target.value)} />
              </div>
            </div>
          )}

          {/* Step 3: Online presence */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="font-serif text-2xl text-gray-900 mb-1">Online presence</h2>
                <p className="text-gray-500 text-sm mb-5">Link your socials so couples can see your work. All optional.</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Website</label>
                <input className="input-field" placeholder="https://yourwebsite.com" value={form.website_url} onChange={e => set('website_url', e.target.value)} autoFocus />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Facebook Page</label>
                <input className="input-field" placeholder="https://facebook.com/yourbusiness" value={form.facebook_url} onChange={e => set('facebook_url', e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Instagram</label>
                <input className="input-field" placeholder="https://instagram.com/yourbusiness" value={form.instagram_url} onChange={e => set('instagram_url', e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">TikTok</label>
                <input className="input-field" placeholder="https://tiktok.com/@yourbusiness" value={form.tiktok_url} onChange={e => set('tiktok_url', e.target.value)} />
              </div>
              {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button onClick={() => setStep(s => s - 1)} className="flex-1 btn-secondary">← Back</button>
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
                disabled={loading}
                className="flex-1 btn-primary disabled:opacity-40"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Submitting...
                  </span>
                ) : '🎉 Submit Listing'}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-5">
          Already listed?{' '}
          <Link href="/directory" className="text-rose-500 hover:underline">Browse the directory</Link>
        </p>
      </div>
    </main>
  )
}
