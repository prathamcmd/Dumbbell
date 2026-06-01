import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext(null);

// ─── Default Data Structures ────────────────────────────────────────────────
const DEFAULT_PROFILE = {
  name: 'Pratham',
  age: '',
  height: '',
  weight: '',
  goalWeight: '',
  bodyFat: '',
  goal: 'muscle_gain', // 'weight_loss' | 'muscle_gain' | 'maintenance'
  activityLevel: 'moderate',
  gender: 'male',
  joinedDate: new Date().toISOString().split('T')[0],
};

const DEFAULT_SCHEDULE = {
  mon: { label: 'Monday', muscles: [], exercises: [], restDay: false },
  tue: { label: 'Tuesday', muscles: [], exercises: [], restDay: false },
  wed: { label: 'Wednesday', muscles: [], exercises: [], restDay: true },
  thu: { label: 'Thursday', muscles: [], exercises: [], restDay: false },
  fri: { label: 'Friday', muscles: [], exercises: [], restDay: false },
  sat: { label: 'Saturday', muscles: [], exercises: [], restDay: false },
  sun: { label: 'Sunday', muscles: [], exercises: [], restDay: true },
};

const DEFAULT_STREAK = { current: 0, longest: 0, lastDate: null };

// ─── Helper ──────────────────────────────────────────────────────────────────
function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── Provider ────────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [profile, setProfileState] = useState(() => load('mdb_profile', DEFAULT_PROFILE));
  const [schedule, setScheduleState] = useState(() => load('mdb_schedule', DEFAULT_SCHEDULE));
  const [streak, setStreakState] = useState(() => load('mdb_streak', DEFAULT_STREAK));
  const [completedWorkouts, setCompletedWorkoutsState] = useState(() => load('mdb_completed', []));
  const [meals, setMealsState] = useState(() => load('mdb_meals', []));
  const [metricsHistory, setMetricsHistoryState] = useState(() => load('mdb_metrics', []));

  // ─── Persist helpers ──────────────────────────────────────────────────────
  const updateProfile = useCallback((data) => {
    setProfileState(prev => { const n = { ...prev, ...data }; save('mdb_profile', n); return n; });
  }, []);

  const updateSchedule = useCallback((data) => {
    setScheduleState(prev => { const n = { ...prev, ...data }; save('mdb_schedule', n); return n; });
  }, []);

  const addMetricsSnapshot = useCallback((metrics) => {
    setMetricsHistoryState(prev => {
      const n = [...prev, { ...metrics, date: new Date().toISOString().split('T')[0] }];
      save('mdb_metrics', n);
      return n;
    });
  }, []);

  // ─── Streak Logic ─────────────────────────────────────────────────────────
  const markWorkoutComplete = useCallback((dateStr, caloriesBurned = 0, exercises = []) => {
    const already = completedWorkouts.find(w => w.date === dateStr);
    if (already) return;

    const newCompleted = [...completedWorkouts, { date: dateStr, caloriesBurned, exercises }];
    save('mdb_completed', newCompleted);
    setCompletedWorkoutsState(newCompleted);

    setStreakState(prev => {
      const today = new Date(dateStr);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString().split('T')[0];

      let newCurrent = prev.lastDate === yStr ? prev.current + 1 : 1;
      const newStreak = {
        current: newCurrent,
        longest: Math.max(prev.longest, newCurrent),
        lastDate: dateStr,
      };
      save('mdb_streak', newStreak);
      return newStreak;
    });
  }, [completedWorkouts]);

  const isWorkoutCompleted = useCallback((dateStr) => {
    return completedWorkouts.some(w => w.date === dateStr);
  }, [completedWorkouts]);

  const getWorkoutByDate = useCallback((dateStr) => {
    return completedWorkouts.find(w => w.date === dateStr) || null;
  }, [completedWorkouts]);

  // ─── Meals Logic ─────────────────────────────────────────────────────────
  const addMeal = useCallback((meal) => {
    setMealsState(prev => {
      const n = [...prev, { ...meal, id: Date.now(), date: new Date().toISOString().split('T')[0] }];
      save('mdb_meals', n);
      return n;
    });
  }, []);

  const deleteMeal = useCallback((id) => {
    setMealsState(prev => {
      const n = prev.filter(m => m.id !== id);
      save('mdb_meals', n);
      return n;
    });
  }, []);

  const getTodayMeals = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return meals.filter(m => m.date === today);
  }, [meals]);

  const getMealsByDate = useCallback((dateStr) => {
    return meals.filter(m => m.date === dateStr);
  }, [meals]);

  // ─── Calorie Calculations ─────────────────────────────────────────────────
  const getTodayCaloriesBurned = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const w = getWorkoutByDate(today);
    return w ? w.caloriesBurned : 0;
  }, [getWorkoutByDate]);

  const calculateDailyCalorieGoal = useCallback(() => {
    const { weight, height, age, gender, activityLevel, goal } = profile;
    if (!weight || !height || !age) return 2000;
    const w = parseFloat(weight), h = parseFloat(height), a = parseInt(age);
    // Mifflin-St Jeor BMR
    const bmr = gender === 'female'
      ? 10 * w + 6.25 * h - 5 * a - 161
      : 10 * w + 6.25 * h - 5 * a + 5;
    const multipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
    const tdee = bmr * (multipliers[activityLevel] || 1.55);
    if (goal === 'weight_loss') return Math.round(tdee - 500);
    if (goal === 'muscle_gain') return Math.round(tdee + 300);
    return Math.round(tdee);
  }, [profile]);

  // ─── Today's workout from schedule ───────────────────────────────────────
  const getTodaySchedule = useCallback(() => {
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const dayKey = days[new Date().getDay()];
    return schedule[dayKey] || null;
  }, [schedule]);

  return (
    <AppContext.Provider value={{
      profile, updateProfile,
      schedule, updateSchedule,
      streak,
      completedWorkouts, markWorkoutComplete, isWorkoutCompleted, getWorkoutByDate,
      meals, addMeal, deleteMeal, getTodayMeals, getMealsByDate,
      getTodayCaloriesBurned, calculateDailyCalorieGoal,
      getTodaySchedule,
      metricsHistory, addMetricsSnapshot,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
