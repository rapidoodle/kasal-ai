'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getVendors, upsertVendor, updateVendor, deleteVendor } from '@/lib/supabase'
import type { Vendor, VendorStatus } from '@/lib/types'

const CATEGORIES = [
  'Photo/Video', 'Catering', 'Venue', 'Florals', 'HMUA', 'Attire',
  'Cake', 'Entertainment', 'Transportation', 'Souvenirs', 'Invitation',
  'Lighting & Sounds', 'Event Coordinator', 'Others',
]

const STATUSES: { value: VendorStatus; label: string; color: string }[] = [
  { value: 'researching', label: 'Researching', color: 'bg-gray-100 text-gray-600' },
  { value: 'contacted', label: 'Contacted', color: 'bg-blue-100 text-blue-700' },
  { value: 'meeting', label: 'Meeting Set', color: 'bg-amber-100 text-amber-700' },
  { value: 'booked', label: 'Booked ✓', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'rejected', label: 'Passed', color: 'bg-red-100 text-red-600' },
]

const statusInfo = (s: VendorStatus) => STATUSES.find((x) => x.value === s) ?? STATUSES[0]

export default function VendorsPage() {
  const params = useSearchParams()
  const router = useRouter()
  const id = params.get('id')

  const [vendors, setVendors] = useState<Vendor[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filterCat, setFilterCat] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [form, setForm] = useState({
    category: CATEGORIES[0],
    name: '',
    contact_name: '',
    contact_number: '',
    price: 0,
    status: 'researching' as VendorStatus,
    notes: '',
  })

  const load = useCallback(async () => {
    if (!id) return router.push('/')
    const data = await getVendors(id)
    setVendors(data)
  }, [id, router])

  useEffect(() => { load() }, [load])

  const saveVendor = async () => {
    if (!id || !form.name) return
    if (editingId) {
      await updateVendor(editingId, form)
      setVendors((prev) => prev.map((v) => v.id === editingId ? { ...v, ...form } : v))
    } else {
      const newVendor = await upsertVendor({ wedding_id: id, ...form })
      if (newVendor) setVendors((prev) => [...prev, newVendor])
    }
    setForm({ category: CATEGORIES[0], name: '', contact_name: '', contact_number: '', price: 0, status: 'researching', notes: '' })
    setShowAdd(false)
    setEditingId(null)
  }

  const removeVendor = async (vid: string) => {
    await deleteVendor(vid)
    setVendors((prev) => prev.filter((v) => v.id !== vid))
  }

  const cycleStatus = async (vendor: Vendor) => {
    const idx = STATUSES.findIndex((s) => s.value === vendor.status)
    const next = STATUSES[(idx + 1) % STATUSES.length].value
    await updateVendor(vendor.id, { status: next })
    setVendors((prev) => prev.map((v) => v.id === vendor.id ? { ...v, status: next } : v))
  }

  const activeCats = Array.from(new Set(vendors.map((v) => v.category)))

  const filtered = vendors.filter((v) => {
    if (filterCat !== 'all' && v.category !== filterCat) return false
    if (filterStatus !== 'all' && v.status !== filterStatus) return false
    return true
  })

  const bookedCount = vendors.filter((v) => v.status === 'booked').length
  const totalSpend = vendors.filter((v) => v.status === 'booked').reduce((s, v) => s + v.price, 0)

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href={`/dashboard?id=${id}`} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1">
            <div className="font-bold text-gray-900">Vendor List 🤝</div>
            <div className="text-xs text-gray-400">{bookedCount} nabook · ₱{totalSpend.toLocaleString()} total</div>
          </div>
          <button onClick={() => { setShowAdd(true); setEditingId(null) }} className="btn-primary text-sm px-3 py-1.5">
            + Vendor
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Filters */}
        {vendors.length > 0 && (
          <div className="space-y-2">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => setFilterCat('all')}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterCat === 'all' ? 'bg-rose-500 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}
              >
                All
              </button>
              {activeCats.map((c) => (
                <button
                  key={c}
                  onClick={() => setFilterCat(c === filterCat ? 'all' : c)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterCat === c ? 'bg-rose-500 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => setFilterStatus('all')}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterStatus === 'all' ? 'bg-gray-700 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}
              >
                All Statuses
              </button>
              {STATUSES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setFilterStatus(s.value === filterStatus ? 'all' : s.value)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterStatus === s.value ? 'bg-gray-700 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {vendors.length === 0 && (
          <div className="card p-8 text-center bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200">
            <div className="text-4xl mb-3">🤝</div>
            <div className="font-serif text-xl text-gray-900 mb-1">No vendors yet</div>
            <p className="text-sm text-gray-500 mb-5">Add your suppliers here so you can track who you&apos;ve contacted, who you booked, and what everything costs.</p>
            <button onClick={() => setShowAdd(true)} className="btn-primary">+ Add Vendor</button>
          </div>
        )}

        {/* Vendor cards */}
        {filtered.map((vendor) => (
          <div key={vendor.id} className="card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-gray-900">{vendor.name}</span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{vendor.category}</span>
                </div>
                {vendor.contact_name && (
                  <div className="text-sm text-gray-500 mt-1">{vendor.contact_name}</div>
                )}
                {vendor.contact_number && (
                  <a href={`tel:${vendor.contact_number}`} className="text-sm text-rose-500 font-medium">
                    {vendor.contact_number}
                  </a>
                )}
                {vendor.price > 0 && (
                  <div className="text-sm font-bold text-gray-800 mt-1">₱{vendor.price.toLocaleString()}</div>
                )}
                {vendor.notes && (
                  <div className="text-xs text-gray-400 mt-1.5 leading-relaxed">{vendor.notes}</div>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={() => cycleStatus(vendor)}
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold whitespace-nowrap transition-all ${statusInfo(vendor.status).color}`}
                >
                  {statusInfo(vendor.status).label}
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setForm({ category: vendor.category, name: vendor.name, contact_name: vendor.contact_name ?? '', contact_number: vendor.contact_number ?? '', price: vendor.price, status: vendor.status, notes: vendor.notes ?? '' })
                      setEditingId(vendor.id)
                      setShowAdd(true)
                    }}
                    className="text-gray-300 hover:text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button onClick={() => removeVendor(vendor.id)} className="text-gray-200 hover:text-red-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-gray-900 text-lg mb-4">{editingId ? 'Edit Vendor' : 'Add New Vendor'}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Kategorya</label>
                <select className="input-field" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Pangalan ng Vendor *</label>
                <input type="text" className="input-field" placeholder="e.g. Juan Photography Studio" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Contact Person</label>
                  <input type="text" className="input-field" placeholder="e.g. Mary" value={form.contact_name} onChange={(e) => setForm((f) => ({ ...f, contact_name: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Contact Number</label>
                  <input type="tel" className="input-field" placeholder="09xx..." value={form.contact_number} onChange={(e) => setForm((f) => ({ ...f, contact_number: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Presyo (₱)</label>
                <input type="number" className="input-field" value={form.price || ''} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Status</label>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setForm((f) => ({ ...f, status: s.value }))}
                      className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all border-2 ${form.status === s.value ? 'border-rose-500 ' + s.color : 'border-transparent ' + s.color}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Notes</label>
                <textarea className="input-field resize-none" rows={2} placeholder="Anything worth remembering..." value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setShowAdd(false); setEditingId(null) }} className="flex-1 btn-secondary">Cancel</button>
              <button onClick={saveVendor} className="flex-1 btn-primary">Save</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
