import { invalidate as e, registry as t, run as n, t as r, timeAgo as i, useAbility as a } from "@letterncms/sdk";
import { Button as o, Field as s, List as c, Row as l, confirm as u, copyText as d, toast as f } from "@letterncms/ui";
import { lazy as p } from "react";
import { jsx as m, jsxs as h } from "react/jsx-runtime";
// admin/src/index.tsx
function g() {
	let t = a("mcp/agents", { limit: 1 }), p = `${window.location.origin}/mcp`, g = `claude mcp add --transport http cms ${p}`, _ = async (t) => {
		if (await u({
			title: r("Disconnect {name}?", { name: t }),
			description: r("It stops working until you connect it again."),
			confirm: r("Disconnect"),
			danger: !0
		})) try {
			await n("mcp-agents/delete", { name: t }), e("mcp/", "tokens/");
		} catch (e) {
			f.error(e);
		}
	}, v = (e, t) => /* @__PURE__ */ m(s, {
		label: e,
		children: /* @__PURE__ */ h("div", {
			className: "flex min-h-9 items-center gap-2 rounded-sm bg-sunken py-1.5 pl-3 pr-1.5 font-mono text-xs",
			children: [/* @__PURE__ */ m("span", {
				className: "min-w-0 flex-1 break-all",
				children: t
			}), /* @__PURE__ */ m(o, {
				size: "xs",
				variant: "ghost",
				icon: "copy",
				className: "font-sans",
				onClick: () => void d(t, { copied: r("Copied") }),
				children: r("Copy")
			})]
		})
	});
	return /* @__PURE__ */ h("div", {
		id: "mcp",
		className: "scroll-mt-16 space-y-4",
		children: [
			(t.data?.agents.length ?? 0) > 0 && /* @__PURE__ */ m(c, { children: t.data.agents.map((e) => /* @__PURE__ */ h(l, {
				className: "min-h-12",
				children: [
					/* @__PURE__ */ m("span", {
						className: "min-w-0 truncate font-medium",
						children: e.name
					}),
					/* @__PURE__ */ m("span", {
						className: "min-w-0 flex-1 truncate text-xs text-muted",
						children: e.lastUsedAt ? r("Active {time}", { time: i(e.lastUsedAt) }) : r("Not used yet")
					}),
					/* @__PURE__ */ m(o, {
						variant: "destructive",
						onClick: () => void _(e.name),
						children: r("Disconnect")
					})
				]
			}, e.name)) }),
			v(r("MCP Server URL"), p),
			v("Claude Code", g)
		]
	});
}
t.components.set("mcp/connect", g), t.widgets.set("mcp-agents", p(() => import("./chunks/WidgetAgents-BbCu-Uot.js")));
