import { getManifest as e, registry as t, run as n, setPreference as r, t as i, useAbility as a } from "@letterncms/sdk";
import { lazy as o, useEffect as s } from "react";
import { Icon as c, Menu as l } from "@letterncms/ui";
import { jsx as u, jsxs as d } from "react/jsx-runtime";
// admin/src/sources.ts
var f = (t = e().config?.workspace?.agent) => t?.name === "assistant", p = (e, ...t) => t.some((t) => t?.toLowerCase().includes(e.toLowerCase())), m = null, h = null;
t.composer.set("assistant-skills", {
	trigger: "/",
	label: i("Skills"),
	order: 10,
	search: async (e) => f() ? (m ??= n("assistant/skills"), (await m).filter((t) => p(e, t.name, t.label)).map((e) => ({
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
	search: async (e) => f() ? (h ??= n("assistant/resources"), (await h).filter((t) => p(e, t.name)).slice(0, 5).map((e) => ({
		id: `resource:${e.uri}`,
		kind: "resource",
		label: e.name,
		icon: "book",
		read: () => n("assistant/resource", { uri: e.uri })
	}))) : []
});
// admin/src/ModelPicker.tsx
var g = "assistant.model";
function _(t) {
	let n = e().user.preferences?.[g];
	return t.models.some((e) => e.id === n) ? n : t.model;
}
function v({ thread: e, agent: t, state: n, options: o, setOption: p, loading: m }) {
	let h = f(t), v = a("assistant/status", {}, {
		staleTime: 6e4,
		enabled: h
	}), y = v.data?.models ?? [], b = (e) => typeof e == "string" && y.some((t) => t.id === e), x = b(o.model) ? o.model : b(n?.model) ? n.model : v.data ? e ? v.data.model : _(v.data) : void 0, S = y.find((e) => e.id === x), C = !e && o.model === void 0 ? S?.id : void 0;
	return s(() => {
		C && p("model", C);
	}, [C, p]), !h || !v.data || m || !S ? null : /* @__PURE__ */ u(l, {
		side: "top",
		align: "start",
		className: "w-72",
		trigger: /* @__PURE__ */ d("button", {
			type: "button",
			"aria-label": i("Model: {name}", { name: S.name }),
			className: "flex h-7 min-w-0 items-center gap-1 rounded-md pl-2 pr-1.5 text-xs text-muted outline-offset-[-2px] transition-colors hover:bg-hover hover:text-text data-[popup-open]:bg-hover data-[popup-open]:text-text",
			children: [/* @__PURE__ */ u("span", {
				className: "truncate",
				children: S.name
			}), /* @__PURE__ */ u(c, {
				name: "chevron-down",
				size: 12,
				className: "shrink-0 text-faint"
			})]
		}),
		items: [{
			label: i("Model"),
			heading: !0
		}, ...y.map((e) => ({
			label: e.name,
			description: e.description,
			checked: e.id === S.id,
			onSelect: () => {
				e.id !== S.id && (p("model", e.id), r(g, e.id).catch(() => {}));
			}
		}))]
	});
}
t.panels.set("assistant-model", {
	slot: "workspace.composer",
	component: v
}), t.widgets.set("assistant-ask", o(() => import("./chunks/WidgetAsk-CmwckuN5.js")));
