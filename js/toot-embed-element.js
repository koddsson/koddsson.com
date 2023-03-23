const html = String.raw;
const styles = new CSSStyleSheet();
styles.replaceSync(`
@supports selector(:--loading) {
  :host(:not(:--loading)) {
    display: grid;
    max-inline-size: 36em;
    padding: 0.5em;
    gap: 0.5em;
    border: 0.0625em solid grey;
    border-radius: 0.5em;
    grid-template:
      "avatar   author-link backlink" max-content
      "content  content     content"  max-content
      / min-content auto auto;
  }
}

@supports selector(:--loading) {
  @media only screen and (max-width: 600px) {
    :host(:not(:--loading)) {
      grid-template:
        "avatar   author-link author-link" max-content
        "content  content     content"     max-content
        "backlink backlink    backlink"     max-content
        / min-content auto auto;
    }
  }
}
@supports not selector(:--loading) {
  :host(:not([internals-loading])) {
    display: grid;
    max-inline-size: 36em;
    padding: 0.5em;
    gap: 0.5em;
    border: 0.0625em solid grey;
    border-radius: 0.5em;
    grid-template:
      "avatar   author-link backlink" max-content
      "content  content     content"     max-content
      / min-content auto auto;
  }
}
    
@supports not selector(:--loading) {
  @media only screen and (max-width: 600px) {
    :host(:not([internals-loading])) {
      grid-template:
        "avatar   author-link author-link" max-content
        "content  content     content"     max-content
        "backlink backlink    backlink"     max-content
        / min-content auto auto;
    }
  }
}
[part="avatar"] {
  max-inline-size: 3.125em;
  aspect-ratio: 1;
  grid-area: avatar;
  border-radius: 0.25em;
}
[part="author-link"] {
  display: grid;
  align-self: center;
  grid-area: author-link
}
[part="handle"] {
  grid-area: handle
}
[part="content"] {
  grid-area: content;
  line-height: 1.5;
}
[part="content"] > * {
  margin-block: 0;
}
[part="content"] > * + * {
  margin-block-start: 0.5em;
}
[part="backlink"] {
  grid-area: backlink;
  text-align: right;
}
[part="media"] {
  padding-top: 1em;
  width: 100%;
  grid-area: content;
}
`);

class TootEmbedElement extends HTMLElement {
  static observeAttributes = ["src"];
  #internals = null;
  #renderRoot = null;

  get src() {
    return this.getAttribute("src") || "";
  }

  set src(value) {
    this.setAttribute("src", `${value}`);
  }

  get #contentPart() {
    return this.#renderRoot.querySelector("[part=content]");
  }

  get #authorLinkPart() {
    return this.#renderRoot.querySelector("[part=author-link]");
  }

  get #authorNamePart() {
    return this.#renderRoot.querySelector("[part=author-name]");
  }

  get #authorHandlePart() {
    return this.#renderRoot.querySelector("[part=author-handle]");
  }

  get #avatarPart() {
    return this.#renderRoot.querySelector("[part=avatar]");
  }

  get #backlinkPart() {
    return this.#renderRoot.querySelector("[part=backlink]");
  }

  connectedCallback() {
    this.#internals = this.attachInternals();
    this.#internals.role = "article";
    this.#renderRoot = this.attachShadow({ mode: "open" });
    this.#renderRoot.adoptedStyleSheets.push(styles);
    if (this.querySelector('script[type="application/json"]')) {
      return this.#render(
        JSON.parse(
          this.querySelector('script[type="application/json"]').textContent
        )
      );
    }
    if (this.src) this.load();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (this.isConnected) return;
    if (this.#renderRoot) return;
    if (oldValue === newValue) return;
    this.load();
  }

  async load() {
    this.#internals.states.add("--loading");
    const { tootId } = this.#useParams();
    const apiURL = new URL(`/api/v1/statuses/${tootId}`, this.src);
    const response = await fetch(apiURL);

    this.#render(await response.json());
    this.#internals.states.delete("--loading");
  }

  #render(json) {
    const { account, url, content, media_attachments, created_at } = json;
    const handleURL = new URL(account.url);
    const { handle } = this.#useParams();
    this.#renderRoot.innerHTML = html`
      <img part="avatar" src="${account.avatar}" loading="lazy" alt="" />
      <a part="author-link" href="${handleURL.href}">
        <span part="author-name">${account.display_name}</span>
        <span part="author-handle">@${handle}@${handleURL.hostname}</span>
      </a>
      <a part="backlink" href="${url}" rel="bookmark">
        <relative-time datetime="${created_at}"></relative-time>
      </a>
      <div part="content">${content}</div>
      <img
        part="media"
        src="${media_attachments[0].url}"
        loading="lazy"
        alt="${media_attachments[0].description}"
      />
    `;
    this.#internals.states.add("--ready");
    this.#internals.ariaLabel = `${this.#authorLinkPart.textContent} ${
      this.#contentPart.textContent
    }`;
  }

  #shortPattern = RegExp(/\/@([a-z]+)\/(\d+)/);
  #longPattern = RegExp(/\/users\/([a-z]+)\/statuses\/(\d+)/);

  // Toot URLs can have two different formats:
  // 1. https://indieweb.social/@keithamus/109524390152251545
  // 2. https://indieweb.social/users/keithamus/statuses/109524390152251545
  #useParams() {
    if (this.#shortPattern.test(this.src)) {
      const [match, handle, tootId] = this.src.match(this.#shortPattern);
      return { handle, tootId };
    }

    if (this.#longPattern.text(this.src)) {
      const [match, handle, tootId] = this.src.match(this.#longPattern);
      return { handle, tootId };
    }

    throw new Error(`This doesn’t seem to be a toot URL: ${this.src}`);
  }
}

export default TootEmbedElement;

if (!window.customElements.get("toot-embed")) {
  window.TootEmbedElement = TootEmbedElement;
  window.customElements.define("toot-embed", TootEmbedElement);
}
