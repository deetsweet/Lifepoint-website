// Lifepoint Church website
// Source lives in src/, the built site is written to docs/ (GitHub Pages serves docs/).
//
// While the site is a test on deetsweet.github.io/Lifepoint-website/ every link needs
// that prefix. When the domain moves across, set PATH_PREFIX to "/" (or delete it).

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" });
  eleventyConfig.addPassthroughCopy({ "src/.nojekyll": ".nojekyll" });

  // Links typed straight into page text (href="/youth/") also need the prefix.
  // This adds it to any root-relative href/src that doesn't already have it.
  const prefix = (process.env.PATH_PREFIX || "/Lifepoint-website/").replace(/\/$/, "");
  eleventyConfig.addTransform("prefix-links", function (content) {
    if (!prefix || !(this.page.outputPath || "").endsWith(".html")) return content;
    return content.replace(/(href|src)="\/(?!\/)([^"]*)"/g, (m, attr, rest) =>
      ("/" + rest).startsWith(prefix + "/") ? m : `${attr}="${prefix}/${rest}"`);
  });

  return {
    dir: { input: "src", output: "docs", includes: "_includes", data: "_data" },
    pathPrefix: process.env.PATH_PREFIX || "/Lifepoint-website/",
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
