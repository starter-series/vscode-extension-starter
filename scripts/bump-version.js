const fs = require('fs');

/**
 * Strict semver-core regex with optional prerelease and build metadata.
 * Matches semver.org §2 / §9 / §10 — but only the core groups are bumped.
 *
 * Behaviour on bump (matches `npm version` semantics):
 *   - patch/minor/major drop the prerelease and build metadata.
 *   - We do not implement `npm version prerelease` — out of scope for a
 *     vanilla starter; users who want prerelease iteration should edit
 *     package.json by hand or move to `npm version` directly.
 *
 * Why this validator exists:
 *   The previous bumper did `version.split('.').map(Number)`, which silently
 *   produced strings like "1.2.NaN.1" when given prerelease versions
 *   (e.g. "1.2.3-rc.1"). package.json would then be left in an invalid
 *   semver state with no error surfaced.
 */
const SEMVER = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+([0-9A-Za-z.-]+))?$/;
const VALID_TYPES = ['major', 'minor', 'patch'];

/**
 * Pure semver bumper. Exported so tests can exercise edge cases without
 * spawning a child process or touching the filesystem.
 *
 * @param {string} version - current semver, e.g. "1.2.3" or "1.2.3-rc.1+build.5"
 * @param {'major'|'minor'|'patch'} type - bump kind
 * @returns {string} bumped semver core (prerelease + build metadata dropped)
 * @throws {Error} if type or version is invalid
 */
function bump(version, type) {
  if (!VALID_TYPES.includes(type)) {
    throw new Error(`Invalid bump type: "${type}". Use one of: ${VALID_TYPES.join('|')}.`);
  }
  const m = SEMVER.exec(version);
  if (!m) {
    throw new Error(
      `Invalid semver in package.json: "${version}". ` +
        `Bumper expects MAJOR.MINOR.PATCH[-prerelease][+build].`
    );
  }
  let maj = Number(m[1]);
  let min = Number(m[2]);
  let pat = Number(m[3]);
  if (type === 'major') { maj++; min = 0; pat = 0; }
  else if (type === 'minor') { min++; pat = 0; }
  else { pat++; }
  return `${maj}.${min}.${pat}`;
}

/* istanbul ignore next: CLI shim — tested via the exported pure `bump()` */
function main() {
  const type = process.argv[2] || 'patch';
  const pkgPath = 'package.json';
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  try {
    pkg.version = bump(pkg.version, type);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  console.log(pkg.version);
}

/* istanbul ignore if: only true when invoked as a script */
if (require.main === module) {
  main();
}

module.exports = { bump };
