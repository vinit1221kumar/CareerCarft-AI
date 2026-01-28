import { useQuery } from '@tanstack/react-query'
import { adminAPI } from '../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Users, FileText, TrendingDown, Award } from 'lucide-react'

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => adminAPI.getDashboardStats().then(res => res.data)
  })

  const { data: skillGapsData } = useQuery({
    queryKey: ['topSkillGaps'],
    queryFn: () => adminAPI.getTopSkillGaps().then(res => res.data)
  })

  const { data: roleData } = useQuery({
    queryKey: ['roleAnalytics'],
    queryFn: () => adminAPI.getRoleAnalytics().then(res => res.data)
  })

  const { data: feedbackData } = useQuery({
    queryKey: ['commonFeedback'],
    queryFn: () => adminAPI.getCommonFeedback().then(res => res.data)
  })

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

  const scoreDistributionData = stats?.statistics?.scoreDistribution
    ? [
        { name: 'Excellent (90-100)', value: stats.statistics.scoreDistribution.excellent },
        { name: 'Good (75-89)', value: stats.statistics.scoreDistribution.good },
        { name: 'Average (60-74)', value: stats.statistics.scoreDistribution.average },
        { name: 'Below Avg (40-59)', value: stats.statistics.scoreDistribution.belowAverage },
        { name: 'Poor (0-39)', value: stats.statistics.scoreDistribution.poor }
      ]
    : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Analytics and insights across all users and resumes
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats?.statistics?.totalUsers || 0}
              </p>
            </div>
            <Users className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Resumes</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats?.statistics?.totalResumes || 0}
              </p>
            </div>
            <FileText className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Average Score</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats?.statistics?.averageScore || 0}
              </p>
            </div>
            <Award className="w-10 h-10 text-yellow-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Median Score</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats?.statistics?.medianScore || 0}
              </p>
            </div>
            <TrendingDown className="w-10 h-10 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Score Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={scoreDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {scoreDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Role Analytics */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Role Analytics</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={roleData?.roleAnalytics || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="role" angle={-15} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="averageScore" fill="#3B82F6" name="Avg Score" />
              <Bar dataKey="count" fill="#10B981" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top 10 Skill Gaps */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Top 10 Common Skill Gaps
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Rank</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Skill</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Category</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Frequency</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Percentage</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Target Roles</th>
              </tr>
            </thead>
            <tbody>
              {skillGapsData?.topSkillGaps?.map((gap, index) => (
                <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 text-gray-900 dark:text-white font-semibold">{index + 1}</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{gap.skill}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded text-xs">
                      {gap.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{gap.frequency}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full"
                          style={{ width: `${gap.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{gap.percentage}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {gap.targetRoles?.slice(0, 2).join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Common Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Common Strengths */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Common Strengths</h2>
          <div className="space-y-2">
            {feedbackData?.commonStrengths?.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/10 rounded">
                <span className="text-sm text-gray-900 dark:text-white">{item.strength}</span>
                <span className="text-sm font-semibold text-green-600">{item.frequency}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Common Improvements */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Common Areas for Improvement</h2>
          <div className="space-y-2">
            {feedbackData?.commonImprovements?.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/10 rounded">
                <span className="text-sm text-gray-900 dark:text-white">{item.area}</span>
                <span className="text-sm font-semibold text-yellow-600">{item.frequency}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
