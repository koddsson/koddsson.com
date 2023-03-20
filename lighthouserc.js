module.exports = {
  ci: {
    collect: {
      staticDistDir: "./_site",
    },
    upload: {
      target: "temporary-public-storage",
    },
    assert: {
      "assertions": {
        // Make sure all pages are below 512kb. See: https://512kb.club/
        "resource-summary:total:size": ["error", {"maxNumericValue": 512000}],
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 1}],
        "categories:best-practices": ["error", {"minScore": 1}],
        "categories:seo": ["error", {"minScore": 1}]
      }
    }
  }
};
