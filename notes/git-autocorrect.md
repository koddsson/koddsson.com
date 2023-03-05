---
date: 2023-03-05
layout: default.html
title: Git Autocorrect
description: "Autocorrecting git commands"
---

I tooted a little git command joke on Fosstodon the other day. 

<iframe src="https://fosstodon.org/@koddsson/109958542284187610/embed" class="mastodon-embed" style="max-width: 100%; border: 0" width="400" allowfullscreen="allowfullscreen"></iframe><script src="https://fosstodon.org/embed.js" async="async"></script>

I imagine that git terminal users like me often mis-type the commands and I'm a fan of injecting humor into my daily life. The way I created the above screenshot is by creating a git alias. Normally you git alias different git commands but you can actually execute any command as a git alias by prepending the command with a exclamation.

```sh
$ git config --get alias.ranch
!imgcat ~/Downloads/cowbow-kitten.png
```

Someone actually replied to my toot that I should alias common misspellings of commands as their right commands but I've already got [`help.autocorrect`](https://git-scm.com/book/en/v2/Customizing-Git-Git-Configuration#_help_autocorrect) set on my git config.

I'm not sure why it's not mentioned in the docs but I've got mine set to `-1` so that the autocorrect is executed immediately.
