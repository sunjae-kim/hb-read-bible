import { BibleLoadingState } from '@/types/bible'
import { create } from 'zustand'

interface LoadingStore {
  auth: boolean
  bible: BibleLoadingState
  setPending: (key: 'auth' | 'bible', value: boolean | BibleLoadingState) => void
}

export const useLoadingStore = create<LoadingStore>((set) => ({
  auth: false,
  bible: { stage: 'idle', message: '' },
  setPending: (key, value) => set((state) => ({ ...state, [key]: value })),
}))
