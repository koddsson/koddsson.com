module.exports = {
  ci: {
    collect: {
      staticDistDir: "./_site",
    },
    upload: {
      target: "temporary-public-storage",
    },
    assert: {
      preset: "lighthouse:no-pwa",
      assertions: {
        "csp-xss": false,
        "resource-summary:document:size": ["error", { maxNumericValue: 10 }],
      },
    },
  },
};
