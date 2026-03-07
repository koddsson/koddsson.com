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

// --- Image helpers ---

const IMAGES_PATH = path.join(ROOT, "_data", "images.json");

function findSyndicatableImages() {
  if (!fs.existsSync(IMAGES_PATH)) return [];
  const images = JSON.parse(fs.readFileSync(IMAGES_PATH, "utf8"));
  return images.filter((img) => !img.syndicated_to);
}

function getPublicUrl(image) {
  const publicVariant = image.variants.find((v) => v.endsWith("/public"));
  return publicVariant || image.variants[0];
}

async function fetchImageBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// --- Mastodon ---

async function uploadToMastodon(imageBuffer, alt) {
  const token = process.env.MASTODON_ACCESS_TOKEN;
  if (!token) throw new Error("MASTODON_ACCESS_TOKEN not set");

  const form = new FormData();
  form.append("file", new Blob([imageBuffer], { type: "image/jpeg" }), "image.jpeg");
  if (alt) form.append("description", alt);

  const res = await fetch("https://fosstodon.org/api/v2/media", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Mastodon media upload error ${res.status}: ${body}`);
  }

  const json = await res.json();
  return json.id;
}

async function postToMastodon(text, mediaIds) {
  const token = process.env.MASTODON_ACCESS_TOKEN;
  if (!token) throw new Error("MASTODON_ACCESS_TOKEN not set");

  const body = { status: text };
  if (mediaIds && mediaIds.length > 0) body.media_ids = mediaIds;

  const res = await fetch("https://fosstodon.org/api/v1/statuses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
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

async function uploadToBluesky(imageBuffer, session) {
  const res = await fetch(
    "https://bsky.social/xrpc/com.atproto.repo.uploadBlob",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.accessJwt}`,
        "Content-Type": "image/jpeg",
      },
      body: imageBuffer,
    },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Bluesky image upload error ${res.status}: ${body}`);
  }

  const json = await res.json();
  return json.blob;
}

async function postToBluesky(text, session, embed) {
  const now = new Date().toISOString();
  const facets = detectFacets(text);

  const record = {
    $type: "app.bsky.feed.post",
    text,
    createdAt: now,
    langs: ["en"],
  };
  if (facets.length > 0) record.facets = facets;
  if (embed) record.embed = embed;

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

async function syndicateMarkdownPosts(blueskySession) {
  const files = findSyndicatable();

  if (files.length === 0) {
    console.log("No markdown posts to syndicate.");
  } else {
    console.log(`Found ${files.length} post(s) to syndicate.`);
  }

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
      if (!blueskySession.session) blueskySession.session = await blueskyLogin();
      const blueskyUrl = await postToBluesky(blueskyText, blueskySession.session);
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

async function syndicateImages(blueskySession) {
  const images = findSyndicatableImages();

  if (images.length === 0) {
    console.log("No images to syndicate.");
    return;
  }

  console.log(`Found ${images.length} image(s) to syndicate.`);

  const allImages = JSON.parse(fs.readFileSync(IMAGES_PATH, "utf8"));

  for (const image of images) {
    const canonicalUrl = `${SITE_URL}/images/${image.id}/`;
    const caption = image.meta.caption || "";
    const alt = image.meta.alt || "";
    const text = `${caption}\n\n${canonicalUrl}`;

    const mastodonText = truncate(text, MASTODON_LIMIT, `\u2026\n${canonicalUrl}`);
    const blueskyText = truncate(text, BLUESKY_LIMIT, `\u2026\n${canonicalUrl}`);

    console.log(`\n--- image: ${image.id} ---`);
    console.log(`Caption: ${caption}`);
    console.log(`Mastodon (${mastodonText.length} chars):\n${mastodonText}`);
    console.log(`Bluesky (${blueskyText.length} chars):\n${blueskyText}`);

    if (DRY_RUN) {
      console.log("[dry-run] Skipping actual posts.");
      continue;
    }

    const imageUrl = getPublicUrl(image);
    let imageBuffer;
    try {
      imageBuffer = await fetchImageBuffer(imageUrl);
      console.log(`Fetched image (${imageBuffer.length} bytes)`);
    } catch (err) {
      console.error(`Failed to fetch image: ${err.message}`);
      continue;
    }

    const syndicated_to = {};

    try {
      const mediaId = await uploadToMastodon(imageBuffer, alt);
      const mastodonUrl = await postToMastodon(mastodonText, [mediaId]);
      console.log(`Mastodon: ${mastodonUrl}`);
      syndicated_to.mastodon = mastodonUrl;
    } catch (err) {
      console.error(`Mastodon error: ${err.message}`);
    }

    try {
      if (!blueskySession.session) blueskySession.session = await blueskyLogin();
      const blob = await uploadToBluesky(imageBuffer, blueskySession.session);
      const embed = {
        $type: "app.bsky.embed.images",
        images: [{ alt, image: blob }],
      };
      const blueskyUrl = await postToBluesky(blueskyText, blueskySession.session, embed);
      console.log(`Bluesky: ${blueskyUrl}`);
      syndicated_to.bluesky = blueskyUrl;
    } catch (err) {
      console.error(`Bluesky error: ${err.message}`);
    }

    if (Object.keys(syndicated_to).length > 0) {
      const idx = allImages.findIndex((img) => img.id === image.id);
      if (idx !== -1) {
        allImages[idx].syndicated_to = syndicated_to;
      }
    }
  }

  fs.writeFileSync(IMAGES_PATH, JSON.stringify(allImages, null, 2) + "\n");
  console.log("Updated _data/images.json with syndication URLs.");
}

async function main() {
  const blueskySession = { session: null };
  await syndicateMarkdownPosts(blueskySession);
  await syndicateImages(blueskySession);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
