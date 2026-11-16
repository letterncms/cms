import { can as e, plural as t, run as n, t as r, timeAgo as i, useAbility as a, useManifest as o } from "@letterncms/sdk";
import { useEffect as s, useRef as c, useState as l } from "react";
import { Button as u, Icon as d, Meter as f, Skeleton as p, Stat as m, Tooltip as h, Widget as g, cn as _, compactNumber as v, toast as y } from "@letterncms/ui";
import { jsx as b, jsxs as x } from "react/jsx-runtime";
// admin/src/WidgetSite.tsx
function S() {
	let p = o(), [S, E] = l(!1), D = a("site/build-status", {}, { refetchInterval: (e) => e.state.data && C(e.state.data) ? 1500 : 6e4 }), O = D.data, k = S || O?.state === "running", A = c(!1);
	s(() => {
		O && A.current && O.state === "done" && (A.current = !1, E(!1), O.errors.length ? y.error(t(O.errors.length, "Published, but {count} page failed", "Published, but {count} pages failed")) : y.success(r("Site published"), { description: t(O.pages, "{count} page is live.", "{count} pages are live.") }));
	}, [O?.state, O?.finishedAt]);
	let j = async () => {
		E(!0);
		try {
			await n("site/build"), A.current = !0, D.refetch();
		} catch (e) {
			E(!1), y.error(e);
		}
	}, M = p.site.url.replace(/^https?:\/\//, "").replace(/\/$/, ""), [N, P] = O ? w(O) : ["neutral", ""], F = !!O?.enabled && e("site.build"), I = (e) => F && /* @__PURE__ */ b("div", {
		className: e ? "hidden shrink-0 @md:block" : "@md:hidden",
		children: /* @__PURE__ */ b(u, {
			variant: N === "success" && !k ? "secondary" : "publish",
			icon: "rocket",
			loading: k,
			onClick: j,
			className: e ? void 0 : "w-full",
			children: r("Publish Site")
		})
	});
	return /* @__PURE__ */ b(g, {
		query: D,
		skeleton: /* @__PURE__ */ b(T, {}),
		children: O && /* @__PURE__ */ x("div", {
			className: "space-y-4",
			children: [
				/* @__PURE__ */ x("div", {
					className: "flex items-start gap-3",
					children: [/* @__PURE__ */ x("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ x("p", {
							className: "m-0 flex items-center gap-2 text-sm font-medium text-text",
							children: [/* @__PURE__ */ b("span", { className: _("size-2 shrink-0 rounded-full", {
								success: "bg-success",
								warning: "bg-warning ring-3 ring-warning/20",
								danger: "bg-danger",
								neutral: "bg-faint"
							}[N]) }), P]
						}), O.state === "queued" || O.state === "running" ? /* @__PURE__ */ b("p", {
							className: "m-0 mt-0.5 truncate pl-4 text-xs text-muted",
							children: O.message || r("Changes")
						}) : /* @__PURE__ */ x("a", {
							href: p.site.url,
							target: "_blank",
							rel: "noreferrer",
							className: "group mt-0.5 ml-4 inline-flex max-w-[calc(100%-1rem)] items-center gap-1 text-xs text-muted no-underline hover:text-text",
							children: [/* @__PURE__ */ b("span", {
								className: "truncate",
								children: M
							}), /* @__PURE__ */ b(d, {
								name: "arrow-up-right",
								size: 11,
								className: "shrink-0 text-faint group-hover:text-text"
							})]
						})]
					}), I(!0)]
				}),
				O.state === "running" && /* @__PURE__ */ b(f, {
					value: Math.max(.04, O.progress),
					label: r("Publishing Progress")
				}),
				O.enabled ? /* @__PURE__ */ x("div", {
					className: "grid grid-cols-2 gap-4 @md:grid-cols-4",
					children: [/* @__PURE__ */ b(m, {
						size: "sm",
						label: r("Pages"),
						value: v(O.pages)
					}), /* @__PURE__ */ b(m, {
						size: "sm",
						label: r("Last Published"),
						value: O.finishedAt ? i(O.finishedAt) : r("Never")
					})]
				}) : /* @__PURE__ */ b("p", {
					className: "m-0 text-xs text-muted",
					children: r("Pages render on request.")
				}),
				O.errors.length > 0 && !k && /* @__PURE__ */ x("div", {
					className: "border-t border-border pt-3",
					children: [/* @__PURE__ */ x("p", {
						className: "m-0 mb-1 flex items-center gap-1.5 text-xs font-medium text-danger",
						children: [/* @__PURE__ */ b(d, {
							name: "warning",
							size: 12
						}), t(O.errors.length, "{count} page failed", "{count} pages failed")]
					}), O.errors.slice(0, 2).map((e) => /* @__PURE__ */ b(h, {
						content: e,
						children: /* @__PURE__ */ b("p", {
							className: "m-0 truncate font-mono text-2xs text-muted",
							children: e.replace(/^uri:/, "").replace(/#[\w-]+:/, ":")
						})
					}, e))]
				}),
				I(!1)
			]
		})
	});
}
function C(e) {
	return e.state === "queued" || e.state === "running";
}
function w(e) {
	return e.enabled ? e.state === "running" ? ["warning", r("Publishing… {percent}", { percent: `${Math.round(e.progress * 100)}%` })] : e.state === "queued" ? ["warning", r("Unpublished Changes")] : e.errors.length ? ["danger", r("Published with errors")] : e.finishedAt ? ["success", r("Up to date")] : ["neutral", r("Not published yet")] : ["success", r("Live")];
}
function T() {
	return /* @__PURE__ */ x("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ x("div", {
			className: "space-y-1.5",
			children: [/* @__PURE__ */ b(p, { className: "h-3.5 w-28" }), /* @__PURE__ */ b(p, { className: "h-3 w-36" })]
		}), /* @__PURE__ */ x("div", {
			className: "grid grid-cols-2 gap-4",
			children: [/* @__PURE__ */ b(p, { className: "h-9" }), /* @__PURE__ */ b(p, { className: "h-9" })]
		})]
	});
}
export { S as default };
