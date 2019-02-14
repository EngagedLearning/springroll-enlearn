// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  clearMocks: true,
  rootDir: "src",
  transformIgnorePatterns: ["/node_modules/(?!@enlearn/warehouse).+\\.js$"],
};
