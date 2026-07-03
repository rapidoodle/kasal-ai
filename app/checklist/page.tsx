'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getEvent, updateChecklist } from '@/lib/supabase'
import type { ChecklistItem, ChecklistPhase, Event } from '@/lib/types'

const PHASES: ChecklistPhase[] = [
  '12+ months', '9-12 months', '6-9 months', '3-6 months',
  '1-3 months', '2-4 weeks', '1 week', 'day of',
]

function ChecklistContent() {
  const params = useSearchParams()
  const router = useRouter()
  const id = params.get('id')

  const [event, setEvent] = useState<Event | null>(null)
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newTask, setNewTask] = useState('')
  const [addingPhase, setAddingPhase] = useState<ChecklistPhase | null>(null)
  const [activePhase, setActivePhase] = useState<ChecklistPhase | null>(null)

  const load = useCallback(async () => {
    if (!id) return router.push('/')
    const data = await getEvent(id)
    if (!data) return router.push('/')
    setEvent(data)
    setChecklist(data.checklist ?? [])
  }, [id, router])

  useEffect(() => { load() }, [load])

  const generate = async () => {
    if (!event) return
    setGenerating(true)
    try {
      const res = await fetch('/api/generate-checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event.details),
      })
      const data = await res.json()
      if (data.checklist) {
        setChecklist(data.checklist)
        await updateChecklist(id!, data.checklist)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  const toggleItem = async (itemId: string) => {
    const updated = checklist.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    )
    setChecklist(updated)
    setSaving(true)
    await updateChecklist(id!, updated)
    setSaving(false)
  }

  const addCustom = async (phase: ChecklistPhase) => {
    if (!newTask.trim()) return
    const item: ChecklistItem = {
      id: `custom-${Date.now()}`,
      phase,
      task: newTask.trim(),
      category: 'Custom',
      completed: false,
      is_custom: true,
    }
    const updated = [...checklist, item]
    setChecklist(updated)
    setNewTask('')
    setAddingPhase(null)
    await updateChecklist(id!, updated)
  }

  const deleteItem = async (itemId: string) => {
    const updated = checklist.filter((i) => i.id !== itemId)
    setChecklist(updated)
    await updateChecklist(id!, updated)
  }

  const completedCount = checklist.filter((i) => i.completed).length
  const totalCount = checklist.length
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const grouped = PHASES.reduce<Record<string, ChecklistItem[]>>((acc, phase) => {
    const items = checklist.filter((i) => i.phase === phase)
    if (items.length) acc[phase] = items
    return acc
  }, {})

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href={`/dashboard?id=${id}`} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1">
            <div className="font-bold text-gray-900">Event Checklist ✅</div>
            {totalCount > 0 && (
              <div className="text-xs text-gray-400">{completedCount}/{totalCount} done · {progress}%</div>
            )}
          </div>
          {saving && <div className="text-xs text-teal-400">Saving...</div>}
        </div>
        {totalCount > 0 && (
          <div className="h-1 bg-gray-100">
            <div className="h-full bg-gradient-to-r from-teal-500 to-teal-400 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        )}
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Empty state */}
        {totalCount === 0 && !generating && (
          <div className="card p-8 text-center bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
            <div className="text-5xl mb-4">✨</div>
            <div className="font-serif text-2xl text-gray-900 mb-2">Generate Your Checklist</div>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Your AI-built checklist — personalized to your event type, date, budget, and setup. Filipino celebration essentials included.
            </p>
            <button onClick={generate} className="btn-primary">
              Generate AI Checklist
            </button>
          </div>
        )}

        {/* Generating state */}
        {generating && (
          <div className="card p-10 text-center">
            <div className="text-4xl mb-3 animate-bounce">✨</div>
            <div className="font-serif text-xl text-gray-900 mb-2">Building your checklist...</div>
            <p className="text-gray-500 text-sm">Hang tight. We&apos;re figuring out everything you need to do.</p>
            <div className="flex justify-center gap-1 mt-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* Phase filter pills */}
        {totalCount > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
            <button
              onClick={() => setActivePhase(null)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${activePhase === null ? 'bg-teal-500 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}
            >
              All
            </button>
            {PHASES.filter((p) => grouped[p]).map((p) => (
              <button
                key={p}
                onClick={() => setActivePhase(p === activePhase ? null : p)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${activePhase === p ? 'bg-teal-500 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Grouped checklist */}
        {Object.entries(grouped)
          .filter(([phase]) => !activePhase || phase === activePhase)
          .map(([phase, items]) => (
            <div key={phase} className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">{phase}</h3>
                <span className="text-xs text-teal-400 font-semibold">
                  {items.filter((i) => i.completed).length}/{items.length}
                </span>
              </div>
              <div className="card divide-y divide-gray-50">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-4 group">
                    <button
                      onClick={() => toggleItem(item.id)}
                      className={`w-5 h-5 mt-0.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${item.completed ? 'bg-teal-500 border-teal-500' : 'border-gray-200 hover:border-teal-300'}`}
                    >
                      {item.completed && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm ${item.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                        {item.task}
                      </div>
                      {item.category && (
                        <div className="text-[10px] text-gray-400 mt-0.5">{item.category}</div>
                      )}
                    </div>
                    {item.is_custom && (
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all ml-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}

                {/* Add custom task for this phase */}
                {addingPhase === phase ? (
                  <div className="p-3 flex gap-2">
                    <input
                      autoFocus
                      type="text"
                      placeholder="Add a task..."
                      className="flex-1 text-sm px-3 py-2 border border-teal-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-100"
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addCustom(phase as ChecklistPhase)}
                    />
                    <button onClick={() => addCustom(phase as ChecklistPhase)} className="btn-primary text-sm px-3 py-2">+</button>
                    <button onClick={() => setAddingPhase(null)} className="text-gray-400 text-sm px-2">✕</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingPhase(phase as ChecklistPhase)}
                    className="w-full text-left text-xs text-gray-400 hover:text-teal-500 px-4 py-2.5 transition-colors"
                  >
                    + Add a custom task
                  </button>
                )}
              </div>
            </div>
          ))}

        {/* Regenerate button */}
        {totalCount > 0 && (
          <div className="text-center pt-2 pb-8">
            <button onClick={generate} disabled={generating} className="text-sm text-gray-400 hover:text-teal-500 transition-colors disabled:opacity-50">
              ✨ Regenerate checklist
            </button>
          </div>
        )}
      </div>
    </main>
  )
}

export default function ChecklistPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-4xl animate-bounce">✅</div></main>}>
      <ChecklistContent />
    </Suspense>
  )
}
