export type EventType = 'wedding' | 'birthday' | 'debut' | 'christening' | 'corporate' | 'reunion'

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  wedding: 'Wedding',
  birthday: 'Birthday',
  debut: 'Debut',
  christening: 'Christening / Baptism',
  corporate: 'Corporate Event',
  reunion: 'Reunion / Party',
}

export const EVENT_TYPE_EMOJIS: Record<EventType, string> = {
  wedding: '💍',
  birthday: '🎂',
  debut: '👗',
  christening: '🙏',
  corporate: '💼',
  reunion: '🎉',
}

export interface EventDetails {
  event_name: string
  organizer_name: string
  partner_name?: string      // for weddings only
  event_date: string
  event_type: EventType
  theme?: string
  guest_count: number
  budget: number
  city: string
  venue_name?: string
}

export type ChecklistPhase =
  | '12+ months' | '9-12 months' | '6-9 months' | '3-6 months'
  | '1-3 months' | '2-4 weeks' | '1 week' | 'day of'

export interface ChecklistItem {
  id: string
  phase: ChecklistPhase
  task: string
  category: string
  completed: boolean
  is_custom: boolean
  notes?: string
}

export type VendorStatus = 'researching' | 'contacted' | 'meeting' | 'booked' | 'rejected' | 'paid' | 'cancelled'
export type VendorCategory = string

export interface Vendor {
  id: string
  event_id: string
  category: VendorCategory
  name: string
  contact_name?: string
  contact_number?: string
  price: number
  status: VendorStatus
  notes?: string
  created_at: string
}

export type BudgetCategory = string

export interface BudgetItem {
  id: string
  event_id: string
  category: BudgetCategory
  label: string
  estimated: number
  actual: number
  paid: boolean
  created_at: string
}

export interface Event {
  id: string
  user_id?: string | null
  details: EventDetails
  checklist: ChecklistItem[]
  created_at: string
  updated_at: string
}
