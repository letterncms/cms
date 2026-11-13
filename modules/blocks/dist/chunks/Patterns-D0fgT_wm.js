import { a as e, c as t } from "./Inserter-CpCHuBqp.js";
import { can as n, navigate as r, t as i, useAbility as a } from "@letterncms/sdk";
import { useMemo as o, useState as s } from "react";
import { Badge as c, Button as l, EmptyState as u, Fields as d, NoMatches as f, Pressable as p, QueryError as m, Section as h, Skeleton as g } from "@letterncms/ui";
import { Fragment as _, jsx as v, jsxs as y } from "react/jsx-runtime";
// admin/src/Patterns.tsx
function b(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e) t.set(n.category, [...t.get(n.category) ?? [], n]);
	return [...t];
}
function x() {
	let x = a("patterns/list", { working: !0 }, { staleTime: 1e4 }), [S, C] = s(""), w = S.trim().toLowerCase(), T = o(() => b((x.data ?? []).filter((t) => e(t, w))), [x.data, w]);
	return x.error ? /* @__PURE__ */ v(m, {
		message: i("Patterns could not be loaded"),
		onRetry: () => void x.refetch(),
		retrying: x.isFetching
	}) : x.isLoading ? /* @__PURE__ */ v("div", {
		className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-3",
		children: [
			0,
			1,
			2
		].map((e) => /* @__PURE__ */ v(g, { className: "h-48 rounded-md" }, e))
	}) : x.data?.length ? /* @__PURE__ */ y("div", { children: [
		/* @__PURE__ */ v("div", {
			className: "mb-6 max-w-sm",
			children: /* @__PURE__ */ v(d, {
				bare: !0,
				fields: [{
					handle: "query",
					type: "text",
					label: i("Search"),
					icon: "search",
					size: "sm",
					placeholder: i("Search Patterns")
				}],
				values: { query: S },
				onChange: (e, t) => C(t ?? "")
			})
		}),
		T.length === 0 && /* @__PURE__ */ v(f, { onClear: () => C("") }),
		T.map(([e, n]) => /* @__PURE__ */ v(h, {
			title: e,
			children: /* @__PURE__ */ v("div", {
				className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-3",
				children: n.map((e) => {
					let n = /* @__PURE__ */ y(_, { children: [
						/* @__PURE__ */ v(t, {
							handle: e.handle,
							maxHeight: 240
						}),
						/* @__PURE__ */ y("span", {
							className: "mt-2 flex min-w-0 items-center gap-2",
							children: [/* @__PURE__ */ v("span", {
								className: "min-w-0 flex-1 truncate text-sm font-medium text-text",
								children: e.title
							}), !e.editable && /* @__PURE__ */ v(c, { children: i("From a Plugin") })]
						}),
						e.description && /* @__PURE__ */ v("span", {
							className: "mt-0.5 line-clamp-2 block text-xs text-muted",
							children: e.description
						})
					] });
					return e.editable && e.id ? /* @__PURE__ */ v(p, {
						to: `/content/patterns/${e.id}`,
						className: "block min-w-0 rounded-md p-1 text-left hover:bg-hover",
						children: n
					}, e.handle) : /* @__PURE__ */ v("div", {
						className: "min-w-0 p-1",
						children: n
					}, e.handle);
				})
			})
		}, e))
	] }) : /* @__PURE__ */ v(u, {
		icon: "section-copy",
		title: i("No patterns yet"),
		action: n("entries.patterns.create") ? /* @__PURE__ */ v(l, {
			variant: "primary",
			icon: "plus",
			onClick: () => r("/content/patterns/new"),
			children: i("New Pattern")
		}) : void 0
	});
}
export { b as byCategory, x as default };
