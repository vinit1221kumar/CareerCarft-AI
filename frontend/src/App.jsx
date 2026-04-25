import { useMemo, useState } from 'react';
import ThemeToggle from './components/ThemeToggle';
import { analyzeResume, generateRoadmap, getInsights, getResumeById, uploadResume } from './api/client';

const initialForm = {
  userId: 'user123',
  targetRole: 'Backend Engineer',
  durationWeeks: 6,
  targetSkills: 'node,mongodb,system design'
};

function App() {
  const [form, setForm] = useState(initialForm);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Ready');
  const [errorMessage, setErrorMessage] = useState('');

  const [resume, setResume] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [insights, setInsights] = useState(null);

  const parsedTargetSkills = useMemo(
    () => form.targetSkills.split(',').map((skill) => skill.trim()).filter(Boolean),
    [form.targetSkills]
  );

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleRunPipeline = async () => {
    setErrorMessage('');

    if (!selectedFile) {
      setErrorMessage('Please select a PDF or DOCX resume first.');
      return;
    }

    try {
      setIsLoading(true);

      setStatusMessage('Uploading resume...');
      const uploadResult = await uploadResume(selectedFile);
      const resumeId = uploadResult?.data?.id;
      if (!resumeId) throw new Error('Resume upload succeeded but ID is missing.');

      setStatusMessage('Fetching extracted resume text...');
      const resumeResult = await getResumeById(resumeId);
      const resumeData = resumeResult?.data;
      setResume(resumeData);

      if (!resumeData?.rawText) {
        throw new Error('Resume text extraction is empty.');
      }

      setStatusMessage('Analyzing resume with AI service...');
      const analysisResult = await analyzeResume({
        resumeText: resumeData.rawText,
        candidateName: form.userId,
        jobTitle: form.targetRole,
        targetSkills: parsedTargetSkills
      });
      setAnalysis(analysisResult?.data || null);

      const currentSkills = analysisResult?.data?.skills || [];

      setStatusMessage('Generating learning roadmap...');
      const roadmapResult = await generateRoadmap({
        userId: form.userId,
        targetRole: form.targetRole,
        durationWeeks: Number(form.durationWeeks),
        currentSkills,
        targetSkills: parsedTargetSkills,
        resumeId
      });
      setRoadmap(roadmapResult?.data || null);

      setStatusMessage('Generating analytics insights...');
      const insightsResult = await getInsights({
        userId: form.userId,
        resumeId,
        targetRole: form.targetRole
      });

      const insightPayload = Array.isArray(insightsResult?.data)
        ? insightsResult.data[0] || null
        : insightsResult?.data || null;

      setInsights(insightPayload);
      setStatusMessage('Done. Dashboard updated successfully.');
    } catch (error) {
      setErrorMessage(error.message || 'Something went wrong while running the workflow.');
      setStatusMessage('Failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="header">
        <div>
          <h1>CareerCraft AI</h1>
          <p>Resume Analyzer & Career Roadmap Platform</p>
        </div>
        <div className="header-nav">
          <ThemeToggle />
        </div>
      </header>

      <section className="card size-large">
        <h2>Input</h2>
        <div className="grid">
          <label>
            User ID
            <input
              value={form.userId}
              onChange={(event) => updateForm('userId', event.target.value)}
              placeholder="user123"
            />
          </label>

          <label>
            Target Role
            <input
              value={form.targetRole}
              onChange={(event) => updateForm('targetRole', event.target.value)}
              placeholder="Backend Engineer"
            />
          </label>

          <label>
            Duration (Weeks)
            <input
              type="number"
              min="4"
              max="8"
              value={form.durationWeeks}
              onChange={(event) => updateForm('durationWeeks', event.target.value)}
            />
          </label>

          <label>
            Target Skills (comma-separated)
            <input
              value={form.targetSkills}
              onChange={(event) => updateForm('targetSkills', event.target.value)}
              placeholder="node,mongodb,system design"
            />
          </label>

          <label className="full">
            Resume File (PDF/DOCX)
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
            />
          </label>
        </div>

        <div className="actions">
          <button onClick={handleRunPipeline} disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Upload + Analyze + Generate Roadmap'}
          </button>
          <span className="status">Status: {statusMessage}</span>
        </div>
        {errorMessage ? <p className="error">{errorMessage}</p> : null}
      </section>

      <section className="card size-small">
        <h2>Resume</h2>
        {resume ? (
          <div className="details">
            <p><strong>File:</strong> {resume.originalName}</p>
            <p><strong>Format:</strong> {resume.fileFormat}</p>
            <p><strong>Words:</strong> {resume.metadata?.wordCount || 0}</p>
            <p><strong>Text Length:</strong> {resume.metadata?.textLength || 0}</p>
          </div>
        ) : <p>No resume uploaded yet.</p>}
      </section>

      <section className="card size-medium">
        <h2>Analysis</h2>
        {analysis ? (
          <div className="details">
            <p><strong>Candidate:</strong> {analysis.candidate_name || 'N/A'}</p>
            <p><strong>Email:</strong> {analysis.candidate_email || 'N/A'}</p>
            <p><strong>Score:</strong> {analysis.resume_score?.overall || 0} ({analysis.resume_score?.grade || 'N/A'})</p>
            <p><strong>Skills:</strong> {(analysis.skills || []).slice(0, 12).join(', ') || 'None detected'}</p>
            <p><strong>Suggestions:</strong> {(analysis.improvement_suggestions || []).join(' | ') || 'N/A'}</p>
          </div>
        ) : <p>No analysis available yet.</p>}
      </section>

      <section className="card size-large">
        <h2>Roadmap</h2>
        {roadmap ? (
          <div className="details">
            <p><strong>Title:</strong> {roadmap.roadmapTitle}</p>
            <p><strong>Duration:</strong> {roadmap.durationWeeks} weeks</p>
            <ul>
              {(roadmap.milestones || []).map((milestone) => (
                <li key={milestone.week}>
                  <strong>Week {milestone.week}:</strong> {milestone.title}
                </li>
              ))}
            </ul>
          </div>
        ) : <p>No roadmap generated yet.</p>}
      </section>

      <section className="card size-large">
        <h2>Dashboard Insights</h2>
        {insights ? (
          <div className="details">
            <p><strong>Summary:</strong> {insights.summary || 'N/A'}</p>
            <p><strong>Matched Skills:</strong> {insights.metrics?.matchedSkills || 0}</p>
            <p><strong>Missing Skills:</strong> {insights.metrics?.missingSkills || 0}</p>
            <p><strong>Resume Score:</strong> {insights.metrics?.resumeScore || 0}</p>
            <p><strong>Readiness:</strong> {insights.metrics?.roadmapReadiness || 0}</p>
            <p><strong>Top Gaps:</strong> {(insights.skillGaps || []).slice(0, 5).map((gap) => gap.skill).join(', ') || 'N/A'}</p>
          </div>
        ) : <p>No insights generated yet.</p>}
      </section>
    </div>
  );
}

export default App;
