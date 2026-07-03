'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type VendorListing = {
  id: string
  business_name: string
  slug: string
  category: string
  tagline: string | null
  description: string | null
  city: string
  province: string | null
  price_min: number | null
  price_max: number | null
  price_label: string | null
  contact_name: string
  contact_email: string
  contact_number: string | null
  website_url: string | null
  facebook_url: string | null
  instagram_url: string | null
  tiktok_url: string | null
  cover_image_url: string | null
  portfolio_urls: string[]
  featured: boolean
}

function fmt(n: number) { return `₱${n.toLocaleString()}` }

export default function VendorProfilePage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const [vendor, setVendor] = useState<VendorListing | null>(null)
  const [loading, setLoading] = useState(true)
  const [showContact, setShowContact] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('vendor_listings')
        .select('*')
        .eq('slug', slug)
        .eq('approved', true)
        .single()
      if (!data) { router.push('/directory'); return }
      setVendor(data)
      setLoading(false)
    }
    load()
  }, [slug, router])

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-4xl animate-bounce">💍</div>
      </main>
    )
  }

  if (!vendor) return null

  const socialLinks = [
    { url: vendor.facebook_url, label: 'Facebook', icon: '📘' },
    { url: vendor.instagram_url, label: 'Instagram', icon: '📷' },
    { url: vendor.tiktok_url, label: 'TikTok', icon: '🎵' },
    { url: vendor.website_url, label: 'Website', icon: '🌐' },
  ].filter(s => s.url)

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Nav */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/directory" className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <Link href="/" className="font-serif font-bold text-rose-600">Kasal.ai 💍</Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* Cover image */}
        <div className="card overflow-hidden">
          <div className="h-48 sm:h-64 bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center">
            {vendor.cover_image_url ? (
              <img src={vendor.cover_image_url} alt={vendor.business_name} className="w-full h-full object-cover" />
            ) : (
              <div className="text-6xl opacity-20">📷</div>
            )}
          </div>
          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="font-serif text-2xl text-gray-900">{vendor.business_name}</h1>
                  {vendor.featured && <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">⭐ Featured</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-rose-50 text-rose-600 font-semibold px-2 py-0.5 rounded-full">{vendor.category}</span>
                  <span className="text-xs text-gray-400">· {vendor.city}{vendor.province ? `, ${vendor.province}` : ''}</span>
                </div>
              </div>
            </div>
            {vendor.tagline && (
              <p className="text-gray-600 mt-3 italic">&ldquo;{vendor.tagline}&rdquo;</p>
            )}
          </div>
        </div>

        {/* About */}
        {vendor.description && (
          <div className="card p-5">
            <h2 className="font-bold text-gray-900 mb-2">About</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{vendor.description}</p>
          </div>
        )}

        {/* Pricing */}
        {(vendor.price_label || vendor.price_min || vendor.price_max) && (
          <div className="card p-5">
            <h2 className="font-bold text-gray-900 mb-2">Pricing</h2>
            {vendor.price_label && (
              <p className="text-gray-700 font-semibold">{vendor.price_label}</p>
            )}
            {(vendor.price_min || vendor.price_max) && (
              <p className="text-gray-500 text-sm mt-1">
                {vendor.price_min && vendor.price_max
                  ? `${fmt(vendor.price_min)} – ${fmt(vendor.price_max)}`
                  : vendor.price_min
                  ? `Starting at ${fmt(vendor.price_min)}`
                  : `Up to ${fmt(vendor.price_max!)}`}
              </p>
            )}
          </div>
        )}

        {/* Social links */}
        {socialLinks.length > 0 && (
          <div className="card p-5">
            <h2 className="font-bold text-gray-900 mb-3">Find them online</h2>
            <div className="flex flex-wrap gap-2">
              {socialLinks.map(s => (
                <a
                  key={s.label}
                  href={s.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:border-rose-300 hover:text-rose-600 transition-all"
                >
                  <span>{s.icon}</span>
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Contact CTA */}
        <div className="card p-5 bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200">
          <h2 className="font-bold text-gray-900 mb-1">Interested in booking?</h2>
          <p className="text-sm text-gray-500 mb-4">Send them a message and ask about availability for your date.</p>

          {showContact ? (
            <div className="space-y-3">
              <div className="bg-white rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span>👤</span>
                  <span className="font-semibold">{vendor.contact_name}</span>
                </div>
                {vendor.contact_email && (
                  <a href={`mailto:${vendor.contact_email}`} className="flex items-center gap-2 text-sm text-rose-600 hover:underline">
                    <span>📧</span>
                    {vendor.contact_email}
                  </a>
                )}
                {vendor.contact_number && (
                  <a href={`tel:${vendor.contact_number}`} className="flex items-center gap-2 text-sm text-rose-600 hover:underline">
                    <span>📱</span>
                    {vendor.contact_number}
                  </a>
                )}
              </div>
              {vendor.contact_number && (
                <a
                  href={`https://wa.me/${vendor.contact_number.replace(/\D/g, '').replace(/^0/, '63')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-3 rounded-xl transition-colors"
                >
                  <span>💬</span> Message on WhatsApp
                </a>
              )}
            </div>
          ) : (
            <button onClick={() => setShowContact(true)} className="w-full btn-primary">
              📩 See Contact Details
            </button>
          )}
        </div>

        {/* Back to directory */}
        <div className="text-center pb-6">
          <Link href="/directory" className="text-sm text-gray-400 hover:text-rose-500 transition-colors">
            ← Back to all vendors
          </Link>
        </div>
      </div>
    </main>
  )
}
