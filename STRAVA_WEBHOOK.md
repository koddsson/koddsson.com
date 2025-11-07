# Strava Webhook Integration

This setup allows you to receive Strava webhook events and store them as activities on the site.

## How it works

1. **Data Storage**: Activities are stored in `_data/activities.json`
2. **Display Page**: Activities are displayed at `/activities/` 
3. **GitHub Actions**: The workflow at `.github/workflows/strava-webhook.yml` processes webhook events

## Triggering the webhook workflow

To add a new Strava activity via the GitHub Actions workflow, you can trigger it manually or programmatically:

### Manual trigger via GitHub UI

1. Go to Actions → Strava Webhook
2. Click "Run workflow"
3. Provide the activity data as stringified JSON

### Programmatic trigger via GitHub API

```bash
curl -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.github.com/repos/koddsson/koddsson.com/actions/workflows/strava-webhook.yml/dispatches \
  -d '{"ref":"main","inputs":{"activity_data":"{\"object_type\":\"activity\",\"object_id\":12345678,\"aspect_type\":\"create\",\"event_time\":1699383600,\"owner_id\":123456}"}}'
```

## Strava Webhook Event Format

According to [Strava's webhook documentation](https://developers.strava.com/docs/webhooks/), webhook events have the following structure:

```json
{
  "object_type": "activity",
  "object_id": 1234567890,
  "aspect_type": "create",
  "updates": {},
  "owner_id": 134815,
  "subscription_id": 120475,
  "event_time": 1516126040
}
```

## Setting up a webhook receiver

To fully integrate with Strava webhooks, you'll need:

1. A publicly accessible endpoint to receive webhook events
2. The endpoint should:
   - Validate the webhook subscription (respond to GET requests)
   - Receive POST webhook events
   - Trigger the GitHub Actions workflow with the event data

Example webhook server can be set up using:
- Cloudflare Workers
- AWS Lambda
- Any HTTP server that can trigger GitHub Actions

The webhook receiver should call the GitHub Actions workflow dispatch API with the event data.
