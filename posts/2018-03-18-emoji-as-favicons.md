---
title: Emojis as favicons
layout: default.html
date: 2018-03-18
description: "A blog post describing how to use JavaScript to quickly set a websites favicon to a emoji"
---

So I was working on [jsonresume.io](https://jsonresume.io) this weekend and really wanted a favicon for the page. I don't know about you but I kind of dislike having to add a favicon. I don't really know how to make a icon and so I keep reaching more and more into the ever expanding unicode emoji sets.

I really wanted just to drop a 📝 into a `<link />` tag and call it a day. As far as I knew this wasn't possible, prompting this tweet:

<blockquote>
  <p>Which technical committee do I need to submit a proposal to in order to get emojis as favicons?  <a href="https://twitter.com/WHATWG?ref_src=twsrc%5Etfw">@WHATWG</a> ?</p>
</blockquote>

To make a long story short, I made my way to [whatwg.org](https://whatwg.org/) to figure out how to make a proposal. That lead me to this issue [#661](https://github.com/whatwg/html/issues/661). That mentions that you can set the favicon dynamically with a data uri.

Turns out I don't need to do a proposal at all! Even though it's not as easy as `<link rel="icon" value="🍕" />` it's still pretty straightforward if you can write some JavaScript. Here's the code I wrote to set the favicon of this post:

```js
const canvas = document.createElement('canvas')
canvas.height = 64
canvas.width = 64

const ctx = canvas.getContext('2d')
ctx.font = '64px serif'
ctx.fillText('🛰', 0, 64)
console.log(canvas.toDataURL())

const favicon = document.querySelector('link[rel=icon]')
favicon.href = canvas.toDataURL()
```

You could even wrap this in a function and dynamically set the favicon.

Let me know if you enjoyed this post on [twitter](https://twitter.com/koddsson) 🙌.

## <time datetime="2018-03-24T22:00">March 24th 2018</time> update.

I refined the script a bit and it ends up looking like this:

```js
const favicon = document.querySelector("link[rel=icon]");

if (favicon) {
  const emoji = favicon.getAttribute("data-emoji");

  if (emoji) {
    const canvas = document.createElement("canvas");
    canvas.height = 64;
    canvas.width = 64;

    const ctx = canvas.getContext("2d");
    ctx.font = "64px serif";
    ctx.fillText(emoji, 0, 64);

    favicon.href = canvas.toDataURL();
  }
}
```

This change means that I only need to include this script and set the emoji I want as a favicon like so:

```html
<link rel="icon" data-emoji="🛰" type="image/png" />
```

Exactly what I wanted orginally! 🤙

<!-- Include `OpenHeartElement` -->
<script src="https://unpkg.com/open-heart-element" type="module" defer></script>

<!-- Render `<open-heart>` -->
<open-heart href="https://open-heart-endpoint.koddsson.workers.dev/?id={{page.path}}" emoji="❤️">♥</open-heart>
