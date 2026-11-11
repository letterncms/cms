import { invalidate as e, run as t, setQuery as n, t as r, useAbility as i, useLocation as a } from "@letterncms/sdk";
import { Button as o, Menu as s, confirm as c, prompt as l, setViewPrefs as u, toast as d, useViewPrefs as f } from "@letterncms/ui";
import { jsx as p } from "react/jsx-runtime";
// admin/src/SavedViews.tsx
var m = (e, t) => e === null || t === null ? e === t : e.length === t.length && e.every((e) => t.includes(e));
function h({ props: h }) {
	let { list: g, params: _, defaultView: v = "table" } = h, y = i("saved-views/list", { list: g }), { query: b } = a(), x = `overview.${g}`, [S] = f(x, v), C = Object.fromEntries(_.flatMap((e) => b[e] ? [[e, b[e]]] : [])), w = (y.data ?? []).find(({ state: e }) => e.view === S.view && e.sort === S.sort && m(e.columns, S.columns) && (e.view !== "calendar" || e.calendarDate === S.calendarDate) && Object.keys(e.query).length === Object.keys(C).length && Object.entries(e.query).every(([e, t]) => C[e] === t)), T = (e) => {
		let { query: t, ...r } = e.state;
		u(x, r), n({
			...Object.fromEntries(_.map((e) => [e, t[e] ?? null])),
			page: null,
			month: null
		});
	}, E = (e, t, n = "") => l({
		title: e,
		fields: [{
			handle: "name",
			type: "text",
			label: r("Name"),
			required: !0,
			autofocus: !0,
			max: 60
		}],
		values: { name: n },
		confirm: t
	}).then((e) => String(e?.name ?? "").trim()), D = async () => {
		let n = await E(r("Save View"), r("Save View"));
		if (n) try {
			await t("saved-views/create", {
				list: g,
				name: n,
				state: {
					query: C,
					sort: S.sort,
					columns: S.columns,
					view: S.view,
					calendarDate: S.calendarDate
				}
			}), e("saved-views/"), d.success(r("View saved"));
		} catch (e) {
			d.error(e);
		}
	}, O = async (n) => {
		let i = await E(r("Rename View"), r("Rename"), n.name);
		if (i && i !== n.name) try {
			await t("saved-views/update", {
				id: n.id,
				name: i
			}), e("saved-views/");
		} catch (e) {
			d.error(e);
		}
	}, k = async (n) => {
		if (await c({
			title: r("Delete “{name}”?", { name: n.name }),
			confirm: r("Delete"),
			danger: !0
		})) try {
			await t("saved-views/delete", { id: n.id }), e("saved-views/");
		} catch (e) {
			d.error(e);
		}
	}, A = y.data ?? [];
	return /* @__PURE__ */ p(s, {
		trigger: /* @__PURE__ */ p(o, {
			size: "sm",
			variant: "ghost",
			icon: "star",
			className: "max-w-48",
			children: /* @__PURE__ */ p("span", {
				className: "truncate",
				children: w?.name ?? r("Views")
			})
		}),
		items: [
			...A.map((e) => ({
				label: e.name,
				checked: e.id === w?.id,
				onSelect: () => T(e)
			})),
			A.length > 0 && {
				separator: !0,
				label: ""
			},
			...w ? [{
				label: r("Rename View"),
				icon: "edit",
				onSelect: () => void O(w)
			}, {
				label: r("Delete View"),
				icon: "trash",
				danger: !0,
				onSelect: () => void k(w)
			}] : [{
				label: r("Save View"),
				icon: "plus",
				onSelect: () => void D()
			}]
		]
	});
}
export { h as default };
