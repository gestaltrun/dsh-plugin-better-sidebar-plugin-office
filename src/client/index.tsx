/**
 * Client half of @gestaltrun/dsh-sidebar-office: registers
 * the three Office file viewers (docx / xlsx / pptx) through better-sidebar's
 * `ctx.betterSidebar.registerFileViewer`. The descriptors are identical in
 * shape to the built-ins they replace (same viewer ids, exts, mediaUrl
 * strategy, priority 0) so existing files route the same way, and the Side
 * card settings inventory shows them with their own title + icon.
 *
 * The heavy render libraries (docx-preview / Univer + SheetJS / pptx-renderer)
 * live in THIS bundle only, keeping better-sidebar's own client bundle small.
 */
import { createElement } from 'react'
import type { Context, FileViewerDescriptor } from '@gestaltrun/dsh-better-sidebar'
import { DocxView, XlsxView } from './office-view.tsx'
import { PptxView } from './PptxView.tsx'
import { IconDocxOutline16, IconPptxOutline16, IconXlsxOutline16 } from './icons.tsx'
import { NS, attachBetterLocale, attachLocale, en, t, zh } from './locales.ts'
import { dicts } from './dictionaries.ts'

/** The DSH LocaleRuntime face this plugin consumes (structural mirror; the
 *  `@deepseek-ai/dsh-client-locale` augmentation does not reach this bundle's
 *  cordis scope). */
type LocaleService = {
  getSnapshot(): { active: string }
  subscribe(fn: () => void): () => void
  register(ns: string, dicts: Record<string, Record<string, string>>): () => void
}

/** The better-locale override store face this plugin consumes (structural
 *  mirror of `BetterLocaleStore`; optional — absent when better-locale is
 *  not installed). */
type BetterLocaleStore = {
  getOverride(dshActive: string, ns: string, key: string): string | undefined
  register(ns: string, dicts: Record<string, Record<string, string>>): () => void
}

/** Services required before mounting: better-sidebar's client service + the
 *  DSH locale service (the viewer copy follows its active locale). */
export const inject = ['betterSidebar', 'locale']

/** The three Office viewer descriptors (id / exts match the former built-ins). */
export function officeViewers(): readonly FileViewerDescriptor[] {
  return [
    {
      id: 'docx',
      title: () => t('viewerDocx'),
      icon: (size: number) => createElement(IconDocxOutline16, { size }),
      exts: ['docx'],
      fetchStrategy: 'mediaUrl',
      component: ({ scope, path, title, mediaUrl }) => createElement(DocxView, { scope, path, title, mediaUrl }),
    },
    {
      id: 'xlsx',
      title: () => t('viewerXlsx'),
      icon: (size: number) => createElement(IconXlsxOutline16, { size }),
      exts: ['xlsx'],
      fetchStrategy: 'mediaUrl',
      component: ({ scope, path, title, mediaUrl }) => createElement(XlsxView, { scope, path, title, mediaUrl }),
    },
    {
      id: 'pptx',
      title: () => t('viewerPptx'),
      icon: (size: number) => createElement(IconPptxOutline16, { size }),
      exts: ['pptx'],
      fetchStrategy: 'mediaUrl',
      component: ({ scope, path, title, mediaUrl }) => createElement(PptxView, { scope, path, title, mediaUrl }),
    },
  ]
}

/**
 * Client plugin body.
 * @param ctx - the client cordis context (betterSidebar + locale services).
 */
export function apply(ctx: Context): void {
  // The viewer copy follows the DSH i18n system: attach the locale service
  // so the module-level t()/zh-en chain resolves the Host-backed language
  // preference, register the plugin's dictionaries into the shared locale
  // registry. The disposers run on fiber disposal, so re-activation (HMR)
  // re-registers cleanly.
  const locale = (ctx as unknown as { locale: LocaleService }).locale
  attachLocale(locale)
  ctx.effect(() => locale.register(NS, { zh, en }), 'dsh-sidebar-office: dictionaries')

  // Opt-in third-language support through @huanlin/dsh-plugin-better-locale.
  // When that plugin is installed, it publishes `ctx.betterLocale` (the
  // override store) and patches LocaleRuntime.lookup to consult it. The
  // office copy registers its override dictionaries (see dictionaries.ts)
  // with the store so the patched lookup — and this plugin's own t(),
  // which mirrors the override-aware chain — can render the selected
  // override language. Absent the store, the zh/en chain runs unchanged.
  // Activation-order-safe: re-check ctx.get('betterLocale') on every locale
  // revision bump (better-locale bumps on activation + override switch).
  ctx.effect(() => {
    let dispose: (() => void) | undefined
    const sync = (): void => {
      dispose?.()
      dispose = undefined
      const store = ctx.get('betterLocale') as BetterLocaleStore | undefined
      attachBetterLocale(store)
      if (store !== undefined) {
        dispose = store.register(NS, dicts)
      }
    }
    sync()
    const unsubscribe = locale.subscribe(sync)
    return () => {
      unsubscribe()
      dispose?.()
      attachBetterLocale(undefined)
    }
  }, 'dsh-sidebar-office: better-locale lazy integration')

  for (const viewer of officeViewers()) {
    ctx.effect(() => ctx.betterSidebar.registerFileViewer(viewer), `dsh-sidebar-office: viewer ${viewer.id}`)
  }
}
