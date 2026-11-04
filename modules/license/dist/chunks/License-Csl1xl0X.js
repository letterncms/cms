import { t as e } from "./reasons-Jw24gTnT.js";
import { can as t, invalidate as n, loadManifest as r, run as i, t as a, useAbility as o } from "@letterncms/sdk";
import { useState as s } from "react";
import { Badge as c, Button as l, Field as u, Input as d, List as f, Row as p, Skeleton as m, confirm as h, shortDate as g, toast as _ } from "@letterncms/ui";
import { jsx as v, jsxs as y } from "react/jsx-runtime";
// admin/src/License.tsx
var b = (e) => e === 0 ? "success" : e === 1 ? "neutral" : "warning", x = (e) => a(e === 0 ? "Active" : e === 1 ? "Limited" : "Needs Attention"), S = (e) => g(`${e}T12:00:00Z`), C = (t) => t.reason === "ok" ? t.trm ? a("Licensed until {date}", { date: S(t.trm) }) : t.upd ? a("Licensed, updates until {date}", { date: S(t.upd) }) : e("ok") : e(t.reason);
function w() {
	let e = o("license/status"), [g, S] = s(""), [w, T] = s(!1), E = e.data, D = t("license.manage"), O = Object.entries(E?.items ?? {}), k = async (t, a, o) => {
		T(!0);
		try {
			await i(t, a), S(""), n("license/"), await Promise.all([e.refetch(), r()]), _.success(o);
		} catch (e) {
			_.error(e);
		} finally {
			T(!1);
		}
	};
	return e.isLoading || !E ? /* @__PURE__ */ v(m, { className: "h-40" }) : /* @__PURE__ */ y("div", { children: [O.length > 0 ? /* @__PURE__ */ v(f, {
		className: "!border-t-0",
		children: O.map(([e, t]) => /* @__PURE__ */ y(p, {
			className: "py-2",
			children: [/* @__PURE__ */ y("span", {
				className: "flex min-w-0 flex-1 flex-wrap items-center gap-x-3",
				children: [/* @__PURE__ */ v("span", {
					className: "w-40 max-w-full truncate font-medium",
					children: t.label ?? e
				}), /* @__PURE__ */ v("span", {
					className: "min-w-0 truncate text-muted",
					children: C(t)
				})]
			}), /* @__PURE__ */ v(c, {
				tone: b(t.level),
				children: x(t.level)
			})]
		}, e))
	}) : /* @__PURE__ */ v("p", {
		className: "m-0 text-sm text-muted",
		children: a("No paid plugins yet")
	}), D && /* @__PURE__ */ v(u, {
		label: a("License Key"),
		htmlFor: "license-key",
		className: "mt-8",
		children: /* @__PURE__ */ y("div", {
			className: "flex flex-wrap gap-2",
			children: [
				/* @__PURE__ */ v(d, {
					id: "license-key",
					className: "min-w-40 flex-1 font-mono",
					spellCheck: !1,
					autoComplete: "off",
					value: g,
					placeholder: "v4.public.",
					onChange: (e) => S(e.target.value)
				}),
				/* @__PURE__ */ v(l, {
					variant: "primary",
					size: "md",
					loading: w,
					disabled: g.trim() === "",
					onClick: () => void k("license/install", { token: g }, a("License key saved")),
					children: a("Save Key")
				}),
				E.token !== "none" && /* @__PURE__ */ v(l, {
					size: "md",
					disabled: w,
					onClick: async () => {
						await h({
							title: a("Remove the license key?"),
							description: a("The site keeps working."),
							confirm: a("Remove Key"),
							danger: !0
						}) && await k("license/clear", {}, a("License key removed"));
					},
					children: a("Remove Key")
				})
			]
		})
	})] });
}
export { w as default };
