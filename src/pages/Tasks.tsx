import React, { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { Task, Priority, TaskCategory } from '../types'
import { getTodayDateStr } from '../services/storage'
import { parseNaturalLanguageTasks, ParsedTaskCandidate } from '../services/aiService'
import { formatMinutesToHours } from '../services/analyticsService'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'

const priorityColor: Record<Priority, string> = {
  High: '#e45b5b',
  Medium: '#f59e0b',
  Low: '#19b88f',
}

export default function Tasks() {
  const { tasks, addTask, updateTask, deleteTask, toggleTask } = useApp()

  // State
  const [activeCategory, setActiveCategory] = useState<TaskCategory>('Today')
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<'All' | Priority>('All')
  const [sortBy, setSortBy] = useState<'newest' | 'dueDate' | 'priority' | 'estTime'>('newest')

  // Natural language AI state
  const [aiInput, setAiInput] = useState('')
  const [aiDetected, setAiDetected] = useState<ParsedTaskCandidate[] | null>(null)
  const [showAiPreview, setShowAiPreview] = useState(false)

  // Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null)

  // Task form state
  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formPriority, setFormPriority] = useState<Priority>('Medium')
  const [formDueDate, setFormDueDate] = useState(getTodayDateStr())
  const [formEstMinutes, setFormEstMinutes] = useState(60)

  const todayStr = getTodayDateStr()

  // Helper to categorize tasks dynamically
  const getTaskCategory = (task: Task): TaskCategory => {
    if (task.done) return 'Completed'
    if (task.dueDate === todayStr) return 'Today'
    if (task.dueDate < todayStr) return 'Overdue'
    return 'Upcoming'
  }

  // Counts
  const categoryCounts: Record<TaskCategory, number> = useMemo(() => {
    return {
      Today: tasks.filter((t) => !t.done && t.dueDate === todayStr).length,
      Upcoming: tasks.filter((t) => !t.done && t.dueDate > todayStr).length,
      Completed: tasks.filter((t) => t.done).length,
      Overdue: tasks.filter((t) => !t.done && t.dueDate < todayStr).length,
    }
  }, [tasks, todayStr])

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        const cat = getTaskCategory(task)
        if (cat !== activeCategory) return false

        if (priorityFilter !== 'All' && task.priority !== priorityFilter) return false

        if (search.trim()) {
          const q = search.toLowerCase()
          return (
            task.title.toLowerCase().includes(q) ||
            task.desc.toLowerCase().includes(q)
          )
        }
        return true
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        }
        if (sortBy === 'dueDate') {
          return a.dueDate.localeCompare(b.dueDate)
        }
        if (sortBy === 'priority') {
          const pOrder = { High: 1, Medium: 2, Low: 3 }
          return pOrder[a.priority] - pOrder[b.priority]
        }
        if (sortBy === 'estTime') {
          return (b.estMinutes || 0) - (a.estMinutes || 0)
        }
        return 0
      })
  }, [tasks, activeCategory, priorityFilter, search, sortBy, todayStr])

  // AI submit
  const handleAiGenerate = () => {
    if (!aiInput.trim()) return
    const parsed = parseNaturalLanguageTasks(aiInput)
    setAiDetected(parsed)
    setShowAiPreview(true)
  }

  const handleAddAiDetectedTasks = () => {
    if (!aiDetected || aiDetected.length === 0) return
    aiDetected.forEach((c) => {
      addTask({
        title: c.title,
        desc: c.desc,
        priority: c.priority,
        dueDate: c.dueDate,
        estMinutes: c.estMinutes,
        done: false,
        ai: true,
      })
    })
    setAiInput('')
    setAiDetected(null)
    setShowAiPreview(false)
  }

  const handleRemoveAiCandidate = (candId: string) => {
    if (!aiDetected) return
    const updated = aiDetected.filter((c) => c.id !== candId)
    setAiDetected(updated)
    if (updated.length === 0) setShowAiPreview(false)
  }

  // Open Create Modal
  const openCreateModal = () => {
    setFormTitle('')
    setFormDesc('')
    setFormPriority('Medium')
    setFormDueDate(getTodayDateStr())
    setFormEstMinutes(60)
    setIsCreateOpen(true)
  }

  // Open Edit Modal
  const openEditModal = (task: Task) => {
    setEditingTask(task)
    setFormTitle(task.title)
    setFormDesc(task.desc)
    setFormPriority(task.priority)
    setFormDueDate(task.dueDate)
    setFormEstMinutes(task.estMinutes)
  }

  // Submit Task Form (Create or Edit)
  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim()) return

    if (editingTask) {
      updateTask(editingTask.id, {
        title: formTitle.trim(),
        desc: formDesc.trim(),
        priority: formPriority,
        dueDate: formDueDate,
        estMinutes: Number(formEstMinutes) || 60,
      })
      setEditingTask(null)
    } else {
      addTask({
        title: formTitle.trim(),
        desc: formDesc.trim() || 'Custom user task',
        priority: formPriority,
        dueDate: formDueDate,
        estMinutes: Number(formEstMinutes) || 60,
        done: false,
      })
      setIsCreateOpen(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-800" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>
            Tasks & Objectives
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Organize assignments, prioritize deadlines, and track completion.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl text-sm font-600 shadow-sm transition-all self-start sm:self-auto cursor-pointer"
          style={{ background: '#19b88f', color: '#fff', border: 'none' }}
        >
          + Add Task
        </button>
      </div>

      {/* AI Task Creation Bar */}
      <div
        className="rounded-2xl p-4 transition-all"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span style={{ color: '#19b88f', fontSize: '15px' }}>✦</span>
          <span className="text-xs font-700 uppercase tracking-wide" style={{ color: 'var(--foreground)', fontFamily: 'Plus Jakarta Sans' }}>
            Natural Language AI Task Creator
          </span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
            placeholder="e.g. Study SQL for 2 hours tomorrow and finish database assignment high priority"
            className="flex-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm outline-none transition-colors"
            style={{
              background: 'var(--muted)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            }}
          />
          <button
            onClick={handleAiGenerate}
            disabled={!aiInput.trim()}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-600 transition-all cursor-pointer disabled:opacity-50"
            style={{ background: 'rgba(25,184,143,0.15)', color: '#19b88f', border: 'none' }}
          >
            Detect & Plan
          </button>
        </div>

        {/* AI Preview Box */}
        {showAiPreview && aiDetected && (
          <div
            className="mt-4 p-4 rounded-2xl animate-in fade-in"
            style={{ background: 'rgba(25,184,143,0.06)', border: '1px solid rgba(25,184,143,0.25)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-700" style={{ color: '#19b88f' }}>
                AI Detected {aiDetected.length} Task(s):
              </div>
              <button
                onClick={() => setShowAiPreview(false)}
                className="text-xs text-muted-foreground bg-transparent border-none cursor-pointer"
              >
                Dismiss
              </button>
            </div>

            <div className="flex flex-col gap-2 my-2">
              {aiDetected.map((cand) => (
                <div
                  key={cand.id}
                  className="flex items-center justify-between p-2.5 rounded-xl text-xs"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                    <span style={{ color: '#19b88f' }}>✓</span>
                    <span className="font-600 truncate" style={{ color: 'var(--foreground)' }}>
                      {cand.title}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${priorityColor[cand.priority]}18`, color: priorityColor[cand.priority] }}>
                      {cand.priority}
                    </span>
                    <span style={{ color: 'var(--muted-foreground)' }}>
                      ⏱ {cand.estFormatted}
                    </span>
                    <span style={{ color: 'var(--muted-foreground)' }}>
                      📅 {cand.dueDate === todayStr ? 'Today' : cand.dueDate}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveAiCandidate(cand.id)}
                    className="text-xs text-red-400 p-1 bg-transparent border-none cursor-pointer"
                    title="Remove item"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleAddAiDetectedTasks}
                className="px-4 py-2 rounded-xl text-xs font-600 cursor-pointer"
                style={{ background: '#19b88f', color: '#fff', border: 'none' }}
              >
                Add All Tasks to LifeTrack
              </button>
              <button
                onClick={() => setShowAiPreview(false)}
                className="px-4 py-2 rounded-xl text-xs font-500 cursor-pointer"
                style={{ background: 'var(--muted)', color: 'var(--foreground)', border: 'none' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Search, Filters, and Sorting controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
            🔍
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or description..."
            className="w-full pl-8 pr-4 py-2 rounded-xl text-xs sm:text-sm outline-none"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            }}
          />
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl text-xs outline-none cursor-pointer"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
          >
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Sort selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-xl text-xs outline-none cursor-pointer"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
          >
            <option value="newest">Sort: Newest</option>
            <option value="dueDate">Sort: Due Date</option>
            <option value="priority">Sort: Priority</option>
            <option value="estTime">Sort: Duration</option>
          </select>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scroll-thin">
        {(['Today', 'Upcoming', 'Completed', 'Overdue'] as TaskCategory[]).map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer shrink-0"
            style={{
              background: activeCategory === c ? '#19b88f' : 'var(--card)',
              color: activeCategory === c ? '#fff' : 'var(--muted-foreground)',
              border: `1px solid ${activeCategory === c ? '#19b88f' : 'var(--border)'}`,
              fontWeight: activeCategory === c ? 600 : 400,
            }}
          >
            {c}
            <span
              className="text-xs px-1.5 py-0.2 rounded-full"
              style={{
                background: activeCategory === c ? 'rgba(255,255,255,0.25)' : 'var(--muted)',
                color: activeCategory === c ? '#fff' : 'var(--muted-foreground)',
                fontWeight: 600,
              }}
            >
              {categoryCounts[c]}
            </span>
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="flex flex-col gap-2.5">
        {filteredTasks.length === 0 ? (
          <EmptyState
            icon={activeCategory === 'Completed' ? '🏆' : '✓'}
            title={`No ${activeCategory.toLowerCase()} tasks found`}
            description={
              search || priorityFilter !== 'All'
                ? 'Try adjusting your search query or filters.'
                : activeCategory === 'Completed'
                ? 'Check off tasks as you finish them to see your completed log.'
                : 'You have cleared all tasks in this section. Add a new task or use AI to plan your work.'
            }
            actionLabel="+ Create Task"
            onAction={openCreateModal}
          />
        ) : (
          filteredTasks.map((t) => (
            <div
              key={t.id}
              className="flex items-start gap-3.5 p-4 rounded-2xl transition-all group"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                opacity: t.done ? 0.65 : 1,
              }}
            >
              {/* Checkbox button */}
              <button
                onClick={() => toggleTask(t.id)}
                className="w-5 h-5 rounded-md mt-0.5 shrink-0 flex items-center justify-center transition-all cursor-pointer"
                style={{
                  background: t.done ? '#19b88f' : 'transparent',
                  border: `2px solid ${t.done ? '#19b88f' : 'var(--border)'}`,
                }}
                title={t.done ? 'Mark pending' : 'Mark completed'}
                aria-label={`Mark task ${t.title} ${t.done ? 'incomplete' : 'complete'}`}
              >
                {t.done && <span style={{ color: '#fff', fontSize: '11px', fontWeight: 700 }}>✓</span>}
              </button>

              {/* Task Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span
                    className="text-sm font-600"
                    style={{
                      color: 'var(--foreground)',
                      textDecoration: t.done ? 'line-through' : 'none',
                      fontFamily: 'Plus Jakarta Sans',
                    }}
                  >
                    {t.title}
                  </span>
                  {t.ai && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full font-600"
                      style={{ background: 'rgba(25,184,143,0.12)', color: '#19b88f', fontSize: '10px' }}
                    >
                      ✦ AI
                    </span>
                  )}
                </div>

                {t.desc && (
                  <div className="text-xs mb-2 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                    {t.desc}
                  </div>
                )}

                <div className="flex items-center gap-2.5 flex-wrap">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-600"
                    style={{ background: `${priorityColor[t.priority]}18`, color: priorityColor[t.priority] }}
                  >
                    {t.priority}
                  </span>
                  <span className="text-xs flex items-center gap-1" style={{ color: 'var(--muted-foreground)' }}>
                    📅 {t.dueDate === todayStr ? 'Today' : t.dueDate}
                  </span>
                  <span className="text-xs flex items-center gap-1" style={{ color: 'var(--muted-foreground)' }}>
                    ⏱ {formatMinutesToHours(t.estMinutes)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditModal(t)}
                  className="p-1.5 rounded-lg text-xs hover:bg-white/10 transition-colors bg-transparent border-none cursor-pointer"
                  title="Edit task"
                >
                  ✏️
                </button>
                <button
                  onClick={() => setDeletingTaskId(t.id)}
                  className="p-1.5 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors bg-transparent border-none cursor-pointer"
                  title="Delete task"
                >
                  🗑
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Task Modal */}
      <Modal
        isOpen={isCreateOpen || editingTask !== null}
        onClose={() => {
          setIsCreateOpen(false)
          setEditingTask(null)
        }}
        title={editingTask ? 'Edit Task' : 'Create New Task'}
        subtitle="Manage details, priority, and timeline estimate."
      >
        <form onSubmit={handleSaveTask} className="flex flex-col gap-4 mt-2">
          <div>
            <label className="text-xs font-600 block mb-1" style={{ color: 'var(--foreground)' }}>
              Task Title *
            </label>
            <input
              required
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Complete Database Presentation"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            />
          </div>

          <div>
            <label className="text-xs font-600 block mb-1" style={{ color: 'var(--foreground)' }}>
              Description
            </label>
            <textarea
              rows={2}
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="Details or subtasks..."
              className="w-full px-3.5 py-2 rounded-xl text-sm outline-none resize-none"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-600 block mb-1" style={{ color: 'var(--foreground)' }}>
                Priority
              </label>
              <select
                value={formPriority}
                onChange={(e) => setFormPriority(e.target.value as Priority)}
                className="w-full px-3 py-2.5 rounded-xl text-xs outline-none"
                style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-600 block mb-1" style={{ color: 'var(--foreground)' }}>
                Due Date
              </label>
              <input
                type="date"
                required
                value={formDueDate}
                onChange={(e) => setFormDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs outline-none"
                style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
              />
            </div>

            <div>
              <label className="text-xs font-600 block mb-1" style={{ color: 'var(--foreground)' }}>
                Est. Minutes
              </label>
              <input
                type="number"
                min="5"
                step="5"
                value={formEstMinutes}
                onChange={(e) => setFormEstMinutes(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2.5 rounded-xl text-xs outline-none"
                style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              type="button"
              onClick={() => {
                setIsCreateOpen(false)
                setEditingTask(null)
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
              {editingTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deletingTaskId !== null}
        onClose={() => setDeletingTaskId(null)}
        onConfirm={() => {
          if (deletingTaskId) deleteTask(deletingTaskId)
        }}
        title="Delete Task"
        message="Are you sure you want to permanently delete this task? This action cannot be undone."
        confirmText="Delete Task"
        isDestructive={true}
      />
    </div>
  )
}
