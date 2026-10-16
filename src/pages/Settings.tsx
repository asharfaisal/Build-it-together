import React, { useState } from "react"

import { useApp } from "../context/AppContext"

import { useAuth } from "../contexts/AuthContext"

import { ThemeMode } from "../types"

import Modal from "../components/ui/Modal"

import ConfirmDialog from "../components/ui/ConfirmDialog"

import {
  dataMigrationService,
  MigrationPreview,
  MigrationResult,
} from "../services/dataMigration"

import {
  Download,
  Upload,
  Database,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react"

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "var(--card)", border: "1px solid var(--border)" }}
    >
      <h2
        className="text-sm font-bold mb-4"
        style={{ fontFamily: "Plus Jakarta Sans", color: "var(--foreground)" }}
      >
        {title}
      </h2>
      {children}
    </div>
  )
}

function Toggle({
  checked,
  onChange,
  "aria-label": ariaLabel,
}: {
  checked: boolean
  onChange: () => void
  "aria-label"?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={onChange}
      className="relative inline-flex w-10 h-5 rounded-full transition-all cursor-pointer border-none shrink-0"
      style={{ background: checked ? "#19b88f" : "var(--muted)", padding: 0 }}
    >
      <div
        className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
        style={{
          background: "#fff",

          left: checked ? "22px" : "2px",

          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        }}
      />
    </button>
  )
}

function SettingRow({
  label,

  desc,

  checked,

  onChange,
}: {
  label: string

  desc?: string

  checked: boolean

  onChange: () => void
}) {
  return (
    <div
      className="flex items-center justify-between py-3 border-b last:border-0 gap-4"
      style={{ borderColor: "var(--border)" }}
    >
      <div>
        <div
          className="text-xs sm:text-sm font-semibold"
          style={{ color: "var(--foreground)" }}
        >
          {label}
        </div>
        {desc && (
          <div
            className="text-xs mt-0.5 leading-normal"
            style={{ color: "var(--muted-foreground)" }}
          >
            {desc}
          </div>
        )}
      </div>
      <Toggle checked={checked} onChange={onChange} aria-label={label} />
    </div>
  )
}

export default function Settings() {
  const {
    userProfile,

    updateUserProfile,

    settings,

    updateSettings,

    setTheme,

    exportDataJSON,

    clearAllData,

    resetSampleData,
  } = useApp()

  const { user } = useAuth()

  // Profile Modal State

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)

  const [name, setName] = useState(userProfile.name)

  const [email, setEmail] = useState(userProfile.email)

  // Clear / Reset confirmation modals

  const [isClearDataConfirmOpen, setIsClearDataConfirmOpen] = useState(false)

  const [isResetSampleConfirmOpen, setIsResetSampleConfirmOpen] =
    useState(false)

  // Local Data Migration State

  const [migrationPreview, setMigrationPreview] =
    useState<MigrationPreview | null>(null)

  const [migrationResult, setMigrationResult] =
    useState<MigrationResult | null>(null)

  const [migrationStep, setMigrationStep] =
    useState<"preview" | "confirm" | "running" | "complete">("preview")

  const [migrationError, setMigrationError] = useState<string | null>(null)

  const handlePreviewMigration = () => {
    setMigrationPreview(dataMigrationService.getPreview())

    setMigrationStep("preview")

    setMigrationResult(null)

    setMigrationError(null)
  }

  const handleStartMigration = async () => {
    setMigrationStep("running")

    setMigrationError(null)

    try {
      const result = await dataMigrationService.migrateAll()

      setMigrationResult(result)

      setMigrationStep("complete")
    } catch (error) {
      setMigrationError(
        error instanceof Error ? error.message : "Migration failed",
      )

      setMigrationStep("preview")
    }
  }

  const handleDownloadBackup = () => {
    dataMigrationService.downloadBackup()
  }

  const handleCloseMigration = () => {
    setMigrationPreview(null)

    setMigrationResult(null)

    setMigrationStep("preview")

    setMigrationError(null)
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) return

    updateUserProfile({
      name: name.trim(),

      email: email.trim() || userProfile.email,
    })

    setIsEditProfileOpen(false)
  }

  const studyGoals = ["2h", "3h", "4h", "5h", "6h"]

  const pomodoroLengths = [25, 45, 60, 90]

  return (
    <div className="flex flex-col gap-5 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-extrabold"
          style={{
            fontFamily: "Plus Jakarta Sans",
            color: "var(--foreground)",
          }}
        >
          Settings & Preferences
        </h1>
        <p
          className="text-sm mt-1"
          style={{ color: "var(--muted-foreground)" }}
        >
          Customize your profile, notification triggers, AI features, and data
          storage.
        </p>
      </div>

      {/* Profile Section */}
      <Section title="User Profile">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-extrabold shrink-0 shadow-sm"
            style={{
              background: "linear-gradient(135deg, #19b88f, #5b8def)",

              color: "#fff",

              fontFamily: "Plus Jakarta Sans",
            }}
          >
            {userProfile.avatar || userProfile.name.charAt(0) || "M"}
          </div>
          <div className="flex-1 min-w-0">
            <div
              className="text-base font-bold truncate"
              style={{
                color: "var(--foreground)",
                fontFamily: "Plus Jakarta Sans",
              }}
            >
              {userProfile.name}
            </div>
            <div
              className="text-xs truncate"
              style={{ color: "var(--muted-foreground)" }}
            >
              {userProfile.email}
            </div>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold mt-1 inline-block"
              style={{ background: "rgba(25,184,143,0.12)", color: "#19b88f" }}
            >
              {userProfile.tier} Edition
            </span>
          </div>
          <button
            onClick={() => {
              setName(userProfile.name)

              setEmail(userProfile.email)

              setIsEditProfileOpen(true)
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer border-none transition-colors shrink-0"
            style={{ background: "var(--muted)", color: "var(--foreground)" }}
          >
            Edit Profile
          </button>
        </div>
      </Section>

      {/* Appearance Section */}
      <Section title="Appearance & Themes">
        <div
          className="text-xs font-semibold mb-3"
          style={{ color: "var(--muted-foreground)" }}
        >
          Mode Preference
        </div>
        <div className="grid grid-cols-3 gap-2 mb-5">
          {[
            { label: "Light", value: "light" as ThemeMode, icon: "☀️" },

            { label: "Dark", value: "dark" as ThemeMode, icon: "🌙" },

            { label: "System", value: "system" as ThemeMode, icon: "💻" },
          ].map((t) => {
            const active = settings.theme === t.value

            return (
              <button
                key={t.label}
                onClick={() => setTheme(t.value)}
                className="py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer min-h-[48px] focus-visible:ring-2 focus-visible:ring-emerald-400"
                style={{
                  background: active ? "rgba(25,184,143,0.12)" : "var(--muted)",

                  border: `1px solid ${
                    active ? "var(--primary)" : "transparent"
                  }`,

                  color: active ? "var(--primary)" : "var(--muted-foreground)",
                }}
                aria-label={`Set theme mode to ${t.label}`}
              >
                <span style={{ fontSize: "18px" }}>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            )
          })}
        </div>

        <div
          className="text-xs font-semibold mb-3"
          style={{ color: "var(--muted-foreground)" }}
        >
          Color & Artistic Theme
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            {
              id: "default" as const,

              name: "Emerald Default",

              description: "Modern clean emerald & slate",

              primary: "#19b88f",

              secondary: "#5b8def",

              accent: "#f59e0b",

              badge: "Original",
            },

            {
              id: "hellokitty" as const,

              name: "Hello Kitty",

              description: "Pastel pink, ruby red & bow motifs",

              primary: "#ff4d88",

              secondary: "#ff75a0",

              accent: "#ff2d55",

              badge: "Pastel",
            },

            {
              id: "spiderman" as const,

              name: "Spider-Man",

              description: "Crimson, navy & swaying spider art",

              primary: "#e62429",

              secondary: "#1d4ed8",

              accent: "#2563eb",

              badge: "Heroic",
            },

            {
              id: "ancient" as const,

              name: "Black Ancient",

              description: "Deep stone, antique gold & serif type",

              primary: "#d4af37",

              secondary: "#c59b27",

              accent: "#e5c158",

              badge: "Classical",
            },

            {
              id: "school" as const,

              name: "School Notebook",

              description: "Lined paper styling & bright inks",

              primary: "#2563eb",

              secondary: "#f59e0b",

              accent: "#10b981",

              badge: "Academic",
            },

            {
              id: "library" as const,

              name: "Library & Study",

              description: "Warm mahogany, burgundy & forest tones",

              primary: "#2e604a",

              secondary: "#8c2d38",

              accent: "#b45309",

              badge: "Literary",
            },
          ].map((themeOpt) => {
            const isSelected =
              (settings.colorTheme || "default") === themeOpt.id

            return (
              <button
                key={themeOpt.id}
                onClick={() => updateSettings({ colorTheme: themeOpt.id })}
                className="p-3.5 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between gap-3 min-h-[105px] focus-visible:ring-2 focus-visible:ring-emerald-400"
                style={{
                  background: isSelected
                    ? "rgba(25, 184, 143, 0.08)"
                    : "var(--muted)",

                  border: `2px solid ${
                    isSelected ? "var(--primary)" : "var(--border)"
                  }`,
                }}
                aria-label={`Select ${themeOpt.name} theme`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className="text-xs font-bold truncate"
                    style={{ color: "var(--foreground)" }}
                  >
                    {themeOpt.name}
                  </span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                    style={{
                      background: `${themeOpt.primary}20`,
                      color: themeOpt.primary,
                    }}
                  >
                    {themeOpt.badge}
                  </span>
                </div>

                <p className="text-[11px] leading-tight text-muted-foreground line-clamp-2">
                  {themeOpt.description}
                </p>

                {/* Color swatches preview */}
                <div className="flex items-center gap-1.5 pt-1">
                  <div
                    className="w-5 h-5 rounded-full shadow-inner border border-white/20"
                    style={{ background: themeOpt.primary }}
                    title="Primary"
                  />
                  <div
                    className="w-5 h-5 rounded-full shadow-inner border border-white/20"
                    style={{ background: themeOpt.secondary }}
                    title="Secondary"
                  />
                  <div
                    className="w-5 h-5 rounded-full shadow-inner border border-white/20"
                    style={{ background: themeOpt.accent }}
                    title="Accent"
                  />
                  {isSelected && (
                    <span
                      className="ml-auto text-xs font-bold"
                      style={{ color: "var(--primary)" }}
                    >
                      Active ✓
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </Section>

      {/* Notifications Section */}
      <Section title="Notifications & Alerts">
        <SettingRow
          label="Study reminders"
          desc="Remind me to study at scheduled focus windows"
          checked={settings.notifications.studyReminders}
          onChange={() =>
            updateSettings({
              notifications: {
                ...settings.notifications,

                studyReminders: !settings.notifications.studyReminders,
              },
            })
          }
        />
        <SettingRow
          label="Workout reminders"
          desc="Alerts for planned workout routines"
          checked={settings.notifications.workoutReminders}
          onChange={() =>
            updateSettings({
              notifications: {
                ...settings.notifications,

                workoutReminders: !settings.notifications.workoutReminders,
              },
            })
          }
        />
        <SettingRow
          label="Task deadlines"
          desc="Alert me when tasks or assignments are approaching due date"
          checked={settings.notifications.taskDeadlines}
          onChange={() =>
            updateSettings({
              notifications: {
                ...settings.notifications,

                taskDeadlines: !settings.notifications.taskDeadlines,
              },
            })
          }
        />
        <SettingRow
          label="AI weekly review"
          desc="Generate and notify when weekly review insights are ready"
          checked={settings.notifications.aiWeeklyReview}
          onChange={() =>
            updateSettings({
              notifications: {
                ...settings.notifications,

                aiWeeklyReview: !settings.notifications.aiWeeklyReview,
              },
            })
          }
        />
        <SettingRow
          label="Streak alerts"
          desc="Keep me motivated with streak preservation alerts"
          checked={settings.notifications.streakAlerts}
          onChange={() =>
            updateSettings({
              notifications: {
                ...settings.notifications,

                streakAlerts: !settings.notifications.streakAlerts,
              },
            })
          }
        />
      </Section>

      {/* AI Preferences Section */}
      <Section title="AI Intelligence Preferences">
        <SettingRow
          label="AI Coach suggestions"
          desc="Allow AI Coach to suggest personalized daily schedules"
          checked={settings.aiPreferences.coachSuggestions}
          onChange={() =>
            updateSettings({
              aiPreferences: {
                ...settings.aiPreferences,

                coachSuggestions: !settings.aiPreferences.coachSuggestions,
              },
            })
          }
        />
        <SettingRow
          label="Auto-generate tasks"
          desc="Enable structured task breakdown from natural language"
          checked={settings.aiPreferences.autoGenerateTasks}
          onChange={() =>
            updateSettings({
              aiPreferences: {
                ...settings.aiPreferences,

                autoGenerateTasks: !settings.aiPreferences.autoGenerateTasks,
              },
            })
          }
        />
        <SettingRow
          label="Personalized insights"
          desc="Analyze study hours and workout history for productivity suggestions"
          checked={settings.aiPreferences.personalizedInsights}
          onChange={() =>
            updateSettings({
              aiPreferences: {
                ...settings.aiPreferences,

                personalizedInsights:
                  !settings.aiPreferences.personalizedInsights,
              },
            })
          }
        />
      </Section>

      {/* Study & Workout Goals Section */}
      <Section title="Habit Targets & Pomodoro">
        <div className="flex flex-col gap-4">
          <div>
            <div
              className="text-xs font-semibold mb-2"
              style={{ color: "var(--muted-foreground)" }}
            >
              Daily Study Goal (Hours)
            </div>
            <div className="flex flex-wrap gap-2">
              {studyGoals.map((g) => {
                const hoursNum = parseInt(g, 10)

                const active = userProfile.dailyStudyGoalHours === hoursNum

                return (
                  <button
                    key={g}
                    onClick={() =>
                      updateUserProfile({ dailyStudyGoalHours: hoursNum })
                    }
                    className="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    style={{
                      background: active ? "#19b88f" : "var(--muted)",

                      color: active ? "#fff" : "var(--muted-foreground)",

                      border: "none",
                    }}
                  >
                    {g}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <div
              className="text-xs font-semibold mb-2"
              style={{ color: "var(--muted-foreground)" }}
            >
              Pomodoro Session Length
            </div>
            <div className="flex flex-wrap gap-2">
              {pomodoroLengths.map((p) => {
                const active = userProfile.pomodoroMinutes === p

                return (
                  <button
                    key={p}
                    onClick={() => updateUserProfile({ pomodoroMinutes: p })}
                    className="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    style={{
                      background: active ? "#19b88f" : "var(--muted)",

                      color: active ? "#fff" : "var(--muted-foreground)",

                      border: "none",
                    }}
                  >
                    {p} min
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </Section>

      {/* Data & Storage Management */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: "rgba(228,91,91,0.05)",
          border: "1px solid rgba(228,91,91,0.2)",
        }}
      >
        <h2
          className="text-sm font-bold mb-2"
          style={{ fontFamily: "Plus Jakarta Sans", color: "#e45b5b" }}
        >
          Data Backup & Reset
        </h2>
        <p
          className="text-xs mb-4 leading-relaxed"
          style={{ color: "var(--muted-foreground)" }}
        >
          Export your entire LifeTrack database as JSON, reset to the initial
          demonstration dataset, or clear your local browser storage.
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={exportDataJSON}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border-none shadow-sm"
            style={{ background: "var(--card)", color: "var(--foreground)" }}
          >
            💾 Export Data (JSON)
          </button>
          <button
            onClick={() => setIsResetSampleConfirmOpen(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border-none"
            style={{ background: "var(--muted)", color: "#19b88f" }}
          >
            🔄 Reset Demo Data
          </button>
          <button
            onClick={() => setIsClearDataConfirmOpen(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border-none"
            style={{ background: "rgba(228,91,91,0.15)", color: "#e45b5b" }}
          >
            ⚠️ Clear All Local Data
          </button>
        </div>

        {user && (
          <div
            className="border-t pt-4"
            style={{ borderColor: "var(--border)" }}
          >
            <h3
              className="text-xs font-semibold mb-3 flex items-center gap-2"
              style={{ color: "var(--foreground)" }}
            >
              <Database size={14} style={{ color: "#19b88f" }} />
              Import Local Data to Cloud
            </h3>
            <p
              className="text-xs mb-4 leading-relaxed"
              style={{ color: "var(--muted-foreground)" }}
            >
              You have data stored locally in this browser. Import it into your
              cloud account to access it across devices. Your local data will
              remain intact until you choose to remove it.
            </p>

            {migrationStep === "preview" && migrationPreview && (
              <div
                className="rounded-xl p-4 mb-4"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div
                    className="text-center p-2 rounded-lg"
                    style={{ background: "var(--muted)" }}
                  >
                    <div
                      className="text-xl font-bold"
                      style={{ color: "var(--foreground)" }}
                    >
                      {migrationPreview.tasks}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Tasks
                    </div>
                  </div>
                  <div
                    className="text-center p-2 rounded-lg"
                    style={{ background: "var(--muted)" }}
                  >
                    <div
                      className="text-xl font-bold"
                      style={{ color: "var(--foreground)" }}
                    >
                      {migrationPreview.subjects}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Subjects
                    </div>
                  </div>
                  <div
                    className="text-center p-2 rounded-lg"
                    style={{ background: "var(--muted)" }}
                  >
                    <div
                      className="text-xl font-bold"
                      style={{ color: "var(--foreground)" }}
                    >
                      {migrationPreview.studySessions}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Study Sessions
                    </div>
                  </div>
                  <div
                    className="text-center p-2 rounded-lg"
                    style={{ background: "var(--muted)" }}
                  >
                    <div
                      className="text-xl font-bold"
                      style={{ color: "var(--foreground)" }}
                    >
                      {migrationPreview.workouts}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Workouts
                    </div>
                  </div>
                  <div
                    className="text-center p-2 rounded-lg"
                    style={{ background: "var(--muted)" }}
                  >
                    <div
                      className="text-xl font-bold"
                      style={{ color: "var(--foreground)" }}
                    >
                      {migrationPreview.customEvents}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Events
                    </div>
                  </div>
                  <div
                    className="text-center p-2 rounded-lg"
                    style={{ background: "var(--muted)" }}
                  >
                    <div
                      className="text-xl font-bold"
                      style={{ color: "var(--foreground)" }}
                    >
                      {migrationPreview.chatMessages}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Chat Messages
                    </div>
                  </div>
                  <div
                    className="text-center p-2 rounded-lg"
                    style={{ background: "var(--muted)" }}
                  >
                    <div
                      className="text-xl font-bold"
                      style={{ color: "var(--foreground)" }}
                    >
                      {migrationPreview.hasProfile ? "✓" : "✗"}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Profile
                    </div>
                  </div>
                  <div
                    className="text-center p-2 rounded-lg"
                    style={{ background: "var(--muted)" }}
                  >
                    <div
                      className="text-xl font-bold"
                      style={{ color: "var(--foreground)" }}
                    >
                      {migrationPreview.hasSettings ? "✓" : "✗"}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Settings
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleStartMigration}
                    className="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
                    style={{
                      background: "#19b88f",
                      color: "#fff",
                      border: "none",
                    }}
                  >
                    <Upload size={14} /> Import to Cloud
                  </button>
                  <button
                    onClick={handleDownloadBackup}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border-none flex items-center justify-center gap-2"
                    style={{
                      background: "var(--card)",
                      color: "var(--foreground)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <Download size={14} /> Backup JSON
                  </button>
                  <button
                    onClick={handleCloseMigration}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                    style={{
                      background: "var(--muted)",
                      color: "var(--foreground)",
                      border: "none",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {migrationStep === "running" && (
              <div
                className="rounded-xl p-6 text-center"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                }}
              >
                <Loader2
                  size={32}
                  className="mx-auto mb-4 animate-spin"
                  style={{ color: "#19b88f" }}
                />
                <div
                  className="text-sm font-semibold mb-2"
                  style={{ color: "var(--foreground)" }}
                >
                  Importing your data...
                </div>
                <div
                  className="text-xs"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Please wait, this may take a moment
                </div>
              </div>
            )}

            {migrationStep === "complete" && migrationResult && (
              <div
                className="rounded-xl p-4"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      background: migrationResult.success
                        ? "rgba(25,184,143,0.1)"
                        : "rgba(228,91,91,0.1)",
                      color: migrationResult.success ? "#19b88f" : "#e45b5b",
                    }}
                  >
                    {migrationResult.success ? (
                      <CheckCircle2 size={24} />
                    ) : (
                      <AlertCircle size={24} />
                    )}
                  </div>
                  <div>
                    <div
                      className="text-sm font-bold"
                      style={{
                        color: migrationResult.success ? "#19b88f" : "#e45b5b",
                      }}
                    >
                      {migrationResult.success
                        ? "Import Complete!"
                        : "Import Completed with Errors"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {migrationResult.imported.tasks} tasks,{" "}
                      {migrationResult.imported.subjects} subjects,{" "}
                      {migrationResult.imported.studySessions} sessions,{" "}
                      {migrationResult.imported.workouts} workouts
                    </div>
                  </div>
                </div>

                {migrationResult.errors.length > 0 && (
                  <div
                    className="mb-4 p-3 rounded-lg"
                    style={{
                      background: "rgba(228,91,91,0.1)",
                      border: "1px solid rgba(228,91,91,0.2)",
                    }}
                  >
                    <div
                      className="text-xs font-semibold mb-2"
                      style={{ color: "#e45b5b" }}
                    >
                      Errors:
                    </div>
                    <ul
                      className="text-xs space-y-1"
                      style={{ color: "#e45b5b" }}
                    >
                      {migrationResult.errors.map((err, i) => (
                        <li key={i}>• {err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleCloseMigration}
                    className="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold"
                    style={{
                      background: "#19b88f",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Done
                  </button>
                  <button
                    onClick={handleDownloadBackup}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold border-none flex items-center justify-center gap-2"
                    style={{
                      background: "var(--card)",
                      color: "var(--foreground)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <Download size={14} /> Download Backup
                  </button>
                </div>
              </div>
            )}

            {migrationStep === "preview" && !migrationPreview && (
              <button
                onClick={handlePreviewMigration}
                className="w-full px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer border-none flex items-center justify-center gap-2"
                style={{
                  background: "rgba(25,184,143,0.1)",
                  color: "#19b88f",
                  border: "1px dashed rgba(25,184,143,0.4)",
                }}
              >
                <Database size={16} /> Check for Local Data to Import
              </button>
            )}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        title="Edit Profile"
      >
        <form onSubmit={handleSaveProfile} className="flex flex-col gap-4 mt-2">
          <div>
            <label className="text-xs font-semibold block mb-1">
              Your Name *
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
              style={{
                background: "var(--muted)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
              style={{
                background: "var(--muted)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            />
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <button
              type="button"
              onClick={() => setIsEditProfileOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
              style={{
                background: "var(--muted)",
                color: "var(--foreground)",
                border: "none",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer shadow-sm"
              style={{ background: "#19b88f", color: "#fff", border: "none" }}
            >
              Save Profile
            </button>
          </div>
        </form>
      </Modal>

      {/* Clear Data Confirmation */}
      <ConfirmDialog
        isOpen={isClearDataConfirmOpen}
        onClose={() => setIsClearDataConfirmOpen(false)}
        onConfirm={clearAllData}
        title="Clear All Local Data"
        message="This will wipe all tasks, subjects, study sessions, and workouts saved in your browser storage. Are you sure?"
        confirmText="Yes, Wipe Data"
        isDestructive={true}
      />

      {/* Reset Sample Confirmation */}
      <ConfirmDialog
        isOpen={isResetSampleConfirmOpen}
        onClose={() => setIsResetSampleConfirmOpen(false)}
        onConfirm={resetSampleData}
        title="Reset to Sample Demonstration Data"
        message="This will replace current local data with the initial curated demo dataset. Continue?"
        confirmText="Reset Sample Data"
        isDestructive={false}
      />
    </div>
  )
}
