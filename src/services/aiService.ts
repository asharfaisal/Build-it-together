import {
  Task,
  StudySession,
  Workout,
  Subject,
  UserProfile,
  WeeklyReviewReport,
  Priority,
} from '../types'
import { getTodayDateStr, getRelativeDateStr } from './storage'
import {
  computeStudyStreak,
  computeWorkoutStreak,
  computeTodayStats,
  computeRangeChartData,
  formatMinutesToHours,
} from './analyticsService'

export interface ParsedTaskCandidate {
  id: string
  title: string
  desc: string
  priority: Priority
  dueDate: string
  estMinutes: number
  estFormatted: string
}

// 1. Natural Language Task Parser
export function parseNaturalLanguageTasks(input: string): ParsedTaskCandidate[] {
  if (!input.trim()) return []

  const cleanInput = input.trim()
  const results: ParsedTaskCandidate[] = []

  // Split by common separators: 'and', 'also', 'then', ';', newline, '&'
  const clauses = cleanInput
    .split(/(?:\band\b|\balso\b|\bthen\b|;|\n|&)/i)
    .map((c) => c.trim())
    .filter((c) => c.length > 2)

  const defaultClauses = clauses.length > 0 ? clauses : [cleanInput]

  defaultClauses.forEach((clause, index) => {
    let title = clause
    let estMinutes = 60
    let priority: Priority = 'Medium'
    let dueDate = getTodayDateStr()

    // 1. Detect duration (e.g., "2 hours", "90 min", "30m", "1.5h", "45 mins")
    const hourMatch = clause.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)\b/i)
    const minMatch = clause.match(/(\d+)\s*(?:minutes?|mins?|m)\b/i)

    if (hourMatch) {
      estMinutes = Math.round(parseFloat(hourMatch[1]) * 60)
    } else if (minMatch) {
      estMinutes = parseInt(minMatch[1], 10)
    }

    // 2. Detect Priority
    if (/\b(?:urgent|high priority|asap|important|critical|must)\b/i.test(clause)) {
      priority = 'High'
    } else if (/\b(?:low priority|whenever|optional|low)\b/i.test(clause)) {
      priority = 'Low'
    }

    // 3. Detect Due Date
    if (/\btomorrow\b/i.test(clause)) {
      dueDate = getRelativeDateStr(1)
    } else if (/\bnext week\b/i.test(clause)) {
      dueDate = getRelativeDateStr(7)
    } else if (/\byesterday\b/i.test(clause)) {
      dueDate = getRelativeDateStr(-1)
    } else if (/\b(?:in\s+(\d+)\s+days?)\b/i.test(clause)) {
      const match = clause.match(/in\s+(\d+)\s+days?/i)
      if (match) dueDate = getRelativeDateStr(parseInt(match[1], 10))
    } else if (/\b(?:monday|mon)\b/i.test(clause)) {
      dueDate = getRelativeDateStr(2)
    } else if (/\b(?:tuesday|tue)\b/i.test(clause)) {
      dueDate = getRelativeDateStr(3)
    } else if (/\b(?:wednesday|wed)\b/i.test(clause)) {
      dueDate = getRelativeDateStr(4)
    } else if (/\b(?:thursday|thu)\b/i.test(clause)) {
      dueDate = getRelativeDateStr(5)
    } else if (/\b(?:friday|fri)\b/i.test(clause)) {
      dueDate = getRelativeDateStr(6)
    }

    // Clean up title text by stripping filler keywords
    let cleanTitle = title
      .replace(/^i\s+(?:need\s+to|have\s+to|must|want\s+to|should)\s+/i, '')
      .replace(/\s+(?:for\s+\d+(?:\.\d+)?\s*(?:hours?|hrs?|h|minutes?|mins?|m))\b/gi, '')
      .replace(/\s+(?:tomorrow|today|yesterday|next week|in \d+ days?)\b/gi, '')
      .replace(/\s+(?:high priority|urgent|low priority)\b/gi, '')
      .trim()

    // Capitalize first letter
    cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1)
    if (cleanTitle.length === 0) cleanTitle = `Task ${index + 1}`

    const estFormatted = formatMinutesToHours(estMinutes)

    results.push({
      id: `ai-cand-${Date.now()}-${index}`,
      title: cleanTitle,
      desc: `Extracted via LifeTrack AI (${estFormatted}, ${priority} priority)`,
      priority,
      dueDate,
      estMinutes,
      estFormatted,
    })
  })

  return results
}

// 2. AI Coach Contextual Responses
export function generateAICoachResponse(
  userPrompt: string,
  tasks: Task[],
  studySessions: StudySession[],
  workouts: Workout[],
  subjects: Subject[],
  userProfile: UserProfile
): string {
  const promptLower = userPrompt.toLowerCase().trim()
  const today = getTodayDateStr()
  const todayStats = computeTodayStats(tasks, studySessions, workouts, userProfile)
  const studyStreak = computeStudyStreak(studySessions)
  const workoutStreak = computeWorkoutStreak(workouts)
  const chartData = computeRangeChartData(tasks, studySessions, workouts, '7D')

  const totalWeeklyStudyHours = Math.round(chartData.reduce((acc, p) => acc + p.study, 0) * 10) / 10
  const totalWeeklyTasksDone = chartData.reduce((acc, p) => acc + p.tasks, 0)
  const totalWeeklyTasks = chartData.reduce((acc, p) => acc + p.tasksTotal, 0)
  const weeklyCompletionPct = totalWeeklyTasks > 0 ? Math.round((totalWeeklyTasksDone / totalWeeklyTasks) * 100) : 100
  const weeklyWorkoutsDone = chartData.reduce((acc, p) => acc + p.workout, 0)

  // Find best day of the week
  let bestDay = chartData[0] || { day: 'Today', study: 0, tasks: 0 }
  chartData.forEach((d) => {
    if (d.study * 10 + d.tasks > bestDay.study * 10 + bestDay.tasks) {
      bestDay = d
    }
  })

  // Pending and overdue tasks
  const overdueTasks = tasks.filter((t) => !t.done && t.dueDate < today)
  const pendingHighPriority = tasks.filter((t) => !t.done && t.priority === 'High')

  // Subject hours breakdown
  const topSubject = [...subjects].sort((a, b) => b.studiedMinutes - a.studiedMinutes)[0]

  if (promptLower.includes('analyze my week') || promptLower.includes('weekly review')) {
    return `Here is your real weekly performance breakdown:

• Tasks: You completed ${totalWeeklyTasksDone} of ${totalWeeklyTasks} tasks (${weeklyCompletionPct}% completion rate).
• Study: ${totalWeeklyStudyHours} hours logged across ${subjects.length} active subjects (Current streak: ${studyStreak} days 🔥).
• Fitness: ${weeklyWorkoutsDone} of ${userProfile.workoutGoalPerWeek || 4} targeted workouts completed (Streak: ${workoutStreak} days).
• Peak Day: ${bestDay.day} (${bestDay.study}h study and ${bestDay.tasks} tasks completed).

Overall Productivity Score: ${todayStats.productivityScore}%. Your momentum is strong. Focus on maintaining consistency on weekends!`
  }

  if (promptLower.includes("create tomorrow's plan") || promptLower.includes('plan tomorrow') || promptLower.includes('schedule tomorrow')) {
    const upcomingTasks = tasks.filter((t) => !t.done).slice(0, 3)
    const taskLines =
      upcomingTasks.length > 0
        ? upcomingTasks.map((t, idx) => `• ${0o7 + idx * 3}:00 — Task: ${t.title} (~${formatMinutesToHours(t.estMinutes)})`).join('\n')
        : '• 10:00 — Complete priority university assignments\n• 14:00 — Deep project development block'

    return `Based on your energy patterns and current deadlines, here is an optimized plan for tomorrow:

• 08:00 AM — Focused Study Block (${topSubject ? topSubject.name : 'Core Subject'}) — 90 min
${taskLines}
• 05:30 PM — Workout Session (Upper Body / Lower Body Split)
• 08:30 PM — Light Review & Plan Reconciliation (30 min)

Tip: Tackle your high-priority items during your morning peak focus window (8:00–11:30 AM).`
  }

  if (promptLower.includes('why am i falling behind') || promptLower.includes('falling behind')) {
    if (overdueTasks.length === 0 && weeklyCompletionPct >= 80) {
      return `Good news: You are NOT falling behind! You have an ${weeklyCompletionPct}% task completion rate and a ${studyStreak}-day study streak.

Minor optimizations to keep you progressing:
• Protect afternoon blocks from context switching.
• Ensure adequate recovery after intense training sessions.`
    }

    return `I analyzed your bottlenecks:

• Overdue Tasks: You have ${overdueTasks.length} overdue task(s) (${overdueTasks.map((t) => `"${t.title}"`).slice(0, 2).join(', ')}).
• Workload Balance: High-priority tasks (${pendingHighPriority.length} pending) are competing for study time.
• Consistency: Study frequency dips on Friday/weekend transitions.

Actionable step: Break the biggest overdue task into a 25-minute Pomodoro chunk right now.`
  }

  if (promptLower.includes('what should i focus on') || promptLower.includes('focus')) {
    const highPri = pendingHighPriority.slice(0, 2)
    const highPriText =
      highPri.length > 0
        ? highPri.map((t) => `🔴 High Priority: "${t.title}" (Due: ${t.dueDate === today ? 'Today' : t.dueDate})`).join('\n')
        : '🟢 No urgent overdue tasks! Pick your next major subject module.'

    return `Based on your current deadlines and workload:

${highPriText}
🟡 Study Priority: ${topSubject ? `Continue progress on ${topSubject.name} (Target: ${topSubject.targetHours}h)` : 'Database Systems & SQL'}
💪 Fitness Goal: Complete ${Math.max(0, (userProfile.workoutGoalPerWeek || 4) - weeklyWorkoutsDone)} more workout(s) this week.

Start with the highest priority task first before checking emails or messages.`
  }

  if (promptLower.includes('study plan') || promptLower.includes('create a study plan')) {
    return `Customized Study Plan for your ${subjects.length} subjects:

${subjects
  .slice(0, 4)
  .map(
    (s) =>
      `• ${s.name}: ${formatMinutesToHours(s.studiedMinutes)} studied / ${s.targetHours}h target (${Math.round((s.studiedMinutes / (s.targetHours * 60)) * 100)}% progress)`
  )
  .join('\n')}

Recommendation: Allocate your next 2 study sessions to ${subjects.sort((a, b) => a.studiedMinutes - b.studiedMinutes)[0]?.name || 'your lowest progress subject'} to balance your syllabus coverage.`
  }

  if (promptLower.includes('workout') || promptLower.includes('fitness') || promptLower.includes('gym')) {
    return `Fitness Analysis:
• Total Workouts This Week: ${weeklyWorkoutsDone} / ${userProfile.workoutGoalPerWeek || 4}
• Active Workout Streak: ${workoutStreak} days 🔥
• Training Status Today: ${todayStats.workoutStatus} (${todayStats.workoutName})

Keep progressive overload consistent across all logged sets!`
  }

  // Fallback dynamic intelligent conversational answer
  return `Based on your current LifeTrack AI data:
• You have completed ${todayStats.tasksDoneToday} of ${todayStats.tasksTotalToday} tasks planned for today.
• Study time today: ${todayStats.studyFormatted} (Goal: ${todayStats.studyTargetHours}h).
• Current Study Streak: ${studyStreak} days | Workout Streak: ${workoutStreak} days.
• Productivity Score: ${todayStats.productivityScore}%.

What specific area would you like to drill into? (Study, Workout, Tasks, or Daily Scheduling)`
}

// 3. Dynamic AI Weekly Review Report
export function generateWeeklyReviewReport(
  tasks: Task[],
  studySessions: StudySession[],
  workouts: Workout[],
  subjects: Subject[],
  userProfile: UserProfile
): WeeklyReviewReport {
  const chartData = computeRangeChartData(tasks, studySessions, workouts, '7D')
  const totalStudy = chartData.reduce((acc, p) => acc + p.study, 0)
  const totalTasks = chartData.reduce((acc, p) => acc + p.tasks, 0)
  const totalWorkouts = chartData.reduce((acc, p) => acc + p.workout, 0)

  // Date range label
  const startDate = chartData[0]?.fullDate || getRelativeDateStr(-6)
  const endDate = chartData[chartData.length - 1]?.fullDate || getTodayDateStr()
  const weekRange = `${startDate} – ${endDate}`

  if (totalStudy === 0 && totalTasks === 0 && totalWorkouts === 0) {
    return {
      weekRange,
      whatWentWell: 'Ready to begin tracking your habits and productivity.',
      whereStruggled: 'Insufficient data logged for the past 7 days.',
      bestDay: 'No active day recorded yet.',
      biggestImprovement: 'Start logging study sessions and tasks to see trends.',
      recommendation: 'Complete your first task and log a 25-minute study session to generate insights.',
      hasSufficientData: false,
    }
  }

  let bestPoint = chartData[0]
  chartData.forEach((p) => {
    if (p.study * 10 + p.tasks > (bestPoint?.study || 0) * 10 + (bestPoint?.tasks || 0)) {
      bestPoint = p
    }
  })

  const streak = computeStudyStreak(studySessions)
  const topSub = [...subjects].sort((a, b) => b.studiedMinutes - a.studiedMinutes)[0]?.name || 'Core Subjects'

  return {
    weekRange,
    whatWentWell: `Study consistency was outstanding with ${totalStudy.toFixed(1)}h logged and a ${streak}-day streak. Hit study target across ${topSub}.`,
    whereStruggled: `Task completion dipped slightly towards the weekend. Context switching impacted afternoon focus sessions.`,
    bestDay: `${bestPoint?.day || 'Midweek'} — ${bestPoint?.study || 0}h study, ${bestPoint?.tasks || 0} tasks completed, workout on track.`,
    biggestImprovement: `Study volume reached ${totalStudy.toFixed(1)} hours with ${totalWorkouts} training sessions completed.`,
    recommendation: `Schedule your hardest subject early in the morning, and consolidate smaller admin tasks into a single 45-minute afternoon block.`,
    hasSufficientData: true,
  }
}
