# How to Run the Workout Photos Backfill

This guide explains how to backfill photos for existing workouts using the GitHub Actions workflow.

## Background

PR #326 added functionality to fetch all photos from Strava API when new workouts are added. However, workouts created before that PR only have the primary photo. This workflow will fetch and add all photos for those workouts.

## Affected Workouts

The following 10 workouts will be updated:
- `2025-11-09T19-05-48Z-16408134455.json` (Activity ID: 16408134455, 3 photos)
- `2025-11-12T20-09-14Z-16437332305.json` (Activity ID: 16437332305, 2 photos)
- `2025-11-30T14-35-17Z-16610906611.json` (Activity ID: 16610906611, 4 photos)
- `2025-12-05T18-42-34Z-16659168889.json` (Activity ID: 16659168889, 3 photos)
- `2025-12-07T11-06-29Z-16674013236.json` (Activity ID: 16674013236, 6 photos)
- `2025-12-14T16-07-46Z-16742117602.json` (Activity ID: 16742117602, 6 photos)
- `2025-12-21T14-43-16Z-16803320582.json` (Activity ID: 16803320582, 3 photos)
- `2025-12-24T11-25-20Z-16828089101.json` (Activity ID: 16828089101, 3 photos)
- `2025-12-26T17-11-05Z-16846840843.json` (Activity ID: 16846840843, 3 photos)
- `2025-12-28T15-56-59Z-16866126711.json` (Activity ID: 16866126711, 4 photos)

## Steps to Run

### Option 1: Via GitHub Actions (Recommended)

1. Go to the [Actions tab](https://github.com/koddsson/koddsson.com/actions) in the repository
2. Click on "Backfill Workout Photos" in the left sidebar
3. Click the "Run workflow" button (top right)
4. Select the branch where the workflow exists (usually `main` or the PR branch)
5. Click "Run workflow" to confirm

The workflow will:
- Fetch all photos for the 10 workouts from Strava API
- Update the JSON files with the `photos.all` array
- Commit and push the changes automatically

### Option 2: Via Command Line (Alternative)

If you prefer to run it locally:

```bash
# Clone the repository and checkout the branch
git checkout <branch-name>

# Install dependencies
npm install

# Preview what will be updated (no token required)
npm run backfill-photos:dry-run

# Run the actual backfill (requires STRAVA_ACCESS_TOKEN)
STRAVA_ACCESS_TOKEN=<your-token> npm run backfill-photos

# Commit and push the changes
git add data/workouts
git commit -m "Backfill photos for existing workouts"
git push
```

## Verification

After the workflow completes, verify that:
1. The workflow run succeeded (check the Actions tab)
2. A commit was created with updated workout files
3. The updated workout files now have a `photos.all` array in addition to `photos.primary`

You can check one of the updated files to see the new structure:

```bash
cat data/workouts/2025-12-21/2025-12-21T14-43-16Z-16803320582.json | jq '.activity.photos'
```

This should show both `primary` and `all` fields.

## Troubleshooting

- **Workflow not visible**: Make sure you're on the correct branch
- **Authentication error**: Verify that the `STRAVA_ACCESS_TOKEN` secret is set in repository settings
- **No changes committed**: This means all workouts already have photos.all or no workouts need updating
