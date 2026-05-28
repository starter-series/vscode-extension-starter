/**
 * Regression guard for the `overrides` block in package.json.
 *
 * Background — second-pass code review (2026-05-27) found that a blanket
 *   "brace-expansion": "^5.0.5"
 * override forced minimatch@3.1.5 (a transitive dep of @vscode/vsce and of
 * jest's test-exclude chain via babel-plugin-istanbul → glob@7) to load
 * brace-expansion@5. brace-expansion@5 ships CJS named-only exports
 * ({ expand, EXPANSION_MAX }), but minimatch@3's source does
 *   var expand = require('brace-expansion');  // expects a callable default
 *   ...
 *   return expand(pattern);
 * so any glob containing braces — e.g. `{a,b}`, `.vscodeignore` patterns
 * like `**\/{spec,test}/*.test.js`, or jest testMatch with brace alternates
 * — throws `TypeError: expand is not a function` deep inside vsce package /
 * jest coverage walking.
 *
 * The current scoped override (`brace-expansion@^5` → ^5.0.6,
 * `brace-expansion@^2` → ^2.0.4) leaves minimatch@3 on its native v1 chain.
 *
 * These tests pin that contract. If anyone collapses the override back to a
 * blanket `"brace-expansion": "^5"`, the second test crashes the suite with
 * the same TypeError the original audit caught.
 */
const path = require('path');

describe('overrides regression — minimatch ↔ brace-expansion contract', () => {
  // We deliberately do NOT assert what `require("brace-expansion")` returns at
  // the project root — npm's hoist order is not a contract and shifts between
  // installs. What matters is that minimatch@3 (the consumer that would crash
  // under a blanket override) sees a callable brace-expansion in *its own*
  // resolution path, which the test below proves end-to-end.

  test('minimatch@3 (vsce + test-exclude dep) handles brace patterns without throwing', () => {
    // Hard-pin to the v3 copy that @vscode/vsce loads. If npm later hoists
    // a different minimatch into the top-level slot, update this path.
    const mmPath = path.join(__dirname, '..', 'node_modules', 'minimatch', 'minimatch.js');
    const minimatch = require(mmPath);

    // Sanity: no-brace pattern.
    expect(minimatch('foo.test.js', '**/*.test.js')).toBe(true);

    // The crash case — `{a,b}` walks through brace-expansion as a function call.
    expect(() => minimatch('a', '{a,b}')).not.toThrow();
    expect(minimatch('a', '{a,b}')).toBe(true);
    expect(minimatch('b', '{a,b}')).toBe(true);
    expect(minimatch('c', '{a,b}')).toBe(false);

    // Realistic .vscodeignore-style pattern with braces.
    expect(() => minimatch('src/foo.spec.js', '**/{spec,test}/*.js')).not.toThrow();
  });

  test('package.json overrides keep brace-expansion scoped by major', () => {
    // Belt-and-suspenders: if someone removes the version selectors, this
    // test surfaces the misconfiguration before it manifests as a TypeError
    // deep inside vsce/jest internals.
    const pkg = require('../package.json');
    expect(pkg.overrides).toBeDefined();
    const beKey = Object.keys(pkg.overrides).find((k) => k.startsWith('brace-expansion'));
    expect(beKey).toBeDefined();
    // A blanket "brace-expansion" key would force the v1 chain to v5 and
    // re-introduce the contract break.
    expect(beKey).toMatch(/^brace-expansion@/);
  });
});
