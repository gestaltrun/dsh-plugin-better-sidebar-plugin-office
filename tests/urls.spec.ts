import { describe, expect, it } from 'vitest'
import { downloadUrl } from '../src/client/urls.ts'

const scope = { sessionId: 'session-1', cwd: '/workspace' }

describe('downloadUrl', () => {
  it('uses the local route on Desktop and loopback Web', () => {
    expect(downloadUrl(scope, '/workspace/a.docx', 'dsh-app://app/')).toMatch(/^\/sidebar\/file\?/u)
    expect(downloadUrl(scope, '/workspace/a.docx', 'http://127.0.0.1:3000/')).toMatch(/^\/sidebar\/file\?/u)
  })

  it('uses the paired channel on a remote Web origin', () => {
    expect(downloadUrl(scope, '/workspace/a.docx', 'https://desktop.example/')).toMatch(/^\/remote\/sidebar\/file\?/u)
  })
})
