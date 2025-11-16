import { useEffect, useMemo, useState } from 'react'

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Meter({ label, value, color = 'bg-blue-500' }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-mono text-gray-700">{value}</span>
      </div>
      <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-3 ${color} transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

function Section({ title, children, right }) {
  return (
    <div className="bg-white/80 backdrop-blur rounded-xl shadow p-5 border border-white/40">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        {right}
      </div>
      {children}
    </div>
  )
}

function App() {
  const [sessionId, setSessionId] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  const [publicTrust, setPublicTrust] = useState(50)
  const [personalClout, setPersonalClout] = useState(50)
  const [professionalSkill, setProfessionalSkill] = useState(0)
  const [relationships, setRelationships] = useState({})

  // Simple prebunking scenario
  const prebunkScenario = useMemo(() => ({
    id: 'p1',
    content:
      'BREAKING: Famous doctor says chocolate cures all diseases! Share NOW before it gets deleted! 🍫',
    source: 'health-tips-now.biz',
    technique: 'emotion/urgency',
    truth: 'hoax',
  }), [])

  // Ethical scenario
  const ethicalScenario = useMemo(() => ({
    id: 'e1',
    context:
      'Class group chat: A few classmates start making jokes about Alex\'s accent during a voice note.',
    options: [
      { key: 'intervene', label: 'Step in and call it out respectfully' },
      { key: 'report', label: 'Privately report to the teacher/moderator' },
      { key: 'stay_silent', label: 'Stay silent and hope it stops' },
      { key: 'participate', label: 'Join in with a joke' },
    ],
  }), [])

  // Professional scenario
  const professionalScenario = useMemo(() => ({
    id: 'pro1',
    context:
      'Virtual meeting is going off-track. Two teammates are arguing. You need a decision in 5 minutes.',
    tasks: [
      { key: 'meeting', label: 'Refocus with an agenda + action items (Success)' , success: true },
      { key: 'meeting', label: 'Ignore conflict and end meeting (Fail)', success: false },
    ],
  }), [])

  const randomSession = () =>
    'sess_' + Math.random().toString(36).slice(2, 8) + Date.now().toString().slice(-4)

  const startSession = async () => {
    const id = sessionId || randomSession()
    setSessionId(id)
    setLoading(true)
    setStatus('Connecting...')
    try {
      const res = await fetch(`${BACKEND}/api/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: id }),
      })
      const data = await res.json()
      setPublicTrust(data.public_trust)
      setPersonalClout(data.personal_clout)
      setProfessionalSkill(data.professional_skill)
      setRelationships(data.relationships || {})
      setStatus('Session ready')
    } catch (e) {
      setStatus('Failed to start. Check backend URL.')
    } finally {
      setLoading(false)
    }
  }

  const submitChoice = async ({ module, action_type, payload }) => {
    if (!sessionId) {
      setStatus('Start a session first')
      return
    }
    setLoading(true)
    setStatus('Submitting...')
    try {
      const res = await fetch(`${BACKEND}/api/choice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, module, action_type, payload }),
      })
      const data = await res.json()
      if (res.ok) {
        setPublicTrust(data.public_trust)
        setPersonalClout(data.personal_clout)
        setProfessionalSkill(data.professional_skill)
        setRelationships(data.relationships || {})
        setStatus(data.outcome?.message || 'Updated')
      } else {
        setStatus(data?.detail || 'Error')
      }
    } catch (e) {
      setStatus('Network error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Auto-generate a session id on first load (not started until user clicks)
    if (!sessionId) setSessionId(randomSession())
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-cyan-50">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <header className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-800">
            Litera — Media Literacy, Ethics, and Professional Communication
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            An integrated learning game with three modules: Prebunking, Ethical Dilemmas, and Professional Communication.
          </p>
        </header>

        <Section
          title="Your Session"
          right={
            <div className="flex items-center gap-2">
              <input
                className="px-3 py-2 rounded border text-sm w-56"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
              />
              <button
                onClick={startSession}
                className="px-3 py-2 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-60"
                disabled={loading}
              >
                {loading ? 'Starting...' : 'Start / Resume'}
              </button>
            </div>
          }
        >
          <div className="grid md:grid-cols-3 gap-5">
            <Meter label="Public Trust" value={publicTrust} color="bg-emerald-500" />
            <Meter label="Personal Clout" value={personalClout} color="bg-fuchsia-500" />
            <Meter label="Professional Skill" value={professionalSkill} color="bg-sky-500" />
          </div>
          {status && (
            <p className="text-sm text-gray-700 mt-3">
              Status: <span className="font-medium">{status}</span>
            </p>
          )}
        </Section>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Prebunking */}
          <Section title="Module 1 — Prebunking: Spot the Manipulation">
            <div className="space-y-3">
              <div className="rounded-md border p-3 bg-white">
                <p className="text-gray-800">{prebunkScenario.content}</p>
                <p className="text-xs text-gray-500 mt-1">Source: {prebunkScenario.source} · Technique: {prebunkScenario.technique}</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {['verified', 'misleading', 'hoax'].map((lbl) => (
                  <button
                    key={lbl}
                    onClick={() =>
                      submitChoice({
                        module: 'prebunking',
                        action_type: 'label_post',
                        payload: { post_id: prebunkScenario.id, label: lbl, truth: prebunkScenario.truth },
                      })
                    }
                    className="px-3 py-2 rounded bg-emerald-600/90 hover:bg-emerald-700 text-white text-sm"
                  >
                    {lbl.charAt(0).toUpperCase() + lbl.slice(1)}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-600">Choose a label. Your decision impacts Trust and Clout.</p>
            </div>
          </Section>

          {/* Ethical Dilemma */}
          <Section title="Module 2 — Ethical Dilemma: Cyberbullying">
            <p className="text-gray-700 mb-3">{ethicalScenario.context}</p>
            <div className="space-y-2">
              {ethicalScenario.options.map((o) => (
                <button
                  key={o.key}
                  onClick={() =>
                    submitChoice({
                      module: 'ethical',
                      action_type: 'chat_decision',
                      payload: { choice: o.key },
                    })
                  }
                  className="w-full text-left px-3 py-2 rounded border hover:bg-gray-50"
                >
                  {o.label}
                </button>
              ))}
            </div>
            <div className="mt-3 text-xs text-gray-600">
              Relationship snapshot: {Object.keys(relationships).length ? (
                <span className="font-mono">{JSON.stringify(relationships)}</span>
              ) : (
                'no interactions yet'
              )}
            </div>
          </Section>

          {/* Professional Communication */}
          <Section title="Module 3 — Professional Communication">
            <p className="text-gray-700 mb-3">{professionalScenario.context}</p>
            <div className="space-y-2">
              {professionalScenario.tasks.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    submitChoice({
                      module: 'professional',
                      action_type: 'task_attempt',
                      payload: { task: t.key, success: t.success },
                    })
                  }
                  className={`w-full text-left px-3 py-2 rounded border hover:bg-gray-50 ${t.success ? 'border-emerald-300' : 'border-rose-300'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-2">Successful choices level up Professional skill and earn a bit of Trust.</p>
          </Section>
        </div>

        <footer className="text-center text-xs text-gray-500 pt-4">
          Backend: <span className="font-mono">{BACKEND}</span> · Try the diagnostics at <a className="underline" href="/test">/test</a>
        </footer>
      </div>
    </div>
  )
}

export default App
