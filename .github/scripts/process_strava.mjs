#!/usr/bin/env node

/**
 * koddsson.com/.github/scripts/process_strava.mjs
 *
 * ESM module to process repository_dispatch payloads for Strava webhooks.
 *
 * Usage:
 *   node .github/scripts/process_strava.mjs /path/to/github/event.json
 *
 * Behavior:
 * - Reads the GitHub event JSON (path passed as argv[2] or from GITHUB_EVENT_PATH env).
 * - Prefers `client_payload` (repository_dispatch places payload there).
 * - If `payloadPreview` exists and is a JSON string, attempts to parse it and attaches it as `.payload`.
 * - Determines the action/aspect (create/update/delete) from common fields.
 * - Extracts a canonical uid from common Strava fields (activity_id, object_id, id, id_str).
 * - For `delete`: deletes matching workout files by uid.
 * - For `update`: tries to overwrite an existing file for the uid, falling back to create.
 * - For `create` (and fallback): writes payload to `data/workouts/<YYYY-MM-DD>/<timestamp>-<uid>.json`.
 *
 * Implementation notes:
 * - Uses modern Node (v24+) APIs (top-level await, fs/promises).
 * - No external dependencies.
 * - Conservative matching for delete/update to reduce false positives.
 */

import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function safeParseJSON(s) {
  try {
    return JSON.parse(s);
  } catch {
    return undefined;
  }
}

async function readFileUtf8(p) {
  return fs.readFile(p, { encoding: 'utf8' });
}

async function writeJsonFile(p, obj) {
  const dir = path.dirname(p);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(p, JSON.stringify(obj, null, 2), { encoding: 'utf8' });
}

function shortHash(obj) {
  return crypto.createHash('sha1').update(JSON.stringify(obj)).digest('hex').slice(0, 8);
}

function isoTsToSafe(iso) {
  if (!iso) iso = new Date().toISOString();
  // drop fractional seconds, ensure trailing Z, replace ':' with '-'
  return iso.replace(/\.[0-9]+Z?$/, 'Z').replace(/:/g, '-');
}

async function listFilesRec(dir) {
  const out = [];
  try {
    const items = await fs.readdir(dir, { withFileTypes: true });
    for (const it of items) {
      const p = path.join(dir, it.name);
      if (it.isDirectory()) {
        out.push(...await listFilesRec(p));
      } else if (it.isFile()) {
        out.push(p);
      }
    }
  } catch {
    // ignore missing dir etc
  }
  return out;
}

/**
 * Check whether the given file plausibly contains the uid.
 * Strategy:
 *  - quick filename check: does file include -<uid>.json
 *  - try parse JSON and compare common fields (top-level and .payload)
 *  - fallback to string containment
 */
async function matchesUidInContent(filePath, uid) {
  try {
    if (filePath.includes(`-${uid}.json`)) return true;
    const raw = await readFileUtf8(filePath);
    let obj;
    try {
      obj = JSON.parse(raw);
    } catch {
      return raw.includes(uid);
    }
    if (!obj || typeof obj !== 'object') return false;
    const candidates = new Set();
    const addIf = (v) => { if (v !== undefined && v !== null) candidates.add(String(v)); };
    addIf(obj.activity_id);
    addIf(obj.object_id);
    addIf(obj.id);
    addIf(obj.id_str);
    if (obj.payload && typeof obj.payload === 'object') {
      addIf(obj.payload.activity_id);
      addIf(obj.payload.object_id);
      addIf(obj.payload.id);
      addIf(obj.payload.id_str);
    }
    return candidates.has(String(uid));
  } catch {
    return false;
  }
}

async function findExistingFileForUid(uid) {
  const base = path.join('data', 'workouts');
  const files = await listFilesRec(base);
  for (const f of files) {
    if (await matchesUidInContent(f, uid)) return f;
  }
  return null;
}

async function deleteFilesForUid(uid) {
  const base = path.join('data', 'workouts');
  const files = await listFilesRec(base);
  const removed = [];
  for (const f of files) {
    try {
      if (await matchesUidInContent(f, uid)) {
        await fs.unlink(f);
        removed.push(f);
      }
    } catch {
      // ignore deletion errors for individual files
    }
  }
  return removed;
}

function pickUidFromPayload(payloadObj) {
  try {
    const p = payloadObj.payload || {};
    return (
      (p.activity_id && String(p.activity_id)) ||
      (p.object_id && String(p.object_id)) ||
      (p.id && String(p.id)) ||
      (p.id_str && String(p.id_str)) ||
      (payloadObj.activity_id && String(payloadObj.activity_id)) ||
      (payloadObj.object_id && String(payloadObj.object_id)) ||
      (payloadObj.id && String(payloadObj.id)) ||
      (payloadObj.id_str && String(payloadObj.id_str)) ||
      undefined
    );
  } catch {
    return undefined;
  }
}

function detectAspect(payloadObj) {
  const p = payloadObj.payload || {};
  return (
    (p.aspect_type && String(p.aspect_type)) ||
    (p.aspectType && String(p.aspectType)) ||
    (payloadObj.aspect_type && String(payloadObj.aspect_type)) ||
    (payloadObj.aspectType && String(payloadObj.aspectType)) ||
    payloadObj.eventType ||
    payloadObj.action ||
    'create'
  );
}

async function ensureDataRoot() {
  const root = path.join('data', 'workouts');
  try {
    await fs.mkdir(root, { recursive: true });
  } catch {
    // ignore
  }
}

async function main() {
  const eventPath = process.argv[2] || process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    console.error('Missing event path. Usage: node process_strava.mjs /path/to/github/event.json');
    process.exit(1);
  }

  let raw;
  try {
    raw = await readFileUtf8(eventPath);
  } catch (err) {
    console.error('Failed to read event file:', eventPath, err?.message || err);
    process.exit(1);
  }

  let eventJson;
  try {
    eventJson = JSON.parse(raw);
  } catch (err) {
    console.error('Event file is not valid JSON:', err?.message || err);
    process.exit(1);
  }

  const client = eventJson.client_payload || eventJson;
  const payloadObj = (typeof client === 'object' && client !== null) ? structuredClone(client) : { raw: client };

  // If payloadPreview exists and is JSON string, attach parsed version to .payload
  if (payloadObj.payloadPreview && typeof payloadObj.payloadPreview === 'string') {
    const parsed = safeParseJSON(payloadObj.payloadPreview);
    if (parsed !== undefined) {
      payloadObj.payload = parsed;
    } else {
      payloadObj.payloadPreview_raw = payloadObj.payloadPreview;
    }
  }

  // Ensure received_at exists (top-level or payload)
  if (!payloadObj.received_at && !(payloadObj.payload && payloadObj.payload.received_at)) {
    payloadObj.received_at = new Date().toISOString();
  }

  const receivedAt = payloadObj.received_at || (payloadObj.payload && payloadObj.payload.received_at) || new Date().toISOString();
  const tsSafe = isoTsToSafe(receivedAt);

  const aspect = String(detectAspect(payloadObj)).toLowerCase();

  let uid = pickUidFromPayload(payloadObj);
  if (typeof uid === 'number') uid = String(uid);
  if (!uid) uid = shortHash(payloadObj);

  try {
    await ensureDataRoot();

    if (aspect === 'delete') {
      const removed = await deleteFilesForUid(uid);
      console.log(`Aspect=delete, uid=${uid}. Removed ${removed.length} file(s).`, removed);
      return;
    }

    if (aspect === 'update') {
      const existing = await findExistingFileForUid(uid);
      if (existing) {
        await writeJsonFile(existing, payloadObj);
        console.log('Aspect=update: updated existing file:', existing);
        return;
      }
      console.log('Aspect=update: no existing file found for uid, creating new file.');
    }

    // default: create file
    const dateDir = tsSafe.split('T')[0];
    const targetDir = path.join('data', 'workouts', dateDir);
    await fs.mkdir(targetDir, { recursive: true });

    // canonical filename
    const filename = path.join(targetDir, `${tsSafe}-${uid}.json`);

    if (fsSync.existsSync(filename)) {
      try {
        const existingRaw = await readFileUtf8(filename);
        const newJsonStr = JSON.stringify(payloadObj, null, 2);
        if (existingRaw !== newJsonStr) {
          const suffix = shortHash(payloadObj).slice(0, 4);
          const altFilename = path.join(targetDir, `${tsSafe}-${uid}-${suffix}.json`);
          await writeJsonFile(altFilename, payloadObj);
          console.log('File with same name existed; wrote alternate file:', altFilename);
        } else {
          console.log('File already exists with identical content:', filename);
        }
      } catch (err) {
        await writeJsonFile(filename, payloadObj);
        console.log('Wrote payload to', filename, '(overwrote existing due to error comparing files)');
      }
    } else {
      await writeJsonFile(filename, payloadObj);
      console.log('Saved payload to', filename);
    }
  } catch (err) {
    console.error('Unexpected error while processing payload:', err?.message || err);
    process.exit(2);
  }
}

// Run main
await main();
