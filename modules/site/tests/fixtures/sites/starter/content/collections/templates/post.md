---
id: 01m5x7tx4c1h9c7js9rt8ke54y
title: Article
status: published
position: 3
description: 'A narrow article with date, title, body and tags.'
collections:
  - posts
---

::: component {"id":"p-header","props":{"ref":"header"}}
:::

::: box {"id":"p-main","props":{"tag":"main"},"label":"Article","class":"mx-auto max-w-(--container-prose) px-gutter py-section","anchor":"main"}
:::: box {"id":"p-head","props":{"tag":"header"},"class":"mb-12 flex flex-col gap-4"}
::::: paragraph {"id":"p-date","props":{"tag":"time"},"class":"text-sm text-muted","bind":{"text":"entry.date|date:F j, Y"}}
:::::

::::: heading {"id":"p-title","props":{"level":"1"},"bind":{"text":"entry.title"}}
:::::

::::

:::: outlet {"id":"p-body","props":{"wrap":true,"prose":true}}
::::

:::: repeat {"id":"p-tags","props":{"source":"list","path":"entry.tags","tag":"ul"},"class":"mt-12 flex flex-wrap gap-2"}
::::: paragraph {"id":"p-tag","props":{"tag":"li"},"class":"rounded-full bg-surface px-3 py-1 text-sm text-muted","bind":{"text":"{item}"}}
:::::
::::
:::

::: component {"id":"p-footer","props":{"ref":"footer"}}
:::
