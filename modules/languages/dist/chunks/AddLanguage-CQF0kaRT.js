import { n as e, r as t, t as n } from "./names-CcWioF13.js";
import { invalidate as r, loadManifest as i, run as a, t as o, useAbility as s } from "@letterncms/sdk";
import { useRef as c, useState as l } from "react";
import { Dialog as u, Input as d, toast as f } from "@letterncms/ui";
import { jsx as p, jsxs as m } from "react/jsx-runtime";
// admin/src/AddLanguage.tsx
function h(e) {
	let t = e.trim().match(/^([a-z]{2})(?:-([a-z]{2}))?$/i);
	return t ? t[2] ? `${t[1].toLowerCase()}-${t[2].toUpperCase()}` : t[1].toLowerCase() : null;
}
function g({ close: g }) {
	let _ = (s("languages/list").data?.languages ?? []).map((e) => e.code), [v, y] = l(""), [b, x] = l(0), [S, C] = l(!1), w = c(null), T = v.trim().toLowerCase(), E = n.filter((e) => !_.includes(e)).map((n) => ({
		code: n,
		name: e(n),
		native: t(n)
	})).filter((e) => !T || `${e.name} ${e.native} ${e.code}`.toLowerCase().includes(T)).sort((e, t) => e.name.localeCompare(t.name)), D = h(v), O = D && !_.includes(D) && !E.some((e) => e.code === D) ? D : null, k = O ? [...E, {
		code: O,
		name: e(O),
		native: t(O)
	}] : E, A = async (t) => {
		if (!S) {
			C(!0);
			try {
				await a("languages/add", { code: t }), r("languages/", "entries/", "translations/"), await i(), f.success(o("{language} added", { language: e(t) })), g?.();
			} catch (e) {
				f.error(e), C(!1);
			}
		}
	};
	return /* @__PURE__ */ m(u, {
		open: !0,
		onOpenChange: (e) => !e && !S && g?.(),
		size: "sm",
		title: o("Add Language"),
		children: [/* @__PURE__ */ p(d, {
			size: "sm",
			icon: "search",
			autoFocus: !0,
			"aria-label": o("Search languages"),
			placeholder: o("Search languages…"),
			value: v,
			disabled: S,
			onChange: (e) => {
				y(e.target.value), x(0);
			},
			onKeyDown: (e) => {
				if (e.key === "ArrowDown" || e.key === "ArrowUp") {
					e.preventDefault();
					let t = Math.max(0, Math.min(k.length - 1, b + (e.key === "ArrowDown" ? 1 : -1)));
					x(t), w.current?.children[t]?.scrollIntoView({ block: "nearest" });
				} else e.key === "Enter" && k[b] && (e.preventDefault(), A(k[b].code));
			},
			role: "combobox",
			"aria-expanded": !0,
			"aria-controls": "add-language-options",
			"aria-activedescendant": k[b] ? `add-language-${k[b].code}` : void 0
		}), /* @__PURE__ */ m("div", {
			ref: w,
			id: "add-language-options",
			role: "listbox",
			"aria-label": o("Languages"),
			className: "-mx-1 mt-2 max-h-72 overflow-y-auto",
			children: [k.map((e, t) => /* @__PURE__ */ m("button", {
				id: `add-language-${e.code}`,
				type: "button",
				role: "option",
				"aria-selected": t === b,
				tabIndex: -1,
				disabled: S,
				onMouseEnter: () => x(t),
				onClick: () => void A(e.code),
				className: "flex min-h-8 w-full items-center gap-2 rounded-xs px-2 py-1 text-left text-sm aria-selected:bg-hover",
				children: [/* @__PURE__ */ m("span", {
					className: "min-w-0 flex-1 truncate",
					children: [e.name, e.native !== e.name && /* @__PURE__ */ m("span", {
						className: "text-muted",
						children: [" · ", e.native]
					})]
				}), /* @__PURE__ */ p("code", {
					className: "shrink-0 text-xs text-faint",
					children: e.code
				})]
			}, e.code)), k.length === 0 && /* @__PURE__ */ p("p", {
				className: "m-0 px-2 py-3 text-xs text-muted",
				children: o("No languages match your search.")
			})]
		})]
	});
}
export { g as default };
