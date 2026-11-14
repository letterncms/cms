import { c as e, n as t, t as n } from "./chunks/fields-B2vWHHXc.js";
import { events as r, prefetchAbility as i, registry as a, t as o } from "@letterncms/sdk";
import { Suspense as s, lazy as c, useEffect as l, useState as u } from "react";
import { Select as d, Spinner as f, fieldControlId as p } from "@letterncms/ui";
import { jsx as m } from "react/jsx-runtime";
// admin/src/PreviewDialog.tsx
var h = c(() => import("./chunks/RenderedPreview-Dbj-AzPY.js").then((e) => ({ default: e.RenderedPreview })));
function g({ entry: e, content: t, collection: n }) {
	let [i, a] = u(!1);
	return l(() => r.on("entry.preview", () => a(!0)), []), i ? /* @__PURE__ */ m(s, {
		fallback: /* @__PURE__ */ m(f, {}),
		children: /* @__PURE__ */ m(h, {
			entry: e,
			collection: n.handle,
			blueprint: n.blueprint,
			content: t,
			onClose: () => a(!1)
		})
	}) : null;
}
// admin/src/TemplateField.tsx
function _({ field: e, value: t, onChange: n, disabled: r, error: i }) {
	let a = t ?? "", s = typeof e.fallbackHandle == "string" ? e.fallbackHandle : null, c = Object.entries(e.options ?? {}).filter(([e]) => e !== "" && (e !== s || e === a)).map(([e, t]) => ({
		value: e,
		label: t
	})), l = String(e.placeholder ?? o("Content Only")), u = a !== "" && !c.some((e) => e.value === a), f = [
		{
			value: "",
			label: l.toLowerCase() === o("Default").toLowerCase() ? o("Default") : o("Default ({template})", { template: l })
		},
		...c,
		...u ? [{
			value: a,
			label: o("Missing: {template}", { template: a })
		}] : []
	];
	return /* @__PURE__ */ m(d, {
		id: p(e),
		"aria-label": e.label,
		"aria-describedby": e.describedBy,
		valueHint: u ? o("Using {template}", { template: l }) : void 0,
		value: a,
		onChange: (e) => n(e ?? ""),
		options: f,
		disabled: r,
		invalid: !!i
	});
}
a.fields.set("site-template", _), a.fields.set("site-font-stack", n), a.fields.set("site-shadow", t), a.widgets.set("site-status", c(() => import("./chunks/WidgetSite-BEUEPy6X.js"))), a.panels.set("site-preview", {
	slot: "entry.toolbar",
	component: g,
	order: 10
}), a.entryActions.set("site-preview", {
	label: o("Preview"),
	icon: "eye",
	order: 10,
	when: ({ collection: e, entry: t }) => !!(e.route || e.resolvedFields.some((e) => e.body)) && !(t?.uri && t.status === "published" && t.displayStatus !== "scheduled" && !t.hasDraft),
	perform: () => r.emit("entry.preview")
}), a.routes.set("/styling", {
	path: "/styling",
	component: c(() => import("./chunks/Styling-DICpbTiL.js")),
	load: () => Promise.all([i("styling/get"), i("styling/source")])
}), a.routes.set("/sites", {
	path: "/sites",
	component: c(() => import("./chunks/Sites-9gTzc8yY.js")),
	load: () => i("sites/list")
}), e();
