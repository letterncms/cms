import { registry as e, run as t, t as n, useConfig as r } from "@letterncms/sdk";
import { Banner as i } from "@letterncms/ui";
import { useEffect as a, useState as o } from "react";
import { jsx as s } from "react/jsx-runtime";
// admin/src/reasons.ts
var c = (e) => ({
	ok: n("Licensed"),
	nonpublic: n("No license needed here"),
	unlicensed: n("No license"),
	invalid: n("Key not valid"),
	wrong_family: n("Test key"),
	unknown_key: n("Update {brand} to check this key"),
	key_revoked: n("Key withdrawn"),
	unverifiable: n("This server can’t check keys"),
	idn_unconvertible: n("Use the xn-- form of the domain"),
	domain_mismatch: n("Not licensed for this domain"),
	refunded: n("Refunded"),
	charged_back: n("Charged back"),
	revoked: n("License revoked"),
	term_ended: n("Plan ended"),
	major_not_covered: n("This major version isn’t covered"),
	window_over: n("Updates ended")
})[e] ?? e, l = "cms.license.dismissed", u = 6048e5, d = () => {
	try {
		return Number(localStorage.getItem(l) ?? 0);
	} catch {
		return 0;
	}
};
function f() {
	let e = r("license"), [f, p] = o(d), m = e.level ?? 0;
	if (a(() => {
		e.refreshDue && t("license/refresh").catch(() => {});
	}, [e.refreshDue]), m < 2 || m === 2 && Date.now() - f < u) return null;
	let h = Object.values(e.items ?? {}).sort((e, t) => t.level - e.level)[0];
	return /* @__PURE__ */ s(i, {
		action: {
			to: "/plugins?tab=licenses",
			label: n("View License")
		},
		onDismiss: m === 2 ? () => {
			let e = Date.now();
			p(e);
			try {
				localStorage.setItem(l, String(e));
			} catch {}
		} : void 0,
		children: h ? n("Licenses: {state}", { state: c(h.reason) }) : ""
	});
}
// admin/src/index.tsx
e.panels.set("license-banner", {
	slot: "shell.banner",
	component: f
});
