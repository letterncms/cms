import { a as e, o as t } from "./Inserter-BpLCwxz0.js";
import { can as n, navigate as r, t as i, useAbility as a } from "@letterncms/sdk";
import { useMemo as o, useState as s } from "react";
import { Badge as c, Button as l, DataCard as u, DataGrid as d, EmptyState as f, Fields as p, NoMatches as m, PagePreview as h, QueryError as g, Section as _ } from "@letterncms/ui";
import { jsx as v, jsxs as y } from "react/jsx-runtime";
// admin/src/Patterns.tsx
function b(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e) t.set(n.category, [...t.get(n.category) ?? [], n]);
	return [...t];
}
function x() {
	let x = a("patterns/list", { working: !0 }, { staleTime: 1e4 }), [S, C] = s(""), w = S.trim().toLowerCase(), T = o(() => b((x.data ?? []).filter((t) => e(t, w))), [x.data, w]);
	return x.error ? /* @__PURE__ */ v(g, {
		message: i("Patterns could not be loaded"),
		onRetry: () => void x.refetch(),
		retrying: x.isFetching
	}) : x.isLoading ? /* @__PURE__ */ v(d, {
		loading: !0,
		media: !0
	}) : x.data?.length ? /* @__PURE__ */ y("div", { children: [
		/* @__PURE__ */ v("div", {
			className: "mb-6 max-w-sm",
			children: /* @__PURE__ */ v(p, {
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
		T.length === 0 && /* @__PURE__ */ v(m, { onClear: () => C("") }),
		T.map(([e, n]) => /* @__PURE__ */ v(_, {
			title: e,
			children: /* @__PURE__ */ v(d, {
				media: !0,
				children: n.map((e) => /* @__PURE__ */ v(u, {
					title: e.title,
					href: e.editable && e.id ? `/content/patterns/${e.id}` : void 0,
					image: /* @__PURE__ */ v(h, {
						src: t(e.handle),
						fill: !0
					}),
					footer: e.editable ? void 0 : /* @__PURE__ */ v(c, { children: i("From a Plugin") }),
					children: e.description && /* @__PURE__ */ v("p", {
						className: "m-0 mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted",
						children: e.description
					})
				}, e.handle))
			})
		}, e))
	] }) : /* @__PURE__ */ v(f, {
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
