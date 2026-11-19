import { invalidate as e, navigate as t, run as n, t as r, timeAgo as i, useAbility as a, useManifest as o } from "@letterncms/sdk";
import { Button as s, Icon as c, Stat as l, Tooltip as u, Widget as d, WidgetRow as f, cn as p, compactNumber as m, toast as h } from "@letterncms/ui";
import { useState as g } from "react";
import { jsx as _, jsxs as v } from "react/jsx-runtime";
// admin/src/WidgetEmail.tsx
function y() {
	let y = o(), b = a("email/status", { limit: 4 }, { refetchInterval: 6e4 }), [x, S] = g(!1), C = b.data, w = async () => {
		S(!0);
		try {
			await n("email/test", { to: y.user.email }), h.success(r("Test email sent to {email}", { email: y.user.email }));
		} catch (e) {
			h.error(e);
		} finally {
			S(!1), e("email/");
		}
	}, T = C && (C.transport.delivers ? C.latest[0]?.status === "failed" ? "failing" : "ok" : "off"), E = (e) => /* @__PURE__ */ _("div", {
		className: e ? "hidden shrink-0 @md:block" : "@md:hidden",
		children: C?.transport.delivers ? /* @__PURE__ */ _(s, {
			size: "sm",
			icon: "send",
			loading: x,
			onClick: w,
			className: e ? void 0 : "w-full",
			children: r("Send Test Email")
		}) : /* @__PURE__ */ _(s, {
			size: "sm",
			icon: "settings",
			onClick: () => t("/settings/email"),
			className: e ? void 0 : "w-full",
			children: r("Set Up Email")
		})
	}), D = !!C && C.transport.delivers && C.sent === 0 && C.failed === 0 && C.latest.length === 0;
	return /* @__PURE__ */ _(d, {
		action: {
			label: r("Settings"),
			to: "/settings/email"
		},
		query: b,
		empty: D && { title: r("No email sent yet") },
		children: C && /* @__PURE__ */ v("div", {
			className: "space-y-4",
			children: [
				/* @__PURE__ */ v("div", {
					className: "flex items-start gap-3",
					children: [/* @__PURE__ */ v("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ v("p", {
							className: "m-0 flex items-center gap-2 text-sm font-medium text-text",
							children: [/* @__PURE__ */ _("span", { className: p("size-2 shrink-0 rounded-full", T === "ok" ? "bg-success" : T === "failing" ? "bg-danger" : "bg-warning") }), /* @__PURE__ */ _("span", {
								className: "truncate",
								children: T === "off" ? r("Not delivering") : T === "failing" ? r("Last email failed") : r("Sending with {transport}", { transport: C.transport.label })
							})]
						}), /* @__PURE__ */ _("p", {
							className: "m-0 mt-0.5 truncate pl-4 text-xs text-muted",
							children: T === "off" ? r("Emails are only written to the log.") : T === "failing" ? C.latest[0].error : r("From {address}", { address: C.from })
						})]
					}), E(!0)]
				}),
				(C.sent > 0 || C.failed > 0) && /* @__PURE__ */ v("div", {
					className: "grid grid-cols-2 gap-4 @md:grid-cols-4",
					children: [/* @__PURE__ */ _(l, {
						size: "sm",
						label: r("Sent (7 days)"),
						value: m(C.sent)
					}), C.failed > 0 && /* @__PURE__ */ _(l, {
						size: "sm",
						label: r("Failed (7 days)"),
						value: m(C.failed)
					})]
				}),
				C.latest.length > 0 && /* @__PURE__ */ v("div", { children: [/* @__PURE__ */ _("p", {
					className: "m-0 mb-1 text-xs text-muted",
					children: r("Latest")
				}), C.latest.map((e) => /* @__PURE__ */ _(f, {
					leading: /* @__PURE__ */ _(c, {
						name: e.status === "failed" ? "warning" : "mail",
						size: 15,
						className: p("shrink-0", e.status === "failed" ? "text-danger" : "text-faint")
					}),
					title: e.subject || r("No subject"),
					description: e.status === "failed" ? /* @__PURE__ */ _(u, {
						content: e.error,
						children: /* @__PURE__ */ _("span", { children: r("Not sent to {recipient}", { recipient: e.to }) })
					}) : e.to,
					meta: i(e.createdAt)
				}, e.id))] }),
				E(!1)
			]
		})
	});
}
export { y as default };
