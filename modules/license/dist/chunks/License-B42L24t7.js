import { n as e, t } from "./reasons-RHJgYSeu.js";
import { can as n, invalidate as r, loadManifest as i, plural as a, run as o, t as s, useAbility as c } from "@letterncms/sdk";
import { useState as l } from "react";
import { Badge as u, Button as d, Field as f, List as p, Page as m, Row as h, Section as g, Skeleton as _, Textarea as v, confirm as y, toast as b } from "@letterncms/ui";
import { jsx as x, jsxs as S } from "react/jsx-runtime";
// admin/src/License.tsx
var C = (e) => e === 0 ? "success" : e === 1 ? "neutral" : "warning";
function w() {
	let w = c("license/status"), [T, E] = l(""), [D, O] = l(!1), k = w.data, A = n("license.manage"), j = Object.entries(k?.items ?? {}), M = async (e, t, n) => {
		O(!0);
		try {
			await o(e, t), E(""), r("license/"), await Promise.all([w.refetch(), i()]), b.success(n);
		} catch (e) {
			b.error(e);
		} finally {
			O(!1);
		}
	};
	return w.isLoading || !k ? /* @__PURE__ */ x(m, {
		width: "default",
		crumbs: [{
			label: s("Licence"),
			icon: "key"
		}],
		children: /* @__PURE__ */ x(_, { className: "h-40" })
	}) : /* @__PURE__ */ S(m, {
		width: "default",
		crumbs: [{
			label: s("Licence"),
			icon: "key"
		}],
		children: [
			/* @__PURE__ */ S(g, {
				title: k.host || s("This site"),
				description: k.class === "nonpublic" ? s("Local and staging hosts never need a licence.") : s("A public site never goes down over its licence. The most any state here does is a line in the admin."),
				children: [/* @__PURE__ */ x(p, { children: j.map(([t, n]) => /* @__PURE__ */ S(h, { children: [
					/* @__PURE__ */ x("span", {
						className: "w-40 shrink-0 truncate font-medium",
						children: t
					}),
					/* @__PURE__ */ x("span", {
						className: "min-w-0 flex-1 text-muted",
						children: e(n.reason, k.host)
					}),
					n.edition && /* @__PURE__ */ x(u, {
						tone: "neutral",
						children: n.edition
					}),
					n.upd && /* @__PURE__ */ x("span", {
						className: "shrink-0 text-xs text-muted",
						children: s("Updates until {date}", { date: n.upd })
					}),
					/* @__PURE__ */ x(u, {
						tone: C(n.level),
						children: n.level === 0 ? s("Fine") : s("Needs attention")
					})
				] }, t)) }), k.notes.map((e) => /* @__PURE__ */ x("p", {
					className: "mt-3 text-sm text-muted",
					children: t(e)
				}, e))]
			}),
			k.lid && /* @__PURE__ */ x(g, {
				title: s("This licence"),
				description: k.lid,
				children: /* @__PURE__ */ S("p", {
					className: "m-0 text-sm text-text",
					children: [
						a(k.domains.length, "Covers {count} domain, with its subdomains:", "Covers {count} domains, with their subdomains:"),
						" ",
						k.domains.map((e) => e.replace(/^=/, "")).join(", ")
					]
				})
			}),
			A && /* @__PURE__ */ S(g, {
				title: s("Licence key"),
				description: s("Paste the key from your account. It is stored in config/license.key, or set CMS_LICENSE in the environment."),
				children: [
					/* @__PURE__ */ x(f, {
						label: s("Key"),
						htmlFor: "license-key",
						children: /* @__PURE__ */ x(v, {
							id: "license-key",
							rows: 4,
							spellCheck: !1,
							value: T,
							placeholder: "v4.public.",
							onChange: (e) => E(e.target.value)
						})
					}),
					/* @__PURE__ */ S("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ x(d, {
							variant: "primary",
							loading: D,
							disabled: T.trim() === "",
							onClick: () => void M("license/install", { token: T }, s("Licence key saved")),
							children: s("Save Key")
						}), k.token !== "none" && /* @__PURE__ */ x(d, {
							disabled: D,
							onClick: async () => {
								await y({
									title: s("Remove the licence key?"),
									description: s("The site keeps working. This only removes the key."),
									confirm: s("Remove Key"),
									danger: !0
								}) && await M("license/clear", {}, s("Licence key removed"));
							},
							children: s("Remove Key")
						})]
					}),
					/* @__PURE__ */ x("p", {
						className: "mt-3 text-xs text-muted",
						children: s("A check sends the licence id, this site’s URL, and the {brand} and PHP versions, at most once a day while someone is signed in. It never happens on a public page. CMS_LICENSE_OFFLINE=true turns it off.")
					})
				]
			})
		]
	});
}
export { w as default };
