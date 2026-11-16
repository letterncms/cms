import { a as e, o as t } from "./Inserter-BpLCwxz0.js";
import { can as n, navigate as r, t as i, useAbility as a } from "@letterncms/sdk";
import { useMemo as o, useState as s } from "react";
import { Button as c, DataCard as l, DataGrid as u, EmptyState as d, Fields as f, Icon as p, NoMatches as m, PagePreview as h, QueryError as g, Section as _, Tooltip as v } from "@letterncms/ui";
import { jsx as y, jsxs as b } from "react/jsx-runtime";
// admin/src/Patterns.tsx
function x(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e) t.set(n.category, [...t.get(n.category) ?? [], n]);
	return [...t];
}
function S() {
	let S = a("patterns/list", { working: !0 }, { staleTime: 1e4 }), [C, w] = s(""), T = C.trim().toLowerCase(), E = o(() => x((S.data ?? []).filter((t) => e(t, T))), [S.data, T]);
	return S.error ? /* @__PURE__ */ y(g, {
		message: i("Patterns could not be loaded"),
		onRetry: () => void S.refetch(),
		retrying: S.isFetching
	}) : S.isLoading ? /* @__PURE__ */ y(u, {
		loading: !0,
		media: !0
	}) : S.data?.length ? /* @__PURE__ */ b("div", { children: [
		/* @__PURE__ */ y("div", {
			className: "mb-6 max-w-sm",
			children: /* @__PURE__ */ y(f, {
				bare: !0,
				fields: [{
					handle: "query",
					type: "text",
					label: i("Search"),
					icon: "search",
					size: "sm",
					placeholder: i("Search Patterns")
				}],
				values: { query: C },
				onChange: (e, t) => w(t ?? "")
			})
		}),
		E.length === 0 && /* @__PURE__ */ y(m, { onClear: () => w("") }),
		E.map(([e, n]) => /* @__PURE__ */ y(_, {
			title: e,
			children: /* @__PURE__ */ y(u, {
				media: !0,
				children: n.map((e) => /* @__PURE__ */ y(l, {
					title: e.title,
					href: e.editable && e.id ? `/content/patterns/${e.id}` : void 0,
					image: /* @__PURE__ */ y(h, {
						src: t(e.handle),
						fill: !0
					}),
					footer: e.editable ? void 0 : /* @__PURE__ */ y(v, {
						content: i("From a Plugin"),
						children: /* @__PURE__ */ b("span", {
							className: "relative z-raised flex items-center gap-1 text-faint",
							children: [/* @__PURE__ */ y(p, {
								name: "lock",
								size: 12
							}), /* @__PURE__ */ y("span", {
								className: "sr-only",
								children: i("From a Plugin")
							})]
						})
					}),
					children: e.description && /* @__PURE__ */ y("p", {
						className: "m-0 mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted",
						children: e.description
					})
				}, e.handle))
			})
		}, e))
	] }) : /* @__PURE__ */ y(d, {
		icon: "section-copy",
		title: i("No patterns yet"),
		action: n("entries.patterns.create") ? /* @__PURE__ */ y(c, {
			variant: "primary",
			icon: "plus",
			onClick: () => r("/content/patterns/new"),
			children: i("New Pattern")
		}) : void 0
	});
}
export { x as byCategory, S as default };
