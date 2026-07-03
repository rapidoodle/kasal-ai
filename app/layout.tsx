import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ganap PH — Plan Any Filipino Celebration, Powered by AI',
  description: 'Plan your perfect Filipino celebration with AI. Personalized checklists, budget tracker, vendor list, and countdown — para sa lahat ng okasyon.',
  openGraph: {
    title: 'Ganap PH — Plan Any Filipino Celebration, Powered by AI',
    description: 'Plan your perfect Filipino celebration with AI. Personalized checklists, budget tracker, vendor list, and countdown — para sa lahat ng okasyon.',
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
