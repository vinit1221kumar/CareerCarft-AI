import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { LogOut, Upload, LayoutDashboard, User, Shield } from 'lucide-react'

export default function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <div className="text-2xl font-bold text-blue-600">CareerCraft AI</div>
              </Link>
              
              <div className="hidden md:flex ml-10 space-x-4">
                <Link 
                  to="/dashboard" 
                  className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
                <Link 
                  to="/upload" 
                  className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Resume
                </Link>
                {user?.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Admin
                  </Link>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center text-gray-700 dark:text-gray-200">
                <User className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">{user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
            © 2025 CareerCraft AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
