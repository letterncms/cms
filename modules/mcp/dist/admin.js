import { invalidate as e, registry as t, run as n, t as r, timeAgo as i, useAbility as a } from "@letterncms/sdk";
import { Button as o, SettingRow as s, SettingsPanel as c, confirm as l, copyText as u, toast as d } from "@letterncms/ui";
import { lazy as f } from "react";
import { Fragment as p, jsx as m, jsxs as h } from "react/jsx-runtime";
// admin/src/index.tsx
function g() {
	let t = a("mcp/agents", { limit: 1 }), f = `${window.location.origin}/mcp`, g = `claude mcp add --transport http cms ${f}`, _ = async (t) => {
		if (await l({
			title: r("Disconnect {name}?", { name: t }),
			description: r("It stops working until you connect it again."),
			confirm: r("Disconnect"),
			danger: !0
		})) try {
			await n("mcp-agents/delete", { name: t }), e("mcp/", "tokens/");
		} catch (e) {
			d.error(e);
		}
	}, v = (e, t) => /* @__PURE__ */ m(s, {
		label: e,
		children: /* @__PURE__ */ h("div", {
			className: "flex min-h-9 items-center gap-2 rounded-sm bg-sunken py-1.5 pl-3 pr-1.5 font-mono text-xs",
			children: [/* @__PURE__ */ m("span", {
				className: "min-w-0 flex-1 break-words",
				children: t
			}), /* @__PURE__ */ m(o, {
				size: "xs",
				variant: "ghost",
				icon: "copy",
				className: "font-sans",
				onClick: () => void u(t, { copied: r("Copied") }),
				children: r("Copy")
			})]
		})
	});
	return /* @__PURE__ */ m("div", {
		id: "mcp",
		className: "scroll-mt-16",
		children: /* @__PURE__ */ h(c, { children: [
			t.data?.agents.map((e) => /* @__PURE__ */ m(s, {
				layout: "end",
				label: /* @__PURE__ */ h(p, { children: [e.name, /* @__PURE__ */ m("div", {
					className: "mt-1 text-xs font-normal text-muted",
					children: e.lastUsedAt ? r("Active {time}", { time: i(e.lastUsedAt) }) : r("Not used yet")
				})] }),
				children: /* @__PURE__ */ m(o, {
					variant: "destructive",
					onClick: () => void _(e.name),
					children: r("Disconnect")
				})
			}, e.name)),
			v(r("MCP Server URL"), f),
			v("Claude Code", g)
		] })
	});
}
t.components.set("mcp/connect", g), t.widgets.set("mcp-agents", f(() => import("./chunks/WidgetAgents-BbCu-Uot.js")));
