import { registry as e, t, useManifest as n } from "@letterncms/sdk";
import { lazy as r } from "react";
import { Button as i, Checkbox as a, entryFieldColumns as o, entrySystemColumns as s, standardEntryColumns as c } from "@letterncms/ui";
import { jsx as l, jsxs as u } from "react/jsx-runtime";
// admin/src/DisplayFields.tsx
function d({ value: e, onChange: r, context: d, disabled: f }) {
	let { site: p } = n(), m = d.values ?? {}, h = (m.fields ?? []).filter((e) => e.handle && e.type), g = (m.fields ?? []).some((e) => e.import) ? (d.blueprintFields ?? []).filter((e) => !h.some((t) => t.handle === e.handle)) : [], _ = o([...h, ...g]), v = s(!!m.route, p.locales), y = c(!!m.route, m.listing, m.default_view, [...h, ...g]), b = new Set(e ?? y), x = new Set(y), S = b.size !== x.size || [...b].some((e) => !x.has(e)), C = (e, t) => r(t ? [.../* @__PURE__ */ new Set([...b, e])] : [...b].filter((t) => t !== e)), w = (e) => /* @__PURE__ */ l("div", {
		className: "grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2",
		children: e.map((e) => /* @__PURE__ */ l(a, {
			checked: b.has(e.id),
			disabled: f,
			onChange: (t) => C(e.id, t),
			label: /* @__PURE__ */ u("span", {
				className: "inline-flex min-w-0 flex-wrap items-baseline gap-x-1.5",
				children: [/* @__PURE__ */ l("span", {
					className: "break-words",
					children: e.label
				}), e.field && /* @__PURE__ */ l("span", {
					className: "break-all font-mono text-2xs text-faint",
					children: e.field.handle
				})]
			})
		}, e.id))
	});
	return /* @__PURE__ */ u("div", {
		id: "f-default_columns",
		role: "group",
		"aria-label": t("Default Display Fields"),
		className: "rounded-sm border border-border px-4 py-3",
		children: [
			w(v),
			_.length > 0 && /* @__PURE__ */ u("div", {
				className: "mt-3 border-t border-border pt-3",
				children: [/* @__PURE__ */ l("div", {
					className: "cms-label mb-2.5",
					children: t("Collection Fields")
				}), w(_)]
			}),
			S && /* @__PURE__ */ l("div", {
				className: "mt-3 border-t border-border pt-3",
				children: /* @__PURE__ */ l(i, {
					size: "sm",
					disabled: f,
					onClick: () => r(null),
					children: t("Reset to Automatic Fields")
				})
			})
		]
	});
}
e.components.set("collections/new", r(() => import("./chunks/NewCollection-XxtHR3Cm.js"))), e.components.set("collections/blueprint", r(() => import("./chunks/Blueprint-CjAfxjEn.js"))), e.widgets.set("collections-overview", r(() => import("./chunks/WidgetOverview-BML3-Uo6.js"))), e.fields.set("collection-display-fields", d);
