import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientProviders from '@/components/common/ClientProviders'
import Header from '@/components/common/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DBGT E-Procurement Portal | Tuticorin Harbour',
  description: 'Streamline your procurement process with DBGT Private Limited. Modern e-procurement system for efficient order management, vendor quotations, and procurement workflows in Tuticorin Harbour, Tamil Nadu.',
  keywords: 'DBGT, e-procurement, procurement portal, Tuticorin Harbour, Tamil Nadu, vendor management, order management, quotations, procurement system',
  authors: [{ name: 'DBGT Private Limited' }],
  creator: 'DBGT Private Limited',
  publisher: 'DBGT Private Limited',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://dbgt-eprocurement.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'DBGT E-Procurement Portal',
    description: 'Modern e-procurement system for efficient order management and vendor quotations in Tuticorin Harbour, Tamil Nadu.',
    url: 'https://dbgt-eprocurement.com',
    siteName: 'DBGT E-Procurement Portal',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/logo.jpeg',
        width: 1200,
        height: 630,
        alt: 'DBGT Private Limited Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DBGT E-Procurement Portal',
    description: 'Modern e-procurement system for efficient order management and vendor quotations in Tuticorin Harbour, Tamil Nadu.',
    images: ['/logo.jpeg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      <head>
        <link rel="icon" href="/logo.jpeg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/logo.jpeg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1e3a8a" />
        <meta name="msapplication-TileColor" content="#1e3a8a" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className={`${inter.className} h-full`}>
        <ClientProviders>
          <div className="min-h-screen flex flex-col w-full">
            {/* Header */}
            <Header />
            {/* Main Content */}
            <main className="flex-1 w-full flex flex-col justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
              {children}
            </main>
            {/* Footer */}
            <footer className="w-full bg-blue-900 text-white py-4 px-4 flex items-center justify-center text-xs mt-0">
              <div className="text-center">
                &copy; {new Date().getFullYear()} DBGT Private Limited, Tuticorin Harbour, Tamil Nadu. All rights reserved.
              </div>
            </footer>
          </div>
        </ClientProviders>
      </body>
    </html>
  )
} 