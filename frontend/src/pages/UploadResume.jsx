import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { resumeAPI } from '../services/api'
import { Upload, FileText } from 'lucide-react'

export default function UploadResume() {
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [targetRole, setTargetRole] = useState('Software Engineer')
  const [dragActive, setDragActive] = useState(false)

  const uploadMutation = useMutation({
    mutationFn: resumeAPI.upload,
    onSuccess: (response) => {
      navigate(`/resume/${response.data.resumeId}`)
    },
  })

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!file) return

    const formData = new FormData()
    formData.append('resume', file)
    formData.append('targetRole', targetRole)

    uploadMutation.mutate(formData)
  }

  const roles = [
    'Software Engineer',
    'Data Scientist',
    'Product Manager',
    'DevOps Engineer',
    'Full Stack Developer'
  ]

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Upload Your Resume
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Get AI-powered analysis, skill gap insights, and personalized career roadmaps
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".pdf,.docx"
              onChange={handleFileChange}
            />
            
            {file ? (
              <div className="flex items-center justify-center space-x-2">
                <FileText className="w-8 h-8 text-blue-600" />
                <div className="text-left">
                  <p className="font-semibold text-gray-900 dark:text-white">{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            ) : (
              <div>
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Drag and drop your resume here, or
                </p>
              </div>
            )}
            
            <label
              htmlFor="file-upload"
              className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
            >
              {file ? 'Change File' : 'Browse Files'}
            </label>
            
            <p className="mt-2 text-xs text-gray-500">
              Supported formats: PDF, DOCX (Max 10MB)
            </p>
          </div>

          {/* Target Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Target Job Role
            </label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="input"
            >
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Select the role you're targeting for tailored analysis
            </p>
          </div>

          {/* Error Message */}
          {uploadMutation.isError && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">
                {uploadMutation.error?.response?.data?.message || 'Upload failed. Please try again.'}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!file || uploadMutation.isPending}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploadMutation.isPending ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Analyze Resume'
            )}
          </button>
        </form>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">What happens next?</h3>
          <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-400">
            <li>✓ AI extracts 20+ fields from your resume</li>
            <li>✓ Score across 10+ criteria (1-100 scale)</li>
            <li>✓ Identify skill gaps for your target role</li>
            <li>✓ Generate personalized learning roadmap</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
