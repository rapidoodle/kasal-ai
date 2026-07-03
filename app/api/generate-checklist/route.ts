import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import type { EventDetails, ChecklistItem } from '@/lib/types'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

function getEventPrompt(details: EventDetails, monthsAway: number, formattedDate: string): string {
  const { event_name, organizer_name, partner_name, event_type, theme, guest_count, budget, city } = details

  const baseHeader = `You are an expert Filipino event planner AI. Generate a comprehensive, personalized event planning checklist.

EVENT DETAILS:
- Event: ${event_name}
- Organizer: ${organizer_name}${partner_name ? `\n- Partner: ${partner_name}` : ''}
- Event Date: ${formattedDate} (${monthsAway} months from now)
- Event Type: ${event_type}
- Location: ${city}, Philippines${theme ? `\n- Theme: ${theme}` : ''}
- Guest Count: ${guest_count} guests
- Total Budget: ₱${budget.toLocaleString()}`

  const phaseInstructions: Record<string, string> = {
    wedding: `Phase options (assign based on how far in advance this task should be done):
- "12+ months" — for tasks needing very early planning
- "9-12 months"
- "6-9 months"
- "3-6 months"
- "1-3 months"
- "2-4 weeks"
- "1 week"
- "day of"`,
    debut: `Phase options:
- "6-9 months"
- "3-6 months"
- "1-3 months"
- "2-4 weeks"
- "1 week"
- "day of"`,
    corporate: `Phase options:
- "6-9 months"
- "3-6 months"
- "1-3 months"
- "2-4 weeks"
- "1 week"
- "day of"`,
    birthday: `Phase options:
- "3-6 months"
- "1-3 months"
- "2-4 weeks"
- "1 week"
- "day of"`,
    christening: `Phase options:
- "3-6 months"
- "1-3 months"
- "2-4 weeks"
- "1 week"
- "day of"`,
    reunion: `Phase options:
- "3-6 months"
- "1-3 months"
- "2-4 weeks"
- "1 week"
- "day of"`,
  }

  const specificTasks: Record<string, string> = {
    wedding: `Include Pinoy-specific tasks like:
- Booking the church/civil registrar
- Securing Principal Sponsors (Ninong/Ninang)
- Coordinating with the Parish for Pre-Cana seminar
- Planning the Despedida de Soltera / Bachelor Party
- Arranging for Arrhae (13 coins), Veil, Cord
- Guest list with complete addresses for invitations
- Coordinating with the LGU if needed
- Planning for Lechon, reception program, etc.`,
    birthday: `Include Filipino-specific tasks like:
- Venue booking and layout planning
- Catering and food selection (Filipino staples, lechon if applicable)
- Cake design and order
- Entertainment booking (host/emcee, band, or DJ)
- Photo and video coverage
- Invitation design and distribution
- Decorations and styling
- Party favors/giveaways
- Program flow planning
- Day-of coordination`,
    debut: `Include Filipino debut-specific tasks like:
- 18 Roses — identifying and confirming 18 men
- 18 Candles — identifying and confirming 18 women who will give speeches
- 18 Treasures — gifts coordination
- Cotillion de Honor choreography and rehearsals
- Gown design/fitting and accessories
- Venue booking (ballroom or garden)
- Photo and video coverage (pre-debut shoot)
- Hair and makeup booking
- Catering and program flow
- Invitation and souvenir planning`,
    christening: `Include Filipino christening-specific tasks like:
- Church booking and priest coordination
- Ninong and Ninang confirmation (godparents)
- Christening gown/outfit preparation
- Reception venue booking
- Catering and food planning (Filipino fare, lechon)
- Cake design and order
- Photography/video coverage
- Giveaways/souvenirs for guests
- Invitation design and distribution
- Decorations and styling`,
    corporate: `Include corporate event-specific tasks like:
- Venue scouting and booking
- Audio-visual equipment and tech setup
- Catering and dietary requirements
- Program rundown and script preparation
- Emcee/host booking
- Entertainment and activities planning
- Marketing materials (banners, programs, presentations)
- Guest/attendee registration
- Transportation and accommodation coordination
- AV runthrough and dry run
- Day-of coordination and logistics`,
    reunion: `Include reunion/party-specific tasks like:
- Venue booking (restaurant, resort, or private space)
- Food and catering coordination
- Activity planning (games, program)
- Photo and video coverage
- Invitation and RSVP management
- Decorations and styling
- Entertainment (band, DJ, or playlist)
- Coordination with out-of-town attendees
- Souvenir/giveaway planning
- Budget collection from members (if shared cost)`,
  }

  return `${baseHeader}

Generate a detailed checklist of 25-35 tasks. Each task must be specific, actionable, and relevant to a Filipino ${event_type} in ${city}.

${specificTasks[event_type] || specificTasks.birthday}

Return a JSON object with this exact structure:
{
  "checklist": [
    {
      "id": "unique-id-1",
      "phase": "3-6 months",
      "task": "Specific actionable task description",
      "category": "Category name (e.g., Venue, Catering, etc.)",
      "completed": false,
      "is_custom": false
    }
  ]
}

${phaseInstructions[event_type] || phaseInstructions.birthday}

Since the event is ${monthsAway} months away, prioritize tasks accordingly.
Budget of ₱${budget.toLocaleString()} — include budget-appropriate suggestions.
Only return valid JSON, nothing else.`
}

export async function POST(req: NextRequest) {
  try {
    const details: EventDetails = await req.json()
    const { event_date, event_type } = details

    const eventDateObj = new Date(event_date)
    const today = new Date()
    const monthsAway = Math.round((eventDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30))
    const formattedDate = eventDateObj.toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })

    const prompt = getEventPrompt(details, monthsAway, formattedDate)

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert Filipino event planner. Generate detailed, practical, culturally-appropriate event planning checklists for ${event_type} events. Always return valid JSON only.`,
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
