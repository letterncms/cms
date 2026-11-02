import { Link as e, locale as t, setQuery as n, t as r, timeAgo as i, useAbility as a, useLocation as o } from "@letterncms/sdk";
import { useState as s } from "react";
import { Badge as c, DataView as l, Dialog as u, EmptyState as d, Page as f } from "@letterncms/ui";
import { jsx as p, jsxs as m } from "react/jsx-runtime";
// admin/src/Audit.tsx
function h(e) {
	return {
		mcp: r("Agent"),
		assistant: r("Assistant"),
		rest: r("API"),
		cli: r("CLI"),
		install: r("Install")
	}[e] ?? r("Admin");
}
var g = (e) => new Date(e).toLocaleString(t(), {
	dateStyle: "medium",
	timeStyle: "short"
});
function _() {
	let { query: t } = o(), _ = Number(t.page ?? 1), v = a("audit/list", {
		page: _,
		perPage: 50
	}, { placeholderData: (e) => e }), [y, b] = s(null), x = v.data?.items ?? [];
	return /* @__PURE__ */ m(f, {
		width: "wide",
		crumbs: [{
			label: r("Audit Log"),
			icon: "activity"
		}],
		children: [/* @__PURE__ */ p(l, {
			id: "audit",
			label: r("Audit Log"),
			items: x,
			source: {
				ability: "audit/list",
				perPage: 100
			},
			rowKey: (e) => e.id,
			onRowClick: b,
			pagination: v.data && {
				page: v.data.page,
				pages: v.data.pages,
				onPage: (e) => n({ page: e > 1 ? e : null })
			},
			loading: v.isLoading,
			stale: v.isPlaceholderData,
			error: v.isError,
			onRetry: () => void v.refetch(),
			columns: [
				{
					id: "change",
					label: r("Change"),
					render: (e) => /* @__PURE__ */ m("span", {
						className: "flex min-w-0 items-baseline gap-2",
						children: [/* @__PURE__ */ p("span", {
							className: "truncate",
							children: e.label
						}), e.subject && /* @__PURE__ */ p("span", {
							className: "truncate font-normal text-muted",
							children: e.subject
						})]
					})
				},
				{
					id: "who",
					label: r("Who"),
					width: "160px",
					render: (e) => e.user?.name ?? r("System")
				},
				{
					id: "via",
					label: r("Via"),
					width: "96px",
					render: (e) => /* @__PURE__ */ p(c, {
						tone: e.transport === "mcp" || e.transport === "assistant" ? "info" : "neutral",
						children: h(e.transport)
					})
				},
				{
					id: "when",
					label: r("When"),
					width: "112px",
					align: "end",
					render: (e) => /* @__PURE__ */ p("span", {
						title: g(e.createdAt),
						children: i(e.createdAt)
					})
				}
			],
			empty: /* @__PURE__ */ p(d, {
				icon: "activity",
				title: r("No changes recorded yet")
			})
		}), /* @__PURE__ */ p(u, {
			open: !!y,
			onOpenChange: () => b(null),
			title: y ? y.subject ? `${y.label} · ${y.subject}` : y.label : "",
			description: y ? [
				y.user?.name ?? r("System"),
				h(y.transport),
				g(y.createdAt)
			].join(" · ") : "",
			size: "lg",
			children: y && /* @__PURE__ */ m("div", {
				className: "space-y-3",
				children: [/* @__PURE__ */ m("div", {
					className: "flex items-center gap-3 text-xs text-faint",
					children: [/* @__PURE__ */ p("span", {
						className: "font-mono",
						children: y.ability
					}), y.to && /* @__PURE__ */ p(e, {
						to: y.to,
						className: "ml-auto text-xs",
						onClick: () => b(null),
						children: r("Open")
					})]
				}), /* @__PURE__ */ p("pre", {
					className: "m-0 max-h-[60vh] overflow-auto rounded-sm bg-sunken p-3 font-mono text-xs",
					children: JSON.stringify(y.input, null, 2)
				})]
			})
		})]
	});
}
export { _ as default };
