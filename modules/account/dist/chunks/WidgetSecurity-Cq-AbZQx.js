import { can as e, navigate as t, plural as n, t as r, timeAgo as i, useAbility as a } from "@letterncms/sdk";
import { Button as o, Skeleton as s, Widget as c, WidgetRow as l, cn as u } from "@letterncms/ui";
import { jsx as d, jsxs as f } from "react/jsx-runtime";
// admin/src/WidgetSecurity.tsx
var p = 2592e6;
function m() {
	let s = a("account/get"), l = e("tokens.manage"), u = a("tokens/list", {}, { enabled: l }), m = s.data, _ = s.isLoading || l && u.isLoading, v = Date.now(), y = (u.data ?? []).filter((e) => !e.expiresAt || new Date(e.expiresAt).getTime() > v), b = y.filter((e) => (e.lastUsedAt ? v - new Date(e.lastUsedAt).getTime() : v - new Date(e.createdAt ?? v).getTime()) > p);
	return /* @__PURE__ */ d(c, {
		query: s,
		loading: _,
		skeleton: /* @__PURE__ */ d(g, {}),
		children: m && /* @__PURE__ */ f("div", { children: [
			/* @__PURE__ */ d(h, {
				tone: m.twoFactor ? "success" : "warning",
				label: r("Two-Factor Sign-In"),
				value: m.twoFactor ? r("On") : r("Off"),
				action: !m.twoFactor && /* @__PURE__ */ d(o, {
					size: "xs",
					onClick: () => t("/account"),
					children: r("Set Up")
				})
			}),
			l && /* @__PURE__ */ d(h, {
				tone: y.length === 0 ? "neutral" : b.length ? "warning" : "success",
				label: r("API Tokens"),
				value: y.length === 0 ? r("None") : b.length ? n(b.length, "{count} unused", "{count} unused") : n(y.length, "{count} in use", "{count} in use"),
				action: b.length > 0 && /* @__PURE__ */ d(o, {
					size: "xs",
					onClick: () => t("/account"),
					children: r("Review")
				})
			}),
			/* @__PURE__ */ d(h, {
				tone: "neutral",
				label: r("Last Sign-In"),
				value: m.lastLoginAt ? i(m.lastLoginAt) : r("Never")
			})
		] })
	});
}
function h({ tone: e, label: t, value: n, action: r }) {
	return /* @__PURE__ */ d(l, {
		leading: /* @__PURE__ */ d("span", {
			"aria-hidden": "true",
			className: u("mx-[5px] size-1.5 shrink-0 rounded-full", {
				success: "bg-success",
				warning: "bg-warning ring-3 ring-warning/20",
				neutral: "bg-faint"
			}[e])
		}),
		title: t,
		meta: /* @__PURE__ */ f("span", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ d("span", {
				className: e === "warning" ? "text-muted" : void 0,
				children: n
			}), r]
		})
	});
}
function g() {
	return /* @__PURE__ */ d("div", {
		className: "space-y-1",
		children: [
			"w-32",
			"w-20",
			"w-24"
		].map((e) => /* @__PURE__ */ f("div", {
			className: "flex h-9 items-center gap-3",
			children: [
				/* @__PURE__ */ d(s, { className: "mx-[5px] size-1.5 rounded-full" }),
				/* @__PURE__ */ d(s, { className: u("h-3", e) }),
				/* @__PURE__ */ d(s, { className: "ml-auto h-3 w-10" })
			]
		}, e))
	});
}
export { m as default };
