const path = require("node:path");
const util = require("node:util");
const crypto = require("node:crypto");
const url = require("node:url");

const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const Image = require("@11ty/eleventy-img");

async function imageShortcode(src, alt, sizes, loading = "lazy") {
  const metadata = await Image(src, {
    widths: [300, 600, "auto"],
    filenameFormat: function (id, src, width, format, options) {
      const extension = path.extname(src);
      const name = crypto.createHash("md5").update(src).digest("hex");

      return `${name}-${width}w.${format}`;
    },
  });

  const imageAttributes = {
    alt,
    sizes,
    loading,
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

  eleventyConfig.addFilter("first", function (array) {
    return array[0];
  });

  eleventyConfig.addFilter("last", function (array) {
    return array.at(-1);
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

  eleventyConfig.addFilter("jsonify", function (value) {
    return util.inspect(value);
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
