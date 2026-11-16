import { a as e, c as t, d as n, f as r, g as i, h as a, i as o, l as s, m as c, n as l, o as u, p as d, r as f, t as p, u as m, v as h, y as g } from "./insert-V_nHpAvO.js";
import { Link as _, can as v, getManifest as y, invalidate as b, navigate as x, plural as S, registry as C, requestText as ee, run as w, t as T, useAbility as E, useManifest as D, useManifestIfLoaded as te } from "@letterncms/sdk";
import { Fragment as ne, createContext as re, createElement as ie, forwardRef as O, memo as ae, useCallback as oe, useContext as se, useEffect as k, useId as ce, useLayoutEffect as le, useMemo as A, useRef as j, useState as M, useSyncExternalStore as N } from "react";
import { Button as P, Dialog as ue, Fields as F, Icon as I, IconButton as L, Menu as de, MenuAt as fe, NEW_COLOR as pe, NoMatches as me, Notice as he, PagePreview as ge, PanelHeader as _e, Popover as R, Pressable as z, QueryError as ve, Segmented as ye, Spinner as be, Tabs as xe, Tooltip as B, cn as V, copyText as Se, deviceWidths as Ce, fieldControlId as we, fieldVisible as Te, prompt as Ee, revealOption as De, revealSelected as Oe, slugify as ke, toast as Ae, useShortcutLabel as je, wideFieldTypes as Me } from "@letterncms/ui";
import { Fragment as Ne, jsx as H, jsxs as U } from "react/jsx-runtime";
import { createPortal as Pe, flushSync as Fe } from "react-dom";
import { createRoot as Ie } from "react-dom/client";
// admin/src/core/context.tsx
var W = re(null);
function Le({ value: e, children: t }) {
	return e.store.setReadOnly(!!e.readOnly), /* @__PURE__ */ H(W.Provider, {
		value: e,
		children: t
	});
}
function G() {
	let e = se(W);
	if (!e) throw Error("Block editor context missing");
	return e;
}
function Re() {
	let e = E("blocks/types", {}, { staleTime: 3e5 }), t = A(() => new Map((e.data?.blocks ?? []).map((e) => [e.name, e])), [e.data]);
	return {
		catalog: e.data,
		types: t,
		isLoading: e.isLoading,
		error: e.error,
		retry: () => void e.refetch()
	};
}
function ze() {
	let e = E("components/list", {}, { staleTime: 6e4 });
	return A(() => new Map((e.data ?? []).map((e) => [e.handle, e.title])), [e.data]);
}
function Be(e, t, n) {
	return e.label || (e.type === "component" ? n.get(String(e.props?.ref ?? "")) : void 0) || t.get(e.type)?.title || e.type;
}
// admin/src/core/store.ts
var Ve = class {
	state;
	listeners = /* @__PURE__ */ new Set();
	past = [];
	future = [];
	lastCommit = 0;
	lastGroup = "";
	onChange;
	readOnly;
	constructor(e, t, n = !1) {
		this.onChange = t, this.readOnly = n, this.state = {
			nodes: e,
			selected: null,
			head: null,
			blockMode: !1,
			focus: null,
			device: "desktop",
			canvasWidth: 1280,
			state: [],
			hovered: null
		};
	}
	setReadOnly(e) {
		this.readOnly = e;
	}
	get = () => this.state;
	subscribe = (e) => (this.listeners.add(e), () => this.listeners.delete(e));
	set(e) {
		this.state = {
			...this.state,
			...e
		}, this.listeners.forEach((e) => e());
	}
	reset(e) {
		e !== this.state.nodes && this.set({ nodes: e });
	}
	commit(e, t = "") {
		if (this.readOnly) return;
		let n = Date.now();
		t && t === this.lastGroup && n - this.lastCommit < 800 || (this.past.push(this.state.nodes), this.past.length > 200 && this.past.shift()), this.future = [], this.lastCommit = n, this.lastGroup = t, this.set({ nodes: e }), this.onChange(e);
	}
	undo = () => {
		if (this.readOnly) return;
		let e = this.past.pop();
		e && (this.future.push(this.state.nodes), this.lastGroup = "", this.set({ nodes: e }), this.onChange(e));
	};
	redo = () => {
		if (this.readOnly) return;
		let e = this.future.pop();
		e && (this.past.push(this.state.nodes), this.lastGroup = "", this.set({ nodes: e }), this.onChange(e));
	};
	canUndo = () => !this.readOnly && this.past.length > 0;
	canRedo = () => !this.readOnly && this.future.length > 0;
	select = (e, t = !1) => this.set({
		selected: e,
		head: null,
		blockMode: t
	});
	selection = () => He(this.state);
	extendTo(e) {
		let { selected: t, nodes: n, blockMode: i } = this.state, a = t ? r(n, t) : null, o = r(n, e);
		if (!t || !a || !o || a.parentId !== o.parentId) return this.select(e, i);
		this.set({ head: e === t ? null : e });
	}
	extend(e) {
		let { selected: t, head: n, nodes: a } = this.state, o = t ? r(a, t) : null;
		if (!t || !o) return;
		let s = i(a, o.parentId), c = s.findIndex((e) => e.id === (n ?? t)) + e;
		c >= 0 && c < s.length && this.extendTo(s[c].id);
	}
	removeSelection() {
		let e = this.selection();
		this.commit(e.reduce((e, t) => a(e, t), this.state.nodes)), this.set({
			selected: null,
			head: null
		});
	}
	replaceSelection(e) {
		let t = this.selection(), n = t[0] ? r(this.state.nodes, t[0]) : null;
		if (!n) return;
		let i = t.reduce((e, t) => a(e, t), this.state.nodes);
		this.commit(m(i, n.parentId, n.index, e)), this.set({
			selected: e[0]?.id ?? null,
			head: null
		});
	}
	hover = (e) => this.state.hovered !== e && this.set({ hovered: e });
	setDevice = (e) => this.set({ device: e });
	setCanvasWidth = (e) => this.state.canvasWidth !== e && this.set({ canvasWidth: e });
	setStyleState = (e) => this.set({ state: e });
	focus(e, t = "end", n, r) {
		this.set({
			focus: {
				id: e,
				at: t,
				prop: n,
				index: r,
				nonce: Math.random()
			},
			selected: e,
			blockMode: !1
		});
	}
	clearFocus() {
		this.state.focus && (this.state = {
			...this.state,
			focus: null
		});
	}
	updateProps(e, t, n = "") {
		this.commit(h(this.state.nodes, e, (e) => ({
			...e,
			props: {
				...e.props,
				...t
			}
		})), n || `props:${e}`);
	}
	updateNode(e, t, n = "") {
		this.commit(h(this.state.nodes, e, (e) => ({
			...e,
			...t
		})), n);
	}
	insert(e, t, n) {
		this.commit(m(this.state.nodes, e, t, n));
	}
	insertAfter(e, t) {
		if (!e) return this.insert(null, this.state.nodes.length, t);
		let n = r(this.state.nodes, e);
		if (!n) return this.insert(null, this.state.nodes.length, t);
		this.insert(n.parentId, n.index + 1, t);
	}
	remove(e) {
		this.commit(a(this.state.nodes, e)), this.state.selected === e && this.set({
			selected: null,
			head: null
		});
	}
	move(e, t, n) {
		this.commit(d(this.state.nodes, e, t, n));
	}
	moveTo(n, i, o) {
		let s = this.state.nodes;
		if (i && n.some((t) => t === i || e(s, i).some((e) => e.id === t))) return;
		let c = n.map((e) => t(s, e)).filter((e) => !!e), l = n.filter((e) => {
			let t = r(s, e);
			return t && t.parentId === i && t.index < o;
		}).length, u = m(n.reduce((e, t) => a(e, t), s), i, o - l, c);
		JSON.stringify(u) !== JSON.stringify(s) && this.commit(u);
	}
	nudge(e, t) {
		let n = r(this.state.nodes, e);
		if (!n) return;
		let a = i(this.state.nodes, n.parentId).length, o = n.index + t;
		o < 0 || o >= a || this.move(e, n.parentId, t > 0 ? o + 1 : o);
	}
	nudgeSelection(e) {
		let t = this.selection(), n = t[0] ? r(this.state.nodes, t[0]) : null, a = t.length ? r(this.state.nodes, t.at(-1)) : null;
		if (!n || !a || n.parentId !== a.parentId) return;
		let o = i(this.state.nodes, n.parentId).length;
		e < 0 && n.index === 0 || e > 0 && a.index === o - 1 || this.moveTo(t, n.parentId, e < 0 ? n.index - 1 : a.index + 2);
	}
	duplicate(e) {
		let n = t(this.state.nodes, e);
		if (!n) return;
		let r = u(n);
		this.insertAfter(e, [r]), this.select(r.id);
	}
	duplicateSelection() {
		let e = this.selection(), n = this.state.nodes, i = e.map((e) => t(n, e)).filter((e) => !!e).map(u), a = e.length ? r(n, e.at(-1)) : null;
		a && i.length && (this.insert(a.parentId, a.index + 1, i), this.select(i[0].id, !0), i.length > 1 && this.extendTo(i.at(-1).id));
	}
	wrap(e, n) {
		let i = t(this.state.nodes, e), o = r(this.state.nodes, e);
		if (!i || !o) return;
		let s = {
			...n,
			children: [i]
		};
		this.commit(m(a(this.state.nodes, e), o.parentId, o.index, [s])), this.select(s.id);
	}
	unwrap(e) {
		let n = t(this.state.nodes, e), i = r(this.state.nodes, e);
		n && i && n.children && this.commit(m(a(this.state.nodes, e), i.parentId, i.index, n.children));
	}
};
function He(e) {
	if (!e.selected) return [];
	if (!e.head) return [e.selected];
	let t = r(e.nodes, e.selected);
	if (!t) return [e.selected];
	let n = i(e.nodes, t.parentId), a = n.findIndex((t) => t.id === e.selected), o = n.findIndex((t) => t.id === e.head);
	return o < 0 ? [e.selected] : n.slice(Math.min(a, o), Math.max(a, o) + 1).map((e) => e.id);
}
function Ue(e, t) {
	if (Object.is(e, t)) return !0;
	if (Array.isArray(e) && Array.isArray(t)) return e.length === t.length && e.every((e, n) => Object.is(e, t[n]));
	if (e && t && typeof e == "object" && typeof t == "object") {
		let n = Object.keys(e), r = Object.keys(t);
		return n.length === r.length && n.every((n) => Object.is(e[n], t[n]));
	}
	return !1;
}
function K(e, t) {
	let n = j(null);
	return N(e.subscribe, () => {
		let r = t(e.get());
		return n.current && Ue(n.current.value, r) ? n.current.value : (n.current = { value: r }, r);
	});
}
// admin/src/core/uniqueIds.ts
function We(e, t) {
	let n = /* @__PURE__ */ new Set(), r = (e) => {
		let i = !1, a = e.map((e) => {
			let a = n.has(e.id) ? t() : e.id;
			n.add(a);
			let o = e.children && r(e.children);
			return a === e.id && o === e.children ? e : (i = !0, {
				...e,
				id: a,
				children: o
			});
		});
		return i ? a : e;
	};
	return r(e);
}
// admin/src/core/useBlockSession.ts
function Ge(e, t, n) {
	let r = j(t);
	r.current = t;
	let [i] = M(() => new Ve(We(Array.isArray(e) ? e : [], g), (e) => r.current(e), n)), a = j(e);
	return i.setReadOnly(n), k(() => {
		if (a.current === e) return;
		a.current = e;
		let t = We(Array.isArray(e) ? e : [], g);
		JSON.stringify(t) !== JSON.stringify(i.get().nodes) && i.reset(t);
	}, [i, e]), i;
}
// tailwind/engine.ts
function q(e) {
	let t = [], n = 0, r = 0;
	for (let i = 0; i < e.length; i++) {
		let a = e[i];
		a === "[" || a === "(" ? n++ : a === "]" || a === ")" ? n-- : a === ":" && n === 0 && (t.push(e.slice(r, i)), r = i + 1);
	}
	return {
		raw: e,
		variants: t,
		utility: e.slice(r)
	};
}
function J(e) {
	return [...e].sort().join(":");
}
function Ke(e, t) {
	return [...e, t].join(":");
}
function qe(e) {
	return (e ?? "").split(/\s+/).filter(Boolean);
}
function Je(e) {
	return e.trim().replace(/_/g, "\\_").replace(/\s+/g, "_");
}
var Ye = {
	padding: "p",
	"padding-inline": "px",
	"padding-block": "py",
	"padding-top": "pt",
	"padding-right": "pr",
	"padding-bottom": "pb",
	"padding-left": "pl",
	margin: "m",
	"margin-inline": "mx",
	"margin-block": "my",
	"margin-top": "mt",
	"margin-right": "mr",
	"margin-bottom": "mb",
	"margin-left": "ml",
	gap: "gap",
	"column-gap": "gap-x",
	"row-gap": "gap-y",
	width: "w",
	height: "h",
	"min-width": "min-w",
	"max-width": "max-w",
	"min-height": "min-h",
	"max-height": "max-h",
	inset: "inset",
	top: "top",
	right: "right",
	bottom: "bottom",
	left: "left",
	"z-index": "z",
	order: "order",
	"flex-basis": "basis",
	flex: "flex",
	"flex-grow": "grow",
	"flex-shrink": "shrink",
	"grid-template-columns": "grid-cols",
	"grid-template-rows": "grid-rows",
	"grid-column": "col",
	"grid-row": "row",
	"grid-auto-columns": "auto-cols",
	"grid-auto-rows": "auto-rows",
	columns: "columns",
	"aspect-ratio": "aspect",
	"font-family": "font",
	"font-size": "text",
	"font-weight": "font",
	"line-height": "leading",
	"letter-spacing": "tracking",
	color: "text",
	"text-decoration-color": "decoration",
	"text-decoration-thickness": "decoration",
	"text-underline-offset": "underline-offset",
	"text-indent": "indent",
	"text-shadow": "text-shadow",
	"list-style-type": "list",
	"vertical-align": "align",
	content: "content",
	"background-color": "bg",
	"background-image": "bg",
	"background-size": "bg",
	"background-position": "bg",
	"border-color": "border",
	"border-width": "border",
	"border-top-width": "border-t",
	"border-right-width": "border-r",
	"border-bottom-width": "border-b",
	"border-left-width": "border-l",
	"border-radius": "rounded",
	"border-top-left-radius": "rounded-tl",
	"border-top-right-radius": "rounded-tr",
	"border-bottom-right-radius": "rounded-br",
	"border-bottom-left-radius": "rounded-bl",
	"outline-color": "outline",
	"outline-width": "outline",
	"outline-offset": "outline-offset",
	opacity: "opacity",
	"box-shadow": "shadow",
	filter: "filter",
	"backdrop-filter": "backdrop-filter",
	"mix-blend-mode": "mix-blend",
	cursor: "cursor",
	"accent-color": "accent",
	fill: "fill",
	stroke: "stroke",
	"stroke-width": "stroke",
	"transform-origin": "origin",
	translate: "translate",
	rotate: "rotate",
	scale: "scale",
	perspective: "perspective",
	"perspective-origin": "perspective-origin",
	"transition-property": "transition",
	"transition-duration": "duration",
	"transition-timing-function": "ease",
	"transition-delay": "delay",
	"will-change": "will-change",
	"object-position": "object",
	"scroll-margin-top": "scroll-mt",
	"scroll-padding": "scroll-p",
	"mask-image": "mask",
	"line-clamp": "line-clamp",
	"-webkit-line-clamp": "line-clamp"
}, Xe = {
	"font-size": "length",
	color: "color",
	"font-family": "family-name",
	"font-weight": "number",
	"background-color": "color",
	"background-image": "image",
	"background-size": "size",
	"background-position": "position",
	"border-color": "color",
	"border-width": "length",
	"outline-color": "color",
	"outline-width": "length",
	"text-decoration-color": "color",
	"text-decoration-thickness": "length",
	stroke: "color",
	"stroke-width": "length"
}, Ze = class {
	css = /* @__PURE__ */ new Map();
	groups = /* @__PURE__ */ new Map();
	exact = null;
	ds;
	constructor(e) {
		this.ds = e;
	}
	declarations(e) {
		let t = this.css.get(e);
		if (t === void 0) {
			let [n] = this.ds.candidatesToCss([e]);
			t = n === null ? null : nt(n), this.css.set(e, t);
		}
		return t;
	}
	valid(e) {
		return this.ds.candidatesToCss([e])[0] !== null;
	}
	group(e) {
		let t = this.groups.get(e);
		if (t === void 0) {
			let n = this.declarations(e.replace(/^!|!$/g, ""));
			if (n === null) t = null;
			else {
				let r = n.filter((e) => !e.property.startsWith("--")), i = n.filter((e) => e.property.startsWith("--")).map((e) => e.property), a = r.find((e) => !e.value.includes("var(--tw-")) ?? r[0], o = a ? i.filter((e) => r.some((t) => t.value.includes(e))) : i;
				t = [a?.property, ...o.sort()].filter(Boolean).join("|") || e;
			}
			this.groups.set(e, t);
		}
		return t;
	}
	find(e, t, n) {
		let r = J(t), i = null;
		for (let t of e) {
			let e = q(t);
			J(e.variants) === r && this.group(e.utility) === n && (i = t);
		}
		return i;
	}
	put(e, t, n, r) {
		let i = J(t), a = e.filter((e) => {
			let t = q(e);
			return J(t.variants) !== i || this.group(t.utility) !== n;
		});
		return r && a.push(Ke(t, r)), a;
	}
	make(e, t, n) {
		let r = t.trim();
		if (r === "") return null;
		let i = r.startsWith("-") && /^-[\d.]/.test(r) ? `-${e}-${r.slice(1)}` : `${e}-${r}`;
		if (/^[\w./%-]+$/.test(r) && this.declarations(i) !== null) return i;
		let a = `${e}-[${n ? `${n}:` : ""}${Je(r)}]`;
		return this.declarations(a) === null ? null : a;
	}
	utilityFor(e, t) {
		let n = Ye[e], r = n ? tt(t) : null;
		if (n && r) {
			let t = this.make(n, r.alpha === void 0 ? r.key : `${r.key}/${r.alpha}`);
			if (t && this.declarations(t)?.some((t) => t.property === e && t.value.includes(r.variable))) return t;
		}
		let i = Qe(this.resolve(t)), a = this.index().get(`${e}:${i}`);
		if (a) return a;
		if (n) for (let [t, r] of this.ds.theme.entries()) {
			let a = Qe(r.value) === i ? tt(`var(${t})`)?.key : void 0, o = a ? this.make(n, a) : null;
			if (o && Qe(this.resolve(this.value(o, e) ?? "")) === i) return o;
		}
		let o = n ? this.make(n, t) : null, s = o && this.declarations(o)?.some((t) => t.property === e) ? o : n ? this.make(n, t, Xe[e]) : null, c = (t) => t.includes("[") ? this.declarations(t)?.some((t) => t.property === e) : Qe(this.resolve(this.value(t, e) ?? "")) === i;
		if (s && c(s)) return s;
		let l = n ? `${n}-[${Xe[e] ? `${Xe[e]}:` : ""}${Je(t)}]` : null;
		return l && l !== s && c(l) ? l : `[${e}:${Je(t)}]`;
	}
	value(e, t) {
		let n = this.declarations(e), r = n?.find((e) => e.property === t);
		if (!n || !r) return;
		let i = r.value;
		if (i.includes("var(--tw-")) {
			let e = n.filter((e) => e.property.startsWith("--tw-") && i.includes(`var(${e.property}`));
			e.length === 1 && (i = e[0].value.replace(/var\(--tw-[\w-]+,\s*((?:[^()]|\([^()]*\))*)\)/g, "$1"));
		}
		let a = /^calc\(var\(--spacing\) \* (-?[\d.]+)\)$/.exec(i);
		if (a) {
			let e = /^([\d.]+)rem$/.exec(this.ds.resolveThemeValue("--spacing") ?? "");
			return e ? `${+(Number(e[1]) * Number(a[1]) * 16).toFixed(3)}px` : this.resolve(i);
		}
		return i;
	}
	tokens(e) {
		let t = [];
		for (let [n, r] of this.ds.theme.entries()) {
			let i = et(e, n);
			i !== null && t.push({
				group: e,
				name: i,
				variable: n,
				ref: `var(${n})`,
				value: r.value
			});
		}
		return t;
	}
	sort(e) {
		let t = new Map(this.ds.getClassOrder(e));
		return [...e].sort((e, n) => {
			let r = t.get(e) ?? null, i = t.get(n) ?? null;
			return r === null || i === null ? r === i ? 0 : r === null ? -1 : 1 : r < i ? -1 : +(r > i);
		});
	}
	index() {
		if (this.exact) return this.exact;
		let e = /* @__PURE__ */ new Map(), t = this.ds.getClassList().map(([e]) => e), n = this.ds.candidatesToCss(t);
		return t.forEach((t, r) => {
			if (n[r] === null) return;
			let i = nt(n[r]);
			if (this.css.set(t, i), i.length !== 1 || n[r].indexOf("{") !== n[r].lastIndexOf("{")) return;
			let a = `${i[0].property}:${Qe(this.resolve(i[0].value))}`, o = e.get(a);
			(!o || t.length < o.length) && e.set(a, t);
		}), this.exact = e;
	}
	resolve(e) {
		let t = e;
		for (let e = 0; e < 4 && t.includes("var(--"); e++) t = t.replace(/var\((--[\w-]+)(?:,[^()]*)?\)/g, (e, t) => this.ds.resolveThemeValue(t) ?? e);
		return t.replace(/calc\(([\d.]+)(rem|px|em) \* (-?[\d.]+)\)/g, (e, t, n, r) => `${+(Number(t) * Number(r)).toFixed(4)}${n}`);
	}
};
function Qe(e) {
	return e.trim().toLowerCase().replace(/\s+/g, " ").replace(/(^|[^\w.-])(-?\d*\.?\d+)px\b/g, (e, t, n) => `${t}${+(Number(n) / 16).toFixed(4)}rem`).replace(/(^|[^\d.])0(?:rem|em)\b/g, "$10");
}
var $e = {
	color: "--color-",
	font: "--font-",
	text: "--text-",
	weight: "--font-weight-",
	leading: "--leading-",
	tracking: "--tracking-",
	spacing: "--spacing-",
	radius: "--radius-",
	shadow: "--shadow-",
	container: "--container-",
	breakpoint: "--breakpoint-",
	ease: "--ease-"
};
function et(e, t) {
	let n = $e[e];
	if (!t.startsWith(n)) return null;
	let r = t.slice(n.length);
	return r === "" || r.includes("--") || e === "font" && r.startsWith("weight-") ? null : r;
}
function tt(e) {
	let t = e.trim(), n = /^var\((--[\w-]+)\)$/.exec(t), r = n ? null : /^color-mix\(in \w+, var\((--color-[\w-]+)\) ([\d.]+)%, transparent\)$/.exec(t), i = n?.[1] ?? r?.[1];
	if (!i) return null;
	let a = Object.values($e).filter((e) => i.startsWith(e)).sort((e, t) => t.length - e.length)[0];
	return a ? {
		variable: i,
		key: i.slice(a.length),
		...r ? { alpha: r[2] } : {}
	} : null;
}
function nt(e) {
	let t = e.indexOf("{"), n = [], r = 0, i = t + 1, a = null;
	for (let o = t + 1; o < e.length; o++) {
		let t = e[o];
		if (a) t === "\\" ? o++ : t === a && (a = null);
		else if (t === "\"" || t === "'") a = t;
		else if (t === "(") r += 100;
		else if (t === ")") r -= 100;
		else if (t === "{") r++, i = o + 1;
		else if (t === "}") {
			if (r === 0) break;
			r--, i = o + 1;
		} else if (t === ";" && r % 100 == 0) {
			if (r === 0) {
				let t = e.slice(i, o), r = t.indexOf(":");
				r > 0 && !t.trimStart().startsWith("@") && n.push({
					property: t.slice(0, r).trim(),
					value: t.slice(r + 1).trim()
				});
			}
			i = o + 1;
		}
	}
	return n;
}
function rt(e, t = 1280) {
	return {
		variant: "",
		width: t,
		sizes: e
	};
}
function it(e) {
	let t = /^(-?\d*\.?\d+)(px|rem|em)?$/.exec(e.trim());
	return t ? Number(t[1]) * (t[2] === "rem" || t[2] === "em" ? 16 : 1) : null;
}
function at(e, t) {
	if (e in t) return { from: t[e] };
	let n = /^(min|max)-(?:\[(.+)\]|(.+))$/.exec(e);
	if (!n) return null;
	let r = n[2] === void 0 ? n[3] in t ? t[n[3]] : null : it(n[2]);
	return r === null ? null : n[1] === "min" ? { from: r } : { below: r };
}
var ot = class e {
	engine;
	classes;
	variants;
	screen;
	state;
	order = null;
	constructor(e, t, n, r) {
		this.engine = e, this.classes = t, this.screen = n, this.state = r, this.variants = [...n.variant ? [n.variant] : [], ...r];
	}
	split(e) {
		let { variants: t, utility: n } = q(e), r = !0, i = [];
		for (let e of t) {
			let t = at(e, this.screen.sizes);
			t ? ("from" in t ? this.screen.width < t.from : this.screen.width >= t.below) && (r = !1) : i.push(e);
		}
		return {
			holds: r,
			rest: J(i),
			utility: n.replace(/^!|!$/g, ""),
			variants: t
		};
	}
	rank(e) {
		return this.order ??= new Map(this.engine.ds.getClassOrder(this.classes)), this.order.get(e) ?? null;
	}
	find(e) {
		let t = J(this.variants);
		for (let n of this.state.length ? [J(this.state), ""] : [""]) {
			let r = null;
			if (this.classes.forEach((t, i) => {
				let a = this.split(t);
				if (!a.holds || a.rest !== n) return;
				let o = this.engine.value(a.utility, e);
				if (o === void 0 || st(o)) return;
				let s = this.rank(t);
				(!r || s !== null && (r.rank === null || s > r.rank || s === r.rank && i > r.index) || s === null && r.rank === null && i > r.index) && (r = {
					raw: t,
					value: o,
					rank: s,
					index: i
				});
			}), r) {
				let e = r;
				return {
					value: e.value,
					from: e.raw,
					own: J(q(e.raw).variants) === t
				};
			}
		}
	}
	target(e) {
		let t = this.find(e);
		if (!t || t.own) return this.variants;
		let { variants: n, utility: r } = q(t.from);
		if (J(n.filter((e) => !at(e, this.screen.sizes))) !== J(this.state)) return this.variants;
		let i = Ke(this.variants, r), [, a] = this.engine.sort([t.from, i]);
		return a === t.from && i !== t.from ? n : this.variants;
	}
	set(t) {
		let n = this.classes;
		for (let [r, i] of Object.entries(t)) {
			let t = i == null ? "" : String(i).trim(), a = new e(this.engine, n, this.screen, this.state).target(r);
			if (t === "") {
				let e = J(a);
				n = n.filter((t) => {
					let n = q(t);
					return J(n.variants) !== e || this.engine.group(n.utility)?.split("|")[0] !== r;
				});
			} else {
				let e = this.engine.utilityFor(r, t);
				n = this.engine.put(n, a, this.engine.group(e) ?? e, e);
			}
		}
		return n;
	}
	get(e) {
		let t = this.engine.group(e), n = t ? this.engine.find(this.classes, this.variants, t) : null;
		return n ? q(n).utility : null;
	}
	put(e, t) {
		let n = this.engine.group(t ?? e);
		return n ? this.engine.put(this.classes, this.variants, n, t) : this.classes;
	}
	own() {
		let e = J(this.variants), t = /* @__PURE__ */ new Set();
		for (let n of this.classes) {
			let r = q(n);
			if (J(r.variants) === e) for (let e of this.engine.declarations(r.utility) ?? []) e.property.startsWith("--") || t.add(e.property);
		}
		return [...t];
	}
};
function st(e) {
	if (!e.startsWith("var(--tw-")) return !1;
	let t = 0;
	for (let n = 0; n < e.length; n++) if (e[n] === "(") t++;
	else if (e[n] === ")" && --t === 0) return n === e.length - 1;
	return !1;
}
// admin/src/builder/styleApi.ts
var Y = (e) => e.startsWith("-") ? e : e.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`), ct = (e) => e.startsWith("-") ? e : e.replace(/-([a-z])/g, (e, t) => t.toUpperCase()), lt = (e) => e.replace(/^!|!$/g, "");
function ut(e) {
	let t = e.trim();
	for (let e = 0; e < 3; e++) {
		let e = t.replace(/var\(--tw-[\w-]+,\s*((?:[^()]|\((?:[^()]|\([^()]*\))*\))+)\)/g, "$1").replace(/calc\((\d+) \/ (\d+) \* 100%\)/g, (e, t, n) => `${+(Number(t) / Number(n) * 100).toFixed(4)}%`).replace(/calc\((-?[\d.]+)([a-z%]*) \* -1\)/g, (e, t, n) => `${-Number(t)}${n}`);
		if (e === t) break;
		t = e;
	}
	return t;
}
var dt = (e) => e?.match(/^[a-zA-Z-]+\((.*)\)$/)?.[1];
function ft(e, t, n, r, i) {
	let a = [...n.variant ? [n.variant] : [], ...r], o = J(a), s = t.map((e) => {
		let { variants: t, utility: n } = q(e);
		return {
			raw: e,
			layer: J(t),
			utility: lt(n)
		};
	}), c = e ? new ot(e, t, n, r) : null, l = (e) => {
		let t = c?.find(Y(e));
		return t ? {
			value: ut(t.value),
			own: t.own
		} : void 0;
	}, u = (n, r) => {
		!e || n.length === t.length && n.every((e, n) => e === t[n]) || i(e.sort([...new Set(n)]), r);
	}, d = (t) => new ot(e, t, n, r), f = {
		engine: e,
		classes: t,
		variants: a,
		screen: n,
		state: r,
		value: (e) => l(e)?.value,
		status: (e) => {
			let t = l(e);
			return t ? t.own ? "own" : "inherited" : "none";
		},
		set: (e, t) => f.write({ [e]: t }),
		write: (n, r) => {
			if (!e) return;
			let i = Object.fromEntries(Object.entries(n).map(([e, t]) => [Y(e), typeof t == "string" ? t.replace(/"/g, "'") : t])), a = "width" in i || "height" in i ? pt(e, t, o) : t;
			u(d(a).set(i), r ?? Object.keys(n).join(","));
		},
		own: () => e ? d(t).own().map(ct) : [],
		get: (n) => e ? d(t).get(n) : null,
		put: (n, r, i) => {
			e && u(d(t).put(n, r), i ?? n);
		},
		swap: (t, n, r) => {
			if (!e) return;
			let i = Array.isArray(t) ? t : [t], c = s.filter((t) => t.layer !== o || !e.declarations(t.utility)?.some((e) => i.includes(e.property))).map((e) => e.raw), l = (Array.isArray(n) ? n : [n]).filter((e) => !!e);
			u([...c, ...l.map((e) => Ke(a, e))], r ?? i.join(","));
		},
		apply: (n, r) => {
			e && !(n.length === t.length && n.every((e, n) => e === t[n])) && i(n, r);
		},
		edit: (i, a) => {
			if (!e) return;
			let o = t, s = () => ft(e, o, n, r, (e) => {
				o = e;
			});
			i({
				set: (e, t) => s().set(e, t),
				write: (e) => s().write(e),
				put: (e, t) => s().put(e, t),
				swap: (e, t) => s().swap(e, t),
				value: (e) => s().value(e)
			}), u(o, a ?? "edit");
		}
	};
	return f;
}
function pt(e, t, n) {
	return t.flatMap((t) => {
		let { variants: r, utility: i } = q(t);
		if (J(r) !== n || !/^-?size-/.test(lt(i))) return [t];
		let a = ["w", "h"].map((e) => i.replace("size-", `${e}-`));
		return a.every((t) => e.valid(t)) ? a.map((e) => Ke(r, e)) : [t];
	});
}
function mt(e, t, n, r) {
	let i = n.trim();
	if (i === "") return null;
	let a = (t) => e.declarations(t) === null ? null : t, o = tt(i), s = o ? e.make(t, o.alpha === void 0 ? o.key : `${o.key}/${o.alpha}`) : null;
	if (s && !s.includes("[")) return s;
	if (/^currentcolor$/i.test(i) && a(`${t}-current`)) return `${t}-current`;
	let c = /^(-?)(\d*\.?\d+)([a-z%]*)$/i.exec(i);
	if (c) {
		let [, n, i, o] = c, s = Number(i), l = (e) => (e === 1 && r === "px" && !n ? a(t) : null) ?? a(`${n}${t}-${+e.toFixed(4)}`), u = null;
		if (r === "spacing" && s === 0) u = l(0);
		else if (r === "spacing" && (o === "px" || o === "rem")) {
			let t = /^([\d.]+)rem$/.exec(e.ds.resolveThemeValue("--spacing") ?? ""), n = t ? (o === "px" ? s / 16 : s) / Number(t[1]) : NaN;
			Number.isInteger(n * 2) && (u = l(n));
		} else if (r === "spacing" && o === "%") {
			let e = ht[String(+s.toFixed(2))];
			e && (u = a(`${n}${t}-${e}`));
		} else r === "px" && (o === "px" || o === "" && s === 0) || r === "deg" && (o === "deg" || o === "") ? u = l(s) : r === "ms" && (o === "ms" || o === "s") ? u = l(o === "s" ? s * 1e3 : s) : r === "percent" && o === "%" ? u = l(s) : r === "percent" && o === "" ? u = l(s * 100) : r === "number" && o === "" && (u = l(s));
		if (u) return u;
	}
	return e.make(t, i);
}
var ht = {
	100: "full",
	50: "1/2",
	25: "1/4",
	75: "3/4",
	"33.33": "1/3",
	"66.67": "2/3",
	20: "1/5",
	40: "2/5",
	60: "3/5",
	80: "4/5"
}, gt = {
	"to top": "0deg",
	"to right": "90deg",
	"to bottom": "180deg",
	"to left": "270deg"
}, _t = {
	"to top": "t",
	"to top right": "tr",
	"to right": "r",
	"to bottom right": "br",
	"to bottom": "b",
	"to bottom left": "bl",
	"to left": "l",
	"to top left": "tl",
	"0deg": "t",
	"90deg": "r",
	"180deg": "b",
	"270deg": "l"
}, vt = [
	"background-image",
	"--tw-gradient-from",
	"--tw-gradient-via",
	"--tw-gradient-to",
	"--tw-gradient-from-position",
	"--tw-gradient-via-position",
	"--tw-gradient-to-position"
];
function yt(e, t) {
	let n = () => {
		let n = `${t.kind}-gradient(${[t.angle, ...t.stops.map((e) => `${e.color}${e.at ? ` ${e.at}` : ""}`)].filter(Boolean).join(", ")})`, r = e.make("bg", n);
		return [r && e.declarations(r)?.some((e) => e.property === "background-image") ? r : e.utilityFor("background-image", n)];
	};
	if (t.kind !== "linear" || t.stops.length < 2 || t.stops.length > 3) return n();
	let r = t.angle.trim().replace(/\s+/g, " "), i = /^(-?\d+)deg$/.exec(r), a = _t[r] ? `bg-linear-to-${_t[r]}` : i ? `${i[1].startsWith("-") ? "-" : ""}bg-linear-${i[1].replace("-", "")}` : null;
	if (!a || e.declarations(a) === null) return n();
	let o = t.stops.length === 3 ? [
		"from",
		"via",
		"to"
	] : ["from", "to"], s = [a];
	for (let [r, i] of t.stops.entries()) {
		let t = mt(e, o[r], i.color, "number"), a = i.at ? e.make(o[r], i.at) : null;
		if (!t || i.at && !a) return n();
		s.push(t, ...a ? [a] : []);
	}
	return s;
}
function bt(e) {
	let t = e("--tw-gradient-position"), n = e("--tw-gradient-from"), r = e("--tw-gradient-to");
	if (!t && !n && !r) return;
	let i = e("--tw-gradient-via"), a = (t, n) => {
		let r = e(`--tw-gradient-${n}-position`);
		return `${t ?? "transparent"}${r ? ` ${r}` : ""}`;
	}, o = (t ?? "to bottom").replace(/\s+in\s+[\w-]+(\s+\w+\s+hue)?$/, "");
	return `linear-gradient(${[
		gt[o] ?? o,
		a(n, "from"),
		...i ? [a(i, "via")] : [],
		a(r, "to")
	].join(", ")})`;
}
function xt(e) {
	return new Set(e.flatMap((e) => q(e).variants));
}
function St(e, t) {
	let n = J(t);
	return e.some((e) => J(q(e).variants) === n);
}
function Ct(e, t) {
	return q(e).variants.length ? e : Ke(t, e);
}
function wt(e, t, n) {
	let r = new Set(n), i = {
		site: [],
		utilities: []
	};
	for (let n of t) {
		let { utility: t } = q(n);
		r.has(lt(t)) || e && !e.valid(n) ? i.site.push(n) : i.utilities.push(n);
	}
	return i;
}
var Tt = (e) => /^[^\s"<>`\u0000-\u001f\u007f]{1,200}$/.test(e), Et = (e, t) => !Tt(t) || !!e && /[:[\]/()]/.test(t) && !e.valid(t), Dt = /* @__PURE__ */ new WeakMap();
function Ot(e) {
	let t = Dt.get(e);
	return t || Dt.set(e, t = e.ds.getClassList().map(([e]) => e)), t;
}
var kt = 40;
function At(e, t, n, r) {
	let i = n.trim().toLowerCase(), a = t.filter((e) => !r.has(e) && e.toLowerCase().includes(i));
	if (!i) return a.slice(0, kt);
	let o = new Set(t), s = [], c = [];
	for (let t of Ot(e)) {
		if (o.has(t) || r.has(t)) continue;
		let e = t.indexOf(i);
		if (e === 0 ? s.push(t) : e > 0 && c.length < kt && c.push(t), s.length >= kt) break;
	}
	let l = n.trim(), u = [
		...a,
		...s.sort((e, t) => e.length - t.length),
		...c
	];
	return !l || r.has(l) || u.includes(l) || !Tt(l) || Et(e, l) ? u.slice(0, kt) : e.valid(l) ? [l, ...u].slice(0, kt) : [...u.slice(0, 39), l];
}
function jt(e, t) {
	let n = (e) => [
		...Object.keys(e.logic?.states ?? {}),
		...Object.keys(e.bind ?? {}).filter((e) => e.startsWith("state:")).map((e) => e.slice(6)),
		...e.logic?.behaviors?.scroll ? ["scrolled", ...e.logic.behaviors.scroll.hide ? ["hidden"] : []] : [],
		...e.logic?.behaviors?.spy ? ["current"] : []
	];
	return {
		own: [...new Set(n(e))],
		inherited: [...new Set(t.flatMap(n))]
	};
}
function Mt(e) {
	let t = [], n = /* @__PURE__ */ new Map();
	for (let r of e) {
		let e = /^(.+)-(\d{2,3})$/.exec(r.name);
		e ? n.set(e[1], [...n.get(e[1]) ?? [], r]) : t.push(r);
	}
	let r = (e) => e.name === "black" || e.name === "white";
	return {
		own: [...t.filter((e) => !r(e)), ...t.filter(r)],
		families: [...n].map(([e, t]) => ({
			name: e,
			shades: t
		}))
	};
}
function Nt(e) {
	let t = e.trim();
	if (!t.startsWith("light-dark(") || !t.endsWith(")")) return { light: t };
	let n = t.slice(11, -1), r = 0;
	for (let e = 0; e < n.length; e++) if (n[e] === "(") r++;
	else if (n[e] === ")") r--;
	else if (n[e] === "," && r === 0) return {
		light: n.slice(0, e).trim(),
		dark: n.slice(e + 1).trim()
	};
	return { light: t };
}
var Pt = [
	0,
	1,
	2,
	3,
	4,
	6,
	8,
	12,
	16,
	20,
	24,
	32
];
function Ft(e, t) {
	let n = /^([\d.]+)rem$/.exec(e?.ds.resolveThemeValue("--spacing") ?? "");
	return {
		scale: n ? Pt.map((e) => {
			let t = +(Number(n[1]) * e * 16).toFixed(3);
			return {
				label: String(t),
				value: `${t}px`,
				title: `${e} · ${t}px`
			};
		}) : [],
		named: t.map((e) => ({
			label: e.name,
			value: e.ref,
			title: `${e.variable} · ${e.value}`
		}))
	};
}
var It = /* @__PURE__ */ new Set([
	"hover",
	"active",
	"focus",
	"focus-visible",
	"focus-within"
]);
function Lt(e, t) {
	return t.length === 0 || !t.every((e) => It.has(e)) ? [] : e.flatMap((e) => {
		let { variants: n, utility: r } = q(e);
		return t.every((e) => n.includes(e)) ? [Ke(n.filter((e) => !t.includes(e)), r.endsWith("!") || r.startsWith("!") ? r : `${r}!`)] : [];
	});
}
// tailwind/stylesheet.ts
function X(e, t = 0, n = e.length) {
	let r = [], i = -1, a = 0, o = -1;
	for (let s = t; s < n; s++) {
		let t = e[s];
		if (t === "/" && e[s + 1] === "*") {
			let t = e.indexOf("*/", s + 2);
			s = t === -1 ? n : t + 1;
		} else if (t === "\"" || t === "'") for (i === -1 && (i = s), s++; s < n && e[s] !== t; s++) e[s] === "\\" && s++;
		else {
			if (i === -1) {
				if (/\s/.test(t)) continue;
				i = s;
			}
			t === "{" ? a++ === 0 && (o = s) : t === "}" ? --a === 0 && (r.push({
				start: i,
				end: s + 1,
				prelude: e.slice(i, o).trim(),
				inner: [o + 1, s]
			}), i = -1) : t === ";" && a === 0 && (r.push({
				start: i,
				end: s + 1,
				prelude: e.slice(i, s).trim()
			}), i = -1);
		}
	}
	return r;
}
var Rt = /\/\*[ \t]*group:[ \t]*([^*\n]*?)[ \t]*\*\/\s*$/, zt = (e, t) => /[ \t]*$/.exec(e.slice(0, t))[0], Bt = [
	"body",
	"h1",
	"h2",
	"h3",
	"h4",
	"h5",
	"h6",
	"p",
	"a",
	"strong",
	"small",
	"blockquote",
	"code",
	"figcaption",
	"hr",
	"::selection",
	":focus-visible"
], Vt = ":root, [data-theme]", Ht = (e) => `.cms-prose ${e}:where(:not(.cms-box, .cms-repeat))`, Ut = {
	spacing: ".cms-prose",
	h2: Ht("h2"),
	h3: Ht("h3"),
	p: Ht("p"),
	li: ".cms-prose :where(ul:not(.cms-box, .cms-repeat), ol:not(.cms-box, .cms-repeat)) > li",
	blockquote: Ht("blockquote"),
	figure: Ht("figure"),
	a: Ht("a")
}, Wt = {
	base: [...Bt, Vt],
	components: Object.values(Ut)
}, Gt = "color|font(?!-weight-)|text(?!-shadow-)|tracking|leading|breakpoint|container|spacing|radius|shadow|inset-shadow|drop-shadow|text-shadow|blur|perspective|ease|animate|duration|control", Kt = RegExp(`^--(?:(?:${Gt})-(?!.*--)[a-z0-9][\\w.-]*|spacing|default-transition-duration|default-transition-timing-function)$`), qt = RegExp(`^--(?:(?:${Gt})-)?\\*$`), Jt = (e) => Kt.test(e);
function Yt(e) {
	let t = new Zt(e);
	return X(e).filter((e) => e.inner && /^@theme\b/.test(e.prelude)).flatMap((e) => t.declarationsOf(e));
}
function Xt(e) {
	let t = [], n = {
		"}": "{",
		")": "(",
		"]": "["
	};
	for (let r = 0; r < e.length; r++) {
		let i = e[r];
		if (i === "/" && e[r + 1] === "*") {
			let t = e.indexOf("*/", r + 2);
			if (t === -1) return !1;
			r = t + 1;
		} else if (i === "\"" || i === "'") {
			for (r++; r < e.length && e[r] !== i; r++) e[r] === "\\" && r++;
			if (r >= e.length) return !1;
		} else if (i === "{" || i === "(" || i === "[") t.push(i);
		else if (i in n && t.pop() !== n[i]) return !1;
	}
	return t.length === 0;
}
var Zt = class e {
	css;
	constructor(e) {
		this.css = e;
	}
	variables() {
		return this.themes().flatMap((e) => this.declarations(e).map(({ name: e, value: t }) => ({
			name: e,
			value: t
		})));
	}
	variable(e) {
		return this.variables().findLast((t) => t.name === e)?.value;
	}
	setVariable(e, t, n = "last") {
		let r = this.themes();
		for (let n of [...r].reverse()) {
			let r = this.declarations(n).findLast((t) => t.name === e);
			if (r) return t === null ? this.splice(this.lineStart(r.start), this.lineEnd(r.end), "") : this.splice(r.start, r.end, `${e}: ${t};`);
		}
		if (t === null) return this;
		let i = r[0];
		if (!i) return this.append(`@theme {\n  ${e}: ${t};\n}`, "after-imports");
		let a = this.declarations(i).filter((t) => Qt(t.name) === Qt(e));
		if (n === "first" && a[0]) return this.splice(a[0].start, a[0].start, `${e}: ${t};\n${zt(this.css, a[0].start)}`);
		let o = a[a.length - 1];
		if (o) {
			let n = this.css.indexOf("\n", o.end), r = n === -1 || n > i.inner[1] ? o.end : n;
			return this.splice(r, r, `\n${zt(this.css, o.start)}${e}: ${t};`);
		}
		return this.insertLast(i, `  ${e}: ${t};`);
	}
	renameVariable(t, n) {
		let r = this, i = this.themes().flatMap((e) => this.declarations(e)).filter((e) => e.name === t || e.name.startsWith(`${t}--`));
		if (i.length === 0) return this;
		for (let e of i.sort((e, t) => t.start - e.start)) r = r.splice(e.start, e.start + e.name.length, n + e.name.slice(t.length));
		let a = RegExp(`var\\(\\s*${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=(--[\\w-]+)?\\s*[,)])`, "g");
		return new e(r.css.replace(a, `var(${n}`));
	}
	utilities() {
		return X(this.css).filter((e) => /^@utility\s/.test(e.prelude) && e.inner).map((e) => {
			let t = this.groupComment(e)?.name;
			return {
				...this.rule(e.prelude.replace(/^@utility\s+/, ""), e),
				...t ? { group: t } : {}
			};
		});
	}
	setUtilityGroup(e, t) {
		let n = X(this.css).find((t) => t.prelude === `@utility ${e}`);
		if (!n) return this;
		let r = t?.replace(/\*\/|\n/g, "").trim() || null, i = this.groupComment(n);
		return i ? r ? this.splice(i.start, i.end, `/* group: ${r} */`) : this.splice(this.lineStart(i.start), n.start, zt(this.css, n.start)) : r ? this.splice(n.start, n.start, `/* group: ${r} */\n${zt(this.css, n.start)}`) : this;
	}
	renameGroup(e, t) {
		return this.utilities().filter((t) => t.group === e).reduce((e, n) => e.setUtilityGroup(n.name, t), this);
	}
	groupComment(e) {
		let t = this.css.slice(Math.max(0, e.start - 200), e.start), n = Rt.exec(t);
		if (!n) return null;
		let r = e.start - t.length + n.index;
		return {
			start: r,
			end: r + n[0].trimEnd().length,
			name: n[1].trim()
		};
	}
	setUtility(e, t) {
		let n = X(this.css).find((t) => t.prelude === `@utility ${e}`);
		return n ? this.setApply(n, t) : this.append(`@utility ${e} {\n  @apply ${t.join(" ")};\n}`);
	}
	removeUtility(e) {
		let t = this.setUtilityGroup(e, null), n = X(t.css).find((t) => t.prelude === `@utility ${e}`);
		return n ? t.remove(n) : this;
	}
	renameUtility(e, t) {
		let n = X(this.css).find((t) => t.prelude === `@utility ${e}`);
		return n ? this.splice(n.start, n.start + n.prelude.length, `@utility ${t}`) : this;
	}
	duplicateUtility(e, t) {
		let n = X(this.css).find((t) => t.prelude === `@utility ${e}`);
		if (!n) return this;
		let r = this.css.slice(n.start + n.prelude.length, n.end), i = this.groupComment(n)?.name ?? null;
		return this.splice(n.end, n.end, `\n\n@utility ${t}${r}`).setUtilityGroup(t, i);
	}
	utilityProperties(e) {
		let t = X(this.css).find((t) => t.prelude === `@utility ${e}`);
		return t ? this.properties(t).map(({ name: e, value: t }) => ({
			name: e,
			value: t
		})) : [];
	}
	writeUtility(e, t, n) {
		let r = (t) => X(t.css).find((t) => t.inner && t.prelude === `@utility ${e}`);
		if (!r(this)) {
			let r = [...t.map((e) => `  ${e.name}: ${e.value};`), ...n.length ? [`  @apply ${n.join(" ")};`] : []].join("\n");
			return this.append(`@utility ${e} {\n${r}\n}`);
		}
		let i = this;
		for (let e of t) {
			let t = r(i), n = `${e.name}: ${e.value};`, a = i.properties(t), o = a.findLast((t) => t.name === e.name);
			if (o) {
				i = i.splice(o.start, o.end, n);
				continue;
			}
			let s = `${zt(i.css, t.start)}  `, c = a[a.length - 1], l = X(i.css, ...t.inner)[0];
			i = c ? i.splice(i.lineEnd(c.end), i.lineEnd(c.end), `${s}${n}\n`) : l ? i.splice(i.lineStart(l.start), i.lineStart(l.start), `${s}${n}\n`) : i.insertLast(t, `${s}${n}`);
		}
		return i.setApply(r(i), n);
	}
	elements(e = "base") {
		return this.bases(e).flatMap((e) => X(this.css, ...e.inner).filter((e) => e.inner && !e.prelude.startsWith("@")).map((e) => this.rule(e.prelude.replace(/\s+/g, " "), e)));
	}
	setElement(e, t, n = "base") {
		for (let r of this.bases(n)) {
			let n = X(this.css, ...r.inner).find((t) => t.prelude.replace(/\s+/g, " ") === e);
			if (n) return t.length === 0 && !this.rule(e, n).custom ? this.remove(n) : this.setApply(n, t);
		}
		if (t.length === 0) return this;
		let r = `  ${e} {\n    @apply ${t.join(" ")};\n  }`, i = this.bases(n)[0];
		return i ? this.insertLast(i, r) : this.append(`@layer ${n} {\n${r}\n}`);
	}
	removeElement(e, t = "base") {
		for (let n of this.bases(t)) {
			let t = X(this.css, ...n.inner).find((t) => t.inner && t.prelude.replace(/\s+/g, " ") === e);
			if (t) return this.remove(t);
		}
		return this;
	}
	extra() {
		let { theme: e, layers: t, rest: n } = this.extraParts(), r = [];
		e.length && r.push(`@theme {\n${e.map((e) => this.piece(e, "  ")).join("\n")}\n}`);
		for (let e of n) r.push(typeof e == "string" ? `@layer ${e} {\n${t[e].map((e) => this.piece(e, "  ")).join("\n")}\n}` : this.piece(e, ""));
		return r.join("\n\n");
	}
	setExtra(t) {
		let n = this.extraParts(), r = new e(t).pieces(), i = (e, t) => e.replace(/\s+/g, " ").trim() === t.replace(/\s+/g, " ").trim(), a = (e, t) => {
			let n = e.findIndex((e) => i(e, this.css.slice(...t)));
			return n !== -1 && (e.splice(n, 1), !0);
		}, o = [
			...n.theme.filter((e) => !a(r.theme, e)),
			...n.layers.base.filter((e) => !a(r.layers.base, e)),
			...n.layers.components.filter((e) => !a(r.layers.components, e)),
			...n.rest.filter((e) => typeof e != "string").filter((e) => !a(r.rest, e))
		].sort((e, t) => t[0] - e[0]), s = this;
		for (let [e, t] of o) s = s.splice(s.lineStart(e), s.lineEnd(t), "");
		for (let e of X(s.css).filter((e) => e.inner && (/^@theme(\s+(inline|static))*$/.test(e.prelude) || e.prelude === "@layer base" || e.prelude === "@layer components")).reverse()) s.css.slice(...e.inner).replace(/\/\*[\s\S]*?\*\//g, "").trim() === "" && (s = s.remove(e));
		let c = (e) => e.split("\n").map((e) => e.trim() ? `  ${e}` : "").join("\n"), l = r.theme.filter((e) => /^--[\w-]*\*\s*:\s*initial\b/.test(e.replace(/^\/\*[\s\S]*?\*\/\s*/, ""))), u = r.theme.filter((e) => !l.includes(e));
		if (l.length) {
			let e = X(s.css).find((e) => e.inner && /^@theme(\s+(inline|static))*$/.test(e.prelude));
			s = e ? s.splice(e.inner[0], e.inner[0], `\n${l.map(c).join("\n")}`) : s.append(`@theme {\n${l.map(c).join("\n")}\n}`, "after-imports");
		}
		let d = [
			...u.length ? [`@theme {\n${u.map(c).join("\n")}\n}`] : [],
			...["base", "components"].flatMap((e) => r.layers[e].length ? [`@layer ${e} {\n${r.layers[e].map(c).join("\n")}\n}`] : []),
			...r.rest
		], f = s.css.replace(/\s+$/, "");
		return new e(`${f}${d.length ? `\n\n${d.join("\n\n")}` : ""}\n`);
	}
	pieces() {
		let e = {
			theme: [],
			layers: {
				base: [],
				components: []
			},
			rest: []
		}, t = (e, t) => {
			let n = zt(this.css, e);
			return this.css.slice(e, t).split("\n").map((e, t) => t === 0 ? e : e.startsWith(n) ? e.slice(n.length) : e.trimStart()).join("\n");
		};
		for (let n of X(this.css)) n.inner && /^@theme(\s+(inline|static))*$/.test(n.prelude) ? e.theme.push(...X(this.css, ...n.inner).map((e) => t(this.leading(e.start), e.end))) : n.inner && (n.prelude === "@layer base" || n.prelude === "@layer components") ? e.layers[n.prelude.slice(7)].push(...X(this.css, ...n.inner).map((e) => t(this.leading(e.start), e.end))) : e.rest.push(t(this.leading(n.start), n.end));
		return e;
	}
	extraParts() {
		let e = [], t = {
			base: [],
			components: []
		}, n = [], r = /^@theme(\s+(inline|static))*$/;
		for (let i of X(this.css)) if (i.inner || !/^@import\s/.test(i.prelude)) {
			if (i.inner && r.test(i.prelude)) for (let t of X(this.css, ...i.inner)) {
				let n = /^(--[\w.*-]+)\s*:/.exec(t.prelude)?.[1];
				!t.inner && n && (Kt.test(n) || qt.test(n) && /:\s*initial\s*$/.test(t.prelude)) || e.push([this.leading(t.start), t.end]);
			}
			else if (i.inner && (i.prelude === "@layer base" || i.prelude === "@layer components")) {
				let e = i.prelude.slice(7);
				for (let r of X(this.css, ...i.inner)) r.inner && Wt[e].includes(r.prelude.replace(/\s+/g, " ")) || (n.includes(e) || n.push(e), t[e].push([this.leading(r.start), r.end]));
			} else i.inner && /^@utility\s+[a-z][\w-]*$/.test(i.prelude) || n.push([this.leading(i.start), i.end]);
		}
		return {
			theme: e,
			layers: t,
			rest: n
		};
	}
	leading(e) {
		let t = e;
		for (; t > 0 && /\s/.test(this.css[t - 1]);) t--;
		if (this.css.slice(t - 2, t) !== "*/") return e;
		let n = this.css.lastIndexOf("/*", t - 2);
		if (n === -1) return e;
		let r = this.css.lastIndexOf("\n", n - 1) + 1;
		return /^[ \t]*$/.test(this.css.slice(r, n)) ? n : e;
	}
	piece([e, t], n) {
		let r = zt(this.css, e);
		return this.css.slice(e, t).split("\n").map((e, t) => t === 0 ? n + e : e.trim() === "" ? "" : n + (e.startsWith(r) ? e.slice(r.length) : e.trimStart())).join("\n");
	}
	property(e, t, n = "base") {
		for (let r of this.bases(n)) for (let n of X(this.css, ...r.inner).filter((t) => t.inner && t.prelude.replace(/\s+/g, " ") === e)) {
			let e = this.properties(n).findLast((e) => e.name === t);
			if (e) return e.value;
		}
	}
	setProperty(e, t, n, r = "base") {
		for (let i of this.bases(r)) for (let r of X(this.css, ...i.inner).filter((t) => t.inner && t.prelude.replace(/\s+/g, " ") === e)) {
			let e = this.properties(r).findLast((e) => e.name === t);
			if (e && n !== null) return this.splice(e.start, e.end, `${t}: ${n};`);
			if (e) return X(this.css, ...r.inner).length === 1 ? this.remove(r) : this.splice(this.lineStart(e.start), this.lineEnd(e.end), "");
		}
		if (n === null) return this;
		let i = this.bases(r)[0];
		if (!i) return this.append(`@layer ${r} {\n  ${e} {\n    ${t}: ${n};\n  }\n}`);
		let a = X(this.css, ...i.inner).find((t) => t.inner && t.prelude.replace(/\s+/g, " ") === e);
		return a ? this.insertLast(a, `${zt(this.css, a.start)}  ${t}: ${n};`) : this.splice(i.inner[0], i.inner[0], `\n  ${e} {\n    ${t}: ${n};\n  }`);
	}
	properties(e) {
		return X(this.css, ...e.inner).filter((e) => !e.inner && !e.prelude.startsWith("@") && e.prelude.includes(":")).map((e) => {
			let t = e.prelude.indexOf(":");
			return {
				name: e.prelude.slice(0, t).trim(),
				value: e.prelude.slice(t + 1).trim(),
				start: e.start,
				end: e.end
			};
		});
	}
	themes() {
		return X(this.css).filter((e) => e.inner && /^@theme(\s+(inline|static))*$/.test(e.prelude));
	}
	bases(e = "base") {
		return X(this.css).filter((t) => t.inner && t.prelude === `@layer ${e}`);
	}
	declarationsOf(e) {
		return this.declarations(e).map(({ name: e, value: t }) => ({
			name: e,
			value: t
		}));
	}
	declarations(e) {
		return X(this.css, ...e.inner).filter((e) => !e.inner && e.prelude.startsWith("--") && e.prelude.includes(":")).map((e) => {
			let t = e.prelude.indexOf(":");
			return {
				name: e.prelude.slice(0, t).trim(),
				value: e.prelude.slice(t + 1).trim(),
				start: e.start,
				end: e.end
			};
		});
	}
	rule(e, t) {
		let n = X(this.css, ...t.inner), r = n.filter((e) => !e.inner && e.prelude.startsWith("@apply"));
		return {
			name: e,
			classes: r.flatMap((e) => e.prelude.slice(6).trim().split(/\s+/).filter(Boolean)),
			custom: n.length !== r.length || r.length > 1
		};
	}
	setApply(e, t) {
		let n = X(this.css, ...e.inner).filter((e) => !e.inner && e.prelude.startsWith("@apply")), r = t.length ? `@apply ${t.join(" ")};` : "";
		if (n.length === 0) {
			if (r === "") return this;
			let t = `${zt(this.css, e.start)}  `;
			return this.splice(e.inner[0], e.inner[0], `\n${t}${r}`);
		}
		let i = this;
		for (let [e, t] of [...n].reverse().entries()) i = e === n.length - 1 && r !== "" ? i.splice(t.start, t.end, r) : i.splice(i.lineStart(t.start), i.lineEnd(t.end), "");
		return i;
	}
	remove(e) {
		let t = this.lineEnd(e.end), n = /^[ \t]*\n/.exec(this.css.slice(t))?.[0].length ?? 0;
		return this.splice(this.lineStart(e.start), t + (this.lineStart(e.start) === 0 || this.css[this.lineStart(e.start) - 2] === "\n" ? n : 0), "");
	}
	append(t, n = "end") {
		if (n === "after-imports") {
			let e = X(this.css).filter((e) => !e.inner && e.prelude.startsWith("@import")), n = e[e.length - 1];
			if (n) return this.splice(n.end, n.end, `\n\n${t}`);
		}
		let r = this.css.replace(/\s+$/, "");
		return new e(`${r}${r === "" ? "" : "\n\n"}${t}\n`);
	}
	insertLast(e, t) {
		let [n, r] = e.inner, i = /\s*$/.exec(this.css.slice(n, r))[0].length;
		return this.splice(r - i, r, `\n${t}\n${zt(this.css, e.start)}`);
	}
	splice(t, n, r) {
		return new e(this.css.slice(0, t) + r + this.css.slice(n));
	}
	lineStart(e) {
		let t = this.css.lastIndexOf("\n", e - 1) + 1;
		return /^[ \t]*$/.test(this.css.slice(t, e)) ? t : e;
	}
	lineEnd(e) {
		let t = /^[ \t]*(\n|$)/.exec(this.css.slice(e));
		return t ? e + t[0].length : e;
	}
};
function Qt(e) {
	return /^--(font-weight|inset-shadow|drop-shadow|text-shadow|[a-z]+)/.exec(e)?.[0] ?? e;
}
// admin/src/core/styling.tsx
var $t = (e) => `${e.css}\u0000${JSON.stringify(e.files)}`, en = /* @__PURE__ */ new Map(), tn = /* @__PURE__ */ new Map(), nn = /* @__PURE__ */ new Map();
function rn(e, t, n) {
	e.set(t, n);
	for (let t of [...e.keys()].slice(0, -2)) e.delete(t);
	return n;
}
function an(e) {
	let t = $t(e);
	return en.get(t) ?? rn(en, t, import("./compile-C_bW4FEX.js").then(({ designSystem: t }) => t(e)).then((e) => new Ze(e)).catch((e) => (console.error("[cms] The stylesheet could not be read.", e), null)).then((e) => rn(tn, t, e)));
}
function on() {
	return import("./defaults-DOHwyD24.js").then((e) => e.default);
}
function sn(e) {
	let t = $t(e);
	return nn.get(t) ?? rn(nn, t, import("./compile-C_bW4FEX.js").then(({ compiler: t }) => t(e)));
}
function cn(e, t, n) {
	let r = Object.fromEntries(n.map((e) => [e.name, e.width]));
	if (e === "desktop") return {
		variant: "",
		width: t,
		sizes: r
	};
	let i = n.findIndex((e) => e.width > Ce.tablet), a = n[i === -1 ? n.length - 1 : i], o = n[(i === -1 ? n.length - 1 : i) - 1], s = e === "tablet" ? a : o ?? a;
	return {
		variant: s ? `max-${s.name}` : "",
		width: Ce[e],
		sizes: r
	};
}
function ln(e) {
	let t = parseFloat(e);
	return Number.isNaN(t) ? 0 : /r?em$/.test(e.trim()) ? t * 16 : t;
}
function un(e) {
	let t = e ? $t(e) : "", [, n] = M(0);
	return k(() => {
		if (!e || tn.has(t)) return;
		let r = !0;
		return an(e).then(() => r && n((e) => e + 1)), () => {
			r = !1;
		};
	}, [t]), {
		engine: e && tn.get(t) || null,
		loading: !!e && !tn.has(t)
	};
}
function dn(e, t, n) {
	return {
		engine: e,
		breakpoints: e ? e.tokens("breakpoint").map((e) => ({
			name: e.name,
			width: ln(e.value)
		})).filter((e) => e.width > 0).sort((e, t) => e.width - t.width) : [],
		classes: t ? hn(t.css) : [],
		source: t,
		loading: n
	};
}
var fn = re(null);
function pn({ source: e, children: t }) {
	let { engine: n, loading: r } = un(e), i = A(() => dn(n, e, r), [
		n,
		e,
		r
	]);
	return /* @__PURE__ */ H(fn.Provider, {
		value: i,
		children: t
	});
}
function mn() {
	let e = se(fn), t = E("styling/source", {}, {
		staleTime: 6e4,
		retry: !1,
		enabled: !e
	}), n = e ? void 0 : t.data, { engine: r, loading: i } = un(n), a = A(() => dn(r, n, t.isLoading || i), [
		r,
		n,
		t.isLoading,
		i
	]);
	return e ?? a;
}
function hn(e) {
	try {
		return new Zt(e).utilities().map((e) => e.name).filter((e) => /^[\w-]+$/.test(e));
	} catch {
		return [];
	}
}
function gn() {
	let { engine: e } = mn();
	return A(() => bn(e), [e]);
}
var _n = [
	"color",
	"font",
	"text",
	"weight",
	"leading",
	"tracking",
	"spacing",
	"radius",
	"shadow",
	"container",
	"breakpoint",
	"ease"
], vn = {
	of: () => [],
	find: () => null,
	resolve: (e) => e
}, yn = /* @__PURE__ */ new WeakMap();
function bn(e) {
	if (!e) return vn;
	let t = yn.get(e);
	return t || yn.set(e, t = xn(e)), t;
}
function xn(e) {
	let t = /* @__PURE__ */ new Map(), n = (n) => {
		let r = t.get(n);
		return r || t.set(n, r = e.tokens(n)), r;
	}, r = null;
	return {
		of: n,
		find: (e) => {
			let t = typeof e == "string" ? tt(e) : null;
			if (!t) return null;
			r ??= new Map(_n.flatMap((e) => n(e)).map((e) => [e.variable, e]));
			let i = r.get(t.variable);
			return i ? {
				token: i,
				...t.alpha === void 0 ? {} : { alpha: t.alpha }
			} : null;
		},
		resolve: (t) => e.resolve(t)
	};
}
// admin/src/core/caret.ts
function Sn(e = document) {
	return e.getSelection()?.isCollapsed ?? !0;
}
function Cn(e, t) {
	let n = e.ownerDocument.getSelection();
	if (!n || n.rangeCount === 0) return null;
	let r = n.getRangeAt(0);
	if (!e.contains(r.startContainer)) return null;
	let i = e.ownerDocument.createRange();
	return i.selectNodeContents(e), t ? i.setEnd(r.startContainer, r.startOffset) : i.setStart(r.endContainer, r.endOffset), i;
}
function wn(e) {
	return e ? e.toString().replace(/​/g, "") : "";
}
function Tn(e) {
	return Sn(e.ownerDocument) && wn(Cn(e, !0)) === "" && !Dn(Cn(e, !0)).includes("<br");
}
function En(e) {
	return Sn(e.ownerDocument) && wn(Cn(e, !1)) === "";
}
function Dn(e) {
	if (!e) return "";
	let t = e.startContainer.ownerDocument.createElement("div");
	return t.appendChild(e.cloneContents()), t.innerHTML;
}
function On(e) {
	return wn(Cn(e, !0)).length;
}
function kn(e) {
	let t = Cn(e, !0), n = Cn(e, !1);
	return [Dn(t), Dn(n)];
}
function An(e) {
	let t = Nn(e.ownerDocument);
	return !t || t.top - e.getBoundingClientRect().top < Mn(e) * .8;
}
function jn(e) {
	let t = Nn(e.ownerDocument);
	return !t || e.getBoundingClientRect().bottom - t.bottom < Mn(e) * .8;
}
function Mn(e) {
	let t = parseFloat(e.ownerDocument.defaultView.getComputedStyle(e).lineHeight);
	return Number.isFinite(t) ? t : 20;
}
function Nn(e = document) {
	let t = e.getSelection();
	if (!t || t.rangeCount === 0) return null;
	let n = t.getRangeAt(0).cloneRange(), r = n.getClientRects();
	if (r.length > 0) return r[0];
	let i = e.createElement("span");
	i.textContent = "​", n.insertNode(i);
	let a = i.getBoundingClientRect();
	return i.remove(), a;
}
function Pn(e, t) {
	e.focus({ preventScroll: !0 });
	let n = e.ownerDocument.getSelection();
	if (!n) return;
	let r = e.ownerDocument.createRange();
	if (t === "start" || t === "end") r.selectNodeContents(e), r.collapse(t === "start");
	else {
		let n = t, i = e.ownerDocument.createTreeWalker(e, NodeFilter.SHOW_TEXT), a = i.nextNode(), o = !1;
		for (; a;) {
			let e = a.textContent?.length ?? 0;
			if (n <= e) {
				r.setStart(a, n), r.collapse(!0), o = !0;
				break;
			}
			n -= e, a = i.nextNode();
		}
		o || (r.selectNodeContents(e), r.collapse(!1));
	}
	n.removeAllRanges(), n.addRange(r), e.scrollIntoView({ block: "nearest" });
}
function Fn(e) {
	let t = document.createElement("div");
	return t.innerHTML = e, (t.textContent ?? "").length;
}
function In(e) {
	return e.replace(/\u200B/g, "").replace(/<(\/?)strike>/g, "<$1s>").replace(/<(\/?)b>/g, "<$1strong>").replace(/<(\/?)i>/g, "<$1em>").replace(/<div><br><\/div>/g, "<br>").replace(/<\/?(div|p|span)[^>]*>/g, "").replace(/ style="[^"]*"/g, "").replace(/&nbsp;/g, " ").replace(/<br>$/, "");
}
var Ln = [
	["**", "strong"],
	["__", "strong"],
	["~~", "s"],
	["`", "code"],
	["*", "em"],
	["_", "em"]
];
function Rn(e = document) {
	let t = e.getSelection();
	if (!t || !t.isCollapsed || t.rangeCount === 0) return !1;
	let n = t.anchorNode;
	if (!n || n.nodeType !== Node.TEXT_NODE || n.parentElement?.closest("code")) return !1;
	let r = t.anchorOffset, i = (n.textContent ?? "").slice(0, r);
	for (let [a, o] of Ln) {
		if (!i.endsWith(a)) continue;
		let s = i.length - a.length;
		if (a.length === 1 && i[s - 1] === a) return !1;
		let c = i.lastIndexOf(a, s - 1);
		if (c < 0) continue;
		let l = i.slice(c + a.length, s);
		if (!l || /^\s|\s$/.test(l) || a.length === 1 && a !== "`" && l.includes(a) || a.length === 1 && a !== "`" && c > 0 && /[\w*_]/.test(i[c - 1])) continue;
		let u = e.createRange();
		u.setStart(n, c), u.setEnd(n, r), u.deleteContents();
		let d = e.createElement(o);
		d.textContent = l, u.insertNode(d);
		let f = e.createTextNode("​");
		d.after(f);
		let p = e.createRange();
		return p.setStart(f, 1), p.collapse(!0), t.removeAllRanges(), t.addRange(p), !0;
	}
	return !1;
}
// admin/src/core/anchors.ts
function zn() {
	let { store: e } = G(), t = K(e, (e) => e.nodes), n = /* @__PURE__ */ new Map(), r = [];
	for (let { node: e } of s(t)) {
		let t = String(e.props?.text ?? "").replace(/<[^>]+>/g, "").trim(), i = e.props?.anchor || e.anchor || "";
		if (!i && e.type === "heading" && t) {
			let e = ke(t) || "section", r = (n.get(e) ?? 0) + 1;
			n.set(e, r), i = r === 1 ? e : `${e}-${r}`;
		}
		i && r.push({
			id: i,
			label: e.label || t || i
		});
	}
	return r;
}
// admin/src/core/InlineEditable.tsx
function Bn({ html: e, onChange: t, tag: n = "div", placeholder: r, className: i = "", focus: a, onKeyDown: o, onFocus: s, onPaste: c, disabled: l, singleLine: u, quiet: d, plainText: f }) {
	let p = j(null), m = j(e);
	le(() => {
		let t = p.current;
		t && (t.ownerDocument.activeElement === t ? m.current = e : (In(t.innerHTML) !== e && (t.innerHTML = e), m.current = In(t.innerHTML)));
	}, [e]), le(() => {
		a && p.current && Pn(p.current, a.at);
	}, [a?.nonce]);
	let h = () => {
		let e = p.current;
		e && (e.spellcheck = !parseFloat(e.ownerDocument.defaultView?.getComputedStyle(e).webkitTextStrokeWidth ?? "0"));
	}, g = () => {
		let e = p.current;
		if (!e) return;
		let n = In(e.innerHTML);
		n !== m.current && (m.current = n, t(n, e));
	};
	return ie(n, {
		ref: p,
		className: `cms-block-text ${i}`,
		contentEditable: !l,
		suppressContentEditableWarning: !0,
		role: "textbox",
		"aria-multiline": !u,
		"aria-readonly": l || void 0,
		"data-placeholder": r,
		"data-quiet": d || void 0,
		"data-cms-inline": "",
		"data-cms-plain": f || void 0,
		spellCheck: !0,
		onInput: (e) => {
			h();
			let t = e.nativeEvent;
			!f && t.inputType === "insertText" && t.data && /[*_~`]/.test(t.data) && Rn(e.currentTarget.ownerDocument), g();
		},
		onFocus: () => {
			h(), s?.();
		},
		onKeyDown: (e) => {
			let t = e.currentTarget.ownerDocument, n = e.metaKey || e.ctrlKey;
			f && n && [
				"b",
				"i",
				"u",
				"x",
				"k",
				"e"
			].includes(e.key.toLowerCase()) ? e.preventDefault() : n && !e.shiftKey && [
				"b",
				"i",
				"u"
			].includes(e.key.toLowerCase()) ? (e.preventDefault(), t.execCommand({
				b: "bold",
				i: "italic",
				u: "underline"
			}[e.key.toLowerCase()]), g()) : n && e.shiftKey && e.key.toLowerCase() === "x" ? (e.preventDefault(), t.execCommand("strikeThrough"), g()) : n && e.key.toLowerCase() === "k" ? (e.preventDefault(), e.stopPropagation(), p.current?.ownerDocument.dispatchEvent(new CustomEvent("cms:link"))) : n && e.key.toLowerCase() === "e" ? (e.preventDefault(), Vn("code", t), g()) : e.key === "Enter" && e.shiftKey && !u ? (e.preventDefault(), t.execCommand("insertLineBreak"), g()) : p.current && o?.(e, p.current);
		},
		onPaste: (e) => {
			e.preventDefault();
			let t = e.currentTarget.ownerDocument, n = e.clipboardData.getData("text/plain");
			!f && /^(https?:\/\/|mailto:)\S+$/i.test(n.trim()) && !t.getSelection()?.isCollapsed ? (t.execCommand("createLink", !1, n.trim()), g()) : p.current && c?.(n, p.current) || (t.execCommand("insertText", !1, u ? n.replace(/\s*\n\s*/g, " ") : n), g());
		},
		onBlur: () => g()
	});
}
function Vn(e, t = document) {
	let n = t.getSelection();
	if (!n || n.rangeCount === 0 || n.isCollapsed) return;
	let r = n.getRangeAt(0), i = r.commonAncestorContainer.closest?.(e) ?? r.commonAncestorContainer.parentElement?.closest(e);
	if (i) {
		i.replaceWith(...Array.from(i.childNodes));
		return;
	}
	let a = t.createElement(e);
	a.appendChild(r.extractContents()), r.insertNode(a), n.removeAllRanges();
	let o = t.createRange();
	o.selectNodeContents(a), n.addRange(o);
}
// admin/src/core/link.ts
function Hn(e) {
	return {
		...e,
		type: "url",
		component: "link"
	};
}
// admin/src/core/FormatToolbar.tsx
function Un({ root: e = document, offset: t }) {
	let [n, r] = M(null), [i, a] = M({}), [o, s] = M(!1), [c, l] = M(""), u = j(null), d = j(null), f = j(() => {}), p = zn();
	if (k(() => {
		let n = () => {
			if (o) return;
			let n = e.getSelection();
			if (!n || n.isCollapsed || n.rangeCount === 0) return r(null);
			let i = n.getRangeAt(0), s = (i.commonAncestorContainer.nodeType === 1 ? i.commonAncestorContainer : i.commonAncestorContainer.parentElement)?.closest("[contenteditable=\"true\"]");
			if (!s || s.hasAttribute("data-cms-plain") || e.activeElement !== s) return r(null);
			d.current = s;
			let c = (e) => !!(i.startContainer.nodeType === 1 ? i.startContainer : i.startContainer.parentElement)?.closest(e);
			a({
				bold: e.queryCommandState("bold"),
				italic: e.queryCommandState("italic"),
				underline: c("u"),
				strike: e.queryCommandState("strikeThrough"),
				code: c("code"),
				link: c("a")
			});
			let l = i.getBoundingClientRect(), u = t?.() ?? {
				x: 0,
				y: 0,
				scale: 1
			};
			r({
				x: u.x + (l.left + l.width / 2) * u.scale,
				y: u.y + l.top * u.scale
			});
		}, i = () => {
			n(), f.current();
		}, s = () => setTimeout(n);
		return e.addEventListener("selectionchange", n), e.addEventListener("focusout", s), e.addEventListener("cms:link", i), () => {
			e.removeEventListener("selectionchange", n), e.removeEventListener("focusout", s), e.removeEventListener("cms:link", i);
		};
	}, [
		e,
		o,
		t
	]), !n) return null;
	let m = (t) => {
		e.execCommand(t), d.current?.dispatchEvent(new Event("input", { bubbles: !0 })), e.dispatchEvent(new Event("selectionchange"));
	}, h = (t) => {
		Vn(t, e), d.current?.dispatchEvent(new Event("input", { bubbles: !0 })), e.dispatchEvent(new Event("selectionchange"));
	}, g = () => {
		let t = e.getSelection();
		u.current = t && t.rangeCount ? t.getRangeAt(0).cloneRange() : null;
		let n = (t?.anchorNode?.parentElement)?.closest("a");
		l(n?.getAttribute("href") ?? ""), s(!0);
	};
	f.current = g;
	let _ = (t) => {
		let n = e.getSelection();
		u.current && n && (n.removeAllRanges(), n.addRange(u.current));
		let i = t.trim();
		i === "" ? e.execCommand("unlink") : /^(https?:|mailto:|tel:|\/|#|\{brand\.)/i.test(i) ? e.execCommand("createLink", !1, i) : e.execCommand("createLink", !1, `https://${i}`), d.current?.dispatchEvent(new Event("input", { bubbles: !0 })), s(!1), r(null);
	}, v = (e, t, n, r) => /* @__PURE__ */ H(B, {
		content: t,
		shortcut: n,
		children: /* @__PURE__ */ H(z, {
			compact: !0,
			"aria-label": t,
			"aria-pressed": !!i[e] || e === "link" && o,
			onMouseDown: (e) => e.preventDefault(),
			onClick: r,
			className: V("grid size-7 place-items-center rounded-xs hover:bg-white/12 hover:text-ink-contrast", i[e] || e === "link" && o ? "bg-white/14 text-ink-contrast" : "text-ink-contrast/75"),
			children: /* @__PURE__ */ H(I, {
				name: e,
				size: 14
			})
		})
	}, e), y = () => {
		s(!1);
		let t = d.current, n = e.getSelection();
		t && u.current && n && (t.focus({ preventScroll: !0 }), n.removeAllRanges(), n.addRange(u.current));
	}, b = Hn({
		handle: "url",
		label: T("Link"),
		size: "sm",
		autofocus: !0,
		anchors: p,
		placeholder: T("Paste a link or search pages"),
		onClose: y
	});
	return Pe(/* @__PURE__ */ U("div", {
		className: "fixed z-overlay flex -translate-x-1/2 -translate-y-full items-center gap-0.5 rounded-md bg-ink p-1 shadow-pop",
		style: {
			left: n.x,
			top: n.y - 8
		},
		onMouseDown: (e) => !o && e.preventDefault(),
		onKeyDown: (e) => e.key === "Escape" && y(),
		children: [
			v("bold", T("Bold"), "mod+b", () => m("bold")),
			v("italic", T("Italic"), "mod+i", () => m("italic")),
			v("underline", T("Underline"), "mod+u", () => m("underline")),
			v("strike", T("Strikethrough"), "mod+shift+x", () => m("strikeThrough")),
			v("code", T("Code"), "mod+e", () => h("code")),
			/* @__PURE__ */ H("span", { className: "mx-0.5 h-4 w-px bg-white/15" }),
			v("link", T("Link"), "mod+k", g),
			o && /* @__PURE__ */ H("div", {
				className: "pointer-events-none absolute inset-0 opacity-0",
				"aria-hidden": !0,
				children: /* @__PURE__ */ H(F, {
					bare: !0,
					className: "h-full",
					fields: [b],
					values: { url: c },
					onChange: (e, t) => _(t ?? "")
				})
			})
		]
	}), document.body);
}
// admin/src/core/slashKeys.ts
function Wn(e, t, n) {
	return t >= 0 && t < e ? "choose" : n ? "wait" : "pass";
}
function Gn(e, t) {
	return e > 0 ? "choose" : t ? "wait" : "release";
}
function Kn(e, t) {
	return e && !t;
}
// admin/src/core/Inserter.tsx
var qn = (e) => `/__component/${encodeURIComponent(e)}`, Jn = (e) => e.replace(/[-_]+/g, " ").replace(/(^|\s)\S/g, (e) => e.toUpperCase()), Yn = (e) => e.kind === "block" ? e.type.title : e.component.title, Xn = (e) => e.kind === "block" ? e.type.icon : e.component.synced ? "symbol" : "section-copy", Zn = (e) => e.kind === "block" ? e.type.name : `c-${e.component.handle}`;
function Qn(e, t) {
	return e.synced ? t("component") : e.blocks.length > 0 && e.blocks.every((e) => t(e.type));
}
var $n = (e, t) => !t || [
	e.title,
	e.category,
	e.description,
	...e.keywords ?? []
].some((e) => e.toLowerCase().includes(t));
function er(e, t, n, r = !0) {
	let i = E("components/list", {}, { staleTime: 6e4 }), { catalog: a } = Re();
	return {
		items: A(() => {
			let o = a?.categories ?? [], s = (e) => {
				let t = o.findIndex((t) => t.name === e);
				return t < 0 ? o.length : t;
			}, c = (e) => o.find((t) => t.name === e)?.label ?? Jn(e), l = t.trim().toLowerCase(), u = (e) => e.toLowerCase().includes(l), d = e.filter((e) => n ? n(e) : !e.parent).filter((e) => !l || u(e.title) || u(e.name) || (e.keywords ?? []).some(u)).sort((e, t) => s(e.category) - s(t.category) || (s(e.category) === o.length ? c(e.category).localeCompare(c(t.category)) : 0)), f = (e) => {
				let t = e.title.toLowerCase();
				return t === l ? 0 : t.startsWith(l) ? 1 : u(e.title) ? 2 : 3;
			}, p = (l ? [...d].sort((e, t) => f(e) - f(t)) : d).map((e) => ({
				kind: "block",
				type: e,
				group: l ? T("Blocks") : c(e.category)
			})), m = (t) => {
				let r = e.find((e) => e.name === t);
				return !!r && (n ? n(r) : !r.parent);
			}, h = (r ? i.data ?? [] : []).filter((e) => Qn(e, m) && $n(e, l)).map((e) => ({
				kind: "component",
				component: e,
				group: T("Components")
			}));
			return [...p, ...h];
		}, [
			e,
			t,
			i.data,
			n,
			r,
			a
		]),
		loading: r && i.isLoading
	};
}
function tr({ types: e, query: t, onQuery: n, onChoose: r, onClose: i, allowed: a, showSearch: o = !0, className: s, style: c, compact: l, chooseFirst: u, onNoMatch: d, components: f = !0, keyboardDocument: p }) {
	let { items: m, loading: h } = er(e, t, a, f), [g, _] = M("blocks"), v = A(() => m.filter((e) => e.kind === "component"), [m]), y = f && !l && v.length > 0 && !t.trim(), b = y && g === "components", x = A(() => y ? b ? v : m.filter((e) => e.kind === "block") : m, [
		m,
		v,
		y,
		b
	]), [S, C] = M(0), ee = j(null);
	k(() => C(0), [t, g]);
	let w = j({
		items: x,
		active: S,
		loading: h
	});
	w.current = {
		items: x,
		active: S,
		loading: h
	};
	let E = j(!!u);
	k(() => {
		if (!E.current) return;
		let e = Gn(x.length, h);
		e !== "wait" && (E.current = !1, e === "choose" ? r(x[0]) : d?.());
	}, [x, h]), le(() => {
		let e = (e) => {
			let { items: t, active: n, loading: a } = w.current;
			if (e.key === "ArrowDown") e.preventDefault(), C((e) => Math.min(t.length - 1, e + 1));
			else if (e.key === "ArrowUp") e.preventDefault(), C((e) => Math.max(0, e - 1));
			else if (e.key === "Enter") {
				let i = Wn(t.length, n, a);
				i !== "pass" && (e.preventDefault(), e.stopPropagation(), i === "choose" ? r(t[n]) : E.current = !0);
			} else e.key === "Escape" && (e.preventDefault(), i?.());
		};
		return window.addEventListener("keydown", e, !0), p?.addEventListener("keydown", e, !0), () => {
			window.removeEventListener("keydown", e, !0), p?.removeEventListener("keydown", e, !0);
		};
	}, [
		r,
		i,
		p
	]), k(() => {
		ee.current?.querySelector(`[data-index="${S}"]`)?.scrollIntoView({ block: "nearest" });
	}, [S]);
	let D = "";
	return /* @__PURE__ */ U("div", {
		className: V("flex max-h-[min(420px,60vh)] w-[300px] flex-col", s),
		style: c,
		children: [
			o && /* @__PURE__ */ H("div", {
				className: "border-b border-border p-1.5",
				children: /* @__PURE__ */ H(F, {
					bare: !0,
					fields: [{
						handle: "query",
						type: "text",
						label: T("Search"),
						icon: "search",
						size: "sm",
						autofocus: !0,
						placeholder: T("Search Blocks")
					}],
					values: { query: t },
					onChange: (e, t) => n?.(t ?? "")
				})
			}),
			y && /* @__PURE__ */ H("div", {
				className: "border-b border-border p-1.5",
				children: /* @__PURE__ */ H(ye, {
					size: "sm",
					block: !0,
					"aria-label": T("Show"),
					value: g,
					onChange: _,
					options: [{
						value: "blocks",
						label: T("Blocks")
					}, {
						value: "components",
						label: T("Components")
					}]
				})
			}),
			/* @__PURE__ */ U("div", {
				ref: ee,
				className: "min-h-0 flex-1 overflow-y-auto p-1",
				children: [
					x.length === 0 && /* @__PURE__ */ H("div", {
						className: "px-3 py-6 text-center text-xs text-faint",
						children: T("No matching blocks")
					}),
					b && x.map((e, t) => {
						if (e.kind !== "component") return null;
						let n = e.component.category === D ? null : e.component.category;
						return D = e.component.category, /* @__PURE__ */ U("div", { children: [n && /* @__PURE__ */ H("div", {
							className: "cms-label px-2 pb-1 pt-2",
							children: n
						}), /* @__PURE__ */ H(B, {
							content: e.component.description,
							side: "right",
							children: /* @__PURE__ */ U(P, {
								variant: "ghost",
								size: "md",
								"data-index": t,
								onMouseMove: () => t !== S && C(t),
								onMouseDown: (e) => e.preventDefault(),
								onClick: () => r(e),
								"data-active": t === S || void 0,
								className: "!h-auto w-full !flex-col !items-stretch !gap-1.5 !rounded-sm !p-1.5 text-left",
								children: [/* @__PURE__ */ H(ge, {
									src: qn(e.component.handle),
									maxHeight: 160
								}), /* @__PURE__ */ U("span", {
									className: "flex min-w-0 items-center gap-1.5 px-0.5 text-sm",
									children: [/* @__PURE__ */ H(I, {
										name: Xn(e),
										size: 13,
										className: "shrink-0 text-faint"
									}), /* @__PURE__ */ H("span", {
										className: "min-w-0 truncate",
										children: e.component.title
									})]
								})]
							})
						})] }, Zn(e));
					}),
					!b && x.map((e, t) => {
						let n = e.group === D ? null : e.group;
						D = e.group;
						let i = Yn(e), a = e.kind === "block" ? e.type.description : e.component.description || e.component.category, o = Xn(e);
						return /* @__PURE__ */ U("div", { children: [n && /* @__PURE__ */ H("div", {
							className: "cms-label px-2 pb-1 pt-2",
							children: n
						}), /* @__PURE__ */ H(B, {
							content: a,
							side: "right",
							children: /* @__PURE__ */ U(P, {
								variant: "ghost",
								size: "md",
								"data-index": t,
								onMouseMove: () => t !== S && C(t),
								onMouseDown: (e) => e.preventDefault(),
								onClick: () => r(e),
								"data-active": t === S || void 0,
								className: V("w-full !justify-start !gap-2.5 !rounded-sm !px-2 text-left", !l && "!h-9"),
								children: [/* @__PURE__ */ H("span", {
									className: "grid size-7 shrink-0 place-items-center rounded-xs border border-border bg-surface text-muted",
									children: /* @__PURE__ */ H(I, {
										name: o,
										size: 14
									})
								}), /* @__PURE__ */ H("span", {
									className: "min-w-0 truncate",
									children: i
								})]
							})
						})] }, Zn(e));
					})
				]
			})
		]
	});
}
// admin/src/core/SaveComponent.tsx
function nr(e, t, n = "component") {
	let r = e.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 56) || n, i = r;
	for (let e = 2; t.has(i); e++) i = `${r}-${e}`;
	return i;
}
var rr = [
	"Heroes",
	"Text",
	"Media",
	"Features",
	"People",
	"Lists",
	"Calls to Action",
	"Pages"
];
function ir(e) {
	let t = document.createElement("div");
	document.body.appendChild(t);
	let n = Ie(t);
	n.render(e(() => setTimeout(() => {
		n.unmount(), t.remove();
	}, 250)));
}
function ar(e) {
	return e.selection().map((n) => t(e.get().nodes, n)).filter((e) => !!e);
}
function or(e, t) {
	let n = ar(e);
	n.length !== 0 && ir((r) => {
		function i() {
			let [i, a] = M(!0), [o, s] = M({
				title: "",
				synced: t,
				category: "",
				description: ""
			}), [c, l] = M(!1), u = () => {
				a(!1), r();
			}, d = async () => {
				let r = o.title.trim();
				if (!r) return;
				let i = t && o.synced;
				l(!0);
				try {
					let t = await w("components/list", { working: !0 }), a = nr(r, new Set(t.map((e) => e.handle)));
					await w("components/save", {
						handle: a,
						title: r,
						synced: i,
						description: o.description.trim(),
						category: o.category.trim() || void 0,
						blocks: n
					}), b("components/"), i && e.replaceSelection([{
						id: g(),
						type: "component",
						props: { ref: a }
					}]), Ae.success(T(i ? "“{title}” is now a component" : "Saved “{title}” as a component", { title: r })), u();
				} catch (e) {
					Ae.error(e), l(!1);
				}
			}, f = t && o.synced;
			return /* @__PURE__ */ H(ue, {
				open: i,
				onOpenChange: (e) => !e && u(),
				size: "sm",
				title: T("Make a Component"),
				description: f ? S(n.length, "{count} block, the same on every page", "{count} blocks, the same on every page") : S(n.length, "{count} block to start from on any page", "{count} blocks to start from on any page"),
				onSubmit: () => void d(),
				submitLabel: T("Make Component"),
				submitDisabled: !o.title.trim(),
				busy: c,
				children: /* @__PURE__ */ H(F, {
					fields: [
						{
							handle: "title",
							type: "text",
							label: T("Name"),
							required: !0,
							autofocus: !0,
							max: 120,
							placeholder: T("Pricing Card")
						},
						...t ? [{
							handle: "synced",
							type: "toggle",
							label: T("Synced")
						}] : [],
						{
							handle: "category",
							type: "text",
							label: T("Category"),
							max: 60,
							placeholder: T("Heroes"),
							suggestions: rr
						},
						{
							handle: "description",
							type: "text",
							label: T("Description"),
							max: 500,
							placeholder: T("When to Use It")
						}
					],
					values: o,
					onChange: (e, t) => s((n) => ({
						...n,
						[e]: e === "synced" ? !!t : t ?? ""
					}))
				})
			});
		}
		return /* @__PURE__ */ H(i, {});
	});
}
// admin/src/core/StartFromComponent.tsx
var sr = "Pages";
function cr(e) {
	let t = E("components/list", {
		category: sr,
		synced: !1
	}, {
		enabled: e,
		staleTime: 6e4
	});
	return e ? t.data ?? [] : [];
}
function lr({ open: e, onOpenChange: t, components: n, onChoose: r }) {
	return /* @__PURE__ */ H(ue, {
		open: e,
		onOpenChange: t,
		size: "lg",
		title: T("Start From a Component"),
		children: /* @__PURE__ */ H("div", {
			className: "grid gap-4 sm:grid-cols-2",
			children: n.map((e) => /* @__PURE__ */ U(z, {
				onClick: () => r(e),
				className: "block min-w-0 rounded-md p-1 text-left hover:bg-hover",
				children: [
					/* @__PURE__ */ H(ge, {
						src: qn(e.handle),
						maxHeight: 280
					}),
					/* @__PURE__ */ H("span", {
						className: "mt-2 block truncate text-sm font-medium text-text",
						children: e.title
					}),
					e.description && /* @__PURE__ */ H("span", {
						className: "mt-0.5 line-clamp-2 block text-xs text-muted",
						children: e.description
					})
				]
			}, e.handle))
		})
	});
}
// admin/src/core/insertionTargets.ts
var ur = 4, dr = 6, fr = 16, pr = (e) => e.left + e.width, mr = (e) => e.top + e.height, hr = (e, t) => t === "x" ? e.left + e.width / 2 : e.top + e.height / 2, gr = (e, t) => t === "x" ? e.left : e.top, _r = (e, t) => t === "x" ? pr(e) : mr(e), vr = (e) => [
	e.left,
	e.top,
	e.width,
	e.height
].every(Number.isFinite) && e.width > 0 && e.height >= 0, yr = (e, t) => t.x >= e.left && t.x <= pr(e) && t.y >= e.top && t.y <= mr(e);
function br(e, t) {
	return Math.hypot(Math.max(e.left - t.x, 0, t.x - pr(e)), Math.max(e.top - t.y, 0, t.y - mr(e)));
}
function xr(e, t) {
	return Math.min(mr(e), mr(t)) - Math.max(e.top, t.top) > 0 && Math.abs(hr(t, "x") - hr(e, "x")) > Math.abs(hr(t, "y") - hr(e, "y")) ? "x" : "y";
}
function Sr(e, t, n) {
	let r = Math.min(mr(e), mr(t)) - Math.max(e.top, t.top), i = Math.min(pr(e), pr(t)) - Math.max(e.left, t.left);
	return n === "x" && r > 0 ? "x" : n === "y" && i > 0 ? "y" : xr(e, t);
}
function Cr(e, t) {
	let n = new Map(e.map((e) => [e.id, e]));
	return {
		byId: n,
		depth: (e) => {
			let t = /* @__PURE__ */ new Set();
			for (; e && !t.has(e);) t.add(e), e = n.get(e)?.parentId ?? null;
			return t.size;
		},
		isExcluded: (e) => {
			let r = /* @__PURE__ */ new Set(), i = e.id;
			for (; i && !r.has(i);) {
				if (t?.has(i)) return !0;
				r.add(i), i = n.get(i)?.parentId ?? null;
			}
			return !1;
		}
	};
}
function wr(e, t) {
	let { byId: n, depth: r, isExcluded: i } = Cr(e, t.excludeIds), a = /* @__PURE__ */ new Map([[null, []]]);
	for (let t of e) {
		if (!vr(t.rect) || !t.container && t.rect.height === 0 || i(t)) continue;
		let e = a.get(t.parentId) ?? [];
		e.push(t), a.set(t.parentId, e), t.container && !a.has(t.id) && a.set(t.id, []);
	}
	let o = [];
	for (let [e, i] of a) {
		let a = e === null ? null : n.get(e), s = e === null ? t.rootRect : a?.rect;
		if (!s || !vr(s)) continue;
		let c = [...i].sort((e, t) => e.index - t.index), l = e === null ? t.rootAxis : a?.axis, u = (n) => t.canInsert?.(e, n) ?? !0, d = r(e);
		if (!c.length) {
			u(0) && o.push({
				parentId: e,
				index: 0,
				axis: l ?? "y",
				rect: {
					left: s.left,
					top: s.top,
					width: s.width,
					height: 2
				},
				hitRect: s,
				inside: !0,
				kind: "inside",
				depth: d
			});
			continue;
		}
		let f = (t, n, r, i, a, s, c, l) => {
			if (!u(t)) return;
			let f = Math.sign(i - r), p = Math.min(Math.abs(i - r) / 2, ur), m = l === "from" ? r + f * p : l === "to" ? i - f * p : (r + i) / 2, h = Math.min(r, i), g = Math.abs(i - r), _ = n === "x" ? {
				left: h,
				top: a.top,
				width: g,
				height: a.height
			} : {
				left: a.left,
				top: h,
				width: a.width,
				height: g
			}, v = n === "x" ? {
				left: m - 1,
				top: s.top,
				width: 2,
				height: s.height
			} : {
				left: s.left,
				top: m - 1,
				width: s.width,
				height: 2
			};
			o.push({
				parentId: e,
				index: t,
				axis: n,
				rect: v,
				hitRect: _,
				inside: !1,
				kind: c,
				depth: d
			});
		}, p = (e, t) => {
			let n = Math.min(e.left, t.left), r = Math.min(e.top, t.top);
			return {
				left: n,
				top: r,
				width: Math.max(pr(e), pr(t)) - n,
				height: Math.max(mr(e), mr(t)) - r
			};
		}, m = c[0], h = c.at(-1), g = c.length > 1 ? Sr(m.rect, c[1].rect, l) : l ?? "y", _ = c.length > 1 ? Sr(c.at(-2).rect, h.rect, l) : l ?? "y", v = c.length < 2 || hr(c[1].rect, g) >= hr(m.rect, g), y = c.length < 2 || hr(h.rect, _) >= hr(c.at(-2).rect, _), b = v ? gr(m.rect, g) : _r(m.rect, g), x = y ? _r(h.rect, _) : gr(h.rect, _);
		f(m.index, g, v ? gr(s, g) : _r(s, g), b, g === "x" ? m.rect : s, m.rect, "edge", "to");
		for (let e = 1; e < c.length; e++) {
			let t = c[e - 1], n = c[e], r = Sr(t.rect, n.rect, l), i = hr(n.rect, r) >= hr(t.rect, r), a = i ? _r(t.rect, r) : gr(t.rect, r), o = i ? gr(n.rect, r) : _r(n.rect, r), u = Math.max(t.rect.top, n.rect.top), d = Math.min(mr(t.rect), mr(n.rect)), m = r === "x" ? {
				left: s.left,
				top: u,
				width: s.width,
				height: Math.max(0, d - u)
			} : s, h = i ? o < a : o > a;
			f(n.index, r, h ? (a + o) / 2 : a, h ? (a + o) / 2 : o, m, r === "x" && m.height > 0 ? m : p(t.rect, n.rect), "between");
		}
		f(h.index + 1, _, x, y ? _r(s, _) : gr(s, _), _ === "x" ? h.rect : s, h.rect, "edge", "from");
	}
	return o;
}
function Tr(e, t, n) {
	if (![t.x, t.y].every(Number.isFinite)) return null;
	let r = wr(e, n).flatMap((e) => {
		if (e.inside) return [];
		let n = e.axis === "x", r = n ? t.x : t.y, i = n ? t.y : t.x, a = (n ? e.rect.left : e.rect.top) + 1, o = n ? e.hitRect.left : e.hitRect.top, s = n ? e.hitRect.width : e.hitRect.height, c = Math.max(0, dr - s / 2), l = Math.max(o - c, a - fr), u = Math.min(o + s + c, a + fr), d = n ? e.hitRect.top : e.hitRect.left, f = d + (n ? e.hitRect.height : e.hitRect.width);
		return r >= l && r <= u && i >= d && i <= f ? [{
			target: e,
			distance: Math.abs(r - a)
		}] : [];
	});
	if (!r.length) return null;
	let i = Math.min(...r.map((e) => e.distance));
	return r.filter((e) => e.distance <= i + 2).sort((e, t) => Number(e.target.kind === "edge") - Number(t.target.kind === "edge") || t.target.depth - e.target.depth || e.distance - t.distance)[0].target;
}
function Er(e, t, n) {
	if (![t.x, t.y].every(Number.isFinite)) return null;
	let { isExcluded: r } = Cr(e, n.excludeIds);
	return e.some((e) => r(e) && yr(e.rect, t)) ? null : wr(e, n).map((e) => ({
		target: e,
		distance: br(e.inside ? e.hitRect : e.rect, t)
	})).filter(({ distance: e }) => e <= (n.maxDistance ?? 80)).sort((e, t) => e.distance - t.distance || t.target.depth - e.target.depth)[0]?.target ?? null;
}
// admin/src/core/QuickInserter.tsx
var Dr = "cms:blocks:recent", Or = [
	"paragraph",
	"heading",
	"image",
	"list",
	"button",
	"box"
], kr = 6, Ar = 9, jr = 3;
function Mr() {
	try {
		let e = JSON.parse(localStorage.getItem(Dr) ?? "[]");
		return Array.isArray(e) ? e.filter((e) => typeof e == "string") : [];
	} catch {
		return [];
	}
}
function Nr(e) {
	if (e.kind === "block") try {
		localStorage.setItem(Dr, JSON.stringify([e.type.name, ...Mr().filter((t) => t !== e.type.name)].slice(0, 12)));
	} catch {}
}
function Pr({ types: e, allowed: t, onChoose: n, onClose: r }) {
	let [i, a] = M(""), [o, s] = M(!1), [c, l] = M(0), { items: u } = er(e, i, t, !!i.trim()), d = A(() => {
		if (i.trim()) return u.slice(0, Ar);
		let e = [...Mr(), ...Or], t = (t) => {
			let n = t.kind === "block" ? e.indexOf(t.type.name) : -1;
			return n < 0 ? e.length : n;
		};
		return u.filter((e) => e.kind === "block").sort((e, n) => t(e) - t(n)).slice(0, kr);
	}, [u, i]);
	k(() => l(0), [i]);
	let f = (e) => {
		Nr(e), n(e);
	};
	return o ? /* @__PURE__ */ H("div", {
		"data-cms-insert-menu": !0,
		"data-cms-browse": !0,
		children: /* @__PURE__ */ H(tr, {
			types: e,
			query: i,
			onQuery: a,
			allowed: t,
			onChoose: f,
			onClose: r
		})
	}) : /* @__PURE__ */ U("div", {
		"data-cms-insert-menu": !0,
		className: "flex w-[300px] flex-col",
		onKeyDown: (e) => {
			let t = {
				ArrowRight: 1,
				ArrowLeft: -1,
				ArrowDown: jr,
				ArrowUp: -3
			}[e.key];
			t && d.length ? (e.preventDefault(), l((e) => Math.max(0, Math.min(d.length - 1, e + t)))) : e.key === "Enter" && d[c] ? (e.preventDefault(), f(d[c])) : e.key === "Escape" && (e.preventDefault(), r());
		},
		children: [
			/* @__PURE__ */ H("div", {
				className: "p-2 pb-0",
				children: /* @__PURE__ */ H(F, {
					bare: !0,
					fields: [{
						handle: "query",
						type: "text",
						label: T("Search"),
						icon: "search",
						size: "sm",
						autofocus: !0,
						placeholder: T("Search Blocks")
					}],
					values: { query: i },
					onChange: (e, t) => a(t ?? "")
				})
			}),
			/* @__PURE__ */ U("div", {
				role: "listbox",
				"aria-label": i.trim() ? T("Results") : T("Suggestions"),
				className: "grid grid-cols-3 gap-1 p-2",
				children: [d.map((e, t) => {
					let n = Yn(e), r = Xn(e);
					return /* @__PURE__ */ U(P, {
						variant: "ghost",
						role: "option",
						"aria-selected": t === c,
						"data-index": t,
						onMouseMove: () => t !== c && l(t),
						onMouseDown: (e) => e.preventDefault(),
						onClick: () => f(e),
						"data-active": t === c || void 0,
						className: "!h-[68px] min-w-0 shrink !flex-col !gap-1.5 !px-1",
						children: [/* @__PURE__ */ H(I, {
							name: r,
							size: 20
						}), /* @__PURE__ */ H("span", {
							className: "w-full truncate text-center text-xs font-medium",
							children: n
						})]
					}, Zn(e));
				}), !d.length && /* @__PURE__ */ H("div", {
					className: "col-span-3 px-3 py-5 text-center text-xs text-faint",
					children: T("No matching blocks")
				})]
			}),
			/* @__PURE__ */ U(P, {
				variant: "ghost",
				size: "lg",
				onMouseDown: (e) => e.preventDefault(),
				onClick: () => s(!0),
				className: "!h-9 !gap-1.5 !rounded-none border-t border-border !text-sm focus-visible:!-outline-offset-2",
				children: [T("Browse All"), /* @__PURE__ */ H(I, {
					name: "arrow-right",
					size: 14,
					className: "text-muted"
				})]
			})
		]
	});
}
// admin/src/core/canvas.ts
function Fr(e, t) {
	let n = [.../* @__PURE__ */ new Set([HTMLCanvasElement.prototype, e.HTMLCanvasElement.prototype])], r = n.map((e) => e.getContext);
	n.forEach((e, t) => {
		e.getContext = function(e, n) {
			return r[t].call(this, e, e.startsWith("webgl") || e === "experimental-webgl" ? {
				...n,
				preserveDrawingBuffer: !0
			} : n);
		};
	});
	try {
		return t();
	} finally {
		n.forEach((e, t) => {
			e.getContext = r[t];
		});
	}
}
function Ir(e, t) {
	let n = /* @__PURE__ */ new Map(), r = () => {
		for (let r of e.querySelectorAll("canvas")) {
			let i = n.get(r);
			if (!i) {
				i = e.ownerDocument.createElement("img"), i.alt = "", i.setAttribute("aria-hidden", "true"), i.dataset.cmsCanvasPicture = "";
				let a = t.getComputedStyle(r);
				for (let e of [
					"position",
					"inset",
					"top",
					"right",
					"bottom",
					"left",
					"width",
					"height",
					"display",
					"z-index",
					"transform",
					"opacity",
					"border-radius",
					"pointer-events"
				]) i.style.setProperty(e, a.getPropertyValue(e));
				r.after(i), r.style.display = "none", n.set(r, i);
			}
			try {
				r.width && r.height && (i.src = r.toDataURL());
			} catch {}
		}
	};
	r();
	let i = requestAnimationFrame(() => requestAnimationFrame(r)), a = [
		300,
		1e3,
		2500
	].map((e) => setTimeout(r, e)), o = new ResizeObserver(() => requestAnimationFrame(r));
	return o.observe(e), () => {
		cancelAnimationFrame(i), a.forEach(clearTimeout), o.disconnect();
		for (let [e, t] of n) t.remove(), e.style.display = "";
	};
}
var Lr = "/_cms/site/";
function Rr(e, t = location.href) {
	try {
		let n = new URL(e, t);
		return n.origin === location.origin && n.pathname.startsWith(Lr) ? n.pathname : null;
	} catch {
		return null;
	}
}
var zr = /\bimport\s*(?:[\w$*{}\s,]+?\s*from\s*)?["']([^"']+)["']|\bexport\s*[\w$*{}\s,]*?\s*from\s*["']([^"']+)["']|\bimport\s*\(\s*["']([^"']+)["']\s*\)/g;
async function Br(e, t) {
	let n = {}, r = {}, i = /* @__PURE__ */ new Set(), a = async (e) => {
		if (i.has(e) || i.size > 200) return;
		i.add(e);
		let o = await fetch(e, { credentials: "same-origin" }).then((e) => e.ok ? e.text() : "", () => ""), s = [];
		for (let i of o.matchAll(zr)) {
			let a = i[1] ?? i[2] ?? i[3], o = /^(\/|\.\/|\.\.\/)/.test(a), c = o ? Rr(a, location.origin + e) : a, l = c ? Rr(t.imports?.[c] ?? (o ? c : "")) : null;
			c && l && (t.imports?.[c] && (n[c] = l), t.integrity?.[l] && (r[l] = t.integrity[l]), s.push(l));
		}
		await Promise.all(s.map(a));
	};
	return await a(e), {
		imports: n,
		...Object.keys(r).length ? { integrity: r } : {}
	};
}
async function Vr(e, t) {
	let n;
	try {
		n = JSON.parse(e.querySelector("script[data-cms-importmap]")?.textContent ?? "{}");
	} catch {
		return null;
	}
	let r = await Br(t, n);
	if (!Object.keys(r.imports ?? {}).length) return null;
	let i = document.createElement("script");
	return i.type = "importmap", i.dataset.cmsCanvas = "", i.nonce = document.querySelector("script[nonce]")?.nonce ?? "", i.textContent = JSON.stringify(r), document.head.append(i), i;
}
function Hr(e) {
	try {
		return JSON.parse(e.dataset.cmsCanvas ?? "[]").flatMap((e) => {
			let t = typeof e?.src == "string" ? Rr(e.src) : null;
			return t ? [{
				...e,
				src: t
			}] : [];
		});
	} catch {
		return [];
	}
}
var Ur = (e, t) => console.error("[cms] canvas behavior", e, t);
function Wr() {
	let e = [], t = [];
	async function n(e, n, r) {
		let i = r.defaultView;
		if (i) try {
			let a = await Vr(r, n.src);
			if (e.abort.signal.aborted) {
				a?.remove();
				return;
			}
			a && t.push(a);
			let o = await import(
				/* @vite-ignore */
				n.src
);
			if (e.abort.signal.aborted || o.canvas !== !0) return;
			e.module = o;
			let s = {
				token: (t) => {
					let n = i.getComputedStyle(e.el).getPropertyValue(t).trim();
					if (!n.includes("light-dark(")) return n;
					let r = e.el.ownerDocument.createElement("span");
					r.style.cssText = `display:none;color:${n}`, e.el.append(r);
					let a = i.getComputedStyle(r).color;
					return r.remove(), a;
				},
				reducedMotion: i.matchMedia("(prefers-reduced-motion: reduce)").matches,
				signal: e.abort.signal,
				canvas: !0,
				window: i,
				document: r
			}, c = o.mount ?? o.default, l = await Fr(i, () => c?.(e.el, n.props ?? {}, s));
			if (e.abort.signal.aborted) {
				typeof l == "function" && l();
				return;
			}
			typeof l == "function" && (e.cleanup = l), e.unpicture = Ir(e.el, i);
		} catch (e) {
			Ur(n.src, e);
		}
	}
	return {
		mount(t) {
			for (let r of t.querySelectorAll("[data-cms-canvas]")) for (let i of Hr(r)) {
				let a = {
					el: r,
					abort: new AbortController()
				};
				e.push(a), n(a, i, t);
			}
		},
		unmount() {
			let n = e.reverse();
			e = [];
			for (let e of n) {
				e.abort.abort();
				try {
					e.unpicture?.(), e.cleanup?.(), e.module?.unmount?.(e.el);
				} catch (t) {
					Ur(e.module ? "unmount" : "mount", t);
				}
			}
			t.forEach((e) => e.remove()), t = [];
		}
	};
}
// admin/src/core/morph.ts
function Gr(e, t) {
	let n = (e) => {
		if (e.nodeType !== 1) return null;
		let t = e;
		return t.hasAttribute("data-cms-document") && t.dataset.cmsNode ? `node:${t.dataset.cmsNode}` : t.hasAttribute("data-cms-editor-root") ? "source-root" : null;
	}, r = /* @__PURE__ */ new Map();
	for (let t of e.body.querySelectorAll("[data-cms-document][data-cms-node],[data-cms-editor-root]")) {
		let e = n(t);
		e && r.set(e, t);
	}
	let i = (e, t) => {
		for (let n of [...e.attributes]) t.hasAttribute(n.name) || e.removeAttribute(n.name);
		for (let n of [...t.attributes]) e.getAttribute(n.name) !== n.value && e.setAttribute(n.name, n.value);
	}, a = (t, o) => {
		if (t.nodeType === 3 || t.nodeType === 8) {
			t.nodeValue !== o.nodeValue && (t.nodeValue = o.nodeValue);
			return;
		}
		let s = t, c = o, l = s.hasAttribute("data-cms-prop") && s.getAttribute("data-cms-prop") === c.getAttribute("data-cms-prop") && s.getAttribute("data-cms-index") === c.getAttribute("data-cms-index") || s.hasAttribute("data-cms-entry-field") && s.getAttribute("data-cms-entry-field") === c.getAttribute("data-cms-entry-field") || s.hasAttribute("data-cms-instance-prop") && s.getAttribute("data-cms-instance-node") === c.getAttribute("data-cms-instance-node") && s.getAttribute("data-cms-instance-prop") === c.getAttribute("data-cms-instance-prop");
		if (i(s, c), l && s.querySelector("[data-cms-inline]")) return;
		if (s.tagName === "TEMPLATE") {
			s.innerHTML = c.innerHTML;
			return;
		}
		let u = /* @__PURE__ */ new Set(), d = s.firstChild;
		for (let t of [...c.childNodes]) {
			let i = n(t), o = i ? r.get(i) ?? null : d;
			o && (u.has(o) || n(o) !== i || o.nodeType !== t.nodeType || o.nodeType === 1 && o.tagName !== t.tagName) && (o = null), o ||= e.importNode(t, !0), o !== d && s.insertBefore(o, d), u.add(o), a(o, t), d = o.nextSibling;
		}
		for (let t of [...s.childNodes]) u.has(t) || (t.nodeType !== 1 || n(t) || !t.hasAttribute("data-cms-prop") && !t.hasAttribute("data-cms-instance-prop") || !t.contains(e.activeElement)) && t.remove();
	};
	i(e.documentElement, t.documentElement), a(e.body, t.body);
	let o = "style:not([data-cms-bridge]),link[rel=\"stylesheet\"]", s = (e) => [...e.head.querySelectorAll(o)].map((e) => e.outerHTML).join("");
	if (s(e) !== s(t)) {
		for (let t of [...e.head.querySelectorAll(o)]) t.remove();
		for (let n of t.head.querySelectorAll(o)) e.head.appendChild(e.importNode(n, !0));
	}
	e.title = t.title;
}
// admin/src/core/useBlockDrag.ts
function Kr(e) {
	let t = j(e);
	t.current = e;
	let [n, r] = M(null), i = j(null), a = j(() => {});
	return k(() => {
		e.disabled && a.current();
	}, [e.disabled]), k(() => () => a.current(), []), {
		drag: n,
		start: (e, n, o) => {
			if (t.current.disabled || e.button !== 0 || !n.length) return;
			e.preventDefault(), a.current(), i.current = {
				ids: n,
				label: o,
				point: {
					x: e.clientX,
					y: e.clientY
				},
				start: {
					x: e.clientX,
					y: e.clientY
				},
				target: null,
				active: !1,
				pointerId: e.pointerId,
				dirty: !0
			};
			try {
				e.currentTarget.setPointerCapture(e.pointerId);
			} catch {}
			let s = e.currentTarget.ownerDocument, c = 0, l = s.body.style.cursor, u = s.body.style.userSelect, d = (e = !1) => {
				let n = i.current;
				i.current = null, cancelAnimationFrame(c), s.removeEventListener("pointermove", p), s.removeEventListener("pointerup", m), s.removeEventListener("pointercancel", h), s.removeEventListener("keydown", g), s.defaultView?.removeEventListener("blur", h), s.body.style.cursor = l, s.body.style.userSelect = u, r(null), e && n?.active && n.target && !t.current.disabled && t.current.commit(n.ids, n.target);
			};
			a.current = d;
			let f = () => {
				let e = i.current, { frame: n, scale: a, invalidate: o, target: s } = t.current, l = n.current;
				if (!e?.active || !l || t.current.disabled) {
					d();
					return;
				}
				let u = l.getBoundingClientRect(), p = {
					x: (e.point.x - u.left) / a,
					y: (e.point.y - u.top) / a
				}, m = e.point.x >= u.left && e.point.x <= u.right && e.point.y >= u.top && e.point.y <= u.bottom, h = Math.min(48, u.height / 4), g = m ? e.point.y < u.top + h ? -Math.ceil((u.top + h - e.point.y) / 4) : e.point.y > u.bottom - h ? Math.ceil((e.point.y - u.bottom + h) / 4) : 0 : 0;
				g && (l.contentWindow?.scrollBy(0, g / a), o()), (e.dirty || g) && (e.target = m ? s(p, e.ids) : null, e.dirty = !1, r({
					ids: e.ids,
					label: e.label,
					point: e.point,
					target: e.target
				})), c = requestAnimationFrame(f);
			}, p = (e) => {
				let t = i.current;
				t && e.pointerId === t.pointerId && (t.point = {
					x: e.clientX,
					y: e.clientY
				}, t.dirty = !0, !t.active && Math.hypot(e.clientX - t.start.x, e.clientY - t.start.y) >= 4 && (t.active = !0, s.body.style.cursor = "grabbing", s.body.style.userSelect = "none", c = requestAnimationFrame(f), r({
					ids: t.ids,
					label: t.label,
					point: t.point,
					target: null
				})), t.active && e.preventDefault());
			}, m = (e) => {
				if (e.pointerId !== i.current?.pointerId) return;
				let n = i.current, r = t.current.frame.current;
				if (n?.active && r) {
					let i = r.getBoundingClientRect(), a = t.current.scale;
					n.target = e.clientX >= i.left && e.clientX <= i.right && e.clientY >= i.top && e.clientY <= i.bottom ? t.current.target({
						x: (e.clientX - i.left) / a,
						y: (e.clientY - i.top) / a
					}, n.ids) : null;
				}
				d(!0);
			}, h = () => d(), g = (e) => {
				e.key === "Escape" && (e.preventDefault(), d());
			};
			s.addEventListener("pointermove", p, { passive: !1 }), s.addEventListener("pointerup", m), s.addEventListener("pointercancel", h), s.addEventListener("keydown", g), s.defaultView?.addEventListener("blur", h);
		},
		cancel: () => a.current()
	};
}
// admin/src/LiveBlockControls.tsx
var qr = 32, Jr = 6, Yr = 4;
function Xr({ target: e, position: t, ...n }) {
	let r = t(e.rect);
	return /* @__PURE__ */ U(Ne, { children: [/* @__PURE__ */ H("div", {
		"data-cms-insertion-line": !0,
		className: V("pointer-events-none absolute z-raised rounded-full bg-focus", e.axis === "x" ? "cms-block-line-y" : "cms-block-line-x"),
		style: {
			...r,
			minWidth: 2,
			minHeight: 2
		}
	}), /* @__PURE__ */ H($r, {
		...n,
		label: T("Insert Block"),
		className: "cms-block-plus absolute size-6 -translate-x-1/2 -translate-y-1/2 rounded-xs bg-signal text-signal-ink shadow-sm",
		style: {
			left: r.left + r.width / 2,
			top: r.top + r.height / 2
		},
		data: { "data-cms-inserter": `${e.parentId ?? ""}:${e.index}` }
	})] });
}
function Zr({ target: e, position: t, ...n }) {
	let r = t(e.hitRect);
	return /* @__PURE__ */ H($r, {
		...n,
		label: T("Insert Block"),
		className: "cms-block-chrome absolute size-7 -translate-x-1/2 -translate-y-1/2 rounded-sm border border-border-strong bg-bg text-muted shadow-sm hover:border-focus hover:text-focus",
		style: {
			left: r.left + r.width / 2,
			top: r.top + Math.min(r.height / 2, 40)
		},
		data: { "data-cms-appender": e.parentId ?? "" }
	});
}
function Qr({ target: e, position: t, onWrite: n, onStart: r, ...i }) {
	let a = t(e.hitRect);
	return /* @__PURE__ */ U("div", {
		"data-cms-document-appender": !0,
		className: "cms-block-chrome pointer-events-auto absolute z-raised flex h-10 whitespace-nowrap -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-md border border-dashed border-border-strong bg-bg/90 py-1 pl-3 pr-1 shadow-sm",
		style: {
			left: a.left + a.width / 2,
			top: a.top + Math.max(24, Math.min(a.height / 2, 120))
		},
		children: [
			n && /* @__PURE__ */ H(z, {
				compact: !0,
				onClick: n,
				className: "cms-focus-ring h-8 rounded-xs px-1 text-sm text-muted hover:text-text",
				children: T("Write, or press “/” for blocks")
			}),
			r && /* @__PURE__ */ U(Ne, { children: [/* @__PURE__ */ H("span", { className: "mx-1 h-4 border-l border-border" }), /* @__PURE__ */ H(z, {
				compact: !0,
				onClick: r,
				className: "cms-focus-ring h-8 rounded-xs px-1 text-sm text-muted hover:text-text",
				children: T("Start From a Component")
			})] }),
			/* @__PURE__ */ H($r, {
				...i,
				label: T("Insert Block"),
				className: "size-8 rounded-xs text-muted hover:bg-hover hover:text-text"
			})
		]
	});
}
function $r({ open: e, onOpenChange: t, returnFocus: n, children: r, label: i, className: a, style: o, data: s }) {
	return /* @__PURE__ */ H(R, {
		open: e,
		onOpenChange: t,
		side: "bottom",
		align: "center",
		className: "!overflow-hidden !p-0",
		returnFocus: n,
		trigger: /* @__PURE__ */ H(z, {
			compact: !0,
			...s,
			"aria-label": e ? T("Close") : i,
			"aria-expanded": e,
			className: V("cms-focus-ring pointer-events-auto z-drag grid place-items-center", a),
			style: o,
			children: /* @__PURE__ */ H(I, {
				name: "plus",
				size: 14,
				className: V("cms-block-plus-icon", e && "rotate-45")
			})
		}),
		children: e && r
	});
}
function ei(e) {
	return [
		{
			label: T("Cut"),
			icon: "scissors",
			shortcut: "mod+x",
			onSelect: e.onCut
		},
		{
			label: T("Copy"),
			icon: "copy",
			shortcut: "mod+c",
			onSelect: e.onCopy
		},
		{
			label: T("Paste"),
			icon: "clipboard",
			shortcut: "mod+v",
			onSelect: e.onPaste
		},
		{
			label: T("Duplicate"),
			icon: "duplicate",
			shortcut: "mod+d",
			onSelect: e.onDuplicate
		},
		{
			separator: !0,
			label: ""
		},
		{
			label: T("Insert Before"),
			icon: "arrow-up",
			shortcut: "alt+mod+t",
			onSelect: () => e.onInsert("before")
		},
		{
			label: T("Insert After"),
			icon: "arrow-down",
			shortcut: "alt+mod+y",
			onSelect: () => e.onInsert("after")
		},
		{
			separator: !0,
			label: ""
		},
		{
			label: T("Move Up"),
			icon: "chevron-up",
			shortcut: "alt+up",
			disabled: !e.canMoveUp,
			onSelect: () => e.onMove(-1)
		},
		{
			label: T("Move Down"),
			icon: "chevron-down",
			shortcut: "alt+down",
			disabled: !e.canMoveDown,
			onSelect: () => e.onMove(1)
		},
		...e.parent ? [{
			label: T("Select {block}", { block: e.parent.label }),
			icon: "arrow-elbow-left-up",
			onSelect: e.onSelectParent
		}] : [],
		...e.onMakeComponent ? [{
			separator: !0,
			label: ""
		}, {
			label: T("Make a Component"),
			icon: "symbol",
			onSelect: e.onMakeComponent
		}] : [],
		{
			separator: !0,
			label: ""
		},
		{
			label: T("Delete"),
			icon: "trash",
			danger: !0,
			shortcut: "backspace",
			onSelect: e.onDelete
		}
	];
}
function ti(e) {
	let { id: t, label: n, icon: r, parent: i, box: a, viewport: o, canMoveUp: s, canMoveDown: c, onSelectParent: l, onDrag: u, onMove: d, covers: f } = e, p = j(null), [m, h] = M(240);
	le(() => {
		p.current && h(p.current.offsetWidth);
	});
	let g = a.top + a.height;
	if (g < 40 || a.top > o.height - qr || a.left > o.width || a.left + a.width < 0) return null;
	let _ = (e) => Math.max(Yr, Math.min(o.width - m - Yr, e)), v = _(a.left), y = _(a.left + a.width - m), b = a.top - qr - Jr, x = g + Jr, S = Math.max(Yr, a.top + Yr), C = (e) => e >= Yr && e + qr <= o.height - Yr, { left: ee, top: w } = [
		b,
		x,
		S
	].flatMap((e) => [{
		left: v,
		top: e
	}, {
		left: y,
		top: e
	}]).find((e) => C(e.top) && !f?.({
		...e,
		width: m,
		height: qr
	})) ?? {
		left: v,
		top: C(b) ? b : S
	};
	return /* @__PURE__ */ U("div", {
		ref: p,
		"data-cms-block-controls": t,
		role: "toolbar",
		"aria-label": T("Block Actions"),
		className: "cms-block-chrome pointer-events-auto absolute z-bar flex h-8 items-center gap-0.5 rounded-sm border border-border bg-bg pl-0.5 pr-1 shadow-pop",
		style: {
			left: ee,
			top: w
		},
		children: [
			/* @__PURE__ */ H(B, {
				content: T("Drag to Reorder"),
				children: /* @__PURE__ */ H(z, {
					compact: !0,
					"aria-label": T("Drag to Reorder"),
					className: "cms-focus-ring grid h-6 w-4 touch-none cursor-grab place-items-center rounded-xs text-faint hover:bg-hover hover:text-muted active:cursor-grabbing",
					onPointerDown: u,
					children: /* @__PURE__ */ H(I, {
						name: "drag",
						size: 12
					})
				})
			}),
			i && /* @__PURE__ */ H(L, {
				size: "xs",
				icon: "arrow-elbow-left-up",
				label: T("Select {block}", { block: i.label }),
				onClick: l
			}),
			/* @__PURE__ */ H("span", { className: "mx-0.5 h-4 border-l border-border" }),
			/* @__PURE__ */ U("span", {
				className: "flex h-6 max-w-40 items-center gap-1.5 px-1 text-xs font-medium text-text",
				children: [/* @__PURE__ */ H(I, {
					name: r,
					size: 14,
					className: "shrink-0 text-muted"
				}), /* @__PURE__ */ H("span", {
					className: "truncate",
					children: n
				})]
			}),
			/* @__PURE__ */ H(L, {
				size: "xs",
				icon: "chevron-up",
				label: T("Move Up"),
				disabled: !s,
				onClick: () => d(-1)
			}),
			/* @__PURE__ */ H(L, {
				size: "xs",
				icon: "chevron-down",
				label: T("Move Down"),
				disabled: !c,
				onClick: () => d(1)
			}),
			/* @__PURE__ */ H("span", { className: "mx-0.5 h-4 border-l border-border" }),
			/* @__PURE__ */ H(de, {
				align: "end",
				trigger: /* @__PURE__ */ H(L, {
					size: "xs",
					icon: "more",
					label: T("More Block Actions")
				}),
				items: ei(e)
			})
		]
	});
}
function ni({ drag: e, position: t }) {
	return /* @__PURE__ */ U(Ne, { children: [
		/* @__PURE__ */ H("div", {
			"data-cms-drag-overlay": !0,
			className: "pointer-events-auto absolute inset-0 z-bar cursor-grabbing touch-none"
		}),
		e.target && /* @__PURE__ */ H("div", {
			"data-cms-drop-indicator": !0,
			className: "pointer-events-none absolute z-drawer rounded-full bg-focus",
			style: {
				...t(e.target.rect),
				minWidth: 2,
				minHeight: 2
			}
		}),
		/* @__PURE__ */ U("div", {
			"data-cms-drag-ghost": !0,
			className: "pointer-events-none fixed z-tooltip flex max-w-56 items-center gap-2 truncate rounded-sm border border-border-strong bg-bg px-3 py-2 text-xs text-ink shadow-pop",
			style: {
				left: Math.max(8, Math.min(window.innerWidth - 232, e.point.x + 16)),
				top: Math.max(8, Math.min(window.innerHeight - 40, e.point.y + 16))
			},
			children: [/* @__PURE__ */ H(I, {
				name: "drag",
				size: 14
			}), /* @__PURE__ */ H("span", {
				className: "truncate",
				children: e.label
			})]
		})
	] });
}
// admin/src/builder/bus.ts
var ri = new EventTarget(), ii = {
	emit(e, t) {
		ri.dispatchEvent(new CustomEvent(e, { detail: t }));
	},
	on(e, t) {
		let n = (e) => t(e.detail);
		return ri.addEventListener(e, n), () => ri.removeEventListener(e, n);
	}
}, ai = re({
	stops: () => [],
	settings: () => {},
	readOnly: !1
}), oi = () => se(ai);
function si(e = "") {
	return {
		id: g(),
		type: "paragraph",
		props: { text: e }
	};
}
function ci(e, t, n, r) {
	return e.id === t && e.prop === n && (r === void 0 || e.index === r);
}
function li(e, t, n) {
	e.focus(t.id, n, t.prop, t.index);
}
function ui(e, t, n) {
	if (!t) return;
	let r = /* @__PURE__ */ new Set(), i = (e) => {
		r.add(e.id), e.children?.forEach(i);
	};
	i(t);
	let a = n.find((e) => r.has(e.id));
	a ? li(e, a, "start") : e.select(t.id, !0);
}
function di(e) {
	let t = e.getElementById("f-title");
	return t ? (t.focus(), t.setSelectionRange(t.value.length, t.value.length), !0) : !1;
}
function fi(e, t, n, r, i) {
	if (e.shiftKey || e.metaKey || e.ctrlKey || e.altKey) return !1;
	let a = e.key === "ArrowUp" && An(t) || e.key === "ArrowLeft" && Tn(t), o = e.key === "ArrowDown" && jn(t) || e.key === "ArrowRight" && En(t);
	if (a) {
		let a = r[i - 1];
		if (a) li(n, a, "end");
		else if (e.key !== "ArrowUp" || !di(t.ownerDocument)) return !1;
		return e.preventDefault(), !0;
	}
	if (o) {
		let t = r[i + 1];
		return t ? (e.preventDefault(), li(n, t, "start"), !0) : !1;
	}
	return !1;
}
// admin/src/write/outline.ts
var pi = [
	"paragraph",
	"heading",
	"quote",
	"callout"
];
function mi(e) {
	return e.kind === "actions" ? e.nodes : [e.node];
}
function hi(e) {
	return mi(e)[0].id;
}
function gi(e, t, n) {
	let r = {
		types: t,
		custom: n
	}, i = [];
	for (let t of e) {
		let e = yi(t, null, !1, r), n = e.kind === "container" || e.kind === "columns", a = i.at(-1);
		!n && a && !a.container ? xi(a.rows, e) : i.push({
			id: t.id,
			label: n && t.label?.trim() || null,
			rows: [e],
			container: n
		});
	}
	return i;
}
function _i(e) {
	let t = [], n = (e) => {
		for (let r of e) if (r.kind === "text") t.push({
			id: r.node.id,
			prop: "text",
			parent: r.parent
		}), r.node.type === "quote" && t.push({
			id: r.node.id,
			prop: "cite",
			parent: r.parent
		});
		else if (r.kind === "list") (Array.isArray(r.node.props.items) && r.node.props.items.length ? r.node.props.items : [""]).forEach((e, n) => t.push({
			id: r.node.id,
			prop: "items",
			index: n,
			parent: r.parent
		}));
		else if (r.kind === "columns") for (let e of r.columns) n(e.rows);
		else r.kind === "container" && n(r.rows);
	};
	for (let t of e) n(t.rows);
	return t;
}
function vi(e) {
	let t = [], n = (e) => {
		for (let r of e) if (t.push(r), r.kind === "columns") for (let e of r.columns) n(e.rows);
		else r.kind === "container" && n(r.rows);
	};
	for (let t of e) n(t.rows);
	return t;
}
function yi(e, t, n, r) {
	let i = n || !!e.hidden, a = {
		parent: t,
		hidden: i
	}, o = r.types.get(e.type), s = r.custom(e.type), c = (e.children?.length ?? 0) > 0;
	return e.type === "columns" && o && !s ? {
		kind: "columns",
		node: e,
		columns: (e.children ?? []).map((e) => ({
			node: e,
			rows: bi(e.children ?? [], e.id, i || !!e.hidden, r)
		})),
		...a
	} : !s && o && !c && (e.type === "button" || e.type === "link") ? {
		kind: "actions",
		nodes: [e],
		...a
	} : o?.children || c ? {
		kind: "container",
		node: e,
		rows: bi(e.children ?? [], e.id, i, r),
		...a
	} : !o || s ? {
		kind: "block",
		node: e,
		...a
	} : pi.includes(e.type) ? {
		kind: e.bind?.text ? "block" : "text",
		node: e,
		...a
	} : e.type === "list" ? {
		kind: e.bind?.items ? "block" : "list",
		node: e,
		...a
	} : {
		kind: "block",
		node: e,
		...a
	};
}
function bi(e, t, n, r) {
	let i = [];
	for (let a of e) xi(i, yi(a, t, n, r));
	return i;
}
function xi(e, t) {
	let n = e.at(-1);
	t.kind === "actions" && n?.kind === "actions" && n.parent === t.parent && n.hidden === t.hidden ? n.nodes.push(...t.nodes) : e.push(t);
}
// admin/src/write/slash.ts
var Si = null, Ci = /* @__PURE__ */ new Set();
function wi(e) {
	return Si?.id === e ? Si : null;
}
function Ti(e) {
	JSON.stringify(e) !== JSON.stringify(Si) && (Si = e, Ci.forEach((e) => e()));
}
function Ei() {
	return N((e) => (Ci.add(e), () => Ci.delete(e)), () => Si);
}
function Di(e, t = 360, n = 300) {
	let r = window.innerHeight - e.bottom - 6 - 8, i = e.top - 6 - 8, a = r >= Math.min(t, 220) || r >= i;
	return {
		left: Math.max(8, Math.min(window.innerWidth - n - 8, e.left - 4)),
		top: a ? e.bottom + 6 : void 0,
		bottom: a ? void 0 : window.innerHeight - e.top + 6,
		maxHeight: Math.max(120, Math.min(t, a ? r : i))
	};
}
function Oi(e, t) {
	k(() => {
		if (!e) return;
		let n = (e) => !e.target?.closest?.("[data-cms-slash]") && Ti(null), r = t.filter((e) => !!e);
		return r.forEach((e) => e.addEventListener("pointerdown", n, !0)), () => r.forEach((e) => e.removeEventListener("pointerdown", n, !0));
	}, [e, ...t]);
}
// admin/src/write/Text.tsx
var ki = {
	1: "text-display font-semibold",
	2: "text-3xl font-semibold",
	3: "text-2xl font-semibold",
	4: "text-xl font-semibold",
	5: "text-lg font-semibold",
	6: "text-base font-semibold uppercase tracking-[0.04em] text-muted"
}, Ai = "text-lg leading-7", ji = {
	note: {
		icon: "info",
		className: "bg-surface",
		label: () => T("Note")
	},
	tip: {
		icon: "sparkle",
		className: "bg-success/7",
		label: () => T("Tip")
	},
	warning: {
		icon: "warning",
		className: "bg-warning/9",
		label: () => T("Warning")
	},
	danger: {
		icon: "error",
		className: "bg-danger/7",
		label: () => T("Danger")
	}
};
function Mi({ node: e }) {
	if (e.type === "quote") return /* @__PURE__ */ U("blockquote", {
		className: "m-0 border-l-[3px] border-text/80 py-0.5 pl-4",
		children: [/* @__PURE__ */ H(Fi, {
			node: e,
			prop: "text",
			className: "text-lg leading-7",
			placeholder: T("Quote")
		}), /* @__PURE__ */ H(Fi, {
			node: e,
			prop: "cite",
			className: "cms-block-cite mt-1 text-sm text-muted",
			placeholder: T("Attribution"),
			quiet: !0
		})]
	});
	if (e.type === "callout") return /* @__PURE__ */ H(Pi, { node: e });
	if (e.type === "heading") {
		let t = String(e.props.level ?? 2);
		return /* @__PURE__ */ H(Fi, {
			node: e,
			prop: "text",
			tag: `h${t}`,
			className: ki[t] ?? ki[2],
			placeholder: T("Heading {level}", { level: t })
		});
	}
	return /* @__PURE__ */ H(Ni, { node: e });
}
function Ni({ node: e }) {
	let { store: t } = G(), n = K(t, (t) => t.nodes.length === 1 && t.nodes[0].id === e.id);
	return /* @__PURE__ */ H(Fi, {
		node: e,
		prop: "text",
		tag: "p",
		className: Ai,
		placeholder: T("Write, or press “/” for blocks"),
		quiet: !n
	});
}
function Pi({ node: e }) {
	let { store: t } = G(), { readOnly: n } = oi(), r = ji[e.props.tone] ?? ji.note;
	return /* @__PURE__ */ U("div", {
		className: V("flex gap-3 rounded-md px-4 py-3", r.className),
		children: [/* @__PURE__ */ H(de, {
			align: "start",
			trigger: /* @__PURE__ */ H(z, {
				compact: !0,
				disabled: n,
				"aria-label": T("Callout Style"),
				className: "grid h-[27px] w-5 shrink-0 place-items-center rounded-xs text-muted hover:text-text",
				children: /* @__PURE__ */ H(I, {
					name: r.icon,
					size: 17
				})
			}),
			items: Object.entries(ji).map(([n, r]) => ({
				label: r.label(),
				icon: r.icon,
				checked: n === (e.props.tone ?? "note"),
				onSelect: () => t.updateProps(e.id, { tone: n })
			}))
		}), /* @__PURE__ */ H(Fi, {
			node: e,
			prop: "text",
			className: V(Ai, "min-w-0 flex-1"),
			placeholder: T("Write a note")
		})]
	});
}
var Fi = ae(function({ node: e, prop: i, tag: s = "div", className: c, placeholder: l, quiet: u }) {
	let { store: d, types: f, allowed: _ } = G(), { stops: v, readOnly: y } = oi(), b = K(d, (t) => t.focus?.id === e.id && (t.focus.prop ?? "text") === i ? t.focus : null), x = String(e.props[i] ?? ""), S = (t, n) => {
		if (e.type === "paragraph" && i === "text" && C(t, n)) return;
		d.updateProps(e.id, { [i]: t }, `text:${e.id}:${i}`);
		let r = e.type === "paragraph" ? t.replace(/<[^>]+>/g, "").match(/^\/([\w-]*)$/) : null;
		Ti(r ? {
			id: e.id,
			query: r[1]
		} : null);
	}, C = (n, i) => {
		let a = n.replace(/&nbsp;/g, " "), o = (n, a, o) => {
			let s = r(d.get().nodes, e.id), c = s?.parentId ? t(d.get().nodes, s.parentId) : null;
			if (!f.has(n) || !p(c, n, f, c ? [] : _)) return !1;
			let l = Math.max(0, On(i) - Fn(o));
			return d.updateNode(e.id, {
				type: n,
				props: a
			}), d.focus(e.id, l, n === "list" ? "items" : "text", n === "list" ? 0 : void 0), !0;
		}, s;
		if (s = a.match(/^(#{1,4}) /)) return o("heading", {
			text: a.slice(s[0].length),
			level: String(s[1].length)
		}, s[0]);
		if (s = a.match(/^[-*] /)) return o("list", {
			items: [a.slice(2)],
			ordered: !1
		}, s[0]);
		if (s = a.match(/^1[.)] /)) return o("list", {
			items: [a.slice(3)],
			ordered: !0
		}, s[0]);
		if (s = a.match(/^(>|&gt;) /)) return o("quote", {
			text: a.slice(s[0].length),
			cite: ""
		}, s[0]);
		if (s = a.match(/^! /)) return o("callout", {
			text: a.slice(2),
			tone: "note"
		}, s[0]);
		if (a === "```") return o("code", {
			code: "",
			language: "plain"
		}, a);
		if (a === "---" && f.has("divider") && (_.length === 0 || _.includes("divider"))) {
			let t = si(), { nodes: n } = d.get(), i = r(n, e.id);
			return d.commit(m(h(n, e.id, (e) => ({
				...e,
				type: "divider",
				props: {}
			})), i?.parentId ?? null, (i?.index ?? n.length) + 1, [t])), d.focus(t.id, "start"), !0;
		}
		return !1;
	}, ee = (s, c) => {
		if (s.defaultPrevented) return;
		let l = v(), u = l.findIndex((t) => ci(t, e.id, i)), p = l[u], { nodes: y } = d.get();
		if (s.key === "Enter" && !s.shiftKey && !s.metaKey && !s.ctrlKey && !s.altKey) {
			s.preventDefault();
			let t = wi(e.id);
			if (t && Kn(!0, !!document.querySelector("[data-cms-slash]"))) return Ti({
				...t,
				enter: !0
			});
			if (i === "cite") {
				let t = si(), n = o(y, e.id, "paragraph", f, _);
				if (!n) return;
				d.insert(n.parentId, n.index, [t]), d.focus(t.id, "start");
				return;
			}
			let [a, l] = kn(c);
			if (n(a) && !n(l)) {
				let t = r(y, e.id);
				if (!t) return;
				d.insert(t.parentId, t.index, [si()]), d.focus(e.id, "start");
				return;
			}
			let u = e.type === "paragraph" ? {
				id: g(),
				type: "paragraph",
				props: {
					...e.props,
					text: l
				},
				...e.class ? { class: e.class } : {}
			} : si(l), p = o(y, e.id, "paragraph", f, _);
			if (!p) return;
			d.commit(m(h(y, e.id, (e) => ({
				...e,
				props: {
					...e.props,
					[i]: a
				}
			})), p.parentId, p.index, [u])), d.focus(u.id, "start");
		} else if (s.key === "Backspace" && Tn(c)) {
			if (i === "cite") {
				n(x) && (s.preventDefault(), d.focus(e.id, "end", "text"));
				return;
			}
			if (e.type !== "paragraph") {
				s.preventDefault(), d.updateNode(e.id, {
					type: "paragraph",
					props: { text: x }
				}), d.focus(e.id, "start");
				return;
			}
			let t = l[u - 1];
			if (!t) return;
			if (s.preventDefault(), n(x)) {
				d.remove(e.id), li(d, t, "end");
				return;
			}
			if (t.parent === p?.parent && w(t, x)) return;
			li(d, t, "end");
		} else if (s.key === "Delete" && En(c) && i === "text") {
			let n = l[u + 1], r = n && n.prop === "text" && n.parent === p?.parent ? t(y, n.id) : null;
			if (!r || !["paragraph", "heading"].includes(r.type)) return;
			s.preventDefault();
			let i = Fn(x);
			d.commit(a(h(y, e.id, (e) => ({
				...e,
				props: {
					...e.props,
					text: x + String(r.props.text ?? "")
				}
			})), r.id)), d.focus(e.id, i);
		} else fi(s, c, d, l, u) || s.key === "Escape" && (s.preventDefault(), c.blur(), d.select(e.id, !0));
	}, w = (n, r) => {
		let { nodes: i } = d.get(), o = t(i, n.id);
		if (!o) return !1;
		if (n.prop === "items") {
			let t = [...o.props.items ?? [""]], s = t[n.index ?? 0] ?? "";
			return t[n.index ?? 0] = s + r, d.commit(a(h(i, o.id, (e) => ({
				...e,
				props: {
					...e.props,
					items: t
				}
			})), e.id)), li(d, n, Fn(s)), !0;
		}
		if (n.prop !== "text" || ![
			"paragraph",
			"heading",
			"quote",
			"callout"
		].includes(o.type)) return !1;
		let s = String(o.props.text ?? "");
		return d.commit(a(h(i, o.id, (e) => ({
			...e,
			props: {
				...e.props,
				text: s + r
			}
		})), e.id)), li(d, n, Fn(s)), !0;
	};
	return /* @__PURE__ */ H(Bn, {
		tag: s,
		html: x,
		onChange: S,
		placeholder: l,
		quiet: u,
		className: c,
		focus: b,
		disabled: y,
		onKeyDown: ee,
		onFocus: () => d.get().selected !== e.id && d.select(e.id),
		onPaste: (t) => !t.includes("\n") || i !== "text" ? !1 : (import("./paste-D-vvhaTE.js").then((n) => n.pasteMarkdown(d, e, t, f, _)), !0)
	});
});
function Ii({ node: e, renderItem: t }) {
	let { store: i, types: s, allowed: c } = G(), { stops: l, readOnly: u } = oi(), d = Array.isArray(e.props.items) && e.props.items.length ? e.props.items : [""], f = K(i, (t) => t.focus?.id === e.id && t.focus.prop === "items" ? t.focus : null), p = !!e.props.ordered, g = (t, n = `list:${e.id}`) => i.updateProps(e.id, { items: t }, n), _ = (t) => (u, f) => {
		if (u.defaultPrevented) return;
		let { nodes: p } = i.get(), _ = l(), v = _.findIndex((n) => ci(n, e.id, "items", t));
		if (u.key === "Enter" && !u.shiftKey && !u.metaKey && !u.ctrlKey) {
			if (u.preventDefault(), n(d[t]) && t === d.length - 1) {
				let t = si(), n = d.slice(0, -1), r = o(p, e.id, "paragraph", s, c);
				if (!r) return;
				let l = n.length ? h(p, e.id, (e) => ({
					...e,
					props: {
						...e.props,
						items: n
					}
				})) : p, u = m(l, r.parentId, r.index, [t]);
				i.commit(n.length ? u : a(u, e.id)), i.focus(t.id, "start");
				return;
			}
			let [r, l] = kn(f);
			g([
				...d.slice(0, t),
				r,
				l,
				...d.slice(t + 1)
			], ""), i.focus(e.id, "start", "items", t + 1);
		} else if (u.key === "Backspace" && Tn(f)) {
			if (u.preventDefault(), t === 0) {
				let t = si(d[0]), n = r(p, e.id), o = d.slice(1), s = m(p, n?.parentId ?? null, n?.index ?? 0, [t]);
				s = o.length ? h(s, e.id, (e) => ({
					...e,
					props: {
						...e.props,
						items: o
					}
				})) : a(s, e.id), i.commit(s), i.focus(t.id, "start");
				return;
			}
			g([
				...d.slice(0, t - 1),
				d[t - 1] + d[t],
				...d.slice(t + 1)
			], ""), i.focus(e.id, Fn(d[t - 1]), "items", t - 1);
		} else fi(u, f, i, _, v) || u.key === "Escape" && (u.preventDefault(), f.blur(), i.select(e.id, !0));
	}, v = (n, r) => /* @__PURE__ */ H(Bn, {
		html: n,
		className: t ? void 0 : "min-w-0 flex-1 pl-1",
		tag: t ? "span" : "div",
		placeholder: T("List"),
		quiet: !0,
		disabled: u,
		focus: f && (f.index ?? 0) === r ? f : null,
		onChange: (e) => g(d.map((t, n) => n === r ? e : t)),
		onKeyDown: _(r),
		onFocus: () => i.get().selected !== e.id && i.select(e.id)
	});
	return t ? /* @__PURE__ */ H(Ne, { children: d.map((e, n) => t(n, v(e, n))) }) : /* @__PURE__ */ H("div", {
		className: V(Ai, "space-y-0.5"),
		children: d.map((e, t) => /* @__PURE__ */ U("div", {
			className: "flex",
			children: [/* @__PURE__ */ H("span", {
				className: V("w-6 shrink-0 select-none text-muted", p ? "pr-1.5 text-right tabular-nums" : "pl-1.5"),
				"aria-hidden": !0,
				children: p ? `${t + 1}.` : "•"
			}), v(e, t)]
		}, t))
	});
}
// admin/src/LiveEditor.tsx
var Li = (e, t, n) => e.axis === "x" ? {
	...e,
	rect: {
		left: n === "before" ? t.left - 3 : t.left + t.width + 1,
		top: t.top,
		width: 2,
		height: t.height
	}
} : {
	...e,
	rect: {
		left: t.left,
		top: n === "before" ? t.top - 3 : t.top + t.height + 1,
		width: t.width,
		height: 2
	}
}, Ri = (e) => `${e.parentId ?? ""}:${e.index}:${e.inside ? "inside" : e.axis}`, zi = "\nhtml{scrollbar-width:thin;scrollbar-color:rgb(127 127 127/.35) transparent}\n[data-cms-document][data-cms-node]{cursor:default}\n.cms-block-text{display:block;min-width:1ch;min-height:1lh;white-space:pre-wrap;overflow-wrap:break-word;outline:none;border-radius:0;font:inherit;color:inherit;line-height:inherit;text-align:inherit;cursor:text}\n.cms-block-text:empty::before{content:attr(data-placeholder);opacity:.4;pointer-events:none}\n.cms-block-text[data-quiet]:empty:not(:focus)::before{content:none}\n[data-cms-prop]{cursor:text}\n.cms-block-text::selection,.cms-block-text ::selection{background:rgb(0 122 255/.2)}\nimg,a{-webkit-user-drag:none}\niframe{pointer-events:none}\n[data-cms-conditional=hidden]:not([data-cms-reveal]){display:none!important}\n[data-cms-editor-empty-root]{visibility:hidden}\n.cms-js [data-cms-appear]{visibility:visible!important}\n", Bi = (e, t) => e.left === t.left && e.top === t.top && e.width === t.width && e.height === t.height, Vi = (e, t) => e.length === t.length && e.every((e, n) => Bi(e, t[n])) ? e : t, Hi = /* @__PURE__ */ new Set([
	"IMG",
	"PICTURE",
	"VIDEO",
	"IFRAME",
	"CANVAS",
	"INPUT",
	"TEXTAREA",
	"SELECT",
	"BUTTON"
]);
function Ui(e, t, n) {
	let r = e.elementFromPoint(t, n);
	if (!r || r === e.body || r === e.documentElement) return !1;
	if (Hi.has(r.tagName) || r.closest("svg")) return !0;
	let i = [...r.childNodes].filter((e) => e.nodeType === Node.TEXT_NODE && e.textContent?.trim());
	if (!i.length) return !1;
	let a = e.createRange();
	return i.some((e) => (a.selectNodeContents(e), [...a.getClientRects()].some((e) => t >= e.left - 2 && t <= e.right + 2 && n >= e.top - 2 && n <= e.bottom + 2)));
}
var Wi = 1024, Gi = "cms-blocks:";
function Ki({ collection: e, blueprint: n, entryId: a, content: c, onInspect: d, standalone: m, onTitleChange: h }) {
	let { store: g, types: _, allowed: b, fieldHandle: x, readOnly: C = !1 } = G(), w = ze(), E = K(g, (e) => e.nodes), D = K(g, (e) => e.selected), te = K(g, He), ne = K(g, (e) => e.blockMode), re = K(g, (e) => e.hovered), ie = K(g, (e) => e.device), O = T("Page Builder"), ae = !C && !!D && ne;
	je("up", T("Select Previous Block"), O, ae), je("down", T("Select Next Block"), O, ae), je("shift+up", T("Select the Block Above Too"), O, ae), je("shift+down", T("Select the Block Below Too"), O, ae), je("alt+up", T("Move Up"), O, ae), je("alt+down", T("Move Down"), O, ae), je("enter", T("Edit Block"), O, ae), je("mod+d", T("Duplicate Block"), O, ae), je("backspace", T("Delete Block"), O, ae), je("escape", T("Deselect"), O, !!D), je("mod+alt+t", T("Insert Before"), O, !C && !!D), je("mod+alt+y", T("Insert After"), O, !C && !!D), je("mod+z", T("Undo"), O, !C), je("mod+shift+z", T("Redo"), O, !C);
	let se = mn(), ce = j(null), N = j(null), [P, ue] = M(null), F = j(""), [I, L] = M([]), [de, pe] = M(!0), [me, he] = M(null), [ge, _e] = M(0), [R, z] = M({
		width: 1024,
		height: 700,
		scale: 1,
		left: 0
	}), [ye, xe] = M([]), [B, V] = M(null), [Se, we] = M([]), [Te, Ee] = M(null), De = j(0), Oe = j(""), [ke, Ae] = M(!1), [Me, Pe] = M(!1), Ie = j(!1), W = j(null), Le = A(() => {
		let e = [], t = (n, r) => n.forEach((n, i) => {
			e.push({
				node: n,
				parentId: r,
				index: i
			}), n.children && t(n.children, n.id);
		});
		return t(E, null), e;
	}, [E]), Re = j(Le);
	Re.current = Le;
	let [Ve, Ue] = M(null), [We, Ge] = M(!1), q = cr(!!e && !!y().collections.find((t) => t.handle === e)?.routable && !C && !m), J = j(Ve);
	J.current = Ve;
	let Ke = j(null);
	k(() => {
		Ve || (Ke.current = null);
	}, [Ve]);
	let Je = j(0), Ye = j({
		busy: !1,
		queued: !1,
		timer: 0,
		waiting: !1,
		alive: !0
	}), Xe = j(async () => {}), Ze = () => document.activeElement === N.current && !!N.current?.contentDocument?.activeElement?.isContentEditable, Qe = () => {
		let e = Ye.current;
		if (e.queued = !0, !e.alive || e.busy) return;
		let t = !!F.current && Ze();
		(!e.timer || e.waiting) && (clearTimeout(e.timer), e.waiting = t, e.timer = window.setTimeout(() => {
			e.timer = 0, e.waiting = !1, Xe.current();
		}, F.current ? t ? 400 : 80 : 0));
	}, $e = () => Re.current.map(({ node: e, parentId: t, index: n }) => `${t}:${n}:${e.id}:${e.type}:${e.type === "list" ? e.props.items?.length ?? 0 : ""}`).join("|"), et = () => $e() + "#" + Re.current.map(({ node: e }) => e.class ?? "").join("|"), tt = j(""), nt = j(null), rt = j(Wr());
	k(() => () => rt.current.unmount(), []);
	let it = j(null), at = (e) => {
		let t = it.current;
		if (!t || !e.head) return;
		let n = /* @__PURE__ */ new Set();
		for (let t of e.querySelectorAll("[class]")) for (let e of t.classList) n.add(e);
		let r;
		try {
			r = t.faces + t.build([...n]);
		} catch {
			return;
		}
		let i = e.head.querySelector("style[data-cms-bridge=\"tailwind\"]");
		i || (i = e.createElement("style"), i.dataset.cmsBridge = "tailwind"), i.textContent !== r && (i.textContent = r), e.head.lastElementChild !== i && e.head.appendChild(i);
	}, ot = j(/* @__PURE__ */ new Map()), st = (e) => {
		let t = !1;
		for (let { node: n } of Re.current) {
			let r = n.class ?? "", i = ot.current.get(n.id);
			if (ot.current.set(n.id, r), i === void 0 || i === r) continue;
			let a = qe(r), o = qe(i).filter((e) => !a.includes(e));
			for (let r of e.querySelectorAll(`[data-cms-document="${F.current}"][data-cms-node="${CSS.escape(n.id)}"],[data-cms-proto-document="${F.current}"][data-cms-proto="${CSS.escape(n.id)}"]`)) r.classList.remove(...o), r.classList.add(...a), t = !0;
		}
		return t;
	}, Y = j({
		content: c,
		onInspect: d,
		readOnly: C,
		layout: R,
		onTitleChange: h
	});
	Y.current = {
		content: c,
		onInspect: d,
		readOnly: C,
		layout: R,
		onTitleChange: h
	};
	let ct = j(null), lt = () => {
		let e = He(g.get()).map((e) => t(g.get().nodes, e)).filter(Boolean);
		return e.length ? Gi + JSON.stringify(e) : null;
	}, ut = (e) => {
		let t = lt();
		t && (ct.current = t, navigator.clipboard?.writeText(t).catch(() => {}), e && !Y.current.readOnly && g.removeSelection());
	}, dt = (e) => {
		let t;
		try {
			t = JSON.parse(e.slice(11)).map(u);
		} catch {
			return;
		}
		let n = g.get().nodes, r = o(n, He(g.get()).at(-1), t.map((e) => e.type), _, b);
		r && t.length && (g.insert(r.parentId, r.index, t), g.select(t[0].id, !0), t.length > 1 && g.extendTo(t.at(-1).id));
	}, ft = async () => {
		let e = ct.current;
		try {
			let t = await navigator.clipboard.readText();
			t.startsWith(Gi) && (e = t);
		} catch {}
		e && !Y.current.readOnly && dt(e);
	}, [pt, mt] = M(null), ht = (e, t) => {
		if (He(g.get()).includes(e)) return mt(t);
		g.select(e, !0), requestAnimationFrame(() => mt(t));
	}, gt = (e, t) => e.querySelector(`[data-cms-document="${F.current}"][data-cms-node="${CSS.escape(t)}"]`) ?? e.querySelector(`[data-cms-proto-document="${F.current}"][data-cms-proto="${CSS.escape(t)}"]`), _t = (e) => {
		let n = "[data-cms-document][data-cms-node],[data-cms-proto-document][data-cms-proto]", r = e?.closest?.(n) ?? null;
		for (; r;) {
			let e = r.dataset.cmsDocument === F.current ? r.dataset.cmsNode : r.dataset.cmsProtoDocument === F.current ? r.dataset.cmsProto : void 0;
			if (e && t(g.get().nodes, e)) return e;
			r = r.parentElement?.closest(n) ?? null;
		}
		return null;
	}, vt = (e, t = e.ownerDocument.defaultView?.getComputedStyle(e)) => {
		if (t?.display !== "contents") return e.getBoundingClientRect();
		let n = e.ownerDocument.createRange();
		return n.selectNodeContents(e), n.getBoundingClientRect();
	}, yt = () => {
		if (W.current) return W.current;
		let e = N.current?.contentDocument, t = e?.querySelector(`[data-cms-editor-root="${F.current}"]`);
		if (!e || !t) return null;
		let n = (e) => e.display.includes("flex") && e.flexDirection.startsWith("row") || e.display.includes("grid") && e.gridTemplateColumns.split(" ").length > 1 ? "x" : "y", r = new Map([...e.querySelectorAll(`[data-cms-document="${F.current}"][data-cms-node]`)].map((e) => [e.dataset.cmsNode, e])), i = Re.current.flatMap(({ node: t, parentId: i, index: a }) => {
			let o = r.get(t.id), s = o && e.defaultView.getComputedStyle(o);
			return !o || !s || s.display === "none" ? [] : [{
				id: t.id,
				parentId: i,
				index: a,
				rect: vt(o, s),
				container: !!_.get(t.type)?.children && !["repeat", "component"].includes(t.type),
				axis: n(s)
			}];
		}), a = vt(t);
		return a.width === 0 && (a = vt(t.parentElement ?? e.body)), i.length || (a = {
			...a,
			left: a.left,
			top: a.top,
			width: a.width,
			height: Math.max(32, a.height)
		}), W.current = {
			blocks: i,
			rootRect: a,
			scroll: {
				x: e.defaultView.scrollX,
				y: e.defaultView.scrollY
			}
		}, W.current;
	}, bt = (e, n = ["paragraph"]) => {
		let r = e ? t(g.get().nodes, e) : null;
		return n.every((e) => p(r, e, _, r ? [] : b));
	}, xt = A(() => /* @__PURE__ */ new Map(), [_, b]), St = (e) => {
		let n = e ? t(g.get().nodes, e)?.type ?? "" : "";
		return xt.get(n) ?? xt.set(n, [..._.values()].some((t) => bt(e, [t.name]))).get(n);
	}, Ct = () => {
		let e = /* @__PURE__ */ new Map();
		return (t) => e.get(t) ?? e.set(t, St(t)).get(t);
	}, wt = () => {
		let e = N.current?.contentDocument;
		if (!e) return;
		xe((t) => Vi(t, He(g.get()).flatMap((t) => {
			let n = gt(e, t);
			return n ? [vt(n)] : [];
		})));
		let t = g.get().hovered, n = t ? gt(e, t) : null;
		if (V((e) => {
			let t = n ? vt(n) : null;
			return e && t && Bi(e, t) ? e : t;
		}), Ie.current && !J.current) return;
		let r = yt();
		if (!r) return;
		let i = wr(r.blocks, {
			rootRect: r.rootRect,
			canInsert: Ct()
		});
		we(i), Ue((t) => {
			if (!t) return t;
			let n = Ke.current?.key === Ri(t) ? Ke.current : null, r = n ? gt(e, n.id) : null, a = n ? r ? Li(t, vt(r), n.side) : t : i.find((e) => Ri(e) === Ri(t)) ?? t, o = a.inside ? a.hitRect.top : a.rect.top;
			return o < 0 || o > Y.current.layout.height ? null : a;
		});
	}, Tt = j({
		frame: 0,
		run: wt
	});
	Tt.current.run = wt;
	let Et = () => {
		let e = Tt.current;
		e.frame ||= requestAnimationFrame(() => {
			e.frame = 0, e.run();
		});
	}, Dt = (e) => {
		let t = e ? Ri(e) : "";
		t !== Oe.current && (Oe.current = t, clearTimeout(De.current), Ee(null), e && (De.current = window.setTimeout(() => Ee(e), 80)));
	}, Ot = (e) => {
		let t = He(g.get()), n = t.length ? r(g.get().nodes, e === "before" ? t[0] : t.at(-1)) : null, i = N.current?.contentDocument;
		if (!n || !i || Y.current.readOnly || !St(n.parentId)) return;
		let a = e === "before" ? n.index : n.index + 1, o = gt(i, e === "before" ? t[0] : t.at(-1)), s = o ? vt(o) : null, c = i.defaultView, l = Y.current.layout.height;
		if (s) {
			let t = e === "before" ? s.top : s.top + s.height;
			(t < 48 || t > l - 160) && c.scrollBy(0, t - l / 3);
		}
		requestAnimationFrame(() => {
			W.current = null;
			let r = yt(), i = o ? vt(o) : null;
			if (!i) return;
			let s = Li((r && wr(r.blocks, {
				rootRect: r.rootRect,
				canInsert: Ct()
			}).find((e) => !e.inside && e.parentId === n.parentId && e.index === a)) ?? {
				parentId: n.parentId,
				index: a,
				axis: "y",
				kind: "edge",
				inside: !1,
				depth: 0,
				rect: i,
				hitRect: i
			}, i, e);
			Ke.current = {
				key: Ri(s),
				id: e === "before" ? t[0] : t.at(-1),
				side: e
			}, Dt(null), Ue(s);
		});
	}, kt = () => {
		let e = P?.activeElement;
		if (document.activeElement === N.current && e?.isContentEditable) return e;
		let t = g.get().focus;
		return (t && P ? gt(P, t.id) : null)?.querySelector("[data-cms-inline]") ?? null;
	}, At = (e) => {
		W.current = null;
		let t = [];
		if (Y.current.onTitleChange) for (let t of e.querySelectorAll("[data-cms-entry-field=\"title\"]")) t.querySelector("[data-cms-inline]") || t.replaceChildren();
		for (let n of e.querySelectorAll("[data-cms-prop]")) {
			let e = n.closest("[data-cms-document][data-cms-node]");
			e?.dataset.cmsDocument === F.current && e.dataset.cmsNode && (n.querySelector("[data-cms-inline]") || n.replaceChildren(), t.push({
				element: n,
				id: e.dataset.cmsNode,
				prop: n.dataset.cmsProp,
				...n.dataset.cmsIndex === void 0 ? {} : { index: Number(n.dataset.cmsIndex) }
			}));
		}
		for (let n of e.querySelectorAll("[data-cms-instance-prop]")) n.dataset.cmsInstanceDocument === F.current && n.dataset.cmsInstanceNode && (n.querySelector("[data-cms-inline]") || n.replaceChildren(), t.push({
			element: n,
			id: n.dataset.cmsInstanceNode,
			prop: n.dataset.cmsInstanceProp,
			instance: {
				type: n.dataset.cmsInstanceType ?? "text",
				value: n.dataset.cmsInstanceValue ?? ""
			}
		}));
		let n = (e, t) => e.element === t.element && e.id === t.id && e.prop === t.prop && e.index === t.index && e.instance?.type === t.instance?.type && e.instance?.value === t.instance?.value;
		L((e) => e.length === t.length && e.every((e, r) => n(e, t[r])) ? e : t), Et();
	}, jt = () => {
		let e = N.current?.contentDocument, t = e?.querySelector("[data-cms-editor-root]");
		if (!e || !t || !F.current) return;
		let n = et();
		if (n === tt.current) {
			Et();
			return;
		}
		tt.current = n;
		let r = new Set(s(g.get().nodes).map(({ node: e }) => e.id)), i = /* @__PURE__ */ new Map();
		for (let t of e.querySelectorAll("[data-cms-document][data-cms-node]")) t.dataset.cmsDocument === F.current && (r.has(t.dataset.cmsNode) ? i.has(t.dataset.cmsNode) || i.set(t.dataset.cmsNode, t) : t.remove());
		let a = (t) => {
			let n = i.get(t);
			return n?.isConnected ? n : gt(e, t);
		}, o = (t, n) => {
			for (let r = 0; r < t.length; r++) {
				let s = t[r], c = a(s.id);
				if (!c || c.dataset.cmsType !== s.type) {
					let o = e.querySelector(`template[data-cms-prototype="${CSS.escape(s.type)}"]`)?.content.firstElementChild?.cloneNode(!0);
					if (!o) continue;
					if (o.dataset.cmsNode = s.id, o.dataset.cmsDocument = F.current, c) c.replaceWith(o);
					else {
						let e = t.slice(r + 1).map((e) => a(e.id)).find(Boolean), i = t.slice(0, r).reverse().map((e) => a(e.id)).find(Boolean);
						e ? e.before(o) : i ? i.after(o) : n.appendChild(o);
					}
					i.set(s.id, o), c = o;
				}
				if (s.type === "list") {
					let e = Array.isArray(s.props.items) && s.props.items.length ? s.props.items : [""], t = [...c.querySelectorAll("[data-cms-prop=\"items\"]")];
					for (let n = t.length; n < e.length; n++) {
						let e = t[0]?.cloneNode(!1);
						e && (e.dataset.cmsIndex = String(n), t[0].parentElement.appendChild(e));
					}
					t.slice(e.length).forEach((e) => e.remove());
				}
				s.children && !["repeat", "component"].includes(s.type) && o(s.children, c);
			}
		};
		g.get().nodes.length && t.querySelector(":scope > [data-cms-editor-empty-root]")?.remove(), o(g.get().nodes, t), st(e), at(e), At(e);
	}, Mt = A(() => ({
		stops: () => _i(gi(g.get().nodes, _, () => !1)).filter((e) => I.some((t) => t.id === e.id && t.prop === e.prop && (e.index === void 0 || t.index === e.index))),
		settings: (e) => Y.current.onInspect(e),
		readOnly: C
	}), [
		g,
		_,
		I,
		C
	]), Nt = j(Mt);
	Nt.current = Mt, le(() => {
		W.current = null, jt();
	}, [E, P]), le(() => {
		if (!ce.current) return;
		let e = () => {
			let e = ce.current, t = ie === "tablet" ? Ce.tablet : ie === "phone" ? Math.min(Ce.phone, e.clientWidth) : Math.max(e.clientWidth, Wi);
			g.setCanvasWidth(t);
			let n = Math.min(1, e.clientWidth / t);
			W.current = null, z({
				width: t,
				scale: n,
				height: e.clientHeight / n,
				left: Math.max(0, (e.clientWidth - t * n) / 2)
			});
		};
		e();
		let t = new ResizeObserver(e);
		return t.observe(ce.current), () => t.disconnect();
	}, [ie, g]), k(() => {
		Et();
	}, [
		D,
		te,
		re,
		R,
		P,
		Me
	]), Xe.current = async () => {
		let t = Ye.current;
		t.queued = !1, t.busy = !0;
		let r = Je.current, i = $e(), o = new Map(Re.current.map(({ node: e }) => [e.id, e.class ?? ""])), s = new AbortController();
		nt.current = s;
		try {
			let { text: l, headers: u } = await ee("POST", a ? `/__preview/${a}` : "/__preview", {
				...c,
				collection: e,
				...a ? {} : { blueprint: n },
				field: x,
				standalone: m,
				data: {
					...c.data,
					[x]: g.get().nodes
				},
				play: !1
			}, { signal: s.signal });
			if (!t.alive || s.signal.aborted || r !== Je.current && i !== $e()) return;
			let d = u.get("X-Cms-Editor-Document");
			if (!d) throw Error(T("The editor could not load its rendering context."));
			let f = new DOMParser().parseFromString(l, "text/html");
			if (!f.querySelector(`[data-cms-editor-root="${d}"]`)) throw Error(T("This template has no content outlet. Choose a template that includes the content field."));
			f.querySelectorAll("script").forEach((e) => {
				e.type === "importmap" && (e.dataset.cmsImportmap = ""), e.type = "text/cms-off", e.removeAttribute("src");
			}), F.current = d;
			let p = N.current?.contentDocument;
			p?.documentElement?.hasAttribute("data-cms-bridge-ready") ? (rt.current.unmount(), Gr(p, f), p.documentElement.setAttribute("data-cms-bridge-ready", ""), tt.current = "", ot.current = o, st(p), at(p), At(p), rt.current.mount(p)) : N.current && (ot.current = o, N.current.srcdoc = f.documentElement.outerHTML), r === Je.current && he(null);
		} catch (e) {
			!s.signal.aborted && r === Je.current && (he(e instanceof Error ? e.message : String(e)), pe(!1));
		} finally {
			t.busy = !1, t.queued && Qe();
		}
	}, k(() => {
		Je.current++, Qe();
	}, [
		a,
		e,
		n,
		c,
		E,
		x,
		m,
		ge
	]), k(() => (Ye.current.alive = !0, Ye.current.queued && Qe(), () => {
		Ye.current.alive = !1, clearTimeout(Ye.current.timer), Ye.current.timer = 0, nt.current?.abort(), cancelAnimationFrame(Tt.current.frame), Tt.current.frame = 0;
	}), []);
	let Pt = (e, t) => {
		let n = l(e, _);
		n.length && !C && bt(t.parentId, n.map((e) => e.type)) && (g.insert(t.parentId, t.index, n), ui(g, n[0], _i(gi(g.get().nodes, _, () => !1))), Ue(null), Dt(null));
	}, Ft = () => {
		if (Y.current.readOnly || !bt(null)) return;
		let e = si();
		g.insert(null, 0, [e]), g.focus(e.id, "start");
	}, It = () => {
		let e = N.current?.contentDocument;
		return e ? Re.current.filter(({ node: t }) => {
			let n = gt(e, t.id);
			return !!n && e.defaultView.getComputedStyle(n).display !== "none";
		}).map(({ node: e }) => e.id) : [];
	}, X = (e) => {
		if (!e) return;
		g.select(e, !0);
		let t = N.current?.contentDocument;
		(t && gt(t, e))?.scrollIntoView({ block: "nearest" });
	}, Rt = (e) => {
		let n = e.metaKey || e.ctrlKey, r = He(g.get()), i = g.get().selected;
		if (e.key === "Escape") {
			g.select(null);
			return;
		}
		if (!i || !g.get().blockMode) return;
		let a = It(), o = a.indexOf(g.get().head ?? i);
		if (["ArrowUp", "ArrowDown"].includes(e.key)) {
			e.preventDefault();
			let t = e.key === "ArrowUp";
			e.altKey ? g.nudgeSelection(t ? -1 : 1) : e.shiftKey ? g.extend(t ? -1 : 1) : X(a[o + (t ? -1 : 1)]);
		} else if (e.key === "Enter") {
			e.preventDefault();
			let n = t(g.get().nodes, i), r = Nt.current.stops(), a = n ? new Set(s([n]).map((e) => e.node.id)) : /* @__PURE__ */ new Set();
			r.some((e) => a.has(e.id)) ? ui(g, n, r) : Y.current.onInspect(i);
		} else if (e.key === "Backspace" || e.key === "Delete") {
			e.preventDefault();
			let n = new Set(r.flatMap((e) => {
				let n = t(g.get().nodes, e);
				return n ? s([n]).map((e) => e.node.id) : [];
			})), i = a.findIndex((e) => n.has(e)), o = a.slice(0, Math.max(0, i)).reverse().find((e) => !n.has(e)) ?? a.slice(i + 1).find((e) => !n.has(e));
			g.removeSelection(), X(o);
		} else n && e.key.toLowerCase() === "d" && (e.preventDefault(), g.duplicateSelection());
	}, zt = () => {
		let e = N.current?.contentDocument;
		if (!e || !F.current) return;
		if (!e.querySelector("[data-cms-editor-root]")) {
			pe(!1), he(T("This template has no content outlet. Choose a template that includes the content field."));
			return;
		}
		e.documentElement.setAttribute("data-cms-bridge-ready", ""), tt.current = "";
		let n = e.createElement("style");
		n.dataset.cmsBridge = "", n.textContent = zi, e.head.appendChild(n), st(e), at(e), ue(e), At(e), pe(!1), rt.current.unmount(), rt.current.mount(e), e.addEventListener("submit", (e) => e.preventDefault(), !0), e.addEventListener("dragstart", (e) => e.preventDefault()), e.addEventListener("focusout", (e) => {
			e.target.isContentEditable && Ae(!1), Qe();
		}), e.addEventListener("focusin", (e) => {
			let t = e.target;
			if (!t.isContentEditable) return;
			Ae(!0);
			let n = t.closest("[data-cms-instance-node],[data-cms-document][data-cms-node]");
			g.select(n?.dataset.cmsInstanceNode ?? n?.dataset.cmsNode ?? null), g.hover(null);
		}), e.addEventListener("pointermove", (e) => {
			if (Y.current.readOnly || (Ie.current && (e.movementX || e.movementY) && (Ie.current = !1, Pe(!1)), g.hover(_t(e.target)), Ie.current || J.current)) return;
			let t = yt();
			Dt(t && Tr(t.blocks, {
				x: e.clientX,
				y: e.clientY
			}, {
				rootRect: t.rootRect,
				canInsert: Ct()
			}));
		}), e.addEventListener("pointerdown", () => {
			Ue(null), Dt(null);
		}), e.addEventListener("click", (e) => {
			let t = e.target;
			if (t.closest("[contenteditable=\"true\"]")) {
				t.closest("a") && e.preventDefault();
				return;
			}
			e.preventDefault();
			let n = _t(t);
			n ? e.shiftKey && g.get().selected ? g.extendTo(n) : Y.current.onInspect(n) : e.shiftKey || g.select(null);
		}, !0), e.addEventListener("keydown", (n) => {
			if (n.defaultPrevented) return;
			let r = n.metaKey || n.ctrlKey;
			if (r && [
				"s",
				".",
				"j",
				"k",
				"\\"
			].includes(n.key.toLowerCase())) n.preventDefault(), document.dispatchEvent(new KeyboardEvent("keydown", {
				key: n.key,
				code: n.code,
				metaKey: n.metaKey,
				ctrlKey: n.ctrlKey,
				shiftKey: n.shiftKey,
				bubbles: !0
			}));
			else if (!Y.current.readOnly) {
				if (r && n.key.toLowerCase() === "z") {
					if (e.activeElement?.closest("[data-cms-entry-field]")) return;
					n.preventDefault();
					let r = e.activeElement, i = r?.closest("[data-cms-prop]"), a = r?.closest("[data-cms-instance-prop]"), o = i?.closest("[data-cms-node]");
					r?.blur(), n.shiftKey ? g.redo() : g.undo(), o?.dataset.cmsNode && i?.dataset.cmsProp && t(g.get().nodes, o.dataset.cmsNode) ? g.focus(o.dataset.cmsNode, "end", i.dataset.cmsProp, i.dataset.cmsIndex === void 0 ? void 0 : Number(i.dataset.cmsIndex)) : a?.dataset.cmsInstanceNode && t(g.get().nodes, a.dataset.cmsInstanceNode) && g.focus(a.dataset.cmsInstanceNode, "end", `values.${a.dataset.cmsInstanceProp}`);
				} else r && n.altKey && (n.code === "KeyT" || n.code === "KeyY") ? (n.preventDefault(), Ot(n.code === "KeyT" ? "before" : "after")) : n.target.isContentEditable ? r || n.altKey || n.key.length !== 1 && ![
					"Backspace",
					"Delete",
					"Enter"
				].includes(n.key) || (Ie.current = !0, Pe(!0), Dt(null)) : Rt(n);
			}
		});
		let r = (e) => g.get().blockMode && !!g.get().selected && !e.target.isContentEditable, i = (e, t) => {
			let n = lt();
			r(e) && e.clipboardData && n && (e.preventDefault(), e.clipboardData.setData("text/plain", n), ct.current = n, t && !Y.current.readOnly && g.removeSelection());
		};
		e.addEventListener("copy", (e) => i(e, !1)), e.addEventListener("cut", (e) => i(e, !0)), e.addEventListener("paste", (e) => {
			let t = e.clipboardData?.getData("text/plain") ?? "";
			r(e) && !Y.current.readOnly && t.startsWith(Gi) && (e.preventDefault(), dt(t));
		});
		let a = !1;
		e.addEventListener("pointerdown", (t) => {
			let n = t.target?.closest?.("[contenteditable=\"true\"]");
			a = !!n && n === e.activeElement;
		}, !0), e.addEventListener("contextmenu", (e) => {
			if (Y.current.readOnly || a) return;
			let t = _t(e.target), n = N.current?.getBoundingClientRect();
			if (!t || !n) return;
			e.preventDefault();
			let { scale: r } = Y.current.layout;
			ht(t, {
				x: n.left + e.clientX * r,
				y: n.top + e.clientY * r
			});
		});
		let o = 0;
		e.addEventListener("scroll", () => {
			let t = W.current, n = e.defaultView;
			if (t) {
				let e = n.scrollX - t.scroll.x, r = n.scrollY - t.scroll.y, i = (t) => ({
					...t,
					left: t.left - e,
					top: t.top - r
				});
				W.current = {
					blocks: t.blocks.map((e) => ({
						...e,
						rect: i(e.rect)
					})),
					rootRect: i(t.rootRect),
					scroll: {
						x: n.scrollX,
						y: n.scrollY
					}
				};
			}
			Fe(() => {
				Dt(null), wt();
			}), clearTimeout(o), o = window.setTimeout(() => {
				W.current = null, wt();
			}, 150);
		}, { passive: !0 }), e.defaultView?.addEventListener("resize", () => {
			W.current = null, Et();
		}), e.querySelectorAll("img,link[rel=\"stylesheet\"]").forEach((e) => e.addEventListener("load", () => {
			W.current = null, Et();
		}, { once: !0 })), e.fonts.ready.then(() => {
			W.current = null, wt();
		});
	};
	k(() => {
		let e = se.source;
		if (!e) return;
		let t = !0;
		return sn(e).then((n) => {
			if (!t) return;
			it.current = {
				build: n.build,
				faces: e.faces
			};
			let r = N.current?.contentDocument;
			r?.documentElement?.hasAttribute("data-cms-bridge-ready") && (at(r), W.current = null, Et());
		}).catch(() => {
			t && (it.current = null);
		}), () => {
			t = !1;
		};
	}, [se.source]), k(() => ii.on("block-menu", ({ node: e, x: t, y: n }) => {
		Y.current.readOnly || ht(e, {
			x: t,
			y: n
		});
	}), []), k(() => ii.on("scroll-to", ({ node: e, top: t }) => {
		let n = N.current?.contentDocument, r = n && gt(n, e);
		r && t ? n.defaultView?.scrollTo({
			top: Math.max(0, r.getBoundingClientRect().top + n.defaultView.scrollY - 72),
			behavior: "smooth"
		}) : r && r.scrollIntoView({
			block: "center",
			behavior: "smooth"
		});
	}), []), k(() => {
		let e = N.current?.contentDocument;
		if (e) {
			e.querySelectorAll("[data-cms-reveal]").forEach((e) => e.removeAttribute("data-cms-reveal"));
			for (let t of te) {
				let n = gt(e, t);
				for (; n;) n.dataset.cmsConditional === "hidden" && (n.dataset.cmsReveal = ""), n = n.parentElement;
			}
		}
	}, [te]);
	let Bt = j(() => {});
	k(() => {
		let e = P?.defaultView;
		if (!P || !e) return;
		let t = e.scrollY, n = 0, r = () => {
			n = 0;
			let r = e.scrollY;
			for (let e of P.querySelectorAll("[x-cms-scroll]")) {
				let n = {};
				try {
					n = JSON.parse(e.getAttribute("x-cms-scroll") || "{}");
				} catch {}
				let i = n.threshold ?? 20;
				e.toggleAttribute("data-scrolled", r > i), n.hide && e.toggleAttribute("data-hidden", r > t && r > i + e.offsetHeight && !e.hasAttribute("data-open"));
			}
			t = r;
		}, i = () => {
			n ||= e.requestAnimationFrame(r);
		};
		return Bt.current = r, r(), e.addEventListener("scroll", i, { passive: !0 }), () => {
			e.removeEventListener("scroll", i), n && e.cancelAnimationFrame(n);
		};
	}, [P]), k(() => {
		Bt.current();
	}, [E]);
	let Vt = K(g, (e) => e.state);
	k(() => {
		let e = N.current?.contentDocument;
		if (e) {
			for (let t of e.querySelectorAll("[data-cms-shown-state]")) t.classList.remove(...(t.dataset.cmsShownState ?? "").split(" ").filter(Boolean)), delete t.dataset.cmsShownState;
			for (let n of te) {
				let r = t(g.get().nodes, n), i = gt(e, n), a = r && i ? Lt(qe(r.class ?? ""), Vt) : [];
				i && a.length !== 0 && (i.classList.add(...a), i.dataset.cmsShownState = a.join(" "));
			}
			at(e);
		}
	}, [
		Vt,
		te,
		E,
		P
	]);
	let Ht = Kr({
		disabled: C,
		frame: N,
		scale: R.scale,
		invalidate: () => {
			W.current = null, wt();
		},
		target: (e, n) => {
			let r = yt();
			if (!r || e.x < r.rootRect.left || e.x > r.rootRect.left + r.rootRect.width || e.y < r.rootRect.top - 12 || e.y > r.rootRect.top + r.rootRect.height + 12) return null;
			let i = n.map((e) => t(g.get().nodes, e));
			if (i.some((e) => !e)) return null;
			let a = i.map((e) => e.type);
			return Er(r.blocks, e, {
				rootRect: r.rootRect,
				maxDistance: Infinity,
				excludeIds: new Set(n),
				canInsert: (e) => bt(e, a)
			});
		},
		commit: (e, t) => g.moveTo(e, t.parentId, t.index)
	}), Ut = (e) => {
		let t = N.current?.contentDocument;
		if (!t) return !1;
		for (let n of [.25, .75]) for (let r = 0; r < 6; r++) if (Ui(t, (e.left + e.width * (r + .5) / 6 - R.left) / R.scale, (e.top + e.height * n) / R.scale)) return !0;
		return !1;
	}, Wt = oe(() => {
		let e = N.current.getBoundingClientRect();
		return {
			x: e.left,
			y: e.top,
			scale: R.scale
		};
	}, [R.scale]), Gt = (e) => ({
		left: R.left + e.left * R.scale,
		top: e.top * R.scale,
		width: e.width * R.scale,
		height: e.height * R.scale
	}), Kt = () => {
		let e = He(g.get()), n = g.get().nodes, a = g.get().selected, o = e.length ? r(n, e[0]) : null, s = e.length ? r(n, e.at(-1)) : null, c = a ? t(n, a) : null;
		if (!o || !s || !c || !a) return null;
		let l = i(n, o.parentId), u = (e) => ({
			label: Be(e, _, w),
			icon: e.type === "component" ? "symbol" : _.get(e.type)?.icon ?? "square"
		}), p = o.parentId ? t(n, o.parentId) : null, { label: m, icon: h } = u(c);
		return {
			label: e.length > 1 ? S(e.length, "{count} block", "{count} blocks") : m,
			icon: h,
			parent: p ? u(p) : null,
			canMoveUp: o.index > 0,
			canMoveDown: s.index < l.length - 1,
			onSelectParent: () => {
				p && d(p.id);
			},
			onMove: (e) => g.nudgeSelection(e),
			onInsert: (e) => {
				requestAnimationFrame(() => Ot(e));
			},
			onCut: () => ut(!0),
			onCopy: () => ut(!1),
			onPaste: () => void ft(),
			onDuplicate: () => g.duplicateSelection(),
			onDelete: () => g.removeSelection(),
			onMakeComponent: v("entries.components.create") ? () => or(g, c.type !== "component" && f(g, _, b)) : void 0
		};
	}, qt = pt ? Kt() : null;
	return /* @__PURE__ */ U(ai.Provider, {
		value: Mt,
		children: [We && /* @__PURE__ */ H(lr, {
			open: !0,
			onOpenChange: Ge,
			components: q,
			onChoose: (e) => {
				let t = e.blocks.map((e) => u(e));
				g.insert(null, 0, t), g.select(t[0]?.id ?? null), Ge(!1);
			}
		}), /* @__PURE__ */ U("div", {
			className: "flex h-full min-h-0 flex-col",
			"data-live-editor": !0,
			children: [
				me && /* @__PURE__ */ H(ve, {
					compact: !0,
					message: me,
					onRetry: () => _e((e) => e + 1)
				}),
				/* @__PURE__ */ U("div", {
					ref: ce,
					onPointerLeave: () => {
						g.hover(null), Dt(null);
					},
					onPointerMove: (e) => {
						e.target.closest("[data-cms-inserter]") || (Dt(null), g.hover(null));
					},
					className: "relative min-h-0 flex-1 overflow-hidden bg-sunken",
					children: [
						de && /* @__PURE__ */ H("div", {
							className: "absolute inset-0 z-drag grid place-items-center bg-bg",
							children: /* @__PURE__ */ H(be, {})
						}),
						/* @__PURE__ */ H(fe, {
							at: qt ? pt : null,
							onClose: () => mt(null),
							items: qt ? ei(qt) : []
						}),
						/* @__PURE__ */ H("iframe", {
							ref: N,
							title: T("Live editor"),
							sandbox: "allow-same-origin",
							onLoad: zt,
							className: "absolute top-0 border-0 bg-white",
							style: {
								width: R.width,
								height: R.height,
								left: R.left,
								transformOrigin: "top left",
								transform: `scale(${R.scale})`
							}
						}),
						/* @__PURE__ */ U("div", {
							className: "pointer-events-none absolute inset-0 overflow-hidden",
							children: [
								!C && !Ht.drag && !ke && !Me && !Ve && re && B && !te.includes(re) && /* @__PURE__ */ H("div", {
									"data-cms-hover": re,
									className: "absolute z-raised border border-focus/50",
									style: Gt(B)
								}),
								!Ht.drag && ye.map((e, t) => /* @__PURE__ */ H("div", {
									"data-cms-selection": !0,
									className: "absolute z-raised border-solid border-focus",
									style: {
										...Gt(e),
										borderWidth: 1.5
									}
								}, t)),
								!C && !Ht.drag && ne && D && ye[0] && (() => {
									let e = Kt();
									return e ? /* @__PURE__ */ H(ti, {
										...e,
										id: D,
										box: Gt(ye[0]),
										viewport: {
											width: R.width * R.scale + R.left * 2,
											height: R.height * R.scale
										},
										onDrag: (t) => {
											Ue(null), Ht.start(t, He(g.get()), e.label);
										},
										covers: Ut
									}) : null;
								})(),
								!C && !Ht.drag && Se.filter((e) => e.inside).map((e) => {
									let n = {
										open: !!Ve && Ri(Ve) === Ri(e),
										onOpenChange: (t) => Ue(t ? e : null),
										returnFocus: kt,
										children: /* @__PURE__ */ H(Pr, {
											types: [..._.values()],
											allowed: (t) => bt(e.parentId, [t.name]),
											onChoose: (t) => Pt(t, e),
											onClose: () => Ue(null)
										})
									};
									if (e.parentId === null) return E.length ? null : /* @__PURE__ */ H(Qr, {
										target: e,
										position: Gt,
										onWrite: bt(null) ? Ft : void 0,
										onStart: q.length ? () => Ge(!0) : void 0,
										...n
									}, "root");
									let r = e.hitRect.top;
									return t(E, e.parentId)?.children?.length || r + e.hitRect.height < 0 || r > R.height || !(n.open || re === e.parentId || te.includes(e.parentId)) ? null : /* @__PURE__ */ H(Zr, {
										target: e,
										position: Gt,
										...n
									}, Ri(e));
								}),
								!C && !Ht.drag && (() => {
									let e = Ve && !Ve.inside ? Ve : !Ve && !Me ? Te : null;
									return e ? /* @__PURE__ */ H(Xr, {
										target: e,
										position: Gt,
										open: Ve === e,
										onOpenChange: (t) => {
											Ue(t ? e : null), t || Dt(null);
										},
										returnFocus: kt,
										children: /* @__PURE__ */ H(Pr, {
											types: [..._.values()],
											allowed: (t) => bt(e.parentId, [t.name]),
											onChoose: (t) => Pt(t, e),
											onClose: () => Ue(null)
										})
									}, Ri(e)) : null;
								})(),
								Ht.drag && /* @__PURE__ */ H(ni, {
									drag: Ht.drag,
									position: Gt
								})
							]
						})
					]
				}),
				P && /* @__PURE__ */ U(Ne, { children: [
					/* @__PURE__ */ H(qi, { slots: I }),
					h && /* @__PURE__ */ H(Zi, {
						doc: P,
						content: c,
						onChange: h,
						readOnly: C
					}),
					/* @__PURE__ */ H(Un, {
						root: P,
						offset: Wt
					}),
					/* @__PURE__ */ H(Xi, {
						doc: P,
						frame: N.current,
						scale: R.scale
					})
				] })
			]
		})]
	});
}
var qi = ae(function({ slots: e }) {
	let { store: t } = G(), n = K(t, (e) => e.nodes), r = new Set(e.filter((e) => !e.instance && e.prop === "items").map((e) => e.id)), i = /* @__PURE__ */ new Map(), a = A(() => new Map(s(n).map(({ node: e }) => [e.id, e])), [n]);
	return /* @__PURE__ */ U(Ne, { children: [e.filter((e) => e.instance || e.prop !== "items").map((e) => {
		let t = a.get(e.id);
		if (!t) return null;
		let n = `${e.instance ? "instance:" : ""}${e.id}:${e.prop}`, r = i.get(n) ?? 0;
		return i.set(n, r + 1), Pe(e.instance ? /* @__PURE__ */ H(Ji, {
			node: t,
			slot: e
		}) : [
			"text",
			"cite",
			"caption"
		].includes(e.prop) ? t.type === "paragraph" && e.prop === "text" ? /* @__PURE__ */ H(Fi, {
			node: t,
			prop: "text",
			tag: "span",
			placeholder: T("Write, or press “/” for blocks"),
			quiet: !0
		}) : /* @__PURE__ */ H(Fi, {
			node: t,
			prop: e.prop,
			tag: "span",
			placeholder: e.element.dataset.cmsPlaceholder ?? T("Write something…")
		}) : /* @__PURE__ */ H(Yi, {
			node: t,
			prop: e.prop
		}), e.element, `${n}:${r}`);
	}), [...r].map((t) => {
		let n = a.get(t);
		return n ? /* @__PURE__ */ H(Ii, {
			node: n,
			renderItem: (n, r) => {
				let i = e.find((e) => e.id === t && e.prop === "items" && e.index === n);
				return i ? Pe(r, i.element, `${t}:items:${n}`) : null;
			}
		}, t) : null;
	})] });
}), Ji = ae(function({ node: e, slot: n }) {
	let { store: r, readOnly: i } = G(), a = K(r, (t) => t.focus?.id === e.id && t.focus.prop === `values.${n.prop}` ? t.focus : null), o = String((Object.prototype.hasOwnProperty.call(e.props.values ?? {}, n.prop) ? e.props.values[n.prop] : n.instance.value) ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
	return /* @__PURE__ */ H(Bn, {
		tag: "span",
		html: o,
		focus: a,
		plainText: !0,
		singleLine: n.instance.type === "text",
		disabled: i,
		placeholder: n.element.dataset.cmsPlaceholder ?? T("Write something…"),
		onFocus: () => r.select(e.id),
		onChange: (i, a) => r.updateProps(e.id, { values: {
			...t(r.get().nodes, e.id)?.props.values,
			[n.prop]: a.innerText
		} }, `instance:${e.id}:${n.prop}`),
		onKeyDown: (t, i) => {
			(t.key === "Escape" || t.key === "Enter" && n.instance.type === "text") && (t.preventDefault(), i.blur(), r.select(e.id, !0));
		}
	});
}), Yi = ae(function({ node: e, prop: t }) {
	let { store: n, readOnly: r } = G(), i = K(n, (n) => n.focus?.id === e.id && n.focus.prop === t ? n.focus : null), a = String(e.props[t] ?? ""), o = t === "code" ? a.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>") : a;
	return /* @__PURE__ */ H(Bn, {
		tag: "span",
		html: o,
		disabled: r,
		focus: i,
		singleLine: t !== "code",
		onChange: (r, i) => n.updateProps(e.id, { [t]: t === "code" ? i.innerText : r }, `text:${e.id}:${t}`),
		onFocus: () => n.select(e.id),
		onKeyDown: (r, i) => {
			(r.key === "Escape" || t !== "code" && r.key === "Enter") && (r.preventDefault(), i.blur(), n.select(e.id, !0));
		}
	});
});
function Xi({ doc: e, frame: n, scale: i }) {
	let s = Ei(), { store: c, types: u, allowed: d } = G(), [f, h] = M(null);
	if (le(() => {
		h(s ? Nn(e) : null);
	}, [s, e]), Oi(!!s, [document, e]), !s || !f || !t(c.get().nodes, s.id)) return null;
	let g = (e) => {
		let n = l(e, u), i = c.get().nodes, f = r(i, s.id);
		if (!f || !n.length) return;
		let h = f.parentId ? t(i, f.parentId) : null, g = n.every((e) => p(h, e.type, u, h ? [] : d)) ? f : o(i, s.id, n.map((e) => e.type), u, d);
		g && (Ti(null), c.commit(m(a(i, s.id), g.parentId, g.index, n)), ui(c, n[0], _i(gi(c.get().nodes, u, () => !1))));
	}, _ = n.getBoundingClientRect(), { maxHeight: v, ...y } = Di({
		left: _.left + f.left * i,
		top: _.top + f.top * i,
		bottom: _.top + f.bottom * i
	});
	return Pe(/* @__PURE__ */ H("div", {
		"data-cms-slash": !0,
		className: "cms-pop fixed z-overlay overflow-hidden !p-0",
		style: y,
		children: /* @__PURE__ */ H(tr, {
			types: [...u.values()],
			query: s.query,
			showSearch: !1,
			compact: !0,
			style: { maxHeight: v },
			chooseFirst: s.enter,
			keyboardDocument: e,
			onChoose: g,
			onClose: () => Ti(null),
			onNoMatch: () => {
				Ti(null);
			},
			allowed: (e) => !!o(c.get().nodes, s.id, e.name, u, d)
		})
	}), document.body);
}
function Zi({ doc: e, content: t, onChange: n, readOnly: r }) {
	let i = [...e.querySelectorAll("[data-cms-entry-field=\"title\"]")];
	return /* @__PURE__ */ H(Ne, { children: i.map((i, a) => {
		let o = t.title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
		return Pe(/* @__PURE__ */ H(Bn, {
			tag: "span",
			html: o,
			singleLine: !0,
			disabled: r,
			placeholder: T("Untitled"),
			onChange: (e, t) => n(t.textContent ?? ""),
			onKeyDown: (t, n) => {
				t.key === "Enter" && (t.preventDefault(), n.blur(), e.querySelector("[data-cms-editor-root] [contenteditable=\"true\"]")?.focus());
			}
		}), i, `title:${a}`);
	}) });
}
// admin/src/builder/controls.tsx
var Qi = "w-[88px]", $i = "cms.inspector.collapsed";
function ea() {
	try {
		let e = JSON.parse(localStorage.getItem($i) ?? "{}");
		return e && typeof e == "object" && !Array.isArray(e) ? Object.fromEntries(Object.entries(e).filter(([, e]) => typeof e == "boolean")) : {};
	} catch {
		return {};
	}
}
function ta({ title: e, detail: t, children: n, open: r = !0, actions: i, actionsOpen: a = !0, empty: o, own: s = !0, fields: c, remember: l = !0 }) {
	let [u, d] = M(() => !l || ea()[e] === void 0 ? r : !ea()[e]), f = (t) => {
		if (d(t), l) try {
			localStorage.setItem($i, JSON.stringify({
				...ea(),
				[e]: !t
			}));
		} catch {}
	}, p = !!(o && i && !c), m = o === !1 && /* @__PURE__ */ H("span", {
		className: V("size-1.5 shrink-0 rounded-full", s ? "bg-focus" : "bg-border-strong"),
		"aria-hidden": !0
	});
	return /* @__PURE__ */ U("section", {
		"data-section": e,
		className: "min-w-0 border-b border-border last:border-b-0",
		children: [/* @__PURE__ */ U("header", {
			className: "group/section flex h-10 items-center gap-1 pl-4 pr-3",
			children: [p ? /* @__PURE__ */ H("span", {
				className: "min-w-0 flex-1 truncate text-xs font-semibold text-ink",
				children: e
			}) : /* @__PURE__ */ U(P, {
				variant: "ghost",
				onClick: () => f(!u),
				"aria-expanded": u,
				className: "!h-full min-w-0 flex-1 shrink !justify-start !gap-1.5 !rounded-none !bg-transparent !px-0 text-left !text-xs !font-semibold !text-ink focus-visible:!-outline-offset-2",
				children: [
					/* @__PURE__ */ H("span", {
						className: "min-w-0 truncate",
						children: e
					}),
					t !== void 0 && /* @__PURE__ */ H("span", {
						className: "shrink-0 font-normal tabular-nums text-muted",
						children: t
					}),
					m,
					/* @__PURE__ */ H(I, {
						name: "chevron-down",
						size: 10,
						className: V("shrink-0 text-faint transition-[rotate,opacity] duration-fast", u ? "opacity-0 group-hover/section:opacity-100 group-focus-within/section:opacity-100" : "-rotate-90")
					})
				]
			}), i && /* @__PURE__ */ H("span", {
				className: "contents",
				onClickCapture: () => a && !u && f(!0),
				children: i
			})]
		}), u && !p && /* @__PURE__ */ H("div", {
			className: "space-y-1 px-4 pb-3",
			children: n
		})]
	});
}
function na({ children: e, className: t }) {
	return /* @__PURE__ */ H("div", {
		"data-section": "content",
		className: V("space-y-1 border-b border-border px-4 py-3 last:border-b-0", t),
		children: e
	});
}
function ra({ title: e, action: t }) {
	return /* @__PURE__ */ U("div", {
		className: "flex h-7 items-center justify-between pt-1",
		children: [/* @__PURE__ */ H("span", {
			className: "text-xs text-muted",
			children: e
		}), t]
	});
}
function ia({ field: e, children: t, htmlFor: n, className: r }) {
	let i = e.status, a = e.reset, o = t ?? e.label, s = V("flex min-h-7 min-w-0 shrink-0 items-center text-left text-xs", Qi, i ? "text-ink" : "text-muted", r), c = /* @__PURE__ */ H("span", {
		className: V("min-w-0 py-0.5 leading-[1.25] [overflow-wrap:anywhere]", i && "-ml-1 rounded-xs px-1 box-decoration-clone", i === "own" ? "bg-focus-soft" : i === "inherited" && "bg-active"),
		children: o
	});
	return i === "own" && a ? /* @__PURE__ */ H(B, {
		content: T("Reset {label}", { label: String(e.label ?? "") }),
		children: /* @__PURE__ */ H(P, {
			variant: "ghost",
			onClick: a,
			className: V(s, "!h-auto !justify-start !whitespace-normal !rounded-xs !bg-transparent !px-0 !text-xs !font-normal !text-ink"),
			children: c
		})
	}) : i === "inherited" ? /* @__PURE__ */ H(B, {
		content: T("Inherited from a larger screen, another state or the component"),
		children: /* @__PURE__ */ H("label", {
			htmlFor: n,
			className: s,
			children: c
		})
	}) : /* @__PURE__ */ H(B, {
		content: e.instructions,
		children: /* @__PURE__ */ H("label", {
			htmlFor: n,
			className: s,
			children: c
		})
	});
}
function aa(e) {
	if (e.stack === !0 || Me.includes(e.type) && !e.component) return !0;
	if (e.type !== "select" || e.component || e.display !== "segmented") return !1;
	let t = Object.values(e.options ?? {}).map((e) => typeof e == "string" ? e : e && typeof e == "object" && "label" in e ? String(e.label ?? "") : "").filter(Boolean);
	return t.length > 3 || t.join(" ").length > 20;
}
var oa = (e) => e === "xs" || e === void 0 ? "sm" : e;
function Z({ fields: e, values: t, onChange: n, disabled: r, context: i = {}, className: a, bare: o }) {
	N(C.fields.subscribe, C.fields.version);
	let s = te();
	return /* @__PURE__ */ H("div", {
		className: V("min-w-0", a ?? "space-y-1"),
		children: e.filter((e) => Te(e, t)).map((e) => {
			let a = s?.fieldTypes.find((t) => t.key === e.type), c = C.fields.get(e.component ?? a?.component ?? e.type) ?? C.fields.get("json");
			if (!c) return null;
			let l = {
				...e,
				size: oa(e.size),
				fit: !0,
				id: we(e, i.path)
			}, u = !o && aa(e), d = /* @__PURE__ */ H(c, {
				field: l,
				value: t[e.handle] ?? e.default ?? null,
				onChange: (t) => n(e.handle, t),
				disabled: r,
				context: {
					...i,
					values: t
				}
			});
			return /* @__PURE__ */ U("div", {
				"data-field": e.handle,
				className: V("flex min-w-0", u ? "flex-col items-stretch" : "min-h-7 items-center gap-2", e.className),
				children: [!o && e.type !== "toggle" && /* @__PURE__ */ H(ia, {
					field: l,
					htmlFor: l.id,
					className: u ? "!w-auto" : void 0
				}), /* @__PURE__ */ H("div", {
					className: V("flex min-w-0 items-center", !u && "flex-1"),
					children: d
				})]
			}, e.handle);
		})
	});
}
var sa = "cms-input h-7 w-full min-w-0 rounded-sm px-2 text-sm placeholder:text-ghost";
function ca({ color: e, dark: t, className: n }) {
	return /* @__PURE__ */ U("span", {
		className: V("relative inline-block size-4 shrink-0 overflow-hidden rounded-xs align-middle cms-checkerboard [--checker:6px]", n),
		children: [
			/* @__PURE__ */ H("span", {
				className: "absolute inset-0",
				style: { background: e }
			}),
			t && /* @__PURE__ */ H("span", {
				className: "absolute inset-0 [clip-path:polygon(100%_50%,100%_100%,50%_100%)]",
				style: { background: t }
			}),
			/* @__PURE__ */ H("span", { className: "cms-swatch-edge" })
		]
	});
}
var la = O(function({ className: e, children: t, ...n }, r) {
	return /* @__PURE__ */ H(P, {
		ref: r,
		variant: "ghost",
		icon: "plus",
		className: V("w-full !justify-start !gap-1.5 !px-1.5 !text-xs !font-normal !text-muted hover:!text-ink", e),
		...n,
		children: t
	});
});
function ua({ onClick: e, label: t = T("Add") }) {
	return /* @__PURE__ */ H(B, {
		content: t,
		children: /* @__PURE__ */ H(L, {
			icon: "plus",
			label: t,
			title: void 0,
			size: "xs",
			onClick: e
		})
	});
}
function da({ onClick: e, label: t = T("Remove") }) {
	return /* @__PURE__ */ H(B, {
		content: t,
		children: /* @__PURE__ */ H(L, {
			icon: "minus",
			label: t,
			title: void 0,
			size: "xs",
			onClick: e,
			className: "!text-faint hover:!text-danger"
		})
	});
}
// admin/src/builder/fields/tokens.tsx
function fa() {
	return gn().find;
}
function pa(e) {
	let t = gn();
	return (n) => {
		let r = n.trim();
		return !e || !/^[a-z][a-z0-9-]*$/i.test(r) ? null : t.of(e).find((e) => e.name === r)?.ref ?? null;
	};
}
function ma({ token: e, alpha: t, className: n }) {
	return /* @__PURE__ */ H(B, {
		content: `${e.variable} · ${e.value}`,
		children: /* @__PURE__ */ U("span", {
			className: V("inline-flex min-w-0 items-center gap-1 truncate rounded-xs bg-active px-1.5 leading-5 text-ink", n),
			children: [/* @__PURE__ */ H("span", {
				className: "truncate",
				children: e.name
			}), t && /* @__PURE__ */ U("span", {
				className: "text-muted",
				children: ["/", t]
			})]
		})
	});
}
var ha = (e) => V("h-6 min-w-0 rounded-xs px-1.5 text-2xs tabular-nums", e ? "bg-signal text-signal-ink" : "bg-sunken text-text hover:bg-hover");
function ga({ value: e, onPick: t, auto: n }) {
	let { engine: r } = mn(), i = Ft(r, gn().of("spacing")), a = (t) => t === e || t === "0px" && e === "0", o = (e) => /* @__PURE__ */ H(B, {
		content: e.title,
		children: /* @__PURE__ */ H(z, {
			compact: !0,
			onClick: () => t(e.value),
			className: ha(a(e.value)),
			children: e.label
		})
	}, e.value);
	return /* @__PURE__ */ U("div", {
		className: "space-y-2",
		children: [i.scale.length > 0 && /* @__PURE__ */ U("div", { children: [/* @__PURE__ */ H("div", {
			className: "cms-label mb-1",
			children: T("Scale||series of steps")
		}), /* @__PURE__ */ H("div", {
			className: "grid grid-cols-6 gap-1",
			children: i.scale.map(o)
		})] }), (i.named.length > 0 || n) && /* @__PURE__ */ U("div", { children: [/* @__PURE__ */ H("div", {
			className: "cms-label mb-1",
			children: T("Theme")
		}), /* @__PURE__ */ U("div", {
			className: "flex flex-wrap gap-1",
			children: [i.named.map(o), n && /* @__PURE__ */ H(z, {
				compact: !0,
				onClick: () => t("auto"),
				className: ha(e === "auto"),
				children: T("Auto")
			})]
		})] })]
	});
}
function _a({ group: e, value: t, onPick: n, detach: r }) {
	let i = gn(), a = i.of(e), o = i.find(t)?.token.variable ?? null;
	return e === "spacing" ? /* @__PURE__ */ H("div", {
		className: "p-2",
		children: /* @__PURE__ */ H(ga, {
			value: t,
			onPick: n
		})
	}) : /* @__PURE__ */ U("div", { children: [/* @__PURE__ */ H("div", {
		ref: Oe,
		className: "max-h-60 overflow-y-auto",
		children: a.map((t) => /* @__PURE__ */ U(z, {
			compact: !0,
			"data-selected": o === t.variable || void 0,
			onClick: () => n(t.ref),
			className: V("flex h-7 w-full items-center gap-2 rounded-xs px-2 text-left text-xs hover:bg-hover", o === t.variable && "bg-active"),
			children: [
				e === "shadow" && /* @__PURE__ */ H("span", {
					className: "size-3.5 shrink-0 rounded-xs bg-bg",
					style: { boxShadow: t.value }
				}),
				e === "radius" && /* @__PURE__ */ H("span", {
					className: "size-3.5 shrink-0 border-l-[1.5px] border-t-[1.5px] border-muted",
					style: { borderTopLeftRadius: t.value }
				}),
				/* @__PURE__ */ H("span", {
					className: "min-w-0 truncate text-text",
					children: t.name
				}),
				/* @__PURE__ */ H("span", {
					className: "ml-auto max-w-[45%] shrink-0 truncate font-mono text-2xs text-faint",
					children: t.value
				}),
				o === t.variable && /* @__PURE__ */ H(I, {
					name: "check",
					size: 12,
					className: "shrink-0 text-focus"
				})
			]
		}, t.variable))
	}), o && r && /* @__PURE__ */ U(z, {
		compact: !0,
		onClick: r,
		className: "mt-1 flex h-7 w-full items-center gap-2 rounded-xs border-t border-border px-2 text-xs text-muted hover:bg-hover hover:text-text",
		children: [/* @__PURE__ */ H(I, {
			name: "unlink",
			size: 12
		}), T("Detach")]
	})] });
}
function va({ group: e, value: t, onPick: n, active: r, className: i, trigger: a }) {
	let [o, s] = M(!1), c = gn(), { engine: l } = mn(), u = e;
	if (!l || u !== "spacing" && !c.of(u).length) return null;
	let d = (e) => {
		n(e), s(!1);
	};
	return /* @__PURE__ */ H(R, {
		open: o,
		onOpenChange: s,
		align: "end",
		className: "w-60 !p-1",
		trigger: a ?? /* @__PURE__ */ H(B, {
			content: T("Theme Values"),
			children: /* @__PURE__ */ H(z, {
				compact: !0,
				className: V("size-5 shrink-0 place-items-center rounded-xs text-faint hover:bg-hover hover:text-ink", r || o ? "grid text-ink" : "hidden group-hover/value:grid group-focus-within/value:grid [@media(hover:none)]:grid", i),
				"aria-label": T("Theme Values"),
				children: /* @__PURE__ */ H(I, {
					name: "symbol",
					size: 10
				})
			})
		}),
		children: /* @__PURE__ */ H(_a, {
			group: u,
			value: t,
			onPick: d,
			detach: () => d(c.find(t)?.token.value ?? null)
		})
	});
}
// admin/src/builder/fields/controls.tsx
function ya(e, t) {
	let n = (e) => Object.entries(e).every(([e, n]) => Array.isArray(n) ? n.includes(t[e]) : t[e] === n), r = e.if, i = e.unless;
	return (!r || n(r)) && !(i && Object.entries(i).every(([e, n]) => Array.isArray(n) ? n.includes(t[e] ?? null) : (t[e] ?? null) === n));
}
function ba({ field: e, ...t }) {
	let n = C.fields.get(e.component ?? e.type) ?? C.fields.get("json");
	return n ? /* @__PURE__ */ H("div", {
		className: V("min-w-0 flex-1", e.className),
		children: /* @__PURE__ */ H(n, {
			field: e,
			...t,
			context: t.context ?? {}
		})
	}) : null;
}
function xa({ className: e, children: t }) {
	return /* @__PURE__ */ H("div", {
		className: V("relative flex min-w-0 flex-1 items-center gap-1", e),
		children: t
	});
}
var Sa = /^(-?\d*\.?\d+)([a-z%]*)$/i, Ca = {
	px: [
		"px",
		"%",
		"em",
		"rem",
		"vw",
		"vh"
	],
	"%": [
		"%",
		"px",
		"em",
		"rem",
		"vw",
		"vh"
	],
	em: [
		"em",
		"rem",
		"px",
		"%"
	],
	deg: ["deg", "turn"],
	ms: ["ms", "s"]
}, wa = (e, t, n) => Math.min(n ?? Infinity, Math.max(t ?? -Infinity, e)), Ta = (e) => Math.round(e * 1e3) / 1e3;
function Ea(e) {
	return e.field.percent ? /* @__PURE__ */ H(Da, { ...e }) : /* @__PURE__ */ H(ja, { ...e });
}
function Da({ field: e, value: t, onChange: n, ...r }) {
	let i = t == null || t === "" ? null : Number(t), a = (e) => typeof e == "number" ? Math.round(e * 100) : void 0, o = e.slider;
	return /* @__PURE__ */ H(ja, {
		...r,
		field: {
			...e,
			percent: void 0,
			unit: "%",
			units: ["%"],
			min: a(e.min),
			max: a(e.max),
			step: a(e.step) || 1,
			placeholder: e.placeholder ?? "100",
			slider: o && {
				min: o.min * 100,
				max: o.max * 100,
				step: Math.max(1, o.step * 100),
				neutral: o.neutral * 100
			}
		},
		value: i === null || Number.isNaN(i) ? null : `${Math.round(i * 1e3) / 10}%`,
		onChange: (e) => {
			let t = e == null ? null : String(e).match(/^(-?\d*\.?\d+)%?$/);
			n(t ? String(Math.round(parseFloat(t[1]) * 10) / 1e3) : e ?? null);
		}
	});
}
function Oa(e, t) {
	let [n, r] = M(!1), i = t(e);
	return k(() => {
		if (i) return r(!1);
		let e = window.setTimeout(() => r(!0), 700);
		return () => window.clearTimeout(e);
	}, [e, i]), {
		shown: n && !i,
		show: () => r(!0)
	};
}
var ka = {
	ms: ["transition-duration"],
	s: ["transition-duration"],
	deg: ["rotate"],
	turn: ["rotate"],
	"": [
		"line-height",
		"opacity",
		"z-index",
		"aspect-ratio",
		"flex",
		"order",
		"scale",
		"font-weight"
	],
	length: [
		"width",
		"margin",
		"inset",
		"flex-basis",
		"font-size",
		"letter-spacing",
		"border-width",
		"border-radius",
		"gap",
		"translate",
		"grid-template-columns"
	]
};
function Aa(e, t, n) {
	if (typeof CSS > "u") return !0;
	let r = e, i = t.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`);
	return /^-?[a-z]+(-[a-z]+)*$/.test(i) && CSS.supports(i, "inherit") ? CSS.supports(i, r) : (ka[n] ?? ka.length).some((e) => CSS.supports(e, r));
}
function ja({ field: e, value: t, onChange: n, disabled: r, context: i }) {
	let a = fa(), o = pa(e.group), [s, c] = M(null), [l, u] = M(null), d = j(null), [f, p] = M(!1), m = t == null || t === "" ? void 0 : String(t), h = e.unit ?? "px", g = e.step ?? 1, _ = e.min, v = e.max, y = e.group, b = e.prefixIcon ? /* @__PURE__ */ H(I, {
		name: e.prefixIcon,
		size: 13
	}) : e.prefix, x = e.slider, S = e.menu, C = e.action, ee = e.keywords ?? [], w = a(m), E = m?.match(Sa), D = E ? E[2] || h : m ? "" : l ?? h, te = h ? e.units ?? Ca[h] ?? [h] : [], ne = !m || !!E, re = (e, t = D) => n(`${Ta(wa(e, _, v))}${t}`), ie = (e) => {
		ne && re((E ? parseFloat(E[1]) : 0) + e);
	}, O = (e, t) => {
		if (r || e.button !== 0 || document.activeElement === e.currentTarget || !ne) return;
		e.preventDefault();
		let n = e.clientX, i = E ? parseFloat(E[1]) : 0, a = !1, o = (e) => {
			let t = e.clientX - n;
			!a && Math.abs(t) < 3 || (a = !0, document.body.style.cursor = "ew-resize", re(i + Math.round(t / 2) * g * (e.shiftKey ? 10 : e.altKey ? .1 : 1)));
		}, s = () => {
			window.removeEventListener("pointermove", o), window.removeEventListener("pointerup", s), document.body.style.cursor = "", !a && t && d.current?.focus();
		};
		window.addEventListener("pointermove", o), window.addEventListener("pointerup", s);
	}, ae = (t) => t === "" ? null : o(t) || (/^-?\d*\.?\d+$/.test(t) ? D ? `${t}${D}` : t : ee.includes(t) || Aa(t, e.property ?? e.handle, h) ? t : void 0), oe = Oa(s ?? "", (e) => s === null || ae(e.trim()) !== void 0), se = () => {
		if (s === null) return;
		let e = s.trim();
		if (c(null), e === (E ? E[1] : m ?? "")) return;
		let t = ae(e);
		t !== void 0 && n(t);
	}, k = (e) => {
		E ? n(`${E[1]}${e}`) : m || u(e);
	};
	return /* @__PURE__ */ U(xa, { children: [
		x && /* @__PURE__ */ H(ba, {
			field: {
				handle: `${e.handle}-slider`,
				type: "number",
				display: "slider",
				input: !1,
				size: "sm",
				label: e.label,
				min: x.min,
				max: x.max,
				step: x.step,
				neutral: x.neutral
			},
			value: E ? parseFloat(E[1]) : null,
			onChange: (e) => n(e),
			disabled: r,
			context: i
		}),
		/* @__PURE__ */ H(B, {
			content: e.title,
			children: /* @__PURE__ */ U("div", {
				className: V("group/value cms-input flex h-7 min-w-0 flex-1 items-center rounded-sm", x && "!w-16 !flex-none"),
				"data-focus": f || void 0,
				"data-invalid": oe.shown || void 0,
				"data-disabled": r || void 0,
				onFocus: () => p(!0),
				onBlur: (e) => !e.currentTarget.contains(e.relatedTarget) && p(!1),
				children: [
					b !== void 0 && /* @__PURE__ */ H("span", {
						onPointerDown: (e) => O(e, !0),
						className: "grid h-full w-6 shrink-0 cursor-ew-resize select-none place-items-center text-xs text-faint hover:text-ink",
						children: b
					}),
					w && s === null ? /* @__PURE__ */ H(va, {
						group: y ?? w.token.group,
						value: m,
						onPick: n,
						trigger: /* @__PURE__ */ H(z, {
							compact: !0,
							onDoubleClick: () => c(m ?? ""),
							className: V("flex h-full min-w-0 flex-1 items-center pr-1 text-left", b === void 0 && "pl-1"),
							children: /* @__PURE__ */ H(ma, {
								token: w.token,
								alpha: w.alpha,
								className: "text-xs"
							})
						})
					}) : /* @__PURE__ */ H("input", {
						ref: d,
						id: we(e),
						value: s ?? (E ? E[1] : m ?? ""),
						placeholder: e.placeholder,
						disabled: r,
						autoComplete: "off",
						spellCheck: !1,
						onPointerDown: (e) => O(e, !0),
						onChange: (e) => c(e.target.value),
						onFocus: (e) => e.target.select(),
						onBlur: se,
						"aria-invalid": oe.shown || void 0,
						onKeyDown: (e) => {
							e.key === "Enter" && (s !== null && ae(s.trim()) === void 0 ? oe.show() : e.target.blur()), e.key === "Escape" && (c(null), requestAnimationFrame(() => d.current?.blur())), (e.key === "ArrowUp" || e.key === "ArrowDown") && ne && (e.preventDefault(), c(null), ie((e.key === "ArrowUp" ? 1 : -1) * g * (e.shiftKey ? 10 : e.altKey ? .1 : 1)));
						},
						className: V("h-full min-w-0 flex-1 bg-transparent text-sm tabular-nums text-text outline-none placeholder:text-ghost disabled:text-faint", b === void 0 && "pl-2", ne && !r && "cursor-ew-resize focus:cursor-text")
					}),
					(!w || s !== null) && /* @__PURE__ */ U("span", {
						className: "flex shrink-0 items-center gap-px pr-1",
						children: [
							y && /* @__PURE__ */ H(va, {
								group: y,
								value: m,
								onPick: n
							}),
							D && te.length > 0 && /* @__PURE__ */ H(de, {
								align: "end",
								trigger: /* @__PURE__ */ H(z, {
									compact: !0,
									disabled: r,
									className: "h-5 min-w-5 rounded-xs px-1 text-2xs text-faint hover:bg-hover hover:text-ink",
									"aria-label": T("Unit"),
									children: D
								}),
								items: [...te.map((e) => ({
									label: e,
									checked: e === D,
									onSelect: () => k(e)
								})), ...ee.length ? [{
									separator: !0,
									label: ""
								}, ...ee.map((e) => ({
									label: e,
									checked: m === e,
									onSelect: () => n(e)
								}))] : []]
							}),
							!D && h && ee.length > 0 && m && ee.includes(m) && /* @__PURE__ */ H(de, {
								align: "end",
								trigger: /* @__PURE__ */ H(z, {
									compact: !0,
									className: "grid size-5 place-items-center rounded-xs text-faint hover:bg-hover hover:text-ink",
									"aria-label": T("Unit"),
									children: /* @__PURE__ */ H(I, {
										name: "chevron-down",
										size: 10
									})
								}),
								items: [
									...te.map((e) => ({
										label: e,
										onSelect: () => n(`0${e}`)
									})),
									{
										separator: !0,
										label: ""
									},
									...ee.map((e) => ({
										label: e,
										checked: m === e,
										onSelect: () => n(e)
									}))
								]
							})
						]
					})
				]
			})
		}),
		S && /* @__PURE__ */ H(de, {
			align: "end",
			trigger: /* @__PURE__ */ U(z, {
				compact: !0,
				className: "flex h-7 shrink-0 items-center gap-0.5 rounded-sm px-1.5 text-xs text-muted hover:bg-hover hover:text-ink",
				children: [S.label, /* @__PURE__ */ H(I, {
					name: "chevron-down",
					size: 10
				})]
			}),
			items: S.items.map((e) => ({
				label: e.label,
				checked: e.checked,
				onSelect: () => n(e.value)
			}))
		}),
		C && /* @__PURE__ */ H(B, {
			content: C.label,
			children: /* @__PURE__ */ H(z, {
				compact: !0,
				onClick: () => n(C.value),
				className: "grid size-7 shrink-0 place-items-center rounded-sm text-muted hover:bg-hover hover:text-ink",
				"aria-label": C.label,
				children: /* @__PURE__ */ H(I, {
					name: C.icon,
					size: 14
				})
			})
		})
	] });
}
// admin/src/builder/fields/composite.tsx
var Ma = {
	2: "grid grid-cols-2",
	3: "grid grid-cols-3",
	4: "grid grid-cols-4"
};
function Na({ field: e, value: t, onChange: n, disabled: r, context: i }) {
	let a = t ?? {}, o = e.link, [s, c] = M(!o || e.split === !0), l = (s ? e.fields ?? [] : [o]).filter((e) => ya(e, a)), u = s ? Ma[e.columns] : void 0;
	return /* @__PURE__ */ U(xa, { children: [/* @__PURE__ */ H("div", {
		className: V("min-w-0 flex-1 gap-1", u ?? "flex items-center"),
		children: l.map((e) => /* @__PURE__ */ H(ba, {
			field: e,
			value: a[e.handle] ?? e.default ?? null,
			onChange: (t) => n({
				...a,
				[e.handle]: t
			}),
			disabled: r,
			context: i
		}, e.handle))
	}), o && /* @__PURE__ */ H(B, {
		content: s ? e.joinLabel ?? T("The same for all") : e.splitLabel ?? T("Each One"),
		children: /* @__PURE__ */ H(z, {
			compact: !0,
			onClick: () => c(!s),
			className: "grid size-7 shrink-0 place-items-center rounded-sm text-muted hover:bg-hover hover:text-ink",
			"aria-label": s ? e.joinLabel ?? T("The same for all") : e.splitLabel ?? T("Each One"),
			children: /* @__PURE__ */ H(I, {
				name: s ? "square" : "radius",
				size: 14
			})
		})
	})] });
}
function Pa({ field: e, value: t, onChange: n, disabled: r, context: i }) {
	let a = t ?? {}, o = e.key ?? {}, s = e.labels, c = e.items, l = (e, t) => {
		let r = (t ?? "").trim();
		o.lower && (r = r.toLowerCase()), o.strip && (r = r.replace(new RegExp(o.strip, "g"), "")), !(!r || r === e || r in a || o.allowed && !o.allowed.includes(r)) && n(Object.fromEntries(Object.entries(a).map(([t, n]) => t === e ? [r, n] : [t, n])));
	};
	return /* @__PURE__ */ H("div", {
		className: "min-w-0 flex-1 space-y-1",
		children: Object.entries(a).map(([t, u]) => /* @__PURE__ */ U("div", {
			className: "flex items-center gap-1",
			children: [
				o.prefix && /* @__PURE__ */ H("span", {
					className: "text-xs text-faint",
					children: o.prefix
				}),
				s ? /* @__PURE__ */ H("span", {
					className: "mr-1 w-[88px] shrink-0 truncate text-xs text-text",
					children: s[t] ?? t
				}) : /* @__PURE__ */ H(ba, {
					field: {
						handle: `${e.handle}-${t}`,
						type: o.options ? "select" : "text",
						size: "sm",
						commit: "blur",
						label: T("Name"),
						options: o.options,
						list: o.list,
						placeholder: o.placeholder,
						mono: !0,
						className: o.className ?? "!w-[42%] !flex-none"
					},
					value: t,
					onChange: (e) => l(t, e),
					disabled: r,
					context: i
				}),
				typeof e.join == "string" && /* @__PURE__ */ H("span", {
					className: "text-xs text-faint",
					children: e.join
				}),
				/* @__PURE__ */ H(ba, {
					field: {
						...c?.[t] ?? e.item,
						handle: `${e.handle}-${t}-value`,
						...(c?.[t] ?? e.item).property === !0 ? { property: t } : {}
					},
					value: u ?? null,
					onChange: (e) => n({
						...a,
						[t]: e
					}),
					disabled: r,
					context: i
				}),
				/* @__PURE__ */ H(da, { onClick: () => n(Object.fromEntries(Object.entries(a).filter(([e]) => e !== t))) })
			]
		}, t))
	});
}
function Fa(e, t) {
	let n = Object.keys(e), r = Object.keys(t);
	if (r.length < n.length) {
		let e = n.find((e) => !(e in t));
		return e === void 0 ? null : {
			op: "remove",
			key: e
		};
	}
	let i = n.findIndex((e, t) => r[t] !== e);
	if (i >= 0) return {
		op: "rename",
		from: n[i],
		to: r[i]
	};
	let a = r.find((n) => t[n] !== e[n]);
	return a === void 0 ? null : {
		op: "set",
		key: a,
		value: t[a]
	};
}
// admin/src/builder/content/scope.ts
var Ia = () => [
	{
		path: "entry.author.name",
		label: T("Author"),
		group: T("Page")
	},
	{
		path: "entry.title",
		label: T("Title"),
		group: T("Page")
	},
	{
		path: "entry.url",
		label: T("Link"),
		group: T("Page")
	},
	{
		path: "entry.date|date:F j, Y",
		label: T("Published Date"),
		group: T("Page")
	},
	{
		path: "entry.updated|date:F j, Y",
		label: T("Updated Date"),
		group: T("Page")
	},
	{
		path: "entry.parent.title",
		label: T("Parent Title"),
		group: T("Page")
	},
	{
		path: "entry.prev.url",
		label: T("Previous Page Link"),
		group: T("Page")
	},
	{
		path: "entry.prev.title",
		label: T("Previous Page Title"),
		group: T("Page")
	},
	{
		path: "entry.next.url",
		label: T("Next Page Link"),
		group: T("Page")
	},
	{
		path: "entry.next.title",
		label: T("Next Page Title"),
		group: T("Page")
	}
], La = () => [
	{
		path: "site.name",
		label: T("Site Name"),
		group: T("Site")
	},
	{
		path: "site.description",
		label: T("Site Description"),
		group: T("Site")
	},
	{
		path: "site.url",
		label: T("Site URL"),
		group: T("Site")
	},
	{
		path: "© {site.year} {site.name}",
		label: T("Copyright Line"),
		group: T("Site")
	},
	{
		path: "page.uri",
		label: T("Current Path"),
		group: T("Site")
	},
	{
		path: "pagination.prev",
		label: T("Previous Page of a List"),
		group: T("Pagination")
	},
	{
		path: "pagination.next",
		label: T("Next Page of a List"),
		group: T("Pagination")
	},
	{
		path: "{pagination.current} / {pagination.total}",
		label: T("Page x of y"),
		group: T("Pagination")
	}
];
function Ra(t) {
	let { store: n, doc: r, catalog: i } = G(), a = D(), o = K(n, (n) => e(n.nodes, t.id)), s = E("entries/get", { id: r?.id ?? "" }, {
		enabled: r?.kind === "entry",
		staleTime: 6e4
	}), c = r?.kind === "template" ? r.collections?.length ? r.collections : a.collections.filter((e) => e.routable).map((e) => e.handle).slice(0, 1) : s.data ? [s.data.collection] : [], l = E("collections/get", { handle: c[0] ?? "" }, {
		enabled: !!c[0],
		staleTime: 3e5
	}), u = [];
	for (let e of [...o].reverse()) {
		if (e.type !== "repeat") continue;
		let t = e.props?.as || "item", n = i.sources?.find((t) => t.name === e.props?.source), r = T("{list} item ({name})", {
			list: n?.label ?? T("List"),
			name: t
		});
		for (let [e, i] of Object.entries(n?.item ?? {})) u.push({
			path: `${t}.${e}`,
			label: i,
			group: r
		});
		e.props?.source === "entries" && e.props?.collection && u.push({
			path: `${t}.excerpt`,
			label: T("Excerpt Field"),
			group: r
		}, {
			path: `${t}.cover`,
			label: T("Cover Image Field"),
			group: r
		}), e.props?.source === "list" && u.push({
			path: `{${t}}`,
			label: T("The Item Itself (Text)"),
			group: r
		}), u.push({
			path: "index",
			label: T("Position (1, 2, 3…)"),
			group: r
		}, {
			path: "first",
			label: T("Is First"),
			group: r
		}, {
			path: "last",
			label: T("Is Last"),
			group: r
		});
	}
	if (r?.kind === "component") for (let e of r.props ?? []) u.push({
		path: `props.${e.handle}`,
		label: e.label ?? e.handle,
		group: T("Component Properties")
	});
	u.push(...Ia());
	for (let e of l.data?.fields ?? []) e.type !== "blocks" && u.push({
		path: `entry.${e.handle}${e.type === "date" ? "|date:F j, Y" : ""}`,
		label: e.label,
		group: T("Page Fields")
	});
	u.push(...La());
	for (let e of a.collections.filter((e) => e.type === "global")) u.push({
		path: `globals.${e.handle}.`,
		label: T("{name} (add a field handle)", { name: e.title }),
		group: T("Globals")
	});
	return u;
}
// admin/src/builder/content/ContentPanel.tsx
var za = [
	"text",
	"textarea",
	"richtext",
	"markdown"
], Ba = (e, t) => !e.if || Object.entries(e.if).every(([e, n]) => {
	let r = t[e] ?? null;
	return Array.isArray(n) ? n.includes(r) : r === n;
}), Va = [
	"aria-label",
	"title",
	"role",
	"lang",
	"rel"
], Ha = [
	"active",
	"open",
	"selected",
	"current"
];
function Ua(e, t) {
	let n = e.find((e) => !(e in t));
	if (n) return n;
	let r = 2;
	for (; `${e[0]}-${r}` in t;) r++;
	return `${e[0]}-${r}`;
}
function Wa(e) {
	let t = e.toLowerCase().replace(/[^a-z0-9-]/g, "");
	return (/^[a-z]/.test(t) ? t : `b${t}`).slice(0, 40);
}
function Ga({ field: e, value: t, bound: n, paths: r, onValue: i, onBind: a, extra: o }) {
	let s = e.type === "richtext" && e.inline && e.handle !== "text" && !e.component ? {
		...e,
		component: "blocks-inline-text"
	} : e, c = !n && Me.includes(s.type) && !s.component, l = !n && aa(s), u = !n && s.type === "toggle", d = n ? {
		handle: s.handle,
		type: "text",
		component: "blocks-bind",
		label: s.label,
		paths: r
	} : {
		...s,
		if: void 0,
		size: "sm",
		width: "full",
		...s.type === "url" && !s.component ? { component: "link" } : {},
		...l && s.display === "segmented" ? { block: !0 } : {},
		...o
	}, f = { [s.handle]: n ?? t }, p = (e, t) => n ? a(t) : i(t), m = c ? /* @__PURE__ */ H(F, {
		bare: !0,
		fields: [d],
		values: f,
		onChange: p,
		className: "min-w-0"
	}) : /* @__PURE__ */ H(Z, {
		bare: !0,
		fields: [d],
		values: f,
		onChange: p,
		className: "min-w-0 flex-1"
	});
	if (u) return /* @__PURE__ */ H("div", {
		className: "flex min-h-7 items-center",
		children: m
	});
	let h = /* @__PURE__ */ H(B, {
		content: T(n ? "Disconnect from Data" : "Connect to Data"),
		children: /* @__PURE__ */ H(L, {
			icon: "database",
			size: "xs",
			label: T(n ? "Disconnect from Data" : "Connect to Data"),
			title: void 0,
			onClick: () => a(n ? null : r[0]?.path ?? "entry.title"),
			className: V("overflow-hidden", n ? "!text-ink" : "!w-0 !text-faint hover:!text-ink focus-visible:!w-6 group-hover/prop:!w-6 [@media(hover:none)]:!w-6")
		})
	}), g = /* @__PURE__ */ U("span", {
		className: V("flex min-h-7 min-w-0 shrink-0 items-center gap-0.5", !l && "w-[88px]"),
		children: [/* @__PURE__ */ H(B, {
			content: s.instructions,
			children: /* @__PURE__ */ H("label", {
				htmlFor: we(s),
				className: V("min-w-0 flex-1 py-0.5 text-xs leading-[1.25] [overflow-wrap:anywhere]", n ? "text-ink" : "text-muted"),
				children: s.label
			})
		}), h]
	});
	return l ? /* @__PURE__ */ U("div", {
		className: "group/prop pb-1",
		children: [g, m]
	}) : /* @__PURE__ */ U("div", {
		className: "group/prop flex min-h-7 items-center gap-2",
		children: [g, m]
	});
}
function Ka({ node: e }) {
	let { store: t, types: n } = G(), r = n.get(e.type), i = Ra(e), a = zn().filter((t) => t.id !== (e.anchor ?? e.props?.anchor)), o = e.bind ?? {}, s = {
		...Object.fromEntries((r?.fields ?? []).map((e) => [e.handle, e.default ?? null])),
		...r?.defaults ?? {},
		...e.props ?? {}
	}, c = (n, r) => {
		let i = { ...o };
		r ? i[n] = r : delete i[n], t.updateNode(e.id, { bind: Object.keys(i).length ? i : void 0 }, `bind:${e.id}:${n}`);
	}, l = (n, r) => t.updateProps(e.id, { [n]: r }, `inspector:${e.id}:${n}`), u = Object.fromEntries(Object.entries(o).filter(([e]) => e.startsWith("state:")).map(([e, t]) => [e.slice(6), t])), d = (r?.fields ?? []).filter((e) => !e.design && !(e.type === "json" && [
		"items",
		"rows",
		"values"
	].includes(e.handle))), f = d.some((e) => e.component === "link") && d.some((e) => e.handle === "new_tab"), p = d.filter((e) => !(f && e.handle === "new_tab") && Ba(e, s)), m = p.filter((e) => !e.advanced), h = p.filter((e) => e.advanced), g = (t) => /* @__PURE__ */ H(Ga, {
		field: t,
		value: e.props?.[t.handle],
		bound: o[t.handle],
		paths: i,
		onValue: (e) => l(t.handle, e),
		onBind: (e) => c(t.handle, e),
		extra: y(t)
	}, t.handle), _ = e.type === "repeat", y = (t) => t.component === "link" || t.type === "url" ? {
		anchors: a,
		...f ? {
			newTab: !!e.props?.new_tab,
			onNewTab: (e) => l("new_tab", e || void 0)
		} : {}
	} : void 0;
	return !r && e.type !== "component" ? /* @__PURE__ */ U(na, { children: [/* @__PURE__ */ H(he, {
		title: T("Its plugin is off"),
		children: T("This block is kept as it is and shows again when its plugin is turned on.")
	}), Object.keys(e.props ?? {}).length > 0 && /* @__PURE__ */ H("pre", {
		"aria-label": T("Settings"),
		className: "m-0 mt-3 overflow-x-auto rounded-md bg-sunken p-3 font-mono text-xs text-muted",
		children: JSON.stringify(e.props, null, 2)
	})] }) : /* @__PURE__ */ U("div", { children: [
		e.type === "component" ? /* @__PURE__ */ H(qa, {
			node: e,
			paths: i,
			setBind: c,
			anchors: a
		}) : _ ? /* @__PURE__ */ H(Ja, { node: e }) : m.length > 0 && /* @__PURE__ */ H(na, { children: m.map(g) }),
		/* @__PURE__ */ H(ta, {
			title: T("Visibility"),
			open: !!(o.visible || o.hidden || e.hidden),
			empty: !o.visible && !o.hidden && !e.hidden,
			children: /* @__PURE__ */ H(Z, {
				fields: [
					{
						handle: "shown",
						type: "toggle",
						size: "sm",
						label: T("Show on the Site")
					},
					{
						handle: "visible",
						type: "text",
						component: "blocks-bind",
						label: T("Only If"),
						paths: i,
						placeholder: T("Always"),
						status: o.visible ? "own" : void 0,
						reset: () => c("visible", null)
					},
					{
						handle: "hidden",
						type: "text",
						component: "blocks-bind",
						label: T("Hide If"),
						paths: i,
						placeholder: T("Never"),
						status: o.hidden ? "own" : void 0,
						reset: () => c("hidden", null)
					}
				],
				values: {
					shown: !e.hidden,
					visible: o.visible,
					hidden: o.hidden
				},
				onChange: (n, r) => n === "shown" ? t.updateNode(e.id, { hidden: !r || void 0 }) : c(n, r)
			})
		}),
		/* @__PURE__ */ U(ta, {
			title: T("Advanced"),
			open: !1,
			remember: !1,
			empty: !e.anchor && !e.attrs && !(e.type === "component" && e.class) && !e.persist && !Object.keys(o).some((e) => e.startsWith("state:")) && !h.some((t) => e.props?.[t.handle] !== void 0 && e.props?.[t.handle] !== t.default),
			children: [
				_ ? /* @__PURE__ */ H(Ya, { node: e }) : h.map(g),
				/* @__PURE__ */ H(Z, {
					fields: [
						{
							handle: "label",
							type: "text",
							size: "sm",
							commit: "blur",
							label: T("Layer Name"),
							placeholder: r?.title
						},
						...h.some((e) => e.handle === "anchor") && !e.anchor ? [] : [{
							handle: "anchor",
							type: "text",
							size: "sm",
							commit: "blur",
							label: T("Anchor"),
							placeholder: T("None"),
							mono: !0
						}],
						...e.type === "component" ? [{
							handle: "class",
							type: "text",
							size: "sm",
							commit: "blur",
							label: T("Classes"),
							mono: !0
						}] : [],
						...v("site.code") ? [{
							handle: "persist",
							type: "toggle",
							size: "sm",
							label: T("Keep Across Pages")
						}] : []
					],
					values: {
						label: e.label,
						anchor: e.anchor,
						class: e.class,
						persist: !!e.persist
					},
					onChange: (n, r) => {
						if (n === "persist") return t.updateNode(e.id, { persist: r ? e.persist ?? Wa(e.id) : void 0 });
						let i = String(r ?? "");
						t.updateNode(e.id, { [n]: (n === "anchor" ? i.toLowerCase().replace(/[^a-z0-9-]/g, "") : i) || void 0 });
					}
				}),
				/* @__PURE__ */ H(ra, {
					title: T("Attributes"),
					action: /* @__PURE__ */ H(ua, {
						label: T("Add Attribute"),
						onClick: () => t.updateNode(e.id, { attrs: {
							...e.attrs ?? {},
							[Ua(Va, e.attrs ?? {})]: ""
						} })
					})
				}),
				e.attrs && Object.keys(e.attrs).length > 0 && /* @__PURE__ */ H(Z, {
					bare: !0,
					fields: [{
						handle: "attrs",
						type: "json",
						component: "blocks-pairs",
						className: "items-start",
						label: T("Attributes"),
						key: { lower: !0 },
						item: {
							handle: "value",
							type: "text",
							size: "sm",
							commit: "blur",
							label: T("Value")
						},
						items: Object.fromEntries(Object.keys(e.attrs ?? {}).filter((e) => o[`attr:${e}`]).map((e) => [e, {
							handle: "bind",
							type: "text",
							component: "blocks-bind",
							label: T("Data"),
							paths: i
						}]))
					}],
					values: { attrs: Object.fromEntries(Object.entries(e.attrs ?? {}).map(([e, t]) => [e, o[`attr:${e}`] ?? t])) },
					onChange: (n, r) => {
						let i = e.attrs ?? {}, a = Fa(Object.fromEntries(Object.entries(i).map(([e, t]) => [e, o[`attr:${e}`] ?? t])), r);
						if (a?.op === "rename") t.updateNode(e.id, { attrs: Object.fromEntries(Object.entries(i).map(([e, t]) => e === a.from ? [a.to, t] : [e, t])) });
						else if (a?.op === "set" && o[`attr:${a.key}`]) c(`attr:${a.key}`, a.value ?? null);
						else if (a?.op === "set") t.updateNode(e.id, { attrs: {
							...i,
							[a.key]: a.value ?? ""
						} });
						else if (a?.op === "remove") {
							let n = { ...i };
							delete n[a.key], t.updateNode(e.id, { attrs: Object.keys(n).length ? n : void 0 }), c(`attr:${a.key}`, null);
						}
					}
				}),
				/* @__PURE__ */ H(ra, {
					title: T("States from Data"),
					action: /* @__PURE__ */ H(ua, {
						label: T("Add State from Data"),
						onClick: () => c(`state:${Ua(Ha, u)}`, i[0]?.path ?? "item.active")
					})
				}),
				Object.keys(u).length > 0 && /* @__PURE__ */ H(Z, {
					bare: !0,
					fields: [{
						handle: "states",
						type: "json",
						component: "blocks-pairs",
						className: "items-start",
						label: T("States from Data"),
						key: {
							prefix: "data-",
							lower: !0,
							strip: "[^a-z0-9-]",
							className: "!w-[34%] !flex-none"
						},
						item: {
							handle: "path",
							type: "text",
							component: "blocks-bind",
							label: T("Data"),
							paths: i
						}
					}],
					values: { states: u },
					onChange: (n, r) => {
						let i = Object.fromEntries(Object.entries(o).filter(([e]) => !e.startsWith("state:"))), a = Object.fromEntries(Object.entries(r).filter(([, e]) => e).map(([e, t]) => [`state:${e}`, t])), s = {
							...i,
							...a
						};
						t.updateNode(e.id, { bind: Object.keys(s).length ? s : void 0 }, `bind:${e.id}:states`);
					}
				})
			]
		})
	] });
}
function qa({ node: e, paths: t, setBind: n, anchors: i }) {
	let { store: o } = G(), s = E("components/list", { working: !0 }, { staleTime: 3e4 }), c = s.data?.find((t) => t.handle === e.props?.ref), l = e.props?.values ?? {}, d = e.bind ?? {};
	return /* @__PURE__ */ U(na, { children: [
		/* @__PURE__ */ H(Z, {
			fields: [{
				handle: "ref",
				type: "select",
				size: "sm",
				label: T("Component"),
				required: !0,
				options: (s.data ?? []).map((e) => ({
					value: e.handle,
					label: e.title
				}))
			}],
			values: { ref: e.props?.ref },
			onChange: (t, n) => n && o.updateProps(e.id, {
				ref: n,
				values: {}
			})
		}),
		(c?.props ?? []).map((r) => /* @__PURE__ */ H(Ga, {
			field: {
				...r,
				placeholder: r.placeholder ?? (za.includes(r.type) ? r.label : void 0)
			},
			value: l[r.handle] ?? r.default,
			bound: d[`values.${r.handle}`],
			paths: t,
			onValue: (t) => o.updateProps(e.id, { values: {
				...l,
				[r.handle]: t
			} }, `values:${e.id}:${r.handle}`),
			onBind: (e) => n(`values.${r.handle}`, e),
			extra: r.type === "url" ? {
				component: "link",
				reference: !0,
				anchors: i
			} : void 0
		}, r.handle)),
		/* @__PURE__ */ U("div", {
			className: "-ml-2 flex gap-1 pt-1",
			children: [c?.id && /* @__PURE__ */ H(P, {
				size: "sm",
				variant: "ghost",
				icon: "edit",
				onClick: () => x(`/content/components/${c.id}`),
				children: T("Edit Component")
			}), /* @__PURE__ */ H(P, {
				size: "sm",
				variant: "ghost",
				icon: "scissors",
				onClick: () => {
					if (!c) return;
					let t = r(o.get().nodes, e.id);
					if (!t) return;
					let n = c.blocks.map((e) => u(e));
					o.commit(m(a(o.get().nodes, e.id), t.parentId, t.index, n)), o.select(n[0]?.id ?? null);
				},
				disabled: !c,
				children: T("Detach")
			})]
		})
	] });
}
function Ja({ node: e }) {
	let { store: t, catalog: n } = G(), r = n.sources?.find((t) => t.name === e.props?.source), i = (n, r) => t.updateProps(e.id, { [n]: r }, `repeat:${e.id}:${n}`);
	return /* @__PURE__ */ U(na, { children: [
		/* @__PURE__ */ H(Z, {
			fields: [{
				handle: "source",
				type: "select",
				size: "sm",
				label: T("List"),
				required: !0,
				options: (n.sources ?? []).map((e) => ({
					value: e.name,
					label: e.label
				}))
			}],
			values: { source: e.props?.source },
			onChange: (e, t) => t && i("source", t)
		}),
		/* @__PURE__ */ H(Z, {
			fields: (r?.fields ?? []).map((e) => ({
				...e,
				size: "sm",
				width: "full"
			})),
			values: Object.fromEntries((r?.fields ?? []).map((t) => [t.handle, e.props?.[t.handle]])),
			onChange: (e, t) => i(e, t)
		}),
		/* @__PURE__ */ H(Z, {
			fields: [{
				handle: "empty",
				type: "text",
				size: "sm",
				commit: "blur",
				label: T("When Empty"),
				placeholder: T("Show Nothing")
			}],
			values: { empty: e.props?.empty },
			onChange: (e, t) => i(e, t || void 0)
		})
	] });
}
function Ya({ node: e }) {
	let { store: t } = G(), n = (n, r) => t.updateProps(e.id, { [n]: r }, `repeat:${e.id}:${n}`);
	return /* @__PURE__ */ H(Z, {
		fields: [{
			handle: "tag",
			type: "select",
			size: "sm",
			label: T("HTML Tag"),
			required: !0,
			options: [
				"div",
				"ul",
				"ol",
				"section",
				"nav"
			]
		}, {
			handle: "as",
			type: "text",
			size: "sm",
			commit: "blur",
			label: T("Item Name"),
			placeholder: "item",
			mono: !0
		}],
		values: {
			tag: e.props?.tag ?? "div",
			as: e.props?.as
		},
		onChange: (e, t) => n(e, e === "tag" ? t ?? "div" : String(t ?? "").replace(/[^a-z_]/gi, "") || void 0)
	});
}
// admin/src/builder/useStyle.ts
function Xa(e) {
	let { store: t } = G(), { engine: n, breakpoints: r } = mn(), i = K(t, (e) => e.device), a = K(t, (e) => e.canvasWidth), o = K(t, (e) => e.state), s = A(() => cn(i, a, r), [
		i,
		a,
		r
	]);
	return A(() => ft(n, qe(e.class), s, o, (n, r) => t.updateNode(e.id, { class: n.join(" ") || void 0 }, `style:${e.id}:${r ?? ""}`)), [
		n,
		e.class,
		e.id,
		s,
		o,
		t
	]);
}
// admin/src/builder/css.ts
function Za(e) {
	let t = [], n = 0, r = "";
	for (let i of e.trim()) i === "(" && n++, i === ")" && n--, /\s/.test(i) && n === 0 ? (r && t.push(r), r = "") : r += i;
	return r && t.push(r), t;
}
function Qa(e) {
	let t = [], n = 0, r = "";
	for (let i of e) i === "(" && n++, i === ")" && n--, i === "," && n === 0 ? (t.push(r.trim()), r = "") : r += i;
	return r.trim() && t.push(r.trim()), t;
}
function $a(e) {
	if (e === void 0 || e === "") return null;
	let t = Za(String(e));
	return t.length === 1 ? [
		t[0],
		t[0],
		t[0],
		t[0]
	] : t.length === 2 ? [
		t[0],
		t[1],
		t[0],
		t[1]
	] : t.length === 3 ? [
		t[0],
		t[1],
		t[2],
		t[1]
	] : [
		t[0],
		t[1],
		t[2],
		t[3]
	];
}
// admin/src/builder/design/StyleFields.tsx
function eo(e, t) {
	let n = t.map((t) => e.status(t));
	return n.includes("own") ? "own" : n.includes("inherited") ? "inherited" : void 0;
}
function Q({ s: e, fields: t, bare: n }) {
	let r = t.filter(Boolean), i = {}, a = r.map(({ get: t, set: n, keys: r, markers: a, ...o }) => {
		let s = o.fields, c = a ?? r ?? (s ? s.map((e) => e.handle) : [o.handle]);
		return i[o.handle] = t ? t() : s ? Object.fromEntries(c.map((t) => [t, e.value(t)])) : e.value(o.handle), {
			status: eo(e, c),
			reset: () => a ? e.swap(a, null) : e.write(Object.fromEntries(c.map((e) => [e, null]))),
			...o
		};
	});
	return /* @__PURE__ */ H(Z, {
		bare: n,
		fields: a,
		values: i,
		onChange: (t, n) => {
			let a = r.find((e) => e.handle === t);
			if (a.set) return a.set(n);
			if (!n || typeof n != "object") return e.set(t, n);
			let o = no(i[t] ?? {}, n);
			Object.keys(o).length && e.write(o);
		},
		disabled: !e.engine
	});
}
var to = (e) => e === "none" ? void 0 : e;
function no(e, t) {
	return Object.fromEntries(Object.entries(t ?? {}).filter(([t, n]) => n !== e[t]));
}
// admin/src/builder/design/more.tsx
var $ = (e, t, n = t[0]) => ({
	label: e,
	type: "select",
	size: "sm",
	placeholder: n,
	options: t.map((e) => ({
		value: e,
		label: e
	}))
}), ro = (e, t = {}) => ({
	label: e,
	type: "text",
	component: "blocks-value",
	unit: "px",
	units: [
		"px",
		"rem",
		"em",
		"%"
	],
	placeholder: "0",
	...t
}), io = (e, t = {}) => ({
	label: e,
	type: "text",
	component: "blocks-value",
	unit: "",
	placeholder: "0",
	...t
}), ao = (e) => ({
	label: e,
	type: "color",
	component: "blocks-color",
	placeholder: T("None")
}), oo = (e, t = "") => ({
	label: e,
	type: "text",
	size: "sm",
	commit: "blur",
	mono: !0,
	placeholder: t
}), so = [
	"normal",
	"multiply",
	"screen",
	"overlay",
	"darken",
	"lighten",
	"color-dodge",
	"color-burn",
	"difference",
	"exclusion",
	"hue",
	"saturation",
	"color",
	"luminosity"
];
function co() {
	let e = (e, t) => Object.fromEntries(Object.entries(t).map(([t, n]) => [t, {
		group: e,
		field: n
	}]));
	return {
		...e("layout", {
			alignContent: $(T("Align Content"), [
				"normal",
				"start",
				"center",
				"end",
				"space-between",
				"space-around",
				"space-evenly",
				"stretch"
			]),
			placeItems: oo(T("Place Items"), "center"),
			placeContent: oo(T("Place Content"), "center"),
			gridTemplateAreas: oo(T("Grid Areas"), "'a b' 'c c'"),
			gridAutoColumns: oo(T("Auto Columns"), "auto"),
			gridAutoRows: oo(T("Auto Rows"), "auto"),
			columns: io(T("Columns"), {
				placeholder: T("Auto"),
				min: 1
			}),
			columnRule: oo(T("Column Rule"), "1px solid"),
			boxSizing: $(T("Box Sizing"), ["border-box", "content-box"]),
			float: $(T("Float||CSS property"), [
				"none",
				"left",
				"right"
			]),
			clear: $(T("Clear||CSS property"), [
				"none",
				"left",
				"right",
				"both"
			]),
			containerType: $(T("Container Type"), [
				"normal",
				"inline-size",
				"size"
			])
		}),
		...e("item", {
			justifySelf: $(T("Justify Self"), [
				"auto",
				"start",
				"center",
				"end",
				"stretch"
			]),
			placeSelf: oo(T("Place Self"), "center"),
			gridArea: oo(T("Grid Area"), "a"),
			flexGrow: io(T("Flex Grow"), { min: 0 }),
			flexShrink: io(T("Flex Shrink"), {
				placeholder: "1",
				min: 0
			}),
			flexBasis: ro(T("Flex Basis"), { placeholder: T("Auto") })
		}),
		...e("position", { inset: ro(T("Inset"), { placeholder: T("Auto") }) }),
		...e("size", {
			overflowX: $(T("Overflow X"), [
				"visible",
				"hidden",
				"clip",
				"scroll",
				"auto"
			]),
			overflowY: $(T("Overflow Y"), [
				"visible",
				"hidden",
				"clip",
				"scroll",
				"auto"
			]),
			overscrollBehavior: $(T("Overscroll"), [
				"auto",
				"contain",
				"none"
			]),
			scrollSnapType: $(T("Snap Type"), [
				"none",
				"x mandatory",
				"x proximity",
				"y mandatory",
				"y proximity",
				"both mandatory"
			]),
			scrollSnapAlign: $(T("Snap Align"), [
				"none",
				"start",
				"center",
				"end"
			]),
			scrollMarginTop: ro(T("Scroll Margin")),
			scrollPadding: ro(T("Scroll Padding")),
			scrollbarWidth: $(T("Scrollbar"), [
				"auto",
				"thin",
				"none"
			])
		}),
		...e("typography", {
			textDecorationColor: ao(T("Decoration Color")),
			textDecorationThickness: ro(T("Line Thickness"), { placeholder: T("Auto") }),
			textUnderlineOffset: ro(T("Underline Offset"), {
				unit: "em",
				units: ["em", "px"],
				step: .05,
				placeholder: T("Auto")
			}),
			whiteSpace: $(T("White Space"), [
				"normal",
				"nowrap",
				"pre",
				"pre-wrap",
				"pre-line",
				"break-spaces"
			]),
			wordBreak: $(T("Word Break"), [
				"normal",
				"break-all",
				"keep-all",
				"break-word"
			]),
			overflowWrap: $(T("Overflow Wrap"), [
				"normal",
				"anywhere",
				"break-word"
			]),
			hyphens: $(T("Hyphens"), [
				"manual",
				"auto",
				"none"
			]),
			textIndent: ro(T("Indent"), {
				unit: "em",
				units: [
					"em",
					"px",
					"rem"
				]
			}),
			textOverflow: $(T("Text Overflow"), ["clip", "ellipsis"]),
			fontVariantNumeric: $(T("Numbers"), [
				"normal",
				"tabular-nums",
				"proportional-nums",
				"lining-nums",
				"oldstyle-nums",
				"slashed-zero"
			]),
			fontFeatureSettings: oo(T("Font Features"), "'ss01'"),
			fontVariationSettings: oo(T("Font Variations"), "'wght' 500"),
			listStyleType: $(T("List Style"), [
				"none",
				"disc",
				"circle",
				"square",
				"decimal",
				"decimal-leading-zero",
				"lower-alpha",
				"upper-alpha",
				"lower-roman",
				"upper-roman"
			]),
			verticalAlign: $(T("Vertical Align"), [
				"baseline",
				"top",
				"middle",
				"bottom",
				"text-top",
				"text-bottom",
				"sub",
				"super"
			])
		}),
		...e("fill", {
			background: oo(T("Background"), "none"),
			backgroundBlendMode: $(T("Blend Mode"), so)
		}),
		...e("effects", {
			userSelect: $(T("User Select"), [
				"auto",
				"none",
				"text",
				"all"
			]),
			visibility: $(T("Visibility"), [
				"visible",
				"hidden",
				"collapse"
			]),
			maskImage: oo(T("Mask Image"), "linear-gradient(black, transparent)"),
			accentColor: ao(T("Accent Color")),
			fill: ao(T("Fill")),
			stroke: ao(T("Stroke")),
			strokeWidth: ro(T("Stroke Width")),
			content: oo(T("Content"), "''")
		}),
		...e("transform", {
			perspectiveOrigin: oo(T("Vanishing Point"), "center"),
			transformStyle: $(T("Transform Style"), ["flat", "preserve-3d"]),
			backfaceVisibility: $(T("Backface"), ["visible", "hidden"])
		}),
		...e("transition", { willChange: oo(T("Will Change"), "auto") })
	};
}
function lo(e, t = co()) {
	let n = e.replace(/([A-Z])/g, " $1");
	return {
		handle: e,
		type: "text",
		size: "sm",
		commit: "blur",
		mono: !0,
		label: n.charAt(0).toUpperCase() + n.slice(1),
		...t[e]?.field
	};
}
var uo = (e) => /^--[\w-]+$/.test(e) || /^-?[a-z]+(-[a-z]+)*$/.test(e) && typeof CSS < "u" && CSS.supports(e, "inherit");
function fo({ properties: e, labels: t = {}, onPick: n, label: r = T("Add a Property"), custom: i, children: a }) {
	let [o, s] = M(!1), [c, l] = M(""), [u, d] = M(0), f = j(null);
	k(() => De(f.current, f.current?.querySelector("[data-active]")), [u]);
	let p = co(), m = c.trim().toLowerCase(), h = e.map((e) => ({
		property: e,
		label: t[e] ?? String(lo(e, p).label)
	})).filter((e) => !m || e.label.toLowerCase().includes(m) || e.property.toLowerCase().includes(m.replace(/[\s-]/g, ""))), g = m.replace(/\s+/g, "-"), _ = i && uo(g) && !h.some((e) => e.property.toLowerCase() === g.replace(/-/g, "")) ? [...h, {
		property: g,
		label: g
	}] : h, v = (e) => {
		e && (s(!1), n(e));
	};
	return e.length === 0 && !i ? null : /* @__PURE__ */ U(R, {
		open: o,
		onOpenChange: (e) => {
			s(e), l(""), d(0);
		},
		align: "end",
		className: "flex w-60 flex-col overflow-hidden !p-0",
		trigger: a ?? /* @__PURE__ */ H(L, {
			icon: "plus",
			size: "xs",
			label: r
		}),
		children: [/* @__PURE__ */ U("div", {
			className: "flex h-9 shrink-0 items-center gap-2 border-b border-border px-3",
			children: [/* @__PURE__ */ H(I, {
				name: "search",
				size: 14,
				className: "shrink-0 text-faint"
			}), /* @__PURE__ */ H("input", {
				autoFocus: !0,
				value: c,
				onChange: (e) => {
					l(e.target.value), d(0);
				},
				onKeyDown: (e) => {
					(e.key === "ArrowDown" || e.key === "ArrowUp") && (e.preventDefault(), d((t) => Math.max(0, Math.min(_.length - 1, t + (e.key === "ArrowDown" ? 1 : -1))))), e.key === "Enter" && (e.preventDefault(), v(_[u]?.property));
				},
				placeholder: T("Search"),
				"aria-label": T("Search"),
				className: "h-full min-w-0 flex-1 bg-transparent text-sm text-text outline-none"
			})]
		}), /* @__PURE__ */ U("div", {
			ref: f,
			role: "listbox",
			"aria-label": r,
			className: "max-h-64 overflow-y-auto overscroll-contain p-1",
			children: [_.length === 0 && /* @__PURE__ */ H("p", {
				className: "m-0 px-2 py-3 text-sm text-muted",
				children: T("No matches")
			}), _.map((e, t) => /* @__PURE__ */ H(P, {
				variant: "ghost",
				role: "option",
				"aria-selected": t === u,
				tabIndex: -1,
				onMouseEnter: () => d(t),
				onClick: () => v(e.property),
				"data-active": t === u || void 0,
				className: "w-full !justify-start !rounded-xs !px-2 text-left !font-normal",
				children: e.label
			}, e.property))]
		})]
	});
}
var po = (e, t = co()) => [...e].sort((e, n) => String(lo(e, t).label).localeCompare(String(lo(n, t).label))), mo = {
	layout: /^(display|flex(?!$)|flexDirection|flexWrap|grid(?!Column|Row|Area)|gap|rowGap|columnGap|justify(?!Self)|align(?!Self)|place(?!Self))/,
	item: /^(alignSelf|justifySelf|placeSelf|flex$|flexGrow|flexShrink|flexBasis|gridColumn|gridRow|gridArea|order)/,
	position: /^(position|top|right|bottom|left|inset|zIndex|isolation)/,
	size: /^(width|height|minWidth|maxWidth|minHeight|maxHeight|aspectRatio|overflow)/,
	spacing: /^(margin|padding|--tw-space)/,
	typography: /^(font|letterSpacing|lineHeight|color$|text|whiteSpace|wordBreak|overflowWrap|hyphens|--tw-(font|leading|tracking))/,
	fill: /^(background|--tw-gradient)/,
	border: /^(border|outline|--tw-ring|--tw-inset-ring|--tw-border)/,
	effects: /^(opacity|boxShadow|--tw-shadow|--tw-inset-shadow|mixBlendMode|cursor|pointerEvents|clipPath|filter|backdropFilter|--tw-(blur|brightness|contrast|grayscale|hue|invert|saturate|sepia|drop-shadow|backdrop))/,
	transform: /^(translate|scale|rotate|skew|transform|perspective|--tw-(translate|scale|rotate|skew))/,
	transition: /^(transition|animation|--tw-(duration|ease))/
}, ho = (e, t) => e.own().some((e) => mo[t]?.test(e));
function go({ s: e, group: t, title: n, open: r, empty: i, children: a }) {
	let [o, s] = M(null), c = co(), l = Object.keys(c).filter((e) => c[e].group === t), u = l.filter((t) => e.value(t) !== void 0 || t === o);
	return /* @__PURE__ */ U(ta, {
		title: n,
		open: r,
		empty: i && u.length === 0,
		own: ho(e, t),
		fields: !0,
		actions: /* @__PURE__ */ H(fo, {
			properties: po(l.filter((e) => !u.includes(e)), c),
			onPick: s
		}),
		children: [a, u.length > 0 && /* @__PURE__ */ H(Q, {
			s: e,
			fields: u.map((t) => ({
				...lo(t, c),
				set: (n) => {
					t === o && s(null), e.set(t, n);
				}
			}))
		})]
	});
}
var _o = (e) => e.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`);
function vo({ s: e }) {
	let [t, n] = M(null), r = co(), i = /* @__PURE__ */ new Set([
		...Object.keys(r).map(_o),
		"clip-path",
		"-webkit-text-stroke"
	]), a = [...new Set(e.classes.flatMap((e) => q(e).utility.match(/^!?\[([\w-]+):/)?.[1] ?? []))].filter((t) => !i.has(t) && e.value(t) !== void 0), o = t && !a.includes(t) ? [...a, t] : a;
	return /* @__PURE__ */ H(ta, {
		title: T("Other Properties"),
		open: o.length > 0,
		empty: o.length === 0,
		actions: /* @__PURE__ */ H(fo, {
			properties: [],
			custom: !0,
			onPick: n
		}),
		children: /* @__PURE__ */ H(Q, {
			s: e,
			fields: o.map((r) => ({
				handle: r,
				type: "text",
				size: "sm",
				commit: "blur",
				mono: !0,
				label: r,
				set: (i) => {
					r === t && n(null), e.set(r, i);
				}
			}))
		})
	});
}
// admin/src/builder/design/Border.tsx
var yo = [
	"borderTopLeftRadius",
	"borderTopRightRadius",
	"borderBottomRightRadius",
	"borderBottomLeftRadius"
], bo = {
	all: {
		root: "border",
		width: "border-width",
		color: "border-color"
	},
	top: {
		root: "border-t",
		width: "border-top-width",
		color: "border-top-color"
	},
	right: {
		root: "border-r",
		width: "border-right-width",
		color: "border-right-color"
	},
	bottom: {
		root: "border-b",
		width: "border-bottom-width",
		color: "border-bottom-color"
	},
	left: {
		root: "border-l",
		width: "border-left-width",
		color: "border-left-color"
	}
}, xo = "--tw-border-style", So = "--tw-outline-style", Co = "--tw-ring-shadow", wo = () => [
	{
		value: "solid",
		label: T("Solid")
	},
	{
		value: "dashed",
		label: T("Dashed")
	},
	{
		value: "dotted",
		label: T("Dotted")
	},
	{
		value: "double",
		label: T("Double")
	},
	{
		value: "none",
		label: T("None")
	}
], To = (e) => e?.match(/0 0 0 calc\(([\d.]+px) \+/)?.[1];
function Eo({ s: e }) {
	let t = Object.keys(bo), [n, r] = M(() => t.find((t) => t !== "all" && e.value(bo[t].width)) ?? "all"), i = bo[n], a = {
		width: e.value(i.width),
		style: e.value(xo),
		color: e.value(i.color)
	}, o = yo.map((t) => e.value(t)), s = (t) => e.value(yo[t]) ?? $a(e.value("borderRadius"))?.[t], c = {
		width: e.value("outlineWidth"),
		style: e.value(So),
		color: e.value("outlineColor")
	}, l = {
		width: To(e.value(Co)),
		color: e.value("--tw-ring-color")
	}, u = t.some((t) => e.value(bo[t].width) || e.value(bo[t].color)) || a.style || e.value("borderRadius") || o.some(Boolean) || c.width || c.style || l.width, d = (t) => eo(e, [bo[t].width, bo[t].color]), f = (t, n, r) => n && e.engine ? mt(e.engine, t, n, r) : null, p = (e, t, n) => ({
		value: e,
		icon: t,
		title: d(e) ? `${n} · ${d(e) === "own" ? T("set") : T("inherited")}` : n
	});
	return /* @__PURE__ */ U(ta, {
		title: T("Border"),
		empty: !u,
		own: ho(e, "border"),
		children: [/* @__PURE__ */ H(Q, {
			s: e,
			fields: [
				{
					handle: "edge",
					type: "select",
					display: "segmented",
					block: !0,
					required: !0,
					size: "sm",
					label: T("Sides"),
					keys: [],
					get: () => n,
					set: (e) => e && r(e),
					options: [
						p("all", "b-side-all", T("All Sides")),
						p("top", "b-side-top", T("Top")),
						p("right", "b-side-right", T("Right")),
						p("bottom", "b-side-bottom", T("Bottom")),
						p("left", "b-side-left", T("Left"))
					]
				},
				{
					handle: "line",
					type: "group",
					component: "blocks-group",
					label: T("Width"),
					markers: [i.width, xo],
					get: () => ({
						width: a.width,
						style: a.style
					}),
					set: (t) => {
						let n = no({
							width: a.width,
							style: a.style
						}, t);
						"width" in n ? e.swap(i.width, f(i.root, n.width, "px")) : "style" in n && e.swap(xo, n.style ? `border-${n.style}` : null);
					},
					fields: [{
						handle: "width",
						type: "text",
						component: "blocks-value",
						label: T("Width"),
						placeholder: "0",
						min: 0,
						prefixIcon: "square"
					}, {
						handle: "style",
						type: "select",
						size: "sm",
						label: T("Style"),
						options: wo(),
						placeholder: T("Solid")
					}]
				},
				{
					handle: "lineColor",
					type: "color",
					component: "blocks-color",
					label: T("Color"),
					placeholder: T("Text Color"),
					markers: [i.color],
					get: () => a.color,
					set: (t) => e.swap(i.color, f(i.root, t, "number"))
				},
				{
					handle: "radius",
					type: "group",
					component: "blocks-group",
					label: T("Radius"),
					status: e.status("borderRadius") === "own" || yo.some((t) => e.status(t) === "own") ? "own" : to(e.status("borderRadius")),
					keys: ["borderRadius", ...yo],
					columns: 2,
					split: o.some(Boolean),
					splitLabel: T("Each Corner"),
					joinLabel: T("Same radius for every corner"),
					link: {
						handle: "borderRadius",
						type: "text",
						component: "blocks-value",
						label: T("Radius"),
						group: "radius",
						prefixIcon: "frame",
						placeholder: "0",
						min: 0
					},
					fields: yo.map((e, t) => ({
						handle: e,
						type: "text",
						component: "blocks-value",
						label: [
							T("Top Left"),
							T("Top Right"),
							T("Bottom Right"),
							T("Bottom Left")
						][t],
						title: [
							T("Top Left"),
							T("Top Right"),
							T("Bottom Right"),
							T("Bottom Left")
						][t],
						group: "radius",
						prefix: [
							"◜",
							"◝",
							"◞",
							"◟"
						][t],
						placeholder: "0",
						min: 0
					})),
					get: () => ({
						borderRadius: e.value("borderRadius"),
						...Object.fromEntries(yo.map((e, t) => [e, s(t)]))
					}),
					set: (t) => {
						if (t.borderRadius !== e.value("borderRadius")) return e.set("borderRadius", t.borderRadius);
						e.write({
							borderRadius: null,
							...Object.fromEntries(yo.map((e) => [e, t[e] ?? null]))
						});
					}
				}
			]
		}), /* @__PURE__ */ H("div", {
			className: "!mt-3 border-t border-border pt-2",
			children: /* @__PURE__ */ H(Q, {
				s: e,
				fields: [
					{
						handle: "outlineLine",
						type: "group",
						component: "blocks-group",
						label: T("Outline"),
						markers: ["outline-width", So],
						get: () => ({
							width: c.width,
							style: c.style
						}),
						set: (t) => {
							let n = no({
								width: c.width,
								style: c.style
							}, t);
							"width" in n ? e.swap("outline-width", f("outline", n.width, "px")) : "style" in n && e.swap(So, n.style ? n.style === "solid" ? "outline-solid" : `outline-${n.style}` : null);
						},
						fields: [{
							handle: "width",
							type: "text",
							component: "blocks-value",
							label: T("Width"),
							placeholder: "0",
							min: 0,
							prefixIcon: "selection"
						}, {
							handle: "style",
							type: "select",
							size: "sm",
							label: T("Style"),
							options: wo(),
							placeholder: T("Solid")
						}]
					},
					c.width || c.style ? {
						handle: "outlineColor",
						type: "color",
						component: "blocks-color",
						label: T("Outline Color"),
						placeholder: T("Text Color"),
						markers: ["outline-color"],
						get: () => c.color,
						set: (t) => e.swap("outline-color", f("outline", t, "number"))
					} : null,
					c.width || c.style || e.value("outlineOffset") ? {
						handle: "outlineOffset",
						type: "text",
						component: "blocks-value",
						label: T("Offset"),
						placeholder: "0",
						prefixIcon: "arrows-out-simple",
						markers: ["outline-offset"],
						get: () => e.value("outlineOffset"),
						set: (t) => e.swap("outline-offset", f("outline-offset", t, "px"))
					} : null,
					{
						handle: "ringWidth",
						type: "text",
						component: "blocks-value",
						label: T("Ring"),
						placeholder: "0",
						min: 0,
						prefixIcon: "circle",
						markers: [Co],
						get: () => l.width,
						set: (t) => e.swap(Co, f("ring", t, "px"))
					},
					l.width ? {
						handle: "ringColor",
						type: "color",
						component: "blocks-color",
						label: T("Ring Color"),
						placeholder: T("Text Color"),
						markers: ["--tw-ring-color"],
						get: () => l.color,
						set: (t) => e.swap("--tw-ring-color", f("ring", t, "number"))
					} : null
				]
			})
		})]
	});
}
// admin/src/builder/fields/filters.tsx
var Do = [
	{
		name: "blur",
		label: () => T("Blur"),
		unit: "px",
		initial: "8px",
		step: 1,
		min: 0,
		icon: "shadow"
	},
	{
		name: "brightness",
		label: () => T("Brightness"),
		unit: "%",
		initial: "100%",
		step: 5,
		min: 0,
		icon: "sun"
	},
	{
		name: "contrast",
		label: () => T("Contrast"),
		unit: "%",
		initial: "100%",
		step: 5,
		min: 0,
		icon: "opacity"
	},
	{
		name: "saturate",
		label: () => T("Saturation"),
		unit: "%",
		initial: "100%",
		step: 5,
		min: 0,
		icon: "drop-half"
	},
	{
		name: "grayscale",
		label: () => T("Grayscale"),
		unit: "%",
		initial: "100%",
		step: 5,
		min: 0,
		max: 100,
		icon: "opacity"
	},
	{
		name: "hue-rotate",
		label: () => T("Hue"),
		unit: "deg",
		initial: "90deg",
		step: 1,
		icon: "refresh"
	},
	{
		name: "invert",
		label: () => T("Invert"),
		unit: "%",
		initial: "100%",
		step: 5,
		min: 0,
		max: 100,
		icon: "opacity"
	},
	{
		name: "sepia",
		label: () => T("Sepia"),
		unit: "%",
		initial: "100%",
		step: 5,
		min: 0,
		max: 100,
		icon: "theme"
	}
];
function Oo(e) {
	return !e || e === "none" ? [] : Za(e).map((e) => {
		let t = e.match(/^([a-z-]+)\((.*)\)$/);
		return t ? {
			name: t[1],
			value: t[2]
		} : {
			name: e,
			value: ""
		};
	});
}
var ko = (e) => e.length ? e.map((e) => Do.some((t) => t.name === e.name) || e.value ? `${e.name}(${e.value})` : e.name).join(" ") : null;
function Ao({ field: e, value: t, onChange: n, context: r, disabled: i }) {
	let a = Oo(t), o = Do.filter((e) => !a.some((t) => t.name === e.name)), s = (e) => n(ko(e));
	return /* @__PURE__ */ U("div", {
		className: "min-w-0 flex-1",
		children: [/* @__PURE__ */ U("div", {
			className: "flex h-7 items-center gap-2",
			children: [
				/* @__PURE__ */ H(ia, {
					field: e,
					className: a.length ? "!w-auto" : void 0
				}),
				/* @__PURE__ */ H("span", { className: "min-w-0 flex-1" }),
				o.length > 0 && /* @__PURE__ */ H(de, {
					align: "end",
					trigger: /* @__PURE__ */ H(B, {
						content: T("Add a Filter"),
						children: /* @__PURE__ */ H(z, {
							compact: !0,
							disabled: i,
							className: "grid size-6 shrink-0 place-items-center rounded-sm text-muted hover:bg-hover hover:text-ink",
							"aria-label": T("Add a Filter"),
							children: /* @__PURE__ */ H(I, {
								name: "plus",
								size: 14
							})
						})
					}),
					items: o.map((e) => ({
						label: e.label(),
						icon: e.icon,
						onSelect: () => s([...a, {
							name: e.name,
							value: e.initial
						}])
					}))
				})
			]
		}), a.length > 0 && /* @__PURE__ */ H("div", {
			className: "mt-1 space-y-1",
			children: a.map((t, n) => {
				let o = Do.find((e) => e.name === t.name), c = o ? {
					handle: `${e.handle}-${t.name}`,
					type: "text",
					component: "blocks-value",
					label: o.label(),
					unit: o.unit,
					step: o.step,
					min: o.min,
					max: o.max,
					placeholder: o.initial
				} : {
					handle: `${e.handle}-${t.name}`,
					type: "text",
					component: "blocks-value",
					label: t.name,
					unit: ""
				};
				return /* @__PURE__ */ U("div", {
					className: "flex h-7 items-center gap-2",
					children: [
						/* @__PURE__ */ U("span", {
							className: "flex w-[88px] shrink-0 items-center gap-1.5 truncate pl-2 text-xs text-muted",
							children: [/* @__PURE__ */ H(I, {
								name: o?.icon ?? "faders",
								size: 13,
								className: "shrink-0 text-faint"
							}), o?.label() ?? t.name]
						}),
						/* @__PURE__ */ H(ba, {
							field: c,
							value: o?.unit === "%" && /^[\d.]+$/.test(t.value) ? `${Math.round(parseFloat(t.value) * 1e3) / 10}%` : t.value || null,
							onChange: (e) => s(a.map((t, r) => r === n ? {
								...t,
								value: String(e ?? o?.initial ?? "")
							} : t)),
							disabled: i,
							context: r
						}),
						/* @__PURE__ */ H(da, {
							label: T("Remove Filter"),
							onClick: () => s(a.filter((e, t) => t !== n))
						})
					]
				}, t.name + n);
			})
		})]
	});
}
// admin/src/builder/design/Effects.tsx
var jo = [
	"multiply",
	"screen",
	"overlay",
	"darken",
	"lighten",
	"color-dodge",
	"color-burn",
	"difference",
	"exclusion",
	"hue",
	"saturation",
	"color",
	"luminosity"
], Mo = [
	"pointer",
	"default",
	"text",
	"move",
	"grab",
	"grabbing",
	"zoom-in",
	"zoom-out",
	"not-allowed",
	"none",
	"crosshair"
], No = {
	blur: "px",
	brightness: "percent",
	contrast: "percent",
	saturate: "percent",
	grayscale: "percent",
	"hue-rotate": "deg",
	invert: "percent",
	sepia: "percent"
}, Po = (e) => e.trim().replace(/\s+/g, " ");
function Fo(e, t, n) {
	for (let [r, i] of e.ds.theme.entries()) if (r.startsWith("--blur-") && i.value === n) return e.make(t, r.slice(7));
	return e.make(t, n);
}
function Io(e, t) {
	let n = (e) => `--tw-${t}${e}`, r = Object.keys(No), i = r.flatMap((t) => {
		let r = dt(e.value(n(t)));
		return r === void 0 ? [] : [`${t}(${e.engine ? e.engine.resolve(r) : r})`];
	}).join(" ");
	return {
		value: i || void 0,
		set: (a) => {
			let o = e.engine;
			if (!o) return;
			let s = new Map(Oo(i).map((e) => [e.name, e.value])), c = new Map(Oo(a).map((e) => [e.name, e.value]));
			e.edit((e) => {
				for (let i of r) {
					if (s.get(i) === c.get(i)) continue;
					let r = c.get(i), a = `${t}${i}`;
					e.swap(n(i), r === void 0 ? null : i === "blur" ? Fo(o, a, r) : mt(o, a, r, No[i]));
				}
			}, `${t}filter`);
		},
		markers: r.map(n)
	};
}
function Lo({ s: e }) {
	let t = gn(), n = Io(e, ""), r = Io(e, "backdrop-"), i = e.value("--tw-shadow"), a = i && (t.of("shadow").find((e) => Po(e.value) === Po(i))?.ref ?? i), o = e.value("opacity"), s = [
		"opacity",
		"--tw-shadow",
		"mixBlendMode",
		"cursor",
		"pointerEvents",
		"clipPath"
	].some((t) => e.value(t)) || n.value || r.value;
	return /* @__PURE__ */ U(go, {
		s: e,
		group: "effects",
		title: T("Effects"),
		empty: !s,
		children: [
			/* @__PURE__ */ H(Q, {
				s: e,
				fields: [{
					handle: "opacity",
					type: "text",
					component: "blocks-value",
					label: T("Opacity"),
					percent: !0,
					step: .05,
					min: 0,
					max: 1,
					placeholder: "100",
					slider: {
						min: 0,
						max: 1,
						step: .01,
						neutral: 1
					},
					markers: ["opacity"],
					get: () => o === void 0 ? void 0 : o.endsWith("%") ? String(parseFloat(o) / 100) : o,
					set: (t) => e.swap("opacity", t == null || t === "" || !e.engine ? null : mt(e.engine, "opacity", `${Math.round(Number(t) * 100)}%`, "percent"))
				}]
			}),
			/* @__PURE__ */ H(Q, {
				s: e,
				bare: !0,
				fields: [{
					handle: "boxShadow",
					type: "text",
					component: "blocks-shadows",
					label: T("Shadows"),
					group: "shadow",
					markers: ["--tw-shadow"],
					get: () => a,
					set: (t) => e.swap("--tw-shadow", t && e.engine ? mt(e.engine, "shadow", t, "number") : null)
				}]
			}),
			/* @__PURE__ */ H(Q, {
				s: e,
				bare: !0,
				fields: [{
					handle: "filter",
					type: "text",
					component: "blocks-filters",
					label: T("Filters"),
					markers: n.markers,
					get: () => n.value,
					set: n.set
				}]
			}),
			/* @__PURE__ */ H(Q, {
				s: e,
				bare: !0,
				fields: [{
					handle: "backdropFilter",
					type: "text",
					component: "blocks-filters",
					label: T("Backdrop"),
					markers: r.markers,
					get: () => r.value,
					set: r.set
				}]
			}),
			/* @__PURE__ */ H(Q, {
				s: e,
				fields: [
					{
						handle: "clipPath",
						type: "text",
						component: "blocks-clip",
						label: T("Clip Path"),
						className: "items-start py-0.5 [&>label]:leading-6"
					},
					{
						handle: "mixBlendMode",
						type: "select",
						size: "sm",
						label: T("Blending"),
						placeholder: T("Normal"),
						options: jo
					},
					{
						handle: "cursor",
						type: "select",
						size: "sm",
						label: T("Cursor"),
						placeholder: T("Auto"),
						options: Mo
					},
					{
						handle: "pointerEvents",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: T("Clicks"),
						placeholder: "auto",
						options: [{
							value: "auto",
							label: T("On")
						}, {
							value: "none",
							label: T("Pass Through")
						}]
					}
				]
			})
		]
	});
}
// admin/src/builder/color.tsx
function Ro(e) {
	if (!e) return null;
	let t = e.trim(), n = t.match(/^#([0-9a-f]{3,8})$/i);
	if (n) {
		let e = n[1];
		return (e.length === 3 || e.length === 4) && (e = e.split("").map((e) => e + e).join("")), {
			r: parseInt(e.slice(0, 2), 16),
			g: parseInt(e.slice(2, 4), 16),
			b: parseInt(e.slice(4, 6), 16),
			a: e.length === 8 ? parseInt(e.slice(6, 8), 16) / 255 : 1
		};
	}
	return n = t.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/i), n ? {
		r: +n[1],
		g: +n[2],
		b: +n[3],
		a: n[4] ? n[4].endsWith("%") ? parseFloat(n[4]) / 100 : +n[4] : 1
	} : t === "transparent" ? {
		r: 0,
		g: 0,
		b: 0,
		a: 0
	} : t === "white" ? {
		r: 255,
		g: 255,
		b: 255,
		a: 1
	} : t === "black" ? {
		r: 0,
		g: 0,
		b: 0,
		a: 1
	} : Bo(t);
}
var zo;
function Bo(e) {
	if (typeof document > "u" || typeof CSS > "u" || !CSS.supports("color", e) || /var\(|light-dark\(/.test(e) || (zo ??= document.createElement("canvas").getContext("2d", { willReadFrequently: !0 }), !zo)) return null;
	zo.clearRect(0, 0, 1, 1), zo.fillStyle = "black", zo.fillStyle = e, zo.fillRect(0, 0, 1, 1);
	let [t, n, r, i] = zo.getImageData(0, 0, 1, 1).data;
	return {
		r: t,
		g: n,
		b: r,
		a: Math.round(i / 255 * 100) / 100
	};
}
function Vo({ r: e, g: t, b: n, a: r }) {
	let i = (e) => Math.round(e).toString(16).padStart(2, "0");
	return r >= 1 ? `#${i(e)}${i(t)}${i(n)}` : `rgb(${Math.round(e)} ${Math.round(t)} ${Math.round(n)} / ${Math.round(r * 100)}%)`;
}
function Ho({ r: e, g: t, b: n }) {
	e /= 255, t /= 255, n /= 255;
	let r = Math.max(e, t, n), i = r - Math.min(e, t, n);
	return {
		h: ((i === 0 ? 0 : r === e ? (t - n) / i % 6 : r === t ? (n - e) / i + 2 : (e - t) / i + 4) * 60 + 360) % 360,
		s: r === 0 ? 0 : i / r,
		v: r
	};
}
function Uo(e, t, n, r) {
	let i = (r) => {
		let i = (r + e / 60) % 6;
		return (n - n * t * Math.max(0, Math.min(i, 4 - i, 1))) * 255;
	};
	return {
		r: i(5),
		g: i(3),
		b: i(1),
		a: r
	};
}
function Wo(e, t) {
	return t >= 100 ? `var(${e})` : `color-mix(in oklab, var(${e}) ${Math.round(t)}%, transparent)`;
}
function Go(e) {
	return typeof CSS < "u" && CSS.supports("color", e);
}
function Ko() {
	let e = gn();
	return (t) => t ? e.resolve(t) : "transparent";
}
function qo({ field: e, value: t, onChange: n, disabled: r }) {
	let [i, a] = M(!1), o = Ko(), s = fa(), c = t ?? void 0, l = s(c);
	return /* @__PURE__ */ H(xa, { children: /* @__PURE__ */ H(R, {
		open: i,
		onOpenChange: a,
		align: "end",
		className: "!p-0",
		trigger: /* @__PURE__ */ U(z, {
			compact: !0,
			id: we(e),
			disabled: r,
			className: V(sa, "flex items-center gap-1.5 pl-1 text-left"),
			children: [/* @__PURE__ */ H(ca, {
				color: c === void 0 && typeof e.swatch == "string" ? e.swatch : o(c),
				className: "!size-4"
			}), l ? /* @__PURE__ */ H(ma, {
				token: l.token,
				alpha: l.alpha
			}) : /* @__PURE__ */ H("span", {
				className: V("truncate font-mono", !c && "font-sans text-faint"),
				children: c ?? e.placeholder ?? T("None")
			})]
		}),
		children: /* @__PURE__ */ H(Xo, {
			label: e.label || T("Color"),
			value: c,
			onChange: n
		})
	}) });
}
var Jo = (e) => {
	let t = Ro(e);
	return !!t && (.299 * t.r + .587 * t.g + .114 * t.b) / 255 > .62;
}, Yo = "pointer-events-none absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-pop ring-1 ring-black/20";
function Xo({ label: e, value: t, onChange: n, clearable: r = !0 }) {
	let i = gn(), a = i.of("color"), o = A(() => Mt(a), [a]), s = i.find(t), c = s?.token.variable ?? null, l = !!c && o.families.some((e) => e.shades.some((e) => e.variable === c)), u = s ? s.alpha === void 0 ? 1 : Number(s.alpha) / 100 : 1, d = Ro(s ? Nt(i.resolve(s.token.ref)).light : t) ?? {
		r: 0,
		g: 0,
		b: 0,
		a: 1
	}, [f, p] = M(() => ({
		...Ho(d),
		a: s ? u : d.a
	})), [m, h] = M(t ?? ""), g = Oa(m, (e) => !e.trim() || Go(e.trim())), _ = [
		...o.own.length ? [{
			value: "theme",
			label: T("Theme")
		}] : [],
		...o.families.length ? [{
			value: "palette",
			label: T("Palette")
		}] : [],
		{
			value: "custom",
			label: T("Custom")
		}
	], [v, y] = M(() => t && !s ? "custom" : l ? "palette" : _[0].value);
	k(() => h(t ?? ""), [t]);
	let [b, x] = M(""), S = b.trim().toLowerCase().split(/[\s-]+/).filter(Boolean), C = (e) => S.every((t) => e.toLowerCase().includes(t)), ee = o.own.filter((e) => C(e.name)), w = o.families.flatMap((e) => e.shades).filter((e) => C(e.name)), E = (e, t, r, i) => {
		p({
			h: e,
			s: t,
			v: r,
			a: i
		}), n(Vo(Uo(e, t, r, i)));
	}, D = (e, t) => {
		let r = e.currentTarget;
		r.setPointerCapture(e.pointerId);
		let i = (e) => {
			let i = r.getBoundingClientRect(), a = Math.max(0, Math.min(1, (e.clientX - i.left) / i.width)), o = Math.max(0, Math.min(1, (e.clientY - i.top) / i.height));
			t === "area" ? E(f.h, a, 1 - o, f.a) : t === "hue" ? E(a * 360, f.s, f.v, f.a) : c ? n(Wo(c, a < .995 ? Math.round(a * 100) : 100)) : E(f.h, f.s, f.v, Math.round(a * 100) / 100);
		};
		i(e);
		let a = (e) => i(e), o = () => {
			r.removeEventListener("pointermove", a), r.removeEventListener("pointerup", o);
		};
		r.addEventListener("pointermove", a), r.addEventListener("pointerup", o);
	}, te = c ? u : f.a, ne = c ? Nt(i.resolve(`var(${c})`)).light : Vo({ ...Uo(f.h, f.s, f.v, 1) }), re = /* @__PURE__ */ U("div", {
		onPointerDown: (e) => D(e, "alpha"),
		className: "relative h-3 min-w-0 flex-1 cursor-ew-resize rounded-full cms-checkerboard [--checker:6px]",
		children: [/* @__PURE__ */ H("span", {
			className: "absolute inset-0 rounded-full",
			style: { background: `linear-gradient(to right, transparent, ${ne})` }
		}), /* @__PURE__ */ H("span", {
			className: V(Yo, "top-1/2"),
			style: { left: `${te * 100}%` }
		})]
	});
	return /* @__PURE__ */ U("div", {
		role: "group",
		"aria-label": e,
		className: "w-80",
		children: [
			_.length > 1 && /* @__PURE__ */ H("div", {
				className: "border-b border-border p-1.5",
				children: /* @__PURE__ */ H(ye, {
					size: "xs",
					"aria-label": T("Colors"),
					value: v,
					onChange: y,
					options: _,
					block: !0
				})
			}),
			v !== "custom" && /* @__PURE__ */ H("div", {
				className: "px-3 pt-3",
				children: /* @__PURE__ */ H(F, {
					bare: !0,
					fields: [{
						handle: "search",
						type: "text",
						label: T("Search"),
						icon: "search",
						size: "sm",
						placeholder: T("Search Colors")
					}],
					values: { search: b },
					onChange: (e, t) => x(String(t ?? ""))
				})
			}),
			v !== "custom" && (v === "theme" ? ee : w).length === 0 && /* @__PURE__ */ H(me, {
				className: "h-64 justify-center",
				onClear: () => x("")
			}),
			v === "theme" && ee.length > 0 && /* @__PURE__ */ H("div", {
				ref: Oe,
				role: "listbox",
				"aria-label": T("Theme Colors"),
				className: "h-64 overflow-y-auto overscroll-contain p-1",
				children: ee.map((e) => {
					let t = c === e.variable, { light: r, dark: a } = Nt(e.value);
					return /* @__PURE__ */ U(z, {
						compact: !0,
						role: "option",
						"aria-selected": t,
						onClick: () => n(e.ref),
						className: V("flex h-8 w-full items-center gap-2.5 rounded-sm px-2 text-left hover:bg-hover", t && "bg-active"),
						children: [
							/* @__PURE__ */ H(ca, {
								color: r,
								dark: a,
								className: "!size-4"
							}),
							/* @__PURE__ */ H("span", {
								className: "min-w-0 flex-1 truncate text-xs text-ink",
								children: e.name
							}),
							t ? /* @__PURE__ */ H(I, {
								name: "check",
								size: 12,
								className: "shrink-0 text-ink"
							}) : /* @__PURE__ */ H("span", {
								className: "max-w-24 shrink-0 truncate font-mono text-2xs text-faint",
								children: Nt(i.resolve(e.ref)).light
							})
						]
					}, e.variable);
				})
			}),
			v === "palette" && w.length > 0 && /* @__PURE__ */ H("div", {
				ref: Oe,
				role: "listbox",
				"aria-label": T("Palette"),
				className: "grid h-64 grid-cols-11 content-start gap-1 overflow-y-auto overscroll-contain p-3",
				children: w.map((e) => {
					let t = c === e.variable, r = Nt(e.value).light;
					return /* @__PURE__ */ H(B, {
						content: e.name,
						children: /* @__PURE__ */ U(z, {
							compact: !0,
							role: "option",
							"aria-selected": t,
							"aria-label": e.name,
							onClick: () => n(e.ref),
							className: "relative grid aspect-square place-items-center rounded-xs transition-transform duration-fast ease-out hover:z-raised hover:scale-115",
							style: { background: r },
							children: [/* @__PURE__ */ H("span", { className: "cms-swatch-edge" }), t && /* @__PURE__ */ H(I, {
								name: "check",
								size: 12,
								className: Jo(r) ? "text-black/75" : "text-white"
							})]
						})
					}, e.variable);
				})
			}),
			v === "custom" && /* @__PURE__ */ U("div", {
				className: "h-72 space-y-3 p-3",
				children: [
					/* @__PURE__ */ H("div", {
						onPointerDown: (e) => D(e, "area"),
						className: "relative h-44 cursor-crosshair overflow-hidden rounded-sm",
						style: { background: `linear-gradient(to top, black, transparent), linear-gradient(to right, white, hsl(${f.h} 100% 50%))` },
						children: /* @__PURE__ */ H("span", {
							className: Yo,
							style: {
								left: `${f.s * 100}%`,
								top: `${(1 - f.v) * 100}%`
							}
						})
					}),
					/* @__PURE__ */ H("div", {
						onPointerDown: (e) => D(e, "hue"),
						className: "relative h-3 cursor-ew-resize rounded-full",
						style: { background: "linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)" },
						children: /* @__PURE__ */ H("span", {
							className: V(Yo, "top-1/2"),
							style: { left: `${f.h / 360 * 100}%` }
						})
					}),
					/* @__PURE__ */ H("div", {
						className: "flex items-center",
						children: re
					}),
					/* @__PURE__ */ U("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ H(ca, {
							color: t ? i.resolve(t) : "transparent",
							className: "!size-7 !rounded-sm"
						}), /* @__PURE__ */ H("input", {
							value: m,
							spellCheck: !1,
							"aria-label": T("Color Value"),
							"aria-invalid": g.shown || void 0,
							onChange: (e) => h(e.target.value),
							onBlur: () => {
								let e = m.trim();
								if (e && !Go(e)) return h(t ?? "");
								e !== (t ?? "") && n(e || null);
							},
							onKeyDown: (e) => {
								e.key === "Escape" && h(t ?? ""), e.key === "Enter" && (m.trim() && !Go(m.trim()) ? g.show() : e.target.blur());
							},
							className: V("cms-input h-7 w-full min-w-0 rounded-sm px-2 text-sm placeholder:text-ghost", "font-mono"),
							placeholder: pe
						})]
					})
				]
			}),
			/* @__PURE__ */ U("div", {
				className: "flex h-10 items-center gap-2 border-t border-border pl-3 pr-1.5",
				children: [c && v !== "custom" ? /* @__PURE__ */ U(Ne, { children: [
					/* @__PURE__ */ H("span", {
						className: "shrink-0 text-xs text-muted",
						children: T("Opacity")
					}),
					re,
					/* @__PURE__ */ U("span", {
						className: "w-9 shrink-0 text-right text-2xs tabular-nums text-muted",
						children: [Math.round(te * 100), "%"]
					})
				] }) : /* @__PURE__ */ H("span", { className: "flex-1" }), r && /* @__PURE__ */ H(P, {
					variant: "ghost",
					size: "xs",
					disabled: !t,
					onClick: () => n(null),
					className: "shrink-0 !font-normal !text-muted hover:!text-ink",
					children: T("Clear")
				})]
			})
		]
	});
}
// admin/src/builder/fields/style.tsx
function Zo(e) {
	let t = e?.match(/^(linear|radial)-gradient\((.*)\)$/);
	if (!t) return null;
	let n = Qa(t[2]), r = t[1] === "linear" ? "180deg" : "circle";
	n[0] && (/deg$|^to /.test(n[0]) || /^(circle|ellipse)/.test(n[0])) && (r = n.shift());
	let i = n.map((e) => {
		let t = Za(e);
		return {
			color: t[0],
			at: t[1] ?? ""
		};
	});
	return {
		kind: t[1],
		angle: r,
		stops: i
	};
}
function Qo(e) {
	return `${e.kind}-gradient(${[e.angle, ...e.stops.map((e) => `${e.color}${e.at ? ` ${e.at}` : ""}`)].join(", ")})`;
}
function $o({ value: e, onChange: t, context: n }) {
	let r = Ko(), i = Zo(e);
	if (!i) return null;
	let a = (e) => t(Qo(e));
	return /* @__PURE__ */ U("div", {
		className: "min-w-0 flex-1 space-y-1 rounded-md bg-active/60 p-1.5",
		children: [
			/* @__PURE__ */ H("div", {
				className: "h-6 rounded-sm ring-1 ring-inset ring-black/10",
				style: { background: r(Qo({
					...i,
					kind: "linear",
					angle: "90deg"
				})) }
			}),
			/* @__PURE__ */ H(Z, {
				bare: !0,
				context: n,
				fields: [{
					handle: "shape",
					type: "group",
					component: "blocks-group",
					label: T("Shape"),
					fields: [{
						handle: "kind",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: T("Kind"),
						required: !0,
						options: [{
							value: "linear",
							label: T("Linear")
						}, {
							value: "radial",
							label: T("Radial")
						}]
					}, {
						handle: "angle",
						type: "text",
						component: "blocks-value",
						label: T("Angle"),
						unit: "deg",
						prefix: "∠",
						className: "!flex-none w-20",
						if: { kind: "linear" }
					}]
				}],
				values: { shape: {
					kind: i.kind,
					angle: i.angle
				} },
				onChange: (e, t) => a(t.kind === i.kind ? {
					...i,
					angle: t.angle ?? "180deg"
				} : {
					...i,
					kind: t.kind,
					angle: t.kind === "radial" ? "circle" : "180deg"
				})
			}),
			i.stops.map((e, t) => /* @__PURE__ */ U("div", {
				className: "flex items-center gap-1",
				children: [/* @__PURE__ */ H(Z, {
					bare: !0,
					className: "min-w-0 flex-1",
					context: n,
					fields: [{
						handle: "stop",
						type: "group",
						component: "blocks-group",
						label: T("Stop||gradient"),
						fields: [{
							handle: "color",
							type: "color",
							component: "blocks-color",
							label: T("Color")
						}, {
							handle: "at",
							type: "text",
							component: "blocks-value",
							label: T("Position"),
							unit: "%",
							placeholder: "auto",
							className: "!flex-none w-14"
						}]
					}],
					values: { stop: e },
					onChange: (e, n) => a({
						...i,
						stops: i.stops.map((e, r) => r === t ? {
							color: n.color ?? "transparent",
							at: n.at ?? ""
						} : e)
					})
				}), i.stops.length > 2 && /* @__PURE__ */ H(da, { onClick: () => a({
					...i,
					stops: i.stops.filter((e, n) => n !== t)
				}) })]
			}, t)),
			/* @__PURE__ */ U(z, {
				compact: !0,
				onClick: () => a({
					...i,
					stops: [...i.stops, {
						color: i.stops.at(-1)?.color ?? "transparent",
						at: ""
					}]
				}),
				className: "flex h-7 w-full items-center justify-center gap-1.5 rounded-sm text-xs text-muted hover:bg-hover hover:text-ink",
				children: [
					/* @__PURE__ */ H(I, {
						name: "plus",
						size: 14
					}),
					" ",
					T("Add Stop")
				]
			})
		]
	});
}
var es = [
	"flex-start",
	"center",
	"flex-end"
], ts = () => [
	{
		value: "flex-start",
		label: T("Start")
	},
	{
		value: "center",
		label: T("Center")
	},
	{
		value: "flex-end",
		label: T("End")
	},
	{
		value: "space-between",
		label: T("Space Between")
	},
	{
		value: "space-around",
		label: T("Space Around")
	},
	{
		value: "space-evenly",
		label: T("Space Evenly")
	}
];
function ns({ field: e, value: t, onChange: n, context: r }) {
	let i = e.row === !0, a = t?.justifyContent ?? void 0, o = t?.alignItems ?? void 0;
	return /* @__PURE__ */ U(xa, { children: [/* @__PURE__ */ H("div", {
		className: "grid size-[60px] shrink-0 grid-cols-3 gap-px rounded-sm bg-bg p-1",
		children: [
			0,
			1,
			2
		].flatMap((e) => [
			0,
			1,
			2
		].map((t) => {
			let r = es[i ? t : e], s = es[i ? e : t], c = (a ?? "flex-start") === r && (o ?? "stretch").replace("stretch", "flex-start") === s;
			return /* @__PURE__ */ H(B, {
				content: `${r.replace("flex-", "")} · ${s.replace("flex-", "")}`,
				children: /* @__PURE__ */ H(z, {
					compact: !0,
					onClick: () => n({
						justifyContent: r,
						alignItems: s
					}),
					className: "grid place-items-center rounded-xs hover:bg-hover",
					"aria-label": `${r.replace("flex-", "")} · ${s.replace("flex-", "")}`,
					children: /* @__PURE__ */ H("span", { className: V("rounded-full", c ? "size-2 bg-ink" : "size-1 bg-faint") })
				})
			}, `${t}${e}`);
		}))
	}), /* @__PURE__ */ H(Z, {
		bare: !0,
		className: "min-w-0 flex-1",
		context: r,
		fields: [{
			handle: "justifyContent",
			type: "select",
			size: "sm",
			label: T("Distribute"),
			options: ts(),
			placeholder: T("Distribute")
		}, {
			handle: "alignItems",
			type: "select",
			display: "segmented",
			block: !0,
			size: "sm",
			label: T("Align"),
			options: [
				{
					value: "flex-start",
					icon: i ? "align-top" : "justify-start",
					title: T("Start")
				},
				{
					value: "center",
					icon: i ? "align-middle" : "justify-center",
					title: T("Center")
				},
				{
					value: "flex-end",
					icon: i ? "align-bottom" : "justify-end",
					title: T("End")
				},
				{
					value: "stretch",
					icon: i ? "arrows-out-line-vertical" : "spacing",
					title: T("Stretch")
				},
				{
					value: "baseline",
					icon: "text",
					title: T("Baseline")
				}
			]
		}],
		values: {
			justifyContent: a,
			alignItems: o
		},
		onChange: (e, t) => n({
			justifyContent: a,
			alignItems: o,
			[e]: t
		})
	})] });
}
var rs = [
	[
		"top left",
		"top",
		"top right"
	],
	[
		"left",
		"center",
		"right"
	],
	[
		"bottom left",
		"bottom",
		"bottom right"
	]
], is = {
	left: "0%",
	top: "0%",
	center: "50%",
	right: "100%",
	bottom: "100%"
};
function as(e) {
	let t = (e ?? "center").trim().split(/\s+/), n = (e) => e === "top" || e === "bottom";
	t.length === 1 && t.push("center");
	let [r, i] = n(t[0]) || t[1] && (t[1] === "left" || t[1] === "right") ? [t[1], t[0]] : t;
	return `${is[r] ?? r} ${is[i] ?? i}`;
}
function os({ field: e, value: t, onChange: n, context: r, disabled: i }) {
	let a = as(t);
	return /* @__PURE__ */ U(xa, { children: [/* @__PURE__ */ H("div", {
		className: "grid size-[60px] shrink-0 grid-cols-3 gap-px rounded-sm bg-bg p-1",
		role: "radiogroup",
		"aria-label": e.label,
		children: rs.flat().map((t) => {
			let r = a === as(t);
			return /* @__PURE__ */ H(B, {
				content: t,
				children: /* @__PURE__ */ H(z, {
					compact: !0,
					role: "radio",
					"aria-checked": r,
					"aria-label": t,
					disabled: i,
					onClick: () => n(t === "center" && !e.required ? null : t),
					className: "grid place-items-center rounded-xs hover:bg-hover",
					children: /* @__PURE__ */ H("span", { className: V("rounded-full", r ? "size-2 bg-ink" : "size-1 bg-faint") })
				})
			}, t);
		})
	}), /* @__PURE__ */ H(ba, {
		field: {
			handle: `${e.handle}-value`,
			type: "text",
			component: "blocks-value",
			label: e.label,
			unit: "",
			placeholder: T("Center")
		},
		value: t ?? null,
		onChange: (e) => n(e || null),
		context: r,
		disabled: i
	})] });
}
// admin/src/builder/design/Fill.tsx
var ss = [
	"backgroundSize",
	"backgroundPosition",
	"backgroundRepeat",
	"backgroundAttachment"
], cs = (e) => e?.match(/^url\(["']?([^"')]*)["']?\)$/)?.[1];
function ls(e) {
	try {
		return encodeURI(decodeURI(e));
	} catch {
		return encodeURI(e);
	}
}
function us({ s: e }) {
	let t = gn(), n = e.value("backgroundImage"), r = bt(e.value) ?? (Zo(n) ? n : void 0), i = r ? "gradient" : n ? "image" : "none", a = cs(n), [o, s] = M(null), c = e.value("backgroundColor") || n || r, l = () => e.edit((e) => {
		e.swap(vt, null), e.write(Object.fromEntries(ss.map((e) => [e, null])));
	}, "fill"), u = (t) => {
		let n = Zo(t);
		if (!e.engine || !n) return l();
		e.swap(vt, yt(e.engine, n), "gradient");
	}, d = (t) => {
		let n = t && e.engine ? e.engine.make("bg", `url(${ls(t)})`) : null;
		e.swap(vt, n ?? "bg-none", "image");
	}, f = async (e) => {
		if (!e) return s(null), d(null);
		try {
			let { items: t } = await w("media/get-many", { ids: [e] });
			if (!t[0]?.url) return;
			s({
				id: e,
				url: t[0].url
			}), d(t[0].url);
		} catch (e) {
			Ae.error(e);
		}
	};
	return /* @__PURE__ */ U(go, {
		s: e,
		group: "fill",
		title: T("Fill"),
		empty: !c,
		children: [
			/* @__PURE__ */ H(Q, {
				s: e,
				fields: [{
					handle: "backgroundColor",
					type: "color",
					component: "blocks-color",
					label: T("Color")
				}, {
					handle: "kind",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: T("Image"),
					options: [
						{
							value: "none",
							label: T("None")
						},
						{
							value: "gradient",
							icon: "gradient",
							title: T("Gradient")
						},
						{
							value: "image",
							icon: "image",
							title: T("Image")
						}
					],
					keys: [
						"backgroundImage",
						"--tw-gradient-from",
						"--tw-gradient-to"
					],
					reset: l,
					get: () => i,
					set: (n) => {
						let r = Mt(t.of("color")).own[0]?.ref ?? "currentColor";
						n === "gradient" ? u(`linear-gradient(180deg, ${r}, transparent)`) : n === "image" ? e.edit((e) => {
							e.swap(vt, "bg-none"), e.write({
								backgroundSize: "cover",
								backgroundPosition: "center"
							});
						}, "fill") : l();
					}
				}]
			}),
			i === "gradient" && /* @__PURE__ */ H(Q, {
				s: e,
				bare: !0,
				fields: [{
					handle: "gradient",
					type: "text",
					component: "blocks-gradient",
					className: "items-start",
					label: T("Gradient"),
					get: () => r,
					set: u
				}]
			}),
			i === "image" && /* @__PURE__ */ U("div", {
				className: "space-y-1 rounded-md bg-active/60 p-1.5 text-xs",
				children: [/* @__PURE__ */ H(F, {
					bare: !0,
					disabled: !e.engine,
					fields: [{
						handle: "bg",
						type: "media",
						label: T("Image"),
						max: 1,
						accept: "image/*"
					}],
					values: { bg: o && o.url === a ? [o.id] : [] },
					onChange: (e, t) => void f(t?.[0])
				}), /* @__PURE__ */ H(Z, {
					bare: !0,
					disabled: !e.engine,
					fields: [{
						handle: "url",
						type: "text",
						size: "sm",
						commit: "blur",
						mono: !0,
						label: T("Image Address"),
						placeholder: "/media/…"
					}],
					values: { url: a ?? "" },
					onChange: (e, t) => d(t.trim() || null)
				})]
			}),
			/* @__PURE__ */ H(Q, {
				s: e,
				fields: [
					i === "image" && {
						handle: "backgroundSize",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: T("Size"),
						options: [
							{
								value: "cover",
								label: T("Cover")
							},
							{
								value: "contain",
								label: T("Contain")
							},
							{
								value: "auto",
								label: T("Original")
							}
						]
					},
					i === "image" && {
						handle: "backgroundPosition",
						type: "json",
						component: "blocks-origin",
						label: T("Position"),
						className: "items-start py-0.5 [&>label]:leading-6"
					},
					i === "image" && {
						handle: "backgroundRepeat",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: T("Repeat||again"),
						placeholder: "repeat",
						options: [
							{
								value: "no-repeat",
								label: T("Once")
							},
							{
								value: "repeat",
								label: T("Tile")
							},
							{
								value: "repeat-x",
								icon: "spacing",
								title: T("Tile Across")
							},
							{
								value: "repeat-y",
								icon: "arrows-out-line-vertical",
								title: T("Tile Down")
							}
						]
					},
					i === "image" && {
						handle: "backgroundAttachment",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: T("Scrolling"),
						options: [{
							value: "scroll",
							label: T("With Page")
						}, {
							value: "fixed",
							label: T("Fixed")
						}],
						get: () => e.value("backgroundAttachment") ?? "scroll",
						set: (t) => e.set("backgroundAttachment", t === "fixed" ? "fixed" : null)
					},
					i !== "none" && {
						handle: "backgroundClip",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: T("Clip"),
						options: [{
							value: "border-box",
							label: T("Box")
						}, {
							value: "text",
							label: T("Text")
						}],
						get: () => e.value("backgroundClip") ?? "border-box",
						set: (t) => e.write({
							backgroundClip: t === "text" ? "text" : null,
							color: t === "text" ? "transparent" : null
						})
					}
				]
			})
		]
	});
}
// admin/src/builder/design/Layout.tsx
var ds = () => [
	{
		value: "block",
		icon: "square",
		title: T("Block")
	},
	{
		value: "flex",
		icon: "rows",
		title: T("Stack (flex)")
	},
	{
		value: "grid",
		icon: "grid",
		title: T("Grid")
	},
	{
		value: "inline-flex",
		icon: "arrows-in-line-horizontal",
		title: T("Inline Stack")
	},
	{
		value: "none",
		icon: "eye-off",
		title: T("Hidden")
	}
], fs = (e) => e?.match(/^repeat\((\d+), minmax\(0, 1fr\)\)$/)?.[1] ?? e, ps = (e) => e?.match(/^span (\d+) \/ span \1$/)?.[1] ?? e;
function ms(e, t, n, r) {
	r && /^\d+$/.test(r.trim()) && e.engine?.valid(`${n}-${r.trim()}`) ? e.swap(t.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`), `${n}-${r.trim()}`) : e.set(t, r);
}
function hs({ s: e }) {
	let t = e.value("display"), n = t === "flex" || t === "inline-flex", r = t === "grid" || t === "inline-grid", i = n && (e.value("flexDirection") ?? "row").startsWith("row");
	return /* @__PURE__ */ H(go, {
		s: e,
		group: "layout",
		title: T("Layout"),
		empty: !t,
		children: /* @__PURE__ */ H(Q, {
			s: e,
			fields: [
				{
					handle: "display",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: T("Display"),
					options: ds()
				},
				n && {
					handle: "flexDirection",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: T("Direction"),
					get: () => e.value("flexDirection") ?? "row",
					options: [
						{
							value: "row",
							icon: "arrow-right",
							title: T("Horizontal")
						},
						{
							value: "column",
							icon: "arrow-down",
							title: T("Vertical")
						},
						{
							value: "row-reverse",
							icon: "arrow-left",
							title: T("Horizontal, Reversed")
						},
						{
							value: "column-reverse",
							icon: "arrow-up",
							title: T("Vertical, Reversed")
						}
					]
				},
				n && {
					handle: "align",
					type: "json",
					component: "blocks-align",
					label: T("Align"),
					row: i,
					keys: ["alignItems", "justifyContent"],
					get: () => ({
						justifyContent: e.value("justifyContent"),
						alignItems: e.value("alignItems")
					})
				},
				n && {
					handle: "gap",
					type: "text",
					component: "blocks-value",
					label: T("Gap"),
					group: "spacing",
					prefixIcon: i ? "split" : "split-vertical",
					placeholder: "0",
					min: 0
				},
				n && {
					handle: "flexWrap",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: T("Wrap"),
					options: [{
						value: "nowrap",
						label: T("One Line")
					}, {
						value: "wrap",
						label: T("Wrap")
					}],
					get: () => e.value("flexWrap") ?? "nowrap",
					set: (t) => e.set("flexWrap", t === "wrap" ? "wrap" : null)
				},
				r && {
					handle: "gridTemplateColumns",
					type: "text",
					component: "blocks-value",
					label: T("Columns"),
					placeholder: T("3 or 1fr 2fr"),
					unit: "",
					min: 1,
					title: T("A number of equal columns, or any grid template (1fr 2fr, repeat(auto-fill, minmax(16rem, 1fr)))"),
					get: () => fs(e.value("gridTemplateColumns")),
					set: (t) => ms(e, "gridTemplateColumns", "grid-cols", t)
				},
				r && {
					handle: "gridTemplateRows",
					type: "text",
					component: "blocks-value",
					label: T("Rows"),
					placeholder: "auto",
					unit: "",
					get: () => fs(e.value("gridTemplateRows")),
					set: (t) => ms(e, "gridTemplateRows", "grid-rows", t)
				},
				r && {
					handle: "gaps",
					type: "group",
					component: "blocks-group",
					label: T("Gap"),
					keys: [
						"gap",
						"rowGap",
						"columnGap"
					],
					get: () => ({
						columnGap: e.value("columnGap") ?? e.value("gap"),
						rowGap: e.value("rowGap") ?? e.value("gap")
					}),
					set: (t) => e.write(t.columnGap && t.columnGap === t.rowGap ? {
						columnGap: null,
						rowGap: null,
						gap: t.columnGap
					} : {
						gap: null,
						columnGap: t.columnGap ?? null,
						rowGap: t.rowGap ?? null
					}),
					fields: [{
						handle: "columnGap",
						type: "text",
						component: "blocks-value",
						label: T("Columns"),
						group: "spacing",
						prefixIcon: "split",
						placeholder: "0",
						min: 0
					}, {
						handle: "rowGap",
						type: "text",
						component: "blocks-value",
						label: T("Rows"),
						group: "spacing",
						prefixIcon: "split-vertical",
						placeholder: "0",
						min: 0
					}]
				},
				r && {
					handle: "alignItems",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: T("Align"),
					keys: ["alignItems", "justifyItems"],
					get: () => e.value("alignItems"),
					options: [
						{
							value: "flex-start",
							icon: "align-top",
							title: T("Top")
						},
						{
							value: "center",
							icon: "align-middle",
							title: T("Middle")
						},
						{
							value: "flex-end",
							icon: "align-bottom",
							title: T("Bottom")
						},
						{
							value: "stretch",
							icon: "arrows-out-line-vertical",
							title: T("Stretch")
						}
					]
				},
				r && {
					handle: "gridAutoFlow",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: T("Flow"),
					options: [
						{
							value: "row",
							icon: "arrow-right",
							title: T("Rows First")
						},
						{
							value: "column",
							icon: "arrow-down",
							title: T("Columns First")
						},
						{
							value: "row dense",
							icon: "group",
							title: T("Fill Gaps (Dense)")
						}
					]
				}
			]
		})
	});
}
function gs({ s: e, parentDisplay: t }) {
	if (!t || !/flex|grid/.test(t)) return null;
	let n = t.includes("grid");
	return /* @__PURE__ */ H(go, {
		s: e,
		group: "item",
		title: T(n ? "Grid Item" : "Stack Item"),
		open: !1,
		empty: !e.value("alignSelf") && !e.value("flex") && !e.value("gridColumn"),
		children: /* @__PURE__ */ H(Q, {
			s: e,
			fields: [
				n && {
					handle: "gridColumn",
					type: "text",
					component: "blocks-value",
					label: T("Column"),
					placeholder: "auto",
					unit: "",
					title: T("Span a number of columns (2), or a range (1 / -1 for full width)"),
					get: () => ps(e.value("gridColumn")),
					set: (t) => ms(e, "gridColumn", "col-span", t)
				},
				n && {
					handle: "gridRow",
					type: "text",
					component: "blocks-value",
					label: T("Row"),
					placeholder: "auto",
					unit: "",
					get: () => ps(e.value("gridRow")),
					set: (t) => ms(e, "gridRow", "row-span", t)
				},
				!n && {
					handle: "flex",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: T("Grow"),
					options: [
						{
							value: "1",
							label: T("Fill||size")
						},
						{
							value: "none",
							label: T("Fixed")
						},
						{
							value: "0 1 auto",
							label: T("Shrink")
						}
					]
				},
				{
					handle: "alignSelf",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: T("Align Self"),
					options: [
						{
							value: "flex-start",
							icon: "align-top",
							title: T("Start")
						},
						{
							value: "center",
							icon: "align-middle",
							title: T("Center")
						},
						{
							value: "flex-end",
							icon: "align-bottom",
							title: T("End")
						},
						{
							value: "stretch",
							icon: "arrows-out-line-vertical",
							title: T("Stretch")
						}
					]
				},
				{
					handle: "order",
					type: "text",
					component: "blocks-value",
					label: T("Display Order"),
					unit: "",
					placeholder: "0",
					prefixIcon: "list-ordered"
				}
			]
		})
	});
}
// admin/src/builder/design/Position.tsx
function _s({ s: e }) {
	let t = e.value("position"), n = !!t && t !== "static";
	return /* @__PURE__ */ H(go, {
		s: e,
		group: "position",
		title: T("Position"),
		open: !!t,
		empty: !t,
		children: /* @__PURE__ */ H(Q, {
			s: e,
			fields: [
				{
					handle: "position",
					type: "select",
					size: "sm",
					label: T("Type"),
					placeholder: T("Static"),
					options: [
						{
							value: "static",
							label: T("Static")
						},
						{
							value: "relative",
							label: T("Relative")
						},
						{
							value: "absolute",
							label: T("Absolute")
						},
						{
							value: "fixed",
							label: T("Fixed")
						},
						{
							value: "sticky",
							label: T("Sticky")
						}
					]
				},
				n && {
					handle: "offsets",
					type: "group",
					component: "blocks-group",
					label: T("Offsets"),
					columns: 2,
					fields: [
						"top",
						"right",
						"bottom",
						"left"
					].map((e) => ({
						handle: e,
						type: "text",
						component: "blocks-value",
						label: {
							top: T("Top"),
							right: T("Right"),
							bottom: T("Bottom"),
							left: T("Left")
						}[e],
						title: {
							top: T("Top"),
							right: T("Right"),
							bottom: T("Bottom"),
							left: T("Left")
						}[e],
						prefix: e[0].toUpperCase(),
						placeholder: "auto",
						group: "spacing",
						keywords: ["auto"]
					}))
				},
				n && {
					handle: "zIndex",
					type: "text",
					component: "blocks-value",
					label: T("Z-index"),
					unit: "",
					placeholder: "auto",
					prefixIcon: "collection"
				},
				{
					handle: "isolation",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: T("Isolation"),
					placeholder: "auto",
					options: [{
						value: "auto",
						label: T("Auto")
					}, {
						value: "isolate",
						label: T("Isolate")
					}]
				}
			]
		})
	});
}
// admin/src/builder/design/Size.tsx
function vs(e, t, n) {
	let r = e.value(t), i = r === "100%" ? "fill" : r === "fit-content" ? "fit" : r === "auto" || !r ? "auto" : r.endsWith("vh") || r.endsWith("vw") || r.endsWith("dvh") ? "viewport" : "fixed", a = {
		fill: T("Fill||size"),
		fit: T("Fit"),
		auto: T("Auto"),
		viewport: T("Window"),
		fixed: T("Fixed")
	};
	return {
		handle: t,
		type: "text",
		component: "blocks-value",
		label: n,
		prefix: t === "width" ? "W" : "H",
		placeholder: T("Auto"),
		keywords: [
			"auto",
			"fit-content",
			"min-content",
			"max-content"
		],
		group: t === "width" ? "container" : void 0,
		menu: {
			label: a[i],
			items: [
				{
					label: T("Fill the Parent (100%)"),
					value: "100%",
					checked: i === "fill"
				},
				{
					label: T("Fit the Content"),
					value: "fit-content",
					checked: i === "fit"
				},
				{
					label: T("Auto"),
					value: null,
					checked: i === "auto"
				},
				{
					label: T(t === "width" ? "Window Width (100vw)" : "Window Height (100dvh)"),
					value: t === "width" ? "100vw" : "100dvh",
					checked: i === "viewport"
				}
			]
		}
	};
}
function ys({ s: e, media: t }) {
	let n = [
		"width",
		"height",
		"minWidth",
		"maxWidth",
		"minHeight",
		"maxHeight",
		"aspectRatio",
		"overflow"
	].some((t) => e.value(t));
	return /* @__PURE__ */ H(go, {
		s: e,
		group: "size",
		title: T("Size"),
		empty: !n,
		children: /* @__PURE__ */ H(Q, {
			s: e,
			fields: [
				vs(e, "width", T("Width")),
				vs(e, "height", T("Height")),
				{
					handle: "limits",
					type: "group",
					component: "blocks-group",
					label: T("Min · Max"),
					columns: 2,
					fields: [
						{
							handle: "minWidth",
							type: "text",
							component: "blocks-value",
							label: T("Min Width"),
							prefix: "W",
							placeholder: T("Min"),
							title: T("Minimum Width"),
							min: 0
						},
						{
							handle: "maxWidth",
							type: "text",
							component: "blocks-value",
							label: T("Max Width"),
							prefix: "W",
							placeholder: T("Max"),
							group: "container",
							title: T("Maximum Width"),
							min: 0,
							keywords: ["none"]
						},
						{
							handle: "minHeight",
							type: "text",
							component: "blocks-value",
							label: T("Min Height"),
							prefix: "H",
							placeholder: T("Min"),
							title: T("Minimum Height"),
							min: 0
						},
						{
							handle: "maxHeight",
							type: "text",
							component: "blocks-value",
							label: T("Max Height"),
							prefix: "H",
							placeholder: T("Max"),
							title: T("Maximum Height"),
							min: 0,
							keywords: ["none"]
						}
					]
				},
				{
					handle: "aspectRatio",
					type: "select",
					size: "sm",
					label: T("Aspect"),
					placeholder: T("Auto"),
					get: () => {
						let t = e.value("aspectRatio");
						return t && e.engine ? e.engine.resolve(t).replace(/\s+/g, "") : t;
					},
					options: [
						{
							value: "1/1",
							label: T("1:1 square")
						},
						{
							value: "4/3",
							label: "4:3"
						},
						{
							value: "3/2",
							label: "3:2"
						},
						{
							value: "16/9",
							label: "16:9"
						},
						{
							value: "21/9",
							label: "21:9"
						},
						{
							value: "3/4",
							label: T("3:4 portrait")
						},
						{
							value: "4/5",
							label: "4:5"
						},
						{
							value: "9/16",
							label: T("9:16 story")
						}
					]
				},
				{
					handle: "overflow",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: T("Overflow"),
					placeholder: "visible",
					options: [
						{
							value: "visible",
							icon: "eye",
							title: T("Visible")
						},
						{
							value: "hidden",
							icon: "eye-off",
							title: T("Hidden")
						},
						{
							value: "auto",
							icon: "mouse-scroll",
							title: T("Scroll When Needed")
						},
						{
							value: "clip",
							icon: "scissors",
							title: T("Clip, without scrolling")
						}
					]
				},
				t && {
					handle: "objectFit",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: T("Fit||image"),
					options: [
						{
							value: "cover",
							label: T("Cover")
						},
						{
							value: "contain",
							label: T("Contain")
						},
						{
							value: "fill",
							label: T("Stretch")
						},
						{
							value: "none",
							label: T("None")
						}
					]
				},
				t && {
					handle: "objectPosition",
					type: "json",
					component: "blocks-origin",
					label: T("Focus"),
					className: "items-start py-0.5 [&>label]:leading-6"
				}
			]
		})
	});
}
// admin/src/builder/design/Spacing.tsx
var bs = [
	"Top",
	"Right",
	"Bottom",
	"Left"
];
function xs(e, t, n) {
	return [
		`${t}${bs[n]}`,
		n % 2 == 0 ? `${t}Block` : `${t}Inline`,
		t
	].find((t) => e.value(t) !== void 0) ?? null;
}
function Ss(e, t, n) {
	let r = xs(e, t, n);
	if (!r) return;
	let i = e.value(r);
	if (r === t) return $a(i)?.[n];
	if (r.endsWith("Block") || r.endsWith("Inline")) {
		let [e, t] = Za(String(i));
		return n === 0 || n === 3 ? e : t ?? e;
	}
	return i;
}
var Cs = (e) => [
	e,
	`${e}Block`,
	`${e}Inline`,
	...bs.map((t) => `${e}${t}`)
];
function ws({ s: e }) {
	let t = ["margin", "padding"], n = t.some((t) => bs.some((n, r) => Ss(e, t, r))), r = Object.fromEntries(t.map((t) => [t, [
		0,
		1,
		2,
		3
	].map((n) => Ss(e, t, n))])), i = Object.fromEntries(t.map((t) => [t, [
		0,
		1,
		2,
		3
	].map((n) => {
		let r = xs(e, t, n);
		return r ? e.status(r) === "own" ? "own" : "inherited" : "none";
	})])), a = (t, n) => {
		let r = {
			[t]: null,
			[`${t}Block`]: null,
			[`${t}Inline`]: null
		}, i = n.every((e) => e !== void 0 && e === n[0]), a = !i && n.every((e) => e !== void 0) && n[0] === n[2] && n[1] === n[3];
		i && (r[t] = n[0]), a && Object.assign(r, {
			[`${t}Block`]: n[0],
			[`${t}Inline`]: n[1]
		}), bs.forEach((e, o) => r[`${t}${e}`] = i || a ? null : n[o] ?? null), e.write(r);
	};
	return /* @__PURE__ */ H(ta, {
		title: T("Spacing"),
		empty: !n,
		own: ho(e, "spacing"),
		children: /* @__PURE__ */ H(Q, {
			s: e,
			bare: !0,
			fields: [{
				handle: "spacing",
				type: "json",
				component: "blocks-spacing",
				className: "items-start",
				label: T("Spacing"),
				sideStatus: i,
				keys: [...Cs("margin"), ...Cs("padding")],
				get: () => r,
				set: (e) => t.forEach((t) => e[t] !== r[t] && a(t, e[t]))
			}]
		})
	});
}
// admin/src/builder/palette.tsx
var Ts = "scheme-";
function Es(e) {
	return e.utilities().filter((e) => e.name.startsWith("scheme-") && e.classes.includes("scheme")).map((t) => {
		let n = new Map(e.utilityProperties(t.name).map((e) => [e.name, e.value]));
		return {
			name: t.name,
			key: t.name.slice(7),
			background: n.get("--scheme") ?? "transparent",
			text: n.get("--scheme-text") ?? "currentColor"
		};
	});
}
var Ds = (e) => /^transparent$|\/\s*(0?\.\d+|\d{1,2}(\.\d+)?%)\s*\)$/.test(e.trim());
function Os({ background: e, text: t, size: n }) {
	let r = Ds(e);
	return /* @__PURE__ */ U("span", {
		"aria-hidden": !0,
		className: V("relative grid shrink-0 place-items-center overflow-hidden", n === "mark" ? "h-4 w-5 rounded-xs text-2xs" : "h-20 w-full rounded-md text-2xl", r && "cms-checkerboard"),
		children: [
			/* @__PURE__ */ H("span", {
				className: "absolute inset-0",
				style: { background: e }
			}),
			/* @__PURE__ */ H("span", {
				className: "relative font-semibold leading-none",
				style: {
					color: t,
					textShadow: r ? "0 0 3px rgb(0 0 0 / 0.6)" : void 0
				},
				children: "Aa"
			}),
			/* @__PURE__ */ H("span", { className: "cms-swatch-edge" })
		]
	});
}
// admin/src/builder/design/Classes.tsx
var ks = (e) => e.replace(/^!|!$/g, "");
function As(e, t) {
	let n = (e.declarations(ks(q(t).utility)) ?? []).filter((e) => !e.property.startsWith("--")), r = n.find((e) => /(^|-)color$|^fill$|^stroke$/.test(e.property) && !/^(inherit|currentcolor|transparent)$/i.test(e.value));
	return {
		text: n.slice(0, 2).map((t) => `${t.property}: ${e.resolve(t.value)}`).join("; "),
		color: r && Nt(e.resolve(r.value)).light
	};
}
var js = 8;
function Ms({ engine: e, site: t, exclude: n, onAdd: r, onBackspace: i, onEmpty: a, initial: o, onDone: s, label: c }) {
	let [l, u] = M(o ?? ""), [d, f] = M(0), [p, m] = M(!!o), [h, g] = M(!1), _ = A(() => new Set(n), [n]), v = l.trim(), y = A(() => {
		if (!e || !p || /\s/.test(v) || !v && !h) return [];
		let n = v.toLowerCase(), r = t.filter((e) => !_.has(e) && (!n || e.toLowerCase().includes(n)));
		return [
			[T("Tailwind"), n ? At(e, [], v, _).slice(0, js) : []],
			[T("Site Classes"), r.filter((e) => !e.startsWith("scheme-"))],
			[T("Schemes"), r.filter((e) => e.startsWith("scheme-"))]
		].filter(([, e]) => e.length > 0);
	}, [
		e,
		p,
		v,
		h,
		t,
		_
	]), b = A(() => y.flatMap(([, e]) => e), [y]), [x, S] = M(!1), C = (t) => {
		let n = t.filter((t) => Tt(t) && !Et(e, t));
		n.length && r(n), u(""), f(0), s?.();
	}, ee = (e) => {
		if (e.key === "ArrowDown" && !b.length && !v) e.preventDefault(), g(!0);
		else if ((e.key === "ArrowDown" || e.key === "ArrowUp") && b.length) e.preventDefault(), f((t) => (t + (e.key === "ArrowDown" ? 1 : -1) + b.length) % b.length);
		else if (e.key === "Enter" || e.key === "Tab" && b.length && v || e.key === " " && v) {
			if (!v) {
				e.key === "Enter" && a && (e.preventDefault(), a());
				return;
			}
			e.preventDefault(), C(/\s/.test(v) ? qe(v) : [b[d] ?? v]);
		} else e.key === "Escape" ? (e.preventDefault(), g(!1), u(""), s?.()) : e.key === "Backspace" && l === "" && i && (e.preventDefault(), i());
	}, w = A(() => `cms-classes-${Math.random().toString(36).slice(2)}`, []);
	return k(() => De(document.getElementById(w), document.getElementById(`${w}-${d}`)), [w, d]), /* @__PURE__ */ U("div", {
		className: o === void 0 ? "min-w-20 flex-1" : "flex-none",
		style: o === void 0 ? void 0 : { width: `${Math.max(l.length, 4) + 2}ch` },
		children: [/* @__PURE__ */ H("input", {
			autoFocus: !!o,
			value: l,
			disabled: !e,
			spellCheck: !1,
			autoCapitalize: "off",
			autoCorrect: "off",
			autoComplete: "off",
			role: "combobox",
			"aria-label": c,
			"aria-expanded": b.length > 0,
			"aria-controls": w,
			"aria-activedescendant": b.length ? `${w}-${d}` : void 0,
			placeholder: o === void 0 ? T("Add Class") : void 0,
			onChange: (e) => {
				u(e.target.value), e.target.value || g(!1), f(0);
				let t = e.target.getBoundingClientRect();
				S(window.innerHeight - t.bottom < 300 && t.top > 300);
			},
			onKeyDown: ee,
			onFocus: (e) => {
				m(!0);
				let t = e.target.getBoundingClientRect();
				S(window.innerHeight - t.bottom < 300 && t.top > 300);
			},
			onBlur: () => {
				m(!1), g(!1), v ? C(qe(v)) : a ? a() : s?.();
			},
			className: V("h-6 w-full min-w-0 rounded-xs px-1 font-mono text-xs text-text outline-none placeholder:font-sans placeholder:text-faint", o === void 0 ? "bg-transparent" : "bg-active px-1.5")
		}), b.length > 0 && /* @__PURE__ */ H("div", {
			id: w,
			role: "listbox",
			"aria-label": c,
			className: V("absolute inset-x-0 z-raised max-h-64 overflow-y-auto overscroll-contain rounded-md border border-border-float bg-float p-1 shadow-pop", x ? "bottom-full mb-1" : "top-full mt-1"),
			children: e && y.map(([n, r]) => /* @__PURE__ */ U("div", {
				role: "group",
				"aria-label": n,
				children: [/* @__PURE__ */ H("div", {
					className: "cms-label flex h-7 items-center px-2",
					children: n
				}), r.map((n) => {
					let r = b.indexOf(n), i = As(e, n);
					return /* @__PURE__ */ U(z, {
						compact: !0,
						id: `${w}-${r}`,
						role: "option",
						"aria-selected": r === d,
						tabIndex: -1,
						onPointerDown: (e) => {
							e.preventDefault(), C([n]);
						},
						onMouseEnter: () => f(r),
						className: V("flex min-h-7 w-full items-center gap-2 rounded-xs px-2 py-1 text-left", r === d && "bg-hover"),
						children: [
							i.color && /* @__PURE__ */ H(ca, {
								color: i.color,
								className: "!size-3.5"
							}),
							/* @__PURE__ */ H("span", {
								className: "shrink-0 font-mono text-xs text-ink",
								children: n
							}),
							!t.includes(n) && /* @__PURE__ */ H("span", {
								className: "min-w-0 flex-1 truncate text-right text-2xs text-faint",
								children: i.text
							})
						]
					}, n);
				})]
			}, n))
		})]
	});
}
function Ns({ s: e, site: t, disabled: n, siteMenu: r }) {
	let i = e.engine, [a, o] = M(null), s = (n, r) => {
		if (!i) return;
		let a = r ? e.classes.filter((e) => e !== r) : e.classes;
		for (let o of n) {
			let n = r ? o : Ct(o, e.variants), { variants: s, utility: c } = q(n), l = t.includes(ks(c)) ? null : i.group(c);
			a = l ? i.put(a, s, l, c) : [...a.filter((e) => e !== n), n];
		}
		e.apply(i.sort(a), "classes");
	}, c = (t) => e.apply(e.classes.filter((e) => e !== t), "classes"), [l, u] = M(!1), d = (e) => t.includes(ks(q(e).utility)), f = (t) => {
		let { variants: n } = q(t);
		return n.length === e.variants.length && n.every((t) => e.variants.includes(t));
	}, p = [...e.classes.filter(d), ...e.classes.filter((e) => !d(e))];
	return /* @__PURE__ */ U("div", {
		className: V("cms-input relative flex !h-auto min-h-7 cursor-text flex-wrap items-center gap-0.5 !rounded-sm !p-0.5", n && "opacity-60"),
		"data-focus": l || void 0,
		onFocus: () => u(!0),
		onBlur: () => u(!1),
		onPointerDown: (e) => {
			e.target === e.currentTarget && (e.preventDefault(), e.currentTarget.querySelector("input[aria-label]:last-of-type")?.focus());
		},
		"data-class-chips": !0,
		children: [p.map((l) => a === l && !n ? /* @__PURE__ */ H(Ms, {
			engine: i,
			site: t,
			exclude: e.classes.filter((e) => e !== l),
			initial: l,
			label: T("Class"),
			onAdd: (e) => s(e, l),
			onEmpty: () => {
				c(l), o(null);
			},
			onDone: () => o(null)
		}, l) : /* @__PURE__ */ H("span", {
			className: V("inline-flex h-6 max-w-full items-center rounded-xs pl-1.5 text-xs text-ink", d(l) ? "font-medium shadow-edge" : "font-mono", f(l) ? "bg-focus-soft" : d(l) ? "bg-bg" : "bg-active", n && "pr-1.5", Et(i, l) && "underline decoration-danger decoration-wavy underline-offset-2"),
			children: n ? /* @__PURE__ */ H("span", {
				className: "truncate",
				children: l
			}) : /* @__PURE__ */ U(Ne, { children: [d(l) && r ? /* @__PURE__ */ H(de, {
				align: "start",
				trigger: /* @__PURE__ */ H(z, {
					compact: !0,
					"aria-label": T("{name} Actions", { name: l }),
					className: "min-w-0 truncate rounded-xs text-left",
					children: l
				}),
				items: r(l)
			}) : /* @__PURE__ */ H(z, {
				compact: !0,
				onClick: () => o(l),
				"aria-label": T("Change {name}", { name: l }),
				className: "min-w-0 truncate rounded-xs text-left",
				children: l
			}), /* @__PURE__ */ H(L, {
				icon: "close",
				size: "xs",
				label: T("Remove {name}", { name: l }),
				onClick: () => c(l),
				className: "!size-5 shrink-0 text-faint hover:text-ink"
			})] })
		}, l)), !n && /* @__PURE__ */ H(Ms, {
			engine: i,
			site: t,
			exclude: e.classes,
			label: T("Add Class"),
			onAdd: (e) => s(e),
			onBackspace: () => p.length && c(p[p.length - 1])
		})]
	});
}
// admin/src/builder/design/StyleBar.tsx
var Ps = (e) => e.replace(/^!|!$/g, ""), Fs = () => [
	{
		value: "",
		label: T("Default")
	},
	{
		value: "hover",
		label: T("Hover")
	},
	{
		value: "active",
		label: T("Pressed")
	},
	{
		value: "focus-visible",
		label: T("Focus")
	}
], Is = () => [
	{
		value: "before",
		label: T("Before")
	},
	{
		value: "after",
		label: T("After")
	},
	{
		value: "placeholder",
		label: T("Placeholder")
	},
	{
		value: "first",
		label: T("First Item")
	},
	{
		value: "last",
		label: T("Last Item")
	},
	{
		value: "odd",
		label: T("Odd Items")
	},
	{
		value: "even",
		label: T("Even Items")
	},
	{
		value: "current",
		label: T("Current Page")
	},
	{
		value: "group-hover",
		label: T("Hover on Group")
	},
	{
		value: "dark",
		label: T("Dark Mode")
	},
	{
		value: "open",
		label: T("When Open")
	}
];
function Ls(e) {
	if (e === "") return T("Default");
	let t = [...Fs(), ...Is()].find((t) => t.value === e);
	return t ? t.label : e.startsWith("in-data-") ? T("in {state}", { state: e.slice(8) }) : e.startsWith("data-") ? e.slice(5) : e;
}
function Rs({ classes: e, engine: t, state: n, onState: r, states: i, className: a }) {
	let o = xt(e), s = n.join(":"), c = (e) => r(e ? q(`${e}:x`).variants : []), l = [...(i?.own ?? []).map((e) => `data-${e}`), ...(i?.inherited ?? []).map((e) => `in-data-${e}`)], u = (e) => !t || t.valid(`${e}:flex`), d = async () => {
		let e = await Ee({
			title: T("Custom Variant"),
			fields: [{
				handle: "name",
				type: "text",
				label: T("Variant"),
				placeholder: "aria-expanded, peer-checked",
				mono: !0
			}],
			confirm: T("Edit Variant")
		}), t = String(e?.name ?? "").trim().replace(/:+$/, "");
		if (t) {
			if (/\s/.test(t) || !u(t)) return void Ae.error(T("Tailwind has no variant “{name}”.", { name: t }));
			c(t);
		}
	}, f = (e, t = Ls(e)) => ({
		label: t,
		checked: s === e,
		mark: e && o.has(e) ? T("Has Styles") : void 0,
		onSelect: () => c(e)
	}), p = Is().map((e) => e.value).filter(u), m = l.filter(u), h = s !== "";
	return /* @__PURE__ */ H(de, {
		align: "end",
		trigger: /* @__PURE__ */ U(z, {
			compact: !0,
			"aria-label": T("State: {state}", { state: n.map(Ls).join(" · ") || T("Default") }),
			className: V("cms-input flex !h-7 min-w-0 items-center gap-1.5 !rounded-sm !px-2 text-left text-xs", a),
			children: [
				/* @__PURE__ */ H("span", {
					className: "min-w-0 flex-1 truncate",
					children: h ? n.map(Ls).join(" · ") : T("Default")
				}),
				h && o.has(s) && /* @__PURE__ */ H("span", {
					role: "img",
					"aria-label": T("Has Styles"),
					className: "size-1.5 shrink-0 rounded-full bg-focus"
				}),
				/* @__PURE__ */ H(I, {
					name: "chevron-down",
					size: 12,
					className: "shrink-0 text-faint"
				})
			]
		}),
		items: [
			...Fs().map((e) => f(e.value, e.label)),
			{
				separator: !0,
				label: ""
			},
			...p.map((e) => f(e)),
			...m.length ? [
				{
					separator: !0,
					label: ""
				},
				{
					label: T("States of This Element"),
					heading: !0
				},
				...m.map((e) => f(e))
			] : [],
			...s && !Fs().some((e) => e.value === s) && !p.includes(s) && !m.includes(s) ? [f(s)] : [],
			{
				separator: !0,
				label: ""
			},
			{
				label: T("Custom Variant…"),
				onSelect: () => void d()
			}
		]
	});
}
var zs = (e) => String(e ?? "").trim().toLowerCase().replace(/[\s_]+/g, "-");
async function Bs(e, t, n, r, i = "") {
	let a = zs((await Ee({
		title: n,
		fields: [{
			handle: "name",
			type: "text",
			label: T("Name"),
			placeholder: "card",
			mono: !0,
			required: !0,
			autofocus: !0
		}],
		values: { name: i },
		confirm: r
	}))?.name);
	return !a || a === i ? null : /^[a-z][a-z0-9-]*$/.test(a) ? t.includes(a) || e?.valid(a) ? (Ae.error(T("There is already a class “{name}”.", { name: a })), null) : a : (Ae.error(T("A name is lowercase letters, numbers and hyphens, and starts with a letter.")), null);
}
function Vs({ s: e, site: t, source: n, state: r, disabled: i, menu: a = [], saveAs: o = !0 }) {
	let s = e.engine, c = wt(s, e.classes, t), l = v("settings.manage") && !!n && !!s && !i, u = e.screen.sizes, d = (e) => q(e).variants.some((e) => !!at(e, u)), f = c.utilities.filter((e) => !d(e)), p = async () => {
		if (!s || !n) return;
		let r = await Bs(s, t, T("Save as Class"), T("Save Class"));
		if (r) try {
			await w("styling/update", { css: new Zt(n.css).setUtility(r, s.sort(f)).css }), b("styling/"), e.apply([
				...c.site,
				r,
				...c.utilities.filter(d)
			], "classes"), Ae.success(T("Class “{name}” saved", { name: r }));
		} catch (e) {
			Ae.error(e);
		}
	}, m = (t) => {
		if (!s || !n) return;
		let { variants: r, utility: i } = q(t), a = (new Zt(n.css).utilities().find((e) => e.name === Ps(i))?.classes ?? []).map((e) => Ke(r, e));
		e.apply(s.sort([.../* @__PURE__ */ new Set([...e.classes.filter((e) => e !== t), ...a])]), "classes");
	}, h = (t) => {
		let r = Ps(q(t).utility);
		return [
			{
				label: T("Class of the Site"),
				heading: !0
			},
			...l ? [{
				label: T("Edit Class"),
				icon: "edit",
				onSelect: () => x(r.startsWith("scheme-") ? "/design/colors" : `/design/classes/${r.startsWith("btn-") ? "buttons" : "ungrouped"}/${encodeURIComponent(r)}`)
			}] : [],
			...n ? [{
				label: T("Detach Class"),
				icon: "unlink",
				onSelect: () => m(t)
			}] : [],
			{
				label: T("Remove Class"),
				icon: "trash",
				danger: !0,
				onSelect: () => e.apply(e.classes.filter((e) => e !== t), "classes")
			}
		];
	};
	return /* @__PURE__ */ U("div", {
		"data-style-bar": !0,
		children: [/* @__PURE__ */ U("div", {
			className: "flex min-h-11 items-center gap-2 border-b border-border px-4 py-2",
			children: [/* @__PURE__ */ H(ia, { field: {
				handle: "state",
				type: "select",
				label: T("State")
			} }), /* @__PURE__ */ H(Rs, {
				...r,
				className: "flex-1"
			})]
		}), /* @__PURE__ */ H(ta, {
			title: T("Classes"),
			detail: e.classes.length || void 0,
			open: !1,
			actionsOpen: !1,
			actions: /* @__PURE__ */ H(de, {
				align: "end",
				trigger: /* @__PURE__ */ H(L, {
					icon: "more",
					size: "xs",
					label: T("Class Actions")
				}),
				items: [
					...a,
					...a.length ? [{
						separator: !0,
						label: ""
					}] : [],
					...l && o ? [{
						label: T("Save as Class…"),
						icon: "plus",
						disabled: f.length === 0,
						onSelect: () => void p()
					}] : [],
					{
						label: T("Copy Classes"),
						icon: "copy",
						disabled: e.classes.length === 0,
						onSelect: () => void Se(e.classes.join(" "), { copied: T("Classes copied") })
					}
				]
			}),
			children: /* @__PURE__ */ H(Ns, {
				s: e,
				site: t,
				disabled: i,
				siteMenu: h
			})
		})]
	});
}
// admin/src/builder/design/Transform.tsx
var Hs = (e) => !e || /^-?0(px|deg|%)?$/.test(e);
function Us({ s: e }) {
	let t = {
		x: e.value("--tw-translate-x"),
		y: e.value("--tw-translate-y")
	}, n = {
		X: dt(e.value("--tw-skew-x")),
		Y: dt(e.value("--tw-skew-y"))
	}, r = e.value("--tw-scale-x"), i = r?.endsWith("%") ? String(parseFloat(r) / 100) : r, a = [
		t.x,
		t.y,
		n.X,
		n.Y,
		i,
		e.value("rotate"),
		e.value("transformOrigin"),
		e.value("perspective")
	].some(Boolean), o = (t, n, r, i) => e.swap(t, e.engine && !Hs(r) ? mt(e.engine, n, r, i) : null), s = (e) => [{
		handle: "x",
		type: "text",
		component: "blocks-value",
		label: "X",
		prefix: "X",
		placeholder: "0",
		unit: e
	}, {
		handle: "y",
		type: "text",
		component: "blocks-value",
		label: "Y",
		prefix: "Y",
		placeholder: "0",
		unit: e
	}];
	return /* @__PURE__ */ H(go, {
		s: e,
		group: "transform",
		title: T("Transform"),
		open: !!a,
		empty: !a,
		children: /* @__PURE__ */ H(Q, {
			s: e,
			fields: [
				{
					handle: "move",
					type: "group",
					component: "blocks-group",
					label: T("Move"),
					markers: ["--tw-translate-x", "--tw-translate-y"],
					fields: s("px"),
					get: () => t,
					set: (e) => Object.entries(no(t, e)).forEach(([e, t]) => o(`--tw-translate-${e}`, `translate-${e}`, t, "spacing"))
				},
				{
					handle: "rotate",
					type: "text",
					component: "blocks-value",
					label: T("Rotate"),
					unit: "deg",
					prefixIcon: "redo",
					placeholder: "0",
					markers: ["rotate"],
					get: () => e.value("rotate"),
					set: (e) => o("rotate", "rotate", e, "deg")
				},
				{
					handle: "scale",
					type: "text",
					component: "blocks-value",
					label: T("Scale"),
					unit: "",
					step: .01,
					prefixIcon: "arrows-out-simple",
					placeholder: "1",
					markers: ["scale"],
					get: () => i,
					set: (t) => e.swap("scale", e.engine && t && Number(t) !== 1 ? mt(e.engine, "scale", t, "percent") : null)
				},
				{
					handle: "skew",
					type: "group",
					component: "blocks-group",
					label: T("Skew"),
					markers: ["--tw-skew-x", "--tw-skew-y"],
					fields: s("deg").map((e) => ({
						...e,
						handle: e.handle.toUpperCase()
					})),
					get: () => n,
					set: (e) => Object.entries(no(n, e)).forEach(([e, t]) => o(`--tw-skew-${e.toLowerCase()}`, `skew-${e.toLowerCase()}`, t, "deg"))
				},
				{
					handle: "transformOrigin",
					type: "json",
					component: "blocks-origin",
					label: T("Origin"),
					className: "items-start py-0.5 [&>label]:leading-6"
				},
				{
					handle: "perspective",
					type: "text",
					component: "blocks-value",
					label: T("Perspective"),
					prefixIcon: "perspective",
					placeholder: "none",
					keywords: ["none"]
				}
			]
		})
	});
}
// admin/src/builder/design/Transition.tsx
var Ws = () => [
	{
		value: "transition",
		label: T("Colors, Opacity, Shadow and Transform")
	},
	{
		value: "transition-all",
		label: T("Everything")
	},
	{
		value: "transition-colors",
		label: T("Colors")
	},
	{
		value: "transition-transform",
		label: T("Transform")
	},
	{
		value: "transition-opacity",
		label: T("Opacity")
	},
	{
		value: "transition-shadow",
		label: T("Shadow")
	}
], Gs = [
	"transition-property",
	"--tw-duration",
	"--tw-ease",
	"transition-delay"
];
function Ks({ s: e }) {
	let t = gn(), n = e.value("transitionProperty"), r = Ws(), i = n === void 0 ? void 0 : r.find((t) => e.engine?.value(t.value, "transition-property") === n)?.value, a = (t, n, r) => e.swap(t, r && e.engine ? mt(e.engine, n, r, "ms") : null);
	return /* @__PURE__ */ H(go, {
		s: e,
		group: "transition",
		title: T("Transition"),
		open: !!n,
		empty: !n,
		children: n ? /* @__PURE__ */ H(Q, {
			s: e,
			fields: [
				{
					handle: "property",
					type: "select",
					size: "sm",
					label: T("Animate"),
					options: r,
					markers: ["transition-property"],
					reset: () => e.swap(Gs, null),
					get: () => i,
					set: (t) => e.swap(t ? "transition-property" : Gs, t || null)
				},
				{
					handle: "timing",
					type: "group",
					component: "blocks-group",
					label: T("Duration"),
					markers: ["--tw-duration", "transition-delay"],
					get: () => ({
						duration: e.value("--tw-duration"),
						delay: e.value("transitionDelay")
					}),
					set: (t) => t.duration === e.value("--tw-duration") ? a("transition-delay", "delay", t.delay) : a("--tw-duration", "duration", t.duration),
					fields: [{
						handle: "duration",
						type: "text",
						component: "blocks-value",
						label: T("Duration"),
						unit: "ms",
						step: 10,
						min: 0,
						prefixIcon: "timer",
						placeholder: "150"
					}, {
						handle: "delay",
						type: "text",
						component: "blocks-value",
						label: T("Delay"),
						unit: "ms",
						step: 10,
						min: 0,
						prefixIcon: "pause",
						placeholder: T("Delay")
					}]
				},
				{
					handle: "ease",
					type: "text",
					component: "ease",
					label: T("Curve"),
					markers: ["--tw-ease"],
					get: () => e.value("--tw-ease"),
					set: (t) => e.swap("--tw-ease", t && e.engine ? mt(e.engine, "ease", t, "number") : null),
					options: [
						...t.of("ease").map((e) => ({
							value: e.ref,
							label: e.name,
							curve: e.value
						})),
						{
							value: "linear",
							label: T("Linear")
						},
						{
							value: "cubic-bezier(0.2, 0.8, 0.2, 1)",
							label: T("Smooth Out")
						},
						{
							value: "cubic-bezier(0.65, 0, 0.35, 1)",
							label: T("Smooth In-Out")
						},
						{
							value: "cubic-bezier(0.34, 1.56, 0.64, 1)",
							label: T("Overshoot")
						}
					]
				}
			]
		}) : /* @__PURE__ */ H(P, {
			variant: "ghost",
			icon: "plus",
			disabled: !e.engine,
			onClick: () => e.swap("transition-property", "transition"),
			className: "w-full !text-xs !font-normal !text-muted hover:!text-ink",
			children: T("Animate State Changes")
		})
	});
}
// admin/src/builder/design/Typography.tsx
var qs = () => ({
	100: T("Thin 100"),
	200: T("Extra Light 200"),
	300: T("Light 300"),
	400: T("Regular 400"),
	500: T("Medium 500"),
	600: T("Semibold 600"),
	700: T("Bold 700"),
	800: T("Extra Bold 800"),
	900: T("Black 900")
}), Js = "-webkit-text-stroke";
function Ys({ s: e, prose: t }) {
	let n = gn(), r = qs(), i = [
		"fontFamily",
		"fontSize",
		"fontWeight",
		"lineHeight",
		"letterSpacing",
		"color",
		"textAlign",
		"textTransform",
		"textDecorationLine",
		"fontStyle",
		"textWrap",
		"textOverflow",
		"-webkit-line-clamp",
		"textShadow",
		Js
	].some((t) => e.value(t)), a = Za(e.value(Js) ?? ""), o = {
		width: a.find((e) => /^-?[\d.]/.test(e)),
		color: a.find((e) => !/^-?[\d.]/.test(e))
	}, s = e.value("textOverflow") === "ellipsis" && e.value("whiteSpace") === "nowrap";
	return /* @__PURE__ */ U(go, {
		s: e,
		group: "typography",
		title: T("Typography"),
		empty: !i && !t?.on,
		children: [
			t && /* @__PURE__ */ H(Z, {
				fields: [{
					handle: "prose",
					type: "toggle",
					label: T("Prose")
				}],
				values: { prose: t.on },
				onChange: (e, n) => t.onChange(!!n)
			}),
			/* @__PURE__ */ H(Q, {
				s: e,
				fields: [
					{
						handle: "fontFamily",
						type: "select",
						size: "sm",
						label: T("Font"),
						placeholder: T("Inherit"),
						options: n.of("font").map((e) => ({
							value: e.ref,
							label: `${e.name} · ${e.value.split(",")[0].replace(/["']/g, "")}`
						}))
					},
					{
						handle: "fontWeight",
						type: "select",
						size: "sm",
						label: T("Weight"),
						placeholder: T("Inherit"),
						options: n.of("weight").map((e) => ({
							value: e.ref,
							label: r[e.value] ?? `${e.name} · ${e.value}`
						}))
					},
					{
						handle: "fontSize",
						type: "text",
						component: "blocks-value",
						label: T("Size"),
						group: "text",
						prefixIcon: "richtext",
						placeholder: T("Inherit"),
						units: [
							"px",
							"rem",
							"em",
							"%",
							"vw"
						]
					},
					{
						handle: "lineHeight",
						type: "text",
						component: "blocks-value",
						label: T("Line Height"),
						group: "leading",
						prefixIcon: "height",
						unit: "",
						step: .05,
						placeholder: T("Inherit"),
						title: T("Line Height (1.2 = 120%)")
					},
					{
						handle: "letterSpacing",
						type: "text",
						component: "blocks-value",
						label: T("Letter Spacing"),
						group: "tracking",
						prefixIcon: "spacing",
						unit: "em",
						units: ["em", "px"],
						step: .005,
						placeholder: "0"
					},
					{
						handle: "color",
						type: "color",
						component: "blocks-color",
						label: T("Color"),
						placeholder: T("Inherit")
					},
					{
						handle: "textAlign",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: T("Align"),
						placeholder: "left",
						options: [
							{
								value: "left",
								icon: "align-left",
								title: T("Left")
							},
							{
								value: "center",
								icon: "align-center",
								title: T("Center")
							},
							{
								value: "right",
								icon: "align-right",
								title: T("Right")
							},
							{
								value: "justify",
								icon: "align-justify",
								title: T("Justify||text")
							}
						]
					},
					{
						handle: "fontStyle",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: T("Style"),
						placeholder: "normal",
						options: [{
							value: "normal",
							icon: "text",
							title: T("Upright")
						}, {
							value: "italic",
							icon: "italic",
							title: T("Italic")
						}]
					},
					{
						handle: "textDecorationLine",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: T("Decoration"),
						placeholder: "none",
						options: [
							{
								value: "none",
								icon: "close",
								title: T("No Decoration")
							},
							{
								value: "underline",
								icon: "underline",
								title: T("Underline")
							},
							{
								value: "line-through",
								icon: "strike",
								title: T("Strike Through")
							}
						]
					},
					{
						handle: "textTransform",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: T("Case"),
						placeholder: "none",
						options: [
							{
								value: "none",
								icon: "close",
								title: T("As Typed")
							},
							{
								value: "uppercase",
								label: "AA",
								title: T("Uppercase")
							},
							{
								value: "capitalize",
								label: "Aa",
								title: T("Capitalize")
							},
							{
								value: "lowercase",
								label: "aa",
								title: T("Lowercase")
							}
						]
					},
					{
						handle: "textWrap",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: T("Wrap"),
						options: [
							{
								value: "balance",
								label: T("Balance")
							},
							{
								value: "pretty",
								label: T("Pretty")
							},
							{
								value: "nowrap",
								label: T("None")
							}
						]
					},
					{
						handle: "lineClamp",
						type: "text",
						component: "blocks-value",
						label: T("Max Lines"),
						unit: "",
						min: 1,
						placeholder: T("All"),
						prefixIcon: "list-tree",
						markers: ["-webkit-line-clamp"],
						get: () => e.value("-webkit-line-clamp"),
						set: (t) => e.swap(["-webkit-line-clamp", "text-overflow"], t && e.engine?.valid(`line-clamp-${t}`) ? `line-clamp-${t}` : null)
					},
					{
						handle: "truncate",
						type: "toggle",
						size: "sm",
						label: T("Truncate"),
						get: () => s,
						set: (t) => e.swap(["text-overflow", "-webkit-line-clamp"], t ? "truncate" : null)
					}
				]
			}),
			/* @__PURE__ */ H(Q, {
				s: e,
				bare: !0,
				fields: [{
					handle: "textShadow",
					type: "text",
					component: "blocks-shadows",
					kind: "text",
					label: T("Text Shadow")
				}]
			}),
			/* @__PURE__ */ H(Q, {
				s: e,
				fields: [{
					handle: "stroke",
					type: "group",
					component: "blocks-group",
					label: T("Text Stroke"),
					keys: [Js],
					get: () => o,
					set: (t) => {
						let n = {
							...o,
							...no(o, t)
						};
						e.set(Js, n.width ? `${n.width} ${n.color ?? "currentColor"}` : null);
					},
					fields: [{
						handle: "width",
						type: "text",
						component: "blocks-value",
						label: T("Width"),
						prefixIcon: "edit",
						placeholder: "0",
						min: 0,
						step: .5,
						className: "!flex-none w-[72px]"
					}, {
						handle: "color",
						type: "color",
						component: "blocks-color",
						label: T("Color"),
						placeholder: T("Text Color")
					}]
				}]
			})
		]
	});
}
// admin/src/builder/design/DesignPanel.tsx
var Xs = [
	"layout",
	"position",
	"size",
	"spacing",
	"typography",
	"fill",
	"border",
	"effects",
	"transform",
	"transition"
];
function Zs({ s: e, groups: t = Xs, container: n = !0, parentDisplay: r, media: i, prose: a }) {
	let o = (e) => t.includes(e);
	return /* @__PURE__ */ U(Ne, { children: [
		o("layout") && n && /* @__PURE__ */ H(hs, { s: e }),
		r && /flex|grid/.test(r) && /* @__PURE__ */ H(gs, {
			s: e,
			parentDisplay: r
		}),
		o("position") && /* @__PURE__ */ H(_s, { s: e }),
		o("size") && /* @__PURE__ */ H(ys, {
			s: e,
			media: i
		}),
		o("spacing") && /* @__PURE__ */ H(ws, { s: e }),
		o("typography") && /* @__PURE__ */ H(Ys, {
			s: e,
			prose: a
		}),
		o("fill") && /* @__PURE__ */ H(us, { s: e }),
		o("border") && /* @__PURE__ */ H(Eo, { s: e }),
		o("effects") && /* @__PURE__ */ H(Lo, { s: e }),
		o("transform") && /* @__PURE__ */ H(Us, { s: e }),
		o("transition") && /* @__PURE__ */ H(Ks, { s: e }),
		t.length > 1 && /* @__PURE__ */ H(vo, { s: e })
	] });
}
function Qs({ node: t }) {
	let { types: n, store: r, readOnly: i } = G(), a = mn(), o = n.get(t.type), s = Xa(t), l = K(r, (e) => e.state), u = K(r, (e) => c(e.nodes, t.id)), d = K(r, (n) => e(n.nodes, t.id)), f = A(() => {
		if (u) return ft(a.engine, qe(u.class), s.screen, [], () => {}).value("display") ?? (u.type === "stack" || u.type === "columns" || u.type === "grid" ? "flex" : void 0);
	}, [
		u,
		a.engine,
		s.screen
	]), p = t.type === "outlet" && !t.props?.wrap, m = p ? ["typography"] : o?.styles?.length ? o.styles : Xs;
	return t.type === "component" ? /* @__PURE__ */ H("p", {
		className: "m-0 p-4 text-xs text-muted",
		children: T("Edit the component to change its shared design.")
	}) : /* @__PURE__ */ U("div", { children: [
		!a.engine && !a.loading && /* @__PURE__ */ H("div", {
			className: "border-b border-border px-4 py-3",
			children: /* @__PURE__ */ H(he, {
				tone: "warning",
				title: T("The site’s stylesheet could not be read"),
				action: /* @__PURE__ */ H(_, {
					to: "/design/colors",
					className: "shrink-0 text-xs text-text",
					children: T("Open Design")
				})
			})
		}),
		/* @__PURE__ */ H("div", {
			className: "sticky top-0 z-raised bg-surface",
			children: /* @__PURE__ */ H(Vs, {
				s,
				site: a.classes,
				source: a.source,
				disabled: i,
				state: {
					classes: s.classes,
					engine: a.engine,
					state: l,
					onState: r.setStyleState,
					states: jt(t, d)
				}
			})
		}),
		/* @__PURE__ */ H(Zs, {
			s,
			groups: m,
			container: !!o?.children || t.type === "repeat",
			parentDisplay: p ? void 0 : f,
			media: [
				"image",
				"video",
				"embed"
			].includes(t.type),
			prose: o?.fields?.some((e) => e.handle === "prose") ? {
				on: !!t.props?.prose,
				onChange: (e) => r.updateProps(t.id, { prose: e || void 0 }, `inspector:${t.id}:prose`)
			} : void 0
		})
	] });
}
// admin/src/builder/logic/LogicPanel.tsx
var $s = () => [
	{
		value: "click",
		label: T("Click")
	},
	{
		value: "mouseenter",
		label: T("Pointer Enters")
	},
	{
		value: "mouseleave",
		label: T("Pointer Leaves")
	},
	{
		value: "focus",
		label: T("Gets Focus")
	},
	{
		value: "blur",
		label: T("Loses Focus")
	},
	{
		value: "input",
		label: T("Typing")
	},
	{
		value: "change",
		label: T("Value Changes")
	},
	{
		value: "submit",
		label: T("Form Submit")
	},
	{
		value: "keydown",
		label: T("Key Pressed")
	},
	{
		value: "enter",
		label: T("Scrolls into View")
	},
	{
		value: "leave",
		label: T("Scrolls Out of View")
	},
	{
		value: "scroll",
		label: T("Page Scrolls")
	},
	{
		value: "resize",
		label: T("Window Resizes")
	},
	{
		value: "init",
		label: T("Page Loads")
	}
], ec = () => [
	{
		value: "prevent",
		label: T("Prevent Default")
	},
	{
		value: "stop",
		label: T("Stop Propagation")
	},
	{
		value: "outside",
		label: T("Outside This Element")
	},
	{
		value: "window",
		label: T("Anywhere on the Page")
	},
	{
		value: "once",
		label: T("Only Once")
	},
	{
		value: "self",
		label: T("On This Element Only")
	},
	{
		value: "debounce",
		label: T("Debounce")
	}
], tc = () => [
	{
		value: "set",
		label: T("Set State"),
		icon: "edit"
	},
	{
		value: "toggle",
		label: T("Toggle State"),
		icon: "toggle-left"
	},
	{
		value: "add",
		label: T("Add to Number"),
		icon: "plus"
	},
	{
		value: "if",
		label: T("If … Then … Else"),
		icon: "github"
	},
	{
		value: "play",
		label: T("Play Animation"),
		icon: "play"
	},
	{
		value: "scroll",
		label: T("Scroll To"),
		icon: "mouse-scroll"
	},
	{
		value: "fetch",
		label: T("Load Page Part"),
		icon: "external"
	},
	{
		value: "copy",
		label: T("Copy to Clipboard"),
		icon: "copy"
	},
	{
		value: "go",
		label: T("Go to Link"),
		icon: "link-chain"
	},
	{
		value: "theme",
		label: T("Light or Dark Mode"),
		icon: "moon"
	},
	{
		value: "focus",
		label: T("Focus Element"),
		icon: "position"
	},
	{
		value: "lock",
		label: T("Lock Page Scrolling"),
		icon: "lock"
	},
	{
		value: "wait",
		label: T("Wait"),
		icon: "timer"
	},
	{
		value: "dispatch",
		label: T("Send Event"),
		icon: "broadcast"
	},
	{
		value: "run",
		label: T("Expression"),
		icon: "braces"
	}
];
function nc(t) {
	let { store: n } = G(), r = K(n, (n) => e(n.nodes, t.id));
	return [...new Set([...r, t].flatMap((e) => Object.keys(e.logic?.data ?? {})))];
}
function rc(e) {
	let t = e.trim();
	if (t === "true" || t === "false") return t === "true";
	if (t === "" || t === "null") return null;
	if (/^-?\d*\.?\d+$/.test(t)) return Number(t);
	if (/^[[{"]/.test(t)) try {
		return JSON.parse(t);
	} catch {
		return t;
	}
	return t.replace(/^'(.*)'$/, "$1");
}
var ic = (e) => typeof e == "string" ? `'${e}'` : JSON.stringify(e), ac = (e, t, n = {}) => ({
	handle: e,
	type: "text",
	size: "sm",
	commit: "blur",
	label: t,
	mono: !0,
	max: 1e4,
	list: oc,
	placeholder: "open, count > 3, tab === 'a'",
	...n
}), oc = "cms-logic-variables", sc = (e, ...t) => e ? t : [], cc = [
	"aria-expanded",
	"aria-pressed",
	"aria-selected",
	"aria-hidden",
	"aria-current",
	"hidden",
	"disabled",
	"inert",
	"href",
	"src",
	"title",
	"value",
	"tabindex"
];
function lc({ label: e, options: t, value: n, onChange: r }) {
	return /* @__PURE__ */ U("div", {
		className: "flex min-h-7 items-center gap-2",
		children: [/* @__PURE__ */ H(ia, { field: {
			handle: e,
			type: "select",
			label: e
		} }), /* @__PURE__ */ H("span", {
			className: "cms-input flex h-7 min-w-0 flex-1 rounded-sm",
			children: /* @__PURE__ */ H(de, {
				align: "end",
				trigger: /* @__PURE__ */ U(P, {
					variant: "ghost",
					"aria-label": e,
					className: "!h-full min-w-0 flex-1 shrink !justify-start !gap-1.5 !bg-transparent !pl-2 !pr-1.5 text-left !font-normal",
					children: [/* @__PURE__ */ H("span", {
						className: V("min-w-0 flex-1 truncate", !n.length && "text-ghost"),
						children: n.length ? n.join(", ") : T("None")
					}), /* @__PURE__ */ H(I, {
						name: "chevrons-up-down",
						size: 11,
						className: "shrink-0 text-faint"
					})]
				}),
				items: t.length ? t.map((e) => ({
					label: e,
					checked: n.includes(e),
					onSelect: () => r(n.includes(e) ? n.filter((t) => t !== e) : [...n, e])
				})) : [{
					label: T("None"),
					disabled: !0
				}]
			})
		})]
	});
}
var uc = { strip: "[^A-Za-z0-9_-]" }, dc = (e) => e.replace(/^[^A-Za-z_]+/, "").slice(0, 41);
function fc({ node: e }) {
	let { store: t } = G(), n = E("styling-code/list", {}, { staleTime: 3e4 }), r = e.behavior, i = e.code ?? {}, a = (e, ...t) => [.../* @__PURE__ */ new Set([...n.data?.[e] ?? [], ...t.filter((e) => !!e)])], o = (n) => t.updateNode(e.id, { behavior: n && (n.module ?? r?.module) ? {
		...r,
		...n
	} : void 0 }, `behavior:${e.id}`), s = (n, r) => {
		let a = {
			...i,
			[n]: r.length ? r : void 0
		};
		t.updateNode(e.id, { code: a.scripts || a.styles ? a : void 0 });
	}, c = r?.props ?? {};
	return /* @__PURE__ */ U("div", {
		className: V("-mx-1.5 space-y-1 rounded-sm px-1.5 py-1", r && "bg-sunken/60"),
		children: [
			/* @__PURE__ */ H(Z, {
				fields: [{
					handle: "module",
					type: "select",
					size: "sm",
					label: T("Script"),
					placeholder: T("None"),
					options: a("scripts", r?.module),
					status: r ? "own" : void 0,
					reset: () => o(null)
				}, ...sc(r, {
					handle: "when",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: T("Runs"),
					required: !0,
					options: [
						{
							value: "load",
							label: T("On Load")
						},
						{
							value: "visible",
							label: T("In View")
						},
						{
							value: "idle",
							label: T("When Idle")
						}
					]
				})],
				values: {
					module: r?.module,
					when: r?.when ?? "load"
				},
				onChange: (e, t) => o(e === "module" ? t ? { module: String(t) } : null : { when: t === "visible" || t === "idle" ? t : void 0 })
			}),
			r && /* @__PURE__ */ U(Ne, { children: [/* @__PURE__ */ H(ra, {
				title: T("Options"),
				action: /* @__PURE__ */ H(ua, {
					label: T("Add Option"),
					onClick: () => {
						let e = "value", t = 2;
						for (; e in c;) e = `value${t++}`;
						o({ props: {
							...c,
							[e]: ""
						} });
					}
				})
			}), /* @__PURE__ */ H(Z, {
				bare: !0,
				fields: [{
					handle: "props",
					type: "json",
					component: "blocks-pairs",
					className: "items-start",
					label: T("Options"),
					key: uc,
					join: "=",
					item: {
						handle: "value",
						type: "text",
						size: "sm",
						commit: "blur",
						label: T("Value"),
						mono: !0
					}
				}],
				values: { props: Object.fromEntries(Object.entries(c).map(([e, t]) => [e, ic(t)])) },
				onChange: (e, t) => {
					let n = Object.fromEntries(Object.entries(t).map(([e, t]) => [dc(e), e in c && ic(c[e]) === t ? c[e] : rc(t ?? "")]).filter(([e]) => e !== ""));
					o({ props: Object.keys(n).length ? n : void 0 });
				}
			})] }),
			/* @__PURE__ */ H(lc, {
				label: T("Load Scripts"),
				options: a("scripts", ...i.scripts ?? []),
				value: i.scripts ?? [],
				onChange: (e) => s("scripts", e)
			}),
			/* @__PURE__ */ H(lc, {
				label: T("Load Styles"),
				options: a("styles", ...i.styles ?? []),
				value: i.styles ?? [],
				onChange: (e) => s("styles", e)
			})
		]
	});
}
function pc({ node: e }) {
	let { store: t, types: n } = G(), r = e.logic ?? {}, i = nc(e), a = (n) => {
		let i = {
			...r,
			...n
		};
		for (let e of Object.keys(i)) {
			let t = i[e];
			(t === void 0 || t === "" || Array.isArray(t) && t.length === 0 || t && typeof t == "object" && !Array.isArray(t) && Object.keys(t).length === 0) && delete i[e];
		}
		t.updateNode(e.id, { logic: Object.keys(i).length ? i : void 0 }, `logic:${e.id}`);
	}, o = r.data ?? {}, s = [
		"link",
		"button",
		"box"
	].includes(e.type) || (n.get(e.type)?.html ?? "") === "a", c = r.behaviors ?? {}, l = v("site.code") && (!!e.behavior || !!e.code);
	return /* @__PURE__ */ U(Ne, { children: [
		/* @__PURE__ */ H("datalist", {
			id: oc,
			children: [...i, ...i.map((e) => `!${e}`)].map((e) => /* @__PURE__ */ H("option", { value: e }, e))
		}),
		/* @__PURE__ */ H(ta, {
			title: T("State"),
			empty: !r.data,
			open: !!r.data,
			actions: /* @__PURE__ */ H(ua, {
				label: T("Add Variable"),
				onClick: () => {
					let e = "open", t = 1;
					for (; e in o;) e = `value${t++}`;
					a({ data: {
						...o,
						[e]: e !== "open" && ""
					} });
				}
			}),
			children: /* @__PURE__ */ H(Z, {
				bare: !0,
				fields: [{
					handle: "data",
					type: "json",
					component: "blocks-pairs",
					className: "items-start",
					label: T("Variables"),
					key: { strip: "[^a-zA-Z0-9_]" },
					join: "=",
					item: {
						handle: "value",
						type: "text",
						size: "sm",
						commit: "blur",
						label: T("Value"),
						mono: !0
					}
				}],
				values: { data: Object.fromEntries(Object.entries(o).map(([e, t]) => [e, ic(t)])) },
				onChange: (e, t) => a({ data: Object.fromEntries(Object.entries(t).map(([e, t]) => [e, e in o && ic(o[e]) === t ? o[e] : rc(t ?? "")])) })
			})
		}),
		/* @__PURE__ */ U(ta, {
			title: T("Events"),
			empty: !r.on?.length && !r.init?.length,
			open: !!r.on?.length || !!r.init?.length,
			actions: /* @__PURE__ */ H(ua, {
				label: T("Add Event"),
				onClick: () => a({ on: [...r.on ?? [], {
					event: "click",
					actions: []
				}] })
			}),
			children: [
				r.init && /* @__PURE__ */ H(hc, {
					title: T("Page Loads"),
					actions: r.init,
					variables: i,
					node: e,
					onActions: (e) => a({ init: e }),
					onRemove: () => a({ init: void 0 })
				}),
				(r.on ?? []).map((t, n) => {
					let o = (e) => a({ on: r.on.map((t, r) => r === n ? {
						...t,
						...e
					} : t) });
					return /* @__PURE__ */ H(hc, {
						title: /* @__PURE__ */ H(Z, {
							bare: !0,
							className: "min-w-0 flex-1",
							fields: [{
								handle: "trigger",
								type: "group",
								component: "blocks-group",
								label: T("Event"),
								fields: [{
									handle: "event",
									type: "select",
									size: "sm",
									label: T("Event"),
									required: !0,
									options: $s().filter((e) => e.value !== "init")
								}, {
									handle: "key",
									type: "text",
									size: "sm",
									commit: "blur",
									label: T("Keyboard Key"),
									placeholder: "escape",
									mono: !0,
									className: "!w-20 !flex-none",
									if: { event: ["keydown", "keyup"] }
								}]
							}],
							values: { trigger: {
								event: t.event,
								key: t.key
							} },
							onChange: (e, t) => t.event !== "init" && o({
								event: t.event ?? "click",
								key: t.key || void 0
							})
						}),
						mods: t.mods,
						onMods: (e) => o({ mods: e.length ? e : void 0 }),
						actions: t.actions,
						variables: i,
						node: e,
						onActions: (e) => o({ actions: e }),
						onRemove: () => a({ on: r.on.filter((e, t) => t !== n) })
					}, n);
				}),
				!r.init && (r.on?.length ?? 0) > 0 && /* @__PURE__ */ H(la, {
					onClick: () => a({ init: [] }),
					children: T("When the Page Loads")
				})
			]
		}),
		/* @__PURE__ */ U(ta, {
			title: T("Bindings"),
			empty: !r.show && !r.states && !r.text && !r.attrs,
			open: !!(r.show || r.states || r.text || r.attrs),
			children: [
				/* @__PURE__ */ H(Z, {
					fields: [ac("show", T("Show When"), {
						placeholder: T("Always"),
						status: r.show ? "own" : void 0,
						reset: () => a({
							show: void 0,
							transition: void 0
						})
					}), ...sc(r.show, {
						handle: "transition",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: T("Transition"),
						options: [
							{
								value: "none",
								label: T("None")
							},
							{
								value: "fade",
								label: T("Fade")
							},
							{
								value: "scale",
								label: T("Scale")
							},
							{
								value: "collapse",
								label: T("Collapse")
							}
						]
					})],
					values: {
						show: r.show,
						transition: r.transition ?? "none"
					},
					onChange: (e, t) => a(e === "show" ? { show: t || void 0 } : { transition: t && t !== "none" ? t : void 0 })
				}),
				/* @__PURE__ */ H(ra, {
					title: T("States"),
					action: /* @__PURE__ */ H(ua, {
						label: T("Add State"),
						onClick: () => a({ states: {
							...r.states ?? {},
							[Object.keys(r.states ?? {}).length ? `state${Object.keys(r.states ?? {}).length + 1}` : "open"]: i[0] ?? "open"
						} })
					})
				}),
				/* @__PURE__ */ H(Z, {
					bare: !0,
					fields: [{
						handle: "states",
						type: "json",
						component: "blocks-pairs",
						className: "items-start",
						label: T("States"),
						key: {
							prefix: "data-",
							lower: !0,
							strip: "[^a-z0-9-]",
							className: "!w-[38%] !flex-none"
						},
						join: T("when"),
						item: ac("expr", T("When||condition"))
					}],
					values: { states: r.states },
					onChange: (e, t) => a({ states: t })
				}),
				/* @__PURE__ */ H(Z, {
					fields: [ac("text", T("Text"), {
						placeholder: T("As Designed"),
						status: r.text ? "own" : void 0,
						reset: () => a({ text: void 0 })
					})],
					values: { text: r.text },
					onChange: (e, t) => a({ text: t || void 0 })
				}),
				/* @__PURE__ */ H(ra, {
					title: T("Attributes"),
					action: /* @__PURE__ */ H(ua, {
						label: T("Bind Attribute"),
						onClick: () => a({ attrs: {
							...r.attrs ?? {},
							"aria-expanded": i[0] ?? "open"
						} })
					})
				}),
				/* @__PURE__ */ H(Z, {
					bare: !0,
					fields: [{
						handle: "attrs",
						type: "json",
						component: "blocks-pairs",
						className: "items-start",
						label: T("Attributes"),
						key: {
							options: cc,
							className: ""
						},
						item: ac("expr", T("Value"))
					}],
					values: { attrs: r.attrs },
					onChange: (e, t) => a({ attrs: t })
				}),
				e.type === "input" && /* @__PURE__ */ H(Z, {
					fields: [{
						handle: "model",
						type: "select",
						size: "sm",
						label: T("Input Value"),
						placeholder: T("Not kept"),
						options: i,
						status: r.model ? "own" : void 0,
						reset: () => a({ model: void 0 })
					}],
					values: { model: r.model },
					onChange: (e, t) => a({ model: t || void 0 })
				})
			]
		}),
		/* @__PURE__ */ U(ta, {
			title: T("Behaviors"),
			empty: !r.behaviors && !r.component && !l,
			open: !!r.behaviors || !!r.component || l,
			children: [
				/* @__PURE__ */ H(mc, {
					on: !!c.scroll,
					label: T("Scroll States"),
					onToggle: (e) => a({ behaviors: {
						...c,
						scroll: e ? { threshold: 20 } : void 0
					} }),
					fields: [{
						handle: "threshold",
						type: "text",
						component: "blocks-value",
						label: T("After||a distance"),
						unit: "",
						prefix: "px"
					}, {
						handle: "hide",
						type: "toggle",
						size: "sm",
						label: T("Add data-hidden While Scrolling Down")
					}],
					values: {
						threshold: String(c.scroll?.threshold ?? 20),
						hide: !!c.scroll?.hide
					},
					onChange: (e, t) => a({ behaviors: {
						...c,
						scroll: {
							...c.scroll,
							[e]: e === "threshold" ? Number(t ?? 20) : t
						}
					} })
				}),
				/* @__PURE__ */ H(mc, {
					on: !!c.spy,
					label: T("Scroll Spy"),
					onToggle: (e) => a({ behaviors: {
						...c,
						spy: e ? { offset: 96 } : void 0
					} })
				}),
				/* @__PURE__ */ H(mc, {
					on: !!c.group,
					label: T("Hover Group"),
					onToggle: (e) => a({ behaviors: {
						...c,
						group: e || void 0
					} })
				}),
				/* @__PURE__ */ H(mc, {
					on: !!c.menu,
					label: T("Menu"),
					onToggle: (e) => a({ behaviors: {
						...c,
						menu: e ? {} : void 0
					} })
				}),
				/* @__PURE__ */ H(mc, {
					on: !!c.carousel,
					label: T("Carousel"),
					onToggle: (e) => a({ behaviors: {
						...c,
						carousel: e ? {} : void 0
					} })
				}),
				/* @__PURE__ */ H(mc, {
					on: !!c.marquee,
					label: T("Marquee"),
					onToggle: (e) => a({ behaviors: {
						...c,
						marquee: e ? { speed: 60 } : void 0
					} }),
					fields: [
						{
							handle: "speed",
							type: "text",
							component: "blocks-value",
							label: T("Speed"),
							unit: "",
							prefix: "px/s",
							title: T("Pixels per Second")
						},
						{
							handle: "reverse",
							type: "toggle",
							size: "sm",
							label: T("Reverse")
						},
						{
							handle: "pause",
							type: "toggle",
							size: "sm",
							label: T("Pause on Hover")
						}
					],
					values: {
						speed: String(c.marquee?.speed ?? 60),
						reverse: !!c.marquee?.reverse,
						pause: !!c.marquee?.pause
					},
					onChange: (e, t) => a({ behaviors: {
						...c,
						marquee: {
							...c.marquee,
							[e]: e === "speed" ? Number(t ?? 60) : t
						}
					} })
				}),
				v("site.code") && /* @__PURE__ */ H(fc, { node: e }),
				/* @__PURE__ */ H(Z, {
					fields: [{
						handle: "component",
						type: "text",
						size: "sm",
						commit: "blur",
						label: T("Alpine"),
						placeholder: "pricingCalculator",
						mono: !0,
						status: r.component ? "own" : void 0,
						reset: () => a({ component: void 0 })
					}],
					values: { component: r.component },
					onChange: (e, t) => a({ component: String(t ?? "").replace(/[^a-zA-Z0-9_$]/g, "") || void 0 })
				})
			]
		}),
		s && /* @__PURE__ */ H(ta, {
			title: T("Load Into"),
			open: !!r.target,
			empty: !r.target && !r.merge,
			children: /* @__PURE__ */ H(Z, {
				fields: [
					{
						handle: "target",
						type: "json",
						component: "blocks-nodes",
						label: T("Update"),
						exclude: e.id,
						add: T("Element to Update"),
						addValue: e.id
					},
					...sc(r.target, {
						handle: "push",
						type: "toggle",
						size: "sm",
						label: T("Update the Address Bar")
					}),
					{
						handle: "merge",
						type: "select",
						size: "sm",
						label: T("When Loaded"),
						placeholder: T("Replace It"),
						options: [
							{
								value: "replace",
								label: T("Replace It")
							},
							{
								value: "update",
								label: T("Replace What Is Inside")
							},
							{
								value: "append",
								label: T("Add to the End")
							},
							{
								value: "prepend",
								label: T("Add to the Start")
							},
							{
								value: "morph",
								label: T("Morph (Keep State)")
							}
						]
					}
				],
				values: {
					target: r.target,
					push: !!r.push,
					merge: r.merge
				},
				onChange: (e, t) => a({ [e]: e === "push" ? t || void 0 : t ?? void 0 })
			})
		})
	] });
}
function mc({ on: e, label: t, onToggle: n, fields: r, values: i, onChange: a }) {
	return /* @__PURE__ */ U("div", {
		className: V("-mx-1.5 rounded-sm px-1.5 py-1", e && "bg-sunken/60"),
		children: [/* @__PURE__ */ H(Z, {
			fields: [{
				handle: "on",
				type: "toggle",
				size: "sm",
				label: t
			}],
			values: { on: e },
			onChange: (e, t) => n(!!t)
		}), e && r && /* @__PURE__ */ H(Z, {
			className: "mt-1 space-y-1 pl-10",
			fields: r,
			values: i ?? {},
			onChange: a ?? (() => {})
		})]
	});
}
function hc({ title: e, mods: t, onMods: n, actions: r, onActions: i, onRemove: a, variables: o, node: s }) {
	return /* @__PURE__ */ U("div", {
		className: "space-y-1.5 rounded-sm border border-border p-1.5",
		children: [
			/* @__PURE__ */ U("div", {
				className: "flex items-center gap-1",
				children: [
					/* @__PURE__ */ H(I, {
						name: "interactive",
						size: 14,
						className: "shrink-0 text-muted"
					}),
					typeof e == "string" ? /* @__PURE__ */ H("span", {
						className: "min-w-0 flex-1 text-xs font-medium [overflow-wrap:anywhere]",
						children: e
					}) : e,
					n && /* @__PURE__ */ H(de, {
						align: "end",
						trigger: /* @__PURE__ */ H(L, {
							icon: "faders",
							label: T("Event Options"),
							size: "xs",
							active: !!t?.length
						}),
						items: ec().map((e) => ({
							label: e.label,
							checked: t?.includes(e.value),
							onSelect: () => n(t?.includes(e.value) ? t.filter((t) => t !== e.value) : [...t ?? [], e.value])
						}))
					}),
					/* @__PURE__ */ H(da, {
						onClick: a,
						label: T("Remove Event")
					})
				]
			}),
			t && t.length > 0 && /* @__PURE__ */ H("p", {
				className: "m-0 pl-5 text-2xs text-faint [overflow-wrap:anywhere]",
				children: t.map((e) => ec().find((t) => t.value === e)?.label).join(" · ")
			}),
			/* @__PURE__ */ H(gc, {
				actions: r,
				onChange: i,
				variables: o,
				node: s
			})
		]
	});
}
function gc({ actions: e, onChange: t, variables: n, node: r, depth: i = 0 }) {
	let a = (i) => {
		let a = {
			set: {
				do: "set",
				var: n[0] ?? "open",
				value: "true"
			},
			toggle: {
				do: "toggle",
				var: n[0] ?? "open"
			},
			add: {
				do: "add",
				var: n[0] ?? "count",
				value: "1"
			},
			if: {
				do: "if",
				test: n[0] ?? "open",
				then: [],
				else: []
			},
			play: {
				do: "play",
				node: r.id,
				mode: "play"
			},
			scroll: {
				do: "scroll",
				to: "top"
			},
			fetch: {
				do: "fetch",
				url: "/",
				target: []
			},
			copy: {
				do: "copy",
				value: "'Text'"
			},
			go: {
				do: "go",
				url: "/"
			},
			theme: {
				do: "theme",
				mode: "toggle"
			},
			focus: {
				do: "focus",
				node: r.id
			},
			lock: {
				do: "lock",
				on: !0
			},
			wait: {
				do: "wait",
				ms: 300
			},
			dispatch: {
				do: "dispatch",
				event: "changed"
			},
			run: {
				do: "run",
				expr: ""
			}
		};
		t([...e, a[i]]);
	}, o = (n, r) => t(e.map((e, t) => t === n ? {
		...e,
		...r
	} : e));
	return /* @__PURE__ */ U("div", {
		className: V("space-y-1", i > 0 && "border-l border-border pl-2"),
		children: [e.map((a, s) => /* @__PURE__ */ U("div", {
			className: "space-y-1 rounded-md bg-active/60 p-1.5",
			children: [/* @__PURE__ */ U("div", {
				className: "flex items-center gap-1",
				children: [
					/* @__PURE__ */ H(I, {
						name: tc().find((e) => e.value === a.do)?.icon ?? "dot-outline",
						size: 14,
						className: "shrink-0 text-muted"
					}),
					/* @__PURE__ */ H("span", {
						className: "min-w-0 flex-1 text-xs font-medium text-text [overflow-wrap:anywhere]",
						children: tc().find((e) => e.value === a.do)?.label ?? a.do
					}),
					/* @__PURE__ */ H(da, {
						onClick: () => t(e.filter((e, t) => t !== s)),
						label: T("Remove Action")
					})
				]
			}), /* @__PURE__ */ H(vc, {
				action: a,
				onChange: (e) => o(s, e),
				variables: n,
				node: r,
				depth: i
			})]
		}, s)), /* @__PURE__ */ H(de, {
			align: "start",
			trigger: /* @__PURE__ */ H(la, { children: T("Add Action") }),
			items: tc().map((e) => ({
				label: e.label,
				icon: e.icon,
				onSelect: () => a(e.value)
			}))
		})]
	});
}
var _c = (e) => e === "top" || e === "bottom" ? e : e?.startsWith("#") ? "anchor" : "node";
function vc({ action: e, onChange: n, variables: r, node: i, depth: a }) {
	let { store: o } = G(), s = zn(), c = K(o, (n) => e.do === "play" && e.node ? t(n.nodes, e.node) : null), l = {
		handle: "var",
		type: "select",
		size: "sm",
		label: T("Variable"),
		options: r,
		placeholder: T("Variable")
	}, u = (e, t, n = {}) => ({
		handle: e,
		type: "select",
		component: "blocks-node",
		label: t,
		...n
	}), d = (e, t, n) => ({
		handle: e,
		type: "select",
		display: "segmented",
		block: !0,
		size: "sm",
		label: t,
		options: n,
		required: !0
	}), f = [], p = e, m = (e, t) => ({ [e]: t ?? "" });
	switch (e.do) {
		case "set":
		case "add":
			f = [l, ac("value", e.do === "set" ? T("To||set a value") : T("Add||to a number"), { placeholder: e.do === "set" ? "true, 'text', count + 1" : "1" })];
			break;
		case "toggle":
			f = [l];
			break;
		case "if":
			f = [ac("test", T("If"), { placeholder: "open" })];
			break;
		case "play":
			f = [
				u("node", T("Element")),
				{
					handle: "motion",
					type: "select",
					size: "sm",
					label: T("Animation"),
					options: (c?.motion ?? []).map((e) => ({
						value: e.id,
						label: e.name || e.id
					})),
					placeholder: c?.motion?.length ? T("First Animation") : T("No animations on it")
				},
				d("mode", T("Play"), [
					{
						value: "play",
						label: T("Play")
					},
					{
						value: "reverse",
						label: T("Reverse")
					},
					{
						value: "toggle",
						label: T("Toggle")
					},
					{
						value: "restart",
						label: T("Restart")
					}
				])
			], p = {
				...e,
				mode: e.mode ?? "play"
			}, m = (e, t) => e === "node" ? {
				node: t ?? i.id,
				motion: void 0
			} : e === "motion" ? { motion: t ?? void 0 } : { mode: t ?? "play" };
			break;
		case "scroll":
			f = [
				{
					handle: "kind",
					type: "select",
					size: "sm",
					label: T("To"),
					required: !0,
					options: [
						{
							value: "top",
							label: T("Top of Page")
						},
						{
							value: "bottom",
							label: T("Bottom of Page")
						},
						{
							value: "anchor",
							label: T("Section")
						},
						{
							value: "node",
							label: T("Element")
						}
					]
				},
				{
					handle: "anchor",
					type: "select",
					size: "sm",
					label: T("Section"),
					options: s.map((e) => ({
						value: `#${e.id}`,
						label: e.label
					})),
					placeholder: T("Choose a Section"),
					if: { kind: "anchor" }
				},
				u("node", T("Element"), { if: { kind: "node" } }),
				{
					handle: "offset",
					type: "text",
					component: "blocks-value",
					label: T("Offset"),
					unit: "",
					prefix: "px",
					placeholder: "0",
					title: T("Offset in pixels, e.g. a sticky header’s height")
				}
			], p = {
				kind: _c(e.to),
				anchor: e.to,
				node: e.to,
				offset: e.offset ? String(e.offset) : void 0
			}, m = (e, t) => e === "kind" ? { to: t === "anchor" ? `#${s[0]?.id ?? "top"}` : t === "node" ? i.id : t ?? "top" } : e === "anchor" ? { to: t } : e === "node" ? { to: t ?? "top" } : { offset: t ? parseInt(t) : void 0 };
			break;
		case "fetch":
			f = [{
				handle: "url",
				type: "text",
				size: "sm",
				commit: "blur",
				label: T("Page"),
				placeholder: "/blog/page/2",
				mono: !0
			}, {
				handle: "target",
				type: "json",
				component: "blocks-nodes",
				label: T("Update"),
				addValue: i.id
			}];
			break;
		case "copy":
			f = [ac("value", T("Text"), { placeholder: `'${T("Text to Copy")}'` })];
			break;
		case "go":
			f = [{
				handle: "url",
				type: "url",
				component: "link",
				reference: !0,
				size: "sm",
				label: T("Link"),
				anchors: s,
				newTab: !!e.newTab,
				onNewTab: (e) => n({ newTab: e || void 0 })
			}], m = (e, t) => ({ url: t ?? "" });
			break;
		case "theme":
			f = [d("mode", T("Mode"), [
				{
					value: "toggle",
					label: T("Switch||between two")
				},
				{
					value: "light",
					label: T("Light")
				},
				{
					value: "dark",
					label: T("Dark")
				},
				{
					value: "system",
					label: T("System")
				}
			])], p = { mode: e.mode ?? "toggle" };
			break;
		case "focus":
			f = [u("node", T("Element"))], m = (e, t) => ({ node: t ?? void 0 });
			break;
		case "lock":
			f = [d("on", T("Scrolling"), [{
				value: "on",
				label: T("Lock")
			}, {
				value: "off",
				label: T("Unlock")
			}])], p = { on: e.on === !1 ? "off" : "on" }, m = (e, t) => ({ on: t !== "off" });
			break;
		case "wait":
			f = [{
				handle: "ms",
				type: "text",
				component: "blocks-value",
				label: T("Wait"),
				unit: "",
				step: 50,
				min: 0,
				prefix: "ms"
			}], p = { ms: String(e.ms ?? 300) }, m = (e, t) => ({ ms: Number(t ?? 300) });
			break;
		case "dispatch":
			f = [{
				handle: "event",
				type: "text",
				size: "sm",
				commit: "blur",
				label: T("Event"),
				placeholder: "event-name",
				mono: !0
			}, ac("detail", T("Detail"), { placeholder: "detail" })], m = (e, t) => ({ [e]: e === "detail" ? t || void 0 : t ?? "" });
			break;
		case "run":
			f = [ac("expr", T("Run"), { placeholder: "count = count * 2" })];
			break;
		default: return /* @__PURE__ */ H("p", {
			className: V(sa, "h-auto whitespace-pre-wrap font-mono [overflow-wrap:anywhere]"),
			children: JSON.stringify(e)
		});
	}
	return /* @__PURE__ */ U("div", {
		className: "space-y-1",
		children: [/* @__PURE__ */ H(Z, {
			fields: f,
			values: p,
			onChange: (e, t) => n(m(e, t))
		}), e.do === "if" && /* @__PURE__ */ U(Ne, { children: [
			/* @__PURE__ */ H("p", {
				className: "cms-label m-0 pt-1",
				children: T("Then")
			}),
			/* @__PURE__ */ H(gc, {
				actions: e.then ?? [],
				onChange: (e) => n({ then: e }),
				variables: r,
				node: i,
				depth: a + 1
			}),
			/* @__PURE__ */ H("p", {
				className: "cms-label m-0 pt-1",
				children: T("Else")
			}),
			/* @__PURE__ */ H(gc, {
				actions: e.else ?? [],
				onChange: (e) => n({ else: e }),
				variables: r,
				node: i,
				depth: a + 1
			})
		] })]
	});
}
// admin/src/builder/motion/presets.ts
var yc = (e) => ({
	appear: T("Appear"),
	scroll: T("Scroll"),
	hover: T("Hover and Press"),
	loop: T("Loop"),
	load: T("Page Load"),
	event: T("On Event")
})[e], bc = "power3.out", xc = () => [
	{
		name: T("Fade In"),
		group: "appear",
		make: () => ({
			trigger: { type: "appear" },
			steps: [{
				target: "self",
				from: { opacity: 0 },
				duration: .8,
				ease: bc
			}]
		})
	},
	{
		name: T("Fade Up"),
		group: "appear",
		make: () => ({
			trigger: { type: "appear" },
			steps: [{
				target: "self",
				from: {
					opacity: 0,
					y: 32
				},
				duration: .9,
				ease: bc
			}]
		})
	},
	{
		name: T("Slide in from Left"),
		group: "appear",
		make: () => ({
			trigger: { type: "appear" },
			steps: [{
				target: "self",
				from: {
					opacity: 0,
					x: -48
				},
				duration: .9,
				ease: bc
			}]
		})
	},
	{
		name: T("Scale In"),
		group: "appear",
		make: () => ({
			trigger: { type: "appear" },
			steps: [{
				target: "self",
				from: {
					opacity: 0,
					scale: .92
				},
				duration: .8,
				ease: "expo.out"
			}]
		})
	},
	{
		name: T("Blur In"),
		group: "appear",
		make: () => ({
			trigger: { type: "appear" },
			steps: [{
				target: "self",
				from: {
					opacity: 0,
					blur: 16,
					y: 12
				},
				duration: 1,
				ease: bc
			}]
		})
	},
	{
		name: T("Reveal (Wipe Up)"),
		group: "appear",
		make: () => ({
			trigger: { type: "appear" },
			steps: [{
				target: "self",
				from: { clipPath: "inset(100% 0% 0% 0%)" },
				to: { clipPath: "inset(0% 0% 0% 0%)" },
				duration: 1.1,
				ease: "power4.inOut"
			}]
		})
	},
	{
		name: T("Children one by one"),
		group: "appear",
		make: () => ({
			trigger: { type: "appear" },
			steps: [{
				target: "children",
				from: {
					opacity: 0,
					y: 24
				},
				duration: .7,
				ease: bc,
				stagger: .08
			}]
		})
	},
	{
		name: T("Words Rise"),
		group: "appear",
		text: !0,
		make: () => ({
			trigger: { type: "appear" },
			steps: [{
				target: "words",
				from: {
					opacity: 0,
					y: 20
				},
				duration: .7,
				ease: bc,
				stagger: .04
			}]
		})
	},
	{
		name: T("Words Slide Up (Masked)"),
		group: "appear",
		text: !0,
		make: () => ({
			trigger: { type: "appear" },
			steps: [{
				target: "words",
				mask: !0,
				from: { yPercent: 110 },
				duration: .9,
				ease: "expo.out",
				stagger: .04
			}]
		})
	},
	{
		name: T("Parallax"),
		group: "scroll",
		make: () => ({
			trigger: {
				type: "scroll",
				start: "top bottom",
				end: "bottom top"
			},
			steps: [{
				target: "self",
				from: { yPercent: -12 },
				to: { yPercent: 12 },
				ease: "none",
				duration: 1
			}]
		})
	},
	{
		name: T("Zoom While Scrolling"),
		group: "scroll",
		make: () => ({
			trigger: {
				type: "scroll",
				start: "top bottom",
				end: "center center"
			},
			steps: [{
				target: "self",
				from: {
					scale: .85,
					borderRadius: "32px"
				},
				to: {
					scale: 1,
					borderRadius: "0px"
				},
				ease: "none",
				duration: 1
			}]
		})
	},
	{
		name: T("Fade Through"),
		group: "scroll",
		make: () => ({
			trigger: {
				type: "scroll",
				start: "top 90%",
				end: "top 40%"
			},
			steps: [{
				target: "self",
				from: {
					opacity: 0,
					y: 60
				},
				to: {
					opacity: 1,
					y: 0
				},
				ease: "none",
				duration: 1
			}]
		})
	},
	{
		name: T("Highlight Words"),
		group: "scroll",
		text: !0,
		make: () => ({
			trigger: {
				type: "scroll",
				start: "top 80%",
				end: "bottom 50%"
			},
			steps: [{
				target: "words",
				from: { opacity: .15 },
				to: { opacity: 1 },
				ease: "none",
				duration: 1,
				stagger: .1
			}]
		})
	},
	{
		name: T("Rotate While Scrolling"),
		group: "scroll",
		make: () => ({
			trigger: { type: "scroll" },
			steps: [{
				target: "self",
				from: { rotate: -8 },
				to: { rotate: 8 },
				ease: "none",
				duration: 1
			}]
		})
	},
	{
		name: T("Slide Sideways"),
		group: "scroll",
		make: () => ({
			trigger: { type: "scroll" },
			steps: [{
				target: "self",
				from: { xPercent: 10 },
				to: { xPercent: -10 },
				ease: "none",
				duration: 1
			}]
		})
	},
	{
		name: T("Lift"),
		group: "hover",
		make: () => ({
			trigger: { type: "hover" },
			steps: [{
				target: "self",
				to: { y: -6 },
				duration: .3,
				ease: bc
			}]
		})
	},
	{
		name: T("Grow"),
		group: "hover",
		make: () => ({
			trigger: { type: "hover" },
			steps: [{
				target: "self",
				to: { scale: 1.04 },
				duration: .35,
				ease: bc
			}]
		})
	},
	{
		name: T("Zoom Image Inside"),
		group: "hover",
		make: () => ({
			trigger: { type: "hover" },
			steps: [{
				target: "children",
				to: { scale: 1.06 },
				duration: .6,
				ease: bc
			}]
		})
	},
	{
		name: T("Press"),
		group: "hover",
		make: () => ({
			trigger: { type: "press" },
			steps: [{
				target: "self",
				to: { scale: .96 },
				duration: .15,
				ease: "power2.out"
			}]
		})
	},
	{
		name: T("Float"),
		group: "loop",
		make: () => ({
			trigger: { type: "loop" },
			repeat: -1,
			yoyo: !0,
			steps: [{
				target: "self",
				to: { y: -10 },
				duration: 2.2,
				ease: "sine.inOut"
			}]
		})
	},
	{
		name: T("Spin"),
		group: "loop",
		make: () => ({
			trigger: { type: "loop" },
			repeat: -1,
			steps: [{
				target: "self",
				to: { rotate: 360 },
				duration: 12,
				ease: "none"
			}]
		})
	},
	{
		name: T("Pulse"),
		group: "loop",
		make: () => ({
			trigger: { type: "loop" },
			repeat: -1,
			yoyo: !0,
			steps: [{
				target: "self",
				to: { scale: 1.06 },
				duration: 1.2,
				ease: "sine.inOut"
			}]
		})
	},
	{
		name: T("Intro: Fade Up"),
		group: "load",
		make: () => ({
			trigger: { type: "load" },
			steps: [{
				target: "self",
				from: {
					opacity: 0,
					y: 24
				},
				duration: 1,
				ease: bc,
				delay: .1
			}]
		})
	},
	{
		name: T("Intro: Words"),
		group: "load",
		text: !0,
		make: () => ({
			trigger: { type: "load" },
			steps: [{
				target: "words",
				from: {
					opacity: 0,
					y: 40
				},
				duration: .9,
				ease: bc,
				stagger: .05
			}]
		})
	},
	{
		name: T("Intro: Children"),
		group: "load",
		make: () => ({
			trigger: { type: "load" },
			steps: [{
				target: "children",
				from: {
					opacity: 0,
					y: 16
				},
				duration: .8,
				ease: bc,
				stagger: .1
			}]
		})
	},
	{
		name: T("Open (Fade and Scale)"),
		group: "event",
		make: () => ({
			trigger: { type: "event" },
			steps: [{
				target: "self",
				from: {
					opacity: 0,
					scale: .96
				},
				duration: .3,
				ease: bc
			}]
		})
	},
	{
		name: T("Slide in Panel"),
		group: "event",
		make: () => ({
			trigger: { type: "event" },
			steps: [{
				target: "self",
				from: { xPercent: 100 },
				duration: .5,
				ease: "expo.out"
			}, {
				target: "children",
				from: {
					opacity: 0,
					x: 24
				},
				duration: .4,
				ease: bc,
				stagger: .05
			}]
		})
	}
], Sc = () => ({
	appear: {
		label: T("Appear"),
		icon: "eye"
	},
	scroll: {
		label: T("Scroll"),
		icon: "mouse-scroll"
	},
	hover: {
		label: T("Hover"),
		icon: "hand-pointing"
	},
	press: {
		label: T("Press"),
		icon: "hand-tap"
	},
	load: {
		label: T("Page Load"),
		icon: "rocket"
	},
	loop: {
		label: T("Loop"),
		icon: "refresh"
	},
	event: {
		label: T("On Event"),
		icon: "broadcast"
	}
}), Cc = () => ({
	opacity: T("Opacity"),
	x: T("Move X"),
	y: T("Move Y"),
	xPercent: T("Move X %"),
	yPercent: T("Move Y %"),
	z: T("Move Z"),
	scale: T("Scale"),
	scaleX: T("Scale X"),
	scaleY: T("Scale Y"),
	rotate: T("Rotate"),
	rotateX: T("Rotate X (3D)"),
	rotateY: T("Rotate Y (3D)"),
	skewX: T("Skew X"),
	skewY: T("Skew Y"),
	blur: T("Blur"),
	brightness: T("Brightness"),
	grayscale: T("Grayscale"),
	clipPath: T("Clip Path"),
	backgroundColor: T("Fill"),
	color: T("Text Color"),
	borderColor: T("Border Color"),
	borderRadius: T("Radius"),
	boxShadow: T("Shadow"),
	letterSpacing: T("Letter Spacing"),
	transformOrigin: T("Origin"),
	perspective: T("Perspective")
}), wc = () => [
	{
		value: "power3.out",
		label: T("Smooth Out")
	},
	{
		value: "expo.out",
		label: T("Expo Out")
	},
	{
		value: "power4.inOut",
		label: T("Smooth In-Out")
	},
	{
		value: "power2.out",
		label: T("Gentle Out")
	},
	{
		value: "back.out(1.7)",
		label: T("Overshoot")
	},
	{
		value: "elastic.out(1, 0.4)",
		label: T("Elastic")
	},
	{
		value: "bounce.out",
		label: T("Bounce")
	},
	{
		value: "sine.inOut",
		label: T("Sine In-Out")
	},
	{
		value: "power2.in",
		label: T("Ease In")
	},
	{
		value: "none",
		label: T("Linear")
	},
	{
		value: "cubic-bezier(0.2, 0.8, 0.2, 1)",
		label: T("Signature Ease")
	}
], Tc = (e, t, n = {}) => ({
	handle: e,
	type: "text",
	component: "blocks-value",
	label: t,
	unit: "s",
	units: ["s"],
	step: .05,
	min: 0,
	placeholder: "0",
	...n
}), Ec = /^\d{1,5}(\.\d{1,2})?(px|rem|vh|svh|lvh|dvh)$/, Dc = [
	"vh",
	"svh",
	"lvh",
	"dvh",
	"px",
	"rem"
], Oc = (e, ...t) => e ? t : [], kc = [
	"heading",
	"paragraph",
	"link",
	"button",
	"quote"
], Ac = (e) => {
	let t = e.length + 1;
	for (; e.some((e) => e.id === `m${t}`);) t++;
	return `m${t}`;
}, jc = (e = "self") => e.startsWith("#") ? T("Another Element") : {
	self: T("This Element"),
	children: T("Children"),
	words: T("Words"),
	lines: T("Lines||of text"),
	chars: T("Letters")
}[e] ?? e;
function Mc({ node: e }) {
	let { store: t } = G(), n = e.motion ?? [], [r, i] = M(n[0]?.id ?? null), a = (n) => t.updateNode(e.id, { motion: n.length ? n : void 0 }, `motion:${e.id}`), o = (e, t) => a(n.map((n) => n.id === e ? {
		...n,
		...t
	} : n)), s = kc.includes(e.type), c = Sc(), l = (t) => {
		let r = Ac(n), o = t ? {
			id: r,
			name: t.name,
			...t.make()
		} : {
			id: r,
			name: T("Custom"),
			trigger: { type: "appear" },
			steps: [{
				target: "self",
				from: {
					opacity: 0,
					y: 24
				},
				duration: .8,
				ease: "power3.out"
			}]
		};
		a([...n, o]), i(r), requestAnimationFrame(() => ii.emit("preview-motion", {
			node: e.id,
			motion: o
		}));
	}, u = xc(), d = [...new Set(u.map((e) => e.group))];
	return /* @__PURE__ */ H(ta, {
		title: T("Animations"),
		empty: n.length === 0,
		actions: /* @__PURE__ */ H(de, {
			align: "end",
			trigger: /* @__PURE__ */ H(L, {
				icon: "plus",
				label: T("Add Animation"),
				size: "xs"
			}),
			items: [
				...d.flatMap((e) => [{
					label: yc(e),
					heading: !0
				}, ...u.filter((t) => t.group === e && (!t.text || s)).map((e) => ({
					label: e.name,
					icon: c[e.make().trigger.type]?.icon,
					onSelect: () => l(e)
				}))]),
				{
					separator: !0,
					label: ""
				},
				{
					label: T("Custom Animation"),
					icon: "animated",
					onSelect: () => l()
				}
			]
		}),
		children: n.map((t) => /* @__PURE__ */ U("div", {
			className: V("rounded-sm border", r === t.id ? "border-border-strong" : "border-border"),
			children: [/* @__PURE__ */ U("div", {
				className: "flex h-8 items-center gap-1.5 pl-2 pr-1",
				children: [
					/* @__PURE__ */ H(I, {
						name: c[t.trigger.type]?.icon ?? "animated",
						size: 13,
						className: "shrink-0 text-muted"
					}),
					/* @__PURE__ */ U(P, {
						variant: "ghost",
						onClick: () => i(r === t.id ? null : t.id),
						"aria-expanded": r === t.id,
						className: "min-w-0 flex-1 shrink !justify-start !gap-1.5 !bg-transparent !px-0 text-left !text-xs",
						children: [/* @__PURE__ */ H("span", {
							className: "truncate font-medium text-ink",
							children: t.name || c[t.trigger.type]?.label
						}), /* @__PURE__ */ H("span", {
							className: "shrink-0 font-normal text-faint",
							children: c[t.trigger.type]?.label
						})]
					}),
					/* @__PURE__ */ H(B, {
						content: T("Preview Animation"),
						children: /* @__PURE__ */ H(L, {
							icon: "play",
							label: T("Preview Animation"),
							title: void 0,
							size: "xs",
							onClick: () => ii.emit("preview-motion", {
								node: e.id,
								motion: t
							})
						})
					}),
					/* @__PURE__ */ H(da, {
						onClick: () => a(n.filter((e) => e.id !== t.id)),
						label: T("Remove Animation")
					})
				]
			}), r === t.id && /* @__PURE__ */ H(Nc, {
				node: e,
				motion: t,
				onChange: (e) => o(t.id, e)
			})]
		}, t.id))
	});
}
function Nc({ node: e, motion: t, onChange: n }) {
	let [r, i] = M(0), a = Sc(), o = t.trigger, s = (e) => n({ trigger: {
		...o,
		...e
	} }), c = (e, r) => n({ steps: t.steps.map((t, n) => n === e ? {
		...t,
		...r
	} : t) }), l = o.type === "loop" || o.type === "load", u = Math.min(r, t.steps.length - 1), d = [{
		handle: "name",
		type: "text",
		size: "sm",
		commit: "blur",
		label: T("Name")
	}, {
		handle: "type",
		type: "select",
		size: "sm",
		label: T("Trigger"),
		required: !0,
		options: Object.entries(a).map(([e, t]) => ({
			value: e,
			label: t.label
		}))
	}], f = [
		...Oc(o.type === "appear", {
			handle: "start",
			type: "select",
			size: "sm",
			label: T("Starts"),
			placeholder: T("A little into view"),
			options: [
				{
					value: "top 95%",
					label: T("As soon as it peeks in")
				},
				{
					value: "top 85%",
					label: T("A little into view")
				},
				{
					value: "top 65%",
					label: T("A third into view")
				},
				{
					value: "center center",
					label: T("At the Center")
				}
			]
		}, {
			handle: "replay",
			type: "toggle",
			size: "sm",
			label: T("Reverse When Scrolled Back")
		}),
		...Oc(o.type === "scroll", {
			handle: "start",
			type: "select",
			size: "sm",
			label: T("Begins"),
			placeholder: T("Enters the Screen"),
			options: [
				{
					value: "top bottom",
					label: T("Enters the Screen")
				},
				{
					value: "top 80%",
					label: T("Top at 80%")
				},
				{
					value: "top center",
					label: T("Top at Center")
				},
				{
					value: "top top",
					label: T("Top at Top")
				},
				{
					value: "center center",
					label: T("Centered")
				}
			]
		}, {
			handle: "end",
			type: "select",
			size: "sm",
			label: T("Ends"),
			placeholder: T("Leaves the Screen"),
			options: [
				{
					value: "bottom top",
					label: T("Leaves the Screen")
				},
				{
					value: "center center",
					label: T("Centered")
				},
				{
					value: "top top",
					label: T("Top at Top")
				},
				{
					value: "bottom center",
					label: T("Bottom at Center")
				},
				{
					value: "bottom bottom",
					label: T("Bottom at Bottom")
				}
			]
		}, {
			handle: "pin",
			type: "text",
			component: "blocks-value",
			label: T("Pin Distance"),
			unit: "vh",
			units: Dc,
			step: 10,
			min: 0,
			max: 99999,
			placeholder: "0"
		}, Tc("scrub", T("Smoothing"), { max: 3 })),
		...Oc(l, {
			handle: "repeat",
			type: "select",
			display: "segmented",
			block: !0,
			size: "sm",
			label: T("Repeat||again"),
			required: !0,
			options: [
				{
					value: "0",
					label: T("Once")
				},
				{
					value: "1",
					label: T("Twice")
				},
				{
					value: "-1",
					label: T("Forever||repeat")
				}
			]
		}, {
			handle: "yoyo",
			type: "toggle",
			size: "sm",
			label: T("Back and Forth")
		}, {
			handle: "hold",
			type: "number",
			size: "sm",
			label: T("Loop as a Timeline, Resting (s)"),
			if: { repeat: "-1" }
		}),
		...Oc(o.type === "scroll" || o.type === "appear", {
			handle: "watch",
			type: "select",
			component: "blocks-node",
			label: T("Watch"),
			placeholder: T("This Element"),
			exclude: e.id
		})
	], p = t.on ?? [
		"desktop",
		"tablet",
		"mobile"
	], m = {
		name: t.name ?? "",
		type: o.type,
		start: o.start,
		end: o.end,
		pin: o.pin,
		scrub: o.scrub === void 0 ? void 0 : `${o.scrub}s`,
		replay: o.once === !1,
		repeat: String(t.repeat ?? (o.type === "loop" ? -1 : 0)),
		yoyo: !!t.yoyo,
		hold: t.hold,
		watch: o.node?.slice(1)
	}, h = (e, t) => {
		e === "name" ? n({ name: t ?? "" }) : e === "type" ? t && s({ type: t }) : e === "start" || e === "end" ? s({ [e]: t ?? void 0 }) : e === "pin" ? s({ pin: typeof t == "string" && Ec.test(t.trim()) && parseFloat(t) > 0 ? t.trim() : void 0 }) : e === "scrub" ? s({ scrub: parseFloat(t) > 0 ? Math.min(3, Math.max(.05, parseFloat(t))) : void 0 }) : e === "replay" ? s({ once: !t && void 0 }) : e === "repeat" ? n({ repeat: Number(t ?? 0) }) : e === "yoyo" ? n({ yoyo: t || void 0 }) : e === "hold" ? n({ hold: t === "" || t == null ? void 0 : Number(t) }) : e === "watch" && s({ node: t ? `#${t}` : void 0 });
	}, g = () => {
		n({ steps: [...t.steps, {
			target: "children",
			from: {
				opacity: 0,
				y: 16
			},
			duration: .5,
			ease: "power3.out",
			stagger: .06
		}] }), i(t.steps.length);
	};
	return /* @__PURE__ */ U("div", {
		className: "space-y-2 border-t border-border p-2",
		children: [
			/* @__PURE__ */ H(Z, {
				fields: [...d, ...f],
				values: m,
				onChange: h
			}),
			/* @__PURE__ */ U("div", {
				className: "flex min-h-7 items-center",
				children: [/* @__PURE__ */ H(ia, { field: {
					handle: "on",
					type: "select",
					label: T("Plays On")
				} }), /* @__PURE__ */ H("div", {
					role: "group",
					"aria-label": T("Plays On"),
					className: "flex gap-0.5",
					children: [
						[
							"desktop",
							"monitor",
							T("Desktop")
						],
						[
							"tablet",
							"tablet",
							T("Tablet")
						],
						[
							"mobile",
							"phone",
							T("Phone")
						]
					].map(([e, t, r]) => /* @__PURE__ */ H(L, {
						icon: t,
						label: r,
						size: "xs",
						"aria-pressed": p.includes(e),
						onClick: () => {
							let t = p.includes(e) ? p.filter((t) => t !== e) : [...p, e];
							t.length && n({ on: t.length === 3 ? void 0 : t });
						}
					}, e))
				})]
			}),
			o.type === "event" && /* @__PURE__ */ U("p", {
				className: "m-0 flex h-7 items-center gap-2 text-xs",
				children: [/* @__PURE__ */ H("span", {
					className: "w-[88px] shrink-0 text-muted",
					children: T("Animation ID")
				}), /* @__PURE__ */ H("code", {
					className: "select-all font-mono text-text",
					children: t.id
				})]
			}),
			/* @__PURE__ */ H(Ic, {
				steps: t.steps,
				active: u,
				onSelect: i,
				onChange: c,
				onAdd: g
			}),
			t.steps[u] && /* @__PURE__ */ H(Lc, {
				node: e,
				step: t.steps[u],
				index: u,
				count: t.steps.length,
				onChange: (e) => c(u, e),
				onRemove: () => {
					n({ steps: t.steps.filter((e, t) => t !== u) }), i(Math.max(0, u - 1));
				}
			}, u)
		]
	});
}
function Pc(e) {
	let t = 0;
	return e.map((e) => {
		let n = e.at ?? t, r = n + (e.delay ?? 0), i = e.duration ?? .6, a = (e.stagger ?? 0) * 3;
		return t = r + i + a, {
			base: n,
			start: r,
			duration: i,
			spread: a
		};
	});
}
var Fc = (e) => Math.max(0, Math.round(e * 20) / 20);
function Ic({ steps: e, active: t, onSelect: n, onChange: r, onAdd: i }) {
	let a = Pc(e), o = Math.max(.5, ...a.map((e) => e.start + e.duration + e.spread)), s = j(null), c = s.current?.total ?? Math.ceil(o * 2 + .25) / 2, l = c <= 1.5 ? .25 : c <= 4 ? .5 : c <= 10 ? 1 : 2, u = Array.from({ length: Math.floor(c / l) + 1 }, (e, t) => t * l), d = (e) => `${e / c * 100}%`, f = (t, i, a) => {
		t.preventDefault(), t.stopPropagation(), n(i);
		let o = t.currentTarget.closest("[data-track]");
		if (!o) return;
		s.current = {
			total: c,
			width: o.clientWidth
		};
		let l = t.clientX, u = e[i], d = a === "move" ? u.at === void 0 ? u.delay ?? 0 : u.at : u.duration ?? .6, f = (e) => {
			let t = (e.clientX - l) / s.current.width * s.current.total;
			a === "end" ? r(i, { duration: Math.max(.05, Fc(d + t)) }) : u.at === void 0 ? r(i, { delay: Fc(d + t) || void 0 }) : r(i, { at: Fc(d + t) });
		}, p = () => {
			window.removeEventListener("pointermove", f), window.removeEventListener("pointerup", p), s.current = null;
		};
		window.addEventListener("pointermove", f), window.addEventListener("pointerup", p);
	};
	return /* @__PURE__ */ U("div", {
		className: "rounded-md bg-active/60 py-1.5",
		children: [
			/* @__PURE__ */ U("div", {
				className: "mb-1 flex items-end pr-2",
				children: [/* @__PURE__ */ H("span", {
					className: "w-24 shrink-0 pl-2 text-2xs font-medium text-faint",
					children: T("Timeline")
				}), /* @__PURE__ */ H("div", {
					className: "relative h-3 flex-1",
					children: u.filter((e, t) => u.length <= 5 || t % 2 == 0).map((e) => /* @__PURE__ */ H("span", {
						className: "absolute -translate-x-1/2 font-mono text-2xs leading-none text-faint first:translate-x-0 last:-translate-x-full",
						style: { left: d(e) },
						children: e === 0 ? "0" : `${e}s`
					}, e))
				})]
			}),
			e.map((e, i) => {
				let o = a[i];
				return /* @__PURE__ */ U("div", {
					className: V("flex h-7 items-center pr-2", i === t && "bg-focus-soft"),
					children: [/* @__PURE__ */ H(P, {
						variant: "ghost",
						size: "xs",
						onClick: () => n(i),
						className: V("w-24 !justify-start !bg-transparent !pl-2 !pr-0 text-left !text-2xs", i === t ? "!font-medium !text-ink" : "!font-normal !text-muted hover:!text-text"),
						children: /* @__PURE__ */ H("span", {
							className: "truncate",
							children: jc(e.target)
						})
					}), /* @__PURE__ */ U("div", {
						"data-track": !0,
						className: "relative h-full flex-1",
						children: [
							u.map((e) => /* @__PURE__ */ H("span", {
								className: "absolute inset-y-0 w-px bg-border/70",
								style: { left: d(e) }
							}, e)),
							/* @__PURE__ */ U("div", {
								role: "slider",
								tabIndex: 0,
								"aria-label": T("Step {n}", { n: i + 1 }),
								"aria-valuenow": o.start,
								"aria-valuetext": T("Starts at {start}s, runs {duration}s", {
									start: o.start.toFixed(2),
									duration: o.duration.toFixed(2)
								}),
								onPointerDown: (e) => f(e, i, "move"),
								onKeyDown: (t) => {
									if (t.key !== "ArrowLeft" && t.key !== "ArrowRight") return;
									t.preventDefault();
									let n = t.key === "ArrowRight" ? .05 : -.05;
									t.shiftKey ? r(i, { duration: Math.max(.05, Fc((e.duration ?? .6) + n)) }) : e.at === void 0 ? r(i, { delay: Fc((e.delay ?? 0) + n) || void 0 }) : r(i, { at: Fc(e.at + n) });
								},
								className: V("cms-focus-ring group/bar absolute top-1 flex h-4 cursor-grab items-center rounded-xs active:cursor-grabbing", i === t ? "bg-focus" : "bg-focus/50 hover:bg-focus/70"),
								style: {
									left: d(o.start),
									width: `max(6px, ${d(o.duration)})`
								},
								children: [/* @__PURE__ */ U("span", {
									className: "pointer-events-none truncate px-1 font-mono text-2xs leading-none text-white",
									children: [o.duration.toFixed(1), "s"]
								}), /* @__PURE__ */ H("span", {
									onPointerDown: (e) => f(e, i, "end"),
									className: "absolute -right-1 inset-y-0 w-2 cursor-ew-resize",
									"aria-hidden": !0
								})]
							}),
							o.spread > 0 && /* @__PURE__ */ H("span", {
								className: "pointer-events-none absolute top-1 h-4 rounded-r-xs bg-focus/20",
								style: {
									left: d(o.start + o.duration),
									width: d(o.spread)
								}
							})
						]
					})]
				}, i);
			}),
			/* @__PURE__ */ H(la, {
				size: "xs",
				onClick: i,
				className: "ml-24 mt-0.5 !w-auto",
				children: T("Add Step")
			})
		]
	});
}
function Lc({ node: e, step: t, index: n, count: r, onChange: i, onRemove: a }) {
	let { catalog: o } = G(), s = gn(), c = s.of("color").find((e) => !/-\d+$/.test(e.name) && e.name !== "black" && e.name !== "white")?.ref ?? "currentColor", l = t.target ?? "self", u = Cc(), d = Object.keys(o.motion?.properties ?? u), f = kc.includes(e.type), p = (e) => {
		let n = t[e] ?? {}, r = (t, r) => i({ [e]: {
			...n,
			[t]: /^-?[\d.]+$/.test(r) ? Number(r) : r
		} });
		return /* @__PURE__ */ U("div", {
			className: "space-y-1",
			children: [
				/* @__PURE__ */ U("div", {
					className: "flex h-7 items-center justify-between",
					children: [/* @__PURE__ */ H("span", {
						className: "text-xs font-medium text-muted",
						children: T(e === "from" ? "From" : "To||end value")
					}), /* @__PURE__ */ H(de, {
						align: "end",
						trigger: /* @__PURE__ */ H(L, {
							icon: "plus",
							label: T(e === "from" ? "Add a Start Property" : "Add an End Property"),
							size: "xs"
						}),
						items: d.filter((e) => !(e in n)).map((e) => ({
							label: u[e] ?? e,
							onSelect: () => r(e, o.motion.properties[e] === "css" ? e === "clipPath" ? "inset(0% 0% 0% 0%)" : c : e === "opacity" || e.startsWith("scale") ? "1" : "0")
						}))
					})]
				}),
				Object.keys(n).length === 0 && /* @__PURE__ */ H("p", {
					className: "m-0 text-2xs text-faint",
					children: T(e === "from" ? "As it looks now" : "As Designed")
				}),
				/* @__PURE__ */ H(Z, {
					bare: !0,
					fields: [{
						handle: e,
						type: "json",
						component: "blocks-pairs",
						className: "items-start",
						label: T(e === "from" ? "From" : "To||end value"),
						labels: u,
						item: {
							handle: "value",
							type: "text",
							component: "blocks-value",
							label: T("Value"),
							unit: ""
						},
						items: Object.fromEntries(Object.keys(n).map((e) => [e, {
							handle: "value",
							type: "text",
							component: "blocks-value",
							label: T("Value"),
							unit: "",
							step: e === "opacity" || e.startsWith("scale") ? .05 : 1,
							group: e.toLowerCase().includes("color") ? "color" : void 0
						}]))
					}],
					values: { [e]: n },
					onChange: (t, n) => {
						let r = Object.fromEntries(Object.entries(n).filter(([, e]) => e !== null && e !== "").map(([e, t]) => [e, typeof t == "string" && /^-?[\d.]+$/.test(t) ? Number(t) : t]));
						i({ [e]: Object.keys(r).length ? r : void 0 });
					}
				})
			]
		});
	};
	return /* @__PURE__ */ U("div", {
		className: "space-y-2",
		children: [
			/* @__PURE__ */ U("div", {
				className: "flex h-7 items-center gap-1",
				children: [
					/* @__PURE__ */ H("span", {
						className: "text-xs font-semibold text-text",
						children: r > 1 ? T("Step {n}", { n: n + 1 }) : T("Animate")
					}),
					/* @__PURE__ */ H("span", { className: "flex-1" }),
					r > 1 && /* @__PURE__ */ H(da, {
						onClick: a,
						label: T("Remove Step")
					})
				]
			}),
			/* @__PURE__ */ H(Z, {
				fields: [
					{
						handle: "target",
						type: "select",
						size: "sm",
						label: T("Target"),
						required: !0,
						options: [
							{
								value: "self",
								label: T("This Element")
							},
							{
								value: "children",
								label: T("Each Child in Turn")
							},
							...f ? [
								{
									value: "words",
									label: T("Each Word")
								},
								{
									value: "lines",
									label: T("Each Line")
								},
								{
									value: "chars",
									label: T("Each Letter")
								}
							] : [],
							{
								value: "other",
								label: T("Another Element")
							}
						]
					},
					...Oc(l.startsWith("#"), {
						handle: "element",
						type: "select",
						component: "blocks-node",
						label: T("Element")
					}),
					...Oc(l === "words" || l === "chars", {
						handle: "mask",
						type: "toggle",
						size: "sm",
						label: T("Rise from Behind a Line")
					})
				],
				values: {
					target: l.startsWith("#") ? "other" : l,
					element: l.slice(1),
					mask: !!t.mask
				},
				onChange: (t, n) => i(t === "mask" ? { mask: n || void 0 } : { target: t === "target" ? n === "other" ? `#${e.id}` : n ?? "self" : n ? `#${n}` : "self" })
			}),
			p("from"),
			p("to"),
			/* @__PURE__ */ H(Z, {
				fields: [
					Tc("duration", T("Duration")),
					Tc("delay", T("Delay")),
					...Oc(l !== "self", Tc("stagger", T("Stagger"), { step: .01 })),
					...Oc(r > 1, Tc("at", T("Starts At||time"), { placeholder: T("After") })),
					{
						handle: "ease",
						type: "text",
						component: "ease",
						label: T("Ease"),
						placeholder: T("Smooth Out"),
						options: [...s.of("ease").map((e) => ({
							value: e.ref,
							label: e.name,
							curve: e.value
						})), ...wc()]
					}
				],
				values: {
					duration: `${t.duration ?? .6}s`,
					delay: t.delay === void 0 ? void 0 : `${t.delay}s`,
					stagger: t.stagger === void 0 ? void 0 : `${t.stagger}s`,
					at: t.at === void 0 ? void 0 : `${t.at}s`,
					ease: t.ease
				},
				onChange: (e, t) => {
					if (e === "ease") return i({ ease: t ?? void 0 });
					let n = parseFloat(t);
					i({ [e]: e === "duration" ? n > 0 ? n : .6 : n > 0 || e === "at" && n === 0 ? n : void 0 });
				}
			})
		]
	});
}
// admin/src/builder/Inspector.tsx
var Rc = [
	"content",
	"design",
	"interact"
], zc = "cms.block.tab";
function Bc(e) {
	if (!e.scrollTop) return null;
	let t = e.getBoundingClientRect().top, n = [...e.querySelectorAll("[data-section]")].find((e) => e.getBoundingClientRect().bottom > t);
	return {
		section: n?.dataset.section,
		offset: n ? n.getBoundingClientRect().top - t : 0,
		scrollTop: e.scrollTop
	};
}
function Vc(e, t) {
	let n = t.section && e.querySelector(`[data-section="${CSS.escape(t.section)}"]`);
	n ? e.scrollTop += n.getBoundingClientRect().top - e.getBoundingClientRect().top - t.offset : e.scrollTop = t.scrollTop;
}
function Hc() {
	try {
		let e = sessionStorage.getItem(zc);
		return Rc.find((t) => t === e) ?? "content";
	} catch {
		return "content";
	}
}
var Uc = ae(function({ node: e, onBack: t, backLabel: n, onClose: r }) {
	let { store: i, types: a, allowed: o, readOnly: s } = G(), c = a.get(e.type), l = ze(), [u, d] = M(Hc), p = `block-inspector-${ce()}`, [m, h] = M(!1), g = j(null), _ = j(e.id), y = j(null);
	_.current !== e.id && (_.current = e.id, y.current = g.current && Bc(g.current)), le(() => {
		g.current && y.current && Vc(g.current, y.current), y.current = null;
	}, [e.id]);
	let b = (e) => {
		try {
			sessionStorage.setItem(zc, e);
		} catch {}
		d(e);
	}, x = !s && v("entries.components.create");
	return /* @__PURE__ */ U("div", {
		className: "flex h-full min-h-0 min-w-0 flex-col",
		"data-blocks-inspector": !0,
		children: [
			/* @__PURE__ */ H(_e, {
				bordered: !1,
				onBack: t,
				backLabel: n,
				onClose: r,
				icon: e.type === "component" ? "symbol" : c?.icon ?? "square",
				actions: /* @__PURE__ */ H(de, {
					align: "end",
					trigger: /* @__PURE__ */ H(L, {
						icon: "more",
						label: T("Block Actions"),
						size: "sm"
					}),
					items: [
						{
							label: T("Rename"),
							icon: "edit",
							disabled: s,
							onSelect: () => h(!0)
						},
						{
							label: T("Duplicate"),
							icon: "copy",
							shortcut: "mod+d",
							disabled: s,
							onSelect: () => i.duplicate(e.id)
						},
						x && {
							label: T("Make a Component"),
							icon: "symbol",
							onSelect: () => {
								i.selection().includes(e.id) || i.select(e.id), or(i, e.type !== "component" && f(i, a, o));
							}
						},
						{
							label: T("Copy ID"),
							icon: "hash",
							onSelect: () => void Se(e.id, { copied: T("Copied {reference}", { reference: e.id }) })
						},
						{
							separator: !0,
							label: ""
						},
						{
							label: T("Delete"),
							icon: "trash",
							shortcut: "⌫",
							danger: !0,
							disabled: s,
							onSelect: () => i.remove(e.id)
						}
					]
				}),
				children: m ? /* @__PURE__ */ H("div", {
					className: "min-w-0 flex-1 pl-1",
					onBlur: () => h(!1),
					onKeyUp: (e) => e.key === "Escape" && e.target.blur(),
					children: /* @__PURE__ */ H(Z, {
						bare: !0,
						fields: [{
							handle: "label",
							type: "text",
							size: "sm",
							commit: "blur",
							label: T("Name"),
							autofocus: !0,
							placeholder: c?.title
						}],
						values: { label: e.label ?? "" },
						onChange: (t, n) => i.updateNode(e.id, { label: n.trim() || void 0 })
					})
				}) : /* @__PURE__ */ H(B, {
					content: s ? void 0 : T("Double-Click to Rename"),
					children: /* @__PURE__ */ H(P, {
						variant: "ghost",
						onDoubleClick: () => !s && h(!0),
						className: "min-w-0 flex-1 shrink !justify-start !bg-transparent !pl-1 !pr-0 text-left !font-medium !text-ink",
						children: /* @__PURE__ */ H("span", {
							className: "truncate",
							children: Be(e, a, l)
						})
					})
				})
			}),
			/* @__PURE__ */ H("div", {
				className: "flex h-10 shrink-0 items-center gap-2 border-b border-border pl-4 pr-3",
				children: /* @__PURE__ */ H(xe, {
					id: p,
					value: u,
					onChange: b,
					bordered: !1,
					size: "sm",
					className: "h-full min-w-0 flex-1",
					tabs: Rc.map((e) => ({
						value: e,
						label: {
							content: T("Content"),
							design: T("Design"),
							interact: T("Interact")
						}[e]
					}))
				})
			}),
			/* @__PURE__ */ H("fieldset", {
				ref: g,
				role: "tabpanel",
				id: `${p}-${u}-panel`,
				"aria-labelledby": `${p}-${u}`,
				disabled: s || !c && e.type !== "component",
				className: "m-0 min-h-0 min-w-0 flex-1 overflow-y-auto border-0 p-0",
				children: /* @__PURE__ */ U(ne, { children: [
					u === "design" && /* @__PURE__ */ H(Qs, { node: e }),
					u === "content" && /* @__PURE__ */ H(Ka, { node: e }),
					u === "interact" && /* @__PURE__ */ U(Ne, { children: [/* @__PURE__ */ H(Mc, { node: e }), /* @__PURE__ */ H(pc, { node: e })] })
				] }, e.id)
			})
		]
	});
});
export { ai as $, Ge as $t, ma as A, jt as At, Ki as B, wt as Bt, Na as C, Zt as Ct, Ea as D, vt as Dt, ba as E, Yt as Et, da as F, Ct as Ft, Di as G, Je as Gt, Ai as H, xt as Ht, ia as I, mt as It, vi as J, q as Jt, Ei as K, rt as Kt, ta as L, At as Lt, fa as M, yt as Mt, ua as N, St as Nt, ga as O, Pt as Ot, Z as P, Nt as Pt, _i as Q, Ke as Qt, ca as R, Lt as Rt, Za as S, Vt as St, xa as T, Jt as Tt, Mi as U, ot as Ut, Ii as V, ft as Vt, Ti as W, Ze as Wt, hi as X, qe as Xt, gi as Y, at as Yt, mi as Z, tt as Zt, Ko as _, un as _t, Vs as a, Re as an, tr as at, $a as b, Ut as bt, Ns as c, Bn as ct, Es as d, pn as dt, Ve as en, ui as et, ns as f, sn as ft, Xo as g, bn as gt, qo as h, cn as ht, Rs as i, Be as in, ii as it, _a as j, bt as jt, va as k, Mt as kt, Ts as l, zn as lt, os as m, on as mt, Xs as n, K as nn, si as nt, Bs as o, ze as on, Un as ot, $o as p, an as pt, Oi as q, J as qt, Zs as r, Le as rn, oi as rt, Ls as s, G as sn, Hn as st, Uc as t, He as tn, li as tt, Os as u, Nn as ut, Wo as v, mn as vt, Pa as w, Xt as wt, Qa as x, Bt as xt, Ao as y, gn as yt, sa as z, Ft as zt };
