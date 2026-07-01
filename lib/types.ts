export type WeddingType = 'church' | 'civil' | 'beach' | 'garden' | 'destination'
export type WeddingTheme = 'classic' | 'bohemian' | 'modern' | 'rustic' | 'fairytale' | 'garden' | 'beach' | 'vintage' | 'glamorous'

export interface WeddingDetails {
  partner1_name: string
  partner2_name: string
  wedding_date: string   // ISO date string
  venue_name?: string
  wedding_type: WeddingType
  theme: WeddingTheme
  guest_count: number
  budget: number         // total budget in PHP
  city: string
}

export type ChecklistPhase =
  | '12+ months'
  | '9-12 months'
  | '6-9 months'
  | '3-6 months'
  | '1-3 months'
  | '2-4 weeks'
  | '1 week'
  | 'day of'

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
  wedding_id: string
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
  wedding_id: string
  category: BudgetCategory
  label: string
  estimated: number
  actual: number
  paid: boolean
  created_at: string
}

export interface Wedding {
  id: string
  user_id?: string | null
  details: WeddingDetails
  checklist: ChecklistItem[]
  created_at: string
  updated_at: string
}
