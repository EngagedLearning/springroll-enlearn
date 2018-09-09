const parseChangelog = require("changelog-parser");
const { changelogPath, fatalError } = require("./helpers");

if (process.argv.length < 3) {
  fatalError("Usage: read-changelog <releasingVersion>");
}

const releasingVersion = process.argv[2];

parseChangelog(changelogPath, (err, result) => {
  if (err) {
    fatalError(`Failed to parse changelog: ${err}`);
  }

  const latest = result.versions[0];

  if (latest.version !== releasingVersion) {
    fatalError(
      `Changelog not ready for release. Expected latest version to be ${releasingVersion} but was ${
        latest.version
      }`
    );
  }

  console.log(result.versions[0].body);
});
