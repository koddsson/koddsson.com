# koddsson.com

My personal Website.

## Development

Software dependencies are managed by npm as well as any build scripts.

Install the dependencies with `npm install`, run the tests with `npm test` and run the app with `npm start`.

## POSSE Syndication

Content is automatically cross-posted to [Mastodon](https://fosstodon.org/@koddsson) and [Bluesky](https://bsky.app/profile/koddsson.com) after deploy. Add `syndicate: true` to any post/note/link front matter to enable it.

### Secrets to configure

Add these in **GitHub repo Settings > Secrets and variables > Actions**:

- **`MASTODON_ACCESS_TOKEN`** — Create at fosstodon.org > Settings > Applications (scope: `write:statuses`)
- **`BLUESKY_PASSWORD`** — Create at bsky.app > Settings > App Passwords

### Local usage

```sh
# Dry run — prints what would be posted without actually posting
node scripts/syndicate.js --dry-run

# Real run (needs env vars)
MASTODON_ACCESS_TOKEN=xxx BLUESKY_PASSWORD=xxx node scripts/syndicate.js
```
