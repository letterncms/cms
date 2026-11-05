---
id: 01m5x7ty7mtr92dn0arwwwc1z6
title: Footer
status: published
position: 0
synced: true
category: Components
description: 'Site name, footer menu and tagline.'
---

::: box {"id":"ftr","props":{"tag":"footer"},"label":"Footer","style":{"base":{"marginTop":"3xl","borderTopWidth":"1","borderStyle":"solid","borderColor":"border"}}}
:::: box {"id":"ftr-inner","style":{"base":{"width":"full","maxWidth":"content","marginInline":"auto","paddingInline":"gutter","display":"flex","flexWrap":"wrap","alignItems":"center","justifyContent":"between","gap":"sm","paddingBlock":"xl","fontSize":"sm","color":"foreground-muted"}}}
::::: paragraph {"id":"ftr-copy","bind":{"text":"© {site.year} {site.name}"}}
:::::

::::: repeat {"id":"ftr-nav","props":{"source":"menu","menu":"footer","tag":"ul"},"label":"Footer menu","style":{"base":{"display":"flex","flexWrap":"wrap","gap":"md"}}}
:::::: box {"id":"ftr-item","props":{"tag":"li"}}
::::::: link {"id":"ftr-link","style":{"hover":{"color":"foreground"}},"bind":{"label":"item.label","url":"item.url"}}
:::::::
::::::
:::::

::::: paragraph {"id":"ftr-tagline","bind":{"text":"globals.footer.tagline","visible":"globals.footer.tagline"}}
:::::
::::
:::
