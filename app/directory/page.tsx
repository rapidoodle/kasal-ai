'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const CATEGORIES = [
  'All', 'Photography', 'Videography', 'Catering', 'Venue', 'Florals & Styling',
  'Hair & Makeup', 'Wedding Gown', 'Suits & Barong', 'Cake', 'Entertainment',
  'Invitations', 'Lights & Sounds', 'Event Coordinator', 'Transportation',
]

const CITIES = [
  'All', 'Metro Manila', 'Cebu City', 'Davao City', 'Tagaytay',
  'Batangas', 'Boracay', 'Palawan', 'Bohol', 'Iloilo', 'Bacolod',
]

type VendorListing = {
  id: string
  business_name: string
  slug: string
  category: string
  tagline: string | null
  city: string
  price_label: string | null
  price_min: number | null
  cover_image_url: string | null
  featured: boolean
}

function fmt(n: number) {
  return `₱${n.toLocaleString()}`
}

function DirectoryContent() {
  const [vendors, setVendors] = useState<VendorListing[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('All')
  const [city, setCity] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      let query = supabase
        .from('vendor_listings')
        .select('id, business_name, slug, category, tagline, city, price_label, price_min, cover_image_url, featured')
        .eq('approved', true)
        .order('featured', { ascending: false })
        .order('submitted_at', { ascending: false })

      if (category !== 'All') query = query.eq('category', category)
      if (city !== 'All') query = query.eq('city', city)

      const { data } = await query
      setVendors(data ?? [])
      setLoading(false)
    }
    load()
  }, [category, city])

  const filtered = search
    ? vendors.filter(v =>
        v.business_name.toLowerCase().includes(search.toLowerCase()) ||
        v.category.toLowerCase().includes(search.toLowerCase()) ||
        v.city.toLowerCase().includes(search.toLowerCase())
      )
    : vendors

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Nav */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="font-serif font-bold text-rose-600 text-lg">Kasal.ai 💍</Link>
          <div className="flex items-center gap-3">
            <Link href="/for-vendors" className="text-xs font-semibold text-gray-500 hover:text-rose-600 transition-colors hidden sm:block">
              List your business →
            </Link>
            <Link href="/onboarding" className="btn-primary text-sm px-3 py-1.5">Start Planning</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-wedding py-12 px-4 text-center">
        <h1 className="font-serif text-3xl sm:text-4xl text-gray-900 mb-2">Wedding Supplier Directory</h1>
        <p className="text-gray-500 mb-6">Find trusted vendors for your Filipino wedding.</p>
        <div className="max-w-md mx-auto">
          <input
            type="text"
            placeholder="Search photographers, caterers, florists..."
            className="input-field shadow-sm"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="space-y-3 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${category === c ? 'bg-rose-500 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-rose-200'}`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CITIES.map(c => (
              <button
                key={c}
                onClick={() => setCity(c)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${city === c ? 'bg-gray-700 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-gray-400 mb-4">
          {loading ? 'Loading...' : `${filtered.length} supplier${filtered.length !== 1 ? 's' : ''} found`}
        </div>

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="card p-12 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <div className="font-serif text-xl text-gray-900 mb-2">No vendors found yet</div>
            <p className="text-gray-500 text-sm mb-5">
              {category !== 'All' || city !== 'All'
                ? 'Try a different category or city.'
                : "We're onboarding our first batch of suppliers. Check back soon!"}
            </p>
            <Link href="/for-vendors/register" className="btn-primary text-sm">
              Are you a supplier? List for free →
            </Link>
          </div>
        )}

        {/* Vendor grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="h-32 bg-gray-100 rounded-xl mb-4" />
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(vendor => (
              <Link
                key={vendor.id}
                href={`/directory/${vendor.slug}`}
                className="card p-5 hover:border-rose-200 hover:shadow-md transition-all group block"
              >
                {/* Cover image or placeholder */}
                <div className="h-36 rounded-xl mb-4 overflow-hidden bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center">
                  {vendor.cover_image_url ? (
                    <img src={vendor.cover_image_url} alt={vendor.business_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-4xl opacity-40">📷</div>
                  )}
                </div>

                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="font-bold text-gray-900 group-hover:text-rose-600 transition-colors leading-tight">
                    {vendor.business_name}
                  </div>
                  {vendor.featured && (
                    <span className="flex-shrink-0 text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">⭐ Featured</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-xs bg-rose-50 text-rose-600 font-semibold px-2 py-0.5 rounded-full">{vendor.category}</span>
                  <span className="text-xs text-gray-400">· {vendor.city}</span>
                </div>

                {vendor.tagline && (
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-2">{vendor.tagline}</p>
                )}

                {(vendor.price_label || vendor.price_min) && (
                  <div className="text-xs font-semibold text-gray-700 mt-2">
                    {vendor.price_label || (vendor.price_min ? `Starting at ${fmt(vendor.price_min)}` : '')}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}

        {/* CTA for vendors */}
        {!loading && filtered.length > 0 && (
          <div className="mt-12 card p-6 text-center bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200">
            <div className="font-bold text-gray-900 mb-1">Are you a wedding supplier?</div>
            <p className="text-sm text-gray-500 mb-4">List your business for free and get discovered by couples planning their wedding.</p>
            <Link href="/for-vendors/register" className="btn-primary text-sm">
              List Your Business →
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}

export default function DirectoryPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-4xl animate-bounce">💍</div></main>}>
      <DirectoryContent />
    </Suspense>
  )
}
