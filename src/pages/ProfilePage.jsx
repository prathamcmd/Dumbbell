import React, { useMemo } from 'react';
import { User, TrendingDown, Award, Calendar, BarChart2, PieChart as PieIcon } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useApp } from '../context/AppContext';

const RED = '#CC0000';
const RED_LIGHT = '#FF4444';
const DARK = '#1A1A1A';

// ─── Profile Card ─────────────────────────────────────────────────────────────
function ProfileCard({ profile }) {
  const bmi = useMemo(() => {
    if (!profile.weight || !profile.height) return null;
    const h = parseFloat(profile.height) / 100;
    return (parseFloat(profile.weight) / (h * h)).toFixed(1);
  }, [profile]);

  const goalEmojis = { weight_loss: '🔥', muscle_gain: '💪', maintenance: '⚖️' };
  const initials = (profile.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="card-dark relative overflow-hidden mb-4">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at top right, rgba(204,0,0,0.15), transparent 60%)' }} />
      <div className="flex items-center gap-4 relative z-10">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl font-black text-white"
          style={{ background: 'linear-gradient(135deg, #FF4444, #CC0000)', boxShadow: '0 4px 15px rgba(204,0,0,0.4)' }}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-black text-white truncate">{profile.name || 'Your Name'}</h2>
          <p className="text-gray-400 text-sm">
            {[profile.age && `${profile.age} yrs`, profile.gender && profile.gender].filter(Boolean).join(' · ') || 'Set up your profile'}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="badge-red text-[10px]">
              {goalEmojis[profile.goal]} {profile.goal?.replace('_', ' ') || 'No goal set'}
            </span>
            {bmi && <span className="badge-dark text-[10px]">BMI {bmi}</span>}
          </div>
        </div>
      </div>
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/10 relative z-10">
        {[
          { label: 'Weight', value: profile.weight ? `${profile.weight} kg` : '–' },
          { label: 'Height', value: profile.height ? `${profile.height} cm` : '–' },
          { label: 'Goal', value: profile.goalWeight ? `${profile.goalWeight} kg` : '–' },
        ].map(s => (
          <div key={s.label} className="text-center">
            <p className="text-white font-bold text-sm">{s.value}</p>
            <p className="text-gray-500 text-[10px]">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Weight Progress Chart ────────────────────────────────────────────────────
function WeightChart({ metricsHistory }) {
  if (metricsHistory.length < 2) {
    return (
      <div className="card mb-4">
        <p className="section-title">Weight Progress</p>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <TrendingDown size={32} className="text-gray-200 mb-2" />
          <p className="text-gray-400 text-sm font-medium">Not enough data yet</p>
          <p className="text-gray-300 text-xs mt-1">Update your metrics at least twice to see a graph</p>
        </div>
      </div>
    );
  }

  const data = metricsHistory.slice(-10).map(m => ({
    date: m.date?.slice(5) || '',
    weight: parseFloat(m.weight) || 0,
    bodyFat: parseFloat(m.bodyFat) || 0,
  }));

  return (
    <div className="card mb-4">
      <p className="section-title">Weight Progress (kg)</p>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#999' }} />
          <YAxis tick={{ fontSize: 10, fill: '#999' }} domain={['auto', 'auto']} />
          <Tooltip
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px' }}
            labelStyle={{ fontWeight: 'bold' }}
          />
          <Line type="monotone" dataKey="weight" stroke={RED} strokeWidth={2.5} dot={{ fill: RED, r: 4 }} activeDot={{ r: 6 }} name="Weight (kg)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Workout Consistency Chart ─────────────────────────────────────────────────
function WorkoutConsistencyChart({ completedWorkouts }) {
  const weeklyData = useMemo(() => {
    const weeks = {};
    completedWorkouts.forEach(w => {
      const d = new Date(w.date);
      const monday = new Date(d);
      monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
      const key = monday.toISOString().split('T')[0];
      weeks[key] = (weeks[key] || 0) + 1;
    });
    return Object.entries(weeks).slice(-8).map(([week, count]) => ({
      week: week.slice(5),
      workouts: count,
    }));
  }, [completedWorkouts]);

  if (weeklyData.length === 0) {
    return (
      <div className="card mb-4">
        <p className="section-title">Workout Consistency</p>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <BarChart2 size={32} className="text-gray-200 mb-2" />
          <p className="text-gray-400 text-sm font-medium">No workouts completed yet</p>
          <p className="text-gray-300 text-xs mt-1">Mark your first workout complete in Routine!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card mb-4">
      <p className="section-title">Weekly Workout Count</p>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={weeklyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
          <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#999' }} />
          <YAxis tick={{ fontSize: 10, fill: '#999' }} allowDecimals={false} />
          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px' }} />
          <Bar dataKey="workouts" fill={RED} radius={[6, 6, 0, 0]} name="Workouts" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Muscle Distribution Pie ──────────────────────────────────────────────────
const PIE_COLORS = ['#CC0000', '#FF4444', '#1A1A1A', '#3D3D3D', '#888888', '#AAAAAA', '#FF6666', '#660000'];

function MuscleDistributionChart({ schedule }) {
  const data = useMemo(() => {
    const counts = {};
    Object.values(schedule).forEach(day => {
      if (!day.restDay) {
        day.muscles?.forEach(m => { counts[m] = (counts[m] || 0) + 1; });
      }
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [schedule]);

  if (data.length === 0) {
    return (
      <div className="card mb-4">
        <p className="section-title">Muscle Group Distribution</p>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <PieIcon size={32} className="text-gray-200 mb-2" />
          <p className="text-gray-400 text-sm font-medium">Set your weekly schedule</p>
          <p className="text-gray-300 text-xs mt-1">Add muscle targets in Tailor → Weekly Schedule</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card mb-4">
      <p className="section-title">Muscle Group Focus (weekly)</p>
      <div className="flex items-center gap-2">
        <ResponsiveContainer width={160} height={160}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value" paddingAngle={3}>
              {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '11px' }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-1.5">
          {data.map((d, i) => (
            <div key={d.name} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
              <span className="text-xs text-gray-600 flex-1">{d.name}</span>
              <span className="text-xs font-bold text-gray-800">{d.value}x</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Diet Stats ───────────────────────────────────────────────────────────────
function DietCharts({ meals }) {
  const last7Days = useMemo(() => {
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayMeals = meals.filter(m => m.date === dateStr);
      const calories = dayMeals.reduce((s, m) => s + (m.calories || 0), 0);
      result.push({ date: dateStr.slice(5), calories });
    }
    return result;
  }, [meals]);

  const macroTotals = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayMeals = meals.filter(m => m.date === today);
    return todayMeals.reduce((acc, m) => ({
      protein: acc.protein + (m.protein || 0),
      carbs: acc.carbs + (m.carbs || 0),
      fat: acc.fat + (m.fat || 0),
    }), { protein: 0, carbs: 0, fat: 0 });
  }, [meals]);

  const macroPieData = [
    { name: 'Protein', value: macroTotals.protein || 0, color: '#3B82F6' },
    { name: 'Carbs', value: macroTotals.carbs || 0, color: '#EAB308' },
    { name: 'Fat', value: macroTotals.fat || 0, color: '#EF4444' },
  ].filter(d => d.value > 0);

  const hasCalorieData = last7Days.some(d => d.calories > 0);

  return (
    <>
      {/* 7-day calorie bar */}
      <div className="card mb-4">
        <p className="section-title">7-Day Calorie Intake</p>
        {!hasCalorieData ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <p className="text-gray-400 text-sm">No diet data yet</p>
            <p className="text-gray-300 text-xs mt-1">Log meals in MyDiet tab!</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={last7Days} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#999' }} />
              <YAxis tick={{ fontSize: 9, fill: '#999' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '11px' }} />
              <Bar dataKey="calories" fill={DARK} radius={[4, 4, 0, 0]} name="Calories (kcal)" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Today's macro pie */}
      {macroPieData.length > 0 && (
        <div className="card mb-4">
          <p className="section-title">Today's Macro Split</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={130} height={130}>
              <PieChart>
                <Pie data={macroPieData} cx="50%" cy="50%" innerRadius={35} outerRadius={58} dataKey="value" paddingAngle={3}>
                  {macroPieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {macroPieData.map(d => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="text-xs text-gray-600">{d.name}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-800">{d.value}g</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Metrics History ──────────────────────────────────────────────────────────
function MetricsHistory({ metricsHistory }) {
  if (metricsHistory.length === 0) return null;
  const sorted = [...metricsHistory].reverse().slice(0, 5);
  return (
    <div className="card mb-4">
      <p className="section-title">Metrics History</p>
      <div className="space-y-2">
        {sorted.map((m, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <span className="text-xs text-gray-400">{m.date}</span>
            <div className="flex gap-3">
              {m.weight && <span className="text-xs font-semibold text-gray-700">{m.weight} kg</span>}
              {m.bodyFat && <span className="text-xs text-gray-500">{m.bodyFat}% BF</span>}
              {m.bmi && <span className="text-xs text-gray-500">BMI {m.bmi}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { profile, metricsHistory, completedWorkouts, schedule, meals, streak } = useApp();

  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Profile</h1>
          <p className="text-gray-400 text-sm">Your fitness identity 🏅</p>
        </div>
      </div>

      {/* Profile Card */}
      <ProfileCard profile={profile} />

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Streak', value: `${streak.current}🔥`, sub: 'days' },
          { label: 'Workouts', value: completedWorkouts.length, sub: 'total' },
          { label: 'Best Streak', value: `${streak.longest}`, sub: 'days' },
        ].map(s => (
          <div key={s.label} className="card text-center py-3">
            <p className="text-xl font-black text-gray-900">{s.value}</p>
            <p className="text-[10px] text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <WeightChart metricsHistory={metricsHistory} />
      <WorkoutConsistencyChart completedWorkouts={completedWorkouts} />
      <MuscleDistributionChart schedule={schedule} />
      <MetricsHistory metricsHistory={metricsHistory} />
      <DietCharts meals={meals} />

      {/* Footer hint */}
      <div className="text-center py-4 text-gray-300 text-xs">
        <p>Data stored locally on this device</p>
        <p className="mt-1">Built with ❤️ for personal use</p>
      </div>
    </div>
  );
}
