import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { resumeAPI } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { FileText, TrendingUp, Clock, CheckCircle } from 'lucide-react'

export default function Dashboard() {
  const user = useAuthStore((state) => state.user)
  
  const { data: resumesData, isLoading } = useQuery({
    queryKey: ['resumes'],
    queryFn: () => resumeAPI.getAll().then(res => res.data)
  })

  const resumes = resumesData?.resumes || []

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-100',
      processing: 'text-blue-600 bg-blue-100',
      completed: 'text-green-600 bg-green-100',
      failed: 'text-red-600 bg-red-100'
    }
    return colors[status] || 'text-gray-600 bg-gray-100'
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Track your resume analysis, skill gaps, and career roadmaps all in one place.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Resumes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{resumes.length}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {resumes.length > 0 
                  ? Math.round(resumes.reduce((sum, r) => sum + (r.score || 0), 0) / resumes.length)
                  : 0}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Processing</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {resumes.filter(r => r.processingStatus === 'processing').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {resumes.filter(r => r.processingStatus === 'completed').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Quick Action */}
      <div className="card bg-gradient-to-r from-blue-500 to-blue-700 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">Ready to analyze your resume?</h3>
            <p className="mt-2 text-blue-100">Upload your resume and get AI-powered insights</p>
          </div>
          <Link to="/upload" className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            Upload Resume
          </Link>
        </div>
      </div>

      {/* Recent Resumes */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Recent Resumes</h2>
        
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No resumes yet. Upload your first resume to get started!
          </div>
        ) : (
          <div className="space-y-4">
            {resumes.map((resume) => (
              <Link
                key={resume._id}
                to={`/resume/${resume._id}`}
                className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{resume.fileName}</h3>
                    <div className="flex items-center mt-2 space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>Target: {resume.targetRole}</span>
                      <span>•</span>
                      <span>{new Date(resume.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {resume.score && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{resume.score}</div>
                        <div className="text-xs text-gray-500">Score</div>
                      </div>
                    )}
                    
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(resume.processingStatus)}`}>
                      {resume.processingStatus}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
