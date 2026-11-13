import { getManifest as e, registry as t, run as n, t as r } from "@letterncms/sdk";
import { lazy as i } from "react";
t.components.set("globals/fields", i(() => import("./chunks/Blueprint-BCWhxDgK.js"))), t.widgets.set("globals", i(() => import("./chunks/WidgetGlobals-DxHTOC8G.js"))), t.composer.set("globals", {
	trigger: "@",
	label: r("Globals"),
	order: 30,
	search: (t) => e().globals.filter((e) => e.title.toLowerCase().includes(t.toLowerCase())).slice(0, 4).map((e) => ({
		id: `global:${e.handle}`,
		kind: "global",
		label: e.title,
		icon: e.icon,
		to: `/globals/${e.handle}`,
		read: () => n("globals/get", { handle: e.handle })
	}))
});
