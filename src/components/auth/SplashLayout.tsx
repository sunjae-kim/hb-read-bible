'use client'

import { usePlanStore } from '@/stores/plan'
import Image from 'next/image'
import { PropsWithChildren, useEffect } from 'react'
import { useSplashState } from '@/hooks/useSplashState'

export const SplashLayout = ({ children }: PropsWithChildren) => {
  const { initialized, showSplash, isHiding, loadingState } = useSplashState()
  const { loadDefaultPlan } = usePlanStore()

  useEffect(() => {
    loadDefaultPlan()
  }, [loadDefaultPlan])

  if (!initialized || showSplash) {
    return (
      <div
        className={`flex min-h-screen items-center justify-center text-center transition-opacity duration-500 ${
          !isHiding ? 'animate-fade-in opacity-100' : 'opacity-0'
        }`}
      >
        <div className="px-4">
          <Image
            src="https://hanbit-bible.vercel.app/images/icons/icon-512x512.png"
            width={200}
            height={200}
            alt="한빛교회"
          />
          <h1 className="sr-only text-2xl font-bold text-gray-800">한빛교회</h1>
          <p className="text-lg text-gray-600">공동체 성경읽기</p>
          <p className="mt-2 text-sm text-gray-400">{loadingState.message}</p>
          <div className="mx-auto mt-4 h-1 w-16 animate-pulse rounded bg-gray-300" />
        </div>
      </div>
    )
  }

  return <>{children}</>
}
