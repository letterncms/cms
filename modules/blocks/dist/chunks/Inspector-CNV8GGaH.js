import { c as e, f as t, i as n, n as r, o as i, p as a, r as o, s, t as c, u as l } from "./Inserter-CfdoRD1B.js";
import { a as u, c as d, d as f, f as p, g as m, h, i as g, l as _, m as v, n as y, o as b, p as x, r as S, t as C, u as w, v as T, y as E } from "./insert-DZPaXAR2.js";
import { Link as D, can as ee, getManifest as te, invalidate as ne, navigate as re, plural as ie, registry as ae, requestText as oe, run as O, t as k, useAbility as A, useManifest as se, useManifestIfLoaded as ce } from "@letterncms/sdk";
import { Fragment as j, createContext as le, createElement as ue, forwardRef as M, memo as de, useCallback as fe, useContext as pe, useEffect as N, useId as me, useLayoutEffect as he, useMemo as ge, useRef as P, useState as F, useSyncExternalStore as _e } from "react";
import { Button as I, Dialog as ve, Fields as ye, Icon as L, IconButton as R, Menu as z, NEW_COLOR as be, NoMatches as xe, Notice as Se, PanelHeader as Ce, Popover as we, Pressable as B, QueryError as Te, Segmented as Ee, Spinner as De, Tabs as Oe, Tooltip as ke, cn as V, copyText as Ae, deviceWidths as je, fieldControlId as Me, fieldVisible as Ne, prompt as Pe, slugify as Fe, toast as H, useShortcutLabel as Ie, wideFieldTypes as Le } from "@letterncms/ui";
import { Fragment as U, jsx as W, jsxs as G } from "react/jsx-runtime";
import { createPortal as Re, flushSync as ze } from "react-dom";
import { createRoot as Be } from "react-dom/client";
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
		this.commit(w(r, n.parentId, n.index, e)), this.set({
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
		this.commit(T(this.state.nodes, e, (e) => ({
			...e,
			props: {
				...e.props,
				...t
			}
		})), n || `props:${e}`);
	}
	updateNode(e, t, n = "") {
		this.commit(T(this.state.nodes, e, (e) => ({
			...e,
			...t
		})), n);
	}
	insert(e, t, n) {
		this.commit(w(this.state.nodes, e, t, n));
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
		}).length, o = w(e.reduce((e, t) => h(e, t), r), t, n - a, i);
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
		this.commit(w(h(this.state.nodes, e), r.parentId, r.index, [i])), this.select(i.id);
	}
	unwrap(e) {
		let t = d(this.state.nodes, e), n = p(this.state.nodes, e);
		t && n && t.children && this.commit(w(h(this.state.nodes, e), n.parentId, n.index, t.children));
	}
};
function He(e) {
	if (!e.selected) return [];
	if (!e.head) return [e.selected];
	let t = p(e.nodes, e.selected);
	if (!t) return [e.selected];
	let n = m(e.nodes, t.parentId), r = n.findIndex((t) => t.id === e.selected), i = n.findIndex((t) => t.id === e.head);
	return i < 0 ? [e.selected] : n.slice(Math.min(r, i), Math.max(r, i) + 1).map((e) => e.id);
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
	let n = P(null);
	return _e(e.subscribe, () => {
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
	let r = P(t);
	r.current = t;
	let [i] = F(() => new Ve(We(Array.isArray(e) ? e : [], E), (e) => r.current(e), n)), a = P(e);
	return i.setReadOnly(n), N(() => {
		if (a.current === e) return;
		a.current = e;
		let t = We(Array.isArray(e) ? e : [], E);
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
function Y(e, t) {
	if (e in t) return { from: t[e] };
	let n = /^(min|max)-(?:\[(.+)\]|(.+))$/.exec(e);
	if (!n) return null;
	let r = n[2] === void 0 ? n[3] in t ? t[n[3]] : null : it(n[2]);
	return r === null ? null : n[1] === "min" ? { from: r } : { below: r };
}
var at = class e {
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
			let t = Y(e, this.screen.sizes);
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
				if (o === void 0 || ot(o)) return;
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
		if (J(n.filter((e) => !Y(e, this.screen.sizes))) !== J(this.state)) return this.variants;
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
function ot(e) {
	if (!e.startsWith("var(--tw-")) return !1;
	let t = 0;
	for (let n = 0; n < e.length; n++) if (e[n] === "(") t++;
	else if (e[n] === ")" && --t === 0) return n === e.length - 1;
	return !1;
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
var st = (e, t) => /[ \t]*$/.exec(e.slice(0, t))[0], ct = [
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
], lt = ":root, [data-theme]", ut = (e) => `.cms-prose ${e}:where(:not(.cms-box, .cms-repeat))`, dt = {
	spacing: ".cms-prose",
	h2: ut("h2"),
	h3: ut("h3"),
	p: ut("p"),
	li: ".cms-prose :where(ul:not(.cms-box, .cms-repeat), ol:not(.cms-box, .cms-repeat)) > li",
	blockquote: ut("blockquote"),
	figure: ut("figure"),
	a: ut("a")
}, ft = {
	base: [...ct, lt],
	components: Object.values(dt)
}, pt = "color|font(?!-weight-)|text(?!-shadow-)|tracking|leading|breakpoint|container|spacing|radius|shadow|inset-shadow|drop-shadow|text-shadow|blur|perspective|ease|animate|duration|control", mt = RegExp(`^--(?:(?:${pt})-(?!.*--)[a-z0-9][\\w.-]*|spacing|default-transition-duration|default-transition-timing-function)$`), ht = RegExp(`^--(?:(?:${pt})-)?\\*$`), gt = (e) => mt.test(e);
function _t(e) {
	let t = new yt(e);
	return X(e).filter((e) => e.inner && /^@theme\b/.test(e.prelude)).flatMap((e) => t.declarationsOf(e));
}
function vt(e) {
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
var yt = class e {
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
		let a = this.declarations(i).filter((t) => bt(t.name) === bt(e));
		if (n === "first" && a[0]) return this.splice(a[0].start, a[0].start, `${e}: ${t};\n${st(this.css, a[0].start)}`);
		let o = a[a.length - 1];
		if (o) {
			let n = this.css.indexOf("\n", o.end), r = n === -1 || n > i.inner[1] ? o.end : n;
			return this.splice(r, r, `\n${st(this.css, o.start)}${e}: ${t};`);
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
		return X(this.css).filter((e) => /^@utility\s/.test(e.prelude) && e.inner).map((e) => this.rule(e.prelude.replace(/^@utility\s+/, ""), e));
	}
	setUtility(e, t) {
		let n = X(this.css).find((t) => t.prelude === `@utility ${e}`);
		return n ? this.setApply(n, t) : this.append(`@utility ${e} {\n  @apply ${t.join(" ")};\n}`);
	}
	removeUtility(e) {
		let t = X(this.css).find((t) => t.prelude === `@utility ${e}`);
		return t ? this.remove(t) : this;
	}
	renameUtility(e, t) {
		let n = X(this.css).find((t) => t.prelude === `@utility ${e}`);
		return n ? this.splice(n.start, n.start + n.prelude.length, `@utility ${t}`) : this;
	}
	duplicateUtility(e, t) {
		let n = X(this.css).find((t) => t.prelude === `@utility ${e}`);
		if (!n) return this;
		let r = this.css.slice(n.start + n.prelude.length, n.end);
		return this.splice(n.end, n.end, `\n\n@utility ${t}${r}`);
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
			let s = `${st(i.css, t.start)}  `, c = a[a.length - 1], l = X(i.css, ...t.inner)[0];
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
			let n = st(this.css, e);
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
				!t.inner && n && (mt.test(n) || ht.test(n) && /:\s*initial\s*$/.test(t.prelude)) || e.push([this.leading(t.start), t.end]);
			}
			else if (i.inner && (i.prelude === "@layer base" || i.prelude === "@layer components")) {
				let e = i.prelude.slice(7);
				for (let r of X(this.css, ...i.inner)) r.inner && ft[e].includes(r.prelude.replace(/\s+/g, " ")) || (n.includes(e) || n.push(e), t[e].push([this.leading(r.start), r.end]));
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
		let r = st(this.css, e);
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
		return a ? this.insertLast(a, `${st(this.css, a.start)}  ${t}: ${n};`) : this.splice(i.inner[0], i.inner[0], `\n  ${e} {\n    ${t}: ${n};\n  }`);
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
			let t = `${st(this.css, e.start)}  `;
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
		return this.splice(r - i, r, `\n${t}\n${st(this.css, e.start)}`);
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
function bt(e) {
	return /^--(font-weight|inset-shadow|drop-shadow|text-shadow|[a-z]+)/.exec(e)?.[0] ?? e;
}
// admin/src/core/styling.tsx
var xt = (e) => `${e.css}\u0000${JSON.stringify(e.files)}`, St = /* @__PURE__ */ new Map(), Ct = /* @__PURE__ */ new Map(), wt = /* @__PURE__ */ new Map();
function Tt(e, t, n) {
	e.set(t, n);
	for (let t of [...e.keys()].slice(0, -2)) e.delete(t);
	return n;
}
function Et(e) {
	let t = xt(e);
	return St.get(t) ?? Tt(St, t, import("./compile-DqDc4wGx.js").then(({ designSystem: t }) => t(e)).then((e) => new Ze(e)).catch((e) => (console.error("[cms] The stylesheet could not be read.", e), null)).then((e) => Tt(Ct, t, e)));
}
function Dt() {
	return import("./defaults-CmMT1zYT.js").then((e) => e.default);
}
function Ot(e) {
	let t = xt(e);
	return wt.get(t) ?? Tt(wt, t, import("./compile-DqDc4wGx.js").then(({ compiler: t }) => t(e)));
}
function kt(e, t, n) {
	let r = Object.fromEntries(n.map((e) => [e.name, e.width]));
	if (e === "desktop") return {
		variant: "",
		width: t,
		sizes: r
	};
	let i = n.findIndex((e) => e.width > je.tablet), a = n[i === -1 ? n.length - 1 : i], o = n[(i === -1 ? n.length - 1 : i) - 1], s = e === "tablet" ? a : o ?? a;
	return {
		variant: s ? `max-${s.name}` : "",
		width: je[e],
		sizes: r
	};
}
function At(e) {
	let t = parseFloat(e);
	return Number.isNaN(t) ? 0 : /r?em$/.test(e.trim()) ? t * 16 : t;
}
function jt(e) {
	let t = e ? xt(e) : "", [, n] = F(0);
	return N(() => {
		if (!e || Ct.has(t)) return;
		let r = !0;
		return Et(e).then(() => r && n((e) => e + 1)), () => {
			r = !1;
		};
	}, [t]), {
		engine: e && Ct.get(t) || null,
		loading: !!e && !Ct.has(t)
	};
}
function Mt(e, t, n) {
	return {
		engine: e,
		breakpoints: e ? e.tokens("breakpoint").map((e) => ({
			name: e.name,
			width: At(e.value)
		})).filter((e) => e.width > 0).sort((e, t) => e.width - t.width) : [],
		classes: t ? It(t.css) : [],
		source: t,
		loading: n
	};
}
var Nt = le(null);
function Pt({ source: e, children: t }) {
	let { engine: n, loading: r } = jt(e), i = ge(() => Mt(n, e, r), [
		n,
		e,
		r
	]);
	return /* @__PURE__ */ W(Nt.Provider, {
		value: i,
		children: t
	});
}
function Ft() {
	let e = pe(Nt), t = A("styling/source", {}, {
		staleTime: 6e4,
		retry: !1,
		enabled: !e
	}), n = e ? void 0 : t.data, { engine: r, loading: i } = jt(n), a = ge(() => Mt(r, n, t.isLoading || i), [
		r,
		n,
		t.isLoading,
		i
	]);
	return e ?? a;
}
function It(e) {
	try {
		return new yt(e).utilities().map((e) => e.name).filter((e) => /^[\w-]+$/.test(e));
	} catch {
		return [];
	}
}
function Lt() {
	let { engine: e } = Ft();
	return ge(() => Vt(e), [e]);
}
var Rt = [
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
], zt = {
	of: () => [],
	find: () => null,
	resolve: (e) => e
}, Bt = /* @__PURE__ */ new WeakMap();
function Vt(e) {
	if (!e) return zt;
	let t = Bt.get(e);
	return t || Bt.set(e, t = Ht(e)), t;
}
function Ht(e) {
	let t = /* @__PURE__ */ new Map(), n = (n) => {
		let r = t.get(n);
		return r || t.set(n, r = e.tokens(n)), r;
	}, r = null;
	return {
		of: n,
		find: (e) => {
			let t = typeof e == "string" ? tt(e) : null;
			if (!t) return null;
			r ??= new Map(Rt.flatMap((e) => n(e)).map((e) => [e.variable, e]));
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
function Ut(e = document) {
	return e.getSelection()?.isCollapsed ?? !0;
}
function Wt(e, t) {
	let n = e.ownerDocument.getSelection();
	if (!n || n.rangeCount === 0) return null;
	let r = n.getRangeAt(0);
	if (!e.contains(r.startContainer)) return null;
	let i = e.ownerDocument.createRange();
	return i.selectNodeContents(e), t ? i.setEnd(r.startContainer, r.startOffset) : i.setStart(r.endContainer, r.endOffset), i;
}
function Gt(e) {
	return e ? e.toString().replace(/​/g, "") : "";
}
function Kt(e) {
	return Ut(e.ownerDocument) && Gt(Wt(e, !0)) === "" && !Jt(Wt(e, !0)).includes("<br");
}
function qt(e) {
	return Ut(e.ownerDocument) && Gt(Wt(e, !1)) === "";
}
function Jt(e) {
	if (!e) return "";
	let t = e.startContainer.ownerDocument.createElement("div");
	return t.appendChild(e.cloneContents()), t.innerHTML;
}
function Yt(e) {
	return Gt(Wt(e, !0)).length;
}
function Xt(e) {
	let t = Wt(e, !0), n = Wt(e, !1);
	return [Jt(t), Jt(n)];
}
function Zt(e) {
	let t = en(e.ownerDocument);
	return !t || t.top - e.getBoundingClientRect().top < $t(e) * .8;
}
function Qt(e) {
	let t = en(e.ownerDocument);
	return !t || e.getBoundingClientRect().bottom - t.bottom < $t(e) * .8;
}
function $t(e) {
	let t = parseFloat(e.ownerDocument.defaultView.getComputedStyle(e).lineHeight);
	return Number.isFinite(t) ? t : 20;
}
function en(e = document) {
	let t = e.getSelection();
	if (!t || t.rangeCount === 0) return null;
	let n = t.getRangeAt(0).cloneRange(), r = n.getClientRects();
	if (r.length > 0) return r[0];
	let i = e.createElement("span");
	i.textContent = "​", n.insertNode(i);
	let a = i.getBoundingClientRect();
	return i.remove(), a;
}
function tn(e, t) {
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
function nn(e) {
	let t = document.createElement("div");
	return t.innerHTML = e, (t.textContent ?? "").length;
}
function rn(e) {
	return e.replace(/\u200B/g, "").replace(/<(\/?)strike>/g, "<$1s>").replace(/<(\/?)b>/g, "<$1strong>").replace(/<(\/?)i>/g, "<$1em>").replace(/<div><br><\/div>/g, "<br>").replace(/<\/?(div|p|span)[^>]*>/g, "").replace(/ style="[^"]*"/g, "").replace(/&nbsp;/g, " ").replace(/<br>$/, "");
}
var an = [
	["**", "strong"],
	["__", "strong"],
	["~~", "s"],
	["`", "code"],
	["*", "em"],
	["_", "em"]
];
function on(e = document) {
	let t = e.getSelection();
	if (!t || !t.isCollapsed || t.rangeCount === 0) return !1;
	let n = t.anchorNode;
	if (!n || n.nodeType !== Node.TEXT_NODE || n.parentElement?.closest("code")) return !1;
	let r = t.anchorOffset, i = (n.textContent ?? "").slice(0, r);
	for (let [a, o] of an) {
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
function sn() {
	let { store: e } = a(), t = K(e, (e) => e.nodes), n = /* @__PURE__ */ new Map(), r = [];
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
function cn({ html: e, onChange: t, tag: n = "div", placeholder: r, className: i = "", focus: a, onKeyDown: o, onFocus: s, onPaste: c, disabled: l, singleLine: u, quiet: d, plainText: f }) {
	let p = P(null), m = P(e);
	he(() => {
		let t = p.current;
		t && (t.ownerDocument.activeElement === t ? m.current = e : (rn(t.innerHTML) !== e && (t.innerHTML = e), m.current = rn(t.innerHTML)));
	}, [e]), he(() => {
		a && p.current && tn(p.current, a.at);
	}, [a?.nonce]);
	let h = () => {
		let e = p.current;
		e && (e.spellcheck = !parseFloat(e.ownerDocument.defaultView?.getComputedStyle(e).webkitTextStrokeWidth ?? "0"));
	}, g = () => {
		let e = p.current;
		if (!e) return;
		let n = rn(e.innerHTML);
		n !== m.current && (m.current = n, t(n, e));
	};
	return ue(n, {
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
			!f && t.inputType === "insertText" && t.data && /[*_~`]/.test(t.data) && on(e.currentTarget.ownerDocument), g();
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
			}[e.key.toLowerCase()]), g()) : n && e.shiftKey && e.key.toLowerCase() === "x" ? (e.preventDefault(), t.execCommand("strikeThrough"), g()) : n && e.key.toLowerCase() === "k" ? (e.preventDefault(), e.stopPropagation(), p.current?.ownerDocument.dispatchEvent(new CustomEvent("cms:link"))) : n && e.key.toLowerCase() === "e" ? (e.preventDefault(), ln("code", t), g()) : e.key === "Enter" && e.shiftKey && !u ? (e.preventDefault(), t.execCommand("insertLineBreak"), g()) : p.current && o?.(e, p.current);
		},
		onPaste: (e) => {
			e.preventDefault();
			let t = e.currentTarget.ownerDocument, n = e.clipboardData.getData("text/plain");
			!f && /^(https?:\/\/|mailto:)\S+$/i.test(n.trim()) && !t.getSelection()?.isCollapsed ? (t.execCommand("createLink", !1, n.trim()), g()) : p.current && c?.(n, p.current) || (t.execCommand("insertText", !1, u ? n.replace(/\s*\n\s*/g, " ") : n), g());
		},
		onBlur: () => g()
	});
}
function ln(e, t = document) {
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
function un(e) {
	return {
		...e,
		type: "url",
		component: "link"
	};
}
// admin/src/core/FormatToolbar.tsx
function dn({ root: e = document, offset: t }) {
	let [n, r] = F(null), [i, a] = F({}), [o, s] = F(!1), [c, l] = F(""), u = P(null), d = P(null), f = P(() => {}), p = sn();
	if (N(() => {
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
		ln(t, e), d.current?.dispatchEvent(new Event("input", { bubbles: !0 })), e.dispatchEvent(new Event("selectionchange"));
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
	}, v = (e, t, n, r) => /* @__PURE__ */ W(ke, {
		content: t,
		shortcut: n,
		children: /* @__PURE__ */ W(B, {
			compact: !0,
			"aria-label": t,
			"aria-pressed": !!i[e] || e === "link" && o,
			onMouseDown: (e) => e.preventDefault(),
			onClick: r,
			className: V("grid size-7 place-items-center rounded-xs hover:bg-white/12 hover:text-ink-contrast", i[e] || e === "link" && o ? "bg-white/14 text-ink-contrast" : "text-ink-contrast/75"),
			children: /* @__PURE__ */ W(L, {
				name: e,
				size: 14
			})
		})
	}, e), y = () => {
		s(!1);
		let t = d.current, n = e.getSelection();
		t && u.current && n && (t.focus({ preventScroll: !0 }), n.removeAllRanges(), n.addRange(u.current));
	}, b = un({
		handle: "url",
		label: k("Link"),
		size: "sm",
		autofocus: !0,
		anchors: p,
		placeholder: k("Paste a link or search pages"),
		onClose: y
	});
	return Re(/* @__PURE__ */ G("div", {
		className: "fixed z-overlay flex -translate-x-1/2 -translate-y-full items-center gap-0.5 rounded-md bg-ink p-1 shadow-pop",
		style: {
			left: n.x,
			top: n.y - 8
		},
		onMouseDown: (e) => !o && e.preventDefault(),
		onKeyDown: (e) => e.key === "Escape" && y(),
		children: [
			v("bold", k("Bold"), "mod+b", () => m("bold")),
			v("italic", k("Italic"), "mod+i", () => m("italic")),
			v("underline", k("Underline"), "mod+u", () => m("underline")),
			v("strike", k("Strikethrough"), "mod+shift+x", () => m("strikeThrough")),
			v("code", k("Code"), "mod+e", () => h("code")),
			/* @__PURE__ */ W("span", { className: "mx-0.5 h-4 w-px bg-white/15" }),
			v("link", k("Link"), "mod+k", g),
			o && /* @__PURE__ */ W("div", {
				className: "pointer-events-none absolute inset-0 opacity-0",
				"aria-hidden": !0,
				children: /* @__PURE__ */ W(ye, {
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
function fn(e, t, n = "component") {
	let r = e.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 56) || n, i = r;
	for (let e = 2; t.has(i); e++) i = `${r}-${e}`;
	return i;
}
var pn = [
	"Heroes",
	"Text",
	"Media",
	"Features",
	"People",
	"Lists",
	"Calls to Action",
	"Pages"
];
function mn(e) {
	let t = document.createElement("div");
	document.body.appendChild(t);
	let n = Be(t);
	n.render(e(() => setTimeout(() => {
		n.unmount(), t.remove();
	}, 250)));
}
function hn(e) {
	return e.selection().map((t) => d(e.get().nodes, t)).filter((e) => !!e);
}
function gn(e) {
	let t = hn(e);
	t.length !== 0 && mn((n) => {
		function r() {
			let [r, i] = F(!0), [a, o] = F({
				title: "",
				category: "",
				description: ""
			}), [s, c] = F(!1), l = () => {
				i(!1), n();
			}, u = async () => {
				let n = a.title.trim();
				if (n) {
					c(!0);
					try {
						let r = await O("components/list"), i = fn(n, new Set(r.map((e) => e.handle)));
						await O("components/save", {
							handle: i,
							title: n,
							description: a.description.trim(),
							category: a.category.trim() || void 0,
							blocks: t
						}), ne("components/"), e.replaceSelection([{
							id: E(),
							type: "component",
							props: { ref: i }
						}]), H.success(k("“{title}” is now a component", { title: n })), l();
					} catch (e) {
						H.error(e), c(!1);
					}
				}
			};
			return /* @__PURE__ */ W(ve, {
				open: r,
				onOpenChange: (e) => !e && l(),
				size: "sm",
				title: k("Make a Component"),
				description: ie(t.length, "{count} block, the same on every page", "{count} blocks, the same on every page"),
				onSubmit: () => void u(),
				submitLabel: k("Make Component"),
				submitDisabled: !a.title.trim(),
				busy: s,
				children: /* @__PURE__ */ W(ye, {
					fields: [
						{
							handle: "title",
							type: "text",
							label: k("Name"),
							required: !0,
							autofocus: !0,
							max: 120,
							placeholder: k("Pricing Card")
						},
						{
							handle: "category",
							type: "text",
							label: k("Category"),
							max: 60,
							placeholder: k("Components")
						},
						{
							handle: "description",
							type: "text",
							label: k("Description"),
							max: 500,
							placeholder: k("When to Use It")
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
		return /* @__PURE__ */ W(r, {});
	});
}
function _n(e) {
	let t = hn(e);
	t.length !== 0 && mn((e) => {
		function n() {
			let [n, r] = F(!0), [i, a] = F({
				title: "",
				category: "",
				description: ""
			}), [o, s] = F(!1), c = () => {
				r(!1), e();
			}, l = async () => {
				let e = i.title.trim();
				if (e) {
					s(!0);
					try {
						let n = await O("patterns/list", { working: !0 }), r = fn(e, new Set(n.map((e) => e.handle)), "pattern");
						await O("patterns/save", {
							handle: r,
							title: e,
							description: i.description.trim(),
							category: i.category.trim() || void 0,
							blocks: t
						}), ne("patterns/"), H.success(k("Saved “{title}” as a pattern", { title: e })), c();
					} catch (e) {
						H.error(e), s(!1);
					}
				}
			};
			return /* @__PURE__ */ W(ve, {
				open: n,
				onOpenChange: (e) => !e && c(),
				size: "sm",
				title: k("Save as Pattern"),
				description: ie(t.length, "{count} block to start from on any page", "{count} blocks to start from on any page"),
				onSubmit: () => void l(),
				submitLabel: k("Save Pattern"),
				submitDisabled: !i.title.trim(),
				busy: o,
				children: /* @__PURE__ */ W(ye, {
					fields: [
						{
							handle: "title",
							type: "text",
							label: k("Name"),
							required: !0,
							autofocus: !0,
							max: 120,
							placeholder: k("Hero With Photo")
						},
						{
							handle: "category",
							type: "text",
							label: k("Category"),
							max: 60,
							placeholder: k("Heroes"),
							suggestions: pn
						},
						{
							handle: "description",
							type: "text",
							label: k("Description"),
							max: 500,
							placeholder: k("When to Use It")
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
		return /* @__PURE__ */ W(n, {});
	});
}
// admin/src/core/StartFromPattern.tsx
var vn = "Pages";
function yn(e) {
	let t = A("patterns/list", { category: vn }, {
		enabled: e,
		staleTime: 6e4
	});
	return e ? t.data ?? [] : [];
}
function bn({ open: t, onOpenChange: n, patterns: r, onChoose: i }) {
	return /* @__PURE__ */ W(ve, {
		open: t,
		onOpenChange: n,
		size: "lg",
		title: k("Start From a Pattern"),
		children: /* @__PURE__ */ W("div", {
			className: "grid gap-4 sm:grid-cols-2",
			children: r.map((t) => /* @__PURE__ */ G(B, {
				onClick: () => i(t),
				className: "block min-w-0 rounded-md p-1 text-left hover:bg-hover",
				children: [
					/* @__PURE__ */ W(e, {
						handle: t.handle,
						maxHeight: 280
					}),
					/* @__PURE__ */ W("span", {
						className: "mt-2 block truncate text-sm font-medium text-text",
						children: t.title
					}),
					t.description && /* @__PURE__ */ W("span", {
						className: "mt-0.5 line-clamp-2 block text-xs text-muted",
						children: t.description
					})
				]
			}, t.handle))
		})
	});
}
// admin/src/core/insertionTargets.ts
var xn = 4, Sn = 6, Cn = 16, wn = (e) => e.left + e.width, Tn = (e) => e.top + e.height, En = (e, t) => t === "x" ? e.left + e.width / 2 : e.top + e.height / 2, Dn = (e, t) => t === "x" ? e.left : e.top, On = (e, t) => t === "x" ? wn(e) : Tn(e), kn = (e) => [
	e.left,
	e.top,
	e.width,
	e.height
].every(Number.isFinite) && e.width > 0 && e.height >= 0, An = (e, t) => t.x >= e.left && t.x <= wn(e) && t.y >= e.top && t.y <= Tn(e);
function jn(e, t) {
	return Math.hypot(Math.max(e.left - t.x, 0, t.x - wn(e)), Math.max(e.top - t.y, 0, t.y - Tn(e)));
}
function Mn(e, t) {
	return Math.min(Tn(e), Tn(t)) - Math.max(e.top, t.top) > 0 && Math.abs(En(t, "x") - En(e, "x")) > Math.abs(En(t, "y") - En(e, "y")) ? "x" : "y";
}
function Nn(e, t, n) {
	let r = Math.min(Tn(e), Tn(t)) - Math.max(e.top, t.top), i = Math.min(wn(e), wn(t)) - Math.max(e.left, t.left);
	return n === "x" && r > 0 ? "x" : n === "y" && i > 0 ? "y" : Mn(e, t);
}
function Pn(e, t) {
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
function Fn(e, t) {
	let { byId: n, depth: r, isExcluded: i } = Pn(e, t.excludeIds), a = /* @__PURE__ */ new Map([[null, []]]);
	for (let t of e) {
		if (!kn(t.rect) || !t.container && t.rect.height === 0 || i(t)) continue;
		let e = a.get(t.parentId) ?? [];
		e.push(t), a.set(t.parentId, e), t.container && !a.has(t.id) && a.set(t.id, []);
	}
	let o = [];
	for (let [e, i] of a) {
		let a = e === null ? null : n.get(e), s = e === null ? t.rootRect : a?.rect;
		if (!s || !kn(s)) continue;
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
			let f = Math.sign(i - r), p = Math.min(Math.abs(i - r) / 2, xn), m = l === "from" ? r + f * p : l === "to" ? i - f * p : (r + i) / 2, h = Math.min(r, i), g = Math.abs(i - r), _ = n === "x" ? {
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
				width: Math.max(wn(e), wn(t)) - n,
				height: Math.max(Tn(e), Tn(t)) - r
			};
		}, m = c[0], h = c.at(-1), g = c.length > 1 ? Nn(m.rect, c[1].rect, l) : l ?? "y", _ = c.length > 1 ? Nn(c.at(-2).rect, h.rect, l) : l ?? "y", v = c.length < 2 || En(c[1].rect, g) >= En(m.rect, g), y = c.length < 2 || En(h.rect, _) >= En(c.at(-2).rect, _), b = v ? Dn(m.rect, g) : On(m.rect, g), x = y ? On(h.rect, _) : Dn(h.rect, _);
		f(m.index, g, v ? Dn(s, g) : On(s, g), b, g === "x" ? m.rect : s, m.rect, "edge", "to");
		for (let e = 1; e < c.length; e++) {
			let t = c[e - 1], n = c[e], r = Nn(t.rect, n.rect, l), i = En(n.rect, r) >= En(t.rect, r), a = i ? On(t.rect, r) : Dn(t.rect, r), o = i ? Dn(n.rect, r) : On(n.rect, r), u = Math.max(t.rect.top, n.rect.top), d = Math.min(Tn(t.rect), Tn(n.rect)), m = r === "x" ? {
				left: s.left,
				top: u,
				width: s.width,
				height: Math.max(0, d - u)
			} : s, h = i ? o < a : o > a;
			f(n.index, r, h ? (a + o) / 2 : a, h ? (a + o) / 2 : o, m, r === "x" && m.height > 0 ? m : p(t.rect, n.rect), "between");
		}
		f(h.index + 1, _, x, y ? On(s, _) : Dn(s, _), _ === "x" ? h.rect : s, h.rect, "edge", "from");
	}
	return o;
}
function In(e, t, n) {
	if (![t.x, t.y].every(Number.isFinite)) return null;
	let r = Fn(e, n).flatMap((e) => {
		if (e.inside) return [];
		let n = e.axis === "x", r = n ? t.x : t.y, i = n ? t.y : t.x, a = (n ? e.rect.left : e.rect.top) + 1, o = n ? e.hitRect.left : e.hitRect.top, s = n ? e.hitRect.width : e.hitRect.height, c = Math.max(0, Sn - s / 2), l = Math.max(o - c, a - Cn), u = Math.min(o + s + c, a + Cn), d = n ? e.hitRect.top : e.hitRect.left, f = d + (n ? e.hitRect.height : e.hitRect.width);
		return r >= l && r <= u && i >= d && i <= f ? [{
			target: e,
			distance: Math.abs(r - a)
		}] : [];
	});
	if (!r.length) return null;
	let i = Math.min(...r.map((e) => e.distance));
	return r.filter((e) => e.distance <= i + 2).sort((e, t) => Number(e.target.kind === "edge") - Number(t.target.kind === "edge") || t.target.depth - e.target.depth || e.distance - t.distance)[0].target;
}
function Ln(e, t, n) {
	if (![t.x, t.y].every(Number.isFinite)) return null;
	let { isExcluded: r } = Pn(e, n.excludeIds);
	return e.some((e) => r(e) && An(e.rect, t)) ? null : Fn(e, n).map((e) => ({
		target: e,
		distance: jn(e.inside ? e.hitRect : e.rect, t)
	})).filter(({ distance: e }) => e <= (n.maxDistance ?? 80)).sort((e, t) => e.distance - t.distance || t.target.depth - e.target.depth)[0]?.target ?? null;
}
// admin/src/core/QuickInserter.tsx
var Rn = "cms:blocks:recent", zn = [
	"paragraph",
	"heading",
	"image",
	"list",
	"button",
	"box"
], Bn = 6, Vn = 9, Hn = 3;
function Un() {
	try {
		let e = JSON.parse(localStorage.getItem(Rn) ?? "[]");
		return Array.isArray(e) ? e.filter((e) => typeof e == "string") : [];
	} catch {
		return [];
	}
}
function Wn(e) {
	if (e.kind === "block") try {
		localStorage.setItem(Rn, JSON.stringify([e.type.name, ...Un().filter((t) => t !== e.type.name)].slice(0, 12)));
	} catch {}
}
function Gn({ types: e, allowed: t, onChoose: a, onClose: s }) {
	let [l, u] = F(""), [d, f] = F(!1), [p, m] = F(0), { items: h } = i(e, l, t, !!l.trim()), g = ge(() => {
		if (l.trim()) return h.slice(0, Vn);
		let e = [...Un(), ...zn], t = (t) => {
			let n = t.kind === "block" ? e.indexOf(t.type.name) : -1;
			return n < 0 ? e.length : n;
		};
		return h.filter((e) => e.kind === "block").sort((e, n) => t(e) - t(n)).slice(0, Bn);
	}, [h, l]);
	N(() => m(0), [l]);
	let _ = (e) => {
		Wn(e), a(e);
	};
	return d ? /* @__PURE__ */ W("div", {
		"data-cms-insert-menu": !0,
		"data-cms-browse": !0,
		children: /* @__PURE__ */ W(c, {
			types: e,
			query: l,
			onQuery: u,
			allowed: t,
			onChoose: _,
			onClose: s
		})
	}) : /* @__PURE__ */ G("div", {
		"data-cms-insert-menu": !0,
		className: "flex w-[300px] flex-col",
		onKeyDown: (e) => {
			let t = {
				ArrowRight: 1,
				ArrowLeft: -1,
				ArrowDown: Hn,
				ArrowUp: -3
			}[e.key];
			t && g.length ? (e.preventDefault(), m((e) => Math.max(0, Math.min(g.length - 1, e + t)))) : e.key === "Enter" && g[p] ? (e.preventDefault(), _(g[p])) : e.key === "Escape" && (e.preventDefault(), s());
		},
		children: [
			/* @__PURE__ */ W("div", {
				className: "p-2 pb-0",
				children: /* @__PURE__ */ W(ye, {
					bare: !0,
					fields: [{
						handle: "query",
						type: "text",
						label: k("Search"),
						icon: "search",
						size: "sm",
						autofocus: !0,
						placeholder: k("Search Blocks")
					}],
					values: { query: l },
					onChange: (e, t) => u(t ?? "")
				})
			}),
			/* @__PURE__ */ G("div", {
				role: "listbox",
				"aria-label": l.trim() ? k("Results") : k("Suggestions"),
				className: "grid grid-cols-3 gap-1 p-2",
				children: [g.map((e, t) => {
					let i = n(e), a = r(e);
					return /* @__PURE__ */ G(I, {
						variant: "ghost",
						role: "option",
						"aria-selected": t === p,
						"data-index": t,
						onMouseMove: () => t !== p && m(t),
						onMouseDown: (e) => e.preventDefault(),
						onClick: () => _(e),
						"data-active": t === p || void 0,
						className: "!h-[68px] min-w-0 shrink !flex-col !gap-1.5 !px-1",
						children: [/* @__PURE__ */ W(L, {
							name: a,
							size: 20
						}), /* @__PURE__ */ W("span", {
							className: "w-full truncate text-center text-xs font-medium",
							children: i
						})]
					}, o(e));
				}), !g.length && /* @__PURE__ */ W("div", {
					className: "col-span-3 px-3 py-5 text-center text-xs text-faint",
					children: k("No matching blocks")
				})]
			}),
			/* @__PURE__ */ G(I, {
				variant: "ghost",
				size: "lg",
				onMouseDown: (e) => e.preventDefault(),
				onClick: () => f(!0),
				className: "!h-9 !gap-1.5 !rounded-none border-t border-border !text-sm focus-visible:!-outline-offset-2",
				children: [k("Browse All"), /* @__PURE__ */ W(L, {
					name: "arrow-right",
					size: 14,
					className: "text-muted"
				})]
			})
		]
	});
}
// admin/src/core/canvas.ts
function Kn(e, t) {
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
function qn(e, t) {
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
var Jn = "/_cms/site/";
function Yn(e, t = location.href) {
	try {
		let n = new URL(e, t);
		return n.origin === location.origin && n.pathname.startsWith(Jn) ? n.pathname : null;
	} catch {
		return null;
	}
}
var Xn = /\bimport\s*(?:[\w$*{}\s,]+?\s*from\s*)?["']([^"']+)["']|\bexport\s*[\w$*{}\s,]*?\s*from\s*["']([^"']+)["']|\bimport\s*\(\s*["']([^"']+)["']\s*\)/g;
async function Zn(e, t) {
	let n = {}, r = {}, i = /* @__PURE__ */ new Set(), a = async (e) => {
		if (i.has(e) || i.size > 200) return;
		i.add(e);
		let o = await fetch(e, { credentials: "same-origin" }).then((e) => e.ok ? e.text() : "", () => ""), s = [];
		for (let i of o.matchAll(Xn)) {
			let a = i[1] ?? i[2] ?? i[3], o = /^(\/|\.\/|\.\.\/)/.test(a), c = o ? Yn(a, location.origin + e) : a, l = c ? Yn(t.imports?.[c] ?? (o ? c : "")) : null;
			c && l && (t.imports?.[c] && (n[c] = l), t.integrity?.[l] && (r[l] = t.integrity[l]), s.push(l));
		}
		await Promise.all(s.map(a));
	};
	return await a(e), {
		imports: n,
		...Object.keys(r).length ? { integrity: r } : {}
	};
}
async function Qn(e, t) {
	let n;
	try {
		n = JSON.parse(e.querySelector("script[data-cms-importmap]")?.textContent ?? "{}");
	} catch {
		return null;
	}
	let r = await Zn(t, n);
	if (!Object.keys(r.imports ?? {}).length) return null;
	let i = document.createElement("script");
	return i.type = "importmap", i.dataset.cmsCanvas = "", i.nonce = document.querySelector("script[nonce]")?.nonce ?? "", i.textContent = JSON.stringify(r), document.head.append(i), i;
}
function $n(e) {
	try {
		return JSON.parse(e.dataset.cmsCanvas ?? "[]").flatMap((e) => {
			let t = typeof e?.src == "string" ? Yn(e.src) : null;
			return t ? [{
				...e,
				src: t
			}] : [];
		});
	} catch {
		return [];
	}
}
var er = (e, t) => console.error("[cms] canvas behavior", e, t);
function tr() {
	let e = [], t = [];
	async function n(e, n, r) {
		let i = r.defaultView;
		if (i) try {
			let a = await Qn(r, n.src);
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
			}, c = o.mount ?? o.default, l = await Kn(i, () => c?.(e.el, n.props ?? {}, s));
			if (e.abort.signal.aborted) {
				typeof l == "function" && l();
				return;
			}
			typeof l == "function" && (e.cleanup = l), e.unpicture = qn(e.el, i);
		} catch (e) {
			er(n.src, e);
		}
	}
	return {
		mount(t) {
			for (let r of t.querySelectorAll("[data-cms-canvas]")) for (let i of $n(r)) {
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
					er(e.module ? "unmount" : "mount", t);
				}
			}
			t.forEach((e) => e.remove()), t = [];
		}
	};
}
// admin/src/core/morph.ts
function nr(e, t) {
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
function rr(e) {
	let t = P(e);
	t.current = e;
	let [n, r] = F(null), i = P(null), a = P(() => {});
	return N(() => {
		e.disabled && a.current();
	}, [e.disabled]), N(() => () => a.current(), []), {
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
var ir = 32, ar = 6, or = 4;
function sr({ target: e, position: t, ...n }) {
	let r = t(e.rect);
	return /* @__PURE__ */ G(U, { children: [/* @__PURE__ */ W("div", {
		"data-cms-insertion-line": !0,
		className: V("pointer-events-none absolute z-raised rounded-full bg-focus", e.axis === "x" ? "cms-block-line-y" : "cms-block-line-x"),
		style: {
			...r,
			minWidth: 2,
			minHeight: 2
		}
	}), /* @__PURE__ */ W(ur, {
		...n,
		label: k("Insert Block"),
		className: "cms-block-plus absolute size-6 -translate-x-1/2 -translate-y-1/2 rounded-xs bg-signal text-signal-ink shadow-sm",
		style: {
			left: r.left + r.width / 2,
			top: r.top + r.height / 2
		},
		data: { "data-cms-inserter": `${e.parentId ?? ""}:${e.index}` }
	})] });
}
function cr({ target: e, position: t, ...n }) {
	let r = t(e.hitRect);
	return /* @__PURE__ */ W(ur, {
		...n,
		label: k("Insert Block"),
		className: "cms-block-chrome absolute size-7 -translate-x-1/2 -translate-y-1/2 rounded-sm border border-border-strong bg-bg text-muted shadow-sm hover:border-focus hover:text-focus",
		style: {
			left: r.left + r.width / 2,
			top: r.top + Math.min(r.height / 2, 40)
		},
		data: { "data-cms-appender": e.parentId ?? "" }
	});
}
function lr({ target: e, position: t, onWrite: n, onPattern: r, ...i }) {
	let a = t(e.hitRect);
	return /* @__PURE__ */ G("div", {
		"data-cms-document-appender": !0,
		className: "cms-block-chrome pointer-events-auto absolute z-raised flex h-10 whitespace-nowrap -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-md border border-dashed border-border-strong bg-bg/90 py-1 pl-3 pr-1 shadow-sm",
		style: {
			left: a.left + a.width / 2,
			top: a.top + Math.max(24, Math.min(a.height / 2, 120))
		},
		children: [
			n && /* @__PURE__ */ W(B, {
				compact: !0,
				onClick: n,
				className: "cms-focus-ring h-8 rounded-xs px-1 text-sm text-muted hover:text-text",
				children: k("Write, or press “/” for blocks")
			}),
			r && /* @__PURE__ */ G(U, { children: [/* @__PURE__ */ W("span", { className: "mx-1 h-4 border-l border-border" }), /* @__PURE__ */ W(B, {
				compact: !0,
				onClick: r,
				className: "cms-focus-ring h-8 rounded-xs px-1 text-sm text-muted hover:text-text",
				children: k("Start From a Pattern")
			})] }),
			/* @__PURE__ */ W(ur, {
				...i,
				label: k("Insert Block"),
				className: "size-8 rounded-xs text-muted hover:bg-hover hover:text-text"
			})
		]
	});
}
function ur({ open: e, onOpenChange: t, returnFocus: n, children: r, label: i, className: a, style: o, data: s }) {
	return /* @__PURE__ */ W(we, {
		open: e,
		onOpenChange: t,
		side: "bottom",
		align: "center",
		className: "!overflow-hidden !p-0",
		returnFocus: n,
		trigger: /* @__PURE__ */ W(B, {
			compact: !0,
			...s,
			"aria-label": e ? k("Close") : i,
			"aria-expanded": e,
			className: V("cms-focus-ring pointer-events-auto z-drag grid place-items-center", a),
			style: o,
			children: /* @__PURE__ */ W(L, {
				name: "plus",
				size: 14,
				className: V("cms-block-plus-icon", e && "rotate-45")
			})
		}),
		children: e && r
	});
}
function dr({ id: e, label: t, icon: n, parent: r, box: i, viewport: a, canMoveUp: o, canMoveDown: s, onSelectParent: c, onDrag: l, onMove: u, onInsert: d, onDuplicate: f, onMakeComponent: p, onSavePattern: m, onDelete: h, covers: g }) {
	let _ = P(null), [v, y] = F(240);
	he(() => {
		_.current && y(_.current.offsetWidth);
	});
	let b = i.top + i.height;
	if (b < 40 || i.top > a.height - ir || i.left > a.width || i.left + i.width < 0) return null;
	let x = (e) => Math.max(or, Math.min(a.width - v - or, e)), S = x(i.left), C = x(i.left + i.width - v), w = i.top - ir - ar, T = b + ar, E = Math.max(or, i.top + or), D = (e) => e >= or && e + ir <= a.height - or, { left: ee, top: te } = [
		w,
		T,
		E
	].flatMap((e) => [{
		left: S,
		top: e
	}, {
		left: C,
		top: e
	}]).find((e) => D(e.top) && !g?.({
		...e,
		width: v,
		height: ir
	})) ?? {
		left: S,
		top: D(w) ? w : E
	};
	return /* @__PURE__ */ G("div", {
		ref: _,
		"data-cms-block-controls": e,
		role: "toolbar",
		"aria-label": k("Block Actions"),
		className: "cms-block-chrome pointer-events-auto absolute z-bar flex h-8 items-center gap-0.5 rounded-sm border border-border bg-bg pl-0.5 pr-1 shadow-pop",
		style: {
			left: ee,
			top: te
		},
		children: [
			/* @__PURE__ */ W(B, {
				compact: !0,
				"aria-label": k("Drag to Reorder"),
				title: k("Drag to Reorder"),
				className: "cms-focus-ring grid h-6 w-4 touch-none cursor-grab place-items-center rounded-xs text-faint hover:bg-hover hover:text-muted active:cursor-grabbing",
				onPointerDown: l,
				children: /* @__PURE__ */ W(L, {
					name: "drag",
					size: 12
				})
			}),
			r && /* @__PURE__ */ W(ke, {
				content: k("Select {block}", { block: r.label }),
				children: /* @__PURE__ */ W(R, {
					size: "xs",
					icon: "arrow-elbow-left-up",
					label: k("Select {block}", { block: r.label }),
					onClick: c
				})
			}),
			/* @__PURE__ */ W("span", { className: "mx-0.5 h-4 border-l border-border" }),
			/* @__PURE__ */ G("span", {
				className: "flex h-6 max-w-40 items-center gap-1.5 px-1 text-xs font-medium text-text",
				children: [/* @__PURE__ */ W(L, {
					name: n,
					size: 14,
					className: "shrink-0 text-muted"
				}), /* @__PURE__ */ W("span", {
					className: "truncate",
					children: t
				})]
			}),
			/* @__PURE__ */ W(R, {
				size: "xs",
				icon: "chevron-up",
				label: k("Move Up"),
				disabled: !o,
				onClick: () => u(-1)
			}),
			/* @__PURE__ */ W(R, {
				size: "xs",
				icon: "chevron-down",
				label: k("Move Down"),
				disabled: !s,
				onClick: () => u(1)
			}),
			/* @__PURE__ */ W("span", { className: "mx-0.5 h-4 border-l border-border" }),
			/* @__PURE__ */ W(z, {
				align: "end",
				trigger: /* @__PURE__ */ W(R, {
					size: "xs",
					icon: "more",
					label: k("More Block Actions")
				}),
				items: [
					{
						label: k("Insert Before"),
						icon: "arrow-up",
						shortcut: "alt+mod+t",
						onSelect: () => d("before")
					},
					{
						label: k("Insert After"),
						icon: "arrow-down",
						shortcut: "alt+mod+y",
						onSelect: () => d("after")
					},
					{
						label: k("Duplicate"),
						icon: "duplicate",
						shortcut: "mod+d",
						onSelect: f
					},
					p && {
						label: k("Make a Component"),
						icon: "symbol",
						onSelect: p
					},
					m && {
						label: k("Save as Pattern"),
						icon: "section-copy",
						onSelect: m
					},
					{
						separator: !0,
						label: ""
					},
					{
						label: k("Delete"),
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
function fr({ drag: e, position: t }) {
	return /* @__PURE__ */ G(U, { children: [
		/* @__PURE__ */ W("div", {
			"data-cms-drag-overlay": !0,
			className: "pointer-events-auto absolute inset-0 z-bar cursor-grabbing touch-none"
		}),
		e.target && /* @__PURE__ */ W("div", {
			"data-cms-drop-indicator": !0,
			className: "pointer-events-none absolute z-drawer rounded-full bg-focus",
			style: {
				...t(e.target.rect),
				minWidth: 2,
				minHeight: 2
			}
		}),
		/* @__PURE__ */ G("div", {
			"data-cms-drag-ghost": !0,
			className: "pointer-events-none fixed z-tooltip flex max-w-56 items-center gap-2 truncate rounded-sm border border-border-strong bg-bg px-3 py-2 text-xs text-ink shadow-pop",
			style: {
				left: Math.max(8, Math.min(window.innerWidth - 232, e.point.x + 16)),
				top: Math.max(8, Math.min(window.innerHeight - 40, e.point.y + 16))
			},
			children: [/* @__PURE__ */ W(L, {
				name: "drag",
				size: 14
			}), /* @__PURE__ */ W("span", {
				className: "truncate",
				children: e.label
			})]
		})
	] });
}
// admin/src/builder/bus.ts
var pr = new EventTarget(), mr = {
	emit(e, t) {
		pr.dispatchEvent(new CustomEvent(e, { detail: t }));
	},
	on(e, t) {
		let n = (e) => t(e.detail);
		return pr.addEventListener(e, n), () => pr.removeEventListener(e, n);
	}
}, hr = le({
	stops: () => [],
	settings: () => {},
	readOnly: !1
}), gr = () => pe(hr);
function _r(e = "") {
	return {
		id: E(),
		type: "paragraph",
		props: { text: e }
	};
}
function vr(e, t, n, r) {
	return e.id === t && e.prop === n && (r === void 0 || e.index === r);
}
function yr(e, t, n) {
	e.focus(t.id, n, t.prop, t.index);
}
function br(e, t, n) {
	if (!t) return;
	let r = /* @__PURE__ */ new Set(), i = (e) => {
		r.add(e.id), e.children?.forEach(i);
	};
	i(t);
	let a = n.find((e) => r.has(e.id));
	a ? yr(e, a, "start") : e.select(t.id, !0);
}
function xr(e) {
	let t = e.getElementById("f-title");
	return t ? (t.focus(), t.setSelectionRange(t.value.length, t.value.length), !0) : !1;
}
function Sr(e, t, n, r, i) {
	if (e.shiftKey || e.metaKey || e.ctrlKey || e.altKey) return !1;
	let a = e.key === "ArrowUp" && Zt(t) || e.key === "ArrowLeft" && Kt(t), o = e.key === "ArrowDown" && Qt(t) || e.key === "ArrowRight" && qt(t);
	if (a) {
		let a = r[i - 1];
		if (a) yr(n, a, "end");
		else if (e.key !== "ArrowUp" || !xr(t.ownerDocument)) return !1;
		return e.preventDefault(), !0;
	}
	if (o) {
		let t = r[i + 1];
		return t ? (e.preventDefault(), yr(n, t, "start"), !0) : !1;
	}
	return !1;
}
// admin/src/write/outline.ts
var Cr = [
	"paragraph",
	"heading",
	"quote",
	"callout"
];
function wr(e) {
	return e.kind === "actions" ? e.nodes : [e.node];
}
function Tr(e) {
	return wr(e)[0].id;
}
function Er(e, t, n) {
	let r = {
		types: t,
		custom: n
	}, i = [];
	for (let t of e) {
		let e = kr(t, null, !1, r), n = e.kind === "container" || e.kind === "columns", a = i.at(-1);
		!n && a && !a.container ? jr(a.rows, e) : i.push({
			id: t.id,
			label: n && t.label?.trim() || null,
			rows: [e],
			container: n
		});
	}
	return i;
}
function Dr(e) {
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
function Or(e) {
	let t = [], n = (e) => {
		for (let r of e) if (t.push(r), r.kind === "columns") for (let e of r.columns) n(e.rows);
		else r.kind === "container" && n(r.rows);
	};
	for (let t of e) n(t.rows);
	return t;
}
function kr(e, t, n, r) {
	let i = n || !!e.hidden, a = {
		parent: t,
		hidden: i
	}, o = r.types.get(e.type), s = r.custom(e.type), c = (e.children?.length ?? 0) > 0;
	return e.type === "columns" && o && !s ? {
		kind: "columns",
		node: e,
		columns: (e.children ?? []).map((e) => ({
			node: e,
			rows: Ar(e.children ?? [], e.id, i || !!e.hidden, r)
		})),
		...a
	} : !s && o && !c && (e.type === "button" || e.type === "link") ? {
		kind: "actions",
		nodes: [e],
		...a
	} : o?.children || c ? {
		kind: "container",
		node: e,
		rows: Ar(e.children ?? [], e.id, i, r),
		...a
	} : !o || s ? {
		kind: "block",
		node: e,
		...a
	} : Cr.includes(e.type) ? {
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
function Ar(e, t, n, r) {
	let i = [];
	for (let a of e) jr(i, kr(a, t, n, r));
	return i;
}
function jr(e, t) {
	let n = e.at(-1);
	t.kind === "actions" && n?.kind === "actions" && n.parent === t.parent && n.hidden === t.hidden ? n.nodes.push(...t.nodes) : e.push(t);
}
// admin/src/write/slash.ts
var Mr = null, Nr = /* @__PURE__ */ new Set();
function Pr(e) {
	return Mr?.id === e ? Mr : null;
}
function Fr(e) {
	JSON.stringify(e) !== JSON.stringify(Mr) && (Mr = e, Nr.forEach((e) => e()));
}
function Ir() {
	return _e((e) => (Nr.add(e), () => Nr.delete(e)), () => Mr);
}
function Lr(e, t = 360, n = 300) {
	let r = window.innerHeight - e.bottom - 6 - 8, i = e.top - 6 - 8, a = r >= Math.min(t, 220) || r >= i;
	return {
		left: Math.max(8, Math.min(window.innerWidth - n - 8, e.left - 4)),
		top: a ? e.bottom + 6 : void 0,
		bottom: a ? void 0 : window.innerHeight - e.top + 6,
		maxHeight: Math.max(120, Math.min(t, a ? r : i))
	};
}
function Rr(e, t) {
	N(() => {
		if (!e) return;
		let n = (e) => !e.target?.closest?.("[data-cms-slash]") && Fr(null), r = t.filter((e) => !!e);
		return r.forEach((e) => e.addEventListener("pointerdown", n, !0)), () => r.forEach((e) => e.removeEventListener("pointerdown", n, !0));
	}, [e, ...t]);
}
// admin/src/write/Text.tsx
var zr = {
	1: "text-display font-semibold",
	2: "text-3xl font-semibold",
	3: "text-2xl font-semibold",
	4: "text-xl font-semibold",
	5: "text-lg font-semibold",
	6: "text-base font-semibold uppercase tracking-[0.04em] text-muted"
}, Br = "text-lg leading-7", Vr = {
	note: {
		icon: "info",
		className: "bg-surface",
		label: () => k("Note")
	},
	tip: {
		icon: "sparkle",
		className: "bg-success/7",
		label: () => k("Tip")
	},
	warning: {
		icon: "warning",
		className: "bg-warning/9",
		label: () => k("Warning")
	},
	danger: {
		icon: "error",
		className: "bg-danger/7",
		label: () => k("Danger")
	}
};
function Hr({ node: e }) {
	if (e.type === "quote") return /* @__PURE__ */ G("blockquote", {
		className: "m-0 border-l-[3px] border-text/80 py-0.5 pl-4",
		children: [/* @__PURE__ */ W(Gr, {
			node: e,
			prop: "text",
			className: "text-lg leading-7",
			placeholder: k("Quote")
		}), /* @__PURE__ */ W(Gr, {
			node: e,
			prop: "cite",
			className: "cms-block-cite mt-1 text-sm text-muted",
			placeholder: k("Attribution"),
			quiet: !0
		})]
	});
	if (e.type === "callout") return /* @__PURE__ */ W(Wr, { node: e });
	if (e.type === "heading") {
		let t = String(e.props.level ?? 2);
		return /* @__PURE__ */ W(Gr, {
			node: e,
			prop: "text",
			tag: `h${t}`,
			className: zr[t] ?? zr[2],
			placeholder: k("Heading {level}", { level: t })
		});
	}
	return /* @__PURE__ */ W(Ur, { node: e });
}
function Ur({ node: e }) {
	let { store: t } = a(), n = K(t, (t) => t.nodes.length === 1 && t.nodes[0].id === e.id);
	return /* @__PURE__ */ W(Gr, {
		node: e,
		prop: "text",
		tag: "p",
		className: Br,
		placeholder: k("Write, or press “/” for blocks"),
		quiet: !n
	});
}
function Wr({ node: e }) {
	let { store: t } = a(), { readOnly: n } = gr(), r = Vr[e.props.tone] ?? Vr.note;
	return /* @__PURE__ */ G("div", {
		className: V("flex gap-3 rounded-md px-4 py-3", r.className),
		children: [/* @__PURE__ */ W(z, {
			align: "start",
			trigger: /* @__PURE__ */ W(B, {
				compact: !0,
				disabled: n,
				"aria-label": k("Callout Style"),
				className: "grid h-[27px] w-5 shrink-0 place-items-center rounded-xs text-muted hover:text-text",
				children: /* @__PURE__ */ W(L, {
					name: r.icon,
					size: 17
				})
			}),
			items: Object.entries(Vr).map(([n, r]) => ({
				label: r.label(),
				icon: r.icon,
				checked: n === (e.props.tone ?? "note"),
				onSelect: () => t.updateProps(e.id, { tone: n })
			}))
		}), /* @__PURE__ */ W(Gr, {
			node: e,
			prop: "text",
			className: V(Br, "min-w-0 flex-1"),
			placeholder: k("Write a note")
		})]
	});
}
function Gr({ node: e, prop: t, tag: n = "div", className: r, placeholder: i, quiet: o }) {
	let { store: c, types: l, allowed: u } = a(), { stops: m, readOnly: _ } = gr(), v = K(c, (n) => n.focus?.id === e.id && (n.focus.prop ?? "text") === t ? n.focus : null), y = String(e.props[t] ?? ""), b = (n, r) => {
		if (e.type === "paragraph" && t === "text" && x(n, r)) return;
		c.updateProps(e.id, { [t]: n }, `text:${e.id}:${t}`);
		let i = e.type === "paragraph" ? n.replace(/<[^>]+>/g, "").match(/^\/([\w-]*)$/) : null;
		Fr(i ? {
			id: e.id,
			query: i[1]
		} : null);
	}, x = (t, n) => {
		let r = t.replace(/&nbsp;/g, " "), i = (t, r, i) => {
			let a = p(c.get().nodes, e.id), o = a?.parentId ? d(c.get().nodes, a.parentId) : null;
			if (!l.has(t) || !C(o, t, l, o ? [] : u)) return !1;
			let s = Math.max(0, Yt(n) - nn(i));
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
			let t = _r(), { nodes: n } = c.get(), r = p(n, e.id);
			return c.commit(w(T(n, e.id, (e) => ({
				...e,
				type: "divider",
				props: {}
			})), r?.parentId ?? null, (r?.index ?? n.length) + 1, [t])), c.focus(t.id, "start"), !0;
		}
		return !1;
	}, S = (n, r) => {
		if (n.defaultPrevented) return;
		let i = m(), a = i.findIndex((n) => vr(n, e.id, t)), o = i[a], { nodes: _ } = c.get();
		if (n.key === "Enter" && !n.shiftKey && !n.metaKey && !n.ctrlKey && !n.altKey) {
			n.preventDefault();
			let i = Pr(e.id);
			if (i && s(!0, !!document.querySelector("[data-cms-slash]"))) return Fr({
				...i,
				enter: !0
			});
			if (t === "cite") {
				let t = _r(), n = g(_, e.id, "paragraph", l, u);
				if (!n) return;
				c.insert(n.parentId, n.index, [t]), c.focus(t.id, "start");
				return;
			}
			let [a, o] = Xt(r);
			if (f(a) && !f(o)) {
				let t = p(_, e.id);
				if (!t) return;
				c.insert(t.parentId, t.index, [_r()]), c.focus(e.id, "start");
				return;
			}
			let d = e.type === "paragraph" ? {
				id: E(),
				type: "paragraph",
				props: {
					...e.props,
					text: o
				},
				...e.class ? { class: e.class } : {}
			} : _r(o), m = g(_, e.id, "paragraph", l, u);
			if (!m) return;
			c.commit(w(T(_, e.id, (e) => ({
				...e,
				props: {
					...e.props,
					[t]: a
				}
			})), m.parentId, m.index, [d])), c.focus(d.id, "start");
		} else if (n.key === "Backspace" && Kt(r)) {
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
				c.remove(e.id), yr(c, r, "end");
				return;
			}
			if (r.parent === o?.parent && D(r, y)) return;
			yr(c, r, "end");
		} else if (n.key === "Delete" && qt(r) && t === "text") {
			let t = i[a + 1], r = t && t.prop === "text" && t.parent === o?.parent ? d(_, t.id) : null;
			if (!r || !["paragraph", "heading"].includes(r.type)) return;
			n.preventDefault();
			let s = nn(y);
			c.commit(h(T(_, e.id, (e) => ({
				...e,
				props: {
					...e.props,
					text: y + String(r.props.text ?? "")
				}
			})), r.id)), c.focus(e.id, s);
		} else Sr(n, r, c, i, a) || n.key === "Escape" && (n.preventDefault(), r.blur(), c.select(e.id, !0));
	}, D = (t, n) => {
		let { nodes: r } = c.get(), i = d(r, t.id);
		if (!i) return !1;
		if (t.prop === "items") {
			let a = [...i.props.items ?? [""]], o = a[t.index ?? 0] ?? "";
			return a[t.index ?? 0] = o + n, c.commit(h(T(r, i.id, (e) => ({
				...e,
				props: {
					...e.props,
					items: a
				}
			})), e.id)), yr(c, t, nn(o)), !0;
		}
		if (t.prop !== "text" || ![
			"paragraph",
			"heading",
			"quote",
			"callout"
		].includes(i.type)) return !1;
		let a = String(i.props.text ?? "");
		return c.commit(h(T(r, i.id, (e) => ({
			...e,
			props: {
				...e.props,
				text: a + n
			}
		})), e.id)), yr(c, t, nn(a)), !0;
	};
	return /* @__PURE__ */ W(cn, {
		tag: n,
		html: y,
		onChange: b,
		placeholder: i,
		quiet: o,
		className: r,
		focus: v,
		disabled: _,
		onKeyDown: S,
		onFocus: () => c.get().selected !== e.id && c.select(e.id),
		onPaste: (n) => !n.includes("\n") || t !== "text" ? !1 : (import("./paste-D7cHCkV-.js").then((t) => t.pasteMarkdown(c, e, n, l, u)), !0)
	});
}
function Kr({ node: e, renderItem: t }) {
	let { store: n, types: r, allowed: i } = a(), { stops: o, readOnly: s } = gr(), c = Array.isArray(e.props.items) && e.props.items.length ? e.props.items : [""], l = K(n, (t) => t.focus?.id === e.id && t.focus.prop === "items" ? t.focus : null), u = !!e.props.ordered, d = (t, r = `list:${e.id}`) => n.updateProps(e.id, { items: t }, r), m = (t) => (a, s) => {
		if (a.defaultPrevented) return;
		let { nodes: l } = n.get(), u = o(), m = u.findIndex((n) => vr(n, e.id, "items", t));
		if (a.key === "Enter" && !a.shiftKey && !a.metaKey && !a.ctrlKey) {
			if (a.preventDefault(), f(c[t]) && t === c.length - 1) {
				let t = _r(), a = c.slice(0, -1), o = g(l, e.id, "paragraph", r, i);
				if (!o) return;
				let s = a.length ? T(l, e.id, (e) => ({
					...e,
					props: {
						...e.props,
						items: a
					}
				})) : l, u = w(s, o.parentId, o.index, [t]);
				n.commit(a.length ? u : h(u, e.id)), n.focus(t.id, "start");
				return;
			}
			let [o, u] = Xt(s);
			d([
				...c.slice(0, t),
				o,
				u,
				...c.slice(t + 1)
			], ""), n.focus(e.id, "start", "items", t + 1);
		} else if (a.key === "Backspace" && Kt(s)) {
			if (a.preventDefault(), t === 0) {
				let t = _r(c[0]), r = p(l, e.id), i = c.slice(1), a = w(l, r?.parentId ?? null, r?.index ?? 0, [t]);
				a = i.length ? T(a, e.id, (e) => ({
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
			], ""), n.focus(e.id, nn(c[t - 1]), "items", t - 1);
		} else Sr(a, s, n, u, m) || a.key === "Escape" && (a.preventDefault(), s.blur(), n.select(e.id, !0));
	}, _ = (r, i) => /* @__PURE__ */ W(cn, {
		html: r,
		className: t ? void 0 : "min-w-0 flex-1 pl-1",
		tag: t ? "span" : "div",
		placeholder: k("List"),
		quiet: !0,
		disabled: s,
		focus: l && (l.index ?? 0) === i ? l : null,
		onChange: (e) => d(c.map((t, n) => n === i ? e : t)),
		onKeyDown: m(i),
		onFocus: () => n.get().selected !== e.id && n.select(e.id)
	});
	return t ? /* @__PURE__ */ W(U, { children: c.map((e, n) => t(n, _(e, n))) }) : /* @__PURE__ */ W("div", {
		className: V(Br, "space-y-0.5"),
		children: c.map((e, t) => /* @__PURE__ */ G("div", {
			className: "flex",
			children: [/* @__PURE__ */ W("span", {
				className: V("w-6 shrink-0 select-none text-muted", u ? "pr-1.5 text-right tabular-nums" : "pl-1.5"),
				"aria-hidden": !0,
				children: u ? `${t + 1}.` : "•"
			}), _(e, t)]
		}, t))
	});
}
// admin/src/LiveEditor.tsx
var qr = (e, t, n) => e.axis === "x" ? {
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
}, Jr = (e) => `${e.parentId ?? ""}:${e.index}:${e.inside ? "inside" : e.axis}`, Yr = "\nhtml{scrollbar-width:thin;scrollbar-color:rgb(127 127 127/.35) transparent}\n[data-cms-document][data-cms-node]{cursor:default}\n.cms-block-text{display:block;min-width:1ch;min-height:1lh;white-space:pre-wrap;overflow-wrap:break-word;outline:none;border-radius:0;font:inherit;color:inherit;line-height:inherit;text-align:inherit;cursor:text}\n.cms-block-text:empty::before{content:attr(data-placeholder);opacity:.4;pointer-events:none}\n.cms-block-text[data-quiet]:empty:not(:focus)::before{content:none}\n[data-cms-prop]{cursor:text}\n.cms-block-text::selection,.cms-block-text ::selection{background:rgb(0 122 255/.2)}\nimg,a{-webkit-user-drag:none}\niframe{pointer-events:none}\n[data-cms-conditional=hidden]:not([data-cms-reveal]){display:none!important}\n[data-cms-editor-empty-root]{visibility:hidden}\n.cms-js [data-cms-appear]{visibility:visible!important}\n", Xr = /* @__PURE__ */ new Set([
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
function Zr(e, t, n) {
	let r = e.elementFromPoint(t, n);
	if (!r || r === e.body || r === e.documentElement) return !1;
	if (Xr.has(r.tagName) || r.closest("svg")) return !0;
	let i = [...r.childNodes].filter((e) => e.nodeType === Node.TEXT_NODE && e.textContent?.trim());
	if (!i.length) return !1;
	let a = e.createRange();
	return i.some((e) => (a.selectNodeContents(e), [...a.getClientRects()].some((e) => t >= e.left - 2 && t <= e.right + 2 && n >= e.top - 2 && n <= e.bottom + 2)));
}
var Qr = 1024;
function $r({ collection: e, blueprint: n, entryId: r, content: i, onInspect: o, standalone: s, onTitleChange: c }) {
	let { store: u, types: f, allowed: h, fieldHandle: v, readOnly: x = !1 } = a(), w = t(), T = K(u, (e) => e.nodes), E = K(u, (e) => e.selected), D = K(u, He), ne = K(u, (e) => e.blockMode), re = K(u, (e) => e.hovered), ae = K(u, (e) => e.device), O = k("Page Builder"), A = !x && !!E && ne;
	Ie("up", k("Select Previous Block"), O, A), Ie("down", k("Select Next Block"), O, A), Ie("shift+up", k("Select the Block Above Too"), O, A), Ie("shift+down", k("Select the Block Below Too"), O, A), Ie("alt+up", k("Move Up"), O, A), Ie("alt+down", k("Move Down"), O, A), Ie("enter", k("Edit Block"), O, A), Ie("mod+d", k("Duplicate Block"), O, A), Ie("backspace", k("Delete Block"), O, A), Ie("escape", k("Deselect"), O, !!E), Ie("mod+alt+t", k("Insert Before"), O, !x && !!E), Ie("mod+alt+y", k("Insert After"), O, !x && !!E), Ie("mod+z", k("Undo"), O, !x), Ie("mod+shift+z", k("Redo"), O, !x);
	let se = Ft(), ce = P(null), j = P(null), [le, ue] = F(null), M = P(""), [de, pe] = F([]), [me, _e] = F(!0), [I, ve] = F(null), [ye, L] = F(0), [R, z] = F({
		width: 1024,
		height: 700,
		scale: 1,
		left: 0
	}), [be, xe] = F([]), [Se, Ce] = F(null), [we, B] = F([]), [Ee, Oe] = F(null), ke = P(0), V = P(""), [Ae, Me] = F(!1), [Ne, Pe] = F(!1), Fe = P(!1), H = P(null), Le = ge(() => {
		let e = [], t = (n, r) => n.forEach((n, i) => {
			e.push({
				node: n,
				parentId: r,
				index: i
			}), n.children && t(n.children, n.id);
		});
		return t(T, null), e;
	}, [T]), Re = P(Le);
	Re.current = Le;
	let [Be, Ve] = F(null), [Ue, We] = F(!1), Ge = yn(!!e && !!te().collections.find((t) => t.handle === e)?.routable && !x && !s), q = P(Be);
	q.current = Be;
	let J = P(null);
	N(() => {
		Be || (J.current = null);
	}, [Be]);
	let Ke = P(0), Je = P({
		busy: !1,
		queued: !1,
		timer: 0,
		alive: !0
	}), Ye = P(async () => {}), Xe = () => {
		let e = Je.current;
		e.queued = !0, !e.alive || e.busy || e.timer || (e.timer = window.setTimeout(() => {
			e.timer = 0, Ye.current();
		}, M.current ? 80 : 0));
	}, Ze = () => Re.current.map(({ node: e, parentId: t, index: n }) => `${t}:${n}:${e.id}:${e.type}:${e.type === "list" ? e.props.items?.length ?? 0 : ""}`).join("|"), Qe = P(null), $e = P(tr());
	N(() => () => $e.current.unmount(), []);
	let et = P(null), tt = (e) => {
		let t = et.current;
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
	}, nt = P(/* @__PURE__ */ new Map()), rt = (e) => {
		let t = !1;
		for (let { node: n } of Re.current) {
			let r = n.class ?? "", i = nt.current.get(n.id);
			if (nt.current.set(n.id, r), i === void 0 || i === r) continue;
			let a = qe(r), o = qe(i).filter((e) => !a.includes(e));
			for (let r of e.querySelectorAll(`[data-cms-document="${M.current}"][data-cms-node="${CSS.escape(n.id)}"],[data-cms-proto-document="${M.current}"][data-cms-proto="${CSS.escape(n.id)}"]`)) r.classList.remove(...o), r.classList.add(...a), t = !0;
		}
		return t;
	}, it = P({
		content: i,
		onInspect: o,
		readOnly: x,
		layout: R,
		onTitleChange: c
	});
	it.current = {
		content: i,
		onInspect: o,
		readOnly: x,
		layout: R,
		onTitleChange: c
	};
	let Y = (e, t) => e.querySelector(`[data-cms-document="${M.current}"][data-cms-node="${CSS.escape(t)}"]`) ?? e.querySelector(`[data-cms-proto-document="${M.current}"][data-cms-proto="${CSS.escape(t)}"]`), at = (e) => {
		let t = "[data-cms-document][data-cms-node],[data-cms-proto-document][data-cms-proto]", n = e?.closest?.(t) ?? null;
		for (; n;) {
			let e = n.dataset.cmsDocument === M.current ? n.dataset.cmsNode : n.dataset.cmsProtoDocument === M.current ? n.dataset.cmsProto : void 0;
			if (e && d(u.get().nodes, e)) return e;
			n = n.parentElement?.closest(t) ?? null;
		}
		return null;
	}, ot = (e) => {
		if (e.ownerDocument.defaultView?.getComputedStyle(e).display !== "contents") return e.getBoundingClientRect();
		let t = e.ownerDocument.createRange();
		return t.selectNodeContents(e), t.getBoundingClientRect();
	}, X = () => {
		if (H.current) return H.current;
		let e = j.current?.contentDocument, t = e?.querySelector(`[data-cms-editor-root="${M.current}"]`);
		if (!e || !t) return null;
		let n = (t) => {
			let n = e.defaultView.getComputedStyle(t);
			return n.display.includes("flex") && n.flexDirection.startsWith("row") || n.display.includes("grid") && n.gridTemplateColumns.split(" ").length > 1 ? "x" : "y";
		}, r = new Map([...e.querySelectorAll(`[data-cms-document="${M.current}"][data-cms-node]`)].map((e) => [e.dataset.cmsNode, e])), i = Re.current.flatMap(({ node: t, parentId: i, index: a }) => {
			let o = r.get(t.id);
			return !o || e.defaultView.getComputedStyle(o).display === "none" ? [] : [{
				id: t.id,
				parentId: i,
				index: a,
				rect: ot(o),
				container: !!f.get(t.type)?.children && !["repeat", "component"].includes(t.type),
				axis: n(o)
			}];
		}), a = ot(t);
		return a.width === 0 && (a = ot(t.parentElement ?? e.body)), i.length || (a = {
			...a,
			left: a.left,
			top: a.top,
			width: a.width,
			height: Math.max(32, a.height)
		}), H.current = {
			blocks: i,
			rootRect: a,
			scroll: {
				x: e.defaultView.scrollX,
				y: e.defaultView.scrollY
			}
		}, H.current;
	}, st = (e, t = ["paragraph"]) => {
		let n = e ? d(u.get().nodes, e) : null;
		return t.every((e) => C(n, e, f, n ? [] : h));
	}, ct = (e) => [...f.values()].some((t) => st(e, [t.name])), lt = () => {
		let e = /* @__PURE__ */ new Map();
		return (t) => e.get(t) ?? e.set(t, ct(t)).get(t);
	}, ut = () => {
		let e = j.current?.contentDocument, t = X();
		if (!e || !t) return;
		xe(He(u.get()).flatMap((t) => {
			let n = Y(e, t);
			return n ? [ot(n)] : [];
		}));
		let n = u.get().hovered, r = n ? Y(e, n) : null;
		Ce(r ? ot(r) : null);
		let i = Fn(t.blocks, {
			rootRect: t.rootRect,
			canInsert: lt()
		});
		B(i), Ve((t) => {
			if (!t) return t;
			let n = J.current?.key === Jr(t) ? J.current : null, r = n ? Y(e, n.id) : null, a = n ? r ? qr(t, ot(r), n.side) : t : i.find((e) => Jr(e) === Jr(t)) ?? t, o = a.inside ? a.hitRect.top : a.rect.top;
			return o < 0 || o > it.current.layout.height ? null : a;
		});
	}, dt = (e) => {
		let t = e ? Jr(e) : "";
		t !== V.current && (V.current = t, clearTimeout(ke.current), Oe(null), e && (ke.current = window.setTimeout(() => Oe(e), 80)));
	}, ft = (e) => {
		let t = He(u.get()), n = t.length ? p(u.get().nodes, e === "before" ? t[0] : t.at(-1)) : null, r = j.current?.contentDocument;
		if (!n || !r || it.current.readOnly || !ct(n.parentId)) return;
		let i = e === "before" ? n.index : n.index + 1, a = Y(r, e === "before" ? t[0] : t.at(-1)), o = a ? ot(a) : null, s = r.defaultView, c = it.current.layout.height;
		if (o) {
			let t = e === "before" ? o.top : o.top + o.height;
			(t < 48 || t > c - 160) && s.scrollBy(0, t - c / 3);
		}
		requestAnimationFrame(() => {
			H.current = null;
			let r = X(), o = a ? ot(a) : null;
			if (!o) return;
			let s = qr((r && Fn(r.blocks, {
				rootRect: r.rootRect,
				canInsert: lt()
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
			J.current = {
				key: Jr(s),
				id: e === "before" ? t[0] : t.at(-1),
				side: e
			}, dt(null), Ve(s);
		});
	}, pt = () => {
		let e = le?.activeElement;
		if (document.activeElement === j.current && e?.isContentEditable) return e;
		let t = u.get().focus;
		return (t && le ? Y(le, t.id) : null)?.querySelector("[data-cms-inline]") ?? null;
	}, mt = (e) => {
		H.current = null;
		let t = [];
		if (it.current.onTitleChange) for (let t of e.querySelectorAll("[data-cms-entry-field=\"title\"]")) t.querySelector("[data-cms-inline]") || t.replaceChildren();
		for (let n of e.querySelectorAll("[data-cms-prop]")) {
			let e = n.closest("[data-cms-document][data-cms-node]");
			e?.dataset.cmsDocument === M.current && e.dataset.cmsNode && (n.querySelector("[data-cms-inline]") || n.replaceChildren(), t.push({
				element: n,
				id: e.dataset.cmsNode,
				prop: n.dataset.cmsProp,
				...n.dataset.cmsIndex === void 0 ? {} : { index: Number(n.dataset.cmsIndex) }
			}));
		}
		for (let n of e.querySelectorAll("[data-cms-instance-prop]")) n.dataset.cmsInstanceDocument === M.current && n.dataset.cmsInstanceNode && (n.querySelector("[data-cms-inline]") || n.replaceChildren(), t.push({
			element: n,
			id: n.dataset.cmsInstanceNode,
			prop: n.dataset.cmsInstanceProp,
			instance: {
				type: n.dataset.cmsInstanceType ?? "text",
				value: n.dataset.cmsInstanceValue ?? ""
			}
		}));
		pe(t), requestAnimationFrame(ut);
	}, ht = () => {
		let e = j.current?.contentDocument, t = e?.querySelector("[data-cms-editor-root]");
		if (!e || !t || !M.current) return;
		let n = new Set(_(u.get().nodes).map(({ node: e }) => e.id));
		for (let t of e.querySelectorAll("[data-cms-document][data-cms-node]")) t.dataset.cmsDocument === M.current && !n.has(t.dataset.cmsNode) && t.remove();
		let r = (t, n) => {
			for (let i = 0; i < t.length; i++) {
				let a = t[i], o = Y(e, a.id);
				if (!o || o.dataset.cmsType !== a.type) {
					let r = e.querySelector(`template[data-cms-prototype="${CSS.escape(a.type)}"]`)?.content.firstElementChild?.cloneNode(!0);
					if (!r) continue;
					if (r.dataset.cmsNode = a.id, r.dataset.cmsDocument = M.current, o) o.replaceWith(r);
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
		u.get().nodes.length && t.querySelector(":scope > [data-cms-editor-empty-root]")?.remove(), r(u.get().nodes, t), rt(e), tt(e), mt(e);
	}, gt = ge(() => ({
		stops: () => Dr(Er(u.get().nodes, f, () => !1)).filter((e) => de.some((t) => t.id === e.id && t.prop === e.prop && (e.index === void 0 || t.index === e.index))),
		settings: (e) => it.current.onInspect(e),
		readOnly: x
	}), [
		u,
		f,
		de,
		x
	]), _t = P(gt);
	_t.current = gt, he(() => {
		H.current = null, ht();
	}, [T, le]), he(() => {
		if (!ce.current) return;
		let e = () => {
			let e = ce.current, t = ae === "tablet" ? je.tablet : ae === "phone" ? Math.min(je.phone, e.clientWidth) : Math.max(e.clientWidth, Qr);
			u.setCanvasWidth(t);
			let n = Math.min(1, e.clientWidth / t);
			H.current = null, z({
				width: t,
				scale: n,
				height: e.clientHeight / n,
				left: Math.max(0, (e.clientWidth - t * n) / 2)
			});
		};
		e();
		let t = new ResizeObserver(e);
		return t.observe(ce.current), () => t.disconnect();
	}, [ae, u]), N(() => {
		requestAnimationFrame(ut);
	}, [
		E,
		D,
		re,
		R,
		le
	]), Ye.current = async () => {
		let t = Je.current;
		t.queued = !1, t.busy = !0;
		let a = Ke.current, o = Ze(), c = new Map(Re.current.map(({ node: e }) => [e.id, e.class ?? ""])), l = new AbortController();
		Qe.current = l;
		try {
			let { text: d, headers: f } = await oe("POST", r ? `/__preview/${r}` : "/__preview", {
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
			if (!t.alive || l.signal.aborted || a !== Ke.current && o !== Ze()) return;
			let p = f.get("X-Cms-Editor-Document");
			if (!p) throw Error(k("The editor could not load its rendering context."));
			let m = new DOMParser().parseFromString(d, "text/html");
			if (!m.querySelector(`[data-cms-editor-root="${p}"]`)) throw Error(k("This template has no content outlet. Choose a template that includes the content field."));
			m.querySelectorAll("script").forEach((e) => {
				e.type === "importmap" && (e.dataset.cmsImportmap = ""), e.type = "text/cms-off", e.removeAttribute("src");
			}), M.current = p;
			let h = j.current?.contentDocument;
			h?.documentElement?.hasAttribute("data-cms-bridge-ready") ? ($e.current.unmount(), nr(h, m), h.documentElement.setAttribute("data-cms-bridge-ready", ""), nt.current = c, rt(h), tt(h), mt(h), $e.current.mount(h)) : j.current && (nt.current = c, j.current.srcdoc = m.documentElement.outerHTML), a === Ke.current && ve(null);
		} catch (e) {
			!l.signal.aborted && a === Ke.current && (ve(e instanceof Error ? e.message : String(e)), _e(!1));
		} finally {
			t.busy = !1, t.queued && Xe();
		}
	}, N(() => {
		Ke.current++, Xe();
	}, [
		r,
		e,
		n,
		i,
		T,
		v,
		s,
		ye
	]), N(() => (Je.current.alive = !0, Je.current.queued && Xe(), () => {
		Je.current.alive = !1, clearTimeout(Je.current.timer), Je.current.timer = 0, Qe.current?.abort();
	}), []);
	let vt = (e, t) => {
		let n = y(e, f);
		n.length && !x && st(t.parentId, n.map((e) => e.type)) && (u.insert(t.parentId, t.index, n), br(u, n[0], Dr(Er(u.get().nodes, f, () => !1))), Ve(null), dt(null));
	}, yt = () => {
		if (it.current.readOnly || !st(null)) return;
		let e = _r();
		u.insert(null, 0, [e]), u.focus(e.id, "start");
	}, bt = () => {
		let e = j.current?.contentDocument;
		return e ? Re.current.filter(({ node: t }) => {
			let n = Y(e, t.id);
			return !!n && e.defaultView.getComputedStyle(n).display !== "none";
		}).map(({ node: e }) => e.id) : [];
	}, xt = (e) => {
		if (!e) return;
		u.select(e, !0);
		let t = j.current?.contentDocument;
		(t && Y(t, e))?.scrollIntoView({ block: "nearest" });
	}, St = (e) => {
		let t = e.metaKey || e.ctrlKey, n = He(u.get()), r = u.get().selected;
		if (e.key === "Escape") {
			u.select(null);
			return;
		}
		if (!r || !u.get().blockMode) return;
		let i = bt(), a = i.indexOf(u.get().head ?? r);
		if (["ArrowUp", "ArrowDown"].includes(e.key)) {
			e.preventDefault();
			let t = e.key === "ArrowUp";
			e.altKey ? u.nudgeSelection(t ? -1 : 1) : e.shiftKey ? u.extend(t ? -1 : 1) : xt(i[a + (t ? -1 : 1)]);
		} else if (e.key === "Enter") {
			e.preventDefault();
			let t = d(u.get().nodes, r), n = _t.current.stops(), i = t ? new Set(_([t]).map((e) => e.node.id)) : /* @__PURE__ */ new Set();
			n.some((e) => i.has(e.id)) ? br(u, t, n) : it.current.onInspect(r);
		} else if (e.key === "Backspace" || e.key === "Delete") {
			e.preventDefault();
			let t = new Set(n.flatMap((e) => {
				let t = d(u.get().nodes, e);
				return t ? _([t]).map((e) => e.node.id) : [];
			})), r = i.findIndex((e) => t.has(e)), a = i.slice(0, Math.max(0, r)).reverse().find((e) => !t.has(e)) ?? i.slice(r + 1).find((e) => !t.has(e));
			u.removeSelection(), xt(a);
		} else t && e.key.toLowerCase() === "d" && (e.preventDefault(), u.duplicateSelection());
	}, Ct = () => {
		let e = j.current?.contentDocument;
		if (!e || !M.current) return;
		if (!e.querySelector("[data-cms-editor-root]")) {
			_e(!1), ve(k("This template has no content outlet. Choose a template that includes the content field."));
			return;
		}
		e.documentElement.setAttribute("data-cms-bridge-ready", "");
		let t = e.createElement("style");
		t.dataset.cmsBridge = "", t.textContent = Yr, e.head.appendChild(t), rt(e), tt(e), ue(e), mt(e), _e(!1), $e.current.unmount(), $e.current.mount(e), e.addEventListener("submit", (e) => e.preventDefault(), !0), e.addEventListener("dragstart", (e) => e.preventDefault()), e.addEventListener("focusout", (e) => {
			e.target.isContentEditable && Me(!1), Xe();
		}), e.addEventListener("focusin", (e) => {
			let t = e.target;
			if (!t.isContentEditable) return;
			Me(!0);
			let n = t.closest("[data-cms-instance-node],[data-cms-document][data-cms-node]");
			u.select(n?.dataset.cmsInstanceNode ?? n?.dataset.cmsNode ?? null), u.hover(null);
		}), e.addEventListener("pointermove", (e) => {
			if (it.current.readOnly || (Fe.current && (e.movementX || e.movementY) && (Fe.current = !1, Pe(!1)), u.hover(at(e.target)), Fe.current || q.current)) return;
			let t = X();
			dt(t && In(t.blocks, {
				x: e.clientX,
				y: e.clientY
			}, {
				rootRect: t.rootRect,
				canInsert: lt()
			}));
		}), e.addEventListener("pointerdown", () => {
			Ve(null), dt(null);
		}), e.addEventListener("click", (e) => {
			let t = e.target;
			if (t.closest("[contenteditable=\"true\"]")) {
				t.closest("a") && e.preventDefault();
				return;
			}
			e.preventDefault();
			let n = at(t);
			n ? e.shiftKey && u.get().selected ? u.extendTo(n) : it.current.onInspect(n) : e.shiftKey || u.select(null);
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
			else if (!it.current.readOnly) {
				if (n && t.key.toLowerCase() === "z") {
					if (e.activeElement?.closest("[data-cms-entry-field]")) return;
					t.preventDefault();
					let n = e.activeElement, r = n?.closest("[data-cms-prop]"), i = n?.closest("[data-cms-instance-prop]"), a = r?.closest("[data-cms-node]");
					n?.blur(), t.shiftKey ? u.redo() : u.undo(), a?.dataset.cmsNode && r?.dataset.cmsProp && d(u.get().nodes, a.dataset.cmsNode) ? u.focus(a.dataset.cmsNode, "end", r.dataset.cmsProp, r.dataset.cmsIndex === void 0 ? void 0 : Number(r.dataset.cmsIndex)) : i?.dataset.cmsInstanceNode && d(u.get().nodes, i.dataset.cmsInstanceNode) && u.focus(i.dataset.cmsInstanceNode, "end", `values.${i.dataset.cmsInstanceProp}`);
				} else n && t.altKey && (t.code === "KeyT" || t.code === "KeyY") ? (t.preventDefault(), ft(t.code === "KeyT" ? "before" : "after")) : t.target.isContentEditable ? n || t.altKey || t.key.length !== 1 && ![
					"Backspace",
					"Delete",
					"Enter"
				].includes(t.key) || (Fe.current = !0, Pe(!0), dt(null)) : St(t);
			}
		});
		let n = (e) => u.get().blockMode && !!u.get().selected && !e.target.isContentEditable, r = (e, t) => {
			if (!n(e) || !e.clipboardData) return;
			let r = He(u.get()).map((e) => d(u.get().nodes, e)).filter(Boolean);
			r.length && (e.preventDefault(), e.clipboardData.setData("text/plain", "cms-blocks:" + JSON.stringify(r)), t && !it.current.readOnly && u.removeSelection());
		};
		e.addEventListener("copy", (e) => r(e, !1)), e.addEventListener("cut", (e) => r(e, !0)), e.addEventListener("paste", (e) => {
			let t = e.clipboardData?.getData("text/plain") ?? "";
			if (!n(e) || it.current.readOnly || !t.startsWith("cms-blocks:")) return;
			e.preventDefault();
			let r;
			try {
				r = JSON.parse(t.slice(12)).map(b);
			} catch {
				return;
			}
			let i = u.get().nodes, a = g(i, He(u.get()).at(-1), r.map((e) => e.type), f, h);
			a && r.length && (u.insert(a.parentId, a.index, r), u.select(r[0].id, !0), r.length > 1 && u.extendTo(r.at(-1).id));
		});
		let i = 0;
		e.addEventListener("scroll", () => {
			let t = H.current, n = e.defaultView;
			if (t) {
				let e = n.scrollX - t.scroll.x, r = n.scrollY - t.scroll.y, i = (t) => ({
					...t,
					left: t.left - e,
					top: t.top - r
				});
				H.current = {
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
			ze(() => {
				dt(null), ut();
			}), clearTimeout(i), i = window.setTimeout(() => {
				H.current = null, ut();
			}, 150);
		}, { passive: !0 }), e.defaultView?.addEventListener("resize", () => {
			H.current = null, requestAnimationFrame(ut);
		}), e.querySelectorAll("img,link[rel=\"stylesheet\"]").forEach((e) => e.addEventListener("load", () => {
			H.current = null, requestAnimationFrame(ut);
		}, { once: !0 })), e.fonts.ready.then(() => {
			H.current = null, ut();
		});
	};
	N(() => {
		let e = se.source;
		if (!e) return;
		let t = !0;
		return Ot(e).then((n) => {
			if (!t) return;
			et.current = {
				build: n.build,
				faces: e.faces
			};
			let r = j.current?.contentDocument;
			r?.documentElement?.hasAttribute("data-cms-bridge-ready") && (tt(r), H.current = null, requestAnimationFrame(ut));
		}).catch(() => {
			t && (et.current = null);
		}), () => {
			t = !1;
		};
	}, [se.source]), N(() => mr.on("scroll-to", ({ node: e, top: t }) => {
		let n = j.current?.contentDocument, r = n && Y(n, e);
		r && t ? n.defaultView?.scrollTo({
			top: Math.max(0, r.getBoundingClientRect().top + n.defaultView.scrollY - 72),
			behavior: "smooth"
		}) : r && r.scrollIntoView({
			block: "center",
			behavior: "smooth"
		});
	}), []), N(() => {
		let e = j.current?.contentDocument;
		if (e) {
			e.querySelectorAll("[data-cms-reveal]").forEach((e) => e.removeAttribute("data-cms-reveal"));
			for (let t of D) {
				let n = Y(e, t);
				for (; n;) n.dataset.cmsConditional === "hidden" && (n.dataset.cmsReveal = ""), n = n.parentElement;
			}
		}
	}, [D]);
	let wt = rr({
		disabled: x,
		frame: j,
		scale: R.scale,
		invalidate: () => {
			H.current = null, ut();
		},
		target: (e, t) => {
			let n = X();
			if (!n || e.x < n.rootRect.left || e.x > n.rootRect.left + n.rootRect.width || e.y < n.rootRect.top - 12 || e.y > n.rootRect.top + n.rootRect.height + 12) return null;
			let r = t.map((e) => d(u.get().nodes, e));
			if (r.some((e) => !e)) return null;
			let i = r.map((e) => e.type);
			return Ln(n.blocks, e, {
				rootRect: n.rootRect,
				maxDistance: Infinity,
				excludeIds: new Set(t),
				canInsert: (e) => st(e, i)
			});
		},
		commit: (e, t) => u.moveTo(e, t.parentId, t.index)
	}), Tt = (e) => {
		let t = j.current?.contentDocument;
		if (!t) return !1;
		for (let n of [.25, .75]) for (let r = 0; r < 6; r++) if (Zr(t, (e.left + e.width * (r + .5) / 6 - R.left) / R.scale, (e.top + e.height * n) / R.scale)) return !0;
		return !1;
	}, Et = fe(() => {
		let e = j.current.getBoundingClientRect();
		return {
			x: e.left,
			y: e.top,
			scale: R.scale
		};
	}, [R.scale]), Dt = (e) => ({
		left: R.left + e.left * R.scale,
		top: e.top * R.scale,
		width: e.width * R.scale,
		height: e.height * R.scale
	});
	return /* @__PURE__ */ G(hr.Provider, {
		value: gt,
		children: [Ue && /* @__PURE__ */ W(bn, {
			open: !0,
			onOpenChange: We,
			patterns: Ge,
			onChoose: (e) => {
				let t = e.blocks.map((e) => b(e));
				u.insert(null, 0, t), u.select(t[0]?.id ?? null), We(!1);
			}
		}), /* @__PURE__ */ G("div", {
			className: "flex h-full min-h-0 flex-col",
			"data-live-editor": !0,
			children: [
				I && /* @__PURE__ */ W(Te, {
					compact: !0,
					message: I,
					onRetry: () => L((e) => e + 1)
				}),
				/* @__PURE__ */ G("div", {
					ref: ce,
					onPointerLeave: () => {
						u.hover(null), dt(null);
					},
					onPointerMove: (e) => {
						e.target.closest("[data-cms-inserter]") || (dt(null), u.hover(null));
					},
					className: "relative min-h-0 flex-1 overflow-hidden bg-sunken",
					children: [
						me && /* @__PURE__ */ W("div", {
							className: "absolute inset-0 z-drag grid place-items-center bg-bg",
							children: /* @__PURE__ */ W(De, {})
						}),
						/* @__PURE__ */ W("iframe", {
							ref: j,
							title: k("Live editor"),
							sandbox: "allow-same-origin",
							onLoad: Ct,
							className: "absolute top-0 border-0 bg-white",
							style: {
								width: R.width,
								height: R.height,
								left: R.left,
								transformOrigin: "top left",
								transform: `scale(${R.scale})`
							}
						}),
						/* @__PURE__ */ G("div", {
							className: "pointer-events-none absolute inset-0 overflow-hidden",
							children: [
								!x && !wt.drag && !Ae && !Ne && !Be && re && Se && !D.includes(re) && /* @__PURE__ */ W("div", {
									"data-cms-hover": re,
									className: "absolute z-raised border border-focus/50",
									style: Dt(Se)
								}),
								!wt.drag && be.map((e, t) => /* @__PURE__ */ W("div", {
									"data-cms-selection": !0,
									className: "absolute z-raised border-solid border-focus",
									style: {
										...Dt(e),
										borderWidth: 1.5
									}
								}, t)),
								!x && !wt.drag && ne && E && be[0] && (() => {
									let e = p(T, D[0]), t = p(T, D.at(-1)), n = d(T, E);
									if (!e || !t || !n) return null;
									let r = m(T, e.parentId), i = (e) => ({
										label: l(e, f, w),
										icon: e.type === "component" ? "symbol" : f.get(e.type)?.icon ?? "square"
									}), a = e.parentId ? d(T, e.parentId) : null, { label: s, icon: c } = i(n);
									return /* @__PURE__ */ W(dr, {
										id: E,
										label: D.length > 1 ? ie(D.length, "{count} block", "{count} blocks") : s,
										icon: c,
										parent: a ? i(a) : null,
										box: Dt(be[0]),
										viewport: {
											width: R.width * R.scale + R.left * 2,
											height: R.height * R.scale
										},
										canMoveUp: e.index > 0,
										canMoveDown: t.index < r.length - 1,
										onSelectParent: () => a && o(a.id),
										onDrag: (e) => {
											Ve(null), wt.start(e, He(u.get()), s);
										},
										onMove: (e) => u.nudgeSelection(e),
										onInsert: (e) => requestAnimationFrame(() => ft(e)),
										onDuplicate: () => u.duplicateSelection(),
										onDelete: () => u.removeSelection(),
										onMakeComponent: n.type !== "component" && ee("entries.components.create") && S(u, f, h) ? () => gn(u) : void 0,
										onSavePattern: ee("entries.patterns.create") ? () => _n(u) : void 0,
										covers: Tt
									});
								})(),
								!x && !wt.drag && we.filter((e) => e.inside).map((e) => {
									let t = {
										open: !!Be && Jr(Be) === Jr(e),
										onOpenChange: (t) => Ve(t ? e : null),
										returnFocus: pt,
										children: /* @__PURE__ */ W(Gn, {
											types: [...f.values()],
											allowed: (t) => st(e.parentId, [t.name]),
											onChoose: (t) => vt(t, e),
											onClose: () => Ve(null)
										})
									};
									if (e.parentId === null) return T.length ? null : /* @__PURE__ */ W(lr, {
										target: e,
										position: Dt,
										onWrite: st(null) ? yt : void 0,
										onPattern: Ge.length ? () => We(!0) : void 0,
										...t
									}, "root");
									let n = e.hitRect.top;
									return d(T, e.parentId)?.children?.length || n + e.hitRect.height < 0 || n > R.height || !(t.open || re === e.parentId || D.includes(e.parentId)) ? null : /* @__PURE__ */ W(cr, {
										target: e,
										position: Dt,
										...t
									}, Jr(e));
								}),
								!x && !wt.drag && (() => {
									let e = Be && !Be.inside ? Be : !Be && !Ne ? Ee : null;
									return e ? /* @__PURE__ */ W(sr, {
										target: e,
										position: Dt,
										open: Be === e,
										onOpenChange: (t) => {
											Ve(t ? e : null), t || dt(null);
										},
										returnFocus: pt,
										children: /* @__PURE__ */ W(Gn, {
											types: [...f.values()],
											allowed: (t) => st(e.parentId, [t.name]),
											onChoose: (t) => vt(t, e),
											onClose: () => Ve(null)
										})
									}, Jr(e)) : null;
								})(),
								wt.drag && /* @__PURE__ */ W(fr, {
									drag: wt.drag,
									position: Dt
								})
							]
						})
					]
				}),
				le && /* @__PURE__ */ G(U, { children: [
					/* @__PURE__ */ W(ei, { slots: de }),
					c && /* @__PURE__ */ W(ii, {
						doc: le,
						content: i,
						onChange: c,
						readOnly: x
					}),
					/* @__PURE__ */ W(dn, {
						root: le,
						offset: Et
					}),
					/* @__PURE__ */ W(ri, {
						doc: le,
						frame: j.current,
						scale: R.scale
					})
				] })
			]
		})]
	});
}
var ei = de(function({ slots: e }) {
	let { store: t } = a(), n = K(t, (e) => e.nodes), r = new Set(e.filter((e) => !e.instance && e.prop === "items").map((e) => e.id)), i = /* @__PURE__ */ new Map();
	return /* @__PURE__ */ G(U, { children: [e.filter((e) => e.instance || e.prop !== "items").map((e) => {
		let t = d(n, e.id);
		if (!t) return null;
		let r = `${e.instance ? "instance:" : ""}${e.id}:${e.prop}`, a = i.get(r) ?? 0;
		return i.set(r, a + 1), Re(e.instance ? /* @__PURE__ */ W(ti, {
			node: t,
			slot: e
		}) : [
			"text",
			"cite",
			"caption"
		].includes(e.prop) ? t.type === "paragraph" && e.prop === "text" ? /* @__PURE__ */ W(Gr, {
			node: t,
			prop: "text",
			tag: "span",
			placeholder: k("Write, or press “/” for blocks"),
			quiet: !0
		}) : /* @__PURE__ */ W(Gr, {
			node: t,
			prop: e.prop,
			tag: "span",
			placeholder: e.element.dataset.cmsPlaceholder ?? k("Write something…")
		}) : /* @__PURE__ */ W(ni, {
			node: t,
			prop: e.prop
		}), e.element, `${r}:${a}`);
	}), [...r].map((t) => {
		let r = d(n, t);
		return r ? /* @__PURE__ */ W(Kr, {
			node: r,
			renderItem: (n, r) => {
				let i = e.find((e) => e.id === t && e.prop === "items" && e.index === n);
				return i ? Re(r, i.element, `${t}:items:${n}`) : null;
			}
		}, t) : null;
	})] });
});
function ti({ node: e, slot: t }) {
	let { store: n, readOnly: r } = a(), i = K(n, (n) => n.focus?.id === e.id && n.focus.prop === `values.${t.prop}` ? n.focus : null), o = String((Object.prototype.hasOwnProperty.call(e.props.values ?? {}, t.prop) ? e.props.values[t.prop] : t.instance.value) ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
	return /* @__PURE__ */ W(cn, {
		tag: "span",
		html: o,
		focus: i,
		plainText: !0,
		singleLine: t.instance.type === "text",
		disabled: r,
		placeholder: t.element.dataset.cmsPlaceholder ?? k("Write something…"),
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
function ni({ node: e, prop: t }) {
	let { store: n, readOnly: r } = a(), i = K(n, (n) => n.focus?.id === e.id && n.focus.prop === t ? n.focus : null), o = String(e.props[t] ?? ""), s = t === "code" ? o.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>") : o;
	return /* @__PURE__ */ W(cn, {
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
function ri({ doc: e, frame: t, scale: n }) {
	let r = Ir(), { store: i, types: o, allowed: s } = a(), [l, u] = F(null);
	if (he(() => {
		u(r ? en(e) : null);
	}, [r, e]), Rr(!!r, [document, e]), !r || !l || !d(i.get().nodes, r.id)) return null;
	let f = (e) => {
		let t = y(e, o), n = i.get().nodes, a = p(n, r.id);
		if (!a || !t.length) return;
		let c = a.parentId ? d(n, a.parentId) : null, l = t.every((e) => C(c, e.type, o, c ? [] : s)) ? a : g(n, r.id, t.map((e) => e.type), o, s);
		l && (Fr(null), i.commit(w(h(n, r.id), l.parentId, l.index, t)), br(i, t[0], Dr(Er(i.get().nodes, o, () => !1))));
	}, m = t.getBoundingClientRect(), { maxHeight: _, ...v } = Lr({
		left: m.left + l.left * n,
		top: m.top + l.top * n,
		bottom: m.top + l.bottom * n
	});
	return Re(/* @__PURE__ */ W("div", {
		"data-cms-slash": !0,
		className: "cms-pop fixed z-overlay overflow-hidden !p-0",
		style: v,
		children: /* @__PURE__ */ W(c, {
			types: [...o.values()],
			query: r.query,
			showSearch: !1,
			compact: !0,
			style: { maxHeight: _ },
			chooseFirst: r.enter,
			keyboardDocument: e,
			onChoose: f,
			onClose: () => Fr(null),
			onNoMatch: () => {
				Fr(null);
			},
			allowed: (e) => !!g(i.get().nodes, r.id, e.name, o, s)
		})
	}), document.body);
}
function ii({ doc: e, content: t, onChange: n, readOnly: r }) {
	let i = [...e.querySelectorAll("[data-cms-entry-field=\"title\"]")];
	return /* @__PURE__ */ W(U, { children: i.map((i, a) => {
		let o = t.title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
		return Re(/* @__PURE__ */ W(cn, {
			tag: "span",
			html: o,
			singleLine: !0,
			disabled: r,
			placeholder: k("Untitled"),
			onChange: (e, t) => n(t.textContent ?? ""),
			onKeyDown: (t, n) => {
				t.key === "Enter" && (t.preventDefault(), n.blur(), e.querySelector("[data-cms-editor-root] [contenteditable=\"true\"]")?.focus());
			}
		}), i, `title:${a}`);
	}) });
}
// admin/src/builder/controls.tsx
var ai = "w-[88px]", oi = "cms.inspector.collapsed";
function si() {
	try {
		let e = JSON.parse(localStorage.getItem(oi) ?? "{}");
		return e && typeof e == "object" && !Array.isArray(e) ? Object.fromEntries(Object.entries(e).filter(([, e]) => typeof e == "boolean")) : {};
	} catch {
		return {};
	}
}
function ci({ title: e, children: t, open: n = !0, actions: r, empty: i, fields: a, remember: o = !0 }) {
	let [s, c] = F(() => !o || si()[e] === void 0 ? n : !si()[e]), l = (t) => {
		if (c(t), o) try {
			localStorage.setItem(oi, JSON.stringify({
				...si(),
				[e]: !t
			}));
		} catch {}
	}, u = !!(i && r && !a);
	return /* @__PURE__ */ G("section", {
		"data-section": e,
		className: "min-w-0 border-b border-border last:border-b-0",
		children: [/* @__PURE__ */ G("header", {
			className: "group/section flex h-10 items-center gap-1 pl-4 pr-3",
			children: [u ? /* @__PURE__ */ W("span", {
				className: "min-w-0 flex-1 truncate text-xs font-semibold text-ink",
				children: e
			}) : /* @__PURE__ */ G(I, {
				variant: "ghost",
				onClick: () => l(!s),
				"aria-expanded": s,
				className: "!h-full min-w-0 flex-1 shrink !justify-start !gap-1.5 !rounded-none !bg-transparent !px-0 text-left !text-xs !font-semibold !text-ink focus-visible:!-outline-offset-2",
				children: [
					/* @__PURE__ */ W("span", {
						className: "min-w-0 truncate",
						children: e
					}),
					i === !1 && /* @__PURE__ */ W("span", {
						className: "size-1.5 shrink-0 rounded-full bg-focus",
						"aria-hidden": !0
					}),
					/* @__PURE__ */ W(L, {
						name: "chevron-down",
						size: 10,
						className: V("shrink-0 text-faint transition-[rotate,opacity] duration-fast", s ? "opacity-0 group-hover/section:opacity-100 group-focus-within/section:opacity-100" : "-rotate-90")
					})
				]
			}), r && /* @__PURE__ */ W("span", {
				className: "contents",
				onClickCapture: () => !s && l(!0),
				children: r
			})]
		}), s && !u && /* @__PURE__ */ W("div", {
			className: "space-y-1 px-4 pb-3",
			children: t
		})]
	});
}
function li({ children: e, className: t }) {
	return /* @__PURE__ */ W("div", {
		"data-section": "content",
		className: V("space-y-1 border-b border-border px-4 py-3 last:border-b-0", t),
		children: e
	});
}
function ui({ title: e, action: t }) {
	return /* @__PURE__ */ G("div", {
		className: "flex h-7 items-center justify-between pt-1",
		children: [/* @__PURE__ */ W("span", {
			className: "text-xs text-muted",
			children: e
		}), t]
	});
}
function di({ field: e, children: t, htmlFor: n, className: r }) {
	let i = e.status, a = e.reset, o = t ?? e.label, s = V("flex min-h-7 min-w-0 shrink-0 items-center text-left text-xs", ai, i ? "text-ink" : "text-muted", r), c = /* @__PURE__ */ W("span", {
		className: V("min-w-0 py-0.5 leading-[1.25] [overflow-wrap:anywhere]", i && "-ml-1 rounded-xs px-1 box-decoration-clone", i === "own" ? "bg-focus-soft" : i === "inherited" && "bg-active"),
		children: o
	});
	return i === "own" && a ? /* @__PURE__ */ W(ke, {
		content: k("Reset {label}", { label: String(e.label ?? "") }),
		children: /* @__PURE__ */ W(I, {
			variant: "ghost",
			onClick: a,
			className: V(s, "!h-auto !justify-start !whitespace-normal !rounded-xs !bg-transparent !px-0 !text-xs !font-normal !text-ink"),
			children: c
		})
	}) : i === "inherited" ? /* @__PURE__ */ W(ke, {
		content: k("Inherited from a larger screen, another state or the component"),
		children: /* @__PURE__ */ W("label", {
			htmlFor: n,
			className: s,
			children: c
		})
	}) : /* @__PURE__ */ W("label", {
		htmlFor: n,
		className: s,
		title: e.instructions,
		children: c
	});
}
function fi(e) {
	if (e.stack === !0 || Le.includes(e.type) && !e.component) return !0;
	if (e.type !== "select" || e.component || e.display !== "segmented") return !1;
	let t = Object.values(e.options ?? {}).map((e) => typeof e == "string" ? e : e && typeof e == "object" && "label" in e ? String(e.label ?? "") : "").filter(Boolean);
	return t.length > 3 || t.join(" ").length > 20;
}
var pi = (e) => e === "xs" || e === void 0 ? "sm" : e;
function Z({ fields: e, values: t, onChange: n, disabled: r, context: i = {}, className: a, bare: o }) {
	_e(ae.fields.subscribe, ae.fields.version);
	let s = ce();
	return /* @__PURE__ */ W("div", {
		className: V("min-w-0", a ?? "space-y-1"),
		children: e.filter((e) => Ne(e, t)).map((e) => {
			let a = s?.fieldTypes.find((t) => t.key === e.type), c = ae.fields.get(e.component ?? a?.component ?? e.type) ?? ae.fields.get("json");
			if (!c) return null;
			let l = {
				...e,
				size: pi(e.size),
				fit: !0,
				id: Me(e, i.path)
			}, u = !o && fi(e), d = /* @__PURE__ */ W(c, {
				field: l,
				value: t[e.handle] ?? e.default ?? null,
				onChange: (t) => n(e.handle, t),
				disabled: r,
				context: {
					...i,
					values: t
				}
			});
			return /* @__PURE__ */ G("div", {
				"data-field": e.handle,
				className: V("flex min-w-0", u ? "flex-col items-stretch" : "min-h-7 items-center gap-2", e.className),
				children: [!o && e.type !== "toggle" && /* @__PURE__ */ W(di, {
					field: l,
					htmlFor: l.id,
					className: u ? "!w-auto" : void 0
				}), /* @__PURE__ */ W("div", {
					className: V("flex min-w-0 items-center", !u && "flex-1"),
					children: d
				})]
			}, e.handle);
		})
	});
}
var mi = "cms-input h-7 w-full min-w-0 rounded-sm px-2 text-sm placeholder:text-ghost";
function hi({ color: e, dark: t, className: n }) {
	return /* @__PURE__ */ G("span", {
		className: V("relative inline-block size-4 shrink-0 overflow-hidden rounded-xs align-middle cms-checkerboard [--checker:6px]", n),
		children: [
			/* @__PURE__ */ W("span", {
				className: "absolute inset-0",
				style: { background: e }
			}),
			t && /* @__PURE__ */ W("span", {
				className: "absolute inset-0 [clip-path:polygon(100%_50%,100%_100%,50%_100%)]",
				style: { background: t }
			}),
			/* @__PURE__ */ W("span", { className: "cms-swatch-edge" })
		]
	});
}
var gi = M(function({ className: e, children: t, ...n }, r) {
	return /* @__PURE__ */ W(I, {
		ref: r,
		variant: "ghost",
		icon: "plus",
		className: V("w-full !justify-start !gap-1.5 !px-1.5 !text-xs !font-normal !text-muted hover:!text-ink", e),
		...n,
		children: t
	});
});
function _i({ onClick: e, label: t = k("Add") }) {
	return /* @__PURE__ */ W(ke, {
		content: t,
		children: /* @__PURE__ */ W(R, {
			icon: "plus",
			label: t,
			title: void 0,
			size: "xs",
			onClick: e
		})
	});
}
function vi({ onClick: e, label: t = k("Remove") }) {
	return /* @__PURE__ */ W(ke, {
		content: t,
		children: /* @__PURE__ */ W(R, {
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
var yi = (e) => e.startsWith("-") ? e : e.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`), bi = (e) => e.startsWith("-") ? e : e.replace(/-([a-z])/g, (e, t) => t.toUpperCase()), xi = (e) => e.replace(/^!|!$/g, "");
function Si(e) {
	let t = e.trim();
	for (let e = 0; e < 3; e++) {
		let e = t.replace(/var\(--tw-[\w-]+,\s*((?:[^()]|\((?:[^()]|\([^()]*\))*\))+)\)/g, "$1").replace(/calc\((\d+) \/ (\d+) \* 100%\)/g, (e, t, n) => `${+(Number(t) / Number(n) * 100).toFixed(4)}%`).replace(/calc\((-?[\d.]+)([a-z%]*) \* -1\)/g, (e, t, n) => `${-Number(t)}${n}`);
		if (e === t) break;
		t = e;
	}
	return t;
}
var Ci = (e) => e?.match(/^[a-zA-Z-]+\((.*)\)$/)?.[1];
function wi(e, t, n, r, i) {
	let a = [...n.variant ? [n.variant] : [], ...r], o = J(a), s = t.map((e) => {
		let { variants: t, utility: n } = q(e);
		return {
			raw: e,
			layer: J(t),
			utility: xi(n)
		};
	}), c = e ? new at(e, t, n, r) : null, l = (e) => {
		let t = c?.find(yi(e));
		return t ? {
			value: Si(t.value),
			own: t.own
		} : void 0;
	}, u = (n, r) => {
		!e || n.length === t.length && n.every((e, n) => e === t[n]) || i(e.sort([...new Set(n)]), r);
	}, d = (t) => new at(e, t, n, r), f = {
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
			let i = Object.fromEntries(Object.entries(n).map(([e, t]) => [yi(e), typeof t == "string" ? t.replace(/"/g, "'") : t])), a = "width" in i || "height" in i ? Ti(e, t, o) : t;
			u(d(a).set(i), r ?? Object.keys(n).join(","));
		},
		own: () => e ? d(t).own().map(bi) : [],
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
			let o = t, s = () => wi(e, o, n, r, (e) => {
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
function Ti(e, t, n) {
	return t.flatMap((t) => {
		let { variants: r, utility: i } = q(t);
		if (J(r) !== n || !/^-?size-/.test(xi(i))) return [t];
		let a = ["w", "h"].map((e) => i.replace("size-", `${e}-`));
		return a.every((t) => e.valid(t)) ? a.map((e) => Ke(r, e)) : [t];
	});
}
function Ei(e, t, n, r) {
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
			let e = Di[String(+s.toFixed(2))];
			e && (u = a(`${n}${t}-${e}`));
		} else r === "px" && (o === "px" || o === "" && s === 0) || r === "deg" && (o === "deg" || o === "") ? u = l(s) : r === "ms" && (o === "ms" || o === "s") ? u = l(o === "s" ? s * 1e3 : s) : r === "percent" && o === "%" ? u = l(s) : r === "percent" && o === "" ? u = l(s * 100) : r === "number" && o === "" && (u = l(s));
		if (u) return u;
	}
	return e.make(t, i);
}
var Di = {
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
}, Oi = {
	"to top": "0deg",
	"to right": "90deg",
	"to bottom": "180deg",
	"to left": "270deg"
}, ki = {
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
}, Ai = [
	"background-image",
	"--tw-gradient-from",
	"--tw-gradient-via",
	"--tw-gradient-to",
	"--tw-gradient-from-position",
	"--tw-gradient-via-position",
	"--tw-gradient-to-position"
];
function ji(e, t) {
	let n = () => {
		let n = `${t.kind}-gradient(${[t.angle, ...t.stops.map((e) => `${e.color}${e.at ? ` ${e.at}` : ""}`)].filter(Boolean).join(", ")})`, r = e.make("bg", n);
		return [r && e.declarations(r)?.some((e) => e.property === "background-image") ? r : e.utilityFor("background-image", n)];
	};
	if (t.kind !== "linear" || t.stops.length < 2 || t.stops.length > 3) return n();
	let r = t.angle.trim().replace(/\s+/g, " "), i = /^(-?\d+)deg$/.exec(r), a = ki[r] ? `bg-linear-to-${ki[r]}` : i ? `${i[1].startsWith("-") ? "-" : ""}bg-linear-${i[1].replace("-", "")}` : null;
	if (!a || e.declarations(a) === null) return n();
	let o = t.stops.length === 3 ? [
		"from",
		"via",
		"to"
	] : ["from", "to"], s = [a];
	for (let [r, i] of t.stops.entries()) {
		let t = Ei(e, o[r], i.color, "number"), a = i.at ? e.make(o[r], i.at) : null;
		if (!t || i.at && !a) return n();
		s.push(t, ...a ? [a] : []);
	}
	return s;
}
function Mi(e) {
	let t = e("--tw-gradient-position"), n = e("--tw-gradient-from"), r = e("--tw-gradient-to");
	if (!t && !n && !r) return;
	let i = e("--tw-gradient-via"), a = (t, n) => {
		let r = e(`--tw-gradient-${n}-position`);
		return `${t ?? "transparent"}${r ? ` ${r}` : ""}`;
	}, o = (t ?? "to bottom").replace(/\s+in\s+[\w-]+(\s+\w+\s+hue)?$/, "");
	return `linear-gradient(${[
		Oi[o] ?? o,
		a(n, "from"),
		...i ? [a(i, "via")] : [],
		a(r, "to")
	].join(", ")})`;
}
function Ni(e) {
	return new Set(e.flatMap((e) => q(e).variants));
}
function Pi(e, t) {
	let n = J(t);
	return e.some((e) => J(q(e).variants) === n);
}
function Fi(e, t) {
	return q(e).variants.length ? e : Ke(t, e);
}
function Ii(e, t, n) {
	let r = new Set(n), i = {
		site: [],
		utilities: []
	};
	for (let n of t) {
		let { utility: t } = q(n);
		r.has(xi(t)) || e && !e.valid(n) ? i.site.push(n) : i.utilities.push(n);
	}
	return i;
}
var Li = (e) => /^[^\s"<>`\u0000-\u001f\u007f]{1,200}$/.test(e), Ri = (e, t) => !Li(t) || !!e && /[:[\]/()]/.test(t) && !e.valid(t), zi = /* @__PURE__ */ new WeakMap();
function Bi(e) {
	let t = zi.get(e);
	return t || zi.set(e, t = e.ds.getClassList().map(([e]) => e)), t;
}
var Vi = 40;
function Hi(e, t, n, r) {
	let i = n.trim().toLowerCase(), a = t.filter((e) => !r.has(e) && e.toLowerCase().includes(i));
	if (!i) return a.slice(0, Vi);
	let o = new Set(t), s = [], c = [];
	for (let t of Bi(e)) {
		if (o.has(t) || r.has(t)) continue;
		let e = t.indexOf(i);
		if (e === 0 ? s.push(t) : e > 0 && c.length < Vi && c.push(t), s.length >= Vi) break;
	}
	let l = n.trim(), u = [
		...a,
		...s.sort((e, t) => e.length - t.length),
		...c
	];
	return !l || r.has(l) || u.includes(l) || !Li(l) || Ri(e, l) ? u.slice(0, Vi) : e.valid(l) ? [l, ...u].slice(0, Vi) : [...u.slice(0, 39), l];
}
function Ui(e, t) {
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
function Wi(e) {
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
function Gi(e) {
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
var Ki = [
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
function qi(e, t) {
	let n = /^([\d.]+)rem$/.exec(e?.ds.resolveThemeValue("--spacing") ?? "");
	return {
		scale: n ? Ki.map((e) => {
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
// admin/src/builder/fields/tokens.tsx
function Ji() {
	return Lt().find;
}
function Yi(e) {
	let t = Lt();
	return (n) => {
		let r = n.trim();
		return !e || !/^[a-z][a-z0-9-]*$/i.test(r) ? null : t.of(e).find((e) => e.name === r)?.ref ?? null;
	};
}
function Xi({ token: e, alpha: t, className: n }) {
	return /* @__PURE__ */ G("span", {
		className: V("inline-flex min-w-0 items-center gap-1 truncate rounded-xs bg-active px-1.5 leading-5 text-ink", n),
		title: `${e.variable} · ${e.value}`,
		children: [/* @__PURE__ */ W("span", {
			className: "truncate",
			children: e.name
		}), t && /* @__PURE__ */ G("span", {
			className: "text-muted",
			children: ["/", t]
		})]
	});
}
var Zi = (e) => V("h-6 min-w-0 rounded-xs px-1.5 text-2xs tabular-nums", e ? "bg-signal text-signal-ink" : "bg-sunken text-text hover:bg-hover");
function Qi({ value: e, onPick: t, auto: n }) {
	let { engine: r } = Ft(), i = qi(r, Lt().of("spacing")), a = (t) => t === e || t === "0px" && e === "0", o = (e) => /* @__PURE__ */ W(B, {
		compact: !0,
		title: e.title,
		onClick: () => t(e.value),
		className: Zi(a(e.value)),
		children: e.label
	}, e.value);
	return /* @__PURE__ */ G("div", {
		className: "space-y-2",
		children: [i.scale.length > 0 && /* @__PURE__ */ G("div", { children: [/* @__PURE__ */ W("div", {
			className: "cms-label mb-1",
			children: k("Scale||series of steps")
		}), /* @__PURE__ */ W("div", {
			className: "grid grid-cols-6 gap-1",
			children: i.scale.map(o)
		})] }), (i.named.length > 0 || n) && /* @__PURE__ */ G("div", { children: [/* @__PURE__ */ W("div", {
			className: "cms-label mb-1",
			children: k("Theme")
		}), /* @__PURE__ */ G("div", {
			className: "flex flex-wrap gap-1",
			children: [i.named.map(o), n && /* @__PURE__ */ W(B, {
				compact: !0,
				onClick: () => t("auto"),
				className: Zi(e === "auto"),
				children: k("Auto")
			})]
		})] })]
	});
}
function $i({ group: e, value: t, onPick: n, detach: r }) {
	let i = Lt(), a = i.of(e), o = i.find(t)?.token.variable ?? null;
	return e === "spacing" ? /* @__PURE__ */ W("div", {
		className: "p-2",
		children: /* @__PURE__ */ W(Qi, {
			value: t,
			onPick: n
		})
	}) : /* @__PURE__ */ G("div", { children: [/* @__PURE__ */ W("div", {
		className: "max-h-60 overflow-y-auto",
		children: a.map((t) => /* @__PURE__ */ G(B, {
			compact: !0,
			onClick: () => n(t.ref),
			className: V("flex h-7 w-full items-center gap-2 rounded-xs px-2 text-left text-xs hover:bg-hover", o === t.variable && "bg-active"),
			children: [
				e === "shadow" && /* @__PURE__ */ W("span", {
					className: "size-3.5 shrink-0 rounded-xs bg-bg",
					style: { boxShadow: t.value }
				}),
				e === "radius" && /* @__PURE__ */ W("span", {
					className: "size-3.5 shrink-0 border-l-[1.5px] border-t-[1.5px] border-muted",
					style: { borderTopLeftRadius: t.value }
				}),
				/* @__PURE__ */ W("span", {
					className: "min-w-0 truncate text-text",
					children: t.name
				}),
				/* @__PURE__ */ W("span", {
					className: "ml-auto max-w-[45%] shrink-0 truncate font-mono text-2xs text-faint",
					children: t.value
				}),
				o === t.variable && /* @__PURE__ */ W(L, {
					name: "check",
					size: 12,
					className: "shrink-0 text-focus"
				})
			]
		}, t.variable))
	}), o && r && /* @__PURE__ */ G(B, {
		compact: !0,
		onClick: r,
		className: "mt-1 flex h-7 w-full items-center gap-2 rounded-xs border-t border-border px-2 text-xs text-muted hover:bg-hover hover:text-text",
		children: [/* @__PURE__ */ W(L, {
			name: "unlink",
			size: 12
		}), k("Detach")]
	})] });
}
function ea({ group: e, value: t, onPick: n, active: r, className: i, trigger: a }) {
	let [o, s] = F(!1), c = Lt(), { engine: l } = Ft(), u = e;
	if (!l || u !== "spacing" && !c.of(u).length) return null;
	let d = (e) => {
		n(e), s(!1);
	};
	return /* @__PURE__ */ W(we, {
		open: o,
		onOpenChange: s,
		align: "end",
		className: "w-60 !p-1",
		trigger: a ?? /* @__PURE__ */ W(B, {
			compact: !0,
			className: V("size-5 shrink-0 place-items-center rounded-xs text-faint hover:bg-hover hover:text-ink", r || o ? "grid text-ink" : "hidden group-hover/value:grid group-focus-within/value:grid [@media(hover:none)]:grid", i),
			"aria-label": k("Theme Values"),
			title: k("Theme Values"),
			children: /* @__PURE__ */ W(L, {
				name: "symbol",
				size: 10
			})
		}),
		children: /* @__PURE__ */ W($i, {
			group: u,
			value: t,
			onPick: d,
			detach: () => d(c.find(t)?.token.value ?? null)
		})
	});
}
// admin/src/builder/fields/controls.tsx
function ta(e, t) {
	let n = (e) => Object.entries(e).every(([e, n]) => Array.isArray(n) ? n.includes(t[e]) : t[e] === n), r = e.if, i = e.unless;
	return (!r || n(r)) && !(i && Object.entries(i).every(([e, n]) => Array.isArray(n) ? n.includes(t[e] ?? null) : (t[e] ?? null) === n));
}
function na({ field: e, ...t }) {
	let n = ae.fields.get(e.component ?? e.type) ?? ae.fields.get("json");
	return n ? /* @__PURE__ */ W("div", {
		className: V("min-w-0 flex-1", e.className),
		children: /* @__PURE__ */ W(n, {
			field: e,
			...t,
			context: t.context ?? {}
		})
	}) : null;
}
function ra({ className: e, children: t }) {
	return /* @__PURE__ */ W("div", {
		className: V("relative flex min-w-0 flex-1 items-center gap-1", e),
		children: t
	});
}
var ia = /^(-?\d*\.?\d+)([a-z%]*)$/i, aa = {
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
}, oa = (e, t, n) => Math.min(n ?? Infinity, Math.max(t ?? -Infinity, e)), sa = (e) => Math.round(e * 1e3) / 1e3;
function ca(e) {
	return e.field.percent ? /* @__PURE__ */ W(la, { ...e }) : /* @__PURE__ */ W(pa, { ...e });
}
function la({ field: e, value: t, onChange: n, ...r }) {
	let i = t == null || t === "" ? null : Number(t), a = (e) => typeof e == "number" ? Math.round(e * 100) : void 0, o = e.slider;
	return /* @__PURE__ */ W(pa, {
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
function ua(e, t) {
	let [n, r] = F(!1), i = t(e);
	return N(() => {
		if (i) return r(!1);
		let e = window.setTimeout(() => r(!0), 700);
		return () => window.clearTimeout(e);
	}, [e, i]), {
		shown: n && !i,
		show: () => r(!0)
	};
}
var da = {
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
function fa(e, t, n) {
	if (typeof CSS > "u") return !0;
	let r = e, i = t.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`);
	return /^-?[a-z]+(-[a-z]+)*$/.test(i) && CSS.supports(i, "inherit") ? CSS.supports(i, r) : (da[n] ?? da.length).some((e) => CSS.supports(e, r));
}
function pa({ field: e, value: t, onChange: n, disabled: r, context: i }) {
	let a = Ji(), o = Yi(e.group), [s, c] = F(null), [l, u] = F(null), d = P(null), [f, p] = F(!1), m = t == null || t === "" ? void 0 : String(t), h = e.unit ?? "px", g = e.step ?? 1, _ = e.min, v = e.max, y = e.group, b = e.prefixIcon ? /* @__PURE__ */ W(L, {
		name: e.prefixIcon,
		size: 13
	}) : e.prefix, x = e.slider, S = e.menu, C = e.action, w = e.keywords ?? [], T = a(m), E = m?.match(ia), D = E ? E[2] || h : m ? "" : l ?? h, ee = h ? e.units ?? aa[h] ?? [h] : [], te = !m || !!E, ne = (e, t = D) => n(`${sa(oa(e, _, v))}${t}`), re = (e) => {
		te && ne((E ? parseFloat(E[1]) : 0) + e);
	}, ie = (e, t) => {
		if (r || e.button !== 0 || document.activeElement === e.currentTarget || !te) return;
		e.preventDefault();
		let n = e.clientX, i = E ? parseFloat(E[1]) : 0, a = !1, o = (e) => {
			let t = e.clientX - n;
			!a && Math.abs(t) < 3 || (a = !0, document.body.style.cursor = "ew-resize", ne(i + Math.round(t / 2) * g * (e.shiftKey ? 10 : e.altKey ? .1 : 1)));
		}, s = () => {
			window.removeEventListener("pointermove", o), window.removeEventListener("pointerup", s), document.body.style.cursor = "", !a && t && d.current?.focus();
		};
		window.addEventListener("pointermove", o), window.addEventListener("pointerup", s);
	}, ae = (t) => t === "" ? null : o(t) || (/^-?\d*\.?\d+$/.test(t) ? D ? `${t}${D}` : t : w.includes(t) || fa(t, e.property ?? e.handle, h) ? t : void 0), oe = ua(s ?? "", (e) => s === null || ae(e.trim()) !== void 0), O = () => {
		if (s === null) return;
		let e = s.trim();
		if (c(null), e === (E ? E[1] : m ?? "")) return;
		let t = ae(e);
		t !== void 0 && n(t);
	}, A = (e) => {
		E ? n(`${E[1]}${e}`) : m || u(e);
	};
	return /* @__PURE__ */ G(ra, { children: [
		x && /* @__PURE__ */ W(na, {
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
		/* @__PURE__ */ G("div", {
			className: V("group/value cms-input flex h-7 min-w-0 flex-1 items-center rounded-sm", x && "!w-16 !flex-none"),
			title: e.title,
			"data-focus": f || void 0,
			"data-invalid": oe.shown || void 0,
			"data-disabled": r || void 0,
			onFocus: () => p(!0),
			onBlur: (e) => !e.currentTarget.contains(e.relatedTarget) && p(!1),
			children: [
				b !== void 0 && /* @__PURE__ */ W("span", {
					onPointerDown: (e) => ie(e, !0),
					className: "grid h-full w-6 shrink-0 cursor-ew-resize select-none place-items-center text-xs text-faint hover:text-ink",
					children: b
				}),
				T && s === null ? /* @__PURE__ */ W(ea, {
					group: y ?? T.token.group,
					value: m,
					onPick: n,
					trigger: /* @__PURE__ */ W(B, {
						compact: !0,
						onDoubleClick: () => c(m ?? ""),
						className: V("flex h-full min-w-0 flex-1 items-center pr-1 text-left", b === void 0 && "pl-1"),
						children: /* @__PURE__ */ W(Xi, {
							token: T.token,
							alpha: T.alpha,
							className: "text-xs"
						})
					})
				}) : /* @__PURE__ */ W("input", {
					ref: d,
					id: Me(e),
					value: s ?? (E ? E[1] : m ?? ""),
					placeholder: e.placeholder,
					disabled: r,
					autoComplete: "off",
					spellCheck: !1,
					onPointerDown: (e) => ie(e, !0),
					onChange: (e) => c(e.target.value),
					onFocus: (e) => e.target.select(),
					onBlur: O,
					"aria-invalid": oe.shown || void 0,
					onKeyDown: (e) => {
						e.key === "Enter" && (s !== null && ae(s.trim()) === void 0 ? oe.show() : e.target.blur()), e.key === "Escape" && (c(null), requestAnimationFrame(() => d.current?.blur())), (e.key === "ArrowUp" || e.key === "ArrowDown") && te && (e.preventDefault(), c(null), re((e.key === "ArrowUp" ? 1 : -1) * g * (e.shiftKey ? 10 : e.altKey ? .1 : 1)));
					},
					className: V("h-full min-w-0 flex-1 bg-transparent text-sm tabular-nums text-text outline-none placeholder:text-ghost disabled:text-faint", b === void 0 && "pl-2", te && !r && "cursor-ew-resize focus:cursor-text")
				}),
				(!T || s !== null) && /* @__PURE__ */ G("span", {
					className: "flex shrink-0 items-center gap-px pr-1",
					children: [
						y && /* @__PURE__ */ W(ea, {
							group: y,
							value: m,
							onPick: n
						}),
						D && ee.length > 0 && /* @__PURE__ */ W(z, {
							align: "end",
							trigger: /* @__PURE__ */ W(B, {
								compact: !0,
								disabled: r,
								className: "h-5 min-w-5 rounded-xs px-1 text-2xs text-faint hover:bg-hover hover:text-ink",
								"aria-label": k("Unit"),
								children: D
							}),
							items: [...ee.map((e) => ({
								label: e,
								checked: e === D,
								onSelect: () => A(e)
							})), ...w.length ? [{
								separator: !0,
								label: ""
							}, ...w.map((e) => ({
								label: e,
								checked: m === e,
								onSelect: () => n(e)
							}))] : []]
						}),
						!D && h && w.length > 0 && m && w.includes(m) && /* @__PURE__ */ W(z, {
							align: "end",
							trigger: /* @__PURE__ */ W(B, {
								compact: !0,
								className: "grid size-5 place-items-center rounded-xs text-faint hover:bg-hover hover:text-ink",
								"aria-label": k("Unit"),
								children: /* @__PURE__ */ W(L, {
									name: "chevron-down",
									size: 10
								})
							}),
							items: [
								...ee.map((e) => ({
									label: e,
									onSelect: () => n(`0${e}`)
								})),
								{
									separator: !0,
									label: ""
								},
								...w.map((e) => ({
									label: e,
									checked: m === e,
									onSelect: () => n(e)
								}))
							]
						})
					]
				})
			]
		}),
		S && /* @__PURE__ */ W(z, {
			align: "end",
			trigger: /* @__PURE__ */ G(B, {
				compact: !0,
				className: "flex h-7 shrink-0 items-center gap-0.5 rounded-sm px-1.5 text-xs text-muted hover:bg-hover hover:text-ink",
				children: [S.label, /* @__PURE__ */ W(L, {
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
		C && /* @__PURE__ */ W(B, {
			compact: !0,
			onClick: () => n(C.value),
			className: "grid size-7 shrink-0 place-items-center rounded-sm text-muted hover:bg-hover hover:text-ink",
			title: C.label,
			"aria-label": C.label,
			children: /* @__PURE__ */ W(L, {
				name: C.icon,
				size: 14
			})
		})
	] });
}
// admin/src/builder/fields/composite.tsx
var ma = {
	2: "grid grid-cols-2",
	3: "grid grid-cols-3",
	4: "grid grid-cols-4"
};
function ha({ field: e, value: t, onChange: n, disabled: r, context: i }) {
	let a = t ?? {}, o = e.link, [s, c] = F(!o || e.split === !0), l = (s ? e.fields ?? [] : [o]).filter((e) => ta(e, a)), u = s ? ma[e.columns] : void 0;
	return /* @__PURE__ */ G(ra, { children: [/* @__PURE__ */ W("div", {
		className: V("min-w-0 flex-1 gap-1", u ?? "flex items-center"),
		children: l.map((e) => /* @__PURE__ */ W(na, {
			field: e,
			value: a[e.handle] ?? e.default ?? null,
			onChange: (t) => n({
				...a,
				[e.handle]: t
			}),
			disabled: r,
			context: i
		}, e.handle))
	}), o && /* @__PURE__ */ W(B, {
		compact: !0,
		onClick: () => c(!s),
		className: "grid size-7 shrink-0 place-items-center rounded-sm text-muted hover:bg-hover hover:text-ink",
		title: s ? e.joinLabel ?? k("The same for all") : e.splitLabel ?? k("Each One"),
		children: /* @__PURE__ */ W(L, {
			name: s ? "square" : "radius",
			size: 14
		})
	})] });
}
function ga({ field: e, value: t, onChange: n, disabled: r, context: i }) {
	let a = t ?? {}, o = e.key ?? {}, s = e.labels, c = e.items, l = (e, t) => {
		let r = (t ?? "").trim();
		o.lower && (r = r.toLowerCase()), o.strip && (r = r.replace(new RegExp(o.strip, "g"), "")), !r || r === e || r in a || o.allowed && !o.allowed.includes(r) || n(Object.fromEntries(Object.entries(a).map(([t, n]) => t === e ? [r, n] : [t, n])));
	};
	return /* @__PURE__ */ W("div", {
		className: "min-w-0 flex-1 space-y-1",
		children: Object.entries(a).map(([t, u]) => /* @__PURE__ */ G("div", {
			className: "flex items-center gap-1",
			children: [
				o.prefix && /* @__PURE__ */ W("span", {
					className: "text-xs text-faint",
					children: o.prefix
				}),
				s ? /* @__PURE__ */ W("span", {
					className: "mr-1 w-[88px] shrink-0 truncate text-xs text-text",
					children: s[t] ?? t
				}) : /* @__PURE__ */ W(na, {
					field: {
						handle: `${e.handle}-${t}`,
						type: o.options ? "select" : "text",
						size: "sm",
						commit: "blur",
						label: k("Name"),
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
				typeof e.join == "string" && /* @__PURE__ */ W("span", {
					className: "text-xs text-faint",
					children: e.join
				}),
				/* @__PURE__ */ W(na, {
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
				/* @__PURE__ */ W(vi, { onClick: () => n(Object.fromEntries(Object.entries(a).filter(([e]) => e !== t))) })
			]
		}, t))
	});
}
function _a(e, t) {
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
var va = () => [
	{
		path: "entry.author.name",
		label: k("Author"),
		group: k("Page")
	},
	{
		path: "entry.title",
		label: k("Title"),
		group: k("Page")
	},
	{
		path: "entry.url",
		label: k("Link"),
		group: k("Page")
	},
	{
		path: "entry.date|date:F j, Y",
		label: k("Published Date"),
		group: k("Page")
	},
	{
		path: "entry.updated|date:F j, Y",
		label: k("Updated Date"),
		group: k("Page")
	},
	{
		path: "entry.parent.title",
		label: k("Parent Title"),
		group: k("Page")
	},
	{
		path: "entry.prev.url",
		label: k("Previous Page Link"),
		group: k("Page")
	},
	{
		path: "entry.prev.title",
		label: k("Previous Page Title"),
		group: k("Page")
	},
	{
		path: "entry.next.url",
		label: k("Next Page Link"),
		group: k("Page")
	},
	{
		path: "entry.next.title",
		label: k("Next Page Title"),
		group: k("Page")
	}
], ya = () => [
	{
		path: "site.name",
		label: k("Site Name"),
		group: k("Site")
	},
	{
		path: "site.description",
		label: k("Site Description"),
		group: k("Site")
	},
	{
		path: "site.url",
		label: k("Site URL"),
		group: k("Site")
	},
	{
		path: "© {site.year} {site.name}",
		label: k("Copyright Line"),
		group: k("Site")
	},
	{
		path: "page.uri",
		label: k("Current Path"),
		group: k("Site")
	},
	{
		path: "pagination.prev",
		label: k("Previous Page of a List"),
		group: k("Pagination")
	},
	{
		path: "pagination.next",
		label: k("Next Page of a List"),
		group: k("Pagination")
	},
	{
		path: "{pagination.current} / {pagination.total}",
		label: k("Page x of y"),
		group: k("Pagination")
	}
];
function ba(e) {
	let { store: t, doc: n, catalog: r } = a(), i = se(), o = K(t, (t) => u(t.nodes, e.id)), s = A("entries/get", { id: n?.id ?? "" }, {
		enabled: n?.kind === "entry",
		staleTime: 6e4
	}), c = n?.kind === "template" ? n.collections?.length ? n.collections : i.collections.filter((e) => e.routable).map((e) => e.handle).slice(0, 1) : s.data ? [s.data.collection] : [], l = A("collections/get", { handle: c[0] ?? "" }, {
		enabled: !!c[0],
		staleTime: 3e5
	}), d = [];
	for (let e of [...o].reverse()) {
		if (e.type !== "repeat") continue;
		let t = e.props?.as || "item", n = r.sources?.find((t) => t.name === e.props?.source), i = k("{list} item ({name})", {
			list: n?.label ?? k("List"),
			name: t
		});
		for (let [e, r] of Object.entries(n?.item ?? {})) d.push({
			path: `${t}.${e}`,
			label: r,
			group: i
		});
		e.props?.source === "entries" && e.props?.collection && d.push({
			path: `${t}.excerpt`,
			label: k("Excerpt Field"),
			group: i
		}, {
			path: `${t}.cover`,
			label: k("Cover Image Field"),
			group: i
		}), e.props?.source === "list" && d.push({
			path: `{${t}}`,
			label: k("The Item Itself (Text)"),
			group: i
		}), d.push({
			path: "index",
			label: k("Position (1, 2, 3…)"),
			group: i
		}, {
			path: "first",
			label: k("Is First"),
			group: i
		}, {
			path: "last",
			label: k("Is Last"),
			group: i
		});
	}
	if (n?.kind === "component") for (let e of n.props ?? []) d.push({
		path: `props.${e.handle}`,
		label: e.label ?? e.handle,
		group: k("Component Properties")
	});
	d.push(...va());
	for (let e of l.data?.fields ?? []) e.type !== "blocks" && d.push({
		path: `entry.${e.handle}${e.type === "date" ? "|date:F j, Y" : ""}`,
		label: e.label,
		group: k("Page Fields")
	});
	d.push(...ya());
	for (let e of i.globals) d.push({
		path: `globals.${e.handle}.`,
		label: k("{name} (add a field handle)", { name: e.title }),
		group: k("Globals")
	});
	return d;
}
// admin/src/builder/content/ContentPanel.tsx
var xa = [
	"text",
	"textarea",
	"richtext",
	"markdown"
], Sa = (e, t) => !e.if || Object.entries(e.if).every(([e, n]) => {
	let r = t[e] ?? null;
	return Array.isArray(n) ? n.includes(r) : r === n;
}), Ca = [
	"aria-label",
	"title",
	"role",
	"lang",
	"rel"
], wa = [
	"active",
	"open",
	"selected",
	"current"
];
function Ta(e, t) {
	let n = e.find((e) => !(e in t));
	if (n) return n;
	let r = 2;
	for (; `${e[0]}-${r}` in t;) r++;
	return `${e[0]}-${r}`;
}
function Ea(e) {
	let t = e.toLowerCase().replace(/[^a-z0-9-]/g, "");
	return (/^[a-z]/.test(t) ? t : `b${t}`).slice(0, 40);
}
function Da({ field: e, value: t, bound: n, paths: r, onValue: i, onBind: a, extra: o }) {
	let s = e.type === "richtext" && e.inline && e.handle !== "text" && !e.component ? {
		...e,
		component: "blocks-inline-text"
	} : e, c = !n && Le.includes(s.type) && !s.component, l = !n && fi(s), u = !n && s.type === "toggle", d = n ? {
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
	}, f = { [s.handle]: n ?? t }, p = (e, t) => n ? a(t) : i(t), m = c ? /* @__PURE__ */ W(ye, {
		bare: !0,
		fields: [d],
		values: f,
		onChange: p,
		className: "min-w-0"
	}) : /* @__PURE__ */ W(Z, {
		bare: !0,
		fields: [d],
		values: f,
		onChange: p,
		className: "min-w-0 flex-1"
	});
	if (u) return /* @__PURE__ */ W("div", {
		className: "flex min-h-7 items-center",
		children: m
	});
	let h = /* @__PURE__ */ W(ke, {
		content: k(n ? "Disconnect from Data" : "Connect to Data"),
		children: /* @__PURE__ */ W(R, {
			icon: "database",
			size: "xs",
			label: k(n ? "Disconnect from Data" : "Connect to Data"),
			title: void 0,
			onClick: () => a(n ? null : r[0]?.path ?? "entry.title"),
			className: V("overflow-hidden", n ? "!text-ink" : "!w-0 !text-faint hover:!text-ink focus-visible:!w-6 group-hover/prop:!w-6 [@media(hover:none)]:!w-6")
		})
	}), g = /* @__PURE__ */ G("span", {
		className: V("flex min-h-7 min-w-0 shrink-0 items-center gap-0.5", !l && "w-[88px]"),
		children: [/* @__PURE__ */ W("label", {
			htmlFor: Me(s),
			className: V("min-w-0 flex-1 py-0.5 text-xs leading-[1.25] [overflow-wrap:anywhere]", n ? "text-ink" : "text-muted"),
			title: s.instructions,
			children: s.label
		}), h]
	});
	return l ? /* @__PURE__ */ G("div", {
		className: "group/prop pb-1",
		children: [g, m]
	}) : /* @__PURE__ */ G("div", {
		className: "group/prop flex min-h-7 items-center gap-2",
		children: [g, m]
	});
}
function Oa({ node: e }) {
	let { store: t, types: n } = a(), r = n.get(e.type), i = ba(e), o = sn().filter((t) => t.id !== (e.anchor ?? e.props?.anchor)), s = e.bind ?? {}, c = {
		...Object.fromEntries((r?.fields ?? []).map((e) => [e.handle, e.default ?? null])),
		...r?.defaults ?? {},
		...e.props ?? {}
	}, l = (n, r) => {
		let i = { ...s };
		r ? i[n] = r : delete i[n], t.updateNode(e.id, { bind: Object.keys(i).length ? i : void 0 }, `bind:${e.id}:${n}`);
	}, u = (n, r) => t.updateProps(e.id, { [n]: r }, `inspector:${e.id}:${n}`), d = Object.fromEntries(Object.entries(s).filter(([e]) => e.startsWith("state:")).map(([e, t]) => [e.slice(6), t])), f = (r?.fields ?? []).filter((e) => !e.design && !(e.type === "json" && [
		"items",
		"rows",
		"values"
	].includes(e.handle))), p = f.some((e) => e.component === "link") && f.some((e) => e.handle === "new_tab"), m = f.filter((e) => !(p && e.handle === "new_tab") && Sa(e, c)), h = m.filter((e) => !e.advanced), g = m.filter((e) => e.advanced), _ = (t) => /* @__PURE__ */ W(Da, {
		field: t,
		value: e.props?.[t.handle],
		bound: s[t.handle],
		paths: i,
		onValue: (e) => u(t.handle, e),
		onBind: (e) => l(t.handle, e),
		extra: y(t)
	}, t.handle), v = e.type === "repeat", y = (t) => t.component === "link" || t.type === "url" ? {
		anchors: o,
		...p ? {
			newTab: !!e.props?.new_tab,
			onNewTab: (e) => u("new_tab", e || void 0)
		} : {}
	} : void 0;
	return !r && e.type !== "component" ? /* @__PURE__ */ G(li, { children: [/* @__PURE__ */ W(Se, {
		title: k("Its plugin is off"),
		children: k("This block is kept as it is and shows again when its plugin is turned on.")
	}), Object.keys(e.props ?? {}).length > 0 && /* @__PURE__ */ W("pre", {
		"aria-label": k("Settings"),
		className: "m-0 mt-3 overflow-x-auto rounded-md bg-sunken p-3 font-mono text-xs text-muted",
		children: JSON.stringify(e.props, null, 2)
	})] }) : /* @__PURE__ */ G("div", { children: [
		e.type === "component" ? /* @__PURE__ */ W(ka, {
			node: e,
			paths: i,
			setBind: l,
			anchors: o
		}) : v ? /* @__PURE__ */ W(Aa, { node: e }) : h.length > 0 && /* @__PURE__ */ W(li, { children: h.map(_) }),
		/* @__PURE__ */ W(ci, {
			title: k("Visibility"),
			open: !!(s.visible || s.hidden || e.hidden),
			empty: !s.visible && !s.hidden && !e.hidden,
			children: /* @__PURE__ */ W(Z, {
				fields: [
					{
						handle: "shown",
						type: "toggle",
						size: "sm",
						label: k("Show on the Site")
					},
					{
						handle: "visible",
						type: "text",
						component: "blocks-bind",
						label: k("Only If"),
						paths: i,
						placeholder: k("Always"),
						status: s.visible ? "own" : void 0,
						reset: () => l("visible", null)
					},
					{
						handle: "hidden",
						type: "text",
						component: "blocks-bind",
						label: k("Hide If"),
						paths: i,
						placeholder: k("Never"),
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
		/* @__PURE__ */ G(ci, {
			title: k("Advanced"),
			open: !1,
			remember: !1,
			empty: !e.anchor && !e.attrs && !(e.type === "component" && e.class) && !e.persist && !Object.keys(s).some((e) => e.startsWith("state:")) && !g.some((t) => e.props?.[t.handle] !== void 0 && e.props?.[t.handle] !== t.default),
			children: [
				v ? /* @__PURE__ */ W(ja, { node: e }) : g.map(_),
				/* @__PURE__ */ W(Z, {
					fields: [
						{
							handle: "label",
							type: "text",
							size: "sm",
							commit: "blur",
							label: k("Layer Name"),
							placeholder: r?.title
						},
						...g.some((e) => e.handle === "anchor") && !e.anchor ? [] : [{
							handle: "anchor",
							type: "text",
							size: "sm",
							commit: "blur",
							label: k("Anchor"),
							placeholder: k("None"),
							mono: !0
						}],
						...e.type === "component" ? [{
							handle: "class",
							type: "text",
							size: "sm",
							commit: "blur",
							label: k("Classes"),
							mono: !0
						}] : [],
						...ee("site.code") ? [{
							handle: "persist",
							type: "toggle",
							size: "sm",
							label: k("Keep Across Pages")
						}] : []
					],
					values: {
						label: e.label,
						anchor: e.anchor,
						class: e.class,
						persist: !!e.persist
					},
					onChange: (n, r) => {
						if (n === "persist") return t.updateNode(e.id, { persist: r ? e.persist ?? Ea(e.id) : void 0 });
						let i = String(r ?? "");
						t.updateNode(e.id, { [n]: (n === "anchor" ? i.toLowerCase().replace(/[^a-z0-9-]/g, "") : i) || void 0 });
					}
				}),
				/* @__PURE__ */ W(ui, {
					title: k("Attributes"),
					action: /* @__PURE__ */ W(_i, {
						label: k("Add Attribute"),
						onClick: () => t.updateNode(e.id, { attrs: {
							...e.attrs ?? {},
							[Ta(Ca, e.attrs ?? {})]: ""
						} })
					})
				}),
				e.attrs && Object.keys(e.attrs).length > 0 && /* @__PURE__ */ W(Z, {
					bare: !0,
					fields: [{
						handle: "attrs",
						type: "json",
						component: "blocks-pairs",
						className: "items-start",
						label: k("Attributes"),
						key: { lower: !0 },
						item: {
							handle: "value",
							type: "text",
							size: "sm",
							commit: "blur",
							label: k("Value")
						},
						items: Object.fromEntries(Object.keys(e.attrs ?? {}).filter((e) => s[`attr:${e}`]).map((e) => [e, {
							handle: "bind",
							type: "text",
							component: "blocks-bind",
							label: k("Data"),
							paths: i
						}]))
					}],
					values: { attrs: Object.fromEntries(Object.entries(e.attrs ?? {}).map(([e, t]) => [e, s[`attr:${e}`] ?? t])) },
					onChange: (n, r) => {
						let i = e.attrs ?? {}, a = _a(Object.fromEntries(Object.entries(i).map(([e, t]) => [e, s[`attr:${e}`] ?? t])), r);
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
				/* @__PURE__ */ W(ui, {
					title: k("States from Data"),
					action: /* @__PURE__ */ W(_i, {
						label: k("Add State from Data"),
						onClick: () => l(`state:${Ta(wa, d)}`, i[0]?.path ?? "item.active")
					})
				}),
				Object.keys(d).length > 0 && /* @__PURE__ */ W(Z, {
					bare: !0,
					fields: [{
						handle: "states",
						type: "json",
						component: "blocks-pairs",
						className: "items-start",
						label: k("States from Data"),
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
							label: k("Data"),
							paths: i
						}
					}],
					values: { states: d },
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
function ka({ node: e, paths: t, setBind: n, anchors: r }) {
	let { store: i } = a(), o = A("components/list", { working: !0 }, { staleTime: 3e4 }), s = o.data?.find((t) => t.handle === e.props?.ref), c = e.props?.values ?? {}, l = e.bind ?? {};
	return /* @__PURE__ */ G(li, { children: [
		/* @__PURE__ */ W(Z, {
			fields: [{
				handle: "ref",
				type: "select",
				size: "sm",
				label: k("Component"),
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
		(s?.props ?? []).map((a) => /* @__PURE__ */ W(Da, {
			field: {
				...a,
				placeholder: a.placeholder ?? (xa.includes(a.type) ? a.label : void 0)
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
		/* @__PURE__ */ G("div", {
			className: "-ml-2 flex gap-1 pt-1",
			children: [s?.id && /* @__PURE__ */ W(I, {
				size: "sm",
				variant: "ghost",
				icon: "edit",
				onClick: () => re(`/content/components/${s.id}`),
				children: k("Edit Component")
			}), /* @__PURE__ */ W(I, {
				size: "sm",
				variant: "ghost",
				icon: "scissors",
				onClick: () => {
					if (!s) return;
					let t = p(i.get().nodes, e.id);
					if (!t) return;
					let n = s.blocks.map((e) => b(e));
					i.commit(w(h(i.get().nodes, e.id), t.parentId, t.index, n)), i.select(n[0]?.id ?? null);
				},
				disabled: !s,
				children: k("Detach")
			})]
		})
	] });
}
function Aa({ node: e }) {
	let { store: t, catalog: n } = a(), r = n.sources?.find((t) => t.name === e.props?.source), i = (n, r) => t.updateProps(e.id, { [n]: r }, `repeat:${e.id}:${n}`);
	return /* @__PURE__ */ G(li, { children: [
		/* @__PURE__ */ W(Z, {
			fields: [{
				handle: "source",
				type: "select",
				size: "sm",
				label: k("List"),
				required: !0,
				options: (n.sources ?? []).map((e) => ({
					value: e.name,
					label: e.label
				}))
			}],
			values: { source: e.props?.source },
			onChange: (e, t) => t && i("source", t)
		}),
		/* @__PURE__ */ W(Z, {
			fields: (r?.fields ?? []).map((e) => ({
				...e,
				size: "sm",
				width: "full"
			})),
			values: Object.fromEntries((r?.fields ?? []).map((t) => [t.handle, e.props?.[t.handle]])),
			onChange: (e, t) => i(e, t)
		}),
		/* @__PURE__ */ W(Z, {
			fields: [{
				handle: "empty",
				type: "text",
				size: "sm",
				commit: "blur",
				label: k("When Empty"),
				placeholder: k("Show Nothing")
			}],
			values: { empty: e.props?.empty },
			onChange: (e, t) => i(e, t || void 0)
		})
	] });
}
function ja({ node: e }) {
	let { store: t } = a(), n = (n, r) => t.updateProps(e.id, { [n]: r }, `repeat:${e.id}:${n}`);
	return /* @__PURE__ */ W(Z, {
		fields: [{
			handle: "tag",
			type: "select",
			size: "sm",
			label: k("HTML Tag"),
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
			label: k("Item Name"),
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
function Ma(e) {
	let { store: t } = a(), { engine: n, breakpoints: r } = Ft(), i = K(t, (e) => e.device), o = K(t, (e) => e.canvasWidth), s = K(t, (e) => e.state), c = ge(() => kt(i, o, r), [
		i,
		o,
		r
	]);
	return ge(() => wi(n, qe(e.class), c, s, (n, r) => t.updateNode(e.id, { class: n.join(" ") || void 0 }, `style:${e.id}:${r ?? ""}`)), [
		n,
		e.class,
		e.id,
		c,
		s,
		t
	]);
}
// admin/src/builder/css.ts
function Na(e) {
	let t = [], n = 0, r = "";
	for (let i of e.trim()) i === "(" && n++, i === ")" && n--, /\s/.test(i) && n === 0 ? (r && t.push(r), r = "") : r += i;
	return r && t.push(r), t;
}
function Pa(e) {
	let t = [], n = 0, r = "";
	for (let i of e) i === "(" && n++, i === ")" && n--, i === "," && n === 0 ? (t.push(r.trim()), r = "") : r += i;
	return r.trim() && t.push(r.trim()), t;
}
function Fa(e) {
	if (e === void 0 || e === "") return null;
	let t = Na(String(e));
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
function Ia(e, t) {
	let n = t.map((t) => e.status(t));
	return n.includes("own") ? "own" : n.includes("inherited") ? "inherited" : void 0;
}
function Q({ s: e, fields: t, bare: n }) {
	let r = t.filter(Boolean), i = {}, a = r.map(({ get: t, set: n, keys: r, markers: a, ...o }) => {
		let s = o.fields, c = a ?? r ?? (s ? s.map((e) => e.handle) : [o.handle]);
		return i[o.handle] = t ? t() : s ? Object.fromEntries(c.map((t) => [t, e.value(t)])) : e.value(o.handle), {
			status: Ia(e, c),
			reset: () => a ? e.swap(a, null) : e.write(Object.fromEntries(c.map((e) => [e, null]))),
			...o
		};
	});
	return /* @__PURE__ */ W(Z, {
		bare: n,
		fields: a,
		values: i,
		onChange: (t, n) => {
			let a = r.find((e) => e.handle === t);
			if (a.set) return a.set(n);
			if (!n || typeof n != "object") return e.set(t, n);
			let o = Ra(i[t] ?? {}, n);
			Object.keys(o).length && e.write(o);
		},
		disabled: !e.engine
	});
}
var La = (e) => e === "none" ? void 0 : e;
function Ra(e, t) {
	return Object.fromEntries(Object.entries(t ?? {}).filter(([t, n]) => n !== e[t]));
}
// admin/src/builder/design/Border.tsx
var za = [
	"borderTopLeftRadius",
	"borderTopRightRadius",
	"borderBottomRightRadius",
	"borderBottomLeftRadius"
], Ba = {
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
}, Va = "--tw-border-style", Ha = "--tw-outline-style", Ua = "--tw-ring-shadow", Wa = () => [
	{
		value: "solid",
		label: k("Solid")
	},
	{
		value: "dashed",
		label: k("Dashed")
	},
	{
		value: "dotted",
		label: k("Dotted")
	},
	{
		value: "double",
		label: k("Double")
	},
	{
		value: "none",
		label: k("None")
	}
], Ga = (e) => e?.match(/0 0 0 calc\(([\d.]+px) \+/)?.[1];
function Ka({ s: e }) {
	let t = Object.keys(Ba), [n, r] = F(() => t.find((t) => t !== "all" && e.value(Ba[t].width)) ?? "all"), i = Ba[n], a = {
		width: e.value(i.width),
		style: e.value(Va),
		color: e.value(i.color)
	}, o = za.map((t) => e.value(t)), s = (t) => e.value(za[t]) ?? Fa(e.value("borderRadius"))?.[t], c = {
		width: e.value("outlineWidth"),
		style: e.value(Ha),
		color: e.value("outlineColor")
	}, l = {
		width: Ga(e.value(Ua)),
		color: e.value("--tw-ring-color")
	}, u = t.some((t) => e.value(Ba[t].width) || e.value(Ba[t].color)) || a.style || e.value("borderRadius") || o.some(Boolean) || c.width || c.style || l.width, d = (t) => Ia(e, [Ba[t].width, Ba[t].color]), f = (t, n, r) => n && e.engine ? Ei(e.engine, t, n, r) : null, p = (e, t, n) => ({
		value: e,
		icon: t,
		title: d(e) ? `${n} · ${d(e) === "own" ? k("set") : k("inherited")}` : n
	});
	return /* @__PURE__ */ G(ci, {
		title: k("Border"),
		empty: !u,
		children: [/* @__PURE__ */ W(Q, {
			s: e,
			fields: [
				{
					handle: "edge",
					type: "select",
					display: "segmented",
					block: !0,
					required: !0,
					size: "sm",
					label: k("Sides"),
					keys: [],
					get: () => n,
					set: (e) => e && r(e),
					options: [
						p("all", "b-side-all", k("All Sides")),
						p("top", "b-side-top", k("Top")),
						p("right", "b-side-right", k("Right")),
						p("bottom", "b-side-bottom", k("Bottom")),
						p("left", "b-side-left", k("Left"))
					]
				},
				{
					handle: "line",
					type: "group",
					component: "blocks-group",
					label: k("Width"),
					markers: [i.width, Va],
					get: () => ({
						width: a.width,
						style: a.style
					}),
					set: (t) => {
						let n = Ra({
							width: a.width,
							style: a.style
						}, t);
						"width" in n ? e.swap(i.width, f(i.root, n.width, "px")) : "style" in n && e.swap(Va, n.style ? `border-${n.style}` : null);
					},
					fields: [{
						handle: "width",
						type: "text",
						component: "blocks-value",
						label: k("Width"),
						placeholder: "0",
						min: 0,
						prefixIcon: "square"
					}, {
						handle: "style",
						type: "select",
						size: "sm",
						label: k("Style"),
						options: Wa(),
						placeholder: k("Solid")
					}]
				},
				{
					handle: "lineColor",
					type: "color",
					component: "blocks-color",
					label: k("Color"),
					placeholder: k("Text Color"),
					markers: [i.color],
					get: () => a.color,
					set: (t) => e.swap(i.color, f(i.root, t, "number"))
				},
				{
					handle: "radius",
					type: "group",
					component: "blocks-group",
					label: k("Radius"),
					status: e.status("borderRadius") === "own" || za.some((t) => e.status(t) === "own") ? "own" : La(e.status("borderRadius")),
					keys: ["borderRadius", ...za],
					columns: 2,
					split: o.some(Boolean),
					splitLabel: k("Each Corner"),
					joinLabel: k("Same radius for every corner"),
					link: {
						handle: "borderRadius",
						type: "text",
						component: "blocks-value",
						label: k("Radius"),
						group: "radius",
						prefixIcon: "frame",
						placeholder: "0",
						min: 0
					},
					fields: za.map((e, t) => ({
						handle: e,
						type: "text",
						component: "blocks-value",
						label: [
							k("Top Left"),
							k("Top Right"),
							k("Bottom Right"),
							k("Bottom Left")
						][t],
						title: [
							k("Top Left"),
							k("Top Right"),
							k("Bottom Right"),
							k("Bottom Left")
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
						...Object.fromEntries(za.map((e, t) => [e, s(t)]))
					}),
					set: (t) => {
						if (t.borderRadius !== e.value("borderRadius")) return e.set("borderRadius", t.borderRadius);
						e.write({
							borderRadius: null,
							...Object.fromEntries(za.map((e) => [e, t[e] ?? null]))
						});
					}
				}
			]
		}), /* @__PURE__ */ W("div", {
			className: "!mt-3 border-t border-border pt-2",
			children: /* @__PURE__ */ W(Q, {
				s: e,
				fields: [
					{
						handle: "outlineLine",
						type: "group",
						component: "blocks-group",
						label: k("Outline"),
						markers: ["outline-width", Ha],
						get: () => ({
							width: c.width,
							style: c.style
						}),
						set: (t) => {
							let n = Ra({
								width: c.width,
								style: c.style
							}, t);
							"width" in n ? e.swap("outline-width", f("outline", n.width, "px")) : "style" in n && e.swap(Ha, n.style ? n.style === "solid" ? "outline-solid" : `outline-${n.style}` : null);
						},
						fields: [{
							handle: "width",
							type: "text",
							component: "blocks-value",
							label: k("Width"),
							placeholder: "0",
							min: 0,
							prefixIcon: "selection"
						}, {
							handle: "style",
							type: "select",
							size: "sm",
							label: k("Style"),
							options: Wa(),
							placeholder: k("Solid")
						}]
					},
					c.width || c.style ? {
						handle: "outlineColor",
						type: "color",
						component: "blocks-color",
						label: k("Outline Color"),
						placeholder: k("Text Color"),
						markers: ["outline-color"],
						get: () => c.color,
						set: (t) => e.swap("outline-color", f("outline", t, "number"))
					} : null,
					c.width || c.style || e.value("outlineOffset") ? {
						handle: "outlineOffset",
						type: "text",
						component: "blocks-value",
						label: k("Offset"),
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
						label: k("Ring"),
						placeholder: "0",
						min: 0,
						prefixIcon: "circle",
						markers: [Ua],
						get: () => l.width,
						set: (t) => e.swap(Ua, f("ring", t, "px"))
					},
					l.width ? {
						handle: "ringColor",
						type: "color",
						component: "blocks-color",
						label: k("Ring Color"),
						placeholder: k("Text Color"),
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
var qa = [
	{
		name: "blur",
		label: () => k("Blur"),
		unit: "px",
		initial: "8px",
		step: 1,
		min: 0,
		icon: "shadow"
	},
	{
		name: "brightness",
		label: () => k("Brightness"),
		unit: "%",
		initial: "100%",
		step: 5,
		min: 0,
		icon: "sun"
	},
	{
		name: "contrast",
		label: () => k("Contrast"),
		unit: "%",
		initial: "100%",
		step: 5,
		min: 0,
		icon: "opacity"
	},
	{
		name: "saturate",
		label: () => k("Saturation"),
		unit: "%",
		initial: "100%",
		step: 5,
		min: 0,
		icon: "drop-half"
	},
	{
		name: "grayscale",
		label: () => k("Grayscale"),
		unit: "%",
		initial: "100%",
		step: 5,
		min: 0,
		max: 100,
		icon: "opacity"
	},
	{
		name: "hue-rotate",
		label: () => k("Hue"),
		unit: "deg",
		initial: "90deg",
		step: 1,
		icon: "refresh"
	},
	{
		name: "invert",
		label: () => k("Invert"),
		unit: "%",
		initial: "100%",
		step: 5,
		min: 0,
		max: 100,
		icon: "opacity"
	},
	{
		name: "sepia",
		label: () => k("Sepia"),
		unit: "%",
		initial: "100%",
		step: 5,
		min: 0,
		max: 100,
		icon: "theme"
	}
];
function Ja(e) {
	return !e || e === "none" ? [] : Na(e).map((e) => {
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
var Ya = (e) => e.length ? e.map((e) => qa.some((t) => t.name === e.name) || e.value ? `${e.name}(${e.value})` : e.name).join(" ") : null;
function Xa({ field: e, value: t, onChange: n, context: r, disabled: i }) {
	let a = Ja(t), o = qa.filter((e) => !a.some((t) => t.name === e.name)), s = (e) => n(Ya(e));
	return /* @__PURE__ */ G("div", {
		className: "min-w-0 flex-1",
		children: [/* @__PURE__ */ G("div", {
			className: "flex h-7 items-center gap-2",
			children: [
				/* @__PURE__ */ W(di, {
					field: e,
					className: a.length ? "!w-auto" : void 0
				}),
				/* @__PURE__ */ W("span", { className: "min-w-0 flex-1" }),
				o.length > 0 && /* @__PURE__ */ W(z, {
					align: "end",
					trigger: /* @__PURE__ */ W(B, {
						compact: !0,
						disabled: i,
						className: "grid size-6 shrink-0 place-items-center rounded-sm text-muted hover:bg-hover hover:text-ink",
						"aria-label": k("Add a Filter"),
						title: k("Add a Filter"),
						children: /* @__PURE__ */ W(L, {
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
		}), a.length > 0 && /* @__PURE__ */ W("div", {
			className: "mt-1 space-y-1",
			children: a.map((t, n) => {
				let o = qa.find((e) => e.name === t.name), c = o ? {
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
				return /* @__PURE__ */ G("div", {
					className: "flex h-7 items-center gap-2",
					children: [
						/* @__PURE__ */ G("span", {
							className: "flex w-[88px] shrink-0 items-center gap-1.5 truncate pl-2 text-xs text-muted",
							children: [/* @__PURE__ */ W(L, {
								name: o?.icon ?? "faders",
								size: 13,
								className: "shrink-0 text-faint"
							}), o?.label() ?? t.name]
						}),
						/* @__PURE__ */ W(na, {
							field: c,
							value: o?.unit === "%" && /^[\d.]+$/.test(t.value) ? `${Math.round(parseFloat(t.value) * 1e3) / 10}%` : t.value || null,
							onChange: (e) => s(a.map((t, r) => r === n ? {
								...t,
								value: String(e ?? o?.initial ?? "")
							} : t)),
							disabled: i,
							context: r
						}),
						/* @__PURE__ */ W(vi, {
							label: k("Remove Filter"),
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
}), Za = (e, t = {}) => ({
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
}), Qa = (e, t = {}) => ({
	label: e,
	type: "text",
	component: "blocks-value",
	unit: "",
	placeholder: "0",
	...t
}), $a = (e) => ({
	label: e,
	type: "color",
	component: "blocks-color",
	placeholder: k("None")
}), eo = (e, t = "") => ({
	label: e,
	type: "text",
	size: "sm",
	commit: "blur",
	mono: !0,
	placeholder: t
}), to = [
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
function no() {
	let e = (e, t) => Object.fromEntries(Object.entries(t).map(([t, n]) => [t, {
		group: e,
		field: n
	}]));
	return {
		...e("layout", {
			alignContent: $(k("Align Content"), [
				"normal",
				"start",
				"center",
				"end",
				"space-between",
				"space-around",
				"space-evenly",
				"stretch"
			]),
			placeItems: eo(k("Place Items"), "center"),
			placeContent: eo(k("Place Content"), "center"),
			gridTemplateAreas: eo(k("Grid Areas"), "'a b' 'c c'"),
			gridAutoColumns: eo(k("Auto Columns"), "auto"),
			gridAutoRows: eo(k("Auto Rows"), "auto"),
			columns: Qa(k("Columns"), {
				placeholder: k("Auto"),
				min: 1
			}),
			columnRule: eo(k("Column Rule"), "1px solid"),
			boxSizing: $(k("Box Sizing"), ["border-box", "content-box"]),
			float: $(k("Float||CSS property"), [
				"none",
				"left",
				"right"
			]),
			clear: $(k("Clear||CSS property"), [
				"none",
				"left",
				"right",
				"both"
			]),
			containerType: $(k("Container Type"), [
				"normal",
				"inline-size",
				"size"
			])
		}),
		...e("item", {
			justifySelf: $(k("Justify Self"), [
				"auto",
				"start",
				"center",
				"end",
				"stretch"
			]),
			placeSelf: eo(k("Place Self"), "center"),
			gridArea: eo(k("Grid Area"), "a"),
			flexGrow: Qa(k("Flex Grow"), { min: 0 }),
			flexShrink: Qa(k("Flex Shrink"), {
				placeholder: "1",
				min: 0
			}),
			flexBasis: Za(k("Flex Basis"), { placeholder: k("Auto") })
		}),
		...e("position", { inset: Za(k("Inset"), { placeholder: k("Auto") }) }),
		...e("size", {
			overflowX: $(k("Overflow X"), [
				"visible",
				"hidden",
				"clip",
				"scroll",
				"auto"
			]),
			overflowY: $(k("Overflow Y"), [
				"visible",
				"hidden",
				"clip",
				"scroll",
				"auto"
			]),
			overscrollBehavior: $(k("Overscroll"), [
				"auto",
				"contain",
				"none"
			]),
			scrollSnapType: $(k("Snap Type"), [
				"none",
				"x mandatory",
				"x proximity",
				"y mandatory",
				"y proximity",
				"both mandatory"
			]),
			scrollSnapAlign: $(k("Snap Align"), [
				"none",
				"start",
				"center",
				"end"
			]),
			scrollMarginTop: Za(k("Scroll Margin")),
			scrollPadding: Za(k("Scroll Padding")),
			scrollbarWidth: $(k("Scrollbar"), [
				"auto",
				"thin",
				"none"
			])
		}),
		...e("typography", {
			textDecorationColor: $a(k("Decoration Color")),
			textDecorationThickness: Za(k("Line Thickness"), { placeholder: k("Auto") }),
			textUnderlineOffset: Za(k("Underline Offset"), {
				unit: "em",
				units: ["em", "px"],
				step: .05,
				placeholder: k("Auto")
			}),
			whiteSpace: $(k("White Space"), [
				"normal",
				"nowrap",
				"pre",
				"pre-wrap",
				"pre-line",
				"break-spaces"
			]),
			wordBreak: $(k("Word Break"), [
				"normal",
				"break-all",
				"keep-all",
				"break-word"
			]),
			overflowWrap: $(k("Overflow Wrap"), [
				"normal",
				"anywhere",
				"break-word"
			]),
			hyphens: $(k("Hyphens"), [
				"manual",
				"auto",
				"none"
			]),
			textIndent: Za(k("Indent"), {
				unit: "em",
				units: [
					"em",
					"px",
					"rem"
				]
			}),
			textOverflow: $(k("Text Overflow"), ["clip", "ellipsis"]),
			fontVariantNumeric: $(k("Numbers"), [
				"normal",
				"tabular-nums",
				"proportional-nums",
				"lining-nums",
				"oldstyle-nums",
				"slashed-zero"
			]),
			fontFeatureSettings: eo(k("Font Features"), "'ss01'"),
			fontVariationSettings: eo(k("Font Variations"), "'wght' 500"),
			listStyleType: $(k("List Style"), [
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
			verticalAlign: $(k("Vertical Align"), [
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
			background: eo(k("Background"), "none"),
			backgroundBlendMode: $(k("Blend Mode"), to)
		}),
		...e("effects", {
			userSelect: $(k("User Select"), [
				"auto",
				"none",
				"text",
				"all"
			]),
			visibility: $(k("Visibility"), [
				"visible",
				"hidden",
				"collapse"
			]),
			maskImage: eo(k("Mask Image"), "linear-gradient(black, transparent)"),
			accentColor: $a(k("Accent Color")),
			fill: $a(k("Fill")),
			stroke: $a(k("Stroke")),
			strokeWidth: Za(k("Stroke Width")),
			content: eo(k("Content"), "''")
		}),
		...e("transform", {
			perspectiveOrigin: eo(k("Vanishing Point"), "center"),
			transformStyle: $(k("Transform Style"), ["flat", "preserve-3d"]),
			backfaceVisibility: $(k("Backface"), ["visible", "hidden"])
		}),
		...e("transition", { willChange: eo(k("Will Change"), "auto") })
	};
}
function ro(e, t = no()) {
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
var io = (e) => /^--[\w-]+$/.test(e) || /^-?[a-z]+(-[a-z]+)*$/.test(e) && typeof CSS < "u" && CSS.supports(e, "inherit");
function ao({ properties: e, labels: t = {}, onPick: n, label: r = k("Add a Property"), custom: i, children: a }) {
	let [o, s] = F(!1), [c, l] = F(""), [u, d] = F(0), f = no(), p = c.trim().toLowerCase(), m = e.map((e) => ({
		property: e,
		label: t[e] ?? String(ro(e, f).label)
	})).filter((e) => !p || e.label.toLowerCase().includes(p) || e.property.toLowerCase().includes(p.replace(/[\s-]/g, ""))), h = p.replace(/\s+/g, "-"), g = i && io(h) && !m.some((e) => e.property.toLowerCase() === h.replace(/-/g, "")) ? [...m, {
		property: h,
		label: h
	}] : m, _ = (e) => {
		e && (s(!1), n(e));
	};
	return e.length === 0 && !i ? null : /* @__PURE__ */ G(we, {
		open: o,
		onOpenChange: (e) => {
			s(e), l(""), d(0);
		},
		align: "end",
		className: "flex w-60 flex-col overflow-hidden !p-0",
		trigger: a ?? /* @__PURE__ */ W(R, {
			icon: "plus",
			size: "xs",
			label: r
		}),
		children: [/* @__PURE__ */ G("div", {
			className: "flex h-9 shrink-0 items-center gap-2 border-b border-border px-3",
			children: [/* @__PURE__ */ W(L, {
				name: "search",
				size: 14,
				className: "shrink-0 text-faint"
			}), /* @__PURE__ */ W("input", {
				autoFocus: !0,
				value: c,
				onChange: (e) => {
					l(e.target.value), d(0);
				},
				onKeyDown: (e) => {
					(e.key === "ArrowDown" || e.key === "ArrowUp") && (e.preventDefault(), d((t) => Math.max(0, Math.min(g.length - 1, t + (e.key === "ArrowDown" ? 1 : -1))))), e.key === "Enter" && (e.preventDefault(), _(g[u]?.property));
				},
				placeholder: k("Search"),
				"aria-label": k("Search"),
				className: "h-full min-w-0 flex-1 bg-transparent text-sm text-text outline-none"
			})]
		}), /* @__PURE__ */ G("div", {
			role: "listbox",
			"aria-label": r,
			className: "max-h-64 overflow-y-auto overscroll-contain p-1",
			children: [g.length === 0 && /* @__PURE__ */ W("p", {
				className: "m-0 px-2 py-3 text-sm text-muted",
				children: k("No matches")
			}), g.map((e, t) => /* @__PURE__ */ W(I, {
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
var oo = (e, t = no()) => [...e].sort((e, n) => String(ro(e, t).label).localeCompare(String(ro(n, t).label)));
function so({ s: e, group: t, title: n, open: r, empty: i, children: a }) {
	let [o, s] = F(null), c = no(), l = Object.keys(c).filter((e) => c[e].group === t), u = l.filter((t) => e.value(t) !== void 0 || t === o);
	return /* @__PURE__ */ G(ci, {
		title: n,
		open: r,
		empty: i && u.length === 0,
		fields: !0,
		actions: /* @__PURE__ */ W(ao, {
			properties: oo(l.filter((e) => !u.includes(e)), c),
			onPick: s
		}),
		children: [a, u.length > 0 && /* @__PURE__ */ W(Q, {
			s: e,
			fields: u.map((t) => ({
				...ro(t, c),
				set: (n) => {
					t === o && s(null), e.set(t, n);
				}
			}))
		})]
	});
}
var co = (e) => e.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`);
function lo({ s: e }) {
	let [t, n] = F(null), r = no(), i = /* @__PURE__ */ new Set([
		...Object.keys(r).map(co),
		"clip-path",
		"-webkit-text-stroke"
	]), a = [...new Set(e.classes.flatMap((e) => q(e).utility.match(/^!?\[([\w-]+):/)?.[1] ?? []))].filter((t) => !i.has(t) && e.value(t) !== void 0), o = t && !a.includes(t) ? [...a, t] : a;
	return /* @__PURE__ */ W(ci, {
		title: k("Other Properties"),
		open: o.length > 0,
		empty: o.length === 0,
		actions: /* @__PURE__ */ W(ao, {
			properties: [],
			custom: !0,
			onPick: n
		}),
		children: /* @__PURE__ */ W(Q, {
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
var uo = [
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
], fo = [
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
], po = {
	blur: "px",
	brightness: "percent",
	contrast: "percent",
	saturate: "percent",
	grayscale: "percent",
	"hue-rotate": "deg",
	invert: "percent",
	sepia: "percent"
}, mo = (e) => e.trim().replace(/\s+/g, " ");
function ho(e, t, n) {
	for (let [r, i] of e.ds.theme.entries()) if (r.startsWith("--blur-") && i.value === n) return e.make(t, r.slice(7));
	return e.make(t, n);
}
function go(e, t) {
	let n = (e) => `--tw-${t}${e}`, r = Object.keys(po), i = r.flatMap((t) => {
		let r = Ci(e.value(n(t)));
		return r === void 0 ? [] : [`${t}(${e.engine ? e.engine.resolve(r) : r})`];
	}).join(" ");
	return {
		value: i || void 0,
		set: (a) => {
			let o = e.engine;
			if (!o) return;
			let s = new Map(Ja(i).map((e) => [e.name, e.value])), c = new Map(Ja(a).map((e) => [e.name, e.value]));
			e.edit((e) => {
				for (let i of r) {
					if (s.get(i) === c.get(i)) continue;
					let r = c.get(i), a = `${t}${i}`;
					e.swap(n(i), r === void 0 ? null : i === "blur" ? ho(o, a, r) : Ei(o, a, r, po[i]));
				}
			}, `${t}filter`);
		},
		markers: r.map(n)
	};
}
function _o({ s: e }) {
	let t = Lt(), n = go(e, ""), r = go(e, "backdrop-"), i = e.value("--tw-shadow"), a = i && (t.of("shadow").find((e) => mo(e.value) === mo(i))?.ref ?? i), o = e.value("opacity"), s = [
		"opacity",
		"--tw-shadow",
		"mixBlendMode",
		"cursor",
		"pointerEvents",
		"clipPath"
	].some((t) => e.value(t)) || n.value || r.value;
	return /* @__PURE__ */ G(so, {
		s: e,
		group: "effects",
		title: k("Effects"),
		empty: !s,
		children: [
			/* @__PURE__ */ W(Q, {
				s: e,
				fields: [{
					handle: "opacity",
					type: "text",
					component: "blocks-value",
					label: k("Opacity"),
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
					set: (t) => e.swap("opacity", t == null || t === "" || !e.engine ? null : Ei(e.engine, "opacity", `${Math.round(Number(t) * 100)}%`, "percent"))
				}]
			}),
			/* @__PURE__ */ W(Q, {
				s: e,
				bare: !0,
				fields: [{
					handle: "boxShadow",
					type: "text",
					component: "blocks-shadows",
					label: k("Shadows"),
					group: "shadow",
					markers: ["--tw-shadow"],
					get: () => a,
					set: (t) => e.swap("--tw-shadow", t && e.engine ? Ei(e.engine, "shadow", t, "number") : null)
				}]
			}),
			/* @__PURE__ */ W(Q, {
				s: e,
				bare: !0,
				fields: [{
					handle: "filter",
					type: "text",
					component: "blocks-filters",
					label: k("Filters"),
					markers: n.markers,
					get: () => n.value,
					set: n.set
				}]
			}),
			/* @__PURE__ */ W(Q, {
				s: e,
				bare: !0,
				fields: [{
					handle: "backdropFilter",
					type: "text",
					component: "blocks-filters",
					label: k("Backdrop"),
					markers: r.markers,
					get: () => r.value,
					set: r.set
				}]
			}),
			/* @__PURE__ */ W(Q, {
				s: e,
				fields: [
					{
						handle: "clipPath",
						type: "text",
						component: "blocks-clip",
						label: k("Clip Path"),
						className: "items-start py-0.5 [&>label]:leading-6"
					},
					{
						handle: "mixBlendMode",
						type: "select",
						size: "sm",
						label: k("Blending"),
						placeholder: k("Normal"),
						options: uo
					},
					{
						handle: "cursor",
						type: "select",
						size: "sm",
						label: k("Cursor"),
						placeholder: k("Auto"),
						options: fo
					},
					{
						handle: "pointerEvents",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: k("Clicks"),
						placeholder: "auto",
						options: [{
							value: "auto",
							label: k("On")
						}, {
							value: "none",
							label: k("Pass Through")
						}]
					}
				]
			})
		]
	});
}
// admin/src/builder/palette.tsx
var vo = [
	"50",
	"100",
	"200",
	"300",
	"400",
	"500",
	"600",
	"700",
	"800",
	"900",
	"950"
];
function yo({ families: e, cell: t, head: n, className: r }) {
	return /* @__PURE__ */ G("div", {
		className: V("grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-x-2 gap-y-1", r),
		children: [n && /* @__PURE__ */ G(U, { children: [/* @__PURE__ */ W("span", {}), /* @__PURE__ */ W("div", {
			className: "grid grid-cols-11 gap-0.5 text-center text-2xs tabular-nums text-faint",
			children: vo.map((e) => /* @__PURE__ */ W("span", { children: e }, e))
		})] }), e.map((e) => /* @__PURE__ */ G("div", {
			className: "contents",
			children: [/* @__PURE__ */ W("span", {
				className: "truncate text-xs text-muted",
				children: e.name
			}), /* @__PURE__ */ W("div", {
				className: "grid grid-cols-11 gap-0.5",
				children: e.shades.map(t)
			})]
		}, e.name))]
	});
}
var bo = "scheme-";
function xo(e) {
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
var So = (e) => /^transparent$|\/\s*(0?\.\d+|\d{1,2}(\.\d+)?%)\s*\)$/.test(e.trim());
function Co({ background: e, text: t, size: n }) {
	let r = So(e);
	return /* @__PURE__ */ G("span", {
		"aria-hidden": !0,
		className: V("relative grid shrink-0 place-items-center overflow-hidden", n === "mark" ? "h-4 w-5 rounded-xs text-2xs" : "h-20 w-full rounded-md text-2xl", r && "cms-checkerboard"),
		children: [
			/* @__PURE__ */ W("span", {
				className: "absolute inset-0",
				style: { background: e }
			}),
			/* @__PURE__ */ W("span", {
				className: "relative font-semibold leading-none",
				style: {
					color: t,
					textShadow: r ? "0 0 3px rgb(0 0 0 / 0.6)" : void 0
				},
				children: "Aa"
			}),
			/* @__PURE__ */ W("span", { className: "cms-swatch-edge" })
		]
	});
}
// admin/src/builder/color.tsx
function wo(e) {
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
	} : Eo(t);
}
var To;
function Eo(e) {
	if (typeof document > "u" || typeof CSS > "u" || !CSS.supports("color", e) || /var\(|light-dark\(/.test(e) || (To ??= document.createElement("canvas").getContext("2d", { willReadFrequently: !0 }), !To)) return null;
	To.clearRect(0, 0, 1, 1), To.fillStyle = "black", To.fillStyle = e, To.fillRect(0, 0, 1, 1);
	let [t, n, r, i] = To.getImageData(0, 0, 1, 1).data;
	return {
		r: t,
		g: n,
		b: r,
		a: Math.round(i / 255 * 100) / 100
	};
}
function Do({ r: e, g: t, b: n, a: r }) {
	let i = (e) => Math.round(e).toString(16).padStart(2, "0");
	return r >= 1 ? `#${i(e)}${i(t)}${i(n)}` : `rgb(${Math.round(e)} ${Math.round(t)} ${Math.round(n)} / ${Math.round(r * 100)}%)`;
}
function Oo({ r: e, g: t, b: n }) {
	e /= 255, t /= 255, n /= 255;
	let r = Math.max(e, t, n), i = r - Math.min(e, t, n);
	return {
		h: ((i === 0 ? 0 : r === e ? (t - n) / i % 6 : r === t ? (n - e) / i + 2 : (e - t) / i + 4) * 60 + 360) % 360,
		s: r === 0 ? 0 : i / r,
		v: r
	};
}
function ko(e, t, n, r) {
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
function Ao(e, t) {
	return t >= 100 ? `var(${e})` : `color-mix(in oklab, var(${e}) ${Math.round(t)}%, transparent)`;
}
function jo(e) {
	return typeof CSS < "u" && CSS.supports("color", e);
}
function Mo() {
	let e = Lt();
	return (t) => t ? e.resolve(t) : "transparent";
}
function No({ field: e, value: t, onChange: n, disabled: r }) {
	let [i, a] = F(!1), o = Mo(), s = Ji(), c = t ?? void 0, l = s(c);
	return /* @__PURE__ */ W(ra, { children: /* @__PURE__ */ W(we, {
		open: i,
		onOpenChange: a,
		align: "end",
		className: "!p-0",
		trigger: /* @__PURE__ */ G(B, {
			compact: !0,
			id: Me(e),
			disabled: r,
			className: V(mi, "flex items-center gap-1.5 pl-1 text-left"),
			children: [/* @__PURE__ */ W(hi, {
				color: c === void 0 && typeof e.swatch == "string" ? e.swatch : o(c),
				className: "!size-4"
			}), l ? /* @__PURE__ */ W(Xi, {
				token: l.token,
				alpha: l.alpha
			}) : /* @__PURE__ */ W("span", {
				className: V("truncate font-mono", !c && "font-sans text-faint"),
				children: c ?? e.placeholder ?? k("None")
			})]
		}),
		children: /* @__PURE__ */ W(Fo, {
			label: e.label || k("Color"),
			value: c,
			onChange: n
		})
	}) });
}
var Po = "pointer-events-none absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-pop ring-1 ring-black/20";
function Fo({ label: e, value: t, onChange: n }) {
	let r = Lt(), i = r.of("color"), a = ge(() => Wi(i), [i]), o = r.find(t), s = o?.token.variable ?? null, c = !!s && a.families.some((e) => e.shades.some((e) => e.variable === s)), l = o ? o.alpha === void 0 ? 1 : Number(o.alpha) / 100 : 1, u = wo(o ? Gi(r.resolve(o.token.ref)).light : t) ?? {
		r: 0,
		g: 0,
		b: 0,
		a: 1
	}, [d, f] = F(() => ({
		...Oo(u),
		a: o ? l : u.a
	})), [p, m] = F(t ?? ""), h = ua(p, (e) => !e.trim() || jo(e.trim())), g = [
		...a.own.length ? [{
			value: "theme",
			label: k("Theme")
		}] : [],
		...a.families.length ? [{
			value: "palette",
			label: k("Palette")
		}] : [],
		{
			value: "custom",
			label: k("Custom")
		}
	], [_, v] = F(() => t && !o ? "custom" : c ? "palette" : g[0].value), [y, b] = F(null);
	N(() => m(t ?? ""), [t]);
	let x = (e, t, r, i) => {
		f({
			h: e,
			s: t,
			v: r,
			a: i
		}), n(Do(ko(e, t, r, i)));
	}, S = (e, t) => {
		let r = e.currentTarget;
		r.setPointerCapture(e.pointerId);
		let i = (e) => {
			let i = r.getBoundingClientRect(), a = Math.max(0, Math.min(1, (e.clientX - i.left) / i.width)), o = Math.max(0, Math.min(1, (e.clientY - i.top) / i.height));
			t === "area" ? x(d.h, a, 1 - o, d.a) : t === "hue" ? x(a * 360, d.s, d.v, d.a) : s ? n(Ao(s, a < .995 ? Math.round(a * 100) : 100)) : x(d.h, d.s, d.v, Math.round(a * 100) / 100);
		};
		i(e);
		let a = (e) => i(e), o = () => {
			r.removeEventListener("pointermove", a), r.removeEventListener("pointerup", o);
		};
		r.addEventListener("pointermove", a), r.addEventListener("pointerup", o);
	}, C = s ? l : d.a, w = s ? Gi(r.resolve(`var(${s})`)).light : Do({ ...ko(d.h, d.s, d.v, 1) }), T = /* @__PURE__ */ G("div", {
		onPointerDown: (e) => S(e, "alpha"),
		className: "relative h-3 min-w-0 flex-1 cursor-ew-resize rounded-full cms-checkerboard [--checker:6px]",
		children: [/* @__PURE__ */ W("span", {
			className: "absolute inset-0 rounded-full",
			style: { background: `linear-gradient(to right, transparent, ${w})` }
		}), /* @__PURE__ */ W("span", {
			className: V(Po, "top-1/2"),
			style: { left: `${C * 100}%` }
		})]
	}), E = y ?? (c ? o?.token ?? null : null);
	return /* @__PURE__ */ G("div", {
		className: "w-72",
		children: [
			/* @__PURE__ */ G("div", {
				className: "flex h-10 items-center gap-2 border-b border-border pl-3 pr-1.5",
				children: [/* @__PURE__ */ W("span", {
					className: "min-w-0 flex-1 truncate text-xs font-medium text-ink",
					children: e
				}), g.length > 1 && /* @__PURE__ */ W(Ee, {
					size: "xs",
					"aria-label": k("Colors"),
					value: _,
					onChange: v,
					options: g
				})]
			}),
			_ === "theme" && /* @__PURE__ */ W("div", {
				role: "listbox",
				"aria-label": k("Theme Colors"),
				className: "h-72 overflow-y-auto overscroll-contain p-1",
				children: a.own.map((e) => {
					let t = s === e.variable, { light: i, dark: a } = Gi(e.value);
					return /* @__PURE__ */ G(B, {
						compact: !0,
						role: "option",
						"aria-selected": t,
						onClick: () => n(e.ref),
						className: V("flex h-8 w-full items-center gap-2.5 rounded-sm px-2 text-left hover:bg-hover", t && "bg-active"),
						children: [
							/* @__PURE__ */ W(hi, {
								color: i,
								dark: a,
								className: "!size-4"
							}),
							/* @__PURE__ */ W("span", {
								className: "min-w-0 flex-1 truncate text-xs text-ink",
								children: e.name
							}),
							t ? /* @__PURE__ */ W(L, {
								name: "check",
								size: 12,
								className: "shrink-0 text-ink"
							}) : /* @__PURE__ */ W("span", {
								className: "max-w-24 shrink-0 truncate font-mono text-2xs text-faint",
								children: Gi(r.resolve(e.ref)).light
							})
						]
					}, e.variable);
				})
			}),
			_ === "palette" && /* @__PURE__ */ G(U, { children: [/* @__PURE__ */ W("div", {
				role: "listbox",
				"aria-label": k("Palette"),
				className: "h-64 overflow-y-auto overscroll-contain p-3",
				onPointerLeave: () => b(null),
				children: /* @__PURE__ */ W(yo, {
					families: a.families,
					cell: (e) => {
						let t = s === e.variable;
						return /* @__PURE__ */ W(B, {
							compact: !0,
							role: "option",
							"aria-selected": t,
							"aria-label": e.name,
							onClick: () => n(e.ref),
							onPointerEnter: () => b(e),
							onFocus: () => b(e),
							className: V("relative h-5 rounded-xs outline-offset-1 hover:z-raised hover:ring-2 hover:ring-float", t && "z-raised ring-2 ring-focus"),
							style: { background: Gi(e.value).light },
							children: /* @__PURE__ */ W("span", { className: "cms-swatch-edge" })
						}, e.variable);
					}
				})
			}), /* @__PURE__ */ W("div", {
				className: "flex h-8 items-center gap-2 border-t border-border px-3 text-xs",
				children: E && /* @__PURE__ */ G(U, { children: [/* @__PURE__ */ W("span", {
					className: "min-w-0 flex-1 truncate text-ink",
					children: E.name
				}), /* @__PURE__ */ W("span", {
					className: "max-w-32 shrink-0 truncate font-mono text-2xs text-faint",
					children: Gi(r.resolve(E.ref)).light
				})] })
			})] }),
			_ === "custom" && /* @__PURE__ */ G("div", {
				className: "h-72 space-y-3 p-3",
				children: [
					/* @__PURE__ */ W("div", {
						onPointerDown: (e) => S(e, "area"),
						className: "relative h-44 cursor-crosshair overflow-hidden rounded-sm",
						style: { background: `linear-gradient(to top, black, transparent), linear-gradient(to right, white, hsl(${d.h} 100% 50%))` },
						children: /* @__PURE__ */ W("span", {
							className: Po,
							style: {
								left: `${d.s * 100}%`,
								top: `${(1 - d.v) * 100}%`
							}
						})
					}),
					/* @__PURE__ */ W("div", {
						onPointerDown: (e) => S(e, "hue"),
						className: "relative h-3 cursor-ew-resize rounded-full",
						style: { background: "linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)" },
						children: /* @__PURE__ */ W("span", {
							className: V(Po, "top-1/2"),
							style: { left: `${d.h / 360 * 100}%` }
						})
					}),
					/* @__PURE__ */ W("div", {
						className: "flex items-center",
						children: T
					}),
					/* @__PURE__ */ G("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ W(hi, {
							color: t ? r.resolve(t) : "transparent",
							className: "!size-7 !rounded-sm"
						}), /* @__PURE__ */ W("input", {
							value: p,
							spellCheck: !1,
							"aria-label": k("Color Value"),
							"aria-invalid": h.shown || void 0,
							onChange: (e) => m(e.target.value),
							onBlur: () => {
								let e = p.trim();
								if (e && !jo(e)) return m(t ?? "");
								e !== (t ?? "") && n(e || null);
							},
							onKeyDown: (e) => {
								e.key === "Escape" && m(t ?? ""), e.key === "Enter" && (p.trim() && !jo(p.trim()) ? h.show() : e.target.blur());
							},
							className: V("cms-input h-7 w-full min-w-0 rounded-sm px-2 text-sm placeholder:text-ghost", "font-mono"),
							placeholder: be
						})]
					})
				]
			}),
			/* @__PURE__ */ G("div", {
				className: "flex h-10 items-center gap-2 border-t border-border pl-3 pr-1.5",
				children: [s && _ !== "custom" ? /* @__PURE__ */ G(U, { children: [
					/* @__PURE__ */ W("span", {
						className: "shrink-0 text-xs text-muted",
						children: k("Opacity")
					}),
					T,
					/* @__PURE__ */ G("span", {
						className: "w-9 shrink-0 text-right text-2xs tabular-nums text-muted",
						children: [Math.round(C * 100), "%"]
					})
				] }) : /* @__PURE__ */ W("span", { className: "flex-1" }), /* @__PURE__ */ W(I, {
					variant: "ghost",
					size: "xs",
					disabled: !t,
					onClick: () => n(null),
					className: "shrink-0 !font-normal !text-muted hover:!text-ink",
					children: k("Clear")
				})]
			})
		]
	});
}
// admin/src/builder/fields/style.tsx
function Io(e) {
	let t = e?.match(/^(linear|radial)-gradient\((.*)\)$/);
	if (!t) return null;
	let n = Pa(t[2]), r = t[1] === "linear" ? "180deg" : "circle";
	n[0] && (/deg$|^to /.test(n[0]) || /^(circle|ellipse)/.test(n[0])) && (r = n.shift());
	let i = n.map((e) => {
		let t = Na(e);
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
function Lo(e) {
	return `${e.kind}-gradient(${[e.angle, ...e.stops.map((e) => `${e.color}${e.at ? ` ${e.at}` : ""}`)].join(", ")})`;
}
function Ro({ value: e, onChange: t, context: n }) {
	let r = Mo(), i = Io(e);
	if (!i) return null;
	let a = (e) => t(Lo(e));
	return /* @__PURE__ */ G("div", {
		className: "min-w-0 flex-1 space-y-1 rounded-md bg-active/60 p-1.5",
		children: [
			/* @__PURE__ */ W("div", {
				className: "h-6 rounded-sm ring-1 ring-inset ring-black/10",
				style: { background: r(Lo({
					...i,
					kind: "linear",
					angle: "90deg"
				})) }
			}),
			/* @__PURE__ */ W(Z, {
				bare: !0,
				context: n,
				fields: [{
					handle: "shape",
					type: "group",
					component: "blocks-group",
					label: k("Shape"),
					fields: [{
						handle: "kind",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: k("Kind"),
						required: !0,
						options: [{
							value: "linear",
							label: k("Linear")
						}, {
							value: "radial",
							label: k("Radial")
						}]
					}, {
						handle: "angle",
						type: "text",
						component: "blocks-value",
						label: k("Angle"),
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
			i.stops.map((e, t) => /* @__PURE__ */ G("div", {
				className: "flex items-center gap-1",
				children: [/* @__PURE__ */ W(Z, {
					bare: !0,
					className: "min-w-0 flex-1",
					context: n,
					fields: [{
						handle: "stop",
						type: "group",
						component: "blocks-group",
						label: k("Stop||gradient"),
						fields: [{
							handle: "color",
							type: "color",
							component: "blocks-color",
							label: k("Color")
						}, {
							handle: "at",
							type: "text",
							component: "blocks-value",
							label: k("Position"),
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
				}), i.stops.length > 2 && /* @__PURE__ */ W(vi, { onClick: () => a({
					...i,
					stops: i.stops.filter((e, n) => n !== t)
				}) })]
			}, t)),
			/* @__PURE__ */ G(B, {
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
					/* @__PURE__ */ W(L, {
						name: "plus",
						size: 14
					}),
					" ",
					k("Add Stop")
				]
			})
		]
	});
}
var zo = [
	"flex-start",
	"center",
	"flex-end"
], Bo = () => [
	{
		value: "flex-start",
		label: k("Start")
	},
	{
		value: "center",
		label: k("Center")
	},
	{
		value: "flex-end",
		label: k("End")
	},
	{
		value: "space-between",
		label: k("Space Between")
	},
	{
		value: "space-around",
		label: k("Space Around")
	},
	{
		value: "space-evenly",
		label: k("Space Evenly")
	}
];
function Vo({ field: e, value: t, onChange: n, context: r }) {
	let i = e.row === !0, a = t?.justifyContent ?? void 0, o = t?.alignItems ?? void 0;
	return /* @__PURE__ */ G(ra, { children: [/* @__PURE__ */ W("div", {
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
			let r = zo[i ? t : e], s = zo[i ? e : t], c = (a ?? "flex-start") === r && (o ?? "stretch").replace("stretch", "flex-start") === s;
			return /* @__PURE__ */ W(B, {
				compact: !0,
				onClick: () => n({
					justifyContent: r,
					alignItems: s
				}),
				className: "grid place-items-center rounded-xs hover:bg-hover",
				title: `${r.replace("flex-", "")} · ${s.replace("flex-", "")}`,
				children: /* @__PURE__ */ W("span", { className: V("rounded-full", c ? "size-2 bg-ink" : "size-1 bg-faint") })
			}, `${t}${e}`);
		}))
	}), /* @__PURE__ */ W(Z, {
		bare: !0,
		className: "min-w-0 flex-1",
		context: r,
		fields: [{
			handle: "justifyContent",
			type: "select",
			size: "sm",
			label: k("Distribute"),
			options: Bo(),
			placeholder: k("Distribute")
		}, {
			handle: "alignItems",
			type: "select",
			display: "segmented",
			block: !0,
			size: "sm",
			label: k("Align"),
			options: [
				{
					value: "flex-start",
					icon: i ? "align-top" : "justify-start",
					title: k("Start")
				},
				{
					value: "center",
					icon: i ? "align-middle" : "justify-center",
					title: k("Center")
				},
				{
					value: "flex-end",
					icon: i ? "align-bottom" : "justify-end",
					title: k("End")
				},
				{
					value: "stretch",
					icon: i ? "arrows-out-line-vertical" : "spacing",
					title: k("Stretch")
				},
				{
					value: "baseline",
					icon: "text",
					title: k("Baseline")
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
var Ho = [
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
], Uo = {
	left: "0%",
	top: "0%",
	center: "50%",
	right: "100%",
	bottom: "100%"
};
function Wo(e) {
	let t = (e ?? "center").trim().split(/\s+/), n = (e) => e === "top" || e === "bottom";
	t.length === 1 && t.push("center");
	let [r, i] = n(t[0]) || t[1] && (t[1] === "left" || t[1] === "right") ? [t[1], t[0]] : t;
	return `${Uo[r] ?? r} ${Uo[i] ?? i}`;
}
function Go({ field: e, value: t, onChange: n, context: r, disabled: i }) {
	let a = Wo(t);
	return /* @__PURE__ */ G(ra, { children: [/* @__PURE__ */ W("div", {
		className: "grid size-[60px] shrink-0 grid-cols-3 gap-px rounded-sm bg-bg p-1",
		role: "radiogroup",
		"aria-label": e.label,
		children: Ho.flat().map((t) => {
			let r = a === Wo(t);
			return /* @__PURE__ */ W(B, {
				compact: !0,
				role: "radio",
				"aria-checked": r,
				disabled: i,
				onClick: () => n(t === "center" && !e.required ? null : t),
				className: "grid place-items-center rounded-xs hover:bg-hover",
				title: t,
				children: /* @__PURE__ */ W("span", { className: V("rounded-full", r ? "size-2 bg-ink" : "size-1 bg-faint") })
			}, t);
		})
	}), /* @__PURE__ */ W(na, {
		field: {
			handle: `${e.handle}-value`,
			type: "text",
			component: "blocks-value",
			label: e.label,
			unit: "",
			placeholder: k("Center")
		},
		value: t ?? null,
		onChange: (e) => n(e || null),
		context: r,
		disabled: i
	})] });
}
// admin/src/builder/design/Fill.tsx
var Ko = [
	"backgroundSize",
	"backgroundPosition",
	"backgroundRepeat",
	"backgroundAttachment"
], qo = (e) => e?.match(/^url\(["']?([^"')]*)["']?\)$/)?.[1];
function Jo(e) {
	try {
		return encodeURI(decodeURI(e));
	} catch {
		return encodeURI(e);
	}
}
function Yo({ s: e }) {
	let t = Lt(), n = e.value("backgroundImage"), r = Mi(e.value) ?? (Io(n) ? n : void 0), i = r ? "gradient" : n ? "image" : "none", a = qo(n), [o, s] = F(null), c = e.value("backgroundColor") || n || r, l = () => e.edit((e) => {
		e.swap(Ai, null), e.write(Object.fromEntries(Ko.map((e) => [e, null])));
	}, "fill"), u = (t) => {
		let n = Io(t);
		if (!e.engine || !n) return l();
		e.swap(Ai, ji(e.engine, n), "gradient");
	}, d = (t) => {
		let n = t && e.engine ? e.engine.make("bg", `url(${Jo(t)})`) : null;
		e.swap(Ai, n ?? "bg-none", "image");
	}, f = async (e) => {
		if (!e) return s(null), d(null);
		try {
			let { items: t } = await O("media/get-many", { ids: [e] });
			if (!t[0]?.url) return;
			s({
				id: e,
				url: t[0].url
			}), d(t[0].url);
		} catch (e) {
			H.error(e);
		}
	};
	return /* @__PURE__ */ G(so, {
		s: e,
		group: "fill",
		title: k("Fill"),
		empty: !c,
		children: [
			/* @__PURE__ */ W(Q, {
				s: e,
				fields: [{
					handle: "backgroundColor",
					type: "color",
					component: "blocks-color",
					label: k("Color")
				}, {
					handle: "kind",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: k("Image"),
					options: [
						{
							value: "none",
							label: k("None")
						},
						{
							value: "gradient",
							icon: "gradient",
							title: k("Gradient")
						},
						{
							value: "image",
							icon: "image",
							title: k("Image")
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
						let r = Wi(t.of("color")).own[0]?.ref ?? "currentColor";
						n === "gradient" ? u(`linear-gradient(180deg, ${r}, transparent)`) : n === "image" ? e.edit((e) => {
							e.swap(Ai, "bg-none"), e.write({
								backgroundSize: "cover",
								backgroundPosition: "center"
							});
						}, "fill") : l();
					}
				}]
			}),
			i === "gradient" && /* @__PURE__ */ W(Q, {
				s: e,
				bare: !0,
				fields: [{
					handle: "gradient",
					type: "text",
					component: "blocks-gradient",
					className: "items-start",
					label: k("Gradient"),
					get: () => r,
					set: u
				}]
			}),
			i === "image" && /* @__PURE__ */ G("div", {
				className: "space-y-1 rounded-md bg-active/60 p-1.5 text-xs",
				children: [/* @__PURE__ */ W(ye, {
					bare: !0,
					disabled: !e.engine,
					fields: [{
						handle: "bg",
						type: "media",
						label: k("Image"),
						max: 1,
						accept: "image/*"
					}],
					values: { bg: o && o.url === a ? [o.id] : [] },
					onChange: (e, t) => void f(t?.[0])
				}), /* @__PURE__ */ W(Z, {
					bare: !0,
					disabled: !e.engine,
					fields: [{
						handle: "url",
						type: "text",
						size: "sm",
						commit: "blur",
						mono: !0,
						label: k("Image Address"),
						placeholder: "/media/…"
					}],
					values: { url: a ?? "" },
					onChange: (e, t) => d(t.trim() || null)
				})]
			}),
			/* @__PURE__ */ W(Q, {
				s: e,
				fields: [
					i === "image" && {
						handle: "backgroundSize",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: k("Size"),
						options: [
							{
								value: "cover",
								label: k("Cover")
							},
							{
								value: "contain",
								label: k("Contain")
							},
							{
								value: "auto",
								label: k("Original")
							}
						]
					},
					i === "image" && {
						handle: "backgroundPosition",
						type: "json",
						component: "blocks-origin",
						label: k("Position"),
						className: "items-start py-0.5 [&>label]:leading-6"
					},
					i === "image" && {
						handle: "backgroundRepeat",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: k("Repeat||again"),
						placeholder: "repeat",
						options: [
							{
								value: "no-repeat",
								label: k("Once")
							},
							{
								value: "repeat",
								label: k("Tile")
							},
							{
								value: "repeat-x",
								icon: "spacing",
								title: k("Tile Across")
							},
							{
								value: "repeat-y",
								icon: "arrows-out-line-vertical",
								title: k("Tile Down")
							}
						]
					},
					i === "image" && {
						handle: "backgroundAttachment",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: k("Scrolling"),
						options: [{
							value: "scroll",
							label: k("With Page")
						}, {
							value: "fixed",
							label: k("Fixed")
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
						label: k("Clip"),
						options: [{
							value: "border-box",
							label: k("Box")
						}, {
							value: "text",
							label: k("Text")
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
var Xo = () => [
	{
		value: "block",
		icon: "square",
		title: k("Block")
	},
	{
		value: "flex",
		icon: "rows",
		title: k("Stack (flex)")
	},
	{
		value: "grid",
		icon: "grid",
		title: k("Grid")
	},
	{
		value: "inline-flex",
		icon: "arrows-in-line-horizontal",
		title: k("Inline Stack")
	},
	{
		value: "none",
		icon: "eye-off",
		title: k("Hidden")
	}
], Zo = (e) => e?.match(/^repeat\((\d+), minmax\(0, 1fr\)\)$/)?.[1] ?? e, Qo = (e) => e?.match(/^span (\d+) \/ span \1$/)?.[1] ?? e;
function $o(e, t, n, r) {
	r && /^\d+$/.test(r.trim()) && e.engine?.valid(`${n}-${r.trim()}`) ? e.swap(t.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`), `${n}-${r.trim()}`) : e.set(t, r);
}
function es({ s: e }) {
	let t = e.value("display"), n = t === "flex" || t === "inline-flex", r = t === "grid" || t === "inline-grid", i = n && (e.value("flexDirection") ?? "row").startsWith("row");
	return /* @__PURE__ */ W(so, {
		s: e,
		group: "layout",
		title: k("Layout"),
		empty: !t,
		children: /* @__PURE__ */ W(Q, {
			s: e,
			fields: [
				{
					handle: "display",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: k("Display"),
					options: Xo()
				},
				n && {
					handle: "flexDirection",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: k("Direction"),
					get: () => e.value("flexDirection") ?? "row",
					options: [
						{
							value: "row",
							icon: "arrow-right",
							title: k("Horizontal")
						},
						{
							value: "column",
							icon: "arrow-down",
							title: k("Vertical")
						},
						{
							value: "row-reverse",
							icon: "arrow-left",
							title: k("Horizontal, Reversed")
						},
						{
							value: "column-reverse",
							icon: "arrow-up",
							title: k("Vertical, Reversed")
						}
					]
				},
				n && {
					handle: "align",
					type: "json",
					component: "blocks-align",
					label: k("Align"),
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
					label: k("Gap"),
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
					label: k("Wrap"),
					options: [{
						value: "nowrap",
						label: k("One Line")
					}, {
						value: "wrap",
						label: k("Wrap")
					}],
					get: () => e.value("flexWrap") ?? "nowrap",
					set: (t) => e.set("flexWrap", t === "wrap" ? "wrap" : null)
				},
				r && {
					handle: "gridTemplateColumns",
					type: "text",
					component: "blocks-value",
					label: k("Columns"),
					placeholder: k("3 or 1fr 2fr"),
					unit: "",
					min: 1,
					title: k("A number of equal columns, or any grid template (1fr 2fr, repeat(auto-fill, minmax(16rem, 1fr)))"),
					get: () => Zo(e.value("gridTemplateColumns")),
					set: (t) => $o(e, "gridTemplateColumns", "grid-cols", t)
				},
				r && {
					handle: "gridTemplateRows",
					type: "text",
					component: "blocks-value",
					label: k("Rows"),
					placeholder: "auto",
					unit: "",
					get: () => Zo(e.value("gridTemplateRows")),
					set: (t) => $o(e, "gridTemplateRows", "grid-rows", t)
				},
				r && {
					handle: "gaps",
					type: "group",
					component: "blocks-group",
					label: k("Gap"),
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
						label: k("Columns"),
						group: "spacing",
						prefixIcon: "split",
						placeholder: "0",
						min: 0
					}, {
						handle: "rowGap",
						type: "text",
						component: "blocks-value",
						label: k("Rows"),
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
					label: k("Align"),
					keys: ["alignItems", "justifyItems"],
					get: () => e.value("alignItems"),
					options: [
						{
							value: "flex-start",
							icon: "align-top",
							title: k("Top")
						},
						{
							value: "center",
							icon: "align-middle",
							title: k("Middle")
						},
						{
							value: "flex-end",
							icon: "align-bottom",
							title: k("Bottom")
						},
						{
							value: "stretch",
							icon: "arrows-out-line-vertical",
							title: k("Stretch")
						}
					]
				},
				r && {
					handle: "gridAutoFlow",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: k("Flow"),
					options: [
						{
							value: "row",
							icon: "arrow-right",
							title: k("Rows First")
						},
						{
							value: "column",
							icon: "arrow-down",
							title: k("Columns First")
						},
						{
							value: "row dense",
							icon: "group",
							title: k("Fill Gaps (Dense)")
						}
					]
				}
			]
		})
	});
}
function ts({ s: e, parentDisplay: t }) {
	if (!t || !/flex|grid/.test(t)) return null;
	let n = t.includes("grid");
	return /* @__PURE__ */ W(so, {
		s: e,
		group: "item",
		title: k(n ? "Grid Item" : "Stack Item"),
		open: !1,
		empty: !e.value("alignSelf") && !e.value("flex") && !e.value("gridColumn"),
		children: /* @__PURE__ */ W(Q, {
			s: e,
			fields: [
				n && {
					handle: "gridColumn",
					type: "text",
					component: "blocks-value",
					label: k("Column"),
					placeholder: "auto",
					unit: "",
					title: k("Span a number of columns (2), or a range (1 / -1 for full width)"),
					get: () => Qo(e.value("gridColumn")),
					set: (t) => $o(e, "gridColumn", "col-span", t)
				},
				n && {
					handle: "gridRow",
					type: "text",
					component: "blocks-value",
					label: k("Row"),
					placeholder: "auto",
					unit: "",
					get: () => Qo(e.value("gridRow")),
					set: (t) => $o(e, "gridRow", "row-span", t)
				},
				!n && {
					handle: "flex",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: k("Grow"),
					options: [
						{
							value: "1",
							label: k("Fill||size")
						},
						{
							value: "none",
							label: k("Fixed")
						},
						{
							value: "0 1 auto",
							label: k("Shrink")
						}
					]
				},
				{
					handle: "alignSelf",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: k("Align Self"),
					options: [
						{
							value: "flex-start",
							icon: "align-top",
							title: k("Start")
						},
						{
							value: "center",
							icon: "align-middle",
							title: k("Center")
						},
						{
							value: "flex-end",
							icon: "align-bottom",
							title: k("End")
						},
						{
							value: "stretch",
							icon: "arrows-out-line-vertical",
							title: k("Stretch")
						}
					]
				},
				{
					handle: "order",
					type: "text",
					component: "blocks-value",
					label: k("Display Order"),
					unit: "",
					placeholder: "0",
					prefixIcon: "list-ordered"
				}
			]
		})
	});
}
// admin/src/builder/design/Position.tsx
function ns({ s: e }) {
	let t = e.value("position"), n = !!t && t !== "static";
	return /* @__PURE__ */ W(so, {
		s: e,
		group: "position",
		title: k("Position"),
		open: !!t,
		empty: !t,
		children: /* @__PURE__ */ W(Q, {
			s: e,
			fields: [
				{
					handle: "position",
					type: "select",
					size: "sm",
					label: k("Type"),
					placeholder: k("Static"),
					options: [
						{
							value: "static",
							label: k("Static")
						},
						{
							value: "relative",
							label: k("Relative")
						},
						{
							value: "absolute",
							label: k("Absolute")
						},
						{
							value: "fixed",
							label: k("Fixed")
						},
						{
							value: "sticky",
							label: k("Sticky")
						}
					]
				},
				n && {
					handle: "offsets",
					type: "group",
					component: "blocks-group",
					label: k("Offsets"),
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
							top: k("Top"),
							right: k("Right"),
							bottom: k("Bottom"),
							left: k("Left")
						}[e],
						title: {
							top: k("Top"),
							right: k("Right"),
							bottom: k("Bottom"),
							left: k("Left")
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
					label: k("Z-index"),
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
					label: k("Isolation"),
					placeholder: "auto",
					options: [{
						value: "auto",
						label: k("Auto")
					}, {
						value: "isolate",
						label: k("Isolate")
					}]
				}
			]
		})
	});
}
// admin/src/builder/design/Size.tsx
function rs(e, t, n) {
	let r = e.value(t), i = r === "100%" ? "fill" : r === "fit-content" ? "fit" : r === "auto" || !r ? "auto" : r.endsWith("vh") || r.endsWith("vw") || r.endsWith("dvh") ? "viewport" : "fixed", a = {
		fill: k("Fill||size"),
		fit: k("Fit"),
		auto: k("Auto"),
		viewport: k("Window"),
		fixed: k("Fixed")
	};
	return {
		handle: t,
		type: "text",
		component: "blocks-value",
		label: n,
		prefix: t === "width" ? "W" : "H",
		placeholder: k("Auto"),
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
					label: k("Fill the Parent (100%)"),
					value: "100%",
					checked: i === "fill"
				},
				{
					label: k("Fit the Content"),
					value: "fit-content",
					checked: i === "fit"
				},
				{
					label: k("Auto"),
					value: null,
					checked: i === "auto"
				},
				{
					label: k(t === "width" ? "Window Width (100vw)" : "Window Height (100dvh)"),
					value: t === "width" ? "100vw" : "100dvh",
					checked: i === "viewport"
				}
			]
		}
	};
}
function is({ s: e, media: t }) {
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
	return /* @__PURE__ */ W(so, {
		s: e,
		group: "size",
		title: k("Size"),
		empty: !n,
		children: /* @__PURE__ */ W(Q, {
			s: e,
			fields: [
				rs(e, "width", k("Width")),
				rs(e, "height", k("Height")),
				{
					handle: "limits",
					type: "group",
					component: "blocks-group",
					label: k("Min · Max"),
					columns: 2,
					fields: [
						{
							handle: "minWidth",
							type: "text",
							component: "blocks-value",
							label: k("Min Width"),
							prefix: "W",
							placeholder: k("Min"),
							title: k("Minimum Width"),
							min: 0
						},
						{
							handle: "maxWidth",
							type: "text",
							component: "blocks-value",
							label: k("Max Width"),
							prefix: "W",
							placeholder: k("Max"),
							group: "container",
							title: k("Maximum Width"),
							min: 0,
							keywords: ["none"]
						},
						{
							handle: "minHeight",
							type: "text",
							component: "blocks-value",
							label: k("Min Height"),
							prefix: "H",
							placeholder: k("Min"),
							title: k("Minimum Height"),
							min: 0
						},
						{
							handle: "maxHeight",
							type: "text",
							component: "blocks-value",
							label: k("Max Height"),
							prefix: "H",
							placeholder: k("Max"),
							title: k("Maximum Height"),
							min: 0,
							keywords: ["none"]
						}
					]
				},
				{
					handle: "aspectRatio",
					type: "select",
					size: "sm",
					label: k("Aspect"),
					placeholder: k("Auto"),
					get: () => {
						let t = e.value("aspectRatio");
						return t && e.engine ? e.engine.resolve(t).replace(/\s+/g, "") : t;
					},
					options: [
						{
							value: "1/1",
							label: k("1:1 square")
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
							label: k("3:4 portrait")
						},
						{
							value: "4/5",
							label: "4:5"
						},
						{
							value: "9/16",
							label: k("9:16 story")
						}
					]
				},
				{
					handle: "overflow",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: k("Overflow"),
					placeholder: "visible",
					options: [
						{
							value: "visible",
							icon: "eye",
							title: k("Visible")
						},
						{
							value: "hidden",
							icon: "eye-off",
							title: k("Hidden")
						},
						{
							value: "auto",
							icon: "mouse-scroll",
							title: k("Scroll When Needed")
						},
						{
							value: "clip",
							icon: "scissors",
							title: k("Clip, without scrolling")
						}
					]
				},
				t && {
					handle: "objectFit",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: k("Fit||image"),
					options: [
						{
							value: "cover",
							label: k("Cover")
						},
						{
							value: "contain",
							label: k("Contain")
						},
						{
							value: "fill",
							label: k("Stretch")
						},
						{
							value: "none",
							label: k("None")
						}
					]
				},
				t && {
					handle: "objectPosition",
					type: "json",
					component: "blocks-origin",
					label: k("Focus"),
					className: "items-start py-0.5 [&>label]:leading-6"
				}
			]
		})
	});
}
// admin/src/builder/design/Spacing.tsx
var as = [
	"Top",
	"Right",
	"Bottom",
	"Left"
];
function os(e, t, n) {
	return [
		`${t}${as[n]}`,
		n % 2 == 0 ? `${t}Block` : `${t}Inline`,
		t
	].find((t) => e.value(t) !== void 0) ?? null;
}
function ss(e, t, n) {
	let r = os(e, t, n);
	if (!r) return;
	let i = e.value(r);
	if (r === t) return Fa(i)?.[n];
	if (r.endsWith("Block") || r.endsWith("Inline")) {
		let [e, t] = Na(String(i));
		return n === 0 || n === 3 ? e : t ?? e;
	}
	return i;
}
var cs = (e) => [
	e,
	`${e}Block`,
	`${e}Inline`,
	...as.map((t) => `${e}${t}`)
];
function ls({ s: e }) {
	let t = ["margin", "padding"], n = t.some((t) => as.some((n, r) => ss(e, t, r))), r = Object.fromEntries(t.map((t) => [t, [
		0,
		1,
		2,
		3
	].map((n) => ss(e, t, n))])), i = Object.fromEntries(t.map((t) => [t, [
		0,
		1,
		2,
		3
	].map((n) => {
		let r = os(e, t, n);
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
		}), as.forEach((e, o) => r[`${t}${e}`] = i || a ? null : n[o] ?? null), e.write(r);
	};
	return /* @__PURE__ */ W(ci, {
		title: k("Spacing"),
		empty: !n,
		children: /* @__PURE__ */ W(Q, {
			s: e,
			bare: !0,
			fields: [{
				handle: "spacing",
				type: "json",
				component: "blocks-spacing",
				className: "items-start",
				label: k("Spacing"),
				sideStatus: i,
				keys: [...cs("margin"), ...cs("padding")],
				get: () => r,
				set: (e) => t.forEach((t) => e[t] !== r[t] && a(t, e[t]))
			}]
		})
	});
}
// admin/src/builder/specimen.tsx
function us(e, t) {
	let [n] = F(() => typeof CSSStyleSheet < "u" ? new CSSStyleSheet() : null), [r, i] = F(!1), a = t.join(" ");
	return N(() => {
		if (n && e) try {
			n.replaceSync(e.build(t)), i(!0);
		} catch (e) {
			console.error(e);
		}
	}, [
		n,
		e,
		a
	]), r ? n : null;
}
function ds({ sheet: e, node: t, page: n, mode: r, className: i, align: a = "start" }) {
	let o = P(null);
	return he(() => {
		let i = o.current;
		if (!i) return;
		let s = i.shadowRoot ?? i.attachShadow({ mode: "open" });
		s.adoptedStyleSheets = e ? [e] : [];
		let c = document.createElement("div");
		c.className = n, c.setAttribute("data-size", "md"), c.setAttribute("data-theme", r), c.style.cssText = `color-scheme:${r};background:var(--color-background);color:var(--color-foreground);padding:0 10px;box-sizing:border-box;display:flex;align-items:center;justify-content:${a === "center" ? "center" : "flex-start"};height:100%;overflow:hidden;min-height:0;margin:0`;
		let l = document.createElement("div");
		if (l.style.cssText = `transform-origin:${a === "center" ? "center" : "left"} center;flex:none;max-width:none;${t.markup ? "width:min(100%,22rem)" : "white-space:nowrap"}`, t.markup) l.innerHTML = t.markup;
		else {
			let e = document.createElement(t.tag);
			e.textContent = t.text, t.className && (e.className = t.className);
			for (let [n, r] of Object.entries(t.attributes ?? {})) e.setAttribute(n, r);
			e.style.margin = "0", l.appendChild(e);
		}
		c.appendChild(l), s.replaceChildren(c);
		let u = () => {
			l.style.transform = "";
			let e = i.getBoundingClientRect(), t = l.getBoundingClientRect(), n = Math.min(1, (e.width - 20) / Math.max(1, t.width, l.scrollWidth), e.height / Math.max(1, t.height, l.scrollHeight));
			n < 1 && (l.style.transform = `scale(${n})`);
		};
		u();
		let d = new ResizeObserver(u);
		return d.observe(i), document.fonts?.ready.then(u), () => d.disconnect();
	}, [
		e,
		t.tag,
		t.text,
		t.className,
		t.markup,
		JSON.stringify(t.attributes),
		n,
		r,
		a
	]), /* @__PURE__ */ W("div", {
		ref: o,
		"aria-hidden": "true",
		className: V("min-w-0 overflow-hidden", i)
	});
}
var fs = (e) => e.replace(/^(btn|scheme)-/, "").split("-").filter(Boolean).map((e) => e.charAt(0).toUpperCase() + e.slice(1)).join(" ");
function ps(e) {
	return e.startsWith("btn-") ? {
		tag: "span",
		text: fs(e),
		className: `cms-button ${e}`
	} : e.startsWith("scheme-") ? {
		tag: "span",
		text: fs(e),
		className: `${e} inline-block rounded-md px-4 py-2`
	} : {
		tag: "span",
		text: fs(e),
		className: e
	};
}
// admin/src/builder/design/Classes.tsx
var ms = (e) => e.replace(/^!|!$/g, "");
function hs(e, t) {
	let n = (e.declarations(ms(q(t).utility)) ?? []).filter((e) => !e.property.startsWith("--")), r = n.find((e) => /(^|-)color$|^fill$|^stroke$/.test(e.property) && !/^(inherit|currentcolor|transparent)$/i.test(e.value));
	return {
		text: n.slice(0, 2).map((t) => `${t.property}: ${e.resolve(t.value)}`).join("; "),
		color: r && Gi(e.resolve(r.value)).light
	};
}
var gs = 8;
function _s({ engine: e, site: t, exclude: n, onAdd: r, onBackspace: i, onEmpty: a, initial: o, onDone: s, label: c }) {
	let [l, u] = F(o ?? ""), [d, f] = F(0), [p, m] = F(!!o), h = ge(() => new Set(n), [n]), g = l.trim(), _ = ge(() => e && p && g && !/\s/.test(g) ? Hi(e, t, g, h).slice(0, gs) : [], [
		e,
		p,
		g,
		t,
		h
	]), [v, y] = F(!1), b = (t) => {
		let n = t.filter((t) => Li(t) && !Ri(e, t));
		n.length && r(n), u(""), f(0), s?.();
	}, x = (e) => {
		if ((e.key === "ArrowDown" || e.key === "ArrowUp") && _.length) e.preventDefault(), f((t) => (t + (e.key === "ArrowDown" ? 1 : -1) + _.length) % _.length);
		else if (e.key === "Enter" || e.key === "Tab" && _.length && g || e.key === " " && g) {
			if (!g) {
				e.key === "Enter" && a && (e.preventDefault(), a());
				return;
			}
			e.preventDefault(), b(/\s/.test(g) ? qe(g) : [_[d] ?? g]);
		} else e.key === "Escape" ? (e.preventDefault(), u(""), s?.()) : e.key === "Backspace" && l === "" && i && (e.preventDefault(), i());
	}, S = ge(() => `cms-classes-${Math.random().toString(36).slice(2)}`, []);
	return /* @__PURE__ */ G("div", {
		className: "min-w-20 flex-1",
		children: [/* @__PURE__ */ W("input", {
			autoFocus: !!o,
			value: l,
			disabled: !e,
			spellCheck: !1,
			autoCapitalize: "off",
			autoCorrect: "off",
			autoComplete: "off",
			role: "combobox",
			"aria-label": c,
			"aria-expanded": _.length > 0,
			"aria-controls": S,
			"aria-activedescendant": _.length ? `${S}-${d}` : void 0,
			placeholder: o === void 0 ? k("Add Class") : void 0,
			onChange: (e) => {
				u(e.target.value), f(0);
				let t = e.target.getBoundingClientRect();
				y(window.innerHeight - t.bottom < 300 && t.top > 300);
			},
			onKeyDown: x,
			onFocus: () => m(!0),
			onBlur: () => {
				m(!1), g ? b(qe(g)) : a ? a() : s?.();
			},
			className: "h-6 w-full min-w-0 rounded-xs bg-transparent px-1 font-mono text-xs text-text outline-none placeholder:font-sans placeholder:text-faint"
		}), _.length > 0 && /* @__PURE__ */ W("div", {
			id: S,
			role: "listbox",
			"aria-label": c,
			className: V("absolute inset-x-0 z-raised overflow-hidden rounded-md border border-border-float bg-float p-1 shadow-pop", v ? "bottom-full mb-1" : "top-full mt-1"),
			children: e && _.map((n, r) => {
				let i = hs(e, n);
				return /* @__PURE__ */ G(B, {
					compact: !0,
					id: `${S}-${r}`,
					role: "option",
					"aria-selected": r === d,
					tabIndex: -1,
					onPointerDown: (e) => {
						e.preventDefault(), b([n]);
					},
					onMouseEnter: () => f(r),
					className: V("flex min-h-7 w-full items-center gap-2 rounded-xs px-2 py-1 text-left", r === d && "bg-hover"),
					children: [
						i.color && /* @__PURE__ */ W(hi, {
							color: i.color,
							className: "!size-3.5"
						}),
						/* @__PURE__ */ W("span", {
							className: "shrink-0 font-mono text-xs text-ink",
							children: n
						}),
						/* @__PURE__ */ W("span", {
							className: "min-w-0 flex-1 truncate text-right text-2xs text-faint",
							children: t.includes(n) ? k("Style") : i.text
						})
					]
				}, n);
			})
		})]
	});
}
function vs({ s: e, site: t, disabled: n }) {
	let r = e.engine, [i, a] = F(null), o = (n, i) => {
		if (!r) return;
		let a = i ? e.classes.filter((e) => e !== i) : e.classes;
		for (let o of n) {
			let n = i ? o : Fi(o, e.variants), { variants: s, utility: c } = q(n), l = t.includes(ms(c)) ? null : r.group(c);
			a = l ? r.put(a, s, l, c) : [...a.filter((e) => e !== n), n];
		}
		e.apply(r.sort(a), "classes");
	}, s = (t) => e.apply(e.classes.filter((e) => e !== t), "classes"), [c, l] = F(!1);
	return /* @__PURE__ */ G("div", {
		className: V("cms-input relative flex !h-auto min-h-8 flex-wrap items-center gap-1 !p-1", n && "opacity-60"),
		"data-focus": c || void 0,
		onFocus: () => l(!0),
		onBlur: () => l(!1),
		"data-class-chips": !0,
		children: [e.classes.map((c) => i === c && !n ? /* @__PURE__ */ W(_s, {
			engine: r,
			site: t,
			exclude: e.classes.filter((e) => e !== c),
			initial: c,
			label: k("Class"),
			onAdd: (e) => o(e, c),
			onEmpty: () => {
				s(c), a(null);
			},
			onDone: () => a(null)
		}, c) : /* @__PURE__ */ W("span", {
			className: V("inline-flex h-6 max-w-full items-center rounded-xs bg-active pl-1.5 font-mono text-xs text-ink", n && "pr-1.5", Ri(r, c) && "underline decoration-danger decoration-wavy underline-offset-2"),
			children: n ? /* @__PURE__ */ W("span", {
				className: "truncate",
				children: c
			}) : /* @__PURE__ */ G(U, { children: [/* @__PURE__ */ W(B, {
				compact: !0,
				onClick: () => a(c),
				"aria-label": k("Change {name}", { name: c }),
				className: "min-w-0 truncate rounded-xs text-left",
				children: c
			}), /* @__PURE__ */ W(R, {
				icon: "close",
				size: "xs",
				label: k("Remove {name}", { name: c }),
				onClick: () => s(c),
				className: "!size-5 shrink-0 text-faint hover:text-ink"
			})] })
		}, c)), !n && /* @__PURE__ */ W(_s, {
			engine: r,
			site: t,
			exclude: e.classes,
			label: k("Add Class"),
			onAdd: (e) => o(e),
			onBackspace: () => e.classes.length && s(e.classes[e.classes.length - 1])
		})]
	});
}
// admin/src/builder/design/StyleBar.tsx
var ys = (e) => e.replace(/^!|!$/g, ""), bs = () => [
	{
		value: "",
		label: k("Default")
	},
	{
		value: "hover",
		label: k("Hover")
	},
	{
		value: "active",
		label: k("Pressed")
	},
	{
		value: "focus-visible",
		label: k("Focus")
	}
], xs = () => [
	{
		value: "before",
		label: k("Before")
	},
	{
		value: "after",
		label: k("After")
	},
	{
		value: "placeholder",
		label: k("Placeholder")
	},
	{
		value: "first",
		label: k("First Item")
	},
	{
		value: "last",
		label: k("Last Item")
	},
	{
		value: "odd",
		label: k("Odd Items")
	},
	{
		value: "even",
		label: k("Even Items")
	},
	{
		value: "current",
		label: k("Current Page")
	},
	{
		value: "group-hover",
		label: k("Hover on Group")
	},
	{
		value: "dark",
		label: k("Dark Mode")
	},
	{
		value: "open",
		label: k("When Open")
	}
];
function Ss(e) {
	if (e === "") return k("Default");
	let t = [...bs(), ...xs()].find((t) => t.value === e);
	return t ? t.label : e.startsWith("in-data-") ? k("in {state}", { state: e.slice(8) }) : e.startsWith("data-") ? e.slice(5) : e;
}
function Cs({ classes: e, engine: t, state: n, onState: r, states: i }) {
	let a = Ni(e), o = n.join(":"), s = (e) => r(e ? q(`${e}:x`).variants : []), c = [...(i?.own ?? []).map((e) => `data-${e}`), ...(i?.inherited ?? []).map((e) => `in-data-${e}`)], l = (e) => !t || t.valid(`${e}:flex`), u = async () => {
		let e = await Pe({
			title: k("Custom Variant"),
			fields: [{
				handle: "name",
				type: "text",
				label: k("Variant"),
				placeholder: "aria-expanded, peer-checked",
				mono: !0
			}],
			confirm: k("Edit Variant")
		}), t = String(e?.name ?? "").trim().replace(/:+$/, "");
		if (t) {
			if (/\s/.test(t) || !l(t)) return void H.error(k("Tailwind has no variant “{name}”.", { name: t }));
			s(t);
		}
	}, d = (e, t = Ss(e)) => ({
		label: t,
		checked: o === e,
		hint: e && a.has(e) ? "•" : void 0,
		onSelect: () => s(e)
	}), f = xs().map((e) => e.value).filter(l), p = c.filter(l), m = o !== "";
	return /* @__PURE__ */ W(z, {
		align: "end",
		trigger: /* @__PURE__ */ G(I, {
			variant: "ghost",
			size: "xs",
			"aria-label": k("State: {state}", { state: n.map(Ss).join(" · ") || k("Default") }),
			className: V("shrink-0 !gap-1 !px-1.5", m ? "!bg-focus-soft !text-ink" : "!font-normal !text-muted hover:!text-ink"),
			children: [
				m && /* @__PURE__ */ W("span", {
					className: "size-1.5 shrink-0 rounded-full bg-focus",
					"aria-hidden": !0
				}),
				/* @__PURE__ */ W("span", {
					className: "max-w-28 truncate",
					children: m ? n.map(Ss).join(" · ") : k("Default")
				}),
				/* @__PURE__ */ W(L, {
					name: "chevron-down",
					size: 10,
					className: "shrink-0 text-faint"
				})
			]
		}),
		items: [
			...bs().map((e) => d(e.value, e.label)),
			{
				separator: !0,
				label: ""
			},
			...f.map((e) => d(e)),
			...p.length ? [
				{
					separator: !0,
					label: ""
				},
				{
					label: k("States of This Element"),
					heading: !0
				},
				...p.map((e) => d(e))
			] : [],
			...o && !bs().some((e) => e.value === o) && !f.includes(o) && !p.includes(o) ? [d(o)] : [],
			{
				separator: !0,
				label: ""
			},
			{
				label: k("Custom Variant…"),
				onSelect: () => void u()
			}
		]
	});
}
var ws = (e) => String(e ?? "").trim().toLowerCase().replace(/[\s_]+/g, "-");
async function Ts(e, t, n, r, i = "") {
	let a = ws((await Pe({
		title: n,
		fields: [{
			handle: "name",
			type: "text",
			label: k("Name"),
			placeholder: "card",
			mono: !0,
			required: !0,
			autofocus: !0
		}],
		values: { name: i },
		confirm: r
	}))?.name);
	return !a || a === i ? null : /^[a-z][a-z0-9-]*$/.test(a) ? t.includes(a) || e?.valid(a) ? (H.error(k("There is already a style “{name}”.", { name: a })), null) : a : (H.error(k("A name is lowercase letters, numbers and hyphens, and starts with a letter.")), null);
}
function Es(e, t) {
	let n = (t) => Gi(e ? e.resolve(t) : t).light;
	return {
		background: n(t.background),
		text: n(t.text)
	};
}
function Ds({ name: e, schemes: t, engine: n }) {
	let r = t.get(e);
	return r ? /* @__PURE__ */ W(Co, {
		size: "mark",
		...Es(n, r)
	}) : /* @__PURE__ */ W("span", {
		className: "grid h-4 w-5 shrink-0 place-items-center text-faint",
		children: /* @__PURE__ */ W(L, {
			name: e.startsWith("btn-") ? "button" : "symbol",
			size: 12
		})
	});
}
function Os({ site: e, worn: t, source: n, engine: r, schemes: i, onWear: a, footer: o, trigger: s }) {
	let [c, l] = F(!1), [u, d] = F(""), [f, p] = F(0), m = P(null), h = me(), [g, _] = F(null);
	N(() => {
		if (!c || !n || g) return;
		let e = !0;
		return Ot(n).then((t) => e && _(t), () => {}), () => {
			e = !1;
		};
	}, [
		c,
		n,
		g
	]);
	let v = ge(() => n ? new yt(n.css).elements().find((e) => e.name === "body")?.classes.join(" ") ?? "" : "", [n]), y = us(c ? g : null, [...v.split(/\s+/).filter(Boolean), ...e]), b = u.trim().toLowerCase(), x = (e) => !t.includes(e) && (!b || e.includes(b) || fs(e).toLowerCase().includes(b)), S = [
		[k("Styles"), e.filter((e) => !e.startsWith("scheme-") && !e.startsWith("btn-"))],
		[k("Buttons"), e.filter((e) => e.startsWith("btn-"))],
		[k("Schemes"), e.filter((e) => e.startsWith(bo))]
	].map(([e, t]) => [e, t.filter(x)]).filter(([, e]) => e.length > 0), C = S.flatMap(([, e]) => e), w = C[Math.min(f, C.length - 1)], T = () => {
		l(!1), d(""), p(0);
	}, E = (e) => {
		a(e), T();
	}, D = (e) => {
		p(e), m.current?.querySelector(`[data-index="${e}"]`)?.scrollIntoView({ block: "nearest" });
	};
	return /* @__PURE__ */ G(we, {
		open: c,
		onOpenChange: (e) => e ? l(!0) : T(),
		align: "start",
		className: "flex w-72 flex-col overflow-hidden !p-0",
		trigger: s,
		children: [
			/* @__PURE__ */ W("div", {
				className: "border-b border-border p-1.5",
				children: /* @__PURE__ */ W("input", {
					autoFocus: !0,
					value: u,
					role: "combobox",
					"aria-label": k("Search Styles"),
					"aria-expanded": !0,
					"aria-controls": h,
					placeholder: k("Search Styles"),
					spellCheck: !1,
					onChange: (e) => {
						d(e.target.value), p(0);
					},
					onKeyDown: (e) => {
						(e.key === "ArrowDown" || e.key === "ArrowUp") && C.length ? (e.preventDefault(), D((Math.min(f, C.length - 1) + (e.key === "ArrowDown" ? 1 : -1) + C.length) % C.length)) : e.key === "Enter" && w && (e.preventDefault(), E(w));
					},
					className: "cms-input h-8 w-full rounded-sm px-2 text-sm placeholder:text-ghost"
				})
			}),
			/* @__PURE__ */ G("div", {
				ref: m,
				id: h,
				role: "listbox",
				"aria-label": k("Styles"),
				className: "max-h-64 overflow-y-auto overscroll-contain p-1",
				children: [C.length === 0 && /* @__PURE__ */ W(xe, { className: "py-6" }), S.map(([e, t]) => /* @__PURE__ */ G("div", {
					role: "group",
					"aria-label": e,
					children: [/* @__PURE__ */ W("div", {
						className: "cms-label flex h-7 items-center px-2",
						children: e
					}), t.map((e) => {
						let t = C.indexOf(e);
						return /* @__PURE__ */ G(B, {
							compact: !0,
							role: "option",
							"data-index": t,
							"aria-selected": e === w,
							onClick: () => E(e),
							onPointerMove: () => t !== f && p(t),
							className: V("flex h-8 w-full items-center gap-2.5 rounded-sm px-2 text-left", e === w && "bg-hover"),
							children: [
								/* @__PURE__ */ W(Ds, {
									name: e,
									schemes: i,
									engine: r
								}),
								/* @__PURE__ */ W("span", {
									className: "min-w-0 flex-1 truncate text-xs text-ink",
									children: fs(e)
								}),
								/* @__PURE__ */ W("span", {
									className: "max-w-24 shrink-0 truncate font-mono text-2xs text-faint",
									children: e
								})
							]
						}, e);
					})]
				}, e))]
			}),
			w && /* @__PURE__ */ W("div", {
				className: "border-t border-border p-1.5",
				children: /* @__PURE__ */ W(ds, {
					sheet: y,
					node: ps(w),
					page: v,
					mode: "light",
					align: "center",
					className: "h-16 rounded-sm"
				})
			}),
			o && /* @__PURE__ */ W("div", {
				className: "border-t border-border p-1",
				children: o(T)
			})
		]
	});
}
var ks = "cms.inspector.classes";
function As() {
	let [e, t] = F(() => {
		try {
			return localStorage.getItem(ks) === "1";
		} catch {
			return !1;
		}
	});
	return [e, (e) => {
		t(e);
		try {
			localStorage.setItem(ks, e ? "1" : "0");
		} catch {}
	}];
}
function js({ s: e, site: t, source: n, state: r, disabled: i, lead: a, actions: o }) {
	let s = e.engine, [c, l] = As(), u = Ii(s, e.classes, t), d = u.site.filter((e) => t.includes(ys(q(e).utility))), f = d.map((e) => ys(q(e).utility)), p = ee("settings.manage") && !!n && !!s && !i, m = e.screen.sizes, h = (e) => q(e).variants.some((e) => !!Y(e, m)), g = u.utilities.filter((e) => !h(e)), _ = ge(() => new Map((n ? xo(new yt(n.css)) : []).map((e) => [e.name, e])), [n]), v = (t) => s && e.apply(s.sort([...e.classes.filter((e) => e !== t), t]), "classes"), y = async () => {
		if (!s || !n) return;
		let r = await Ts(s, t, k("Save as Style"), k("Save Style"));
		if (r) try {
			await O("styling/update", { css: new yt(n.css).setUtility(r, s.sort(g)).css }), ne("styling/"), e.apply([
				...u.site,
				r,
				...u.utilities.filter(h)
			], "classes"), H.success(k("Style “{name}” saved", { name: r }));
		} catch (e) {
			H.error(e);
		}
	}, b = (t) => {
		if (!s || !n) return;
		let { variants: r, utility: i } = q(t), a = (new yt(n.css).utilities().find((e) => e.name === ys(i))?.classes ?? []).map((e) => Ke(r, e));
		e.apply(s.sort([.../* @__PURE__ */ new Set([...e.classes.filter((e) => e !== t), ...a])]), "classes");
	}, x = !i && !!s && (t.length > 0 || p), S = (e) => /* @__PURE__ */ W(Os, {
		site: t,
		worn: f,
		source: n,
		engine: s,
		schemes: _,
		onWear: v,
		trigger: e,
		footer: p ? (e) => /* @__PURE__ */ W(I, {
			variant: "ghost",
			size: "sm",
			icon: "symbol",
			disabled: g.length === 0,
			onClick: () => {
				e(), y();
			},
			className: "w-full !justify-start !px-2 !font-normal",
			children: k("Save as Style…")
		}) : void 0
	});
	return /* @__PURE__ */ G("div", {
		className: "space-y-2 border-b border-border py-2 pl-4 pr-3",
		"data-style-bar": !0,
		children: [/* @__PURE__ */ G("div", {
			className: "flex items-center gap-1",
			children: [
				a ?? (!x && d.length === 0 ? /* @__PURE__ */ W("span", { className: "flex-1" }) : /* @__PURE__ */ G("div", {
					className: "flex min-h-8 min-w-0 flex-1 flex-wrap items-center gap-1 rounded-sm bg-bg p-1 shadow-edge",
					children: [d.map((t) => {
						let r = ys(q(t).utility);
						return /* @__PURE__ */ W(z, {
							align: "start",
							trigger: /* @__PURE__ */ G(I, {
								variant: "ghost",
								size: "xs",
								disabled: i,
								className: "max-w-full !gap-1.5 !rounded-xs !bg-active !pl-1 !pr-1.5 !font-normal !text-ink",
								children: [/* @__PURE__ */ W(Ds, {
									name: r,
									schemes: _,
									engine: s
								}), /* @__PURE__ */ W("span", {
									className: "truncate",
									children: t === r ? fs(r) : t
								})]
							}),
							items: [
								p && {
									label: k("Edit Style"),
									icon: "edit",
									onSelect: () => re(r.startsWith("scheme-") ? "/styling?tab=colors" : `/styling?tab=styles&style=${encodeURIComponent(r)}`)
								},
								!!n && {
									label: k("Detach Style"),
									icon: "unlink",
									onSelect: () => b(t)
								},
								{
									label: k("Remove Style"),
									icon: "trash",
									danger: !0,
									onSelect: () => e.apply(e.classes.filter((e) => e !== t), "classes")
								}
							]
						}, t);
					}), x && (d.length === 0 ? S(/* @__PURE__ */ G(B, {
						compact: !0,
						className: "flex h-6 min-w-0 flex-1 items-center gap-1.5 rounded-xs px-1.5 text-left text-xs text-faint hover:text-ink",
						children: [/* @__PURE__ */ W(L, {
							name: "plus",
							size: 12
						}), k("Add Style")]
					})) : S(/* @__PURE__ */ W(R, {
						icon: "plus",
						size: "xs",
						label: k("Add Style"),
						className: "ml-auto"
					})))]
				})),
				/* @__PURE__ */ W(ke, {
					content: k("Classes"),
					children: /* @__PURE__ */ W(R, {
						icon: "code",
						size: "sm",
						label: k("Classes"),
						title: void 0,
						active: c,
						onClick: () => l(!c),
						className: "shrink-0"
					})
				}),
				/* @__PURE__ */ W(Cs, { ...r }),
				o
			]
		}), c && /* @__PURE__ */ G("div", {
			className: "flex items-start gap-1",
			children: [/* @__PURE__ */ W("div", {
				className: "min-w-0 flex-1",
				children: /* @__PURE__ */ W(vs, {
					s: e,
					site: t,
					disabled: i
				})
			}), /* @__PURE__ */ W(ke, {
				content: k("Copy Classes"),
				children: /* @__PURE__ */ W(R, {
					icon: "copy",
					size: "sm",
					label: k("Copy Classes"),
					title: void 0,
					disabled: e.classes.length === 0,
					onClick: () => void Ae(e.classes.join(" "), { copied: k("Classes copied") }),
					className: "shrink-0"
				})
			})]
		})]
	});
}
// admin/src/builder/design/Transform.tsx
var Ms = (e) => !e || /^-?0(px|deg|%)?$/.test(e);
function Ns({ s: e }) {
	let t = {
		x: e.value("--tw-translate-x"),
		y: e.value("--tw-translate-y")
	}, n = {
		X: Ci(e.value("--tw-skew-x")),
		Y: Ci(e.value("--tw-skew-y"))
	}, r = e.value("--tw-scale-x"), i = r?.endsWith("%") ? String(parseFloat(r) / 100) : r, a = [
		t.x,
		t.y,
		n.X,
		n.Y,
		i,
		e.value("rotate"),
		e.value("transformOrigin"),
		e.value("perspective")
	].some(Boolean), o = (t, n, r, i) => e.swap(t, e.engine && !Ms(r) ? Ei(e.engine, n, r, i) : null), s = (e) => [{
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
	return /* @__PURE__ */ W(so, {
		s: e,
		group: "transform",
		title: k("Transform"),
		open: !!a,
		empty: !a,
		children: /* @__PURE__ */ W(Q, {
			s: e,
			fields: [
				{
					handle: "move",
					type: "group",
					component: "blocks-group",
					label: k("Move"),
					markers: ["--tw-translate-x", "--tw-translate-y"],
					fields: s("px"),
					get: () => t,
					set: (e) => Object.entries(Ra(t, e)).forEach(([e, t]) => o(`--tw-translate-${e}`, `translate-${e}`, t, "spacing"))
				},
				{
					handle: "rotate",
					type: "text",
					component: "blocks-value",
					label: k("Rotate"),
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
					label: k("Scale"),
					unit: "",
					step: .01,
					prefixIcon: "arrows-out-simple",
					placeholder: "1",
					markers: ["scale"],
					get: () => i,
					set: (t) => e.swap("scale", e.engine && t && Number(t) !== 1 ? Ei(e.engine, "scale", t, "percent") : null)
				},
				{
					handle: "skew",
					type: "group",
					component: "blocks-group",
					label: k("Skew"),
					markers: ["--tw-skew-x", "--tw-skew-y"],
					fields: s("deg").map((e) => ({
						...e,
						handle: e.handle.toUpperCase()
					})),
					get: () => n,
					set: (e) => Object.entries(Ra(n, e)).forEach(([e, t]) => o(`--tw-skew-${e.toLowerCase()}`, `skew-${e.toLowerCase()}`, t, "deg"))
				},
				{
					handle: "transformOrigin",
					type: "json",
					component: "blocks-origin",
					label: k("Origin"),
					className: "items-start py-0.5 [&>label]:leading-6"
				},
				{
					handle: "perspective",
					type: "text",
					component: "blocks-value",
					label: k("Perspective"),
					prefixIcon: "perspective",
					placeholder: "none",
					keywords: ["none"]
				}
			]
		})
	});
}
// admin/src/builder/design/Transition.tsx
var Ps = () => [
	{
		value: "transition",
		label: k("Colors, Opacity, Shadow and Transform")
	},
	{
		value: "transition-all",
		label: k("Everything")
	},
	{
		value: "transition-colors",
		label: k("Colors")
	},
	{
		value: "transition-transform",
		label: k("Transform")
	},
	{
		value: "transition-opacity",
		label: k("Opacity")
	},
	{
		value: "transition-shadow",
		label: k("Shadow")
	}
], Fs = [
	"transition-property",
	"--tw-duration",
	"--tw-ease",
	"transition-delay"
];
function Is({ s: e }) {
	let t = Lt(), n = e.value("transitionProperty"), r = Ps(), i = n === void 0 ? void 0 : r.find((t) => e.engine?.value(t.value, "transition-property") === n)?.value, a = (t, n, r) => e.swap(t, r && e.engine ? Ei(e.engine, n, r, "ms") : null);
	return /* @__PURE__ */ W(so, {
		s: e,
		group: "transition",
		title: k("Transition"),
		open: !!n,
		empty: !n,
		children: n ? /* @__PURE__ */ W(Q, {
			s: e,
			fields: [
				{
					handle: "property",
					type: "select",
					size: "sm",
					label: k("Animate"),
					options: r,
					markers: ["transition-property"],
					reset: () => e.swap(Fs, null),
					get: () => i,
					set: (t) => e.swap(t ? "transition-property" : Fs, t || null)
				},
				{
					handle: "timing",
					type: "group",
					component: "blocks-group",
					label: k("Duration"),
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
						label: k("Duration"),
						unit: "ms",
						step: 10,
						min: 0,
						prefixIcon: "timer",
						placeholder: "150"
					}, {
						handle: "delay",
						type: "text",
						component: "blocks-value",
						label: k("Delay"),
						unit: "ms",
						step: 10,
						min: 0,
						prefixIcon: "pause",
						placeholder: k("Delay")
					}]
				},
				{
					handle: "ease",
					type: "text",
					component: "ease",
					label: k("Curve"),
					markers: ["--tw-ease"],
					get: () => e.value("--tw-ease"),
					set: (t) => e.swap("--tw-ease", t && e.engine ? Ei(e.engine, "ease", t, "number") : null),
					options: [
						...t.of("ease").map((e) => ({
							value: e.ref,
							label: e.name,
							curve: e.value
						})),
						{
							value: "linear",
							label: k("Linear")
						},
						{
							value: "cubic-bezier(0.2, 0.8, 0.2, 1)",
							label: k("Smooth Out")
						},
						{
							value: "cubic-bezier(0.65, 0, 0.35, 1)",
							label: k("Smooth In-Out")
						},
						{
							value: "cubic-bezier(0.34, 1.56, 0.64, 1)",
							label: k("Overshoot")
						}
					]
				}
			]
		}) : /* @__PURE__ */ W(I, {
			variant: "ghost",
			icon: "plus",
			disabled: !e.engine,
			onClick: () => e.swap("transition-property", "transition"),
			className: "w-full !text-xs !font-normal !text-muted hover:!text-ink",
			children: k("Animate State Changes")
		})
	});
}
// admin/src/builder/design/Typography.tsx
var Ls = () => ({
	100: k("Thin 100"),
	200: k("Extra Light 200"),
	300: k("Light 300"),
	400: k("Regular 400"),
	500: k("Medium 500"),
	600: k("Semibold 600"),
	700: k("Bold 700"),
	800: k("Extra Bold 800"),
	900: k("Black 900")
}), Rs = "-webkit-text-stroke";
function zs({ s: e, prose: t }) {
	let n = Lt(), r = Ls(), i = [
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
		Rs
	].some((t) => e.value(t)), a = Na(e.value(Rs) ?? ""), o = {
		width: a.find((e) => /^-?[\d.]/.test(e)),
		color: a.find((e) => !/^-?[\d.]/.test(e))
	}, s = e.value("textOverflow") === "ellipsis" && e.value("whiteSpace") === "nowrap";
	return /* @__PURE__ */ G(so, {
		s: e,
		group: "typography",
		title: k("Typography"),
		empty: !i && !t?.on,
		children: [
			t && /* @__PURE__ */ W(Z, {
				fields: [{
					handle: "prose",
					type: "toggle",
					label: k("Prose")
				}],
				values: { prose: t.on },
				onChange: (e, n) => t.onChange(!!n)
			}),
			/* @__PURE__ */ W(Q, {
				s: e,
				fields: [
					{
						handle: "fontFamily",
						type: "select",
						size: "sm",
						label: k("Font"),
						placeholder: k("Inherit"),
						options: n.of("font").map((e) => ({
							value: e.ref,
							label: `${e.name} · ${e.value.split(",")[0].replace(/["']/g, "")}`
						}))
					},
					{
						handle: "fontWeight",
						type: "select",
						size: "sm",
						label: k("Weight"),
						placeholder: k("Inherit"),
						options: n.of("weight").map((e) => ({
							value: e.ref,
							label: r[e.value] ?? `${e.name} · ${e.value}`
						}))
					},
					{
						handle: "fontSize",
						type: "text",
						component: "blocks-value",
						label: k("Size"),
						group: "text",
						prefixIcon: "richtext",
						placeholder: k("Inherit"),
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
						label: k("Line Height"),
						group: "leading",
						prefixIcon: "height",
						unit: "",
						step: .05,
						placeholder: k("Inherit"),
						title: k("Line Height (1.2 = 120%)")
					},
					{
						handle: "letterSpacing",
						type: "text",
						component: "blocks-value",
						label: k("Letter Spacing"),
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
						label: k("Color"),
						placeholder: k("Inherit")
					},
					{
						handle: "textAlign",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: k("Align"),
						placeholder: "left",
						options: [
							{
								value: "left",
								icon: "align-left",
								title: k("Left")
							},
							{
								value: "center",
								icon: "align-center",
								title: k("Center")
							},
							{
								value: "right",
								icon: "align-right",
								title: k("Right")
							},
							{
								value: "justify",
								icon: "align-justify",
								title: k("Justify||text")
							}
						]
					},
					{
						handle: "fontStyle",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: k("Style"),
						placeholder: "normal",
						options: [{
							value: "normal",
							icon: "text",
							title: k("Upright")
						}, {
							value: "italic",
							icon: "italic",
							title: k("Italic")
						}]
					},
					{
						handle: "textDecorationLine",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: k("Decoration"),
						placeholder: "none",
						options: [
							{
								value: "none",
								icon: "close",
								title: k("No Decoration")
							},
							{
								value: "underline",
								icon: "underline",
								title: k("Underline")
							},
							{
								value: "line-through",
								icon: "strike",
								title: k("Strike Through")
							}
						]
					},
					{
						handle: "textTransform",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: k("Case"),
						placeholder: "none",
						options: [
							{
								value: "none",
								icon: "close",
								title: k("As Typed")
							},
							{
								value: "uppercase",
								label: "AA",
								title: k("Uppercase")
							},
							{
								value: "capitalize",
								label: "Aa",
								title: k("Capitalize")
							},
							{
								value: "lowercase",
								label: "aa",
								title: k("Lowercase")
							}
						]
					},
					{
						handle: "textWrap",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: k("Wrap"),
						options: [
							{
								value: "balance",
								label: k("Balance")
							},
							{
								value: "pretty",
								label: k("Pretty")
							},
							{
								value: "nowrap",
								label: k("None")
							}
						]
					},
					{
						handle: "lineClamp",
						type: "text",
						component: "blocks-value",
						label: k("Max Lines"),
						unit: "",
						min: 1,
						placeholder: k("All"),
						prefixIcon: "list-tree",
						markers: ["-webkit-line-clamp"],
						get: () => e.value("-webkit-line-clamp"),
						set: (t) => e.swap(["-webkit-line-clamp", "text-overflow"], t && e.engine?.valid(`line-clamp-${t}`) ? `line-clamp-${t}` : null)
					},
					{
						handle: "truncate",
						type: "toggle",
						size: "sm",
						label: k("Truncate"),
						get: () => s,
						set: (t) => e.swap(["text-overflow", "-webkit-line-clamp"], t ? "truncate" : null)
					}
				]
			}),
			/* @__PURE__ */ W(Q, {
				s: e,
				bare: !0,
				fields: [{
					handle: "textShadow",
					type: "text",
					component: "blocks-shadows",
					kind: "text",
					label: k("Text Shadow")
				}]
			}),
			/* @__PURE__ */ W(Q, {
				s: e,
				fields: [{
					handle: "stroke",
					type: "group",
					component: "blocks-group",
					label: k("Text Stroke"),
					keys: [Rs],
					get: () => o,
					set: (t) => {
						let n = {
							...o,
							...Ra(o, t)
						};
						e.set(Rs, n.width ? `${n.width} ${n.color ?? "currentColor"}` : null);
					},
					fields: [{
						handle: "width",
						type: "text",
						component: "blocks-value",
						label: k("Width"),
						prefixIcon: "edit",
						placeholder: "0",
						min: 0,
						step: .5,
						className: "!flex-none w-[72px]"
					}, {
						handle: "color",
						type: "color",
						component: "blocks-color",
						label: k("Color"),
						placeholder: k("Text Color")
					}]
				}]
			})
		]
	});
}
// admin/src/builder/design/DesignPanel.tsx
var Bs = [
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
function Vs({ s: e, groups: t = Bs, container: n = !0, parentDisplay: r, media: i, prose: a }) {
	let o = (e) => t.includes(e);
	return /* @__PURE__ */ G(U, { children: [
		o("layout") && n && /* @__PURE__ */ W(es, { s: e }),
		r && /flex|grid/.test(r) && /* @__PURE__ */ W(ts, {
			s: e,
			parentDisplay: r
		}),
		o("position") && /* @__PURE__ */ W(ns, { s: e }),
		o("size") && /* @__PURE__ */ W(is, {
			s: e,
			media: i
		}),
		o("spacing") && /* @__PURE__ */ W(ls, { s: e }),
		o("typography") && /* @__PURE__ */ W(zs, {
			s: e,
			prose: a
		}),
		o("fill") && /* @__PURE__ */ W(Yo, { s: e }),
		o("border") && /* @__PURE__ */ W(Ka, { s: e }),
		o("effects") && /* @__PURE__ */ W(_o, { s: e }),
		o("transform") && /* @__PURE__ */ W(Ns, { s: e }),
		o("transition") && /* @__PURE__ */ W(Is, { s: e }),
		t.length > 1 && /* @__PURE__ */ W(lo, { s: e })
	] });
}
function Hs({ node: e }) {
	let { types: t, store: n, readOnly: r } = a(), i = Ft(), o = t.get(e.type), s = Ma(e), c = K(n, (e) => e.state), l = K(n, (t) => v(t.nodes, e.id)), d = K(n, (t) => u(t.nodes, e.id)), f = ge(() => {
		if (l) return wi(i.engine, qe(l.class), s.screen, [], () => {}).value("display") ?? (l.type === "stack" || l.type === "columns" || l.type === "grid" ? "flex" : void 0);
	}, [
		l,
		i.engine,
		s.screen
	]), p = e.type === "outlet" && !e.props?.wrap, m = p ? ["typography"] : o?.styles?.length ? o.styles : Bs;
	return e.type === "component" ? /* @__PURE__ */ W("p", {
		className: "m-0 p-4 text-xs text-muted",
		children: k("Edit the component to change its shared design.")
	}) : /* @__PURE__ */ G("div", { children: [
		!i.engine && !i.loading && /* @__PURE__ */ W("div", {
			className: "border-b border-border px-4 py-3",
			children: /* @__PURE__ */ W(Se, {
				tone: "warning",
				title: k("The site’s stylesheet could not be read"),
				action: /* @__PURE__ */ W(D, {
					to: "/styling",
					className: "shrink-0 text-xs text-text",
					children: k("Open Styling")
				})
			})
		}),
		/* @__PURE__ */ W("div", {
			className: "sticky top-0 z-raised bg-surface",
			children: /* @__PURE__ */ W(js, {
				s,
				site: i.classes,
				source: i.source,
				disabled: r,
				state: {
					classes: s.classes,
					engine: i.engine,
					state: c,
					onState: n.setStyleState,
					states: Ui(e, d)
				}
			})
		}),
		/* @__PURE__ */ W(Vs, {
			s,
			groups: m,
			container: !!o?.children || e.type === "repeat",
			parentDisplay: p ? void 0 : f,
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
var Us = () => [
	{
		value: "click",
		label: k("Click")
	},
	{
		value: "mouseenter",
		label: k("Pointer Enters")
	},
	{
		value: "mouseleave",
		label: k("Pointer Leaves")
	},
	{
		value: "focus",
		label: k("Gets Focus")
	},
	{
		value: "blur",
		label: k("Loses Focus")
	},
	{
		value: "input",
		label: k("Typing")
	},
	{
		value: "change",
		label: k("Value Changes")
	},
	{
		value: "submit",
		label: k("Form Submit")
	},
	{
		value: "keydown",
		label: k("Key Pressed")
	},
	{
		value: "enter",
		label: k("Scrolls into View")
	},
	{
		value: "leave",
		label: k("Scrolls Out of View")
	},
	{
		value: "scroll",
		label: k("Page Scrolls")
	},
	{
		value: "resize",
		label: k("Window Resizes")
	},
	{
		value: "init",
		label: k("Page Loads")
	}
], Ws = () => [
	{
		value: "prevent",
		label: k("Prevent Default")
	},
	{
		value: "stop",
		label: k("Stop Propagation")
	},
	{
		value: "outside",
		label: k("Outside This Element")
	},
	{
		value: "window",
		label: k("Anywhere on the Page")
	},
	{
		value: "once",
		label: k("Only Once")
	},
	{
		value: "self",
		label: k("On This Element Only")
	},
	{
		value: "debounce",
		label: k("Debounce")
	}
], Gs = () => [
	{
		value: "set",
		label: k("Set State"),
		icon: "edit"
	},
	{
		value: "toggle",
		label: k("Toggle State"),
		icon: "toggle-left"
	},
	{
		value: "add",
		label: k("Add to Number"),
		icon: "plus"
	},
	{
		value: "if",
		label: k("If … Then … Else"),
		icon: "github"
	},
	{
		value: "play",
		label: k("Play Animation"),
		icon: "play"
	},
	{
		value: "scroll",
		label: k("Scroll To"),
		icon: "mouse-scroll"
	},
	{
		value: "fetch",
		label: k("Load Page Part"),
		icon: "external"
	},
	{
		value: "copy",
		label: k("Copy to Clipboard"),
		icon: "copy"
	},
	{
		value: "go",
		label: k("Go to Link"),
		icon: "link-chain"
	},
	{
		value: "theme",
		label: k("Light or Dark Mode"),
		icon: "moon"
	},
	{
		value: "focus",
		label: k("Focus Element"),
		icon: "position"
	},
	{
		value: "lock",
		label: k("Lock Page Scrolling"),
		icon: "lock"
	},
	{
		value: "wait",
		label: k("Wait"),
		icon: "timer"
	},
	{
		value: "dispatch",
		label: k("Send Event"),
		icon: "broadcast"
	},
	{
		value: "run",
		label: k("Expression"),
		icon: "braces"
	}
];
function Ks(e) {
	let { store: t } = a(), n = K(t, (t) => u(t.nodes, e.id));
	return [...new Set([...n, e].flatMap((e) => Object.keys(e.logic?.data ?? {})))];
}
function qs(e) {
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
var Js = (e) => typeof e == "string" ? `'${e}'` : JSON.stringify(e), Ys = (e, t, n = {}) => ({
	handle: e,
	type: "text",
	size: "sm",
	commit: "blur",
	label: t,
	mono: !0,
	max: 1e4,
	list: Xs,
	placeholder: "open, count > 3, tab === 'a'",
	...n
}), Xs = "cms-logic-variables", Zs = (e, ...t) => e ? t : [], Qs = [
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
function $s({ label: e, options: t, value: n, onChange: r }) {
	return /* @__PURE__ */ G("div", {
		className: "flex min-h-7 items-center gap-2",
		children: [/* @__PURE__ */ W(di, { field: {
			handle: e,
			type: "select",
			label: e
		} }), /* @__PURE__ */ W("span", {
			className: "cms-input flex h-7 min-w-0 flex-1 rounded-sm",
			children: /* @__PURE__ */ W(z, {
				align: "end",
				trigger: /* @__PURE__ */ G(I, {
					variant: "ghost",
					"aria-label": e,
					className: "!h-full min-w-0 flex-1 shrink !justify-start !gap-1.5 !bg-transparent !pl-2 !pr-1.5 text-left !font-normal",
					children: [/* @__PURE__ */ W("span", {
						className: V("min-w-0 flex-1 truncate", !n.length && "text-ghost"),
						children: n.length ? n.join(", ") : k("None")
					}), /* @__PURE__ */ W(L, {
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
					label: k("None"),
					disabled: !0
				}]
			})
		})]
	});
}
var ec = { strip: "[^A-Za-z0-9_-]" }, tc = (e) => e.replace(/^[^A-Za-z_]+/, "").slice(0, 41);
function nc({ node: e }) {
	let { store: t } = a(), n = A("styling-code/list", {}, { staleTime: 3e4 }), r = e.behavior, i = e.code ?? {}, o = (e, ...t) => [.../* @__PURE__ */ new Set([...n.data?.[e] ?? [], ...t.filter((e) => !!e)])], s = (n) => t.updateNode(e.id, { behavior: n && (n.module ?? r?.module) ? {
		...r,
		...n
	} : void 0 }, `behavior:${e.id}`), c = (n, r) => {
		let a = {
			...i,
			[n]: r.length ? r : void 0
		};
		t.updateNode(e.id, { code: a.scripts || a.styles ? a : void 0 });
	}, l = r?.props ?? {};
	return /* @__PURE__ */ G("div", {
		className: V("-mx-1.5 space-y-1 rounded-sm px-1.5 py-1", r && "bg-sunken/60"),
		children: [
			/* @__PURE__ */ W(Z, {
				fields: [{
					handle: "module",
					type: "select",
					size: "sm",
					label: k("Script"),
					placeholder: k("None"),
					options: o("scripts", r?.module),
					status: r ? "own" : void 0,
					reset: () => s(null)
				}, ...Zs(r, {
					handle: "when",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: k("Runs"),
					required: !0,
					options: [
						{
							value: "load",
							label: k("On Load")
						},
						{
							value: "visible",
							label: k("In View")
						},
						{
							value: "idle",
							label: k("When Idle")
						}
					]
				})],
				values: {
					module: r?.module,
					when: r?.when ?? "load"
				},
				onChange: (e, t) => s(e === "module" ? t ? { module: String(t) } : null : { when: t === "visible" || t === "idle" ? t : void 0 })
			}),
			r && /* @__PURE__ */ G(U, { children: [/* @__PURE__ */ W(ui, {
				title: k("Options"),
				action: /* @__PURE__ */ W(_i, {
					label: k("Add Option"),
					onClick: () => {
						let e = "value", t = 2;
						for (; e in l;) e = `value${t++}`;
						s({ props: {
							...l,
							[e]: ""
						} });
					}
				})
			}), /* @__PURE__ */ W(Z, {
				bare: !0,
				fields: [{
					handle: "props",
					type: "json",
					component: "blocks-pairs",
					className: "items-start",
					label: k("Options"),
					key: ec,
					join: "=",
					item: {
						handle: "value",
						type: "text",
						size: "sm",
						commit: "blur",
						label: k("Value"),
						mono: !0
					}
				}],
				values: { props: Object.fromEntries(Object.entries(l).map(([e, t]) => [e, Js(t)])) },
				onChange: (e, t) => {
					let n = Object.fromEntries(Object.entries(t).map(([e, t]) => [tc(e), e in l && Js(l[e]) === t ? l[e] : qs(t ?? "")]).filter(([e]) => e !== ""));
					s({ props: Object.keys(n).length ? n : void 0 });
				}
			})] }),
			/* @__PURE__ */ W($s, {
				label: k("Load Scripts"),
				options: o("scripts", ...i.scripts ?? []),
				value: i.scripts ?? [],
				onChange: (e) => c("scripts", e)
			}),
			/* @__PURE__ */ W($s, {
				label: k("Load Styles"),
				options: o("styles", ...i.styles ?? []),
				value: i.styles ?? [],
				onChange: (e) => c("styles", e)
			})
		]
	});
}
function rc({ node: e }) {
	let { store: t, types: n } = a(), r = e.logic ?? {}, i = Ks(e), o = (n) => {
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
	].includes(e.type) || (n.get(e.type)?.html ?? "") === "a", l = r.behaviors ?? {}, u = ee("site.code") && (!!e.behavior || !!e.code);
	return /* @__PURE__ */ G(U, { children: [
		/* @__PURE__ */ W("datalist", {
			id: Xs,
			children: [...i, ...i.map((e) => `!${e}`)].map((e) => /* @__PURE__ */ W("option", { value: e }, e))
		}),
		/* @__PURE__ */ W(ci, {
			title: k("State"),
			empty: !r.data,
			open: !!r.data,
			actions: /* @__PURE__ */ W(_i, {
				label: k("Add Variable"),
				onClick: () => {
					let e = "open", t = 1;
					for (; e in s;) e = `value${t++}`;
					o({ data: {
						...s,
						[e]: e !== "open" && ""
					} });
				}
			}),
			children: /* @__PURE__ */ W(Z, {
				bare: !0,
				fields: [{
					handle: "data",
					type: "json",
					component: "blocks-pairs",
					className: "items-start",
					label: k("Variables"),
					key: { strip: "[^a-zA-Z0-9_]" },
					join: "=",
					item: {
						handle: "value",
						type: "text",
						size: "sm",
						commit: "blur",
						label: k("Value"),
						mono: !0
					}
				}],
				values: { data: Object.fromEntries(Object.entries(s).map(([e, t]) => [e, Js(t)])) },
				onChange: (e, t) => o({ data: Object.fromEntries(Object.entries(t).map(([e, t]) => [e, e in s && Js(s[e]) === t ? s[e] : qs(t ?? "")])) })
			})
		}),
		/* @__PURE__ */ G(ci, {
			title: k("Events"),
			empty: !r.on?.length && !r.init?.length,
			open: !!r.on?.length || !!r.init?.length,
			actions: /* @__PURE__ */ W(_i, {
				label: k("Add Event"),
				onClick: () => o({ on: [...r.on ?? [], {
					event: "click",
					actions: []
				}] })
			}),
			children: [
				r.init && /* @__PURE__ */ W(ac, {
					title: k("Page Loads"),
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
					return /* @__PURE__ */ W(ac, {
						title: /* @__PURE__ */ W(Z, {
							bare: !0,
							className: "min-w-0 flex-1",
							fields: [{
								handle: "trigger",
								type: "group",
								component: "blocks-group",
								label: k("Event"),
								fields: [{
									handle: "event",
									type: "select",
									size: "sm",
									label: k("Event"),
									required: !0,
									options: Us().filter((e) => e.value !== "init")
								}, {
									handle: "key",
									type: "text",
									size: "sm",
									commit: "blur",
									label: k("Keyboard Key"),
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
				!r.init && (r.on?.length ?? 0) > 0 && /* @__PURE__ */ W(gi, {
					onClick: () => o({ init: [] }),
					children: k("When the Page Loads")
				})
			]
		}),
		/* @__PURE__ */ G(ci, {
			title: k("Bindings"),
			empty: !r.show && !r.states && !r.text && !r.attrs,
			open: !!(r.show || r.states || r.text || r.attrs),
			children: [
				/* @__PURE__ */ W(Z, {
					fields: [Ys("show", k("Show When"), {
						placeholder: k("Always"),
						status: r.show ? "own" : void 0,
						reset: () => o({
							show: void 0,
							transition: void 0
						})
					}), ...Zs(r.show, {
						handle: "transition",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: k("Transition"),
						options: [
							{
								value: "none",
								label: k("None")
							},
							{
								value: "fade",
								label: k("Fade")
							},
							{
								value: "scale",
								label: k("Scale")
							},
							{
								value: "collapse",
								label: k("Collapse")
							}
						]
					})],
					values: {
						show: r.show,
						transition: r.transition ?? "none"
					},
					onChange: (e, t) => o(e === "show" ? { show: t || void 0 } : { transition: t && t !== "none" ? t : void 0 })
				}),
				/* @__PURE__ */ W(ui, {
					title: k("States"),
					action: /* @__PURE__ */ W(_i, {
						label: k("Add State"),
						onClick: () => o({ states: {
							...r.states ?? {},
							[Object.keys(r.states ?? {}).length ? `state${Object.keys(r.states ?? {}).length + 1}` : "open"]: i[0] ?? "open"
						} })
					})
				}),
				/* @__PURE__ */ W(Z, {
					bare: !0,
					fields: [{
						handle: "states",
						type: "json",
						component: "blocks-pairs",
						className: "items-start",
						label: k("States"),
						key: {
							prefix: "data-",
							lower: !0,
							strip: "[^a-z0-9-]",
							className: "!w-[38%] !flex-none"
						},
						join: k("when"),
						item: Ys("expr", k("When||condition"))
					}],
					values: { states: r.states },
					onChange: (e, t) => o({ states: t })
				}),
				/* @__PURE__ */ W(Z, {
					fields: [Ys("text", k("Text"), {
						placeholder: k("As Designed"),
						status: r.text ? "own" : void 0,
						reset: () => o({ text: void 0 })
					})],
					values: { text: r.text },
					onChange: (e, t) => o({ text: t || void 0 })
				}),
				/* @__PURE__ */ W(ui, {
					title: k("Attributes"),
					action: /* @__PURE__ */ W(_i, {
						label: k("Bind Attribute"),
						onClick: () => o({ attrs: {
							...r.attrs ?? {},
							"aria-expanded": i[0] ?? "open"
						} })
					})
				}),
				/* @__PURE__ */ W(Z, {
					bare: !0,
					fields: [{
						handle: "attrs",
						type: "json",
						component: "blocks-pairs",
						className: "items-start",
						label: k("Attributes"),
						key: {
							options: Qs,
							className: ""
						},
						item: Ys("expr", k("Value"))
					}],
					values: { attrs: r.attrs },
					onChange: (e, t) => o({ attrs: t })
				}),
				e.type === "input" && /* @__PURE__ */ W(Z, {
					fields: [{
						handle: "model",
						type: "select",
						size: "sm",
						label: k("Input Value"),
						placeholder: k("Not kept"),
						options: i,
						status: r.model ? "own" : void 0,
						reset: () => o({ model: void 0 })
					}],
					values: { model: r.model },
					onChange: (e, t) => o({ model: t || void 0 })
				})
			]
		}),
		/* @__PURE__ */ G(ci, {
			title: k("Behaviors"),
			empty: !r.behaviors && !r.component && !u,
			open: !!r.behaviors || !!r.component || u,
			children: [
				/* @__PURE__ */ W(ic, {
					on: !!l.scroll,
					label: k("Scroll States"),
					onToggle: (e) => o({ behaviors: {
						...l,
						scroll: e ? { threshold: 20 } : void 0
					} }),
					fields: [{
						handle: "threshold",
						type: "text",
						component: "blocks-value",
						label: k("After||a distance"),
						unit: "",
						prefix: "px"
					}, {
						handle: "hide",
						type: "toggle",
						size: "sm",
						label: k("Add data-hidden While Scrolling Down")
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
				/* @__PURE__ */ W(ic, {
					on: !!l.spy,
					label: k("Scroll Spy"),
					onToggle: (e) => o({ behaviors: {
						...l,
						spy: e ? { offset: 96 } : void 0
					} })
				}),
				/* @__PURE__ */ W(ic, {
					on: !!l.group,
					label: k("Hover Group"),
					onToggle: (e) => o({ behaviors: {
						...l,
						group: e || void 0
					} })
				}),
				/* @__PURE__ */ W(ic, {
					on: !!l.menu,
					label: k("Menu"),
					onToggle: (e) => o({ behaviors: {
						...l,
						menu: e ? {} : void 0
					} })
				}),
				/* @__PURE__ */ W(ic, {
					on: !!l.carousel,
					label: k("Carousel"),
					onToggle: (e) => o({ behaviors: {
						...l,
						carousel: e ? {} : void 0
					} })
				}),
				/* @__PURE__ */ W(ic, {
					on: !!l.marquee,
					label: k("Marquee"),
					onToggle: (e) => o({ behaviors: {
						...l,
						marquee: e ? { speed: 60 } : void 0
					} }),
					fields: [
						{
							handle: "speed",
							type: "text",
							component: "blocks-value",
							label: k("Speed"),
							unit: "",
							prefix: "px/s",
							title: k("Pixels per Second")
						},
						{
							handle: "reverse",
							type: "toggle",
							size: "sm",
							label: k("Reverse")
						},
						{
							handle: "pause",
							type: "toggle",
							size: "sm",
							label: k("Pause on Hover")
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
				ee("site.code") && /* @__PURE__ */ W(nc, { node: e }),
				/* @__PURE__ */ W(Z, {
					fields: [{
						handle: "component",
						type: "text",
						size: "sm",
						commit: "blur",
						label: k("Alpine"),
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
		c && /* @__PURE__ */ W(ci, {
			title: k("Load Into"),
			open: !!r.target,
			empty: !r.target && !r.merge,
			children: /* @__PURE__ */ W(Z, {
				fields: [
					{
						handle: "target",
						type: "json",
						component: "blocks-nodes",
						label: k("Update"),
						exclude: e.id,
						add: k("Element to Update"),
						addValue: e.id
					},
					...Zs(r.target, {
						handle: "push",
						type: "toggle",
						size: "sm",
						label: k("Update the Address Bar")
					}),
					{
						handle: "merge",
						type: "select",
						size: "sm",
						label: k("When Loaded"),
						placeholder: k("Replace It"),
						options: [
							{
								value: "replace",
								label: k("Replace It")
							},
							{
								value: "update",
								label: k("Replace What Is Inside")
							},
							{
								value: "append",
								label: k("Add to the End")
							},
							{
								value: "prepend",
								label: k("Add to the Start")
							},
							{
								value: "morph",
								label: k("Morph (Keep State)")
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
function ic({ on: e, label: t, onToggle: n, fields: r, values: i, onChange: a }) {
	return /* @__PURE__ */ G("div", {
		className: V("-mx-1.5 rounded-sm px-1.5 py-1", e && "bg-sunken/60"),
		children: [/* @__PURE__ */ W(Z, {
			fields: [{
				handle: "on",
				type: "toggle",
				size: "sm",
				label: t
			}],
			values: { on: e },
			onChange: (e, t) => n(!!t)
		}), e && r && /* @__PURE__ */ W(Z, {
			className: "mt-1 space-y-1 pl-10",
			fields: r,
			values: i ?? {},
			onChange: a ?? (() => {})
		})]
	});
}
function ac({ title: e, mods: t, onMods: n, actions: r, onActions: i, onRemove: a, variables: o, node: s }) {
	return /* @__PURE__ */ G("div", {
		className: "space-y-1.5 rounded-sm border border-border p-1.5",
		children: [
			/* @__PURE__ */ G("div", {
				className: "flex items-center gap-1",
				children: [
					/* @__PURE__ */ W(L, {
						name: "interactive",
						size: 14,
						className: "shrink-0 text-muted"
					}),
					typeof e == "string" ? /* @__PURE__ */ W("span", {
						className: "min-w-0 flex-1 text-xs font-medium [overflow-wrap:anywhere]",
						children: e
					}) : e,
					n && /* @__PURE__ */ W(z, {
						align: "end",
						trigger: /* @__PURE__ */ W(R, {
							icon: "faders",
							label: k("Event Options"),
							size: "xs",
							active: !!t?.length
						}),
						items: Ws().map((e) => ({
							label: e.label,
							checked: t?.includes(e.value),
							onSelect: () => n(t?.includes(e.value) ? t.filter((t) => t !== e.value) : [...t ?? [], e.value])
						}))
					}),
					/* @__PURE__ */ W(vi, {
						onClick: a,
						label: k("Remove Event")
					})
				]
			}),
			t && t.length > 0 && /* @__PURE__ */ W("p", {
				className: "m-0 pl-5 text-2xs text-faint [overflow-wrap:anywhere]",
				children: t.map((e) => Ws().find((t) => t.value === e)?.label).join(" · ")
			}),
			/* @__PURE__ */ W(oc, {
				actions: r,
				onChange: i,
				variables: o,
				node: s
			})
		]
	});
}
function oc({ actions: e, onChange: t, variables: n, node: r, depth: i = 0 }) {
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
	return /* @__PURE__ */ G("div", {
		className: V("space-y-1", i > 0 && "border-l border-border pl-2"),
		children: [e.map((a, s) => /* @__PURE__ */ G("div", {
			className: "space-y-1 rounded-md bg-active/60 p-1.5",
			children: [/* @__PURE__ */ G("div", {
				className: "flex items-center gap-1",
				children: [
					/* @__PURE__ */ W(L, {
						name: Gs().find((e) => e.value === a.do)?.icon ?? "dot-outline",
						size: 14,
						className: "shrink-0 text-muted"
					}),
					/* @__PURE__ */ W("span", {
						className: "min-w-0 flex-1 text-xs font-medium text-text [overflow-wrap:anywhere]",
						children: Gs().find((e) => e.value === a.do)?.label ?? a.do
					}),
					/* @__PURE__ */ W(vi, {
						onClick: () => t(e.filter((e, t) => t !== s)),
						label: k("Remove Action")
					})
				]
			}), /* @__PURE__ */ W(cc, {
				action: a,
				onChange: (e) => o(s, e),
				variables: n,
				node: r,
				depth: i
			})]
		}, s)), /* @__PURE__ */ W(z, {
			align: "start",
			trigger: /* @__PURE__ */ W(gi, { children: k("Add Action") }),
			items: Gs().map((e) => ({
				label: e.label,
				icon: e.icon,
				onSelect: () => a(e.value)
			}))
		})]
	});
}
var sc = (e) => e === "top" || e === "bottom" ? e : e?.startsWith("#") ? "anchor" : "node";
function cc({ action: e, onChange: t, variables: n, node: r, depth: i }) {
	let { store: o } = a(), s = sn(), c = K(o, (t) => e.do === "play" && e.node ? d(t.nodes, e.node) : null), l = {
		handle: "var",
		type: "select",
		size: "sm",
		label: k("Variable"),
		options: n,
		placeholder: k("Variable")
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
			p = [l, Ys("value", e.do === "set" ? k("To||set a value") : k("Add||to a number"), { placeholder: e.do === "set" ? "true, 'text', count + 1" : "1" })];
			break;
		case "toggle":
			p = [l];
			break;
		case "if":
			p = [Ys("test", k("If"), { placeholder: "open" })];
			break;
		case "play":
			p = [
				u("node", k("Element")),
				{
					handle: "motion",
					type: "select",
					size: "sm",
					label: k("Animation"),
					options: (c?.motion ?? []).map((e) => ({
						value: e.id,
						label: e.name || e.id
					})),
					placeholder: c?.motion?.length ? k("First Animation") : k("No animations on it")
				},
				f("mode", k("Play"), [
					{
						value: "play",
						label: k("Play")
					},
					{
						value: "reverse",
						label: k("Reverse")
					},
					{
						value: "toggle",
						label: k("Toggle")
					},
					{
						value: "restart",
						label: k("Restart")
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
					label: k("To"),
					required: !0,
					options: [
						{
							value: "top",
							label: k("Top of Page")
						},
						{
							value: "bottom",
							label: k("Bottom of Page")
						},
						{
							value: "anchor",
							label: k("Section")
						},
						{
							value: "node",
							label: k("Element")
						}
					]
				},
				{
					handle: "anchor",
					type: "select",
					size: "sm",
					label: k("Section"),
					options: s.map((e) => ({
						value: `#${e.id}`,
						label: e.label
					})),
					placeholder: k("Choose a Section"),
					if: { kind: "anchor" }
				},
				u("node", k("Element"), { if: { kind: "node" } }),
				{
					handle: "offset",
					type: "text",
					component: "blocks-value",
					label: k("Offset"),
					unit: "",
					prefix: "px",
					placeholder: "0",
					title: k("Offset in pixels, e.g. a sticky header’s height")
				}
			], m = {
				kind: sc(e.to),
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
				label: k("Page"),
				placeholder: "/blog/page/2",
				mono: !0
			}, {
				handle: "target",
				type: "json",
				component: "blocks-nodes",
				label: k("Update"),
				addValue: r.id
			}];
			break;
		case "copy":
			p = [Ys("value", k("Text"), { placeholder: `'${k("Text to Copy")}'` })];
			break;
		case "go":
			p = [{
				handle: "url",
				type: "url",
				component: "link",
				reference: !0,
				size: "sm",
				label: k("Link"),
				anchors: s,
				newTab: !!e.newTab,
				onNewTab: (e) => t({ newTab: e || void 0 })
			}], h = (e, t) => ({ url: t ?? "" });
			break;
		case "theme":
			p = [f("mode", k("Mode"), [
				{
					value: "toggle",
					label: k("Switch||between two")
				},
				{
					value: "light",
					label: k("Light")
				},
				{
					value: "dark",
					label: k("Dark")
				},
				{
					value: "system",
					label: k("System")
				}
			])], m = { mode: e.mode ?? "toggle" };
			break;
		case "focus":
			p = [u("node", k("Element"))], h = (e, t) => ({ node: t ?? void 0 });
			break;
		case "lock":
			p = [f("on", k("Scrolling"), [{
				value: "on",
				label: k("Lock")
			}, {
				value: "off",
				label: k("Unlock")
			}])], m = { on: e.on === !1 ? "off" : "on" }, h = (e, t) => ({ on: t !== "off" });
			break;
		case "wait":
			p = [{
				handle: "ms",
				type: "text",
				component: "blocks-value",
				label: k("Wait"),
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
				label: k("Event"),
				placeholder: "event-name",
				mono: !0
			}, Ys("detail", k("Detail"), { placeholder: "detail" })], h = (e, t) => ({ [e]: e === "detail" ? t || void 0 : t ?? "" });
			break;
		case "run":
			p = [Ys("expr", k("Run"), { placeholder: "count = count * 2" })];
			break;
		default: return /* @__PURE__ */ W("p", {
			className: V(mi, "h-auto whitespace-pre-wrap font-mono [overflow-wrap:anywhere]"),
			children: JSON.stringify(e)
		});
	}
	return /* @__PURE__ */ G("div", {
		className: "space-y-1",
		children: [/* @__PURE__ */ W(Z, {
			fields: p,
			values: m,
			onChange: (e, n) => t(h(e, n))
		}), e.do === "if" && /* @__PURE__ */ G(U, { children: [
			/* @__PURE__ */ W("p", {
				className: "cms-label m-0 pt-1",
				children: k("Then")
			}),
			/* @__PURE__ */ W(oc, {
				actions: e.then ?? [],
				onChange: (e) => t({ then: e }),
				variables: n,
				node: r,
				depth: i + 1
			}),
			/* @__PURE__ */ W("p", {
				className: "cms-label m-0 pt-1",
				children: k("Else")
			}),
			/* @__PURE__ */ W(oc, {
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
var lc = (e) => ({
	appear: k("Appear"),
	scroll: k("Scroll"),
	hover: k("Hover and Press"),
	loop: k("Loop"),
	load: k("Page Load"),
	event: k("On Event")
})[e], uc = "power3.out", dc = () => [
	{
		name: k("Fade In"),
		group: "appear",
		make: () => ({
			trigger: { type: "appear" },
			steps: [{
				target: "self",
				from: { opacity: 0 },
				duration: .8,
				ease: uc
			}]
		})
	},
	{
		name: k("Fade Up"),
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
				ease: uc
			}]
		})
	},
	{
		name: k("Slide in from Left"),
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
				ease: uc
			}]
		})
	},
	{
		name: k("Scale In"),
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
		name: k("Blur In"),
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
				ease: uc
			}]
		})
	},
	{
		name: k("Reveal (Wipe Up)"),
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
		name: k("Children one by one"),
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
				ease: uc,
				stagger: .08
			}]
		})
	},
	{
		name: k("Words Rise"),
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
				ease: uc,
				stagger: .04
			}]
		})
	},
	{
		name: k("Words Slide Up (Masked)"),
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
		name: k("Parallax"),
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
		name: k("Zoom While Scrolling"),
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
		name: k("Fade Through"),
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
		name: k("Highlight Words"),
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
		name: k("Rotate While Scrolling"),
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
		name: k("Slide Sideways"),
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
		name: k("Lift"),
		group: "hover",
		make: () => ({
			trigger: { type: "hover" },
			steps: [{
				target: "self",
				to: { y: -6 },
				duration: .3,
				ease: uc
			}]
		})
	},
	{
		name: k("Grow"),
		group: "hover",
		make: () => ({
			trigger: { type: "hover" },
			steps: [{
				target: "self",
				to: { scale: 1.04 },
				duration: .35,
				ease: uc
			}]
		})
	},
	{
		name: k("Zoom Image Inside"),
		group: "hover",
		make: () => ({
			trigger: { type: "hover" },
			steps: [{
				target: "children",
				to: { scale: 1.06 },
				duration: .6,
				ease: uc
			}]
		})
	},
	{
		name: k("Press"),
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
		name: k("Float"),
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
		name: k("Spin"),
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
		name: k("Pulse"),
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
		name: k("Intro: Fade Up"),
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
				ease: uc,
				delay: .1
			}]
		})
	},
	{
		name: k("Intro: Words"),
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
				ease: uc,
				stagger: .05
			}]
		})
	},
	{
		name: k("Intro: Children"),
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
				ease: uc,
				stagger: .1
			}]
		})
	},
	{
		name: k("Open (Fade and Scale)"),
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
				ease: uc
			}]
		})
	},
	{
		name: k("Slide in Panel"),
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
				ease: uc,
				stagger: .05
			}]
		})
	}
], fc = () => ({
	appear: {
		label: k("Appear"),
		icon: "eye"
	},
	scroll: {
		label: k("Scroll"),
		icon: "mouse-scroll"
	},
	hover: {
		label: k("Hover"),
		icon: "hand-pointing"
	},
	press: {
		label: k("Press"),
		icon: "hand-tap"
	},
	load: {
		label: k("Page Load"),
		icon: "rocket"
	},
	loop: {
		label: k("Loop"),
		icon: "refresh"
	},
	event: {
		label: k("On Event"),
		icon: "broadcast"
	}
}), pc = () => ({
	opacity: k("Opacity"),
	x: k("Move X"),
	y: k("Move Y"),
	xPercent: k("Move X %"),
	yPercent: k("Move Y %"),
	z: k("Move Z"),
	scale: k("Scale"),
	scaleX: k("Scale X"),
	scaleY: k("Scale Y"),
	rotate: k("Rotate"),
	rotateX: k("Rotate X (3D)"),
	rotateY: k("Rotate Y (3D)"),
	skewX: k("Skew X"),
	skewY: k("Skew Y"),
	blur: k("Blur"),
	brightness: k("Brightness"),
	grayscale: k("Grayscale"),
	clipPath: k("Clip Path"),
	backgroundColor: k("Fill"),
	color: k("Text Color"),
	borderColor: k("Border Color"),
	borderRadius: k("Radius"),
	boxShadow: k("Shadow"),
	letterSpacing: k("Letter Spacing"),
	transformOrigin: k("Origin"),
	perspective: k("Perspective")
}), mc = () => [
	{
		value: "power3.out",
		label: k("Smooth Out")
	},
	{
		value: "expo.out",
		label: k("Expo Out")
	},
	{
		value: "power4.inOut",
		label: k("Smooth In-Out")
	},
	{
		value: "power2.out",
		label: k("Gentle Out")
	},
	{
		value: "back.out(1.7)",
		label: k("Overshoot")
	},
	{
		value: "elastic.out(1, 0.4)",
		label: k("Elastic")
	},
	{
		value: "bounce.out",
		label: k("Bounce")
	},
	{
		value: "sine.inOut",
		label: k("Sine In-Out")
	},
	{
		value: "power2.in",
		label: k("Ease In")
	},
	{
		value: "none",
		label: k("Linear")
	},
	{
		value: "cubic-bezier(0.2, 0.8, 0.2, 1)",
		label: k("Signature Ease")
	}
], hc = (e, t, n = {}) => ({
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
}), gc = /^\d{1,5}(\.\d{1,2})?(px|rem|vh|svh|lvh|dvh)$/, _c = [
	"vh",
	"svh",
	"lvh",
	"dvh",
	"px",
	"rem"
], vc = (e, ...t) => e ? t : [], yc = [
	"heading",
	"paragraph",
	"link",
	"button",
	"quote"
], bc = (e) => {
	let t = e.length + 1;
	for (; e.some((e) => e.id === `m${t}`);) t++;
	return `m${t}`;
}, xc = (e = "self") => e.startsWith("#") ? k("Another Element") : {
	self: k("This Element"),
	children: k("Children"),
	words: k("Words"),
	lines: k("Lines||of text"),
	chars: k("Letters")
}[e] ?? e;
function Sc({ node: e }) {
	let { store: t } = a(), n = e.motion ?? [], [r, i] = F(n[0]?.id ?? null), o = (n) => t.updateNode(e.id, { motion: n.length ? n : void 0 }, `motion:${e.id}`), s = (e, t) => o(n.map((n) => n.id === e ? {
		...n,
		...t
	} : n)), c = yc.includes(e.type), l = fc(), u = (t) => {
		let r = bc(n), a = t ? {
			id: r,
			name: t.name,
			...t.make()
		} : {
			id: r,
			name: k("Custom"),
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
		o([...n, a]), i(r), requestAnimationFrame(() => mr.emit("preview-motion", {
			node: e.id,
			motion: a
		}));
	}, d = dc(), f = [...new Set(d.map((e) => e.group))];
	return /* @__PURE__ */ W(ci, {
		title: k("Animations"),
		empty: n.length === 0,
		actions: /* @__PURE__ */ W(z, {
			align: "end",
			trigger: /* @__PURE__ */ W(R, {
				icon: "plus",
				label: k("Add Animation"),
				size: "xs"
			}),
			items: [
				...f.flatMap((e) => [{
					label: lc(e),
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
					label: k("Custom Animation"),
					icon: "animated",
					onSelect: () => u()
				}
			]
		}),
		children: n.map((t) => /* @__PURE__ */ G("div", {
			className: V("rounded-sm border", r === t.id ? "border-border-strong" : "border-border"),
			children: [/* @__PURE__ */ G("div", {
				className: "flex h-8 items-center gap-1.5 pl-2 pr-1",
				children: [
					/* @__PURE__ */ W(L, {
						name: l[t.trigger.type]?.icon ?? "animated",
						size: 13,
						className: "shrink-0 text-muted"
					}),
					/* @__PURE__ */ G(I, {
						variant: "ghost",
						onClick: () => i(r === t.id ? null : t.id),
						"aria-expanded": r === t.id,
						className: "min-w-0 flex-1 shrink !justify-start !gap-1.5 !bg-transparent !px-0 text-left !text-xs",
						children: [/* @__PURE__ */ W("span", {
							className: "truncate font-medium text-ink",
							children: t.name || l[t.trigger.type]?.label
						}), /* @__PURE__ */ W("span", {
							className: "shrink-0 font-normal text-faint",
							children: l[t.trigger.type]?.label
						})]
					}),
					/* @__PURE__ */ W(ke, {
						content: k("Preview Animation"),
						children: /* @__PURE__ */ W(R, {
							icon: "play",
							label: k("Preview Animation"),
							title: void 0,
							size: "xs",
							onClick: () => mr.emit("preview-motion", {
								node: e.id,
								motion: t
							})
						})
					}),
					/* @__PURE__ */ W(vi, {
						onClick: () => o(n.filter((e) => e.id !== t.id)),
						label: k("Remove Animation")
					})
				]
			}), r === t.id && /* @__PURE__ */ W(Cc, {
				node: e,
				motion: t,
				onChange: (e) => s(t.id, e)
			})]
		}, t.id))
	});
}
function Cc({ node: e, motion: t, onChange: n }) {
	let [r, i] = F(0), a = fc(), o = t.trigger, s = (e) => n({ trigger: {
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
		label: k("Name")
	}, {
		handle: "type",
		type: "select",
		size: "sm",
		label: k("Trigger"),
		required: !0,
		options: Object.entries(a).map(([e, t]) => ({
			value: e,
			label: t.label
		}))
	}], f = [
		...vc(o.type === "appear", {
			handle: "start",
			type: "select",
			size: "sm",
			label: k("Starts"),
			placeholder: k("A little into view"),
			options: [
				{
					value: "top 95%",
					label: k("As soon as it peeks in")
				},
				{
					value: "top 85%",
					label: k("A little into view")
				},
				{
					value: "top 65%",
					label: k("A third into view")
				},
				{
					value: "center center",
					label: k("At the Center")
				}
			]
		}, {
			handle: "replay",
			type: "toggle",
			size: "sm",
			label: k("Reverse When Scrolled Back")
		}),
		...vc(o.type === "scroll", {
			handle: "start",
			type: "select",
			size: "sm",
			label: k("Begins"),
			placeholder: k("Enters the Screen"),
			options: [
				{
					value: "top bottom",
					label: k("Enters the Screen")
				},
				{
					value: "top 80%",
					label: k("Top at 80%")
				},
				{
					value: "top center",
					label: k("Top at Center")
				},
				{
					value: "top top",
					label: k("Top at Top")
				},
				{
					value: "center center",
					label: k("Centered")
				}
			]
		}, {
			handle: "end",
			type: "select",
			size: "sm",
			label: k("Ends"),
			placeholder: k("Leaves the Screen"),
			options: [
				{
					value: "bottom top",
					label: k("Leaves the Screen")
				},
				{
					value: "center center",
					label: k("Centered")
				},
				{
					value: "top top",
					label: k("Top at Top")
				},
				{
					value: "bottom center",
					label: k("Bottom at Center")
				},
				{
					value: "bottom bottom",
					label: k("Bottom at Bottom")
				}
			]
		}, {
			handle: "pin",
			type: "text",
			component: "blocks-value",
			label: k("Pin Distance"),
			unit: "vh",
			units: _c,
			step: 10,
			min: 0,
			max: 99999,
			placeholder: "0"
		}, hc("scrub", k("Smoothing"), { max: 3 })),
		...vc(l, {
			handle: "repeat",
			type: "select",
			display: "segmented",
			block: !0,
			size: "sm",
			label: k("Repeat||again"),
			required: !0,
			options: [
				{
					value: "0",
					label: k("Once")
				},
				{
					value: "1",
					label: k("Twice")
				},
				{
					value: "-1",
					label: k("Forever||repeat")
				}
			]
		}, {
			handle: "yoyo",
			type: "toggle",
			size: "sm",
			label: k("Back and Forth")
		}, {
			handle: "hold",
			type: "number",
			size: "sm",
			label: k("Loop as a Timeline, Resting (s)"),
			if: { repeat: "-1" }
		}),
		...vc(o.type === "scroll" || o.type === "appear", {
			handle: "watch",
			type: "select",
			component: "blocks-node",
			label: k("Watch"),
			placeholder: k("This Element"),
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
		e === "name" ? n({ name: t ?? "" }) : e === "type" ? t && s({ type: t }) : e === "start" || e === "end" ? s({ [e]: t ?? void 0 }) : e === "pin" ? s({ pin: typeof t == "string" && gc.test(t.trim()) && parseFloat(t) > 0 ? t.trim() : void 0 }) : e === "scrub" ? s({ scrub: parseFloat(t) > 0 ? Math.min(3, Math.max(.05, parseFloat(t))) : void 0 }) : e === "replay" ? s({ once: !t && void 0 }) : e === "repeat" ? n({ repeat: Number(t ?? 0) }) : e === "yoyo" ? n({ yoyo: t || void 0 }) : e === "hold" ? n({ hold: t === "" || t == null ? void 0 : Number(t) }) : e === "watch" && s({ node: t ? `#${t}` : void 0 });
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
	return /* @__PURE__ */ G("div", {
		className: "space-y-2 border-t border-border p-2",
		children: [
			/* @__PURE__ */ W(Z, {
				fields: [...d, ...f],
				values: m,
				onChange: h
			}),
			/* @__PURE__ */ G("div", {
				className: "flex min-h-7 items-center",
				children: [/* @__PURE__ */ W(di, { field: {
					handle: "on",
					type: "select",
					label: k("Plays On")
				} }), /* @__PURE__ */ W("div", {
					role: "group",
					"aria-label": k("Plays On"),
					className: "flex gap-0.5",
					children: [
						[
							"desktop",
							"monitor",
							k("Desktop")
						],
						[
							"tablet",
							"tablet",
							k("Tablet")
						],
						[
							"mobile",
							"phone",
							k("Phone")
						]
					].map(([e, t, r]) => /* @__PURE__ */ W(R, {
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
			o.type === "event" && /* @__PURE__ */ G("p", {
				className: "m-0 flex h-7 items-center gap-2 text-xs",
				children: [/* @__PURE__ */ W("span", {
					className: "w-[88px] shrink-0 text-muted",
					children: k("Animation ID")
				}), /* @__PURE__ */ W("code", {
					className: "select-all font-mono text-text",
					children: t.id
				})]
			}),
			/* @__PURE__ */ W(Ec, {
				steps: t.steps,
				active: u,
				onSelect: i,
				onChange: c,
				onAdd: g
			}),
			t.steps[u] && /* @__PURE__ */ W(Dc, {
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
function wc(e) {
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
var Tc = (e) => Math.max(0, Math.round(e * 20) / 20);
function Ec({ steps: e, active: t, onSelect: n, onChange: r, onAdd: i }) {
	let a = wc(e), o = Math.max(.5, ...a.map((e) => e.start + e.duration + e.spread)), s = P(null), c = s.current?.total ?? Math.ceil(o * 2 + .25) / 2, l = c <= 1.5 ? .25 : c <= 4 ? .5 : c <= 10 ? 1 : 2, u = Array.from({ length: Math.floor(c / l) + 1 }, (e, t) => t * l), d = (e) => `${e / c * 100}%`, f = (t, i, a) => {
		t.preventDefault(), t.stopPropagation(), n(i);
		let o = t.currentTarget.closest("[data-track]");
		if (!o) return;
		s.current = {
			total: c,
			width: o.clientWidth
		};
		let l = t.clientX, u = e[i], d = a === "move" ? u.at === void 0 ? u.delay ?? 0 : u.at : u.duration ?? .6, f = (e) => {
			let t = (e.clientX - l) / s.current.width * s.current.total;
			a === "end" ? r(i, { duration: Math.max(.05, Tc(d + t)) }) : u.at === void 0 ? r(i, { delay: Tc(d + t) || void 0 }) : r(i, { at: Tc(d + t) });
		}, p = () => {
			window.removeEventListener("pointermove", f), window.removeEventListener("pointerup", p), s.current = null;
		};
		window.addEventListener("pointermove", f), window.addEventListener("pointerup", p);
	};
	return /* @__PURE__ */ G("div", {
		className: "rounded-md bg-active/60 py-1.5",
		children: [
			/* @__PURE__ */ G("div", {
				className: "mb-1 flex items-end pr-2",
				children: [/* @__PURE__ */ W("span", {
					className: "w-24 shrink-0 pl-2 text-2xs font-medium text-faint",
					children: k("Timeline")
				}), /* @__PURE__ */ W("div", {
					className: "relative h-3 flex-1",
					children: u.filter((e, t) => u.length <= 5 || t % 2 == 0).map((e) => /* @__PURE__ */ W("span", {
						className: "absolute -translate-x-1/2 font-mono text-2xs leading-none text-faint first:translate-x-0 last:-translate-x-full",
						style: { left: d(e) },
						children: e === 0 ? "0" : `${e}s`
					}, e))
				})]
			}),
			e.map((e, i) => {
				let o = a[i];
				return /* @__PURE__ */ G("div", {
					className: V("flex h-7 items-center pr-2", i === t && "bg-focus-soft"),
					children: [/* @__PURE__ */ W(I, {
						variant: "ghost",
						size: "xs",
						onClick: () => n(i),
						className: V("w-24 !justify-start !bg-transparent !pl-2 !pr-0 text-left !text-2xs", i === t ? "!font-medium !text-ink" : "!font-normal !text-muted hover:!text-text"),
						children: /* @__PURE__ */ W("span", {
							className: "truncate",
							children: xc(e.target)
						})
					}), /* @__PURE__ */ G("div", {
						"data-track": !0,
						className: "relative h-full flex-1",
						children: [
							u.map((e) => /* @__PURE__ */ W("span", {
								className: "absolute inset-y-0 w-px bg-border/70",
								style: { left: d(e) }
							}, e)),
							/* @__PURE__ */ G("div", {
								role: "slider",
								tabIndex: 0,
								"aria-label": k("Step {n}", { n: i + 1 }),
								"aria-valuenow": o.start,
								"aria-valuetext": k("Starts at {start}s, runs {duration}s", {
									start: o.start.toFixed(2),
									duration: o.duration.toFixed(2)
								}),
								onPointerDown: (e) => f(e, i, "move"),
								onKeyDown: (t) => {
									if (t.key !== "ArrowLeft" && t.key !== "ArrowRight") return;
									t.preventDefault();
									let n = t.key === "ArrowRight" ? .05 : -.05;
									t.shiftKey ? r(i, { duration: Math.max(.05, Tc((e.duration ?? .6) + n)) }) : e.at === void 0 ? r(i, { delay: Tc((e.delay ?? 0) + n) || void 0 }) : r(i, { at: Tc(e.at + n) });
								},
								className: V("cms-focus-ring group/bar absolute top-1 flex h-4 cursor-grab items-center rounded-xs active:cursor-grabbing", i === t ? "bg-focus" : "bg-focus/50 hover:bg-focus/70"),
								style: {
									left: d(o.start),
									width: `max(6px, ${d(o.duration)})`
								},
								children: [/* @__PURE__ */ G("span", {
									className: "pointer-events-none truncate px-1 font-mono text-2xs leading-none text-white",
									children: [o.duration.toFixed(1), "s"]
								}), /* @__PURE__ */ W("span", {
									onPointerDown: (e) => f(e, i, "end"),
									className: "absolute -right-1 inset-y-0 w-2 cursor-ew-resize",
									"aria-hidden": !0
								})]
							}),
							o.spread > 0 && /* @__PURE__ */ W("span", {
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
			/* @__PURE__ */ W(gi, {
				size: "xs",
				onClick: i,
				className: "ml-24 mt-0.5 !w-auto",
				children: k("Add Step")
			})
		]
	});
}
function Dc({ node: e, step: t, index: n, count: r, onChange: i, onRemove: o }) {
	let { catalog: s } = a(), c = Lt(), l = c.of("color").find((e) => !/-\d+$/.test(e.name) && e.name !== "black" && e.name !== "white")?.ref ?? "currentColor", u = t.target ?? "self", d = pc(), f = Object.keys(s.motion?.properties ?? d), p = yc.includes(e.type), m = (e) => {
		let n = t[e] ?? {}, r = (t, r) => i({ [e]: {
			...n,
			[t]: /^-?[\d.]+$/.test(r) ? Number(r) : r
		} });
		return /* @__PURE__ */ G("div", {
			className: "space-y-1",
			children: [
				/* @__PURE__ */ G("div", {
					className: "flex h-7 items-center justify-between",
					children: [/* @__PURE__ */ W("span", {
						className: "text-xs font-medium text-muted",
						children: k(e === "from" ? "From" : "To||end value")
					}), /* @__PURE__ */ W(z, {
						align: "end",
						trigger: /* @__PURE__ */ W(R, {
							icon: "plus",
							label: k(e === "from" ? "Add a Start Property" : "Add an End Property"),
							size: "xs"
						}),
						items: f.filter((e) => !(e in n)).map((e) => ({
							label: d[e] ?? e,
							onSelect: () => r(e, s.motion.properties[e] === "css" ? e === "clipPath" ? "inset(0% 0% 0% 0%)" : l : e === "opacity" || e.startsWith("scale") ? "1" : "0")
						}))
					})]
				}),
				Object.keys(n).length === 0 && /* @__PURE__ */ W("p", {
					className: "m-0 text-2xs text-faint",
					children: k(e === "from" ? "As it looks now" : "As Designed")
				}),
				/* @__PURE__ */ W(Z, {
					bare: !0,
					fields: [{
						handle: e,
						type: "json",
						component: "blocks-pairs",
						className: "items-start",
						label: k(e === "from" ? "From" : "To||end value"),
						labels: d,
						item: {
							handle: "value",
							type: "text",
							component: "blocks-value",
							label: k("Value"),
							unit: ""
						},
						items: Object.fromEntries(Object.keys(n).map((e) => [e, {
							handle: "value",
							type: "text",
							component: "blocks-value",
							label: k("Value"),
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
	return /* @__PURE__ */ G("div", {
		className: "space-y-2",
		children: [
			/* @__PURE__ */ G("div", {
				className: "flex h-7 items-center gap-1",
				children: [
					/* @__PURE__ */ W("span", {
						className: "text-xs font-semibold text-text",
						children: r > 1 ? k("Step {n}", { n: n + 1 }) : k("Animate")
					}),
					/* @__PURE__ */ W("span", { className: "flex-1" }),
					r > 1 && /* @__PURE__ */ W(vi, {
						onClick: o,
						label: k("Remove Step")
					})
				]
			}),
			/* @__PURE__ */ W(Z, {
				fields: [
					{
						handle: "target",
						type: "select",
						size: "sm",
						label: k("Target"),
						required: !0,
						options: [
							{
								value: "self",
								label: k("This Element")
							},
							{
								value: "children",
								label: k("Each Child in Turn")
							},
							...p ? [
								{
									value: "words",
									label: k("Each Word")
								},
								{
									value: "lines",
									label: k("Each Line")
								},
								{
									value: "chars",
									label: k("Each Letter")
								}
							] : [],
							{
								value: "other",
								label: k("Another Element")
							}
						]
					},
					...vc(u.startsWith("#"), {
						handle: "element",
						type: "select",
						component: "blocks-node",
						label: k("Element")
					}),
					...vc(u === "words" || u === "chars", {
						handle: "mask",
						type: "toggle",
						size: "sm",
						label: k("Rise from Behind a Line")
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
			/* @__PURE__ */ W(Z, {
				fields: [
					hc("duration", k("Duration")),
					hc("delay", k("Delay")),
					...vc(u !== "self", hc("stagger", k("Stagger"), { step: .01 })),
					...vc(r > 1, hc("at", k("Starts At||time"), { placeholder: k("After") })),
					{
						handle: "ease",
						type: "text",
						component: "ease",
						label: k("Ease"),
						placeholder: k("Smooth Out"),
						options: [...c.of("ease").map((e) => ({
							value: e.ref,
							label: e.name,
							curve: e.value
						})), ...mc()]
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
var Oc = [
	"content",
	"design",
	"interact"
], kc = "cms.block.tab";
function Ac(e) {
	if (!e.scrollTop) return null;
	let t = e.getBoundingClientRect().top, n = [...e.querySelectorAll("[data-section]")].find((e) => e.getBoundingClientRect().bottom > t);
	return {
		section: n?.dataset.section,
		offset: n ? n.getBoundingClientRect().top - t : 0,
		scrollTop: e.scrollTop
	};
}
function jc(e, t) {
	let n = t.section && e.querySelector(`[data-section="${CSS.escape(t.section)}"]`);
	n ? e.scrollTop += n.getBoundingClientRect().top - e.getBoundingClientRect().top - t.offset : e.scrollTop = t.scrollTop;
}
function Mc() {
	try {
		let e = sessionStorage.getItem(kc);
		return Oc.find((t) => t === e) ?? "content";
	} catch {
		return "content";
	}
}
function Nc({ node: e, onBack: n, backLabel: r, onClose: i }) {
	let { store: o, types: s, allowed: c, readOnly: u } = a(), d = s.get(e.type), f = t(), [p, m] = F(Mc), h = `block-inspector-${me()}`, [g, _] = F(!1), v = P(null), y = P(e.id), b = P(null);
	y.current !== e.id && (y.current = e.id, b.current = v.current && Ac(v.current)), he(() => {
		v.current && b.current && jc(v.current, b.current), b.current = null;
	}, [e.id]);
	let x = (e) => {
		try {
			sessionStorage.setItem(kc, e);
		} catch {}
		m(e);
	}, C = !u && e.type !== "component" && ee("entries.components.create");
	return /* @__PURE__ */ G("div", {
		className: "flex h-full min-h-0 min-w-0 flex-col",
		"data-blocks-inspector": !0,
		children: [
			/* @__PURE__ */ W(Ce, {
				bordered: !1,
				onBack: n,
				backLabel: r,
				onClose: i,
				icon: e.type === "component" ? "symbol" : d?.icon ?? "square",
				actions: /* @__PURE__ */ W(z, {
					align: "end",
					trigger: /* @__PURE__ */ W(R, {
						icon: "more",
						label: k("Block Actions"),
						size: "sm"
					}),
					items: [
						{
							label: k("Rename"),
							icon: "edit",
							disabled: u,
							onSelect: () => _(!0)
						},
						{
							label: k("Duplicate"),
							icon: "copy",
							shortcut: "mod+d",
							disabled: u,
							onSelect: () => o.duplicate(e.id)
						},
						C && S(o, s, c) && {
							label: k("Make a Component"),
							icon: "symbol",
							onSelect: () => {
								o.selection().includes(e.id) || o.select(e.id), gn(o);
							}
						},
						!u && ee("entries.patterns.create") && {
							label: k("Save as Pattern"),
							icon: "section-copy",
							onSelect: () => {
								o.selection().includes(e.id) || o.select(e.id), _n(o);
							}
						},
						{
							label: k("Copy ID"),
							icon: "hash",
							onSelect: () => void Ae(e.id, { copied: k("Copied {reference}", { reference: e.id }) })
						},
						{
							separator: !0,
							label: ""
						},
						{
							label: k("Delete"),
							icon: "trash",
							shortcut: "⌫",
							danger: !0,
							disabled: u,
							onSelect: () => o.remove(e.id)
						}
					]
				}),
				children: g ? /* @__PURE__ */ W("div", {
					className: "min-w-0 flex-1 pl-1",
					onBlur: () => _(!1),
					onKeyUp: (e) => e.key === "Escape" && e.target.blur(),
					children: /* @__PURE__ */ W(Z, {
						bare: !0,
						fields: [{
							handle: "label",
							type: "text",
							size: "sm",
							commit: "blur",
							label: k("Name"),
							autofocus: !0,
							placeholder: d?.title
						}],
						values: { label: e.label ?? "" },
						onChange: (t, n) => o.updateNode(e.id, { label: n.trim() || void 0 })
					})
				}) : /* @__PURE__ */ W(I, {
					variant: "ghost",
					onDoubleClick: () => !u && _(!0),
					className: "min-w-0 flex-1 shrink !justify-start !bg-transparent !pl-1 !pr-0 text-left !font-medium !text-ink",
					title: u ? void 0 : k("Double-Click to Rename"),
					children: /* @__PURE__ */ W("span", {
						className: "truncate",
						children: l(e, s, f)
					})
				})
			}),
			/* @__PURE__ */ W("div", {
				className: "flex h-10 shrink-0 items-center gap-2 border-b border-border pl-4 pr-3",
				children: /* @__PURE__ */ W(Oe, {
					id: h,
					value: p,
					onChange: x,
					bordered: !1,
					size: "sm",
					className: "h-full min-w-0 flex-1",
					tabs: Oc.map((e) => ({
						value: e,
						label: {
							content: k("Content"),
							design: k("Design"),
							interact: k("Interact")
						}[e]
					}))
				})
			}),
			/* @__PURE__ */ W("fieldset", {
				ref: v,
				role: "tabpanel",
				id: `${h}-${p}-panel`,
				"aria-labelledby": `${h}-${p}`,
				disabled: u || !d && e.type !== "component",
				className: "m-0 min-h-0 min-w-0 flex-1 overflow-y-auto border-0 p-0",
				children: /* @__PURE__ */ G(j, { children: [
					p === "design" && /* @__PURE__ */ W(Hs, { node: e }),
					p === "content" && /* @__PURE__ */ W(Oa, { node: e }),
					p === "interact" && /* @__PURE__ */ G(U, { children: [/* @__PURE__ */ W(Sc, { node: e }), /* @__PURE__ */ W(rc, { node: e })] })
				] }, e.id)
			})
		]
	});
}
export { _i as $, qe as $t, ra as A, Pt as At, Wi as B, ct as Bt, xo as C, gr as Ct, Na as D, cn as Dt, Pa as E, un as Et, Xi as F, Vt as Ft, Gi as G, _t as Gt, Mi as H, yt as Ht, $i as I, jt as It, Hi as J, Je as Jt, Fi as K, at as Kt, Ji as L, Ft as Lt, ca as M, Et as Mt, Qi as N, Dt as Nt, ha as O, sn as Ot, ea as P, kt as Pt, Ni as Q, Y as Qt, Ai as R, Lt as Rt, Co as S, _r as St, Fa as T, dn as Tt, ji as U, vt as Ut, Ui as V, lt as Vt, Pi as W, gt as Wt, Ii as X, J as Xt, qi as Y, rt as Yt, wi as Z, q as Zt, Fo as _, wr as _t, js as a, K as an, mi as at, yo as b, br as bt, vs as c, Br as ct, ps as d, Lr as dt, tt as en, Z as et, us as f, Ir as ft, No as g, Tr as gt, Go as h, Er as ht, Cs as i, He as in, hi as it, na as j, Ot as jt, ga as k, en as kt, ds as l, Hr as lt, Ro as m, Or as mt, Bs as n, Ge as nn, di as nt, Ts as o, $r as ot, Vo as p, Rr as pt, Ei as q, Ze as qt, Vs as r, Ve as rn, ci as rt, Ss as s, Kr as st, Nc as t, Ke as tn, vi as tt, fs as u, Fr as ut, Mo as v, Dr as vt, Xa as w, mr as wt, bo as x, yr as xt, Ao as y, hr as yt, Ki as z, dt as zt };
