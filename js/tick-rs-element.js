export class TickRsElement extends HTMLElement {
  static observedAttributes = ["id"];

  #controller = undefined;

  async connectedCallback() {
    this.attachShadow({ mode: "open" });

    await Promise.all([
      this.#fetch(),
      this.#increment(),
    ]);
  }

  async attributeChangedCallback(name) {
    if (name === "id") {
      await this.#fetch();
    }
  }

  get #url() {
    const id = this.getAttribute("id");
    return new URL(`https://tick.rs/c/${id}`);
  }

  async #increment() {
    const incrementedAlready = sessionStorage.getItem("tick-rs-incremented");
    if (incrementedAlready) return;

    await fetch(this.#url, { method: "POST" });
    sessionStorage.setItem("tick-rs-incremented", true);
  }

  async #fetch() {
    if (this.#controller) {
      this.#controller.abort("Request already in-flight");
    }
    this.#controller = new AbortController();
    const signal = this.#controller.signal;

    const response = await fetch(this.#url, { signal });
    const text = await response.text();

    const number = Number.parseInt(text, "10");
    this.#render(number);
  }

  #render(number) {
    const formattedNumber = new Intl.NumberFormat().format(number);
    this.shadowRoot.innerHTML =
      `<style>:host { display: block; font-size: 3rem; }</style><div>${formattedNumber}</div>`;
  }
}

window.customElements.define("tick-rs", TickRsElement);
