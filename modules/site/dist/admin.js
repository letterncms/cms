import { events as e, prefetchAbility as t, registry as n, t as r } from "@letterncms/sdk";
import { Suspense as i, lazy as a, useEffect as o, useState as s } from "react";
import { Icon as c, Select as l, Spinner as u, cn as d, fieldControlId as f } from "@letterncms/ui";
import { jsx as p, jsxs as m } from "react/jsx-runtime";
// admin/src/fields.tsx
function h({ field: e, onChange: t, disabled: n }) {
	let [i, a] = s(!1);
	return /* @__PURE__ */ m("label", {
		onDragOver: (e) => {
			e.preventDefault(), a(!0);
		},
		onDragLeave: () => a(!1),
		onDrop: (e) => {
			e.preventDefault(), a(!1);
			let r = e.dataTransfer.files?.[0];
			r && !n && t(r);
		},
		className: d("flex h-14 cursor-pointer items-center justify-center gap-2 rounded-sm border border-dashed text-xs text-muted transition-colors hover:bg-hover hover:text-text", i ? "border-focus bg-hover" : "border-border-strong"),
		children: [
			/* @__PURE__ */ p(c, {
				name: "upload",
				size: 14
			}),
			e.placeholder ?? r("Choose a File"),
			/* @__PURE__ */ p("input", {
				id: f(e),
				type: "file",
				accept: e.accept,
				disabled: n,
				className: "hidden",
				onChange: (e) => {
					e.target.files?.[0] && t(e.target.files[0]), e.target.value = "";
				}
			})
		]
	});
}
// admin/src/PreviewDialog.tsx
var g = a(() => import("./chunks/RenderedPreview-64rF8xvp.js").then((e) => ({ default: e.RenderedPreview })));
function _({ entry: t, content: n, collection: r }) {
	let [a, c] = s(!1);
	return o(() => e.on("entry.preview", () => c(!0)), []), a ? /* @__PURE__ */ p(i, {
		fallback: /* @__PURE__ */ p(u, {}),
		children: /* @__PURE__ */ p(g, {
			entry: t,
			collection: r.handle,
			content: n,
			onClose: () => c(!1)
		})
	}) : null;
}
// admin/src/TemplateField.tsx
function v({ field: e, value: t, onChange: n, disabled: i, error: a }) {
	let o = t ?? "", s = typeof e.fallbackHandle == "string" ? e.fallbackHandle : null, c = Object.entries(e.options ?? {}).filter(([e]) => e !== "" && (e !== s || e === o)).map(([e, t]) => ({
		value: e,
		label: t
	})), u = String(e.placeholder ?? r("Content Only")), d = o !== "" && !c.some((e) => e.value === o), m = [
		{
			value: "",
			label: u.toLowerCase() === r("Default").toLowerCase() ? r("Default") : r("Default ({template})", { template: u })
		},
		...c,
		...d ? [{
			value: o,
			label: r("Missing: {template}", { template: o })
		}] : []
	];
	return /* @__PURE__ */ p(l, {
		id: f(e),
		"aria-label": e.label,
		"aria-describedby": e.describedBy,
		valueHint: d ? r("Using {template}", { template: u }) : void 0,
		value: o,
		onChange: (e) => n(e ?? ""),
		options: m,
		disabled: i,
		invalid: !!a
	});
}
n.fields.set("site-template", v), n.fields.set("site-file", h), n.widgets.set("site-status", a(() => import("./chunks/WidgetSite-BEUEPy6X.js"))), n.panels.set("site-preview", {
	slot: "entry.toolbar",
	component: _,
	order: 10
}), n.entryActions.set("site-preview", {
	label: r("Preview"),
	icon: "eye",
	order: 10,
	when: ({ collection: e, entry: t }) => !!(e.route || e.body) && !(t?.uri && t.status === "published" && t.displayStatus !== "scheduled" && !t.hasDraft),
	perform: () => e.emit("entry.preview")
}), n.routes.set("/design", {
	path: "/design",
	component: a(() => import("./chunks/Theme-BmEZawxn.js")),
	load: () => t("design/get")
});
