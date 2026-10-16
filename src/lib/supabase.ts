import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check .env file.",
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          email: string | null
          avatar: string | null
          tier: string
          daily_study_goal_hours: number
          pomodoro_minutes: number
          workout_goal_per_week: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name?: string
          email?: string | null
          avatar?: string | null
          tier?: string
          daily_study_goal_hours?: number
          pomodoro_minutes?: number
          workout_goal_per_week?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          avatar?: string | null
          tier?: string
          daily_study_goal_hours?: number
          pomodoro_minutes?: number
          workout_goal_per_week?: number
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          priority: "High" | "Medium" | "Low"
          due_date: string
          est_minutes: number
          done: boolean
          ai_generated: boolean
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string
          priority: "High" | "Medium" | "Low"
          due_date: string
          est_minutes?: number
          done?: boolean
          ai_generated?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          priority?: "High" | "Medium" | "Low"
          due_date?: string
          est_minutes?: number
          done?: boolean
          ai_generated?: boolean
          completed_at?: string | null
          updated_at?: string
        }
      }
      subjects: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          target_hours: number
          studied_minutes: number
          last_studied: string | null
          topics: string[]
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string
          target_hours?: number
          studied_minutes?: number
          last_studied?: string | null
          topics?: string[]
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          target_hours?: number
          studied_minutes?: number
          last_studied?: string | null
          topics?: string[]
          notes?: string | null
          updated_at?: string
        }
      }
      study_sessions: {
        Row: {
          id: string
          user_id: string
          subject_id: string | null
          subject_name: string
          topic: string
          duration_minutes: number
          date: string
          timestamp: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject_id?: string | null
          subject_name: string
          topic: string
          duration_minutes: number
          date: string
          timestamp: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject_id?: string | null
          subject_name?: string
          topic?: string
          duration_minutes?: number
          date?: string
          timestamp?: string
          notes?: string | null
        }
      }
      workouts: {
        Row: {
          id: string
          user_id: string
          name: string
          category: "Upper Body" | "Legs" | "Cardio" | "Core & Abs" | "Full Body" | "Push" | "Pull" | "Other"
          duration_minutes: number
          status: "Completed" | "Planned"
          date: string
          color: string
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          category: "Upper Body" | "Legs" | "Cardio" | "Core & Abs" | "Full Body" | "Push" | "Pull" | "Other"
          duration_minutes?: number
          status: "Completed" | "Planned"
          date: string
          color?: string
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          category?: "Upper Body" | "Legs" | "Cardio" | "Core & Abs" | "Full Body" | "Push" | "Pull" | "Other"
          duration_minutes?: number
          status?: "Completed" | "Planned"
          date?: string
          color?: string
          completed_at?: string | null
          updated_at?: string
        }
      }
      workout_exercises: {
        Row: {
          id: string
          workout_id: string
          user_id: string
          name: string
          personal_best_kg: number | null
          exercise_order: number
          created_at: string
        }
        Insert: {
          id?: string
          workout_id: string
          user_id: string
          name: string
          personal_best_kg?: number | null
          exercise_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          workout_id?: string
          user_id?: string
          name?: string
          personal_best_kg?: number | null
          exercise_order?: number
        }
      }
      exercise_sets: {
        Row: {
          id: string
          exercise_id: string
          user_id: string
          set_number: number
          weight_kg: number
          reps: number
          completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          exercise_id: string
          user_id: string
          set_number: number
          weight_kg?: number
          reps?: number
          completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          exercise_id?: string
          user_id?: string
          set_number?: number
          weight_kg?: number
          reps?: number
          completed?: boolean
        }
      }
      custom_events: {
        Row: {
          id: string
          user_id: string
          title: string
          date: string
          time: string | null
          type: "study" | "workout" | "task" | "uni" | "ai" | "other"
          color: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          date: string
          time?: string | null
          type: "study" | "workout" | "task" | "uni" | "ai" | "other"
          color?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          date?: string
          time?: string | null
          type?: "study" | "workout" | "task" | "uni" | "ai" | "other"
          color?: string
          notes?: string | null
        }
      }
      user_settings: {
        Row: {
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
          updated_at: string
        }
        Insert: {
          user_id: string
          theme?: "light" | "dark" | "system"
          color_theme?: string
          notifications?: {
            studyReminders: boolean
            workoutReminders: boolean
            taskDeadlines: boolean
            aiWeeklyReview: boolean
            streakAlerts: boolean
          }
          ai_preferences?: {
            coachSuggestions: boolean
            autoGenerateTasks: boolean
            personalizedInsights: boolean
          }
          updated_at?: string
        }
        Update: {
          user_id?: string
          theme?: "light" | "dark" | "system"
          color_theme?: string
          notifications?: {
            studyReminders: boolean
            workoutReminders: boolean
            taskDeadlines: boolean
            aiWeeklyReview: boolean
            streakAlerts: boolean
          }
          ai_preferences?: {
            coachSuggestions: boolean
            autoGenerateTasks: boolean
            personalizedInsights: boolean
          }
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          user_id: string
          role: "user" | "ai"
          text: string
          timestamp: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: "user" | "ai"
          text: string
          timestamp: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: "user" | "ai"
          text?: string
          timestamp?: string
        }
      }
      focus_timer_state: {
        Row: {
          user_id: string
          is_active: boolean
          is_paused: boolean
          seconds: number
          subject_id: string | null
          subject_name: string | null
          topic: string
          notes: string
          start_timestamp: number | null
          accumulated_seconds: number
          updated_at: string
        }
        Insert: {
          user_id: string
          is_active?: boolean
          is_paused?: boolean
          seconds?: number
          subject_id?: string | null
          subject_name?: string | null
          topic?: string
          notes?: string
          start_timestamp?: number | null
          accumulated_seconds?: number
          updated_at?: string
        }
        Update: {
          user_id?: string
          is_active?: boolean
          is_paused?: boolean
          seconds?: number
          subject_id?: string | null
          subject_name?: string | null
          topic?: string
          notes?: string
          start_timestamp?: number | null
          accumulated_seconds?: number
          updated_at?: string
        }
      }
    }
    Functions: {
      get_study_streak: {
        Args: { p_user_id: string }
        Returns: number
      }
      get_workout_streak: {
        Args: { p_user_id: string }
        Returns: number
      }
    }
  }
}
