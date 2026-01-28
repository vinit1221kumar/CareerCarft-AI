import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import UploadResume from './pages/UploadResume'
import ResumeDetail from './pages/ResumeDetail'
import SkillGapAnalysis from './pages/SkillGapAnalysis'
import Roadmap from './pages/Roadmap'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  const { isAuthenticated, user } = useAuthStore()

  const PrivateRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />
  }

  const AdminRoute = ({ children }) => {
    return isAuthenticated && user?.role === 'admin' ? children : <Navigate to="/dashboard" />
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="upload" element={<UploadResume />} />
        <Route path="resume/:id" element={<ResumeDetail />} />
        <Route path="skill-gap/:id" element={<SkillGapAnalysis />} />
        <Route path="roadmap/:id" element={<Roadmap />} />
        
        <Route path="admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
      </Route>
    </Routes>
  )
}

export default App
