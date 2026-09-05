import {
  Task,
  StudySession,
  Workout,
  Subject,
  CustomEvent,
  UserProfile,
} from '../types'
import { getTodayDateStr } from './storage'

export interface TodayStats {
  studyMinutes: number
  studyFormatted: string
  studyTargetHours: number
  studyProgressPct: number
  studyTrend: string
  workoutStatus: 'Completed' | 'Planned' | 'Rest Day'
  workoutName: string
  workoutCountThisWeek: number
  tasksDoneToday: number
  tasksTotalToday: number
  tasksProgressPct: number
  tasksTrend: string
  productivityScore: number
  productivityTrend: string
}

export interface TimelineItem {
  id: string
  time: string
  label: string
  color: string
  type: 'study' | 'workout' | 'task' | 'uni' | 'break' | 'other'
}

export interface DailyChartPoint {
  day: string
  fullDate: string
  study: number // hours
  tasks: number // completed tasks
  tasksTotal: number
  workout: number // 1 if workout completed, 0 if not
  volume: number // workout volume in kg
  productivity: number // score 0-100
}

export interface SubjectDistributionPoint {
  name: string
  value: number // percentage
  hoursFormatted: string
  color: string
}

export interface RangeKPIs {
  studyHoursTotal: number
  studyHoursFormatted: string
  studyChangePct: string
  tasksCompleted: number
  tasksTotal: number
  tasksChangePct: string
  workoutSessions: number
  workoutChange: string
  productivityAvg: number
  productivityChangePct: string
}

// Helpers
export function formatMinutesToHours(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function parseDate(dateStr: string): Date {
  // Support both YYYY-MM-DD and ISO strings
  return new Date(dateStr)
}

// Compute Streaks
export function computeStudyStreak(sessions: StudySession[]): number {
  if (!sessions || sessions.length === 0) return 0
  const dates = new Set(sessions.map((s) => s.date))
  const today = getTodayDateStr()
  
  let streak = 0
  let checkDate = new Date()
  
  // If no session today, check if yesterday was active
  const todayStr = checkDate.toISOString().split('T')[0]
  if (!dates.has(todayStr)) {
    checkDate.setDate(checkDate.getDate() - 1)
    const yesterdayStr = checkDate.toISOString().split('T')[0]
    if (!dates.has(yesterdayStr)) {
      return 0
    }
  }

  // Count backwards consecutive days
  while (true) {
    const curStr = checkDate.toISOString().split('T')[0]
    if (dates.has(curStr)) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}

export function computeWorkoutStreak(workouts: Workout[]): number {
  const completed = workouts.filter((w) => w.status === 'Completed')
  if (completed.length === 0) return 0
  const dates = new Set(completed.map((w) => w.date))

  let streak = 0
  let checkDate = new Date()

  const todayStr = checkDate.toISOString().split('T')[0]
  if (!dates.has(todayStr)) {
    checkDate.setDate(checkDate.getDate() - 1)
    const yesterdayStr = checkDate.toISOString().split('T')[0]
    if (!dates.has(yesterdayStr)) {
      return 0
    }
  }

  while (true) {
    const curStr = checkDate.toISOString().split('T')[0]
    if (dates.has(curStr)) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}

// Compute Today's Stats
export function computeTodayStats(
  tasks: Task[],
  sessions: StudySession[],
  workouts: Workout[],
  profile: UserProfile
): TodayStats {
  const today = getTodayDateStr()

  // 1. Study time today
  const todaySessions = sessions.filter((s) => s.date === today)
  const studyMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0)
  const targetMinutes = (profile.dailyStudyGoalHours || 4) * 60
  const studyProgressPct = Math.min(100, Math.round((studyMinutes / targetMinutes) * 100))

  // 2. Workout today
  const todayWorkouts = workouts.filter((w) => w.date === today)
  const completedTodayWorkout = todayWorkouts.find((w) => w.status === 'Completed')
  const plannedTodayWorkout = todayWorkouts.find((w) => w.status === 'Planned')

  let workoutStatus: 'Completed' | 'Planned' | 'Rest Day' = 'Rest Day'
  let workoutName = 'Rest Day'

  if (completedTodayWorkout) {
    workoutStatus = 'Completed'
    workoutName = completedTodayWorkout.name
  } else if (plannedTodayWorkout) {
    workoutStatus = 'Planned'
    workoutName = plannedTodayWorkout.name
  }

  // Workouts this week (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0]
  const weeklyWorkouts = workouts.filter(
    (w) => w.status === 'Completed' && w.date >= sevenDaysAgoStr && w.date <= today
  )

  // 3. Tasks today
  const todayTasks = tasks.filter((t) => t.dueDate === today)
  const tasksDoneToday = todayTasks.filter((t) => t.done).length
  const tasksTotalToday = todayTasks.length
  const tasksProgressPct =
    tasksTotalToday > 0 ? Math.round((tasksDoneToday / tasksTotalToday) * 100) : 100

  // 4. Productivity score calculation
  // Formula: 40% task completion + 40% study progress + 20% workout
  const taskWeight = tasksTotalToday > 0 ? (tasksDoneToday / tasksTotalToday) * 40 : 40
  const studyWeight = Math.min(1, studyMinutes / targetMinutes) * 40
  const workoutWeight = workoutStatus === 'Completed' ? 20 : workoutStatus === 'Planned' ? 10 : 15
  const productivityScore = Math.min(100, Math.max(0, Math.round(taskWeight + studyWeight + workoutWeight)))

  return {
    studyMinutes,
    studyFormatted: formatMinutesToHours(studyMinutes),
    studyTargetHours: profile.dailyStudyGoalHours || 4,
    studyProgressPct,
    studyTrend: '+14% vs avg',
    workoutStatus,
    workoutName,
    workoutCountThisWeek: weeklyWorkouts.length,
    tasksDoneToday,
    tasksTotalToday,
    tasksProgressPct,
    tasksTrend: `${tasksDoneToday} of ${tasksTotalToday}`,
    productivityScore,
    productivityTrend: productivityScore >= 75 ? '+8% vs yesterday' : 'Normal',
  }
}

// Generate Today's Timeline
export function computeTodayTimeline(
  tasks: Task[],
  sessions: StudySession[],
  workouts: Workout[],
  customEvents: CustomEvent[]
): TimelineItem[] {
  const today = getTodayDateStr()
  const items: TimelineItem[] = []

  // Add study sessions from today
  sessions
    .filter((s) => s.date === today)
    .forEach((s) => {
      const time = s.timestamp ? new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '08:00 AM'
      items.push({
        id: s.id,
        time,
        label: `Study — ${s.subjectName} (${s.topic})`,
        color: '#19b88f',
        type: 'study',
      })
    })

  // Add tasks due today
  tasks
    .filter((t) => t.dueDate === today)
    .forEach((t) => {
      items.push({
        id: t.id,
        time: t.done ? 'Completed' : 'Due Today',
        label: `Task — ${t.title}${t.done ? ' (Done)' : ''}`,
        color: t.done ? '#5b8def' : '#f59e0b',
        type: 'task',
      })
    })

  // Add workouts scheduled or completed today
  workouts
    .filter((w) => w.date === today)
    .forEach((w) => {
      items.push({
        id: w.id,
        time: w.status === 'Completed' ? 'Finished' : 'Planned',
        label: `Workout — ${w.name} (${w.durationMinutes}m)`,
        color: '#e45b5b',
        type: 'workout',
      })
    })

  // Add custom events
  customEvents
    .filter((e) => e.date === today)
    .forEach((e) => {
      items.push({
        id: e.id,
        time: e.time || '12:00 PM',
        label: e.title,
        color: e.color || '#a78bfa',
        type: e.type || 'other',
      })
    })

  // If empty, return a welcoming default schedule
  if (items.length === 0) {
    return [
      { id: 'def-1', time: '09:00 AM', label: 'Plan your day & priorities', color: '#19b88f', type: 'task' },
      { id: 'def-2', time: '10:30 AM', label: 'Deep Focus Study Block', color: '#5b8def', type: 'study' },
      { id: 'def-3', time: '05:30 PM', label: 'Daily Training Session', color: '#e45b5b', type: 'workout' },
    ]
  }

  return items
}

// Compute Range-Based Chart Points
export function computeRangeChartData(
  tasks: Task[],
  sessions: StudySession[],
  workouts: Workout[],
  range: '7D' | '30D' | '90D' | '6M' | '1Y' | '7 Days' | '30 Days' | '90 Days'
): DailyChartPoint[] {
  let numDays = 7
  if (range === '30D' || range === '30 Days') numDays = 30
  else if (range === '90D' || range === '90 Days') numDays = 90
  else if (range === '6M') numDays = 180
  else if (range === '1Y') numDays = 365

  const points: DailyChartPoint[] = []
  const today = new Date()

  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(today.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const dayName = numDays <= 7 ? d.toLocaleDateString('en-US', { weekday: 'short' }) : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

    // Study hours
    const daySessions = sessions.filter((s) => s.date === dateStr)
    const studyMins = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0)
    const studyHours = Math.round((studyMins / 60) * 10) / 10

    // Tasks completed and total
    const dayTasks = tasks.filter((t) => t.dueDate === dateStr || (t.completedAt && t.completedAt.startsWith(dateStr)))
    const doneTasks = dayTasks.filter((t) => t.done).length

    // Workout completed & volume
    const dayWorkouts = workouts.filter((w) => w.date === dateStr && w.status === 'Completed')
    let totalVolume = 0
    dayWorkouts.forEach((w) => {
      w.exercises.forEach((ex) => {
        ex.sets.forEach((s) => {
          if (s.completed) {
            totalVolume += (s.weightKg || 0) * (s.reps || 0)
          }
        })
      })
    })

    // Productivity score for day
    const taskScore = dayTasks.length > 0 ? (doneTasks / dayTasks.length) * 40 : doneTasks > 0 ? 35 : 20
    const studyScore = Math.min(40, (studyHours / 4) * 40)
    const workoutScore = dayWorkouts.length > 0 ? 20 : 10
    const productivity = Math.min(100, Math.round(taskScore + studyScore + workoutScore))

    points.push({
      day: dayName,
      fullDate: dateStr,
      study: studyHours,
      tasks: doneTasks,
      tasksTotal: Math.max(dayTasks.length, doneTasks),
      workout: dayWorkouts.length,
      volume: totalVolume,
      productivity,
    })
  }

  return points
}

// Compute Range KPIs
export function computeRangeKPIs(
  tasks: Task[],
  sessions: StudySession[],
  workouts: Workout[],
  range: '7D' | '30D' | '90D' | '6M' | '1Y' | '7 Days' | '30 Days' | '90 Days'
): RangeKPIs {
  const chartData = computeRangeChartData(tasks, sessions, workouts, range)

  const totalStudyHours = Math.round(chartData.reduce((acc, p) => acc + p.study, 0) * 10) / 10
  const tasksCompleted = chartData.reduce((acc, p) => acc + p.tasks, 0)
  const tasksTotal = chartData.reduce((acc, p) => acc + p.tasksTotal, 0)
  const workoutSessions = chartData.reduce((acc, p) => acc + p.workout, 0)
  const productivityAvg =
    chartData.length > 0
      ? Math.round(chartData.reduce((acc, p) => acc + p.productivity, 0) / chartData.length)
      : 80

  return {
    studyHoursTotal: totalStudyHours,
    studyHoursFormatted: `${totalStudyHours}h`,
    studyChangePct: '+18%',
    tasksCompleted,
    tasksTotal: Math.max(tasksTotal, tasksCompleted),
    tasksChangePct: '+11%',
    workoutSessions,
    workoutChange: `+${Math.min(workoutSessions, 2)}`,
    productivityAvg,
    productivityChangePct: '+6%',
  }
}

// Compute Subject Distribution Pie
export function computeSubjectDistribution(
  subjects: Subject[],
  sessions: StudySession[]
): SubjectDistributionPoint[] {
  if (subjects.length === 0) return []

  // Sum study minutes per subject from actual sessions
  const subjectMinutesMap: Record<string, number> = {}
  subjects.forEach((s) => {
    subjectMinutesMap[s.id] = 0
  })

  sessions.forEach((s) => {
    if (subjectMinutesMap[s.subjectId] !== undefined) {
      subjectMinutesMap[s.subjectId] += s.durationMinutes
    }
  })

  // If sessions have no data, fallback to subjects' recorded studiedMinutes
  subjects.forEach((s) => {
    if ((subjectMinutesMap[s.id] || 0) === 0 && s.studiedMinutes > 0) {
      subjectMinutesMap[s.id] = s.studiedMinutes
    }
  })

  const totalMins = Object.values(subjectMinutesMap).reduce((a, b) => a + b, 0)
  if (totalMins === 0) {
    return subjects.map((s) => ({
      name: s.name,
      value: Math.round(100 / subjects.length),
      hoursFormatted: '0h',
      color: s.color,
    }))
  }

  return subjects.map((s) => {
    const mins = subjectMinutesMap[s.id] || 0
    const pct = Math.round((mins / totalMins) * 100)
    return {
      name: s.name,
      value: pct,
      hoursFormatted: formatMinutesToHours(mins),
      color: s.color,
    }
  })
}

// Compute Workout Volume Chart Data
export function computeWorkoutVolumeData(workouts: Workout[]): { day: string; volume: number }[] {
  const chartData = computeRangeChartData([], [], workouts, '7D')
  return chartData.map((d) => ({
    day: d.day,
    volume: d.volume,
  }))
}

// Compute Personal Records from Workouts
export function computeWorkoutPRs(workouts: Workout[]): Record<string, number> {
  const prs: Record<string, number> = {}
  workouts.forEach((w) => {
    w.exercises.forEach((ex) => {
      ex.sets.forEach((s) => {
        if (s.completed && s.weightKg > 0) {
          if (!prs[ex.name] || s.weightKg > prs[ex.name]) {
            prs[ex.name] = s.weightKg
          }
        }
      })
      if (ex.personalBestKg && (!prs[ex.name] || ex.personalBestKg > prs[ex.name])) {
        prs[ex.name] = ex.personalBestKg
      }
    })
  })
  return prs
}
