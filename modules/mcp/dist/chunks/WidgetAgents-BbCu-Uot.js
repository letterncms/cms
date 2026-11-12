import { t as e, timeAgo as t, useAbility as n } from "@letterncms/sdk";
import { Widget as r, WidgetRow as i } from "@letterncms/ui";
import { Fragment as a, jsx as o, jsxs as s } from "react/jsx-runtime";
// admin/src/WidgetAgents.tsx
function c() {
	let c = n("mcp/agents", { limit: 4 }, { refetchInterval: 6e4 }), l = c.data;
	return !c.isError && (!l || l.agents.length === 0 && l.activity.length === 0) ? null : /* @__PURE__ */ o(r, {
		action: {
			label: e("Connect"),
			to: "/account#mcp"
		},
		query: c,
		children: l && /* @__PURE__ */ s(a, { children: [l.agents.map((n) => /* @__PURE__ */ o(i, {
			icon: "robot",
			title: /* @__PURE__ */ o("span", {
				className: "font-medium",
				children: n.name
			}),
			meta: n.lastUsedAt ? e("Active {time}", { time: t(n.lastUsedAt) }) : e("Not used yet")
		}, n.name)), l.activity.length > 0 && /* @__PURE__ */ s(a, { children: [/* @__PURE__ */ o("p", {
			className: l.agents.length ? "m-0 mt-4 mb-1 text-xs text-muted" : "m-0 mb-1 text-xs text-muted",
			children: e("Recent Changes")
		}), l.activity.map((e) => /* @__PURE__ */ o(i, {
			icon: "activity",
			title: e.label,
			description: e.subject ?? void 0,
			meta: t(e.createdAt)
		}, e.id))] })] })
	});
}
export { c as default };
