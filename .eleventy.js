const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = function(eleventyConfig) {
  eleventyConfig.addLiquidFilter('myFilter', function (value) {
    console.log(value)
    return value
  })

  eleventyConfig.addFilter('myFilter', function (value) {
    console.log(value)
    return value
  });

  eleventyConfig.setLiquidOptions({
    // Display dates in UTC (so they don't risk being off by one day)
    timezoneOffset: 0,
    jsTruthy: true
  });

  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPassthroughCopy('img');
  eleventyConfig.addPassthroughCopy('css');
  eleventyConfig.addPassthroughCopy('js');
  eleventyConfig.addPassthroughCopy('favicon.ico');
  eleventyConfig.addPassthroughCopy('CNAME');
  
  return {
    passthroughFileCopy: true,
    dir: {
      // ⚠️ These values are both relative to your input directory.
      includes: "_includes",
      layouts: "_layouts"
    }
  }
};
