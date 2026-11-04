import { a as e, b as t, c as n, d as r, f as i, g as a, h as o, i as s, l as c, m as l, n as u, o as d, p as f, r as p, t as m, u as h, y as g } from "./insert-BKwjfSi5.js";
import { can as _, invalidate as v, locale as y, navigate as b, plural as x, registry as S, run as ee, t as C, useAbility as w, useManifest as T, useManifestIfLoaded as E, xsrfToken as D } from "@letterncms/sdk";
import { Fragment as te, createContext as ne, createElement as re, memo as ie, useCallback as ae, useContext as oe, useEffect as O, useId as se, useLayoutEffect as ce, useMemo as le, useRef as k, useState as A, useSyncExternalStore as j } from "react";
import { Button as M, Dialog as ue, Fields as N, Icon as P, IconButton as de, Menu as F, Popover as fe, QueryError as pe, Segmented as me, Spinner as he, Tabs as ge, Tooltip as _e, cn as I, fieldControlId as L, fieldVisible as ve, prompt as ye, slugify as be, toast as xe } from "@letterncms/ui";
import { Fragment as Se, jsx as R, jsxs as z } from "react/jsx-runtime";
import { createPortal as Ce, flushSync as we } from "react-dom";
import { createRoot as Te } from "react-dom/client";
// admin/src/core/context.tsx
var Ee = ne(null);
function De({ value: e, children: t }) {
	return e.store.setReadOnly(!!e.readOnly), /* @__PURE__ */ R(Ee.Provider, {
		value: e,
		children: t
	});
}
function B() {
	let e = oe(Ee);
	if (!e) throw Error("Block editor context missing");
	return e;
}
function Oe() {
	let e = w("blocks/types", {}, { staleTime: 3e5 }), t = le(() => new Map((e.data?.blocks ?? []).map((e) => [e.name, e])), [e.data]);
	return {
		catalog: e.data,
		types: t,
		isLoading: e.isLoading,
		error: e.error,
		retry: () => void e.refetch()
	};
}
function ke() {
	let e = w("patterns/list", {}, { staleTime: 6e4 });
	return le(() => new Map((e.data ?? []).map((e) => [e.handle, e.title])), [e.data]);
}
function Ae(e, t, n) {
	return e.label || (e.type === "pattern" ? n.get(String(e.props?.ref ?? "")) : void 0) || t.get(e.type)?.title || e.type;
}
function je() {
	let e = w("design/get", {}, {
		staleTime: 6e4,
		retry: !1
	});
	return le(() => {
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
var Me = class {
	onChange;
	readOnly;
	state;
	listeners = /* @__PURE__ */ new Set();
	past = [];
	future = [];
	lastCommit = 0;
	lastGroup = "";
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
	selection = () => Fe(this.state);
	extendTo(e) {
		let { selected: t, nodes: n, blockMode: r } = this.state, a = t ? i(n, t) : null, o = i(n, e);
		if (!t || !a || !o || a.parentId !== o.parentId) return this.select(e, r);
		this.set({ head: e === t ? null : e });
	}
	extend(e) {
		let { selected: t, head: n, nodes: r } = this.state, o = t ? i(r, t) : null;
		if (!t || !o) return;
		let s = a(r, o.parentId), c = s.findIndex((e) => e.id === (n ?? t)) + e;
		c >= 0 && c < s.length && this.extendTo(s[c].id);
	}
	removeSelection() {
		let e = this.selection();
		this.commit(e.reduce((e, t) => o(e, t), this.state.nodes)), this.set({
			selected: null,
			head: null
		});
	}
	replaceSelection(e) {
		let t = this.selection(), n = t[0] ? i(this.state.nodes, t[0]) : null;
		if (!n) return;
		let r = t.reduce((e, t) => o(e, t), this.state.nodes);
		this.commit(h(r, n.parentId, n.index, e)), this.set({
			selected: e[0]?.id ?? null,
			head: null
		});
	}
	hover = (e) => this.state.hovered !== e && this.set({ hovered: e });
	setBreakpoint = (e) => this.set({ breakpoint: e });
	setStyleState = (e) => this.set({ state: e });
	variant = () => Ne(this.state.breakpoint, this.state.state);
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
		this.commit(g(this.state.nodes, e, (e) => ({
			...e,
			props: {
				...e.props,
				...t
			}
		})), n || `props:${e}`);
	}
	updateNode(e, t, n = "") {
		this.commit(g(this.state.nodes, e, (e) => ({
			...e,
			...t
		})), n);
	}
	insert(e, t, n) {
		this.commit(h(this.state.nodes, e, t, n));
	}
	insertAfter(e, t) {
		if (!e) return this.insert(null, this.state.nodes.length, t);
		let n = i(this.state.nodes, e);
		if (!n) return this.insert(null, this.state.nodes.length, t);
		this.insert(n.parentId, n.index + 1, t);
	}
	remove(e) {
		this.commit(o(this.state.nodes, e)), this.state.selected === e && this.set({
			selected: null,
			head: null
		});
	}
	move(e, t, n) {
		this.commit(f(this.state.nodes, e, t, n));
	}
	moveTo(t, r, a) {
		let s = this.state.nodes;
		if (r && t.some((t) => t === r || e(s, r).some((e) => e.id === t))) return;
		let c = t.map((e) => n(s, e)).filter((e) => !!e), l = t.filter((e) => {
			let t = i(s, e);
			return t && t.parentId === r && t.index < a;
		}).length, u = h(t.reduce((e, t) => o(e, t), s), r, a - l, c);
		JSON.stringify(u) !== JSON.stringify(s) && this.commit(u);
	}
	nudge(e, t) {
		let n = i(this.state.nodes, e);
		if (!n) return;
		let r = a(this.state.nodes, n.parentId).length, o = n.index + t;
		o < 0 || o >= r || this.move(e, n.parentId, t > 0 ? o + 1 : o);
	}
	nudgeSelection(e) {
		let t = this.selection(), n = t[0] ? i(this.state.nodes, t[0]) : null, r = t.length ? i(this.state.nodes, t.at(-1)) : null;
		if (!n || !r || n.parentId !== r.parentId) return;
		let o = a(this.state.nodes, n.parentId).length;
		e < 0 && n.index === 0 || e > 0 && r.index === o - 1 || this.moveTo(t, n.parentId, e < 0 ? n.index - 1 : r.index + 2);
	}
	duplicate(e) {
		let t = n(this.state.nodes, e);
		if (!t) return;
		let r = d(t);
		this.insertAfter(e, [r]), this.select(r.id);
	}
	duplicateSelection() {
		let e = this.selection(), t = this.state.nodes, r = e.map((e) => n(t, e)).filter((e) => !!e).map(d), a = e.length ? i(t, e.at(-1)) : null;
		a && r.length && (this.insert(a.parentId, a.index + 1, r), this.select(r[0].id, !0), r.length > 1 && this.extendTo(r.at(-1).id));
	}
	wrap(e, t) {
		let r = n(this.state.nodes, e), a = i(this.state.nodes, e);
		if (!r || !a) return;
		let s = {
			...t,
			children: [r]
		};
		this.commit(h(o(this.state.nodes, e), a.parentId, a.index, [s])), this.select(s.id);
	}
	unwrap(e) {
		let t = n(this.state.nodes, e), r = i(this.state.nodes, e);
		t && r && t.children && this.commit(h(o(this.state.nodes, e), r.parentId, r.index, t.children));
	}
};
function Ne(e, t) {
	return e === "base" ? t || "base" : t ? `${e}:${t}` : e;
}
function Pe(e, t) {
	let n = e === "mobile" ? [
		"mobile",
		"tablet",
		"base"
	] : e === "tablet" ? ["tablet", "base"] : ["base"], r = [];
	if (t) for (let e of n) r.push(Ne(e, t));
	return r.push(...n), r;
}
function Fe(e) {
	if (!e.selected) return [];
	if (!e.head) return [e.selected];
	let t = i(e.nodes, e.selected);
	if (!t) return [e.selected];
	let n = a(e.nodes, t.parentId), r = n.findIndex((t) => t.id === e.selected), o = n.findIndex((t) => t.id === e.head);
	return o < 0 ? [e.selected] : n.slice(Math.min(r, o), Math.max(r, o) + 1).map((e) => e.id);
}
function Ie(e, t) {
	if (Object.is(e, t)) return !0;
	if (Array.isArray(e) && Array.isArray(t)) return e.length === t.length && e.every((e, n) => Object.is(e, t[n]));
	if (e && t && typeof e == "object" && typeof t == "object") {
		let n = Object.keys(e), r = Object.keys(t);
		return n.length === r.length && n.every((n) => Object.is(e[n], t[n]));
	}
	return !1;
}
function V(e, t) {
	let n = k(null);
	return j(e.subscribe, () => {
		let r = t(e.get());
		return n.current && Ie(n.current.value, r) ? n.current.value : (n.current = { value: r }, r);
	});
}
// admin/src/core/uniqueIds.ts
function Le(e, t) {
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
function Re(e, n, r) {
	let i = k(n);
	i.current = n;
	let [a] = A(() => new Me(Le(Array.isArray(e) ? e : [], t), (e) => i.current(e), r)), o = k(e);
	return a.setReadOnly(r), O(() => {
		if (o.current === e) return;
		o.current = e;
		let n = Le(Array.isArray(e) ? e : [], t);
		JSON.stringify(n) !== JSON.stringify(a.get().nodes) && a.reset(n);
	}, [a, e]), a;
}
// admin/src/core/caret.ts
function ze(e = document) {
	return e.getSelection()?.isCollapsed ?? !0;
}
function H(e, t) {
	let n = e.ownerDocument.getSelection();
	if (!n || n.rangeCount === 0) return null;
	let r = n.getRangeAt(0);
	if (!e.contains(r.startContainer)) return null;
	let i = e.ownerDocument.createRange();
	return i.selectNodeContents(e), t ? i.setEnd(r.startContainer, r.startOffset) : i.setStart(r.endContainer, r.endOffset), i;
}
function Be(e) {
	return e ? e.toString().replace(/​/g, "") : "";
}
function Ve(e) {
	return ze(e.ownerDocument) && Be(H(e, !0)) === "" && !W(H(e, !0)).includes("<br");
}
function U(e) {
	return ze(e.ownerDocument) && Be(H(e, !1)) === "";
}
function W(e) {
	if (!e) return "";
	let t = e.startContainer.ownerDocument.createElement("div");
	return t.appendChild(e.cloneContents()), t.innerHTML;
}
function He(e) {
	return Be(H(e, !0)).length;
}
function Ue(e) {
	let t = H(e, !0), n = H(e, !1);
	return [W(t), W(n)];
}
function We(e) {
	let t = qe(e.ownerDocument);
	return !t || t.top - e.getBoundingClientRect().top < Ke(e) * .8;
}
function Ge(e) {
	let t = qe(e.ownerDocument);
	return !t || e.getBoundingClientRect().bottom - t.bottom < Ke(e) * .8;
}
function Ke(e) {
	let t = parseFloat(e.ownerDocument.defaultView.getComputedStyle(e).lineHeight);
	return Number.isFinite(t) ? t : 20;
}
function qe(e = document) {
	let t = e.getSelection();
	if (!t || t.rangeCount === 0) return null;
	let n = t.getRangeAt(0).cloneRange(), r = n.getClientRects();
	if (r.length > 0) return r[0];
	let i = e.createElement("span");
	i.textContent = "​", n.insertNode(i);
	let a = i.getBoundingClientRect();
	return i.remove(), a;
}
function Je(e, t) {
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
function Ye(e) {
	let t = document.createElement("div");
	return t.innerHTML = e, (t.textContent ?? "").length;
}
function G(e) {
	return e.replace(/\u200B/g, "").replace(/<(\/?)strike>/g, "<$1s>").replace(/<(\/?)b>/g, "<$1strong>").replace(/<(\/?)i>/g, "<$1em>").replace(/<div><br><\/div>/g, "<br>").replace(/<\/?(div|p|span)[^>]*>/g, "").replace(/ style="[^"]*"/g, "").replace(/&nbsp;/g, " ").replace(/<br>$/, "");
}
var K = [
	["**", "strong"],
	["__", "strong"],
	["~~", "s"],
	["`", "code"],
	["*", "em"],
	["_", "em"]
];
function Xe(e = document) {
	let t = e.getSelection();
	if (!t || !t.isCollapsed || t.rangeCount === 0) return !1;
	let n = t.anchorNode;
	if (!n || n.nodeType !== Node.TEXT_NODE || n.parentElement?.closest("code")) return !1;
	let r = t.anchorOffset, i = (n.textContent ?? "").slice(0, r);
	for (let [a, o] of K) {
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
function q() {
	let { store: e } = B(), t = V(e, (e) => e.nodes), n = /* @__PURE__ */ new Map(), r = [];
	for (let { node: e } of c(t)) {
		let t = String(e.props?.text ?? "").replace(/<[^>]+>/g, "").trim(), i = e.props?.anchor || e.anchor || "";
		if (!i && e.type === "heading" && t) {
			let e = be(t) || "section", r = (n.get(e) ?? 0) + 1;
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
function Ze({ html: e, onChange: t, tag: n = "div", placeholder: r, className: i = "", focus: a, onKeyDown: o, onFocus: s, onPaste: c, disabled: l, singleLine: u, quiet: d, plainText: f }) {
	let p = k(null), m = k(e);
	ce(() => {
		let t = p.current;
		t && (t.ownerDocument.activeElement === t ? m.current = e : (G(t.innerHTML) !== e && (t.innerHTML = e), m.current = G(t.innerHTML)));
	}, [e]), ce(() => {
		a && p.current && Je(p.current, a.at);
	}, [a?.nonce]);
	let h = () => {
		let e = p.current;
		if (!e) return;
		let n = G(e.innerHTML);
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
			let t = e.nativeEvent;
			!f && t.inputType === "insertText" && t.data && /[*_~`]/.test(t.data) && Xe(e.currentTarget.ownerDocument), h();
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
			}[e.key.toLowerCase()]), h()) : n && e.shiftKey && e.key.toLowerCase() === "x" ? (e.preventDefault(), t.execCommand("strikeThrough"), h()) : n && e.key.toLowerCase() === "k" ? (e.preventDefault(), e.stopPropagation(), p.current?.ownerDocument.dispatchEvent(new CustomEvent("cms:link"))) : n && e.key.toLowerCase() === "e" ? (e.preventDefault(), Qe("code", t), h()) : e.key === "Enter" && e.shiftKey && !u ? (e.preventDefault(), t.execCommand("insertLineBreak"), h()) : p.current && o?.(e, p.current);
		},
		onPaste: (e) => {
			e.preventDefault();
			let t = e.currentTarget.ownerDocument, n = e.clipboardData.getData("text/plain");
			!f && /^(https?:\/\/|mailto:)\S+$/i.test(n.trim()) && !t.getSelection()?.isCollapsed ? (t.execCommand("createLink", !1, n.trim()), h()) : p.current && c?.(n, p.current) || (t.execCommand("insertText", !1, u ? n.replace(/\s*\n\s*/g, " ") : n), h());
		},
		onBlur: () => h()
	});
}
function Qe(e, t = document) {
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
function $e(e) {
	return S.fields.get("link") ? {
		...e,
		type: "url",
		component: "link"
	} : {
		...e,
		type: "url"
	};
}
// admin/src/core/FormatToolbar.tsx
function et({ root: e = document, offset: t }) {
	let [n, r] = A(null), [i, a] = A({}), [o, s] = A(!1), [c, l] = A(""), u = k(null), d = k(null), f = k(() => {}), p = q();
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
		Qe(t, e), d.current?.dispatchEvent(new Event("input", { bubbles: !0 })), e.dispatchEvent(new Event("selectionchange"));
	}, g = () => {
		let t = e.getSelection();
		u.current = t && t.rangeCount ? t.getRangeAt(0).cloneRange() : null;
		let n = (t?.anchorNode?.parentElement)?.closest("a");
		l(n?.getAttribute("href") ?? ""), s(!0);
	};
	f.current = g;
	let _ = !!S.fields.get("link"), v = (t = c) => {
		let n = e.getSelection();
		u.current && n && (n.removeAllRanges(), n.addRange(u.current));
		let i = t.trim();
		i === "" ? e.execCommand("unlink") : /^(https?:|mailto:|tel:|\/|#|\{brand\.)/i.test(i) ? e.execCommand("createLink", !1, i) : e.execCommand("createLink", !1, `https://${i}`), d.current?.dispatchEvent(new Event("input", { bubbles: !0 })), s(!1), r(null);
	}, y = (e, t, n, r) => /* @__PURE__ */ R(_e, {
		content: t,
		shortcut: n,
		children: /* @__PURE__ */ R("button", {
			type: "button",
			"aria-label": t,
			"aria-pressed": !!i[e] || e === "link" && o,
			onMouseDown: (e) => e.preventDefault(),
			onClick: r,
			className: I("grid size-7 place-items-center rounded-xs hover:bg-white/12 hover:text-ink-contrast", i[e] || e === "link" && o ? "bg-white/14 text-ink-contrast" : "text-ink-contrast/75"),
			children: /* @__PURE__ */ R(P, {
				name: e,
				size: 14
			})
		})
	}, e), b = () => {
		s(!1);
		let t = d.current, n = e.getSelection();
		t && u.current && n && (t.focus({ preventScroll: !0 }), n.removeAllRanges(), n.addRange(u.current));
	}, x = $e({
		handle: "url",
		label: C("Link"),
		size: "sm",
		autofocus: !0,
		anchors: p,
		placeholder: C("Paste a link or search pages"),
		onClose: b
	});
	return Ce(/* @__PURE__ */ R("div", {
		className: I("fixed z-[70] flex -translate-x-1/2 -translate-y-full items-center gap-0.5 rounded-md bg-ink p-1 shadow-pop", o && !_ && "p-1.5"),
		style: {
			left: n.x,
			top: n.y - 8
		},
		onMouseDown: (e) => !o && e.preventDefault(),
		onKeyDown: (e) => e.key === "Escape" && b(),
		children: o && !_ ? /* @__PURE__ */ z("form", {
			onSubmit: (e) => {
				e.preventDefault(), v();
			},
			className: "flex items-center gap-1",
			children: [/* @__PURE__ */ R(N, {
				bare: !0,
				className: "w-64",
				fields: [x],
				values: { url: c },
				onChange: (e, t) => l(t ?? "")
			}), /* @__PURE__ */ R("button", {
				type: "submit",
				className: "h-7 rounded-xs px-2 text-xs font-medium text-ink-contrast hover:bg-white/12",
				children: C(c ? "Apply" : "Remove")
			})]
		}) : /* @__PURE__ */ z(Se, { children: [
			y("bold", C("Bold"), "mod+b", () => m("bold")),
			y("italic", C("Italic"), "mod+i", () => m("italic")),
			y("underline", C("Underline"), "mod+u", () => m("underline")),
			y("strike", C("Strikethrough"), "mod+shift+x", () => m("strikeThrough")),
			y("code", C("Code"), "mod+e", () => h("code")),
			/* @__PURE__ */ R("span", { className: "mx-0.5 h-4 w-px bg-white/15" }),
			y("link", C("Link"), "mod+k", g),
			o && /* @__PURE__ */ R("div", {
				className: "pointer-events-none absolute inset-0 opacity-0",
				"aria-hidden": !0,
				children: /* @__PURE__ */ R(N, {
					bare: !0,
					className: "h-full",
					fields: [x],
					values: { url: c },
					onChange: (e, t) => v(t ?? "")
				})
			})
		] })
	}), document.body);
}
// admin/src/core/slashKeys.ts
function tt(e, t, n) {
	return t >= 0 && t < e ? "choose" : n ? "wait" : "pass";
}
function nt(e, t) {
	return e > 0 ? "choose" : t ? "wait" : "release";
}
function rt(e, t) {
	return e && !t;
}
// admin/src/core/Inserter.tsx
var it = (e) => e.replace(/[-_]+/g, " ").replace(/(^|\s)\S/g, (e) => e.toUpperCase());
function at(e, t, n, r = !0) {
	let i = w("patterns/list", {}, { staleTime: 6e4 }), { catalog: a } = Oe();
	return {
		items: le(() => {
			let o = a?.categories ?? [], s = (e) => {
				let t = o.findIndex((t) => t.name === e);
				return t < 0 ? o.length : t;
			}, c = (e) => o.find((t) => t.name === e)?.label ?? it(e), l = t.trim().toLowerCase(), u = (e) => e.toLowerCase().includes(l), d = e.filter((e) => n ? n(e) : !e.parent).filter((e) => !l || u(e.title) || u(e.name) || (e.keywords ?? []).some(u)).sort((e, t) => s(e.category) - s(t.category) || (s(e.category) === o.length ? c(e.category).localeCompare(c(t.category)) : 0)), f = (e) => {
				let t = e.title.toLowerCase();
				return t === l ? 0 : t.startsWith(l) ? 1 : u(e.title) ? 2 : 3;
			}, p = (l ? [...d].sort((e, t) => f(e) - f(t)) : d).map((e) => ({
				kind: "block",
				type: e,
				group: l ? C("Blocks") : c(e.category)
			})), m = (t) => {
				let r = e.find((e) => e.name === t);
				return !!r && (n ? n(r) : !r.parent);
			}, h = (r ? i.data ?? [] : []).filter((e) => e.synced ? m("pattern") : e.blocks.length > 0 && e.blocks.every((e) => m(e.type))).filter((e) => !l || u(e.title) || u(e.category) || u(e.description)).sort((e, t) => Number(t.synced) - Number(e.synced)).map((e) => ({
				kind: "pattern",
				pattern: e,
				group: e.synced ? C("Components") : C("Sections")
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
function ot({ types: e, query: t, onQuery: n, onChoose: r, onClose: i, allowed: a, showSearch: o = !0, className: s, style: c, compact: l, chooseFirst: u, onNoMatch: d, patterns: f = !0, keyboardDocument: p }) {
	let { items: m, loading: h } = at(e, t, a, f), [g, _] = A(0), v = k(null);
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
		let e = nt(m.length, h);
		e !== "wait" && (b.current = !1, e === "choose" ? r(m[0]) : d?.());
	}, [m, h]), ce(() => {
		let e = (e) => {
			let { items: t, active: n, loading: a } = y.current;
			if (e.key === "ArrowDown") e.preventDefault(), _((e) => Math.min(t.length - 1, e + 1));
			else if (e.key === "ArrowUp") e.preventDefault(), _((e) => Math.max(0, e - 1));
			else if (e.key === "Enter") {
				let i = tt(t.length, n, a);
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
	return /* @__PURE__ */ z("div", {
		className: I("flex max-h-[min(420px,60vh)] w-[300px] flex-col", s),
		style: c,
		children: [o && /* @__PURE__ */ R("div", {
			className: "border-b border-border p-1.5",
			children: /* @__PURE__ */ R(N, {
				bare: !0,
				fields: [{
					handle: "query",
					type: "text",
					label: C("Search"),
					icon: "search",
					size: "sm",
					autofocus: !0,
					placeholder: C("Search blocks and components…")
				}],
				values: { query: t },
				onChange: (e, t) => n?.(t ?? "")
			})
		}), /* @__PURE__ */ z("div", {
			ref: v,
			className: "min-h-0 flex-1 overflow-y-auto p-1",
			children: [m.length === 0 && /* @__PURE__ */ R("div", {
				className: "px-3 py-6 text-center text-xs text-faint",
				children: C("No matching blocks")
			}), m.map((e, t) => {
				let n = e.group === x ? null : e.group;
				x = e.group;
				let i = e.kind === "block" ? e.type.title : e.pattern.title, a = e.kind === "block" ? e.type.description : e.pattern.description || (e.pattern.synced ? C("Component") : C("Section")), o = e.kind === "block" ? e.type.icon : e.pattern.synced ? "symbol" : "pattern";
				return /* @__PURE__ */ z("div", { children: [n && /* @__PURE__ */ R("div", {
					className: "cms-label px-2 pb-1 pt-2",
					children: n
				}), /* @__PURE__ */ z("button", {
					type: "button",
					"data-index": t,
					onMouseMove: () => t !== g && _(t),
					onMouseDown: (e) => e.preventDefault(),
					onClick: () => r(e),
					className: I("flex w-full items-center gap-2.5 rounded-sm px-2 text-left", l ? "h-8" : "py-1.5", t === g ? "bg-hover" : ""),
					children: [/* @__PURE__ */ R("span", {
						className: "grid size-7 shrink-0 place-items-center rounded-xs border border-border bg-surface text-muted",
						children: /* @__PURE__ */ R(P, {
							name: o,
							size: 14
						})
					}), /* @__PURE__ */ z("span", {
						className: "min-w-0",
						children: [/* @__PURE__ */ R("span", {
							className: "block truncate text-sm font-medium text-text",
							children: i
						}), !l && a && /* @__PURE__ */ R("span", {
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
function st(e, t) {
	let n = e.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 56) || "pattern", r = n;
	for (let e = 2; t.has(r); e++) r = `${n}-${e}`;
	return r;
}
function ct(e, r) {
	let i = e.selection().map((t) => n(e.get().nodes, t)).filter((e) => !!e);
	if (i.length === 0) return;
	let a = document.createElement("div");
	document.body.appendChild(a);
	let o = Te(a);
	function s() {
		let [n, s] = A(!0), [c, l] = A({
			title: "",
			category: "",
			description: "",
			synced: r
		}), { title: u, category: d, description: f, synced: p } = c, m = (e, t) => l((n) => ({
			...n,
			[e]: t ?? ""
		})), [h, g] = A(!1), _ = () => {
			s(!1), setTimeout(() => {
				o.unmount(), a.remove();
			}, 250);
		}, y = async () => {
			if (u.trim()) {
				g(!0);
				try {
					let n = await ee("patterns/list"), r = st(u, new Set(n.map((e) => e.handle)));
					await ee("patterns/save", {
						handle: r,
						title: u.trim(),
						description: f.trim(),
						category: d.trim() || void 0,
						synced: p,
						blocks: i
					}), v("patterns/"), p && e.replaceSelection([{
						id: t(),
						type: "pattern",
						props: { ref: r }
					}]), xe.success(C(p ? "“{title}” is now a component" : "Saved “{title}” as a section", { title: u.trim() })), _();
				} catch (e) {
					xe.error(e), g(!1);
				}
			}
		};
		return /* @__PURE__ */ R(ue, {
			open: n,
			onOpenChange: (e) => !e && _(),
			size: "sm",
			title: C(p ? "Make a Component" : "Save as a Section"),
			description: x(i.length, "{count} block, reusable on every page", "{count} blocks, reusable on every page"),
			footer: /* @__PURE__ */ z(Se, { children: [/* @__PURE__ */ R(M, {
				variant: "ghost",
				onClick: _,
				children: C("Cancel")
			}), /* @__PURE__ */ R(M, {
				variant: "primary",
				disabled: !u.trim(),
				loading: h,
				onClick: y,
				children: C(p ? "Make Component" : "Save Section")
			})] }),
			children: /* @__PURE__ */ z("form", {
				className: "grid gap-4",
				onSubmit: (e) => {
					e.preventDefault(), y();
				},
				children: [
					/* @__PURE__ */ R(N, {
						fields: [
							{
								handle: "title",
								type: "text",
								label: C("Name"),
								required: !0,
								autofocus: !0,
								max: 120,
								placeholder: C("Pricing Card")
							},
							{
								handle: "category",
								type: "text",
								label: C("Category"),
								max: 60,
								placeholder: C(p ? "Components" : "Sections")
							},
							{
								handle: "description",
								type: "text",
								label: C("Description"),
								max: 500,
								placeholder: C("When to Use It")
							}
						],
						values: c,
						onChange: m
					}),
					/* @__PURE__ */ R(N, {
						disabled: !r,
						fields: [{
							handle: "synced",
							type: "toggle",
							label: C(r ? "Keep Every Copy in Sync" : "Saved as a section: components can’t be placed here"),
							instructions: r ? C("Off: a section that is copied when inserted.") : void 0
						}],
						values: c,
						onChange: (e, t) => m(e, !!t)
					}),
					/* @__PURE__ */ R("button", {
						type: "submit",
						hidden: !0
					})
				]
			})
		});
	}
	o.render(/* @__PURE__ */ R(s, {}));
}
// admin/src/core/insertionTargets.ts
var lt = 4, ut = 6, dt = 16, ft = (e) => e.left + e.width, J = (e) => e.top + e.height, Y = (e, t) => t === "x" ? e.left + e.width / 2 : e.top + e.height / 2, pt = (e, t) => t === "x" ? e.left : e.top, mt = (e, t) => t === "x" ? ft(e) : J(e), ht = (e) => [
	e.left,
	e.top,
	e.width,
	e.height
].every(Number.isFinite) && e.width > 0 && e.height >= 0, gt = (e, t) => t.x >= e.left && t.x <= ft(e) && t.y >= e.top && t.y <= J(e);
function _t(e, t) {
	return Math.hypot(Math.max(e.left - t.x, 0, t.x - ft(e)), Math.max(e.top - t.y, 0, t.y - J(e)));
}
function vt(e, t) {
	return Math.min(J(e), J(t)) - Math.max(e.top, t.top) > 0 && Math.abs(Y(t, "x") - Y(e, "x")) > Math.abs(Y(t, "y") - Y(e, "y")) ? "x" : "y";
}
function yt(e, t, n) {
	let r = Math.min(J(e), J(t)) - Math.max(e.top, t.top), i = Math.min(ft(e), ft(t)) - Math.max(e.left, t.left);
	return n === "x" && r > 0 ? "x" : n === "y" && i > 0 ? "y" : vt(e, t);
}
function bt(e, t) {
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
function xt(e, t) {
	let { byId: n, depth: r, isExcluded: i } = bt(e, t.excludeIds), a = /* @__PURE__ */ new Map([[null, []]]);
	for (let t of e) {
		if (!ht(t.rect) || !t.container && t.rect.height === 0 || i(t)) continue;
		let e = a.get(t.parentId) ?? [];
		e.push(t), a.set(t.parentId, e), t.container && !a.has(t.id) && a.set(t.id, []);
	}
	let o = [];
	for (let [e, i] of a) {
		let a = e === null ? null : n.get(e), s = e === null ? t.rootRect : a?.rect;
		if (!s || !ht(s)) continue;
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
			let f = Math.sign(i - r), p = Math.min(Math.abs(i - r) / 2, lt), m = l === "from" ? r + f * p : l === "to" ? i - f * p : (r + i) / 2, h = Math.min(r, i), g = Math.abs(i - r), _ = n === "x" ? {
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
				width: Math.max(ft(e), ft(t)) - n,
				height: Math.max(J(e), J(t)) - r
			};
		}, m = c[0], h = c.at(-1), g = c.length > 1 ? yt(m.rect, c[1].rect, l) : l ?? "y", _ = c.length > 1 ? yt(c.at(-2).rect, h.rect, l) : l ?? "y", v = c.length < 2 || Y(c[1].rect, g) >= Y(m.rect, g), y = c.length < 2 || Y(h.rect, _) >= Y(c.at(-2).rect, _), b = v ? pt(m.rect, g) : mt(m.rect, g), x = y ? mt(h.rect, _) : pt(h.rect, _);
		f(m.index, g, v ? pt(s, g) : mt(s, g), b, g === "x" ? m.rect : s, m.rect, "edge", "to");
		for (let e = 1; e < c.length; e++) {
			let t = c[e - 1], n = c[e], r = yt(t.rect, n.rect, l), i = Y(n.rect, r) >= Y(t.rect, r), a = i ? mt(t.rect, r) : pt(t.rect, r), o = i ? pt(n.rect, r) : mt(n.rect, r), u = Math.max(t.rect.top, n.rect.top), d = Math.min(J(t.rect), J(n.rect)), m = r === "x" ? {
				left: s.left,
				top: u,
				width: s.width,
				height: Math.max(0, d - u)
			} : s, h = i ? o < a : o > a;
			f(n.index, r, h ? (a + o) / 2 : a, h ? (a + o) / 2 : o, m, r === "x" && m.height > 0 ? m : p(t.rect, n.rect), "between");
		}
		f(h.index + 1, _, x, y ? mt(s, _) : pt(s, _), _ === "x" ? h.rect : s, h.rect, "edge", "from");
	}
	return o;
}
function St(e, t, n) {
	if (![t.x, t.y].every(Number.isFinite)) return null;
	let r = xt(e, n).flatMap((e) => {
		if (e.inside) return [];
		let n = e.axis === "x", r = n ? t.x : t.y, i = n ? t.y : t.x, a = (n ? e.rect.left : e.rect.top) + 1, o = n ? e.hitRect.left : e.hitRect.top, s = n ? e.hitRect.width : e.hitRect.height, c = Math.max(0, ut - s / 2), l = Math.max(o - c, a - dt), u = Math.min(o + s + c, a + dt), d = n ? e.hitRect.top : e.hitRect.left, f = d + (n ? e.hitRect.height : e.hitRect.width);
		return r >= l && r <= u && i >= d && i <= f ? [{
			target: e,
			distance: Math.abs(r - a)
		}] : [];
	});
	if (!r.length) return null;
	let i = Math.min(...r.map((e) => e.distance));
	return r.filter((e) => e.distance <= i + 2).sort((e, t) => Number(e.target.kind === "edge") - Number(t.target.kind === "edge") || t.target.depth - e.target.depth || e.distance - t.distance)[0].target;
}
function Ct(e, t, n) {
	if (![t.x, t.y].every(Number.isFinite)) return null;
	let { isExcluded: r } = bt(e, n.excludeIds);
	return e.some((e) => r(e) && gt(e.rect, t)) ? null : xt(e, n).map((e) => ({
		target: e,
		distance: _t(e.inside ? e.hitRect : e.rect, t)
	})).filter(({ distance: e }) => e <= (n.maxDistance ?? 80)).sort((e, t) => e.distance - t.distance || t.target.depth - e.target.depth)[0]?.target ?? null;
}
// admin/src/core/QuickInserter.tsx
var wt = "cms:blocks:recent", Tt = [
	"paragraph",
	"heading",
	"image",
	"list",
	"button",
	"box"
], Et = 6, Dt = 9, Ot = 3;
function kt() {
	try {
		let e = JSON.parse(localStorage.getItem(wt) ?? "[]");
		return Array.isArray(e) ? e.filter((e) => typeof e == "string") : [];
	} catch {
		return [];
	}
}
function At(e) {
	if (e.kind === "block") try {
		localStorage.setItem(wt, JSON.stringify([e.type.name, ...kt().filter((t) => t !== e.type.name)].slice(0, 12)));
	} catch {}
}
function jt({ types: e, allowed: t, onChoose: n, onClose: r }) {
	let [i, a] = A(""), [o, s] = A(!1), [c, l] = A(0), { items: u } = at(e, i, t, !!i.trim()), d = le(() => {
		if (i.trim()) return u.slice(0, Dt);
		let e = [...kt(), ...Tt], t = (t) => {
			let n = t.kind === "block" ? e.indexOf(t.type.name) : -1;
			return n < 0 ? e.length : n;
		};
		return u.filter((e) => e.kind === "block").sort((e, n) => t(e) - t(n)).slice(0, Et);
	}, [u, i]);
	O(() => l(0), [i]);
	let f = (e) => {
		At(e), n(e);
	};
	return o ? /* @__PURE__ */ R("div", {
		"data-cms-insert-menu": !0,
		"data-cms-browse": !0,
		children: /* @__PURE__ */ R(ot, {
			types: e,
			query: i,
			onQuery: a,
			allowed: t,
			onChoose: f,
			onClose: r
		})
	}) : /* @__PURE__ */ z("div", {
		"data-cms-insert-menu": !0,
		className: "flex w-[300px] flex-col",
		onKeyDown: (e) => {
			let t = {
				ArrowRight: 1,
				ArrowLeft: -1,
				ArrowDown: Ot,
				ArrowUp: -3
			}[e.key];
			t && d.length ? (e.preventDefault(), l((e) => Math.max(0, Math.min(d.length - 1, e + t)))) : e.key === "Enter" && d[c] ? (e.preventDefault(), f(d[c])) : e.key === "Escape" && (e.preventDefault(), r());
		},
		children: [
			/* @__PURE__ */ R("div", {
				className: "p-2 pb-0",
				children: /* @__PURE__ */ R(N, {
					bare: !0,
					fields: [{
						handle: "query",
						type: "text",
						label: C("Search"),
						icon: "search",
						size: "sm",
						autofocus: !0,
						placeholder: C("Search blocks and components…")
					}],
					values: { query: i },
					onChange: (e, t) => a(t ?? "")
				})
			}),
			/* @__PURE__ */ z("div", {
				role: "listbox",
				"aria-label": i.trim() ? C("Results") : C("Suggestions"),
				className: "grid grid-cols-3 gap-1 p-2",
				children: [d.map((e, t) => {
					let n = e.kind === "block" ? e.type.title : e.pattern.title, r = e.kind === "block" ? e.type.icon : e.pattern.synced ? "symbol" : "pattern";
					return /* @__PURE__ */ z("button", {
						type: "button",
						role: "option",
						"aria-selected": t === c,
						"data-index": t,
						onMouseMove: () => t !== c && l(t),
						onMouseDown: (e) => e.preventDefault(),
						onClick: () => f(e),
						className: I("flex h-[68px] min-w-0 flex-col items-center justify-center gap-1.5 rounded-sm px-1 text-text", t === c && "bg-hover"),
						children: [/* @__PURE__ */ R(P, {
							name: r,
							size: 20
						}), /* @__PURE__ */ R("span", {
							className: "w-full truncate text-center text-xs font-medium",
							children: n
						})]
					}, e.kind === "block" ? e.type.name : `p-${e.pattern.handle}`);
				}), !d.length && /* @__PURE__ */ R("div", {
					className: "col-span-3 px-3 py-5 text-center text-xs text-faint",
					children: C("No matching blocks")
				})]
			}),
			/* @__PURE__ */ z("button", {
				type: "button",
				onMouseDown: (e) => e.preventDefault(),
				onClick: () => s(!0),
				className: "cms-focus-ring flex h-9 shrink-0 items-center justify-center gap-1.5 border-t border-border text-sm font-medium text-text hover:bg-hover",
				children: [C("Browse All"), /* @__PURE__ */ R(P, {
					name: "arrow-right",
					size: 14,
					className: "text-muted"
				})]
			})
		]
	});
}
// admin/src/core/morph.ts
function Mt(e, t) {
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
function Nt(e) {
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
var Pt = 32, Ft = 6, It = 4;
function Lt({ target: e, position: t, ...n }) {
	let r = t(e.rect);
	return /* @__PURE__ */ z(Se, { children: [/* @__PURE__ */ R("div", {
		"data-cms-insertion-line": !0,
		className: I("pointer-events-none absolute z-10 rounded-full bg-focus", e.axis === "x" ? "cms-block-line-y" : "cms-block-line-x"),
		style: {
			...r,
			minWidth: 2,
			minHeight: 2
		}
	}), /* @__PURE__ */ R(Bt, {
		...n,
		label: C("Add Block"),
		className: "cms-block-plus absolute size-6 -translate-x-1/2 -translate-y-1/2 rounded-xs bg-focus text-white shadow-sm",
		style: {
			left: r.left + r.width / 2,
			top: r.top + r.height / 2
		},
		data: { "data-cms-inserter": `${e.parentId ?? ""}:${e.index}` }
	})] });
}
function Rt({ target: e, position: t, ...n }) {
	let r = t(e.hitRect);
	return /* @__PURE__ */ R(Bt, {
		...n,
		label: C("Add Block"),
		className: "cms-block-chrome absolute size-7 -translate-x-1/2 -translate-y-1/2 rounded-sm border border-border-strong bg-bg text-muted shadow-sm hover:border-focus hover:text-focus",
		style: {
			left: r.left + r.width / 2,
			top: r.top + Math.min(r.height / 2, 40)
		},
		data: { "data-cms-appender": e.parentId ?? "" }
	});
}
function zt({ target: e, position: t, onWrite: n, ...r }) {
	let i = t(e.hitRect);
	return /* @__PURE__ */ z("div", {
		"data-cms-document-appender": !0,
		className: "cms-block-chrome pointer-events-auto absolute z-10 flex h-10 whitespace-nowrap -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-md border border-dashed border-border-strong bg-bg/90 py-1 pl-3 pr-1 shadow-sm",
		style: {
			left: i.left + i.width / 2,
			top: i.top + Math.max(24, Math.min(i.height / 2, 120))
		},
		children: [n && /* @__PURE__ */ R("button", {
			type: "button",
			onClick: n,
			className: "cms-focus-ring h-8 rounded-xs px-1 text-sm text-muted hover:text-text",
			children: C("Write, or press “/” for blocks")
		}), /* @__PURE__ */ R(Bt, {
			...r,
			label: C("Add Block"),
			className: "size-8 rounded-xs text-muted hover:bg-hover hover:text-text"
		})]
	});
}
function Bt({ open: e, onOpenChange: t, returnFocus: n, children: r, label: i, className: a, style: o, data: s }) {
	return /* @__PURE__ */ R(fe, {
		open: e,
		onOpenChange: t,
		side: "bottom",
		align: "center",
		className: "!overflow-hidden !p-0",
		returnFocus: n,
		trigger: /* @__PURE__ */ R("button", {
			type: "button",
			...s,
			"aria-label": e ? C("Close") : i,
			"aria-expanded": e,
			className: I("cms-focus-ring pointer-events-auto z-20 grid place-items-center", a),
			style: o,
			children: /* @__PURE__ */ R(P, {
				name: "plus",
				size: 14,
				className: I("cms-block-plus-icon", e && "rotate-45")
			})
		}),
		children: e && r
	});
}
function Vt({ id: e, label: t, icon: n, parent: r, box: i, viewport: a, canMoveUp: o, canMoveDown: s, onSelectParent: c, onDrag: l, onMove: u, onInsert: d, onDuplicate: f, onMakeComponent: p, onDelete: m, covers: h }) {
	let g = k(null), [_, v] = A(240);
	ce(() => {
		g.current && v(g.current.offsetWidth);
	});
	let y = i.top + i.height;
	if (y < 40 || i.top > a.height - Pt || i.left > a.width || i.left + i.width < 0) return null;
	let b = (e) => Math.max(It, Math.min(a.width - _ - It, e)), x = b(i.left), S = b(i.left + i.width - _), ee = i.top - Pt - Ft, w = y + Ft, T = Math.max(It, i.top + It), E = (e) => e >= It && e + Pt <= a.height - It, { left: D, top: te } = [
		ee,
		w,
		T
	].flatMap((e) => [{
		left: x,
		top: e
	}, {
		left: S,
		top: e
	}]).find((e) => E(e.top) && !h?.({
		...e,
		width: _,
		height: Pt
	})) ?? {
		left: x,
		top: E(ee) ? ee : T
	};
	return /* @__PURE__ */ z("div", {
		ref: g,
		"data-cms-block-controls": e,
		role: "toolbar",
		"aria-label": C("Block Actions"),
		className: "cms-block-chrome pointer-events-auto absolute z-30 flex h-8 items-center gap-0.5 rounded-sm border border-border bg-bg pl-0.5 pr-1 shadow-pop",
		style: {
			left: D,
			top: te
		},
		children: [
			/* @__PURE__ */ R("button", {
				type: "button",
				"aria-label": C("Drag to Move"),
				title: C("Drag to Move"),
				className: "cms-focus-ring grid h-6 w-4 touch-none cursor-grab place-items-center rounded-xs text-faint hover:bg-hover hover:text-muted active:cursor-grabbing",
				onPointerDown: l,
				children: /* @__PURE__ */ R(P, {
					name: "drag",
					size: 12
				})
			}),
			r && /* @__PURE__ */ R(_e, {
				content: C("Select {block}", { block: r.label }),
				children: /* @__PURE__ */ R(de, {
					size: "xs",
					icon: "b-arrow-elbow-left-up",
					label: C("Select {block}", { block: r.label }),
					onClick: c
				})
			}),
			/* @__PURE__ */ R("span", { className: "mx-0.5 h-4 border-l border-border" }),
			/* @__PURE__ */ z("span", {
				className: "flex h-6 max-w-40 items-center gap-1.5 px-1 text-xs font-medium text-text",
				children: [/* @__PURE__ */ R(P, {
					name: n,
					size: 14,
					className: "shrink-0 text-muted"
				}), /* @__PURE__ */ R("span", {
					className: "truncate",
					children: t
				})]
			}),
			/* @__PURE__ */ R(de, {
				size: "xs",
				icon: "chevron-up",
				label: C("Move Up"),
				disabled: !o,
				onClick: () => u(-1)
			}),
			/* @__PURE__ */ R(de, {
				size: "xs",
				icon: "chevron-down",
				label: C("Move Down"),
				disabled: !s,
				onClick: () => u(1)
			}),
			/* @__PURE__ */ R("span", { className: "mx-0.5 h-4 border-l border-border" }),
			/* @__PURE__ */ R(F, {
				align: "end",
				trigger: /* @__PURE__ */ R(de, {
					size: "xs",
					icon: "more",
					label: C("More Block Actions")
				}),
				items: [
					{
						label: C("Insert Before"),
						icon: "arrow-up",
						shortcut: "alt+mod+t",
						onSelect: () => d("before")
					},
					{
						label: C("Insert After"),
						icon: "arrow-down",
						shortcut: "alt+mod+y",
						onSelect: () => d("after")
					},
					{
						label: C("Duplicate"),
						icon: "duplicate",
						shortcut: "mod+d",
						onSelect: f
					},
					p && {
						label: C("Make a Component"),
						icon: "symbol",
						onSelect: p
					},
					{
						separator: !0,
						label: ""
					},
					{
						label: C("Delete"),
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
function Ht({ drag: e, position: t }) {
	return /* @__PURE__ */ z(Se, { children: [
		/* @__PURE__ */ R("div", {
			"data-cms-drag-overlay": !0,
			className: "pointer-events-auto absolute inset-0 z-30 cursor-grabbing touch-none"
		}),
		e.target && /* @__PURE__ */ R("div", {
			"data-cms-drop-indicator": !0,
			className: "pointer-events-none absolute z-40 rounded-full bg-focus",
			style: {
				...t(e.target.rect),
				minWidth: 2,
				minHeight: 2
			}
		}),
		/* @__PURE__ */ z("div", {
			"data-cms-drag-ghost": !0,
			className: "pointer-events-none fixed z-[80] flex max-w-56 items-center gap-2 truncate rounded-sm border border-border-strong bg-bg px-3 py-2 text-xs text-ink shadow-pop",
			style: {
				left: Math.max(8, Math.min(window.innerWidth - 232, e.point.x + 16)),
				top: Math.max(8, Math.min(window.innerHeight - 40, e.point.y + 16))
			},
			children: [/* @__PURE__ */ R(P, {
				name: "drag",
				size: 14
			}), /* @__PURE__ */ R("span", {
				className: "truncate",
				children: e.label
			})]
		})
	] });
}
// admin/src/builder/bus.ts
var Ut = new EventTarget(), Wt = {
	emit(e, t) {
		Ut.dispatchEvent(new CustomEvent(e, { detail: t }));
	},
	on(e, t) {
		let n = (e) => t(e.detail);
		return Ut.addEventListener(e, n), () => Ut.removeEventListener(e, n);
	}
}, Gt = ne({
	stops: () => [],
	settings: () => {},
	readOnly: !1
}), Kt = () => oe(Gt);
function qt(e = "") {
	return {
		id: t(),
		type: "paragraph",
		props: { text: e }
	};
}
function Jt(e, t, n, r) {
	return e.id === t && e.prop === n && (r === void 0 || e.index === r);
}
function Yt(e, t, n) {
	e.focus(t.id, n, t.prop, t.index);
}
function Xt(e, t, n) {
	if (!t) return;
	let r = /* @__PURE__ */ new Set(), i = (e) => {
		r.add(e.id), e.children?.forEach(i);
	};
	i(t);
	let a = n.find((e) => r.has(e.id));
	a ? Yt(e, a, "start") : e.select(t.id, !0);
}
function Zt(e) {
	let t = e.getElementById("f-title");
	return t ? (t.focus(), t.setSelectionRange(t.value.length, t.value.length), !0) : !1;
}
function Qt(e, t, n, r, i) {
	if (e.shiftKey || e.metaKey || e.ctrlKey || e.altKey) return !1;
	let a = e.key === "ArrowUp" && We(t) || e.key === "ArrowLeft" && Ve(t), o = e.key === "ArrowDown" && Ge(t) || e.key === "ArrowRight" && U(t);
	if (a) {
		let a = r[i - 1];
		if (a) Yt(n, a, "end");
		else if (e.key !== "ArrowUp" || !Zt(t.ownerDocument)) return !1;
		return e.preventDefault(), !0;
	}
	if (o) {
		let t = r[i + 1];
		return t ? (e.preventDefault(), Yt(n, t, "start"), !0) : !1;
	}
	return !1;
}
// admin/src/write/outline.ts
var $t = [
	"paragraph",
	"heading",
	"quote",
	"callout"
];
function en(e) {
	return e.kind === "actions" ? e.nodes : [e.node];
}
function tn(e) {
	return en(e)[0].id;
}
function nn(e, t, n) {
	let r = {
		types: t,
		custom: n
	}, i = [];
	for (let t of e) {
		let e = on(t, null, !1, r), n = e.kind === "container" || e.kind === "columns", a = i.at(-1);
		!n && a && !a.container ? cn(a.rows, e) : i.push({
			id: t.id,
			label: n && t.label?.trim() || null,
			rows: [e],
			container: n
		});
	}
	return i;
}
function rn(e) {
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
function an(e) {
	let t = [], n = (e) => {
		for (let r of e) if (t.push(r), r.kind === "columns") for (let e of r.columns) n(e.rows);
		else r.kind === "container" && n(r.rows);
	};
	for (let t of e) n(t.rows);
	return t;
}
function on(e, t, n, r) {
	let i = n || !!e.hidden, a = {
		parent: t,
		hidden: i
	}, o = r.types.get(e.type), s = r.custom(e.type), c = (e.children?.length ?? 0) > 0;
	return e.type === "columns" && o && !s ? {
		kind: "columns",
		node: e,
		columns: (e.children ?? []).map((e) => ({
			node: e,
			rows: sn(e.children ?? [], e.id, i || !!e.hidden, r)
		})),
		...a
	} : !s && o && !c && (e.type === "button" || e.type === "link") ? {
		kind: "actions",
		nodes: [e],
		...a
	} : o?.children || c ? {
		kind: "container",
		node: e,
		rows: sn(e.children ?? [], e.id, i, r),
		...a
	} : !o || s ? {
		kind: "block",
		node: e,
		...a
	} : $t.includes(e.type) ? {
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
function sn(e, t, n, r) {
	let i = [];
	for (let a of e) cn(i, on(a, t, n, r));
	return i;
}
function cn(e, t) {
	let n = e.at(-1);
	t.kind === "actions" && n?.kind === "actions" && n.parent === t.parent && n.hidden === t.hidden ? n.nodes.push(...t.nodes) : e.push(t);
}
// admin/src/write/slash.ts
var ln = null, un = /* @__PURE__ */ new Set();
function dn(e) {
	return ln?.id === e ? ln : null;
}
function fn(e) {
	JSON.stringify(e) !== JSON.stringify(ln) && (ln = e, un.forEach((e) => e()));
}
function pn() {
	return j((e) => (un.add(e), () => un.delete(e)), () => ln);
}
function mn(e, t = 360, n = 300) {
	let r = window.innerHeight - e.bottom - 6 - 8, i = e.top - 6 - 8, a = r >= Math.min(t, 220) || r >= i;
	return {
		left: Math.max(8, Math.min(window.innerWidth - n - 8, e.left - 4)),
		top: a ? e.bottom + 6 : void 0,
		bottom: a ? void 0 : window.innerHeight - e.top + 6,
		maxHeight: Math.max(120, Math.min(t, a ? r : i))
	};
}
function hn(e, t) {
	O(() => {
		if (!e) return;
		let n = (e) => !e.target?.closest?.("[data-cms-slash]") && fn(null), r = t.filter((e) => !!e);
		return r.forEach((e) => e.addEventListener("pointerdown", n, !0)), () => r.forEach((e) => e.removeEventListener("pointerdown", n, !0));
	}, [e, ...t]);
}
// admin/src/write/Text.tsx
var gn = {
	1: "text-[30px] leading-[38px] font-semibold tracking-[-0.02em]",
	2: "text-[24px] leading-[32px] font-semibold tracking-[-0.015em]",
	3: "text-[20px] leading-[28px] font-semibold tracking-[-0.01em]",
	4: "text-[17px] leading-[26px] font-semibold",
	5: "text-[16px] leading-[26px] font-semibold",
	6: "text-[13px] leading-[22px] font-semibold uppercase tracking-[0.04em] text-muted"
}, _n = "text-[16px] leading-[27px]", vn = {
	note: {
		icon: "info",
		className: "bg-surface",
		label: () => C("Note")
	},
	tip: {
		icon: "sparkle",
		className: "bg-success/7",
		label: () => C("Tip")
	},
	warning: {
		icon: "warning",
		className: "bg-warning/9",
		label: () => C("Warning")
	},
	danger: {
		icon: "error",
		className: "bg-danger/7",
		label: () => C("Danger")
	}
};
function yn({ node: e }) {
	if (e.type === "quote") return /* @__PURE__ */ z("blockquote", {
		className: "m-0 border-l-[3px] border-text/80 py-0.5 pl-4",
		children: [/* @__PURE__ */ R(Sn, {
			node: e,
			prop: "text",
			className: "text-[17px] leading-[28px]",
			placeholder: C("Quote")
		}), /* @__PURE__ */ R(Sn, {
			node: e,
			prop: "cite",
			className: "cms-block-cite mt-1 text-sm text-muted",
			placeholder: C("Attribution"),
			quiet: !0
		})]
	});
	if (e.type === "callout") return /* @__PURE__ */ R(xn, { node: e });
	if (e.type === "heading") {
		let t = String(e.props.level ?? 2);
		return /* @__PURE__ */ R(Sn, {
			node: e,
			prop: "text",
			tag: `h${t}`,
			className: gn[t] ?? gn[2],
			placeholder: C("Heading {level}", { level: t })
		});
	}
	return /* @__PURE__ */ R(bn, { node: e });
}
function bn({ node: e }) {
	let { store: t } = B(), n = V(t, (t) => t.nodes.length === 1 && t.nodes[0].id === e.id);
	return /* @__PURE__ */ R(Sn, {
		node: e,
		prop: "text",
		tag: "p",
		className: _n,
		placeholder: C("Write, or press “/” for blocks"),
		quiet: !n
	});
}
function xn({ node: e }) {
	let { store: t } = B(), { readOnly: n } = Kt(), r = vn[e.props.tone] ?? vn.note;
	return /* @__PURE__ */ z("div", {
		className: I("flex gap-3 rounded-md px-4 py-3", r.className),
		children: [/* @__PURE__ */ R(F, {
			align: "start",
			trigger: /* @__PURE__ */ R("button", {
				type: "button",
				disabled: n,
				"aria-label": C("Callout Style"),
				className: "grid h-[27px] w-5 shrink-0 place-items-center rounded-xs text-muted hover:text-text",
				children: /* @__PURE__ */ R(P, {
					name: r.icon,
					size: 17
				})
			}),
			items: Object.entries(vn).map(([n, r]) => ({
				label: r.label(),
				icon: r.icon,
				checked: n === (e.props.tone ?? "note"),
				onSelect: () => t.updateProps(e.id, { tone: n })
			}))
		}), /* @__PURE__ */ R(Sn, {
			node: e,
			prop: "text",
			className: I(_n, "min-w-0 flex-1"),
			placeholder: C("Write a note")
		})]
	});
}
function Sn({ node: e, prop: a, tag: s = "div", className: c, placeholder: l, quiet: u }) {
	let { store: d, types: f, allowed: _ } = B(), { stops: v, readOnly: y } = Kt(), b = V(d, (t) => t.focus?.id === e.id && (t.focus.prop ?? "text") === a ? t.focus : null), x = String(e.props[a] ?? ""), S = (t, n) => {
		if (e.type === "paragraph" && a === "text" && ee(t, n)) return;
		d.updateProps(e.id, { [a]: t }, `text:${e.id}:${a}`);
		let r = e.type === "paragraph" ? t.replace(/<[^>]+>/g, "").match(/^\/([\w-]*)$/) : null;
		fn(r ? {
			id: e.id,
			query: r[1]
		} : null);
	}, ee = (t, r) => {
		let a = t.replace(/&nbsp;/g, " "), o = (t, a, o) => {
			let s = i(d.get().nodes, e.id), c = s?.parentId ? n(d.get().nodes, s.parentId) : null;
			if (!f.has(t) || !m(c, t, f, c ? [] : _)) return !1;
			let l = Math.max(0, He(r) - Ye(o));
			return d.updateNode(e.id, {
				type: t,
				props: a
			}), d.focus(e.id, l, t === "list" ? "items" : "text", t === "list" ? 0 : void 0), !0;
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
			let t = qt(), { nodes: n } = d.get(), r = i(n, e.id);
			return d.commit(h(g(n, e.id, (e) => ({
				...e,
				type: "divider",
				props: {}
			})), r?.parentId ?? null, (r?.index ?? n.length) + 1, [t])), d.focus(t.id, "start"), !0;
		}
		return !1;
	}, C = (s, c) => {
		if (s.defaultPrevented) return;
		let l = v(), u = l.findIndex((t) => Jt(t, e.id, a)), m = l[u], { nodes: y } = d.get();
		if (s.key === "Enter" && !s.shiftKey && !s.metaKey && !s.ctrlKey && !s.altKey) {
			s.preventDefault();
			let n = dn(e.id);
			if (n && rt(!0, !!document.querySelector("[data-cms-slash]"))) return fn({
				...n,
				enter: !0
			});
			if (a === "cite") {
				let t = qt(), n = p(y, e.id, "paragraph", f, _);
				if (!n) return;
				d.insert(n.parentId, n.index, [t]), d.focus(t.id, "start");
				return;
			}
			let [o, l] = Ue(c);
			if (r(o) && !r(l)) {
				let t = i(y, e.id);
				if (!t) return;
				d.insert(t.parentId, t.index, [qt()]), d.focus(e.id, "start");
				return;
			}
			let u = e.type === "paragraph" ? {
				id: t(),
				type: "paragraph",
				props: {
					...e.props,
					text: l
				},
				...e.style ? { style: structuredClone(e.style) } : {},
				...e.class ? { class: e.class } : {}
			} : qt(l), m = p(y, e.id, "paragraph", f, _);
			if (!m) return;
			d.commit(h(g(y, e.id, (e) => ({
				...e,
				props: {
					...e.props,
					[a]: o
				}
			})), m.parentId, m.index, [u])), d.focus(u.id, "start");
		} else if (s.key === "Backspace" && Ve(c)) {
			if (a === "cite") {
				r(x) && (s.preventDefault(), d.focus(e.id, "end", "text"));
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
			if (s.preventDefault(), r(x)) {
				d.remove(e.id), Yt(d, t, "end");
				return;
			}
			if (t.parent === m?.parent && w(t, x)) return;
			Yt(d, t, "end");
		} else if (s.key === "Delete" && U(c) && a === "text") {
			let t = l[u + 1], r = t && t.prop === "text" && t.parent === m?.parent ? n(y, t.id) : null;
			if (!r || !["paragraph", "heading"].includes(r.type)) return;
			s.preventDefault();
			let i = Ye(x);
			d.commit(o(g(y, e.id, (e) => ({
				...e,
				props: {
					...e.props,
					text: x + String(r.props.text ?? "")
				}
			})), r.id)), d.focus(e.id, i);
		} else Qt(s, c, d, l, u) || s.key === "Escape" && (s.preventDefault(), c.blur(), d.select(e.id, !0));
	}, w = (t, r) => {
		let { nodes: i } = d.get(), a = n(i, t.id);
		if (!a) return !1;
		if (t.prop === "items") {
			let n = [...a.props.items ?? [""]], s = n[t.index ?? 0] ?? "";
			return n[t.index ?? 0] = s + r, d.commit(o(g(i, a.id, (e) => ({
				...e,
				props: {
					...e.props,
					items: n
				}
			})), e.id)), Yt(d, t, Ye(s)), !0;
		}
		if (t.prop !== "text" || ![
			"paragraph",
			"heading",
			"quote",
			"callout"
		].includes(a.type)) return !1;
		let s = String(a.props.text ?? "");
		return d.commit(o(g(i, a.id, (e) => ({
			...e,
			props: {
				...e.props,
				text: s + r
			}
		})), e.id)), Yt(d, t, Ye(s)), !0;
	};
	return /* @__PURE__ */ R(Ze, {
		tag: s,
		html: x,
		onChange: S,
		placeholder: l,
		quiet: u,
		className: c,
		focus: b,
		disabled: y,
		onKeyDown: C,
		onFocus: () => d.get().selected !== e.id && d.select(e.id),
		onPaste: (t) => !t.includes("\n") || a !== "text" ? !1 : (import("./paste-ZLnOxzO2.js").then((n) => n.pasteMarkdown(d, e, t, f, _)), !0)
	});
}
function Cn({ node: e, renderItem: t }) {
	let { store: n, types: a, allowed: s } = B(), { stops: c, readOnly: l } = Kt(), u = Array.isArray(e.props.items) && e.props.items.length ? e.props.items : [""], d = V(n, (t) => t.focus?.id === e.id && t.focus.prop === "items" ? t.focus : null), f = !!e.props.ordered, m = (t, r = `list:${e.id}`) => n.updateProps(e.id, { items: t }, r), _ = (t) => (l, d) => {
		if (l.defaultPrevented) return;
		let { nodes: f } = n.get(), _ = c(), v = _.findIndex((n) => Jt(n, e.id, "items", t));
		if (l.key === "Enter" && !l.shiftKey && !l.metaKey && !l.ctrlKey) {
			if (l.preventDefault(), r(u[t]) && t === u.length - 1) {
				let t = qt(), r = u.slice(0, -1), i = p(f, e.id, "paragraph", a, s);
				if (!i) return;
				let c = r.length ? g(f, e.id, (e) => ({
					...e,
					props: {
						...e.props,
						items: r
					}
				})) : f, l = h(c, i.parentId, i.index, [t]);
				n.commit(r.length ? l : o(l, e.id)), n.focus(t.id, "start");
				return;
			}
			let [i, c] = Ue(d);
			m([
				...u.slice(0, t),
				i,
				c,
				...u.slice(t + 1)
			], ""), n.focus(e.id, "start", "items", t + 1);
		} else if (l.key === "Backspace" && Ve(d)) {
			if (l.preventDefault(), t === 0) {
				let t = qt(u[0]), r = i(f, e.id), a = u.slice(1), s = h(f, r?.parentId ?? null, r?.index ?? 0, [t]);
				s = a.length ? g(s, e.id, (e) => ({
					...e,
					props: {
						...e.props,
						items: a
					}
				})) : o(s, e.id), n.commit(s), n.focus(t.id, "start");
				return;
			}
			m([
				...u.slice(0, t - 1),
				u[t - 1] + u[t],
				...u.slice(t + 1)
			], ""), n.focus(e.id, Ye(u[t - 1]), "items", t - 1);
		} else Qt(l, d, n, _, v) || l.key === "Escape" && (l.preventDefault(), d.blur(), n.select(e.id, !0));
	}, v = (r, i) => /* @__PURE__ */ R(Ze, {
		html: r,
		className: t ? void 0 : "min-w-0 flex-1 pl-1",
		tag: t ? "span" : "div",
		placeholder: C("List"),
		quiet: !0,
		disabled: l,
		focus: d && (d.index ?? 0) === i ? d : null,
		onChange: (e) => m(u.map((t, n) => n === i ? e : t)),
		onKeyDown: _(i),
		onFocus: () => n.get().selected !== e.id && n.select(e.id)
	});
	return t ? /* @__PURE__ */ R(Se, { children: u.map((e, n) => t(n, v(e, n))) }) : /* @__PURE__ */ R("div", {
		className: I(_n, "space-y-0.5"),
		children: u.map((e, t) => /* @__PURE__ */ z("div", {
			className: "flex",
			children: [/* @__PURE__ */ R("span", {
				className: I("w-6 shrink-0 select-none text-muted", f ? "pr-1.5 text-right tabular-nums" : "pl-1.5"),
				"aria-hidden": !0,
				children: f ? `${t + 1}.` : "•"
			}), v(e, t)]
		}, t))
	});
}
// admin/src/LiveEditor.tsx
var wn = (e, t, n) => e.axis === "x" ? {
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
}, Tn = (e) => `${e.parentId ?? ""}:${e.index}:${e.inside ? "inside" : e.axis}`, En = "\nhtml{scrollbar-width:thin;scrollbar-color:rgb(127 127 127/.35) transparent}\n[data-cms-document][data-cms-node]{cursor:default}\n.cms-block-text{display:block;min-width:1ch;min-height:1lh;white-space:pre-wrap;overflow-wrap:break-word;outline:none;border-radius:0;font:inherit;color:inherit;line-height:inherit;text-align:inherit;cursor:text}\n.cms-block-text:empty::before{content:attr(data-placeholder);opacity:.4;pointer-events:none}\n.cms-block-text[data-quiet]:empty:not(:focus)::before{content:none}\n[data-cms-prop]{cursor:text}\n.cms-block-text::selection,.cms-block-text ::selection{background:rgb(0 122 255/.2)}\nimg,a{-webkit-user-drag:none}\n[data-cms-conditional=hidden]:not([data-cms-reveal]){display:none!important}\n[data-cms-editor-empty-root]{visibility:hidden}\n.cms-js [data-cms-appear]{visibility:visible!important}\n", Dn = /* @__PURE__ */ new Set([
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
function On(e, t, n) {
	let r = e.elementFromPoint(t, n);
	if (!r || r === e.body || r === e.documentElement) return !1;
	if (Dn.has(r.tagName) || r.closest("svg")) return !0;
	let i = [...r.childNodes].filter((e) => e.nodeType === Node.TEXT_NODE && e.textContent?.trim());
	if (!i.length) return !1;
	let a = e.createRange();
	return i.some((e) => (a.selectNodeContents(e), [...a.getClientRects()].some((e) => t >= e.left - 2 && t <= e.right + 2 && n >= e.top - 2 && n <= e.bottom + 2)));
}
function kn(e) {
	let t = parseFloat(e ?? "");
	return Number.isNaN(t) ? 0 : /r?em$/.test(e ?? "") ? t * 16 : t;
}
function An({ collection: e, entryId: t, content: r, onInspect: o, standalone: l, onTitleChange: f }) {
	let { store: h, types: g, allowed: v, fieldHandle: b, readOnly: S = !1 } = B(), ee = ke(), w = V(h, (e) => e.nodes), T = V(h, (e) => e.selected), E = V(h, Fe), te = V(h, (e) => e.blockMode), ne = V(h, (e) => e.hovered), re = V(h, (e) => e.breakpoint), { breakpoints: ie } = je(), oe = kn(ie.lg) || 1024, se = k(null), j = k(null), [M, ue] = A(null), N = k(""), [P, de] = A([]), [F, fe] = A(!0), [me, ge] = A(null), [_e, I] = A(0), [L, ve] = A({
		width: 1024,
		height: 700,
		scale: 1,
		left: 0
	}), [ye, be] = A([]), [xe, Ce] = A(null), [Te, Ee] = A([]), [De, Oe] = A(null), Me = k(0), Ne = k(""), [Pe, Ie] = A(!1), [Le, Re] = A(!1), ze = k(!1), H = k(null), Be = le(() => {
		let e = [], t = (n, r) => n.forEach((n, i) => {
			e.push({
				node: n,
				parentId: r,
				index: i
			}), n.children && t(n.children, n.id);
		});
		return t(w, null), e;
	}, [w]), Ve = k(Be);
	Ve.current = Be;
	let [U, W] = A(null), He = k(U);
	He.current = U;
	let Ue = k(null);
	O(() => {
		U || (Ue.current = null);
	}, [U]);
	let We = k(0), Ge = k({
		busy: !1,
		queued: !1,
		timer: 0,
		alive: !0
	}), Ke = k(async () => {}), qe = () => {
		let e = Ge.current;
		e.queued = !0, !(!e.alive || e.busy || e.timer) && (e.timer = window.setTimeout(() => {
			e.timer = 0, Ke.current();
		}, N.current ? 80 : 0));
	}, Je = () => Ve.current.map(({ node: e, parentId: t, index: n }) => `${t}:${n}:${e.id}:${e.type}:${e.type === "list" ? e.props.items?.length ?? 0 : ""}`).join("|"), Ye = k(null), G = k({
		content: r,
		onInspect: o,
		readOnly: S,
		layout: L,
		onTitleChange: f
	});
	G.current = {
		content: r,
		onInspect: o,
		readOnly: S,
		layout: L,
		onTitleChange: f
	};
	let K = (e, t) => e.querySelector(`[data-cms-document="${N.current}"][data-cms-node="${CSS.escape(t)}"]`) ?? e.querySelector(`[data-cms-proto-document="${N.current}"][data-cms-proto="${CSS.escape(t)}"]`), Xe = (e) => {
		let t = "[data-cms-document][data-cms-node],[data-cms-proto-document][data-cms-proto]", r = e?.closest?.(t) ?? null;
		for (; r;) {
			let e = r.dataset.cmsDocument === N.current ? r.dataset.cmsNode : r.dataset.cmsProtoDocument === N.current ? r.dataset.cmsProto : void 0;
			if (e && n(h.get().nodes, e)) return e;
			r = r.parentElement?.closest(t) ?? null;
		}
		return null;
	}, q = (e) => {
		if (e.ownerDocument.defaultView?.getComputedStyle(e).display !== "contents") return e.getBoundingClientRect();
		let t = e.ownerDocument.createRange();
		return t.selectNodeContents(e), t.getBoundingClientRect();
	}, Ze = () => {
		if (H.current) return H.current;
		let e = j.current?.contentDocument, t = e?.querySelector(`[data-cms-editor-root="${N.current}"]`);
		if (!e || !t) return null;
		let n = (t) => {
			let n = e.defaultView.getComputedStyle(t);
			return n.display.includes("flex") && n.flexDirection.startsWith("row") || n.display.includes("grid") && n.gridTemplateColumns.split(" ").length > 1 ? "x" : "y";
		}, r = new Map([...e.querySelectorAll(`[data-cms-document="${N.current}"][data-cms-node]`)].map((e) => [e.dataset.cmsNode, e])), i = Ve.current.flatMap(({ node: t, parentId: i, index: a }) => {
			let o = r.get(t.id);
			return !o || e.defaultView.getComputedStyle(o).display === "none" ? [] : [{
				id: t.id,
				parentId: i,
				index: a,
				rect: q(o),
				container: !!g.get(t.type)?.children && !["repeat", "pattern"].includes(t.type),
				axis: n(o)
			}];
		}), a = q(t);
		return a.width === 0 && (a = q(t.parentElement ?? e.body)), i.length || (a = {
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
	}, Qe = (e, t = ["paragraph"]) => {
		let r = e ? n(h.get().nodes, e) : null;
		return t.every((e) => m(r, e, g, r ? [] : v));
	}, $e = (e) => [...g.values()].some((t) => Qe(e, [t.name])), tt = () => {
		let e = /* @__PURE__ */ new Map();
		return (t) => e.get(t) ?? e.set(t, $e(t)).get(t);
	}, nt = () => {
		let e = j.current?.contentDocument, t = Ze();
		if (!e || !t) return;
		be(Fe(h.get()).flatMap((t) => {
			let n = K(e, t);
			return n ? [q(n)] : [];
		}));
		let n = h.get().hovered, r = n ? K(e, n) : null;
		Ce(r ? q(r) : null);
		let i = xt(t.blocks, {
			rootRect: t.rootRect,
			canInsert: tt()
		});
		Ee(i), W((t) => {
			if (!t) return t;
			let n = Ue.current?.key === Tn(t) ? Ue.current : null, r = n ? K(e, n.id) : null, a = n ? r ? wn(t, q(r), n.side) : t : i.find((e) => Tn(e) === Tn(t)) ?? t, o = a.inside ? a.hitRect.top : a.rect.top;
			return o < 0 || o > G.current.layout.height ? null : a;
		});
	}, rt = (e) => {
		let t = e ? Tn(e) : "";
		t !== Ne.current && (Ne.current = t, clearTimeout(Me.current), Oe(null), e && (Me.current = window.setTimeout(() => Oe(e), 80)));
	}, it = (e) => {
		let t = Fe(h.get()), n = t.length ? i(h.get().nodes, e === "before" ? t[0] : t.at(-1)) : null, r = j.current?.contentDocument;
		if (!n || !r || G.current.readOnly || !$e(n.parentId)) return;
		let a = e === "before" ? n.index : n.index + 1, o = K(r, e === "before" ? t[0] : t.at(-1)), s = o ? q(o) : null, c = r.defaultView, l = G.current.layout.height;
		if (s) {
			let t = e === "before" ? s.top : s.top + s.height;
			(t < 48 || t > l - 160) && c.scrollBy(0, t - l / 3);
		}
		requestAnimationFrame(() => {
			H.current = null;
			let r = Ze(), i = o ? q(o) : null;
			if (!i) return;
			let s = wn((r && xt(r.blocks, {
				rootRect: r.rootRect,
				canInsert: tt()
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
			Ue.current = {
				key: Tn(s),
				id: e === "before" ? t[0] : t.at(-1),
				side: e
			}, rt(null), W(s);
		});
	}, at = () => {
		let e = M?.activeElement;
		if (document.activeElement === j.current && e?.isContentEditable) return e;
		let t = h.get().focus;
		return (t && M ? K(M, t.id) : null)?.querySelector("[data-cms-inline]") ?? null;
	}, ot = (e) => {
		H.current = null;
		let t = [];
		if (G.current.onTitleChange) for (let t of e.querySelectorAll("[data-cms-entry-field=\"title\"]")) t.querySelector("[data-cms-inline]") || t.replaceChildren();
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
		de(t), requestAnimationFrame(nt);
	}, st = () => {
		let e = j.current?.contentDocument, t = e?.querySelector("[data-cms-editor-root]");
		if (!e || !t || !N.current) return;
		let n = new Set(c(h.get().nodes).map(({ node: e }) => e.id));
		for (let t of e.querySelectorAll("[data-cms-document][data-cms-node]")) t.dataset.cmsDocument === N.current && !n.has(t.dataset.cmsNode) && t.remove();
		let r = (t, n) => {
			for (let i = 0; i < t.length; i++) {
				let a = t[i], o = K(e, a.id);
				if (!o || o.dataset.cmsType !== a.type) {
					let r = e.querySelector(`template[data-cms-prototype="${CSS.escape(a.type)}"]`)?.content.firstElementChild?.cloneNode(!0);
					if (!r) continue;
					if (r.dataset.cmsNode = a.id, r.dataset.cmsDocument = N.current, o) o.replaceWith(r);
					else {
						let a = t.slice(i + 1).map((t) => K(e, t.id)).find(Boolean), o = t.slice(0, i).reverse().map((t) => K(e, t.id)).find(Boolean);
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
		h.get().nodes.length && t.querySelector(":scope > [data-cms-editor-empty-root]")?.remove(), r(h.get().nodes, t), ot(e);
	}, lt = le(() => ({
		stops: () => rn(nn(h.get().nodes, g, () => !1)).filter((e) => P.some((t) => t.id === e.id && t.prop === e.prop && (e.index === void 0 || t.index === e.index))),
		settings: (e) => G.current.onInspect(e),
		readOnly: S
	}), [
		h,
		g,
		P,
		S
	]), ut = k(lt);
	ut.current = lt, ce(() => {
		H.current = null, st();
	}, [w, M]), ce(() => {
		if (!se.current) return;
		let e = () => {
			let e = se.current, t = Math.max(e.clientWidth, oe), n = re === "tablet" ? 820 : re === "mobile" ? Math.min(390, e.clientWidth) : t, r = Math.min(1, e.clientWidth / n);
			H.current = null, ve({
				width: n,
				scale: r,
				height: e.clientHeight / r,
				left: Math.max(0, (e.clientWidth - n * r) / 2)
			});
		};
		e();
		let t = new ResizeObserver(e);
		return t.observe(se.current), () => t.disconnect();
	}, [re, oe]), O(() => {
		requestAnimationFrame(nt);
	}, [
		T,
		E,
		ne,
		L,
		M
	]), Ke.current = async () => {
		let n = Ge.current;
		n.queued = !1, n.busy = !0;
		let i = We.current, a = Je(), o = new AbortController();
		Ye.current = o;
		try {
			let s = await fetch(t ? `/__preview/${t}` : "/__preview", {
				method: "POST",
				credentials: "same-origin",
				signal: o.signal,
				headers: {
					"Content-Type": "application/json",
					Accept: "text/html",
					"X-XSRF-TOKEN": D() ?? "",
					"X-Cms-Locale": y()
				},
				body: JSON.stringify({
					...r,
					collection: e,
					field: b,
					standalone: l,
					data: {
						...r.data,
						[b]: h.get().nodes
					},
					play: !1
				})
			}), c = await s.text();
			if (!s.ok) throw Error(s.status === 422 ? c.replace(/<[^>]+>/g, "").trim() : C("Preview failed ({status})", { status: s.status }));
			if (!n.alive || o.signal.aborted || i !== We.current && a !== Je()) return;
			let u = s.headers.get("X-Cms-Editor-Document");
			if (!u) throw Error(C("The editor could not load its rendering context."));
			let d = new DOMParser().parseFromString(c, "text/html");
			if (!d.querySelector(`[data-cms-editor-root="${u}"]`)) throw Error(C("This template has no content outlet. Choose a template that includes the content field."));
			d.querySelectorAll("script").forEach((e) => {
				e.type = "text/cms-off", e.removeAttribute("src");
			}), N.current = u;
			let f = j.current?.contentDocument;
			f?.documentElement?.hasAttribute("data-cms-bridge-ready") ? (Mt(f, d), f.documentElement.setAttribute("data-cms-bridge-ready", ""), ot(f)) : j.current && (j.current.srcdoc = d.documentElement.outerHTML), i === We.current && ge(null);
		} catch (e) {
			!o.signal.aborted && i === We.current && (ge(e instanceof Error ? e.message : String(e)), fe(!1));
		} finally {
			n.busy = !1, n.queued && qe();
		}
	}, O(() => {
		We.current++, qe();
	}, [
		t,
		e,
		r,
		w,
		b,
		l,
		_e
	]), O(() => (Ge.current.alive = !0, Ge.current.queued && qe(), () => {
		Ge.current.alive = !1, clearTimeout(Ge.current.timer), Ge.current.timer = 0, Ye.current?.abort();
	}), []);
	let dt = (e, t) => {
		let n = u(e, g);
		n.length && !S && Qe(t.parentId, n.map((e) => e.type)) && (h.insert(t.parentId, t.index, n), Xt(h, n[0], rn(nn(h.get().nodes, g, () => !1))), W(null), rt(null));
	}, ft = () => {
		if (G.current.readOnly || !Qe(null)) return;
		let e = qt();
		h.insert(null, 0, [e]), h.focus(e.id, "start");
	}, J = () => {
		let e = j.current?.contentDocument;
		return e ? Ve.current.filter(({ node: t }) => {
			let n = K(e, t.id);
			return !!n && e.defaultView.getComputedStyle(n).display !== "none";
		}).map(({ node: e }) => e.id) : [];
	}, Y = (e) => {
		if (!e) return;
		h.select(e, !0);
		let t = j.current?.contentDocument;
		(t && K(t, e))?.scrollIntoView({ block: "nearest" });
	}, pt = (e) => {
		let t = e.metaKey || e.ctrlKey, r = Fe(h.get()), i = h.get().selected;
		if (e.key === "Escape") {
			h.select(null);
			return;
		}
		if (!i || !h.get().blockMode) return;
		let a = J(), o = a.indexOf(h.get().head ?? i);
		if (["ArrowUp", "ArrowDown"].includes(e.key)) {
			e.preventDefault();
			let t = e.key === "ArrowUp";
			e.altKey ? h.nudgeSelection(t ? -1 : 1) : e.shiftKey ? h.extend(t ? -1 : 1) : Y(a[o + (t ? -1 : 1)]);
		} else if (e.key === "Enter") {
			e.preventDefault();
			let t = n(h.get().nodes, i), r = ut.current.stops(), a = t ? new Set(c([t]).map((e) => e.node.id)) : /* @__PURE__ */ new Set();
			r.some((e) => a.has(e.id)) ? Xt(h, t, r) : G.current.onInspect(i);
		} else if (e.key === "Backspace" || e.key === "Delete") {
			e.preventDefault();
			let t = new Set(r.flatMap((e) => {
				let t = n(h.get().nodes, e);
				return t ? c([t]).map((e) => e.node.id) : [];
			})), i = a.findIndex((e) => t.has(e)), o = a.slice(0, Math.max(0, i)).reverse().find((e) => !t.has(e)) ?? a.slice(i + 1).find((e) => !t.has(e));
			h.removeSelection(), Y(o);
		} else t && e.key.toLowerCase() === "d" && (e.preventDefault(), h.duplicateSelection());
	}, mt = () => {
		let e = j.current?.contentDocument;
		if (!e || !N.current) return;
		if (!e.querySelector("[data-cms-editor-root]")) {
			fe(!1), ge(C("This template has no content outlet. Choose a template that includes the content field."));
			return;
		}
		e.documentElement.setAttribute("data-cms-bridge-ready", "");
		let t = e.createElement("style");
		t.dataset.cmsBridge = "", t.textContent = En, e.head.appendChild(t), ue(e), ot(e), fe(!1), e.addEventListener("submit", (e) => e.preventDefault(), !0), e.addEventListener("dragstart", (e) => e.preventDefault()), e.addEventListener("focusout", (e) => {
			e.target.isContentEditable && Ie(!1), qe();
		}), e.addEventListener("focusin", (e) => {
			let t = e.target;
			if (!t.isContentEditable) return;
			Ie(!0);
			let n = t.closest("[data-cms-instance-node],[data-cms-document][data-cms-node]");
			h.select(n?.dataset.cmsInstanceNode ?? n?.dataset.cmsNode ?? null), h.hover(null);
		}), e.addEventListener("pointermove", (e) => {
			if (G.current.readOnly || (ze.current && (e.movementX || e.movementY) && (ze.current = !1, Re(!1)), h.hover(Xe(e.target)), ze.current || He.current)) return;
			let t = Ze();
			rt(t && St(t.blocks, {
				x: e.clientX,
				y: e.clientY
			}, {
				rootRect: t.rootRect,
				canInsert: tt()
			}));
		}), e.addEventListener("pointerdown", () => {
			W(null), rt(null);
		}), e.addEventListener("click", (e) => {
			let t = e.target;
			if (t.closest("[contenteditable=\"true\"]")) {
				t.closest("a") && e.preventDefault();
				return;
			}
			e.preventDefault();
			let n = Xe(t);
			n ? e.shiftKey && h.get().selected ? h.extendTo(n) : G.current.onInspect(n) : e.shiftKey || h.select(null);
		}, !0), e.addEventListener("keydown", (t) => {
			if (t.defaultPrevented) return;
			let r = t.metaKey || t.ctrlKey;
			if (r && [
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
			else if (!G.current.readOnly) {
				if (r && t.key.toLowerCase() === "z") {
					if (e.activeElement?.closest("[data-cms-entry-field]")) return;
					t.preventDefault();
					let r = e.activeElement, i = r?.closest("[data-cms-prop]"), a = r?.closest("[data-cms-instance-prop]"), o = i?.closest("[data-cms-node]");
					r?.blur(), t.shiftKey ? h.redo() : h.undo(), o?.dataset.cmsNode && i?.dataset.cmsProp && n(h.get().nodes, o.dataset.cmsNode) ? h.focus(o.dataset.cmsNode, "end", i.dataset.cmsProp, i.dataset.cmsIndex === void 0 ? void 0 : Number(i.dataset.cmsIndex)) : a?.dataset.cmsInstanceNode && n(h.get().nodes, a.dataset.cmsInstanceNode) && h.focus(a.dataset.cmsInstanceNode, "end", `values.${a.dataset.cmsInstanceProp}`);
				} else r && t.altKey && (t.code === "KeyT" || t.code === "KeyY") ? (t.preventDefault(), it(t.code === "KeyT" ? "before" : "after")) : t.target.isContentEditable ? r || t.altKey || t.key.length !== 1 && ![
					"Backspace",
					"Delete",
					"Enter"
				].includes(t.key) || (ze.current = !0, Re(!0), rt(null)) : pt(t);
			}
		});
		let r = (e) => h.get().blockMode && !!h.get().selected && !e.target.isContentEditable, i = (e, t) => {
			if (!r(e) || !e.clipboardData) return;
			let i = Fe(h.get()).map((e) => n(h.get().nodes, e)).filter(Boolean);
			i.length && (e.preventDefault(), e.clipboardData.setData("text/plain", "cms-blocks:" + JSON.stringify(i)), t && !G.current.readOnly && h.removeSelection());
		};
		e.addEventListener("copy", (e) => i(e, !1)), e.addEventListener("cut", (e) => i(e, !0)), e.addEventListener("paste", (e) => {
			let t = e.clipboardData?.getData("text/plain") ?? "";
			if (!r(e) || G.current.readOnly || !t.startsWith("cms-blocks:")) return;
			e.preventDefault();
			let n;
			try {
				n = JSON.parse(t.slice(12)).map(d);
			} catch {
				return;
			}
			let i = h.get().nodes, a = p(i, Fe(h.get()).at(-1), n.map((e) => e.type), g, v);
			a && n.length && (h.insert(a.parentId, a.index, n), h.select(n[0].id, !0), n.length > 1 && h.extendTo(n.at(-1).id));
		});
		let a = 0;
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
			we(() => {
				rt(null), nt();
			}), clearTimeout(a), a = window.setTimeout(() => {
				H.current = null, nt();
			}, 150);
		}, { passive: !0 }), e.defaultView?.addEventListener("resize", () => {
			H.current = null, requestAnimationFrame(nt);
		}), e.querySelectorAll("img,link[rel=\"stylesheet\"]").forEach((e) => e.addEventListener("load", () => {
			H.current = null, requestAnimationFrame(nt);
		}, { once: !0 })), e.fonts.ready.then(() => {
			H.current = null, nt();
		});
	};
	O(() => Wt.on("scroll-to", ({ node: e }) => {
		let t = j.current?.contentDocument, n = t && K(t, e);
		n && n.scrollIntoView({
			block: "center",
			behavior: "smooth"
		});
	}), []), O(() => {
		let e = j.current?.contentDocument;
		if (e) {
			e.querySelectorAll("[data-cms-reveal]").forEach((e) => e.removeAttribute("data-cms-reveal"));
			for (let t of E) {
				let n = K(e, t);
				for (; n;) n.dataset.cmsConditional === "hidden" && (n.dataset.cmsReveal = ""), n = n.parentElement;
			}
		}
	}, [E]);
	let ht = Nt({
		disabled: S,
		frame: j,
		scale: L.scale,
		invalidate: () => {
			H.current = null, nt();
		},
		target: (e, t) => {
			let r = Ze();
			if (!r || e.x < r.rootRect.left || e.x > r.rootRect.left + r.rootRect.width || e.y < r.rootRect.top - 12 || e.y > r.rootRect.top + r.rootRect.height + 12) return null;
			let i = t.map((e) => n(h.get().nodes, e));
			if (i.some((e) => !e)) return null;
			let a = i.map((e) => e.type);
			return Ct(r.blocks, e, {
				rootRect: r.rootRect,
				maxDistance: Infinity,
				excludeIds: new Set(t),
				canInsert: (e) => Qe(e, a)
			});
		},
		commit: (e, t) => h.moveTo(e, t.parentId, t.index)
	}), gt = (e) => {
		let t = j.current?.contentDocument;
		if (!t) return !1;
		for (let n of [.25, .75]) for (let r = 0; r < 6; r++) if (On(t, (e.left + e.width * (r + .5) / 6 - L.left) / L.scale, (e.top + e.height * n) / L.scale)) return !0;
		return !1;
	}, _t = ae(() => {
		let e = j.current.getBoundingClientRect();
		return {
			x: e.left,
			y: e.top,
			scale: L.scale
		};
	}, [L.scale]), vt = (e) => ({
		left: L.left + e.left * L.scale,
		top: e.top * L.scale,
		width: e.width * L.scale,
		height: e.height * L.scale
	});
	return /* @__PURE__ */ R(Gt.Provider, {
		value: lt,
		children: /* @__PURE__ */ z("div", {
			className: "flex h-full min-h-0 flex-col",
			"data-live-editor": !0,
			children: [
				me && /* @__PURE__ */ R(pe, {
					compact: !0,
					message: me,
					onRetry: () => I((e) => e + 1)
				}),
				/* @__PURE__ */ z("div", {
					ref: se,
					onPointerLeave: () => {
						h.hover(null), rt(null);
					},
					onPointerMove: (e) => {
						e.target.closest("[data-cms-inserter]") || (rt(null), h.hover(null));
					},
					className: "relative min-h-0 flex-1 overflow-hidden bg-sunken",
					children: [
						F && /* @__PURE__ */ R("div", {
							className: "absolute inset-0 z-20 grid place-items-center bg-bg",
							children: /* @__PURE__ */ R(he, {})
						}),
						/* @__PURE__ */ R("iframe", {
							ref: j,
							title: C("Live editor"),
							sandbox: "allow-same-origin",
							onLoad: mt,
							className: "absolute top-0 border-0 bg-white",
							style: {
								width: L.width,
								height: L.height,
								left: L.left,
								transformOrigin: "top left",
								transform: `scale(${L.scale})`
							}
						}),
						/* @__PURE__ */ z("div", {
							className: "pointer-events-none absolute inset-0 overflow-hidden",
							children: [
								!S && !ht.drag && !Pe && !Le && !U && ne && xe && !E.includes(ne) && /* @__PURE__ */ R("div", {
									"data-cms-hover": ne,
									className: "absolute z-10 border border-focus/50",
									style: vt(xe)
								}),
								!ht.drag && ye.map((e, t) => /* @__PURE__ */ R("div", {
									"data-cms-selection": !0,
									className: "absolute z-10 border-solid border-focus",
									style: {
										...vt(e),
										borderWidth: 1.5
									}
								}, t)),
								!S && !ht.drag && te && T && ye[0] && (() => {
									let e = i(w, E[0]), t = i(w, E.at(-1)), r = n(w, T);
									if (!e || !t || !r) return null;
									let c = a(w, e.parentId), l = (e) => ({
										label: Ae(e, g, ee),
										icon: e.type === "pattern" ? "b-diamonds-four" : g.get(e.type)?.icon ?? "square"
									}), u = e.parentId ? n(w, e.parentId) : null, { label: d, icon: f } = l(r);
									return /* @__PURE__ */ R(Vt, {
										id: T,
										label: E.length > 1 ? x(E.length, "{count} block", "{count} blocks") : d,
										icon: f,
										parent: u ? l(u) : null,
										box: vt(ye[0]),
										viewport: {
											width: L.width * L.scale + L.left * 2,
											height: L.height * L.scale
										},
										canMoveUp: e.index > 0,
										canMoveDown: t.index < c.length - 1,
										onSelectParent: () => u && o(u.id),
										onDrag: (e) => {
											W(null), ht.start(e, Fe(h.get()), d);
										},
										onMove: (e) => h.nudgeSelection(e),
										onInsert: (e) => requestAnimationFrame(() => it(e)),
										onDuplicate: () => h.duplicateSelection(),
										onDelete: () => h.removeSelection(),
										onMakeComponent: r.type !== "pattern" && _("entries.components.create") ? () => ct(h, s(h, g, v)) : void 0,
										covers: gt
									});
								})(),
								!S && !ht.drag && Te.filter((e) => e.inside).map((e) => {
									let t = {
										open: !!U && Tn(U) === Tn(e),
										onOpenChange: (t) => W(t ? e : null),
										returnFocus: at,
										children: /* @__PURE__ */ R(jt, {
											types: [...g.values()],
											allowed: (t) => Qe(e.parentId, [t.name]),
											onChoose: (t) => dt(t, e),
											onClose: () => W(null)
										})
									};
									if (e.parentId === null) return w.length ? null : /* @__PURE__ */ R(zt, {
										target: e,
										position: vt,
										onWrite: Qe(null) ? ft : void 0,
										...t
									}, "root");
									let r = e.hitRect.top;
									return n(w, e.parentId)?.children?.length || r + e.hitRect.height < 0 || r > L.height || !(t.open || ne === e.parentId || E.includes(e.parentId)) ? null : /* @__PURE__ */ R(Rt, {
										target: e,
										position: vt,
										...t
									}, Tn(e));
								}),
								!S && !ht.drag && (() => {
									let e = U && !U.inside ? U : !U && !Le ? De : null;
									return e ? /* @__PURE__ */ R(Lt, {
										target: e,
										position: vt,
										open: U === e,
										onOpenChange: (t) => {
											W(t ? e : null), t || rt(null);
										},
										returnFocus: at,
										children: /* @__PURE__ */ R(jt, {
											types: [...g.values()],
											allowed: (t) => Qe(e.parentId, [t.name]),
											onChoose: (t) => dt(t, e),
											onClose: () => W(null)
										})
									}, Tn(e)) : null;
								})(),
								ht.drag && /* @__PURE__ */ R(Ht, {
									drag: ht.drag,
									position: vt
								})
							]
						})
					]
				}),
				M && /* @__PURE__ */ z(Se, { children: [
					/* @__PURE__ */ R(jn, { slots: P }),
					f && /* @__PURE__ */ R(Fn, {
						doc: M,
						content: r,
						onChange: f,
						readOnly: S
					}),
					/* @__PURE__ */ R(et, {
						root: M,
						offset: _t
					}),
					/* @__PURE__ */ R(Pn, {
						doc: M,
						frame: j.current,
						scale: L.scale
					})
				] })
			]
		})
	});
}
var jn = ie(function({ slots: e }) {
	let { store: t } = B(), r = V(t, (e) => e.nodes), i = new Set(e.filter((e) => !e.instance && e.prop === "items").map((e) => e.id)), a = /* @__PURE__ */ new Map();
	return /* @__PURE__ */ z(Se, { children: [e.filter((e) => e.instance || e.prop !== "items").map((e) => {
		let t = n(r, e.id);
		if (!t) return null;
		let i = `${e.instance ? "instance:" : ""}${e.id}:${e.prop}`, o = a.get(i) ?? 0;
		return a.set(i, o + 1), Ce(e.instance ? /* @__PURE__ */ R(Mn, {
			node: t,
			slot: e
		}) : [
			"text",
			"cite",
			"caption"
		].includes(e.prop) ? t.type === "paragraph" && e.prop === "text" ? /* @__PURE__ */ R(Sn, {
			node: t,
			prop: "text",
			tag: "span",
			placeholder: C("Write, or press “/” for blocks"),
			quiet: !0
		}) : /* @__PURE__ */ R(Sn, {
			node: t,
			prop: e.prop,
			tag: "span",
			placeholder: e.element.dataset.cmsPlaceholder ?? C("Write something…")
		}) : /* @__PURE__ */ R(Nn, {
			node: t,
			prop: e.prop
		}), e.element, `${i}:${o}`);
	}), [...i].map((t) => {
		let i = n(r, t);
		return i ? /* @__PURE__ */ R(Cn, {
			node: i,
			renderItem: (n, r) => {
				let i = e.find((e) => e.id === t && e.prop === "items" && e.index === n);
				return i ? Ce(r, i.element, `${t}:items:${n}`) : null;
			}
		}, t) : null;
	})] });
});
function Mn({ node: e, slot: t }) {
	let { store: r, readOnly: i } = B(), a = V(r, (n) => n.focus?.id === e.id && n.focus.prop === `values.${t.prop}` ? n.focus : null), o = String((Object.prototype.hasOwnProperty.call(e.props.values ?? {}, t.prop) ? e.props.values[t.prop] : t.instance.value) ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
	return /* @__PURE__ */ R(Ze, {
		tag: "span",
		html: o,
		focus: a,
		plainText: !0,
		singleLine: t.instance.type === "text",
		disabled: i,
		placeholder: t.element.dataset.cmsPlaceholder ?? C("Write something…"),
		onFocus: () => r.select(e.id),
		onChange: (i, a) => r.updateProps(e.id, { values: {
			...n(r.get().nodes, e.id)?.props.values,
			[t.prop]: a.innerText
		} }, `instance:${e.id}:${t.prop}`),
		onKeyDown: (n, i) => {
			(n.key === "Escape" || n.key === "Enter" && t.instance.type === "text") && (n.preventDefault(), i.blur(), r.select(e.id, !0));
		}
	});
}
function Nn({ node: e, prop: t }) {
	let { store: n, readOnly: r } = B(), i = V(n, (n) => n.focus?.id === e.id && n.focus.prop === t ? n.focus : null), a = String(e.props[t] ?? ""), o = t === "code" ? a.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>") : a;
	return /* @__PURE__ */ R(Ze, {
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
function Pn({ doc: e, frame: t, scale: r }) {
	let a = pn(), { store: s, types: c, allowed: l } = B(), [d, f] = A(null);
	if (ce(() => {
		f(a ? qe(e) : null);
	}, [a, e]), hn(!!a, [document, e]), !a || !d || !n(s.get().nodes, a.id)) return null;
	let g = (e) => {
		let t = u(e, c), r = s.get().nodes, d = i(r, a.id);
		if (!d || !t.length) return;
		let f = d.parentId ? n(r, d.parentId) : null, g = t.every((e) => m(f, e.type, c, f ? [] : l)) ? d : p(r, a.id, t.map((e) => e.type), c, l);
		g && (fn(null), s.commit(h(o(r, a.id), g.parentId, g.index, t)), Xt(s, t[0], rn(nn(s.get().nodes, c, () => !1))));
	}, _ = t.getBoundingClientRect(), { maxHeight: v, ...y } = mn({
		left: _.left + d.left * r,
		top: _.top + d.top * r,
		bottom: _.top + d.bottom * r
	});
	return Ce(/* @__PURE__ */ R("div", {
		"data-cms-slash": !0,
		className: "cms-pop fixed z-[70] overflow-hidden !p-0",
		style: y,
		children: /* @__PURE__ */ R(ot, {
			types: [...c.values()],
			query: a.query,
			showSearch: !1,
			compact: !0,
			style: { maxHeight: v },
			chooseFirst: a.enter,
			keyboardDocument: e,
			onChoose: g,
			onClose: () => fn(null),
			onNoMatch: () => {
				fn(null);
			},
			allowed: (e) => !!p(s.get().nodes, a.id, e.name, c, l)
		})
	}), document.body);
}
function Fn({ doc: e, content: t, onChange: n, readOnly: r }) {
	let i = [...e.querySelectorAll("[data-cms-entry-field=\"title\"]")];
	return /* @__PURE__ */ R(Se, { children: i.map((i, a) => {
		let o = t.title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
		return Ce(/* @__PURE__ */ R(Ze, {
			tag: "span",
			html: o,
			singleLine: !0,
			disabled: r,
			placeholder: C("Untitled"),
			onChange: (e, t) => n(t.textContent ?? ""),
			onKeyDown: (t, n) => {
				t.key === "Enter" && (t.preventDefault(), n.blur(), e.querySelector("[data-cms-editor-root] [contenteditable=\"true\"]")?.focus());
			}
		}), i, `title:${a}`);
	}) });
}
// admin/src/builder/controls.tsx
var In = "w-[88px]", Ln = "cms.inspector.collapsed";
function Rn() {
	try {
		let e = JSON.parse(localStorage.getItem(Ln) ?? "{}");
		return e && typeof e == "object" && !Array.isArray(e) ? Object.fromEntries(Object.entries(e).filter(([, e]) => typeof e == "boolean")) : {};
	} catch {
		return {};
	}
}
function X({ title: e, children: t, open: n = !0, actions: r, empty: i }) {
	let [a, o] = A(() => Rn()[e] === void 0 ? n : !Rn()[e]), s = (t) => {
		o(t);
		try {
			localStorage.setItem(Ln, JSON.stringify({
				...Rn(),
				[e]: !t
			}));
		} catch {}
	};
	return /* @__PURE__ */ z("section", {
		"data-section": e,
		className: "min-w-0 border-b border-border last:border-b-0",
		children: [/* @__PURE__ */ z("header", {
			className: "group/section flex h-10 items-center gap-1 pl-4 pr-3",
			children: [/* @__PURE__ */ z("button", {
				type: "button",
				onClick: () => s(!a),
				"aria-expanded": a,
				className: I("flex h-full min-w-0 flex-1 items-center gap-1 text-left text-xs font-semibold", i ? "text-muted" : "text-ink"),
				children: [/* @__PURE__ */ R("span", {
					className: "min-w-0 truncate",
					children: e
				}), /* @__PURE__ */ R(P, {
					name: "b-caret-down",
					size: 10,
					className: I("shrink-0 text-faint transition-[rotate,opacity] duration-120", a ? "opacity-0 group-hover/section:opacity-100 group-focus-within/section:opacity-100" : "-rotate-90")
				})]
			}), r && /* @__PURE__ */ R("span", {
				className: "contents",
				onClickCapture: () => !a && s(!0),
				children: r
			})]
		}), a && /* @__PURE__ */ R("div", {
			className: "space-y-1 px-4 pb-3",
			children: i && r ? /* @__PURE__ */ R("p", {
				className: "m-0 flex h-7 items-center text-xs text-faint",
				children: C("None")
			}) : t
		})]
	});
}
function zn({ children: e, className: t }) {
	return /* @__PURE__ */ R("div", {
		"data-section": "content",
		className: I("space-y-1 border-b border-border px-4 py-3 last:border-b-0", t),
		children: e
	});
}
function Bn({ title: e, action: t }) {
	return /* @__PURE__ */ z("div", {
		className: "flex h-7 items-center justify-between pt-1",
		children: [/* @__PURE__ */ R("span", {
			className: "text-xs text-muted",
			children: e
		}), t]
	});
}
function Vn({ field: e, children: t, htmlFor: n, className: r }) {
	let i = e.status, a = e.reset, o = t ?? e.label, s = I("flex h-7 min-w-0 shrink-0 items-center gap-1 text-left text-xs", In, i === "own" ? "text-ink" : "text-muted", r), c = /* @__PURE__ */ R("span", {
		className: "min-w-0 truncate",
		children: o
	});
	return i === "own" && a ? /* @__PURE__ */ R(_e, {
		content: C("Reset {label}", { label: String(e.label ?? "") }),
		children: /* @__PURE__ */ R("button", {
			type: "button",
			onClick: a,
			className: I(s, "decoration-faint decoration-dotted underline-offset-[3px] hover:underline"),
			children: c
		})
	}) : i === "inherited" ? /* @__PURE__ */ z("label", {
		htmlFor: n,
		className: s,
		title: C("Inherited from a larger screen, another state or the component"),
		children: [c, /* @__PURE__ */ R("span", {
			className: "size-1 shrink-0 rounded-full bg-warning",
			"aria-hidden": !0
		})]
	}) : /* @__PURE__ */ R("label", {
		htmlFor: n,
		className: s,
		title: e.instructions,
		children: c
	});
}
var Hn = 15, Un = [
	"richtext",
	"markdown",
	"code",
	"json",
	"textarea",
	"media",
	"repeater",
	"tags",
	"entries",
	"group",
	"properties",
	"fields"
];
function Wn(e) {
	if (e.stack === !0 || Un.includes(e.type) && !e.component || e.type !== "toggle" && String(e.label ?? "").length > Hn) return !0;
	if (e.type !== "select" || e.component || e.display !== "segmented") return !1;
	let t = Object.values(e.options ?? {}).map((e) => typeof e == "string" ? e : e && typeof e == "object" && "label" in e ? String(e.label ?? "") : "").filter(Boolean);
	return t.length > 3 || t.join(" ").length > 20;
}
var Gn = (e) => e === "xs" || e === void 0 ? "sm" : e;
function Z({ fields: e, values: t, onChange: n, disabled: r, context: i = {}, className: a, bare: o }) {
	j(S.fields.subscribe, S.fields.version);
	let s = E();
	return /* @__PURE__ */ R("div", {
		className: I("min-w-0", a ?? "space-y-1"),
		children: e.filter((e) => ve(e, t)).map((e) => {
			let a = s?.fieldTypes.find((t) => t.key === e.type), c = S.fields.get(e.component ?? a?.component ?? e.type) ?? S.fields.get("json");
			if (!c) return null;
			let l = {
				...e,
				size: Gn(e.size),
				fit: !0,
				id: L(e, i.path)
			}, u = !o && Wn(e), d = /* @__PURE__ */ R(c, {
				field: l,
				value: t[e.handle] ?? e.default ?? null,
				onChange: (t) => n(e.handle, t),
				disabled: r,
				context: {
					...i,
					values: t
				}
			});
			return /* @__PURE__ */ z("div", {
				"data-field": e.handle,
				className: I("flex min-w-0", u ? "flex-col items-stretch" : "min-h-7 items-center gap-2", e.className),
				children: [!o && e.type !== "toggle" && /* @__PURE__ */ R(Vn, {
					field: l,
					htmlFor: l.id,
					className: u ? "!w-auto" : void 0
				}), /* @__PURE__ */ R("div", {
					className: I("flex min-w-0 items-center", !u && "flex-1"),
					children: d
				})]
			}, e.handle);
		})
	});
}
var Kn = "cms-input h-7 w-full min-w-0 rounded-sm px-2 text-sm placeholder:text-ghost";
function qn(e) {
	return Array.isArray(e) ? String(e[0]) : e && typeof e == "object" && "min" in e ? `${e.min}–${e.max}` : String(e);
}
function Jn({ color: e, dark: t, className: n }) {
	return /* @__PURE__ */ z("span", {
		className: I("relative inline-block size-4 shrink-0 overflow-hidden rounded-[4px] align-middle [background:repeating-conic-gradient(#ddd_0_25%,#fff_0_50%)_0_0/6px_6px]", n),
		children: [
			/* @__PURE__ */ R("span", {
				className: "absolute inset-0",
				style: { background: e }
			}),
			t && /* @__PURE__ */ R("span", {
				className: "absolute inset-0 [clip-path:polygon(100%_50%,100%_100%,50%_100%)]",
				style: { background: t }
			}),
			/* @__PURE__ */ R("span", { className: "absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgb(0_0_0/0.12)]" })
		]
	});
}
var Yn = "grid size-6 shrink-0 place-items-center rounded-sm text-muted transition-colors duration-120 hover:bg-hover hover:text-ink";
function Xn({ onClick: e, label: t = C("Add") }) {
	return /* @__PURE__ */ R(_e, {
		content: t,
		children: /* @__PURE__ */ R("button", {
			type: "button",
			onClick: e,
			className: Yn,
			"aria-label": t,
			children: /* @__PURE__ */ R(P, {
				name: "b-plus",
				size: 14
			})
		})
	});
}
function Zn({ onClick: e, label: t = C("Remove") }) {
	return /* @__PURE__ */ R(_e, {
		content: t,
		children: /* @__PURE__ */ R("button", {
			type: "button",
			onClick: e,
			className: I(Yn, "text-faint hover:text-danger"),
			"aria-label": t,
			children: /* @__PURE__ */ R(P, {
				name: "b-minus",
				size: 14
			})
		})
	});
}
// admin/src/builder/motion/EaseCurve.tsx
var Qn = {
	none: [
		0,
		0,
		1,
		1
	],
	linear: [
		0,
		0,
		1,
		1
	],
	ease: [
		.25,
		.1,
		.25,
		1
	],
	"ease-in-out": [
		.42,
		0,
		.58,
		1
	],
	"power1.out": [
		.25,
		.46,
		.45,
		.94
	],
	"power2.out": [
		.215,
		.61,
		.355,
		1
	],
	"power3.out": [
		.165,
		.84,
		.44,
		1
	],
	"power4.out": [
		.23,
		1,
		.32,
		1
	],
	"power1.in": [
		.55,
		.085,
		.68,
		.53
	],
	"power2.in": [
		.55,
		.055,
		.675,
		.19
	],
	"power3.in": [
		.895,
		.03,
		.685,
		.22
	],
	"power4.in": [
		.755,
		.05,
		.855,
		.06
	],
	"power1.inOut": [
		.455,
		.03,
		.515,
		.955
	],
	"power2.inOut": [
		.645,
		.045,
		.355,
		1
	],
	"power3.inOut": [
		.77,
		0,
		.175,
		1
	],
	"power4.inOut": [
		.86,
		0,
		.07,
		1
	],
	"expo.out": [
		.19,
		1,
		.22,
		1
	],
	"expo.in": [
		.95,
		.05,
		.795,
		.035
	],
	"expo.inOut": [
		1,
		0,
		0,
		1
	],
	"circ.out": [
		.075,
		.82,
		.165,
		1
	],
	"circ.inOut": [
		.785,
		.135,
		.15,
		.86
	],
	"sine.out": [
		.39,
		.575,
		.565,
		1
	],
	"sine.inOut": [
		.445,
		.05,
		.55,
		.95
	],
	"back.out": [
		.175,
		.885,
		.32,
		1.275
	],
	"back.inOut": [
		.68,
		-.55,
		.265,
		1.55
	],
	"back.in": [
		.6,
		-.28,
		.735,
		.045
	],
	"elastic.out": [
		.2,
		1.6,
		.4,
		.9
	],
	"bounce.out": [
		.3,
		1.3,
		.5,
		1
	]
};
function $n(e) {
	if (!e) return Qn["power3.out"];
	let t = e.match(/cubic-bezier\(([^)]+)\)/);
	if (t) {
		let e = t[1].split(",").map(Number);
		if (e.length === 4 && e.every((e) => !Number.isNaN(e))) return e;
	}
	return Qn[e.replace(/\(.*\)$/, "")] ?? Qn[`${e}.out`] ?? Qn["power3.out"];
}
function er({ value: e, size: t = 32, className: n }) {
	let [r, i, a, o] = $n(e), s = (e, n) => `${4 + e * (t - 8)},${t - 4 - n * (t - 8)}`;
	return /* @__PURE__ */ R("svg", {
		width: t,
		height: t,
		viewBox: `0 0 ${t} ${t}`,
		className: n ?? "shrink-0 rounded-xs bg-sunken text-focus",
		"aria-hidden": !0,
		children: /* @__PURE__ */ R("path", {
			d: `M${s(0, 0)} C${s(r, i)} ${s(a, o)} ${s(1, 1)}`,
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "1.5",
			strokeLinecap: "round"
		})
	});
}
// admin/src/builder/fields/tokens.tsx
function tr() {
	let { byPath: e } = je();
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
	let { byPath: t } = je();
	return (n) => {
		let r = n.trim().replace(/^\$/, "").replace(/^token:/, "");
		return t.has(r) ? `token:${r}` : e && t.has(`${e}.${r}`) && /^[a-z0-9-]+$/i.test(r) && !/^-?\d*\.?\d+$/.test(r) ? `token:${e}.${r}` : null;
	};
}
var rr = (e) => qn(e.value);
function ir({ token: e, alpha: t, className: n }) {
	return /* @__PURE__ */ z("span", {
		className: I("inline-flex min-w-0 items-center gap-1 truncate rounded-xs bg-active px-1.5 leading-5 text-ink", n),
		title: `${e.path} · ${rr(e)}`,
		children: [/* @__PURE__ */ R("span", {
			className: "truncate",
			children: e.group === "color" ? e.name : e.path
		}), t && /* @__PURE__ */ z("span", {
			className: "text-muted",
			children: ["/", t]
		})]
	});
}
function ar({ group: e, value: t, onPick: n, detach: r }) {
	let { byGroup: i } = je(), a = i.get(e) ?? [], o = typeof t == "string" && t.startsWith("token:") ? t.slice(6).split("/")[0] : null;
	return a.length ? /* @__PURE__ */ z("div", { children: [
		/* @__PURE__ */ R("p", {
			className: "cms-label m-0 px-2 pb-1 pt-1.5 !text-2xs",
			children: C("Tokens")
		}),
		/* @__PURE__ */ R("div", {
			className: "max-h-60 overflow-y-auto",
			children: a.map((t) => /* @__PURE__ */ z("button", {
				type: "button",
				onClick: () => n(`token:${t.path}`),
				className: I("flex h-7 w-full items-center gap-2 rounded-xs px-2 text-left text-xs hover:bg-hover", o === t.path && "bg-active"),
				children: [
					e === "color" && /* @__PURE__ */ R(Jn, {
						color: String(t.value),
						dark: t.dark ? String(t.dark) : void 0
					}),
					e === "shadow" && /* @__PURE__ */ R("span", {
						className: "size-3.5 shrink-0 rounded-[3px] bg-bg",
						style: { boxShadow: String(t.value) }
					}),
					e === "radius" && /* @__PURE__ */ R("span", {
						className: "size-3.5 shrink-0 border-l-[1.5px] border-t-[1.5px] border-muted",
						style: { borderTopLeftRadius: String(t.value) }
					}),
					/* @__PURE__ */ R("span", {
						className: "min-w-0 truncate font-mono text-2xs",
						children: t.path
					}),
					/* @__PURE__ */ R("span", {
						className: "ml-auto max-w-[45%] shrink-0 truncate font-mono text-2xs text-faint",
						children: rr(t)
					}),
					o === t.path && /* @__PURE__ */ R(P, {
						name: "b-check",
						size: 12,
						className: "shrink-0 text-focus"
					})
				]
			}, t.path))
		}),
		o && r && /* @__PURE__ */ z("button", {
			type: "button",
			onClick: r,
			className: "mt-1 flex h-7 w-full items-center gap-2 rounded-xs border-t border-border px-2 text-xs text-muted hover:bg-hover hover:text-text",
			children: [/* @__PURE__ */ R(P, {
				name: "b-link-break",
				size: 12
			}), C("Detach Token")]
		})
	] }) : /* @__PURE__ */ R("p", {
		className: "m-0 px-2 py-2 text-2xs text-faint",
		children: C("No {group} tokens in the design system.", { group: e })
	});
}
function or({ group: e, value: t, onPick: n, active: r, className: i, trigger: a }) {
	let [o, s] = A(!1), { byGroup: c, byPath: l } = je();
	if (!(c.get(e) ?? []).length) return null;
	let u = (e) => {
		n(e), s(!1);
	};
	return /* @__PURE__ */ R(fe, {
		open: o,
		onOpenChange: s,
		align: "end",
		className: "w-60 !p-1",
		trigger: a ?? /* @__PURE__ */ R("button", {
			type: "button",
			className: I("grid size-5 shrink-0 place-items-center rounded-xs text-faint transition-opacity hover:bg-hover hover:text-ink", !r && !o && "opacity-0 group-hover/value:opacity-100 group-focus-within/value:opacity-100", (r || o) && "text-ink", i),
			"aria-label": C("Design Tokens"),
			title: C("Design Tokens"),
			children: /* @__PURE__ */ R(P, {
				name: "b-diamonds-four",
				size: 10
			})
		}),
		children: /* @__PURE__ */ R(ar, {
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
	let n = S.fields.get(e.component ?? e.type) ?? S.fields.get("json");
	return n ? /* @__PURE__ */ R("div", {
		className: I("min-w-0 flex-1", e.className),
		children: /* @__PURE__ */ R(n, {
			field: e,
			...t,
			context: t.context ?? {}
		})
	}) : null;
}
function lr({ className: e, children: t }) {
	return /* @__PURE__ */ R("div", {
		className: I("relative flex min-w-0 flex-1 items-center gap-1", e),
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
	return e.field.percent ? /* @__PURE__ */ R(hr, { ...e }) : /* @__PURE__ */ R(yr, { ...e });
}
function hr({ field: e, value: t, onChange: n, ...r }) {
	let i = t == null || t === "" ? null : Number(t), a = (e) => typeof e == "number" ? Math.round(e * 100) : void 0, o = e.slider;
	return /* @__PURE__ */ R(yr, {
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
	ce(() => {
		let e = f.current ? f.current.offsetWidth + 4 : 0;
		e !== p && m(e);
	});
	let h = t == null || t === "" ? void 0 : String(t), g = e.unit ?? "px", _ = e.step ?? 1, v = e.min, y = e.max, b = e.group, x = e.prefixIcon ? /* @__PURE__ */ R(P, {
		name: e.prefixIcon,
		size: 13
	}) : e.prefix, S = e.slider, ee = e.menu, w = e.action, T = e.keywords ?? [], E = a(h), D = h?.match(ur), te = D ? D[2] || g : h ? "" : l ?? g, ne = g ? e.units ?? dr[g] ?? [g] : [], re = !h || !!D, ie = (e, t = te) => n(`${pr(fr(e, v, y))}${t}`), ae = (e) => {
		re && ie((D ? parseFloat(D[1]) : 0) + e);
	}, oe = (e, t) => {
		if (r || e.button !== 0 || document.activeElement === e.currentTarget || !re) return;
		e.preventDefault();
		let n = e.clientX, i = D ? parseFloat(D[1]) : 0, a = !1, o = (e) => {
			let t = e.clientX - n;
			!a && Math.abs(t) < 3 || (a = !0, document.body.style.cursor = "ew-resize", ie(i + Math.round(t / 2) * _ * (e.shiftKey ? 10 : e.altKey ? .1 : 1)));
		}, s = () => {
			window.removeEventListener("pointermove", o), window.removeEventListener("pointerup", s), document.body.style.cursor = "", !a && t && d.current?.focus();
		};
		window.addEventListener("pointermove", o), window.addEventListener("pointerup", s);
	}, O = (t) => t === "" ? null : o(t) || (/^-?\d*\.?\d+$/.test(t) ? te ? `${t}${te}` : t : T.includes(t) || vr(t, e.property ?? e.handle, g) ? t : void 0), se = gr(s ?? "", (e) => s === null || O(e.trim()) !== void 0), le = () => {
		if (s === null) return;
		let e = s.trim();
		if (c(null), e === (D ? D[1] : h ?? "")) return;
		let t = O(e);
		t !== void 0 && n(t);
	}, j = (e) => {
		D ? n(`${D[1]}${e}`) : h || u(e);
	};
	return /* @__PURE__ */ z(lr, { children: [
		S && /* @__PURE__ */ R(cr, {
			field: {
				handle: `${e.handle}-slider`,
				type: "number",
				display: "slider",
				input: !1,
				size: "sm",
				label: e.label,
				min: S.min,
				max: S.max,
				step: S.step,
				neutral: S.neutral
			},
			value: D ? parseFloat(D[1]) : null,
			onChange: (e) => n(e),
			disabled: r,
			context: i
		}),
		/* @__PURE__ */ z("div", {
			className: I("group/value relative flex h-7 min-w-0 flex-1 items-center", S && "!w-16 !flex-none"),
			title: e.title,
			children: [
				x !== void 0 && /* @__PURE__ */ R("span", {
					onPointerDown: (e) => oe(e, !0),
					className: "absolute left-0 z-10 grid h-7 w-6 cursor-ew-resize select-none place-items-center text-xs text-faint hover:text-ink",
					children: x
				}),
				E && s === null ? /* @__PURE__ */ R(or, {
					group: b ?? E.token.group,
					value: h,
					onPick: n,
					trigger: /* @__PURE__ */ R("button", {
						type: "button",
						onDoubleClick: () => c(h ?? ""),
						className: I(Kn, "flex items-center pr-1 text-left", x !== void 0 && "!pl-6"),
						children: /* @__PURE__ */ R(ir, {
							token: E.token,
							alpha: E.alpha,
							className: "text-xs"
						})
					})
				}) : /* @__PURE__ */ R("input", {
					ref: d,
					id: L(e),
					value: s ?? (D ? D[1] : h ?? ""),
					placeholder: e.placeholder,
					disabled: r,
					autoComplete: "off",
					spellCheck: !1,
					onPointerDown: (e) => oe(e, !0),
					onChange: (e) => c(e.target.value),
					onFocus: (e) => e.target.select(),
					onBlur: le,
					"aria-invalid": se.shown || void 0,
					onKeyDown: (e) => {
						e.key === "Enter" && (s !== null && O(s.trim()) === void 0 ? se.show() : e.target.blur()), e.key === "Escape" && (c(null), requestAnimationFrame(() => d.current?.blur())), (e.key === "ArrowUp" || e.key === "ArrowDown") && re && (e.preventDefault(), c(null), ae((e.key === "ArrowUp" ? 1 : -1) * _ * (e.shiftKey ? 10 : e.altKey ? .1 : 1)));
					},
					className: I(Kn, "tabular-nums", re && !r && "cursor-ew-resize focus:cursor-text", x !== void 0 && "!pl-6"),
					style: { paddingRight: (h ? p : 0) + 6 }
				}),
				(!E || s !== null) && /* @__PURE__ */ z("div", {
					ref: f,
					className: "pointer-events-none absolute inset-y-0 right-1 flex items-center",
					children: [
						b && /* @__PURE__ */ R(or, {
							group: b,
							value: h,
							onPick: n,
							className: "pointer-events-auto"
						}),
						te && ne.length > 0 && /* @__PURE__ */ R(F, {
							align: "end",
							trigger: /* @__PURE__ */ R("button", {
								type: "button",
								disabled: r,
								className: I("pointer-events-auto h-5 min-w-5 rounded-xs px-1 text-2xs text-faint hover:bg-hover hover:text-ink data-[popup-open]:opacity-100", !h && "opacity-0 group-hover/value:opacity-100 group-focus-within/value:opacity-100"),
								"aria-label": C("Unit"),
								children: te
							}),
							items: [...ne.map((e) => ({
								label: e,
								checked: e === te,
								onSelect: () => j(e)
							})), ...T.length ? [{
								separator: !0,
								label: ""
							}, ...T.map((e) => ({
								label: e,
								checked: h === e,
								onSelect: () => n(e)
							}))] : []]
						}),
						!te && g && T.length > 0 && h && T.includes(h) && /* @__PURE__ */ R(F, {
							align: "end",
							trigger: /* @__PURE__ */ R("button", {
								type: "button",
								className: "pointer-events-auto grid size-5 place-items-center rounded-xs text-faint hover:bg-hover hover:text-ink",
								"aria-label": C("Unit"),
								children: /* @__PURE__ */ R(P, {
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
								...T.map((e) => ({
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
		ee && /* @__PURE__ */ R(F, {
			align: "end",
			trigger: /* @__PURE__ */ z("button", {
				type: "button",
				className: "flex h-7 shrink-0 items-center gap-0.5 rounded-sm px-1.5 text-xs text-muted hover:bg-hover hover:text-ink",
				children: [ee.label, /* @__PURE__ */ R(P, {
					name: "b-caret-down",
					size: 10
				})]
			}),
			items: ee.items.map((e) => ({
				label: e.label,
				checked: e.checked,
				onSelect: () => n(e.value)
			}))
		}),
		w && /* @__PURE__ */ R("button", {
			type: "button",
			onClick: () => n(w.value),
			className: "grid size-7 shrink-0 place-items-center rounded-sm text-muted hover:bg-hover hover:text-ink",
			title: w.label,
			"aria-label": w.label,
			children: /* @__PURE__ */ R(P, {
				name: w.icon,
				size: 14
			})
		})
	] });
}
function br({ field: e, ...t }) {
	return /* @__PURE__ */ z(lr, { children: [/* @__PURE__ */ R(cr, {
		...t,
		field: {
			...e,
			type: "select",
			component: void 0,
			size: "sm"
		}
	}), /* @__PURE__ */ R(er, {
		value: t.value ?? void 0,
		size: 28
	})] });
}
// admin/src/builder/fields/composite.tsx
var xr = {
	2: "grid grid-cols-2",
	3: "grid grid-cols-3",
	4: "grid grid-cols-4"
};
function Sr({ field: e, value: t, onChange: n, disabled: r, context: i }) {
	let a = t ?? {}, o = e.link, [s, c] = A(!o || e.split === !0), l = (s ? e.fields ?? [] : [o]).filter((e) => sr(e, a)), u = s ? xr[e.columns] : void 0;
	return /* @__PURE__ */ z(lr, { children: [/* @__PURE__ */ R("div", {
		className: I("min-w-0 flex-1 gap-1", u ?? "flex items-center"),
		children: l.map((e) => /* @__PURE__ */ R(cr, {
			field: e,
			value: a[e.handle] ?? e.default ?? null,
			onChange: (t) => n({
				...a,
				[e.handle]: t
			}),
			disabled: r,
			context: i
		}, e.handle))
	}), o && /* @__PURE__ */ R("button", {
		type: "button",
		onClick: () => c(!s),
		className: "grid size-7 shrink-0 place-items-center rounded-sm text-muted hover:bg-hover hover:text-ink",
		title: s ? e.joinLabel ?? C("The same for all") : e.splitLabel ?? C("Each One"),
		children: /* @__PURE__ */ R(P, {
			name: s ? "b-square" : "b-corners-out",
			size: 14
		})
	})] });
}
function Cr({ field: e, value: t, onChange: n, disabled: r, context: i }) {
	let a = t ?? {}, o = e.key ?? {}, s = e.labels, c = e.items, l = (e, t) => {
		let r = (t ?? "").trim();
		o.lower && (r = r.toLowerCase()), o.strip && (r = r.replace(new RegExp(o.strip, "g"), "")), !(!r || r === e || r in a || o.allowed && !o.allowed.includes(r)) && n(Object.fromEntries(Object.entries(a).map(([t, n]) => t === e ? [r, n] : [t, n])));
	};
	return /* @__PURE__ */ R("div", {
		className: "min-w-0 flex-1 space-y-1",
		children: Object.entries(a).map(([t, u]) => /* @__PURE__ */ z("div", {
			className: "flex items-center gap-1",
			children: [
				o.prefix && /* @__PURE__ */ R("span", {
					className: "text-xs text-faint",
					children: o.prefix
				}),
				s ? /* @__PURE__ */ R("span", {
					className: "mr-1 w-[88px] shrink-0 truncate text-xs text-text",
					children: s[t] ?? t
				}) : /* @__PURE__ */ R(cr, {
					field: {
						handle: `${e.handle}-${t}`,
						type: o.options ? "select" : "text",
						size: "sm",
						commit: "blur",
						label: C("Name"),
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
				typeof e.join == "string" && /* @__PURE__ */ R("span", {
					className: "text-xs text-faint",
					children: e.join
				}),
				/* @__PURE__ */ R(cr, {
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
				/* @__PURE__ */ R(Zn, { onClick: () => n(Object.fromEntries(Object.entries(a).filter(([e]) => e !== t))) })
			]
		}, t))
	});
}
function wr(e, t) {
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
var Tr = () => [
	{
		path: "entry.author.name",
		label: C("Author"),
		group: C("Page")
	},
	{
		path: "entry.title",
		label: C("Title"),
		group: C("Page")
	},
	{
		path: "entry.url",
		label: C("Link"),
		group: C("Page")
	},
	{
		path: "entry.date|date:F j, Y",
		label: C("Published Date"),
		group: C("Page")
	},
	{
		path: "entry.updated|date:F j, Y",
		label: C("Updated Date"),
		group: C("Page")
	},
	{
		path: "entry.parent.title",
		label: C("Parent Title"),
		group: C("Page")
	},
	{
		path: "entry.prev.url",
		label: C("Previous Page Link"),
		group: C("Page")
	},
	{
		path: "entry.prev.title",
		label: C("Previous Page Title"),
		group: C("Page")
	},
	{
		path: "entry.next.url",
		label: C("Next Page Link"),
		group: C("Page")
	},
	{
		path: "entry.next.title",
		label: C("Next Page Title"),
		group: C("Page")
	}
], Er = () => [
	{
		path: "site.name",
		label: C("Site Name"),
		group: C("Site")
	},
	{
		path: "site.description",
		label: C("Site Description"),
		group: C("Site")
	},
	{
		path: "site.url",
		label: C("Site URL"),
		group: C("Site")
	},
	{
		path: "© {site.year} {site.name}",
		label: C("Copyright Line"),
		group: C("Site")
	},
	{
		path: "page.uri",
		label: C("Current Path"),
		group: C("Site")
	},
	{
		path: "pagination.prev",
		label: C("Previous Page of a List"),
		group: C("Pagination")
	},
	{
		path: "pagination.next",
		label: C("Next Page of a List"),
		group: C("Pagination")
	},
	{
		path: "{pagination.current} / {pagination.total}",
		label: C("Page x of y"),
		group: C("Pagination")
	}
];
function Dr(t) {
	let { store: n, doc: r, catalog: i } = B(), a = T(), o = V(n, (n) => e(n.nodes, t.id)), s = w("entries/get", { id: r?.id ?? "" }, {
		enabled: r?.kind === "entry",
		staleTime: 6e4
	}), c = r?.kind === "template" ? r.collections?.length ? r.collections : a.collections.filter((e) => e.routable).map((e) => e.handle).slice(0, 1) : s.data ? [s.data.collection] : [], l = w("collections/get", { handle: c[0] ?? "" }, {
		enabled: !!c[0],
		staleTime: 3e5
	}), u = [];
	for (let e of [...o].reverse()) {
		if (e.type !== "repeat") continue;
		let t = e.props?.as || "item", n = i.sources?.find((t) => t.name === e.props?.source), r = C("{list} item ({name})", {
			list: n?.label ?? C("List"),
			name: t
		});
		for (let [e, i] of Object.entries(n?.item ?? {})) u.push({
			path: `${t}.${e}`,
			label: i,
			group: r
		});
		e.props?.source === "entries" && e.props?.collection && u.push({
			path: `${t}.excerpt`,
			label: C("Excerpt Field"),
			group: r
		}, {
			path: `${t}.cover`,
			label: C("Cover Image Field"),
			group: r
		}), e.props?.source === "list" && u.push({
			path: `{${t}}`,
			label: C("The Item Itself (Text)"),
			group: r
		}), u.push({
			path: "index",
			label: C("Position (1, 2, 3…)"),
			group: r
		}, {
			path: "first",
			label: C("Is First"),
			group: r
		}, {
			path: "last",
			label: C("Is Last"),
			group: r
		});
	}
	if (r?.kind === "pattern") for (let e of r.props ?? []) u.push({
		path: `props.${e.handle}`,
		label: e.label ?? e.handle,
		group: C("Component Properties")
	});
	u.push(...Tr());
	for (let e of l.data?.fields ?? []) e.type !== "blocks" && u.push({
		path: `entry.${e.handle}${e.type === "date" ? "|date:F j, Y" : ""}`,
		label: e.label,
		group: C("Page Fields")
	});
	u.push(...Er());
	for (let e of a.globals) u.push({
		path: `globals.${e.handle}.`,
		label: C("{name} (add a field handle)", { name: e.title }),
		group: C("Globals")
	});
	return u;
}
// admin/src/builder/content/ContentPanel.tsx
var Or = [
	"text",
	"textarea",
	"richtext",
	"markdown"
], kr = (e, t) => !e.if || Object.entries(e.if).every(([e, n]) => {
	let r = t[e] ?? null;
	return Array.isArray(n) ? n.includes(r) : r === n;
});
function Ar({ field: e, value: t, bound: n, paths: r, onValue: i, onBind: a, extra: o }) {
	let s = e.type === "richtext" && e.inline && e.handle !== "text" && !e.component ? {
		...e,
		component: "blocks-inline-text"
	} : e, c = !n && Un.includes(s.type) && !s.component, l = !n && Wn(s), u = !n && s.type === "toggle", d = n ? {
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
	}, f = { [s.handle]: n ?? t }, p = (e, t) => n ? a(t) : i(t), m = c ? /* @__PURE__ */ R(N, {
		bare: !0,
		fields: [d],
		values: f,
		onChange: p,
		className: "min-w-0"
	}) : /* @__PURE__ */ R(Z, {
		bare: !0,
		fields: [d],
		values: f,
		onChange: p,
		className: "min-w-0 flex-1"
	});
	if (u) return /* @__PURE__ */ R("div", {
		className: "flex min-h-7 items-center",
		children: m
	});
	let h = /* @__PURE__ */ R(_e, {
		content: C(n ? "Disconnect from Data" : "Connect to Data"),
		children: /* @__PURE__ */ R("button", {
			type: "button",
			onClick: () => a(n ? null : r[0]?.path ?? "entry.title"),
			"aria-label": C(n ? "Disconnect from Data" : "Connect to Data"),
			className: I("grid h-6 shrink-0 place-items-center overflow-hidden rounded-sm hover:bg-hover", n ? "w-6 text-ink" : "w-0 text-faint hover:text-ink focus-visible:w-6 group-hover/prop:w-6 [@media(hover:none)]:w-6"),
			children: /* @__PURE__ */ R(P, {
				name: "b-database",
				size: 13
			})
		})
	}), g = /* @__PURE__ */ z("span", {
		className: I("flex h-7 min-w-0 shrink-0 items-center gap-0.5", !l && "w-[88px]"),
		children: [/* @__PURE__ */ R("label", {
			htmlFor: L(s),
			className: I("min-w-0 flex-1 truncate text-xs", n ? "text-ink" : "text-muted"),
			title: s.instructions,
			children: s.label
		}), h]
	});
	return l ? /* @__PURE__ */ z("div", {
		className: "group/prop pb-1",
		children: [g, m]
	}) : /* @__PURE__ */ z("div", {
		className: "group/prop flex min-h-7 items-center gap-2",
		children: [g, m]
	});
}
function jr({ node: e }) {
	let { store: t, types: n } = B(), r = n.get(e.type), i = Dr(e), a = q().filter((t) => t.id !== (e.anchor ?? e.props?.anchor)), o = e.bind ?? {}, s = {
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
	].includes(e.handle))), d = u.some((e) => e.component === "link") && u.some((e) => e.handle === "new_tab"), f = u.filter((e) => !(d && e.handle === "new_tab") && kr(e, s)), p = f.filter((e) => !e.advanced), m = f.filter((e) => e.advanced), h = (t) => /* @__PURE__ */ R(Ar, {
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
	return /* @__PURE__ */ z("div", { children: [
		e.type === "pattern" ? /* @__PURE__ */ R(Mr, {
			node: e,
			paths: i,
			setBind: c,
			anchors: a
		}) : g ? /* @__PURE__ */ R(Nr, { node: e }) : p.length > 0 && /* @__PURE__ */ R(zn, { children: p.map(h) }),
		/* @__PURE__ */ R(X, {
			title: C("Visibility"),
			open: !!(o.visible || o.hidden || e.hidden),
			empty: !o.visible && !o.hidden && !e.hidden,
			children: /* @__PURE__ */ R(Z, {
				fields: [
					{
						handle: "shown",
						type: "toggle",
						size: "sm",
						label: C("Show on the Site")
					},
					{
						handle: "visible",
						type: "text",
						component: "blocks-bind",
						label: C("Only If"),
						paths: i,
						placeholder: C("Always"),
						status: o.visible ? "own" : void 0,
						reset: () => c("visible", null),
						instructions: C("Shown only when this data has a value")
					},
					{
						handle: "hidden",
						type: "text",
						component: "blocks-bind",
						label: C("Hide If"),
						paths: i,
						placeholder: C("Never"),
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
		/* @__PURE__ */ z(X, {
			title: C("Advanced"),
			open: !1,
			empty: !e.anchor && !e.attrs && !e.class && !m.some((t) => e.props?.[t.handle] !== void 0 && e.props?.[t.handle] !== t.default),
			children: [
				g ? /* @__PURE__ */ R(Pr, { node: e }) : m.map(h),
				/* @__PURE__ */ R(Z, {
					fields: [
						{
							handle: "label",
							type: "text",
							size: "sm",
							commit: "blur",
							label: C("Layer Name"),
							placeholder: r?.title
						},
						{
							handle: "anchor",
							type: "text",
							size: "sm",
							commit: "blur",
							label: C("Anchor"),
							placeholder: C("None"),
							mono: !0,
							instructions: C("Link to it with #anchor")
						},
						{
							handle: "class",
							type: "text",
							size: "sm",
							commit: "blur",
							label: C("Classes"),
							placeholder: C("None"),
							mono: !0,
							instructions: C("Extra CSS classes, styled in custom CSS")
						}
					],
					values: {
						label: e.label,
						anchor: e.anchor,
						class: e.class
					},
					onChange: (n, r) => t.updateNode(e.id, { [n]: (n === "anchor" ? r.toLowerCase().replace(/[^a-z0-9-]/g, "") : r) || void 0 })
				}),
				/* @__PURE__ */ R(Bn, {
					title: C("Attributes"),
					action: /* @__PURE__ */ R(Xn, {
						label: C("Add Attribute"),
						onClick: () => t.updateNode(e.id, { attrs: {
							...e.attrs ?? {},
							"aria-label": ""
						} })
					})
				}),
				/* @__PURE__ */ R(Z, {
					bare: !0,
					fields: [{
						handle: "attrs",
						type: "json",
						component: "blocks-pairs",
						className: "items-start",
						label: C("Attributes"),
						key: { lower: !0 },
						item: {
							handle: "value",
							type: "text",
							size: "sm",
							commit: "blur",
							label: C("Value")
						},
						items: Object.fromEntries(Object.keys(e.attrs ?? {}).filter((e) => o[`attr:${e}`]).map((e) => [e, {
							handle: "bind",
							type: "text",
							component: "blocks-bind",
							label: C("Data"),
							paths: i
						}]))
					}],
					values: { attrs: Object.fromEntries(Object.entries(e.attrs ?? {}).map(([e, t]) => [e, o[`attr:${e}`] ?? t])) },
					onChange: (n, r) => {
						let i = e.attrs ?? {}, a = wr(Object.fromEntries(Object.entries(i).map(([e, t]) => [e, o[`attr:${e}`] ?? t])), r);
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
				/* @__PURE__ */ R(Bn, {
					title: C("States from Data"),
					action: /* @__PURE__ */ R(Xn, {
						label: C("Add State from Data"),
						onClick: () => c("state:active", i[0]?.path ?? "item.active")
					})
				}),
				/* @__PURE__ */ R(Z, {
					bare: !0,
					fields: [{
						handle: "states",
						type: "json",
						component: "blocks-pairs",
						className: "items-start",
						label: C("States from Data"),
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
							label: C("Data"),
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
				/* @__PURE__ */ R("p", {
					className: "m-0 select-all pt-2 font-mono text-2xs text-faint",
					children: e.id
				})
			]
		})
	] });
}
function Mr({ node: e, paths: t, setBind: n, anchors: r }) {
	let { store: a } = B(), s = w("patterns/list", { working: !0 }, { staleTime: 3e4 }), c = s.data?.find((t) => t.handle === e.props?.ref), l = e.props?.values ?? {}, u = e.bind ?? {};
	return /* @__PURE__ */ z(zn, { children: [
		/* @__PURE__ */ R(Z, {
			fields: [{
				handle: "ref",
				type: "select",
				size: "sm",
				label: C("Component"),
				required: !0,
				options: (s.data ?? []).filter((e) => e.synced).map((e) => ({
					value: e.handle,
					label: e.title
				}))
			}],
			values: { ref: e.props?.ref },
			onChange: (t, n) => n && a.updateProps(e.id, {
				ref: n,
				values: {}
			})
		}),
		(c?.props ?? []).map((i) => /* @__PURE__ */ R(Ar, {
			field: {
				...i,
				placeholder: i.placeholder ?? (Or.includes(i.type) ? i.label : void 0)
			},
			value: l[i.handle] ?? i.default,
			bound: u[`values.${i.handle}`],
			paths: t,
			onValue: (t) => a.updateProps(e.id, { values: {
				...l,
				[i.handle]: t
			} }, `values:${e.id}:${i.handle}`),
			onBind: (e) => n(`values.${i.handle}`, e),
			extra: i.type === "url" ? {
				component: "link",
				reference: !0,
				anchors: r
			} : void 0
		}, i.handle)),
		/* @__PURE__ */ z("div", {
			className: "-ml-2 flex gap-1 pt-1",
			children: [c?.id && /* @__PURE__ */ R(M, {
				size: "sm",
				variant: "ghost",
				icon: "b-pencil-simple",
				onClick: () => b(`/content/components/${c.id}`),
				children: C("Edit Component")
			}), /* @__PURE__ */ R(M, {
				size: "sm",
				variant: "ghost",
				icon: "b-scissors",
				onClick: () => {
					if (!c) return;
					let t = i(a.get().nodes, e.id);
					if (!t) return;
					let n = c.blocks.map((e) => d(e));
					a.commit(h(o(a.get().nodes, e.id), t.parentId, t.index, n)), a.select(n[0]?.id ?? null);
				},
				disabled: !c,
				children: C("Detach")
			})]
		})
	] });
}
function Nr({ node: e }) {
	let { store: t, catalog: n } = B(), r = n.sources?.find((t) => t.name === e.props?.source), i = (n, r) => t.updateProps(e.id, { [n]: r }, `repeat:${e.id}:${n}`);
	return /* @__PURE__ */ z(zn, { children: [
		/* @__PURE__ */ R(Z, {
			fields: [{
				handle: "source",
				type: "select",
				size: "sm",
				label: C("List"),
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
		/* @__PURE__ */ R(Z, {
			fields: (r?.fields ?? []).map((e) => ({
				...e,
				size: "sm",
				width: "full"
			})),
			values: Object.fromEntries((r?.fields ?? []).map((t) => [t.handle, e.props?.[t.handle]])),
			onChange: (e, t) => i(e, t)
		}),
		/* @__PURE__ */ R(Z, {
			fields: [{
				handle: "empty",
				type: "text",
				size: "sm",
				commit: "blur",
				label: C("When Empty"),
				placeholder: C("Show Nothing")
			}],
			values: { empty: e.props?.empty },
			onChange: (e, t) => i(e, t || void 0)
		})
	] });
}
function Pr({ node: e }) {
	let { store: t } = B(), n = (n, r) => t.updateProps(e.id, { [n]: r }, `repeat:${e.id}:${n}`);
	return /* @__PURE__ */ R(Z, {
		fields: [{
			handle: "tag",
			type: "select",
			size: "sm",
			label: C("HTML Tag"),
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
			label: C("Item Name"),
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
function Fr(e) {
	let { store: t, catalog: n } = B(), r = V(t, (e) => e.breakpoint), i = V(t, (e) => e.state), a = Ne(r, i), o = Pe(r, i), s = e.style ?? {}, c = n.aliases ?? {}, l = (e) => {
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
function Ir(e) {
	let t = [], n = 0, r = "";
	for (let i of e.trim()) i === "(" && n++, i === ")" && n--, /\s/.test(i) && n === 0 ? (r && t.push(r), r = "") : r += i;
	return r && t.push(r), t;
}
function Lr(e) {
	let t = [], n = 0, r = "";
	for (let i of e) i === "(" && n++, i === ")" && n--, i === "," && n === 0 ? (t.push(r.trim()), r = "") : r += i;
	return r.trim() && t.push(r.trim()), t;
}
function Rr(e) {
	if (e === void 0 || e === "") return null;
	let t = Ir(String(e));
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
function Q({ s: e, fields: t, bare: n }) {
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
	return /* @__PURE__ */ R(Z, {
		bare: n,
		fields: a,
		values: i,
		onChange: (t, n) => {
			let a = r.find((e) => e.handle === t);
			if (a.set) return a.set(n);
			if (!n || typeof n != "object") return e.set(t, n);
			let o = Br(i[t] ?? {}, n);
			Object.keys(o).length && e.write(o);
		}
	});
}
var zr = (e) => e === "none" ? void 0 : e;
function Br(e, t) {
	return Object.fromEntries(Object.entries(t ?? {}).filter(([t, n]) => n !== e[t]));
}
// admin/src/builder/design/Border.tsx
var Vr = [
	"borderTopLeftRadius",
	"borderTopRightRadius",
	"borderBottomRightRadius",
	"borderBottomLeftRadius"
], Hr = [
	"borderTop",
	"borderRight",
	"borderBottom",
	"borderLeft"
], Ur = [
	"solid",
	"dashed",
	"dotted",
	"double",
	"none"
], Wr = (e) => Ur.includes(e), Gr = (e) => /^-?[\d.]/.test(e) || /^token:(space|border)/.test(e) || /^(thin|medium|thick)$/.test(e);
function Kr(e) {
	let t = Ir(e ?? "");
	return {
		width: t.find(Gr),
		style: t.find(Wr),
		color: t.find((e) => !Gr(e) && !Wr(e))
	};
}
var qr = (e) => e.width || e.style || e.color ? [
	e.width ?? "1px",
	e.style ?? "solid",
	e.color
].filter(Boolean).join(" ") : null, Jr = () => [
	{
		value: "solid",
		label: C("Solid")
	},
	{
		value: "dashed",
		label: C("Dashed")
	},
	{
		value: "dotted",
		label: C("Dotted")
	},
	{
		value: "double",
		label: C("Double")
	},
	{
		value: "none",
		label: C("None")
	}
];
function Yr({ s: e }) {
	let [t, n] = A(() => Hr.find((t) => e.value(t)) ?? "all"), r = Kr(e.value("border")), i = {
		width: e.value("borderWidth") ?? r.width,
		style: e.value("borderStyle") ?? r.style,
		color: e.value("borderColor") ?? r.color
	}, a = t === "all" ? i : Kr(e.value(t)), o = Vr.map((t) => e.value(t)), s = (t) => e.value(Vr[t]) ?? Rr(e.value("borderRadius"))?.[t], c = Kr(e.value("outline")), l = i.width || i.style || i.color || e.value("borderRadius") || o.some(Boolean) || Hr.some((t) => e.value(t)) || e.value("outline"), u = (t) => (t === "all" ? [
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
		}) : e.set(t, qr(r));
	}, p = (e, t, n) => ({
		value: e,
		icon: t,
		title: d(e) ? `${n} · ${d(e) === "own" ? C("set") : C("inherited")}` : n
	});
	return /* @__PURE__ */ z(X, {
		title: C("Border"),
		empty: !l,
		children: [/* @__PURE__ */ R(Q, {
			s: e,
			fields: [
				{
					handle: "edge",
					type: "select",
					display: "segmented",
					block: !0,
					required: !0,
					size: "sm",
					label: C("Sides"),
					keys: [],
					get: () => t,
					set: (e) => e && n(e),
					options: [
						p("all", "b-side-all", C("All Sides")),
						p("borderTop", "b-side-top", C("Top")),
						p("borderRight", "b-side-right", C("Right")),
						p("borderBottom", "b-side-bottom", C("Bottom")),
						p("borderLeft", "b-side-left", C("Left"))
					]
				},
				{
					handle: "line",
					type: "group",
					component: "blocks-group",
					label: C("Width"),
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
					set: (e) => f(Br({
						width: a.width,
						style: a.style
					}, e)),
					fields: [{
						handle: "width",
						type: "text",
						component: "blocks-value",
						label: C("Width"),
						placeholder: "0",
						min: 0,
						prefixIcon: "b-square"
					}, {
						handle: "style",
						type: "select",
						size: "sm",
						label: C("Style"),
						options: Jr(),
						placeholder: C("Style")
					}]
				},
				{
					handle: "lineColor",
					type: "color",
					component: "blocks-color",
					label: C("Color"),
					placeholder: C("Text Color"),
					keys: t === "all" ? ["border", "borderColor"] : [t],
					status: t === "all" ? zr(e.status("borderColor")) : d(t),
					get: () => a.color,
					set: (e) => f({ color: e ?? void 0 })
				},
				{
					handle: "radius",
					type: "group",
					component: "blocks-group",
					label: C("Radius"),
					status: e.status("borderRadius") === "own" || Vr.some((t) => e.status(t) === "own") ? "own" : zr(e.status("borderRadius")),
					keys: ["borderRadius", ...Vr],
					columns: 2,
					split: o.some(Boolean),
					splitLabel: C("Each Corner"),
					joinLabel: C("Same radius for every corner"),
					link: {
						handle: "borderRadius",
						type: "text",
						component: "blocks-value",
						label: C("Radius"),
						group: "radius",
						prefixIcon: "b-frame-corners",
						placeholder: "0",
						min: 0
					},
					fields: Vr.map((e, t) => ({
						handle: e,
						type: "text",
						component: "blocks-value",
						label: [
							C("Top Left"),
							C("Top Right"),
							C("Bottom Right"),
							C("Bottom Left")
						][t],
						title: [
							C("Top Left"),
							C("Top Right"),
							C("Bottom Right"),
							C("Bottom Left")
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
						...Object.fromEntries(Vr.map((e, t) => [e, s(t)]))
					}),
					set: (t) => {
						if (t.borderRadius !== e.value("borderRadius")) return e.set("borderRadius", t.borderRadius);
						e.write({
							borderRadius: null,
							...Object.fromEntries(Vr.map((e) => [e, t[e] ?? null]))
						});
					}
				}
			]
		}), /* @__PURE__ */ R("div", {
			className: "!mt-3 border-t border-border pt-2",
			children: /* @__PURE__ */ R(Q, {
				s: e,
				fields: [
					{
						handle: "outlineLine",
						type: "group",
						component: "blocks-group",
						label: C("Outline"),
						keys: ["outline"],
						get: () => ({
							width: c.width,
							style: c.style
						}),
						set: (t) => e.set("outline", qr({
							...c,
							...Br({
								width: c.width,
								style: c.style
							}, t)
						})),
						fields: [{
							handle: "width",
							type: "text",
							component: "blocks-value",
							label: C("Width"),
							placeholder: "0",
							min: 0,
							prefixIcon: "b-selection"
						}, {
							handle: "style",
							type: "select",
							size: "sm",
							label: C("Style"),
							options: Jr(),
							placeholder: C("Style")
						}]
					},
					c.width || c.style ? {
						handle: "outlineColor",
						type: "color",
						component: "blocks-color",
						label: C("Outline Color"),
						placeholder: C("Text Color"),
						keys: ["outline"],
						get: () => c.color,
						set: (t) => e.set("outline", qr({
							...c,
							color: t ?? void 0
						}))
					} : null,
					c.width || c.style || e.value("outlineOffset") ? {
						handle: "outlineOffset",
						type: "text",
						component: "blocks-value",
						label: C("Offset"),
						placeholder: "0",
						prefixIcon: "b-arrows-out-simple"
					} : null
				]
			})
		})]
	});
}
// admin/src/builder/design/Css.tsx
function Xr({ s: e }) {
	let { catalog: t } = B(), [n, r] = A(!1), i = e.style[e.variant] ?? {}, a = Object.keys(i), o = Object.keys(t.styles);
	return /* @__PURE__ */ z(X, {
		title: C("CSS"),
		open: !1,
		empty: a.length === 0 && !n,
		actions: /* @__PURE__ */ R(Xn, {
			label: C("Add a Property"),
			onClick: () => r(!0)
		}),
		children: [
			/* @__PURE__ */ R("datalist", {
				id: "cms-css-properties",
				children: o.map((e) => /* @__PURE__ */ R("option", { value: e }, e))
			}),
			/* @__PURE__ */ R(Q, {
				s: e,
				bare: !0,
				fields: [{
					handle: "css",
					type: "json",
					component: "blocks-pairs",
					className: "items-start",
					label: C("CSS"),
					key: {
						list: "cms-css-properties",
						allowed: o,
						className: "!w-[46%] !flex-none"
					},
					item: {
						handle: "value",
						type: "text",
						component: "blocks-value",
						label: C("Value"),
						unit: "",
						property: !0
					},
					get: () => i,
					set: (t) => e.write({
						...Object.fromEntries(a.filter((e) => !(e in t)).map((e) => [e, null])),
						...Object.fromEntries(Object.entries(t).filter(([e, t]) => t !== i[e]))
					})
				}]
			}),
			n && /* @__PURE__ */ R(Z, {
				bare: !0,
				fields: [{
					handle: "property",
					type: "text",
					size: "sm",
					commit: "blur",
					label: C("Property"),
					list: "cms-css-properties",
					mono: !0,
					placeholder: C("Property, e.g. scrollSnapType")
				}],
				values: { property: "" },
				onChange: (t, n) => {
					r(!1), o.includes(n.trim()) && e.set(n.trim(), "initial");
				}
			})
		]
	});
}
// admin/src/builder/design/Effects.tsx
var Zr = [
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
], Qr = [
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
function $r({ s: e }) {
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
	return /* @__PURE__ */ z(X, {
		title: C("Effects"),
		empty: !t,
		children: [
			/* @__PURE__ */ R(Q, {
				s: e,
				fields: [{
					handle: "opacity",
					type: "text",
					component: "blocks-value",
					label: C("Opacity"),
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
			/* @__PURE__ */ R(Q, {
				s: e,
				bare: !0,
				fields: [{
					handle: "boxShadow",
					type: "text",
					component: "blocks-shadows",
					label: C("Shadows"),
					group: "shadow"
				}]
			}),
			/* @__PURE__ */ R(Q, {
				s: e,
				bare: !0,
				fields: [{
					handle: "filter",
					type: "text",
					component: "blocks-filters",
					label: C("Filters")
				}]
			}),
			/* @__PURE__ */ R(Q, {
				s: e,
				bare: !0,
				fields: [{
					handle: "backdropFilter",
					type: "text",
					component: "blocks-filters",
					label: C("Backdrop"),
					instructions: C("Filters what is behind the element, like frosted glass")
				}]
			}),
			/* @__PURE__ */ R(Q, {
				s: e,
				fields: [
					{
						handle: "clipPath",
						type: "text",
						component: "blocks-clip",
						label: C("Clip Path"),
						className: "items-start py-0.5 [&>label]:leading-6"
					},
					{
						handle: "mixBlendMode",
						type: "select",
						size: "sm",
						label: C("Blending"),
						placeholder: C("Normal"),
						options: Zr
					},
					{
						handle: "cursor",
						type: "select",
						size: "sm",
						label: C("Cursor"),
						placeholder: C("Auto"),
						options: Qr
					},
					{
						handle: "pointerEvents",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: C("Clicks"),
						placeholder: "auto",
						options: [{
							value: "auto",
							label: C("On")
						}, {
							value: "none",
							label: C("Pass Through")
						}]
					}
				]
			})
		]
	});
}
// admin/src/builder/color.tsx
function ei(e) {
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
function ti({ r: e, g: t, b: n, a: r }) {
	let i = (e) => Math.round(e).toString(16).padStart(2, "0");
	return r >= 1 ? `#${i(e)}${i(t)}${i(n)}` : `rgb(${Math.round(e)} ${Math.round(t)} ${Math.round(n)} / ${Math.round(r * 100)}%)`;
}
function ni({ r: e, g: t, b: n }) {
	e /= 255, t /= 255, n /= 255;
	let r = Math.max(e, t, n), i = r - Math.min(e, t, n);
	return {
		h: ((i === 0 ? 0 : r === e ? (t - n) / i % 6 : r === t ? (n - e) / i + 2 : (e - t) / i + 4) * 60 + 360) % 360,
		s: r === 0 ? 0 : i / r,
		v: r
	};
}
function ri(e, t, n, r) {
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
function ii(e) {
	return /^token:[a-z]+\.[a-z0-9-]+(\/\d{1,3})?$/.test(e) ? !0 : typeof CSS < "u" && CSS.supports("color", e);
}
function ai() {
	let { byPath: e } = je();
	return (t) => t ? t.replace(/token:([a-z]+\.[a-z0-9-]+)(?:\/(\d+))?/g, (t, n, r) => {
		let i = e.get(n), a = i ? String(i.value) : "transparent";
		return r ? `color-mix(in srgb, ${a} ${r}%, transparent)` : a;
	}) : "transparent";
}
function oi({ field: e, value: t, onChange: n }) {
	let [r, i] = A(!1), a = ai(), o = tr(), s = t ?? void 0, c = o(s);
	return /* @__PURE__ */ R(lr, { children: /* @__PURE__ */ R(fe, {
		open: r,
		onOpenChange: i,
		align: "end",
		className: "w-64 !p-0",
		trigger: /* @__PURE__ */ z("button", {
			type: "button",
			id: L(e),
			className: I(Kn, "flex items-center gap-1.5 pl-1 text-left"),
			children: [/* @__PURE__ */ R(Jn, {
				color: a(s),
				className: "!size-4"
			}), c ? /* @__PURE__ */ R(ir, {
				token: c.token,
				alpha: c.alpha
			}) : /* @__PURE__ */ R("span", {
				className: I("truncate font-mono", !s && "font-sans text-faint"),
				children: s ?? e.placeholder ?? C("None")
			})]
		}),
		children: /* @__PURE__ */ R(si, {
			label: e.label || C("Color"),
			value: s,
			onChange: n
		})
	}) });
}
function si({ label: e, value: t, onChange: n }) {
	let { byGroup: r } = je(), i = r.get("color") ?? [], a = ai(), o = t?.startsWith("token:") ? t.slice(6).split("/")[0] : null, s = ei(t?.startsWith("token:") ? a(t.split("/")[0]) : t) ?? {
		r: 0,
		g: 0,
		b: 0,
		a: 1
	}, [c, l] = A(() => ({
		...ni(s),
		a: t?.includes("/") && t.startsWith("token:") ? Number(t.split("/")[1]) / 100 : s.a
	})), [u, d] = A(t ?? ""), f = gr(u, (e) => !e.trim() || ii(e.trim())), [p, m] = A(() => i.length > 0 && (!t || t.startsWith("token:")) ? "tokens" : "custom"), h = k(null);
	O(() => d(t ?? ""), [t]);
	let g = (e, t, r, i) => {
		l({
			h: e,
			s: t,
			v: r,
			a: i
		}), n(ti(ri(e, t, r, i)));
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
	}, v = o ? t?.includes("/") ? Number(t.split("/")[1]) / 100 : 1 : c.a, y = o ? a(`token:${o}`) : ti({ ...ri(c.h, c.s, c.v, 1) }), b = /* @__PURE__ */ z("div", {
		onPointerDown: (e) => _(e, "alpha"),
		className: "relative h-2.5 cursor-ew-resize rounded-full [background:repeating-conic-gradient(#ddd_0_25%,#fff_0_50%)_0_0/8px_8px]",
		children: [/* @__PURE__ */ R("span", {
			className: "absolute inset-0 rounded-full",
			style: { background: `linear-gradient(to right, transparent, ${y})` }
		}), /* @__PURE__ */ R("span", {
			className: "pointer-events-none absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.3)]",
			style: { left: `${v * 100}%` }
		})]
	}), x = /* @__PURE__ */ R("button", {
		type: "button",
		onClick: () => n(null),
		className: "h-7 shrink-0 rounded-sm px-2 text-xs text-muted hover:bg-hover hover:text-ink",
		children: C("Clear")
	});
	return /* @__PURE__ */ z("div", { children: [/* @__PURE__ */ z("div", {
		className: "flex h-9 items-center gap-2 border-b border-border pl-2.5 pr-1.5",
		children: [/* @__PURE__ */ R("span", {
			className: "min-w-0 flex-1 truncate text-xs font-medium text-text",
			children: e
		}), i.length > 0 && /* @__PURE__ */ R(me, {
			size: "xs",
			value: p,
			onChange: m,
			options: [{
				value: "tokens",
				label: C("Tokens")
			}, {
				value: "custom",
				label: C("Custom")
			}]
		})]
	}), p === "tokens" ? /* @__PURE__ */ z("div", { children: [/* @__PURE__ */ R("div", {
		role: "listbox",
		"aria-label": C("Color Tokens"),
		className: "max-h-60 overflow-y-auto p-1",
		children: i.map((e) => /* @__PURE__ */ z("button", {
			type: "button",
			role: "option",
			"aria-selected": o === e.path,
			title: `${e.path} · ${String(e.value)}${e.dark ? ` / ${String(e.dark)}` : ""}`,
			onClick: () => n(`token:${e.path}`),
			className: I("flex h-7 w-full items-center gap-2 rounded-xs px-1.5 text-left text-xs hover:bg-hover", o === e.path && "bg-active"),
			children: [
				/* @__PURE__ */ R(Jn, {
					color: String(e.value),
					dark: e.dark ? String(e.dark) : void 0,
					className: "!size-4"
				}),
				/* @__PURE__ */ R("span", {
					className: "min-w-0 flex-1 truncate text-text",
					children: e.name
				}),
				/* @__PURE__ */ R("span", {
					className: "max-w-[45%] shrink-0 truncate font-mono text-2xs text-faint",
					children: String(e.value)
				}),
				o === e.path ? /* @__PURE__ */ R(P, {
					name: "b-check",
					size: 12,
					className: "shrink-0 text-focus"
				}) : /* @__PURE__ */ R("span", { className: "w-3 shrink-0" })
			]
		}, e.path))
	}), /* @__PURE__ */ z("div", {
		className: "flex items-center gap-2 border-t border-border px-2.5 py-2",
		children: [o ? /* @__PURE__ */ z(Se, { children: [
			/* @__PURE__ */ R("span", {
				className: "shrink-0 text-xs text-muted",
				children: C("Opacity")
			}),
			/* @__PURE__ */ R("div", {
				className: "min-w-0 flex-1",
				children: b
			}),
			/* @__PURE__ */ z("span", {
				className: "w-8 shrink-0 text-right text-2xs tabular-nums text-muted",
				children: [Math.round(v * 100), "%"]
			})
		] }) : /* @__PURE__ */ R("span", { className: "flex-1" }), x]
	})] }) : /* @__PURE__ */ z("div", {
		className: "space-y-2 p-2.5",
		children: [
			/* @__PURE__ */ R("div", {
				ref: h,
				onPointerDown: (e) => _(e, "area"),
				className: "relative h-32 cursor-crosshair rounded-sm",
				style: { background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${c.h} 100% 50%))` },
				children: /* @__PURE__ */ R("span", {
					className: "pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.3)]",
					style: {
						left: `${c.s * 100}%`,
						top: `${(1 - c.v) * 100}%`
					}
				})
			}),
			/* @__PURE__ */ R("div", {
				onPointerDown: (e) => _(e, "hue"),
				className: "relative h-2.5 cursor-ew-resize rounded-full",
				style: { background: "linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)" },
				children: /* @__PURE__ */ R("span", {
					className: "pointer-events-none absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.3)]",
					style: { left: `${c.h / 360 * 100}%` }
				})
			}),
			b,
			/* @__PURE__ */ z("div", {
				className: "flex gap-1.5",
				children: [/* @__PURE__ */ R("input", {
					value: u,
					spellCheck: !1,
					"aria-label": C("Color Value"),
					"aria-invalid": f.shown || void 0,
					onChange: (e) => d(e.target.value),
					onBlur: () => {
						let e = u.trim();
						if (e && !ii(e)) return d(t ?? "");
						e !== (t ?? "") && n(e || null);
					},
					onKeyDown: (e) => {
						e.key === "Escape" && d(t ?? ""), e.key === "Enter" && (u.trim() && !ii(u.trim()) ? f.show() : e.target.blur());
					},
					className: I(Kn, "font-mono"),
					placeholder: "#000000"
				}), x]
			})
		]
	})] });
}
// admin/src/builder/fields/style.tsx
function ci(e) {
	let t = e?.match(/^(linear|radial)-gradient\((.*)\)$/);
	if (!t) return null;
	let n = Lr(t[2]), r = t[1] === "linear" ? "180deg" : "circle";
	n[0] && (/deg$|^to /.test(n[0]) || /^(circle|ellipse)/.test(n[0])) && (r = n.shift());
	let i = n.map((e) => {
		let t = Ir(e);
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
function li(e) {
	return `${e.kind}-gradient(${[e.angle, ...e.stops.map((e) => `${e.color}${e.at ? ` ${e.at}` : ""}`)].join(", ")})`;
}
function ui({ value: e, onChange: t, context: n }) {
	let r = ai(), i = ci(e);
	if (!i) return null;
	let a = (e) => t(li(e));
	return /* @__PURE__ */ z("div", {
		className: "min-w-0 flex-1 space-y-1 rounded-md bg-active/60 p-1.5",
		children: [
			/* @__PURE__ */ R("div", {
				className: "h-6 rounded-sm shadow-[inset_0_0_0_1px_rgb(0_0_0/0.1)]",
				style: { background: r(li({
					...i,
					kind: "linear",
					angle: "90deg"
				})) }
			}),
			/* @__PURE__ */ R(Z, {
				bare: !0,
				context: n,
				fields: [{
					handle: "shape",
					type: "group",
					component: "blocks-group",
					label: C("Shape"),
					fields: [{
						handle: "kind",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: C("Kind"),
						required: !0,
						options: [{
							value: "linear",
							label: C("Linear")
						}, {
							value: "radial",
							label: C("Radial")
						}]
					}, {
						handle: "angle",
						type: "text",
						component: "blocks-value",
						label: C("Angle"),
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
			i.stops.map((e, t) => /* @__PURE__ */ z("div", {
				className: "flex items-center gap-1",
				children: [/* @__PURE__ */ R(Z, {
					bare: !0,
					className: "min-w-0 flex-1",
					context: n,
					fields: [{
						handle: "stop",
						type: "group",
						component: "blocks-group",
						label: C("Stop"),
						fields: [{
							handle: "color",
							type: "color",
							component: "blocks-color",
							label: C("Color")
						}, {
							handle: "at",
							type: "text",
							component: "blocks-value",
							label: C("Position"),
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
				}), i.stops.length > 2 && /* @__PURE__ */ R(Zn, { onClick: () => a({
					...i,
					stops: i.stops.filter((e, n) => n !== t)
				}) })]
			}, t)),
			/* @__PURE__ */ z("button", {
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
					/* @__PURE__ */ R(P, {
						name: "b-plus",
						size: 14
					}),
					" ",
					C("Add Stop")
				]
			})
		]
	});
}
var di = [
	"flex-start",
	"center",
	"flex-end"
], fi = () => [
	{
		value: "flex-start",
		label: C("Start")
	},
	{
		value: "center",
		label: C("Center")
	},
	{
		value: "flex-end",
		label: C("End")
	},
	{
		value: "space-between",
		label: C("Space Between")
	},
	{
		value: "space-around",
		label: C("Space Around")
	},
	{
		value: "space-evenly",
		label: C("Space Evenly")
	}
];
function pi({ field: e, value: t, onChange: n, context: r }) {
	let i = e.row === !0, a = t?.justifyContent ?? void 0, o = t?.alignItems ?? void 0;
	return /* @__PURE__ */ z(lr, { children: [/* @__PURE__ */ R("div", {
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
			let r = di[i ? t : e], s = di[i ? e : t], c = (a ?? "flex-start") === r && (o ?? "stretch").replace("stretch", "flex-start") === s;
			return /* @__PURE__ */ R("button", {
				type: "button",
				onClick: () => n({
					justifyContent: r,
					alignItems: s
				}),
				className: "grid place-items-center rounded-[2px] hover:bg-hover",
				title: `${r.replace("flex-", "")} · ${s.replace("flex-", "")}`,
				children: /* @__PURE__ */ R("span", { className: I("rounded-full", c ? "size-2 bg-ink" : "size-1 bg-faint") })
			}, `${t}${e}`);
		}))
	}), /* @__PURE__ */ R(Z, {
		bare: !0,
		className: "min-w-0 flex-1",
		context: r,
		fields: [{
			handle: "justifyContent",
			type: "select",
			size: "sm",
			label: C("Distribute"),
			options: fi(),
			placeholder: C("Distribute")
		}, {
			handle: "alignItems",
			type: "select",
			display: "segmented",
			block: !0,
			size: "sm",
			label: C("Align"),
			options: [
				{
					value: "flex-start",
					icon: i ? "b-align-top" : "b-align-left",
					title: C("Start")
				},
				{
					value: "center",
					icon: i ? "b-align-center-vertical" : "b-align-center-horizontal",
					title: C("Center")
				},
				{
					value: "flex-end",
					icon: i ? "b-align-bottom" : "b-align-right",
					title: C("End")
				},
				{
					value: "stretch",
					icon: i ? "b-arrows-out-line-vertical" : "b-arrows-out-line-horizontal",
					title: C("Stretch")
				},
				{
					value: "baseline",
					icon: "b-text-t",
					title: C("Baseline")
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
var mi = [
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
], hi = {
	left: "0%",
	top: "0%",
	center: "50%",
	right: "100%",
	bottom: "100%"
};
function gi(e) {
	let t = (e ?? "center").trim().split(/\s+/), n = (e) => e === "top" || e === "bottom";
	t.length === 1 && t.push("center");
	let [r, i] = n(t[0]) || t[1] && (t[1] === "left" || t[1] === "right") ? [t[1], t[0]] : t;
	return `${hi[r] ?? r} ${hi[i] ?? i}`;
}
function _i({ field: e, value: t, onChange: n, context: r, disabled: i }) {
	let a = gi(t);
	return /* @__PURE__ */ z(lr, { children: [/* @__PURE__ */ R("div", {
		className: "grid size-[60px] shrink-0 grid-cols-3 gap-px rounded-sm bg-bg p-1",
		role: "radiogroup",
		"aria-label": e.label,
		children: mi.flat().map((t) => {
			let r = a === gi(t);
			return /* @__PURE__ */ R("button", {
				type: "button",
				role: "radio",
				"aria-checked": r,
				disabled: i,
				onClick: () => n(t === "center" && !e.required ? null : t),
				className: "grid place-items-center rounded-[2px] hover:bg-hover",
				title: t,
				children: /* @__PURE__ */ R("span", { className: I("rounded-full", r ? "size-2 bg-ink" : "size-1 bg-faint") })
			}, t);
		})
	}), /* @__PURE__ */ R(cr, {
		field: {
			handle: `${e.handle}-value`,
			type: "text",
			component: "blocks-value",
			label: e.label,
			unit: "",
			placeholder: C("Center")
		},
		value: t ?? null,
		onChange: (e) => n(e || null),
		context: r,
		disabled: i
	})] });
}
// admin/src/builder/design/Fill.tsx
var vi = {
	backgroundImage: null,
	backgroundSize: null,
	backgroundPosition: null,
	backgroundRepeat: null
};
function yi({ s: e }) {
	let t = e.value("backgroundImage"), n = t ? ci(t) ? "gradient" : "image" : "none", r = !!S.fields.get("media"), i = t?.match(/^media:([0-9a-z]{26})$/i)?.[1], a = e.value("backgroundColor") || t;
	return /* @__PURE__ */ z(X, {
		title: C("Fill"),
		empty: !a,
		children: [
			/* @__PURE__ */ R(Q, {
				s: e,
				fields: [{
					handle: "backgroundColor",
					type: "color",
					component: "blocks-color",
					label: C("Color")
				}, {
					handle: "kind",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: C("Image"),
					options: [
						{
							value: "none",
							label: C("None")
						},
						{
							value: "gradient",
							icon: "b-gradient",
							title: C("Gradient")
						},
						{
							value: "image",
							icon: "b-image",
							title: C("Image")
						}
					],
					keys: ["backgroundImage"],
					reset: () => e.write(vi),
					get: () => n,
					set: (t) => {
						t === "gradient" ? e.set("backgroundImage", "linear-gradient(180deg, token:color.primary, token:color.background)") : t === "image" ? e.write({
							backgroundImage: "none",
							backgroundSize: "cover",
							backgroundPosition: "center"
						}) : e.write(vi);
					}
				}]
			}),
			n === "gradient" && /* @__PURE__ */ R(Q, {
				s: e,
				bare: !0,
				fields: [{
					handle: "backgroundImage",
					type: "text",
					component: "blocks-gradient",
					className: "items-start",
					label: C("Gradient")
				}]
			}),
			n === "image" && r && /* @__PURE__ */ R("div", {
				className: "rounded-md bg-active/60 p-1.5 text-xs",
				children: /* @__PURE__ */ R(N, {
					bare: !0,
					fields: [{
						handle: "bg",
						type: "media",
						label: C("Image"),
						max: 1,
						accept: "image/*"
					}],
					values: { bg: i ? [i] : [] },
					onChange: (t, n) => e.set("backgroundImage", n?.[0] ? `media:${n[0]}` : "none")
				})
			}),
			/* @__PURE__ */ R(Q, {
				s: e,
				fields: [
					n === "image" && !r && {
						handle: "mediaId",
						type: "text",
						component: "blocks-value",
						label: C("Media ID"),
						unit: "",
						get: () => i,
						set: (t) => e.set("backgroundImage", t ? `media:${t}` : null)
					},
					n === "image" && {
						handle: "backgroundSize",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: C("Size"),
						options: [
							{
								value: "cover",
								label: C("Cover")
							},
							{
								value: "contain",
								label: C("Contain")
							},
							{
								value: "auto",
								label: C("Original")
							}
						]
					},
					n === "image" && {
						handle: "backgroundPosition",
						type: "json",
						component: "blocks-origin",
						label: C("Position"),
						className: "items-start py-0.5 [&>label]:leading-6"
					},
					n === "image" && {
						handle: "backgroundRepeat",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: C("Repeat"),
						placeholder: "repeat",
						options: [
							{
								value: "no-repeat",
								label: C("Once")
							},
							{
								value: "repeat",
								label: C("Tile")
							},
							{
								value: "repeat-x",
								icon: "b-arrows-out-line-horizontal",
								title: C("Tile Across")
							},
							{
								value: "repeat-y",
								icon: "b-arrows-out-line-vertical",
								title: C("Tile Down")
							}
						]
					},
					n === "image" && {
						handle: "backgroundAttachment",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: C("Scrolling"),
						options: [{
							value: "scroll",
							label: C("With Page")
						}, {
							value: "fixed",
							label: C("Fixed")
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
						label: C("Clip"),
						options: [{
							value: "border-box",
							label: C("Box")
						}, {
							value: "text",
							label: C("Text")
						}],
						get: () => e.value("backgroundClip") ?? "border-box",
						set: (t) => e.write({
							backgroundClip: t === "text" ? "text" : null,
							color: t === "text" ? "transparent" : null
						})
					}
				]
			}),
			t && n === "image" && !i && t !== "none" && /* @__PURE__ */ R("p", {
				className: I("cms-input h-7 w-full min-w-0 rounded-sm px-2 text-sm placeholder:text-ghost", "h-auto py-1 font-mono"),
				children: t
			})
		]
	});
}
// admin/src/builder/design/Layout.tsx
var bi = () => [
	{
		value: "block",
		icon: "b-square",
		title: C("Block")
	},
	{
		value: "flex",
		icon: "b-rows",
		title: C("Stack (flex)")
	},
	{
		value: "grid",
		icon: "b-grid-four",
		title: C("Grid")
	},
	{
		value: "inline-flex",
		icon: "b-arrows-in-line-horizontal",
		title: C("Inline Stack")
	},
	{
		value: "none",
		icon: "b-eye-slash",
		title: C("Hidden")
	}
];
function xi({ s: e }) {
	let t = e.value("display"), n = t === "flex" || t === "inline-flex", r = t === "grid" || t === "inline-grid", i = n && (e.value("flexDirection") ?? "row").startsWith("row");
	return /* @__PURE__ */ R(X, {
		title: C("Layout"),
		empty: !t,
		children: /* @__PURE__ */ R(Q, {
			s: e,
			fields: [
				{
					handle: "display",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: C("Display"),
					options: bi()
				},
				n && {
					handle: "flexDirection",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: C("Direction"),
					get: () => e.value("flexDirection") ?? "row",
					options: [
						{
							value: "row",
							icon: "b-arrow-right",
							title: C("Horizontal")
						},
						{
							value: "column",
							icon: "b-arrow-down",
							title: C("Vertical")
						},
						{
							value: "row-reverse",
							icon: "b-arrow-left",
							title: C("Horizontal, Reversed")
						},
						{
							value: "column-reverse",
							icon: "b-arrow-up",
							title: C("Vertical, Reversed")
						}
					]
				},
				n && {
					handle: "align",
					type: "json",
					component: "blocks-align",
					label: C("Align"),
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
					label: C("Gap"),
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
					label: C("Wrap"),
					options: [{
						value: "nowrap",
						label: C("One Line")
					}, {
						value: "wrap",
						label: C("Wrap")
					}],
					get: () => e.value("flexWrap") ?? "nowrap",
					set: (t) => e.set("flexWrap", t === "wrap" ? "wrap" : null)
				},
				r && {
					handle: "gridTemplateColumns",
					type: "text",
					component: "blocks-value",
					label: C("Columns"),
					placeholder: C("3 or 1fr 2fr"),
					unit: "",
					min: 1,
					title: C("A number of equal columns, or any grid template (1fr 2fr, repeat(auto-fill, minmax(16rem, 1fr)))")
				},
				r && {
					handle: "gridTemplateRows",
					type: "text",
					component: "blocks-value",
					label: C("Rows"),
					placeholder: "auto",
					unit: ""
				},
				r && {
					handle: "gaps",
					type: "group",
					component: "blocks-group",
					label: C("Gap"),
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
						label: C("Columns"),
						group: "space",
						prefixIcon: "b-split-horizontal",
						placeholder: "0",
						min: 0
					}, {
						handle: "rowGap",
						type: "text",
						component: "blocks-value",
						label: C("Rows"),
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
					label: C("Align"),
					keys: ["alignItems", "justifyItems"],
					get: () => e.value("alignItems"),
					options: [
						{
							value: "start",
							icon: "b-align-top",
							title: C("Top")
						},
						{
							value: "center",
							icon: "b-align-center-vertical",
							title: C("Middle")
						},
						{
							value: "end",
							icon: "b-align-bottom",
							title: C("Bottom")
						},
						{
							value: "stretch",
							icon: "b-arrows-out-line-vertical",
							title: C("Stretch")
						}
					]
				},
				r && {
					handle: "gridAutoFlow",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: C("Flow"),
					options: [
						{
							value: "row",
							icon: "b-arrow-right",
							title: C("Rows First")
						},
						{
							value: "column",
							icon: "b-arrow-down",
							title: C("Columns First")
						},
						{
							value: "row dense",
							icon: "b-squares-four",
							title: C("Fill Gaps (Dense)")
						}
					]
				}
			]
		})
	});
}
function Si({ s: e, parentDisplay: t }) {
	if (!t || !/flex|grid/.test(t)) return null;
	let n = t.includes("grid");
	return /* @__PURE__ */ R(X, {
		title: C(n ? "Grid Item" : "Stack Item"),
		open: !1,
		empty: !e.value("alignSelf") && !e.value("flex") && !e.value("gridColumn"),
		children: /* @__PURE__ */ R(Q, {
			s: e,
			fields: [
				n && {
					handle: "gridColumn",
					type: "text",
					component: "blocks-value",
					label: C("Column"),
					placeholder: "auto",
					unit: "",
					title: C("Span a number of columns (2), or a range (1 / -1 for full width)")
				},
				n && {
					handle: "gridRow",
					type: "text",
					component: "blocks-value",
					label: C("Row"),
					placeholder: "auto",
					unit: ""
				},
				!n && {
					handle: "flex",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: C("Grow"),
					options: [
						{
							value: "1 1 0%",
							label: C("Fill")
						},
						{
							value: "0 0 auto",
							label: C("Fixed")
						},
						{
							value: "0 1 auto",
							label: C("Shrink")
						}
					]
				},
				{
					handle: "alignSelf",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: C("Align Self"),
					options: [
						{
							value: "flex-start",
							icon: "b-align-top",
							title: C("Start")
						},
						{
							value: "center",
							icon: "b-align-center-vertical",
							title: C("Center")
						},
						{
							value: "flex-end",
							icon: "b-align-bottom",
							title: C("End")
						},
						{
							value: "stretch",
							icon: "b-arrows-out-line-vertical",
							title: C("Stretch")
						}
					]
				},
				{
					handle: "order",
					type: "text",
					component: "blocks-value",
					label: C("Display Order"),
					unit: "",
					placeholder: "0",
					prefixIcon: "b-list-numbers"
				}
			]
		})
	});
}
// admin/src/builder/design/Position.tsx
function Ci({ s: e }) {
	let t = e.value("position"), n = !!t && t !== "static";
	return /* @__PURE__ */ R(X, {
		title: C("Position"),
		open: !!t,
		empty: !t,
		children: /* @__PURE__ */ R(Q, {
			s: e,
			fields: [
				{
					handle: "position",
					type: "select",
					size: "sm",
					label: C("Type"),
					placeholder: C("Static"),
					options: [
						{
							value: "static",
							label: C("Static")
						},
						{
							value: "relative",
							label: C("Relative")
						},
						{
							value: "absolute",
							label: C("Absolute")
						},
						{
							value: "fixed",
							label: C("Fixed")
						},
						{
							value: "sticky",
							label: C("Sticky")
						}
					],
					instructions: t === "absolute" ? C("Placed inside the nearest positioned parent") : t === "fixed" ? C("Stays in the window while the page scrolls") : t === "sticky" ? C("Sticks once its parent scrolls past the offset") : void 0
				},
				n && {
					handle: "offsets",
					type: "group",
					component: "blocks-group",
					label: C("Offsets"),
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
							top: C("Top"),
							right: C("Right"),
							bottom: C("Bottom"),
							left: C("Left")
						}[e],
						title: {
							top: C("Top"),
							right: C("Right"),
							bottom: C("Bottom"),
							left: C("Left")
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
					label: C("Z-index"),
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
					label: C("Isolation"),
					placeholder: "auto",
					options: [{
						value: "auto",
						label: C("Auto")
					}, {
						value: "isolate",
						label: C("Isolate")
					}],
					instructions: C("A new stacking context: keeps blend modes and z-index inside")
				}
			]
		})
	});
}
// admin/src/builder/design/Size.tsx
function wi(e, t, n) {
	let r = e.value(t), i = r === "100%" ? "fill" : r === "fit-content" ? "fit" : r === "auto" || !r ? "auto" : r.endsWith("vh") || r.endsWith("vw") || r.endsWith("dvh") ? "viewport" : "fixed", a = {
		fill: C("Fill"),
		fit: C("Fit"),
		auto: C("Auto"),
		viewport: C("Window"),
		fixed: C("Fixed")
	};
	return {
		handle: t,
		type: "text",
		component: "blocks-value",
		label: n,
		prefix: t === "width" ? "W" : "H",
		placeholder: C("Auto"),
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
					label: C("Fill the Parent (100%)"),
					value: "100%",
					checked: i === "fill"
				},
				{
					label: C("Fit the Content"),
					value: "fit-content",
					checked: i === "fit"
				},
				{
					label: C("Auto"),
					value: null,
					checked: i === "auto"
				},
				{
					label: C(t === "width" ? "Window Width (100vw)" : "Window Height (100dvh)"),
					value: t === "width" ? "100vw" : "100dvh",
					checked: i === "viewport"
				}
			]
		}
	};
}
function Ti({ s: e, media: t }) {
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
	return /* @__PURE__ */ R(X, {
		title: C("Size"),
		empty: !n,
		children: /* @__PURE__ */ R(Q, {
			s: e,
			fields: [
				wi(e, "width", C("Width")),
				wi(e, "height", C("Height")),
				{
					handle: "limits",
					type: "group",
					component: "blocks-group",
					label: C("Min · Max"),
					columns: 2,
					fields: [
						{
							handle: "minWidth",
							type: "text",
							component: "blocks-value",
							label: C("Min Width"),
							prefix: "W",
							placeholder: C("Min"),
							title: C("Minimum Width"),
							min: 0
						},
						{
							handle: "maxWidth",
							type: "text",
							component: "blocks-value",
							label: C("Max Width"),
							prefix: "W",
							placeholder: C("Max"),
							group: "container",
							title: C("Maximum Width"),
							min: 0,
							keywords: ["none"]
						},
						{
							handle: "minHeight",
							type: "text",
							component: "blocks-value",
							label: C("Min Height"),
							prefix: "H",
							placeholder: C("Min"),
							title: C("Minimum Height"),
							min: 0
						},
						{
							handle: "maxHeight",
							type: "text",
							component: "blocks-value",
							label: C("Max Height"),
							prefix: "H",
							placeholder: C("Max"),
							title: C("Maximum Height"),
							min: 0,
							keywords: ["none"]
						}
					]
				},
				{
					handle: "aspectRatio",
					type: "select",
					size: "sm",
					label: C("Aspect"),
					placeholder: C("Auto"),
					options: [
						{
							value: "1/1",
							label: C("1:1 square")
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
							label: C("3:4 portrait")
						},
						{
							value: "4/5",
							label: "4:5"
						},
						{
							value: "9/16",
							label: C("9:16 story")
						}
					]
				},
				{
					handle: "overflow",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: C("Overflow"),
					placeholder: "visible",
					options: [
						{
							value: "visible",
							icon: "b-eye",
							title: C("Visible")
						},
						{
							value: "hidden",
							icon: "b-eye-slash",
							title: C("Hidden")
						},
						{
							value: "auto",
							icon: "b-mouse-scroll",
							title: C("Scroll When Needed")
						},
						{
							value: "clip",
							icon: "b-scissors",
							title: C("Clip, without scrolling")
						}
					]
				},
				t && {
					handle: "objectFit",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: C("Fit"),
					options: [
						{
							value: "cover",
							label: C("Cover")
						},
						{
							value: "contain",
							label: C("Contain")
						},
						{
							value: "fill",
							label: C("Stretch")
						},
						{
							value: "none",
							label: C("None")
						}
					]
				},
				t && {
					handle: "objectPosition",
					type: "json",
					component: "blocks-origin",
					label: C("Focus"),
					className: "items-start py-0.5 [&>label]:leading-6"
				}
			]
		})
	});
}
// admin/src/builder/design/Spacing.tsx
var Ei = [
	"Top",
	"Right",
	"Bottom",
	"Left"
];
function Di(e, t, n) {
	return [
		`${t}${Ei[n]}`,
		n % 2 == 0 ? `${t}Block` : `${t}Inline`,
		t
	].find((t) => e.value(t) !== void 0) ?? null;
}
function Oi(e, t, n) {
	let r = Di(e, t, n);
	if (!r) return;
	let i = e.value(r);
	if (r === t) return Rr(i)?.[n];
	if (r.endsWith("Block") || r.endsWith("Inline")) {
		let [e, t] = Ir(String(i));
		return n === 0 || n === 3 ? e : t ?? e;
	}
	return i;
}
var ki = (e) => [
	e,
	`${e}Block`,
	`${e}Inline`,
	...Ei.map((t) => `${e}${t}`)
];
function Ai({ s: e }) {
	let t = ["margin", "padding"], n = t.some((t) => Ei.some((n, r) => Oi(e, t, r))), r = Object.fromEntries(t.map((t) => [t, [
		0,
		1,
		2,
		3
	].map((n) => Oi(e, t, n))])), i = Object.fromEntries(t.map((t) => [t, [
		0,
		1,
		2,
		3
	].map((n) => {
		let r = Di(e, t, n);
		return r ? e.status(r) === "own" ? "own" : "inherited" : "none";
	})])), a = (t, n) => {
		let r = {
			[t]: null,
			[`${t}Block`]: null,
			[`${t}Inline`]: null
		}, i = n.every((e) => e !== void 0 && e === n[0]);
		i && (r[t] = n[0]), Ei.forEach((e, a) => r[`${t}${e}`] = i ? null : n[a] ?? null), e.write(r);
	};
	return /* @__PURE__ */ R(X, {
		title: C("Spacing"),
		empty: !n,
		children: /* @__PURE__ */ R(Q, {
			s: e,
			bare: !0,
			fields: [{
				handle: "spacing",
				type: "json",
				component: "blocks-spacing",
				className: "items-start",
				label: C("Spacing"),
				sideStatus: i,
				keys: [...ki("margin"), ...ki("padding")],
				get: () => r,
				set: (e) => t.forEach((t) => e[t] !== r[t] && a(t, e[t]))
			}]
		})
	});
}
// admin/src/builder/design/StateBar.tsx
var ji = () => [
	{
		value: "",
		label: C("Default")
	},
	{
		value: "hover",
		label: C("Hover")
	},
	{
		value: "active",
		label: C("Pressed")
	},
	{
		value: "focus-visible",
		label: C("Focus")
	}
], Mi = () => [
	{
		value: "before",
		label: C("Before")
	},
	{
		value: "after",
		label: C("After")
	},
	{
		value: "placeholder",
		label: C("Placeholder")
	},
	{
		value: "first",
		label: C("First Item")
	},
	{
		value: "last",
		label: C("Last Item")
	},
	{
		value: "odd",
		label: C("Odd Items")
	},
	{
		value: "even",
		label: C("Even Items")
	},
	{
		value: "current",
		label: C("Current Page")
	},
	{
		value: "group-hover",
		label: C("Hover on Hover Group")
	},
	{
		value: "dark",
		label: C("Dark Mode")
	},
	{
		value: "open",
		label: C("When Open")
	}
];
function Ni({ node: t }) {
	let { store: n } = B(), r = V(n, (e) => e.state), i = V(n, (e) => e.breakpoint), a = V(n, (n) => e(n.nodes, t.id)), o = /* @__PURE__ */ new Set([
		...Object.keys(t.logic?.states ?? {}).map((e) => `is-${e}`),
		...Object.keys(t.bind ?? {}).filter((e) => e.startsWith("state:")).map((e) => `is-${e.slice(6)}`),
		...t.logic?.behaviors?.scroll ? ["is-scrolled", ...t.logic.behaviors.scroll.hide ? ["is-hidden"] : []] : [],
		...Object.keys(t.style ?? {}).map((e) => e.split(":").pop()).filter((e) => e.startsWith("is-") || e.startsWith("in-"))
	]), s = /* @__PURE__ */ new Set();
	for (let e of a) Object.keys(e.logic?.states ?? {}).forEach((e) => s.add(`in-${e}`)), e.logic?.behaviors?.scroll && s.add("in-scrolled");
	let c = [...o, ...s].filter((e, t, n) => n.indexOf(e) === t), l = (e) => e.startsWith("is-") ? e.slice(3) : e.startsWith("in-") ? C("in {state}", { state: e.slice(3) }) : [...ji(), ...Mi()].find((t) => t.value === e)?.label ?? e, u = (e) => n.setStyleState(e), d = (e) => Object.keys(t.style ?? {}).some((t) => t === e || t.endsWith(`:${e}`)), f = async () => {
		let e = await ye({
			title: C("Custom State"),
			description: C("A state a script, behavior or data sets (is-open). Style it here, set it in Interact → States."),
			fields: [{
				handle: "name",
				type: "text",
				label: C("Name"),
				placeholder: "open, active…",
				mono: !0
			}],
			confirm: C("Style It")
		}), t = String(e?.name ?? "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
		t && u(`is-${t}`);
	}, p = [
		...ji(),
		...c.map((e) => ({
			value: e,
			label: l(e)
		})),
		...r && !ji().some((e) => e.value === r) && !c.includes(r) ? [{
			value: r,
			label: l(r)
		}] : []
	], m = i === "tablet" ? C("Tablet and Phone") : i === "mobile" ? C("Phone") : i;
	return /* @__PURE__ */ z("div", {
		className: "space-y-2 border-b border-border px-4 py-3",
		children: [/* @__PURE__ */ z("div", {
			className: "flex items-start gap-1",
			children: [/* @__PURE__ */ R("div", {
				"data-wrap": !0,
				className: "flex min-w-0 flex-1 flex-wrap gap-0.5 rounded-md bg-active p-0.5",
				role: "radiogroup",
				"aria-label": C("State"),
				children: p.map((e) => /* @__PURE__ */ z("button", {
					type: "button",
					role: "radio",
					"aria-checked": r === e.value,
					onClick: () => u(e.value),
					className: I("relative flex h-6 flex-[1_0_auto] items-center justify-center gap-1 whitespace-nowrap rounded-[6px] px-1.5 text-xs font-medium transition-colors duration-120", r === e.value ? "bg-float text-ink shadow-raise dark:bg-[color-mix(in_srgb,var(--cms-float),var(--cms-ink)_12%)]" : "text-muted hover:text-text"),
					children: [/* @__PURE__ */ R("span", { children: e.label }), e.value && d(e.value) && r !== e.value && /* @__PURE__ */ R("span", {
						className: "size-1 shrink-0 rounded-full bg-current opacity-70",
						"aria-hidden": !0
					})]
				}, e.value || "default"))
			}), /* @__PURE__ */ R(F, {
				align: "end",
				trigger: /* @__PURE__ */ R("button", {
					type: "button",
					className: "grid size-7 shrink-0 place-items-center rounded-sm text-muted hover:bg-hover hover:text-ink",
					"aria-label": C("More States"),
					title: C("More States"),
					children: /* @__PURE__ */ R(P, {
						name: "b-plus",
						size: 14
					})
				}),
				items: [
					...Mi().map((e) => ({
						label: e.label,
						onSelect: () => u(e.value),
						checked: r === e.value
					})),
					{
						separator: !0,
						label: ""
					},
					{
						label: C("Custom State…"),
						onSelect: () => void f()
					}
				]
			})]
		}), i !== "base" && /* @__PURE__ */ z("div", {
			className: "flex h-7 items-center gap-2 rounded-sm bg-bg px-2 text-xs text-text",
			children: [
				/* @__PURE__ */ R(P, {
					name: i === "mobile" ? "b-device-mobile" : "b-device-tablet",
					size: 14,
					className: "shrink-0 text-muted"
				}),
				/* @__PURE__ */ R("span", {
					className: "min-w-0 flex-1 truncate",
					children: m
				}),
				/* @__PURE__ */ R("button", {
					type: "button",
					onClick: () => n.setBreakpoint("base"),
					className: "shrink-0 rounded-xs px-1 text-muted hover:text-ink",
					children: C("Back to Desktop")
				})
			]
		})]
	});
}
// admin/src/builder/design/Transform.tsx
var Pi = (e, t) => e?.match(RegExp(`${t}\\(([^)]*)\\)`))?.[1];
function Fi({ s: e }) {
	let t = Ir(e.value("translate") ?? ""), n = e.value("transform"), r = [
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
		X: Pi(n, "skewX"),
		Y: Pi(n, "skewY")
	}, o = (n, r) => {
		let i = [t[0] ?? "0", t[1] ?? "0"];
		i[n] = r ?? "0", e.set("translate", i.every((e) => e === "0" || e === "0px") ? null : i.join(" "));
	}, s = (t, r) => {
		let i = Ir(n ?? "").filter((e) => !e.startsWith(`skew${t}(`));
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
	return /* @__PURE__ */ R(X, {
		title: C("Transform"),
		open: !!r,
		empty: !r,
		children: /* @__PURE__ */ R(Q, {
			s: e,
			fields: [
				{
					handle: "move",
					type: "group",
					component: "blocks-group",
					label: C("Move"),
					keys: ["translate"],
					fields: c("px"),
					get: () => i,
					set: (e) => Object.entries(Br(i, e)).forEach(([e, t]) => o(e === "x" ? 0 : 1, t ?? null))
				},
				{
					handle: "rotate",
					type: "text",
					component: "blocks-value",
					label: C("Rotate"),
					unit: "deg",
					prefixIcon: "b-arrow-clockwise",
					placeholder: "0"
				},
				{
					handle: "scale",
					type: "text",
					component: "blocks-value",
					label: C("Scale"),
					unit: "",
					step: .01,
					prefixIcon: "b-arrows-out-simple",
					placeholder: "1"
				},
				{
					handle: "skew",
					type: "group",
					component: "blocks-group",
					label: C("Skew"),
					keys: ["transform"],
					fields: c("deg").map((e) => ({
						...e,
						handle: e.handle.toUpperCase()
					})),
					get: () => a,
					set: (e) => Object.entries(Br(a, e)).forEach(([e, t]) => s(e, t ?? null))
				},
				{
					handle: "transformOrigin",
					type: "json",
					component: "blocks-origin",
					label: C("Origin"),
					className: "items-start py-0.5 [&>label]:leading-6"
				},
				{
					handle: "perspective",
					type: "text",
					component: "blocks-value",
					label: C("Perspective"),
					prefixIcon: "b-perspective",
					placeholder: "none",
					keywords: ["none"],
					instructions: C("Depth for children rotated in 3D")
				}
			]
		})
	});
}
// admin/src/builder/design/Transition.tsx
var Ii = () => [
	{
		value: "all",
		label: C("Everything")
	},
	{
		value: "color, background-color, border-color, text-decoration-color, fill, stroke",
		label: C("Colors")
	},
	{
		value: "transform, translate, rotate, scale",
		label: C("Transform")
	},
	{
		value: "opacity",
		label: C("Opacity")
	},
	{
		value: "opacity, transform, translate, scale",
		label: C("Opacity and Transform")
	},
	{
		value: "box-shadow",
		label: C("Shadow")
	}
];
function Li(e) {
	if (!e) return null;
	let t = Ir(e.replace(/,\s*(?![^(]*\))/g, ", ")), n = t.filter((e) => /^[\d.]+m?s$/.test(e) || e.startsWith("token:duration")), r = t.find((e) => /^(ease|linear|cubic-bezier|steps|token:ease)/.test(e));
	return {
		property: e.split(/\s+\d/)[0].replace(/\s+(ease|linear|cubic-bezier).*$/, "").trim() || "all",
		duration: n[0] ?? "200ms",
		ease: r ?? "ease",
		delay: n[1]
	};
}
function Ri({ s: e }) {
	let { byGroup: t } = je(), n = Li(e.value("transition")), r = (t) => {
		let r = {
			property: "all",
			duration: "200ms",
			ease: "cubic-bezier(0.2, 0.8, 0.2, 1)",
			...n,
			...t
		}, i = r.property.split(",").map((e) => e.trim());
		e.set("transition", i.map((e) => `${e} ${r.duration} ${r.ease}${r.delay ? ` ${r.delay}` : ""}`).join(", "));
	};
	return /* @__PURE__ */ R(X, {
		title: C("Transition"),
		open: !!n,
		empty: !n,
		children: n ? /* @__PURE__ */ R(Q, {
			s: e,
			fields: [
				{
					handle: "property",
					type: "select",
					size: "sm",
					label: C("Animate"),
					placeholder: C("Everything"),
					options: Ii(),
					keys: ["transition"],
					get: () => Ii().find((e) => e.value.split(",")[0].trim() === n.property.split(",")[0].trim())?.value,
					set: (e) => r({ property: e ?? "all" })
				},
				{
					handle: "timing",
					type: "group",
					component: "blocks-group",
					label: C("Duration"),
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
						label: C("Duration"),
						unit: "ms",
						step: 10,
						min: 0,
						group: "duration",
						prefixIcon: "b-timer"
					}, {
						handle: "delay",
						type: "text",
						component: "blocks-value",
						label: C("Delay"),
						unit: "ms",
						step: 10,
						min: 0,
						prefixIcon: "b-pause",
						placeholder: C("Delay")
					}]
				},
				{
					handle: "ease",
					type: "select",
					component: "blocks-ease",
					label: C("Curve"),
					keys: ["transition"],
					get: () => n.ease,
					set: (e) => r({ ease: e ?? "ease" }),
					options: [
						...(t.get("ease") ?? []).map((e) => ({
							value: `token:${e.path}`,
							label: e.name
						})),
						"ease",
						"ease-in-out",
						"linear",
						{
							value: "cubic-bezier(0.2, 0.8, 0.2, 1)",
							label: C("Smooth Out")
						},
						{
							value: "cubic-bezier(0.65, 0, 0.35, 1)",
							label: C("Smooth In-Out")
						},
						{
							value: "cubic-bezier(0.34, 1.56, 0.64, 1)",
							label: C("Overshoot")
						}
					]
				}
			]
		}) : /* @__PURE__ */ z("button", {
			type: "button",
			onClick: () => r({}),
			className: "flex h-7 w-full items-center justify-center gap-1.5 rounded-sm text-xs text-muted hover:bg-hover hover:text-ink",
			children: [/* @__PURE__ */ R(P, {
				name: "b-plus",
				size: 14
			}), C("Animate State Changes")]
		})
	});
}
// admin/src/builder/design/Typography.tsx
var zi = () => [
	{
		value: "100",
		label: C("Thin 100")
	},
	{
		value: "200",
		label: C("Extra Light 200")
	},
	{
		value: "300",
		label: C("Light 300")
	},
	{
		value: "400",
		label: C("Regular 400")
	},
	{
		value: "500",
		label: C("Medium 500")
	},
	{
		value: "600",
		label: C("Semibold 600")
	},
	{
		value: "700",
		label: C("Bold 700")
	},
	{
		value: "800",
		label: C("Extra Bold 800")
	},
	{
		value: "900",
		label: C("Black 900")
	}
];
function Bi({ s: e }) {
	let { byGroup: t } = je(), n = t.get("font") ?? [], r = t.get("weight") ?? [], i = [
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
	].some((t) => e.value(t)), a = Ir(e.value("textStroke") ?? ""), o = {
		width: a.find((e) => /^-?[\d.]/.test(e)),
		color: a.find((e) => !/^-?[\d.]/.test(e))
	};
	return /* @__PURE__ */ z(X, {
		title: C("Typography"),
		empty: !i,
		children: [
			/* @__PURE__ */ R(Q, {
				s: e,
				fields: [
					{
						handle: "fontFamily",
						type: "select",
						size: "sm",
						label: C("Font"),
						placeholder: C("Inherit"),
						options: n.map((e) => ({
							value: `token:${e.path}`,
							label: `${e.path} · ${Array.isArray(e.value) ? e.value[0] : e.value}`
						}))
					},
					{
						handle: "fontWeight",
						type: "select",
						size: "sm",
						label: C("Weight"),
						placeholder: C("Inherit"),
						options: [...r.map((e) => ({
							value: `token:${e.path}`,
							label: `${e.path} · ${e.value}`
						})), ...zi()]
					},
					{
						handle: "fontSize",
						type: "text",
						component: "blocks-value",
						label: C("Size"),
						group: "text",
						prefixIcon: "b-text-aa",
						placeholder: C("Inherit"),
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
						label: C("Line Height"),
						group: "leading",
						prefixIcon: "b-arrows-vertical",
						unit: "",
						step: .05,
						placeholder: C("Inherit"),
						title: C("Line Height (1.2 = 120%)")
					},
					{
						handle: "letterSpacing",
						type: "text",
						component: "blocks-value",
						label: C("Letter Spacing"),
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
						label: C("Color"),
						placeholder: C("Inherit")
					},
					{
						handle: "textAlign",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: C("Align"),
						placeholder: "left",
						options: [
							{
								value: "left",
								icon: "b-text-align-left",
								title: C("Left")
							},
							{
								value: "center",
								icon: "b-text-align-center",
								title: C("Center")
							},
							{
								value: "right",
								icon: "b-text-align-right",
								title: C("Right")
							},
							{
								value: "justify",
								icon: "b-text-align-justify",
								title: C("Justify")
							}
						]
					},
					{
						handle: "fontStyle",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: C("Style"),
						placeholder: "normal",
						options: [{
							value: "normal",
							icon: "b-text-t",
							title: C("Upright")
						}, {
							value: "italic",
							icon: "b-text-italic",
							title: C("Italic")
						}]
					},
					{
						handle: "textDecoration",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: C("Decoration"),
						placeholder: "none",
						options: [
							{
								value: "none",
								icon: "b-x",
								title: C("No Decoration")
							},
							{
								value: "underline",
								icon: "b-text-underline",
								title: C("Underline")
							},
							{
								value: "line-through",
								icon: "b-text-strikethrough",
								title: C("Strike Through")
							}
						]
					},
					{
						handle: "textTransform",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: C("Case"),
						placeholder: "none",
						options: [
							{
								value: "none",
								icon: "b-x",
								title: C("As Typed")
							},
							{
								value: "uppercase",
								label: "AA",
								title: C("Uppercase")
							},
							{
								value: "capitalize",
								label: "Aa",
								title: C("Capitalize")
							},
							{
								value: "lowercase",
								label: "aa",
								title: C("Lowercase")
							}
						]
					},
					{
						handle: "textWrap",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: C("Wrap"),
						options: [
							{
								value: "balance",
								label: C("Balance")
							},
							{
								value: "pretty",
								label: C("Pretty")
							},
							{
								value: "nowrap",
								label: C("None")
							}
						]
					},
					{
						handle: "lineClamp",
						type: "text",
						component: "blocks-value",
						label: C("Max Lines"),
						unit: "",
						min: 1,
						placeholder: C("All"),
						prefixIcon: "b-list-dashes"
					}
				]
			}),
			/* @__PURE__ */ R(Q, {
				s: e,
				bare: !0,
				fields: [{
					handle: "textShadow",
					type: "text",
					component: "blocks-shadows",
					kind: "text",
					label: C("Text Shadow")
				}]
			}),
			/* @__PURE__ */ R(Q, {
				s: e,
				fields: [{
					handle: "stroke",
					type: "group",
					component: "blocks-group",
					label: C("Text Stroke"),
					keys: ["textStroke"],
					instructions: C("Outlined text (set the color to transparent)"),
					get: () => o,
					set: (t) => {
						let n = {
							...o,
							...Br(o, t)
						};
						e.set("textStroke", n.width ? `${n.width} ${n.color ?? "currentColor"}` : null);
					},
					fields: [{
						handle: "width",
						type: "text",
						component: "blocks-value",
						label: C("Width"),
						prefixIcon: "b-pencil-simple",
						placeholder: "0",
						min: 0,
						step: .5,
						className: "!flex-none w-[72px]"
					}, {
						handle: "color",
						type: "color",
						component: "blocks-color",
						label: C("Color"),
						placeholder: C("Text Color")
					}]
				}]
			})
		]
	});
}
// admin/src/builder/design/DesignPanel.tsx
function Vi({ node: e }) {
	let { types: t, store: n } = B(), r = t.get(e.type), i = Fr(e), a = V(n, (t) => l(t.nodes, e.id)), o = a ? a.style?.base?.display ?? (a.type === "stack" || a.type === "columns" || a.type === "grid" ? "flex" : void 0) : void 0, s = new Set(r?.styles?.length ? r.styles : [
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
	]), c = !!r?.children || e.type === "repeat";
	return e.type === "pattern" ? /* @__PURE__ */ R("p", {
		className: "m-0 p-4 text-xs text-muted",
		children: C("Edit the component to change its shared design.")
	}) : /* @__PURE__ */ z("div", { children: [
		/* @__PURE__ */ R(Ni, { node: e }),
		s.has("layout") && c && /* @__PURE__ */ R(xi, { s: i }),
		/* @__PURE__ */ R(Si, {
			s: i,
			parentDisplay: o
		}),
		s.has("position") && /* @__PURE__ */ R(Ci, { s: i }),
		s.has("size") && /* @__PURE__ */ R(Ti, {
			s: i,
			media: [
				"image",
				"video",
				"embed"
			].includes(e.type)
		}),
		s.has("spacing") && /* @__PURE__ */ R(Ai, { s: i }),
		s.has("typography") && /* @__PURE__ */ R(Bi, { s: i }),
		s.has("fill") && /* @__PURE__ */ R(yi, { s: i }),
		s.has("border") && /* @__PURE__ */ R(Yr, { s: i }),
		s.has("effects") && /* @__PURE__ */ R($r, { s: i }),
		s.has("transform") && /* @__PURE__ */ R(Fi, { s: i }),
		s.has("transition") && /* @__PURE__ */ R(Ri, { s: i }),
		/* @__PURE__ */ R(Xr, { s: i })
	] });
}
// admin/src/builder/logic/LogicPanel.tsx
var Hi = () => [
	{
		value: "click",
		label: C("Click")
	},
	{
		value: "mouseenter",
		label: C("Pointer Enters")
	},
	{
		value: "mouseleave",
		label: C("Pointer Leaves")
	},
	{
		value: "focus",
		label: C("Gets Focus")
	},
	{
		value: "blur",
		label: C("Loses Focus")
	},
	{
		value: "input",
		label: C("Typing")
	},
	{
		value: "change",
		label: C("Value Changes")
	},
	{
		value: "submit",
		label: C("Form Submit")
	},
	{
		value: "keydown",
		label: C("Key Pressed")
	},
	{
		value: "enter",
		label: C("Scrolls into View")
	},
	{
		value: "leave",
		label: C("Scrolls Out of View")
	},
	{
		value: "scroll",
		label: C("Page Scrolls")
	},
	{
		value: "resize",
		label: C("Window Resizes")
	},
	{
		value: "init",
		label: C("Page Loads")
	}
], Ui = () => [
	{
		value: "prevent",
		label: C("Prevent Default")
	},
	{
		value: "stop",
		label: C("Stop Propagation")
	},
	{
		value: "outside",
		label: C("Outside This Element")
	},
	{
		value: "window",
		label: C("Anywhere on the Page")
	},
	{
		value: "once",
		label: C("Only Once")
	},
	{
		value: "self",
		label: C("On This Element Only")
	},
	{
		value: "debounce",
		label: C("Debounce")
	}
], Wi = () => [
	{
		value: "set",
		label: C("Set State"),
		icon: "b-pencil-simple"
	},
	{
		value: "toggle",
		label: C("Toggle State"),
		icon: "b-toggle-left"
	},
	{
		value: "add",
		label: C("Add to Number"),
		icon: "b-plus"
	},
	{
		value: "if",
		label: C("If … Then … Else"),
		icon: "b-git-branch"
	},
	{
		value: "play",
		label: C("Play Animation"),
		icon: "b-play"
	},
	{
		value: "scroll",
		label: C("Scroll To"),
		icon: "b-mouse-scroll"
	},
	{
		value: "fetch",
		label: C("Load Page Part"),
		icon: "b-arrow-square-out"
	},
	{
		value: "copy",
		label: C("Copy to Clipboard"),
		icon: "b-copy"
	},
	{
		value: "go",
		label: C("Go to Link"),
		icon: "b-link"
	},
	{
		value: "theme",
		label: C("Light or Dark Mode"),
		icon: "b-moon"
	},
	{
		value: "focus",
		label: C("Focus Element"),
		icon: "b-crosshair"
	},
	{
		value: "lock",
		label: C("Lock Page Scrolling"),
		icon: "b-lock-simple"
	},
	{
		value: "wait",
		label: C("Wait"),
		icon: "b-timer"
	},
	{
		value: "dispatch",
		label: C("Send Event"),
		icon: "b-broadcast"
	},
	{
		value: "run",
		label: C("Expression"),
		icon: "b-brackets-curly"
	}
];
function Gi(t) {
	let { store: n } = B(), r = V(n, (n) => e(n.nodes, t.id));
	return [...new Set([...r, t].flatMap((e) => Object.keys(e.logic?.data ?? {})))];
}
function Ki(e) {
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
var qi = (e) => typeof e == "string" ? `'${e}'` : JSON.stringify(e), Ji = (e, t, n = {}) => ({
	handle: e,
	type: "text",
	size: "sm",
	commit: "blur",
	label: t,
	mono: !0,
	max: 1e4,
	list: Yi,
	placeholder: "open, count > 3, tab === 'a'",
	...n
}), Yi = "cms-logic-variables", Xi = (e, ...t) => e ? t : [], Zi = [
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
function Qi({ node: e }) {
	let { store: t, types: n } = B(), r = e.logic ?? {}, i = Gi(e), a = (n) => {
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
	return /* @__PURE__ */ z(Se, { children: [
		/* @__PURE__ */ R("datalist", {
			id: Yi,
			children: [...i, ...i.map((e) => `!${e}`)].map((e) => /* @__PURE__ */ R("option", { value: e }, e))
		}),
		/* @__PURE__ */ R(X, {
			title: C("State"),
			empty: !r.data,
			open: !!r.data,
			actions: /* @__PURE__ */ R(Xn, {
				label: C("Add Variable"),
				onClick: () => {
					let e = "open", t = 1;
					for (; e in o;) e = `value${t++}`;
					a({ data: {
						...o,
						[e]: e !== "open" && ""
					} });
				}
			}),
			children: /* @__PURE__ */ R(Z, {
				bare: !0,
				fields: [{
					handle: "data",
					type: "json",
					component: "blocks-pairs",
					className: "items-start",
					label: C("Variables"),
					key: { strip: "[^a-zA-Z0-9_]" },
					join: "=",
					item: {
						handle: "value",
						type: "text",
						size: "sm",
						commit: "blur",
						label: C("Value"),
						mono: !0
					}
				}],
				values: { data: Object.fromEntries(Object.entries(o).map(([e, t]) => [e, qi(t)])) },
				onChange: (e, t) => a({ data: Object.fromEntries(Object.entries(t).map(([e, t]) => [e, e in o && qi(o[e]) === t ? o[e] : Ki(t ?? "")])) })
			})
		}),
		/* @__PURE__ */ R(X, {
			title: C("Code Component"),
			open: !!r.component,
			empty: !r.component,
			children: /* @__PURE__ */ R(Z, {
				fields: [{
					handle: "component",
					type: "text",
					size: "sm",
					commit: "blur",
					label: C("Alpine Name"),
					placeholder: "pricingCalculator",
					mono: !0,
					status: r.component ? "own" : void 0,
					reset: () => a({ component: void 0 }),
					instructions: C("An Alpine component from the site’s custom JavaScript. Replaces State.")
				}],
				values: { component: r.component },
				onChange: (e, t) => a({ component: String(t ?? "").replace(/[^a-zA-Z0-9_$]/g, "") || void 0 })
			})
		}),
		/* @__PURE__ */ z(X, {
			title: C("Events"),
			empty: !r.on?.length && !r.init?.length,
			open: !!r.on?.length || !!r.init?.length,
			actions: /* @__PURE__ */ R(Xn, {
				label: C("Add Event"),
				onClick: () => a({ on: [...r.on ?? [], {
					event: "click",
					actions: []
				}] })
			}),
			children: [
				r.init && /* @__PURE__ */ R(ea, {
					title: C("Page Loads"),
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
					return /* @__PURE__ */ R(ea, {
						title: /* @__PURE__ */ R(Z, {
							bare: !0,
							className: "min-w-0 flex-1",
							fields: [{
								handle: "trigger",
								type: "group",
								component: "blocks-group",
								label: C("Event"),
								fields: [{
									handle: "event",
									type: "select",
									size: "sm",
									label: C("Event"),
									required: !0,
									options: Hi().filter((e) => e.value !== "init")
								}, {
									handle: "key",
									type: "text",
									size: "sm",
									commit: "blur",
									label: C("Keyboard Key"),
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
				!r.init && (r.on?.length ?? 0) > 0 && /* @__PURE__ */ z("button", {
					type: "button",
					onClick: () => a({ init: [] }),
					className: "flex h-7 w-full items-center gap-1.5 rounded-sm px-1.5 text-xs text-muted hover:bg-hover hover:text-ink",
					children: [
						/* @__PURE__ */ R(P, {
							name: "b-plus",
							size: 14
						}),
						" ",
						C("When the Page Loads")
					]
				})
			]
		}),
		/* @__PURE__ */ z(X, {
			title: C("Bindings"),
			empty: !r.show && !r.states && !r.text && !r.attrs,
			open: !!(r.show || r.states || r.text || r.attrs),
			children: [
				/* @__PURE__ */ R(Z, {
					fields: [Ji("show", C("Show When"), {
						placeholder: C("Always"),
						status: r.show ? "own" : void 0,
						reset: () => a({
							show: void 0,
							transition: void 0
						})
					}), ...Xi(r.show, {
						handle: "transition",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: C("Transition"),
						options: [
							{
								value: "none",
								label: C("None")
							},
							{
								value: "fade",
								label: C("Fade")
							},
							{
								value: "scale",
								label: C("Scale")
							},
							{
								value: "collapse",
								label: C("Collapse")
							}
						]
					})],
					values: {
						show: r.show,
						transition: r.transition ?? "none"
					},
					onChange: (e, t) => a(e === "show" ? { show: t || void 0 } : { transition: t && t !== "none" ? t : void 0 })
				}),
				/* @__PURE__ */ R(Bn, {
					title: C("States"),
					action: /* @__PURE__ */ R(Xn, {
						label: C("Add State"),
						onClick: () => a({ states: {
							...r.states ?? {},
							[Object.keys(r.states ?? {}).length ? `state${Object.keys(r.states ?? {}).length + 1}` : "open"]: i[0] ?? "open"
						} })
					})
				}),
				/* @__PURE__ */ R(Z, {
					bare: !0,
					fields: [{
						handle: "states",
						type: "json",
						component: "blocks-pairs",
						className: "items-start",
						label: C("States"),
						key: {
							prefix: "is-",
							lower: !0,
							strip: "[^a-z0-9-]",
							className: "!w-[34%] !flex-none"
						},
						join: C("when"),
						item: Ji("expr", C("When"))
					}],
					values: { states: r.states },
					onChange: (e, t) => a({ states: t })
				}),
				/* @__PURE__ */ R(Z, {
					fields: [Ji("text", C("Text"), {
						placeholder: C("As Designed"),
						status: r.text ? "own" : void 0,
						reset: () => a({ text: void 0 }),
						instructions: C("Replace the text with a value, e.g. count")
					})],
					values: { text: r.text },
					onChange: (e, t) => a({ text: t || void 0 })
				}),
				/* @__PURE__ */ R(Bn, {
					title: C("Attributes"),
					action: /* @__PURE__ */ R(Xn, {
						label: C("Bind Attribute"),
						onClick: () => a({ attrs: {
							...r.attrs ?? {},
							"aria-expanded": i[0] ?? "open"
						} })
					})
				}),
				/* @__PURE__ */ R(Z, {
					bare: !0,
					fields: [{
						handle: "attrs",
						type: "json",
						component: "blocks-pairs",
						className: "items-start",
						label: C("Attributes"),
						key: {
							options: Zi,
							className: ""
						},
						item: Ji("expr", C("Value"))
					}],
					values: { attrs: r.attrs },
					onChange: (e, t) => a({ attrs: t })
				}),
				e.type === "input" && /* @__PURE__ */ R(Z, {
					fields: [{
						handle: "model",
						type: "select",
						size: "sm",
						label: C("Input Value"),
						placeholder: C("Not kept"),
						options: i,
						status: r.model ? "own" : void 0,
						reset: () => a({ model: void 0 }),
						instructions: C("Keep a variable in sync with what is typed")
					}],
					values: { model: r.model },
					onChange: (e, t) => a({ model: t || void 0 })
				})
			]
		}),
		/* @__PURE__ */ z(X, {
			title: C("Behaviors"),
			empty: !r.behaviors,
			open: !!r.behaviors,
			children: [
				/* @__PURE__ */ R($i, {
					on: !!c.scroll,
					label: C("Scroll States"),
					help: C("Adds is-scrolled once the page scrolls, for headers that change."),
					onToggle: (e) => a({ behaviors: {
						...c,
						scroll: e ? { threshold: 20 } : void 0
					} }),
					fields: [{
						handle: "threshold",
						type: "text",
						component: "blocks-value",
						label: C("After"),
						unit: "",
						prefix: "px"
					}, {
						handle: "hide",
						type: "toggle",
						size: "sm",
						label: C("Add is-hidden While Scrolling Down")
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
				/* @__PURE__ */ R($i, {
					on: !!c.spy,
					label: C("Scroll Spy"),
					help: C("Links to #sections inside get is-current while in view."),
					onToggle: (e) => a({ behaviors: {
						...c,
						spy: e ? { offset: 96 } : void 0
					} })
				}),
				/* @__PURE__ */ R($i, {
					on: !!c.group,
					label: C("Hover Group"),
					help: C("Children react when this whole element is hovered."),
					onToggle: (e) => a({ behaviors: {
						...c,
						group: e || void 0
					} })
				}),
				/* @__PURE__ */ R($i, {
					on: !!c.menu,
					label: C("Menu"),
					help: C("One panel moves between items: each child is a link or button, with an optional panel after it."),
					onToggle: (e) => a({ behaviors: {
						...c,
						menu: e ? {} : void 0
					} })
				}),
				/* @__PURE__ */ R($i, {
					on: !!c.carousel,
					label: C("Carousel"),
					help: C("The first child scrolls sideways. The first two buttons after it go back and forward."),
					onToggle: (e) => a({ behaviors: {
						...c,
						carousel: e ? {} : void 0
					} })
				}),
				/* @__PURE__ */ R($i, {
					on: !!c.marquee,
					label: C("Marquee"),
					help: C("Children scroll sideways in an endless loop."),
					onToggle: (e) => a({ behaviors: {
						...c,
						marquee: e ? { speed: 60 } : void 0
					} }),
					fields: [
						{
							handle: "speed",
							type: "text",
							component: "blocks-value",
							label: C("Speed"),
							unit: "",
							prefix: "px/s",
							title: C("Pixels per Second")
						},
						{
							handle: "reverse",
							type: "toggle",
							size: "sm",
							label: C("Reverse")
						},
						{
							handle: "pause",
							type: "toggle",
							size: "sm",
							label: C("Pause on Hover")
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
		s && /* @__PURE__ */ R(X, {
			title: C("Load Into"),
			open: !!r.target,
			empty: !r.target && !r.merge,
			children: /* @__PURE__ */ R(Z, {
				fields: [
					{
						handle: "target",
						type: "json",
						component: "blocks-nodes",
						label: C("Update"),
						exclude: e.id,
						add: C("Element to Update"),
						addValue: e.id,
						instructions: C("Load the link in the background and swap only these elements")
					},
					...Xi(r.target, {
						handle: "push",
						type: "toggle",
						size: "sm",
						label: C("Update the Address Bar")
					}),
					{
						handle: "merge",
						type: "select",
						size: "sm",
						label: C("When Loaded"),
						placeholder: C("Replace It"),
						instructions: C("How this element takes new content loaded into it"),
						options: [
							{
								value: "replace",
								label: C("Replace It")
							},
							{
								value: "update",
								label: C("Replace What Is Inside")
							},
							{
								value: "append",
								label: C("Add to the End")
							},
							{
								value: "prepend",
								label: C("Add to the Start")
							},
							{
								value: "morph",
								label: C("Morph (Keep State)")
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
function $i({ on: e, label: t, help: n, onToggle: r, fields: i, values: a, onChange: o }) {
	return /* @__PURE__ */ z("div", {
		className: I("-mx-1.5 rounded-sm px-1.5 py-1", e && "bg-sunken/60"),
		children: [/* @__PURE__ */ R(Z, {
			fields: [{
				handle: "on",
				type: "toggle",
				size: "sm",
				label: t,
				instructions: n
			}],
			values: { on: e },
			onChange: (e, t) => r(!!t)
		}), e && i && /* @__PURE__ */ R(Z, {
			className: "mt-1 space-y-1 pl-10",
			fields: i,
			values: a ?? {},
			onChange: o ?? (() => {})
		})]
	});
}
function ea({ title: e, mods: t, onMods: n, actions: r, onActions: i, onRemove: a, variables: o, node: s }) {
	return /* @__PURE__ */ z("div", {
		className: "space-y-1.5 rounded-sm border border-border p-1.5",
		children: [
			/* @__PURE__ */ z("div", {
				className: "flex items-center gap-1",
				children: [
					/* @__PURE__ */ R(P, {
						name: "b-lightning",
						size: 14,
						className: "shrink-0 text-muted"
					}),
					typeof e == "string" ? /* @__PURE__ */ R("span", {
						className: "min-w-0 flex-1 text-xs font-medium [overflow-wrap:anywhere]",
						children: e
					}) : e,
					n && /* @__PURE__ */ R(F, {
						align: "end",
						trigger: /* @__PURE__ */ R("button", {
							type: "button",
							className: I("grid size-6 shrink-0 place-items-center rounded-sm hover:bg-hover hover:text-ink", t?.length ? "text-ink" : "text-muted"),
							"aria-label": C("Event Options"),
							children: /* @__PURE__ */ R(P, {
								name: "b-faders",
								size: 14
							})
						}),
						items: Ui().map((e) => ({
							label: e.label,
							checked: t?.includes(e.value),
							onSelect: () => n(t?.includes(e.value) ? t.filter((t) => t !== e.value) : [...t ?? [], e.value])
						}))
					}),
					/* @__PURE__ */ R(Zn, {
						onClick: a,
						label: C("Remove Event")
					})
				]
			}),
			t && t.length > 0 && /* @__PURE__ */ R("p", {
				className: "m-0 pl-5 text-2xs text-faint [overflow-wrap:anywhere]",
				children: t.map((e) => Ui().find((t) => t.value === e)?.label).join(" · ")
			}),
			/* @__PURE__ */ R(ta, {
				actions: r,
				onChange: i,
				variables: o,
				node: s
			})
		]
	});
}
function ta({ actions: e, onChange: t, variables: n, node: r, depth: i = 0 }) {
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
	return /* @__PURE__ */ z("div", {
		className: I("space-y-1", i > 0 && "border-l border-border pl-2"),
		children: [e.map((a, s) => /* @__PURE__ */ z("div", {
			className: "space-y-1 rounded-md bg-active/60 p-1.5",
			children: [/* @__PURE__ */ z("div", {
				className: "flex items-center gap-1",
				children: [
					/* @__PURE__ */ R(P, {
						name: Wi().find((e) => e.value === a.do)?.icon ?? "b-dot-outline",
						size: 14,
						className: "shrink-0 text-muted"
					}),
					/* @__PURE__ */ R("span", {
						className: "min-w-0 flex-1 text-xs font-medium text-text [overflow-wrap:anywhere]",
						children: Wi().find((e) => e.value === a.do)?.label ?? a.do
					}),
					/* @__PURE__ */ R(Zn, {
						onClick: () => t(e.filter((e, t) => t !== s)),
						label: C("Remove Action")
					})
				]
			}), /* @__PURE__ */ R(ra, {
				action: a,
				onChange: (e) => o(s, e),
				variables: n,
				node: r,
				depth: i
			})]
		}, s)), /* @__PURE__ */ R(F, {
			align: "start",
			trigger: /* @__PURE__ */ z("button", {
				type: "button",
				className: "flex h-7 w-full items-center gap-1.5 rounded-sm px-1.5 text-xs text-muted hover:bg-hover hover:text-ink",
				children: [
					/* @__PURE__ */ R(P, {
						name: "b-plus",
						size: 14
					}),
					" ",
					C("Add Action")
				]
			}),
			items: Wi().map((e) => ({
				label: e.label,
				icon: e.icon,
				onSelect: () => a(e.value)
			}))
		})]
	});
}
var na = (e) => e === "top" || e === "bottom" ? e : e?.startsWith("#") ? "anchor" : "node";
function ra({ action: e, onChange: t, variables: r, node: i, depth: a }) {
	let { store: o } = B(), s = q(), c = V(o, (t) => e.do === "play" && e.node ? n(t.nodes, e.node) : null), l = {
		handle: "var",
		type: "select",
		size: "sm",
		label: C("Variable"),
		options: r,
		placeholder: C("Variable")
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
			f = [l, Ji("value", e.do === "set" ? C("To") : C("Add"), { placeholder: e.do === "set" ? "true, 'text', count + 1" : "1" })];
			break;
		case "toggle":
			f = [l];
			break;
		case "if":
			f = [Ji("test", C("If"), { placeholder: "open" })];
			break;
		case "play":
			f = [
				u("node", C("Element")),
				{
					handle: "motion",
					type: "select",
					size: "sm",
					label: C("Animation"),
					options: (c?.motion ?? []).map((e) => ({
						value: e.id,
						label: e.name || e.id
					})),
					placeholder: c?.motion?.length ? C("First Animation") : C("No animations on it")
				},
				d("mode", C("Play"), [
					{
						value: "play",
						label: C("Play")
					},
					{
						value: "reverse",
						label: C("Reverse")
					},
					{
						value: "toggle",
						label: C("Toggle")
					},
					{
						value: "restart",
						label: C("Restart")
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
					label: C("To"),
					required: !0,
					options: [
						{
							value: "top",
							label: C("Top of Page")
						},
						{
							value: "bottom",
							label: C("Bottom of Page")
						},
						{
							value: "anchor",
							label: C("Section")
						},
						{
							value: "node",
							label: C("Element")
						}
					]
				},
				{
					handle: "anchor",
					type: "select",
					size: "sm",
					label: C("Section"),
					options: s.map((e) => ({
						value: `#${e.id}`,
						label: e.label
					})),
					placeholder: C("Choose a Section"),
					if: { kind: "anchor" }
				},
				u("node", C("Element"), { if: { kind: "node" } }),
				{
					handle: "offset",
					type: "text",
					component: "blocks-value",
					label: C("Offset"),
					unit: "",
					prefix: "px",
					placeholder: "0",
					title: C("Offset in pixels, e.g. a sticky header’s height")
				}
			], p = {
				kind: na(e.to),
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
				label: C("Page"),
				placeholder: "/blog/page/2",
				mono: !0
			}, {
				handle: "target",
				type: "json",
				component: "blocks-nodes",
				label: C("Update"),
				instructions: C("Elements replaced with the same ones from that page"),
				addValue: i.id
			}];
			break;
		case "copy":
			f = [Ji("value", C("Text"), { placeholder: `'${C("Text to Copy")}'` })];
			break;
		case "go":
			f = [{
				handle: "url",
				type: "url",
				component: "link",
				reference: !0,
				size: "sm",
				label: C("Link"),
				anchors: s,
				newTab: !!e.newTab,
				onNewTab: (e) => t({ newTab: e || void 0 })
			}], m = (e, t) => ({ url: t ?? "" });
			break;
		case "theme":
			f = [d("mode", C("Mode"), [
				{
					value: "toggle",
					label: C("Switch")
				},
				{
					value: "light",
					label: C("Light")
				},
				{
					value: "dark",
					label: C("Dark")
				},
				{
					value: "system",
					label: C("System")
				}
			])], p = { mode: e.mode ?? "toggle" };
			break;
		case "focus":
			f = [u("node", C("Element"))], m = (e, t) => ({ node: t ?? void 0 });
			break;
		case "lock":
			f = [d("on", C("Scrolling"), [{
				value: "on",
				label: C("Lock")
			}, {
				value: "off",
				label: C("Unlock")
			}])], p = { on: e.on === !1 ? "off" : "on" }, m = (e, t) => ({ on: t !== "off" });
			break;
		case "wait":
			f = [{
				handle: "ms",
				type: "text",
				component: "blocks-value",
				label: C("Wait"),
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
				label: C("Event"),
				placeholder: "event-name",
				mono: !0
			}, Ji("detail", C("Detail"), { placeholder: "detail" })], m = (e, t) => ({ [e]: e === "detail" ? t || void 0 : t ?? "" });
			break;
		case "run":
			f = [Ji("expr", C("Run"), { placeholder: "count = count * 2" })];
			break;
		default: return /* @__PURE__ */ R("p", {
			className: I(Kn, "h-auto whitespace-pre-wrap font-mono [overflow-wrap:anywhere]"),
			children: JSON.stringify(e)
		});
	}
	return /* @__PURE__ */ z("div", {
		className: "space-y-1",
		children: [/* @__PURE__ */ R(Z, {
			fields: f,
			values: p,
			onChange: (e, n) => t(m(e, n))
		}), e.do === "if" && /* @__PURE__ */ z(Se, { children: [
			/* @__PURE__ */ R("p", {
				className: "cms-label m-0 pt-1",
				children: C("Then")
			}),
			/* @__PURE__ */ R(ta, {
				actions: e.then ?? [],
				onChange: (e) => t({ then: e }),
				variables: r,
				node: i,
				depth: a + 1
			}),
			/* @__PURE__ */ R("p", {
				className: "cms-label m-0 pt-1",
				children: C("Else")
			}),
			/* @__PURE__ */ R(ta, {
				actions: e.else ?? [],
				onChange: (e) => t({ else: e }),
				variables: r,
				node: i,
				depth: a + 1
			})
		] })]
	});
}
// admin/src/builder/motion/presets.ts
var ia = (e) => ({
	appear: C("Appear"),
	scroll: C("Scroll"),
	hover: C("Hover and Press"),
	loop: C("Loop"),
	load: C("Page Load"),
	event: C("On Event")
})[e], $ = "power3.out", aa = () => [
	{
		name: C("Fade In"),
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
		name: C("Fade Up"),
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
		name: C("Slide in from Left"),
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
		name: C("Scale In"),
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
		name: C("Blur In"),
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
		name: C("Reveal (Wipe Up)"),
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
		name: C("Children one by one"),
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
		name: C("Words Rise"),
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
		name: C("Words Slide Up (Masked)"),
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
		name: C("Parallax"),
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
		name: C("Zoom While Scrolling"),
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
		name: C("Fade Through"),
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
		name: C("Highlight Words"),
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
		name: C("Rotate While Scrolling"),
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
		name: C("Slide Sideways"),
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
		name: C("Lift"),
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
		name: C("Grow"),
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
		name: C("Zoom Image Inside"),
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
		name: C("Press"),
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
		name: C("Float"),
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
		name: C("Spin"),
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
		name: C("Pulse"),
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
		name: C("Intro: Fade Up"),
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
		name: C("Intro: Words"),
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
		name: C("Intro: Children"),
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
		name: C("Open (Fade and Scale)"),
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
		name: C("Slide in Panel"),
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
], oa = () => ({
	appear: {
		label: C("Appear"),
		icon: "b-eye",
		help: C("Plays once as it scrolls into view.")
	},
	scroll: {
		label: C("Scroll"),
		icon: "b-mouse-scroll",
		help: C("Follows the scroll between a start and an end point.")
	},
	hover: {
		label: C("Hover"),
		icon: "b-hand-pointing",
		help: C("Plays on hover and focus, reverses after.")
	},
	press: {
		label: C("Press"),
		icon: "b-hand-tap",
		help: C("Plays while pressed.")
	},
	load: {
		label: C("Page Load"),
		icon: "b-rocket-launch",
		help: C("Plays as the page paints, with no script. Delay stops at 0.2s and stagger at 0.3s.")
	},
	loop: {
		label: C("Loop"),
		icon: "b-arrows-clockwise",
		help: C("Stops within 5 seconds, unless it repeats forever. Then the page needs a Motion Toggle block.")
	},
	event: {
		label: C("On Event"),
		icon: "b-broadcast",
		help: C("Plays from a “Play animation” action in Events.")
	}
}), sa = () => ({
	opacity: C("Opacity"),
	x: C("Move X"),
	y: C("Move Y"),
	xPercent: C("Move X %"),
	yPercent: C("Move Y %"),
	z: C("Move Z"),
	scale: C("Scale"),
	scaleX: C("Scale X"),
	scaleY: C("Scale Y"),
	rotate: C("Rotate"),
	rotateX: C("Rotate X (3D)"),
	rotateY: C("Rotate Y (3D)"),
	skewX: C("Skew X"),
	skewY: C("Skew Y"),
	blur: C("Blur"),
	brightness: C("Brightness"),
	grayscale: C("Grayscale"),
	clipPath: C("Clip Path"),
	backgroundColor: C("Fill"),
	color: C("Text Color"),
	borderColor: C("Border Color"),
	borderRadius: C("Radius"),
	boxShadow: C("Shadow"),
	letterSpacing: C("Letter Spacing"),
	transformOrigin: C("Origin"),
	perspective: C("Perspective")
}), ca = () => [
	{
		value: "power3.out",
		label: C("Smooth Out")
	},
	{
		value: "expo.out",
		label: C("Expo Out")
	},
	{
		value: "power4.inOut",
		label: C("Smooth In-Out")
	},
	{
		value: "power2.out",
		label: C("Gentle Out")
	},
	{
		value: "back.out(1.7)",
		label: C("Overshoot")
	},
	{
		value: "elastic.out(1, 0.4)",
		label: C("Elastic")
	},
	{
		value: "bounce.out",
		label: C("Bounce")
	},
	{
		value: "sine.inOut",
		label: C("Sine In-Out")
	},
	{
		value: "power2.in",
		label: C("Ease In")
	},
	{
		value: "none",
		label: C("Linear")
	},
	{
		value: "cubic-bezier(0.2, 0.8, 0.2, 1)",
		label: C("Signature Ease")
	}
], la = (e, ...t) => e ? t : [], ua = [
	"heading",
	"paragraph",
	"link",
	"button",
	"quote"
], da = (e) => {
	let t = e.length + 1;
	for (; e.some((e) => e.id === `m${t}`);) t++;
	return `m${t}`;
}, fa = (e = "self") => e.startsWith("#") ? C("Another Element") : {
	self: C("This Element"),
	children: C("Children"),
	words: C("Words")
}[e] ?? e;
function pa({ node: e }) {
	let { store: t } = B(), n = e.motion ?? [], [r, i] = A(n[0]?.id ?? null), a = (n) => t.updateNode(e.id, { motion: n.length ? n : void 0 }, `motion:${e.id}`), o = (e, t) => a(n.map((n) => n.id === e ? {
		...n,
		...t
	} : n)), s = ua.includes(e.type), c = oa(), l = (t) => {
		let r = da(n), o = t ? {
			id: r,
			name: t.name,
			...t.make()
		} : {
			id: r,
			name: C("Custom"),
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
		a([...n, o]), i(r), requestAnimationFrame(() => Wt.emit("preview-motion", {
			node: e.id,
			motion: o
		}));
	}, u = aa(), d = [...new Set(u.map((e) => e.group))];
	return /* @__PURE__ */ R(X, {
		title: C("Animations"),
		empty: n.length === 0,
		actions: /* @__PURE__ */ R(F, {
			align: "end",
			trigger: /* @__PURE__ */ R("button", {
				type: "button",
				className: "grid size-6 shrink-0 place-items-center rounded-sm text-muted hover:bg-hover hover:text-ink",
				"aria-label": C("Add Animation"),
				children: /* @__PURE__ */ R(P, {
					name: "b-plus",
					size: 14
				})
			}),
			items: [
				...d.flatMap((e) => [{
					label: ia(e),
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
					label: C("Custom Animation"),
					icon: "b-magic-wand",
					onSelect: () => l()
				}
			]
		}),
		children: n.map((t) => /* @__PURE__ */ z("div", {
			className: I("rounded-sm border", r === t.id ? "border-border-strong" : "border-border"),
			children: [/* @__PURE__ */ z("div", {
				className: "flex h-8 items-center gap-1.5 pl-2 pr-1",
				children: [
					/* @__PURE__ */ R(P, {
						name: c[t.trigger.type]?.icon ?? "b-magic-wand",
						size: 13,
						className: "shrink-0 text-muted"
					}),
					/* @__PURE__ */ z("button", {
						type: "button",
						onClick: () => i(r === t.id ? null : t.id),
						"aria-expanded": r === t.id,
						className: "flex min-w-0 flex-1 items-baseline gap-1.5 text-left",
						children: [/* @__PURE__ */ R("span", {
							className: "truncate text-xs font-medium text-ink",
							children: t.name || c[t.trigger.type]?.label
						}), /* @__PURE__ */ R("span", {
							className: "shrink-0 text-xs text-faint",
							children: c[t.trigger.type]?.label
						})]
					}),
					/* @__PURE__ */ R(_e, {
						content: C("Preview Animation"),
						children: /* @__PURE__ */ R("button", {
							type: "button",
							onClick: () => Wt.emit("preview-motion", {
								node: e.id,
								motion: t
							}),
							className: "grid size-6 shrink-0 place-items-center rounded-sm text-muted hover:bg-hover hover:text-ink",
							"aria-label": C("Preview"),
							children: /* @__PURE__ */ R(P, {
								name: "b-play",
								size: 14
							})
						})
					}),
					/* @__PURE__ */ R(Zn, {
						onClick: () => a(n.filter((e) => e.id !== t.id)),
						label: C("Remove Animation")
					})
				]
			}), r === t.id && /* @__PURE__ */ R(ma, {
				node: e,
				motion: t,
				onChange: (e) => o(t.id, e)
			})]
		}, t.id))
	});
}
function ma({ node: e, motion: t, onChange: n }) {
	let [r, i] = A(0), a = oa(), o = t.trigger, s = (e) => n({ trigger: {
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
		label: C("Name")
	}, {
		handle: "type",
		type: "select",
		size: "sm",
		label: C("Trigger"),
		required: !0,
		options: Object.entries(a).map(([e, t]) => ({
			value: e,
			label: t.label
		})),
		instructions: a[o.type]?.help
	}], f = [
		...la(o.type === "appear", {
			handle: "start",
			type: "select",
			size: "sm",
			label: C("Starts"),
			placeholder: C("A little into view"),
			options: [
				{
					value: "top 95%",
					label: C("As soon as it peeks in")
				},
				{
					value: "top 85%",
					label: C("A little into view")
				},
				{
					value: "top 65%",
					label: C("A third into view")
				},
				{
					value: "center center",
					label: C("At the Center")
				}
			]
		}, {
			handle: "replay",
			type: "toggle",
			size: "sm",
			label: C("Reverse When Scrolled Back")
		}),
		...la(o.type === "scroll", {
			handle: "start",
			type: "select",
			size: "sm",
			label: C("From"),
			placeholder: C("Enters the Screen"),
			options: [
				{
					value: "top bottom",
					label: C("Enters the Screen")
				},
				{
					value: "top 80%",
					label: C("Top at 80%")
				},
				{
					value: "top center",
					label: C("Top at Center")
				},
				{
					value: "top top",
					label: C("Top at Top")
				},
				{
					value: "center center",
					label: C("Centered")
				}
			]
		}, {
			handle: "end",
			type: "select",
			size: "sm",
			label: C("To"),
			placeholder: C("Leaves the Screen"),
			options: [
				{
					value: "bottom top",
					label: C("Leaves the Screen")
				},
				{
					value: "center center",
					label: C("Centered")
				},
				{
					value: "top top",
					label: C("Top at Top")
				},
				{
					value: "bottom center",
					label: C("Bottom at Center")
				},
				{
					value: "bottom bottom",
					label: C("Bottom at Bottom")
				}
			]
		}),
		...la(l, {
			handle: "repeat",
			type: "select",
			display: "segmented",
			block: !0,
			size: "sm",
			label: C("Repeat"),
			required: !0,
			options: [
				{
					value: "0",
					label: C("Once")
				},
				{
					value: "1",
					label: C("Twice")
				},
				{
					value: "-1",
					label: C("Forever")
				}
			]
		}, {
			handle: "yoyo",
			type: "toggle",
			size: "sm",
			label: C("Back and Forth")
		}, {
			handle: "hold",
			type: "number",
			size: "sm",
			label: C("Loop as a Timeline, Resting (s)"),
			if: { repeat: "-1" },
			instructions: C("On Appear: all steps loop together while on screen.")
		}),
		...la(o.type === "scroll" || o.type === "appear", {
			handle: "watch",
			type: "select",
			component: "blocks-node",
			label: C("Watch"),
			placeholder: C("This Element"),
			exclude: e.id
		}),
		{
			handle: "desktop",
			type: "toggle",
			size: "sm",
			label: C("Plays on Desktop")
		},
		{
			handle: "tablet",
			type: "toggle",
			size: "sm",
			label: C("Plays on Tablet")
		},
		{
			handle: "mobile",
			type: "toggle",
			size: "sm",
			label: C("Plays on Phone")
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
	return /* @__PURE__ */ z("div", {
		className: "space-y-2 border-t border-border p-2",
		children: [
			/* @__PURE__ */ R(Z, {
				fields: [...d, ...f],
				values: m,
				onChange: h
			}),
			o.type === "event" && /* @__PURE__ */ z("p", {
				className: "m-0 flex h-7 items-center gap-2 text-xs",
				children: [/* @__PURE__ */ R("span", {
					className: "w-[88px] shrink-0 text-muted",
					children: C("Animation ID")
				}), /* @__PURE__ */ R("code", {
					className: "select-all font-mono text-text",
					children: t.id
				})]
			}),
			/* @__PURE__ */ R(_a, {
				steps: t.steps,
				active: u,
				onSelect: i,
				onChange: c,
				onAdd: g
			}),
			t.steps[u] && /* @__PURE__ */ R(ya, {
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
function ha(e) {
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
var ga = (e) => Math.max(0, Math.round(e * 20) / 20);
function _a({ steps: e, active: t, onSelect: n, onChange: r, onAdd: i }) {
	let a = ha(e), o = Math.max(.5, ...a.map((e) => e.start + e.duration + e.spread)), s = k(null), c = s.current?.total ?? Math.ceil(o * 2 + .25) / 2, l = c <= 1.5 ? .25 : c <= 4 ? .5 : c <= 10 ? 1 : 2, u = Array.from({ length: Math.floor(c / l) + 1 }, (e, t) => t * l), d = (e) => `${e / c * 100}%`, f = (t, i, a) => {
		t.preventDefault(), t.stopPropagation(), n(i);
		let o = t.currentTarget.closest("[data-track]");
		if (!o) return;
		s.current = {
			total: c,
			width: o.clientWidth
		};
		let l = t.clientX, u = e[i], d = a === "move" ? u.at === void 0 ? u.delay ?? 0 : u.at : u.duration ?? .6, f = (e) => {
			let t = (e.clientX - l) / s.current.width * s.current.total;
			a === "end" ? r(i, { duration: Math.max(.05, ga(d + t)) }) : u.at === void 0 ? r(i, { delay: ga(d + t) || void 0 }) : r(i, { at: ga(d + t) });
		}, p = () => {
			window.removeEventListener("pointermove", f), window.removeEventListener("pointerup", p), s.current = null;
		};
		window.addEventListener("pointermove", f), window.addEventListener("pointerup", p);
	};
	return /* @__PURE__ */ z("div", {
		className: "rounded-md bg-active/60 py-1.5",
		children: [
			/* @__PURE__ */ z("div", {
				className: "mb-1 flex items-end pr-2",
				children: [/* @__PURE__ */ R("span", {
					className: "w-16 shrink-0 pl-2 text-2xs font-medium text-faint",
					children: C("Timeline")
				}), /* @__PURE__ */ R("div", {
					className: "relative h-3 flex-1",
					children: u.filter((e, t) => u.length <= 5 || t % 2 == 0).map((e) => /* @__PURE__ */ R("span", {
						className: "absolute -translate-x-1/2 font-mono text-[9px] leading-none text-faint first:translate-x-0 last:-translate-x-full",
						style: { left: d(e) },
						children: e === 0 ? "0" : `${e}s`
					}, e))
				})]
			}),
			e.map((e, i) => {
				let o = a[i];
				return /* @__PURE__ */ z("div", {
					className: I("flex h-7 items-center pr-2", i === t && "bg-focus-soft"),
					children: [/* @__PURE__ */ R("button", {
						type: "button",
						onClick: () => n(i),
						className: I("w-16 shrink-0 truncate pl-2 text-left text-2xs", i === t ? "font-medium text-ink" : "text-muted hover:text-text"),
						children: fa(e.target)
					}), /* @__PURE__ */ z("div", {
						"data-track": !0,
						className: "relative h-full flex-1",
						children: [
							u.map((e) => /* @__PURE__ */ R("span", {
								className: "absolute inset-y-0 w-px bg-border/70",
								style: { left: d(e) }
							}, e)),
							/* @__PURE__ */ z("div", {
								role: "slider",
								tabIndex: 0,
								"aria-label": C("Step {n}", { n: i + 1 }),
								"aria-valuenow": o.start,
								"aria-valuetext": C("Starts at {start}s, runs {duration}s", {
									start: o.start.toFixed(2),
									duration: o.duration.toFixed(2)
								}),
								onPointerDown: (e) => f(e, i, "move"),
								onKeyDown: (t) => {
									if (t.key !== "ArrowLeft" && t.key !== "ArrowRight") return;
									t.preventDefault();
									let n = t.key === "ArrowRight" ? .05 : -.05;
									t.shiftKey ? r(i, { duration: Math.max(.05, ga((e.duration ?? .6) + n)) }) : e.at === void 0 ? r(i, { delay: ga((e.delay ?? 0) + n) || void 0 }) : r(i, { at: ga(e.at + n) });
								},
								className: I("cms-focus-ring group/bar absolute top-1 flex h-4 cursor-grab items-center rounded-[3px] active:cursor-grabbing", i === t ? "bg-focus" : "bg-focus/50 hover:bg-focus/70"),
								style: {
									left: d(o.start),
									width: `max(6px, ${d(o.duration)})`
								},
								children: [/* @__PURE__ */ z("span", {
									className: "pointer-events-none truncate px-1 font-mono text-[9px] leading-none text-white",
									children: [o.duration.toFixed(1), "s"]
								}), /* @__PURE__ */ R("span", {
									onPointerDown: (e) => f(e, i, "end"),
									className: "absolute -right-1 inset-y-0 w-2 cursor-ew-resize",
									"aria-hidden": !0
								})]
							}),
							o.spread > 0 && /* @__PURE__ */ R("span", {
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
			/* @__PURE__ */ z("button", {
				type: "button",
				onClick: i,
				className: "ml-16 mt-0.5 flex h-6 items-center gap-1 rounded-sm px-1.5 text-xs text-muted hover:bg-hover hover:text-ink",
				children: [
					/* @__PURE__ */ R(P, {
						name: "b-plus",
						size: 12
					}),
					" ",
					C("Add Step")
				]
			})
		]
	});
}
var va = (e, t, n, r = {}) => ({
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
function ya({ node: e, step: t, index: n, count: r, onChange: i, onRemove: a }) {
	let { catalog: o } = B(), s = t.target ?? "self", c = sa(), l = Object.keys(o.motion?.properties ?? c), u = ua.includes(e.type), d = (e) => {
		let n = t[e] ?? {}, r = (t, r) => i({ [e]: {
			...n,
			[t]: /^-?[\d.]+$/.test(r) ? Number(r) : r
		} });
		return /* @__PURE__ */ z("div", {
			className: "space-y-1",
			children: [
				/* @__PURE__ */ z("div", {
					className: "flex h-7 items-center justify-between",
					children: [/* @__PURE__ */ R("span", {
						className: "text-xs font-medium text-muted",
						children: C(e === "from" ? "From" : "To")
					}), /* @__PURE__ */ R(F, {
						align: "end",
						trigger: /* @__PURE__ */ R("button", {
							type: "button",
							className: "grid size-6 shrink-0 place-items-center rounded-sm text-muted hover:bg-hover hover:text-ink",
							"aria-label": C(e === "from" ? "Add a Start Property" : "Add an End Property"),
							children: /* @__PURE__ */ R(P, {
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
				Object.keys(n).length === 0 && /* @__PURE__ */ R("p", {
					className: "m-0 text-2xs text-faint",
					children: C(e === "from" ? "As it looks now" : "As Designed")
				}),
				/* @__PURE__ */ R(Z, {
					bare: !0,
					fields: [{
						handle: e,
						type: "json",
						component: "blocks-pairs",
						className: "items-start",
						label: C(e === "from" ? "From" : "To"),
						labels: c,
						item: {
							handle: "value",
							type: "text",
							component: "blocks-value",
							label: C("Value"),
							unit: ""
						},
						items: Object.fromEntries(Object.keys(n).map((e) => [e, {
							handle: "value",
							type: "text",
							component: "blocks-value",
							label: C("Value"),
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
	return /* @__PURE__ */ z("div", {
		className: "space-y-2",
		children: [
			/* @__PURE__ */ z("div", {
				className: "flex h-7 items-center gap-1",
				children: [
					/* @__PURE__ */ R("span", {
						className: "text-xs font-semibold text-text",
						children: r > 1 ? C("Step {n}", { n: n + 1 }) : C("Animate")
					}),
					/* @__PURE__ */ R("span", { className: "flex-1" }),
					r > 1 && /* @__PURE__ */ R(Zn, {
						onClick: a,
						label: C("Remove Step")
					})
				]
			}),
			/* @__PURE__ */ R(Z, {
				fields: [
					{
						handle: "target",
						type: "select",
						size: "sm",
						label: C("Target"),
						required: !0,
						options: [
							{
								value: "self",
								label: C("This Element")
							},
							{
								value: "children",
								label: C("Each Child in Turn")
							},
							...u ? [{
								value: "words",
								label: C("Each Word")
							}] : [],
							{
								value: "other",
								label: C("Another Element")
							}
						]
					},
					...la(s.startsWith("#"), {
						handle: "element",
						type: "select",
						component: "blocks-node",
						label: C("Element")
					}),
					...la(s === "words", {
						handle: "mask",
						type: "toggle",
						size: "sm",
						label: C("Rise from Behind a Line")
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
			/* @__PURE__ */ R(Z, {
				fields: [{
					handle: "timing",
					type: "group",
					component: "blocks-group",
					label: C("Timing"),
					columns: 2,
					fields: [
						va("duration", C("Duration in Seconds"), "b-timer"),
						va("delay", C("Delay in Seconds"), "b-clock", { placeholder: "0" }),
						...la(s !== "self", va("stagger", C("Time between items in seconds"), "b-dots-three", {
							step: .01,
							placeholder: "0"
						})),
						...la(r > 1, va("at", C("Start in seconds into the timeline"), "b-flow-arrow", { placeholder: C("After") }))
					]
				}, {
					handle: "ease",
					type: "select",
					component: "blocks-easing",
					label: C("Ease"),
					placeholder: C("Smooth Out")
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
var ba = [
	"content",
	"design",
	"interact"
], xa = "cms.block.tab";
function Sa(e) {
	if (!e.scrollTop) return null;
	let t = e.getBoundingClientRect().top, n = [...e.querySelectorAll("[data-section]")].find((e) => e.getBoundingClientRect().bottom > t);
	return {
		section: n?.dataset.section,
		offset: n ? n.getBoundingClientRect().top - t : 0,
		scrollTop: e.scrollTop
	};
}
function Ca(e, t) {
	let n = t.section && e.querySelector(`[data-section="${CSS.escape(t.section)}"]`);
	n ? e.scrollTop += n.getBoundingClientRect().top - e.getBoundingClientRect().top - t.offset : e.scrollTop = t.scrollTop;
}
function wa() {
	try {
		let e = sessionStorage.getItem(xa);
		return ba.find((t) => t === e) ?? "content";
	} catch {
		return "content";
	}
}
function Ta({ node: e, onBack: t, backLabel: n, onClose: r }) {
	let { store: i, types: a, allowed: o, readOnly: c } = B(), l = a.get(e.type), u = ke(), [d, f] = A(wa), p = `block-inspector-${se()}`, [m, h] = A(!1), g = k(null), v = k(e.id), y = k(null);
	v.current !== e.id && (v.current = e.id, y.current = g.current && Sa(g.current)), ce(() => {
		g.current && y.current && Ca(g.current, y.current), y.current = null;
	}, [e.id]);
	let b = (e) => {
		try {
			sessionStorage.setItem(xa, e);
		} catch {}
		f(e);
	}, x = !c && e.type !== "pattern" && _("entries.components.create");
	return /* @__PURE__ */ z("div", {
		className: "flex h-full min-h-0 min-w-0 flex-col",
		"data-blocks-inspector": !0,
		children: [
			/* @__PURE__ */ z("div", {
				className: I("flex h-12 shrink-0 items-center gap-1 pr-3", t ? "pl-2" : "pl-4"),
				children: [
					t && /* @__PURE__ */ R(de, {
						icon: "arrow-left",
						label: n ? C("Back to {name}", { name: n }) : C("Back"),
						size: "sm",
						onClick: t
					}),
					/* @__PURE__ */ R(P, {
						name: e.type === "pattern" ? "b-diamonds-four" : l?.icon ?? "square",
						size: 16,
						className: "ml-1 shrink-0 text-muted"
					}),
					m ? /* @__PURE__ */ R("div", {
						className: "min-w-0 flex-1 pl-1",
						onBlur: () => h(!1),
						onKeyUp: (e) => e.key === "Escape" && e.target.blur(),
						children: /* @__PURE__ */ R(Z, {
							bare: !0,
							fields: [{
								handle: "label",
								type: "text",
								size: "sm",
								commit: "blur",
								label: C("Name"),
								autofocus: !0,
								placeholder: l?.title
							}],
							values: { label: e.label ?? "" },
							onChange: (t, n) => i.updateNode(e.id, { label: n.trim() || void 0 })
						})
					}) : /* @__PURE__ */ R("button", {
						type: "button",
						onDoubleClick: () => !c && h(!0),
						className: "min-w-0 flex-1 truncate pl-1 text-left text-sm font-semibold text-ink",
						title: c ? void 0 : C("Double-Click to Rename"),
						children: Ae(e, a, u)
					}),
					/* @__PURE__ */ R(F, {
						align: "end",
						trigger: /* @__PURE__ */ R(de, {
							icon: "more",
							label: C("Block Actions"),
							size: "sm"
						}),
						items: [
							{
								label: C("Rename"),
								icon: "b-pencil-simple",
								disabled: c,
								onSelect: () => h(!0)
							},
							{
								label: C("Duplicate"),
								icon: "b-copy",
								shortcut: "mod+d",
								disabled: c,
								onSelect: () => i.duplicate(e.id)
							},
							x && {
								label: C("Make a Component"),
								icon: "b-diamonds-four",
								onSelect: () => {
									i.selection().includes(e.id) || i.select(e.id), ct(i, s(i, a, o));
								}
							},
							{
								separator: !0,
								label: ""
							},
							{
								label: C("Delete"),
								icon: "b-trash",
								shortcut: "⌫",
								danger: !0,
								disabled: c,
								onSelect: () => i.remove(e.id)
							}
						]
					}),
					r && /* @__PURE__ */ R(de, {
						icon: "close",
						label: C("Close Panel"),
						size: "sm",
						onClick: r
					})
				]
			}),
			/* @__PURE__ */ R("div", {
				className: "flex h-10 shrink-0 items-center gap-2 border-b border-border pl-4 pr-3",
				children: /* @__PURE__ */ R(ge, {
					id: p,
					value: d,
					onChange: b,
					bordered: !1,
					size: "sm",
					className: "h-full min-w-0 flex-1",
					tabs: ba.map((e) => ({
						value: e,
						label: {
							content: C("Content"),
							design: C("Design"),
							interact: C("Interact")
						}[e]
					}))
				})
			}),
			/* @__PURE__ */ R("fieldset", {
				ref: g,
				role: "tabpanel",
				id: `${p}-${d}-panel`,
				"aria-labelledby": `${p}-${d}`,
				disabled: c,
				className: "m-0 min-h-0 min-w-0 flex-1 overflow-y-auto border-0 p-0",
				children: /* @__PURE__ */ z(te, { children: [
					d === "design" && /* @__PURE__ */ R(Vi, { node: e }),
					d === "content" && /* @__PURE__ */ R(jr, { node: e }),
					d === "interact" && /* @__PURE__ */ z(Se, { children: [/* @__PURE__ */ R(pa, { node: e }), /* @__PURE__ */ R(Qi, { node: e })] })
				] }, e.id)
			})
		]
	});
}
export { Me as $, yn as A, Gt as B, Z as C, An as D, Kn as E, an as F, Wt as G, Yt as H, nn as I, $e as J, ot as K, tn as L, mn as M, pn as N, Cn as O, hn as P, Re as Q, en as R, Xn as S, Vn as T, qt as U, Xt as V, Kt as W, q as X, Ze as Y, qe as Z, or as _, _i as a, ke as at, er as b, Rr as c, Sr as d, Fe as et, Cr as f, mr as g, cr as h, ui as i, Oe as it, fn as j, _n as k, Lr as l, br as m, ca as n, De as nt, oi as o, B as ot, lr as p, et as q, pi as r, Ae as rt, ai as s, je as st, Ta as t, V as tt, Ir as u, ir as v, Zn as w, $n as x, tr as y, rn as z };
