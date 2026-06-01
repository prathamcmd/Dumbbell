import React, { useState, useMemo } from 'react';
import { Flame, CheckCircle2, Circle, ChevronRight, Dumbbell, Trophy, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatDate(date) {
  return `${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

function getWeekDates() {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((day + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

// ─── Streak Card ─────────────────────────────────────────────────────────────
function StreakCard({ streak }) {
  return (
    <div className="card-red relative overflow-hidden mb-4">
      {/* Background dumbbell watermark */}
      <div className="absolute right-[-20px] top-[-10px] opacity-10">
        <Dumbbell size={120} />
      </div>

      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-red-200 text-xs font-semibold uppercase tracking-widest mb-1">Current Streak</p>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black">{streak.current}</span>
            <span className="text-xl font-semibold text-red-200">days</span>
          </div>
          <p className="text-red-200 text-xs mt-1">
            🏆 Best: <span className="text-white font-bold">{streak.longest} days</span>
          </p>
        </div>
        <div className="flex flex-col items-center">
          <span className="flame-icon text-5xl">🔥</span>
          <span className="text-red-200 text-xs mt-1 font-medium">Keep going!</span>
        </div>
      </div>

      {/* Subtle shine overlay */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%)' }}
      />
    </div>
  );
}

// ─── Week Day Strip ───────────────────────────────────────────────────────────
function WeekStrip({ weekDates, todayIdx, isWorkoutCompleted, schedule }) {
  return (
    <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-hide">
      {weekDates.map((date, i) => {
        const dayKey = DAY_KEYS[date.getDay()];
        const isToday = i === todayIdx;
        const dateStr = date.toISOString().split('T')[0];
        const done = isWorkoutCompleted(dateStr);
        const sched = schedule[dayKey];
        const isRest = sched?.restDay;
        const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

        return (
          <div
            key={i}
            className={`flex flex-col items-center flex-shrink-0 rounded-2xl px-3 py-2 min-w-[46px] transition-all duration-200
              ${isToday
                ? 'bg-surface text-white shadow-lg'
                : done
                ? 'bg-green-50 border border-green-200'
                : 'bg-white border border-gray-100'
              }`}
            style={isToday ? { boxShadow: '0 4px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)' } : {}}
          >
            <span className={`text-[10px] font-semibold uppercase ${isToday ? 'text-gray-400' : 'text-gray-400'}`}>
              {DAY_SHORT[date.getDay()]}
            </span>
            <span className={`text-base font-bold mt-0.5 ${isToday ? 'text-white' : isPast ? 'text-gray-400' : 'text-gray-800'}`}>
              {date.getDate()}
            </span>
            <div className="mt-1">
              {done
                ? <span className="text-green-500 text-[10px]">✓</span>
                : isRest
                ? <span className="text-gray-300 text-[10px]">–</span>
                : isToday
                ? <div className="w-1.5 h-1.5 rounded-full bg-primary-light" />
                : <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
              }
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Exercise Item ────────────────────────────────────────────────────────────
function ExerciseItem({ exercise, index }) {
  const [done, setDone] = useState(false);
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl mb-2 transition-all duration-200 cursor-pointer
        ${done ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-100'}`}
      onClick={() => setDone(p => !p)}
    >
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
        ${done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
        {done ? '✓' : index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${done ? 'text-green-700 line-through opacity-60' : 'text-gray-800'}`}>
          {exercise.name}
        </p>
        {(exercise.sets || exercise.reps || exercise.weight) && (
          <p className="text-xs text-gray-400 mt-0.5">
            {[exercise.sets && `${exercise.sets} sets`, exercise.reps && `${exercise.reps} reps`, exercise.weight && `${exercise.weight} kg`].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>
      {done
        ? <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
        : <Circle size={18} className="text-gray-300 flex-shrink-0" />
      }
    </div>
  );
}

// ─── Today Card ──────────────────────────────────────────────────────────────
function TodayCard({ todayDate, todaySchedule, isCompleted, onMarkComplete }) {
  const dateStr = todayDate.toISOString().split('T')[0];
  const dayName = DAY_LABELS[todayDate.getDay()];

  if (!todaySchedule || (todaySchedule.exercises.length === 0 && !todaySchedule.restDay)) {
    return (
      <div className="card border border-dashed border-gray-200 text-center py-8">
        <Dumbbell size={36} className="mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500 font-semibold">No workout set for today</p>
        <p className="text-gray-400 text-xs mt-1">Go to <strong>Tailor</strong> to set up your weekly schedule</p>
      </div>
    );
  }

  if (todaySchedule.restDay) {
    return (
      <div className="card border border-gray-100 text-center py-8">
        <span className="text-5xl mb-3 block">😴</span>
        <p className="text-gray-700 font-bold text-lg">Rest Day</p>
        <p className="text-gray-400 text-sm mt-1">Recovery is part of the process!</p>
      </div>
    );
  }

  return (
    <div className="card animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={14} className="text-primary" />
            <span className="text-xs text-primary font-semibold uppercase tracking-wide">Today</span>
          </div>
          <h2 className="text-xl font-black text-gray-900">{dayName}</h2>
          <p className="text-gray-400 text-sm">{formatDate(todayDate)}</p>
        </div>
        {isCompleted && (
          <div className="flex items-center gap-1 bg-green-100 text-green-700 rounded-full px-3 py-1.5">
            <CheckCircle2 size={14} />
            <span className="text-xs font-bold">Done!</span>
          </div>
        )}
      </div>

      {/* Muscle Tags */}
      {todaySchedule.muscles?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {todaySchedule.muscles.map(m => (
            <span key={m} className="badge-dark text-xs">{m}</span>
          ))}
        </div>
      )}

      {/* Exercise List */}
      <div className="section-title">Exercises</div>
      {todaySchedule.exercises.map((ex, i) => (
        <ExerciseItem key={i} exercise={ex} index={i} />
      ))}

      {/* Mark Complete */}
      {!isCompleted && (
        <button
          id="btn-mark-complete"
          className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
          onClick={onMarkComplete}
        >
          <CheckCircle2 size={18} />
          Mark Workout Complete
        </button>
      )}
    </div>
  );
}

// ─── Past Workouts ────────────────────────────────────────────────────────────
function PastWorkoutsSection({ completedWorkouts }) {
  const sorted = [...completedWorkouts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);
  if (sorted.length === 0) return null;

  return (
    <div className="mt-4">
      <div className="section-title">Recent Workouts</div>
      <div className="space-y-2">
        {sorted.map(w => (
          <div key={w.date} className="card flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-semibold text-gray-800">{w.date}</p>
              {w.caloriesBurned > 0 && (
                <p className="text-xs text-gray-400">🔥 {w.caloriesBurned} kcal burned</p>
              )}
            </div>
            <span className="badge-red">✓ Done</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RoutinePage() {
  const { streak, schedule, completedWorkouts, markWorkoutComplete, isWorkoutCompleted, getTodaySchedule } = useApp();
  const [showCalorieInput, setShowCalorieInput] = useState(false);
  const [calories, setCalories] = useState('');

  const todayDate = new Date();
  const todayStr = todayDate.toISOString().split('T')[0];
  const todaySchedule = getTodaySchedule();
  const isCompleted = isWorkoutCompleted(todayStr);

  const weekDates = useMemo(() => getWeekDates(), []);
  const todayIdx = useMemo(() => {
    const today = todayDate;
    return weekDates.findIndex(d => d.toDateString() === today.toDateString());
  }, [weekDates]);

  const handleMarkComplete = () => {
    setShowCalorieInput(true);
  };

  const handleConfirmComplete = () => {
    const cal = parseInt(calories) || 0;
    markWorkoutComplete(todayStr, cal, todaySchedule?.exercises || []);
    setShowCalorieInput(false);
    setCalories('');
  };

  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-black text-gray-900">My Routine</h1>
          <p className="text-gray-400 text-sm">Stay consistent, stay strong 💪</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center">
          <Trophy size={18} className="text-yellow-400" />
        </div>
      </div>

      {/* Streak Card */}
      <StreakCard streak={streak} />

      {/* Week Strip */}
      <WeekStrip
        weekDates={weekDates}
        todayIdx={todayIdx}
        isWorkoutCompleted={isWorkoutCompleted}
        schedule={schedule}
      />

      {/* Today's Workout */}
      <div className="section-title">Today's Workout</div>
      <TodayCard
        todayDate={todayDate}
        todaySchedule={todaySchedule}
        isCompleted={isCompleted}
        onMarkComplete={handleMarkComplete}
      />

      {/* Past Workouts */}
      <PastWorkoutsSection completedWorkouts={completedWorkouts} />

      {/* Calorie Input Modal */}
      {showCalorieInput && (
        <div className="modal-backdrop" onClick={() => setShowCalorieInput(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Great workout! 🎉</h3>
            <p className="text-gray-500 text-sm mb-4">Roughly how many calories did you burn?</p>
            <input
              id="input-calories-burned"
              type="number"
              placeholder="e.g. 350"
              className="input-field mb-4"
              value={calories}
              onChange={e => setCalories(e.target.value)}
              autoFocus
            />
            <div className="flex gap-3">
              <button className="btn-silver flex-1" onClick={() => setShowCalorieInput(false)}>Cancel</button>
              <button id="btn-confirm-complete" className="btn-primary flex-1" onClick={handleConfirmComplete}>
                Confirm ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
