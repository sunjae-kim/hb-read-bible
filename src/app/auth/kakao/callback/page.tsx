'use client'

import { KAKAO_CLIENT_SECRET, KAKAO_REDIRECT_URI, KAKAO_REST_API_KEY } from '@/constants'
import { auth, kakaoProvider } from '@/lib/firebase'
import axios from 'axios'
import {
  browserSessionPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithCredential,
  type User,
} from 'firebase/auth'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

const AuthKakaoCallbackPageInner = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const code = searchParams.get('code')
  const [error, setError] = useState<Error | null>(null)

  const fetchToken = useCallback(async () => {
    try {
      const response = await axios.post<{
        id_token: string
      }>(
        'https://kauth.kakao.com/oauth/token',
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: code || '',
          client_id: KAKAO_REST_API_KEY,
          redirect_uri: KAKAO_REDIRECT_URI,
          client_secret: KAKAO_CLIENT_SECRET,
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      )

      const credential = kakaoProvider.credential({
        idToken: response.data.id_token,
      })

      await setPersistence(auth, browserSessionPersistence)
      await signInWithCredential(auth, credential)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('로그인 처리 중 오류가 발생했습니다.'))
      // 에러 발생 시 에러 페이지나 로그인 페이지로 리다이렉트
      router.push('/')
    }
  }, [code, router])

  useEffect(() => {
    if (!code) {
      setError(new Error('인증 코드가 없습니다.'))
      router.push('/')
      return
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (user: User | null) => {
        if (user) {
          router.push('/')
        } else {
          fetchToken()
        }
      },
      (error) => {
        setError(error)
        router.push('/')
      },
    )

    return () => unsubscribe()
  }, [code, fetchToken, router])

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

export default AuthKakaoCallbackPageInner
