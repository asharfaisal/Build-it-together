import React, { useState, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'

const suggestions = [
  'Analyze my week',
  "Create tomorrow's plan",
  'Why am I falling behind?',
  'What should I focus on?',
  'Create a study plan',
  'Analyze my workout progress',
]

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{
            background: '#19b88f',
            animation: `bounce 1.2s ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`}</style>
    </div>
  )
}

export default function AICoach() {
  const {
    chatMessages,
    sendMessageToCoach,
    clearChatHistory,
    isCoachTyping,
    coachPrefillPrompt,
    setCoachPrefillPrompt,
  } = useApp()

  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll on messages change or typing
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, isCoachTyping])

  // Process prefill prompt if routed from Dashboard or Analytics
  useEffect(() => {
    if (coachPrefillPrompt) {
      sendMessageToCoach(coachPrefillPrompt)
      setCoachPrefillPrompt(null)
    }
  }, [coachPrefillPrompt, sendMessageToCoach, setCoachPrefillPrompt])

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input
    if (!text.trim()) return
    sendMessageToCoach(text.trim())
    setInput('')
  }

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] md:h-[calc(100vh-100px)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(25,184,143,0.2), rgba(91,141,239,0.15))',
              border: '1px solid rgba(25,184,143,0.3)',
            }}
          >
            <span style={{ fontSize: '18px', color: '#19b88f' }}>✦</span>
          </div>
          <div>
            <h1 className="text-xl font-800" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>
              AI Coach & Strategist
            </h1>
            <p className="text-xs flex items-center gap-1.5" style={{ color: '#19b88f' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Synced with your live LifeTrack habits and metrics
            </p>
          </div>
        </div>

        <button
          onClick={clearChatHistory}
          className="text-xs px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}
          title="Reset conversation"
        >
          Clear Chat
        </button>
      </div>

      {/* Messages Scroll Container */}
      <div
        className="flex-1 overflow-y-auto scroll-thin flex flex-col gap-4 p-4 rounded-2xl mb-3"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          minHeight: 0,
        }}
      >
        {chatMessages.map((msg) => {
          const isUser = msg.role === 'user'
          return (
            <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-3 animate-in fade-in`}>
              {!isUser && (
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    background: 'rgba(25,184,143,0.15)',
                    border: '1px solid rgba(25,184,143,0.25)',
                    color: '#19b88f',
                    fontSize: '14px',
                  }}
                >
                  ✦
                </div>
              )}
              <div className="max-w-[85%] sm:max-w-[75%] flex flex-col gap-1">
                <div
                  className="px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-sm"
                  style={{
                    background: isUser ? '#19b88f' : 'var(--muted)',
                    color: isUser ? '#ffffff' : 'var(--foreground)',
                    border: isUser ? 'none' : '1px solid var(--border)',
                    borderRadius: isUser ? '20px 20px 4px 20px' : '4px 20px 20px 20px',
                  }}
                >
                  {msg.text}
                </div>
                <span
                  className="text-xs px-1"
                  style={{
                    color: 'var(--muted-foreground)',
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                    fontSize: '10px',
                  }}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          )
        })}

        {isCoachTyping && (
          <div className="flex justify-start gap-3 animate-in fade-in">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
              style={{
                background: 'rgba(25,184,143,0.15)',
                border: '1px solid rgba(25,184,143,0.25)',
                color: '#19b88f',
                fontSize: '14px',
              }}
            >
              ✦
            </div>
            <div
              className="rounded-2xl"
              style={{
                background: 'var(--muted)',
                border: '1px solid var(--border)',
                borderRadius: '4px 20px 20px 20px',
              }}
            >
              <TypingDots />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggested Prompts Pill Row */}
      <div className="flex flex-wrap gap-1.5 py-2 shrink-0 overflow-x-auto scroll-thin">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => handleSend(s)}
            className="text-xs px-3 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap"
            style={{
              background: 'var(--card)',
              color: 'var(--muted-foreground)',
              border: '1px solid var(--border)',
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#19b88f'
              ;(e.currentTarget as HTMLButtonElement).style.color = '#19b88f'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'
              ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--muted-foreground)'
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <div
        className="flex items-center gap-2 p-2 sm:p-2.5 rounded-2xl shrink-0 mt-1 shadow-sm"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Ask your AI Coach anything about your tasks, study retention, or workout goals…"
          className="flex-1 text-xs sm:text-sm outline-none px-3 bg-transparent"
          style={{ color: 'var(--foreground)' }}
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim()}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer border-none shrink-0 disabled:opacity-40"
          style={{
            background: '#19b88f',
            color: '#fff',
          }}
          title="Send message"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M13 1L6 8M13 1L9 13L6 8M13 1L1 5L6 8"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
