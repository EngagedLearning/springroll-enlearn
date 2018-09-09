const path = require("path");

function fatalError(message) {
  console.error(message);
  process.exit(1);
}

module.exports = {
  changelogPath: path.join(__dirname, "../CHANGELOG.md"),
  fatalError: fatalError,
};
