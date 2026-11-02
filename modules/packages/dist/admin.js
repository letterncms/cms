import { r as e } from "./chunks/installing-CCPtKzo4.js";
import { Link as t, prefetchAbility as n, registry as r, run as i, t as a, useConfig as o } from "@letterncms/sdk";
import { lazy as s, useEffect as c } from "react";
import { Icon as l } from "@letterncms/ui";
import { jsx as u, jsxs as d } from "react/jsx-runtime";
// admin/src/UpdateRunner.tsx
var f = !1;
async function p() {
	if (!f) {
		f = !0;
		try {
			for (let t = 0; t < 100; t++) {
				let t = await i("packages/update-tick");
				if (t.drive && await e(), !t.more) break;
			}
		} catch {} finally {
			f = !1;
		}
	}
}
function m() {
	let e = o("packages");
	c(() => {
		e.tick && p();
	}, [e.tick]);
	let n = e.state === "rolled_back" ? a("An update failed its own checks, so this site went back. Your content is safe.") : e.yanked ? a("This version was withdrawn: {reason}", { reason: e.yanked }) : e.supportEnded ? a("This major version stopped getting security fixes in {date}.", { date: e.supportEnded }) : e.advisories?.length ? a("A security advisory covers: {list}.", { list: e.advisories.join(", ") }) : e.stuck?.length ? a("A security fix for {list} needs a licence or a connection to the store.", { list: e.stuck.join(", ") }) : e.security ? a("A security update is ready: {version}.", { version: e.security }) : null;
	return n ? /* @__PURE__ */ d("div", {
		role: "status",
		className: "flex items-center gap-3 border-b border-border bg-surface px-4 py-2 text-sm text-text",
		children: [
			/* @__PURE__ */ u(l, {
				name: "warning",
				size: 16,
				className: "shrink-0 text-warning"
			}),
			/* @__PURE__ */ u("span", {
				className: "min-w-0 flex-1",
				children: n
			}),
			/* @__PURE__ */ u(t, {
				to: "/modules?tab=updates",
				className: "shrink-0 font-medium text-text underline",
				children: a("See Updates")
			})
		]
	}) : null;
}
r.routes.set("/modules", {
	path: "/modules",
	component: s(() => import("./chunks/Modules-u5BIazkp.js")),
	load: () => n("packages/list", { type: "all" })
}), r.widgets.set("packages-system", s(() => import("./chunks/WidgetSystem-BmqTzAer.js"))), r.panels.set("packages-updates", {
	id: "packages-updates",
	slot: "shell.banner",
	component: m
});
