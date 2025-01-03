import { SplashLayout } from '@/components/auth/SplashLayout'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="preload"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css"
          as="style"
        />
        <title>한빛공동체</title>
        <meta name="description" content="한빛공동체" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <meta property="og:title" content="한빛공동체" />
        <meta property="og:description" content="한빛교회 공동체 성경읽기표" />
      </head>
      <body>
        <SplashLayout>{children}</SplashLayout>
        <Toaster />
      </body>
    </html>
  )
}
