module.exports = async (browser, context) => {
  browser.on("targetcreated", async (target) => {
    if (target.type() !== "page") return;

    const page = await target.page();

    // Intercept API response and pass mock data for Puppeteer
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      if (request.isInterceptResolutionHandled()) return;
      const url = request.url();
      if (request.url().startsWith("https://vitals.koddsson.workers.dev")) {
        request.respond({
          status: 201,
          body: "",
        });
      } else {
        request.continue();
      }
    });
  });
};
