#!/usr/bin/env node

/**
 * Backfill script to fetch all photos for existing workouts with multiple photos
 * 
 * This script finds workout files with photos.count > 1 but no photos.all array,
 * fetches the photos from Strava API, and updates the JSON files.
 * 
 * Usage:
 *   STRAVA_ACCESS_TOKEN=<token> node scripts/backfill-workout-photos.mjs
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Fetch all photos for an activity from Strava API
 * @param {string} activityId - The Strava activity ID
 * @param {string} accessToken - Strava API access token
 * @returns {Promise<Array|null>} - Array of photo objects or null on failure
 */
async function fetchActivityPhotos(activityId, accessToken) {
  if (!activityId || !accessToken) {
    return null;
  }

  try {
    const url = `https://www.strava.com/api/v3/activities/${activityId}/photos?photo_sources=true`;
    console.log(`Fetching photos for activity ${activityId} from Strava API...`);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch photos: ${response.status} ${response.statusText}`);
      return null;
    }

    const photos = await response.json();
    console.log(`Fetched ${photos.length} photos from Strava API`);
    return photos;
  } catch (err) {
    console.error('Error fetching photos from Strava API:', err?.message || err);
    return null;
  }
}

/**
 * Find all workout files that need backfilling
 */
async function findWorkoutsNeedingBackfill(workoutsDir) {
  const needsBackfill = [];
  
  const years = await fs.readdir(workoutsDir);
  
  for (const yearDir of years) {
    const yearPath = path.join(workoutsDir, yearDir);
    const stat = await fs.stat(yearPath);
    
    if (!stat.isDirectory()) continue;
    
    const files = await fs.readdir(yearPath);
    
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      
      const filePath = path.join(yearPath, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const workout = JSON.parse(content);
      
      // Check if this workout needs backfilling:
      // - has multiple photos (count > 1)
      // - does not have photos.all array
      const photoCount = workout.activity?.photos?.count || 0;
      const hasAll = workout.activity?.photos?.all !== undefined && workout.activity?.photos?.all !== null;
      
      if (photoCount > 1 && !hasAll) {
        needsBackfill.push({
          filePath,
          activityId: workout.activity.id,
          photoCount
        });
      }
    }
  }
  
  return needsBackfill;
}

/**
 * Update a workout file with photos.all data
 */
async function updateWorkoutFile(filePath, photos) {
  const content = await fs.readFile(filePath, 'utf-8');
  const workout = JSON.parse(content);
  
  // Add photos.all to the activity
  if (!workout.activity.photos) {
    workout.activity.photos = {};
  }
  workout.activity.photos.all = photos;
  
  // Write back to file
  await fs.writeFile(filePath, JSON.stringify(workout, null, 2) + '\n', 'utf-8');
  console.log(`Updated ${filePath} with ${photos.length} photos`);
}

/**
 * Main function
 */
async function main() {
  const accessToken = process.env.STRAVA_ACCESS_TOKEN;
  const dryRun = process.argv.includes('--dry-run');
  
  if (!accessToken && !dryRun) {
    console.error('Error: STRAVA_ACCESS_TOKEN environment variable is required');
    console.error('Use --dry-run flag to list workouts without fetching photos');
    process.exit(1);
  }
  
  const repoRoot = path.join(__dirname, '..');
  const workoutsDir = path.join(repoRoot, 'data', 'workouts');
  
  console.log('Finding workouts that need backfilling...');
  const workouts = await findWorkoutsNeedingBackfill(workoutsDir);
  
  console.log(`Found ${workouts.length} workouts that need backfilling`);
  
  if (workouts.length === 0) {
    console.log('No workouts need backfilling. Done!');
    return;
  }
  
  if (dryRun) {
    console.log('\n=== Dry Run - Workouts that would be updated ===');
    for (const workout of workouts) {
      console.log(`- ${path.basename(workout.filePath)}`);
      console.log(`  Activity ID: ${workout.activityId}, Photo count: ${workout.photoCount}`);
    }
    console.log(`\nTotal: ${workouts.length} workouts would be updated`);
    return;
  }
  
  let successCount = 0;
  let failCount = 0;
  
  for (const workout of workouts) {
    console.log(`\nProcessing: ${path.basename(workout.filePath)}`);
    console.log(`  Activity ID: ${workout.activityId}, Photo count: ${workout.photoCount}`);
    
    const photos = await fetchActivityPhotos(workout.activityId, accessToken);
    
    if (photos && photos.length > 0) {
      await updateWorkoutFile(workout.filePath, photos);
      successCount++;
    } else {
      console.error(`  Failed to fetch photos for activity ${workout.activityId}`);
      failCount++;
    }
    
    // Add a small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n=== Summary ===`);
  console.log(`Total workouts processed: ${workouts.length}`);
  console.log(`Successfully updated: ${successCount}`);
  console.log(`Failed: ${failCount}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
