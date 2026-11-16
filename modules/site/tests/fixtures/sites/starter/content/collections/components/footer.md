---
id: 01m5x7ty7mtr92dn0arwwwc1z6
title: Footer
status: published
position: 0
synced: true
category: Components
description: 'Site name, footer menu and tagline.'
---

::: box {"id":"ftr","props":{"tag":"footer"},"label":"Footer","class":"mt-24 border-t border-border"}
:::: box {"id":"ftr-inner","class":"mx-auto flex w-full max-w-content flex-wrap items-center justify-between gap-4 px-gutter py-12 text-sm text-muted"}
::::: paragraph {"id":"ftr-copy","bind":{"text":"© {site.year} {site.name}"}}
:::::

::::: repeat {"id":"ftr-nav","props":{"source":"menu","menu":"footer","tag":"ul"},"label":"Footer menu","class":"flex flex-wrap gap-6"}
:::::: box {"id":"ftr-item","props":{"tag":"li"}}
::::::: link {"id":"ftr-link","class":"hover:text-foreground","bind":{"label":"item.label","url":"item.url"}}
:::::::
::::::
:::::

::::: paragraph {"id":"ftr-tagline","bind":{"text":"globals.site.tagline","visible":"globals.site.tagline"}}
:::::
::::
:::
