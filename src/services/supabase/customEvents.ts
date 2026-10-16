import { supabase } from "../../lib/supabase"
import type { CustomEvent } from "../../types"

export const customEventsService = {
  async getAll(): Promise<CustomEvent[]> {
    const { data, error } = await supabase
      .from("custom_events")
      .select("*")
      .order("date", { ascending: true })

    if (error) throw error
    return data.map(mapEventFromDB)
  },

  async create(event: Omit<CustomEvent, "id">): Promise<CustomEvent> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
      .from("custom_events")
      .insert({
        user_id: user.id,
        title: event.title,
        date: event.date,
        time: event.time ?? null,
        type: event.type,
        color: event.color,
        notes: event.notes ?? null,
      })
      .select()
      .single()

    if (error) throw error
    return mapEventFromDB(data)
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("custom_events").delete().eq("id", id)

    if (error) throw error
  },
}

function mapEventFromDB(row: {
  id: string
  user_id: string
  title: string
  date: string
  time: string | null
  type: "study" | "workout" | "task" | "uni" | "ai" | "other"
  color: string
  notes: string | null
}): CustomEvent {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    time: row.time ?? undefined,
    type: row.type,
    color: row.color,
    notes: row.notes ?? undefined,
  }
}
