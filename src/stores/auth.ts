import { create } from 'zustand'
import { auth } from '@/lib/firebase'
import { User } from 'firebase/auth'

interface AuthStore {
  user: User | null | undefined
  initialized: boolean
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: undefined,
  initialized: false,
  setUser: (user) => set({ user, initialized: true }),
}))

auth.onAuthStateChanged((user) => {
  useAuthStore.getState().setUser(user)
})
