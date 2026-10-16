import { supabase } from "../../lib/supabase"
import type { AppSettings, ThemeMode, ThemeName } from "../../types"

export const userSettingsService = {
  async get(): Promise<AppSettings> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (error && error.code !== "PGRST116") throw error // PGRST116 = no rows returned

    if (!data) {
      // Return defaults if no settings exist
      return {
        theme: "dark",
        colorTheme: "default",
        notifications: {
          studyReminders: true,
          workoutReminders: true,
          taskDeadlines: true,
          aiWeeklyReview: true,
          streakAlerts: true,
        },
        aiPreferences: {
          coachSuggestions: true,
          autoGenerateTasks: true,
          personalizedInsights: true,
        },
      }
    }

    return mapSettingsFromDB(data)
  },

  async update(updates: Partial<AppSettings>): Promise<AppSettings> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const dbUpdates: Record<string, unknown> = {}
    if (updates.theme !== undefined) dbUpdates.theme = updates.theme
    if (updates.colorTheme !== undefined)
      dbUpdates.color_theme = updates.colorTheme
    if (updates.notifications !== undefined)
      dbUpdates.notifications = updates.notifications
    if (updates.aiPreferences !== undefined)
      dbUpdates.ai_preferences = updates.aiPreferences

    const { data, error } = await supabase
      .from("user_settings")
      .upsert({
        user_id: user.id,
        ...dbUpdates,
      })
      .select()
      .single()

    if (error) throw error
    return mapSettingsFromDB(data)
  },
}

function mapSettingsFromDB(row: {
  user_id: string
  theme: "light" | "dark" | "system"
  color_theme: string
  notifications: {
    studyReminders: boolean
    workoutReminders: boolean
    taskDeadlines: boolean
    aiWeeklyReview: boolean
    streakAlerts: boolean
  }
  ai_preferences: {
    coachSuggestions: boolean
    autoGenerateTasks: boolean
    personalizedInsights: boolean
  }
}): AppSettings {
  return {
    theme: row.theme,
    colorTheme: row.color_theme as ThemeName,
    notifications: row.notifications,
    aiPreferences: row.ai_preferences,
  }
}
