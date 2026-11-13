import { CmsError as e, invalidate as t, plural as n, run as r, t as i, useAbility as a } from "@letterncms/sdk";
import { useEffect as o, useState as s } from "react";
import { Dialog as c, Fields as l, Notice as u, QueryError as d } from "@letterncms/ui";
import { jsx as f, jsxs as p } from "react/jsx-runtime";
// admin/src/MenuSettings.tsx
var m = (e, t, n = 1) => e.flatMap((e) => [...n > t ? [e.label?.trim() || e.target?.title || e.url || i("Link")] : [], ...m(e.children ?? [], t, n + 1)]), h = () => [{
	handle: "title",
	type: "text",
	label: i("Name"),
	required: !0,
	autofocus: !0
}, {
	handle: "maxDepth",
	type: "select",
	label: i("Submenus"),
	required: !0,
	options: [
		{
			value: "1",
			label: i("No Submenus")
		},
		{
			value: "2",
			label: i("One Level")
		},
		...[
			3,
			4,
			5
		].map((e) => ({
			value: String(e),
			label: i("{count} Levels", { count: e - 1 })
		}))
	]
}];
function g({ props: g, close: _ }) {
	let v = a("navigation/get", { handle: g.handle }, { refetchOnWindowFocus: !1 }), [y, b] = s(null), [x, S] = s(!1), [C, w] = s(null), [T, E] = s({});
	o(() => {
		v.data && !y && b({
			title: v.data.title,
			maxDepth: String(v.data.maxDepth)
		});
	}, [v.data, y]);
	let D = async () => {
		if (!y || x) return;
		w(null), E({});
		let a = m(v.data?.items ?? [], Number(y.maxDepth));
		if (a.length) return E({ maxDepth: n(a.length, "Move “{names}” out a level first.", "Move these out a level first: {names}.", { names: a.slice(0, 5).join(", ") + (a.length > 5 ? "…" : "") }) });
		S(!0);
		try {
			await r("navigation/update", {
				handle: g.handle,
				title: y.title.trim(),
				maxDepth: Number(y.maxDepth)
			}), t("navigation/", "views/"), _?.();
		} catch (t) {
			t instanceof e && t.type === "invalid_input" && Object.keys(t.details).length ? E(t.details) : w(t instanceof e ? t.message : i("Couldn’t save. Check your connection."));
		} finally {
			S(!1);
		}
	};
	return /* @__PURE__ */ f(c, {
		open: !0,
		onOpenChange: (e) => !e && _?.(),
		size: "sm",
		title: i("Menu Settings"),
		onSubmit: () => void D(),
		submitLabel: i("Save Settings"),
		submitDisabled: !y?.title.trim(),
		busy: x,
		children: /* @__PURE__ */ p("div", {
			className: "space-y-4",
			children: [
				v.isError && !y && /* @__PURE__ */ f(d, {
					compact: !0,
					message: i("Couldn’t load this menu."),
					onRetry: () => void v.refetch(),
					retrying: v.isFetching
				}),
				C && /* @__PURE__ */ f(u, {
					tone: "danger",
					children: C
				}),
				y && /* @__PURE__ */ f(l, {
					fields: h(),
					values: y,
					errors: T,
					disabled: x,
					onChange: (e, t) => b({
						...y,
						[e]: String(t ?? "")
					})
				})
			]
		})
	});
}
export { g as default };
