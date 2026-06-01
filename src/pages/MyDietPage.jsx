import React, { useState, useMemo } from 'react';
import { Plus, Trash2, UtensilsCrossed, Flame, Target, ChevronDown, ChevronUp, Apple } from 'lucide-react';
import { useApp } from '../context/AppContext';

const COMMON_FOODS = [
  { name: 'Boiled Egg', calories: 78, protein: 6, carbs: 1, fat: 5 },
  { name: 'Oats (100g)', calories: 389, protein: 17, carbs: 66, fat: 7 },
  { name: 'Banana', calories: 89, protein: 1, carbs: 23, fat: 0 },
  { name: 'Chicken Breast (100g)', calories: 165, protein: 31, carbs: 0, fat: 4 },
  { name: 'Brown Rice (100g)', calories: 216, protein: 5, carbs: 45, fat: 2 },
  { name: 'Paneer (100g)', calories: 265, protein: 18, carbs: 3, fat: 20 },
  { name: 'Dal (1 cup)', calories: 230, protein: 18, carbs: 40, fat: 1 },
  { name: 'Roti (1 piece)', calories: 71, protein: 3, carbs: 15, fat: 1 },
  { name: 'Milk (200ml)', calories: 130, protein: 7, carbs: 10, fat: 5 },
  { name: 'Apple', calories: 95, protein: 0, carbs: 25, fat: 0 },
  { name: 'Almonds (30g)', calories: 174, protein: 6, carbs: 6, fat: 15 },
  { name: 'Greek Yogurt (100g)', calories: 59, protein: 10, carbs: 4, fat: 0 },
  { name: 'Whey Protein (30g)', calories: 120, protein: 24, carbs: 3, fat: 2 },
  { name: 'Rice (100g, cooked)', calories: 130, protein: 3, carbs: 28, fat: 0 },
  { name: 'Sweet Potato (100g)', calories: 86, protein: 2, carbs: 20, fat: 0 },
];

// ─── Calorie Ring ─────────────────────────────────────────────────────────────
function CalorieRing({ consumed, goal, burned }) {
  const net = consumed - burned;
  const pct = Math.min((net / goal) * 100, 100);
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ - (pct / 100) * circ;
  const overGoal = net > goal;

  return (
    <div className="card-dark relative overflow-hidden mb-4">
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 60%)' }}
      />
      <div className="flex items-center gap-6 relative z-10">
        {/* Ring */}
        <div className="relative flex-shrink-0">
          <svg width="128" height="128" viewBox="0 0 128 128" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="64" cy="64" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
            <circle
              cx="64" cy="64" r={r}
              fill="none"
              stroke={overGoal ? '#FF4444' : '#FF6666'}
              strokeWidth="10"
              strokeDasharray={circ}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.7s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-white">{Math.round(net)}</span>
            <span className="text-[10px] text-gray-400 font-medium">kcal net</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-400 text-xs">Goal</span>
              <span className="text-white text-xs font-bold">{goal} kcal</span>
            </div>
            <div className="progress-bar-track bg-white/10">
              <div className="progress-bar-fill" style={{ width: `${Math.min(pct, 100)}%` }} />
            </div>
          </div>
          <div className="flex gap-4">
            <div>
              <p className="text-[10px] text-gray-400">Eaten</p>
              <p className="text-white font-bold text-sm">{consumed}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400">Burned</p>
              <p className="text-green-400 font-bold text-sm">-{burned}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400">Remaining</p>
              <p className={`font-bold text-sm ${overGoal ? 'text-red-400' : 'text-yellow-300'}`}>
                {Math.max(goal - net, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Macro Bar ────────────────────────────────────────────────────────────────
function MacroBar({ protein, carbs, fat }) {
  const total = protein + carbs + fat || 1;
  return (
    <div className="card mb-4">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Macros Today</p>
      <div className="flex rounded-full overflow-hidden h-3 mb-3" style={{ gap: '2px' }}>
        <div className="bg-blue-500 transition-all duration-500" style={{ width: `${(protein / total) * 100}%` }} />
        <div className="bg-yellow-400 transition-all duration-500" style={{ width: `${(carbs / total) * 100}%` }} />
        <div className="bg-red-400 transition-all duration-500" style={{ width: `${(fat / total) * 100}%` }} />
      </div>
      <div className="flex justify-around text-center">
        <div><p className="text-blue-600 font-bold text-sm">{protein}g</p><p className="text-gray-400 text-[10px]">Protein</p></div>
        <div><p className="text-yellow-600 font-bold text-sm">{carbs}g</p><p className="text-gray-400 text-[10px]">Carbs</p></div>
        <div><p className="text-red-500 font-bold text-sm">{fat}g</p><p className="text-gray-400 text-[10px]">Fat</p></div>
      </div>
    </div>
  );
}

// ─── Meal Item ────────────────────────────────────────────────────────────────
function MealItem({ meal, onDelete }) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 mb-2 shadow-sm border border-gray-100 animate-fade-in">
      <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
        <Apple size={16} className="text-orange-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{meal.name}</p>
        <p className="text-xs text-gray-400">
          {meal.calories} kcal
          {meal.protein ? ` · P:${meal.protein}g` : ''}
          {meal.carbs ? ` · C:${meal.carbs}g` : ''}
          {meal.fat ? ` · F:${meal.fat}g` : ''}
        </p>
      </div>
      <button
        onClick={() => onDelete(meal.id)}
        className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

// ─── Add Meal Modal ───────────────────────────────────────────────────────────
function AddMealModal({ onClose, onAdd }) {
  const [tab, setTab] = useState('quick'); // 'quick' | 'custom'
  const [search, setSearch] = useState('');
  const [custom, setCustom] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '' });

  const filtered = useMemo(() =>
    COMMON_FOODS.filter(f => f.name.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  const handleQuickAdd = (food) => {
    onAdd(food);
    onClose();
  };

  const handleCustomAdd = () => {
    if (!custom.name || !custom.calories) return;
    onAdd({
      name: custom.name,
      calories: parseInt(custom.calories) || 0,
      protein: parseInt(custom.protein) || 0,
      carbs: parseInt(custom.carbs) || 0,
      fat: parseInt(custom.fat) || 0,
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Add Meal</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-light">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
          {['quick', 'custom'].map(t => (
            <button key={t} id={`meal-tab-${t}`}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
              onClick={() => setTab(t)}
            >
              {t === 'quick' ? '⚡ Quick Add' : '✏️ Custom'}
            </button>
          ))}
        </div>

        {tab === 'quick' ? (
          <>
            <input
              id="meal-search"
              type="text"
              placeholder="Search foods..."
              className="input-field mb-3"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filtered.map(food => (
                <button
                  key={food.name}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                  onClick={() => handleQuickAdd(food)}
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{food.name}</p>
                    <p className="text-xs text-gray-400">P:{food.protein}g · C:{food.carbs}g · F:{food.fat}g</p>
                  </div>
                  <span className="text-sm font-bold text-primary">{food.calories} kcal</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <input id="custom-meal-name" type="text" placeholder="Meal name *" className="input-field"
              value={custom.name} onChange={e => setCustom(p => ({ ...p, name: e.target.value }))} />
            <input id="custom-meal-cal" type="number" placeholder="Calories (kcal) *" className="input-field"
              value={custom.calories} onChange={e => setCustom(p => ({ ...p, calories: e.target.value }))} />
            <div className="grid grid-cols-3 gap-2">
              <input id="custom-meal-protein" type="number" placeholder="Protein (g)" className="input-field"
                value={custom.protein} onChange={e => setCustom(p => ({ ...p, protein: e.target.value }))} />
              <input id="custom-meal-carbs" type="number" placeholder="Carbs (g)" className="input-field"
                value={custom.carbs} onChange={e => setCustom(p => ({ ...p, carbs: e.target.value }))} />
              <input id="custom-meal-fat" type="number" placeholder="Fat (g)" className="input-field"
                value={custom.fat} onChange={e => setCustom(p => ({ ...p, fat: e.target.value }))} />
            </div>
            <button id="btn-add-custom-meal" className="btn-primary w-full" onClick={handleCustomAdd}>
              Add Meal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MyDietPage() {
  const { getTodayMeals, addMeal, deleteMeal, getTodayCaloriesBurned, calculateDailyCalorieGoal } = useApp();
  const [showModal, setShowModal] = useState(false);

  const todayMeals = getTodayMeals();
  const calorieGoal = calculateDailyCalorieGoal();
  const burned = getTodayCaloriesBurned();

  const totals = useMemo(() => todayMeals.reduce(
    (acc, m) => ({
      calories: acc.calories + (m.calories || 0),
      protein: acc.protein + (m.protein || 0),
      carbs: acc.carbs + (m.carbs || 0),
      fat: acc.fat + (m.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  ), [todayMeals]);

  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-black text-gray-900">My Diet</h1>
          <p className="text-gray-400 text-sm">Track what you eat 🥗</p>
        </div>
        <button
          id="btn-add-meal"
          className="btn-primary flex items-center gap-1.5 px-4 py-2.5"
          onClick={() => setShowModal(true)}
        >
          <Plus size={16} />
          Add Meal
        </button>
      </div>

      {/* Calorie Ring */}
      <CalorieRing consumed={totals.calories} goal={calorieGoal} burned={burned} />

      {/* Macro Bar */}
      <MacroBar protein={totals.protein} carbs={totals.carbs} fat={totals.fat} />

      {/* Meals */}
      <div className="section-title">Today's Meals ({todayMeals.length})</div>

      {todayMeals.length === 0 ? (
        <div className="card text-center py-10 border border-dashed border-gray-200">
          <UtensilsCrossed size={36} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-semibold">No meals logged yet</p>
          <p className="text-gray-400 text-xs mt-1">Tap "Add Meal" to log your first meal</p>
        </div>
      ) : (
        <div>
          {todayMeals.map(meal => (
            <MealItem key={meal.id} meal={meal} onDelete={deleteMeal} />
          ))}

          {/* Total summary */}
          <div className="card-red mt-4 flex items-center justify-between">
            <div>
              <p className="text-red-200 text-xs font-semibold uppercase tracking-wide">Total Consumed</p>
              <p className="text-3xl font-black">{totals.calories}</p>
              <p className="text-red-200 text-xs">kcal</p>
            </div>
            <div className="text-right">
              <Flame size={32} className="text-yellow-300 ml-auto mb-1" />
              <p className="text-red-200 text-xs">{todayMeals.length} items logged</p>
            </div>
          </div>
        </div>
      )}

      {/* Tip */}
      {burned === 0 && (
        <div className="mt-4 rounded-xl bg-blue-50 border border-blue-100 p-3 flex gap-2">
          <span className="text-lg">💡</span>
          <p className="text-blue-700 text-xs">
            <strong>Tip:</strong> Complete your workout in the <strong>Routine</strong> tab to track calories burned!
          </p>
        </div>
      )}

      {showModal && <AddMealModal onClose={() => setShowModal(false)} onAdd={addMeal} />}
    </div>
  );
}
