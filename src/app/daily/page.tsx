'use client'

import KakaoLoginButton from '@/components/auth/KakaoLoginButton'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { BIBLE_BOOK_MAPPER, bibleManager } from '@/lib/bible'
import { useAuthStore } from '@/stores/auth'
import { usePlanStore } from '@/stores/plan'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { Fragment, useEffect, useState } from 'react'

interface ChapterContent {
  book: string
  chapter: number
  verses: { verse: number; content: string }[]
}

const DailyReading = () => {
  const router = useRouter()
  const { getReadingForDate } = usePlanStore()
  const [chapters, setChapters] = useState<Record<string, ChapterContent[]>>({})
  const today = new Date()
  const reading = getReadingForDate(today)
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    const loadChapters = () => {
      if (!reading) return

      const loadedChapters: Record<string, ChapterContent[]> = {}

      for (const range of reading.ranges) {
        const rangeChapters: ChapterContent[] = []
        for (let chapter = range.startChapter; chapter <= range.endChapter; chapter++) {
          try {
            const chapterVerses = bibleManager.getChapter(range.book, chapter)
            const verses = Object.entries(chapterVerses).map(([verseNum, content]) => ({
              verse: parseInt(verseNum),
              content,
            }))

            rangeChapters.push({
              book: range.book,
              chapter,
              verses,
            })
          } catch (error) {
            console.error(`Error loading ${range.book} ${chapter}:`, error)
          }
        }
        const rangeKey = `${range.book}${range.startChapter}-${range.endChapter}`
        loadedChapters[rangeKey] = rangeChapters
      }

      setChapters(loadedChapters)
    }

    loadChapters()
  }, [reading])

  // Check
  const markAsRead = () => {
    console.log(user)

    if (!user) {
      setLoginModal(true)
    }
  }

  const [loginModal, setLoginModal] = useState(false)
  const [tempModal, setTempModal] = useState(false)

  if (!reading) {
    return <div>오늘의 읽기 분량이 없습니다.</div>
  }

  return (
    <>
      <div className="bg-primary/10 p-4 pt-10">
        <div className="mx-auto max-w-screen-md">
          <div className="mb-10 flex flex-col items-center justify-center">
            <h1 className="mb-2 text-xl font-bold">오늘의 성경 읽기</h1>
            <div className="flex items-center text-sm text-gray-700">
              <div>{format(today, 'yyyy년 MM월 dd일')}</div>
              <div className="mx-1.5 h-3 w-px bg-gray-700" />
              <div>
                {reading.ranges.map((range, index) => (
                  <Fragment key={range.book}>
                    <span>
                      <span>{BIBLE_BOOK_MAPPER[range.book]} </span>
                      {range.startChapter !== range.endChapter ? (
                        <span>
                          {range.startChapter}-{range.endChapter}장
                        </span>
                      ) : (
                        <span>{range.startChapter}장</span>
                      )}
                    </span>
                    {index < reading.ranges.length - 1 && <span>, </span>}
                  </Fragment>
                ))}
              </div>
            </div>
          </div>

          {reading.ranges.map((range, index) => {
            const rangeKey = `${range.book}${range.startChapter}-${range.endChapter}`
            const rangeChapters = chapters[rangeKey] || []

            return (
              <div key={index} className="space-y-8">
                {rangeChapters.map((chapter) => (
                  <div key={chapter.chapter} className="text-gray-900">
                    <h3 className="mb-2 text-xl font-semibold">
                      {BIBLE_BOOK_MAPPER[range.book]} {chapter.chapter}장
                    </h3>
                    <div className="grid grid-cols-[auto,1fr] items-start gap-x-1.5 gap-y-1 leading-loose">
                      {chapter.verses.map((verse) => (
                        <Fragment key={verse.verse}>
                          <div className="mt-[5px] text-center text-sm font-medium">{verse.verse}</div>
                          <div>{verse.content}</div>
                        </Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          })}

          <div className="mb-4 mt-10 flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => router.push('/')}>
              홈으로
            </Button>
            <Button className="hidden" onClick={markAsRead}>
              읽기표 체크
            </Button>
            <Button onClick={() => setTempModal(true)}>읽기표 체크</Button>
          </div>
        </div>
      </div>

      <Modal isOpen={loginModal} setIsOpen={setLoginModal}>
        <div className="relative flex flex-col items-center justify-center px-8 pb-6 pt-8">
          <button className="absolute right-3 top-3 -m-2 p-2" onClick={() => setLoginModal(false)}>
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
          <div className="mb-1 text-lg font-medium">로그인 하시겠습니까?</div>
          <div className="text-sm text-gray-800">로그인 후 읽기표에 체크할 수 있습니다.</div>
          <KakaoLoginButton className="mt-4 w-44" next={'daily'} />
        </div>
      </Modal>

      <Modal isOpen={tempModal} setIsOpen={setTempModal}>
        <div className="relative flex flex-col items-center justify-center px-8 pb-6 pt-8">
          <button className="absolute right-3 top-3 -m-2 p-2" onClick={() => setTempModal(false)}>
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
          <div className="mb-1 text-lg font-medium">준비중입니다</div>
          <div className="text-sm text-gray-800">아직 개발중인 기능입니다 🚧</div>
        </div>
      </Modal>
    </>
  )
}

export default DailyReading
