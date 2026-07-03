'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getEvent, getBudgetItems, upsertBudgetItem, updateBudgetItem, deleteBudgetItem } from '@/lib/supabase'
import type { BudgetItem, Event } from '@/lib/types'

const DEFAULT_CATEGORIES = [
  'Venue', 'Catering', 'Photo/Video', 'Florals', 'Styling & HMUA',
  'Entertainment', 'Cake', 'Invitations', 'Transportation', 'Attire',
  'Decorations', 'Giveaways', 'Miscellaneous',
]

type BudgetBreakdown = {
  category: string
  percentage: number
  estimated: number
  notes: string
}

function BudgetContent() {
  const params = useSearchParams()
  const router = useRouter()
  const id = params.get('id')

  const [event, setEvent] = useState<Event | null>(null)
  const [items, setItems] = useState<BudgetItem[]>([])
  const [generating, setGenerating] = useState(false)
  const [aiBreakdown, setAiBreakdown] = useState<BudgetBreakdown[] | null>(null)
  const [aiTips, setAiTips] = useState<string[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES)
  const [form, setForm] = useState({ category: DEFAULT_CATEGORIES[0], label: '', estimated: 0, actual: 0, paid: false })

  const load = useCallback(async () => {
    if (!id) return router.push('/')
    const [w, i] = await Promise.all([getEvent(id), getBudgetItems(id)])
    if (!w) return router.push('/')
    setEvent(w)
    setItems(i)
    // Set categories based on event type
    if (w.details?.event_type) {
      const catMap: Record<string, string[]> = {
        wedding: ['Venue', 'Catering', 'Photo/Video', 'Florals', 'Styling & HMUA', 'Entertainment', 'Cake', 'Invitations', 'Transportation', 'Attire', 'Rings', 'Honeymoon', 'Miscellaneous'],
        birthday: ['Venue', 'Catering', 'Cake', 'Decorations', 'Entertainment', 'Photography', 'Invitations', 'Attire', 'Miscellaneous'],
        debut: ['Venue', 'Catering', 'Gown/Styling', 'Photography/Video', 'Cotillion', 'Cake', 'Decorations', 'Flowers', 'Invitations', 'Entertainment', 'Miscellaneous'],
        christening: ['Venue', 'Catering', 'Church', 'Gown/Outfit', 'Photography', 'Cake', 'Decorations', 'Giveaways', 'Miscellaneous'],
        corporate: ['Venue', 'Catering', 'AV/Tech', 'Decorations', 'Entertainment', 'Marketing/Print', 'Transportation', 'Accommodation', 'Miscellaneous'],
        reunion: ['Venue', 'Food', 'Activities', 'Decorations', 'Photography', 'Invitations/Comms', 'Miscellaneous'],
      }
      const eventCats = catMap[w.details.event_type] ?? DEFAULT_CATEGORIES
      setCategories(eventCats)
      setForm((f) => ({ ...f, category: eventCats[0] }))
    }
  }, [id, router])

  useEffect(() => { load() }, [load])

  const totalBudget = event?.details?.budget ?? 0
  const totalEstimated = items.reduce((s, i) => s + i.estimated, 0)
  const totalActual = items.reduce((s, i) => s + i.actual, 0)
  const totalPaid = items.filter((i) => i.paid).reduce((s, i) => s + i.actual, 0)
  const remaining = totalBudget - totalEstimated

  const generateAI = async () => {
    if (!event) return
    setGenerating(true)
    try {
      const res = await fetch('/api/generate-budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event.details),
      })
      const data = await res.json()
      if (data.breakdown) {
        setAiBreakdown(data.breakdown)
        setAiTips(data.tips ?? [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  const applyAI = async () => {
    if (!aiBreakdown || !id) return
    for (const b of aiBreakdown) {
      await upsertBudgetItem({
        event_id: id,
        category: b.category,
        label: b.category,
        estimated: b.estimated,
        actual: 0,
        paid: false,
      })
    }
    setAiBreakdown(null)
    await load()
  }

  const saveItem = async () => {
    if (!id || !form.label) return
    if (editingId) {
      await updateBudgetItem(editingId, form)
      setItems((prev) => prev.map((i) => i.id === editingId ? { ...i, ...form } : i))
    } else {
      const newItem = await upsertBudgetItem({ event_id: id, ...form })
      if (newItem) setItems((prev) => [...prev, newItem])
    }
    setForm({ category: categories[0], label: '', estimated: 0, actual: 0, paid: false })
    setShowAdd(false)
    setEditingId(null)
  }

  const removeItem = async (itemId: string) => {
    await deleteBudgetItem(itemId)
    setItems((prev) => prev.filter((i) => i.id !== itemId))
  }

  const togglePaid = async (item: BudgetItem) => {
    await updateBudgetItem(item.id, { paid: !item.paid })
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, paid: !i.paid } : i))
  }

  const fmt = (n: number) => `₱${n.toLocaleString()}`

  // Use dynamic categories for grouping
  const grouped = categories.reduce<Record<string, BudgetItem[]>>((acc, cat) => {
    const catItems = items.filter((i) => i.category === cat)
    if (catItems.length) acc[cat] = catItems
    return acc
  }, {})

  // Also add any items with categories not in the list
  items.forEach((item) => {
    if (!grouped[item.category]) {
      grouped[item.category] = [item]
    } else if (!grouped[item.category].find((i) => i.id === item.id)) {
      grouped[item.category].push(item)
    }
  })

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
            <div className="font-bold text-gray-900">Budget Tracker 💰</div>
          </div>
          <button onClick={() => { setShowAdd(true); setEditingId(null) }} className="btn-primary text-sm px-3 py-1.5">
            + Dagdag
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card p-4">
            <div className="text-xs text-gray-400 mb-1">Total Budget</div>
            <div className="text-xl font-black text-gray-900">{fmt(totalBudget)}</div>
          </div>
          <div className={`card p-4 ${remaining < 0 ? 'border-red-200 bg-red-50' : ''}`}>
            <div className="text-xs text-gray-400 mb-1">Remaining</div>
            <div className={`text-xl font-black ${remaining < 0 ? 'text-red-600' : 'text-emerald-600'}`}>{fmt(remaining)}</div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-gray-400 mb-1">Estimated</div>
            <div className="text-xl font-black text-gray-900">{fmt(totalEstimated)}</div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-gray-400 mb-1">Amount Paid</div>
            <div className="text-xl font-black text-blue-600">{fmt(totalPaid)}</div>
          </div>
        </div>

        {/* Budget bar */}
        {totalBudget > 0 && totalEstimated > 0 && (
          <div className="card p-4">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Budget usage</span>
              <span>{Math.round((totalEstimated / totalBudget) * 100)}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${totalEstimated > totalBudget ? 'bg-red-500' : 'bg-gradient-to-r from-teal-500 to-teal-400'}`}
                style={{ width: `${Math.min(100, (totalEstimated / totalBudget) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* AI Breakdown suggestion */}
        {!aiBreakdown && items.length === 0 && (
          <div className="card p-5 bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200 text-center">
            <div className="text-2xl mb-2">✨</div>
            <div className="font-bold text-gray-900 mb-1">Not sure how to split your budget?</div>
            <p className="text-sm text-gray-500 mb-3">Let AI suggest a realistic breakdown based on your event type, total, location, and guest count.</p>
            <button onClick={generateAI} disabled={generating} className="btn-primary text-sm">
              {generating ? 'Crunching numbers...' : 'Generate AI Budget Plan'}
            </button>
          </div>
        )}

        {/* AI breakdown result */}
        {aiBreakdown && (
          <div className="card p-5 bg-amber-50 border-amber-200">
            <div className="flex items-center justify-between mb-3">
              <div className="font-bold text-gray-900 flex items-center gap-2">✨ AI Budget Suggestion</div>
              <button onClick={() => setAiBreakdown(null)} className="text-gray-400 text-sm">✕</button>
            </div>
            <div className="space-y-2 mb-4">
              {aiBreakdown.map((b) => (
                <div key={b.category} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium text-gray-800">{b.category}</span>
                    <span className="text-gray-400 text-xs ml-2">({b.percentage}%)</span>
                  </div>
                  <span className="font-bold text-gray-900">{fmt(b.estimated)}</span>
                </div>
              ))}
            </div>
            {aiTips.length > 0 && (
              <div className="text-xs text-amber-700 mb-3 space-y-1">
                {aiTips.map((t, i) => <div key={i}>💡 {t}</div>)}
              </div>
            )}
            <button onClick={applyAI} className="w-full btn-primary text-sm">
              Use This Budget Plan
            </button>
          </div>
        )}

        {/* Items grouped by category */}
        {Object.entries(grouped).map(([cat, catItems]) => (
          <div key={cat}>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">{cat}</h3>
            <div className="card divide-y divide-gray-50">
              {catItems.map((item) => (
                <div key={item.id} className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 text-sm">{item.label}</div>
                      <div className="flex gap-3 mt-1 text-xs text-gray-500">
                        <span>Est: <span className="font-medium text-gray-700">{fmt(item.estimated)}</span></span>
                        {item.actual > 0 && <span>Aktwal: <span className="font-medium text-gray-700">{fmt(item.actual)}</span></span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => togglePaid(item)}
                        className={`text-xs px-2 py-1 rounded-full font-semibold transition-all ${item.paid ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}
                      >
                        {item.paid ? 'Paid ✓' : 'Unpaid'}
                      </button>
                      <button
                        onClick={() => { setForm({ category: item.category, label: item.label, estimated: item.estimated, actual: item.actual, paid: item.paid }); setEditingId(item.id); setShowAdd(true) }}
                        className="text-gray-300 hover:text-gray-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => removeItem(item.id)} className="text-gray-200 hover:text-red-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="font-bold text-gray-900 text-lg mb-4">{editingId ? 'Edit Item' : 'Add Budget Item'}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Kategorya</label>
                <select className="input-field" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                  {categories.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Label</label>
                <input type="text" className="input-field" placeholder="e.g. Fernwood Gardens" value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Estimated (₱)</label>
                  <input type="number" className="input-field" value={form.estimated || ''} onChange={(e) => setForm((f) => ({ ...f, estimated: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Aktwal (₱)</label>
                  <input type="number" className="input-field" value={form.actual || ''} onChange={(e) => setForm((f) => ({ ...f, actual: Number(e.target.value) }))} />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.paid} onChange={(e) => setForm((f) => ({ ...f, paid: e.target.checked }))} className="accent-teal-500 w-4 h-4" />
                <span className="text-sm text-gray-600">Already paid</span>
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setShowAdd(false); setEditingId(null) }} className="flex-1 btn-secondary">Cancel</button>
              <button onClick={saveItem} className="flex-1 btn-primary">Save</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default function BudgetPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-4xl animate-bounce">💰</div></main>}>
      <BudgetContent />
    </Suspense>
  )
}
