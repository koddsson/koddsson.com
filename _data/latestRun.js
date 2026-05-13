import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import workouts from "./workouts.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function formatHMS(seconds) {
  const total = Math.round(seconds || 0);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n) => String(n).padStart(2, "0");
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
  return `${m}:${pad(s)}`;
}

function paceFromSpeed(speed) {
  if (!speed) return null;
  const secPerKm = 1000 / speed;
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function relativeDate(iso, now = new Date()) {
  if (!iso) return null;
  const then = new Date(iso);
  const diffDays = Math.floor((now - then) / 86400000);
  if (diffDays < 1) return "TODAY";
  if (diffDays === 1) return "1D AGO";
  if (diffDays < 7) return `${diffDays}D AGO`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}W AGO`;
  return `${Math.floor(diffDays / 30)}MO AGO`;
}

function parsePlan(description) {
  if (!description) return null;
  const m = description.match(/(?:wk|week)\s*(\d+)\s*(?:of|\/)\s*(\d+)/i);
  if (!m) return null;
  return `WK ${m[1]}/${m[2]}`;
}

function fitRouteSvg(svgContent) {
  if (!svgContent) return null;
  const pathMatch = svgContent.match(/<path[^>]*\sd="([^"]+)"/);
  if (!pathMatch) return svgContent;
  const d = pathMatch[1];

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const re = /(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g;
  let m;
  while ((m = re.exec(d)) !== null) {
    const x = parseFloat(m[1]);
    const y = parseFloat(m[2]);
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  if (!isFinite(minX)) return svgContent;

  const w = maxX - minX || 1;
  const h = maxY - minY || 1;
  const pad = Math.max(w, h) * 0.06;
  const vb = [
    (minX - pad).toFixed(2),
    (minY - pad).toFixed(2),
    (w + pad * 2).toFixed(2),
    (h + pad * 2).toFixed(2),
  ].join(" ");

  return svgContent
    .replace(/viewBox="[^"]*"/, `viewBox="${vb}"`)
    .replace(/<path /, '<path pathLength="100" ');
}

async function loadRouteSvg(relPath) {
  if (!relPath) return null;
  try {
    const full = path.join(__dirname, "..", relPath);
    const raw = await fs.readFile(full, "utf-8");
    return fitRouteSvg(raw);
  } catch {
    return null;
  }
}

export default async function () {
  const list = await workouts();
  const item = list[0];
  if (!item) return null;
  const a = item.data?.activity;
  if (!a) return null;
  const routeSvg = await loadRouteSvg(item.svgPath);
  return {
    name: a.name,
    distanceKm: ((a.distance || 0) / 1000).toFixed(2),
    movingTime: formatHMS(a.moving_time),
    pacePerKm: paceFromSpeed(a.average_speed),
    elevGain: Math.round(a.total_elevation_gain || 0),
    startDate: a.start_date,
    ago: relativeDate(a.start_date),
    svgPath: item.svgPath,
    routeSvg,
    device: a.device_name,
    plan: parsePlan(a.description),
    activityId: a.id,
  };
}
