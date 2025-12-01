'use client'
import { useAuth } from '../../../context/AuthContext'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PremiumPage() {
  const { token, isPremium, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!token) router.push('/auth/login')
      else if (!isPremium) router.push('/upgrade')
    }
  }, [loading, token, isPremium, router])

  if (loading || !token || !isPremium) return null // or a fancy spinner

  return <div>💎 Welcome Premium User</div>
}
