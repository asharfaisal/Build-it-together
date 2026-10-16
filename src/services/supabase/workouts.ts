import { supabase } from "../../lib/supabase"
import type { Workout, Exercise, ExerciseSet } from "../../types"

export const workoutsService = {
  async getAll(): Promise<Workout[]> {
    const { data: workouts, error } = await supabase
      .from("workouts")
      .select("*")
      .order("date", { ascending: false })

    if (error) throw error

    const result: Workout[] = []
    for (const workout of workouts) {
      const exercises = await getExercisesForWorkout(workout.id)
      result.push(mapWorkoutFromDB(workout, exercises))
    }
    return result
  },

  async create(workout: Omit<Workout, "id">): Promise<Workout> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
      .from("workouts")
      .insert({
        user_id: user.id,
        name: workout.name,
        category: workout.category,
        duration_minutes: workout.durationMinutes,
        status: workout.status,
        date: workout.date,
        color: workout.color,
        completed_at: workout.completedAt ?? null,
      })
      .select()
      .single()

    if (error) throw error

    // Create exercises and sets
    for (let i = 0; i < workout.exercises.length; i++) {
      const ex = workout.exercises[i]
      const { data: exerciseData, error: exError } = await supabase
        .from("workout_exercises")
        .insert({
          workout_id: data.id,
          user_id: user.id,
          name: ex.name,
          personal_best_kg: ex.personalBestKg ?? null,
          exercise_order: i,
        })
        .select()
        .single()

      if (exError) throw exError

      for (const set of ex.sets) {
        const { error: setError } = await supabase
          .from("exercise_sets")
          .insert({
            exercise_id: exerciseData.id,
            user_id: user.id,
            set_number: set.setNumber,
            weight_kg: set.weightKg,
            reps: set.reps,
            completed: set.completed,
          })

        if (setError) throw setError
      }
    }

    return this.getById(data.id) as Promise<Workout>
  },

  async getById(id: string): Promise<Workout | null> {
    const { data: workout, error } = await supabase
      .from("workouts")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !workout) return null

    const exercises = await getExercisesForWorkout(workout.id)
    return mapWorkoutFromDB(workout, exercises)
  },

  async update(id: string, updates: Partial<Workout>): Promise<Workout> {
    const dbUpdates: Record<string, unknown> = {}
    if (updates.name !== undefined) dbUpdates.name = updates.name
    if (updates.category !== undefined) dbUpdates.category = updates.category
    if (updates.durationMinutes !== undefined)
      dbUpdates.duration_minutes = updates.durationMinutes
    if (updates.status !== undefined) {
      dbUpdates.status = updates.status
      if (updates.status === "Completed") {
        dbUpdates.completed_at = new Date().toISOString()
      } else {
        dbUpdates.completed_at = null
      }
    }
    if (updates.date !== undefined) dbUpdates.date = updates.date
    if (updates.color !== undefined) dbUpdates.color = updates.color

    const { data, error } = await supabase
      .from("workouts")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    const exercises = await getExercisesForWorkout(id)
    return mapWorkoutFromDB(data, exercises)
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("workouts").delete().eq("id", id)

    if (error) throw error
  },

  async toggleStatus(id: string): Promise<Workout> {
    const { data: current } = await supabase
      .from("workouts")
      .select("status")
      .eq("id", id)
      .single()

    if (!current) throw new Error("Workout not found")

    const newStatus = current.status === "Completed" ? "Planned" : "Completed"
    return this.update(id, { status: newStatus })
  },

  async addExercise(
    workoutId: string,
    exerciseName: string,
  ): Promise<Exercise> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data: exercises } = await supabase
      .from("workout_exercises")
      .select("exercise_order")
      .eq("workout_id", workoutId)
      .order("exercise_order", { ascending: false })
      .limit(1)

    const nextOrder = (exercises?.[0]?.exercise_order ?? -1) + 1

    const { data, error } = await supabase
      .from("workout_exercises")
      .insert({
        workout_id: workoutId,
        user_id: user.id,
        name: exerciseName,
        exercise_order: nextOrder,
      })
      .select()
      .single()

    if (error) throw error

    // Add default first set
    await supabase.from("exercise_sets").insert({
      exercise_id: data.id,
      user_id: user.id,
      set_number: 1,
      weight_kg: 20,
      reps: 10,
      completed: true,
    })

    return {
      id: data.id,
      name: data.name,
      personalBestKg: data.personal_best_kg ?? undefined,
      sets: [
        {
          id: "temp",
          setNumber: 1,
          weightKg: 20,
          reps: 10,
          completed: true,
        },
      ],
    }
  },

  async addSet(
    workoutId: string,
    exerciseId: string,
    set: Omit<ExerciseSet, "id">,
  ): Promise<ExerciseSet> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
      .from("exercise_sets")
      .insert({
        exercise_id: exerciseId,
        user_id: user.id,
        set_number: set.setNumber,
        weight_kg: set.weightKg,
        reps: set.reps,
        completed: set.completed,
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      setNumber: data.set_number,
      weightKg: data.weight_kg,
      reps: data.reps,
      completed: data.completed,
    }
  },

  async deleteSet(
    workoutId: string,
    exerciseId: string,
    setId: string,
  ): Promise<void> {
    const { error } = await supabase
      .from("exercise_sets")
      .delete()
      .eq("id", setId)
      .eq("exercise_id", exerciseId)

    if (error) throw error
  },

  async updateSet(
    workoutId: string,
    exerciseId: string,
    setId: string,
    updates: Partial<ExerciseSet>,
  ): Promise<ExerciseSet> {
    const dbUpdates: Record<string, unknown> = {}
    if (updates.setNumber !== undefined)
      dbUpdates.set_number = updates.setNumber
    if (updates.weightKg !== undefined) dbUpdates.weight_kg = updates.weightKg
    if (updates.reps !== undefined) dbUpdates.reps = updates.reps
    if (updates.completed !== undefined) dbUpdates.completed = updates.completed

    const { data, error } = await supabase
      .from("exercise_sets")
      .update(dbUpdates)
      .eq("id", setId)
      .eq("exercise_id", exerciseId)
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      setNumber: data.set_number,
      weightKg: data.weight_kg,
      reps: data.reps,
      completed: data.completed,
    }
  },
}

async function getExercisesForWorkout(workoutId: string): Promise<Exercise[]> {
  const { data: exercises, error } = await supabase
    .from("workout_exercises")
    .select("*")
    .eq("workout_id", workoutId)
    .order("exercise_order", { ascending: true })

  if (error) throw error

  const result: Exercise[] = []
  for (const ex of exercises) {
    const { data: sets } = await supabase
      .from("exercise_sets")
      .select("*")
      .eq("exercise_id", ex.id)
      .order("set_number", { ascending: true })

    result.push({
      id: ex.id,
      name: ex.name,
      personalBestKg: ex.personal_best_kg ?? undefined,
      sets: (sets ?? []).map((s) => ({
        id: s.id,
        setNumber: s.set_number,
        weightKg: s.weight_kg,
        reps: s.reps,
        completed: s.completed,
      })),
    })
  }
  return result
}

function mapWorkoutFromDB(
  workout: {
    id: string
    user_id: string
    name: string
    category: string
    duration_minutes: number
    status: "Completed" | "Planned"
    date: string
    color: string
    completed_at: string | null
  },
  exercises: Exercise[],
): Workout {
  return {
    id: workout.id,
    name: workout.name,
    category: workout.category as Workout["category"],
    durationMinutes: workout.duration_minutes,
    status: workout.status,
    date: workout.date,
    color: workout.color,
    completedAt: workout.completed_at ?? undefined,
    exercises,
  }
}
