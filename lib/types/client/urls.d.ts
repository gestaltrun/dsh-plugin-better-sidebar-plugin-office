/**
 * Office-preview URL helpers for the better-sidebar `/sidebar/file` media
 * route. The better-sidebar host serves raw bytes for any path under the
 * session cwd; these builders mirror the route's contract so the viewer
 * components fetch exactly what the built-in previewers used to.
 */
/** One request's session scope (mirror of better-sidebar's SessionScope). */
export interface SessionScope {
    sessionId: string;
    /** The session's working directory from the client list summary (optional). */
    cwd?: string;
}
/** Absolute URL of the local or paired-remote download route. */
export declare function downloadUrl(scope: SessionScope, path: string, href?: string): string;
