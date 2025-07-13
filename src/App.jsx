import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import LandingPage from './components/LandingPage'
import AuthPage from './components/AuthPage'
import Dashboard from './components/Dashboard'
import Calculator from './components/Calculator'
import Rankings from './components/Rankings'
import Rewards from './components/Rewards'
import Layout from './components/Layout'

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <Layout><Dashboard /></Layout> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/calculator" 
          element={isAuthenticated ? <Layout><Calculator /></Layout> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/rankings" 
          element={isAuthenticated ? <Layout><Rankings /></Layout> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/rewards" 
          element={isAuthenticated ? <Layout><Rewards /></Layout> : <Navigate to="/auth" />} 
        />
      </Routes>
    </div>
  )
}

export default App 