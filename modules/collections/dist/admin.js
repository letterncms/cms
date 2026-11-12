import { registry as e, t, useManifest as n } from "@letterncms/sdk";
import { lazy as r } from "react";
import { Button as i, Checkbox as a, Field as o, Fields as s, IconButton as c, entryFieldColumns as l, entrySystemColumns as u, standardEntryColumns as d } from "@letterncms/ui";
import { jsx as f, jsxs as p } from "react/jsx-runtime";
// admin/src/DisplayFields.tsx
function m({ value: e, onChange: r, context: s, disabled: c }) {
	let { site: m } = n(), h = s.values ?? {}, g = (h.fields ?? []).filter((e) => e.handle && e.type), _ = (h.fields ?? []).some((e) => e.import) ? (s.blueprintFields ?? []).filter((e) => !g.some((t) => t.handle === e.handle)) : [], v = l([...g, ..._]), y = u(!!h.route, m.locales), b = d(!!h.route, h.default_view, [...g, ..._]), x = new Set(e ?? b), S = new Set(b), C = x.size !== S.size || [...x].some((e) => !S.has(e)), w = (e, t) => r(t ? [.../* @__PURE__ */ new Set([...x, e])] : [...x].filter((t) => t !== e));
	return /* @__PURE__ */ f(o, {
		label: t("Columns"),
		aside: C && /* @__PURE__ */ f(i, {
			size: "xs",
			variant: "ghost",
			disabled: c,
			onClick: () => r(null),
			children: t("Reset Columns")
		}),
		children: /* @__PURE__ */ f("div", {
			id: "f-default_columns",
			role: "group",
			"aria-label": t("Columns"),
			children: ((e) => /* @__PURE__ */ f("div", {
				className: "grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2",
				children: e.map((e) => /* @__PURE__ */ f(a, {
					checked: x.has(e.id),
					disabled: c,
					onChange: (t) => w(e.id, t),
					label: /* @__PURE__ */ p("span", {
						className: "inline-flex min-w-0 flex-wrap items-baseline gap-x-1.5",
						children: [/* @__PURE__ */ f("span", {
							className: "break-words",
							children: e.label
						}), e.field && /* @__PURE__ */ f("span", {
							className: "break-all font-mono text-2xs text-faint",
							children: e.field.handle
						})]
					})
				}, e.id))
			}))([...y, ...v])
		})
	});
}
// admin/src/Archives.tsx
function h({ field: e, value: n, onChange: r, disabled: a, context: o }) {
	let l = e.options ?? {}, u = n && typeof n == "object" && !Array.isArray(n) ? n : {}, d = Object.entries(u), m = Object.keys(l).filter((e) => !(e in u)), h = (e) => r(e.length ? Object.fromEntries(e) : null), g = (e) => typeof e == "string" ? e : e.route ?? "", _ = (e, t) => typeof e == "string" ? t : {
		...e,
		route: t
	}, v = (typeof o?.values?.route == "string" ? o.values.route : "").split("{")[0].replace(/\/+$/, ""), y = (e) => `${v}/${e}/{slug}`;
	return /* @__PURE__ */ p("div", {
		className: "space-y-5 sm:space-y-2",
		id: "f-archives",
		"data-archives": !0,
		children: [d.map(([e, n], r) => /* @__PURE__ */ p("div", {
			className: "flex items-start gap-2 sm:items-center",
			children: [/* @__PURE__ */ f(s, {
				bare: !0,
				className: "min-w-0 flex-1",
				fields: [{
					handle: "taxonomy",
					type: "select",
					label: t("Taxonomy"),
					width: "half",
					options: Object.fromEntries([[e, l[e] ?? e], ...m.map((e) => [e, l[e]])])
				}, {
					handle: "route",
					type: "text",
					label: t("URL Pattern"),
					width: "half",
					placeholder: y(e)
				}],
				values: {
					taxonomy: e,
					route: g(n)
				},
				disabled: a,
				onChange: (t, i) => h(d.map((a, o) => o === r ? t === "taxonomy" ? [String(i), n] : [e, _(n, String(i ?? ""))] : a))
			}), /* @__PURE__ */ f(c, {
				icon: "close",
				label: t("Remove Archive"),
				size: "xs",
				className: "max-sm:mt-1",
				disabled: a,
				onClick: () => h(d.filter((e, t) => t !== r))
			})]
		}, e)), m.length > 0 && /* @__PURE__ */ f(i, {
			variant: "ghost",
			icon: "plus",
			disabled: a,
			onClick: () => h([...d, [m[0], y(m[0])]]),
			children: t("Add Archive")
		})]
	});
}
e.components.set("collections/new", r(() => import("./chunks/NewCollection-BuxACCM2.js"))), e.components.set("collections/blueprint", r(() => import("./chunks/Blueprint-_7ZfsU1b.js"))), e.widgets.set("collections-overview", r(() => import("./chunks/WidgetOverview-BML3-Uo6.js"))), e.fields.set("collection-display-fields", m), e.fields.set("collection-archives", h);
