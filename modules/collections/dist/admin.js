import { prefetchAbility as e, registry as t, t as n, useManifest as r } from "@letterncms/sdk";
import { lazy as i } from "react";
import { Button as a, Checkbox as o, entryFieldColumns as s, entrySystemColumns as c, standardEntryColumns as l } from "@letterncms/ui";
import { jsx as u, jsxs as d } from "react/jsx-runtime";
// admin/src/DisplayFields.tsx
function f({ value: e, onChange: t, context: i, disabled: f }) {
	let { site: p } = r(), m = i.values ?? {}, h = (m.fields ?? []).filter((e) => e.handle && e.type), g = (m.fields ?? []).some((e) => e.import) ? (i.blueprintFields ?? []).filter((e) => !h.some((t) => t.handle === e.handle)) : [], _ = s([...h, ...g]), v = c(!!m.route, p.locales), y = l(!!m.route, m.listing, m.default_view, [...h, ...g]), b = new Set(e ?? y), x = new Set(y), S = b.size !== x.size || [...b].some((e) => !x.has(e)), C = (e, n) => t(n ? [.../* @__PURE__ */ new Set([...b, e])] : [...b].filter((t) => t !== e)), w = (e) => /* @__PURE__ */ u("div", {
		className: "grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2",
		children: e.map((e) => /* @__PURE__ */ u(o, {
			checked: b.has(e.id),
			disabled: f,
			onChange: (t) => C(e.id, t),
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
	});
	return /* @__PURE__ */ d("div", {
		id: "f-default_columns",
		role: "group",
		"aria-label": n("Default Display Fields"),
		className: "rounded-sm border border-border px-4 py-3",
		children: [
			w(v),
			_.length > 0 && /* @__PURE__ */ d("div", {
				className: "mt-3 border-t border-border pt-3",
				children: [/* @__PURE__ */ u("div", {
					className: "cms-label mb-2.5",
					children: n("Collection Fields")
				}), w(_)]
			}),
			S && /* @__PURE__ */ u("div", {
				className: "mt-3 border-t border-border pt-3",
				children: /* @__PURE__ */ u(a, {
					size: "sm",
					disabled: f,
					onClick: () => t(null),
					children: n("Reset to Automatic Fields")
				})
			})
		]
	});
}
t.routes.set("/collections", {
	path: "/collections",
	component: i(() => import("./chunks/Collections-CY3GfDak.js")),
	load: () => e("collections/list")
}), t.routes.set("/collections/:handle", {
	path: "/collections/:handle",
	component: i(() => import("./chunks/Blueprint-BMMwmMzS.js")),
	load: ({ handle: t }) => t === "new" ? e("collections/list") : e("collections/get", { handle: t })
}), t.widgets.set("collections-overview", i(() => import("./chunks/WidgetOverview-BML3-Uo6.js"))), t.fields.set("collection-display-fields", f);
