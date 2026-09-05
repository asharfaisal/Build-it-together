import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { ThemeMode } from '../types'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <h2 className="text-sm font-700 mb-4" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

function Toggle({ checked, onChange, 'aria-label': ariaLabel }: { checked: boolean; onChange: () => void; 'aria-label'?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={onChange}
      className="relative inline-flex w-10 h-5 rounded-full transition-all cursor-pointer border-none shrink-0"
      style={{ background: checked ? '#19b88f' : 'var(--muted)', padding: 0 }}
    >
      <div
        className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
        style={{
          background: '#fff',
          left: checked ? '22px' : '2px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
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
      style={{ borderColor: 'var(--border)' }}
    >
      <div>
        <div className="text-xs sm:text-sm font-600" style={{ color: 'var(--foreground)' }}>
          {label}
        </div>
        {desc && (
          <div className="text-xs mt-0.5 leading-normal" style={{ color: 'var(--muted-foreground)' }}>
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

  // Profile Modal State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [name, setName] = useState(userProfile.name)
  const [email, setEmail] = useState(userProfile.email)

  // Clear / Reset confirmation modals
  const [isClearDataConfirmOpen, setIsClearDataConfirmOpen] = useState(false)
  const [isResetSampleConfirmOpen, setIsResetSampleConfirmOpen] = useState(false)

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    updateUserProfile({
      name: name.trim(),
      email: email.trim() || userProfile.email,
    })
    setIsEditProfileOpen(false)
  }

  const studyGoals = ['2h', '3h', '4h', '5h', '6h']
  const pomodoroLengths = [25, 45, 60, 90]

  return (
    <div className="flex flex-col gap-5 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-800" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>
          Settings & Preferences
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
          Customize your profile, notification triggers, AI features, and data storage.
        </p>
      </div>

      {/* Profile Section */}
      <Section title="User Profile">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-800 shrink-0 shadow-sm"
            style={{
              background: 'linear-gradient(135deg, #19b88f, #5b8def)',
              color: '#fff',
              fontFamily: 'Plus Jakarta Sans',
            }}
          >
            {userProfile.avatar || userProfile.name.charAt(0) || 'M'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-700 truncate" style={{ color: 'var(--foreground)', fontFamily: 'Plus Jakarta Sans' }}>
              {userProfile.name}
            </div>
            <div className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
              {userProfile.email}
            </div>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-600 mt-1 inline-block"
              style={{ background: 'rgba(25,184,143,0.12)', color: '#19b88f' }}
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
            className="px-3.5 py-2 rounded-xl text-xs font-600 cursor-pointer border-none transition-colors shrink-0"
            style={{ background: 'var(--muted)', color: 'var(--foreground)' }}
          >
            Edit Profile
          </button>
        </div>
      </Section>

      {/* Appearance Section */}
      <Section title="Appearance & Theme">
        <div className="text-xs font-600 mb-3" style={{ color: 'var(--muted-foreground)' }}>
          Theme Preference
        </div>
        <div className="grid grid-cols-3 gap-2 mb-2">
          {[
            { label: 'Light', value: 'light' as ThemeMode, icon: '☀️' },
            { label: 'Dark', value: 'dark' as ThemeMode, icon: '🌙' },
            { label: 'System', value: 'system' as ThemeMode, icon: '💻' },
          ].map((t) => {
            const active = settings.theme === t.value
            return (
              <button
                key={t.label}
                onClick={() => setTheme(t.value)}
                className="py-3 rounded-2xl text-xs sm:text-sm font-700 transition-all flex flex-col items-center gap-1.5 cursor-pointer"
                style={{
                  background: active ? 'rgba(25,184,143,0.12)' : 'var(--muted)',
                  border: `1px solid ${active ? '#19b88f' : 'transparent'}`,
                  color: active ? '#19b88f' : 'var(--muted-foreground)',
                }}
              >
                <span style={{ fontSize: '18px' }}>{t.icon}</span>
                <span>{t.label}</span>
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
                personalizedInsights: !settings.aiPreferences.personalizedInsights,
              },
            })
          }
        />
      </Section>

      {/* Study & Workout Goals Section */}
      <Section title="Habit Targets & Pomodoro">
        <div className="flex flex-col gap-4">
          <div>
            <div className="text-xs font-600 mb-2" style={{ color: 'var(--muted-foreground)' }}>
              Daily Study Goal (Hours)
            </div>
            <div className="flex flex-wrap gap-2">
              {studyGoals.map((g) => {
                const hoursNum = parseInt(g, 10)
                const active = userProfile.dailyStudyGoalHours === hoursNum
                return (
                  <button
                    key={g}
                    onClick={() => updateUserProfile({ dailyStudyGoalHours: hoursNum })}
                    className="px-4 py-2 rounded-xl text-xs font-700 transition-all cursor-pointer"
                    style={{
                      background: active ? '#19b88f' : 'var(--muted)',
                      color: active ? '#fff' : 'var(--muted-foreground)',
                      border: 'none',
                    }}
                  >
                    {g}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <div className="text-xs font-600 mb-2" style={{ color: 'var(--muted-foreground)' }}>
              Pomodoro Session Length
            </div>
            <div className="flex flex-wrap gap-2">
              {pomodoroLengths.map((p) => {
                const active = userProfile.pomodoroMinutes === p
                return (
                  <button
                    key={p}
                    onClick={() => updateUserProfile({ pomodoroMinutes: p })}
                    className="px-4 py-2 rounded-xl text-xs font-700 transition-all cursor-pointer"
                    style={{
                      background: active ? '#19b88f' : 'var(--muted)',
                      color: active ? '#fff' : 'var(--muted-foreground)',
                      border: 'none',
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
        style={{ background: 'rgba(228,91,91,0.05)', border: '1px solid rgba(228,91,91,0.2)' }}
      >
        <h2 className="text-sm font-700 mb-2" style={{ fontFamily: 'Plus Jakarta Sans', color: '#e45b5b' }}>
          Data Backup & Reset
        </h2>
        <p className="text-xs mb-4 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
          Export your entire LifeTrack database as JSON, reset to the initial demonstration dataset, or clear your
          local browser storage.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={exportDataJSON}
            className="px-4 py-2.5 rounded-xl text-xs font-600 transition-all cursor-pointer border-none shadow-sm"
            style={{ background: 'var(--card)', color: 'var(--foreground)' }}
          >
            💾 Export Data (JSON)
          </button>
          <button
            onClick={() => setIsResetSampleConfirmOpen(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-600 transition-all cursor-pointer border-none"
            style={{ background: 'var(--muted)', color: '#19b88f' }}
          >
            🔄 Reset Demo Data
          </button>
          <button
            onClick={() => setIsClearDataConfirmOpen(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-600 transition-all cursor-pointer border-none"
            style={{ background: 'rgba(228,91,91,0.15)', color: '#e45b5b' }}
          >
            ⚠️ Clear All Local Data
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        title="Edit Profile"
      >
        <form onSubmit={handleSaveProfile} className="flex flex-col gap-4 mt-2">
          <div>
            <label className="text-xs font-600 block mb-1">Your Name *</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            />
          </div>
          <div>
            <label className="text-xs font-600 block mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            />
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <button
              type="button"
              onClick={() => setIsEditProfileOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-600 cursor-pointer"
              style={{ background: 'var(--muted)', color: 'var(--foreground)', border: 'none' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-600 cursor-pointer shadow-sm"
              style={{ background: '#19b88f', color: '#fff', border: 'none' }}
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
