import { useEffect, useState } from 'react'
import { useAuthStore } from './store/authStore'
import Auth from './components/Auth'
import { supabase } from './lib/supabase'
import './App.css'

function App() {
  const { user, isLoading } = useAuthStore()
  const [initialCheckDone, setInitialCheckDone] = useState(false)

  // Debug log
  console.log('App render state:', { user, isLoading, initialCheckDone })

  useEffect(() => {
    console.log('Running initial auth check')

    // Only run once
    if (!initialCheckDone) {
      // Check if user is already authenticated
      useAuthStore.getState().checkUser().then(() => {
        setInitialCheckDone(true)
      })
    }

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session)
        if (event === 'SIGNED_IN' && session?.user) {
          useAuthStore.getState().checkUser()
        } else if (event === 'SIGNED_OUT') {
          useAuthStore.getState().checkUser()
        }
      }
    )

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [initialCheckDone]) // Only depend on initialCheckDone

  // Show loading state only during initial check
  if (isLoading && !initialCheckDone) {
    console.log('Showing loading state')
    return (
      <div className="app-loading">
        <p>Loading...</p>
      </div>
    )
  }

  // If no user, show auth page
  if (!user) {
    console.log('No user found, showing Auth component')
    return <Auth />
  }

  // Main app content (only shown when authenticated)
  return (
    <div className="app">
      <header className="app-header">
        <h1>Voting App</h1>
        <button onClick={() => useAuthStore.getState().signOut()}>Sign Out</button>
      </header>
      <main className="app-content">
        <p>Welcome, {user.email}!</p>
        <p>You are now authenticated. The voting app content will be added here.</p>
      </main>
    </div>
  )
}

export default App
