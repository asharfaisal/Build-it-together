import React, { useState, useMemo } from 'react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { useApp } from '../context/AppContext'
import {
  computeRangeChartData,
  computeRangeKPIs,
  computeSubjectDistribution,
} from '../services/analyticsService'
import { generateWeeklyReviewReport } from '../services/aiService'
import EmptyState from '../components/ui/EmptyState'

const ranges = ['7D', '30D', '90D', '6M', '1Y']

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

function KPICard({
  label,
  value,
  change,
  color,
}: {
  label: string
  value: string
  change: string
  color: string
}) {
  const positive = change.startsWith('+')
  return (
    <Card className="flex flex-col gap-2">
      <div className="text-xs font-500" style={{ color: 'var(--muted-foreground)' }}>
        {label}
      </div>
      <div className="text-2xl font-800" style={{ fontFamily: 'Plus Jakarta Sans', color }}>
        {value}
      </div>
      <span
        className="text-xs font-600 w-fit px-2 py-0.5 rounded-full"
        style={{
          background: positive ? 'rgba(25,184,143,0.12)' : 'rgba(228,91,91,0.12)',
          color: positive ? '#19b88f' : '#e45b5b',
        }}
      >
        {change} vs last period
      </span>
    </Card>
  )
}

export default function Analytics() {
  const { tasks, studySessions, workouts, subjects, userProfile, setPage, sendMessageToCoach } = useApp()
  const [range, setRange] = useState<'7D' | '30D' | '90D' | '6M' | '1Y'>('7D')

  // Live Calculations based on selected Range
  const chartData = useMemo(
    () => computeRangeChartData(tasks, studySessions, workouts, range),
    [tasks, studySessions, workouts, range]
  )

  const kpis = useMemo(
    () => computeRangeKPIs(tasks, studySessions, workouts, range),
    [tasks, studySessions, workouts, range]
  )

  const subjectPie = useMemo(
    () => computeSubjectDistribution(subjects, studySessions),
    [subjects, studySessions]
  )

  // AI Weekly Review Report
  const weeklyReport = useMemo(
    () => generateWeeklyReviewReport(tasks, studySessions, workouts, subjects, userProfile),
    [tasks, studySessions, workouts, subjects, userProfile]
  )

  const handleCreateNextWeekPlan = () => {
    sendMessageToCoach("Create next week's plan based on my performance and syllabus.")
    setPage('coach')
  }

  const hasData = chartData.some((p) => p.study > 0 || p.tasks > 0 || p.workout > 0)

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header & Date Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-800" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>
            Analytics & Progress Insights
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Data-backed metrics across study hours, task execution, and fitness volume.
          </p>
        </div>

        <div className="flex gap-1.5 self-start sm:self-auto overflow-x-auto pb-1">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r as any)}
              className="px-3 py-1.5 rounded-xl text-xs font-600 transition-all cursor-pointer"
              style={{
                background: range === r ? '#19b88f' : 'var(--card)',
                color: range === r ? '#fff' : 'var(--muted-foreground)',
                border: `1px solid ${range === r ? '#19b88f' : 'var(--border)'}`,
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Study Hours" value={kpis.studyHoursFormatted} change={kpis.studyChangePct} color="#19b88f" />
        <KPICard
          label="Tasks Completed"
          value={`${kpis.tasksCompleted} / ${kpis.tasksTotal}`}
          change={kpis.tasksChangePct}
          color="#5b8def"
        />
        <KPICard label="Workout Sessions" value={String(kpis.workoutSessions)} change={kpis.workoutChange} color="#e45b5b" />
        <KPICard label="Productivity Score" value={`${kpis.productivityAvg}%`} change={kpis.productivityChangePct} color="#f59e0b" />
      </div>

      {/* Charts Row */}
      {!hasData ? (
        <EmptyState
          icon="↗"
          title="Insufficient Data for this Range"
          description="Log more tasks, study sessions, or workouts to generate historical trends and progress curves."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Study Hours Chart */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-700" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>
                Study Hours — Daily Breakdown
              </h2>
              <span className="text-xs text-emerald-500 font-600">{kpis.studyHoursFormatted} Total</span>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 6, right: 6, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="analyticsStudyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#19b88f" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#19b88f" stopOpacity={0} />
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
                    }}
                    formatter={(v) => [`${v} hours`, 'Study']}
                  />
                  <Area
                    type="monotone"
                    dataKey="study"
                    stroke="#19b88f"
                    strokeWidth={2.5}
                    fill="url(#analyticsStudyGrad)"
                    dot={{ r: 3, fill: '#19b88f', strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Task Completion Rate Chart */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-700" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>
                Task Completion Velocity
              </h2>
              <span className="text-xs text-blue-500 font-600">{kpis.tasksCompleted} Completed</span>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={2} barSize={16} margin={{ top: 6, right: 6, bottom: 0, left: -20 }}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      color: 'var(--foreground)',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="tasksTotal" fill="var(--muted)" radius={[4, 4, 0, 0]} name="Total Tasks" />
                  <Bar dataKey="tasks" fill="#5b8def" radius={[4, 4, 0, 0]} name="Completed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* Bottom Section: AI Weekly Review & Subject Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Dynamic AI Weekly Review */}
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span style={{ color: '#19b88f', fontSize: '18px' }}>✦</span>
                <h2 className="text-base font-700" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>
                  AI Weekly Review
                </h2>
              </div>
              <span className="text-xs font-500" style={{ color: 'var(--muted-foreground)' }}>
                {weeklyReport.weekRange}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {[
                { label: 'What went well', text: weeklyReport.whatWentWell, icon: '✅', color: '#19b88f' },
                { label: 'Where you struggled', text: weeklyReport.whereStruggled, icon: '⚠️', color: '#f59e0b' },
                { label: 'Your best day', text: weeklyReport.bestDay, icon: '🏆', color: '#5b8def' },
                { label: 'Biggest improvement', text: weeklyReport.biggestImprovement, icon: '📈', color: '#a78bfa' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-3.5 rounded-2xl flex flex-col gap-1"
                  style={{ background: `${item.color}0a`, border: `1px solid ${item.color}25` }}
                >
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '14px' }}>{item.icon}</span>
                    <span className="text-xs font-700" style={{ color: item.color, fontFamily: 'Plus Jakarta Sans' }}>
                      {item.label}
                    </span>
                  </div>
                  <div className="text-xs leading-relaxed" style={{ color: 'var(--foreground)' }}>
                    {item.text}
                  </div>
                </div>
              ))}
            </div>

            <div
              className="p-3.5 rounded-2xl mb-3"
              style={{ background: 'rgba(25,184,143,0.06)', border: '1px solid rgba(25,184,143,0.2)' }}
            >
              <div className="text-xs font-700 mb-1" style={{ color: '#19b88f' }}>
                ✦ AI Strategy Recommendation
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                {weeklyReport.recommendation}
              </p>
            </div>
          </div>

          <button
            onClick={handleCreateNextWeekPlan}
            className="text-xs font-700 text-emerald-500 hover:underline bg-transparent border-none cursor-pointer self-start p-0 mt-1"
          >
            Create next week's plan with AI Coach →
          </button>
        </Card>

        {/* Subject Distribution */}
        <Card className="flex flex-col">
          <h2 className="text-sm font-700 mb-4" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>
            Study by Subject
          </h2>
          {subjectPie.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center my-auto">No subjects created yet.</p>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <PieChart width={150} height={150}>
                  <Pie data={subjectPie} cx={75} cy={75} innerRadius={46} outerRadius={70} dataKey="value" strokeWidth={0}>
                    {subjectPie.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </div>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto scroll-thin pr-1">
                {subjectPie.map((s) => (
                  <div key={s.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                    <span className="truncate flex-1" style={{ color: 'var(--muted-foreground)' }}>
                      {s.name}
                    </span>
                    <span className="font-600" style={{ color: 'var(--foreground)' }}>
                      {s.hoursFormatted} ({s.value}%)
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
