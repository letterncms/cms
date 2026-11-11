import { registry as e, t, useManifest as n } from "@letterncms/sdk";
import { lazy as r } from "react";
import { Button as i, Checkbox as a, Field as o, entryFieldColumns as s, entrySystemColumns as c, standardEntryColumns as l } from "@letterncms/ui";
import { jsx as u, jsxs as d } from "react/jsx-runtime";
// admin/src/DisplayFields.tsx
function f({ value: e, onChange: r, context: f, disabled: p }) {
	let { site: m } = n(), h = f.values ?? {}, g = (h.fields ?? []).filter((e) => e.handle && e.type), _ = (h.fields ?? []).some((e) => e.import) ? (f.blueprintFields ?? []).filter((e) => !g.some((t) => t.handle === e.handle)) : [], v = s([...g, ..._]), y = c(!!h.route, m.locales), b = l(!!h.route, h.default_view, [...g, ..._]), x = new Set(e ?? b), S = new Set(b), C = x.size !== S.size || [...x].some((e) => !S.has(e)), w = (e, t) => r(t ? [.../* @__PURE__ */ new Set([...x, e])] : [...x].filter((t) => t !== e));
	return /* @__PURE__ */ u(o, {
		label: t("Columns"),
		aside: C && /* @__PURE__ */ u(i, {
			size: "xs",
			variant: "ghost",
			disabled: p,
			onClick: () => r(null),
			children: t("Reset Columns")
		}),
		children: /* @__PURE__ */ u("div", {
			id: "f-default_columns",
			role: "group",
			"aria-label": t("Columns"),
			children: ((e) => /* @__PURE__ */ u("div", {
				className: "grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2",
				children: e.map((e) => /* @__PURE__ */ u(a, {
					checked: x.has(e.id),
					disabled: p,
					onChange: (t) => w(e.id, t),
					label: /* @__PURE__ */ d("span", {
						className: "inline-flex min-w-0 flex-wrap items-baseline gap-x-1.5",
						children: [/* @__PURE__ */ u("span", {
							className: "break-words",
							children: e.label
						}), e.field && /* @__PURE__ */ u("span", {
							className: "break-all font-mono text-2xs text-faint",
							children: e.field.handle
						})]
					})
				}, e.id))
			}))([...y, ...v])
		})
	});
}
e.components.set("collections/new", r(() => import("./chunks/NewCollection-BuxACCM2.js"))), e.components.set("collections/blueprint", r(() => import("./chunks/Blueprint-zOsgX8bw.js"))), e.widgets.set("collections-overview", r(() => import("./chunks/WidgetOverview-BML3-Uo6.js"))), e.fields.set("collection-display-fields", f);
