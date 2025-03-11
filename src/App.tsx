import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Auth from './components/Auth'
import Header from './components/Header'
import AuthProvider from './context/AuthProvider'
import AuthenticatedContent from './components/AuthenticatedContent'
import VotePage from './pages/VotePage'

function App() {
  const { user } = useAuth()

  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Header />
          <Routes>
            <Route path="/vote" element={<VotePage />} />
            <Route path="/" element={
              <main className="container p-xl">
                {!user ? <Auth /> : <AuthenticatedContent />}
              </main>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
