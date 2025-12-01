'use client'
import { useRouter } from 'next/navigation'
import TestMakerPage from '../components/TestMaker/TestMakerPage'
import { useAuth } from '@/context/AuthContext'
import { useEffect } from 'react'

export default function Page() {
  const { token, loading, role } = useAuth()
  const router = useRouter()

  useEffect(() => {
      if (!loading && !token) {
        router.push('/auth/login');
      }
      if (role !== 'Admin' && role !== 'Moderator'&& role !== 'Editor'){
        router.push('/');
        return;
      }
    }, [loading, token, router, role]); // ✅ Include router
  
  return <TestMakerPage />
}
