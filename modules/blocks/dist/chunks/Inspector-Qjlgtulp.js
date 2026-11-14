import { c as e, f as t, i as n, n as r, o as i, p as a, r as o, s, t as c, u as l } from "./Inserter-CfdoRD1B.js";
import { a as u, c as d, d as f, f as p, g as m, h, i as g, l as _, m as v, n as y, o as b, p as x, r as ee, t as te, u as S, v as C, y as w } from "./insert-DZPaXAR2.js";
import { Link as T, can as E, getManifest as ne, invalidate as re, navigate as ie, plural as ae, registry as oe, requestText as se, run as ce, t as D, useAbility as O, useManifest as le, useManifestIfLoaded as ue } from "@letterncms/sdk";
import { Fragment as de, createContext as fe, createElement as k, forwardRef as pe, memo as me, useCallback as he, useContext as A, useEffect as j, useId as ge, useLayoutEffect as _e, useMemo as ve, useRef as M, useState as N, useSyncExternalStore as ye } from "react";
import { Button as P, Dialog as be, Fields as xe, Icon as F, IconButton as I, Menu as L, NEW_COLOR as R, Notice as Se, PanelHeader as Ce, Popover as we, Pressable as z, QueryError as Te, Segmented as Ee, Spinner as De, Tabs as Oe, Tooltip as ke, cn as B, copyText as Ae, deviceWidths as je, fieldControlId as Me, fieldVisible as Ne, prompt as Pe, slugify as Fe, toast as Ie, useShortcutLabel as Le, wideFieldTypes as Re } from "@letterncms/ui";
import { Fragment as ze, jsx as V, jsxs as H } from "react/jsx-runtime";
import { createPortal as Be, flushSync as Ve } from "react-dom";
import { createRoot as U } from "react-dom/client";
// admin/src/core/store.ts
var He = class {
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
			breakpoint: "",
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
	selection = () => Ue(this.state);
	extendTo(e) {
		let { selected: t, nodes: n, blockMode: r } = this.state, i = t ? p(n, t) : null, a = p(n, e);
		if (!t || !i || !a || i.parentId !== a.parentId) return this.select(e, r);
		this.set({ head: e === t ? null : e });
	}
	extend(e) {
		let { selected: t, head: n, nodes: r } = this.state, i = t ? p(r, t) : null;
		if (!t || !i) return;
		let a = m(r, i.parentId), o = a.findIndex((e) => e.id === (n ?? t)) + e;
		o >= 0 && o < a.length && this.extendTo(a[o].id);
	}
	removeSelection() {
		let e = this.selection();
		this.commit(e.reduce((e, t) => h(e, t), this.state.nodes)), this.set({
			selected: null,
			head: null
		});
	}
	replaceSelection(e) {
		let t = this.selection(), n = t[0] ? p(this.state.nodes, t[0]) : null;
		if (!n) return;
		let r = t.reduce((e, t) => h(e, t), this.state.nodes);
		this.commit(S(r, n.parentId, n.index, e)), this.set({
			selected: e[0]?.id ?? null,
			head: null
		});
	}
	hover = (e) => this.state.hovered !== e && this.set({ hovered: e });
	setDevice = (e) => this.set({ device: e });
	setBreakpoint = (e) => this.set({ breakpoint: e });
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
		this.commit(C(this.state.nodes, e, (e) => ({
			...e,
			props: {
				...e.props,
				...t
			}
		})), n || `props:${e}`);
	}
	updateNode(e, t, n = "") {
		this.commit(C(this.state.nodes, e, (e) => ({
			...e,
			...t
		})), n);
	}
	insert(e, t, n) {
		this.commit(S(this.state.nodes, e, t, n));
	}
	insertAfter(e, t) {
		if (!e) return this.insert(null, this.state.nodes.length, t);
		let n = p(this.state.nodes, e);
		if (!n) return this.insert(null, this.state.nodes.length, t);
		this.insert(n.parentId, n.index + 1, t);
	}
	remove(e) {
		this.commit(h(this.state.nodes, e)), this.state.selected === e && this.set({
			selected: null,
			head: null
		});
	}
	move(e, t, n) {
		this.commit(x(this.state.nodes, e, t, n));
	}
	moveTo(e, t, n) {
		let r = this.state.nodes;
		if (t && e.some((e) => e === t || u(r, t).some((t) => t.id === e))) return;
		let i = e.map((e) => d(r, e)).filter((e) => !!e), a = e.filter((e) => {
			let i = p(r, e);
			return i && i.parentId === t && i.index < n;
		}).length, o = S(e.reduce((e, t) => h(e, t), r), t, n - a, i);
		JSON.stringify(o) !== JSON.stringify(r) && this.commit(o);
	}
	nudge(e, t) {
		let n = p(this.state.nodes, e);
		if (!n) return;
		let r = m(this.state.nodes, n.parentId).length, i = n.index + t;
		i < 0 || i >= r || this.move(e, n.parentId, t > 0 ? i + 1 : i);
	}
	nudgeSelection(e) {
		let t = this.selection(), n = t[0] ? p(this.state.nodes, t[0]) : null, r = t.length ? p(this.state.nodes, t.at(-1)) : null;
		if (!n || !r || n.parentId !== r.parentId) return;
		let i = m(this.state.nodes, n.parentId).length;
		e < 0 && n.index === 0 || e > 0 && r.index === i - 1 || this.moveTo(t, n.parentId, e < 0 ? n.index - 1 : r.index + 2);
	}
	duplicate(e) {
		let t = d(this.state.nodes, e);
		if (!t) return;
		let n = b(t);
		this.insertAfter(e, [n]), this.select(n.id);
	}
	duplicateSelection() {
		let e = this.selection(), t = this.state.nodes, n = e.map((e) => d(t, e)).filter((e) => !!e).map(b), r = e.length ? p(t, e.at(-1)) : null;
		r && n.length && (this.insert(r.parentId, r.index + 1, n), this.select(n[0].id, !0), n.length > 1 && this.extendTo(n.at(-1).id));
	}
	wrap(e, t) {
		let n = d(this.state.nodes, e), r = p(this.state.nodes, e);
		if (!n || !r) return;
		let i = {
			...t,
			children: [n]
		};
		this.commit(S(h(this.state.nodes, e), r.parentId, r.index, [i])), this.select(i.id);
	}
	unwrap(e) {
		let t = d(this.state.nodes, e), n = p(this.state.nodes, e);
		t && n && t.children && this.commit(S(h(this.state.nodes, e), n.parentId, n.index, t.children));
	}
};
function Ue(e) {
	if (!e.selected) return [];
	if (!e.head) return [e.selected];
	let t = p(e.nodes, e.selected);
	if (!t) return [e.selected];
	let n = m(e.nodes, t.parentId), r = n.findIndex((t) => t.id === e.selected), i = n.findIndex((t) => t.id === e.head);
	return i < 0 ? [e.selected] : n.slice(Math.min(r, i), Math.max(r, i) + 1).map((e) => e.id);
}
function We(e, t) {
	if (Object.is(e, t)) return !0;
	if (Array.isArray(e) && Array.isArray(t)) return e.length === t.length && e.every((e, n) => Object.is(e, t[n]));
	if (e && t && typeof e == "object" && typeof t == "object") {
		let n = Object.keys(e), r = Object.keys(t);
		return n.length === r.length && n.every((n) => Object.is(e[n], t[n]));
	}
	return !1;
}
function W(e, t) {
	let n = M(null);
	return ye(e.subscribe, () => {
		let r = t(e.get());
		return n.current && We(n.current.value, r) ? n.current.value : (n.current = { value: r }, r);
	});
}
// admin/src/core/uniqueIds.ts
function Ge(e, t) {
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
function Ke(e, t, n) {
	let r = M(t);
	r.current = t;
	let [i] = N(() => new He(Ge(Array.isArray(e) ? e : [], w), (e) => r.current(e), n)), a = M(e);
	return i.setReadOnly(n), j(() => {
		if (a.current === e) return;
		a.current = e;
		let t = Ge(Array.isArray(e) ? e : [], w);
		JSON.stringify(t) !== JSON.stringify(i.get().nodes) && i.reset(t);
	}, [i, e]), i;
}
// tailwind/engine.ts
function G(e) {
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
function K(e) {
	return [...e].sort().join(":");
}
function qe(e, t) {
	return [...e, t].join(":");
}
function Je(e) {
	return (e ?? "").split(/\s+/).filter(Boolean);
}
function Ye(e) {
	return e.trim().replace(/_/g, "\\_").replace(/\s+/g, "_");
}
var Xe = {
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
}, Ze = {
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
}, Qe = class {
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
			t = n === null ? null : rt(n), this.css.set(e, t);
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
		let r = K(t), i = null;
		for (let t of e) {
			let e = G(t);
			K(e.variants) === r && this.group(e.utility) === n && (i = t);
		}
		return i;
	}
	put(e, t, n, r) {
		let i = K(t), a = e.filter((e) => {
			let t = G(e);
			return K(t.variants) !== i || this.group(t.utility) !== n;
		});
		return r && a.push(qe(t, r)), a;
	}
	make(e, t, n) {
		let r = t.trim();
		if (r === "") return null;
		let i = r.startsWith("-") && /^-[\d.]/.test(r) ? `-${e}-${r.slice(1)}` : `${e}-${r}`;
		if (/^[\w./%-]+$/.test(r) && this.declarations(i) !== null) return i;
		let a = `${e}-[${n ? `${n}:` : ""}${Ye(r)}]`;
		return this.declarations(a) === null ? null : a;
	}
	utilityFor(e, t) {
		let n = Xe[e], r = n ? nt(t) : null;
		if (n && r) {
			let t = this.make(n, r.alpha === void 0 ? r.key : `${r.key}/${r.alpha}`);
			if (t && this.declarations(t)?.some((t) => t.property === e && t.value.includes(r.variable))) return t;
		}
		let i = $e(this.resolve(t)), a = this.index().get(`${e}:${i}`);
		if (a) return a;
		if (n) for (let [t, r] of this.ds.theme.entries()) {
			let a = $e(r.value) === i ? nt(`var(${t})`)?.key : void 0, o = a ? this.make(n, a) : null;
			if (o && $e(this.resolve(this.value(o, e) ?? "")) === i) return o;
		}
		let o = n ? this.make(n, t) : null, s = o && this.declarations(o)?.some((t) => t.property === e) ? o : n ? this.make(n, t, Ze[e]) : null, c = (t) => t.includes("[") ? this.declarations(t)?.some((t) => t.property === e) : $e(this.resolve(this.value(t, e) ?? "")) === i;
		if (s && c(s)) return s;
		let l = n ? `${n}-[${Ze[e] ? `${Ze[e]}:` : ""}${Ye(t)}]` : null;
		return l && l !== s && c(l) ? l : `[${e}:${Ye(t)}]`;
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
			let i = tt(e, n);
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
			let i = rt(n[r]);
			if (this.css.set(t, i), i.length !== 1 || n[r].indexOf("{") !== n[r].lastIndexOf("{")) return;
			let a = `${i[0].property}:${$e(this.resolve(i[0].value))}`, o = e.get(a);
			(!o || t.length < o.length) && e.set(a, t);
		}), this.exact = e;
	}
	resolve(e) {
		let t = e;
		for (let e = 0; e < 4 && t.includes("var(--"); e++) t = t.replace(/var\((--[\w-]+)(?:,[^()]*)?\)/g, (e, t) => this.ds.resolveThemeValue(t) ?? e);
		return t.replace(/calc\(([\d.]+)(rem|px|em) \* (-?[\d.]+)\)/g, (e, t, n, r) => `${+(Number(t) * Number(r)).toFixed(4)}${n}`);
	}
};
function $e(e) {
	return e.trim().toLowerCase().replace(/\s+/g, " ").replace(/(^|[^\w.-])(-?\d*\.?\d+)px\b/g, (e, t, n) => `${t}${+(Number(n) / 16).toFixed(4)}rem`).replace(/(^|[^\d.])0(?:rem|em)\b/g, "$10");
}
var et = {
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
function tt(e, t) {
	let n = et[e];
	if (!t.startsWith(n)) return null;
	let r = t.slice(n.length);
	return r === "" || r.includes("--") || e === "font" && r.startsWith("weight-") ? null : r;
}
function nt(e) {
	let t = e.trim(), n = /^var\((--[\w-]+)\)$/.exec(t), r = n ? null : /^color-mix\(in \w+, var\((--color-[\w-]+)\) ([\d.]+)%, transparent\)$/.exec(t), i = n?.[1] ?? r?.[1];
	if (!i) return null;
	let a = Object.values(et).filter((e) => i.startsWith(e)).sort((e, t) => t.length - e.length)[0];
	return a ? {
		variable: i,
		key: i.slice(a.length),
		...r ? { alpha: r[2] } : {}
	} : null;
}
function rt(e) {
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
var it = class {
	engine;
	classes;
	variants;
	chain;
	constructor(e, t, n, r, i) {
		this.engine = e, this.classes = t, this.variants = [...r ? [r] : [], ...i];
		let a = r ? [...n.slice(0, n.indexOf(r) + 1).reverse(), ""] : [""], o = [...i.length ? a.map((e) => [...e ? [e] : [], ...i]) : [], ...a.map((e) => e ? [e] : [])];
		this.chain = o.map(K);
	}
	find(e) {
		for (let [t, n] of this.chain.entries()) for (let r = this.classes.length - 1; r >= 0; r--) {
			let i = G(this.classes[r]);
			if (K(i.variants) !== n) continue;
			let a = this.engine.value(i.utility, e);
			if (a !== void 0) return {
				value: a,
				from: this.classes[r],
				own: t === 0
			};
		}
	}
	set(e) {
		let t = this.classes;
		for (let [n, r] of Object.entries(e)) {
			let e = r == null ? "" : String(r).trim();
			if (e === "") {
				let e = K(this.variants);
				t = t.filter((t) => {
					let r = G(t);
					return K(r.variants) !== e || this.engine.group(r.utility)?.split("|")[0] !== n;
				});
			} else {
				let r = this.engine.utilityFor(n, e);
				t = this.engine.put(t, this.variants, this.engine.group(r) ?? r, r);
			}
		}
		return t;
	}
	get(e) {
		let t = this.engine.group(e), n = t ? this.engine.find(this.classes, this.variants, t) : null;
		return n ? G(n).utility : null;
	}
	put(e, t) {
		let n = this.engine.group(t ?? e);
		return n ? this.engine.put(this.classes, this.variants, n, t) : this.classes;
	}
	own() {
		let e = K(this.variants), t = /* @__PURE__ */ new Set();
		for (let n of this.classes) {
			let r = G(n);
			if (K(r.variants) === e) for (let e of this.engine.declarations(r.utility) ?? []) e.property.startsWith("--") || t.add(e.property);
		}
		return [...t];
	}
};
// tailwind/stylesheet.ts
function q(e, t = 0, n = e.length) {
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
var at = (e, t) => /[ \t]*$/.exec(e.slice(0, t))[0], ot = class e {
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
		let a = this.declarations(i).filter((t) => J(t.name) === J(e));
		if (n === "first" && a[0]) return this.splice(a[0].start, a[0].start, `${e}: ${t};\n${at(this.css, a[0].start)}`);
		let o = a[a.length - 1];
		if (o) {
			let n = this.css.indexOf("\n", o.end), r = n === -1 || n > i.inner[1] ? o.end : n;
			return this.splice(r, r, `\n${at(this.css, o.start)}${e}: ${t};`);
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
		return q(this.css).filter((e) => /^@utility\s/.test(e.prelude) && e.inner).map((e) => this.rule(e.prelude.replace(/^@utility\s+/, ""), e));
	}
	setUtility(e, t) {
		let n = q(this.css).find((t) => t.prelude === `@utility ${e}`);
		return n ? this.setApply(n, t) : this.append(`@utility ${e} {\n  @apply ${t.join(" ")};\n}`);
	}
	removeUtility(e) {
		let t = q(this.css).find((t) => t.prelude === `@utility ${e}`);
		return t ? this.remove(t) : this;
	}
	renameUtility(e, t) {
		let n = q(this.css).find((t) => t.prelude === `@utility ${e}`);
		return n ? this.splice(n.start, n.start + n.prelude.length, `@utility ${t}`) : this;
	}
	duplicateUtility(e, t) {
		let n = q(this.css).find((t) => t.prelude === `@utility ${e}`);
		if (!n) return this;
		let r = this.css.slice(n.start + n.prelude.length, n.end);
		return this.splice(n.end, n.end, `\n\n@utility ${t}${r}`);
	}
	elements() {
		return this.bases().flatMap((e) => q(this.css, ...e.inner).filter((e) => e.inner && !e.prelude.startsWith("@")).map((e) => this.rule(e.prelude.replace(/\s+/g, " "), e)));
	}
	setElement(e, t) {
		for (let n of this.bases()) {
			let r = q(this.css, ...n.inner).find((t) => t.prelude.replace(/\s+/g, " ") === e);
			if (r) return t.length === 0 && !this.rule(e, r).custom ? this.remove(r) : this.setApply(r, t);
		}
		if (t.length === 0) return this;
		let n = `  ${e} {\n    @apply ${t.join(" ")};\n  }`, r = this.bases()[0];
		return r ? this.insertLast(r, n) : this.append(`@layer base {\n${n}\n}`);
	}
	property(e, t) {
		for (let n of this.bases()) for (let r of q(this.css, ...n.inner).filter((t) => t.inner && t.prelude.replace(/\s+/g, " ") === e)) {
			let e = this.properties(r).findLast((e) => e.name === t);
			if (e) return e.value;
		}
	}
	setProperty(e, t, n) {
		for (let r of this.bases()) for (let i of q(this.css, ...r.inner).filter((t) => t.inner && t.prelude.replace(/\s+/g, " ") === e)) {
			let e = this.properties(i).findLast((e) => e.name === t);
			if (e && n !== null) return this.splice(e.start, e.end, `${t}: ${n};`);
			if (e) return q(this.css, ...i.inner).length === 1 ? this.remove(i) : this.splice(this.lineStart(e.start), this.lineEnd(e.end), "");
		}
		if (n === null) return this;
		let r = this.bases()[0];
		if (!r) return this.append(`@layer base {\n  ${e} {\n    ${t}: ${n};\n  }\n}`);
		let i = q(this.css, ...r.inner).find((t) => t.inner && t.prelude.replace(/\s+/g, " ") === e);
		return i ? this.insertLast(i, `${at(this.css, i.start)}  ${t}: ${n};`) : this.splice(r.inner[0], r.inner[0], `\n  ${e} {\n    ${t}: ${n};\n  }`);
	}
	properties(e) {
		return q(this.css, ...e.inner).filter((e) => !e.inner && !e.prelude.startsWith("@") && e.prelude.includes(":")).map((e) => {
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
		return q(this.css).filter((e) => e.inner && /^@theme(\s+(inline|static))*$/.test(e.prelude));
	}
	bases() {
		return q(this.css).filter((e) => e.inner && e.prelude === "@layer base");
	}
	declarations(e) {
		return q(this.css, ...e.inner).filter((e) => !e.inner && e.prelude.startsWith("--") && e.prelude.includes(":")).map((e) => {
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
		let n = q(this.css, ...t.inner), r = n.filter((e) => !e.inner && e.prelude.startsWith("@apply"));
		return {
			name: e,
			classes: r.flatMap((e) => e.prelude.slice(6).trim().split(/\s+/).filter(Boolean)),
			custom: n.length !== r.length || r.length > 1
		};
	}
	setApply(e, t) {
		let n = q(this.css, ...e.inner).filter((e) => !e.inner && e.prelude.startsWith("@apply")), r = t.length ? `@apply ${t.join(" ")};` : "";
		if (n.length === 0) {
			if (r === "") return this;
			let t = `${at(this.css, e.start)}  `;
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
			let e = q(this.css).filter((e) => !e.inner && e.prelude.startsWith("@import")), n = e[e.length - 1];
			if (n) return this.splice(n.end, n.end, `\n\n${t}`);
		}
		let r = this.css.replace(/\s+$/, "");
		return new e(`${r}${r === "" ? "" : "\n\n"}${t}\n`);
	}
	insertLast(e, t) {
		let [n, r] = e.inner, i = /\s*$/.exec(this.css.slice(n, r))[0].length;
		return this.splice(r - i, r, `\n${t}\n${at(this.css, e.start)}`);
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
function J(e) {
	return /^--(font-weight|inset-shadow|drop-shadow|text-shadow|[a-z]+)/.exec(e)?.[0] ?? e;
}
// admin/src/core/styling.tsx
var Y = (e) => `${e.css}\u0000${JSON.stringify(e.files)}`, st = /* @__PURE__ */ new Map(), ct = /* @__PURE__ */ new Map(), lt = /* @__PURE__ */ new Map();
function ut(e, t, n) {
	e.set(t, n);
	for (let t of [...e.keys()].slice(0, -2)) e.delete(t);
	return n;
}
function dt(e) {
	let t = Y(e);
	return st.get(t) ?? ut(st, t, import("./compile-DgTTEh1K.js").then(({ designSystem: t }) => t(e)).then((e) => new Qe(e)).catch((e) => (console.error("[cms] The stylesheet could not be read.", e), null)).then((e) => ut(ct, t, e)));
}
function ft(e) {
	let t = Y(e);
	return lt.get(t) ?? ut(lt, t, import("./compile-DgTTEh1K.js").then(({ compiler: t }) => t(e)));
}
function pt(e) {
	return import("./compile-DgTTEh1K.js").then(({ build: t }) => t(e));
}
function mt(e) {
	let t = parseFloat(e);
	return Number.isNaN(t) ? 0 : /r?em$/.test(e.trim()) ? t * 16 : t;
}
function ht(e) {
	let t = e ? Y(e) : "", [, n] = N(0);
	return j(() => {
		if (!e || ct.has(t)) return;
		let r = !0;
		return dt(e).then(() => r && n((e) => e + 1)), () => {
			r = !1;
		};
	}, [t]), {
		engine: e && ct.get(t) || null,
		loading: !!e && !ct.has(t)
	};
}
function gt(e, t, n) {
	return {
		engine: e,
		breakpoints: e ? e.tokens("breakpoint").map((e) => ({
			name: e.name,
			width: mt(e.value)
		})).filter((e) => e.width > 0).sort((e, t) => e.width - t.width) : [],
		classes: t ? bt(t.css) : [],
		source: t,
		loading: n
	};
}
var _t = fe(null);
function vt({ source: e, children: t }) {
	let { engine: n, loading: r } = ht(e), i = ve(() => gt(n, e, r), [
		n,
		e,
		r
	]);
	return /* @__PURE__ */ V(_t.Provider, {
		value: i,
		children: t
	});
}
function yt() {
	let e = A(_t), t = O("styling/source", {}, {
		staleTime: 6e4,
		retry: !1,
		enabled: !e
	}), n = e ? void 0 : t.data, { engine: r, loading: i } = ht(n), a = ve(() => gt(r, n, t.isLoading || i), [
		r,
		n,
		t.isLoading,
		i
	]);
	return e ?? a;
}
function bt(e) {
	try {
		return new ot(e).utilities().map((e) => e.name).filter((e) => /^[\w-]+$/.test(e));
	} catch {
		return [];
	}
}
function X() {
	let { engine: e } = yt();
	return ve(() => wt(e), [e]);
}
var xt = [
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
], St = {
	of: () => [],
	find: () => null,
	resolve: (e) => e
}, Ct = /* @__PURE__ */ new WeakMap();
function wt(e) {
	if (!e) return St;
	let t = Ct.get(e);
	return t || Ct.set(e, t = Tt(e)), t;
}
function Tt(e) {
	let t = /* @__PURE__ */ new Map(), n = (n) => {
		let r = t.get(n);
		return r || t.set(n, r = e.tokens(n)), r;
	}, r = null;
	return {
		of: n,
		find: (e) => {
			let t = typeof e == "string" ? nt(e) : null;
			if (!t) return null;
			r ??= new Map(xt.flatMap((e) => n(e)).map((e) => [e.variable, e]));
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
function Et(e = document) {
	return e.getSelection()?.isCollapsed ?? !0;
}
function Dt(e, t) {
	let n = e.ownerDocument.getSelection();
	if (!n || n.rangeCount === 0) return null;
	let r = n.getRangeAt(0);
	if (!e.contains(r.startContainer)) return null;
	let i = e.ownerDocument.createRange();
	return i.selectNodeContents(e), t ? i.setEnd(r.startContainer, r.startOffset) : i.setStart(r.endContainer, r.endOffset), i;
}
function Ot(e) {
	return e ? e.toString().replace(/​/g, "") : "";
}
function kt(e) {
	return Et(e.ownerDocument) && Ot(Dt(e, !0)) === "" && !jt(Dt(e, !0)).includes("<br");
}
function At(e) {
	return Et(e.ownerDocument) && Ot(Dt(e, !1)) === "";
}
function jt(e) {
	if (!e) return "";
	let t = e.startContainer.ownerDocument.createElement("div");
	return t.appendChild(e.cloneContents()), t.innerHTML;
}
function Mt(e) {
	return Ot(Dt(e, !0)).length;
}
function Nt(e) {
	let t = Dt(e, !0), n = Dt(e, !1);
	return [jt(t), jt(n)];
}
function Pt(e) {
	let t = Lt(e.ownerDocument);
	return !t || t.top - e.getBoundingClientRect().top < It(e) * .8;
}
function Ft(e) {
	let t = Lt(e.ownerDocument);
	return !t || e.getBoundingClientRect().bottom - t.bottom < It(e) * .8;
}
function It(e) {
	let t = parseFloat(e.ownerDocument.defaultView.getComputedStyle(e).lineHeight);
	return Number.isFinite(t) ? t : 20;
}
function Lt(e = document) {
	let t = e.getSelection();
	if (!t || t.rangeCount === 0) return null;
	let n = t.getRangeAt(0).cloneRange(), r = n.getClientRects();
	if (r.length > 0) return r[0];
	let i = e.createElement("span");
	i.textContent = "​", n.insertNode(i);
	let a = i.getBoundingClientRect();
	return i.remove(), a;
}
function Rt(e, t) {
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
function zt(e) {
	let t = document.createElement("div");
	return t.innerHTML = e, (t.textContent ?? "").length;
}
function Bt(e) {
	return e.replace(/\u200B/g, "").replace(/<(\/?)strike>/g, "<$1s>").replace(/<(\/?)b>/g, "<$1strong>").replace(/<(\/?)i>/g, "<$1em>").replace(/<div><br><\/div>/g, "<br>").replace(/<\/?(div|p|span)[^>]*>/g, "").replace(/ style="[^"]*"/g, "").replace(/&nbsp;/g, " ").replace(/<br>$/, "");
}
var Vt = [
	["**", "strong"],
	["__", "strong"],
	["~~", "s"],
	["`", "code"],
	["*", "em"],
	["_", "em"]
];
function Ht(e = document) {
	let t = e.getSelection();
	if (!t || !t.isCollapsed || t.rangeCount === 0) return !1;
	let n = t.anchorNode;
	if (!n || n.nodeType !== Node.TEXT_NODE || n.parentElement?.closest("code")) return !1;
	let r = t.anchorOffset, i = (n.textContent ?? "").slice(0, r);
	for (let [a, o] of Vt) {
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
function Ut() {
	let { store: e } = a(), t = W(e, (e) => e.nodes), n = /* @__PURE__ */ new Map(), r = [];
	for (let { node: e } of _(t)) {
		let t = String(e.props?.text ?? "").replace(/<[^>]+>/g, "").trim(), i = e.props?.anchor || e.anchor || "";
		if (!i && e.type === "heading" && t) {
			let e = Fe(t) || "section", r = (n.get(e) ?? 0) + 1;
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
function Wt({ html: e, onChange: t, tag: n = "div", placeholder: r, className: i = "", focus: a, onKeyDown: o, onFocus: s, onPaste: c, disabled: l, singleLine: u, quiet: d, plainText: f }) {
	let p = M(null), m = M(e);
	_e(() => {
		let t = p.current;
		t && (t.ownerDocument.activeElement === t ? m.current = e : (Bt(t.innerHTML) !== e && (t.innerHTML = e), m.current = Bt(t.innerHTML)));
	}, [e]), _e(() => {
		a && p.current && Rt(p.current, a.at);
	}, [a?.nonce]);
	let h = () => {
		let e = p.current;
		if (!e) return;
		let n = Bt(e.innerHTML);
		n !== m.current && (m.current = n, t(n, e));
	};
	return k(n, {
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
			let t = e.nativeEvent;
			!f && t.inputType === "insertText" && t.data && /[*_~`]/.test(t.data) && Ht(e.currentTarget.ownerDocument), h();
		},
		onFocus: () => s?.(),
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
			}[e.key.toLowerCase()]), h()) : n && e.shiftKey && e.key.toLowerCase() === "x" ? (e.preventDefault(), t.execCommand("strikeThrough"), h()) : n && e.key.toLowerCase() === "k" ? (e.preventDefault(), e.stopPropagation(), p.current?.ownerDocument.dispatchEvent(new CustomEvent("cms:link"))) : n && e.key.toLowerCase() === "e" ? (e.preventDefault(), Gt("code", t), h()) : e.key === "Enter" && e.shiftKey && !u ? (e.preventDefault(), t.execCommand("insertLineBreak"), h()) : p.current && o?.(e, p.current);
		},
		onPaste: (e) => {
			e.preventDefault();
			let t = e.currentTarget.ownerDocument, n = e.clipboardData.getData("text/plain");
			!f && /^(https?:\/\/|mailto:)\S+$/i.test(n.trim()) && !t.getSelection()?.isCollapsed ? (t.execCommand("createLink", !1, n.trim()), h()) : p.current && c?.(n, p.current) || (t.execCommand("insertText", !1, u ? n.replace(/\s*\n\s*/g, " ") : n), h());
		},
		onBlur: () => h()
	});
}
function Gt(e, t = document) {
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
function Kt(e) {
	return {
		...e,
		type: "url",
		component: "link"
	};
}
// admin/src/core/FormatToolbar.tsx
function qt({ root: e = document, offset: t }) {
	let [n, r] = N(null), [i, a] = N({}), [o, s] = N(!1), [c, l] = N(""), u = M(null), d = M(null), f = M(() => {}), p = Ut();
	if (j(() => {
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
		Gt(t, e), d.current?.dispatchEvent(new Event("input", { bubbles: !0 })), e.dispatchEvent(new Event("selectionchange"));
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
	}, v = (e, t, n, r) => /* @__PURE__ */ V(ke, {
		content: t,
		shortcut: n,
		children: /* @__PURE__ */ V(z, {
			compact: !0,
			"aria-label": t,
			"aria-pressed": !!i[e] || e === "link" && o,
			onMouseDown: (e) => e.preventDefault(),
			onClick: r,
			className: B("grid size-7 place-items-center rounded-xs hover:bg-white/12 hover:text-ink-contrast", i[e] || e === "link" && o ? "bg-white/14 text-ink-contrast" : "text-ink-contrast/75"),
			children: /* @__PURE__ */ V(F, {
				name: e,
				size: 14
			})
		})
	}, e), y = () => {
		s(!1);
		let t = d.current, n = e.getSelection();
		t && u.current && n && (t.focus({ preventScroll: !0 }), n.removeAllRanges(), n.addRange(u.current));
	}, b = Kt({
		handle: "url",
		label: D("Link"),
		size: "sm",
		autofocus: !0,
		anchors: p,
		placeholder: D("Paste a link or search pages"),
		onClose: y
	});
	return Be(/* @__PURE__ */ H("div", {
		className: "fixed z-overlay flex -translate-x-1/2 -translate-y-full items-center gap-0.5 rounded-md bg-ink p-1 shadow-pop",
		style: {
			left: n.x,
			top: n.y - 8
		},
		onMouseDown: (e) => !o && e.preventDefault(),
		onKeyDown: (e) => e.key === "Escape" && y(),
		children: [
			v("bold", D("Bold"), "mod+b", () => m("bold")),
			v("italic", D("Italic"), "mod+i", () => m("italic")),
			v("underline", D("Underline"), "mod+u", () => m("underline")),
			v("strike", D("Strikethrough"), "mod+shift+x", () => m("strikeThrough")),
			v("code", D("Code"), "mod+e", () => h("code")),
			/* @__PURE__ */ V("span", { className: "mx-0.5 h-4 w-px bg-white/15" }),
			v("link", D("Link"), "mod+k", g),
			o && /* @__PURE__ */ V("div", {
				className: "pointer-events-none absolute inset-0 opacity-0",
				"aria-hidden": !0,
				children: /* @__PURE__ */ V(xe, {
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
// admin/src/core/SaveComponent.tsx
function Jt(e, t, n = "component") {
	let r = e.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 56) || n, i = r;
	for (let e = 2; t.has(i); e++) i = `${r}-${e}`;
	return i;
}
var Yt = [
	"Heroes",
	"Text",
	"Media",
	"Features",
	"People",
	"Lists",
	"Calls to Action",
	"Pages"
];
function Xt(e) {
	let t = document.createElement("div");
	document.body.appendChild(t);
	let n = U(t);
	n.render(e(() => setTimeout(() => {
		n.unmount(), t.remove();
	}, 250)));
}
function Zt(e) {
	return e.selection().map((t) => d(e.get().nodes, t)).filter((e) => !!e);
}
function Qt(e) {
	let t = Zt(e);
	t.length !== 0 && Xt((n) => {
		function r() {
			let [r, i] = N(!0), [a, o] = N({
				title: "",
				category: "",
				description: ""
			}), [s, c] = N(!1), l = () => {
				i(!1), n();
			}, u = async () => {
				let n = a.title.trim();
				if (n) {
					c(!0);
					try {
						let r = await ce("components/list"), i = Jt(n, new Set(r.map((e) => e.handle)));
						await ce("components/save", {
							handle: i,
							title: n,
							description: a.description.trim(),
							category: a.category.trim() || void 0,
							blocks: t
						}), re("components/"), e.replaceSelection([{
							id: w(),
							type: "component",
							props: { ref: i }
						}]), Ie.success(D("“{title}” is now a component", { title: n })), l();
					} catch (e) {
						Ie.error(e), c(!1);
					}
				}
			};
			return /* @__PURE__ */ V(be, {
				open: r,
				onOpenChange: (e) => !e && l(),
				size: "sm",
				title: D("Make a Component"),
				description: ae(t.length, "{count} block, the same on every page", "{count} blocks, the same on every page"),
				onSubmit: () => void u(),
				submitLabel: D("Make Component"),
				submitDisabled: !a.title.trim(),
				busy: s,
				children: /* @__PURE__ */ V(xe, {
					fields: [
						{
							handle: "title",
							type: "text",
							label: D("Name"),
							required: !0,
							autofocus: !0,
							max: 120,
							placeholder: D("Pricing Card")
						},
						{
							handle: "category",
							type: "text",
							label: D("Category"),
							max: 60,
							placeholder: D("Components")
						},
						{
							handle: "description",
							type: "text",
							label: D("Description"),
							max: 500,
							placeholder: D("When to Use It")
						}
					],
					values: a,
					onChange: (e, t) => o((n) => ({
						...n,
						[e]: t ?? ""
					}))
				})
			});
		}
		return /* @__PURE__ */ V(r, {});
	});
}
function $t(e) {
	let t = Zt(e);
	t.length !== 0 && Xt((e) => {
		function n() {
			let [n, r] = N(!0), [i, a] = N({
				title: "",
				category: "",
				description: ""
			}), [o, s] = N(!1), c = () => {
				r(!1), e();
			}, l = async () => {
				let e = i.title.trim();
				if (e) {
					s(!0);
					try {
						let n = await ce("patterns/list", { working: !0 }), r = Jt(e, new Set(n.map((e) => e.handle)), "pattern");
						await ce("patterns/save", {
							handle: r,
							title: e,
							description: i.description.trim(),
							category: i.category.trim() || void 0,
							blocks: t
						}), re("patterns/"), Ie.success(D("Saved “{title}” as a pattern", { title: e })), c();
					} catch (e) {
						Ie.error(e), s(!1);
					}
				}
			};
			return /* @__PURE__ */ V(be, {
				open: n,
				onOpenChange: (e) => !e && c(),
				size: "sm",
				title: D("Save as Pattern"),
				description: ae(t.length, "{count} block to start from on any page", "{count} blocks to start from on any page"),
				onSubmit: () => void l(),
				submitLabel: D("Save Pattern"),
				submitDisabled: !i.title.trim(),
				busy: o,
				children: /* @__PURE__ */ V(xe, {
					fields: [
						{
							handle: "title",
							type: "text",
							label: D("Name"),
							required: !0,
							autofocus: !0,
							max: 120,
							placeholder: D("Hero With Photo")
						},
						{
							handle: "category",
							type: "text",
							label: D("Category"),
							max: 60,
							placeholder: D("Heroes"),
							suggestions: Yt
						},
						{
							handle: "description",
							type: "text",
							label: D("Description"),
							max: 500,
							placeholder: D("When to Use It")
						}
					],
					values: i,
					onChange: (e, t) => a((n) => ({
						...n,
						[e]: t ?? ""
					}))
				})
			});
		}
		return /* @__PURE__ */ V(n, {});
	});
}
// admin/src/core/StartFromPattern.tsx
var en = "Pages";
function tn(e) {
	let t = O("patterns/list", { category: en }, {
		enabled: e,
		staleTime: 6e4
	});
	return e ? t.data ?? [] : [];
}
function nn({ open: t, onOpenChange: n, patterns: r, onChoose: i }) {
	return /* @__PURE__ */ V(be, {
		open: t,
		onOpenChange: n,
		size: "lg",
		title: D("Start From a Pattern"),
		children: /* @__PURE__ */ V("div", {
			className: "grid gap-4 sm:grid-cols-2",
			children: r.map((t) => /* @__PURE__ */ H(z, {
				onClick: () => i(t),
				className: "block min-w-0 rounded-md p-1 text-left hover:bg-hover",
				children: [
					/* @__PURE__ */ V(e, {
						handle: t.handle,
						maxHeight: 280
					}),
					/* @__PURE__ */ V("span", {
						className: "mt-2 block truncate text-sm font-medium text-text",
						children: t.title
					}),
					t.description && /* @__PURE__ */ V("span", {
						className: "mt-0.5 line-clamp-2 block text-xs text-muted",
						children: t.description
					})
				]
			}, t.handle))
		})
	});
}
// admin/src/core/insertionTargets.ts
var rn = 4, an = 6, on = 16, sn = (e) => e.left + e.width, cn = (e) => e.top + e.height, ln = (e, t) => t === "x" ? e.left + e.width / 2 : e.top + e.height / 2, un = (e, t) => t === "x" ? e.left : e.top, dn = (e, t) => t === "x" ? sn(e) : cn(e), fn = (e) => [
	e.left,
	e.top,
	e.width,
	e.height
].every(Number.isFinite) && e.width > 0 && e.height >= 0, pn = (e, t) => t.x >= e.left && t.x <= sn(e) && t.y >= e.top && t.y <= cn(e);
function mn(e, t) {
	return Math.hypot(Math.max(e.left - t.x, 0, t.x - sn(e)), Math.max(e.top - t.y, 0, t.y - cn(e)));
}
function hn(e, t) {
	return Math.min(cn(e), cn(t)) - Math.max(e.top, t.top) > 0 && Math.abs(ln(t, "x") - ln(e, "x")) > Math.abs(ln(t, "y") - ln(e, "y")) ? "x" : "y";
}
function gn(e, t, n) {
	let r = Math.min(cn(e), cn(t)) - Math.max(e.top, t.top), i = Math.min(sn(e), sn(t)) - Math.max(e.left, t.left);
	return n === "x" && r > 0 ? "x" : n === "y" && i > 0 ? "y" : hn(e, t);
}
function _n(e, t) {
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
function vn(e, t) {
	let { byId: n, depth: r, isExcluded: i } = _n(e, t.excludeIds), a = /* @__PURE__ */ new Map([[null, []]]);
	for (let t of e) {
		if (!fn(t.rect) || !t.container && t.rect.height === 0 || i(t)) continue;
		let e = a.get(t.parentId) ?? [];
		e.push(t), a.set(t.parentId, e), t.container && !a.has(t.id) && a.set(t.id, []);
	}
	let o = [];
	for (let [e, i] of a) {
		let a = e === null ? null : n.get(e), s = e === null ? t.rootRect : a?.rect;
		if (!s || !fn(s)) continue;
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
			let f = Math.sign(i - r), p = Math.min(Math.abs(i - r) / 2, rn), m = l === "from" ? r + f * p : l === "to" ? i - f * p : (r + i) / 2, h = Math.min(r, i), g = Math.abs(i - r), _ = n === "x" ? {
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
				width: Math.max(sn(e), sn(t)) - n,
				height: Math.max(cn(e), cn(t)) - r
			};
		}, m = c[0], h = c.at(-1), g = c.length > 1 ? gn(m.rect, c[1].rect, l) : l ?? "y", _ = c.length > 1 ? gn(c.at(-2).rect, h.rect, l) : l ?? "y", v = c.length < 2 || ln(c[1].rect, g) >= ln(m.rect, g), y = c.length < 2 || ln(h.rect, _) >= ln(c.at(-2).rect, _), b = v ? un(m.rect, g) : dn(m.rect, g), x = y ? dn(h.rect, _) : un(h.rect, _);
		f(m.index, g, v ? un(s, g) : dn(s, g), b, g === "x" ? m.rect : s, m.rect, "edge", "to");
		for (let e = 1; e < c.length; e++) {
			let t = c[e - 1], n = c[e], r = gn(t.rect, n.rect, l), i = ln(n.rect, r) >= ln(t.rect, r), a = i ? dn(t.rect, r) : un(t.rect, r), o = i ? un(n.rect, r) : dn(n.rect, r), u = Math.max(t.rect.top, n.rect.top), d = Math.min(cn(t.rect), cn(n.rect)), m = r === "x" ? {
				left: s.left,
				top: u,
				width: s.width,
				height: Math.max(0, d - u)
			} : s, h = i ? o < a : o > a;
			f(n.index, r, h ? (a + o) / 2 : a, h ? (a + o) / 2 : o, m, r === "x" && m.height > 0 ? m : p(t.rect, n.rect), "between");
		}
		f(h.index + 1, _, x, y ? dn(s, _) : un(s, _), _ === "x" ? h.rect : s, h.rect, "edge", "from");
	}
	return o;
}
function yn(e, t, n) {
	if (![t.x, t.y].every(Number.isFinite)) return null;
	let r = vn(e, n).flatMap((e) => {
		if (e.inside) return [];
		let n = e.axis === "x", r = n ? t.x : t.y, i = n ? t.y : t.x, a = (n ? e.rect.left : e.rect.top) + 1, o = n ? e.hitRect.left : e.hitRect.top, s = n ? e.hitRect.width : e.hitRect.height, c = Math.max(0, an - s / 2), l = Math.max(o - c, a - on), u = Math.min(o + s + c, a + on), d = n ? e.hitRect.top : e.hitRect.left, f = d + (n ? e.hitRect.height : e.hitRect.width);
		return r >= l && r <= u && i >= d && i <= f ? [{
			target: e,
			distance: Math.abs(r - a)
		}] : [];
	});
	if (!r.length) return null;
	let i = Math.min(...r.map((e) => e.distance));
	return r.filter((e) => e.distance <= i + 2).sort((e, t) => Number(e.target.kind === "edge") - Number(t.target.kind === "edge") || t.target.depth - e.target.depth || e.distance - t.distance)[0].target;
}
function bn(e, t, n) {
	if (![t.x, t.y].every(Number.isFinite)) return null;
	let { isExcluded: r } = _n(e, n.excludeIds);
	return e.some((e) => r(e) && pn(e.rect, t)) ? null : vn(e, n).map((e) => ({
		target: e,
		distance: mn(e.inside ? e.hitRect : e.rect, t)
	})).filter(({ distance: e }) => e <= (n.maxDistance ?? 80)).sort((e, t) => e.distance - t.distance || t.target.depth - e.target.depth)[0]?.target ?? null;
}
// admin/src/core/QuickInserter.tsx
var xn = "cms:blocks:recent", Sn = [
	"paragraph",
	"heading",
	"image",
	"list",
	"button",
	"box"
], Cn = 6, wn = 9, Tn = 3;
function En() {
	try {
		let e = JSON.parse(localStorage.getItem(xn) ?? "[]");
		return Array.isArray(e) ? e.filter((e) => typeof e == "string") : [];
	} catch {
		return [];
	}
}
function Dn(e) {
	if (e.kind === "block") try {
		localStorage.setItem(xn, JSON.stringify([e.type.name, ...En().filter((t) => t !== e.type.name)].slice(0, 12)));
	} catch {}
}
function On({ types: e, allowed: t, onChoose: a, onClose: s }) {
	let [l, u] = N(""), [d, f] = N(!1), [p, m] = N(0), { items: h } = i(e, l, t, !!l.trim()), g = ve(() => {
		if (l.trim()) return h.slice(0, wn);
		let e = [...En(), ...Sn], t = (t) => {
			let n = t.kind === "block" ? e.indexOf(t.type.name) : -1;
			return n < 0 ? e.length : n;
		};
		return h.filter((e) => e.kind === "block").sort((e, n) => t(e) - t(n)).slice(0, Cn);
	}, [h, l]);
	j(() => m(0), [l]);
	let _ = (e) => {
		Dn(e), a(e);
	};
	return d ? /* @__PURE__ */ V("div", {
		"data-cms-insert-menu": !0,
		"data-cms-browse": !0,
		children: /* @__PURE__ */ V(c, {
			types: e,
			query: l,
			onQuery: u,
			allowed: t,
			onChoose: _,
			onClose: s
		})
	}) : /* @__PURE__ */ H("div", {
		"data-cms-insert-menu": !0,
		className: "flex w-[300px] flex-col",
		onKeyDown: (e) => {
			let t = {
				ArrowRight: 1,
				ArrowLeft: -1,
				ArrowDown: Tn,
				ArrowUp: -3
			}[e.key];
			t && g.length ? (e.preventDefault(), m((e) => Math.max(0, Math.min(g.length - 1, e + t)))) : e.key === "Enter" && g[p] ? (e.preventDefault(), _(g[p])) : e.key === "Escape" && (e.preventDefault(), s());
		},
		children: [
			/* @__PURE__ */ V("div", {
				className: "p-2 pb-0",
				children: /* @__PURE__ */ V(xe, {
					bare: !0,
					fields: [{
						handle: "query",
						type: "text",
						label: D("Search"),
						icon: "search",
						size: "sm",
						autofocus: !0,
						placeholder: D("Search Blocks")
					}],
					values: { query: l },
					onChange: (e, t) => u(t ?? "")
				})
			}),
			/* @__PURE__ */ H("div", {
				role: "listbox",
				"aria-label": l.trim() ? D("Results") : D("Suggestions"),
				className: "grid grid-cols-3 gap-1 p-2",
				children: [g.map((e, t) => {
					let i = n(e), a = r(e);
					return /* @__PURE__ */ H(P, {
						variant: "ghost",
						role: "option",
						"aria-selected": t === p,
						"data-index": t,
						onMouseMove: () => t !== p && m(t),
						onMouseDown: (e) => e.preventDefault(),
						onClick: () => _(e),
						"data-active": t === p || void 0,
						className: "!h-[68px] min-w-0 shrink !flex-col !gap-1.5 !px-1",
						children: [/* @__PURE__ */ V(F, {
							name: a,
							size: 20
						}), /* @__PURE__ */ V("span", {
							className: "w-full truncate text-center text-xs font-medium",
							children: i
						})]
					}, o(e));
				}), !g.length && /* @__PURE__ */ V("div", {
					className: "col-span-3 px-3 py-5 text-center text-xs text-faint",
					children: D("No matching blocks")
				})]
			}),
			/* @__PURE__ */ H(P, {
				variant: "ghost",
				size: "lg",
				onMouseDown: (e) => e.preventDefault(),
				onClick: () => f(!0),
				className: "!h-9 !gap-1.5 !rounded-none border-t border-border !text-sm focus-visible:!-outline-offset-2",
				children: [D("Browse All"), /* @__PURE__ */ V(F, {
					name: "arrow-right",
					size: 14,
					className: "text-muted"
				})]
			})
		]
	});
}
// admin/src/core/canvas.ts
function kn(e, t) {
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
function An(e, t) {
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
var jn = "/_cms/site/";
function Mn(e, t = location.href) {
	try {
		let n = new URL(e, t);
		return n.origin === location.origin && n.pathname.startsWith(jn) ? n.pathname : null;
	} catch {
		return null;
	}
}
var Nn = /\bimport\s*(?:[\w$*{}\s,]+?\s*from\s*)?["']([^"']+)["']|\bexport\s*[\w$*{}\s,]*?\s*from\s*["']([^"']+)["']|\bimport\s*\(\s*["']([^"']+)["']\s*\)/g;
async function Pn(e, t) {
	let n = {}, r = {}, i = /* @__PURE__ */ new Set(), a = async (e) => {
		if (i.has(e) || i.size > 200) return;
		i.add(e);
		let o = await fetch(e, { credentials: "same-origin" }).then((e) => e.ok ? e.text() : "", () => ""), s = [];
		for (let i of o.matchAll(Nn)) {
			let a = i[1] ?? i[2] ?? i[3], o = /^(\/|\.\/|\.\.\/)/.test(a), c = o ? Mn(a, location.origin + e) : a, l = c ? Mn(t.imports?.[c] ?? (o ? c : "")) : null;
			c && l && (t.imports?.[c] && (n[c] = l), t.integrity?.[l] && (r[l] = t.integrity[l]), s.push(l));
		}
		await Promise.all(s.map(a));
	};
	return await a(e), {
		imports: n,
		...Object.keys(r).length ? { integrity: r } : {}
	};
}
async function Fn(e, t) {
	let n;
	try {
		n = JSON.parse(e.querySelector("script[data-cms-importmap]")?.textContent ?? "{}");
	} catch {
		return null;
	}
	let r = await Pn(t, n);
	if (!Object.keys(r.imports ?? {}).length) return null;
	let i = document.createElement("script");
	return i.type = "importmap", i.dataset.cmsCanvas = "", i.nonce = document.querySelector("script[nonce]")?.nonce ?? "", i.textContent = JSON.stringify(r), document.head.append(i), i;
}
function In(e) {
	try {
		return JSON.parse(e.dataset.cmsCanvas ?? "[]").flatMap((e) => {
			let t = typeof e?.src == "string" ? Mn(e.src) : null;
			return t ? [{
				...e,
				src: t
			}] : [];
		});
	} catch {
		return [];
	}
}
var Ln = (e, t) => console.error("[cms] canvas behavior", e, t);
function Rn() {
	let e = [], t = [];
	async function n(e, n, r) {
		let i = r.defaultView;
		if (i) try {
			let a = await Fn(r, n.src);
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
			}, c = o.mount ?? o.default, l = await kn(i, () => c?.(e.el, n.props ?? {}, s));
			if (e.abort.signal.aborted) {
				typeof l == "function" && l();
				return;
			}
			typeof l == "function" && (e.cleanup = l), e.unpicture = An(e.el, i);
		} catch (e) {
			Ln(n.src, e);
		}
	}
	return {
		mount(t) {
			for (let r of t.querySelectorAll("[data-cms-canvas]")) for (let i of In(r)) {
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
					Ln(e.module ? "unmount" : "mount", t);
				}
			}
			t.forEach((e) => e.remove()), t = [];
		}
	};
}
// admin/src/core/morph.ts
function zn(e, t) {
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
function Bn(e) {
	let t = M(e);
	t.current = e;
	let [n, r] = N(null), i = M(null), a = M(() => {});
	return j(() => {
		e.disabled && a.current();
	}, [e.disabled]), j(() => () => a.current(), []), {
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
var Vn = 32, Hn = 6, Un = 4;
function Wn({ target: e, position: t, ...n }) {
	let r = t(e.rect);
	return /* @__PURE__ */ H(ze, { children: [/* @__PURE__ */ V("div", {
		"data-cms-insertion-line": !0,
		className: B("pointer-events-none absolute z-raised rounded-full bg-focus", e.axis === "x" ? "cms-block-line-y" : "cms-block-line-x"),
		style: {
			...r,
			minWidth: 2,
			minHeight: 2
		}
	}), /* @__PURE__ */ V(qn, {
		...n,
		label: D("Insert Block"),
		className: "cms-block-plus absolute size-6 -translate-x-1/2 -translate-y-1/2 rounded-xs bg-signal text-signal-ink shadow-sm",
		style: {
			left: r.left + r.width / 2,
			top: r.top + r.height / 2
		},
		data: { "data-cms-inserter": `${e.parentId ?? ""}:${e.index}` }
	})] });
}
function Gn({ target: e, position: t, ...n }) {
	let r = t(e.hitRect);
	return /* @__PURE__ */ V(qn, {
		...n,
		label: D("Insert Block"),
		className: "cms-block-chrome absolute size-7 -translate-x-1/2 -translate-y-1/2 rounded-sm border border-border-strong bg-bg text-muted shadow-sm hover:border-focus hover:text-focus",
		style: {
			left: r.left + r.width / 2,
			top: r.top + Math.min(r.height / 2, 40)
		},
		data: { "data-cms-appender": e.parentId ?? "" }
	});
}
function Kn({ target: e, position: t, onWrite: n, onPattern: r, ...i }) {
	let a = t(e.hitRect);
	return /* @__PURE__ */ H("div", {
		"data-cms-document-appender": !0,
		className: "cms-block-chrome pointer-events-auto absolute z-raised flex h-10 whitespace-nowrap -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-md border border-dashed border-border-strong bg-bg/90 py-1 pl-3 pr-1 shadow-sm",
		style: {
			left: a.left + a.width / 2,
			top: a.top + Math.max(24, Math.min(a.height / 2, 120))
		},
		children: [
			n && /* @__PURE__ */ V(z, {
				compact: !0,
				onClick: n,
				className: "cms-focus-ring h-8 rounded-xs px-1 text-sm text-muted hover:text-text",
				children: D("Write, or press “/” for blocks")
			}),
			r && /* @__PURE__ */ H(ze, { children: [/* @__PURE__ */ V("span", { className: "mx-1 h-4 border-l border-border" }), /* @__PURE__ */ V(z, {
				compact: !0,
				onClick: r,
				className: "cms-focus-ring h-8 rounded-xs px-1 text-sm text-muted hover:text-text",
				children: D("Start From a Pattern")
			})] }),
			/* @__PURE__ */ V(qn, {
				...i,
				label: D("Insert Block"),
				className: "size-8 rounded-xs text-muted hover:bg-hover hover:text-text"
			})
		]
	});
}
function qn({ open: e, onOpenChange: t, returnFocus: n, children: r, label: i, className: a, style: o, data: s }) {
	return /* @__PURE__ */ V(we, {
		open: e,
		onOpenChange: t,
		side: "bottom",
		align: "center",
		className: "!overflow-hidden !p-0",
		returnFocus: n,
		trigger: /* @__PURE__ */ V(z, {
			compact: !0,
			...s,
			"aria-label": e ? D("Close") : i,
			"aria-expanded": e,
			className: B("cms-focus-ring pointer-events-auto z-drag grid place-items-center", a),
			style: o,
			children: /* @__PURE__ */ V(F, {
				name: "plus",
				size: 14,
				className: B("cms-block-plus-icon", e && "rotate-45")
			})
		}),
		children: e && r
	});
}
function Jn({ id: e, label: t, icon: n, parent: r, box: i, viewport: a, canMoveUp: o, canMoveDown: s, onSelectParent: c, onDrag: l, onMove: u, onInsert: d, onDuplicate: f, onMakeComponent: p, onSavePattern: m, onDelete: h, covers: g }) {
	let _ = M(null), [v, y] = N(240);
	_e(() => {
		_.current && y(_.current.offsetWidth);
	});
	let b = i.top + i.height;
	if (b < 40 || i.top > a.height - Vn || i.left > a.width || i.left + i.width < 0) return null;
	let x = (e) => Math.max(Un, Math.min(a.width - v - Un, e)), ee = x(i.left), te = x(i.left + i.width - v), S = i.top - Vn - Hn, C = b + Hn, w = Math.max(Un, i.top + Un), T = (e) => e >= Un && e + Vn <= a.height - Un, { left: E, top: ne } = [
		S,
		C,
		w
	].flatMap((e) => [{
		left: ee,
		top: e
	}, {
		left: te,
		top: e
	}]).find((e) => T(e.top) && !g?.({
		...e,
		width: v,
		height: Vn
	})) ?? {
		left: ee,
		top: T(S) ? S : w
	};
	return /* @__PURE__ */ H("div", {
		ref: _,
		"data-cms-block-controls": e,
		role: "toolbar",
		"aria-label": D("Block Actions"),
		className: "cms-block-chrome pointer-events-auto absolute z-bar flex h-8 items-center gap-0.5 rounded-sm border border-border bg-bg pl-0.5 pr-1 shadow-pop",
		style: {
			left: E,
			top: ne
		},
		children: [
			/* @__PURE__ */ V(z, {
				compact: !0,
				"aria-label": D("Drag to Reorder"),
				title: D("Drag to Reorder"),
				className: "cms-focus-ring grid h-6 w-4 touch-none cursor-grab place-items-center rounded-xs text-faint hover:bg-hover hover:text-muted active:cursor-grabbing",
				onPointerDown: l,
				children: /* @__PURE__ */ V(F, {
					name: "drag",
					size: 12
				})
			}),
			r && /* @__PURE__ */ V(ke, {
				content: D("Select {block}", { block: r.label }),
				children: /* @__PURE__ */ V(I, {
					size: "xs",
					icon: "arrow-elbow-left-up",
					label: D("Select {block}", { block: r.label }),
					onClick: c
				})
			}),
			/* @__PURE__ */ V("span", { className: "mx-0.5 h-4 border-l border-border" }),
			/* @__PURE__ */ H("span", {
				className: "flex h-6 max-w-40 items-center gap-1.5 px-1 text-xs font-medium text-text",
				children: [/* @__PURE__ */ V(F, {
					name: n,
					size: 14,
					className: "shrink-0 text-muted"
				}), /* @__PURE__ */ V("span", {
					className: "truncate",
					children: t
				})]
			}),
			/* @__PURE__ */ V(I, {
				size: "xs",
				icon: "chevron-up",
				label: D("Move Up"),
				disabled: !o,
				onClick: () => u(-1)
			}),
			/* @__PURE__ */ V(I, {
				size: "xs",
				icon: "chevron-down",
				label: D("Move Down"),
				disabled: !s,
				onClick: () => u(1)
			}),
			/* @__PURE__ */ V("span", { className: "mx-0.5 h-4 border-l border-border" }),
			/* @__PURE__ */ V(L, {
				align: "end",
				trigger: /* @__PURE__ */ V(I, {
					size: "xs",
					icon: "more",
					label: D("More Block Actions")
				}),
				items: [
					{
						label: D("Insert Before"),
						icon: "arrow-up",
						shortcut: "alt+mod+t",
						onSelect: () => d("before")
					},
					{
						label: D("Insert After"),
						icon: "arrow-down",
						shortcut: "alt+mod+y",
						onSelect: () => d("after")
					},
					{
						label: D("Duplicate"),
						icon: "duplicate",
						shortcut: "mod+d",
						onSelect: f
					},
					p && {
						label: D("Make a Component"),
						icon: "symbol",
						onSelect: p
					},
					m && {
						label: D("Save as Pattern"),
						icon: "section-copy",
						onSelect: m
					},
					{
						separator: !0,
						label: ""
					},
					{
						label: D("Delete"),
						icon: "trash",
						danger: !0,
						shortcut: "⌫",
						onSelect: h
					}
				]
			})
		]
	});
}
function Yn({ drag: e, position: t }) {
	return /* @__PURE__ */ H(ze, { children: [
		/* @__PURE__ */ V("div", {
			"data-cms-drag-overlay": !0,
			className: "pointer-events-auto absolute inset-0 z-bar cursor-grabbing touch-none"
		}),
		e.target && /* @__PURE__ */ V("div", {
			"data-cms-drop-indicator": !0,
			className: "pointer-events-none absolute z-drawer rounded-full bg-focus",
			style: {
				...t(e.target.rect),
				minWidth: 2,
				minHeight: 2
			}
		}),
		/* @__PURE__ */ H("div", {
			"data-cms-drag-ghost": !0,
			className: "pointer-events-none fixed z-tooltip flex max-w-56 items-center gap-2 truncate rounded-sm border border-border-strong bg-bg px-3 py-2 text-xs text-ink shadow-pop",
			style: {
				left: Math.max(8, Math.min(window.innerWidth - 232, e.point.x + 16)),
				top: Math.max(8, Math.min(window.innerHeight - 40, e.point.y + 16))
			},
			children: [/* @__PURE__ */ V(F, {
				name: "drag",
				size: 14
			}), /* @__PURE__ */ V("span", {
				className: "truncate",
				children: e.label
			})]
		})
	] });
}
// admin/src/builder/bus.ts
var Xn = new EventTarget(), Zn = {
	emit(e, t) {
		Xn.dispatchEvent(new CustomEvent(e, { detail: t }));
	},
	on(e, t) {
		let n = (e) => t(e.detail);
		return Xn.addEventListener(e, n), () => Xn.removeEventListener(e, n);
	}
}, Qn = fe({
	stops: () => [],
	settings: () => {},
	readOnly: !1
}), $n = () => A(Qn);
function er(e = "") {
	return {
		id: w(),
		type: "paragraph",
		props: { text: e }
	};
}
function tr(e, t, n, r) {
	return e.id === t && e.prop === n && (r === void 0 || e.index === r);
}
function nr(e, t, n) {
	e.focus(t.id, n, t.prop, t.index);
}
function rr(e, t, n) {
	if (!t) return;
	let r = /* @__PURE__ */ new Set(), i = (e) => {
		r.add(e.id), e.children?.forEach(i);
	};
	i(t);
	let a = n.find((e) => r.has(e.id));
	a ? nr(e, a, "start") : e.select(t.id, !0);
}
function ir(e) {
	let t = e.getElementById("f-title");
	return t ? (t.focus(), t.setSelectionRange(t.value.length, t.value.length), !0) : !1;
}
function ar(e, t, n, r, i) {
	if (e.shiftKey || e.metaKey || e.ctrlKey || e.altKey) return !1;
	let a = e.key === "ArrowUp" && Pt(t) || e.key === "ArrowLeft" && kt(t), o = e.key === "ArrowDown" && Ft(t) || e.key === "ArrowRight" && At(t);
	if (a) {
		let a = r[i - 1];
		if (a) nr(n, a, "end");
		else if (e.key !== "ArrowUp" || !ir(t.ownerDocument)) return !1;
		return e.preventDefault(), !0;
	}
	if (o) {
		let t = r[i + 1];
		return t ? (e.preventDefault(), nr(n, t, "start"), !0) : !1;
	}
	return !1;
}
// admin/src/write/outline.ts
var or = [
	"paragraph",
	"heading",
	"quote",
	"callout"
];
function sr(e) {
	return e.kind === "actions" ? e.nodes : [e.node];
}
function cr(e) {
	return sr(e)[0].id;
}
function lr(e, t, n) {
	let r = {
		types: t,
		custom: n
	}, i = [];
	for (let t of e) {
		let e = fr(t, null, !1, r), n = e.kind === "container" || e.kind === "columns", a = i.at(-1);
		!n && a && !a.container ? mr(a.rows, e) : i.push({
			id: t.id,
			label: n && t.label?.trim() || null,
			rows: [e],
			container: n
		});
	}
	return i;
}
function ur(e) {
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
function dr(e) {
	let t = [], n = (e) => {
		for (let r of e) if (t.push(r), r.kind === "columns") for (let e of r.columns) n(e.rows);
		else r.kind === "container" && n(r.rows);
	};
	for (let t of e) n(t.rows);
	return t;
}
function fr(e, t, n, r) {
	let i = n || !!e.hidden, a = {
		parent: t,
		hidden: i
	}, o = r.types.get(e.type), s = r.custom(e.type), c = (e.children?.length ?? 0) > 0;
	return e.type === "columns" && o && !s ? {
		kind: "columns",
		node: e,
		columns: (e.children ?? []).map((e) => ({
			node: e,
			rows: pr(e.children ?? [], e.id, i || !!e.hidden, r)
		})),
		...a
	} : !s && o && !c && (e.type === "button" || e.type === "link") ? {
		kind: "actions",
		nodes: [e],
		...a
	} : o?.children || c ? {
		kind: "container",
		node: e,
		rows: pr(e.children ?? [], e.id, i, r),
		...a
	} : !o || s ? {
		kind: "block",
		node: e,
		...a
	} : or.includes(e.type) ? {
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
function pr(e, t, n, r) {
	let i = [];
	for (let a of e) mr(i, fr(a, t, n, r));
	return i;
}
function mr(e, t) {
	let n = e.at(-1);
	t.kind === "actions" && n?.kind === "actions" && n.parent === t.parent && n.hidden === t.hidden ? n.nodes.push(...t.nodes) : e.push(t);
}
// admin/src/write/slash.ts
var hr = null, gr = /* @__PURE__ */ new Set();
function _r(e) {
	return hr?.id === e ? hr : null;
}
function vr(e) {
	JSON.stringify(e) !== JSON.stringify(hr) && (hr = e, gr.forEach((e) => e()));
}
function yr() {
	return ye((e) => (gr.add(e), () => gr.delete(e)), () => hr);
}
function br(e, t = 360, n = 300) {
	let r = window.innerHeight - e.bottom - 6 - 8, i = e.top - 6 - 8, a = r >= Math.min(t, 220) || r >= i;
	return {
		left: Math.max(8, Math.min(window.innerWidth - n - 8, e.left - 4)),
		top: a ? e.bottom + 6 : void 0,
		bottom: a ? void 0 : window.innerHeight - e.top + 6,
		maxHeight: Math.max(120, Math.min(t, a ? r : i))
	};
}
function xr(e, t) {
	j(() => {
		if (!e) return;
		let n = (e) => !e.target?.closest?.("[data-cms-slash]") && vr(null), r = t.filter((e) => !!e);
		return r.forEach((e) => e.addEventListener("pointerdown", n, !0)), () => r.forEach((e) => e.removeEventListener("pointerdown", n, !0));
	}, [e, ...t]);
}
// admin/src/write/Text.tsx
var Sr = {
	1: "text-display font-semibold",
	2: "text-3xl font-semibold",
	3: "text-2xl font-semibold",
	4: "text-xl font-semibold",
	5: "text-lg font-semibold",
	6: "text-base font-semibold uppercase tracking-[0.04em] text-muted"
}, Cr = "text-lg leading-7", wr = {
	note: {
		icon: "info",
		className: "bg-surface",
		label: () => D("Note")
	},
	tip: {
		icon: "sparkle",
		className: "bg-success/7",
		label: () => D("Tip")
	},
	warning: {
		icon: "warning",
		className: "bg-warning/9",
		label: () => D("Warning")
	},
	danger: {
		icon: "error",
		className: "bg-danger/7",
		label: () => D("Danger")
	}
};
function Tr({ node: e }) {
	if (e.type === "quote") return /* @__PURE__ */ H("blockquote", {
		className: "m-0 border-l-[3px] border-text/80 py-0.5 pl-4",
		children: [/* @__PURE__ */ V(Or, {
			node: e,
			prop: "text",
			className: "text-lg leading-7",
			placeholder: D("Quote")
		}), /* @__PURE__ */ V(Or, {
			node: e,
			prop: "cite",
			className: "cms-block-cite mt-1 text-sm text-muted",
			placeholder: D("Attribution"),
			quiet: !0
		})]
	});
	if (e.type === "callout") return /* @__PURE__ */ V(Dr, { node: e });
	if (e.type === "heading") {
		let t = String(e.props.level ?? 2);
		return /* @__PURE__ */ V(Or, {
			node: e,
			prop: "text",
			tag: `h${t}`,
			className: Sr[t] ?? Sr[2],
			placeholder: D("Heading {level}", { level: t })
		});
	}
	return /* @__PURE__ */ V(Er, { node: e });
}
function Er({ node: e }) {
	let { store: t } = a(), n = W(t, (t) => t.nodes.length === 1 && t.nodes[0].id === e.id);
	return /* @__PURE__ */ V(Or, {
		node: e,
		prop: "text",
		tag: "p",
		className: Cr,
		placeholder: D("Write, or press “/” for blocks"),
		quiet: !n
	});
}
function Dr({ node: e }) {
	let { store: t } = a(), { readOnly: n } = $n(), r = wr[e.props.tone] ?? wr.note;
	return /* @__PURE__ */ H("div", {
		className: B("flex gap-3 rounded-md px-4 py-3", r.className),
		children: [/* @__PURE__ */ V(L, {
			align: "start",
			trigger: /* @__PURE__ */ V(z, {
				compact: !0,
				disabled: n,
				"aria-label": D("Callout Style"),
				className: "grid h-[27px] w-5 shrink-0 place-items-center rounded-xs text-muted hover:text-text",
				children: /* @__PURE__ */ V(F, {
					name: r.icon,
					size: 17
				})
			}),
			items: Object.entries(wr).map(([n, r]) => ({
				label: r.label(),
				icon: r.icon,
				checked: n === (e.props.tone ?? "note"),
				onSelect: () => t.updateProps(e.id, { tone: n })
			}))
		}), /* @__PURE__ */ V(Or, {
			node: e,
			prop: "text",
			className: B(Cr, "min-w-0 flex-1"),
			placeholder: D("Write a note")
		})]
	});
}
function Or({ node: e, prop: t, tag: n = "div", className: r, placeholder: i, quiet: o }) {
	let { store: c, types: l, allowed: u } = a(), { stops: m, readOnly: _ } = $n(), v = W(c, (n) => n.focus?.id === e.id && (n.focus.prop ?? "text") === t ? n.focus : null), y = String(e.props[t] ?? ""), b = (n, r) => {
		if (e.type === "paragraph" && t === "text" && x(n, r)) return;
		c.updateProps(e.id, { [t]: n }, `text:${e.id}:${t}`);
		let i = e.type === "paragraph" ? n.replace(/<[^>]+>/g, "").match(/^\/([\w-]*)$/) : null;
		vr(i ? {
			id: e.id,
			query: i[1]
		} : null);
	}, x = (t, n) => {
		let r = t.replace(/&nbsp;/g, " "), i = (t, r, i) => {
			let a = p(c.get().nodes, e.id), o = a?.parentId ? d(c.get().nodes, a.parentId) : null;
			if (!l.has(t) || !te(o, t, l, o ? [] : u)) return !1;
			let s = Math.max(0, Mt(n) - zt(i));
			return c.updateNode(e.id, {
				type: t,
				props: r
			}), c.focus(e.id, s, t === "list" ? "items" : "text", t === "list" ? 0 : void 0), !0;
		}, a;
		if (a = r.match(/^(#{1,4}) /)) return i("heading", {
			text: r.slice(a[0].length),
			level: String(a[1].length)
		}, a[0]);
		if (a = r.match(/^[-*] /)) return i("list", {
			items: [r.slice(2)],
			ordered: !1
		}, a[0]);
		if (a = r.match(/^1[.)] /)) return i("list", {
			items: [r.slice(3)],
			ordered: !0
		}, a[0]);
		if (a = r.match(/^(>|&gt;) /)) return i("quote", {
			text: r.slice(a[0].length),
			cite: ""
		}, a[0]);
		if (a = r.match(/^! /)) return i("callout", {
			text: r.slice(2),
			tone: "note"
		}, a[0]);
		if (r === "```") return i("code", {
			code: "",
			language: "plain"
		}, r);
		if (r === "---" && l.has("divider") && (u.length === 0 || u.includes("divider"))) {
			let t = er(), { nodes: n } = c.get(), r = p(n, e.id);
			return c.commit(S(C(n, e.id, (e) => ({
				...e,
				type: "divider",
				props: {}
			})), r?.parentId ?? null, (r?.index ?? n.length) + 1, [t])), c.focus(t.id, "start"), !0;
		}
		return !1;
	}, ee = (n, r) => {
		if (n.defaultPrevented) return;
		let i = m(), a = i.findIndex((n) => tr(n, e.id, t)), o = i[a], { nodes: _ } = c.get();
		if (n.key === "Enter" && !n.shiftKey && !n.metaKey && !n.ctrlKey && !n.altKey) {
			n.preventDefault();
			let i = _r(e.id);
			if (i && s(!0, !!document.querySelector("[data-cms-slash]"))) return vr({
				...i,
				enter: !0
			});
			if (t === "cite") {
				let t = er(), n = g(_, e.id, "paragraph", l, u);
				if (!n) return;
				c.insert(n.parentId, n.index, [t]), c.focus(t.id, "start");
				return;
			}
			let [a, o] = Nt(r);
			if (f(a) && !f(o)) {
				let t = p(_, e.id);
				if (!t) return;
				c.insert(t.parentId, t.index, [er()]), c.focus(e.id, "start");
				return;
			}
			let d = e.type === "paragraph" ? {
				id: w(),
				type: "paragraph",
				props: {
					...e.props,
					text: o
				},
				...e.class ? { class: e.class } : {}
			} : er(o), m = g(_, e.id, "paragraph", l, u);
			if (!m) return;
			c.commit(S(C(_, e.id, (e) => ({
				...e,
				props: {
					...e.props,
					[t]: a
				}
			})), m.parentId, m.index, [d])), c.focus(d.id, "start");
		} else if (n.key === "Backspace" && kt(r)) {
			if (t === "cite") {
				f(y) && (n.preventDefault(), c.focus(e.id, "end", "text"));
				return;
			}
			if (e.type !== "paragraph") {
				n.preventDefault(), c.updateNode(e.id, {
					type: "paragraph",
					props: { text: y }
				}), c.focus(e.id, "start");
				return;
			}
			let r = i[a - 1];
			if (!r) return;
			if (n.preventDefault(), f(y)) {
				c.remove(e.id), nr(c, r, "end");
				return;
			}
			if (r.parent === o?.parent && T(r, y)) return;
			nr(c, r, "end");
		} else if (n.key === "Delete" && At(r) && t === "text") {
			let t = i[a + 1], r = t && t.prop === "text" && t.parent === o?.parent ? d(_, t.id) : null;
			if (!r || !["paragraph", "heading"].includes(r.type)) return;
			n.preventDefault();
			let s = zt(y);
			c.commit(h(C(_, e.id, (e) => ({
				...e,
				props: {
					...e.props,
					text: y + String(r.props.text ?? "")
				}
			})), r.id)), c.focus(e.id, s);
		} else ar(n, r, c, i, a) || n.key === "Escape" && (n.preventDefault(), r.blur(), c.select(e.id, !0));
	}, T = (t, n) => {
		let { nodes: r } = c.get(), i = d(r, t.id);
		if (!i) return !1;
		if (t.prop === "items") {
			let a = [...i.props.items ?? [""]], o = a[t.index ?? 0] ?? "";
			return a[t.index ?? 0] = o + n, c.commit(h(C(r, i.id, (e) => ({
				...e,
				props: {
					...e.props,
					items: a
				}
			})), e.id)), nr(c, t, zt(o)), !0;
		}
		if (t.prop !== "text" || ![
			"paragraph",
			"heading",
			"quote",
			"callout"
		].includes(i.type)) return !1;
		let a = String(i.props.text ?? "");
		return c.commit(h(C(r, i.id, (e) => ({
			...e,
			props: {
				...e.props,
				text: a + n
			}
		})), e.id)), nr(c, t, zt(a)), !0;
	};
	return /* @__PURE__ */ V(Wt, {
		tag: n,
		html: y,
		onChange: b,
		placeholder: i,
		quiet: o,
		className: r,
		focus: v,
		disabled: _,
		onKeyDown: ee,
		onFocus: () => c.get().selected !== e.id && c.select(e.id),
		onPaste: (n) => !n.includes("\n") || t !== "text" ? !1 : (import("./paste-D7cHCkV-.js").then((t) => t.pasteMarkdown(c, e, n, l, u)), !0)
	});
}
function kr({ node: e, renderItem: t }) {
	let { store: n, types: r, allowed: i } = a(), { stops: o, readOnly: s } = $n(), c = Array.isArray(e.props.items) && e.props.items.length ? e.props.items : [""], l = W(n, (t) => t.focus?.id === e.id && t.focus.prop === "items" ? t.focus : null), u = !!e.props.ordered, d = (t, r = `list:${e.id}`) => n.updateProps(e.id, { items: t }, r), m = (t) => (a, s) => {
		if (a.defaultPrevented) return;
		let { nodes: l } = n.get(), u = o(), m = u.findIndex((n) => tr(n, e.id, "items", t));
		if (a.key === "Enter" && !a.shiftKey && !a.metaKey && !a.ctrlKey) {
			if (a.preventDefault(), f(c[t]) && t === c.length - 1) {
				let t = er(), a = c.slice(0, -1), o = g(l, e.id, "paragraph", r, i);
				if (!o) return;
				let s = a.length ? C(l, e.id, (e) => ({
					...e,
					props: {
						...e.props,
						items: a
					}
				})) : l, u = S(s, o.parentId, o.index, [t]);
				n.commit(a.length ? u : h(u, e.id)), n.focus(t.id, "start");
				return;
			}
			let [o, u] = Nt(s);
			d([
				...c.slice(0, t),
				o,
				u,
				...c.slice(t + 1)
			], ""), n.focus(e.id, "start", "items", t + 1);
		} else if (a.key === "Backspace" && kt(s)) {
			if (a.preventDefault(), t === 0) {
				let t = er(c[0]), r = p(l, e.id), i = c.slice(1), a = S(l, r?.parentId ?? null, r?.index ?? 0, [t]);
				a = i.length ? C(a, e.id, (e) => ({
					...e,
					props: {
						...e.props,
						items: i
					}
				})) : h(a, e.id), n.commit(a), n.focus(t.id, "start");
				return;
			}
			d([
				...c.slice(0, t - 1),
				c[t - 1] + c[t],
				...c.slice(t + 1)
			], ""), n.focus(e.id, zt(c[t - 1]), "items", t - 1);
		} else ar(a, s, n, u, m) || a.key === "Escape" && (a.preventDefault(), s.blur(), n.select(e.id, !0));
	}, _ = (r, i) => /* @__PURE__ */ V(Wt, {
		html: r,
		className: t ? void 0 : "min-w-0 flex-1 pl-1",
		tag: t ? "span" : "div",
		placeholder: D("List"),
		quiet: !0,
		disabled: s,
		focus: l && (l.index ?? 0) === i ? l : null,
		onChange: (e) => d(c.map((t, n) => n === i ? e : t)),
		onKeyDown: m(i),
		onFocus: () => n.get().selected !== e.id && n.select(e.id)
	});
	return t ? /* @__PURE__ */ V(ze, { children: c.map((e, n) => t(n, _(e, n))) }) : /* @__PURE__ */ V("div", {
		className: B(Cr, "space-y-0.5"),
		children: c.map((e, t) => /* @__PURE__ */ H("div", {
			className: "flex",
			children: [/* @__PURE__ */ V("span", {
				className: B("w-6 shrink-0 select-none text-muted", u ? "pr-1.5 text-right tabular-nums" : "pl-1.5"),
				"aria-hidden": !0,
				children: u ? `${t + 1}.` : "•"
			}), _(e, t)]
		}, t))
	});
}
// admin/src/LiveEditor.tsx
var Ar = (e, t, n) => e.axis === "x" ? {
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
}, jr = (e) => `${e.parentId ?? ""}:${e.index}:${e.inside ? "inside" : e.axis}`, Mr = "\nhtml{scrollbar-width:thin;scrollbar-color:rgb(127 127 127/.35) transparent}\n[data-cms-document][data-cms-node]{cursor:default}\n.cms-block-text{display:block;min-width:1ch;min-height:1lh;white-space:pre-wrap;overflow-wrap:break-word;outline:none;border-radius:0;font:inherit;color:inherit;line-height:inherit;text-align:inherit;cursor:text}\n.cms-block-text:empty::before{content:attr(data-placeholder);opacity:.4;pointer-events:none}\n.cms-block-text[data-quiet]:empty:not(:focus)::before{content:none}\n[data-cms-prop]{cursor:text}\n.cms-block-text::selection,.cms-block-text ::selection{background:rgb(0 122 255/.2)}\nimg,a{-webkit-user-drag:none}\niframe{pointer-events:none}\n[data-cms-conditional=hidden]:not([data-cms-reveal]){display:none!important}\n[data-cms-editor-empty-root]{visibility:hidden}\n.cms-js [data-cms-appear]{visibility:visible!important}\n", Nr = /* @__PURE__ */ new Set([
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
function Pr(e, t, n) {
	let r = e.elementFromPoint(t, n);
	if (!r || r === e.body || r === e.documentElement) return !1;
	if (Nr.has(r.tagName) || r.closest("svg")) return !0;
	let i = [...r.childNodes].filter((e) => e.nodeType === Node.TEXT_NODE && e.textContent?.trim());
	if (!i.length) return !1;
	let a = e.createRange();
	return i.some((e) => (a.selectNodeContents(e), [...a.getClientRects()].some((e) => t >= e.left - 2 && t <= e.right + 2 && n >= e.top - 2 && n <= e.bottom + 2)));
}
var Fr = 1024;
function Ir({ collection: e, blueprint: n, entryId: r, content: i, onInspect: o, standalone: s, onTitleChange: c }) {
	let { store: u, types: f, allowed: h, fieldHandle: v, readOnly: x = !1 } = a(), S = t(), C = W(u, (e) => e.nodes), w = W(u, (e) => e.selected), T = W(u, Ue), re = W(u, (e) => e.blockMode), ie = W(u, (e) => e.hovered), oe = W(u, (e) => e.breakpoint), ce = W(u, (e) => e.device), O = D("Page Builder"), le = !x && !!w && re;
	Le("up", D("Select Previous Block"), O, le), Le("down", D("Select Next Block"), O, le), Le("shift+up", D("Select the Block Above Too"), O, le), Le("shift+down", D("Select the Block Below Too"), O, le), Le("alt+up", D("Move Up"), O, le), Le("alt+down", D("Move Down"), O, le), Le("enter", D("Edit Block"), O, le), Le("mod+d", D("Duplicate Block"), O, le), Le("backspace", D("Delete Block"), O, le), Le("escape", D("Deselect"), O, !!w), Le("mod+alt+t", D("Insert Before"), O, !x && !!w), Le("mod+alt+y", D("Insert After"), O, !x && !!w), Le("mod+z", D("Undo"), O, !x), Le("mod+shift+z", D("Redo"), O, !x);
	let ue = yt(), de = ue.breakpoints.find((e) => e.name === oe)?.width ?? 0, fe = M(null), k = M(null), [pe, me] = N(null), A = M(""), [ge, ye] = N([]), [P, be] = N(!0), [xe, F] = N(null), [I, L] = N(0), [R, Se] = N({
		width: 1024,
		height: 700,
		scale: 1,
		left: 0
	}), [Ce, we] = N([]), [z, Ee] = N(null), [Oe, ke] = N([]), [B, Ae] = N(null), Me = M(0), Ne = M(""), [Pe, Fe] = N(!1), [Ie, Re] = N(!1), Be = M(!1), U = M(null), He = ve(() => {
		let e = [], t = (n, r) => n.forEach((n, i) => {
			e.push({
				node: n,
				parentId: r,
				index: i
			}), n.children && t(n.children, n.id);
		});
		return t(C, null), e;
	}, [C]), We = M(He);
	We.current = He;
	let [Ge, Ke] = N(null), [G, K] = N(!1), qe = tn(!!e && !!ne().collections.find((t) => t.handle === e)?.routable && !x && !s), Ye = M(Ge);
	Ye.current = Ge;
	let Xe = M(null);
	j(() => {
		Ge || (Xe.current = null);
	}, [Ge]);
	let Ze = M(0), Qe = M({
		busy: !1,
		queued: !1,
		timer: 0,
		alive: !0
	}), $e = M(async () => {}), et = () => {
		let e = Qe.current;
		e.queued = !0, !(!e.alive || e.busy || e.timer) && (e.timer = window.setTimeout(() => {
			e.timer = 0, $e.current();
		}, A.current ? 80 : 0));
	}, tt = () => We.current.map(({ node: e, parentId: t, index: n }) => `${t}:${n}:${e.id}:${e.type}:${e.type === "list" ? e.props.items?.length ?? 0 : ""}`).join("|"), nt = M(null), rt = M(Rn());
	j(() => () => rt.current.unmount(), []);
	let it = M(null), q = (e) => {
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
	}, at = M(/* @__PURE__ */ new Map()), ot = (e) => {
		let t = !1;
		for (let { node: n } of We.current) {
			let r = n.class ?? "", i = at.current.get(n.id);
			if (at.current.set(n.id, r), i === void 0 || i === r) continue;
			let a = Je(r), o = Je(i).filter((e) => !a.includes(e));
			for (let r of e.querySelectorAll(`[data-cms-document="${A.current}"][data-cms-node="${CSS.escape(n.id)}"],[data-cms-proto-document="${A.current}"][data-cms-proto="${CSS.escape(n.id)}"]`)) r.classList.remove(...o), r.classList.add(...a), t = !0;
		}
		return t;
	}, J = M({
		content: i,
		onInspect: o,
		readOnly: x,
		layout: R,
		onTitleChange: c
	});
	J.current = {
		content: i,
		onInspect: o,
		readOnly: x,
		layout: R,
		onTitleChange: c
	};
	let Y = (e, t) => e.querySelector(`[data-cms-document="${A.current}"][data-cms-node="${CSS.escape(t)}"]`) ?? e.querySelector(`[data-cms-proto-document="${A.current}"][data-cms-proto="${CSS.escape(t)}"]`), st = (e) => {
		let t = "[data-cms-document][data-cms-node],[data-cms-proto-document][data-cms-proto]", n = e?.closest?.(t) ?? null;
		for (; n;) {
			let e = n.dataset.cmsDocument === A.current ? n.dataset.cmsNode : n.dataset.cmsProtoDocument === A.current ? n.dataset.cmsProto : void 0;
			if (e && d(u.get().nodes, e)) return e;
			n = n.parentElement?.closest(t) ?? null;
		}
		return null;
	}, ct = (e) => {
		if (e.ownerDocument.defaultView?.getComputedStyle(e).display !== "contents") return e.getBoundingClientRect();
		let t = e.ownerDocument.createRange();
		return t.selectNodeContents(e), t.getBoundingClientRect();
	}, lt = () => {
		if (U.current) return U.current;
		let e = k.current?.contentDocument, t = e?.querySelector(`[data-cms-editor-root="${A.current}"]`);
		if (!e || !t) return null;
		let n = (t) => {
			let n = e.defaultView.getComputedStyle(t);
			return n.display.includes("flex") && n.flexDirection.startsWith("row") || n.display.includes("grid") && n.gridTemplateColumns.split(" ").length > 1 ? "x" : "y";
		}, r = new Map([...e.querySelectorAll(`[data-cms-document="${A.current}"][data-cms-node]`)].map((e) => [e.dataset.cmsNode, e])), i = We.current.flatMap(({ node: t, parentId: i, index: a }) => {
			let o = r.get(t.id);
			return !o || e.defaultView.getComputedStyle(o).display === "none" ? [] : [{
				id: t.id,
				parentId: i,
				index: a,
				rect: ct(o),
				container: !!f.get(t.type)?.children && !["repeat", "component"].includes(t.type),
				axis: n(o)
			}];
		}), a = ct(t);
		return a.width === 0 && (a = ct(t.parentElement ?? e.body)), i.length || (a = {
			...a,
			left: a.left,
			top: a.top,
			width: a.width,
			height: Math.max(32, a.height)
		}), U.current = {
			blocks: i,
			rootRect: a,
			scroll: {
				x: e.defaultView.scrollX,
				y: e.defaultView.scrollY
			}
		}, U.current;
	}, ut = (e, t = ["paragraph"]) => {
		let n = e ? d(u.get().nodes, e) : null;
		return t.every((e) => te(n, e, f, n ? [] : h));
	}, dt = (e) => [...f.values()].some((t) => ut(e, [t.name])), pt = () => {
		let e = /* @__PURE__ */ new Map();
		return (t) => e.get(t) ?? e.set(t, dt(t)).get(t);
	}, mt = () => {
		let e = k.current?.contentDocument, t = lt();
		if (!e || !t) return;
		we(Ue(u.get()).flatMap((t) => {
			let n = Y(e, t);
			return n ? [ct(n)] : [];
		}));
		let n = u.get().hovered, r = n ? Y(e, n) : null;
		Ee(r ? ct(r) : null);
		let i = vn(t.blocks, {
			rootRect: t.rootRect,
			canInsert: pt()
		});
		ke(i), Ke((t) => {
			if (!t) return t;
			let n = Xe.current?.key === jr(t) ? Xe.current : null, r = n ? Y(e, n.id) : null, a = n ? r ? Ar(t, ct(r), n.side) : t : i.find((e) => jr(e) === jr(t)) ?? t, o = a.inside ? a.hitRect.top : a.rect.top;
			return o < 0 || o > J.current.layout.height ? null : a;
		});
	}, ht = (e) => {
		let t = e ? jr(e) : "";
		t !== Ne.current && (Ne.current = t, clearTimeout(Me.current), Ae(null), e && (Me.current = window.setTimeout(() => Ae(e), 80)));
	}, gt = (e) => {
		let t = Ue(u.get()), n = t.length ? p(u.get().nodes, e === "before" ? t[0] : t.at(-1)) : null, r = k.current?.contentDocument;
		if (!n || !r || J.current.readOnly || !dt(n.parentId)) return;
		let i = e === "before" ? n.index : n.index + 1, a = Y(r, e === "before" ? t[0] : t.at(-1)), o = a ? ct(a) : null, s = r.defaultView, c = J.current.layout.height;
		if (o) {
			let t = e === "before" ? o.top : o.top + o.height;
			(t < 48 || t > c - 160) && s.scrollBy(0, t - c / 3);
		}
		requestAnimationFrame(() => {
			U.current = null;
			let r = lt(), o = a ? ct(a) : null;
			if (!o) return;
			let s = Ar((r && vn(r.blocks, {
				rootRect: r.rootRect,
				canInsert: pt()
			}).find((e) => !e.inside && e.parentId === n.parentId && e.index === i)) ?? {
				parentId: n.parentId,
				index: i,
				axis: "y",
				kind: "edge",
				inside: !1,
				depth: 0,
				rect: o,
				hitRect: o
			}, o, e);
			Xe.current = {
				key: jr(s),
				id: e === "before" ? t[0] : t.at(-1),
				side: e
			}, ht(null), Ke(s);
		});
	}, _t = () => {
		let e = pe?.activeElement;
		if (document.activeElement === k.current && e?.isContentEditable) return e;
		let t = u.get().focus;
		return (t && pe ? Y(pe, t.id) : null)?.querySelector("[data-cms-inline]") ?? null;
	}, vt = (e) => {
		U.current = null;
		let t = [];
		if (J.current.onTitleChange) for (let t of e.querySelectorAll("[data-cms-entry-field=\"title\"]")) t.querySelector("[data-cms-inline]") || t.replaceChildren();
		for (let n of e.querySelectorAll("[data-cms-prop]")) {
			let e = n.closest("[data-cms-document][data-cms-node]");
			e?.dataset.cmsDocument === A.current && e.dataset.cmsNode && (n.querySelector("[data-cms-inline]") || n.replaceChildren(), t.push({
				element: n,
				id: e.dataset.cmsNode,
				prop: n.dataset.cmsProp,
				...n.dataset.cmsIndex === void 0 ? {} : { index: Number(n.dataset.cmsIndex) }
			}));
		}
		for (let n of e.querySelectorAll("[data-cms-instance-prop]")) n.dataset.cmsInstanceDocument === A.current && n.dataset.cmsInstanceNode && (n.querySelector("[data-cms-inline]") || n.replaceChildren(), t.push({
			element: n,
			id: n.dataset.cmsInstanceNode,
			prop: n.dataset.cmsInstanceProp,
			instance: {
				type: n.dataset.cmsInstanceType ?? "text",
				value: n.dataset.cmsInstanceValue ?? ""
			}
		}));
		ye(t), requestAnimationFrame(mt);
	}, bt = () => {
		let e = k.current?.contentDocument, t = e?.querySelector("[data-cms-editor-root]");
		if (!e || !t || !A.current) return;
		let n = new Set(_(u.get().nodes).map(({ node: e }) => e.id));
		for (let t of e.querySelectorAll("[data-cms-document][data-cms-node]")) t.dataset.cmsDocument === A.current && !n.has(t.dataset.cmsNode) && t.remove();
		let r = (t, n) => {
			for (let i = 0; i < t.length; i++) {
				let a = t[i], o = Y(e, a.id);
				if (!o || o.dataset.cmsType !== a.type) {
					let r = e.querySelector(`template[data-cms-prototype="${CSS.escape(a.type)}"]`)?.content.firstElementChild?.cloneNode(!0);
					if (!r) continue;
					if (r.dataset.cmsNode = a.id, r.dataset.cmsDocument = A.current, o) o.replaceWith(r);
					else {
						let a = t.slice(i + 1).map((t) => Y(e, t.id)).find(Boolean), o = t.slice(0, i).reverse().map((t) => Y(e, t.id)).find(Boolean);
						a ? a.before(r) : o ? o.after(r) : n.appendChild(r);
					}
					o = r;
				}
				if (a.type === "list") {
					let e = Array.isArray(a.props.items) && a.props.items.length ? a.props.items : [""], t = [...o.querySelectorAll("[data-cms-prop=\"items\"]")];
					for (let n = t.length; n < e.length; n++) {
						let e = t[0]?.cloneNode(!1);
						e && (e.dataset.cmsIndex = String(n), t[0].parentElement.appendChild(e));
					}
					t.slice(e.length).forEach((e) => e.remove());
				}
				a.children && !["repeat", "component"].includes(a.type) && r(a.children, o);
			}
		};
		u.get().nodes.length && t.querySelector(":scope > [data-cms-editor-empty-root]")?.remove(), r(u.get().nodes, t), ot(e), q(e), vt(e);
	}, X = ve(() => ({
		stops: () => ur(lr(u.get().nodes, f, () => !1)).filter((e) => ge.some((t) => t.id === e.id && t.prop === e.prop && (e.index === void 0 || t.index === e.index))),
		settings: (e) => J.current.onInspect(e),
		readOnly: x
	}), [
		u,
		f,
		ge,
		x
	]), xt = M(X);
	xt.current = X, _e(() => {
		U.current = null, bt();
	}, [C, pe]), _e(() => {
		if (!fe.current) return;
		let e = () => {
			let e = fe.current, t = ce === "tablet" ? je.tablet : ce === "phone" ? Math.min(je.phone, e.clientWidth) : Math.max(e.clientWidth, Fr), n = Math.max(t, de), r = Math.min(1, e.clientWidth / n);
			U.current = null, Se({
				width: n,
				scale: r,
				height: e.clientHeight / r,
				left: Math.max(0, (e.clientWidth - n * r) / 2)
			});
		};
		e();
		let t = new ResizeObserver(e);
		return t.observe(fe.current), () => t.disconnect();
	}, [ce, de]), j(() => {
		requestAnimationFrame(mt);
	}, [
		w,
		T,
		ie,
		R,
		pe
	]), $e.current = async () => {
		let t = Qe.current;
		t.queued = !1, t.busy = !0;
		let a = Ze.current, o = tt(), c = new Map(We.current.map(({ node: e }) => [e.id, e.class ?? ""])), l = new AbortController();
		nt.current = l;
		try {
			let { text: d, headers: f } = await se("POST", r ? `/__preview/${r}` : "/__preview", {
				...i,
				collection: e,
				...r ? {} : { blueprint: n },
				field: v,
				standalone: s,
				data: {
					...i.data,
					[v]: u.get().nodes
				},
				play: !1
			}, { signal: l.signal });
			if (!t.alive || l.signal.aborted || a !== Ze.current && o !== tt()) return;
			let p = f.get("X-Cms-Editor-Document");
			if (!p) throw Error(D("The editor could not load its rendering context."));
			let m = new DOMParser().parseFromString(d, "text/html");
			if (!m.querySelector(`[data-cms-editor-root="${p}"]`)) throw Error(D("This template has no content outlet. Choose a template that includes the content field."));
			m.querySelectorAll("script").forEach((e) => {
				e.type === "importmap" && (e.dataset.cmsImportmap = ""), e.type = "text/cms-off", e.removeAttribute("src");
			}), A.current = p;
			let h = k.current?.contentDocument;
			h?.documentElement?.hasAttribute("data-cms-bridge-ready") ? (rt.current.unmount(), zn(h, m), h.documentElement.setAttribute("data-cms-bridge-ready", ""), at.current = c, ot(h), q(h), vt(h), rt.current.mount(h)) : k.current && (at.current = c, k.current.srcdoc = m.documentElement.outerHTML), a === Ze.current && F(null);
		} catch (e) {
			!l.signal.aborted && a === Ze.current && (F(e instanceof Error ? e.message : String(e)), be(!1));
		} finally {
			t.busy = !1, t.queued && et();
		}
	}, j(() => {
		Ze.current++, et();
	}, [
		r,
		e,
		n,
		i,
		C,
		v,
		s,
		I
	]), j(() => (Qe.current.alive = !0, Qe.current.queued && et(), () => {
		Qe.current.alive = !1, clearTimeout(Qe.current.timer), Qe.current.timer = 0, nt.current?.abort();
	}), []);
	let St = (e, t) => {
		let n = y(e, f);
		n.length && !x && ut(t.parentId, n.map((e) => e.type)) && (u.insert(t.parentId, t.index, n), rr(u, n[0], ur(lr(u.get().nodes, f, () => !1))), Ke(null), ht(null));
	}, Ct = () => {
		if (J.current.readOnly || !ut(null)) return;
		let e = er();
		u.insert(null, 0, [e]), u.focus(e.id, "start");
	}, wt = () => {
		let e = k.current?.contentDocument;
		return e ? We.current.filter(({ node: t }) => {
			let n = Y(e, t.id);
			return !!n && e.defaultView.getComputedStyle(n).display !== "none";
		}).map(({ node: e }) => e.id) : [];
	}, Tt = (e) => {
		if (!e) return;
		u.select(e, !0);
		let t = k.current?.contentDocument;
		(t && Y(t, e))?.scrollIntoView({ block: "nearest" });
	}, Et = (e) => {
		let t = e.metaKey || e.ctrlKey, n = Ue(u.get()), r = u.get().selected;
		if (e.key === "Escape") {
			u.select(null);
			return;
		}
		if (!r || !u.get().blockMode) return;
		let i = wt(), a = i.indexOf(u.get().head ?? r);
		if (["ArrowUp", "ArrowDown"].includes(e.key)) {
			e.preventDefault();
			let t = e.key === "ArrowUp";
			e.altKey ? u.nudgeSelection(t ? -1 : 1) : e.shiftKey ? u.extend(t ? -1 : 1) : Tt(i[a + (t ? -1 : 1)]);
		} else if (e.key === "Enter") {
			e.preventDefault();
			let t = d(u.get().nodes, r), n = xt.current.stops(), i = t ? new Set(_([t]).map((e) => e.node.id)) : /* @__PURE__ */ new Set();
			n.some((e) => i.has(e.id)) ? rr(u, t, n) : J.current.onInspect(r);
		} else if (e.key === "Backspace" || e.key === "Delete") {
			e.preventDefault();
			let t = new Set(n.flatMap((e) => {
				let t = d(u.get().nodes, e);
				return t ? _([t]).map((e) => e.node.id) : [];
			})), r = i.findIndex((e) => t.has(e)), a = i.slice(0, Math.max(0, r)).reverse().find((e) => !t.has(e)) ?? i.slice(r + 1).find((e) => !t.has(e));
			u.removeSelection(), Tt(a);
		} else t && e.key.toLowerCase() === "d" && (e.preventDefault(), u.duplicateSelection());
	}, Dt = () => {
		let e = k.current?.contentDocument;
		if (!e || !A.current) return;
		if (!e.querySelector("[data-cms-editor-root]")) {
			be(!1), F(D("This template has no content outlet. Choose a template that includes the content field."));
			return;
		}
		e.documentElement.setAttribute("data-cms-bridge-ready", "");
		let t = e.createElement("style");
		t.dataset.cmsBridge = "", t.textContent = Mr, e.head.appendChild(t), ot(e), q(e), me(e), vt(e), be(!1), rt.current.unmount(), rt.current.mount(e), e.addEventListener("submit", (e) => e.preventDefault(), !0), e.addEventListener("dragstart", (e) => e.preventDefault()), e.addEventListener("focusout", (e) => {
			e.target.isContentEditable && Fe(!1), et();
		}), e.addEventListener("focusin", (e) => {
			let t = e.target;
			if (!t.isContentEditable) return;
			Fe(!0);
			let n = t.closest("[data-cms-instance-node],[data-cms-document][data-cms-node]");
			u.select(n?.dataset.cmsInstanceNode ?? n?.dataset.cmsNode ?? null), u.hover(null);
		}), e.addEventListener("pointermove", (e) => {
			if (J.current.readOnly || (Be.current && (e.movementX || e.movementY) && (Be.current = !1, Re(!1)), u.hover(st(e.target)), Be.current || Ye.current)) return;
			let t = lt();
			ht(t && yn(t.blocks, {
				x: e.clientX,
				y: e.clientY
			}, {
				rootRect: t.rootRect,
				canInsert: pt()
			}));
		}), e.addEventListener("pointerdown", () => {
			Ke(null), ht(null);
		}), e.addEventListener("click", (e) => {
			let t = e.target;
			if (t.closest("[contenteditable=\"true\"]")) {
				t.closest("a") && e.preventDefault();
				return;
			}
			e.preventDefault();
			let n = st(t);
			n ? e.shiftKey && u.get().selected ? u.extendTo(n) : J.current.onInspect(n) : e.shiftKey || u.select(null);
		}, !0), e.addEventListener("keydown", (t) => {
			if (t.defaultPrevented) return;
			let n = t.metaKey || t.ctrlKey;
			if (n && [
				"s",
				".",
				"j",
				"k",
				"\\"
			].includes(t.key.toLowerCase())) t.preventDefault(), document.dispatchEvent(new KeyboardEvent("keydown", {
				key: t.key,
				code: t.code,
				metaKey: t.metaKey,
				ctrlKey: t.ctrlKey,
				shiftKey: t.shiftKey,
				bubbles: !0
			}));
			else if (!J.current.readOnly) {
				if (n && t.key.toLowerCase() === "z") {
					if (e.activeElement?.closest("[data-cms-entry-field]")) return;
					t.preventDefault();
					let n = e.activeElement, r = n?.closest("[data-cms-prop]"), i = n?.closest("[data-cms-instance-prop]"), a = r?.closest("[data-cms-node]");
					n?.blur(), t.shiftKey ? u.redo() : u.undo(), a?.dataset.cmsNode && r?.dataset.cmsProp && d(u.get().nodes, a.dataset.cmsNode) ? u.focus(a.dataset.cmsNode, "end", r.dataset.cmsProp, r.dataset.cmsIndex === void 0 ? void 0 : Number(r.dataset.cmsIndex)) : i?.dataset.cmsInstanceNode && d(u.get().nodes, i.dataset.cmsInstanceNode) && u.focus(i.dataset.cmsInstanceNode, "end", `values.${i.dataset.cmsInstanceProp}`);
				} else n && t.altKey && (t.code === "KeyT" || t.code === "KeyY") ? (t.preventDefault(), gt(t.code === "KeyT" ? "before" : "after")) : t.target.isContentEditable ? n || t.altKey || t.key.length !== 1 && ![
					"Backspace",
					"Delete",
					"Enter"
				].includes(t.key) || (Be.current = !0, Re(!0), ht(null)) : Et(t);
			}
		});
		let n = (e) => u.get().blockMode && !!u.get().selected && !e.target.isContentEditable, r = (e, t) => {
			if (!n(e) || !e.clipboardData) return;
			let r = Ue(u.get()).map((e) => d(u.get().nodes, e)).filter(Boolean);
			r.length && (e.preventDefault(), e.clipboardData.setData("text/plain", "cms-blocks:" + JSON.stringify(r)), t && !J.current.readOnly && u.removeSelection());
		};
		e.addEventListener("copy", (e) => r(e, !1)), e.addEventListener("cut", (e) => r(e, !0)), e.addEventListener("paste", (e) => {
			let t = e.clipboardData?.getData("text/plain") ?? "";
			if (!n(e) || J.current.readOnly || !t.startsWith("cms-blocks:")) return;
			e.preventDefault();
			let r;
			try {
				r = JSON.parse(t.slice(12)).map(b);
			} catch {
				return;
			}
			let i = u.get().nodes, a = g(i, Ue(u.get()).at(-1), r.map((e) => e.type), f, h);
			a && r.length && (u.insert(a.parentId, a.index, r), u.select(r[0].id, !0), r.length > 1 && u.extendTo(r.at(-1).id));
		});
		let i = 0;
		e.addEventListener("scroll", () => {
			let t = U.current, n = e.defaultView;
			if (t) {
				let e = n.scrollX - t.scroll.x, r = n.scrollY - t.scroll.y, i = (t) => ({
					...t,
					left: t.left - e,
					top: t.top - r
				});
				U.current = {
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
			Ve(() => {
				ht(null), mt();
			}), clearTimeout(i), i = window.setTimeout(() => {
				U.current = null, mt();
			}, 150);
		}, { passive: !0 }), e.defaultView?.addEventListener("resize", () => {
			U.current = null, requestAnimationFrame(mt);
		}), e.querySelectorAll("img,link[rel=\"stylesheet\"]").forEach((e) => e.addEventListener("load", () => {
			U.current = null, requestAnimationFrame(mt);
		}, { once: !0 })), e.fonts.ready.then(() => {
			U.current = null, mt();
		});
	};
	j(() => {
		let e = ue.source;
		if (!e) return;
		let t = !0;
		return ft(e).then((n) => {
			if (!t) return;
			it.current = {
				build: n.build,
				faces: e.faces
			};
			let r = k.current?.contentDocument;
			r?.documentElement?.hasAttribute("data-cms-bridge-ready") && (q(r), U.current = null, requestAnimationFrame(mt));
		}).catch(() => {
			t && (it.current = null);
		}), () => {
			t = !1;
		};
	}, [ue.source]), j(() => Zn.on("scroll-to", ({ node: e, top: t }) => {
		let n = k.current?.contentDocument, r = n && Y(n, e);
		r && t ? n.defaultView?.scrollTo({
			top: Math.max(0, r.getBoundingClientRect().top + n.defaultView.scrollY - 72),
			behavior: "smooth"
		}) : r && r.scrollIntoView({
			block: "center",
			behavior: "smooth"
		});
	}), []), j(() => {
		let e = k.current?.contentDocument;
		if (e) {
			e.querySelectorAll("[data-cms-reveal]").forEach((e) => e.removeAttribute("data-cms-reveal"));
			for (let t of T) {
				let n = Y(e, t);
				for (; n;) n.dataset.cmsConditional === "hidden" && (n.dataset.cmsReveal = ""), n = n.parentElement;
			}
		}
	}, [T]);
	let Ot = Bn({
		disabled: x,
		frame: k,
		scale: R.scale,
		invalidate: () => {
			U.current = null, mt();
		},
		target: (e, t) => {
			let n = lt();
			if (!n || e.x < n.rootRect.left || e.x > n.rootRect.left + n.rootRect.width || e.y < n.rootRect.top - 12 || e.y > n.rootRect.top + n.rootRect.height + 12) return null;
			let r = t.map((e) => d(u.get().nodes, e));
			if (r.some((e) => !e)) return null;
			let i = r.map((e) => e.type);
			return bn(n.blocks, e, {
				rootRect: n.rootRect,
				maxDistance: Infinity,
				excludeIds: new Set(t),
				canInsert: (e) => ut(e, i)
			});
		},
		commit: (e, t) => u.moveTo(e, t.parentId, t.index)
	}), kt = (e) => {
		let t = k.current?.contentDocument;
		if (!t) return !1;
		for (let n of [.25, .75]) for (let r = 0; r < 6; r++) if (Pr(t, (e.left + e.width * (r + .5) / 6 - R.left) / R.scale, (e.top + e.height * n) / R.scale)) return !0;
		return !1;
	}, At = he(() => {
		let e = k.current.getBoundingClientRect();
		return {
			x: e.left,
			y: e.top,
			scale: R.scale
		};
	}, [R.scale]), jt = (e) => ({
		left: R.left + e.left * R.scale,
		top: e.top * R.scale,
		width: e.width * R.scale,
		height: e.height * R.scale
	});
	return /* @__PURE__ */ H(Qn.Provider, {
		value: X,
		children: [G && /* @__PURE__ */ V(nn, {
			open: !0,
			onOpenChange: K,
			patterns: qe,
			onChoose: (e) => {
				let t = e.blocks.map((e) => b(e));
				u.insert(null, 0, t), u.select(t[0]?.id ?? null), K(!1);
			}
		}), /* @__PURE__ */ H("div", {
			className: "flex h-full min-h-0 flex-col",
			"data-live-editor": !0,
			children: [
				xe && /* @__PURE__ */ V(Te, {
					compact: !0,
					message: xe,
					onRetry: () => L((e) => e + 1)
				}),
				/* @__PURE__ */ H("div", {
					ref: fe,
					onPointerLeave: () => {
						u.hover(null), ht(null);
					},
					onPointerMove: (e) => {
						e.target.closest("[data-cms-inserter]") || (ht(null), u.hover(null));
					},
					className: "relative min-h-0 flex-1 overflow-hidden bg-sunken",
					children: [
						P && /* @__PURE__ */ V("div", {
							className: "absolute inset-0 z-drag grid place-items-center bg-bg",
							children: /* @__PURE__ */ V(De, {})
						}),
						/* @__PURE__ */ V("iframe", {
							ref: k,
							title: D("Live editor"),
							sandbox: "allow-same-origin",
							onLoad: Dt,
							className: "absolute top-0 border-0 bg-white",
							style: {
								width: R.width,
								height: R.height,
								left: R.left,
								transformOrigin: "top left",
								transform: `scale(${R.scale})`
							}
						}),
						/* @__PURE__ */ H("div", {
							className: "pointer-events-none absolute inset-0 overflow-hidden",
							children: [
								!x && !Ot.drag && !Pe && !Ie && !Ge && ie && z && !T.includes(ie) && /* @__PURE__ */ V("div", {
									"data-cms-hover": ie,
									className: "absolute z-raised border border-focus/50",
									style: jt(z)
								}),
								!Ot.drag && Ce.map((e, t) => /* @__PURE__ */ V("div", {
									"data-cms-selection": !0,
									className: "absolute z-raised border-solid border-focus",
									style: {
										...jt(e),
										borderWidth: 1.5
									}
								}, t)),
								!x && !Ot.drag && re && w && Ce[0] && (() => {
									let e = p(C, T[0]), t = p(C, T.at(-1)), n = d(C, w);
									if (!e || !t || !n) return null;
									let r = m(C, e.parentId), i = (e) => ({
										label: l(e, f, S),
										icon: e.type === "component" ? "symbol" : f.get(e.type)?.icon ?? "square"
									}), a = e.parentId ? d(C, e.parentId) : null, { label: s, icon: c } = i(n);
									return /* @__PURE__ */ V(Jn, {
										id: w,
										label: T.length > 1 ? ae(T.length, "{count} block", "{count} blocks") : s,
										icon: c,
										parent: a ? i(a) : null,
										box: jt(Ce[0]),
										viewport: {
											width: R.width * R.scale + R.left * 2,
											height: R.height * R.scale
										},
										canMoveUp: e.index > 0,
										canMoveDown: t.index < r.length - 1,
										onSelectParent: () => a && o(a.id),
										onDrag: (e) => {
											Ke(null), Ot.start(e, Ue(u.get()), s);
										},
										onMove: (e) => u.nudgeSelection(e),
										onInsert: (e) => requestAnimationFrame(() => gt(e)),
										onDuplicate: () => u.duplicateSelection(),
										onDelete: () => u.removeSelection(),
										onMakeComponent: n.type !== "component" && E("entries.components.create") && ee(u, f, h) ? () => Qt(u) : void 0,
										onSavePattern: E("entries.patterns.create") ? () => $t(u) : void 0,
										covers: kt
									});
								})(),
								!x && !Ot.drag && Oe.filter((e) => e.inside).map((e) => {
									let t = {
										open: !!Ge && jr(Ge) === jr(e),
										onOpenChange: (t) => Ke(t ? e : null),
										returnFocus: _t,
										children: /* @__PURE__ */ V(On, {
											types: [...f.values()],
											allowed: (t) => ut(e.parentId, [t.name]),
											onChoose: (t) => St(t, e),
											onClose: () => Ke(null)
										})
									};
									if (e.parentId === null) return C.length ? null : /* @__PURE__ */ V(Kn, {
										target: e,
										position: jt,
										onWrite: ut(null) ? Ct : void 0,
										onPattern: qe.length ? () => K(!0) : void 0,
										...t
									}, "root");
									let n = e.hitRect.top;
									return d(C, e.parentId)?.children?.length || n + e.hitRect.height < 0 || n > R.height || !(t.open || ie === e.parentId || T.includes(e.parentId)) ? null : /* @__PURE__ */ V(Gn, {
										target: e,
										position: jt,
										...t
									}, jr(e));
								}),
								!x && !Ot.drag && (() => {
									let e = Ge && !Ge.inside ? Ge : !Ge && !Ie ? B : null;
									return e ? /* @__PURE__ */ V(Wn, {
										target: e,
										position: jt,
										open: Ge === e,
										onOpenChange: (t) => {
											Ke(t ? e : null), t || ht(null);
										},
										returnFocus: _t,
										children: /* @__PURE__ */ V(On, {
											types: [...f.values()],
											allowed: (t) => ut(e.parentId, [t.name]),
											onChoose: (t) => St(t, e),
											onClose: () => Ke(null)
										})
									}, jr(e)) : null;
								})(),
								Ot.drag && /* @__PURE__ */ V(Yn, {
									drag: Ot.drag,
									position: jt
								})
							]
						})
					]
				}),
				pe && /* @__PURE__ */ H(ze, { children: [
					/* @__PURE__ */ V(Lr, { slots: ge }),
					c && /* @__PURE__ */ V(Vr, {
						doc: pe,
						content: i,
						onChange: c,
						readOnly: x
					}),
					/* @__PURE__ */ V(qt, {
						root: pe,
						offset: At
					}),
					/* @__PURE__ */ V(Br, {
						doc: pe,
						frame: k.current,
						scale: R.scale
					})
				] })
			]
		})]
	});
}
var Lr = me(function({ slots: e }) {
	let { store: t } = a(), n = W(t, (e) => e.nodes), r = new Set(e.filter((e) => !e.instance && e.prop === "items").map((e) => e.id)), i = /* @__PURE__ */ new Map();
	return /* @__PURE__ */ H(ze, { children: [e.filter((e) => e.instance || e.prop !== "items").map((e) => {
		let t = d(n, e.id);
		if (!t) return null;
		let r = `${e.instance ? "instance:" : ""}${e.id}:${e.prop}`, a = i.get(r) ?? 0;
		return i.set(r, a + 1), Be(e.instance ? /* @__PURE__ */ V(Rr, {
			node: t,
			slot: e
		}) : [
			"text",
			"cite",
			"caption"
		].includes(e.prop) ? t.type === "paragraph" && e.prop === "text" ? /* @__PURE__ */ V(Or, {
			node: t,
			prop: "text",
			tag: "span",
			placeholder: D("Write, or press “/” for blocks"),
			quiet: !0
		}) : /* @__PURE__ */ V(Or, {
			node: t,
			prop: e.prop,
			tag: "span",
			placeholder: e.element.dataset.cmsPlaceholder ?? D("Write something…")
		}) : /* @__PURE__ */ V(zr, {
			node: t,
			prop: e.prop
		}), e.element, `${r}:${a}`);
	}), [...r].map((t) => {
		let r = d(n, t);
		return r ? /* @__PURE__ */ V(kr, {
			node: r,
			renderItem: (n, r) => {
				let i = e.find((e) => e.id === t && e.prop === "items" && e.index === n);
				return i ? Be(r, i.element, `${t}:items:${n}`) : null;
			}
		}, t) : null;
	})] });
});
function Rr({ node: e, slot: t }) {
	let { store: n, readOnly: r } = a(), i = W(n, (n) => n.focus?.id === e.id && n.focus.prop === `values.${t.prop}` ? n.focus : null), o = String((Object.prototype.hasOwnProperty.call(e.props.values ?? {}, t.prop) ? e.props.values[t.prop] : t.instance.value) ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
	return /* @__PURE__ */ V(Wt, {
		tag: "span",
		html: o,
		focus: i,
		plainText: !0,
		singleLine: t.instance.type === "text",
		disabled: r,
		placeholder: t.element.dataset.cmsPlaceholder ?? D("Write something…"),
		onFocus: () => n.select(e.id),
		onChange: (r, i) => n.updateProps(e.id, { values: {
			...d(n.get().nodes, e.id)?.props.values,
			[t.prop]: i.innerText
		} }, `instance:${e.id}:${t.prop}`),
		onKeyDown: (r, i) => {
			(r.key === "Escape" || r.key === "Enter" && t.instance.type === "text") && (r.preventDefault(), i.blur(), n.select(e.id, !0));
		}
	});
}
function zr({ node: e, prop: t }) {
	let { store: n, readOnly: r } = a(), i = W(n, (n) => n.focus?.id === e.id && n.focus.prop === t ? n.focus : null), o = String(e.props[t] ?? ""), s = t === "code" ? o.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>") : o;
	return /* @__PURE__ */ V(Wt, {
		tag: "span",
		html: s,
		disabled: r,
		focus: i,
		singleLine: t !== "code",
		onChange: (r, i) => n.updateProps(e.id, { [t]: t === "code" ? i.innerText : r }, `text:${e.id}:${t}`),
		onFocus: () => n.select(e.id),
		onKeyDown: (r, i) => {
			(r.key === "Escape" || t !== "code" && r.key === "Enter") && (r.preventDefault(), i.blur(), n.select(e.id, !0));
		}
	});
}
function Br({ doc: e, frame: t, scale: n }) {
	let r = yr(), { store: i, types: o, allowed: s } = a(), [l, u] = N(null);
	if (_e(() => {
		u(r ? Lt(e) : null);
	}, [r, e]), xr(!!r, [document, e]), !r || !l || !d(i.get().nodes, r.id)) return null;
	let f = (e) => {
		let t = y(e, o), n = i.get().nodes, a = p(n, r.id);
		if (!a || !t.length) return;
		let c = a.parentId ? d(n, a.parentId) : null, l = t.every((e) => te(c, e.type, o, c ? [] : s)) ? a : g(n, r.id, t.map((e) => e.type), o, s);
		l && (vr(null), i.commit(S(h(n, r.id), l.parentId, l.index, t)), rr(i, t[0], ur(lr(i.get().nodes, o, () => !1))));
	}, m = t.getBoundingClientRect(), { maxHeight: _, ...v } = br({
		left: m.left + l.left * n,
		top: m.top + l.top * n,
		bottom: m.top + l.bottom * n
	});
	return Be(/* @__PURE__ */ V("div", {
		"data-cms-slash": !0,
		className: "cms-pop fixed z-overlay overflow-hidden !p-0",
		style: v,
		children: /* @__PURE__ */ V(c, {
			types: [...o.values()],
			query: r.query,
			showSearch: !1,
			compact: !0,
			style: { maxHeight: _ },
			chooseFirst: r.enter,
			keyboardDocument: e,
			onChoose: f,
			onClose: () => vr(null),
			onNoMatch: () => {
				vr(null);
			},
			allowed: (e) => !!g(i.get().nodes, r.id, e.name, o, s)
		})
	}), document.body);
}
function Vr({ doc: e, content: t, onChange: n, readOnly: r }) {
	let i = [...e.querySelectorAll("[data-cms-entry-field=\"title\"]")];
	return /* @__PURE__ */ V(ze, { children: i.map((i, a) => {
		let o = t.title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
		return Be(/* @__PURE__ */ V(Wt, {
			tag: "span",
			html: o,
			singleLine: !0,
			disabled: r,
			placeholder: D("Untitled"),
			onChange: (e, t) => n(t.textContent ?? ""),
			onKeyDown: (t, n) => {
				t.key === "Enter" && (t.preventDefault(), n.blur(), e.querySelector("[data-cms-editor-root] [contenteditable=\"true\"]")?.focus());
			}
		}), i, `title:${a}`);
	}) });
}
// admin/src/builder/controls.tsx
var Hr = "w-[88px]", Ur = "cms.inspector.collapsed";
function Wr() {
	try {
		let e = JSON.parse(localStorage.getItem(Ur) ?? "{}");
		return e && typeof e == "object" && !Array.isArray(e) ? Object.fromEntries(Object.entries(e).filter(([, e]) => typeof e == "boolean")) : {};
	} catch {
		return {};
	}
}
function Gr({ title: e, children: t, open: n = !0, actions: r, empty: i, fields: a }) {
	let [o, s] = N(() => Wr()[e] === void 0 ? n : !Wr()[e]), c = (t) => {
		s(t);
		try {
			localStorage.setItem(Ur, JSON.stringify({
				...Wr(),
				[e]: !t
			}));
		} catch {}
	};
	return /* @__PURE__ */ H("section", {
		"data-section": e,
		className: "min-w-0 border-b border-border last:border-b-0",
		children: [/* @__PURE__ */ H("header", {
			className: "group/section flex h-10 items-center gap-1 pl-4 pr-3",
			children: [/* @__PURE__ */ H(P, {
				variant: "ghost",
				onClick: () => c(!o),
				"aria-expanded": o,
				className: B("!h-full min-w-0 flex-1 shrink !justify-start !gap-1 !rounded-none !bg-transparent !px-0 text-left !text-xs !font-semibold focus-visible:!-outline-offset-2", i ? "!text-muted" : "!text-ink"),
				children: [/* @__PURE__ */ V("span", {
					className: "min-w-0 truncate",
					children: e
				}), /* @__PURE__ */ V(F, {
					name: "chevron-down",
					size: 10,
					className: B("shrink-0 text-faint transition-[rotate,opacity] duration-fast", o ? "opacity-0 group-hover/section:opacity-100 group-focus-within/section:opacity-100" : "-rotate-90")
				})]
			}), r && /* @__PURE__ */ V("span", {
				className: "contents",
				onClickCapture: () => !o && c(!0),
				children: r
			})]
		}), o && /* @__PURE__ */ V("div", {
			className: "space-y-1 px-4 pb-3",
			children: i && r && !a ? /* @__PURE__ */ V("p", {
				className: "m-0 flex h-7 items-center text-xs text-faint",
				children: D("None")
			}) : t
		})]
	});
}
function Kr({ children: e, className: t }) {
	return /* @__PURE__ */ V("div", {
		"data-section": "content",
		className: B("space-y-1 border-b border-border px-4 py-3 last:border-b-0", t),
		children: e
	});
}
function qr({ title: e, action: t }) {
	return /* @__PURE__ */ H("div", {
		className: "flex h-7 items-center justify-between pt-1",
		children: [/* @__PURE__ */ V("span", {
			className: "text-xs text-muted",
			children: e
		}), t]
	});
}
function Jr({ field: e, children: t, htmlFor: n, className: r }) {
	let i = e.status, a = e.reset, o = t ?? e.label, s = B("flex min-h-7 min-w-0 shrink-0 items-center gap-1 text-left text-xs", Hr, i === "own" ? "text-ink" : "text-muted", r), c = /* @__PURE__ */ V("span", {
		className: "min-w-0 py-1 leading-[1.25] [overflow-wrap:anywhere]",
		children: o
	});
	return i === "own" && a ? /* @__PURE__ */ V(ke, {
		content: D("Reset {label}", { label: String(e.label ?? "") }),
		children: /* @__PURE__ */ V(P, {
			variant: "ghost",
			onClick: a,
			className: B(s, "!h-auto !justify-start !gap-1 !whitespace-normal !rounded-xs !bg-transparent !px-0 !text-xs !font-normal !text-ink decoration-faint decoration-dotted underline-offset-[3px] hover:underline"),
			children: c
		})
	}) : i === "inherited" ? /* @__PURE__ */ H("label", {
		htmlFor: n,
		className: s,
		title: D("Inherited from a larger screen, another state or the component"),
		children: [c, /* @__PURE__ */ V("span", {
			className: "size-1 shrink-0 rounded-full bg-warning",
			"aria-hidden": !0
		})]
	}) : /* @__PURE__ */ V("label", {
		htmlFor: n,
		className: s,
		title: e.instructions,
		children: c
	});
}
function Yr(e) {
	if (e.stack === !0 || Re.includes(e.type) && !e.component) return !0;
	if (e.type !== "select" || e.component || e.display !== "segmented") return !1;
	let t = Object.values(e.options ?? {}).map((e) => typeof e == "string" ? e : e && typeof e == "object" && "label" in e ? String(e.label ?? "") : "").filter(Boolean);
	return t.length > 3 || t.join(" ").length > 20;
}
var Xr = (e) => e === "xs" || e === void 0 ? "sm" : e;
function Z({ fields: e, values: t, onChange: n, disabled: r, context: i = {}, className: a, bare: o }) {
	ye(oe.fields.subscribe, oe.fields.version);
	let s = ue();
	return /* @__PURE__ */ V("div", {
		className: B("min-w-0", a ?? "space-y-1"),
		children: e.filter((e) => Ne(e, t)).map((e) => {
			let a = s?.fieldTypes.find((t) => t.key === e.type), c = oe.fields.get(e.component ?? a?.component ?? e.type) ?? oe.fields.get("json");
			if (!c) return null;
			let l = {
				...e,
				size: Xr(e.size),
				fit: !0,
				id: Me(e, i.path)
			}, u = !o && Yr(e), d = /* @__PURE__ */ V(c, {
				field: l,
				value: t[e.handle] ?? e.default ?? null,
				onChange: (t) => n(e.handle, t),
				disabled: r,
				context: {
					...i,
					values: t
				}
			});
			return /* @__PURE__ */ H("div", {
				"data-field": e.handle,
				className: B("flex min-w-0", u ? "flex-col items-stretch" : "min-h-7 items-center gap-2", e.className),
				children: [!o && e.type !== "toggle" && /* @__PURE__ */ V(Jr, {
					field: l,
					htmlFor: l.id,
					className: u ? "!w-auto" : void 0
				}), /* @__PURE__ */ V("div", {
					className: B("flex min-w-0 items-center", !u && "flex-1"),
					children: d
				})]
			}, e.handle);
		})
	});
}
var Zr = "cms-input h-7 w-full min-w-0 rounded-sm px-2 text-sm placeholder:text-ghost";
function Qr({ color: e, dark: t, className: n }) {
	return /* @__PURE__ */ H("span", {
		className: B("relative inline-block size-4 shrink-0 overflow-hidden rounded-xs align-middle cms-checkerboard [--checker:6px]", n),
		children: [
			/* @__PURE__ */ V("span", {
				className: "absolute inset-0",
				style: { background: e }
			}),
			t && /* @__PURE__ */ V("span", {
				className: "absolute inset-0 [clip-path:polygon(100%_50%,100%_100%,50%_100%)]",
				style: { background: t }
			}),
			/* @__PURE__ */ V("span", { className: "cms-swatch-edge" })
		]
	});
}
var $r = pe(function({ className: e, children: t, ...n }, r) {
	return /* @__PURE__ */ V(P, {
		ref: r,
		variant: "ghost",
		icon: "plus",
		className: B("w-full !justify-start !gap-1.5 !px-1.5 !text-xs !font-normal !text-muted hover:!text-ink", e),
		...n,
		children: t
	});
});
function ei({ onClick: e, label: t = D("Add") }) {
	return /* @__PURE__ */ V(ke, {
		content: t,
		children: /* @__PURE__ */ V(I, {
			icon: "plus",
			label: t,
			title: void 0,
			size: "xs",
			onClick: e
		})
	});
}
function ti({ onClick: e, label: t = D("Remove") }) {
	return /* @__PURE__ */ V(ke, {
		content: t,
		children: /* @__PURE__ */ V(I, {
			icon: "minus",
			label: t,
			title: void 0,
			size: "xs",
			onClick: e,
			className: "!text-faint hover:!text-danger"
		})
	});
}
// admin/src/builder/styleApi.ts
var ni = (e) => e.startsWith("-") ? e : e.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`), ri = (e) => e.startsWith("-") ? e : e.replace(/-([a-z])/g, (e, t) => t.toUpperCase()), ii = (e) => e.replace(/^!|!$/g, "");
function ai(e) {
	let t = e.trim();
	for (let e = 0; e < 3; e++) {
		let e = t.replace(/var\(--tw-[\w-]+,\s*((?:[^()]|\((?:[^()]|\([^()]*\))*\))+)\)/g, "$1").replace(/calc\((\d+) \/ (\d+) \* 100%\)/g, (e, t, n) => `${+(Number(t) / Number(n) * 100).toFixed(4)}%`).replace(/calc\((-?[\d.]+)([a-z%]*) \* -1\)/g, (e, t, n) => `${-Number(t)}${n}`);
		if (e === t) break;
		t = e;
	}
	return t;
}
function oi(e) {
	if (!e.startsWith("var(--tw-")) return !1;
	let t = 0;
	for (let n = 0; n < e.length; n++) if (e[n] === "(") t++;
	else if (e[n] === ")" && --t === 0) return n === e.length - 1;
	return !1;
}
var si = (e) => e?.match(/^[a-zA-Z-]+\((.*)\)$/)?.[1];
function ci(e, t, n, r, i, a) {
	let o = [...r ? [r] : [], ...i], s = K(o), c = t.map((e) => {
		let { variants: t, utility: n } = G(e);
		return {
			raw: e,
			layer: K(t),
			utility: ii(n)
		};
	}), l = n.indexOf(r), u = r ? [...l === -1 ? [r] : n.slice(0, l + 1).reverse(), ""] : [""], d = [...i.length ? u.map((e) => [...e ? [e] : [], ...i]) : [], ...u.map((e) => e ? [e] : [])].map(K), f = (t) => {
		if (!e) return;
		let n = ni(t);
		for (let [t, r] of d.entries()) for (let i = c.length - 1; i >= 0; i--) {
			if (c[i].layer !== r) continue;
			let a = e.value(c[i].utility, n);
			if (!(a === void 0 || oi(a))) return {
				value: ai(a),
				own: t === 0
			};
		}
	}, p = (n, r) => {
		!e || n.length === t.length && n.every((e, n) => e === t[n]) || a(e.sort([...new Set(n)]), r);
	}, m = (t) => new it(e, t, n, r, i), h = {
		engine: e,
		classes: t,
		variants: o,
		breakpoint: r,
		state: i,
		value: (e) => f(e)?.value,
		status: (e) => {
			let t = f(e);
			return t ? t.own ? "own" : "inherited" : "none";
		},
		set: (e, t) => h.write({ [e]: t }),
		write: (n, r) => {
			if (!e) return;
			let i = Object.fromEntries(Object.entries(n).map(([e, t]) => [ni(e), typeof t == "string" ? t.replace(/"/g, "'") : t])), a = "width" in i || "height" in i ? li(e, t, s) : t;
			p(m(a).set(i), r ?? Object.keys(n).join(","));
		},
		own: () => e ? m(t).own().map(ri) : [],
		get: (n) => e ? m(t).get(n) : null,
		put: (n, r, i) => {
			e && p(m(t).put(n, r), i ?? n);
		},
		swap: (t, n, r) => {
			if (!e) return;
			let i = Array.isArray(t) ? t : [t], a = c.filter((t) => t.layer !== s || !e.declarations(t.utility)?.some((e) => i.includes(e.property))).map((e) => e.raw), l = (Array.isArray(n) ? n : [n]).filter((e) => !!e);
			p([...a, ...l.map((e) => qe(o, e))], r ?? i.join(","));
		},
		apply: (n, r) => {
			e && !(n.length === t.length && n.every((e, n) => e === t[n])) && a(n, r);
		},
		edit: (a, o) => {
			if (!e) return;
			let s = t, c = () => ci(e, s, n, r, i, (e) => {
				s = e;
			});
			a({
				set: (e, t) => c().set(e, t),
				write: (e) => c().write(e),
				put: (e, t) => c().put(e, t),
				swap: (e, t) => c().swap(e, t),
				value: (e) => c().value(e)
			}), p(s, o ?? "edit");
		}
	};
	return h;
}
function li(e, t, n) {
	return t.flatMap((t) => {
		let { variants: r, utility: i } = G(t);
		if (K(r) !== n || !/^-?size-/.test(ii(i))) return [t];
		let a = ["w", "h"].map((e) => i.replace("size-", `${e}-`));
		return a.every((t) => e.valid(t)) ? a.map((e) => qe(r, e)) : [t];
	});
}
function ui(e, t, n, r) {
	let i = n.trim();
	if (i === "") return null;
	let a = (t) => e.declarations(t) === null ? null : t, o = nt(i), s = o ? e.make(t, o.alpha === void 0 ? o.key : `${o.key}/${o.alpha}`) : null;
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
			let e = di[String(+s.toFixed(2))];
			e && (u = a(`${n}${t}-${e}`));
		} else r === "px" && (o === "px" || o === "" && s === 0) || r === "deg" && (o === "deg" || o === "") ? u = l(s) : r === "ms" && (o === "ms" || o === "s") ? u = l(o === "s" ? s * 1e3 : s) : r === "percent" && o === "%" ? u = l(s) : r === "percent" && o === "" ? u = l(s * 100) : r === "number" && o === "" && (u = l(s));
		if (u) return u;
	}
	return e.make(t, i);
}
var di = {
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
}, fi = {
	"to top": "0deg",
	"to right": "90deg",
	"to bottom": "180deg",
	"to left": "270deg"
}, pi = {
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
}, mi = [
	"background-image",
	"--tw-gradient-from",
	"--tw-gradient-via",
	"--tw-gradient-to",
	"--tw-gradient-from-position",
	"--tw-gradient-via-position",
	"--tw-gradient-to-position"
];
function hi(e, t) {
	let n = () => {
		let n = `${t.kind}-gradient(${[t.angle, ...t.stops.map((e) => `${e.color}${e.at ? ` ${e.at}` : ""}`)].filter(Boolean).join(", ")})`, r = e.make("bg", n);
		return [r && e.declarations(r)?.some((e) => e.property === "background-image") ? r : e.utilityFor("background-image", n)];
	};
	if (t.kind !== "linear" || t.stops.length < 2 || t.stops.length > 3) return n();
	let r = t.angle.trim().replace(/\s+/g, " "), i = /^(-?\d+)deg$/.exec(r), a = pi[r] ? `bg-linear-to-${pi[r]}` : i ? `${i[1].startsWith("-") ? "-" : ""}bg-linear-${i[1].replace("-", "")}` : null;
	if (!a || e.declarations(a) === null) return n();
	let o = t.stops.length === 3 ? [
		"from",
		"via",
		"to"
	] : ["from", "to"], s = [a];
	for (let [r, i] of t.stops.entries()) {
		let t = ui(e, o[r], i.color, "number"), a = i.at ? e.make(o[r], i.at) : null;
		if (!t || i.at && !a) return n();
		s.push(t, ...a ? [a] : []);
	}
	return s;
}
function gi(e) {
	let t = e("--tw-gradient-position"), n = e("--tw-gradient-from"), r = e("--tw-gradient-to");
	if (!t && !n && !r) return;
	let i = e("--tw-gradient-via"), a = (t, n) => {
		let r = e(`--tw-gradient-${n}-position`);
		return `${t ?? "transparent"}${r ? ` ${r}` : ""}`;
	}, o = (t ?? "to bottom").replace(/\s+in\s+[\w-]+(\s+\w+\s+hue)?$/, "");
	return `linear-gradient(${[
		fi[o] ?? o,
		a(n, "from"),
		...i ? [a(i, "via")] : [],
		a(r, "to")
	].join(", ")})`;
}
function _i(e) {
	return new Set(e.flatMap((e) => G(e).variants));
}
function vi(e, t) {
	let n = K(t);
	return e.some((e) => K(G(e).variants) === n);
}
function yi(e, t) {
	return G(e).variants.length ? e : qe(t, e);
}
function bi(e, t, n) {
	let r = new Set(n), i = {
		site: [],
		utilities: []
	};
	for (let n of t) {
		let { utility: t } = G(n);
		r.has(ii(t)) || e && !e.valid(n) ? i.site.push(n) : i.utilities.push(n);
	}
	return i;
}
var xi = (e) => /^[^\s"<>`\u0000-\u001f\u007f]{1,200}$/.test(e), Si = (e, t) => !xi(t) || !!e && /[:[\]/()]/.test(t) && !e.valid(t), Ci = /* @__PURE__ */ new WeakMap();
function wi(e) {
	let t = Ci.get(e);
	return t || Ci.set(e, t = e.ds.getClassList().map(([e]) => e)), t;
}
var Ti = 40;
function Ei(e, t, n, r) {
	let i = n.trim().toLowerCase(), a = t.filter((e) => !r.has(e) && e.toLowerCase().includes(i));
	if (!i) return a.slice(0, Ti);
	let o = new Set(t), s = [], c = [];
	for (let t of wi(e)) {
		if (o.has(t) || r.has(t)) continue;
		let e = t.indexOf(i);
		if (e === 0 ? s.push(t) : e > 0 && c.length < Ti && c.push(t), s.length >= Ti) break;
	}
	let l = n.trim(), u = [
		...a,
		...s.sort((e, t) => e.length - t.length),
		...c
	];
	return !l || r.has(l) || u.includes(l) || !xi(l) || Si(e, l) ? u.slice(0, Ti) : e.valid(l) ? [l, ...u].slice(0, Ti) : [...u.slice(0, 39), l];
}
function Di(e, t) {
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
function Oi(e) {
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
function ki(e) {
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
var Ai = [
	0,
	1,
	2,
	3,
	4,
	6,
	8,
	12,
	16,
	24
];
function ji(e, t) {
	let n = /^([\d.]+)rem$/.exec(e?.ds.resolveThemeValue("--spacing") ?? "");
	return [...n ? Ai.map((e) => {
		let t = `${+(Number(n[1]) * e * 16).toFixed(3)}px`;
		return {
			label: String(e),
			value: t,
			title: t
		};
	}) : [], ...t.map((e) => ({
		label: e.name,
		value: e.ref,
		title: `${e.variable} · ${e.value}`
	}))];
}
// admin/src/builder/fields/tokens.tsx
function Mi() {
	return X().find;
}
function Ni(e) {
	let t = X();
	return (n) => {
		let r = n.trim();
		return !e || !/^[a-z][a-z0-9-]*$/i.test(r) ? null : t.of(e).find((e) => e.name === r)?.ref ?? null;
	};
}
function Pi({ token: e, alpha: t, className: n }) {
	return /* @__PURE__ */ H("span", {
		className: B("inline-flex min-w-0 items-center gap-1 truncate rounded-xs bg-active px-1.5 leading-5 text-ink", n),
		title: `${e.variable} · ${e.value}`,
		children: [/* @__PURE__ */ V("span", {
			className: "truncate",
			children: e.name
		}), t && /* @__PURE__ */ H("span", {
			className: "text-muted",
			children: ["/", t]
		})]
	});
}
var Fi = (e) => B("h-6 min-w-7 rounded-xs px-1.5 text-2xs tabular-nums", e ? "bg-signal text-signal-ink" : "bg-sunken text-text hover:bg-hover");
function Ii({ value: e, onPick: t, auto: n }) {
	let { engine: r } = yt(), i = ji(r, X().of("spacing")), a = (t) => t === e || t === "0px" && e === "0";
	return /* @__PURE__ */ H("div", {
		className: "flex flex-wrap gap-1",
		children: [i.map((e) => /* @__PURE__ */ V(z, {
			compact: !0,
			title: e.title,
			onClick: () => t(e.value),
			className: Fi(a(e.value)),
			children: e.label
		}, e.value)), n && /* @__PURE__ */ V(z, {
			compact: !0,
			onClick: () => t("auto"),
			className: Fi(e === "auto"),
			children: D("Auto")
		})]
	});
}
function Li({ group: e, value: t, onPick: n, detach: r }) {
	let i = X(), a = i.of(e), o = i.find(t)?.token.variable ?? null;
	return e === "spacing" ? /* @__PURE__ */ V("div", {
		className: "p-1",
		children: /* @__PURE__ */ V(Ii, {
			value: t,
			onPick: n
		})
	}) : /* @__PURE__ */ H("div", { children: [/* @__PURE__ */ V("div", {
		className: "max-h-60 overflow-y-auto",
		children: a.map((t) => /* @__PURE__ */ H(z, {
			compact: !0,
			onClick: () => n(t.ref),
			className: B("flex h-7 w-full items-center gap-2 rounded-xs px-2 text-left text-xs hover:bg-hover", o === t.variable && "bg-active"),
			children: [
				e === "shadow" && /* @__PURE__ */ V("span", {
					className: "size-3.5 shrink-0 rounded-xs bg-bg",
					style: { boxShadow: t.value }
				}),
				e === "radius" && /* @__PURE__ */ V("span", {
					className: "size-3.5 shrink-0 border-l-[1.5px] border-t-[1.5px] border-muted",
					style: { borderTopLeftRadius: t.value }
				}),
				/* @__PURE__ */ V("span", {
					className: "min-w-0 truncate text-text",
					children: t.name
				}),
				/* @__PURE__ */ V("span", {
					className: "ml-auto max-w-[45%] shrink-0 truncate font-mono text-2xs text-faint",
					children: t.value
				}),
				o === t.variable && /* @__PURE__ */ V(F, {
					name: "check",
					size: 12,
					className: "shrink-0 text-focus"
				})
			]
		}, t.variable))
	}), o && r && /* @__PURE__ */ H(z, {
		compact: !0,
		onClick: r,
		className: "mt-1 flex h-7 w-full items-center gap-2 rounded-xs border-t border-border px-2 text-xs text-muted hover:bg-hover hover:text-text",
		children: [/* @__PURE__ */ V(F, {
			name: "unlink",
			size: 12
		}), D("Detach")]
	})] });
}
function Ri({ group: e, value: t, onPick: n, active: r, className: i, trigger: a }) {
	let [o, s] = N(!1), c = X(), { engine: l } = yt(), u = e;
	if (!l || u !== "spacing" && !c.of(u).length) return null;
	let d = (e) => {
		n(e), s(!1);
	};
	return /* @__PURE__ */ V(we, {
		open: o,
		onOpenChange: s,
		align: "end",
		className: "w-60 !p-1",
		trigger: a ?? /* @__PURE__ */ V(z, {
			compact: !0,
			className: B("grid size-5 shrink-0 place-items-center rounded-xs text-faint transition-opacity hover:bg-hover hover:text-ink", !r && !o && "opacity-0 group-hover/value:opacity-100 group-focus-within/value:opacity-100", (r || o) && "text-ink", i),
			"aria-label": D("Theme Values"),
			title: D("Theme Values"),
			children: /* @__PURE__ */ V(F, {
				name: "symbol",
				size: 10
			})
		}),
		children: /* @__PURE__ */ V(Li, {
			group: u,
			value: t,
			onPick: d,
			detach: () => d(c.find(t)?.token.value ?? null)
		})
	});
}
// admin/src/builder/fields/controls.tsx
function zi(e, t) {
	let n = (e) => Object.entries(e).every(([e, n]) => Array.isArray(n) ? n.includes(t[e]) : t[e] === n), r = e.if, i = e.unless;
	return (!r || n(r)) && !(i && Object.entries(i).every(([e, n]) => Array.isArray(n) ? n.includes(t[e] ?? null) : (t[e] ?? null) === n));
}
function Bi({ field: e, ...t }) {
	let n = oe.fields.get(e.component ?? e.type) ?? oe.fields.get("json");
	return n ? /* @__PURE__ */ V("div", {
		className: B("min-w-0 flex-1", e.className),
		children: /* @__PURE__ */ V(n, {
			field: e,
			...t,
			context: t.context ?? {}
		})
	}) : null;
}
function Vi({ className: e, children: t }) {
	return /* @__PURE__ */ V("div", {
		className: B("relative flex min-w-0 flex-1 items-center gap-1", e),
		children: t
	});
}
var Hi = /^(-?\d*\.?\d+)([a-z%]*)$/i, Ui = {
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
}, Wi = (e, t, n) => Math.min(n ?? Infinity, Math.max(t ?? -Infinity, e)), Gi = (e) => Math.round(e * 1e3) / 1e3;
function Ki(e) {
	return e.field.percent ? /* @__PURE__ */ V(qi, { ...e }) : /* @__PURE__ */ V(Zi, { ...e });
}
function qi({ field: e, value: t, onChange: n, ...r }) {
	let i = t == null || t === "" ? null : Number(t), a = (e) => typeof e == "number" ? Math.round(e * 100) : void 0, o = e.slider;
	return /* @__PURE__ */ V(Zi, {
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
function Ji(e, t) {
	let [n, r] = N(!1), i = t(e);
	return j(() => {
		if (i) return r(!1);
		let e = window.setTimeout(() => r(!0), 700);
		return () => window.clearTimeout(e);
	}, [e, i]), {
		shown: n && !i,
		show: () => r(!0)
	};
}
var Yi = {
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
function Xi(e, t, n) {
	if (typeof CSS > "u") return !0;
	let r = e, i = t.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`);
	return /^-?[a-z]+(-[a-z]+)*$/.test(i) && CSS.supports(i, "inherit") ? CSS.supports(i, r) : (Yi[n] ?? Yi.length).some((e) => CSS.supports(e, r));
}
function Zi({ field: e, value: t, onChange: n, disabled: r, context: i }) {
	let a = Mi(), o = Ni(e.group), [s, c] = N(null), [l, u] = N(null), d = M(null), f = M(null), [p, m] = N(0);
	_e(() => {
		let e = f.current ? f.current.offsetWidth + 4 : 0;
		e !== p && m(e);
	});
	let h = t == null || t === "" ? void 0 : String(t), g = e.unit ?? "px", _ = e.step ?? 1, v = e.min, y = e.max, b = e.group, x = e.prefixIcon ? /* @__PURE__ */ V(F, {
		name: e.prefixIcon,
		size: 13
	}) : e.prefix, ee = e.slider, te = e.menu, S = e.action, C = e.keywords ?? [], w = a(h), T = h?.match(Hi), E = T ? T[2] || g : h ? "" : l ?? g, ne = g ? e.units ?? Ui[g] ?? [g] : [], re = !h || !!T, ie = (e, t = E) => n(`${Gi(Wi(e, v, y))}${t}`), ae = (e) => {
		re && ie((T ? parseFloat(T[1]) : 0) + e);
	}, oe = (e, t) => {
		if (r || e.button !== 0 || document.activeElement === e.currentTarget || !re) return;
		e.preventDefault();
		let n = e.clientX, i = T ? parseFloat(T[1]) : 0, a = !1, o = (e) => {
			let t = e.clientX - n;
			!a && Math.abs(t) < 3 || (a = !0, document.body.style.cursor = "ew-resize", ie(i + Math.round(t / 2) * _ * (e.shiftKey ? 10 : e.altKey ? .1 : 1)));
		}, s = () => {
			window.removeEventListener("pointermove", o), window.removeEventListener("pointerup", s), document.body.style.cursor = "", !a && t && d.current?.focus();
		};
		window.addEventListener("pointermove", o), window.addEventListener("pointerup", s);
	}, se = (t) => t === "" ? null : o(t) || (/^-?\d*\.?\d+$/.test(t) ? E ? `${t}${E}` : t : C.includes(t) || Xi(t, e.property ?? e.handle, g) ? t : void 0), ce = Ji(s ?? "", (e) => s === null || se(e.trim()) !== void 0), O = () => {
		if (s === null) return;
		let e = s.trim();
		if (c(null), e === (T ? T[1] : h ?? "")) return;
		let t = se(e);
		t !== void 0 && n(t);
	}, le = (e) => {
		T ? n(`${T[1]}${e}`) : h || u(e);
	};
	return /* @__PURE__ */ H(Vi, { children: [
		ee && /* @__PURE__ */ V(Bi, {
			field: {
				handle: `${e.handle}-slider`,
				type: "number",
				display: "slider",
				input: !1,
				size: "sm",
				label: e.label,
				min: ee.min,
				max: ee.max,
				step: ee.step,
				neutral: ee.neutral
			},
			value: T ? parseFloat(T[1]) : null,
			onChange: (e) => n(e),
			disabled: r,
			context: i
		}),
		/* @__PURE__ */ H("div", {
			className: B("group/value relative flex h-7 min-w-0 flex-1 items-center", ee && "!w-16 !flex-none"),
			title: e.title,
			children: [
				x !== void 0 && /* @__PURE__ */ V("span", {
					onPointerDown: (e) => oe(e, !0),
					className: "absolute left-0 z-raised grid h-7 w-6 cursor-ew-resize select-none place-items-center text-xs text-faint hover:text-ink",
					children: x
				}),
				w && s === null ? /* @__PURE__ */ V(Ri, {
					group: b ?? w.token.group,
					value: h,
					onPick: n,
					trigger: /* @__PURE__ */ V(z, {
						compact: !0,
						onDoubleClick: () => c(h ?? ""),
						className: B(Zr, "flex items-center pr-1 text-left", x !== void 0 && "!pl-6"),
						children: /* @__PURE__ */ V(Pi, {
							token: w.token,
							alpha: w.alpha,
							className: "text-xs"
						})
					})
				}) : /* @__PURE__ */ V("input", {
					ref: d,
					id: Me(e),
					value: s ?? (T ? T[1] : h ?? ""),
					placeholder: e.placeholder,
					disabled: r,
					autoComplete: "off",
					spellCheck: !1,
					onPointerDown: (e) => oe(e, !0),
					onChange: (e) => c(e.target.value),
					onFocus: (e) => e.target.select(),
					onBlur: O,
					"aria-invalid": ce.shown || void 0,
					onKeyDown: (e) => {
						e.key === "Enter" && (s !== null && se(s.trim()) === void 0 ? ce.show() : e.target.blur()), e.key === "Escape" && (c(null), requestAnimationFrame(() => d.current?.blur())), (e.key === "ArrowUp" || e.key === "ArrowDown") && re && (e.preventDefault(), c(null), ae((e.key === "ArrowUp" ? 1 : -1) * _ * (e.shiftKey ? 10 : e.altKey ? .1 : 1)));
					},
					className: B(Zr, "tabular-nums", re && !r && "cursor-ew-resize focus:cursor-text", x !== void 0 && "!pl-6"),
					style: { paddingRight: p + 6 }
				}),
				(!w || s !== null) && /* @__PURE__ */ H("div", {
					ref: f,
					className: "pointer-events-none absolute inset-y-0 right-1 flex items-center",
					children: [
						b && /* @__PURE__ */ V(Ri, {
							group: b,
							value: h,
							onPick: n,
							className: "pointer-events-auto"
						}),
						E && ne.length > 0 && /* @__PURE__ */ V(L, {
							align: "end",
							trigger: /* @__PURE__ */ V(z, {
								compact: !0,
								disabled: r,
								className: B("pointer-events-auto h-5 min-w-5 rounded-xs px-1 text-2xs text-faint hover:bg-hover hover:text-ink data-[popup-open]:opacity-100"),
								"aria-label": D("Unit"),
								children: E
							}),
							items: [...ne.map((e) => ({
								label: e,
								checked: e === E,
								onSelect: () => le(e)
							})), ...C.length ? [{
								separator: !0,
								label: ""
							}, ...C.map((e) => ({
								label: e,
								checked: h === e,
								onSelect: () => n(e)
							}))] : []]
						}),
						!E && g && C.length > 0 && h && C.includes(h) && /* @__PURE__ */ V(L, {
							align: "end",
							trigger: /* @__PURE__ */ V(z, {
								compact: !0,
								className: "pointer-events-auto grid size-5 place-items-center rounded-xs text-faint hover:bg-hover hover:text-ink",
								"aria-label": D("Unit"),
								children: /* @__PURE__ */ V(F, {
									name: "chevron-down",
									size: 10
								})
							}),
							items: [
								...ne.map((e) => ({
									label: e,
									onSelect: () => n(`0${e}`)
								})),
								{
									separator: !0,
									label: ""
								},
								...C.map((e) => ({
									label: e,
									checked: h === e,
									onSelect: () => n(e)
								}))
							]
						})
					]
				})
			]
		}),
		te && /* @__PURE__ */ V(L, {
			align: "end",
			trigger: /* @__PURE__ */ H(z, {
				compact: !0,
				className: "flex h-7 shrink-0 items-center gap-0.5 rounded-sm px-1.5 text-xs text-muted hover:bg-hover hover:text-ink",
				children: [te.label, /* @__PURE__ */ V(F, {
					name: "chevron-down",
					size: 10
				})]
			}),
			items: te.items.map((e) => ({
				label: e.label,
				checked: e.checked,
				onSelect: () => n(e.value)
			}))
		}),
		S && /* @__PURE__ */ V(z, {
			compact: !0,
			onClick: () => n(S.value),
			className: "grid size-7 shrink-0 place-items-center rounded-sm text-muted hover:bg-hover hover:text-ink",
			title: S.label,
			"aria-label": S.label,
			children: /* @__PURE__ */ V(F, {
				name: S.icon,
				size: 14
			})
		})
	] });
}
// admin/src/builder/fields/composite.tsx
var Qi = {
	2: "grid grid-cols-2",
	3: "grid grid-cols-3",
	4: "grid grid-cols-4"
};
function $i({ field: e, value: t, onChange: n, disabled: r, context: i }) {
	let a = t ?? {}, o = e.link, [s, c] = N(!o || e.split === !0), l = (s ? e.fields ?? [] : [o]).filter((e) => zi(e, a)), u = s ? Qi[e.columns] : void 0;
	return /* @__PURE__ */ H(Vi, { children: [/* @__PURE__ */ V("div", {
		className: B("min-w-0 flex-1 gap-1", u ?? "flex items-center"),
		children: l.map((e) => /* @__PURE__ */ V(Bi, {
			field: e,
			value: a[e.handle] ?? e.default ?? null,
			onChange: (t) => n({
				...a,
				[e.handle]: t
			}),
			disabled: r,
			context: i
		}, e.handle))
	}), o && /* @__PURE__ */ V(z, {
		compact: !0,
		onClick: () => c(!s),
		className: "grid size-7 shrink-0 place-items-center rounded-sm text-muted hover:bg-hover hover:text-ink",
		title: s ? e.joinLabel ?? D("The same for all") : e.splitLabel ?? D("Each One"),
		children: /* @__PURE__ */ V(F, {
			name: s ? "square" : "radius",
			size: 14
		})
	})] });
}
function ea({ field: e, value: t, onChange: n, disabled: r, context: i }) {
	let a = t ?? {}, o = e.key ?? {}, s = e.labels, c = e.items, l = (e, t) => {
		let r = (t ?? "").trim();
		o.lower && (r = r.toLowerCase()), o.strip && (r = r.replace(new RegExp(o.strip, "g"), "")), !(!r || r === e || r in a || o.allowed && !o.allowed.includes(r)) && n(Object.fromEntries(Object.entries(a).map(([t, n]) => t === e ? [r, n] : [t, n])));
	};
	return /* @__PURE__ */ V("div", {
		className: "min-w-0 flex-1 space-y-1",
		children: Object.entries(a).map(([t, u]) => /* @__PURE__ */ H("div", {
			className: "flex items-center gap-1",
			children: [
				o.prefix && /* @__PURE__ */ V("span", {
					className: "text-xs text-faint",
					children: o.prefix
				}),
				s ? /* @__PURE__ */ V("span", {
					className: "mr-1 w-[88px] shrink-0 truncate text-xs text-text",
					children: s[t] ?? t
				}) : /* @__PURE__ */ V(Bi, {
					field: {
						handle: `${e.handle}-${t}`,
						type: o.options ? "select" : "text",
						size: "sm",
						commit: "blur",
						label: D("Name"),
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
				typeof e.join == "string" && /* @__PURE__ */ V("span", {
					className: "text-xs text-faint",
					children: e.join
				}),
				/* @__PURE__ */ V(Bi, {
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
				/* @__PURE__ */ V(ti, { onClick: () => n(Object.fromEntries(Object.entries(a).filter(([e]) => e !== t))) })
			]
		}, t))
	});
}
function ta(e, t) {
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
var na = () => [
	{
		path: "entry.author.name",
		label: D("Author"),
		group: D("Page")
	},
	{
		path: "entry.title",
		label: D("Title"),
		group: D("Page")
	},
	{
		path: "entry.url",
		label: D("Link"),
		group: D("Page")
	},
	{
		path: "entry.date|date:F j, Y",
		label: D("Published Date"),
		group: D("Page")
	},
	{
		path: "entry.updated|date:F j, Y",
		label: D("Updated Date"),
		group: D("Page")
	},
	{
		path: "entry.parent.title",
		label: D("Parent Title"),
		group: D("Page")
	},
	{
		path: "entry.prev.url",
		label: D("Previous Page Link"),
		group: D("Page")
	},
	{
		path: "entry.prev.title",
		label: D("Previous Page Title"),
		group: D("Page")
	},
	{
		path: "entry.next.url",
		label: D("Next Page Link"),
		group: D("Page")
	},
	{
		path: "entry.next.title",
		label: D("Next Page Title"),
		group: D("Page")
	}
], ra = () => [
	{
		path: "site.name",
		label: D("Site Name"),
		group: D("Site")
	},
	{
		path: "site.description",
		label: D("Site Description"),
		group: D("Site")
	},
	{
		path: "site.url",
		label: D("Site URL"),
		group: D("Site")
	},
	{
		path: "© {site.year} {site.name}",
		label: D("Copyright Line"),
		group: D("Site")
	},
	{
		path: "page.uri",
		label: D("Current Path"),
		group: D("Site")
	},
	{
		path: "pagination.prev",
		label: D("Previous Page of a List"),
		group: D("Pagination")
	},
	{
		path: "pagination.next",
		label: D("Next Page of a List"),
		group: D("Pagination")
	},
	{
		path: "{pagination.current} / {pagination.total}",
		label: D("Page x of y"),
		group: D("Pagination")
	}
];
function ia(e) {
	let { store: t, doc: n, catalog: r } = a(), i = le(), o = W(t, (t) => u(t.nodes, e.id)), s = O("entries/get", { id: n?.id ?? "" }, {
		enabled: n?.kind === "entry",
		staleTime: 6e4
	}), c = n?.kind === "template" ? n.collections?.length ? n.collections : i.collections.filter((e) => e.routable).map((e) => e.handle).slice(0, 1) : s.data ? [s.data.collection] : [], l = O("collections/get", { handle: c[0] ?? "" }, {
		enabled: !!c[0],
		staleTime: 3e5
	}), d = [];
	for (let e of [...o].reverse()) {
		if (e.type !== "repeat") continue;
		let t = e.props?.as || "item", n = r.sources?.find((t) => t.name === e.props?.source), i = D("{list} item ({name})", {
			list: n?.label ?? D("List"),
			name: t
		});
		for (let [e, r] of Object.entries(n?.item ?? {})) d.push({
			path: `${t}.${e}`,
			label: r,
			group: i
		});
		e.props?.source === "entries" && e.props?.collection && d.push({
			path: `${t}.excerpt`,
			label: D("Excerpt Field"),
			group: i
		}, {
			path: `${t}.cover`,
			label: D("Cover Image Field"),
			group: i
		}), e.props?.source === "list" && d.push({
			path: `{${t}}`,
			label: D("The Item Itself (Text)"),
			group: i
		}), d.push({
			path: "index",
			label: D("Position (1, 2, 3…)"),
			group: i
		}, {
			path: "first",
			label: D("Is First"),
			group: i
		}, {
			path: "last",
			label: D("Is Last"),
			group: i
		});
	}
	if (n?.kind === "component") for (let e of n.props ?? []) d.push({
		path: `props.${e.handle}`,
		label: e.label ?? e.handle,
		group: D("Component Properties")
	});
	d.push(...na());
	for (let e of l.data?.fields ?? []) e.type !== "blocks" && d.push({
		path: `entry.${e.handle}${e.type === "date" ? "|date:F j, Y" : ""}`,
		label: e.label,
		group: D("Page Fields")
	});
	d.push(...ra());
	for (let e of i.globals) d.push({
		path: `globals.${e.handle}.`,
		label: D("{name} (add a field handle)", { name: e.title }),
		group: D("Globals")
	});
	return d;
}
// admin/src/builder/content/ContentPanel.tsx
var aa = [
	"text",
	"textarea",
	"richtext",
	"markdown"
], oa = (e, t) => !e.if || Object.entries(e.if).every(([e, n]) => {
	let r = t[e] ?? null;
	return Array.isArray(n) ? n.includes(r) : r === n;
});
function sa({ field: e, value: t, bound: n, paths: r, onValue: i, onBind: a, extra: o }) {
	let s = e.type === "richtext" && e.inline && e.handle !== "text" && !e.component ? {
		...e,
		component: "blocks-inline-text"
	} : e, c = !n && Re.includes(s.type) && !s.component, l = !n && Yr(s), u = !n && s.type === "toggle", d = n ? {
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
	}, f = { [s.handle]: n ?? t }, p = (e, t) => n ? a(t) : i(t), m = c ? /* @__PURE__ */ V(xe, {
		bare: !0,
		fields: [d],
		values: f,
		onChange: p,
		className: "min-w-0"
	}) : /* @__PURE__ */ V(Z, {
		bare: !0,
		fields: [d],
		values: f,
		onChange: p,
		className: "min-w-0 flex-1"
	});
	if (u) return /* @__PURE__ */ V("div", {
		className: "flex min-h-7 items-center",
		children: m
	});
	let h = /* @__PURE__ */ V(ke, {
		content: D(n ? "Disconnect from Data" : "Connect to Data"),
		children: /* @__PURE__ */ V(I, {
			icon: "database",
			size: "xs",
			label: D(n ? "Disconnect from Data" : "Connect to Data"),
			title: void 0,
			onClick: () => a(n ? null : r[0]?.path ?? "entry.title"),
			className: B("overflow-hidden", n ? "!text-ink" : "!w-0 !text-faint hover:!text-ink focus-visible:!w-6 group-hover/prop:!w-6 [@media(hover:none)]:!w-6")
		})
	}), g = /* @__PURE__ */ H("span", {
		className: B("flex h-7 min-w-0 shrink-0 items-center gap-0.5", !l && "w-[88px]"),
		children: [/* @__PURE__ */ V("label", {
			htmlFor: Me(s),
			className: B("min-w-0 flex-1 truncate text-xs", n ? "text-ink" : "text-muted"),
			title: s.instructions,
			children: s.label
		}), h]
	});
	return l ? /* @__PURE__ */ H("div", {
		className: "group/prop pb-1",
		children: [g, m]
	}) : /* @__PURE__ */ H("div", {
		className: "group/prop flex min-h-7 items-center gap-2",
		children: [g, m]
	});
}
function ca({ node: e }) {
	let { store: t, types: n } = a(), r = n.get(e.type), i = ia(e), o = Ut().filter((t) => t.id !== (e.anchor ?? e.props?.anchor)), s = e.bind ?? {}, c = {
		...Object.fromEntries((r?.fields ?? []).map((e) => [e.handle, e.default ?? null])),
		...r?.defaults ?? {},
		...e.props ?? {}
	}, l = (n, r) => {
		let i = { ...s };
		r ? i[n] = r : delete i[n], t.updateNode(e.id, { bind: Object.keys(i).length ? i : void 0 }, `bind:${e.id}:${n}`);
	}, u = (n, r) => t.updateProps(e.id, { [n]: r }, `inspector:${e.id}:${n}`), d = (r?.fields ?? []).filter((e) => !e.design && !(e.type === "json" && [
		"items",
		"rows",
		"values"
	].includes(e.handle))), f = d.some((e) => e.component === "link") && d.some((e) => e.handle === "new_tab"), p = d.filter((e) => !(f && e.handle === "new_tab") && oa(e, c)), m = p.filter((e) => !e.advanced), h = p.filter((e) => e.advanced), g = (t) => /* @__PURE__ */ V(sa, {
		field: t,
		value: e.props?.[t.handle],
		bound: s[t.handle],
		paths: i,
		onValue: (e) => u(t.handle, e),
		onBind: (e) => l(t.handle, e),
		extra: v(t)
	}, t.handle), _ = e.type === "repeat", v = (t) => t.component === "link" || t.type === "url" ? {
		anchors: o,
		...f ? {
			newTab: !!e.props?.new_tab,
			onNewTab: (e) => u("new_tab", e || void 0)
		} : {}
	} : void 0;
	return !r && e.type !== "component" ? /* @__PURE__ */ H(Kr, { children: [/* @__PURE__ */ V(Se, {
		title: D("Its plugin is off"),
		children: D("This block is kept as it is and shows again when its plugin is turned on.")
	}), Object.keys(e.props ?? {}).length > 0 && /* @__PURE__ */ V("pre", {
		"aria-label": D("Settings"),
		className: "m-0 mt-3 overflow-x-auto rounded-md bg-sunken p-3 font-mono text-xs text-muted",
		children: JSON.stringify(e.props, null, 2)
	})] }) : /* @__PURE__ */ H("div", { children: [
		e.type === "component" ? /* @__PURE__ */ V(la, {
			node: e,
			paths: i,
			setBind: l,
			anchors: o
		}) : _ ? /* @__PURE__ */ V(ua, { node: e }) : m.length > 0 && /* @__PURE__ */ V(Kr, { children: m.map(g) }),
		/* @__PURE__ */ V(Gr, {
			title: D("Visibility"),
			open: !!(s.visible || s.hidden || e.hidden),
			empty: !s.visible && !s.hidden && !e.hidden,
			children: /* @__PURE__ */ V(Z, {
				fields: [
					{
						handle: "shown",
						type: "toggle",
						size: "sm",
						label: D("Show on the Site")
					},
					{
						handle: "visible",
						type: "text",
						component: "blocks-bind",
						label: D("Only If"),
						paths: i,
						placeholder: D("Always"),
						status: s.visible ? "own" : void 0,
						reset: () => l("visible", null)
					},
					{
						handle: "hidden",
						type: "text",
						component: "blocks-bind",
						label: D("Hide If"),
						paths: i,
						placeholder: D("Never"),
						status: s.hidden ? "own" : void 0,
						reset: () => l("hidden", null)
					}
				],
				values: {
					shown: !e.hidden,
					visible: s.visible,
					hidden: s.hidden
				},
				onChange: (n, r) => n === "shown" ? t.updateNode(e.id, { hidden: !r || void 0 }) : l(n, r)
			})
		}),
		/* @__PURE__ */ H(Gr, {
			title: D("Advanced"),
			open: !1,
			empty: !e.anchor && !e.attrs && !e.class && !e.persist && !h.some((t) => e.props?.[t.handle] !== void 0 && e.props?.[t.handle] !== t.default),
			children: [
				_ ? /* @__PURE__ */ V(da, { node: e }) : h.map(g),
				/* @__PURE__ */ V(Z, {
					fields: [
						{
							handle: "label",
							type: "text",
							size: "sm",
							commit: "blur",
							label: D("Layer Name"),
							placeholder: r?.title
						},
						...h.some((e) => e.handle === "anchor") && !e.anchor ? [] : [{
							handle: "anchor",
							type: "text",
							size: "sm",
							commit: "blur",
							label: D("Anchor"),
							placeholder: D("None"),
							mono: !0
						}],
						{
							handle: "class",
							type: "text",
							size: "sm",
							commit: "blur",
							label: D("Classes"),
							placeholder: D("None"),
							mono: !0
						},
						...E("site.code") ? [{
							handle: "persist",
							type: "text",
							size: "sm",
							commit: "blur",
							label: D("Persist As"),
							placeholder: "player",
							mono: !0
						}] : []
					],
					values: {
						label: e.label,
						anchor: e.anchor,
						class: e.class,
						persist: e.persist
					},
					onChange: (n, r) => t.updateNode(e.id, { [n]: (n === "anchor" ? r.toLowerCase().replace(/[^a-z0-9-]/g, "") : n === "persist" ? r.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/^[^a-z]+/, "").slice(0, 40) : r) || void 0 })
				}),
				/* @__PURE__ */ V(qr, {
					title: D("Attributes"),
					action: /* @__PURE__ */ V(ei, {
						label: D("Add Attribute"),
						onClick: () => t.updateNode(e.id, { attrs: {
							...e.attrs ?? {},
							"aria-label": ""
						} })
					})
				}),
				/* @__PURE__ */ V(Z, {
					bare: !0,
					fields: [{
						handle: "attrs",
						type: "json",
						component: "blocks-pairs",
						className: "items-start",
						label: D("Attributes"),
						key: { lower: !0 },
						item: {
							handle: "value",
							type: "text",
							size: "sm",
							commit: "blur",
							label: D("Value")
						},
						items: Object.fromEntries(Object.keys(e.attrs ?? {}).filter((e) => s[`attr:${e}`]).map((e) => [e, {
							handle: "bind",
							type: "text",
							component: "blocks-bind",
							label: D("Data"),
							paths: i
						}]))
					}],
					values: { attrs: Object.fromEntries(Object.entries(e.attrs ?? {}).map(([e, t]) => [e, s[`attr:${e}`] ?? t])) },
					onChange: (n, r) => {
						let i = e.attrs ?? {}, a = ta(Object.fromEntries(Object.entries(i).map(([e, t]) => [e, s[`attr:${e}`] ?? t])), r);
						if (a?.op === "rename") t.updateNode(e.id, { attrs: Object.fromEntries(Object.entries(i).map(([e, t]) => e === a.from ? [a.to, t] : [e, t])) });
						else if (a?.op === "set" && s[`attr:${a.key}`]) l(`attr:${a.key}`, a.value ?? null);
						else if (a?.op === "set") t.updateNode(e.id, { attrs: {
							...i,
							[a.key]: a.value ?? ""
						} });
						else if (a?.op === "remove") {
							let n = { ...i };
							delete n[a.key], t.updateNode(e.id, { attrs: Object.keys(n).length ? n : void 0 }), l(`attr:${a.key}`, null);
						}
					}
				}),
				/* @__PURE__ */ V(qr, {
					title: D("States from Data"),
					action: /* @__PURE__ */ V(ei, {
						label: D("Add State from Data"),
						onClick: () => l("state:active", i[0]?.path ?? "item.active")
					})
				}),
				/* @__PURE__ */ V(Z, {
					bare: !0,
					fields: [{
						handle: "states",
						type: "json",
						component: "blocks-pairs",
						className: "items-start",
						label: D("States from Data"),
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
							label: D("Data"),
							paths: i
						}
					}],
					values: { states: Object.fromEntries(Object.entries(s).filter(([e]) => e.startsWith("state:")).map(([e, t]) => [e.slice(6), t])) },
					onChange: (n, r) => {
						let i = Object.fromEntries(Object.entries(s).filter(([e]) => !e.startsWith("state:"))), a = Object.fromEntries(Object.entries(r).filter(([, e]) => e).map(([e, t]) => [`state:${e}`, t])), o = {
							...i,
							...a
						};
						t.updateNode(e.id, { bind: Object.keys(o).length ? o : void 0 }, `bind:${e.id}:states`);
					}
				})
			]
		})
	] });
}
function la({ node: e, paths: t, setBind: n, anchors: r }) {
	let { store: i } = a(), o = O("components/list", { working: !0 }, { staleTime: 3e4 }), s = o.data?.find((t) => t.handle === e.props?.ref), c = e.props?.values ?? {}, l = e.bind ?? {};
	return /* @__PURE__ */ H(Kr, { children: [
		/* @__PURE__ */ V(Z, {
			fields: [{
				handle: "ref",
				type: "select",
				size: "sm",
				label: D("Component"),
				required: !0,
				options: (o.data ?? []).map((e) => ({
					value: e.handle,
					label: e.title
				}))
			}],
			values: { ref: e.props?.ref },
			onChange: (t, n) => n && i.updateProps(e.id, {
				ref: n,
				values: {}
			})
		}),
		(s?.props ?? []).map((a) => /* @__PURE__ */ V(sa, {
			field: {
				...a,
				placeholder: a.placeholder ?? (aa.includes(a.type) ? a.label : void 0)
			},
			value: c[a.handle] ?? a.default,
			bound: l[`values.${a.handle}`],
			paths: t,
			onValue: (t) => i.updateProps(e.id, { values: {
				...c,
				[a.handle]: t
			} }, `values:${e.id}:${a.handle}`),
			onBind: (e) => n(`values.${a.handle}`, e),
			extra: a.type === "url" ? {
				component: "link",
				reference: !0,
				anchors: r
			} : void 0
		}, a.handle)),
		/* @__PURE__ */ H("div", {
			className: "-ml-2 flex gap-1 pt-1",
			children: [s?.id && /* @__PURE__ */ V(P, {
				size: "sm",
				variant: "ghost",
				icon: "edit",
				onClick: () => ie(`/content/components/${s.id}`),
				children: D("Edit Component")
			}), /* @__PURE__ */ V(P, {
				size: "sm",
				variant: "ghost",
				icon: "scissors",
				onClick: () => {
					if (!s) return;
					let t = p(i.get().nodes, e.id);
					if (!t) return;
					let n = s.blocks.map((e) => b(e));
					i.commit(S(h(i.get().nodes, e.id), t.parentId, t.index, n)), i.select(n[0]?.id ?? null);
				},
				disabled: !s,
				children: D("Detach")
			})]
		})
	] });
}
function ua({ node: e }) {
	let { store: t, catalog: n } = a(), r = n.sources?.find((t) => t.name === e.props?.source), i = (n, r) => t.updateProps(e.id, { [n]: r }, `repeat:${e.id}:${n}`);
	return /* @__PURE__ */ H(Kr, { children: [
		/* @__PURE__ */ V(Z, {
			fields: [{
				handle: "source",
				type: "select",
				size: "sm",
				label: D("List"),
				required: !0,
				options: (n.sources ?? []).map((e) => ({
					value: e.name,
					label: e.label
				}))
			}],
			values: { source: e.props?.source },
			onChange: (e, t) => t && i("source", t)
		}),
		/* @__PURE__ */ V(Z, {
			fields: (r?.fields ?? []).map((e) => ({
				...e,
				size: "sm",
				width: "full"
			})),
			values: Object.fromEntries((r?.fields ?? []).map((t) => [t.handle, e.props?.[t.handle]])),
			onChange: (e, t) => i(e, t)
		}),
		/* @__PURE__ */ V(Z, {
			fields: [{
				handle: "empty",
				type: "text",
				size: "sm",
				commit: "blur",
				label: D("When Empty"),
				placeholder: D("Show Nothing")
			}],
			values: { empty: e.props?.empty },
			onChange: (e, t) => i(e, t || void 0)
		})
	] });
}
function da({ node: e }) {
	let { store: t } = a(), n = (n, r) => t.updateProps(e.id, { [n]: r }, `repeat:${e.id}:${n}`);
	return /* @__PURE__ */ V(Z, {
		fields: [{
			handle: "tag",
			type: "select",
			size: "sm",
			label: D("HTML Tag"),
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
			label: D("Item Name"),
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
function fa(e) {
	let { store: t } = a(), { engine: n, breakpoints: r } = yt(), i = W(t, (e) => e.breakpoint), o = W(t, (e) => e.state), s = ve(() => r.map((e) => e.name), [r]), c = s.includes(i) ? i : "";
	return ve(() => ci(n, Je(e.class), s, c, o, (n, r) => t.updateNode(e.id, { class: n.join(" ") || void 0 }, `style:${e.id}:${r ?? ""}`)), [
		n,
		e.class,
		e.id,
		s,
		c,
		o,
		t
	]);
}
// admin/src/builder/css.ts
function pa(e) {
	let t = [], n = 0, r = "";
	for (let i of e.trim()) i === "(" && n++, i === ")" && n--, /\s/.test(i) && n === 0 ? (r && t.push(r), r = "") : r += i;
	return r && t.push(r), t;
}
function ma(e) {
	let t = [], n = 0, r = "";
	for (let i of e) i === "(" && n++, i === ")" && n--, i === "," && n === 0 ? (t.push(r.trim()), r = "") : r += i;
	return r.trim() && t.push(r.trim()), t;
}
function ha(e) {
	if (e === void 0 || e === "") return null;
	let t = pa(String(e));
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
function ga(e, t) {
	let n = t.map((t) => e.status(t));
	return n.includes("own") ? "own" : n.includes("inherited") ? "inherited" : void 0;
}
function Q({ s: e, fields: t, bare: n }) {
	let r = t.filter(Boolean), i = {}, a = r.map(({ get: t, set: n, keys: r, markers: a, ...o }) => {
		let s = o.fields, c = a ?? r ?? (s ? s.map((e) => e.handle) : [o.handle]);
		return i[o.handle] = t ? t() : s ? Object.fromEntries(c.map((t) => [t, e.value(t)])) : e.value(o.handle), {
			status: ga(e, c),
			reset: () => a ? e.swap(a, null) : e.write(Object.fromEntries(c.map((e) => [e, null]))),
			...o
		};
	});
	return /* @__PURE__ */ V(Z, {
		bare: n,
		fields: a,
		values: i,
		onChange: (t, n) => {
			let a = r.find((e) => e.handle === t);
			if (a.set) return a.set(n);
			if (!n || typeof n != "object") return e.set(t, n);
			let o = va(i[t] ?? {}, n);
			Object.keys(o).length && e.write(o);
		},
		disabled: !e.engine
	});
}
var _a = (e) => e === "none" ? void 0 : e;
function va(e, t) {
	return Object.fromEntries(Object.entries(t ?? {}).filter(([t, n]) => n !== e[t]));
}
// admin/src/builder/design/Border.tsx
var ya = [
	"borderTopLeftRadius",
	"borderTopRightRadius",
	"borderBottomRightRadius",
	"borderBottomLeftRadius"
], ba = {
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
}, xa = "--tw-border-style", Sa = "--tw-outline-style", Ca = "--tw-ring-shadow", wa = () => [
	{
		value: "solid",
		label: D("Solid")
	},
	{
		value: "dashed",
		label: D("Dashed")
	},
	{
		value: "dotted",
		label: D("Dotted")
	},
	{
		value: "double",
		label: D("Double")
	},
	{
		value: "none",
		label: D("None")
	}
], Ta = (e) => e?.match(/0 0 0 calc\(([\d.]+px) \+/)?.[1];
function Ea({ s: e }) {
	let t = Object.keys(ba), [n, r] = N(() => t.find((t) => t !== "all" && e.value(ba[t].width)) ?? "all"), i = ba[n], a = {
		width: e.value(i.width),
		style: e.value(xa),
		color: e.value(i.color)
	}, o = ya.map((t) => e.value(t)), s = (t) => e.value(ya[t]) ?? ha(e.value("borderRadius"))?.[t], c = {
		width: e.value("outlineWidth"),
		style: e.value(Sa),
		color: e.value("outlineColor")
	}, l = {
		width: Ta(e.value(Ca)),
		color: e.value("--tw-ring-color")
	}, u = t.some((t) => e.value(ba[t].width) || e.value(ba[t].color)) || a.style || e.value("borderRadius") || o.some(Boolean) || c.width || c.style || l.width, d = (t) => ga(e, [ba[t].width, ba[t].color]), f = (t, n, r) => n && e.engine ? ui(e.engine, t, n, r) : null, p = (e, t, n) => ({
		value: e,
		icon: t,
		title: d(e) ? `${n} · ${d(e) === "own" ? D("set") : D("inherited")}` : n
	});
	return /* @__PURE__ */ H(Gr, {
		title: D("Border"),
		empty: !u,
		children: [/* @__PURE__ */ V(Q, {
			s: e,
			fields: [
				{
					handle: "edge",
					type: "select",
					display: "segmented",
					block: !0,
					required: !0,
					size: "sm",
					label: D("Sides"),
					keys: [],
					get: () => n,
					set: (e) => e && r(e),
					options: [
						p("all", "b-side-all", D("All Sides")),
						p("top", "b-side-top", D("Top")),
						p("right", "b-side-right", D("Right")),
						p("bottom", "b-side-bottom", D("Bottom")),
						p("left", "b-side-left", D("Left"))
					]
				},
				{
					handle: "line",
					type: "group",
					component: "blocks-group",
					label: D("Width"),
					markers: [i.width, xa],
					get: () => ({
						width: a.width,
						style: a.style
					}),
					set: (t) => {
						let n = va({
							width: a.width,
							style: a.style
						}, t);
						"width" in n ? e.swap(i.width, f(i.root, n.width, "px")) : "style" in n && e.swap(xa, n.style ? `border-${n.style}` : null);
					},
					fields: [{
						handle: "width",
						type: "text",
						component: "blocks-value",
						label: D("Width"),
						placeholder: "0",
						min: 0,
						prefixIcon: "square"
					}, {
						handle: "style",
						type: "select",
						size: "sm",
						label: D("Style"),
						options: wa(),
						placeholder: D("Solid")
					}]
				},
				{
					handle: "lineColor",
					type: "color",
					component: "blocks-color",
					label: D("Color"),
					placeholder: D("Text Color"),
					markers: [i.color],
					get: () => a.color,
					set: (t) => e.swap(i.color, f(i.root, t, "number"))
				},
				{
					handle: "radius",
					type: "group",
					component: "blocks-group",
					label: D("Radius"),
					status: e.status("borderRadius") === "own" || ya.some((t) => e.status(t) === "own") ? "own" : _a(e.status("borderRadius")),
					keys: ["borderRadius", ...ya],
					columns: 2,
					split: o.some(Boolean),
					splitLabel: D("Each Corner"),
					joinLabel: D("Same radius for every corner"),
					link: {
						handle: "borderRadius",
						type: "text",
						component: "blocks-value",
						label: D("Radius"),
						group: "radius",
						prefixIcon: "frame",
						placeholder: "0",
						min: 0
					},
					fields: ya.map((e, t) => ({
						handle: e,
						type: "text",
						component: "blocks-value",
						label: [
							D("Top Left"),
							D("Top Right"),
							D("Bottom Right"),
							D("Bottom Left")
						][t],
						title: [
							D("Top Left"),
							D("Top Right"),
							D("Bottom Right"),
							D("Bottom Left")
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
						...Object.fromEntries(ya.map((e, t) => [e, s(t)]))
					}),
					set: (t) => {
						if (t.borderRadius !== e.value("borderRadius")) return e.set("borderRadius", t.borderRadius);
						e.write({
							borderRadius: null,
							...Object.fromEntries(ya.map((e) => [e, t[e] ?? null]))
						});
					}
				}
			]
		}), /* @__PURE__ */ V("div", {
			className: "!mt-3 border-t border-border pt-2",
			children: /* @__PURE__ */ V(Q, {
				s: e,
				fields: [
					{
						handle: "outlineLine",
						type: "group",
						component: "blocks-group",
						label: D("Outline"),
						markers: ["outline-width", Sa],
						get: () => ({
							width: c.width,
							style: c.style
						}),
						set: (t) => {
							let n = va({
								width: c.width,
								style: c.style
							}, t);
							"width" in n ? e.swap("outline-width", f("outline", n.width, "px")) : "style" in n && e.swap(Sa, n.style ? n.style === "solid" ? "outline-solid" : `outline-${n.style}` : null);
						},
						fields: [{
							handle: "width",
							type: "text",
							component: "blocks-value",
							label: D("Width"),
							placeholder: "0",
							min: 0,
							prefixIcon: "selection"
						}, {
							handle: "style",
							type: "select",
							size: "sm",
							label: D("Style"),
							options: wa(),
							placeholder: D("Solid")
						}]
					},
					c.width || c.style ? {
						handle: "outlineColor",
						type: "color",
						component: "blocks-color",
						label: D("Outline Color"),
						placeholder: D("Text Color"),
						markers: ["outline-color"],
						get: () => c.color,
						set: (t) => e.swap("outline-color", f("outline", t, "number"))
					} : null,
					c.width || c.style || e.value("outlineOffset") ? {
						handle: "outlineOffset",
						type: "text",
						component: "blocks-value",
						label: D("Offset"),
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
						label: D("Ring"),
						placeholder: "0",
						min: 0,
						prefixIcon: "circle",
						markers: [Ca],
						get: () => l.width,
						set: (t) => e.swap(Ca, f("ring", t, "px"))
					},
					l.width ? {
						handle: "ringColor",
						type: "color",
						component: "blocks-color",
						label: D("Ring Color"),
						placeholder: D("Text Color"),
						markers: ["--tw-ring-color"],
						get: () => l.color,
						set: (t) => e.swap("--tw-ring-color", f("ring", t, "number"))
					} : null
				]
			})
		})]
	});
}
// admin/src/builder/design/ClassBar.tsx
var Da = (e) => e.replace(/^!|!$/g, "");
function Oa(e, t) {
	let n = (e.declarations(Da(G(t).utility)) ?? []).filter((e) => !e.property.startsWith("--")), r = n.find((e) => /(^|-)color$|^fill$|^stroke$/.test(e.property) && !/^(inherit|currentcolor|transparent)$/i.test(e.value));
	return {
		text: n.slice(0, 2).map((t) => `${t.property}: ${e.resolve(t.value)}`).join("; "),
		color: r && ki(e.resolve(r.value)).light
	};
}
function ka({ engine: e, site: t, exclude: n, onAdd: r, trigger: i, disabled: a }) {
	let [o, s] = N(!1), [c, l] = N(""), [u, d] = N(0), f = ve(() => new Set(n ?? []), [n]), p = /\s/.test(c.trim()), m = ve(() => e && o && !p ? Ei(e, t, c, f) : [], [
		e,
		o,
		p,
		t,
		c,
		f
	]), h = (t) => {
		let n = t.filter((t) => xi(t) && !Si(e, t));
		n.length && (r(n), l(""), d(0));
	};
	return /* @__PURE__ */ H(we, {
		open: o,
		onOpenChange: (e) => {
			s(e), l(""), d(0);
		},
		align: "start",
		className: "flex w-72 flex-col overflow-hidden !p-0",
		trigger: i ?? /* @__PURE__ */ V(P, {
			variant: "ghost",
			size: "xs",
			icon: "plus",
			disabled: a || !e,
			className: "!px-1.5 !font-normal !text-muted hover:!text-ink",
			children: D("Add Class")
		}),
		children: [/* @__PURE__ */ H("div", {
			className: "flex h-9 shrink-0 items-center gap-2 border-b border-border px-3",
			children: [/* @__PURE__ */ V(F, {
				name: "search",
				size: 14,
				className: "shrink-0 text-faint"
			}), /* @__PURE__ */ V("input", {
				autoFocus: !0,
				value: c,
				onChange: (e) => {
					l(e.target.value), d(0);
				},
				onKeyDown: (e) => {
					(e.key === "ArrowDown" || e.key === "ArrowUp") && (e.preventDefault(), d((t) => Math.max(0, Math.min(m.length - 1, t + (e.key === "ArrowDown" ? 1 : -1))))), e.key === "Enter" && (e.preventDefault(), h(p ? Je(c) : [m[u] ?? c.trim()].filter(Boolean)));
				},
				spellCheck: !1,
				autoComplete: "off",
				placeholder: D("Search Classes"),
				"aria-label": D("Search Classes"),
				className: "h-full min-w-0 flex-1 bg-transparent font-mono text-sm text-text outline-none"
			})]
		}), /* @__PURE__ */ H("div", {
			role: "listbox",
			"aria-label": D("Add Class"),
			className: "max-h-72 overflow-y-auto overscroll-contain p-1",
			children: [
				m.length === 0 && !p && /* @__PURE__ */ V("p", {
					className: "m-0 px-2 py-3 text-sm text-muted",
					children: c.trim() ? D("No matches") : D("Type a class name")
				}),
				p && /* @__PURE__ */ V("p", {
					className: "m-0 px-2 py-3 text-sm text-muted",
					children: D("Press Enter to add these classes")
				}),
				e && m.map((n, r) => {
					let i = Oa(e, n);
					return /* @__PURE__ */ H(P, {
						variant: "ghost",
						role: "option",
						"aria-selected": r === u,
						tabIndex: -1,
						onMouseEnter: () => d(r),
						onClick: () => h([n]),
						"data-active": r === u || void 0,
						className: "!h-auto min-h-7 w-full !justify-start !gap-2 !rounded-xs !px-2 !py-1 text-left !font-normal",
						children: [
							i.color && /* @__PURE__ */ V(Qr, {
								color: i.color,
								className: "!size-3.5"
							}),
							/* @__PURE__ */ V("span", {
								className: "shrink-0 font-mono text-xs text-ink",
								children: n
							}),
							/* @__PURE__ */ V("span", {
								className: "min-w-0 flex-1 truncate text-right text-2xs text-faint",
								children: t.includes(n) ? D("Site Class") : i.text
							})
						]
					}, n);
				})
			]
		})]
	});
}
var Aa = "cms.blocks.classes.open", ja = () => {
	try {
		return localStorage.getItem(Aa) === "1";
	} catch {
		return !1;
	}
};
function Ma({ s: e, disabled: t }) {
	let [n, r] = N(null), i = n ?? e.classes.join(" "), a = "col-start-1 row-start-1 m-0 min-h-14 w-full whitespace-pre-wrap break-words rounded-sm px-2 py-1.5 font-mono text-xs leading-5";
	return /* @__PURE__ */ H("div", {
		className: "grid",
		children: [/* @__PURE__ */ V("textarea", {
			value: i,
			disabled: t || !e.engine,
			spellCheck: !1,
			autoCapitalize: "off",
			autoCorrect: "off",
			"aria-label": D("Classes"),
			onChange: (t) => {
				r(t.target.value), e.apply(Je(t.target.value), "classes");
			},
			onBlur: () => r(null),
			className: B(a, "cms-input resize-none overflow-hidden text-text")
		}), /* @__PURE__ */ H("div", {
			"aria-hidden": !0,
			className: B(a, "pointer-events-none border border-transparent text-transparent"),
			children: [i.split(/(\s+)/).map((t, n) => /^\s*$/.test(t) ? t : /* @__PURE__ */ V("span", {
				className: Si(e.engine, t) ? "underline decoration-danger decoration-wavy underline-offset-2" : void 0,
				children: t
			}, n)), "​"]
		})]
	});
}
function Na({ s: e, site: t, source: n, breakpoints: r = [], disabled: i }) {
	let a = e.engine, [o, s] = N(ja), c = (e) => {
		s(e);
		try {
			localStorage.setItem(Aa, e ? "1" : "0");
		} catch {}
	}, l = bi(a, e.classes, t), u = E("settings.manage") && !!n && !!a && !i, d = (e) => G(e).variants.some((e) => r.includes(e) || /^(max|min)-/.test(e)), f = l.utilities.filter((e) => !d(e)), p = (n) => {
		if (!a) return;
		let r = e.classes;
		for (let i of n) {
			let n = yi(i, e.variants), { variants: o, utility: s } = G(n), c = t.includes(Da(s)) ? null : a.group(s);
			r = c ? a.put(r, o, c, s) : [...r.filter((e) => e !== n), n];
		}
		e.apply(a.sort(r), "classes");
	}, m = async () => {
		if (!a || !n) return;
		let r = await Pe({
			title: D("Create Class from Styles"),
			fields: [{
				handle: "name",
				type: "text",
				label: D("Name"),
				placeholder: "card",
				mono: !0,
				required: !0
			}],
			confirm: D("Create Class")
		}), i = String(r?.name ?? "").trim().toLowerCase().replace(/[\s_]+/g, "-");
		if (i) {
			if (!/^[a-z][a-z0-9-]*$/.test(i)) return void Ie.error(D("A class name is lowercase letters, numbers and hyphens, and starts with a letter."));
			if (t.includes(i) || a.valid(i)) return void Ie.error(D("There is already a class “{name}”.", { name: i }));
			try {
				await ce("styling/update", { css: new ot(n.css).setUtility(i, a.sort(f)).css }), re("styling/"), e.apply([
					...l.site,
					i,
					...l.utilities.filter(d)
				], "classes"), Ie.success(D("Class “{name}” created", { name: i }));
			} catch (e) {
				Ie.error(e);
			}
		}
	}, h = (t) => {
		if (!a || !n) return;
		let { variants: r, utility: i } = G(t), o = (new ot(n.css).utilities().find((e) => e.name === Da(i))?.classes ?? []).map((e) => qe(r, e));
		e.apply(a.sort([.../* @__PURE__ */ new Set([...e.classes.filter((e) => e !== t), ...o])]), "classes");
	};
	return /* @__PURE__ */ H("div", {
		className: "space-y-1 border-b border-border px-4 py-3",
		"data-class-bar": !0,
		children: [
			/* @__PURE__ */ H("div", {
				className: "flex items-start gap-1",
				children: [/* @__PURE__ */ H("div", {
					className: "flex min-w-0 flex-1 flex-wrap items-center gap-1",
					children: [l.site.map((r) => {
						let o = t.includes(Da(G(r).utility));
						return /* @__PURE__ */ V(L, {
							align: "start",
							trigger: /* @__PURE__ */ H(P, {
								variant: "ghost",
								size: "xs",
								disabled: i,
								className: B("max-w-full !gap-1 !rounded-sm !bg-active !px-1.5 font-mono !font-normal !text-ink", Si(a, r) && "underline decoration-danger decoration-wavy underline-offset-2"),
								children: [/* @__PURE__ */ V("span", {
									className: "truncate",
									children: r
								}), /* @__PURE__ */ V(F, {
									name: "chevron-down",
									size: 10,
									className: "shrink-0 text-faint"
								})]
							}),
							items: [
								o && u && {
									label: D("Edit Class"),
									icon: "edit",
									onSelect: () => ie(`/styling?class=${encodeURIComponent(Da(G(r).utility))}`)
								},
								o && !!n && {
									label: D("Detach"),
									icon: "unlink",
									onSelect: () => h(r)
								},
								{
									label: D("Remove Class"),
									icon: "trash",
									danger: !0,
									onSelect: () => e.apply(e.classes.filter((e) => e !== r), "classes")
								}
							]
						}, r);
					}), /* @__PURE__ */ V(ka, {
						engine: a,
						site: t,
						exclude: e.classes,
						onAdd: p,
						disabled: i
					})]
				}), /* @__PURE__ */ V(L, {
					align: "end",
					trigger: /* @__PURE__ */ V(I, {
						icon: "more",
						size: "sm",
						label: D("Class Actions")
					}),
					items: [u && {
						label: D("Create Class from Styles…"),
						icon: "symbol",
						disabled: f.length === 0,
						onSelect: () => void m()
					}, {
						label: D("Copy Classes"),
						icon: "copy",
						disabled: e.classes.length === 0,
						onSelect: () => void Ae(e.classes.join(" "), { copied: D("Classes copied") })
					}]
				})]
			}),
			/* @__PURE__ */ H(P, {
				variant: "ghost",
				size: "xs",
				"aria-expanded": o,
				onClick: () => c(!o),
				className: "-ml-1.5 !gap-1 !px-1.5 !font-normal !text-muted hover:!text-ink",
				children: [
					/* @__PURE__ */ V(F, {
						name: "chevron-down",
						size: 10,
						className: B("shrink-0 transition-[rotate] duration-fast", !o && "-rotate-90")
					}),
					D("Classes"),
					e.classes.length > 0 && /* @__PURE__ */ V("span", {
						className: "tabular-nums text-faint",
						children: e.classes.length
					})
				]
			}),
			o && /* @__PURE__ */ V(Ma, {
				s: e,
				disabled: i
			})
		]
	});
}
// admin/src/builder/fields/filters.tsx
var Pa = [
	{
		name: "blur",
		label: () => D("Blur"),
		unit: "px",
		initial: "8px",
		step: 1,
		min: 0,
		icon: "shadow"
	},
	{
		name: "brightness",
		label: () => D("Brightness"),
		unit: "%",
		initial: "100%",
		step: 5,
		min: 0,
		icon: "sun"
	},
	{
		name: "contrast",
		label: () => D("Contrast"),
		unit: "%",
		initial: "100%",
		step: 5,
		min: 0,
		icon: "opacity"
	},
	{
		name: "saturate",
		label: () => D("Saturation"),
		unit: "%",
		initial: "100%",
		step: 5,
		min: 0,
		icon: "drop-half"
	},
	{
		name: "grayscale",
		label: () => D("Grayscale"),
		unit: "%",
		initial: "100%",
		step: 5,
		min: 0,
		max: 100,
		icon: "opacity"
	},
	{
		name: "hue-rotate",
		label: () => D("Hue"),
		unit: "deg",
		initial: "90deg",
		step: 1,
		icon: "refresh"
	},
	{
		name: "invert",
		label: () => D("Invert"),
		unit: "%",
		initial: "100%",
		step: 5,
		min: 0,
		max: 100,
		icon: "opacity"
	},
	{
		name: "sepia",
		label: () => D("Sepia"),
		unit: "%",
		initial: "100%",
		step: 5,
		min: 0,
		max: 100,
		icon: "theme"
	}
];
function Fa(e) {
	return !e || e === "none" ? [] : pa(e).map((e) => {
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
var Ia = (e) => e.length ? e.map((e) => Pa.some((t) => t.name === e.name) || e.value ? `${e.name}(${e.value})` : e.name).join(" ") : null;
function La({ field: e, value: t, onChange: n, context: r, disabled: i }) {
	let a = Fa(t), o = Pa.filter((e) => !a.some((t) => t.name === e.name)), s = (e) => n(Ia(e));
	return /* @__PURE__ */ H("div", {
		className: "min-w-0 flex-1",
		children: [/* @__PURE__ */ H("div", {
			className: "flex h-7 items-center gap-2",
			children: [
				/* @__PURE__ */ V(Jr, {
					field: e,
					className: a.length ? "!w-auto" : void 0
				}),
				/* @__PURE__ */ V("span", {
					className: "min-w-0 flex-1 truncate text-xs text-faint",
					children: a.length ? "" : D("None")
				}),
				o.length > 0 && /* @__PURE__ */ V(L, {
					align: "end",
					trigger: /* @__PURE__ */ V(z, {
						compact: !0,
						disabled: i,
						className: "grid size-6 shrink-0 place-items-center rounded-sm text-muted hover:bg-hover hover:text-ink",
						"aria-label": D("Add a Filter"),
						title: D("Add a Filter"),
						children: /* @__PURE__ */ V(F, {
							name: "plus",
							size: 14
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
		}), a.length > 0 && /* @__PURE__ */ V("div", {
			className: "mt-1 space-y-1",
			children: a.map((t, n) => {
				let o = Pa.find((e) => e.name === t.name), c = o ? {
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
				return /* @__PURE__ */ H("div", {
					className: "flex h-7 items-center gap-2",
					children: [
						/* @__PURE__ */ H("span", {
							className: "flex w-[88px] shrink-0 items-center gap-1.5 truncate pl-2 text-xs text-muted",
							children: [/* @__PURE__ */ V(F, {
								name: o?.icon ?? "faders",
								size: 13,
								className: "shrink-0 text-faint"
							}), o?.label() ?? t.name]
						}),
						/* @__PURE__ */ V(Bi, {
							field: c,
							value: o?.unit === "%" && /^[\d.]+$/.test(t.value) ? `${Math.round(parseFloat(t.value) * 1e3) / 10}%` : t.value || null,
							onChange: (e) => s(a.map((t, r) => r === n ? {
								...t,
								value: String(e ?? o?.initial ?? "")
							} : t)),
							disabled: i,
							context: r
						}),
						/* @__PURE__ */ V(ti, {
							label: D("Remove Filter"),
							onClick: () => s(a.filter((e, t) => t !== n))
						})
					]
				}, t.name + n);
			})
		})]
	});
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
}), Ra = (e, t = {}) => ({
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
}), za = (e, t = {}) => ({
	label: e,
	type: "text",
	component: "blocks-value",
	unit: "",
	placeholder: "0",
	...t
}), Ba = (e) => ({
	label: e,
	type: "color",
	component: "blocks-color",
	placeholder: D("None")
}), Va = (e, t = "") => ({
	label: e,
	type: "text",
	size: "sm",
	commit: "blur",
	mono: !0,
	placeholder: t
}), Ha = [
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
function Ua() {
	let e = (e, t) => Object.fromEntries(Object.entries(t).map(([t, n]) => [t, {
		group: e,
		field: n
	}]));
	return {
		...e("layout", {
			alignContent: $(D("Align Content"), [
				"normal",
				"start",
				"center",
				"end",
				"space-between",
				"space-around",
				"space-evenly",
				"stretch"
			]),
			placeItems: Va(D("Place Items"), "center"),
			placeContent: Va(D("Place Content"), "center"),
			gridTemplateAreas: Va(D("Grid Areas"), "'a b' 'c c'"),
			gridAutoColumns: Va(D("Auto Columns"), "auto"),
			gridAutoRows: Va(D("Auto Rows"), "auto"),
			columns: za(D("Columns"), {
				placeholder: D("Auto"),
				min: 1
			}),
			columnRule: Va(D("Column Rule"), "1px solid"),
			boxSizing: $(D("Box Sizing"), ["border-box", "content-box"]),
			float: $(D("Float||CSS property"), [
				"none",
				"left",
				"right"
			]),
			clear: $(D("Clear||CSS property"), [
				"none",
				"left",
				"right",
				"both"
			]),
			containerType: $(D("Container Type"), [
				"normal",
				"inline-size",
				"size"
			])
		}),
		...e("item", {
			justifySelf: $(D("Justify Self"), [
				"auto",
				"start",
				"center",
				"end",
				"stretch"
			]),
			placeSelf: Va(D("Place Self"), "center"),
			gridArea: Va(D("Grid Area"), "a"),
			flexGrow: za(D("Flex Grow"), { min: 0 }),
			flexShrink: za(D("Flex Shrink"), {
				placeholder: "1",
				min: 0
			}),
			flexBasis: Ra(D("Flex Basis"), { placeholder: D("Auto") })
		}),
		...e("position", { inset: Ra(D("Inset"), { placeholder: D("Auto") }) }),
		...e("size", {
			overflowX: $(D("Overflow X"), [
				"visible",
				"hidden",
				"clip",
				"scroll",
				"auto"
			]),
			overflowY: $(D("Overflow Y"), [
				"visible",
				"hidden",
				"clip",
				"scroll",
				"auto"
			]),
			overscrollBehavior: $(D("Overscroll"), [
				"auto",
				"contain",
				"none"
			]),
			scrollSnapType: $(D("Snap Type"), [
				"none",
				"x mandatory",
				"x proximity",
				"y mandatory",
				"y proximity",
				"both mandatory"
			]),
			scrollSnapAlign: $(D("Snap Align"), [
				"none",
				"start",
				"center",
				"end"
			]),
			scrollMarginTop: Ra(D("Scroll Margin")),
			scrollPadding: Ra(D("Scroll Padding")),
			scrollbarWidth: $(D("Scrollbar"), [
				"auto",
				"thin",
				"none"
			])
		}),
		...e("typography", {
			textDecorationColor: Ba(D("Decoration Color")),
			textDecorationThickness: Ra(D("Line Thickness"), { placeholder: D("Auto") }),
			textUnderlineOffset: Ra(D("Underline Offset"), {
				unit: "em",
				units: ["em", "px"],
				step: .05,
				placeholder: D("Auto")
			}),
			whiteSpace: $(D("White Space"), [
				"normal",
				"nowrap",
				"pre",
				"pre-wrap",
				"pre-line",
				"break-spaces"
			]),
			wordBreak: $(D("Word Break"), [
				"normal",
				"break-all",
				"keep-all",
				"break-word"
			]),
			overflowWrap: $(D("Overflow Wrap"), [
				"normal",
				"anywhere",
				"break-word"
			]),
			hyphens: $(D("Hyphens"), [
				"manual",
				"auto",
				"none"
			]),
			textIndent: Ra(D("Indent"), {
				unit: "em",
				units: [
					"em",
					"px",
					"rem"
				]
			}),
			textOverflow: $(D("Text Overflow"), ["clip", "ellipsis"]),
			fontVariantNumeric: $(D("Numbers"), [
				"normal",
				"tabular-nums",
				"proportional-nums",
				"lining-nums",
				"oldstyle-nums",
				"slashed-zero"
			]),
			fontFeatureSettings: Va(D("Font Features"), "'ss01'"),
			fontVariationSettings: Va(D("Font Variations"), "'wght' 500"),
			listStyleType: $(D("List Style"), [
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
			verticalAlign: $(D("Vertical Align"), [
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
			background: Va(D("Background"), "none"),
			backgroundBlendMode: $(D("Blend Mode"), Ha)
		}),
		...e("effects", {
			userSelect: $(D("User Select"), [
				"auto",
				"none",
				"text",
				"all"
			]),
			visibility: $(D("Visibility"), [
				"visible",
				"hidden",
				"collapse"
			]),
			maskImage: Va(D("Mask Image"), "linear-gradient(black, transparent)"),
			accentColor: Ba(D("Accent Color")),
			fill: Ba(D("Fill")),
			stroke: Ba(D("Stroke")),
			strokeWidth: Ra(D("Stroke Width")),
			content: Va(D("Content"), "''")
		}),
		...e("transform", {
			perspectiveOrigin: Va(D("Vanishing Point"), "center"),
			transformStyle: $(D("Transform Style"), ["flat", "preserve-3d"]),
			backfaceVisibility: $(D("Backface"), ["visible", "hidden"])
		}),
		...e("transition", { willChange: Va(D("Will Change"), "auto") })
	};
}
function Wa(e, t = Ua()) {
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
var Ga = (e) => /^--[\w-]+$/.test(e) || /^-?[a-z]+(-[a-z]+)*$/.test(e) && typeof CSS < "u" && CSS.supports(e, "inherit");
function Ka({ properties: e, labels: t = {}, onPick: n, label: r = D("Add a Property"), custom: i, children: a }) {
	let [o, s] = N(!1), [c, l] = N(""), [u, d] = N(0), f = Ua(), p = c.trim().toLowerCase(), m = e.map((e) => ({
		property: e,
		label: t[e] ?? String(Wa(e, f).label)
	})).filter((e) => !p || e.label.toLowerCase().includes(p) || e.property.toLowerCase().includes(p.replace(/[\s-]/g, ""))), h = p.replace(/\s+/g, "-"), g = i && Ga(h) && !m.some((e) => e.property.toLowerCase() === h.replace(/-/g, "")) ? [...m, {
		property: h,
		label: h
	}] : m, _ = (e) => {
		e && (s(!1), n(e));
	};
	return e.length === 0 && !i ? null : /* @__PURE__ */ H(we, {
		open: o,
		onOpenChange: (e) => {
			s(e), l(""), d(0);
		},
		align: "end",
		className: "flex w-60 flex-col overflow-hidden !p-0",
		trigger: a ?? /* @__PURE__ */ V(I, {
			icon: "plus",
			size: "xs",
			label: r
		}),
		children: [/* @__PURE__ */ H("div", {
			className: "flex h-9 shrink-0 items-center gap-2 border-b border-border px-3",
			children: [/* @__PURE__ */ V(F, {
				name: "search",
				size: 14,
				className: "shrink-0 text-faint"
			}), /* @__PURE__ */ V("input", {
				autoFocus: !0,
				value: c,
				onChange: (e) => {
					l(e.target.value), d(0);
				},
				onKeyDown: (e) => {
					(e.key === "ArrowDown" || e.key === "ArrowUp") && (e.preventDefault(), d((t) => Math.max(0, Math.min(g.length - 1, t + (e.key === "ArrowDown" ? 1 : -1))))), e.key === "Enter" && (e.preventDefault(), _(g[u]?.property));
				},
				placeholder: D("Search"),
				"aria-label": D("Search"),
				className: "h-full min-w-0 flex-1 bg-transparent text-sm text-text outline-none"
			})]
		}), /* @__PURE__ */ H("div", {
			role: "listbox",
			"aria-label": r,
			className: "max-h-64 overflow-y-auto overscroll-contain p-1",
			children: [g.length === 0 && /* @__PURE__ */ V("p", {
				className: "m-0 px-2 py-3 text-sm text-muted",
				children: D("No matches")
			}), g.map((e, t) => /* @__PURE__ */ V(P, {
				variant: "ghost",
				role: "option",
				"aria-selected": t === u,
				tabIndex: -1,
				onMouseEnter: () => d(t),
				onClick: () => _(e.property),
				"data-active": t === u || void 0,
				className: "w-full !justify-start !rounded-xs !px-2 text-left !font-normal",
				children: e.label
			}, e.property))]
		})]
	});
}
var qa = (e, t = Ua()) => [...e].sort((e, n) => String(Wa(e, t).label).localeCompare(String(Wa(n, t).label)));
function Ja({ s: e, group: t, title: n, open: r, empty: i, children: a }) {
	let [o, s] = N(null), c = Ua(), l = Object.keys(c).filter((e) => c[e].group === t), u = l.filter((t) => e.value(t) !== void 0 || t === o);
	return /* @__PURE__ */ H(Gr, {
		title: n,
		open: r,
		empty: i && u.length === 0,
		fields: !0,
		actions: /* @__PURE__ */ V(Ka, {
			properties: qa(l.filter((e) => !u.includes(e)), c),
			onPick: s
		}),
		children: [a, u.length > 0 && /* @__PURE__ */ V(Q, {
			s: e,
			fields: u.map((t) => ({
				...Wa(t, c),
				set: (n) => {
					t === o && s(null), e.set(t, n);
				}
			}))
		})]
	});
}
var Ya = (e) => e.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`);
function Xa({ s: e }) {
	let [t, n] = N(null), r = Ua(), i = /* @__PURE__ */ new Set([
		...Object.keys(r).map(Ya),
		"clip-path",
		"-webkit-text-stroke"
	]), a = [...new Set(e.classes.flatMap((e) => G(e).utility.match(/^!?\[([\w-]+):/)?.[1] ?? []))].filter((t) => !i.has(t) && e.value(t) !== void 0), o = t && !a.includes(t) ? [...a, t] : a;
	return /* @__PURE__ */ V(Gr, {
		title: D("Other Properties"),
		open: o.length > 0,
		empty: o.length === 0,
		actions: /* @__PURE__ */ V(Ka, {
			properties: [],
			custom: !0,
			onPick: n
		}),
		children: /* @__PURE__ */ V(Q, {
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
// admin/src/builder/design/Effects.tsx
var Za = [
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
], Qa = [
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
], $a = {
	blur: "px",
	brightness: "percent",
	contrast: "percent",
	saturate: "percent",
	grayscale: "percent",
	"hue-rotate": "deg",
	invert: "percent",
	sepia: "percent"
}, eo = (e) => e.trim().replace(/\s+/g, " ");
function to(e, t, n) {
	for (let [r, i] of e.ds.theme.entries()) if (r.startsWith("--blur-") && i.value === n) return e.make(t, r.slice(7));
	return e.make(t, n);
}
function no(e, t) {
	let n = (e) => `--tw-${t}${e}`, r = Object.keys($a), i = r.flatMap((t) => {
		let r = si(e.value(n(t)));
		return r === void 0 ? [] : [`${t}(${e.engine ? e.engine.resolve(r) : r})`];
	}).join(" ");
	return {
		value: i || void 0,
		set: (a) => {
			let o = e.engine;
			if (!o) return;
			let s = new Map(Fa(i).map((e) => [e.name, e.value])), c = new Map(Fa(a).map((e) => [e.name, e.value]));
			e.edit((e) => {
				for (let i of r) {
					if (s.get(i) === c.get(i)) continue;
					let r = c.get(i), a = `${t}${i}`;
					e.swap(n(i), r === void 0 ? null : i === "blur" ? to(o, a, r) : ui(o, a, r, $a[i]));
				}
			}, `${t}filter`);
		},
		markers: r.map(n)
	};
}
function ro({ s: e }) {
	let t = X(), n = no(e, ""), r = no(e, "backdrop-"), i = e.value("--tw-shadow"), a = i && (t.of("shadow").find((e) => eo(e.value) === eo(i))?.ref ?? i), o = e.value("opacity"), s = [
		"opacity",
		"--tw-shadow",
		"mixBlendMode",
		"cursor",
		"pointerEvents",
		"clipPath"
	].some((t) => e.value(t)) || n.value || r.value;
	return /* @__PURE__ */ H(Ja, {
		s: e,
		group: "effects",
		title: D("Effects"),
		empty: !s,
		children: [
			/* @__PURE__ */ V(Q, {
				s: e,
				fields: [{
					handle: "opacity",
					type: "text",
					component: "blocks-value",
					label: D("Opacity"),
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
					set: (t) => e.swap("opacity", t == null || t === "" || !e.engine ? null : ui(e.engine, "opacity", `${Math.round(Number(t) * 100)}%`, "percent"))
				}]
			}),
			/* @__PURE__ */ V(Q, {
				s: e,
				bare: !0,
				fields: [{
					handle: "boxShadow",
					type: "text",
					component: "blocks-shadows",
					label: D("Shadows"),
					group: "shadow",
					markers: ["--tw-shadow"],
					get: () => a,
					set: (t) => e.swap("--tw-shadow", t && e.engine ? ui(e.engine, "shadow", t, "number") : null)
				}]
			}),
			/* @__PURE__ */ V(Q, {
				s: e,
				bare: !0,
				fields: [{
					handle: "filter",
					type: "text",
					component: "blocks-filters",
					label: D("Filters"),
					markers: n.markers,
					get: () => n.value,
					set: n.set
				}]
			}),
			/* @__PURE__ */ V(Q, {
				s: e,
				bare: !0,
				fields: [{
					handle: "backdropFilter",
					type: "text",
					component: "blocks-filters",
					label: D("Backdrop"),
					markers: r.markers,
					get: () => r.value,
					set: r.set
				}]
			}),
			/* @__PURE__ */ V(Q, {
				s: e,
				fields: [
					{
						handle: "clipPath",
						type: "text",
						component: "blocks-clip",
						label: D("Clip Path"),
						className: "items-start py-0.5 [&>label]:leading-6"
					},
					{
						handle: "mixBlendMode",
						type: "select",
						size: "sm",
						label: D("Blending"),
						placeholder: D("Normal"),
						options: Za
					},
					{
						handle: "cursor",
						type: "select",
						size: "sm",
						label: D("Cursor"),
						placeholder: D("Auto"),
						options: Qa
					},
					{
						handle: "pointerEvents",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: D("Clicks"),
						placeholder: "auto",
						options: [{
							value: "auto",
							label: D("On")
						}, {
							value: "none",
							label: D("Pass Through")
						}]
					}
				]
			})
		]
	});
}
// admin/src/builder/color.tsx
function io(e) {
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
	} : null;
}
function ao({ r: e, g: t, b: n, a: r }) {
	let i = (e) => Math.round(e).toString(16).padStart(2, "0");
	return r >= 1 ? `#${i(e)}${i(t)}${i(n)}` : `rgb(${Math.round(e)} ${Math.round(t)} ${Math.round(n)} / ${Math.round(r * 100)}%)`;
}
function oo({ r: e, g: t, b: n }) {
	e /= 255, t /= 255, n /= 255;
	let r = Math.max(e, t, n), i = r - Math.min(e, t, n);
	return {
		h: ((i === 0 ? 0 : r === e ? (t - n) / i % 6 : r === t ? (n - e) / i + 2 : (e - t) / i + 4) * 60 + 360) % 360,
		s: r === 0 ? 0 : i / r,
		v: r
	};
}
function so(e, t, n, r) {
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
function co(e, t) {
	return t >= 100 ? `var(${e})` : `color-mix(in oklab, var(${e}) ${Math.round(t)}%, transparent)`;
}
function lo(e) {
	return typeof CSS < "u" && CSS.supports("color", e);
}
function uo() {
	let e = X();
	return (t) => t ? e.resolve(t) : "transparent";
}
function fo({ field: e, value: t, onChange: n, disabled: r }) {
	let [i, a] = N(!1), o = uo(), s = Mi(), c = t ?? void 0, l = s(c);
	return /* @__PURE__ */ V(Vi, { children: /* @__PURE__ */ V(we, {
		open: i,
		onOpenChange: a,
		align: "end",
		className: "w-64 !p-0",
		trigger: /* @__PURE__ */ H(z, {
			compact: !0,
			id: Me(e),
			disabled: r,
			className: B(Zr, "flex items-center gap-1.5 pl-1 text-left"),
			children: [/* @__PURE__ */ V(Qr, {
				color: c === void 0 && typeof e.swatch == "string" ? e.swatch : o(c),
				className: "!size-4"
			}), l ? /* @__PURE__ */ V(Pi, {
				token: l.token,
				alpha: l.alpha
			}) : /* @__PURE__ */ V("span", {
				className: B("truncate font-mono", !c && "font-sans text-faint"),
				children: c ?? e.placeholder ?? D("None")
			})]
		}),
		children: /* @__PURE__ */ V(mo, {
			label: e.label || D("Color"),
			value: c,
			onChange: n
		})
	}) });
}
function po({ token: e, current: t, onPick: n }) {
	let { light: r, dark: i } = ki(e.value);
	return /* @__PURE__ */ H(z, {
		compact: !0,
		role: "option",
		"aria-selected": t,
		title: `${e.variable} · ${e.value}`,
		onClick: n,
		className: B("flex h-7 w-full items-center gap-2 rounded-xs px-1.5 text-left text-xs hover:bg-hover", t && "bg-active"),
		children: [
			/* @__PURE__ */ V(Qr, {
				color: r,
				dark: i,
				className: "!size-4"
			}),
			/* @__PURE__ */ V("span", {
				className: "min-w-0 flex-1 truncate text-text",
				children: e.name
			}),
			t ? /* @__PURE__ */ V(F, {
				name: "check",
				size: 12,
				className: "shrink-0 text-focus"
			}) : /* @__PURE__ */ V("span", { className: "w-3 shrink-0" })
		]
	});
}
function mo({ label: e, value: t, onChange: n }) {
	let r = X(), i = r.of("color"), a = ve(() => Oi(i), [i]), o = r.find(t), s = o?.token.variable ?? null, c = o ? o.alpha === void 0 ? 1 : Number(o.alpha) / 100 : 1, l = io(o ? ki(r.resolve(o.token.ref)).light : t) ?? {
		r: 0,
		g: 0,
		b: 0,
		a: 1
	}, [u, d] = N(() => ({
		...oo(l),
		a: o ? c : l.a
	})), [f, p] = N(t ?? ""), m = Ji(f, (e) => !e.trim() || lo(e.trim())), [h, g] = N(() => i.length > 0 && (!t || o) ? "theme" : "custom"), [_, v] = N(() => !!o && a.families.some((e) => e.shades.includes(o.token))), y = M(null);
	j(() => p(t ?? ""), [t]);
	let b = (e, t, r, i) => {
		d({
			h: e,
			s: t,
			v: r,
			a: i
		}), n(ao(so(e, t, r, i)));
	}, x = (e, t) => {
		let r = e.currentTarget;
		r.setPointerCapture(e.pointerId);
		let i = (e) => {
			let i = r.getBoundingClientRect(), a = Math.max(0, Math.min(1, (e.clientX - i.left) / i.width)), o = Math.max(0, Math.min(1, (e.clientY - i.top) / i.height));
			t === "area" ? b(u.h, a, 1 - o, u.a) : t === "hue" ? b(a * 360, u.s, u.v, u.a) : s ? n(co(s, a < .995 ? Math.round(a * 100) : 100)) : b(u.h, u.s, u.v, Math.round(a * 100) / 100);
		};
		i(e);
		let a = (e) => i(e), o = () => {
			r.removeEventListener("pointermove", a), r.removeEventListener("pointerup", o);
		};
		r.addEventListener("pointermove", a), r.addEventListener("pointerup", o);
	}, ee = s ? c : u.a, te = s ? ki(r.resolve(`var(${s})`)).light : ao({ ...so(u.h, u.s, u.v, 1) }), S = /* @__PURE__ */ H("div", {
		onPointerDown: (e) => x(e, "alpha"),
		className: "relative h-2.5 cursor-ew-resize rounded-full cms-checkerboard",
		children: [/* @__PURE__ */ V("span", {
			className: "absolute inset-0 rounded-full",
			style: { background: `linear-gradient(to right, transparent, ${te})` }
		}), /* @__PURE__ */ V("span", {
			className: "pointer-events-none absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white ring-1 ring-black/30",
			style: { left: `${ee * 100}%` }
		})]
	}), C = /* @__PURE__ */ V(z, {
		compact: !0,
		onClick: () => n(null),
		className: "h-7 shrink-0 rounded-sm px-2 text-xs text-muted hover:bg-hover hover:text-ink",
		children: D("Clear")
	});
	return /* @__PURE__ */ H("div", { children: [/* @__PURE__ */ H("div", {
		className: "flex h-9 items-center gap-2 border-b border-border pl-2.5 pr-1.5",
		children: [/* @__PURE__ */ V("span", {
			className: "min-w-0 flex-1 truncate text-xs font-medium text-text",
			children: e
		}), i.length > 0 && /* @__PURE__ */ V(Ee, {
			size: "xs",
			value: h,
			onChange: g,
			options: [{
				value: "theme",
				label: D("Theme")
			}, {
				value: "custom",
				label: D("Custom")
			}]
		})]
	}), h === "theme" ? /* @__PURE__ */ H("div", { children: [/* @__PURE__ */ H("div", {
		role: "listbox",
		"aria-label": D("Theme Colors"),
		className: "max-h-72 overflow-y-auto p-1",
		children: [
			a.own.map((e) => /* @__PURE__ */ V(po, {
				token: e,
				current: s === e.variable,
				onPick: () => n(e.ref)
			}, e.variable)),
			a.families.length > 0 && /* @__PURE__ */ H(P, {
				variant: "ghost",
				size: "xs",
				"aria-expanded": _,
				onClick: () => v(!_),
				className: "mt-1 w-full !justify-start !gap-1 !px-1.5 !font-normal !text-muted hover:!text-ink",
				children: [/* @__PURE__ */ V(F, {
					name: "chevron-down",
					size: 10,
					className: B("shrink-0 transition-[rotate] duration-fast", !_ && "-rotate-90")
				}), D("Palette")]
			}),
			_ && a.families.map((e) => /* @__PURE__ */ H("div", {
				className: "flex h-6 items-center gap-2 px-1.5",
				children: [/* @__PURE__ */ V("span", {
					className: "w-14 shrink-0 truncate text-2xs text-muted",
					children: e.name
				}), /* @__PURE__ */ V("div", {
					className: "flex min-w-0 flex-1 gap-px",
					children: e.shades.map((e) => /* @__PURE__ */ V(z, {
						compact: !0,
						role: "option",
						"aria-selected": s === e.variable,
						"aria-label": e.name,
						title: e.name,
						onClick: () => n(e.ref),
						className: B("h-4 min-w-0 flex-1 first:rounded-l-xs last:rounded-r-xs", s === e.variable && "ring-2 ring-focus ring-offset-1 ring-offset-float"),
						style: { background: e.value }
					}, e.variable))
				})]
			}, e.name))
		]
	}), /* @__PURE__ */ H("div", {
		className: "flex items-center gap-2 border-t border-border px-2.5 py-2",
		children: [s ? /* @__PURE__ */ H(ze, { children: [
			/* @__PURE__ */ V("span", {
				className: "shrink-0 text-xs text-muted",
				children: D("Opacity")
			}),
			/* @__PURE__ */ V("div", {
				className: "min-w-0 flex-1",
				children: S
			}),
			/* @__PURE__ */ H("span", {
				className: "w-8 shrink-0 text-right text-2xs tabular-nums text-muted",
				children: [Math.round(ee * 100), "%"]
			})
		] }) : /* @__PURE__ */ V("span", { className: "flex-1" }), C]
	})] }) : /* @__PURE__ */ H("div", {
		className: "space-y-2 p-2.5",
		children: [
			/* @__PURE__ */ V("div", {
				ref: y,
				onPointerDown: (e) => x(e, "area"),
				className: "relative h-32 cursor-crosshair rounded-sm",
				style: { background: `linear-gradient(to top, black, transparent), linear-gradient(to right, white, hsl(${u.h} 100% 50%))` },
				children: /* @__PURE__ */ V("span", {
					className: "pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white ring-1 ring-black/30",
					style: {
						left: `${u.s * 100}%`,
						top: `${(1 - u.v) * 100}%`
					}
				})
			}),
			/* @__PURE__ */ V("div", {
				onPointerDown: (e) => x(e, "hue"),
				className: "relative h-2.5 cursor-ew-resize rounded-full",
				style: { background: "linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)" },
				children: /* @__PURE__ */ V("span", {
					className: "pointer-events-none absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white ring-1 ring-black/30",
					style: { left: `${u.h / 360 * 100}%` }
				})
			}),
			S,
			/* @__PURE__ */ H("div", {
				className: "flex gap-1.5",
				children: [/* @__PURE__ */ V("input", {
					value: f,
					spellCheck: !1,
					"aria-label": D("Color Value"),
					"aria-invalid": m.shown || void 0,
					onChange: (e) => p(e.target.value),
					onBlur: () => {
						let e = f.trim();
						if (e && !lo(e)) return p(t ?? "");
						e !== (t ?? "") && n(e || null);
					},
					onKeyDown: (e) => {
						e.key === "Escape" && p(t ?? ""), e.key === "Enter" && (f.trim() && !lo(f.trim()) ? m.show() : e.target.blur());
					},
					className: B(Zr, "font-mono"),
					placeholder: R
				}), C]
			})
		]
	})] });
}
// admin/src/builder/fields/style.tsx
function ho(e) {
	let t = e?.match(/^(linear|radial)-gradient\((.*)\)$/);
	if (!t) return null;
	let n = ma(t[2]), r = t[1] === "linear" ? "180deg" : "circle";
	n[0] && (/deg$|^to /.test(n[0]) || /^(circle|ellipse)/.test(n[0])) && (r = n.shift());
	let i = n.map((e) => {
		let t = pa(e);
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
function go(e) {
	return `${e.kind}-gradient(${[e.angle, ...e.stops.map((e) => `${e.color}${e.at ? ` ${e.at}` : ""}`)].join(", ")})`;
}
function _o({ value: e, onChange: t, context: n }) {
	let r = uo(), i = ho(e);
	if (!i) return null;
	let a = (e) => t(go(e));
	return /* @__PURE__ */ H("div", {
		className: "min-w-0 flex-1 space-y-1 rounded-md bg-active/60 p-1.5",
		children: [
			/* @__PURE__ */ V("div", {
				className: "h-6 rounded-sm ring-1 ring-inset ring-black/10",
				style: { background: r(go({
					...i,
					kind: "linear",
					angle: "90deg"
				})) }
			}),
			/* @__PURE__ */ V(Z, {
				bare: !0,
				context: n,
				fields: [{
					handle: "shape",
					type: "group",
					component: "blocks-group",
					label: D("Shape"),
					fields: [{
						handle: "kind",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: D("Kind"),
						required: !0,
						options: [{
							value: "linear",
							label: D("Linear")
						}, {
							value: "radial",
							label: D("Radial")
						}]
					}, {
						handle: "angle",
						type: "text",
						component: "blocks-value",
						label: D("Angle"),
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
			i.stops.map((e, t) => /* @__PURE__ */ H("div", {
				className: "flex items-center gap-1",
				children: [/* @__PURE__ */ V(Z, {
					bare: !0,
					className: "min-w-0 flex-1",
					context: n,
					fields: [{
						handle: "stop",
						type: "group",
						component: "blocks-group",
						label: D("Stop||gradient"),
						fields: [{
							handle: "color",
							type: "color",
							component: "blocks-color",
							label: D("Color")
						}, {
							handle: "at",
							type: "text",
							component: "blocks-value",
							label: D("Position"),
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
				}), i.stops.length > 2 && /* @__PURE__ */ V(ti, { onClick: () => a({
					...i,
					stops: i.stops.filter((e, n) => n !== t)
				}) })]
			}, t)),
			/* @__PURE__ */ H(z, {
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
					/* @__PURE__ */ V(F, {
						name: "plus",
						size: 14
					}),
					" ",
					D("Add Stop")
				]
			})
		]
	});
}
var vo = [
	"flex-start",
	"center",
	"flex-end"
], yo = () => [
	{
		value: "flex-start",
		label: D("Start")
	},
	{
		value: "center",
		label: D("Center")
	},
	{
		value: "flex-end",
		label: D("End")
	},
	{
		value: "space-between",
		label: D("Space Between")
	},
	{
		value: "space-around",
		label: D("Space Around")
	},
	{
		value: "space-evenly",
		label: D("Space Evenly")
	}
];
function bo({ field: e, value: t, onChange: n, context: r }) {
	let i = e.row === !0, a = t?.justifyContent ?? void 0, o = t?.alignItems ?? void 0;
	return /* @__PURE__ */ H(Vi, { children: [/* @__PURE__ */ V("div", {
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
			let r = vo[i ? t : e], s = vo[i ? e : t], c = (a ?? "flex-start") === r && (o ?? "stretch").replace("stretch", "flex-start") === s;
			return /* @__PURE__ */ V(z, {
				compact: !0,
				onClick: () => n({
					justifyContent: r,
					alignItems: s
				}),
				className: "grid place-items-center rounded-xs hover:bg-hover",
				title: `${r.replace("flex-", "")} · ${s.replace("flex-", "")}`,
				children: /* @__PURE__ */ V("span", { className: B("rounded-full", c ? "size-2 bg-ink" : "size-1 bg-faint") })
			}, `${t}${e}`);
		}))
	}), /* @__PURE__ */ V(Z, {
		bare: !0,
		className: "min-w-0 flex-1",
		context: r,
		fields: [{
			handle: "justifyContent",
			type: "select",
			size: "sm",
			label: D("Distribute"),
			options: yo(),
			placeholder: D("Distribute")
		}, {
			handle: "alignItems",
			type: "select",
			display: "segmented",
			block: !0,
			size: "sm",
			label: D("Align"),
			options: [
				{
					value: "flex-start",
					icon: i ? "align-top" : "justify-start",
					title: D("Start")
				},
				{
					value: "center",
					icon: i ? "align-middle" : "justify-center",
					title: D("Center")
				},
				{
					value: "flex-end",
					icon: i ? "align-bottom" : "justify-end",
					title: D("End")
				},
				{
					value: "stretch",
					icon: i ? "arrows-out-line-vertical" : "spacing",
					title: D("Stretch")
				},
				{
					value: "baseline",
					icon: "text",
					title: D("Baseline")
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
var xo = [
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
], So = {
	left: "0%",
	top: "0%",
	center: "50%",
	right: "100%",
	bottom: "100%"
};
function Co(e) {
	let t = (e ?? "center").trim().split(/\s+/), n = (e) => e === "top" || e === "bottom";
	t.length === 1 && t.push("center");
	let [r, i] = n(t[0]) || t[1] && (t[1] === "left" || t[1] === "right") ? [t[1], t[0]] : t;
	return `${So[r] ?? r} ${So[i] ?? i}`;
}
function wo({ field: e, value: t, onChange: n, context: r, disabled: i }) {
	let a = Co(t);
	return /* @__PURE__ */ H(Vi, { children: [/* @__PURE__ */ V("div", {
		className: "grid size-[60px] shrink-0 grid-cols-3 gap-px rounded-sm bg-bg p-1",
		role: "radiogroup",
		"aria-label": e.label,
		children: xo.flat().map((t) => {
			let r = a === Co(t);
			return /* @__PURE__ */ V(z, {
				compact: !0,
				role: "radio",
				"aria-checked": r,
				disabled: i,
				onClick: () => n(t === "center" && !e.required ? null : t),
				className: "grid place-items-center rounded-xs hover:bg-hover",
				title: t,
				children: /* @__PURE__ */ V("span", { className: B("rounded-full", r ? "size-2 bg-ink" : "size-1 bg-faint") })
			}, t);
		})
	}), /* @__PURE__ */ V(Bi, {
		field: {
			handle: `${e.handle}-value`,
			type: "text",
			component: "blocks-value",
			label: e.label,
			unit: "",
			placeholder: D("Center")
		},
		value: t ?? null,
		onChange: (e) => n(e || null),
		context: r,
		disabled: i
	})] });
}
// admin/src/builder/design/Fill.tsx
var To = [
	"backgroundSize",
	"backgroundPosition",
	"backgroundRepeat",
	"backgroundAttachment"
], Eo = (e) => e?.match(/^url\(["']?([^"')]*)["']?\)$/)?.[1];
function Do(e) {
	try {
		return encodeURI(decodeURI(e));
	} catch {
		return encodeURI(e);
	}
}
function Oo({ s: e }) {
	let t = X(), n = e.value("backgroundImage"), r = gi(e.value) ?? (ho(n) ? n : void 0), i = r ? "gradient" : n ? "image" : "none", a = Eo(n), [o, s] = N(null), c = e.value("backgroundColor") || n || r, l = () => e.edit((e) => {
		e.swap(mi, null), e.write(Object.fromEntries(To.map((e) => [e, null])));
	}, "fill"), u = (t) => {
		let n = ho(t);
		if (!e.engine || !n) return l();
		e.swap(mi, hi(e.engine, n), "gradient");
	}, d = (t) => {
		let n = t && e.engine ? e.engine.make("bg", `url(${Do(t)})`) : null;
		e.swap(mi, n ?? "bg-none", "image");
	}, f = async (e) => {
		if (!e) return s(null), d(null);
		try {
			let { items: t } = await ce("media/get-many", { ids: [e] });
			if (!t[0]?.url) return;
			s({
				id: e,
				url: t[0].url
			}), d(t[0].url);
		} catch (e) {
			Ie.error(e);
		}
	};
	return /* @__PURE__ */ H(Ja, {
		s: e,
		group: "fill",
		title: D("Fill"),
		empty: !c,
		children: [
			/* @__PURE__ */ V(Q, {
				s: e,
				fields: [{
					handle: "backgroundColor",
					type: "color",
					component: "blocks-color",
					label: D("Color")
				}, {
					handle: "kind",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: D("Image"),
					options: [
						{
							value: "none",
							label: D("None")
						},
						{
							value: "gradient",
							icon: "gradient",
							title: D("Gradient")
						},
						{
							value: "image",
							icon: "image",
							title: D("Image")
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
						let r = Oi(t.of("color")).own[0]?.ref ?? "currentColor";
						n === "gradient" ? u(`linear-gradient(180deg, ${r}, transparent)`) : n === "image" ? e.edit((e) => {
							e.swap(mi, "bg-none"), e.write({
								backgroundSize: "cover",
								backgroundPosition: "center"
							});
						}, "fill") : l();
					}
				}]
			}),
			i === "gradient" && /* @__PURE__ */ V(Q, {
				s: e,
				bare: !0,
				fields: [{
					handle: "gradient",
					type: "text",
					component: "blocks-gradient",
					className: "items-start",
					label: D("Gradient"),
					get: () => r,
					set: u
				}]
			}),
			i === "image" && /* @__PURE__ */ H("div", {
				className: "space-y-1 rounded-md bg-active/60 p-1.5 text-xs",
				children: [/* @__PURE__ */ V(xe, {
					bare: !0,
					disabled: !e.engine,
					fields: [{
						handle: "bg",
						type: "media",
						label: D("Image"),
						max: 1,
						accept: "image/*"
					}],
					values: { bg: o && o.url === a ? [o.id] : [] },
					onChange: (e, t) => void f(t?.[0])
				}), /* @__PURE__ */ V(Z, {
					bare: !0,
					disabled: !e.engine,
					fields: [{
						handle: "url",
						type: "text",
						size: "sm",
						commit: "blur",
						mono: !0,
						label: D("Image Address"),
						placeholder: "/media/…"
					}],
					values: { url: a ?? "" },
					onChange: (e, t) => d(t.trim() || null)
				})]
			}),
			/* @__PURE__ */ V(Q, {
				s: e,
				fields: [
					i === "image" && {
						handle: "backgroundSize",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: D("Size"),
						options: [
							{
								value: "cover",
								label: D("Cover")
							},
							{
								value: "contain",
								label: D("Contain")
							},
							{
								value: "auto",
								label: D("Original")
							}
						]
					},
					i === "image" && {
						handle: "backgroundPosition",
						type: "json",
						component: "blocks-origin",
						label: D("Position"),
						className: "items-start py-0.5 [&>label]:leading-6"
					},
					i === "image" && {
						handle: "backgroundRepeat",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: D("Repeat||again"),
						placeholder: "repeat",
						options: [
							{
								value: "no-repeat",
								label: D("Once")
							},
							{
								value: "repeat",
								label: D("Tile")
							},
							{
								value: "repeat-x",
								icon: "spacing",
								title: D("Tile Across")
							},
							{
								value: "repeat-y",
								icon: "arrows-out-line-vertical",
								title: D("Tile Down")
							}
						]
					},
					i === "image" && {
						handle: "backgroundAttachment",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: D("Scrolling"),
						options: [{
							value: "scroll",
							label: D("With Page")
						}, {
							value: "fixed",
							label: D("Fixed")
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
						label: D("Clip"),
						options: [{
							value: "border-box",
							label: D("Box")
						}, {
							value: "text",
							label: D("Text")
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
var ko = () => [
	{
		value: "block",
		icon: "square",
		title: D("Block")
	},
	{
		value: "flex",
		icon: "rows",
		title: D("Stack (flex)")
	},
	{
		value: "grid",
		icon: "grid",
		title: D("Grid")
	},
	{
		value: "inline-flex",
		icon: "arrows-in-line-horizontal",
		title: D("Inline Stack")
	},
	{
		value: "none",
		icon: "eye-off",
		title: D("Hidden")
	}
], Ao = (e) => e?.match(/^repeat\((\d+), minmax\(0, 1fr\)\)$/)?.[1] ?? e, jo = (e) => e?.match(/^span (\d+) \/ span \1$/)?.[1] ?? e;
function Mo(e, t, n, r) {
	r && /^\d+$/.test(r.trim()) && e.engine?.valid(`${n}-${r.trim()}`) ? e.swap(t.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`), `${n}-${r.trim()}`) : e.set(t, r);
}
function No({ s: e }) {
	let t = e.value("display"), n = t === "flex" || t === "inline-flex", r = t === "grid" || t === "inline-grid", i = n && (e.value("flexDirection") ?? "row").startsWith("row");
	return /* @__PURE__ */ V(Ja, {
		s: e,
		group: "layout",
		title: D("Layout"),
		empty: !t,
		children: /* @__PURE__ */ V(Q, {
			s: e,
			fields: [
				{
					handle: "display",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: D("Display"),
					options: ko()
				},
				n && {
					handle: "flexDirection",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: D("Direction"),
					get: () => e.value("flexDirection") ?? "row",
					options: [
						{
							value: "row",
							icon: "arrow-right",
							title: D("Horizontal")
						},
						{
							value: "column",
							icon: "arrow-down",
							title: D("Vertical")
						},
						{
							value: "row-reverse",
							icon: "arrow-left",
							title: D("Horizontal, Reversed")
						},
						{
							value: "column-reverse",
							icon: "arrow-up",
							title: D("Vertical, Reversed")
						}
					]
				},
				n && {
					handle: "align",
					type: "json",
					component: "blocks-align",
					label: D("Align"),
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
					label: D("Gap"),
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
					label: D("Wrap"),
					options: [{
						value: "nowrap",
						label: D("One Line")
					}, {
						value: "wrap",
						label: D("Wrap")
					}],
					get: () => e.value("flexWrap") ?? "nowrap",
					set: (t) => e.set("flexWrap", t === "wrap" ? "wrap" : null)
				},
				r && {
					handle: "gridTemplateColumns",
					type: "text",
					component: "blocks-value",
					label: D("Columns"),
					placeholder: D("3 or 1fr 2fr"),
					unit: "",
					min: 1,
					title: D("A number of equal columns, or any grid template (1fr 2fr, repeat(auto-fill, minmax(16rem, 1fr)))"),
					get: () => Ao(e.value("gridTemplateColumns")),
					set: (t) => Mo(e, "gridTemplateColumns", "grid-cols", t)
				},
				r && {
					handle: "gridTemplateRows",
					type: "text",
					component: "blocks-value",
					label: D("Rows"),
					placeholder: "auto",
					unit: "",
					get: () => Ao(e.value("gridTemplateRows")),
					set: (t) => Mo(e, "gridTemplateRows", "grid-rows", t)
				},
				r && {
					handle: "gaps",
					type: "group",
					component: "blocks-group",
					label: D("Gap"),
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
						label: D("Columns"),
						group: "spacing",
						prefixIcon: "split",
						placeholder: "0",
						min: 0
					}, {
						handle: "rowGap",
						type: "text",
						component: "blocks-value",
						label: D("Rows"),
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
					label: D("Align"),
					keys: ["alignItems", "justifyItems"],
					get: () => e.value("alignItems"),
					options: [
						{
							value: "flex-start",
							icon: "align-top",
							title: D("Top")
						},
						{
							value: "center",
							icon: "align-middle",
							title: D("Middle")
						},
						{
							value: "flex-end",
							icon: "align-bottom",
							title: D("Bottom")
						},
						{
							value: "stretch",
							icon: "arrows-out-line-vertical",
							title: D("Stretch")
						}
					]
				},
				r && {
					handle: "gridAutoFlow",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: D("Flow"),
					options: [
						{
							value: "row",
							icon: "arrow-right",
							title: D("Rows First")
						},
						{
							value: "column",
							icon: "arrow-down",
							title: D("Columns First")
						},
						{
							value: "row dense",
							icon: "group",
							title: D("Fill Gaps (Dense)")
						}
					]
				}
			]
		})
	});
}
function Po({ s: e, parentDisplay: t }) {
	if (!t || !/flex|grid/.test(t)) return null;
	let n = t.includes("grid");
	return /* @__PURE__ */ V(Ja, {
		s: e,
		group: "item",
		title: D(n ? "Grid Item" : "Stack Item"),
		open: !1,
		empty: !e.value("alignSelf") && !e.value("flex") && !e.value("gridColumn"),
		children: /* @__PURE__ */ V(Q, {
			s: e,
			fields: [
				n && {
					handle: "gridColumn",
					type: "text",
					component: "blocks-value",
					label: D("Column"),
					placeholder: "auto",
					unit: "",
					title: D("Span a number of columns (2), or a range (1 / -1 for full width)"),
					get: () => jo(e.value("gridColumn")),
					set: (t) => Mo(e, "gridColumn", "col-span", t)
				},
				n && {
					handle: "gridRow",
					type: "text",
					component: "blocks-value",
					label: D("Row"),
					placeholder: "auto",
					unit: "",
					get: () => jo(e.value("gridRow")),
					set: (t) => Mo(e, "gridRow", "row-span", t)
				},
				!n && {
					handle: "flex",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: D("Grow"),
					options: [
						{
							value: "1",
							label: D("Fill||size")
						},
						{
							value: "none",
							label: D("Fixed")
						},
						{
							value: "0 1 auto",
							label: D("Shrink")
						}
					]
				},
				{
					handle: "alignSelf",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: D("Align Self"),
					options: [
						{
							value: "flex-start",
							icon: "align-top",
							title: D("Start")
						},
						{
							value: "center",
							icon: "align-middle",
							title: D("Center")
						},
						{
							value: "flex-end",
							icon: "align-bottom",
							title: D("End")
						},
						{
							value: "stretch",
							icon: "arrows-out-line-vertical",
							title: D("Stretch")
						}
					]
				},
				{
					handle: "order",
					type: "text",
					component: "blocks-value",
					label: D("Display Order"),
					unit: "",
					placeholder: "0",
					prefixIcon: "list-ordered"
				}
			]
		})
	});
}
// admin/src/builder/design/LayerBar.tsx
var Fo = () => [
	{
		value: "",
		label: D("Default")
	},
	{
		value: "hover",
		label: D("Hover")
	},
	{
		value: "active",
		label: D("Pressed")
	},
	{
		value: "focus-visible",
		label: D("Focus")
	}
], Io = () => [
	{
		value: "before",
		label: D("Before")
	},
	{
		value: "after",
		label: D("After")
	},
	{
		value: "placeholder",
		label: D("Placeholder")
	},
	{
		value: "first",
		label: D("First Item")
	},
	{
		value: "last",
		label: D("Last Item")
	},
	{
		value: "odd",
		label: D("Odd Items")
	},
	{
		value: "even",
		label: D("Even Items")
	},
	{
		value: "current",
		label: D("Current Page")
	},
	{
		value: "group-hover",
		label: D("Hover on Group")
	},
	{
		value: "dark",
		label: D("Dark Mode")
	},
	{
		value: "open",
		label: D("When Open")
	}
];
function Lo(e) {
	if (e === "") return D("Default");
	let t = [...Fo(), ...Io()].find((t) => t.value === e);
	if (t) return t.label;
	if (e.startsWith("in-data-")) return D("in {state}", { state: e.slice(8) });
	if (e.startsWith("data-")) return e.slice(5);
	let n = /^max-(\w+)$/.exec(e);
	return n ? D("Below {size}", { size: n[1] }) : e;
}
function Ro({ label: e, value: t, choices: n, onChange: r }) {
	return /* @__PURE__ */ V("div", {
		"data-wrap": !0,
		className: "flex min-w-0 flex-1 flex-wrap gap-0.5 rounded-md bg-active p-0.5",
		role: "radiogroup",
		"aria-label": e,
		children: n.map((e) => {
			let n = /* @__PURE__ */ H(P, {
				variant: "ghost",
				size: "xs",
				role: "radio",
				"aria-checked": t === e.value,
				onClick: () => r(e.value),
				className: B("relative flex-[1_0_auto] !rounded-sm !px-1.5", t === e.value ? "!bg-float !text-ink shadow-raise dark:!bg-fill" : "!bg-transparent !text-muted hover:!text-text"),
				children: [/* @__PURE__ */ V("span", { children: e.label }), e.dot && t !== e.value && /* @__PURE__ */ V("span", {
					className: "size-1 shrink-0 rounded-full bg-current opacity-70",
					"aria-hidden": !0
				})]
			}, e.value || "all");
			return e.tooltip ? /* @__PURE__ */ V(ke, {
				content: e.tooltip,
				children: n
			}, e.value || "all") : n;
		})
	});
}
function zo({ classes: e, engine: t, breakpoints: n, breakpoint: r, state: i, onBreakpoint: a, onState: o, states: s }) {
	let c = _i(e), l = i.join(":"), u = (e) => o(e ? G(`${e}:x`).variants : []), d = Fo(), f = [...(s?.own ?? []).map((e) => `data-${e}`), ...(s?.inherited ?? []).map((e) => `in-data-${e}`)], p = (e) => !t || t.valid(`${e}:flex`), m = async () => {
		let e = await Pe({
			title: D("Custom Variant"),
			fields: [{
				handle: "name",
				type: "text",
				label: D("Variant"),
				placeholder: "aria-expanded, peer-checked, md:hover",
				mono: !0
			}],
			confirm: D("Edit Variant")
		}), t = String(e?.name ?? "").trim().replace(/:+$/, "");
		if (t) {
			if (/\s/.test(t) || !p(t)) return void Ie.error(D("Tailwind has no variant “{name}”.", { name: t }));
			u(t);
		}
	}, h = (e) => ({
		label: Lo(e),
		checked: l === e,
		hint: c.has(e) ? "•" : void 0,
		onSelect: () => u(e)
	}), g = [{
		value: "",
		label: D("All"),
		tooltip: D("Every Screen")
	}, ...n.map((e) => ({
		value: e.name,
		label: e.name,
		tooltip: D("{width}px and up", { width: e.width }),
		dot: c.has(e.name)
	}))], _ = d.map((e) => ({
		...e,
		dot: !!e.value && c.has(e.value)
	}));
	return l && !_.some((e) => e.value === l) && _.push({
		value: l,
		label: i.map(Lo).join(" · ")
	}), /* @__PURE__ */ H("div", {
		className: "space-y-2 border-b border-border px-4 py-3",
		"data-layer-bar": !0,
		children: [n.length > 0 && /* @__PURE__ */ V(Ro, {
			label: D("Screen"),
			value: r,
			choices: g,
			onChange: a
		}), /* @__PURE__ */ H("div", {
			className: "flex items-start gap-1",
			children: [/* @__PURE__ */ V(Ro, {
				label: D("State"),
				value: l,
				choices: _,
				onChange: u
			}), /* @__PURE__ */ V(L, {
				align: "end",
				trigger: /* @__PURE__ */ V(I, {
					icon: "plus",
					label: D("More States")
				}),
				items: [
					...Io().map((e) => h(e.value)),
					...f.filter(p).length ? [{
						label: D("States of This Element"),
						heading: !0
					}, ...f.filter(p).map(h)] : [],
					...n.length ? [{
						label: D("Smaller Screens Only"),
						heading: !0
					}, ...n.map((e) => h(`max-${e.name}`))] : [],
					{
						separator: !0,
						label: ""
					},
					{
						label: D("Custom Variant…"),
						onSelect: () => void m()
					}
				]
			})]
		})]
	});
}
// admin/src/builder/design/Position.tsx
function Bo({ s: e }) {
	let t = e.value("position"), n = !!t && t !== "static";
	return /* @__PURE__ */ V(Ja, {
		s: e,
		group: "position",
		title: D("Position"),
		open: !!t,
		empty: !t,
		children: /* @__PURE__ */ V(Q, {
			s: e,
			fields: [
				{
					handle: "position",
					type: "select",
					size: "sm",
					label: D("Type"),
					placeholder: D("Static"),
					options: [
						{
							value: "static",
							label: D("Static")
						},
						{
							value: "relative",
							label: D("Relative")
						},
						{
							value: "absolute",
							label: D("Absolute")
						},
						{
							value: "fixed",
							label: D("Fixed")
						},
						{
							value: "sticky",
							label: D("Sticky")
						}
					]
				},
				n && {
					handle: "offsets",
					type: "group",
					component: "blocks-group",
					label: D("Offsets"),
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
							top: D("Top"),
							right: D("Right"),
							bottom: D("Bottom"),
							left: D("Left")
						}[e],
						title: {
							top: D("Top"),
							right: D("Right"),
							bottom: D("Bottom"),
							left: D("Left")
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
					label: D("Z-index"),
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
					label: D("Isolation"),
					placeholder: "auto",
					options: [{
						value: "auto",
						label: D("Auto")
					}, {
						value: "isolate",
						label: D("Isolate")
					}]
				}
			]
		})
	});
}
// admin/src/builder/design/Size.tsx
function Vo(e, t, n) {
	let r = e.value(t), i = r === "100%" ? "fill" : r === "fit-content" ? "fit" : r === "auto" || !r ? "auto" : r.endsWith("vh") || r.endsWith("vw") || r.endsWith("dvh") ? "viewport" : "fixed", a = {
		fill: D("Fill||size"),
		fit: D("Fit"),
		auto: D("Auto"),
		viewport: D("Window"),
		fixed: D("Fixed")
	};
	return {
		handle: t,
		type: "text",
		component: "blocks-value",
		label: n,
		prefix: t === "width" ? "W" : "H",
		placeholder: D("Auto"),
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
					label: D("Fill the Parent (100%)"),
					value: "100%",
					checked: i === "fill"
				},
				{
					label: D("Fit the Content"),
					value: "fit-content",
					checked: i === "fit"
				},
				{
					label: D("Auto"),
					value: null,
					checked: i === "auto"
				},
				{
					label: D(t === "width" ? "Window Width (100vw)" : "Window Height (100dvh)"),
					value: t === "width" ? "100vw" : "100dvh",
					checked: i === "viewport"
				}
			]
		}
	};
}
function Ho({ s: e, media: t }) {
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
	return /* @__PURE__ */ V(Ja, {
		s: e,
		group: "size",
		title: D("Size"),
		empty: !n,
		children: /* @__PURE__ */ V(Q, {
			s: e,
			fields: [
				Vo(e, "width", D("Width")),
				Vo(e, "height", D("Height")),
				{
					handle: "limits",
					type: "group",
					component: "blocks-group",
					label: D("Min · Max"),
					columns: 2,
					fields: [
						{
							handle: "minWidth",
							type: "text",
							component: "blocks-value",
							label: D("Min Width"),
							prefix: "W",
							placeholder: D("Min"),
							title: D("Minimum Width"),
							min: 0
						},
						{
							handle: "maxWidth",
							type: "text",
							component: "blocks-value",
							label: D("Max Width"),
							prefix: "W",
							placeholder: D("Max"),
							group: "container",
							title: D("Maximum Width"),
							min: 0,
							keywords: ["none"]
						},
						{
							handle: "minHeight",
							type: "text",
							component: "blocks-value",
							label: D("Min Height"),
							prefix: "H",
							placeholder: D("Min"),
							title: D("Minimum Height"),
							min: 0
						},
						{
							handle: "maxHeight",
							type: "text",
							component: "blocks-value",
							label: D("Max Height"),
							prefix: "H",
							placeholder: D("Max"),
							title: D("Maximum Height"),
							min: 0,
							keywords: ["none"]
						}
					]
				},
				{
					handle: "aspectRatio",
					type: "select",
					size: "sm",
					label: D("Aspect"),
					placeholder: D("Auto"),
					get: () => {
						let t = e.value("aspectRatio");
						return t && e.engine ? e.engine.resolve(t).replace(/\s+/g, "") : t;
					},
					options: [
						{
							value: "1/1",
							label: D("1:1 square")
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
							label: D("3:4 portrait")
						},
						{
							value: "4/5",
							label: "4:5"
						},
						{
							value: "9/16",
							label: D("9:16 story")
						}
					]
				},
				{
					handle: "overflow",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: D("Overflow"),
					placeholder: "visible",
					options: [
						{
							value: "visible",
							icon: "eye",
							title: D("Visible")
						},
						{
							value: "hidden",
							icon: "eye-off",
							title: D("Hidden")
						},
						{
							value: "auto",
							icon: "mouse-scroll",
							title: D("Scroll When Needed")
						},
						{
							value: "clip",
							icon: "scissors",
							title: D("Clip, without scrolling")
						}
					]
				},
				t && {
					handle: "objectFit",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: D("Fit||image"),
					options: [
						{
							value: "cover",
							label: D("Cover")
						},
						{
							value: "contain",
							label: D("Contain")
						},
						{
							value: "fill",
							label: D("Stretch")
						},
						{
							value: "none",
							label: D("None")
						}
					]
				},
				t && {
					handle: "objectPosition",
					type: "json",
					component: "blocks-origin",
					label: D("Focus"),
					className: "items-start py-0.5 [&>label]:leading-6"
				}
			]
		})
	});
}
// admin/src/builder/design/Spacing.tsx
var Uo = [
	"Top",
	"Right",
	"Bottom",
	"Left"
];
function Wo(e, t, n) {
	return [
		`${t}${Uo[n]}`,
		n % 2 == 0 ? `${t}Block` : `${t}Inline`,
		t
	].find((t) => e.value(t) !== void 0) ?? null;
}
function Go(e, t, n) {
	let r = Wo(e, t, n);
	if (!r) return;
	let i = e.value(r);
	if (r === t) return ha(i)?.[n];
	if (r.endsWith("Block") || r.endsWith("Inline")) {
		let [e, t] = pa(String(i));
		return n === 0 || n === 3 ? e : t ?? e;
	}
	return i;
}
var Ko = (e) => [
	e,
	`${e}Block`,
	`${e}Inline`,
	...Uo.map((t) => `${e}${t}`)
];
function qo({ s: e }) {
	let t = ["margin", "padding"], n = t.some((t) => Uo.some((n, r) => Go(e, t, r))), r = Object.fromEntries(t.map((t) => [t, [
		0,
		1,
		2,
		3
	].map((n) => Go(e, t, n))])), i = Object.fromEntries(t.map((t) => [t, [
		0,
		1,
		2,
		3
	].map((n) => {
		let r = Wo(e, t, n);
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
		}), Uo.forEach((e, o) => r[`${t}${e}`] = i || a ? null : n[o] ?? null), e.write(r);
	};
	return /* @__PURE__ */ V(Gr, {
		title: D("Spacing"),
		empty: !n,
		children: /* @__PURE__ */ V(Q, {
			s: e,
			bare: !0,
			fields: [{
				handle: "spacing",
				type: "json",
				component: "blocks-spacing",
				className: "items-start",
				label: D("Spacing"),
				sideStatus: i,
				keys: [...Ko("margin"), ...Ko("padding")],
				get: () => r,
				set: (e) => t.forEach((t) => e[t] !== r[t] && a(t, e[t]))
			}]
		})
	});
}
// admin/src/builder/design/Transform.tsx
var Jo = (e) => !e || /^-?0(px|deg|%)?$/.test(e);
function Yo({ s: e }) {
	let t = {
		x: e.value("--tw-translate-x"),
		y: e.value("--tw-translate-y")
	}, n = {
		X: si(e.value("--tw-skew-x")),
		Y: si(e.value("--tw-skew-y"))
	}, r = e.value("--tw-scale-x"), i = r?.endsWith("%") ? String(parseFloat(r) / 100) : r, a = [
		t.x,
		t.y,
		n.X,
		n.Y,
		i,
		e.value("rotate"),
		e.value("transformOrigin"),
		e.value("perspective")
	].some(Boolean), o = (t, n, r, i) => e.swap(t, e.engine && !Jo(r) ? ui(e.engine, n, r, i) : null), s = (e) => [{
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
	return /* @__PURE__ */ V(Ja, {
		s: e,
		group: "transform",
		title: D("Transform"),
		open: !!a,
		empty: !a,
		children: /* @__PURE__ */ V(Q, {
			s: e,
			fields: [
				{
					handle: "move",
					type: "group",
					component: "blocks-group",
					label: D("Move"),
					markers: ["--tw-translate-x", "--tw-translate-y"],
					fields: s("px"),
					get: () => t,
					set: (e) => Object.entries(va(t, e)).forEach(([e, t]) => o(`--tw-translate-${e}`, `translate-${e}`, t, "spacing"))
				},
				{
					handle: "rotate",
					type: "text",
					component: "blocks-value",
					label: D("Rotate"),
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
					label: D("Scale"),
					unit: "",
					step: .01,
					prefixIcon: "arrows-out-simple",
					placeholder: "1",
					markers: ["scale"],
					get: () => i,
					set: (t) => e.swap("scale", e.engine && t && Number(t) !== 1 ? ui(e.engine, "scale", t, "percent") : null)
				},
				{
					handle: "skew",
					type: "group",
					component: "blocks-group",
					label: D("Skew"),
					markers: ["--tw-skew-x", "--tw-skew-y"],
					fields: s("deg").map((e) => ({
						...e,
						handle: e.handle.toUpperCase()
					})),
					get: () => n,
					set: (e) => Object.entries(va(n, e)).forEach(([e, t]) => o(`--tw-skew-${e.toLowerCase()}`, `skew-${e.toLowerCase()}`, t, "deg"))
				},
				{
					handle: "transformOrigin",
					type: "json",
					component: "blocks-origin",
					label: D("Origin"),
					className: "items-start py-0.5 [&>label]:leading-6"
				},
				{
					handle: "perspective",
					type: "text",
					component: "blocks-value",
					label: D("Perspective"),
					prefixIcon: "perspective",
					placeholder: "none",
					keywords: ["none"]
				}
			]
		})
	});
}
// admin/src/builder/design/Transition.tsx
var Xo = () => [
	{
		value: "transition",
		label: D("Colors, Opacity, Shadow and Transform")
	},
	{
		value: "transition-all",
		label: D("Everything")
	},
	{
		value: "transition-colors",
		label: D("Colors")
	},
	{
		value: "transition-transform",
		label: D("Transform")
	},
	{
		value: "transition-opacity",
		label: D("Opacity")
	},
	{
		value: "transition-shadow",
		label: D("Shadow")
	}
], Zo = [
	"transition-property",
	"--tw-duration",
	"--tw-ease",
	"transition-delay"
];
function Qo({ s: e }) {
	let t = X(), n = e.value("transitionProperty"), r = Xo(), i = n === void 0 ? void 0 : r.find((t) => e.engine?.value(t.value, "transition-property") === n)?.value, a = (t, n, r) => e.swap(t, r && e.engine ? ui(e.engine, n, r, "ms") : null);
	return /* @__PURE__ */ V(Ja, {
		s: e,
		group: "transition",
		title: D("Transition"),
		open: !!n,
		empty: !n,
		children: n ? /* @__PURE__ */ V(Q, {
			s: e,
			fields: [
				{
					handle: "property",
					type: "select",
					size: "sm",
					label: D("Animate"),
					options: r,
					markers: ["transition-property"],
					reset: () => e.swap(Zo, null),
					get: () => i,
					set: (t) => e.swap(t ? "transition-property" : Zo, t || null)
				},
				{
					handle: "timing",
					type: "group",
					component: "blocks-group",
					label: D("Duration"),
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
						label: D("Duration"),
						unit: "ms",
						step: 10,
						min: 0,
						prefixIcon: "timer",
						placeholder: "150"
					}, {
						handle: "delay",
						type: "text",
						component: "blocks-value",
						label: D("Delay"),
						unit: "ms",
						step: 10,
						min: 0,
						prefixIcon: "pause",
						placeholder: D("Delay")
					}]
				},
				{
					handle: "ease",
					type: "text",
					component: "ease",
					label: D("Curve"),
					markers: ["--tw-ease"],
					get: () => e.value("--tw-ease"),
					set: (t) => e.swap("--tw-ease", t && e.engine ? ui(e.engine, "ease", t, "number") : null),
					options: [
						...t.of("ease").map((e) => ({
							value: e.ref,
							label: e.name,
							curve: e.value
						})),
						{
							value: "linear",
							label: D("Linear")
						},
						{
							value: "cubic-bezier(0.2, 0.8, 0.2, 1)",
							label: D("Smooth Out")
						},
						{
							value: "cubic-bezier(0.65, 0, 0.35, 1)",
							label: D("Smooth In-Out")
						},
						{
							value: "cubic-bezier(0.34, 1.56, 0.64, 1)",
							label: D("Overshoot")
						}
					]
				}
			]
		}) : /* @__PURE__ */ V(P, {
			variant: "ghost",
			icon: "plus",
			disabled: !e.engine,
			onClick: () => e.swap("transition-property", "transition"),
			className: "w-full !text-xs !font-normal !text-muted hover:!text-ink",
			children: D("Animate State Changes")
		})
	});
}
// admin/src/builder/design/Typography.tsx
var $o = () => ({
	100: D("Thin 100"),
	200: D("Extra Light 200"),
	300: D("Light 300"),
	400: D("Regular 400"),
	500: D("Medium 500"),
	600: D("Semibold 600"),
	700: D("Bold 700"),
	800: D("Extra Bold 800"),
	900: D("Black 900")
}), es = "-webkit-text-stroke";
function ts({ s: e, prose: t }) {
	let n = X(), r = $o(), i = [
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
		es
	].some((t) => e.value(t)), a = pa(e.value(es) ?? ""), o = {
		width: a.find((e) => /^-?[\d.]/.test(e)),
		color: a.find((e) => !/^-?[\d.]/.test(e))
	}, s = e.value("textOverflow") === "ellipsis" && e.value("whiteSpace") === "nowrap";
	return /* @__PURE__ */ H(Ja, {
		s: e,
		group: "typography",
		title: D("Typography"),
		empty: !i && !t?.on,
		children: [
			t && /* @__PURE__ */ V(Z, {
				fields: [{
					handle: "prose",
					type: "toggle",
					label: D("Prose")
				}],
				values: { prose: t.on },
				onChange: (e, n) => t.onChange(!!n)
			}),
			/* @__PURE__ */ V(Q, {
				s: e,
				fields: [
					{
						handle: "fontFamily",
						type: "select",
						size: "sm",
						label: D("Font"),
						placeholder: D("Inherit"),
						options: n.of("font").map((e) => ({
							value: e.ref,
							label: `${e.name} · ${e.value.split(",")[0].replace(/["']/g, "")}`
						}))
					},
					{
						handle: "fontWeight",
						type: "select",
						size: "sm",
						label: D("Weight"),
						placeholder: D("Inherit"),
						options: n.of("weight").map((e) => ({
							value: e.ref,
							label: r[e.value] ?? `${e.name} · ${e.value}`
						}))
					},
					{
						handle: "fontSize",
						type: "text",
						component: "blocks-value",
						label: D("Size"),
						group: "text",
						prefixIcon: "richtext",
						placeholder: D("Inherit"),
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
						label: D("Line Height"),
						group: "leading",
						prefixIcon: "height",
						unit: "",
						step: .05,
						placeholder: D("Inherit"),
						title: D("Line Height (1.2 = 120%)")
					},
					{
						handle: "letterSpacing",
						type: "text",
						component: "blocks-value",
						label: D("Letter Spacing"),
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
						label: D("Color"),
						placeholder: D("Inherit")
					},
					{
						handle: "textAlign",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: D("Align"),
						placeholder: "left",
						options: [
							{
								value: "left",
								icon: "align-left",
								title: D("Left")
							},
							{
								value: "center",
								icon: "align-center",
								title: D("Center")
							},
							{
								value: "right",
								icon: "align-right",
								title: D("Right")
							},
							{
								value: "justify",
								icon: "align-justify",
								title: D("Justify||text")
							}
						]
					},
					{
						handle: "fontStyle",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: D("Style"),
						placeholder: "normal",
						options: [{
							value: "normal",
							icon: "text",
							title: D("Upright")
						}, {
							value: "italic",
							icon: "italic",
							title: D("Italic")
						}]
					},
					{
						handle: "textDecorationLine",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: D("Decoration"),
						placeholder: "none",
						options: [
							{
								value: "none",
								icon: "close",
								title: D("No Decoration")
							},
							{
								value: "underline",
								icon: "underline",
								title: D("Underline")
							},
							{
								value: "line-through",
								icon: "strike",
								title: D("Strike Through")
							}
						]
					},
					{
						handle: "textTransform",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: D("Case"),
						placeholder: "none",
						options: [
							{
								value: "none",
								icon: "close",
								title: D("As Typed")
							},
							{
								value: "uppercase",
								label: "AA",
								title: D("Uppercase")
							},
							{
								value: "capitalize",
								label: "Aa",
								title: D("Capitalize")
							},
							{
								value: "lowercase",
								label: "aa",
								title: D("Lowercase")
							}
						]
					},
					{
						handle: "textWrap",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: D("Wrap"),
						options: [
							{
								value: "balance",
								label: D("Balance")
							},
							{
								value: "pretty",
								label: D("Pretty")
							},
							{
								value: "nowrap",
								label: D("None")
							}
						]
					},
					{
						handle: "lineClamp",
						type: "text",
						component: "blocks-value",
						label: D("Max Lines"),
						unit: "",
						min: 1,
						placeholder: D("All"),
						prefixIcon: "list-tree",
						markers: ["-webkit-line-clamp"],
						get: () => e.value("-webkit-line-clamp"),
						set: (t) => e.swap(["-webkit-line-clamp", "text-overflow"], t && e.engine?.valid(`line-clamp-${t}`) ? `line-clamp-${t}` : null)
					},
					{
						handle: "truncate",
						type: "toggle",
						size: "sm",
						label: D("Truncate"),
						get: () => s,
						set: (t) => e.swap(["text-overflow", "-webkit-line-clamp"], t ? "truncate" : null)
					}
				]
			}),
			/* @__PURE__ */ V(Q, {
				s: e,
				bare: !0,
				fields: [{
					handle: "textShadow",
					type: "text",
					component: "blocks-shadows",
					kind: "text",
					label: D("Text Shadow")
				}]
			}),
			/* @__PURE__ */ V(Q, {
				s: e,
				fields: [{
					handle: "stroke",
					type: "group",
					component: "blocks-group",
					label: D("Text Stroke"),
					keys: [es],
					get: () => o,
					set: (t) => {
						let n = {
							...o,
							...va(o, t)
						};
						e.set(es, n.width ? `${n.width} ${n.color ?? "currentColor"}` : null);
					},
					fields: [{
						handle: "width",
						type: "text",
						component: "blocks-value",
						label: D("Width"),
						prefixIcon: "edit",
						placeholder: "0",
						min: 0,
						step: .5,
						className: "!flex-none w-[72px]"
					}, {
						handle: "color",
						type: "color",
						component: "blocks-color",
						label: D("Color"),
						placeholder: D("Text Color")
					}]
				}]
			})
		]
	});
}
// admin/src/builder/design/DesignPanel.tsx
var ns = [
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
function rs({ s: e, groups: t = ns, container: n = !0, parentDisplay: r, media: i, prose: a }) {
	let o = (e) => t.includes(e);
	return /* @__PURE__ */ H(ze, { children: [
		o("layout") && n && /* @__PURE__ */ V(No, { s: e }),
		r && /flex|grid/.test(r) && /* @__PURE__ */ V(Po, {
			s: e,
			parentDisplay: r
		}),
		o("position") && /* @__PURE__ */ V(Bo, { s: e }),
		o("size") && /* @__PURE__ */ V(Ho, {
			s: e,
			media: i
		}),
		o("spacing") && /* @__PURE__ */ V(qo, { s: e }),
		o("typography") && /* @__PURE__ */ V(ts, {
			s: e,
			prose: a
		}),
		o("fill") && /* @__PURE__ */ V(Oo, { s: e }),
		o("border") && /* @__PURE__ */ V(Ea, { s: e }),
		o("effects") && /* @__PURE__ */ V(ro, { s: e }),
		o("transform") && /* @__PURE__ */ V(Yo, { s: e }),
		o("transition") && /* @__PURE__ */ V(Qo, { s: e }),
		t.length > 1 && /* @__PURE__ */ V(Xa, { s: e })
	] });
}
function is({ node: e }) {
	let { types: t, store: n, readOnly: r } = a(), i = yt(), o = t.get(e.type), s = fa(e), c = W(n, (e) => e.breakpoint), l = W(n, (e) => e.state), d = W(n, (t) => v(t.nodes, e.id)), f = W(n, (t) => u(t.nodes, e.id)), p = ve(() => {
		if (d) return ci(i.engine, Je(d.class), [], "", [], () => {}).value("display") ?? (d.type === "stack" || d.type === "columns" || d.type === "grid" ? "flex" : void 0);
	}, [d, i.engine]), m = ve(() => i.breakpoints.map((e) => e.name), [i.breakpoints]), h = e.type === "outlet" && !e.props?.wrap, g = h ? ["typography"] : o?.styles?.length ? o.styles : ns;
	return e.type === "component" ? /* @__PURE__ */ V("p", {
		className: "m-0 p-4 text-xs text-muted",
		children: D("Edit the component to change its shared design.")
	}) : /* @__PURE__ */ H("div", { children: [
		!i.engine && !i.loading && /* @__PURE__ */ V("div", {
			className: "border-b border-border px-4 py-3",
			children: /* @__PURE__ */ V(Se, {
				tone: "warning",
				title: D("The site’s stylesheet could not be read"),
				action: /* @__PURE__ */ V(T, {
					to: "/styling",
					className: "shrink-0 text-xs text-text",
					children: D("Open Styling")
				})
			})
		}),
		/* @__PURE__ */ V(Na, {
			s,
			site: i.classes,
			source: i.source,
			breakpoints: m,
			disabled: r
		}),
		/* @__PURE__ */ V(zo, {
			classes: s.classes,
			engine: i.engine,
			breakpoints: i.breakpoints,
			breakpoint: c,
			state: l,
			onBreakpoint: n.setBreakpoint,
			onState: n.setStyleState,
			states: Di(e, f)
		}),
		/* @__PURE__ */ V(rs, {
			s,
			groups: g,
			container: !!o?.children || e.type === "repeat",
			parentDisplay: h ? void 0 : p,
			media: [
				"image",
				"video",
				"embed"
			].includes(e.type),
			prose: o?.fields?.some((e) => e.handle === "prose") ? {
				on: !!e.props?.prose,
				onChange: (t) => n.updateProps(e.id, { prose: t || void 0 }, `inspector:${e.id}:prose`)
			} : void 0
		})
	] });
}
// admin/src/builder/logic/LogicPanel.tsx
var as = () => [
	{
		value: "click",
		label: D("Click")
	},
	{
		value: "mouseenter",
		label: D("Pointer Enters")
	},
	{
		value: "mouseleave",
		label: D("Pointer Leaves")
	},
	{
		value: "focus",
		label: D("Gets Focus")
	},
	{
		value: "blur",
		label: D("Loses Focus")
	},
	{
		value: "input",
		label: D("Typing")
	},
	{
		value: "change",
		label: D("Value Changes")
	},
	{
		value: "submit",
		label: D("Form Submit")
	},
	{
		value: "keydown",
		label: D("Key Pressed")
	},
	{
		value: "enter",
		label: D("Scrolls into View")
	},
	{
		value: "leave",
		label: D("Scrolls Out of View")
	},
	{
		value: "scroll",
		label: D("Page Scrolls")
	},
	{
		value: "resize",
		label: D("Window Resizes")
	},
	{
		value: "init",
		label: D("Page Loads")
	}
], os = () => [
	{
		value: "prevent",
		label: D("Prevent Default")
	},
	{
		value: "stop",
		label: D("Stop Propagation")
	},
	{
		value: "outside",
		label: D("Outside This Element")
	},
	{
		value: "window",
		label: D("Anywhere on the Page")
	},
	{
		value: "once",
		label: D("Only Once")
	},
	{
		value: "self",
		label: D("On This Element Only")
	},
	{
		value: "debounce",
		label: D("Debounce")
	}
], ss = () => [
	{
		value: "set",
		label: D("Set State"),
		icon: "edit"
	},
	{
		value: "toggle",
		label: D("Toggle State"),
		icon: "toggle-left"
	},
	{
		value: "add",
		label: D("Add to Number"),
		icon: "plus"
	},
	{
		value: "if",
		label: D("If … Then … Else"),
		icon: "github"
	},
	{
		value: "play",
		label: D("Play Animation"),
		icon: "play"
	},
	{
		value: "scroll",
		label: D("Scroll To"),
		icon: "mouse-scroll"
	},
	{
		value: "fetch",
		label: D("Load Page Part"),
		icon: "external"
	},
	{
		value: "copy",
		label: D("Copy to Clipboard"),
		icon: "copy"
	},
	{
		value: "go",
		label: D("Go to Link"),
		icon: "link-chain"
	},
	{
		value: "theme",
		label: D("Light or Dark Mode"),
		icon: "moon"
	},
	{
		value: "focus",
		label: D("Focus Element"),
		icon: "position"
	},
	{
		value: "lock",
		label: D("Lock Page Scrolling"),
		icon: "lock"
	},
	{
		value: "wait",
		label: D("Wait"),
		icon: "timer"
	},
	{
		value: "dispatch",
		label: D("Send Event"),
		icon: "broadcast"
	},
	{
		value: "run",
		label: D("Expression"),
		icon: "braces"
	}
];
function cs(e) {
	let { store: t } = a(), n = W(t, (t) => u(t.nodes, e.id));
	return [...new Set([...n, e].flatMap((e) => Object.keys(e.logic?.data ?? {})))];
}
function ls(e) {
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
var us = (e) => typeof e == "string" ? `'${e}'` : JSON.stringify(e), ds = (e, t, n = {}) => ({
	handle: e,
	type: "text",
	size: "sm",
	commit: "blur",
	label: t,
	mono: !0,
	max: 1e4,
	list: fs,
	placeholder: "open, count > 3, tab === 'a'",
	...n
}), fs = "cms-logic-variables", ps = (e, ...t) => e ? t : [], ms = [
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
function hs({ label: e, options: t, value: n, onChange: r }) {
	return /* @__PURE__ */ H("div", {
		className: "flex min-h-7 items-center gap-2",
		children: [/* @__PURE__ */ V(Jr, { field: {
			handle: e,
			type: "select",
			label: e
		} }), /* @__PURE__ */ V("span", {
			className: "cms-input flex h-7 min-w-0 flex-1 rounded-sm",
			children: /* @__PURE__ */ V(L, {
				align: "end",
				trigger: /* @__PURE__ */ H(P, {
					variant: "ghost",
					"aria-label": e,
					className: "!h-full min-w-0 flex-1 shrink !justify-start !gap-1.5 !bg-transparent !pl-2 !pr-1.5 text-left !font-normal",
					children: [/* @__PURE__ */ V("span", {
						className: B("min-w-0 flex-1 truncate", !n.length && "text-ghost"),
						children: n.length ? n.join(", ") : D("None")
					}), /* @__PURE__ */ V(F, {
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
					label: D("None"),
					disabled: !0
				}]
			})
		})]
	});
}
var gs = { strip: "[^A-Za-z0-9_-]" }, _s = (e) => e.replace(/^[^A-Za-z_]+/, "").slice(0, 41);
function vs({ node: e }) {
	let { store: t } = a(), n = O("styling-code/list", {}, { staleTime: 3e4 }), r = e.behavior, i = e.code ?? {}, o = (e, ...t) => [.../* @__PURE__ */ new Set([...n.data?.[e] ?? [], ...t.filter((e) => !!e)])], s = (n) => t.updateNode(e.id, { behavior: n && (n.module ?? r?.module) ? {
		...r,
		...n
	} : void 0 }, `behavior:${e.id}`), c = (n, r) => {
		let a = {
			...i,
			[n]: r.length ? r : void 0
		};
		t.updateNode(e.id, { code: a.scripts || a.styles ? a : void 0 });
	}, l = r?.props ?? {};
	return /* @__PURE__ */ H("div", {
		className: B("-mx-1.5 space-y-1 rounded-sm px-1.5 py-1", r && "bg-sunken/60"),
		children: [
			/* @__PURE__ */ V(Z, {
				fields: [{
					handle: "module",
					type: "select",
					size: "sm",
					label: D("Script"),
					placeholder: D("None"),
					options: o("scripts", r?.module),
					status: r ? "own" : void 0,
					reset: () => s(null)
				}, ...ps(r, {
					handle: "when",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: D("Runs"),
					required: !0,
					options: [
						{
							value: "load",
							label: D("On Load")
						},
						{
							value: "visible",
							label: D("In View")
						},
						{
							value: "idle",
							label: D("When Idle")
						}
					]
				})],
				values: {
					module: r?.module,
					when: r?.when ?? "load"
				},
				onChange: (e, t) => s(e === "module" ? t ? { module: String(t) } : null : { when: t === "visible" || t === "idle" ? t : void 0 })
			}),
			r && /* @__PURE__ */ H(ze, { children: [/* @__PURE__ */ V(qr, {
				title: D("Options"),
				action: /* @__PURE__ */ V(ei, {
					label: D("Add Option"),
					onClick: () => {
						let e = "value", t = 2;
						for (; e in l;) e = `value${t++}`;
						s({ props: {
							...l,
							[e]: ""
						} });
					}
				})
			}), /* @__PURE__ */ V(Z, {
				bare: !0,
				fields: [{
					handle: "props",
					type: "json",
					component: "blocks-pairs",
					className: "items-start",
					label: D("Options"),
					key: gs,
					join: "=",
					item: {
						handle: "value",
						type: "text",
						size: "sm",
						commit: "blur",
						label: D("Value"),
						mono: !0
					}
				}],
				values: { props: Object.fromEntries(Object.entries(l).map(([e, t]) => [e, us(t)])) },
				onChange: (e, t) => {
					let n = Object.fromEntries(Object.entries(t).map(([e, t]) => [_s(e), e in l && us(l[e]) === t ? l[e] : ls(t ?? "")]).filter(([e]) => e !== ""));
					s({ props: Object.keys(n).length ? n : void 0 });
				}
			})] }),
			/* @__PURE__ */ V(hs, {
				label: D("Load Scripts"),
				options: o("scripts", ...i.scripts ?? []),
				value: i.scripts ?? [],
				onChange: (e) => c("scripts", e)
			}),
			/* @__PURE__ */ V(hs, {
				label: D("Load Styles"),
				options: o("styles", ...i.styles ?? []),
				value: i.styles ?? [],
				onChange: (e) => c("styles", e)
			})
		]
	});
}
function ys({ node: e }) {
	let { store: t, types: n } = a(), r = e.logic ?? {}, i = cs(e), o = (n) => {
		let i = {
			...r,
			...n
		};
		for (let e of Object.keys(i)) {
			let t = i[e];
			(t === void 0 || t === "" || Array.isArray(t) && t.length === 0 || t && typeof t == "object" && !Array.isArray(t) && Object.keys(t).length === 0) && delete i[e];
		}
		t.updateNode(e.id, { logic: Object.keys(i).length ? i : void 0 }, `logic:${e.id}`);
	}, s = r.data ?? {}, c = [
		"link",
		"button",
		"box"
	].includes(e.type) || (n.get(e.type)?.html ?? "") === "a", l = r.behaviors ?? {}, u = E("site.code") && (!!e.behavior || !!e.code);
	return /* @__PURE__ */ H(ze, { children: [
		/* @__PURE__ */ V("datalist", {
			id: fs,
			children: [...i, ...i.map((e) => `!${e}`)].map((e) => /* @__PURE__ */ V("option", { value: e }, e))
		}),
		/* @__PURE__ */ V(Gr, {
			title: D("State"),
			empty: !r.data,
			open: !!r.data,
			actions: /* @__PURE__ */ V(ei, {
				label: D("Add Variable"),
				onClick: () => {
					let e = "open", t = 1;
					for (; e in s;) e = `value${t++}`;
					o({ data: {
						...s,
						[e]: e !== "open" && ""
					} });
				}
			}),
			children: /* @__PURE__ */ V(Z, {
				bare: !0,
				fields: [{
					handle: "data",
					type: "json",
					component: "blocks-pairs",
					className: "items-start",
					label: D("Variables"),
					key: { strip: "[^a-zA-Z0-9_]" },
					join: "=",
					item: {
						handle: "value",
						type: "text",
						size: "sm",
						commit: "blur",
						label: D("Value"),
						mono: !0
					}
				}],
				values: { data: Object.fromEntries(Object.entries(s).map(([e, t]) => [e, us(t)])) },
				onChange: (e, t) => o({ data: Object.fromEntries(Object.entries(t).map(([e, t]) => [e, e in s && us(s[e]) === t ? s[e] : ls(t ?? "")])) })
			})
		}),
		/* @__PURE__ */ H(Gr, {
			title: D("Events"),
			empty: !r.on?.length && !r.init?.length,
			open: !!r.on?.length || !!r.init?.length,
			actions: /* @__PURE__ */ V(ei, {
				label: D("Add Event"),
				onClick: () => o({ on: [...r.on ?? [], {
					event: "click",
					actions: []
				}] })
			}),
			children: [
				r.init && /* @__PURE__ */ V(xs, {
					title: D("Page Loads"),
					actions: r.init,
					variables: i,
					node: e,
					onActions: (e) => o({ init: e }),
					onRemove: () => o({ init: void 0 })
				}),
				(r.on ?? []).map((t, n) => {
					let a = (e) => o({ on: r.on.map((t, r) => r === n ? {
						...t,
						...e
					} : t) });
					return /* @__PURE__ */ V(xs, {
						title: /* @__PURE__ */ V(Z, {
							bare: !0,
							className: "min-w-0 flex-1",
							fields: [{
								handle: "trigger",
								type: "group",
								component: "blocks-group",
								label: D("Event"),
								fields: [{
									handle: "event",
									type: "select",
									size: "sm",
									label: D("Event"),
									required: !0,
									options: as().filter((e) => e.value !== "init")
								}, {
									handle: "key",
									type: "text",
									size: "sm",
									commit: "blur",
									label: D("Keyboard Key"),
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
							onChange: (e, t) => t.event !== "init" && a({
								event: t.event ?? "click",
								key: t.key || void 0
							})
						}),
						mods: t.mods,
						onMods: (e) => a({ mods: e.length ? e : void 0 }),
						actions: t.actions,
						variables: i,
						node: e,
						onActions: (e) => a({ actions: e }),
						onRemove: () => o({ on: r.on.filter((e, t) => t !== n) })
					}, n);
				}),
				!r.init && (r.on?.length ?? 0) > 0 && /* @__PURE__ */ V($r, {
					onClick: () => o({ init: [] }),
					children: D("When the Page Loads")
				})
			]
		}),
		/* @__PURE__ */ H(Gr, {
			title: D("Bindings"),
			empty: !r.show && !r.states && !r.text && !r.attrs,
			open: !!(r.show || r.states || r.text || r.attrs),
			children: [
				/* @__PURE__ */ V(Z, {
					fields: [ds("show", D("Show When"), {
						placeholder: D("Always"),
						status: r.show ? "own" : void 0,
						reset: () => o({
							show: void 0,
							transition: void 0
						})
					}), ...ps(r.show, {
						handle: "transition",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: D("Transition"),
						options: [
							{
								value: "none",
								label: D("None")
							},
							{
								value: "fade",
								label: D("Fade")
							},
							{
								value: "scale",
								label: D("Scale")
							},
							{
								value: "collapse",
								label: D("Collapse")
							}
						]
					})],
					values: {
						show: r.show,
						transition: r.transition ?? "none"
					},
					onChange: (e, t) => o(e === "show" ? { show: t || void 0 } : { transition: t && t !== "none" ? t : void 0 })
				}),
				/* @__PURE__ */ V(qr, {
					title: D("States"),
					action: /* @__PURE__ */ V(ei, {
						label: D("Add State"),
						onClick: () => o({ states: {
							...r.states ?? {},
							[Object.keys(r.states ?? {}).length ? `state${Object.keys(r.states ?? {}).length + 1}` : "open"]: i[0] ?? "open"
						} })
					})
				}),
				/* @__PURE__ */ V(Z, {
					bare: !0,
					fields: [{
						handle: "states",
						type: "json",
						component: "blocks-pairs",
						className: "items-start",
						label: D("States"),
						key: {
							prefix: "data-",
							lower: !0,
							strip: "[^a-z0-9-]",
							className: "!w-[38%] !flex-none"
						},
						join: D("when"),
						item: ds("expr", D("When||condition"))
					}],
					values: { states: r.states },
					onChange: (e, t) => o({ states: t })
				}),
				/* @__PURE__ */ V(Z, {
					fields: [ds("text", D("Text"), {
						placeholder: D("As Designed"),
						status: r.text ? "own" : void 0,
						reset: () => o({ text: void 0 })
					})],
					values: { text: r.text },
					onChange: (e, t) => o({ text: t || void 0 })
				}),
				/* @__PURE__ */ V(qr, {
					title: D("Attributes"),
					action: /* @__PURE__ */ V(ei, {
						label: D("Bind Attribute"),
						onClick: () => o({ attrs: {
							...r.attrs ?? {},
							"aria-expanded": i[0] ?? "open"
						} })
					})
				}),
				/* @__PURE__ */ V(Z, {
					bare: !0,
					fields: [{
						handle: "attrs",
						type: "json",
						component: "blocks-pairs",
						className: "items-start",
						label: D("Attributes"),
						key: {
							options: ms,
							className: ""
						},
						item: ds("expr", D("Value"))
					}],
					values: { attrs: r.attrs },
					onChange: (e, t) => o({ attrs: t })
				}),
				e.type === "input" && /* @__PURE__ */ V(Z, {
					fields: [{
						handle: "model",
						type: "select",
						size: "sm",
						label: D("Input Value"),
						placeholder: D("Not kept"),
						options: i,
						status: r.model ? "own" : void 0,
						reset: () => o({ model: void 0 })
					}],
					values: { model: r.model },
					onChange: (e, t) => o({ model: t || void 0 })
				})
			]
		}),
		/* @__PURE__ */ H(Gr, {
			title: D("Behaviors"),
			empty: !r.behaviors && !r.component && !u,
			open: !!r.behaviors || !!r.component || u,
			children: [
				/* @__PURE__ */ V(bs, {
					on: !!l.scroll,
					label: D("Scroll States"),
					onToggle: (e) => o({ behaviors: {
						...l,
						scroll: e ? { threshold: 20 } : void 0
					} }),
					fields: [{
						handle: "threshold",
						type: "text",
						component: "blocks-value",
						label: D("After||a distance"),
						unit: "",
						prefix: "px"
					}, {
						handle: "hide",
						type: "toggle",
						size: "sm",
						label: D("Add data-hidden While Scrolling Down")
					}],
					values: {
						threshold: String(l.scroll?.threshold ?? 20),
						hide: !!l.scroll?.hide
					},
					onChange: (e, t) => o({ behaviors: {
						...l,
						scroll: {
							...l.scroll,
							[e]: e === "threshold" ? Number(t ?? 20) : t
						}
					} })
				}),
				/* @__PURE__ */ V(bs, {
					on: !!l.spy,
					label: D("Scroll Spy"),
					onToggle: (e) => o({ behaviors: {
						...l,
						spy: e ? { offset: 96 } : void 0
					} })
				}),
				/* @__PURE__ */ V(bs, {
					on: !!l.group,
					label: D("Hover Group"),
					onToggle: (e) => o({ behaviors: {
						...l,
						group: e || void 0
					} })
				}),
				/* @__PURE__ */ V(bs, {
					on: !!l.menu,
					label: D("Menu"),
					onToggle: (e) => o({ behaviors: {
						...l,
						menu: e ? {} : void 0
					} })
				}),
				/* @__PURE__ */ V(bs, {
					on: !!l.carousel,
					label: D("Carousel"),
					onToggle: (e) => o({ behaviors: {
						...l,
						carousel: e ? {} : void 0
					} })
				}),
				/* @__PURE__ */ V(bs, {
					on: !!l.marquee,
					label: D("Marquee"),
					onToggle: (e) => o({ behaviors: {
						...l,
						marquee: e ? { speed: 60 } : void 0
					} }),
					fields: [
						{
							handle: "speed",
							type: "text",
							component: "blocks-value",
							label: D("Speed"),
							unit: "",
							prefix: "px/s",
							title: D("Pixels per Second")
						},
						{
							handle: "reverse",
							type: "toggle",
							size: "sm",
							label: D("Reverse")
						},
						{
							handle: "pause",
							type: "toggle",
							size: "sm",
							label: D("Pause on Hover")
						}
					],
					values: {
						speed: String(l.marquee?.speed ?? 60),
						reverse: !!l.marquee?.reverse,
						pause: !!l.marquee?.pause
					},
					onChange: (e, t) => o({ behaviors: {
						...l,
						marquee: {
							...l.marquee,
							[e]: e === "speed" ? Number(t ?? 60) : t
						}
					} })
				}),
				E("site.code") && /* @__PURE__ */ V(vs, { node: e }),
				/* @__PURE__ */ V(Z, {
					fields: [{
						handle: "component",
						type: "text",
						size: "sm",
						commit: "blur",
						label: D("Alpine"),
						placeholder: "pricingCalculator",
						mono: !0,
						status: r.component ? "own" : void 0,
						reset: () => o({ component: void 0 })
					}],
					values: { component: r.component },
					onChange: (e, t) => o({ component: String(t ?? "").replace(/[^a-zA-Z0-9_$]/g, "") || void 0 })
				})
			]
		}),
		c && /* @__PURE__ */ V(Gr, {
			title: D("Load Into"),
			open: !!r.target,
			empty: !r.target && !r.merge,
			children: /* @__PURE__ */ V(Z, {
				fields: [
					{
						handle: "target",
						type: "json",
						component: "blocks-nodes",
						label: D("Update"),
						exclude: e.id,
						add: D("Element to Update"),
						addValue: e.id
					},
					...ps(r.target, {
						handle: "push",
						type: "toggle",
						size: "sm",
						label: D("Update the Address Bar")
					}),
					{
						handle: "merge",
						type: "select",
						size: "sm",
						label: D("When Loaded"),
						placeholder: D("Replace It"),
						options: [
							{
								value: "replace",
								label: D("Replace It")
							},
							{
								value: "update",
								label: D("Replace What Is Inside")
							},
							{
								value: "append",
								label: D("Add to the End")
							},
							{
								value: "prepend",
								label: D("Add to the Start")
							},
							{
								value: "morph",
								label: D("Morph (Keep State)")
							}
						]
					}
				],
				values: {
					target: r.target,
					push: !!r.push,
					merge: r.merge
				},
				onChange: (e, t) => o({ [e]: e === "push" ? t || void 0 : t ?? void 0 })
			})
		})
	] });
}
function bs({ on: e, label: t, onToggle: n, fields: r, values: i, onChange: a }) {
	return /* @__PURE__ */ H("div", {
		className: B("-mx-1.5 rounded-sm px-1.5 py-1", e && "bg-sunken/60"),
		children: [/* @__PURE__ */ V(Z, {
			fields: [{
				handle: "on",
				type: "toggle",
				size: "sm",
				label: t
			}],
			values: { on: e },
			onChange: (e, t) => n(!!t)
		}), e && r && /* @__PURE__ */ V(Z, {
			className: "mt-1 space-y-1 pl-10",
			fields: r,
			values: i ?? {},
			onChange: a ?? (() => {})
		})]
	});
}
function xs({ title: e, mods: t, onMods: n, actions: r, onActions: i, onRemove: a, variables: o, node: s }) {
	return /* @__PURE__ */ H("div", {
		className: "space-y-1.5 rounded-sm border border-border p-1.5",
		children: [
			/* @__PURE__ */ H("div", {
				className: "flex items-center gap-1",
				children: [
					/* @__PURE__ */ V(F, {
						name: "interactive",
						size: 14,
						className: "shrink-0 text-muted"
					}),
					typeof e == "string" ? /* @__PURE__ */ V("span", {
						className: "min-w-0 flex-1 text-xs font-medium [overflow-wrap:anywhere]",
						children: e
					}) : e,
					n && /* @__PURE__ */ V(L, {
						align: "end",
						trigger: /* @__PURE__ */ V(I, {
							icon: "faders",
							label: D("Event Options"),
							size: "xs",
							active: !!t?.length
						}),
						items: os().map((e) => ({
							label: e.label,
							checked: t?.includes(e.value),
							onSelect: () => n(t?.includes(e.value) ? t.filter((t) => t !== e.value) : [...t ?? [], e.value])
						}))
					}),
					/* @__PURE__ */ V(ti, {
						onClick: a,
						label: D("Remove Event")
					})
				]
			}),
			t && t.length > 0 && /* @__PURE__ */ V("p", {
				className: "m-0 pl-5 text-2xs text-faint [overflow-wrap:anywhere]",
				children: t.map((e) => os().find((t) => t.value === e)?.label).join(" · ")
			}),
			/* @__PURE__ */ V(Ss, {
				actions: r,
				onChange: i,
				variables: o,
				node: s
			})
		]
	});
}
function Ss({ actions: e, onChange: t, variables: n, node: r, depth: i = 0 }) {
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
	return /* @__PURE__ */ H("div", {
		className: B("space-y-1", i > 0 && "border-l border-border pl-2"),
		children: [e.map((a, s) => /* @__PURE__ */ H("div", {
			className: "space-y-1 rounded-md bg-active/60 p-1.5",
			children: [/* @__PURE__ */ H("div", {
				className: "flex items-center gap-1",
				children: [
					/* @__PURE__ */ V(F, {
						name: ss().find((e) => e.value === a.do)?.icon ?? "dot-outline",
						size: 14,
						className: "shrink-0 text-muted"
					}),
					/* @__PURE__ */ V("span", {
						className: "min-w-0 flex-1 text-xs font-medium text-text [overflow-wrap:anywhere]",
						children: ss().find((e) => e.value === a.do)?.label ?? a.do
					}),
					/* @__PURE__ */ V(ti, {
						onClick: () => t(e.filter((e, t) => t !== s)),
						label: D("Remove Action")
					})
				]
			}), /* @__PURE__ */ V(ws, {
				action: a,
				onChange: (e) => o(s, e),
				variables: n,
				node: r,
				depth: i
			})]
		}, s)), /* @__PURE__ */ V(L, {
			align: "start",
			trigger: /* @__PURE__ */ V($r, { children: D("Add Action") }),
			items: ss().map((e) => ({
				label: e.label,
				icon: e.icon,
				onSelect: () => a(e.value)
			}))
		})]
	});
}
var Cs = (e) => e === "top" || e === "bottom" ? e : e?.startsWith("#") ? "anchor" : "node";
function ws({ action: e, onChange: t, variables: n, node: r, depth: i }) {
	let { store: o } = a(), s = Ut(), c = W(o, (t) => e.do === "play" && e.node ? d(t.nodes, e.node) : null), l = {
		handle: "var",
		type: "select",
		size: "sm",
		label: D("Variable"),
		options: n,
		placeholder: D("Variable")
	}, u = (e, t, n = {}) => ({
		handle: e,
		type: "select",
		component: "blocks-node",
		label: t,
		...n
	}), f = (e, t, n) => ({
		handle: e,
		type: "select",
		display: "segmented",
		block: !0,
		size: "sm",
		label: t,
		options: n,
		required: !0
	}), p = [], m = e, h = (e, t) => ({ [e]: t ?? "" });
	switch (e.do) {
		case "set":
		case "add":
			p = [l, ds("value", e.do === "set" ? D("To||set a value") : D("Add||to a number"), { placeholder: e.do === "set" ? "true, 'text', count + 1" : "1" })];
			break;
		case "toggle":
			p = [l];
			break;
		case "if":
			p = [ds("test", D("If"), { placeholder: "open" })];
			break;
		case "play":
			p = [
				u("node", D("Element")),
				{
					handle: "motion",
					type: "select",
					size: "sm",
					label: D("Animation"),
					options: (c?.motion ?? []).map((e) => ({
						value: e.id,
						label: e.name || e.id
					})),
					placeholder: c?.motion?.length ? D("First Animation") : D("No animations on it")
				},
				f("mode", D("Play"), [
					{
						value: "play",
						label: D("Play")
					},
					{
						value: "reverse",
						label: D("Reverse")
					},
					{
						value: "toggle",
						label: D("Toggle")
					},
					{
						value: "restart",
						label: D("Restart")
					}
				])
			], m = {
				...e,
				mode: e.mode ?? "play"
			}, h = (e, t) => e === "node" ? {
				node: t ?? r.id,
				motion: void 0
			} : e === "motion" ? { motion: t ?? void 0 } : { mode: t ?? "play" };
			break;
		case "scroll":
			p = [
				{
					handle: "kind",
					type: "select",
					size: "sm",
					label: D("To"),
					required: !0,
					options: [
						{
							value: "top",
							label: D("Top of Page")
						},
						{
							value: "bottom",
							label: D("Bottom of Page")
						},
						{
							value: "anchor",
							label: D("Section")
						},
						{
							value: "node",
							label: D("Element")
						}
					]
				},
				{
					handle: "anchor",
					type: "select",
					size: "sm",
					label: D("Section"),
					options: s.map((e) => ({
						value: `#${e.id}`,
						label: e.label
					})),
					placeholder: D("Choose a Section"),
					if: { kind: "anchor" }
				},
				u("node", D("Element"), { if: { kind: "node" } }),
				{
					handle: "offset",
					type: "text",
					component: "blocks-value",
					label: D("Offset"),
					unit: "",
					prefix: "px",
					placeholder: "0",
					title: D("Offset in pixels, e.g. a sticky header’s height")
				}
			], m = {
				kind: Cs(e.to),
				anchor: e.to,
				node: e.to,
				offset: e.offset ? String(e.offset) : void 0
			}, h = (e, t) => e === "kind" ? { to: t === "anchor" ? `#${s[0]?.id ?? "top"}` : t === "node" ? r.id : t ?? "top" } : e === "anchor" ? { to: t } : e === "node" ? { to: t ?? "top" } : { offset: t ? parseInt(t) : void 0 };
			break;
		case "fetch":
			p = [{
				handle: "url",
				type: "text",
				size: "sm",
				commit: "blur",
				label: D("Page"),
				placeholder: "/blog/page/2",
				mono: !0
			}, {
				handle: "target",
				type: "json",
				component: "blocks-nodes",
				label: D("Update"),
				addValue: r.id
			}];
			break;
		case "copy":
			p = [ds("value", D("Text"), { placeholder: `'${D("Text to Copy")}'` })];
			break;
		case "go":
			p = [{
				handle: "url",
				type: "url",
				component: "link",
				reference: !0,
				size: "sm",
				label: D("Link"),
				anchors: s,
				newTab: !!e.newTab,
				onNewTab: (e) => t({ newTab: e || void 0 })
			}], h = (e, t) => ({ url: t ?? "" });
			break;
		case "theme":
			p = [f("mode", D("Mode"), [
				{
					value: "toggle",
					label: D("Switch||between two")
				},
				{
					value: "light",
					label: D("Light")
				},
				{
					value: "dark",
					label: D("Dark")
				},
				{
					value: "system",
					label: D("System")
				}
			])], m = { mode: e.mode ?? "toggle" };
			break;
		case "focus":
			p = [u("node", D("Element"))], h = (e, t) => ({ node: t ?? void 0 });
			break;
		case "lock":
			p = [f("on", D("Scrolling"), [{
				value: "on",
				label: D("Lock")
			}, {
				value: "off",
				label: D("Unlock")
			}])], m = { on: e.on === !1 ? "off" : "on" }, h = (e, t) => ({ on: t !== "off" });
			break;
		case "wait":
			p = [{
				handle: "ms",
				type: "text",
				component: "blocks-value",
				label: D("Wait"),
				unit: "",
				step: 50,
				min: 0,
				prefix: "ms"
			}], m = { ms: String(e.ms ?? 300) }, h = (e, t) => ({ ms: Number(t ?? 300) });
			break;
		case "dispatch":
			p = [{
				handle: "event",
				type: "text",
				size: "sm",
				commit: "blur",
				label: D("Event"),
				placeholder: "event-name",
				mono: !0
			}, ds("detail", D("Detail"), { placeholder: "detail" })], h = (e, t) => ({ [e]: e === "detail" ? t || void 0 : t ?? "" });
			break;
		case "run":
			p = [ds("expr", D("Run"), { placeholder: "count = count * 2" })];
			break;
		default: return /* @__PURE__ */ V("p", {
			className: B(Zr, "h-auto whitespace-pre-wrap font-mono [overflow-wrap:anywhere]"),
			children: JSON.stringify(e)
		});
	}
	return /* @__PURE__ */ H("div", {
		className: "space-y-1",
		children: [/* @__PURE__ */ V(Z, {
			fields: p,
			values: m,
			onChange: (e, n) => t(h(e, n))
		}), e.do === "if" && /* @__PURE__ */ H(ze, { children: [
			/* @__PURE__ */ V("p", {
				className: "cms-label m-0 pt-1",
				children: D("Then")
			}),
			/* @__PURE__ */ V(Ss, {
				actions: e.then ?? [],
				onChange: (e) => t({ then: e }),
				variables: n,
				node: r,
				depth: i + 1
			}),
			/* @__PURE__ */ V("p", {
				className: "cms-label m-0 pt-1",
				children: D("Else")
			}),
			/* @__PURE__ */ V(Ss, {
				actions: e.else ?? [],
				onChange: (e) => t({ else: e }),
				variables: n,
				node: r,
				depth: i + 1
			})
		] })]
	});
}
// admin/src/builder/motion/presets.ts
var Ts = (e) => ({
	appear: D("Appear"),
	scroll: D("Scroll"),
	hover: D("Hover and Press"),
	loop: D("Loop"),
	load: D("Page Load"),
	event: D("On Event")
})[e], Es = "power3.out", Ds = () => [
	{
		name: D("Fade In"),
		group: "appear",
		make: () => ({
			trigger: { type: "appear" },
			steps: [{
				target: "self",
				from: { opacity: 0 },
				duration: .8,
				ease: Es
			}]
		})
	},
	{
		name: D("Fade Up"),
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
				ease: Es
			}]
		})
	},
	{
		name: D("Slide in from Left"),
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
				ease: Es
			}]
		})
	},
	{
		name: D("Scale In"),
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
		name: D("Blur In"),
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
				ease: Es
			}]
		})
	},
	{
		name: D("Reveal (Wipe Up)"),
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
		name: D("Children one by one"),
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
				ease: Es,
				stagger: .08
			}]
		})
	},
	{
		name: D("Words Rise"),
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
				ease: Es,
				stagger: .04
			}]
		})
	},
	{
		name: D("Words Slide Up (Masked)"),
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
		name: D("Parallax"),
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
		name: D("Zoom While Scrolling"),
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
		name: D("Fade Through"),
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
		name: D("Highlight Words"),
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
		name: D("Rotate While Scrolling"),
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
		name: D("Slide Sideways"),
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
		name: D("Lift"),
		group: "hover",
		make: () => ({
			trigger: { type: "hover" },
			steps: [{
				target: "self",
				to: { y: -6 },
				duration: .3,
				ease: Es
			}]
		})
	},
	{
		name: D("Grow"),
		group: "hover",
		make: () => ({
			trigger: { type: "hover" },
			steps: [{
				target: "self",
				to: { scale: 1.04 },
				duration: .35,
				ease: Es
			}]
		})
	},
	{
		name: D("Zoom Image Inside"),
		group: "hover",
		make: () => ({
			trigger: { type: "hover" },
			steps: [{
				target: "children",
				to: { scale: 1.06 },
				duration: .6,
				ease: Es
			}]
		})
	},
	{
		name: D("Press"),
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
		name: D("Float"),
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
		name: D("Spin"),
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
		name: D("Pulse"),
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
		name: D("Intro: Fade Up"),
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
				ease: Es,
				delay: .1
			}]
		})
	},
	{
		name: D("Intro: Words"),
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
				ease: Es,
				stagger: .05
			}]
		})
	},
	{
		name: D("Intro: Children"),
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
				ease: Es,
				stagger: .1
			}]
		})
	},
	{
		name: D("Open (Fade and Scale)"),
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
				ease: Es
			}]
		})
	},
	{
		name: D("Slide in Panel"),
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
				ease: Es,
				stagger: .05
			}]
		})
	}
], Os = () => ({
	appear: {
		label: D("Appear"),
		icon: "eye"
	},
	scroll: {
		label: D("Scroll"),
		icon: "mouse-scroll"
	},
	hover: {
		label: D("Hover"),
		icon: "hand-pointing"
	},
	press: {
		label: D("Press"),
		icon: "hand-tap"
	},
	load: {
		label: D("Page Load"),
		icon: "rocket"
	},
	loop: {
		label: D("Loop"),
		icon: "refresh"
	},
	event: {
		label: D("On Event"),
		icon: "broadcast"
	}
}), ks = () => ({
	opacity: D("Opacity"),
	x: D("Move X"),
	y: D("Move Y"),
	xPercent: D("Move X %"),
	yPercent: D("Move Y %"),
	z: D("Move Z"),
	scale: D("Scale"),
	scaleX: D("Scale X"),
	scaleY: D("Scale Y"),
	rotate: D("Rotate"),
	rotateX: D("Rotate X (3D)"),
	rotateY: D("Rotate Y (3D)"),
	skewX: D("Skew X"),
	skewY: D("Skew Y"),
	blur: D("Blur"),
	brightness: D("Brightness"),
	grayscale: D("Grayscale"),
	clipPath: D("Clip Path"),
	backgroundColor: D("Fill"),
	color: D("Text Color"),
	borderColor: D("Border Color"),
	borderRadius: D("Radius"),
	boxShadow: D("Shadow"),
	letterSpacing: D("Letter Spacing"),
	transformOrigin: D("Origin"),
	perspective: D("Perspective")
}), As = () => [
	{
		value: "power3.out",
		label: D("Smooth Out")
	},
	{
		value: "expo.out",
		label: D("Expo Out")
	},
	{
		value: "power4.inOut",
		label: D("Smooth In-Out")
	},
	{
		value: "power2.out",
		label: D("Gentle Out")
	},
	{
		value: "back.out(1.7)",
		label: D("Overshoot")
	},
	{
		value: "elastic.out(1, 0.4)",
		label: D("Elastic")
	},
	{
		value: "bounce.out",
		label: D("Bounce")
	},
	{
		value: "sine.inOut",
		label: D("Sine In-Out")
	},
	{
		value: "power2.in",
		label: D("Ease In")
	},
	{
		value: "none",
		label: D("Linear")
	},
	{
		value: "cubic-bezier(0.2, 0.8, 0.2, 1)",
		label: D("Signature Ease")
	}
], js = (e, t, n = {}) => ({
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
}), Ms = /^\d{1,5}(\.\d{1,2})?(px|rem|vh|svh|lvh|dvh)$/, Ns = [
	"vh",
	"svh",
	"lvh",
	"dvh",
	"px",
	"rem"
], Ps = (e, ...t) => e ? t : [], Fs = [
	"heading",
	"paragraph",
	"link",
	"button",
	"quote"
], Is = (e) => {
	let t = e.length + 1;
	for (; e.some((e) => e.id === `m${t}`);) t++;
	return `m${t}`;
}, Ls = (e = "self") => e.startsWith("#") ? D("Another Element") : {
	self: D("This Element"),
	children: D("Children"),
	words: D("Words"),
	lines: D("Lines||of text"),
	chars: D("Letters")
}[e] ?? e;
function Rs({ node: e }) {
	let { store: t } = a(), n = e.motion ?? [], [r, i] = N(n[0]?.id ?? null), o = (n) => t.updateNode(e.id, { motion: n.length ? n : void 0 }, `motion:${e.id}`), s = (e, t) => o(n.map((n) => n.id === e ? {
		...n,
		...t
	} : n)), c = Fs.includes(e.type), l = Os(), u = (t) => {
		let r = Is(n), a = t ? {
			id: r,
			name: t.name,
			...t.make()
		} : {
			id: r,
			name: D("Custom"),
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
		o([...n, a]), i(r), requestAnimationFrame(() => Zn.emit("preview-motion", {
			node: e.id,
			motion: a
		}));
	}, d = Ds(), f = [...new Set(d.map((e) => e.group))];
	return /* @__PURE__ */ V(Gr, {
		title: D("Animations"),
		empty: n.length === 0,
		actions: /* @__PURE__ */ V(L, {
			align: "end",
			trigger: /* @__PURE__ */ V(I, {
				icon: "plus",
				label: D("Add Animation"),
				size: "xs"
			}),
			items: [
				...f.flatMap((e) => [{
					label: Ts(e),
					heading: !0
				}, ...d.filter((t) => t.group === e && (!t.text || c)).map((e) => ({
					label: e.name,
					icon: l[e.make().trigger.type]?.icon,
					onSelect: () => u(e)
				}))]),
				{
					separator: !0,
					label: ""
				},
				{
					label: D("Custom Animation"),
					icon: "animated",
					onSelect: () => u()
				}
			]
		}),
		children: n.map((t) => /* @__PURE__ */ H("div", {
			className: B("rounded-sm border", r === t.id ? "border-border-strong" : "border-border"),
			children: [/* @__PURE__ */ H("div", {
				className: "flex h-8 items-center gap-1.5 pl-2 pr-1",
				children: [
					/* @__PURE__ */ V(F, {
						name: l[t.trigger.type]?.icon ?? "animated",
						size: 13,
						className: "shrink-0 text-muted"
					}),
					/* @__PURE__ */ H(P, {
						variant: "ghost",
						onClick: () => i(r === t.id ? null : t.id),
						"aria-expanded": r === t.id,
						className: "min-w-0 flex-1 shrink !justify-start !gap-1.5 !bg-transparent !px-0 text-left !text-xs",
						children: [/* @__PURE__ */ V("span", {
							className: "truncate font-medium text-ink",
							children: t.name || l[t.trigger.type]?.label
						}), /* @__PURE__ */ V("span", {
							className: "shrink-0 font-normal text-faint",
							children: l[t.trigger.type]?.label
						})]
					}),
					/* @__PURE__ */ V(ke, {
						content: D("Preview Animation"),
						children: /* @__PURE__ */ V(I, {
							icon: "play",
							label: D("Preview Animation"),
							title: void 0,
							size: "xs",
							onClick: () => Zn.emit("preview-motion", {
								node: e.id,
								motion: t
							})
						})
					}),
					/* @__PURE__ */ V(ti, {
						onClick: () => o(n.filter((e) => e.id !== t.id)),
						label: D("Remove Animation")
					})
				]
			}), r === t.id && /* @__PURE__ */ V(zs, {
				node: e,
				motion: t,
				onChange: (e) => s(t.id, e)
			})]
		}, t.id))
	});
}
function zs({ node: e, motion: t, onChange: n }) {
	let [r, i] = N(0), a = Os(), o = t.trigger, s = (e) => n({ trigger: {
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
		label: D("Name")
	}, {
		handle: "type",
		type: "select",
		size: "sm",
		label: D("Trigger"),
		required: !0,
		options: Object.entries(a).map(([e, t]) => ({
			value: e,
			label: t.label
		}))
	}], f = [
		...Ps(o.type === "appear", {
			handle: "start",
			type: "select",
			size: "sm",
			label: D("Starts"),
			placeholder: D("A little into view"),
			options: [
				{
					value: "top 95%",
					label: D("As soon as it peeks in")
				},
				{
					value: "top 85%",
					label: D("A little into view")
				},
				{
					value: "top 65%",
					label: D("A third into view")
				},
				{
					value: "center center",
					label: D("At the Center")
				}
			]
		}, {
			handle: "replay",
			type: "toggle",
			size: "sm",
			label: D("Reverse When Scrolled Back")
		}),
		...Ps(o.type === "scroll", {
			handle: "start",
			type: "select",
			size: "sm",
			label: D("Begins"),
			placeholder: D("Enters the Screen"),
			options: [
				{
					value: "top bottom",
					label: D("Enters the Screen")
				},
				{
					value: "top 80%",
					label: D("Top at 80%")
				},
				{
					value: "top center",
					label: D("Top at Center")
				},
				{
					value: "top top",
					label: D("Top at Top")
				},
				{
					value: "center center",
					label: D("Centered")
				}
			]
		}, {
			handle: "end",
			type: "select",
			size: "sm",
			label: D("Ends"),
			placeholder: D("Leaves the Screen"),
			options: [
				{
					value: "bottom top",
					label: D("Leaves the Screen")
				},
				{
					value: "center center",
					label: D("Centered")
				},
				{
					value: "top top",
					label: D("Top at Top")
				},
				{
					value: "bottom center",
					label: D("Bottom at Center")
				},
				{
					value: "bottom bottom",
					label: D("Bottom at Bottom")
				}
			]
		}, {
			handle: "pin",
			type: "text",
			component: "blocks-value",
			label: D("Pin Distance"),
			unit: "vh",
			units: Ns,
			step: 10,
			min: 0,
			max: 99999,
			placeholder: "0"
		}, js("scrub", D("Smoothing"), { max: 3 })),
		...Ps(l, {
			handle: "repeat",
			type: "select",
			display: "segmented",
			block: !0,
			size: "sm",
			label: D("Repeat||again"),
			required: !0,
			options: [
				{
					value: "0",
					label: D("Once")
				},
				{
					value: "1",
					label: D("Twice")
				},
				{
					value: "-1",
					label: D("Forever||repeat")
				}
			]
		}, {
			handle: "yoyo",
			type: "toggle",
			size: "sm",
			label: D("Back and Forth")
		}, {
			handle: "hold",
			type: "number",
			size: "sm",
			label: D("Loop as a Timeline, Resting (s)"),
			if: { repeat: "-1" }
		}),
		...Ps(o.type === "scroll" || o.type === "appear", {
			handle: "watch",
			type: "select",
			component: "blocks-node",
			label: D("Watch"),
			placeholder: D("This Element"),
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
		e === "name" ? n({ name: t ?? "" }) : e === "type" ? t && s({ type: t }) : e === "start" || e === "end" ? s({ [e]: t ?? void 0 }) : e === "pin" ? s({ pin: typeof t == "string" && Ms.test(t.trim()) && parseFloat(t) > 0 ? t.trim() : void 0 }) : e === "scrub" ? s({ scrub: parseFloat(t) > 0 ? Math.min(3, Math.max(.05, parseFloat(t))) : void 0 }) : e === "replay" ? s({ once: !t && void 0 }) : e === "repeat" ? n({ repeat: Number(t ?? 0) }) : e === "yoyo" ? n({ yoyo: t || void 0 }) : e === "hold" ? n({ hold: t === "" || t == null ? void 0 : Number(t) }) : e === "watch" && s({ node: t ? `#${t}` : void 0 });
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
	return /* @__PURE__ */ H("div", {
		className: "space-y-2 border-t border-border p-2",
		children: [
			/* @__PURE__ */ V(Z, {
				fields: [...d, ...f],
				values: m,
				onChange: h
			}),
			/* @__PURE__ */ H("div", {
				className: "flex min-h-7 items-center",
				children: [/* @__PURE__ */ V(Jr, { field: {
					handle: "on",
					type: "select",
					label: D("Plays On")
				} }), /* @__PURE__ */ V("div", {
					role: "group",
					"aria-label": D("Plays On"),
					className: "flex gap-0.5",
					children: [
						[
							"desktop",
							"monitor",
							D("Desktop")
						],
						[
							"tablet",
							"tablet",
							D("Tablet")
						],
						[
							"mobile",
							"phone",
							D("Phone")
						]
					].map(([e, t, r]) => /* @__PURE__ */ V(I, {
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
			o.type === "event" && /* @__PURE__ */ H("p", {
				className: "m-0 flex h-7 items-center gap-2 text-xs",
				children: [/* @__PURE__ */ V("span", {
					className: "w-[88px] shrink-0 text-muted",
					children: D("Animation ID")
				}), /* @__PURE__ */ V("code", {
					className: "select-all font-mono text-text",
					children: t.id
				})]
			}),
			/* @__PURE__ */ V(Hs, {
				steps: t.steps,
				active: u,
				onSelect: i,
				onChange: c,
				onAdd: g
			}),
			t.steps[u] && /* @__PURE__ */ V(Us, {
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
function Bs(e) {
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
var Vs = (e) => Math.max(0, Math.round(e * 20) / 20);
function Hs({ steps: e, active: t, onSelect: n, onChange: r, onAdd: i }) {
	let a = Bs(e), o = Math.max(.5, ...a.map((e) => e.start + e.duration + e.spread)), s = M(null), c = s.current?.total ?? Math.ceil(o * 2 + .25) / 2, l = c <= 1.5 ? .25 : c <= 4 ? .5 : c <= 10 ? 1 : 2, u = Array.from({ length: Math.floor(c / l) + 1 }, (e, t) => t * l), d = (e) => `${e / c * 100}%`, f = (t, i, a) => {
		t.preventDefault(), t.stopPropagation(), n(i);
		let o = t.currentTarget.closest("[data-track]");
		if (!o) return;
		s.current = {
			total: c,
			width: o.clientWidth
		};
		let l = t.clientX, u = e[i], d = a === "move" ? u.at === void 0 ? u.delay ?? 0 : u.at : u.duration ?? .6, f = (e) => {
			let t = (e.clientX - l) / s.current.width * s.current.total;
			a === "end" ? r(i, { duration: Math.max(.05, Vs(d + t)) }) : u.at === void 0 ? r(i, { delay: Vs(d + t) || void 0 }) : r(i, { at: Vs(d + t) });
		}, p = () => {
			window.removeEventListener("pointermove", f), window.removeEventListener("pointerup", p), s.current = null;
		};
		window.addEventListener("pointermove", f), window.addEventListener("pointerup", p);
	};
	return /* @__PURE__ */ H("div", {
		className: "rounded-md bg-active/60 py-1.5",
		children: [
			/* @__PURE__ */ H("div", {
				className: "mb-1 flex items-end pr-2",
				children: [/* @__PURE__ */ V("span", {
					className: "w-24 shrink-0 pl-2 text-2xs font-medium text-faint",
					children: D("Timeline")
				}), /* @__PURE__ */ V("div", {
					className: "relative h-3 flex-1",
					children: u.filter((e, t) => u.length <= 5 || t % 2 == 0).map((e) => /* @__PURE__ */ V("span", {
						className: "absolute -translate-x-1/2 font-mono text-2xs leading-none text-faint first:translate-x-0 last:-translate-x-full",
						style: { left: d(e) },
						children: e === 0 ? "0" : `${e}s`
					}, e))
				})]
			}),
			e.map((e, i) => {
				let o = a[i];
				return /* @__PURE__ */ H("div", {
					className: B("flex h-7 items-center pr-2", i === t && "bg-focus-soft"),
					children: [/* @__PURE__ */ V(P, {
						variant: "ghost",
						size: "xs",
						onClick: () => n(i),
						className: B("w-24 !justify-start !bg-transparent !pl-2 !pr-0 text-left !text-2xs", i === t ? "!font-medium !text-ink" : "!font-normal !text-muted hover:!text-text"),
						children: /* @__PURE__ */ V("span", {
							className: "truncate",
							children: Ls(e.target)
						})
					}), /* @__PURE__ */ H("div", {
						"data-track": !0,
						className: "relative h-full flex-1",
						children: [
							u.map((e) => /* @__PURE__ */ V("span", {
								className: "absolute inset-y-0 w-px bg-border/70",
								style: { left: d(e) }
							}, e)),
							/* @__PURE__ */ H("div", {
								role: "slider",
								tabIndex: 0,
								"aria-label": D("Step {n}", { n: i + 1 }),
								"aria-valuenow": o.start,
								"aria-valuetext": D("Starts at {start}s, runs {duration}s", {
									start: o.start.toFixed(2),
									duration: o.duration.toFixed(2)
								}),
								onPointerDown: (e) => f(e, i, "move"),
								onKeyDown: (t) => {
									if (t.key !== "ArrowLeft" && t.key !== "ArrowRight") return;
									t.preventDefault();
									let n = t.key === "ArrowRight" ? .05 : -.05;
									t.shiftKey ? r(i, { duration: Math.max(.05, Vs((e.duration ?? .6) + n)) }) : e.at === void 0 ? r(i, { delay: Vs((e.delay ?? 0) + n) || void 0 }) : r(i, { at: Vs(e.at + n) });
								},
								className: B("cms-focus-ring group/bar absolute top-1 flex h-4 cursor-grab items-center rounded-xs active:cursor-grabbing", i === t ? "bg-focus" : "bg-focus/50 hover:bg-focus/70"),
								style: {
									left: d(o.start),
									width: `max(6px, ${d(o.duration)})`
								},
								children: [/* @__PURE__ */ H("span", {
									className: "pointer-events-none truncate px-1 font-mono text-2xs leading-none text-white",
									children: [o.duration.toFixed(1), "s"]
								}), /* @__PURE__ */ V("span", {
									onPointerDown: (e) => f(e, i, "end"),
									className: "absolute -right-1 inset-y-0 w-2 cursor-ew-resize",
									"aria-hidden": !0
								})]
							}),
							o.spread > 0 && /* @__PURE__ */ V("span", {
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
			/* @__PURE__ */ V($r, {
				size: "xs",
				onClick: i,
				className: "ml-24 mt-0.5 !w-auto",
				children: D("Add Step")
			})
		]
	});
}
function Us({ node: e, step: t, index: n, count: r, onChange: i, onRemove: o }) {
	let { catalog: s } = a(), c = X(), l = c.of("color").find((e) => !/-\d+$/.test(e.name) && e.name !== "black" && e.name !== "white")?.ref ?? "currentColor", u = t.target ?? "self", d = ks(), f = Object.keys(s.motion?.properties ?? d), p = Fs.includes(e.type), m = (e) => {
		let n = t[e] ?? {}, r = (t, r) => i({ [e]: {
			...n,
			[t]: /^-?[\d.]+$/.test(r) ? Number(r) : r
		} });
		return /* @__PURE__ */ H("div", {
			className: "space-y-1",
			children: [
				/* @__PURE__ */ H("div", {
					className: "flex h-7 items-center justify-between",
					children: [/* @__PURE__ */ V("span", {
						className: "text-xs font-medium text-muted",
						children: D(e === "from" ? "From" : "To||end value")
					}), /* @__PURE__ */ V(L, {
						align: "end",
						trigger: /* @__PURE__ */ V(I, {
							icon: "plus",
							label: D(e === "from" ? "Add a Start Property" : "Add an End Property"),
							size: "xs"
						}),
						items: f.filter((e) => !(e in n)).map((e) => ({
							label: d[e] ?? e,
							onSelect: () => r(e, s.motion.properties[e] === "css" ? e === "clipPath" ? "inset(0% 0% 0% 0%)" : l : e === "opacity" || e.startsWith("scale") ? "1" : "0")
						}))
					})]
				}),
				Object.keys(n).length === 0 && /* @__PURE__ */ V("p", {
					className: "m-0 text-2xs text-faint",
					children: D(e === "from" ? "As it looks now" : "As Designed")
				}),
				/* @__PURE__ */ V(Z, {
					bare: !0,
					fields: [{
						handle: e,
						type: "json",
						component: "blocks-pairs",
						className: "items-start",
						label: D(e === "from" ? "From" : "To||end value"),
						labels: d,
						item: {
							handle: "value",
							type: "text",
							component: "blocks-value",
							label: D("Value"),
							unit: ""
						},
						items: Object.fromEntries(Object.keys(n).map((e) => [e, {
							handle: "value",
							type: "text",
							component: "blocks-value",
							label: D("Value"),
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
	return /* @__PURE__ */ H("div", {
		className: "space-y-2",
		children: [
			/* @__PURE__ */ H("div", {
				className: "flex h-7 items-center gap-1",
				children: [
					/* @__PURE__ */ V("span", {
						className: "text-xs font-semibold text-text",
						children: r > 1 ? D("Step {n}", { n: n + 1 }) : D("Animate")
					}),
					/* @__PURE__ */ V("span", { className: "flex-1" }),
					r > 1 && /* @__PURE__ */ V(ti, {
						onClick: o,
						label: D("Remove Step")
					})
				]
			}),
			/* @__PURE__ */ V(Z, {
				fields: [
					{
						handle: "target",
						type: "select",
						size: "sm",
						label: D("Target"),
						required: !0,
						options: [
							{
								value: "self",
								label: D("This Element")
							},
							{
								value: "children",
								label: D("Each Child in Turn")
							},
							...p ? [
								{
									value: "words",
									label: D("Each Word")
								},
								{
									value: "lines",
									label: D("Each Line")
								},
								{
									value: "chars",
									label: D("Each Letter")
								}
							] : [],
							{
								value: "other",
								label: D("Another Element")
							}
						]
					},
					...Ps(u.startsWith("#"), {
						handle: "element",
						type: "select",
						component: "blocks-node",
						label: D("Element")
					}),
					...Ps(u === "words" || u === "chars", {
						handle: "mask",
						type: "toggle",
						size: "sm",
						label: D("Rise from Behind a Line")
					})
				],
				values: {
					target: u.startsWith("#") ? "other" : u,
					element: u.slice(1),
					mask: !!t.mask
				},
				onChange: (t, n) => i(t === "mask" ? { mask: n || void 0 } : { target: t === "target" ? n === "other" ? `#${e.id}` : n ?? "self" : n ? `#${n}` : "self" })
			}),
			m("from"),
			m("to"),
			/* @__PURE__ */ V(Z, {
				fields: [
					js("duration", D("Duration")),
					js("delay", D("Delay")),
					...Ps(u !== "self", js("stagger", D("Stagger"), { step: .01 })),
					...Ps(r > 1, js("at", D("Starts At||time"), { placeholder: D("After") })),
					{
						handle: "ease",
						type: "text",
						component: "ease",
						label: D("Ease"),
						placeholder: D("Smooth Out"),
						options: [...c.of("ease").map((e) => ({
							value: e.ref,
							label: e.name,
							curve: e.value
						})), ...As()]
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
var Ws = [
	"content",
	"design",
	"interact"
], Gs = "cms.block.tab";
function Ks(e) {
	if (!e.scrollTop) return null;
	let t = e.getBoundingClientRect().top, n = [...e.querySelectorAll("[data-section]")].find((e) => e.getBoundingClientRect().bottom > t);
	return {
		section: n?.dataset.section,
		offset: n ? n.getBoundingClientRect().top - t : 0,
		scrollTop: e.scrollTop
	};
}
function qs(e, t) {
	let n = t.section && e.querySelector(`[data-section="${CSS.escape(t.section)}"]`);
	n ? e.scrollTop += n.getBoundingClientRect().top - e.getBoundingClientRect().top - t.offset : e.scrollTop = t.scrollTop;
}
function Js() {
	try {
		let e = sessionStorage.getItem(Gs);
		return Ws.find((t) => t === e) ?? "content";
	} catch {
		return "content";
	}
}
function Ys({ node: e, onBack: n, backLabel: r, onClose: i }) {
	let { store: o, types: s, allowed: c, readOnly: u } = a(), d = s.get(e.type), f = t(), [p, m] = N(Js), h = `block-inspector-${ge()}`, [g, _] = N(!1), v = M(null), y = M(e.id), b = M(null);
	y.current !== e.id && (y.current = e.id, b.current = v.current && Ks(v.current)), _e(() => {
		v.current && b.current && qs(v.current, b.current), b.current = null;
	}, [e.id]);
	let x = (e) => {
		try {
			sessionStorage.setItem(Gs, e);
		} catch {}
		m(e);
	}, te = !u && e.type !== "component" && E("entries.components.create");
	return /* @__PURE__ */ H("div", {
		className: "flex h-full min-h-0 min-w-0 flex-col",
		"data-blocks-inspector": !0,
		children: [
			/* @__PURE__ */ V(Ce, {
				bordered: !1,
				onBack: n,
				backLabel: r,
				onClose: i,
				icon: e.type === "component" ? "symbol" : d?.icon ?? "square",
				actions: /* @__PURE__ */ V(L, {
					align: "end",
					trigger: /* @__PURE__ */ V(I, {
						icon: "more",
						label: D("Block Actions"),
						size: "sm"
					}),
					items: [
						{
							label: D("Rename"),
							icon: "edit",
							disabled: u,
							onSelect: () => _(!0)
						},
						{
							label: D("Duplicate"),
							icon: "copy",
							shortcut: "mod+d",
							disabled: u,
							onSelect: () => o.duplicate(e.id)
						},
						te && ee(o, s, c) && {
							label: D("Make a Component"),
							icon: "symbol",
							onSelect: () => {
								o.selection().includes(e.id) || o.select(e.id), Qt(o);
							}
						},
						!u && E("entries.patterns.create") && {
							label: D("Save as Pattern"),
							icon: "section-copy",
							onSelect: () => {
								o.selection().includes(e.id) || o.select(e.id), $t(o);
							}
						},
						{
							label: D("Copy ID"),
							icon: "hash",
							onSelect: () => void Ae(e.id, { copied: D("Copied {reference}", { reference: e.id }) })
						},
						{
							separator: !0,
							label: ""
						},
						{
							label: D("Delete"),
							icon: "trash",
							shortcut: "⌫",
							danger: !0,
							disabled: u,
							onSelect: () => o.remove(e.id)
						}
					]
				}),
				children: g ? /* @__PURE__ */ V("div", {
					className: "min-w-0 flex-1 pl-1",
					onBlur: () => _(!1),
					onKeyUp: (e) => e.key === "Escape" && e.target.blur(),
					children: /* @__PURE__ */ V(Z, {
						bare: !0,
						fields: [{
							handle: "label",
							type: "text",
							size: "sm",
							commit: "blur",
							label: D("Name"),
							autofocus: !0,
							placeholder: d?.title
						}],
						values: { label: e.label ?? "" },
						onChange: (t, n) => o.updateNode(e.id, { label: n.trim() || void 0 })
					})
				}) : /* @__PURE__ */ V(P, {
					variant: "ghost",
					onDoubleClick: () => !u && _(!0),
					className: "min-w-0 flex-1 shrink !justify-start !bg-transparent !pl-1 !pr-0 text-left !font-medium !text-ink",
					title: u ? void 0 : D("Double-Click to Rename"),
					children: /* @__PURE__ */ V("span", {
						className: "truncate",
						children: l(e, s, f)
					})
				})
			}),
			/* @__PURE__ */ V("div", {
				className: "flex h-10 shrink-0 items-center gap-2 border-b border-border pl-4 pr-3",
				children: /* @__PURE__ */ V(Oe, {
					id: h,
					value: p,
					onChange: x,
					bordered: !1,
					size: "sm",
					className: "h-full min-w-0 flex-1",
					tabs: Ws.map((e) => ({
						value: e,
						label: {
							content: D("Content"),
							design: D("Design"),
							interact: D("Interact")
						}[e]
					}))
				})
			}),
			/* @__PURE__ */ V("fieldset", {
				ref: v,
				role: "tabpanel",
				id: `${h}-${p}-panel`,
				"aria-labelledby": `${h}-${p}`,
				disabled: u || !d && e.type !== "component",
				className: "m-0 min-h-0 min-w-0 flex-1 overflow-y-auto border-0 p-0",
				children: /* @__PURE__ */ H(de, { children: [
					p === "design" && /* @__PURE__ */ V(is, { node: e }),
					p === "content" && /* @__PURE__ */ V(ca, { node: e }),
					p === "interact" && /* @__PURE__ */ H(ze, { children: [/* @__PURE__ */ V(Rs, { node: e }), /* @__PURE__ */ V(ys, { node: e })] })
				] }, e.id)
			})
		]
	});
}
export { yr as $, Di as A, G as At, _i as B, Ii as C, yt as Ct, Mi as D, Qe as Dt, Li as E, it as Et, yi as F, He as Ft, Gr as G, Z as H, ui as I, Ue as It, kr as J, Zr as K, Ei as L, W as Lt, hi as M, nt as Mt, vi as N, qe as Nt, mi as O, Ye as Ot, ki as P, Ke as Pt, br as Q, bi as R, Ki as S, ht as St, Pi as T, ot as Tt, ti as U, ei as V, Jr as W, Tr as X, Cr as Y, vr as Z, pa as _, vt as _t, bo as a, ur as at, Vi as b, dt as bt, fo as c, nr as ct, La as d, Zn as dt, xr as et, Na as f, qt as ft, ma as g, Lt as gt, ha as h, Ut as ht, zo as i, sr as it, gi as j, Je as jt, Oi as k, K as kt, uo as l, er as lt, Ma as m, Wt as mt, ns as n, lr as nt, _o as o, Qn as ot, ka as p, Kt as pt, Ir as q, rs as r, cr as rt, wo as s, rr as st, Ys as t, dr as tt, co as u, $n as ut, $i as v, pt as vt, Ri as w, X as wt, Bi as x, wt as xt, ea as y, ft as yt, ci as z };
