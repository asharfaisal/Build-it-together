import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  formatMinutesToHours,
  computeStudyStreak,
  computeWorkoutStreak,
  computeTodayStats,
} from "../analyticsService"
import type { Task, StudySession, Workout, UserProfile } from "../../types"

describe("analyticsService", () => {
  describe("formatMinutesToHours", () => {
    it("formats minutes only", () => {
      expect(formatMinutesToHours(30)).toBe("30m")
      expect(formatMinutesToHours(45)).toBe("45m")
    })

    it("formats hours only", () => {
      expect(formatMinutesToHours(60)).toBe("1h")
      expect(formatMinutesToHours(120)).toBe("2h")
    })

    it("formats hours and minutes", () => {
      expect(formatMinutesToHours(90)).toBe("1h 30m")
      expect(formatMinutesToHours(150)).toBe("2h 30m")
    })
  })

  describe("computeStudyStreak", () => {
    it("returns 0 for empty sessions", () => {
      expect(computeStudyStreak([])).toBe(0)
    })

    it("calculates streak correctly", () => {
      const today = new Date().toISOString().split("T")[0]
      const yesterday = new Date(Date.now() - 86400000)
        .toISOString()
        .split("T")[0]

      const sessions: StudySession[] = [
        {
          id: "1",
          subjectId: "s1",
          subjectName: "Math",
          topic: "Algebra",
          durationMinutes: 60,
          date: today,
          timestamp: new Date().toISOString(),
        },
        {
          id: "2",
          subjectId: "s1",
          subjectName: "Math",
          topic: "Geometry",
          durationMinutes: 45,
          date: yesterday,
          timestamp: new Date(Date.now() - 86400000).toISOString(),
        },
      ]

      expect(computeStudyStreak(sessions)).toBe(2)
    })

    it("breaks streak on missing day", () => {
      const today = new Date().toISOString().split("T")[0]
      const twoDaysAgo = new Date(Date.now() - 2 * 86400000)
        .toISOString()
        .split("T")[0]

      const sessions: StudySession[] = [
        {
          id: "1",
          subjectId: "s1",
          subjectName: "Math",
          topic: "Algebra",
          durationMinutes: 60,
          date: today,
          timestamp: new Date().toISOString(),
        },
        {
          id: "2",
          subjectId: "s1",
          subjectName: "Math",
          topic: "Geometry",
          durationMinutes: 45,
          date: twoDaysAgo,
          timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
        },
      ]

      expect(computeStudyStreak(sessions)).toBe(1)
    })
  })

  describe("computeWorkoutStreak", () => {
    it("returns 0 for empty workouts", () => {
      expect(computeWorkoutStreak([])).toBe(0)
    })

    it("only counts completed workouts", () => {
      const today = new Date().toISOString().split("T")[0]
      const yesterday = new Date(Date.now() - 86400000)
        .toISOString()
        .split("T")[0]

      const workouts: Workout[] = [
        {
          id: "1",
          name: "Upper Body",
          category: "Upper Body",
          durationMinutes: 45,
          status: "Completed",
          date: today,
          color: "#19b88f",
          exercises: [],
        },
        {
          id: "2",
          name: "Legs",
          category: "Legs",
          durationMinutes: 45,
          status: "Planned",
          date: yesterday,
          color: "#5b8def",
          exercises: [],
        },
      ]

      expect(computeWorkoutStreak(workouts)).toBe(1)
    })
  })

  describe("computeTodayStats", () => {
    const mockProfile: UserProfile = {
      name: "Test",
      email: "test@test.com",
      avatar: "T",
      tier: "Free",
      dailyStudyGoalHours: 4,
      pomodoroMinutes: 45,
      workoutGoalPerWeek: 4,
    }

    it("calculates study progress correctly", () => {
      const today = new Date().toISOString().split("T")[0]
      const sessions: StudySession[] = [
        {
          id: "1",
          subjectId: "s1",
          subjectName: "Math",
          topic: "Algebra",
          durationMinutes: 120,
          date: today,
          timestamp: new Date().toISOString(),
        },
      ]

      const stats = computeTodayStats([], sessions, [], mockProfile)
      expect(stats.studyMinutes).toBe(120)
      expect(stats.studyProgressPct).toBe(50) // 120 min / 240 min = 50%
    })

    it("calculates task progress correctly", () => {
      const today = new Date().toISOString().split("T")[0]
      const tasks: Task[] = [
        {
          id: "1",
          title: "Task 1",
          desc: "",
          priority: "High",
          dueDate: today,
          estMinutes: 60,
          done: true,
          createdAt: today,
        },
        {
          id: "2",
          title: "Task 2",
          desc: "",
          priority: "Medium",
          dueDate: today,
          estMinutes: 30,
          done: false,
          createdAt: today,
        },
        {
          id: "3",
          title: "Task 3",
          desc: "",
          priority: "Low",
          dueDate: today,
          estMinutes: 30,
          done: false,
          createdAt: today,
        },
      ]

      const stats = computeTodayStats(tasks, [], [], mockProfile)
      expect(stats.tasksTotalToday).toBe(3)
      expect(stats.tasksDoneToday).toBe(1)
      expect(stats.tasksProgressPct).toBe(33)
    })
  })
})
