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
	}, E = y.data ?? [], D = {
		handle: "id",
		type: "select",
		label: r("View"),
		required: !0,
		options: E.map((e) => ({
			value: e.id,
			label: e.name
		}))
	}, O = w?.id ?? E[0]?.id, k = async () => {
		let n = await l({
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
			await t("saved-views/create", {
				list: g,
				name: i,
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
	}, A = async () => {
		let n = await l({
			title: r("Rename View"),
			confirm: r("Rename"),
			values: {
				id: O,
				name: E.length === 1 ? E[0].name : ""
			},
			fields: [...E.length > 1 ? [D] : [], {
				handle: "name",
				type: "text",
				label: E.length > 1 ? r("New Name") : r("Name"),
				required: !0,
				autofocus: !0,
				max: 60
			}]
		}), i = E.find((e) => e.id === (n?.id ?? O)), a = String(n?.name ?? "").trim();
		if (i && a && a !== i.name) try {
			await t("saved-views/update", {
				id: i.id,
				name: a
			}), e("saved-views/");
		} catch (e) {
			d.error(e);
		}
	}, j = async () => {
		let n = E.length > 1 ? await l({
			title: r("Delete View"),
			confirm: r("Delete View"),
			danger: !0,
			values: { id: O },
			fields: [D]
		}) : { id: O }, i = E.find((e) => e.id === n?.id);
		if (i && (E.length !== 1 || await c({
			title: r("Delete “{name}”?", { name: i.name }),
			confirm: r("Delete"),
			danger: !0
		}))) try {
			await t("saved-views/delete", { id: i.id }), e("saved-views/");
		} catch (e) {
			d.error(e);
		}
	};
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
			...E.map((e) => ({
				label: e.name,
				checked: e.id === w?.id,
				onSelect: () => T(e)
			})),
			E.length > 0 && {
				separator: !0,
				label: ""
			},
			!w && {
				label: r("Save View"),
				icon: "plus",
				onSelect: () => void k()
			},
			E.length > 0 && {
				label: r("Rename View"),
				icon: "edit",
				onSelect: () => void A()
			},
			E.length > 0 && {
				label: r("Delete View"),
				icon: "trash",
				danger: !0,
				onSelect: () => void j()
			}
		]
	});
}
export { h as default };
