import workouts from './workouts.js';

export default async function () {
  const list = await workouts();
  const activities = list.map((w) => w.data.activity).filter(Boolean);

  const distances = activities.map((a) => a.distance || 0);
  const totalDistanceMeters = distances.reduce((sum, d) => sum + d, 0);
  const longestMeters = distances.reduce((max, d) => Math.max(max, d), 0);

  const speeds = activities
    .map((a) => a.average_speed)
    .filter((s) => typeof s === 'number' && s > 0);
  const avgSpeed = speeds.length
    ? speeds.reduce((sum, s) => sum + s, 0) / speeds.length
    : 0;
  const paceSecondsPerKm = avgSpeed > 0 ? 1000 / avgSpeed : 0;
  const paceMin = Math.floor(paceSecondsPerKm / 60);
  const paceSec = Math.round(paceSecondsPerKm - paceMin * 60);

  return {
    totalRuns: activities.length,
    totalDistanceKm: (totalDistanceMeters / 1000).toFixed(0),
    longestKm: (longestMeters / 1000).toFixed(1),
    avgPace: avgSpeed > 0 ? `${paceMin}:${String(paceSec).padStart(2, '0')}` : '—',
  };
}
