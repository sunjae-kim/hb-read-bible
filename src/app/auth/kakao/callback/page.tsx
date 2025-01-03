'use client'

import { kakaoAuth } from '@/lib/kakao'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { BounceLoader } from 'react-spinners'

export default function AuthKakaoCallbackPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const code = searchParams.get('code')
  const signInAttempted = useRef(false)

  useEffect(() => {
    if (!code || signInAttempted.current) {
      return
    }

    signInAttempted.current = true
    const next = searchParams.get('state') || ''

    kakaoAuth
      .signIn(code)
      .then(() => router.push('/' + next))
      .catch(() => router.push('/' + next))
  }, [code, router, searchParams])

  if (!code) {
    router.push('/')
    return null
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <BounceLoader color="#557C03" size={50} />
      <div className="mt-4 text-gray-800">로그인 중입니다</div>
    </div>
  )
}
