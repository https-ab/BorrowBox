import {
  Camera, Wrench, BookOpen, Gamepad2, Tent, Music, Trophy, MonitorSmartphone,
} from 'lucide-react';

export const CATEGORIES = [
  { name: 'Cameras', icon: Camera, color: 'bg-brand-100 text-brand-700' },
  { name: 'Tools', icon: Wrench, color: 'bg-amber-100 text-amber-700' },
  { name: 'Books', icon: BookOpen, color: 'bg-rose-100 text-rose-700' },
  { name: 'Gaming', icon: Gamepad2, color: 'bg-sky-100 text-sky-700' },
  { name: 'Camping', icon: Tent, color: 'bg-mint-100 text-mint-700' },
  { name: 'Music', icon: Music, color: 'bg-fuchsia-100 text-fuchsia-700' },
  { name: 'Sports', icon: Trophy, color: 'bg-orange-100 text-orange-700' },
  { name: 'Electronics', icon: MonitorSmartphone, color: 'bg-indigo-100 text-indigo-700' },
];

export const CONDITIONS = ['New', 'Like New', 'Good', 'Used'];

/** City centre coordinates used as a location fallback (lng comes second in the API). */
export const CITIES = {
  Pune: { lat: 18.5204, lng: 73.8567 },
  Mumbai: { lat: 19.076, lng: 72.8777 },
  Bengaluru: { lat: 12.9716, lng: 77.5946 },
  Hyderabad: { lat: 17.385, lng: 78.4867 },
  Delhi: { lat: 28.6139, lng: 77.209 },
};

export const DEFAULT_COORDS = CITIES.Pune;
