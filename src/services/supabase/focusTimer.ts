import { supabase } from "../../lib/supabase"
import type { FocusTimerState } from "../../types"

export const focusTimerService = {
  async get(): Promise<FocusTimerState> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
      .from("focus_timer_state")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (error && error.code !== "PGRST116") throw error

    if (!data) {
      return {
        isActive: false,
        isPaused: false,
        seconds: 0,
        subjectId: "",
        subjectName: "",
        topic: "",
        notes: "",
        startTimestamp: null,
        accumulatedSeconds: 0,
      }
    }

    // Recalculate seconds if active
    let seconds = data.accumulated_seconds
    if (data.is_active && !data.is_paused && data.start_timestamp) {
      seconds =
        data.accumulated_seconds +
        Math.floor((Date.now() - data.start_timestamp) / 1000)
    }

    return {
      isActive: data.is_active,
      isPaused: data.is_paused,
      seconds,
      subjectId: data.subject_id ?? "",
      subjectName: data.subject_name ?? "",
      topic: data.topic ?? "",
      notes: data.notes ?? "",
      startTimestamp: data.start_timestamp,
      accumulatedSeconds: data.accumulated_seconds,
    }
  },

  async update(updates: Partial<FocusTimerState>): Promise<FocusTimerState> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const dbUpdates: Record<string, unknown> = {}
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive
    if (updates.isPaused !== undefined) dbUpdates.is_paused = updates.isPaused
    if (updates.seconds !== undefined) dbUpdates.seconds = updates.seconds
    if (updates.subjectId !== undefined)
      dbUpdates.subject_id = updates.subjectId
    if (updates.subjectName !== undefined)
      dbUpdates.subject_name = updates.subjectName
    if (updates.topic !== undefined) dbUpdates.topic = updates.topic
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes
    if (updates.startTimestamp !== undefined)
      dbUpdates.start_timestamp = updates.startTimestamp
    if (updates.accumulatedSeconds !== undefined)
      dbUpdates.accumulated_seconds = updates.accumulatedSeconds

    const { data, error } = await supabase
      .from("focus_timer_state")
      .upsert({
        user_id: user.id,
        ...dbUpdates,
      })
      .select()
      .single()

    if (error) throw error

    return {
      isActive: data.is_active,
      isPaused: data.is_paused,
      seconds: data.seconds,
      subjectId: data.subject_id ?? "",
      subjectName: data.subject_name ?? "",
      topic: data.topic ?? "",
      notes: data.notes ?? "",
      startTimestamp: data.start_timestamp,
      accumulatedSeconds: data.accumulated_seconds,
    }
  },

  async reset(): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { error } = await supabase.from("focus_timer_state").upsert({
      user_id: user.id,
      is_active: false,
      is_paused: false,
      seconds: 0,
      subject_id: null,
      subject_name: null,
      topic: "",
      notes: "",
      start_timestamp: null,
      accumulated_seconds: 0,
    })

    if (error) throw error
  },
}
