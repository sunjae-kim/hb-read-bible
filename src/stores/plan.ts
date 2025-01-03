import defaultPlan from '@/data/defaultPlan.json'
import { DailyReading, ReadingPlan } from '@/types/plan'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PlanState {
  plans: { [planId: string]: ReadingPlan }
  activePlanId: string | null
  isLoading: boolean
  error: string | null
}

interface PlanActions {
  setActivePlan: (planId: string) => void
  getReadingForDate: (date: Date) => DailyReading | null
  markAsCompleted: (date: Date, completed: boolean) => void
  createCustomPlan: (plan: ReadingPlan) => void
  loadDefaultPlan: () => Promise<void>
}

export const usePlanStore = create<PlanState & PlanActions>()(
  persist(
    (set, get) => ({
      plans: {},
      activePlanId: null,
      isLoading: true,
      error: null,

      loadDefaultPlan: async () => {
        try {
          set({ isLoading: true, error: null })

          // TypeScript type assertion for defaultPlan
          const plan = defaultPlan as ReadingPlan

          set((state) => ({
            plans: {
              ...state.plans,
              [plan.id]: plan,
            },
            activePlanId: plan.id,
            isLoading: false,
          }))
        } catch {
          set({
            error: '기본 플랜을 불러오는데 실패했습니다.',
            isLoading: false,
          })
        }
      },

      setActivePlan: (planId) => {
        set({ activePlanId: planId })
      },

      getReadingForDate: (date) => {
        const { plans, activePlanId } = get()
        console.log({ activePlanId })
        if (!activePlanId) return null

        const plan = plans[activePlanId]
        const month = String(date.getMonth() + 1)
        const day = String(date.getDate())

        console.log(plan)

        return plan?.months[month]?.[day] || null
      },

      markAsCompleted: (date, completed) => {
        set((state) => {
          const { plans, activePlanId } = state
          if (!activePlanId) return state

          const plan = { ...plans[activePlanId] }
          const month = String(date.getMonth() + 1)
          const day = String(date.getDate())

          if (plan.months[month]?.[day]) {
            plan.months[month][day] = {
              ...plan.months[month][day],
              completed,
            }
          }

          return {
            plans: {
              ...plans,
              [activePlanId]: plan,
            },
          }
        })
      },

      createCustomPlan: (plan) => {
        set((state) => ({
          plans: {
            ...state.plans,
            [plan.id]: plan,
          },
        }))
      },
    }),
    {
      name: 'bible-reading-plan',
      partialize: (state) => ({
        plans: state.plans,
        activePlanId: state.activePlanId,
      }),
    },
  ),
)
