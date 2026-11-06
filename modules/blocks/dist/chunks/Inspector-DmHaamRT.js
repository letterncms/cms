import { a as e, c as t, d as n, f as r, g as i, h as a, i as o, l as s, m as c, n as l, o as u, p as d, r as f, t as p, u as m, v as h, y as g } from "./insert-C2qFyCIH.js";
import { can as _, invalidate as v, navigate as y, plural as b, registry as x, requestText as ee, run as te, t as S, useAbility as C, useManifest as w, useManifestIfLoaded as T } from "@letterncms/sdk";
import { Fragment as E, createContext as D, createElement as ne, memo as re, useCallback as ie, useContext as ae, useEffect as O, useId as oe, useLayoutEffect as se, useMemo as ce, useRef as k, useState as A, useSyncExternalStore as j } from "react";
import { Button as M, Dialog as le, Fields as N, Icon as P, IconButton as ue, Menu as de, Popover as fe, QueryError as pe, Segmented as me, Spinner as he, Tabs as ge, Tooltip as _e, cn as F, deviceWidths as ve, fieldControlId as I, fieldVisible as ye, prompt as be, slugify as xe, toast as Se, wideFieldTypes as Ce } from "@letterncms/ui";
import { Fragment as we, jsx as L, jsxs as R } from "react/jsx-runtime";
import { createPortal as Te, flushSync as Ee } from "react-dom";
import { createRoot as De } from "react-dom/client";
// admin/src/core/context.tsx
var Oe = D(null);
function ke({ value: e, children: t }) {
	return e.store.setReadOnly(!!e.readOnly), /* @__PURE__ */ L(Oe.Provider, {
		value: e,
		children: t
	});
}
function z() {
	let e = ae(Oe);
	if (!e) throw Error("Block editor context missing");
	return e;
}
function Ae() {
	let e = C("blocks/types", {}, { staleTime: 3e5 }), t = ce(() => new Map((e.data?.blocks ?? []).map((e) => [e.name, e])), [e.data]);
	return {
		catalog: e.data,
		types: t,
		isLoading: e.isLoading,
		error: e.error,
		retry: () => void e.refetch()
	};
}
function je() {
	let e = C("patterns/list", {}, { staleTime: 6e4 });
	return ce(() => new Map((e.data ?? []).map((e) => [e.handle, e.title])), [e.data]);
}
function Me(e, t, n) {
	return e.label || (e.type === "pattern" ? n.get(String(e.props?.ref ?? "")) : void 0) || t.get(e.type)?.title || e.type;
}
function Ne() {
	let e = C("design/get", {}, {
		staleTime: 6e4,
		retry: !1
	});
	return ce(() => {
		let t = /* @__PURE__ */ new Map();
		for (let n of e.data?.tokens ?? []) t.set(n.group, [...t.get(n.group) ?? [], n]);
		let n = new Map((e.data?.tokens ?? []).map((e) => [e.path, e]));
		return {
			tokens: e.data?.tokens ?? [],
			byGroup: t,
			byPath: n,
			breakpoints: e.data?.breakpoints ?? {
				md: "768px",
				lg: "1024px"
			},
			templates: e.data?.templates ?? {},
			available: !!e.data
		};
	}, [e.data]);
}
// admin/src/core/store.ts
var Pe = class {
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
	selection = () => Le(this.state);
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
	variant = () => Fe(this.state.breakpoint, this.state.state);
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
function Fe(e, t) {
	return e === "base" ? t || "base" : t ? `${e}:${t}` : e;
}
function Ie(e, t) {
	let n = e === "mobile" ? [
		"mobile",
		"tablet",
		"base"
	] : e === "tablet" ? ["tablet", "base"] : ["base"], r = [];
	if (t) for (let e of n) r.push(Fe(e, t));
	return r.push(...n), r;
}
function Le(e) {
	if (!e.selected) return [];
	if (!e.head) return [e.selected];
	let t = r(e.nodes, e.selected);
	if (!t) return [e.selected];
	let n = i(e.nodes, t.parentId), a = n.findIndex((t) => t.id === e.selected), o = n.findIndex((t) => t.id === e.head);
	return o < 0 ? [e.selected] : n.slice(Math.min(a, o), Math.max(a, o) + 1).map((e) => e.id);
}
function Re(e, t) {
	if (Object.is(e, t)) return !0;
	if (Array.isArray(e) && Array.isArray(t)) return e.length === t.length && e.every((e, n) => Object.is(e, t[n]));
	if (e && t && typeof e == "object" && typeof t == "object") {
		let n = Object.keys(e), r = Object.keys(t);
		return n.length === r.length && n.every((n) => Object.is(e[n], t[n]));
	}
	return !1;
}
function B(e, t) {
	let n = k(null);
	return j(e.subscribe, () => {
		let r = t(e.get());
		return n.current && Re(n.current.value, r) ? n.current.value : (n.current = { value: r }, r);
	});
}
// admin/src/core/uniqueIds.ts
function ze(e, t) {
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
function Be(e, t, n) {
	let r = k(t);
	r.current = t;
	let [i] = A(() => new Pe(ze(Array.isArray(e) ? e : [], g), (e) => r.current(e), n)), a = k(e);
	return i.setReadOnly(n), O(() => {
		if (a.current === e) return;
		a.current = e;
		let t = ze(Array.isArray(e) ? e : [], g);
		JSON.stringify(t) !== JSON.stringify(i.get().nodes) && i.reset(t);
	}, [i, e]), i;
}
// admin/src/core/caret.ts
function V(e = document) {
	return e.getSelection()?.isCollapsed ?? !0;
}
function Ve(e, t) {
	let n = e.ownerDocument.getSelection();
	if (!n || n.rangeCount === 0) return null;
	let r = n.getRangeAt(0);
	if (!e.contains(r.startContainer)) return null;
	let i = e.ownerDocument.createRange();
	return i.selectNodeContents(e), t ? i.setEnd(r.startContainer, r.startOffset) : i.setStart(r.endContainer, r.endOffset), i;
}
function He(e) {
	return e ? e.toString().replace(/​/g, "") : "";
}
function H(e) {
	return V(e.ownerDocument) && He(Ve(e, !0)) === "" && !We(Ve(e, !0)).includes("<br");
}
function Ue(e) {
	return V(e.ownerDocument) && He(Ve(e, !1)) === "";
}
function We(e) {
	if (!e) return "";
	let t = e.startContainer.ownerDocument.createElement("div");
	return t.appendChild(e.cloneContents()), t.innerHTML;
}
function Ge(e) {
	return He(Ve(e, !0)).length;
}
function Ke(e) {
	let t = Ve(e, !0), n = Ve(e, !1);
	return [We(t), We(n)];
}
function qe(e) {
	let t = Xe(e.ownerDocument);
	return !t || t.top - e.getBoundingClientRect().top < Ye(e) * .8;
}
function Je(e) {
	let t = Xe(e.ownerDocument);
	return !t || e.getBoundingClientRect().bottom - t.bottom < Ye(e) * .8;
}
function Ye(e) {
	let t = parseFloat(e.ownerDocument.defaultView.getComputedStyle(e).lineHeight);
	return Number.isFinite(t) ? t : 20;
}
function Xe(e = document) {
	let t = e.getSelection();
	if (!t || t.rangeCount === 0) return null;
	let n = t.getRangeAt(0).cloneRange(), r = n.getClientRects();
	if (r.length > 0) return r[0];
	let i = e.createElement("span");
	i.textContent = "​", n.insertNode(i);
	let a = i.getBoundingClientRect();
	return i.remove(), a;
}
function Ze(e, t) {
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
function U(e) {
	let t = document.createElement("div");
	return t.innerHTML = e, (t.textContent ?? "").length;
}
function W(e) {
	return e.replace(/\u200B/g, "").replace(/<(\/?)strike>/g, "<$1s>").replace(/<(\/?)b>/g, "<$1strong>").replace(/<(\/?)i>/g, "<$1em>").replace(/<div><br><\/div>/g, "<br>").replace(/<\/?(div|p|span)[^>]*>/g, "").replace(/ style="[^"]*"/g, "").replace(/&nbsp;/g, " ").replace(/<br>$/, "");
}
var Qe = [
	["**", "strong"],
	["__", "strong"],
	["~~", "s"],
	["`", "code"],
	["*", "em"],
	["_", "em"]
];
function $e(e = document) {
	let t = e.getSelection();
	if (!t || !t.isCollapsed || t.rangeCount === 0) return !1;
	let n = t.anchorNode;
	if (!n || n.nodeType !== Node.TEXT_NODE || n.parentElement?.closest("code")) return !1;
	let r = t.anchorOffset, i = (n.textContent ?? "").slice(0, r);
	for (let [a, o] of Qe) {
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
function et() {
	let { store: e } = z(), t = B(e, (e) => e.nodes), n = /* @__PURE__ */ new Map(), r = [];
	for (let { node: e } of s(t)) {
		let t = String(e.props?.text ?? "").replace(/<[^>]+>/g, "").trim(), i = e.props?.anchor || e.anchor || "";
		if (!i && e.type === "heading" && t) {
			let e = xe(t) || "section", r = (n.get(e) ?? 0) + 1;
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
function G({ html: e, onChange: t, tag: n = "div", placeholder: r, className: i = "", focus: a, onKeyDown: o, onFocus: s, onPaste: c, disabled: l, singleLine: u, quiet: d, plainText: f }) {
	let p = k(null), m = k(e);
	se(() => {
		let t = p.current;
		t && (t.ownerDocument.activeElement === t ? m.current = e : (W(t.innerHTML) !== e && (t.innerHTML = e), m.current = W(t.innerHTML)));
	}, [e]), se(() => {
		a && p.current && Ze(p.current, a.at);
	}, [a?.nonce]);
	let h = () => {
		let e = p.current;
		if (!e) return;
		let n = W(e.innerHTML);
		n !== m.current && (m.current = n, t(n, e));
	};
	return ne(n, {
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
			!f && t.inputType === "insertText" && t.data && /[*_~`]/.test(t.data) && $e(e.currentTarget.ownerDocument), h();
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
			}[e.key.toLowerCase()]), h()) : n && e.shiftKey && e.key.toLowerCase() === "x" ? (e.preventDefault(), t.execCommand("strikeThrough"), h()) : n && e.key.toLowerCase() === "k" ? (e.preventDefault(), e.stopPropagation(), p.current?.ownerDocument.dispatchEvent(new CustomEvent("cms:link"))) : n && e.key.toLowerCase() === "e" ? (e.preventDefault(), tt("code", t), h()) : e.key === "Enter" && e.shiftKey && !u ? (e.preventDefault(), t.execCommand("insertLineBreak"), h()) : p.current && o?.(e, p.current);
		},
		onPaste: (e) => {
			e.preventDefault();
			let t = e.currentTarget.ownerDocument, n = e.clipboardData.getData("text/plain");
			!f && /^(https?:\/\/|mailto:)\S+$/i.test(n.trim()) && !t.getSelection()?.isCollapsed ? (t.execCommand("createLink", !1, n.trim()), h()) : p.current && c?.(n, p.current) || (t.execCommand("insertText", !1, u ? n.replace(/\s*\n\s*/g, " ") : n), h());
		},
		onBlur: () => h()
	});
}
function tt(e, t = document) {
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
function nt(e) {
	return {
		...e,
		type: "url",
		component: "link"
	};
}
// admin/src/core/FormatToolbar.tsx
function rt({ root: e = document, offset: t }) {
	let [n, r] = A(null), [i, a] = A({}), [o, s] = A(!1), [c, l] = A(""), u = k(null), d = k(null), f = k(() => {}), p = et();
	if (O(() => {
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
		tt(t, e), d.current?.dispatchEvent(new Event("input", { bubbles: !0 })), e.dispatchEvent(new Event("selectionchange"));
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
	}, v = (e, t, n, r) => /* @__PURE__ */ L(_e, {
		content: t,
		shortcut: n,
		children: /* @__PURE__ */ L("button", {
			type: "button",
			"aria-label": t,
			"aria-pressed": !!i[e] || e === "link" && o,
			onMouseDown: (e) => e.preventDefault(),
			onClick: r,
			className: F("grid size-7 place-items-center rounded-xs hover:bg-white/12 hover:text-ink-contrast", i[e] || e === "link" && o ? "bg-white/14 text-ink-contrast" : "text-ink-contrast/75"),
			children: /* @__PURE__ */ L(P, {
				name: e,
				size: 14
			})
		})
	}, e), y = () => {
		s(!1);
		let t = d.current, n = e.getSelection();
		t && u.current && n && (t.focus({ preventScroll: !0 }), n.removeAllRanges(), n.addRange(u.current));
	}, b = nt({
		handle: "url",
		label: S("Link"),
		size: "sm",
		autofocus: !0,
		anchors: p,
		placeholder: S("Paste a link or search pages"),
		onClose: y
	});
	return Te(/* @__PURE__ */ R("div", {
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
				children: /* @__PURE__ */ L(N, {
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
function it(e, t, n) {
	return t >= 0 && t < e ? "choose" : n ? "wait" : "pass";
}
function at(e, t) {
	return e > 0 ? "choose" : t ? "wait" : "release";
}
function ot(e, t) {
	return e && !t;
}
// admin/src/core/Inserter.tsx
var st = (e) => e.replace(/[-_]+/g, " ").replace(/(^|\s)\S/g, (e) => e.toUpperCase());
function ct(e, t, n, r = !0) {
	let i = C("patterns/list", {}, { staleTime: 6e4 }), { catalog: a } = Ae();
	return {
		items: ce(() => {
			let o = a?.categories ?? [], s = (e) => {
				let t = o.findIndex((t) => t.name === e);
				return t < 0 ? o.length : t;
			}, c = (e) => o.find((t) => t.name === e)?.label ?? st(e), l = t.trim().toLowerCase(), u = (e) => e.toLowerCase().includes(l), d = e.filter((e) => n ? n(e) : !e.parent).filter((e) => !l || u(e.title) || u(e.name) || (e.keywords ?? []).some(u)).sort((e, t) => s(e.category) - s(t.category) || (s(e.category) === o.length ? c(e.category).localeCompare(c(t.category)) : 0)), f = (e) => {
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
function lt({ types: e, query: t, onQuery: n, onChoose: r, onClose: i, allowed: a, showSearch: o = !0, className: s, style: c, compact: l, chooseFirst: u, onNoMatch: d, patterns: f = !0, keyboardDocument: p }) {
	let { items: m, loading: h } = ct(e, t, a, f), [g, _] = A(0), v = k(null);
	O(() => _(0), [t]);
	let y = k({
		items: m,
		active: g,
		loading: h
	});
	y.current = {
		items: m,
		active: g,
		loading: h
	};
	let b = k(!!u);
	O(() => {
		if (!b.current) return;
		let e = at(m.length, h);
		e !== "wait" && (b.current = !1, e === "choose" ? r(m[0]) : d?.());
	}, [m, h]), se(() => {
		let e = (e) => {
			let { items: t, active: n, loading: a } = y.current;
			if (e.key === "ArrowDown") e.preventDefault(), _((e) => Math.min(t.length - 1, e + 1));
			else if (e.key === "ArrowUp") e.preventDefault(), _((e) => Math.max(0, e - 1));
			else if (e.key === "Enter") {
				let i = it(t.length, n, a);
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
	]), O(() => {
		v.current?.querySelector(`[data-index="${g}"]`)?.scrollIntoView({ block: "nearest" });
	}, [g]);
	let x = "";
	return /* @__PURE__ */ R("div", {
		className: F("flex max-h-[min(420px,60vh)] w-[300px] flex-col", s),
		style: c,
		children: [o && /* @__PURE__ */ L("div", {
			className: "border-b border-border p-1.5",
			children: /* @__PURE__ */ L(N, {
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
					className: F("flex w-full items-center gap-2.5 rounded-sm px-2 text-left", l ? "h-8" : "py-1.5", t === g ? "bg-hover" : ""),
					children: [/* @__PURE__ */ L("span", {
						className: "grid size-7 shrink-0 place-items-center rounded-xs border border-border bg-surface text-muted",
						children: /* @__PURE__ */ L(P, {
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
function ut(e, t) {
	let n = e.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 56) || "pattern", r = n;
	for (let e = 2; t.has(r); e++) r = `${n}-${e}`;
	return r;
}
function dt(e, n) {
	let r = e.selection().map((n) => t(e.get().nodes, n)).filter((e) => !!e);
	if (r.length === 0) return;
	let i = document.createElement("div");
	document.body.appendChild(i);
	let a = De(i);
	function o() {
		let [t, o] = A(!0), [s, c] = A({
			title: "",
			category: "",
			description: "",
			synced: n
		}), { title: l, category: u, description: d, synced: f } = s, p = (e, t) => c((n) => ({
			...n,
			[e]: t ?? ""
		})), [m, h] = A(!1), _ = () => {
			o(!1), setTimeout(() => {
				a.unmount(), i.remove();
			}, 250);
		}, y = async () => {
			if (l.trim()) {
				h(!0);
				try {
					let t = await te("patterns/list"), n = ut(l, new Set(t.map((e) => e.handle)));
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
					}]), Se.success(S(f ? "“{title}” is now a component" : "Saved “{title}” as a section", { title: l.trim() })), _();
				} catch (e) {
					Se.error(e), h(!1);
				}
			}
		};
		return /* @__PURE__ */ L(le, {
			open: t,
			onOpenChange: (e) => !e && _(),
			size: "sm",
			title: S(f ? "Make a Component" : "Save as a Section"),
			description: b(r.length, "{count} block, reusable on every page", "{count} blocks, reusable on every page"),
			footer: /* @__PURE__ */ R(we, { children: [/* @__PURE__ */ L(M, {
				variant: "ghost",
				onClick: _,
				children: S("Cancel")
			}), /* @__PURE__ */ L(M, {
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
					/* @__PURE__ */ L(N, {
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
					/* @__PURE__ */ L(N, {
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
var ft = 4, pt = 6, mt = 16, ht = (e) => e.left + e.width, K = (e) => e.top + e.height, gt = (e, t) => t === "x" ? e.left + e.width / 2 : e.top + e.height / 2, _t = (e, t) => t === "x" ? e.left : e.top, q = (e, t) => t === "x" ? ht(e) : K(e), vt = (e) => [
	e.left,
	e.top,
	e.width,
	e.height
].every(Number.isFinite) && e.width > 0 && e.height >= 0, yt = (e, t) => t.x >= e.left && t.x <= ht(e) && t.y >= e.top && t.y <= K(e);
function bt(e, t) {
	return Math.hypot(Math.max(e.left - t.x, 0, t.x - ht(e)), Math.max(e.top - t.y, 0, t.y - K(e)));
}
function xt(e, t) {
	return Math.min(K(e), K(t)) - Math.max(e.top, t.top) > 0 && Math.abs(gt(t, "x") - gt(e, "x")) > Math.abs(gt(t, "y") - gt(e, "y")) ? "x" : "y";
}
function St(e, t, n) {
	let r = Math.min(K(e), K(t)) - Math.max(e.top, t.top), i = Math.min(ht(e), ht(t)) - Math.max(e.left, t.left);
	return n === "x" && r > 0 ? "x" : n === "y" && i > 0 ? "y" : xt(e, t);
}
function Ct(e, t) {
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
function wt(e, t) {
	let { byId: n, depth: r, isExcluded: i } = Ct(e, t.excludeIds), a = /* @__PURE__ */ new Map([[null, []]]);
	for (let t of e) {
		if (!vt(t.rect) || !t.container && t.rect.height === 0 || i(t)) continue;
		let e = a.get(t.parentId) ?? [];
		e.push(t), a.set(t.parentId, e), t.container && !a.has(t.id) && a.set(t.id, []);
	}
	let o = [];
	for (let [e, i] of a) {
		let a = e === null ? null : n.get(e), s = e === null ? t.rootRect : a?.rect;
		if (!s || !vt(s)) continue;
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
			let f = Math.sign(i - r), p = Math.min(Math.abs(i - r) / 2, ft), m = l === "from" ? r + f * p : l === "to" ? i - f * p : (r + i) / 2, h = Math.min(r, i), g = Math.abs(i - r), _ = n === "x" ? {
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
				width: Math.max(ht(e), ht(t)) - n,
				height: Math.max(K(e), K(t)) - r
			};
		}, m = c[0], h = c.at(-1), g = c.length > 1 ? St(m.rect, c[1].rect, l) : l ?? "y", _ = c.length > 1 ? St(c.at(-2).rect, h.rect, l) : l ?? "y", v = c.length < 2 || gt(c[1].rect, g) >= gt(m.rect, g), y = c.length < 2 || gt(h.rect, _) >= gt(c.at(-2).rect, _), b = v ? _t(m.rect, g) : q(m.rect, g), x = y ? q(h.rect, _) : _t(h.rect, _);
		f(m.index, g, v ? _t(s, g) : q(s, g), b, g === "x" ? m.rect : s, m.rect, "edge", "to");
		for (let e = 1; e < c.length; e++) {
			let t = c[e - 1], n = c[e], r = St(t.rect, n.rect, l), i = gt(n.rect, r) >= gt(t.rect, r), a = i ? q(t.rect, r) : _t(t.rect, r), o = i ? _t(n.rect, r) : q(n.rect, r), u = Math.max(t.rect.top, n.rect.top), d = Math.min(K(t.rect), K(n.rect)), m = r === "x" ? {
				left: s.left,
				top: u,
				width: s.width,
				height: Math.max(0, d - u)
			} : s, h = i ? o < a : o > a;
			f(n.index, r, h ? (a + o) / 2 : a, h ? (a + o) / 2 : o, m, r === "x" && m.height > 0 ? m : p(t.rect, n.rect), "between");
		}
		f(h.index + 1, _, x, y ? q(s, _) : _t(s, _), _ === "x" ? h.rect : s, h.rect, "edge", "from");
	}
	return o;
}
function Tt(e, t, n) {
	if (![t.x, t.y].every(Number.isFinite)) return null;
	let r = wt(e, n).flatMap((e) => {
		if (e.inside) return [];
		let n = e.axis === "x", r = n ? t.x : t.y, i = n ? t.y : t.x, a = (n ? e.rect.left : e.rect.top) + 1, o = n ? e.hitRect.left : e.hitRect.top, s = n ? e.hitRect.width : e.hitRect.height, c = Math.max(0, pt - s / 2), l = Math.max(o - c, a - mt), u = Math.min(o + s + c, a + mt), d = n ? e.hitRect.top : e.hitRect.left, f = d + (n ? e.hitRect.height : e.hitRect.width);
		return r >= l && r <= u && i >= d && i <= f ? [{
			target: e,
			distance: Math.abs(r - a)
		}] : [];
	});
	if (!r.length) return null;
	let i = Math.min(...r.map((e) => e.distance));
	return r.filter((e) => e.distance <= i + 2).sort((e, t) => Number(e.target.kind === "edge") - Number(t.target.kind === "edge") || t.target.depth - e.target.depth || e.distance - t.distance)[0].target;
}
function Et(e, t, n) {
	if (![t.x, t.y].every(Number.isFinite)) return null;
	let { isExcluded: r } = Ct(e, n.excludeIds);
	return e.some((e) => r(e) && yt(e.rect, t)) ? null : wt(e, n).map((e) => ({
		target: e,
		distance: bt(e.inside ? e.hitRect : e.rect, t)
	})).filter(({ distance: e }) => e <= (n.maxDistance ?? 80)).sort((e, t) => e.distance - t.distance || t.target.depth - e.target.depth)[0]?.target ?? null;
}
// admin/src/core/QuickInserter.tsx
var Dt = "cms:blocks:recent", Ot = [
	"paragraph",
	"heading",
	"image",
	"list",
	"button",
	"box"
], kt = 6, At = 9, jt = 3;
function Mt() {
	try {
		let e = JSON.parse(localStorage.getItem(Dt) ?? "[]");
		return Array.isArray(e) ? e.filter((e) => typeof e == "string") : [];
	} catch {
		return [];
	}
}
function Nt(e) {
	if (e.kind === "block") try {
		localStorage.setItem(Dt, JSON.stringify([e.type.name, ...Mt().filter((t) => t !== e.type.name)].slice(0, 12)));
	} catch {}
}
function Pt({ types: e, allowed: t, onChoose: n, onClose: r }) {
	let [i, a] = A(""), [o, s] = A(!1), [c, l] = A(0), { items: u } = ct(e, i, t, !!i.trim()), d = ce(() => {
		if (i.trim()) return u.slice(0, At);
		let e = [...Mt(), ...Ot], t = (t) => {
			let n = t.kind === "block" ? e.indexOf(t.type.name) : -1;
			return n < 0 ? e.length : n;
		};
		return u.filter((e) => e.kind === "block").sort((e, n) => t(e) - t(n)).slice(0, kt);
	}, [u, i]);
	O(() => l(0), [i]);
	let f = (e) => {
		Nt(e), n(e);
	};
	return o ? /* @__PURE__ */ L("div", {
		"data-cms-insert-menu": !0,
		"data-cms-browse": !0,
		children: /* @__PURE__ */ L(lt, {
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
				ArrowDown: jt,
				ArrowUp: -3
			}[e.key];
			t && d.length ? (e.preventDefault(), l((e) => Math.max(0, Math.min(d.length - 1, e + t)))) : e.key === "Enter" && d[c] ? (e.preventDefault(), f(d[c])) : e.key === "Escape" && (e.preventDefault(), r());
		},
		children: [
			/* @__PURE__ */ L("div", {
				className: "p-2 pb-0",
				children: /* @__PURE__ */ L(N, {
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
						className: F("flex h-[68px] min-w-0 flex-col items-center justify-center gap-1.5 rounded-sm px-1 text-text", t === c && "bg-hover"),
						children: [/* @__PURE__ */ L(P, {
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
				children: [S("Browse All"), /* @__PURE__ */ L(P, {
					name: "arrow-right",
					size: 14,
					className: "text-muted"
				})]
			})
		]
	});
}
// admin/src/core/morph.ts
function Ft(e, t) {
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
function It(e) {
	let t = k(e);
	t.current = e;
	let [n, r] = A(null), i = k(null), a = k(() => {});
	return O(() => {
		e.disabled && a.current();
	}, [e.disabled]), O(() => () => a.current(), []), {
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
var Lt = 32, Rt = 6, zt = 4;
function Bt({ target: e, position: t, ...n }) {
	let r = t(e.rect);
	return /* @__PURE__ */ R(we, { children: [/* @__PURE__ */ L("div", {
		"data-cms-insertion-line": !0,
		className: F("pointer-events-none absolute z-10 rounded-full bg-focus", e.axis === "x" ? "cms-block-line-y" : "cms-block-line-x"),
		style: {
			...r,
			minWidth: 2,
			minHeight: 2
		}
	}), /* @__PURE__ */ L(Ut, {
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
function Vt({ target: e, position: t, ...n }) {
	let r = t(e.hitRect);
	return /* @__PURE__ */ L(Ut, {
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
function Ht({ target: e, position: t, onWrite: n, ...r }) {
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
		}), /* @__PURE__ */ L(Ut, {
			...r,
			label: S("Add Block"),
			className: "size-8 rounded-xs text-muted hover:bg-hover hover:text-text"
		})]
	});
}
function Ut({ open: e, onOpenChange: t, returnFocus: n, children: r, label: i, className: a, style: o, data: s }) {
	return /* @__PURE__ */ L(fe, {
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
			className: F("cms-focus-ring pointer-events-auto z-20 grid place-items-center", a),
			style: o,
			children: /* @__PURE__ */ L(P, {
				name: "plus",
				size: 14,
				className: F("cms-block-plus-icon", e && "rotate-45")
			})
		}),
		children: e && r
	});
}
function Wt({ id: e, label: t, icon: n, parent: r, box: i, viewport: a, canMoveUp: o, canMoveDown: s, onSelectParent: c, onDrag: l, onMove: u, onInsert: d, onDuplicate: f, onMakeComponent: p, onDelete: m, covers: h }) {
	let g = k(null), [_, v] = A(240);
	se(() => {
		g.current && v(g.current.offsetWidth);
	});
	let y = i.top + i.height;
	if (y < 40 || i.top > a.height - Lt || i.left > a.width || i.left + i.width < 0) return null;
	let b = (e) => Math.max(zt, Math.min(a.width - _ - zt, e)), x = b(i.left), ee = b(i.left + i.width - _), te = i.top - Lt - Rt, C = y + Rt, w = Math.max(zt, i.top + zt), T = (e) => e >= zt && e + Lt <= a.height - zt, { left: E, top: D } = [
		te,
		C,
		w
	].flatMap((e) => [{
		left: x,
		top: e
	}, {
		left: ee,
		top: e
	}]).find((e) => T(e.top) && !h?.({
		...e,
		width: _,
		height: Lt
	})) ?? {
		left: x,
		top: T(te) ? te : w
	};
	return /* @__PURE__ */ R("div", {
		ref: g,
		"data-cms-block-controls": e,
		role: "toolbar",
		"aria-label": S("Block Actions"),
		className: "cms-block-chrome pointer-events-auto absolute z-30 flex h-8 items-center gap-0.5 rounded-sm border border-border bg-bg pl-0.5 pr-1 shadow-pop",
		style: {
			left: E,
			top: D
		},
		children: [
			/* @__PURE__ */ L("button", {
				type: "button",
				"aria-label": S("Drag to Move"),
				title: S("Drag to Move"),
				className: "cms-focus-ring grid h-6 w-4 touch-none cursor-grab place-items-center rounded-xs text-faint hover:bg-hover hover:text-muted active:cursor-grabbing",
				onPointerDown: l,
				children: /* @__PURE__ */ L(P, {
					name: "drag",
					size: 12
				})
			}),
			r && /* @__PURE__ */ L(_e, {
				content: S("Select {block}", { block: r.label }),
				children: /* @__PURE__ */ L(ue, {
					size: "xs",
					icon: "b-arrow-elbow-left-up",
					label: S("Select {block}", { block: r.label }),
					onClick: c
				})
			}),
			/* @__PURE__ */ L("span", { className: "mx-0.5 h-4 border-l border-border" }),
			/* @__PURE__ */ R("span", {
				className: "flex h-6 max-w-40 items-center gap-1.5 px-1 text-xs font-medium text-text",
				children: [/* @__PURE__ */ L(P, {
					name: n,
					size: 14,
					className: "shrink-0 text-muted"
				}), /* @__PURE__ */ L("span", {
					className: "truncate",
					children: t
				})]
			}),
			/* @__PURE__ */ L(ue, {
				size: "xs",
				icon: "chevron-up",
				label: S("Move Up"),
				disabled: !o,
				onClick: () => u(-1)
			}),
			/* @__PURE__ */ L(ue, {
				size: "xs",
				icon: "chevron-down",
				label: S("Move Down"),
				disabled: !s,
				onClick: () => u(1)
			}),
			/* @__PURE__ */ L("span", { className: "mx-0.5 h-4 border-l border-border" }),
			/* @__PURE__ */ L(de, {
				align: "end",
				trigger: /* @__PURE__ */ L(ue, {
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
function Gt({ drag: e, position: t }) {
	return /* @__PURE__ */ R(we, { children: [
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
			children: [/* @__PURE__ */ L(P, {
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
var Kt = new EventTarget(), qt = {
	emit(e, t) {
		Kt.dispatchEvent(new CustomEvent(e, { detail: t }));
	},
	on(e, t) {
		let n = (e) => t(e.detail);
		return Kt.addEventListener(e, n), () => Kt.removeEventListener(e, n);
	}
}, Jt = D({
	stops: () => [],
	settings: () => {},
	readOnly: !1
}), Yt = () => ae(Jt);
function Xt(e = "") {
	return {
		id: g(),
		type: "paragraph",
		props: { text: e }
	};
}
function Zt(e, t, n, r) {
	return e.id === t && e.prop === n && (r === void 0 || e.index === r);
}
function Qt(e, t, n) {
	e.focus(t.id, n, t.prop, t.index);
}
function $t(e, t, n) {
	if (!t) return;
	let r = /* @__PURE__ */ new Set(), i = (e) => {
		r.add(e.id), e.children?.forEach(i);
	};
	i(t);
	let a = n.find((e) => r.has(e.id));
	a ? Qt(e, a, "start") : e.select(t.id, !0);
}
function en(e) {
	let t = e.getElementById("f-title");
	return t ? (t.focus(), t.setSelectionRange(t.value.length, t.value.length), !0) : !1;
}
function tn(e, t, n, r, i) {
	if (e.shiftKey || e.metaKey || e.ctrlKey || e.altKey) return !1;
	let a = e.key === "ArrowUp" && qe(t) || e.key === "ArrowLeft" && H(t), o = e.key === "ArrowDown" && Je(t) || e.key === "ArrowRight" && Ue(t);
	if (a) {
		let a = r[i - 1];
		if (a) Qt(n, a, "end");
		else if (e.key !== "ArrowUp" || !en(t.ownerDocument)) return !1;
		return e.preventDefault(), !0;
	}
	if (o) {
		let t = r[i + 1];
		return t ? (e.preventDefault(), Qt(n, t, "start"), !0) : !1;
	}
	return !1;
}
// admin/src/write/outline.ts
var nn = [
	"paragraph",
	"heading",
	"quote",
	"callout"
];
function rn(e) {
	return e.kind === "actions" ? e.nodes : [e.node];
}
function an(e) {
	return rn(e)[0].id;
}
function on(e, t, n) {
	let r = {
		types: t,
		custom: n
	}, i = [];
	for (let t of e) {
		let e = ln(t, null, !1, r), n = e.kind === "container" || e.kind === "columns", a = i.at(-1);
		!n && a && !a.container ? dn(a.rows, e) : i.push({
			id: t.id,
			label: n && t.label?.trim() || null,
			rows: [e],
			container: n
		});
	}
	return i;
}
function sn(e) {
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
function cn(e) {
	let t = [], n = (e) => {
		for (let r of e) if (t.push(r), r.kind === "columns") for (let e of r.columns) n(e.rows);
		else r.kind === "container" && n(r.rows);
	};
	for (let t of e) n(t.rows);
	return t;
}
function ln(e, t, n, r) {
	let i = n || !!e.hidden, a = {
		parent: t,
		hidden: i
	}, o = r.types.get(e.type), s = r.custom(e.type), c = (e.children?.length ?? 0) > 0;
	return e.type === "columns" && o && !s ? {
		kind: "columns",
		node: e,
		columns: (e.children ?? []).map((e) => ({
			node: e,
			rows: un(e.children ?? [], e.id, i || !!e.hidden, r)
		})),
		...a
	} : !s && o && !c && (e.type === "button" || e.type === "link") ? {
		kind: "actions",
		nodes: [e],
		...a
	} : o?.children || c ? {
		kind: "container",
		node: e,
		rows: un(e.children ?? [], e.id, i, r),
		...a
	} : !o || s ? {
		kind: "block",
		node: e,
		...a
	} : nn.includes(e.type) ? {
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
function un(e, t, n, r) {
	let i = [];
	for (let a of e) dn(i, ln(a, t, n, r));
	return i;
}
function dn(e, t) {
	let n = e.at(-1);
	t.kind === "actions" && n?.kind === "actions" && n.parent === t.parent && n.hidden === t.hidden ? n.nodes.push(...t.nodes) : e.push(t);
}
// admin/src/write/slash.ts
var fn = null, pn = /* @__PURE__ */ new Set();
function mn(e) {
	return fn?.id === e ? fn : null;
}
function hn(e) {
	JSON.stringify(e) !== JSON.stringify(fn) && (fn = e, pn.forEach((e) => e()));
}
function gn() {
	return j((e) => (pn.add(e), () => pn.delete(e)), () => fn);
}
function _n(e, t = 360, n = 300) {
	let r = window.innerHeight - e.bottom - 6 - 8, i = e.top - 6 - 8, a = r >= Math.min(t, 220) || r >= i;
	return {
		left: Math.max(8, Math.min(window.innerWidth - n - 8, e.left - 4)),
		top: a ? e.bottom + 6 : void 0,
		bottom: a ? void 0 : window.innerHeight - e.top + 6,
		maxHeight: Math.max(120, Math.min(t, a ? r : i))
	};
}
function vn(e, t) {
	O(() => {
		if (!e) return;
		let n = (e) => !e.target?.closest?.("[data-cms-slash]") && hn(null), r = t.filter((e) => !!e);
		return r.forEach((e) => e.addEventListener("pointerdown", n, !0)), () => r.forEach((e) => e.removeEventListener("pointerdown", n, !0));
	}, [e, ...t]);
}
// admin/src/write/Text.tsx
var yn = {
	1: "text-[30px] leading-[38px] font-semibold tracking-[-0.02em]",
	2: "text-[24px] leading-[32px] font-semibold tracking-[-0.015em]",
	3: "text-[20px] leading-[28px] font-semibold tracking-[-0.01em]",
	4: "text-[17px] leading-[26px] font-semibold",
	5: "text-[16px] leading-[26px] font-semibold",
	6: "text-[13px] leading-[22px] font-semibold uppercase tracking-[0.04em] text-muted"
}, bn = "text-[16px] leading-[27px]", xn = {
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
function Sn({ node: e }) {
	if (e.type === "quote") return /* @__PURE__ */ R("blockquote", {
		className: "m-0 border-l-[3px] border-text/80 py-0.5 pl-4",
		children: [/* @__PURE__ */ L(Tn, {
			node: e,
			prop: "text",
			className: "text-[17px] leading-[28px]",
			placeholder: S("Quote")
		}), /* @__PURE__ */ L(Tn, {
			node: e,
			prop: "cite",
			className: "cms-block-cite mt-1 text-sm text-muted",
			placeholder: S("Attribution"),
			quiet: !0
		})]
	});
	if (e.type === "callout") return /* @__PURE__ */ L(wn, { node: e });
	if (e.type === "heading") {
		let t = String(e.props.level ?? 2);
		return /* @__PURE__ */ L(Tn, {
			node: e,
			prop: "text",
			tag: `h${t}`,
			className: yn[t] ?? yn[2],
			placeholder: S("Heading {level}", { level: t })
		});
	}
	return /* @__PURE__ */ L(Cn, { node: e });
}
function Cn({ node: e }) {
	let { store: t } = z(), n = B(t, (t) => t.nodes.length === 1 && t.nodes[0].id === e.id);
	return /* @__PURE__ */ L(Tn, {
		node: e,
		prop: "text",
		tag: "p",
		className: bn,
		placeholder: S("Write, or press “/” for blocks"),
		quiet: !n
	});
}
function wn({ node: e }) {
	let { store: t } = z(), { readOnly: n } = Yt(), r = xn[e.props.tone] ?? xn.note;
	return /* @__PURE__ */ R("div", {
		className: F("flex gap-3 rounded-md px-4 py-3", r.className),
		children: [/* @__PURE__ */ L(de, {
			align: "start",
			trigger: /* @__PURE__ */ L("button", {
				type: "button",
				disabled: n,
				"aria-label": S("Callout Style"),
				className: "grid h-[27px] w-5 shrink-0 place-items-center rounded-xs text-muted hover:text-text",
				children: /* @__PURE__ */ L(P, {
					name: r.icon,
					size: 17
				})
			}),
			items: Object.entries(xn).map(([n, r]) => ({
				label: r.label(),
				icon: r.icon,
				checked: n === (e.props.tone ?? "note"),
				onSelect: () => t.updateProps(e.id, { tone: n })
			}))
		}), /* @__PURE__ */ L(Tn, {
			node: e,
			prop: "text",
			className: F(bn, "min-w-0 flex-1"),
			placeholder: S("Write a note")
		})]
	});
}
function Tn({ node: e, prop: i, tag: o = "div", className: s, placeholder: c, quiet: l }) {
	let { store: u, types: d, allowed: _ } = z(), { stops: v, readOnly: y } = Yt(), b = B(u, (t) => t.focus?.id === e.id && (t.focus.prop ?? "text") === i ? t.focus : null), x = String(e.props[i] ?? ""), ee = (t, n) => {
		if (e.type === "paragraph" && i === "text" && te(t, n)) return;
		u.updateProps(e.id, { [i]: t }, `text:${e.id}:${i}`);
		let r = e.type === "paragraph" ? t.replace(/<[^>]+>/g, "").match(/^\/([\w-]*)$/) : null;
		hn(r ? {
			id: e.id,
			query: r[1]
		} : null);
	}, te = (n, i) => {
		let a = n.replace(/&nbsp;/g, " "), o = (n, a, o) => {
			let s = r(u.get().nodes, e.id), c = s?.parentId ? t(u.get().nodes, s.parentId) : null;
			if (!d.has(n) || !p(c, n, d, c ? [] : _)) return !1;
			let l = Math.max(0, Ge(i) - U(o));
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
			let t = Xt(), { nodes: n } = u.get(), i = r(n, e.id);
			return u.commit(m(h(n, e.id, (e) => ({
				...e,
				type: "divider",
				props: {}
			})), i?.parentId ?? null, (i?.index ?? n.length) + 1, [t])), u.focus(t.id, "start"), !0;
		}
		return !1;
	}, S = (o, s) => {
		if (o.defaultPrevented) return;
		let c = v(), l = c.findIndex((t) => Zt(t, e.id, i)), p = c[l], { nodes: y } = u.get();
		if (o.key === "Enter" && !o.shiftKey && !o.metaKey && !o.ctrlKey && !o.altKey) {
			o.preventDefault();
			let t = mn(e.id);
			if (t && ot(!0, !!document.querySelector("[data-cms-slash]"))) return hn({
				...t,
				enter: !0
			});
			if (i === "cite") {
				let t = Xt(), n = f(y, e.id, "paragraph", d, _);
				if (!n) return;
				u.insert(n.parentId, n.index, [t]), u.focus(t.id, "start");
				return;
			}
			let [a, c] = Ke(s);
			if (n(a) && !n(c)) {
				let t = r(y, e.id);
				if (!t) return;
				u.insert(t.parentId, t.index, [Xt()]), u.focus(e.id, "start");
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
			} : Xt(c), p = f(y, e.id, "paragraph", d, _);
			if (!p) return;
			u.commit(m(h(y, e.id, (e) => ({
				...e,
				props: {
					...e.props,
					[i]: a
				}
			})), p.parentId, p.index, [l])), u.focus(l.id, "start");
		} else if (o.key === "Backspace" && H(s)) {
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
				u.remove(e.id), Qt(u, t, "end");
				return;
			}
			if (t.parent === p?.parent && C(t, x)) return;
			Qt(u, t, "end");
		} else if (o.key === "Delete" && Ue(s) && i === "text") {
			let n = c[l + 1], r = n && n.prop === "text" && n.parent === p?.parent ? t(y, n.id) : null;
			if (!r || !["paragraph", "heading"].includes(r.type)) return;
			o.preventDefault();
			let i = U(x);
			u.commit(a(h(y, e.id, (e) => ({
				...e,
				props: {
					...e.props,
					text: x + String(r.props.text ?? "")
				}
			})), r.id)), u.focus(e.id, i);
		} else tn(o, s, u, c, l) || o.key === "Escape" && (o.preventDefault(), s.blur(), u.select(e.id, !0));
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
			})), e.id)), Qt(u, n, U(s)), !0;
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
		})), e.id)), Qt(u, n, U(s)), !0;
	};
	return /* @__PURE__ */ L(G, {
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
function En({ node: e, renderItem: t }) {
	let { store: i, types: o, allowed: s } = z(), { stops: c, readOnly: l } = Yt(), u = Array.isArray(e.props.items) && e.props.items.length ? e.props.items : [""], d = B(i, (t) => t.focus?.id === e.id && t.focus.prop === "items" ? t.focus : null), p = !!e.props.ordered, g = (t, n = `list:${e.id}`) => i.updateProps(e.id, { items: t }, n), _ = (t) => (l, d) => {
		if (l.defaultPrevented) return;
		let { nodes: p } = i.get(), _ = c(), v = _.findIndex((n) => Zt(n, e.id, "items", t));
		if (l.key === "Enter" && !l.shiftKey && !l.metaKey && !l.ctrlKey) {
			if (l.preventDefault(), n(u[t]) && t === u.length - 1) {
				let t = Xt(), n = u.slice(0, -1), r = f(p, e.id, "paragraph", o, s);
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
			let [r, c] = Ke(d);
			g([
				...u.slice(0, t),
				r,
				c,
				...u.slice(t + 1)
			], ""), i.focus(e.id, "start", "items", t + 1);
		} else if (l.key === "Backspace" && H(d)) {
			if (l.preventDefault(), t === 0) {
				let t = Xt(u[0]), n = r(p, e.id), o = u.slice(1), s = m(p, n?.parentId ?? null, n?.index ?? 0, [t]);
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
			], ""), i.focus(e.id, U(u[t - 1]), "items", t - 1);
		} else tn(l, d, i, _, v) || l.key === "Escape" && (l.preventDefault(), d.blur(), i.select(e.id, !0));
	}, v = (n, r) => /* @__PURE__ */ L(G, {
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
	return t ? /* @__PURE__ */ L(we, { children: u.map((e, n) => t(n, v(e, n))) }) : /* @__PURE__ */ L("div", {
		className: F(bn, "space-y-0.5"),
		children: u.map((e, t) => /* @__PURE__ */ R("div", {
			className: "flex",
			children: [/* @__PURE__ */ L("span", {
				className: F("w-6 shrink-0 select-none text-muted", p ? "pr-1.5 text-right tabular-nums" : "pl-1.5"),
				"aria-hidden": !0,
				children: p ? `${t + 1}.` : "•"
			}), v(e, t)]
		}, t))
	});
}
// admin/src/LiveEditor.tsx
var Dn = (e, t, n) => e.axis === "x" ? {
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
}, On = (e) => `${e.parentId ?? ""}:${e.index}:${e.inside ? "inside" : e.axis}`, kn = "\nhtml{scrollbar-width:thin;scrollbar-color:rgb(127 127 127/.35) transparent}\n[data-cms-document][data-cms-node]{cursor:default}\n.cms-block-text{display:block;min-width:1ch;min-height:1lh;white-space:pre-wrap;overflow-wrap:break-word;outline:none;border-radius:0;font:inherit;color:inherit;line-height:inherit;text-align:inherit;cursor:text}\n.cms-block-text:empty::before{content:attr(data-placeholder);opacity:.4;pointer-events:none}\n.cms-block-text[data-quiet]:empty:not(:focus)::before{content:none}\n[data-cms-prop]{cursor:text}\n.cms-block-text::selection,.cms-block-text ::selection{background:rgb(0 122 255/.2)}\nimg,a{-webkit-user-drag:none}\n[data-cms-conditional=hidden]:not([data-cms-reveal]){display:none!important}\n[data-cms-editor-empty-root]{visibility:hidden}\n.cms-js [data-cms-appear]{visibility:visible!important}\n", An = /* @__PURE__ */ new Set([
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
function jn(e, t, n) {
	let r = e.elementFromPoint(t, n);
	if (!r || r === e.body || r === e.documentElement) return !1;
	if (An.has(r.tagName) || r.closest("svg")) return !0;
	let i = [...r.childNodes].filter((e) => e.nodeType === Node.TEXT_NODE && e.textContent?.trim());
	if (!i.length) return !1;
	let a = e.createRange();
	return i.some((e) => (a.selectNodeContents(e), [...a.getClientRects()].some((e) => t >= e.left - 2 && t <= e.right + 2 && n >= e.top - 2 && n <= e.bottom + 2)));
}
function Mn(e) {
	let t = parseFloat(e ?? "");
	return Number.isNaN(t) ? 0 : /r?em$/.test(e ?? "") ? t * 16 : t;
}
function Nn({ collection: e, entryId: n, content: a, onInspect: c, standalone: d, onTitleChange: m }) {
	let { store: h, types: g, allowed: v, fieldHandle: y, readOnly: x = !1 } = z(), te = je(), C = B(h, (e) => e.nodes), w = B(h, (e) => e.selected), T = B(h, Le), E = B(h, (e) => e.blockMode), D = B(h, (e) => e.hovered), ne = B(h, (e) => e.breakpoint), { breakpoints: re } = Ne(), ae = Mn(re.lg) || 1024, oe = k(null), j = k(null), [M, le] = A(null), N = k(""), [P, ue] = A([]), [de, fe] = A(!0), [me, ge] = A(null), [_e, F] = A(0), [I, ye] = A({
		width: 1024,
		height: 700,
		scale: 1,
		left: 0
	}), [be, xe] = A([]), [Se, Ce] = A(null), [Te, De] = A([]), [Oe, ke] = A(null), Ae = k(0), Pe = k(""), [Fe, Ie] = A(!1), [Re, ze] = A(!1), Be = k(!1), V = k(null), Ve = ce(() => {
		let e = [], t = (n, r) => n.forEach((n, i) => {
			e.push({
				node: n,
				parentId: r,
				index: i
			}), n.children && t(n.children, n.id);
		});
		return t(C, null), e;
	}, [C]), He = k(Ve);
	He.current = Ve;
	let [H, Ue] = A(null), We = k(H);
	We.current = H;
	let Ge = k(null);
	O(() => {
		H || (Ge.current = null);
	}, [H]);
	let Ke = k(0), qe = k({
		busy: !1,
		queued: !1,
		timer: 0,
		alive: !0
	}), Je = k(async () => {}), Ye = () => {
		let e = qe.current;
		e.queued = !0, !(!e.alive || e.busy || e.timer) && (e.timer = window.setTimeout(() => {
			e.timer = 0, Je.current();
		}, N.current ? 80 : 0));
	}, Xe = () => He.current.map(({ node: e, parentId: t, index: n }) => `${t}:${n}:${e.id}:${e.type}:${e.type === "list" ? e.props.items?.length ?? 0 : ""}`).join("|"), Ze = k(null), U = k({
		content: a,
		onInspect: c,
		readOnly: x,
		layout: I,
		onTitleChange: m
	});
	U.current = {
		content: a,
		onInspect: c,
		readOnly: x,
		layout: I,
		onTitleChange: m
	};
	let W = (e, t) => e.querySelector(`[data-cms-document="${N.current}"][data-cms-node="${CSS.escape(t)}"]`) ?? e.querySelector(`[data-cms-proto-document="${N.current}"][data-cms-proto="${CSS.escape(t)}"]`), Qe = (e) => {
		let n = "[data-cms-document][data-cms-node],[data-cms-proto-document][data-cms-proto]", r = e?.closest?.(n) ?? null;
		for (; r;) {
			let e = r.dataset.cmsDocument === N.current ? r.dataset.cmsNode : r.dataset.cmsProtoDocument === N.current ? r.dataset.cmsProto : void 0;
			if (e && t(h.get().nodes, e)) return e;
			r = r.parentElement?.closest(n) ?? null;
		}
		return null;
	}, $e = (e) => {
		if (e.ownerDocument.defaultView?.getComputedStyle(e).display !== "contents") return e.getBoundingClientRect();
		let t = e.ownerDocument.createRange();
		return t.selectNodeContents(e), t.getBoundingClientRect();
	}, et = () => {
		if (V.current) return V.current;
		let e = j.current?.contentDocument, t = e?.querySelector(`[data-cms-editor-root="${N.current}"]`);
		if (!e || !t) return null;
		let n = (t) => {
			let n = e.defaultView.getComputedStyle(t);
			return n.display.includes("flex") && n.flexDirection.startsWith("row") || n.display.includes("grid") && n.gridTemplateColumns.split(" ").length > 1 ? "x" : "y";
		}, r = new Map([...e.querySelectorAll(`[data-cms-document="${N.current}"][data-cms-node]`)].map((e) => [e.dataset.cmsNode, e])), i = He.current.flatMap(({ node: t, parentId: i, index: a }) => {
			let o = r.get(t.id);
			return !o || e.defaultView.getComputedStyle(o).display === "none" ? [] : [{
				id: t.id,
				parentId: i,
				index: a,
				rect: $e(o),
				container: !!g.get(t.type)?.children && !["repeat", "pattern"].includes(t.type),
				axis: n(o)
			}];
		}), a = $e(t);
		return a.width === 0 && (a = $e(t.parentElement ?? e.body)), i.length || (a = {
			...a,
			left: a.left,
			top: a.top,
			width: a.width,
			height: Math.max(32, a.height)
		}), V.current = {
			blocks: i,
			rootRect: a,
			scroll: {
				x: e.defaultView.scrollX,
				y: e.defaultView.scrollY
			}
		}, V.current;
	}, G = (e, n = ["paragraph"]) => {
		let r = e ? t(h.get().nodes, e) : null;
		return n.every((e) => p(r, e, g, r ? [] : v));
	}, tt = (e) => [...g.values()].some((t) => G(e, [t.name])), nt = () => {
		let e = /* @__PURE__ */ new Map();
		return (t) => e.get(t) ?? e.set(t, tt(t)).get(t);
	}, it = () => {
		let e = j.current?.contentDocument, t = et();
		if (!e || !t) return;
		xe(Le(h.get()).flatMap((t) => {
			let n = W(e, t);
			return n ? [$e(n)] : [];
		}));
		let n = h.get().hovered, r = n ? W(e, n) : null;
		Ce(r ? $e(r) : null);
		let i = wt(t.blocks, {
			rootRect: t.rootRect,
			canInsert: nt()
		});
		De(i), Ue((t) => {
			if (!t) return t;
			let n = Ge.current?.key === On(t) ? Ge.current : null, r = n ? W(e, n.id) : null, a = n ? r ? Dn(t, $e(r), n.side) : t : i.find((e) => On(e) === On(t)) ?? t, o = a.inside ? a.hitRect.top : a.rect.top;
			return o < 0 || o > U.current.layout.height ? null : a;
		});
	}, at = (e) => {
		let t = e ? On(e) : "";
		t !== Pe.current && (Pe.current = t, clearTimeout(Ae.current), ke(null), e && (Ae.current = window.setTimeout(() => ke(e), 80)));
	}, ot = (e) => {
		let t = Le(h.get()), n = t.length ? r(h.get().nodes, e === "before" ? t[0] : t.at(-1)) : null, i = j.current?.contentDocument;
		if (!n || !i || U.current.readOnly || !tt(n.parentId)) return;
		let a = e === "before" ? n.index : n.index + 1, o = W(i, e === "before" ? t[0] : t.at(-1)), s = o ? $e(o) : null, c = i.defaultView, l = U.current.layout.height;
		if (s) {
			let t = e === "before" ? s.top : s.top + s.height;
			(t < 48 || t > l - 160) && c.scrollBy(0, t - l / 3);
		}
		requestAnimationFrame(() => {
			V.current = null;
			let r = et(), i = o ? $e(o) : null;
			if (!i) return;
			let s = Dn((r && wt(r.blocks, {
				rootRect: r.rootRect,
				canInsert: nt()
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
			Ge.current = {
				key: On(s),
				id: e === "before" ? t[0] : t.at(-1),
				side: e
			}, at(null), Ue(s);
		});
	}, st = () => {
		let e = M?.activeElement;
		if (document.activeElement === j.current && e?.isContentEditable) return e;
		let t = h.get().focus;
		return (t && M ? W(M, t.id) : null)?.querySelector("[data-cms-inline]") ?? null;
	}, ct = (e) => {
		V.current = null;
		let t = [];
		if (U.current.onTitleChange) for (let t of e.querySelectorAll("[data-cms-entry-field=\"title\"]")) t.querySelector("[data-cms-inline]") || t.replaceChildren();
		for (let n of e.querySelectorAll("[data-cms-prop]")) {
			let e = n.closest("[data-cms-document][data-cms-node]");
			e?.dataset.cmsDocument === N.current && e.dataset.cmsNode && (n.querySelector("[data-cms-inline]") || n.replaceChildren(), t.push({
				element: n,
				id: e.dataset.cmsNode,
				prop: n.dataset.cmsProp,
				...n.dataset.cmsIndex === void 0 ? {} : { index: Number(n.dataset.cmsIndex) }
			}));
		}
		for (let n of e.querySelectorAll("[data-cms-instance-prop]")) n.dataset.cmsInstanceDocument === N.current && n.dataset.cmsInstanceNode && (n.querySelector("[data-cms-inline]") || n.replaceChildren(), t.push({
			element: n,
			id: n.dataset.cmsInstanceNode,
			prop: n.dataset.cmsInstanceProp,
			instance: {
				type: n.dataset.cmsInstanceType ?? "text",
				value: n.dataset.cmsInstanceValue ?? ""
			}
		}));
		ue(t), requestAnimationFrame(it);
	}, lt = () => {
		let e = j.current?.contentDocument, t = e?.querySelector("[data-cms-editor-root]");
		if (!e || !t || !N.current) return;
		let n = new Set(s(h.get().nodes).map(({ node: e }) => e.id));
		for (let t of e.querySelectorAll("[data-cms-document][data-cms-node]")) t.dataset.cmsDocument === N.current && !n.has(t.dataset.cmsNode) && t.remove();
		let r = (t, n) => {
			for (let i = 0; i < t.length; i++) {
				let a = t[i], o = W(e, a.id);
				if (!o || o.dataset.cmsType !== a.type) {
					let r = e.querySelector(`template[data-cms-prototype="${CSS.escape(a.type)}"]`)?.content.firstElementChild?.cloneNode(!0);
					if (!r) continue;
					if (r.dataset.cmsNode = a.id, r.dataset.cmsDocument = N.current, o) o.replaceWith(r);
					else {
						let a = t.slice(i + 1).map((t) => W(e, t.id)).find(Boolean), o = t.slice(0, i).reverse().map((t) => W(e, t.id)).find(Boolean);
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
		h.get().nodes.length && t.querySelector(":scope > [data-cms-editor-empty-root]")?.remove(), r(h.get().nodes, t), ct(e);
	}, ut = ce(() => ({
		stops: () => sn(on(h.get().nodes, g, () => !1)).filter((e) => P.some((t) => t.id === e.id && t.prop === e.prop && (e.index === void 0 || t.index === e.index))),
		settings: (e) => U.current.onInspect(e),
		readOnly: x
	}), [
		h,
		g,
		P,
		x
	]), ft = k(ut);
	ft.current = ut, se(() => {
		V.current = null, lt();
	}, [C, M]), se(() => {
		if (!oe.current) return;
		let e = () => {
			let e = oe.current, t = Math.max(e.clientWidth, ae), n = ne === "tablet" ? ve.tablet : ne === "mobile" ? Math.min(ve.phone, e.clientWidth) : t, r = Math.min(1, e.clientWidth / n);
			V.current = null, ye({
				width: n,
				scale: r,
				height: e.clientHeight / r,
				left: Math.max(0, (e.clientWidth - n * r) / 2)
			});
		};
		e();
		let t = new ResizeObserver(e);
		return t.observe(oe.current), () => t.disconnect();
	}, [ne, ae]), O(() => {
		requestAnimationFrame(it);
	}, [
		w,
		T,
		D,
		I,
		M
	]), Je.current = async () => {
		let t = qe.current;
		t.queued = !1, t.busy = !0;
		let r = Ke.current, i = Xe(), o = new AbortController();
		Ze.current = o;
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
			if (!t.alive || o.signal.aborted || r !== Ke.current && i !== Xe()) return;
			let l = c.get("X-Cms-Editor-Document");
			if (!l) throw Error(S("The editor could not load its rendering context."));
			let u = new DOMParser().parseFromString(s, "text/html");
			if (!u.querySelector(`[data-cms-editor-root="${l}"]`)) throw Error(S("This template has no content outlet. Choose a template that includes the content field."));
			u.querySelectorAll("script").forEach((e) => {
				e.type = "text/cms-off", e.removeAttribute("src");
			}), N.current = l;
			let f = j.current?.contentDocument;
			f?.documentElement?.hasAttribute("data-cms-bridge-ready") ? (Ft(f, u), f.documentElement.setAttribute("data-cms-bridge-ready", ""), ct(f)) : j.current && (j.current.srcdoc = u.documentElement.outerHTML), r === Ke.current && ge(null);
		} catch (e) {
			!o.signal.aborted && r === Ke.current && (ge(e instanceof Error ? e.message : String(e)), fe(!1));
		} finally {
			t.busy = !1, t.queued && Ye();
		}
	}, O(() => {
		Ke.current++, Ye();
	}, [
		n,
		e,
		a,
		C,
		y,
		d,
		_e
	]), O(() => (qe.current.alive = !0, qe.current.queued && Ye(), () => {
		qe.current.alive = !1, clearTimeout(qe.current.timer), qe.current.timer = 0, Ze.current?.abort();
	}), []);
	let pt = (e, t) => {
		let n = l(e, g);
		n.length && !x && G(t.parentId, n.map((e) => e.type)) && (h.insert(t.parentId, t.index, n), $t(h, n[0], sn(on(h.get().nodes, g, () => !1))), Ue(null), at(null));
	}, mt = () => {
		if (U.current.readOnly || !G(null)) return;
		let e = Xt();
		h.insert(null, 0, [e]), h.focus(e.id, "start");
	}, ht = () => {
		let e = j.current?.contentDocument;
		return e ? He.current.filter(({ node: t }) => {
			let n = W(e, t.id);
			return !!n && e.defaultView.getComputedStyle(n).display !== "none";
		}).map(({ node: e }) => e.id) : [];
	}, K = (e) => {
		if (!e) return;
		h.select(e, !0);
		let t = j.current?.contentDocument;
		(t && W(t, e))?.scrollIntoView({ block: "nearest" });
	}, gt = (e) => {
		let n = e.metaKey || e.ctrlKey, r = Le(h.get()), i = h.get().selected;
		if (e.key === "Escape") {
			h.select(null);
			return;
		}
		if (!i || !h.get().blockMode) return;
		let a = ht(), o = a.indexOf(h.get().head ?? i);
		if (["ArrowUp", "ArrowDown"].includes(e.key)) {
			e.preventDefault();
			let t = e.key === "ArrowUp";
			e.altKey ? h.nudgeSelection(t ? -1 : 1) : e.shiftKey ? h.extend(t ? -1 : 1) : K(a[o + (t ? -1 : 1)]);
		} else if (e.key === "Enter") {
			e.preventDefault();
			let n = t(h.get().nodes, i), r = ft.current.stops(), a = n ? new Set(s([n]).map((e) => e.node.id)) : /* @__PURE__ */ new Set();
			r.some((e) => a.has(e.id)) ? $t(h, n, r) : U.current.onInspect(i);
		} else if (e.key === "Backspace" || e.key === "Delete") {
			e.preventDefault();
			let n = new Set(r.flatMap((e) => {
				let n = t(h.get().nodes, e);
				return n ? s([n]).map((e) => e.node.id) : [];
			})), i = a.findIndex((e) => n.has(e)), o = a.slice(0, Math.max(0, i)).reverse().find((e) => !n.has(e)) ?? a.slice(i + 1).find((e) => !n.has(e));
			h.removeSelection(), K(o);
		} else n && e.key.toLowerCase() === "d" && (e.preventDefault(), h.duplicateSelection());
	}, _t = () => {
		let e = j.current?.contentDocument;
		if (!e || !N.current) return;
		if (!e.querySelector("[data-cms-editor-root]")) {
			fe(!1), ge(S("This template has no content outlet. Choose a template that includes the content field."));
			return;
		}
		e.documentElement.setAttribute("data-cms-bridge-ready", "");
		let n = e.createElement("style");
		n.dataset.cmsBridge = "", n.textContent = kn, e.head.appendChild(n), le(e), ct(e), fe(!1), e.addEventListener("submit", (e) => e.preventDefault(), !0), e.addEventListener("dragstart", (e) => e.preventDefault()), e.addEventListener("focusout", (e) => {
			e.target.isContentEditable && Ie(!1), Ye();
		}), e.addEventListener("focusin", (e) => {
			let t = e.target;
			if (!t.isContentEditable) return;
			Ie(!0);
			let n = t.closest("[data-cms-instance-node],[data-cms-document][data-cms-node]");
			h.select(n?.dataset.cmsInstanceNode ?? n?.dataset.cmsNode ?? null), h.hover(null);
		}), e.addEventListener("pointermove", (e) => {
			if (U.current.readOnly || (Be.current && (e.movementX || e.movementY) && (Be.current = !1, ze(!1)), h.hover(Qe(e.target)), Be.current || We.current)) return;
			let t = et();
			at(t && Tt(t.blocks, {
				x: e.clientX,
				y: e.clientY
			}, {
				rootRect: t.rootRect,
				canInsert: nt()
			}));
		}), e.addEventListener("pointerdown", () => {
			Ue(null), at(null);
		}), e.addEventListener("click", (e) => {
			let t = e.target;
			if (t.closest("[contenteditable=\"true\"]")) {
				t.closest("a") && e.preventDefault();
				return;
			}
			e.preventDefault();
			let n = Qe(t);
			n ? e.shiftKey && h.get().selected ? h.extendTo(n) : U.current.onInspect(n) : e.shiftKey || h.select(null);
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
			else if (!U.current.readOnly) {
				if (r && n.key.toLowerCase() === "z") {
					if (e.activeElement?.closest("[data-cms-entry-field]")) return;
					n.preventDefault();
					let r = e.activeElement, i = r?.closest("[data-cms-prop]"), a = r?.closest("[data-cms-instance-prop]"), o = i?.closest("[data-cms-node]");
					r?.blur(), n.shiftKey ? h.redo() : h.undo(), o?.dataset.cmsNode && i?.dataset.cmsProp && t(h.get().nodes, o.dataset.cmsNode) ? h.focus(o.dataset.cmsNode, "end", i.dataset.cmsProp, i.dataset.cmsIndex === void 0 ? void 0 : Number(i.dataset.cmsIndex)) : a?.dataset.cmsInstanceNode && t(h.get().nodes, a.dataset.cmsInstanceNode) && h.focus(a.dataset.cmsInstanceNode, "end", `values.${a.dataset.cmsInstanceProp}`);
				} else r && n.altKey && (n.code === "KeyT" || n.code === "KeyY") ? (n.preventDefault(), ot(n.code === "KeyT" ? "before" : "after")) : n.target.isContentEditable ? r || n.altKey || n.key.length !== 1 && ![
					"Backspace",
					"Delete",
					"Enter"
				].includes(n.key) || (Be.current = !0, ze(!0), at(null)) : gt(n);
			}
		});
		let r = (e) => h.get().blockMode && !!h.get().selected && !e.target.isContentEditable, i = (e, n) => {
			if (!r(e) || !e.clipboardData) return;
			let i = Le(h.get()).map((e) => t(h.get().nodes, e)).filter(Boolean);
			i.length && (e.preventDefault(), e.clipboardData.setData("text/plain", "cms-blocks:" + JSON.stringify(i)), n && !U.current.readOnly && h.removeSelection());
		};
		e.addEventListener("copy", (e) => i(e, !1)), e.addEventListener("cut", (e) => i(e, !0)), e.addEventListener("paste", (e) => {
			let t = e.clipboardData?.getData("text/plain") ?? "";
			if (!r(e) || U.current.readOnly || !t.startsWith("cms-blocks:")) return;
			e.preventDefault();
			let n;
			try {
				n = JSON.parse(t.slice(12)).map(u);
			} catch {
				return;
			}
			let i = h.get().nodes, a = f(i, Le(h.get()).at(-1), n.map((e) => e.type), g, v);
			a && n.length && (h.insert(a.parentId, a.index, n), h.select(n[0].id, !0), n.length > 1 && h.extendTo(n.at(-1).id));
		});
		let a = 0;
		e.addEventListener("scroll", () => {
			let t = V.current, n = e.defaultView;
			if (t) {
				let e = n.scrollX - t.scroll.x, r = n.scrollY - t.scroll.y, i = (t) => ({
					...t,
					left: t.left - e,
					top: t.top - r
				});
				V.current = {
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
			Ee(() => {
				at(null), it();
			}), clearTimeout(a), a = window.setTimeout(() => {
				V.current = null, it();
			}, 150);
		}, { passive: !0 }), e.defaultView?.addEventListener("resize", () => {
			V.current = null, requestAnimationFrame(it);
		}), e.querySelectorAll("img,link[rel=\"stylesheet\"]").forEach((e) => e.addEventListener("load", () => {
			V.current = null, requestAnimationFrame(it);
		}, { once: !0 })), e.fonts.ready.then(() => {
			V.current = null, it();
		});
	};
	O(() => qt.on("scroll-to", ({ node: e }) => {
		let t = j.current?.contentDocument, n = t && W(t, e);
		n && n.scrollIntoView({
			block: "center",
			behavior: "smooth"
		});
	}), []), O(() => {
		let e = j.current?.contentDocument;
		if (e) {
			e.querySelectorAll("[data-cms-reveal]").forEach((e) => e.removeAttribute("data-cms-reveal"));
			for (let t of T) {
				let n = W(e, t);
				for (; n;) n.dataset.cmsConditional === "hidden" && (n.dataset.cmsReveal = ""), n = n.parentElement;
			}
		}
	}, [T]);
	let q = It({
		disabled: x,
		frame: j,
		scale: I.scale,
		invalidate: () => {
			V.current = null, it();
		},
		target: (e, n) => {
			let r = et();
			if (!r || e.x < r.rootRect.left || e.x > r.rootRect.left + r.rootRect.width || e.y < r.rootRect.top - 12 || e.y > r.rootRect.top + r.rootRect.height + 12) return null;
			let i = n.map((e) => t(h.get().nodes, e));
			if (i.some((e) => !e)) return null;
			let a = i.map((e) => e.type);
			return Et(r.blocks, e, {
				rootRect: r.rootRect,
				maxDistance: Infinity,
				excludeIds: new Set(n),
				canInsert: (e) => G(e, a)
			});
		},
		commit: (e, t) => h.moveTo(e, t.parentId, t.index)
	}), vt = (e) => {
		let t = j.current?.contentDocument;
		if (!t) return !1;
		for (let n of [.25, .75]) for (let r = 0; r < 6; r++) if (jn(t, (e.left + e.width * (r + .5) / 6 - I.left) / I.scale, (e.top + e.height * n) / I.scale)) return !0;
		return !1;
	}, yt = ie(() => {
		let e = j.current.getBoundingClientRect();
		return {
			x: e.left,
			y: e.top,
			scale: I.scale
		};
	}, [I.scale]), bt = (e) => ({
		left: I.left + e.left * I.scale,
		top: e.top * I.scale,
		width: e.width * I.scale,
		height: e.height * I.scale
	});
	return /* @__PURE__ */ L(Jt.Provider, {
		value: ut,
		children: /* @__PURE__ */ R("div", {
			className: "flex h-full min-h-0 flex-col",
			"data-live-editor": !0,
			children: [
				me && /* @__PURE__ */ L(pe, {
					compact: !0,
					message: me,
					onRetry: () => F((e) => e + 1)
				}),
				/* @__PURE__ */ R("div", {
					ref: oe,
					onPointerLeave: () => {
						h.hover(null), at(null);
					},
					onPointerMove: (e) => {
						e.target.closest("[data-cms-inserter]") || (at(null), h.hover(null));
					},
					className: "relative min-h-0 flex-1 overflow-hidden bg-sunken",
					children: [
						de && /* @__PURE__ */ L("div", {
							className: "absolute inset-0 z-20 grid place-items-center bg-bg",
							children: /* @__PURE__ */ L(he, {})
						}),
						/* @__PURE__ */ L("iframe", {
							ref: j,
							title: S("Live editor"),
							sandbox: "allow-same-origin",
							onLoad: _t,
							className: "absolute top-0 border-0 bg-white",
							style: {
								width: I.width,
								height: I.height,
								left: I.left,
								transformOrigin: "top left",
								transform: `scale(${I.scale})`
							}
						}),
						/* @__PURE__ */ R("div", {
							className: "pointer-events-none absolute inset-0 overflow-hidden",
							children: [
								!x && !q.drag && !Fe && !Re && !H && D && Se && !T.includes(D) && /* @__PURE__ */ L("div", {
									"data-cms-hover": D,
									className: "absolute z-10 border border-focus/50",
									style: bt(Se)
								}),
								!q.drag && be.map((e, t) => /* @__PURE__ */ L("div", {
									"data-cms-selection": !0,
									className: "absolute z-10 border-solid border-focus",
									style: {
										...bt(e),
										borderWidth: 1.5
									}
								}, t)),
								!x && !q.drag && E && w && be[0] && (() => {
									let e = r(C, T[0]), n = r(C, T.at(-1)), a = t(C, w);
									if (!e || !n || !a) return null;
									let s = i(C, e.parentId), l = (e) => ({
										label: Me(e, g, te),
										icon: e.type === "pattern" ? "b-diamonds-four" : g.get(e.type)?.icon ?? "square"
									}), u = e.parentId ? t(C, e.parentId) : null, { label: d, icon: f } = l(a);
									return /* @__PURE__ */ L(Wt, {
										id: w,
										label: T.length > 1 ? b(T.length, "{count} block", "{count} blocks") : d,
										icon: f,
										parent: u ? l(u) : null,
										box: bt(be[0]),
										viewport: {
											width: I.width * I.scale + I.left * 2,
											height: I.height * I.scale
										},
										canMoveUp: e.index > 0,
										canMoveDown: n.index < s.length - 1,
										onSelectParent: () => u && c(u.id),
										onDrag: (e) => {
											Ue(null), q.start(e, Le(h.get()), d);
										},
										onMove: (e) => h.nudgeSelection(e),
										onInsert: (e) => requestAnimationFrame(() => ot(e)),
										onDuplicate: () => h.duplicateSelection(),
										onDelete: () => h.removeSelection(),
										onMakeComponent: a.type !== "pattern" && _("entries.components.create") ? () => dt(h, o(h, g, v)) : void 0,
										covers: vt
									});
								})(),
								!x && !q.drag && Te.filter((e) => e.inside).map((e) => {
									let n = {
										open: !!H && On(H) === On(e),
										onOpenChange: (t) => Ue(t ? e : null),
										returnFocus: st,
										children: /* @__PURE__ */ L(Pt, {
											types: [...g.values()],
											allowed: (t) => G(e.parentId, [t.name]),
											onChoose: (t) => pt(t, e),
											onClose: () => Ue(null)
										})
									};
									if (e.parentId === null) return C.length ? null : /* @__PURE__ */ L(Ht, {
										target: e,
										position: bt,
										onWrite: G(null) ? mt : void 0,
										...n
									}, "root");
									let r = e.hitRect.top;
									return t(C, e.parentId)?.children?.length || r + e.hitRect.height < 0 || r > I.height || !(n.open || D === e.parentId || T.includes(e.parentId)) ? null : /* @__PURE__ */ L(Vt, {
										target: e,
										position: bt,
										...n
									}, On(e));
								}),
								!x && !q.drag && (() => {
									let e = H && !H.inside ? H : !H && !Re ? Oe : null;
									return e ? /* @__PURE__ */ L(Bt, {
										target: e,
										position: bt,
										open: H === e,
										onOpenChange: (t) => {
											Ue(t ? e : null), t || at(null);
										},
										returnFocus: st,
										children: /* @__PURE__ */ L(Pt, {
											types: [...g.values()],
											allowed: (t) => G(e.parentId, [t.name]),
											onChoose: (t) => pt(t, e),
											onClose: () => Ue(null)
										})
									}, On(e)) : null;
								})(),
								q.drag && /* @__PURE__ */ L(Gt, {
									drag: q.drag,
									position: bt
								})
							]
						})
					]
				}),
				M && /* @__PURE__ */ R(we, { children: [
					/* @__PURE__ */ L(Pn, { slots: P }),
					m && /* @__PURE__ */ L(Rn, {
						doc: M,
						content: a,
						onChange: m,
						readOnly: x
					}),
					/* @__PURE__ */ L(rt, {
						root: M,
						offset: yt
					}),
					/* @__PURE__ */ L(Ln, {
						doc: M,
						frame: j.current,
						scale: I.scale
					})
				] })
			]
		})
	});
}
var Pn = re(function({ slots: e }) {
	let { store: n } = z(), r = B(n, (e) => e.nodes), i = new Set(e.filter((e) => !e.instance && e.prop === "items").map((e) => e.id)), a = /* @__PURE__ */ new Map();
	return /* @__PURE__ */ R(we, { children: [e.filter((e) => e.instance || e.prop !== "items").map((e) => {
		let n = t(r, e.id);
		if (!n) return null;
		let i = `${e.instance ? "instance:" : ""}${e.id}:${e.prop}`, o = a.get(i) ?? 0;
		return a.set(i, o + 1), Te(e.instance ? /* @__PURE__ */ L(Fn, {
			node: n,
			slot: e
		}) : [
			"text",
			"cite",
			"caption"
		].includes(e.prop) ? n.type === "paragraph" && e.prop === "text" ? /* @__PURE__ */ L(Tn, {
			node: n,
			prop: "text",
			tag: "span",
			placeholder: S("Write, or press “/” for blocks"),
			quiet: !0
		}) : /* @__PURE__ */ L(Tn, {
			node: n,
			prop: e.prop,
			tag: "span",
			placeholder: e.element.dataset.cmsPlaceholder ?? S("Write something…")
		}) : /* @__PURE__ */ L(In, {
			node: n,
			prop: e.prop
		}), e.element, `${i}:${o}`);
	}), [...i].map((n) => {
		let i = t(r, n);
		return i ? /* @__PURE__ */ L(En, {
			node: i,
			renderItem: (t, r) => {
				let i = e.find((e) => e.id === n && e.prop === "items" && e.index === t);
				return i ? Te(r, i.element, `${n}:items:${t}`) : null;
			}
		}, n) : null;
	})] });
});
function Fn({ node: e, slot: n }) {
	let { store: r, readOnly: i } = z(), a = B(r, (t) => t.focus?.id === e.id && t.focus.prop === `values.${n.prop}` ? t.focus : null), o = String((Object.prototype.hasOwnProperty.call(e.props.values ?? {}, n.prop) ? e.props.values[n.prop] : n.instance.value) ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
	return /* @__PURE__ */ L(G, {
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
function In({ node: e, prop: t }) {
	let { store: n, readOnly: r } = z(), i = B(n, (n) => n.focus?.id === e.id && n.focus.prop === t ? n.focus : null), a = String(e.props[t] ?? ""), o = t === "code" ? a.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>") : a;
	return /* @__PURE__ */ L(G, {
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
function Ln({ doc: e, frame: n, scale: i }) {
	let o = gn(), { store: s, types: c, allowed: u } = z(), [d, h] = A(null);
	if (se(() => {
		h(o ? Xe(e) : null);
	}, [o, e]), vn(!!o, [document, e]), !o || !d || !t(s.get().nodes, o.id)) return null;
	let g = (e) => {
		let n = l(e, c), i = s.get().nodes, d = r(i, o.id);
		if (!d || !n.length) return;
		let h = d.parentId ? t(i, d.parentId) : null, g = n.every((e) => p(h, e.type, c, h ? [] : u)) ? d : f(i, o.id, n.map((e) => e.type), c, u);
		g && (hn(null), s.commit(m(a(i, o.id), g.parentId, g.index, n)), $t(s, n[0], sn(on(s.get().nodes, c, () => !1))));
	}, _ = n.getBoundingClientRect(), { maxHeight: v, ...y } = _n({
		left: _.left + d.left * i,
		top: _.top + d.top * i,
		bottom: _.top + d.bottom * i
	});
	return Te(/* @__PURE__ */ L("div", {
		"data-cms-slash": !0,
		className: "cms-pop fixed z-[70] overflow-hidden !p-0",
		style: y,
		children: /* @__PURE__ */ L(lt, {
			types: [...c.values()],
			query: o.query,
			showSearch: !1,
			compact: !0,
			style: { maxHeight: v },
			chooseFirst: o.enter,
			keyboardDocument: e,
			onChoose: g,
			onClose: () => hn(null),
			onNoMatch: () => {
				hn(null);
			},
			allowed: (e) => !!f(s.get().nodes, o.id, e.name, c, u)
		})
	}), document.body);
}
function Rn({ doc: e, content: t, onChange: n, readOnly: r }) {
	let i = [...e.querySelectorAll("[data-cms-entry-field=\"title\"]")];
	return /* @__PURE__ */ L(we, { children: i.map((i, a) => {
		let o = t.title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
		return Te(/* @__PURE__ */ L(G, {
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
var zn = "w-[88px]", Bn = "cms.inspector.collapsed";
function Vn() {
	try {
		let e = JSON.parse(localStorage.getItem(Bn) ?? "{}");
		return e && typeof e == "object" && !Array.isArray(e) ? Object.fromEntries(Object.entries(e).filter(([, e]) => typeof e == "boolean")) : {};
	} catch {
		return {};
	}
}
function Hn({ title: e, children: t, open: n = !0, actions: r, empty: i }) {
	let [a, o] = A(() => Vn()[e] === void 0 ? n : !Vn()[e]), s = (t) => {
		o(t);
		try {
			localStorage.setItem(Bn, JSON.stringify({
				...Vn(),
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
				className: F("flex h-full min-w-0 flex-1 items-center gap-1 text-left text-xs font-semibold", i ? "text-muted" : "text-ink"),
				children: [/* @__PURE__ */ L("span", {
					className: "min-w-0 truncate",
					children: e
				}), /* @__PURE__ */ L(P, {
					name: "b-caret-down",
					size: 10,
					className: F("shrink-0 text-faint transition-[rotate,opacity] duration-120", a ? "opacity-0 group-hover/section:opacity-100 group-focus-within/section:opacity-100" : "-rotate-90")
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
function Un({ children: e, className: t }) {
	return /* @__PURE__ */ L("div", {
		"data-section": "content",
		className: F("space-y-1 border-b border-border px-4 py-3 last:border-b-0", t),
		children: e
	});
}
function Wn({ title: e, action: t }) {
	return /* @__PURE__ */ R("div", {
		className: "flex h-7 items-center justify-between pt-1",
		children: [/* @__PURE__ */ L("span", {
			className: "text-xs text-muted",
			children: e
		}), t]
	});
}
function Gn({ field: e, children: t, htmlFor: n, className: r }) {
	let i = e.status, a = e.reset, o = t ?? e.label, s = F("flex h-7 min-w-0 shrink-0 items-center gap-1 text-left text-xs", zn, i === "own" ? "text-ink" : "text-muted", r), c = /* @__PURE__ */ L("span", {
		className: "min-w-0 truncate",
		children: o
	});
	return i === "own" && a ? /* @__PURE__ */ L(_e, {
		content: S("Reset {label}", { label: String(e.label ?? "") }),
		children: /* @__PURE__ */ L("button", {
			type: "button",
			onClick: a,
			className: F(s, "decoration-faint decoration-dotted underline-offset-[3px] hover:underline"),
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
var Kn = 15;
function qn(e) {
	if (e.stack === !0 || Ce.includes(e.type) && !e.component || e.type !== "toggle" && String(e.label ?? "").length > Kn) return !0;
	if (e.type !== "select" || e.component || e.display !== "segmented") return !1;
	let t = Object.values(e.options ?? {}).map((e) => typeof e == "string" ? e : e && typeof e == "object" && "label" in e ? String(e.label ?? "") : "").filter(Boolean);
	return t.length > 3 || t.join(" ").length > 20;
}
var Jn = (e) => e === "xs" || e === void 0 ? "sm" : e;
function J({ fields: e, values: t, onChange: n, disabled: r, context: i = {}, className: a, bare: o }) {
	j(x.fields.subscribe, x.fields.version);
	let s = T();
	return /* @__PURE__ */ L("div", {
		className: F("min-w-0", a ?? "space-y-1"),
		children: e.filter((e) => ye(e, t)).map((e) => {
			let a = s?.fieldTypes.find((t) => t.key === e.type), c = x.fields.get(e.component ?? a?.component ?? e.type) ?? x.fields.get("json");
			if (!c) return null;
			let l = {
				...e,
				size: Jn(e.size),
				fit: !0,
				id: I(e, i.path)
			}, u = !o && qn(e), d = /* @__PURE__ */ L(c, {
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
				className: F("flex min-w-0", u ? "flex-col items-stretch" : "min-h-7 items-center gap-2", e.className),
				children: [!o && e.type !== "toggle" && /* @__PURE__ */ L(Gn, {
					field: l,
					htmlFor: l.id,
					className: u ? "!w-auto" : void 0
				}), /* @__PURE__ */ L("div", {
					className: F("flex min-w-0 items-center", !u && "flex-1"),
					children: d
				})]
			}, e.handle);
		})
	});
}
var Yn = "cms-input h-7 w-full min-w-0 rounded-sm px-2 text-sm placeholder:text-ghost";
function Xn(e) {
	return Array.isArray(e) ? String(e[0]) : e && typeof e == "object" && "min" in e ? `${e.min}–${e.max}` : String(e);
}
function Zn({ color: e, dark: t, className: n }) {
	return /* @__PURE__ */ R("span", {
		className: F("relative inline-block size-4 shrink-0 overflow-hidden rounded-[4px] align-middle [background:repeating-conic-gradient(#ddd_0_25%,#fff_0_50%)_0_0/6px_6px]", n),
		children: [
			/* @__PURE__ */ L("span", {
				className: "absolute inset-0",
				style: { background: e }
			}),
			t && /* @__PURE__ */ L("span", {
				className: "absolute inset-0 [clip-path:polygon(100%_50%,100%_100%,50%_100%)]",
				style: { background: t }
			}),
			/* @__PURE__ */ L("span", { className: "absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgb(0_0_0/0.12)]" })
		]
	});
}
var Qn = "grid size-6 shrink-0 place-items-center rounded-sm text-muted transition-colors duration-120 hover:bg-hover hover:text-ink";
function $n({ onClick: e, label: t = S("Add") }) {
	return /* @__PURE__ */ L(_e, {
		content: t,
		children: /* @__PURE__ */ L("button", {
			type: "button",
			onClick: e,
			className: Qn,
			"aria-label": t,
			children: /* @__PURE__ */ L(P, {
				name: "b-plus",
				size: 14
			})
		})
	});
}
function er({ onClick: e, label: t = S("Remove") }) {
	return /* @__PURE__ */ L(_e, {
		content: t,
		children: /* @__PURE__ */ L("button", {
			type: "button",
			onClick: e,
			className: F(Qn, "text-faint hover:text-danger"),
			"aria-label": t,
			children: /* @__PURE__ */ L(P, {
				name: "b-minus",
				size: 14
			})
		})
	});
}
// admin/src/builder/fields/tokens.tsx
function tr() {
	let { byPath: e } = Ne();
	return (t) => {
		if (typeof t != "string" || !t.startsWith("token:")) return null;
		let [n, r] = t.slice(6).split("/"), i = e.get(n);
		return i ? {
			token: i,
			alpha: r
		} : null;
	};
}
function nr(e) {
	let { byPath: t } = Ne();
	return (n) => {
		let r = n.trim().replace(/^\$/, "").replace(/^token:/, "");
		return t.has(r) ? `token:${r}` : e && t.has(`${e}.${r}`) && /^[a-z0-9-]+$/i.test(r) && !/^-?\d*\.?\d+$/.test(r) ? `token:${e}.${r}` : null;
	};
}
var rr = (e) => Xn(e.value);
function ir({ token: e, alpha: t, className: n }) {
	return /* @__PURE__ */ R("span", {
		className: F("inline-flex min-w-0 items-center gap-1 truncate rounded-xs bg-active px-1.5 leading-5 text-ink", n),
		title: `${e.path} · ${rr(e)}`,
		children: [/* @__PURE__ */ L("span", {
			className: "truncate",
			children: e.group === "color" ? e.name : e.path
		}), t && /* @__PURE__ */ R("span", {
			className: "text-muted",
			children: ["/", t]
		})]
	});
}
function ar({ group: e, value: t, onPick: n, detach: r }) {
	let { byGroup: i } = Ne(), a = i.get(e) ?? [], o = typeof t == "string" && t.startsWith("token:") ? t.slice(6).split("/")[0] : null;
	return a.length ? /* @__PURE__ */ R("div", { children: [
		/* @__PURE__ */ L("p", {
			className: "cms-label m-0 px-2 pb-1 pt-1.5 !text-2xs",
			children: S("Tokens")
		}),
		/* @__PURE__ */ L("div", {
			className: "max-h-60 overflow-y-auto",
			children: a.map((t) => /* @__PURE__ */ R("button", {
				type: "button",
				onClick: () => n(`token:${t.path}`),
				className: F("flex h-7 w-full items-center gap-2 rounded-xs px-2 text-left text-xs hover:bg-hover", o === t.path && "bg-active"),
				children: [
					e === "color" && /* @__PURE__ */ L(Zn, {
						color: String(t.value),
						dark: t.dark ? String(t.dark) : void 0
					}),
					e === "shadow" && /* @__PURE__ */ L("span", {
						className: "size-3.5 shrink-0 rounded-[3px] bg-bg",
						style: { boxShadow: String(t.value) }
					}),
					e === "radius" && /* @__PURE__ */ L("span", {
						className: "size-3.5 shrink-0 border-l-[1.5px] border-t-[1.5px] border-muted",
						style: { borderTopLeftRadius: String(t.value) }
					}),
					/* @__PURE__ */ L("span", {
						className: "min-w-0 truncate font-mono text-2xs",
						children: t.path
					}),
					/* @__PURE__ */ L("span", {
						className: "ml-auto max-w-[45%] shrink-0 truncate font-mono text-2xs text-faint",
						children: rr(t)
					}),
					o === t.path && /* @__PURE__ */ L(P, {
						name: "b-check",
						size: 12,
						className: "shrink-0 text-focus"
					})
				]
			}, t.path))
		}),
		o && r && /* @__PURE__ */ R("button", {
			type: "button",
			onClick: r,
			className: "mt-1 flex h-7 w-full items-center gap-2 rounded-xs border-t border-border px-2 text-xs text-muted hover:bg-hover hover:text-text",
			children: [/* @__PURE__ */ L(P, {
				name: "b-link-break",
				size: 12
			}), S("Detach Token")]
		})
	] }) : /* @__PURE__ */ L("p", {
		className: "m-0 px-2 py-2 text-2xs text-faint",
		children: S("No {group} tokens in the design system.", { group: e })
	});
}
function or({ group: e, value: t, onPick: n, active: r, className: i, trigger: a }) {
	let [o, s] = A(!1), { byGroup: c, byPath: l } = Ne();
	if (!(c.get(e) ?? []).length) return null;
	let u = (e) => {
		n(e), s(!1);
	};
	return /* @__PURE__ */ L(fe, {
		open: o,
		onOpenChange: s,
		align: "end",
		className: "w-60 !p-1",
		trigger: a ?? /* @__PURE__ */ L("button", {
			type: "button",
			className: F("grid size-5 shrink-0 place-items-center rounded-xs text-faint transition-opacity hover:bg-hover hover:text-ink", !r && !o && "opacity-0 group-hover/value:opacity-100 group-focus-within/value:opacity-100", (r || o) && "text-ink", i),
			"aria-label": S("Design Tokens"),
			title: S("Design Tokens"),
			children: /* @__PURE__ */ L(P, {
				name: "b-diamonds-four",
				size: 10
			})
		}),
		children: /* @__PURE__ */ L(ar, {
			group: e,
			value: t,
			onPick: u,
			detach: () => {
				let e = typeof t == "string" ? l.get(t.slice(6).split("/")[0]) : void 0;
				u(e && typeof e.value == "string" ? e.value : null);
			}
		})
	});
}
// admin/src/builder/fields/controls.tsx
function sr(e, t) {
	let n = e.if;
	return !n || Object.entries(n).every(([e, n]) => Array.isArray(n) ? n.includes(t[e]) : t[e] === n);
}
function cr({ field: e, ...t }) {
	let n = x.fields.get(e.component ?? e.type) ?? x.fields.get("json");
	return n ? /* @__PURE__ */ L("div", {
		className: F("min-w-0 flex-1", e.className),
		children: /* @__PURE__ */ L(n, {
			field: e,
			...t,
			context: t.context ?? {}
		})
	}) : null;
}
function lr({ className: e, children: t }) {
	return /* @__PURE__ */ L("div", {
		className: F("relative flex min-w-0 flex-1 items-center gap-1", e),
		children: t
	});
}
var ur = /^(-?\d*\.?\d+)([a-z%]*)$/i, dr = {
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
}, fr = (e, t, n) => Math.min(n ?? Infinity, Math.max(t ?? -Infinity, e)), pr = (e) => Math.round(e * 1e3) / 1e3;
function mr(e) {
	return e.field.percent ? /* @__PURE__ */ L(hr, { ...e }) : /* @__PURE__ */ L(yr, { ...e });
}
function hr({ field: e, value: t, onChange: n, ...r }) {
	let i = t == null || t === "" ? null : Number(t), a = (e) => typeof e == "number" ? Math.round(e * 100) : void 0, o = e.slider;
	return /* @__PURE__ */ L(yr, {
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
function gr(e, t) {
	let [n, r] = A(!1), i = t(e);
	return O(() => {
		if (i) return r(!1);
		let e = window.setTimeout(() => r(!0), 700);
		return () => window.clearTimeout(e);
	}, [e, i]), {
		shown: n && !i,
		show: () => r(!0)
	};
}
var _r = {
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
function vr(e, t, n) {
	if (typeof CSS > "u") return !0;
	let r = e.replace(/token:[a-z]+\.[a-z0-9-]+(\/\d{1,3})?/g, "var(--token)"), i = t.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`);
	return /^-?[a-z]+(-[a-z]+)*$/.test(i) && CSS.supports(i, "inherit") ? CSS.supports(i, r) : (_r[n] ?? _r.length).some((e) => CSS.supports(e, r));
}
function yr({ field: e, value: t, onChange: n, disabled: r, context: i }) {
	let a = tr(), o = nr(e.group), [s, c] = A(null), [l, u] = A(null), d = k(null), f = k(null), [p, m] = A(0);
	se(() => {
		let e = f.current ? f.current.offsetWidth + 4 : 0;
		e !== p && m(e);
	});
	let h = t == null || t === "" ? void 0 : String(t), g = e.unit ?? "px", _ = e.step ?? 1, v = e.min, y = e.max, b = e.group, x = e.prefixIcon ? /* @__PURE__ */ L(P, {
		name: e.prefixIcon,
		size: 13
	}) : e.prefix, ee = e.slider, te = e.menu, C = e.action, w = e.keywords ?? [], T = a(h), E = h?.match(ur), D = E ? E[2] || g : h ? "" : l ?? g, ne = g ? e.units ?? dr[g] ?? [g] : [], re = !h || !!E, ie = (e, t = D) => n(`${pr(fr(e, v, y))}${t}`), ae = (e) => {
		re && ie((E ? parseFloat(E[1]) : 0) + e);
	}, O = (e, t) => {
		if (r || e.button !== 0 || document.activeElement === e.currentTarget || !re) return;
		e.preventDefault();
		let n = e.clientX, i = E ? parseFloat(E[1]) : 0, a = !1, o = (e) => {
			let t = e.clientX - n;
			!a && Math.abs(t) < 3 || (a = !0, document.body.style.cursor = "ew-resize", ie(i + Math.round(t / 2) * _ * (e.shiftKey ? 10 : e.altKey ? .1 : 1)));
		}, s = () => {
			window.removeEventListener("pointermove", o), window.removeEventListener("pointerup", s), document.body.style.cursor = "", !a && t && d.current?.focus();
		};
		window.addEventListener("pointermove", o), window.addEventListener("pointerup", s);
	}, oe = (t) => t === "" ? null : o(t) || (/^-?\d*\.?\d+$/.test(t) ? D ? `${t}${D}` : t : w.includes(t) || vr(t, e.property ?? e.handle, g) ? t : void 0), ce = gr(s ?? "", (e) => s === null || oe(e.trim()) !== void 0), j = () => {
		if (s === null) return;
		let e = s.trim();
		if (c(null), e === (E ? E[1] : h ?? "")) return;
		let t = oe(e);
		t !== void 0 && n(t);
	}, M = (e) => {
		E ? n(`${E[1]}${e}`) : h || u(e);
	};
	return /* @__PURE__ */ R(lr, { children: [
		ee && /* @__PURE__ */ L(cr, {
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
			value: E ? parseFloat(E[1]) : null,
			onChange: (e) => n(e),
			disabled: r,
			context: i
		}),
		/* @__PURE__ */ R("div", {
			className: F("group/value relative flex h-7 min-w-0 flex-1 items-center", ee && "!w-16 !flex-none"),
			title: e.title,
			children: [
				x !== void 0 && /* @__PURE__ */ L("span", {
					onPointerDown: (e) => O(e, !0),
					className: "absolute left-0 z-10 grid h-7 w-6 cursor-ew-resize select-none place-items-center text-xs text-faint hover:text-ink",
					children: x
				}),
				T && s === null ? /* @__PURE__ */ L(or, {
					group: b ?? T.token.group,
					value: h,
					onPick: n,
					trigger: /* @__PURE__ */ L("button", {
						type: "button",
						onDoubleClick: () => c(h ?? ""),
						className: F(Yn, "flex items-center pr-1 text-left", x !== void 0 && "!pl-6"),
						children: /* @__PURE__ */ L(ir, {
							token: T.token,
							alpha: T.alpha,
							className: "text-xs"
						})
					})
				}) : /* @__PURE__ */ L("input", {
					ref: d,
					id: I(e),
					value: s ?? (E ? E[1] : h ?? ""),
					placeholder: e.placeholder,
					disabled: r,
					autoComplete: "off",
					spellCheck: !1,
					onPointerDown: (e) => O(e, !0),
					onChange: (e) => c(e.target.value),
					onFocus: (e) => e.target.select(),
					onBlur: j,
					"aria-invalid": ce.shown || void 0,
					onKeyDown: (e) => {
						e.key === "Enter" && (s !== null && oe(s.trim()) === void 0 ? ce.show() : e.target.blur()), e.key === "Escape" && (c(null), requestAnimationFrame(() => d.current?.blur())), (e.key === "ArrowUp" || e.key === "ArrowDown") && re && (e.preventDefault(), c(null), ae((e.key === "ArrowUp" ? 1 : -1) * _ * (e.shiftKey ? 10 : e.altKey ? .1 : 1)));
					},
					className: F(Yn, "tabular-nums", re && !r && "cursor-ew-resize focus:cursor-text", x !== void 0 && "!pl-6"),
					style: { paddingRight: (h ? p : 0) + 6 }
				}),
				(!T || s !== null) && /* @__PURE__ */ R("div", {
					ref: f,
					className: "pointer-events-none absolute inset-y-0 right-1 flex items-center",
					children: [
						b && /* @__PURE__ */ L(or, {
							group: b,
							value: h,
							onPick: n,
							className: "pointer-events-auto"
						}),
						D && ne.length > 0 && /* @__PURE__ */ L(de, {
							align: "end",
							trigger: /* @__PURE__ */ L("button", {
								type: "button",
								disabled: r,
								className: F("pointer-events-auto h-5 min-w-5 rounded-xs px-1 text-2xs text-faint hover:bg-hover hover:text-ink data-[popup-open]:opacity-100", !h && "opacity-0 group-hover/value:opacity-100 group-focus-within/value:opacity-100"),
								"aria-label": S("Unit"),
								children: D
							}),
							items: [...ne.map((e) => ({
								label: e,
								checked: e === D,
								onSelect: () => M(e)
							})), ...w.length ? [{
								separator: !0,
								label: ""
							}, ...w.map((e) => ({
								label: e,
								checked: h === e,
								onSelect: () => n(e)
							}))] : []]
						}),
						!D && g && w.length > 0 && h && w.includes(h) && /* @__PURE__ */ L(de, {
							align: "end",
							trigger: /* @__PURE__ */ L("button", {
								type: "button",
								className: "pointer-events-auto grid size-5 place-items-center rounded-xs text-faint hover:bg-hover hover:text-ink",
								"aria-label": S("Unit"),
								children: /* @__PURE__ */ L(P, {
									name: "b-caret-down",
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
								...w.map((e) => ({
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
		te && /* @__PURE__ */ L(de, {
			align: "end",
			trigger: /* @__PURE__ */ R("button", {
				type: "button",
				className: "flex h-7 shrink-0 items-center gap-0.5 rounded-sm px-1.5 text-xs text-muted hover:bg-hover hover:text-ink",
				children: [te.label, /* @__PURE__ */ L(P, {
					name: "b-caret-down",
					size: 10
				})]
			}),
			items: te.items.map((e) => ({
				label: e.label,
				checked: e.checked,
				onSelect: () => n(e.value)
			}))
		}),
		C && /* @__PURE__ */ L("button", {
			type: "button",
			onClick: () => n(C.value),
			className: "grid size-7 shrink-0 place-items-center rounded-sm text-muted hover:bg-hover hover:text-ink",
			title: C.label,
			"aria-label": C.label,
			children: /* @__PURE__ */ L(P, {
				name: C.icon,
				size: 14
			})
		})
	] });
}
// admin/src/builder/fields/composite.tsx
var br = {
	2: "grid grid-cols-2",
	3: "grid grid-cols-3",
	4: "grid grid-cols-4"
};
function xr({ field: e, value: t, onChange: n, disabled: r, context: i }) {
	let a = t ?? {}, o = e.link, [s, c] = A(!o || e.split === !0), l = (s ? e.fields ?? [] : [o]).filter((e) => sr(e, a)), u = s ? br[e.columns] : void 0;
	return /* @__PURE__ */ R(lr, { children: [/* @__PURE__ */ L("div", {
		className: F("min-w-0 flex-1 gap-1", u ?? "flex items-center"),
		children: l.map((e) => /* @__PURE__ */ L(cr, {
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
		children: /* @__PURE__ */ L(P, {
			name: s ? "b-square" : "b-corners-out",
			size: 14
		})
	})] });
}
function Sr({ field: e, value: t, onChange: n, disabled: r, context: i }) {
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
				}) : /* @__PURE__ */ L(cr, {
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
				/* @__PURE__ */ L(cr, {
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
				/* @__PURE__ */ L(er, { onClick: () => n(Object.fromEntries(Object.entries(a).filter(([e]) => e !== t))) })
			]
		}, t))
	});
}
function Cr(e, t) {
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
var wr = () => [
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
], Tr = () => [
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
function Er(t) {
	let { store: n, doc: r, catalog: i } = z(), a = w(), o = B(n, (n) => e(n.nodes, t.id)), s = C("entries/get", { id: r?.id ?? "" }, {
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
	u.push(...wr());
	for (let e of l.data?.fields ?? []) e.type !== "blocks" && u.push({
		path: `entry.${e.handle}${e.type === "date" ? "|date:F j, Y" : ""}`,
		label: e.label,
		group: S("Page Fields")
	});
	u.push(...Tr());
	for (let e of a.globals) u.push({
		path: `globals.${e.handle}.`,
		label: S("{name} (add a field handle)", { name: e.title }),
		group: S("Globals")
	});
	return u;
}
// admin/src/builder/content/ContentPanel.tsx
var Dr = [
	"text",
	"textarea",
	"richtext",
	"markdown"
], Or = (e, t) => !e.if || Object.entries(e.if).every(([e, n]) => {
	let r = t[e] ?? null;
	return Array.isArray(n) ? n.includes(r) : r === n;
});
function kr({ field: e, value: t, bound: n, paths: r, onValue: i, onBind: a, extra: o }) {
	let s = e.type === "richtext" && e.inline && e.handle !== "text" && !e.component ? {
		...e,
		component: "blocks-inline-text"
	} : e, c = !n && Ce.includes(s.type) && !s.component, l = !n && qn(s), u = !n && s.type === "toggle", d = n ? {
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
	}, f = { [s.handle]: n ?? t }, p = (e, t) => n ? a(t) : i(t), m = c ? /* @__PURE__ */ L(N, {
		bare: !0,
		fields: [d],
		values: f,
		onChange: p,
		className: "min-w-0"
	}) : /* @__PURE__ */ L(J, {
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
	let h = /* @__PURE__ */ L(_e, {
		content: S(n ? "Disconnect from Data" : "Connect to Data"),
		children: /* @__PURE__ */ L("button", {
			type: "button",
			onClick: () => a(n ? null : r[0]?.path ?? "entry.title"),
			"aria-label": S(n ? "Disconnect from Data" : "Connect to Data"),
			className: F("grid h-6 shrink-0 place-items-center overflow-hidden rounded-sm hover:bg-hover", n ? "w-6 text-ink" : "w-0 text-faint hover:text-ink focus-visible:w-6 group-hover/prop:w-6 [@media(hover:none)]:w-6"),
			children: /* @__PURE__ */ L(P, {
				name: "b-database",
				size: 13
			})
		})
	}), g = /* @__PURE__ */ R("span", {
		className: F("flex h-7 min-w-0 shrink-0 items-center gap-0.5", !l && "w-[88px]"),
		children: [/* @__PURE__ */ L("label", {
			htmlFor: I(s),
			className: F("min-w-0 flex-1 truncate text-xs", n ? "text-ink" : "text-muted"),
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
function Ar({ node: e }) {
	let { store: t, types: n } = z(), r = n.get(e.type), i = Er(e), a = et().filter((t) => t.id !== (e.anchor ?? e.props?.anchor)), o = e.bind ?? {}, s = {
		...Object.fromEntries((r?.fields ?? []).map((e) => [e.handle, e.default ?? null])),
		...r?.defaults ?? {},
		...e.props ?? {}
	}, c = (n, r) => {
		let i = { ...o };
		r ? i[n] = r : delete i[n], t.updateNode(e.id, { bind: Object.keys(i).length ? i : void 0 }, `bind:${e.id}:${n}`);
	}, l = (n, r) => t.updateProps(e.id, { [n]: r }, `inspector:${e.id}:${n}`), u = (r?.fields ?? []).filter((e) => !e.design && !(e.type === "json" && [
		"items",
		"rows",
		"values"
	].includes(e.handle))), d = u.some((e) => e.component === "link") && u.some((e) => e.handle === "new_tab"), f = u.filter((e) => !(d && e.handle === "new_tab") && Or(e, s)), p = f.filter((e) => !e.advanced), m = f.filter((e) => e.advanced), h = (t) => /* @__PURE__ */ L(kr, {
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
		e.type === "pattern" ? /* @__PURE__ */ L(jr, {
			node: e,
			paths: i,
			setBind: c,
			anchors: a
		}) : g ? /* @__PURE__ */ L(Mr, { node: e }) : p.length > 0 && /* @__PURE__ */ L(Un, { children: p.map(h) }),
		/* @__PURE__ */ L(Hn, {
			title: S("Visibility"),
			open: !!(o.visible || o.hidden || e.hidden),
			empty: !o.visible && !o.hidden && !e.hidden,
			children: /* @__PURE__ */ L(J, {
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
		/* @__PURE__ */ R(Hn, {
			title: S("Advanced"),
			open: !1,
			empty: !e.anchor && !e.attrs && !e.class && !m.some((t) => e.props?.[t.handle] !== void 0 && e.props?.[t.handle] !== t.default),
			children: [
				g ? /* @__PURE__ */ L(Nr, { node: e }) : m.map(h),
				/* @__PURE__ */ L(J, {
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
				/* @__PURE__ */ L(Wn, {
					title: S("Attributes"),
					action: /* @__PURE__ */ L($n, {
						label: S("Add Attribute"),
						onClick: () => t.updateNode(e.id, { attrs: {
							...e.attrs ?? {},
							"aria-label": ""
						} })
					})
				}),
				/* @__PURE__ */ L(J, {
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
						let i = e.attrs ?? {}, a = Cr(Object.fromEntries(Object.entries(i).map(([e, t]) => [e, o[`attr:${e}`] ?? t])), r);
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
				/* @__PURE__ */ L(Wn, {
					title: S("States from Data"),
					action: /* @__PURE__ */ L($n, {
						label: S("Add State from Data"),
						onClick: () => c("state:active", i[0]?.path ?? "item.active")
					})
				}),
				/* @__PURE__ */ L(J, {
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
function jr({ node: e, paths: t, setBind: n, anchors: i }) {
	let { store: o } = z(), s = C("patterns/list", { working: !0 }, { staleTime: 3e4 }), c = s.data?.find((t) => t.handle === e.props?.ref), l = e.props?.values ?? {}, d = e.bind ?? {};
	return /* @__PURE__ */ R(Un, { children: [
		/* @__PURE__ */ L(J, {
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
		(c?.props ?? []).map((r) => /* @__PURE__ */ L(kr, {
			field: {
				...r,
				placeholder: r.placeholder ?? (Dr.includes(r.type) ? r.label : void 0)
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
			children: [c?.id && /* @__PURE__ */ L(M, {
				size: "sm",
				variant: "ghost",
				icon: "b-pencil-simple",
				onClick: () => y(`/content/components/${c.id}`),
				children: S("Edit Component")
			}), /* @__PURE__ */ L(M, {
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
function Mr({ node: e }) {
	let { store: t, catalog: n } = z(), r = n.sources?.find((t) => t.name === e.props?.source), i = (n, r) => t.updateProps(e.id, { [n]: r }, `repeat:${e.id}:${n}`);
	return /* @__PURE__ */ R(Un, { children: [
		/* @__PURE__ */ L(J, {
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
		/* @__PURE__ */ L(J, {
			fields: (r?.fields ?? []).map((e) => ({
				...e,
				size: "sm",
				width: "full"
			})),
			values: Object.fromEntries((r?.fields ?? []).map((t) => [t.handle, e.props?.[t.handle]])),
			onChange: (e, t) => i(e, t)
		}),
		/* @__PURE__ */ L(J, {
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
function Nr({ node: e }) {
	let { store: t } = z(), n = (n, r) => t.updateProps(e.id, { [n]: r }, `repeat:${e.id}:${n}`);
	return /* @__PURE__ */ L(J, {
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
function Pr(e) {
	let { store: t, catalog: n } = z(), r = B(t, (e) => e.breakpoint), i = B(t, (e) => e.state), a = Fe(r, i), o = Ie(r, i), s = e.style ?? {}, c = n.aliases ?? {}, l = (e) => {
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
// admin/src/builder/css.ts
function Fr(e) {
	let t = [], n = 0, r = "";
	for (let i of e.trim()) i === "(" && n++, i === ")" && n--, /\s/.test(i) && n === 0 ? (r && t.push(r), r = "") : r += i;
	return r && t.push(r), t;
}
function Ir(e) {
	let t = [], n = 0, r = "";
	for (let i of e) i === "(" && n++, i === ")" && n--, i === "," && n === 0 ? (t.push(r.trim()), r = "") : r += i;
	return r.trim() && t.push(r.trim()), t;
}
function Lr(e) {
	if (e === void 0 || e === "") return null;
	let t = Fr(String(e));
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
function Y({ s: e, fields: t, bare: n }) {
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
	return /* @__PURE__ */ L(J, {
		bare: n,
		fields: a,
		values: i,
		onChange: (t, n) => {
			let a = r.find((e) => e.handle === t);
			if (a.set) return a.set(n);
			if (!n || typeof n != "object") return e.set(t, n);
			let o = zr(i[t] ?? {}, n);
			Object.keys(o).length && e.write(o);
		}
	});
}
var Rr = (e) => e === "none" ? void 0 : e;
function zr(e, t) {
	return Object.fromEntries(Object.entries(t ?? {}).filter(([t, n]) => n !== e[t]));
}
// admin/src/builder/design/Border.tsx
var Br = [
	"borderTopLeftRadius",
	"borderTopRightRadius",
	"borderBottomRightRadius",
	"borderBottomLeftRadius"
], Vr = [
	"borderTop",
	"borderRight",
	"borderBottom",
	"borderLeft"
], Hr = [
	"solid",
	"dashed",
	"dotted",
	"double",
	"none"
], Ur = (e) => Hr.includes(e), Wr = (e) => /^-?[\d.]/.test(e) || /^token:(space|border)/.test(e) || /^(thin|medium|thick)$/.test(e);
function Gr(e) {
	let t = Fr(e ?? "");
	return {
		width: t.find(Wr),
		style: t.find(Ur),
		color: t.find((e) => !Wr(e) && !Ur(e))
	};
}
var Kr = (e) => e.width || e.style || e.color ? [
	e.width ?? "1px",
	e.style ?? "solid",
	e.color
].filter(Boolean).join(" ") : null, qr = () => [
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
		value: "double",
		label: S("Double")
	},
	{
		value: "none",
		label: S("None")
	}
];
function Jr({ s: e }) {
	let [t, n] = A(() => Vr.find((t) => e.value(t)) ?? "all"), r = Gr(e.value("border")), i = {
		width: e.value("borderWidth") ?? r.width,
		style: e.value("borderStyle") ?? r.style,
		color: e.value("borderColor") ?? r.color
	}, a = t === "all" ? i : Gr(e.value(t)), o = Br.map((t) => e.value(t)), s = (t) => e.value(Br[t]) ?? Lr(e.value("borderRadius"))?.[t], c = Gr(e.value("outline")), l = i.width || i.style || i.color || e.value("borderRadius") || o.some(Boolean) || Vr.some((t) => e.value(t)) || e.value("outline"), u = (t) => (t === "all" ? [
		"border",
		"borderWidth",
		"borderStyle",
		"borderColor"
	] : [t]).map((t) => e.status(t)), d = (e) => u(e).includes("own") ? "own" : u(e).includes("inherited") ? "inherited" : void 0, f = (n) => {
		let r = {
			...a,
			...n
		};
		n.width && !r.style && (r.style = "solid"), t === "all" ? e.write({
			border: null,
			borderWidth: r.width ?? null,
			borderStyle: r.style ?? null,
			borderColor: r.color ?? null
		}) : e.set(t, Kr(r));
	}, p = (e, t, n) => ({
		value: e,
		icon: t,
		title: d(e) ? `${n} · ${d(e) === "own" ? S("set") : S("inherited")}` : n
	});
	return /* @__PURE__ */ R(Hn, {
		title: S("Border"),
		empty: !l,
		children: [/* @__PURE__ */ L(Y, {
			s: e,
			fields: [
				{
					handle: "edge",
					type: "select",
					display: "segmented",
					block: !0,
					required: !0,
					size: "sm",
					label: S("Sides"),
					keys: [],
					get: () => t,
					set: (e) => e && n(e),
					options: [
						p("all", "b-side-all", S("All Sides")),
						p("borderTop", "b-side-top", S("Top")),
						p("borderRight", "b-side-right", S("Right")),
						p("borderBottom", "b-side-bottom", S("Bottom")),
						p("borderLeft", "b-side-left", S("Left"))
					]
				},
				{
					handle: "line",
					type: "group",
					component: "blocks-group",
					label: S("Width"),
					status: d(t),
					keys: t === "all" ? [
						"border",
						"borderWidth",
						"borderStyle"
					] : [t],
					get: () => ({
						width: a.width,
						style: a.style
					}),
					set: (e) => f(zr({
						width: a.width,
						style: a.style
					}, e)),
					fields: [{
						handle: "width",
						type: "text",
						component: "blocks-value",
						label: S("Width"),
						placeholder: "0",
						min: 0,
						prefixIcon: "b-square"
					}, {
						handle: "style",
						type: "select",
						size: "sm",
						label: S("Style"),
						options: qr(),
						placeholder: S("Style")
					}]
				},
				{
					handle: "lineColor",
					type: "color",
					component: "blocks-color",
					label: S("Color"),
					placeholder: S("Text Color"),
					keys: t === "all" ? ["border", "borderColor"] : [t],
					status: t === "all" ? Rr(e.status("borderColor")) : d(t),
					get: () => a.color,
					set: (e) => f({ color: e ?? void 0 })
				},
				{
					handle: "radius",
					type: "group",
					component: "blocks-group",
					label: S("Radius"),
					status: e.status("borderRadius") === "own" || Br.some((t) => e.status(t) === "own") ? "own" : Rr(e.status("borderRadius")),
					keys: ["borderRadius", ...Br],
					columns: 2,
					split: o.some(Boolean),
					splitLabel: S("Each Corner"),
					joinLabel: S("Same radius for every corner"),
					link: {
						handle: "borderRadius",
						type: "text",
						component: "blocks-value",
						label: S("Radius"),
						group: "radius",
						prefixIcon: "b-frame-corners",
						placeholder: "0",
						min: 0
					},
					fields: Br.map((e, t) => ({
						handle: e,
						type: "text",
						component: "blocks-value",
						label: [
							S("Top Left"),
							S("Top Right"),
							S("Bottom Right"),
							S("Bottom Left")
						][t],
						title: [
							S("Top Left"),
							S("Top Right"),
							S("Bottom Right"),
							S("Bottom Left")
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
						...Object.fromEntries(Br.map((e, t) => [e, s(t)]))
					}),
					set: (t) => {
						if (t.borderRadius !== e.value("borderRadius")) return e.set("borderRadius", t.borderRadius);
						e.write({
							borderRadius: null,
							...Object.fromEntries(Br.map((e) => [e, t[e] ?? null]))
						});
					}
				}
			]
		}), /* @__PURE__ */ L("div", {
			className: "!mt-3 border-t border-border pt-2",
			children: /* @__PURE__ */ L(Y, {
				s: e,
				fields: [
					{
						handle: "outlineLine",
						type: "group",
						component: "blocks-group",
						label: S("Outline"),
						keys: ["outline"],
						get: () => ({
							width: c.width,
							style: c.style
						}),
						set: (t) => e.set("outline", Kr({
							...c,
							...zr({
								width: c.width,
								style: c.style
							}, t)
						})),
						fields: [{
							handle: "width",
							type: "text",
							component: "blocks-value",
							label: S("Width"),
							placeholder: "0",
							min: 0,
							prefixIcon: "b-selection"
						}, {
							handle: "style",
							type: "select",
							size: "sm",
							label: S("Style"),
							options: qr(),
							placeholder: S("Style")
						}]
					},
					c.width || c.style ? {
						handle: "outlineColor",
						type: "color",
						component: "blocks-color",
						label: S("Outline Color"),
						placeholder: S("Text Color"),
						keys: ["outline"],
						get: () => c.color,
						set: (t) => e.set("outline", Kr({
							...c,
							color: t ?? void 0
						}))
					} : null,
					c.width || c.style || e.value("outlineOffset") ? {
						handle: "outlineOffset",
						type: "text",
						component: "blocks-value",
						label: S("Offset"),
						placeholder: "0",
						prefixIcon: "b-arrows-out-simple"
					} : null
				]
			})
		})]
	});
}
// admin/src/builder/design/more.tsx
var X = (e, t, n = t[0]) => ({
	label: e,
	type: "select",
	size: "sm",
	placeholder: n,
	options: t.map((e) => ({
		value: e,
		label: e
	}))
}), Z = (e, t = {}) => ({
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
}), Yr = (e, t = {}) => ({
	label: e,
	type: "text",
	component: "blocks-value",
	unit: "",
	placeholder: "0",
	...t
}), Xr = (e) => ({
	label: e,
	type: "color",
	component: "blocks-color",
	placeholder: S("None")
}), Q = (e, t = "") => ({
	label: e,
	type: "text",
	size: "sm",
	commit: "blur",
	mono: !0,
	placeholder: t
}), Zr = [
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
function Qr() {
	let e = (e, t) => Object.fromEntries(Object.entries(t).map(([t, n]) => [t, {
		group: e,
		field: n
	}]));
	return {
		...e("layout", {
			alignContent: X(S("Align Content"), [
				"normal",
				"start",
				"center",
				"end",
				"space-between",
				"space-around",
				"space-evenly",
				"stretch"
			]),
			placeItems: Q(S("Place Items"), "center"),
			placeContent: Q(S("Place Content"), "center"),
			gridTemplateAreas: Q(S("Grid Template Areas"), "\"a b\" \"c c\""),
			gridAutoColumns: Q(S("Grid Auto Columns"), "auto"),
			gridAutoRows: Q(S("Grid Auto Rows"), "auto"),
			columns: Yr(S("Columns"), {
				placeholder: S("Auto"),
				min: 1
			}),
			columnRule: Q(S("Column Rule"), "1px solid"),
			boxSizing: X(S("Box Sizing"), ["border-box", "content-box"]),
			float: X(S("Float"), [
				"none",
				"left",
				"right"
			]),
			clear: X(S("Clear"), [
				"none",
				"left",
				"right",
				"both"
			]),
			containerType: X(S("Container Type"), [
				"normal",
				"inline-size",
				"size"
			])
		}),
		...e("item", {
			justifySelf: X(S("Justify Self"), [
				"auto",
				"start",
				"center",
				"end",
				"stretch"
			]),
			placeSelf: Q(S("Place Self"), "center"),
			gridArea: Q(S("Grid Area"), "a"),
			flexGrow: Yr(S("Flex Grow"), { min: 0 }),
			flexShrink: Yr(S("Flex Shrink"), {
				placeholder: "1",
				min: 0
			}),
			flexBasis: Z(S("Flex Basis"), { placeholder: S("Auto") })
		}),
		...e("position", { inset: Z(S("Inset"), { placeholder: S("Auto") }) }),
		...e("size", {
			overflowX: X(S("Overflow X"), [
				"visible",
				"hidden",
				"clip",
				"scroll",
				"auto"
			]),
			overflowY: X(S("Overflow Y"), [
				"visible",
				"hidden",
				"clip",
				"scroll",
				"auto"
			]),
			overscrollBehavior: X(S("Overscroll Behavior"), [
				"auto",
				"contain",
				"none"
			]),
			scrollSnapType: X(S("Scroll Snap Type"), [
				"none",
				"x mandatory",
				"x proximity",
				"y mandatory",
				"y proximity",
				"both mandatory"
			]),
			scrollSnapAlign: X(S("Scroll Snap Align"), [
				"none",
				"start",
				"center",
				"end"
			]),
			scrollMarginTop: Z(S("Scroll Margin Top")),
			scrollPadding: Z(S("Scroll Padding")),
			scrollbarWidth: X(S("Scrollbar Width"), [
				"auto",
				"thin",
				"none"
			])
		}),
		...e("typography", {
			textDecorationColor: Xr(S("Text Decoration Color")),
			textDecorationThickness: Z(S("Text Decoration Thickness"), { placeholder: S("Auto") }),
			textUnderlineOffset: Z(S("Text Underline Offset"), {
				unit: "em",
				units: ["em", "px"],
				step: .05,
				placeholder: S("Auto")
			}),
			whiteSpace: X(S("White Space"), [
				"normal",
				"nowrap",
				"pre",
				"pre-wrap",
				"pre-line",
				"break-spaces"
			]),
			wordBreak: X(S("Word Break"), [
				"normal",
				"break-all",
				"keep-all",
				"break-word"
			]),
			overflowWrap: X(S("Overflow Wrap"), [
				"normal",
				"anywhere",
				"break-word"
			]),
			hyphens: X(S("Hyphens"), [
				"manual",
				"auto",
				"none"
			]),
			textIndent: Z(S("Text Indent"), {
				unit: "em",
				units: [
					"em",
					"px",
					"rem"
				]
			}),
			textOverflow: X(S("Text Overflow"), ["clip", "ellipsis"]),
			fontVariantNumeric: X(S("Font Variant Numeric"), [
				"normal",
				"tabular-nums",
				"proportional-nums",
				"lining-nums",
				"oldstyle-nums",
				"slashed-zero"
			]),
			fontFeatureSettings: Q(S("Font Feature Settings"), "\"ss01\""),
			fontVariationSettings: Q(S("Font Variation Settings"), "\"wght\" 500"),
			listStyle: X(S("List Style"), [
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
			verticalAlign: X(S("Vertical Align"), [
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
			background: Q(S("Background"), "none"),
			backgroundBlendMode: X(S("Background Blend Mode"), Zr)
		}),
		...e("effects", {
			userSelect: X(S("User Select"), [
				"auto",
				"none",
				"text",
				"all"
			]),
			visibility: X(S("Visibility"), [
				"visible",
				"hidden",
				"collapse"
			]),
			maskImage: Q(S("Mask Image"), "linear-gradient(black, transparent)"),
			accentColor: Xr(S("Accent Color")),
			fill: Xr(S("Fill")),
			stroke: Xr(S("Stroke")),
			strokeWidth: Z(S("Stroke Width")),
			content: Q(S("Content"), "\"\"")
		}),
		...e("transform", {
			perspectiveOrigin: Q(S("Perspective Origin"), "center"),
			transformStyle: X(S("Transform Style"), ["flat", "preserve-3d"]),
			backfaceVisibility: X(S("Backface Visibility"), ["visible", "hidden"])
		}),
		...e("transition", {
			transitionProperty: Q(S("Transition Property"), "all"),
			transitionDuration: Q(S("Transition Duration"), "200ms"),
			transitionTimingFunction: Q(S("Transition Timing Function"), "ease"),
			transitionDelay: Q(S("Transition Delay"), "0ms"),
			willChange: Q(S("Will Change"), "auto")
		})
	};
}
function $r() {
	return {
		display: X(S("Display"), [
			"block",
			"inline",
			"inline-block",
			"flex",
			"grid",
			"none"
		]),
		width: Z(S("Width"), {
			unit: "rem",
			units: [
				"rem",
				"px",
				"%",
				"ch"
			],
			placeholder: S("Auto")
		}),
		maxWidth: Z(S("Max Width"), {
			unit: "rem",
			units: [
				"rem",
				"px",
				"%",
				"ch"
			],
			placeholder: S("None")
		}),
		textAlign: X(S("Text Align"), [
			"left",
			"center",
			"right",
			"justify"
		]),
		fontStyle: X(S("Font Style"), ["normal", "italic"]),
		textTransform: X(S("Text Transform"), [
			"none",
			"uppercase",
			"lowercase",
			"capitalize"
		]),
		textDecoration: X(S("Text Decoration"), [
			"none",
			"underline",
			"line-through",
			"overline"
		]),
		textWrap: X(S("Text Wrap"), [
			"wrap",
			"balance",
			"pretty",
			"nowrap"
		]),
		textShadow: Q(S("Text Shadow"), "0 1px 2px rgb(0 0 0 / 0.2)"),
		boxShadow: Q(S("Box Shadow"), "0 4px 16px rgb(0 0 0 / 0.1)"),
		opacity: Yr(S("Opacity"), {
			percent: !0,
			step: .05,
			min: 0,
			max: 1,
			placeholder: "100"
		}),
		borderStyle: X(S("Border Style"), [
			"solid",
			"dashed",
			"dotted",
			"double",
			"none"
		]),
		borderTop: Q(S("Border Top"), "1px solid"),
		borderRight: Q(S("Border Right"), "1px solid"),
		borderBottom: Q(S("Border Bottom"), "1px solid"),
		borderLeft: Q(S("Border Left"), "1px solid"),
		paddingTop: Z(S("Padding Top"), { unit: "rem" }),
		paddingRight: Z(S("Padding Right"), { unit: "rem" }),
		paddingBottom: Z(S("Padding Bottom"), { unit: "rem" }),
		paddingLeft: Z(S("Padding Left"), { unit: "rem" }),
		marginBlock: Z(S("Margin Block"), { unit: "rem" }),
		marginInline: Z(S("Margin Inline"), { unit: "rem" })
	};
}
function ei(e, t = Qr()) {
	let n = e.replace(/([A-Z])/g, " $1");
	return {
		handle: e,
		type: "text",
		size: "sm",
		commit: "blur",
		mono: !0,
		label: n.charAt(0).toUpperCase() + n.slice(1),
		...t[e]?.field ?? $r()[e]
	};
}
function ti({ properties: e, onPick: t, label: n = S("Add a Property"), children: r }) {
	let [i, a] = A(!1), [o, s] = A(""), [c, l] = A(0), u = Qr(), d = o.trim().toLowerCase(), f = e.map((e) => ({
		property: e,
		label: String(ei(e, u).label)
	})).filter((e) => !d || e.label.toLowerCase().includes(d)).sort((e, t) => e.label.localeCompare(t.label)), p = (e) => {
		e && (a(!1), t(e));
	};
	return e.length === 0 ? null : /* @__PURE__ */ R(fe, {
		open: i,
		onOpenChange: (e) => {
			a(e), s(""), l(0);
		},
		align: "end",
		className: "flex w-60 flex-col overflow-hidden !p-0",
		trigger: r ?? /* @__PURE__ */ L(ue, {
			icon: "b-plus",
			size: "xs",
			label: n
		}),
		children: [/* @__PURE__ */ R("div", {
			className: "flex h-9 shrink-0 items-center gap-2 border-b border-border px-3",
			children: [/* @__PURE__ */ L(P, {
				name: "search",
				size: 14,
				className: "shrink-0 text-faint"
			}), /* @__PURE__ */ L("input", {
				autoFocus: !0,
				value: o,
				onChange: (e) => {
					s(e.target.value), l(0);
				},
				onKeyDown: (e) => {
					(e.key === "ArrowDown" || e.key === "ArrowUp") && (e.preventDefault(), l((t) => Math.max(0, Math.min(f.length - 1, t + (e.key === "ArrowDown" ? 1 : -1))))), e.key === "Enter" && (e.preventDefault(), p(f[c]?.property));
				},
				placeholder: S("Search…"),
				"aria-label": S("Search…"),
				className: "h-full min-w-0 flex-1 bg-transparent text-sm text-text outline-none"
			})]
		}), /* @__PURE__ */ R("div", {
			role: "listbox",
			"aria-label": n,
			className: "max-h-64 overflow-y-auto overscroll-contain p-1",
			children: [f.length === 0 && /* @__PURE__ */ L("p", {
				className: "m-0 px-2 py-3 text-sm text-muted",
				children: S("No matches")
			}), f.map((e, t) => /* @__PURE__ */ L("button", {
				type: "button",
				role: "option",
				"aria-selected": t === c,
				tabIndex: -1,
				onMouseEnter: () => l(t),
				onClick: () => p(e.property),
				className: F("flex h-7 w-full items-center rounded-xs px-2 text-left text-sm text-text", t === c && "bg-hover text-ink"),
				children: e.label
			}, e.property))]
		})]
	});
}
function ni({ s: e, group: t, title: n, open: r, empty: i, children: a }) {
	let [o, s] = A(null), c = Qr(), l = Object.keys(c).filter((e) => c[e].group === t), u = l.filter((t) => e.value(t) !== void 0 || t === o);
	return /* @__PURE__ */ R(Hn, {
		title: n,
		open: r,
		empty: i && u.length === 0,
		actions: /* @__PURE__ */ L(ti, {
			properties: l.filter((e) => !u.includes(e)),
			onPick: s
		}),
		children: [a, u.length > 0 && /* @__PURE__ */ L(Y, {
			s: e,
			fields: u.map((t) => ({
				...ei(t, c),
				set: (n) => {
					t === o && s(null), e.set(t, n);
				}
			}))
		})]
	});
}
function ri({ field: e, value: t, onChange: n, disabled: r }) {
	let i = t ?? {}, [a, o] = A(null), s = new Set(e.hidden ?? []), c = [...Object.keys(i).filter((e) => !s.has(e)), ...a && !(a in i) ? [a] : []], l = Qr(), u = [...Object.keys(l).filter((e) => l[e].group !== "item" && l[e].group !== "layout"), ...Object.keys($r())].filter((e) => !s.has(e) && !c.includes(e));
	return /* @__PURE__ */ R(we, { children: [c.map((e) => {
		let t = {
			...ei(e, l),
			status: e in i ? "own" : void 0,
			reset: () => {
				o(null), n(Object.fromEntries(Object.entries(i).filter(([t]) => t !== e)));
			}
		};
		return /* @__PURE__ */ L(N, {
			layout: String(t.label).length > 14 ? void 0 : "inline",
			className: String(t.label).length > 14 ? "py-1" : void 0,
			disabled: r,
			fields: [t],
			values: { [e]: i[e] ?? null },
			onChange: (t, r) => {
				e === a && o(null), n(r == null || r === "" ? Object.fromEntries(Object.entries(i).filter(([t]) => t !== e)) : {
					...i,
					[e]: r
				});
			}
		}, e);
	}), !r && u.length > 0 && /* @__PURE__ */ L("div", {
		className: "flex h-8 items-center",
		children: /* @__PURE__ */ L(ti, {
			properties: u,
			onPick: o,
			children: /* @__PURE__ */ R("button", {
				type: "button",
				className: "flex h-7 items-center gap-1.5 rounded-sm px-1.5 -ml-1.5 text-xs text-muted hover:bg-hover hover:text-ink",
				children: [/* @__PURE__ */ L(P, {
					name: "b-plus",
					size: 12
				}), S("Add a Property")]
			})
		})
	})] });
}
// admin/src/builder/design/Effects.tsx
var ii = [
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
], ai = [
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
];
function oi({ s: e }) {
	let t = [
		"opacity",
		"boxShadow",
		"filter",
		"backdropFilter",
		"mixBlendMode",
		"cursor",
		"pointerEvents",
		"clipPath"
	].some((t) => e.value(t));
	return /* @__PURE__ */ R(ni, {
		s: e,
		group: "effects",
		title: S("Effects"),
		empty: !t,
		children: [
			/* @__PURE__ */ L(Y, {
				s: e,
				fields: [{
					handle: "opacity",
					type: "text",
					component: "blocks-value",
					label: S("Opacity"),
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
					}
				}]
			}),
			/* @__PURE__ */ L(Y, {
				s: e,
				bare: !0,
				fields: [{
					handle: "boxShadow",
					type: "text",
					component: "blocks-shadows",
					label: S("Shadows"),
					group: "shadow"
				}]
			}),
			/* @__PURE__ */ L(Y, {
				s: e,
				bare: !0,
				fields: [{
					handle: "filter",
					type: "text",
					component: "blocks-filters",
					label: S("Filters")
				}]
			}),
			/* @__PURE__ */ L(Y, {
				s: e,
				bare: !0,
				fields: [{
					handle: "backdropFilter",
					type: "text",
					component: "blocks-filters",
					label: S("Backdrop"),
					instructions: S("Filters what is behind the element, like frosted glass")
				}]
			}),
			/* @__PURE__ */ L(Y, {
				s: e,
				fields: [
					{
						handle: "clipPath",
						type: "text",
						component: "blocks-clip",
						label: S("Clip Path"),
						className: "items-start py-0.5 [&>label]:leading-6"
					},
					{
						handle: "mixBlendMode",
						type: "select",
						size: "sm",
						label: S("Blending"),
						placeholder: S("Normal"),
						options: ii
					},
					{
						handle: "cursor",
						type: "select",
						size: "sm",
						label: S("Cursor"),
						placeholder: S("Auto"),
						options: ai
					},
					{
						handle: "pointerEvents",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: S("Clicks"),
						placeholder: "auto",
						options: [{
							value: "auto",
							label: S("On")
						}, {
							value: "none",
							label: S("Pass Through")
						}]
					}
				]
			})
		]
	});
}
// admin/src/builder/color.tsx
function si(e) {
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
function ci({ r: e, g: t, b: n, a: r }) {
	let i = (e) => Math.round(e).toString(16).padStart(2, "0");
	return r >= 1 ? `#${i(e)}${i(t)}${i(n)}` : `rgb(${Math.round(e)} ${Math.round(t)} ${Math.round(n)} / ${Math.round(r * 100)}%)`;
}
function li({ r: e, g: t, b: n }) {
	e /= 255, t /= 255, n /= 255;
	let r = Math.max(e, t, n), i = r - Math.min(e, t, n);
	return {
		h: ((i === 0 ? 0 : r === e ? (t - n) / i % 6 : r === t ? (n - e) / i + 2 : (e - t) / i + 4) * 60 + 360) % 360,
		s: r === 0 ? 0 : i / r,
		v: r
	};
}
function ui(e, t, n, r) {
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
function di(e) {
	return /^token:[a-z]+\.[a-z0-9-]+(\/\d{1,3})?$/.test(e) ? !0 : typeof CSS < "u" && CSS.supports("color", e);
}
function fi() {
	let { byPath: e } = Ne();
	return (t) => t ? t.replace(/token:([a-z]+\.[a-z0-9-]+)(?:\/(\d+))?/g, (t, n, r) => {
		let i = e.get(n), a = i ? String(i.value) : "transparent";
		return r ? `color-mix(in srgb, ${a} ${r}%, transparent)` : a;
	}) : "transparent";
}
function pi({ field: e, value: t, onChange: n }) {
	let [r, i] = A(!1), a = fi(), o = tr(), s = t ?? void 0, c = o(s);
	return /* @__PURE__ */ L(lr, { children: /* @__PURE__ */ L(fe, {
		open: r,
		onOpenChange: i,
		align: "end",
		className: "w-64 !p-0",
		trigger: /* @__PURE__ */ R("button", {
			type: "button",
			id: I(e),
			className: F(Yn, "flex items-center gap-1.5 pl-1 text-left"),
			children: [/* @__PURE__ */ L(Zn, {
				color: s === void 0 && typeof e.swatch == "string" ? e.swatch : a(s),
				className: "!size-4"
			}), c ? /* @__PURE__ */ L(ir, {
				token: c.token,
				alpha: c.alpha
			}) : /* @__PURE__ */ L("span", {
				className: F("truncate font-mono", !s && "font-sans text-faint"),
				children: s ?? e.placeholder ?? S("None")
			})]
		}),
		children: /* @__PURE__ */ L(mi, {
			label: e.label || S("Color"),
			value: s,
			onChange: n
		})
	}) });
}
function mi({ label: e, value: t, onChange: n }) {
	let { byGroup: r } = Ne(), i = r.get("color") ?? [], a = fi(), o = t?.startsWith("token:") ? t.slice(6).split("/")[0] : null, s = si(t?.startsWith("token:") ? a(t.split("/")[0]) : t) ?? {
		r: 0,
		g: 0,
		b: 0,
		a: 1
	}, [c, l] = A(() => ({
		...li(s),
		a: t?.includes("/") && t.startsWith("token:") ? Number(t.split("/")[1]) / 100 : s.a
	})), [u, d] = A(t ?? ""), f = gr(u, (e) => !e.trim() || di(e.trim())), [p, m] = A(() => i.length > 0 && (!t || t.startsWith("token:")) ? "tokens" : "custom"), h = k(null);
	O(() => d(t ?? ""), [t]);
	let g = (e, t, r, i) => {
		l({
			h: e,
			s: t,
			v: r,
			a: i
		}), n(ci(ui(e, t, r, i)));
	}, _ = (e, r) => {
		let i = e.currentTarget;
		i.setPointerCapture(e.pointerId);
		let a = (e) => {
			let a = i.getBoundingClientRect(), o = Math.max(0, Math.min(1, (e.clientX - a.left) / a.width)), s = Math.max(0, Math.min(1, (e.clientY - a.top) / a.height));
			r === "area" ? g(c.h, o, 1 - s, c.a) : r === "hue" ? g(o * 360, c.s, c.v, c.a) : t?.startsWith("token:") ? n(`${t.split("/")[0]}${o < .995 ? `/${Math.round(o * 100)}` : ""}`) : g(c.h, c.s, c.v, Math.round(o * 100) / 100);
		};
		a(e);
		let o = (e) => a(e), s = () => {
			i.removeEventListener("pointermove", o), i.removeEventListener("pointerup", s);
		};
		i.addEventListener("pointermove", o), i.addEventListener("pointerup", s);
	}, v = o ? t?.includes("/") ? Number(t.split("/")[1]) / 100 : 1 : c.a, y = o ? a(`token:${o}`) : ci({ ...ui(c.h, c.s, c.v, 1) }), b = /* @__PURE__ */ R("div", {
		onPointerDown: (e) => _(e, "alpha"),
		className: "relative h-2.5 cursor-ew-resize rounded-full [background:repeating-conic-gradient(#ddd_0_25%,#fff_0_50%)_0_0/8px_8px]",
		children: [/* @__PURE__ */ L("span", {
			className: "absolute inset-0 rounded-full",
			style: { background: `linear-gradient(to right, transparent, ${y})` }
		}), /* @__PURE__ */ L("span", {
			className: "pointer-events-none absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.3)]",
			style: { left: `${v * 100}%` }
		})]
	}), x = /* @__PURE__ */ L("button", {
		type: "button",
		onClick: () => n(null),
		className: "h-7 shrink-0 rounded-sm px-2 text-xs text-muted hover:bg-hover hover:text-ink",
		children: S("Clear")
	});
	return /* @__PURE__ */ R("div", { children: [/* @__PURE__ */ R("div", {
		className: "flex h-9 items-center gap-2 border-b border-border pl-2.5 pr-1.5",
		children: [/* @__PURE__ */ L("span", {
			className: "min-w-0 flex-1 truncate text-xs font-medium text-text",
			children: e
		}), i.length > 0 && /* @__PURE__ */ L(me, {
			size: "xs",
			value: p,
			onChange: m,
			options: [{
				value: "tokens",
				label: S("Tokens")
			}, {
				value: "custom",
				label: S("Custom")
			}]
		})]
	}), p === "tokens" ? /* @__PURE__ */ R("div", { children: [/* @__PURE__ */ L("div", {
		role: "listbox",
		"aria-label": S("Color Tokens"),
		className: "max-h-60 overflow-y-auto p-1",
		children: i.map((e) => /* @__PURE__ */ R("button", {
			type: "button",
			role: "option",
			"aria-selected": o === e.path,
			title: `${e.path} · ${String(e.value)}${e.dark ? ` / ${String(e.dark)}` : ""}`,
			onClick: () => n(`token:${e.path}`),
			className: F("flex h-7 w-full items-center gap-2 rounded-xs px-1.5 text-left text-xs hover:bg-hover", o === e.path && "bg-active"),
			children: [
				/* @__PURE__ */ L(Zn, {
					color: String(e.value),
					dark: e.dark ? String(e.dark) : void 0,
					className: "!size-4"
				}),
				/* @__PURE__ */ L("span", {
					className: "min-w-0 flex-1 truncate text-text",
					children: e.name
				}),
				/* @__PURE__ */ L("span", {
					className: "max-w-[45%] shrink-0 truncate font-mono text-2xs text-faint",
					children: String(e.value)
				}),
				o === e.path ? /* @__PURE__ */ L(P, {
					name: "b-check",
					size: 12,
					className: "shrink-0 text-focus"
				}) : /* @__PURE__ */ L("span", { className: "w-3 shrink-0" })
			]
		}, e.path))
	}), /* @__PURE__ */ R("div", {
		className: "flex items-center gap-2 border-t border-border px-2.5 py-2",
		children: [o ? /* @__PURE__ */ R(we, { children: [
			/* @__PURE__ */ L("span", {
				className: "shrink-0 text-xs text-muted",
				children: S("Opacity")
			}),
			/* @__PURE__ */ L("div", {
				className: "min-w-0 flex-1",
				children: b
			}),
			/* @__PURE__ */ R("span", {
				className: "w-8 shrink-0 text-right text-2xs tabular-nums text-muted",
				children: [Math.round(v * 100), "%"]
			})
		] }) : /* @__PURE__ */ L("span", { className: "flex-1" }), x]
	})] }) : /* @__PURE__ */ R("div", {
		className: "space-y-2 p-2.5",
		children: [
			/* @__PURE__ */ L("div", {
				ref: h,
				onPointerDown: (e) => _(e, "area"),
				className: "relative h-32 cursor-crosshair rounded-sm",
				style: { background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${c.h} 100% 50%))` },
				children: /* @__PURE__ */ L("span", {
					className: "pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.3)]",
					style: {
						left: `${c.s * 100}%`,
						top: `${(1 - c.v) * 100}%`
					}
				})
			}),
			/* @__PURE__ */ L("div", {
				onPointerDown: (e) => _(e, "hue"),
				className: "relative h-2.5 cursor-ew-resize rounded-full",
				style: { background: "linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)" },
				children: /* @__PURE__ */ L("span", {
					className: "pointer-events-none absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.3)]",
					style: { left: `${c.h / 360 * 100}%` }
				})
			}),
			b,
			/* @__PURE__ */ R("div", {
				className: "flex gap-1.5",
				children: [/* @__PURE__ */ L("input", {
					value: u,
					spellCheck: !1,
					"aria-label": S("Color Value"),
					"aria-invalid": f.shown || void 0,
					onChange: (e) => d(e.target.value),
					onBlur: () => {
						let e = u.trim();
						if (e && !di(e)) return d(t ?? "");
						e !== (t ?? "") && n(e || null);
					},
					onKeyDown: (e) => {
						e.key === "Escape" && d(t ?? ""), e.key === "Enter" && (u.trim() && !di(u.trim()) ? f.show() : e.target.blur());
					},
					className: F(Yn, "font-mono"),
					placeholder: "#000000"
				}), x]
			})
		]
	})] });
}
// admin/src/builder/fields/style.tsx
function hi(e) {
	let t = e?.match(/^(linear|radial)-gradient\((.*)\)$/);
	if (!t) return null;
	let n = Ir(t[2]), r = t[1] === "linear" ? "180deg" : "circle";
	n[0] && (/deg$|^to /.test(n[0]) || /^(circle|ellipse)/.test(n[0])) && (r = n.shift());
	let i = n.map((e) => {
		let t = Fr(e);
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
function gi(e) {
	return `${e.kind}-gradient(${[e.angle, ...e.stops.map((e) => `${e.color}${e.at ? ` ${e.at}` : ""}`)].join(", ")})`;
}
function _i({ value: e, onChange: t, context: n }) {
	let r = fi(), i = hi(e);
	if (!i) return null;
	let a = (e) => t(gi(e));
	return /* @__PURE__ */ R("div", {
		className: "min-w-0 flex-1 space-y-1 rounded-md bg-active/60 p-1.5",
		children: [
			/* @__PURE__ */ L("div", {
				className: "h-6 rounded-sm shadow-[inset_0_0_0_1px_rgb(0_0_0/0.1)]",
				style: { background: r(gi({
					...i,
					kind: "linear",
					angle: "90deg"
				})) }
			}),
			/* @__PURE__ */ L(J, {
				bare: !0,
				context: n,
				fields: [{
					handle: "shape",
					type: "group",
					component: "blocks-group",
					label: S("Shape"),
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
					}, {
						handle: "angle",
						type: "text",
						component: "blocks-value",
						label: S("Angle"),
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
			i.stops.map((e, t) => /* @__PURE__ */ R("div", {
				className: "flex items-center gap-1",
				children: [/* @__PURE__ */ L(J, {
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
							type: "text",
							component: "blocks-value",
							label: S("Position"),
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
				}), i.stops.length > 2 && /* @__PURE__ */ L(er, { onClick: () => a({
					...i,
					stops: i.stops.filter((e, n) => n !== t)
				}) })]
			}, t)),
			/* @__PURE__ */ R("button", {
				type: "button",
				onClick: () => a({
					...i,
					stops: [...i.stops, {
						color: "token:color.foreground",
						at: ""
					}]
				}),
				className: "flex h-7 w-full items-center justify-center gap-1.5 rounded-sm text-xs text-muted hover:bg-hover hover:text-ink",
				children: [
					/* @__PURE__ */ L(P, {
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
var vi = [
	"flex-start",
	"center",
	"flex-end"
], yi = () => [
	{
		value: "flex-start",
		label: S("Start")
	},
	{
		value: "center",
		label: S("Center")
	},
	{
		value: "flex-end",
		label: S("End")
	},
	{
		value: "space-between",
		label: S("Space Between")
	},
	{
		value: "space-around",
		label: S("Space Around")
	},
	{
		value: "space-evenly",
		label: S("Space Evenly")
	}
];
function bi({ field: e, value: t, onChange: n, context: r }) {
	let i = e.row === !0, a = t?.justifyContent ?? void 0, o = t?.alignItems ?? void 0;
	return /* @__PURE__ */ R(lr, { children: [/* @__PURE__ */ L("div", {
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
			let r = vi[i ? t : e], s = vi[i ? e : t], c = (a ?? "flex-start") === r && (o ?? "stretch").replace("stretch", "flex-start") === s;
			return /* @__PURE__ */ L("button", {
				type: "button",
				onClick: () => n({
					justifyContent: r,
					alignItems: s
				}),
				className: "grid place-items-center rounded-[2px] hover:bg-hover",
				title: `${r.replace("flex-", "")} · ${s.replace("flex-", "")}`,
				children: /* @__PURE__ */ L("span", { className: F("rounded-full", c ? "size-2 bg-ink" : "size-1 bg-faint") })
			}, `${t}${e}`);
		}))
	}), /* @__PURE__ */ L(J, {
		bare: !0,
		className: "min-w-0 flex-1",
		context: r,
		fields: [{
			handle: "justifyContent",
			type: "select",
			size: "sm",
			label: S("Distribute"),
			options: yi(),
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
					value: "flex-start",
					icon: i ? "b-align-top" : "b-align-left",
					title: S("Start")
				},
				{
					value: "center",
					icon: i ? "b-align-center-vertical" : "b-align-center-horizontal",
					title: S("Center")
				},
				{
					value: "flex-end",
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
var xi = [
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
], Si = {
	left: "0%",
	top: "0%",
	center: "50%",
	right: "100%",
	bottom: "100%"
};
function Ci(e) {
	let t = (e ?? "center").trim().split(/\s+/), n = (e) => e === "top" || e === "bottom";
	t.length === 1 && t.push("center");
	let [r, i] = n(t[0]) || t[1] && (t[1] === "left" || t[1] === "right") ? [t[1], t[0]] : t;
	return `${Si[r] ?? r} ${Si[i] ?? i}`;
}
function wi({ field: e, value: t, onChange: n, context: r, disabled: i }) {
	let a = Ci(t);
	return /* @__PURE__ */ R(lr, { children: [/* @__PURE__ */ L("div", {
		className: "grid size-[60px] shrink-0 grid-cols-3 gap-px rounded-sm bg-bg p-1",
		role: "radiogroup",
		"aria-label": e.label,
		children: xi.flat().map((t) => {
			let r = a === Ci(t);
			return /* @__PURE__ */ L("button", {
				type: "button",
				role: "radio",
				"aria-checked": r,
				disabled: i,
				onClick: () => n(t === "center" && !e.required ? null : t),
				className: "grid place-items-center rounded-[2px] hover:bg-hover",
				title: t,
				children: /* @__PURE__ */ L("span", { className: F("rounded-full", r ? "size-2 bg-ink" : "size-1 bg-faint") })
			}, t);
		})
	}), /* @__PURE__ */ L(cr, {
		field: {
			handle: `${e.handle}-value`,
			type: "text",
			component: "blocks-value",
			label: e.label,
			unit: "",
			placeholder: S("Center")
		},
		value: t ?? null,
		onChange: (e) => n(e || null),
		context: r,
		disabled: i
	})] });
}
// admin/src/builder/design/Fill.tsx
var Ti = {
	backgroundImage: null,
	backgroundSize: null,
	backgroundPosition: null,
	backgroundRepeat: null
};
function Ei({ s: e }) {
	let t = e.value("backgroundImage"), n = t ? hi(t) ? "gradient" : "image" : "none", r = t?.match(/^media:([0-9a-z]{26})$/i)?.[1], i = e.value("backgroundColor") || t;
	return /* @__PURE__ */ R(ni, {
		s: e,
		group: "fill",
		title: S("Fill"),
		empty: !i,
		children: [
			/* @__PURE__ */ L(Y, {
				s: e,
				fields: [{
					handle: "backgroundColor",
					type: "color",
					component: "blocks-color",
					label: S("Color")
				}, {
					handle: "kind",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: S("Image"),
					options: [
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
					],
					keys: ["backgroundImage"],
					reset: () => e.write(Ti),
					get: () => n,
					set: (t) => {
						t === "gradient" ? e.set("backgroundImage", "linear-gradient(180deg, token:color.primary, token:color.background)") : t === "image" ? e.write({
							backgroundImage: "none",
							backgroundSize: "cover",
							backgroundPosition: "center"
						}) : e.write(Ti);
					}
				}]
			}),
			n === "gradient" && /* @__PURE__ */ L(Y, {
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
			n === "image" && /* @__PURE__ */ L("div", {
				className: "rounded-md bg-active/60 p-1.5 text-xs",
				children: /* @__PURE__ */ L(N, {
					bare: !0,
					fields: [{
						handle: "bg",
						type: "media",
						label: S("Image"),
						max: 1,
						accept: "image/*"
					}],
					values: { bg: r ? [r] : [] },
					onChange: (t, n) => e.set("backgroundImage", n?.[0] ? `media:${n[0]}` : "none")
				})
			}),
			/* @__PURE__ */ L(Y, {
				s: e,
				fields: [
					n === "image" && {
						handle: "backgroundSize",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: S("Size"),
						options: [
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
						]
					},
					n === "image" && {
						handle: "backgroundPosition",
						type: "json",
						component: "blocks-origin",
						label: S("Position"),
						className: "items-start py-0.5 [&>label]:leading-6"
					},
					n === "image" && {
						handle: "backgroundRepeat",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: S("Repeat"),
						placeholder: "repeat",
						options: [
							{
								value: "no-repeat",
								label: S("Once")
							},
							{
								value: "repeat",
								label: S("Tile")
							},
							{
								value: "repeat-x",
								icon: "b-arrows-out-line-horizontal",
								title: S("Tile Across")
							},
							{
								value: "repeat-y",
								icon: "b-arrows-out-line-vertical",
								title: S("Tile Down")
							}
						]
					},
					n === "image" && {
						handle: "backgroundAttachment",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: S("Scrolling"),
						options: [{
							value: "scroll",
							label: S("With Page")
						}, {
							value: "fixed",
							label: S("Fixed")
						}],
						get: () => e.value("backgroundAttachment") ?? "scroll",
						set: (t) => e.set("backgroundAttachment", t === "fixed" ? "fixed" : null)
					},
					n !== "none" && {
						handle: "backgroundClip",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: S("Clip"),
						options: [{
							value: "border-box",
							label: S("Box")
						}, {
							value: "text",
							label: S("Text")
						}],
						get: () => e.value("backgroundClip") ?? "border-box",
						set: (t) => e.write({
							backgroundClip: t === "text" ? "text" : null,
							color: t === "text" ? "transparent" : null
						})
					}
				]
			}),
			t && n === "image" && !r && t !== "none" && /* @__PURE__ */ L("p", {
				className: F("cms-input h-7 w-full min-w-0 rounded-sm px-2 text-sm placeholder:text-ghost", "h-auto py-1 font-mono"),
				children: t
			})
		]
	});
}
// admin/src/builder/design/Layout.tsx
var Di = () => [
	{
		value: "block",
		icon: "b-square",
		title: S("Block")
	},
	{
		value: "flex",
		icon: "b-rows",
		title: S("Stack (flex)")
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
];
function Oi({ s: e }) {
	let t = e.value("display"), n = t === "flex" || t === "inline-flex", r = t === "grid" || t === "inline-grid", i = n && (e.value("flexDirection") ?? "row").startsWith("row");
	return /* @__PURE__ */ L(ni, {
		s: e,
		group: "layout",
		title: S("Layout"),
		empty: !t,
		children: /* @__PURE__ */ L(Y, {
			s: e,
			fields: [
				{
					handle: "display",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: S("Display"),
					options: Di()
				},
				n && {
					handle: "flexDirection",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: S("Direction"),
					get: () => e.value("flexDirection") ?? "row",
					options: [
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
					]
				},
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
				n && {
					handle: "gap",
					type: "text",
					component: "blocks-value",
					label: S("Gap"),
					group: "space",
					prefixIcon: i ? "b-split-horizontal" : "b-split-vertical",
					placeholder: "0",
					min: 0
				},
				n && {
					handle: "flexWrap",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: S("Wrap"),
					options: [{
						value: "nowrap",
						label: S("One Line")
					}, {
						value: "wrap",
						label: S("Wrap")
					}],
					get: () => e.value("flexWrap") ?? "nowrap",
					set: (t) => e.set("flexWrap", t === "wrap" ? "wrap" : null)
				},
				r && {
					handle: "gridTemplateColumns",
					type: "text",
					component: "blocks-value",
					label: S("Columns"),
					placeholder: S("3 or 1fr 2fr"),
					unit: "",
					min: 1,
					title: S("A number of equal columns, or any grid template (1fr 2fr, repeat(auto-fill, minmax(16rem, 1fr)))")
				},
				r && {
					handle: "gridTemplateRows",
					type: "text",
					component: "blocks-value",
					label: S("Rows"),
					placeholder: "auto",
					unit: ""
				},
				r && {
					handle: "gaps",
					type: "group",
					component: "blocks-group",
					label: S("Gap"),
					keys: [
						"gap",
						"rowGap",
						"columnGap"
					],
					get: () => ({
						columnGap: e.value("columnGap") ?? e.value("gap"),
						rowGap: e.value("rowGap") ?? e.value("gap")
					}),
					set: (t) => e.write({
						gap: null,
						columnGap: t.columnGap ?? null,
						rowGap: t.rowGap ?? null
					}),
					fields: [{
						handle: "columnGap",
						type: "text",
						component: "blocks-value",
						label: S("Columns"),
						group: "space",
						prefixIcon: "b-split-horizontal",
						placeholder: "0",
						min: 0
					}, {
						handle: "rowGap",
						type: "text",
						component: "blocks-value",
						label: S("Rows"),
						group: "space",
						prefixIcon: "b-split-vertical",
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
					label: S("Align"),
					keys: ["alignItems", "justifyItems"],
					get: () => e.value("alignItems"),
					options: [
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
					]
				},
				r && {
					handle: "gridAutoFlow",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: S("Flow"),
					options: [
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
							title: S("Fill Gaps (Dense)")
						}
					]
				}
			]
		})
	});
}
function ki({ s: e, parentDisplay: t }) {
	if (!t || !/flex|grid/.test(t)) return null;
	let n = t.includes("grid");
	return /* @__PURE__ */ L(ni, {
		s: e,
		group: "item",
		title: S(n ? "Grid Item" : "Stack Item"),
		open: !1,
		empty: !e.value("alignSelf") && !e.value("flex") && !e.value("gridColumn"),
		children: /* @__PURE__ */ L(Y, {
			s: e,
			fields: [
				n && {
					handle: "gridColumn",
					type: "text",
					component: "blocks-value",
					label: S("Column"),
					placeholder: "auto",
					unit: "",
					title: S("Span a number of columns (2), or a range (1 / -1 for full width)")
				},
				n && {
					handle: "gridRow",
					type: "text",
					component: "blocks-value",
					label: S("Row"),
					placeholder: "auto",
					unit: ""
				},
				!n && {
					handle: "flex",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: S("Grow"),
					options: [
						{
							value: "1 1 0%",
							label: S("Fill")
						},
						{
							value: "0 0 auto",
							label: S("Fixed")
						},
						{
							value: "0 1 auto",
							label: S("Shrink")
						}
					]
				},
				{
					handle: "alignSelf",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: S("Align Self"),
					options: [
						{
							value: "flex-start",
							icon: "b-align-top",
							title: S("Start")
						},
						{
							value: "center",
							icon: "b-align-center-vertical",
							title: S("Center")
						},
						{
							value: "flex-end",
							icon: "b-align-bottom",
							title: S("End")
						},
						{
							value: "stretch",
							icon: "b-arrows-out-line-vertical",
							title: S("Stretch")
						}
					]
				},
				{
					handle: "order",
					type: "text",
					component: "blocks-value",
					label: S("Display Order"),
					unit: "",
					placeholder: "0",
					prefixIcon: "b-list-numbers"
				}
			]
		})
	});
}
// admin/src/builder/design/Position.tsx
function Ai({ s: e }) {
	let t = e.value("position"), n = !!t && t !== "static";
	return /* @__PURE__ */ L(ni, {
		s: e,
		group: "position",
		title: S("Position"),
		open: !!t,
		empty: !t,
		children: /* @__PURE__ */ L(Y, {
			s: e,
			fields: [
				{
					handle: "position",
					type: "select",
					size: "sm",
					label: S("Type"),
					placeholder: S("Static"),
					options: [
						{
							value: "static",
							label: S("Static")
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
					],
					instructions: t === "absolute" ? S("Placed inside the nearest positioned parent") : t === "fixed" ? S("Stays in the window while the page scrolls") : t === "sticky" ? S("Sticks once its parent scrolls past the offset") : void 0
				},
				n && {
					handle: "offsets",
					type: "group",
					component: "blocks-group",
					label: S("Offsets"),
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
							top: S("Top"),
							right: S("Right"),
							bottom: S("Bottom"),
							left: S("Left")
						}[e],
						title: {
							top: S("Top"),
							right: S("Right"),
							bottom: S("Bottom"),
							left: S("Left")
						}[e],
						prefix: e[0].toUpperCase(),
						placeholder: "auto",
						group: "space",
						keywords: ["auto"]
					}))
				},
				n && {
					handle: "zIndex",
					type: "text",
					component: "blocks-value",
					label: S("Z-index"),
					unit: "",
					placeholder: "auto",
					prefixIcon: "b-stack"
				},
				{
					handle: "isolation",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: S("Isolation"),
					placeholder: "auto",
					options: [{
						value: "auto",
						label: S("Auto")
					}, {
						value: "isolate",
						label: S("Isolate")
					}],
					instructions: S("A new stacking context: keeps blend modes and z-index inside")
				}
			]
		})
	});
}
// admin/src/builder/design/Size.tsx
function ji(e, t, n) {
	let r = e.value(t), i = r === "100%" ? "fill" : r === "fit-content" ? "fit" : r === "auto" || !r ? "auto" : r.endsWith("vh") || r.endsWith("vw") || r.endsWith("dvh") ? "viewport" : "fixed", a = {
		fill: S("Fill"),
		fit: S("Fit"),
		auto: S("Auto"),
		viewport: S("Window"),
		fixed: S("Fixed")
	};
	return {
		handle: t,
		type: "text",
		component: "blocks-value",
		label: n,
		prefix: t === "width" ? "W" : "H",
		placeholder: S("Auto"),
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
					label: S("Fill the Parent (100%)"),
					value: "100%",
					checked: i === "fill"
				},
				{
					label: S("Fit the Content"),
					value: "fit-content",
					checked: i === "fit"
				},
				{
					label: S("Auto"),
					value: null,
					checked: i === "auto"
				},
				{
					label: S(t === "width" ? "Window Width (100vw)" : "Window Height (100dvh)"),
					value: t === "width" ? "100vw" : "100dvh",
					checked: i === "viewport"
				}
			]
		}
	};
}
function Mi({ s: e, media: t }) {
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
	return /* @__PURE__ */ L(ni, {
		s: e,
		group: "size",
		title: S("Size"),
		empty: !n,
		children: /* @__PURE__ */ L(Y, {
			s: e,
			fields: [
				ji(e, "width", S("Width")),
				ji(e, "height", S("Height")),
				{
					handle: "limits",
					type: "group",
					component: "blocks-group",
					label: S("Min · Max"),
					columns: 2,
					fields: [
						{
							handle: "minWidth",
							type: "text",
							component: "blocks-value",
							label: S("Min Width"),
							prefix: "W",
							placeholder: S("Min"),
							title: S("Minimum Width"),
							min: 0
						},
						{
							handle: "maxWidth",
							type: "text",
							component: "blocks-value",
							label: S("Max Width"),
							prefix: "W",
							placeholder: S("Max"),
							group: "container",
							title: S("Maximum Width"),
							min: 0,
							keywords: ["none"]
						},
						{
							handle: "minHeight",
							type: "text",
							component: "blocks-value",
							label: S("Min Height"),
							prefix: "H",
							placeholder: S("Min"),
							title: S("Minimum Height"),
							min: 0
						},
						{
							handle: "maxHeight",
							type: "text",
							component: "blocks-value",
							label: S("Max Height"),
							prefix: "H",
							placeholder: S("Max"),
							title: S("Maximum Height"),
							min: 0,
							keywords: ["none"]
						}
					]
				},
				{
					handle: "aspectRatio",
					type: "select",
					size: "sm",
					label: S("Aspect"),
					placeholder: S("Auto"),
					options: [
						{
							value: "1/1",
							label: S("1:1 square")
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
							label: S("3:4 portrait")
						},
						{
							value: "4/5",
							label: "4:5"
						},
						{
							value: "9/16",
							label: S("9:16 story")
						}
					]
				},
				{
					handle: "overflow",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: S("Overflow"),
					placeholder: "visible",
					options: [
						{
							value: "visible",
							icon: "b-eye",
							title: S("Visible")
						},
						{
							value: "hidden",
							icon: "b-eye-slash",
							title: S("Hidden")
						},
						{
							value: "auto",
							icon: "b-mouse-scroll",
							title: S("Scroll When Needed")
						},
						{
							value: "clip",
							icon: "b-scissors",
							title: S("Clip, without scrolling")
						}
					]
				},
				t && {
					handle: "objectFit",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: S("Fit"),
					options: [
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
						},
						{
							value: "none",
							label: S("None")
						}
					]
				},
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
var Ni = [
	"Top",
	"Right",
	"Bottom",
	"Left"
];
function Pi(e, t, n) {
	return [
		`${t}${Ni[n]}`,
		n % 2 == 0 ? `${t}Block` : `${t}Inline`,
		t
	].find((t) => e.value(t) !== void 0) ?? null;
}
function Fi(e, t, n) {
	let r = Pi(e, t, n);
	if (!r) return;
	let i = e.value(r);
	if (r === t) return Lr(i)?.[n];
	if (r.endsWith("Block") || r.endsWith("Inline")) {
		let [e, t] = Fr(String(i));
		return n === 0 || n === 3 ? e : t ?? e;
	}
	return i;
}
var Ii = (e) => [
	e,
	`${e}Block`,
	`${e}Inline`,
	...Ni.map((t) => `${e}${t}`)
];
function Li({ s: e }) {
	let t = ["margin", "padding"], n = t.some((t) => Ni.some((n, r) => Fi(e, t, r))), r = Object.fromEntries(t.map((t) => [t, [
		0,
		1,
		2,
		3
	].map((n) => Fi(e, t, n))])), i = Object.fromEntries(t.map((t) => [t, [
		0,
		1,
		2,
		3
	].map((n) => {
		let r = Pi(e, t, n);
		return r ? e.status(r) === "own" ? "own" : "inherited" : "none";
	})])), a = (t, n) => {
		let r = {
			[t]: null,
			[`${t}Block`]: null,
			[`${t}Inline`]: null
		}, i = n.every((e) => e !== void 0 && e === n[0]);
		i && (r[t] = n[0]), Ni.forEach((e, a) => r[`${t}${e}`] = i ? null : n[a] ?? null), e.write(r);
	};
	return /* @__PURE__ */ L(Hn, {
		title: S("Spacing"),
		empty: !n,
		children: /* @__PURE__ */ L(Y, {
			s: e,
			bare: !0,
			fields: [{
				handle: "spacing",
				type: "json",
				component: "blocks-spacing",
				className: "items-start",
				label: S("Spacing"),
				sideStatus: i,
				keys: [...Ii("margin"), ...Ii("padding")],
				get: () => r,
				set: (e) => t.forEach((t) => e[t] !== r[t] && a(t, e[t]))
			}]
		})
	});
}
// admin/src/builder/design/StateBar.tsx
var Ri = () => [
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
], zi = () => [
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
function Bi({ node: t }) {
	let { store: n } = z(), r = B(n, (e) => e.state), i = B(n, (e) => e.breakpoint), a = B(n, (n) => e(n.nodes, t.id)), o = /* @__PURE__ */ new Set([
		...Object.keys(t.logic?.states ?? {}).map((e) => `is-${e}`),
		...Object.keys(t.bind ?? {}).filter((e) => e.startsWith("state:")).map((e) => `is-${e.slice(6)}`),
		...t.logic?.behaviors?.scroll ? ["is-scrolled", ...t.logic.behaviors.scroll.hide ? ["is-hidden"] : []] : [],
		...Object.keys(t.style ?? {}).map((e) => e.split(":").pop()).filter((e) => e.startsWith("is-") || e.startsWith("in-"))
	]), s = /* @__PURE__ */ new Set();
	for (let e of a) Object.keys(e.logic?.states ?? {}).forEach((e) => s.add(`in-${e}`)), e.logic?.behaviors?.scroll && s.add("in-scrolled");
	let c = [...o, ...s].filter((e, t, n) => n.indexOf(e) === t), l = (e) => e.startsWith("is-") ? e.slice(3) : e.startsWith("in-") ? S("in {state}", { state: e.slice(3) }) : [...Ri(), ...zi()].find((t) => t.value === e)?.label ?? e, u = (e) => n.setStyleState(e), d = (e) => Object.keys(t.style ?? {}).some((t) => t === e || t.endsWith(`:${e}`)), f = async () => {
		let e = await be({
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
		...Ri(),
		...c.map((e) => ({
			value: e,
			label: l(e)
		})),
		...r && !Ri().some((e) => e.value === r) && !c.includes(r) ? [{
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
					className: F("relative flex h-6 flex-[1_0_auto] items-center justify-center gap-1 whitespace-nowrap rounded-[6px] px-1.5 text-xs font-medium transition-colors duration-120", r === e.value ? "bg-float text-ink shadow-raise dark:bg-[color-mix(in_srgb,var(--cms-float),var(--cms-ink)_12%)]" : "text-muted hover:text-text"),
					children: [/* @__PURE__ */ L("span", { children: e.label }), e.value && d(e.value) && r !== e.value && /* @__PURE__ */ L("span", {
						className: "size-1 shrink-0 rounded-full bg-current opacity-70",
						"aria-hidden": !0
					})]
				}, e.value || "default"))
			}), /* @__PURE__ */ L(de, {
				align: "end",
				trigger: /* @__PURE__ */ L("button", {
					type: "button",
					className: "grid size-7 shrink-0 place-items-center rounded-sm text-muted hover:bg-hover hover:text-ink",
					"aria-label": S("More States"),
					title: S("More States"),
					children: /* @__PURE__ */ L(P, {
						name: "b-plus",
						size: 14
					})
				}),
				items: [
					...zi().map((e) => ({
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
				/* @__PURE__ */ L(P, {
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
var Vi = (e, t) => e?.match(RegExp(`${t}\\(([^)]*)\\)`))?.[1];
function Hi({ s: e }) {
	let t = Fr(e.value("translate") ?? ""), n = e.value("transform"), r = [
		"translate",
		"rotate",
		"scale",
		"transform",
		"transformOrigin",
		"perspective"
	].some((t) => e.value(t)), i = {
		x: t[0],
		y: t[1]
	}, a = {
		X: Vi(n, "skewX"),
		Y: Vi(n, "skewY")
	}, o = (n, r) => {
		let i = [t[0] ?? "0", t[1] ?? "0"];
		i[n] = r ?? "0", e.set("translate", i.every((e) => e === "0" || e === "0px") ? null : i.join(" "));
	}, s = (t, r) => {
		let i = Fr(n ?? "").filter((e) => !e.startsWith(`skew${t}(`));
		r && i.push(`skew${t}(${/^-?[\d.]+$/.test(r) ? `${r}deg` : r})`), e.set("transform", i.join(" ") || null);
	}, c = (e) => [{
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
	return /* @__PURE__ */ L(ni, {
		s: e,
		group: "transform",
		title: S("Transform"),
		open: !!r,
		empty: !r,
		children: /* @__PURE__ */ L(Y, {
			s: e,
			fields: [
				{
					handle: "move",
					type: "group",
					component: "blocks-group",
					label: S("Move"),
					keys: ["translate"],
					fields: c("px"),
					get: () => i,
					set: (e) => Object.entries(zr(i, e)).forEach(([e, t]) => o(e === "x" ? 0 : 1, t ?? null))
				},
				{
					handle: "rotate",
					type: "text",
					component: "blocks-value",
					label: S("Rotate"),
					unit: "deg",
					prefixIcon: "b-arrow-clockwise",
					placeholder: "0"
				},
				{
					handle: "scale",
					type: "text",
					component: "blocks-value",
					label: S("Scale"),
					unit: "",
					step: .01,
					prefixIcon: "b-arrows-out-simple",
					placeholder: "1"
				},
				{
					handle: "skew",
					type: "group",
					component: "blocks-group",
					label: S("Skew"),
					keys: ["transform"],
					fields: c("deg").map((e) => ({
						...e,
						handle: e.handle.toUpperCase()
					})),
					get: () => a,
					set: (e) => Object.entries(zr(a, e)).forEach(([e, t]) => s(e, t ?? null))
				},
				{
					handle: "transformOrigin",
					type: "json",
					component: "blocks-origin",
					label: S("Origin"),
					className: "items-start py-0.5 [&>label]:leading-6"
				},
				{
					handle: "perspective",
					type: "text",
					component: "blocks-value",
					label: S("Perspective"),
					prefixIcon: "b-perspective",
					placeholder: "none",
					keywords: ["none"],
					instructions: S("Depth for children rotated in 3D")
				}
			]
		})
	});
}
// admin/src/builder/design/Transition.tsx
var Ui = () => [
	{
		value: "all",
		label: S("Everything")
	},
	{
		value: "color, background-color, border-color, text-decoration-color, fill, stroke",
		label: S("Colors")
	},
	{
		value: "transform, translate, rotate, scale",
		label: S("Transform")
	},
	{
		value: "opacity",
		label: S("Opacity")
	},
	{
		value: "opacity, transform, translate, scale",
		label: S("Opacity and Transform")
	},
	{
		value: "box-shadow",
		label: S("Shadow")
	}
];
function Wi(e) {
	if (!e) return null;
	let t = Fr(e.replace(/,\s*(?![^(]*\))/g, ", ")), n = t.filter((e) => /^[\d.]+m?s$/.test(e) || e.startsWith("token:duration")), r = t.find((e) => /^(ease|linear|cubic-bezier|steps|token:ease)/.test(e));
	return {
		property: e.split(/\s+\d/)[0].replace(/\s+(ease|linear|cubic-bezier).*$/, "").trim() || "all",
		duration: n[0] ?? "200ms",
		ease: r ?? "ease",
		delay: n[1]
	};
}
function Gi({ s: e }) {
	let { byGroup: t } = Ne(), n = Wi(e.value("transition")), r = (t) => {
		let r = {
			property: "all",
			duration: "200ms",
			ease: "cubic-bezier(0.2, 0.8, 0.2, 1)",
			...n,
			...t
		}, i = r.property.split(",").map((e) => e.trim());
		e.set("transition", i.map((e) => `${e} ${r.duration} ${r.ease}${r.delay ? ` ${r.delay}` : ""}`).join(", "));
	};
	return /* @__PURE__ */ L(ni, {
		s: e,
		group: "transition",
		title: S("Transition"),
		open: !!n,
		empty: !n,
		children: n ? /* @__PURE__ */ L(Y, {
			s: e,
			fields: [
				{
					handle: "property",
					type: "select",
					size: "sm",
					label: S("Animate"),
					placeholder: S("Everything"),
					options: Ui(),
					keys: ["transition"],
					get: () => Ui().find((e) => e.value.split(",")[0].trim() === n.property.split(",")[0].trim())?.value,
					set: (e) => r({ property: e ?? "all" })
				},
				{
					handle: "timing",
					type: "group",
					component: "blocks-group",
					label: S("Duration"),
					keys: ["transition"],
					get: () => ({
						duration: n.duration,
						delay: n.delay
					}),
					set: (e) => r(e.duration === n.duration ? { delay: e.delay ?? void 0 } : { duration: e.duration ?? "200ms" }),
					fields: [{
						handle: "duration",
						type: "text",
						component: "blocks-value",
						label: S("Duration"),
						unit: "ms",
						step: 10,
						min: 0,
						group: "duration",
						prefixIcon: "b-timer"
					}, {
						handle: "delay",
						type: "text",
						component: "blocks-value",
						label: S("Delay"),
						unit: "ms",
						step: 10,
						min: 0,
						prefixIcon: "b-pause",
						placeholder: S("Delay")
					}]
				},
				{
					handle: "ease",
					type: "text",
					component: "ease",
					label: S("Curve"),
					keys: ["transition"],
					get: () => n.ease,
					set: (e) => r({ ease: e ?? "ease" }),
					options: [
						...(t.get("ease") ?? []).map((e) => ({
							value: `token:${e.path}`,
							label: e.name,
							curve: String(e.value)
						})),
						{
							value: "ease",
							label: S("Ease")
						},
						{
							value: "ease-in-out",
							label: S("Ease In-Out")
						},
						{
							value: "linear",
							label: S("Linear")
						},
						{
							value: "cubic-bezier(0.2, 0.8, 0.2, 1)",
							label: S("Smooth Out")
						},
						{
							value: "cubic-bezier(0.65, 0, 0.35, 1)",
							label: S("Smooth In-Out")
						},
						{
							value: "cubic-bezier(0.34, 1.56, 0.64, 1)",
							label: S("Overshoot")
						}
					]
				}
			]
		}) : /* @__PURE__ */ R("button", {
			type: "button",
			onClick: () => r({}),
			className: "flex h-7 w-full items-center justify-center gap-1.5 rounded-sm text-xs text-muted hover:bg-hover hover:text-ink",
			children: [/* @__PURE__ */ L(P, {
				name: "b-plus",
				size: 14
			}), S("Animate State Changes")]
		})
	});
}
// admin/src/builder/design/Typography.tsx
var Ki = () => [
	{
		value: "100",
		label: S("Thin 100")
	},
	{
		value: "200",
		label: S("Extra Light 200")
	},
	{
		value: "300",
		label: S("Light 300")
	},
	{
		value: "400",
		label: S("Regular 400")
	},
	{
		value: "500",
		label: S("Medium 500")
	},
	{
		value: "600",
		label: S("Semibold 600")
	},
	{
		value: "700",
		label: S("Bold 700")
	},
	{
		value: "800",
		label: S("Extra Bold 800")
	},
	{
		value: "900",
		label: S("Black 900")
	}
];
function qi({ s: e, prose: t }) {
	let { byGroup: n } = Ne(), r = n.get("font") ?? [], i = n.get("weight") ?? [], a = [
		"fontFamily",
		"fontSize",
		"fontWeight",
		"lineHeight",
		"letterSpacing",
		"color",
		"textAlign",
		"textTransform",
		"textDecoration",
		"fontStyle",
		"textWrap",
		"lineClamp",
		"textShadow",
		"textStroke"
	].some((t) => e.value(t)), o = Fr(e.value("textStroke") ?? ""), s = {
		width: o.find((e) => /^-?[\d.]/.test(e)),
		color: o.find((e) => !/^-?[\d.]/.test(e))
	};
	return /* @__PURE__ */ R(ni, {
		s: e,
		group: "typography",
		title: S("Typography"),
		empty: !a && !t?.on,
		children: [
			t && /* @__PURE__ */ L(J, {
				fields: [{
					handle: "prose",
					type: "toggle",
					label: S("Prose")
				}],
				values: { prose: t.on },
				onChange: (e, n) => t.onChange(!!n)
			}),
			/* @__PURE__ */ L(Y, {
				s: e,
				fields: [
					{
						handle: "fontFamily",
						type: "select",
						size: "sm",
						label: S("Font"),
						placeholder: S("Inherit"),
						options: r.map((e) => ({
							value: `token:${e.path}`,
							label: `${e.path} · ${Array.isArray(e.value) ? e.value[0] : e.value}`
						}))
					},
					{
						handle: "fontWeight",
						type: "select",
						size: "sm",
						label: S("Weight"),
						placeholder: S("Inherit"),
						options: [...i.map((e) => ({
							value: `token:${e.path}`,
							label: `${e.path} · ${e.value}`
						})), ...Ki()]
					},
					{
						handle: "fontSize",
						type: "text",
						component: "blocks-value",
						label: S("Size"),
						group: "text",
						prefixIcon: "b-text-aa",
						placeholder: S("Inherit"),
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
						label: S("Line Height"),
						group: "leading",
						prefixIcon: "b-arrows-vertical",
						unit: "",
						step: .05,
						placeholder: S("Inherit"),
						title: S("Line Height (1.2 = 120%)")
					},
					{
						handle: "letterSpacing",
						type: "text",
						component: "blocks-value",
						label: S("Letter Spacing"),
						group: "tracking",
						prefixIcon: "b-arrows-out-line-horizontal",
						unit: "em",
						units: ["em", "px"],
						step: .005,
						placeholder: "0"
					},
					{
						handle: "color",
						type: "color",
						component: "blocks-color",
						label: S("Color"),
						placeholder: S("Inherit")
					},
					{
						handle: "textAlign",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: S("Align"),
						placeholder: "left",
						options: [
							{
								value: "left",
								icon: "b-text-align-left",
								title: S("Left")
							},
							{
								value: "center",
								icon: "b-text-align-center",
								title: S("Center")
							},
							{
								value: "right",
								icon: "b-text-align-right",
								title: S("Right")
							},
							{
								value: "justify",
								icon: "b-text-align-justify",
								title: S("Justify")
							}
						]
					},
					{
						handle: "fontStyle",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: S("Style"),
						placeholder: "normal",
						options: [{
							value: "normal",
							icon: "b-text-t",
							title: S("Upright")
						}, {
							value: "italic",
							icon: "b-text-italic",
							title: S("Italic")
						}]
					},
					{
						handle: "textDecoration",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: S("Decoration"),
						placeholder: "none",
						options: [
							{
								value: "none",
								icon: "b-x",
								title: S("No Decoration")
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
						]
					},
					{
						handle: "textTransform",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: S("Case"),
						placeholder: "none",
						options: [
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
						]
					},
					{
						handle: "textWrap",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: S("Wrap"),
						options: [
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
						]
					},
					{
						handle: "lineClamp",
						type: "text",
						component: "blocks-value",
						label: S("Max Lines"),
						unit: "",
						min: 1,
						placeholder: S("All"),
						prefixIcon: "b-list-dashes"
					}
				]
			}),
			/* @__PURE__ */ L(Y, {
				s: e,
				bare: !0,
				fields: [{
					handle: "textShadow",
					type: "text",
					component: "blocks-shadows",
					kind: "text",
					label: S("Text Shadow")
				}]
			}),
			/* @__PURE__ */ L(Y, {
				s: e,
				fields: [{
					handle: "stroke",
					type: "group",
					component: "blocks-group",
					label: S("Text Stroke"),
					keys: ["textStroke"],
					instructions: S("Outlined text (set the color to transparent)"),
					get: () => s,
					set: (t) => {
						let n = {
							...s,
							...zr(s, t)
						};
						e.set("textStroke", n.width ? `${n.width} ${n.color ?? "currentColor"}` : null);
					},
					fields: [{
						handle: "width",
						type: "text",
						component: "blocks-value",
						label: S("Width"),
						prefixIcon: "b-pencil-simple",
						placeholder: "0",
						min: 0,
						step: .5,
						className: "!flex-none w-[72px]"
					}, {
						handle: "color",
						type: "color",
						component: "blocks-color",
						label: S("Color"),
						placeholder: S("Text Color")
					}]
				}]
			})
		]
	});
}
// admin/src/builder/design/DesignPanel.tsx
function Ji({ node: e }) {
	let { types: t, store: n } = z(), r = t.get(e.type), i = Pr(e), a = B(n, (t) => c(t.nodes, e.id)), o = a ? a.style?.base?.display ?? (a.type === "stack" || a.type === "columns" || a.type === "grid" ? "flex" : void 0) : void 0, s = new Set(r?.styles?.length ? r.styles : [
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
	]), l = e.type === "outlet" && !e.props?.wrap, u = l ? new Set([...s].filter((e) => e === "typography")) : s, d = !!r?.children || e.type === "repeat", f = !l && !!o && /flex|grid/.test(o);
	return e.type === "pattern" ? /* @__PURE__ */ L("p", {
		className: "m-0 p-4 text-xs text-muted",
		children: S("Edit the component to change its shared design.")
	}) : /* @__PURE__ */ R("div", { children: [
		/* @__PURE__ */ L(Bi, { node: e }),
		u.has("layout") && d && /* @__PURE__ */ L(Oi, { s: i }),
		f && /* @__PURE__ */ L(ki, {
			s: i,
			parentDisplay: o
		}),
		u.has("position") && /* @__PURE__ */ L(Ai, { s: i }),
		u.has("size") && /* @__PURE__ */ L(Mi, {
			s: i,
			media: [
				"image",
				"video",
				"embed"
			].includes(e.type)
		}),
		u.has("spacing") && /* @__PURE__ */ L(Li, { s: i }),
		u.has("typography") && /* @__PURE__ */ L(qi, {
			s: i,
			prose: r?.fields?.some((e) => e.handle === "prose") ? {
				on: !!e.props?.prose,
				onChange: (t) => n.updateProps(e.id, { prose: t || void 0 }, `inspector:${e.id}:prose`)
			} : void 0
		}),
		u.has("fill") && /* @__PURE__ */ L(Ei, { s: i }),
		u.has("border") && /* @__PURE__ */ L(Jr, { s: i }),
		u.has("effects") && /* @__PURE__ */ L(oi, { s: i }),
		u.has("transform") && /* @__PURE__ */ L(Hi, { s: i }),
		u.has("transition") && /* @__PURE__ */ L(Gi, { s: i })
	] });
}
// admin/src/builder/logic/LogicPanel.tsx
var Yi = () => [
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
], Xi = () => [
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
], Zi = () => [
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
function Qi(t) {
	let { store: n } = z(), r = B(n, (n) => e(n.nodes, t.id));
	return [...new Set([...r, t].flatMap((e) => Object.keys(e.logic?.data ?? {})))];
}
function $i(e) {
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
var ea = (e) => typeof e == "string" ? `'${e}'` : JSON.stringify(e), ta = (e, t, n = {}) => ({
	handle: e,
	type: "text",
	size: "sm",
	commit: "blur",
	label: t,
	mono: !0,
	max: 1e4,
	list: na,
	placeholder: "open, count > 3, tab === 'a'",
	...n
}), na = "cms-logic-variables", ra = (e, ...t) => e ? t : [], ia = [
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
function aa({ node: e }) {
	let { store: t, types: n } = z(), r = e.logic ?? {}, i = Qi(e), a = (n) => {
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
	return /* @__PURE__ */ R(we, { children: [
		/* @__PURE__ */ L("datalist", {
			id: na,
			children: [...i, ...i.map((e) => `!${e}`)].map((e) => /* @__PURE__ */ L("option", { value: e }, e))
		}),
		/* @__PURE__ */ L(Hn, {
			title: S("State"),
			empty: !r.data,
			open: !!r.data,
			actions: /* @__PURE__ */ L($n, {
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
			children: /* @__PURE__ */ L(J, {
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
				values: { data: Object.fromEntries(Object.entries(o).map(([e, t]) => [e, ea(t)])) },
				onChange: (e, t) => a({ data: Object.fromEntries(Object.entries(t).map(([e, t]) => [e, e in o && ea(o[e]) === t ? o[e] : $i(t ?? "")])) })
			})
		}),
		/* @__PURE__ */ L(Hn, {
			title: S("Code Component"),
			open: !!r.component,
			empty: !r.component,
			children: /* @__PURE__ */ L(J, {
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
		/* @__PURE__ */ R(Hn, {
			title: S("Events"),
			empty: !r.on?.length && !r.init?.length,
			open: !!r.on?.length || !!r.init?.length,
			actions: /* @__PURE__ */ L($n, {
				label: S("Add Event"),
				onClick: () => a({ on: [...r.on ?? [], {
					event: "click",
					actions: []
				}] })
			}),
			children: [
				r.init && /* @__PURE__ */ L(sa, {
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
					return /* @__PURE__ */ L(sa, {
						title: /* @__PURE__ */ L(J, {
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
									options: Yi().filter((e) => e.value !== "init")
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
						/* @__PURE__ */ L(P, {
							name: "b-plus",
							size: 14
						}),
						" ",
						S("When the Page Loads")
					]
				})
			]
		}),
		/* @__PURE__ */ R(Hn, {
			title: S("Bindings"),
			empty: !r.show && !r.states && !r.text && !r.attrs,
			open: !!(r.show || r.states || r.text || r.attrs),
			children: [
				/* @__PURE__ */ L(J, {
					fields: [ta("show", S("Show When"), {
						placeholder: S("Always"),
						status: r.show ? "own" : void 0,
						reset: () => a({
							show: void 0,
							transition: void 0
						})
					}), ...ra(r.show, {
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
				/* @__PURE__ */ L(Wn, {
					title: S("States"),
					action: /* @__PURE__ */ L($n, {
						label: S("Add State"),
						onClick: () => a({ states: {
							...r.states ?? {},
							[Object.keys(r.states ?? {}).length ? `state${Object.keys(r.states ?? {}).length + 1}` : "open"]: i[0] ?? "open"
						} })
					})
				}),
				/* @__PURE__ */ L(J, {
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
						item: ta("expr", S("When"))
					}],
					values: { states: r.states },
					onChange: (e, t) => a({ states: t })
				}),
				/* @__PURE__ */ L(J, {
					fields: [ta("text", S("Text"), {
						placeholder: S("As Designed"),
						status: r.text ? "own" : void 0,
						reset: () => a({ text: void 0 }),
						instructions: S("Replace the text with a value, e.g. count")
					})],
					values: { text: r.text },
					onChange: (e, t) => a({ text: t || void 0 })
				}),
				/* @__PURE__ */ L(Wn, {
					title: S("Attributes"),
					action: /* @__PURE__ */ L($n, {
						label: S("Bind Attribute"),
						onClick: () => a({ attrs: {
							...r.attrs ?? {},
							"aria-expanded": i[0] ?? "open"
						} })
					})
				}),
				/* @__PURE__ */ L(J, {
					bare: !0,
					fields: [{
						handle: "attrs",
						type: "json",
						component: "blocks-pairs",
						className: "items-start",
						label: S("Attributes"),
						key: {
							options: ia,
							className: ""
						},
						item: ta("expr", S("Value"))
					}],
					values: { attrs: r.attrs },
					onChange: (e, t) => a({ attrs: t })
				}),
				e.type === "input" && /* @__PURE__ */ L(J, {
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
		/* @__PURE__ */ R(Hn, {
			title: S("Behaviors"),
			empty: !r.behaviors,
			open: !!r.behaviors,
			children: [
				/* @__PURE__ */ L(oa, {
					on: !!c.scroll,
					label: S("Scroll States"),
					help: S("Adds is-scrolled once the page scrolls, for headers that change."),
					onToggle: (e) => a({ behaviors: {
						...c,
						scroll: e ? { threshold: 20 } : void 0
					} }),
					fields: [{
						handle: "threshold",
						type: "text",
						component: "blocks-value",
						label: S("After"),
						unit: "",
						prefix: "px"
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
				/* @__PURE__ */ L(oa, {
					on: !!c.spy,
					label: S("Scroll Spy"),
					help: S("Links to #sections inside get is-current while in view."),
					onToggle: (e) => a({ behaviors: {
						...c,
						spy: e ? { offset: 96 } : void 0
					} })
				}),
				/* @__PURE__ */ L(oa, {
					on: !!c.group,
					label: S("Hover Group"),
					help: S("Children react when this whole element is hovered."),
					onToggle: (e) => a({ behaviors: {
						...c,
						group: e || void 0
					} })
				}),
				/* @__PURE__ */ L(oa, {
					on: !!c.menu,
					label: S("Menu"),
					help: S("One panel moves between items: each child is a link or button, with an optional panel after it."),
					onToggle: (e) => a({ behaviors: {
						...c,
						menu: e ? {} : void 0
					} })
				}),
				/* @__PURE__ */ L(oa, {
					on: !!c.carousel,
					label: S("Carousel"),
					help: S("The first child scrolls sideways. The first two buttons after it go back and forward."),
					onToggle: (e) => a({ behaviors: {
						...c,
						carousel: e ? {} : void 0
					} })
				}),
				/* @__PURE__ */ L(oa, {
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
							type: "text",
							component: "blocks-value",
							label: S("Speed"),
							unit: "",
							prefix: "px/s",
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
		s && /* @__PURE__ */ L(Hn, {
			title: S("Load Into"),
			open: !!r.target,
			empty: !r.target && !r.merge,
			children: /* @__PURE__ */ L(J, {
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
					...ra(r.target, {
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
function oa({ on: e, label: t, help: n, onToggle: r, fields: i, values: a, onChange: o }) {
	return /* @__PURE__ */ R("div", {
		className: F("-mx-1.5 rounded-sm px-1.5 py-1", e && "bg-sunken/60"),
		children: [/* @__PURE__ */ L(J, {
			fields: [{
				handle: "on",
				type: "toggle",
				size: "sm",
				label: t,
				instructions: n
			}],
			values: { on: e },
			onChange: (e, t) => r(!!t)
		}), e && i && /* @__PURE__ */ L(J, {
			className: "mt-1 space-y-1 pl-10",
			fields: i,
			values: a ?? {},
			onChange: o ?? (() => {})
		})]
	});
}
function sa({ title: e, mods: t, onMods: n, actions: r, onActions: i, onRemove: a, variables: o, node: s }) {
	return /* @__PURE__ */ R("div", {
		className: "space-y-1.5 rounded-sm border border-border p-1.5",
		children: [
			/* @__PURE__ */ R("div", {
				className: "flex items-center gap-1",
				children: [
					/* @__PURE__ */ L(P, {
						name: "b-lightning",
						size: 14,
						className: "shrink-0 text-muted"
					}),
					typeof e == "string" ? /* @__PURE__ */ L("span", {
						className: "min-w-0 flex-1 text-xs font-medium [overflow-wrap:anywhere]",
						children: e
					}) : e,
					n && /* @__PURE__ */ L(de, {
						align: "end",
						trigger: /* @__PURE__ */ L("button", {
							type: "button",
							className: F("grid size-6 shrink-0 place-items-center rounded-sm hover:bg-hover hover:text-ink", t?.length ? "text-ink" : "text-muted"),
							"aria-label": S("Event Options"),
							children: /* @__PURE__ */ L(P, {
								name: "b-faders",
								size: 14
							})
						}),
						items: Xi().map((e) => ({
							label: e.label,
							checked: t?.includes(e.value),
							onSelect: () => n(t?.includes(e.value) ? t.filter((t) => t !== e.value) : [...t ?? [], e.value])
						}))
					}),
					/* @__PURE__ */ L(er, {
						onClick: a,
						label: S("Remove Event")
					})
				]
			}),
			t && t.length > 0 && /* @__PURE__ */ L("p", {
				className: "m-0 pl-5 text-2xs text-faint [overflow-wrap:anywhere]",
				children: t.map((e) => Xi().find((t) => t.value === e)?.label).join(" · ")
			}),
			/* @__PURE__ */ L(ca, {
				actions: r,
				onChange: i,
				variables: o,
				node: s
			})
		]
	});
}
function ca({ actions: e, onChange: t, variables: n, node: r, depth: i = 0 }) {
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
		className: F("space-y-1", i > 0 && "border-l border-border pl-2"),
		children: [e.map((a, s) => /* @__PURE__ */ R("div", {
			className: "space-y-1 rounded-md bg-active/60 p-1.5",
			children: [/* @__PURE__ */ R("div", {
				className: "flex items-center gap-1",
				children: [
					/* @__PURE__ */ L(P, {
						name: Zi().find((e) => e.value === a.do)?.icon ?? "b-dot-outline",
						size: 14,
						className: "shrink-0 text-muted"
					}),
					/* @__PURE__ */ L("span", {
						className: "min-w-0 flex-1 text-xs font-medium text-text [overflow-wrap:anywhere]",
						children: Zi().find((e) => e.value === a.do)?.label ?? a.do
					}),
					/* @__PURE__ */ L(er, {
						onClick: () => t(e.filter((e, t) => t !== s)),
						label: S("Remove Action")
					})
				]
			}), /* @__PURE__ */ L(ua, {
				action: a,
				onChange: (e) => o(s, e),
				variables: n,
				node: r,
				depth: i
			})]
		}, s)), /* @__PURE__ */ L(de, {
			align: "start",
			trigger: /* @__PURE__ */ R("button", {
				type: "button",
				className: "flex h-7 w-full items-center gap-1.5 rounded-sm px-1.5 text-xs text-muted hover:bg-hover hover:text-ink",
				children: [
					/* @__PURE__ */ L(P, {
						name: "b-plus",
						size: 14
					}),
					" ",
					S("Add Action")
				]
			}),
			items: Zi().map((e) => ({
				label: e.label,
				icon: e.icon,
				onSelect: () => a(e.value)
			}))
		})]
	});
}
var la = (e) => e === "top" || e === "bottom" ? e : e?.startsWith("#") ? "anchor" : "node";
function ua({ action: e, onChange: n, variables: r, node: i, depth: a }) {
	let { store: o } = z(), s = et(), c = B(o, (n) => e.do === "play" && e.node ? t(n.nodes, e.node) : null), l = {
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
			f = [l, ta("value", e.do === "set" ? S("To") : S("Add"), { placeholder: e.do === "set" ? "true, 'text', count + 1" : "1" })];
			break;
		case "toggle":
			f = [l];
			break;
		case "if":
			f = [ta("test", S("If"), { placeholder: "open" })];
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
					type: "text",
					component: "blocks-value",
					label: S("Offset"),
					unit: "",
					prefix: "px",
					placeholder: "0",
					title: S("Offset in pixels, e.g. a sticky header’s height")
				}
			], p = {
				kind: la(e.to),
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
			f = [ta("value", S("Text"), { placeholder: `'${S("Text to Copy")}'` })];
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
				type: "text",
				component: "blocks-value",
				label: S("Wait"),
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
				label: S("Event"),
				placeholder: "event-name",
				mono: !0
			}, ta("detail", S("Detail"), { placeholder: "detail" })], m = (e, t) => ({ [e]: e === "detail" ? t || void 0 : t ?? "" });
			break;
		case "run":
			f = [ta("expr", S("Run"), { placeholder: "count = count * 2" })];
			break;
		default: return /* @__PURE__ */ L("p", {
			className: F(Yn, "h-auto whitespace-pre-wrap font-mono [overflow-wrap:anywhere]"),
			children: JSON.stringify(e)
		});
	}
	return /* @__PURE__ */ R("div", {
		className: "space-y-1",
		children: [/* @__PURE__ */ L(J, {
			fields: f,
			values: p,
			onChange: (e, t) => n(m(e, t))
		}), e.do === "if" && /* @__PURE__ */ R(we, { children: [
			/* @__PURE__ */ L("p", {
				className: "cms-label m-0 pt-1",
				children: S("Then")
			}),
			/* @__PURE__ */ L(ca, {
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
			/* @__PURE__ */ L(ca, {
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
var da = (e) => ({
	appear: S("Appear"),
	scroll: S("Scroll"),
	hover: S("Hover and Press"),
	loop: S("Loop"),
	load: S("Page Load"),
	event: S("On Event")
})[e], $ = "power3.out", fa = () => [
	{
		name: S("Fade In"),
		group: "appear",
		make: () => ({
			trigger: { type: "appear" },
			steps: [{
				target: "self",
				from: { opacity: 0 },
				duration: .8,
				ease: $
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
					opacity: 0,
					y: 32
				},
				duration: .9,
				ease: $
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
					opacity: 0,
					x: -48
				},
				duration: .9,
				ease: $
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
					opacity: 0,
					scale: .92
				},
				duration: .8,
				ease: "expo.out"
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
					opacity: 0,
					blur: 16,
					y: 12
				},
				duration: 1,
				ease: $
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
				from: { clipPath: "inset(100% 0% 0% 0%)" },
				to: { clipPath: "inset(0% 0% 0% 0%)" },
				duration: 1.1,
				ease: "power4.inOut"
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
					opacity: 0,
					y: 24
				},
				duration: .7,
				ease: $,
				stagger: .08
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
					opacity: 0,
					y: 20
				},
				duration: .7,
				ease: $,
				stagger: .04
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
				from: { yPercent: 110 },
				duration: .9,
				ease: "expo.out",
				stagger: .04
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
				from: { yPercent: -12 },
				to: { yPercent: 12 },
				ease: "none",
				duration: 1
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
				from: { opacity: .15 },
				to: { opacity: 1 },
				ease: "none",
				duration: 1,
				stagger: .1
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
				from: { rotate: -8 },
				to: { rotate: 8 },
				ease: "none",
				duration: 1
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
				from: { xPercent: 10 },
				to: { xPercent: -10 },
				ease: "none",
				duration: 1
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
				to: { y: -6 },
				duration: .3,
				ease: $
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
				to: { scale: 1.04 },
				duration: .35,
				ease: $
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
				to: { scale: 1.06 },
				duration: .6,
				ease: $
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
				to: { scale: .96 },
				duration: .15,
				ease: "power2.out"
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
				to: { y: -10 },
				duration: 2.2,
				ease: "sine.inOut"
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
				to: { rotate: 360 },
				duration: 12,
				ease: "none"
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
				to: { scale: 1.06 },
				duration: 1.2,
				ease: "sine.inOut"
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
					opacity: 0,
					y: 24
				},
				duration: 1,
				ease: $,
				delay: .1
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
				from: {
					opacity: 0,
					y: 40
				},
				duration: .9,
				ease: $,
				stagger: .05
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
					opacity: 0,
					y: 16
				},
				duration: .8,
				ease: $,
				stagger: .1
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
					opacity: 0,
					scale: .96
				},
				duration: .3,
				ease: $
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
				ease: $,
				stagger: .05
			}]
		})
	}
], pa = () => ({
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
		help: S("Plays as the page paints, with no script. Delay stops at 0.2s and stagger at 0.3s.")
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
}), ma = () => ({
	opacity: S("Opacity"),
	x: S("Move X"),
	y: S("Move Y"),
	xPercent: S("Move X %"),
	yPercent: S("Move Y %"),
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
	clipPath: S("Clip Path"),
	backgroundColor: S("Fill"),
	color: S("Text Color"),
	borderColor: S("Border Color"),
	borderRadius: S("Radius"),
	boxShadow: S("Shadow"),
	letterSpacing: S("Letter Spacing"),
	transformOrigin: S("Origin"),
	perspective: S("Perspective")
}), ha = () => [
	{
		value: "power3.out",
		label: S("Smooth Out")
	},
	{
		value: "expo.out",
		label: S("Expo Out")
	},
	{
		value: "power4.inOut",
		label: S("Smooth In-Out")
	},
	{
		value: "power2.out",
		label: S("Gentle Out")
	},
	{
		value: "back.out(1.7)",
		label: S("Overshoot")
	},
	{
		value: "elastic.out(1, 0.4)",
		label: S("Elastic")
	},
	{
		value: "bounce.out",
		label: S("Bounce")
	},
	{
		value: "sine.inOut",
		label: S("Sine In-Out")
	},
	{
		value: "power2.in",
		label: S("Ease In")
	},
	{
		value: "none",
		label: S("Linear")
	},
	{
		value: "cubic-bezier(0.2, 0.8, 0.2, 1)",
		label: S("Signature Ease")
	}
], ga = (e, ...t) => e ? t : [], _a = [
	"heading",
	"paragraph",
	"link",
	"button",
	"quote"
], va = (e) => {
	let t = e.length + 1;
	for (; e.some((e) => e.id === `m${t}`);) t++;
	return `m${t}`;
}, ya = (e = "self") => e.startsWith("#") ? S("Another Element") : {
	self: S("This Element"),
	children: S("Children"),
	words: S("Words")
}[e] ?? e;
function ba({ node: e }) {
	let { store: t } = z(), n = e.motion ?? [], [r, i] = A(n[0]?.id ?? null), a = (n) => t.updateNode(e.id, { motion: n.length ? n : void 0 }, `motion:${e.id}`), o = (e, t) => a(n.map((n) => n.id === e ? {
		...n,
		...t
	} : n)), s = _a.includes(e.type), c = pa(), l = (t) => {
		let r = va(n), o = t ? {
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
					opacity: 0,
					y: 24
				},
				duration: .8,
				ease: "power3.out"
			}]
		};
		a([...n, o]), i(r), requestAnimationFrame(() => qt.emit("preview-motion", {
			node: e.id,
			motion: o
		}));
	}, u = fa(), d = [...new Set(u.map((e) => e.group))];
	return /* @__PURE__ */ L(Hn, {
		title: S("Animations"),
		empty: n.length === 0,
		actions: /* @__PURE__ */ L(de, {
			align: "end",
			trigger: /* @__PURE__ */ L("button", {
				type: "button",
				className: "grid size-6 shrink-0 place-items-center rounded-sm text-muted hover:bg-hover hover:text-ink",
				"aria-label": S("Add Animation"),
				children: /* @__PURE__ */ L(P, {
					name: "b-plus",
					size: 14
				})
			}),
			items: [
				...d.flatMap((e) => [{
					label: da(e),
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
			className: F("rounded-sm border", r === t.id ? "border-border-strong" : "border-border"),
			children: [/* @__PURE__ */ R("div", {
				className: "flex h-8 items-center gap-1.5 pl-2 pr-1",
				children: [
					/* @__PURE__ */ L(P, {
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
					/* @__PURE__ */ L(_e, {
						content: S("Preview Animation"),
						children: /* @__PURE__ */ L("button", {
							type: "button",
							onClick: () => qt.emit("preview-motion", {
								node: e.id,
								motion: t
							}),
							className: "grid size-6 shrink-0 place-items-center rounded-sm text-muted hover:bg-hover hover:text-ink",
							"aria-label": S("Preview"),
							children: /* @__PURE__ */ L(P, {
								name: "b-play",
								size: 14
							})
						})
					}),
					/* @__PURE__ */ L(er, {
						onClick: () => a(n.filter((e) => e.id !== t.id)),
						label: S("Remove Animation")
					})
				]
			}), r === t.id && /* @__PURE__ */ L(xa, {
				node: e,
				motion: t,
				onChange: (e) => o(t.id, e)
			})]
		}, t.id))
	});
}
function xa({ node: e, motion: t, onChange: n }) {
	let [r, i] = A(0), a = pa(), o = t.trigger, s = (e) => n({ trigger: {
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
		...ga(o.type === "appear", {
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
		...ga(o.type === "scroll", {
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
		...ga(l, {
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
		...ga(o.type === "scroll" || o.type === "appear", {
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
				opacity: 0,
				y: 16
			},
			duration: .5,
			ease: "power3.out",
			stagger: .06
		}] }), i(t.steps.length);
	};
	return /* @__PURE__ */ R("div", {
		className: "space-y-2 border-t border-border p-2",
		children: [
			/* @__PURE__ */ L(J, {
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
			/* @__PURE__ */ L(wa, {
				steps: t.steps,
				active: u,
				onSelect: i,
				onChange: c,
				onAdd: g
			}),
			t.steps[u] && /* @__PURE__ */ L(Ea, {
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
function Sa(e) {
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
var Ca = (e) => Math.max(0, Math.round(e * 20) / 20);
function wa({ steps: e, active: t, onSelect: n, onChange: r, onAdd: i }) {
	let a = Sa(e), o = Math.max(.5, ...a.map((e) => e.start + e.duration + e.spread)), s = k(null), c = s.current?.total ?? Math.ceil(o * 2 + .25) / 2, l = c <= 1.5 ? .25 : c <= 4 ? .5 : c <= 10 ? 1 : 2, u = Array.from({ length: Math.floor(c / l) + 1 }, (e, t) => t * l), d = (e) => `${e / c * 100}%`, f = (t, i, a) => {
		t.preventDefault(), t.stopPropagation(), n(i);
		let o = t.currentTarget.closest("[data-track]");
		if (!o) return;
		s.current = {
			total: c,
			width: o.clientWidth
		};
		let l = t.clientX, u = e[i], d = a === "move" ? u.at === void 0 ? u.delay ?? 0 : u.at : u.duration ?? .6, f = (e) => {
			let t = (e.clientX - l) / s.current.width * s.current.total;
			a === "end" ? r(i, { duration: Math.max(.05, Ca(d + t)) }) : u.at === void 0 ? r(i, { delay: Ca(d + t) || void 0 }) : r(i, { at: Ca(d + t) });
		}, p = () => {
			window.removeEventListener("pointermove", f), window.removeEventListener("pointerup", p), s.current = null;
		};
		window.addEventListener("pointermove", f), window.addEventListener("pointerup", p);
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
					children: u.filter((e, t) => u.length <= 5 || t % 2 == 0).map((e) => /* @__PURE__ */ L("span", {
						className: "absolute -translate-x-1/2 font-mono text-[9px] leading-none text-faint first:translate-x-0 last:-translate-x-full",
						style: { left: d(e) },
						children: e === 0 ? "0" : `${e}s`
					}, e))
				})]
			}),
			e.map((e, i) => {
				let o = a[i];
				return /* @__PURE__ */ R("div", {
					className: F("flex h-7 items-center pr-2", i === t && "bg-focus-soft"),
					children: [/* @__PURE__ */ L("button", {
						type: "button",
						onClick: () => n(i),
						className: F("w-16 shrink-0 truncate pl-2 text-left text-2xs", i === t ? "font-medium text-ink" : "text-muted hover:text-text"),
						children: ya(e.target)
					}), /* @__PURE__ */ R("div", {
						"data-track": !0,
						className: "relative h-full flex-1",
						children: [
							u.map((e) => /* @__PURE__ */ L("span", {
								className: "absolute inset-y-0 w-px bg-border/70",
								style: { left: d(e) }
							}, e)),
							/* @__PURE__ */ R("div", {
								role: "slider",
								tabIndex: 0,
								"aria-label": S("Step {n}", { n: i + 1 }),
								"aria-valuenow": o.start,
								"aria-valuetext": S("Starts at {start}s, runs {duration}s", {
									start: o.start.toFixed(2),
									duration: o.duration.toFixed(2)
								}),
								onPointerDown: (e) => f(e, i, "move"),
								onKeyDown: (t) => {
									if (t.key !== "ArrowLeft" && t.key !== "ArrowRight") return;
									t.preventDefault();
									let n = t.key === "ArrowRight" ? .05 : -.05;
									t.shiftKey ? r(i, { duration: Math.max(.05, Ca((e.duration ?? .6) + n)) }) : e.at === void 0 ? r(i, { delay: Ca((e.delay ?? 0) + n) || void 0 }) : r(i, { at: Ca(e.at + n) });
								},
								className: F("cms-focus-ring group/bar absolute top-1 flex h-4 cursor-grab items-center rounded-[3px] active:cursor-grabbing", i === t ? "bg-focus" : "bg-focus/50 hover:bg-focus/70"),
								style: {
									left: d(o.start),
									width: `max(6px, ${d(o.duration)})`
								},
								children: [/* @__PURE__ */ R("span", {
									className: "pointer-events-none truncate px-1 font-mono text-[9px] leading-none text-white",
									children: [o.duration.toFixed(1), "s"]
								}), /* @__PURE__ */ L("span", {
									onPointerDown: (e) => f(e, i, "end"),
									className: "absolute -right-1 inset-y-0 w-2 cursor-ew-resize",
									"aria-hidden": !0
								})]
							}),
							o.spread > 0 && /* @__PURE__ */ L("span", {
								className: "pointer-events-none absolute top-1 h-4 rounded-r-[3px] bg-focus/20",
								style: {
									left: d(o.start + o.duration),
									width: d(o.spread)
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
					/* @__PURE__ */ L(P, {
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
var Ta = (e, t, n, r = {}) => ({
	handle: e,
	type: "text",
	component: "blocks-value",
	label: t,
	title: t,
	prefixIcon: n,
	unit: "",
	step: .05,
	min: 0,
	...r
});
function Ea({ node: e, step: t, index: n, count: r, onChange: i, onRemove: a }) {
	let { catalog: o } = z(), s = t.target ?? "self", c = ma(), l = Object.keys(o.motion?.properties ?? c), u = _a.includes(e.type), d = (e) => {
		let n = t[e] ?? {}, r = (t, r) => i({ [e]: {
			...n,
			[t]: /^-?[\d.]+$/.test(r) ? Number(r) : r
		} });
		return /* @__PURE__ */ R("div", {
			className: "space-y-1",
			children: [
				/* @__PURE__ */ R("div", {
					className: "flex h-7 items-center justify-between",
					children: [/* @__PURE__ */ L("span", {
						className: "text-xs font-medium text-muted",
						children: S(e === "from" ? "From" : "To")
					}), /* @__PURE__ */ L(de, {
						align: "end",
						trigger: /* @__PURE__ */ L("button", {
							type: "button",
							className: "grid size-6 shrink-0 place-items-center rounded-sm text-muted hover:bg-hover hover:text-ink",
							"aria-label": S(e === "from" ? "Add a Start Property" : "Add an End Property"),
							children: /* @__PURE__ */ L(P, {
								name: "b-plus",
								size: 14
							})
						}),
						items: l.filter((e) => !(e in n)).map((e) => ({
							label: c[e] ?? e,
							onSelect: () => r(e, o.motion.properties[e] === "css" ? e === "clipPath" ? "inset(0% 0% 0% 0%)" : "token:color.primary" : e === "opacity" || e.startsWith("scale") ? "1" : "0")
						}))
					})]
				}),
				Object.keys(n).length === 0 && /* @__PURE__ */ L("p", {
					className: "m-0 text-2xs text-faint",
					children: S(e === "from" ? "As it looks now" : "As Designed")
				}),
				/* @__PURE__ */ L(J, {
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
							component: "blocks-value",
							label: S("Value"),
							unit: ""
						},
						items: Object.fromEntries(Object.keys(n).map((e) => [e, {
							handle: "value",
							type: "text",
							component: "blocks-value",
							label: S("Value"),
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
					r > 1 && /* @__PURE__ */ L(er, {
						onClick: a,
						label: S("Remove Step")
					})
				]
			}),
			/* @__PURE__ */ L(J, {
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
					...ga(s.startsWith("#"), {
						handle: "element",
						type: "select",
						component: "blocks-node",
						label: S("Element")
					}),
					...ga(s === "words", {
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
			/* @__PURE__ */ L(J, {
				fields: [{
					handle: "timing",
					type: "group",
					component: "blocks-group",
					label: S("Timing"),
					columns: 2,
					fields: [
						Ta("duration", S("Duration in Seconds"), "b-timer"),
						Ta("delay", S("Delay in Seconds"), "b-clock", { placeholder: "0" }),
						...ga(s !== "self", Ta("stagger", S("Time between items in seconds"), "b-dots-three", {
							step: .01,
							placeholder: "0"
						})),
						...ga(r > 1, Ta("at", S("Start in seconds into the timeline"), "b-flow-arrow", { placeholder: S("After") }))
					]
				}, {
					handle: "ease",
					type: "text",
					component: "ease",
					label: S("Ease"),
					placeholder: S("Smooth Out"),
					options: ha()
				}],
				values: {
					timing: {
						duration: String(t.duration ?? .6),
						delay: t.delay === void 0 ? void 0 : String(t.delay),
						stagger: t.stagger === void 0 ? void 0 : String(t.stagger),
						at: t.at === void 0 ? void 0 : String(t.at)
					},
					ease: t.ease
				},
				onChange: (e, t) => i(e === "ease" ? { ease: t ?? void 0 } : {
					duration: Number(t.duration ?? .6),
					delay: t.delay ? Number(t.delay) : void 0,
					stagger: t.stagger ? Number(t.stagger) : void 0,
					at: t.at ? Number(t.at) : void 0
				})
			})
		]
	});
}
// admin/src/builder/Inspector.tsx
var Da = [
	"content",
	"design",
	"interact"
], Oa = "cms.block.tab";
function ka(e) {
	if (!e.scrollTop) return null;
	let t = e.getBoundingClientRect().top, n = [...e.querySelectorAll("[data-section]")].find((e) => e.getBoundingClientRect().bottom > t);
	return {
		section: n?.dataset.section,
		offset: n ? n.getBoundingClientRect().top - t : 0,
		scrollTop: e.scrollTop
	};
}
function Aa(e, t) {
	let n = t.section && e.querySelector(`[data-section="${CSS.escape(t.section)}"]`);
	n ? e.scrollTop += n.getBoundingClientRect().top - e.getBoundingClientRect().top - t.offset : e.scrollTop = t.scrollTop;
}
function ja() {
	try {
		let e = sessionStorage.getItem(Oa);
		return Da.find((t) => t === e) ?? "content";
	} catch {
		return "content";
	}
}
function Ma({ node: e, onBack: t, backLabel: n, onClose: r }) {
	let { store: i, types: a, allowed: s, readOnly: c } = z(), l = a.get(e.type), u = je(), [d, f] = A(ja), p = `block-inspector-${oe()}`, [m, h] = A(!1), g = k(null), v = k(e.id), y = k(null);
	v.current !== e.id && (v.current = e.id, y.current = g.current && ka(g.current)), se(() => {
		g.current && y.current && Aa(g.current, y.current), y.current = null;
	}, [e.id]);
	let b = (e) => {
		try {
			sessionStorage.setItem(Oa, e);
		} catch {}
		f(e);
	}, x = !c && e.type !== "pattern" && _("entries.components.create");
	return /* @__PURE__ */ R("div", {
		className: "flex h-full min-h-0 min-w-0 flex-col",
		"data-blocks-inspector": !0,
		children: [
			/* @__PURE__ */ R("div", {
				className: F("flex h-12 shrink-0 items-center gap-1 pr-3", t ? "pl-2" : "pl-4"),
				children: [
					t && /* @__PURE__ */ L(ue, {
						icon: "arrow-left",
						label: n ? S("Back to {name}", { name: n }) : S("Back"),
						size: "sm",
						onClick: t
					}),
					/* @__PURE__ */ L(P, {
						name: e.type === "pattern" ? "b-diamonds-four" : l?.icon ?? "square",
						size: 16,
						className: "ml-1 shrink-0 text-muted"
					}),
					m ? /* @__PURE__ */ L("div", {
						className: "min-w-0 flex-1 pl-1",
						onBlur: () => h(!1),
						onKeyUp: (e) => e.key === "Escape" && e.target.blur(),
						children: /* @__PURE__ */ L(J, {
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
						children: Me(e, a, u)
					}),
					/* @__PURE__ */ L(de, {
						align: "end",
						trigger: /* @__PURE__ */ L(ue, {
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
									i.selection().includes(e.id) || i.select(e.id), dt(i, o(i, a, s));
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
					r && /* @__PURE__ */ L(ue, {
						icon: "close",
						label: S("Close Panel"),
						size: "sm",
						onClick: r
					})
				]
			}),
			/* @__PURE__ */ L("div", {
				className: "flex h-10 shrink-0 items-center gap-2 border-b border-border pl-4 pr-3",
				children: /* @__PURE__ */ L(ge, {
					id: p,
					value: d,
					onChange: b,
					bordered: !1,
					size: "sm",
					className: "h-full min-w-0 flex-1",
					tabs: Da.map((e) => ({
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
				children: /* @__PURE__ */ R(E, { children: [
					d === "design" && /* @__PURE__ */ L(Ji, { node: e }),
					d === "content" && /* @__PURE__ */ L(Ar, { node: e }),
					d === "interact" && /* @__PURE__ */ R(we, { children: [/* @__PURE__ */ L(ba, { node: e }), /* @__PURE__ */ L(aa, { node: e })] })
				] }, e.id)
			})
		]
	});
}
export { ke as $, gn as A, Xt as B, Yn as C, Sn as D, bn as E, rn as F, nt as G, qt as H, sn as I, Xe as J, G as K, Jt as L, cn as M, on as N, hn as O, an as P, B as Q, $t as R, Gn as S, En as T, lt as U, Yt as V, rt as W, Pe as X, Be as Y, Le as Z, ir as _, pi as a, J as b, Lr as c, xr as d, Me as et, Sr as f, or as g, mr as h, wi as i, Ne as it, vn as j, _n as k, Ir as l, cr as m, bi as n, je as nt, fi as o, lr as p, et as q, _i as r, z as rt, ri as s, Ma as t, Ae as tt, Fr as u, tr as v, Nn as w, er as x, $n as y, Qt as z };
