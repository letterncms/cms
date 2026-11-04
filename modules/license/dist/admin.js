import { t as e } from "./chunks/reasons-Jw24gTnT.js";
import { can as t, registry as n, run as r, t as i, useConfig as a } from "@letterncms/sdk";
import { lazy as o, useEffect as s, useState as c } from "react";
import { Banner as l } from "@letterncms/ui";
import { jsx as u } from "react/jsx-runtime";
// admin/src/Banner.tsx
var d = "cms.license.dismissed", f = 6048e5, p = () => {
	try {
		return Number(localStorage.getItem(d) ?? 0);
	} catch {
		return 0;
	}
};
function m() {
	let t = a("license"), [n, o] = c(p), m = t.level ?? 0;
	if (s(() => {
		t.refreshDue && r("license/refresh").catch(() => {});
	}, [t.refreshDue]), m < 2 || m === 2 && Date.now() - n < f) return null;
	let h = Object.values(t.items ?? {}).sort((e, t) => t.level - e.level)[0];
	return /* @__PURE__ */ u(l, {
		action: {
			to: "/plugins?tab=licenses",
			label: i("View License")
		},
		onDismiss: m === 2 ? () => {
			let e = Date.now();
			o(e);
			try {
				localStorage.setItem(d, String(e));
			} catch {}
		} : void 0,
		children: h ? i("Licenses: {state}", { state: e(h.reason) }) : ""
	});
}
n.panels.set("license", {
	id: "licenses",
	slot: "plugins.tabs",
	label: i("Licenses"),
	component: o(() => import("./chunks/License-Csl1xl0X.js")),
	order: 40,
	when: () => t("license.view")
}), n.panels.set("license-banner", {
	id: "license-banner",
	slot: "shell.banner",
	component: m
});
