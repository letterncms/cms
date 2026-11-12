import { r as e } from "./chunks/installing-CCPtKzo4.js";
import { registry as t, run as n, t as r, useConfig as i } from "@letterncms/sdk";
import { lazy as a, useEffect as o } from "react";
import { Banner as s } from "@letterncms/ui";
import { jsx as c } from "react/jsx-runtime";
// admin/src/UpdateRunner.tsx
var l = !1;
async function u() {
	if (!l) {
		l = !0;
		try {
			for (let t = 0; t < 100; t++) {
				let t = await n("packages/update-tick");
				if (t.drive && await e(), !t.more) break;
			}
		} catch {} finally {
			l = !1;
		}
	}
}
function d() {
	let e = i("packages");
	o(() => {
		e.tick && u();
	}, [e.tick]);
	let t = e.state === "rolled_back" ? r("An update failed its own checks, so this site went back. Your content is safe.") : e.yanked ? r("This version was withdrawn: {reason}", { reason: e.yanked }) : e.supportEnded ? r("This major version stopped getting security fixes in {date}.", { date: e.supportEnded }) : e.advisories?.length ? r("A security advisory covers: {list}.", { list: e.advisories.join(", ") }) : e.stuck?.length ? r("A security fix for {list} needs a license or a connection to the store.", { list: e.stuck.join(", ") }) : e.security ? r("A security update is ready: {version}.", { version: e.security }) : null;
	return t ? /* @__PURE__ */ c(s, {
		action: {
			to: "/plugins?tab=updates",
			label: r("View Updates")
		},
		children: t
	}) : null;
}
t.components.set("packages/store", a(() => import("./chunks/Store-BU0lN37q.js").then((e) => ({ default: e.Store })))), t.components.set("packages/updates", a(() => import("./chunks/Updates-De-obGvZ.js").then((e) => ({ default: e.UpdatesPanel })))), t.widgets.set("packages-system", a(() => import("./chunks/WidgetSystem-Bdp287vx.js"))), t.panels.set("packages-updates", {
	slot: "shell.banner",
	component: d
});
