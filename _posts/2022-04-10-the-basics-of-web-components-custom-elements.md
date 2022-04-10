---
title: "The basics of Web Components: Custom Elements"
datetime: 2022-04-10T21:00
---

<link rel="stylesheet" href="/code-highlight-github.css" />

I find some of the resources online for Web Components go from 0 to 100 quickly. I want to create a resource that goes really through the basics, avoiding tech that I think is a bad idea. It's gonna be short posts that I'll try to post semi-regularly. I'm hoping that over time we build up to more complicated things.

So let's start with the basics! Creating a custom element or a Web Component. The API that all the other technology we'll talk about interface with. Before we talk about custom elements, though, we need to talk about regular HTML elements.

Chances are that if you're already reading so far, you know what HTML elements are but indulge me for a moment.

HTML elements are the building blocks of websites that make up the World Wide Web. Elements such as `<div>` and `<input>` layout websites and makeup forms, respectively. All HTML elements are standardized via the HTML specification[1], which is then implemented by the various browser vendors in their browser engines. Your Chromes, and Edges and Safaris. Before Web Components, Web Developers were limited by the elements provided by the HTML specification.

The way to tell the difference between a built-in HTML element defined by the specification and a custom element defined by a Web Developer is that all custom elements have at least one hyphen (`-`) in their tag name.

The built-in HTML element `input`, notice that its tag name is all one word with no hyphens. 

```html
<input />
```

A Custom Element defined by a Web Developer. The tag name includes a hyphen which is how we know it's a Custom Element.
```html
<image-frame></image-frame>
```

Another difference between built-in and custom elements is that built-in elements are already built into browsers. Custom Elements, however, need to be defined by a Web Developer and included on the website. Custom elements are defined through the custom element registry[2] in JavaScript.

A custom element definition. Here we are assigning the `ImageFrameElement` behavior to the `image-frame` tag name.
```js
window.customElements.define('image-frame', ImageFrameElement)
```

The defined element behaviour needs to be a class that extends `HTMLElement` (it's a custom HTML element, after all). We'll go over the different functionality available to us in future posts but let's put this example together to have something that actually works.

```js
class ImageFrameElement extends HTMLElement { }

window.customElements.define('image-frame', ImageFrameElement)
```

This element doesn't do anything right now, so it's essentially just a `<span></span>` element, but in the future, we'll start adding functionality to this element and explore cool patterns.

Thanks for reading; until next time ✌️