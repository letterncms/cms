import { navigate as e, t, timeAgo as n, useAbility as r } from "@letterncms/sdk";
import { Button as i, Widget as a, WidgetRow as o } from "@letterncms/ui";
import { Fragment as s, jsx as c, jsxs as l } from "react/jsx-runtime";
// admin/src/WidgetAgents.tsx
function u() {
	let u = r("mcp/agents", { limit: 4 }, { refetchInterval: 6e4 }), d = u.data;
	return /* @__PURE__ */ c(a, {
		action: {
			label: t("Connect"),
			to: "/account#mcp"
		},
		query: u,
		empty: d?.agents.length === 0 && d.activity.length === 0 && {
			icon: "mcp",
			title: t("No agents connected"),
			action: /* @__PURE__ */ c(i, {
				size: "sm",
				icon: "plus",
				onClick: () => e("/account#mcp"),
				children: t("Connect an Agent")
			})
		},
		children: d && /* @__PURE__ */ l(s, { children: [d.agents.map((e) => /* @__PURE__ */ c(o, {
			icon: "robot",
			title: /* @__PURE__ */ c("span", {
				className: "font-medium",
				children: e.name
			}),
			meta: e.lastUsedAt ? t("Active {time}", { time: n(e.lastUsedAt) }) : t("Not used yet")
		}, e.name)), d.activity.length > 0 && /* @__PURE__ */ l(s, { children: [/* @__PURE__ */ c("p", {
			className: d.agents.length ? "m-0 mt-4 mb-1 text-xs text-muted" : "m-0 mb-1 text-xs text-muted",
			children: t("Recent Changes")
		}), d.activity.map((e) => /* @__PURE__ */ c(o, {
			icon: "activity",
			title: e.label,
			description: e.subject ?? void 0,
			meta: n(e.createdAt)
		}, e.id))] })] })
	});
}
export { u as default };
