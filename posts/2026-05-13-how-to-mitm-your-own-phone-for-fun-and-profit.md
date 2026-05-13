---
draft: false
title: how to MITM your own phone for fun and profit
layout: default.html
date: 2026-05-13
description: "I recenetly found out how to sniff network requests from apps using `mitmproxy`"
---

I recently discovered that you are able to use a combination of the [WireGuard](https://www.wireguard.com/) vpn app on your iPhone and [`mitmproxy`](https://www.mitmproxy.org/) on your macOS to listen to network requests that your phone is making to the wider network. 

![Wireguard Screenshot](/imgs/wireguard-screenshot.png)

This is really useful to look at what APIs the apps on your phone are talking to and what the requests and responses look like. You wouldn’t BELIEVE the insecure and weird stuff that apps are doing just because they don’t expect hackers to sniff out the requests like this. On browsers it’s trivial to look at the network panel on devtools so web app authors are almost forced to think about security in a more concrete way whereas app developers might not need to as much.

![Wireguard Screenshot](/imgs/wireguard-screenshot2.png)

Check out `mitmproxy` if this is interesting to you.
