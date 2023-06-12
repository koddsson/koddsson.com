module.exports = async (browser, context) => {
  // launch browser for LHCI
  const page = await browser.newPage();

  // Intercept API response and pass mock data for Puppeteer
  await page.setRequestInterception(true);
  page.on('request', request => {
    if (request.isInterceptResolutionHandled()) return;
    if (request.url().startsWith('https://vitals.koddsson.workers.dev')) {
      request.respond({
        status: 201,
        body: '' 
      });
    } else {
      request.continue();
    }
  });

  // close session for next run
  await page.close();
};
