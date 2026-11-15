import { i as e, o as t, r as n, t as r } from "./chunks/fields-BRkukm45.js";
import { events as i, prefetchAbility as a, registry as o, t as s } from "@letterncms/sdk";
import { Suspense as c, lazy as l, useEffect as u, useState as d } from "react";
import { Select as f, Spinner as p, fieldControlId as m } from "@letterncms/ui";
import { jsx as h } from "react/jsx-runtime";
// admin/src/PreviewDialog.tsx
var g = l(() => import("./chunks/RenderedPreview-Dbj-AzPY.js").then((e) => ({ default: e.RenderedPreview })));
function _({ entry: e, content: t, collection: n }) {
	let [r, a] = d(!1);
	return u(() => i.on("entry.preview", () => a(!0)), []), r ? /* @__PURE__ */ h(c, {
		fallback: /* @__PURE__ */ h(p, {}),
		children: /* @__PURE__ */ h(g, {
			entry: e,
			collection: n.handle,
			blueprint: n.blueprint,
			content: t,
			onClose: () => a(!1)
		})
	}) : null;
}
// admin/src/TemplateField.tsx
function v({ field: e, value: t, onChange: n, disabled: r, error: i }) {
	let a = t ?? "", o = typeof e.fallbackHandle == "string" ? e.fallbackHandle : null, c = Object.entries(e.options ?? {}).filter(([e]) => e !== "" && (e !== o || e === a)).map(([e, t]) => ({
		value: e,
		label: t
	})), l = String(e.placeholder ?? s("Content Only")), u = a !== "" && !c.some((e) => e.value === a), d = [
		{
			value: "",
			label: l.toLowerCase() === s("Default").toLowerCase() ? s("Default") : s("Default ({template})", { template: l })
		},
		...c,
		...u ? [{
			value: a,
			label: s("Missing: {template}", { template: a })
		}] : []
	];
	return /* @__PURE__ */ h(f, {
		id: m(e),
		"aria-label": e.label,
		"aria-describedby": e.describedBy,
		valueHint: u ? s("Using {template}", { template: l }) : void 0,
		value: a,
		onChange: (e) => n(e ?? ""),
		options: d,
		disabled: r,
		invalid: !!i
	});
}
o.fields.set("site-template", v), o.fields.set("site-font-stack", n), o.fields.set("site-shadow", e), o.fields.set("site-size", t), o.fields.set("site-animation", r), o.widgets.set("site-status", l(() => import("./chunks/WidgetSite-BEUEPy6X.js"))), o.panels.set("site-preview", {
	slot: "entry.toolbar",
	component: _,
	order: 10
}), o.entryActions.set("site-preview", {
	label: s("Preview"),
	icon: "eye",
	order: 10,
	when: ({ collection: e, entry: t }) => !!(e.route || e.resolvedFields.some((e) => e.body)) && !(t?.uri && t.status === "published" && t.displayStatus !== "scheduled" && !t.hasDraft),
	perform: () => i.emit("entry.preview")
}), o.routes.set("/styling", {
	path: "/styling",
	component: l(() => import("./chunks/Styling-CDXGoZ83.js")),
	load: () => Promise.all([a("styling/get"), a("styling/source")])
}), o.routes.set("/code", {
	path: "/code",
	component: l(() => import("./chunks/Code-CHi4Za6U.js")),
	load: () => a("styling/get")
}), o.routes.set("/sites", {
	path: "/sites",
	component: l(() => import("./chunks/Sites-9gTzc8yY.js")),
	load: () => a("sites/list")
});
