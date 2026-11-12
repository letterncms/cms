import { invalidate as e, navigate as t, run as n, t as r, timeAgo as i, useAbility as a, useManifest as o } from "@letterncms/sdk";
import { Button as s, Icon as c, Stat as l, Widget as u, WidgetRow as d, cn as f, compactNumber as p, toast as m } from "@letterncms/ui";
import { useState as h } from "react";
import { jsx as g, jsxs as _ } from "react/jsx-runtime";
// admin/src/WidgetEmail.tsx
function v() {
	let v = o(), y = a("email/status", { limit: 4 }, { refetchInterval: 6e4 }), [b, x] = h(!1), S = y.data, C = async () => {
		x(!0);
		try {
			await n("email/test", { to: v.user.email }), m.success(r("Test email sent to {email}", { email: v.user.email }));
		} catch (e) {
			m.error(e);
		} finally {
			x(!1), e("email/");
		}
	}, w = S && (S.transport.delivers ? S.latest[0]?.status === "failed" ? "failing" : "ok" : "off"), T = (e) => /* @__PURE__ */ g("div", {
		className: e ? "hidden shrink-0 @md:block" : "@md:hidden",
		children: S?.transport.delivers ? /* @__PURE__ */ g(s, {
			size: "sm",
			icon: "send",
			loading: b,
			onClick: C,
			className: e ? void 0 : "w-full",
			children: r("Send Test Email")
		}) : /* @__PURE__ */ g(s, {
			size: "sm",
			icon: "settings",
			onClick: () => t("/settings/email"),
			className: e ? void 0 : "w-full",
			children: r("Set Up Email")
		})
	});
	return !y.isError && (!S || S.transport.delivers && S.sent === 0 && S.failed === 0 && S.latest.length === 0) ? null : /* @__PURE__ */ g(u, {
		action: {
			label: r("Settings"),
			to: "/settings/email"
		},
		query: y,
		children: S && /* @__PURE__ */ _("div", {
			className: "space-y-4",
			children: [
				/* @__PURE__ */ _("div", {
					className: "flex items-start gap-3",
					children: [/* @__PURE__ */ _("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ _("p", {
							className: "m-0 flex items-center gap-2 text-sm font-medium text-text",
							children: [/* @__PURE__ */ g("span", { className: f("size-2 shrink-0 rounded-full", w === "ok" ? "bg-success" : w === "failing" ? "bg-danger" : "bg-warning") }), /* @__PURE__ */ g("span", {
								className: "truncate",
								children: w === "off" ? r("Not delivering") : w === "failing" ? r("Last email failed") : r("Sending with {transport}", { transport: S.transport.label })
							})]
						}), /* @__PURE__ */ g("p", {
							className: "m-0 mt-0.5 truncate pl-4 text-xs text-muted",
							children: w === "off" ? r("Emails are only written to the log.") : w === "failing" ? S.latest[0].error : r("From {address}", { address: S.from })
						})]
					}), T(!0)]
				}),
				(S.sent > 0 || S.failed > 0) && /* @__PURE__ */ _("div", {
					className: "grid grid-cols-2 gap-4 @md:grid-cols-4",
					children: [/* @__PURE__ */ g(l, {
						size: "sm",
						label: r("Sent (7 days)"),
						value: p(S.sent)
					}), S.failed > 0 && /* @__PURE__ */ g(l, {
						size: "sm",
						label: r("Failed (7 days)"),
						value: p(S.failed)
					})]
				}),
				S.latest.length > 0 && /* @__PURE__ */ _("div", { children: [/* @__PURE__ */ g("p", {
					className: "m-0 mb-1 text-xs text-muted",
					children: r("Latest")
				}), S.latest.map((e) => /* @__PURE__ */ g(d, {
					leading: /* @__PURE__ */ g(c, {
						name: e.status === "failed" ? "warning" : "mail",
						size: 15,
						className: f("shrink-0", e.status === "failed" ? "text-danger" : "text-faint")
					}),
					title: e.subject || r("No subject"),
					description: e.status === "failed" ? /* @__PURE__ */ g("span", {
						title: e.error ?? void 0,
						children: r("Not sent to {recipient}", { recipient: e.to })
					}) : e.to,
					meta: i(e.createdAt)
				}, e.id))] }),
				T(!1)
			]
		})
	});
}
export { v as default };
