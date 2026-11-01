import { getManifest as e, prefetchAbility as t, registry as n } from "@letterncms/sdk";
import { lazy as r } from "react";
n.routes.set("/globals", {
	path: "/globals",
	component: r(() => import("./chunks/Globals-BoXgqeni.js").then((e) => ({ default: e.GlobalsList })))
}), n.routes.set("/globals/:handle", {
	path: "/globals/:handle",
	component: r(() => import("./chunks/Globals-BoXgqeni.js").then((e) => ({ default: e.GlobalEditor }))),
	load: ({ handle: n }) => t("globals/get", {
		handle: n,
		locale: e().site.defaultLocale
	})
}), n.routes.set("/globals/:handle/fields", {
	path: "/globals/:handle/fields",
	component: r(() => import("./chunks/Blueprint-CaUS2iEH.js")),
	load: ({ handle: e }) => t("globals/get", { handle: e })
}), n.widgets.set("globals-sets", r(() => import("./chunks/WidgetGlobals-BAgIQviS.js")));
