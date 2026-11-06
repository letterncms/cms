import { a as e, i as t, n, r, t as i } from "./chunks/fields-DaR3pZu3.js";
import { events as a, prefetchAbility as o, registry as s, t as c } from "@letterncms/sdk";
import { Suspense as l, lazy as u, useEffect as d, useState as f } from "react";
import { Select as p, Spinner as m, fieldControlId as h } from "@letterncms/ui";
import { jsx as g } from "react/jsx-runtime";
// admin/src/PreviewDialog.tsx
var _ = u(() => import("./chunks/RenderedPreview-64rF8xvp.js").then((e) => ({ default: e.RenderedPreview })));
function v({ entry: e, content: t, collection: n }) {
	let [r, i] = f(!1);
	return d(() => a.on("entry.preview", () => i(!0)), []), r ? /* @__PURE__ */ g(l, {
		fallback: /* @__PURE__ */ g(m, {}),
		children: /* @__PURE__ */ g(_, {
			entry: e,
			collection: n.handle,
			content: t,
			onClose: () => i(!1)
		})
	}) : null;
}
// admin/src/TemplateField.tsx
function y({ field: e, value: t, onChange: n, disabled: r, error: i }) {
	let a = t ?? "", o = typeof e.fallbackHandle == "string" ? e.fallbackHandle : null, s = Object.entries(e.options ?? {}).filter(([e]) => e !== "" && (e !== o || e === a)).map(([e, t]) => ({
		value: e,
		label: t
	})), l = String(e.placeholder ?? c("Content Only")), u = a !== "" && !s.some((e) => e.value === a), d = [
		{
			value: "",
			label: l.toLowerCase() === c("Default").toLowerCase() ? c("Default") : c("Default ({template})", { template: l })
		},
		...s,
		...u ? [{
			value: a,
			label: c("Missing: {template}", { template: a })
		}] : []
	];
	return /* @__PURE__ */ g(p, {
		id: h(e),
		"aria-label": e.label,
		"aria-describedby": e.describedBy,
		valueHint: u ? c("Using {template}", { template: l }) : void 0,
		value: a,
		onChange: (e) => n(e ?? ""),
		options: d,
		disabled: r,
		invalid: !!i
	});
}
s.fields.set("site-template", y), s.fields.set("site-size", e), s.fields.set("site-font-stack", r), s.fields.set("site-declarations", i), s.fields.set("site-file", n), s.fields.set("site-shadow", t), s.widgets.set("site-status", u(() => import("./chunks/WidgetSite-BEUEPy6X.js"))), s.panels.set("site-preview", {
	slot: "entry.toolbar",
	component: v,
	order: 10
}), s.entryActions.set("site-preview", {
	label: c("Preview"),
	icon: "eye",
	order: 10,
	when: ({ collection: e, entry: t }) => !!(e.route || e.body) && !(t?.uri && t.status === "published" && t.displayStatus !== "scheduled" && !t.hasDraft),
	perform: () => a.emit("entry.preview")
}), s.routes.set("/design", {
	path: "/design",
	component: u(() => import("./chunks/DesignTokens-Bj-Ae77t.js")),
	load: () => o("design/get")
});
