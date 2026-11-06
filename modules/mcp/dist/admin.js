import { registry as e, t } from "@letterncms/sdk";
import { Button as n, copyText as r } from "@letterncms/ui";
import { lazy as i } from "react";
import { jsx as a, jsxs as o } from "react/jsx-runtime";
// admin/src/index.tsx
function s() {
	let e = `${window.location.origin}/mcp`, i = `claude mcp add --transport http cms ${e}`, s = (e) => void r(e, { copied: t("Copied") }), c = (e, r) => /* @__PURE__ */ o("div", { children: [/* @__PURE__ */ a("div", {
		className: "mb-1 text-xs text-muted",
		children: e
	}), /* @__PURE__ */ o("div", {
		className: "flex h-9 items-center gap-2 rounded-sm bg-sunken pl-3 pr-1.5 font-mono text-xs",
		children: [/* @__PURE__ */ a("span", {
			className: "min-w-0 flex-1 truncate",
			children: r
		}), /* @__PURE__ */ a(n, {
			size: "xs",
			variant: "ghost",
			icon: "copy",
			onClick: () => s(r),
			children: t("Copy")
		})]
	})] });
	return /* @__PURE__ */ o("div", {
		id: "mcp",
		className: "scroll-mt-16 space-y-3 pt-2",
		children: [c(t("MCP Server URL"), e), c("Claude Code", i)]
	});
}
e.panels.set("mcp-connect", {
	slot: "account.api",
	component: s,
	order: 10
}), e.widgets.set("mcp-agents", i(() => import("./chunks/WidgetAgents-CEGYfurP.js")));
