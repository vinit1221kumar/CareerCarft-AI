import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { resumeAPI } from '../services/api'
import { FileText, TrendingUp, Target, Trash2, BarChart3 } from 'lucide-react'

export default function ResumeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['resume', id],
    queryFn: () => resumeAPI.getById(id).then(res => res.data)
  })

  const deleteMutation = useMutation({
    mutationFn: () => resumeAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['resumes'])
      navigate('/dashboard')
    }
  })

  const analyzeSkillGapMutation = useMutation({
    mutationFn: () => resumeAPI.analyzeSkillGap({ resumeId: id, targetRole: data.resume.targetRole }),
    onSuccess: (response) => {
      navigate(`/skill-gap/${response.data.skillGapId}`)
    }
  })

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>
  }

  const resume = data?.resume

  if (!resume) {
    return <div className="text-center py-12">Resume not found</div>
  }

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-blue-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{resume.fileName}</h1>
              <p className="text-gray-600 dark:text-gray-400">Target Role: {resume.targetRole}</p>
              <p className="text-sm text-gray-500 mt-1">Uploaded {new Date(resume.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <button
            onClick={() => deleteMutation.mutate()}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Processing Status */}
      {resume.processingStatus !== 'completed' && (
        <div className="card bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <p className="text-yellow-800 dark:text-yellow-200">
            Status: <strong>{resume.processingStatus}</strong>
            {resume.processingStatus === 'processing' && ' - Your resume is being analyzed...'}
          </p>
        </div>
      )}

      {/* Score Overview */}
      {resume.score && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Overall Score</h2>
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className={`text-6xl font-bold ${getScoreColor(resume.score)}`}>
                {resume.score}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">out of 100</p>
            </div>
          </div>
        </div>
      )}

      {/* Score Breakdown */}
      {resume.scoreBreakdown && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Score Breakdown</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(resume.scoreBreakdown).map(([key, value]) => (
              <div key={key} className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feedback */}
      {resume.feedback && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="font-semibold text-green-600 dark:text-green-400 mb-3">Strengths</h3>
            <ul className="space-y-2">
              {resume.feedback.strengths?.map((strength, i) => (
                <li key={i} className="text-sm text-gray-700 dark:text-gray-300">✓ {strength}</li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h3 className="font-semibold text-yellow-600 dark:text-yellow-400 mb-3">Areas to Improve</h3>
            <ul className="space-y-2">
              {resume.feedback.improvements?.map((improvement, i) => (
                <li key={i} className="text-sm text-gray-700 dark:text-gray-300">→ {improvement}</li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-3">Suggestions</h3>
            <ul className="space-y-2">
              {resume.feedback.suggestions?.map((suggestion, i) => (
                <li key={i} className="text-sm text-gray-700 dark:text-gray-300">💡 {suggestion}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Parsed Data Summary */}
      {resume.parsedData && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Extracted Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Info */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Contact</h3>
              <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                {resume.parsedData.name && <p>Name: {resume.parsedData.name}</p>}
                {resume.parsedData.email && <p>Email: {resume.parsedData.email}</p>}
                {resume.parsedData.phone && <p>Phone: {resume.parsedData.phone}</p>}
              </div>
            </div>

            {/* Skills */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Skills Detected</h3>
              <div className="flex flex-wrap gap-2">
                {resume.parsedData.skills?.technical?.slice(0, 10).map((skill, i) => (
                  <span key={i} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Experience</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {resume.parsedData.experience?.length || 0} positions found
              </p>
            </div>

            {/* Education */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Education</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {resume.parsedData.education?.length || 0} degrees found
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => analyzeSkillGapMutation.mutate()}
          disabled={analyzeSkillGapMutation.isPending || resume.processingStatus !== 'completed'}
          className="card hover:shadow-lg transition-shadow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-6 h-6 text-purple-600" />
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white">Analyze Skill Gap</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Compare your skills with target role</p>
            </div>
          </div>
        </button>

        <Link to="/dashboard" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-3">
            <Target className="w-6 h-6 text-green-600" />
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white">Back to Dashboard</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">View all your resumes</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
