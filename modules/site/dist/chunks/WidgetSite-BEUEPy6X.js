import { can as e, plural as t, run as n, t as r, timeAgo as i, useAbility as a, useManifest as o } from "@letterncms/sdk";
import { useEffect as s, useRef as c, useState as l } from "react";
import { Button as u, Icon as d, Meter as f, Skeleton as p, Stat as m, Widget as h, cn as g, compactNumber as _, toast as v } from "@letterncms/ui";
import { jsx as y, jsxs as b } from "react/jsx-runtime";
// admin/src/WidgetSite.tsx
function x() {
	let p = o(), [x, T] = l(!1), E = a("site/build-status", {}, { refetchInterval: (e) => e.state.data && S(e.state.data) ? 1500 : 6e4 }), D = E.data, O = x || D?.state === "running", k = c(!1);
	s(() => {
		D && k.current && D.state === "done" && (k.current = !1, T(!1), D.errors.length ? v.error(t(D.errors.length, "Published, but {count} page failed", "Published, but {count} pages failed")) : v.success(r("Site published"), { description: t(D.pages, "{count} page is live.", "{count} pages are live.") }));
	}, [D?.state, D?.finishedAt]);
	let A = async () => {
		T(!0);
		try {
			await n("site/build"), k.current = !0, E.refetch();
		} catch (e) {
			T(!1), v.error(e);
		}
	}, j = p.site.url.replace(/^https?:\/\//, "").replace(/\/$/, ""), [M, N] = D ? C(D) : ["neutral", ""], P = !!D?.enabled && e("site.build"), F = (e) => P && /* @__PURE__ */ y("div", {
		className: e ? "hidden shrink-0 @md:block" : "@md:hidden",
		children: /* @__PURE__ */ y(u, {
			variant: M === "success" && !O ? "secondary" : "publish",
			icon: "rocket",
			loading: O,
			onClick: A,
			className: e ? void 0 : "w-full",
			children: r("Publish Site")
		})
	});
	return /* @__PURE__ */ y(h, {
		query: E,
		skeleton: /* @__PURE__ */ y(w, {}),
		children: D && /* @__PURE__ */ b("div", {
			className: "space-y-4",
			children: [
				/* @__PURE__ */ b("div", {
					className: "flex items-start gap-3",
					children: [/* @__PURE__ */ b("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ b("p", {
							className: "m-0 flex items-center gap-2 text-sm font-medium text-text",
							children: [/* @__PURE__ */ y("span", { className: g("size-2 shrink-0 rounded-full", {
								success: "bg-success",
								warning: "bg-warning ring-3 ring-warning/20",
								danger: "bg-danger",
								neutral: "bg-faint"
							}[M]) }), N]
						}), D.state === "queued" || D.state === "running" ? /* @__PURE__ */ y("p", {
							className: "m-0 mt-0.5 truncate pl-4 text-xs text-muted",
							children: D.message || r("Changes")
						}) : /* @__PURE__ */ b("a", {
							href: p.site.url,
							target: "_blank",
							rel: "noreferrer",
							className: "group mt-0.5 ml-4 inline-flex max-w-[calc(100%-1rem)] items-center gap-1 text-xs text-muted no-underline hover:text-text",
							children: [/* @__PURE__ */ y("span", {
								className: "truncate",
								children: j
							}), /* @__PURE__ */ y(d, {
								name: "arrow-up-right",
								size: 11,
								className: "shrink-0 text-faint group-hover:text-text"
							})]
						})]
					}), F(!0)]
				}),
				D.state === "running" && /* @__PURE__ */ y(f, {
					value: Math.max(.04, D.progress),
					label: r("Publishing Progress")
				}),
				D.enabled ? /* @__PURE__ */ b("div", {
					className: "grid grid-cols-2 gap-4 @md:grid-cols-4",
					children: [/* @__PURE__ */ y(m, {
						size: "sm",
						label: r("Pages"),
						value: _(D.pages)
					}), /* @__PURE__ */ y(m, {
						size: "sm",
						label: r("Last Published"),
						value: D.finishedAt ? i(D.finishedAt) : r("Never")
					})]
				}) : /* @__PURE__ */ y("p", {
					className: "m-0 text-xs text-muted",
					children: r("Pages render on request.")
				}),
				D.errors.length > 0 && !O && /* @__PURE__ */ b("div", {
					className: "border-t border-border pt-3",
					children: [/* @__PURE__ */ b("p", {
						className: "m-0 mb-1 flex items-center gap-1.5 text-xs font-medium text-danger",
						children: [/* @__PURE__ */ y(d, {
							name: "warning",
							size: 12
						}), t(D.errors.length, "{count} page failed", "{count} pages failed")]
					}), D.errors.slice(0, 2).map((e) => /* @__PURE__ */ y("p", {
						title: e,
						className: "m-0 truncate font-mono text-2xs text-muted",
						children: e.replace(/^uri:/, "").replace(/#[\w-]+:/, ":")
					}, e))]
				}),
				F(!1)
			]
		})
	});
}
function S(e) {
	return e.state === "queued" || e.state === "running";
}
function C(e) {
	return e.enabled ? e.state === "running" ? ["warning", r("Publishing… {percent}", { percent: `${Math.round(e.progress * 100)}%` })] : e.state === "queued" ? ["warning", r("Unpublished Changes")] : e.errors.length ? ["danger", r("Published with errors")] : e.finishedAt ? ["success", r("Up to date")] : ["neutral", r("Not published yet")] : ["success", r("Live")];
}
function w() {
	return /* @__PURE__ */ b("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ b("div", {
			className: "space-y-1.5",
			children: [/* @__PURE__ */ y(p, { className: "h-3.5 w-28" }), /* @__PURE__ */ y(p, { className: "h-3 w-36" })]
		}), /* @__PURE__ */ b("div", {
			className: "grid grid-cols-2 gap-4",
			children: [/* @__PURE__ */ y(p, { className: "h-9" }), /* @__PURE__ */ y(p, { className: "h-9" })]
		})]
	});
}
export { x as default };
