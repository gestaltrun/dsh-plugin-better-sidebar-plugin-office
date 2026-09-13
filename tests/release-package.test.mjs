import assert from 'node:assert/strict'
import test from 'node:test'
import manifest from '../package.json' with { type: 'json' }
import { assertPackage, assertPublishContext, parseInputs } from '../scripts/release-package.mjs'

test('fork identity and exact Sidebar peer pass the release guard', () => {
  assert.doesNotThrow(() => assertPackage(manifest))
})

test('development references are rejected from shipped dependency sections', () => {
  assert.throws(() => assertPackage({ ...manifest, dependencies: { renderer: 'link:../renderer' } }), /unpublished dependency/u)
})

test('React 18 compatible peers are required', () => {
  assert.throws(() => assertPackage({ ...manifest, peerDependencies: { ...manifest.peerDependencies, react: '18.2.0' } }), /React peer/u)
})

test('product packer inputs are explicit absolute paths', () => {
  assert.deepEqual(parseInputs(['--out', '/tmp/out', '--sidebar-tarball', '/tmp/sidebar.tgz']), { out: '/tmp/out', sidebar: '/tmp/sidebar.tgz' })
  assert.throws(() => parseInputs(['--out', 'out']), /Usage/u)
})

test('ordinary pushes cannot publish', () => {
  assert.throws(() => assertPublishContext(manifest, { GITHUB_REPOSITORY: 'gestaltrun/dsh-plugin-better-sidebar-plugin-office', GITHUB_EVENT_NAME: 'push' }), /release or opted-in/u)
})
