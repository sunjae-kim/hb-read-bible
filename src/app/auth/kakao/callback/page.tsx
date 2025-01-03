'use client'

import { kakaoAuth } from '@/lib/kakao'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AuthKakaoCallbackPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [error, setError] = useState<Error | null>(null)
  const code = searchParams.get('code')

  useEffect(() => {
    if (!code) {
      setError(new Error('인증 코드가 없습니다.'))
      router.push('/')
      return
    }

    kakaoAuth
      .signIn(code)
      .then(() => router.push('/'))
      .catch((err) => {
        setError(err instanceof Error ? err : new Error('로그인 처리 중 오류가 발생했습니다.'))
        router.push('/')
      })
  }, [code, router])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">오류가 발생했습니다: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <p>로그인 처리 중입니다...</p>
      </div>
    </div>
  )
}
