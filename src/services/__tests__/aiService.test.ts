import { describe, it, expect, vi, beforeEach } from "vitest"
import { parseNaturalLanguageTasks } from "../aiService"

describe("aiService", () => {
  describe("parseNaturalLanguageTasks", () => {
    it("returns empty array for empty input", () => {
      expect(parseNaturalLanguageTasks("")).toEqual([])
      expect(parseNaturalLanguageTasks("   ")).toEqual([])
    })

    it("parses simple task", () => {
      const result = parseNaturalLanguageTasks("Study SQL for 2 hours")
      expect(result).toHaveLength(1)
      expect(result[0].title).toContain("Study SQL")
      expect(result[0].estMinutes).toBe(120)
    })

    it('parses multiple tasks separated by "and"', () => {
      const result = parseNaturalLanguageTasks(
        "Study SQL for 2 hours and finish assignment",
      )
      expect(result).toHaveLength(2)
      expect(result[0].title).toContain("Study SQL")
      expect(result[1].title).toContain("Finish assignment")
    })

    it("detects high priority keywords", () => {
      const result = parseNaturalLanguageTasks("Urgent: Finish report ASAP")
      expect(result[0].priority).toBe("High")
    })

    it("detects low priority keywords", () => {
      const result = parseNaturalLanguageTasks(
        "Low priority: Read article when free",
      )
      expect(result[0].priority).toBe("Low")
    })

    it("parses tomorrow keyword", () => {
      const result = parseNaturalLanguageTasks("Study tomorrow")
      expect(result[0].dueDate).not.toBe(new Date().toISOString().split("T")[0])
    })

    it("parses duration in minutes", () => {
      const result = parseNaturalLanguageTasks("Workout for 45 mins")
      expect(result[0].estMinutes).toBe(45)
    })

    it("parses duration in hours with decimal", () => {
      const result = parseNaturalLanguageTasks("Study for 1.5 hours")
      expect(result[0].estMinutes).toBe(90)
    })

    it("handles multiple separators", () => {
      const result = parseNaturalLanguageTasks("Task 1; Task 2, Task 3\nTask 4")
      expect(result.length).toBeGreaterThanOrEqual(3)
    })
  })
})
