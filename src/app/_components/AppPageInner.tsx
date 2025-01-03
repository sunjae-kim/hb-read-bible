'use client'

import KakaoLoginButton from '@/components/auth/KakaoLoginButton'
import { BIBLE_BOOK_MAPPER } from '@/lib/bible'
import { useAuthStore } from '@/stores/auth'
import { usePlanStore } from '@/stores/plan'
import { Button } from '@headlessui/react'
import Image from 'next/image'
import Logo from '@/assets/logo.png'
import { useEffect, useRef } from 'react'
import { BookOpenIcon } from '@heroicons/react/20/solid'
import { useRouter } from 'next/navigation'

const AppPageInner = () => {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const activePlan = usePlanStore((state) => {
    const plans = state.plans
    const activePlanId = state.activePlanId
    if (!activePlanId) return null
    return plans[activePlanId]
  })

  const today = new Date()
  const currentMonth = String(today.getMonth() + 1)
  const todayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (todayRef.current) {
      // * Temporarily disabled
      // todayRef.current.scrollIntoView({
      //   behavior: 'auto',
      //   block: 'start',
      // })
    }
  }, [activePlan])

  return (
    <>
      <div className="flex min-h-screen flex-col bg-gray-50 p-4 pt-10">
        <div className="mx-auto w-full max-w-screen-md grow">
          <header className="mb-10 flex items-end justify-between">
            <Image src={Logo} alt="logo" height={50} priority />
            <div className="flex items-center space-x-2">
              {user && <p className="text-gray-900">안녕하세요, {user.providerData[0].displayName || '사용자'}님!</p>}
              {user ? (
                <Button
                  className="rounded border border-solid border-gray-400 px-1 text-xs text-gray-700"
                  onClick={useAuthStore.getState().signOut}
                >
                  로그아웃
                </Button>
              ) : (
                <KakaoLoginButton className="w-40" />
              )}
            </div>
          </header>

          {activePlan && (
            <section className="mt-5 space-y-5">
              {Object.entries(activePlan.months).map(([month, monthlyPlan]) => {
                const isToday = month === currentMonth
                return (
                  <div key={month}>
                    <div className="mb-5 scroll-m-5 text-2xl" ref={isToday ? todayRef : null}>
                      {month}월
                    </div>
                    <div className="xs:grid-cols-3 grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-5">
                      {Object.entries(monthlyPlan).map(([day, dailyPlan]) => {
                        return (
                          <div key={day} className="relative flex h-[100px] flex-col rounded-lg bg-white p-2 shadow">
                            <p>{day}일</p>
                            {dailyPlan.ranges.map((range) => {
                              return (
                                <div key={range.book} className="xs:text-sm text-xs text-gray-700">
                                  <span>{BIBLE_BOOK_MAPPER[range.book]} </span>
                                  {range.startChapter !== range.endChapter ? (
                                    <span>
                                      {range.startChapter}-{range.endChapter}장
                                    </span>
                                  ) : (
                                    <span>{range.startChapter}장</span>
                                  )}
                                </div>
                              )
                            })}

                            <div className="absolute bottom-2 right-2 h-6 w-6">
                              <input className="h-6 w-6 accent-primary" type="checkbox" />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </section>
          )}
        </div>

        <footer className="mt-5 flex h-10 items-center justify-center space-x-1 text-sm text-gray-700">
          <span>문의사항 :</span>
          <a className="underline" href="tel:010-3747-8756">
            010-3747-8756
          </a>
          <span>1청년부 김선재</span>
        </footer>
      </div>

      <button
        onClick={() => router.push('/daily')}
        className="fixed bottom-5 right-5 flex h-20 w-20 flex-col items-center justify-center rounded-full bg-primary text-white shadow-lg transition-colors hover:bg-[#719728]"
      >
        <BookOpenIcon className="h-8 w-8" />
        <span className="text-xs">읽으러 가기</span>
      </button>
    </>
  )
}

export default AppPageInner
