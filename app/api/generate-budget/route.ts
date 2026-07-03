import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import type { EventDetails } from '@/lib/types'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const CATEGORY_MAP: Record<string, string[]> = {
  wedding: ['Venue', 'Catering', 'Photo/Video', 'Florals', 'Styling & HMUA', 'Entertainment', 'Cake', 'Invitations', 'Transportation', 'Attire', 'Rings', 'Honeymoon', 'Miscellaneous'],
  birthday: ['Venue', 'Catering', 'Cake', 'Decorations', 'Entertainment', 'Photography', 'Invitations', 'Attire', 'Miscellaneous'],
  debut: ['Venue', 'Catering', 'Gown/Styling', 'Photography/Video', 'Cotillion', 'Cake', 'Decorations', 'Flowers', 'Invitations', 'Entertainment', 'Miscellaneous'],
  christening: ['Venue', 'Catering', 'Church', 'Gown/Outfit', 'Photography', 'Cake', 'Decorations', 'Giveaways', 'Miscellaneous'],
  corporate: ['Venue', 'Catering', 'AV/Tech', 'Decorations', 'Entertainment', 'Marketing/Print', 'Transportation', 'Accommodation', 'Miscellaneous'],
  reunion: ['Venue', 'Food', 'Activities', 'Decorations', 'Photography', 'Invitations/Comms', 'Miscellaneous'],
}

export async function POST(req: NextRequest) {
  try {
    const details: EventDetails = await req.json()
    const { budget, guest_count, event_type, theme, city, event_name } = details

    const categories = CATEGORY_MAP[event_type] || CATEGORY_MAP.birthday

    const prompt = `You are an expert Filipino event budget planner. Suggest a realistic budget breakdown for a Filipino ${event_type} event.

DETAILS:
- Event: ${event_name}
- Event Type: ${event_type}
- Total Budget: ₱${budget.toLocaleString()}
- Guests: ${guest_count}${theme ? `\n- Theme: ${theme}` : ''}
- Location: ${city}, Philippines

Return a JSON object with budget allocations:
{
  "breakdown": [
    {
      "category": "Venue",
      "percentage": 25,
      "estimated": 125000,
      "notes": "Brief tip or advice for this category"
    }
  ],
  "tips": ["General budget tip 1", "General budget tip 2", "General budget tip 3"]
}

Use ONLY these categories: ${categories.join(', ')}.

Make it realistic for a ${event_type} in ${city}, Philippines. Percentages must add up to 100.
Only return valid JSON, nothing else.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: `You are an expert Filipino event budget planner for ${event_type} events. Always return valid JSON only.` },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0]?.message?.content
    if (!raw) throw new Error('No content')

    return NextResponse.json({ success: true, ...JSON.parse(raw) })
  } catch (err) {
    console.error('Generate budget error:', err)
    return NextResponse.json({ error: 'Failed to generate budget breakdown.' }, { status: 500 })
  }
}
