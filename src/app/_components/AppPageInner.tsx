'use client'

import { KAKAO_AUTH_URL } from '@/constants'
import { auth } from '@/lib/firebase'
import { useAuthStore } from '@/stores/auth'
import { signOut } from 'firebase/auth'
import { toast } from 'react-hot-toast'

const AppPageInner = () => {
  const user = useAuthStore((state) => state.user)

  const handleLogout = async () => {
    try {
      await signOut(auth)
      toast.success('로그아웃되었습니다.')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('로그아웃 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      {user && <p className="text-gray-700">안녕하세요, {user.providerData[0].displayName || '사용자'}님!</p>}

      {user ? (
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg bg-red-500 px-6 py-2 font-semibold text-white transition-colors duration-200 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
        >
          로그아웃
        </button>
      ) : (
        <button
          type="button"
          className="rounded-lg bg-yellow-400 px-6 py-2 font-semibold text-gray-800 transition-colors duration-200 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50"
        >
          <a href={KAKAO_AUTH_URL} className="flex items-center gap-2">
            카카오 로그인
          </a>
        </button>
      )}
    </div>
  )
}

export default AppPageInner
