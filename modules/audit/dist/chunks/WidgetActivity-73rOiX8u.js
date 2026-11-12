import { plural as e, t, timeAgo as n, useAbility as r } from "@letterncms/sdk";
import { Avatar as i, Icon as a, Widget as o, WidgetRow as s } from "@letterncms/ui";
import { jsx as c } from "react/jsx-runtime";
// admin/src/WidgetActivity.tsx
function l() {
	let l = r("audit/recent", { limit: 6 }, { refetchInterval: 6e4 });
	return !l.isError && (!l.data || l.data.length === 0) ? null : /* @__PURE__ */ c(o, {
		action: {
			label: t("Audit Log"),
			to: "/audit"
		},
		query: l,
		children: l.data?.map((r) => {
			let o = d(r.transport), l = r.user?.name ?? (u(r.transport) ? t("Agent") : t("System"));
			return /* @__PURE__ */ c(s, {
				to: r.to ?? void 0,
				leading: r.user ? /* @__PURE__ */ c(i, {
					name: r.user.name,
					initials: r.user.initials,
					src: r.user.avatar,
					size: 22
				}) : /* @__PURE__ */ c("span", {
					className: "grid size-[22px] shrink-0 place-items-center rounded-full bg-sunken text-muted",
					children: /* @__PURE__ */ c(a, {
						name: u(r.transport) ? "sparkle" : r.transport === "cli" ? "terminal" : "settings",
						size: 12
					})
				}),
				title: /* @__PURE__ */ c("span", {
					className: "font-medium",
					children: r.subject ?? r.label
				}),
				description: [
					r.subject && r.label,
					l,
					r.count > 1 && e(r.count, "{count} time", "{count} times"),
					o
				].filter(Boolean).join(" · "),
				meta: n(r.createdAt)
			}, r.id);
		})
	});
}
function u(e) {
	return e === "mcp" || e === "assistant";
}
function d(e) {
	return u(e) ? t("via agent") : e === "rest" ? t("via API") : e === "cli" ? t("via CLI") : null;
}
export { l as default };
