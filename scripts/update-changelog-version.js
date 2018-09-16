const fs = require("fs");
const moment = require("moment");
const { changelogPath, fatalError } = require("./helpers");

if (process.argv.length < 3) {
  fatalError("Usage: update-changelog-version <releasingVersion>");
}

const releasingVersion = process.argv[2];

fs.readFile(changelogPath, "utf8", (readError, changelog) => {
  if (readError) {
    fatalError(`Failed to read changelog: ${readError}`);
  }

  if (changelog.indexOf("## UNRELEASED") < 0) {
    fatalError(
      "Changelog does not contain an UNRELEASED section. Please add one with the appropriate notes."
    );
  }

  const date = moment().format("YYYY-MM-DD");
  changelog = changelog.replace(
    "## UNRELEASED",
    `## ${releasingVersion} - ${date}`
  );

  fs.writeFile(changelogPath, changelog, writeError => {
    if (writeError) {
      fatalError(`Failed to write changelog: ${writeError}`);
    }
  });
});
