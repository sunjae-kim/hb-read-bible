'use client'

import { useBibleStore } from '@/stores/bible'
import { usePlanStore } from '@/stores/plan'
import Image from 'next/image'
import { PropsWithChildren, useEffect, useState } from 'react'

export const SplashLayout = ({ children }: PropsWithChildren) => {
  const { initialized: bibleInitialized, initialize: bibleInitialize, loadingState } = useBibleStore()
  const { loadDefaultPlan } = usePlanStore()
  const [showSplash, setShowSplash] = useState(false)
  const [isHiding, setIsHiding] = useState(false)

  useEffect(() => {
    bibleInitialize()
    loadDefaultPlan()
  }, [bibleInitialize, loadDefaultPlan])

  useEffect(() => {
    if (loadingState.stage === 'downloading' || loadingState.stage === 'initializing') {
      setShowSplash(true)
    }
  }, [loadingState.stage])

  useEffect(() => {
    if (bibleInitialized && showSplash) {
      const timer = setTimeout(() => {
        setIsHiding(true)
        const hideTimer = setTimeout(() => {
          setShowSplash(false)
        }, 500)
        return () => clearTimeout(hideTimer)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [bibleInitialized, showSplash])

  if (!bibleInitialized || showSplash) {
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
