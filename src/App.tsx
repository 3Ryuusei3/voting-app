import { useAuth } from './hooks/useAuth'
import Auth from './components/Auth'
import Header from './components/Header'
import AuthProvider from './context/AuthProvider'
import AuthenticatedContent from './components/AuthenticatedContent'

function App() {
  const { user } = useAuth()

  return (
    <AuthProvider>
      <div className="app">
        <Header />
        <main className="container p-xl">
          {!user ? <Auth /> : <AuthenticatedContent />}
        </main>
      </div>
    </AuthProvider>
  )
}

export default App
