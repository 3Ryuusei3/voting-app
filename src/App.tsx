import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import AuthProvider from './context/AuthProvider'
import VotePage from './pages/VotePage'
import HistoryPage from './pages/HistoryPage'
import Auth from './components/Auth'
import Header from './components/Header'
import AuthenticatedContent from './components/WelcomeCard'

function App() {
  const { user } = useAuth()

  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Header />
          <Routes>
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/vote" element={<VotePage />} />
            <Route path="/" element={
              <main className="container">
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
