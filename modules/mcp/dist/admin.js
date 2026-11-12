import { invalidate as e, registry as t, run as n, t as r, timeAgo as i, useAbility as a } from "@letterncms/sdk";
import { Button as o, Input as s, SettingRow as c, SettingsPanel as l, Textarea as u, confirm as d, copyText as f, selectFieldTextOnClick as p, toast as m } from "@letterncms/ui";
import { lazy as h } from "react";
import { Fragment as g, jsx as _, jsxs as v } from "react/jsx-runtime";
// admin/src/index.tsx
function y() {
	let t = a("mcp/agents", { limit: 1 }), h = `${window.location.origin}/mcp`, y = `claude mcp add --transport http cms ${h}`, b = async (t) => {
		if (await d({
			title: r("Disconnect {name}?", { name: t }),
			description: r("It stops working until you connect it again."),
			confirm: r("Disconnect"),
			danger: !0
		})) try {
			await n("mcp-agents/delete", { name: t }), e("mcp/", "tokens/");
		} catch (e) {
			m.error(e);
		}
	}, x = (e, t, n = !1) => /* @__PURE__ */ _(c, {
		label: e,
		children: /* @__PURE__ */ v("div", {
			className: "grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2",
			children: [n ? /* @__PURE__ */ _(u, {
				readOnly: !0,
				rows: 1,
				"aria-label": e,
				value: t,
				onClick: p,
				className: "!min-h-8 font-mono text-xs"
			}) : /* @__PURE__ */ _(s, {
				readOnly: !0,
				"aria-label": e,
				value: t,
				onClick: p,
				className: "font-mono [&>input]:text-xs"
			}), /* @__PURE__ */ _(o, {
				size: "sm",
				icon: "copy",
				onClick: () => void f(t, { copied: r("Copied") }),
				children: r("Copy")
			})]
		})
	});
	return /* @__PURE__ */ _("div", {
		id: "mcp",
		className: "scroll-mt-16",
		children: /* @__PURE__ */ v(l, { children: [
			t.data?.agents.map((e) => /* @__PURE__ */ _(c, {
				layout: "end",
				label: /* @__PURE__ */ v(g, { children: [e.name, /* @__PURE__ */ _("div", {
					className: "mt-1 text-xs font-normal text-muted",
					children: e.lastUsedAt ? r("Active {time}", { time: i(e.lastUsedAt) }) : r("Not used yet")
				})] }),
				children: /* @__PURE__ */ _(o, {
					variant: "destructive",
					onClick: () => void b(e.name),
					children: r("Disconnect")
				})
			}, e.name)),
			x(r("MCP Server URL"), h),
			x("Claude Code", y, !0)
		] })
	});
}
t.components.set("mcp/connect", y), t.widgets.set("mcp-agents", h(() => import("./chunks/WidgetAgents-BbCu-Uot.js")));
