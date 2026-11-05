---
id: 01m5x7tx4c1h9c7js9rt8ke54y
title: Article
status: published
position: 3
description: 'A narrow article with date, title, body and tags.'
collections:
  - posts
---

::: pattern {"id":"p-header","props":{"ref":"header"}}
:::

::: box {"id":"p-main","props":{"tag":"main"},"label":"Article","style":{"base":{"maxWidth":"text","marginInline":"auto","paddingInline":"gutter","paddingBlock":"section"}},"anchor":"main"}
:::: box {"id":"p-head","props":{"tag":"header"},"style":{"base":{"display":"flex","flexDirection":"column","gap":"sm","marginBottom":"xl"}}}
::::: paragraph {"id":"p-date","props":{"tag":"time"},"style":{"base":{"fontSize":"sm","color":"foreground-muted"}},"bind":{"text":"entry.date|date:F j, Y"}}
:::::

::::: heading {"id":"p-title","props":{"level":"1"},"bind":{"text":"entry.title"}}
:::::

::::

:::: outlet {"id":"p-body","props":{"wrap":true},"style":{"base":{"flow":"prose"}}}
::::

:::: repeat {"id":"p-tags","props":{"source":"list","path":"entry.tags","tag":"ul"},"style":{"base":{"display":"flex","flexWrap":"wrap","gap":"xs","marginTop":"xl"}}}
::::: paragraph {"id":"p-tag","props":{"tag":"li"},"style":{"base":{"paddingInline":"xs","paddingBlock":"2xs","borderRadius":"full","backgroundColor":"background-muted","fontSize":"sm","color":"foreground-muted"}},"bind":{"text":"{item}"}}
:::::
::::
:::

::: pattern {"id":"p-footer","props":{"ref":"footer"}}
:::
