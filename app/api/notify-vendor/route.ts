import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { business_name, category, city, contact_name, contact_email } = await req.json()

    const RESEND_API_KEY = process.env.RESEND_API_KEY
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'rperez@d1research.com'

    if (!RESEND_API_KEY) {
      // Silently skip if Resend not configured yet
      return NextResponse.json({ ok: true })
    }

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Kasal.ai <noreply@kasal.ai>',
        to: ADMIN_EMAIL,
        subject: `New vendor listing: ${business_name}`,
        html: `
          <h2>New Vendor Submission 🎉</h2>
          <table style="border-collapse:collapse;width:100%">
            <tr><td style="padding:8px;font-weight:bold">Business</td><td style="padding:8px">${business_name}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Category</td><td style="padding:8px">${category}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">City</td><td style="padding:8px">${city}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Contact</td><td style="padding:8px">${contact_name}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Email</td><td style="padding:8px">${contact_email}</td></tr>
          </table>
          <p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://kasal.ai'}/admin" style="background:#f43f5e;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold">
              Review in Supabase →
            </a>
          </p>
          <p style="color:#999;font-size:12px">To approve: go to Supabase → Table Editor → vendor_listings → set approved = true</p>
        `,
      }),
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Notify error:', err)
    return NextResponse.json({ ok: true }) // Don't fail the registration if email fails
  }
}
