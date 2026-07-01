import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import type { WeddingDetails } from '@/lib/types'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const details: WeddingDetails = await req.json()
    const { budget, guest_count, wedding_type, theme, city } = details

    const prompt = `You are an expert Filipino wedding budget planner. Suggest a realistic budget breakdown for a Filipino wedding.

DETAILS:
- Total Budget: ₱${budget.toLocaleString()}
- Guests: ${guest_count}
- Type: ${wedding_type} wedding
- Theme: ${theme}
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

Use these categories: Venue, Catering, Photo/Video, Florals, Styling & HMUA, Entertainment, Cake, Invitations, Transportation, Attire, Rings, Honeymoon, Miscellaneous.

Make it realistic for ${city}, Philippines. Percentages must add up to 100.
Only return valid JSON, nothing else.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert Filipino wedding budget planner. Always return valid JSON only.' },
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
