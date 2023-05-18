---
date: 2023-03-05
layout: default.html
title: Git Autocorrect
description: "Autocorrecting git commands"
---

<link rel="preconnect" href="https://fosstodon.org">
<link rel="preconnect" href="https://cdn.fosstodon.org">

I tooted a little git command joke on Fosstodon the other day. 

<toot-embed style="min-height: 363px;" src="https://fosstodon.org/@koddsson/109958542284187610">
  <script type="application/json">
  {"id":"109958542284187610","created_at":"2023-03-03T09:03:22.356Z","in_reply_to_id":null,"in_reply_to_account_id":null,"sensitive":false,"spoiler_text":"","visibility":"public","language":"en","uri":"https://fosstodon.org/users/koddsson/statuses/109958542284187610","url":"https://fosstodon.org/@koddsson/109958542284187610","replies_count":1,"reblogs_count":8,"favourites_count":16,"edited_at":null,"content":"\u003cp\u003eSometimes I misspell git commands.\u003c/p\u003e","reblog":null,"application":null,"account":{"id":"108132325098633805","username":"koddsson","acct":"koddsson","display_name":"koddsson, the MS Teams hater","locked":false,"bot":false,"discoverable":true,"group":false,"created_at":"2022-04-14T00:00:00.000Z","note":"","url":"https://fosstodon.org/@koddsson","avatar":"/img/32f3bb9c967a5bba.webp","avatar_static":"/img/32f3bb9c967a5bba.webp","header":"https://fosstodon.org/headers/original/missing.png","header_static":"https://fosstodon.org/headers/original/missing.png","followers_count":93,"following_count":67,"statuses_count":145,"last_status_at":"2023-05-13","noindex":false,"emojis":[],"roles":[],"fields":[]},"media_attachments":[{"id":"109958533357320033","type":"image","url":"/img/92338e3488872a64.webp","preview_url":"/img/92338e3488872a64.webp","remote_url":null,"preview_remote_url":null,"text_url":null,"meta":{"original":{"width":1002,"height":770,"size":"1002x770","aspect":1.3012987012987014},"small":{"width":548,"height":421,"size":"548x421","aspect":1.3016627078384797},"focus":{"x":0.0,"y":0.0}},"description":"A screenshot of a iTerm2 terminal. The terminal shows an execution of a `git ranch` command. The command displays an inline image of mountains and the sky. In the sky there's a cat mid-scream wearing a little cowboy hat.","blurhash":"UGJ*u502Vp9a.Aa$V?R*$d-:E2%2M^M{xvsn"}],"mentions":[],"tags":[],"emojis":[],"card":null,"poll":null}
  </script>
</toot-embed>

I imagine that git terminal users like me often mis-type the commands and I'm a fan of injecting humor into my daily life. The way I created the above screenshot is by creating a git alias. Normally you git alias different git commands but you can actually execute any command as a git alias by prepending the command with a exclamation.

```sh
$ git config --get alias.ranch
!imgcat ~/Downloads/cowbow-kitten.png
```

Someone actually replied to my toot that I should alias common misspellings of commands as their right commands but I've already got [`help.autocorrect`](https://git-scm.com/book/en/v2/Customizing-Git-Git-Configuration#_help_autocorrect) set on my git config.

I'm not sure why it's not mentioned in the docs but I've got mine set to `-1` so that the autocorrect is executed immediately.
