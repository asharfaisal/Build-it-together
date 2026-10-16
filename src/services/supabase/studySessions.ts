import { supabase } from "../../lib/supabase"
import type { StudySession } from "../../types"

export const studySessionsService = {
  async getAll(): Promise<StudySession[]> {
    const { data, error } = await supabase
      .from("study_sessions")
      .select("*")
      .order("timestamp", { ascending: false })

    if (error) throw error
    return data.map(mapSessionFromDB)
  },

  async create(
    session: Omit<StudySession, "id" | "timestamp">,
  ): Promise<StudySession> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
      .from("study_sessions")
      .insert({
        user_id: user.id,
        subject_id: session.subjectId,
        subject_name: session.subjectName,
        topic: session.topic,
        duration_minutes: session.durationMinutes,
        date: session.date,
        timestamp: new Date().toISOString(),
        notes: session.notes ?? null,
      })
      .select()
      .single()

    if (error) throw error
    return mapSessionFromDB(data)
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("study_sessions")
      .delete()
      .eq("id", id)

    if (error) throw error
  },

  async getBySubject(subjectId: string): Promise<StudySession[]> {
    const { data, error } = await supabase
      .from("study_sessions")
      .select("*")
      .eq("subject_id", subjectId)
      .order("timestamp", { ascending: false })

    if (error) throw error
    return data.map(mapSessionFromDB)
  },

  async getByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<StudySession[]> {
    const { data, error } = await supabase
      .from("study_sessions")
      .select("*")
      .gte("date", startDate)
      .lte("date", endDate)
      .order("timestamp", { ascending: false })

    if (error) throw error
    return data.map(mapSessionFromDB)
  },
}

function mapSessionFromDB(row: {
  id: string
  user_id: string
  subject_id: string | null
  subject_name: string
  topic: string
  duration_minutes: number
  date: string
  timestamp: string
  notes: string | null
}): StudySession {
  return {
    id: row.id,
    subjectId: row.subject_id ?? "",
    subjectName: row.subject_name,
    topic: row.topic,
    durationMinutes: row.duration_minutes,
    date: row.date,
    timestamp: row.timestamp,
    notes: row.notes ?? undefined,
  }
}
