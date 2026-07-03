import Link from 'next/link'

const BENEFITS = [
  {
    emoji: '💍',
    title: 'Reach couples actively planning',
    description: 'Every couple on Kasal.ai is in the middle of planning their wedding. They\'re not browsing — they\'re buying.',
  },
  {
    emoji: '📋',
    title: 'Get listed in the checklist',
    description: 'When couples generate their AI checklist, your category shows up. You\'re already top of mind.',
  },
  {
    emoji: '📊',
    title: 'See how many couples viewed you',
    description: 'Track profile views, clicks, and inquiries. Know what\'s working.',
  },
  {
    emoji: '🆓',
    title: 'Free for the first 3 months',
    description: 'We\'re onboarding our first batch of suppliers. No credit card, no commitment.',
  },
]

const CATEGORIES = [
  'Photography', 'Videography', 'Catering', 'Venue', 'Florals & Styling',
  'Hair & Makeup', 'Wedding Gown', 'Suits & Barong', 'Cake', 'Entertainment',
  'Invitations', 'Lights & Sounds', 'Event Coordinator', 'Transportation',
]

const TESTIMONIALS = [
  {
    text: '"I got 4 inquiries in the first week. Two of them booked. The platform just works."',
    name: 'Kuya Jun',
    business: 'Jun Santos Photography',
    city: 'Cebu City',
  },
  {
    text: '"Finally a Filipino wedding platform that actually sends real leads, not just ghost inquiries."',
    name: 'Ate Claire',
    business: 'Bloom & Petal Florals',
    city: 'Metro Manila',
  },
]

export default function ForVendorsPage() {
  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-4 left-4 right-4 z-50">
        <div className="max-w-5xl mx-auto bg-white/90 backdrop-blur-xl border border-rose-100 rounded-2xl px-5 py-3 flex items-center justify-between shadow-sm">
          <Link href="/" className="font-serif font-bold text-xl text-rose-600">Kasal.ai 💍</Link>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">For Couples</Link>
            <Link href="/for-vendors/register" className="btn-primary text-sm px-4 py-2">
              List Your Business
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 bg-gradient-wedding overflow-hidden">
        <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-rose-200/20 rounded-full blur-3xl -z-10" />
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-rose-200 text-rose-600 text-sm font-semibold px-4 py-2 rounded-full mb-6 shadow-sm">
            <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse-slow" />
            Now accepting new suppliers
          </div>
          <h1 className="font-serif text-5xl sm:text-6xl text-gray-900 leading-[1.1] tracking-tight mb-6">
            Get discovered by{' '}
            <span className="text-gradient-rose">couples who are ready to book.</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Kasal.ai connects Filipino wedding suppliers with couples actively planning their big day.
            List your business for free and start getting real inquiries.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/for-vendors/register" className="btn-primary text-lg px-8 py-4">
              🎉 List Your Business — Free
            </Link>
            <p className="text-sm text-gray-400">Free for 3 months · No credit card needed</p>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-10 px-4 bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { n: '500+', l: 'Couples planning' },
            { n: '8', l: 'Cities covered' },
            { n: '₱0', l: 'To get started' },
          ].map((s) => (
            <div key={s.l}>
              <div className="text-3xl font-black text-rose-600">{s.n}</div>
              <div className="text-sm text-gray-500 mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl sm:text-4xl text-gray-900 mb-3">Why list on Kasal.ai?</h2>
            <p className="text-gray-500">Built for Filipino suppliers. Designed to get you booked.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {BENEFITS.map((b) => (
              <div key={b.title} className="card p-6">
                <div className="text-3xl mb-3">{b.emoji}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{b.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 bg-gradient-wedding">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-3xl text-gray-900 mb-3">Who can list?</h2>
          <p className="text-gray-500 mb-8">Any wedding-related business in the Philippines.</p>
          <div className="flex flex-wrap justify-center gap-2">
            {CATEGORIES.map((c) => (
              <span key={c} className="bg-white border border-rose-100 text-gray-700 text-sm font-medium px-4 py-2 rounded-full shadow-sm">
                {c}
              </span>
            ))}
            <span className="bg-rose-50 border border-rose-200 text-rose-600 text-sm font-semibold px-4 py-2 rounded-full">
              + more
            </span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl text-gray-900 mb-3">How it works</h2>
          </div>
          <div className="space-y-6">
            {[
              { step: '1', title: 'Fill out the form', desc: 'Business name, category, location, pricing, contact — takes about 5 minutes.' },
              { step: '2', title: 'We review and approve', desc: 'Our team reviews every listing within 24 hours to keep quality high.' },
              { step: '3', title: 'You go live', desc: 'Your profile appears in the directory and couples can find and contact you directly.' },
              { step: '4', title: 'Get inquiries', desc: 'Couples click your profile, see your work, and message you. Real leads, real bookings.' },
            ].map((s) => (
              <div key={s.step} className="flex gap-5 items-start">
                <div className="w-10 h-10 rounded-full bg-rose-500 text-white font-black flex items-center justify-center flex-shrink-0 text-lg">
                  {s.step}
                </div>
                <div>
                  <div className="font-bold text-gray-900 mb-1">{s.title}</div>
                  <div className="text-gray-500 text-sm leading-relaxed">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-serif text-2xl text-gray-900">Suppliers already getting bookings</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="card p-5">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed italic mb-3">{t.text}</p>
                <div className="font-bold text-gray-900 text-sm">{t.name}</div>
                <div className="text-gray-400 text-xs">{t.business} · {t.city}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-hero text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-4xl sm:text-5xl mb-4">Ready to get more bookings?</h2>
          <p className="text-rose-200 text-xl mb-10">Free for the first 3 months. No risk. Takes 5 minutes.</p>
          <Link href="/for-vendors/register" className="inline-flex items-center gap-2 bg-white text-rose-600 font-black px-10 py-4 rounded-xl text-lg hover:bg-rose-50 transition-colors shadow-lg">
            🎉 List Your Business Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900 text-center">
        <div className="font-serif font-bold text-white text-xl mb-2">Kasal.ai 💍</div>
        <p className="text-gray-500 text-sm">For Filipino couples who have enough to worry about.</p>
        <div className="flex justify-center gap-4 mt-3 text-xs text-gray-600">
          <Link href="/" className="hover:text-gray-400">For Couples</Link>
          <span>·</span>
          <Link href="/directory" className="hover:text-gray-400">Vendor Directory</Link>
          <span>·</span>
          <Link href="/for-vendors/register" className="hover:text-gray-400">List Your Business</Link>
        </div>
      </footer>
    </main>
  )
}
