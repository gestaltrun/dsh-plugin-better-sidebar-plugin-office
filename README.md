# @gestaltrun/dsh-sidebar-office

Read-only DOCX, XLSX, and PPTX viewers for `@gestaltrun/dsh-better-sidebar`. The package registers three file viewers through the public `betterSidebar.registerFileViewer` service. It does not edit Office documents.

The client artifact includes docx-preview, Univer, SheetJS, pptx-renderer, and their styles. A packaged Desktop can render these formats without resolving those libraries from a developer checkout or downloading viewer assets at runtime.

## Compatibility

- DSH `0.1.5-rc.2`
- `@gestaltrun/dsh-better-sidebar@0.19.1-gestaltrun.0`
- one shared `@deepseek-ai/cordis` instance supplied by the profile
- Node `^22.19.0 || >=24.0.0` for the host stub and build tooling

Install the package as a profile bundle. Its `cordis.patch.yml` inserts the host row, and its client manifest orders the viewer after the DSH locale service and Better Sidebar. The package adds no Agent tools or preset entries.

```sh
dsh plugin --profile desktop add @gestaltrun/dsh-sidebar-office@0.1.3-gestaltrun.0
```

## Source and license

This fork retains the AGPL-3.0 license and originates from `HuanLinOTO/dsh-plugin-better-sidebar-plugin-office@fbafdc6f8b1bb55a95fdd66f3f7ad9974b8aea75`. Gestaltrun changes update the public DSH/Sidebar interfaces, remove development links, package the renderers offline, and add reproducible candidate packaging.

Browser support still decides which presentation details each rendering library can reproduce. Encrypted or unsupported documents fall back to a download link.
