import EleventyFetch from "@11ty/eleventy-fetch";

const ENDPOINT = "https://atlas.koddsson.deno.net/goodreads";

function isoDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

export default async function () {
  let data;
  try {
    data = await EleventyFetch(ENDPOINT, {
      duration: "1h",
      type: "json",
    });
  } catch (err) {
    console.warn(`[reading] Atlas fetch failed: ${err.message}`);
    return null;
  }

  const item = data?.currently_reading?.[0];
  if (!item?.book) return null;

  return {
    title: item.book,
    pct: typeof item.percent === "number" ? item.percent : null,
    startedAt: isoDate(item.started_at),
    updatedAt: isoDate(item.updated_at),
  };
}
