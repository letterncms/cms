import { a as e, c as t, d as n, f as r, g as i, h as a, i as o, l as s, m as c, n as l, o as u, p as d, r as f, t as p, u as m, v as h, y as g } from "./insert-DSPXdALv.js";
import { Link as _, can as v, getManifest as y, invalidate as b, navigate as x, plural as ee, registry as S, requestText as te, run as C, t as w, useAbility as T, useManifest as E, useManifestIfLoaded as ne } from "@letterncms/sdk";
import { Fragment as re, createContext as ie, createElement as ae, forwardRef as D, memo as O, useCallback as oe, useContext as se, useEffect as k, useId as ce, useLayoutEffect as le, useMemo as A, useRef as j, useState as M, useSyncExternalStore as N } from "react";
import { Button as P, Dialog as ue, Fields as F, Icon as I, IconButton as L, Menu as de, MenuAt as fe, NEW_COLOR as pe, NoMatches as me, Notice as he, PagePreview as ge, PanelHeader as _e, Popover as R, Pressable as z, QueryError as ve, Segmented as ye, Spinner as be, Tabs as xe, Tooltip as B, cn as V, copyText as Se, deviceWidths as Ce, fieldControlId as we, fieldVisible as Te, prompt as Ee, slugify as De, toast as Oe, useShortcutLabel as ke, wideFieldTypes as Ae } from "@letterncms/ui";
import { Fragment as je, jsx as H, jsxs as U } from "react/jsx-runtime";
import { createPortal as Me, flushSync as Ne } from "react-dom";
import { createRoot as Pe } from "react-dom/client";
// admin/src/core/context.tsx
var Fe = ie(null);
function Ie({ value: e, children: t }) {
	return e.store.setReadOnly(!!e.readOnly), /* @__PURE__ */ H(Fe.Provider, {
		value: e,
		children: t
	});
}
function W() {
	let e = se(Fe);
	if (!e) throw Error("Block editor context missing");
	return e;
}
function G() {
	let e = T("blocks/types", {}, { staleTime: 3e5 }), t = A(() => new Map((e.data?.blocks ?? []).map((e) => [e.name, e])), [e.data]);
	return {
		catalog: e.data,
		types: t,
		isLoading: e.isLoading,
		error: e.error,
		retry: () => void e.refetch()
	};
}
function Le() {
	let e = T("components/list", {}, { staleTime: 6e4 });
	return A(() => new Map((e.data ?? []).map((e) => [e.handle, e.title])), [e.data]);
}
function Re(e, t, n) {
	return e.label || (e.type === "component" ? n.get(String(e.props?.ref ?? "")) : void 0) || t.get(e.type)?.title || e.type;
}
// admin/src/core/store.ts
var ze = class {
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
	selection = () => Be(this.state);
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
function Be(e) {
	if (!e.selected) return [];
	if (!e.head) return [e.selected];
	let t = r(e.nodes, e.selected);
	if (!t) return [e.selected];
	let n = i(e.nodes, t.parentId), a = n.findIndex((t) => t.id === e.selected), o = n.findIndex((t) => t.id === e.head);
	return o < 0 ? [e.selected] : n.slice(Math.min(a, o), Math.max(a, o) + 1).map((e) => e.id);
}
function Ve(e, t) {
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
		return n.current && Ve(n.current.value, r) ? n.current.value : (n.current = { value: r }, r);
	});
}
// admin/src/core/uniqueIds.ts
function He(e, t) {
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
function Ue(e, t, n) {
	let r = j(t);
	r.current = t;
	let [i] = M(() => new ze(He(Array.isArray(e) ? e : [], g), (e) => r.current(e), n)), a = j(e);
	return i.setReadOnly(n), k(() => {
		if (a.current === e) return;
		a.current = e;
		let t = He(Array.isArray(e) ? e : [], g);
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
function We(e, t) {
	return [...e, t].join(":");
}
function Ge(e) {
	return (e ?? "").split(/\s+/).filter(Boolean);
}
function Ke(e) {
	return e.trim().replace(/_/g, "\\_").replace(/\s+/g, "_");
}
var qe = {
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
}, Je = {
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
}, Ye = class {
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
			t = n === null ? null : et(n), this.css.set(e, t);
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
		return r && a.push(We(t, r)), a;
	}
	make(e, t, n) {
		let r = t.trim();
		if (r === "") return null;
		let i = r.startsWith("-") && /^-[\d.]/.test(r) ? `-${e}-${r.slice(1)}` : `${e}-${r}`;
		if (/^[\w./%-]+$/.test(r) && this.declarations(i) !== null) return i;
		let a = `${e}-[${n ? `${n}:` : ""}${Ke(r)}]`;
		return this.declarations(a) === null ? null : a;
	}
	utilityFor(e, t) {
		let n = qe[e], r = n ? $e(t) : null;
		if (n && r) {
			let t = this.make(n, r.alpha === void 0 ? r.key : `${r.key}/${r.alpha}`);
			if (t && this.declarations(t)?.some((t) => t.property === e && t.value.includes(r.variable))) return t;
		}
		let i = Xe(this.resolve(t)), a = this.index().get(`${e}:${i}`);
		if (a) return a;
		if (n) for (let [t, r] of this.ds.theme.entries()) {
			let a = Xe(r.value) === i ? $e(`var(${t})`)?.key : void 0, o = a ? this.make(n, a) : null;
			if (o && Xe(this.resolve(this.value(o, e) ?? "")) === i) return o;
		}
		let o = n ? this.make(n, t) : null, s = o && this.declarations(o)?.some((t) => t.property === e) ? o : n ? this.make(n, t, Je[e]) : null, c = (t) => t.includes("[") ? this.declarations(t)?.some((t) => t.property === e) : Xe(this.resolve(this.value(t, e) ?? "")) === i;
		if (s && c(s)) return s;
		let l = n ? `${n}-[${Je[e] ? `${Je[e]}:` : ""}${Ke(t)}]` : null;
		return l && l !== s && c(l) ? l : `[${e}:${Ke(t)}]`;
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
			let i = Qe(e, n);
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
			let i = et(n[r]);
			if (this.css.set(t, i), i.length !== 1 || n[r].indexOf("{") !== n[r].lastIndexOf("{")) return;
			let a = `${i[0].property}:${Xe(this.resolve(i[0].value))}`, o = e.get(a);
			(!o || t.length < o.length) && e.set(a, t);
		}), this.exact = e;
	}
	resolve(e) {
		let t = e;
		for (let e = 0; e < 4 && t.includes("var(--"); e++) t = t.replace(/var\((--[\w-]+)(?:,[^()]*)?\)/g, (e, t) => this.ds.resolveThemeValue(t) ?? e);
		return t.replace(/calc\(([\d.]+)(rem|px|em) \* (-?[\d.]+)\)/g, (e, t, n, r) => `${+(Number(t) * Number(r)).toFixed(4)}${n}`);
	}
};
function Xe(e) {
	return e.trim().toLowerCase().replace(/\s+/g, " ").replace(/(^|[^\w.-])(-?\d*\.?\d+)px\b/g, (e, t, n) => `${t}${+(Number(n) / 16).toFixed(4)}rem`).replace(/(^|[^\d.])0(?:rem|em)\b/g, "$10");
}
var Ze = {
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
function Qe(e, t) {
	let n = Ze[e];
	if (!t.startsWith(n)) return null;
	let r = t.slice(n.length);
	return r === "" || r.includes("--") || e === "font" && r.startsWith("weight-") ? null : r;
}
function $e(e) {
	let t = e.trim(), n = /^var\((--[\w-]+)\)$/.exec(t), r = n ? null : /^color-mix\(in \w+, var\((--color-[\w-]+)\) ([\d.]+)%, transparent\)$/.exec(t), i = n?.[1] ?? r?.[1];
	if (!i) return null;
	let a = Object.values(Ze).filter((e) => i.startsWith(e)).sort((e, t) => t.length - e.length)[0];
	return a ? {
		variable: i,
		key: i.slice(a.length),
		...r ? { alpha: r[2] } : {}
	} : null;
}
function et(e) {
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
function tt(e, t = 1280) {
	return {
		variant: "",
		width: t,
		sizes: e
	};
}
function nt(e) {
	let t = /^(-?\d*\.?\d+)(px|rem|em)?$/.exec(e.trim());
	return t ? Number(t[1]) * (t[2] === "rem" || t[2] === "em" ? 16 : 1) : null;
}
function rt(e, t) {
	if (e in t) return { from: t[e] };
	let n = /^(min|max)-(?:\[(.+)\]|(.+))$/.exec(e);
	if (!n) return null;
	let r = n[2] === void 0 ? n[3] in t ? t[n[3]] : null : nt(n[2]);
	return r === null ? null : n[1] === "min" ? { from: r } : { below: r };
}
var it = class e {
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
			let t = rt(e, this.screen.sizes);
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
				if (o === void 0 || at(o)) return;
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
		if (J(n.filter((e) => !rt(e, this.screen.sizes))) !== J(this.state)) return this.variants;
		let i = We(this.variants, r), [, a] = this.engine.sort([t.from, i]);
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
function at(e) {
	if (!e.startsWith("var(--tw-")) return !1;
	let t = 0;
	for (let n = 0; n < e.length; n++) if (e[n] === "(") t++;
	else if (e[n] === ")" && --t === 0) return n === e.length - 1;
	return !1;
}
// admin/src/builder/styleApi.ts
var ot = (e) => e.startsWith("-") ? e : e.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`), st = (e) => e.startsWith("-") ? e : e.replace(/-([a-z])/g, (e, t) => t.toUpperCase()), Y = (e) => e.replace(/^!|!$/g, "");
function ct(e) {
	let t = e.trim();
	for (let e = 0; e < 3; e++) {
		let e = t.replace(/var\(--tw-[\w-]+,\s*((?:[^()]|\((?:[^()]|\([^()]*\))*\))+)\)/g, "$1").replace(/calc\((\d+) \/ (\d+) \* 100%\)/g, (e, t, n) => `${+(Number(t) / Number(n) * 100).toFixed(4)}%`).replace(/calc\((-?[\d.]+)([a-z%]*) \* -1\)/g, (e, t, n) => `${-Number(t)}${n}`);
		if (e === t) break;
		t = e;
	}
	return t;
}
var lt = (e) => e?.match(/^[a-zA-Z-]+\((.*)\)$/)?.[1];
function ut(e, t, n, r, i) {
	let a = [...n.variant ? [n.variant] : [], ...r], o = J(a), s = t.map((e) => {
		let { variants: t, utility: n } = q(e);
		return {
			raw: e,
			layer: J(t),
			utility: Y(n)
		};
	}), c = e ? new it(e, t, n, r) : null, l = (e) => {
		let t = c?.find(ot(e));
		return t ? {
			value: ct(t.value),
			own: t.own
		} : void 0;
	}, u = (n, r) => {
		!e || n.length === t.length && n.every((e, n) => e === t[n]) || i(e.sort([...new Set(n)]), r);
	}, d = (t) => new it(e, t, n, r), f = {
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
			let i = Object.fromEntries(Object.entries(n).map(([e, t]) => [ot(e), typeof t == "string" ? t.replace(/"/g, "'") : t])), a = "width" in i || "height" in i ? dt(e, t, o) : t;
			u(d(a).set(i), r ?? Object.keys(n).join(","));
		},
		own: () => e ? d(t).own().map(st) : [],
		get: (n) => e ? d(t).get(n) : null,
		put: (n, r, i) => {
			e && u(d(t).put(n, r), i ?? n);
		},
		swap: (t, n, r) => {
			if (!e) return;
			let i = Array.isArray(t) ? t : [t], c = s.filter((t) => t.layer !== o || !e.declarations(t.utility)?.some((e) => i.includes(e.property))).map((e) => e.raw), l = (Array.isArray(n) ? n : [n]).filter((e) => !!e);
			u([...c, ...l.map((e) => We(a, e))], r ?? i.join(","));
		},
		apply: (n, r) => {
			e && !(n.length === t.length && n.every((e, n) => e === t[n])) && i(n, r);
		},
		edit: (i, a) => {
			if (!e) return;
			let o = t, s = () => ut(e, o, n, r, (e) => {
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
function dt(e, t, n) {
	return t.flatMap((t) => {
		let { variants: r, utility: i } = q(t);
		if (J(r) !== n || !/^-?size-/.test(Y(i))) return [t];
		let a = ["w", "h"].map((e) => i.replace("size-", `${e}-`));
		return a.every((t) => e.valid(t)) ? a.map((e) => We(r, e)) : [t];
	});
}
function ft(e, t, n, r) {
	let i = n.trim();
	if (i === "") return null;
	let a = (t) => e.declarations(t) === null ? null : t, o = $e(i), s = o ? e.make(t, o.alpha === void 0 ? o.key : `${o.key}/${o.alpha}`) : null;
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
			let e = pt[String(+s.toFixed(2))];
			e && (u = a(`${n}${t}-${e}`));
		} else r === "px" && (o === "px" || o === "" && s === 0) || r === "deg" && (o === "deg" || o === "") ? u = l(s) : r === "ms" && (o === "ms" || o === "s") ? u = l(o === "s" ? s * 1e3 : s) : r === "percent" && o === "%" ? u = l(s) : r === "percent" && o === "" ? u = l(s * 100) : r === "number" && o === "" && (u = l(s));
		if (u) return u;
	}
	return e.make(t, i);
}
var pt = {
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
}, mt = {
	"to top": "0deg",
	"to right": "90deg",
	"to bottom": "180deg",
	"to left": "270deg"
}, ht = {
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
}, gt = [
	"background-image",
	"--tw-gradient-from",
	"--tw-gradient-via",
	"--tw-gradient-to",
	"--tw-gradient-from-position",
	"--tw-gradient-via-position",
	"--tw-gradient-to-position"
];
function _t(e, t) {
	let n = () => {
		let n = `${t.kind}-gradient(${[t.angle, ...t.stops.map((e) => `${e.color}${e.at ? ` ${e.at}` : ""}`)].filter(Boolean).join(", ")})`, r = e.make("bg", n);
		return [r && e.declarations(r)?.some((e) => e.property === "background-image") ? r : e.utilityFor("background-image", n)];
	};
	if (t.kind !== "linear" || t.stops.length < 2 || t.stops.length > 3) return n();
	let r = t.angle.trim().replace(/\s+/g, " "), i = /^(-?\d+)deg$/.exec(r), a = ht[r] ? `bg-linear-to-${ht[r]}` : i ? `${i[1].startsWith("-") ? "-" : ""}bg-linear-${i[1].replace("-", "")}` : null;
	if (!a || e.declarations(a) === null) return n();
	let o = t.stops.length === 3 ? [
		"from",
		"via",
		"to"
	] : ["from", "to"], s = [a];
	for (let [r, i] of t.stops.entries()) {
		let t = ft(e, o[r], i.color, "number"), a = i.at ? e.make(o[r], i.at) : null;
		if (!t || i.at && !a) return n();
		s.push(t, ...a ? [a] : []);
	}
	return s;
}
function vt(e) {
	let t = e("--tw-gradient-position"), n = e("--tw-gradient-from"), r = e("--tw-gradient-to");
	if (!t && !n && !r) return;
	let i = e("--tw-gradient-via"), a = (t, n) => {
		let r = e(`--tw-gradient-${n}-position`);
		return `${t ?? "transparent"}${r ? ` ${r}` : ""}`;
	}, o = (t ?? "to bottom").replace(/\s+in\s+[\w-]+(\s+\w+\s+hue)?$/, "");
	return `linear-gradient(${[
		mt[o] ?? o,
		a(n, "from"),
		...i ? [a(i, "via")] : [],
		a(r, "to")
	].join(", ")})`;
}
function yt(e) {
	return new Set(e.flatMap((e) => q(e).variants));
}
function bt(e, t) {
	let n = J(t);
	return e.some((e) => J(q(e).variants) === n);
}
function xt(e, t) {
	return q(e).variants.length ? e : We(t, e);
}
function St(e, t, n) {
	let r = new Set(n), i = {
		site: [],
		utilities: []
	};
	for (let n of t) {
		let { utility: t } = q(n);
		r.has(Y(t)) || e && !e.valid(n) ? i.site.push(n) : i.utilities.push(n);
	}
	return i;
}
var Ct = (e) => /^[^\s"<>`\u0000-\u001f\u007f]{1,200}$/.test(e), wt = (e, t) => !Ct(t) || !!e && /[:[\]/()]/.test(t) && !e.valid(t), Tt = /* @__PURE__ */ new WeakMap();
function Et(e) {
	let t = Tt.get(e);
	return t || Tt.set(e, t = e.ds.getClassList().map(([e]) => e)), t;
}
var Dt = 40;
function Ot(e, t, n, r) {
	let i = n.trim().toLowerCase(), a = t.filter((e) => !r.has(e) && e.toLowerCase().includes(i));
	if (!i) return a.slice(0, Dt);
	let o = new Set(t), s = [], c = [];
	for (let t of Et(e)) {
		if (o.has(t) || r.has(t)) continue;
		let e = t.indexOf(i);
		if (e === 0 ? s.push(t) : e > 0 && c.length < Dt && c.push(t), s.length >= Dt) break;
	}
	let l = n.trim(), u = [
		...a,
		...s.sort((e, t) => e.length - t.length),
		...c
	];
	return !l || r.has(l) || u.includes(l) || !Ct(l) || wt(e, l) ? u.slice(0, Dt) : e.valid(l) ? [l, ...u].slice(0, Dt) : [...u.slice(0, 39), l];
}
function kt(e, t) {
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
function At(e) {
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
function jt(e) {
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
var Mt = [
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
function Nt(e, t) {
	let n = /^([\d.]+)rem$/.exec(e?.ds.resolveThemeValue("--spacing") ?? "");
	return {
		scale: n ? Mt.map((e) => {
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
var Pt = /* @__PURE__ */ new Set([
	"hover",
	"active",
	"focus",
	"focus-visible",
	"focus-within"
]);
function Ft(e, t) {
	return t.length === 0 || !t.every((e) => Pt.has(e)) ? [] : e.flatMap((e) => {
		let { variants: n, utility: r } = q(e);
		return t.every((e) => n.includes(e)) ? [We(n.filter((e) => !t.includes(e)), r.endsWith("!") || r.startsWith("!") ? r : `${r}!`)] : [];
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
var It = /\/\*[ \t]*group:[ \t]*([^*\n]*?)[ \t]*\*\/\s*$/, Lt = (e, t) => /[ \t]*$/.exec(e.slice(0, t))[0], Rt = [
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
], zt = ":root, [data-theme]", Bt = (e) => `.cms-prose ${e}:where(:not(.cms-box, .cms-repeat))`, Vt = {
	spacing: ".cms-prose",
	h2: Bt("h2"),
	h3: Bt("h3"),
	p: Bt("p"),
	li: ".cms-prose :where(ul:not(.cms-box, .cms-repeat), ol:not(.cms-box, .cms-repeat)) > li",
	blockquote: Bt("blockquote"),
	figure: Bt("figure"),
	a: Bt("a")
}, Ht = {
	base: [...Rt, zt],
	components: Object.values(Vt)
}, Ut = "color|font(?!-weight-)|text(?!-shadow-)|tracking|leading|breakpoint|container|spacing|radius|shadow|inset-shadow|drop-shadow|text-shadow|blur|perspective|ease|animate|duration|control", Wt = RegExp(`^--(?:(?:${Ut})-(?!.*--)[a-z0-9][\\w.-]*|spacing|default-transition-duration|default-transition-timing-function)$`), Gt = RegExp(`^--(?:(?:${Ut})-)?\\*$`), Kt = (e) => Wt.test(e);
function qt(e) {
	let t = new Yt(e);
	return X(e).filter((e) => e.inner && /^@theme\b/.test(e.prelude)).flatMap((e) => t.declarationsOf(e));
}
function Jt(e) {
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
var Yt = class e {
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
		let a = this.declarations(i).filter((t) => Xt(t.name) === Xt(e));
		if (n === "first" && a[0]) return this.splice(a[0].start, a[0].start, `${e}: ${t};\n${Lt(this.css, a[0].start)}`);
		let o = a[a.length - 1];
		if (o) {
			let n = this.css.indexOf("\n", o.end), r = n === -1 || n > i.inner[1] ? o.end : n;
			return this.splice(r, r, `\n${Lt(this.css, o.start)}${e}: ${t};`);
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
		return i ? r ? this.splice(i.start, i.end, `/* group: ${r} */`) : this.splice(this.lineStart(i.start), n.start, Lt(this.css, n.start)) : r ? this.splice(n.start, n.start, `/* group: ${r} */\n${Lt(this.css, n.start)}`) : this;
	}
	renameGroup(e, t) {
		return this.utilities().filter((t) => t.group === e).reduce((e, n) => e.setUtilityGroup(n.name, t), this);
	}
	groupComment(e) {
		let t = this.css.slice(Math.max(0, e.start - 200), e.start), n = It.exec(t);
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
			let s = `${Lt(i.css, t.start)}  `, c = a[a.length - 1], l = X(i.css, ...t.inner)[0];
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
			let n = Lt(this.css, e);
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
				!t.inner && n && (Wt.test(n) || Gt.test(n) && /:\s*initial\s*$/.test(t.prelude)) || e.push([this.leading(t.start), t.end]);
			}
			else if (i.inner && (i.prelude === "@layer base" || i.prelude === "@layer components")) {
				let e = i.prelude.slice(7);
				for (let r of X(this.css, ...i.inner)) r.inner && Ht[e].includes(r.prelude.replace(/\s+/g, " ")) || (n.includes(e) || n.push(e), t[e].push([this.leading(r.start), r.end]));
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
		let r = Lt(this.css, e);
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
		return a ? this.insertLast(a, `${Lt(this.css, a.start)}  ${t}: ${n};`) : this.splice(i.inner[0], i.inner[0], `\n  ${e} {\n    ${t}: ${n};\n  }`);
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
			let t = `${Lt(this.css, e.start)}  `;
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
		return this.splice(r - i, r, `\n${t}\n${Lt(this.css, e.start)}`);
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
function Xt(e) {
	return /^--(font-weight|inset-shadow|drop-shadow|text-shadow|[a-z]+)/.exec(e)?.[0] ?? e;
}
// admin/src/core/styling.tsx
var Zt = (e) => `${e.css}\u0000${JSON.stringify(e.files)}`, Qt = /* @__PURE__ */ new Map(), $t = /* @__PURE__ */ new Map(), en = /* @__PURE__ */ new Map();
function tn(e, t, n) {
	e.set(t, n);
	for (let t of [...e.keys()].slice(0, -2)) e.delete(t);
	return n;
}
function nn(e) {
	let t = Zt(e);
	return Qt.get(t) ?? tn(Qt, t, import("./compile-C_bW4FEX.js").then(({ designSystem: t }) => t(e)).then((e) => new Ye(e)).catch((e) => (console.error("[cms] The stylesheet could not be read.", e), null)).then((e) => tn($t, t, e)));
}
function rn() {
	return import("./defaults-DOHwyD24.js").then((e) => e.default);
}
function an(e) {
	let t = Zt(e);
	return en.get(t) ?? tn(en, t, import("./compile-C_bW4FEX.js").then(({ compiler: t }) => t(e)));
}
function on(e, t, n) {
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
function sn(e) {
	let t = parseFloat(e);
	return Number.isNaN(t) ? 0 : /r?em$/.test(e.trim()) ? t * 16 : t;
}
function cn(e) {
	let t = e ? Zt(e) : "", [, n] = M(0);
	return k(() => {
		if (!e || $t.has(t)) return;
		let r = !0;
		return nn(e).then(() => r && n((e) => e + 1)), () => {
			r = !1;
		};
	}, [t]), {
		engine: e && $t.get(t) || null,
		loading: !!e && !$t.has(t)
	};
}
function ln(e, t, n) {
	return {
		engine: e,
		breakpoints: e ? e.tokens("breakpoint").map((e) => ({
			name: e.name,
			width: sn(e.value)
		})).filter((e) => e.width > 0).sort((e, t) => e.width - t.width) : [],
		classes: t ? pn(t.css) : [],
		source: t,
		loading: n
	};
}
var un = ie(null);
function dn({ source: e, children: t }) {
	let { engine: n, loading: r } = cn(e), i = A(() => ln(n, e, r), [
		n,
		e,
		r
	]);
	return /* @__PURE__ */ H(un.Provider, {
		value: i,
		children: t
	});
}
function fn() {
	let e = se(un), t = T("styling/source", {}, {
		staleTime: 6e4,
		retry: !1,
		enabled: !e
	}), n = e ? void 0 : t.data, { engine: r, loading: i } = cn(n), a = A(() => ln(r, n, t.isLoading || i), [
		r,
		n,
		t.isLoading,
		i
	]);
	return e ?? a;
}
function pn(e) {
	try {
		return new Yt(e).utilities().map((e) => e.name).filter((e) => /^[\w-]+$/.test(e));
	} catch {
		return [];
	}
}
function mn() {
	let { engine: e } = fn();
	return A(() => vn(e), [e]);
}
var hn = [
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
], gn = {
	of: () => [],
	find: () => null,
	resolve: (e) => e
}, _n = /* @__PURE__ */ new WeakMap();
function vn(e) {
	if (!e) return gn;
	let t = _n.get(e);
	return t || _n.set(e, t = yn(e)), t;
}
function yn(e) {
	let t = /* @__PURE__ */ new Map(), n = (n) => {
		let r = t.get(n);
		return r || t.set(n, r = e.tokens(n)), r;
	}, r = null;
	return {
		of: n,
		find: (e) => {
			let t = typeof e == "string" ? $e(e) : null;
			if (!t) return null;
			r ??= new Map(hn.flatMap((e) => n(e)).map((e) => [e.variable, e]));
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
function bn(e = document) {
	return e.getSelection()?.isCollapsed ?? !0;
}
function xn(e, t) {
	let n = e.ownerDocument.getSelection();
	if (!n || n.rangeCount === 0) return null;
	let r = n.getRangeAt(0);
	if (!e.contains(r.startContainer)) return null;
	let i = e.ownerDocument.createRange();
	return i.selectNodeContents(e), t ? i.setEnd(r.startContainer, r.startOffset) : i.setStart(r.endContainer, r.endOffset), i;
}
function Sn(e) {
	return e ? e.toString().replace(/​/g, "") : "";
}
function Cn(e) {
	return bn(e.ownerDocument) && Sn(xn(e, !0)) === "" && !Tn(xn(e, !0)).includes("<br");
}
function wn(e) {
	return bn(e.ownerDocument) && Sn(xn(e, !1)) === "";
}
function Tn(e) {
	if (!e) return "";
	let t = e.startContainer.ownerDocument.createElement("div");
	return t.appendChild(e.cloneContents()), t.innerHTML;
}
function En(e) {
	return Sn(xn(e, !0)).length;
}
function Dn(e) {
	let t = xn(e, !0), n = xn(e, !1);
	return [Tn(t), Tn(n)];
}
function On(e) {
	let t = jn(e.ownerDocument);
	return !t || t.top - e.getBoundingClientRect().top < An(e) * .8;
}
function kn(e) {
	let t = jn(e.ownerDocument);
	return !t || e.getBoundingClientRect().bottom - t.bottom < An(e) * .8;
}
function An(e) {
	let t = parseFloat(e.ownerDocument.defaultView.getComputedStyle(e).lineHeight);
	return Number.isFinite(t) ? t : 20;
}
function jn(e = document) {
	let t = e.getSelection();
	if (!t || t.rangeCount === 0) return null;
	let n = t.getRangeAt(0).cloneRange(), r = n.getClientRects();
	if (r.length > 0) return r[0];
	let i = e.createElement("span");
	i.textContent = "​", n.insertNode(i);
	let a = i.getBoundingClientRect();
	return i.remove(), a;
}
function Mn(e, t) {
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
function Nn(e) {
	let t = document.createElement("div");
	return t.innerHTML = e, (t.textContent ?? "").length;
}
function Pn(e) {
	return e.replace(/\u200B/g, "").replace(/<(\/?)strike>/g, "<$1s>").replace(/<(\/?)b>/g, "<$1strong>").replace(/<(\/?)i>/g, "<$1em>").replace(/<div><br><\/div>/g, "<br>").replace(/<\/?(div|p|span)[^>]*>/g, "").replace(/ style="[^"]*"/g, "").replace(/&nbsp;/g, " ").replace(/<br>$/, "");
}
var Fn = [
	["**", "strong"],
	["__", "strong"],
	["~~", "s"],
	["`", "code"],
	["*", "em"],
	["_", "em"]
];
function In(e = document) {
	let t = e.getSelection();
	if (!t || !t.isCollapsed || t.rangeCount === 0) return !1;
	let n = t.anchorNode;
	if (!n || n.nodeType !== Node.TEXT_NODE || n.parentElement?.closest("code")) return !1;
	let r = t.anchorOffset, i = (n.textContent ?? "").slice(0, r);
	for (let [a, o] of Fn) {
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
function Ln() {
	let { store: e } = W(), t = K(e, (e) => e.nodes), n = /* @__PURE__ */ new Map(), r = [];
	for (let { node: e } of s(t)) {
		let t = String(e.props?.text ?? "").replace(/<[^>]+>/g, "").trim(), i = e.props?.anchor || e.anchor || "";
		if (!i && e.type === "heading" && t) {
			let e = De(t) || "section", r = (n.get(e) ?? 0) + 1;
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
function Rn({ html: e, onChange: t, tag: n = "div", placeholder: r, className: i = "", focus: a, onKeyDown: o, onFocus: s, onPaste: c, disabled: l, singleLine: u, quiet: d, plainText: f }) {
	let p = j(null), m = j(e);
	le(() => {
		let t = p.current;
		t && (t.ownerDocument.activeElement === t ? m.current = e : (Pn(t.innerHTML) !== e && (t.innerHTML = e), m.current = Pn(t.innerHTML)));
	}, [e]), le(() => {
		a && p.current && Mn(p.current, a.at);
	}, [a?.nonce]);
	let h = () => {
		let e = p.current;
		e && (e.spellcheck = !parseFloat(e.ownerDocument.defaultView?.getComputedStyle(e).webkitTextStrokeWidth ?? "0"));
	}, g = () => {
		let e = p.current;
		if (!e) return;
		let n = Pn(e.innerHTML);
		n !== m.current && (m.current = n, t(n, e));
	};
	return ae(n, {
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
			!f && t.inputType === "insertText" && t.data && /[*_~`]/.test(t.data) && In(e.currentTarget.ownerDocument), g();
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
			}[e.key.toLowerCase()]), g()) : n && e.shiftKey && e.key.toLowerCase() === "x" ? (e.preventDefault(), t.execCommand("strikeThrough"), g()) : n && e.key.toLowerCase() === "k" ? (e.preventDefault(), e.stopPropagation(), p.current?.ownerDocument.dispatchEvent(new CustomEvent("cms:link"))) : n && e.key.toLowerCase() === "e" ? (e.preventDefault(), zn("code", t), g()) : e.key === "Enter" && e.shiftKey && !u ? (e.preventDefault(), t.execCommand("insertLineBreak"), g()) : p.current && o?.(e, p.current);
		},
		onPaste: (e) => {
			e.preventDefault();
			let t = e.currentTarget.ownerDocument, n = e.clipboardData.getData("text/plain");
			!f && /^(https?:\/\/|mailto:)\S+$/i.test(n.trim()) && !t.getSelection()?.isCollapsed ? (t.execCommand("createLink", !1, n.trim()), g()) : p.current && c?.(n, p.current) || (t.execCommand("insertText", !1, u ? n.replace(/\s*\n\s*/g, " ") : n), g());
		},
		onBlur: () => g()
	});
}
function zn(e, t = document) {
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
function Bn(e) {
	return {
		...e,
		type: "url",
		component: "link"
	};
}
// admin/src/core/FormatToolbar.tsx
function Vn({ root: e = document, offset: t }) {
	let [n, r] = M(null), [i, a] = M({}), [o, s] = M(!1), [c, l] = M(""), u = j(null), d = j(null), f = j(() => {}), p = Ln();
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
		zn(t, e), d.current?.dispatchEvent(new Event("input", { bubbles: !0 })), e.dispatchEvent(new Event("selectionchange"));
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
	}, b = Bn({
		handle: "url",
		label: w("Link"),
		size: "sm",
		autofocus: !0,
		anchors: p,
		placeholder: w("Paste a link or search pages"),
		onClose: y
	});
	return Me(/* @__PURE__ */ U("div", {
		className: "fixed z-overlay flex -translate-x-1/2 -translate-y-full items-center gap-0.5 rounded-md bg-ink p-1 shadow-pop",
		style: {
			left: n.x,
			top: n.y - 8
		},
		onMouseDown: (e) => !o && e.preventDefault(),
		onKeyDown: (e) => e.key === "Escape" && y(),
		children: [
			v("bold", w("Bold"), "mod+b", () => m("bold")),
			v("italic", w("Italic"), "mod+i", () => m("italic")),
			v("underline", w("Underline"), "mod+u", () => m("underline")),
			v("strike", w("Strikethrough"), "mod+shift+x", () => m("strikeThrough")),
			v("code", w("Code"), "mod+e", () => h("code")),
			/* @__PURE__ */ H("span", { className: "mx-0.5 h-4 w-px bg-white/15" }),
			v("link", w("Link"), "mod+k", g),
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
function Hn(e, t, n) {
	return t >= 0 && t < e ? "choose" : n ? "wait" : "pass";
}
function Un(e, t) {
	return e > 0 ? "choose" : t ? "wait" : "release";
}
function Wn(e, t) {
	return e && !t;
}
// admin/src/core/Inserter.tsx
var Gn = (e) => `/__pattern/${encodeURIComponent(e)}`, Kn = (e) => e.replace(/[-_]+/g, " ").replace(/(^|\s)\S/g, (e) => e.toUpperCase()), qn = (e) => e.kind === "block" ? e.type.title : e.kind === "component" ? e.component.title : e.pattern.title, Jn = (e) => e.kind === "block" ? e.type.icon : e.kind === "component" ? "symbol" : "section-copy", Yn = (e) => e.kind === "block" ? e.type.name : e.kind === "component" ? `c-${e.component.handle}` : `p-${e.pattern.handle}`;
function Xn(e, t) {
	return e.blocks.length > 0 && e.blocks.every((e) => t(e.type));
}
var Zn = (e, t) => !t || [
	e.title,
	e.category,
	e.description,
	...e.keywords ?? []
].some((e) => e.toLowerCase().includes(t));
function Qn(e, t, n, r = !0) {
	let i = T("components/list", {}, { staleTime: 6e4 }), a = T("patterns/list", {}, { staleTime: 6e4 }), { catalog: o } = G();
	return {
		items: A(() => {
			let s = o?.categories ?? [], c = (e) => {
				let t = s.findIndex((t) => t.name === e);
				return t < 0 ? s.length : t;
			}, l = (e) => s.find((t) => t.name === e)?.label ?? Kn(e), u = t.trim().toLowerCase(), d = (e) => e.toLowerCase().includes(u), f = e.filter((e) => n ? n(e) : !e.parent).filter((e) => !u || d(e.title) || d(e.name) || (e.keywords ?? []).some(d)).sort((e, t) => c(e.category) - c(t.category) || (c(e.category) === s.length ? l(e.category).localeCompare(l(t.category)) : 0)), p = (e) => {
				let t = e.title.toLowerCase();
				return t === u ? 0 : t.startsWith(u) ? 1 : d(e.title) ? 2 : 3;
			}, m = (u ? [...f].sort((e, t) => p(e) - p(t)) : f).map((e) => ({
				kind: "block",
				type: e,
				group: u ? w("Blocks") : l(e.category)
			})), h = (t) => {
				let r = e.find((e) => e.name === t);
				return !!r && (n ? n(r) : !r.parent);
			}, g = (r && h("component") ? i.data ?? [] : []).filter((e) => !u || d(e.title) || d(e.category) || d(e.description)).map((e) => ({
				kind: "component",
				component: e,
				group: w("Components")
			})), _ = (r ? a.data ?? [] : []).filter((e) => Xn(e, h) && Zn(e, u)).map((e) => ({
				kind: "pattern",
				pattern: e,
				group: w("Patterns")
			}));
			return [
				...m,
				...g,
				..._
			];
		}, [
			e,
			t,
			i.data,
			a.data,
			n,
			r,
			o
		]),
		loading: r && (i.isLoading || a.isLoading)
	};
}
function $n({ types: e, query: t, onQuery: n, onChoose: r, onClose: i, allowed: a, showSearch: o = !0, className: s, style: c, compact: l, chooseFirst: u, onNoMatch: d, components: f = !0, keyboardDocument: p }) {
	let { items: m, loading: h } = Qn(e, t, a, f), [g, _] = M("blocks"), v = A(() => m.filter((e) => e.kind === "pattern"), [m]), y = f && !l && v.length > 0 && !t.trim(), b = y && g === "patterns" ? v : m, [x, ee] = M(0), S = j(null);
	k(() => ee(0), [t, g]);
	let te = j({
		items: b,
		active: x,
		loading: h
	});
	te.current = {
		items: b,
		active: x,
		loading: h
	};
	let C = j(!!u);
	k(() => {
		if (!C.current) return;
		let e = Un(b.length, h);
		e !== "wait" && (C.current = !1, e === "choose" ? r(b[0]) : d?.());
	}, [b, h]), le(() => {
		let e = (e) => {
			let { items: t, active: n, loading: a } = te.current;
			if (e.key === "ArrowDown") e.preventDefault(), ee((e) => Math.min(t.length - 1, e + 1));
			else if (e.key === "ArrowUp") e.preventDefault(), ee((e) => Math.max(0, e - 1));
			else if (e.key === "Enter") {
				let i = Hn(t.length, n, a);
				i !== "pass" && (e.preventDefault(), e.stopPropagation(), i === "choose" ? r(t[n]) : C.current = !0);
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
		S.current?.querySelector(`[data-index="${x}"]`)?.scrollIntoView({ block: "nearest" });
	}, [x]);
	let T = "";
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
						label: w("Search"),
						icon: "search",
						size: "sm",
						autofocus: !0,
						placeholder: w("Search Blocks")
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
					"aria-label": w("Show"),
					value: g,
					onChange: _,
					options: [{
						value: "blocks",
						label: w("Blocks")
					}, {
						value: "patterns",
						label: w("Patterns")
					}]
				})
			}),
			/* @__PURE__ */ U("div", {
				ref: S,
				className: "min-h-0 flex-1 overflow-y-auto p-1",
				children: [
					b.length === 0 && /* @__PURE__ */ H("div", {
						className: "px-3 py-6 text-center text-xs text-faint",
						children: w("No matching blocks")
					}),
					y && g === "patterns" && b.map((e, t) => {
						if (e.kind !== "pattern") return null;
						let n = e.pattern.category === T ? null : e.pattern.category;
						return T = e.pattern.category, /* @__PURE__ */ U("div", { children: [n && /* @__PURE__ */ H("div", {
							className: "cms-label px-2 pb-1 pt-2",
							children: n
						}), /* @__PURE__ */ H(B, {
							content: e.pattern.description,
							side: "right",
							children: /* @__PURE__ */ U(P, {
								variant: "ghost",
								size: "md",
								"data-index": t,
								onMouseMove: () => t !== x && ee(t),
								onMouseDown: (e) => e.preventDefault(),
								onClick: () => r(e),
								"data-active": t === x || void 0,
								className: "!h-auto w-full !flex-col !items-stretch !gap-1.5 !rounded-sm !p-1.5 text-left",
								children: [/* @__PURE__ */ H(ge, {
									src: Gn(e.pattern.handle),
									maxHeight: 160
								}), /* @__PURE__ */ H("span", {
									className: "min-w-0 truncate px-0.5 text-sm",
									children: e.pattern.title
								})]
							})
						})] }, Yn(e));
					}),
					!(y && g === "patterns") && b.map((e, t) => {
						let n = e.group === T ? null : e.group;
						T = e.group;
						let i = qn(e), a = e.kind === "block" ? e.type.description : e.kind === "component" ? e.component.description || w("Component") : e.pattern.description || e.pattern.category, o = Jn(e);
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
								onMouseMove: () => t !== x && ee(t),
								onMouseDown: (e) => e.preventDefault(),
								onClick: () => r(e),
								"data-active": t === x || void 0,
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
						})] }, Yn(e));
					})
				]
			})
		]
	});
}
// admin/src/core/SaveComponent.tsx
function er(e, t, n = "component") {
	let r = e.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 56) || n, i = r;
	for (let e = 2; t.has(i); e++) i = `${r}-${e}`;
	return i;
}
var tr = [
	"Heroes",
	"Text",
	"Media",
	"Features",
	"People",
	"Lists",
	"Calls to Action",
	"Pages"
];
function nr(e) {
	let t = document.createElement("div");
	document.body.appendChild(t);
	let n = Pe(t);
	n.render(e(() => setTimeout(() => {
		n.unmount(), t.remove();
	}, 250)));
}
function rr(e) {
	return e.selection().map((n) => t(e.get().nodes, n)).filter((e) => !!e);
}
function ir(e) {
	let t = rr(e);
	t.length !== 0 && nr((n) => {
		function r() {
			let [r, i] = M(!0), [a, o] = M({
				title: "",
				category: "",
				description: ""
			}), [s, c] = M(!1), l = () => {
				i(!1), n();
			}, u = async () => {
				let n = a.title.trim();
				if (n) {
					c(!0);
					try {
						let r = await C("components/list"), i = er(n, new Set(r.map((e) => e.handle)));
						await C("components/save", {
							handle: i,
							title: n,
							description: a.description.trim(),
							category: a.category.trim() || void 0,
							blocks: t
						}), b("components/"), e.replaceSelection([{
							id: g(),
							type: "component",
							props: { ref: i }
						}]), Oe.success(w("“{title}” is now a component", { title: n })), l();
					} catch (e) {
						Oe.error(e), c(!1);
					}
				}
			};
			return /* @__PURE__ */ H(ue, {
				open: r,
				onOpenChange: (e) => !e && l(),
				size: "sm",
				title: w("Make a Component"),
				description: ee(t.length, "{count} block, the same on every page", "{count} blocks, the same on every page"),
				onSubmit: () => void u(),
				submitLabel: w("Make Component"),
				submitDisabled: !a.title.trim(),
				busy: s,
				children: /* @__PURE__ */ H(F, {
					fields: [
						{
							handle: "title",
							type: "text",
							label: w("Name"),
							required: !0,
							autofocus: !0,
							max: 120,
							placeholder: w("Pricing Card")
						},
						{
							handle: "category",
							type: "text",
							label: w("Category"),
							max: 60,
							placeholder: w("Components")
						},
						{
							handle: "description",
							type: "text",
							label: w("Description"),
							max: 500,
							placeholder: w("When to Use It")
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
		return /* @__PURE__ */ H(r, {});
	});
}
function ar(e) {
	let t = rr(e);
	t.length !== 0 && nr((e) => {
		function n() {
			let [n, r] = M(!0), [i, a] = M({
				title: "",
				category: "",
				description: ""
			}), [o, s] = M(!1), c = () => {
				r(!1), e();
			}, l = async () => {
				let e = i.title.trim();
				if (e) {
					s(!0);
					try {
						let n = await C("patterns/list", { working: !0 }), r = er(e, new Set(n.map((e) => e.handle)), "pattern");
						await C("patterns/save", {
							handle: r,
							title: e,
							description: i.description.trim(),
							category: i.category.trim() || void 0,
							blocks: t
						}), b("patterns/"), Oe.success(w("Saved “{title}” as a pattern", { title: e })), c();
					} catch (e) {
						Oe.error(e), s(!1);
					}
				}
			};
			return /* @__PURE__ */ H(ue, {
				open: n,
				onOpenChange: (e) => !e && c(),
				size: "sm",
				title: w("Save as Pattern"),
				description: ee(t.length, "{count} block to start from on any page", "{count} blocks to start from on any page"),
				onSubmit: () => void l(),
				submitLabel: w("Save Pattern"),
				submitDisabled: !i.title.trim(),
				busy: o,
				children: /* @__PURE__ */ H(F, {
					fields: [
						{
							handle: "title",
							type: "text",
							label: w("Name"),
							required: !0,
							autofocus: !0,
							max: 120,
							placeholder: w("Hero With Photo")
						},
						{
							handle: "category",
							type: "text",
							label: w("Category"),
							max: 60,
							placeholder: w("Heroes"),
							suggestions: tr
						},
						{
							handle: "description",
							type: "text",
							label: w("Description"),
							max: 500,
							placeholder: w("When to Use It")
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
		return /* @__PURE__ */ H(n, {});
	});
}
// admin/src/core/StartFromPattern.tsx
var or = "Pages";
function sr(e) {
	let t = T("patterns/list", { category: or }, {
		enabled: e,
		staleTime: 6e4
	});
	return e ? t.data ?? [] : [];
}
function cr({ open: e, onOpenChange: t, patterns: n, onChoose: r }) {
	return /* @__PURE__ */ H(ue, {
		open: e,
		onOpenChange: t,
		size: "lg",
		title: w("Start From a Pattern"),
		children: /* @__PURE__ */ H("div", {
			className: "grid gap-4 sm:grid-cols-2",
			children: n.map((e) => /* @__PURE__ */ U(z, {
				onClick: () => r(e),
				className: "block min-w-0 rounded-md p-1 text-left hover:bg-hover",
				children: [
					/* @__PURE__ */ H(ge, {
						src: Gn(e.handle),
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
var lr = 4, ur = 6, dr = 16, fr = (e) => e.left + e.width, pr = (e) => e.top + e.height, mr = (e, t) => t === "x" ? e.left + e.width / 2 : e.top + e.height / 2, hr = (e, t) => t === "x" ? e.left : e.top, gr = (e, t) => t === "x" ? fr(e) : pr(e), _r = (e) => [
	e.left,
	e.top,
	e.width,
	e.height
].every(Number.isFinite) && e.width > 0 && e.height >= 0, vr = (e, t) => t.x >= e.left && t.x <= fr(e) && t.y >= e.top && t.y <= pr(e);
function yr(e, t) {
	return Math.hypot(Math.max(e.left - t.x, 0, t.x - fr(e)), Math.max(e.top - t.y, 0, t.y - pr(e)));
}
function br(e, t) {
	return Math.min(pr(e), pr(t)) - Math.max(e.top, t.top) > 0 && Math.abs(mr(t, "x") - mr(e, "x")) > Math.abs(mr(t, "y") - mr(e, "y")) ? "x" : "y";
}
function xr(e, t, n) {
	let r = Math.min(pr(e), pr(t)) - Math.max(e.top, t.top), i = Math.min(fr(e), fr(t)) - Math.max(e.left, t.left);
	return n === "x" && r > 0 ? "x" : n === "y" && i > 0 ? "y" : br(e, t);
}
function Sr(e, t) {
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
function Cr(e, t) {
	let { byId: n, depth: r, isExcluded: i } = Sr(e, t.excludeIds), a = /* @__PURE__ */ new Map([[null, []]]);
	for (let t of e) {
		if (!_r(t.rect) || !t.container && t.rect.height === 0 || i(t)) continue;
		let e = a.get(t.parentId) ?? [];
		e.push(t), a.set(t.parentId, e), t.container && !a.has(t.id) && a.set(t.id, []);
	}
	let o = [];
	for (let [e, i] of a) {
		let a = e === null ? null : n.get(e), s = e === null ? t.rootRect : a?.rect;
		if (!s || !_r(s)) continue;
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
			let f = Math.sign(i - r), p = Math.min(Math.abs(i - r) / 2, lr), m = l === "from" ? r + f * p : l === "to" ? i - f * p : (r + i) / 2, h = Math.min(r, i), g = Math.abs(i - r), _ = n === "x" ? {
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
				width: Math.max(fr(e), fr(t)) - n,
				height: Math.max(pr(e), pr(t)) - r
			};
		}, m = c[0], h = c.at(-1), g = c.length > 1 ? xr(m.rect, c[1].rect, l) : l ?? "y", _ = c.length > 1 ? xr(c.at(-2).rect, h.rect, l) : l ?? "y", v = c.length < 2 || mr(c[1].rect, g) >= mr(m.rect, g), y = c.length < 2 || mr(h.rect, _) >= mr(c.at(-2).rect, _), b = v ? hr(m.rect, g) : gr(m.rect, g), x = y ? gr(h.rect, _) : hr(h.rect, _);
		f(m.index, g, v ? hr(s, g) : gr(s, g), b, g === "x" ? m.rect : s, m.rect, "edge", "to");
		for (let e = 1; e < c.length; e++) {
			let t = c[e - 1], n = c[e], r = xr(t.rect, n.rect, l), i = mr(n.rect, r) >= mr(t.rect, r), a = i ? gr(t.rect, r) : hr(t.rect, r), o = i ? hr(n.rect, r) : gr(n.rect, r), u = Math.max(t.rect.top, n.rect.top), d = Math.min(pr(t.rect), pr(n.rect)), m = r === "x" ? {
				left: s.left,
				top: u,
				width: s.width,
				height: Math.max(0, d - u)
			} : s, h = i ? o < a : o > a;
			f(n.index, r, h ? (a + o) / 2 : a, h ? (a + o) / 2 : o, m, r === "x" && m.height > 0 ? m : p(t.rect, n.rect), "between");
		}
		f(h.index + 1, _, x, y ? gr(s, _) : hr(s, _), _ === "x" ? h.rect : s, h.rect, "edge", "from");
	}
	return o;
}
function wr(e, t, n) {
	if (![t.x, t.y].every(Number.isFinite)) return null;
	let r = Cr(e, n).flatMap((e) => {
		if (e.inside) return [];
		let n = e.axis === "x", r = n ? t.x : t.y, i = n ? t.y : t.x, a = (n ? e.rect.left : e.rect.top) + 1, o = n ? e.hitRect.left : e.hitRect.top, s = n ? e.hitRect.width : e.hitRect.height, c = Math.max(0, ur - s / 2), l = Math.max(o - c, a - dr), u = Math.min(o + s + c, a + dr), d = n ? e.hitRect.top : e.hitRect.left, f = d + (n ? e.hitRect.height : e.hitRect.width);
		return r >= l && r <= u && i >= d && i <= f ? [{
			target: e,
			distance: Math.abs(r - a)
		}] : [];
	});
	if (!r.length) return null;
	let i = Math.min(...r.map((e) => e.distance));
	return r.filter((e) => e.distance <= i + 2).sort((e, t) => Number(e.target.kind === "edge") - Number(t.target.kind === "edge") || t.target.depth - e.target.depth || e.distance - t.distance)[0].target;
}
function Tr(e, t, n) {
	if (![t.x, t.y].every(Number.isFinite)) return null;
	let { isExcluded: r } = Sr(e, n.excludeIds);
	return e.some((e) => r(e) && vr(e.rect, t)) ? null : Cr(e, n).map((e) => ({
		target: e,
		distance: yr(e.inside ? e.hitRect : e.rect, t)
	})).filter(({ distance: e }) => e <= (n.maxDistance ?? 80)).sort((e, t) => e.distance - t.distance || t.target.depth - e.target.depth)[0]?.target ?? null;
}
// admin/src/core/QuickInserter.tsx
var Er = "cms:blocks:recent", Dr = [
	"paragraph",
	"heading",
	"image",
	"list",
	"button",
	"box"
], Or = 6, kr = 9, Ar = 3;
function jr() {
	try {
		let e = JSON.parse(localStorage.getItem(Er) ?? "[]");
		return Array.isArray(e) ? e.filter((e) => typeof e == "string") : [];
	} catch {
		return [];
	}
}
function Mr(e) {
	if (e.kind === "block") try {
		localStorage.setItem(Er, JSON.stringify([e.type.name, ...jr().filter((t) => t !== e.type.name)].slice(0, 12)));
	} catch {}
}
function Nr({ types: e, allowed: t, onChoose: n, onClose: r }) {
	let [i, a] = M(""), [o, s] = M(!1), [c, l] = M(0), { items: u } = Qn(e, i, t, !!i.trim()), d = A(() => {
		if (i.trim()) return u.slice(0, kr);
		let e = [...jr(), ...Dr], t = (t) => {
			let n = t.kind === "block" ? e.indexOf(t.type.name) : -1;
			return n < 0 ? e.length : n;
		};
		return u.filter((e) => e.kind === "block").sort((e, n) => t(e) - t(n)).slice(0, Or);
	}, [u, i]);
	k(() => l(0), [i]);
	let f = (e) => {
		Mr(e), n(e);
	};
	return o ? /* @__PURE__ */ H("div", {
		"data-cms-insert-menu": !0,
		"data-cms-browse": !0,
		children: /* @__PURE__ */ H($n, {
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
				ArrowDown: Ar,
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
						label: w("Search"),
						icon: "search",
						size: "sm",
						autofocus: !0,
						placeholder: w("Search Blocks")
					}],
					values: { query: i },
					onChange: (e, t) => a(t ?? "")
				})
			}),
			/* @__PURE__ */ U("div", {
				role: "listbox",
				"aria-label": i.trim() ? w("Results") : w("Suggestions"),
				className: "grid grid-cols-3 gap-1 p-2",
				children: [d.map((e, t) => {
					let n = qn(e), r = Jn(e);
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
					}, Yn(e));
				}), !d.length && /* @__PURE__ */ H("div", {
					className: "col-span-3 px-3 py-5 text-center text-xs text-faint",
					children: w("No matching blocks")
				})]
			}),
			/* @__PURE__ */ U(P, {
				variant: "ghost",
				size: "lg",
				onMouseDown: (e) => e.preventDefault(),
				onClick: () => s(!0),
				className: "!h-9 !gap-1.5 !rounded-none border-t border-border !text-sm focus-visible:!-outline-offset-2",
				children: [w("Browse All"), /* @__PURE__ */ H(I, {
					name: "arrow-right",
					size: 14,
					className: "text-muted"
				})]
			})
		]
	});
}
// admin/src/core/canvas.ts
function Pr(e, t) {
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
function Fr(e, t) {
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
var Ir = "/_cms/site/";
function Lr(e, t = location.href) {
	try {
		let n = new URL(e, t);
		return n.origin === location.origin && n.pathname.startsWith(Ir) ? n.pathname : null;
	} catch {
		return null;
	}
}
var Rr = /\bimport\s*(?:[\w$*{}\s,]+?\s*from\s*)?["']([^"']+)["']|\bexport\s*[\w$*{}\s,]*?\s*from\s*["']([^"']+)["']|\bimport\s*\(\s*["']([^"']+)["']\s*\)/g;
async function zr(e, t) {
	let n = {}, r = {}, i = /* @__PURE__ */ new Set(), a = async (e) => {
		if (i.has(e) || i.size > 200) return;
		i.add(e);
		let o = await fetch(e, { credentials: "same-origin" }).then((e) => e.ok ? e.text() : "", () => ""), s = [];
		for (let i of o.matchAll(Rr)) {
			let a = i[1] ?? i[2] ?? i[3], o = /^(\/|\.\/|\.\.\/)/.test(a), c = o ? Lr(a, location.origin + e) : a, l = c ? Lr(t.imports?.[c] ?? (o ? c : "")) : null;
			c && l && (t.imports?.[c] && (n[c] = l), t.integrity?.[l] && (r[l] = t.integrity[l]), s.push(l));
		}
		await Promise.all(s.map(a));
	};
	return await a(e), {
		imports: n,
		...Object.keys(r).length ? { integrity: r } : {}
	};
}
async function Br(e, t) {
	let n;
	try {
		n = JSON.parse(e.querySelector("script[data-cms-importmap]")?.textContent ?? "{}");
	} catch {
		return null;
	}
	let r = await zr(t, n);
	if (!Object.keys(r.imports ?? {}).length) return null;
	let i = document.createElement("script");
	return i.type = "importmap", i.dataset.cmsCanvas = "", i.nonce = document.querySelector("script[nonce]")?.nonce ?? "", i.textContent = JSON.stringify(r), document.head.append(i), i;
}
function Vr(e) {
	try {
		return JSON.parse(e.dataset.cmsCanvas ?? "[]").flatMap((e) => {
			let t = typeof e?.src == "string" ? Lr(e.src) : null;
			return t ? [{
				...e,
				src: t
			}] : [];
		});
	} catch {
		return [];
	}
}
var Hr = (e, t) => console.error("[cms] canvas behavior", e, t);
function Ur() {
	let e = [], t = [];
	async function n(e, n, r) {
		let i = r.defaultView;
		if (i) try {
			let a = await Br(r, n.src);
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
			}, c = o.mount ?? o.default, l = await Pr(i, () => c?.(e.el, n.props ?? {}, s));
			if (e.abort.signal.aborted) {
				typeof l == "function" && l();
				return;
			}
			typeof l == "function" && (e.cleanup = l), e.unpicture = Fr(e.el, i);
		} catch (e) {
			Hr(n.src, e);
		}
	}
	return {
		mount(t) {
			for (let r of t.querySelectorAll("[data-cms-canvas]")) for (let i of Vr(r)) {
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
					Hr(e.module ? "unmount" : "mount", t);
				}
			}
			t.forEach((e) => e.remove()), t = [];
		}
	};
}
// admin/src/core/morph.ts
function Wr(e, t) {
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
function Gr(e) {
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
var Kr = 32, qr = 6, Jr = 4;
function Yr({ target: e, position: t, ...n }) {
	let r = t(e.rect);
	return /* @__PURE__ */ U(je, { children: [/* @__PURE__ */ H("div", {
		"data-cms-insertion-line": !0,
		className: V("pointer-events-none absolute z-raised rounded-full bg-focus", e.axis === "x" ? "cms-block-line-y" : "cms-block-line-x"),
		style: {
			...r,
			minWidth: 2,
			minHeight: 2
		}
	}), /* @__PURE__ */ H(Qr, {
		...n,
		label: w("Insert Block"),
		className: "cms-block-plus absolute size-6 -translate-x-1/2 -translate-y-1/2 rounded-xs bg-signal text-signal-ink shadow-sm",
		style: {
			left: r.left + r.width / 2,
			top: r.top + r.height / 2
		},
		data: { "data-cms-inserter": `${e.parentId ?? ""}:${e.index}` }
	})] });
}
function Xr({ target: e, position: t, ...n }) {
	let r = t(e.hitRect);
	return /* @__PURE__ */ H(Qr, {
		...n,
		label: w("Insert Block"),
		className: "cms-block-chrome absolute size-7 -translate-x-1/2 -translate-y-1/2 rounded-sm border border-border-strong bg-bg text-muted shadow-sm hover:border-focus hover:text-focus",
		style: {
			left: r.left + r.width / 2,
			top: r.top + Math.min(r.height / 2, 40)
		},
		data: { "data-cms-appender": e.parentId ?? "" }
	});
}
function Zr({ target: e, position: t, onWrite: n, onPattern: r, ...i }) {
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
				children: w("Write, or press “/” for blocks")
			}),
			r && /* @__PURE__ */ U(je, { children: [/* @__PURE__ */ H("span", { className: "mx-1 h-4 border-l border-border" }), /* @__PURE__ */ H(z, {
				compact: !0,
				onClick: r,
				className: "cms-focus-ring h-8 rounded-xs px-1 text-sm text-muted hover:text-text",
				children: w("Start From a Pattern")
			})] }),
			/* @__PURE__ */ H(Qr, {
				...i,
				label: w("Insert Block"),
				className: "size-8 rounded-xs text-muted hover:bg-hover hover:text-text"
			})
		]
	});
}
function Qr({ open: e, onOpenChange: t, returnFocus: n, children: r, label: i, className: a, style: o, data: s }) {
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
			"aria-label": e ? w("Close") : i,
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
function $r(e) {
	return [
		{
			label: w("Cut"),
			icon: "scissors",
			shortcut: "mod+x",
			onSelect: e.onCut
		},
		{
			label: w("Copy"),
			icon: "copy",
			shortcut: "mod+c",
			onSelect: e.onCopy
		},
		{
			label: w("Paste"),
			icon: "clipboard",
			shortcut: "mod+v",
			onSelect: e.onPaste
		},
		{
			label: w("Duplicate"),
			icon: "duplicate",
			shortcut: "mod+d",
			onSelect: e.onDuplicate
		},
		{
			separator: !0,
			label: ""
		},
		{
			label: w("Insert Before"),
			icon: "arrow-up",
			shortcut: "alt+mod+t",
			onSelect: () => e.onInsert("before")
		},
		{
			label: w("Insert After"),
			icon: "arrow-down",
			shortcut: "alt+mod+y",
			onSelect: () => e.onInsert("after")
		},
		{
			separator: !0,
			label: ""
		},
		{
			label: w("Move Up"),
			icon: "chevron-up",
			shortcut: "alt+up",
			disabled: !e.canMoveUp,
			onSelect: () => e.onMove(-1)
		},
		{
			label: w("Move Down"),
			icon: "chevron-down",
			shortcut: "alt+down",
			disabled: !e.canMoveDown,
			onSelect: () => e.onMove(1)
		},
		...e.parent ? [{
			label: w("Select {block}", { block: e.parent.label }),
			icon: "arrow-elbow-left-up",
			onSelect: e.onSelectParent
		}] : [],
		...e.onMakeComponent || e.onSavePattern ? [{
			separator: !0,
			label: ""
		}] : [],
		...e.onMakeComponent ? [{
			label: w("Make a Component"),
			icon: "symbol",
			onSelect: e.onMakeComponent
		}] : [],
		...e.onSavePattern ? [{
			label: w("Save as Pattern"),
			icon: "section-copy",
			onSelect: e.onSavePattern
		}] : [],
		{
			separator: !0,
			label: ""
		},
		{
			label: w("Delete"),
			icon: "trash",
			danger: !0,
			shortcut: "backspace",
			onSelect: e.onDelete
		}
	];
}
function ei(e) {
	let { id: t, label: n, icon: r, parent: i, box: a, viewport: o, canMoveUp: s, canMoveDown: c, onSelectParent: l, onDrag: u, onMove: d, covers: f } = e, p = j(null), [m, h] = M(240);
	le(() => {
		p.current && h(p.current.offsetWidth);
	});
	let g = a.top + a.height;
	if (g < 40 || a.top > o.height - Kr || a.left > o.width || a.left + a.width < 0) return null;
	let _ = (e) => Math.max(Jr, Math.min(o.width - m - Jr, e)), v = _(a.left), y = _(a.left + a.width - m), b = a.top - Kr - qr, x = g + qr, ee = Math.max(Jr, a.top + Jr), S = (e) => e >= Jr && e + Kr <= o.height - Jr, { left: te, top: C } = [
		b,
		x,
		ee
	].flatMap((e) => [{
		left: v,
		top: e
	}, {
		left: y,
		top: e
	}]).find((e) => S(e.top) && !f?.({
		...e,
		width: m,
		height: Kr
	})) ?? {
		left: v,
		top: S(b) ? b : ee
	};
	return /* @__PURE__ */ U("div", {
		ref: p,
		"data-cms-block-controls": t,
		role: "toolbar",
		"aria-label": w("Block Actions"),
		className: "cms-block-chrome pointer-events-auto absolute z-bar flex h-8 items-center gap-0.5 rounded-sm border border-border bg-bg pl-0.5 pr-1 shadow-pop",
		style: {
			left: te,
			top: C
		},
		children: [
			/* @__PURE__ */ H(B, {
				content: w("Drag to Reorder"),
				children: /* @__PURE__ */ H(z, {
					compact: !0,
					"aria-label": w("Drag to Reorder"),
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
				label: w("Select {block}", { block: i.label }),
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
				label: w("Move Up"),
				disabled: !s,
				onClick: () => d(-1)
			}),
			/* @__PURE__ */ H(L, {
				size: "xs",
				icon: "chevron-down",
				label: w("Move Down"),
				disabled: !c,
				onClick: () => d(1)
			}),
			/* @__PURE__ */ H("span", { className: "mx-0.5 h-4 border-l border-border" }),
			/* @__PURE__ */ H(de, {
				align: "end",
				trigger: /* @__PURE__ */ H(L, {
					size: "xs",
					icon: "more",
					label: w("More Block Actions")
				}),
				items: $r(e)
			})
		]
	});
}
function ti({ drag: e, position: t }) {
	return /* @__PURE__ */ U(je, { children: [
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
var ni = new EventTarget(), ri = {
	emit(e, t) {
		ni.dispatchEvent(new CustomEvent(e, { detail: t }));
	},
	on(e, t) {
		let n = (e) => t(e.detail);
		return ni.addEventListener(e, n), () => ni.removeEventListener(e, n);
	}
}, ii = ie({
	stops: () => [],
	settings: () => {},
	readOnly: !1
}), ai = () => se(ii);
function oi(e = "") {
	return {
		id: g(),
		type: "paragraph",
		props: { text: e }
	};
}
function si(e, t, n, r) {
	return e.id === t && e.prop === n && (r === void 0 || e.index === r);
}
function ci(e, t, n) {
	e.focus(t.id, n, t.prop, t.index);
}
function li(e, t, n) {
	if (!t) return;
	let r = /* @__PURE__ */ new Set(), i = (e) => {
		r.add(e.id), e.children?.forEach(i);
	};
	i(t);
	let a = n.find((e) => r.has(e.id));
	a ? ci(e, a, "start") : e.select(t.id, !0);
}
function ui(e) {
	let t = e.getElementById("f-title");
	return t ? (t.focus(), t.setSelectionRange(t.value.length, t.value.length), !0) : !1;
}
function di(e, t, n, r, i) {
	if (e.shiftKey || e.metaKey || e.ctrlKey || e.altKey) return !1;
	let a = e.key === "ArrowUp" && On(t) || e.key === "ArrowLeft" && Cn(t), o = e.key === "ArrowDown" && kn(t) || e.key === "ArrowRight" && wn(t);
	if (a) {
		let a = r[i - 1];
		if (a) ci(n, a, "end");
		else if (e.key !== "ArrowUp" || !ui(t.ownerDocument)) return !1;
		return e.preventDefault(), !0;
	}
	if (o) {
		let t = r[i + 1];
		return t ? (e.preventDefault(), ci(n, t, "start"), !0) : !1;
	}
	return !1;
}
// admin/src/write/outline.ts
var fi = [
	"paragraph",
	"heading",
	"quote",
	"callout"
];
function pi(e) {
	return e.kind === "actions" ? e.nodes : [e.node];
}
function mi(e) {
	return pi(e)[0].id;
}
function hi(e, t, n) {
	let r = {
		types: t,
		custom: n
	}, i = [];
	for (let t of e) {
		let e = vi(t, null, !1, r), n = e.kind === "container" || e.kind === "columns", a = i.at(-1);
		!n && a && !a.container ? bi(a.rows, e) : i.push({
			id: t.id,
			label: n && t.label?.trim() || null,
			rows: [e],
			container: n
		});
	}
	return i;
}
function gi(e) {
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
function _i(e) {
	let t = [], n = (e) => {
		for (let r of e) if (t.push(r), r.kind === "columns") for (let e of r.columns) n(e.rows);
		else r.kind === "container" && n(r.rows);
	};
	for (let t of e) n(t.rows);
	return t;
}
function vi(e, t, n, r) {
	let i = n || !!e.hidden, a = {
		parent: t,
		hidden: i
	}, o = r.types.get(e.type), s = r.custom(e.type), c = (e.children?.length ?? 0) > 0;
	return e.type === "columns" && o && !s ? {
		kind: "columns",
		node: e,
		columns: (e.children ?? []).map((e) => ({
			node: e,
			rows: yi(e.children ?? [], e.id, i || !!e.hidden, r)
		})),
		...a
	} : !s && o && !c && (e.type === "button" || e.type === "link") ? {
		kind: "actions",
		nodes: [e],
		...a
	} : o?.children || c ? {
		kind: "container",
		node: e,
		rows: yi(e.children ?? [], e.id, i, r),
		...a
	} : !o || s ? {
		kind: "block",
		node: e,
		...a
	} : fi.includes(e.type) ? {
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
function yi(e, t, n, r) {
	let i = [];
	for (let a of e) bi(i, vi(a, t, n, r));
	return i;
}
function bi(e, t) {
	let n = e.at(-1);
	t.kind === "actions" && n?.kind === "actions" && n.parent === t.parent && n.hidden === t.hidden ? n.nodes.push(...t.nodes) : e.push(t);
}
// admin/src/write/slash.ts
var xi = null, Si = /* @__PURE__ */ new Set();
function Ci(e) {
	return xi?.id === e ? xi : null;
}
function wi(e) {
	JSON.stringify(e) !== JSON.stringify(xi) && (xi = e, Si.forEach((e) => e()));
}
function Ti() {
	return N((e) => (Si.add(e), () => Si.delete(e)), () => xi);
}
function Ei(e, t = 360, n = 300) {
	let r = window.innerHeight - e.bottom - 6 - 8, i = e.top - 6 - 8, a = r >= Math.min(t, 220) || r >= i;
	return {
		left: Math.max(8, Math.min(window.innerWidth - n - 8, e.left - 4)),
		top: a ? e.bottom + 6 : void 0,
		bottom: a ? void 0 : window.innerHeight - e.top + 6,
		maxHeight: Math.max(120, Math.min(t, a ? r : i))
	};
}
function Di(e, t) {
	k(() => {
		if (!e) return;
		let n = (e) => !e.target?.closest?.("[data-cms-slash]") && wi(null), r = t.filter((e) => !!e);
		return r.forEach((e) => e.addEventListener("pointerdown", n, !0)), () => r.forEach((e) => e.removeEventListener("pointerdown", n, !0));
	}, [e, ...t]);
}
// admin/src/write/Text.tsx
var Oi = {
	1: "text-display font-semibold",
	2: "text-3xl font-semibold",
	3: "text-2xl font-semibold",
	4: "text-xl font-semibold",
	5: "text-lg font-semibold",
	6: "text-base font-semibold uppercase tracking-[0.04em] text-muted"
}, ki = "text-lg leading-7", Ai = {
	note: {
		icon: "info",
		className: "bg-surface",
		label: () => w("Note")
	},
	tip: {
		icon: "sparkle",
		className: "bg-success/7",
		label: () => w("Tip")
	},
	warning: {
		icon: "warning",
		className: "bg-warning/9",
		label: () => w("Warning")
	},
	danger: {
		icon: "error",
		className: "bg-danger/7",
		label: () => w("Danger")
	}
};
function ji({ node: e }) {
	if (e.type === "quote") return /* @__PURE__ */ U("blockquote", {
		className: "m-0 border-l-[3px] border-text/80 py-0.5 pl-4",
		children: [/* @__PURE__ */ H(Pi, {
			node: e,
			prop: "text",
			className: "text-lg leading-7",
			placeholder: w("Quote")
		}), /* @__PURE__ */ H(Pi, {
			node: e,
			prop: "cite",
			className: "cms-block-cite mt-1 text-sm text-muted",
			placeholder: w("Attribution"),
			quiet: !0
		})]
	});
	if (e.type === "callout") return /* @__PURE__ */ H(Ni, { node: e });
	if (e.type === "heading") {
		let t = String(e.props.level ?? 2);
		return /* @__PURE__ */ H(Pi, {
			node: e,
			prop: "text",
			tag: `h${t}`,
			className: Oi[t] ?? Oi[2],
			placeholder: w("Heading {level}", { level: t })
		});
	}
	return /* @__PURE__ */ H(Mi, { node: e });
}
function Mi({ node: e }) {
	let { store: t } = W(), n = K(t, (t) => t.nodes.length === 1 && t.nodes[0].id === e.id);
	return /* @__PURE__ */ H(Pi, {
		node: e,
		prop: "text",
		tag: "p",
		className: ki,
		placeholder: w("Write, or press “/” for blocks"),
		quiet: !n
	});
}
function Ni({ node: e }) {
	let { store: t } = W(), { readOnly: n } = ai(), r = Ai[e.props.tone] ?? Ai.note;
	return /* @__PURE__ */ U("div", {
		className: V("flex gap-3 rounded-md px-4 py-3", r.className),
		children: [/* @__PURE__ */ H(de, {
			align: "start",
			trigger: /* @__PURE__ */ H(z, {
				compact: !0,
				disabled: n,
				"aria-label": w("Callout Style"),
				className: "grid h-[27px] w-5 shrink-0 place-items-center rounded-xs text-muted hover:text-text",
				children: /* @__PURE__ */ H(I, {
					name: r.icon,
					size: 17
				})
			}),
			items: Object.entries(Ai).map(([n, r]) => ({
				label: r.label(),
				icon: r.icon,
				checked: n === (e.props.tone ?? "note"),
				onSelect: () => t.updateProps(e.id, { tone: n })
			}))
		}), /* @__PURE__ */ H(Pi, {
			node: e,
			prop: "text",
			className: V(ki, "min-w-0 flex-1"),
			placeholder: w("Write a note")
		})]
	});
}
var Pi = O(function({ node: e, prop: i, tag: s = "div", className: c, placeholder: l, quiet: u }) {
	let { store: d, types: f, allowed: _ } = W(), { stops: v, readOnly: y } = ai(), b = K(d, (t) => t.focus?.id === e.id && (t.focus.prop ?? "text") === i ? t.focus : null), x = String(e.props[i] ?? ""), ee = (t, n) => {
		if (e.type === "paragraph" && i === "text" && S(t, n)) return;
		d.updateProps(e.id, { [i]: t }, `text:${e.id}:${i}`);
		let r = e.type === "paragraph" ? t.replace(/<[^>]+>/g, "").match(/^\/([\w-]*)$/) : null;
		wi(r ? {
			id: e.id,
			query: r[1]
		} : null);
	}, S = (n, i) => {
		let a = n.replace(/&nbsp;/g, " "), o = (n, a, o) => {
			let s = r(d.get().nodes, e.id), c = s?.parentId ? t(d.get().nodes, s.parentId) : null;
			if (!f.has(n) || !p(c, n, f, c ? [] : _)) return !1;
			let l = Math.max(0, En(i) - Nn(o));
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
			let t = oi(), { nodes: n } = d.get(), i = r(n, e.id);
			return d.commit(m(h(n, e.id, (e) => ({
				...e,
				type: "divider",
				props: {}
			})), i?.parentId ?? null, (i?.index ?? n.length) + 1, [t])), d.focus(t.id, "start"), !0;
		}
		return !1;
	}, te = (s, c) => {
		if (s.defaultPrevented) return;
		let l = v(), u = l.findIndex((t) => si(t, e.id, i)), p = l[u], { nodes: y } = d.get();
		if (s.key === "Enter" && !s.shiftKey && !s.metaKey && !s.ctrlKey && !s.altKey) {
			s.preventDefault();
			let t = Ci(e.id);
			if (t && Wn(!0, !!document.querySelector("[data-cms-slash]"))) return wi({
				...t,
				enter: !0
			});
			if (i === "cite") {
				let t = oi(), n = o(y, e.id, "paragraph", f, _);
				if (!n) return;
				d.insert(n.parentId, n.index, [t]), d.focus(t.id, "start");
				return;
			}
			let [a, l] = Dn(c);
			if (n(a) && !n(l)) {
				let t = r(y, e.id);
				if (!t) return;
				d.insert(t.parentId, t.index, [oi()]), d.focus(e.id, "start");
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
			} : oi(l), p = o(y, e.id, "paragraph", f, _);
			if (!p) return;
			d.commit(m(h(y, e.id, (e) => ({
				...e,
				props: {
					...e.props,
					[i]: a
				}
			})), p.parentId, p.index, [u])), d.focus(u.id, "start");
		} else if (s.key === "Backspace" && Cn(c)) {
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
				d.remove(e.id), ci(d, t, "end");
				return;
			}
			if (t.parent === p?.parent && C(t, x)) return;
			ci(d, t, "end");
		} else if (s.key === "Delete" && wn(c) && i === "text") {
			let n = l[u + 1], r = n && n.prop === "text" && n.parent === p?.parent ? t(y, n.id) : null;
			if (!r || !["paragraph", "heading"].includes(r.type)) return;
			s.preventDefault();
			let i = Nn(x);
			d.commit(a(h(y, e.id, (e) => ({
				...e,
				props: {
					...e.props,
					text: x + String(r.props.text ?? "")
				}
			})), r.id)), d.focus(e.id, i);
		} else di(s, c, d, l, u) || s.key === "Escape" && (s.preventDefault(), c.blur(), d.select(e.id, !0));
	}, C = (n, r) => {
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
			})), e.id)), ci(d, n, Nn(s)), !0;
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
		})), e.id)), ci(d, n, Nn(s)), !0;
	};
	return /* @__PURE__ */ H(Rn, {
		tag: s,
		html: x,
		onChange: ee,
		placeholder: l,
		quiet: u,
		className: c,
		focus: b,
		disabled: y,
		onKeyDown: te,
		onFocus: () => d.get().selected !== e.id && d.select(e.id),
		onPaste: (t) => !t.includes("\n") || i !== "text" ? !1 : (import("./paste-DAY3yvxf.js").then((n) => n.pasteMarkdown(d, e, t, f, _)), !0)
	});
});
function Fi({ node: e, renderItem: t }) {
	let { store: i, types: s, allowed: c } = W(), { stops: l, readOnly: u } = ai(), d = Array.isArray(e.props.items) && e.props.items.length ? e.props.items : [""], f = K(i, (t) => t.focus?.id === e.id && t.focus.prop === "items" ? t.focus : null), p = !!e.props.ordered, g = (t, n = `list:${e.id}`) => i.updateProps(e.id, { items: t }, n), _ = (t) => (u, f) => {
		if (u.defaultPrevented) return;
		let { nodes: p } = i.get(), _ = l(), v = _.findIndex((n) => si(n, e.id, "items", t));
		if (u.key === "Enter" && !u.shiftKey && !u.metaKey && !u.ctrlKey) {
			if (u.preventDefault(), n(d[t]) && t === d.length - 1) {
				let t = oi(), n = d.slice(0, -1), r = o(p, e.id, "paragraph", s, c);
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
			let [r, l] = Dn(f);
			g([
				...d.slice(0, t),
				r,
				l,
				...d.slice(t + 1)
			], ""), i.focus(e.id, "start", "items", t + 1);
		} else if (u.key === "Backspace" && Cn(f)) {
			if (u.preventDefault(), t === 0) {
				let t = oi(d[0]), n = r(p, e.id), o = d.slice(1), s = m(p, n?.parentId ?? null, n?.index ?? 0, [t]);
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
			], ""), i.focus(e.id, Nn(d[t - 1]), "items", t - 1);
		} else di(u, f, i, _, v) || u.key === "Escape" && (u.preventDefault(), f.blur(), i.select(e.id, !0));
	}, v = (n, r) => /* @__PURE__ */ H(Rn, {
		html: n,
		className: t ? void 0 : "min-w-0 flex-1 pl-1",
		tag: t ? "span" : "div",
		placeholder: w("List"),
		quiet: !0,
		disabled: u,
		focus: f && (f.index ?? 0) === r ? f : null,
		onChange: (e) => g(d.map((t, n) => n === r ? e : t)),
		onKeyDown: _(r),
		onFocus: () => i.get().selected !== e.id && i.select(e.id)
	});
	return t ? /* @__PURE__ */ H(je, { children: d.map((e, n) => t(n, v(e, n))) }) : /* @__PURE__ */ H("div", {
		className: V(ki, "space-y-0.5"),
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
var Ii = (e, t, n) => e.axis === "x" ? {
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
}, Li = (e) => `${e.parentId ?? ""}:${e.index}:${e.inside ? "inside" : e.axis}`, Ri = "\nhtml{scrollbar-width:thin;scrollbar-color:rgb(127 127 127/.35) transparent}\n[data-cms-document][data-cms-node]{cursor:default}\n.cms-block-text{display:block;min-width:1ch;min-height:1lh;white-space:pre-wrap;overflow-wrap:break-word;outline:none;border-radius:0;font:inherit;color:inherit;line-height:inherit;text-align:inherit;cursor:text}\n.cms-block-text:empty::before{content:attr(data-placeholder);opacity:.4;pointer-events:none}\n.cms-block-text[data-quiet]:empty:not(:focus)::before{content:none}\n[data-cms-prop]{cursor:text}\n.cms-block-text::selection,.cms-block-text ::selection{background:rgb(0 122 255/.2)}\nimg,a{-webkit-user-drag:none}\niframe{pointer-events:none}\n[data-cms-conditional=hidden]:not([data-cms-reveal]){display:none!important}\n[data-cms-editor-empty-root]{visibility:hidden}\n.cms-js [data-cms-appear]{visibility:visible!important}\n", zi = (e, t) => e.left === t.left && e.top === t.top && e.width === t.width && e.height === t.height, Bi = (e, t) => e.length === t.length && e.every((e, n) => zi(e, t[n])) ? e : t, Vi = /* @__PURE__ */ new Set([
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
function Hi(e, t, n) {
	let r = e.elementFromPoint(t, n);
	if (!r || r === e.body || r === e.documentElement) return !1;
	if (Vi.has(r.tagName) || r.closest("svg")) return !0;
	let i = [...r.childNodes].filter((e) => e.nodeType === Node.TEXT_NODE && e.textContent?.trim());
	if (!i.length) return !1;
	let a = e.createRange();
	return i.some((e) => (a.selectNodeContents(e), [...a.getClientRects()].some((e) => t >= e.left - 2 && t <= e.right + 2 && n >= e.top - 2 && n <= e.bottom + 2)));
}
var Ui = 1024, Wi = "cms-blocks:";
function Gi({ collection: e, blueprint: n, entryId: a, content: c, onInspect: d, standalone: m, onTitleChange: h }) {
	let { store: g, types: _, allowed: b, fieldHandle: x, readOnly: S = !1 } = W(), C = Le(), T = K(g, (e) => e.nodes), E = K(g, (e) => e.selected), ne = K(g, Be), re = K(g, (e) => e.blockMode), ie = K(g, (e) => e.hovered), ae = K(g, (e) => e.device), D = w("Page Builder"), O = !S && !!E && re;
	ke("up", w("Select Previous Block"), D, O), ke("down", w("Select Next Block"), D, O), ke("shift+up", w("Select the Block Above Too"), D, O), ke("shift+down", w("Select the Block Below Too"), D, O), ke("alt+up", w("Move Up"), D, O), ke("alt+down", w("Move Down"), D, O), ke("enter", w("Edit Block"), D, O), ke("mod+d", w("Duplicate Block"), D, O), ke("backspace", w("Delete Block"), D, O), ke("escape", w("Deselect"), D, !!E), ke("mod+alt+t", w("Insert Before"), D, !S && !!E), ke("mod+alt+y", w("Insert After"), D, !S && !!E), ke("mod+z", w("Undo"), D, !S), ke("mod+shift+z", w("Redo"), D, !S);
	let se = fn(), ce = j(null), N = j(null), [P, ue] = M(null), F = j(""), [I, L] = M([]), [de, pe] = M(!0), [me, he] = M(null), [ge, _e] = M(0), [R, z] = M({
		width: 1024,
		height: 700,
		scale: 1,
		left: 0
	}), [ye, xe] = M([]), [B, V] = M(null), [Se, we] = M([]), [Te, Ee] = M(null), De = j(0), Oe = j(""), [Ae, Me] = M(!1), [Pe, Fe] = M(!1), Ie = j(!1), G = j(null), ze = A(() => {
		let e = [], t = (n, r) => n.forEach((n, i) => {
			e.push({
				node: n,
				parentId: r,
				index: i
			}), n.children && t(n.children, n.id);
		});
		return t(T, null), e;
	}, [T]), Ve = j(ze);
	Ve.current = ze;
	let [He, Ue] = M(null), [q, J] = M(!1), We = sr(!!e && !!y().collections.find((t) => t.handle === e)?.routable && !S && !m), Ke = j(He);
	Ke.current = He;
	let qe = j(null);
	k(() => {
		He || (qe.current = null);
	}, [He]);
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
	}, $e = () => Ve.current.map(({ node: e, parentId: t, index: n }) => `${t}:${n}:${e.id}:${e.type}:${e.type === "list" ? e.props.items?.length ?? 0 : ""}`).join("|"), et = () => $e() + "#" + Ve.current.map(({ node: e }) => e.class ?? "").join("|"), tt = j(""), nt = j(null), rt = j(Ur());
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
		for (let { node: n } of Ve.current) {
			let r = n.class ?? "", i = ot.current.get(n.id);
			if (ot.current.set(n.id, r), i === void 0 || i === r) continue;
			let a = Ge(r), o = Ge(i).filter((e) => !a.includes(e));
			for (let r of e.querySelectorAll(`[data-cms-document="${F.current}"][data-cms-node="${CSS.escape(n.id)}"],[data-cms-proto-document="${F.current}"][data-cms-proto="${CSS.escape(n.id)}"]`)) r.classList.remove(...o), r.classList.add(...a), t = !0;
		}
		return t;
	}, Y = j({
		content: c,
		onInspect: d,
		readOnly: S,
		layout: R,
		onTitleChange: h
	});
	Y.current = {
		content: c,
		onInspect: d,
		readOnly: S,
		layout: R,
		onTitleChange: h
	};
	let ct = j(null), lt = () => {
		let e = Be(g.get()).map((e) => t(g.get().nodes, e)).filter(Boolean);
		return e.length ? Wi + JSON.stringify(e) : null;
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
		let n = g.get().nodes, r = o(n, Be(g.get()).at(-1), t.map((e) => e.type), _, b);
		r && t.length && (g.insert(r.parentId, r.index, t), g.select(t[0].id, !0), t.length > 1 && g.extendTo(t.at(-1).id));
	}, ft = async () => {
		let e = ct.current;
		try {
			let t = await navigator.clipboard.readText();
			t.startsWith(Wi) && (e = t);
		} catch {}
		e && !Y.current.readOnly && dt(e);
	}, [pt, mt] = M(null), ht = (e, t) => {
		if (Be(g.get()).includes(e)) return mt(t);
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
		if (G.current) return G.current;
		let e = N.current?.contentDocument, t = e?.querySelector(`[data-cms-editor-root="${F.current}"]`);
		if (!e || !t) return null;
		let n = (e) => e.display.includes("flex") && e.flexDirection.startsWith("row") || e.display.includes("grid") && e.gridTemplateColumns.split(" ").length > 1 ? "x" : "y", r = new Map([...e.querySelectorAll(`[data-cms-document="${F.current}"][data-cms-node]`)].map((e) => [e.dataset.cmsNode, e])), i = Ve.current.flatMap(({ node: t, parentId: i, index: a }) => {
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
		}), G.current = {
			blocks: i,
			rootRect: a,
			scroll: {
				x: e.defaultView.scrollX,
				y: e.defaultView.scrollY
			}
		}, G.current;
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
		xe((t) => Bi(t, Be(g.get()).flatMap((t) => {
			let n = gt(e, t);
			return n ? [vt(n)] : [];
		})));
		let t = g.get().hovered, n = t ? gt(e, t) : null;
		if (V((e) => {
			let t = n ? vt(n) : null;
			return e && t && zi(e, t) ? e : t;
		}), Ie.current && !Ke.current) return;
		let r = yt();
		if (!r) return;
		let i = Cr(r.blocks, {
			rootRect: r.rootRect,
			canInsert: Ct()
		});
		we(i), Ue((t) => {
			if (!t) return t;
			let n = qe.current?.key === Li(t) ? qe.current : null, r = n ? gt(e, n.id) : null, a = n ? r ? Ii(t, vt(r), n.side) : t : i.find((e) => Li(e) === Li(t)) ?? t, o = a.inside ? a.hitRect.top : a.rect.top;
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
		let t = e ? Li(e) : "";
		t !== Oe.current && (Oe.current = t, clearTimeout(De.current), Ee(null), e && (De.current = window.setTimeout(() => Ee(e), 80)));
	}, Ot = (e) => {
		let t = Be(g.get()), n = t.length ? r(g.get().nodes, e === "before" ? t[0] : t.at(-1)) : null, i = N.current?.contentDocument;
		if (!n || !i || Y.current.readOnly || !St(n.parentId)) return;
		let a = e === "before" ? n.index : n.index + 1, o = gt(i, e === "before" ? t[0] : t.at(-1)), s = o ? vt(o) : null, c = i.defaultView, l = Y.current.layout.height;
		if (s) {
			let t = e === "before" ? s.top : s.top + s.height;
			(t < 48 || t > l - 160) && c.scrollBy(0, t - l / 3);
		}
		requestAnimationFrame(() => {
			G.current = null;
			let r = yt(), i = o ? vt(o) : null;
			if (!i) return;
			let s = Ii((r && Cr(r.blocks, {
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
			qe.current = {
				key: Li(s),
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
		G.current = null;
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
		stops: () => gi(hi(g.get().nodes, _, () => !1)).filter((e) => I.some((t) => t.id === e.id && t.prop === e.prop && (e.index === void 0 || t.index === e.index))),
		settings: (e) => Y.current.onInspect(e),
		readOnly: S
	}), [
		g,
		_,
		I,
		S
	]), Nt = j(Mt);
	Nt.current = Mt, le(() => {
		G.current = null, jt();
	}, [T, P]), le(() => {
		if (!ce.current) return;
		let e = () => {
			let e = ce.current, t = ae === "tablet" ? Ce.tablet : ae === "phone" ? Math.min(Ce.phone, e.clientWidth) : Math.max(e.clientWidth, Ui);
			g.setCanvasWidth(t);
			let n = Math.min(1, e.clientWidth / t);
			G.current = null, z({
				width: t,
				scale: n,
				height: e.clientHeight / n,
				left: Math.max(0, (e.clientWidth - t * n) / 2)
			});
		};
		e();
		let t = new ResizeObserver(e);
		return t.observe(ce.current), () => t.disconnect();
	}, [ae, g]), k(() => {
		Et();
	}, [
		E,
		ne,
		ie,
		R,
		P,
		Pe
	]), Xe.current = async () => {
		let t = Ye.current;
		t.queued = !1, t.busy = !0;
		let r = Je.current, i = $e(), o = new Map(Ve.current.map(({ node: e }) => [e.id, e.class ?? ""])), s = new AbortController();
		nt.current = s;
		try {
			let { text: l, headers: u } = await te("POST", a ? `/__preview/${a}` : "/__preview", {
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
			if (!d) throw Error(w("The editor could not load its rendering context."));
			let f = new DOMParser().parseFromString(l, "text/html");
			if (!f.querySelector(`[data-cms-editor-root="${d}"]`)) throw Error(w("This template has no content outlet. Choose a template that includes the content field."));
			f.querySelectorAll("script").forEach((e) => {
				e.type === "importmap" && (e.dataset.cmsImportmap = ""), e.type = "text/cms-off", e.removeAttribute("src");
			}), F.current = d;
			let p = N.current?.contentDocument;
			p?.documentElement?.hasAttribute("data-cms-bridge-ready") ? (rt.current.unmount(), Wr(p, f), p.documentElement.setAttribute("data-cms-bridge-ready", ""), tt.current = "", ot.current = o, st(p), at(p), At(p), rt.current.mount(p)) : N.current && (ot.current = o, N.current.srcdoc = f.documentElement.outerHTML), r === Je.current && he(null);
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
		T,
		x,
		m,
		ge
	]), k(() => (Ye.current.alive = !0, Ye.current.queued && Qe(), () => {
		Ye.current.alive = !1, clearTimeout(Ye.current.timer), Ye.current.timer = 0, nt.current?.abort(), cancelAnimationFrame(Tt.current.frame), Tt.current.frame = 0;
	}), []);
	let Pt = (e, t) => {
		let n = l(e, _);
		n.length && !S && bt(t.parentId, n.map((e) => e.type)) && (g.insert(t.parentId, t.index, n), li(g, n[0], gi(hi(g.get().nodes, _, () => !1))), Ue(null), Dt(null));
	}, X = () => {
		if (Y.current.readOnly || !bt(null)) return;
		let e = oi();
		g.insert(null, 0, [e]), g.focus(e.id, "start");
	}, It = () => {
		let e = N.current?.contentDocument;
		return e ? Ve.current.filter(({ node: t }) => {
			let n = gt(e, t.id);
			return !!n && e.defaultView.getComputedStyle(n).display !== "none";
		}).map(({ node: e }) => e.id) : [];
	}, Lt = (e) => {
		if (!e) return;
		g.select(e, !0);
		let t = N.current?.contentDocument;
		(t && gt(t, e))?.scrollIntoView({ block: "nearest" });
	}, Rt = (e) => {
		let n = e.metaKey || e.ctrlKey, r = Be(g.get()), i = g.get().selected;
		if (e.key === "Escape") {
			g.select(null);
			return;
		}
		if (!i || !g.get().blockMode) return;
		let a = It(), o = a.indexOf(g.get().head ?? i);
		if (["ArrowUp", "ArrowDown"].includes(e.key)) {
			e.preventDefault();
			let t = e.key === "ArrowUp";
			e.altKey ? g.nudgeSelection(t ? -1 : 1) : e.shiftKey ? g.extend(t ? -1 : 1) : Lt(a[o + (t ? -1 : 1)]);
		} else if (e.key === "Enter") {
			e.preventDefault();
			let n = t(g.get().nodes, i), r = Nt.current.stops(), a = n ? new Set(s([n]).map((e) => e.node.id)) : /* @__PURE__ */ new Set();
			r.some((e) => a.has(e.id)) ? li(g, n, r) : Y.current.onInspect(i);
		} else if (e.key === "Backspace" || e.key === "Delete") {
			e.preventDefault();
			let n = new Set(r.flatMap((e) => {
				let n = t(g.get().nodes, e);
				return n ? s([n]).map((e) => e.node.id) : [];
			})), i = a.findIndex((e) => n.has(e)), o = a.slice(0, Math.max(0, i)).reverse().find((e) => !n.has(e)) ?? a.slice(i + 1).find((e) => !n.has(e));
			g.removeSelection(), Lt(o);
		} else n && e.key.toLowerCase() === "d" && (e.preventDefault(), g.duplicateSelection());
	}, zt = () => {
		let e = N.current?.contentDocument;
		if (!e || !F.current) return;
		if (!e.querySelector("[data-cms-editor-root]")) {
			pe(!1), he(w("This template has no content outlet. Choose a template that includes the content field."));
			return;
		}
		e.documentElement.setAttribute("data-cms-bridge-ready", ""), tt.current = "";
		let n = e.createElement("style");
		n.dataset.cmsBridge = "", n.textContent = Ri, e.head.appendChild(n), st(e), at(e), ue(e), At(e), pe(!1), rt.current.unmount(), rt.current.mount(e), e.addEventListener("submit", (e) => e.preventDefault(), !0), e.addEventListener("dragstart", (e) => e.preventDefault()), e.addEventListener("focusout", (e) => {
			e.target.isContentEditable && Me(!1), Qe();
		}), e.addEventListener("focusin", (e) => {
			let t = e.target;
			if (!t.isContentEditable) return;
			Me(!0);
			let n = t.closest("[data-cms-instance-node],[data-cms-document][data-cms-node]");
			g.select(n?.dataset.cmsInstanceNode ?? n?.dataset.cmsNode ?? null), g.hover(null);
		}), e.addEventListener("pointermove", (e) => {
			if (Y.current.readOnly || (Ie.current && (e.movementX || e.movementY) && (Ie.current = !1, Fe(!1)), g.hover(_t(e.target)), Ie.current || Ke.current)) return;
			let t = yt();
			Dt(t && wr(t.blocks, {
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
				].includes(n.key) || (Ie.current = !0, Fe(!0), Dt(null)) : Rt(n);
			}
		});
		let r = (e) => g.get().blockMode && !!g.get().selected && !e.target.isContentEditable, i = (e, t) => {
			let n = lt();
			r(e) && e.clipboardData && n && (e.preventDefault(), e.clipboardData.setData("text/plain", n), ct.current = n, t && !Y.current.readOnly && g.removeSelection());
		};
		e.addEventListener("copy", (e) => i(e, !1)), e.addEventListener("cut", (e) => i(e, !0)), e.addEventListener("paste", (e) => {
			let t = e.clipboardData?.getData("text/plain") ?? "";
			r(e) && !Y.current.readOnly && t.startsWith(Wi) && (e.preventDefault(), dt(t));
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
			let t = G.current, n = e.defaultView;
			if (t) {
				let e = n.scrollX - t.scroll.x, r = n.scrollY - t.scroll.y, i = (t) => ({
					...t,
					left: t.left - e,
					top: t.top - r
				});
				G.current = {
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
			Ne(() => {
				Dt(null), wt();
			}), clearTimeout(o), o = window.setTimeout(() => {
				G.current = null, wt();
			}, 150);
		}, { passive: !0 }), e.defaultView?.addEventListener("resize", () => {
			G.current = null, Et();
		}), e.querySelectorAll("img,link[rel=\"stylesheet\"]").forEach((e) => e.addEventListener("load", () => {
			G.current = null, Et();
		}, { once: !0 })), e.fonts.ready.then(() => {
			G.current = null, wt();
		});
	};
	k(() => {
		let e = se.source;
		if (!e) return;
		let t = !0;
		return an(e).then((n) => {
			if (!t) return;
			it.current = {
				build: n.build,
				faces: e.faces
			};
			let r = N.current?.contentDocument;
			r?.documentElement?.hasAttribute("data-cms-bridge-ready") && (at(r), G.current = null, Et());
		}).catch(() => {
			t && (it.current = null);
		}), () => {
			t = !1;
		};
	}, [se.source]), k(() => ri.on("block-menu", ({ node: e, x: t, y: n }) => {
		Y.current.readOnly || ht(e, {
			x: t,
			y: n
		});
	}), []), k(() => ri.on("scroll-to", ({ node: e, top: t }) => {
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
			for (let t of ne) {
				let n = gt(e, t);
				for (; n;) n.dataset.cmsConditional === "hidden" && (n.dataset.cmsReveal = ""), n = n.parentElement;
			}
		}
	}, [ne]);
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
	}, [T]);
	let Vt = K(g, (e) => e.state);
	k(() => {
		let e = N.current?.contentDocument;
		if (e) {
			for (let t of e.querySelectorAll("[data-cms-shown-state]")) t.classList.remove(...(t.dataset.cmsShownState ?? "").split(" ").filter(Boolean)), delete t.dataset.cmsShownState;
			for (let n of ne) {
				let r = t(g.get().nodes, n), i = gt(e, n), a = r && i ? Ft(Ge(r.class ?? ""), Vt) : [];
				i && a.length !== 0 && (i.classList.add(...a), i.dataset.cmsShownState = a.join(" "));
			}
			at(e);
		}
	}, [
		Vt,
		ne,
		T,
		P
	]);
	let Ht = Gr({
		disabled: S,
		frame: N,
		scale: R.scale,
		invalidate: () => {
			G.current = null, wt();
		},
		target: (e, n) => {
			let r = yt();
			if (!r || e.x < r.rootRect.left || e.x > r.rootRect.left + r.rootRect.width || e.y < r.rootRect.top - 12 || e.y > r.rootRect.top + r.rootRect.height + 12) return null;
			let i = n.map((e) => t(g.get().nodes, e));
			if (i.some((e) => !e)) return null;
			let a = i.map((e) => e.type);
			return Tr(r.blocks, e, {
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
		for (let n of [.25, .75]) for (let r = 0; r < 6; r++) if (Hi(t, (e.left + e.width * (r + .5) / 6 - R.left) / R.scale, (e.top + e.height * n) / R.scale)) return !0;
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
		let e = Be(g.get()), n = g.get().nodes, a = g.get().selected, o = e.length ? r(n, e[0]) : null, s = e.length ? r(n, e.at(-1)) : null, c = a ? t(n, a) : null;
		if (!o || !s || !c || !a) return null;
		let l = i(n, o.parentId), u = (e) => ({
			label: Re(e, _, C),
			icon: e.type === "component" ? "symbol" : _.get(e.type)?.icon ?? "square"
		}), p = o.parentId ? t(n, o.parentId) : null, { label: m, icon: h } = u(c);
		return {
			label: e.length > 1 ? ee(e.length, "{count} block", "{count} blocks") : m,
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
			onMakeComponent: c.type !== "component" && v("entries.components.create") && f(g, _, b) ? () => ir(g) : void 0,
			onSavePattern: v("entries.patterns.create") ? () => ar(g) : void 0
		};
	}, qt = pt ? Kt() : null;
	return /* @__PURE__ */ U(ii.Provider, {
		value: Mt,
		children: [q && /* @__PURE__ */ H(cr, {
			open: !0,
			onOpenChange: J,
			patterns: We,
			onChoose: (e) => {
				let t = e.blocks.map((e) => u(e));
				g.insert(null, 0, t), g.select(t[0]?.id ?? null), J(!1);
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
							items: qt ? $r(qt) : []
						}),
						/* @__PURE__ */ H("iframe", {
							ref: N,
							title: w("Live editor"),
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
								!S && !Ht.drag && !Ae && !Pe && !He && ie && B && !ne.includes(ie) && /* @__PURE__ */ H("div", {
									"data-cms-hover": ie,
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
								!S && !Ht.drag && re && E && ye[0] && (() => {
									let e = Kt();
									return e ? /* @__PURE__ */ H(ei, {
										...e,
										id: E,
										box: Gt(ye[0]),
										viewport: {
											width: R.width * R.scale + R.left * 2,
											height: R.height * R.scale
										},
										onDrag: (t) => {
											Ue(null), Ht.start(t, Be(g.get()), e.label);
										},
										covers: Ut
									}) : null;
								})(),
								!S && !Ht.drag && Se.filter((e) => e.inside).map((e) => {
									let n = {
										open: !!He && Li(He) === Li(e),
										onOpenChange: (t) => Ue(t ? e : null),
										returnFocus: kt,
										children: /* @__PURE__ */ H(Nr, {
											types: [..._.values()],
											allowed: (t) => bt(e.parentId, [t.name]),
											onChoose: (t) => Pt(t, e),
											onClose: () => Ue(null)
										})
									};
									if (e.parentId === null) return T.length ? null : /* @__PURE__ */ H(Zr, {
										target: e,
										position: Gt,
										onWrite: bt(null) ? X : void 0,
										onPattern: We.length ? () => J(!0) : void 0,
										...n
									}, "root");
									let r = e.hitRect.top;
									return t(T, e.parentId)?.children?.length || r + e.hitRect.height < 0 || r > R.height || !(n.open || ie === e.parentId || ne.includes(e.parentId)) ? null : /* @__PURE__ */ H(Xr, {
										target: e,
										position: Gt,
										...n
									}, Li(e));
								}),
								!S && !Ht.drag && (() => {
									let e = He && !He.inside ? He : !He && !Pe ? Te : null;
									return e ? /* @__PURE__ */ H(Yr, {
										target: e,
										position: Gt,
										open: He === e,
										onOpenChange: (t) => {
											Ue(t ? e : null), t || Dt(null);
										},
										returnFocus: kt,
										children: /* @__PURE__ */ H(Nr, {
											types: [..._.values()],
											allowed: (t) => bt(e.parentId, [t.name]),
											onChoose: (t) => Pt(t, e),
											onClose: () => Ue(null)
										})
									}, Li(e)) : null;
								})(),
								Ht.drag && /* @__PURE__ */ H(ti, {
									drag: Ht.drag,
									position: Gt
								})
							]
						})
					]
				}),
				P && /* @__PURE__ */ U(je, { children: [
					/* @__PURE__ */ H(Ki, { slots: I }),
					h && /* @__PURE__ */ H(Xi, {
						doc: P,
						content: c,
						onChange: h,
						readOnly: S
					}),
					/* @__PURE__ */ H(Vn, {
						root: P,
						offset: Wt
					}),
					/* @__PURE__ */ H(Yi, {
						doc: P,
						frame: N.current,
						scale: R.scale
					})
				] })
			]
		})]
	});
}
var Ki = O(function({ slots: e }) {
	let { store: t } = W(), n = K(t, (e) => e.nodes), r = new Set(e.filter((e) => !e.instance && e.prop === "items").map((e) => e.id)), i = /* @__PURE__ */ new Map(), a = A(() => new Map(s(n).map(({ node: e }) => [e.id, e])), [n]);
	return /* @__PURE__ */ U(je, { children: [e.filter((e) => e.instance || e.prop !== "items").map((e) => {
		let t = a.get(e.id);
		if (!t) return null;
		let n = `${e.instance ? "instance:" : ""}${e.id}:${e.prop}`, r = i.get(n) ?? 0;
		return i.set(n, r + 1), Me(e.instance ? /* @__PURE__ */ H(qi, {
			node: t,
			slot: e
		}) : [
			"text",
			"cite",
			"caption"
		].includes(e.prop) ? t.type === "paragraph" && e.prop === "text" ? /* @__PURE__ */ H(Pi, {
			node: t,
			prop: "text",
			tag: "span",
			placeholder: w("Write, or press “/” for blocks"),
			quiet: !0
		}) : /* @__PURE__ */ H(Pi, {
			node: t,
			prop: e.prop,
			tag: "span",
			placeholder: e.element.dataset.cmsPlaceholder ?? w("Write something…")
		}) : /* @__PURE__ */ H(Ji, {
			node: t,
			prop: e.prop
		}), e.element, `${n}:${r}`);
	}), [...r].map((t) => {
		let n = a.get(t);
		return n ? /* @__PURE__ */ H(Fi, {
			node: n,
			renderItem: (n, r) => {
				let i = e.find((e) => e.id === t && e.prop === "items" && e.index === n);
				return i ? Me(r, i.element, `${t}:items:${n}`) : null;
			}
		}, t) : null;
	})] });
}), qi = O(function({ node: e, slot: n }) {
	let { store: r, readOnly: i } = W(), a = K(r, (t) => t.focus?.id === e.id && t.focus.prop === `values.${n.prop}` ? t.focus : null), o = String((Object.prototype.hasOwnProperty.call(e.props.values ?? {}, n.prop) ? e.props.values[n.prop] : n.instance.value) ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
	return /* @__PURE__ */ H(Rn, {
		tag: "span",
		html: o,
		focus: a,
		plainText: !0,
		singleLine: n.instance.type === "text",
		disabled: i,
		placeholder: n.element.dataset.cmsPlaceholder ?? w("Write something…"),
		onFocus: () => r.select(e.id),
		onChange: (i, a) => r.updateProps(e.id, { values: {
			...t(r.get().nodes, e.id)?.props.values,
			[n.prop]: a.innerText
		} }, `instance:${e.id}:${n.prop}`),
		onKeyDown: (t, i) => {
			(t.key === "Escape" || t.key === "Enter" && n.instance.type === "text") && (t.preventDefault(), i.blur(), r.select(e.id, !0));
		}
	});
}), Ji = O(function({ node: e, prop: t }) {
	let { store: n, readOnly: r } = W(), i = K(n, (n) => n.focus?.id === e.id && n.focus.prop === t ? n.focus : null), a = String(e.props[t] ?? ""), o = t === "code" ? a.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>") : a;
	return /* @__PURE__ */ H(Rn, {
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
function Yi({ doc: e, frame: n, scale: i }) {
	let s = Ti(), { store: c, types: u, allowed: d } = W(), [f, h] = M(null);
	if (le(() => {
		h(s ? jn(e) : null);
	}, [s, e]), Di(!!s, [document, e]), !s || !f || !t(c.get().nodes, s.id)) return null;
	let g = (e) => {
		let n = l(e, u), i = c.get().nodes, f = r(i, s.id);
		if (!f || !n.length) return;
		let h = f.parentId ? t(i, f.parentId) : null, g = n.every((e) => p(h, e.type, u, h ? [] : d)) ? f : o(i, s.id, n.map((e) => e.type), u, d);
		g && (wi(null), c.commit(m(a(i, s.id), g.parentId, g.index, n)), li(c, n[0], gi(hi(c.get().nodes, u, () => !1))));
	}, _ = n.getBoundingClientRect(), { maxHeight: v, ...y } = Ei({
		left: _.left + f.left * i,
		top: _.top + f.top * i,
		bottom: _.top + f.bottom * i
	});
	return Me(/* @__PURE__ */ H("div", {
		"data-cms-slash": !0,
		className: "cms-pop fixed z-overlay overflow-hidden !p-0",
		style: y,
		children: /* @__PURE__ */ H($n, {
			types: [...u.values()],
			query: s.query,
			showSearch: !1,
			compact: !0,
			style: { maxHeight: v },
			chooseFirst: s.enter,
			keyboardDocument: e,
			onChoose: g,
			onClose: () => wi(null),
			onNoMatch: () => {
				wi(null);
			},
			allowed: (e) => !!o(c.get().nodes, s.id, e.name, u, d)
		})
	}), document.body);
}
function Xi({ doc: e, content: t, onChange: n, readOnly: r }) {
	let i = [...e.querySelectorAll("[data-cms-entry-field=\"title\"]")];
	return /* @__PURE__ */ H(je, { children: i.map((i, a) => {
		let o = t.title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
		return Me(/* @__PURE__ */ H(Rn, {
			tag: "span",
			html: o,
			singleLine: !0,
			disabled: r,
			placeholder: w("Untitled"),
			onChange: (e, t) => n(t.textContent ?? ""),
			onKeyDown: (t, n) => {
				t.key === "Enter" && (t.preventDefault(), n.blur(), e.querySelector("[data-cms-editor-root] [contenteditable=\"true\"]")?.focus());
			}
		}), i, `title:${a}`);
	}) });
}
// admin/src/builder/controls.tsx
var Zi = "w-[88px]", Qi = "cms.inspector.collapsed";
function $i() {
	try {
		let e = JSON.parse(localStorage.getItem(Qi) ?? "{}");
		return e && typeof e == "object" && !Array.isArray(e) ? Object.fromEntries(Object.entries(e).filter(([, e]) => typeof e == "boolean")) : {};
	} catch {
		return {};
	}
}
function ea({ title: e, detail: t, children: n, open: r = !0, actions: i, actionsOpen: a = !0, empty: o, own: s = !0, fields: c, remember: l = !0 }) {
	let [u, d] = M(() => !l || $i()[e] === void 0 ? r : !$i()[e]), f = (t) => {
		if (d(t), l) try {
			localStorage.setItem(Qi, JSON.stringify({
				...$i(),
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
function ta({ children: e, className: t }) {
	return /* @__PURE__ */ H("div", {
		"data-section": "content",
		className: V("space-y-1 border-b border-border px-4 py-3 last:border-b-0", t),
		children: e
	});
}
function na({ title: e, action: t }) {
	return /* @__PURE__ */ U("div", {
		className: "flex h-7 items-center justify-between pt-1",
		children: [/* @__PURE__ */ H("span", {
			className: "text-xs text-muted",
			children: e
		}), t]
	});
}
function ra({ field: e, children: t, htmlFor: n, className: r }) {
	let i = e.status, a = e.reset, o = t ?? e.label, s = V("flex min-h-7 min-w-0 shrink-0 items-center text-left text-xs", Zi, i ? "text-ink" : "text-muted", r), c = /* @__PURE__ */ H("span", {
		className: V("min-w-0 py-0.5 leading-[1.25] [overflow-wrap:anywhere]", i && "-ml-1 rounded-xs px-1 box-decoration-clone", i === "own" ? "bg-focus-soft" : i === "inherited" && "bg-active"),
		children: o
	});
	return i === "own" && a ? /* @__PURE__ */ H(B, {
		content: w("Reset {label}", { label: String(e.label ?? "") }),
		children: /* @__PURE__ */ H(P, {
			variant: "ghost",
			onClick: a,
			className: V(s, "!h-auto !justify-start !whitespace-normal !rounded-xs !bg-transparent !px-0 !text-xs !font-normal !text-ink"),
			children: c
		})
	}) : i === "inherited" ? /* @__PURE__ */ H(B, {
		content: w("Inherited from a larger screen, another state or the component"),
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
function ia(e) {
	if (e.stack === !0 || Ae.includes(e.type) && !e.component) return !0;
	if (e.type !== "select" || e.component || e.display !== "segmented") return !1;
	let t = Object.values(e.options ?? {}).map((e) => typeof e == "string" ? e : e && typeof e == "object" && "label" in e ? String(e.label ?? "") : "").filter(Boolean);
	return t.length > 3 || t.join(" ").length > 20;
}
var aa = (e) => e === "xs" || e === void 0 ? "sm" : e;
function Z({ fields: e, values: t, onChange: n, disabled: r, context: i = {}, className: a, bare: o }) {
	N(S.fields.subscribe, S.fields.version);
	let s = ne();
	return /* @__PURE__ */ H("div", {
		className: V("min-w-0", a ?? "space-y-1"),
		children: e.filter((e) => Te(e, t)).map((e) => {
			let a = s?.fieldTypes.find((t) => t.key === e.type), c = S.fields.get(e.component ?? a?.component ?? e.type) ?? S.fields.get("json");
			if (!c) return null;
			let l = {
				...e,
				size: aa(e.size),
				fit: !0,
				id: we(e, i.path)
			}, u = !o && ia(e), d = /* @__PURE__ */ H(c, {
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
				children: [!o && e.type !== "toggle" && /* @__PURE__ */ H(ra, {
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
var oa = "cms-input h-7 w-full min-w-0 rounded-sm px-2 text-sm placeholder:text-ghost";
function sa({ color: e, dark: t, className: n }) {
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
var ca = D(function({ className: e, children: t, ...n }, r) {
	return /* @__PURE__ */ H(P, {
		ref: r,
		variant: "ghost",
		icon: "plus",
		className: V("w-full !justify-start !gap-1.5 !px-1.5 !text-xs !font-normal !text-muted hover:!text-ink", e),
		...n,
		children: t
	});
});
function la({ onClick: e, label: t = w("Add") }) {
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
function ua({ onClick: e, label: t = w("Remove") }) {
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
function da() {
	return mn().find;
}
function fa(e) {
	let t = mn();
	return (n) => {
		let r = n.trim();
		return !e || !/^[a-z][a-z0-9-]*$/i.test(r) ? null : t.of(e).find((e) => e.name === r)?.ref ?? null;
	};
}
function pa({ token: e, alpha: t, className: n }) {
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
var ma = (e) => V("h-6 min-w-0 rounded-xs px-1.5 text-2xs tabular-nums", e ? "bg-signal text-signal-ink" : "bg-sunken text-text hover:bg-hover");
function ha({ value: e, onPick: t, auto: n }) {
	let { engine: r } = fn(), i = Nt(r, mn().of("spacing")), a = (t) => t === e || t === "0px" && e === "0", o = (e) => /* @__PURE__ */ H(B, {
		content: e.title,
		children: /* @__PURE__ */ H(z, {
			compact: !0,
			onClick: () => t(e.value),
			className: ma(a(e.value)),
			children: e.label
		})
	}, e.value);
	return /* @__PURE__ */ U("div", {
		className: "space-y-2",
		children: [i.scale.length > 0 && /* @__PURE__ */ U("div", { children: [/* @__PURE__ */ H("div", {
			className: "cms-label mb-1",
			children: w("Scale||series of steps")
		}), /* @__PURE__ */ H("div", {
			className: "grid grid-cols-6 gap-1",
			children: i.scale.map(o)
		})] }), (i.named.length > 0 || n) && /* @__PURE__ */ U("div", { children: [/* @__PURE__ */ H("div", {
			className: "cms-label mb-1",
			children: w("Theme")
		}), /* @__PURE__ */ U("div", {
			className: "flex flex-wrap gap-1",
			children: [i.named.map(o), n && /* @__PURE__ */ H(z, {
				compact: !0,
				onClick: () => t("auto"),
				className: ma(e === "auto"),
				children: w("Auto")
			})]
		})] })]
	});
}
function ga({ group: e, value: t, onPick: n, detach: r }) {
	let i = mn(), a = i.of(e), o = i.find(t)?.token.variable ?? null;
	return e === "spacing" ? /* @__PURE__ */ H("div", {
		className: "p-2",
		children: /* @__PURE__ */ H(ha, {
			value: t,
			onPick: n
		})
	}) : /* @__PURE__ */ U("div", { children: [/* @__PURE__ */ H("div", {
		className: "max-h-60 overflow-y-auto",
		children: a.map((t) => /* @__PURE__ */ U(z, {
			compact: !0,
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
		}), w("Detach")]
	})] });
}
function _a({ group: e, value: t, onPick: n, active: r, className: i, trigger: a }) {
	let [o, s] = M(!1), c = mn(), { engine: l } = fn(), u = e;
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
			content: w("Theme Values"),
			children: /* @__PURE__ */ H(z, {
				compact: !0,
				className: V("size-5 shrink-0 place-items-center rounded-xs text-faint hover:bg-hover hover:text-ink", r || o ? "grid text-ink" : "hidden group-hover/value:grid group-focus-within/value:grid [@media(hover:none)]:grid", i),
				"aria-label": w("Theme Values"),
				children: /* @__PURE__ */ H(I, {
					name: "symbol",
					size: 10
				})
			})
		}),
		children: /* @__PURE__ */ H(ga, {
			group: u,
			value: t,
			onPick: d,
			detach: () => d(c.find(t)?.token.value ?? null)
		})
	});
}
// admin/src/builder/fields/controls.tsx
function va(e, t) {
	let n = (e) => Object.entries(e).every(([e, n]) => Array.isArray(n) ? n.includes(t[e]) : t[e] === n), r = e.if, i = e.unless;
	return (!r || n(r)) && !(i && Object.entries(i).every(([e, n]) => Array.isArray(n) ? n.includes(t[e] ?? null) : (t[e] ?? null) === n));
}
function ya({ field: e, ...t }) {
	let n = S.fields.get(e.component ?? e.type) ?? S.fields.get("json");
	return n ? /* @__PURE__ */ H("div", {
		className: V("min-w-0 flex-1", e.className),
		children: /* @__PURE__ */ H(n, {
			field: e,
			...t,
			context: t.context ?? {}
		})
	}) : null;
}
function ba({ className: e, children: t }) {
	return /* @__PURE__ */ H("div", {
		className: V("relative flex min-w-0 flex-1 items-center gap-1", e),
		children: t
	});
}
var xa = /^(-?\d*\.?\d+)([a-z%]*)$/i, Sa = {
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
}, Ca = (e, t, n) => Math.min(n ?? Infinity, Math.max(t ?? -Infinity, e)), wa = (e) => Math.round(e * 1e3) / 1e3;
function Ta(e) {
	return e.field.percent ? /* @__PURE__ */ H(Ea, { ...e }) : /* @__PURE__ */ H(Aa, { ...e });
}
function Ea({ field: e, value: t, onChange: n, ...r }) {
	let i = t == null || t === "" ? null : Number(t), a = (e) => typeof e == "number" ? Math.round(e * 100) : void 0, o = e.slider;
	return /* @__PURE__ */ H(Aa, {
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
function Da(e, t) {
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
var Oa = {
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
function ka(e, t, n) {
	if (typeof CSS > "u") return !0;
	let r = e, i = t.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`);
	return /^-?[a-z]+(-[a-z]+)*$/.test(i) && CSS.supports(i, "inherit") ? CSS.supports(i, r) : (Oa[n] ?? Oa.length).some((e) => CSS.supports(e, r));
}
function Aa({ field: e, value: t, onChange: n, disabled: r, context: i }) {
	let a = da(), o = fa(e.group), [s, c] = M(null), [l, u] = M(null), d = j(null), [f, p] = M(!1), m = t == null || t === "" ? void 0 : String(t), h = e.unit ?? "px", g = e.step ?? 1, _ = e.min, v = e.max, y = e.group, b = e.prefixIcon ? /* @__PURE__ */ H(I, {
		name: e.prefixIcon,
		size: 13
	}) : e.prefix, x = e.slider, ee = e.menu, S = e.action, te = e.keywords ?? [], C = a(m), T = m?.match(xa), E = T ? T[2] || h : m ? "" : l ?? h, ne = h ? e.units ?? Sa[h] ?? [h] : [], re = !m || !!T, ie = (e, t = E) => n(`${wa(Ca(e, _, v))}${t}`), ae = (e) => {
		re && ie((T ? parseFloat(T[1]) : 0) + e);
	}, D = (e, t) => {
		if (r || e.button !== 0 || document.activeElement === e.currentTarget || !re) return;
		e.preventDefault();
		let n = e.clientX, i = T ? parseFloat(T[1]) : 0, a = !1, o = (e) => {
			let t = e.clientX - n;
			!a && Math.abs(t) < 3 || (a = !0, document.body.style.cursor = "ew-resize", ie(i + Math.round(t / 2) * g * (e.shiftKey ? 10 : e.altKey ? .1 : 1)));
		}, s = () => {
			window.removeEventListener("pointermove", o), window.removeEventListener("pointerup", s), document.body.style.cursor = "", !a && t && d.current?.focus();
		};
		window.addEventListener("pointermove", o), window.addEventListener("pointerup", s);
	}, O = (t) => t === "" ? null : o(t) || (/^-?\d*\.?\d+$/.test(t) ? E ? `${t}${E}` : t : te.includes(t) || ka(t, e.property ?? e.handle, h) ? t : void 0), oe = Da(s ?? "", (e) => s === null || O(e.trim()) !== void 0), se = () => {
		if (s === null) return;
		let e = s.trim();
		if (c(null), e === (T ? T[1] : m ?? "")) return;
		let t = O(e);
		t !== void 0 && n(t);
	}, k = (e) => {
		T ? n(`${T[1]}${e}`) : m || u(e);
	};
	return /* @__PURE__ */ U(ba, { children: [
		x && /* @__PURE__ */ H(ya, {
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
			value: T ? parseFloat(T[1]) : null,
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
						onPointerDown: (e) => D(e, !0),
						className: "grid h-full w-6 shrink-0 cursor-ew-resize select-none place-items-center text-xs text-faint hover:text-ink",
						children: b
					}),
					C && s === null ? /* @__PURE__ */ H(_a, {
						group: y ?? C.token.group,
						value: m,
						onPick: n,
						trigger: /* @__PURE__ */ H(z, {
							compact: !0,
							onDoubleClick: () => c(m ?? ""),
							className: V("flex h-full min-w-0 flex-1 items-center pr-1 text-left", b === void 0 && "pl-1"),
							children: /* @__PURE__ */ H(pa, {
								token: C.token,
								alpha: C.alpha,
								className: "text-xs"
							})
						})
					}) : /* @__PURE__ */ H("input", {
						ref: d,
						id: we(e),
						value: s ?? (T ? T[1] : m ?? ""),
						placeholder: e.placeholder,
						disabled: r,
						autoComplete: "off",
						spellCheck: !1,
						onPointerDown: (e) => D(e, !0),
						onChange: (e) => c(e.target.value),
						onFocus: (e) => e.target.select(),
						onBlur: se,
						"aria-invalid": oe.shown || void 0,
						onKeyDown: (e) => {
							e.key === "Enter" && (s !== null && O(s.trim()) === void 0 ? oe.show() : e.target.blur()), e.key === "Escape" && (c(null), requestAnimationFrame(() => d.current?.blur())), (e.key === "ArrowUp" || e.key === "ArrowDown") && re && (e.preventDefault(), c(null), ae((e.key === "ArrowUp" ? 1 : -1) * g * (e.shiftKey ? 10 : e.altKey ? .1 : 1)));
						},
						className: V("h-full min-w-0 flex-1 bg-transparent text-sm tabular-nums text-text outline-none placeholder:text-ghost disabled:text-faint", b === void 0 && "pl-2", re && !r && "cursor-ew-resize focus:cursor-text")
					}),
					(!C || s !== null) && /* @__PURE__ */ U("span", {
						className: "flex shrink-0 items-center gap-px pr-1",
						children: [
							y && /* @__PURE__ */ H(_a, {
								group: y,
								value: m,
								onPick: n
							}),
							E && ne.length > 0 && /* @__PURE__ */ H(de, {
								align: "end",
								trigger: /* @__PURE__ */ H(z, {
									compact: !0,
									disabled: r,
									className: "h-5 min-w-5 rounded-xs px-1 text-2xs text-faint hover:bg-hover hover:text-ink",
									"aria-label": w("Unit"),
									children: E
								}),
								items: [...ne.map((e) => ({
									label: e,
									checked: e === E,
									onSelect: () => k(e)
								})), ...te.length ? [{
									separator: !0,
									label: ""
								}, ...te.map((e) => ({
									label: e,
									checked: m === e,
									onSelect: () => n(e)
								}))] : []]
							}),
							!E && h && te.length > 0 && m && te.includes(m) && /* @__PURE__ */ H(de, {
								align: "end",
								trigger: /* @__PURE__ */ H(z, {
									compact: !0,
									className: "grid size-5 place-items-center rounded-xs text-faint hover:bg-hover hover:text-ink",
									"aria-label": w("Unit"),
									children: /* @__PURE__ */ H(I, {
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
									...te.map((e) => ({
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
		ee && /* @__PURE__ */ H(de, {
			align: "end",
			trigger: /* @__PURE__ */ U(z, {
				compact: !0,
				className: "flex h-7 shrink-0 items-center gap-0.5 rounded-sm px-1.5 text-xs text-muted hover:bg-hover hover:text-ink",
				children: [ee.label, /* @__PURE__ */ H(I, {
					name: "chevron-down",
					size: 10
				})]
			}),
			items: ee.items.map((e) => ({
				label: e.label,
				checked: e.checked,
				onSelect: () => n(e.value)
			}))
		}),
		S && /* @__PURE__ */ H(B, {
			content: S.label,
			children: /* @__PURE__ */ H(z, {
				compact: !0,
				onClick: () => n(S.value),
				className: "grid size-7 shrink-0 place-items-center rounded-sm text-muted hover:bg-hover hover:text-ink",
				"aria-label": S.label,
				children: /* @__PURE__ */ H(I, {
					name: S.icon,
					size: 14
				})
			})
		})
	] });
}
// admin/src/builder/fields/composite.tsx
var ja = {
	2: "grid grid-cols-2",
	3: "grid grid-cols-3",
	4: "grid grid-cols-4"
};
function Ma({ field: e, value: t, onChange: n, disabled: r, context: i }) {
	let a = t ?? {}, o = e.link, [s, c] = M(!o || e.split === !0), l = (s ? e.fields ?? [] : [o]).filter((e) => va(e, a)), u = s ? ja[e.columns] : void 0;
	return /* @__PURE__ */ U(ba, { children: [/* @__PURE__ */ H("div", {
		className: V("min-w-0 flex-1 gap-1", u ?? "flex items-center"),
		children: l.map((e) => /* @__PURE__ */ H(ya, {
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
		content: s ? e.joinLabel ?? w("The same for all") : e.splitLabel ?? w("Each One"),
		children: /* @__PURE__ */ H(z, {
			compact: !0,
			onClick: () => c(!s),
			className: "grid size-7 shrink-0 place-items-center rounded-sm text-muted hover:bg-hover hover:text-ink",
			"aria-label": s ? e.joinLabel ?? w("The same for all") : e.splitLabel ?? w("Each One"),
			children: /* @__PURE__ */ H(I, {
				name: s ? "square" : "radius",
				size: 14
			})
		})
	})] });
}
function Na({ field: e, value: t, onChange: n, disabled: r, context: i }) {
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
				}) : /* @__PURE__ */ H(ya, {
					field: {
						handle: `${e.handle}-${t}`,
						type: o.options ? "select" : "text",
						size: "sm",
						commit: "blur",
						label: w("Name"),
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
				/* @__PURE__ */ H(ya, {
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
				/* @__PURE__ */ H(ua, { onClick: () => n(Object.fromEntries(Object.entries(a).filter(([e]) => e !== t))) })
			]
		}, t))
	});
}
function Pa(e, t) {
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
var Fa = () => [
	{
		path: "entry.author.name",
		label: w("Author"),
		group: w("Page")
	},
	{
		path: "entry.title",
		label: w("Title"),
		group: w("Page")
	},
	{
		path: "entry.url",
		label: w("Link"),
		group: w("Page")
	},
	{
		path: "entry.date|date:F j, Y",
		label: w("Published Date"),
		group: w("Page")
	},
	{
		path: "entry.updated|date:F j, Y",
		label: w("Updated Date"),
		group: w("Page")
	},
	{
		path: "entry.parent.title",
		label: w("Parent Title"),
		group: w("Page")
	},
	{
		path: "entry.prev.url",
		label: w("Previous Page Link"),
		group: w("Page")
	},
	{
		path: "entry.prev.title",
		label: w("Previous Page Title"),
		group: w("Page")
	},
	{
		path: "entry.next.url",
		label: w("Next Page Link"),
		group: w("Page")
	},
	{
		path: "entry.next.title",
		label: w("Next Page Title"),
		group: w("Page")
	}
], Ia = () => [
	{
		path: "site.name",
		label: w("Site Name"),
		group: w("Site")
	},
	{
		path: "site.description",
		label: w("Site Description"),
		group: w("Site")
	},
	{
		path: "site.url",
		label: w("Site URL"),
		group: w("Site")
	},
	{
		path: "© {site.year} {site.name}",
		label: w("Copyright Line"),
		group: w("Site")
	},
	{
		path: "page.uri",
		label: w("Current Path"),
		group: w("Site")
	},
	{
		path: "pagination.prev",
		label: w("Previous Page of a List"),
		group: w("Pagination")
	},
	{
		path: "pagination.next",
		label: w("Next Page of a List"),
		group: w("Pagination")
	},
	{
		path: "{pagination.current} / {pagination.total}",
		label: w("Page x of y"),
		group: w("Pagination")
	}
];
function La(t) {
	let { store: n, doc: r, catalog: i } = W(), a = E(), o = K(n, (n) => e(n.nodes, t.id)), s = T("entries/get", { id: r?.id ?? "" }, {
		enabled: r?.kind === "entry",
		staleTime: 6e4
	}), c = r?.kind === "template" ? r.collections?.length ? r.collections : a.collections.filter((e) => e.routable).map((e) => e.handle).slice(0, 1) : s.data ? [s.data.collection] : [], l = T("collections/get", { handle: c[0] ?? "" }, {
		enabled: !!c[0],
		staleTime: 3e5
	}), u = [];
	for (let e of [...o].reverse()) {
		if (e.type !== "repeat") continue;
		let t = e.props?.as || "item", n = i.sources?.find((t) => t.name === e.props?.source), r = w("{list} item ({name})", {
			list: n?.label ?? w("List"),
			name: t
		});
		for (let [e, i] of Object.entries(n?.item ?? {})) u.push({
			path: `${t}.${e}`,
			label: i,
			group: r
		});
		e.props?.source === "entries" && e.props?.collection && u.push({
			path: `${t}.excerpt`,
			label: w("Excerpt Field"),
			group: r
		}, {
			path: `${t}.cover`,
			label: w("Cover Image Field"),
			group: r
		}), e.props?.source === "list" && u.push({
			path: `{${t}}`,
			label: w("The Item Itself (Text)"),
			group: r
		}), u.push({
			path: "index",
			label: w("Position (1, 2, 3…)"),
			group: r
		}, {
			path: "first",
			label: w("Is First"),
			group: r
		}, {
			path: "last",
			label: w("Is Last"),
			group: r
		});
	}
	if (r?.kind === "component") for (let e of r.props ?? []) u.push({
		path: `props.${e.handle}`,
		label: e.label ?? e.handle,
		group: w("Component Properties")
	});
	u.push(...Fa());
	for (let e of l.data?.fields ?? []) e.type !== "blocks" && u.push({
		path: `entry.${e.handle}${e.type === "date" ? "|date:F j, Y" : ""}`,
		label: e.label,
		group: w("Page Fields")
	});
	u.push(...Ia());
	for (let e of a.globals) u.push({
		path: `globals.${e.handle}.`,
		label: w("{name} (add a field handle)", { name: e.title }),
		group: w("Globals")
	});
	return u;
}
// admin/src/builder/content/ContentPanel.tsx
var Ra = [
	"text",
	"textarea",
	"richtext",
	"markdown"
], za = (e, t) => !e.if || Object.entries(e.if).every(([e, n]) => {
	let r = t[e] ?? null;
	return Array.isArray(n) ? n.includes(r) : r === n;
}), Ba = [
	"aria-label",
	"title",
	"role",
	"lang",
	"rel"
], Va = [
	"active",
	"open",
	"selected",
	"current"
];
function Ha(e, t) {
	let n = e.find((e) => !(e in t));
	if (n) return n;
	let r = 2;
	for (; `${e[0]}-${r}` in t;) r++;
	return `${e[0]}-${r}`;
}
function Ua(e) {
	let t = e.toLowerCase().replace(/[^a-z0-9-]/g, "");
	return (/^[a-z]/.test(t) ? t : `b${t}`).slice(0, 40);
}
function Wa({ field: e, value: t, bound: n, paths: r, onValue: i, onBind: a, extra: o }) {
	let s = e.type === "richtext" && e.inline && e.handle !== "text" && !e.component ? {
		...e,
		component: "blocks-inline-text"
	} : e, c = !n && Ae.includes(s.type) && !s.component, l = !n && ia(s), u = !n && s.type === "toggle", d = n ? {
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
		content: w(n ? "Disconnect from Data" : "Connect to Data"),
		children: /* @__PURE__ */ H(L, {
			icon: "database",
			size: "xs",
			label: w(n ? "Disconnect from Data" : "Connect to Data"),
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
function Ga({ node: e }) {
	let { store: t, types: n } = W(), r = n.get(e.type), i = La(e), a = Ln().filter((t) => t.id !== (e.anchor ?? e.props?.anchor)), o = e.bind ?? {}, s = {
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
	].includes(e.handle))), f = d.some((e) => e.component === "link") && d.some((e) => e.handle === "new_tab"), p = d.filter((e) => !(f && e.handle === "new_tab") && za(e, s)), m = p.filter((e) => !e.advanced), h = p.filter((e) => e.advanced), g = (t) => /* @__PURE__ */ H(Wa, {
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
	return !r && e.type !== "component" ? /* @__PURE__ */ U(ta, { children: [/* @__PURE__ */ H(he, {
		title: w("Its plugin is off"),
		children: w("This block is kept as it is and shows again when its plugin is turned on.")
	}), Object.keys(e.props ?? {}).length > 0 && /* @__PURE__ */ H("pre", {
		"aria-label": w("Settings"),
		className: "m-0 mt-3 overflow-x-auto rounded-md bg-sunken p-3 font-mono text-xs text-muted",
		children: JSON.stringify(e.props, null, 2)
	})] }) : /* @__PURE__ */ U("div", { children: [
		e.type === "component" ? /* @__PURE__ */ H(Ka, {
			node: e,
			paths: i,
			setBind: c,
			anchors: a
		}) : _ ? /* @__PURE__ */ H(qa, { node: e }) : m.length > 0 && /* @__PURE__ */ H(ta, { children: m.map(g) }),
		/* @__PURE__ */ H(ea, {
			title: w("Visibility"),
			open: !!(o.visible || o.hidden || e.hidden),
			empty: !o.visible && !o.hidden && !e.hidden,
			children: /* @__PURE__ */ H(Z, {
				fields: [
					{
						handle: "shown",
						type: "toggle",
						size: "sm",
						label: w("Show on the Site")
					},
					{
						handle: "visible",
						type: "text",
						component: "blocks-bind",
						label: w("Only If"),
						paths: i,
						placeholder: w("Always"),
						status: o.visible ? "own" : void 0,
						reset: () => c("visible", null)
					},
					{
						handle: "hidden",
						type: "text",
						component: "blocks-bind",
						label: w("Hide If"),
						paths: i,
						placeholder: w("Never"),
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
		/* @__PURE__ */ U(ea, {
			title: w("Advanced"),
			open: !1,
			remember: !1,
			empty: !e.anchor && !e.attrs && !(e.type === "component" && e.class) && !e.persist && !Object.keys(o).some((e) => e.startsWith("state:")) && !h.some((t) => e.props?.[t.handle] !== void 0 && e.props?.[t.handle] !== t.default),
			children: [
				_ ? /* @__PURE__ */ H(Ja, { node: e }) : h.map(g),
				/* @__PURE__ */ H(Z, {
					fields: [
						{
							handle: "label",
							type: "text",
							size: "sm",
							commit: "blur",
							label: w("Layer Name"),
							placeholder: r?.title
						},
						...h.some((e) => e.handle === "anchor") && !e.anchor ? [] : [{
							handle: "anchor",
							type: "text",
							size: "sm",
							commit: "blur",
							label: w("Anchor"),
							placeholder: w("None"),
							mono: !0
						}],
						...e.type === "component" ? [{
							handle: "class",
							type: "text",
							size: "sm",
							commit: "blur",
							label: w("Classes"),
							mono: !0
						}] : [],
						...v("site.code") ? [{
							handle: "persist",
							type: "toggle",
							size: "sm",
							label: w("Keep Across Pages")
						}] : []
					],
					values: {
						label: e.label,
						anchor: e.anchor,
						class: e.class,
						persist: !!e.persist
					},
					onChange: (n, r) => {
						if (n === "persist") return t.updateNode(e.id, { persist: r ? e.persist ?? Ua(e.id) : void 0 });
						let i = String(r ?? "");
						t.updateNode(e.id, { [n]: (n === "anchor" ? i.toLowerCase().replace(/[^a-z0-9-]/g, "") : i) || void 0 });
					}
				}),
				/* @__PURE__ */ H(na, {
					title: w("Attributes"),
					action: /* @__PURE__ */ H(la, {
						label: w("Add Attribute"),
						onClick: () => t.updateNode(e.id, { attrs: {
							...e.attrs ?? {},
							[Ha(Ba, e.attrs ?? {})]: ""
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
						label: w("Attributes"),
						key: { lower: !0 },
						item: {
							handle: "value",
							type: "text",
							size: "sm",
							commit: "blur",
							label: w("Value")
						},
						items: Object.fromEntries(Object.keys(e.attrs ?? {}).filter((e) => o[`attr:${e}`]).map((e) => [e, {
							handle: "bind",
							type: "text",
							component: "blocks-bind",
							label: w("Data"),
							paths: i
						}]))
					}],
					values: { attrs: Object.fromEntries(Object.entries(e.attrs ?? {}).map(([e, t]) => [e, o[`attr:${e}`] ?? t])) },
					onChange: (n, r) => {
						let i = e.attrs ?? {}, a = Pa(Object.fromEntries(Object.entries(i).map(([e, t]) => [e, o[`attr:${e}`] ?? t])), r);
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
				/* @__PURE__ */ H(na, {
					title: w("States from Data"),
					action: /* @__PURE__ */ H(la, {
						label: w("Add State from Data"),
						onClick: () => c(`state:${Ha(Va, u)}`, i[0]?.path ?? "item.active")
					})
				}),
				Object.keys(u).length > 0 && /* @__PURE__ */ H(Z, {
					bare: !0,
					fields: [{
						handle: "states",
						type: "json",
						component: "blocks-pairs",
						className: "items-start",
						label: w("States from Data"),
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
							label: w("Data"),
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
function Ka({ node: e, paths: t, setBind: n, anchors: i }) {
	let { store: o } = W(), s = T("components/list", { working: !0 }, { staleTime: 3e4 }), c = s.data?.find((t) => t.handle === e.props?.ref), l = e.props?.values ?? {}, d = e.bind ?? {};
	return /* @__PURE__ */ U(ta, { children: [
		/* @__PURE__ */ H(Z, {
			fields: [{
				handle: "ref",
				type: "select",
				size: "sm",
				label: w("Component"),
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
		(c?.props ?? []).map((r) => /* @__PURE__ */ H(Wa, {
			field: {
				...r,
				placeholder: r.placeholder ?? (Ra.includes(r.type) ? r.label : void 0)
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
				children: w("Edit Component")
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
				children: w("Detach")
			})]
		})
	] });
}
function qa({ node: e }) {
	let { store: t, catalog: n } = W(), r = n.sources?.find((t) => t.name === e.props?.source), i = (n, r) => t.updateProps(e.id, { [n]: r }, `repeat:${e.id}:${n}`);
	return /* @__PURE__ */ U(ta, { children: [
		/* @__PURE__ */ H(Z, {
			fields: [{
				handle: "source",
				type: "select",
				size: "sm",
				label: w("List"),
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
				label: w("When Empty"),
				placeholder: w("Show Nothing")
			}],
			values: { empty: e.props?.empty },
			onChange: (e, t) => i(e, t || void 0)
		})
	] });
}
function Ja({ node: e }) {
	let { store: t } = W(), n = (n, r) => t.updateProps(e.id, { [n]: r }, `repeat:${e.id}:${n}`);
	return /* @__PURE__ */ H(Z, {
		fields: [{
			handle: "tag",
			type: "select",
			size: "sm",
			label: w("HTML Tag"),
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
			label: w("Item Name"),
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
function Ya(e) {
	let { store: t } = W(), { engine: n, breakpoints: r } = fn(), i = K(t, (e) => e.device), a = K(t, (e) => e.canvasWidth), o = K(t, (e) => e.state), s = A(() => on(i, a, r), [
		i,
		a,
		r
	]);
	return A(() => ut(n, Ge(e.class), s, o, (n, r) => t.updateNode(e.id, { class: n.join(" ") || void 0 }, `style:${e.id}:${r ?? ""}`)), [
		n,
		e.class,
		e.id,
		s,
		o,
		t
	]);
}
// admin/src/builder/css.ts
function Xa(e) {
	let t = [], n = 0, r = "";
	for (let i of e.trim()) i === "(" && n++, i === ")" && n--, /\s/.test(i) && n === 0 ? (r && t.push(r), r = "") : r += i;
	return r && t.push(r), t;
}
function Za(e) {
	let t = [], n = 0, r = "";
	for (let i of e) i === "(" && n++, i === ")" && n--, i === "," && n === 0 ? (t.push(r.trim()), r = "") : r += i;
	return r.trim() && t.push(r.trim()), t;
}
function Qa(e) {
	if (e === void 0 || e === "") return null;
	let t = Xa(String(e));
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
function $a(e, t) {
	let n = t.map((t) => e.status(t));
	return n.includes("own") ? "own" : n.includes("inherited") ? "inherited" : void 0;
}
function Q({ s: e, fields: t, bare: n }) {
	let r = t.filter(Boolean), i = {}, a = r.map(({ get: t, set: n, keys: r, markers: a, ...o }) => {
		let s = o.fields, c = a ?? r ?? (s ? s.map((e) => e.handle) : [o.handle]);
		return i[o.handle] = t ? t() : s ? Object.fromEntries(c.map((t) => [t, e.value(t)])) : e.value(o.handle), {
			status: $a(e, c),
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
			let o = to(i[t] ?? {}, n);
			Object.keys(o).length && e.write(o);
		},
		disabled: !e.engine
	});
}
var eo = (e) => e === "none" ? void 0 : e;
function to(e, t) {
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
}), no = (e, t = {}) => ({
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
}), ro = (e, t = {}) => ({
	label: e,
	type: "text",
	component: "blocks-value",
	unit: "",
	placeholder: "0",
	...t
}), io = (e) => ({
	label: e,
	type: "color",
	component: "blocks-color",
	placeholder: w("None")
}), ao = (e, t = "") => ({
	label: e,
	type: "text",
	size: "sm",
	commit: "blur",
	mono: !0,
	placeholder: t
}), oo = [
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
function so() {
	let e = (e, t) => Object.fromEntries(Object.entries(t).map(([t, n]) => [t, {
		group: e,
		field: n
	}]));
	return {
		...e("layout", {
			alignContent: $(w("Align Content"), [
				"normal",
				"start",
				"center",
				"end",
				"space-between",
				"space-around",
				"space-evenly",
				"stretch"
			]),
			placeItems: ao(w("Place Items"), "center"),
			placeContent: ao(w("Place Content"), "center"),
			gridTemplateAreas: ao(w("Grid Areas"), "'a b' 'c c'"),
			gridAutoColumns: ao(w("Auto Columns"), "auto"),
			gridAutoRows: ao(w("Auto Rows"), "auto"),
			columns: ro(w("Columns"), {
				placeholder: w("Auto"),
				min: 1
			}),
			columnRule: ao(w("Column Rule"), "1px solid"),
			boxSizing: $(w("Box Sizing"), ["border-box", "content-box"]),
			float: $(w("Float||CSS property"), [
				"none",
				"left",
				"right"
			]),
			clear: $(w("Clear||CSS property"), [
				"none",
				"left",
				"right",
				"both"
			]),
			containerType: $(w("Container Type"), [
				"normal",
				"inline-size",
				"size"
			])
		}),
		...e("item", {
			justifySelf: $(w("Justify Self"), [
				"auto",
				"start",
				"center",
				"end",
				"stretch"
			]),
			placeSelf: ao(w("Place Self"), "center"),
			gridArea: ao(w("Grid Area"), "a"),
			flexGrow: ro(w("Flex Grow"), { min: 0 }),
			flexShrink: ro(w("Flex Shrink"), {
				placeholder: "1",
				min: 0
			}),
			flexBasis: no(w("Flex Basis"), { placeholder: w("Auto") })
		}),
		...e("position", { inset: no(w("Inset"), { placeholder: w("Auto") }) }),
		...e("size", {
			overflowX: $(w("Overflow X"), [
				"visible",
				"hidden",
				"clip",
				"scroll",
				"auto"
			]),
			overflowY: $(w("Overflow Y"), [
				"visible",
				"hidden",
				"clip",
				"scroll",
				"auto"
			]),
			overscrollBehavior: $(w("Overscroll"), [
				"auto",
				"contain",
				"none"
			]),
			scrollSnapType: $(w("Snap Type"), [
				"none",
				"x mandatory",
				"x proximity",
				"y mandatory",
				"y proximity",
				"both mandatory"
			]),
			scrollSnapAlign: $(w("Snap Align"), [
				"none",
				"start",
				"center",
				"end"
			]),
			scrollMarginTop: no(w("Scroll Margin")),
			scrollPadding: no(w("Scroll Padding")),
			scrollbarWidth: $(w("Scrollbar"), [
				"auto",
				"thin",
				"none"
			])
		}),
		...e("typography", {
			textDecorationColor: io(w("Decoration Color")),
			textDecorationThickness: no(w("Line Thickness"), { placeholder: w("Auto") }),
			textUnderlineOffset: no(w("Underline Offset"), {
				unit: "em",
				units: ["em", "px"],
				step: .05,
				placeholder: w("Auto")
			}),
			whiteSpace: $(w("White Space"), [
				"normal",
				"nowrap",
				"pre",
				"pre-wrap",
				"pre-line",
				"break-spaces"
			]),
			wordBreak: $(w("Word Break"), [
				"normal",
				"break-all",
				"keep-all",
				"break-word"
			]),
			overflowWrap: $(w("Overflow Wrap"), [
				"normal",
				"anywhere",
				"break-word"
			]),
			hyphens: $(w("Hyphens"), [
				"manual",
				"auto",
				"none"
			]),
			textIndent: no(w("Indent"), {
				unit: "em",
				units: [
					"em",
					"px",
					"rem"
				]
			}),
			textOverflow: $(w("Text Overflow"), ["clip", "ellipsis"]),
			fontVariantNumeric: $(w("Numbers"), [
				"normal",
				"tabular-nums",
				"proportional-nums",
				"lining-nums",
				"oldstyle-nums",
				"slashed-zero"
			]),
			fontFeatureSettings: ao(w("Font Features"), "'ss01'"),
			fontVariationSettings: ao(w("Font Variations"), "'wght' 500"),
			listStyleType: $(w("List Style"), [
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
			verticalAlign: $(w("Vertical Align"), [
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
			background: ao(w("Background"), "none"),
			backgroundBlendMode: $(w("Blend Mode"), oo)
		}),
		...e("effects", {
			userSelect: $(w("User Select"), [
				"auto",
				"none",
				"text",
				"all"
			]),
			visibility: $(w("Visibility"), [
				"visible",
				"hidden",
				"collapse"
			]),
			maskImage: ao(w("Mask Image"), "linear-gradient(black, transparent)"),
			accentColor: io(w("Accent Color")),
			fill: io(w("Fill")),
			stroke: io(w("Stroke")),
			strokeWidth: no(w("Stroke Width")),
			content: ao(w("Content"), "''")
		}),
		...e("transform", {
			perspectiveOrigin: ao(w("Vanishing Point"), "center"),
			transformStyle: $(w("Transform Style"), ["flat", "preserve-3d"]),
			backfaceVisibility: $(w("Backface"), ["visible", "hidden"])
		}),
		...e("transition", { willChange: ao(w("Will Change"), "auto") })
	};
}
function co(e, t = so()) {
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
var lo = (e) => /^--[\w-]+$/.test(e) || /^-?[a-z]+(-[a-z]+)*$/.test(e) && typeof CSS < "u" && CSS.supports(e, "inherit");
function uo({ properties: e, labels: t = {}, onPick: n, label: r = w("Add a Property"), custom: i, children: a }) {
	let [o, s] = M(!1), [c, l] = M(""), [u, d] = M(0), f = so(), p = c.trim().toLowerCase(), m = e.map((e) => ({
		property: e,
		label: t[e] ?? String(co(e, f).label)
	})).filter((e) => !p || e.label.toLowerCase().includes(p) || e.property.toLowerCase().includes(p.replace(/[\s-]/g, ""))), h = p.replace(/\s+/g, "-"), g = i && lo(h) && !m.some((e) => e.property.toLowerCase() === h.replace(/-/g, "")) ? [...m, {
		property: h,
		label: h
	}] : m, _ = (e) => {
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
					(e.key === "ArrowDown" || e.key === "ArrowUp") && (e.preventDefault(), d((t) => Math.max(0, Math.min(g.length - 1, t + (e.key === "ArrowDown" ? 1 : -1))))), e.key === "Enter" && (e.preventDefault(), _(g[u]?.property));
				},
				placeholder: w("Search"),
				"aria-label": w("Search"),
				className: "h-full min-w-0 flex-1 bg-transparent text-sm text-text outline-none"
			})]
		}), /* @__PURE__ */ U("div", {
			role: "listbox",
			"aria-label": r,
			className: "max-h-64 overflow-y-auto overscroll-contain p-1",
			children: [g.length === 0 && /* @__PURE__ */ H("p", {
				className: "m-0 px-2 py-3 text-sm text-muted",
				children: w("No matches")
			}), g.map((e, t) => /* @__PURE__ */ H(P, {
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
var fo = (e, t = so()) => [...e].sort((e, n) => String(co(e, t).label).localeCompare(String(co(n, t).label))), po = {
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
}, mo = (e, t) => e.own().some((e) => po[t]?.test(e));
function ho({ s: e, group: t, title: n, open: r, empty: i, children: a }) {
	let [o, s] = M(null), c = so(), l = Object.keys(c).filter((e) => c[e].group === t), u = l.filter((t) => e.value(t) !== void 0 || t === o);
	return /* @__PURE__ */ U(ea, {
		title: n,
		open: r,
		empty: i && u.length === 0,
		own: mo(e, t),
		fields: !0,
		actions: /* @__PURE__ */ H(uo, {
			properties: fo(l.filter((e) => !u.includes(e)), c),
			onPick: s
		}),
		children: [a, u.length > 0 && /* @__PURE__ */ H(Q, {
			s: e,
			fields: u.map((t) => ({
				...co(t, c),
				set: (n) => {
					t === o && s(null), e.set(t, n);
				}
			}))
		})]
	});
}
var go = (e) => e.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`);
function _o({ s: e }) {
	let [t, n] = M(null), r = so(), i = /* @__PURE__ */ new Set([
		...Object.keys(r).map(go),
		"clip-path",
		"-webkit-text-stroke"
	]), a = [...new Set(e.classes.flatMap((e) => q(e).utility.match(/^!?\[([\w-]+):/)?.[1] ?? []))].filter((t) => !i.has(t) && e.value(t) !== void 0), o = t && !a.includes(t) ? [...a, t] : a;
	return /* @__PURE__ */ H(ea, {
		title: w("Other Properties"),
		open: o.length > 0,
		empty: o.length === 0,
		actions: /* @__PURE__ */ H(uo, {
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
var vo = [
	"borderTopLeftRadius",
	"borderTopRightRadius",
	"borderBottomRightRadius",
	"borderBottomLeftRadius"
], yo = {
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
}, bo = "--tw-border-style", xo = "--tw-outline-style", So = "--tw-ring-shadow", Co = () => [
	{
		value: "solid",
		label: w("Solid")
	},
	{
		value: "dashed",
		label: w("Dashed")
	},
	{
		value: "dotted",
		label: w("Dotted")
	},
	{
		value: "double",
		label: w("Double")
	},
	{
		value: "none",
		label: w("None")
	}
], wo = (e) => e?.match(/0 0 0 calc\(([\d.]+px) \+/)?.[1];
function To({ s: e }) {
	let t = Object.keys(yo), [n, r] = M(() => t.find((t) => t !== "all" && e.value(yo[t].width)) ?? "all"), i = yo[n], a = {
		width: e.value(i.width),
		style: e.value(bo),
		color: e.value(i.color)
	}, o = vo.map((t) => e.value(t)), s = (t) => e.value(vo[t]) ?? Qa(e.value("borderRadius"))?.[t], c = {
		width: e.value("outlineWidth"),
		style: e.value(xo),
		color: e.value("outlineColor")
	}, l = {
		width: wo(e.value(So)),
		color: e.value("--tw-ring-color")
	}, u = t.some((t) => e.value(yo[t].width) || e.value(yo[t].color)) || a.style || e.value("borderRadius") || o.some(Boolean) || c.width || c.style || l.width, d = (t) => $a(e, [yo[t].width, yo[t].color]), f = (t, n, r) => n && e.engine ? ft(e.engine, t, n, r) : null, p = (e, t, n) => ({
		value: e,
		icon: t,
		title: d(e) ? `${n} · ${d(e) === "own" ? w("set") : w("inherited")}` : n
	});
	return /* @__PURE__ */ U(ea, {
		title: w("Border"),
		empty: !u,
		own: mo(e, "border"),
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
					label: w("Sides"),
					keys: [],
					get: () => n,
					set: (e) => e && r(e),
					options: [
						p("all", "b-side-all", w("All Sides")),
						p("top", "b-side-top", w("Top")),
						p("right", "b-side-right", w("Right")),
						p("bottom", "b-side-bottom", w("Bottom")),
						p("left", "b-side-left", w("Left"))
					]
				},
				{
					handle: "line",
					type: "group",
					component: "blocks-group",
					label: w("Width"),
					markers: [i.width, bo],
					get: () => ({
						width: a.width,
						style: a.style
					}),
					set: (t) => {
						let n = to({
							width: a.width,
							style: a.style
						}, t);
						"width" in n ? e.swap(i.width, f(i.root, n.width, "px")) : "style" in n && e.swap(bo, n.style ? `border-${n.style}` : null);
					},
					fields: [{
						handle: "width",
						type: "text",
						component: "blocks-value",
						label: w("Width"),
						placeholder: "0",
						min: 0,
						prefixIcon: "square"
					}, {
						handle: "style",
						type: "select",
						size: "sm",
						label: w("Style"),
						options: Co(),
						placeholder: w("Solid")
					}]
				},
				{
					handle: "lineColor",
					type: "color",
					component: "blocks-color",
					label: w("Color"),
					placeholder: w("Text Color"),
					markers: [i.color],
					get: () => a.color,
					set: (t) => e.swap(i.color, f(i.root, t, "number"))
				},
				{
					handle: "radius",
					type: "group",
					component: "blocks-group",
					label: w("Radius"),
					status: e.status("borderRadius") === "own" || vo.some((t) => e.status(t) === "own") ? "own" : eo(e.status("borderRadius")),
					keys: ["borderRadius", ...vo],
					columns: 2,
					split: o.some(Boolean),
					splitLabel: w("Each Corner"),
					joinLabel: w("Same radius for every corner"),
					link: {
						handle: "borderRadius",
						type: "text",
						component: "blocks-value",
						label: w("Radius"),
						group: "radius",
						prefixIcon: "frame",
						placeholder: "0",
						min: 0
					},
					fields: vo.map((e, t) => ({
						handle: e,
						type: "text",
						component: "blocks-value",
						label: [
							w("Top Left"),
							w("Top Right"),
							w("Bottom Right"),
							w("Bottom Left")
						][t],
						title: [
							w("Top Left"),
							w("Top Right"),
							w("Bottom Right"),
							w("Bottom Left")
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
						...Object.fromEntries(vo.map((e, t) => [e, s(t)]))
					}),
					set: (t) => {
						if (t.borderRadius !== e.value("borderRadius")) return e.set("borderRadius", t.borderRadius);
						e.write({
							borderRadius: null,
							...Object.fromEntries(vo.map((e) => [e, t[e] ?? null]))
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
						label: w("Outline"),
						markers: ["outline-width", xo],
						get: () => ({
							width: c.width,
							style: c.style
						}),
						set: (t) => {
							let n = to({
								width: c.width,
								style: c.style
							}, t);
							"width" in n ? e.swap("outline-width", f("outline", n.width, "px")) : "style" in n && e.swap(xo, n.style ? n.style === "solid" ? "outline-solid" : `outline-${n.style}` : null);
						},
						fields: [{
							handle: "width",
							type: "text",
							component: "blocks-value",
							label: w("Width"),
							placeholder: "0",
							min: 0,
							prefixIcon: "selection"
						}, {
							handle: "style",
							type: "select",
							size: "sm",
							label: w("Style"),
							options: Co(),
							placeholder: w("Solid")
						}]
					},
					c.width || c.style ? {
						handle: "outlineColor",
						type: "color",
						component: "blocks-color",
						label: w("Outline Color"),
						placeholder: w("Text Color"),
						markers: ["outline-color"],
						get: () => c.color,
						set: (t) => e.swap("outline-color", f("outline", t, "number"))
					} : null,
					c.width || c.style || e.value("outlineOffset") ? {
						handle: "outlineOffset",
						type: "text",
						component: "blocks-value",
						label: w("Offset"),
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
						label: w("Ring"),
						placeholder: "0",
						min: 0,
						prefixIcon: "circle",
						markers: [So],
						get: () => l.width,
						set: (t) => e.swap(So, f("ring", t, "px"))
					},
					l.width ? {
						handle: "ringColor",
						type: "color",
						component: "blocks-color",
						label: w("Ring Color"),
						placeholder: w("Text Color"),
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
var Eo = [
	{
		name: "blur",
		label: () => w("Blur"),
		unit: "px",
		initial: "8px",
		step: 1,
		min: 0,
		icon: "shadow"
	},
	{
		name: "brightness",
		label: () => w("Brightness"),
		unit: "%",
		initial: "100%",
		step: 5,
		min: 0,
		icon: "sun"
	},
	{
		name: "contrast",
		label: () => w("Contrast"),
		unit: "%",
		initial: "100%",
		step: 5,
		min: 0,
		icon: "opacity"
	},
	{
		name: "saturate",
		label: () => w("Saturation"),
		unit: "%",
		initial: "100%",
		step: 5,
		min: 0,
		icon: "drop-half"
	},
	{
		name: "grayscale",
		label: () => w("Grayscale"),
		unit: "%",
		initial: "100%",
		step: 5,
		min: 0,
		max: 100,
		icon: "opacity"
	},
	{
		name: "hue-rotate",
		label: () => w("Hue"),
		unit: "deg",
		initial: "90deg",
		step: 1,
		icon: "refresh"
	},
	{
		name: "invert",
		label: () => w("Invert"),
		unit: "%",
		initial: "100%",
		step: 5,
		min: 0,
		max: 100,
		icon: "opacity"
	},
	{
		name: "sepia",
		label: () => w("Sepia"),
		unit: "%",
		initial: "100%",
		step: 5,
		min: 0,
		max: 100,
		icon: "theme"
	}
];
function Do(e) {
	return !e || e === "none" ? [] : Xa(e).map((e) => {
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
var Oo = (e) => e.length ? e.map((e) => Eo.some((t) => t.name === e.name) || e.value ? `${e.name}(${e.value})` : e.name).join(" ") : null;
function ko({ field: e, value: t, onChange: n, context: r, disabled: i }) {
	let a = Do(t), o = Eo.filter((e) => !a.some((t) => t.name === e.name)), s = (e) => n(Oo(e));
	return /* @__PURE__ */ U("div", {
		className: "min-w-0 flex-1",
		children: [/* @__PURE__ */ U("div", {
			className: "flex h-7 items-center gap-2",
			children: [
				/* @__PURE__ */ H(ra, {
					field: e,
					className: a.length ? "!w-auto" : void 0
				}),
				/* @__PURE__ */ H("span", { className: "min-w-0 flex-1" }),
				o.length > 0 && /* @__PURE__ */ H(de, {
					align: "end",
					trigger: /* @__PURE__ */ H(B, {
						content: w("Add a Filter"),
						children: /* @__PURE__ */ H(z, {
							compact: !0,
							disabled: i,
							className: "grid size-6 shrink-0 place-items-center rounded-sm text-muted hover:bg-hover hover:text-ink",
							"aria-label": w("Add a Filter"),
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
				let o = Eo.find((e) => e.name === t.name), c = o ? {
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
						/* @__PURE__ */ H(ya, {
							field: c,
							value: o?.unit === "%" && /^[\d.]+$/.test(t.value) ? `${Math.round(parseFloat(t.value) * 1e3) / 10}%` : t.value || null,
							onChange: (e) => s(a.map((t, r) => r === n ? {
								...t,
								value: String(e ?? o?.initial ?? "")
							} : t)),
							disabled: i,
							context: r
						}),
						/* @__PURE__ */ H(ua, {
							label: w("Remove Filter"),
							onClick: () => s(a.filter((e, t) => t !== n))
						})
					]
				}, t.name + n);
			})
		})]
	});
}
// admin/src/builder/design/Effects.tsx
var Ao = [
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
], jo = [
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
], Mo = {
	blur: "px",
	brightness: "percent",
	contrast: "percent",
	saturate: "percent",
	grayscale: "percent",
	"hue-rotate": "deg",
	invert: "percent",
	sepia: "percent"
}, No = (e) => e.trim().replace(/\s+/g, " ");
function Po(e, t, n) {
	for (let [r, i] of e.ds.theme.entries()) if (r.startsWith("--blur-") && i.value === n) return e.make(t, r.slice(7));
	return e.make(t, n);
}
function Fo(e, t) {
	let n = (e) => `--tw-${t}${e}`, r = Object.keys(Mo), i = r.flatMap((t) => {
		let r = lt(e.value(n(t)));
		return r === void 0 ? [] : [`${t}(${e.engine ? e.engine.resolve(r) : r})`];
	}).join(" ");
	return {
		value: i || void 0,
		set: (a) => {
			let o = e.engine;
			if (!o) return;
			let s = new Map(Do(i).map((e) => [e.name, e.value])), c = new Map(Do(a).map((e) => [e.name, e.value]));
			e.edit((e) => {
				for (let i of r) {
					if (s.get(i) === c.get(i)) continue;
					let r = c.get(i), a = `${t}${i}`;
					e.swap(n(i), r === void 0 ? null : i === "blur" ? Po(o, a, r) : ft(o, a, r, Mo[i]));
				}
			}, `${t}filter`);
		},
		markers: r.map(n)
	};
}
function Io({ s: e }) {
	let t = mn(), n = Fo(e, ""), r = Fo(e, "backdrop-"), i = e.value("--tw-shadow"), a = i && (t.of("shadow").find((e) => No(e.value) === No(i))?.ref ?? i), o = e.value("opacity"), s = [
		"opacity",
		"--tw-shadow",
		"mixBlendMode",
		"cursor",
		"pointerEvents",
		"clipPath"
	].some((t) => e.value(t)) || n.value || r.value;
	return /* @__PURE__ */ U(ho, {
		s: e,
		group: "effects",
		title: w("Effects"),
		empty: !s,
		children: [
			/* @__PURE__ */ H(Q, {
				s: e,
				fields: [{
					handle: "opacity",
					type: "text",
					component: "blocks-value",
					label: w("Opacity"),
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
					set: (t) => e.swap("opacity", t == null || t === "" || !e.engine ? null : ft(e.engine, "opacity", `${Math.round(Number(t) * 100)}%`, "percent"))
				}]
			}),
			/* @__PURE__ */ H(Q, {
				s: e,
				bare: !0,
				fields: [{
					handle: "boxShadow",
					type: "text",
					component: "blocks-shadows",
					label: w("Shadows"),
					group: "shadow",
					markers: ["--tw-shadow"],
					get: () => a,
					set: (t) => e.swap("--tw-shadow", t && e.engine ? ft(e.engine, "shadow", t, "number") : null)
				}]
			}),
			/* @__PURE__ */ H(Q, {
				s: e,
				bare: !0,
				fields: [{
					handle: "filter",
					type: "text",
					component: "blocks-filters",
					label: w("Filters"),
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
					label: w("Backdrop"),
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
						label: w("Clip Path"),
						className: "items-start py-0.5 [&>label]:leading-6"
					},
					{
						handle: "mixBlendMode",
						type: "select",
						size: "sm",
						label: w("Blending"),
						placeholder: w("Normal"),
						options: Ao
					},
					{
						handle: "cursor",
						type: "select",
						size: "sm",
						label: w("Cursor"),
						placeholder: w("Auto"),
						options: jo
					},
					{
						handle: "pointerEvents",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: w("Clicks"),
						placeholder: "auto",
						options: [{
							value: "auto",
							label: w("On")
						}, {
							value: "none",
							label: w("Pass Through")
						}]
					}
				]
			})
		]
	});
}
// admin/src/builder/color.tsx
function Lo(e) {
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
	} : zo(t);
}
var Ro;
function zo(e) {
	if (typeof document > "u" || typeof CSS > "u" || !CSS.supports("color", e) || /var\(|light-dark\(/.test(e) || (Ro ??= document.createElement("canvas").getContext("2d", { willReadFrequently: !0 }), !Ro)) return null;
	Ro.clearRect(0, 0, 1, 1), Ro.fillStyle = "black", Ro.fillStyle = e, Ro.fillRect(0, 0, 1, 1);
	let [t, n, r, i] = Ro.getImageData(0, 0, 1, 1).data;
	return {
		r: t,
		g: n,
		b: r,
		a: Math.round(i / 255 * 100) / 100
	};
}
function Bo({ r: e, g: t, b: n, a: r }) {
	let i = (e) => Math.round(e).toString(16).padStart(2, "0");
	return r >= 1 ? `#${i(e)}${i(t)}${i(n)}` : `rgb(${Math.round(e)} ${Math.round(t)} ${Math.round(n)} / ${Math.round(r * 100)}%)`;
}
function Vo({ r: e, g: t, b: n }) {
	e /= 255, t /= 255, n /= 255;
	let r = Math.max(e, t, n), i = r - Math.min(e, t, n);
	return {
		h: ((i === 0 ? 0 : r === e ? (t - n) / i % 6 : r === t ? (n - e) / i + 2 : (e - t) / i + 4) * 60 + 360) % 360,
		s: r === 0 ? 0 : i / r,
		v: r
	};
}
function Ho(e, t, n, r) {
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
function Uo(e, t) {
	return t >= 100 ? `var(${e})` : `color-mix(in oklab, var(${e}) ${Math.round(t)}%, transparent)`;
}
function Wo(e) {
	return typeof CSS < "u" && CSS.supports("color", e);
}
function Go() {
	let e = mn();
	return (t) => t ? e.resolve(t) : "transparent";
}
function Ko({ field: e, value: t, onChange: n, disabled: r }) {
	let [i, a] = M(!1), o = Go(), s = da(), c = t ?? void 0, l = s(c);
	return /* @__PURE__ */ H(ba, { children: /* @__PURE__ */ H(R, {
		open: i,
		onOpenChange: a,
		align: "end",
		className: "!p-0",
		trigger: /* @__PURE__ */ U(z, {
			compact: !0,
			id: we(e),
			disabled: r,
			className: V(oa, "flex items-center gap-1.5 pl-1 text-left"),
			children: [/* @__PURE__ */ H(sa, {
				color: c === void 0 && typeof e.swatch == "string" ? e.swatch : o(c),
				className: "!size-4"
			}), l ? /* @__PURE__ */ H(pa, {
				token: l.token,
				alpha: l.alpha
			}) : /* @__PURE__ */ H("span", {
				className: V("truncate font-mono", !c && "font-sans text-faint"),
				children: c ?? e.placeholder ?? w("None")
			})]
		}),
		children: /* @__PURE__ */ H(Yo, {
			label: e.label || w("Color"),
			value: c,
			onChange: n
		})
	}) });
}
var qo = (e) => {
	let t = Lo(e);
	return !!t && (.299 * t.r + .587 * t.g + .114 * t.b) / 255 > .62;
}, Jo = "pointer-events-none absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-pop ring-1 ring-black/20";
function Yo({ label: e, value: t, onChange: n, clearable: r = !0 }) {
	let i = mn(), a = i.of("color"), o = A(() => At(a), [a]), s = i.find(t), c = s?.token.variable ?? null, l = !!c && o.families.some((e) => e.shades.some((e) => e.variable === c)), u = s ? s.alpha === void 0 ? 1 : Number(s.alpha) / 100 : 1, d = Lo(s ? jt(i.resolve(s.token.ref)).light : t) ?? {
		r: 0,
		g: 0,
		b: 0,
		a: 1
	}, [f, p] = M(() => ({
		...Vo(d),
		a: s ? u : d.a
	})), [m, h] = M(t ?? ""), g = Da(m, (e) => !e.trim() || Wo(e.trim())), _ = [
		...o.own.length ? [{
			value: "theme",
			label: w("Theme")
		}] : [],
		...o.families.length ? [{
			value: "palette",
			label: w("Palette")
		}] : [],
		{
			value: "custom",
			label: w("Custom")
		}
	], [v, y] = M(() => t && !s ? "custom" : l ? "palette" : _[0].value);
	k(() => h(t ?? ""), [t]);
	let [b, x] = M(""), ee = b.trim().toLowerCase().split(/[\s-]+/).filter(Boolean), S = (e) => ee.every((t) => e.toLowerCase().includes(t)), te = o.own.filter((e) => S(e.name)), C = o.families.flatMap((e) => e.shades).filter((e) => S(e.name)), T = (e, t, r, i) => {
		p({
			h: e,
			s: t,
			v: r,
			a: i
		}), n(Bo(Ho(e, t, r, i)));
	}, E = (e, t) => {
		let r = e.currentTarget;
		r.setPointerCapture(e.pointerId);
		let i = (e) => {
			let i = r.getBoundingClientRect(), a = Math.max(0, Math.min(1, (e.clientX - i.left) / i.width)), o = Math.max(0, Math.min(1, (e.clientY - i.top) / i.height));
			t === "area" ? T(f.h, a, 1 - o, f.a) : t === "hue" ? T(a * 360, f.s, f.v, f.a) : c ? n(Uo(c, a < .995 ? Math.round(a * 100) : 100)) : T(f.h, f.s, f.v, Math.round(a * 100) / 100);
		};
		i(e);
		let a = (e) => i(e), o = () => {
			r.removeEventListener("pointermove", a), r.removeEventListener("pointerup", o);
		};
		r.addEventListener("pointermove", a), r.addEventListener("pointerup", o);
	}, ne = c ? u : f.a, re = c ? jt(i.resolve(`var(${c})`)).light : Bo({ ...Ho(f.h, f.s, f.v, 1) }), ie = /* @__PURE__ */ U("div", {
		onPointerDown: (e) => E(e, "alpha"),
		className: "relative h-3 min-w-0 flex-1 cursor-ew-resize rounded-full cms-checkerboard [--checker:6px]",
		children: [/* @__PURE__ */ H("span", {
			className: "absolute inset-0 rounded-full",
			style: { background: `linear-gradient(to right, transparent, ${re})` }
		}), /* @__PURE__ */ H("span", {
			className: V(Jo, "top-1/2"),
			style: { left: `${ne * 100}%` }
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
					"aria-label": w("Colors"),
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
						label: w("Search"),
						icon: "search",
						size: "sm",
						placeholder: w("Search Colors")
					}],
					values: { search: b },
					onChange: (e, t) => x(String(t ?? ""))
				})
			}),
			v !== "custom" && (v === "theme" ? te : C).length === 0 && /* @__PURE__ */ H(me, {
				className: "h-64 justify-center",
				onClear: () => x("")
			}),
			v === "theme" && te.length > 0 && /* @__PURE__ */ H("div", {
				role: "listbox",
				"aria-label": w("Theme Colors"),
				className: "h-64 overflow-y-auto overscroll-contain p-1",
				children: te.map((e) => {
					let t = c === e.variable, { light: r, dark: a } = jt(e.value);
					return /* @__PURE__ */ U(z, {
						compact: !0,
						role: "option",
						"aria-selected": t,
						onClick: () => n(e.ref),
						className: V("flex h-8 w-full items-center gap-2.5 rounded-sm px-2 text-left hover:bg-hover", t && "bg-active"),
						children: [
							/* @__PURE__ */ H(sa, {
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
								children: jt(i.resolve(e.ref)).light
							})
						]
					}, e.variable);
				})
			}),
			v === "palette" && C.length > 0 && /* @__PURE__ */ H("div", {
				role: "listbox",
				"aria-label": w("Palette"),
				className: "grid h-64 grid-cols-11 content-start gap-1 overflow-y-auto overscroll-contain p-3",
				children: C.map((e) => {
					let t = c === e.variable, r = jt(e.value).light;
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
								className: qo(r) ? "text-black/75" : "text-white"
							})]
						})
					}, e.variable);
				})
			}),
			v === "custom" && /* @__PURE__ */ U("div", {
				className: "h-72 space-y-3 p-3",
				children: [
					/* @__PURE__ */ H("div", {
						onPointerDown: (e) => E(e, "area"),
						className: "relative h-44 cursor-crosshair overflow-hidden rounded-sm",
						style: { background: `linear-gradient(to top, black, transparent), linear-gradient(to right, white, hsl(${f.h} 100% 50%))` },
						children: /* @__PURE__ */ H("span", {
							className: Jo,
							style: {
								left: `${f.s * 100}%`,
								top: `${(1 - f.v) * 100}%`
							}
						})
					}),
					/* @__PURE__ */ H("div", {
						onPointerDown: (e) => E(e, "hue"),
						className: "relative h-3 cursor-ew-resize rounded-full",
						style: { background: "linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)" },
						children: /* @__PURE__ */ H("span", {
							className: V(Jo, "top-1/2"),
							style: { left: `${f.h / 360 * 100}%` }
						})
					}),
					/* @__PURE__ */ H("div", {
						className: "flex items-center",
						children: ie
					}),
					/* @__PURE__ */ U("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ H(sa, {
							color: t ? i.resolve(t) : "transparent",
							className: "!size-7 !rounded-sm"
						}), /* @__PURE__ */ H("input", {
							value: m,
							spellCheck: !1,
							"aria-label": w("Color Value"),
							"aria-invalid": g.shown || void 0,
							onChange: (e) => h(e.target.value),
							onBlur: () => {
								let e = m.trim();
								if (e && !Wo(e)) return h(t ?? "");
								e !== (t ?? "") && n(e || null);
							},
							onKeyDown: (e) => {
								e.key === "Escape" && h(t ?? ""), e.key === "Enter" && (m.trim() && !Wo(m.trim()) ? g.show() : e.target.blur());
							},
							className: V("cms-input h-7 w-full min-w-0 rounded-sm px-2 text-sm placeholder:text-ghost", "font-mono"),
							placeholder: pe
						})]
					})
				]
			}),
			/* @__PURE__ */ U("div", {
				className: "flex h-10 items-center gap-2 border-t border-border pl-3 pr-1.5",
				children: [c && v !== "custom" ? /* @__PURE__ */ U(je, { children: [
					/* @__PURE__ */ H("span", {
						className: "shrink-0 text-xs text-muted",
						children: w("Opacity")
					}),
					ie,
					/* @__PURE__ */ U("span", {
						className: "w-9 shrink-0 text-right text-2xs tabular-nums text-muted",
						children: [Math.round(ne * 100), "%"]
					})
				] }) : /* @__PURE__ */ H("span", { className: "flex-1" }), r && /* @__PURE__ */ H(P, {
					variant: "ghost",
					size: "xs",
					disabled: !t,
					onClick: () => n(null),
					className: "shrink-0 !font-normal !text-muted hover:!text-ink",
					children: w("Clear")
				})]
			})
		]
	});
}
// admin/src/builder/fields/style.tsx
function Xo(e) {
	let t = e?.match(/^(linear|radial)-gradient\((.*)\)$/);
	if (!t) return null;
	let n = Za(t[2]), r = t[1] === "linear" ? "180deg" : "circle";
	n[0] && (/deg$|^to /.test(n[0]) || /^(circle|ellipse)/.test(n[0])) && (r = n.shift());
	let i = n.map((e) => {
		let t = Xa(e);
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
function Zo(e) {
	return `${e.kind}-gradient(${[e.angle, ...e.stops.map((e) => `${e.color}${e.at ? ` ${e.at}` : ""}`)].join(", ")})`;
}
function Qo({ value: e, onChange: t, context: n }) {
	let r = Go(), i = Xo(e);
	if (!i) return null;
	let a = (e) => t(Zo(e));
	return /* @__PURE__ */ U("div", {
		className: "min-w-0 flex-1 space-y-1 rounded-md bg-active/60 p-1.5",
		children: [
			/* @__PURE__ */ H("div", {
				className: "h-6 rounded-sm ring-1 ring-inset ring-black/10",
				style: { background: r(Zo({
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
					label: w("Shape"),
					fields: [{
						handle: "kind",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: w("Kind"),
						required: !0,
						options: [{
							value: "linear",
							label: w("Linear")
						}, {
							value: "radial",
							label: w("Radial")
						}]
					}, {
						handle: "angle",
						type: "text",
						component: "blocks-value",
						label: w("Angle"),
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
						label: w("Stop||gradient"),
						fields: [{
							handle: "color",
							type: "color",
							component: "blocks-color",
							label: w("Color")
						}, {
							handle: "at",
							type: "text",
							component: "blocks-value",
							label: w("Position"),
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
				}), i.stops.length > 2 && /* @__PURE__ */ H(ua, { onClick: () => a({
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
					w("Add Stop")
				]
			})
		]
	});
}
var $o = [
	"flex-start",
	"center",
	"flex-end"
], es = () => [
	{
		value: "flex-start",
		label: w("Start")
	},
	{
		value: "center",
		label: w("Center")
	},
	{
		value: "flex-end",
		label: w("End")
	},
	{
		value: "space-between",
		label: w("Space Between")
	},
	{
		value: "space-around",
		label: w("Space Around")
	},
	{
		value: "space-evenly",
		label: w("Space Evenly")
	}
];
function ts({ field: e, value: t, onChange: n, context: r }) {
	let i = e.row === !0, a = t?.justifyContent ?? void 0, o = t?.alignItems ?? void 0;
	return /* @__PURE__ */ U(ba, { children: [/* @__PURE__ */ H("div", {
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
			let r = $o[i ? t : e], s = $o[i ? e : t], c = (a ?? "flex-start") === r && (o ?? "stretch").replace("stretch", "flex-start") === s;
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
			label: w("Distribute"),
			options: es(),
			placeholder: w("Distribute")
		}, {
			handle: "alignItems",
			type: "select",
			display: "segmented",
			block: !0,
			size: "sm",
			label: w("Align"),
			options: [
				{
					value: "flex-start",
					icon: i ? "align-top" : "justify-start",
					title: w("Start")
				},
				{
					value: "center",
					icon: i ? "align-middle" : "justify-center",
					title: w("Center")
				},
				{
					value: "flex-end",
					icon: i ? "align-bottom" : "justify-end",
					title: w("End")
				},
				{
					value: "stretch",
					icon: i ? "arrows-out-line-vertical" : "spacing",
					title: w("Stretch")
				},
				{
					value: "baseline",
					icon: "text",
					title: w("Baseline")
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
var ns = [
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
], rs = {
	left: "0%",
	top: "0%",
	center: "50%",
	right: "100%",
	bottom: "100%"
};
function is(e) {
	let t = (e ?? "center").trim().split(/\s+/), n = (e) => e === "top" || e === "bottom";
	t.length === 1 && t.push("center");
	let [r, i] = n(t[0]) || t[1] && (t[1] === "left" || t[1] === "right") ? [t[1], t[0]] : t;
	return `${rs[r] ?? r} ${rs[i] ?? i}`;
}
function as({ field: e, value: t, onChange: n, context: r, disabled: i }) {
	let a = is(t);
	return /* @__PURE__ */ U(ba, { children: [/* @__PURE__ */ H("div", {
		className: "grid size-[60px] shrink-0 grid-cols-3 gap-px rounded-sm bg-bg p-1",
		role: "radiogroup",
		"aria-label": e.label,
		children: ns.flat().map((t) => {
			let r = a === is(t);
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
	}), /* @__PURE__ */ H(ya, {
		field: {
			handle: `${e.handle}-value`,
			type: "text",
			component: "blocks-value",
			label: e.label,
			unit: "",
			placeholder: w("Center")
		},
		value: t ?? null,
		onChange: (e) => n(e || null),
		context: r,
		disabled: i
	})] });
}
// admin/src/builder/design/Fill.tsx
var os = [
	"backgroundSize",
	"backgroundPosition",
	"backgroundRepeat",
	"backgroundAttachment"
], ss = (e) => e?.match(/^url\(["']?([^"')]*)["']?\)$/)?.[1];
function cs(e) {
	try {
		return encodeURI(decodeURI(e));
	} catch {
		return encodeURI(e);
	}
}
function ls({ s: e }) {
	let t = mn(), n = e.value("backgroundImage"), r = vt(e.value) ?? (Xo(n) ? n : void 0), i = r ? "gradient" : n ? "image" : "none", a = ss(n), [o, s] = M(null), c = e.value("backgroundColor") || n || r, l = () => e.edit((e) => {
		e.swap(gt, null), e.write(Object.fromEntries(os.map((e) => [e, null])));
	}, "fill"), u = (t) => {
		let n = Xo(t);
		if (!e.engine || !n) return l();
		e.swap(gt, _t(e.engine, n), "gradient");
	}, d = (t) => {
		let n = t && e.engine ? e.engine.make("bg", `url(${cs(t)})`) : null;
		e.swap(gt, n ?? "bg-none", "image");
	}, f = async (e) => {
		if (!e) return s(null), d(null);
		try {
			let { items: t } = await C("media/get-many", { ids: [e] });
			if (!t[0]?.url) return;
			s({
				id: e,
				url: t[0].url
			}), d(t[0].url);
		} catch (e) {
			Oe.error(e);
		}
	};
	return /* @__PURE__ */ U(ho, {
		s: e,
		group: "fill",
		title: w("Fill"),
		empty: !c,
		children: [
			/* @__PURE__ */ H(Q, {
				s: e,
				fields: [{
					handle: "backgroundColor",
					type: "color",
					component: "blocks-color",
					label: w("Color")
				}, {
					handle: "kind",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: w("Image"),
					options: [
						{
							value: "none",
							label: w("None")
						},
						{
							value: "gradient",
							icon: "gradient",
							title: w("Gradient")
						},
						{
							value: "image",
							icon: "image",
							title: w("Image")
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
						let r = At(t.of("color")).own[0]?.ref ?? "currentColor";
						n === "gradient" ? u(`linear-gradient(180deg, ${r}, transparent)`) : n === "image" ? e.edit((e) => {
							e.swap(gt, "bg-none"), e.write({
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
					label: w("Gradient"),
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
						label: w("Image"),
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
						label: w("Image Address"),
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
						label: w("Size"),
						options: [
							{
								value: "cover",
								label: w("Cover")
							},
							{
								value: "contain",
								label: w("Contain")
							},
							{
								value: "auto",
								label: w("Original")
							}
						]
					},
					i === "image" && {
						handle: "backgroundPosition",
						type: "json",
						component: "blocks-origin",
						label: w("Position"),
						className: "items-start py-0.5 [&>label]:leading-6"
					},
					i === "image" && {
						handle: "backgroundRepeat",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: w("Repeat||again"),
						placeholder: "repeat",
						options: [
							{
								value: "no-repeat",
								label: w("Once")
							},
							{
								value: "repeat",
								label: w("Tile")
							},
							{
								value: "repeat-x",
								icon: "spacing",
								title: w("Tile Across")
							},
							{
								value: "repeat-y",
								icon: "arrows-out-line-vertical",
								title: w("Tile Down")
							}
						]
					},
					i === "image" && {
						handle: "backgroundAttachment",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: w("Scrolling"),
						options: [{
							value: "scroll",
							label: w("With Page")
						}, {
							value: "fixed",
							label: w("Fixed")
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
						label: w("Clip"),
						options: [{
							value: "border-box",
							label: w("Box")
						}, {
							value: "text",
							label: w("Text")
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
var us = () => [
	{
		value: "block",
		icon: "square",
		title: w("Block")
	},
	{
		value: "flex",
		icon: "rows",
		title: w("Stack (flex)")
	},
	{
		value: "grid",
		icon: "grid",
		title: w("Grid")
	},
	{
		value: "inline-flex",
		icon: "arrows-in-line-horizontal",
		title: w("Inline Stack")
	},
	{
		value: "none",
		icon: "eye-off",
		title: w("Hidden")
	}
], ds = (e) => e?.match(/^repeat\((\d+), minmax\(0, 1fr\)\)$/)?.[1] ?? e, fs = (e) => e?.match(/^span (\d+) \/ span \1$/)?.[1] ?? e;
function ps(e, t, n, r) {
	r && /^\d+$/.test(r.trim()) && e.engine?.valid(`${n}-${r.trim()}`) ? e.swap(t.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`), `${n}-${r.trim()}`) : e.set(t, r);
}
function ms({ s: e }) {
	let t = e.value("display"), n = t === "flex" || t === "inline-flex", r = t === "grid" || t === "inline-grid", i = n && (e.value("flexDirection") ?? "row").startsWith("row");
	return /* @__PURE__ */ H(ho, {
		s: e,
		group: "layout",
		title: w("Layout"),
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
					label: w("Display"),
					options: us()
				},
				n && {
					handle: "flexDirection",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: w("Direction"),
					get: () => e.value("flexDirection") ?? "row",
					options: [
						{
							value: "row",
							icon: "arrow-right",
							title: w("Horizontal")
						},
						{
							value: "column",
							icon: "arrow-down",
							title: w("Vertical")
						},
						{
							value: "row-reverse",
							icon: "arrow-left",
							title: w("Horizontal, Reversed")
						},
						{
							value: "column-reverse",
							icon: "arrow-up",
							title: w("Vertical, Reversed")
						}
					]
				},
				n && {
					handle: "align",
					type: "json",
					component: "blocks-align",
					label: w("Align"),
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
					label: w("Gap"),
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
					label: w("Wrap"),
					options: [{
						value: "nowrap",
						label: w("One Line")
					}, {
						value: "wrap",
						label: w("Wrap")
					}],
					get: () => e.value("flexWrap") ?? "nowrap",
					set: (t) => e.set("flexWrap", t === "wrap" ? "wrap" : null)
				},
				r && {
					handle: "gridTemplateColumns",
					type: "text",
					component: "blocks-value",
					label: w("Columns"),
					placeholder: w("3 or 1fr 2fr"),
					unit: "",
					min: 1,
					title: w("A number of equal columns, or any grid template (1fr 2fr, repeat(auto-fill, minmax(16rem, 1fr)))"),
					get: () => ds(e.value("gridTemplateColumns")),
					set: (t) => ps(e, "gridTemplateColumns", "grid-cols", t)
				},
				r && {
					handle: "gridTemplateRows",
					type: "text",
					component: "blocks-value",
					label: w("Rows"),
					placeholder: "auto",
					unit: "",
					get: () => ds(e.value("gridTemplateRows")),
					set: (t) => ps(e, "gridTemplateRows", "grid-rows", t)
				},
				r && {
					handle: "gaps",
					type: "group",
					component: "blocks-group",
					label: w("Gap"),
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
						label: w("Columns"),
						group: "spacing",
						prefixIcon: "split",
						placeholder: "0",
						min: 0
					}, {
						handle: "rowGap",
						type: "text",
						component: "blocks-value",
						label: w("Rows"),
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
					label: w("Align"),
					keys: ["alignItems", "justifyItems"],
					get: () => e.value("alignItems"),
					options: [
						{
							value: "flex-start",
							icon: "align-top",
							title: w("Top")
						},
						{
							value: "center",
							icon: "align-middle",
							title: w("Middle")
						},
						{
							value: "flex-end",
							icon: "align-bottom",
							title: w("Bottom")
						},
						{
							value: "stretch",
							icon: "arrows-out-line-vertical",
							title: w("Stretch")
						}
					]
				},
				r && {
					handle: "gridAutoFlow",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: w("Flow"),
					options: [
						{
							value: "row",
							icon: "arrow-right",
							title: w("Rows First")
						},
						{
							value: "column",
							icon: "arrow-down",
							title: w("Columns First")
						},
						{
							value: "row dense",
							icon: "group",
							title: w("Fill Gaps (Dense)")
						}
					]
				}
			]
		})
	});
}
function hs({ s: e, parentDisplay: t }) {
	if (!t || !/flex|grid/.test(t)) return null;
	let n = t.includes("grid");
	return /* @__PURE__ */ H(ho, {
		s: e,
		group: "item",
		title: w(n ? "Grid Item" : "Stack Item"),
		open: !1,
		empty: !e.value("alignSelf") && !e.value("flex") && !e.value("gridColumn"),
		children: /* @__PURE__ */ H(Q, {
			s: e,
			fields: [
				n && {
					handle: "gridColumn",
					type: "text",
					component: "blocks-value",
					label: w("Column"),
					placeholder: "auto",
					unit: "",
					title: w("Span a number of columns (2), or a range (1 / -1 for full width)"),
					get: () => fs(e.value("gridColumn")),
					set: (t) => ps(e, "gridColumn", "col-span", t)
				},
				n && {
					handle: "gridRow",
					type: "text",
					component: "blocks-value",
					label: w("Row"),
					placeholder: "auto",
					unit: "",
					get: () => fs(e.value("gridRow")),
					set: (t) => ps(e, "gridRow", "row-span", t)
				},
				!n && {
					handle: "flex",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: w("Grow"),
					options: [
						{
							value: "1",
							label: w("Fill||size")
						},
						{
							value: "none",
							label: w("Fixed")
						},
						{
							value: "0 1 auto",
							label: w("Shrink")
						}
					]
				},
				{
					handle: "alignSelf",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: w("Align Self"),
					options: [
						{
							value: "flex-start",
							icon: "align-top",
							title: w("Start")
						},
						{
							value: "center",
							icon: "align-middle",
							title: w("Center")
						},
						{
							value: "flex-end",
							icon: "align-bottom",
							title: w("End")
						},
						{
							value: "stretch",
							icon: "arrows-out-line-vertical",
							title: w("Stretch")
						}
					]
				},
				{
					handle: "order",
					type: "text",
					component: "blocks-value",
					label: w("Display Order"),
					unit: "",
					placeholder: "0",
					prefixIcon: "list-ordered"
				}
			]
		})
	});
}
// admin/src/builder/design/Position.tsx
function gs({ s: e }) {
	let t = e.value("position"), n = !!t && t !== "static";
	return /* @__PURE__ */ H(ho, {
		s: e,
		group: "position",
		title: w("Position"),
		open: !!t,
		empty: !t,
		children: /* @__PURE__ */ H(Q, {
			s: e,
			fields: [
				{
					handle: "position",
					type: "select",
					size: "sm",
					label: w("Type"),
					placeholder: w("Static"),
					options: [
						{
							value: "static",
							label: w("Static")
						},
						{
							value: "relative",
							label: w("Relative")
						},
						{
							value: "absolute",
							label: w("Absolute")
						},
						{
							value: "fixed",
							label: w("Fixed")
						},
						{
							value: "sticky",
							label: w("Sticky")
						}
					]
				},
				n && {
					handle: "offsets",
					type: "group",
					component: "blocks-group",
					label: w("Offsets"),
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
							top: w("Top"),
							right: w("Right"),
							bottom: w("Bottom"),
							left: w("Left")
						}[e],
						title: {
							top: w("Top"),
							right: w("Right"),
							bottom: w("Bottom"),
							left: w("Left")
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
					label: w("Z-index"),
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
					label: w("Isolation"),
					placeholder: "auto",
					options: [{
						value: "auto",
						label: w("Auto")
					}, {
						value: "isolate",
						label: w("Isolate")
					}]
				}
			]
		})
	});
}
// admin/src/builder/design/Size.tsx
function _s(e, t, n) {
	let r = e.value(t), i = r === "100%" ? "fill" : r === "fit-content" ? "fit" : r === "auto" || !r ? "auto" : r.endsWith("vh") || r.endsWith("vw") || r.endsWith("dvh") ? "viewport" : "fixed", a = {
		fill: w("Fill||size"),
		fit: w("Fit"),
		auto: w("Auto"),
		viewport: w("Window"),
		fixed: w("Fixed")
	};
	return {
		handle: t,
		type: "text",
		component: "blocks-value",
		label: n,
		prefix: t === "width" ? "W" : "H",
		placeholder: w("Auto"),
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
					label: w("Fill the Parent (100%)"),
					value: "100%",
					checked: i === "fill"
				},
				{
					label: w("Fit the Content"),
					value: "fit-content",
					checked: i === "fit"
				},
				{
					label: w("Auto"),
					value: null,
					checked: i === "auto"
				},
				{
					label: w(t === "width" ? "Window Width (100vw)" : "Window Height (100dvh)"),
					value: t === "width" ? "100vw" : "100dvh",
					checked: i === "viewport"
				}
			]
		}
	};
}
function vs({ s: e, media: t }) {
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
	return /* @__PURE__ */ H(ho, {
		s: e,
		group: "size",
		title: w("Size"),
		empty: !n,
		children: /* @__PURE__ */ H(Q, {
			s: e,
			fields: [
				_s(e, "width", w("Width")),
				_s(e, "height", w("Height")),
				{
					handle: "limits",
					type: "group",
					component: "blocks-group",
					label: w("Min · Max"),
					columns: 2,
					fields: [
						{
							handle: "minWidth",
							type: "text",
							component: "blocks-value",
							label: w("Min Width"),
							prefix: "W",
							placeholder: w("Min"),
							title: w("Minimum Width"),
							min: 0
						},
						{
							handle: "maxWidth",
							type: "text",
							component: "blocks-value",
							label: w("Max Width"),
							prefix: "W",
							placeholder: w("Max"),
							group: "container",
							title: w("Maximum Width"),
							min: 0,
							keywords: ["none"]
						},
						{
							handle: "minHeight",
							type: "text",
							component: "blocks-value",
							label: w("Min Height"),
							prefix: "H",
							placeholder: w("Min"),
							title: w("Minimum Height"),
							min: 0
						},
						{
							handle: "maxHeight",
							type: "text",
							component: "blocks-value",
							label: w("Max Height"),
							prefix: "H",
							placeholder: w("Max"),
							title: w("Maximum Height"),
							min: 0,
							keywords: ["none"]
						}
					]
				},
				{
					handle: "aspectRatio",
					type: "select",
					size: "sm",
					label: w("Aspect"),
					placeholder: w("Auto"),
					get: () => {
						let t = e.value("aspectRatio");
						return t && e.engine ? e.engine.resolve(t).replace(/\s+/g, "") : t;
					},
					options: [
						{
							value: "1/1",
							label: w("1:1 square")
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
							label: w("3:4 portrait")
						},
						{
							value: "4/5",
							label: "4:5"
						},
						{
							value: "9/16",
							label: w("9:16 story")
						}
					]
				},
				{
					handle: "overflow",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: w("Overflow"),
					placeholder: "visible",
					options: [
						{
							value: "visible",
							icon: "eye",
							title: w("Visible")
						},
						{
							value: "hidden",
							icon: "eye-off",
							title: w("Hidden")
						},
						{
							value: "auto",
							icon: "mouse-scroll",
							title: w("Scroll When Needed")
						},
						{
							value: "clip",
							icon: "scissors",
							title: w("Clip, without scrolling")
						}
					]
				},
				t && {
					handle: "objectFit",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: w("Fit||image"),
					options: [
						{
							value: "cover",
							label: w("Cover")
						},
						{
							value: "contain",
							label: w("Contain")
						},
						{
							value: "fill",
							label: w("Stretch")
						},
						{
							value: "none",
							label: w("None")
						}
					]
				},
				t && {
					handle: "objectPosition",
					type: "json",
					component: "blocks-origin",
					label: w("Focus"),
					className: "items-start py-0.5 [&>label]:leading-6"
				}
			]
		})
	});
}
// admin/src/builder/design/Spacing.tsx
var ys = [
	"Top",
	"Right",
	"Bottom",
	"Left"
];
function bs(e, t, n) {
	return [
		`${t}${ys[n]}`,
		n % 2 == 0 ? `${t}Block` : `${t}Inline`,
		t
	].find((t) => e.value(t) !== void 0) ?? null;
}
function xs(e, t, n) {
	let r = bs(e, t, n);
	if (!r) return;
	let i = e.value(r);
	if (r === t) return Qa(i)?.[n];
	if (r.endsWith("Block") || r.endsWith("Inline")) {
		let [e, t] = Xa(String(i));
		return n === 0 || n === 3 ? e : t ?? e;
	}
	return i;
}
var Ss = (e) => [
	e,
	`${e}Block`,
	`${e}Inline`,
	...ys.map((t) => `${e}${t}`)
];
function Cs({ s: e }) {
	let t = ["margin", "padding"], n = t.some((t) => ys.some((n, r) => xs(e, t, r))), r = Object.fromEntries(t.map((t) => [t, [
		0,
		1,
		2,
		3
	].map((n) => xs(e, t, n))])), i = Object.fromEntries(t.map((t) => [t, [
		0,
		1,
		2,
		3
	].map((n) => {
		let r = bs(e, t, n);
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
		}), ys.forEach((e, o) => r[`${t}${e}`] = i || a ? null : n[o] ?? null), e.write(r);
	};
	return /* @__PURE__ */ H(ea, {
		title: w("Spacing"),
		empty: !n,
		own: mo(e, "spacing"),
		children: /* @__PURE__ */ H(Q, {
			s: e,
			bare: !0,
			fields: [{
				handle: "spacing",
				type: "json",
				component: "blocks-spacing",
				className: "items-start",
				label: w("Spacing"),
				sideStatus: i,
				keys: [...Ss("margin"), ...Ss("padding")],
				get: () => r,
				set: (e) => t.forEach((t) => e[t] !== r[t] && a(t, e[t]))
			}]
		})
	});
}
// admin/src/builder/palette.tsx
var ws = "scheme-";
function Ts(e) {
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
var Es = (e) => /^transparent$|\/\s*(0?\.\d+|\d{1,2}(\.\d+)?%)\s*\)$/.test(e.trim());
function Ds({ background: e, text: t, size: n }) {
	let r = Es(e);
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
var Os = (e) => e.replace(/^!|!$/g, "");
function ks(e, t) {
	let n = (e.declarations(Os(q(t).utility)) ?? []).filter((e) => !e.property.startsWith("--")), r = n.find((e) => /(^|-)color$|^fill$|^stroke$/.test(e.property) && !/^(inherit|currentcolor|transparent)$/i.test(e.value));
	return {
		text: n.slice(0, 2).map((t) => `${t.property}: ${e.resolve(t.value)}`).join("; "),
		color: r && jt(e.resolve(r.value)).light
	};
}
var As = 8;
function js({ engine: e, site: t, exclude: n, onAdd: r, onBackspace: i, onEmpty: a, initial: o, onDone: s, label: c }) {
	let [l, u] = M(o ?? ""), [d, f] = M(0), [p, m] = M(!!o), [h, g] = M(!1), _ = A(() => new Set(n), [n]), v = l.trim(), y = A(() => {
		if (!e || !p || /\s/.test(v) || !v && !h) return [];
		let n = v.toLowerCase(), r = t.filter((e) => !_.has(e) && (!n || e.toLowerCase().includes(n)));
		return [
			[w("Tailwind"), n ? Ot(e, [], v, _).slice(0, As) : []],
			[w("Site Classes"), r.filter((e) => !e.startsWith("scheme-"))],
			[w("Schemes"), r.filter((e) => e.startsWith("scheme-"))]
		].filter(([, e]) => e.length > 0);
	}, [
		e,
		p,
		v,
		h,
		t,
		_
	]), b = A(() => y.flatMap(([, e]) => e), [y]), [x, ee] = M(!1), S = (t) => {
		let n = t.filter((t) => Ct(t) && !wt(e, t));
		n.length && r(n), u(""), f(0), s?.();
	}, te = (e) => {
		if (e.key === "ArrowDown" && !b.length && !v) e.preventDefault(), g(!0);
		else if ((e.key === "ArrowDown" || e.key === "ArrowUp") && b.length) e.preventDefault(), f((t) => (t + (e.key === "ArrowDown" ? 1 : -1) + b.length) % b.length);
		else if (e.key === "Enter" || e.key === "Tab" && b.length && v || e.key === " " && v) {
			if (!v) {
				e.key === "Enter" && a && (e.preventDefault(), a());
				return;
			}
			e.preventDefault(), S(/\s/.test(v) ? Ge(v) : [b[d] ?? v]);
		} else e.key === "Escape" ? (e.preventDefault(), g(!1), u(""), s?.()) : e.key === "Backspace" && l === "" && i && (e.preventDefault(), i());
	}, C = A(() => `cms-classes-${Math.random().toString(36).slice(2)}`, []);
	return /* @__PURE__ */ U("div", {
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
			"aria-controls": C,
			"aria-activedescendant": b.length ? `${C}-${d}` : void 0,
			placeholder: o === void 0 ? w("Add Class") : void 0,
			onChange: (e) => {
				u(e.target.value), e.target.value || g(!1), f(0);
				let t = e.target.getBoundingClientRect();
				ee(window.innerHeight - t.bottom < 300 && t.top > 300);
			},
			onKeyDown: te,
			onFocus: (e) => {
				m(!0);
				let t = e.target.getBoundingClientRect();
				ee(window.innerHeight - t.bottom < 300 && t.top > 300);
			},
			onBlur: () => {
				m(!1), g(!1), v ? S(Ge(v)) : a ? a() : s?.();
			},
			className: V("h-6 w-full min-w-0 rounded-xs px-1 font-mono text-xs text-text outline-none placeholder:font-sans placeholder:text-faint", o === void 0 ? "bg-transparent" : "bg-active px-1.5")
		}), b.length > 0 && /* @__PURE__ */ H("div", {
			id: C,
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
					let r = b.indexOf(n), i = ks(e, n);
					return /* @__PURE__ */ U(z, {
						compact: !0,
						id: `${C}-${r}`,
						role: "option",
						"aria-selected": r === d,
						tabIndex: -1,
						onPointerDown: (e) => {
							e.preventDefault(), S([n]);
						},
						onMouseEnter: () => f(r),
						className: V("flex min-h-7 w-full items-center gap-2 rounded-xs px-2 py-1 text-left", r === d && "bg-hover"),
						children: [
							i.color && /* @__PURE__ */ H(sa, {
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
function Ms({ s: e, site: t, disabled: n, siteMenu: r }) {
	let i = e.engine, [a, o] = M(null), s = (n, r) => {
		if (!i) return;
		let a = r ? e.classes.filter((e) => e !== r) : e.classes;
		for (let o of n) {
			let n = r ? o : xt(o, e.variants), { variants: s, utility: c } = q(n), l = t.includes(Os(c)) ? null : i.group(c);
			a = l ? i.put(a, s, l, c) : [...a.filter((e) => e !== n), n];
		}
		e.apply(i.sort(a), "classes");
	}, c = (t) => e.apply(e.classes.filter((e) => e !== t), "classes"), [l, u] = M(!1), d = (e) => t.includes(Os(q(e).utility)), f = (t) => {
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
		children: [p.map((l) => a === l && !n ? /* @__PURE__ */ H(js, {
			engine: i,
			site: t,
			exclude: e.classes.filter((e) => e !== l),
			initial: l,
			label: w("Class"),
			onAdd: (e) => s(e, l),
			onEmpty: () => {
				c(l), o(null);
			},
			onDone: () => o(null)
		}, l) : /* @__PURE__ */ H("span", {
			className: V("inline-flex h-6 max-w-full items-center rounded-xs pl-1.5 text-xs text-ink", d(l) ? "font-medium shadow-edge" : "font-mono", f(l) ? "bg-focus-soft" : d(l) ? "bg-bg" : "bg-active", n && "pr-1.5", wt(i, l) && "underline decoration-danger decoration-wavy underline-offset-2"),
			children: n ? /* @__PURE__ */ H("span", {
				className: "truncate",
				children: l
			}) : /* @__PURE__ */ U(je, { children: [d(l) && r ? /* @__PURE__ */ H(de, {
				align: "start",
				trigger: /* @__PURE__ */ H(z, {
					compact: !0,
					"aria-label": w("{name} Actions", { name: l }),
					className: "min-w-0 truncate rounded-xs text-left",
					children: l
				}),
				items: r(l)
			}) : /* @__PURE__ */ H(z, {
				compact: !0,
				onClick: () => o(l),
				"aria-label": w("Change {name}", { name: l }),
				className: "min-w-0 truncate rounded-xs text-left",
				children: l
			}), /* @__PURE__ */ H(L, {
				icon: "close",
				size: "xs",
				label: w("Remove {name}", { name: l }),
				onClick: () => c(l),
				className: "!size-5 shrink-0 text-faint hover:text-ink"
			})] })
		}, l)), !n && /* @__PURE__ */ H(js, {
			engine: i,
			site: t,
			exclude: e.classes,
			label: w("Add Class"),
			onAdd: (e) => s(e),
			onBackspace: () => p.length && c(p[p.length - 1])
		})]
	});
}
// admin/src/builder/design/StyleBar.tsx
var Ns = (e) => e.replace(/^!|!$/g, ""), Ps = () => [
	{
		value: "",
		label: w("Default")
	},
	{
		value: "hover",
		label: w("Hover")
	},
	{
		value: "active",
		label: w("Pressed")
	},
	{
		value: "focus-visible",
		label: w("Focus")
	}
], Fs = () => [
	{
		value: "before",
		label: w("Before")
	},
	{
		value: "after",
		label: w("After")
	},
	{
		value: "placeholder",
		label: w("Placeholder")
	},
	{
		value: "first",
		label: w("First Item")
	},
	{
		value: "last",
		label: w("Last Item")
	},
	{
		value: "odd",
		label: w("Odd Items")
	},
	{
		value: "even",
		label: w("Even Items")
	},
	{
		value: "current",
		label: w("Current Page")
	},
	{
		value: "group-hover",
		label: w("Hover on Group")
	},
	{
		value: "dark",
		label: w("Dark Mode")
	},
	{
		value: "open",
		label: w("When Open")
	}
];
function Is(e) {
	if (e === "") return w("Default");
	let t = [...Ps(), ...Fs()].find((t) => t.value === e);
	return t ? t.label : e.startsWith("in-data-") ? w("in {state}", { state: e.slice(8) }) : e.startsWith("data-") ? e.slice(5) : e;
}
function Ls({ classes: e, engine: t, state: n, onState: r, states: i, className: a }) {
	let o = yt(e), s = n.join(":"), c = (e) => r(e ? q(`${e}:x`).variants : []), l = [...(i?.own ?? []).map((e) => `data-${e}`), ...(i?.inherited ?? []).map((e) => `in-data-${e}`)], u = (e) => !t || t.valid(`${e}:flex`), d = async () => {
		let e = await Ee({
			title: w("Custom Variant"),
			fields: [{
				handle: "name",
				type: "text",
				label: w("Variant"),
				placeholder: "aria-expanded, peer-checked",
				mono: !0
			}],
			confirm: w("Edit Variant")
		}), t = String(e?.name ?? "").trim().replace(/:+$/, "");
		if (t) {
			if (/\s/.test(t) || !u(t)) return void Oe.error(w("Tailwind has no variant “{name}”.", { name: t }));
			c(t);
		}
	}, f = (e, t = Is(e)) => ({
		label: t,
		checked: s === e,
		mark: e && o.has(e) ? w("Has Styles") : void 0,
		onSelect: () => c(e)
	}), p = Fs().map((e) => e.value).filter(u), m = l.filter(u), h = s !== "";
	return /* @__PURE__ */ H(de, {
		align: "end",
		trigger: /* @__PURE__ */ U(z, {
			compact: !0,
			"aria-label": w("State: {state}", { state: n.map(Is).join(" · ") || w("Default") }),
			className: V("cms-input flex !h-7 min-w-0 items-center gap-1.5 !rounded-sm !px-2 text-left text-xs", a),
			children: [
				/* @__PURE__ */ H("span", {
					className: "min-w-0 flex-1 truncate",
					children: h ? n.map(Is).join(" · ") : w("Default")
				}),
				h && o.has(s) && /* @__PURE__ */ H("span", {
					role: "img",
					"aria-label": w("Has Styles"),
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
			...Ps().map((e) => f(e.value, e.label)),
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
					label: w("States of This Element"),
					heading: !0
				},
				...m.map((e) => f(e))
			] : [],
			...s && !Ps().some((e) => e.value === s) && !p.includes(s) && !m.includes(s) ? [f(s)] : [],
			{
				separator: !0,
				label: ""
			},
			{
				label: w("Custom Variant…"),
				onSelect: () => void d()
			}
		]
	});
}
var Rs = (e) => String(e ?? "").trim().toLowerCase().replace(/[\s_]+/g, "-");
async function zs(e, t, n, r, i = "") {
	let a = Rs((await Ee({
		title: n,
		fields: [{
			handle: "name",
			type: "text",
			label: w("Name"),
			placeholder: "card",
			mono: !0,
			required: !0,
			autofocus: !0
		}],
		values: { name: i },
		confirm: r
	}))?.name);
	return !a || a === i ? null : /^[a-z][a-z0-9-]*$/.test(a) ? t.includes(a) || e?.valid(a) ? (Oe.error(w("There is already a class “{name}”.", { name: a })), null) : a : (Oe.error(w("A name is lowercase letters, numbers and hyphens, and starts with a letter.")), null);
}
function Bs({ s: e, site: t, source: n, state: r, disabled: i, menu: a = [], saveAs: o = !0 }) {
	let s = e.engine, c = St(s, e.classes, t), l = v("settings.manage") && !!n && !!s && !i, u = e.screen.sizes, d = (e) => q(e).variants.some((e) => !!rt(e, u)), f = c.utilities.filter((e) => !d(e)), p = async () => {
		if (!s || !n) return;
		let r = await zs(s, t, w("Save as Class"), w("Save Class"));
		if (r) try {
			await C("styling/update", { css: new Yt(n.css).setUtility(r, s.sort(f)).css }), b("styling/"), e.apply([
				...c.site,
				r,
				...c.utilities.filter(d)
			], "classes"), Oe.success(w("Class “{name}” saved", { name: r }));
		} catch (e) {
			Oe.error(e);
		}
	}, m = (t) => {
		if (!s || !n) return;
		let { variants: r, utility: i } = q(t), a = (new Yt(n.css).utilities().find((e) => e.name === Ns(i))?.classes ?? []).map((e) => We(r, e));
		e.apply(s.sort([.../* @__PURE__ */ new Set([...e.classes.filter((e) => e !== t), ...a])]), "classes");
	}, h = (t) => {
		let r = Ns(q(t).utility);
		return [
			{
				label: w("Class of the Site"),
				heading: !0
			},
			...l ? [{
				label: w("Edit Class"),
				icon: "edit",
				onSelect: () => x(r.startsWith("scheme-") ? "/design/colors" : `/design/classes/${r.startsWith("btn-") ? "buttons" : "ungrouped"}/${encodeURIComponent(r)}`)
			}] : [],
			...n ? [{
				label: w("Detach Class"),
				icon: "unlink",
				onSelect: () => m(t)
			}] : [],
			{
				label: w("Remove Class"),
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
			children: [/* @__PURE__ */ H(ra, { field: {
				handle: "state",
				type: "select",
				label: w("State")
			} }), /* @__PURE__ */ H(Ls, {
				...r,
				className: "flex-1"
			})]
		}), /* @__PURE__ */ H(ea, {
			title: w("Classes"),
			detail: e.classes.length || void 0,
			open: !1,
			actionsOpen: !1,
			actions: /* @__PURE__ */ H(de, {
				align: "end",
				trigger: /* @__PURE__ */ H(L, {
					icon: "more",
					size: "xs",
					label: w("Class Actions")
				}),
				items: [
					...a,
					...a.length ? [{
						separator: !0,
						label: ""
					}] : [],
					...l && o ? [{
						label: w("Save as Class…"),
						icon: "plus",
						disabled: f.length === 0,
						onSelect: () => void p()
					}] : [],
					{
						label: w("Copy Classes"),
						icon: "copy",
						disabled: e.classes.length === 0,
						onSelect: () => void Se(e.classes.join(" "), { copied: w("Classes copied") })
					}
				]
			}),
			children: /* @__PURE__ */ H(Ms, {
				s: e,
				site: t,
				disabled: i,
				siteMenu: h
			})
		})]
	});
}
// admin/src/builder/design/Transform.tsx
var Vs = (e) => !e || /^-?0(px|deg|%)?$/.test(e);
function Hs({ s: e }) {
	let t = {
		x: e.value("--tw-translate-x"),
		y: e.value("--tw-translate-y")
	}, n = {
		X: lt(e.value("--tw-skew-x")),
		Y: lt(e.value("--tw-skew-y"))
	}, r = e.value("--tw-scale-x"), i = r?.endsWith("%") ? String(parseFloat(r) / 100) : r, a = [
		t.x,
		t.y,
		n.X,
		n.Y,
		i,
		e.value("rotate"),
		e.value("transformOrigin"),
		e.value("perspective")
	].some(Boolean), o = (t, n, r, i) => e.swap(t, e.engine && !Vs(r) ? ft(e.engine, n, r, i) : null), s = (e) => [{
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
	return /* @__PURE__ */ H(ho, {
		s: e,
		group: "transform",
		title: w("Transform"),
		open: !!a,
		empty: !a,
		children: /* @__PURE__ */ H(Q, {
			s: e,
			fields: [
				{
					handle: "move",
					type: "group",
					component: "blocks-group",
					label: w("Move"),
					markers: ["--tw-translate-x", "--tw-translate-y"],
					fields: s("px"),
					get: () => t,
					set: (e) => Object.entries(to(t, e)).forEach(([e, t]) => o(`--tw-translate-${e}`, `translate-${e}`, t, "spacing"))
				},
				{
					handle: "rotate",
					type: "text",
					component: "blocks-value",
					label: w("Rotate"),
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
					label: w("Scale"),
					unit: "",
					step: .01,
					prefixIcon: "arrows-out-simple",
					placeholder: "1",
					markers: ["scale"],
					get: () => i,
					set: (t) => e.swap("scale", e.engine && t && Number(t) !== 1 ? ft(e.engine, "scale", t, "percent") : null)
				},
				{
					handle: "skew",
					type: "group",
					component: "blocks-group",
					label: w("Skew"),
					markers: ["--tw-skew-x", "--tw-skew-y"],
					fields: s("deg").map((e) => ({
						...e,
						handle: e.handle.toUpperCase()
					})),
					get: () => n,
					set: (e) => Object.entries(to(n, e)).forEach(([e, t]) => o(`--tw-skew-${e.toLowerCase()}`, `skew-${e.toLowerCase()}`, t, "deg"))
				},
				{
					handle: "transformOrigin",
					type: "json",
					component: "blocks-origin",
					label: w("Origin"),
					className: "items-start py-0.5 [&>label]:leading-6"
				},
				{
					handle: "perspective",
					type: "text",
					component: "blocks-value",
					label: w("Perspective"),
					prefixIcon: "perspective",
					placeholder: "none",
					keywords: ["none"]
				}
			]
		})
	});
}
// admin/src/builder/design/Transition.tsx
var Us = () => [
	{
		value: "transition",
		label: w("Colors, Opacity, Shadow and Transform")
	},
	{
		value: "transition-all",
		label: w("Everything")
	},
	{
		value: "transition-colors",
		label: w("Colors")
	},
	{
		value: "transition-transform",
		label: w("Transform")
	},
	{
		value: "transition-opacity",
		label: w("Opacity")
	},
	{
		value: "transition-shadow",
		label: w("Shadow")
	}
], Ws = [
	"transition-property",
	"--tw-duration",
	"--tw-ease",
	"transition-delay"
];
function Gs({ s: e }) {
	let t = mn(), n = e.value("transitionProperty"), r = Us(), i = n === void 0 ? void 0 : r.find((t) => e.engine?.value(t.value, "transition-property") === n)?.value, a = (t, n, r) => e.swap(t, r && e.engine ? ft(e.engine, n, r, "ms") : null);
	return /* @__PURE__ */ H(ho, {
		s: e,
		group: "transition",
		title: w("Transition"),
		open: !!n,
		empty: !n,
		children: n ? /* @__PURE__ */ H(Q, {
			s: e,
			fields: [
				{
					handle: "property",
					type: "select",
					size: "sm",
					label: w("Animate"),
					options: r,
					markers: ["transition-property"],
					reset: () => e.swap(Ws, null),
					get: () => i,
					set: (t) => e.swap(t ? "transition-property" : Ws, t || null)
				},
				{
					handle: "timing",
					type: "group",
					component: "blocks-group",
					label: w("Duration"),
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
						label: w("Duration"),
						unit: "ms",
						step: 10,
						min: 0,
						prefixIcon: "timer",
						placeholder: "150"
					}, {
						handle: "delay",
						type: "text",
						component: "blocks-value",
						label: w("Delay"),
						unit: "ms",
						step: 10,
						min: 0,
						prefixIcon: "pause",
						placeholder: w("Delay")
					}]
				},
				{
					handle: "ease",
					type: "text",
					component: "ease",
					label: w("Curve"),
					markers: ["--tw-ease"],
					get: () => e.value("--tw-ease"),
					set: (t) => e.swap("--tw-ease", t && e.engine ? ft(e.engine, "ease", t, "number") : null),
					options: [
						...t.of("ease").map((e) => ({
							value: e.ref,
							label: e.name,
							curve: e.value
						})),
						{
							value: "linear",
							label: w("Linear")
						},
						{
							value: "cubic-bezier(0.2, 0.8, 0.2, 1)",
							label: w("Smooth Out")
						},
						{
							value: "cubic-bezier(0.65, 0, 0.35, 1)",
							label: w("Smooth In-Out")
						},
						{
							value: "cubic-bezier(0.34, 1.56, 0.64, 1)",
							label: w("Overshoot")
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
			children: w("Animate State Changes")
		})
	});
}
// admin/src/builder/design/Typography.tsx
var Ks = () => ({
	100: w("Thin 100"),
	200: w("Extra Light 200"),
	300: w("Light 300"),
	400: w("Regular 400"),
	500: w("Medium 500"),
	600: w("Semibold 600"),
	700: w("Bold 700"),
	800: w("Extra Bold 800"),
	900: w("Black 900")
}), qs = "-webkit-text-stroke";
function Js({ s: e, prose: t }) {
	let n = mn(), r = Ks(), i = [
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
		qs
	].some((t) => e.value(t)), a = Xa(e.value(qs) ?? ""), o = {
		width: a.find((e) => /^-?[\d.]/.test(e)),
		color: a.find((e) => !/^-?[\d.]/.test(e))
	}, s = e.value("textOverflow") === "ellipsis" && e.value("whiteSpace") === "nowrap";
	return /* @__PURE__ */ U(ho, {
		s: e,
		group: "typography",
		title: w("Typography"),
		empty: !i && !t?.on,
		children: [
			t && /* @__PURE__ */ H(Z, {
				fields: [{
					handle: "prose",
					type: "toggle",
					label: w("Prose")
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
						label: w("Font"),
						placeholder: w("Inherit"),
						options: n.of("font").map((e) => ({
							value: e.ref,
							label: `${e.name} · ${e.value.split(",")[0].replace(/["']/g, "")}`
						}))
					},
					{
						handle: "fontWeight",
						type: "select",
						size: "sm",
						label: w("Weight"),
						placeholder: w("Inherit"),
						options: n.of("weight").map((e) => ({
							value: e.ref,
							label: r[e.value] ?? `${e.name} · ${e.value}`
						}))
					},
					{
						handle: "fontSize",
						type: "text",
						component: "blocks-value",
						label: w("Size"),
						group: "text",
						prefixIcon: "richtext",
						placeholder: w("Inherit"),
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
						label: w("Line Height"),
						group: "leading",
						prefixIcon: "height",
						unit: "",
						step: .05,
						placeholder: w("Inherit"),
						title: w("Line Height (1.2 = 120%)")
					},
					{
						handle: "letterSpacing",
						type: "text",
						component: "blocks-value",
						label: w("Letter Spacing"),
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
						label: w("Color"),
						placeholder: w("Inherit")
					},
					{
						handle: "textAlign",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: w("Align"),
						placeholder: "left",
						options: [
							{
								value: "left",
								icon: "align-left",
								title: w("Left")
							},
							{
								value: "center",
								icon: "align-center",
								title: w("Center")
							},
							{
								value: "right",
								icon: "align-right",
								title: w("Right")
							},
							{
								value: "justify",
								icon: "align-justify",
								title: w("Justify||text")
							}
						]
					},
					{
						handle: "fontStyle",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: w("Style"),
						placeholder: "normal",
						options: [{
							value: "normal",
							icon: "text",
							title: w("Upright")
						}, {
							value: "italic",
							icon: "italic",
							title: w("Italic")
						}]
					},
					{
						handle: "textDecorationLine",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: w("Decoration"),
						placeholder: "none",
						options: [
							{
								value: "none",
								icon: "close",
								title: w("No Decoration")
							},
							{
								value: "underline",
								icon: "underline",
								title: w("Underline")
							},
							{
								value: "line-through",
								icon: "strike",
								title: w("Strike Through")
							}
						]
					},
					{
						handle: "textTransform",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: w("Case"),
						placeholder: "none",
						options: [
							{
								value: "none",
								icon: "close",
								title: w("As Typed")
							},
							{
								value: "uppercase",
								label: "AA",
								title: w("Uppercase")
							},
							{
								value: "capitalize",
								label: "Aa",
								title: w("Capitalize")
							},
							{
								value: "lowercase",
								label: "aa",
								title: w("Lowercase")
							}
						]
					},
					{
						handle: "textWrap",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: w("Wrap"),
						options: [
							{
								value: "balance",
								label: w("Balance")
							},
							{
								value: "pretty",
								label: w("Pretty")
							},
							{
								value: "nowrap",
								label: w("None")
							}
						]
					},
					{
						handle: "lineClamp",
						type: "text",
						component: "blocks-value",
						label: w("Max Lines"),
						unit: "",
						min: 1,
						placeholder: w("All"),
						prefixIcon: "list-tree",
						markers: ["-webkit-line-clamp"],
						get: () => e.value("-webkit-line-clamp"),
						set: (t) => e.swap(["-webkit-line-clamp", "text-overflow"], t && e.engine?.valid(`line-clamp-${t}`) ? `line-clamp-${t}` : null)
					},
					{
						handle: "truncate",
						type: "toggle",
						size: "sm",
						label: w("Truncate"),
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
					label: w("Text Shadow")
				}]
			}),
			/* @__PURE__ */ H(Q, {
				s: e,
				fields: [{
					handle: "stroke",
					type: "group",
					component: "blocks-group",
					label: w("Text Stroke"),
					keys: [qs],
					get: () => o,
					set: (t) => {
						let n = {
							...o,
							...to(o, t)
						};
						e.set(qs, n.width ? `${n.width} ${n.color ?? "currentColor"}` : null);
					},
					fields: [{
						handle: "width",
						type: "text",
						component: "blocks-value",
						label: w("Width"),
						prefixIcon: "edit",
						placeholder: "0",
						min: 0,
						step: .5,
						className: "!flex-none w-[72px]"
					}, {
						handle: "color",
						type: "color",
						component: "blocks-color",
						label: w("Color"),
						placeholder: w("Text Color")
					}]
				}]
			})
		]
	});
}
// admin/src/builder/design/DesignPanel.tsx
var Ys = [
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
function Xs({ s: e, groups: t = Ys, container: n = !0, parentDisplay: r, media: i, prose: a }) {
	let o = (e) => t.includes(e);
	return /* @__PURE__ */ U(je, { children: [
		o("layout") && n && /* @__PURE__ */ H(ms, { s: e }),
		r && /flex|grid/.test(r) && /* @__PURE__ */ H(hs, {
			s: e,
			parentDisplay: r
		}),
		o("position") && /* @__PURE__ */ H(gs, { s: e }),
		o("size") && /* @__PURE__ */ H(vs, {
			s: e,
			media: i
		}),
		o("spacing") && /* @__PURE__ */ H(Cs, { s: e }),
		o("typography") && /* @__PURE__ */ H(Js, {
			s: e,
			prose: a
		}),
		o("fill") && /* @__PURE__ */ H(ls, { s: e }),
		o("border") && /* @__PURE__ */ H(To, { s: e }),
		o("effects") && /* @__PURE__ */ H(Io, { s: e }),
		o("transform") && /* @__PURE__ */ H(Hs, { s: e }),
		o("transition") && /* @__PURE__ */ H(Gs, { s: e }),
		t.length > 1 && /* @__PURE__ */ H(_o, { s: e })
	] });
}
function Zs({ node: t }) {
	let { types: n, store: r, readOnly: i } = W(), a = fn(), o = n.get(t.type), s = Ya(t), l = K(r, (e) => e.state), u = K(r, (e) => c(e.nodes, t.id)), d = K(r, (n) => e(n.nodes, t.id)), f = A(() => {
		if (u) return ut(a.engine, Ge(u.class), s.screen, [], () => {}).value("display") ?? (u.type === "stack" || u.type === "columns" || u.type === "grid" ? "flex" : void 0);
	}, [
		u,
		a.engine,
		s.screen
	]), p = t.type === "outlet" && !t.props?.wrap, m = p ? ["typography"] : o?.styles?.length ? o.styles : Ys;
	return t.type === "component" ? /* @__PURE__ */ H("p", {
		className: "m-0 p-4 text-xs text-muted",
		children: w("Edit the component to change its shared design.")
	}) : /* @__PURE__ */ U("div", { children: [
		!a.engine && !a.loading && /* @__PURE__ */ H("div", {
			className: "border-b border-border px-4 py-3",
			children: /* @__PURE__ */ H(he, {
				tone: "warning",
				title: w("The site’s stylesheet could not be read"),
				action: /* @__PURE__ */ H(_, {
					to: "/design/colors",
					className: "shrink-0 text-xs text-text",
					children: w("Open Design")
				})
			})
		}),
		/* @__PURE__ */ H("div", {
			className: "sticky top-0 z-raised bg-surface",
			children: /* @__PURE__ */ H(Bs, {
				s,
				site: a.classes,
				source: a.source,
				disabled: i,
				state: {
					classes: s.classes,
					engine: a.engine,
					state: l,
					onState: r.setStyleState,
					states: kt(t, d)
				}
			})
		}),
		/* @__PURE__ */ H(Xs, {
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
var Qs = () => [
	{
		value: "click",
		label: w("Click")
	},
	{
		value: "mouseenter",
		label: w("Pointer Enters")
	},
	{
		value: "mouseleave",
		label: w("Pointer Leaves")
	},
	{
		value: "focus",
		label: w("Gets Focus")
	},
	{
		value: "blur",
		label: w("Loses Focus")
	},
	{
		value: "input",
		label: w("Typing")
	},
	{
		value: "change",
		label: w("Value Changes")
	},
	{
		value: "submit",
		label: w("Form Submit")
	},
	{
		value: "keydown",
		label: w("Key Pressed")
	},
	{
		value: "enter",
		label: w("Scrolls into View")
	},
	{
		value: "leave",
		label: w("Scrolls Out of View")
	},
	{
		value: "scroll",
		label: w("Page Scrolls")
	},
	{
		value: "resize",
		label: w("Window Resizes")
	},
	{
		value: "init",
		label: w("Page Loads")
	}
], $s = () => [
	{
		value: "prevent",
		label: w("Prevent Default")
	},
	{
		value: "stop",
		label: w("Stop Propagation")
	},
	{
		value: "outside",
		label: w("Outside This Element")
	},
	{
		value: "window",
		label: w("Anywhere on the Page")
	},
	{
		value: "once",
		label: w("Only Once")
	},
	{
		value: "self",
		label: w("On This Element Only")
	},
	{
		value: "debounce",
		label: w("Debounce")
	}
], ec = () => [
	{
		value: "set",
		label: w("Set State"),
		icon: "edit"
	},
	{
		value: "toggle",
		label: w("Toggle State"),
		icon: "toggle-left"
	},
	{
		value: "add",
		label: w("Add to Number"),
		icon: "plus"
	},
	{
		value: "if",
		label: w("If … Then … Else"),
		icon: "github"
	},
	{
		value: "play",
		label: w("Play Animation"),
		icon: "play"
	},
	{
		value: "scroll",
		label: w("Scroll To"),
		icon: "mouse-scroll"
	},
	{
		value: "fetch",
		label: w("Load Page Part"),
		icon: "external"
	},
	{
		value: "copy",
		label: w("Copy to Clipboard"),
		icon: "copy"
	},
	{
		value: "go",
		label: w("Go to Link"),
		icon: "link-chain"
	},
	{
		value: "theme",
		label: w("Light or Dark Mode"),
		icon: "moon"
	},
	{
		value: "focus",
		label: w("Focus Element"),
		icon: "position"
	},
	{
		value: "lock",
		label: w("Lock Page Scrolling"),
		icon: "lock"
	},
	{
		value: "wait",
		label: w("Wait"),
		icon: "timer"
	},
	{
		value: "dispatch",
		label: w("Send Event"),
		icon: "broadcast"
	},
	{
		value: "run",
		label: w("Expression"),
		icon: "braces"
	}
];
function tc(t) {
	let { store: n } = W(), r = K(n, (n) => e(n.nodes, t.id));
	return [...new Set([...r, t].flatMap((e) => Object.keys(e.logic?.data ?? {})))];
}
function nc(e) {
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
var rc = (e) => typeof e == "string" ? `'${e}'` : JSON.stringify(e), ic = (e, t, n = {}) => ({
	handle: e,
	type: "text",
	size: "sm",
	commit: "blur",
	label: t,
	mono: !0,
	max: 1e4,
	list: ac,
	placeholder: "open, count > 3, tab === 'a'",
	...n
}), ac = "cms-logic-variables", oc = (e, ...t) => e ? t : [], sc = [
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
function cc({ label: e, options: t, value: n, onChange: r }) {
	return /* @__PURE__ */ U("div", {
		className: "flex min-h-7 items-center gap-2",
		children: [/* @__PURE__ */ H(ra, { field: {
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
						children: n.length ? n.join(", ") : w("None")
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
					label: w("None"),
					disabled: !0
				}]
			})
		})]
	});
}
var lc = { strip: "[^A-Za-z0-9_-]" }, uc = (e) => e.replace(/^[^A-Za-z_]+/, "").slice(0, 41);
function dc({ node: e }) {
	let { store: t } = W(), n = T("styling-code/list", {}, { staleTime: 3e4 }), r = e.behavior, i = e.code ?? {}, a = (e, ...t) => [.../* @__PURE__ */ new Set([...n.data?.[e] ?? [], ...t.filter((e) => !!e)])], o = (n) => t.updateNode(e.id, { behavior: n && (n.module ?? r?.module) ? {
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
					label: w("Script"),
					placeholder: w("None"),
					options: a("scripts", r?.module),
					status: r ? "own" : void 0,
					reset: () => o(null)
				}, ...oc(r, {
					handle: "when",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: w("Runs"),
					required: !0,
					options: [
						{
							value: "load",
							label: w("On Load")
						},
						{
							value: "visible",
							label: w("In View")
						},
						{
							value: "idle",
							label: w("When Idle")
						}
					]
				})],
				values: {
					module: r?.module,
					when: r?.when ?? "load"
				},
				onChange: (e, t) => o(e === "module" ? t ? { module: String(t) } : null : { when: t === "visible" || t === "idle" ? t : void 0 })
			}),
			r && /* @__PURE__ */ U(je, { children: [/* @__PURE__ */ H(na, {
				title: w("Options"),
				action: /* @__PURE__ */ H(la, {
					label: w("Add Option"),
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
					label: w("Options"),
					key: lc,
					join: "=",
					item: {
						handle: "value",
						type: "text",
						size: "sm",
						commit: "blur",
						label: w("Value"),
						mono: !0
					}
				}],
				values: { props: Object.fromEntries(Object.entries(c).map(([e, t]) => [e, rc(t)])) },
				onChange: (e, t) => {
					let n = Object.fromEntries(Object.entries(t).map(([e, t]) => [uc(e), e in c && rc(c[e]) === t ? c[e] : nc(t ?? "")]).filter(([e]) => e !== ""));
					o({ props: Object.keys(n).length ? n : void 0 });
				}
			})] }),
			/* @__PURE__ */ H(cc, {
				label: w("Load Scripts"),
				options: a("scripts", ...i.scripts ?? []),
				value: i.scripts ?? [],
				onChange: (e) => s("scripts", e)
			}),
			/* @__PURE__ */ H(cc, {
				label: w("Load Styles"),
				options: a("styles", ...i.styles ?? []),
				value: i.styles ?? [],
				onChange: (e) => s("styles", e)
			})
		]
	});
}
function fc({ node: e }) {
	let { store: t, types: n } = W(), r = e.logic ?? {}, i = tc(e), a = (n) => {
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
	return /* @__PURE__ */ U(je, { children: [
		/* @__PURE__ */ H("datalist", {
			id: ac,
			children: [...i, ...i.map((e) => `!${e}`)].map((e) => /* @__PURE__ */ H("option", { value: e }, e))
		}),
		/* @__PURE__ */ H(ea, {
			title: w("State"),
			empty: !r.data,
			open: !!r.data,
			actions: /* @__PURE__ */ H(la, {
				label: w("Add Variable"),
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
					label: w("Variables"),
					key: { strip: "[^a-zA-Z0-9_]" },
					join: "=",
					item: {
						handle: "value",
						type: "text",
						size: "sm",
						commit: "blur",
						label: w("Value"),
						mono: !0
					}
				}],
				values: { data: Object.fromEntries(Object.entries(o).map(([e, t]) => [e, rc(t)])) },
				onChange: (e, t) => a({ data: Object.fromEntries(Object.entries(t).map(([e, t]) => [e, e in o && rc(o[e]) === t ? o[e] : nc(t ?? "")])) })
			})
		}),
		/* @__PURE__ */ U(ea, {
			title: w("Events"),
			empty: !r.on?.length && !r.init?.length,
			open: !!r.on?.length || !!r.init?.length,
			actions: /* @__PURE__ */ H(la, {
				label: w("Add Event"),
				onClick: () => a({ on: [...r.on ?? [], {
					event: "click",
					actions: []
				}] })
			}),
			children: [
				r.init && /* @__PURE__ */ H(mc, {
					title: w("Page Loads"),
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
					return /* @__PURE__ */ H(mc, {
						title: /* @__PURE__ */ H(Z, {
							bare: !0,
							className: "min-w-0 flex-1",
							fields: [{
								handle: "trigger",
								type: "group",
								component: "blocks-group",
								label: w("Event"),
								fields: [{
									handle: "event",
									type: "select",
									size: "sm",
									label: w("Event"),
									required: !0,
									options: Qs().filter((e) => e.value !== "init")
								}, {
									handle: "key",
									type: "text",
									size: "sm",
									commit: "blur",
									label: w("Keyboard Key"),
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
				!r.init && (r.on?.length ?? 0) > 0 && /* @__PURE__ */ H(ca, {
					onClick: () => a({ init: [] }),
					children: w("When the Page Loads")
				})
			]
		}),
		/* @__PURE__ */ U(ea, {
			title: w("Bindings"),
			empty: !r.show && !r.states && !r.text && !r.attrs,
			open: !!(r.show || r.states || r.text || r.attrs),
			children: [
				/* @__PURE__ */ H(Z, {
					fields: [ic("show", w("Show When"), {
						placeholder: w("Always"),
						status: r.show ? "own" : void 0,
						reset: () => a({
							show: void 0,
							transition: void 0
						})
					}), ...oc(r.show, {
						handle: "transition",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: w("Transition"),
						options: [
							{
								value: "none",
								label: w("None")
							},
							{
								value: "fade",
								label: w("Fade")
							},
							{
								value: "scale",
								label: w("Scale")
							},
							{
								value: "collapse",
								label: w("Collapse")
							}
						]
					})],
					values: {
						show: r.show,
						transition: r.transition ?? "none"
					},
					onChange: (e, t) => a(e === "show" ? { show: t || void 0 } : { transition: t && t !== "none" ? t : void 0 })
				}),
				/* @__PURE__ */ H(na, {
					title: w("States"),
					action: /* @__PURE__ */ H(la, {
						label: w("Add State"),
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
						label: w("States"),
						key: {
							prefix: "data-",
							lower: !0,
							strip: "[^a-z0-9-]",
							className: "!w-[38%] !flex-none"
						},
						join: w("when"),
						item: ic("expr", w("When||condition"))
					}],
					values: { states: r.states },
					onChange: (e, t) => a({ states: t })
				}),
				/* @__PURE__ */ H(Z, {
					fields: [ic("text", w("Text"), {
						placeholder: w("As Designed"),
						status: r.text ? "own" : void 0,
						reset: () => a({ text: void 0 })
					})],
					values: { text: r.text },
					onChange: (e, t) => a({ text: t || void 0 })
				}),
				/* @__PURE__ */ H(na, {
					title: w("Attributes"),
					action: /* @__PURE__ */ H(la, {
						label: w("Bind Attribute"),
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
						label: w("Attributes"),
						key: {
							options: sc,
							className: ""
						},
						item: ic("expr", w("Value"))
					}],
					values: { attrs: r.attrs },
					onChange: (e, t) => a({ attrs: t })
				}),
				e.type === "input" && /* @__PURE__ */ H(Z, {
					fields: [{
						handle: "model",
						type: "select",
						size: "sm",
						label: w("Input Value"),
						placeholder: w("Not kept"),
						options: i,
						status: r.model ? "own" : void 0,
						reset: () => a({ model: void 0 })
					}],
					values: { model: r.model },
					onChange: (e, t) => a({ model: t || void 0 })
				})
			]
		}),
		/* @__PURE__ */ U(ea, {
			title: w("Behaviors"),
			empty: !r.behaviors && !r.component && !l,
			open: !!r.behaviors || !!r.component || l,
			children: [
				/* @__PURE__ */ H(pc, {
					on: !!c.scroll,
					label: w("Scroll States"),
					onToggle: (e) => a({ behaviors: {
						...c,
						scroll: e ? { threshold: 20 } : void 0
					} }),
					fields: [{
						handle: "threshold",
						type: "text",
						component: "blocks-value",
						label: w("After||a distance"),
						unit: "",
						prefix: "px"
					}, {
						handle: "hide",
						type: "toggle",
						size: "sm",
						label: w("Add data-hidden While Scrolling Down")
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
				/* @__PURE__ */ H(pc, {
					on: !!c.spy,
					label: w("Scroll Spy"),
					onToggle: (e) => a({ behaviors: {
						...c,
						spy: e ? { offset: 96 } : void 0
					} })
				}),
				/* @__PURE__ */ H(pc, {
					on: !!c.group,
					label: w("Hover Group"),
					onToggle: (e) => a({ behaviors: {
						...c,
						group: e || void 0
					} })
				}),
				/* @__PURE__ */ H(pc, {
					on: !!c.menu,
					label: w("Menu"),
					onToggle: (e) => a({ behaviors: {
						...c,
						menu: e ? {} : void 0
					} })
				}),
				/* @__PURE__ */ H(pc, {
					on: !!c.carousel,
					label: w("Carousel"),
					onToggle: (e) => a({ behaviors: {
						...c,
						carousel: e ? {} : void 0
					} })
				}),
				/* @__PURE__ */ H(pc, {
					on: !!c.marquee,
					label: w("Marquee"),
					onToggle: (e) => a({ behaviors: {
						...c,
						marquee: e ? { speed: 60 } : void 0
					} }),
					fields: [
						{
							handle: "speed",
							type: "text",
							component: "blocks-value",
							label: w("Speed"),
							unit: "",
							prefix: "px/s",
							title: w("Pixels per Second")
						},
						{
							handle: "reverse",
							type: "toggle",
							size: "sm",
							label: w("Reverse")
						},
						{
							handle: "pause",
							type: "toggle",
							size: "sm",
							label: w("Pause on Hover")
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
				v("site.code") && /* @__PURE__ */ H(dc, { node: e }),
				/* @__PURE__ */ H(Z, {
					fields: [{
						handle: "component",
						type: "text",
						size: "sm",
						commit: "blur",
						label: w("Alpine"),
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
		s && /* @__PURE__ */ H(ea, {
			title: w("Load Into"),
			open: !!r.target,
			empty: !r.target && !r.merge,
			children: /* @__PURE__ */ H(Z, {
				fields: [
					{
						handle: "target",
						type: "json",
						component: "blocks-nodes",
						label: w("Update"),
						exclude: e.id,
						add: w("Element to Update"),
						addValue: e.id
					},
					...oc(r.target, {
						handle: "push",
						type: "toggle",
						size: "sm",
						label: w("Update the Address Bar")
					}),
					{
						handle: "merge",
						type: "select",
						size: "sm",
						label: w("When Loaded"),
						placeholder: w("Replace It"),
						options: [
							{
								value: "replace",
								label: w("Replace It")
							},
							{
								value: "update",
								label: w("Replace What Is Inside")
							},
							{
								value: "append",
								label: w("Add to the End")
							},
							{
								value: "prepend",
								label: w("Add to the Start")
							},
							{
								value: "morph",
								label: w("Morph (Keep State)")
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
function pc({ on: e, label: t, onToggle: n, fields: r, values: i, onChange: a }) {
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
function mc({ title: e, mods: t, onMods: n, actions: r, onActions: i, onRemove: a, variables: o, node: s }) {
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
							label: w("Event Options"),
							size: "xs",
							active: !!t?.length
						}),
						items: $s().map((e) => ({
							label: e.label,
							checked: t?.includes(e.value),
							onSelect: () => n(t?.includes(e.value) ? t.filter((t) => t !== e.value) : [...t ?? [], e.value])
						}))
					}),
					/* @__PURE__ */ H(ua, {
						onClick: a,
						label: w("Remove Event")
					})
				]
			}),
			t && t.length > 0 && /* @__PURE__ */ H("p", {
				className: "m-0 pl-5 text-2xs text-faint [overflow-wrap:anywhere]",
				children: t.map((e) => $s().find((t) => t.value === e)?.label).join(" · ")
			}),
			/* @__PURE__ */ H(hc, {
				actions: r,
				onChange: i,
				variables: o,
				node: s
			})
		]
	});
}
function hc({ actions: e, onChange: t, variables: n, node: r, depth: i = 0 }) {
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
						name: ec().find((e) => e.value === a.do)?.icon ?? "dot-outline",
						size: 14,
						className: "shrink-0 text-muted"
					}),
					/* @__PURE__ */ H("span", {
						className: "min-w-0 flex-1 text-xs font-medium text-text [overflow-wrap:anywhere]",
						children: ec().find((e) => e.value === a.do)?.label ?? a.do
					}),
					/* @__PURE__ */ H(ua, {
						onClick: () => t(e.filter((e, t) => t !== s)),
						label: w("Remove Action")
					})
				]
			}), /* @__PURE__ */ H(_c, {
				action: a,
				onChange: (e) => o(s, e),
				variables: n,
				node: r,
				depth: i
			})]
		}, s)), /* @__PURE__ */ H(de, {
			align: "start",
			trigger: /* @__PURE__ */ H(ca, { children: w("Add Action") }),
			items: ec().map((e) => ({
				label: e.label,
				icon: e.icon,
				onSelect: () => a(e.value)
			}))
		})]
	});
}
var gc = (e) => e === "top" || e === "bottom" ? e : e?.startsWith("#") ? "anchor" : "node";
function _c({ action: e, onChange: n, variables: r, node: i, depth: a }) {
	let { store: o } = W(), s = Ln(), c = K(o, (n) => e.do === "play" && e.node ? t(n.nodes, e.node) : null), l = {
		handle: "var",
		type: "select",
		size: "sm",
		label: w("Variable"),
		options: r,
		placeholder: w("Variable")
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
			f = [l, ic("value", e.do === "set" ? w("To||set a value") : w("Add||to a number"), { placeholder: e.do === "set" ? "true, 'text', count + 1" : "1" })];
			break;
		case "toggle":
			f = [l];
			break;
		case "if":
			f = [ic("test", w("If"), { placeholder: "open" })];
			break;
		case "play":
			f = [
				u("node", w("Element")),
				{
					handle: "motion",
					type: "select",
					size: "sm",
					label: w("Animation"),
					options: (c?.motion ?? []).map((e) => ({
						value: e.id,
						label: e.name || e.id
					})),
					placeholder: c?.motion?.length ? w("First Animation") : w("No animations on it")
				},
				d("mode", w("Play"), [
					{
						value: "play",
						label: w("Play")
					},
					{
						value: "reverse",
						label: w("Reverse")
					},
					{
						value: "toggle",
						label: w("Toggle")
					},
					{
						value: "restart",
						label: w("Restart")
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
					label: w("To"),
					required: !0,
					options: [
						{
							value: "top",
							label: w("Top of Page")
						},
						{
							value: "bottom",
							label: w("Bottom of Page")
						},
						{
							value: "anchor",
							label: w("Section")
						},
						{
							value: "node",
							label: w("Element")
						}
					]
				},
				{
					handle: "anchor",
					type: "select",
					size: "sm",
					label: w("Section"),
					options: s.map((e) => ({
						value: `#${e.id}`,
						label: e.label
					})),
					placeholder: w("Choose a Section"),
					if: { kind: "anchor" }
				},
				u("node", w("Element"), { if: { kind: "node" } }),
				{
					handle: "offset",
					type: "text",
					component: "blocks-value",
					label: w("Offset"),
					unit: "",
					prefix: "px",
					placeholder: "0",
					title: w("Offset in pixels, e.g. a sticky header’s height")
				}
			], p = {
				kind: gc(e.to),
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
				label: w("Page"),
				placeholder: "/blog/page/2",
				mono: !0
			}, {
				handle: "target",
				type: "json",
				component: "blocks-nodes",
				label: w("Update"),
				addValue: i.id
			}];
			break;
		case "copy":
			f = [ic("value", w("Text"), { placeholder: `'${w("Text to Copy")}'` })];
			break;
		case "go":
			f = [{
				handle: "url",
				type: "url",
				component: "link",
				reference: !0,
				size: "sm",
				label: w("Link"),
				anchors: s,
				newTab: !!e.newTab,
				onNewTab: (e) => n({ newTab: e || void 0 })
			}], m = (e, t) => ({ url: t ?? "" });
			break;
		case "theme":
			f = [d("mode", w("Mode"), [
				{
					value: "toggle",
					label: w("Switch||between two")
				},
				{
					value: "light",
					label: w("Light")
				},
				{
					value: "dark",
					label: w("Dark")
				},
				{
					value: "system",
					label: w("System")
				}
			])], p = { mode: e.mode ?? "toggle" };
			break;
		case "focus":
			f = [u("node", w("Element"))], m = (e, t) => ({ node: t ?? void 0 });
			break;
		case "lock":
			f = [d("on", w("Scrolling"), [{
				value: "on",
				label: w("Lock")
			}, {
				value: "off",
				label: w("Unlock")
			}])], p = { on: e.on === !1 ? "off" : "on" }, m = (e, t) => ({ on: t !== "off" });
			break;
		case "wait":
			f = [{
				handle: "ms",
				type: "text",
				component: "blocks-value",
				label: w("Wait"),
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
				label: w("Event"),
				placeholder: "event-name",
				mono: !0
			}, ic("detail", w("Detail"), { placeholder: "detail" })], m = (e, t) => ({ [e]: e === "detail" ? t || void 0 : t ?? "" });
			break;
		case "run":
			f = [ic("expr", w("Run"), { placeholder: "count = count * 2" })];
			break;
		default: return /* @__PURE__ */ H("p", {
			className: V(oa, "h-auto whitespace-pre-wrap font-mono [overflow-wrap:anywhere]"),
			children: JSON.stringify(e)
		});
	}
	return /* @__PURE__ */ U("div", {
		className: "space-y-1",
		children: [/* @__PURE__ */ H(Z, {
			fields: f,
			values: p,
			onChange: (e, t) => n(m(e, t))
		}), e.do === "if" && /* @__PURE__ */ U(je, { children: [
			/* @__PURE__ */ H("p", {
				className: "cms-label m-0 pt-1",
				children: w("Then")
			}),
			/* @__PURE__ */ H(hc, {
				actions: e.then ?? [],
				onChange: (e) => n({ then: e }),
				variables: r,
				node: i,
				depth: a + 1
			}),
			/* @__PURE__ */ H("p", {
				className: "cms-label m-0 pt-1",
				children: w("Else")
			}),
			/* @__PURE__ */ H(hc, {
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
var vc = (e) => ({
	appear: w("Appear"),
	scroll: w("Scroll"),
	hover: w("Hover and Press"),
	loop: w("Loop"),
	load: w("Page Load"),
	event: w("On Event")
})[e], yc = "power3.out", bc = () => [
	{
		name: w("Fade In"),
		group: "appear",
		make: () => ({
			trigger: { type: "appear" },
			steps: [{
				target: "self",
				from: { opacity: 0 },
				duration: .8,
				ease: yc
			}]
		})
	},
	{
		name: w("Fade Up"),
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
				ease: yc
			}]
		})
	},
	{
		name: w("Slide in from Left"),
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
				ease: yc
			}]
		})
	},
	{
		name: w("Scale In"),
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
		name: w("Blur In"),
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
				ease: yc
			}]
		})
	},
	{
		name: w("Reveal (Wipe Up)"),
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
		name: w("Children one by one"),
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
				ease: yc,
				stagger: .08
			}]
		})
	},
	{
		name: w("Words Rise"),
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
				ease: yc,
				stagger: .04
			}]
		})
	},
	{
		name: w("Words Slide Up (Masked)"),
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
		name: w("Parallax"),
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
		name: w("Zoom While Scrolling"),
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
		name: w("Fade Through"),
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
		name: w("Highlight Words"),
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
		name: w("Rotate While Scrolling"),
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
		name: w("Slide Sideways"),
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
		name: w("Lift"),
		group: "hover",
		make: () => ({
			trigger: { type: "hover" },
			steps: [{
				target: "self",
				to: { y: -6 },
				duration: .3,
				ease: yc
			}]
		})
	},
	{
		name: w("Grow"),
		group: "hover",
		make: () => ({
			trigger: { type: "hover" },
			steps: [{
				target: "self",
				to: { scale: 1.04 },
				duration: .35,
				ease: yc
			}]
		})
	},
	{
		name: w("Zoom Image Inside"),
		group: "hover",
		make: () => ({
			trigger: { type: "hover" },
			steps: [{
				target: "children",
				to: { scale: 1.06 },
				duration: .6,
				ease: yc
			}]
		})
	},
	{
		name: w("Press"),
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
		name: w("Float"),
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
		name: w("Spin"),
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
		name: w("Pulse"),
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
		name: w("Intro: Fade Up"),
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
				ease: yc,
				delay: .1
			}]
		})
	},
	{
		name: w("Intro: Words"),
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
				ease: yc,
				stagger: .05
			}]
		})
	},
	{
		name: w("Intro: Children"),
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
				ease: yc,
				stagger: .1
			}]
		})
	},
	{
		name: w("Open (Fade and Scale)"),
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
				ease: yc
			}]
		})
	},
	{
		name: w("Slide in Panel"),
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
				ease: yc,
				stagger: .05
			}]
		})
	}
], xc = () => ({
	appear: {
		label: w("Appear"),
		icon: "eye"
	},
	scroll: {
		label: w("Scroll"),
		icon: "mouse-scroll"
	},
	hover: {
		label: w("Hover"),
		icon: "hand-pointing"
	},
	press: {
		label: w("Press"),
		icon: "hand-tap"
	},
	load: {
		label: w("Page Load"),
		icon: "rocket"
	},
	loop: {
		label: w("Loop"),
		icon: "refresh"
	},
	event: {
		label: w("On Event"),
		icon: "broadcast"
	}
}), Sc = () => ({
	opacity: w("Opacity"),
	x: w("Move X"),
	y: w("Move Y"),
	xPercent: w("Move X %"),
	yPercent: w("Move Y %"),
	z: w("Move Z"),
	scale: w("Scale"),
	scaleX: w("Scale X"),
	scaleY: w("Scale Y"),
	rotate: w("Rotate"),
	rotateX: w("Rotate X (3D)"),
	rotateY: w("Rotate Y (3D)"),
	skewX: w("Skew X"),
	skewY: w("Skew Y"),
	blur: w("Blur"),
	brightness: w("Brightness"),
	grayscale: w("Grayscale"),
	clipPath: w("Clip Path"),
	backgroundColor: w("Fill"),
	color: w("Text Color"),
	borderColor: w("Border Color"),
	borderRadius: w("Radius"),
	boxShadow: w("Shadow"),
	letterSpacing: w("Letter Spacing"),
	transformOrigin: w("Origin"),
	perspective: w("Perspective")
}), Cc = () => [
	{
		value: "power3.out",
		label: w("Smooth Out")
	},
	{
		value: "expo.out",
		label: w("Expo Out")
	},
	{
		value: "power4.inOut",
		label: w("Smooth In-Out")
	},
	{
		value: "power2.out",
		label: w("Gentle Out")
	},
	{
		value: "back.out(1.7)",
		label: w("Overshoot")
	},
	{
		value: "elastic.out(1, 0.4)",
		label: w("Elastic")
	},
	{
		value: "bounce.out",
		label: w("Bounce")
	},
	{
		value: "sine.inOut",
		label: w("Sine In-Out")
	},
	{
		value: "power2.in",
		label: w("Ease In")
	},
	{
		value: "none",
		label: w("Linear")
	},
	{
		value: "cubic-bezier(0.2, 0.8, 0.2, 1)",
		label: w("Signature Ease")
	}
], wc = (e, t, n = {}) => ({
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
}), Tc = /^\d{1,5}(\.\d{1,2})?(px|rem|vh|svh|lvh|dvh)$/, Ec = [
	"vh",
	"svh",
	"lvh",
	"dvh",
	"px",
	"rem"
], Dc = (e, ...t) => e ? t : [], Oc = [
	"heading",
	"paragraph",
	"link",
	"button",
	"quote"
], kc = (e) => {
	let t = e.length + 1;
	for (; e.some((e) => e.id === `m${t}`);) t++;
	return `m${t}`;
}, Ac = (e = "self") => e.startsWith("#") ? w("Another Element") : {
	self: w("This Element"),
	children: w("Children"),
	words: w("Words"),
	lines: w("Lines||of text"),
	chars: w("Letters")
}[e] ?? e;
function jc({ node: e }) {
	let { store: t } = W(), n = e.motion ?? [], [r, i] = M(n[0]?.id ?? null), a = (n) => t.updateNode(e.id, { motion: n.length ? n : void 0 }, `motion:${e.id}`), o = (e, t) => a(n.map((n) => n.id === e ? {
		...n,
		...t
	} : n)), s = Oc.includes(e.type), c = xc(), l = (t) => {
		let r = kc(n), o = t ? {
			id: r,
			name: t.name,
			...t.make()
		} : {
			id: r,
			name: w("Custom"),
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
		a([...n, o]), i(r), requestAnimationFrame(() => ri.emit("preview-motion", {
			node: e.id,
			motion: o
		}));
	}, u = bc(), d = [...new Set(u.map((e) => e.group))];
	return /* @__PURE__ */ H(ea, {
		title: w("Animations"),
		empty: n.length === 0,
		actions: /* @__PURE__ */ H(de, {
			align: "end",
			trigger: /* @__PURE__ */ H(L, {
				icon: "plus",
				label: w("Add Animation"),
				size: "xs"
			}),
			items: [
				...d.flatMap((e) => [{
					label: vc(e),
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
					label: w("Custom Animation"),
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
						content: w("Preview Animation"),
						children: /* @__PURE__ */ H(L, {
							icon: "play",
							label: w("Preview Animation"),
							title: void 0,
							size: "xs",
							onClick: () => ri.emit("preview-motion", {
								node: e.id,
								motion: t
							})
						})
					}),
					/* @__PURE__ */ H(ua, {
						onClick: () => a(n.filter((e) => e.id !== t.id)),
						label: w("Remove Animation")
					})
				]
			}), r === t.id && /* @__PURE__ */ H(Mc, {
				node: e,
				motion: t,
				onChange: (e) => o(t.id, e)
			})]
		}, t.id))
	});
}
function Mc({ node: e, motion: t, onChange: n }) {
	let [r, i] = M(0), a = xc(), o = t.trigger, s = (e) => n({ trigger: {
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
		label: w("Name")
	}, {
		handle: "type",
		type: "select",
		size: "sm",
		label: w("Trigger"),
		required: !0,
		options: Object.entries(a).map(([e, t]) => ({
			value: e,
			label: t.label
		}))
	}], f = [
		...Dc(o.type === "appear", {
			handle: "start",
			type: "select",
			size: "sm",
			label: w("Starts"),
			placeholder: w("A little into view"),
			options: [
				{
					value: "top 95%",
					label: w("As soon as it peeks in")
				},
				{
					value: "top 85%",
					label: w("A little into view")
				},
				{
					value: "top 65%",
					label: w("A third into view")
				},
				{
					value: "center center",
					label: w("At the Center")
				}
			]
		}, {
			handle: "replay",
			type: "toggle",
			size: "sm",
			label: w("Reverse When Scrolled Back")
		}),
		...Dc(o.type === "scroll", {
			handle: "start",
			type: "select",
			size: "sm",
			label: w("Begins"),
			placeholder: w("Enters the Screen"),
			options: [
				{
					value: "top bottom",
					label: w("Enters the Screen")
				},
				{
					value: "top 80%",
					label: w("Top at 80%")
				},
				{
					value: "top center",
					label: w("Top at Center")
				},
				{
					value: "top top",
					label: w("Top at Top")
				},
				{
					value: "center center",
					label: w("Centered")
				}
			]
		}, {
			handle: "end",
			type: "select",
			size: "sm",
			label: w("Ends"),
			placeholder: w("Leaves the Screen"),
			options: [
				{
					value: "bottom top",
					label: w("Leaves the Screen")
				},
				{
					value: "center center",
					label: w("Centered")
				},
				{
					value: "top top",
					label: w("Top at Top")
				},
				{
					value: "bottom center",
					label: w("Bottom at Center")
				},
				{
					value: "bottom bottom",
					label: w("Bottom at Bottom")
				}
			]
		}, {
			handle: "pin",
			type: "text",
			component: "blocks-value",
			label: w("Pin Distance"),
			unit: "vh",
			units: Ec,
			step: 10,
			min: 0,
			max: 99999,
			placeholder: "0"
		}, wc("scrub", w("Smoothing"), { max: 3 })),
		...Dc(l, {
			handle: "repeat",
			type: "select",
			display: "segmented",
			block: !0,
			size: "sm",
			label: w("Repeat||again"),
			required: !0,
			options: [
				{
					value: "0",
					label: w("Once")
				},
				{
					value: "1",
					label: w("Twice")
				},
				{
					value: "-1",
					label: w("Forever||repeat")
				}
			]
		}, {
			handle: "yoyo",
			type: "toggle",
			size: "sm",
			label: w("Back and Forth")
		}, {
			handle: "hold",
			type: "number",
			size: "sm",
			label: w("Loop as a Timeline, Resting (s)"),
			if: { repeat: "-1" }
		}),
		...Dc(o.type === "scroll" || o.type === "appear", {
			handle: "watch",
			type: "select",
			component: "blocks-node",
			label: w("Watch"),
			placeholder: w("This Element"),
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
		e === "name" ? n({ name: t ?? "" }) : e === "type" ? t && s({ type: t }) : e === "start" || e === "end" ? s({ [e]: t ?? void 0 }) : e === "pin" ? s({ pin: typeof t == "string" && Tc.test(t.trim()) && parseFloat(t) > 0 ? t.trim() : void 0 }) : e === "scrub" ? s({ scrub: parseFloat(t) > 0 ? Math.min(3, Math.max(.05, parseFloat(t))) : void 0 }) : e === "replay" ? s({ once: !t && void 0 }) : e === "repeat" ? n({ repeat: Number(t ?? 0) }) : e === "yoyo" ? n({ yoyo: t || void 0 }) : e === "hold" ? n({ hold: t === "" || t == null ? void 0 : Number(t) }) : e === "watch" && s({ node: t ? `#${t}` : void 0 });
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
				children: [/* @__PURE__ */ H(ra, { field: {
					handle: "on",
					type: "select",
					label: w("Plays On")
				} }), /* @__PURE__ */ H("div", {
					role: "group",
					"aria-label": w("Plays On"),
					className: "flex gap-0.5",
					children: [
						[
							"desktop",
							"monitor",
							w("Desktop")
						],
						[
							"tablet",
							"tablet",
							w("Tablet")
						],
						[
							"mobile",
							"phone",
							w("Phone")
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
					children: w("Animation ID")
				}), /* @__PURE__ */ H("code", {
					className: "select-all font-mono text-text",
					children: t.id
				})]
			}),
			/* @__PURE__ */ H(Fc, {
				steps: t.steps,
				active: u,
				onSelect: i,
				onChange: c,
				onAdd: g
			}),
			t.steps[u] && /* @__PURE__ */ H(Ic, {
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
function Nc(e) {
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
var Pc = (e) => Math.max(0, Math.round(e * 20) / 20);
function Fc({ steps: e, active: t, onSelect: n, onChange: r, onAdd: i }) {
	let a = Nc(e), o = Math.max(.5, ...a.map((e) => e.start + e.duration + e.spread)), s = j(null), c = s.current?.total ?? Math.ceil(o * 2 + .25) / 2, l = c <= 1.5 ? .25 : c <= 4 ? .5 : c <= 10 ? 1 : 2, u = Array.from({ length: Math.floor(c / l) + 1 }, (e, t) => t * l), d = (e) => `${e / c * 100}%`, f = (t, i, a) => {
		t.preventDefault(), t.stopPropagation(), n(i);
		let o = t.currentTarget.closest("[data-track]");
		if (!o) return;
		s.current = {
			total: c,
			width: o.clientWidth
		};
		let l = t.clientX, u = e[i], d = a === "move" ? u.at === void 0 ? u.delay ?? 0 : u.at : u.duration ?? .6, f = (e) => {
			let t = (e.clientX - l) / s.current.width * s.current.total;
			a === "end" ? r(i, { duration: Math.max(.05, Pc(d + t)) }) : u.at === void 0 ? r(i, { delay: Pc(d + t) || void 0 }) : r(i, { at: Pc(d + t) });
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
					children: w("Timeline")
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
							children: Ac(e.target)
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
								"aria-label": w("Step {n}", { n: i + 1 }),
								"aria-valuenow": o.start,
								"aria-valuetext": w("Starts at {start}s, runs {duration}s", {
									start: o.start.toFixed(2),
									duration: o.duration.toFixed(2)
								}),
								onPointerDown: (e) => f(e, i, "move"),
								onKeyDown: (t) => {
									if (t.key !== "ArrowLeft" && t.key !== "ArrowRight") return;
									t.preventDefault();
									let n = t.key === "ArrowRight" ? .05 : -.05;
									t.shiftKey ? r(i, { duration: Math.max(.05, Pc((e.duration ?? .6) + n)) }) : e.at === void 0 ? r(i, { delay: Pc((e.delay ?? 0) + n) || void 0 }) : r(i, { at: Pc(e.at + n) });
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
			/* @__PURE__ */ H(ca, {
				size: "xs",
				onClick: i,
				className: "ml-24 mt-0.5 !w-auto",
				children: w("Add Step")
			})
		]
	});
}
function Ic({ node: e, step: t, index: n, count: r, onChange: i, onRemove: a }) {
	let { catalog: o } = W(), s = mn(), c = s.of("color").find((e) => !/-\d+$/.test(e.name) && e.name !== "black" && e.name !== "white")?.ref ?? "currentColor", l = t.target ?? "self", u = Sc(), d = Object.keys(o.motion?.properties ?? u), f = Oc.includes(e.type), p = (e) => {
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
						children: w(e === "from" ? "From" : "To||end value")
					}), /* @__PURE__ */ H(de, {
						align: "end",
						trigger: /* @__PURE__ */ H(L, {
							icon: "plus",
							label: w(e === "from" ? "Add a Start Property" : "Add an End Property"),
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
					children: w(e === "from" ? "As it looks now" : "As Designed")
				}),
				/* @__PURE__ */ H(Z, {
					bare: !0,
					fields: [{
						handle: e,
						type: "json",
						component: "blocks-pairs",
						className: "items-start",
						label: w(e === "from" ? "From" : "To||end value"),
						labels: u,
						item: {
							handle: "value",
							type: "text",
							component: "blocks-value",
							label: w("Value"),
							unit: ""
						},
						items: Object.fromEntries(Object.keys(n).map((e) => [e, {
							handle: "value",
							type: "text",
							component: "blocks-value",
							label: w("Value"),
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
						children: r > 1 ? w("Step {n}", { n: n + 1 }) : w("Animate")
					}),
					/* @__PURE__ */ H("span", { className: "flex-1" }),
					r > 1 && /* @__PURE__ */ H(ua, {
						onClick: a,
						label: w("Remove Step")
					})
				]
			}),
			/* @__PURE__ */ H(Z, {
				fields: [
					{
						handle: "target",
						type: "select",
						size: "sm",
						label: w("Target"),
						required: !0,
						options: [
							{
								value: "self",
								label: w("This Element")
							},
							{
								value: "children",
								label: w("Each Child in Turn")
							},
							...f ? [
								{
									value: "words",
									label: w("Each Word")
								},
								{
									value: "lines",
									label: w("Each Line")
								},
								{
									value: "chars",
									label: w("Each Letter")
								}
							] : [],
							{
								value: "other",
								label: w("Another Element")
							}
						]
					},
					...Dc(l.startsWith("#"), {
						handle: "element",
						type: "select",
						component: "blocks-node",
						label: w("Element")
					}),
					...Dc(l === "words" || l === "chars", {
						handle: "mask",
						type: "toggle",
						size: "sm",
						label: w("Rise from Behind a Line")
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
					wc("duration", w("Duration")),
					wc("delay", w("Delay")),
					...Dc(l !== "self", wc("stagger", w("Stagger"), { step: .01 })),
					...Dc(r > 1, wc("at", w("Starts At||time"), { placeholder: w("After") })),
					{
						handle: "ease",
						type: "text",
						component: "ease",
						label: w("Ease"),
						placeholder: w("Smooth Out"),
						options: [...s.of("ease").map((e) => ({
							value: e.ref,
							label: e.name,
							curve: e.value
						})), ...Cc()]
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
var Lc = [
	"content",
	"design",
	"interact"
], Rc = "cms.block.tab";
function zc(e) {
	if (!e.scrollTop) return null;
	let t = e.getBoundingClientRect().top, n = [...e.querySelectorAll("[data-section]")].find((e) => e.getBoundingClientRect().bottom > t);
	return {
		section: n?.dataset.section,
		offset: n ? n.getBoundingClientRect().top - t : 0,
		scrollTop: e.scrollTop
	};
}
function Bc(e, t) {
	let n = t.section && e.querySelector(`[data-section="${CSS.escape(t.section)}"]`);
	n ? e.scrollTop += n.getBoundingClientRect().top - e.getBoundingClientRect().top - t.offset : e.scrollTop = t.scrollTop;
}
function Vc() {
	try {
		let e = sessionStorage.getItem(Rc);
		return Lc.find((t) => t === e) ?? "content";
	} catch {
		return "content";
	}
}
var Hc = O(function({ node: e, onBack: t, backLabel: n, onClose: r }) {
	let { store: i, types: a, allowed: o, readOnly: s } = W(), c = a.get(e.type), l = Le(), [u, d] = M(Vc), p = `block-inspector-${ce()}`, [m, h] = M(!1), g = j(null), _ = j(e.id), y = j(null);
	_.current !== e.id && (_.current = e.id, y.current = g.current && zc(g.current)), le(() => {
		g.current && y.current && Bc(g.current, y.current), y.current = null;
	}, [e.id]);
	let b = (e) => {
		try {
			sessionStorage.setItem(Rc, e);
		} catch {}
		d(e);
	}, x = !s && e.type !== "component" && v("entries.components.create");
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
						label: w("Block Actions"),
						size: "sm"
					}),
					items: [
						{
							label: w("Rename"),
							icon: "edit",
							disabled: s,
							onSelect: () => h(!0)
						},
						{
							label: w("Duplicate"),
							icon: "copy",
							shortcut: "mod+d",
							disabled: s,
							onSelect: () => i.duplicate(e.id)
						},
						x && f(i, a, o) && {
							label: w("Make a Component"),
							icon: "symbol",
							onSelect: () => {
								i.selection().includes(e.id) || i.select(e.id), ir(i);
							}
						},
						!s && v("entries.patterns.create") && {
							label: w("Save as Pattern"),
							icon: "section-copy",
							onSelect: () => {
								i.selection().includes(e.id) || i.select(e.id), ar(i);
							}
						},
						{
							label: w("Copy ID"),
							icon: "hash",
							onSelect: () => void Se(e.id, { copied: w("Copied {reference}", { reference: e.id }) })
						},
						{
							separator: !0,
							label: ""
						},
						{
							label: w("Delete"),
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
							label: w("Name"),
							autofocus: !0,
							placeholder: c?.title
						}],
						values: { label: e.label ?? "" },
						onChange: (t, n) => i.updateNode(e.id, { label: n.trim() || void 0 })
					})
				}) : /* @__PURE__ */ H(B, {
					content: s ? void 0 : w("Double-Click to Rename"),
					children: /* @__PURE__ */ H(P, {
						variant: "ghost",
						onDoubleClick: () => !s && h(!0),
						className: "min-w-0 flex-1 shrink !justify-start !bg-transparent !pl-1 !pr-0 text-left !font-medium !text-ink",
						children: /* @__PURE__ */ H("span", {
							className: "truncate",
							children: Re(e, a, l)
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
					tabs: Lc.map((e) => ({
						value: e,
						label: {
							content: w("Content"),
							design: w("Design"),
							interact: w("Interact")
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
				children: /* @__PURE__ */ U(re, { children: [
					u === "design" && /* @__PURE__ */ H(Zs, { node: e }),
					u === "content" && /* @__PURE__ */ H(Ga, { node: e }),
					u === "interact" && /* @__PURE__ */ U(je, { children: [/* @__PURE__ */ H(jc, { node: e }), /* @__PURE__ */ H(fc, { node: e })] })
				] }, e.id)
			})
		]
	});
});
export { ii as $, Ue as $t, pa as A, kt as At, Gi as B, St as Bt, Ma as C, Yt as Ct, Ta as D, gt as Dt, ya as E, qt as Et, ua as F, xt as Ft, Ei as G, Ke as Gt, ki as H, yt as Ht, ra as I, ft as It, _i as J, q as Jt, Ti as K, tt as Kt, ea as L, Ot as Lt, da as M, _t as Mt, la as N, bt as Nt, ha as O, Mt as Ot, Z as P, jt as Pt, gi as Q, We as Qt, sa as R, Ft as Rt, Xa as S, zt as St, ba as T, Kt as Tt, ji as U, it as Ut, Fi as V, ut as Vt, wi as W, Ye as Wt, mi as X, Ge as Xt, hi as Y, rt as Yt, pi as Z, $e as Zt, Go as _, cn as _t, Bs as a, G as an, $n as at, Qa as b, Vt as bt, Ms as c, Rn as ct, Ts as d, dn as dt, ze as en, li as et, ts as f, an as ft, Yo as g, vn as gt, Ko as h, on as ht, Ls as i, Re as in, ri as it, ga as j, vt as jt, _a as k, At as kt, ws as l, Ln as lt, as as m, rn as mt, Ys as n, K as nn, oi as nt, zs as o, Le as on, Vn as ot, Qo as p, nn as pt, Di as q, J as qt, Xs as r, Ie as rn, ai as rt, Is as s, W as sn, Bn as st, Hc as t, Be as tn, ci as tt, Ds as u, jn as ut, Uo as v, fn as vt, Na as w, Jt as wt, Za as x, Rt as xt, ko as y, mn as yt, oa as z, Nt as zt };
