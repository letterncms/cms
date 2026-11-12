import { invalidate as e, loadManifest as t, plural as n, run as r, t as i, useAbility as a } from "@letterncms/sdk";
import { useState as o } from "react";
import { Button as s, Icon as c, Widget as l, WidgetRow as u, cn as d, toast as f } from "@letterncms/ui";
import { jsx as p, jsxs as m } from "react/jsx-runtime";
// admin/src/WidgetSystem.tsx
function h() {
	let d = a("packages/list", { type: "all" }), [h, _] = o(!1), v = d.data?.items ?? [], y = v, b = v.filter((e) => e.active && e.installedVersion !== e.version), x = y.filter((e) => e.enabled && e.problem), S = d.data?.errors ?? [];
	return !d.isError && (!d.data || b.length === 0 && x.length === 0 && S.length === 0) ? null : /* @__PURE__ */ p(l, {
		action: {
			label: i("Plugins"),
			to: "/plugins"
		},
		query: d,
		children: d.data && /* @__PURE__ */ p("div", { children: /* @__PURE__ */ m("div", { children: [
			b.length > 0 && /* @__PURE__ */ p(g, {
				tone: "warning",
				label: i("Database"),
				value: n(b.length, "{count} update pending", "{count} updates pending"),
				action: /* @__PURE__ */ p(s, {
					size: "xs",
					variant: "primary",
					loading: h,
					onClick: async () => {
						_(!0);
						try {
							await r("packages/migrate"), await Promise.all([t(), d.refetch()]), e("packages/"), f.success(i("Database is up to date"));
						} catch (e) {
							f.error(e);
						} finally {
							_(!1);
						}
					},
					children: i("Run Updates")
				})
			}),
			x.slice(0, 3).map((e) => /* @__PURE__ */ p(u, {
				to: "/plugins",
				leading: /* @__PURE__ */ p(c, {
					name: "warning",
					size: 14,
					className: "shrink-0 text-warning"
				}),
				title: e.label,
				description: e.problem
			}, e.name)),
			S.slice(0, Math.max(0, 3 - x.length)).map((e) => /* @__PURE__ */ p(u, {
				to: "/plugins",
				leading: /* @__PURE__ */ p(c, {
					name: "warning",
					size: 14,
					className: "shrink-0 text-warning"
				}),
				title: i("A package could not be read"),
				description: e
			}, e))
		] }) })
	});
}
function g({ tone: e, label: t, value: n, action: r }) {
	return /* @__PURE__ */ p(u, {
		leading: /* @__PURE__ */ p("span", {
			"aria-hidden": "true",
			className: d("mx-[4px] size-1.5 shrink-0 rounded-full", e === "success" ? "bg-success" : "bg-warning ring-3 ring-warning/20")
		}),
		title: t,
		meta: /* @__PURE__ */ m("span", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ p("span", {
				className: e === "warning" ? "text-muted" : void 0,
				children: n
			}), r]
		})
	});
}
export { h as default };
