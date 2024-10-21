---
date: 2024-10-21
layout: default.html
title: Last 7 days of Pull Requests
description: "A example of a dynamic bookmark which directs you to the Pull Request view for the last 7 days"
---

Since bookmarks can be JavaScript we can dynamically create a URL based on some data. In this case the data is the current date. We'll use that to create a GitHub search filter for pull requests created in the last 7 days.

```js
const today = new Date();
const lastWeek = new Date(new Date().setDate(new Date().getDate() - 7));

const created = [
  [lastWeek.getFullYear(), lastWeek.getUTCMonth() + 1, lastWeek.getDate()].join(
    "-",
  ),
  [today.getFullYear(), today.getUTCMonth() + 1, today.getDate()].join("-"),
].join("..");

const url = new URL("https://github.com/pulls");
const params = new URLSearchParams();

params.set("q", `is:pr author:koddsson is:closed created:${created}`);

url.search = params.toString();

window.location.href = url.toString();
```

Then we just need to compress the JavaScript, URL encode it, stick the `javascript:` protocol in front of the script and stick it in a URL. You can drag that into your bookmarks bar and now you have a easy shortcut to the work you did last week, ready for your next Monday standup!

<a href="javascript:(function()%7Bconst%20today%20%3D%20new%20Date()%3B%0Aconst%20lastWeek%20%3D%20new%20Date(new%20Date().setDate(new%20Date().getDate()-7))%3B%0A%0Aconst%20created%20%3D%20%5B%20%0A%20%20%20%20%5BlastWeek.getFullYear()%2C%20lastWeek.getUTCMonth()%20%2B%201%2C%20lastWeek.getDate()%5D.join('-')%2C%0A%20%20%20%20%5Btoday.getFullYear()%2C%20today.getUTCMonth()%20%2B%201%2C%20today.getDate()%5D.join('-')%2C%0A%5D.join('..')%3B%0A%0Aconst%20url%20%3D%20new%20URL('https%3A%2F%2Fgithub.com%2Fpulls')%3B%0Aconst%20params%20%3D%20new%20URLSearchParams()%3B%0A%0Aparams.set('q'%2C%20%60is%3Apr%20author%3Akoddsson%20is%3Aclosed%20created%3A%24%7Bcreated%7D%60)%3B%0A%0Aurl.search%20%3D%20params.toString()%3B%0A%0Awindow.location.href%20%3D%20url.toString()%3B%7D)()%3B">Last 7 days of PRs</a>.

Note that you'll need to update user name (`author:koddsson`) in the original script and then recreate the bookmarklet again to get _your_ pull requests. I used <https://caiorss.github.io/bookmarklet-maker/> to create my bookmarklet.
