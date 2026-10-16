import { supabase } from "../../lib/supabase"
import type { Task } from "../../types"

export const tasksService = {
  async getAll(): Promise<Task[]> {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error
    return data.map(mapTaskFromDB)
  },

  async create(task: Omit<Task, "id" | "createdAt">): Promise<Task> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        user_id: user.id,
        title: task.title,
        description: task.desc,
        priority: task.priority,
        due_date: task.dueDate,
        est_minutes: task.estMinutes,
        done: task.done,
        ai_generated: task.ai ?? false,
        completed_at: task.completedAt ?? null,
      })
      .select()
      .single()

    if (error) throw error
    return mapTaskFromDB(data)
  },

  async update(id: string, updates: Partial<Task>): Promise<Task> {
    const dbUpdates: Record<string, unknown> = {}
    if (updates.title !== undefined) dbUpdates.title = updates.title
    if (updates.desc !== undefined) dbUpdates.description = updates.desc
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority
    if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate
    if (updates.estMinutes !== undefined)
      dbUpdates.est_minutes = updates.estMinutes
    if (updates.done !== undefined) {
      dbUpdates.done = updates.done
      if (updates.done) {
        dbUpdates.completed_at = new Date().toISOString()
      } else {
        dbUpdates.completed_at = null
      }
    }
    if (updates.ai !== undefined) dbUpdates.ai_generated = updates.ai

    const { data, error } = await supabase
      .from("tasks")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return mapTaskFromDB(data)
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("tasks").delete().eq("id", id)

    if (error) throw error
  },

  async toggle(id: string): Promise<Task> {
    const { data: current } = await supabase
      .from("tasks")
      .select("done")
      .eq("id", id)
      .single()

    if (!current) throw new Error("Task not found")

    const newDone = !current.done
    const { data, error } = await supabase
      .from("tasks")
      .update({
        done: newDone,
        completed_at: newDone ? new Date().toISOString() : null,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return mapTaskFromDB(data)
  },
}

function mapTaskFromDB(row: {
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
}): Task {
  return {
    id: row.id,
    title: row.title,
    desc: row.description,
    priority: row.priority,
    dueDate: row.due_date,
    estMinutes: row.est_minutes,
    done: row.done,
    ai: row.ai_generated,
    completedAt: row.completed_at ?? undefined,
    createdAt: row.created_at,
  }
}
