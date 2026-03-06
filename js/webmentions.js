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

    if (likes.length > 0) {
      container.appendChild(buildReactionLine(likes, "liked"));
    }

    if (reposts.length > 0) {
      container.appendChild(buildReactionLine(reposts, "reposted"));
    }

    if (replies.length > 0) {
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
      container.appendChild(list);
    }
  } catch {
    container.remove();
  }
}

function buildAvatar(author) {
  if (!author?.photo) return null;
  const img = document.createElement("img");
  img.src = author.photo;
  img.alt = author?.name || "Anonymous";
  img.width = 24;
  img.height = 24;
  img.loading = "lazy";
  return img;
}

function buildReactionLine(mentions, verb) {
  const div = document.createElement("p");
  div.className = "webmention-reaction";

  const first = mentions[0];
  const firstAvatar = buildAvatar(first.author);
  if (firstAvatar) {
    div.appendChild(firstAvatar);
    div.append(" ");
  }
  const firstLink = document.createElement("a");
  firstLink.href = first.author?.url || "#";
  firstLink.textContent = first.author?.name || "Anonymous";
  div.appendChild(firstLink);

  const rest = mentions.slice(1);
  if (rest.length > 0) {
    div.append(" and ");
    const toggle = document.createElement("button");
    toggle.className = "webmention-toggle";
    toggle.textContent = `${rest.length} other${rest.length !== 1 ? "s" : ""}`;
    div.appendChild(toggle);

    const dialog = document.createElement("dialog");
    dialog.className = "webmention-dialog";

    const header = document.createElement("div");
    header.className = "webmention-dialog-header";
    const title = document.createElement("strong");
    title.textContent = `${mentions.length} people ${verb} this`;
    header.appendChild(title);
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "Close";
    closeBtn.addEventListener("click", () => dialog.close());
    header.appendChild(closeBtn);
    dialog.appendChild(header);

    const list = document.createElement("ul");
    list.className = "webmention-dialog-list";
    for (const m of rest) {
      const li = document.createElement("li");
      const avatar = buildAvatar(m.author);
      if (avatar) {
        li.appendChild(avatar);
        li.append(" ");
      }
      const a = document.createElement("a");
      a.href = m.author?.url || "#";
      a.textContent = m.author?.name || "Anonymous";
      li.appendChild(a);
      list.appendChild(li);
    }
    dialog.appendChild(list);
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) dialog.close();
    });

    div.appendChild(dialog);

    toggle.addEventListener("click", () => dialog.showModal());
  }

  div.append(` ${verb} this`);
  return div;
}
