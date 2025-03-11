---
title: Implementing View Transitions on koddsson.com
layout: default.html
date: 2023-05-31
description: "How I implemented MPA View Transitions on koddsson.com"
---

Welcome to a development journey post for my personal website, koddsson.com. Today, we'll explore how I implemented view transitions to enhance the user interface and provide a more engaging browsing experience. The changes were made in a [Pull Request titled "Implement View Transitions!"](https://github.com/koddsson/koddsson.com/pull/53).

View transitions are a key part of modern web design, adding visual continuity and smoothness when moving between different views or pages on a website. They can greatly improve the user experience by reducing visual abruptness and providing a sense of spatial awareness. Inspired by this, I decided it was time to introduce this feature to my own website, koddsson.com.

The process of implementing view transitions involved changes in [two main files](https://github.com/koddsson/koddsson.com/pull/53/commits/4faeb48632e1494751add39e80a1a380db938a0b).

1.  `_layouts/default.html`: Here, I introduced a meta tag `<meta name="view-transition" content="same-origin">` to set the view transition property. This tag indicates that we want to enable transitions for navigations to and from this page.
2.  `css/index.css`: This file saw a more substantial change. I added a CSS `@supports` rule that checks if the browser supports the property `view-transition-name`. If it does, two new properties are set: `view-transition-name: header;` under the `header` section and `view-transition-name: main;` under the `main` section. These properties enable the transitions for the `header` and `main` views.

Creating this Pull Request was a process of research, trial-and-error, and testing. I started by researching how view transitions could be implemented and found the [explainer document](https://github.com/WICG/view-transitions/blob/main/explainer.md) to be extremely helpful. After writing the code, I thoroughly tested it to ensure it worked as expected. The Pull Request passed all six checks before being merged, confirming the changes didn't regress the performance or accessibility of the page in any way that [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) can detect.

<img src="/imgs/github-lighthouse-checks-screenshot.png" alt="Screenshot of github.com pull request checks showing 6 lighthouse checks that are all passing.">

The view transitions have significantly improved the visual experience of browsing koddsson.com. The transitions between different views are now smooth and engaging. And according to [the View Transitions explainer](https://github.com/WICG/view-transitions/blob/main/explainer.md) these transitions also: "\[...\] lower the cognitive load by helping users [stay in context](https://www.smashingmagazine.com/2013/10/smart-transitions-in-user-experience-design/) as they navigate from Page-A to Page-B, and [reduce the perceived latency](https://wp-rocket.me/blog/perceived-performance-need-optimize/#:~:text=1.%20Use%20activity%20and%20progress%20indicators) of loading." I encourage you to visit the website and experience these transitions firsthand.

<div class="info">
You need to browse the website using Chrome and have these two experimental flags enable to be able to view these transitions:


```
chrome://flags#view-transition
chrome://flags#view-transition-on-navigation
```
</div>

Looking ahead, I plan to continue refining these transitions and exploring other ways to enhance the site's user interface.

In this post, we've delved into the process of implementing view transitions on koddsson.com. I hope this glimpse into my development process has been informative and interesting. As always, I welcome your feedback and questions. Happy browsing!

<div style="font-size: var(--size-fluid-3);">Changelog</div>

<ol style="margin: 0; padding: 0; list-style: none; font-size: var(--font-size-1);">
    <li style="display: flex;max-inline-size: unset; padding-inline-start: unset;">
        <span style="font-family: var(--font-mono); margin-right: var(--size-3);">May 30, 2023</span>
        <span style="flex: 1;">Add instruction on how to enable View Transitions.</span>
    </li>
</ol>
