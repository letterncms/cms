import { getManifest as e, prefetchAbility as t, registry as n } from "@letterncms/sdk";
import { lazy as r } from "react";
n.routes.set("/settings", {
	path: "/settings",
	component: r(() => import("./chunks/Settings-M4Ru4KyM.js"))
}), n.routes.set("/settings/:namespace", {
	path: "/settings/:namespace",
	component: r(() => import("./chunks/Settings-M4Ru4KyM.js")),
	load: async (n) => {
		let r = n.namespace, i = e().settings.find((e) => e.namespace === r);
		i && !i.home && await t("settings/get", { namespace: r });
	}
}), n.panels.set("settings-form", {
	id: "settings-form",
	slot: "screen.settings",
	component: r(() => import("./chunks/Settings-M4Ru4KyM.js").then((e) => ({ default: e.SettingsForm })))
}), n.widgets.set("settings-setup", r(() => import("./chunks/WidgetSetup-YiyGMRPU.js")));
