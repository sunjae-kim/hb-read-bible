// stores/auth.ts
import { create } from 'zustand'
import { auth } from '@/lib/firebase'
import { User } from 'firebase/auth'

interface AuthStore {
  user: User | null
  initialized: boolean
  setUser: (user: User | null) => void
}

const STORAGE_KEY = 'auth-user'

const storage = {
  get: () => {
    if (typeof window === 'undefined') return null
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  },
  set: (user: User | null) => {
    if (typeof window === 'undefined') return
    try {
      if (user) {
        // 필요한 사용자 정보만 저장
        const userToStore = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          providerData: user.providerData,
        }
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(userToStore))
      } else {
        window.localStorage.removeItem(STORAGE_KEY)
      }
    } catch (error) {
      console.error('Failed to save user:', error)
    }
  },
}

// 초기 상태를 가져오는 함수
const getInitialState = () => {
  if (typeof window === 'undefined') {
    return null
  }
  // 우선순위: Firebase 현재 사용자 > 저장된 사용자
  return auth.currentUser || storage.get()
}

export const useAuthStore = create<AuthStore>()((set) => ({
  user: getInitialState(),
  initialized: false,
  setUser: (user) => {
    if (user) {
      storage.set(user)
    } else {
      storage.set(null)
    }
    set({ user, initialized: true })
  },
}))

if (typeof window !== 'undefined') {
  // 페이지 로드 시 저장된 사용자 정보로 초기 상태 설정
  const storedUser = storage.get()
  if (storedUser) {
    useAuthStore.getState().setUser(storedUser)
  }

  // Firebase 인증 상태 변경 감지
  auth.onAuthStateChanged((user) => {
    useAuthStore.getState().setUser(user)
  })
}
