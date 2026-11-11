import { n as e, r as t, t as n } from "./names-CcWioF13.js";
import { invalidate as r, loadManifest as i, run as a, t as o, useAbility as s } from "@letterncms/sdk";
import { useRef as c, useState as l } from "react";
import { Dialog as u, Input as d, NoMatches as f, Spinner as p, toast as m } from "@letterncms/ui";
import { jsx as h, jsxs as g } from "react/jsx-runtime";
// admin/src/AddLanguage.tsx
function _(e) {
	let t = e.trim().match(/^([a-z]{2})(?:-([a-z]{2}))?$/i);
	return t ? t[2] ? `${t[1].toLowerCase()}-${t[2].toUpperCase()}` : t[1].toLowerCase() : null;
}
function v({ close: v }) {
	let y = (s("languages/list").data?.languages ?? []).map((e) => e.code), [b, x] = l(""), [S, C] = l(0), [w, T] = l(null), E = w !== null, D = c(null), O = b.trim().toLowerCase(), k = n.filter((e) => !y.includes(e)).map((n) => ({
		code: n,
		name: e(n),
		native: t(n)
	})).filter((e) => !O || `${e.name} ${e.native} ${e.code}`.toLowerCase().includes(O)).sort((e, t) => e.name.localeCompare(t.name)), A = _(b), j = A && !y.includes(A) && !k.some((e) => e.code === A) ? A : null, M = j ? [...k, {
		code: j,
		name: e(j),
		native: t(j)
	}] : k, N = async (t) => {
		if (!E) {
			T(t);
			try {
				await a("languages/create", { code: t }), r("languages/", "entries/", "translations/"), await i(), m.success(o("{language} added", { language: e(t) })), v?.();
			} catch (e) {
				m.error(e), T(null);
			}
		}
	};
	return /* @__PURE__ */ g(u, {
		open: !0,
		onOpenChange: (e) => !e && !E && v?.(),
		size: "sm",
		title: o("Add Language"),
		children: [/* @__PURE__ */ h(d, {
			size: "sm",
			icon: "search",
			autoFocus: !0,
			"aria-label": o("Search Languages"),
			placeholder: o("Search Languages"),
			value: b,
			disabled: E,
			onChange: (e) => {
				x(e.target.value), C(0);
			},
			onKeyDown: (e) => {
				if (e.key === "ArrowDown" || e.key === "ArrowUp") {
					e.preventDefault();
					let t = Math.max(0, Math.min(M.length - 1, S + (e.key === "ArrowDown" ? 1 : -1)));
					C(t), D.current?.children[t]?.scrollIntoView({ block: "nearest" });
				} else e.key === "Enter" && M[S] && (e.preventDefault(), N(M[S].code));
			},
			role: "combobox",
			"aria-expanded": !0,
			"aria-controls": "add-language-options",
			"aria-activedescendant": M[S] ? `add-language-${M[S].code}` : void 0
		}), M.length === 0 ? /* @__PURE__ */ h(f, {
			className: "py-6",
			onClear: () => x("")
		}) : /* @__PURE__ */ h("div", {
			ref: D,
			id: "add-language-options",
			role: "listbox",
			"aria-label": o("Languages"),
			"aria-busy": E,
			className: "-mx-1 mt-2 max-h-72 overflow-y-auto",
			inert: E,
			children: M.map((e, t) => /* @__PURE__ */ g("div", {
				id: `add-language-${e.code}`,
				role: "option",
				"aria-selected": t === S,
				onMouseEnter: () => C(t),
				onClick: () => void N(e.code),
				className: "flex min-h-10 cursor-default items-center gap-3 rounded-xs px-2 text-sm text-text transition-colors duration-base aria-selected:bg-active max-sm:min-h-11",
				children: [/* @__PURE__ */ g("span", {
					className: "min-w-0 flex-1 truncate",
					children: [e.name, e.native !== e.name && /* @__PURE__ */ g("span", {
						className: "text-muted",
						children: [" · ", e.native]
					})]
				}), w === e.code ? /* @__PURE__ */ h(p, { size: 14 }) : /* @__PURE__ */ h("code", {
					className: "shrink-0 text-xs text-faint",
					children: e.code
				})]
			}, e.code))
		})]
	});
}
export { v as default };
