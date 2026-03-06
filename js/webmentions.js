const target = `https://koddsson.com${location.pathname}`;
const url = `https://webmention.io/api/mentions.jf2?target=${encodeURIComponent(target)}&per-page=100`;

const container = document.getElementById("webmentions");
if (container) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    const mentions = data.children || [];

    if (mentions.length === 0) {
      container.remove();
      throw new Error("No webmentions found");
    }

    const likes = mentions.filter((m) => m["wm-property"] === "like-of");
    const reposts = mentions.filter((m) => m["wm-property"] === "repost-of");
    const replies = mentions.filter(
      (m) => m["wm-property"] === "in-reply-to" || m["wm-property"] === "mention-of",
    );

    const heading = document.createElement("h2");
    heading.textContent = "Webmentions";
    container.appendChild(heading);

    if (likes.length > 0) {
      container.appendChild(buildFacesSection(`${likes.length} like${likes.length !== 1 ? "s" : ""}`, likes));
    }

    if (reposts.length > 0) {
      container.appendChild(buildFacesSection(`${reposts.length} repost${reposts.length !== 1 ? "s" : ""}`, reposts));
    }

    if (replies.length > 0) {
      const details = document.createElement("details");
      details.open = true;
      const summary = document.createElement("summary");
      summary.textContent = `${replies.length} repl${replies.length !== 1 ? "ies" : "y"}`;
      details.appendChild(summary);

      const list = document.createElement("ol");
      list.className = "webmention-replies";
      for (const m of replies) {
        const li = document.createElement("li");
        li.className = "webmention-reply";

        const meta = document.createElement("div");
        meta.className = "webmention-meta";
        if (m.author?.photo) {
          const img = document.createElement("img");
          img.src = m.author.photo;
          img.alt = m.author?.name || "Anonymous";
          img.width = 32;
          img.height = 32;
          img.loading = "lazy";
          meta.appendChild(img);
          meta.append(" ");
        }
        const authorLink = document.createElement("a");
        authorLink.href = m.author?.url || "#";
        const strong = document.createElement("strong");
        strong.textContent = m.author?.name || "Anonymous";
        authorLink.appendChild(strong);
        meta.appendChild(authorLink);
        if (m.published) {
          meta.append(
            " " +
              new Date(m.published).toLocaleDateString("en", {
                year: "numeric",
                month: "short",
                day: "numeric",
              }),
          );
        }
        li.appendChild(meta);

        const p = document.createElement("p");
        p.textContent = m.content?.text || "";
        li.appendChild(p);

        list.appendChild(li);
      }
      details.appendChild(list);
      container.appendChild(details);
    }
  } catch {
    container.remove();
  }
}

function buildFacesSection(label, mentions) {
  const details = document.createElement("details");
  details.open = true;
  const summary = document.createElement("summary");
  summary.textContent = label;
  details.appendChild(summary);

  const div = document.createElement("div");
  div.className = "webmention-faces";
  for (const m of mentions) {
    const a = document.createElement("a");
    a.href = m.author?.url || "#";
    a.title = m.author?.name || "Anonymous";
    if (m.author?.photo) {
      const img = document.createElement("img");
      img.src = m.author.photo;
      img.alt = m.author?.name || "Anonymous";
      img.width = 32;
      img.height = 32;
      img.loading = "lazy";
      a.appendChild(img);
    } else {
      a.textContent = m.author?.name || "Anonymous";
    }
    div.appendChild(a);
    div.append(" ");
  }
  details.appendChild(div);
  return details;
}
