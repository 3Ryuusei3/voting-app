import { ReactNode, useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { isCheckingUser } = useAuth()
  const [initialCheckDone, setInitialCheckDone] = useState(false)
  const [lastAuthEvent, setLastAuthEvent] = useState<string | null>(null)

  useEffect(() => {
    if (!initialCheckDone) {
      useAuthStore.getState().checkUser().then(() => {
        setInitialCheckDone(true)
      })
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === lastAuthEvent && event !== 'SIGNED_IN' && event !== 'SIGNED_OUT') {
          return;
        }

        setLastAuthEvent(event);

        if (event === 'SIGNED_IN' && session?.user) {
          useAuthStore.getState().checkUser()
        } else if (event === 'SIGNED_OUT') {
          useAuthStore.getState().checkUser()
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [initialCheckDone, lastAuthEvent])

  if (isCheckingUser && !initialCheckDone) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '100vh' }}>
        <p className="text-muted text-large">Loading...</p>
      </div>
    )
  }

  return <>{children}</>
}

export default AuthProvider
