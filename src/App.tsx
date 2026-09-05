import React from 'react'
import { AppProvider, useApp } from './context/AppContext'
import Sidebar from './components/Sidebar'
import MobileNav from './components/MobileNav'
import Dashboard from './pages/Dashboard'
import Study from './pages/Study'
import Workout from './pages/Workout'
import Tasks from './pages/Tasks'
import Calendar from './pages/Calendar'
import Analytics from './pages/Analytics'
import AICoach from './pages/AICoach'
import Settings from './pages/Settings'

function AppContent() {
  const { page, isDark } = useApp()

  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return <Dashboard />
      case 'study':
        return <Study />
      case 'workout':
        return <Workout />
      case 'tasks':
        return <Tasks />
      case 'calendar':
        return <Calendar />
      case 'analytics':
        return <Analytics />
      case 'coach':
        return <AICoach />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className={isDark ? 'dark' : ''} style={{ minHeight: '100vh', width: '100%' }}>
      <div
        className="flex min-h-screen w-full transition-colors duration-200"
        style={{ background: 'var(--background)', color: 'var(--foreground)' }}
      >
        {/* Desktop Sidebar */}
        <div className="hidden md:flex">
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <main
          className="flex-1 overflow-y-auto scroll-thin w-full"
          style={{ minHeight: '100vh', paddingBottom: '90px' }}
        >
          <div className="px-4 py-5 sm:px-6 sm:py-7 md:px-8 md:py-7 max-w-full">
            {renderPage()}
          </div>
        </main>

        {/* Mobile Navigation */}
        <MobileNav />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
