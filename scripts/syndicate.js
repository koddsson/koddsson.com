import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SITE_URL = "https://koddsson.com";

const DRY_RUN = process.argv.includes("--dry-run");

// Character limits
const MASTODON_LIMIT = 500;
const BLUESKY_LIMIT = 300;

// Content directories to scan (relative to ROOT)
const CONTENT_DIRS = ["notes", "posts", "links"];

function truncate(text, limit, suffix) {
  if (text.length <= limit) return text;
  return text.slice(0, limit - suffix.length) + suffix;
}

function findSyndicatable() {
  const files = [];
  for (const dir of CONTENT_DIRS) {
    const dirPath = path.join(ROOT, dir);
    if (!fs.existsSync(dirPath)) continue;

    for (const file of fs.readdirSync(dirPath)) {
      if (!file.endsWith(".md") || file === "index.md") continue;
      const filePath = path.join(dirPath, file);
      const raw = fs.readFileSync(filePath, "utf8");
      const { data, content } = matter(raw);

      if (!data.syndicate) continue;
      if (data.syndicated_to && Object.keys(data.syndicated_to).length > 0) continue;

      files.push({ filePath, data, content: content.trim(), dir });
    }
  }
  return files;
}

function buildCanonicalUrl(dir, filePath) {
  const slug = path.basename(filePath, ".md");
  return `${SITE_URL}/${dir}/${slug}/`;
}

function buildPostText(dir, data, content, canonicalUrl) {
  switch (dir) {
    case "notes":
      return { text: `${content}\n\n${canonicalUrl}` };
    case "posts":
      return { text: `${data.description || data.title}\n\n${canonicalUrl}` };
    case "links": {
      const linkedUrl = data.link || "";
      const commentary = content || data.description || "";
      return { text: `${linkedUrl}\n\n${commentary}\n\n${canonicalUrl}` };
    }
    default:
      return { text: `${data.title}\n\n${canonicalUrl}` };
  }
}

// Strip markdown to plain text (basic)
function stripMarkdown(text) {
  return text
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1") // images
    .replace(/\[([^\]]*)\]\([^)]+\)/g, "$1") // links
    .replace(/[*_~`#>]/g, "") // formatting chars
    .replace(/\n{3,}/g, "\n\n") // collapse newlines
    .trim();
}

// --- Mastodon ---

async function postToMastodon(text) {
  const token = process.env.MASTODON_ACCESS_TOKEN;
  if (!token) throw new Error("MASTODON_ACCESS_TOKEN not set");

  const res = await fetch("https://fosstodon.org/api/v1/statuses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status: text }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Mastodon API error ${res.status}: ${body}`);
  }

  const json = await res.json();
  return json.url;
}

// --- Bluesky ---

async function blueskyLogin() {
  const identifier = process.env.BLUESKY_IDENTIFIER || "koddsson.com";
  const password = process.env.BLUESKY_PASSWORD;
  if (!password) throw new Error("BLUESKY_PASSWORD not set");

  const res = await fetch(
    "https://bsky.social/xrpc/com.atproto.server.createSession",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Bluesky login error ${res.status}: ${body}`);
  }

  return res.json();
}

function detectFacets(text) {
  const facets = [];
  // Detect URLs
  const urlRegex = /https?:\/\/[^\s)]+/g;
  let match;
  while ((match = urlRegex.exec(text)) !== null) {
    const byteStart = Buffer.byteLength(text.slice(0, match.index), "utf8");
    const byteEnd = byteStart + Buffer.byteLength(match[0], "utf8");
    facets.push({
      index: { byteStart, byteEnd },
      features: [{ $type: "app.bsky.richtext.facet#link", uri: match[0] }],
    });
  }
  return facets;
}

async function postToBluesky(text, session) {
  const now = new Date().toISOString();
  const facets = detectFacets(text);

  const record = {
    $type: "app.bsky.feed.post",
    text,
    createdAt: now,
    langs: ["en"],
  };
  if (facets.length > 0) record.facets = facets;

  const res = await fetch(
    "https://bsky.social/xrpc/com.atproto.repo.createRecord",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.accessJwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        repo: session.did,
        collection: "app.bsky.feed.post",
        record,
      }),
    },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Bluesky post error ${res.status}: ${body}`);
  }

  const json = await res.json();
  // Build the web URL from the URI
  const rkey = json.uri.split("/").pop();
  return `https://bsky.app/profile/${session.handle}/post/${rkey}`;
}

// --- Main ---

async function main() {
  const files = findSyndicatable();

  if (files.length === 0) {
    console.log("No posts to syndicate.");
    return;
  }

  console.log(`Found ${files.length} post(s) to syndicate.`);

  let blueskySession = null;

  for (const { filePath, data, content, dir } of files) {
    const canonicalUrl = buildCanonicalUrl(dir, filePath);
    const { text: rawText } = buildPostText(dir, data, content, canonicalUrl);
    const plainText = stripMarkdown(rawText);

    const mastodonText = truncate(plainText, MASTODON_LIMIT, `\u2026\n${canonicalUrl}`);
    const blueskyText = truncate(plainText, BLUESKY_LIMIT, `\u2026\n${canonicalUrl}`);

    console.log(`\n--- ${path.relative(ROOT, filePath)} ---`);
    console.log(`Mastodon (${mastodonText.length} chars):\n${mastodonText}`);
    console.log(`Bluesky (${blueskyText.length} chars):\n${blueskyText}`);

    if (DRY_RUN) {
      console.log("[dry-run] Skipping actual posts.");
      continue;
    }

    const syndicated_to = {};

    try {
      const mastodonUrl = await postToMastodon(mastodonText);
      console.log(`Mastodon: ${mastodonUrl}`);
      syndicated_to.mastodon = mastodonUrl;
    } catch (err) {
      console.error(`Mastodon error: ${err.message}`);
    }

    try {
      if (!blueskySession) blueskySession = await blueskyLogin();
      const blueskyUrl = await postToBluesky(blueskyText, blueskySession);
      console.log(`Bluesky: ${blueskyUrl}`);
      syndicated_to.bluesky = blueskyUrl;
    } catch (err) {
      console.error(`Bluesky error: ${err.message}`);
    }

    if (Object.keys(syndicated_to).length > 0) {
      const raw = fs.readFileSync(filePath, "utf8");
      const parsed = matter(raw);
      parsed.data.syndicated_to = syndicated_to;
      const updated = matter.stringify(parsed.content, parsed.data);
      fs.writeFileSync(filePath, updated);
      console.log(`Updated front matter in ${path.relative(ROOT, filePath)}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
