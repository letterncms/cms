import { brand as e, invalidate as t, loadManifest as n, plural as r, run as i, t as a, useAbility as o, useManifest as s } from "@letterncms/sdk";
import { useState as c } from "react";
import { Button as l, Icon as u, Stat as d, Widget as f, WidgetRow as p, cn as m, toast as h } from "@letterncms/ui";
import { jsx as g, jsxs as _ } from "react/jsx-runtime";
// admin/src/WidgetSystem.tsx
function v() {
	let m = s(), v = o("packages/list", { type: "all" }), [b, x] = c(!1), S = v.data?.items ?? [], C = S, w = C.filter((e) => !e.core && e.active).length, T = S.filter((e) => e.active && e.installedVersion !== e.version), E = C.filter((e) => e.enabled && e.problem), D = v.data?.errors ?? [];
	return /* @__PURE__ */ g(f, {
		action: {
			label: a("Plugins"),
			to: "/plugins"
		},
		query: v,
		children: v.data && /* @__PURE__ */ _("div", {
			className: "space-y-3",
			children: [/* @__PURE__ */ _("div", {
				className: "grid grid-cols-2 gap-4",
				children: [/* @__PURE__ */ g(d, {
					size: "sm",
					label: e().name,
					value: m.cms.version
				}), /* @__PURE__ */ g(d, {
					size: "sm",
					label: a("Plugins"),
					value: w
				})]
			}), /* @__PURE__ */ _("div", {
				className: "border-t border-border pt-1",
				children: [
					/* @__PURE__ */ g(y, {
						tone: T.length ? "warning" : "success",
						label: a("Database"),
						value: T.length ? r(T.length, "{count} update pending", "{count} updates pending") : a("Up to date"),
						action: T.length > 0 && /* @__PURE__ */ g(l, {
							size: "xs",
							variant: "primary",
							loading: b,
							onClick: async () => {
								x(!0);
								try {
									await i("packages/sync"), await Promise.all([n(), v.refetch()]), t("packages/"), h.success(a("Database is up to date"));
								} catch (e) {
									h.error(e);
								} finally {
									x(!1);
								}
							},
							children: a("Run Updates")
						})
					}),
					/* @__PURE__ */ g(y, {
						tone: E.length || D.length ? "warning" : "success",
						label: a("Health"),
						value: E.length || D.length ? r(E.length + D.length, "{count} needs attention", "{count} need attention") : a("All working")
					}),
					E.slice(0, 3).map((e) => /* @__PURE__ */ g(p, {
						to: "/plugins",
						leading: /* @__PURE__ */ g(u, {
							name: "warning",
							size: 14,
							className: "shrink-0 text-warning"
						}),
						title: e.label,
						description: e.problem
					}, e.name)),
					D.slice(0, Math.max(0, 3 - E.length)).map((e) => /* @__PURE__ */ g(p, {
						to: "/plugins",
						leading: /* @__PURE__ */ g(u, {
							name: "warning",
							size: 14,
							className: "shrink-0 text-warning"
						}),
						title: a("A package could not be read"),
						description: e
					}, e))
				]
			})]
		})
	});
}
function y({ tone: e, label: t, value: n, action: r }) {
	return /* @__PURE__ */ g(p, {
		leading: /* @__PURE__ */ g("span", {
			"aria-hidden": "true",
			className: m("mx-[4px] size-1.5 shrink-0 rounded-full", e === "success" ? "bg-success" : "bg-warning ring-3 ring-warning/20")
		}),
		title: t,
		meta: /* @__PURE__ */ _("span", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ g("span", {
				className: e === "warning" ? "text-muted" : void 0,
				children: n
			}), r]
		})
	});
}
export { v as default };
