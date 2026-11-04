import { registry as e } from "@letterncms/sdk";
import { lazy as t } from "react";
e.routes.set("/settings", {
	path: "/settings",
	component: t(() => import("./chunks/Settings-ukUp8jkq.js"))
}), e.panels.set("settings-form", {
	id: "settings-form",
	slot: "screen.settings",
	component: t(() => import("./chunks/Settings-ukUp8jkq.js").then((e) => ({ default: e.SettingsForm })))
}), e.widgets.set("settings-setup", t(() => import("./chunks/WidgetSetup-DPcKzHIQ.js")));
