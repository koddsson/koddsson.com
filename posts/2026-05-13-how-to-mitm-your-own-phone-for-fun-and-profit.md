---
draft: false
title: how to MITM your own phone for fun and profit
layout: default.html
date: 2026-05-13T00:00:00.000Z
description: I recently found out how to sniff network requests from apps using `mitmproxy`
syndicate: true
syndicated_to:
  mastodon: 'https://fosstodon.org/@koddsson/116566590978472762'
  bluesky: 'https://bsky.app/profile/koddsson.com/post/3mlpywipyds23'
---

I recently discovered that you are able to use a combination of the [WireGuard](https://www.wireguard.com/) vpn app on your iPhone and [`mitmproxy`](https://www.mitmproxy.org/) on your macOS to listen to network requests that your phone is making to the wider network.

![mitmproxy's WireGuard server setup screen, showing the generated peer config and a QR code for the iPhone WireGuard app](/imgs/wireguard-screenshot.png)

It's pretty easy to set up:

- `brew install mitmproxy`
- Install WireGuard on your phone
- `mitmproxy --mode regular@8081 --mode wireguard`
- Open up `http://localhost:8081`
- Scan the generated QR code in the WireGuard app to set up the VPN connection
- Visit `mitm.it` to install a root certificate (to decrypt TLS traffic)
- Open up the app you would like to sniff the traffic from and get sniffin'

![mitmproxy's flow list view showing intercepted HTTPS requests from the iPhone, including hostnames, methods, status codes, and timings](/imgs/wireguard-screenshot2.png)

This is really useful to look at what APIs the apps on your phone are talking to and what the requests and responses look like. You wouldn’t BELIEVE the insecure and weird stuff that apps are doing just because they don’t expect hackers to sniff out the requests like this. On browsers it’s trivial to look at the network panel on devtools so web app authors are almost forced to think about security in a more concrete way whereas app developers might not need to as much.


Check out `mitmproxy` if this is interesting to you.
