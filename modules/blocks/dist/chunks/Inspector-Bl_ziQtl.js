import { a as e, c as t, d as n, f as r, g as i, h as a, i as o, l as s, m as c, n as l, o as u, p as d, r as f, t as p, u as m, v as h, y as g } from "./insert-C2qFyCIH.js";
import { can as _, invalidate as v, navigate as y, plural as b, registry as x, requestText as ee, run as te, t as S, useAbility as C, useManifest as ne, useManifestIfLoaded as w } from "@letterncms/sdk";
import { Button as re, Dialog as ie, Fields as T, Icon as E, IconButton as D, Menu as O, Popover as k, QueryError as ae, Spinner as oe, Tabs as se, Tooltip as A, cn as j, deviceWidths as ce, fieldControlId as le, fieldVisible as ue, prompt as de, slugify as fe, toast as pe, wideFieldTypes as me } from "@letterncms/ui";
import { Fragment as he, createContext as M, createElement as ge, memo as _e, useCallback as ve, useContext as ye, useEffect as N, useId as be, useLayoutEffect as xe, useMemo as Se, useRef as P, useState as F, useSyncExternalStore as Ce } from "react";
import { Fragment as I, jsx as L, jsxs as R } from "react/jsx-runtime";
import { createPortal as we, flushSync as Te } from "react-dom";
import { createRoot as Ee } from "react-dom/client";
// admin/src/core/context.tsx
var De = M(null);
function Oe({ value: e, children: t }) {
	return e.store.setReadOnly(!!e.readOnly), /* @__PURE__ */ L(De.Provider, {
		value: e,
		children: t
	});
}
function z() {
	let e = ye(De);
	if (!e) throw Error("Block editor context missing");
	return e;
}
function ke() {
	let e = C("blocks/types", {}, { staleTime: 3e5 }), t = Se(() => new Map((e.data?.blocks ?? []).map((e) => [e.name, e])), [e.data]);
	return {
		catalog: e.data,
		types: t,
		isLoading: e.isLoading,
		error: e.error,
		retry: () => void e.refetch()
	};
}
function Ae() {
	let e = C("patterns/list", {}, { staleTime: 6e4 });
	return Se(() => new Map((e.data ?? []).map((e) => [e.handle, e.title])), [e.data]);
}
function je(e, t, n) {
	return e.label || (e.type === "pattern" ? n.get(String(e.props?.ref ?? "")) : void 0) || t.get(e.type)?.title || e.type;
}
function Me() {
	let e = C("design/get", {}, {
		staleTime: 6e4,
		retry: !1
	});
	return Se(() => {
		let t = e.data;
		return {
			available: !!t,
			theme: t?.theme,
			resolved: t?.resolved,
			catalog: t?.catalog,
			templates: t?.templates ?? {},
			names: (e) => {
				let n = t?.catalog.properties[e];
				return n ? [...n.keywords ?? [], ...n.tokens.filter((e) => !(n.keywords ?? []).includes(e))] : [];
			},
			property: (e) => t?.catalog.properties[e]
		};
	}, [e.data]);
}
// admin/src/builder/vocab.ts
var Ne = (e) => `${Math.round(e)}`;
function Pe(e, t) {
	if (!t) return "transparent";
	let [n, r] = e.split("/"), i = t.schemes.light, a = (e, t = i.foreground, n = i.background) => `color-mix(in oklab, ${t} ${e}%, ${n})`, o = {
		background: i.background,
		foreground: i.foreground,
		"background-muted": a(4),
		"background-emphasis": a(9),
		surface: a(2.5),
		"foreground-muted": a(i.mix.muted),
		"foreground-subtle": a(i.mix.subtle),
		border: a(13),
		"border-strong": a(i.mix.strong),
		focus: t.palettes.primary?.fill ?? i.foreground,
		scrim: "rgb(0 0 0 / 0.55)",
		shadow: t.palettes.neutral?.shades[950] ?? "#000",
		white: "#ffffff",
		black: "#000000",
		transparent: "transparent",
		current: "currentColor"
	}[n];
	if (!o) {
		let e = n.match(/^([a-z][a-z0-9]*)-(\d{2,3})$/), r = n.match(/^on-([a-z][a-z0-9]*)$/), s = n.match(/^([a-z][a-z0-9]*)-(soft|text)$/);
		o = e && t.palettes[e[1]] ? t.palettes[e[1]].shades[e[2]] : r && t.palettes[r[1]] ? t.palettes[r[1]].on : s && t.palettes[s[1]] ? s[2] === "soft" ? a(14, t.palettes[s[1]].fill) : i.text[s[1]] ?? t.palettes[s[1]].fill : t.palettes[n] ? t.palettes[n].fill : "transparent";
	}
	return r ? `color-mix(in oklab, ${o} ${r}%, transparent)` : o;
}
function Fe(e, t, n) {
	if (!n) return "";
	let r = t.startsWith("-") ? t.slice(1) : t, i = (e) => e ? Math.round(e.min) === Math.round(e.max) ? `${Ne(e.min)}px` : `${Ne(e.min)}–${Ne(e.max)}px` : "";
	if (/^vw-\d+$/.test(r)) return `${r.slice(3)}% ${S("of the width")}`;
	if (/^vh-\d+$/.test(r)) return `${r.slice(3)}% ${S("of the height")}`;
	if (/^\d+\/\d+$/.test(r) && [
		"size",
		"inset",
		"translate"
	].includes(e)) return `${Math.round(Number(r.split("/")[0]) / Number(r.split("/")[1]) * 1e3) / 10}%`;
	switch (e) {
		case "space":
		case "inset":
		case "translate":
		case "size": {
			let e = n.spaceRoles[r] ?? r;
			return n.space[e] ? i(n.space[e]) + (n.spaceRoles[r] ? ` · ${e}` : "") : n.containers[r] ? n.containers[r].replace("rem", " rem") : "";
		}
		case "fontSize": return i(n.sizes[r]);
		case "textStyle": {
			let e = n.textStyles[r];
			return e ? `${e.size} · ${e.weight}` : "";
		}
		case "family": return (n.families[n.fontRoles[r] ?? r] ?? "").split(",")[0].replace(/"/g, "");
		case "radius": return n.radii[r] ?? "";
		case "duration": return n.durations[r] === void 0 ? "" : `${n.durations[r]}ms`;
		case "weight": return n.weights[r] === void 0 ? "" : String(n.weights[r]);
		default: return "";
	}
}
function Ie(e, t, n) {
	let r = [
		"auto",
		"none",
		"full",
		"screen",
		"min",
		"max",
		"fit"
	], i = [
		"narrow",
		"text",
		"content",
		"wide"
	], a = t.filter((t) => n.includes(t) || [
		"size",
		"inset",
		"translate"
	].includes(e) && r.includes(t)), o = t.filter((e) => !a.includes(e)), s = (e) => o.filter(e), c = s((e) => /^v[wh]-\d+$/.test(e)), l = s((e) => /^\d+\/\d+$/.test(e)), u = s((e) => i.includes(e)), d = s((e) => !/^v[wh]-\d+$/.test(e) && !/^\d+\/\d+$/.test(e) && !i.includes(e));
	return [
		{
			label: S("Keywords"),
			names: a
		},
		{
			label: S("Widths"),
			names: e === "size" ? u : []
		},
		{
			label: S(e === "size" || e === "space" || e === "inset" ? "Space steps" : "Steps"),
			names: e === "size" ? d : [...d, ...u]
		},
		{
			label: S("Fractions"),
			names: l
		},
		{
			label: S("Screen"),
			names: c
		}
	].filter((e) => e.names.length);
}
// admin/src/core/store.ts
var Le = class {
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
			breakpoint: "base",
			state: "",
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
	setBreakpoint = (e) => this.set({ breakpoint: e });
	setStyleState = (e) => this.set({ state: e });
	variant = () => Re(this.state.breakpoint, this.state.state);
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
}, B = {
	base: "base",
	tablet: "max-lg",
	mobile: "max-md"
};
function Re(e, t) {
	let n = B[e] ?? e;
	return n === "base" ? t || "base" : t ? `${n}:${t}` : n;
}
function ze(e, t) {
	let n = e === "mobile" ? [
		"mobile",
		"tablet",
		"base"
	] : e === "tablet" ? ["tablet", "base"] : ["base"], r = [];
	if (t) for (let e of n) r.push(Re(e, t));
	return r.push(...n.map((e) => Re(e, ""))), r;
}
function Be(e) {
	if (!e.selected) return [];
	if (!e.head) return [e.selected];
	let t = r(e.nodes, e.selected);
	if (!t) return [e.selected];
	let n = i(e.nodes, t.parentId), a = n.findIndex((t) => t.id === e.selected), o = n.findIndex((t) => t.id === e.head);
	return o < 0 ? [e.selected] : n.slice(Math.min(a, o), Math.max(a, o) + 1).map((e) => e.id);
}
function V(e, t) {
	if (Object.is(e, t)) return !0;
	if (Array.isArray(e) && Array.isArray(t)) return e.length === t.length && e.every((e, n) => Object.is(e, t[n]));
	if (e && t && typeof e == "object" && typeof t == "object") {
		let n = Object.keys(e), r = Object.keys(t);
		return n.length === r.length && n.every((n) => Object.is(e[n], t[n]));
	}
	return !1;
}
function H(e, t) {
	let n = P(null);
	return Ce(e.subscribe, () => {
		let r = t(e.get());
		return n.current && V(n.current.value, r) ? n.current.value : (n.current = { value: r }, r);
	});
}
// admin/src/core/uniqueIds.ts
function U(e, t) {
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
function Ve(e, t, n) {
	let r = P(t);
	r.current = t;
	let [i] = F(() => new Le(U(Array.isArray(e) ? e : [], g), (e) => r.current(e), n)), a = P(e);
	return i.setReadOnly(n), N(() => {
		if (a.current === e) return;
		a.current = e;
		let t = U(Array.isArray(e) ? e : [], g);
		JSON.stringify(t) !== JSON.stringify(i.get().nodes) && i.reset(t);
	}, [i, e]), i;
}
// admin/src/core/caret.ts
function He(e = document) {
	return e.getSelection()?.isCollapsed ?? !0;
}
function W(e, t) {
	let n = e.ownerDocument.getSelection();
	if (!n || n.rangeCount === 0) return null;
	let r = n.getRangeAt(0);
	if (!e.contains(r.startContainer)) return null;
	let i = e.ownerDocument.createRange();
	return i.selectNodeContents(e), t ? i.setEnd(r.startContainer, r.startOffset) : i.setStart(r.endContainer, r.endOffset), i;
}
function G(e) {
	return e ? e.toString().replace(/​/g, "") : "";
}
function Ue(e) {
	return He(e.ownerDocument) && G(W(e, !0)) === "" && !Ge(W(e, !0)).includes("<br");
}
function We(e) {
	return He(e.ownerDocument) && G(W(e, !1)) === "";
}
function Ge(e) {
	if (!e) return "";
	let t = e.startContainer.ownerDocument.createElement("div");
	return t.appendChild(e.cloneContents()), t.innerHTML;
}
function Ke(e) {
	return G(W(e, !0)).length;
}
function K(e) {
	let t = W(e, !0), n = W(e, !1);
	return [Ge(t), Ge(n)];
}
function q(e) {
	let t = Ye(e.ownerDocument);
	return !t || t.top - e.getBoundingClientRect().top < Je(e) * .8;
}
function qe(e) {
	let t = Ye(e.ownerDocument);
	return !t || e.getBoundingClientRect().bottom - t.bottom < Je(e) * .8;
}
function Je(e) {
	let t = parseFloat(e.ownerDocument.defaultView.getComputedStyle(e).lineHeight);
	return Number.isFinite(t) ? t : 20;
}
function Ye(e = document) {
	let t = e.getSelection();
	if (!t || t.rangeCount === 0) return null;
	let n = t.getRangeAt(0).cloneRange(), r = n.getClientRects();
	if (r.length > 0) return r[0];
	let i = e.createElement("span");
	i.textContent = "​", n.insertNode(i);
	let a = i.getBoundingClientRect();
	return i.remove(), a;
}
function Xe(e, t) {
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
function Ze(e) {
	let t = document.createElement("div");
	return t.innerHTML = e, (t.textContent ?? "").length;
}
function Qe(e) {
	return e.replace(/\u200B/g, "").replace(/<(\/?)strike>/g, "<$1s>").replace(/<(\/?)b>/g, "<$1strong>").replace(/<(\/?)i>/g, "<$1em>").replace(/<div><br><\/div>/g, "<br>").replace(/<\/?(div|p|span)[^>]*>/g, "").replace(/ style="[^"]*"/g, "").replace(/&nbsp;/g, " ").replace(/<br>$/, "");
}
var $e = [
	["**", "strong"],
	["__", "strong"],
	["~~", "s"],
	["`", "code"],
	["*", "em"],
	["_", "em"]
];
function et(e = document) {
	let t = e.getSelection();
	if (!t || !t.isCollapsed || t.rangeCount === 0) return !1;
	let n = t.anchorNode;
	if (!n || n.nodeType !== Node.TEXT_NODE || n.parentElement?.closest("code")) return !1;
	let r = t.anchorOffset, i = (n.textContent ?? "").slice(0, r);
	for (let [a, o] of $e) {
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
function tt() {
	let { store: e } = z(), t = H(e, (e) => e.nodes), n = /* @__PURE__ */ new Map(), r = [];
	for (let { node: e } of s(t)) {
		let t = String(e.props?.text ?? "").replace(/<[^>]+>/g, "").trim(), i = e.props?.anchor || e.anchor || "";
		if (!i && e.type === "heading" && t) {
			let e = fe(t) || "section", r = (n.get(e) ?? 0) + 1;
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
function nt({ html: e, onChange: t, tag: n = "div", placeholder: r, className: i = "", focus: a, onKeyDown: o, onFocus: s, onPaste: c, disabled: l, singleLine: u, quiet: d, plainText: f }) {
	let p = P(null), m = P(e);
	xe(() => {
		let t = p.current;
		t && (t.ownerDocument.activeElement === t ? m.current = e : (Qe(t.innerHTML) !== e && (t.innerHTML = e), m.current = Qe(t.innerHTML)));
	}, [e]), xe(() => {
		a && p.current && Xe(p.current, a.at);
	}, [a?.nonce]);
	let h = () => {
		let e = p.current;
		if (!e) return;
		let n = Qe(e.innerHTML);
		n !== m.current && (m.current = n, t(n, e));
	};
	return ge(n, {
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
			!f && t.inputType === "insertText" && t.data && /[*_~`]/.test(t.data) && et(e.currentTarget.ownerDocument), h();
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
			}[e.key.toLowerCase()]), h()) : n && e.shiftKey && e.key.toLowerCase() === "x" ? (e.preventDefault(), t.execCommand("strikeThrough"), h()) : n && e.key.toLowerCase() === "k" ? (e.preventDefault(), e.stopPropagation(), p.current?.ownerDocument.dispatchEvent(new CustomEvent("cms:link"))) : n && e.key.toLowerCase() === "e" ? (e.preventDefault(), rt("code", t), h()) : e.key === "Enter" && e.shiftKey && !u ? (e.preventDefault(), t.execCommand("insertLineBreak"), h()) : p.current && o?.(e, p.current);
		},
		onPaste: (e) => {
			e.preventDefault();
			let t = e.currentTarget.ownerDocument, n = e.clipboardData.getData("text/plain");
			!f && /^(https?:\/\/|mailto:)\S+$/i.test(n.trim()) && !t.getSelection()?.isCollapsed ? (t.execCommand("createLink", !1, n.trim()), h()) : p.current && c?.(n, p.current) || (t.execCommand("insertText", !1, u ? n.replace(/\s*\n\s*/g, " ") : n), h());
		},
		onBlur: () => h()
	});
}
function rt(e, t = document) {
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
function it(e) {
	return {
		...e,
		type: "url",
		component: "link"
	};
}
// admin/src/core/FormatToolbar.tsx
function at({ root: e = document, offset: t }) {
	let [n, r] = F(null), [i, a] = F({}), [o, s] = F(!1), [c, l] = F(""), u = P(null), d = P(null), f = P(() => {}), p = tt();
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
		rt(t, e), d.current?.dispatchEvent(new Event("input", { bubbles: !0 })), e.dispatchEvent(new Event("selectionchange"));
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
	}, v = (e, t, n, r) => /* @__PURE__ */ L(A, {
		content: t,
		shortcut: n,
		children: /* @__PURE__ */ L("button", {
			type: "button",
			"aria-label": t,
			"aria-pressed": !!i[e] || e === "link" && o,
			onMouseDown: (e) => e.preventDefault(),
			onClick: r,
			className: j("grid size-7 place-items-center rounded-xs hover:bg-white/12 hover:text-ink-contrast", i[e] || e === "link" && o ? "bg-white/14 text-ink-contrast" : "text-ink-contrast/75"),
			children: /* @__PURE__ */ L(E, {
				name: e,
				size: 14
			})
		})
	}, e), y = () => {
		s(!1);
		let t = d.current, n = e.getSelection();
		t && u.current && n && (t.focus({ preventScroll: !0 }), n.removeAllRanges(), n.addRange(u.current));
	}, b = it({
		handle: "url",
		label: S("Link"),
		size: "sm",
		autofocus: !0,
		anchors: p,
		placeholder: S("Paste a link or search pages"),
		onClose: y
	});
	return we(/* @__PURE__ */ R("div", {
		className: "fixed z-[70] flex -translate-x-1/2 -translate-y-full items-center gap-0.5 rounded-md bg-ink p-1 shadow-pop",
		style: {
			left: n.x,
			top: n.y - 8
		},
		onMouseDown: (e) => !o && e.preventDefault(),
		onKeyDown: (e) => e.key === "Escape" && y(),
		children: [
			v("bold", S("Bold"), "mod+b", () => m("bold")),
			v("italic", S("Italic"), "mod+i", () => m("italic")),
			v("underline", S("Underline"), "mod+u", () => m("underline")),
			v("strike", S("Strikethrough"), "mod+shift+x", () => m("strikeThrough")),
			v("code", S("Code"), "mod+e", () => h("code")),
			/* @__PURE__ */ L("span", { className: "mx-0.5 h-4 w-px bg-white/15" }),
			v("link", S("Link"), "mod+k", g),
			o && /* @__PURE__ */ L("div", {
				className: "pointer-events-none absolute inset-0 opacity-0",
				"aria-hidden": !0,
				children: /* @__PURE__ */ L(T, {
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
function ot(e, t, n) {
	return t >= 0 && t < e ? "choose" : n ? "wait" : "pass";
}
function st(e, t) {
	return e > 0 ? "choose" : t ? "wait" : "release";
}
function ct(e, t) {
	return e && !t;
}
// admin/src/core/Inserter.tsx
var lt = (e) => e.replace(/[-_]+/g, " ").replace(/(^|\s)\S/g, (e) => e.toUpperCase());
function ut(e, t, n, r = !0) {
	let i = C("patterns/list", {}, { staleTime: 6e4 }), { catalog: a } = ke();
	return {
		items: Se(() => {
			let o = a?.categories ?? [], s = (e) => {
				let t = o.findIndex((t) => t.name === e);
				return t < 0 ? o.length : t;
			}, c = (e) => o.find((t) => t.name === e)?.label ?? lt(e), l = t.trim().toLowerCase(), u = (e) => e.toLowerCase().includes(l), d = e.filter((e) => n ? n(e) : !e.parent).filter((e) => !l || u(e.title) || u(e.name) || (e.keywords ?? []).some(u)).sort((e, t) => s(e.category) - s(t.category) || (s(e.category) === o.length ? c(e.category).localeCompare(c(t.category)) : 0)), f = (e) => {
				let t = e.title.toLowerCase();
				return t === l ? 0 : t.startsWith(l) ? 1 : u(e.title) ? 2 : 3;
			}, p = (l ? [...d].sort((e, t) => f(e) - f(t)) : d).map((e) => ({
				kind: "block",
				type: e,
				group: l ? S("Blocks") : c(e.category)
			})), m = (t) => {
				let r = e.find((e) => e.name === t);
				return !!r && (n ? n(r) : !r.parent);
			}, h = (r ? i.data ?? [] : []).filter((e) => e.synced ? m("pattern") : e.blocks.length > 0 && e.blocks.every((e) => m(e.type))).filter((e) => !l || u(e.title) || u(e.category) || u(e.description)).sort((e, t) => Number(t.synced) - Number(e.synced)).map((e) => ({
				kind: "pattern",
				pattern: e,
				group: e.synced ? S("Components") : S("Sections")
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
function dt({ types: e, query: t, onQuery: n, onChoose: r, onClose: i, allowed: a, showSearch: o = !0, className: s, style: c, compact: l, chooseFirst: u, onNoMatch: d, patterns: f = !0, keyboardDocument: p }) {
	let { items: m, loading: h } = ut(e, t, a, f), [g, _] = F(0), v = P(null);
	N(() => _(0), [t]);
	let y = P({
		items: m,
		active: g,
		loading: h
	});
	y.current = {
		items: m,
		active: g,
		loading: h
	};
	let b = P(!!u);
	N(() => {
		if (!b.current) return;
		let e = st(m.length, h);
		e !== "wait" && (b.current = !1, e === "choose" ? r(m[0]) : d?.());
	}, [m, h]), xe(() => {
		let e = (e) => {
			let { items: t, active: n, loading: a } = y.current;
			if (e.key === "ArrowDown") e.preventDefault(), _((e) => Math.min(t.length - 1, e + 1));
			else if (e.key === "ArrowUp") e.preventDefault(), _((e) => Math.max(0, e - 1));
			else if (e.key === "Enter") {
				let i = ot(t.length, n, a);
				i !== "pass" && (e.preventDefault(), e.stopPropagation(), i === "choose" ? r(t[n]) : b.current = !0);
			} else e.key === "Escape" && (e.preventDefault(), i?.());
		};
		return window.addEventListener("keydown", e, !0), p?.addEventListener("keydown", e, !0), () => {
			window.removeEventListener("keydown", e, !0), p?.removeEventListener("keydown", e, !0);
		};
	}, [
		r,
		i,
		p
	]), N(() => {
		v.current?.querySelector(`[data-index="${g}"]`)?.scrollIntoView({ block: "nearest" });
	}, [g]);
	let x = "";
	return /* @__PURE__ */ R("div", {
		className: j("flex max-h-[min(420px,60vh)] w-[300px] flex-col", s),
		style: c,
		children: [o && /* @__PURE__ */ L("div", {
			className: "border-b border-border p-1.5",
			children: /* @__PURE__ */ L(T, {
				bare: !0,
				fields: [{
					handle: "query",
					type: "text",
					label: S("Search"),
					icon: "search",
					size: "sm",
					autofocus: !0,
					placeholder: S("Search blocks and components…")
				}],
				values: { query: t },
				onChange: (e, t) => n?.(t ?? "")
			})
		}), /* @__PURE__ */ R("div", {
			ref: v,
			className: "min-h-0 flex-1 overflow-y-auto p-1",
			children: [m.length === 0 && /* @__PURE__ */ L("div", {
				className: "px-3 py-6 text-center text-xs text-faint",
				children: S("No matching blocks")
			}), m.map((e, t) => {
				let n = e.group === x ? null : e.group;
				x = e.group;
				let i = e.kind === "block" ? e.type.title : e.pattern.title, a = e.kind === "block" ? e.type.description : e.pattern.description || (e.pattern.synced ? S("Component") : S("Section")), o = e.kind === "block" ? e.type.icon : e.pattern.synced ? "symbol" : "pattern";
				return /* @__PURE__ */ R("div", { children: [n && /* @__PURE__ */ L("div", {
					className: "cms-label px-2 pb-1 pt-2",
					children: n
				}), /* @__PURE__ */ R("button", {
					type: "button",
					"data-index": t,
					onMouseMove: () => t !== g && _(t),
					onMouseDown: (e) => e.preventDefault(),
					onClick: () => r(e),
					className: j("flex w-full items-center gap-2.5 rounded-sm px-2 text-left", l ? "h-8" : "py-1.5", t === g ? "bg-hover" : ""),
					children: [/* @__PURE__ */ L("span", {
						className: "grid size-7 shrink-0 place-items-center rounded-xs border border-border bg-surface text-muted",
						children: /* @__PURE__ */ L(E, {
							name: o,
							size: 14
						})
					}), /* @__PURE__ */ R("span", {
						className: "min-w-0",
						children: [/* @__PURE__ */ L("span", {
							className: "block truncate text-sm font-medium text-text",
							children: i
						}), !l && a && /* @__PURE__ */ L("span", {
							className: "block truncate text-xs text-faint",
							children: a
						})]
					})]
				})] }, e.kind === "block" ? e.type.name : `p-${e.pattern.handle}`);
			})]
		})]
	});
}
// admin/src/core/SavePattern.tsx
function ft(e, t) {
	let n = e.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 56) || "pattern", r = n;
	for (let e = 2; t.has(r); e++) r = `${n}-${e}`;
	return r;
}
function pt(e, n) {
	let r = e.selection().map((n) => t(e.get().nodes, n)).filter((e) => !!e);
	if (r.length === 0) return;
	let i = document.createElement("div");
	document.body.appendChild(i);
	let a = Ee(i);
	function o() {
		let [t, o] = F(!0), [s, c] = F({
			title: "",
			category: "",
			description: "",
			synced: n
		}), { title: l, category: u, description: d, synced: f } = s, p = (e, t) => c((n) => ({
			...n,
			[e]: t ?? ""
		})), [m, h] = F(!1), _ = () => {
			o(!1), setTimeout(() => {
				a.unmount(), i.remove();
			}, 250);
		}, y = async () => {
			if (l.trim()) {
				h(!0);
				try {
					let t = await te("patterns/list"), n = ft(l, new Set(t.map((e) => e.handle)));
					await te("patterns/save", {
						handle: n,
						title: l.trim(),
						description: d.trim(),
						category: u.trim() || void 0,
						synced: f,
						blocks: r
					}), v("patterns/"), f && e.replaceSelection([{
						id: g(),
						type: "pattern",
						props: { ref: n }
					}]), pe.success(S(f ? "“{title}” is now a component" : "Saved “{title}” as a section", { title: l.trim() })), _();
				} catch (e) {
					pe.error(e), h(!1);
				}
			}
		};
		return /* @__PURE__ */ L(ie, {
			open: t,
			onOpenChange: (e) => !e && _(),
			size: "sm",
			title: S(f ? "Make a Component" : "Save as a Section"),
			description: b(r.length, "{count} block, reusable on every page", "{count} blocks, reusable on every page"),
			footer: /* @__PURE__ */ R(I, { children: [/* @__PURE__ */ L(re, {
				variant: "ghost",
				onClick: _,
				children: S("Cancel")
			}), /* @__PURE__ */ L(re, {
				variant: "primary",
				disabled: !l.trim(),
				loading: m,
				onClick: y,
				children: S(f ? "Make Component" : "Save Section")
			})] }),
			children: /* @__PURE__ */ R("form", {
				className: "grid gap-4",
				onSubmit: (e) => {
					e.preventDefault(), y();
				},
				children: [
					/* @__PURE__ */ L(T, {
						fields: [
							{
								handle: "title",
								type: "text",
								label: S("Name"),
								required: !0,
								autofocus: !0,
								max: 120,
								placeholder: S("Pricing Card")
							},
							{
								handle: "category",
								type: "text",
								label: S("Category"),
								max: 60,
								placeholder: S(f ? "Components" : "Sections")
							},
							{
								handle: "description",
								type: "text",
								label: S("Description"),
								max: 500,
								placeholder: S("When to Use It")
							}
						],
						values: s,
						onChange: p
					}),
					/* @__PURE__ */ L(T, {
						disabled: !n,
						fields: [{
							handle: "synced",
							type: "toggle",
							label: S(n ? "Keep Every Copy in Sync" : "Saved as a section: components can’t be placed here"),
							instructions: n ? S("Off: a section that is copied when inserted.") : void 0
						}],
						values: s,
						onChange: (e, t) => p(e, !!t)
					}),
					/* @__PURE__ */ L("button", {
						type: "submit",
						hidden: !0
					})
				]
			})
		});
	}
	a.render(/* @__PURE__ */ L(o, {}));
}
// admin/src/core/insertionTargets.ts
var mt = 4, ht = 6, gt = 16, _t = (e) => e.left + e.width, J = (e) => e.top + e.height, vt = (e, t) => t === "x" ? e.left + e.width / 2 : e.top + e.height / 2, yt = (e, t) => t === "x" ? e.left : e.top, bt = (e, t) => t === "x" ? _t(e) : J(e), xt = (e) => [
	e.left,
	e.top,
	e.width,
	e.height
].every(Number.isFinite) && e.width > 0 && e.height >= 0, St = (e, t) => t.x >= e.left && t.x <= _t(e) && t.y >= e.top && t.y <= J(e);
function Ct(e, t) {
	return Math.hypot(Math.max(e.left - t.x, 0, t.x - _t(e)), Math.max(e.top - t.y, 0, t.y - J(e)));
}
function wt(e, t) {
	return Math.min(J(e), J(t)) - Math.max(e.top, t.top) > 0 && Math.abs(vt(t, "x") - vt(e, "x")) > Math.abs(vt(t, "y") - vt(e, "y")) ? "x" : "y";
}
function Tt(e, t, n) {
	let r = Math.min(J(e), J(t)) - Math.max(e.top, t.top), i = Math.min(_t(e), _t(t)) - Math.max(e.left, t.left);
	return n === "x" && r > 0 ? "x" : n === "y" && i > 0 ? "y" : wt(e, t);
}
function Et(e, t) {
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
function Dt(e, t) {
	let { byId: n, depth: r, isExcluded: i } = Et(e, t.excludeIds), a = /* @__PURE__ */ new Map([[null, []]]);
	for (let t of e) {
		if (!xt(t.rect) || !t.container && t.rect.height === 0 || i(t)) continue;
		let e = a.get(t.parentId) ?? [];
		e.push(t), a.set(t.parentId, e), t.container && !a.has(t.id) && a.set(t.id, []);
	}
	let o = [];
	for (let [e, i] of a) {
		let a = e === null ? null : n.get(e), s = e === null ? t.rootRect : a?.rect;
		if (!s || !xt(s)) continue;
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
			let f = Math.sign(i - r), p = Math.min(Math.abs(i - r) / 2, mt), m = l === "from" ? r + f * p : l === "to" ? i - f * p : (r + i) / 2, h = Math.min(r, i), g = Math.abs(i - r), _ = n === "x" ? {
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
				width: Math.max(_t(e), _t(t)) - n,
				height: Math.max(J(e), J(t)) - r
			};
		}, m = c[0], h = c.at(-1), g = c.length > 1 ? Tt(m.rect, c[1].rect, l) : l ?? "y", _ = c.length > 1 ? Tt(c.at(-2).rect, h.rect, l) : l ?? "y", v = c.length < 2 || vt(c[1].rect, g) >= vt(m.rect, g), y = c.length < 2 || vt(h.rect, _) >= vt(c.at(-2).rect, _), b = v ? yt(m.rect, g) : bt(m.rect, g), x = y ? bt(h.rect, _) : yt(h.rect, _);
		f(m.index, g, v ? yt(s, g) : bt(s, g), b, g === "x" ? m.rect : s, m.rect, "edge", "to");
		for (let e = 1; e < c.length; e++) {
			let t = c[e - 1], n = c[e], r = Tt(t.rect, n.rect, l), i = vt(n.rect, r) >= vt(t.rect, r), a = i ? bt(t.rect, r) : yt(t.rect, r), o = i ? yt(n.rect, r) : bt(n.rect, r), u = Math.max(t.rect.top, n.rect.top), d = Math.min(J(t.rect), J(n.rect)), m = r === "x" ? {
				left: s.left,
				top: u,
				width: s.width,
				height: Math.max(0, d - u)
			} : s, h = i ? o < a : o > a;
			f(n.index, r, h ? (a + o) / 2 : a, h ? (a + o) / 2 : o, m, r === "x" && m.height > 0 ? m : p(t.rect, n.rect), "between");
		}
		f(h.index + 1, _, x, y ? bt(s, _) : yt(s, _), _ === "x" ? h.rect : s, h.rect, "edge", "from");
	}
	return o;
}
function Ot(e, t, n) {
	if (![t.x, t.y].every(Number.isFinite)) return null;
	let r = Dt(e, n).flatMap((e) => {
		if (e.inside) return [];
		let n = e.axis === "x", r = n ? t.x : t.y, i = n ? t.y : t.x, a = (n ? e.rect.left : e.rect.top) + 1, o = n ? e.hitRect.left : e.hitRect.top, s = n ? e.hitRect.width : e.hitRect.height, c = Math.max(0, ht - s / 2), l = Math.max(o - c, a - gt), u = Math.min(o + s + c, a + gt), d = n ? e.hitRect.top : e.hitRect.left, f = d + (n ? e.hitRect.height : e.hitRect.width);
		return r >= l && r <= u && i >= d && i <= f ? [{
			target: e,
			distance: Math.abs(r - a)
		}] : [];
	});
	if (!r.length) return null;
	let i = Math.min(...r.map((e) => e.distance));
	return r.filter((e) => e.distance <= i + 2).sort((e, t) => Number(e.target.kind === "edge") - Number(t.target.kind === "edge") || t.target.depth - e.target.depth || e.distance - t.distance)[0].target;
}
function kt(e, t, n) {
	if (![t.x, t.y].every(Number.isFinite)) return null;
	let { isExcluded: r } = Et(e, n.excludeIds);
	return e.some((e) => r(e) && St(e.rect, t)) ? null : Dt(e, n).map((e) => ({
		target: e,
		distance: Ct(e.inside ? e.hitRect : e.rect, t)
	})).filter(({ distance: e }) => e <= (n.maxDistance ?? 80)).sort((e, t) => e.distance - t.distance || t.target.depth - e.target.depth)[0]?.target ?? null;
}
// admin/src/core/QuickInserter.tsx
var At = "cms:blocks:recent", jt = [
	"paragraph",
	"heading",
	"image",
	"list",
	"button",
	"box"
], Mt = 6, Nt = 9, Pt = 3;
function Ft() {
	try {
		let e = JSON.parse(localStorage.getItem(At) ?? "[]");
		return Array.isArray(e) ? e.filter((e) => typeof e == "string") : [];
	} catch {
		return [];
	}
}
function It(e) {
	if (e.kind === "block") try {
		localStorage.setItem(At, JSON.stringify([e.type.name, ...Ft().filter((t) => t !== e.type.name)].slice(0, 12)));
	} catch {}
}
function Lt({ types: e, allowed: t, onChoose: n, onClose: r }) {
	let [i, a] = F(""), [o, s] = F(!1), [c, l] = F(0), { items: u } = ut(e, i, t, !!i.trim()), d = Se(() => {
		if (i.trim()) return u.slice(0, Nt);
		let e = [...Ft(), ...jt], t = (t) => {
			let n = t.kind === "block" ? e.indexOf(t.type.name) : -1;
			return n < 0 ? e.length : n;
		};
		return u.filter((e) => e.kind === "block").sort((e, n) => t(e) - t(n)).slice(0, Mt);
	}, [u, i]);
	N(() => l(0), [i]);
	let f = (e) => {
		It(e), n(e);
	};
	return o ? /* @__PURE__ */ L("div", {
		"data-cms-insert-menu": !0,
		"data-cms-browse": !0,
		children: /* @__PURE__ */ L(dt, {
			types: e,
			query: i,
			onQuery: a,
			allowed: t,
			onChoose: f,
			onClose: r
		})
	}) : /* @__PURE__ */ R("div", {
		"data-cms-insert-menu": !0,
		className: "flex w-[300px] flex-col",
		onKeyDown: (e) => {
			let t = {
				ArrowRight: 1,
				ArrowLeft: -1,
				ArrowDown: Pt,
				ArrowUp: -3
			}[e.key];
			t && d.length ? (e.preventDefault(), l((e) => Math.max(0, Math.min(d.length - 1, e + t)))) : e.key === "Enter" && d[c] ? (e.preventDefault(), f(d[c])) : e.key === "Escape" && (e.preventDefault(), r());
		},
		children: [
			/* @__PURE__ */ L("div", {
				className: "p-2 pb-0",
				children: /* @__PURE__ */ L(T, {
					bare: !0,
					fields: [{
						handle: "query",
						type: "text",
						label: S("Search"),
						icon: "search",
						size: "sm",
						autofocus: !0,
						placeholder: S("Search blocks and components…")
					}],
					values: { query: i },
					onChange: (e, t) => a(t ?? "")
				})
			}),
			/* @__PURE__ */ R("div", {
				role: "listbox",
				"aria-label": i.trim() ? S("Results") : S("Suggestions"),
				className: "grid grid-cols-3 gap-1 p-2",
				children: [d.map((e, t) => {
					let n = e.kind === "block" ? e.type.title : e.pattern.title, r = e.kind === "block" ? e.type.icon : e.pattern.synced ? "symbol" : "pattern";
					return /* @__PURE__ */ R("button", {
						type: "button",
						role: "option",
						"aria-selected": t === c,
						"data-index": t,
						onMouseMove: () => t !== c && l(t),
						onMouseDown: (e) => e.preventDefault(),
						onClick: () => f(e),
						className: j("flex h-[68px] min-w-0 flex-col items-center justify-center gap-1.5 rounded-sm px-1 text-text", t === c && "bg-hover"),
						children: [/* @__PURE__ */ L(E, {
							name: r,
							size: 20
						}), /* @__PURE__ */ L("span", {
							className: "w-full truncate text-center text-xs font-medium",
							children: n
						})]
					}, e.kind === "block" ? e.type.name : `p-${e.pattern.handle}`);
				}), !d.length && /* @__PURE__ */ L("div", {
					className: "col-span-3 px-3 py-5 text-center text-xs text-faint",
					children: S("No matching blocks")
				})]
			}),
			/* @__PURE__ */ R("button", {
				type: "button",
				onMouseDown: (e) => e.preventDefault(),
				onClick: () => s(!0),
				className: "cms-focus-ring flex h-9 shrink-0 items-center justify-center gap-1.5 border-t border-border text-sm font-medium text-text hover:bg-hover",
				children: [S("Browse All"), /* @__PURE__ */ L(E, {
					name: "arrow-right",
					size: 14,
					className: "text-muted"
				})]
			})
		]
	});
}
// admin/src/core/morph.ts
function Rt(e, t) {
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
function zt(e) {
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
var Bt = 32, Vt = 6, Ht = 4;
function Ut({ target: e, position: t, ...n }) {
	let r = t(e.rect);
	return /* @__PURE__ */ R(I, { children: [/* @__PURE__ */ L("div", {
		"data-cms-insertion-line": !0,
		className: j("pointer-events-none absolute z-10 rounded-full bg-focus", e.axis === "x" ? "cms-block-line-y" : "cms-block-line-x"),
		style: {
			...r,
			minWidth: 2,
			minHeight: 2
		}
	}), /* @__PURE__ */ L(Kt, {
		...n,
		label: S("Add Block"),
		className: "cms-block-plus absolute size-6 -translate-x-1/2 -translate-y-1/2 rounded-xs bg-focus text-white shadow-sm",
		style: {
			left: r.left + r.width / 2,
			top: r.top + r.height / 2
		},
		data: { "data-cms-inserter": `${e.parentId ?? ""}:${e.index}` }
	})] });
}
function Wt({ target: e, position: t, ...n }) {
	let r = t(e.hitRect);
	return /* @__PURE__ */ L(Kt, {
		...n,
		label: S("Add Block"),
		className: "cms-block-chrome absolute size-7 -translate-x-1/2 -translate-y-1/2 rounded-sm border border-border-strong bg-bg text-muted shadow-sm hover:border-focus hover:text-focus",
		style: {
			left: r.left + r.width / 2,
			top: r.top + Math.min(r.height / 2, 40)
		},
		data: { "data-cms-appender": e.parentId ?? "" }
	});
}
function Gt({ target: e, position: t, onWrite: n, ...r }) {
	let i = t(e.hitRect);
	return /* @__PURE__ */ R("div", {
		"data-cms-document-appender": !0,
		className: "cms-block-chrome pointer-events-auto absolute z-10 flex h-10 whitespace-nowrap -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-md border border-dashed border-border-strong bg-bg/90 py-1 pl-3 pr-1 shadow-sm",
		style: {
			left: i.left + i.width / 2,
			top: i.top + Math.max(24, Math.min(i.height / 2, 120))
		},
		children: [n && /* @__PURE__ */ L("button", {
			type: "button",
			onClick: n,
			className: "cms-focus-ring h-8 rounded-xs px-1 text-sm text-muted hover:text-text",
			children: S("Write, or press “/” for blocks")
		}), /* @__PURE__ */ L(Kt, {
			...r,
			label: S("Add Block"),
			className: "size-8 rounded-xs text-muted hover:bg-hover hover:text-text"
		})]
	});
}
function Kt({ open: e, onOpenChange: t, returnFocus: n, children: r, label: i, className: a, style: o, data: s }) {
	return /* @__PURE__ */ L(k, {
		open: e,
		onOpenChange: t,
		side: "bottom",
		align: "center",
		className: "!overflow-hidden !p-0",
		returnFocus: n,
		trigger: /* @__PURE__ */ L("button", {
			type: "button",
			...s,
			"aria-label": e ? S("Close") : i,
			"aria-expanded": e,
			className: j("cms-focus-ring pointer-events-auto z-20 grid place-items-center", a),
			style: o,
			children: /* @__PURE__ */ L(E, {
				name: "plus",
				size: 14,
				className: j("cms-block-plus-icon", e && "rotate-45")
			})
		}),
		children: e && r
	});
}
function qt({ id: e, label: t, icon: n, parent: r, box: i, viewport: a, canMoveUp: o, canMoveDown: s, onSelectParent: c, onDrag: l, onMove: u, onInsert: d, onDuplicate: f, onMakeComponent: p, onDelete: m, covers: h }) {
	let g = P(null), [_, v] = F(240);
	xe(() => {
		g.current && v(g.current.offsetWidth);
	});
	let y = i.top + i.height;
	if (y < 40 || i.top > a.height - Bt || i.left > a.width || i.left + i.width < 0) return null;
	let b = (e) => Math.max(Ht, Math.min(a.width - _ - Ht, e)), x = b(i.left), ee = b(i.left + i.width - _), te = i.top - Bt - Vt, C = y + Vt, ne = Math.max(Ht, i.top + Ht), w = (e) => e >= Ht && e + Bt <= a.height - Ht, { left: re, top: ie } = [
		te,
		C,
		ne
	].flatMap((e) => [{
		left: x,
		top: e
	}, {
		left: ee,
		top: e
	}]).find((e) => w(e.top) && !h?.({
		...e,
		width: _,
		height: Bt
	})) ?? {
		left: x,
		top: w(te) ? te : ne
	};
	return /* @__PURE__ */ R("div", {
		ref: g,
		"data-cms-block-controls": e,
		role: "toolbar",
		"aria-label": S("Block Actions"),
		className: "cms-block-chrome pointer-events-auto absolute z-30 flex h-8 items-center gap-0.5 rounded-sm border border-border bg-bg pl-0.5 pr-1 shadow-pop",
		style: {
			left: re,
			top: ie
		},
		children: [
			/* @__PURE__ */ L("button", {
				type: "button",
				"aria-label": S("Drag to Move"),
				title: S("Drag to Move"),
				className: "cms-focus-ring grid h-6 w-4 touch-none cursor-grab place-items-center rounded-xs text-faint hover:bg-hover hover:text-muted active:cursor-grabbing",
				onPointerDown: l,
				children: /* @__PURE__ */ L(E, {
					name: "drag",
					size: 12
				})
			}),
			r && /* @__PURE__ */ L(A, {
				content: S("Select {block}", { block: r.label }),
				children: /* @__PURE__ */ L(D, {
					size: "xs",
					icon: "b-arrow-elbow-left-up",
					label: S("Select {block}", { block: r.label }),
					onClick: c
				})
			}),
			/* @__PURE__ */ L("span", { className: "mx-0.5 h-4 border-l border-border" }),
			/* @__PURE__ */ R("span", {
				className: "flex h-6 max-w-40 items-center gap-1.5 px-1 text-xs font-medium text-text",
				children: [/* @__PURE__ */ L(E, {
					name: n,
					size: 14,
					className: "shrink-0 text-muted"
				}), /* @__PURE__ */ L("span", {
					className: "truncate",
					children: t
				})]
			}),
			/* @__PURE__ */ L(D, {
				size: "xs",
				icon: "chevron-up",
				label: S("Move Up"),
				disabled: !o,
				onClick: () => u(-1)
			}),
			/* @__PURE__ */ L(D, {
				size: "xs",
				icon: "chevron-down",
				label: S("Move Down"),
				disabled: !s,
				onClick: () => u(1)
			}),
			/* @__PURE__ */ L("span", { className: "mx-0.5 h-4 border-l border-border" }),
			/* @__PURE__ */ L(O, {
				align: "end",
				trigger: /* @__PURE__ */ L(D, {
					size: "xs",
					icon: "more",
					label: S("More Block Actions")
				}),
				items: [
					{
						label: S("Insert Before"),
						icon: "arrow-up",
						shortcut: "alt+mod+t",
						onSelect: () => d("before")
					},
					{
						label: S("Insert After"),
						icon: "arrow-down",
						shortcut: "alt+mod+y",
						onSelect: () => d("after")
					},
					{
						label: S("Duplicate"),
						icon: "duplicate",
						shortcut: "mod+d",
						onSelect: f
					},
					p && {
						label: S("Make a Component"),
						icon: "symbol",
						onSelect: p
					},
					{
						separator: !0,
						label: ""
					},
					{
						label: S("Delete"),
						icon: "trash",
						danger: !0,
						shortcut: "⌫",
						onSelect: m
					}
				]
			})
		]
	});
}
function Jt({ drag: e, position: t }) {
	return /* @__PURE__ */ R(I, { children: [
		/* @__PURE__ */ L("div", {
			"data-cms-drag-overlay": !0,
			className: "pointer-events-auto absolute inset-0 z-30 cursor-grabbing touch-none"
		}),
		e.target && /* @__PURE__ */ L("div", {
			"data-cms-drop-indicator": !0,
			className: "pointer-events-none absolute z-40 rounded-full bg-focus",
			style: {
				...t(e.target.rect),
				minWidth: 2,
				minHeight: 2
			}
		}),
		/* @__PURE__ */ R("div", {
			"data-cms-drag-ghost": !0,
			className: "pointer-events-none fixed z-[80] flex max-w-56 items-center gap-2 truncate rounded-sm border border-border-strong bg-bg px-3 py-2 text-xs text-ink shadow-pop",
			style: {
				left: Math.max(8, Math.min(window.innerWidth - 232, e.point.x + 16)),
				top: Math.max(8, Math.min(window.innerHeight - 40, e.point.y + 16))
			},
			children: [/* @__PURE__ */ L(E, {
				name: "drag",
				size: 14
			}), /* @__PURE__ */ L("span", {
				className: "truncate",
				children: e.label
			})]
		})
	] });
}
// admin/src/builder/bus.ts
var Yt = new EventTarget(), Xt = {
	emit(e, t) {
		Yt.dispatchEvent(new CustomEvent(e, { detail: t }));
	},
	on(e, t) {
		let n = (e) => t(e.detail);
		return Yt.addEventListener(e, n), () => Yt.removeEventListener(e, n);
	}
}, Zt = M({
	stops: () => [],
	settings: () => {},
	readOnly: !1
}), Qt = () => ye(Zt);
function $t(e = "") {
	return {
		id: g(),
		type: "paragraph",
		props: { text: e }
	};
}
function en(e, t, n, r) {
	return e.id === t && e.prop === n && (r === void 0 || e.index === r);
}
function tn(e, t, n) {
	e.focus(t.id, n, t.prop, t.index);
}
function nn(e, t, n) {
	if (!t) return;
	let r = /* @__PURE__ */ new Set(), i = (e) => {
		r.add(e.id), e.children?.forEach(i);
	};
	i(t);
	let a = n.find((e) => r.has(e.id));
	a ? tn(e, a, "start") : e.select(t.id, !0);
}
function rn(e) {
	let t = e.getElementById("f-title");
	return t ? (t.focus(), t.setSelectionRange(t.value.length, t.value.length), !0) : !1;
}
function an(e, t, n, r, i) {
	if (e.shiftKey || e.metaKey || e.ctrlKey || e.altKey) return !1;
	let a = e.key === "ArrowUp" && q(t) || e.key === "ArrowLeft" && Ue(t), o = e.key === "ArrowDown" && qe(t) || e.key === "ArrowRight" && We(t);
	if (a) {
		let a = r[i - 1];
		if (a) tn(n, a, "end");
		else if (e.key !== "ArrowUp" || !rn(t.ownerDocument)) return !1;
		return e.preventDefault(), !0;
	}
	if (o) {
		let t = r[i + 1];
		return t ? (e.preventDefault(), tn(n, t, "start"), !0) : !1;
	}
	return !1;
}
// admin/src/write/outline.ts
var on = [
	"paragraph",
	"heading",
	"quote",
	"callout"
];
function sn(e) {
	return e.kind === "actions" ? e.nodes : [e.node];
}
function cn(e) {
	return sn(e)[0].id;
}
function ln(e, t, n) {
	let r = {
		types: t,
		custom: n
	}, i = [];
	for (let t of e) {
		let e = fn(t, null, !1, r), n = e.kind === "container" || e.kind === "columns", a = i.at(-1);
		!n && a && !a.container ? mn(a.rows, e) : i.push({
			id: t.id,
			label: n && t.label?.trim() || null,
			rows: [e],
			container: n
		});
	}
	return i;
}
function un(e) {
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
function dn(e) {
	let t = [], n = (e) => {
		for (let r of e) if (t.push(r), r.kind === "columns") for (let e of r.columns) n(e.rows);
		else r.kind === "container" && n(r.rows);
	};
	for (let t of e) n(t.rows);
	return t;
}
function fn(e, t, n, r) {
	let i = n || !!e.hidden, a = {
		parent: t,
		hidden: i
	}, o = r.types.get(e.type), s = r.custom(e.type), c = (e.children?.length ?? 0) > 0;
	return e.type === "columns" && o && !s ? {
		kind: "columns",
		node: e,
		columns: (e.children ?? []).map((e) => ({
			node: e,
			rows: pn(e.children ?? [], e.id, i || !!e.hidden, r)
		})),
		...a
	} : !s && o && !c && (e.type === "button" || e.type === "link") ? {
		kind: "actions",
		nodes: [e],
		...a
	} : o?.children || c ? {
		kind: "container",
		node: e,
		rows: pn(e.children ?? [], e.id, i, r),
		...a
	} : !o || s ? {
		kind: "block",
		node: e,
		...a
	} : on.includes(e.type) ? {
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
function pn(e, t, n, r) {
	let i = [];
	for (let a of e) mn(i, fn(a, t, n, r));
	return i;
}
function mn(e, t) {
	let n = e.at(-1);
	t.kind === "actions" && n?.kind === "actions" && n.parent === t.parent && n.hidden === t.hidden ? n.nodes.push(...t.nodes) : e.push(t);
}
// admin/src/write/slash.ts
var hn = null, gn = /* @__PURE__ */ new Set();
function _n(e) {
	return hn?.id === e ? hn : null;
}
function vn(e) {
	JSON.stringify(e) !== JSON.stringify(hn) && (hn = e, gn.forEach((e) => e()));
}
function yn() {
	return Ce((e) => (gn.add(e), () => gn.delete(e)), () => hn);
}
function bn(e, t = 360, n = 300) {
	let r = window.innerHeight - e.bottom - 6 - 8, i = e.top - 6 - 8, a = r >= Math.min(t, 220) || r >= i;
	return {
		left: Math.max(8, Math.min(window.innerWidth - n - 8, e.left - 4)),
		top: a ? e.bottom + 6 : void 0,
		bottom: a ? void 0 : window.innerHeight - e.top + 6,
		maxHeight: Math.max(120, Math.min(t, a ? r : i))
	};
}
function xn(e, t) {
	N(() => {
		if (!e) return;
		let n = (e) => !e.target?.closest?.("[data-cms-slash]") && vn(null), r = t.filter((e) => !!e);
		return r.forEach((e) => e.addEventListener("pointerdown", n, !0)), () => r.forEach((e) => e.removeEventListener("pointerdown", n, !0));
	}, [e, ...t]);
}
// admin/src/write/Text.tsx
var Sn = {
	1: "text-[30px] leading-[38px] font-semibold tracking-[-0.02em]",
	2: "text-[24px] leading-[32px] font-semibold tracking-[-0.015em]",
	3: "text-[20px] leading-[28px] font-semibold tracking-[-0.01em]",
	4: "text-[17px] leading-[26px] font-semibold",
	5: "text-[16px] leading-[26px] font-semibold",
	6: "text-[13px] leading-[22px] font-semibold uppercase tracking-[0.04em] text-muted"
}, Cn = "text-[16px] leading-[27px]", wn = {
	note: {
		icon: "info",
		className: "bg-surface",
		label: () => S("Note")
	},
	tip: {
		icon: "sparkle",
		className: "bg-success/7",
		label: () => S("Tip")
	},
	warning: {
		icon: "warning",
		className: "bg-warning/9",
		label: () => S("Warning")
	},
	danger: {
		icon: "error",
		className: "bg-danger/7",
		label: () => S("Danger")
	}
};
function Tn({ node: e }) {
	if (e.type === "quote") return /* @__PURE__ */ R("blockquote", {
		className: "m-0 border-l-[3px] border-text/80 py-0.5 pl-4",
		children: [/* @__PURE__ */ L(On, {
			node: e,
			prop: "text",
			className: "text-[17px] leading-[28px]",
			placeholder: S("Quote")
		}), /* @__PURE__ */ L(On, {
			node: e,
			prop: "cite",
			className: "cms-block-cite mt-1 text-sm text-muted",
			placeholder: S("Attribution"),
			quiet: !0
		})]
	});
	if (e.type === "callout") return /* @__PURE__ */ L(Dn, { node: e });
	if (e.type === "heading") {
		let t = String(e.props.level ?? 2);
		return /* @__PURE__ */ L(On, {
			node: e,
			prop: "text",
			tag: `h${t}`,
			className: Sn[t] ?? Sn[2],
			placeholder: S("Heading {level}", { level: t })
		});
	}
	return /* @__PURE__ */ L(En, { node: e });
}
function En({ node: e }) {
	let { store: t } = z(), n = H(t, (t) => t.nodes.length === 1 && t.nodes[0].id === e.id);
	return /* @__PURE__ */ L(On, {
		node: e,
		prop: "text",
		tag: "p",
		className: Cn,
		placeholder: S("Write, or press “/” for blocks"),
		quiet: !n
	});
}
function Dn({ node: e }) {
	let { store: t } = z(), { readOnly: n } = Qt(), r = wn[e.props.tone] ?? wn.note;
	return /* @__PURE__ */ R("div", {
		className: j("flex gap-3 rounded-md px-4 py-3", r.className),
		children: [/* @__PURE__ */ L(O, {
			align: "start",
			trigger: /* @__PURE__ */ L("button", {
				type: "button",
				disabled: n,
				"aria-label": S("Callout Style"),
				className: "grid h-[27px] w-5 shrink-0 place-items-center rounded-xs text-muted hover:text-text",
				children: /* @__PURE__ */ L(E, {
					name: r.icon,
					size: 17
				})
			}),
			items: Object.entries(wn).map(([n, r]) => ({
				label: r.label(),
				icon: r.icon,
				checked: n === (e.props.tone ?? "note"),
				onSelect: () => t.updateProps(e.id, { tone: n })
			}))
		}), /* @__PURE__ */ L(On, {
			node: e,
			prop: "text",
			className: j(Cn, "min-w-0 flex-1"),
			placeholder: S("Write a note")
		})]
	});
}
function On({ node: e, prop: i, tag: o = "div", className: s, placeholder: c, quiet: l }) {
	let { store: u, types: d, allowed: _ } = z(), { stops: v, readOnly: y } = Qt(), b = H(u, (t) => t.focus?.id === e.id && (t.focus.prop ?? "text") === i ? t.focus : null), x = String(e.props[i] ?? ""), ee = (t, n) => {
		if (e.type === "paragraph" && i === "text" && te(t, n)) return;
		u.updateProps(e.id, { [i]: t }, `text:${e.id}:${i}`);
		let r = e.type === "paragraph" ? t.replace(/<[^>]+>/g, "").match(/^\/([\w-]*)$/) : null;
		vn(r ? {
			id: e.id,
			query: r[1]
		} : null);
	}, te = (n, i) => {
		let a = n.replace(/&nbsp;/g, " "), o = (n, a, o) => {
			let s = r(u.get().nodes, e.id), c = s?.parentId ? t(u.get().nodes, s.parentId) : null;
			if (!d.has(n) || !p(c, n, d, c ? [] : _)) return !1;
			let l = Math.max(0, Ke(i) - Ze(o));
			return u.updateNode(e.id, {
				type: n,
				props: a
			}), u.focus(e.id, l, n === "list" ? "items" : "text", n === "list" ? 0 : void 0), !0;
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
		if (a === "---" && d.has("divider") && (_.length === 0 || _.includes("divider"))) {
			let t = $t(), { nodes: n } = u.get(), i = r(n, e.id);
			return u.commit(m(h(n, e.id, (e) => ({
				...e,
				type: "divider",
				props: {}
			})), i?.parentId ?? null, (i?.index ?? n.length) + 1, [t])), u.focus(t.id, "start"), !0;
		}
		return !1;
	}, S = (o, s) => {
		if (o.defaultPrevented) return;
		let c = v(), l = c.findIndex((t) => en(t, e.id, i)), p = c[l], { nodes: y } = u.get();
		if (o.key === "Enter" && !o.shiftKey && !o.metaKey && !o.ctrlKey && !o.altKey) {
			o.preventDefault();
			let t = _n(e.id);
			if (t && ct(!0, !!document.querySelector("[data-cms-slash]"))) return vn({
				...t,
				enter: !0
			});
			if (i === "cite") {
				let t = $t(), n = f(y, e.id, "paragraph", d, _);
				if (!n) return;
				u.insert(n.parentId, n.index, [t]), u.focus(t.id, "start");
				return;
			}
			let [a, c] = K(s);
			if (n(a) && !n(c)) {
				let t = r(y, e.id);
				if (!t) return;
				u.insert(t.parentId, t.index, [$t()]), u.focus(e.id, "start");
				return;
			}
			let l = e.type === "paragraph" ? {
				id: g(),
				type: "paragraph",
				props: {
					...e.props,
					text: c
				},
				...e.style ? { style: structuredClone(e.style) } : {},
				...e.class ? { class: e.class } : {}
			} : $t(c), p = f(y, e.id, "paragraph", d, _);
			if (!p) return;
			u.commit(m(h(y, e.id, (e) => ({
				...e,
				props: {
					...e.props,
					[i]: a
				}
			})), p.parentId, p.index, [l])), u.focus(l.id, "start");
		} else if (o.key === "Backspace" && Ue(s)) {
			if (i === "cite") {
				n(x) && (o.preventDefault(), u.focus(e.id, "end", "text"));
				return;
			}
			if (e.type !== "paragraph") {
				o.preventDefault(), u.updateNode(e.id, {
					type: "paragraph",
					props: { text: x }
				}), u.focus(e.id, "start");
				return;
			}
			let t = c[l - 1];
			if (!t) return;
			if (o.preventDefault(), n(x)) {
				u.remove(e.id), tn(u, t, "end");
				return;
			}
			if (t.parent === p?.parent && C(t, x)) return;
			tn(u, t, "end");
		} else if (o.key === "Delete" && We(s) && i === "text") {
			let n = c[l + 1], r = n && n.prop === "text" && n.parent === p?.parent ? t(y, n.id) : null;
			if (!r || !["paragraph", "heading"].includes(r.type)) return;
			o.preventDefault();
			let i = Ze(x);
			u.commit(a(h(y, e.id, (e) => ({
				...e,
				props: {
					...e.props,
					text: x + String(r.props.text ?? "")
				}
			})), r.id)), u.focus(e.id, i);
		} else an(o, s, u, c, l) || o.key === "Escape" && (o.preventDefault(), s.blur(), u.select(e.id, !0));
	}, C = (n, r) => {
		let { nodes: i } = u.get(), o = t(i, n.id);
		if (!o) return !1;
		if (n.prop === "items") {
			let t = [...o.props.items ?? [""]], s = t[n.index ?? 0] ?? "";
			return t[n.index ?? 0] = s + r, u.commit(a(h(i, o.id, (e) => ({
				...e,
				props: {
					...e.props,
					items: t
				}
			})), e.id)), tn(u, n, Ze(s)), !0;
		}
		if (n.prop !== "text" || ![
			"paragraph",
			"heading",
			"quote",
			"callout"
		].includes(o.type)) return !1;
		let s = String(o.props.text ?? "");
		return u.commit(a(h(i, o.id, (e) => ({
			...e,
			props: {
				...e.props,
				text: s + r
			}
		})), e.id)), tn(u, n, Ze(s)), !0;
	};
	return /* @__PURE__ */ L(nt, {
		tag: o,
		html: x,
		onChange: ee,
		placeholder: c,
		quiet: l,
		className: s,
		focus: b,
		disabled: y,
		onKeyDown: S,
		onFocus: () => u.get().selected !== e.id && u.select(e.id),
		onPaste: (t) => !t.includes("\n") || i !== "text" ? !1 : (import("./paste-Cw30qtpY.js").then((n) => n.pasteMarkdown(u, e, t, d, _)), !0)
	});
}
function kn({ node: e, renderItem: t }) {
	let { store: i, types: o, allowed: s } = z(), { stops: c, readOnly: l } = Qt(), u = Array.isArray(e.props.items) && e.props.items.length ? e.props.items : [""], d = H(i, (t) => t.focus?.id === e.id && t.focus.prop === "items" ? t.focus : null), p = !!e.props.ordered, g = (t, n = `list:${e.id}`) => i.updateProps(e.id, { items: t }, n), _ = (t) => (l, d) => {
		if (l.defaultPrevented) return;
		let { nodes: p } = i.get(), _ = c(), v = _.findIndex((n) => en(n, e.id, "items", t));
		if (l.key === "Enter" && !l.shiftKey && !l.metaKey && !l.ctrlKey) {
			if (l.preventDefault(), n(u[t]) && t === u.length - 1) {
				let t = $t(), n = u.slice(0, -1), r = f(p, e.id, "paragraph", o, s);
				if (!r) return;
				let c = n.length ? h(p, e.id, (e) => ({
					...e,
					props: {
						...e.props,
						items: n
					}
				})) : p, l = m(c, r.parentId, r.index, [t]);
				i.commit(n.length ? l : a(l, e.id)), i.focus(t.id, "start");
				return;
			}
			let [r, c] = K(d);
			g([
				...u.slice(0, t),
				r,
				c,
				...u.slice(t + 1)
			], ""), i.focus(e.id, "start", "items", t + 1);
		} else if (l.key === "Backspace" && Ue(d)) {
			if (l.preventDefault(), t === 0) {
				let t = $t(u[0]), n = r(p, e.id), o = u.slice(1), s = m(p, n?.parentId ?? null, n?.index ?? 0, [t]);
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
				...u.slice(0, t - 1),
				u[t - 1] + u[t],
				...u.slice(t + 1)
			], ""), i.focus(e.id, Ze(u[t - 1]), "items", t - 1);
		} else an(l, d, i, _, v) || l.key === "Escape" && (l.preventDefault(), d.blur(), i.select(e.id, !0));
	}, v = (n, r) => /* @__PURE__ */ L(nt, {
		html: n,
		className: t ? void 0 : "min-w-0 flex-1 pl-1",
		tag: t ? "span" : "div",
		placeholder: S("List"),
		quiet: !0,
		disabled: l,
		focus: d && (d.index ?? 0) === r ? d : null,
		onChange: (e) => g(u.map((t, n) => n === r ? e : t)),
		onKeyDown: _(r),
		onFocus: () => i.get().selected !== e.id && i.select(e.id)
	});
	return t ? /* @__PURE__ */ L(I, { children: u.map((e, n) => t(n, v(e, n))) }) : /* @__PURE__ */ L("div", {
		className: j(Cn, "space-y-0.5"),
		children: u.map((e, t) => /* @__PURE__ */ R("div", {
			className: "flex",
			children: [/* @__PURE__ */ L("span", {
				className: j("w-6 shrink-0 select-none text-muted", p ? "pr-1.5 text-right tabular-nums" : "pl-1.5"),
				"aria-hidden": !0,
				children: p ? `${t + 1}.` : "•"
			}), v(e, t)]
		}, t))
	});
}
// admin/src/LiveEditor.tsx
var An = (e, t, n) => e.axis === "x" ? {
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
}, jn = (e) => `${e.parentId ?? ""}:${e.index}:${e.inside ? "inside" : e.axis}`, Mn = "\nhtml{scrollbar-width:thin;scrollbar-color:rgb(127 127 127/.35) transparent}\n[data-cms-document][data-cms-node]{cursor:default}\n.cms-block-text{display:block;min-width:1ch;min-height:1lh;white-space:pre-wrap;overflow-wrap:break-word;outline:none;border-radius:0;font:inherit;color:inherit;line-height:inherit;text-align:inherit;cursor:text}\n.cms-block-text:empty::before{content:attr(data-placeholder);opacity:.4;pointer-events:none}\n.cms-block-text[data-quiet]:empty:not(:focus)::before{content:none}\n[data-cms-prop]{cursor:text}\n.cms-block-text::selection,.cms-block-text ::selection{background:rgb(0 122 255/.2)}\nimg,a{-webkit-user-drag:none}\n[data-cms-conditional=hidden]:not([data-cms-reveal]){display:none!important}\n[data-cms-editor-empty-root]{visibility:hidden}\n.cms-js [data-cms-appear]{visibility:visible!important}\n", Nn = /* @__PURE__ */ new Set([
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
function Pn(e, t, n) {
	let r = e.elementFromPoint(t, n);
	if (!r || r === e.body || r === e.documentElement) return !1;
	if (Nn.has(r.tagName) || r.closest("svg")) return !0;
	let i = [...r.childNodes].filter((e) => e.nodeType === Node.TEXT_NODE && e.textContent?.trim());
	if (!i.length) return !1;
	let a = e.createRange();
	return i.some((e) => (a.selectNodeContents(e), [...a.getClientRects()].some((e) => t >= e.left - 2 && t <= e.right + 2 && n >= e.top - 2 && n <= e.bottom + 2)));
}
function Fn({ collection: e, entryId: n, content: a, onInspect: c, standalone: d, onTitleChange: m }) {
	let { store: h, types: g, allowed: v, fieldHandle: y, readOnly: x = !1 } = z(), te = Ae(), C = H(h, (e) => e.nodes), ne = H(h, (e) => e.selected), w = H(h, Be), re = H(h, (e) => e.blockMode), ie = H(h, (e) => e.hovered), T = H(h, (e) => e.breakpoint), E = 1024, D = P(null), O = P(null), [k, se] = F(null), A = P(""), [j, le] = F([]), [ue, de] = F(!0), [fe, pe] = F(null), [me, he] = F(0), [M, ge] = F({
		width: 1024,
		height: 700,
		scale: 1,
		left: 0
	}), [_e, ye] = F([]), [be, Ce] = F(null), [we, Ee] = F([]), [De, Oe] = F(null), ke = P(0), Me = P(""), [Ne, Pe] = F(!1), [Fe, Ie] = F(!1), Le = P(!1), B = P(null), Re = Se(() => {
		let e = [], t = (n, r) => n.forEach((n, i) => {
			e.push({
				node: n,
				parentId: r,
				index: i
			}), n.children && t(n.children, n.id);
		});
		return t(C, null), e;
	}, [C]), ze = P(Re);
	ze.current = Re;
	let [V, U] = F(null), Ve = P(V);
	Ve.current = V;
	let He = P(null);
	N(() => {
		V || (He.current = null);
	}, [V]);
	let W = P(0), G = P({
		busy: !1,
		queued: !1,
		timer: 0,
		alive: !0
	}), Ue = P(async () => {}), We = () => {
		let e = G.current;
		e.queued = !0, !(!e.alive || e.busy || e.timer) && (e.timer = window.setTimeout(() => {
			e.timer = 0, Ue.current();
		}, A.current ? 80 : 0));
	}, Ge = () => ze.current.map(({ node: e, parentId: t, index: n }) => `${t}:${n}:${e.id}:${e.type}:${e.type === "list" ? e.props.items?.length ?? 0 : ""}`).join("|"), Ke = P(null), K = P({
		content: a,
		onInspect: c,
		readOnly: x,
		layout: M,
		onTitleChange: m
	});
	K.current = {
		content: a,
		onInspect: c,
		readOnly: x,
		layout: M,
		onTitleChange: m
	};
	let q = (e, t) => e.querySelector(`[data-cms-document="${A.current}"][data-cms-node="${CSS.escape(t)}"]`) ?? e.querySelector(`[data-cms-proto-document="${A.current}"][data-cms-proto="${CSS.escape(t)}"]`), qe = (e) => {
		let n = "[data-cms-document][data-cms-node],[data-cms-proto-document][data-cms-proto]", r = e?.closest?.(n) ?? null;
		for (; r;) {
			let e = r.dataset.cmsDocument === A.current ? r.dataset.cmsNode : r.dataset.cmsProtoDocument === A.current ? r.dataset.cmsProto : void 0;
			if (e && t(h.get().nodes, e)) return e;
			r = r.parentElement?.closest(n) ?? null;
		}
		return null;
	}, Je = (e) => {
		if (e.ownerDocument.defaultView?.getComputedStyle(e).display !== "contents") return e.getBoundingClientRect();
		let t = e.ownerDocument.createRange();
		return t.selectNodeContents(e), t.getBoundingClientRect();
	}, Ye = () => {
		if (B.current) return B.current;
		let e = O.current?.contentDocument, t = e?.querySelector(`[data-cms-editor-root="${A.current}"]`);
		if (!e || !t) return null;
		let n = (t) => {
			let n = e.defaultView.getComputedStyle(t);
			return n.display.includes("flex") && n.flexDirection.startsWith("row") || n.display.includes("grid") && n.gridTemplateColumns.split(" ").length > 1 ? "x" : "y";
		}, r = new Map([...e.querySelectorAll(`[data-cms-document="${A.current}"][data-cms-node]`)].map((e) => [e.dataset.cmsNode, e])), i = ze.current.flatMap(({ node: t, parentId: i, index: a }) => {
			let o = r.get(t.id);
			return !o || e.defaultView.getComputedStyle(o).display === "none" ? [] : [{
				id: t.id,
				parentId: i,
				index: a,
				rect: Je(o),
				container: !!g.get(t.type)?.children && !["repeat", "pattern"].includes(t.type),
				axis: n(o)
			}];
		}), a = Je(t);
		return a.width === 0 && (a = Je(t.parentElement ?? e.body)), i.length || (a = {
			...a,
			left: a.left,
			top: a.top,
			width: a.width,
			height: Math.max(32, a.height)
		}), B.current = {
			blocks: i,
			rootRect: a,
			scroll: {
				x: e.defaultView.scrollX,
				y: e.defaultView.scrollY
			}
		}, B.current;
	}, Xe = (e, n = ["paragraph"]) => {
		let r = e ? t(h.get().nodes, e) : null;
		return n.every((e) => p(r, e, g, r ? [] : v));
	}, Ze = (e) => [...g.values()].some((t) => Xe(e, [t.name])), Qe = () => {
		let e = /* @__PURE__ */ new Map();
		return (t) => e.get(t) ?? e.set(t, Ze(t)).get(t);
	}, $e = () => {
		let e = O.current?.contentDocument, t = Ye();
		if (!e || !t) return;
		ye(Be(h.get()).flatMap((t) => {
			let n = q(e, t);
			return n ? [Je(n)] : [];
		}));
		let n = h.get().hovered, r = n ? q(e, n) : null;
		Ce(r ? Je(r) : null);
		let i = Dt(t.blocks, {
			rootRect: t.rootRect,
			canInsert: Qe()
		});
		Ee(i), U((t) => {
			if (!t) return t;
			let n = He.current?.key === jn(t) ? He.current : null, r = n ? q(e, n.id) : null, a = n ? r ? An(t, Je(r), n.side) : t : i.find((e) => jn(e) === jn(t)) ?? t, o = a.inside ? a.hitRect.top : a.rect.top;
			return o < 0 || o > K.current.layout.height ? null : a;
		});
	}, et = (e) => {
		let t = e ? jn(e) : "";
		t !== Me.current && (Me.current = t, clearTimeout(ke.current), Oe(null), e && (ke.current = window.setTimeout(() => Oe(e), 80)));
	}, tt = (e) => {
		let t = Be(h.get()), n = t.length ? r(h.get().nodes, e === "before" ? t[0] : t.at(-1)) : null, i = O.current?.contentDocument;
		if (!n || !i || K.current.readOnly || !Ze(n.parentId)) return;
		let a = e === "before" ? n.index : n.index + 1, o = q(i, e === "before" ? t[0] : t.at(-1)), s = o ? Je(o) : null, c = i.defaultView, l = K.current.layout.height;
		if (s) {
			let t = e === "before" ? s.top : s.top + s.height;
			(t < 48 || t > l - 160) && c.scrollBy(0, t - l / 3);
		}
		requestAnimationFrame(() => {
			B.current = null;
			let r = Ye(), i = o ? Je(o) : null;
			if (!i) return;
			let s = An((r && Dt(r.blocks, {
				rootRect: r.rootRect,
				canInsert: Qe()
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
			He.current = {
				key: jn(s),
				id: e === "before" ? t[0] : t.at(-1),
				side: e
			}, et(null), U(s);
		});
	}, nt = () => {
		let e = k?.activeElement;
		if (document.activeElement === O.current && e?.isContentEditable) return e;
		let t = h.get().focus;
		return (t && k ? q(k, t.id) : null)?.querySelector("[data-cms-inline]") ?? null;
	}, rt = (e) => {
		B.current = null;
		let t = [];
		if (K.current.onTitleChange) for (let t of e.querySelectorAll("[data-cms-entry-field=\"title\"]")) t.querySelector("[data-cms-inline]") || t.replaceChildren();
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
		le(t), requestAnimationFrame($e);
	}, it = () => {
		let e = O.current?.contentDocument, t = e?.querySelector("[data-cms-editor-root]");
		if (!e || !t || !A.current) return;
		let n = new Set(s(h.get().nodes).map(({ node: e }) => e.id));
		for (let t of e.querySelectorAll("[data-cms-document][data-cms-node]")) t.dataset.cmsDocument === A.current && !n.has(t.dataset.cmsNode) && t.remove();
		let r = (t, n) => {
			for (let i = 0; i < t.length; i++) {
				let a = t[i], o = q(e, a.id);
				if (!o || o.dataset.cmsType !== a.type) {
					let r = e.querySelector(`template[data-cms-prototype="${CSS.escape(a.type)}"]`)?.content.firstElementChild?.cloneNode(!0);
					if (!r) continue;
					if (r.dataset.cmsNode = a.id, r.dataset.cmsDocument = A.current, o) o.replaceWith(r);
					else {
						let a = t.slice(i + 1).map((t) => q(e, t.id)).find(Boolean), o = t.slice(0, i).reverse().map((t) => q(e, t.id)).find(Boolean);
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
				a.children && !["repeat", "pattern"].includes(a.type) && r(a.children, o);
			}
		};
		h.get().nodes.length && t.querySelector(":scope > [data-cms-editor-empty-root]")?.remove(), r(h.get().nodes, t), rt(e);
	}, ot = Se(() => ({
		stops: () => un(ln(h.get().nodes, g, () => !1)).filter((e) => j.some((t) => t.id === e.id && t.prop === e.prop && (e.index === void 0 || t.index === e.index))),
		settings: (e) => K.current.onInspect(e),
		readOnly: x
	}), [
		h,
		g,
		j,
		x
	]), st = P(ot);
	st.current = ot, xe(() => {
		B.current = null, it();
	}, [C, k]), xe(() => {
		if (!D.current) return;
		let e = () => {
			let e = D.current, t = Math.max(e.clientWidth, E), n = T === "tablet" ? ce.tablet : T === "mobile" ? Math.min(ce.phone, e.clientWidth) : t, r = Math.min(1, e.clientWidth / n);
			B.current = null, ge({
				width: n,
				scale: r,
				height: e.clientHeight / r,
				left: Math.max(0, (e.clientWidth - n * r) / 2)
			});
		};
		e();
		let t = new ResizeObserver(e);
		return t.observe(D.current), () => t.disconnect();
	}, [T, E]), N(() => {
		requestAnimationFrame($e);
	}, [
		ne,
		w,
		ie,
		M,
		k
	]), Ue.current = async () => {
		let t = G.current;
		t.queued = !1, t.busy = !0;
		let r = W.current, i = Ge(), o = new AbortController();
		Ke.current = o;
		try {
			let { text: s, headers: c } = await ee("POST", n ? `/__preview/${n}` : "/__preview", {
				...a,
				collection: e,
				field: y,
				standalone: d,
				data: {
					...a.data,
					[y]: h.get().nodes
				},
				play: !1
			}, { signal: o.signal });
			if (!t.alive || o.signal.aborted || r !== W.current && i !== Ge()) return;
			let l = c.get("X-Cms-Editor-Document");
			if (!l) throw Error(S("The editor could not load its rendering context."));
			let u = new DOMParser().parseFromString(s, "text/html");
			if (!u.querySelector(`[data-cms-editor-root="${l}"]`)) throw Error(S("This template has no content outlet. Choose a template that includes the content field."));
			u.querySelectorAll("script").forEach((e) => {
				e.type = "text/cms-off", e.removeAttribute("src");
			}), A.current = l;
			let f = O.current?.contentDocument;
			f?.documentElement?.hasAttribute("data-cms-bridge-ready") ? (Rt(f, u), f.documentElement.setAttribute("data-cms-bridge-ready", ""), rt(f)) : O.current && (O.current.srcdoc = u.documentElement.outerHTML), r === W.current && pe(null);
		} catch (e) {
			!o.signal.aborted && r === W.current && (pe(e instanceof Error ? e.message : String(e)), de(!1));
		} finally {
			t.busy = !1, t.queued && We();
		}
	}, N(() => {
		W.current++, We();
	}, [
		n,
		e,
		a,
		C,
		y,
		d,
		me
	]), N(() => (G.current.alive = !0, G.current.queued && We(), () => {
		G.current.alive = !1, clearTimeout(G.current.timer), G.current.timer = 0, Ke.current?.abort();
	}), []);
	let ct = (e, t) => {
		let n = l(e, g);
		n.length && !x && Xe(t.parentId, n.map((e) => e.type)) && (h.insert(t.parentId, t.index, n), nn(h, n[0], un(ln(h.get().nodes, g, () => !1))), U(null), et(null));
	}, lt = () => {
		if (K.current.readOnly || !Xe(null)) return;
		let e = $t();
		h.insert(null, 0, [e]), h.focus(e.id, "start");
	}, ut = () => {
		let e = O.current?.contentDocument;
		return e ? ze.current.filter(({ node: t }) => {
			let n = q(e, t.id);
			return !!n && e.defaultView.getComputedStyle(n).display !== "none";
		}).map(({ node: e }) => e.id) : [];
	}, dt = (e) => {
		if (!e) return;
		h.select(e, !0);
		let t = O.current?.contentDocument;
		(t && q(t, e))?.scrollIntoView({ block: "nearest" });
	}, ft = (e) => {
		let n = e.metaKey || e.ctrlKey, r = Be(h.get()), i = h.get().selected;
		if (e.key === "Escape") {
			h.select(null);
			return;
		}
		if (!i || !h.get().blockMode) return;
		let a = ut(), o = a.indexOf(h.get().head ?? i);
		if (["ArrowUp", "ArrowDown"].includes(e.key)) {
			e.preventDefault();
			let t = e.key === "ArrowUp";
			e.altKey ? h.nudgeSelection(t ? -1 : 1) : e.shiftKey ? h.extend(t ? -1 : 1) : dt(a[o + (t ? -1 : 1)]);
		} else if (e.key === "Enter") {
			e.preventDefault();
			let n = t(h.get().nodes, i), r = st.current.stops(), a = n ? new Set(s([n]).map((e) => e.node.id)) : /* @__PURE__ */ new Set();
			r.some((e) => a.has(e.id)) ? nn(h, n, r) : K.current.onInspect(i);
		} else if (e.key === "Backspace" || e.key === "Delete") {
			e.preventDefault();
			let n = new Set(r.flatMap((e) => {
				let n = t(h.get().nodes, e);
				return n ? s([n]).map((e) => e.node.id) : [];
			})), i = a.findIndex((e) => n.has(e)), o = a.slice(0, Math.max(0, i)).reverse().find((e) => !n.has(e)) ?? a.slice(i + 1).find((e) => !n.has(e));
			h.removeSelection(), dt(o);
		} else n && e.key.toLowerCase() === "d" && (e.preventDefault(), h.duplicateSelection());
	}, mt = () => {
		let e = O.current?.contentDocument;
		if (!e || !A.current) return;
		if (!e.querySelector("[data-cms-editor-root]")) {
			de(!1), pe(S("This template has no content outlet. Choose a template that includes the content field."));
			return;
		}
		e.documentElement.setAttribute("data-cms-bridge-ready", "");
		let n = e.createElement("style");
		n.dataset.cmsBridge = "", n.textContent = Mn, e.head.appendChild(n), se(e), rt(e), de(!1), e.addEventListener("submit", (e) => e.preventDefault(), !0), e.addEventListener("dragstart", (e) => e.preventDefault()), e.addEventListener("focusout", (e) => {
			e.target.isContentEditable && Pe(!1), We();
		}), e.addEventListener("focusin", (e) => {
			let t = e.target;
			if (!t.isContentEditable) return;
			Pe(!0);
			let n = t.closest("[data-cms-instance-node],[data-cms-document][data-cms-node]");
			h.select(n?.dataset.cmsInstanceNode ?? n?.dataset.cmsNode ?? null), h.hover(null);
		}), e.addEventListener("pointermove", (e) => {
			if (K.current.readOnly || (Le.current && (e.movementX || e.movementY) && (Le.current = !1, Ie(!1)), h.hover(qe(e.target)), Le.current || Ve.current)) return;
			let t = Ye();
			et(t && Ot(t.blocks, {
				x: e.clientX,
				y: e.clientY
			}, {
				rootRect: t.rootRect,
				canInsert: Qe()
			}));
		}), e.addEventListener("pointerdown", () => {
			U(null), et(null);
		}), e.addEventListener("click", (e) => {
			let t = e.target;
			if (t.closest("[contenteditable=\"true\"]")) {
				t.closest("a") && e.preventDefault();
				return;
			}
			e.preventDefault();
			let n = qe(t);
			n ? e.shiftKey && h.get().selected ? h.extendTo(n) : K.current.onInspect(n) : e.shiftKey || h.select(null);
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
			else if (!K.current.readOnly) {
				if (r && n.key.toLowerCase() === "z") {
					if (e.activeElement?.closest("[data-cms-entry-field]")) return;
					n.preventDefault();
					let r = e.activeElement, i = r?.closest("[data-cms-prop]"), a = r?.closest("[data-cms-instance-prop]"), o = i?.closest("[data-cms-node]");
					r?.blur(), n.shiftKey ? h.redo() : h.undo(), o?.dataset.cmsNode && i?.dataset.cmsProp && t(h.get().nodes, o.dataset.cmsNode) ? h.focus(o.dataset.cmsNode, "end", i.dataset.cmsProp, i.dataset.cmsIndex === void 0 ? void 0 : Number(i.dataset.cmsIndex)) : a?.dataset.cmsInstanceNode && t(h.get().nodes, a.dataset.cmsInstanceNode) && h.focus(a.dataset.cmsInstanceNode, "end", `values.${a.dataset.cmsInstanceProp}`);
				} else r && n.altKey && (n.code === "KeyT" || n.code === "KeyY") ? (n.preventDefault(), tt(n.code === "KeyT" ? "before" : "after")) : n.target.isContentEditable ? r || n.altKey || n.key.length !== 1 && ![
					"Backspace",
					"Delete",
					"Enter"
				].includes(n.key) || (Le.current = !0, Ie(!0), et(null)) : ft(n);
			}
		});
		let r = (e) => h.get().blockMode && !!h.get().selected && !e.target.isContentEditable, i = (e, n) => {
			if (!r(e) || !e.clipboardData) return;
			let i = Be(h.get()).map((e) => t(h.get().nodes, e)).filter(Boolean);
			i.length && (e.preventDefault(), e.clipboardData.setData("text/plain", "cms-blocks:" + JSON.stringify(i)), n && !K.current.readOnly && h.removeSelection());
		};
		e.addEventListener("copy", (e) => i(e, !1)), e.addEventListener("cut", (e) => i(e, !0)), e.addEventListener("paste", (e) => {
			let t = e.clipboardData?.getData("text/plain") ?? "";
			if (!r(e) || K.current.readOnly || !t.startsWith("cms-blocks:")) return;
			e.preventDefault();
			let n;
			try {
				n = JSON.parse(t.slice(12)).map(u);
			} catch {
				return;
			}
			let i = h.get().nodes, a = f(i, Be(h.get()).at(-1), n.map((e) => e.type), g, v);
			a && n.length && (h.insert(a.parentId, a.index, n), h.select(n[0].id, !0), n.length > 1 && h.extendTo(n.at(-1).id));
		});
		let a = 0;
		e.addEventListener("scroll", () => {
			let t = B.current, n = e.defaultView;
			if (t) {
				let e = n.scrollX - t.scroll.x, r = n.scrollY - t.scroll.y, i = (t) => ({
					...t,
					left: t.left - e,
					top: t.top - r
				});
				B.current = {
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
			Te(() => {
				et(null), $e();
			}), clearTimeout(a), a = window.setTimeout(() => {
				B.current = null, $e();
			}, 150);
		}, { passive: !0 }), e.defaultView?.addEventListener("resize", () => {
			B.current = null, requestAnimationFrame($e);
		}), e.querySelectorAll("img,link[rel=\"stylesheet\"]").forEach((e) => e.addEventListener("load", () => {
			B.current = null, requestAnimationFrame($e);
		}, { once: !0 })), e.fonts.ready.then(() => {
			B.current = null, $e();
		});
	};
	N(() => Xt.on("scroll-to", ({ node: e }) => {
		let t = O.current?.contentDocument, n = t && q(t, e);
		n && n.scrollIntoView({
			block: "center",
			behavior: "smooth"
		});
	}), []), N(() => {
		let e = O.current?.contentDocument;
		if (e) {
			e.querySelectorAll("[data-cms-reveal]").forEach((e) => e.removeAttribute("data-cms-reveal"));
			for (let t of w) {
				let n = q(e, t);
				for (; n;) n.dataset.cmsConditional === "hidden" && (n.dataset.cmsReveal = ""), n = n.parentElement;
			}
		}
	}, [w]);
	let ht = zt({
		disabled: x,
		frame: O,
		scale: M.scale,
		invalidate: () => {
			B.current = null, $e();
		},
		target: (e, n) => {
			let r = Ye();
			if (!r || e.x < r.rootRect.left || e.x > r.rootRect.left + r.rootRect.width || e.y < r.rootRect.top - 12 || e.y > r.rootRect.top + r.rootRect.height + 12) return null;
			let i = n.map((e) => t(h.get().nodes, e));
			if (i.some((e) => !e)) return null;
			let a = i.map((e) => e.type);
			return kt(r.blocks, e, {
				rootRect: r.rootRect,
				maxDistance: Infinity,
				excludeIds: new Set(n),
				canInsert: (e) => Xe(e, a)
			});
		},
		commit: (e, t) => h.moveTo(e, t.parentId, t.index)
	}), gt = (e) => {
		let t = O.current?.contentDocument;
		if (!t) return !1;
		for (let n of [.25, .75]) for (let r = 0; r < 6; r++) if (Pn(t, (e.left + e.width * (r + .5) / 6 - M.left) / M.scale, (e.top + e.height * n) / M.scale)) return !0;
		return !1;
	}, _t = ve(() => {
		let e = O.current.getBoundingClientRect();
		return {
			x: e.left,
			y: e.top,
			scale: M.scale
		};
	}, [M.scale]), J = (e) => ({
		left: M.left + e.left * M.scale,
		top: e.top * M.scale,
		width: e.width * M.scale,
		height: e.height * M.scale
	});
	return /* @__PURE__ */ L(Zt.Provider, {
		value: ot,
		children: /* @__PURE__ */ R("div", {
			className: "flex h-full min-h-0 flex-col",
			"data-live-editor": !0,
			children: [
				fe && /* @__PURE__ */ L(ae, {
					compact: !0,
					message: fe,
					onRetry: () => he((e) => e + 1)
				}),
				/* @__PURE__ */ R("div", {
					ref: D,
					onPointerLeave: () => {
						h.hover(null), et(null);
					},
					onPointerMove: (e) => {
						e.target.closest("[data-cms-inserter]") || (et(null), h.hover(null));
					},
					className: "relative min-h-0 flex-1 overflow-hidden bg-sunken",
					children: [
						ue && /* @__PURE__ */ L("div", {
							className: "absolute inset-0 z-20 grid place-items-center bg-bg",
							children: /* @__PURE__ */ L(oe, {})
						}),
						/* @__PURE__ */ L("iframe", {
							ref: O,
							title: S("Live editor"),
							sandbox: "allow-same-origin",
							onLoad: mt,
							className: "absolute top-0 border-0 bg-white",
							style: {
								width: M.width,
								height: M.height,
								left: M.left,
								transformOrigin: "top left",
								transform: `scale(${M.scale})`
							}
						}),
						/* @__PURE__ */ R("div", {
							className: "pointer-events-none absolute inset-0 overflow-hidden",
							children: [
								!x && !ht.drag && !Ne && !Fe && !V && ie && be && !w.includes(ie) && /* @__PURE__ */ L("div", {
									"data-cms-hover": ie,
									className: "absolute z-10 border border-focus/50",
									style: J(be)
								}),
								!ht.drag && _e.map((e, t) => /* @__PURE__ */ L("div", {
									"data-cms-selection": !0,
									className: "absolute z-10 border-solid border-focus",
									style: {
										...J(e),
										borderWidth: 1.5
									}
								}, t)),
								!x && !ht.drag && re && ne && _e[0] && (() => {
									let e = r(C, w[0]), n = r(C, w.at(-1)), a = t(C, ne);
									if (!e || !n || !a) return null;
									let s = i(C, e.parentId), l = (e) => ({
										label: je(e, g, te),
										icon: e.type === "pattern" ? "b-diamonds-four" : g.get(e.type)?.icon ?? "square"
									}), u = e.parentId ? t(C, e.parentId) : null, { label: d, icon: f } = l(a);
									return /* @__PURE__ */ L(qt, {
										id: ne,
										label: w.length > 1 ? b(w.length, "{count} block", "{count} blocks") : d,
										icon: f,
										parent: u ? l(u) : null,
										box: J(_e[0]),
										viewport: {
											width: M.width * M.scale + M.left * 2,
											height: M.height * M.scale
										},
										canMoveUp: e.index > 0,
										canMoveDown: n.index < s.length - 1,
										onSelectParent: () => u && c(u.id),
										onDrag: (e) => {
											U(null), ht.start(e, Be(h.get()), d);
										},
										onMove: (e) => h.nudgeSelection(e),
										onInsert: (e) => requestAnimationFrame(() => tt(e)),
										onDuplicate: () => h.duplicateSelection(),
										onDelete: () => h.removeSelection(),
										onMakeComponent: a.type !== "pattern" && _("entries.components.create") ? () => pt(h, o(h, g, v)) : void 0,
										covers: gt
									});
								})(),
								!x && !ht.drag && we.filter((e) => e.inside).map((e) => {
									let n = {
										open: !!V && jn(V) === jn(e),
										onOpenChange: (t) => U(t ? e : null),
										returnFocus: nt,
										children: /* @__PURE__ */ L(Lt, {
											types: [...g.values()],
											allowed: (t) => Xe(e.parentId, [t.name]),
											onChoose: (t) => ct(t, e),
											onClose: () => U(null)
										})
									};
									if (e.parentId === null) return C.length ? null : /* @__PURE__ */ L(Gt, {
										target: e,
										position: J,
										onWrite: Xe(null) ? lt : void 0,
										...n
									}, "root");
									let r = e.hitRect.top;
									return t(C, e.parentId)?.children?.length || r + e.hitRect.height < 0 || r > M.height || !(n.open || ie === e.parentId || w.includes(e.parentId)) ? null : /* @__PURE__ */ L(Wt, {
										target: e,
										position: J,
										...n
									}, jn(e));
								}),
								!x && !ht.drag && (() => {
									let e = V && !V.inside ? V : !V && !Fe ? De : null;
									return e ? /* @__PURE__ */ L(Ut, {
										target: e,
										position: J,
										open: V === e,
										onOpenChange: (t) => {
											U(t ? e : null), t || et(null);
										},
										returnFocus: nt,
										children: /* @__PURE__ */ L(Lt, {
											types: [...g.values()],
											allowed: (t) => Xe(e.parentId, [t.name]),
											onChoose: (t) => ct(t, e),
											onClose: () => U(null)
										})
									}, jn(e)) : null;
								})(),
								ht.drag && /* @__PURE__ */ L(Jt, {
									drag: ht.drag,
									position: J
								})
							]
						})
					]
				}),
				k && /* @__PURE__ */ R(I, { children: [
					/* @__PURE__ */ L(In, { slots: j }),
					m && /* @__PURE__ */ L(Bn, {
						doc: k,
						content: a,
						onChange: m,
						readOnly: x
					}),
					/* @__PURE__ */ L(at, {
						root: k,
						offset: _t
					}),
					/* @__PURE__ */ L(zn, {
						doc: k,
						frame: O.current,
						scale: M.scale
					})
				] })
			]
		})
	});
}
var In = _e(function({ slots: e }) {
	let { store: n } = z(), r = H(n, (e) => e.nodes), i = new Set(e.filter((e) => !e.instance && e.prop === "items").map((e) => e.id)), a = /* @__PURE__ */ new Map();
	return /* @__PURE__ */ R(I, { children: [e.filter((e) => e.instance || e.prop !== "items").map((e) => {
		let n = t(r, e.id);
		if (!n) return null;
		let i = `${e.instance ? "instance:" : ""}${e.id}:${e.prop}`, o = a.get(i) ?? 0;
		return a.set(i, o + 1), we(e.instance ? /* @__PURE__ */ L(Ln, {
			node: n,
			slot: e
		}) : [
			"text",
			"cite",
			"caption"
		].includes(e.prop) ? n.type === "paragraph" && e.prop === "text" ? /* @__PURE__ */ L(On, {
			node: n,
			prop: "text",
			tag: "span",
			placeholder: S("Write, or press “/” for blocks"),
			quiet: !0
		}) : /* @__PURE__ */ L(On, {
			node: n,
			prop: e.prop,
			tag: "span",
			placeholder: e.element.dataset.cmsPlaceholder ?? S("Write something…")
		}) : /* @__PURE__ */ L(Rn, {
			node: n,
			prop: e.prop
		}), e.element, `${i}:${o}`);
	}), [...i].map((n) => {
		let i = t(r, n);
		return i ? /* @__PURE__ */ L(kn, {
			node: i,
			renderItem: (t, r) => {
				let i = e.find((e) => e.id === n && e.prop === "items" && e.index === t);
				return i ? we(r, i.element, `${n}:items:${t}`) : null;
			}
		}, n) : null;
	})] });
});
function Ln({ node: e, slot: n }) {
	let { store: r, readOnly: i } = z(), a = H(r, (t) => t.focus?.id === e.id && t.focus.prop === `values.${n.prop}` ? t.focus : null), o = String((Object.prototype.hasOwnProperty.call(e.props.values ?? {}, n.prop) ? e.props.values[n.prop] : n.instance.value) ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
	return /* @__PURE__ */ L(nt, {
		tag: "span",
		html: o,
		focus: a,
		plainText: !0,
		singleLine: n.instance.type === "text",
		disabled: i,
		placeholder: n.element.dataset.cmsPlaceholder ?? S("Write something…"),
		onFocus: () => r.select(e.id),
		onChange: (i, a) => r.updateProps(e.id, { values: {
			...t(r.get().nodes, e.id)?.props.values,
			[n.prop]: a.innerText
		} }, `instance:${e.id}:${n.prop}`),
		onKeyDown: (t, i) => {
			(t.key === "Escape" || t.key === "Enter" && n.instance.type === "text") && (t.preventDefault(), i.blur(), r.select(e.id, !0));
		}
	});
}
function Rn({ node: e, prop: t }) {
	let { store: n, readOnly: r } = z(), i = H(n, (n) => n.focus?.id === e.id && n.focus.prop === t ? n.focus : null), a = String(e.props[t] ?? ""), o = t === "code" ? a.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>") : a;
	return /* @__PURE__ */ L(nt, {
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
}
function zn({ doc: e, frame: n, scale: i }) {
	let o = yn(), { store: s, types: c, allowed: u } = z(), [d, h] = F(null);
	if (xe(() => {
		h(o ? Ye(e) : null);
	}, [o, e]), xn(!!o, [document, e]), !o || !d || !t(s.get().nodes, o.id)) return null;
	let g = (e) => {
		let n = l(e, c), i = s.get().nodes, d = r(i, o.id);
		if (!d || !n.length) return;
		let h = d.parentId ? t(i, d.parentId) : null, g = n.every((e) => p(h, e.type, c, h ? [] : u)) ? d : f(i, o.id, n.map((e) => e.type), c, u);
		g && (vn(null), s.commit(m(a(i, o.id), g.parentId, g.index, n)), nn(s, n[0], un(ln(s.get().nodes, c, () => !1))));
	}, _ = n.getBoundingClientRect(), { maxHeight: v, ...y } = bn({
		left: _.left + d.left * i,
		top: _.top + d.top * i,
		bottom: _.top + d.bottom * i
	});
	return we(/* @__PURE__ */ L("div", {
		"data-cms-slash": !0,
		className: "cms-pop fixed z-[70] overflow-hidden !p-0",
		style: y,
		children: /* @__PURE__ */ L(dt, {
			types: [...c.values()],
			query: o.query,
			showSearch: !1,
			compact: !0,
			style: { maxHeight: v },
			chooseFirst: o.enter,
			keyboardDocument: e,
			onChoose: g,
			onClose: () => vn(null),
			onNoMatch: () => {
				vn(null);
			},
			allowed: (e) => !!f(s.get().nodes, o.id, e.name, c, u)
		})
	}), document.body);
}
function Bn({ doc: e, content: t, onChange: n, readOnly: r }) {
	let i = [...e.querySelectorAll("[data-cms-entry-field=\"title\"]")];
	return /* @__PURE__ */ L(I, { children: i.map((i, a) => {
		let o = t.title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
		return we(/* @__PURE__ */ L(nt, {
			tag: "span",
			html: o,
			singleLine: !0,
			disabled: r,
			placeholder: S("Untitled"),
			onChange: (e, t) => n(t.textContent ?? ""),
			onKeyDown: (t, n) => {
				t.key === "Enter" && (t.preventDefault(), n.blur(), e.querySelector("[data-cms-editor-root] [contenteditable=\"true\"]")?.focus());
			}
		}), i, `title:${a}`);
	}) });
}
// admin/src/builder/controls.tsx
var Vn = "w-[88px]", Hn = "cms.inspector.collapsed";
function Un() {
	try {
		let e = JSON.parse(localStorage.getItem(Hn) ?? "{}");
		return e && typeof e == "object" && !Array.isArray(e) ? Object.fromEntries(Object.entries(e).filter(([, e]) => typeof e == "boolean")) : {};
	} catch {
		return {};
	}
}
function Y({ title: e, children: t, open: n = !0, actions: r, empty: i }) {
	let [a, o] = F(() => Un()[e] === void 0 ? n : !Un()[e]), s = (t) => {
		o(t);
		try {
			localStorage.setItem(Hn, JSON.stringify({
				...Un(),
				[e]: !t
			}));
		} catch {}
	};
	return /* @__PURE__ */ R("section", {
		"data-section": e,
		className: "min-w-0 border-b border-border last:border-b-0",
		children: [/* @__PURE__ */ R("header", {
			className: "group/section flex h-10 items-center gap-1 pl-4 pr-3",
			children: [/* @__PURE__ */ R("button", {
				type: "button",
				onClick: () => s(!a),
				"aria-expanded": a,
				className: j("flex h-full min-w-0 flex-1 items-center gap-1 text-left text-xs font-semibold", i ? "text-muted" : "text-ink"),
				children: [/* @__PURE__ */ L("span", {
					className: "min-w-0 truncate",
					children: e
				}), /* @__PURE__ */ L(E, {
					name: "b-caret-down",
					size: 10,
					className: j("shrink-0 text-faint transition-[rotate,opacity] duration-120", a ? "opacity-0 group-hover/section:opacity-100 group-focus-within/section:opacity-100" : "-rotate-90")
				})]
			}), r && /* @__PURE__ */ L("span", {
				className: "contents",
				onClickCapture: () => !a && s(!0),
				children: r
			})]
		}), a && /* @__PURE__ */ L("div", {
			className: "space-y-1 px-4 pb-3",
			children: i && r ? /* @__PURE__ */ L("p", {
				className: "m-0 flex h-7 items-center text-xs text-faint",
				children: S("None")
			}) : t
		})]
	});
}
function Wn({ children: e, className: t }) {
	return /* @__PURE__ */ L("div", {
		"data-section": "content",
		className: j("space-y-1 border-b border-border px-4 py-3 last:border-b-0", t),
		children: e
	});
}
function Gn({ title: e, action: t }) {
	return /* @__PURE__ */ R("div", {
		className: "flex h-7 items-center justify-between pt-1",
		children: [/* @__PURE__ */ L("span", {
			className: "text-xs text-muted",
			children: e
		}), t]
	});
}
function Kn({ field: e, children: t, htmlFor: n, className: r }) {
	let i = e.status, a = e.reset, o = t ?? e.label, s = j("flex h-7 min-w-0 shrink-0 items-center gap-1 text-left text-xs", Vn, i === "own" ? "text-ink" : "text-muted", r), c = /* @__PURE__ */ L("span", {
		className: "min-w-0 truncate",
		children: o
	});
	return i === "own" && a ? /* @__PURE__ */ L(A, {
		content: S("Reset {label}", { label: String(e.label ?? "") }),
		children: /* @__PURE__ */ L("button", {
			type: "button",
			onClick: a,
			className: j(s, "decoration-faint decoration-dotted underline-offset-[3px] hover:underline"),
			children: c
		})
	}) : i === "inherited" ? /* @__PURE__ */ R("label", {
		htmlFor: n,
		className: s,
		title: S("Inherited from a larger screen, another state or the component"),
		children: [c, /* @__PURE__ */ L("span", {
			className: "size-1 shrink-0 rounded-full bg-warning",
			"aria-hidden": !0
		})]
	}) : /* @__PURE__ */ L("label", {
		htmlFor: n,
		className: s,
		title: e.instructions,
		children: c
	});
}
var qn = 15;
function Jn(e) {
	if (e.stack === !0 || me.includes(e.type) && !e.component || e.type !== "toggle" && String(e.label ?? "").length > qn) return !0;
	if (e.type !== "select" || e.component || e.display !== "segmented") return !1;
	let t = Object.values(e.options ?? {}).map((e) => typeof e == "string" ? e : e && typeof e == "object" && "label" in e ? String(e.label ?? "") : "").filter(Boolean);
	return t.length > 3 || t.join(" ").length > 20;
}
var Yn = (e) => e === "xs" || e === void 0 ? "sm" : e;
function X({ fields: e, values: t, onChange: n, disabled: r, context: i = {}, className: a, bare: o }) {
	Ce(x.fields.subscribe, x.fields.version);
	let s = w();
	return /* @__PURE__ */ L("div", {
		className: j("min-w-0", a ?? "space-y-1"),
		children: e.filter((e) => ue(e, t)).map((e) => {
			let a = s?.fieldTypes.find((t) => t.key === e.type), c = x.fields.get(e.component ?? a?.component ?? e.type) ?? x.fields.get("json");
			if (!c) return null;
			let l = {
				...e,
				size: Yn(e.size),
				fit: !0,
				id: le(e, i.path)
			}, u = !o && Jn(e), d = /* @__PURE__ */ L(c, {
				field: l,
				value: t[e.handle] ?? e.default ?? null,
				onChange: (t) => n(e.handle, t),
				disabled: r,
				context: {
					...i,
					values: t
				}
			});
			return /* @__PURE__ */ R("div", {
				"data-field": e.handle,
				className: j("flex min-w-0", u ? "flex-col items-stretch" : "min-h-7 items-center gap-2", e.className),
				children: [!o && e.type !== "toggle" && /* @__PURE__ */ L(Kn, {
					field: l,
					htmlFor: l.id,
					className: u ? "!w-auto" : void 0
				}), /* @__PURE__ */ L("div", {
					className: j("flex min-w-0 items-center", !u && "flex-1"),
					children: d
				})]
			}, e.handle);
		})
	});
}
var Xn = "cms-input h-7 w-full min-w-0 rounded-sm px-2 text-sm placeholder:text-ghost", Zn = "grid size-6 shrink-0 place-items-center rounded-sm text-muted transition-colors duration-120 hover:bg-hover hover:text-ink";
function Qn({ onClick: e, label: t = S("Add") }) {
	return /* @__PURE__ */ L(A, {
		content: t,
		children: /* @__PURE__ */ L("button", {
			type: "button",
			onClick: e,
			className: Zn,
			"aria-label": t,
			children: /* @__PURE__ */ L(E, {
				name: "b-plus",
				size: 14
			})
		})
	});
}
function $n({ onClick: e, label: t = S("Remove") }) {
	return /* @__PURE__ */ L(A, {
		content: t,
		children: /* @__PURE__ */ L("button", {
			type: "button",
			onClick: e,
			className: j(Zn, "text-faint hover:text-danger"),
			"aria-label": t,
			children: /* @__PURE__ */ L(E, {
				name: "b-minus",
				size: 14
			})
		})
	});
}
// admin/src/builder/fields/controls.tsx
function er(e, t) {
	let n = e.if;
	return !n || Object.entries(n).every(([e, n]) => Array.isArray(n) ? n.includes(t[e]) : t[e] === n);
}
function tr({ field: e, ...t }) {
	let n = x.fields.get(e.component ?? e.type) ?? x.fields.get("json");
	return n ? /* @__PURE__ */ L("div", {
		className: j("min-w-0 flex-1", e.className),
		children: /* @__PURE__ */ L(n, {
			field: e,
			...t,
			context: t.context ?? {}
		})
	}) : null;
}
function nr({ className: e, children: t }) {
	return /* @__PURE__ */ L("div", {
		className: j("relative flex min-w-0 flex-1 items-center gap-1", e),
		children: t
	});
}
// admin/src/builder/fields/composite.tsx
var rr = {
	2: "grid grid-cols-2",
	3: "grid grid-cols-3",
	4: "grid grid-cols-4"
};
function ir({ field: e, value: t, onChange: n, disabled: r, context: i }) {
	let a = t ?? {}, o = e.link, [s, c] = F(!o || e.split === !0), l = (s ? e.fields ?? [] : [o]).filter((e) => er(e, a)), u = s ? rr[e.columns] : void 0;
	return /* @__PURE__ */ R(nr, { children: [/* @__PURE__ */ L("div", {
		className: j("min-w-0 flex-1 gap-1", u ?? "flex items-center"),
		children: l.map((e) => /* @__PURE__ */ L(tr, {
			field: e,
			value: a[e.handle] ?? e.default ?? null,
			onChange: (t) => n({
				...a,
				[e.handle]: t
			}),
			disabled: r,
			context: i
		}, e.handle))
	}), o && /* @__PURE__ */ L("button", {
		type: "button",
		onClick: () => c(!s),
		className: "grid size-7 shrink-0 place-items-center rounded-sm text-muted hover:bg-hover hover:text-ink",
		title: s ? e.joinLabel ?? S("The same for all") : e.splitLabel ?? S("Each One"),
		children: /* @__PURE__ */ L(E, {
			name: s ? "b-square" : "b-corners-out",
			size: 14
		})
	})] });
}
function ar({ field: e, value: t, onChange: n, disabled: r, context: i }) {
	let a = t ?? {}, o = e.key ?? {}, s = e.labels, c = e.items, l = (e, t) => {
		let r = (t ?? "").trim();
		o.lower && (r = r.toLowerCase()), o.strip && (r = r.replace(new RegExp(o.strip, "g"), "")), !(!r || r === e || r in a || o.allowed && !o.allowed.includes(r)) && n(Object.fromEntries(Object.entries(a).map(([t, n]) => t === e ? [r, n] : [t, n])));
	};
	return /* @__PURE__ */ L("div", {
		className: "min-w-0 flex-1 space-y-1",
		children: Object.entries(a).map(([t, u]) => /* @__PURE__ */ R("div", {
			className: "flex items-center gap-1",
			children: [
				o.prefix && /* @__PURE__ */ L("span", {
					className: "text-xs text-faint",
					children: o.prefix
				}),
				s ? /* @__PURE__ */ L("span", {
					className: "mr-1 w-[88px] shrink-0 truncate text-xs text-text",
					children: s[t] ?? t
				}) : /* @__PURE__ */ L(tr, {
					field: {
						handle: `${e.handle}-${t}`,
						type: o.options ? "select" : "text",
						size: "sm",
						commit: "blur",
						label: S("Name"),
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
				typeof e.join == "string" && /* @__PURE__ */ L("span", {
					className: "text-xs text-faint",
					children: e.join
				}),
				/* @__PURE__ */ L(tr, {
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
				/* @__PURE__ */ L($n, { onClick: () => n(Object.fromEntries(Object.entries(a).filter(([e]) => e !== t))) })
			]
		}, t))
	});
}
function or(e, t) {
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
var sr = () => [
	{
		path: "entry.author.name",
		label: S("Author"),
		group: S("Page")
	},
	{
		path: "entry.title",
		label: S("Title"),
		group: S("Page")
	},
	{
		path: "entry.url",
		label: S("Link"),
		group: S("Page")
	},
	{
		path: "entry.date|date:F j, Y",
		label: S("Published Date"),
		group: S("Page")
	},
	{
		path: "entry.updated|date:F j, Y",
		label: S("Updated Date"),
		group: S("Page")
	},
	{
		path: "entry.parent.title",
		label: S("Parent Title"),
		group: S("Page")
	},
	{
		path: "entry.prev.url",
		label: S("Previous Page Link"),
		group: S("Page")
	},
	{
		path: "entry.prev.title",
		label: S("Previous Page Title"),
		group: S("Page")
	},
	{
		path: "entry.next.url",
		label: S("Next Page Link"),
		group: S("Page")
	},
	{
		path: "entry.next.title",
		label: S("Next Page Title"),
		group: S("Page")
	}
], cr = () => [
	{
		path: "site.name",
		label: S("Site Name"),
		group: S("Site")
	},
	{
		path: "site.description",
		label: S("Site Description"),
		group: S("Site")
	},
	{
		path: "site.url",
		label: S("Site URL"),
		group: S("Site")
	},
	{
		path: "© {site.year} {site.name}",
		label: S("Copyright Line"),
		group: S("Site")
	},
	{
		path: "page.uri",
		label: S("Current Path"),
		group: S("Site")
	},
	{
		path: "pagination.prev",
		label: S("Previous Page of a List"),
		group: S("Pagination")
	},
	{
		path: "pagination.next",
		label: S("Next Page of a List"),
		group: S("Pagination")
	},
	{
		path: "{pagination.current} / {pagination.total}",
		label: S("Page x of y"),
		group: S("Pagination")
	}
];
function lr(t) {
	let { store: n, doc: r, catalog: i } = z(), a = ne(), o = H(n, (n) => e(n.nodes, t.id)), s = C("entries/get", { id: r?.id ?? "" }, {
		enabled: r?.kind === "entry",
		staleTime: 6e4
	}), c = r?.kind === "template" ? r.collections?.length ? r.collections : a.collections.filter((e) => e.routable).map((e) => e.handle).slice(0, 1) : s.data ? [s.data.collection] : [], l = C("collections/get", { handle: c[0] ?? "" }, {
		enabled: !!c[0],
		staleTime: 3e5
	}), u = [];
	for (let e of [...o].reverse()) {
		if (e.type !== "repeat") continue;
		let t = e.props?.as || "item", n = i.sources?.find((t) => t.name === e.props?.source), r = S("{list} item ({name})", {
			list: n?.label ?? S("List"),
			name: t
		});
		for (let [e, i] of Object.entries(n?.item ?? {})) u.push({
			path: `${t}.${e}`,
			label: i,
			group: r
		});
		e.props?.source === "entries" && e.props?.collection && u.push({
			path: `${t}.excerpt`,
			label: S("Excerpt Field"),
			group: r
		}, {
			path: `${t}.cover`,
			label: S("Cover Image Field"),
			group: r
		}), e.props?.source === "list" && u.push({
			path: `{${t}}`,
			label: S("The Item Itself (Text)"),
			group: r
		}), u.push({
			path: "index",
			label: S("Position (1, 2, 3…)"),
			group: r
		}, {
			path: "first",
			label: S("Is First"),
			group: r
		}, {
			path: "last",
			label: S("Is Last"),
			group: r
		});
	}
	if (r?.kind === "pattern") for (let e of r.props ?? []) u.push({
		path: `props.${e.handle}`,
		label: e.label ?? e.handle,
		group: S("Component Properties")
	});
	u.push(...sr());
	for (let e of l.data?.fields ?? []) e.type !== "blocks" && u.push({
		path: `entry.${e.handle}${e.type === "date" ? "|date:F j, Y" : ""}`,
		label: e.label,
		group: S("Page Fields")
	});
	u.push(...cr());
	for (let e of a.globals) u.push({
		path: `globals.${e.handle}.`,
		label: S("{name} (add a field handle)", { name: e.title }),
		group: S("Globals")
	});
	return u;
}
// admin/src/builder/content/ContentPanel.tsx
var ur = [
	"text",
	"textarea",
	"richtext",
	"markdown"
], dr = (e, t) => !e.if || Object.entries(e.if).every(([e, n]) => {
	let r = t[e] ?? null;
	return Array.isArray(n) ? n.includes(r) : r === n;
});
function fr({ field: e, value: t, bound: n, paths: r, onValue: i, onBind: a, extra: o }) {
	let s = e.type === "richtext" && e.inline && e.handle !== "text" && !e.component ? {
		...e,
		component: "blocks-inline-text"
	} : e, c = !n && me.includes(s.type) && !s.component, l = !n && Jn(s), u = !n && s.type === "toggle", d = n ? {
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
	}, f = { [s.handle]: n ?? t }, p = (e, t) => n ? a(t) : i(t), m = c ? /* @__PURE__ */ L(T, {
		bare: !0,
		fields: [d],
		values: f,
		onChange: p,
		className: "min-w-0"
	}) : /* @__PURE__ */ L(X, {
		bare: !0,
		fields: [d],
		values: f,
		onChange: p,
		className: "min-w-0 flex-1"
	});
	if (u) return /* @__PURE__ */ L("div", {
		className: "flex min-h-7 items-center",
		children: m
	});
	let h = /* @__PURE__ */ L(A, {
		content: S(n ? "Disconnect from Data" : "Connect to Data"),
		children: /* @__PURE__ */ L("button", {
			type: "button",
			onClick: () => a(n ? null : r[0]?.path ?? "entry.title"),
			"aria-label": S(n ? "Disconnect from Data" : "Connect to Data"),
			className: j("grid h-6 shrink-0 place-items-center overflow-hidden rounded-sm hover:bg-hover", n ? "w-6 text-ink" : "w-0 text-faint hover:text-ink focus-visible:w-6 group-hover/prop:w-6 [@media(hover:none)]:w-6"),
			children: /* @__PURE__ */ L(E, {
				name: "b-database",
				size: 13
			})
		})
	}), g = /* @__PURE__ */ R("span", {
		className: j("flex h-7 min-w-0 shrink-0 items-center gap-0.5", !l && "w-[88px]"),
		children: [/* @__PURE__ */ L("label", {
			htmlFor: le(s),
			className: j("min-w-0 flex-1 truncate text-xs", n ? "text-ink" : "text-muted"),
			title: s.instructions,
			children: s.label
		}), h]
	});
	return l ? /* @__PURE__ */ R("div", {
		className: "group/prop pb-1",
		children: [g, m]
	}) : /* @__PURE__ */ R("div", {
		className: "group/prop flex min-h-7 items-center gap-2",
		children: [g, m]
	});
}
function pr({ node: e }) {
	let { store: t, types: n } = z(), r = n.get(e.type), i = lr(e), a = tt().filter((t) => t.id !== (e.anchor ?? e.props?.anchor)), o = e.bind ?? {}, s = {
		...Object.fromEntries((r?.fields ?? []).map((e) => [e.handle, e.default ?? null])),
		...r?.defaults ?? {},
		...e.props ?? {}
	}, c = (n, r) => {
		let i = { ...o };
		r ? i[n] = r : delete i[n], t.updateNode(e.id, { bind: Object.keys(i).length ? i : void 0 }, `bind:${e.id}:${n}`);
	}, l = (n, r) => t.updateProps(e.id, { [n]: r }, `inspector:${e.id}:${n}`), u = (r?.fields ?? []).filter((e) => !(e.type === "json" && [
		"items",
		"rows",
		"values"
	].includes(e.handle))), d = u.some((e) => e.component === "link") && u.some((e) => e.handle === "new_tab"), f = u.filter((e) => !(d && e.handle === "new_tab") && dr(e, s)), p = f.filter((e) => !e.advanced), m = f.filter((e) => e.advanced), h = (t) => /* @__PURE__ */ L(fr, {
		field: t,
		value: e.props?.[t.handle],
		bound: o[t.handle],
		paths: i,
		onValue: (e) => l(t.handle, e),
		onBind: (e) => c(t.handle, e),
		extra: _(t)
	}, t.handle), g = e.type === "repeat", _ = (t) => t.component === "link" || t.type === "url" ? {
		anchors: a,
		...d ? {
			newTab: !!e.props?.new_tab,
			onNewTab: (e) => l("new_tab", e || void 0)
		} : {}
	} : void 0;
	return /* @__PURE__ */ R("div", { children: [
		e.type === "pattern" ? /* @__PURE__ */ L(mr, {
			node: e,
			paths: i,
			setBind: c,
			anchors: a
		}) : g ? /* @__PURE__ */ L(hr, { node: e }) : p.length > 0 && /* @__PURE__ */ L(Wn, { children: p.map(h) }),
		/* @__PURE__ */ L(Y, {
			title: S("Visibility"),
			open: !!(o.visible || o.hidden || e.hidden),
			empty: !o.visible && !o.hidden && !e.hidden,
			children: /* @__PURE__ */ L(X, {
				fields: [
					{
						handle: "shown",
						type: "toggle",
						size: "sm",
						label: S("Show on the Site")
					},
					{
						handle: "visible",
						type: "text",
						component: "blocks-bind",
						label: S("Only If"),
						paths: i,
						placeholder: S("Always"),
						status: o.visible ? "own" : void 0,
						reset: () => c("visible", null),
						instructions: S("Shown only when this data has a value")
					},
					{
						handle: "hidden",
						type: "text",
						component: "blocks-bind",
						label: S("Hide If"),
						paths: i,
						placeholder: S("Never"),
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
		/* @__PURE__ */ R(Y, {
			title: S("Advanced"),
			open: !1,
			empty: !e.anchor && !e.attrs && !e.class && !m.some((t) => e.props?.[t.handle] !== void 0 && e.props?.[t.handle] !== t.default),
			children: [
				g ? /* @__PURE__ */ L(gr, { node: e }) : m.map(h),
				/* @__PURE__ */ L(X, {
					fields: [
						{
							handle: "label",
							type: "text",
							size: "sm",
							commit: "blur",
							label: S("Layer Name"),
							placeholder: r?.title
						},
						{
							handle: "anchor",
							type: "text",
							size: "sm",
							commit: "blur",
							label: S("Anchor"),
							placeholder: S("None"),
							mono: !0,
							instructions: S("Link to it with #anchor")
						},
						{
							handle: "class",
							type: "text",
							size: "sm",
							commit: "blur",
							label: S("Classes"),
							placeholder: S("None"),
							mono: !0,
							instructions: S("Extra CSS classes, styled in custom CSS")
						}
					],
					values: {
						label: e.label,
						anchor: e.anchor,
						class: e.class
					},
					onChange: (n, r) => t.updateNode(e.id, { [n]: (n === "anchor" ? r.toLowerCase().replace(/[^a-z0-9-]/g, "") : r) || void 0 })
				}),
				/* @__PURE__ */ L(Gn, {
					title: S("Attributes"),
					action: /* @__PURE__ */ L(Qn, {
						label: S("Add Attribute"),
						onClick: () => t.updateNode(e.id, { attrs: {
							...e.attrs ?? {},
							"aria-label": ""
						} })
					})
				}),
				/* @__PURE__ */ L(X, {
					bare: !0,
					fields: [{
						handle: "attrs",
						type: "json",
						component: "blocks-pairs",
						className: "items-start",
						label: S("Attributes"),
						key: { lower: !0 },
						item: {
							handle: "value",
							type: "text",
							size: "sm",
							commit: "blur",
							label: S("Value")
						},
						items: Object.fromEntries(Object.keys(e.attrs ?? {}).filter((e) => o[`attr:${e}`]).map((e) => [e, {
							handle: "bind",
							type: "text",
							component: "blocks-bind",
							label: S("Data"),
							paths: i
						}]))
					}],
					values: { attrs: Object.fromEntries(Object.entries(e.attrs ?? {}).map(([e, t]) => [e, o[`attr:${e}`] ?? t])) },
					onChange: (n, r) => {
						let i = e.attrs ?? {}, a = or(Object.fromEntries(Object.entries(i).map(([e, t]) => [e, o[`attr:${e}`] ?? t])), r);
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
				/* @__PURE__ */ L(Gn, {
					title: S("States from Data"),
					action: /* @__PURE__ */ L(Qn, {
						label: S("Add State from Data"),
						onClick: () => c("state:active", i[0]?.path ?? "item.active")
					})
				}),
				/* @__PURE__ */ L(X, {
					bare: !0,
					fields: [{
						handle: "states",
						type: "json",
						component: "blocks-pairs",
						className: "items-start",
						label: S("States from Data"),
						key: {
							prefix: "is-",
							lower: !0,
							strip: "[^a-z0-9-]",
							className: "!w-[30%] !flex-none"
						},
						item: {
							handle: "path",
							type: "text",
							component: "blocks-bind",
							label: S("Data"),
							paths: i
						}
					}],
					values: { states: Object.fromEntries(Object.entries(o).filter(([e]) => e.startsWith("state:")).map(([e, t]) => [e.slice(6), t])) },
					onChange: (n, r) => {
						let i = Object.fromEntries(Object.entries(o).filter(([e]) => !e.startsWith("state:"))), a = Object.fromEntries(Object.entries(r).filter(([, e]) => e).map(([e, t]) => [`state:${e}`, t])), s = {
							...i,
							...a
						};
						t.updateNode(e.id, { bind: Object.keys(s).length ? s : void 0 }, `bind:${e.id}:states`);
					}
				}),
				/* @__PURE__ */ L("p", {
					className: "m-0 select-all pt-2 font-mono text-2xs text-faint",
					children: e.id
				})
			]
		})
	] });
}
function mr({ node: e, paths: t, setBind: n, anchors: i }) {
	let { store: o } = z(), s = C("patterns/list", { working: !0 }, { staleTime: 3e4 }), c = s.data?.find((t) => t.handle === e.props?.ref), l = e.props?.values ?? {}, d = e.bind ?? {};
	return /* @__PURE__ */ R(Wn, { children: [
		/* @__PURE__ */ L(X, {
			fields: [{
				handle: "ref",
				type: "select",
				size: "sm",
				label: S("Component"),
				required: !0,
				options: (s.data ?? []).filter((e) => e.synced).map((e) => ({
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
		(c?.props ?? []).map((r) => /* @__PURE__ */ L(fr, {
			field: {
				...r,
				placeholder: r.placeholder ?? (ur.includes(r.type) ? r.label : void 0)
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
		/* @__PURE__ */ R("div", {
			className: "-ml-2 flex gap-1 pt-1",
			children: [c?.id && /* @__PURE__ */ L(re, {
				size: "sm",
				variant: "ghost",
				icon: "b-pencil-simple",
				onClick: () => y(`/content/components/${c.id}`),
				children: S("Edit Component")
			}), /* @__PURE__ */ L(re, {
				size: "sm",
				variant: "ghost",
				icon: "b-scissors",
				onClick: () => {
					if (!c) return;
					let t = r(o.get().nodes, e.id);
					if (!t) return;
					let n = c.blocks.map((e) => u(e));
					o.commit(m(a(o.get().nodes, e.id), t.parentId, t.index, n)), o.select(n[0]?.id ?? null);
				},
				disabled: !c,
				children: S("Detach")
			})]
		})
	] });
}
function hr({ node: e }) {
	let { store: t, catalog: n } = z(), r = n.sources?.find((t) => t.name === e.props?.source), i = (n, r) => t.updateProps(e.id, { [n]: r }, `repeat:${e.id}:${n}`);
	return /* @__PURE__ */ R(Wn, { children: [
		/* @__PURE__ */ L(X, {
			fields: [{
				handle: "source",
				type: "select",
				size: "sm",
				label: S("List"),
				required: !0,
				options: (n.sources ?? []).map((e) => ({
					value: e.name,
					label: e.label
				})),
				instructions: r?.description
			}],
			values: { source: e.props?.source },
			onChange: (e, t) => t && i("source", t)
		}),
		/* @__PURE__ */ L(X, {
			fields: (r?.fields ?? []).map((e) => ({
				...e,
				size: "sm",
				width: "full"
			})),
			values: Object.fromEntries((r?.fields ?? []).map((t) => [t.handle, e.props?.[t.handle]])),
			onChange: (e, t) => i(e, t)
		}),
		/* @__PURE__ */ L(X, {
			fields: [{
				handle: "empty",
				type: "text",
				size: "sm",
				commit: "blur",
				label: S("When Empty"),
				placeholder: S("Show Nothing")
			}],
			values: { empty: e.props?.empty },
			onChange: (e, t) => i(e, t || void 0)
		})
	] });
}
function gr({ node: e }) {
	let { store: t } = z(), n = (n, r) => t.updateProps(e.id, { [n]: r }, `repeat:${e.id}:${n}`);
	return /* @__PURE__ */ L(X, {
		fields: [{
			handle: "tag",
			type: "select",
			size: "sm",
			label: S("HTML Tag"),
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
			label: S("Item Name"),
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
function _r(e) {
	let { store: t, catalog: n } = z(), r = H(t, (e) => e.breakpoint), i = H(t, (e) => e.state), a = Re(r, i), o = ze(r, i), s = e.style ?? {}, c = n.aliases ?? {}, l = (e) => {
		for (let t of o) {
			let n = s[t];
			if (n) {
				for (let r of [e, ...Object.entries(c).filter(([, t]) => t === e).map(([e]) => e)]) if (n[r] !== void 0) return {
					value: String(n[r]),
					from: t
				};
			}
		}
		return {
			value: void 0,
			from: null
		};
	}, u = (e) => l(e).value, d = (e) => {
		let { from: t } = l(e);
		return t === a ? "own" : t ? "inherited" : "none";
	}, f = (n, r) => {
		let i = { ...s[a] ?? {} };
		for (let [e, t] of Object.entries(n)) {
			for (let [t, n] of Object.entries(c)) n === e && delete i[t];
			t == null || t === "" ? delete i[e] : i[e] = t;
		}
		let o = {
			...s,
			[a]: i
		};
		Object.keys(i).length === 0 && delete o[a], t.updateNode(e.id, { style: Object.keys(o).length ? o : void 0 }, r ?? `style:${e.id}:${Object.keys(n).join(",")}`);
	};
	return {
		variant: a,
		breakpoint: r,
		state: i,
		style: s,
		value: u,
		status: d,
		set: (e, t) => f({ [e]: t }),
		write: f,
		own: () => Object.keys(s[a] ?? {})
	};
}
// admin/src/builder/design/fields.ts
var Z = (e, t, n = {}) => ({
	handle: e,
	type: "text",
	component: "blocks-token",
	label: t,
	...n
}), vr = (e, t, n = {}) => ({
	handle: e,
	type: "color",
	component: "blocks-color",
	label: t,
	...n
}), Q = (e, t, n, r = {}) => ({
	handle: e,
	type: "select",
	display: "segmented",
	block: !0,
	size: "sm",
	label: t,
	options: n,
	...r
});
// admin/src/builder/design/StyleFields.tsx
function $({ s: e, fields: t, bare: n }) {
	let r = t.filter(Boolean), i = {}, a = r.map(({ get: t, set: n, keys: r, ...a }) => {
		let o = a.fields, s = r ?? (o ? o.map((e) => e.handle) : [a.handle]);
		i[a.handle] = t ? t() : o ? Object.fromEntries(s.map((t) => [t, e.value(t)])) : e.value(a.handle);
		let c = s.map((t) => e.status(t));
		return {
			status: c.includes("own") ? "own" : c.includes("inherited") ? "inherited" : void 0,
			reset: () => e.write(Object.fromEntries(s.map((e) => [e, null]))),
			...a
		};
	});
	return /* @__PURE__ */ L(X, {
		bare: n,
		fields: a,
		values: i,
		onChange: (t, n) => {
			let a = r.find((e) => e.handle === t);
			if (a.set) return a.set(n);
			if (!n || typeof n != "object") return e.set(t, n);
			let o = yr(i[t] ?? {}, n);
			Object.keys(o).length && e.write(o);
		}
	});
}
function yr(e, t) {
	return Object.fromEntries(Object.entries(t ?? {}).filter(([t, n]) => n !== e[t]));
}
// admin/src/builder/design/Border.tsx
var br = [
	"Top",
	"Right",
	"Bottom",
	"Left"
], xr = [
	"borderTopLeftRadius",
	"borderTopRightRadius",
	"borderBottomRightRadius",
	"borderBottomLeftRadius"
], Sr = [
	"borderWidth",
	...br.map((e) => `border${e}Width`),
	"borderStyle",
	"borderColor",
	"borderRadius",
	...xr,
	"outlineWidth",
	"outlineColor"
];
function Cr({ s: e }) {
	let [t, n] = F(() => br.find((t) => e.value(`border${t}Width`)) ?? "all"), [r, i] = F(() => xr.some((t) => e.value(t))), a = t === "all" ? "borderWidth" : `border${t}Width`;
	return /* @__PURE__ */ L(Y, {
		title: S("Border"),
		open: !1,
		empty: !Sr.some((t) => e.value(t)),
		children: /* @__PURE__ */ L($, {
			s: e,
			fields: [
				Q("side", S("Side"), [{
					value: "all",
					icon: "b-square",
					title: S("All Sides")
				}, ...br.map((e) => ({
					value: e,
					icon: `b-align-${e.toLowerCase()}`,
					title: S(e)
				}))], {
					keys: [],
					get: () => t,
					set: (e) => n(e)
				}),
				Z(a, S("Width"), { placeholder: "0" }),
				Q("borderStyle", S("Style"), [
					{
						value: "solid",
						label: S("Solid")
					},
					{
						value: "dashed",
						label: S("Dashed")
					},
					{
						value: "dotted",
						label: S("Dotted")
					},
					{
						value: "none",
						label: S("None")
					}
				]),
				vr("borderColor", S("Color"), { placeholder: S("Text Color") }),
				Q("linked", S("Corners"), [{
					value: "linked",
					label: S("All")
				}, {
					value: "each",
					label: S("Each")
				}], {
					keys: [],
					get: () => r ? "each" : "linked",
					set: (e) => i(e === "each")
				}),
				!r && Z("borderRadius", S("Radius"), { placeholder: "none" }),
				...r ? xr.map((e, t) => Z(e, [
					S("Top Left"),
					S("Top Right"),
					S("Bottom Right"),
					S("Bottom Left")
				][t])) : [],
				Z("outlineWidth", S("Outline"), { placeholder: "0" }),
				!!e.value("outlineWidth") && vr("outlineColor", S("Outline Color")),
				!!e.value("outlineWidth") && Z("outlineOffset", S("Outline Gap"), { placeholder: "0" })
			]
		})
	});
}
// admin/src/builder/design/Effects.tsx
var wr = [
	"opacity",
	"boxShadow",
	"blur",
	"brightness",
	"contrast",
	"saturate",
	"grayscale",
	"backdropBlur",
	"mixBlendMode",
	"mask",
	"cursor"
];
function Tr({ s: e }) {
	return /* @__PURE__ */ L(Y, {
		title: S("Effects"),
		open: !1,
		empty: !wr.some((t) => e.value(t)),
		children: /* @__PURE__ */ L($, {
			s: e,
			fields: [
				Z("opacity", S("Opacity"), { placeholder: "100" }),
				Z("boxShadow", S("Shadow"), { placeholder: S("None") }),
				Z("blur", S("Blur"), { placeholder: S("None") }),
				Z("backdropBlur", S("Background Blur"), {
					placeholder: S("None"),
					title: S("Blurs what is behind the element: glass.")
				}),
				!!e.value("backdropBlur") && Z("backdropSaturate", S("Background Color"), { placeholder: "100" }),
				Z("brightness", S("Brightness"), { placeholder: "100" }),
				Z("contrast", S("Contrast"), { placeholder: "100" }),
				Z("saturate", S("Saturation"), { placeholder: "100" }),
				Q("grayscale", S("Grayscale"), [{
					value: "0",
					label: S("Off")
				}, {
					value: "100",
					label: S("On")
				}]),
				Z("mixBlendMode", S("Blend"), { placeholder: "normal" }),
				Z("mask", S("Mask"), {
					placeholder: S("None"),
					title: S("Fade an edge out, or crop to a circle.")
				}),
				Z("cursor", S("Cursor"), { placeholder: S("Auto") }),
				Q("pointerEvents", S("Clicks"), [{
					value: "auto",
					label: S("Yes")
				}, {
					value: "none",
					label: S("Pass Through")
				}])
			]
		})
	});
}
// admin/src/builder/css.ts
function Er(e) {
	let t = [], n = 0, r = "";
	for (let i of e.trim()) i === "(" && n++, i === ")" && n--, /\s/.test(i) && n === 0 ? (r && t.push(r), r = "") : r += i;
	return r && t.push(r), t;
}
function Dr(e) {
	let t = [], n = 0, r = "";
	for (let i of e) i === "(" && n++, i === ")" && n--, i === "," && n === 0 ? (t.push(r.trim()), r = "") : r += i;
	return r.trim() && t.push(r.trim()), t;
}
function Or(e) {
	if (e === void 0 || e === "") return null;
	let t = Er(String(e));
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
// admin/src/builder/fields/style.tsx
var kr = [
	"to-t",
	"to-tr",
	"to-r",
	"to-br",
	"to-b",
	"to-bl",
	"to-l",
	"to-tl"
], Ar = {
	"to-t": "↑",
	"to-tr": "↗",
	"to-r": "→",
	"to-br": "↘",
	"to-b": "↓",
	"to-bl": "↙",
	"to-l": "←",
	"to-tl": "↖"
}, jr = [
	"center",
	"top",
	"bottom",
	"left",
	"right",
	"top-left",
	"top-right",
	"bottom-left",
	"bottom-right"
], Mr = [
	"",
	"0",
	"10",
	"20",
	"25",
	"30",
	"40",
	"50",
	"60",
	"70",
	"75",
	"80",
	"90",
	"100"
];
function Nr(e) {
	let t = e?.match(/^(linear|radial)\((.*)\)$/);
	if (!t) return null;
	let n = Dr(t[2]), r = t[1], i = r === "linear" ? "to-b" : "circle";
	n[0] && (kr.includes(n[0]) || /^\d+$/.test(n[0]) || /^(circle|ellipse)/.test(n[0])) && (i = n.shift());
	let a = n.map((e) => {
		let t = Er(e);
		return {
			color: t[0],
			at: (t[1] ?? "").replace("%", "")
		};
	});
	return {
		kind: r,
		head: i,
		stops: a
	};
}
function Pr(e) {
	return `${e.kind}(${[e.head, ...e.stops.map((e) => `${e.color}${e.at ? ` ${e.at}%` : ""}`)].join(", ")})`;
}
function Fr({ value: e, onChange: t, context: n }) {
	let r = Me(), i = Nr(e);
	if (!i) return null;
	let a = (e) => t(Pr(e)), o = `linear-gradient(90deg, ${i.stops.map((e) => `${Pe(e.color, r.resolved)}${e.at ? ` ${e.at}%` : ""}`).join(", ")})`, [s, c] = i.head.split(" ");
	return /* @__PURE__ */ R("div", {
		className: "min-w-0 flex-1 space-y-1 rounded-md bg-active/60 p-1.5",
		children: [
			/* @__PURE__ */ L("div", {
				className: "h-6 rounded-sm shadow-[inset_0_0_0_1px_rgb(0_0_0/0.1)]",
				style: { background: o }
			}),
			/* @__PURE__ */ L(X, {
				bare: !0,
				context: n,
				fields: [{
					handle: "kind",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: S("Kind"),
					required: !0,
					options: [{
						value: "linear",
						label: S("Linear")
					}, {
						value: "radial",
						label: S("Radial")
					}]
				}, i.kind === "linear" ? {
					handle: "head",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: S("Direction"),
					required: !0,
					options: kr.map((e) => ({
						value: e,
						label: Ar[e],
						title: e
					}))
				} : {
					handle: "head",
					type: "select",
					size: "sm",
					label: S("From"),
					required: !0,
					options: jr.map((e) => ({
						value: e === "center" ? "circle" : `circle ${e}`,
						label: e
					}))
				}],
				values: {
					kind: i.kind,
					head: i.kind === "radial" ? c ? `${s} ${c}` : "circle" : i.head
				},
				onChange: (e, t) => a(e === "kind" ? {
					...i,
					kind: t,
					head: t === "radial" ? "circle" : "to-b"
				} : {
					...i,
					head: t
				})
			}),
			i.stops.map((e, t) => /* @__PURE__ */ R("div", {
				className: "flex items-center gap-1",
				children: [/* @__PURE__ */ L(X, {
					bare: !0,
					className: "min-w-0 flex-1",
					context: n,
					fields: [{
						handle: "stop",
						type: "group",
						component: "blocks-group",
						label: S("Stop"),
						fields: [{
							handle: "color",
							type: "color",
							component: "blocks-color",
							label: S("Color")
						}, {
							handle: "at",
							type: "select",
							size: "sm",
							label: S("Position"),
							options: Mr.map((e) => ({
								value: e,
								label: e ? `${e}%` : S("Auto")
							})),
							className: "!flex-none w-16"
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
				}), i.stops.length > 2 && /* @__PURE__ */ L($n, { onClick: () => a({
					...i,
					stops: i.stops.filter((e, n) => n !== t)
				}) })]
			}, t)),
			/* @__PURE__ */ R("button", {
				type: "button",
				onClick: () => a({
					...i,
					stops: [...i.stops, {
						color: "foreground",
						at: ""
					}]
				}),
				className: "flex h-7 w-full items-center justify-center gap-1.5 rounded-sm text-xs text-muted hover:bg-hover hover:text-ink",
				children: [
					/* @__PURE__ */ L(E, {
						name: "b-plus",
						size: 14
					}),
					" ",
					S("Add Stop")
				]
			})
		]
	});
}
var Ir = [
	"start",
	"center",
	"end"
], Lr = () => [
	{
		value: "start",
		label: S("Start")
	},
	{
		value: "center",
		label: S("Center")
	},
	{
		value: "end",
		label: S("End")
	},
	{
		value: "between",
		label: S("Space Between")
	},
	{
		value: "around",
		label: S("Space Around")
	},
	{
		value: "evenly",
		label: S("Space Evenly")
	}
];
function Rr({ field: e, value: t, onChange: n, context: r }) {
	let i = e.row === !0, a = t?.justifyContent ?? void 0, o = t?.alignItems ?? void 0;
	return /* @__PURE__ */ R(nr, { children: [/* @__PURE__ */ L("div", {
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
			let r = Ir[i ? t : e], s = Ir[i ? e : t], c = (a ?? "start") === r && (o ?? "stretch").replace("stretch", "start") === s;
			return /* @__PURE__ */ L("button", {
				type: "button",
				onClick: () => n({
					justifyContent: r,
					alignItems: s
				}),
				className: "grid place-items-center rounded-[2px] hover:bg-hover",
				title: `${r} · ${s}`,
				children: /* @__PURE__ */ L("span", { className: j("rounded-full", c ? "size-2 bg-ink" : "size-1 bg-faint") })
			}, `${t}${e}`);
		}))
	}), /* @__PURE__ */ L(X, {
		bare: !0,
		className: "min-w-0 flex-1",
		context: r,
		fields: [{
			handle: "justifyContent",
			type: "select",
			size: "sm",
			label: S("Distribute"),
			options: Lr(),
			placeholder: S("Distribute")
		}, {
			handle: "alignItems",
			type: "select",
			display: "segmented",
			block: !0,
			size: "sm",
			label: S("Align"),
			options: [
				{
					value: "start",
					icon: i ? "b-align-top" : "b-align-left",
					title: S("Start")
				},
				{
					value: "center",
					icon: i ? "b-align-center-vertical" : "b-align-center-horizontal",
					title: S("Center")
				},
				{
					value: "end",
					icon: i ? "b-align-bottom" : "b-align-right",
					title: S("End")
				},
				{
					value: "stretch",
					icon: i ? "b-arrows-out-line-vertical" : "b-arrows-out-line-horizontal",
					title: S("Stretch")
				},
				{
					value: "baseline",
					icon: "b-text-t",
					title: S("Baseline")
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
var zr = [
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
], Br = {
	left: "0%",
	top: "0%",
	center: "50%",
	right: "100%",
	bottom: "100%"
};
function Vr(e) {
	let t = (e ?? "center").trim().split(/\s+/), n = (e) => e === "top" || e === "bottom";
	t.length === 1 && t.push("center");
	let [r, i] = n(t[0]) || t[1] && (t[1] === "left" || t[1] === "right") ? [t[1], t[0]] : t;
	return `${Br[r] ?? r} ${Br[i] ?? i}`;
}
function Hr({ field: e, value: t, onChange: n, disabled: r }) {
	let i = Vr(t);
	return /* @__PURE__ */ R(nr, { children: [/* @__PURE__ */ L("div", {
		className: "grid size-[60px] shrink-0 grid-cols-3 gap-px rounded-sm bg-bg p-1",
		role: "radiogroup",
		"aria-label": e.label,
		children: zr.flat().map((t) => {
			let a = i === Vr(t);
			return /* @__PURE__ */ L("button", {
				type: "button",
				role: "radio",
				"aria-checked": a,
				disabled: r,
				onClick: () => n(t === "center" && !e.required ? null : t),
				className: "grid place-items-center rounded-[2px] hover:bg-hover",
				title: t,
				children: /* @__PURE__ */ L("span", { className: j("rounded-full", a ? "size-2 bg-ink" : "size-1 bg-faint") })
			}, t);
		})
	}), /* @__PURE__ */ L("span", {
		className: "min-w-0 truncate text-xs text-muted",
		children: t ?? S("Center")
	})] });
}
// admin/src/builder/design/Fill.tsx
var Ur = {
	backgroundImage: null,
	backgroundSize: null,
	backgroundPosition: null,
	backgroundRepeat: null
};
function Wr({ s: e }) {
	let t = Me(), n = t.resolved, r = e.value("backgroundImage"), i = r ? Nr(r) ? "gradient" : "image" : "none", a = r?.match(/^media:([0-9a-z]{26})$/i)?.[1], o = e.value("scheme"), s = t.names("scheme"), c = e.variant === "base";
	return /* @__PURE__ */ R(Y, {
		title: S("Color"),
		empty: !o && !e.value("backgroundColor") && !r && !e.value("texture"),
		children: [
			/* @__PURE__ */ R("div", {
				className: "flex min-h-7 items-center gap-1 pb-1",
				children: [/* @__PURE__ */ L("span", {
					className: "w-[88px] shrink-0 text-xs text-muted",
					children: S("Scheme")
				}), /* @__PURE__ */ L("div", {
					className: "flex min-w-0 flex-1 flex-wrap gap-1",
					children: s.map((t) => {
						let r = n?.schemes[t === "muted" ? "muted-light" : t === "inverse" ? n.schemes.dark ? "dark" : "neutral" : t];
						return /* @__PURE__ */ L("button", {
							type: "button",
							disabled: !c,
							onClick: () => e.set("scheme", o === t ? null : t),
							"aria-pressed": o === t,
							title: c ? t : S("A scheme is set for every screen size: switch to Desktop to change it."),
							className: `grid size-7 place-items-center rounded-sm text-[11px] font-semibold ring-1 ring-border disabled:opacity-40 ${o === t ? "outline-2 outline-offset-1 outline-focus" : ""}`,
							style: {
								background: r?.background,
								color: r?.foreground
							},
							children: "Aa"
						}, t);
					})
				})]
			}),
			/* @__PURE__ */ L($, {
				s: e,
				fields: [vr("backgroundColor", S("Background")), Q("kind", S("Image"), [
					{
						value: "none",
						label: S("None")
					},
					{
						value: "gradient",
						icon: "b-gradient",
						title: S("Gradient")
					},
					{
						value: "image",
						icon: "b-image",
						title: S("Image")
					}
				], {
					keys: ["backgroundImage"],
					reset: () => e.write(Ur),
					get: () => i,
					set: (t) => {
						t === "gradient" ? e.set("backgroundImage", "linear(to-b, primary, background)") : t === "image" ? e.write({
							backgroundImage: "none",
							backgroundSize: "cover",
							backgroundPosition: "center"
						}) : e.write(Ur);
					}
				})]
			}),
			i === "gradient" && /* @__PURE__ */ L($, {
				s: e,
				bare: !0,
				fields: [{
					handle: "backgroundImage",
					type: "text",
					component: "blocks-gradient",
					className: "items-start",
					label: S("Gradient")
				}]
			}),
			i === "image" && /* @__PURE__ */ L("div", {
				className: "rounded-md bg-active/60 p-1.5 text-xs",
				children: /* @__PURE__ */ L(T, {
					bare: !0,
					fields: [{
						handle: "bg",
						type: "media",
						label: S("Image"),
						max: 1,
						accept: "image/*"
					}],
					values: { bg: a ? [a] : [] },
					onChange: (t, n) => e.set("backgroundImage", n?.[0] ? `media:${n[0]}` : "none")
				})
			}),
			/* @__PURE__ */ L($, {
				s: e,
				fields: [
					i === "image" && Q("backgroundSize", S("Size"), [
						{
							value: "cover",
							label: S("Cover")
						},
						{
							value: "contain",
							label: S("Contain")
						},
						{
							value: "auto",
							label: S("Original")
						}
					]),
					i === "image" && {
						handle: "backgroundPosition",
						type: "json",
						component: "blocks-origin",
						label: S("Position"),
						className: "items-start py-0.5 [&>label]:leading-6"
					},
					i === "image" && Q("backgroundRepeat", S("Repeat"), [{
						value: "no-repeat",
						label: S("Once")
					}, {
						value: "repeat",
						label: S("Tile")
					}]),
					i === "image" && Q("backgroundAttachment", S("Scrolling"), [{
						value: "scroll",
						label: S("With Page")
					}, {
						value: "fixed",
						label: S("Fixed")
					}], {
						get: () => e.value("backgroundAttachment") ?? "scroll",
						set: (t) => e.set("backgroundAttachment", t === "fixed" ? "fixed" : null)
					}),
					i !== "none" && Q("backgroundClip", S("Clip"), [{
						value: "border-box",
						label: S("Box")
					}, {
						value: "text",
						label: S("Text")
					}], {
						get: () => e.value("backgroundClip") ?? "border-box",
						set: (t) => e.write({
							backgroundClip: t === "text" ? "text" : null,
							color: t === "text" ? "transparent" : null
						})
					}),
					Z("texture", S("Texture"), {
						placeholder: S("None"),
						disabled: !c
					})
				]
			}),
			o && n && /* @__PURE__ */ L("p", {
				className: "m-0 pl-[88px] text-2xs text-faint",
				style: { color: Pe("foreground-muted", n) },
				children: S("Colors inside follow the {scheme} scheme.", { scheme: o })
			})
		]
	});
}
// admin/src/builder/design/Layout.tsx
var Gr = () => [
	{
		value: "block",
		icon: "b-square",
		title: S("Block")
	},
	{
		value: "flex",
		icon: "b-rows",
		title: S("Stack")
	},
	{
		value: "grid",
		icon: "b-grid-four",
		title: S("Grid")
	},
	{
		value: "inline-flex",
		icon: "b-arrows-in-line-horizontal",
		title: S("Inline Stack")
	},
	{
		value: "none",
		icon: "b-eye-slash",
		title: S("Hidden")
	}
], Kr = () => [
	{
		value: "none",
		label: S("None")
	},
	{
		value: "tight",
		label: S("Tight")
	},
	{
		value: "normal",
		label: S("Normal")
	},
	{
		value: "loose",
		label: S("Loose")
	},
	{
		value: "prose",
		label: S("Prose")
	}
];
function qr({ s: e }) {
	let t = e.value("display"), n = t === "flex" || t === "inline-flex", r = t === "grid" || t === "inline-grid", i = n && (e.value("flexDirection") ?? "row").startsWith("row");
	return /* @__PURE__ */ L(Y, {
		title: S("Layout"),
		empty: !t && !e.value("flow"),
		children: /* @__PURE__ */ L($, {
			s: e,
			fields: [
				Q("display", S("Display"), Gr()),
				!n && !r && Q("flow", S("Flow"), Kr(), { title: S("The space between children, set once in the theme. Prose adds more before headings and around media.") }),
				n && Q("flexDirection", S("Direction"), [
					{
						value: "row",
						icon: "b-arrow-right",
						title: S("Horizontal")
					},
					{
						value: "column",
						icon: "b-arrow-down",
						title: S("Vertical")
					},
					{
						value: "row-reverse",
						icon: "b-arrow-left",
						title: S("Horizontal, Reversed")
					},
					{
						value: "column-reverse",
						icon: "b-arrow-up",
						title: S("Vertical, Reversed")
					}
				], { get: () => e.value("flexDirection") ?? "row" }),
				n && {
					handle: "align",
					type: "json",
					component: "blocks-align",
					label: S("Align"),
					row: i,
					keys: ["alignItems", "justifyContent"],
					get: () => ({
						justifyContent: e.value("justifyContent"),
						alignItems: e.value("alignItems")
					})
				},
				(n || r) && Z("gap", S("Gap"), {
					prefixIcon: i ? "b-split-horizontal" : "b-split-vertical",
					placeholder: "0"
				}),
				n && Q("flexWrap", S("Wrap"), [{
					value: "nowrap",
					label: S("One Line")
				}, {
					value: "wrap",
					label: S("Wrap")
				}], {
					get: () => e.value("flexWrap") ?? "nowrap",
					set: (t) => e.set("flexWrap", t === "wrap" ? "wrap" : null)
				}),
				r && {
					handle: "gridTemplateColumns",
					type: "number",
					size: "sm",
					label: S("Columns"),
					min: 1,
					max: 24,
					placeholder: "1",
					get: () => /^\d+$/.test(e.value("gridTemplateColumns") ?? "") ? Number(e.value("gridTemplateColumns")) : void 0,
					set: (t) => e.set("gridTemplateColumns", t ? String(Math.max(1, Math.min(24, Number(t)))) : null),
					title: S("Equal columns, 1 to 24. Place children on them in Grid Item.")
				},
				r && Q("alignItems", S("Align"), [
					{
						value: "start",
						icon: "b-align-top",
						title: S("Top")
					},
					{
						value: "center",
						icon: "b-align-center-vertical",
						title: S("Middle")
					},
					{
						value: "end",
						icon: "b-align-bottom",
						title: S("Bottom")
					},
					{
						value: "stretch",
						icon: "b-arrows-out-line-vertical",
						title: S("Stretch")
					}
				]),
				r && Q("gridAutoFlow", S("Flow"), [
					{
						value: "row",
						icon: "b-arrow-right",
						title: S("Rows First")
					},
					{
						value: "column",
						icon: "b-arrow-down",
						title: S("Columns First")
					},
					{
						value: "row dense",
						icon: "b-squares-four",
						title: S("Fill Gaps")
					}
				]),
				(n || r) && Z("containerType", S("Container"), {
					placeholder: S("No"),
					title: S("Children can respond to this element’s width (@sm…@4xl).")
				})
			]
		})
	});
}
function Jr({ s: e, parentDisplay: t }) {
	if (!t || !/flex|grid/.test(t)) return null;
	let n = t.includes("grid"), r = e.value("gridColumn") ?? "", i = r.match(/^(\d+) \/ span (\d+)$/), a = i ? Number(i[2]) : /^\d+$/.test(r) ? Number(r) : void 0, o = i ? Number(i[1]) : void 0, s = (t) => {
		let n = t.span ?? a, r = t.start ?? o;
		e.set("gridColumn", n ? r ? `${r} / span ${n}` : String(n) : null);
	};
	return /* @__PURE__ */ L(Y, {
		title: S(n ? "Grid Item" : "Stack Item"),
		open: !1,
		empty: !e.value("alignSelf") && !e.value("flex") && !e.value("gridColumn"),
		children: /* @__PURE__ */ L($, {
			s: e,
			fields: [
				n && Q("gridColumnFull", S("Width"), [{
					value: "span",
					label: S("Columns")
				}, {
					value: "full",
					label: S("Full Row")
				}], {
					keys: ["gridColumn"],
					get: () => r === "full" ? "full" : "span",
					set: (t) => e.set("gridColumn", t === "full" ? "full" : null)
				}),
				n && r !== "full" && {
					handle: "span",
					type: "number",
					size: "sm",
					label: S("Span"),
					min: 1,
					max: 24,
					placeholder: S("Auto"),
					keys: ["gridColumn"],
					get: () => a,
					set: (e) => s({ span: e ? Number(e) : void 0 })
				},
				n && r !== "full" && {
					handle: "start",
					type: "number",
					size: "sm",
					label: S("Start Line"),
					min: 1,
					max: 25,
					placeholder: S("Auto"),
					keys: ["gridColumn"],
					get: () => o,
					set: (e) => s({ start: e ? Number(e) : void 0 }),
					title: S("Which column line it starts on: overlap items by giving them the same lines.")
				},
				n && Z("gridRow", S("Row"), { placeholder: S("Auto") }),
				!n && Q("flex", S("Grow"), [
					{
						value: "1",
						label: S("Fill")
					},
					{
						value: "none",
						label: S("Fixed")
					},
					{
						value: "initial",
						label: S("Shrink")
					}
				]),
				Q("alignSelf", S("Align Self"), [
					{
						value: "start",
						icon: "b-align-top",
						title: S("Start")
					},
					{
						value: "center",
						icon: "b-align-center-vertical",
						title: S("Center")
					},
					{
						value: "end",
						icon: "b-align-bottom",
						title: S("End")
					},
					{
						value: "stretch",
						icon: "b-arrows-out-line-vertical",
						title: S("Stretch")
					}
				]),
				Z("order", S("Order"), {
					prefixIcon: "b-list-numbers",
					placeholder: "0"
				})
			]
		})
	});
}
// admin/src/builder/design/Position.tsx
function Yr({ s: e }) {
	let t = e.value("position"), n = !!t && t !== "static";
	return /* @__PURE__ */ L(Y, {
		title: S("Position"),
		open: !1,
		empty: !n && !e.value("zIndex"),
		children: /* @__PURE__ */ L($, {
			s: e,
			fields: [
				Q("position", S("Position"), [
					{
						value: "static",
						label: S("Flow")
					},
					{
						value: "relative",
						label: S("Relative")
					},
					{
						value: "absolute",
						label: S("Absolute")
					},
					{
						value: "fixed",
						label: S("Fixed")
					},
					{
						value: "sticky",
						label: S("Sticky")
					}
				]),
				n && Z("top", S("Top"), { placeholder: S("Auto") }),
				n && Z("right", S("Right"), { placeholder: S("Auto") }),
				n && Z("bottom", S("Bottom"), { placeholder: S("Auto") }),
				n && Z("left", S("Left"), { placeholder: S("Auto") }),
				Z("zIndex", S("Layer"), {
					prefixIcon: "b-stack",
					placeholder: S("Auto")
				}),
				n && Q("isolation", S("Isolate"), [{
					value: "auto",
					label: S("No")
				}, {
					value: "isolate",
					label: S("Yes")
				}])
			]
		})
	});
}
// admin/src/builder/design/Size.tsx
var Xr = [
	"width",
	"height",
	"minWidth",
	"maxWidth",
	"minHeight",
	"maxHeight",
	"aspectRatio",
	"overflow",
	"objectFit",
	"objectPosition"
];
function Zr({ s: e, media: t }) {
	return /* @__PURE__ */ L(Y, {
		title: S("Size"),
		empty: !Xr.some((t) => e.value(t)),
		children: /* @__PURE__ */ L($, {
			s: e,
			fields: [
				Z("width", S("Width"), {
					prefixIcon: "b-arrows-out-line-horizontal",
					placeholder: S("Auto")
				}),
				Z("height", S("Height"), {
					prefixIcon: "b-arrows-out-line-vertical",
					placeholder: S("Auto")
				}),
				Z("maxWidth", S("Max Width"), { placeholder: S("None") }),
				Z("minHeight", S("Min Height"), { placeholder: S("None") }),
				Z("minWidth", S("Min Width"), { placeholder: S("None") }),
				Z("maxHeight", S("Max Height"), { placeholder: S("None") }),
				Z("aspectRatio", S("Aspect Ratio"), { placeholder: S("Auto") }),
				Q("overflow", S("Overflow"), [
					{
						value: "visible",
						label: S("Visible")
					},
					{
						value: "hidden",
						label: S("Hidden")
					},
					{
						value: "clip",
						label: S("Clip")
					},
					{
						value: "auto",
						label: S("Scroll")
					}
				]),
				t && Q("objectFit", S("Fit"), [
					{
						value: "cover",
						label: S("Cover")
					},
					{
						value: "contain",
						label: S("Contain")
					},
					{
						value: "fill",
						label: S("Stretch")
					}
				]),
				t && {
					handle: "objectPosition",
					type: "json",
					component: "blocks-origin",
					label: S("Focus"),
					className: "items-start py-0.5 [&>label]:leading-6"
				}
			]
		})
	});
}
// admin/src/builder/design/Spacing.tsx
var Qr = [
	"Top",
	"Right",
	"Bottom",
	"Left"
];
function $r(e, t, n) {
	return [
		`${t}${Qr[n]}`,
		n % 2 == 0 ? `${t}Block` : `${t}Inline`,
		t
	].find((t) => e.value(t) !== void 0) ?? null;
}
function ei(e, t, n) {
	let r = $r(e, t, n);
	if (!r) return;
	let i = e.value(r);
	if (r === t) return Or(i)?.[n];
	if (r.endsWith("Block") || r.endsWith("Inline")) {
		let [e, t] = Er(String(i));
		return n === 0 || n === 3 ? e : t ?? e;
	}
	return i;
}
var ti = (e) => [
	e,
	`${e}Block`,
	`${e}Inline`,
	...Qr.map((t) => `${e}${t}`)
];
function ni({ s: e }) {
	let t = ["margin", "padding"], n = t.some((t) => Qr.some((n, r) => ei(e, t, r))), r = Object.fromEntries(t.map((t) => [t, [
		0,
		1,
		2,
		3
	].map((n) => ei(e, t, n))])), i = Object.fromEntries(t.map((t) => [t, [
		0,
		1,
		2,
		3
	].map((n) => {
		let r = $r(e, t, n);
		return r ? e.status(r) === "own" ? "own" : "inherited" : "none";
	})])), a = (t, n) => {
		let r = {
			[t]: null,
			[`${t}Block`]: null,
			[`${t}Inline`]: null
		}, i = n.every((e) => e !== void 0 && e === n[0]);
		i && (r[t] = n[0]), Qr.forEach((e, a) => r[`${t}${e}`] = i ? null : n[a] ?? null), e.write(r);
	};
	return /* @__PURE__ */ L(Y, {
		title: S("Spacing"),
		empty: !n,
		children: /* @__PURE__ */ L($, {
			s: e,
			bare: !0,
			fields: [{
				handle: "spacing",
				type: "json",
				component: "blocks-spacing",
				className: "items-start",
				label: S("Spacing"),
				sideStatus: i,
				keys: [...ti("margin"), ...ti("padding")],
				get: () => r,
				set: (e) => t.forEach((t) => e[t] !== r[t] && a(t, e[t]))
			}]
		})
	});
}
// admin/src/builder/design/StateBar.tsx
var ri = () => [
	{
		value: "",
		label: S("Default")
	},
	{
		value: "hover",
		label: S("Hover")
	},
	{
		value: "active",
		label: S("Pressed")
	},
	{
		value: "focus-visible",
		label: S("Focus")
	}
], ii = () => [
	{
		value: "before",
		label: S("Before")
	},
	{
		value: "after",
		label: S("After")
	},
	{
		value: "placeholder",
		label: S("Placeholder")
	},
	{
		value: "first",
		label: S("First Item")
	},
	{
		value: "last",
		label: S("Last Item")
	},
	{
		value: "odd",
		label: S("Odd Items")
	},
	{
		value: "even",
		label: S("Even Items")
	},
	{
		value: "current",
		label: S("Current Page")
	},
	{
		value: "group-hover",
		label: S("Hover on Hover Group")
	},
	{
		value: "dark",
		label: S("Dark Mode")
	},
	{
		value: "open",
		label: S("When Open")
	}
];
function ai({ node: t }) {
	let { store: n } = z(), r = H(n, (e) => e.state), i = H(n, (e) => e.breakpoint), a = H(n, (n) => e(n.nodes, t.id)), o = /* @__PURE__ */ new Set([
		...Object.keys(t.logic?.states ?? {}).map((e) => `is-${e}`),
		...Object.keys(t.bind ?? {}).filter((e) => e.startsWith("state:")).map((e) => `is-${e.slice(6)}`),
		...t.logic?.behaviors?.scroll ? ["is-scrolled", ...t.logic.behaviors.scroll.hide ? ["is-hidden"] : []] : [],
		...Object.keys(t.style ?? {}).map((e) => e.split(":").pop()).filter((e) => e.startsWith("is-") || e.startsWith("in-"))
	]), s = /* @__PURE__ */ new Set();
	for (let e of a) Object.keys(e.logic?.states ?? {}).forEach((e) => s.add(`in-${e}`)), e.logic?.behaviors?.scroll && s.add("in-scrolled");
	let c = [...o, ...s].filter((e, t, n) => n.indexOf(e) === t), l = (e) => e.startsWith("is-") ? e.slice(3) : e.startsWith("in-") ? S("in {state}", { state: e.slice(3) }) : [...ri(), ...ii()].find((t) => t.value === e)?.label ?? e, u = (e) => n.setStyleState(e), d = (e) => Object.keys(t.style ?? {}).some((t) => t === e || t.endsWith(`:${e}`)), f = async () => {
		let e = await de({
			title: S("Custom State"),
			description: S("A state a script, behavior or data sets (is-open). Style it here, set it in Interact → States."),
			fields: [{
				handle: "name",
				type: "text",
				label: S("Name"),
				placeholder: "open, active…",
				mono: !0
			}],
			confirm: S("Style It")
		}), t = String(e?.name ?? "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
		t && u(`is-${t}`);
	}, p = [
		...ri(),
		...c.map((e) => ({
			value: e,
			label: l(e)
		})),
		...r && !ri().some((e) => e.value === r) && !c.includes(r) ? [{
			value: r,
			label: l(r)
		}] : []
	], m = i === "tablet" ? S("Tablet and Phone") : i === "mobile" ? S("Phone") : i;
	return /* @__PURE__ */ R("div", {
		className: "space-y-2 border-b border-border px-4 py-3",
		children: [/* @__PURE__ */ R("div", {
			className: "flex items-start gap-1",
			children: [/* @__PURE__ */ L("div", {
				"data-wrap": !0,
				className: "flex min-w-0 flex-1 flex-wrap gap-0.5 rounded-md bg-active p-0.5",
				role: "radiogroup",
				"aria-label": S("State"),
				children: p.map((e) => /* @__PURE__ */ R("button", {
					type: "button",
					role: "radio",
					"aria-checked": r === e.value,
					onClick: () => u(e.value),
					className: j("relative flex h-6 flex-[1_0_auto] items-center justify-center gap-1 whitespace-nowrap rounded-[6px] px-1.5 text-xs font-medium transition-colors duration-120", r === e.value ? "bg-float text-ink shadow-raise dark:bg-[color-mix(in_srgb,var(--cms-float),var(--cms-ink)_12%)]" : "text-muted hover:text-text"),
					children: [/* @__PURE__ */ L("span", { children: e.label }), e.value && d(e.value) && r !== e.value && /* @__PURE__ */ L("span", {
						className: "size-1 shrink-0 rounded-full bg-current opacity-70",
						"aria-hidden": !0
					})]
				}, e.value || "default"))
			}), /* @__PURE__ */ L(O, {
				align: "end",
				trigger: /* @__PURE__ */ L("button", {
					type: "button",
					className: "grid size-7 shrink-0 place-items-center rounded-sm text-muted hover:bg-hover hover:text-ink",
					"aria-label": S("More States"),
					title: S("More States"),
					children: /* @__PURE__ */ L(E, {
						name: "b-plus",
						size: 14
					})
				}),
				items: [
					...ii().map((e) => ({
						label: e.label,
						onSelect: () => u(e.value),
						checked: r === e.value
					})),
					{
						separator: !0,
						label: ""
					},
					{
						label: S("Custom State…"),
						onSelect: () => void f()
					}
				]
			})]
		}), i !== "base" && /* @__PURE__ */ R("div", {
			className: "flex h-7 items-center gap-2 rounded-sm bg-bg px-2 text-xs text-text",
			children: [
				/* @__PURE__ */ L(E, {
					name: i === "mobile" ? "b-device-mobile" : "b-device-tablet",
					size: 14,
					className: "shrink-0 text-muted"
				}),
				/* @__PURE__ */ L("span", {
					className: "min-w-0 flex-1 truncate",
					children: m
				}),
				/* @__PURE__ */ L("button", {
					type: "button",
					onClick: () => n.setBreakpoint("base"),
					className: "shrink-0 rounded-xs px-1 text-muted hover:text-ink",
					children: S("Back to Desktop")
				})
			]
		})]
	});
}
// admin/src/builder/design/Transform.tsx
var oi = [
	"translateX",
	"translateY",
	"rotate",
	"scale",
	"skewX",
	"skewY",
	"transformOrigin",
	"perspective"
];
function si({ s: e }) {
	return /* @__PURE__ */ L(Y, {
		title: S("Transform"),
		open: !1,
		empty: !oi.some((t) => e.value(t)),
		children: /* @__PURE__ */ L($, {
			s: e,
			fields: [
				Z("translateX", S("Move X"), {
					prefixIcon: "b-arrows-out-line-horizontal",
					placeholder: "0"
				}),
				Z("translateY", S("Move Y"), {
					prefixIcon: "b-arrows-out-line-vertical",
					placeholder: "0"
				}),
				Z("rotate", S("Rotate"), {
					prefixIcon: "b-arrow-clockwise",
					placeholder: "0"
				}),
				Z("scale", S("Scale"), { placeholder: "100" }),
				Z("skewX", S("Skew X"), { placeholder: "0" }),
				Z("skewY", S("Skew Y"), { placeholder: "0" }),
				{
					handle: "transformOrigin",
					type: "json",
					component: "blocks-origin",
					label: S("Origin"),
					className: "items-start py-0.5 [&>label]:leading-6"
				},
				Z("perspective", S("Depth"), { placeholder: S("None") })
			]
		})
	});
}
// admin/src/builder/design/Transition.tsx
function ci({ s: e }) {
	let t = !!e.value("transitionProperty");
	return /* @__PURE__ */ L(Y, {
		title: S("Transition"),
		open: !1,
		empty: !t,
		children: /* @__PURE__ */ L($, {
			s: e,
			fields: [
				Z("transitionProperty", S("Animate"), { placeholder: S("Nothing") }),
				t && Z("transitionDuration", S("Duration"), { placeholder: "base" }),
				t && Z("transitionTimingFunction", S("Easing"), { placeholder: "out" }),
				t && Z("transitionDelay", S("Delay"), { placeholder: S("None") })
			]
		})
	});
}
// admin/src/builder/design/Typography.tsx
var li = [
	"text",
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
	"lineClamp",
	"textShadow",
	"textStrokeWidth"
];
function ui({ s: e }) {
	let t = Me(), n = e.value("text"), r = n ? t.resolved?.textStyles[n] : void 0, i = li.slice(1, 6).some((t) => e.value(t));
	return /* @__PURE__ */ R(Y, {
		title: S("Typography"),
		empty: !li.some((t) => e.value(t)),
		children: [
			/* @__PURE__ */ L($, {
				s: e,
				fields: [
					Z("text", S("Text Style"), {
						prefixIcon: "b-text-aa",
						placeholder: S("Inherit"),
						title: S("Family, size, weight, line height, letter spacing and case in one name, from the theme.")
					}),
					vr("color", S("Color")),
					Q("textAlign", S("Align"), [
						{
							value: "start",
							icon: "b-text-align-left",
							title: S("Start")
						},
						{
							value: "center",
							icon: "b-text-align-center",
							title: S("Center")
						},
						{
							value: "end",
							icon: "b-text-align-right",
							title: S("End")
						},
						{
							value: "justify",
							icon: "b-text-align-justify",
							title: S("Justify")
						}
					])
				]
			}),
			r && !i && /* @__PURE__ */ L("p", {
				className: "m-0 pb-1 pl-[88px] text-2xs text-faint",
				children: S("{font} · {size} · {weight}", {
					font: r.font,
					size: r.size,
					weight: r.weight
				})
			}),
			/* @__PURE__ */ L($, {
				s: e,
				fields: [
					Z("fontFamily", S("Font"), { placeholder: r ? r.font : S("Inherit") }),
					Z("fontSize", S("Size"), { placeholder: r ? r.size : S("Inherit") }),
					Z("fontWeight", S("Weight"), { placeholder: r ? r.weight : S("Inherit") }),
					Z("lineHeight", S("Line Height"), {
						prefixIcon: "b-arrows-vertical",
						placeholder: S("From size")
					}),
					Z("letterSpacing", S("Letter Spacing"), {
						prefixIcon: "b-arrows-out-line-horizontal",
						placeholder: S("From size")
					}),
					Q("fontStyle", S("Style"), [{
						value: "normal",
						icon: "b-text-t",
						title: S("Upright")
					}, {
						value: "italic",
						icon: "b-text-italic",
						title: S("Italic")
					}]),
					Q("textDecorationLine", S("Decoration"), [
						{
							value: "none",
							icon: "b-x",
							title: S("None")
						},
						{
							value: "underline",
							icon: "b-text-underline",
							title: S("Underline")
						},
						{
							value: "line-through",
							icon: "b-text-strikethrough",
							title: S("Strike Through")
						}
					]),
					Q("textTransform", S("Case"), [
						{
							value: "none",
							icon: "b-x",
							title: S("As Typed")
						},
						{
							value: "uppercase",
							label: "AA",
							title: S("Uppercase")
						},
						{
							value: "capitalize",
							label: "Aa",
							title: S("Capitalize")
						},
						{
							value: "lowercase",
							label: "aa",
							title: S("Lowercase")
						}
					]),
					Q("textWrap", S("Wrap"), [
						{
							value: "balance",
							label: S("Balance")
						},
						{
							value: "pretty",
							label: S("Pretty")
						},
						{
							value: "nowrap",
							label: S("None")
						}
					]),
					Z("lineClamp", S("Max Lines"), {
						prefixIcon: "b-list-dashes",
						placeholder: S("All")
					}),
					Z("textShadow", S("Shadow"), { placeholder: S("None") }),
					Z("textStrokeWidth", S("Outline"), {
						placeholder: S("None"),
						title: S("Outlined text: set the color to transparent and pick an outline color.")
					}),
					!!e.value("textStrokeWidth") && vr("textStrokeColor", S("Outline Color"), { placeholder: S("Text Color") }),
					Z("fontVariantNumeric", S("Figures"), { placeholder: S("Normal") })
				]
			})
		]
	});
}
// admin/src/builder/design/DesignPanel.tsx
function di({ node: e }) {
	let { types: t, store: n } = z(), r = t.get(e.type), i = _r(e), a = H(n, (t) => c(t.nodes, e.id)), o = a ? a.style?.base?.display ?? (a.type === "stack" || a.type === "columns" || a.type === "grid" ? "flex" : void 0) : void 0, s = new Set(r?.styles?.length ? r.styles : [
		"layout",
		"grid",
		"position",
		"size",
		"spacing",
		"typography",
		"color",
		"border",
		"effects",
		"transform",
		"motion"
	]), l = !!r?.children || e.type === "repeat";
	return e.type === "pattern" ? /* @__PURE__ */ L("p", {
		className: "m-0 p-4 text-xs text-muted",
		children: S("Edit the component to change its shared design.")
	}) : /* @__PURE__ */ R("div", { children: [
		/* @__PURE__ */ L(ai, { node: e }),
		s.has("layout") && l && /* @__PURE__ */ L(qr, { s: i }),
		/* @__PURE__ */ L(Jr, {
			s: i,
			parentDisplay: o
		}),
		s.has("position") && /* @__PURE__ */ L(Yr, { s: i }),
		s.has("size") && /* @__PURE__ */ L(Zr, {
			s: i,
			media: [
				"image",
				"video",
				"embed"
			].includes(e.type)
		}),
		s.has("spacing") && /* @__PURE__ */ L(ni, { s: i }),
		s.has("typography") && /* @__PURE__ */ L(ui, { s: i }),
		s.has("color") && /* @__PURE__ */ L(Wr, { s: i }),
		s.has("border") && /* @__PURE__ */ L(Cr, { s: i }),
		s.has("effects") && /* @__PURE__ */ L(Tr, { s: i }),
		s.has("transform") && /* @__PURE__ */ L(si, { s: i }),
		s.has("motion") && /* @__PURE__ */ L(ci, { s: i })
	] });
}
// admin/src/builder/logic/LogicPanel.tsx
var fi = () => [
	{
		value: "click",
		label: S("Click")
	},
	{
		value: "mouseenter",
		label: S("Pointer Enters")
	},
	{
		value: "mouseleave",
		label: S("Pointer Leaves")
	},
	{
		value: "focus",
		label: S("Gets Focus")
	},
	{
		value: "blur",
		label: S("Loses Focus")
	},
	{
		value: "input",
		label: S("Typing")
	},
	{
		value: "change",
		label: S("Value Changes")
	},
	{
		value: "submit",
		label: S("Form Submit")
	},
	{
		value: "keydown",
		label: S("Key Pressed")
	},
	{
		value: "enter",
		label: S("Scrolls into View")
	},
	{
		value: "leave",
		label: S("Scrolls Out of View")
	},
	{
		value: "scroll",
		label: S("Page Scrolls")
	},
	{
		value: "resize",
		label: S("Window Resizes")
	},
	{
		value: "init",
		label: S("Page Loads")
	}
], pi = () => [
	{
		value: "prevent",
		label: S("Prevent Default")
	},
	{
		value: "stop",
		label: S("Stop Propagation")
	},
	{
		value: "outside",
		label: S("Outside This Element")
	},
	{
		value: "window",
		label: S("Anywhere on the Page")
	},
	{
		value: "once",
		label: S("Only Once")
	},
	{
		value: "self",
		label: S("On This Element Only")
	},
	{
		value: "debounce",
		label: S("Debounce")
	}
], mi = () => [
	{
		value: "set",
		label: S("Set State"),
		icon: "b-pencil-simple"
	},
	{
		value: "toggle",
		label: S("Toggle State"),
		icon: "b-toggle-left"
	},
	{
		value: "add",
		label: S("Add to Number"),
		icon: "b-plus"
	},
	{
		value: "if",
		label: S("If … Then … Else"),
		icon: "b-git-branch"
	},
	{
		value: "play",
		label: S("Play Animation"),
		icon: "b-play"
	},
	{
		value: "scroll",
		label: S("Scroll To"),
		icon: "b-mouse-scroll"
	},
	{
		value: "fetch",
		label: S("Load Page Part"),
		icon: "b-arrow-square-out"
	},
	{
		value: "copy",
		label: S("Copy to Clipboard"),
		icon: "b-copy"
	},
	{
		value: "go",
		label: S("Go to Link"),
		icon: "b-link"
	},
	{
		value: "theme",
		label: S("Light or Dark Mode"),
		icon: "b-moon"
	},
	{
		value: "focus",
		label: S("Focus Element"),
		icon: "b-crosshair"
	},
	{
		value: "lock",
		label: S("Lock Page Scrolling"),
		icon: "b-lock-simple"
	},
	{
		value: "wait",
		label: S("Wait"),
		icon: "b-timer"
	},
	{
		value: "dispatch",
		label: S("Send Event"),
		icon: "b-broadcast"
	},
	{
		value: "run",
		label: S("Expression"),
		icon: "b-brackets-curly"
	}
];
function hi(t) {
	let { store: n } = z(), r = H(n, (n) => e(n.nodes, t.id));
	return [...new Set([...r, t].flatMap((e) => Object.keys(e.logic?.data ?? {})))];
}
function gi(e) {
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
var _i = (e) => typeof e == "string" ? `'${e}'` : JSON.stringify(e), vi = (e, t, n = {}) => ({
	handle: e,
	type: "text",
	size: "sm",
	commit: "blur",
	label: t,
	mono: !0,
	max: 1e4,
	list: yi,
	placeholder: "open, count > 3, tab === 'a'",
	...n
}), yi = "cms-logic-variables", bi = (e, ...t) => e ? t : [], xi = [
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
function Si({ node: e }) {
	let { store: t, types: n } = z(), r = e.logic ?? {}, i = hi(e), a = (n) => {
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
	].includes(e.type) || (n.get(e.type)?.html ?? "") === "a", c = r.behaviors ?? {};
	return /* @__PURE__ */ R(I, { children: [
		/* @__PURE__ */ L("datalist", {
			id: yi,
			children: [...i, ...i.map((e) => `!${e}`)].map((e) => /* @__PURE__ */ L("option", { value: e }, e))
		}),
		/* @__PURE__ */ L(Y, {
			title: S("State"),
			empty: !r.data,
			open: !!r.data,
			actions: /* @__PURE__ */ L(Qn, {
				label: S("Add Variable"),
				onClick: () => {
					let e = "open", t = 1;
					for (; e in o;) e = `value${t++}`;
					a({ data: {
						...o,
						[e]: e !== "open" && ""
					} });
				}
			}),
			children: /* @__PURE__ */ L(X, {
				bare: !0,
				fields: [{
					handle: "data",
					type: "json",
					component: "blocks-pairs",
					className: "items-start",
					label: S("Variables"),
					key: { strip: "[^a-zA-Z0-9_]" },
					join: "=",
					item: {
						handle: "value",
						type: "text",
						size: "sm",
						commit: "blur",
						label: S("Value"),
						mono: !0
					}
				}],
				values: { data: Object.fromEntries(Object.entries(o).map(([e, t]) => [e, _i(t)])) },
				onChange: (e, t) => a({ data: Object.fromEntries(Object.entries(t).map(([e, t]) => [e, e in o && _i(o[e]) === t ? o[e] : gi(t ?? "")])) })
			})
		}),
		/* @__PURE__ */ L(Y, {
			title: S("Code Component"),
			open: !!r.component,
			empty: !r.component,
			children: /* @__PURE__ */ L(X, {
				fields: [{
					handle: "component",
					type: "text",
					size: "sm",
					commit: "blur",
					label: S("Alpine Name"),
					placeholder: "pricingCalculator",
					mono: !0,
					status: r.component ? "own" : void 0,
					reset: () => a({ component: void 0 }),
					instructions: S("An Alpine component from the site’s custom JavaScript. Replaces State.")
				}],
				values: { component: r.component },
				onChange: (e, t) => a({ component: String(t ?? "").replace(/[^a-zA-Z0-9_$]/g, "") || void 0 })
			})
		}),
		/* @__PURE__ */ R(Y, {
			title: S("Events"),
			empty: !r.on?.length && !r.init?.length,
			open: !!r.on?.length || !!r.init?.length,
			actions: /* @__PURE__ */ L(Qn, {
				label: S("Add Event"),
				onClick: () => a({ on: [...r.on ?? [], {
					event: "click",
					actions: []
				}] })
			}),
			children: [
				r.init && /* @__PURE__ */ L(wi, {
					title: S("Page Loads"),
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
					return /* @__PURE__ */ L(wi, {
						title: /* @__PURE__ */ L(X, {
							bare: !0,
							className: "min-w-0 flex-1",
							fields: [{
								handle: "trigger",
								type: "group",
								component: "blocks-group",
								label: S("Event"),
								fields: [{
									handle: "event",
									type: "select",
									size: "sm",
									label: S("Event"),
									required: !0,
									options: fi().filter((e) => e.value !== "init")
								}, {
									handle: "key",
									type: "text",
									size: "sm",
									commit: "blur",
									label: S("Keyboard Key"),
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
				!r.init && (r.on?.length ?? 0) > 0 && /* @__PURE__ */ R("button", {
					type: "button",
					onClick: () => a({ init: [] }),
					className: "flex h-7 w-full items-center gap-1.5 rounded-sm px-1.5 text-xs text-muted hover:bg-hover hover:text-ink",
					children: [
						/* @__PURE__ */ L(E, {
							name: "b-plus",
							size: 14
						}),
						" ",
						S("When the Page Loads")
					]
				})
			]
		}),
		/* @__PURE__ */ R(Y, {
			title: S("Bindings"),
			empty: !r.show && !r.states && !r.text && !r.attrs,
			open: !!(r.show || r.states || r.text || r.attrs),
			children: [
				/* @__PURE__ */ L(X, {
					fields: [vi("show", S("Show When"), {
						placeholder: S("Always"),
						status: r.show ? "own" : void 0,
						reset: () => a({
							show: void 0,
							transition: void 0
						})
					}), ...bi(r.show, {
						handle: "transition",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: S("Transition"),
						options: [
							{
								value: "none",
								label: S("None")
							},
							{
								value: "fade",
								label: S("Fade")
							},
							{
								value: "scale",
								label: S("Scale")
							},
							{
								value: "collapse",
								label: S("Collapse")
							}
						]
					})],
					values: {
						show: r.show,
						transition: r.transition ?? "none"
					},
					onChange: (e, t) => a(e === "show" ? { show: t || void 0 } : { transition: t && t !== "none" ? t : void 0 })
				}),
				/* @__PURE__ */ L(Gn, {
					title: S("States"),
					action: /* @__PURE__ */ L(Qn, {
						label: S("Add State"),
						onClick: () => a({ states: {
							...r.states ?? {},
							[Object.keys(r.states ?? {}).length ? `state${Object.keys(r.states ?? {}).length + 1}` : "open"]: i[0] ?? "open"
						} })
					})
				}),
				/* @__PURE__ */ L(X, {
					bare: !0,
					fields: [{
						handle: "states",
						type: "json",
						component: "blocks-pairs",
						className: "items-start",
						label: S("States"),
						key: {
							prefix: "is-",
							lower: !0,
							strip: "[^a-z0-9-]",
							className: "!w-[34%] !flex-none"
						},
						join: S("when"),
						item: vi("expr", S("When"))
					}],
					values: { states: r.states },
					onChange: (e, t) => a({ states: t })
				}),
				/* @__PURE__ */ L(X, {
					fields: [vi("text", S("Text"), {
						placeholder: S("As Designed"),
						status: r.text ? "own" : void 0,
						reset: () => a({ text: void 0 }),
						instructions: S("Replace the text with a value, e.g. count")
					})],
					values: { text: r.text },
					onChange: (e, t) => a({ text: t || void 0 })
				}),
				/* @__PURE__ */ L(Gn, {
					title: S("Attributes"),
					action: /* @__PURE__ */ L(Qn, {
						label: S("Bind Attribute"),
						onClick: () => a({ attrs: {
							...r.attrs ?? {},
							"aria-expanded": i[0] ?? "open"
						} })
					})
				}),
				/* @__PURE__ */ L(X, {
					bare: !0,
					fields: [{
						handle: "attrs",
						type: "json",
						component: "blocks-pairs",
						className: "items-start",
						label: S("Attributes"),
						key: {
							options: xi,
							className: ""
						},
						item: vi("expr", S("Value"))
					}],
					values: { attrs: r.attrs },
					onChange: (e, t) => a({ attrs: t })
				}),
				e.type === "input" && /* @__PURE__ */ L(X, {
					fields: [{
						handle: "model",
						type: "select",
						size: "sm",
						label: S("Input Value"),
						placeholder: S("Not kept"),
						options: i,
						status: r.model ? "own" : void 0,
						reset: () => a({ model: void 0 }),
						instructions: S("Keep a variable in sync with what is typed")
					}],
					values: { model: r.model },
					onChange: (e, t) => a({ model: t || void 0 })
				})
			]
		}),
		/* @__PURE__ */ R(Y, {
			title: S("Behaviors"),
			empty: !r.behaviors,
			open: !!r.behaviors,
			children: [
				/* @__PURE__ */ L(Ci, {
					on: !!c.scroll,
					label: S("Scroll States"),
					help: S("Adds is-scrolled once the page scrolls, for headers that change."),
					onToggle: (e) => a({ behaviors: {
						...c,
						scroll: e ? { threshold: 20 } : void 0
					} }),
					fields: [{
						handle: "threshold",
						type: "number",
						size: "sm",
						label: S("After (px scrolled)"),
						min: 0
					}, {
						handle: "hide",
						type: "toggle",
						size: "sm",
						label: S("Add is-hidden While Scrolling Down")
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
				/* @__PURE__ */ L(Ci, {
					on: !!c.spy,
					label: S("Scroll Spy"),
					help: S("Links to #sections inside get is-current while in view."),
					onToggle: (e) => a({ behaviors: {
						...c,
						spy: e ? { offset: 96 } : void 0
					} })
				}),
				/* @__PURE__ */ L(Ci, {
					on: !!c.group,
					label: S("Hover Group"),
					help: S("Children react when this whole element is hovered."),
					onToggle: (e) => a({ behaviors: {
						...c,
						group: e || void 0
					} })
				}),
				/* @__PURE__ */ L(Ci, {
					on: !!c.menu,
					label: S("Menu"),
					help: S("One panel moves between items: each child is a link or button, with an optional panel after it."),
					onToggle: (e) => a({ behaviors: {
						...c,
						menu: e ? {} : void 0
					} })
				}),
				/* @__PURE__ */ L(Ci, {
					on: !!c.carousel,
					label: S("Carousel"),
					help: S("The first child scrolls sideways. The first two buttons after it go back and forward."),
					onToggle: (e) => a({ behaviors: {
						...c,
						carousel: e ? {} : void 0
					} })
				}),
				/* @__PURE__ */ L(Ci, {
					on: !!c.marquee,
					label: S("Marquee"),
					help: S("Children scroll sideways in an endless loop."),
					onToggle: (e) => a({ behaviors: {
						...c,
						marquee: e ? { speed: 60 } : void 0
					} }),
					fields: [
						{
							handle: "speed",
							type: "number",
							size: "sm",
							label: S("Speed"),
							min: 1,
							title: S("Pixels per Second")
						},
						{
							handle: "reverse",
							type: "toggle",
							size: "sm",
							label: S("Reverse")
						},
						{
							handle: "pause",
							type: "toggle",
							size: "sm",
							label: S("Pause on Hover")
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
				})
			]
		}),
		s && /* @__PURE__ */ L(Y, {
			title: S("Load Into"),
			open: !!r.target,
			empty: !r.target && !r.merge,
			children: /* @__PURE__ */ L(X, {
				fields: [
					{
						handle: "target",
						type: "json",
						component: "blocks-nodes",
						label: S("Update"),
						exclude: e.id,
						add: S("Element to Update"),
						addValue: e.id,
						instructions: S("Load the link in the background and swap only these elements")
					},
					...bi(r.target, {
						handle: "push",
						type: "toggle",
						size: "sm",
						label: S("Update the Address Bar")
					}),
					{
						handle: "merge",
						type: "select",
						size: "sm",
						label: S("When Loaded"),
						placeholder: S("Replace It"),
						instructions: S("How this element takes new content loaded into it"),
						options: [
							{
								value: "replace",
								label: S("Replace It")
							},
							{
								value: "update",
								label: S("Replace What Is Inside")
							},
							{
								value: "append",
								label: S("Add to the End")
							},
							{
								value: "prepend",
								label: S("Add to the Start")
							},
							{
								value: "morph",
								label: S("Morph (Keep State)")
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
function Ci({ on: e, label: t, help: n, onToggle: r, fields: i, values: a, onChange: o }) {
	return /* @__PURE__ */ R("div", {
		className: j("-mx-1.5 rounded-sm px-1.5 py-1", e && "bg-sunken/60"),
		children: [/* @__PURE__ */ L(X, {
			fields: [{
				handle: "on",
				type: "toggle",
				size: "sm",
				label: t,
				instructions: n
			}],
			values: { on: e },
			onChange: (e, t) => r(!!t)
		}), e && i && /* @__PURE__ */ L(X, {
			className: "mt-1 space-y-1 pl-10",
			fields: i,
			values: a ?? {},
			onChange: o ?? (() => {})
		})]
	});
}
function wi({ title: e, mods: t, onMods: n, actions: r, onActions: i, onRemove: a, variables: o, node: s }) {
	return /* @__PURE__ */ R("div", {
		className: "space-y-1.5 rounded-sm border border-border p-1.5",
		children: [
			/* @__PURE__ */ R("div", {
				className: "flex items-center gap-1",
				children: [
					/* @__PURE__ */ L(E, {
						name: "b-lightning",
						size: 14,
						className: "shrink-0 text-muted"
					}),
					typeof e == "string" ? /* @__PURE__ */ L("span", {
						className: "min-w-0 flex-1 text-xs font-medium [overflow-wrap:anywhere]",
						children: e
					}) : e,
					n && /* @__PURE__ */ L(O, {
						align: "end",
						trigger: /* @__PURE__ */ L("button", {
							type: "button",
							className: j("grid size-6 shrink-0 place-items-center rounded-sm hover:bg-hover hover:text-ink", t?.length ? "text-ink" : "text-muted"),
							"aria-label": S("Event Options"),
							children: /* @__PURE__ */ L(E, {
								name: "b-faders",
								size: 14
							})
						}),
						items: pi().map((e) => ({
							label: e.label,
							checked: t?.includes(e.value),
							onSelect: () => n(t?.includes(e.value) ? t.filter((t) => t !== e.value) : [...t ?? [], e.value])
						}))
					}),
					/* @__PURE__ */ L($n, {
						onClick: a,
						label: S("Remove Event")
					})
				]
			}),
			t && t.length > 0 && /* @__PURE__ */ L("p", {
				className: "m-0 pl-5 text-2xs text-faint [overflow-wrap:anywhere]",
				children: t.map((e) => pi().find((t) => t.value === e)?.label).join(" · ")
			}),
			/* @__PURE__ */ L(Ti, {
				actions: r,
				onChange: i,
				variables: o,
				node: s
			})
		]
	});
}
function Ti({ actions: e, onChange: t, variables: n, node: r, depth: i = 0 }) {
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
	return /* @__PURE__ */ R("div", {
		className: j("space-y-1", i > 0 && "border-l border-border pl-2"),
		children: [e.map((a, s) => /* @__PURE__ */ R("div", {
			className: "space-y-1 rounded-md bg-active/60 p-1.5",
			children: [/* @__PURE__ */ R("div", {
				className: "flex items-center gap-1",
				children: [
					/* @__PURE__ */ L(E, {
						name: mi().find((e) => e.value === a.do)?.icon ?? "b-dot-outline",
						size: 14,
						className: "shrink-0 text-muted"
					}),
					/* @__PURE__ */ L("span", {
						className: "min-w-0 flex-1 text-xs font-medium text-text [overflow-wrap:anywhere]",
						children: mi().find((e) => e.value === a.do)?.label ?? a.do
					}),
					/* @__PURE__ */ L($n, {
						onClick: () => t(e.filter((e, t) => t !== s)),
						label: S("Remove Action")
					})
				]
			}), /* @__PURE__ */ L(Di, {
				action: a,
				onChange: (e) => o(s, e),
				variables: n,
				node: r,
				depth: i
			})]
		}, s)), /* @__PURE__ */ L(O, {
			align: "start",
			trigger: /* @__PURE__ */ R("button", {
				type: "button",
				className: "flex h-7 w-full items-center gap-1.5 rounded-sm px-1.5 text-xs text-muted hover:bg-hover hover:text-ink",
				children: [
					/* @__PURE__ */ L(E, {
						name: "b-plus",
						size: 14
					}),
					" ",
					S("Add Action")
				]
			}),
			items: mi().map((e) => ({
				label: e.label,
				icon: e.icon,
				onSelect: () => a(e.value)
			}))
		})]
	});
}
var Ei = (e) => e === "top" || e === "bottom" ? e : e?.startsWith("#") ? "anchor" : "node";
function Di({ action: e, onChange: n, variables: r, node: i, depth: a }) {
	let { store: o } = z(), s = tt(), c = H(o, (n) => e.do === "play" && e.node ? t(n.nodes, e.node) : null), l = {
		handle: "var",
		type: "select",
		size: "sm",
		label: S("Variable"),
		options: r,
		placeholder: S("Variable")
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
			f = [l, vi("value", e.do === "set" ? S("To") : S("Add"), { placeholder: e.do === "set" ? "true, 'text', count + 1" : "1" })];
			break;
		case "toggle":
			f = [l];
			break;
		case "if":
			f = [vi("test", S("If"), { placeholder: "open" })];
			break;
		case "play":
			f = [
				u("node", S("Element")),
				{
					handle: "motion",
					type: "select",
					size: "sm",
					label: S("Animation"),
					options: (c?.motion ?? []).map((e) => ({
						value: e.id,
						label: e.name || e.id
					})),
					placeholder: c?.motion?.length ? S("First Animation") : S("No animations on it")
				},
				d("mode", S("Play"), [
					{
						value: "play",
						label: S("Play")
					},
					{
						value: "reverse",
						label: S("Reverse")
					},
					{
						value: "toggle",
						label: S("Toggle")
					},
					{
						value: "restart",
						label: S("Restart")
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
					label: S("To"),
					required: !0,
					options: [
						{
							value: "top",
							label: S("Top of Page")
						},
						{
							value: "bottom",
							label: S("Bottom of Page")
						},
						{
							value: "anchor",
							label: S("Section")
						},
						{
							value: "node",
							label: S("Element")
						}
					]
				},
				{
					handle: "anchor",
					type: "select",
					size: "sm",
					label: S("Section"),
					options: s.map((e) => ({
						value: `#${e.id}`,
						label: e.label
					})),
					placeholder: S("Choose a Section"),
					if: { kind: "anchor" }
				},
				u("node", S("Element"), { if: { kind: "node" } }),
				{
					handle: "offset",
					type: "number",
					size: "sm",
					label: S("Offset"),
					placeholder: "0",
					title: S("Offset in pixels, e.g. a sticky header’s height")
				}
			], p = {
				kind: Ei(e.to),
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
				label: S("Page"),
				placeholder: "/blog/page/2",
				mono: !0
			}, {
				handle: "target",
				type: "json",
				component: "blocks-nodes",
				label: S("Update"),
				instructions: S("Elements replaced with the same ones from that page"),
				addValue: i.id
			}];
			break;
		case "copy":
			f = [vi("value", S("Text"), { placeholder: `'${S("Text to Copy")}'` })];
			break;
		case "go":
			f = [{
				handle: "url",
				type: "url",
				component: "link",
				reference: !0,
				size: "sm",
				label: S("Link"),
				anchors: s,
				newTab: !!e.newTab,
				onNewTab: (e) => n({ newTab: e || void 0 })
			}], m = (e, t) => ({ url: t ?? "" });
			break;
		case "theme":
			f = [d("mode", S("Mode"), [
				{
					value: "toggle",
					label: S("Switch")
				},
				{
					value: "light",
					label: S("Light")
				},
				{
					value: "dark",
					label: S("Dark")
				},
				{
					value: "system",
					label: S("System")
				}
			])], p = { mode: e.mode ?? "toggle" };
			break;
		case "focus":
			f = [u("node", S("Element"))], m = (e, t) => ({ node: t ?? void 0 });
			break;
		case "lock":
			f = [d("on", S("Scrolling"), [{
				value: "on",
				label: S("Lock")
			}, {
				value: "off",
				label: S("Unlock")
			}])], p = { on: e.on === !1 ? "off" : "on" }, m = (e, t) => ({ on: t !== "off" });
			break;
		case "wait":
			f = [{
				handle: "ms",
				type: "number",
				size: "sm",
				label: S("Wait (ms)"),
				step: 50,
				min: 0
			}], p = { ms: String(e.ms ?? 300) }, m = (e, t) => ({ ms: Number(t ?? 300) });
			break;
		case "dispatch":
			f = [{
				handle: "event",
				type: "text",
				size: "sm",
				commit: "blur",
				label: S("Event"),
				placeholder: "event-name",
				mono: !0
			}, vi("detail", S("Detail"), { placeholder: "detail" })], m = (e, t) => ({ [e]: e === "detail" ? t || void 0 : t ?? "" });
			break;
		case "run":
			f = [vi("expr", S("Run"), { placeholder: "count = count * 2" })];
			break;
		default: return /* @__PURE__ */ L("p", {
			className: j(Xn, "h-auto whitespace-pre-wrap font-mono [overflow-wrap:anywhere]"),
			children: JSON.stringify(e)
		});
	}
	return /* @__PURE__ */ R("div", {
		className: "space-y-1",
		children: [/* @__PURE__ */ L(X, {
			fields: f,
			values: p,
			onChange: (e, t) => n(m(e, t))
		}), e.do === "if" && /* @__PURE__ */ R(I, { children: [
			/* @__PURE__ */ L("p", {
				className: "cms-label m-0 pt-1",
				children: S("Then")
			}),
			/* @__PURE__ */ L(Ti, {
				actions: e.then ?? [],
				onChange: (e) => n({ then: e }),
				variables: r,
				node: i,
				depth: a + 1
			}),
			/* @__PURE__ */ L("p", {
				className: "cms-label m-0 pt-1",
				children: S("Else")
			}),
			/* @__PURE__ */ L(Ti, {
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
var Oi = (e) => ({
	appear: S("Appear"),
	scroll: S("Scroll"),
	hover: S("Hover and Press"),
	loop: S("Loop"),
	load: S("Page Load"),
	event: S("On Event")
})[e], ki = "out", Ai = () => [
	{
		name: S("Fade In"),
		group: "appear",
		make: () => ({
			trigger: { type: "appear" },
			steps: [{
				target: "self",
				from: { opacity: "0" },
				duration: "slow",
				ease: ki
			}]
		})
	},
	{
		name: S("Fade Up"),
		group: "appear",
		make: () => ({
			trigger: { type: "appear" },
			steps: [{
				target: "self",
				from: {
					opacity: "0",
					y: "xl"
				},
				duration: "slower",
				ease: "expo"
			}]
		})
	},
	{
		name: S("Slide in from Left"),
		group: "appear",
		make: () => ({
			trigger: { type: "appear" },
			steps: [{
				target: "self",
				from: {
					opacity: "0",
					x: "-2xl"
				},
				duration: "slower",
				ease: "expo"
			}]
		})
	},
	{
		name: S("Scale In"),
		group: "appear",
		make: () => ({
			trigger: { type: "appear" },
			steps: [{
				target: "self",
				from: {
					opacity: "0",
					scale: "90"
				},
				duration: "slow",
				ease: "emphasized"
			}]
		})
	},
	{
		name: S("Blur In"),
		group: "appear",
		make: () => ({
			trigger: { type: "appear" },
			steps: [{
				target: "self",
				from: {
					opacity: "0",
					blur: "lg",
					y: "sm"
				},
				duration: "slower",
				ease: ki
			}]
		})
	},
	{
		name: S("Reveal (Wipe Up)"),
		group: "appear",
		make: () => ({
			trigger: { type: "appear" },
			steps: [{
				target: "self",
				from: { clipPath: "hidden-down" },
				to: { clipPath: "visible" },
				duration: "slowest",
				ease: "expo"
			}]
		})
	},
	{
		name: S("Children one by one"),
		group: "appear",
		make: () => ({
			trigger: { type: "appear" },
			steps: [{
				target: "children",
				from: {
					opacity: "0",
					y: "lg"
				},
				duration: "slow",
				ease: ki,
				stagger: "fastest"
			}]
		})
	},
	{
		name: S("Words Rise"),
		group: "appear",
		text: !0,
		make: () => ({
			trigger: { type: "appear" },
			steps: [{
				target: "words",
				from: {
					opacity: "0",
					y: "md"
				},
				duration: "slow",
				ease: ki,
				stagger: "fastest"
			}]
		})
	},
	{
		name: S("Words Slide Up (Masked)"),
		group: "appear",
		text: !0,
		make: () => ({
			trigger: { type: "appear" },
			steps: [{
				target: "words",
				mask: !0,
				from: { y: "full" },
				duration: "slower",
				ease: "expo",
				stagger: "fastest"
			}]
		})
	},
	{
		name: S("Parallax"),
		group: "scroll",
		make: () => ({
			trigger: {
				type: "scroll",
				start: "top bottom",
				end: "bottom top"
			},
			steps: [{
				target: "self",
				from: { y: "-3xl" },
				to: { y: "3xl" },
				ease: "linear",
				duration: "base"
			}]
		})
	},
	{
		name: S("Zoom While Scrolling"),
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
					scale: "90",
					borderRadius: "2xl"
				},
				to: {
					scale: "100",
					borderRadius: "none"
				},
				ease: "linear",
				duration: "base"
			}]
		})
	},
	{
		name: S("Fade Through"),
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
					opacity: "0",
					y: "2xl"
				},
				to: {
					opacity: "100",
					y: "0"
				},
				ease: "linear",
				duration: "base"
			}]
		})
	},
	{
		name: S("Highlight Words"),
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
				from: { opacity: "20" },
				to: { opacity: "100" },
				ease: "linear",
				duration: "base",
				stagger: "faster"
			}]
		})
	},
	{
		name: S("Rotate While Scrolling"),
		group: "scroll",
		make: () => ({
			trigger: { type: "scroll" },
			steps: [{
				target: "self",
				from: { rotate: "-6" },
				to: { rotate: "6" },
				ease: "linear",
				duration: "base"
			}]
		})
	},
	{
		name: S("Slide Sideways"),
		group: "scroll",
		make: () => ({
			trigger: { type: "scroll" },
			steps: [{
				target: "self",
				from: { x: "vw-10" },
				to: { x: "-vw-10" },
				ease: "linear",
				duration: "base"
			}]
		})
	},
	{
		name: S("Lift"),
		group: "hover",
		make: () => ({
			trigger: { type: "hover" },
			steps: [{
				target: "self",
				to: { y: "-2xs" },
				duration: "fast",
				ease: ki
			}]
		})
	},
	{
		name: S("Grow"),
		group: "hover",
		make: () => ({
			trigger: { type: "hover" },
			steps: [{
				target: "self",
				to: { scale: "105" },
				duration: "fast",
				ease: ki
			}]
		})
	},
	{
		name: S("Zoom Image Inside"),
		group: "hover",
		make: () => ({
			trigger: { type: "hover" },
			steps: [{
				target: "children",
				to: { scale: "105" },
				duration: "slow",
				ease: "emphasized"
			}]
		})
	},
	{
		name: S("Press"),
		group: "hover",
		make: () => ({
			trigger: { type: "press" },
			steps: [{
				target: "self",
				to: { scale: "95" },
				duration: "fastest",
				ease: "swift"
			}]
		})
	},
	{
		name: S("Float"),
		group: "loop",
		make: () => ({
			trigger: { type: "loop" },
			repeat: -1,
			yoyo: !0,
			steps: [{
				target: "self",
				to: { y: "-xs" },
				duration: "glacial",
				ease: "in-out"
			}]
		})
	},
	{
		name: S("Spin"),
		group: "loop",
		make: () => ({
			trigger: { type: "loop" },
			repeat: -1,
			steps: [{
				target: "self",
				to: { rotate: "180" },
				duration: "glacial",
				ease: "linear"
			}]
		})
	},
	{
		name: S("Pulse"),
		group: "loop",
		make: () => ({
			trigger: { type: "loop" },
			repeat: -1,
			yoyo: !0,
			steps: [{
				target: "self",
				to: { scale: "105" },
				duration: "slowest",
				ease: "in-out"
			}]
		})
	},
	{
		name: S("Intro: Fade Up"),
		group: "load",
		make: () => ({
			trigger: { type: "load" },
			steps: [{
				target: "self",
				from: {
					opacity: "0",
					y: "lg"
				},
				duration: "slower",
				ease: "expo",
				delay: "faster"
			}]
		})
	},
	{
		name: S("Intro: Words"),
		group: "load",
		text: !0,
		make: () => ({
			trigger: { type: "load" },
			steps: [{
				target: "words",
				mask: !0,
				from: { y: "full" },
				duration: "slower",
				ease: "expo",
				stagger: "fastest"
			}]
		})
	},
	{
		name: S("Intro: Children"),
		group: "load",
		make: () => ({
			trigger: { type: "load" },
			steps: [{
				target: "children",
				from: {
					opacity: "0",
					y: "md"
				},
				duration: "slow",
				ease: ki,
				stagger: "faster"
			}]
		})
	},
	{
		name: S("Open (Fade and Scale)"),
		group: "event",
		make: () => ({
			trigger: { type: "event" },
			steps: [{
				target: "self",
				from: {
					opacity: "0",
					scale: "95"
				},
				duration: "fast",
				ease: "swift"
			}]
		})
	},
	{
		name: S("Slide in Panel"),
		group: "event",
		make: () => ({
			trigger: { type: "event" },
			steps: [{
				target: "self",
				from: { x: "full" },
				duration: "base",
				ease: "swift"
			}, {
				target: "children",
				from: {
					opacity: "0",
					x: "lg"
				},
				duration: "base",
				ease: ki,
				stagger: "fastest"
			}]
		})
	}
], ji = () => ({
	appear: {
		label: S("Appear"),
		icon: "b-eye",
		help: S("Plays once as it scrolls into view.")
	},
	scroll: {
		label: S("Scroll"),
		icon: "b-mouse-scroll",
		help: S("Follows the scroll between a start and an end point.")
	},
	hover: {
		label: S("Hover"),
		icon: "b-hand-pointing",
		help: S("Plays on hover and focus, reverses after.")
	},
	press: {
		label: S("Press"),
		icon: "b-hand-tap",
		help: S("Plays while pressed.")
	},
	load: {
		label: S("Page Load"),
		icon: "b-rocket-launch",
		help: S("Plays as the page paints, with no script. Its delay and stagger are capped, so it can’t hold the page back.")
	},
	loop: {
		label: S("Loop"),
		icon: "b-arrows-clockwise",
		help: S("Stops within 5 seconds, unless it repeats forever. Then the page needs a Motion Toggle block.")
	},
	event: {
		label: S("On Event"),
		icon: "b-broadcast",
		help: S("Plays from a “Play animation” action in Events.")
	}
}), Mi = () => ({
	opacity: S("Opacity"),
	x: S("Move X"),
	y: S("Move Y"),
	z: S("Move Z"),
	scale: S("Scale"),
	scaleX: S("Scale X"),
	scaleY: S("Scale Y"),
	rotate: S("Rotate"),
	rotateX: S("Rotate X (3D)"),
	rotateY: S("Rotate Y (3D)"),
	skewX: S("Skew X"),
	skewY: S("Skew Y"),
	blur: S("Blur"),
	brightness: S("Brightness"),
	grayscale: S("Grayscale"),
	clipPath: S("Reveal"),
	backgroundColor: S("Fill"),
	color: S("Text Color"),
	borderColor: S("Border Color"),
	borderRadius: S("Radius"),
	boxShadow: S("Shadow"),
	letterSpacing: S("Letter Spacing"),
	transformOrigin: S("Origin"),
	perspective: S("Perspective")
}), Ni = (e, ...t) => e ? t : [], Pi = [
	"heading",
	"paragraph",
	"link",
	"button",
	"quote"
], Fi = (e) => {
	let t = e.length + 1;
	for (; e.some((e) => e.id === `m${t}`);) t++;
	return `m${t}`;
}, Ii = (e = "self") => e.startsWith("#") ? S("Another Element") : {
	self: S("This Element"),
	children: S("Children"),
	words: S("Words")
}[e] ?? e;
function Li({ node: e }) {
	let { store: t } = z(), n = e.motion ?? [], [r, i] = F(n[0]?.id ?? null), a = (n) => t.updateNode(e.id, { motion: n.length ? n : void 0 }, `motion:${e.id}`), o = (e, t) => a(n.map((n) => n.id === e ? {
		...n,
		...t
	} : n)), s = Pi.includes(e.type), c = ji(), l = (t) => {
		let r = Fi(n), o = t ? {
			id: r,
			name: t.name,
			...t.make()
		} : {
			id: r,
			name: S("Custom"),
			trigger: { type: "appear" },
			steps: [{
				target: "self",
				from: {
					opacity: "0",
					y: "lg"
				},
				duration: "slow",
				ease: "out"
			}]
		};
		a([...n, o]), i(r), requestAnimationFrame(() => Xt.emit("preview-motion", {
			node: e.id,
			motion: o
		}));
	}, u = Ai(), d = [...new Set(u.map((e) => e.group))];
	return /* @__PURE__ */ L(Y, {
		title: S("Animations"),
		empty: n.length === 0,
		actions: /* @__PURE__ */ L(O, {
			align: "end",
			trigger: /* @__PURE__ */ L("button", {
				type: "button",
				className: "grid size-6 shrink-0 place-items-center rounded-sm text-muted hover:bg-hover hover:text-ink",
				"aria-label": S("Add Animation"),
				children: /* @__PURE__ */ L(E, {
					name: "b-plus",
					size: 14
				})
			}),
			items: [
				...d.flatMap((e) => [{
					label: Oi(e),
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
					label: S("Custom Animation"),
					icon: "b-magic-wand",
					onSelect: () => l()
				}
			]
		}),
		children: n.map((t) => /* @__PURE__ */ R("div", {
			className: j("rounded-sm border", r === t.id ? "border-border-strong" : "border-border"),
			children: [/* @__PURE__ */ R("div", {
				className: "flex h-8 items-center gap-1.5 pl-2 pr-1",
				children: [
					/* @__PURE__ */ L(E, {
						name: c[t.trigger.type]?.icon ?? "b-magic-wand",
						size: 13,
						className: "shrink-0 text-muted"
					}),
					/* @__PURE__ */ R("button", {
						type: "button",
						onClick: () => i(r === t.id ? null : t.id),
						"aria-expanded": r === t.id,
						className: "flex min-w-0 flex-1 items-baseline gap-1.5 text-left",
						children: [/* @__PURE__ */ L("span", {
							className: "truncate text-xs font-medium text-ink",
							children: t.name || c[t.trigger.type]?.label
						}), /* @__PURE__ */ L("span", {
							className: "shrink-0 text-xs text-faint",
							children: c[t.trigger.type]?.label
						})]
					}),
					/* @__PURE__ */ L(A, {
						content: S("Preview Animation"),
						children: /* @__PURE__ */ L("button", {
							type: "button",
							onClick: () => Xt.emit("preview-motion", {
								node: e.id,
								motion: t
							}),
							className: "grid size-6 shrink-0 place-items-center rounded-sm text-muted hover:bg-hover hover:text-ink",
							"aria-label": S("Preview"),
							children: /* @__PURE__ */ L(E, {
								name: "b-play",
								size: 14
							})
						})
					}),
					/* @__PURE__ */ L($n, {
						onClick: () => a(n.filter((e) => e.id !== t.id)),
						label: S("Remove Animation")
					})
				]
			}), r === t.id && /* @__PURE__ */ L(Ri, {
				node: e,
				motion: t,
				onChange: (e) => o(t.id, e)
			})]
		}, t.id))
	});
}
function Ri({ node: e, motion: t, onChange: n }) {
	let [r, i] = F(0), a = ji(), o = t.trigger, s = (e) => n({ trigger: {
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
		label: S("Name")
	}, {
		handle: "type",
		type: "select",
		size: "sm",
		label: S("Trigger"),
		required: !0,
		options: Object.entries(a).map(([e, t]) => ({
			value: e,
			label: t.label
		})),
		instructions: a[o.type]?.help
	}], f = [
		...Ni(o.type === "appear", {
			handle: "start",
			type: "select",
			size: "sm",
			label: S("Starts"),
			placeholder: S("A little into view"),
			options: [
				{
					value: "top 95%",
					label: S("As soon as it peeks in")
				},
				{
					value: "top 85%",
					label: S("A little into view")
				},
				{
					value: "top 65%",
					label: S("A third into view")
				},
				{
					value: "center center",
					label: S("At the Center")
				}
			]
		}, {
			handle: "replay",
			type: "toggle",
			size: "sm",
			label: S("Reverse When Scrolled Back")
		}),
		...Ni(o.type === "scroll", {
			handle: "start",
			type: "select",
			size: "sm",
			label: S("From"),
			placeholder: S("Enters the Screen"),
			options: [
				{
					value: "top bottom",
					label: S("Enters the Screen")
				},
				{
					value: "top 80%",
					label: S("Top at 80%")
				},
				{
					value: "top center",
					label: S("Top at Center")
				},
				{
					value: "top top",
					label: S("Top at Top")
				},
				{
					value: "center center",
					label: S("Centered")
				}
			]
		}, {
			handle: "end",
			type: "select",
			size: "sm",
			label: S("To"),
			placeholder: S("Leaves the Screen"),
			options: [
				{
					value: "bottom top",
					label: S("Leaves the Screen")
				},
				{
					value: "center center",
					label: S("Centered")
				},
				{
					value: "top top",
					label: S("Top at Top")
				},
				{
					value: "bottom center",
					label: S("Bottom at Center")
				},
				{
					value: "bottom bottom",
					label: S("Bottom at Bottom")
				}
			]
		}),
		...Ni(l, {
			handle: "repeat",
			type: "select",
			display: "segmented",
			block: !0,
			size: "sm",
			label: S("Repeat"),
			required: !0,
			options: [
				{
					value: "0",
					label: S("Once")
				},
				{
					value: "1",
					label: S("Twice")
				},
				{
					value: "-1",
					label: S("Forever")
				}
			]
		}, {
			handle: "yoyo",
			type: "toggle",
			size: "sm",
			label: S("Back and Forth")
		}, {
			handle: "hold",
			type: "number",
			size: "sm",
			label: S("Loop as a Timeline, Resting (s)"),
			if: { repeat: "-1" },
			instructions: S("On Appear: all steps loop together while on screen.")
		}),
		...Ni(o.type === "scroll" || o.type === "appear", {
			handle: "watch",
			type: "select",
			component: "blocks-node",
			label: S("Watch"),
			placeholder: S("This Element"),
			exclude: e.id
		}),
		{
			handle: "desktop",
			type: "toggle",
			size: "sm",
			label: S("Plays on Desktop")
		},
		{
			handle: "tablet",
			type: "toggle",
			size: "sm",
			label: S("Plays on Tablet")
		},
		{
			handle: "mobile",
			type: "toggle",
			size: "sm",
			label: S("Plays on Phone")
		}
	], p = t.on ?? [
		"desktop",
		"tablet",
		"mobile"
	], m = {
		name: t.name ?? "",
		type: o.type,
		start: o.start,
		end: o.end,
		replay: o.once === !1,
		desktop: p.includes("desktop"),
		tablet: p.includes("tablet"),
		mobile: p.includes("mobile"),
		repeat: String(t.repeat ?? (o.type === "loop" ? -1 : 0)),
		yoyo: !!t.yoyo,
		hold: t.hold,
		watch: o.node?.slice(1)
	}, h = (e, t) => {
		if (e === "name") n({ name: t ?? "" });
		else if (e === "type") t && s({ type: t });
		else if (e === "start" || e === "end") s({ [e]: t ?? void 0 });
		else if (e === "replay") s({ once: !t && void 0 });
		else if (e === "desktop" || e === "tablet" || e === "mobile") {
			let r = t ? [...p, e] : p.filter((t) => t !== e);
			r.length && n({ on: r.length === 3 ? void 0 : r });
		} else e === "repeat" ? n({ repeat: Number(t ?? 0) }) : e === "yoyo" ? n({ yoyo: t || void 0 }) : e === "hold" ? n({ hold: t === "" || t == null ? void 0 : Number(t) }) : e === "watch" && s({ node: t ? `#${t}` : void 0 });
	}, g = () => {
		n({ steps: [...t.steps, {
			target: "children",
			from: {
				opacity: "0",
				y: "md"
			},
			duration: "slow",
			ease: "out",
			stagger: "fastest"
		}] }), i(t.steps.length);
	};
	return /* @__PURE__ */ R("div", {
		className: "space-y-2 border-t border-border p-2",
		children: [
			/* @__PURE__ */ L(X, {
				fields: [...d, ...f],
				values: m,
				onChange: h
			}),
			o.type === "event" && /* @__PURE__ */ R("p", {
				className: "m-0 flex h-7 items-center gap-2 text-xs",
				children: [/* @__PURE__ */ L("span", {
					className: "w-[88px] shrink-0 text-muted",
					children: S("Animation ID")
				}), /* @__PURE__ */ L("code", {
					className: "select-all font-mono text-text",
					children: t.id
				})]
			}),
			/* @__PURE__ */ L(Ui, {
				steps: t.steps,
				active: u,
				onSelect: i,
				onChange: c,
				onAdd: g
			}),
			t.steps[u] && /* @__PURE__ */ L(Gi, {
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
var zi = {
	instant: 0,
	fastest: 75,
	faster: 120,
	fast: 180,
	base: 280,
	slow: 450,
	slower: 700,
	slowest: 1100,
	glacial: 1800
};
function Bi() {
	let e = Me().resolved?.durations ?? zi;
	return {
		secs: (t) => t ? (e[t] ?? zi[t] ?? 0) / 1e3 : 0,
		nearest: (t) => Object.entries(e).reduce((n, [r, i]) => Math.abs(i / 1e3 - t) < Math.abs((e[n] ?? 0) / 1e3 - t) ? r : n, "base")
	};
}
function Vi(e, t) {
	let n = 0;
	return e.map((e) => {
		let r = e.at ?? n, i = r + t.secs(e.delay), a = t.secs(e.duration ?? "base"), o = t.secs(e.stagger) * 3;
		return n = i + a + o, {
			base: r,
			start: i,
			duration: a,
			spread: o
		};
	});
}
var Hi = (e) => Math.max(0, Math.round(e * 20) / 20);
function Ui({ steps: e, active: t, onSelect: n, onChange: r, onAdd: i }) {
	let a = Bi(), o = Vi(e, a), s = Math.max(.5, ...o.map((e) => e.start + e.duration + e.spread)), c = P(null), l = c.current?.total ?? Math.ceil(s * 2 + .25) / 2, u = l <= 1.5 ? .25 : l <= 4 ? .5 : l <= 10 ? 1 : 2, d = Array.from({ length: Math.floor(l / u) + 1 }, (e, t) => t * u), f = (e) => `${e / l * 100}%`, p = (t, i, o) => {
		t.preventDefault(), t.stopPropagation(), n(i);
		let s = t.currentTarget.closest("[data-track]");
		if (!s) return;
		c.current = {
			total: l,
			width: s.clientWidth
		};
		let u = t.clientX, d = e[i], f = o === "move" ? d.at === void 0 ? a.secs(d.delay) : d.at : a.secs(d.duration ?? "base"), p = (e) => {
			let t = (e.clientX - u) / c.current.width * c.current.total;
			o === "end" ? r(i, { duration: a.nearest(Math.max(.05, f + t)) }) : d.at === void 0 ? r(i, { delay: f + t > .03 ? a.nearest(f + t) : void 0 }) : r(i, { at: Hi(f + t) });
		}, m = () => {
			window.removeEventListener("pointermove", p), window.removeEventListener("pointerup", m), c.current = null;
		};
		window.addEventListener("pointermove", p), window.addEventListener("pointerup", m);
	};
	return /* @__PURE__ */ R("div", {
		className: "rounded-md bg-active/60 py-1.5",
		children: [
			/* @__PURE__ */ R("div", {
				className: "mb-1 flex items-end pr-2",
				children: [/* @__PURE__ */ L("span", {
					className: "w-16 shrink-0 pl-2 text-2xs font-medium text-faint",
					children: S("Timeline")
				}), /* @__PURE__ */ L("div", {
					className: "relative h-3 flex-1",
					children: d.filter((e, t) => d.length <= 5 || t % 2 == 0).map((e) => /* @__PURE__ */ L("span", {
						className: "absolute -translate-x-1/2 font-mono text-[9px] leading-none text-faint first:translate-x-0 last:-translate-x-full",
						style: { left: f(e) },
						children: e === 0 ? "0" : `${e}s`
					}, e))
				})]
			}),
			e.map((e, i) => {
				let a = o[i];
				return /* @__PURE__ */ R("div", {
					className: j("flex h-7 items-center pr-2", i === t && "bg-focus-soft"),
					children: [/* @__PURE__ */ L("button", {
						type: "button",
						onClick: () => n(i),
						className: j("w-16 shrink-0 truncate pl-2 text-left text-2xs", i === t ? "font-medium text-ink" : "text-muted hover:text-text"),
						children: Ii(e.target)
					}), /* @__PURE__ */ R("div", {
						"data-track": !0,
						className: "relative h-full flex-1",
						children: [
							d.map((e) => /* @__PURE__ */ L("span", {
								className: "absolute inset-y-0 w-px bg-border/70",
								style: { left: f(e) }
							}, e)),
							/* @__PURE__ */ R("div", {
								role: "slider",
								tabIndex: 0,
								"aria-label": S("Step {n}", { n: i + 1 }),
								"aria-valuenow": a.start,
								"aria-valuetext": S("Starts at {start}s, runs {duration}s", {
									start: a.start.toFixed(2),
									duration: a.duration.toFixed(2)
								}),
								onPointerDown: (e) => p(e, i, "move"),
								onKeyDown: (t) => {
									if (t.key !== "ArrowLeft" && t.key !== "ArrowRight") return;
									t.preventDefault();
									let n = Object.keys(zi), a = (e, t) => n[Math.max(0, Math.min(n.length - 1, n.indexOf(e ?? "instant") + t))], o = t.key === "ArrowRight" ? 1 : -1;
									t.shiftKey ? r(i, { duration: a(e.duration ?? "base", o) }) : e.at === void 0 ? r(i, { delay: a(e.delay, o) === "instant" ? void 0 : a(e.delay, o) }) : r(i, { at: Hi(e.at + o * .05) });
								},
								className: j("cms-focus-ring group/bar absolute top-1 flex h-4 cursor-grab items-center rounded-[3px] active:cursor-grabbing", i === t ? "bg-focus" : "bg-focus/50 hover:bg-focus/70"),
								style: {
									left: f(a.start),
									width: `max(6px, ${f(a.duration)})`
								},
								children: [/* @__PURE__ */ R("span", {
									className: "pointer-events-none truncate px-1 font-mono text-[9px] leading-none text-white",
									children: [a.duration.toFixed(1), "s"]
								}), /* @__PURE__ */ L("span", {
									onPointerDown: (e) => p(e, i, "end"),
									className: "absolute -right-1 inset-y-0 w-2 cursor-ew-resize",
									"aria-hidden": !0
								})]
							}),
							a.spread > 0 && /* @__PURE__ */ L("span", {
								className: "pointer-events-none absolute top-1 h-4 rounded-r-[3px] bg-focus/20",
								style: {
									left: f(a.start + a.duration),
									width: f(a.spread)
								}
							})
						]
					})]
				}, i);
			}),
			/* @__PURE__ */ R("button", {
				type: "button",
				onClick: i,
				className: "ml-16 mt-0.5 flex h-6 items-center gap-1 rounded-sm px-1.5 text-xs text-muted hover:bg-hover hover:text-ink",
				children: [
					/* @__PURE__ */ L(E, {
						name: "b-plus",
						size: 12
					}),
					" ",
					S("Add Step")
				]
			})
		]
	});
}
var Wi = (e, t, n, r = {}) => ({
	handle: e,
	type: "text",
	component: "blocks-token",
	property: "transitionDuration",
	label: t,
	title: t,
	prefixIcon: n,
	...r
});
function Gi({ node: e, step: t, index: n, count: r, onChange: i, onRemove: a }) {
	let { catalog: o } = z(), s = t.target ?? "self", c = Mi(), l = Object.keys(o.motion?.properties ?? c), u = Pi.includes(e.type), d = (e) => {
		let n = t[e] ?? {}, r = (t, r) => i({ [e]: {
			...n,
			[t]: r
		} }), a = (e) => o.motion?.properties[e], s = (e) => a(e) === "clip" ? {
			handle: "value",
			type: "select",
			size: "sm",
			label: S("Reveal"),
			required: !0,
			options: (o.motion?.clips ?? []).map((e) => ({
				value: e,
				label: e
			}))
		} : {
			handle: "value",
			type: a(e)?.toLowerCase().includes("color") ? "color" : "text",
			component: a(e)?.toLowerCase().includes("color") ? "blocks-color" : "blocks-token",
			property: a(e),
			label: S("Value")
		}, u = {
			opacity: "0",
			scale: "95",
			clipPath: "hidden-down",
			color: "primary",
			backgroundColor: "primary",
			borderColor: "primary",
			borderRadius: "lg",
			boxShadow: "lg",
			letterSpacing: "normal",
			transformOrigin: "center",
			perspective: "normal",
			blur: "md",
			brightness: "110",
			grayscale: "100"
		};
		return /* @__PURE__ */ R("div", {
			className: "space-y-1",
			children: [
				/* @__PURE__ */ R("div", {
					className: "flex h-7 items-center justify-between",
					children: [/* @__PURE__ */ L("span", {
						className: "text-xs font-medium text-muted",
						children: S(e === "from" ? "From" : "To")
					}), /* @__PURE__ */ L(O, {
						align: "end",
						trigger: /* @__PURE__ */ L("button", {
							type: "button",
							className: "grid size-6 shrink-0 place-items-center rounded-sm text-muted hover:bg-hover hover:text-ink",
							"aria-label": S(e === "from" ? "Add a Start Property" : "Add an End Property"),
							children: /* @__PURE__ */ L(E, {
								name: "b-plus",
								size: 14
							})
						}),
						items: l.filter((e) => !(e in n)).map((e) => ({
							label: c[e] ?? e,
							onSelect: () => r(e, u[e] ?? (e.startsWith("scale") ? "95" : e.startsWith("rotate") ? "6" : e.startsWith("skew") ? "3" : "md"))
						}))
					})]
				}),
				Object.keys(n).length === 0 && /* @__PURE__ */ L("p", {
					className: "m-0 text-2xs text-faint",
					children: S(e === "from" ? "As it looks now" : "As Designed")
				}),
				/* @__PURE__ */ L(X, {
					bare: !0,
					fields: [{
						handle: e,
						type: "json",
						component: "blocks-pairs",
						className: "items-start",
						label: S(e === "from" ? "From" : "To"),
						labels: c,
						item: {
							handle: "value",
							type: "text",
							component: "blocks-token",
							label: S("Value")
						},
						items: Object.fromEntries(Object.keys(n).map((e) => [e, s(e)]))
					}],
					values: { [e]: n },
					onChange: (t, n) => {
						let r = Object.fromEntries(Object.entries(n).filter(([, e]) => e !== null && e !== "").map(([e, t]) => [e, String(t)]));
						i({ [e]: Object.keys(r).length ? r : void 0 });
					}
				})
			]
		});
	};
	return /* @__PURE__ */ R("div", {
		className: "space-y-2",
		children: [
			/* @__PURE__ */ R("div", {
				className: "flex h-7 items-center gap-1",
				children: [
					/* @__PURE__ */ L("span", {
						className: "text-xs font-semibold text-text",
						children: r > 1 ? S("Step {n}", { n: n + 1 }) : S("Animate")
					}),
					/* @__PURE__ */ L("span", { className: "flex-1" }),
					r > 1 && /* @__PURE__ */ L($n, {
						onClick: a,
						label: S("Remove Step")
					})
				]
			}),
			/* @__PURE__ */ L(X, {
				fields: [
					{
						handle: "target",
						type: "select",
						size: "sm",
						label: S("Target"),
						required: !0,
						options: [
							{
								value: "self",
								label: S("This Element")
							},
							{
								value: "children",
								label: S("Each Child in Turn")
							},
							...u ? [{
								value: "words",
								label: S("Each Word")
							}] : [],
							{
								value: "other",
								label: S("Another Element")
							}
						]
					},
					...Ni(s.startsWith("#"), {
						handle: "element",
						type: "select",
						component: "blocks-node",
						label: S("Element")
					}),
					...Ni(s === "words", {
						handle: "mask",
						type: "toggle",
						size: "sm",
						label: S("Rise from Behind a Line")
					})
				],
				values: {
					target: s.startsWith("#") ? "other" : s,
					element: s.slice(1),
					mask: !!t.mask
				},
				onChange: (t, n) => i(t === "mask" ? { mask: n || void 0 } : { target: t === "target" ? n === "other" ? `#${e.id}` : n ?? "self" : n ? `#${n}` : "self" })
			}),
			d("from"),
			d("to"),
			/* @__PURE__ */ L(X, {
				fields: [{
					handle: "timing",
					type: "group",
					component: "blocks-group",
					label: S("Timing"),
					columns: 2,
					fields: [
						Wi("duration", S("Duration"), "b-timer"),
						Wi("delay", S("Delay"), "b-clock", { placeholder: S("None") }),
						...Ni(s !== "self", Wi("stagger", S("Time between items"), "b-dots-three", { placeholder: S("None") })),
						...Ni(r > 1, {
							handle: "at",
							type: "number",
							size: "sm",
							label: S("Start in seconds into the timeline"),
							title: S("Start in seconds into the timeline"),
							prefixIcon: "b-flow-arrow",
							min: 0,
							step: .1,
							placeholder: S("After")
						})
					]
				}, {
					handle: "ease",
					type: "text",
					component: "blocks-token",
					property: "transitionTimingFunction",
					label: S("Easing"),
					placeholder: "out"
				}],
				values: {
					timing: {
						duration: t.duration ?? "base",
						delay: t.delay,
						stagger: t.stagger,
						at: t.at
					},
					ease: t.ease
				},
				onChange: (e, t) => i(e === "ease" ? { ease: t ?? void 0 } : {
					duration: t.duration ?? "base",
					delay: t.delay ?? void 0,
					stagger: t.stagger ?? void 0,
					at: t.at !== void 0 && t.at !== null && t.at !== "" ? Number(t.at) : void 0
				})
			})
		]
	});
}
// admin/src/builder/Inspector.tsx
var Ki = [
	"content",
	"design",
	"interact"
], qi = "cms.block.tab";
function Ji(e) {
	if (!e.scrollTop) return null;
	let t = e.getBoundingClientRect().top, n = [...e.querySelectorAll("[data-section]")].find((e) => e.getBoundingClientRect().bottom > t);
	return {
		section: n?.dataset.section,
		offset: n ? n.getBoundingClientRect().top - t : 0,
		scrollTop: e.scrollTop
	};
}
function Yi(e, t) {
	let n = t.section && e.querySelector(`[data-section="${CSS.escape(t.section)}"]`);
	n ? e.scrollTop += n.getBoundingClientRect().top - e.getBoundingClientRect().top - t.offset : e.scrollTop = t.scrollTop;
}
function Xi() {
	try {
		let e = sessionStorage.getItem(qi);
		return Ki.find((t) => t === e) ?? "content";
	} catch {
		return "content";
	}
}
function Zi({ node: e, onBack: t, backLabel: n, onClose: r }) {
	let { store: i, types: a, allowed: s, readOnly: c } = z(), l = a.get(e.type), u = Ae(), [d, f] = F(Xi), p = `block-inspector-${be()}`, [m, h] = F(!1), g = P(null), v = P(e.id), y = P(null);
	v.current !== e.id && (v.current = e.id, y.current = g.current && Ji(g.current)), xe(() => {
		g.current && y.current && Yi(g.current, y.current), y.current = null;
	}, [e.id]);
	let b = (e) => {
		try {
			sessionStorage.setItem(qi, e);
		} catch {}
		f(e);
	}, x = !c && e.type !== "pattern" && _("entries.components.create");
	return /* @__PURE__ */ R("div", {
		className: "flex h-full min-h-0 min-w-0 flex-col",
		"data-blocks-inspector": !0,
		children: [
			/* @__PURE__ */ R("div", {
				className: j("flex h-12 shrink-0 items-center gap-1 pr-3", t ? "pl-2" : "pl-4"),
				children: [
					t && /* @__PURE__ */ L(D, {
						icon: "arrow-left",
						label: n ? S("Back to {name}", { name: n }) : S("Back"),
						size: "sm",
						onClick: t
					}),
					/* @__PURE__ */ L(E, {
						name: e.type === "pattern" ? "b-diamonds-four" : l?.icon ?? "square",
						size: 16,
						className: "ml-1 shrink-0 text-muted"
					}),
					m ? /* @__PURE__ */ L("div", {
						className: "min-w-0 flex-1 pl-1",
						onBlur: () => h(!1),
						onKeyUp: (e) => e.key === "Escape" && e.target.blur(),
						children: /* @__PURE__ */ L(X, {
							bare: !0,
							fields: [{
								handle: "label",
								type: "text",
								size: "sm",
								commit: "blur",
								label: S("Name"),
								autofocus: !0,
								placeholder: l?.title
							}],
							values: { label: e.label ?? "" },
							onChange: (t, n) => i.updateNode(e.id, { label: n.trim() || void 0 })
						})
					}) : /* @__PURE__ */ L("button", {
						type: "button",
						onDoubleClick: () => !c && h(!0),
						className: "min-w-0 flex-1 truncate pl-1 text-left text-sm font-semibold text-ink",
						title: c ? void 0 : S("Double-Click to Rename"),
						children: je(e, a, u)
					}),
					/* @__PURE__ */ L(O, {
						align: "end",
						trigger: /* @__PURE__ */ L(D, {
							icon: "more",
							label: S("Block Actions"),
							size: "sm"
						}),
						items: [
							{
								label: S("Rename"),
								icon: "b-pencil-simple",
								disabled: c,
								onSelect: () => h(!0)
							},
							{
								label: S("Duplicate"),
								icon: "b-copy",
								shortcut: "mod+d",
								disabled: c,
								onSelect: () => i.duplicate(e.id)
							},
							x && {
								label: S("Make a Component"),
								icon: "b-diamonds-four",
								onSelect: () => {
									i.selection().includes(e.id) || i.select(e.id), pt(i, o(i, a, s));
								}
							},
							{
								separator: !0,
								label: ""
							},
							{
								label: S("Delete"),
								icon: "b-trash",
								shortcut: "⌫",
								danger: !0,
								disabled: c,
								onSelect: () => i.remove(e.id)
							}
						]
					}),
					r && /* @__PURE__ */ L(D, {
						icon: "close",
						label: S("Close Panel"),
						size: "sm",
						onClick: r
					})
				]
			}),
			/* @__PURE__ */ L("div", {
				className: "flex h-10 shrink-0 items-center gap-2 border-b border-border pl-4 pr-3",
				children: /* @__PURE__ */ L(se, {
					id: p,
					value: d,
					onChange: b,
					bordered: !1,
					size: "sm",
					className: "h-full min-w-0 flex-1",
					tabs: Ki.map((e) => ({
						value: e,
						label: {
							content: S("Content"),
							design: S("Design"),
							interact: S("Interact")
						}[e]
					}))
				})
			}),
			/* @__PURE__ */ L("fieldset", {
				ref: g,
				role: "tabpanel",
				id: `${p}-${d}-panel`,
				"aria-labelledby": `${p}-${d}`,
				disabled: c,
				className: "m-0 min-h-0 min-w-0 flex-1 overflow-y-auto border-0 p-0",
				children: /* @__PURE__ */ R(he, { children: [
					d === "design" && /* @__PURE__ */ L(di, { node: e }),
					d === "content" && /* @__PURE__ */ L(pr, { node: e }),
					d === "interact" && /* @__PURE__ */ R(I, { children: [/* @__PURE__ */ L(Li, { node: e }), /* @__PURE__ */ L(Si, { node: e })] })
				] }, e.id)
			})
		]
	});
}
export { Xt as A, H as B, sn as C, tn as D, nn as E, tt as F, je as G, Ie as H, Ye as I, Me as J, ke as K, Ve as L, at as M, it as N, $t as O, nt as P, Le as R, cn as S, Zt as T, Fe as U, Pe as V, Oe as W, z as Y, bn as _, ir as a, dn as b, tr as c, Xn as d, Fn as f, vn as g, Tn as h, Hr as i, dt as j, Qt as k, X as l, Cn as m, Rr as n, ar as o, kn as p, Ae as q, Fr as r, nr as s, Zi as t, $n as u, yn as v, un as w, ln as x, xn as y, Be as z };
