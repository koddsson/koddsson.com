module.exports = async (browser, context) => {
  console.log('HELLO FROM PUPPETEER');
  browser.on("targetcreated", async (target) => {
    const page = await target.page();

    // Intercept API response and pass mock data for Puppeteer
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      if (request.isInterceptResolutionHandled()) return;
      const url = request.url();
      if (request.url().startsWith("https://vitals.koddsson.workers.dev")) {
        console.log('HELLO FROM RESPONSE', url);
        request.respond({
          status: 201,
          body: "",
        });
      } else {
        console.log('HELLO FROM CONTINUE', url);
        request.continue();
      }
    });
  });
};
