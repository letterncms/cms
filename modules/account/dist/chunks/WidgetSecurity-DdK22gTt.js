import { can as e, navigate as t, plural as n, t as r, useAbility as i } from "@letterncms/sdk";
import { Button as a, Widget as o, WidgetRow as s, cn as c } from "@letterncms/ui";
import { jsx as l, jsxs as u } from "react/jsx-runtime";
// admin/src/WidgetSecurity.tsx
var d = 2592e6;
function f() {
	let s = i("account/get"), c = e("tokens.manage"), f = i("tokens/list", {}, { enabled: c }), m = s.data, h = s.isLoading || c && f.isLoading, g = Date.now(), _ = (f.data ?? []).filter((e) => !e.expiresAt || new Date(e.expiresAt).getTime() > g).filter((e) => (e.lastUsedAt ? g - new Date(e.lastUsedAt).getTime() : g - new Date(e.createdAt ?? g).getTime()) > d);
	return !s.isError && (h || !m || m.twoFactor && _.length === 0) ? null : /* @__PURE__ */ l(o, {
		query: s,
		children: m && /* @__PURE__ */ u("div", { children: [!m.twoFactor && /* @__PURE__ */ l(p, {
			tone: "warning",
			label: r("Two-Factor Authentication"),
			value: r("Off"),
			action: /* @__PURE__ */ l(a, {
				size: "xs",
				onClick: () => t("/account"),
				children: r("Set Up")
			})
		}), _.length > 0 && /* @__PURE__ */ l(p, {
			tone: "warning",
			label: r("API Tokens"),
			value: n(_.length, "{count} unused", "{count} unused"),
			action: /* @__PURE__ */ l(a, {
				size: "xs",
				onClick: () => t("/account"),
				children: r("Review")
			})
		})] })
	});
}
function p({ tone: e, label: t, value: n, action: r }) {
	return /* @__PURE__ */ l(s, {
		className: "h-auto min-h-9 py-1",
		leading: /* @__PURE__ */ l("span", {
			"aria-hidden": "true",
			className: c("mx-[5px] size-1.5 shrink-0 rounded-full", { warning: "bg-warning ring-3 ring-warning/20" }[e])
		}),
		title: /* @__PURE__ */ l("span", {
			className: "whitespace-normal",
			children: t
		}),
		meta: /* @__PURE__ */ u("span", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ l("span", {
				className: e === "warning" ? "text-muted" : void 0,
				children: n
			}), r]
		})
	});
}
export { f as default };
