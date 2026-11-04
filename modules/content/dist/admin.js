import { getManifest as e, prefetchAbility as t, registry as n, run as r, t as i } from "@letterncms/sdk";
import { lazy as a, useEffect as o, useRef as s, useState as c } from "react";
import { Icon as l, Textarea as u, cn as d, fieldControlId as f, slugify as p } from "@letterncms/ui";
import { jsx as m, jsxs as h } from "react/jsx-runtime";
// admin/src/TitleField.tsx
function g({ field: e, value: t, onChange: n, error: r, disabled: i }) {
	let a = e.onEnter, o = e.onDown;
	return /* @__PURE__ */ m(u, {
		appearance: "plain",
		id: f(e),
		"aria-describedby": e.describedBy,
		value: t ?? "",
		onChange: (e) => n(e.target.value.replace(/\n/g, " ")),
		onKeyDown: (e) => {
			let t = e.currentTarget;
			e.key === "Enter" ? (e.preventDefault(), a?.()) : e.key === "ArrowDown" && o && !e.shiftKey && t.selectionStart === t.value.length && (e.preventDefault(), o());
		},
		placeholder: e.placeholder ?? "",
		autoFocus: e.autofocus === !0,
		rows: 1,
		disabled: i,
		"aria-label": e.label,
		invalid: !!r,
		className: "text-[34px] font-semibold leading-[42px] tracking-[-0.025em] text-ink placeholder:text-faint/60"
	});
}
function _({ field: e, value: t, onChange: n, disabled: r }) {
	let a = String(e.uri ?? ""), u = t ?? "", [g, _] = c(!1), [v, y] = c(u), b = s(null);
	return o(() => y(u), [u]), /* @__PURE__ */ h("div", {
		className: "flex h-6 min-w-0 items-center gap-1.5 text-sm text-faint",
		children: [/* @__PURE__ */ m(l, {
			name: "link",
			size: 13,
			className: "shrink-0"
		}), g ? /* @__PURE__ */ m("input", {
			ref: b,
			autoFocus: !0,
			id: f(e),
			"aria-describedby": e.describedBy,
			"aria-label": e.label,
			value: v,
			onChange: (e) => y(p(e.target.value, !0)),
			onBlur: () => {
				_(!1);
				let e = p(v);
				e && e !== u && n(e);
			},
			onKeyDown: (e) => {
				e.key === "Enter" && b.current?.blur(), e.key === "Escape" && (y(u), _(!1));
			},
			className: "h-6 w-72 min-w-0 max-w-full rounded-xs border border-focus bg-bg px-1.5 font-mono text-xs text-text outline-none"
		}) : /* @__PURE__ */ m("button", {
			id: f(e),
			"aria-describedby": e.describedBy,
			type: "button",
			disabled: r || a === "/",
			onClick: () => _(!0),
			"aria-label": a === "/" ? void 0 : i("Edit URL"),
			className: d("block min-w-0 truncate rounded-xs px-1 text-left font-mono text-xs hover:bg-hover hover:text-text disabled:hover:bg-transparent"),
			title: a,
			children: a
		})]
	});
}
n.routes.set("/content/:collection", {
	path: "/content/:collection",
	component: a(() => import("./chunks/EntriesList-BW9w-_mR.js")),
	load: (e, t) => import("./chunks/EntriesList-BW9w-_mR.js").then((n) => n.loadEntriesList(e.collection, t.query))
}), n.routes.set("/content/:collection/:id", {
	path: "/content/:collection/:id",
	component: a(() => import("./chunks/EntryEditor-9qzd3i_A.js")),
	load: ({ collection: e, id: n }) => Promise.all([t("collections/get", { handle: e }), ...n === "new" ? [] : [t("entries/get", { id: n }).catch(() => void 0)]])
}), n.fields.set("title", g), n.fields.set("uri", _), n.widgets.set("recent", a(() => import("./chunks/WidgetRecent-BJRXNycu.js")));
var v = (t) => {
	let n = e().collections.find((e) => e.handle === t.collection);
	return {
		id: `entry:${t.id}`,
		kind: "entry",
		label: t.title || i("Untitled"),
		detail: n?.singular,
		icon: n?.icon ?? "file",
		to: `/content/${t.collection}/${t.id}`,
		read: () => r("entries/get", { id: t.id })
	};
};
n.composer.set("entries", {
	id: "entries",
	trigger: "@",
	label: i("Content"),
	order: 10,
	search: async (e) => (e ? await r("content/search", {
		query: e,
		limit: 6
	}) : await r("content/recent", { limit: 6 })).map(v)
});
