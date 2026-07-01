import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import type { WeddingDetails, ChecklistItem, ChecklistPhase } from '@/lib/types'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const details: WeddingDetails = await req.json()
    const { partner1_name, partner2_name, wedding_date, wedding_type, theme, guest_count, budget, city } = details

    const weddingDateObj = new Date(wedding_date)
    const today = new Date()
    const monthsAway = Math.round((weddingDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30))
    const formattedDate = weddingDateObj.toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })

    const prompt = `You are an expert Filipino wedding planner AI. Generate a comprehensive, personalized wedding checklist for a Filipino couple.

WEDDING DETAILS:
- Couple: ${partner1_name} & ${partner2_name}
- Wedding Date: ${formattedDate} (${monthsAway} months from now)
- Location: ${city}, Philippines
- Type: ${wedding_type} wedding
- Theme: ${theme}
- Guest Count: ${guest_count} guests
- Total Budget: ₱${budget.toLocaleString()}

Generate a detailed checklist of 30-40 tasks. Each task must be specific, actionable, and relevant to a Filipino wedding in ${city}.

Include Pinoy-specific tasks like:
- Booking the church/civil registrar
- Securing Principal Sponsors (Ninong/Ninang)
- Coordinating with the Parish for Pre-Cana seminar
- Planning the Despedida de Soltera / Bachelor Party
- Arranging for Arrhae (13 coins), Veil, Cord
- Guest list with complete addresses for invitations
- Coordinating with the LGU if needed
- Planning for Lechon, reception program, etc.

Return a JSON object with this exact structure:
{
  "checklist": [
    {
      "id": "unique-id-1",
      "phase": "12+ months",
      "task": "Specific actionable task description",
      "category": "Category name (e.g., Venue, Church, Catering, etc.)",
      "completed": false,
      "is_custom": false
    }
  ]
}

Phase options (assign based on how far in advance this task should be done):
- "12+ months" — for tasks needing very early planning
- "9-12 months"
- "6-9 months"
- "3-6 months"
- "1-3 months"
- "2-4 weeks"
- "1 week"
- "day of"

Since the wedding is ${monthsAway} months away, prioritize tasks accordingly.
Budget of ₱${budget.toLocaleString()} — include budget-appropriate suggestions.
Only return valid JSON, nothing else.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert Filipino wedding planner. Generate detailed, practical, culturally-appropriate wedding checklists. Always return valid JSON only.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0]?.message?.content
    if (!raw) throw new Error('No content from OpenAI')

    const parsed = JSON.parse(raw)
    const checklist: ChecklistItem[] = parsed.checklist || []

    return NextResponse.json({ success: true, checklist })
  } catch (err) {
    console.error('Generate checklist error:', err)
    return NextResponse.json({ error: 'Failed to generate checklist. Please try again.' }, { status: 500 })
  }
}
