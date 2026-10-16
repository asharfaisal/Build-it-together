import { supabase } from "../../lib/supabase"
import type { UserProfile } from "../../types"

export const userProfileService = {
  async get(): Promise<UserProfile> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (error && error.code !== "PGRST116") throw error

    if (!data) {
      // Create default profile if missing
      return this.createDefault(user.id, user.email ?? "")
    }

    return mapProfileFromDB(data)
  },

  async createDefault(userId: string, email: string): Promise<UserProfile> {
    const name = email.split("@")[0] || "User"
    const avatar = name.charAt(0).toUpperCase()

    const { data, error } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        name,
        email,
        avatar,
        tier: "Free",
        daily_study_goal_hours: 4,
        pomodoro_minutes: 45,
        workout_goal_per_week: 4,
      })
      .select()
      .single()

    if (error) throw error
    return mapProfileFromDB(data)
  },

  async update(updates: Partial<UserProfile>): Promise<UserProfile> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const dbUpdates: Record<string, unknown> = {}
    if (updates.name !== undefined) dbUpdates.name = updates.name
    if (updates.email !== undefined) dbUpdates.email = updates.email
    if (updates.avatar !== undefined) dbUpdates.avatar = updates.avatar
    if (updates.tier !== undefined) dbUpdates.tier = updates.tier
    if (updates.dailyStudyGoalHours !== undefined)
      dbUpdates.daily_study_goal_hours = updates.dailyStudyGoalHours
    if (updates.pomodoroMinutes !== undefined)
      dbUpdates.pomodoro_minutes = updates.pomodoroMinutes
    if (updates.workoutGoalPerWeek !== undefined)
      dbUpdates.workout_goal_per_week = updates.workoutGoalPerWeek

    const { data, error } = await supabase
      .from("profiles")
      .update(dbUpdates)
      .eq("id", user.id)
      .select()
      .single()

    if (error) throw error
    return mapProfileFromDB(data)
  },
}

function mapProfileFromDB(row: {
  id: string
  name: string
  email: string | null
  avatar: string | null
  tier: string
  daily_study_goal_hours: number
  pomodoro_minutes: number
  workout_goal_per_week: number
}): UserProfile {
  return {
    name: row.name,
    email: row.email ?? "",
    avatar: row.avatar ?? row.name.charAt(0).toUpperCase(),
    tier: row.tier as "Free" | "Premium",
    dailyStudyGoalHours: row.daily_study_goal_hours,
    pomodoroMinutes: row.pomodoro_minutes,
    workoutGoalPerWeek: row.workout_goal_per_week,
  }
}
