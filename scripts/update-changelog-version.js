const moment = require("moment");
const fs = require("fs");
const { changelogPath, fatalError } = require("./helpers");

if (process.argv.length < 3) {
  fatalError("Usage: update-changelog-version <releasingVersion>");
}

const releasingVersion = process.argv[2];

fs.readFile(changelogPath, "utf8", (err, data) => {
  if (err) {
    fatalError(`Failed to read changelog: ${err}`);
  }

  if (data.indexOf("## UNRELEASED") < 0) {
    fatalError(
      "Changelog does not contain an UNRELEASED section. Please add one with the appropriate notes."
    );
  }

  const date = moment().format("YYYY-MM-DD");
  data = data.replace("## UNRELEASED", `## ${releasingVersion} - ${date}`);

  fs.writeFile(changelogPath, data, err => {
    if (err) {
      fatalError(`Failed to write changelog: ${err}`);
    }
  });
});
