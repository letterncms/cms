import { locale as e, navigate as t, plural as n, setQuery as r, t as i, timeAgo as a, useAbility as o, useLocation as s } from "@letterncms/sdk";
import { useState as c } from "react";
import { Badge as l, Button as u, DataView as d, Dialog as f, EmptyState as p, Icon as m, NoMatches as h, Page as g, ScreenTabs as _, Select as v, useScreenTabs as y } from "@letterncms/ui";
import { jsx as b, jsxs as x } from "react/jsx-runtime";
// admin/src/Audit.tsx
function S(e) {
	return {
		mcp: i("Agent"),
		assistant: i("Assistant"),
		rest: i("API"),
		cli: i("CLI"),
		install: i("Install")
	}[e] ?? i("Admin");
}
var C = (t) => new Date(t).toLocaleString(e(), {
	dateStyle: "medium",
	timeStyle: "short"
});
function w() {
	let { query: e } = s(), n = Number(e.page ?? 1), m = e.person || void 0, w = e.action || void 0, T = o("audit/list", {
		page: n,
		perPage: 50,
		userId: m,
		ability: w
	}, { placeholderData: (e) => e }), [E, D] = c(null), O = T.data?.items ?? [], A = T.data?.filters, j = !!(m || w), [M, N] = y(["log"]);
	return /* @__PURE__ */ x(g, {
		width: "wide",
		crumbs: [{
			label: i("Audit Log"),
			icon: "activity"
		}],
		children: [/* @__PURE__ */ b(_, {
			value: M,
			onChange: N,
			tabs: [{
				value: "log",
				label: i("Log")
			}],
			children: /* @__PURE__ */ b(d, {
				id: "audit",
				label: i("Audit Log"),
				items: O,
				source: {
					ability: "audit/list",
					input: {
						userId: m,
						ability: w
					},
					perPage: 100
				},
				rowKey: (e) => e.id,
				onRowClick: D,
				dates: () => ({
					publishedAt: null,
					updatedAt: null
				}),
				pagination: T.data && {
					page: T.data.page,
					pages: T.data.pages,
					onPage: (e) => r({ page: e > 1 ? e : null })
				},
				loading: T.isLoading,
				stale: T.isPlaceholderData,
				error: T.isError,
				onRetry: () => void T.refetch(),
				toolbar: /* @__PURE__ */ x("span", {
					className: "flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ b("span", {
						className: "w-44 max-w-full",
						children: /* @__PURE__ */ b(v, {
							size: "sm",
							"aria-label": i("Person"),
							value: m ?? "",
							onChange: (e) => r({
								person: e || null,
								page: null
							}),
							options: [{
								value: "",
								label: i("Everyone")
							}, ...(A?.people ?? []).map((e) => ({
								value: e.id,
								label: e.name
							}))]
						})
					}), /* @__PURE__ */ b("span", {
						className: "w-52 max-w-full",
						children: /* @__PURE__ */ b(v, {
							size: "sm",
							"aria-label": i("Action"),
							value: w ?? "",
							onChange: (e) => r({
								action: e || null,
								page: null
							}),
							options: [{
								value: "",
								label: i("All Actions")
							}, ...A?.actions ?? []]
						})
					})]
				}),
				columns: [
					{
						id: "change",
						label: i("Change"),
						render: (e) => /* @__PURE__ */ x("span", {
							className: "flex min-w-0 items-baseline gap-2",
							children: [/* @__PURE__ */ b("span", {
								className: "truncate",
								children: e.label
							}), e.subject && /* @__PURE__ */ b("span", {
								className: "truncate font-normal text-muted",
								children: e.subject
							})]
						})
					},
					{
						id: "who",
						label: i("Who"),
						width: "160px",
						render: (e) => e.user?.name ?? i("System")
					},
					{
						id: "via",
						label: i("Via"),
						width: "96px",
						render: (e) => /* @__PURE__ */ b(l, {
							tone: e.transport === "mcp" || e.transport === "assistant" ? "info" : "neutral",
							children: S(e.transport)
						})
					},
					{
						id: "when",
						label: i("When"),
						width: "112px",
						align: "end",
						render: (e) => /* @__PURE__ */ b("span", {
							title: C(e.createdAt),
							children: a(e.createdAt)
						})
					}
				],
				empty: j ? /* @__PURE__ */ b(h, { onClear: () => r({
					person: null,
					action: null,
					page: null
				}) }) : /* @__PURE__ */ b(p, {
					icon: "activity",
					title: i("No changes recorded yet")
				})
			})
		}), /* @__PURE__ */ b(f, {
			open: !!E,
			onOpenChange: () => D(null),
			title: E ? E.subject ? `${E.label} · ${E.subject}` : E.label : "",
			description: E ? [
				E.user?.name ?? i("System"),
				S(E.transport),
				C(E.createdAt)
			].join(" · ") : "",
			size: "lg",
			footer: E?.to ? /* @__PURE__ */ b(u, {
				variant: "primary",
				iconRight: "arrow-right",
				onClick: () => {
					let e = E.to;
					D(null), t(e);
				},
				children: i("Open")
			}) : void 0,
			children: E && /* @__PURE__ */ b(k, { row: E })
		})]
	});
}
var T = (e) => e.replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\b\w/g, (e) => e.toUpperCase()), E = (e) => e === "id" || /Id$|_id$/.test(e);
function D(t) {
	return t == null || t === "" ? "—" : typeof t == "boolean" ? i(t ? "Yes" : "No") : typeof t == "string" ? t.length > 160 ? `${t.slice(0, 160)}…` : t : typeof t == "number" ? t.toLocaleString(e()) : Array.isArray(t) ? t.every((e) => typeof e != "object" || !e) ? t.map(D).join(", ") || "—" : n(t.length, "{count} item", "{count} items") : n(Object.keys(t).length, "{count} field", "{count} fields");
}
function O(e) {
	let t = [];
	for (let [n, r] of Object.entries(e ?? {})) if (!E(n)) {
		if (r && typeof r == "object" && !Array.isArray(r)) for (let [e, n] of Object.entries(r)) E(e) || t.push([T(e), D(n)]);
		else t.push([T(n), D(r)]);
	}
	return t;
}
function k({ row: e }) {
	let t = O(e.input);
	return /* @__PURE__ */ x("div", {
		className: "flex flex-col gap-5",
		children: [t.length > 0 ? /* @__PURE__ */ b("dl", {
			className: "m-0 grid grid-cols-[minmax(96px,auto)_minmax(0,1fr)] gap-x-6 gap-y-2 text-sm",
			children: t.map(([e, t], n) => /* @__PURE__ */ x("div", {
				className: "contents",
				children: [/* @__PURE__ */ b("dt", {
					className: "text-muted",
					children: e
				}), /* @__PURE__ */ b("dd", {
					className: "m-0 min-w-0 break-words text-text",
					children: t
				})]
			}, n))
		}) : /* @__PURE__ */ b("p", {
			className: "m-0 text-sm text-muted",
			children: i("Nothing else was sent.")
		}), Object.keys(e.input ?? {}).length > 0 && /* @__PURE__ */ x("details", {
			className: "group",
			children: [/* @__PURE__ */ x("summary", {
				className: "flex w-fit cursor-pointer list-none items-center gap-1 text-xs text-muted hover:text-text [&::-webkit-details-marker]:hidden",
				children: [/* @__PURE__ */ b(m, {
					name: "chevron-right",
					size: 12,
					className: "transition-transform group-open:rotate-90"
				}), i("Raw Data")]
			}), /* @__PURE__ */ x("div", {
				className: "mt-2 space-y-2",
				children: [/* @__PURE__ */ b("code", {
					className: "block font-mono text-xs text-faint",
					children: e.ability
				}), /* @__PURE__ */ b("pre", {
					className: "m-0 max-h-[40vh] overflow-auto rounded-sm bg-sunken p-3 font-mono text-xs",
					children: JSON.stringify(e.input, null, 2)
				})]
			})]
		})]
	});
}
export { w as default };
