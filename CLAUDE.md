# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal website for Kristján Oddsson built with **Eleventy (11ty) v3**. It follows IndieWeb principles (POSSE — Publish on Own Site, Syndicate Elsewhere) with webmentions support, social media syndication to Mastodon and Bluesky, and Strava workout integration.

## Commands

- **Dev server:** `npm start` (Eleventy with hot reload)
- **Build:** `npm run build` (generates `_site/`)
- **Performance tests:** `npm run test:performance` (Lighthouse CI — requires min 90% perf, 100% accessibility/best-practices/SEO)

## Architecture

**Static site generator:** Eleventy with Liquid templates and Markdown content (markdown-it).

**Content types** live in top-level directories, each with an `index.md` listing page and a `{collection}.json` metadata file:
- `posts/` — blog articles
- `notes/` — microblog entries (uses relative timestamps)
- `links/` — curated external links
- `images/` — photo gallery pages (image assets in `imgs/`)

**Layout:** Single layout in `_layouts/default.html`. Includes live in `_includes/`.

**Data files** in `_data/`:
- `images.json` — image metadata with syndication tracking and variant info
- `site.json` — site-wide metadata
- `workouts.js` — Strava workout data processor

**Client-side JS** in `js/`:
- `webmentions.js` — fetches and displays likes/reposts on dated content
- `toot-embed-element.js` — custom element for Mastodon embeds
- Web Vitals tracking sent to `vitals.koddsson.workers.dev`

**CSS:** Open Props utility framework + custom styles in `css/index.css`, processed by PostCSS with cssnano minification.

## Eleventy Configuration (.eleventy.js)

- **Collections:** `lastFivePosts`, `filteredPosts` (excludes drafts and tag-filtered)
- **Custom filters:** `first`, `last`, `jsonify`, `relativeTime`
- **Plugins:** syntax highlighting, PostCSS, eleventy-img transform
- **Pass-through copy:** `imgs/`, `assets/`, `js/`, `favicon.ico`, `CNAME`, workout SVGs
- **Liquid options:** UTC timezone, JS-truthy values

## Syndication System

`scripts/syndicate.js` scans content with `syndicate: true` in front matter, posts to Mastodon (fosstodon.org) and Bluesky, then writes syndication URLs back to `syndicated_to` in the front matter. Supports `--dry-run`. Respects platform character limits (500 Mastodon, 300 Bluesky). Runs via `.github/workflows/syndicate.yml` after successful builds.

## CI/CD (GitHub Actions)

- **main.yml:** Build with Node 20, Lighthouse CI, deploy to GitHub Pages
- **syndicate.yml:** Triggered after main workflow; syndicates new content
- **strava_webhook.yml:** Processes Strava webhooks, saves workout JSON to `data/workouts/`
- **race_calendar.yml:** Daily scheduled generation of `assets/race-calendar.ics`

## Content Authoring

Posts use YAML front matter. Key fields:
- `syndicate: true` — flags content for social media syndication
- `syndicated_to` — object tracking where content has been syndicated (mastodon/bluesky URLs)
- `draft: true` — excludes from collections
- `tags` — used for collection filtering
