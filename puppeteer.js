module.exports = async (browser, context) => {
  // Intercept API response and pass mock data for Puppeteer
  await page.setRequestInterception(true);
  page.on('request', request => {
    if (request.url().startsWith('https://vitals.koddsson.workers.dev')) {
      request.respond({
        status: 201,
        body: '' 
      });
    } else {
      request.continue();
    }
  });
};
