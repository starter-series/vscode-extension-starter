const { bump } = require('../scripts/bump-version');

/**
 * Adversarial second-pass found that the original bumper produced silent
 * data corruption on prerelease versions:
 *   "1.2.3-rc.1" + patch => "1.2.NaN.1"
 * These tests pin the new contract — validate + fail-loud + drop prerelease
 * and build metadata on bump (matches `npm version` semantics).
 */
describe('bump', () => {
  describe('standard core bumps', () => {
    test('patch: 1.2.3 -> 1.2.4', () => {
      expect(bump('1.2.3', 'patch')).toBe('1.2.4');
    });
    test('minor: 1.2.3 -> 1.3.0', () => {
      expect(bump('1.2.3', 'minor')).toBe('1.3.0');
    });
    test('major: 1.2.3 -> 2.0.0', () => {
      expect(bump('1.2.3', 'major')).toBe('2.0.0');
    });
    test('major resets minor and patch', () => {
      expect(bump('1.5.9', 'major')).toBe('2.0.0');
    });
    test('minor resets patch', () => {
      expect(bump('1.5.9', 'minor')).toBe('1.6.0');
    });
    test('handles zero-prefixed base: 0.1.0 -> 0.1.1', () => {
      expect(bump('0.1.0', 'patch')).toBe('0.1.1');
    });
  });

  describe('prerelease / build metadata (dropped on bump, npm version semantics)', () => {
    test('patch drops prerelease: 1.2.3-rc.1 -> 1.2.4', () => {
      expect(bump('1.2.3-rc.1', 'patch')).toBe('1.2.4');
    });
    test('minor drops build metadata: 1.2.3+build.5 -> 1.3.0', () => {
      expect(bump('1.2.3+build.5', 'minor')).toBe('1.3.0');
    });
    test('major drops both prerelease and build metadata: 1.2.3-rc.1+build.5 -> 2.0.0', () => {
      expect(bump('1.2.3-rc.1+build.5', 'major')).toBe('2.0.0');
    });
    test('prerelease with dotted segments: 1.2.3-alpha.0.beta -> 1.2.4', () => {
      expect(bump('1.2.3-alpha.0.beta', 'patch')).toBe('1.2.4');
    });
  });

  describe('invalid input — fail loud, never silent NaN', () => {
    test('rejects empty version string', () => {
      expect(() => bump('', 'patch')).toThrow(/Invalid semver/);
    });
    test('rejects missing patch component', () => {
      expect(() => bump('1.2', 'patch')).toThrow(/Invalid semver/);
    });
    test('rejects leading-v version', () => {
      expect(() => bump('v1.2.3', 'patch')).toThrow(/Invalid semver/);
    });
    test('rejects non-numeric core', () => {
      expect(() => bump('1.x.3', 'patch')).toThrow(/Invalid semver/);
    });
    test('rejects garbage', () => {
      expect(() => bump('not a version', 'patch')).toThrow(/Invalid semver/);
    });
    test('rejects unknown bump type', () => {
      expect(() => bump('1.2.3', 'huge')).toThrow(/Invalid bump type/);
    });
    test('rejects empty bump type', () => {
      expect(() => bump('1.2.3', '')).toThrow(/Invalid bump type/);
    });
  });
});
