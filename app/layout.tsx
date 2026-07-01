import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Kasal.ai — Your AI-Powered Filipino Wedding Planner',
  description: 'Plan your perfect Filipino wedding with AI. Personalized checklists, budget tracker, vendor list, and countdown — lahat para sa inyong espesyal na araw.',
  openGraph: {
    title: 'Kasal.ai — Your AI-Powered Filipino Wedding Planner',
    description: 'Plan your perfect Filipino wedding with AI.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fil">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
