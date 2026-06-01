import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CalendarDays, UtensilsCrossed, Sliders, User } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/',        label: 'Routine',  Icon: CalendarDays },
  { path: '/mydiet',  label: 'MyDiet',   Icon: UtensilsCrossed },
  { path: '/tailor',  label: 'Tailor',   Icon: Sliders },
  { path: '/profile', label: 'Profile',  Icon: User },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {NAV_ITEMS.map(({ path, label, Icon }) => {
        const active = location.pathname === path;
        return (
          <button
            key={path}
            id={`nav-${label.toLowerCase()}`}
            className={`nav-btn ${active ? 'active' : ''}`}
            onClick={() => navigate(path)}
            aria-current={active ? 'page' : undefined}
            aria-label={label}
          >
            <Icon
              size={22}
              className="nav-icon"
              strokeWidth={active ? 2.5 : 1.8}
            />
            <span className="nav-label">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
