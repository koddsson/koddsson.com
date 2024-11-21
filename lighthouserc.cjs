const puppeteer = require("puppeteer");

const settings = {
  ci: {
    collect: {
      staticDistDir: "./_site",
      puppeteerScript: "./puppeteer.cjs",
      puppeteerLaunchOptions: { headless: "new" },
      chromePath: puppeteer.executablePath(),
      numberOfRuns: process.env.CI ? 3 : 1,
    },
    upload: {
      target: "temporary-public-storage",
    },
    assert: {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 1 }],
        "categories:best-practices": ["error", { "minScore": 1 }],
        "categories:seo": ["error", { "minScore": 1 }],
      },
    },
  },
};

if (process.env.GITHUB_ACTION) {
  settings.ci.collect.settings = {
    throttling: {
      cpuSlowdownMultiplier: 1.7,
    },
  };
}

module.exports = settings;
