module.exports = function(eleventyConfig) {
  eleventyConfig.addCollection("blog", function(collectionApi) {
	return collectionApi.getFilteredByGlob("./blog/*.md");
  });
  return {
	dir: { input: ".", output: "_site" }
  };
};