import { useQuery, useMutation } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { resumeAPI } from '../services/api'
import { TrendingUp, AlertCircle, CheckCircle, Map } from 'lucide-react'

export default function SkillGapAnalysis() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['skillGap', id],
    queryFn: async () => {
      // Note: In a real app, you'd have a separate endpoint for skill gaps
      // For now, we'll simulate it
      return { skillGap: null }
    }
  })

  const generateRoadmapMutation = useMutation({
    mutationFn: (weeks) => resumeAPI.generateRoadmap({ skillGapId: id, weeks }),
    onSuccess: (response) => {
      navigate(`/roadmap/${response.data.roadmapId}`)
    }
  })

  if (isLoading) {
    return <div className="text-center py-12">Loading skill gap analysis...</div>
  }

  // Mock data for demonstration
  const mockData = {
    targetRole: 'Software Engineer',
    overallMatch: 75,
    currentSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Git'],
    missingSkills: [
      { skill: 'TypeScript', importance: 'critical', category: 'language' },
      { skill: 'Docker', importance: 'important', category: 'tool' },
      { skill: 'Kubernetes', importance: 'important', category: 'tool' },
      { skill: 'GraphQL', importance: 'nice-to-have', category: 'framework' },
      { skill: 'CI/CD', importance: 'critical', category: 'technical' }
    ],
    skillCoverage: {
      languages: 80,
      frameworks: 70,
      tools: 60,
      technical: 65,
      databases: 75
    }
  }

  const getImportanceColor = (importance) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      important: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      'nice-to-have': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
    }
    return colors[importance] || colors['nice-to-have']
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Skill Gap Analysis
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Target Role: <strong>{mockData.targetRole}</strong>
        </p>
      </div>

      {/* Overall Match */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Overall Skill Match</h2>
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl font-bold text-blue-600">{mockData.overallMatch}%</div>
            <p className="text-gray-600 dark:text-gray-400 mt-2">of required skills matched</p>
          </div>
        </div>
        
        <div className="mt-6 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
          <div 
            className="bg-blue-600 h-4 rounded-full transition-all"
            style={{ width: `${mockData.overallMatch}%` }}
          ></div>
        </div>
      </div>

      {/* Skill Coverage by Category */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Skill Coverage by Category</h2>
        <div className="space-y-4">
          {Object.entries(mockData.skillCoverage).map(([category, percentage]) => (
            <div key={category}>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {category}
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {percentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${percentage >= 75 ? 'bg-green-600' : percentage >= 50 ? 'bg-yellow-600' : 'bg-red-600'}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Skills */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
          Your Current Skills
        </h2>
        <div className="flex flex-wrap gap-2">
          {mockData.currentSkills.map((skill, i) => (
            <span key={i} className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded-full text-sm font-medium">
              ✓ {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Missing Skills */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <AlertCircle className="w-6 h-6 text-red-600 mr-2" />
          Skills to Learn
        </h2>
        <div className="space-y-3">
          {mockData.missingSkills.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="font-semibold text-gray-900 dark:text-white">{item.skill}</div>
                <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">({item.category})</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getImportanceColor(item.importance)}`}>
                {item.importance}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Generate Roadmap */}
      <div className="card bg-gradient-to-r from-purple-500 to-purple-700 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold flex items-center">
              <Map className="w-6 h-6 mr-2" />
              Ready for a Personalized Learning Roadmap?
            </h3>
            <p className="mt-2 text-purple-100">
              Generate a 4-8 week customized roadmap with 40+ milestones
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => generateRoadmapMutation.mutate(6)}
              disabled={generateRoadmapMutation.isPending}
              className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors disabled:opacity-50"
            >
              {generateRoadmapMutation.isPending ? 'Generating...' : '6 Weeks'}
            </button>
            <button
              onClick={() => generateRoadmapMutation.mutate(8)}
              disabled={generateRoadmapMutation.isPending}
              className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors disabled:opacity-50"
            >
              8 Weeks
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
