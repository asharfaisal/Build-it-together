import React, { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useApp } from '../context/AppContext'
import { Workout, Exercise } from '../types'
import { getTodayDateStr } from '../services/storage'
import {
  formatMinutesToHours,
  computeWorkoutStreak,
  computeWorkoutVolumeData,
  computeWorkoutPRs,
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

export default function WorkoutPage() {
  const {
    workouts,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    toggleWorkoutStatus,
    addExerciseToWorkout,
    addSetToExercise,
    deleteSetFromExercise,
    updateSetInExercise,
    userProfile,
  } = useApp()

  // Selected Workout & Active Exercise
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>(() => workouts[0]?.id || '')
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number>(0)

  // Modals
  const [isCreateWorkoutOpen, setIsCreateWorkoutOpen] = useState(false)
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null)
  const [deletingWorkoutId, setDeletingWorkoutId] = useState<string | null>(null)

  // New Exercise Modal
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false)
  const [newExerciseName, setNewExerciseName] = useState('')

  // New Set Form State
  const [isAddSetOpen, setIsAddSetOpen] = useState(false)
  const [newSetWeight, setNewSetWeight] = useState<number>(60)
  const [newSetReps, setNewSetReps] = useState<number>(8)

  // Workout Form State
  const [formName, setFormName] = useState('')
  const [formCategory, setFormCategory] = useState<Workout['category']>('Upper Body')
  const [formDuration, setFormDuration] = useState(45)
  const [formDate, setFormDate] = useState(getTodayDateStr())

  // Selected workout object
  const activeWorkout = useMemo(() => {
    return workouts.find((w) => w.id === selectedWorkoutId) || workouts[0] || null
  }, [workouts, selectedWorkoutId])

  // Active exercise object in selected workout
  const activeExercise: Exercise | null = useMemo(() => {
    if (!activeWorkout || activeWorkout.exercises.length === 0) return null
    return activeWorkout.exercises[activeExerciseIndex] || activeWorkout.exercises[0] || null
  }, [activeWorkout, activeExerciseIndex])

  // Live Calculations
  const workoutStreak = useMemo(() => computeWorkoutStreak(workouts), [workouts])
  const volumeData = useMemo(() => computeWorkoutVolumeData(workouts), [workouts])
  const personalRecords = useMemo(() => computeWorkoutPRs(workouts), [workouts])

  const weeklyWorkoutsDone = useMemo(() => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0]
    return workouts.filter((w) => w.status === 'Completed' && w.date >= sevenDaysAgoStr).length
  }, [workouts])

  const totalTrainingMinutes = useMemo(() => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0]
    return workouts
      .filter((w) => w.status === 'Completed' && w.date >= sevenDaysAgoStr)
      .reduce((acc, w) => acc + w.durationMinutes, 0)
  }, [workouts])

  // Open Create Workout Modal
  const openCreateWorkout = () => {
    setFormName('')
    setFormCategory('Upper Body')
    setFormDuration(45)
    setFormDate(getTodayDateStr())
    setIsCreateWorkoutOpen(true)
  }

  // Open Edit Workout Modal
  const openEditWorkout = (w: Workout) => {
    setEditingWorkout(w)
    setFormName(w.name)
    setFormCategory(w.category)
    setFormDuration(w.durationMinutes)
    setFormDate(w.date)
  }

  // Save Workout
  const handleSaveWorkout = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) return

    const categoryColors: Record<string, string> = {
      'Upper Body': '#19b88f',
      Legs: '#5b8def',
      Cardio: '#f59e0b',
      'Core & Abs': '#a78bfa',
      'Full Body': '#ec4899',
      Push: '#14b8a6',
      Pull: '#3b82f6',
      Other: '#8b5cf6',
    }

    if (editingWorkout) {
      updateWorkout(editingWorkout.id, {
        name: formName.trim(),
        category: formCategory,
        durationMinutes: Number(formDuration) || 45,
        date: formDate,
        color: categoryColors[formCategory] || '#19b88f',
      })
      setEditingWorkout(null)
    } else {
      addWorkout({
        name: formName.trim(),
        category: formCategory,
        durationMinutes: Number(formDuration) || 45,
        status: 'Planned',
        date: formDate,
        color: categoryColors[formCategory] || '#19b88f',
        exercises: [
          {
            id: `ex-${Date.now()}-1`,
            name: `${formCategory} Exercise #1`,
            sets: [
              { id: `s-${Date.now()}-1`, setNumber: 1, weightKg: 50, reps: 10, completed: true },
              { id: `s-${Date.now()}-2`, setNumber: 2, weightKg: 55, reps: 8, completed: true },
            ],
          },
        ],
      })
      setIsCreateWorkoutOpen(false)
    }
  }

  // Add Exercise to active workout
  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeWorkout || !newExerciseName.trim()) return
    addExerciseToWorkout(activeWorkout.id, newExerciseName.trim())
    setNewExerciseName('')
    setIsAddExerciseOpen(false)
  }

  // Add Set to active exercise
  const handleAddSet = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeWorkout || !activeExercise) return
    const nextSetNumber = activeExercise.sets.length + 1
    addSetToExercise(activeWorkout.id, activeExercise.id, {
      setNumber: nextSetNumber,
      weightKg: Number(newSetWeight) || 0,
      reps: Number(newSetReps) || 8,
      completed: true,
    })
    setIsAddSetOpen(false)
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-800" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>
            Workout & Fitness Tracking
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Log progressive sets, track training volume, and smash personal records.
          </p>
        </div>
        <button
          onClick={openCreateWorkout}
          className="px-4 py-2.5 rounded-xl text-sm font-600 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
          style={{ background: '#19b88f', color: '#fff', border: 'none' }}
        >
          + Create Workout
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex flex-col gap-1">
          <div className="text-xl sm:text-2xl font-800 truncate" style={{ fontFamily: 'Plus Jakarta Sans', color: '#19b88f' }}>
            {weeklyWorkoutsDone} / {userProfile.workoutGoalPerWeek || 4}
          </div>
          <div className="text-xs font-500" style={{ color: 'var(--muted-foreground)' }}>
            Weekly Workouts
          </div>
        </Card>

        <Card className="flex flex-col gap-1">
          <div className="text-xl sm:text-2xl font-800 truncate" style={{ fontFamily: 'Plus Jakarta Sans', color: '#f59e0b' }}>
            {workoutStreak} days 🔥
          </div>
          <div className="text-xs font-500" style={{ color: 'var(--muted-foreground)' }}>
            Workout Streak
          </div>
        </Card>

        <Card className="flex flex-col gap-1">
          <div className="text-xl sm:text-2xl font-800 truncate" style={{ fontFamily: 'Plus Jakarta Sans', color: '#5b8def' }}>
            {formatMinutesToHours(totalTrainingMinutes)}
          </div>
          <div className="text-xs font-500" style={{ color: 'var(--muted-foreground)' }}>
            Weekly Training Time
          </div>
        </Card>

        <Card className="flex flex-col gap-1">
          <div className="text-xl sm:text-2xl font-800 truncate" style={{ fontFamily: 'Plus Jakarta Sans', color: '#a78bfa' }}>
            +{Math.min(18, Object.keys(personalRecords).length * 2.8).toFixed(1)}%
          </div>
          <div className="text-xs font-500" style={{ color: 'var(--muted-foreground)' }}>
            Strength Progress
          </div>
        </Card>
      </div>

      {/* Main Area: Workout List & Exercise Logger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Workout list & Volume Chart */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-700" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>
                Workouts Schedule & History
              </h2>
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                Click to log exercises
              </span>
            </div>

            {workouts.length === 0 ? (
              <EmptyState
                icon="💪"
                title="No workouts recorded"
                description="Create your first workout routine to start tracking exercises, sets, and volume."
                actionLabel="+ Create Workout"
                onAction={openCreateWorkout}
              />
            ) : (
              <div className="flex flex-col gap-3">
                {workouts.map((w) => {
                  const isSelected = activeWorkout?.id === w.id
                  return (
                    <div
                      key={w.id}
                      onClick={() => {
                        setSelectedWorkoutId(w.id)
                        setActiveExerciseIndex(0)
                      }}
                      className="p-4 rounded-2xl flex items-center gap-3.5 transition-all cursor-pointer group"
                      style={{
                        background: isSelected ? `${w.color}10` : 'var(--muted)',
                        border: `1px solid ${isSelected ? `${w.color}40` : 'var(--border)'}`,
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg font-700"
                        style={{ background: `${w.color}18`, color: w.color }}
                      >
                        💪
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-700 truncate" style={{ color: 'var(--foreground)', fontFamily: 'Plus Jakarta Sans' }}>
                            {w.name}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleWorkoutStatus(w.id)
                            }}
                            className="text-xs px-2.5 py-0.5 rounded-full font-600 transition-all cursor-pointer border-none"
                            style={{
                              background: w.status === 'Completed' ? 'rgba(25,184,143,0.18)' : 'rgba(245,158,11,0.18)',
                              color: w.status === 'Completed' ? '#19b88f' : '#f59e0b',
                            }}
                            title="Click to toggle status"
                          >
                            {w.status === 'Completed' ? '✓ Completed' : '⏱ Planned'}
                          </button>
                        </div>

                        <div className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
                          {w.durationMinutes} min · {w.exercises.map((e) => e.name).join(', ') || 'No exercises yet'}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            openEditWorkout(w)
                          }}
                          className="p-1.5 rounded-lg text-xs hover:bg-white/10 bg-transparent border-none cursor-pointer"
                          title="Edit workout"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeletingWorkoutId(w.id)
                          }}
                          className="p-1.5 rounded-lg text-xs text-red-400 hover:bg-red-500/10 bg-transparent border-none cursor-pointer"
                          title="Delete workout"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

          {/* Volume Chart */}
          <Card>
            <h2 className="text-base font-700 mb-4" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>
              Weekly Training Volume (kg × reps)
            </h2>
            <div className="h-[140px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeData} barSize={28}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '10px',
                      color: 'var(--foreground)',
                      fontSize: '12px',
                    }}
                    formatter={(v) => [`${v} kg`, 'Total Volume']}
                  />
                  <Bar dataKey="volume" fill="#19b88f" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Exercise Logger for Active Workout */}
        <Card className="flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-700 truncate" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>
              {activeWorkout ? activeWorkout.name : 'Exercise Logger'}
            </h2>
            {activeWorkout && (
              <button
                onClick={() => setIsAddExerciseOpen(true)}
                className="text-xs font-600 text-emerald-500 hover:underline bg-transparent border-none cursor-pointer"
              >
                + Exercise
              </button>
            )}
          </div>

          {!activeWorkout ? (
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              Select a workout from the left to view and log exercise sets.
            </p>
          ) : activeWorkout.exercises.length === 0 ? (
            <div className="py-8 text-center flex flex-col items-center gap-2">
              <span style={{ fontSize: '24px' }}>🏋️</span>
              <p className="text-xs text-muted-foreground">No exercises added to this workout yet.</p>
              <button
                onClick={() => setIsAddExerciseOpen(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-600 bg-emerald-500 text-white border-none cursor-pointer"
              >
                + Add First Exercise
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 flex-1">
              {/* Exercise Selector Tabs */}
              <div className="flex flex-col gap-1">
                {activeWorkout.exercises.map((ex, idx) => {
                  const isSelected = activeExerciseIndex === idx
                  const bestPr = personalRecords[ex.name] || ex.personalBestKg
                  return (
                    <button
                      key={ex.id}
                      onClick={() => setActiveExerciseIndex(idx)}
                      className="text-left px-3 py-2 rounded-xl text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer"
                      style={{
                        background: isSelected ? 'rgba(25,184,143,0.12)' : 'transparent',
                        color: isSelected ? '#19b88f' : 'var(--muted-foreground)',
                        border: `1px solid ${isSelected ? 'rgba(25,184,143,0.3)' : 'transparent'}`,
                        fontWeight: isSelected ? 700 : 500,
                      }}
                    >
                      <span className="truncate flex-1">{ex.name}</span>
                      {bestPr && (
                        <span className="text-xs px-1.5 py-0.2 rounded-full font-600 text-amber-500 shrink-0">
                          PR: {bestPr}kg
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Active Exercise Sets Log */}
              {activeExercise && (
                <div
                  className="p-3.5 rounded-2xl flex flex-col gap-3"
                  style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-700" style={{ color: 'var(--foreground)', fontFamily: 'Plus Jakarta Sans' }}>
                        {activeExercise.name}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        {activeExercise.sets.length} total set(s)
                      </div>
                    </div>
                    {personalRecords[activeExercise.name] && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-600"
                        style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}
                      >
                        PR: {personalRecords[activeExercise.name]} kg
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    {activeExercise.sets.map((s, idx) => (
                      <div
                        key={s.id || idx}
                        className="flex items-center justify-between p-2 rounded-xl text-xs transition-colors"
                        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                      >
                        <span className="font-600" style={{ color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono' }}>
                          Set {s.setNumber || idx + 1}
                        </span>
                        <span className="font-700 text-sm" style={{ color: 'var(--foreground)' }}>
                          {s.weightKg} kg × {s.reps} reps
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() =>
                              updateSetInExercise(activeWorkout.id, activeExercise.id, s.id, {
                                completed: !s.completed,
                              })
                            }
                            className="w-5 h-5 rounded-md flex items-center justify-center text-xs font-700 cursor-pointer transition-colors"
                            style={{
                              background: s.completed ? '#19b88f' : 'var(--muted)',
                              color: s.completed ? '#fff' : 'var(--muted-foreground)',
                              border: 'none',
                            }}
                            title="Toggle completed"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => deleteSetFromExercise(activeWorkout.id, activeExercise.id, s.id)}
                            className="text-xs text-red-400 p-1 bg-transparent border-none cursor-pointer"
                            title="Delete set"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setIsAddSetOpen(true)}
                    className="w-full py-2.5 rounded-xl text-xs font-700 cursor-pointer transition-all"
                    style={{
                      background: 'rgba(25,184,143,0.15)',
                      color: '#19b88f',
                      border: '1px dashed rgba(25,184,143,0.4)',
                    }}
                  >
                    + Log New Set
                  </button>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Create / Edit Workout Modal */}
      <Modal
        isOpen={isCreateWorkoutOpen || editingWorkout !== null}
        onClose={() => {
          setIsCreateWorkoutOpen(false)
          setEditingWorkout(null)
        }}
        title={editingWorkout ? 'Edit Workout' : 'Create Workout'}
      >
        <form onSubmit={handleSaveWorkout} className="flex flex-col gap-4 mt-2">
          <div>
            <label className="text-xs font-600 block mb-1">Workout Name *</label>
            <input
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Upper Body Hypertrophy"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-600 block mb-1">Category</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as any)}
                className="w-full px-2.5 py-2.5 rounded-xl text-xs outline-none"
                style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
              >
                <option value="Upper Body">Upper Body</option>
                <option value="Legs">Legs</option>
                <option value="Cardio">Cardio</option>
                <option value="Core & Abs">Core & Abs</option>
                <option value="Full Body">Full Body</option>
                <option value="Push">Push</option>
                <option value="Pull">Pull</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-600 block mb-1">Duration (min)</label>
              <input
                type="number"
                min="10"
                step="5"
                value={formDuration}
                onChange={(e) => setFormDuration(parseInt(e.target.value, 10) || 45)}
                className="w-full px-3 py-2.5 rounded-xl text-xs outline-none"
                style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
              />
            </div>

            <div>
              <label className="text-xs font-600 block mb-1">Date</label>
              <input
                type="date"
                required
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs outline-none"
                style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              type="button"
              onClick={() => {
                setIsCreateWorkoutOpen(false)
                setEditingWorkout(null)
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
              {editingWorkout ? 'Save Changes' : 'Create Workout'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Exercise Modal */}
      <Modal
        isOpen={isAddExerciseOpen}
        onClose={() => setIsAddExerciseOpen(false)}
        title="Add Exercise"
        subtitle={`Add a new movement to ${activeWorkout?.name || 'this workout'}`}
      >
        <form onSubmit={handleAddExercise} className="flex flex-col gap-4 mt-2">
          <div>
            <label className="text-xs font-600 block mb-1">Exercise Name *</label>
            <input
              required
              value={newExerciseName}
              onChange={(e) => setNewExerciseName(e.target.value)}
              placeholder="e.g. Incline Dumbbell Bench Press"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddExerciseOpen(false)}
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
              Add Movement
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Set Modal */}
      <Modal
        isOpen={isAddSetOpen}
        onClose={() => setIsAddSetOpen(false)}
        title={`Log Set — ${activeExercise?.name || 'Exercise'}`}
      >
        <form onSubmit={handleAddSet} className="flex flex-col gap-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-600 block mb-1">Weight (kg)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={newSetWeight}
                onChange={(e) => setNewSetWeight(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
              />
            </div>
            <div>
              <label className="text-xs font-600 block mb-1">Reps</label>
              <input
                type="number"
                min="1"
                max="100"
                value={newSetReps}
                onChange={(e) => setNewSetReps(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => setIsAddSetOpen(false)}
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
              Record Set
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Workout Confirmation */}
      <ConfirmDialog
        isOpen={deletingWorkoutId !== null}
        onClose={() => setDeletingWorkoutId(null)}
        onConfirm={() => {
          if (deletingWorkoutId) deleteWorkout(deletingWorkoutId)
        }}
        title="Delete Workout"
        message="Are you sure you want to delete this workout routine and its logged exercise sets?"
        confirmText="Delete Workout"
        isDestructive={true}
      />
    </div>
  )
}
