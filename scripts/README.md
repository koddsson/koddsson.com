# Backfill Workout Photos

This script backfills photos for existing workout files that have multiple photos but were created before PR #326 added the functionality to fetch all photos from the Strava API.

## Background

PR #326 added functionality to fetch all photos for activities from the Strava API when webhook payloads are received. However, activities processed before this change only have the `photos.primary` field, not the `photos.all` array that contains all photos.

This script:
1. Finds all workout files with `photos.count > 1` but no `photos.all` array
2. Fetches all photos for those activities from the Strava API
3. Updates the workout JSON files with the `photos.all` data

## Usage

### Via GitHub Actions (Recommended)

The easiest way to run the backfill is via the GitHub Actions workflow:

1. Go to the repository's Actions tab
2. Select "Backfill Workout Photos" workflow
3. Click "Run workflow"
4. Wait for the workflow to complete

The workflow will automatically commit and push any changes.

### Via Command Line

To run the script locally, you need a Strava API access token with `activity:read` scope.

```bash
# Install dependencies
npm install

# Dry run to see which workouts would be updated
node scripts/backfill-workout-photos.mjs --dry-run

# Run the actual backfill (requires STRAVA_ACCESS_TOKEN)
STRAVA_ACCESS_TOKEN=your_token_here node scripts/backfill-workout-photos.mjs
```

## What Gets Updated

The script updates workout JSON files by adding a `photos.all` array to the `activity.photos` object:

```json
{
  "activity": {
    "photos": {
      "count": 3,
      "primary": { "urls": { "600": "https://..." } },
      "all": [
        { "urls": { "600": "https://..." } },
        { "urls": { "600": "https://..." } },
        { "urls": { "600": "https://..." } }
      ]
    }
  }
}
```

This matches the data structure created by PR #326 for new workouts.
