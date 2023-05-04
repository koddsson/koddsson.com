const path = require("path");

const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const Image = require("@11ty/eleventy-img");

async function imageShortcode(src, alt, sizes) {
  const metadata = await Image(src, {
    widths: [300, 600],
    filenameFormat: function (id, src, width, format, options) {
      const extension = path.extname(src);
      const name = path.basename(src, extension);

      return `${name}-${width}w.${format}`;
    }
  });

  const imageAttributes = {
    alt,
    sizes,
    loading: "lazy",
    decoding: "async",
  };

  // You bet we throw an error on missing alt in `imageAttributes` (alt="" works okay)
  return Image.generateHTML(metadata, imageAttributes);
}

const DAY_MILLISECONDS = 1000 * 60 * 60 * 24;
const MONTH_MILLISECONDS = DAY_MILLISECONDS * 30;
const YEAR_MILLISECONDS = MONTH_MILLISECONDS * 12;

const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

async function relativeTime(time) {
  const date = new Date(time);
  const daysDifference = Math.round(
    (new Date().getTime() - date) / DAY_MILLISECONDS
  );

  if (daysDifference < 29) {
    return `<time>${formatter.format(-daysDifference, "day")}</time>`;
  }

  const monthsDifference = Math.round(
    (new Date().getTime() - date) / MONTH_MILLISECONDS
  );

  if (monthsDifference < 12) {
    return `<time>${formatter.format(-monthsDifference, "month")}</time>`;
  }

  const yearsDifference = Math.round(
    (new Date().getTime() - date) / YEAR_MILLISECONDS
  );

  return `<time>${formatter.format(-yearsDifference, "year")}</time>`;
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addAsyncShortcode("image", imageShortcode);
  eleventyConfig.addAsyncShortcode("relativeTime", relativeTime);

  eleventyConfig.setLiquidOptions({
    // Display dates in UTC (so they don't risk being off by one day)
    timezoneOffset: 0,
    jsTruthy: true,
  });

  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPassthroughCopy("img");
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("favicon.ico");
  eleventyConfig.addPassthroughCopy("CNAME");
  eleventyConfig.addPassthroughCopy({
    "node_modules/web-vitals/dist/web-vitals.js": "assets/web-vitals.js",
  });

  return {
    passthroughFileCopy: true,
    dir: {
      // ⚠️ These values are both relative to your input directory.
      includes: "_includes",
      layouts: "_layouts",
    },
  };
};
