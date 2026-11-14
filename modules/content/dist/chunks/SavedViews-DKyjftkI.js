import { invalidate as e, run as t, setQuery as n, t as r, useAbility as i, useLocation as a } from "@letterncms/sdk";
import { useSyncExternalStore as o } from "react";
import { Button as s, Icon as c, Menu as l, Tabs as u, confirm as d, prompt as f, setViewPrefs as p, toast as m, useViewPrefs as h } from "@letterncms/ui";
import { Fragment as g, jsx as _, jsxs as v } from "react/jsx-runtime";
// admin/src/SavedViews.tsx
var y = "__all", b = /* @__PURE__ */ new Map(), x = /* @__PURE__ */ new Set(), S = (e, t) => {
	b.set(e, t), x.forEach((e) => e());
}, C = (e) => (x.add(e), () => {
	x.delete(e);
}), w = (e, t) => e === null || t === null ? e === t : e.length === t.length && e.every((e) => t.includes(e)), T = (e, t) => e.view === t.view && e.sort === t.sort && w(e.columns, t.columns) && (e.view !== "calendar" || e.calendarDate === t.calendarDate) && Object.keys(e.query).length === Object.keys(t.query).length && Object.entries(e.query).every(([e, n]) => t.query[e] === n);
function E({ props: x }) {
	let { list: w, params: E, defaultView: D = "table", slot: O = "toolbar" } = x, k = i("saved-views/list", { list: w }), { query: A } = a(), j = `overview.${w}`, [M] = h(j, D), N = o(C, () => b.get(w)), P = k.data ?? [], F = {
		query: Object.fromEntries(E.flatMap((e) => A[e] ? [[e, A[e]]] : [])),
		sort: M.sort,
		columns: M.columns,
		view: M.view,
		calendarDate: M.calendarDate
	}, I = {
		query: {},
		sort: null,
		columns: null,
		view: D,
		calendarDate: "published"
	}, L = (N === y || P.some((e) => e.id === N) ? N : void 0) ?? P.find((e) => T(e.state, F))?.id ?? y, R = P.find((e) => e.id === L), z = !T(R?.state ?? I, F), B = (e) => {
		let { query: t, ...r } = P.find((t) => t.id === e)?.state ?? I;
		S(w, e), p(j, e === y ? {
			view: null,
			sort: null,
			columns: null,
			calendarDate: "published"
		} : r), n({
			...Object.fromEntries(E.map((e) => [e, t[e] ?? null])),
			page: null,
			month: null
		});
	}, V = async () => {
		let n = await f({
			title: r("Save View"),
			fields: [{
				handle: "name",
				type: "text",
				label: r("Name"),
				required: !0,
				autofocus: !0,
				max: 60
			}],
			confirm: r("Save View")
		}), i = String(n?.name ?? "").trim();
		if (i) try {
			let n = await t("saved-views/create", {
				list: w,
				name: i,
				state: F
			});
			S(w, n.id), e("saved-views/"), m.success(r("View saved"));
		} catch (e) {
			m.error(e);
		}
	}, H = async () => {
		if (R) try {
			await t("saved-views/update", {
				id: R.id,
				state: F
			}), e("saved-views/"), m.success(r("View saved"));
		} catch (e) {
			m.error(e);
		}
	}, U = async () => {
		if (!R) return;
		let n = await f({
			title: r("Rename View"),
			confirm: r("Rename"),
			values: { name: R.name },
			fields: [{
				handle: "name",
				type: "text",
				label: r("Name"),
				required: !0,
				autofocus: !0,
				max: 60
			}]
		}), i = String(n?.name ?? "").trim();
		if (i && i !== R.name) try {
			await t("saved-views/update", {
				id: R.id,
				name: i
			}), e("saved-views/");
		} catch (e) {
			m.error(e);
		}
	}, W = async () => {
		if (R && await d({
			title: r("Delete “{name}”?", { name: R.name }),
			confirm: r("Delete"),
			danger: !0
		})) try {
			await t("saved-views/delete", { id: R.id }), S(w, y), e("saved-views/");
		} catch (e) {
			m.error(e);
		}
	};
	return O === "header" ? P.length === 0 ? null : /* @__PURE__ */ _(u, {
		className: "mb-3",
		value: L,
		onChange: B,
		tabs: [{
			value: y,
			label: r("All"),
			indicator: L === y && z
		}, ...P.map((e) => ({
			value: e.id,
			label: e.name,
			indicator: e.id === L && z,
			menu: [{
				label: r("Rename View"),
				icon: "edit",
				onSelect: () => void U()
			}, {
				label: r("Delete View"),
				icon: "trash",
				danger: !0,
				onSelect: () => void W()
			}]
		}))]
	}) : z ? /* @__PURE__ */ v(g, { children: [/* @__PURE__ */ _(s, {
		size: "sm",
		variant: "ghost",
		onClick: () => B(L),
		children: r("Reset")
	}), R ? /* @__PURE__ */ _(l, {
		trigger: /* @__PURE__ */ v(s, {
			size: "sm",
			variant: "secondary",
			children: [r("Save View"), /* @__PURE__ */ _(c, {
				name: "chevron-down",
				size: 14,
				className: "-mr-0.5 shrink-0 text-muted"
			})]
		}),
		items: [{
			label: r("Update “{name}”", { name: R.name }),
			onSelect: () => void H()
		}, {
			label: r("Save as New View"),
			onSelect: () => void V()
		}]
	}) : /* @__PURE__ */ _(s, {
		size: "sm",
		variant: "secondary",
		onClick: () => void V(),
		children: r("Save View")
	})] }) : null;
}
export { E as default };
