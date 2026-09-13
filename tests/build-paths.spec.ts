import { describe, expect, it } from 'vitest'
import { resolve } from 'node:path'
import { cssBuildId } from '../tsdown.config.ts'

describe('CSS build ids', () => {
  it('use package-relative POSIX paths', () => {
    expect(cssBuildId(resolve('src/client/office.module.css'))).toBe('src/client/office.module.css')
  })

  it('remove checkout paths from external dependency styles', () => {
    expect(cssBuildId('/private/tmp/dependency/node_modules/@example/viewer/index.css')).toBe('node_modules/@example/viewer/index.css')
    expect(cssBuildId('C:\\build root\\node_modules\\@example\\viewer\\index.css')).toBe('node_modules/@example/viewer/index.css')
  })
})
