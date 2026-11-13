import { r as e } from "./chunks/installing-CCPtKzo4.js";
import { prefetchAbility as t, registry as n, run as r, t as i, useConfig as a } from "@letterncms/sdk";
import { lazy as o, useEffect as s } from "react";
import { Banner as c } from "@letterncms/ui";
import { jsx as l } from "react/jsx-runtime";
// admin/src/UpdateRunner.tsx
var u = !1;
async function d() {
	if (!u) {
		u = !0;
		try {
			for (let t = 0; t < 100; t++) {
				let t = await r("packages/update-tick");
				if (t.drive && await e(), !t.more) break;
			}
		} catch {} finally {
			u = !1;
		}
	}
}
function f() {
	let e = a("packages");
	s(() => {
		e.tick && d();
	}, [e.tick]);
	let t = e.state === "rolled_back" ? i("An update failed its own checks, so this site went back. Your content is safe.") : e.yanked ? i("This version was withdrawn: {reason}", { reason: e.yanked }) : e.supportEnded ? i("This major version stopped getting security fixes in {date}.", { date: e.supportEnded }) : e.advisories?.length ? i("A security advisory covers: {list}.", { list: e.advisories.join(", ") }) : e.security ? i("A security update is ready: {version}.", { version: e.security }) : null;
	return t ? /* @__PURE__ */ l(c, {
		action: {
			to: "/plugins?tab=updates",
			label: i("View Updates")
		},
		children: t
	}) : null;
}
n.components.set("packages/store", o(() => import("./chunks/Store-BRKYGMdI.js").then((e) => ({ default: e.Store })))), n.components.set("packages/updates", o(() => import("./chunks/Updates-DsicJ4JQ.js").then((e) => ({ default: e.UpdatesPanel }))));
var p = o(() => import("./chunks/StoreDetail-BDzQNdbb.js")), m = () => t("packages/catalog");
n.routes.set("/plugins/store/:vendor/:name", {
	path: "/plugins/store/:vendor/:name",
	component: p,
	load: m
}), n.routes.set("/sites/store", {
	path: "/sites/store",
	component: o(() => import("./chunks/Store-BRKYGMdI.js").then((e) => ({ default: e.SiteStore }))),
	load: m
}), n.routes.set("/sites/store/:vendor/:name", {
	path: "/sites/store/:vendor/:name",
	component: p,
	load: m
}), n.widgets.set("packages-system", o(() => import("./chunks/WidgetSystem-CBnLCvGm.js"))), n.panels.set("packages-updates", {
	slot: "shell.banner",
	component: f
});
