'use client'

import { bibleManager } from '@/lib/bible'
import { usePlanStore } from '@/stores/plan'
import { useEffect, useState } from 'react'

interface VerseContent {
  book: string
  chapter: number
  verse: string
}

const DailyReading: React.FC = () => {
  const { getReadingForDate, markAsCompleted } = usePlanStore()
  const [verses, setVerses] = useState<Record<string, VerseContent[]>>({})
  const today = new Date()
  const reading = getReadingForDate(today)

  useEffect(() => {
    const loadVerses = () => {
      if (!reading) return

      const loadedVerses: Record<string, VerseContent[]> = {}

      for (const range of reading.ranges) {
        const rangeVerses: VerseContent[] = []
        for (let chapter = range.startChapter; chapter <= range.endChapter; chapter++) {
          try {
            const chapterVerses = bibleManager.getChapter(range.book, chapter)
            Object.entries(chapterVerses).forEach(([, content]) => {
              rangeVerses.push({
                book: range.book,
                chapter,
                verse: content,
              })
            })
          } catch (error) {
            console.error(`Error loading ${range.book} ${chapter}:`, error)
          }
        }
        const rangeKey = `${range.book}${range.startChapter}-${range.endChapter}`
        loadedVerses[rangeKey] = rangeVerses
      }

      setVerses(loadedVerses)
    }

    loadVerses()
  }, [reading])

  if (!reading) {
    return <div>오늘의 읽기 분량이 없습니다.</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">오늘의 성경 읽기</h2>

      {reading.ranges.map((range, index) => {
        const rangeKey = `${range.book}${range.startChapter}-${range.endChapter}`
        const rangeVerses = verses[rangeKey] || []

        return (
          <div key={index} className="space-y-4">
            <h3 className="text-lg font-semibold">
              {range.book} {range.startChapter}-{range.endChapter}장
            </h3>

            <div className="space-y-2">
              {rangeVerses.map((verseContent, vIndex) => (
                <div key={vIndex} className="text-sm">
                  <span className="font-medium">{verseContent.chapter}장:</span>
                  <span className="ml-2">{verseContent.verse}</span>
                </div>
              ))}
            </div>
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
  )
}

export default DailyReading
