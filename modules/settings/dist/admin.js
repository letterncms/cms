import { getManifest as e, prefetchAbility as t, registry as n } from "@letterncms/sdk";
import { lazy as r } from "react";
n.routes.set("/settings", {
	path: "/settings",
	component: r(() => import("./chunks/Settings-B4hsv07E.js"))
}), n.routes.set("/settings/:namespace", {
	path: "/settings/:namespace",
	component: r(() => import("./chunks/Settings-B4hsv07E.js")),
	load: async (n) => {
		let r = n.namespace;
		e().settings.some((e) => e.namespace === r) && await t("settings/get", { namespace: r });
	}
}), n.fields.set("sidebar-default", r(() => import("./chunks/SidebarDefault-NsV7OywB.js").then((e) => ({ default: e.SidebarDefault })))), n.widgets.set("settings-setup", r(() => import("./chunks/WidgetSetup-YiyGMRPU.js")));
