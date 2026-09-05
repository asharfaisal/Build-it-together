import React, { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { CustomEvent } from '../types'
import { getTodayDateStr } from '../services/storage'
import Modal from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface CalendarEventItem {
  id: string
  label: string
  color: string
  type: 'study' | 'workout' | 'task' | 'uni' | 'ai' | 'other'
  time?: string
  date: string
  isDone?: boolean
  taskId?: string
  customEventId?: string
}

export default function Calendar() {
  const { tasks, studySessions, workouts, customEvents, addCustomEvent, deleteCustomEvent, toggleTask } = useApp()

  // Current view month & year
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => getTodayDateStr())

  // Modal
  const [isAddEventOpen, setIsAddEventOpen] = useState(false)
  const [eventTitle, setEventTitle] = useState('')
  const [eventDate, setEventDate] = useState(getTodayDateStr())
  const [eventTime, setEventTime] = useState('10:00 AM')
  const [eventType, setEventType] = useState<CustomEvent['type']>('other')
  const [eventColor, setEventColor] = useState('#5b8def')
  const [eventNotes, setEventNotes] = useState('')

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }
  const jumpToToday = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDateStr(getTodayDateStr())
  }

  // Month details
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const firstDayIndex = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Build Unified Calendar Events Map: dateStr -> CalendarEventItem[]
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEventItem[]> = {}

    const add = (dateStr: string, item: CalendarEventItem) => {
      if (!map[dateStr]) map[dateStr] = []
      map[dateStr].push(item)
    }

    // 1. Tasks
    tasks.forEach((t) => {
      if (t.dueDate) {
        add(t.dueDate, {
          id: `t-${t.id}`,
          label: `${t.title} ${t.done ? '(Done)' : ''}`,
          color: t.priority === 'High' ? '#e45b5b' : t.priority === 'Medium' ? '#f59e0b' : '#19b88f',
          type: 'task',
          date: t.dueDate,
          isDone: t.done,
          taskId: t.id,
        })
      }
    })

    // 2. Study Sessions
    studySessions.forEach((s) => {
      if (s.date) {
        add(s.date, {
          id: `s-${s.id}`,
          label: `Study: ${s.subjectName}`,
          color: '#19b88f',
          type: 'study',
          time: `${s.durationMinutes}m`,
          date: s.date,
        })
      }
    })

    // 3. Workouts
    workouts.forEach((w) => {
      if (w.date) {
        add(w.date, {
          id: `w-${w.id}`,
          label: `Workout: ${w.name}`,
          color: w.color || '#e45b5b',
          type: 'workout',
          time: `${w.durationMinutes}m`,
          date: w.date,
        })
      }
    })

    // 4. Custom Events
    customEvents.forEach((ce) => {
      if (ce.date) {
        add(ce.date, {
          id: `ce-${ce.id}`,
          label: ce.title,
          color: ce.color || '#5b8def',
          type: ce.type || 'other',
          time: ce.time,
          date: ce.date,
          customEventId: ce.id,
        })
      }
    })

    return map
  }, [tasks, studySessions, workouts, customEvents])

  // Calendar cells grid
  const cells = useMemo(() => {
    const list: { dayNum: number | null; dateStr: string | null }[] = []
    for (let i = 0; i < firstDayIndex; i++) {
      list.push({ dayNum: null, dateStr: null })
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const monthPadded = String(month + 1).padStart(2, '0')
      const dayPadded = String(d).padStart(2, '0')
      const dateStr = `${year}-${monthPadded}-${dayPadded}`
      list.push({ dayNum: d, dateStr })
    }
    while (list.length % 7 !== 0) {
      list.push({ dayNum: null, dateStr: null })
    }
    return list
  }, [year, month, firstDayIndex, daysInMonth])

  // Selected day's events
  const selectedDayEvents = eventsByDate[selectedDateStr] || []
  const todayDateStr = getTodayDateStr()

  // Handle Add Custom Event Form
  const handleSaveCustomEvent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventTitle.trim()) return

    addCustomEvent({
      title: eventTitle.trim(),
      date: eventDate,
      time: eventTime.trim(),
      type: eventType,
      color: eventColor,
      notes: eventNotes.trim() || undefined,
    })

    setEventTitle('')
    setEventNotes('')
    setIsAddEventOpen(false)
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header with Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-800" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>
            Schedule & Calendar
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Unified timeline of tasks, study sessions, workouts, and events.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={prevMonth}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-colors cursor-pointer"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            title="Previous Month"
          >
            ←
          </button>
          <div
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-700 text-center min-w-[150px]"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)', fontFamily: 'Plus Jakarta Sans' }}
          >
            {monthName}
          </div>
          <button
            onClick={nextMonth}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-colors cursor-pointer"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            title="Next Month"
          >
            →
          </button>
          <button
            onClick={jumpToToday}
            className="px-3 py-2 rounded-xl text-xs font-600 transition-all cursor-pointer"
            style={{ background: 'var(--muted)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
          >
            Today
          </button>
        </div>
      </div>

      {/* Legend & Add Event Button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4">
          {[
            { label: 'Study', color: '#19b88f' },
            { label: 'Workout', color: '#e45b5b' },
            { label: 'Task Due', color: '#f59e0b' },
            { label: 'Academic / Uni', color: '#5b8def' },
            { label: 'Custom / AI', color: '#a78bfa' },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
              <span>{l.label}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            setEventDate(selectedDateStr || getTodayDateStr())
            setIsAddEventOpen(true)
          }}
          className="px-4 py-2 rounded-xl text-xs font-600 shadow-sm cursor-pointer border-none"
          style={{ background: '#19b88f', color: '#fff' }}
        >
          + Add Event
        </button>
      </div>

      {/* Calendar Grid & Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calendar grid */}
        <div
          className="lg:col-span-2 rounded-2xl overflow-hidden shadow-sm"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          {/* Day of week headers */}
          <div className="grid grid-cols-7 border-b" style={{ borderColor: 'var(--border)' }}>
            {daysOfWeek.map((d) => (
              <div
                key={d}
                className="text-center py-2.5 text-xs font-700 uppercase tracking-wider"
                style={{ color: 'var(--muted-foreground)' }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7">
            {cells.map((cell, idx) => {
              const isToday = cell.dateStr === todayDateStr
              const isSelected = cell.dateStr === selectedDateStr
              const dayEvents = cell.dateStr ? eventsByDate[cell.dateStr] || [] : []

              return (
                <div
                  key={idx}
                  onClick={() => cell.dateStr && setSelectedDateStr(cell.dateStr)}
                  className={`min-h-[76px] p-1.5 border-b border-r transition-all ${
                    cell.dayNum ? 'cursor-pointer' : ''
                  }`}
                  style={{
                    borderColor: 'var(--border)',
                    background: isSelected
                      ? 'rgba(25,184,143,0.12)'
                      : cell.dayNum
                      ? 'transparent'
                      : 'var(--muted)',
                  }}
                >
                  {cell.dayNum && (
                    <>
                      <div className="flex items-center justify-between mb-1">
                        <div
                          className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-700"
                          style={{
                            background: isToday ? '#19b88f' : 'transparent',
                            color: isToday ? '#fff' : isSelected ? '#19b88f' : 'var(--foreground)',
                          }}
                        >
                          {cell.dayNum}
                        </div>
                        {dayEvents.length > 0 && (
                          <span
                            className="text-xs px-1.5 py-0.2 rounded-full font-600"
                            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', fontSize: '10px' }}
                          >
                            {dayEvents.length}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col gap-1">
                        {dayEvents.slice(0, 2).map((ev) => (
                          <div
                            key={ev.id}
                            className="text-xs px-1.5 py-0.5 rounded-md truncate font-500"
                            style={{
                              background: `${ev.color}18`,
                              color: ev.color,
                              fontSize: '10px',
                            }}
                            title={ev.label}
                          >
                            {ev.label}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs font-600 px-1" style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Selected Day Event Detail Panel */}
        <div
          className="rounded-2xl p-5 flex flex-col gap-4"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div>
            <div className="text-base font-700" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>
              {selectedDateStr}
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              {selectedDateStr === todayDateStr
                ? 'Today'
                : `${selectedDayEvents.length} scheduled item(s)`}
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto max-h-[380px] pr-1 scroll-thin">
            {selectedDayEvents.length === 0 ? (
              <EmptyState
                icon="📅"
                title="No events on this date"
                description="Your schedule is clear for this day. Click below to add a reminder or assignment."
                actionLabel="+ Add Event"
                onAction={() => {
                  setEventDate(selectedDateStr)
                  setIsAddEventOpen(true)
                }}
              />
            ) : (
              selectedDayEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 rounded-xl flex items-start justify-between gap-2.5 transition-all"
                  style={{
                    background: `${ev.color}0c`,
                    border: `1px solid ${ev.color}25`,
                  }}
                >
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-full mt-1 shrink-0" style={{ background: ev.color }} />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm font-700 truncate" style={{ color: 'var(--foreground)' }}>
                        {ev.label}
                      </div>
                      <div className="text-xs mt-0.5 flex items-center gap-2 flex-wrap" style={{ color: 'var(--muted-foreground)' }}>
                        <span className="capitalize font-600" style={{ color: ev.color }}>
                          {ev.type}
                        </span>
                        {ev.time && <span>• {ev.time}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Actions depending on event type */}
                  <div className="flex items-center gap-1 shrink-0">
                    {ev.taskId && (
                      <button
                        onClick={() => toggleTask(ev.taskId!)}
                        className="px-2 py-1 rounded-lg text-xs font-600 transition-colors cursor-pointer border-none"
                        style={{
                          background: ev.isDone ? '#19b88f' : 'var(--muted)',
                          color: ev.isDone ? '#fff' : 'var(--foreground)',
                        }}
                      >
                        {ev.isDone ? '✓ Done' : 'Check Off'}
                      </button>
                    )}
                    {ev.customEventId && (
                      <button
                        onClick={() => deleteCustomEvent(ev.customEventId!)}
                        className="text-xs text-red-400 hover:text-red-500 bg-transparent border-none cursor-pointer p-1"
                        title="Delete event"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Custom Event Modal */}
      <Modal
        isOpen={isAddEventOpen}
        onClose={() => setIsAddEventOpen(false)}
        title="Add Schedule Event"
        subtitle="Schedule a class, deadline, or reminder."
      >
        <form onSubmit={handleSaveCustomEvent} className="flex flex-col gap-4 mt-2">
          <div>
            <label className="text-xs font-600 block mb-1">Event Title *</label>
            <input
              required
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="e.g. Database Systems Lecture"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-600 block mb-1">Date</label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs outline-none"
                style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
              />
            </div>
            <div>
              <label className="text-xs font-600 block mb-1">Time</label>
              <input
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                placeholder="e.g. 10:30 AM"
                className="w-full px-3 py-2 rounded-xl text-xs outline-none"
                style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-600 block mb-1">Event Type</label>
              <select
                value={eventType}
                onChange={(e) => {
                  const val = e.target.value as CustomEvent['type']
                  setEventType(val)
                  if (val === 'uni') setEventColor('#5b8def')
                  else if (val === 'study') setEventColor('#19b88f')
                  else if (val === 'workout') setEventColor('#e45b5b')
                  else if (val === 'ai') setEventColor('#a78bfa')
                }}
                className="w-full px-2.5 py-2.5 rounded-xl text-xs outline-none"
                style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
              >
                <option value="uni">Academic / Uni</option>
                <option value="study">Study Block</option>
                <option value="workout">Workout</option>
                <option value="task">Task / Deadline</option>
                <option value="ai">AI Review</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-600 block mb-1">Accent Color</label>
              <input
                type="color"
                value={eventColor}
                onChange={(e) => setEventColor(e.target.value)}
                className="w-full h-9 rounded-xl outline-none cursor-pointer border-none bg-transparent"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-600 block mb-1">Notes</label>
            <textarea
              rows={2}
              value={eventNotes}
              onChange={(e) => setEventNotes(e.target.value)}
              placeholder="Room number, syllabus details..."
              className="w-full px-3.5 py-2 rounded-xl text-xs outline-none resize-none"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            />
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              type="button"
              onClick={() => setIsAddEventOpen(false)}
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
              Add Event
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
