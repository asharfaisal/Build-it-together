import { supabase } from "../../lib/supabase"
import type { Subject } from "../../types"

export const subjectsService = {
  async getAll(): Promise<Subject[]> {
    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .order("created_at", { ascending: true })

    if (error) throw error
    return data.map(mapSubjectFromDB)
  },

  async create(
    subject: Omit<Subject, "id" | "studiedMinutes">,
  ): Promise<Subject> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
      .from("subjects")
      .insert({
        user_id: user.id,
        name: subject.name,
        color: subject.color,
        target_hours: subject.targetHours,
        studied_minutes: 0,
        last_studied: subject.lastStudied ?? null,
        topics: subject.topics,
        notes: subject.notes ?? null,
      })
      .select()
      .single()

    if (error) throw error
    return mapSubjectFromDB(data)
  },

  async update(id: string, updates: Partial<Subject>): Promise<Subject> {
    const dbUpdates: Record<string, unknown> = {}
    if (updates.name !== undefined) dbUpdates.name = updates.name
    if (updates.color !== undefined) dbUpdates.color = updates.color
    if (updates.targetHours !== undefined)
      dbUpdates.target_hours = updates.targetHours
    if (updates.studiedMinutes !== undefined)
      dbUpdates.studied_minutes = updates.studiedMinutes
    if (updates.lastStudied !== undefined)
      dbUpdates.last_studied = updates.lastStudied
    if (updates.topics !== undefined) dbUpdates.topics = updates.topics
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes

    const { data, error } = await supabase
      .from("subjects")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return mapSubjectFromDB(data)
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("subjects").delete().eq("id", id)

    if (error) throw error
  },

  async incrementStudiedMinutes(
    subjectId: string,
    minutes: number,
  ): Promise<void> {
    const { error } = await supabase.rpc("increment_studied_minutes", {
      p_subject_id: subjectId,
      p_minutes: minutes,
    })

    if (error) {
      // Fallback if RPC doesn't exist
      const { data: subject } = await supabase
        .from("subjects")
        .select("studied_minutes")
        .eq("id", subjectId)
        .single()

      if (subject) {
        await supabase
          .from("subjects")
          .update({
            studied_minutes: subject.studied_minutes + minutes,
            last_studied: new Date().toISOString().split("T")[0],
          })
          .eq("id", subjectId)
      }
    }
  },
}

function mapSubjectFromDB(row: {
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
}): Subject {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    targetHours: row.target_hours,
    studiedMinutes: row.studied_minutes,
    lastStudied: row.last_studied ?? undefined,
    topics: row.topics,
    notes: row.notes ?? undefined,
  }
}
