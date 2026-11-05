---
id: 01m5x7tz7b6n961bpt19rdef1k
title: Header
status: published
position: 1
synced: true
category: Components
description: 'Site name, main menu, sign in or your account once the site has public accounts, and a menu button on phones.'
---

::: box {"id":"hdr","props":{"tag":"header"},"label":"Header","style":{"base":{"position":"sticky","top":"0","zIndex":"sticky","backgroundColor":"background/80","backdropSaturate":"150","backdropBlur":"lg","borderBottomWidth":"1","borderStyle":"solid","borderColor":"transparent","transitionProperty":"colors","transitionDuration":"fast","transitionTimingFunction":"out"}},"logic":{"data":{"open":false},"on":[{"event":"keydown","mods":["window"],"key":"escape","actions":[{"do":"set","var":"open","value":"false"}]}],"states":{"open":"open"},"behaviors":{"scroll":{"threshold":8,"hide":false}}}}
:::: box {"id":"hdr-bar","label":"Bar","style":{"base":{"width":"full","maxWidth":"content","marginInline":"auto","paddingInline":"gutter","display":"flex","alignItems":"center","gap":"lg","height":"2xl"}}}
::::: link {"id":"hdr-logo","props":{"url":"/"},"label":"Logo","style":{"base":{"fontWeight":"semibold","letterSpacing":"tight","fontSize":"base"}},"bind":{"label":"site.name"}}
:::::

::::: box {"id":"hdr-nav","props":{"tag":"nav"},"label":"Main menu","style":{"base":{"marginLeft":"auto"},"max-md":{"display":"none"}},"attrs":{"aria-label":"Main"}}
:::::: repeat {"id":"hdr-links","props":{"source":"menu","menu":"main","tag":"ul"},"style":{"base":{"display":"flex","alignItems":"center","gap":"md","fontSize":"sm"}}}
::::::: box {"id":"hdr-item","props":{"tag":"li"}}
:::::::: link {"id":"hdr-link","style":{"base":{"color":"foreground-muted","transitionProperty":"colors","transitionDuration":"faster","transitionTimingFunction":"out"},"hover":{"color":"foreground"},"is-active":{"color":"foreground","fontWeight":"medium"}},"bind":{"label":"item.label","url":"item.url","state:active":"item.active"}}
::::::::
:::::::
::::::
:::::

::::: box {"id":"hdr-account","label":"Account","style":{"base":{"display":"flex","alignItems":"center"},"max-md":{"display":"none"}},"bind":{"visible":"accounts"}}
:::::: link {"id":"hdr-sign-in","style":{"base":{"color":"foreground-muted","fontSize":"sm","transitionProperty":"colors","transitionDuration":"faster","transitionTimingFunction":"out"},"hover":{"color":"foreground"}},"bind":{"label":"accounts.sign_in.label","url":"accounts.sign_in.url","hidden":"account"}}
::::::

:::::: link {"id":"hdr-my-account","style":{"base":{"color":"foreground-muted","fontSize":"sm","transitionProperty":"colors","transitionDuration":"faster","transitionTimingFunction":"out"},"hover":{"color":"foreground"}},"bind":{"label":"accounts.account.label","url":"accounts.account.url","visible":"account"}}
::::::
:::::

::::: box {"id":"hdr-toggle","props":{"tag":"button"},"label":"Menu button","style":{"base":{"display":"none","marginLeft":"auto","width":"xl","height":"xl","placeItems":"center","borderRadius":"md"},"max-md":{"display":"grid"},"hover":{"backgroundColor":"background-muted"}},"attrs":{"aria-label":"Menu"},"logic":{"on":[{"event":"click","actions":[{"do":"toggle","var":"open"},{"do":"if","test":"open","then":[{"do":"play","node":"hdr-panel-links","motion":"open","mode":"restart"}],"else":[]}]}],"attrs":{"aria-expanded":"open"}}}
:::::: icon {"id":"hdr-icon-open","props":{"icon":"list"},"style":{"base":{"width":"md","height":"md"}},"logic":{"show":"!open"}}
::::::

:::::: icon {"id":"hdr-icon-close","props":{"icon":"x"},"style":{"base":{"width":"md","height":"md"}},"logic":{"show":"open"}}
::::::
:::::
::::

:::: box {"id":"hdr-panel","props":{"tag":"nav"},"label":"Phone menu","style":{"base":{"display":"none"},"max-md":{"display":"block","borderTopWidth":"1","borderStyle":"solid","borderColor":"border"}},"attrs":{"aria-label":"Main"},"logic":{"show":"open","transition":"collapse"}}
::::: repeat {"id":"hdr-panel-links","props":{"source":"menu","menu":"main","tag":"ul"},"style":{"base":{"width":"full","maxWidth":"content","marginInline":"auto","paddingInline":"gutter","paddingBlock":"sm"}},"motion":[{"id":"open","trigger":{"type":"event"},"steps":[{"target":"children","from":{"opacity":"0","y":"xs"},"duration":"slow","ease":"out","stagger":"fastest"}]}]}
:::::: box {"id":"hdr-panel-item","props":{"tag":"li"}}
::::::: link {"id":"hdr-panel-link","style":{"base":{"display":"block","paddingBlock":"xs","fontSize":"base"}},"bind":{"label":"item.label","url":"item.url"}}
:::::::
::::::
:::::

::::: box {"id":"hdr-panel-account","label":"Account","style":{"base":{"width":"full","maxWidth":"content","marginInline":"auto","paddingInline":"gutter","paddingBottom":"sm"}},"bind":{"visible":"accounts"}}
:::::: link {"id":"hdr-panel-sign-in","style":{"base":{"display":"block","paddingBlock":"xs","fontSize":"base"}},"bind":{"label":"accounts.sign_in.label","url":"accounts.sign_in.url","hidden":"account"}}
::::::

:::::: link {"id":"hdr-panel-my-account","style":{"base":{"display":"block","paddingBlock":"xs","fontSize":"base"}},"bind":{"label":"accounts.account.label","url":"accounts.account.url","visible":"account"}}
::::::
:::::
::::
:::
