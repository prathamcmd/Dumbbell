import React, { useState, useCallback } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2, Dumbbell, Target, Bot, Salad, Check, RefreshCw, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

// ─── Exercise Database ───────────────────────────────────────────────────────
const MUSCLE_GROUPS = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Abs', 'Glutes', 'Calves', 'Full Body', 'Cardio'];

const EXERCISE_DB = {
  Chest:     ['Bench Press', 'Incline Press', 'Decline Press', 'Push Ups', 'Cable Fly', 'Chest Dips', 'DB Fly'],
  Back:      ['Deadlift', 'Pull Ups', 'Barbell Row', 'Lat Pulldown', 'Cable Row', 'T-Bar Row', 'Single-Arm Row'],
  Shoulders: ['Overhead Press', 'Lateral Raises', 'Front Raises', 'Rear Delt Fly', 'Arnold Press', 'Face Pulls'],
  Biceps:    ['Barbell Curl', 'Dumbbell Curl', 'Hammer Curl', 'Preacher Curl', 'Cable Curl', 'Concentration Curl'],
  Triceps:   ['Tricep Dips', 'Skull Crushers', 'Pushdown', 'Overhead Extension', 'Close Grip Press', 'Kickbacks'],
  Legs:      ['Squat', 'Leg Press', 'Leg Extension', 'Leg Curl', 'Romanian Deadlift', 'Lunges', 'Hack Squat'],
  Abs:       ['Crunches', 'Plank', 'Leg Raises', 'Russian Twists', 'Cable Crunches', 'Bicycle Crunch', 'V-Ups'],
  Glutes:    ['Hip Thrust', 'Glute Bridge', 'Cable Kickback', 'Sumo Deadlift', 'Step Ups'],
  Calves:    ['Standing Calf Raise', 'Seated Calf Raise', 'Donkey Calf Raise'],
  'Full Body': ['Clean and Press', 'Burpees', 'Kettlebell Swing', 'Thrusters'],
  Cardio:    ['Running', 'Cycling', 'Jump Rope', 'Rowing Machine', 'HIIT', 'Stair Climber'],
};

// ─── Section Wrapper ─────────────────────────────────────────────────────────
function Section({ title, icon: Icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card mb-4">
      <button
        className="flex items-center justify-between w-full"
        onClick={() => setOpen(p => !p)}
        id={`section-${title.toLowerCase().replace(/\s/g, '-')}`}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #FF4444, #CC0000)' }}>
            <Icon size={14} className="text-white" />
          </div>
          <span className="text-sm font-bold text-gray-800">{title}</span>
        </div>
        {open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}

// ─── Body Metrics ─────────────────────────────────────────────────────────────
function BodyMetricsSection({ profile, updateProfile, addMetricsSnapshot }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    weight: profile.weight || '',
    height: profile.height || '',
    age: profile.age || '',
    bodyFat: profile.bodyFat || '',
    goalWeight: profile.goalWeight || '',
    gender: profile.gender || 'male',
    activityLevel: profile.activityLevel || 'moderate',
    name: profile.name || '',
  });

  const bmi = useMemo_bmi(form.weight, form.height);

  const handleSave = () => {
    updateProfile(form);
    addMetricsSnapshot({ weight: form.weight, bodyFat: form.bodyFat, bmi });
    setEditing(false);
  };

  const metrics = [
    { label: 'Weight', value: profile.weight, unit: 'kg', key: 'weight', type: 'number', placeholder: '70' },
    { label: 'Height', value: profile.height, unit: 'cm', key: 'height', type: 'number', placeholder: '175' },
    { label: 'Age', value: profile.age, unit: 'yrs', key: 'age', type: 'number', placeholder: '25' },
    { label: 'Body Fat', value: profile.bodyFat, unit: '%', key: 'bodyFat', type: 'number', placeholder: '18' },
    { label: 'Goal Weight', value: profile.goalWeight, unit: 'kg', key: 'goalWeight', type: 'number', placeholder: '75' },
  ];

  return (
    <Section title="Body Metrics" icon={Target}>
      {!editing ? (
        <>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {metrics.map(m => (
              <div key={m.key} className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-lg font-black text-gray-900">{m.value || '–'}<span className="text-xs font-normal text-gray-400 ml-0.5">{m.unit}</span></p>
                <p className="text-[10px] text-gray-400 mt-0.5">{m.label}</p>
              </div>
            ))}
            {bmi && (
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-lg font-black text-gray-900">{bmi}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">BMI</p>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
            <div className="bg-gray-50 rounded-xl p-2.5">
              <p className="text-gray-400">Gender</p>
              <p className="font-semibold text-gray-700 capitalize">{profile.gender || '–'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-2.5">
              <p className="text-gray-400">Activity</p>
              <p className="font-semibold text-gray-700 capitalize">{profile.activityLevel?.replace('_', ' ') || '–'}</p>
            </div>
          </div>
          <button id="btn-edit-metrics" className="btn-primary w-full" onClick={() => setEditing(true)}>Update Metrics</button>
        </>
      ) : (
        <div className="space-y-3 animate-fade-in">
          <input type="text" placeholder="Your name" className="input-field" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          <div className="grid grid-cols-2 gap-2">
            {metrics.map(m => (
              <div key={m.key} className="relative">
                <input
                  id={`metric-${m.key}`}
                  type={m.type}
                  placeholder={`${m.label} (${m.unit})`}
                  className="input-field"
                  value={form[m.key]}
                  onChange={e => setForm(p => ({ ...p, [m.key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Gender</label>
            <div className="flex gap-2">
              {['male', 'female'].map(g => (
                <button key={g} id={`gender-${g}`}
                  className={`chip flex-1 justify-center capitalize ${form.gender === g ? 'selected' : ''}`}
                  onClick={() => setForm(p => ({ ...p, gender: g }))}>{g}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Activity Level</label>
            <div className="flex flex-wrap gap-2">
              {['sedentary', 'light', 'moderate', 'active', 'very_active'].map(a => (
                <button key={a} id={`activity-${a}`}
                  className={`chip capitalize ${form.activityLevel === a ? 'selected' : ''}`}
                  onClick={() => setForm(p => ({ ...p, activityLevel: a }))}>{a.replace('_', ' ')}</button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-silver flex-1" onClick={() => setEditing(false)}>Cancel</button>
            <button id="btn-save-metrics" className="btn-primary flex-1" onClick={handleSave}>Save ✓</button>
          </div>
        </div>
      )}
    </Section>
  );
}

function useMemo_bmi(weight, height) {
  if (!weight || !height) return null;
  const h = parseFloat(height) / 100;
  return (parseFloat(weight) / (h * h)).toFixed(1);
}

// ─── Goal Setter ──────────────────────────────────────────────────────────────
function GoalSetterSection({ profile, updateProfile }) {
  const goals = [
    { key: 'weight_loss', label: 'Lose Weight', emoji: '🔥', desc: 'Caloric deficit + cardio' },
    { key: 'muscle_gain', label: 'Build Muscle', emoji: '💪', desc: 'Caloric surplus + strength' },
    { key: 'maintenance', label: 'Maintain', emoji: '⚖️', desc: 'Stay at current level' },
  ];

  return (
    <Section title="My Goal" icon={Target} defaultOpen={true}>
      <div className="space-y-2">
        {goals.map(g => (
          <button
            key={g.key}
            id={`goal-${g.key}`}
            className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all duration-200 text-left
              ${profile.goal === g.key ? 'border-primary bg-red-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}
            onClick={() => updateProfile({ goal: g.key })}
          >
            <span className="text-2xl">{g.emoji}</span>
            <div className="flex-1">
              <p className={`text-sm font-bold ${profile.goal === g.key ? 'text-primary' : 'text-gray-800'}`}>{g.label}</p>
              <p className="text-xs text-gray-400">{g.desc}</p>
            </div>
            {profile.goal === g.key && <Check size={16} className="text-primary flex-shrink-0" />}
          </button>
        ))}
      </div>
    </Section>
  );
}

// ─── Weekly Schedule Builder ──────────────────────────────────────────────────
const DAY_META = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
];

function DayScheduleEditor({ dayKey, dayData, onChange }) {
  const [open, setOpen] = useState(false);
  const [customEx, setCustomEx] = useState('');
  const [customSets, setCustomSets] = useState('');
  const [customReps, setCustomReps] = useState('');
  const [showExPicker, setShowExPicker] = useState(false);
  const [activeMuscle, setActiveMuscle] = useState(MUSCLE_GROUPS[0]);

  const toggleRestDay = () => onChange({ ...dayData, restDay: !dayData.restDay, exercises: [], muscles: [] });

  const toggleMuscle = (m) => {
    const muscles = dayData.muscles.includes(m) ? dayData.muscles.filter(x => x !== m) : [...dayData.muscles, m];
    onChange({ ...dayData, muscles });
  };

  const addExercise = (name) => {
    const ex = { name, sets: 3, reps: 12, weight: '' };
    onChange({ ...dayData, exercises: [...dayData.exercises, ex] });
  };

  const addCustomExercise = () => {
    if (!customEx.trim()) return;
    const ex = { name: customEx.trim(), sets: parseInt(customSets) || 3, reps: parseInt(customReps) || 12, weight: '' };
    onChange({ ...dayData, exercises: [...dayData.exercises, ex] });
    setCustomEx(''); setCustomSets(''); setCustomReps('');
  };

  const removeExercise = (i) => {
    const ex = dayData.exercises.filter((_, idx) => idx !== i);
    onChange({ ...dayData, exercises: ex });
  };

  const updateExercise = (i, field, val) => {
    const ex = dayData.exercises.map((e, idx) => idx === i ? { ...e, [field]: val } : e);
    onChange({ ...dayData, exercises: ex });
  };

  const dayLabel = DAY_META.find(d => d.key === dayKey)?.label;

  return (
    <div className="border border-gray-100 rounded-2xl mb-3 overflow-hidden">
      {/* Day Header */}
      <button
        id={`day-toggle-${dayKey}`}
        className={`w-full flex items-center justify-between px-4 py-3.5 transition-colors
          ${dayData.restDay ? 'bg-gray-50' : open ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'}`}
        onClick={() => !dayData.restDay && setOpen(p => !p)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${dayData.restDay ? 'bg-gray-300' : dayData.exercises.length > 0 ? 'bg-green-400' : 'bg-yellow-400'}`} />
          <span className="text-sm font-semibold text-gray-800">{dayLabel}</span>
          {!dayData.restDay && dayData.exercises.length > 0 && (
            <span className="badge-dark text-[10px] py-0.5">{dayData.exercises.length} exercises</span>
          )}
          {dayData.restDay && <span className="text-xs text-gray-400">Rest Day 😴</span>}
        </div>
        <div className="flex items-center gap-2">
          <button
            id={`rest-toggle-${dayKey}`}
            className={`text-[10px] font-semibold px-2 py-1 rounded-full transition-all
              ${dayData.restDay ? 'bg-gray-200 text-gray-600' : 'bg-surface text-white'}`}
            onClick={e => { e.stopPropagation(); toggleRestDay(); }}
          >
            {dayData.restDay ? 'Set Workout' : 'Rest Day'}
          </button>
          {!dayData.restDay && (open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />)}
        </div>
      </button>

      {/* Day Content */}
      {open && !dayData.restDay && (
        <div className="px-4 pb-4 bg-white animate-fade-in">
          {/* Muscle Group Tags */}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 mt-3">Target Muscles</p>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {MUSCLE_GROUPS.map(m => (
              <button key={m} id={`muscle-${dayKey}-${m}`}
                className={`chip ${dayData.muscles.includes(m) ? 'selected' : ''}`}
                onClick={() => toggleMuscle(m)}>{m}</button>
            ))}
          </div>

          {/* Exercise List */}
          {dayData.exercises.length > 0 && (
            <div className="mb-3 space-y-2">
              {dayData.exercises.map((ex, i) => (
                <div key={i} className="bg-gray-50 rounded-xl px-3 py-2.5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-800">{ex.name}</span>
                    <button onClick={() => removeExercise(i)} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Sets" className="input-field py-1.5 text-center text-xs" style={{ padding: '6px' }}
                      value={ex.sets} onChange={e => updateExercise(i, 'sets', e.target.value)} />
                    <input type="number" placeholder="Reps" className="input-field py-1.5 text-center text-xs" style={{ padding: '6px' }}
                      value={ex.reps} onChange={e => updateExercise(i, 'reps', e.target.value)} />
                    <input type="number" placeholder="kg" className="input-field py-1.5 text-center text-xs" style={{ padding: '6px' }}
                      value={ex.weight} onChange={e => updateExercise(i, 'weight', e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add from DB */}
          <button id={`btn-browse-exercises-${dayKey}`}
            className="w-full border border-dashed border-gray-200 rounded-xl py-2.5 text-xs font-semibold text-primary hover:bg-red-50 transition-colors mb-3"
            onClick={() => setShowExPicker(p => !p)}
          >
            {showExPicker ? '✕ Close Library' : '+ Browse Exercise Library'}
          </button>

          {showExPicker && (
            <div className="animate-fade-in mb-3">
              <div className="flex overflow-x-auto gap-1.5 pb-2 mb-2 scrollbar-hide">
                {MUSCLE_GROUPS.map(m => (
                  <button key={m} id={`muscle-tab-${dayKey}-${m}`}
                    className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${activeMuscle === m ? 'bg-surface text-white' : 'bg-gray-100 text-gray-600'}`}
                    onClick={() => setActiveMuscle(m)}>{m}</button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {EXERCISE_DB[activeMuscle]?.map(ex => {
                  const added = dayData.exercises.some(e => e.name === ex);
                  return (
                    <button key={ex} id={`add-ex-${dayKey}-${ex}`}
                      className={`text-left text-xs px-3 py-2 rounded-xl font-medium transition-all
                        ${added ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-transparent'}`}
                      onClick={() => !added && addExercise(ex)}
                    >
                      {added ? '✓ ' : ''}{ex}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom Exercise */}
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs font-semibold text-gray-500 mb-2">✏️ Add Custom Exercise</p>
            <input
              id={`custom-ex-name-${dayKey}`}
              type="text"
              placeholder="Exercise name"
              className="input-field mb-2"
              value={customEx}
              onChange={e => setCustomEx(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCustomExercise()}
            />
            <div className="flex gap-2 mb-2">
              <input id={`custom-sets-${dayKey}`} type="number" placeholder="Sets" className="input-field" value={customSets} onChange={e => setCustomSets(e.target.value)} />
              <input id={`custom-reps-${dayKey}`} type="number" placeholder="Reps" className="input-field" value={customReps} onChange={e => setCustomReps(e.target.value)} />
            </div>
            <button id={`btn-add-custom-ex-${dayKey}`} className="btn-dark w-full text-xs py-2" onClick={addCustomExercise}>Add Exercise</button>
          </div>
        </div>
      )}
    </div>
  );
}

function WeeklyScheduleSection({ schedule, updateSchedule }) {
  const handleDayChange = useCallback((dayKey, data) => {
    updateSchedule({ [dayKey]: data });
  }, [updateSchedule]);

  const totalExercises = Object.values(schedule).reduce((acc, d) => acc + (d.exercises?.length || 0), 0);
  const workoutDays = Object.values(schedule).filter(d => !d.restDay && d.exercises?.length > 0).length;

  return (
    <Section title="Weekly Schedule" icon={Dumbbell} defaultOpen={false}>
      {/* Summary */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-xl font-black text-gray-900">{workoutDays}</p>
          <p className="text-[10px] text-gray-400">Workout Days</p>
        </div>
        <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-xl font-black text-gray-900">{totalExercises}</p>
          <p className="text-[10px] text-gray-400">Total Exercises</p>
        </div>
        <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-xl font-black text-gray-900">{7 - workoutDays}</p>
          <p className="text-[10px] text-gray-400">Rest Days</p>
        </div>
      </div>

      {DAY_META.map(({ key }) => (
        <DayScheduleEditor
          key={key}
          dayKey={key}
          dayData={schedule[key] || { label: key, muscles: [], exercises: [], restDay: false }}
          onChange={(data) => handleDayChange(key, data)}
        />
      ))}
    </Section>
  );
}

// ─── AI Assistant ─────────────────────────────────────────────────────────────
const DIET_SUGGESTIONS = {
  weight_loss: [
    '🥗 High protein, low calorie meals — aim for 1.6–2g protein per kg of body weight',
    '🥦 Fill half your plate with non-starchy vegetables',
    '⏰ Consider 16:8 intermittent fasting — skip breakfast, eat from 12pm–8pm',
    '💧 Drink 2–3L of water per day. Often hunger is thirst in disguise',
    '🚫 Avoid liquid calories — sodas, juices, alcohol add up fast',
    '🍛 Indian diet tip: Replace rice with cauliflower rice or bajra roti',
  ],
  muscle_gain: [
    '🥩 Eat at a 300–500 kcal surplus — track your intake consistently',
    '🥛 Protein target: 1.8–2.2g per kg of body weight daily',
    '🍚 Carbs are your friend — fuel workouts with complex carbs like oats, rice, sweet potato',
    '🥚 Eggs, paneer, dal, chicken — rotate protein sources for all amino acids',
    '🕐 Post-workout meal within 2 hours — protein + carbs for recovery',
    '🌙 Casein protein before bed (milk, paneer) to feed muscles overnight',
  ],
  maintenance: [
    '⚖️ Track calories loosely — aim for ±100 kcal of your TDEE daily',
    '🥗 Focus on food quality over strict calorie counting',
    '🔄 Eat a variety of whole foods across all macro groups',
    '💪 Prioritize protein to maintain muscle — aim for 1.4–1.6g per kg',
    '🍎 2–3 servings of fruit and 3–5 servings of vegetables daily',
  ],
};

function AIAssistantSection({ profile }) {
  const [messages, setMessages] = useState([
    { role: 'ai', text: `Hi ${profile.name || 'there'}! 👋 I'm your AI fitness assistant. Ask me anything about your workout or diet plan and I'll give you rough estimates and suggestions based on your goals!` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const getAIResponse = async (userMessage) => {
    setLoading(true);

    // Build a context-aware prompt
    const context = `
      User profile: ${profile.name || 'User'}, ${profile.age || '?'} years old, ${profile.gender || 'unknown'} gender.
      Weight: ${profile.weight || '?'}kg, Height: ${profile.height || '?'}cm.
      Goal: ${profile.goal?.replace('_', ' ') || 'not set'}.
      Activity level: ${profile.activityLevel || 'moderate'}.
      Goal weight: ${profile.goalWeight || 'not set'}kg.
    `;

    // Simulate AI response if no API key is set (smart rule-based fallback)
    await new Promise(r => setTimeout(r, 800));

    const q = userMessage.toLowerCase();
    let response = '';

    if (q.includes('protein') || q.includes('macros')) {
      const w = parseFloat(profile.weight) || 70;
      const minP = (w * 1.6).toFixed(0), maxP = (w * 2.2).toFixed(0);
      response = `Based on your ${profile.weight}kg weight, aim for **${minP}–${maxP}g of protein per day**. For ${profile.goal === 'muscle_gain' ? 'muscle building' : 'your goal'}, higher protein helps preserve/build muscle. Good sources: chicken breast (31g/100g), eggs (6g each), paneer (18g/100g), dal (18g/cup), whey protein (24g/scoop).`;
    } else if (q.includes('calorie') || q.includes('calories') || q.includes('kcal')) {
      const w = parseFloat(profile.weight) || 70, h = parseFloat(profile.height) || 175, a = parseInt(profile.age) || 25;
      const bmr = profile.gender === 'female' ? 10*w + 6.25*h - 5*a - 161 : 10*w + 6.25*h - 5*a + 5;
      const tdee = Math.round(bmr * 1.55);
      const target = profile.goal === 'weight_loss' ? tdee - 500 : profile.goal === 'muscle_gain' ? tdee + 300 : tdee;
      response = `Your estimated **TDEE (Total Daily Energy Expenditure)** is roughly **${tdee} kcal/day**. For your ${profile.goal?.replace('_', ' ') || 'goal'}, I'd suggest targeting around **${target} kcal/day**. This is a rough estimate — adjust based on weekly weight changes!`;
    } else if (q.includes('bmi') || q.includes('weight')) {
      if (profile.weight && profile.height) {
        const h = parseFloat(profile.height) / 100;
        const bmi = (parseFloat(profile.weight) / (h * h)).toFixed(1);
        const category = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal weight' : bmi < 30 ? 'Overweight' : 'Obese';
        response = `Your current **BMI is ${bmi}** (${category}). ${profile.goalWeight ? `To reach your goal weight of ${profile.goalWeight}kg, ` : ''}${profile.goal === 'weight_loss' ? 'focus on a consistent caloric deficit of 300–500 kcal/day with progressive cardio.' : profile.goal === 'muscle_gain' ? 'focus on progressive overload training and eating at a slight surplus.' : 'maintain your current routine.'}`;
      } else {
        response = "Please add your weight and height in the Body Metrics section first, then I can calculate your BMI and give personalized advice!";
      }
    } else if (q.includes('diet') || q.includes('eat') || q.includes('food') || q.includes('meal')) {
      const suggestions = DIET_SUGGESTIONS[profile.goal || 'maintenance'];
      response = `Here are my diet suggestions for your **${profile.goal?.replace('_', ' ') || 'maintenance'} goal**:\n\n${suggestions.slice(0, 3).join('\n')}`;
    } else if (q.includes('workout') || q.includes('exercise') || q.includes('training')) {
      const plans = {
        weight_loss: "For weight loss, combine **strength training 3–4x/week** with **cardio 2–3x/week**. Strength training preserves muscle during a deficit. Keep rest periods short (60–90 sec) to keep heart rate elevated.",
        muscle_gain: "For muscle gain, focus on **progressive overload** — increase weight, reps, or sets each week. Train **4–5x/week**, ensuring each muscle gets at least 10–20 sets per week. Prioritize compound lifts: Squat, Deadlift, Bench Press, Overhead Press.",
        maintenance: "For maintenance, **3–4x/week** of mixed training (2 strength + 1–2 cardio sessions) is ideal. Focus on consistency rather than intensity.",
      };
      response = plans[profile.goal || 'maintenance'];
    } else if (q.includes('rest') || q.includes('sleep') || q.includes('recovery')) {
      response = "**Recovery is 50% of your results!** Aim for **7–9 hours of sleep** per night. Muscles are built during rest, not during workouts. Active recovery (walking, stretching, yoga) on rest days is better than complete inactivity.";
    } else if (q.includes('supplement') || q.includes('creatine') || q.includes('whey')) {
      response = "**Essential supplements to consider:**\n- **Creatine** (5g/day): Most researched supplement, improves strength and muscle gain. Safe and effective.\n- **Whey Protein**: Only if you struggle to hit protein targets through food.\n- **Vitamin D**: Most Indians are deficient. Take 1000–2000 IU/day.\n\nFood first, supplements second!";
    } else {
      response = `Great question! Based on your profile (${profile.goal?.replace('_', ' ') || 'fitness'} goal, ${profile.weight || '?'}kg), here's my rough take:\n\nFor the best results, focus on **consistency over perfection**. Track your workouts in the Routine tab, log meals in MyDiet, and update your metrics regularly. Small, sustainable changes beat extreme measures every time! 💪\n\nAsk me about: calories, protein, BMI, diet tips, workout advice, or supplements!`;
    }

    setMessages(prev => [...prev, { role: 'ai', text: response }]);
    setLoading(false);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const msg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setInput('');
    await getAIResponse(msg);
  };

  return (
    <Section title="AI Assistant" icon={Bot} defaultOpen={false}>
      <div className="flex flex-col gap-3">
        {/* Messages */}
        <div className="space-y-3 max-h-72 overflow-y-auto">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed
                ${m.role === 'user'
                  ? 'bg-surface text-white rounded-br-sm'
                  : 'bg-gray-50 text-gray-800 border border-gray-100 rounded-bl-sm'
                }`}
                style={m.role === 'user' ? { background: 'linear-gradient(135deg, #FF4444, #CC0000)' } : {}}
              >
                {m.text.split('\n').map((line, j) => (
                  <p key={j} className={j > 0 ? 'mt-1' : ''}
                    dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                  />
                ))}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Suggestion chips */}
        <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide">
          {['How many calories?', 'My protein target?', 'Best exercises?', 'Diet tips', 'My BMI?'].map(s => (
            <button key={s}
              className="flex-shrink-0 text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors"
              onClick={() => { setInput(s); }}
            >{s}</button>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            id="ai-chat-input"
            type="text"
            placeholder="Ask anything about fitness & diet..."
            className="input-field flex-1"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button id="btn-ai-send" className="btn-primary px-4 flex-shrink-0" onClick={handleSend} disabled={loading}>
            {loading ? <RefreshCw size={16} className="animate-spin" /> : '→'}
          </button>
        </div>
      </div>
    </Section>
  );
}

// ─── Diet Suggestions Card ────────────────────────────────────────────────────
function DietSuggestionsSection({ profile }) {
  const suggestions = DIET_SUGGESTIONS[profile.goal || 'maintenance'];
  return (
    <Section title="Diet Suggestions" icon={Salad} defaultOpen={false}>
      <div className="space-y-2">
        {suggestions.map((s, i) => (
          <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
            <span className="text-lg flex-shrink-0">{s.split(' ')[0]}</span>
            <p className="text-xs text-gray-700 leading-relaxed">{s.slice(s.indexOf(' ') + 1)}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TailoringPage() {
  const { profile, updateProfile, schedule, updateSchedule, addMetricsSnapshot } = useApp();

  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Tailor</h1>
          <p className="text-gray-400 text-sm">The brain of your fitness 🧠</p>
        </div>
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FF4444, #CC0000)' }}>
          <span className="text-white text-lg">⚙️</span>
        </div>
      </div>

      <BodyMetricsSection profile={profile} updateProfile={updateProfile} addMetricsSnapshot={addMetricsSnapshot} />
      <GoalSetterSection profile={profile} updateProfile={updateProfile} />
      <WeeklyScheduleSection schedule={schedule} updateSchedule={updateSchedule} />
      <AIAssistantSection profile={profile} />
      <DietSuggestionsSection profile={profile} />
    </div>
  );
}
