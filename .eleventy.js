import path from "node:path";
import util from "node:util";
import crypto from "node:crypto";

import markdownIt from "markdown-it";
import markdownItFootnote from "markdown-it-footnote";

import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import Image from "@11ty/eleventy-img";
import postcssPlugin from "@jgarber/eleventy-plugin-postcss";

const markdownLib = markdownIt({ html: true }).use(
  markdownItFootnote,
);

async function imageShortcode(src, alt, sizes, loading = "lazy") {
  const metadata = await Image(src, {
    widths: [300, 600, "auto"],
    formats: ["webp", "jpeg", "auto"],
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
    (new Date().getTime() - date) / DAY_MILLISECONDS,
  );

  if (daysDifference < 29) {
    return `<time>${formatter.format(-daysDifference, "day")}</time>`;
  }

  const monthsDifference = Math.round(
    (new Date().getTime() - date) / MONTH_MILLISECONDS,
  );

  if (monthsDifference < 12) {
    return `<time>${formatter.format(-monthsDifference, "month")}</time>`;
  }

  const yearsDifference = Math.round(
    (new Date().getTime() - date) / YEAR_MILLISECONDS,
  );

  return `<time>${formatter.format(-yearsDifference, "year")}</time>`;
}

export default async function (eleventyConfig) {
  // set the library to process markdown files
  eleventyConfig.setLibrary("md", markdownLib);

  eleventyConfig.addAsyncShortcode("image", imageShortcode);
  eleventyConfig.addAsyncShortcode("relativeTime", relativeTime);

  eleventyConfig.addCollection("lastFivePosts", function (collectionApi) {
    return collectionApi
      .getAllSorted()
      .reverse()
      .filter((page) => {
        return page.data.tags?.includes("posts") && !page.data.draft &&
          page.url !== "/posts/";
      })
      .slice(0, 5);
  });

  eleventyConfig.addCollection("filteredPosts", function (collectionApi) {
    return collectionApi
      .getAllSorted()
      .reverse()
      .filter((page) => {
        return page.data.tags?.includes("posts") && !page.data.draft &&
          page.url !== "/posts/";
      });
  });

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
  eleventyConfig.addPlugin(postcssPlugin);

  eleventyConfig.addPassthroughCopy("img");
  eleventyConfig.addPassthroughCopy("assets");
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
}
