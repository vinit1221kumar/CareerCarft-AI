import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { resumeAPI } from '../services/api'
import { Calendar, Clock, CheckCircle, Circle, Target } from 'lucide-react'

export default function Roadmap() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [activeWeek, setActiveWeek] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['roadmap', id],
    queryFn: () => resumeAPI.getRoadmap(id).then(res => res.data)
  })

  const updateProgressMutation = useMutation({
    mutationFn: ({ weekNumber, milestoneIndex, status }) => 
      resumeAPI.updateProgress(id, { weekNumber, milestoneIndex, status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['roadmap', id])
    }
  })

  if (isLoading) {
    return <div className="text-center py-12">Loading roadmap...</div>
  }

  const roadmap = data?.roadmap

  if (!roadmap) {
    return <div className="text-center py-12">Roadmap not found</div>
  }

  const handleMilestoneToggle = (weekNumber, milestoneIndex, currentStatus) => {
    const newStatus = currentStatus === 'completed' ? 'not-started' : 'completed'
    updateProgressMutation.mutate({ weekNumber, milestoneIndex, status: newStatus })
  }

  const getMilestoneIcon = (status) => {
    if (status === 'completed') return <CheckCircle className="w-5 h-5 text-green-600" />
    if (status === 'in-progress') return <Clock className="w-5 h-5 text-blue-600" />
    return <Circle className="w-5 h-5 text-gray-400" />
  }

  const getCategoryColor = (category) => {
    const colors = {
      skill: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      project: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      practice: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      reading: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      certification: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    }
    return colors[category] || colors.skill
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Your Learning Roadmap
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Target Role: <strong>{roadmap.targetRole}</strong>
            </p>
            <div className="flex items-center mt-2 space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {roadmap.duration.weeks} weeks
              </span>
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {roadmap.duration.hoursPerWeek} hours/week
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-4xl font-bold text-blue-600">{roadmap.progress.percentComplete}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{ width: `${roadmap.progress.percentComplete}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {roadmap.progress.completedMilestones} of {roadmap.progress.totalMilestones} milestones completed
          </p>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="card">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {roadmap.weeks.map((week) => (
            <button
              key={week.weekNumber}
              onClick={() => setActiveWeek(week.weekNumber)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeWeek === week.weekNumber
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Week {week.weekNumber}
            </button>
          ))}
        </div>
      </div>

      {/* Active Week Content */}
      {roadmap.weeks.filter(w => w.weekNumber === activeWeek).map((week) => (
        <div key={week.weekNumber} className="space-y-6">
          {/* Week Overview */}
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Week {week.weekNumber}: {week.theme}
            </h2>
            <div className="mt-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Objectives:</h3>
              <ul className="space-y-1">
                {week.objectives.map((obj, i) => (
                  <li key={i} className="text-gray-700 dark:text-gray-300 text-sm flex items-start">
                    <Target className="w-4 h-4 mr-2 mt-0.5 text-blue-600 flex-shrink-0" />
                    {obj}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Milestones */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Milestones ({week.milestones.length})
            </h3>
            <div className="space-y-4">
              {week.milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    milestone.status === 'completed'
                      ? 'border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <button
                        onClick={() => handleMilestoneToggle(week.weekNumber, index, milestone.status)}
                        className="mt-1"
                      >
                        {getMilestoneIcon(milestone.status)}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className={`font-semibold ${milestone.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                            {milestone.title}
                          </h4>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(milestone.category)}`}>
                            {milestone.category}
                          </span>
                          {milestone.priority === 'high' && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                              High Priority
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {milestone.description}
                        </p>
                        
                        {/* Resources */}
                        {milestone.resources && milestone.resources.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Resources:</p>
                            <div className="space-y-1">
                              {milestone.resources.map((resource, ri) => (
                                <a
                                  key={ri}
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                >
                                  📚 {resource.title} ({resource.duration})
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4 inline mr-1" />
                      {milestone.estimatedHours}h
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assessment */}
          {week.assessments && week.assessments.length > 0 && (
            <div className="card bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Week Assessment</h3>
              {week.assessments.map((assessment, i) => (
                <div key={i} className="text-sm text-blue-800 dark:text-blue-400">
                  <p>{assessment.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Capstone Project */}
      {roadmap.capstoneProject && (
        <div className="card bg-gradient-to-r from-purple-500 to-purple-700 text-white">
          <h2 className="text-2xl font-bold mb-2">Capstone Project</h2>
          <h3 className="text-xl font-semibold mb-3">{roadmap.capstoneProject.title}</h3>
          <p className="text-purple-100 mb-4">{roadmap.capstoneProject.description}</p>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-sm text-purple-200 mb-2">Technologies:</p>
              <div className="flex flex-wrap gap-2">
                {roadmap.capstoneProject.technologies.slice(0, 6).map((tech, i) => (
                  <span key={i} className="px-2 py-1 bg-white/20 rounded text-sm">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-purple-200 mb-2">Estimated Time:</p>
              <p className="text-lg font-semibold">{roadmap.capstoneProject.estimatedHours} hours</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
