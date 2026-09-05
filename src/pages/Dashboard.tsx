import React, { useState, useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useApp } from '../context/AppContext'
import {
  computeTodayStats,
  computeTodayTimeline,
  computeRangeChartData,
} from '../services/analyticsService'

const chartTabs = ['Study', 'Tasks', 'Workout', 'Productivity']
const rangeOptions = ['7 Days', '30 Days', '90 Days']

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

function MetricCard({
  icon,
  label,
  value,
  sub,
  trend,
  progress,
  color,
  onClick,
}: {
  icon: string
  label: string
  value: string
  sub: string
  trend: string
  progress: number
  color: string
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-5 flex flex-col gap-3 hover:shadow-lg transition-all ${
        onClick ? 'cursor-pointer hover:border-emerald-500/30' : ''
      }`}
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
      }}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
          style={{ background: `${color}18`, color }}
        >
          {icon}
        </div>
        <span
          className="text-xs px-2 py-1 rounded-full font-600 truncate max-w-[120px]"
          style={{ background: `${color}14`, color }}
        >
          {trend}
        </span>
      </div>
      <div>
        <div
          className="text-2xl font-700 leading-none mb-1 truncate"
          style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--card-foreground)' }}
        >
          {value}
        </div>
        <div className="text-xs font-500" style={{ color: 'var(--muted-foreground)' }}>
          {label}
        </div>
      </div>
      <div>
        <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>
          <span className="truncate pr-1">{sub}</span>
          <span className="font-600">{progress}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%`, background: color }}
          />
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const {
    tasks,
    studySessions,
    workouts,
    customEvents,
    userProfile,
    setPage,
    sendMessageToCoach,
  } = useApp()

  const [activeTab, setActiveTab] = useState('Study')
  const [range, setRange] = useState('7 Days')
  const [showNotifications, setShowNotifications] = useState(false)

  // Compute live calculations
  const todayStats = useMemo(
    () => computeTodayStats(tasks, studySessions, workouts, userProfile),
    [tasks, studySessions, workouts, userProfile]
  )

  const timeline = useMemo(
    () => computeTodayTimeline(tasks, studySessions, workouts, customEvents),
    [tasks, studySessions, workouts, customEvents]
  )

  const chartData = useMemo(
    () => computeRangeChartData(tasks, studySessions, workouts, range as any),
    [tasks, studySessions, workouts, range]
  )

  const chartKey =
    activeTab.toLowerCase() === 'study'
      ? 'study'
      : activeTab.toLowerCase() === 'tasks'
      ? 'tasks'
      : activeTab.toLowerCase() === 'workout'
      ? 'workout'
      : 'productivity'

  const chartColor =
    activeTab === 'Study'
      ? '#19b88f'
      : activeTab === 'Tasks'
      ? '#5b8def'
      : activeTab === 'Workout'
      ? '#e45b5b'
      : '#f59e0b'

  const todayDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const handleFullAnalysis = () => {
    sendMessageToCoach('Analyze my week and suggest optimizations.')
    setPage('coach')
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="text-xs font-500 mb-1" style={{ color: 'var(--muted-foreground)' }}>
            {todayDateFormatted}
          </div>
          <h1
            className="text-2xl sm:text-3xl font-800 leading-tight"
            style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}
          >
            Good day, {userProfile.name} 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Here is your live progress and daily schedule.
          </p>
        </div>

        <div className="flex items-center gap-3 relative self-end sm:self-auto">
          {/* Notification Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications((p) => !p)}
              className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
              style={{ background: 'var(--card)', border: '1px solid var(--border)', cursor: 'pointer' }}
              title="Notifications"
            >
              <span style={{ fontSize: '16px' }}>🔔</span>
              {todayStats.tasksTotalToday > todayStats.tasksDoneToday && (
                <span
                  className="absolute top-2 right-2 w-2 h-2 rounded-full"
                  style={{ background: '#19b88f' }}
                />
              )}
            </button>

            {/* Notification popup */}
            {showNotifications && (
              <div
                className="absolute right-0 mt-2 w-72 p-4 rounded-2xl shadow-2xl z-30 animate-in fade-in zoom-in-95"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                }}
              >
                <div className="text-xs font-700 mb-2" style={{ color: 'var(--foreground)' }}>
                  Notifications
                </div>
                <div className="flex flex-col gap-2 text-xs">
                  <div className="p-2 rounded-xl" style={{ background: 'var(--muted)' }}>
                    <div className="font-600 text-emerald-500">Study Habit On Track</div>
                    <div className="text-muted-foreground mt-0.5">
                      {todayStats.studyMinutes}m logged today towards your {todayStats.studyTargetHours}h target.
                    </div>
                  </div>
                  {todayStats.tasksTotalToday > todayStats.tasksDoneToday && (
                    <div className="p-2 rounded-xl" style={{ background: 'var(--muted)' }}>
                      <div className="font-600 text-amber-500">Tasks Pending</div>
                      <div className="text-muted-foreground mt-0.5">
                        {todayStats.tasksTotalToday - todayStats.tasksDoneToday} task(s) remaining for today.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User avatar */}
          <button
            onClick={() => setPage('settings')}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-700 shadow-sm cursor-pointer border-none"
            style={{
              background: 'linear-gradient(135deg, #19b88f, #5b8def)',
              color: '#fff',
              fontFamily: 'Plus Jakarta Sans',
            }}
            title="Profile Settings"
          >
            {userProfile.avatar || userProfile.name.charAt(0) || 'M'}
          </button>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon="📚"
          label="Study Today"
          value={todayStats.studyFormatted}
          sub={`Target: ${todayStats.studyTargetHours}h`}
          trend={todayStats.studyTrend}
          progress={todayStats.studyProgressPct}
          color="#19b88f"
          onClick={() => setPage('study')}
        />
        <MetricCard
          icon="💪"
          label="Workout"
          value={todayStats.workoutStatus}
          sub={todayStats.workoutName}
          trend={`${todayStats.workoutCountThisWeek} this week`}
          progress={todayStats.workoutStatus === 'Completed' ? 100 : todayStats.workoutStatus === 'Planned' ? 50 : 0}
          color="#e45b5b"
          onClick={() => setPage('workout')}
        />
        <MetricCard
          icon="✓"
          label="Tasks"
          value={`${todayStats.tasksDoneToday} / ${todayStats.tasksTotalToday}`}
          sub={`${todayStats.tasksProgressPct}% done`}
          trend={todayStats.tasksTrend}
          progress={todayStats.tasksProgressPct}
          color="#5b8def"
          onClick={() => setPage('tasks')}
        />
        <MetricCard
          icon="⚡"
          label="Productivity"
          value={`${todayStats.productivityScore}%`}
          sub="Daily Score"
          trend={todayStats.productivityTrend}
          progress={todayStats.productivityScore}
          color="#f59e0b"
          onClick={() => setPage('analytics')}
        />
      </div>

      {/* Main area: chart + timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly chart */}
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-700" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>
                  Performance Activity
                </h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                  Interactive live metrics across your habits
                </p>
              </div>
              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                {rangeOptions.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className="text-xs px-2.5 py-1.5 rounded-lg transition-all"
                    style={{
                      background: range === r ? '#19b88f' : 'var(--muted)',
                      color: range === r ? '#fff' : 'var(--muted-foreground)',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: range === r ? 600 : 400,
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Metric tabs */}
            <div className="flex flex-wrap gap-1 mb-5">
              {chartTabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className="text-xs px-3 py-1.5 rounded-lg transition-all"
                  style={{
                    background: activeTab === t ? `${chartColor}18` : 'transparent',
                    color: activeTab === t ? chartColor : 'var(--muted-foreground)',
                    border: `1px solid ${activeTab === t ? `${chartColor}40` : 'transparent'}`,
                    cursor: 'pointer',
                    fontWeight: activeTab === t ? 600 : 400,
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[210px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="dashboardChartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    color: 'var(--foreground)',
                    fontSize: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  }}
                  cursor={{ stroke: chartColor, strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area
                  type="monotone"
                  dataKey={chartKey}
                  stroke={chartColor}
                  strokeWidth={2.5}
                  fill="url(#dashboardChartGrad)"
                  dot={{ r: 3, fill: chartColor, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: chartColor, strokeWidth: 2, stroke: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Today's timeline */}
        <Card className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-700" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>
              Today's Schedule
            </h2>
            <button
              onClick={() => setPage('calendar')}
              className="text-xs font-600 text-emerald-500 hover:underline bg-transparent border-none cursor-pointer"
            >
              Calendar →
            </button>
          </div>
          <div className="flex flex-col gap-0 overflow-y-auto max-h-[260px] pr-1 scroll-thin">
            {timeline.map((item, i) => (
              <div key={item.id || i} className="flex gap-3 relative group">
                <div className="flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full mt-1 shrink-0" style={{ background: item.color }} />
                  {i < timeline.length - 1 && (
                    <div className="w-px flex-1 my-1" style={{ background: 'var(--border)', minHeight: '26px' }} />
                  )}
                </div>
                <div className="pb-3 min-w-0 flex-1">
                  <div className="text-xs font-600" style={{ color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono' }}>
                    {item.time}
                  </div>
                  <div className="text-xs font-500 mt-0.5 truncate" style={{ color: 'var(--card-foreground)' }}>
                    {item.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* AI Insight Card */}
      <div
        className="rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{
          background: 'linear-gradient(135deg, rgba(25,184,143,0.08) 0%, rgba(91,141,239,0.06) 100%)',
          border: '1px solid rgba(25,184,143,0.2)',
        }}
      >
        <div className="flex items-start gap-3.5 flex-1">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(25,184,143,0.15)', border: '1px solid rgba(25,184,143,0.25)' }}
          >
            <span style={{ fontSize: '18px', color: '#19b88f' }}>✦</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xs font-700 px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(25,184,143,0.15)', color: '#19b88f', fontFamily: 'Plus Jakarta Sans' }}
              >
                AI Live Insight
              </span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>
              Your study streak is{' '}
              <span style={{ color: '#19b88f', fontWeight: 600 }}>active and strong</span>. Productivity score stands at{' '}
              <span style={{ color: '#19b88f', fontWeight: 600 }}>{todayStats.productivityScore}%</span> today.
              Complete your remaining high-priority tasks to maximize your weekly consistency.
            </p>
          </div>
        </div>
        <button
          onClick={handleFullAnalysis}
          className="shrink-0 text-xs font-600 px-4 py-2.5 rounded-xl transition-all shadow-sm self-end sm:self-auto"
          style={{
            background: '#19b88f',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Full analysis →
        </button>
      </div>
    </div>
  )
}
