#!/usr/bin/env node

import fs from 'node:fs/promises';

const response = await fetch('https://apis-is.koddsson.deno.net/x/race-calendar')
const json = await response.json()

const events = json.map(({data}) => {
  return {
    eventName: `${data.titill} (${data.undirtitill})`,
    eventDate: data.dagsetning,
    startTime: data.rs,
    endTime: addHour(data.rs),
    location: data.gps.formatted,
    description: `${data.lsing}\n\n${data.upplsingasa}`,
  }
})

fs.writeFile('assets/calendar.ics', createCalendar(events));

function addHour(timeStr) {
  if (!timeStr) return null;
  let [h, m] = timeStr.split(':').map(Number);
  h = (h + 1) % 24;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function parseDate(dateString) {
  const [date, time] = dateString.split('T');
  const [year, month, day] = date.split('-');
  const [hour, minute, second] = time.split(':');
  return new Date(year, month - 1, day, hour, minute, second);
}

function formatICSDate(date, time, isEnd = false) {
  // ensure a Date object
  const d = date ? new Date(date) : new Date();

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  // ─── All-day event ─────────────────────────────
  if (!time) {
    // for DTEND, add +1 day (exclusive end)
    if (isEnd) d.setDate(d.getDate() + 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `VALUE=DATE:${y}${m}${dd}`;
  }

  // ─── Timed event ───────────────────────────────
  const [hours, minutes] = time.split(':').map(Number);
  d.setHours(hours, minutes, 0, 0);

  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');

  return `TZID=Atlantic/Reykjavik:${year}${month}${day}T${hh}${mm}${ss}`;
}

function createCalendar(events) {
const formattedEvents = events.map(event => {
  const { eventName, eventDate, startTime, endTime, location, description } = event;
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  return (
    'BEGIN:VEVENT\r\n' +
    `UID:${Math.random().toString(36).substring(2, 15)}@koddsson.com\r\n` +
    `DTSTAMP:${now}\r\n` +
    `DTSTART;${formatICSDate(eventDate, startTime)}\r\n` +
    `DTEND;${formatICSDate(
      eventDate,
      startTime ? (endTime || addHour(startTime)) : null,
      !startTime
    )}\r\n` +
    `SUMMARY:${eventName}\r\n` +
    `LOCATION:${location}\r\n` +
    `DESCRIPTION:${description}\r\n` +
    'END:VEVENT\r\n')
    }).join('');

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Koddsson//Race Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-TIMEZONE:Atlantic/Reykjavik

${formattedEvents}

END:VCALENDAR`;
}
