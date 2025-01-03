import { BibleLoadingState } from '@/types/bible'

interface BibleVerse {
  [verseNumber: string]: string
}

interface BibleChapter {
  verses: BibleVerse
}

interface BibleBook {
  chapters: {
    [chapterNumber: string]: BibleChapter
  }
}

interface BibleData {
  books: {
    [bookName: string]: BibleBook
  }
}

interface SearchResult {
  book: string
  chapter: string
  verse: string
  text: string
}

interface InitializeOptions {
  url?: string
  useIndexedDB?: boolean
}

class BibleError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BibleError'
  }
}

interface InitializeOptions {
  url?: string
  useIndexedDB?: boolean
  onProgress?: (stage: BibleLoadingState['stage'], message: string) => void
}

class BibleManager {
  private bibleData: BibleData | null = null
  private isInitialized: boolean = false
  private readonly baseUrl: string

  constructor() {
    this.baseUrl = 'https://hb-read-bible.web.app/bible.json'
  }

  /**
   * Bible 데이터를 초기화합니다.
   */
  public async initialize(options: InitializeOptions = {}): Promise<void> {
    const { url = this.baseUrl, useIndexedDB = true, onProgress } = options

    if (this.isInitialized) return

    try {
      if (useIndexedDB) {
        const cachedData = await this.loadFromIndexedDB()
        if (cachedData) {
          this.bibleData = cachedData
          this.isInitialized = true
          return
        }
      }

      onProgress?.('downloading', '성경 데이터 다운로드 중...')
      const response = await fetch(url)
      if (!response.ok) {
        throw new BibleError(`HTTP error! status: ${response.status}`)
      }

      onProgress?.('initializing', '데이터 초기화 중...')
      const data = await response.json()
      this.bibleData = data as BibleData

      if (useIndexedDB && this.bibleData) {
        onProgress?.('initializing', '캐시 저장 중...')
        await this.saveToIndexedDB(this.bibleData)
      }

      this.isInitialized = true
      onProgress?.('complete', '성경 불러오기 성공')

      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      if (error instanceof Error) {
        throw new BibleError(`Bible 초기화 실패: ${error.message}`)
      }
      throw new BibleError('Bible 초기화 중 알 수 없는 오류가 발생했습니다.')
    }
  }

  /**
   * IndexedDB에서 데이터를 로드합니다.
   */
  private async loadFromIndexedDB(): Promise<BibleData | null> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('BibleDB', 1)

      request.onerror = () => reject(new BibleError('IndexedDB 접근 오류'))
      request.onsuccess = () => {
        const db = request.result
        const tx = db.transaction('bible', 'readonly')
        const store = tx.objectStore('bible')
        const getRequest = store.get('bibleData')

        getRequest.onsuccess = () => resolve(getRequest.result as BibleData | null)
        getRequest.onerror = () => reject(new BibleError('IndexedDB 데이터 로드 실패'))
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains('bible')) {
          db.createObjectStore('bible')
        }
      }
    })
  }

  /**
   * IndexedDB에 데이터를 저장합니다.
   */
  private async saveToIndexedDB(data: BibleData): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('BibleDB', 1)

      request.onerror = () => reject(new BibleError('IndexedDB 접근 오류'))
      request.onsuccess = () => {
        const db = request.result
        const tx = db.transaction('bible', 'readwrite')
        const store = tx.objectStore('bible')
        store.put(data, 'bibleData')

        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(new BibleError('IndexedDB 저장 실패'))
      }
    })
  }

  /**
   * 특정 구절을 가져옵니다.
   */
  public getVerse(book: string, chapter: string | number, verse: string | number): string {
    this.checkInitialized()
    try {
      const verseText = this.bibleData?.books[book]?.chapters[chapter]?.verses[verse]
      if (!verseText) {
        throw new BibleError(`구절을 찾을 수 없습니다: ${book} ${chapter}:${verse}`)
      }
      return verseText
    } catch (error) {
      if (error instanceof BibleError) throw error
      throw new BibleError(`구절 조회 중 오류 발생: ${book} ${chapter}:${verse}`)
    }
  }

  /**
   * 특정 장의 모든 구절을 가져옵니다.
   */
  public getChapter(book: string, chapter: string | number): BibleVerse {
    this.checkInitialized()
    try {
      const verses = this.bibleData?.books[book]?.chapters[chapter]?.verses
      if (!verses) {
        throw new BibleError(`장을 찾을 수 없습니다: ${book} ${chapter}`)
      }
      return verses
    } catch (error) {
      if (error instanceof BibleError) throw error
      throw new BibleError(`장 조회 중 오류 발생: ${book} ${chapter}`)
    }
  }

  /**
   * 특정 책의 모든 장을 가져옵니다.
   */
  public getBook(book: string): BibleBook['chapters'] {
    this.checkInitialized()
    try {
      const chapters = this.bibleData?.books[book]?.chapters
      if (!chapters) {
        throw new BibleError(`책을 찾을 수 없습니다: ${book}`)
      }
      return chapters
    } catch (error) {
      if (error instanceof BibleError) throw error
      throw new BibleError(`책 조회 중 오류 발생: ${book}`)
    }
  }

  /**
   * 텍스트로 성경을 검색합니다.
   */
  public search(searchText: string): SearchResult[] {
    this.checkInitialized()
    if (!this.bibleData) {
      throw new BibleError('Bible 데이터가 초기화되지 않았습니다.')
    }

    const results: SearchResult[] = []

    for (const [bookName, book] of Object.entries(this.bibleData.books)) {
      for (const [chapterNum, chapter] of Object.entries(book.chapters)) {
        for (const [verseNum, verseText] of Object.entries(chapter.verses)) {
          if (verseText.includes(searchText)) {
            results.push({
              book: bookName,
              chapter: chapterNum,
              verse: verseNum,
              text: verseText,
            })
          }
        }
      }
    }

    return results
  }

  /**
   * 초기화 여부를 확인합니다.
   */
  private checkInitialized(): void {
    if (!this.isInitialized) {
      throw new BibleError('Bible이 초기화되지 않았습니다. initialize()를 먼저 호출하세요.')
    }
  }
}

export const bibleManager = new BibleManager()
