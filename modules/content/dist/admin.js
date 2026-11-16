import { getManifest as e, navigate as t, prefetchAbility as n, registry as r, run as i, t as a } from "@letterncms/sdk";
import { lazy as o, useEffect as s, useRef as c, useState as l } from "react";
import { Button as u, Icon as d, Textarea as f, Tooltip as p, fieldControlId as m, slugify as h } from "@letterncms/ui";
import { jsx as g, jsxs as _ } from "react/jsx-runtime";
// admin/src/TitleField.tsx
function v({ field: e, value: t, onChange: n, error: r, disabled: i }) {
	let a = e.onEnter, o = e.onDown;
	return /* @__PURE__ */ g(f, {
		appearance: "plain",
		id: m(e),
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
		className: "text-display font-semibold text-ink placeholder:text-faint/60"
	});
}
function y({ field: e, value: t, onChange: n, disabled: r }) {
	let i = String(e.uri ?? ""), o = t ?? "", [f, v] = l(!1), [y, b] = l(o), x = c(null);
	return s(() => b(o), [o]), /* @__PURE__ */ _("div", {
		className: "flex h-6 w-full min-w-0 items-center gap-1.5 text-sm text-faint",
		children: [/* @__PURE__ */ g(d, {
			name: "link",
			size: 13,
			className: "shrink-0"
		}), f ? /* @__PURE__ */ g("input", {
			ref: x,
			autoFocus: !0,
			id: m(e),
			"aria-describedby": e.describedBy,
			"aria-label": e.label,
			value: y,
			onChange: (e) => b(h(e.target.value, !0)),
			onBlur: () => {
				v(!1);
				let e = h(y);
				e && e !== o && n(e);
			},
			onKeyDown: (e) => {
				e.key === "Enter" && x.current?.blur(), e.key === "Escape" && (b(o), v(!1));
			},
			className: "h-6 w-72 min-w-0 max-w-full rounded-xs border border-focus bg-bg px-1.5 font-mono text-xs text-text outline-none"
		}) : /* @__PURE__ */ g(p, {
			content: i,
			children: /* @__PURE__ */ g(u, {
				variant: "ghost",
				size: "xs",
				id: m(e),
				"aria-describedby": e.describedBy,
				disabled: r || i === "/",
				onClick: () => v(!0),
				"aria-label": i === "/" ? void 0 : a("Edit URL"),
				className: "min-w-0 max-w-full shrink !justify-start !px-1 text-left font-mono !font-normal !text-inherit hover:!text-text disabled:!opacity-100 disabled:hover:!bg-transparent",
				children: /* @__PURE__ */ g("span", {
					className: "truncate",
					children: i
				})
			})
		})]
	});
}
r.routes.set("/content/:collection/:id", {
	path: "/content/:collection/:id",
	component: o(() => import("./chunks/EntryEditor-DUwXEBLo.js")),
	load: ({ collection: e, id: t }) => Promise.all([n("collections/get", { handle: e }), ...t === "new" ? [] : [n("entries/get", { id: t }).catch(() => void 0)]])
}), r.fields.set("title", v), r.fields.set("uri", y), r.widgets.set("recent", o(() => import("./chunks/WidgetRecent-zB1FMBp8.js"))), r.components.set("content/views", o(() => import("./chunks/SavedViews-DKyjftkI.js"))), r.components.set("content/new-entry", o(() => import("./chunks/NewEntry-DHnzMbmA.js")));
var b = (t) => {
	let n = e().collections.find((e) => e.handle === t.collection);
	return {
		id: `entry:${t.id}`,
		kind: "entry",
		label: t.title || a("Untitled"),
		detail: n?.singular,
		icon: n?.icon ?? "file",
		to: `/content/${t.collection}/${t.id}`,
		read: () => i("entries/get", { id: t.id })
	};
};
r.composer.set("entries", {
	trigger: "@",
	label: a("Content"),
	order: 10,
	search: async (e) => (e ? await i("content/search", {
		query: e,
		limit: 6
	}) : await i("content/recent", { limit: 6 })).map(b)
}), r.composer.set("entries-open", {
	trigger: "/",
	label: a("Content"),
	order: 70,
	search: async (e) => e.trim().length < 2 ? [] : (await i("content/search", {
		query: e.trim(),
		limit: 8
	})).map((e) => {
		let { read: n, ...r } = b(e);
		return {
			...r,
			id: `open:${e.id}`,
			detail: e.uri ?? r.detail,
			perform: () => t(r.to)
		};
	})
});
