import { invalidate as e, registry as t, run as n, t as r, timeAgo as i, useAbility as a } from "@letterncms/sdk";
import { Button as o, SettingRow as s, SettingsPanel as c, Textarea as l, confirm as u, copyText as d, selectFieldTextOnClick as f, toast as p } from "@letterncms/ui";
import { lazy as m } from "react";
import { Fragment as h, jsx as g, jsxs as _ } from "react/jsx-runtime";
// admin/src/index.tsx
function v() {
	let t = a("mcp/agents", { limit: 1 }), m = `${window.location.origin}/mcp`, v = `claude mcp add --transport http cms ${m}`, y = async (t) => {
		if (await u({
			title: r("Disconnect {name}?", { name: t }),
			description: r("It stops working until you connect it again."),
			confirm: r("Disconnect"),
			danger: !0
		})) try {
			await n("mcp-agents/delete", { name: t }), e("mcp/", "tokens/");
		} catch (e) {
			p.error(e);
		}
	}, b = (e, t) => /* @__PURE__ */ g(s, {
		label: e,
		children: /* @__PURE__ */ _("div", {
			className: "grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-2",
			children: [/* @__PURE__ */ g(l, {
				readOnly: !0,
				rows: 1,
				"aria-label": e,
				value: t,
				onClick: f,
				className: "font-mono text-sm"
			}), /* @__PURE__ */ g(o, {
				size: "md",
				icon: "copy",
				onClick: () => void d(t, { copied: r("Copied") }),
				children: r("Copy")
			})]
		})
	});
	return /* @__PURE__ */ g("div", {
		id: "mcp",
		className: "scroll-mt-16",
		children: /* @__PURE__ */ _(c, { children: [
			t.data?.agents.map((e) => /* @__PURE__ */ g(s, {
				layout: "end",
				label: /* @__PURE__ */ _(h, { children: [e.name, /* @__PURE__ */ g("div", {
					className: "mt-1 text-xs font-normal text-muted",
					children: e.lastUsedAt ? r("Active {time}", { time: i(e.lastUsedAt) }) : r("Not used yet")
				})] }),
				children: /* @__PURE__ */ g(o, {
					variant: "destructive",
					onClick: () => void y(e.name),
					children: r("Disconnect")
				})
			}, e.name)),
			b(r("MCP Server URL"), m),
			b("Claude Code", v)
		] })
	});
}
t.components.set("mcp/connect", v), t.widgets.set("mcp-agents", m(() => import("./chunks/WidgetAgents-BbCu-Uot.js")));
