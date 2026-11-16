import { a as e, c as t, d as n, f as r, g as i, h as a, i as o, l as s, m as c, n as l, o as u, p as d, r as f, t as p, u as m, v as h, y as g } from "./insert-DSPXdALv.js";
import { Link as _, can as v, getManifest as y, invalidate as b, navigate as x, plural as S, registry as C, requestText as w, run as T, t as E, useAbility as D, useManifest as O, useManifestIfLoaded as ee } from "@letterncms/sdk";
import { Fragment as te, createContext as ne, createElement as re, forwardRef as ie, memo as ae, useCallback as oe, useContext as se, useEffect as k, useId as ce, useLayoutEffect as le, useMemo as A, useRef as j, useState as M, useSyncExternalStore as N } from "react";
import { Button as P, Dialog as ue, Fields as F, Icon as I, IconButton as L, Menu as de, NEW_COLOR as fe, NoMatches as pe, Notice as me, PagePreview as he, PanelHeader as ge, Popover as R, Pressable as z, QueryError as _e, Segmented as ve, Spinner as ye, Tabs as be, Tooltip as xe, cn as B, copyText as Se, deviceWidths as Ce, fieldControlId as we, fieldVisible as Te, prompt as Ee, slugify as De, toast as Oe, useShortcutLabel as ke, wideFieldTypes as Ae } from "@letterncms/ui";
import { Fragment as je, jsx as V, jsxs as H } from "react/jsx-runtime";
import { createPortal as Me, flushSync as Ne } from "react-dom";
import { createRoot as Pe } from "react-dom/client";
// admin/src/core/context.tsx
var Fe = ne(null);
function Ie({ value: e, children: t }) {
	return e.store.setReadOnly(!!e.readOnly), /* @__PURE__ */ V(Fe.Provider, {
		value: e,
		children: t
	});
}
function U() {
	let e = se(Fe);
	if (!e) throw Error("Block editor context missing");
	return e;
}
function W() {
	let e = D("blocks/types", {}, { staleTime: 3e5 }), t = A(() => new Map((e.data?.blocks ?? []).map((e) => [e.name, e])), [e.data]);
	return {
		catalog: e.data,
		types: t,
		isLoading: e.isLoading,
		error: e.error,
		retry: () => void e.refetch()
	};
}
function Le() {
	let e = D("components/list", {}, { staleTime: 6e4 });
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
function G(e, t) {
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
function K(e) {
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
function q(e) {
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
		let r = q(t), i = null;
		for (let t of e) {
			let e = K(t);
			q(e.variants) === r && this.group(e.utility) === n && (i = t);
		}
		return i;
	}
	put(e, t, n, r) {
		let i = q(t), a = e.filter((e) => {
			let t = K(e);
			return q(t.variants) !== i || this.group(t.utility) !== n;
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
		let { variants: t, utility: n } = K(e), r = !0, i = [];
		for (let e of t) {
			let t = rt(e, this.screen.sizes);
			t ? ("from" in t ? this.screen.width < t.from : this.screen.width >= t.below) && (r = !1) : i.push(e);
		}
		return {
			holds: r,
			rest: q(i),
			utility: n.replace(/^!|!$/g, ""),
			variants: t
		};
	}
	rank(e) {
		return this.order ??= new Map(this.engine.ds.getClassOrder(this.classes)), this.order.get(e) ?? null;
	}
	find(e) {
		let t = q(this.variants);
		for (let n of this.state.length ? [q(this.state), ""] : [""]) {
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
					own: q(K(e.raw).variants) === t
				};
			}
		}
	}
	target(e) {
		let t = this.find(e);
		if (!t || t.own) return this.variants;
		let { variants: n, utility: r } = K(t.from);
		if (q(n.filter((e) => !rt(e, this.screen.sizes))) !== q(this.state)) return this.variants;
		let i = We(this.variants, r), [, a] = this.engine.sort([t.from, i]);
		return a === t.from && i !== t.from ? n : this.variants;
	}
	set(t) {
		let n = this.classes;
		for (let [r, i] of Object.entries(t)) {
			let t = i == null ? "" : String(i).trim(), a = new e(this.engine, n, this.screen, this.state).target(r);
			if (t === "") {
				let e = q(a);
				n = n.filter((t) => {
					let n = K(t);
					return q(n.variants) !== e || this.engine.group(n.utility)?.split("|")[0] !== r;
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
		return n ? K(n).utility : null;
	}
	put(e, t) {
		let n = this.engine.group(t ?? e);
		return n ? this.engine.put(this.classes, this.variants, n, t) : this.classes;
	}
	own() {
		let e = q(this.variants), t = /* @__PURE__ */ new Set();
		for (let n of this.classes) {
			let r = K(n);
			if (q(r.variants) === e) for (let e of this.engine.declarations(r.utility) ?? []) e.property.startsWith("--") || t.add(e.property);
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
// tailwind/stylesheet.ts
function J(e, t = 0, n = e.length) {
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
var ot = /\/\*[ \t]*group:[ \t]*([^*\n]*?)[ \t]*\*\/\s*$/, Y = (e, t) => /[ \t]*$/.exec(e.slice(0, t))[0], st = [
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
], ct = ":root, [data-theme]", lt = (e) => `.cms-prose ${e}:where(:not(.cms-box, .cms-repeat))`, ut = {
	spacing: ".cms-prose",
	h2: lt("h2"),
	h3: lt("h3"),
	p: lt("p"),
	li: ".cms-prose :where(ul:not(.cms-box, .cms-repeat), ol:not(.cms-box, .cms-repeat)) > li",
	blockquote: lt("blockquote"),
	figure: lt("figure"),
	a: lt("a")
}, dt = {
	base: [...st, ct],
	components: Object.values(ut)
}, ft = "color|font(?!-weight-)|text(?!-shadow-)|tracking|leading|breakpoint|container|spacing|radius|shadow|inset-shadow|drop-shadow|text-shadow|blur|perspective|ease|animate|duration|control", pt = RegExp(`^--(?:(?:${ft})-(?!.*--)[a-z0-9][\\w.-]*|spacing|default-transition-duration|default-transition-timing-function)$`), mt = RegExp(`^--(?:(?:${ft})-)?\\*$`), ht = (e) => pt.test(e);
function gt(e) {
	let t = new vt(e);
	return J(e).filter((e) => e.inner && /^@theme\b/.test(e.prelude)).flatMap((e) => t.declarationsOf(e));
}
function _t(e) {
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
var vt = class e {
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
		let a = this.declarations(i).filter((t) => yt(t.name) === yt(e));
		if (n === "first" && a[0]) return this.splice(a[0].start, a[0].start, `${e}: ${t};\n${Y(this.css, a[0].start)}`);
		let o = a[a.length - 1];
		if (o) {
			let n = this.css.indexOf("\n", o.end), r = n === -1 || n > i.inner[1] ? o.end : n;
			return this.splice(r, r, `\n${Y(this.css, o.start)}${e}: ${t};`);
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
		return J(this.css).filter((e) => /^@utility\s/.test(e.prelude) && e.inner).map((e) => {
			let t = this.groupComment(e)?.name;
			return {
				...this.rule(e.prelude.replace(/^@utility\s+/, ""), e),
				...t ? { group: t } : {}
			};
		});
	}
	setUtilityGroup(e, t) {
		let n = J(this.css).find((t) => t.prelude === `@utility ${e}`);
		if (!n) return this;
		let r = t?.replace(/\*\/|\n/g, "").trim() || null, i = this.groupComment(n);
		return i ? r ? this.splice(i.start, i.end, `/* group: ${r} */`) : this.splice(this.lineStart(i.start), n.start, Y(this.css, n.start)) : r ? this.splice(n.start, n.start, `/* group: ${r} */\n${Y(this.css, n.start)}`) : this;
	}
	renameGroup(e, t) {
		return this.utilities().filter((t) => t.group === e).reduce((e, n) => e.setUtilityGroup(n.name, t), this);
	}
	groupComment(e) {
		let t = this.css.slice(Math.max(0, e.start - 200), e.start), n = ot.exec(t);
		if (!n) return null;
		let r = e.start - t.length + n.index;
		return {
			start: r,
			end: r + n[0].trimEnd().length,
			name: n[1].trim()
		};
	}
	setUtility(e, t) {
		let n = J(this.css).find((t) => t.prelude === `@utility ${e}`);
		return n ? this.setApply(n, t) : this.append(`@utility ${e} {\n  @apply ${t.join(" ")};\n}`);
	}
	removeUtility(e) {
		let t = this.setUtilityGroup(e, null), n = J(t.css).find((t) => t.prelude === `@utility ${e}`);
		return n ? t.remove(n) : this;
	}
	renameUtility(e, t) {
		let n = J(this.css).find((t) => t.prelude === `@utility ${e}`);
		return n ? this.splice(n.start, n.start + n.prelude.length, `@utility ${t}`) : this;
	}
	duplicateUtility(e, t) {
		let n = J(this.css).find((t) => t.prelude === `@utility ${e}`);
		if (!n) return this;
		let r = this.css.slice(n.start + n.prelude.length, n.end), i = this.groupComment(n)?.name ?? null;
		return this.splice(n.end, n.end, `\n\n@utility ${t}${r}`).setUtilityGroup(t, i);
	}
	utilityProperties(e) {
		let t = J(this.css).find((t) => t.prelude === `@utility ${e}`);
		return t ? this.properties(t).map(({ name: e, value: t }) => ({
			name: e,
			value: t
		})) : [];
	}
	writeUtility(e, t, n) {
		let r = (t) => J(t.css).find((t) => t.inner && t.prelude === `@utility ${e}`);
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
			let s = `${Y(i.css, t.start)}  `, c = a[a.length - 1], l = J(i.css, ...t.inner)[0];
			i = c ? i.splice(i.lineEnd(c.end), i.lineEnd(c.end), `${s}${n}\n`) : l ? i.splice(i.lineStart(l.start), i.lineStart(l.start), `${s}${n}\n`) : i.insertLast(t, `${s}${n}`);
		}
		return i.setApply(r(i), n);
	}
	elements(e = "base") {
		return this.bases(e).flatMap((e) => J(this.css, ...e.inner).filter((e) => e.inner && !e.prelude.startsWith("@")).map((e) => this.rule(e.prelude.replace(/\s+/g, " "), e)));
	}
	setElement(e, t, n = "base") {
		for (let r of this.bases(n)) {
			let n = J(this.css, ...r.inner).find((t) => t.prelude.replace(/\s+/g, " ") === e);
			if (n) return t.length === 0 && !this.rule(e, n).custom ? this.remove(n) : this.setApply(n, t);
		}
		if (t.length === 0) return this;
		let r = `  ${e} {\n    @apply ${t.join(" ")};\n  }`, i = this.bases(n)[0];
		return i ? this.insertLast(i, r) : this.append(`@layer ${n} {\n${r}\n}`);
	}
	removeElement(e, t = "base") {
		for (let n of this.bases(t)) {
			let t = J(this.css, ...n.inner).find((t) => t.inner && t.prelude.replace(/\s+/g, " ") === e);
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
		for (let e of J(s.css).filter((e) => e.inner && (/^@theme(\s+(inline|static))*$/.test(e.prelude) || e.prelude === "@layer base" || e.prelude === "@layer components")).reverse()) s.css.slice(...e.inner).replace(/\/\*[\s\S]*?\*\//g, "").trim() === "" && (s = s.remove(e));
		let c = (e) => e.split("\n").map((e) => e.trim() ? `  ${e}` : "").join("\n"), l = r.theme.filter((e) => /^--[\w-]*\*\s*:\s*initial\b/.test(e.replace(/^\/\*[\s\S]*?\*\/\s*/, ""))), u = r.theme.filter((e) => !l.includes(e));
		if (l.length) {
			let e = J(s.css).find((e) => e.inner && /^@theme(\s+(inline|static))*$/.test(e.prelude));
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
			let n = Y(this.css, e);
			return this.css.slice(e, t).split("\n").map((e, t) => t === 0 ? e : e.startsWith(n) ? e.slice(n.length) : e.trimStart()).join("\n");
		};
		for (let n of J(this.css)) n.inner && /^@theme(\s+(inline|static))*$/.test(n.prelude) ? e.theme.push(...J(this.css, ...n.inner).map((e) => t(this.leading(e.start), e.end))) : n.inner && (n.prelude === "@layer base" || n.prelude === "@layer components") ? e.layers[n.prelude.slice(7)].push(...J(this.css, ...n.inner).map((e) => t(this.leading(e.start), e.end))) : e.rest.push(t(this.leading(n.start), n.end));
		return e;
	}
	extraParts() {
		let e = [], t = {
			base: [],
			components: []
		}, n = [], r = /^@theme(\s+(inline|static))*$/;
		for (let i of J(this.css)) if (i.inner || !/^@import\s/.test(i.prelude)) {
			if (i.inner && r.test(i.prelude)) for (let t of J(this.css, ...i.inner)) {
				let n = /^(--[\w.*-]+)\s*:/.exec(t.prelude)?.[1];
				!t.inner && n && (pt.test(n) || mt.test(n) && /:\s*initial\s*$/.test(t.prelude)) || e.push([this.leading(t.start), t.end]);
			}
			else if (i.inner && (i.prelude === "@layer base" || i.prelude === "@layer components")) {
				let e = i.prelude.slice(7);
				for (let r of J(this.css, ...i.inner)) r.inner && dt[e].includes(r.prelude.replace(/\s+/g, " ")) || (n.includes(e) || n.push(e), t[e].push([this.leading(r.start), r.end]));
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
		let r = Y(this.css, e);
		return this.css.slice(e, t).split("\n").map((e, t) => t === 0 ? n + e : e.trim() === "" ? "" : n + (e.startsWith(r) ? e.slice(r.length) : e.trimStart())).join("\n");
	}
	property(e, t, n = "base") {
		for (let r of this.bases(n)) for (let n of J(this.css, ...r.inner).filter((t) => t.inner && t.prelude.replace(/\s+/g, " ") === e)) {
			let e = this.properties(n).findLast((e) => e.name === t);
			if (e) return e.value;
		}
	}
	setProperty(e, t, n, r = "base") {
		for (let i of this.bases(r)) for (let r of J(this.css, ...i.inner).filter((t) => t.inner && t.prelude.replace(/\s+/g, " ") === e)) {
			let e = this.properties(r).findLast((e) => e.name === t);
			if (e && n !== null) return this.splice(e.start, e.end, `${t}: ${n};`);
			if (e) return J(this.css, ...r.inner).length === 1 ? this.remove(r) : this.splice(this.lineStart(e.start), this.lineEnd(e.end), "");
		}
		if (n === null) return this;
		let i = this.bases(r)[0];
		if (!i) return this.append(`@layer ${r} {\n  ${e} {\n    ${t}: ${n};\n  }\n}`);
		let a = J(this.css, ...i.inner).find((t) => t.inner && t.prelude.replace(/\s+/g, " ") === e);
		return a ? this.insertLast(a, `${Y(this.css, a.start)}  ${t}: ${n};`) : this.splice(i.inner[0], i.inner[0], `\n  ${e} {\n    ${t}: ${n};\n  }`);
	}
	properties(e) {
		return J(this.css, ...e.inner).filter((e) => !e.inner && !e.prelude.startsWith("@") && e.prelude.includes(":")).map((e) => {
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
		return J(this.css).filter((e) => e.inner && /^@theme(\s+(inline|static))*$/.test(e.prelude));
	}
	bases(e = "base") {
		return J(this.css).filter((t) => t.inner && t.prelude === `@layer ${e}`);
	}
	declarationsOf(e) {
		return this.declarations(e).map(({ name: e, value: t }) => ({
			name: e,
			value: t
		}));
	}
	declarations(e) {
		return J(this.css, ...e.inner).filter((e) => !e.inner && e.prelude.startsWith("--") && e.prelude.includes(":")).map((e) => {
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
		let n = J(this.css, ...t.inner), r = n.filter((e) => !e.inner && e.prelude.startsWith("@apply"));
		return {
			name: e,
			classes: r.flatMap((e) => e.prelude.slice(6).trim().split(/\s+/).filter(Boolean)),
			custom: n.length !== r.length || r.length > 1
		};
	}
	setApply(e, t) {
		let n = J(this.css, ...e.inner).filter((e) => !e.inner && e.prelude.startsWith("@apply")), r = t.length ? `@apply ${t.join(" ")};` : "";
		if (n.length === 0) {
			if (r === "") return this;
			let t = `${Y(this.css, e.start)}  `;
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
			let e = J(this.css).filter((e) => !e.inner && e.prelude.startsWith("@import")), n = e[e.length - 1];
			if (n) return this.splice(n.end, n.end, `\n\n${t}`);
		}
		let r = this.css.replace(/\s+$/, "");
		return new e(`${r}${r === "" ? "" : "\n\n"}${t}\n`);
	}
	insertLast(e, t) {
		let [n, r] = e.inner, i = /\s*$/.exec(this.css.slice(n, r))[0].length;
		return this.splice(r - i, r, `\n${t}\n${Y(this.css, e.start)}`);
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
function yt(e) {
	return /^--(font-weight|inset-shadow|drop-shadow|text-shadow|[a-z]+)/.exec(e)?.[0] ?? e;
}
// admin/src/core/styling.tsx
var bt = (e) => `${e.css}\u0000${JSON.stringify(e.files)}`, xt = /* @__PURE__ */ new Map(), St = /* @__PURE__ */ new Map(), Ct = /* @__PURE__ */ new Map();
function wt(e, t, n) {
	e.set(t, n);
	for (let t of [...e.keys()].slice(0, -2)) e.delete(t);
	return n;
}
function Tt(e) {
	let t = bt(e);
	return xt.get(t) ?? wt(xt, t, import("./compile-DqDc4wGx.js").then(({ designSystem: t }) => t(e)).then((e) => new Ye(e)).catch((e) => (console.error("[cms] The stylesheet could not be read.", e), null)).then((e) => wt(St, t, e)));
}
function Et() {
	return import("./defaults-CmMT1zYT.js").then((e) => e.default);
}
function Dt(e) {
	let t = bt(e);
	return Ct.get(t) ?? wt(Ct, t, import("./compile-DqDc4wGx.js").then(({ compiler: t }) => t(e)));
}
function Ot(e, t, n) {
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
function kt(e) {
	let t = parseFloat(e);
	return Number.isNaN(t) ? 0 : /r?em$/.test(e.trim()) ? t * 16 : t;
}
function At(e) {
	let t = e ? bt(e) : "", [, n] = M(0);
	return k(() => {
		if (!e || St.has(t)) return;
		let r = !0;
		return Tt(e).then(() => r && n((e) => e + 1)), () => {
			r = !1;
		};
	}, [t]), {
		engine: e && St.get(t) || null,
		loading: !!e && !St.has(t)
	};
}
function jt(e, t, n) {
	return {
		engine: e,
		breakpoints: e ? e.tokens("breakpoint").map((e) => ({
			name: e.name,
			width: kt(e.value)
		})).filter((e) => e.width > 0).sort((e, t) => e.width - t.width) : [],
		classes: t ? Ft(t.css) : [],
		source: t,
		loading: n
	};
}
var Mt = ne(null);
function Nt({ source: e, children: t }) {
	let { engine: n, loading: r } = At(e), i = A(() => jt(n, e, r), [
		n,
		e,
		r
	]);
	return /* @__PURE__ */ V(Mt.Provider, {
		value: i,
		children: t
	});
}
function Pt() {
	let e = se(Mt), t = D("styling/source", {}, {
		staleTime: 6e4,
		retry: !1,
		enabled: !e
	}), n = e ? void 0 : t.data, { engine: r, loading: i } = At(n), a = A(() => jt(r, n, t.isLoading || i), [
		r,
		n,
		t.isLoading,
		i
	]);
	return e ?? a;
}
function Ft(e) {
	try {
		return new vt(e).utilities().map((e) => e.name).filter((e) => /^[\w-]+$/.test(e));
	} catch {
		return [];
	}
}
function X() {
	let { engine: e } = Pt();
	return A(() => zt(e), [e]);
}
var It = [
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
], Lt = {
	of: () => [],
	find: () => null,
	resolve: (e) => e
}, Rt = /* @__PURE__ */ new WeakMap();
function zt(e) {
	if (!e) return Lt;
	let t = Rt.get(e);
	return t || Rt.set(e, t = Bt(e)), t;
}
function Bt(e) {
	let t = /* @__PURE__ */ new Map(), n = (n) => {
		let r = t.get(n);
		return r || t.set(n, r = e.tokens(n)), r;
	}, r = null;
	return {
		of: n,
		find: (e) => {
			let t = typeof e == "string" ? $e(e) : null;
			if (!t) return null;
			r ??= new Map(It.flatMap((e) => n(e)).map((e) => [e.variable, e]));
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
function Vt(e = document) {
	return e.getSelection()?.isCollapsed ?? !0;
}
function Ht(e, t) {
	let n = e.ownerDocument.getSelection();
	if (!n || n.rangeCount === 0) return null;
	let r = n.getRangeAt(0);
	if (!e.contains(r.startContainer)) return null;
	let i = e.ownerDocument.createRange();
	return i.selectNodeContents(e), t ? i.setEnd(r.startContainer, r.startOffset) : i.setStart(r.endContainer, r.endOffset), i;
}
function Ut(e) {
	return e ? e.toString().replace(/​/g, "") : "";
}
function Wt(e) {
	return Vt(e.ownerDocument) && Ut(Ht(e, !0)) === "" && !Kt(Ht(e, !0)).includes("<br");
}
function Gt(e) {
	return Vt(e.ownerDocument) && Ut(Ht(e, !1)) === "";
}
function Kt(e) {
	if (!e) return "";
	let t = e.startContainer.ownerDocument.createElement("div");
	return t.appendChild(e.cloneContents()), t.innerHTML;
}
function qt(e) {
	return Ut(Ht(e, !0)).length;
}
function Jt(e) {
	let t = Ht(e, !0), n = Ht(e, !1);
	return [Kt(t), Kt(n)];
}
function Yt(e) {
	let t = Qt(e.ownerDocument);
	return !t || t.top - e.getBoundingClientRect().top < Zt(e) * .8;
}
function Xt(e) {
	let t = Qt(e.ownerDocument);
	return !t || e.getBoundingClientRect().bottom - t.bottom < Zt(e) * .8;
}
function Zt(e) {
	let t = parseFloat(e.ownerDocument.defaultView.getComputedStyle(e).lineHeight);
	return Number.isFinite(t) ? t : 20;
}
function Qt(e = document) {
	let t = e.getSelection();
	if (!t || t.rangeCount === 0) return null;
	let n = t.getRangeAt(0).cloneRange(), r = n.getClientRects();
	if (r.length > 0) return r[0];
	let i = e.createElement("span");
	i.textContent = "​", n.insertNode(i);
	let a = i.getBoundingClientRect();
	return i.remove(), a;
}
function $t(e, t) {
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
function en(e) {
	let t = document.createElement("div");
	return t.innerHTML = e, (t.textContent ?? "").length;
}
function tn(e) {
	return e.replace(/\u200B/g, "").replace(/<(\/?)strike>/g, "<$1s>").replace(/<(\/?)b>/g, "<$1strong>").replace(/<(\/?)i>/g, "<$1em>").replace(/<div><br><\/div>/g, "<br>").replace(/<\/?(div|p|span)[^>]*>/g, "").replace(/ style="[^"]*"/g, "").replace(/&nbsp;/g, " ").replace(/<br>$/, "");
}
var nn = [
	["**", "strong"],
	["__", "strong"],
	["~~", "s"],
	["`", "code"],
	["*", "em"],
	["_", "em"]
];
function rn(e = document) {
	let t = e.getSelection();
	if (!t || !t.isCollapsed || t.rangeCount === 0) return !1;
	let n = t.anchorNode;
	if (!n || n.nodeType !== Node.TEXT_NODE || n.parentElement?.closest("code")) return !1;
	let r = t.anchorOffset, i = (n.textContent ?? "").slice(0, r);
	for (let [a, o] of nn) {
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
function an() {
	let { store: e } = U(), t = G(e, (e) => e.nodes), n = /* @__PURE__ */ new Map(), r = [];
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
function on({ html: e, onChange: t, tag: n = "div", placeholder: r, className: i = "", focus: a, onKeyDown: o, onFocus: s, onPaste: c, disabled: l, singleLine: u, quiet: d, plainText: f }) {
	let p = j(null), m = j(e);
	le(() => {
		let t = p.current;
		t && (t.ownerDocument.activeElement === t ? m.current = e : (tn(t.innerHTML) !== e && (t.innerHTML = e), m.current = tn(t.innerHTML)));
	}, [e]), le(() => {
		a && p.current && $t(p.current, a.at);
	}, [a?.nonce]);
	let h = () => {
		let e = p.current;
		e && (e.spellcheck = !parseFloat(e.ownerDocument.defaultView?.getComputedStyle(e).webkitTextStrokeWidth ?? "0"));
	}, g = () => {
		let e = p.current;
		if (!e) return;
		let n = tn(e.innerHTML);
		n !== m.current && (m.current = n, t(n, e));
	};
	return re(n, {
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
			!f && t.inputType === "insertText" && t.data && /[*_~`]/.test(t.data) && rn(e.currentTarget.ownerDocument), g();
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
			}[e.key.toLowerCase()]), g()) : n && e.shiftKey && e.key.toLowerCase() === "x" ? (e.preventDefault(), t.execCommand("strikeThrough"), g()) : n && e.key.toLowerCase() === "k" ? (e.preventDefault(), e.stopPropagation(), p.current?.ownerDocument.dispatchEvent(new CustomEvent("cms:link"))) : n && e.key.toLowerCase() === "e" ? (e.preventDefault(), sn("code", t), g()) : e.key === "Enter" && e.shiftKey && !u ? (e.preventDefault(), t.execCommand("insertLineBreak"), g()) : p.current && o?.(e, p.current);
		},
		onPaste: (e) => {
			e.preventDefault();
			let t = e.currentTarget.ownerDocument, n = e.clipboardData.getData("text/plain");
			!f && /^(https?:\/\/|mailto:)\S+$/i.test(n.trim()) && !t.getSelection()?.isCollapsed ? (t.execCommand("createLink", !1, n.trim()), g()) : p.current && c?.(n, p.current) || (t.execCommand("insertText", !1, u ? n.replace(/\s*\n\s*/g, " ") : n), g());
		},
		onBlur: () => g()
	});
}
function sn(e, t = document) {
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
function cn(e) {
	return {
		...e,
		type: "url",
		component: "link"
	};
}
// admin/src/core/FormatToolbar.tsx
function ln({ root: e = document, offset: t }) {
	let [n, r] = M(null), [i, a] = M({}), [o, s] = M(!1), [c, l] = M(""), u = j(null), d = j(null), f = j(() => {}), p = an();
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
		sn(t, e), d.current?.dispatchEvent(new Event("input", { bubbles: !0 })), e.dispatchEvent(new Event("selectionchange"));
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
	}, v = (e, t, n, r) => /* @__PURE__ */ V(xe, {
		content: t,
		shortcut: n,
		children: /* @__PURE__ */ V(z, {
			compact: !0,
			"aria-label": t,
			"aria-pressed": !!i[e] || e === "link" && o,
			onMouseDown: (e) => e.preventDefault(),
			onClick: r,
			className: B("grid size-7 place-items-center rounded-xs hover:bg-white/12 hover:text-ink-contrast", i[e] || e === "link" && o ? "bg-white/14 text-ink-contrast" : "text-ink-contrast/75"),
			children: /* @__PURE__ */ V(I, {
				name: e,
				size: 14
			})
		})
	}, e), y = () => {
		s(!1);
		let t = d.current, n = e.getSelection();
		t && u.current && n && (t.focus({ preventScroll: !0 }), n.removeAllRanges(), n.addRange(u.current));
	}, b = cn({
		handle: "url",
		label: E("Link"),
		size: "sm",
		autofocus: !0,
		anchors: p,
		placeholder: E("Paste a link or search pages"),
		onClose: y
	});
	return Me(/* @__PURE__ */ H("div", {
		className: "fixed z-overlay flex -translate-x-1/2 -translate-y-full items-center gap-0.5 rounded-md bg-ink p-1 shadow-pop",
		style: {
			left: n.x,
			top: n.y - 8
		},
		onMouseDown: (e) => !o && e.preventDefault(),
		onKeyDown: (e) => e.key === "Escape" && y(),
		children: [
			v("bold", E("Bold"), "mod+b", () => m("bold")),
			v("italic", E("Italic"), "mod+i", () => m("italic")),
			v("underline", E("Underline"), "mod+u", () => m("underline")),
			v("strike", E("Strikethrough"), "mod+shift+x", () => m("strikeThrough")),
			v("code", E("Code"), "mod+e", () => h("code")),
			/* @__PURE__ */ V("span", { className: "mx-0.5 h-4 w-px bg-white/15" }),
			v("link", E("Link"), "mod+k", g),
			o && /* @__PURE__ */ V("div", {
				className: "pointer-events-none absolute inset-0 opacity-0",
				"aria-hidden": !0,
				children: /* @__PURE__ */ V(F, {
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
function un(e, t, n) {
	return t >= 0 && t < e ? "choose" : n ? "wait" : "pass";
}
function dn(e, t) {
	return e > 0 ? "choose" : t ? "wait" : "release";
}
function fn(e, t) {
	return e && !t;
}
// admin/src/core/Inserter.tsx
var pn = (e) => `/__pattern/${encodeURIComponent(e)}`, mn = (e) => e.replace(/[-_]+/g, " ").replace(/(^|\s)\S/g, (e) => e.toUpperCase()), hn = (e) => e.kind === "block" ? e.type.title : e.kind === "component" ? e.component.title : e.pattern.title, gn = (e) => e.kind === "block" ? e.type.icon : e.kind === "component" ? "symbol" : "section-copy", _n = (e) => e.kind === "block" ? e.type.name : e.kind === "component" ? `c-${e.component.handle}` : `p-${e.pattern.handle}`;
function vn(e, t) {
	return e.blocks.length > 0 && e.blocks.every((e) => t(e.type));
}
var yn = (e, t) => !t || [
	e.title,
	e.category,
	e.description,
	...e.keywords ?? []
].some((e) => e.toLowerCase().includes(t));
function bn(e, t, n, r = !0) {
	let i = D("components/list", {}, { staleTime: 6e4 }), a = D("patterns/list", {}, { staleTime: 6e4 }), { catalog: o } = W();
	return {
		items: A(() => {
			let s = o?.categories ?? [], c = (e) => {
				let t = s.findIndex((t) => t.name === e);
				return t < 0 ? s.length : t;
			}, l = (e) => s.find((t) => t.name === e)?.label ?? mn(e), u = t.trim().toLowerCase(), d = (e) => e.toLowerCase().includes(u), f = e.filter((e) => n ? n(e) : !e.parent).filter((e) => !u || d(e.title) || d(e.name) || (e.keywords ?? []).some(d)).sort((e, t) => c(e.category) - c(t.category) || (c(e.category) === s.length ? l(e.category).localeCompare(l(t.category)) : 0)), p = (e) => {
				let t = e.title.toLowerCase();
				return t === u ? 0 : t.startsWith(u) ? 1 : d(e.title) ? 2 : 3;
			}, m = (u ? [...f].sort((e, t) => p(e) - p(t)) : f).map((e) => ({
				kind: "block",
				type: e,
				group: u ? E("Blocks") : l(e.category)
			})), h = (t) => {
				let r = e.find((e) => e.name === t);
				return !!r && (n ? n(r) : !r.parent);
			}, g = (r && h("component") ? i.data ?? [] : []).filter((e) => !u || d(e.title) || d(e.category) || d(e.description)).map((e) => ({
				kind: "component",
				component: e,
				group: E("Components")
			})), _ = (r ? a.data ?? [] : []).filter((e) => vn(e, h) && yn(e, u)).map((e) => ({
				kind: "pattern",
				pattern: e,
				group: E("Patterns")
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
function xn({ types: e, query: t, onQuery: n, onChoose: r, onClose: i, allowed: a, showSearch: o = !0, className: s, style: c, compact: l, chooseFirst: u, onNoMatch: d, components: f = !0, keyboardDocument: p }) {
	let { items: m, loading: h } = bn(e, t, a, f), [g, _] = M("blocks"), v = A(() => m.filter((e) => e.kind === "pattern"), [m]), y = f && !l && v.length > 0 && !t.trim(), b = y && g === "patterns" ? v : m, [x, S] = M(0), C = j(null);
	k(() => S(0), [t, g]);
	let w = j({
		items: b,
		active: x,
		loading: h
	});
	w.current = {
		items: b,
		active: x,
		loading: h
	};
	let T = j(!!u);
	k(() => {
		if (!T.current) return;
		let e = dn(b.length, h);
		e !== "wait" && (T.current = !1, e === "choose" ? r(b[0]) : d?.());
	}, [b, h]), le(() => {
		let e = (e) => {
			let { items: t, active: n, loading: a } = w.current;
			if (e.key === "ArrowDown") e.preventDefault(), S((e) => Math.min(t.length - 1, e + 1));
			else if (e.key === "ArrowUp") e.preventDefault(), S((e) => Math.max(0, e - 1));
			else if (e.key === "Enter") {
				let i = un(t.length, n, a);
				i !== "pass" && (e.preventDefault(), e.stopPropagation(), i === "choose" ? r(t[n]) : T.current = !0);
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
		C.current?.querySelector(`[data-index="${x}"]`)?.scrollIntoView({ block: "nearest" });
	}, [x]);
	let D = "";
	return /* @__PURE__ */ H("div", {
		className: B("flex max-h-[min(420px,60vh)] w-[300px] flex-col", s),
		style: c,
		children: [
			o && /* @__PURE__ */ V("div", {
				className: "border-b border-border p-1.5",
				children: /* @__PURE__ */ V(F, {
					bare: !0,
					fields: [{
						handle: "query",
						type: "text",
						label: E("Search"),
						icon: "search",
						size: "sm",
						autofocus: !0,
						placeholder: E("Search Blocks")
					}],
					values: { query: t },
					onChange: (e, t) => n?.(t ?? "")
				})
			}),
			y && /* @__PURE__ */ V("div", {
				className: "border-b border-border p-1.5",
				children: /* @__PURE__ */ V(ve, {
					size: "sm",
					block: !0,
					"aria-label": E("Show"),
					value: g,
					onChange: _,
					options: [{
						value: "blocks",
						label: E("Blocks")
					}, {
						value: "patterns",
						label: E("Patterns")
					}]
				})
			}),
			/* @__PURE__ */ H("div", {
				ref: C,
				className: "min-h-0 flex-1 overflow-y-auto p-1",
				children: [
					b.length === 0 && /* @__PURE__ */ V("div", {
						className: "px-3 py-6 text-center text-xs text-faint",
						children: E("No matching blocks")
					}),
					y && g === "patterns" && b.map((e, t) => {
						if (e.kind !== "pattern") return null;
						let n = e.pattern.category === D ? null : e.pattern.category;
						return D = e.pattern.category, /* @__PURE__ */ H("div", { children: [n && /* @__PURE__ */ V("div", {
							className: "cms-label px-2 pb-1 pt-2",
							children: n
						}), /* @__PURE__ */ H(P, {
							variant: "ghost",
							size: "md",
							"data-index": t,
							title: e.pattern.description || void 0,
							onMouseMove: () => t !== x && S(t),
							onMouseDown: (e) => e.preventDefault(),
							onClick: () => r(e),
							"data-active": t === x || void 0,
							className: "!h-auto w-full !flex-col !items-stretch !gap-1.5 !rounded-sm !p-1.5 text-left",
							children: [/* @__PURE__ */ V(he, {
								src: pn(e.pattern.handle),
								maxHeight: 160
							}), /* @__PURE__ */ V("span", {
								className: "min-w-0 truncate px-0.5 text-sm",
								children: e.pattern.title
							})]
						})] }, _n(e));
					}),
					!(y && g === "patterns") && b.map((e, t) => {
						let n = e.group === D ? null : e.group;
						D = e.group;
						let i = hn(e), a = e.kind === "block" ? e.type.description : e.kind === "component" ? e.component.description || E("Component") : e.pattern.description || e.pattern.category, o = gn(e);
						return /* @__PURE__ */ H("div", { children: [n && /* @__PURE__ */ V("div", {
							className: "cms-label px-2 pb-1 pt-2",
							children: n
						}), /* @__PURE__ */ H(P, {
							variant: "ghost",
							size: "md",
							"data-index": t,
							title: a || void 0,
							onMouseMove: () => t !== x && S(t),
							onMouseDown: (e) => e.preventDefault(),
							onClick: () => r(e),
							"data-active": t === x || void 0,
							className: B("w-full !justify-start !gap-2.5 !rounded-sm !px-2 text-left", !l && "!h-9"),
							children: [/* @__PURE__ */ V("span", {
								className: "grid size-7 shrink-0 place-items-center rounded-xs border border-border bg-surface text-muted",
								children: /* @__PURE__ */ V(I, {
									name: o,
									size: 14
								})
							}), /* @__PURE__ */ V("span", {
								className: "min-w-0 truncate",
								children: i
							})]
						})] }, _n(e));
					})
				]
			})
		]
	});
}
// admin/src/core/SaveComponent.tsx
function Sn(e, t, n = "component") {
	let r = e.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 56) || n, i = r;
	for (let e = 2; t.has(i); e++) i = `${r}-${e}`;
	return i;
}
var Cn = [
	"Heroes",
	"Text",
	"Media",
	"Features",
	"People",
	"Lists",
	"Calls to Action",
	"Pages"
];
function wn(e) {
	let t = document.createElement("div");
	document.body.appendChild(t);
	let n = Pe(t);
	n.render(e(() => setTimeout(() => {
		n.unmount(), t.remove();
	}, 250)));
}
function Tn(e) {
	return e.selection().map((n) => t(e.get().nodes, n)).filter((e) => !!e);
}
function En(e) {
	let t = Tn(e);
	t.length !== 0 && wn((n) => {
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
						let r = await T("components/list"), i = Sn(n, new Set(r.map((e) => e.handle)));
						await T("components/save", {
							handle: i,
							title: n,
							description: a.description.trim(),
							category: a.category.trim() || void 0,
							blocks: t
						}), b("components/"), e.replaceSelection([{
							id: g(),
							type: "component",
							props: { ref: i }
						}]), Oe.success(E("“{title}” is now a component", { title: n })), l();
					} catch (e) {
						Oe.error(e), c(!1);
					}
				}
			};
			return /* @__PURE__ */ V(ue, {
				open: r,
				onOpenChange: (e) => !e && l(),
				size: "sm",
				title: E("Make a Component"),
				description: S(t.length, "{count} block, the same on every page", "{count} blocks, the same on every page"),
				onSubmit: () => void u(),
				submitLabel: E("Make Component"),
				submitDisabled: !a.title.trim(),
				busy: s,
				children: /* @__PURE__ */ V(F, {
					fields: [
						{
							handle: "title",
							type: "text",
							label: E("Name"),
							required: !0,
							autofocus: !0,
							max: 120,
							placeholder: E("Pricing Card")
						},
						{
							handle: "category",
							type: "text",
							label: E("Category"),
							max: 60,
							placeholder: E("Components")
						},
						{
							handle: "description",
							type: "text",
							label: E("Description"),
							max: 500,
							placeholder: E("When to Use It")
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
function Dn(e) {
	let t = Tn(e);
	t.length !== 0 && wn((e) => {
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
						let n = await T("patterns/list", { working: !0 }), r = Sn(e, new Set(n.map((e) => e.handle)), "pattern");
						await T("patterns/save", {
							handle: r,
							title: e,
							description: i.description.trim(),
							category: i.category.trim() || void 0,
							blocks: t
						}), b("patterns/"), Oe.success(E("Saved “{title}” as a pattern", { title: e })), c();
					} catch (e) {
						Oe.error(e), s(!1);
					}
				}
			};
			return /* @__PURE__ */ V(ue, {
				open: n,
				onOpenChange: (e) => !e && c(),
				size: "sm",
				title: E("Save as Pattern"),
				description: S(t.length, "{count} block to start from on any page", "{count} blocks to start from on any page"),
				onSubmit: () => void l(),
				submitLabel: E("Save Pattern"),
				submitDisabled: !i.title.trim(),
				busy: o,
				children: /* @__PURE__ */ V(F, {
					fields: [
						{
							handle: "title",
							type: "text",
							label: E("Name"),
							required: !0,
							autofocus: !0,
							max: 120,
							placeholder: E("Hero With Photo")
						},
						{
							handle: "category",
							type: "text",
							label: E("Category"),
							max: 60,
							placeholder: E("Heroes"),
							suggestions: Cn
						},
						{
							handle: "description",
							type: "text",
							label: E("Description"),
							max: 500,
							placeholder: E("When to Use It")
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
var On = "Pages";
function kn(e) {
	let t = D("patterns/list", { category: On }, {
		enabled: e,
		staleTime: 6e4
	});
	return e ? t.data ?? [] : [];
}
function An({ open: e, onOpenChange: t, patterns: n, onChoose: r }) {
	return /* @__PURE__ */ V(ue, {
		open: e,
		onOpenChange: t,
		size: "lg",
		title: E("Start From a Pattern"),
		children: /* @__PURE__ */ V("div", {
			className: "grid gap-4 sm:grid-cols-2",
			children: n.map((e) => /* @__PURE__ */ H(z, {
				onClick: () => r(e),
				className: "block min-w-0 rounded-md p-1 text-left hover:bg-hover",
				children: [
					/* @__PURE__ */ V(he, {
						src: pn(e.handle),
						maxHeight: 280
					}),
					/* @__PURE__ */ V("span", {
						className: "mt-2 block truncate text-sm font-medium text-text",
						children: e.title
					}),
					e.description && /* @__PURE__ */ V("span", {
						className: "mt-0.5 line-clamp-2 block text-xs text-muted",
						children: e.description
					})
				]
			}, e.handle))
		})
	});
}
// admin/src/core/insertionTargets.ts
var jn = 4, Mn = 6, Nn = 16, Pn = (e) => e.left + e.width, Fn = (e) => e.top + e.height, In = (e, t) => t === "x" ? e.left + e.width / 2 : e.top + e.height / 2, Ln = (e, t) => t === "x" ? e.left : e.top, Rn = (e, t) => t === "x" ? Pn(e) : Fn(e), zn = (e) => [
	e.left,
	e.top,
	e.width,
	e.height
].every(Number.isFinite) && e.width > 0 && e.height >= 0, Bn = (e, t) => t.x >= e.left && t.x <= Pn(e) && t.y >= e.top && t.y <= Fn(e);
function Vn(e, t) {
	return Math.hypot(Math.max(e.left - t.x, 0, t.x - Pn(e)), Math.max(e.top - t.y, 0, t.y - Fn(e)));
}
function Hn(e, t) {
	return Math.min(Fn(e), Fn(t)) - Math.max(e.top, t.top) > 0 && Math.abs(In(t, "x") - In(e, "x")) > Math.abs(In(t, "y") - In(e, "y")) ? "x" : "y";
}
function Un(e, t, n) {
	let r = Math.min(Fn(e), Fn(t)) - Math.max(e.top, t.top), i = Math.min(Pn(e), Pn(t)) - Math.max(e.left, t.left);
	return n === "x" && r > 0 ? "x" : n === "y" && i > 0 ? "y" : Hn(e, t);
}
function Wn(e, t) {
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
function Gn(e, t) {
	let { byId: n, depth: r, isExcluded: i } = Wn(e, t.excludeIds), a = /* @__PURE__ */ new Map([[null, []]]);
	for (let t of e) {
		if (!zn(t.rect) || !t.container && t.rect.height === 0 || i(t)) continue;
		let e = a.get(t.parentId) ?? [];
		e.push(t), a.set(t.parentId, e), t.container && !a.has(t.id) && a.set(t.id, []);
	}
	let o = [];
	for (let [e, i] of a) {
		let a = e === null ? null : n.get(e), s = e === null ? t.rootRect : a?.rect;
		if (!s || !zn(s)) continue;
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
			let f = Math.sign(i - r), p = Math.min(Math.abs(i - r) / 2, jn), m = l === "from" ? r + f * p : l === "to" ? i - f * p : (r + i) / 2, h = Math.min(r, i), g = Math.abs(i - r), _ = n === "x" ? {
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
				width: Math.max(Pn(e), Pn(t)) - n,
				height: Math.max(Fn(e), Fn(t)) - r
			};
		}, m = c[0], h = c.at(-1), g = c.length > 1 ? Un(m.rect, c[1].rect, l) : l ?? "y", _ = c.length > 1 ? Un(c.at(-2).rect, h.rect, l) : l ?? "y", v = c.length < 2 || In(c[1].rect, g) >= In(m.rect, g), y = c.length < 2 || In(h.rect, _) >= In(c.at(-2).rect, _), b = v ? Ln(m.rect, g) : Rn(m.rect, g), x = y ? Rn(h.rect, _) : Ln(h.rect, _);
		f(m.index, g, v ? Ln(s, g) : Rn(s, g), b, g === "x" ? m.rect : s, m.rect, "edge", "to");
		for (let e = 1; e < c.length; e++) {
			let t = c[e - 1], n = c[e], r = Un(t.rect, n.rect, l), i = In(n.rect, r) >= In(t.rect, r), a = i ? Rn(t.rect, r) : Ln(t.rect, r), o = i ? Ln(n.rect, r) : Rn(n.rect, r), u = Math.max(t.rect.top, n.rect.top), d = Math.min(Fn(t.rect), Fn(n.rect)), m = r === "x" ? {
				left: s.left,
				top: u,
				width: s.width,
				height: Math.max(0, d - u)
			} : s, h = i ? o < a : o > a;
			f(n.index, r, h ? (a + o) / 2 : a, h ? (a + o) / 2 : o, m, r === "x" && m.height > 0 ? m : p(t.rect, n.rect), "between");
		}
		f(h.index + 1, _, x, y ? Rn(s, _) : Ln(s, _), _ === "x" ? h.rect : s, h.rect, "edge", "from");
	}
	return o;
}
function Kn(e, t, n) {
	if (![t.x, t.y].every(Number.isFinite)) return null;
	let r = Gn(e, n).flatMap((e) => {
		if (e.inside) return [];
		let n = e.axis === "x", r = n ? t.x : t.y, i = n ? t.y : t.x, a = (n ? e.rect.left : e.rect.top) + 1, o = n ? e.hitRect.left : e.hitRect.top, s = n ? e.hitRect.width : e.hitRect.height, c = Math.max(0, Mn - s / 2), l = Math.max(o - c, a - Nn), u = Math.min(o + s + c, a + Nn), d = n ? e.hitRect.top : e.hitRect.left, f = d + (n ? e.hitRect.height : e.hitRect.width);
		return r >= l && r <= u && i >= d && i <= f ? [{
			target: e,
			distance: Math.abs(r - a)
		}] : [];
	});
	if (!r.length) return null;
	let i = Math.min(...r.map((e) => e.distance));
	return r.filter((e) => e.distance <= i + 2).sort((e, t) => Number(e.target.kind === "edge") - Number(t.target.kind === "edge") || t.target.depth - e.target.depth || e.distance - t.distance)[0].target;
}
function qn(e, t, n) {
	if (![t.x, t.y].every(Number.isFinite)) return null;
	let { isExcluded: r } = Wn(e, n.excludeIds);
	return e.some((e) => r(e) && Bn(e.rect, t)) ? null : Gn(e, n).map((e) => ({
		target: e,
		distance: Vn(e.inside ? e.hitRect : e.rect, t)
	})).filter(({ distance: e }) => e <= (n.maxDistance ?? 80)).sort((e, t) => e.distance - t.distance || t.target.depth - e.target.depth)[0]?.target ?? null;
}
// admin/src/core/QuickInserter.tsx
var Jn = "cms:blocks:recent", Yn = [
	"paragraph",
	"heading",
	"image",
	"list",
	"button",
	"box"
], Xn = 6, Zn = 9, Qn = 3;
function $n() {
	try {
		let e = JSON.parse(localStorage.getItem(Jn) ?? "[]");
		return Array.isArray(e) ? e.filter((e) => typeof e == "string") : [];
	} catch {
		return [];
	}
}
function er(e) {
	if (e.kind === "block") try {
		localStorage.setItem(Jn, JSON.stringify([e.type.name, ...$n().filter((t) => t !== e.type.name)].slice(0, 12)));
	} catch {}
}
function tr({ types: e, allowed: t, onChoose: n, onClose: r }) {
	let [i, a] = M(""), [o, s] = M(!1), [c, l] = M(0), { items: u } = bn(e, i, t, !!i.trim()), d = A(() => {
		if (i.trim()) return u.slice(0, Zn);
		let e = [...$n(), ...Yn], t = (t) => {
			let n = t.kind === "block" ? e.indexOf(t.type.name) : -1;
			return n < 0 ? e.length : n;
		};
		return u.filter((e) => e.kind === "block").sort((e, n) => t(e) - t(n)).slice(0, Xn);
	}, [u, i]);
	k(() => l(0), [i]);
	let f = (e) => {
		er(e), n(e);
	};
	return o ? /* @__PURE__ */ V("div", {
		"data-cms-insert-menu": !0,
		"data-cms-browse": !0,
		children: /* @__PURE__ */ V(xn, {
			types: e,
			query: i,
			onQuery: a,
			allowed: t,
			onChoose: f,
			onClose: r
		})
	}) : /* @__PURE__ */ H("div", {
		"data-cms-insert-menu": !0,
		className: "flex w-[300px] flex-col",
		onKeyDown: (e) => {
			let t = {
				ArrowRight: 1,
				ArrowLeft: -1,
				ArrowDown: Qn,
				ArrowUp: -3
			}[e.key];
			t && d.length ? (e.preventDefault(), l((e) => Math.max(0, Math.min(d.length - 1, e + t)))) : e.key === "Enter" && d[c] ? (e.preventDefault(), f(d[c])) : e.key === "Escape" && (e.preventDefault(), r());
		},
		children: [
			/* @__PURE__ */ V("div", {
				className: "p-2 pb-0",
				children: /* @__PURE__ */ V(F, {
					bare: !0,
					fields: [{
						handle: "query",
						type: "text",
						label: E("Search"),
						icon: "search",
						size: "sm",
						autofocus: !0,
						placeholder: E("Search Blocks")
					}],
					values: { query: i },
					onChange: (e, t) => a(t ?? "")
				})
			}),
			/* @__PURE__ */ H("div", {
				role: "listbox",
				"aria-label": i.trim() ? E("Results") : E("Suggestions"),
				className: "grid grid-cols-3 gap-1 p-2",
				children: [d.map((e, t) => {
					let n = hn(e), r = gn(e);
					return /* @__PURE__ */ H(P, {
						variant: "ghost",
						role: "option",
						"aria-selected": t === c,
						"data-index": t,
						onMouseMove: () => t !== c && l(t),
						onMouseDown: (e) => e.preventDefault(),
						onClick: () => f(e),
						"data-active": t === c || void 0,
						className: "!h-[68px] min-w-0 shrink !flex-col !gap-1.5 !px-1",
						children: [/* @__PURE__ */ V(I, {
							name: r,
							size: 20
						}), /* @__PURE__ */ V("span", {
							className: "w-full truncate text-center text-xs font-medium",
							children: n
						})]
					}, _n(e));
				}), !d.length && /* @__PURE__ */ V("div", {
					className: "col-span-3 px-3 py-5 text-center text-xs text-faint",
					children: E("No matching blocks")
				})]
			}),
			/* @__PURE__ */ H(P, {
				variant: "ghost",
				size: "lg",
				onMouseDown: (e) => e.preventDefault(),
				onClick: () => s(!0),
				className: "!h-9 !gap-1.5 !rounded-none border-t border-border !text-sm focus-visible:!-outline-offset-2",
				children: [E("Browse All"), /* @__PURE__ */ V(I, {
					name: "arrow-right",
					size: 14,
					className: "text-muted"
				})]
			})
		]
	});
}
// admin/src/core/canvas.ts
function nr(e, t) {
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
function rr(e, t) {
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
var ir = "/_cms/site/";
function ar(e, t = location.href) {
	try {
		let n = new URL(e, t);
		return n.origin === location.origin && n.pathname.startsWith(ir) ? n.pathname : null;
	} catch {
		return null;
	}
}
var or = /\bimport\s*(?:[\w$*{}\s,]+?\s*from\s*)?["']([^"']+)["']|\bexport\s*[\w$*{}\s,]*?\s*from\s*["']([^"']+)["']|\bimport\s*\(\s*["']([^"']+)["']\s*\)/g;
async function sr(e, t) {
	let n = {}, r = {}, i = /* @__PURE__ */ new Set(), a = async (e) => {
		if (i.has(e) || i.size > 200) return;
		i.add(e);
		let o = await fetch(e, { credentials: "same-origin" }).then((e) => e.ok ? e.text() : "", () => ""), s = [];
		for (let i of o.matchAll(or)) {
			let a = i[1] ?? i[2] ?? i[3], o = /^(\/|\.\/|\.\.\/)/.test(a), c = o ? ar(a, location.origin + e) : a, l = c ? ar(t.imports?.[c] ?? (o ? c : "")) : null;
			c && l && (t.imports?.[c] && (n[c] = l), t.integrity?.[l] && (r[l] = t.integrity[l]), s.push(l));
		}
		await Promise.all(s.map(a));
	};
	return await a(e), {
		imports: n,
		...Object.keys(r).length ? { integrity: r } : {}
	};
}
async function cr(e, t) {
	let n;
	try {
		n = JSON.parse(e.querySelector("script[data-cms-importmap]")?.textContent ?? "{}");
	} catch {
		return null;
	}
	let r = await sr(t, n);
	if (!Object.keys(r.imports ?? {}).length) return null;
	let i = document.createElement("script");
	return i.type = "importmap", i.dataset.cmsCanvas = "", i.nonce = document.querySelector("script[nonce]")?.nonce ?? "", i.textContent = JSON.stringify(r), document.head.append(i), i;
}
function lr(e) {
	try {
		return JSON.parse(e.dataset.cmsCanvas ?? "[]").flatMap((e) => {
			let t = typeof e?.src == "string" ? ar(e.src) : null;
			return t ? [{
				...e,
				src: t
			}] : [];
		});
	} catch {
		return [];
	}
}
var ur = (e, t) => console.error("[cms] canvas behavior", e, t);
function dr() {
	let e = [], t = [];
	async function n(e, n, r) {
		let i = r.defaultView;
		if (i) try {
			let a = await cr(r, n.src);
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
			}, c = o.mount ?? o.default, l = await nr(i, () => c?.(e.el, n.props ?? {}, s));
			if (e.abort.signal.aborted) {
				typeof l == "function" && l();
				return;
			}
			typeof l == "function" && (e.cleanup = l), e.unpicture = rr(e.el, i);
		} catch (e) {
			ur(n.src, e);
		}
	}
	return {
		mount(t) {
			for (let r of t.querySelectorAll("[data-cms-canvas]")) for (let i of lr(r)) {
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
					ur(e.module ? "unmount" : "mount", t);
				}
			}
			t.forEach((e) => e.remove()), t = [];
		}
	};
}
// admin/src/core/morph.ts
function fr(e, t) {
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
function pr(e) {
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
var mr = 32, hr = 6, gr = 4;
function _r({ target: e, position: t, ...n }) {
	let r = t(e.rect);
	return /* @__PURE__ */ H(je, { children: [/* @__PURE__ */ V("div", {
		"data-cms-insertion-line": !0,
		className: B("pointer-events-none absolute z-raised rounded-full bg-focus", e.axis === "x" ? "cms-block-line-y" : "cms-block-line-x"),
		style: {
			...r,
			minWidth: 2,
			minHeight: 2
		}
	}), /* @__PURE__ */ V(br, {
		...n,
		label: E("Insert Block"),
		className: "cms-block-plus absolute size-6 -translate-x-1/2 -translate-y-1/2 rounded-xs bg-signal text-signal-ink shadow-sm",
		style: {
			left: r.left + r.width / 2,
			top: r.top + r.height / 2
		},
		data: { "data-cms-inserter": `${e.parentId ?? ""}:${e.index}` }
	})] });
}
function vr({ target: e, position: t, ...n }) {
	let r = t(e.hitRect);
	return /* @__PURE__ */ V(br, {
		...n,
		label: E("Insert Block"),
		className: "cms-block-chrome absolute size-7 -translate-x-1/2 -translate-y-1/2 rounded-sm border border-border-strong bg-bg text-muted shadow-sm hover:border-focus hover:text-focus",
		style: {
			left: r.left + r.width / 2,
			top: r.top + Math.min(r.height / 2, 40)
		},
		data: { "data-cms-appender": e.parentId ?? "" }
	});
}
function yr({ target: e, position: t, onWrite: n, onPattern: r, ...i }) {
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
				children: E("Write, or press “/” for blocks")
			}),
			r && /* @__PURE__ */ H(je, { children: [/* @__PURE__ */ V("span", { className: "mx-1 h-4 border-l border-border" }), /* @__PURE__ */ V(z, {
				compact: !0,
				onClick: r,
				className: "cms-focus-ring h-8 rounded-xs px-1 text-sm text-muted hover:text-text",
				children: E("Start From a Pattern")
			})] }),
			/* @__PURE__ */ V(br, {
				...i,
				label: E("Insert Block"),
				className: "size-8 rounded-xs text-muted hover:bg-hover hover:text-text"
			})
		]
	});
}
function br({ open: e, onOpenChange: t, returnFocus: n, children: r, label: i, className: a, style: o, data: s }) {
	return /* @__PURE__ */ V(R, {
		open: e,
		onOpenChange: t,
		side: "bottom",
		align: "center",
		className: "!overflow-hidden !p-0",
		returnFocus: n,
		trigger: /* @__PURE__ */ V(z, {
			compact: !0,
			...s,
			"aria-label": e ? E("Close") : i,
			"aria-expanded": e,
			className: B("cms-focus-ring pointer-events-auto z-drag grid place-items-center", a),
			style: o,
			children: /* @__PURE__ */ V(I, {
				name: "plus",
				size: 14,
				className: B("cms-block-plus-icon", e && "rotate-45")
			})
		}),
		children: e && r
	});
}
function xr({ id: e, label: t, icon: n, parent: r, box: i, viewport: a, canMoveUp: o, canMoveDown: s, onSelectParent: c, onDrag: l, onMove: u, onInsert: d, onDuplicate: f, onMakeComponent: p, onSavePattern: m, onDelete: h, covers: g }) {
	let _ = j(null), [v, y] = M(240);
	le(() => {
		_.current && y(_.current.offsetWidth);
	});
	let b = i.top + i.height;
	if (b < 40 || i.top > a.height - mr || i.left > a.width || i.left + i.width < 0) return null;
	let x = (e) => Math.max(gr, Math.min(a.width - v - gr, e)), S = x(i.left), C = x(i.left + i.width - v), w = i.top - mr - hr, T = b + hr, D = Math.max(gr, i.top + gr), O = (e) => e >= gr && e + mr <= a.height - gr, { left: ee, top: te } = [
		w,
		T,
		D
	].flatMap((e) => [{
		left: S,
		top: e
	}, {
		left: C,
		top: e
	}]).find((e) => O(e.top) && !g?.({
		...e,
		width: v,
		height: mr
	})) ?? {
		left: S,
		top: O(w) ? w : D
	};
	return /* @__PURE__ */ H("div", {
		ref: _,
		"data-cms-block-controls": e,
		role: "toolbar",
		"aria-label": E("Block Actions"),
		className: "cms-block-chrome pointer-events-auto absolute z-bar flex h-8 items-center gap-0.5 rounded-sm border border-border bg-bg pl-0.5 pr-1 shadow-pop",
		style: {
			left: ee,
			top: te
		},
		children: [
			/* @__PURE__ */ V(z, {
				compact: !0,
				"aria-label": E("Drag to Reorder"),
				title: E("Drag to Reorder"),
				className: "cms-focus-ring grid h-6 w-4 touch-none cursor-grab place-items-center rounded-xs text-faint hover:bg-hover hover:text-muted active:cursor-grabbing",
				onPointerDown: l,
				children: /* @__PURE__ */ V(I, {
					name: "drag",
					size: 12
				})
			}),
			r && /* @__PURE__ */ V(xe, {
				content: E("Select {block}", { block: r.label }),
				children: /* @__PURE__ */ V(L, {
					size: "xs",
					icon: "arrow-elbow-left-up",
					label: E("Select {block}", { block: r.label }),
					onClick: c
				})
			}),
			/* @__PURE__ */ V("span", { className: "mx-0.5 h-4 border-l border-border" }),
			/* @__PURE__ */ H("span", {
				className: "flex h-6 max-w-40 items-center gap-1.5 px-1 text-xs font-medium text-text",
				children: [/* @__PURE__ */ V(I, {
					name: n,
					size: 14,
					className: "shrink-0 text-muted"
				}), /* @__PURE__ */ V("span", {
					className: "truncate",
					children: t
				})]
			}),
			/* @__PURE__ */ V(L, {
				size: "xs",
				icon: "chevron-up",
				label: E("Move Up"),
				disabled: !o,
				onClick: () => u(-1)
			}),
			/* @__PURE__ */ V(L, {
				size: "xs",
				icon: "chevron-down",
				label: E("Move Down"),
				disabled: !s,
				onClick: () => u(1)
			}),
			/* @__PURE__ */ V("span", { className: "mx-0.5 h-4 border-l border-border" }),
			/* @__PURE__ */ V(de, {
				align: "end",
				trigger: /* @__PURE__ */ V(L, {
					size: "xs",
					icon: "more",
					label: E("More Block Actions")
				}),
				items: [
					{
						label: E("Insert Before"),
						icon: "arrow-up",
						shortcut: "alt+mod+t",
						onSelect: () => d("before")
					},
					{
						label: E("Insert After"),
						icon: "arrow-down",
						shortcut: "alt+mod+y",
						onSelect: () => d("after")
					},
					{
						label: E("Duplicate"),
						icon: "duplicate",
						shortcut: "mod+d",
						onSelect: f
					},
					p && {
						label: E("Make a Component"),
						icon: "symbol",
						onSelect: p
					},
					m && {
						label: E("Save as Pattern"),
						icon: "section-copy",
						onSelect: m
					},
					{
						separator: !0,
						label: ""
					},
					{
						label: E("Delete"),
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
function Sr({ drag: e, position: t }) {
	return /* @__PURE__ */ H(je, { children: [
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
			children: [/* @__PURE__ */ V(I, {
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
var Cr = new EventTarget(), wr = {
	emit(e, t) {
		Cr.dispatchEvent(new CustomEvent(e, { detail: t }));
	},
	on(e, t) {
		let n = (e) => t(e.detail);
		return Cr.addEventListener(e, n), () => Cr.removeEventListener(e, n);
	}
}, Tr = ne({
	stops: () => [],
	settings: () => {},
	readOnly: !1
}), Er = () => se(Tr);
function Dr(e = "") {
	return {
		id: g(),
		type: "paragraph",
		props: { text: e }
	};
}
function Or(e, t, n, r) {
	return e.id === t && e.prop === n && (r === void 0 || e.index === r);
}
function kr(e, t, n) {
	e.focus(t.id, n, t.prop, t.index);
}
function Ar(e, t, n) {
	if (!t) return;
	let r = /* @__PURE__ */ new Set(), i = (e) => {
		r.add(e.id), e.children?.forEach(i);
	};
	i(t);
	let a = n.find((e) => r.has(e.id));
	a ? kr(e, a, "start") : e.select(t.id, !0);
}
function jr(e) {
	let t = e.getElementById("f-title");
	return t ? (t.focus(), t.setSelectionRange(t.value.length, t.value.length), !0) : !1;
}
function Mr(e, t, n, r, i) {
	if (e.shiftKey || e.metaKey || e.ctrlKey || e.altKey) return !1;
	let a = e.key === "ArrowUp" && Yt(t) || e.key === "ArrowLeft" && Wt(t), o = e.key === "ArrowDown" && Xt(t) || e.key === "ArrowRight" && Gt(t);
	if (a) {
		let a = r[i - 1];
		if (a) kr(n, a, "end");
		else if (e.key !== "ArrowUp" || !jr(t.ownerDocument)) return !1;
		return e.preventDefault(), !0;
	}
	if (o) {
		let t = r[i + 1];
		return t ? (e.preventDefault(), kr(n, t, "start"), !0) : !1;
	}
	return !1;
}
// admin/src/write/outline.ts
var Nr = [
	"paragraph",
	"heading",
	"quote",
	"callout"
];
function Pr(e) {
	return e.kind === "actions" ? e.nodes : [e.node];
}
function Fr(e) {
	return Pr(e)[0].id;
}
function Ir(e, t, n) {
	let r = {
		types: t,
		custom: n
	}, i = [];
	for (let t of e) {
		let e = zr(t, null, !1, r), n = e.kind === "container" || e.kind === "columns", a = i.at(-1);
		!n && a && !a.container ? Vr(a.rows, e) : i.push({
			id: t.id,
			label: n && t.label?.trim() || null,
			rows: [e],
			container: n
		});
	}
	return i;
}
function Lr(e) {
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
function Rr(e) {
	let t = [], n = (e) => {
		for (let r of e) if (t.push(r), r.kind === "columns") for (let e of r.columns) n(e.rows);
		else r.kind === "container" && n(r.rows);
	};
	for (let t of e) n(t.rows);
	return t;
}
function zr(e, t, n, r) {
	let i = n || !!e.hidden, a = {
		parent: t,
		hidden: i
	}, o = r.types.get(e.type), s = r.custom(e.type), c = (e.children?.length ?? 0) > 0;
	return e.type === "columns" && o && !s ? {
		kind: "columns",
		node: e,
		columns: (e.children ?? []).map((e) => ({
			node: e,
			rows: Br(e.children ?? [], e.id, i || !!e.hidden, r)
		})),
		...a
	} : !s && o && !c && (e.type === "button" || e.type === "link") ? {
		kind: "actions",
		nodes: [e],
		...a
	} : o?.children || c ? {
		kind: "container",
		node: e,
		rows: Br(e.children ?? [], e.id, i, r),
		...a
	} : !o || s ? {
		kind: "block",
		node: e,
		...a
	} : Nr.includes(e.type) ? {
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
function Br(e, t, n, r) {
	let i = [];
	for (let a of e) Vr(i, zr(a, t, n, r));
	return i;
}
function Vr(e, t) {
	let n = e.at(-1);
	t.kind === "actions" && n?.kind === "actions" && n.parent === t.parent && n.hidden === t.hidden ? n.nodes.push(...t.nodes) : e.push(t);
}
// admin/src/write/slash.ts
var Hr = null, Ur = /* @__PURE__ */ new Set();
function Wr(e) {
	return Hr?.id === e ? Hr : null;
}
function Gr(e) {
	JSON.stringify(e) !== JSON.stringify(Hr) && (Hr = e, Ur.forEach((e) => e()));
}
function Kr() {
	return N((e) => (Ur.add(e), () => Ur.delete(e)), () => Hr);
}
function qr(e, t = 360, n = 300) {
	let r = window.innerHeight - e.bottom - 6 - 8, i = e.top - 6 - 8, a = r >= Math.min(t, 220) || r >= i;
	return {
		left: Math.max(8, Math.min(window.innerWidth - n - 8, e.left - 4)),
		top: a ? e.bottom + 6 : void 0,
		bottom: a ? void 0 : window.innerHeight - e.top + 6,
		maxHeight: Math.max(120, Math.min(t, a ? r : i))
	};
}
function Jr(e, t) {
	k(() => {
		if (!e) return;
		let n = (e) => !e.target?.closest?.("[data-cms-slash]") && Gr(null), r = t.filter((e) => !!e);
		return r.forEach((e) => e.addEventListener("pointerdown", n, !0)), () => r.forEach((e) => e.removeEventListener("pointerdown", n, !0));
	}, [e, ...t]);
}
// admin/src/write/Text.tsx
var Yr = {
	1: "text-display font-semibold",
	2: "text-3xl font-semibold",
	3: "text-2xl font-semibold",
	4: "text-xl font-semibold",
	5: "text-lg font-semibold",
	6: "text-base font-semibold uppercase tracking-[0.04em] text-muted"
}, Xr = "text-lg leading-7", Zr = {
	note: {
		icon: "info",
		className: "bg-surface",
		label: () => E("Note")
	},
	tip: {
		icon: "sparkle",
		className: "bg-success/7",
		label: () => E("Tip")
	},
	warning: {
		icon: "warning",
		className: "bg-warning/9",
		label: () => E("Warning")
	},
	danger: {
		icon: "error",
		className: "bg-danger/7",
		label: () => E("Danger")
	}
};
function Qr({ node: e }) {
	if (e.type === "quote") return /* @__PURE__ */ H("blockquote", {
		className: "m-0 border-l-[3px] border-text/80 py-0.5 pl-4",
		children: [/* @__PURE__ */ V(ti, {
			node: e,
			prop: "text",
			className: "text-lg leading-7",
			placeholder: E("Quote")
		}), /* @__PURE__ */ V(ti, {
			node: e,
			prop: "cite",
			className: "cms-block-cite mt-1 text-sm text-muted",
			placeholder: E("Attribution"),
			quiet: !0
		})]
	});
	if (e.type === "callout") return /* @__PURE__ */ V(ei, { node: e });
	if (e.type === "heading") {
		let t = String(e.props.level ?? 2);
		return /* @__PURE__ */ V(ti, {
			node: e,
			prop: "text",
			tag: `h${t}`,
			className: Yr[t] ?? Yr[2],
			placeholder: E("Heading {level}", { level: t })
		});
	}
	return /* @__PURE__ */ V($r, { node: e });
}
function $r({ node: e }) {
	let { store: t } = U(), n = G(t, (t) => t.nodes.length === 1 && t.nodes[0].id === e.id);
	return /* @__PURE__ */ V(ti, {
		node: e,
		prop: "text",
		tag: "p",
		className: Xr,
		placeholder: E("Write, or press “/” for blocks"),
		quiet: !n
	});
}
function ei({ node: e }) {
	let { store: t } = U(), { readOnly: n } = Er(), r = Zr[e.props.tone] ?? Zr.note;
	return /* @__PURE__ */ H("div", {
		className: B("flex gap-3 rounded-md px-4 py-3", r.className),
		children: [/* @__PURE__ */ V(de, {
			align: "start",
			trigger: /* @__PURE__ */ V(z, {
				compact: !0,
				disabled: n,
				"aria-label": E("Callout Style"),
				className: "grid h-[27px] w-5 shrink-0 place-items-center rounded-xs text-muted hover:text-text",
				children: /* @__PURE__ */ V(I, {
					name: r.icon,
					size: 17
				})
			}),
			items: Object.entries(Zr).map(([n, r]) => ({
				label: r.label(),
				icon: r.icon,
				checked: n === (e.props.tone ?? "note"),
				onSelect: () => t.updateProps(e.id, { tone: n })
			}))
		}), /* @__PURE__ */ V(ti, {
			node: e,
			prop: "text",
			className: B(Xr, "min-w-0 flex-1"),
			placeholder: E("Write a note")
		})]
	});
}
var ti = ae(function({ node: e, prop: i, tag: s = "div", className: c, placeholder: l, quiet: u }) {
	let { store: d, types: f, allowed: _ } = U(), { stops: v, readOnly: y } = Er(), b = G(d, (t) => t.focus?.id === e.id && (t.focus.prop ?? "text") === i ? t.focus : null), x = String(e.props[i] ?? ""), S = (t, n) => {
		if (e.type === "paragraph" && i === "text" && C(t, n)) return;
		d.updateProps(e.id, { [i]: t }, `text:${e.id}:${i}`);
		let r = e.type === "paragraph" ? t.replace(/<[^>]+>/g, "").match(/^\/([\w-]*)$/) : null;
		Gr(r ? {
			id: e.id,
			query: r[1]
		} : null);
	}, C = (n, i) => {
		let a = n.replace(/&nbsp;/g, " "), o = (n, a, o) => {
			let s = r(d.get().nodes, e.id), c = s?.parentId ? t(d.get().nodes, s.parentId) : null;
			if (!f.has(n) || !p(c, n, f, c ? [] : _)) return !1;
			let l = Math.max(0, qt(i) - en(o));
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
			let t = Dr(), { nodes: n } = d.get(), i = r(n, e.id);
			return d.commit(m(h(n, e.id, (e) => ({
				...e,
				type: "divider",
				props: {}
			})), i?.parentId ?? null, (i?.index ?? n.length) + 1, [t])), d.focus(t.id, "start"), !0;
		}
		return !1;
	}, w = (s, c) => {
		if (s.defaultPrevented) return;
		let l = v(), u = l.findIndex((t) => Or(t, e.id, i)), p = l[u], { nodes: y } = d.get();
		if (s.key === "Enter" && !s.shiftKey && !s.metaKey && !s.ctrlKey && !s.altKey) {
			s.preventDefault();
			let t = Wr(e.id);
			if (t && fn(!0, !!document.querySelector("[data-cms-slash]"))) return Gr({
				...t,
				enter: !0
			});
			if (i === "cite") {
				let t = Dr(), n = o(y, e.id, "paragraph", f, _);
				if (!n) return;
				d.insert(n.parentId, n.index, [t]), d.focus(t.id, "start");
				return;
			}
			let [a, l] = Jt(c);
			if (n(a) && !n(l)) {
				let t = r(y, e.id);
				if (!t) return;
				d.insert(t.parentId, t.index, [Dr()]), d.focus(e.id, "start");
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
			} : Dr(l), p = o(y, e.id, "paragraph", f, _);
			if (!p) return;
			d.commit(m(h(y, e.id, (e) => ({
				...e,
				props: {
					...e.props,
					[i]: a
				}
			})), p.parentId, p.index, [u])), d.focus(u.id, "start");
		} else if (s.key === "Backspace" && Wt(c)) {
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
				d.remove(e.id), kr(d, t, "end");
				return;
			}
			if (t.parent === p?.parent && T(t, x)) return;
			kr(d, t, "end");
		} else if (s.key === "Delete" && Gt(c) && i === "text") {
			let n = l[u + 1], r = n && n.prop === "text" && n.parent === p?.parent ? t(y, n.id) : null;
			if (!r || !["paragraph", "heading"].includes(r.type)) return;
			s.preventDefault();
			let i = en(x);
			d.commit(a(h(y, e.id, (e) => ({
				...e,
				props: {
					...e.props,
					text: x + String(r.props.text ?? "")
				}
			})), r.id)), d.focus(e.id, i);
		} else Mr(s, c, d, l, u) || s.key === "Escape" && (s.preventDefault(), c.blur(), d.select(e.id, !0));
	}, T = (n, r) => {
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
			})), e.id)), kr(d, n, en(s)), !0;
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
		})), e.id)), kr(d, n, en(s)), !0;
	};
	return /* @__PURE__ */ V(on, {
		tag: s,
		html: x,
		onChange: S,
		placeholder: l,
		quiet: u,
		className: c,
		focus: b,
		disabled: y,
		onKeyDown: w,
		onFocus: () => d.get().selected !== e.id && d.select(e.id),
		onPaste: (t) => !t.includes("\n") || i !== "text" ? !1 : (import("./paste-DAY3yvxf.js").then((n) => n.pasteMarkdown(d, e, t, f, _)), !0)
	});
});
function ni({ node: e, renderItem: t }) {
	let { store: i, types: s, allowed: c } = U(), { stops: l, readOnly: u } = Er(), d = Array.isArray(e.props.items) && e.props.items.length ? e.props.items : [""], f = G(i, (t) => t.focus?.id === e.id && t.focus.prop === "items" ? t.focus : null), p = !!e.props.ordered, g = (t, n = `list:${e.id}`) => i.updateProps(e.id, { items: t }, n), _ = (t) => (u, f) => {
		if (u.defaultPrevented) return;
		let { nodes: p } = i.get(), _ = l(), v = _.findIndex((n) => Or(n, e.id, "items", t));
		if (u.key === "Enter" && !u.shiftKey && !u.metaKey && !u.ctrlKey) {
			if (u.preventDefault(), n(d[t]) && t === d.length - 1) {
				let t = Dr(), n = d.slice(0, -1), r = o(p, e.id, "paragraph", s, c);
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
			let [r, l] = Jt(f);
			g([
				...d.slice(0, t),
				r,
				l,
				...d.slice(t + 1)
			], ""), i.focus(e.id, "start", "items", t + 1);
		} else if (u.key === "Backspace" && Wt(f)) {
			if (u.preventDefault(), t === 0) {
				let t = Dr(d[0]), n = r(p, e.id), o = d.slice(1), s = m(p, n?.parentId ?? null, n?.index ?? 0, [t]);
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
			], ""), i.focus(e.id, en(d[t - 1]), "items", t - 1);
		} else Mr(u, f, i, _, v) || u.key === "Escape" && (u.preventDefault(), f.blur(), i.select(e.id, !0));
	}, v = (n, r) => /* @__PURE__ */ V(on, {
		html: n,
		className: t ? void 0 : "min-w-0 flex-1 pl-1",
		tag: t ? "span" : "div",
		placeholder: E("List"),
		quiet: !0,
		disabled: u,
		focus: f && (f.index ?? 0) === r ? f : null,
		onChange: (e) => g(d.map((t, n) => n === r ? e : t)),
		onKeyDown: _(r),
		onFocus: () => i.get().selected !== e.id && i.select(e.id)
	});
	return t ? /* @__PURE__ */ V(je, { children: d.map((e, n) => t(n, v(e, n))) }) : /* @__PURE__ */ V("div", {
		className: B(Xr, "space-y-0.5"),
		children: d.map((e, t) => /* @__PURE__ */ H("div", {
			className: "flex",
			children: [/* @__PURE__ */ V("span", {
				className: B("w-6 shrink-0 select-none text-muted", p ? "pr-1.5 text-right tabular-nums" : "pl-1.5"),
				"aria-hidden": !0,
				children: p ? `${t + 1}.` : "•"
			}), v(e, t)]
		}, t))
	});
}
// admin/src/LiveEditor.tsx
var ri = (e, t, n) => e.axis === "x" ? {
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
}, ii = (e) => `${e.parentId ?? ""}:${e.index}:${e.inside ? "inside" : e.axis}`, ai = "\nhtml{scrollbar-width:thin;scrollbar-color:rgb(127 127 127/.35) transparent}\n[data-cms-document][data-cms-node]{cursor:default}\n.cms-block-text{display:block;min-width:1ch;min-height:1lh;white-space:pre-wrap;overflow-wrap:break-word;outline:none;border-radius:0;font:inherit;color:inherit;line-height:inherit;text-align:inherit;cursor:text}\n.cms-block-text:empty::before{content:attr(data-placeholder);opacity:.4;pointer-events:none}\n.cms-block-text[data-quiet]:empty:not(:focus)::before{content:none}\n[data-cms-prop]{cursor:text}\n.cms-block-text::selection,.cms-block-text ::selection{background:rgb(0 122 255/.2)}\nimg,a{-webkit-user-drag:none}\niframe{pointer-events:none}\n[data-cms-conditional=hidden]:not([data-cms-reveal]){display:none!important}\n[data-cms-editor-empty-root]{visibility:hidden}\n.cms-js [data-cms-appear]{visibility:visible!important}\n", oi = (e, t) => e.left === t.left && e.top === t.top && e.width === t.width && e.height === t.height, si = (e, t) => e.length === t.length && e.every((e, n) => oi(e, t[n])) ? e : t, ci = /* @__PURE__ */ new Set([
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
function li(e, t, n) {
	let r = e.elementFromPoint(t, n);
	if (!r || r === e.body || r === e.documentElement) return !1;
	if (ci.has(r.tagName) || r.closest("svg")) return !0;
	let i = [...r.childNodes].filter((e) => e.nodeType === Node.TEXT_NODE && e.textContent?.trim());
	if (!i.length) return !1;
	let a = e.createRange();
	return i.some((e) => (a.selectNodeContents(e), [...a.getClientRects()].some((e) => t >= e.left - 2 && t <= e.right + 2 && n >= e.top - 2 && n <= e.bottom + 2)));
}
var ui = 1024;
function di({ collection: e, blueprint: n, entryId: a, content: c, onInspect: d, standalone: m, onTitleChange: h }) {
	let { store: g, types: _, allowed: b, fieldHandle: x, readOnly: C = !1 } = U(), T = Le(), D = G(g, (e) => e.nodes), O = G(g, (e) => e.selected), ee = G(g, Be), te = G(g, (e) => e.blockMode), ne = G(g, (e) => e.hovered), re = G(g, (e) => e.device), ie = E("Page Builder"), ae = !C && !!O && te;
	ke("up", E("Select Previous Block"), ie, ae), ke("down", E("Select Next Block"), ie, ae), ke("shift+up", E("Select the Block Above Too"), ie, ae), ke("shift+down", E("Select the Block Below Too"), ie, ae), ke("alt+up", E("Move Up"), ie, ae), ke("alt+down", E("Move Down"), ie, ae), ke("enter", E("Edit Block"), ie, ae), ke("mod+d", E("Duplicate Block"), ie, ae), ke("backspace", E("Delete Block"), ie, ae), ke("escape", E("Deselect"), ie, !!O), ke("mod+alt+t", E("Insert Before"), ie, !C && !!O), ke("mod+alt+y", E("Insert After"), ie, !C && !!O), ke("mod+z", E("Undo"), ie, !C), ke("mod+shift+z", E("Redo"), ie, !C);
	let se = Pt(), ce = j(null), N = j(null), [P, ue] = M(null), F = j(""), [I, L] = M([]), [de, fe] = M(!0), [pe, me] = M(null), [he, ge] = M(0), [R, z] = M({
		width: 1024,
		height: 700,
		scale: 1,
		left: 0
	}), [ve, be] = M([]), [xe, B] = M(null), [Se, we] = M([]), [Te, Ee] = M(null), De = j(0), Oe = j(""), [Ae, Me] = M(!1), [Pe, Fe] = M(!1), Ie = j(!1), W = j(null), ze = A(() => {
		let e = [], t = (n, r) => n.forEach((n, i) => {
			e.push({
				node: n,
				parentId: r,
				index: i
			}), n.children && t(n.children, n.id);
		});
		return t(D, null), e;
	}, [D]), Ve = j(ze);
	Ve.current = ze;
	let [He, Ue] = M(null), [K, q] = M(!1), We = kn(!!e && !!y().collections.find((t) => t.handle === e)?.routable && !C && !m), Ke = j(He);
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
	}, $e = () => Ve.current.map(({ node: e, parentId: t, index: n }) => `${t}:${n}:${e.id}:${e.type}:${e.type === "list" ? e.props.items?.length ?? 0 : ""}`).join("|"), et = () => $e() + "#" + Ve.current.map(({ node: e }) => e.class ?? "").join("|"), tt = j(""), nt = j(null), rt = j(dr());
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
	}, J = j(/* @__PURE__ */ new Map()), ot = (e) => {
		let t = !1;
		for (let { node: n } of Ve.current) {
			let r = n.class ?? "", i = J.current.get(n.id);
			if (J.current.set(n.id, r), i === void 0 || i === r) continue;
			let a = Ge(r), o = Ge(i).filter((e) => !a.includes(e));
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
	let st = (e, t) => e.querySelector(`[data-cms-document="${F.current}"][data-cms-node="${CSS.escape(t)}"]`) ?? e.querySelector(`[data-cms-proto-document="${F.current}"][data-cms-proto="${CSS.escape(t)}"]`), ct = (e) => {
		let n = "[data-cms-document][data-cms-node],[data-cms-proto-document][data-cms-proto]", r = e?.closest?.(n) ?? null;
		for (; r;) {
			let e = r.dataset.cmsDocument === F.current ? r.dataset.cmsNode : r.dataset.cmsProtoDocument === F.current ? r.dataset.cmsProto : void 0;
			if (e && t(g.get().nodes, e)) return e;
			r = r.parentElement?.closest(n) ?? null;
		}
		return null;
	}, lt = (e, t = e.ownerDocument.defaultView?.getComputedStyle(e)) => {
		if (t?.display !== "contents") return e.getBoundingClientRect();
		let n = e.ownerDocument.createRange();
		return n.selectNodeContents(e), n.getBoundingClientRect();
	}, ut = () => {
		if (W.current) return W.current;
		let e = N.current?.contentDocument, t = e?.querySelector(`[data-cms-editor-root="${F.current}"]`);
		if (!e || !t) return null;
		let n = (e) => e.display.includes("flex") && e.flexDirection.startsWith("row") || e.display.includes("grid") && e.gridTemplateColumns.split(" ").length > 1 ? "x" : "y", r = new Map([...e.querySelectorAll(`[data-cms-document="${F.current}"][data-cms-node]`)].map((e) => [e.dataset.cmsNode, e])), i = Ve.current.flatMap(({ node: t, parentId: i, index: a }) => {
			let o = r.get(t.id), s = o && e.defaultView.getComputedStyle(o);
			return !o || !s || s.display === "none" ? [] : [{
				id: t.id,
				parentId: i,
				index: a,
				rect: lt(o, s),
				container: !!_.get(t.type)?.children && !["repeat", "component"].includes(t.type),
				axis: n(s)
			}];
		}), a = lt(t);
		return a.width === 0 && (a = lt(t.parentElement ?? e.body)), i.length || (a = {
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
	}, dt = (e, n = ["paragraph"]) => {
		let r = e ? t(g.get().nodes, e) : null;
		return n.every((e) => p(r, e, _, r ? [] : b));
	}, ft = A(() => /* @__PURE__ */ new Map(), [_, b]), pt = (e) => {
		let n = e ? t(g.get().nodes, e)?.type ?? "" : "";
		return ft.get(n) ?? ft.set(n, [..._.values()].some((t) => dt(e, [t.name]))).get(n);
	}, mt = () => {
		let e = /* @__PURE__ */ new Map();
		return (t) => e.get(t) ?? e.set(t, pt(t)).get(t);
	}, ht = () => {
		let e = N.current?.contentDocument;
		if (!e) return;
		be((t) => si(t, Be(g.get()).flatMap((t) => {
			let n = st(e, t);
			return n ? [lt(n)] : [];
		})));
		let t = g.get().hovered, n = t ? st(e, t) : null;
		if (B((e) => {
			let t = n ? lt(n) : null;
			return e && t && oi(e, t) ? e : t;
		}), Ie.current && !Ke.current) return;
		let r = ut();
		if (!r) return;
		let i = Gn(r.blocks, {
			rootRect: r.rootRect,
			canInsert: mt()
		});
		we(i), Ue((t) => {
			if (!t) return t;
			let n = qe.current?.key === ii(t) ? qe.current : null, r = n ? st(e, n.id) : null, a = n ? r ? ri(t, lt(r), n.side) : t : i.find((e) => ii(e) === ii(t)) ?? t, o = a.inside ? a.hitRect.top : a.rect.top;
			return o < 0 || o > Y.current.layout.height ? null : a;
		});
	}, gt = j({
		frame: 0,
		run: ht
	});
	gt.current.run = ht;
	let _t = () => {
		let e = gt.current;
		e.frame ||= requestAnimationFrame(() => {
			e.frame = 0, e.run();
		});
	}, vt = (e) => {
		let t = e ? ii(e) : "";
		t !== Oe.current && (Oe.current = t, clearTimeout(De.current), Ee(null), e && (De.current = window.setTimeout(() => Ee(e), 80)));
	}, yt = (e) => {
		let t = Be(g.get()), n = t.length ? r(g.get().nodes, e === "before" ? t[0] : t.at(-1)) : null, i = N.current?.contentDocument;
		if (!n || !i || Y.current.readOnly || !pt(n.parentId)) return;
		let a = e === "before" ? n.index : n.index + 1, o = st(i, e === "before" ? t[0] : t.at(-1)), s = o ? lt(o) : null, c = i.defaultView, l = Y.current.layout.height;
		if (s) {
			let t = e === "before" ? s.top : s.top + s.height;
			(t < 48 || t > l - 160) && c.scrollBy(0, t - l / 3);
		}
		requestAnimationFrame(() => {
			W.current = null;
			let r = ut(), i = o ? lt(o) : null;
			if (!i) return;
			let s = ri((r && Gn(r.blocks, {
				rootRect: r.rootRect,
				canInsert: mt()
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
				key: ii(s),
				id: e === "before" ? t[0] : t.at(-1),
				side: e
			}, vt(null), Ue(s);
		});
	}, bt = () => {
		let e = P?.activeElement;
		if (document.activeElement === N.current && e?.isContentEditable) return e;
		let t = g.get().focus;
		return (t && P ? st(P, t.id) : null)?.querySelector("[data-cms-inline]") ?? null;
	}, xt = (e) => {
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
		L((e) => e.length === t.length && e.every((e, r) => n(e, t[r])) ? e : t), _t();
	}, St = () => {
		let e = N.current?.contentDocument, t = e?.querySelector("[data-cms-editor-root]");
		if (!e || !t || !F.current) return;
		let n = et();
		if (n === tt.current) {
			_t();
			return;
		}
		tt.current = n;
		let r = new Set(s(g.get().nodes).map(({ node: e }) => e.id)), i = /* @__PURE__ */ new Map();
		for (let t of e.querySelectorAll("[data-cms-document][data-cms-node]")) t.dataset.cmsDocument === F.current && (r.has(t.dataset.cmsNode) ? i.has(t.dataset.cmsNode) || i.set(t.dataset.cmsNode, t) : t.remove());
		let a = (t) => {
			let n = i.get(t);
			return n?.isConnected ? n : st(e, t);
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
		g.get().nodes.length && t.querySelector(":scope > [data-cms-editor-empty-root]")?.remove(), o(g.get().nodes, t), ot(e), at(e), xt(e);
	}, Ct = A(() => ({
		stops: () => Lr(Ir(g.get().nodes, _, () => !1)).filter((e) => I.some((t) => t.id === e.id && t.prop === e.prop && (e.index === void 0 || t.index === e.index))),
		settings: (e) => Y.current.onInspect(e),
		readOnly: C
	}), [
		g,
		_,
		I,
		C
	]), wt = j(Ct);
	wt.current = Ct, le(() => {
		W.current = null, St();
	}, [D, P]), le(() => {
		if (!ce.current) return;
		let e = () => {
			let e = ce.current, t = re === "tablet" ? Ce.tablet : re === "phone" ? Math.min(Ce.phone, e.clientWidth) : Math.max(e.clientWidth, ui);
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
	}, [re, g]), k(() => {
		_t();
	}, [
		O,
		ee,
		ne,
		R,
		P,
		Pe
	]), Xe.current = async () => {
		let t = Ye.current;
		t.queued = !1, t.busy = !0;
		let r = Je.current, i = $e(), o = new Map(Ve.current.map(({ node: e }) => [e.id, e.class ?? ""])), s = new AbortController();
		nt.current = s;
		try {
			let { text: l, headers: u } = await w("POST", a ? `/__preview/${a}` : "/__preview", {
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
			if (!d) throw Error(E("The editor could not load its rendering context."));
			let f = new DOMParser().parseFromString(l, "text/html");
			if (!f.querySelector(`[data-cms-editor-root="${d}"]`)) throw Error(E("This template has no content outlet. Choose a template that includes the content field."));
			f.querySelectorAll("script").forEach((e) => {
				e.type === "importmap" && (e.dataset.cmsImportmap = ""), e.type = "text/cms-off", e.removeAttribute("src");
			}), F.current = d;
			let p = N.current?.contentDocument;
			p?.documentElement?.hasAttribute("data-cms-bridge-ready") ? (rt.current.unmount(), fr(p, f), p.documentElement.setAttribute("data-cms-bridge-ready", ""), tt.current = "", J.current = o, ot(p), at(p), xt(p), rt.current.mount(p)) : N.current && (J.current = o, N.current.srcdoc = f.documentElement.outerHTML), r === Je.current && me(null);
		} catch (e) {
			!s.signal.aborted && r === Je.current && (me(e instanceof Error ? e.message : String(e)), fe(!1));
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
		D,
		x,
		m,
		he
	]), k(() => (Ye.current.alive = !0, Ye.current.queued && Qe(), () => {
		Ye.current.alive = !1, clearTimeout(Ye.current.timer), Ye.current.timer = 0, nt.current?.abort(), cancelAnimationFrame(gt.current.frame), gt.current.frame = 0;
	}), []);
	let Tt = (e, t) => {
		let n = l(e, _);
		n.length && !C && dt(t.parentId, n.map((e) => e.type)) && (g.insert(t.parentId, t.index, n), Ar(g, n[0], Lr(Ir(g.get().nodes, _, () => !1))), Ue(null), vt(null));
	}, Et = () => {
		if (Y.current.readOnly || !dt(null)) return;
		let e = Dr();
		g.insert(null, 0, [e]), g.focus(e.id, "start");
	}, Ot = () => {
		let e = N.current?.contentDocument;
		return e ? Ve.current.filter(({ node: t }) => {
			let n = st(e, t.id);
			return !!n && e.defaultView.getComputedStyle(n).display !== "none";
		}).map(({ node: e }) => e.id) : [];
	}, kt = (e) => {
		if (!e) return;
		g.select(e, !0);
		let t = N.current?.contentDocument;
		(t && st(t, e))?.scrollIntoView({ block: "nearest" });
	}, At = (e) => {
		let n = e.metaKey || e.ctrlKey, r = Be(g.get()), i = g.get().selected;
		if (e.key === "Escape") {
			g.select(null);
			return;
		}
		if (!i || !g.get().blockMode) return;
		let a = Ot(), o = a.indexOf(g.get().head ?? i);
		if (["ArrowUp", "ArrowDown"].includes(e.key)) {
			e.preventDefault();
			let t = e.key === "ArrowUp";
			e.altKey ? g.nudgeSelection(t ? -1 : 1) : e.shiftKey ? g.extend(t ? -1 : 1) : kt(a[o + (t ? -1 : 1)]);
		} else if (e.key === "Enter") {
			e.preventDefault();
			let n = t(g.get().nodes, i), r = wt.current.stops(), a = n ? new Set(s([n]).map((e) => e.node.id)) : /* @__PURE__ */ new Set();
			r.some((e) => a.has(e.id)) ? Ar(g, n, r) : Y.current.onInspect(i);
		} else if (e.key === "Backspace" || e.key === "Delete") {
			e.preventDefault();
			let n = new Set(r.flatMap((e) => {
				let n = t(g.get().nodes, e);
				return n ? s([n]).map((e) => e.node.id) : [];
			})), i = a.findIndex((e) => n.has(e)), o = a.slice(0, Math.max(0, i)).reverse().find((e) => !n.has(e)) ?? a.slice(i + 1).find((e) => !n.has(e));
			g.removeSelection(), kt(o);
		} else n && e.key.toLowerCase() === "d" && (e.preventDefault(), g.duplicateSelection());
	}, jt = () => {
		let e = N.current?.contentDocument;
		if (!e || !F.current) return;
		if (!e.querySelector("[data-cms-editor-root]")) {
			fe(!1), me(E("This template has no content outlet. Choose a template that includes the content field."));
			return;
		}
		e.documentElement.setAttribute("data-cms-bridge-ready", ""), tt.current = "";
		let n = e.createElement("style");
		n.dataset.cmsBridge = "", n.textContent = ai, e.head.appendChild(n), ot(e), at(e), ue(e), xt(e), fe(!1), rt.current.unmount(), rt.current.mount(e), e.addEventListener("submit", (e) => e.preventDefault(), !0), e.addEventListener("dragstart", (e) => e.preventDefault()), e.addEventListener("focusout", (e) => {
			e.target.isContentEditable && Me(!1), Qe();
		}), e.addEventListener("focusin", (e) => {
			let t = e.target;
			if (!t.isContentEditable) return;
			Me(!0);
			let n = t.closest("[data-cms-instance-node],[data-cms-document][data-cms-node]");
			g.select(n?.dataset.cmsInstanceNode ?? n?.dataset.cmsNode ?? null), g.hover(null);
		}), e.addEventListener("pointermove", (e) => {
			if (Y.current.readOnly || (Ie.current && (e.movementX || e.movementY) && (Ie.current = !1, Fe(!1)), g.hover(ct(e.target)), Ie.current || Ke.current)) return;
			let t = ut();
			vt(t && Kn(t.blocks, {
				x: e.clientX,
				y: e.clientY
			}, {
				rootRect: t.rootRect,
				canInsert: mt()
			}));
		}), e.addEventListener("pointerdown", () => {
			Ue(null), vt(null);
		}), e.addEventListener("click", (e) => {
			let t = e.target;
			if (t.closest("[contenteditable=\"true\"]")) {
				t.closest("a") && e.preventDefault();
				return;
			}
			e.preventDefault();
			let n = ct(t);
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
				} else r && n.altKey && (n.code === "KeyT" || n.code === "KeyY") ? (n.preventDefault(), yt(n.code === "KeyT" ? "before" : "after")) : n.target.isContentEditable ? r || n.altKey || n.key.length !== 1 && ![
					"Backspace",
					"Delete",
					"Enter"
				].includes(n.key) || (Ie.current = !0, Fe(!0), vt(null)) : At(n);
			}
		});
		let r = (e) => g.get().blockMode && !!g.get().selected && !e.target.isContentEditable, i = (e, n) => {
			if (!r(e) || !e.clipboardData) return;
			let i = Be(g.get()).map((e) => t(g.get().nodes, e)).filter(Boolean);
			i.length && (e.preventDefault(), e.clipboardData.setData("text/plain", "cms-blocks:" + JSON.stringify(i)), n && !Y.current.readOnly && g.removeSelection());
		};
		e.addEventListener("copy", (e) => i(e, !1)), e.addEventListener("cut", (e) => i(e, !0)), e.addEventListener("paste", (e) => {
			let t = e.clipboardData?.getData("text/plain") ?? "";
			if (!r(e) || Y.current.readOnly || !t.startsWith("cms-blocks:")) return;
			e.preventDefault();
			let n;
			try {
				n = JSON.parse(t.slice(12)).map(u);
			} catch {
				return;
			}
			let i = g.get().nodes, a = o(i, Be(g.get()).at(-1), n.map((e) => e.type), _, b);
			a && n.length && (g.insert(a.parentId, a.index, n), g.select(n[0].id, !0), n.length > 1 && g.extendTo(n.at(-1).id));
		});
		let a = 0;
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
			Ne(() => {
				vt(null), ht();
			}), clearTimeout(a), a = window.setTimeout(() => {
				W.current = null, ht();
			}, 150);
		}, { passive: !0 }), e.defaultView?.addEventListener("resize", () => {
			W.current = null, _t();
		}), e.querySelectorAll("img,link[rel=\"stylesheet\"]").forEach((e) => e.addEventListener("load", () => {
			W.current = null, _t();
		}, { once: !0 })), e.fonts.ready.then(() => {
			W.current = null, ht();
		});
	};
	k(() => {
		let e = se.source;
		if (!e) return;
		let t = !0;
		return Dt(e).then((n) => {
			if (!t) return;
			it.current = {
				build: n.build,
				faces: e.faces
			};
			let r = N.current?.contentDocument;
			r?.documentElement?.hasAttribute("data-cms-bridge-ready") && (at(r), W.current = null, _t());
		}).catch(() => {
			t && (it.current = null);
		}), () => {
			t = !1;
		};
	}, [se.source]), k(() => wr.on("scroll-to", ({ node: e, top: t }) => {
		let n = N.current?.contentDocument, r = n && st(n, e);
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
			for (let t of ee) {
				let n = st(e, t);
				for (; n;) n.dataset.cmsConditional === "hidden" && (n.dataset.cmsReveal = ""), n = n.parentElement;
			}
		}
	}, [ee]);
	let Mt = pr({
		disabled: C,
		frame: N,
		scale: R.scale,
		invalidate: () => {
			W.current = null, ht();
		},
		target: (e, n) => {
			let r = ut();
			if (!r || e.x < r.rootRect.left || e.x > r.rootRect.left + r.rootRect.width || e.y < r.rootRect.top - 12 || e.y > r.rootRect.top + r.rootRect.height + 12) return null;
			let i = n.map((e) => t(g.get().nodes, e));
			if (i.some((e) => !e)) return null;
			let a = i.map((e) => e.type);
			return qn(r.blocks, e, {
				rootRect: r.rootRect,
				maxDistance: Infinity,
				excludeIds: new Set(n),
				canInsert: (e) => dt(e, a)
			});
		},
		commit: (e, t) => g.moveTo(e, t.parentId, t.index)
	}), Nt = (e) => {
		let t = N.current?.contentDocument;
		if (!t) return !1;
		for (let n of [.25, .75]) for (let r = 0; r < 6; r++) if (li(t, (e.left + e.width * (r + .5) / 6 - R.left) / R.scale, (e.top + e.height * n) / R.scale)) return !0;
		return !1;
	}, Ft = oe(() => {
		let e = N.current.getBoundingClientRect();
		return {
			x: e.left,
			y: e.top,
			scale: R.scale
		};
	}, [R.scale]), X = (e) => ({
		left: R.left + e.left * R.scale,
		top: e.top * R.scale,
		width: e.width * R.scale,
		height: e.height * R.scale
	});
	return /* @__PURE__ */ H(Tr.Provider, {
		value: Ct,
		children: [K && /* @__PURE__ */ V(An, {
			open: !0,
			onOpenChange: q,
			patterns: We,
			onChoose: (e) => {
				let t = e.blocks.map((e) => u(e));
				g.insert(null, 0, t), g.select(t[0]?.id ?? null), q(!1);
			}
		}), /* @__PURE__ */ H("div", {
			className: "flex h-full min-h-0 flex-col",
			"data-live-editor": !0,
			children: [
				pe && /* @__PURE__ */ V(_e, {
					compact: !0,
					message: pe,
					onRetry: () => ge((e) => e + 1)
				}),
				/* @__PURE__ */ H("div", {
					ref: ce,
					onPointerLeave: () => {
						g.hover(null), vt(null);
					},
					onPointerMove: (e) => {
						e.target.closest("[data-cms-inserter]") || (vt(null), g.hover(null));
					},
					className: "relative min-h-0 flex-1 overflow-hidden bg-sunken",
					children: [
						de && /* @__PURE__ */ V("div", {
							className: "absolute inset-0 z-drag grid place-items-center bg-bg",
							children: /* @__PURE__ */ V(ye, {})
						}),
						/* @__PURE__ */ V("iframe", {
							ref: N,
							title: E("Live editor"),
							sandbox: "allow-same-origin",
							onLoad: jt,
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
								!C && !Mt.drag && !Ae && !Pe && !He && ne && xe && !ee.includes(ne) && /* @__PURE__ */ V("div", {
									"data-cms-hover": ne,
									className: "absolute z-raised border border-focus/50",
									style: X(xe)
								}),
								!Mt.drag && ve.map((e, t) => /* @__PURE__ */ V("div", {
									"data-cms-selection": !0,
									className: "absolute z-raised border-solid border-focus",
									style: {
										...X(e),
										borderWidth: 1.5
									}
								}, t)),
								!C && !Mt.drag && te && O && ve[0] && (() => {
									let e = r(D, ee[0]), n = r(D, ee.at(-1)), a = t(D, O);
									if (!e || !n || !a) return null;
									let o = i(D, e.parentId), s = (e) => ({
										label: Re(e, _, T),
										icon: e.type === "component" ? "symbol" : _.get(e.type)?.icon ?? "square"
									}), c = e.parentId ? t(D, e.parentId) : null, { label: l, icon: u } = s(a);
									return /* @__PURE__ */ V(xr, {
										id: O,
										label: ee.length > 1 ? S(ee.length, "{count} block", "{count} blocks") : l,
										icon: u,
										parent: c ? s(c) : null,
										box: X(ve[0]),
										viewport: {
											width: R.width * R.scale + R.left * 2,
											height: R.height * R.scale
										},
										canMoveUp: e.index > 0,
										canMoveDown: n.index < o.length - 1,
										onSelectParent: () => c && d(c.id),
										onDrag: (e) => {
											Ue(null), Mt.start(e, Be(g.get()), l);
										},
										onMove: (e) => g.nudgeSelection(e),
										onInsert: (e) => requestAnimationFrame(() => yt(e)),
										onDuplicate: () => g.duplicateSelection(),
										onDelete: () => g.removeSelection(),
										onMakeComponent: a.type !== "component" && v("entries.components.create") && f(g, _, b) ? () => En(g) : void 0,
										onSavePattern: v("entries.patterns.create") ? () => Dn(g) : void 0,
										covers: Nt
									});
								})(),
								!C && !Mt.drag && Se.filter((e) => e.inside).map((e) => {
									let n = {
										open: !!He && ii(He) === ii(e),
										onOpenChange: (t) => Ue(t ? e : null),
										returnFocus: bt,
										children: /* @__PURE__ */ V(tr, {
											types: [..._.values()],
											allowed: (t) => dt(e.parentId, [t.name]),
											onChoose: (t) => Tt(t, e),
											onClose: () => Ue(null)
										})
									};
									if (e.parentId === null) return D.length ? null : /* @__PURE__ */ V(yr, {
										target: e,
										position: X,
										onWrite: dt(null) ? Et : void 0,
										onPattern: We.length ? () => q(!0) : void 0,
										...n
									}, "root");
									let r = e.hitRect.top;
									return t(D, e.parentId)?.children?.length || r + e.hitRect.height < 0 || r > R.height || !(n.open || ne === e.parentId || ee.includes(e.parentId)) ? null : /* @__PURE__ */ V(vr, {
										target: e,
										position: X,
										...n
									}, ii(e));
								}),
								!C && !Mt.drag && (() => {
									let e = He && !He.inside ? He : !He && !Pe ? Te : null;
									return e ? /* @__PURE__ */ V(_r, {
										target: e,
										position: X,
										open: He === e,
										onOpenChange: (t) => {
											Ue(t ? e : null), t || vt(null);
										},
										returnFocus: bt,
										children: /* @__PURE__ */ V(tr, {
											types: [..._.values()],
											allowed: (t) => dt(e.parentId, [t.name]),
											onChoose: (t) => Tt(t, e),
											onClose: () => Ue(null)
										})
									}, ii(e)) : null;
								})(),
								Mt.drag && /* @__PURE__ */ V(Sr, {
									drag: Mt.drag,
									position: X
								})
							]
						})
					]
				}),
				P && /* @__PURE__ */ H(je, { children: [
					/* @__PURE__ */ V(fi, { slots: I }),
					h && /* @__PURE__ */ V(gi, {
						doc: P,
						content: c,
						onChange: h,
						readOnly: C
					}),
					/* @__PURE__ */ V(ln, {
						root: P,
						offset: Ft
					}),
					/* @__PURE__ */ V(hi, {
						doc: P,
						frame: N.current,
						scale: R.scale
					})
				] })
			]
		})]
	});
}
var fi = ae(function({ slots: e }) {
	let { store: t } = U(), n = G(t, (e) => e.nodes), r = new Set(e.filter((e) => !e.instance && e.prop === "items").map((e) => e.id)), i = /* @__PURE__ */ new Map(), a = A(() => new Map(s(n).map(({ node: e }) => [e.id, e])), [n]);
	return /* @__PURE__ */ H(je, { children: [e.filter((e) => e.instance || e.prop !== "items").map((e) => {
		let t = a.get(e.id);
		if (!t) return null;
		let n = `${e.instance ? "instance:" : ""}${e.id}:${e.prop}`, r = i.get(n) ?? 0;
		return i.set(n, r + 1), Me(e.instance ? /* @__PURE__ */ V(pi, {
			node: t,
			slot: e
		}) : [
			"text",
			"cite",
			"caption"
		].includes(e.prop) ? t.type === "paragraph" && e.prop === "text" ? /* @__PURE__ */ V(ti, {
			node: t,
			prop: "text",
			tag: "span",
			placeholder: E("Write, or press “/” for blocks"),
			quiet: !0
		}) : /* @__PURE__ */ V(ti, {
			node: t,
			prop: e.prop,
			tag: "span",
			placeholder: e.element.dataset.cmsPlaceholder ?? E("Write something…")
		}) : /* @__PURE__ */ V(mi, {
			node: t,
			prop: e.prop
		}), e.element, `${n}:${r}`);
	}), [...r].map((t) => {
		let n = a.get(t);
		return n ? /* @__PURE__ */ V(ni, {
			node: n,
			renderItem: (n, r) => {
				let i = e.find((e) => e.id === t && e.prop === "items" && e.index === n);
				return i ? Me(r, i.element, `${t}:items:${n}`) : null;
			}
		}, t) : null;
	})] });
}), pi = ae(function({ node: e, slot: n }) {
	let { store: r, readOnly: i } = U(), a = G(r, (t) => t.focus?.id === e.id && t.focus.prop === `values.${n.prop}` ? t.focus : null), o = String((Object.prototype.hasOwnProperty.call(e.props.values ?? {}, n.prop) ? e.props.values[n.prop] : n.instance.value) ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
	return /* @__PURE__ */ V(on, {
		tag: "span",
		html: o,
		focus: a,
		plainText: !0,
		singleLine: n.instance.type === "text",
		disabled: i,
		placeholder: n.element.dataset.cmsPlaceholder ?? E("Write something…"),
		onFocus: () => r.select(e.id),
		onChange: (i, a) => r.updateProps(e.id, { values: {
			...t(r.get().nodes, e.id)?.props.values,
			[n.prop]: a.innerText
		} }, `instance:${e.id}:${n.prop}`),
		onKeyDown: (t, i) => {
			(t.key === "Escape" || t.key === "Enter" && n.instance.type === "text") && (t.preventDefault(), i.blur(), r.select(e.id, !0));
		}
	});
}), mi = ae(function({ node: e, prop: t }) {
	let { store: n, readOnly: r } = U(), i = G(n, (n) => n.focus?.id === e.id && n.focus.prop === t ? n.focus : null), a = String(e.props[t] ?? ""), o = t === "code" ? a.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>") : a;
	return /* @__PURE__ */ V(on, {
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
function hi({ doc: e, frame: n, scale: i }) {
	let s = Kr(), { store: c, types: u, allowed: d } = U(), [f, h] = M(null);
	if (le(() => {
		h(s ? Qt(e) : null);
	}, [s, e]), Jr(!!s, [document, e]), !s || !f || !t(c.get().nodes, s.id)) return null;
	let g = (e) => {
		let n = l(e, u), i = c.get().nodes, f = r(i, s.id);
		if (!f || !n.length) return;
		let h = f.parentId ? t(i, f.parentId) : null, g = n.every((e) => p(h, e.type, u, h ? [] : d)) ? f : o(i, s.id, n.map((e) => e.type), u, d);
		g && (Gr(null), c.commit(m(a(i, s.id), g.parentId, g.index, n)), Ar(c, n[0], Lr(Ir(c.get().nodes, u, () => !1))));
	}, _ = n.getBoundingClientRect(), { maxHeight: v, ...y } = qr({
		left: _.left + f.left * i,
		top: _.top + f.top * i,
		bottom: _.top + f.bottom * i
	});
	return Me(/* @__PURE__ */ V("div", {
		"data-cms-slash": !0,
		className: "cms-pop fixed z-overlay overflow-hidden !p-0",
		style: y,
		children: /* @__PURE__ */ V(xn, {
			types: [...u.values()],
			query: s.query,
			showSearch: !1,
			compact: !0,
			style: { maxHeight: v },
			chooseFirst: s.enter,
			keyboardDocument: e,
			onChoose: g,
			onClose: () => Gr(null),
			onNoMatch: () => {
				Gr(null);
			},
			allowed: (e) => !!o(c.get().nodes, s.id, e.name, u, d)
		})
	}), document.body);
}
function gi({ doc: e, content: t, onChange: n, readOnly: r }) {
	let i = [...e.querySelectorAll("[data-cms-entry-field=\"title\"]")];
	return /* @__PURE__ */ V(je, { children: i.map((i, a) => {
		let o = t.title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
		return Me(/* @__PURE__ */ V(on, {
			tag: "span",
			html: o,
			singleLine: !0,
			disabled: r,
			placeholder: E("Untitled"),
			onChange: (e, t) => n(t.textContent ?? ""),
			onKeyDown: (t, n) => {
				t.key === "Enter" && (t.preventDefault(), n.blur(), e.querySelector("[data-cms-editor-root] [contenteditable=\"true\"]")?.focus());
			}
		}), i, `title:${a}`);
	}) });
}
// admin/src/builder/controls.tsx
var _i = "w-[88px]", vi = "cms.inspector.collapsed";
function yi() {
	try {
		let e = JSON.parse(localStorage.getItem(vi) ?? "{}");
		return e && typeof e == "object" && !Array.isArray(e) ? Object.fromEntries(Object.entries(e).filter(([, e]) => typeof e == "boolean")) : {};
	} catch {
		return {};
	}
}
function bi({ title: e, children: t, open: n = !0, actions: r, empty: i, fields: a, remember: o = !0 }) {
	let [s, c] = M(() => !o || yi()[e] === void 0 ? n : !yi()[e]), l = (t) => {
		if (c(t), o) try {
			localStorage.setItem(vi, JSON.stringify({
				...yi(),
				[e]: !t
			}));
		} catch {}
	}, u = !!(i && r && !a);
	return /* @__PURE__ */ H("section", {
		"data-section": e,
		className: "min-w-0 border-b border-border last:border-b-0",
		children: [/* @__PURE__ */ H("header", {
			className: "group/section flex h-10 items-center gap-1 pl-4 pr-3",
			children: [u ? /* @__PURE__ */ V("span", {
				className: "min-w-0 flex-1 truncate text-xs font-semibold text-ink",
				children: e
			}) : /* @__PURE__ */ H(P, {
				variant: "ghost",
				onClick: () => l(!s),
				"aria-expanded": s,
				className: "!h-full min-w-0 flex-1 shrink !justify-start !gap-1.5 !rounded-none !bg-transparent !px-0 text-left !text-xs !font-semibold !text-ink focus-visible:!-outline-offset-2",
				children: [
					/* @__PURE__ */ V("span", {
						className: "min-w-0 truncate",
						children: e
					}),
					i === !1 && /* @__PURE__ */ V("span", {
						className: "size-1.5 shrink-0 rounded-full bg-focus",
						"aria-hidden": !0
					}),
					/* @__PURE__ */ V(I, {
						name: "chevron-down",
						size: 10,
						className: B("shrink-0 text-faint transition-[rotate,opacity] duration-fast", s ? "opacity-0 group-hover/section:opacity-100 group-focus-within/section:opacity-100" : "-rotate-90")
					})
				]
			}), r && /* @__PURE__ */ V("span", {
				className: "contents",
				onClickCapture: () => !s && l(!0),
				children: r
			})]
		}), s && !u && /* @__PURE__ */ V("div", {
			className: "space-y-1 px-4 pb-3",
			children: t
		})]
	});
}
function xi({ children: e, className: t }) {
	return /* @__PURE__ */ V("div", {
		"data-section": "content",
		className: B("space-y-1 border-b border-border px-4 py-3 last:border-b-0", t),
		children: e
	});
}
function Si({ title: e, action: t }) {
	return /* @__PURE__ */ H("div", {
		className: "flex h-7 items-center justify-between pt-1",
		children: [/* @__PURE__ */ V("span", {
			className: "text-xs text-muted",
			children: e
		}), t]
	});
}
function Ci({ field: e, children: t, htmlFor: n, className: r }) {
	let i = e.status, a = e.reset, o = t ?? e.label, s = B("flex min-h-7 min-w-0 shrink-0 items-center text-left text-xs", _i, i ? "text-ink" : "text-muted", r), c = /* @__PURE__ */ V("span", {
		className: B("min-w-0 py-0.5 leading-[1.25] [overflow-wrap:anywhere]", i && "-ml-1 rounded-xs px-1 box-decoration-clone", i === "own" ? "bg-focus-soft" : i === "inherited" && "bg-active"),
		children: o
	});
	return i === "own" && a ? /* @__PURE__ */ V(xe, {
		content: E("Reset {label}", { label: String(e.label ?? "") }),
		children: /* @__PURE__ */ V(P, {
			variant: "ghost",
			onClick: a,
			className: B(s, "!h-auto !justify-start !whitespace-normal !rounded-xs !bg-transparent !px-0 !text-xs !font-normal !text-ink"),
			children: c
		})
	}) : i === "inherited" ? /* @__PURE__ */ V(xe, {
		content: E("Inherited from a larger screen, another state or the component"),
		children: /* @__PURE__ */ V("label", {
			htmlFor: n,
			className: s,
			children: c
		})
	}) : /* @__PURE__ */ V("label", {
		htmlFor: n,
		className: s,
		title: e.instructions,
		children: c
	});
}
function wi(e) {
	if (e.stack === !0 || Ae.includes(e.type) && !e.component) return !0;
	if (e.type !== "select" || e.component || e.display !== "segmented") return !1;
	let t = Object.values(e.options ?? {}).map((e) => typeof e == "string" ? e : e && typeof e == "object" && "label" in e ? String(e.label ?? "") : "").filter(Boolean);
	return t.length > 3 || t.join(" ").length > 20;
}
var Ti = (e) => e === "xs" || e === void 0 ? "sm" : e;
function Z({ fields: e, values: t, onChange: n, disabled: r, context: i = {}, className: a, bare: o }) {
	N(C.fields.subscribe, C.fields.version);
	let s = ee();
	return /* @__PURE__ */ V("div", {
		className: B("min-w-0", a ?? "space-y-1"),
		children: e.filter((e) => Te(e, t)).map((e) => {
			let a = s?.fieldTypes.find((t) => t.key === e.type), c = C.fields.get(e.component ?? a?.component ?? e.type) ?? C.fields.get("json");
			if (!c) return null;
			let l = {
				...e,
				size: Ti(e.size),
				fit: !0,
				id: we(e, i.path)
			}, u = !o && wi(e), d = /* @__PURE__ */ V(c, {
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
				children: [!o && e.type !== "toggle" && /* @__PURE__ */ V(Ci, {
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
var Ei = "cms-input h-7 w-full min-w-0 rounded-sm px-2 text-sm placeholder:text-ghost";
function Di({ color: e, dark: t, className: n }) {
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
var Oi = ie(function({ className: e, children: t, ...n }, r) {
	return /* @__PURE__ */ V(P, {
		ref: r,
		variant: "ghost",
		icon: "plus",
		className: B("w-full !justify-start !gap-1.5 !px-1.5 !text-xs !font-normal !text-muted hover:!text-ink", e),
		...n,
		children: t
	});
});
function ki({ onClick: e, label: t = E("Add") }) {
	return /* @__PURE__ */ V(xe, {
		content: t,
		children: /* @__PURE__ */ V(L, {
			icon: "plus",
			label: t,
			title: void 0,
			size: "xs",
			onClick: e
		})
	});
}
function Ai({ onClick: e, label: t = E("Remove") }) {
	return /* @__PURE__ */ V(xe, {
		content: t,
		children: /* @__PURE__ */ V(L, {
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
var ji = (e) => e.startsWith("-") ? e : e.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`), Mi = (e) => e.startsWith("-") ? e : e.replace(/-([a-z])/g, (e, t) => t.toUpperCase()), Ni = (e) => e.replace(/^!|!$/g, "");
function Pi(e) {
	let t = e.trim();
	for (let e = 0; e < 3; e++) {
		let e = t.replace(/var\(--tw-[\w-]+,\s*((?:[^()]|\((?:[^()]|\([^()]*\))*\))+)\)/g, "$1").replace(/calc\((\d+) \/ (\d+) \* 100%\)/g, (e, t, n) => `${+(Number(t) / Number(n) * 100).toFixed(4)}%`).replace(/calc\((-?[\d.]+)([a-z%]*) \* -1\)/g, (e, t, n) => `${-Number(t)}${n}`);
		if (e === t) break;
		t = e;
	}
	return t;
}
var Fi = (e) => e?.match(/^[a-zA-Z-]+\((.*)\)$/)?.[1];
function Ii(e, t, n, r, i) {
	let a = [...n.variant ? [n.variant] : [], ...r], o = q(a), s = t.map((e) => {
		let { variants: t, utility: n } = K(e);
		return {
			raw: e,
			layer: q(t),
			utility: Ni(n)
		};
	}), c = e ? new it(e, t, n, r) : null, l = (e) => {
		let t = c?.find(ji(e));
		return t ? {
			value: Pi(t.value),
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
			let i = Object.fromEntries(Object.entries(n).map(([e, t]) => [ji(e), typeof t == "string" ? t.replace(/"/g, "'") : t])), a = "width" in i || "height" in i ? Li(e, t, o) : t;
			u(d(a).set(i), r ?? Object.keys(n).join(","));
		},
		own: () => e ? d(t).own().map(Mi) : [],
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
			let o = t, s = () => Ii(e, o, n, r, (e) => {
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
function Li(e, t, n) {
	return t.flatMap((t) => {
		let { variants: r, utility: i } = K(t);
		if (q(r) !== n || !/^-?size-/.test(Ni(i))) return [t];
		let a = ["w", "h"].map((e) => i.replace("size-", `${e}-`));
		return a.every((t) => e.valid(t)) ? a.map((e) => We(r, e)) : [t];
	});
}
function Ri(e, t, n, r) {
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
			let e = zi[String(+s.toFixed(2))];
			e && (u = a(`${n}${t}-${e}`));
		} else r === "px" && (o === "px" || o === "" && s === 0) || r === "deg" && (o === "deg" || o === "") ? u = l(s) : r === "ms" && (o === "ms" || o === "s") ? u = l(o === "s" ? s * 1e3 : s) : r === "percent" && o === "%" ? u = l(s) : r === "percent" && o === "" ? u = l(s * 100) : r === "number" && o === "" && (u = l(s));
		if (u) return u;
	}
	return e.make(t, i);
}
var zi = {
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
}, Bi = {
	"to top": "0deg",
	"to right": "90deg",
	"to bottom": "180deg",
	"to left": "270deg"
}, Vi = {
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
}, Hi = [
	"background-image",
	"--tw-gradient-from",
	"--tw-gradient-via",
	"--tw-gradient-to",
	"--tw-gradient-from-position",
	"--tw-gradient-via-position",
	"--tw-gradient-to-position"
];
function Ui(e, t) {
	let n = () => {
		let n = `${t.kind}-gradient(${[t.angle, ...t.stops.map((e) => `${e.color}${e.at ? ` ${e.at}` : ""}`)].filter(Boolean).join(", ")})`, r = e.make("bg", n);
		return [r && e.declarations(r)?.some((e) => e.property === "background-image") ? r : e.utilityFor("background-image", n)];
	};
	if (t.kind !== "linear" || t.stops.length < 2 || t.stops.length > 3) return n();
	let r = t.angle.trim().replace(/\s+/g, " "), i = /^(-?\d+)deg$/.exec(r), a = Vi[r] ? `bg-linear-to-${Vi[r]}` : i ? `${i[1].startsWith("-") ? "-" : ""}bg-linear-${i[1].replace("-", "")}` : null;
	if (!a || e.declarations(a) === null) return n();
	let o = t.stops.length === 3 ? [
		"from",
		"via",
		"to"
	] : ["from", "to"], s = [a];
	for (let [r, i] of t.stops.entries()) {
		let t = Ri(e, o[r], i.color, "number"), a = i.at ? e.make(o[r], i.at) : null;
		if (!t || i.at && !a) return n();
		s.push(t, ...a ? [a] : []);
	}
	return s;
}
function Wi(e) {
	let t = e("--tw-gradient-position"), n = e("--tw-gradient-from"), r = e("--tw-gradient-to");
	if (!t && !n && !r) return;
	let i = e("--tw-gradient-via"), a = (t, n) => {
		let r = e(`--tw-gradient-${n}-position`);
		return `${t ?? "transparent"}${r ? ` ${r}` : ""}`;
	}, o = (t ?? "to bottom").replace(/\s+in\s+[\w-]+(\s+\w+\s+hue)?$/, "");
	return `linear-gradient(${[
		Bi[o] ?? o,
		a(n, "from"),
		...i ? [a(i, "via")] : [],
		a(r, "to")
	].join(", ")})`;
}
function Gi(e) {
	return new Set(e.flatMap((e) => K(e).variants));
}
function Ki(e, t) {
	let n = q(t);
	return e.some((e) => q(K(e).variants) === n);
}
function qi(e, t) {
	return K(e).variants.length ? e : We(t, e);
}
function Ji(e, t, n) {
	let r = new Set(n), i = {
		site: [],
		utilities: []
	};
	for (let n of t) {
		let { utility: t } = K(n);
		r.has(Ni(t)) || e && !e.valid(n) ? i.site.push(n) : i.utilities.push(n);
	}
	return i;
}
var Yi = (e) => /^[^\s"<>`\u0000-\u001f\u007f]{1,200}$/.test(e), Xi = (e, t) => !Yi(t) || !!e && /[:[\]/()]/.test(t) && !e.valid(t), Zi = /* @__PURE__ */ new WeakMap();
function Qi(e) {
	let t = Zi.get(e);
	return t || Zi.set(e, t = e.ds.getClassList().map(([e]) => e)), t;
}
var $i = 40;
function ea(e, t, n, r) {
	let i = n.trim().toLowerCase(), a = t.filter((e) => !r.has(e) && e.toLowerCase().includes(i));
	if (!i) return a.slice(0, $i);
	let o = new Set(t), s = [], c = [];
	for (let t of Qi(e)) {
		if (o.has(t) || r.has(t)) continue;
		let e = t.indexOf(i);
		if (e === 0 ? s.push(t) : e > 0 && c.length < $i && c.push(t), s.length >= $i) break;
	}
	let l = n.trim(), u = [
		...a,
		...s.sort((e, t) => e.length - t.length),
		...c
	];
	return !l || r.has(l) || u.includes(l) || !Yi(l) || Xi(e, l) ? u.slice(0, $i) : e.valid(l) ? [l, ...u].slice(0, $i) : [...u.slice(0, 39), l];
}
function ta(e, t) {
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
function na(e) {
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
function ra(e) {
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
var ia = [
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
function aa(e, t) {
	let n = /^([\d.]+)rem$/.exec(e?.ds.resolveThemeValue("--spacing") ?? "");
	return {
		scale: n ? ia.map((e) => {
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
function oa() {
	return X().find;
}
function sa(e) {
	let t = X();
	return (n) => {
		let r = n.trim();
		return !e || !/^[a-z][a-z0-9-]*$/i.test(r) ? null : t.of(e).find((e) => e.name === r)?.ref ?? null;
	};
}
function ca({ token: e, alpha: t, className: n }) {
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
var la = (e) => B("h-6 min-w-0 rounded-xs px-1.5 text-2xs tabular-nums", e ? "bg-signal text-signal-ink" : "bg-sunken text-text hover:bg-hover");
function ua({ value: e, onPick: t, auto: n }) {
	let { engine: r } = Pt(), i = aa(r, X().of("spacing")), a = (t) => t === e || t === "0px" && e === "0", o = (e) => /* @__PURE__ */ V(z, {
		compact: !0,
		title: e.title,
		onClick: () => t(e.value),
		className: la(a(e.value)),
		children: e.label
	}, e.value);
	return /* @__PURE__ */ H("div", {
		className: "space-y-2",
		children: [i.scale.length > 0 && /* @__PURE__ */ H("div", { children: [/* @__PURE__ */ V("div", {
			className: "cms-label mb-1",
			children: E("Scale||series of steps")
		}), /* @__PURE__ */ V("div", {
			className: "grid grid-cols-6 gap-1",
			children: i.scale.map(o)
		})] }), (i.named.length > 0 || n) && /* @__PURE__ */ H("div", { children: [/* @__PURE__ */ V("div", {
			className: "cms-label mb-1",
			children: E("Theme")
		}), /* @__PURE__ */ H("div", {
			className: "flex flex-wrap gap-1",
			children: [i.named.map(o), n && /* @__PURE__ */ V(z, {
				compact: !0,
				onClick: () => t("auto"),
				className: la(e === "auto"),
				children: E("Auto")
			})]
		})] })]
	});
}
function da({ group: e, value: t, onPick: n, detach: r }) {
	let i = X(), a = i.of(e), o = i.find(t)?.token.variable ?? null;
	return e === "spacing" ? /* @__PURE__ */ V("div", {
		className: "p-2",
		children: /* @__PURE__ */ V(ua, {
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
				o === t.variable && /* @__PURE__ */ V(I, {
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
		children: [/* @__PURE__ */ V(I, {
			name: "unlink",
			size: 12
		}), E("Detach")]
	})] });
}
function fa({ group: e, value: t, onPick: n, active: r, className: i, trigger: a }) {
	let [o, s] = M(!1), c = X(), { engine: l } = Pt(), u = e;
	if (!l || u !== "spacing" && !c.of(u).length) return null;
	let d = (e) => {
		n(e), s(!1);
	};
	return /* @__PURE__ */ V(R, {
		open: o,
		onOpenChange: s,
		align: "end",
		className: "w-60 !p-1",
		trigger: a ?? /* @__PURE__ */ V(z, {
			compact: !0,
			className: B("size-5 shrink-0 place-items-center rounded-xs text-faint hover:bg-hover hover:text-ink", r || o ? "grid text-ink" : "hidden group-hover/value:grid group-focus-within/value:grid [@media(hover:none)]:grid", i),
			"aria-label": E("Theme Values"),
			title: E("Theme Values"),
			children: /* @__PURE__ */ V(I, {
				name: "symbol",
				size: 10
			})
		}),
		children: /* @__PURE__ */ V(da, {
			group: u,
			value: t,
			onPick: d,
			detach: () => d(c.find(t)?.token.value ?? null)
		})
	});
}
// admin/src/builder/fields/controls.tsx
function pa(e, t) {
	let n = (e) => Object.entries(e).every(([e, n]) => Array.isArray(n) ? n.includes(t[e]) : t[e] === n), r = e.if, i = e.unless;
	return (!r || n(r)) && !(i && Object.entries(i).every(([e, n]) => Array.isArray(n) ? n.includes(t[e] ?? null) : (t[e] ?? null) === n));
}
function ma({ field: e, ...t }) {
	let n = C.fields.get(e.component ?? e.type) ?? C.fields.get("json");
	return n ? /* @__PURE__ */ V("div", {
		className: B("min-w-0 flex-1", e.className),
		children: /* @__PURE__ */ V(n, {
			field: e,
			...t,
			context: t.context ?? {}
		})
	}) : null;
}
function ha({ className: e, children: t }) {
	return /* @__PURE__ */ V("div", {
		className: B("relative flex min-w-0 flex-1 items-center gap-1", e),
		children: t
	});
}
var ga = /^(-?\d*\.?\d+)([a-z%]*)$/i, _a = {
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
}, va = (e, t, n) => Math.min(n ?? Infinity, Math.max(t ?? -Infinity, e)), ya = (e) => Math.round(e * 1e3) / 1e3;
function ba(e) {
	return e.field.percent ? /* @__PURE__ */ V(xa, { ...e }) : /* @__PURE__ */ V(Ta, { ...e });
}
function xa({ field: e, value: t, onChange: n, ...r }) {
	let i = t == null || t === "" ? null : Number(t), a = (e) => typeof e == "number" ? Math.round(e * 100) : void 0, o = e.slider;
	return /* @__PURE__ */ V(Ta, {
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
function Sa(e, t) {
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
var Ca = {
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
function wa(e, t, n) {
	if (typeof CSS > "u") return !0;
	let r = e, i = t.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`);
	return /^-?[a-z]+(-[a-z]+)*$/.test(i) && CSS.supports(i, "inherit") ? CSS.supports(i, r) : (Ca[n] ?? Ca.length).some((e) => CSS.supports(e, r));
}
function Ta({ field: e, value: t, onChange: n, disabled: r, context: i }) {
	let a = oa(), o = sa(e.group), [s, c] = M(null), [l, u] = M(null), d = j(null), [f, p] = M(!1), m = t == null || t === "" ? void 0 : String(t), h = e.unit ?? "px", g = e.step ?? 1, _ = e.min, v = e.max, y = e.group, b = e.prefixIcon ? /* @__PURE__ */ V(I, {
		name: e.prefixIcon,
		size: 13
	}) : e.prefix, x = e.slider, S = e.menu, C = e.action, w = e.keywords ?? [], T = a(m), D = m?.match(ga), O = D ? D[2] || h : m ? "" : l ?? h, ee = h ? e.units ?? _a[h] ?? [h] : [], te = !m || !!D, ne = (e, t = O) => n(`${ya(va(e, _, v))}${t}`), re = (e) => {
		te && ne((D ? parseFloat(D[1]) : 0) + e);
	}, ie = (e, t) => {
		if (r || e.button !== 0 || document.activeElement === e.currentTarget || !te) return;
		e.preventDefault();
		let n = e.clientX, i = D ? parseFloat(D[1]) : 0, a = !1, o = (e) => {
			let t = e.clientX - n;
			!a && Math.abs(t) < 3 || (a = !0, document.body.style.cursor = "ew-resize", ne(i + Math.round(t / 2) * g * (e.shiftKey ? 10 : e.altKey ? .1 : 1)));
		}, s = () => {
			window.removeEventListener("pointermove", o), window.removeEventListener("pointerup", s), document.body.style.cursor = "", !a && t && d.current?.focus();
		};
		window.addEventListener("pointermove", o), window.addEventListener("pointerup", s);
	}, ae = (t) => t === "" ? null : o(t) || (/^-?\d*\.?\d+$/.test(t) ? O ? `${t}${O}` : t : w.includes(t) || wa(t, e.property ?? e.handle, h) ? t : void 0), oe = Sa(s ?? "", (e) => s === null || ae(e.trim()) !== void 0), se = () => {
		if (s === null) return;
		let e = s.trim();
		if (c(null), e === (D ? D[1] : m ?? "")) return;
		let t = ae(e);
		t !== void 0 && n(t);
	}, k = (e) => {
		D ? n(`${D[1]}${e}`) : m || u(e);
	};
	return /* @__PURE__ */ H(ha, { children: [
		x && /* @__PURE__ */ V(ma, {
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
			value: D ? parseFloat(D[1]) : null,
			onChange: (e) => n(e),
			disabled: r,
			context: i
		}),
		/* @__PURE__ */ H("div", {
			className: B("group/value cms-input flex h-7 min-w-0 flex-1 items-center rounded-sm", x && "!w-16 !flex-none"),
			title: e.title,
			"data-focus": f || void 0,
			"data-invalid": oe.shown || void 0,
			"data-disabled": r || void 0,
			onFocus: () => p(!0),
			onBlur: (e) => !e.currentTarget.contains(e.relatedTarget) && p(!1),
			children: [
				b !== void 0 && /* @__PURE__ */ V("span", {
					onPointerDown: (e) => ie(e, !0),
					className: "grid h-full w-6 shrink-0 cursor-ew-resize select-none place-items-center text-xs text-faint hover:text-ink",
					children: b
				}),
				T && s === null ? /* @__PURE__ */ V(fa, {
					group: y ?? T.token.group,
					value: m,
					onPick: n,
					trigger: /* @__PURE__ */ V(z, {
						compact: !0,
						onDoubleClick: () => c(m ?? ""),
						className: B("flex h-full min-w-0 flex-1 items-center pr-1 text-left", b === void 0 && "pl-1"),
						children: /* @__PURE__ */ V(ca, {
							token: T.token,
							alpha: T.alpha,
							className: "text-xs"
						})
					})
				}) : /* @__PURE__ */ V("input", {
					ref: d,
					id: we(e),
					value: s ?? (D ? D[1] : m ?? ""),
					placeholder: e.placeholder,
					disabled: r,
					autoComplete: "off",
					spellCheck: !1,
					onPointerDown: (e) => ie(e, !0),
					onChange: (e) => c(e.target.value),
					onFocus: (e) => e.target.select(),
					onBlur: se,
					"aria-invalid": oe.shown || void 0,
					onKeyDown: (e) => {
						e.key === "Enter" && (s !== null && ae(s.trim()) === void 0 ? oe.show() : e.target.blur()), e.key === "Escape" && (c(null), requestAnimationFrame(() => d.current?.blur())), (e.key === "ArrowUp" || e.key === "ArrowDown") && te && (e.preventDefault(), c(null), re((e.key === "ArrowUp" ? 1 : -1) * g * (e.shiftKey ? 10 : e.altKey ? .1 : 1)));
					},
					className: B("h-full min-w-0 flex-1 bg-transparent text-sm tabular-nums text-text outline-none placeholder:text-ghost disabled:text-faint", b === void 0 && "pl-2", te && !r && "cursor-ew-resize focus:cursor-text")
				}),
				(!T || s !== null) && /* @__PURE__ */ H("span", {
					className: "flex shrink-0 items-center gap-px pr-1",
					children: [
						y && /* @__PURE__ */ V(fa, {
							group: y,
							value: m,
							onPick: n
						}),
						O && ee.length > 0 && /* @__PURE__ */ V(de, {
							align: "end",
							trigger: /* @__PURE__ */ V(z, {
								compact: !0,
								disabled: r,
								className: "h-5 min-w-5 rounded-xs px-1 text-2xs text-faint hover:bg-hover hover:text-ink",
								"aria-label": E("Unit"),
								children: O
							}),
							items: [...ee.map((e) => ({
								label: e,
								checked: e === O,
								onSelect: () => k(e)
							})), ...w.length ? [{
								separator: !0,
								label: ""
							}, ...w.map((e) => ({
								label: e,
								checked: m === e,
								onSelect: () => n(e)
							}))] : []]
						}),
						!O && h && w.length > 0 && m && w.includes(m) && /* @__PURE__ */ V(de, {
							align: "end",
							trigger: /* @__PURE__ */ V(z, {
								compact: !0,
								className: "grid size-5 place-items-center rounded-xs text-faint hover:bg-hover hover:text-ink",
								"aria-label": E("Unit"),
								children: /* @__PURE__ */ V(I, {
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
		S && /* @__PURE__ */ V(de, {
			align: "end",
			trigger: /* @__PURE__ */ H(z, {
				compact: !0,
				className: "flex h-7 shrink-0 items-center gap-0.5 rounded-sm px-1.5 text-xs text-muted hover:bg-hover hover:text-ink",
				children: [S.label, /* @__PURE__ */ V(I, {
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
		C && /* @__PURE__ */ V(z, {
			compact: !0,
			onClick: () => n(C.value),
			className: "grid size-7 shrink-0 place-items-center rounded-sm text-muted hover:bg-hover hover:text-ink",
			title: C.label,
			"aria-label": C.label,
			children: /* @__PURE__ */ V(I, {
				name: C.icon,
				size: 14
			})
		})
	] });
}
// admin/src/builder/fields/composite.tsx
var Ea = {
	2: "grid grid-cols-2",
	3: "grid grid-cols-3",
	4: "grid grid-cols-4"
};
function Da({ field: e, value: t, onChange: n, disabled: r, context: i }) {
	let a = t ?? {}, o = e.link, [s, c] = M(!o || e.split === !0), l = (s ? e.fields ?? [] : [o]).filter((e) => pa(e, a)), u = s ? Ea[e.columns] : void 0;
	return /* @__PURE__ */ H(ha, { children: [/* @__PURE__ */ V("div", {
		className: B("min-w-0 flex-1 gap-1", u ?? "flex items-center"),
		children: l.map((e) => /* @__PURE__ */ V(ma, {
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
		title: s ? e.joinLabel ?? E("The same for all") : e.splitLabel ?? E("Each One"),
		children: /* @__PURE__ */ V(I, {
			name: s ? "square" : "radius",
			size: 14
		})
	})] });
}
function Oa({ field: e, value: t, onChange: n, disabled: r, context: i }) {
	let a = t ?? {}, o = e.key ?? {}, s = e.labels, c = e.items, l = (e, t) => {
		let r = (t ?? "").trim();
		o.lower && (r = r.toLowerCase()), o.strip && (r = r.replace(new RegExp(o.strip, "g"), "")), !r || r === e || r in a || o.allowed && !o.allowed.includes(r) || n(Object.fromEntries(Object.entries(a).map(([t, n]) => t === e ? [r, n] : [t, n])));
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
				}) : /* @__PURE__ */ V(ma, {
					field: {
						handle: `${e.handle}-${t}`,
						type: o.options ? "select" : "text",
						size: "sm",
						commit: "blur",
						label: E("Name"),
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
				/* @__PURE__ */ V(ma, {
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
				/* @__PURE__ */ V(Ai, { onClick: () => n(Object.fromEntries(Object.entries(a).filter(([e]) => e !== t))) })
			]
		}, t))
	});
}
function ka(e, t) {
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
var Aa = () => [
	{
		path: "entry.author.name",
		label: E("Author"),
		group: E("Page")
	},
	{
		path: "entry.title",
		label: E("Title"),
		group: E("Page")
	},
	{
		path: "entry.url",
		label: E("Link"),
		group: E("Page")
	},
	{
		path: "entry.date|date:F j, Y",
		label: E("Published Date"),
		group: E("Page")
	},
	{
		path: "entry.updated|date:F j, Y",
		label: E("Updated Date"),
		group: E("Page")
	},
	{
		path: "entry.parent.title",
		label: E("Parent Title"),
		group: E("Page")
	},
	{
		path: "entry.prev.url",
		label: E("Previous Page Link"),
		group: E("Page")
	},
	{
		path: "entry.prev.title",
		label: E("Previous Page Title"),
		group: E("Page")
	},
	{
		path: "entry.next.url",
		label: E("Next Page Link"),
		group: E("Page")
	},
	{
		path: "entry.next.title",
		label: E("Next Page Title"),
		group: E("Page")
	}
], ja = () => [
	{
		path: "site.name",
		label: E("Site Name"),
		group: E("Site")
	},
	{
		path: "site.description",
		label: E("Site Description"),
		group: E("Site")
	},
	{
		path: "site.url",
		label: E("Site URL"),
		group: E("Site")
	},
	{
		path: "© {site.year} {site.name}",
		label: E("Copyright Line"),
		group: E("Site")
	},
	{
		path: "page.uri",
		label: E("Current Path"),
		group: E("Site")
	},
	{
		path: "pagination.prev",
		label: E("Previous Page of a List"),
		group: E("Pagination")
	},
	{
		path: "pagination.next",
		label: E("Next Page of a List"),
		group: E("Pagination")
	},
	{
		path: "{pagination.current} / {pagination.total}",
		label: E("Page x of y"),
		group: E("Pagination")
	}
];
function Ma(t) {
	let { store: n, doc: r, catalog: i } = U(), a = O(), o = G(n, (n) => e(n.nodes, t.id)), s = D("entries/get", { id: r?.id ?? "" }, {
		enabled: r?.kind === "entry",
		staleTime: 6e4
	}), c = r?.kind === "template" ? r.collections?.length ? r.collections : a.collections.filter((e) => e.routable).map((e) => e.handle).slice(0, 1) : s.data ? [s.data.collection] : [], l = D("collections/get", { handle: c[0] ?? "" }, {
		enabled: !!c[0],
		staleTime: 3e5
	}), u = [];
	for (let e of [...o].reverse()) {
		if (e.type !== "repeat") continue;
		let t = e.props?.as || "item", n = i.sources?.find((t) => t.name === e.props?.source), r = E("{list} item ({name})", {
			list: n?.label ?? E("List"),
			name: t
		});
		for (let [e, i] of Object.entries(n?.item ?? {})) u.push({
			path: `${t}.${e}`,
			label: i,
			group: r
		});
		e.props?.source === "entries" && e.props?.collection && u.push({
			path: `${t}.excerpt`,
			label: E("Excerpt Field"),
			group: r
		}, {
			path: `${t}.cover`,
			label: E("Cover Image Field"),
			group: r
		}), e.props?.source === "list" && u.push({
			path: `{${t}}`,
			label: E("The Item Itself (Text)"),
			group: r
		}), u.push({
			path: "index",
			label: E("Position (1, 2, 3…)"),
			group: r
		}, {
			path: "first",
			label: E("Is First"),
			group: r
		}, {
			path: "last",
			label: E("Is Last"),
			group: r
		});
	}
	if (r?.kind === "component") for (let e of r.props ?? []) u.push({
		path: `props.${e.handle}`,
		label: e.label ?? e.handle,
		group: E("Component Properties")
	});
	u.push(...Aa());
	for (let e of l.data?.fields ?? []) e.type !== "blocks" && u.push({
		path: `entry.${e.handle}${e.type === "date" ? "|date:F j, Y" : ""}`,
		label: e.label,
		group: E("Page Fields")
	});
	u.push(...ja());
	for (let e of a.globals) u.push({
		path: `globals.${e.handle}.`,
		label: E("{name} (add a field handle)", { name: e.title }),
		group: E("Globals")
	});
	return u;
}
// admin/src/builder/content/ContentPanel.tsx
var Na = [
	"text",
	"textarea",
	"richtext",
	"markdown"
], Pa = (e, t) => !e.if || Object.entries(e.if).every(([e, n]) => {
	let r = t[e] ?? null;
	return Array.isArray(n) ? n.includes(r) : r === n;
}), Fa = [
	"aria-label",
	"title",
	"role",
	"lang",
	"rel"
], Ia = [
	"active",
	"open",
	"selected",
	"current"
];
function La(e, t) {
	let n = e.find((e) => !(e in t));
	if (n) return n;
	let r = 2;
	for (; `${e[0]}-${r}` in t;) r++;
	return `${e[0]}-${r}`;
}
function Ra(e) {
	let t = e.toLowerCase().replace(/[^a-z0-9-]/g, "");
	return (/^[a-z]/.test(t) ? t : `b${t}`).slice(0, 40);
}
function za({ field: e, value: t, bound: n, paths: r, onValue: i, onBind: a, extra: o }) {
	let s = e.type === "richtext" && e.inline && e.handle !== "text" && !e.component ? {
		...e,
		component: "blocks-inline-text"
	} : e, c = !n && Ae.includes(s.type) && !s.component, l = !n && wi(s), u = !n && s.type === "toggle", d = n ? {
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
	}, f = { [s.handle]: n ?? t }, p = (e, t) => n ? a(t) : i(t), m = c ? /* @__PURE__ */ V(F, {
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
	let h = /* @__PURE__ */ V(xe, {
		content: E(n ? "Disconnect from Data" : "Connect to Data"),
		children: /* @__PURE__ */ V(L, {
			icon: "database",
			size: "xs",
			label: E(n ? "Disconnect from Data" : "Connect to Data"),
			title: void 0,
			onClick: () => a(n ? null : r[0]?.path ?? "entry.title"),
			className: B("overflow-hidden", n ? "!text-ink" : "!w-0 !text-faint hover:!text-ink focus-visible:!w-6 group-hover/prop:!w-6 [@media(hover:none)]:!w-6")
		})
	}), g = /* @__PURE__ */ H("span", {
		className: B("flex min-h-7 min-w-0 shrink-0 items-center gap-0.5", !l && "w-[88px]"),
		children: [/* @__PURE__ */ V("label", {
			htmlFor: we(s),
			className: B("min-w-0 flex-1 py-0.5 text-xs leading-[1.25] [overflow-wrap:anywhere]", n ? "text-ink" : "text-muted"),
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
function Ba({ node: e }) {
	let { store: t, types: n } = U(), r = n.get(e.type), i = Ma(e), a = an().filter((t) => t.id !== (e.anchor ?? e.props?.anchor)), o = e.bind ?? {}, s = {
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
	].includes(e.handle))), f = d.some((e) => e.component === "link") && d.some((e) => e.handle === "new_tab"), p = d.filter((e) => !(f && e.handle === "new_tab") && Pa(e, s)), m = p.filter((e) => !e.advanced), h = p.filter((e) => e.advanced), g = (t) => /* @__PURE__ */ V(za, {
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
	return !r && e.type !== "component" ? /* @__PURE__ */ H(xi, { children: [/* @__PURE__ */ V(me, {
		title: E("Its plugin is off"),
		children: E("This block is kept as it is and shows again when its plugin is turned on.")
	}), Object.keys(e.props ?? {}).length > 0 && /* @__PURE__ */ V("pre", {
		"aria-label": E("Settings"),
		className: "m-0 mt-3 overflow-x-auto rounded-md bg-sunken p-3 font-mono text-xs text-muted",
		children: JSON.stringify(e.props, null, 2)
	})] }) : /* @__PURE__ */ H("div", { children: [
		e.type === "component" ? /* @__PURE__ */ V(Va, {
			node: e,
			paths: i,
			setBind: c,
			anchors: a
		}) : _ ? /* @__PURE__ */ V(Ha, { node: e }) : m.length > 0 && /* @__PURE__ */ V(xi, { children: m.map(g) }),
		/* @__PURE__ */ V(bi, {
			title: E("Visibility"),
			open: !!(o.visible || o.hidden || e.hidden),
			empty: !o.visible && !o.hidden && !e.hidden,
			children: /* @__PURE__ */ V(Z, {
				fields: [
					{
						handle: "shown",
						type: "toggle",
						size: "sm",
						label: E("Show on the Site")
					},
					{
						handle: "visible",
						type: "text",
						component: "blocks-bind",
						label: E("Only If"),
						paths: i,
						placeholder: E("Always"),
						status: o.visible ? "own" : void 0,
						reset: () => c("visible", null)
					},
					{
						handle: "hidden",
						type: "text",
						component: "blocks-bind",
						label: E("Hide If"),
						paths: i,
						placeholder: E("Never"),
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
		/* @__PURE__ */ H(bi, {
			title: E("Advanced"),
			open: !1,
			remember: !1,
			empty: !e.anchor && !e.attrs && !(e.type === "component" && e.class) && !e.persist && !Object.keys(o).some((e) => e.startsWith("state:")) && !h.some((t) => e.props?.[t.handle] !== void 0 && e.props?.[t.handle] !== t.default),
			children: [
				_ ? /* @__PURE__ */ V(Ua, { node: e }) : h.map(g),
				/* @__PURE__ */ V(Z, {
					fields: [
						{
							handle: "label",
							type: "text",
							size: "sm",
							commit: "blur",
							label: E("Layer Name"),
							placeholder: r?.title
						},
						...h.some((e) => e.handle === "anchor") && !e.anchor ? [] : [{
							handle: "anchor",
							type: "text",
							size: "sm",
							commit: "blur",
							label: E("Anchor"),
							placeholder: E("None"),
							mono: !0
						}],
						...e.type === "component" ? [{
							handle: "class",
							type: "text",
							size: "sm",
							commit: "blur",
							label: E("Classes"),
							mono: !0
						}] : [],
						...v("site.code") ? [{
							handle: "persist",
							type: "toggle",
							size: "sm",
							label: E("Keep Across Pages")
						}] : []
					],
					values: {
						label: e.label,
						anchor: e.anchor,
						class: e.class,
						persist: !!e.persist
					},
					onChange: (n, r) => {
						if (n === "persist") return t.updateNode(e.id, { persist: r ? e.persist ?? Ra(e.id) : void 0 });
						let i = String(r ?? "");
						t.updateNode(e.id, { [n]: (n === "anchor" ? i.toLowerCase().replace(/[^a-z0-9-]/g, "") : i) || void 0 });
					}
				}),
				/* @__PURE__ */ V(Si, {
					title: E("Attributes"),
					action: /* @__PURE__ */ V(ki, {
						label: E("Add Attribute"),
						onClick: () => t.updateNode(e.id, { attrs: {
							...e.attrs ?? {},
							[La(Fa, e.attrs ?? {})]: ""
						} })
					})
				}),
				e.attrs && Object.keys(e.attrs).length > 0 && /* @__PURE__ */ V(Z, {
					bare: !0,
					fields: [{
						handle: "attrs",
						type: "json",
						component: "blocks-pairs",
						className: "items-start",
						label: E("Attributes"),
						key: { lower: !0 },
						item: {
							handle: "value",
							type: "text",
							size: "sm",
							commit: "blur",
							label: E("Value")
						},
						items: Object.fromEntries(Object.keys(e.attrs ?? {}).filter((e) => o[`attr:${e}`]).map((e) => [e, {
							handle: "bind",
							type: "text",
							component: "blocks-bind",
							label: E("Data"),
							paths: i
						}]))
					}],
					values: { attrs: Object.fromEntries(Object.entries(e.attrs ?? {}).map(([e, t]) => [e, o[`attr:${e}`] ?? t])) },
					onChange: (n, r) => {
						let i = e.attrs ?? {}, a = ka(Object.fromEntries(Object.entries(i).map(([e, t]) => [e, o[`attr:${e}`] ?? t])), r);
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
				/* @__PURE__ */ V(Si, {
					title: E("States from Data"),
					action: /* @__PURE__ */ V(ki, {
						label: E("Add State from Data"),
						onClick: () => c(`state:${La(Ia, u)}`, i[0]?.path ?? "item.active")
					})
				}),
				Object.keys(u).length > 0 && /* @__PURE__ */ V(Z, {
					bare: !0,
					fields: [{
						handle: "states",
						type: "json",
						component: "blocks-pairs",
						className: "items-start",
						label: E("States from Data"),
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
							label: E("Data"),
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
function Va({ node: e, paths: t, setBind: n, anchors: i }) {
	let { store: o } = U(), s = D("components/list", { working: !0 }, { staleTime: 3e4 }), c = s.data?.find((t) => t.handle === e.props?.ref), l = e.props?.values ?? {}, d = e.bind ?? {};
	return /* @__PURE__ */ H(xi, { children: [
		/* @__PURE__ */ V(Z, {
			fields: [{
				handle: "ref",
				type: "select",
				size: "sm",
				label: E("Component"),
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
		(c?.props ?? []).map((r) => /* @__PURE__ */ V(za, {
			field: {
				...r,
				placeholder: r.placeholder ?? (Na.includes(r.type) ? r.label : void 0)
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
		/* @__PURE__ */ H("div", {
			className: "-ml-2 flex gap-1 pt-1",
			children: [c?.id && /* @__PURE__ */ V(P, {
				size: "sm",
				variant: "ghost",
				icon: "edit",
				onClick: () => x(`/content/components/${c.id}`),
				children: E("Edit Component")
			}), /* @__PURE__ */ V(P, {
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
				children: E("Detach")
			})]
		})
	] });
}
function Ha({ node: e }) {
	let { store: t, catalog: n } = U(), r = n.sources?.find((t) => t.name === e.props?.source), i = (n, r) => t.updateProps(e.id, { [n]: r }, `repeat:${e.id}:${n}`);
	return /* @__PURE__ */ H(xi, { children: [
		/* @__PURE__ */ V(Z, {
			fields: [{
				handle: "source",
				type: "select",
				size: "sm",
				label: E("List"),
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
				label: E("When Empty"),
				placeholder: E("Show Nothing")
			}],
			values: { empty: e.props?.empty },
			onChange: (e, t) => i(e, t || void 0)
		})
	] });
}
function Ua({ node: e }) {
	let { store: t } = U(), n = (n, r) => t.updateProps(e.id, { [n]: r }, `repeat:${e.id}:${n}`);
	return /* @__PURE__ */ V(Z, {
		fields: [{
			handle: "tag",
			type: "select",
			size: "sm",
			label: E("HTML Tag"),
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
			label: E("Item Name"),
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
function Wa(e) {
	let { store: t } = U(), { engine: n, breakpoints: r } = Pt(), i = G(t, (e) => e.device), a = G(t, (e) => e.canvasWidth), o = G(t, (e) => e.state), s = A(() => Ot(i, a, r), [
		i,
		a,
		r
	]);
	return A(() => Ii(n, Ge(e.class), s, o, (n, r) => t.updateNode(e.id, { class: n.join(" ") || void 0 }, `style:${e.id}:${r ?? ""}`)), [
		n,
		e.class,
		e.id,
		s,
		o,
		t
	]);
}
// admin/src/builder/css.ts
function Ga(e) {
	let t = [], n = 0, r = "";
	for (let i of e.trim()) i === "(" && n++, i === ")" && n--, /\s/.test(i) && n === 0 ? (r && t.push(r), r = "") : r += i;
	return r && t.push(r), t;
}
function Ka(e) {
	let t = [], n = 0, r = "";
	for (let i of e) i === "(" && n++, i === ")" && n--, i === "," && n === 0 ? (t.push(r.trim()), r = "") : r += i;
	return r.trim() && t.push(r.trim()), t;
}
function qa(e) {
	if (e === void 0 || e === "") return null;
	let t = Ga(String(e));
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
function Ja(e, t) {
	let n = t.map((t) => e.status(t));
	return n.includes("own") ? "own" : n.includes("inherited") ? "inherited" : void 0;
}
function Q({ s: e, fields: t, bare: n }) {
	let r = t.filter(Boolean), i = {}, a = r.map(({ get: t, set: n, keys: r, markers: a, ...o }) => {
		let s = o.fields, c = a ?? r ?? (s ? s.map((e) => e.handle) : [o.handle]);
		return i[o.handle] = t ? t() : s ? Object.fromEntries(c.map((t) => [t, e.value(t)])) : e.value(o.handle), {
			status: Ja(e, c),
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
			let o = Xa(i[t] ?? {}, n);
			Object.keys(o).length && e.write(o);
		},
		disabled: !e.engine
	});
}
var Ya = (e) => e === "none" ? void 0 : e;
function Xa(e, t) {
	return Object.fromEntries(Object.entries(t ?? {}).filter(([t, n]) => n !== e[t]));
}
// admin/src/builder/design/Border.tsx
var Za = [
	"borderTopLeftRadius",
	"borderTopRightRadius",
	"borderBottomRightRadius",
	"borderBottomLeftRadius"
], Qa = {
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
}, $a = "--tw-border-style", eo = "--tw-outline-style", to = "--tw-ring-shadow", no = () => [
	{
		value: "solid",
		label: E("Solid")
	},
	{
		value: "dashed",
		label: E("Dashed")
	},
	{
		value: "dotted",
		label: E("Dotted")
	},
	{
		value: "double",
		label: E("Double")
	},
	{
		value: "none",
		label: E("None")
	}
], ro = (e) => e?.match(/0 0 0 calc\(([\d.]+px) \+/)?.[1];
function io({ s: e }) {
	let t = Object.keys(Qa), [n, r] = M(() => t.find((t) => t !== "all" && e.value(Qa[t].width)) ?? "all"), i = Qa[n], a = {
		width: e.value(i.width),
		style: e.value($a),
		color: e.value(i.color)
	}, o = Za.map((t) => e.value(t)), s = (t) => e.value(Za[t]) ?? qa(e.value("borderRadius"))?.[t], c = {
		width: e.value("outlineWidth"),
		style: e.value(eo),
		color: e.value("outlineColor")
	}, l = {
		width: ro(e.value(to)),
		color: e.value("--tw-ring-color")
	}, u = t.some((t) => e.value(Qa[t].width) || e.value(Qa[t].color)) || a.style || e.value("borderRadius") || o.some(Boolean) || c.width || c.style || l.width, d = (t) => Ja(e, [Qa[t].width, Qa[t].color]), f = (t, n, r) => n && e.engine ? Ri(e.engine, t, n, r) : null, p = (e, t, n) => ({
		value: e,
		icon: t,
		title: d(e) ? `${n} · ${d(e) === "own" ? E("set") : E("inherited")}` : n
	});
	return /* @__PURE__ */ H(bi, {
		title: E("Border"),
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
					label: E("Sides"),
					keys: [],
					get: () => n,
					set: (e) => e && r(e),
					options: [
						p("all", "b-side-all", E("All Sides")),
						p("top", "b-side-top", E("Top")),
						p("right", "b-side-right", E("Right")),
						p("bottom", "b-side-bottom", E("Bottom")),
						p("left", "b-side-left", E("Left"))
					]
				},
				{
					handle: "line",
					type: "group",
					component: "blocks-group",
					label: E("Width"),
					markers: [i.width, $a],
					get: () => ({
						width: a.width,
						style: a.style
					}),
					set: (t) => {
						let n = Xa({
							width: a.width,
							style: a.style
						}, t);
						"width" in n ? e.swap(i.width, f(i.root, n.width, "px")) : "style" in n && e.swap($a, n.style ? `border-${n.style}` : null);
					},
					fields: [{
						handle: "width",
						type: "text",
						component: "blocks-value",
						label: E("Width"),
						placeholder: "0",
						min: 0,
						prefixIcon: "square"
					}, {
						handle: "style",
						type: "select",
						size: "sm",
						label: E("Style"),
						options: no(),
						placeholder: E("Solid")
					}]
				},
				{
					handle: "lineColor",
					type: "color",
					component: "blocks-color",
					label: E("Color"),
					placeholder: E("Text Color"),
					markers: [i.color],
					get: () => a.color,
					set: (t) => e.swap(i.color, f(i.root, t, "number"))
				},
				{
					handle: "radius",
					type: "group",
					component: "blocks-group",
					label: E("Radius"),
					status: e.status("borderRadius") === "own" || Za.some((t) => e.status(t) === "own") ? "own" : Ya(e.status("borderRadius")),
					keys: ["borderRadius", ...Za],
					columns: 2,
					split: o.some(Boolean),
					splitLabel: E("Each Corner"),
					joinLabel: E("Same radius for every corner"),
					link: {
						handle: "borderRadius",
						type: "text",
						component: "blocks-value",
						label: E("Radius"),
						group: "radius",
						prefixIcon: "frame",
						placeholder: "0",
						min: 0
					},
					fields: Za.map((e, t) => ({
						handle: e,
						type: "text",
						component: "blocks-value",
						label: [
							E("Top Left"),
							E("Top Right"),
							E("Bottom Right"),
							E("Bottom Left")
						][t],
						title: [
							E("Top Left"),
							E("Top Right"),
							E("Bottom Right"),
							E("Bottom Left")
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
						...Object.fromEntries(Za.map((e, t) => [e, s(t)]))
					}),
					set: (t) => {
						if (t.borderRadius !== e.value("borderRadius")) return e.set("borderRadius", t.borderRadius);
						e.write({
							borderRadius: null,
							...Object.fromEntries(Za.map((e) => [e, t[e] ?? null]))
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
						label: E("Outline"),
						markers: ["outline-width", eo],
						get: () => ({
							width: c.width,
							style: c.style
						}),
						set: (t) => {
							let n = Xa({
								width: c.width,
								style: c.style
							}, t);
							"width" in n ? e.swap("outline-width", f("outline", n.width, "px")) : "style" in n && e.swap(eo, n.style ? n.style === "solid" ? "outline-solid" : `outline-${n.style}` : null);
						},
						fields: [{
							handle: "width",
							type: "text",
							component: "blocks-value",
							label: E("Width"),
							placeholder: "0",
							min: 0,
							prefixIcon: "selection"
						}, {
							handle: "style",
							type: "select",
							size: "sm",
							label: E("Style"),
							options: no(),
							placeholder: E("Solid")
						}]
					},
					c.width || c.style ? {
						handle: "outlineColor",
						type: "color",
						component: "blocks-color",
						label: E("Outline Color"),
						placeholder: E("Text Color"),
						markers: ["outline-color"],
						get: () => c.color,
						set: (t) => e.swap("outline-color", f("outline", t, "number"))
					} : null,
					c.width || c.style || e.value("outlineOffset") ? {
						handle: "outlineOffset",
						type: "text",
						component: "blocks-value",
						label: E("Offset"),
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
						label: E("Ring"),
						placeholder: "0",
						min: 0,
						prefixIcon: "circle",
						markers: [to],
						get: () => l.width,
						set: (t) => e.swap(to, f("ring", t, "px"))
					},
					l.width ? {
						handle: "ringColor",
						type: "color",
						component: "blocks-color",
						label: E("Ring Color"),
						placeholder: E("Text Color"),
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
var ao = [
	{
		name: "blur",
		label: () => E("Blur"),
		unit: "px",
		initial: "8px",
		step: 1,
		min: 0,
		icon: "shadow"
	},
	{
		name: "brightness",
		label: () => E("Brightness"),
		unit: "%",
		initial: "100%",
		step: 5,
		min: 0,
		icon: "sun"
	},
	{
		name: "contrast",
		label: () => E("Contrast"),
		unit: "%",
		initial: "100%",
		step: 5,
		min: 0,
		icon: "opacity"
	},
	{
		name: "saturate",
		label: () => E("Saturation"),
		unit: "%",
		initial: "100%",
		step: 5,
		min: 0,
		icon: "drop-half"
	},
	{
		name: "grayscale",
		label: () => E("Grayscale"),
		unit: "%",
		initial: "100%",
		step: 5,
		min: 0,
		max: 100,
		icon: "opacity"
	},
	{
		name: "hue-rotate",
		label: () => E("Hue"),
		unit: "deg",
		initial: "90deg",
		step: 1,
		icon: "refresh"
	},
	{
		name: "invert",
		label: () => E("Invert"),
		unit: "%",
		initial: "100%",
		step: 5,
		min: 0,
		max: 100,
		icon: "opacity"
	},
	{
		name: "sepia",
		label: () => E("Sepia"),
		unit: "%",
		initial: "100%",
		step: 5,
		min: 0,
		max: 100,
		icon: "theme"
	}
];
function oo(e) {
	return !e || e === "none" ? [] : Ga(e).map((e) => {
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
var so = (e) => e.length ? e.map((e) => ao.some((t) => t.name === e.name) || e.value ? `${e.name}(${e.value})` : e.name).join(" ") : null;
function co({ field: e, value: t, onChange: n, context: r, disabled: i }) {
	let a = oo(t), o = ao.filter((e) => !a.some((t) => t.name === e.name)), s = (e) => n(so(e));
	return /* @__PURE__ */ H("div", {
		className: "min-w-0 flex-1",
		children: [/* @__PURE__ */ H("div", {
			className: "flex h-7 items-center gap-2",
			children: [
				/* @__PURE__ */ V(Ci, {
					field: e,
					className: a.length ? "!w-auto" : void 0
				}),
				/* @__PURE__ */ V("span", { className: "min-w-0 flex-1" }),
				o.length > 0 && /* @__PURE__ */ V(de, {
					align: "end",
					trigger: /* @__PURE__ */ V(z, {
						compact: !0,
						disabled: i,
						className: "grid size-6 shrink-0 place-items-center rounded-sm text-muted hover:bg-hover hover:text-ink",
						"aria-label": E("Add a Filter"),
						title: E("Add a Filter"),
						children: /* @__PURE__ */ V(I, {
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
				let o = ao.find((e) => e.name === t.name), c = o ? {
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
							children: [/* @__PURE__ */ V(I, {
								name: o?.icon ?? "faders",
								size: 13,
								className: "shrink-0 text-faint"
							}), o?.label() ?? t.name]
						}),
						/* @__PURE__ */ V(ma, {
							field: c,
							value: o?.unit === "%" && /^[\d.]+$/.test(t.value) ? `${Math.round(parseFloat(t.value) * 1e3) / 10}%` : t.value || null,
							onChange: (e) => s(a.map((t, r) => r === n ? {
								...t,
								value: String(e ?? o?.initial ?? "")
							} : t)),
							disabled: i,
							context: r
						}),
						/* @__PURE__ */ V(Ai, {
							label: E("Remove Filter"),
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
}), lo = (e, t = {}) => ({
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
}), uo = (e, t = {}) => ({
	label: e,
	type: "text",
	component: "blocks-value",
	unit: "",
	placeholder: "0",
	...t
}), fo = (e) => ({
	label: e,
	type: "color",
	component: "blocks-color",
	placeholder: E("None")
}), po = (e, t = "") => ({
	label: e,
	type: "text",
	size: "sm",
	commit: "blur",
	mono: !0,
	placeholder: t
}), mo = [
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
function ho() {
	let e = (e, t) => Object.fromEntries(Object.entries(t).map(([t, n]) => [t, {
		group: e,
		field: n
	}]));
	return {
		...e("layout", {
			alignContent: $(E("Align Content"), [
				"normal",
				"start",
				"center",
				"end",
				"space-between",
				"space-around",
				"space-evenly",
				"stretch"
			]),
			placeItems: po(E("Place Items"), "center"),
			placeContent: po(E("Place Content"), "center"),
			gridTemplateAreas: po(E("Grid Areas"), "'a b' 'c c'"),
			gridAutoColumns: po(E("Auto Columns"), "auto"),
			gridAutoRows: po(E("Auto Rows"), "auto"),
			columns: uo(E("Columns"), {
				placeholder: E("Auto"),
				min: 1
			}),
			columnRule: po(E("Column Rule"), "1px solid"),
			boxSizing: $(E("Box Sizing"), ["border-box", "content-box"]),
			float: $(E("Float||CSS property"), [
				"none",
				"left",
				"right"
			]),
			clear: $(E("Clear||CSS property"), [
				"none",
				"left",
				"right",
				"both"
			]),
			containerType: $(E("Container Type"), [
				"normal",
				"inline-size",
				"size"
			])
		}),
		...e("item", {
			justifySelf: $(E("Justify Self"), [
				"auto",
				"start",
				"center",
				"end",
				"stretch"
			]),
			placeSelf: po(E("Place Self"), "center"),
			gridArea: po(E("Grid Area"), "a"),
			flexGrow: uo(E("Flex Grow"), { min: 0 }),
			flexShrink: uo(E("Flex Shrink"), {
				placeholder: "1",
				min: 0
			}),
			flexBasis: lo(E("Flex Basis"), { placeholder: E("Auto") })
		}),
		...e("position", { inset: lo(E("Inset"), { placeholder: E("Auto") }) }),
		...e("size", {
			overflowX: $(E("Overflow X"), [
				"visible",
				"hidden",
				"clip",
				"scroll",
				"auto"
			]),
			overflowY: $(E("Overflow Y"), [
				"visible",
				"hidden",
				"clip",
				"scroll",
				"auto"
			]),
			overscrollBehavior: $(E("Overscroll"), [
				"auto",
				"contain",
				"none"
			]),
			scrollSnapType: $(E("Snap Type"), [
				"none",
				"x mandatory",
				"x proximity",
				"y mandatory",
				"y proximity",
				"both mandatory"
			]),
			scrollSnapAlign: $(E("Snap Align"), [
				"none",
				"start",
				"center",
				"end"
			]),
			scrollMarginTop: lo(E("Scroll Margin")),
			scrollPadding: lo(E("Scroll Padding")),
			scrollbarWidth: $(E("Scrollbar"), [
				"auto",
				"thin",
				"none"
			])
		}),
		...e("typography", {
			textDecorationColor: fo(E("Decoration Color")),
			textDecorationThickness: lo(E("Line Thickness"), { placeholder: E("Auto") }),
			textUnderlineOffset: lo(E("Underline Offset"), {
				unit: "em",
				units: ["em", "px"],
				step: .05,
				placeholder: E("Auto")
			}),
			whiteSpace: $(E("White Space"), [
				"normal",
				"nowrap",
				"pre",
				"pre-wrap",
				"pre-line",
				"break-spaces"
			]),
			wordBreak: $(E("Word Break"), [
				"normal",
				"break-all",
				"keep-all",
				"break-word"
			]),
			overflowWrap: $(E("Overflow Wrap"), [
				"normal",
				"anywhere",
				"break-word"
			]),
			hyphens: $(E("Hyphens"), [
				"manual",
				"auto",
				"none"
			]),
			textIndent: lo(E("Indent"), {
				unit: "em",
				units: [
					"em",
					"px",
					"rem"
				]
			}),
			textOverflow: $(E("Text Overflow"), ["clip", "ellipsis"]),
			fontVariantNumeric: $(E("Numbers"), [
				"normal",
				"tabular-nums",
				"proportional-nums",
				"lining-nums",
				"oldstyle-nums",
				"slashed-zero"
			]),
			fontFeatureSettings: po(E("Font Features"), "'ss01'"),
			fontVariationSettings: po(E("Font Variations"), "'wght' 500"),
			listStyleType: $(E("List Style"), [
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
			verticalAlign: $(E("Vertical Align"), [
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
			background: po(E("Background"), "none"),
			backgroundBlendMode: $(E("Blend Mode"), mo)
		}),
		...e("effects", {
			userSelect: $(E("User Select"), [
				"auto",
				"none",
				"text",
				"all"
			]),
			visibility: $(E("Visibility"), [
				"visible",
				"hidden",
				"collapse"
			]),
			maskImage: po(E("Mask Image"), "linear-gradient(black, transparent)"),
			accentColor: fo(E("Accent Color")),
			fill: fo(E("Fill")),
			stroke: fo(E("Stroke")),
			strokeWidth: lo(E("Stroke Width")),
			content: po(E("Content"), "''")
		}),
		...e("transform", {
			perspectiveOrigin: po(E("Vanishing Point"), "center"),
			transformStyle: $(E("Transform Style"), ["flat", "preserve-3d"]),
			backfaceVisibility: $(E("Backface"), ["visible", "hidden"])
		}),
		...e("transition", { willChange: po(E("Will Change"), "auto") })
	};
}
function go(e, t = ho()) {
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
var _o = (e) => /^--[\w-]+$/.test(e) || /^-?[a-z]+(-[a-z]+)*$/.test(e) && typeof CSS < "u" && CSS.supports(e, "inherit");
function vo({ properties: e, labels: t = {}, onPick: n, label: r = E("Add a Property"), custom: i, children: a }) {
	let [o, s] = M(!1), [c, l] = M(""), [u, d] = M(0), f = ho(), p = c.trim().toLowerCase(), m = e.map((e) => ({
		property: e,
		label: t[e] ?? String(go(e, f).label)
	})).filter((e) => !p || e.label.toLowerCase().includes(p) || e.property.toLowerCase().includes(p.replace(/[\s-]/g, ""))), h = p.replace(/\s+/g, "-"), g = i && _o(h) && !m.some((e) => e.property.toLowerCase() === h.replace(/-/g, "")) ? [...m, {
		property: h,
		label: h
	}] : m, _ = (e) => {
		e && (s(!1), n(e));
	};
	return e.length === 0 && !i ? null : /* @__PURE__ */ H(R, {
		open: o,
		onOpenChange: (e) => {
			s(e), l(""), d(0);
		},
		align: "end",
		className: "flex w-60 flex-col overflow-hidden !p-0",
		trigger: a ?? /* @__PURE__ */ V(L, {
			icon: "plus",
			size: "xs",
			label: r
		}),
		children: [/* @__PURE__ */ H("div", {
			className: "flex h-9 shrink-0 items-center gap-2 border-b border-border px-3",
			children: [/* @__PURE__ */ V(I, {
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
				placeholder: E("Search"),
				"aria-label": E("Search"),
				className: "h-full min-w-0 flex-1 bg-transparent text-sm text-text outline-none"
			})]
		}), /* @__PURE__ */ H("div", {
			role: "listbox",
			"aria-label": r,
			className: "max-h-64 overflow-y-auto overscroll-contain p-1",
			children: [g.length === 0 && /* @__PURE__ */ V("p", {
				className: "m-0 px-2 py-3 text-sm text-muted",
				children: E("No matches")
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
var yo = (e, t = ho()) => [...e].sort((e, n) => String(go(e, t).label).localeCompare(String(go(n, t).label)));
function bo({ s: e, group: t, title: n, open: r, empty: i, children: a }) {
	let [o, s] = M(null), c = ho(), l = Object.keys(c).filter((e) => c[e].group === t), u = l.filter((t) => e.value(t) !== void 0 || t === o);
	return /* @__PURE__ */ H(bi, {
		title: n,
		open: r,
		empty: i && u.length === 0,
		fields: !0,
		actions: /* @__PURE__ */ V(vo, {
			properties: yo(l.filter((e) => !u.includes(e)), c),
			onPick: s
		}),
		children: [a, u.length > 0 && /* @__PURE__ */ V(Q, {
			s: e,
			fields: u.map((t) => ({
				...go(t, c),
				set: (n) => {
					t === o && s(null), e.set(t, n);
				}
			}))
		})]
	});
}
var xo = (e) => e.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`);
function So({ s: e }) {
	let [t, n] = M(null), r = ho(), i = /* @__PURE__ */ new Set([
		...Object.keys(r).map(xo),
		"clip-path",
		"-webkit-text-stroke"
	]), a = [...new Set(e.classes.flatMap((e) => K(e).utility.match(/^!?\[([\w-]+):/)?.[1] ?? []))].filter((t) => !i.has(t) && e.value(t) !== void 0), o = t && !a.includes(t) ? [...a, t] : a;
	return /* @__PURE__ */ V(bi, {
		title: E("Other Properties"),
		open: o.length > 0,
		empty: o.length === 0,
		actions: /* @__PURE__ */ V(vo, {
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
var Co = [
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
], wo = [
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
], To = {
	blur: "px",
	brightness: "percent",
	contrast: "percent",
	saturate: "percent",
	grayscale: "percent",
	"hue-rotate": "deg",
	invert: "percent",
	sepia: "percent"
}, Eo = (e) => e.trim().replace(/\s+/g, " ");
function Do(e, t, n) {
	for (let [r, i] of e.ds.theme.entries()) if (r.startsWith("--blur-") && i.value === n) return e.make(t, r.slice(7));
	return e.make(t, n);
}
function Oo(e, t) {
	let n = (e) => `--tw-${t}${e}`, r = Object.keys(To), i = r.flatMap((t) => {
		let r = Fi(e.value(n(t)));
		return r === void 0 ? [] : [`${t}(${e.engine ? e.engine.resolve(r) : r})`];
	}).join(" ");
	return {
		value: i || void 0,
		set: (a) => {
			let o = e.engine;
			if (!o) return;
			let s = new Map(oo(i).map((e) => [e.name, e.value])), c = new Map(oo(a).map((e) => [e.name, e.value]));
			e.edit((e) => {
				for (let i of r) {
					if (s.get(i) === c.get(i)) continue;
					let r = c.get(i), a = `${t}${i}`;
					e.swap(n(i), r === void 0 ? null : i === "blur" ? Do(o, a, r) : Ri(o, a, r, To[i]));
				}
			}, `${t}filter`);
		},
		markers: r.map(n)
	};
}
function ko({ s: e }) {
	let t = X(), n = Oo(e, ""), r = Oo(e, "backdrop-"), i = e.value("--tw-shadow"), a = i && (t.of("shadow").find((e) => Eo(e.value) === Eo(i))?.ref ?? i), o = e.value("opacity"), s = [
		"opacity",
		"--tw-shadow",
		"mixBlendMode",
		"cursor",
		"pointerEvents",
		"clipPath"
	].some((t) => e.value(t)) || n.value || r.value;
	return /* @__PURE__ */ H(bo, {
		s: e,
		group: "effects",
		title: E("Effects"),
		empty: !s,
		children: [
			/* @__PURE__ */ V(Q, {
				s: e,
				fields: [{
					handle: "opacity",
					type: "text",
					component: "blocks-value",
					label: E("Opacity"),
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
					set: (t) => e.swap("opacity", t == null || t === "" || !e.engine ? null : Ri(e.engine, "opacity", `${Math.round(Number(t) * 100)}%`, "percent"))
				}]
			}),
			/* @__PURE__ */ V(Q, {
				s: e,
				bare: !0,
				fields: [{
					handle: "boxShadow",
					type: "text",
					component: "blocks-shadows",
					label: E("Shadows"),
					group: "shadow",
					markers: ["--tw-shadow"],
					get: () => a,
					set: (t) => e.swap("--tw-shadow", t && e.engine ? Ri(e.engine, "shadow", t, "number") : null)
				}]
			}),
			/* @__PURE__ */ V(Q, {
				s: e,
				bare: !0,
				fields: [{
					handle: "filter",
					type: "text",
					component: "blocks-filters",
					label: E("Filters"),
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
					label: E("Backdrop"),
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
						label: E("Clip Path"),
						className: "items-start py-0.5 [&>label]:leading-6"
					},
					{
						handle: "mixBlendMode",
						type: "select",
						size: "sm",
						label: E("Blending"),
						placeholder: E("Normal"),
						options: Co
					},
					{
						handle: "cursor",
						type: "select",
						size: "sm",
						label: E("Cursor"),
						placeholder: E("Auto"),
						options: wo
					},
					{
						handle: "pointerEvents",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: E("Clicks"),
						placeholder: "auto",
						options: [{
							value: "auto",
							label: E("On")
						}, {
							value: "none",
							label: E("Pass Through")
						}]
					}
				]
			})
		]
	});
}
// admin/src/builder/color.tsx
function Ao(e) {
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
	} : Mo(t);
}
var jo;
function Mo(e) {
	if (typeof document > "u" || typeof CSS > "u" || !CSS.supports("color", e) || /var\(|light-dark\(/.test(e) || (jo ??= document.createElement("canvas").getContext("2d", { willReadFrequently: !0 }), !jo)) return null;
	jo.clearRect(0, 0, 1, 1), jo.fillStyle = "black", jo.fillStyle = e, jo.fillRect(0, 0, 1, 1);
	let [t, n, r, i] = jo.getImageData(0, 0, 1, 1).data;
	return {
		r: t,
		g: n,
		b: r,
		a: Math.round(i / 255 * 100) / 100
	};
}
function No({ r: e, g: t, b: n, a: r }) {
	let i = (e) => Math.round(e).toString(16).padStart(2, "0");
	return r >= 1 ? `#${i(e)}${i(t)}${i(n)}` : `rgb(${Math.round(e)} ${Math.round(t)} ${Math.round(n)} / ${Math.round(r * 100)}%)`;
}
function Po({ r: e, g: t, b: n }) {
	e /= 255, t /= 255, n /= 255;
	let r = Math.max(e, t, n), i = r - Math.min(e, t, n);
	return {
		h: ((i === 0 ? 0 : r === e ? (t - n) / i % 6 : r === t ? (n - e) / i + 2 : (e - t) / i + 4) * 60 + 360) % 360,
		s: r === 0 ? 0 : i / r,
		v: r
	};
}
function Fo(e, t, n, r) {
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
function Io(e, t) {
	return t >= 100 ? `var(${e})` : `color-mix(in oklab, var(${e}) ${Math.round(t)}%, transparent)`;
}
function Lo(e) {
	return typeof CSS < "u" && CSS.supports("color", e);
}
function Ro() {
	let e = X();
	return (t) => t ? e.resolve(t) : "transparent";
}
function zo({ field: e, value: t, onChange: n, disabled: r }) {
	let [i, a] = M(!1), o = Ro(), s = oa(), c = t ?? void 0, l = s(c);
	return /* @__PURE__ */ V(ha, { children: /* @__PURE__ */ V(R, {
		open: i,
		onOpenChange: a,
		align: "end",
		className: "!p-0",
		trigger: /* @__PURE__ */ H(z, {
			compact: !0,
			id: we(e),
			disabled: r,
			className: B(Ei, "flex items-center gap-1.5 pl-1 text-left"),
			children: [/* @__PURE__ */ V(Di, {
				color: c === void 0 && typeof e.swatch == "string" ? e.swatch : o(c),
				className: "!size-4"
			}), l ? /* @__PURE__ */ V(ca, {
				token: l.token,
				alpha: l.alpha
			}) : /* @__PURE__ */ V("span", {
				className: B("truncate font-mono", !c && "font-sans text-faint"),
				children: c ?? e.placeholder ?? E("None")
			})]
		}),
		children: /* @__PURE__ */ V(Ho, {
			label: e.label || E("Color"),
			value: c,
			onChange: n
		})
	}) });
}
var Bo = (e) => {
	let t = Ao(e);
	return !!t && (.299 * t.r + .587 * t.g + .114 * t.b) / 255 > .62;
}, Vo = "pointer-events-none absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-pop ring-1 ring-black/20";
function Ho({ label: e, value: t, onChange: n, clearable: r = !0 }) {
	let i = X(), a = i.of("color"), o = A(() => na(a), [a]), s = i.find(t), c = s?.token.variable ?? null, l = !!c && o.families.some((e) => e.shades.some((e) => e.variable === c)), u = s ? s.alpha === void 0 ? 1 : Number(s.alpha) / 100 : 1, d = Ao(s ? ra(i.resolve(s.token.ref)).light : t) ?? {
		r: 0,
		g: 0,
		b: 0,
		a: 1
	}, [f, p] = M(() => ({
		...Po(d),
		a: s ? u : d.a
	})), [m, h] = M(t ?? ""), g = Sa(m, (e) => !e.trim() || Lo(e.trim())), _ = [
		...o.own.length ? [{
			value: "theme",
			label: E("Theme")
		}] : [],
		...o.families.length ? [{
			value: "palette",
			label: E("Palette")
		}] : [],
		{
			value: "custom",
			label: E("Custom")
		}
	], [v, y] = M(() => t && !s ? "custom" : l ? "palette" : _[0].value);
	k(() => h(t ?? ""), [t]);
	let [b, x] = M(""), S = b.trim().toLowerCase().split(/[\s-]+/).filter(Boolean), C = (e) => S.every((t) => e.toLowerCase().includes(t)), w = o.own.filter((e) => C(e.name)), T = o.families.flatMap((e) => e.shades).filter((e) => C(e.name)), D = (e, t, r, i) => {
		p({
			h: e,
			s: t,
			v: r,
			a: i
		}), n(No(Fo(e, t, r, i)));
	}, O = (e, t) => {
		let r = e.currentTarget;
		r.setPointerCapture(e.pointerId);
		let i = (e) => {
			let i = r.getBoundingClientRect(), a = Math.max(0, Math.min(1, (e.clientX - i.left) / i.width)), o = Math.max(0, Math.min(1, (e.clientY - i.top) / i.height));
			t === "area" ? D(f.h, a, 1 - o, f.a) : t === "hue" ? D(a * 360, f.s, f.v, f.a) : c ? n(Io(c, a < .995 ? Math.round(a * 100) : 100)) : D(f.h, f.s, f.v, Math.round(a * 100) / 100);
		};
		i(e);
		let a = (e) => i(e), o = () => {
			r.removeEventListener("pointermove", a), r.removeEventListener("pointerup", o);
		};
		r.addEventListener("pointermove", a), r.addEventListener("pointerup", o);
	}, ee = c ? u : f.a, te = c ? ra(i.resolve(`var(${c})`)).light : No({ ...Fo(f.h, f.s, f.v, 1) }), ne = /* @__PURE__ */ H("div", {
		onPointerDown: (e) => O(e, "alpha"),
		className: "relative h-3 min-w-0 flex-1 cursor-ew-resize rounded-full cms-checkerboard [--checker:6px]",
		children: [/* @__PURE__ */ V("span", {
			className: "absolute inset-0 rounded-full",
			style: { background: `linear-gradient(to right, transparent, ${te})` }
		}), /* @__PURE__ */ V("span", {
			className: B(Vo, "top-1/2"),
			style: { left: `${ee * 100}%` }
		})]
	});
	return /* @__PURE__ */ H("div", {
		role: "group",
		"aria-label": e,
		className: "w-80",
		children: [
			_.length > 1 && /* @__PURE__ */ V("div", {
				className: "border-b border-border p-1.5",
				children: /* @__PURE__ */ V(ve, {
					size: "xs",
					"aria-label": E("Colors"),
					value: v,
					onChange: y,
					options: _,
					block: !0
				})
			}),
			v !== "custom" && /* @__PURE__ */ V("div", {
				className: "px-3 pt-3",
				children: /* @__PURE__ */ V(F, {
					bare: !0,
					fields: [{
						handle: "search",
						type: "text",
						label: E("Search"),
						icon: "search",
						size: "sm",
						placeholder: E("Search Colors")
					}],
					values: { search: b },
					onChange: (e, t) => x(String(t ?? ""))
				})
			}),
			v !== "custom" && (v === "theme" ? w : T).length === 0 && /* @__PURE__ */ V(pe, {
				className: "h-64 justify-center",
				onClear: () => x("")
			}),
			v === "theme" && w.length > 0 && /* @__PURE__ */ V("div", {
				role: "listbox",
				"aria-label": E("Theme Colors"),
				className: "h-64 overflow-y-auto overscroll-contain p-1",
				children: w.map((e) => {
					let t = c === e.variable, { light: r, dark: a } = ra(e.value);
					return /* @__PURE__ */ H(z, {
						compact: !0,
						role: "option",
						"aria-selected": t,
						onClick: () => n(e.ref),
						className: B("flex h-8 w-full items-center gap-2.5 rounded-sm px-2 text-left hover:bg-hover", t && "bg-active"),
						children: [
							/* @__PURE__ */ V(Di, {
								color: r,
								dark: a,
								className: "!size-4"
							}),
							/* @__PURE__ */ V("span", {
								className: "min-w-0 flex-1 truncate text-xs text-ink",
								children: e.name
							}),
							t ? /* @__PURE__ */ V(I, {
								name: "check",
								size: 12,
								className: "shrink-0 text-ink"
							}) : /* @__PURE__ */ V("span", {
								className: "max-w-24 shrink-0 truncate font-mono text-2xs text-faint",
								children: ra(i.resolve(e.ref)).light
							})
						]
					}, e.variable);
				})
			}),
			v === "palette" && T.length > 0 && /* @__PURE__ */ V("div", {
				role: "listbox",
				"aria-label": E("Palette"),
				className: "grid h-64 grid-cols-11 content-start gap-1 overflow-y-auto overscroll-contain p-3",
				children: T.map((e) => {
					let t = c === e.variable, r = ra(e.value).light;
					return /* @__PURE__ */ V(xe, {
						content: e.name,
						children: /* @__PURE__ */ H(z, {
							compact: !0,
							role: "option",
							"aria-selected": t,
							"aria-label": e.name,
							onClick: () => n(e.ref),
							className: "relative grid aspect-square place-items-center rounded-xs transition-transform duration-fast ease-out hover:z-raised hover:scale-115",
							style: { background: r },
							children: [/* @__PURE__ */ V("span", { className: "cms-swatch-edge" }), t && /* @__PURE__ */ V(I, {
								name: "check",
								size: 12,
								className: Bo(r) ? "text-black/75" : "text-white"
							})]
						})
					}, e.variable);
				})
			}),
			v === "custom" && /* @__PURE__ */ H("div", {
				className: "h-72 space-y-3 p-3",
				children: [
					/* @__PURE__ */ V("div", {
						onPointerDown: (e) => O(e, "area"),
						className: "relative h-44 cursor-crosshair overflow-hidden rounded-sm",
						style: { background: `linear-gradient(to top, black, transparent), linear-gradient(to right, white, hsl(${f.h} 100% 50%))` },
						children: /* @__PURE__ */ V("span", {
							className: Vo,
							style: {
								left: `${f.s * 100}%`,
								top: `${(1 - f.v) * 100}%`
							}
						})
					}),
					/* @__PURE__ */ V("div", {
						onPointerDown: (e) => O(e, "hue"),
						className: "relative h-3 cursor-ew-resize rounded-full",
						style: { background: "linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)" },
						children: /* @__PURE__ */ V("span", {
							className: B(Vo, "top-1/2"),
							style: { left: `${f.h / 360 * 100}%` }
						})
					}),
					/* @__PURE__ */ V("div", {
						className: "flex items-center",
						children: ne
					}),
					/* @__PURE__ */ H("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ V(Di, {
							color: t ? i.resolve(t) : "transparent",
							className: "!size-7 !rounded-sm"
						}), /* @__PURE__ */ V("input", {
							value: m,
							spellCheck: !1,
							"aria-label": E("Color Value"),
							"aria-invalid": g.shown || void 0,
							onChange: (e) => h(e.target.value),
							onBlur: () => {
								let e = m.trim();
								if (e && !Lo(e)) return h(t ?? "");
								e !== (t ?? "") && n(e || null);
							},
							onKeyDown: (e) => {
								e.key === "Escape" && h(t ?? ""), e.key === "Enter" && (m.trim() && !Lo(m.trim()) ? g.show() : e.target.blur());
							},
							className: B("cms-input h-7 w-full min-w-0 rounded-sm px-2 text-sm placeholder:text-ghost", "font-mono"),
							placeholder: fe
						})]
					})
				]
			}),
			/* @__PURE__ */ H("div", {
				className: "flex h-10 items-center gap-2 border-t border-border pl-3 pr-1.5",
				children: [c && v !== "custom" ? /* @__PURE__ */ H(je, { children: [
					/* @__PURE__ */ V("span", {
						className: "shrink-0 text-xs text-muted",
						children: E("Opacity")
					}),
					ne,
					/* @__PURE__ */ H("span", {
						className: "w-9 shrink-0 text-right text-2xs tabular-nums text-muted",
						children: [Math.round(ee * 100), "%"]
					})
				] }) : /* @__PURE__ */ V("span", { className: "flex-1" }), r && /* @__PURE__ */ V(P, {
					variant: "ghost",
					size: "xs",
					disabled: !t,
					onClick: () => n(null),
					className: "shrink-0 !font-normal !text-muted hover:!text-ink",
					children: E("Clear")
				})]
			})
		]
	});
}
// admin/src/builder/fields/style.tsx
function Uo(e) {
	let t = e?.match(/^(linear|radial)-gradient\((.*)\)$/);
	if (!t) return null;
	let n = Ka(t[2]), r = t[1] === "linear" ? "180deg" : "circle";
	n[0] && (/deg$|^to /.test(n[0]) || /^(circle|ellipse)/.test(n[0])) && (r = n.shift());
	let i = n.map((e) => {
		let t = Ga(e);
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
function Wo(e) {
	return `${e.kind}-gradient(${[e.angle, ...e.stops.map((e) => `${e.color}${e.at ? ` ${e.at}` : ""}`)].join(", ")})`;
}
function Go({ value: e, onChange: t, context: n }) {
	let r = Ro(), i = Uo(e);
	if (!i) return null;
	let a = (e) => t(Wo(e));
	return /* @__PURE__ */ H("div", {
		className: "min-w-0 flex-1 space-y-1 rounded-md bg-active/60 p-1.5",
		children: [
			/* @__PURE__ */ V("div", {
				className: "h-6 rounded-sm ring-1 ring-inset ring-black/10",
				style: { background: r(Wo({
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
					label: E("Shape"),
					fields: [{
						handle: "kind",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: E("Kind"),
						required: !0,
						options: [{
							value: "linear",
							label: E("Linear")
						}, {
							value: "radial",
							label: E("Radial")
						}]
					}, {
						handle: "angle",
						type: "text",
						component: "blocks-value",
						label: E("Angle"),
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
						label: E("Stop||gradient"),
						fields: [{
							handle: "color",
							type: "color",
							component: "blocks-color",
							label: E("Color")
						}, {
							handle: "at",
							type: "text",
							component: "blocks-value",
							label: E("Position"),
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
				}), i.stops.length > 2 && /* @__PURE__ */ V(Ai, { onClick: () => a({
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
					/* @__PURE__ */ V(I, {
						name: "plus",
						size: 14
					}),
					" ",
					E("Add Stop")
				]
			})
		]
	});
}
var Ko = [
	"flex-start",
	"center",
	"flex-end"
], qo = () => [
	{
		value: "flex-start",
		label: E("Start")
	},
	{
		value: "center",
		label: E("Center")
	},
	{
		value: "flex-end",
		label: E("End")
	},
	{
		value: "space-between",
		label: E("Space Between")
	},
	{
		value: "space-around",
		label: E("Space Around")
	},
	{
		value: "space-evenly",
		label: E("Space Evenly")
	}
];
function Jo({ field: e, value: t, onChange: n, context: r }) {
	let i = e.row === !0, a = t?.justifyContent ?? void 0, o = t?.alignItems ?? void 0;
	return /* @__PURE__ */ H(ha, { children: [/* @__PURE__ */ V("div", {
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
			let r = Ko[i ? t : e], s = Ko[i ? e : t], c = (a ?? "flex-start") === r && (o ?? "stretch").replace("stretch", "flex-start") === s;
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
			label: E("Distribute"),
			options: qo(),
			placeholder: E("Distribute")
		}, {
			handle: "alignItems",
			type: "select",
			display: "segmented",
			block: !0,
			size: "sm",
			label: E("Align"),
			options: [
				{
					value: "flex-start",
					icon: i ? "align-top" : "justify-start",
					title: E("Start")
				},
				{
					value: "center",
					icon: i ? "align-middle" : "justify-center",
					title: E("Center")
				},
				{
					value: "flex-end",
					icon: i ? "align-bottom" : "justify-end",
					title: E("End")
				},
				{
					value: "stretch",
					icon: i ? "arrows-out-line-vertical" : "spacing",
					title: E("Stretch")
				},
				{
					value: "baseline",
					icon: "text",
					title: E("Baseline")
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
var Yo = [
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
], Xo = {
	left: "0%",
	top: "0%",
	center: "50%",
	right: "100%",
	bottom: "100%"
};
function Zo(e) {
	let t = (e ?? "center").trim().split(/\s+/), n = (e) => e === "top" || e === "bottom";
	t.length === 1 && t.push("center");
	let [r, i] = n(t[0]) || t[1] && (t[1] === "left" || t[1] === "right") ? [t[1], t[0]] : t;
	return `${Xo[r] ?? r} ${Xo[i] ?? i}`;
}
function Qo({ field: e, value: t, onChange: n, context: r, disabled: i }) {
	let a = Zo(t);
	return /* @__PURE__ */ H(ha, { children: [/* @__PURE__ */ V("div", {
		className: "grid size-[60px] shrink-0 grid-cols-3 gap-px rounded-sm bg-bg p-1",
		role: "radiogroup",
		"aria-label": e.label,
		children: Yo.flat().map((t) => {
			let r = a === Zo(t);
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
	}), /* @__PURE__ */ V(ma, {
		field: {
			handle: `${e.handle}-value`,
			type: "text",
			component: "blocks-value",
			label: e.label,
			unit: "",
			placeholder: E("Center")
		},
		value: t ?? null,
		onChange: (e) => n(e || null),
		context: r,
		disabled: i
	})] });
}
// admin/src/builder/design/Fill.tsx
var $o = [
	"backgroundSize",
	"backgroundPosition",
	"backgroundRepeat",
	"backgroundAttachment"
], es = (e) => e?.match(/^url\(["']?([^"')]*)["']?\)$/)?.[1];
function ts(e) {
	try {
		return encodeURI(decodeURI(e));
	} catch {
		return encodeURI(e);
	}
}
function ns({ s: e }) {
	let t = X(), n = e.value("backgroundImage"), r = Wi(e.value) ?? (Uo(n) ? n : void 0), i = r ? "gradient" : n ? "image" : "none", a = es(n), [o, s] = M(null), c = e.value("backgroundColor") || n || r, l = () => e.edit((e) => {
		e.swap(Hi, null), e.write(Object.fromEntries($o.map((e) => [e, null])));
	}, "fill"), u = (t) => {
		let n = Uo(t);
		if (!e.engine || !n) return l();
		e.swap(Hi, Ui(e.engine, n), "gradient");
	}, d = (t) => {
		let n = t && e.engine ? e.engine.make("bg", `url(${ts(t)})`) : null;
		e.swap(Hi, n ?? "bg-none", "image");
	}, f = async (e) => {
		if (!e) return s(null), d(null);
		try {
			let { items: t } = await T("media/get-many", { ids: [e] });
			if (!t[0]?.url) return;
			s({
				id: e,
				url: t[0].url
			}), d(t[0].url);
		} catch (e) {
			Oe.error(e);
		}
	};
	return /* @__PURE__ */ H(bo, {
		s: e,
		group: "fill",
		title: E("Fill"),
		empty: !c,
		children: [
			/* @__PURE__ */ V(Q, {
				s: e,
				fields: [{
					handle: "backgroundColor",
					type: "color",
					component: "blocks-color",
					label: E("Color")
				}, {
					handle: "kind",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: E("Image"),
					options: [
						{
							value: "none",
							label: E("None")
						},
						{
							value: "gradient",
							icon: "gradient",
							title: E("Gradient")
						},
						{
							value: "image",
							icon: "image",
							title: E("Image")
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
						let r = na(t.of("color")).own[0]?.ref ?? "currentColor";
						n === "gradient" ? u(`linear-gradient(180deg, ${r}, transparent)`) : n === "image" ? e.edit((e) => {
							e.swap(Hi, "bg-none"), e.write({
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
					label: E("Gradient"),
					get: () => r,
					set: u
				}]
			}),
			i === "image" && /* @__PURE__ */ H("div", {
				className: "space-y-1 rounded-md bg-active/60 p-1.5 text-xs",
				children: [/* @__PURE__ */ V(F, {
					bare: !0,
					disabled: !e.engine,
					fields: [{
						handle: "bg",
						type: "media",
						label: E("Image"),
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
						label: E("Image Address"),
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
						label: E("Size"),
						options: [
							{
								value: "cover",
								label: E("Cover")
							},
							{
								value: "contain",
								label: E("Contain")
							},
							{
								value: "auto",
								label: E("Original")
							}
						]
					},
					i === "image" && {
						handle: "backgroundPosition",
						type: "json",
						component: "blocks-origin",
						label: E("Position"),
						className: "items-start py-0.5 [&>label]:leading-6"
					},
					i === "image" && {
						handle: "backgroundRepeat",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: E("Repeat||again"),
						placeholder: "repeat",
						options: [
							{
								value: "no-repeat",
								label: E("Once")
							},
							{
								value: "repeat",
								label: E("Tile")
							},
							{
								value: "repeat-x",
								icon: "spacing",
								title: E("Tile Across")
							},
							{
								value: "repeat-y",
								icon: "arrows-out-line-vertical",
								title: E("Tile Down")
							}
						]
					},
					i === "image" && {
						handle: "backgroundAttachment",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: E("Scrolling"),
						options: [{
							value: "scroll",
							label: E("With Page")
						}, {
							value: "fixed",
							label: E("Fixed")
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
						label: E("Clip"),
						options: [{
							value: "border-box",
							label: E("Box")
						}, {
							value: "text",
							label: E("Text")
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
var rs = () => [
	{
		value: "block",
		icon: "square",
		title: E("Block")
	},
	{
		value: "flex",
		icon: "rows",
		title: E("Stack (flex)")
	},
	{
		value: "grid",
		icon: "grid",
		title: E("Grid")
	},
	{
		value: "inline-flex",
		icon: "arrows-in-line-horizontal",
		title: E("Inline Stack")
	},
	{
		value: "none",
		icon: "eye-off",
		title: E("Hidden")
	}
], is = (e) => e?.match(/^repeat\((\d+), minmax\(0, 1fr\)\)$/)?.[1] ?? e, as = (e) => e?.match(/^span (\d+) \/ span \1$/)?.[1] ?? e;
function os(e, t, n, r) {
	r && /^\d+$/.test(r.trim()) && e.engine?.valid(`${n}-${r.trim()}`) ? e.swap(t.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`), `${n}-${r.trim()}`) : e.set(t, r);
}
function ss({ s: e }) {
	let t = e.value("display"), n = t === "flex" || t === "inline-flex", r = t === "grid" || t === "inline-grid", i = n && (e.value("flexDirection") ?? "row").startsWith("row");
	return /* @__PURE__ */ V(bo, {
		s: e,
		group: "layout",
		title: E("Layout"),
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
					label: E("Display"),
					options: rs()
				},
				n && {
					handle: "flexDirection",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: E("Direction"),
					get: () => e.value("flexDirection") ?? "row",
					options: [
						{
							value: "row",
							icon: "arrow-right",
							title: E("Horizontal")
						},
						{
							value: "column",
							icon: "arrow-down",
							title: E("Vertical")
						},
						{
							value: "row-reverse",
							icon: "arrow-left",
							title: E("Horizontal, Reversed")
						},
						{
							value: "column-reverse",
							icon: "arrow-up",
							title: E("Vertical, Reversed")
						}
					]
				},
				n && {
					handle: "align",
					type: "json",
					component: "blocks-align",
					label: E("Align"),
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
					label: E("Gap"),
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
					label: E("Wrap"),
					options: [{
						value: "nowrap",
						label: E("One Line")
					}, {
						value: "wrap",
						label: E("Wrap")
					}],
					get: () => e.value("flexWrap") ?? "nowrap",
					set: (t) => e.set("flexWrap", t === "wrap" ? "wrap" : null)
				},
				r && {
					handle: "gridTemplateColumns",
					type: "text",
					component: "blocks-value",
					label: E("Columns"),
					placeholder: E("3 or 1fr 2fr"),
					unit: "",
					min: 1,
					title: E("A number of equal columns, or any grid template (1fr 2fr, repeat(auto-fill, minmax(16rem, 1fr)))"),
					get: () => is(e.value("gridTemplateColumns")),
					set: (t) => os(e, "gridTemplateColumns", "grid-cols", t)
				},
				r && {
					handle: "gridTemplateRows",
					type: "text",
					component: "blocks-value",
					label: E("Rows"),
					placeholder: "auto",
					unit: "",
					get: () => is(e.value("gridTemplateRows")),
					set: (t) => os(e, "gridTemplateRows", "grid-rows", t)
				},
				r && {
					handle: "gaps",
					type: "group",
					component: "blocks-group",
					label: E("Gap"),
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
						label: E("Columns"),
						group: "spacing",
						prefixIcon: "split",
						placeholder: "0",
						min: 0
					}, {
						handle: "rowGap",
						type: "text",
						component: "blocks-value",
						label: E("Rows"),
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
					label: E("Align"),
					keys: ["alignItems", "justifyItems"],
					get: () => e.value("alignItems"),
					options: [
						{
							value: "flex-start",
							icon: "align-top",
							title: E("Top")
						},
						{
							value: "center",
							icon: "align-middle",
							title: E("Middle")
						},
						{
							value: "flex-end",
							icon: "align-bottom",
							title: E("Bottom")
						},
						{
							value: "stretch",
							icon: "arrows-out-line-vertical",
							title: E("Stretch")
						}
					]
				},
				r && {
					handle: "gridAutoFlow",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: E("Flow"),
					options: [
						{
							value: "row",
							icon: "arrow-right",
							title: E("Rows First")
						},
						{
							value: "column",
							icon: "arrow-down",
							title: E("Columns First")
						},
						{
							value: "row dense",
							icon: "group",
							title: E("Fill Gaps (Dense)")
						}
					]
				}
			]
		})
	});
}
function cs({ s: e, parentDisplay: t }) {
	if (!t || !/flex|grid/.test(t)) return null;
	let n = t.includes("grid");
	return /* @__PURE__ */ V(bo, {
		s: e,
		group: "item",
		title: E(n ? "Grid Item" : "Stack Item"),
		open: !1,
		empty: !e.value("alignSelf") && !e.value("flex") && !e.value("gridColumn"),
		children: /* @__PURE__ */ V(Q, {
			s: e,
			fields: [
				n && {
					handle: "gridColumn",
					type: "text",
					component: "blocks-value",
					label: E("Column"),
					placeholder: "auto",
					unit: "",
					title: E("Span a number of columns (2), or a range (1 / -1 for full width)"),
					get: () => as(e.value("gridColumn")),
					set: (t) => os(e, "gridColumn", "col-span", t)
				},
				n && {
					handle: "gridRow",
					type: "text",
					component: "blocks-value",
					label: E("Row"),
					placeholder: "auto",
					unit: "",
					get: () => as(e.value("gridRow")),
					set: (t) => os(e, "gridRow", "row-span", t)
				},
				!n && {
					handle: "flex",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: E("Grow"),
					options: [
						{
							value: "1",
							label: E("Fill||size")
						},
						{
							value: "none",
							label: E("Fixed")
						},
						{
							value: "0 1 auto",
							label: E("Shrink")
						}
					]
				},
				{
					handle: "alignSelf",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: E("Align Self"),
					options: [
						{
							value: "flex-start",
							icon: "align-top",
							title: E("Start")
						},
						{
							value: "center",
							icon: "align-middle",
							title: E("Center")
						},
						{
							value: "flex-end",
							icon: "align-bottom",
							title: E("End")
						},
						{
							value: "stretch",
							icon: "arrows-out-line-vertical",
							title: E("Stretch")
						}
					]
				},
				{
					handle: "order",
					type: "text",
					component: "blocks-value",
					label: E("Display Order"),
					unit: "",
					placeholder: "0",
					prefixIcon: "list-ordered"
				}
			]
		})
	});
}
// admin/src/builder/design/Position.tsx
function ls({ s: e }) {
	let t = e.value("position"), n = !!t && t !== "static";
	return /* @__PURE__ */ V(bo, {
		s: e,
		group: "position",
		title: E("Position"),
		open: !!t,
		empty: !t,
		children: /* @__PURE__ */ V(Q, {
			s: e,
			fields: [
				{
					handle: "position",
					type: "select",
					size: "sm",
					label: E("Type"),
					placeholder: E("Static"),
					options: [
						{
							value: "static",
							label: E("Static")
						},
						{
							value: "relative",
							label: E("Relative")
						},
						{
							value: "absolute",
							label: E("Absolute")
						},
						{
							value: "fixed",
							label: E("Fixed")
						},
						{
							value: "sticky",
							label: E("Sticky")
						}
					]
				},
				n && {
					handle: "offsets",
					type: "group",
					component: "blocks-group",
					label: E("Offsets"),
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
							top: E("Top"),
							right: E("Right"),
							bottom: E("Bottom"),
							left: E("Left")
						}[e],
						title: {
							top: E("Top"),
							right: E("Right"),
							bottom: E("Bottom"),
							left: E("Left")
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
					label: E("Z-index"),
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
					label: E("Isolation"),
					placeholder: "auto",
					options: [{
						value: "auto",
						label: E("Auto")
					}, {
						value: "isolate",
						label: E("Isolate")
					}]
				}
			]
		})
	});
}
// admin/src/builder/design/Size.tsx
function us(e, t, n) {
	let r = e.value(t), i = r === "100%" ? "fill" : r === "fit-content" ? "fit" : r === "auto" || !r ? "auto" : r.endsWith("vh") || r.endsWith("vw") || r.endsWith("dvh") ? "viewport" : "fixed", a = {
		fill: E("Fill||size"),
		fit: E("Fit"),
		auto: E("Auto"),
		viewport: E("Window"),
		fixed: E("Fixed")
	};
	return {
		handle: t,
		type: "text",
		component: "blocks-value",
		label: n,
		prefix: t === "width" ? "W" : "H",
		placeholder: E("Auto"),
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
					label: E("Fill the Parent (100%)"),
					value: "100%",
					checked: i === "fill"
				},
				{
					label: E("Fit the Content"),
					value: "fit-content",
					checked: i === "fit"
				},
				{
					label: E("Auto"),
					value: null,
					checked: i === "auto"
				},
				{
					label: E(t === "width" ? "Window Width (100vw)" : "Window Height (100dvh)"),
					value: t === "width" ? "100vw" : "100dvh",
					checked: i === "viewport"
				}
			]
		}
	};
}
function ds({ s: e, media: t }) {
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
	return /* @__PURE__ */ V(bo, {
		s: e,
		group: "size",
		title: E("Size"),
		empty: !n,
		children: /* @__PURE__ */ V(Q, {
			s: e,
			fields: [
				us(e, "width", E("Width")),
				us(e, "height", E("Height")),
				{
					handle: "limits",
					type: "group",
					component: "blocks-group",
					label: E("Min · Max"),
					columns: 2,
					fields: [
						{
							handle: "minWidth",
							type: "text",
							component: "blocks-value",
							label: E("Min Width"),
							prefix: "W",
							placeholder: E("Min"),
							title: E("Minimum Width"),
							min: 0
						},
						{
							handle: "maxWidth",
							type: "text",
							component: "blocks-value",
							label: E("Max Width"),
							prefix: "W",
							placeholder: E("Max"),
							group: "container",
							title: E("Maximum Width"),
							min: 0,
							keywords: ["none"]
						},
						{
							handle: "minHeight",
							type: "text",
							component: "blocks-value",
							label: E("Min Height"),
							prefix: "H",
							placeholder: E("Min"),
							title: E("Minimum Height"),
							min: 0
						},
						{
							handle: "maxHeight",
							type: "text",
							component: "blocks-value",
							label: E("Max Height"),
							prefix: "H",
							placeholder: E("Max"),
							title: E("Maximum Height"),
							min: 0,
							keywords: ["none"]
						}
					]
				},
				{
					handle: "aspectRatio",
					type: "select",
					size: "sm",
					label: E("Aspect"),
					placeholder: E("Auto"),
					get: () => {
						let t = e.value("aspectRatio");
						return t && e.engine ? e.engine.resolve(t).replace(/\s+/g, "") : t;
					},
					options: [
						{
							value: "1/1",
							label: E("1:1 square")
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
							label: E("3:4 portrait")
						},
						{
							value: "4/5",
							label: "4:5"
						},
						{
							value: "9/16",
							label: E("9:16 story")
						}
					]
				},
				{
					handle: "overflow",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: E("Overflow"),
					placeholder: "visible",
					options: [
						{
							value: "visible",
							icon: "eye",
							title: E("Visible")
						},
						{
							value: "hidden",
							icon: "eye-off",
							title: E("Hidden")
						},
						{
							value: "auto",
							icon: "mouse-scroll",
							title: E("Scroll When Needed")
						},
						{
							value: "clip",
							icon: "scissors",
							title: E("Clip, without scrolling")
						}
					]
				},
				t && {
					handle: "objectFit",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: E("Fit||image"),
					options: [
						{
							value: "cover",
							label: E("Cover")
						},
						{
							value: "contain",
							label: E("Contain")
						},
						{
							value: "fill",
							label: E("Stretch")
						},
						{
							value: "none",
							label: E("None")
						}
					]
				},
				t && {
					handle: "objectPosition",
					type: "json",
					component: "blocks-origin",
					label: E("Focus"),
					className: "items-start py-0.5 [&>label]:leading-6"
				}
			]
		})
	});
}
// admin/src/builder/design/Spacing.tsx
var fs = [
	"Top",
	"Right",
	"Bottom",
	"Left"
];
function ps(e, t, n) {
	return [
		`${t}${fs[n]}`,
		n % 2 == 0 ? `${t}Block` : `${t}Inline`,
		t
	].find((t) => e.value(t) !== void 0) ?? null;
}
function ms(e, t, n) {
	let r = ps(e, t, n);
	if (!r) return;
	let i = e.value(r);
	if (r === t) return qa(i)?.[n];
	if (r.endsWith("Block") || r.endsWith("Inline")) {
		let [e, t] = Ga(String(i));
		return n === 0 || n === 3 ? e : t ?? e;
	}
	return i;
}
var hs = (e) => [
	e,
	`${e}Block`,
	`${e}Inline`,
	...fs.map((t) => `${e}${t}`)
];
function gs({ s: e }) {
	let t = ["margin", "padding"], n = t.some((t) => fs.some((n, r) => ms(e, t, r))), r = Object.fromEntries(t.map((t) => [t, [
		0,
		1,
		2,
		3
	].map((n) => ms(e, t, n))])), i = Object.fromEntries(t.map((t) => [t, [
		0,
		1,
		2,
		3
	].map((n) => {
		let r = ps(e, t, n);
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
		}), fs.forEach((e, o) => r[`${t}${e}`] = i || a ? null : n[o] ?? null), e.write(r);
	};
	return /* @__PURE__ */ V(bi, {
		title: E("Spacing"),
		empty: !n,
		children: /* @__PURE__ */ V(Q, {
			s: e,
			bare: !0,
			fields: [{
				handle: "spacing",
				type: "json",
				component: "blocks-spacing",
				className: "items-start",
				label: E("Spacing"),
				sideStatus: i,
				keys: [...hs("margin"), ...hs("padding")],
				get: () => r,
				set: (e) => t.forEach((t) => e[t] !== r[t] && a(t, e[t]))
			}]
		})
	});
}
// admin/src/builder/palette.tsx
var _s = "scheme-";
function vs(e) {
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
var ys = (e) => /^transparent$|\/\s*(0?\.\d+|\d{1,2}(\.\d+)?%)\s*\)$/.test(e.trim());
function bs({ background: e, text: t, size: n }) {
	let r = ys(e);
	return /* @__PURE__ */ H("span", {
		"aria-hidden": !0,
		className: B("relative grid shrink-0 place-items-center overflow-hidden", n === "mark" ? "h-4 w-5 rounded-xs text-2xs" : "h-20 w-full rounded-md text-2xl", r && "cms-checkerboard"),
		children: [
			/* @__PURE__ */ V("span", {
				className: "absolute inset-0",
				style: { background: e }
			}),
			/* @__PURE__ */ V("span", {
				className: "relative font-semibold leading-none",
				style: {
					color: t,
					textShadow: r ? "0 0 3px rgb(0 0 0 / 0.6)" : void 0
				},
				children: "Aa"
			}),
			/* @__PURE__ */ V("span", { className: "cms-swatch-edge" })
		]
	});
}
// admin/src/builder/specimen.tsx
function xs(e, t) {
	let [n] = M(() => typeof CSSStyleSheet < "u" ? new CSSStyleSheet() : null), [r, i] = M(!1), a = t.join(" ");
	return k(() => {
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
function Ss({ sheet: e, node: t, page: n, mode: r, className: i, align: a = "start" }) {
	let o = j(null);
	return le(() => {
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
	]), /* @__PURE__ */ V("div", {
		ref: o,
		"aria-hidden": "true",
		className: B("min-w-0 overflow-hidden", i)
	});
}
var Cs = (e) => e.replace(/^(btn|scheme)-/, "").split("-").filter(Boolean).map((e) => e.charAt(0).toUpperCase() + e.slice(1)).join(" ");
function ws(e) {
	return e.startsWith("btn-") ? {
		tag: "span",
		text: Cs(e),
		className: `cms-button ${e}`
	} : e.startsWith("scheme-") ? {
		tag: "span",
		text: Cs(e),
		className: `${e} inline-block rounded-md px-4 py-2`
	} : {
		tag: "span",
		text: Cs(e),
		className: e
	};
}
// admin/src/builder/design/Classes.tsx
var Ts = (e) => e.replace(/^!|!$/g, "");
function Es(e, t) {
	let n = (e.declarations(Ts(K(t).utility)) ?? []).filter((e) => !e.property.startsWith("--")), r = n.find((e) => /(^|-)color$|^fill$|^stroke$/.test(e.property) && !/^(inherit|currentcolor|transparent)$/i.test(e.value));
	return {
		text: n.slice(0, 2).map((t) => `${t.property}: ${e.resolve(t.value)}`).join("; "),
		color: r && ra(e.resolve(r.value)).light
	};
}
var Ds = 8;
function Os({ engine: e, site: t, exclude: n, onAdd: r, onBackspace: i, onEmpty: a, initial: o, onDone: s, label: c }) {
	let [l, u] = M(o ?? ""), [d, f] = M(0), [p, m] = M(!!o), h = A(() => new Set(n), [n]), g = l.trim(), _ = A(() => e && p && g && !/\s/.test(g) ? ea(e, t, g, h).slice(0, Ds) : [], [
		e,
		p,
		g,
		t,
		h
	]), [v, y] = M(!1), b = (t) => {
		let n = t.filter((t) => Yi(t) && !Xi(e, t));
		n.length && r(n), u(""), f(0), s?.();
	}, x = (e) => {
		if ((e.key === "ArrowDown" || e.key === "ArrowUp") && _.length) e.preventDefault(), f((t) => (t + (e.key === "ArrowDown" ? 1 : -1) + _.length) % _.length);
		else if (e.key === "Enter" || e.key === "Tab" && _.length && g || e.key === " " && g) {
			if (!g) {
				e.key === "Enter" && a && (e.preventDefault(), a());
				return;
			}
			e.preventDefault(), b(/\s/.test(g) ? Ge(g) : [_[d] ?? g]);
		} else e.key === "Escape" ? (e.preventDefault(), u(""), s?.()) : e.key === "Backspace" && l === "" && i && (e.preventDefault(), i());
	}, S = A(() => `cms-classes-${Math.random().toString(36).slice(2)}`, []);
	return /* @__PURE__ */ H("div", {
		className: "min-w-20 flex-1",
		children: [/* @__PURE__ */ V("input", {
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
			placeholder: o === void 0 ? E("Add Class") : void 0,
			onChange: (e) => {
				u(e.target.value), f(0);
				let t = e.target.getBoundingClientRect();
				y(window.innerHeight - t.bottom < 300 && t.top > 300);
			},
			onKeyDown: x,
			onFocus: () => m(!0),
			onBlur: () => {
				m(!1), g ? b(Ge(g)) : a ? a() : s?.();
			},
			className: "h-6 w-full min-w-0 rounded-xs bg-transparent px-1 font-mono text-xs text-text outline-none placeholder:font-sans placeholder:text-faint"
		}), _.length > 0 && /* @__PURE__ */ V("div", {
			id: S,
			role: "listbox",
			"aria-label": c,
			className: B("absolute inset-x-0 z-raised overflow-hidden rounded-md border border-border-float bg-float p-1 shadow-pop", v ? "bottom-full mb-1" : "top-full mt-1"),
			children: e && _.map((n, r) => {
				let i = Es(e, n);
				return /* @__PURE__ */ H(z, {
					compact: !0,
					id: `${S}-${r}`,
					role: "option",
					"aria-selected": r === d,
					tabIndex: -1,
					onPointerDown: (e) => {
						e.preventDefault(), b([n]);
					},
					onMouseEnter: () => f(r),
					className: B("flex min-h-7 w-full items-center gap-2 rounded-xs px-2 py-1 text-left", r === d && "bg-hover"),
					children: [
						i.color && /* @__PURE__ */ V(Di, {
							color: i.color,
							className: "!size-3.5"
						}),
						/* @__PURE__ */ V("span", {
							className: "shrink-0 font-mono text-xs text-ink",
							children: n
						}),
						/* @__PURE__ */ V("span", {
							className: "min-w-0 flex-1 truncate text-right text-2xs text-faint",
							children: t.includes(n) ? E("Style") : i.text
						})
					]
				}, n);
			})
		})]
	});
}
function ks({ s: e, site: t, disabled: n }) {
	let r = e.engine, [i, a] = M(null), o = (n, i) => {
		if (!r) return;
		let a = i ? e.classes.filter((e) => e !== i) : e.classes;
		for (let o of n) {
			let n = i ? o : qi(o, e.variants), { variants: s, utility: c } = K(n), l = t.includes(Ts(c)) ? null : r.group(c);
			a = l ? r.put(a, s, l, c) : [...a.filter((e) => e !== n), n];
		}
		e.apply(r.sort(a), "classes");
	}, s = (t) => e.apply(e.classes.filter((e) => e !== t), "classes"), [c, l] = M(!1);
	return /* @__PURE__ */ H("div", {
		className: B("cms-input relative flex !h-auto min-h-8 flex-wrap items-center gap-1 !p-1", n && "opacity-60"),
		"data-focus": c || void 0,
		onFocus: () => l(!0),
		onBlur: () => l(!1),
		"data-class-chips": !0,
		children: [e.classes.map((c) => i === c && !n ? /* @__PURE__ */ V(Os, {
			engine: r,
			site: t,
			exclude: e.classes.filter((e) => e !== c),
			initial: c,
			label: E("Class"),
			onAdd: (e) => o(e, c),
			onEmpty: () => {
				s(c), a(null);
			},
			onDone: () => a(null)
		}, c) : /* @__PURE__ */ V("span", {
			className: B("inline-flex h-6 max-w-full items-center rounded-xs bg-active pl-1.5 font-mono text-xs text-ink", n && "pr-1.5", Xi(r, c) && "underline decoration-danger decoration-wavy underline-offset-2"),
			children: n ? /* @__PURE__ */ V("span", {
				className: "truncate",
				children: c
			}) : /* @__PURE__ */ H(je, { children: [/* @__PURE__ */ V(z, {
				compact: !0,
				onClick: () => a(c),
				"aria-label": E("Change {name}", { name: c }),
				className: "min-w-0 truncate rounded-xs text-left",
				children: c
			}), /* @__PURE__ */ V(L, {
				icon: "close",
				size: "xs",
				label: E("Remove {name}", { name: c }),
				onClick: () => s(c),
				className: "!size-5 shrink-0 text-faint hover:text-ink"
			})] })
		}, c)), !n && /* @__PURE__ */ V(Os, {
			engine: r,
			site: t,
			exclude: e.classes,
			label: E("Add Class"),
			onAdd: (e) => o(e),
			onBackspace: () => e.classes.length && s(e.classes[e.classes.length - 1])
		})]
	});
}
// admin/src/builder/design/StyleBar.tsx
var As = (e) => e.replace(/^!|!$/g, ""), js = () => [
	{
		value: "",
		label: E("Default")
	},
	{
		value: "hover",
		label: E("Hover")
	},
	{
		value: "active",
		label: E("Pressed")
	},
	{
		value: "focus-visible",
		label: E("Focus")
	}
], Ms = () => [
	{
		value: "before",
		label: E("Before")
	},
	{
		value: "after",
		label: E("After")
	},
	{
		value: "placeholder",
		label: E("Placeholder")
	},
	{
		value: "first",
		label: E("First Item")
	},
	{
		value: "last",
		label: E("Last Item")
	},
	{
		value: "odd",
		label: E("Odd Items")
	},
	{
		value: "even",
		label: E("Even Items")
	},
	{
		value: "current",
		label: E("Current Page")
	},
	{
		value: "group-hover",
		label: E("Hover on Group")
	},
	{
		value: "dark",
		label: E("Dark Mode")
	},
	{
		value: "open",
		label: E("When Open")
	}
];
function Ns(e) {
	if (e === "") return E("Default");
	let t = [...js(), ...Ms()].find((t) => t.value === e);
	return t ? t.label : e.startsWith("in-data-") ? E("in {state}", { state: e.slice(8) }) : e.startsWith("data-") ? e.slice(5) : e;
}
function Ps({ classes: e, engine: t, state: n, onState: r, states: i }) {
	let a = Gi(e), o = n.join(":"), s = (e) => r(e ? K(`${e}:x`).variants : []), c = [...(i?.own ?? []).map((e) => `data-${e}`), ...(i?.inherited ?? []).map((e) => `in-data-${e}`)], l = (e) => !t || t.valid(`${e}:flex`), u = async () => {
		let e = await Ee({
			title: E("Custom Variant"),
			fields: [{
				handle: "name",
				type: "text",
				label: E("Variant"),
				placeholder: "aria-expanded, peer-checked",
				mono: !0
			}],
			confirm: E("Edit Variant")
		}), t = String(e?.name ?? "").trim().replace(/:+$/, "");
		if (t) {
			if (/\s/.test(t) || !l(t)) return void Oe.error(E("Tailwind has no variant “{name}”.", { name: t }));
			s(t);
		}
	}, d = (e, t = Ns(e)) => ({
		label: t,
		checked: o === e,
		hint: e && a.has(e) ? "•" : void 0,
		onSelect: () => s(e)
	}), f = Ms().map((e) => e.value).filter(l), p = c.filter(l), m = o !== "";
	return /* @__PURE__ */ V(de, {
		align: "end",
		trigger: /* @__PURE__ */ H(P, {
			variant: "ghost",
			size: "xs",
			"aria-label": E("State: {state}", { state: n.map(Ns).join(" · ") || E("Default") }),
			className: B("shrink-0 !gap-1 !px-1.5", m ? "!bg-focus-soft !text-ink" : "!font-normal !text-muted hover:!text-ink"),
			children: [
				m && /* @__PURE__ */ V("span", {
					className: "size-1.5 shrink-0 rounded-full bg-focus",
					"aria-hidden": !0
				}),
				/* @__PURE__ */ V("span", {
					className: "max-w-28 truncate",
					children: m ? n.map(Ns).join(" · ") : E("Default")
				}),
				/* @__PURE__ */ V(I, {
					name: "chevron-down",
					size: 10,
					className: "shrink-0 text-faint"
				})
			]
		}),
		items: [
			...js().map((e) => d(e.value, e.label)),
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
					label: E("States of This Element"),
					heading: !0
				},
				...p.map((e) => d(e))
			] : [],
			...o && !js().some((e) => e.value === o) && !f.includes(o) && !p.includes(o) ? [d(o)] : [],
			{
				separator: !0,
				label: ""
			},
			{
				label: E("Custom Variant…"),
				onSelect: () => void u()
			}
		]
	});
}
var Fs = (e) => String(e ?? "").trim().toLowerCase().replace(/[\s_]+/g, "-");
async function Is(e, t, n, r, i = "") {
	let a = Fs((await Ee({
		title: n,
		fields: [{
			handle: "name",
			type: "text",
			label: E("Name"),
			placeholder: "card",
			mono: !0,
			required: !0,
			autofocus: !0
		}],
		values: { name: i },
		confirm: r
	}))?.name);
	return !a || a === i ? null : /^[a-z][a-z0-9-]*$/.test(a) ? t.includes(a) || e?.valid(a) ? (Oe.error(E("There is already a style “{name}”.", { name: a })), null) : a : (Oe.error(E("A name is lowercase letters, numbers and hyphens, and starts with a letter.")), null);
}
function Ls(e, t) {
	let n = (t) => ra(e ? e.resolve(t) : t).light;
	return {
		background: n(t.background),
		text: n(t.text)
	};
}
function Rs({ name: e, schemes: t, engine: n }) {
	let r = t.get(e);
	return r ? /* @__PURE__ */ V(bs, {
		size: "mark",
		...Ls(n, r)
	}) : /* @__PURE__ */ V("span", {
		className: "grid h-4 w-5 shrink-0 place-items-center text-faint",
		children: /* @__PURE__ */ V(I, {
			name: e.startsWith("btn-") ? "button" : "symbol",
			size: 12
		})
	});
}
function zs({ site: e, worn: t, source: n, engine: r, schemes: i, onWear: a, footer: o, trigger: s }) {
	let [c, l] = M(!1), [u, d] = M(""), [f, p] = M(0), m = j(null), h = ce(), [g, _] = M(null);
	k(() => {
		if (!c || !n || g) return;
		let e = !0;
		return Dt(n).then((t) => e && _(t), () => {}), () => {
			e = !1;
		};
	}, [
		c,
		n,
		g
	]);
	let v = A(() => n ? new vt(n.css).elements().find((e) => e.name === "body")?.classes.join(" ") ?? "" : "", [n]), y = xs(c ? g : null, [...v.split(/\s+/).filter(Boolean), ...e]), b = u.trim().toLowerCase(), x = (e) => !t.includes(e) && (!b || e.includes(b) || Cs(e).toLowerCase().includes(b)), S = [
		[E("Styles"), e.filter((e) => !e.startsWith("scheme-") && !e.startsWith("btn-"))],
		[E("Buttons"), e.filter((e) => e.startsWith("btn-"))],
		[E("Schemes"), e.filter((e) => e.startsWith(_s))]
	].map(([e, t]) => [e, t.filter(x)]).filter(([, e]) => e.length > 0), C = S.flatMap(([, e]) => e), w = C[Math.min(f, C.length - 1)], T = () => {
		l(!1), d(""), p(0);
	}, D = (e) => {
		a(e), T();
	}, O = (e) => {
		p(e), m.current?.querySelector(`[data-index="${e}"]`)?.scrollIntoView({ block: "nearest" });
	};
	return /* @__PURE__ */ H(R, {
		open: c,
		onOpenChange: (e) => e ? l(!0) : T(),
		align: "start",
		className: "flex w-72 flex-col overflow-hidden !p-0",
		trigger: s,
		children: [
			/* @__PURE__ */ V("div", {
				className: "border-b border-border p-1.5",
				children: /* @__PURE__ */ V("input", {
					autoFocus: !0,
					value: u,
					role: "combobox",
					"aria-label": E("Search Styles"),
					"aria-expanded": !0,
					"aria-controls": h,
					placeholder: E("Search Styles"),
					spellCheck: !1,
					onChange: (e) => {
						d(e.target.value), p(0);
					},
					onKeyDown: (e) => {
						(e.key === "ArrowDown" || e.key === "ArrowUp") && C.length ? (e.preventDefault(), O((Math.min(f, C.length - 1) + (e.key === "ArrowDown" ? 1 : -1) + C.length) % C.length)) : e.key === "Enter" && w && (e.preventDefault(), D(w));
					},
					className: "cms-input h-8 w-full rounded-sm px-2 text-sm placeholder:text-ghost"
				})
			}),
			/* @__PURE__ */ H("div", {
				ref: m,
				id: h,
				role: "listbox",
				"aria-label": E("Styles"),
				className: "max-h-64 overflow-y-auto overscroll-contain p-1",
				children: [C.length === 0 && /* @__PURE__ */ V(pe, { className: "py-6" }), S.map(([e, t]) => /* @__PURE__ */ H("div", {
					role: "group",
					"aria-label": e,
					children: [/* @__PURE__ */ V("div", {
						className: "cms-label flex h-7 items-center px-2",
						children: e
					}), t.map((e) => {
						let t = C.indexOf(e);
						return /* @__PURE__ */ H(z, {
							compact: !0,
							role: "option",
							"data-index": t,
							"aria-selected": e === w,
							onClick: () => D(e),
							onPointerMove: () => t !== f && p(t),
							className: B("flex h-8 w-full items-center gap-2.5 rounded-sm px-2 text-left", e === w && "bg-hover"),
							children: [
								/* @__PURE__ */ V(Rs, {
									name: e,
									schemes: i,
									engine: r
								}),
								/* @__PURE__ */ V("span", {
									className: "min-w-0 flex-1 truncate text-xs text-ink",
									children: Cs(e)
								}),
								/* @__PURE__ */ V("span", {
									className: "max-w-24 shrink-0 truncate font-mono text-2xs text-faint",
									children: e
								})
							]
						}, e);
					})]
				}, e))]
			}),
			w && /* @__PURE__ */ V("div", {
				className: "border-t border-border p-1.5",
				children: /* @__PURE__ */ V(Ss, {
					sheet: y,
					node: ws(w),
					page: v,
					mode: "light",
					align: "center",
					className: "h-16 rounded-sm"
				})
			}),
			o && /* @__PURE__ */ V("div", {
				className: "border-t border-border p-1",
				children: o(T)
			})
		]
	});
}
var Bs = "cms.inspector.classes";
function Vs() {
	let [e, t] = M(() => {
		try {
			return localStorage.getItem(Bs) === "1";
		} catch {
			return !1;
		}
	});
	return [e, (e) => {
		t(e);
		try {
			localStorage.setItem(Bs, e ? "1" : "0");
		} catch {}
	}];
}
function Hs({ s: e, site: t, source: n, state: r, disabled: i, lead: a, actions: o }) {
	let s = e.engine, [c, l] = Vs(), u = Ji(s, e.classes, t), d = u.site.filter((e) => t.includes(As(K(e).utility))), f = d.map((e) => As(K(e).utility)), p = v("settings.manage") && !!n && !!s && !i, m = e.screen.sizes, h = (e) => K(e).variants.some((e) => !!rt(e, m)), g = u.utilities.filter((e) => !h(e)), _ = A(() => new Map((n ? vs(new vt(n.css)) : []).map((e) => [e.name, e])), [n]), y = (t) => s && e.apply(s.sort([...e.classes.filter((e) => e !== t), t]), "classes"), S = async () => {
		if (!s || !n) return;
		let r = await Is(s, t, E("Save as Style"), E("Save Style"));
		if (r) try {
			await T("styling/update", { css: new vt(n.css).setUtility(r, s.sort(g)).css }), b("styling/"), e.apply([
				...u.site,
				r,
				...u.utilities.filter(h)
			], "classes"), Oe.success(E("Style “{name}” saved", { name: r }));
		} catch (e) {
			Oe.error(e);
		}
	}, C = (t) => {
		if (!s || !n) return;
		let { variants: r, utility: i } = K(t), a = (new vt(n.css).utilities().find((e) => e.name === As(i))?.classes ?? []).map((e) => We(r, e));
		e.apply(s.sort([.../* @__PURE__ */ new Set([...e.classes.filter((e) => e !== t), ...a])]), "classes");
	}, w = !i && !!s && (t.length > 0 || p), D = (e) => /* @__PURE__ */ V(zs, {
		site: t,
		worn: f,
		source: n,
		engine: s,
		schemes: _,
		onWear: y,
		trigger: e,
		footer: p ? (e) => /* @__PURE__ */ V(P, {
			variant: "ghost",
			size: "sm",
			icon: "symbol",
			disabled: g.length === 0,
			onClick: () => {
				e(), S();
			},
			className: "w-full !justify-start !px-2 !font-normal",
			children: E("Save as Style…")
		}) : void 0
	});
	return /* @__PURE__ */ H("div", {
		className: "space-y-2 border-b border-border py-2 pl-4 pr-3",
		"data-style-bar": !0,
		children: [/* @__PURE__ */ H("div", {
			className: "flex items-center gap-1",
			children: [
				a ?? (!w && d.length === 0 ? /* @__PURE__ */ V("span", { className: "flex-1" }) : /* @__PURE__ */ H("div", {
					className: "flex min-h-8 min-w-0 flex-1 flex-wrap items-center gap-1 rounded-sm bg-bg p-1 shadow-edge",
					children: [d.map((t) => {
						let r = As(K(t).utility);
						return /* @__PURE__ */ V(de, {
							align: "start",
							trigger: /* @__PURE__ */ H(P, {
								variant: "ghost",
								size: "xs",
								disabled: i,
								className: "max-w-full !gap-1.5 !rounded-xs !bg-active !pl-1 !pr-1.5 !font-normal !text-ink",
								children: [/* @__PURE__ */ V(Rs, {
									name: r,
									schemes: _,
									engine: s
								}), /* @__PURE__ */ V("span", {
									className: "truncate",
									children: t === r ? Cs(r) : t
								})]
							}),
							items: [
								p && {
									label: E("Edit Style"),
									icon: "edit",
									onSelect: () => x(r.startsWith("scheme-") ? "/design/colors" : `/design/styles/${r.startsWith("btn-") ? "buttons" : "ungrouped"}/${encodeURIComponent(r)}`)
								},
								!!n && {
									label: E("Detach Style"),
									icon: "unlink",
									onSelect: () => C(t)
								},
								{
									label: E("Remove Style"),
									icon: "trash",
									danger: !0,
									onSelect: () => e.apply(e.classes.filter((e) => e !== t), "classes")
								}
							]
						}, t);
					}), w && (d.length === 0 ? D(/* @__PURE__ */ H(z, {
						compact: !0,
						className: "flex h-6 min-w-0 flex-1 items-center gap-1.5 rounded-xs px-1.5 text-left text-xs text-faint hover:text-ink",
						children: [/* @__PURE__ */ V(I, {
							name: "plus",
							size: 12
						}), E("Add Style")]
					})) : D(/* @__PURE__ */ V(L, {
						icon: "plus",
						size: "xs",
						label: E("Add Style"),
						className: "ml-auto"
					})))]
				})),
				/* @__PURE__ */ V(xe, {
					content: E("Classes"),
					children: /* @__PURE__ */ V(L, {
						icon: "code",
						size: "sm",
						label: E("Classes"),
						title: void 0,
						active: c,
						onClick: () => l(!c),
						className: "shrink-0"
					})
				}),
				/* @__PURE__ */ V(Ps, { ...r }),
				o
			]
		}), c && /* @__PURE__ */ H("div", {
			className: "flex items-start gap-1",
			children: [/* @__PURE__ */ V("div", {
				className: "min-w-0 flex-1",
				children: /* @__PURE__ */ V(ks, {
					s: e,
					site: t,
					disabled: i
				})
			}), /* @__PURE__ */ V(xe, {
				content: E("Copy Classes"),
				children: /* @__PURE__ */ V(L, {
					icon: "copy",
					size: "sm",
					label: E("Copy Classes"),
					title: void 0,
					disabled: e.classes.length === 0,
					onClick: () => void Se(e.classes.join(" "), { copied: E("Classes copied") }),
					className: "shrink-0"
				})
			})]
		})]
	});
}
// admin/src/builder/design/Transform.tsx
var Us = (e) => !e || /^-?0(px|deg|%)?$/.test(e);
function Ws({ s: e }) {
	let t = {
		x: e.value("--tw-translate-x"),
		y: e.value("--tw-translate-y")
	}, n = {
		X: Fi(e.value("--tw-skew-x")),
		Y: Fi(e.value("--tw-skew-y"))
	}, r = e.value("--tw-scale-x"), i = r?.endsWith("%") ? String(parseFloat(r) / 100) : r, a = [
		t.x,
		t.y,
		n.X,
		n.Y,
		i,
		e.value("rotate"),
		e.value("transformOrigin"),
		e.value("perspective")
	].some(Boolean), o = (t, n, r, i) => e.swap(t, e.engine && !Us(r) ? Ri(e.engine, n, r, i) : null), s = (e) => [{
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
	return /* @__PURE__ */ V(bo, {
		s: e,
		group: "transform",
		title: E("Transform"),
		open: !!a,
		empty: !a,
		children: /* @__PURE__ */ V(Q, {
			s: e,
			fields: [
				{
					handle: "move",
					type: "group",
					component: "blocks-group",
					label: E("Move"),
					markers: ["--tw-translate-x", "--tw-translate-y"],
					fields: s("px"),
					get: () => t,
					set: (e) => Object.entries(Xa(t, e)).forEach(([e, t]) => o(`--tw-translate-${e}`, `translate-${e}`, t, "spacing"))
				},
				{
					handle: "rotate",
					type: "text",
					component: "blocks-value",
					label: E("Rotate"),
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
					label: E("Scale"),
					unit: "",
					step: .01,
					prefixIcon: "arrows-out-simple",
					placeholder: "1",
					markers: ["scale"],
					get: () => i,
					set: (t) => e.swap("scale", e.engine && t && Number(t) !== 1 ? Ri(e.engine, "scale", t, "percent") : null)
				},
				{
					handle: "skew",
					type: "group",
					component: "blocks-group",
					label: E("Skew"),
					markers: ["--tw-skew-x", "--tw-skew-y"],
					fields: s("deg").map((e) => ({
						...e,
						handle: e.handle.toUpperCase()
					})),
					get: () => n,
					set: (e) => Object.entries(Xa(n, e)).forEach(([e, t]) => o(`--tw-skew-${e.toLowerCase()}`, `skew-${e.toLowerCase()}`, t, "deg"))
				},
				{
					handle: "transformOrigin",
					type: "json",
					component: "blocks-origin",
					label: E("Origin"),
					className: "items-start py-0.5 [&>label]:leading-6"
				},
				{
					handle: "perspective",
					type: "text",
					component: "blocks-value",
					label: E("Perspective"),
					prefixIcon: "perspective",
					placeholder: "none",
					keywords: ["none"]
				}
			]
		})
	});
}
// admin/src/builder/design/Transition.tsx
var Gs = () => [
	{
		value: "transition",
		label: E("Colors, Opacity, Shadow and Transform")
	},
	{
		value: "transition-all",
		label: E("Everything")
	},
	{
		value: "transition-colors",
		label: E("Colors")
	},
	{
		value: "transition-transform",
		label: E("Transform")
	},
	{
		value: "transition-opacity",
		label: E("Opacity")
	},
	{
		value: "transition-shadow",
		label: E("Shadow")
	}
], Ks = [
	"transition-property",
	"--tw-duration",
	"--tw-ease",
	"transition-delay"
];
function qs({ s: e }) {
	let t = X(), n = e.value("transitionProperty"), r = Gs(), i = n === void 0 ? void 0 : r.find((t) => e.engine?.value(t.value, "transition-property") === n)?.value, a = (t, n, r) => e.swap(t, r && e.engine ? Ri(e.engine, n, r, "ms") : null);
	return /* @__PURE__ */ V(bo, {
		s: e,
		group: "transition",
		title: E("Transition"),
		open: !!n,
		empty: !n,
		children: n ? /* @__PURE__ */ V(Q, {
			s: e,
			fields: [
				{
					handle: "property",
					type: "select",
					size: "sm",
					label: E("Animate"),
					options: r,
					markers: ["transition-property"],
					reset: () => e.swap(Ks, null),
					get: () => i,
					set: (t) => e.swap(t ? "transition-property" : Ks, t || null)
				},
				{
					handle: "timing",
					type: "group",
					component: "blocks-group",
					label: E("Duration"),
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
						label: E("Duration"),
						unit: "ms",
						step: 10,
						min: 0,
						prefixIcon: "timer",
						placeholder: "150"
					}, {
						handle: "delay",
						type: "text",
						component: "blocks-value",
						label: E("Delay"),
						unit: "ms",
						step: 10,
						min: 0,
						prefixIcon: "pause",
						placeholder: E("Delay")
					}]
				},
				{
					handle: "ease",
					type: "text",
					component: "ease",
					label: E("Curve"),
					markers: ["--tw-ease"],
					get: () => e.value("--tw-ease"),
					set: (t) => e.swap("--tw-ease", t && e.engine ? Ri(e.engine, "ease", t, "number") : null),
					options: [
						...t.of("ease").map((e) => ({
							value: e.ref,
							label: e.name,
							curve: e.value
						})),
						{
							value: "linear",
							label: E("Linear")
						},
						{
							value: "cubic-bezier(0.2, 0.8, 0.2, 1)",
							label: E("Smooth Out")
						},
						{
							value: "cubic-bezier(0.65, 0, 0.35, 1)",
							label: E("Smooth In-Out")
						},
						{
							value: "cubic-bezier(0.34, 1.56, 0.64, 1)",
							label: E("Overshoot")
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
			children: E("Animate State Changes")
		})
	});
}
// admin/src/builder/design/Typography.tsx
var Js = () => ({
	100: E("Thin 100"),
	200: E("Extra Light 200"),
	300: E("Light 300"),
	400: E("Regular 400"),
	500: E("Medium 500"),
	600: E("Semibold 600"),
	700: E("Bold 700"),
	800: E("Extra Bold 800"),
	900: E("Black 900")
}), Ys = "-webkit-text-stroke";
function Xs({ s: e, prose: t }) {
	let n = X(), r = Js(), i = [
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
		Ys
	].some((t) => e.value(t)), a = Ga(e.value(Ys) ?? ""), o = {
		width: a.find((e) => /^-?[\d.]/.test(e)),
		color: a.find((e) => !/^-?[\d.]/.test(e))
	}, s = e.value("textOverflow") === "ellipsis" && e.value("whiteSpace") === "nowrap";
	return /* @__PURE__ */ H(bo, {
		s: e,
		group: "typography",
		title: E("Typography"),
		empty: !i && !t?.on,
		children: [
			t && /* @__PURE__ */ V(Z, {
				fields: [{
					handle: "prose",
					type: "toggle",
					label: E("Prose")
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
						label: E("Font"),
						placeholder: E("Inherit"),
						options: n.of("font").map((e) => ({
							value: e.ref,
							label: `${e.name} · ${e.value.split(",")[0].replace(/["']/g, "")}`
						}))
					},
					{
						handle: "fontWeight",
						type: "select",
						size: "sm",
						label: E("Weight"),
						placeholder: E("Inherit"),
						options: n.of("weight").map((e) => ({
							value: e.ref,
							label: r[e.value] ?? `${e.name} · ${e.value}`
						}))
					},
					{
						handle: "fontSize",
						type: "text",
						component: "blocks-value",
						label: E("Size"),
						group: "text",
						prefixIcon: "richtext",
						placeholder: E("Inherit"),
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
						label: E("Line Height"),
						group: "leading",
						prefixIcon: "height",
						unit: "",
						step: .05,
						placeholder: E("Inherit"),
						title: E("Line Height (1.2 = 120%)")
					},
					{
						handle: "letterSpacing",
						type: "text",
						component: "blocks-value",
						label: E("Letter Spacing"),
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
						label: E("Color"),
						placeholder: E("Inherit")
					},
					{
						handle: "textAlign",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: E("Align"),
						placeholder: "left",
						options: [
							{
								value: "left",
								icon: "align-left",
								title: E("Left")
							},
							{
								value: "center",
								icon: "align-center",
								title: E("Center")
							},
							{
								value: "right",
								icon: "align-right",
								title: E("Right")
							},
							{
								value: "justify",
								icon: "align-justify",
								title: E("Justify||text")
							}
						]
					},
					{
						handle: "fontStyle",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: E("Style"),
						placeholder: "normal",
						options: [{
							value: "normal",
							icon: "text",
							title: E("Upright")
						}, {
							value: "italic",
							icon: "italic",
							title: E("Italic")
						}]
					},
					{
						handle: "textDecorationLine",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: E("Decoration"),
						placeholder: "none",
						options: [
							{
								value: "none",
								icon: "close",
								title: E("No Decoration")
							},
							{
								value: "underline",
								icon: "underline",
								title: E("Underline")
							},
							{
								value: "line-through",
								icon: "strike",
								title: E("Strike Through")
							}
						]
					},
					{
						handle: "textTransform",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: E("Case"),
						placeholder: "none",
						options: [
							{
								value: "none",
								icon: "close",
								title: E("As Typed")
							},
							{
								value: "uppercase",
								label: "AA",
								title: E("Uppercase")
							},
							{
								value: "capitalize",
								label: "Aa",
								title: E("Capitalize")
							},
							{
								value: "lowercase",
								label: "aa",
								title: E("Lowercase")
							}
						]
					},
					{
						handle: "textWrap",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: E("Wrap"),
						options: [
							{
								value: "balance",
								label: E("Balance")
							},
							{
								value: "pretty",
								label: E("Pretty")
							},
							{
								value: "nowrap",
								label: E("None")
							}
						]
					},
					{
						handle: "lineClamp",
						type: "text",
						component: "blocks-value",
						label: E("Max Lines"),
						unit: "",
						min: 1,
						placeholder: E("All"),
						prefixIcon: "list-tree",
						markers: ["-webkit-line-clamp"],
						get: () => e.value("-webkit-line-clamp"),
						set: (t) => e.swap(["-webkit-line-clamp", "text-overflow"], t && e.engine?.valid(`line-clamp-${t}`) ? `line-clamp-${t}` : null)
					},
					{
						handle: "truncate",
						type: "toggle",
						size: "sm",
						label: E("Truncate"),
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
					label: E("Text Shadow")
				}]
			}),
			/* @__PURE__ */ V(Q, {
				s: e,
				fields: [{
					handle: "stroke",
					type: "group",
					component: "blocks-group",
					label: E("Text Stroke"),
					keys: [Ys],
					get: () => o,
					set: (t) => {
						let n = {
							...o,
							...Xa(o, t)
						};
						e.set(Ys, n.width ? `${n.width} ${n.color ?? "currentColor"}` : null);
					},
					fields: [{
						handle: "width",
						type: "text",
						component: "blocks-value",
						label: E("Width"),
						prefixIcon: "edit",
						placeholder: "0",
						min: 0,
						step: .5,
						className: "!flex-none w-[72px]"
					}, {
						handle: "color",
						type: "color",
						component: "blocks-color",
						label: E("Color"),
						placeholder: E("Text Color")
					}]
				}]
			})
		]
	});
}
// admin/src/builder/design/DesignPanel.tsx
var Zs = [
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
function Qs({ s: e, groups: t = Zs, container: n = !0, parentDisplay: r, media: i, prose: a }) {
	let o = (e) => t.includes(e);
	return /* @__PURE__ */ H(je, { children: [
		o("layout") && n && /* @__PURE__ */ V(ss, { s: e }),
		r && /flex|grid/.test(r) && /* @__PURE__ */ V(cs, {
			s: e,
			parentDisplay: r
		}),
		o("position") && /* @__PURE__ */ V(ls, { s: e }),
		o("size") && /* @__PURE__ */ V(ds, {
			s: e,
			media: i
		}),
		o("spacing") && /* @__PURE__ */ V(gs, { s: e }),
		o("typography") && /* @__PURE__ */ V(Xs, {
			s: e,
			prose: a
		}),
		o("fill") && /* @__PURE__ */ V(ns, { s: e }),
		o("border") && /* @__PURE__ */ V(io, { s: e }),
		o("effects") && /* @__PURE__ */ V(ko, { s: e }),
		o("transform") && /* @__PURE__ */ V(Ws, { s: e }),
		o("transition") && /* @__PURE__ */ V(qs, { s: e }),
		t.length > 1 && /* @__PURE__ */ V(So, { s: e })
	] });
}
function $s({ node: t }) {
	let { types: n, store: r, readOnly: i } = U(), a = Pt(), o = n.get(t.type), s = Wa(t), l = G(r, (e) => e.state), u = G(r, (e) => c(e.nodes, t.id)), d = G(r, (n) => e(n.nodes, t.id)), f = A(() => {
		if (u) return Ii(a.engine, Ge(u.class), s.screen, [], () => {}).value("display") ?? (u.type === "stack" || u.type === "columns" || u.type === "grid" ? "flex" : void 0);
	}, [
		u,
		a.engine,
		s.screen
	]), p = t.type === "outlet" && !t.props?.wrap, m = p ? ["typography"] : o?.styles?.length ? o.styles : Zs;
	return t.type === "component" ? /* @__PURE__ */ V("p", {
		className: "m-0 p-4 text-xs text-muted",
		children: E("Edit the component to change its shared design.")
	}) : /* @__PURE__ */ H("div", { children: [
		!a.engine && !a.loading && /* @__PURE__ */ V("div", {
			className: "border-b border-border px-4 py-3",
			children: /* @__PURE__ */ V(me, {
				tone: "warning",
				title: E("The site’s stylesheet could not be read"),
				action: /* @__PURE__ */ V(_, {
					to: "/design/colors",
					className: "shrink-0 text-xs text-text",
					children: E("Open Design")
				})
			})
		}),
		/* @__PURE__ */ V("div", {
			className: "sticky top-0 z-raised bg-surface",
			children: /* @__PURE__ */ V(Hs, {
				s,
				site: a.classes,
				source: a.source,
				disabled: i,
				state: {
					classes: s.classes,
					engine: a.engine,
					state: l,
					onState: r.setStyleState,
					states: ta(t, d)
				}
			})
		}),
		/* @__PURE__ */ V(Qs, {
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
var ec = () => [
	{
		value: "click",
		label: E("Click")
	},
	{
		value: "mouseenter",
		label: E("Pointer Enters")
	},
	{
		value: "mouseleave",
		label: E("Pointer Leaves")
	},
	{
		value: "focus",
		label: E("Gets Focus")
	},
	{
		value: "blur",
		label: E("Loses Focus")
	},
	{
		value: "input",
		label: E("Typing")
	},
	{
		value: "change",
		label: E("Value Changes")
	},
	{
		value: "submit",
		label: E("Form Submit")
	},
	{
		value: "keydown",
		label: E("Key Pressed")
	},
	{
		value: "enter",
		label: E("Scrolls into View")
	},
	{
		value: "leave",
		label: E("Scrolls Out of View")
	},
	{
		value: "scroll",
		label: E("Page Scrolls")
	},
	{
		value: "resize",
		label: E("Window Resizes")
	},
	{
		value: "init",
		label: E("Page Loads")
	}
], tc = () => [
	{
		value: "prevent",
		label: E("Prevent Default")
	},
	{
		value: "stop",
		label: E("Stop Propagation")
	},
	{
		value: "outside",
		label: E("Outside This Element")
	},
	{
		value: "window",
		label: E("Anywhere on the Page")
	},
	{
		value: "once",
		label: E("Only Once")
	},
	{
		value: "self",
		label: E("On This Element Only")
	},
	{
		value: "debounce",
		label: E("Debounce")
	}
], nc = () => [
	{
		value: "set",
		label: E("Set State"),
		icon: "edit"
	},
	{
		value: "toggle",
		label: E("Toggle State"),
		icon: "toggle-left"
	},
	{
		value: "add",
		label: E("Add to Number"),
		icon: "plus"
	},
	{
		value: "if",
		label: E("If … Then … Else"),
		icon: "github"
	},
	{
		value: "play",
		label: E("Play Animation"),
		icon: "play"
	},
	{
		value: "scroll",
		label: E("Scroll To"),
		icon: "mouse-scroll"
	},
	{
		value: "fetch",
		label: E("Load Page Part"),
		icon: "external"
	},
	{
		value: "copy",
		label: E("Copy to Clipboard"),
		icon: "copy"
	},
	{
		value: "go",
		label: E("Go to Link"),
		icon: "link-chain"
	},
	{
		value: "theme",
		label: E("Light or Dark Mode"),
		icon: "moon"
	},
	{
		value: "focus",
		label: E("Focus Element"),
		icon: "position"
	},
	{
		value: "lock",
		label: E("Lock Page Scrolling"),
		icon: "lock"
	},
	{
		value: "wait",
		label: E("Wait"),
		icon: "timer"
	},
	{
		value: "dispatch",
		label: E("Send Event"),
		icon: "broadcast"
	},
	{
		value: "run",
		label: E("Expression"),
		icon: "braces"
	}
];
function rc(t) {
	let { store: n } = U(), r = G(n, (n) => e(n.nodes, t.id));
	return [...new Set([...r, t].flatMap((e) => Object.keys(e.logic?.data ?? {})))];
}
function ic(e) {
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
var ac = (e) => typeof e == "string" ? `'${e}'` : JSON.stringify(e), oc = (e, t, n = {}) => ({
	handle: e,
	type: "text",
	size: "sm",
	commit: "blur",
	label: t,
	mono: !0,
	max: 1e4,
	list: sc,
	placeholder: "open, count > 3, tab === 'a'",
	...n
}), sc = "cms-logic-variables", cc = (e, ...t) => e ? t : [], lc = [
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
function uc({ label: e, options: t, value: n, onChange: r }) {
	return /* @__PURE__ */ H("div", {
		className: "flex min-h-7 items-center gap-2",
		children: [/* @__PURE__ */ V(Ci, { field: {
			handle: e,
			type: "select",
			label: e
		} }), /* @__PURE__ */ V("span", {
			className: "cms-input flex h-7 min-w-0 flex-1 rounded-sm",
			children: /* @__PURE__ */ V(de, {
				align: "end",
				trigger: /* @__PURE__ */ H(P, {
					variant: "ghost",
					"aria-label": e,
					className: "!h-full min-w-0 flex-1 shrink !justify-start !gap-1.5 !bg-transparent !pl-2 !pr-1.5 text-left !font-normal",
					children: [/* @__PURE__ */ V("span", {
						className: B("min-w-0 flex-1 truncate", !n.length && "text-ghost"),
						children: n.length ? n.join(", ") : E("None")
					}), /* @__PURE__ */ V(I, {
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
					label: E("None"),
					disabled: !0
				}]
			})
		})]
	});
}
var dc = { strip: "[^A-Za-z0-9_-]" }, fc = (e) => e.replace(/^[^A-Za-z_]+/, "").slice(0, 41);
function pc({ node: e }) {
	let { store: t } = U(), n = D("styling-code/list", {}, { staleTime: 3e4 }), r = e.behavior, i = e.code ?? {}, a = (e, ...t) => [.../* @__PURE__ */ new Set([...n.data?.[e] ?? [], ...t.filter((e) => !!e)])], o = (n) => t.updateNode(e.id, { behavior: n && (n.module ?? r?.module) ? {
		...r,
		...n
	} : void 0 }, `behavior:${e.id}`), s = (n, r) => {
		let a = {
			...i,
			[n]: r.length ? r : void 0
		};
		t.updateNode(e.id, { code: a.scripts || a.styles ? a : void 0 });
	}, c = r?.props ?? {};
	return /* @__PURE__ */ H("div", {
		className: B("-mx-1.5 space-y-1 rounded-sm px-1.5 py-1", r && "bg-sunken/60"),
		children: [
			/* @__PURE__ */ V(Z, {
				fields: [{
					handle: "module",
					type: "select",
					size: "sm",
					label: E("Script"),
					placeholder: E("None"),
					options: a("scripts", r?.module),
					status: r ? "own" : void 0,
					reset: () => o(null)
				}, ...cc(r, {
					handle: "when",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: E("Runs"),
					required: !0,
					options: [
						{
							value: "load",
							label: E("On Load")
						},
						{
							value: "visible",
							label: E("In View")
						},
						{
							value: "idle",
							label: E("When Idle")
						}
					]
				})],
				values: {
					module: r?.module,
					when: r?.when ?? "load"
				},
				onChange: (e, t) => o(e === "module" ? t ? { module: String(t) } : null : { when: t === "visible" || t === "idle" ? t : void 0 })
			}),
			r && /* @__PURE__ */ H(je, { children: [/* @__PURE__ */ V(Si, {
				title: E("Options"),
				action: /* @__PURE__ */ V(ki, {
					label: E("Add Option"),
					onClick: () => {
						let e = "value", t = 2;
						for (; e in c;) e = `value${t++}`;
						o({ props: {
							...c,
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
					label: E("Options"),
					key: dc,
					join: "=",
					item: {
						handle: "value",
						type: "text",
						size: "sm",
						commit: "blur",
						label: E("Value"),
						mono: !0
					}
				}],
				values: { props: Object.fromEntries(Object.entries(c).map(([e, t]) => [e, ac(t)])) },
				onChange: (e, t) => {
					let n = Object.fromEntries(Object.entries(t).map(([e, t]) => [fc(e), e in c && ac(c[e]) === t ? c[e] : ic(t ?? "")]).filter(([e]) => e !== ""));
					o({ props: Object.keys(n).length ? n : void 0 });
				}
			})] }),
			/* @__PURE__ */ V(uc, {
				label: E("Load Scripts"),
				options: a("scripts", ...i.scripts ?? []),
				value: i.scripts ?? [],
				onChange: (e) => s("scripts", e)
			}),
			/* @__PURE__ */ V(uc, {
				label: E("Load Styles"),
				options: a("styles", ...i.styles ?? []),
				value: i.styles ?? [],
				onChange: (e) => s("styles", e)
			})
		]
	});
}
function mc({ node: e }) {
	let { store: t, types: n } = U(), r = e.logic ?? {}, i = rc(e), a = (n) => {
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
	return /* @__PURE__ */ H(je, { children: [
		/* @__PURE__ */ V("datalist", {
			id: sc,
			children: [...i, ...i.map((e) => `!${e}`)].map((e) => /* @__PURE__ */ V("option", { value: e }, e))
		}),
		/* @__PURE__ */ V(bi, {
			title: E("State"),
			empty: !r.data,
			open: !!r.data,
			actions: /* @__PURE__ */ V(ki, {
				label: E("Add Variable"),
				onClick: () => {
					let e = "open", t = 1;
					for (; e in o;) e = `value${t++}`;
					a({ data: {
						...o,
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
					label: E("Variables"),
					key: { strip: "[^a-zA-Z0-9_]" },
					join: "=",
					item: {
						handle: "value",
						type: "text",
						size: "sm",
						commit: "blur",
						label: E("Value"),
						mono: !0
					}
				}],
				values: { data: Object.fromEntries(Object.entries(o).map(([e, t]) => [e, ac(t)])) },
				onChange: (e, t) => a({ data: Object.fromEntries(Object.entries(t).map(([e, t]) => [e, e in o && ac(o[e]) === t ? o[e] : ic(t ?? "")])) })
			})
		}),
		/* @__PURE__ */ H(bi, {
			title: E("Events"),
			empty: !r.on?.length && !r.init?.length,
			open: !!r.on?.length || !!r.init?.length,
			actions: /* @__PURE__ */ V(ki, {
				label: E("Add Event"),
				onClick: () => a({ on: [...r.on ?? [], {
					event: "click",
					actions: []
				}] })
			}),
			children: [
				r.init && /* @__PURE__ */ V(gc, {
					title: E("Page Loads"),
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
					return /* @__PURE__ */ V(gc, {
						title: /* @__PURE__ */ V(Z, {
							bare: !0,
							className: "min-w-0 flex-1",
							fields: [{
								handle: "trigger",
								type: "group",
								component: "blocks-group",
								label: E("Event"),
								fields: [{
									handle: "event",
									type: "select",
									size: "sm",
									label: E("Event"),
									required: !0,
									options: ec().filter((e) => e.value !== "init")
								}, {
									handle: "key",
									type: "text",
									size: "sm",
									commit: "blur",
									label: E("Keyboard Key"),
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
				!r.init && (r.on?.length ?? 0) > 0 && /* @__PURE__ */ V(Oi, {
					onClick: () => a({ init: [] }),
					children: E("When the Page Loads")
				})
			]
		}),
		/* @__PURE__ */ H(bi, {
			title: E("Bindings"),
			empty: !r.show && !r.states && !r.text && !r.attrs,
			open: !!(r.show || r.states || r.text || r.attrs),
			children: [
				/* @__PURE__ */ V(Z, {
					fields: [oc("show", E("Show When"), {
						placeholder: E("Always"),
						status: r.show ? "own" : void 0,
						reset: () => a({
							show: void 0,
							transition: void 0
						})
					}), ...cc(r.show, {
						handle: "transition",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: E("Transition"),
						options: [
							{
								value: "none",
								label: E("None")
							},
							{
								value: "fade",
								label: E("Fade")
							},
							{
								value: "scale",
								label: E("Scale")
							},
							{
								value: "collapse",
								label: E("Collapse")
							}
						]
					})],
					values: {
						show: r.show,
						transition: r.transition ?? "none"
					},
					onChange: (e, t) => a(e === "show" ? { show: t || void 0 } : { transition: t && t !== "none" ? t : void 0 })
				}),
				/* @__PURE__ */ V(Si, {
					title: E("States"),
					action: /* @__PURE__ */ V(ki, {
						label: E("Add State"),
						onClick: () => a({ states: {
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
						label: E("States"),
						key: {
							prefix: "data-",
							lower: !0,
							strip: "[^a-z0-9-]",
							className: "!w-[38%] !flex-none"
						},
						join: E("when"),
						item: oc("expr", E("When||condition"))
					}],
					values: { states: r.states },
					onChange: (e, t) => a({ states: t })
				}),
				/* @__PURE__ */ V(Z, {
					fields: [oc("text", E("Text"), {
						placeholder: E("As Designed"),
						status: r.text ? "own" : void 0,
						reset: () => a({ text: void 0 })
					})],
					values: { text: r.text },
					onChange: (e, t) => a({ text: t || void 0 })
				}),
				/* @__PURE__ */ V(Si, {
					title: E("Attributes"),
					action: /* @__PURE__ */ V(ki, {
						label: E("Bind Attribute"),
						onClick: () => a({ attrs: {
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
						label: E("Attributes"),
						key: {
							options: lc,
							className: ""
						},
						item: oc("expr", E("Value"))
					}],
					values: { attrs: r.attrs },
					onChange: (e, t) => a({ attrs: t })
				}),
				e.type === "input" && /* @__PURE__ */ V(Z, {
					fields: [{
						handle: "model",
						type: "select",
						size: "sm",
						label: E("Input Value"),
						placeholder: E("Not kept"),
						options: i,
						status: r.model ? "own" : void 0,
						reset: () => a({ model: void 0 })
					}],
					values: { model: r.model },
					onChange: (e, t) => a({ model: t || void 0 })
				})
			]
		}),
		/* @__PURE__ */ H(bi, {
			title: E("Behaviors"),
			empty: !r.behaviors && !r.component && !l,
			open: !!r.behaviors || !!r.component || l,
			children: [
				/* @__PURE__ */ V(hc, {
					on: !!c.scroll,
					label: E("Scroll States"),
					onToggle: (e) => a({ behaviors: {
						...c,
						scroll: e ? { threshold: 20 } : void 0
					} }),
					fields: [{
						handle: "threshold",
						type: "text",
						component: "blocks-value",
						label: E("After||a distance"),
						unit: "",
						prefix: "px"
					}, {
						handle: "hide",
						type: "toggle",
						size: "sm",
						label: E("Add data-hidden While Scrolling Down")
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
				/* @__PURE__ */ V(hc, {
					on: !!c.spy,
					label: E("Scroll Spy"),
					onToggle: (e) => a({ behaviors: {
						...c,
						spy: e ? { offset: 96 } : void 0
					} })
				}),
				/* @__PURE__ */ V(hc, {
					on: !!c.group,
					label: E("Hover Group"),
					onToggle: (e) => a({ behaviors: {
						...c,
						group: e || void 0
					} })
				}),
				/* @__PURE__ */ V(hc, {
					on: !!c.menu,
					label: E("Menu"),
					onToggle: (e) => a({ behaviors: {
						...c,
						menu: e ? {} : void 0
					} })
				}),
				/* @__PURE__ */ V(hc, {
					on: !!c.carousel,
					label: E("Carousel"),
					onToggle: (e) => a({ behaviors: {
						...c,
						carousel: e ? {} : void 0
					} })
				}),
				/* @__PURE__ */ V(hc, {
					on: !!c.marquee,
					label: E("Marquee"),
					onToggle: (e) => a({ behaviors: {
						...c,
						marquee: e ? { speed: 60 } : void 0
					} }),
					fields: [
						{
							handle: "speed",
							type: "text",
							component: "blocks-value",
							label: E("Speed"),
							unit: "",
							prefix: "px/s",
							title: E("Pixels per Second")
						},
						{
							handle: "reverse",
							type: "toggle",
							size: "sm",
							label: E("Reverse")
						},
						{
							handle: "pause",
							type: "toggle",
							size: "sm",
							label: E("Pause on Hover")
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
				v("site.code") && /* @__PURE__ */ V(pc, { node: e }),
				/* @__PURE__ */ V(Z, {
					fields: [{
						handle: "component",
						type: "text",
						size: "sm",
						commit: "blur",
						label: E("Alpine"),
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
		s && /* @__PURE__ */ V(bi, {
			title: E("Load Into"),
			open: !!r.target,
			empty: !r.target && !r.merge,
			children: /* @__PURE__ */ V(Z, {
				fields: [
					{
						handle: "target",
						type: "json",
						component: "blocks-nodes",
						label: E("Update"),
						exclude: e.id,
						add: E("Element to Update"),
						addValue: e.id
					},
					...cc(r.target, {
						handle: "push",
						type: "toggle",
						size: "sm",
						label: E("Update the Address Bar")
					}),
					{
						handle: "merge",
						type: "select",
						size: "sm",
						label: E("When Loaded"),
						placeholder: E("Replace It"),
						options: [
							{
								value: "replace",
								label: E("Replace It")
							},
							{
								value: "update",
								label: E("Replace What Is Inside")
							},
							{
								value: "append",
								label: E("Add to the End")
							},
							{
								value: "prepend",
								label: E("Add to the Start")
							},
							{
								value: "morph",
								label: E("Morph (Keep State)")
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
function hc({ on: e, label: t, onToggle: n, fields: r, values: i, onChange: a }) {
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
function gc({ title: e, mods: t, onMods: n, actions: r, onActions: i, onRemove: a, variables: o, node: s }) {
	return /* @__PURE__ */ H("div", {
		className: "space-y-1.5 rounded-sm border border-border p-1.5",
		children: [
			/* @__PURE__ */ H("div", {
				className: "flex items-center gap-1",
				children: [
					/* @__PURE__ */ V(I, {
						name: "interactive",
						size: 14,
						className: "shrink-0 text-muted"
					}),
					typeof e == "string" ? /* @__PURE__ */ V("span", {
						className: "min-w-0 flex-1 text-xs font-medium [overflow-wrap:anywhere]",
						children: e
					}) : e,
					n && /* @__PURE__ */ V(de, {
						align: "end",
						trigger: /* @__PURE__ */ V(L, {
							icon: "faders",
							label: E("Event Options"),
							size: "xs",
							active: !!t?.length
						}),
						items: tc().map((e) => ({
							label: e.label,
							checked: t?.includes(e.value),
							onSelect: () => n(t?.includes(e.value) ? t.filter((t) => t !== e.value) : [...t ?? [], e.value])
						}))
					}),
					/* @__PURE__ */ V(Ai, {
						onClick: a,
						label: E("Remove Event")
					})
				]
			}),
			t && t.length > 0 && /* @__PURE__ */ V("p", {
				className: "m-0 pl-5 text-2xs text-faint [overflow-wrap:anywhere]",
				children: t.map((e) => tc().find((t) => t.value === e)?.label).join(" · ")
			}),
			/* @__PURE__ */ V(_c, {
				actions: r,
				onChange: i,
				variables: o,
				node: s
			})
		]
	});
}
function _c({ actions: e, onChange: t, variables: n, node: r, depth: i = 0 }) {
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
					/* @__PURE__ */ V(I, {
						name: nc().find((e) => e.value === a.do)?.icon ?? "dot-outline",
						size: 14,
						className: "shrink-0 text-muted"
					}),
					/* @__PURE__ */ V("span", {
						className: "min-w-0 flex-1 text-xs font-medium text-text [overflow-wrap:anywhere]",
						children: nc().find((e) => e.value === a.do)?.label ?? a.do
					}),
					/* @__PURE__ */ V(Ai, {
						onClick: () => t(e.filter((e, t) => t !== s)),
						label: E("Remove Action")
					})
				]
			}), /* @__PURE__ */ V(yc, {
				action: a,
				onChange: (e) => o(s, e),
				variables: n,
				node: r,
				depth: i
			})]
		}, s)), /* @__PURE__ */ V(de, {
			align: "start",
			trigger: /* @__PURE__ */ V(Oi, { children: E("Add Action") }),
			items: nc().map((e) => ({
				label: e.label,
				icon: e.icon,
				onSelect: () => a(e.value)
			}))
		})]
	});
}
var vc = (e) => e === "top" || e === "bottom" ? e : e?.startsWith("#") ? "anchor" : "node";
function yc({ action: e, onChange: n, variables: r, node: i, depth: a }) {
	let { store: o } = U(), s = an(), c = G(o, (n) => e.do === "play" && e.node ? t(n.nodes, e.node) : null), l = {
		handle: "var",
		type: "select",
		size: "sm",
		label: E("Variable"),
		options: r,
		placeholder: E("Variable")
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
			f = [l, oc("value", e.do === "set" ? E("To||set a value") : E("Add||to a number"), { placeholder: e.do === "set" ? "true, 'text', count + 1" : "1" })];
			break;
		case "toggle":
			f = [l];
			break;
		case "if":
			f = [oc("test", E("If"), { placeholder: "open" })];
			break;
		case "play":
			f = [
				u("node", E("Element")),
				{
					handle: "motion",
					type: "select",
					size: "sm",
					label: E("Animation"),
					options: (c?.motion ?? []).map((e) => ({
						value: e.id,
						label: e.name || e.id
					})),
					placeholder: c?.motion?.length ? E("First Animation") : E("No animations on it")
				},
				d("mode", E("Play"), [
					{
						value: "play",
						label: E("Play")
					},
					{
						value: "reverse",
						label: E("Reverse")
					},
					{
						value: "toggle",
						label: E("Toggle")
					},
					{
						value: "restart",
						label: E("Restart")
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
					label: E("To"),
					required: !0,
					options: [
						{
							value: "top",
							label: E("Top of Page")
						},
						{
							value: "bottom",
							label: E("Bottom of Page")
						},
						{
							value: "anchor",
							label: E("Section")
						},
						{
							value: "node",
							label: E("Element")
						}
					]
				},
				{
					handle: "anchor",
					type: "select",
					size: "sm",
					label: E("Section"),
					options: s.map((e) => ({
						value: `#${e.id}`,
						label: e.label
					})),
					placeholder: E("Choose a Section"),
					if: { kind: "anchor" }
				},
				u("node", E("Element"), { if: { kind: "node" } }),
				{
					handle: "offset",
					type: "text",
					component: "blocks-value",
					label: E("Offset"),
					unit: "",
					prefix: "px",
					placeholder: "0",
					title: E("Offset in pixels, e.g. a sticky header’s height")
				}
			], p = {
				kind: vc(e.to),
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
				label: E("Page"),
				placeholder: "/blog/page/2",
				mono: !0
			}, {
				handle: "target",
				type: "json",
				component: "blocks-nodes",
				label: E("Update"),
				addValue: i.id
			}];
			break;
		case "copy":
			f = [oc("value", E("Text"), { placeholder: `'${E("Text to Copy")}'` })];
			break;
		case "go":
			f = [{
				handle: "url",
				type: "url",
				component: "link",
				reference: !0,
				size: "sm",
				label: E("Link"),
				anchors: s,
				newTab: !!e.newTab,
				onNewTab: (e) => n({ newTab: e || void 0 })
			}], m = (e, t) => ({ url: t ?? "" });
			break;
		case "theme":
			f = [d("mode", E("Mode"), [
				{
					value: "toggle",
					label: E("Switch||between two")
				},
				{
					value: "light",
					label: E("Light")
				},
				{
					value: "dark",
					label: E("Dark")
				},
				{
					value: "system",
					label: E("System")
				}
			])], p = { mode: e.mode ?? "toggle" };
			break;
		case "focus":
			f = [u("node", E("Element"))], m = (e, t) => ({ node: t ?? void 0 });
			break;
		case "lock":
			f = [d("on", E("Scrolling"), [{
				value: "on",
				label: E("Lock")
			}, {
				value: "off",
				label: E("Unlock")
			}])], p = { on: e.on === !1 ? "off" : "on" }, m = (e, t) => ({ on: t !== "off" });
			break;
		case "wait":
			f = [{
				handle: "ms",
				type: "text",
				component: "blocks-value",
				label: E("Wait"),
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
				label: E("Event"),
				placeholder: "event-name",
				mono: !0
			}, oc("detail", E("Detail"), { placeholder: "detail" })], m = (e, t) => ({ [e]: e === "detail" ? t || void 0 : t ?? "" });
			break;
		case "run":
			f = [oc("expr", E("Run"), { placeholder: "count = count * 2" })];
			break;
		default: return /* @__PURE__ */ V("p", {
			className: B(Ei, "h-auto whitespace-pre-wrap font-mono [overflow-wrap:anywhere]"),
			children: JSON.stringify(e)
		});
	}
	return /* @__PURE__ */ H("div", {
		className: "space-y-1",
		children: [/* @__PURE__ */ V(Z, {
			fields: f,
			values: p,
			onChange: (e, t) => n(m(e, t))
		}), e.do === "if" && /* @__PURE__ */ H(je, { children: [
			/* @__PURE__ */ V("p", {
				className: "cms-label m-0 pt-1",
				children: E("Then")
			}),
			/* @__PURE__ */ V(_c, {
				actions: e.then ?? [],
				onChange: (e) => n({ then: e }),
				variables: r,
				node: i,
				depth: a + 1
			}),
			/* @__PURE__ */ V("p", {
				className: "cms-label m-0 pt-1",
				children: E("Else")
			}),
			/* @__PURE__ */ V(_c, {
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
var bc = (e) => ({
	appear: E("Appear"),
	scroll: E("Scroll"),
	hover: E("Hover and Press"),
	loop: E("Loop"),
	load: E("Page Load"),
	event: E("On Event")
})[e], xc = "power3.out", Sc = () => [
	{
		name: E("Fade In"),
		group: "appear",
		make: () => ({
			trigger: { type: "appear" },
			steps: [{
				target: "self",
				from: { opacity: 0 },
				duration: .8,
				ease: xc
			}]
		})
	},
	{
		name: E("Fade Up"),
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
				ease: xc
			}]
		})
	},
	{
		name: E("Slide in from Left"),
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
				ease: xc
			}]
		})
	},
	{
		name: E("Scale In"),
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
		name: E("Blur In"),
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
				ease: xc
			}]
		})
	},
	{
		name: E("Reveal (Wipe Up)"),
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
		name: E("Children one by one"),
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
				ease: xc,
				stagger: .08
			}]
		})
	},
	{
		name: E("Words Rise"),
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
				ease: xc,
				stagger: .04
			}]
		})
	},
	{
		name: E("Words Slide Up (Masked)"),
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
		name: E("Parallax"),
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
		name: E("Zoom While Scrolling"),
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
		name: E("Fade Through"),
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
		name: E("Highlight Words"),
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
		name: E("Rotate While Scrolling"),
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
		name: E("Slide Sideways"),
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
		name: E("Lift"),
		group: "hover",
		make: () => ({
			trigger: { type: "hover" },
			steps: [{
				target: "self",
				to: { y: -6 },
				duration: .3,
				ease: xc
			}]
		})
	},
	{
		name: E("Grow"),
		group: "hover",
		make: () => ({
			trigger: { type: "hover" },
			steps: [{
				target: "self",
				to: { scale: 1.04 },
				duration: .35,
				ease: xc
			}]
		})
	},
	{
		name: E("Zoom Image Inside"),
		group: "hover",
		make: () => ({
			trigger: { type: "hover" },
			steps: [{
				target: "children",
				to: { scale: 1.06 },
				duration: .6,
				ease: xc
			}]
		})
	},
	{
		name: E("Press"),
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
		name: E("Float"),
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
		name: E("Spin"),
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
		name: E("Pulse"),
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
		name: E("Intro: Fade Up"),
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
				ease: xc,
				delay: .1
			}]
		})
	},
	{
		name: E("Intro: Words"),
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
				ease: xc,
				stagger: .05
			}]
		})
	},
	{
		name: E("Intro: Children"),
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
				ease: xc,
				stagger: .1
			}]
		})
	},
	{
		name: E("Open (Fade and Scale)"),
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
				ease: xc
			}]
		})
	},
	{
		name: E("Slide in Panel"),
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
				ease: xc,
				stagger: .05
			}]
		})
	}
], Cc = () => ({
	appear: {
		label: E("Appear"),
		icon: "eye"
	},
	scroll: {
		label: E("Scroll"),
		icon: "mouse-scroll"
	},
	hover: {
		label: E("Hover"),
		icon: "hand-pointing"
	},
	press: {
		label: E("Press"),
		icon: "hand-tap"
	},
	load: {
		label: E("Page Load"),
		icon: "rocket"
	},
	loop: {
		label: E("Loop"),
		icon: "refresh"
	},
	event: {
		label: E("On Event"),
		icon: "broadcast"
	}
}), wc = () => ({
	opacity: E("Opacity"),
	x: E("Move X"),
	y: E("Move Y"),
	xPercent: E("Move X %"),
	yPercent: E("Move Y %"),
	z: E("Move Z"),
	scale: E("Scale"),
	scaleX: E("Scale X"),
	scaleY: E("Scale Y"),
	rotate: E("Rotate"),
	rotateX: E("Rotate X (3D)"),
	rotateY: E("Rotate Y (3D)"),
	skewX: E("Skew X"),
	skewY: E("Skew Y"),
	blur: E("Blur"),
	brightness: E("Brightness"),
	grayscale: E("Grayscale"),
	clipPath: E("Clip Path"),
	backgroundColor: E("Fill"),
	color: E("Text Color"),
	borderColor: E("Border Color"),
	borderRadius: E("Radius"),
	boxShadow: E("Shadow"),
	letterSpacing: E("Letter Spacing"),
	transformOrigin: E("Origin"),
	perspective: E("Perspective")
}), Tc = () => [
	{
		value: "power3.out",
		label: E("Smooth Out")
	},
	{
		value: "expo.out",
		label: E("Expo Out")
	},
	{
		value: "power4.inOut",
		label: E("Smooth In-Out")
	},
	{
		value: "power2.out",
		label: E("Gentle Out")
	},
	{
		value: "back.out(1.7)",
		label: E("Overshoot")
	},
	{
		value: "elastic.out(1, 0.4)",
		label: E("Elastic")
	},
	{
		value: "bounce.out",
		label: E("Bounce")
	},
	{
		value: "sine.inOut",
		label: E("Sine In-Out")
	},
	{
		value: "power2.in",
		label: E("Ease In")
	},
	{
		value: "none",
		label: E("Linear")
	},
	{
		value: "cubic-bezier(0.2, 0.8, 0.2, 1)",
		label: E("Signature Ease")
	}
], Ec = (e, t, n = {}) => ({
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
}), Dc = /^\d{1,5}(\.\d{1,2})?(px|rem|vh|svh|lvh|dvh)$/, Oc = [
	"vh",
	"svh",
	"lvh",
	"dvh",
	"px",
	"rem"
], kc = (e, ...t) => e ? t : [], Ac = [
	"heading",
	"paragraph",
	"link",
	"button",
	"quote"
], jc = (e) => {
	let t = e.length + 1;
	for (; e.some((e) => e.id === `m${t}`);) t++;
	return `m${t}`;
}, Mc = (e = "self") => e.startsWith("#") ? E("Another Element") : {
	self: E("This Element"),
	children: E("Children"),
	words: E("Words"),
	lines: E("Lines||of text"),
	chars: E("Letters")
}[e] ?? e;
function Nc({ node: e }) {
	let { store: t } = U(), n = e.motion ?? [], [r, i] = M(n[0]?.id ?? null), a = (n) => t.updateNode(e.id, { motion: n.length ? n : void 0 }, `motion:${e.id}`), o = (e, t) => a(n.map((n) => n.id === e ? {
		...n,
		...t
	} : n)), s = Ac.includes(e.type), c = Cc(), l = (t) => {
		let r = jc(n), o = t ? {
			id: r,
			name: t.name,
			...t.make()
		} : {
			id: r,
			name: E("Custom"),
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
		a([...n, o]), i(r), requestAnimationFrame(() => wr.emit("preview-motion", {
			node: e.id,
			motion: o
		}));
	}, u = Sc(), d = [...new Set(u.map((e) => e.group))];
	return /* @__PURE__ */ V(bi, {
		title: E("Animations"),
		empty: n.length === 0,
		actions: /* @__PURE__ */ V(de, {
			align: "end",
			trigger: /* @__PURE__ */ V(L, {
				icon: "plus",
				label: E("Add Animation"),
				size: "xs"
			}),
			items: [
				...d.flatMap((e) => [{
					label: bc(e),
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
					label: E("Custom Animation"),
					icon: "animated",
					onSelect: () => l()
				}
			]
		}),
		children: n.map((t) => /* @__PURE__ */ H("div", {
			className: B("rounded-sm border", r === t.id ? "border-border-strong" : "border-border"),
			children: [/* @__PURE__ */ H("div", {
				className: "flex h-8 items-center gap-1.5 pl-2 pr-1",
				children: [
					/* @__PURE__ */ V(I, {
						name: c[t.trigger.type]?.icon ?? "animated",
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
							children: t.name || c[t.trigger.type]?.label
						}), /* @__PURE__ */ V("span", {
							className: "shrink-0 font-normal text-faint",
							children: c[t.trigger.type]?.label
						})]
					}),
					/* @__PURE__ */ V(xe, {
						content: E("Preview Animation"),
						children: /* @__PURE__ */ V(L, {
							icon: "play",
							label: E("Preview Animation"),
							title: void 0,
							size: "xs",
							onClick: () => wr.emit("preview-motion", {
								node: e.id,
								motion: t
							})
						})
					}),
					/* @__PURE__ */ V(Ai, {
						onClick: () => a(n.filter((e) => e.id !== t.id)),
						label: E("Remove Animation")
					})
				]
			}), r === t.id && /* @__PURE__ */ V(Pc, {
				node: e,
				motion: t,
				onChange: (e) => o(t.id, e)
			})]
		}, t.id))
	});
}
function Pc({ node: e, motion: t, onChange: n }) {
	let [r, i] = M(0), a = Cc(), o = t.trigger, s = (e) => n({ trigger: {
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
		label: E("Name")
	}, {
		handle: "type",
		type: "select",
		size: "sm",
		label: E("Trigger"),
		required: !0,
		options: Object.entries(a).map(([e, t]) => ({
			value: e,
			label: t.label
		}))
	}], f = [
		...kc(o.type === "appear", {
			handle: "start",
			type: "select",
			size: "sm",
			label: E("Starts"),
			placeholder: E("A little into view"),
			options: [
				{
					value: "top 95%",
					label: E("As soon as it peeks in")
				},
				{
					value: "top 85%",
					label: E("A little into view")
				},
				{
					value: "top 65%",
					label: E("A third into view")
				},
				{
					value: "center center",
					label: E("At the Center")
				}
			]
		}, {
			handle: "replay",
			type: "toggle",
			size: "sm",
			label: E("Reverse When Scrolled Back")
		}),
		...kc(o.type === "scroll", {
			handle: "start",
			type: "select",
			size: "sm",
			label: E("Begins"),
			placeholder: E("Enters the Screen"),
			options: [
				{
					value: "top bottom",
					label: E("Enters the Screen")
				},
				{
					value: "top 80%",
					label: E("Top at 80%")
				},
				{
					value: "top center",
					label: E("Top at Center")
				},
				{
					value: "top top",
					label: E("Top at Top")
				},
				{
					value: "center center",
					label: E("Centered")
				}
			]
		}, {
			handle: "end",
			type: "select",
			size: "sm",
			label: E("Ends"),
			placeholder: E("Leaves the Screen"),
			options: [
				{
					value: "bottom top",
					label: E("Leaves the Screen")
				},
				{
					value: "center center",
					label: E("Centered")
				},
				{
					value: "top top",
					label: E("Top at Top")
				},
				{
					value: "bottom center",
					label: E("Bottom at Center")
				},
				{
					value: "bottom bottom",
					label: E("Bottom at Bottom")
				}
			]
		}, {
			handle: "pin",
			type: "text",
			component: "blocks-value",
			label: E("Pin Distance"),
			unit: "vh",
			units: Oc,
			step: 10,
			min: 0,
			max: 99999,
			placeholder: "0"
		}, Ec("scrub", E("Smoothing"), { max: 3 })),
		...kc(l, {
			handle: "repeat",
			type: "select",
			display: "segmented",
			block: !0,
			size: "sm",
			label: E("Repeat||again"),
			required: !0,
			options: [
				{
					value: "0",
					label: E("Once")
				},
				{
					value: "1",
					label: E("Twice")
				},
				{
					value: "-1",
					label: E("Forever||repeat")
				}
			]
		}, {
			handle: "yoyo",
			type: "toggle",
			size: "sm",
			label: E("Back and Forth")
		}, {
			handle: "hold",
			type: "number",
			size: "sm",
			label: E("Loop as a Timeline, Resting (s)"),
			if: { repeat: "-1" }
		}),
		...kc(o.type === "scroll" || o.type === "appear", {
			handle: "watch",
			type: "select",
			component: "blocks-node",
			label: E("Watch"),
			placeholder: E("This Element"),
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
		e === "name" ? n({ name: t ?? "" }) : e === "type" ? t && s({ type: t }) : e === "start" || e === "end" ? s({ [e]: t ?? void 0 }) : e === "pin" ? s({ pin: typeof t == "string" && Dc.test(t.trim()) && parseFloat(t) > 0 ? t.trim() : void 0 }) : e === "scrub" ? s({ scrub: parseFloat(t) > 0 ? Math.min(3, Math.max(.05, parseFloat(t))) : void 0 }) : e === "replay" ? s({ once: !t && void 0 }) : e === "repeat" ? n({ repeat: Number(t ?? 0) }) : e === "yoyo" ? n({ yoyo: t || void 0 }) : e === "hold" ? n({ hold: t === "" || t == null ? void 0 : Number(t) }) : e === "watch" && s({ node: t ? `#${t}` : void 0 });
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
				children: [/* @__PURE__ */ V(Ci, { field: {
					handle: "on",
					type: "select",
					label: E("Plays On")
				} }), /* @__PURE__ */ V("div", {
					role: "group",
					"aria-label": E("Plays On"),
					className: "flex gap-0.5",
					children: [
						[
							"desktop",
							"monitor",
							E("Desktop")
						],
						[
							"tablet",
							"tablet",
							E("Tablet")
						],
						[
							"mobile",
							"phone",
							E("Phone")
						]
					].map(([e, t, r]) => /* @__PURE__ */ V(L, {
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
					children: E("Animation ID")
				}), /* @__PURE__ */ V("code", {
					className: "select-all font-mono text-text",
					children: t.id
				})]
			}),
			/* @__PURE__ */ V(Lc, {
				steps: t.steps,
				active: u,
				onSelect: i,
				onChange: c,
				onAdd: g
			}),
			t.steps[u] && /* @__PURE__ */ V(Rc, {
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
function Fc(e) {
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
var Ic = (e) => Math.max(0, Math.round(e * 20) / 20);
function Lc({ steps: e, active: t, onSelect: n, onChange: r, onAdd: i }) {
	let a = Fc(e), o = Math.max(.5, ...a.map((e) => e.start + e.duration + e.spread)), s = j(null), c = s.current?.total ?? Math.ceil(o * 2 + .25) / 2, l = c <= 1.5 ? .25 : c <= 4 ? .5 : c <= 10 ? 1 : 2, u = Array.from({ length: Math.floor(c / l) + 1 }, (e, t) => t * l), d = (e) => `${e / c * 100}%`, f = (t, i, a) => {
		t.preventDefault(), t.stopPropagation(), n(i);
		let o = t.currentTarget.closest("[data-track]");
		if (!o) return;
		s.current = {
			total: c,
			width: o.clientWidth
		};
		let l = t.clientX, u = e[i], d = a === "move" ? u.at === void 0 ? u.delay ?? 0 : u.at : u.duration ?? .6, f = (e) => {
			let t = (e.clientX - l) / s.current.width * s.current.total;
			a === "end" ? r(i, { duration: Math.max(.05, Ic(d + t)) }) : u.at === void 0 ? r(i, { delay: Ic(d + t) || void 0 }) : r(i, { at: Ic(d + t) });
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
					children: E("Timeline")
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
							children: Mc(e.target)
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
								"aria-label": E("Step {n}", { n: i + 1 }),
								"aria-valuenow": o.start,
								"aria-valuetext": E("Starts at {start}s, runs {duration}s", {
									start: o.start.toFixed(2),
									duration: o.duration.toFixed(2)
								}),
								onPointerDown: (e) => f(e, i, "move"),
								onKeyDown: (t) => {
									if (t.key !== "ArrowLeft" && t.key !== "ArrowRight") return;
									t.preventDefault();
									let n = t.key === "ArrowRight" ? .05 : -.05;
									t.shiftKey ? r(i, { duration: Math.max(.05, Ic((e.duration ?? .6) + n)) }) : e.at === void 0 ? r(i, { delay: Ic((e.delay ?? 0) + n) || void 0 }) : r(i, { at: Ic(e.at + n) });
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
			/* @__PURE__ */ V(Oi, {
				size: "xs",
				onClick: i,
				className: "ml-24 mt-0.5 !w-auto",
				children: E("Add Step")
			})
		]
	});
}
function Rc({ node: e, step: t, index: n, count: r, onChange: i, onRemove: a }) {
	let { catalog: o } = U(), s = X(), c = s.of("color").find((e) => !/-\d+$/.test(e.name) && e.name !== "black" && e.name !== "white")?.ref ?? "currentColor", l = t.target ?? "self", u = wc(), d = Object.keys(o.motion?.properties ?? u), f = Ac.includes(e.type), p = (e) => {
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
						children: E(e === "from" ? "From" : "To||end value")
					}), /* @__PURE__ */ V(de, {
						align: "end",
						trigger: /* @__PURE__ */ V(L, {
							icon: "plus",
							label: E(e === "from" ? "Add a Start Property" : "Add an End Property"),
							size: "xs"
						}),
						items: d.filter((e) => !(e in n)).map((e) => ({
							label: u[e] ?? e,
							onSelect: () => r(e, o.motion.properties[e] === "css" ? e === "clipPath" ? "inset(0% 0% 0% 0%)" : c : e === "opacity" || e.startsWith("scale") ? "1" : "0")
						}))
					})]
				}),
				Object.keys(n).length === 0 && /* @__PURE__ */ V("p", {
					className: "m-0 text-2xs text-faint",
					children: E(e === "from" ? "As it looks now" : "As Designed")
				}),
				/* @__PURE__ */ V(Z, {
					bare: !0,
					fields: [{
						handle: e,
						type: "json",
						component: "blocks-pairs",
						className: "items-start",
						label: E(e === "from" ? "From" : "To||end value"),
						labels: u,
						item: {
							handle: "value",
							type: "text",
							component: "blocks-value",
							label: E("Value"),
							unit: ""
						},
						items: Object.fromEntries(Object.keys(n).map((e) => [e, {
							handle: "value",
							type: "text",
							component: "blocks-value",
							label: E("Value"),
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
						children: r > 1 ? E("Step {n}", { n: n + 1 }) : E("Animate")
					}),
					/* @__PURE__ */ V("span", { className: "flex-1" }),
					r > 1 && /* @__PURE__ */ V(Ai, {
						onClick: a,
						label: E("Remove Step")
					})
				]
			}),
			/* @__PURE__ */ V(Z, {
				fields: [
					{
						handle: "target",
						type: "select",
						size: "sm",
						label: E("Target"),
						required: !0,
						options: [
							{
								value: "self",
								label: E("This Element")
							},
							{
								value: "children",
								label: E("Each Child in Turn")
							},
							...f ? [
								{
									value: "words",
									label: E("Each Word")
								},
								{
									value: "lines",
									label: E("Each Line")
								},
								{
									value: "chars",
									label: E("Each Letter")
								}
							] : [],
							{
								value: "other",
								label: E("Another Element")
							}
						]
					},
					...kc(l.startsWith("#"), {
						handle: "element",
						type: "select",
						component: "blocks-node",
						label: E("Element")
					}),
					...kc(l === "words" || l === "chars", {
						handle: "mask",
						type: "toggle",
						size: "sm",
						label: E("Rise from Behind a Line")
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
			/* @__PURE__ */ V(Z, {
				fields: [
					Ec("duration", E("Duration")),
					Ec("delay", E("Delay")),
					...kc(l !== "self", Ec("stagger", E("Stagger"), { step: .01 })),
					...kc(r > 1, Ec("at", E("Starts At||time"), { placeholder: E("After") })),
					{
						handle: "ease",
						type: "text",
						component: "ease",
						label: E("Ease"),
						placeholder: E("Smooth Out"),
						options: [...s.of("ease").map((e) => ({
							value: e.ref,
							label: e.name,
							curve: e.value
						})), ...Tc()]
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
var zc = [
	"content",
	"design",
	"interact"
], Bc = "cms.block.tab";
function Vc(e) {
	if (!e.scrollTop) return null;
	let t = e.getBoundingClientRect().top, n = [...e.querySelectorAll("[data-section]")].find((e) => e.getBoundingClientRect().bottom > t);
	return {
		section: n?.dataset.section,
		offset: n ? n.getBoundingClientRect().top - t : 0,
		scrollTop: e.scrollTop
	};
}
function Hc(e, t) {
	let n = t.section && e.querySelector(`[data-section="${CSS.escape(t.section)}"]`);
	n ? e.scrollTop += n.getBoundingClientRect().top - e.getBoundingClientRect().top - t.offset : e.scrollTop = t.scrollTop;
}
function Uc() {
	try {
		let e = sessionStorage.getItem(Bc);
		return zc.find((t) => t === e) ?? "content";
	} catch {
		return "content";
	}
}
var Wc = ae(function({ node: e, onBack: t, backLabel: n, onClose: r }) {
	let { store: i, types: a, allowed: o, readOnly: s } = U(), c = a.get(e.type), l = Le(), [u, d] = M(Uc), p = `block-inspector-${ce()}`, [m, h] = M(!1), g = j(null), _ = j(e.id), y = j(null);
	_.current !== e.id && (_.current = e.id, y.current = g.current && Vc(g.current)), le(() => {
		g.current && y.current && Hc(g.current, y.current), y.current = null;
	}, [e.id]);
	let b = (e) => {
		try {
			sessionStorage.setItem(Bc, e);
		} catch {}
		d(e);
	}, x = !s && e.type !== "component" && v("entries.components.create");
	return /* @__PURE__ */ H("div", {
		className: "flex h-full min-h-0 min-w-0 flex-col",
		"data-blocks-inspector": !0,
		children: [
			/* @__PURE__ */ V(ge, {
				bordered: !1,
				onBack: t,
				backLabel: n,
				onClose: r,
				icon: e.type === "component" ? "symbol" : c?.icon ?? "square",
				actions: /* @__PURE__ */ V(de, {
					align: "end",
					trigger: /* @__PURE__ */ V(L, {
						icon: "more",
						label: E("Block Actions"),
						size: "sm"
					}),
					items: [
						{
							label: E("Rename"),
							icon: "edit",
							disabled: s,
							onSelect: () => h(!0)
						},
						{
							label: E("Duplicate"),
							icon: "copy",
							shortcut: "mod+d",
							disabled: s,
							onSelect: () => i.duplicate(e.id)
						},
						x && f(i, a, o) && {
							label: E("Make a Component"),
							icon: "symbol",
							onSelect: () => {
								i.selection().includes(e.id) || i.select(e.id), En(i);
							}
						},
						!s && v("entries.patterns.create") && {
							label: E("Save as Pattern"),
							icon: "section-copy",
							onSelect: () => {
								i.selection().includes(e.id) || i.select(e.id), Dn(i);
							}
						},
						{
							label: E("Copy ID"),
							icon: "hash",
							onSelect: () => void Se(e.id, { copied: E("Copied {reference}", { reference: e.id }) })
						},
						{
							separator: !0,
							label: ""
						},
						{
							label: E("Delete"),
							icon: "trash",
							shortcut: "⌫",
							danger: !0,
							disabled: s,
							onSelect: () => i.remove(e.id)
						}
					]
				}),
				children: m ? /* @__PURE__ */ V("div", {
					className: "min-w-0 flex-1 pl-1",
					onBlur: () => h(!1),
					onKeyUp: (e) => e.key === "Escape" && e.target.blur(),
					children: /* @__PURE__ */ V(Z, {
						bare: !0,
						fields: [{
							handle: "label",
							type: "text",
							size: "sm",
							commit: "blur",
							label: E("Name"),
							autofocus: !0,
							placeholder: c?.title
						}],
						values: { label: e.label ?? "" },
						onChange: (t, n) => i.updateNode(e.id, { label: n.trim() || void 0 })
					})
				}) : /* @__PURE__ */ V(P, {
					variant: "ghost",
					onDoubleClick: () => !s && h(!0),
					className: "min-w-0 flex-1 shrink !justify-start !bg-transparent !pl-1 !pr-0 text-left !font-medium !text-ink",
					title: s ? void 0 : E("Double-Click to Rename"),
					children: /* @__PURE__ */ V("span", {
						className: "truncate",
						children: Re(e, a, l)
					})
				})
			}),
			/* @__PURE__ */ V("div", {
				className: "flex h-10 shrink-0 items-center gap-2 border-b border-border pl-4 pr-3",
				children: /* @__PURE__ */ V(be, {
					id: p,
					value: u,
					onChange: b,
					bordered: !1,
					size: "sm",
					className: "h-full min-w-0 flex-1",
					tabs: zc.map((e) => ({
						value: e,
						label: {
							content: E("Content"),
							design: E("Design"),
							interact: E("Interact")
						}[e]
					}))
				})
			}),
			/* @__PURE__ */ V("fieldset", {
				ref: g,
				role: "tabpanel",
				id: `${p}-${u}-panel`,
				"aria-labelledby": `${p}-${u}`,
				disabled: s || !c && e.type !== "component",
				className: "m-0 min-h-0 min-w-0 flex-1 overflow-y-auto border-0 p-0",
				children: /* @__PURE__ */ H(te, { children: [
					u === "design" && /* @__PURE__ */ V($s, { node: e }),
					u === "content" && /* @__PURE__ */ V(Ba, { node: e }),
					u === "interact" && /* @__PURE__ */ H(je, { children: [/* @__PURE__ */ V(Nc, { node: e }), /* @__PURE__ */ V(mc, { node: e })] })
				] }, e.id)
			})
		]
	});
});
export { Z as $, Ge as $t, ma as A, Nt as At, ta as B, st as Bt, co as C, wr as Ct, Da as D, on as Dt, Ga as E, cn as Et, da as F, zt as Ft, qi as G, gt as Gt, Ui as H, vt as Ht, oa as I, At as It, aa as J, Ke as Jt, Ri as K, it as Kt, Hi as L, Pt as Lt, ua as M, Tt as Mt, fa as N, Et as Nt, Oa as O, an as Ot, ca as P, Ot as Pt, ki as Q, rt as Qt, ia as R, X as Rt, Io as S, Er as St, Ka as T, ln as Tt, Ki as U, _t as Ut, Wi as V, ct as Vt, ra as W, ht as Wt, Ii as X, q as Xt, Ji as Y, tt as Yt, Gi as Z, K as Zt, Go as _, Lr as _t, Hs as a, G as an, di as at, Ho as b, kr as bt, ks as c, W as cn, Qr as ct, ws as d, Kr as dt, $e as en, Ai as et, xs as f, Jr as ft, Jo as g, Pr as gt, vs as h, Fr as ht, Ps as i, Be as in, Ei as it, ba as j, Dt as jt, ha as k, Qt as kt, Ss as l, Le as ln, Gr as lt, bs as m, Ir as mt, Zs as n, Ue as nn, bi as nt, Is as o, Ie as on, ni as ot, _s as p, Rr as pt, ea as q, Ye as qt, Qs as r, ze as rn, Di as rt, Ns as s, Re as sn, Xr as st, Wc as t, We as tn, Ci as tt, Cs as u, U as un, qr as ut, Qo as v, Tr as vt, qa as w, xn as wt, Ro as x, Dr as xt, zo as y, Ar as yt, na as z, ut as zt };
