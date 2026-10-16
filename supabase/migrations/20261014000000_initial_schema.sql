-- LifeTrack AI - Initial Schema Migration
-- Created: 2026-10-14
-- Description: Complete database schema for LifeTrack AI with RLS policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT,
  avatar TEXT,
  tier TEXT DEFAULT 'Free',
  daily_study_goal_hours INTEGER DEFAULT 4,
  pomodoro_minutes INTEGER DEFAULT 45,
  workout_goal_per_week INTEGER DEFAULT 4,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TASKS
-- ============================================================
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  priority TEXT NOT NULL CHECK (priority IN ('High', 'Medium', 'Low')),
  due_date DATE NOT NULL,
  est_minutes INTEGER DEFAULT 60,
  done BOOLEAN DEFAULT FALSE,
  ai_generated BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SUBJECTS
-- ============================================================
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#19b88f',
  target_hours INTEGER DEFAULT 10,
  studied_minutes INTEGER DEFAULT 0,
  last_studied DATE,
  topics TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STUDY SESSIONS
-- ============================================================
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  subject_name TEXT NOT NULL,
  topic TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  date DATE NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- WORKOUTS (normalized: workout -> exercises -> sets)
-- ============================================================
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Upper Body', 'Legs', 'Cardio', 'Core & Abs', 'Full Body', 'Push', 'Pull', 'Other')),
  duration_minutes INTEGER DEFAULT 45,
  status TEXT NOT NULL CHECK (status IN ('Completed', 'Planned')),
  date DATE NOT NULL,
  color TEXT DEFAULT '#19b88f',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workout_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  personal_best_kg NUMERIC(6,2),
  exercise_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE exercise_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exercise_id UUID NOT NULL REFERENCES workout_exercises(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  weight_kg NUMERIC(6,2) DEFAULT 0,
  reps INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CUSTOM EVENTS
-- ============================================================
CREATE TABLE custom_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT,
  type TEXT NOT NULL CHECK (type IN ('study', 'workout', 'task', 'uni', 'ai', 'other')),
  color TEXT DEFAULT '#5b8def',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- USER SETTINGS (1:1 with user)
-- ============================================================
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'system')),
  color_theme TEXT DEFAULT 'default',
  notifications JSONB DEFAULT '{"studyReminders":true,"workoutReminders":true,"taskDeadlines":true,"aiWeeklyReview":true,"streakAlerts":true}',
  ai_preferences JSONB DEFAULT '{"coachSuggestions":true,"autoGenerateTasks":true,"personalizedInsights":true}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CHAT MESSAGES
-- ============================================================
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'ai')),
  text TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FOCUS TIMER STATE (1:1 with user)
-- ============================================================
CREATE TABLE focus_timer_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT FALSE,
  is_paused BOOLEAN DEFAULT FALSE,
  seconds INTEGER DEFAULT 0,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  subject_name TEXT,
  topic TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  start_timestamp BIGINT,
  accumulated_seconds INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_due_date ON tasks(user_id, due_date);
CREATE INDEX idx_tasks_done ON tasks(user_id, done);
CREATE INDEX idx_subjects_user_id ON subjects(user_id);
CREATE INDEX idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX idx_study_sessions_date ON study_sessions(user_id, date);
CREATE INDEX idx_study_sessions_subject ON study_sessions(subject_id);
CREATE INDEX idx_workouts_user_id ON workouts(user_id);
CREATE INDEX idx_workouts_date ON workouts(user_id, date);
CREATE INDEX idx_workout_exercises_workout_id ON workout_exercises(workout_id);
CREATE INDEX idx_exercise_sets_exercise_id ON exercise_sets(exercise_id);
CREATE INDEX idx_custom_events_user_id ON custom_events(user_id);
CREATE INDEX idx_custom_events_date ON custom_events(user_id, date);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_timer_state ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Tasks
CREATE POLICY "Users can CRUD own tasks" ON tasks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Subjects
CREATE POLICY "Users can CRUD own subjects" ON subjects FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Study Sessions
CREATE POLICY "Users can CRUD own study sessions" ON study_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Workouts
CREATE POLICY "Users can CRUD own workouts" ON workouts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Workout Exercises (protected via workout ownership)
CREATE POLICY "Users can CRUD own workout exercises" ON workout_exercises FOR ALL USING (
  auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM workouts w WHERE w.id = workout_exercises.workout_id AND w.user_id = auth.uid()
  )
) WITH CHECK (
  auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM workouts w WHERE w.id = workout_exercises.workout_id AND w.user_id = auth.uid()
  )
);

-- Exercise Sets (protected via exercise -> workout ownership)
CREATE POLICY "Users can CRUD own exercise sets" ON exercise_sets FOR ALL USING (
  auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM workout_exercises we
    JOIN workouts w ON w.id = we.workout_id
    WHERE we.id = exercise_sets.exercise_id AND w.user_id = auth.uid()
  )
) WITH CHECK (
  auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM workout_exercises we
    JOIN workouts w ON w.id = we.workout_id
    WHERE we.id = exercise_sets.exercise_id AND w.user_id = auth.uid()
  )
);

-- Custom Events
CREATE POLICY "Users can CRUD own custom events" ON custom_events FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- User Settings
CREATE POLICY "Users can manage own settings" ON user_settings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Chat Messages
CREATE POLICY "Users can CRUD own chat messages" ON chat_messages FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Focus Timer State
CREATE POLICY "Users can manage own focus timer" ON focus_timer_state FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_workouts_updated_at BEFORE UPDATE ON workouts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_focus_timer_state_updated_at BEFORE UPDATE ON focus_timer_state FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Get user's study streak (consecutive days with study sessions)
CREATE OR REPLACE FUNCTION public.get_study_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_streak INTEGER := 0;
  v_check_date DATE := CURRENT_DATE;
  v_has_session BOOLEAN;
BEGIN
  -- If no session today, check yesterday
  SELECT EXISTS(SELECT 1 FROM study_sessions WHERE user_id = p_user_id AND date = v_check_date) INTO v_has_session;
  IF NOT v_has_session THEN
    v_check_date := v_check_date - INTERVAL '1 day';
    SELECT EXISTS(SELECT 1 FROM study_sessions WHERE user_id = p_user_id AND date = v_check_date) INTO v_has_session;
    IF NOT v_has_session THEN
      RETURN 0;
    END IF;
  END IF;

  -- Count consecutive days
  WHILE TRUE LOOP
    SELECT EXISTS(SELECT 1 FROM study_sessions WHERE user_id = p_user_id AND date = v_check_date) INTO v_has_session;
    IF v_has_session THEN
      v_streak := v_streak + 1;
      v_check_date := v_check_date - INTERVAL '1 day';
    ELSE
      EXIT;
    END IF;
  END LOOP;

  RETURN v_streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's workout streak
CREATE OR REPLACE FUNCTION public.get_workout_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_streak INTEGER := 0;
  v_check_date DATE := CURRENT_DATE;
  v_has_workout BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM workouts WHERE user_id = p_user_id AND status = 'Completed' AND date = v_check_date) INTO v_has_workout;
  IF NOT v_has_workout THEN
    v_check_date := v_check_date - INTERVAL '1 day';
    SELECT EXISTS(SELECT 1 FROM workouts WHERE user_id = p_user_id AND status = 'Completed' AND date = v_check_date) INTO v_has_workout;
    IF NOT v_has_workout THEN
      RETURN 0;
    END IF;
  END IF;

  WHILE TRUE LOOP
    SELECT EXISTS(SELECT 1 FROM workouts WHERE user_id = p_user_id AND status = 'Completed' AND date = v_check_date) INTO v_has_workout;
    IF v_has_workout THEN
      v_streak := v_streak + 1;
      v_check_date := v_check_date - INTERVAL '1 day';
    ELSE
      EXIT;
    END IF;
  END LOOP;

  RETURN v_streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;