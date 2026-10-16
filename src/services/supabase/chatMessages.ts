import { supabase } from "../../lib/supabase"
import type { ChatMessage } from "../../types"

export const chatMessagesService = {
  async getAll(): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .order("created_at", { ascending: true })

    if (error) throw error
    return data.map(mapMessageFromDB)
  },

  async create(message: Omit<ChatMessage, "id">): Promise<ChatMessage> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        user_id: user.id,
        role: message.role,
        text: message.text,
        timestamp: message.timestamp,
      })
      .select()
      .single()

    if (error) throw error
    return mapMessageFromDB(data)
  },

  async addBatch(messages: Omit<ChatMessage, "id">[]): Promise<ChatMessage[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
      .from("chat_messages")
      .insert(
        messages.map((m) => ({
          user_id: user.id,
          role: m.role,
          text: m.text,
          timestamp: m.timestamp,
        })),
      )
      .select()

    if (error) throw error
    return data.map(mapMessageFromDB)
  },

  async clear(): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { error } = await supabase
      .from("chat_messages")
      .delete()
      .eq("user_id", user.id)

    if (error) throw error
  },
}

function mapMessageFromDB(row: {
  id: string
  user_id: string
  role: "user" | "ai"
  text: string
  timestamp: string
}): ChatMessage {
  return {
    id: row.id,
    role: row.role,
    text: row.text,
    timestamp: row.timestamp,
  }
}
