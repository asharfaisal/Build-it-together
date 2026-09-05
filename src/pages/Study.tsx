import React, { useState, useEffect, useRef, useMemo } from 'react'
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts'
import { useApp } from '../context/AppContext'
import { Subject, StudySession } from '../types'
import { getTodayDateStr } from '../services/storage'
import {
  formatMinutesToHours,
  computeStudyStreak,
} from '../services/analyticsService'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl p-5 ${className}`}
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      {children}
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <Card className="flex flex-col gap-1">
      <div className="text-xl sm:text-2xl font-800 truncate" style={{ fontFamily: 'Plus Jakarta Sans', color }}>
        {value}
      </div>
      <div className="text-xs font-500" style={{ color: 'var(--muted-foreground)' }}>
        {label}
      </div>
    </Card>
  )
}

export default function Study() {
  const {
    subjects,
    addSubject,
    updateSubject,
    deleteSubject,
    studySessions,
    addStudySession,
    deleteStudySession,
    userProfile,
  } = useApp()

  // Selected subject & session topic
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(() => subjects[0]?.id || '')
  const [sessionTopic, setSessionTopic] = useState('JOIN Operations & Queries')
  const [sessionNotes, setSessionNotes] = useState('')

  // Timer State
  const [timerActive, setTimerActive] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [distractionFree, setDistractionFree] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Subject Modals
  const [isCreateSubjectOpen, setIsCreateSubjectOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [deletingSubjectId, setDeletingSubjectId] = useState<string | null>(null)

  // Note Modal during session
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)

  // Subject Form State
  const [subName, setSubName] = useState('')
  const [subColor, setSubColor] = useState('#19b88f')
  const [subTargetHours, setSubTargetHours] = useState(10)
  const [subTopics, setSubTopics] = useState('')

  // Selected subject object
  const activeSubject = useMemo(() => {
    return subjects.find((s) => s.id === selectedSubjectId) || subjects[0] || null
  }, [subjects, selectedSubjectId])

  // Timer interval handling
  useEffect(() => {
    if (timerActive) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1)
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [timerActive])

  // Format seconds to HH:MM:SS
  const fmt = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  // Live Calculations
  const studyStreak = useMemo(() => computeStudyStreak(studySessions), [studySessions])

  const weeklyStudyMinutes = useMemo(() => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0]
    return studySessions
      .filter((s) => s.date >= sevenDaysAgoStr)
      .reduce((acc, s) => acc + s.durationMinutes, 0)
  }, [studySessions])

  const averageSessionMinutes = useMemo(() => {
    if (studySessions.length === 0) return 0
    const total = studySessions.reduce((acc, s) => acc + s.durationMinutes, 0)
    return Math.round(total / studySessions.length)
  }, [studySessions])

  // Finish current study session
  const handleFinishSession = () => {
    if (seconds < 10) {
      setTimerActive(false)
      setSeconds(0)
      return
    }

    const durationMins = Math.max(1, Math.round(seconds / 60))
    if (activeSubject) {
      addStudySession({
        subjectId: activeSubject.id,
        subjectName: activeSubject.name,
        topic: sessionTopic.trim() || 'General Study Session',
        durationMinutes: durationMins,
        date: getTodayDateStr(),
        notes: sessionNotes.trim() || undefined,
      })
    }

    setTimerActive(false)
    setSeconds(0)
    setSessionNotes('')
    setDistractionFree(false)
  }

  // Open Subject Create Modal
  const openSubjectCreate = () => {
    setSubName('')
    setSubColor('#19b88f')
    setSubTargetHours(10)
    setSubTopics('')
    setIsCreateSubjectOpen(true)
  }

  // Open Subject Edit Modal
  const openSubjectEdit = (s: Subject) => {
    setEditingSubject(s)
    setSubName(s.name)
    setSubColor(s.color)
    setSubTargetHours(s.targetHours)
    setSubTopics(s.topics.join(', '))
  }

  // Save Subject
  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!subName.trim()) return

    const topicList = subTopics
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)

    if (editingSubject) {
      updateSubject(editingSubject.id, {
        name: subName.trim(),
        color: subColor,
        targetHours: Number(subTargetHours) || 10,
        topics: topicList.length > 0 ? topicList : editingSubject.topics,
      })
      setEditingSubject(null)
    } else {
      addSubject({
        name: subName.trim(),
        color: subColor,
        targetHours: Number(subTargetHours) || 10,
        topics: topicList.length > 0 ? topicList : ['Core Concepts'],
      })
      setIsCreateSubjectOpen(false)
    }
  }

  // Timer target angle for RadialBar
  const timerProgressPct = useMemo(() => {
    const targetSec = (userProfile.pomodoroMinutes || 45) * 60
    return Math.min(100, Math.round((seconds / targetSec) * 100))
  }, [seconds, userProfile.pomodoroMinutes])

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Distraction Free Overlay */}
      {distractionFree && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6"
          style={{ background: 'var(--background)', color: 'var(--foreground)' }}
        >
          <div className="text-center max-w-md w-full flex flex-col items-center gap-6">
            <div className="flex items-center gap-2">
              <span style={{ color: activeSubject?.color || '#19b88f', fontSize: '20px' }}>●</span>
              <span className="text-lg font-700" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                {activeSubject?.name || 'Focused Study'}
              </span>
            </div>
            <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Topic: {sessionTopic}
            </div>

            <div
              className="text-6xl sm:text-7xl font-800 tracking-wider my-4 tabular-nums"
              style={{ fontFamily: 'JetBrains Mono', color: activeSubject?.color || '#19b88f' }}
            >
              {fmt(seconds)}
            </div>

            <div className="flex gap-3 w-full justify-center">
              <button
                onClick={() => setTimerActive((a) => !a)}
                className="px-6 py-3 rounded-2xl text-sm font-700 shadow-md cursor-pointer border-none"
                style={{
                  background: timerActive ? 'var(--muted)' : '#19b88f',
                  color: timerActive ? 'var(--foreground)' : '#fff',
                }}
              >
                {timerActive ? 'Pause' : 'Resume'}
              </button>
              <button
                onClick={handleFinishSession}
                className="px-6 py-3 rounded-2xl text-sm font-700 cursor-pointer border-none"
                style={{ background: 'rgba(228,91,91,0.15)', color: '#e45b5b' }}
              >
                Finish & Save
              </button>
              <button
                onClick={() => setDistractionFree(false)}
                className="px-4 py-3 rounded-2xl text-xs font-600 cursor-pointer border-none"
                style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
              >
                Exit Focus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-800" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>
            Study & Mastery
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Track your focused learning sessions, subjects, and build long-term retention.
          </p>
        </div>
        <button
          onClick={openSubjectCreate}
          className="px-4 py-2.5 rounded-xl text-sm font-600 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
          style={{ background: '#19b88f', color: '#fff', border: 'none' }}
        >
          + Add Subject
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Study Streak" value={`${studyStreak} days 🔥`} color="#f59e0b" />
        <StatCard label="Weekly Study Time" value={formatMinutesToHours(weeklyStudyMinutes)} color="#19b88f" />
        <StatCard label="Active Subjects" value={String(subjects.length)} color="#5b8def" />
        <StatCard label="Average Session" value={formatMinutesToHours(averageSessionMinutes)} color="#a78bfa" />
      </div>

      {/* Main Grid: Subjects & Timer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Subjects list */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-700" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>
                Tracked Subjects
              </h2>
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                Click a subject to set as active timer
              </span>
            </div>

            {subjects.length === 0 ? (
              <EmptyState
                icon="📖"
                title="No subjects yet"
                description="Add your first study subject (e.g. SQL, Mathematics, Python) to begin tracking your study hours."
                actionLabel="+ Add Subject"
                onAction={openSubjectCreate}
              />
            ) : (
              <div className="flex flex-col gap-3">
                {subjects.map((s) => {
                  const isSelected = activeSubject?.id === s.id
                  const progressPct = Math.min(100, Math.round((s.studiedMinutes / (s.targetHours * 60)) * 100))
                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelectedSubjectId(s.id)}
                      className="p-3.5 rounded-2xl cursor-pointer transition-all flex flex-col gap-2 group"
                      style={{
                        background: isSelected ? `${s.color}10` : 'var(--muted)',
                        border: `1px solid ${isSelected ? `${s.color}40` : 'var(--border)'}`,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-700 shrink-0"
                            style={{ background: `${s.color}20`, color: s.color, fontFamily: 'Plus Jakarta Sans' }}
                          >
                            {s.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-700" style={{ color: 'var(--foreground)', fontFamily: 'Plus Jakarta Sans' }}>
                              {s.name}
                            </div>
                            <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                              {formatMinutesToHours(s.studiedMinutes)} studied · Target: {s.targetHours}h
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-700" style={{ color: s.color }}>
                            {progressPct}%
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              openSubjectEdit(s)
                            }}
                            className="p-1 rounded-md text-xs hover:bg-white/10 bg-transparent border-none cursor-pointer"
                            title="Edit subject"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeletingSubjectId(s.id)
                            }}
                            className="p-1 rounded-md text-xs text-red-400 hover:bg-red-500/10 bg-transparent border-none cursor-pointer"
                            title="Delete subject"
                          >
                            🗑
                          </button>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${progressPct}%`, background: s.color }}
                        />
                      </div>

                      {/* Topics tag */}
                      {s.topics && s.topics.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {s.topics.map((top, idx) => (
                            <span
                              key={idx}
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedSubjectId(s.id)
                                setSessionTopic(top)
                              }}
                              className="text-xs px-2 py-0.5 rounded-lg transition-colors"
                              style={{
                                background: sessionTopic === top && isSelected ? `${s.color}25` : 'var(--card)',
                                color: sessionTopic === top && isSelected ? s.color : 'var(--muted-foreground)',
                                border: '1px solid var(--border)',
                              }}
                            >
                              {top}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

          {/* Study History */}
          <Card>
            <h2 className="text-base font-700 mb-3" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>
              Recent Study Sessions Log
            </h2>
            {studySessions.length === 0 ? (
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                No recorded sessions yet. Use the timer on the right to log your first session.
              </p>
            ) : (
              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto scroll-thin pr-1">
                {studySessions.slice(0, 8).map((ss) => (
                  <div
                    key={ss.id}
                    className="flex items-center justify-between p-3 rounded-xl text-xs"
                    style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                      <span style={{ color: '#19b88f' }}>📖</span>
                      <span className="font-600 truncate" style={{ color: 'var(--foreground)' }}>
                        {ss.subjectName}
                      </span>
                      <span style={{ color: 'var(--muted-foreground)' }}>— {ss.topic}</span>
                      {ss.notes && (
                        <span className="truncate max-w-[140px] italic" style={{ color: 'var(--muted-foreground)' }}>
                          ("{ss.notes}")
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-700 text-emerald-500">
                        {formatMinutesToHours(ss.durationMinutes)}
                      </span>
                      <span style={{ color: 'var(--muted-foreground)' }}>{ss.date}</span>
                      <button
                        onClick={() => deleteStudySession(ss.id)}
                        className="text-red-400 hover:text-red-500 bg-transparent border-none cursor-pointer p-0.5"
                        title="Delete log"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Study Timer Card */}
        <div className="flex flex-col gap-4">
          <Card className="flex flex-col items-center py-4">
            <div className="text-xs font-700 uppercase tracking-wide mb-1" style={{ color: 'var(--muted-foreground)' }}>
              FOCUS TIMER
            </div>
            <div
              className="text-base font-700 mb-1 truncate max-w-full text-center"
              style={{ color: activeSubject?.color || '#19b88f', fontFamily: 'Plus Jakarta Sans' }}
            >
              {activeSubject?.name || 'Select a subject'}
            </div>

            {/* Topic input */}
            <input
              value={sessionTopic}
              onChange={(e) => setSessionTopic(e.target.value)}
              placeholder="Topic (e.g. Window Functions)"
              className="text-xs px-3 py-1.5 rounded-lg text-center mb-4 outline-none w-full max-w-[220px]"
              style={{
                background: 'var(--muted)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
              }}
            />

            {/* Radial Chart Timer Display */}
            <div className="relative w-44 h-44 mb-5">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="72%"
                  outerRadius="100%"
                  data={[{ value: timerProgressPct || 1, fill: activeSubject?.color || '#19b88f' }]}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar dataKey="value" cornerRadius={10} background={{ fill: 'var(--muted)' }} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span
                  className="text-2xl font-800 tabular-nums"
                  style={{ fontFamily: 'JetBrains Mono', color: 'var(--foreground)' }}
                >
                  {fmt(seconds)}
                </span>
                <span className="text-xs mt-1 capitalize" style={{ color: 'var(--muted-foreground)' }}>
                  {timerActive ? '⚡ Focused' : seconds > 0 ? '⏸ Paused' : 'Idle'}
                </span>
              </div>
            </div>

            {/* Control buttons */}
            <div className="flex gap-2 w-full">
              <button
                onClick={() => setTimerActive((a) => !a)}
                className="flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-700 transition-all cursor-pointer shadow-sm"
                style={{
                  background: timerActive ? 'var(--muted)' : activeSubject?.color || '#19b88f',
                  color: timerActive ? 'var(--foreground)' : '#fff',
                  border: 'none',
                }}
              >
                {timerActive ? 'Pause' : seconds > 0 ? 'Resume' : 'Start Focus'}
              </button>
              <button
                onClick={handleFinishSession}
                className="flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-700 cursor-pointer"
                style={{ background: 'rgba(228,91,91,0.14)', color: '#e45b5b', border: 'none' }}
              >
                Finish
              </button>
            </div>

            <div className="flex gap-2 w-full mt-2">
              <button
                onClick={() => setDistractionFree(true)}
                className="flex-1 py-2 rounded-xl text-xs font-600 cursor-pointer"
                style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: 'none' }}
              >
                Distraction-Free
              </button>
              <button
                onClick={() => setIsNoteModalOpen(true)}
                className="flex-1 py-2 rounded-xl text-xs font-600 cursor-pointer"
                style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: 'none' }}
              >
                + Note {sessionNotes ? '✓' : ''}
              </button>
            </div>
          </Card>

          {/* AI Study Recommendation */}
          <div
            className="rounded-2xl p-4"
            style={{
              background: 'linear-gradient(135deg, rgba(25,184,143,0.08), rgba(91,141,239,0.06))',
              border: '1px solid rgba(25,184,143,0.2)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span style={{ color: '#19b88f' }}>✦</span>
              <span className="text-xs font-700" style={{ color: '#19b88f' }}>
                AI Learning Strategy
              </span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              Active recall and spaced repetition yield 2.5x better retention than re-reading notes. After this session,
              test yourself on key concepts without looking at documentation!
            </p>
          </div>
        </div>
      </div>

      {/* Subject Create/Edit Modal */}
      <Modal
        isOpen={isCreateSubjectOpen || editingSubject !== null}
        onClose={() => {
          setIsCreateSubjectOpen(false)
          setEditingSubject(null)
        }}
        title={editingSubject ? 'Edit Subject' : 'Add New Subject'}
      >
        <form onSubmit={handleSaveSubject} className="flex flex-col gap-4 mt-2">
          <div>
            <label className="text-xs font-600 block mb-1">Subject Name *</label>
            <input
              required
              value={subName}
              onChange={(e) => setSubName(e.target.value)}
              placeholder="e.g. Distributed Systems"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-600 block mb-1">Target Hours</label>
              <input
                type="number"
                min="1"
                max="500"
                value={subTargetHours}
                onChange={(e) => setSubTargetHours(parseInt(e.target.value, 10) || 10)}
                className="w-full px-3 py-2 rounded-xl text-xs outline-none"
                style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
              />
            </div>
            <div>
              <label className="text-xs font-600 block mb-1">Color Theme</label>
              <input
                type="color"
                value={subColor}
                onChange={(e) => setSubColor(e.target.value)}
                className="w-full h-9 rounded-xl outline-none cursor-pointer border-none bg-transparent"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-600 block mb-1">Topics (comma separated)</label>
            <input
              value={subTopics}
              onChange={(e) => setSubTopics(e.target.value)}
              placeholder="e.g. Consensus, Raft, Paxos, Replication"
              className="w-full px-3.5 py-2 rounded-xl text-xs outline-none"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            />
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              type="button"
              onClick={() => {
                setIsCreateSubjectOpen(false)
                setEditingSubject(null)
              }}
              className="px-4 py-2 rounded-xl text-xs font-600 cursor-pointer"
              style={{ background: 'var(--muted)', color: 'var(--foreground)', border: 'none' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-600 cursor-pointer shadow-sm"
              style={{ background: '#19b88f', color: '#fff', border: 'none' }}
            >
              {editingSubject ? 'Save Changes' : 'Create Subject'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Note Modal */}
      <Modal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        title="Session Notes"
        subtitle="Attach quick notes, thoughts, or questions to this study block."
      >
        <div className="flex flex-col gap-3 mt-2">
          <textarea
            rows={4}
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            placeholder="Write key takeaways or questions..."
            className="w-full p-3 rounded-xl text-xs sm:text-sm outline-none resize-none"
            style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
          />
          <div className="flex justify-end">
            <button
              onClick={() => setIsNoteModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-600 cursor-pointer"
              style={{ background: '#19b88f', color: '#fff', border: 'none' }}
            >
              Save Note
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Subject Confirm */}
      <ConfirmDialog
        isOpen={deletingSubjectId !== null}
        onClose={() => setDeletingSubjectId(null)}
        onConfirm={() => {
          if (deletingSubjectId) deleteSubject(deletingSubjectId)
        }}
        title="Delete Subject"
        message="Are you sure you want to delete this subject? Its past study logs will remain in your total analytics."
        confirmText="Delete Subject"
        isDestructive={true}
      />
    </div>
  )
}
