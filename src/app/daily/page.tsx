'use client'

import { bibleManager } from '@/lib/bible'
import { usePlanStore } from '@/stores/plan'
import { format } from 'date-fns'
import { useEffect, useState } from 'react'

interface ChapterContent {
  book: string
  chapter: number
  verses: { verse: number; content: string }[]
}

const DailyReading: React.FC = () => {
  const { getReadingForDate, markAsCompleted } = usePlanStore()
  const [chapters, setChapters] = useState<Record<string, ChapterContent[]>>({})
  const today = new Date()
  const reading = getReadingForDate(today)

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

  if (!reading) {
    return <div>오늘의 읽기 분량이 없습니다.</div>
  }

  return (
    <div className="bg-primary/10 p-4 pt-10">
      <div className="mx-auto max-w-screen-md space-y-6">
        <div className="flex flex-col items-center justify-center">
          <h1 className="mb-2 text-xl font-bold">오늘의 성경 읽기</h1>
          <div className="text-sm text-gray-700">{format(today, 'yyyy년 MM월 dd일')}</div>
        </div>

        {reading.ranges.map((range, index) => {
          const rangeKey = `${range.book}${range.startChapter}-${range.endChapter}`
          const rangeChapters = chapters[rangeKey] || []

          return (
            <div key={index} className="space-y-4">
              <h2 className="text-xl font-semibold">
                {range.book} {range.startChapter}-{range.endChapter}장
              </h2>

              {rangeChapters.map((chapter) => (
                <div key={chapter.chapter} className="leading-loose text-gray-900">
                  <h3 className="float-left mr-2 text-6xl mt-0.5">{chapter.chapter}</h3>
                  <div className="space-x-1">
                    {chapter.verses.map((verse) => (
                      <span key={verse.verse} className="text-sm">
                        {verse.verse}. {verse.content}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        })}

        <button
          onClick={() => markAsCompleted(today, !reading.completed)}
          className={`${
            reading.completed ? 'bg-green-500 text-white' : 'bg-gray-200'
          } mt-4 rounded px-4 py-2 transition-colors`}
        >
          {reading.completed ? '완료됨' : '완료하기'}
        </button>
      </div>
    </div>
  )
}

export default DailyReading
