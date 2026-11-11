---
id: 01kitminimal00000000000003
title: Blog
status: published
position: 2
---

::: section {"props":{"width":"content"}}
# Blog

Notes, stories and useful ideas from this site.

:::: repeat {"label":"Posts","props":{"source":"entries","collection":"posts","sort":"-published_at","limit":12,"paginate":true,"tag":"div","empty":"No posts yet."},"style":{"base":{"display":"flex","flexDirection":"column","gap":"token:space.12"}}}
::::: box {"label":"Post","props":{"tag":"article"},"bind":{"link":"item.url"},"style":{"base":{"display":"flex","flexDirection":"column","gap":"token:space.2"}},"motion":[{"trigger":{"type":"appear"},"steps":[{"from":{"opacity":0,"y":16},"duration":0.6,"ease":"power3.out"}]}]}
:::::: paragraph {"props":{"tag":"time"},"bind":{"text":"item.date|date:M j, Y"},"style":{"base":{"fontSize":"token:text.sm","color":"token:color.muted"}}}
::::::
:::::: heading {"props":{"level":"3"},"bind":{"text":"item.title"}}
::::::
:::::: paragraph {"bind":{"text":"item.content|excerpt:180"},"style":{"base":{"color":"token:color.muted"}}}
::::::
:::::
::::
:::
