---
date: 2025-03-20
layout: default.html
title: Using Web Components in Rails Instead of Stimulus
---

When building Rails applications with Hotwire, [Stimulus][stimulus] is the
default choice for client-side interactivity. It’s a lightweight way to add
behavior to HTML, but I find it mirrors [Web Components][web-components] enough
that I often reach for them instead. If you’re looking for a more portable
solution that works across different web applications, Web Components are a
compelling alternative.

Stimulus requires some startup code—though minimal—while Web Components are
built into browsers and work natively without additional dependencies.

While working at GitHub, my coworker Keith and I liked Stimulus so much
that we built [Catalyst][catalyst]—a frontend library inspired by Stimulus but
built on Web Components. It provides a similar declarative approach to managing
behavior and is still in use today, though GitHub eventually decided to rewrite
things in React (but that’s another story).

[stimulus]: https://stimulus.hotwired.dev/
[web-components]: https://developer.mozilla.org/en-US/docs/Web/API/Web_components
[catalyst]: https://github.github.io/catalyst/
