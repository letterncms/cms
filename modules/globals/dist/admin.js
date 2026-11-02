import { getManifest as e, prefetchAbility as t, registry as n, run as r, t as i } from "@letterncms/sdk";
import { lazy as a } from "react";
n.routes.set("/globals", {
	path: "/globals",
	component: a(() => import("./chunks/Globals-BoXgqeni.js").then((e) => ({ default: e.GlobalsList })))
}), n.routes.set("/globals/:handle", {
	path: "/globals/:handle",
	component: a(() => import("./chunks/Globals-BoXgqeni.js").then((e) => ({ default: e.GlobalEditor }))),
	load: ({ handle: n }) => t("globals/get", {
		handle: n,
		locale: e().site.defaultLocale
	})
}), n.routes.set("/globals/:handle/fields", {
	path: "/globals/:handle/fields",
	component: a(() => import("./chunks/Blueprint-CaUS2iEH.js")),
	load: ({ handle: e }) => t("globals/get", { handle: e })
}), n.widgets.set("globals-sets", a(() => import("./chunks/WidgetGlobals-BAgIQviS.js"))), n.composer.set("globals", {
	id: "globals",
	trigger: "@",
	label: i("Globals"),
	order: 30,
	search: (t) => e().globals.filter((e) => e.title.toLowerCase().includes(t.toLowerCase())).slice(0, 4).map((e) => ({
		id: `global:${e.handle}`,
		kind: "global",
		label: e.title,
		icon: e.icon,
		to: `/globals/${e.handle}`,
		read: () => r("globals/get", { handle: e.handle })
	}))
});
