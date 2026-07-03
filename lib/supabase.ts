import { createClient } from '@supabase/supabase-js'
import type { Event, Vendor, BudgetItem, ChecklistItem } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function saveEvent(event: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event | null> {
  const { data: { session } } = await supabase.auth.getSession()
  const payload = { ...event, user_id: session?.user?.id ?? null }
  const { data, error } = await supabase.from('events').insert(payload).select().single()
  if (error) { console.error(error); return null }
  return data
}

export async function getEventByUser(userId: string): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events').select('*').eq('user_id', userId)
    .order('created_at', { ascending: false }).limit(1).single()
  if (error) { return null }
  return data
}

export async function getEvent(id: string): Promise<Event | null> {
  const { data, error } = await supabase.from('events').select('*').eq('id', id).single()
  if (error) { console.error(error); return null }
  return data
}

export async function updateChecklist(eventId: string, checklist: ChecklistItem[]): Promise<boolean> {
  const { error } = await supabase.from('events').update({ checklist, updated_at: new Date().toISOString() }).eq('id', eventId)
  if (error) { console.error(error); return false }
  return true
}

export async function getVendors(eventId: string): Promise<Vendor[]> {
  const { data, error } = await supabase.from('vendors').select('*').eq('event_id', eventId).order('category')
  if (error) { console.error(error); return [] }
  return data
}

export async function upsertVendor(vendor: Omit<Vendor, 'id' | 'created_at'>): Promise<Vendor | null> {
  const { data, error } = await supabase.from('vendors').insert(vendor).select().single()
  if (error) { console.error(error); return null }
  return data
}

export async function updateVendor(id: string, updates: Partial<Vendor>): Promise<boolean> {
  const { error } = await supabase.from('vendors').update(updates).eq('id', id)
  if (error) { console.error(error); return false }
  return true
}

export async function deleteVendor(id: string): Promise<boolean> {
  const { error } = await supabase.from('vendors').delete().eq('id', id)
  if (error) { console.error(error); return false }
  return true
}

export async function getBudgetItems(eventId: string): Promise<BudgetItem[]> {
  const { data, error } = await supabase.from('budget_items').select('*').eq('event_id', eventId).order('category')
  if (error) { console.error(error); return [] }
  return data
}

export async function upsertBudgetItem(item: Omit<BudgetItem, 'id' | 'created_at'>): Promise<BudgetItem | null> {
  const { data, error } = await supabase.from('budget_items').insert(item).select().single()
  if (error) { console.error(error); return null }
  return data
}

export async function updateBudgetItem(id: string, updates: Partial<BudgetItem>): Promise<boolean> {
  const { error } = await supabase.from('budget_items').update(updates).eq('id', id)
  if (error) { console.error(error); return false }
  return true
}

export async function deleteBudgetItem(id: string): Promise<boolean> {
  const { error } = await supabase.from('budget_items').delete().eq('id', id)
  if (error) { console.error(error); return false }
  return true
}
