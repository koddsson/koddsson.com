# POSSE Syndication Setup

This site uses [POSSE](https://indieweb.org/POSSE) (Publish on your Own Site, Syndicate Elsewhere) to cross-post content to Mastodon and Bluesky.

## How it works

1. Add `syndicate: true` to any post/note/link front matter.
2. After the site deploys, the `Syndicate` GitHub Action runs.
3. The script finds files with `syndicate: true` and no `syndicated_to` URLs.
4. It posts to Mastodon and Bluesky, then writes the resulting URLs back into the front matter.

## Secrets to configure

Add these in **GitHub repo Settings > Secrets and variables > Actions**:

### `MASTODON_ACCESS_TOKEN`

1. Go to [fosstodon.org/settings/applications](https://fosstodon.org/settings/applications)
2. Click **New application**
3. Name: e.g. "koddsson.com syndication"
4. Scopes: check `write:statuses` (minimum needed)
5. Save, then copy the **access token**

### `BLUESKY_PASSWORD`

1. Go to [bsky.app/settings/app-passwords](https://bsky.app/settings/app-passwords)
2. Click **Add App Password**
3. Name: e.g. "koddsson.com syndication"
4. Copy the generated password

The Bluesky identifier defaults to `koddsson.com`. To override, also set `BLUESKY_IDENTIFIER`.

## Local usage

```sh
# Dry run — prints what would be posted without actually posting
node scripts/syndicate.js --dry-run

# Real run (needs env vars)
MASTODON_ACCESS_TOKEN=xxx BLUESKY_PASSWORD=xxx node scripts/syndicate.js
```

## Content types

| Directory | Syndicated as |
|-----------|---------------|
| `/notes/` | Full text + canonical URL |
| `/posts/` | Description/excerpt + canonical URL |
| `/links/` | Linked URL + commentary + canonical URL |

## Front matter example

```yaml
---
title: My Post
syndicate: true
---
```

After syndication:

```yaml
---
title: My Post
syndicate: true
syndicated_to:
  mastodon: "https://fosstodon.org/@koddsson/1234567890"
  bluesky: "https://bsky.app/profile/koddsson.com/post/abc123"
---
```
