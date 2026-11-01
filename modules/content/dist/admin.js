import { prefetchAbility as e, registry as t, t as n } from "@letterncms/sdk";
import { lazy as r, useEffect as i, useRef as a, useState as o } from "react";
import { Icon as s, Textarea as c, cn as l, fieldControlId as u, slugify as d } from "@letterncms/ui";
import { jsx as f, jsxs as p } from "react/jsx-runtime";
// admin/src/TitleField.tsx
function m({ field: e, value: t, onChange: n, error: r, disabled: i }) {
	let a = e.onEnter, o = e.onDown;
	return /* @__PURE__ */ f(c, {
		appearance: "plain",
		id: u(e),
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
function h({ field: e, value: t, onChange: r, disabled: c }) {
	let m = String(e.uri ?? ""), h = t ?? "", [g, _] = o(!1), [v, y] = o(h), b = a(null);
	return i(() => y(h), [h]), /* @__PURE__ */ p("div", {
		className: "flex h-6 items-center gap-1.5 text-sm text-faint",
		children: [/* @__PURE__ */ f(s, {
			name: "link",
			size: 13
		}), g ? /* @__PURE__ */ f("input", {
			ref: b,
			autoFocus: !0,
			id: u(e),
			"aria-describedby": e.describedBy,
			"aria-label": e.label,
			value: v,
			onChange: (e) => y(d(e.target.value, !0)),
			onBlur: () => {
				_(!1);
				let e = d(v);
				e && e !== h && r(e);
			},
			onKeyDown: (e) => {
				e.key === "Enter" && b.current?.blur(), e.key === "Escape" && (y(h), _(!1));
			},
			className: "h-6 w-72 rounded-xs border border-focus bg-bg px-1.5 font-mono text-xs text-text outline-none"
		}) : /* @__PURE__ */ f("button", {
			id: u(e),
			"aria-describedby": e.describedBy,
			type: "button",
			disabled: c || m === "/",
			onClick: () => _(!0),
			className: l("rounded-xs px-1 font-mono text-xs hover:bg-hover hover:text-text disabled:hover:bg-transparent"),
			title: n("Edit URL"),
			children: m
		})]
	});
}
t.routes.set("/content/:collection", {
	path: "/content/:collection",
	component: r(() => import("./chunks/EntriesList-B5l3Tfhc.js")),
	load: (e, t) => import("./chunks/EntriesList-B5l3Tfhc.js").then((n) => n.loadEntriesList(e.collection, t.query))
}), t.routes.set("/content/:collection/:id", {
	path: "/content/:collection/:id",
	component: r(() => import("./chunks/EntryEditor-D7uST7Ek.js")),
	load: ({ collection: t, id: n }) => Promise.all([e("collections/get", { handle: t }), ...n === "new" ? [] : [e("entries/get", { id: n })]])
}), t.fields.set("title", m), t.fields.set("uri", h), t.widgets.set("recent", r(() => import("./chunks/WidgetRecent-Cm56xZzI.js")));
