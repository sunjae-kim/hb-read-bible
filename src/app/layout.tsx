import { SplashLayout } from '@/components/auth/SplashLayout'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { Metadata, Viewport } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: '한빛공동체',
  description: '한빛교회 공동체가 함께하는 성경읽기',
  openGraph: {
    title: '한빛공동체',
    description: '한빛교회 공동체가 함께하는 성경읽기',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 600,
        alt: '한빛교회 공동체 성경읽기',
      },
    ],
    siteName: '한빛교회 공동체 성경읽기',
  },
  twitter: {
    card: 'summary_large_image',
    title: '한빛공동체',
    description: '한빛교회 공동체가 함께하는 성경읽기',
    images: ['/images/og-image.png'],
  },
  other: {
    'apple-mobile-web-app-title': '한빛공동체',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'mobile-web-app-capable': 'yes',
    'format-detection': 'telephone=no',
  },
  icons: {
    apple: [
      { url: '/icons/icon-192.png', sizes: '192x192' },
      { url: '/icons/icon-512.png', sizes: '512x512' },
    ],
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#ffffff',
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="preload"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css"
          as="style"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="apple-mobile-web-app-title" content="한빛공동체" />
      </head>
      <body>
        <AuthProvider>
          <SplashLayout>{children}</SplashLayout>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
