import { n as e } from "./chunks/reasons-RHJgYSeu.js";
import { Link as t, prefetchAbility as n, registry as r, run as i, t as a, useConfig as o } from "@letterncms/sdk";
import { lazy as s, useEffect as c, useState as l } from "react";
import { Button as u, Icon as d } from "@letterncms/ui";
import { jsx as f, jsxs as p } from "react/jsx-runtime";
// admin/src/Banner.tsx
var m = "cms.license.dismissed", h = 6048e5, g = () => {
	try {
		return Number(localStorage.getItem(m) ?? 0);
	} catch {
		return 0;
	}
};
function _() {
	let n = o("license"), [r, s] = l(g), _ = n.level ?? 0;
	if (c(() => {
		n.refreshDue && i("license/refresh").catch(() => {});
	}, [n.refreshDue]), _ < 2 || _ === 2 && Date.now() - r < h) return null;
	let v = Object.values(n.items ?? {}).sort((e, t) => t.level - e.level)[0];
	return /* @__PURE__ */ p("div", {
		role: "status",
		className: "flex items-center gap-3 border-b border-border bg-surface px-4 py-2 text-sm text-text",
		children: [
			/* @__PURE__ */ f(d, {
				name: "warning",
				size: 16,
				className: "shrink-0 text-warning"
			}),
			/* @__PURE__ */ f("span", {
				className: "min-w-0 flex-1",
				children: v ? e(v.reason, n.host ?? "") : ""
			}),
			/* @__PURE__ */ f(t, {
				to: "/license",
				className: "shrink-0 font-medium text-text underline",
				children: a("See Licence")
			}),
			_ === 2 && /* @__PURE__ */ f(u, {
				size: "xs",
				variant: "ghost",
				onClick: () => {
					let e = Date.now();
					s(e);
					try {
						localStorage.setItem(m, String(e));
					} catch {}
				},
				children: a("Dismiss")
			})
		]
	});
}
r.routes.set("/license", {
	path: "/license",
	private: !0,
	component: s(() => import("./chunks/License-B42L24t7.js")),
	load: () => n("license/status")
}), r.panels.set("license-banner", {
	id: "license-banner",
	slot: "shell.banner",
	component: _
});
