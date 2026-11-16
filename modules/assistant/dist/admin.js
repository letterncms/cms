import { getManifest as e, registry as t, run as n, setPreference as r, t as i, useAbility as a } from "@letterncms/sdk";
import { lazy as o, useEffect as s } from "react";
import { Button as c, Icon as l, Menu as u, Skeleton as d } from "@letterncms/ui";
import { jsx as f, jsxs as p } from "react/jsx-runtime";
// admin/src/sources.ts
var m = (t = e().user.preferences?.["workspace.mode"] === "local" ? null : e().config?.workspace?.agent) => t?.name === "assistant", h = (e, ...t) => t.some((t) => t?.toLowerCase().includes(e.toLowerCase())), g = null, _ = null;
t.composer.set("assistant-skills", {
	trigger: "/",
	label: i("Skills"),
	order: 10,
	search: async (e) => m() ? (g ??= n("assistant/skills"), (await g).filter((t) => h(e, t.name, t.label)).map((e) => ({
		id: `skill:${e.name}`,
		kind: "skill",
		label: e.label,
		detail: e.description,
		icon: e.icon,
		skill: e.name
	}))) : []
}), t.composer.set("assistant-resources", {
	trigger: "@",
	label: i("Site"),
	order: 40,
	search: async (e) => m() ? (_ ??= n("assistant-resources/list"), (await _).filter((t) => h(e, t.name)).slice(0, 5).map((e) => ({
		id: `resource:${e.uri}`,
		kind: "resource",
		label: e.name,
		icon: "book",
		read: () => n("assistant-resources/get", { uri: e.uri })
	}))) : []
});
// admin/src/ModelPicker.tsx
var v = "assistant.model";
function y(t) {
	let n = e().user.preferences?.[v];
	return t.models.some((e) => e.id === n) ? n : t.model;
}
function b({ thread: e, agent: t, state: n, options: o, setOption: h, loading: g }) {
	let _ = m(t), b = a("assistant/status", {}, {
		staleTime: 6e4,
		enabled: _
	}), x = b.data?.models ?? [], S = (e) => typeof e == "string" && x.some((t) => t.id === e), C = S(o.model) ? o.model : S(n?.model) ? n.model : b.data ? e ? b.data.model : y(b.data) : void 0, w = x.find((e) => e.id === C), T = !e && o.model === void 0 ? w?.id : void 0;
	return s(() => {
		T && h("model", T);
	}, [T, h]), !_ || g ? null : b.isLoading ? /* @__PURE__ */ f("span", {
		className: "flex h-7 items-center px-2",
		"aria-hidden": "true",
		children: /* @__PURE__ */ f(d, { className: "h-3 w-20" })
	}) : w ? /* @__PURE__ */ f(u, {
		side: "top",
		align: "start",
		className: "w-72",
		trigger: /* @__PURE__ */ p(c, {
			variant: "ghost",
			"aria-label": i("Model: {name}", { name: w.name }),
			className: "min-w-0 shrink !gap-1 !pl-2 !pr-1.5 !text-xs !font-normal !text-muted hover:!text-text data-[popup-open]:bg-hover data-[popup-open]:!text-text",
			children: [/* @__PURE__ */ f("span", {
				className: "truncate",
				children: w.name
			}), /* @__PURE__ */ f(l, {
				name: "chevron-down",
				size: 12,
				className: "shrink-0 text-faint"
			})]
		}),
		items: [{
			label: i("Model"),
			heading: !0
		}, ...x.map((e) => ({
			label: e.name,
			description: e.description,
			checked: e.id === w.id,
			onSelect: () => {
				e.id !== w.id && (h("model", e.id), r(v, e.id).catch(() => {}));
			}
		}))]
	}) : null;
}
t.panels.set("assistant-model", {
	slot: "workspace.composer",
	component: b
}), t.widgets.set("assistant-ask", o(() => import("./chunks/WidgetAsk-r9r6lJXA.js")));
