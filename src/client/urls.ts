/**
 * Office-preview URL helpers for the better-sidebar `/sidebar/file` media
 * route. The better-sidebar host serves raw bytes for any path under the
 * session cwd; these builders mirror the route's contract so the viewer
 * components fetch exactly what the built-in previewers used to.
 */

/** One request's session scope (mirror of better-sidebar's SessionScope). */
export interface SessionScope {
  sessionId: string
  /** The session's working directory from the client list summary (optional). */
  cwd?: string
}

function isLoopback(hostname: string): boolean {
  if (hostname === 'localhost' || hostname === '::1' || hostname === '[::1]') return true
  const parts = hostname.split('.')
  return parts.length === 4 && parts[0] === '127' && parts.every(part => /^\d{1,3}$/u.test(part) && Number(part) <= 255)
}

function downloadRoute(href: string): string {
  const page = new URL(href)
  if ((page.protocol === 'http:' || page.protocol === 'https:') && !isLoopback(page.hostname)) return '/remote/sidebar/file'
  return '/sidebar/file'
}

/** Absolute URL of the local or paired-remote download route. */
export function downloadUrl(
  scope: SessionScope,
  path: string,
  href = typeof window === 'undefined' ? 'http://127.0.0.1/' : window.location.href,
): string {
  return fileUrl(scope, path, true, href)
}

/** Shared URL builder for the /sidebar/file route (media vs download). */
function fileUrl(scope: SessionScope, path: string, download: boolean, href: string): string {
  const params = new URLSearchParams({ sessionId: scope.sessionId, path })
  if (scope.cwd !== undefined && scope.cwd !== '') params.set('cwd', scope.cwd)
  if (download) params.set('download', '1')
  return `${downloadRoute(href)}?${params.toString()}`
}
