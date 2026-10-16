export interface RequestDataPayload {
  message: string
  tasks: Array<{
    id: string
    title: string
    desc?: string
    priority: string
    dueDate: string
    done: boolean
    estMinutes: number
  }>
  studySessions: Array<{
    subjectName: string
    durationMinutes: number
    date: string
    topic: string
  }>
  workouts: Array<{
    name: string
    category: string
    durationMinutes: number
    status: string
    date: string
  }>
  userProfile: {
    name: string
    dailyStudyGoalHours: number
    workoutGoalPerWeek: number
  }
}

export const config = {
  runtime: "nodejs20.x",
  maxDuration: 30,
}

export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")
  // CORS configuration
  if (req.method === "OPTIONS") {
    return res.status(200).end()
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." })
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.LLM_API_KEY

  const {
    message,
    tasks = [],
    studySessions = [],
    workouts = [],
    userProfile = {},
  } = (req.body || {}) as RequestDataPayload

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Message is required" })
  }

  // Calculate real metrics summary for prompt grounding
  const completedTasks = tasks.filter((t) => t.done).length
  const totalTasks = tasks.length
  const totalStudyMinutes = studySessions.reduce(
    (acc, s) => acc + (s.durationMinutes || 0),
    0,
  )
  const totalStudyHours = (totalStudyMinutes / 60).toFixed(1)
  const completedWorkouts = workouts.filter(
    (w) => w.status === "Completed",
  ).length

  const systemContext = `
You are the AI Coach & Personal Strategist inside "LifeTrack AI".
You are advising user ${userProfile.name || "Student/Athlete"}.
Real user data snapshot:
- Tasks: ${completedTasks} completed out of ${totalTasks} total.
- Study logged: ${totalStudyHours} hours across ${studySessions.length} sessions. Daily target is ${userProfile.dailyStudyGoalHours || 4} hours.
- Workouts: ${completedWorkouts} completed out of ${workouts.length} scheduled. Weekly goal is ${userProfile.workoutGoalPerWeek || 4} workouts.

Instructions:
- Give encouraging, direct, and actionable advice tailored to their exact logged habits and metrics.
- Format responses cleanly with brief bullet points.
- If they ask about falling behind, highlight their real pending tasks and suggest 25-minute Pomodoro focus blocks.
- Keep the response concise, realistic, and inspiring.
`

  // If no API key is configured on server environment, return realistic data-grounded synthesis
  if (!apiKey) {
    const fallbackResponse = `[Offline Mode Analysis based on your data]
• Tasks: You have finished ${completedTasks} of ${totalTasks} planned tasks.
• Study Hours: ${totalStudyHours}h logged towards your ${userProfile.dailyStudyGoalHours || 4}h daily goal.
• Training: ${completedWorkouts} workouts finished this cycle.

Recommendation for "${message}":
1. Prioritize your top pending high-priority task during your morning peak focus window.
2. Protect your next 45-minute study block from notifications and distractions.
3. Maintain steady consistency to preserve your active streaks!`

    return res
      .status(200)
      .json({ response: fallbackResponse, source: "grounded-local-engine" })
  }

  try {
    // Call Gemini API via standard REST endpoint
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `${systemContext}\n\nUser Question: ${message}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 600,
          },
        }),
      },
    )

    if (!response.ok) {
      const errText = await response.text()
      console.error("Gemini API Error:", errText)
      return res
        .status(502)
        .json({ error: "LLM API gateway error", details: errText })
    }

    const data = await response.json()
    const replyText =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I evaluated your metrics and schedule. Focus on your top pending tasks and keep your streak going!"

    return res.status(200).json({ response: replyText, source: "gemini" })
  } catch (error: any) {
    console.error("Error invoking LLM coach:", error)
    return res.status(500).json({
      error: "Failed to process AI coach request",
      details: error.message,
    })
  }
}
