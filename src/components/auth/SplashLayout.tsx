'use client'

import { useAuthStore } from '@/stores/auth'
import { PropsWithChildren, useEffect, useState } from 'react'

export const SplashLayout = ({ children }: PropsWithChildren) => {
  const initialized = useAuthStore((state) => state.initialized)
  const [showSplash, setShowSplash] = useState(true)
  const [isHiding, setIsHiding] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsHiding(true) // 먼저 페이드 아웃 시작

      // 페이드 아웃 애니메이션이 완료된 후 스플래시 제거
      const hideTimer = setTimeout(() => {
        setShowSplash(false)
      }, 500) // 페이드 아웃 지속 시간과 동일하게 설정

      return () => clearTimeout(hideTimer)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  if (!initialized || showSplash) {
    return (
      <div
        className={`flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-gray-100 text-center transition-opacity duration-500 ${!isHiding ? 'animate-fade-in opacity-100' : 'opacity-0'}`}
      >
        <div className="space-y-3 px-4">
          <h1 className="text-2xl font-bold text-gray-800">한빛교회</h1>
          <p className="text-lg text-gray-600">공동체 성경읽기</p>
          <div className="mx-auto mt-4 h-1 w-16 animate-pulse rounded bg-gray-300" />
        </div>
      </div>
    )
  }

  return <>{children}</>
}
