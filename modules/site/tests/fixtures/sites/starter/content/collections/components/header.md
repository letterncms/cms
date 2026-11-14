---
id: 01m5x7tz7b6n961bpt19rdef1k
title: Header
status: published
position: 1
synced: true
category: Components
description: 'Site name, main menu, sign in or your account once the site has public accounts, and a menu button on phones.'
---

::: box {"id":"hdr","props":{"tag":"header"},"label":"Header","class":"sticky top-0 z-40 border-b border-transparent bg-background/85 backdrop-blur-[14px] backdrop-saturate-160 transition-[border-color,background-color] duration-200 ease-[ease]","logic":{"data":{"open":false},"on":[{"event":"keydown","mods":["window"],"key":"escape","actions":[{"do":"set","var":"open","value":"false"}]}],"states":{"open":"open"},"behaviors":{"scroll":{"threshold":8,"hide":false}}}}
:::: box {"id":"hdr-bar","label":"Bar","class":"mx-auto flex h-16 w-full max-w-content items-center gap-8 px-gutter"}
::::: link {"id":"hdr-logo","props":{"url":"/"},"label":"Logo","class":"text-[1.0625rem] font-semibold tracking-tight","bind":{"label":"site.name"}}
:::::

::::: box {"id":"hdr-nav","props":{"tag":"nav"},"label":"Main menu","class":"ml-auto max-md:hidden","attrs":{"aria-label":"Main"}}
:::::: repeat {"id":"hdr-links","props":{"source":"menu","menu":"main","tag":"ul"},"class":"flex items-center gap-6 text-sm"}
::::::: box {"id":"hdr-item","props":{"tag":"li"}}
:::::::: link {"id":"hdr-link","class":"text-muted transition-colors duration-150 ease-[ease] hover:text-foreground data-active:font-medium data-active:text-foreground","bind":{"label":"item.label","url":"item.url","state:active":"item.active"}}
::::::::
:::::::
::::::
:::::

::::: box {"id":"hdr-account","label":"Account","class":"flex items-center max-md:hidden","bind":{"visible":"accounts"}}
:::::: link {"id":"hdr-sign-in","class":"text-sm text-muted transition-colors duration-150 ease-[ease] hover:text-foreground","bind":{"label":"accounts.sign_in.label","url":"accounts.sign_in.url","hidden":"account"}}
::::::

:::::: link {"id":"hdr-my-account","class":"text-sm text-muted transition-colors duration-150 ease-[ease] hover:text-foreground","bind":{"label":"accounts.account.label","url":"accounts.account.url","visible":"account"}}
::::::
:::::

::::: box {"id":"hdr-toggle","props":{"tag":"button"},"label":"Menu button","class":"ml-auto hidden size-10 place-items-center rounded-md hover:bg-surface max-md:grid","attrs":{"aria-label":"Menu"},"logic":{"on":[{"event":"click","actions":[{"do":"toggle","var":"open"},{"do":"if","test":"open","then":[{"do":"play","node":"hdr-panel-links","motion":"open","mode":"restart"}],"else":[]}]}],"attrs":{"aria-expanded":"open"}}}
:::::: icon {"id":"hdr-icon-open","props":{"icon":"list"},"class":"size-[22px]","logic":{"show":"!open"}}
::::::

:::::: icon {"id":"hdr-icon-close","props":{"icon":"x"},"class":"size-[22px]","logic":{"show":"open"}}
::::::
:::::
::::

:::: box {"id":"hdr-panel","props":{"tag":"nav"},"label":"Phone menu","class":"hidden max-md:block max-md:border-t max-md:border-border","attrs":{"aria-label":"Main"},"logic":{"show":"open","transition":"collapse"}}
::::: repeat {"id":"hdr-panel-links","props":{"source":"menu","menu":"main","tag":"ul"},"class":"mx-auto w-full max-w-content px-gutter py-4","motion":[{"id":"open","trigger":{"type":"event"},"steps":[{"target":"children","from":{"opacity":0,"y":10},"duration":0.4,"ease":"power3.out","stagger":0.04}]}]}
:::::: box {"id":"hdr-panel-item","props":{"tag":"li"}}
::::::: link {"id":"hdr-panel-link","class":"block py-3 text-lg","bind":{"label":"item.label","url":"item.url"}}
:::::::
::::::
:::::

::::: box {"id":"hdr-panel-account","label":"Account","class":"mx-auto w-full max-w-content px-gutter pb-4","bind":{"visible":"accounts"}}
:::::: link {"id":"hdr-panel-sign-in","class":"block py-3 text-lg","bind":{"label":"accounts.sign_in.label","url":"accounts.sign_in.url","hidden":"account"}}
::::::

:::::: link {"id":"hdr-panel-my-account","class":"block py-3 text-lg","bind":{"label":"accounts.account.label","url":"accounts.account.url","visible":"account"}}
::::::
:::::
::::
:::
