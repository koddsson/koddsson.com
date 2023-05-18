const puppeteer = require('puppeteer');

module.exports = {
  ci: {
    collect: {
      staticDistDir: "./_site",
      puppeteerScript: "./puppeteer.js",
      chromePath: puppeteer.executablePath(),
    },
    upload: {
      target: "temporary-public-storage",
    },
    assert: {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 1}],
        "categories:best-practices": ["error", {"minScore": 1}],
        "categories:seo": ["error", {"minScore": 1}]
      }
    }
  }
};
