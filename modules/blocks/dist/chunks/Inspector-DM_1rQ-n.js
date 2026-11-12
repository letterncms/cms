import { a as e, c as t, d as n, f as r, g as i, h as a, i as o, l as s, m as c, n as l, o as u, p as d, r as f, t as p, u as m, v as h, y as g } from "./insert-Biw2VMgl.js";
import { can as _, invalidate as v, navigate as y, plural as b, registry as x, requestText as ee, run as S, t as C, useAbility as w, useManifest as T, useManifestIfLoaded as E } from "@letterncms/sdk";
import { Fragment as D, createContext as te, createElement as ne, forwardRef as re, memo as O, useCallback as ie, useContext as ae, useEffect as k, useId as oe, useLayoutEffect as se, useMemo as ce, useRef as A, useState as j, useSyncExternalStore as le } from "react";
import { Button as M, Dialog as N, Fields as P, Icon as F, IconButton as I, Menu as L, NEW_COLOR as ue, Popover as de, Pressable as R, QueryError as fe, Segmented as pe, Spinner as me, Tabs as he, Tooltip as ge, cn as z, copyText as B, deviceWidths as _e, fieldControlId as ve, fieldVisible as ye, prompt as be, slugify as xe, toast as Se, useShortcutLabel as Ce, wideFieldTypes as we } from "@letterncms/ui";
import { Fragment as Te, jsx as V, jsxs as H } from "react/jsx-runtime";
import { createPortal as Ee, flushSync as De } from "react-dom";
import { createRoot as Oe } from "react-dom/client";
// admin/src/core/context.tsx
var ke = te(null);
function Ae({ value: e, children: t }) {
	return e.store.setReadOnly(!!e.readOnly), /* @__PURE__ */ V(ke.Provider, {
		value: e,
		children: t
	});
}
function U() {
	let e = ae(ke);
	if (!e) throw Error("Block editor context missing");
	return e;
}
function je() {
	let e = w("blocks/types", {}, { staleTime: 3e5 }), t = ce(() => new Map((e.data?.blocks ?? []).map((e) => [e.name, e])), [e.data]);
	return {
		catalog: e.data,
		types: t,
		isLoading: e.isLoading,
		error: e.error,
		retry: () => void e.refetch()
	};
}
function Me() {
	let e = w("components/list", {}, { staleTime: 6e4 });
	return ce(() => new Map((e.data ?? []).map((e) => [e.handle, e.title])), [e.data]);
}
function Ne(e, t, n) {
	return e.label || (e.type === "component" ? n.get(String(e.props?.ref ?? "")) : void 0) || t.get(e.type)?.title || e.type;
}
function Pe() {
	let e = w("design/get", {}, {
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
var Fe = class {
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
	selection = () => Re(this.state);
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
	variant = () => Ie(this.state.breakpoint, this.state.state);
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
function Ie(e, t) {
	return e === "base" ? t || "base" : t ? `${e}:${t}` : e;
}
function Le(e, t) {
	let n = e === "mobile" ? [
		"mobile",
		"tablet",
		"base"
	] : e === "tablet" ? ["tablet", "base"] : ["base"], r = [];
	if (t) for (let e of n) r.push(Ie(e, t));
	return r.push(...n), r;
}
function Re(e) {
	if (!e.selected) return [];
	if (!e.head) return [e.selected];
	let t = r(e.nodes, e.selected);
	if (!t) return [e.selected];
	let n = i(e.nodes, t.parentId), a = n.findIndex((t) => t.id === e.selected), o = n.findIndex((t) => t.id === e.head);
	return o < 0 ? [e.selected] : n.slice(Math.min(a, o), Math.max(a, o) + 1).map((e) => e.id);
}
function ze(e, t) {
	if (Object.is(e, t)) return !0;
	if (Array.isArray(e) && Array.isArray(t)) return e.length === t.length && e.every((e, n) => Object.is(e, t[n]));
	if (e && t && typeof e == "object" && typeof t == "object") {
		let n = Object.keys(e), r = Object.keys(t);
		return n.length === r.length && n.every((n) => Object.is(e[n], t[n]));
	}
	return !1;
}
function W(e, t) {
	let n = A(null);
	return le(e.subscribe, () => {
		let r = t(e.get());
		return n.current && ze(n.current.value, r) ? n.current.value : (n.current = { value: r }, r);
	});
}
// admin/src/core/uniqueIds.ts
function Be(e, t) {
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
function G(e, t, n) {
	let r = A(t);
	r.current = t;
	let [i] = j(() => new Fe(Be(Array.isArray(e) ? e : [], g), (e) => r.current(e), n)), a = A(e);
	return i.setReadOnly(n), k(() => {
		if (a.current === e) return;
		a.current = e;
		let t = Be(Array.isArray(e) ? e : [], g);
		JSON.stringify(t) !== JSON.stringify(i.get().nodes) && i.reset(t);
	}, [i, e]), i;
}
// admin/src/core/caret.ts
function Ve(e = document) {
	return e.getSelection()?.isCollapsed ?? !0;
}
function He(e, t) {
	let n = e.ownerDocument.getSelection();
	if (!n || n.rangeCount === 0) return null;
	let r = n.getRangeAt(0);
	if (!e.contains(r.startContainer)) return null;
	let i = e.ownerDocument.createRange();
	return i.selectNodeContents(e), t ? i.setEnd(r.startContainer, r.startOffset) : i.setStart(r.endContainer, r.endOffset), i;
}
function K(e) {
	return e ? e.toString().replace(/​/g, "") : "";
}
function Ue(e) {
	return Ve(e.ownerDocument) && K(He(e, !0)) === "" && !Ge(He(e, !0)).includes("<br");
}
function We(e) {
	return Ve(e.ownerDocument) && K(He(e, !1)) === "";
}
function Ge(e) {
	if (!e) return "";
	let t = e.startContainer.ownerDocument.createElement("div");
	return t.appendChild(e.cloneContents()), t.innerHTML;
}
function Ke(e) {
	return K(He(e, !0)).length;
}
function qe(e) {
	let t = He(e, !0), n = He(e, !1);
	return [Ge(t), Ge(n)];
}
function Je(e) {
	let t = Ze(e.ownerDocument);
	return !t || t.top - e.getBoundingClientRect().top < Xe(e) * .8;
}
function Ye(e) {
	let t = Ze(e.ownerDocument);
	return !t || e.getBoundingClientRect().bottom - t.bottom < Xe(e) * .8;
}
function Xe(e) {
	let t = parseFloat(e.ownerDocument.defaultView.getComputedStyle(e).lineHeight);
	return Number.isFinite(t) ? t : 20;
}
function Ze(e = document) {
	let t = e.getSelection();
	if (!t || t.rangeCount === 0) return null;
	let n = t.getRangeAt(0).cloneRange(), r = n.getClientRects();
	if (r.length > 0) return r[0];
	let i = e.createElement("span");
	i.textContent = "​", n.insertNode(i);
	let a = i.getBoundingClientRect();
	return i.remove(), a;
}
function Qe(e, t) {
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
function q(e) {
	let t = document.createElement("div");
	return t.innerHTML = e, (t.textContent ?? "").length;
}
function J(e) {
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
	let { store: e } = U(), t = W(e, (e) => e.nodes), n = /* @__PURE__ */ new Map(), r = [];
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
function nt({ html: e, onChange: t, tag: n = "div", placeholder: r, className: i = "", focus: a, onKeyDown: o, onFocus: s, onPaste: c, disabled: l, singleLine: u, quiet: d, plainText: f }) {
	let p = A(null), m = A(e);
	se(() => {
		let t = p.current;
		t && (t.ownerDocument.activeElement === t ? m.current = e : (J(t.innerHTML) !== e && (t.innerHTML = e), m.current = J(t.innerHTML)));
	}, [e]), se(() => {
		a && p.current && Qe(p.current, a.at);
	}, [a?.nonce]);
	let h = () => {
		let e = p.current;
		if (!e) return;
		let n = J(e.innerHTML);
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
	let [n, r] = j(null), [i, a] = j({}), [o, s] = j(!1), [c, l] = j(""), u = A(null), d = A(null), f = A(() => {}), p = tt();
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
	}, v = (e, t, n, r) => /* @__PURE__ */ V(ge, {
		content: t,
		shortcut: n,
		children: /* @__PURE__ */ V(R, {
			compact: !0,
			"aria-label": t,
			"aria-pressed": !!i[e] || e === "link" && o,
			onMouseDown: (e) => e.preventDefault(),
			onClick: r,
			className: z("grid size-7 place-items-center rounded-xs hover:bg-white/12 hover:text-ink-contrast", i[e] || e === "link" && o ? "bg-white/14 text-ink-contrast" : "text-ink-contrast/75"),
			children: /* @__PURE__ */ V(F, {
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
		label: C("Link"),
		size: "sm",
		autofocus: !0,
		anchors: p,
		placeholder: C("Paste a link or search pages"),
		onClose: y
	});
	return Ee(/* @__PURE__ */ H("div", {
		className: "fixed z-overlay flex -translate-x-1/2 -translate-y-full items-center gap-0.5 rounded-md bg-ink p-1 shadow-pop",
		style: {
			left: n.x,
			top: n.y - 8
		},
		onMouseDown: (e) => !o && e.preventDefault(),
		onKeyDown: (e) => e.key === "Escape" && y(),
		children: [
			v("bold", C("Bold"), "mod+b", () => m("bold")),
			v("italic", C("Italic"), "mod+i", () => m("italic")),
			v("underline", C("Underline"), "mod+u", () => m("underline")),
			v("strike", C("Strikethrough"), "mod+shift+x", () => m("strikeThrough")),
			v("code", C("Code"), "mod+e", () => h("code")),
			/* @__PURE__ */ V("span", { className: "mx-0.5 h-4 w-px bg-white/15" }),
			v("link", C("Link"), "mod+k", g),
			o && /* @__PURE__ */ V("div", {
				className: "pointer-events-none absolute inset-0 opacity-0",
				"aria-hidden": !0,
				children: /* @__PURE__ */ V(P, {
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
	let i = w("components/list", {}, { staleTime: 6e4 }), { catalog: a } = je();
	return {
		items: ce(() => {
			let o = a?.categories ?? [], s = (e) => {
				let t = o.findIndex((t) => t.name === e);
				return t < 0 ? o.length : t;
			}, c = (e) => o.find((t) => t.name === e)?.label ?? lt(e), l = t.trim().toLowerCase(), u = (e) => e.toLowerCase().includes(l), d = e.filter((e) => n ? n(e) : !e.parent).filter((e) => !l || u(e.title) || u(e.name) || (e.keywords ?? []).some(u)).sort((e, t) => s(e.category) - s(t.category) || (s(e.category) === o.length ? c(e.category).localeCompare(c(t.category)) : 0)), f = (e) => {
				let t = e.title.toLowerCase();
				return t === l ? 0 : t.startsWith(l) ? 1 : u(e.title) ? 2 : 3;
			}, p = (l ? [...d].sort((e, t) => f(e) - f(t)) : d).map((e) => ({
				kind: "block",
				type: e,
				group: l ? C("Blocks") : c(e.category)
			})), m = (t) => {
				let r = e.find((e) => e.name === t);
				return !!r && (n ? n(r) : !r.parent);
			}, h = (r ? i.data ?? [] : []).filter((e) => e.synced ? m("component") : e.blocks.length > 0 && e.blocks.every((e) => m(e.type))).filter((e) => !l || u(e.title) || u(e.category) || u(e.description)).sort((e, t) => Number(t.synced) - Number(e.synced)).map((e) => ({
				kind: "component",
				component: e,
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
function dt({ types: e, query: t, onQuery: n, onChoose: r, onClose: i, allowed: a, showSearch: o = !0, className: s, style: c, compact: l, chooseFirst: u, onNoMatch: d, components: f = !0, keyboardDocument: p }) {
	let { items: m, loading: h } = ut(e, t, a, f), [g, _] = j(0), v = A(null);
	k(() => _(0), [t]);
	let y = A({
		items: m,
		active: g,
		loading: h
	});
	y.current = {
		items: m,
		active: g,
		loading: h
	};
	let b = A(!!u);
	k(() => {
		if (!b.current) return;
		let e = st(m.length, h);
		e !== "wait" && (b.current = !1, e === "choose" ? r(m[0]) : d?.());
	}, [m, h]), se(() => {
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
	]), k(() => {
		v.current?.querySelector(`[data-index="${g}"]`)?.scrollIntoView({ block: "nearest" });
	}, [g]);
	let x = "";
	return /* @__PURE__ */ H("div", {
		className: z("flex max-h-[min(420px,60vh)] w-[300px] flex-col", s),
		style: c,
		children: [o && /* @__PURE__ */ V("div", {
			className: "border-b border-border p-1.5",
			children: /* @__PURE__ */ V(P, {
				bare: !0,
				fields: [{
					handle: "query",
					type: "text",
					label: C("Search"),
					icon: "search",
					size: "sm",
					autofocus: !0,
					placeholder: C("Search Blocks")
				}],
				values: { query: t },
				onChange: (e, t) => n?.(t ?? "")
			})
		}), /* @__PURE__ */ H("div", {
			ref: v,
			className: "min-h-0 flex-1 overflow-y-auto p-1",
			children: [m.length === 0 && /* @__PURE__ */ V("div", {
				className: "px-3 py-6 text-center text-xs text-faint",
				children: C("No matching blocks")
			}), m.map((e, t) => {
				let n = e.group === x ? null : e.group;
				x = e.group;
				let i = e.kind === "block" ? e.type.title : e.component.title, a = e.kind === "block" ? e.type.description : e.component.description || (e.component.synced ? C("Component") : C("Section")), o = e.kind === "block" ? e.type.icon : e.component.synced ? "symbol" : "section-copy";
				return /* @__PURE__ */ H("div", { children: [n && /* @__PURE__ */ V("div", {
					className: "cms-label px-2 pb-1 pt-2",
					children: n
				}), /* @__PURE__ */ H(M, {
					variant: "ghost",
					size: "md",
					"data-index": t,
					title: a || void 0,
					onMouseMove: () => t !== g && _(t),
					onMouseDown: (e) => e.preventDefault(),
					onClick: () => r(e),
					"data-active": t === g || void 0,
					className: z("w-full !justify-start !gap-2.5 !rounded-sm !px-2 text-left", !l && "!h-9"),
					children: [/* @__PURE__ */ V("span", {
						className: "grid size-7 shrink-0 place-items-center rounded-xs border border-border bg-surface text-muted",
						children: /* @__PURE__ */ V(F, {
							name: o,
							size: 14
						})
					}), /* @__PURE__ */ V("span", {
						className: "min-w-0 truncate",
						children: i
					})]
				})] }, e.kind === "block" ? e.type.name : `p-${e.component.handle}`);
			})]
		})]
	});
}
// admin/src/core/SaveComponent.tsx
function ft(e, t) {
	let n = e.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 56) || "component", r = n;
	for (let e = 2; t.has(r); e++) r = `${n}-${e}`;
	return r;
}
function pt(e, n) {
	let r = e.selection().map((n) => t(e.get().nodes, n)).filter((e) => !!e);
	if (r.length === 0) return;
	let i = document.createElement("div");
	document.body.appendChild(i);
	let a = Oe(i);
	function o() {
		let [t, o] = j(!0), [s, c] = j({
			title: "",
			category: "",
			description: "",
			synced: n
		}), { title: l, category: u, description: d, synced: f } = s, p = (e, t) => c((n) => ({
			...n,
			[e]: t ?? ""
		})), [m, h] = j(!1), _ = () => {
			o(!1), setTimeout(() => {
				a.unmount(), i.remove();
			}, 250);
		}, y = async () => {
			if (l.trim()) {
				h(!0);
				try {
					let t = await S("components/list"), n = ft(l, new Set(t.map((e) => e.handle)));
					await S("components/save", {
						handle: n,
						title: l.trim(),
						description: d.trim(),
						category: u.trim() || void 0,
						synced: f,
						blocks: r
					}), v("components/"), f && e.replaceSelection([{
						id: g(),
						type: "component",
						props: { ref: n }
					}]), Se.success(C(f ? "“{title}” is now a component" : "Saved “{title}” as a section", { title: l.trim() })), _();
				} catch (e) {
					Se.error(e), h(!1);
				}
			}
		};
		return /* @__PURE__ */ V(N, {
			open: t,
			onOpenChange: (e) => !e && _(),
			size: "sm",
			title: C(f ? "Make a Component" : "Save as a Section"),
			description: b(r.length, "{count} block, reusable on every page", "{count} blocks, reusable on every page"),
			onSubmit: () => void y(),
			submitLabel: C(f ? "Make Component" : "Save Section"),
			submitDisabled: !l.trim(),
			busy: m,
			children: /* @__PURE__ */ H("div", {
				className: "grid gap-4",
				children: [/* @__PURE__ */ V(P, {
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
							placeholder: C(f ? "Components" : "Sections")
						},
						{
							handle: "description",
							type: "text",
							label: C("Description"),
							max: 500,
							placeholder: C("When to Use It")
						}
					],
					values: s,
					onChange: p
				}), /* @__PURE__ */ V(P, {
					disabled: !n,
					fields: [{
						handle: "synced",
						type: "toggle",
						label: C(n ? "Keep Every Copy in Sync" : "Saved as a section: components can’t be placed here")
					}],
					values: s,
					onChange: (e, t) => p(e, !!t)
				})]
			})
		});
	}
	a.render(/* @__PURE__ */ V(o, {}));
}
// admin/src/core/insertionTargets.ts
var mt = 4, ht = 6, gt = 16, _t = (e) => e.left + e.width, vt = (e) => e.top + e.height, yt = (e, t) => t === "x" ? e.left + e.width / 2 : e.top + e.height / 2, bt = (e, t) => t === "x" ? e.left : e.top, xt = (e, t) => t === "x" ? _t(e) : vt(e), St = (e) => [
	e.left,
	e.top,
	e.width,
	e.height
].every(Number.isFinite) && e.width > 0 && e.height >= 0, Ct = (e, t) => t.x >= e.left && t.x <= _t(e) && t.y >= e.top && t.y <= vt(e);
function wt(e, t) {
	return Math.hypot(Math.max(e.left - t.x, 0, t.x - _t(e)), Math.max(e.top - t.y, 0, t.y - vt(e)));
}
function Tt(e, t) {
	return Math.min(vt(e), vt(t)) - Math.max(e.top, t.top) > 0 && Math.abs(yt(t, "x") - yt(e, "x")) > Math.abs(yt(t, "y") - yt(e, "y")) ? "x" : "y";
}
function Et(e, t, n) {
	let r = Math.min(vt(e), vt(t)) - Math.max(e.top, t.top), i = Math.min(_t(e), _t(t)) - Math.max(e.left, t.left);
	return n === "x" && r > 0 ? "x" : n === "y" && i > 0 ? "y" : Tt(e, t);
}
function Dt(e, t) {
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
function Ot(e, t) {
	let { byId: n, depth: r, isExcluded: i } = Dt(e, t.excludeIds), a = /* @__PURE__ */ new Map([[null, []]]);
	for (let t of e) {
		if (!St(t.rect) || !t.container && t.rect.height === 0 || i(t)) continue;
		let e = a.get(t.parentId) ?? [];
		e.push(t), a.set(t.parentId, e), t.container && !a.has(t.id) && a.set(t.id, []);
	}
	let o = [];
	for (let [e, i] of a) {
		let a = e === null ? null : n.get(e), s = e === null ? t.rootRect : a?.rect;
		if (!s || !St(s)) continue;
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
				height: Math.max(vt(e), vt(t)) - r
			};
		}, m = c[0], h = c.at(-1), g = c.length > 1 ? Et(m.rect, c[1].rect, l) : l ?? "y", _ = c.length > 1 ? Et(c.at(-2).rect, h.rect, l) : l ?? "y", v = c.length < 2 || yt(c[1].rect, g) >= yt(m.rect, g), y = c.length < 2 || yt(h.rect, _) >= yt(c.at(-2).rect, _), b = v ? bt(m.rect, g) : xt(m.rect, g), x = y ? xt(h.rect, _) : bt(h.rect, _);
		f(m.index, g, v ? bt(s, g) : xt(s, g), b, g === "x" ? m.rect : s, m.rect, "edge", "to");
		for (let e = 1; e < c.length; e++) {
			let t = c[e - 1], n = c[e], r = Et(t.rect, n.rect, l), i = yt(n.rect, r) >= yt(t.rect, r), a = i ? xt(t.rect, r) : bt(t.rect, r), o = i ? bt(n.rect, r) : xt(n.rect, r), u = Math.max(t.rect.top, n.rect.top), d = Math.min(vt(t.rect), vt(n.rect)), m = r === "x" ? {
				left: s.left,
				top: u,
				width: s.width,
				height: Math.max(0, d - u)
			} : s, h = i ? o < a : o > a;
			f(n.index, r, h ? (a + o) / 2 : a, h ? (a + o) / 2 : o, m, r === "x" && m.height > 0 ? m : p(t.rect, n.rect), "between");
		}
		f(h.index + 1, _, x, y ? xt(s, _) : bt(s, _), _ === "x" ? h.rect : s, h.rect, "edge", "from");
	}
	return o;
}
function kt(e, t, n) {
	if (![t.x, t.y].every(Number.isFinite)) return null;
	let r = Ot(e, n).flatMap((e) => {
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
function At(e, t, n) {
	if (![t.x, t.y].every(Number.isFinite)) return null;
	let { isExcluded: r } = Dt(e, n.excludeIds);
	return e.some((e) => r(e) && Ct(e.rect, t)) ? null : Ot(e, n).map((e) => ({
		target: e,
		distance: wt(e.inside ? e.hitRect : e.rect, t)
	})).filter(({ distance: e }) => e <= (n.maxDistance ?? 80)).sort((e, t) => e.distance - t.distance || t.target.depth - e.target.depth)[0]?.target ?? null;
}
// admin/src/core/QuickInserter.tsx
var jt = "cms:blocks:recent", Mt = [
	"paragraph",
	"heading",
	"image",
	"list",
	"button",
	"box"
], Nt = 6, Pt = 9, Ft = 3;
function It() {
	try {
		let e = JSON.parse(localStorage.getItem(jt) ?? "[]");
		return Array.isArray(e) ? e.filter((e) => typeof e == "string") : [];
	} catch {
		return [];
	}
}
function Lt(e) {
	if (e.kind === "block") try {
		localStorage.setItem(jt, JSON.stringify([e.type.name, ...It().filter((t) => t !== e.type.name)].slice(0, 12)));
	} catch {}
}
function Rt({ types: e, allowed: t, onChoose: n, onClose: r }) {
	let [i, a] = j(""), [o, s] = j(!1), [c, l] = j(0), { items: u } = ut(e, i, t, !!i.trim()), d = ce(() => {
		if (i.trim()) return u.slice(0, Pt);
		let e = [...It(), ...Mt], t = (t) => {
			let n = t.kind === "block" ? e.indexOf(t.type.name) : -1;
			return n < 0 ? e.length : n;
		};
		return u.filter((e) => e.kind === "block").sort((e, n) => t(e) - t(n)).slice(0, Nt);
	}, [u, i]);
	k(() => l(0), [i]);
	let f = (e) => {
		Lt(e), n(e);
	};
	return o ? /* @__PURE__ */ V("div", {
		"data-cms-insert-menu": !0,
		"data-cms-browse": !0,
		children: /* @__PURE__ */ V(dt, {
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
				ArrowDown: Ft,
				ArrowUp: -3
			}[e.key];
			t && d.length ? (e.preventDefault(), l((e) => Math.max(0, Math.min(d.length - 1, e + t)))) : e.key === "Enter" && d[c] ? (e.preventDefault(), f(d[c])) : e.key === "Escape" && (e.preventDefault(), r());
		},
		children: [
			/* @__PURE__ */ V("div", {
				className: "p-2 pb-0",
				children: /* @__PURE__ */ V(P, {
					bare: !0,
					fields: [{
						handle: "query",
						type: "text",
						label: C("Search"),
						icon: "search",
						size: "sm",
						autofocus: !0,
						placeholder: C("Search Blocks")
					}],
					values: { query: i },
					onChange: (e, t) => a(t ?? "")
				})
			}),
			/* @__PURE__ */ H("div", {
				role: "listbox",
				"aria-label": i.trim() ? C("Results") : C("Suggestions"),
				className: "grid grid-cols-3 gap-1 p-2",
				children: [d.map((e, t) => {
					let n = e.kind === "block" ? e.type.title : e.component.title, r = e.kind === "block" ? e.type.icon : e.component.synced ? "symbol" : "section-copy";
					return /* @__PURE__ */ H(M, {
						variant: "ghost",
						role: "option",
						"aria-selected": t === c,
						"data-index": t,
						onMouseMove: () => t !== c && l(t),
						onMouseDown: (e) => e.preventDefault(),
						onClick: () => f(e),
						"data-active": t === c || void 0,
						className: "!h-[68px] min-w-0 shrink !flex-col !gap-1.5 !px-1",
						children: [/* @__PURE__ */ V(F, {
							name: r,
							size: 20
						}), /* @__PURE__ */ V("span", {
							className: "w-full truncate text-center text-xs font-medium",
							children: n
						})]
					}, e.kind === "block" ? e.type.name : `p-${e.component.handle}`);
				}), !d.length && /* @__PURE__ */ V("div", {
					className: "col-span-3 px-3 py-5 text-center text-xs text-faint",
					children: C("No matching blocks")
				})]
			}),
			/* @__PURE__ */ H(M, {
				variant: "ghost",
				size: "lg",
				onMouseDown: (e) => e.preventDefault(),
				onClick: () => s(!0),
				className: "!h-9 !gap-1.5 !rounded-none border-t border-border !text-sm focus-visible:!-outline-offset-2",
				children: [C("Browse All"), /* @__PURE__ */ V(F, {
					name: "arrow-right",
					size: 14,
					className: "text-muted"
				})]
			})
		]
	});
}
// admin/src/core/canvas.ts
function zt(e, t) {
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
function Bt(e, t) {
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
var Vt = { weight: "font-weight" }, Ht = "/_cms/site/";
function Ut(e, t = location.href) {
	try {
		let n = new URL(e, t);
		return n.origin === location.origin && n.pathname.startsWith(Ht) ? n.pathname : null;
	} catch {
		return null;
	}
}
var Wt = /\bimport\s*(?:[\w$*{}\s,]+?\s*from\s*)?["']([^"']+)["']|\bexport\s*[\w$*{}\s,]*?\s*from\s*["']([^"']+)["']|\bimport\s*\(\s*["']([^"']+)["']\s*\)/g;
async function Gt(e, t) {
	let n = {}, r = {}, i = /* @__PURE__ */ new Set(), a = async (e) => {
		if (i.has(e) || i.size > 200) return;
		i.add(e);
		let o = await fetch(e, { credentials: "same-origin" }).then((e) => e.ok ? e.text() : "", () => ""), s = [];
		for (let i of o.matchAll(Wt)) {
			let a = i[1] ?? i[2] ?? i[3], o = /^(\/|\.\/|\.\.\/)/.test(a), c = o ? Ut(a, location.origin + e) : a, l = c ? Ut(t.imports?.[c] ?? (o ? c : "")) : null;
			c && l && (t.imports?.[c] && (n[c] = l), t.integrity?.[l] && (r[l] = t.integrity[l]), s.push(l));
		}
		await Promise.all(s.map(a));
	};
	return await a(e), {
		imports: n,
		...Object.keys(r).length ? { integrity: r } : {}
	};
}
async function Kt(e, t) {
	let n;
	try {
		n = JSON.parse(e.querySelector("script[data-cms-importmap]")?.textContent ?? "{}");
	} catch {
		return null;
	}
	let r = await Gt(t, n);
	if (!Object.keys(r.imports ?? {}).length) return null;
	let i = document.createElement("script");
	return i.type = "importmap", i.dataset.cmsCanvas = "", i.nonce = document.querySelector("script[nonce]")?.nonce ?? "", i.textContent = JSON.stringify(r), document.head.append(i), i;
}
function qt(e) {
	try {
		return JSON.parse(e.dataset.cmsCanvas ?? "[]").flatMap((e) => {
			let t = typeof e?.src == "string" ? Ut(e.src) : null;
			return t ? [{
				...e,
				src: t
			}] : [];
		});
	} catch {
		return [];
	}
}
var Jt = (e, t) => console.error("[cms] canvas behavior", e, t);
function Yt() {
	let e = [], t = [];
	async function n(e, n, r) {
		let i = r.defaultView;
		if (i) try {
			let a = await Kt(r, n.src);
			if (a && t.push(a), e.abort.signal.aborted) return;
			let o = await import(
				/* @vite-ignore */
				n.src
);
			if (e.abort.signal.aborted || o.canvas !== !0) return;
			e.module = o;
			let s = () => i.getComputedStyle(e.el), c = {
				token: (e) => {
					let t = e.indexOf("."), n = e.slice(0, t);
					return s().getPropertyValue(`--${Vt[n] ?? n}-${e.slice(t + 1)}`).trim();
				},
				reducedMotion: i.matchMedia("(prefers-reduced-motion: reduce)").matches,
				signal: e.abort.signal,
				canvas: !0,
				window: i,
				document: r
			}, l = o.mount ?? o.default, u = await zt(i, () => l?.(e.el, n.props ?? {}, c));
			if (e.abort.signal.aborted) {
				typeof u == "function" && u();
				return;
			}
			typeof u == "function" && (e.cleanup = u), e.unpicture = Bt(e.el, i);
		} catch (e) {
			Jt(n.src, e);
		}
	}
	return {
		mount(t) {
			for (let r of t.querySelectorAll("[data-cms-canvas]")) for (let i of qt(r)) {
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
					Jt(e.module ? "unmount" : "mount", t);
				}
			}
			t.forEach((e) => e.remove()), t = [];
		}
	};
}
// admin/src/core/morph.ts
function Xt(e, t) {
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
function Zt(e) {
	let t = A(e);
	t.current = e;
	let [n, r] = j(null), i = A(null), a = A(() => {});
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
var Qt = 32, $t = 6, en = 4;
function tn({ target: e, position: t, ...n }) {
	let r = t(e.rect);
	return /* @__PURE__ */ H(Te, { children: [/* @__PURE__ */ V("div", {
		"data-cms-insertion-line": !0,
		className: z("pointer-events-none absolute z-raised rounded-full bg-focus", e.axis === "x" ? "cms-block-line-y" : "cms-block-line-x"),
		style: {
			...r,
			minWidth: 2,
			minHeight: 2
		}
	}), /* @__PURE__ */ V(an, {
		...n,
		label: C("Insert Block"),
		className: "cms-block-plus absolute size-6 -translate-x-1/2 -translate-y-1/2 rounded-xs bg-signal text-signal-ink shadow-sm",
		style: {
			left: r.left + r.width / 2,
			top: r.top + r.height / 2
		},
		data: { "data-cms-inserter": `${e.parentId ?? ""}:${e.index}` }
	})] });
}
function nn({ target: e, position: t, ...n }) {
	let r = t(e.hitRect);
	return /* @__PURE__ */ V(an, {
		...n,
		label: C("Insert Block"),
		className: "cms-block-chrome absolute size-7 -translate-x-1/2 -translate-y-1/2 rounded-sm border border-border-strong bg-bg text-muted shadow-sm hover:border-focus hover:text-focus",
		style: {
			left: r.left + r.width / 2,
			top: r.top + Math.min(r.height / 2, 40)
		},
		data: { "data-cms-appender": e.parentId ?? "" }
	});
}
function rn({ target: e, position: t, onWrite: n, ...r }) {
	let i = t(e.hitRect);
	return /* @__PURE__ */ H("div", {
		"data-cms-document-appender": !0,
		className: "cms-block-chrome pointer-events-auto absolute z-raised flex h-10 whitespace-nowrap -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-md border border-dashed border-border-strong bg-bg/90 py-1 pl-3 pr-1 shadow-sm",
		style: {
			left: i.left + i.width / 2,
			top: i.top + Math.max(24, Math.min(i.height / 2, 120))
		},
		children: [n && /* @__PURE__ */ V(R, {
			compact: !0,
			onClick: n,
			className: "cms-focus-ring h-8 rounded-xs px-1 text-sm text-muted hover:text-text",
			children: C("Write, or press “/” for blocks")
		}), /* @__PURE__ */ V(an, {
			...r,
			label: C("Insert Block"),
			className: "size-8 rounded-xs text-muted hover:bg-hover hover:text-text"
		})]
	});
}
function an({ open: e, onOpenChange: t, returnFocus: n, children: r, label: i, className: a, style: o, data: s }) {
	return /* @__PURE__ */ V(de, {
		open: e,
		onOpenChange: t,
		side: "bottom",
		align: "center",
		className: "!overflow-hidden !p-0",
		returnFocus: n,
		trigger: /* @__PURE__ */ V(R, {
			compact: !0,
			...s,
			"aria-label": e ? C("Close") : i,
			"aria-expanded": e,
			className: z("cms-focus-ring pointer-events-auto z-drag grid place-items-center", a),
			style: o,
			children: /* @__PURE__ */ V(F, {
				name: "plus",
				size: 14,
				className: z("cms-block-plus-icon", e && "rotate-45")
			})
		}),
		children: e && r
	});
}
function on({ id: e, label: t, icon: n, parent: r, box: i, viewport: a, canMoveUp: o, canMoveDown: s, onSelectParent: c, onDrag: l, onMove: u, onInsert: d, onDuplicate: f, onMakeComponent: p, onDelete: m, covers: h }) {
	let g = A(null), [_, v] = j(240);
	se(() => {
		g.current && v(g.current.offsetWidth);
	});
	let y = i.top + i.height;
	if (y < 40 || i.top > a.height - Qt || i.left > a.width || i.left + i.width < 0) return null;
	let b = (e) => Math.max(en, Math.min(a.width - _ - en, e)), x = b(i.left), ee = b(i.left + i.width - _), S = i.top - Qt - $t, w = y + $t, T = Math.max(en, i.top + en), E = (e) => e >= en && e + Qt <= a.height - en, { left: D, top: te } = [
		S,
		w,
		T
	].flatMap((e) => [{
		left: x,
		top: e
	}, {
		left: ee,
		top: e
	}]).find((e) => E(e.top) && !h?.({
		...e,
		width: _,
		height: Qt
	})) ?? {
		left: x,
		top: E(S) ? S : T
	};
	return /* @__PURE__ */ H("div", {
		ref: g,
		"data-cms-block-controls": e,
		role: "toolbar",
		"aria-label": C("Block Actions"),
		className: "cms-block-chrome pointer-events-auto absolute z-bar flex h-8 items-center gap-0.5 rounded-sm border border-border bg-bg pl-0.5 pr-1 shadow-pop",
		style: {
			left: D,
			top: te
		},
		children: [
			/* @__PURE__ */ V(R, {
				compact: !0,
				"aria-label": C("Drag to Reorder"),
				title: C("Drag to Reorder"),
				className: "cms-focus-ring grid h-6 w-4 touch-none cursor-grab place-items-center rounded-xs text-faint hover:bg-hover hover:text-muted active:cursor-grabbing",
				onPointerDown: l,
				children: /* @__PURE__ */ V(F, {
					name: "drag",
					size: 12
				})
			}),
			r && /* @__PURE__ */ V(ge, {
				content: C("Select {block}", { block: r.label }),
				children: /* @__PURE__ */ V(I, {
					size: "xs",
					icon: "arrow-elbow-left-up",
					label: C("Select {block}", { block: r.label }),
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
				label: C("Move Up"),
				disabled: !o,
				onClick: () => u(-1)
			}),
			/* @__PURE__ */ V(I, {
				size: "xs",
				icon: "chevron-down",
				label: C("Move Down"),
				disabled: !s,
				onClick: () => u(1)
			}),
			/* @__PURE__ */ V("span", { className: "mx-0.5 h-4 border-l border-border" }),
			/* @__PURE__ */ V(L, {
				align: "end",
				trigger: /* @__PURE__ */ V(I, {
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
function sn({ drag: e, position: t }) {
	return /* @__PURE__ */ H(Te, { children: [
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
var cn = new EventTarget(), ln = {
	emit(e, t) {
		cn.dispatchEvent(new CustomEvent(e, { detail: t }));
	},
	on(e, t) {
		let n = (e) => t(e.detail);
		return cn.addEventListener(e, n), () => cn.removeEventListener(e, n);
	}
}, un = te({
	stops: () => [],
	settings: () => {},
	readOnly: !1
}), dn = () => ae(un);
function fn(e = "") {
	return {
		id: g(),
		type: "paragraph",
		props: { text: e }
	};
}
function pn(e, t, n, r) {
	return e.id === t && e.prop === n && (r === void 0 || e.index === r);
}
function mn(e, t, n) {
	e.focus(t.id, n, t.prop, t.index);
}
function hn(e, t, n) {
	if (!t) return;
	let r = /* @__PURE__ */ new Set(), i = (e) => {
		r.add(e.id), e.children?.forEach(i);
	};
	i(t);
	let a = n.find((e) => r.has(e.id));
	a ? mn(e, a, "start") : e.select(t.id, !0);
}
function gn(e) {
	let t = e.getElementById("f-title");
	return t ? (t.focus(), t.setSelectionRange(t.value.length, t.value.length), !0) : !1;
}
function _n(e, t, n, r, i) {
	if (e.shiftKey || e.metaKey || e.ctrlKey || e.altKey) return !1;
	let a = e.key === "ArrowUp" && Je(t) || e.key === "ArrowLeft" && Ue(t), o = e.key === "ArrowDown" && Ye(t) || e.key === "ArrowRight" && We(t);
	if (a) {
		let a = r[i - 1];
		if (a) mn(n, a, "end");
		else if (e.key !== "ArrowUp" || !gn(t.ownerDocument)) return !1;
		return e.preventDefault(), !0;
	}
	if (o) {
		let t = r[i + 1];
		return t ? (e.preventDefault(), mn(n, t, "start"), !0) : !1;
	}
	return !1;
}
// admin/src/write/outline.ts
var vn = [
	"paragraph",
	"heading",
	"quote",
	"callout"
];
function yn(e) {
	return e.kind === "actions" ? e.nodes : [e.node];
}
function bn(e) {
	return yn(e)[0].id;
}
function xn(e, t, n) {
	let r = {
		types: t,
		custom: n
	}, i = [];
	for (let t of e) {
		let e = wn(t, null, !1, r), n = e.kind === "container" || e.kind === "columns", a = i.at(-1);
		!n && a && !a.container ? En(a.rows, e) : i.push({
			id: t.id,
			label: n && t.label?.trim() || null,
			rows: [e],
			container: n
		});
	}
	return i;
}
function Sn(e) {
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
function Cn(e) {
	let t = [], n = (e) => {
		for (let r of e) if (t.push(r), r.kind === "columns") for (let e of r.columns) n(e.rows);
		else r.kind === "container" && n(r.rows);
	};
	for (let t of e) n(t.rows);
	return t;
}
function wn(e, t, n, r) {
	let i = n || !!e.hidden, a = {
		parent: t,
		hidden: i
	}, o = r.types.get(e.type), s = r.custom(e.type), c = (e.children?.length ?? 0) > 0;
	return e.type === "columns" && o && !s ? {
		kind: "columns",
		node: e,
		columns: (e.children ?? []).map((e) => ({
			node: e,
			rows: Tn(e.children ?? [], e.id, i || !!e.hidden, r)
		})),
		...a
	} : !s && o && !c && (e.type === "button" || e.type === "link") ? {
		kind: "actions",
		nodes: [e],
		...a
	} : o?.children || c ? {
		kind: "container",
		node: e,
		rows: Tn(e.children ?? [], e.id, i, r),
		...a
	} : !o || s ? {
		kind: "block",
		node: e,
		...a
	} : vn.includes(e.type) ? {
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
function Tn(e, t, n, r) {
	let i = [];
	for (let a of e) En(i, wn(a, t, n, r));
	return i;
}
function En(e, t) {
	let n = e.at(-1);
	t.kind === "actions" && n?.kind === "actions" && n.parent === t.parent && n.hidden === t.hidden ? n.nodes.push(...t.nodes) : e.push(t);
}
// admin/src/write/slash.ts
var Dn = null, On = /* @__PURE__ */ new Set();
function kn(e) {
	return Dn?.id === e ? Dn : null;
}
function An(e) {
	JSON.stringify(e) !== JSON.stringify(Dn) && (Dn = e, On.forEach((e) => e()));
}
function jn() {
	return le((e) => (On.add(e), () => On.delete(e)), () => Dn);
}
function Mn(e, t = 360, n = 300) {
	let r = window.innerHeight - e.bottom - 6 - 8, i = e.top - 6 - 8, a = r >= Math.min(t, 220) || r >= i;
	return {
		left: Math.max(8, Math.min(window.innerWidth - n - 8, e.left - 4)),
		top: a ? e.bottom + 6 : void 0,
		bottom: a ? void 0 : window.innerHeight - e.top + 6,
		maxHeight: Math.max(120, Math.min(t, a ? r : i))
	};
}
function Nn(e, t) {
	k(() => {
		if (!e) return;
		let n = (e) => !e.target?.closest?.("[data-cms-slash]") && An(null), r = t.filter((e) => !!e);
		return r.forEach((e) => e.addEventListener("pointerdown", n, !0)), () => r.forEach((e) => e.removeEventListener("pointerdown", n, !0));
	}, [e, ...t]);
}
// admin/src/write/Text.tsx
var Pn = {
	1: "text-display font-semibold",
	2: "text-3xl font-semibold",
	3: "text-2xl font-semibold",
	4: "text-xl font-semibold",
	5: "text-lg font-semibold",
	6: "text-base font-semibold uppercase tracking-[0.04em] text-muted"
}, Fn = "text-lg leading-7", In = {
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
function Ln({ node: e }) {
	if (e.type === "quote") return /* @__PURE__ */ H("blockquote", {
		className: "m-0 border-l-[3px] border-text/80 py-0.5 pl-4",
		children: [/* @__PURE__ */ V(Bn, {
			node: e,
			prop: "text",
			className: "text-lg leading-7",
			placeholder: C("Quote")
		}), /* @__PURE__ */ V(Bn, {
			node: e,
			prop: "cite",
			className: "cms-block-cite mt-1 text-sm text-muted",
			placeholder: C("Attribution"),
			quiet: !0
		})]
	});
	if (e.type === "callout") return /* @__PURE__ */ V(zn, { node: e });
	if (e.type === "heading") {
		let t = String(e.props.level ?? 2);
		return /* @__PURE__ */ V(Bn, {
			node: e,
			prop: "text",
			tag: `h${t}`,
			className: Pn[t] ?? Pn[2],
			placeholder: C("Heading {level}", { level: t })
		});
	}
	return /* @__PURE__ */ V(Rn, { node: e });
}
function Rn({ node: e }) {
	let { store: t } = U(), n = W(t, (t) => t.nodes.length === 1 && t.nodes[0].id === e.id);
	return /* @__PURE__ */ V(Bn, {
		node: e,
		prop: "text",
		tag: "p",
		className: Fn,
		placeholder: C("Write, or press “/” for blocks"),
		quiet: !n
	});
}
function zn({ node: e }) {
	let { store: t } = U(), { readOnly: n } = dn(), r = In[e.props.tone] ?? In.note;
	return /* @__PURE__ */ H("div", {
		className: z("flex gap-3 rounded-md px-4 py-3", r.className),
		children: [/* @__PURE__ */ V(L, {
			align: "start",
			trigger: /* @__PURE__ */ V(R, {
				compact: !0,
				disabled: n,
				"aria-label": C("Callout Style"),
				className: "grid h-[27px] w-5 shrink-0 place-items-center rounded-xs text-muted hover:text-text",
				children: /* @__PURE__ */ V(F, {
					name: r.icon,
					size: 17
				})
			}),
			items: Object.entries(In).map(([n, r]) => ({
				label: r.label(),
				icon: r.icon,
				checked: n === (e.props.tone ?? "note"),
				onSelect: () => t.updateProps(e.id, { tone: n })
			}))
		}), /* @__PURE__ */ V(Bn, {
			node: e,
			prop: "text",
			className: z(Fn, "min-w-0 flex-1"),
			placeholder: C("Write a note")
		})]
	});
}
function Bn({ node: e, prop: i, tag: s = "div", className: c, placeholder: l, quiet: u }) {
	let { store: d, types: f, allowed: _ } = U(), { stops: v, readOnly: y } = dn(), b = W(d, (t) => t.focus?.id === e.id && (t.focus.prop ?? "text") === i ? t.focus : null), x = String(e.props[i] ?? ""), ee = (t, n) => {
		if (e.type === "paragraph" && i === "text" && S(t, n)) return;
		d.updateProps(e.id, { [i]: t }, `text:${e.id}:${i}`);
		let r = e.type === "paragraph" ? t.replace(/<[^>]+>/g, "").match(/^\/([\w-]*)$/) : null;
		An(r ? {
			id: e.id,
			query: r[1]
		} : null);
	}, S = (n, i) => {
		let a = n.replace(/&nbsp;/g, " "), o = (n, a, o) => {
			let s = r(d.get().nodes, e.id), c = s?.parentId ? t(d.get().nodes, s.parentId) : null;
			if (!f.has(n) || !p(c, n, f, c ? [] : _)) return !1;
			let l = Math.max(0, Ke(i) - q(o));
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
			let t = fn(), { nodes: n } = d.get(), i = r(n, e.id);
			return d.commit(m(h(n, e.id, (e) => ({
				...e,
				type: "divider",
				props: {}
			})), i?.parentId ?? null, (i?.index ?? n.length) + 1, [t])), d.focus(t.id, "start"), !0;
		}
		return !1;
	}, C = (s, c) => {
		if (s.defaultPrevented) return;
		let l = v(), u = l.findIndex((t) => pn(t, e.id, i)), p = l[u], { nodes: y } = d.get();
		if (s.key === "Enter" && !s.shiftKey && !s.metaKey && !s.ctrlKey && !s.altKey) {
			s.preventDefault();
			let t = kn(e.id);
			if (t && ct(!0, !!document.querySelector("[data-cms-slash]"))) return An({
				...t,
				enter: !0
			});
			if (i === "cite") {
				let t = fn(), n = o(y, e.id, "paragraph", f, _);
				if (!n) return;
				d.insert(n.parentId, n.index, [t]), d.focus(t.id, "start");
				return;
			}
			let [a, l] = qe(c);
			if (n(a) && !n(l)) {
				let t = r(y, e.id);
				if (!t) return;
				d.insert(t.parentId, t.index, [fn()]), d.focus(e.id, "start");
				return;
			}
			let u = e.type === "paragraph" ? {
				id: g(),
				type: "paragraph",
				props: {
					...e.props,
					text: l
				},
				...e.style ? { style: structuredClone(e.style) } : {},
				...e.class ? { class: e.class } : {}
			} : fn(l), p = o(y, e.id, "paragraph", f, _);
			if (!p) return;
			d.commit(m(h(y, e.id, (e) => ({
				...e,
				props: {
					...e.props,
					[i]: a
				}
			})), p.parentId, p.index, [u])), d.focus(u.id, "start");
		} else if (s.key === "Backspace" && Ue(c)) {
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
				d.remove(e.id), mn(d, t, "end");
				return;
			}
			if (t.parent === p?.parent && w(t, x)) return;
			mn(d, t, "end");
		} else if (s.key === "Delete" && We(c) && i === "text") {
			let n = l[u + 1], r = n && n.prop === "text" && n.parent === p?.parent ? t(y, n.id) : null;
			if (!r || !["paragraph", "heading"].includes(r.type)) return;
			s.preventDefault();
			let i = q(x);
			d.commit(a(h(y, e.id, (e) => ({
				...e,
				props: {
					...e.props,
					text: x + String(r.props.text ?? "")
				}
			})), r.id)), d.focus(e.id, i);
		} else _n(s, c, d, l, u) || s.key === "Escape" && (s.preventDefault(), c.blur(), d.select(e.id, !0));
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
			})), e.id)), mn(d, n, q(s)), !0;
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
		})), e.id)), mn(d, n, q(s)), !0;
	};
	return /* @__PURE__ */ V(nt, {
		tag: s,
		html: x,
		onChange: ee,
		placeholder: l,
		quiet: u,
		className: c,
		focus: b,
		disabled: y,
		onKeyDown: C,
		onFocus: () => d.get().selected !== e.id && d.select(e.id),
		onPaste: (t) => !t.includes("\n") || i !== "text" ? !1 : (import("./paste-OPiZiA2v.js").then((n) => n.pasteMarkdown(d, e, t, f, _)), !0)
	});
}
function Vn({ node: e, renderItem: t }) {
	let { store: i, types: s, allowed: c } = U(), { stops: l, readOnly: u } = dn(), d = Array.isArray(e.props.items) && e.props.items.length ? e.props.items : [""], f = W(i, (t) => t.focus?.id === e.id && t.focus.prop === "items" ? t.focus : null), p = !!e.props.ordered, g = (t, n = `list:${e.id}`) => i.updateProps(e.id, { items: t }, n), _ = (t) => (u, f) => {
		if (u.defaultPrevented) return;
		let { nodes: p } = i.get(), _ = l(), v = _.findIndex((n) => pn(n, e.id, "items", t));
		if (u.key === "Enter" && !u.shiftKey && !u.metaKey && !u.ctrlKey) {
			if (u.preventDefault(), n(d[t]) && t === d.length - 1) {
				let t = fn(), n = d.slice(0, -1), r = o(p, e.id, "paragraph", s, c);
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
			let [r, l] = qe(f);
			g([
				...d.slice(0, t),
				r,
				l,
				...d.slice(t + 1)
			], ""), i.focus(e.id, "start", "items", t + 1);
		} else if (u.key === "Backspace" && Ue(f)) {
			if (u.preventDefault(), t === 0) {
				let t = fn(d[0]), n = r(p, e.id), o = d.slice(1), s = m(p, n?.parentId ?? null, n?.index ?? 0, [t]);
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
			], ""), i.focus(e.id, q(d[t - 1]), "items", t - 1);
		} else _n(u, f, i, _, v) || u.key === "Escape" && (u.preventDefault(), f.blur(), i.select(e.id, !0));
	}, v = (n, r) => /* @__PURE__ */ V(nt, {
		html: n,
		className: t ? void 0 : "min-w-0 flex-1 pl-1",
		tag: t ? "span" : "div",
		placeholder: C("List"),
		quiet: !0,
		disabled: u,
		focus: f && (f.index ?? 0) === r ? f : null,
		onChange: (e) => g(d.map((t, n) => n === r ? e : t)),
		onKeyDown: _(r),
		onFocus: () => i.get().selected !== e.id && i.select(e.id)
	});
	return t ? /* @__PURE__ */ V(Te, { children: d.map((e, n) => t(n, v(e, n))) }) : /* @__PURE__ */ V("div", {
		className: z(Fn, "space-y-0.5"),
		children: d.map((e, t) => /* @__PURE__ */ H("div", {
			className: "flex",
			children: [/* @__PURE__ */ V("span", {
				className: z("w-6 shrink-0 select-none text-muted", p ? "pr-1.5 text-right tabular-nums" : "pl-1.5"),
				"aria-hidden": !0,
				children: p ? `${t + 1}.` : "•"
			}), v(e, t)]
		}, t))
	});
}
// admin/src/LiveEditor.tsx
var Hn = (e, t, n) => e.axis === "x" ? {
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
}, Un = (e) => `${e.parentId ?? ""}:${e.index}:${e.inside ? "inside" : e.axis}`, Wn = "\nhtml{scrollbar-width:thin;scrollbar-color:rgb(127 127 127/.35) transparent}\n[data-cms-document][data-cms-node]{cursor:default}\n.cms-block-text{display:block;min-width:1ch;min-height:1lh;white-space:pre-wrap;overflow-wrap:break-word;outline:none;border-radius:0;font:inherit;color:inherit;line-height:inherit;text-align:inherit;cursor:text}\n.cms-block-text:empty::before{content:attr(data-placeholder);opacity:.4;pointer-events:none}\n.cms-block-text[data-quiet]:empty:not(:focus)::before{content:none}\n[data-cms-prop]{cursor:text}\n.cms-block-text::selection,.cms-block-text ::selection{background:rgb(0 122 255/.2)}\nimg,a{-webkit-user-drag:none}\n[data-cms-conditional=hidden]:not([data-cms-reveal]){display:none!important}\n[data-cms-editor-empty-root]{visibility:hidden}\n.cms-js [data-cms-appear]{visibility:visible!important}\n", Gn = /* @__PURE__ */ new Set([
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
function Kn(e, t, n) {
	let r = e.elementFromPoint(t, n);
	if (!r || r === e.body || r === e.documentElement) return !1;
	if (Gn.has(r.tagName) || r.closest("svg")) return !0;
	let i = [...r.childNodes].filter((e) => e.nodeType === Node.TEXT_NODE && e.textContent?.trim());
	if (!i.length) return !1;
	let a = e.createRange();
	return i.some((e) => (a.selectNodeContents(e), [...a.getClientRects()].some((e) => t >= e.left - 2 && t <= e.right + 2 && n >= e.top - 2 && n <= e.bottom + 2)));
}
function qn(e) {
	let t = parseFloat(e ?? "");
	return Number.isNaN(t) ? 0 : /r?em$/.test(e ?? "") ? t * 16 : t;
}
function Jn({ collection: e, blueprint: n, entryId: a, content: c, onInspect: d, standalone: m, onTitleChange: h }) {
	let { store: g, types: v, allowed: y, fieldHandle: x, readOnly: S = !1 } = U(), w = Me(), T = W(g, (e) => e.nodes), E = W(g, (e) => e.selected), D = W(g, Re), te = W(g, (e) => e.blockMode), ne = W(g, (e) => e.hovered), re = W(g, (e) => e.breakpoint), O = C("Page Builder"), ae = !S && !!E && te;
	Ce("up", C("Select Previous Block"), O, ae), Ce("down", C("Select Next Block"), O, ae), Ce("shift+up", C("Select the Block Above Too"), O, ae), Ce("shift+down", C("Select the Block Below Too"), O, ae), Ce("alt+up", C("Move Up"), O, ae), Ce("alt+down", C("Move Down"), O, ae), Ce("enter", C("Edit Block"), O, ae), Ce("mod+d", C("Duplicate Block"), O, ae), Ce("backspace", C("Delete Block"), O, ae), Ce("escape", C("Deselect"), O, !!E), Ce("mod+alt+t", C("Insert Before"), O, !S && !!E), Ce("mod+alt+y", C("Insert After"), O, !S && !!E), Ce("mod+z", C("Undo"), O, !S), Ce("mod+shift+z", C("Redo"), O, !S);
	let { breakpoints: oe } = Pe(), le = qn(oe.lg) || 1024, M = A(null), N = A(null), [P, F] = j(null), I = A(""), [L, ue] = j([]), [de, R] = j(!0), [pe, he] = j(null), [ge, z] = j(0), [B, ve] = j({
		width: 1024,
		height: 700,
		scale: 1,
		left: 0
	}), [ye, be] = j([]), [xe, Se] = j(null), [we, Ee] = j([]), [Oe, ke] = j(null), Ae = A(0), je = A(""), [Fe, Ie] = j(!1), [Le, ze] = j(!1), Be = A(!1), G = A(null), Ve = ce(() => {
		let e = [], t = (n, r) => n.forEach((n, i) => {
			e.push({
				node: n,
				parentId: r,
				index: i
			}), n.children && t(n.children, n.id);
		});
		return t(T, null), e;
	}, [T]), He = A(Ve);
	He.current = Ve;
	let [K, Ue] = j(null), We = A(K);
	We.current = K;
	let Ge = A(null);
	k(() => {
		K || (Ge.current = null);
	}, [K]);
	let Ke = A(0), qe = A({
		busy: !1,
		queued: !1,
		timer: 0,
		alive: !0
	}), Je = A(async () => {}), Ye = () => {
		let e = qe.current;
		e.queued = !0, !(!e.alive || e.busy || e.timer) && (e.timer = window.setTimeout(() => {
			e.timer = 0, Je.current();
		}, I.current ? 80 : 0));
	}, Xe = () => He.current.map(({ node: e, parentId: t, index: n }) => `${t}:${n}:${e.id}:${e.type}:${e.type === "list" ? e.props.items?.length ?? 0 : ""}`).join("|"), Ze = A(null), Qe = A(Yt());
	k(() => () => Qe.current.unmount(), []);
	let q = A({
		content: c,
		onInspect: d,
		readOnly: S,
		layout: B,
		onTitleChange: h
	});
	q.current = {
		content: c,
		onInspect: d,
		readOnly: S,
		layout: B,
		onTitleChange: h
	};
	let J = (e, t) => e.querySelector(`[data-cms-document="${I.current}"][data-cms-node="${CSS.escape(t)}"]`) ?? e.querySelector(`[data-cms-proto-document="${I.current}"][data-cms-proto="${CSS.escape(t)}"]`), $e = (e) => {
		let n = "[data-cms-document][data-cms-node],[data-cms-proto-document][data-cms-proto]", r = e?.closest?.(n) ?? null;
		for (; r;) {
			let e = r.dataset.cmsDocument === I.current ? r.dataset.cmsNode : r.dataset.cmsProtoDocument === I.current ? r.dataset.cmsProto : void 0;
			if (e && t(g.get().nodes, e)) return e;
			r = r.parentElement?.closest(n) ?? null;
		}
		return null;
	}, et = (e) => {
		if (e.ownerDocument.defaultView?.getComputedStyle(e).display !== "contents") return e.getBoundingClientRect();
		let t = e.ownerDocument.createRange();
		return t.selectNodeContents(e), t.getBoundingClientRect();
	}, tt = () => {
		if (G.current) return G.current;
		let e = N.current?.contentDocument, t = e?.querySelector(`[data-cms-editor-root="${I.current}"]`);
		if (!e || !t) return null;
		let n = (t) => {
			let n = e.defaultView.getComputedStyle(t);
			return n.display.includes("flex") && n.flexDirection.startsWith("row") || n.display.includes("grid") && n.gridTemplateColumns.split(" ").length > 1 ? "x" : "y";
		}, r = new Map([...e.querySelectorAll(`[data-cms-document="${I.current}"][data-cms-node]`)].map((e) => [e.dataset.cmsNode, e])), i = He.current.flatMap(({ node: t, parentId: i, index: a }) => {
			let o = r.get(t.id);
			return !o || e.defaultView.getComputedStyle(o).display === "none" ? [] : [{
				id: t.id,
				parentId: i,
				index: a,
				rect: et(o),
				container: !!v.get(t.type)?.children && !["repeat", "component"].includes(t.type),
				axis: n(o)
			}];
		}), a = et(t);
		return a.width === 0 && (a = et(t.parentElement ?? e.body)), i.length || (a = {
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
	}, nt = (e, n = ["paragraph"]) => {
		let r = e ? t(g.get().nodes, e) : null;
		return n.every((e) => p(r, e, v, r ? [] : y));
	}, rt = (e) => [...v.values()].some((t) => nt(e, [t.name])), it = () => {
		let e = /* @__PURE__ */ new Map();
		return (t) => e.get(t) ?? e.set(t, rt(t)).get(t);
	}, ot = () => {
		let e = N.current?.contentDocument, t = tt();
		if (!e || !t) return;
		be(Re(g.get()).flatMap((t) => {
			let n = J(e, t);
			return n ? [et(n)] : [];
		}));
		let n = g.get().hovered, r = n ? J(e, n) : null;
		Se(r ? et(r) : null);
		let i = Ot(t.blocks, {
			rootRect: t.rootRect,
			canInsert: it()
		});
		Ee(i), Ue((t) => {
			if (!t) return t;
			let n = Ge.current?.key === Un(t) ? Ge.current : null, r = n ? J(e, n.id) : null, a = n ? r ? Hn(t, et(r), n.side) : t : i.find((e) => Un(e) === Un(t)) ?? t, o = a.inside ? a.hitRect.top : a.rect.top;
			return o < 0 || o > q.current.layout.height ? null : a;
		});
	}, st = (e) => {
		let t = e ? Un(e) : "";
		t !== je.current && (je.current = t, clearTimeout(Ae.current), ke(null), e && (Ae.current = window.setTimeout(() => ke(e), 80)));
	}, ct = (e) => {
		let t = Re(g.get()), n = t.length ? r(g.get().nodes, e === "before" ? t[0] : t.at(-1)) : null, i = N.current?.contentDocument;
		if (!n || !i || q.current.readOnly || !rt(n.parentId)) return;
		let a = e === "before" ? n.index : n.index + 1, o = J(i, e === "before" ? t[0] : t.at(-1)), s = o ? et(o) : null, c = i.defaultView, l = q.current.layout.height;
		if (s) {
			let t = e === "before" ? s.top : s.top + s.height;
			(t < 48 || t > l - 160) && c.scrollBy(0, t - l / 3);
		}
		requestAnimationFrame(() => {
			G.current = null;
			let r = tt(), i = o ? et(o) : null;
			if (!i) return;
			let s = Hn((r && Ot(r.blocks, {
				rootRect: r.rootRect,
				canInsert: it()
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
				key: Un(s),
				id: e === "before" ? t[0] : t.at(-1),
				side: e
			}, st(null), Ue(s);
		});
	}, lt = () => {
		let e = P?.activeElement;
		if (document.activeElement === N.current && e?.isContentEditable) return e;
		let t = g.get().focus;
		return (t && P ? J(P, t.id) : null)?.querySelector("[data-cms-inline]") ?? null;
	}, ut = (e) => {
		G.current = null;
		let t = [];
		if (q.current.onTitleChange) for (let t of e.querySelectorAll("[data-cms-entry-field=\"title\"]")) t.querySelector("[data-cms-inline]") || t.replaceChildren();
		for (let n of e.querySelectorAll("[data-cms-prop]")) {
			let e = n.closest("[data-cms-document][data-cms-node]");
			e?.dataset.cmsDocument === I.current && e.dataset.cmsNode && (n.querySelector("[data-cms-inline]") || n.replaceChildren(), t.push({
				element: n,
				id: e.dataset.cmsNode,
				prop: n.dataset.cmsProp,
				...n.dataset.cmsIndex === void 0 ? {} : { index: Number(n.dataset.cmsIndex) }
			}));
		}
		for (let n of e.querySelectorAll("[data-cms-instance-prop]")) n.dataset.cmsInstanceDocument === I.current && n.dataset.cmsInstanceNode && (n.querySelector("[data-cms-inline]") || n.replaceChildren(), t.push({
			element: n,
			id: n.dataset.cmsInstanceNode,
			prop: n.dataset.cmsInstanceProp,
			instance: {
				type: n.dataset.cmsInstanceType ?? "text",
				value: n.dataset.cmsInstanceValue ?? ""
			}
		}));
		ue(t), requestAnimationFrame(ot);
	}, dt = () => {
		let e = N.current?.contentDocument, t = e?.querySelector("[data-cms-editor-root]");
		if (!e || !t || !I.current) return;
		let n = new Set(s(g.get().nodes).map(({ node: e }) => e.id));
		for (let t of e.querySelectorAll("[data-cms-document][data-cms-node]")) t.dataset.cmsDocument === I.current && !n.has(t.dataset.cmsNode) && t.remove();
		let r = (t, n) => {
			for (let i = 0; i < t.length; i++) {
				let a = t[i], o = J(e, a.id);
				if (!o || o.dataset.cmsType !== a.type) {
					let r = e.querySelector(`template[data-cms-prototype="${CSS.escape(a.type)}"]`)?.content.firstElementChild?.cloneNode(!0);
					if (!r) continue;
					if (r.dataset.cmsNode = a.id, r.dataset.cmsDocument = I.current, o) o.replaceWith(r);
					else {
						let a = t.slice(i + 1).map((t) => J(e, t.id)).find(Boolean), o = t.slice(0, i).reverse().map((t) => J(e, t.id)).find(Boolean);
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
		g.get().nodes.length && t.querySelector(":scope > [data-cms-editor-empty-root]")?.remove(), r(g.get().nodes, t), ut(e);
	}, ft = ce(() => ({
		stops: () => Sn(xn(g.get().nodes, v, () => !1)).filter((e) => L.some((t) => t.id === e.id && t.prop === e.prop && (e.index === void 0 || t.index === e.index))),
		settings: (e) => q.current.onInspect(e),
		readOnly: S
	}), [
		g,
		v,
		L,
		S
	]), mt = A(ft);
	mt.current = ft, se(() => {
		G.current = null, dt();
	}, [T, P]), se(() => {
		if (!M.current) return;
		let e = () => {
			let e = M.current, t = Math.max(e.clientWidth, le), n = re === "tablet" ? _e.tablet : re === "mobile" ? Math.min(_e.phone, e.clientWidth) : t, r = Math.min(1, e.clientWidth / n);
			G.current = null, ve({
				width: n,
				scale: r,
				height: e.clientHeight / r,
				left: Math.max(0, (e.clientWidth - n * r) / 2)
			});
		};
		e();
		let t = new ResizeObserver(e);
		return t.observe(M.current), () => t.disconnect();
	}, [re, le]), k(() => {
		requestAnimationFrame(ot);
	}, [
		E,
		D,
		ne,
		B,
		P
	]), Je.current = async () => {
		let t = qe.current;
		t.queued = !1, t.busy = !0;
		let r = Ke.current, i = Xe(), o = new AbortController();
		Ze.current = o;
		try {
			let { text: s, headers: l } = await ee("POST", a ? `/__preview/${a}` : "/__preview", {
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
			}, { signal: o.signal });
			if (!t.alive || o.signal.aborted || r !== Ke.current && i !== Xe()) return;
			let u = l.get("X-Cms-Editor-Document");
			if (!u) throw Error(C("The editor could not load its rendering context."));
			let d = new DOMParser().parseFromString(s, "text/html");
			if (!d.querySelector(`[data-cms-editor-root="${u}"]`)) throw Error(C("This template has no content outlet. Choose a template that includes the content field."));
			d.querySelectorAll("script").forEach((e) => {
				e.type === "importmap" && (e.dataset.cmsImportmap = ""), e.type = "text/cms-off", e.removeAttribute("src");
			}), I.current = u;
			let f = N.current?.contentDocument;
			f?.documentElement?.hasAttribute("data-cms-bridge-ready") ? (Qe.current.unmount(), Xt(f, d), f.documentElement.setAttribute("data-cms-bridge-ready", ""), ut(f), Qe.current.mount(f)) : N.current && (N.current.srcdoc = d.documentElement.outerHTML), r === Ke.current && he(null);
		} catch (e) {
			!o.signal.aborted && r === Ke.current && (he(e instanceof Error ? e.message : String(e)), R(!1));
		} finally {
			t.busy = !1, t.queued && Ye();
		}
	}, k(() => {
		Ke.current++, Ye();
	}, [
		a,
		e,
		n,
		c,
		T,
		x,
		m,
		ge
	]), k(() => (qe.current.alive = !0, qe.current.queued && Ye(), () => {
		qe.current.alive = !1, clearTimeout(qe.current.timer), qe.current.timer = 0, Ze.current?.abort();
	}), []);
	let ht = (e, t) => {
		let n = l(e, v);
		n.length && !S && nt(t.parentId, n.map((e) => e.type)) && (g.insert(t.parentId, t.index, n), hn(g, n[0], Sn(xn(g.get().nodes, v, () => !1))), Ue(null), st(null));
	}, gt = () => {
		if (q.current.readOnly || !nt(null)) return;
		let e = fn();
		g.insert(null, 0, [e]), g.focus(e.id, "start");
	}, _t = () => {
		let e = N.current?.contentDocument;
		return e ? He.current.filter(({ node: t }) => {
			let n = J(e, t.id);
			return !!n && e.defaultView.getComputedStyle(n).display !== "none";
		}).map(({ node: e }) => e.id) : [];
	}, vt = (e) => {
		if (!e) return;
		g.select(e, !0);
		let t = N.current?.contentDocument;
		(t && J(t, e))?.scrollIntoView({ block: "nearest" });
	}, yt = (e) => {
		let n = e.metaKey || e.ctrlKey, r = Re(g.get()), i = g.get().selected;
		if (e.key === "Escape") {
			g.select(null);
			return;
		}
		if (!i || !g.get().blockMode) return;
		let a = _t(), o = a.indexOf(g.get().head ?? i);
		if (["ArrowUp", "ArrowDown"].includes(e.key)) {
			e.preventDefault();
			let t = e.key === "ArrowUp";
			e.altKey ? g.nudgeSelection(t ? -1 : 1) : e.shiftKey ? g.extend(t ? -1 : 1) : vt(a[o + (t ? -1 : 1)]);
		} else if (e.key === "Enter") {
			e.preventDefault();
			let n = t(g.get().nodes, i), r = mt.current.stops(), a = n ? new Set(s([n]).map((e) => e.node.id)) : /* @__PURE__ */ new Set();
			r.some((e) => a.has(e.id)) ? hn(g, n, r) : q.current.onInspect(i);
		} else if (e.key === "Backspace" || e.key === "Delete") {
			e.preventDefault();
			let n = new Set(r.flatMap((e) => {
				let n = t(g.get().nodes, e);
				return n ? s([n]).map((e) => e.node.id) : [];
			})), i = a.findIndex((e) => n.has(e)), o = a.slice(0, Math.max(0, i)).reverse().find((e) => !n.has(e)) ?? a.slice(i + 1).find((e) => !n.has(e));
			g.removeSelection(), vt(o);
		} else n && e.key.toLowerCase() === "d" && (e.preventDefault(), g.duplicateSelection());
	}, bt = () => {
		let e = N.current?.contentDocument;
		if (!e || !I.current) return;
		if (!e.querySelector("[data-cms-editor-root]")) {
			R(!1), he(C("This template has no content outlet. Choose a template that includes the content field."));
			return;
		}
		e.documentElement.setAttribute("data-cms-bridge-ready", "");
		let n = e.createElement("style");
		n.dataset.cmsBridge = "", n.textContent = Wn, e.head.appendChild(n), F(e), ut(e), R(!1), Qe.current.unmount(), Qe.current.mount(e), e.addEventListener("submit", (e) => e.preventDefault(), !0), e.addEventListener("dragstart", (e) => e.preventDefault()), e.addEventListener("focusout", (e) => {
			e.target.isContentEditable && Ie(!1), Ye();
		}), e.addEventListener("focusin", (e) => {
			let t = e.target;
			if (!t.isContentEditable) return;
			Ie(!0);
			let n = t.closest("[data-cms-instance-node],[data-cms-document][data-cms-node]");
			g.select(n?.dataset.cmsInstanceNode ?? n?.dataset.cmsNode ?? null), g.hover(null);
		}), e.addEventListener("pointermove", (e) => {
			if (q.current.readOnly || (Be.current && (e.movementX || e.movementY) && (Be.current = !1, ze(!1)), g.hover($e(e.target)), Be.current || We.current)) return;
			let t = tt();
			st(t && kt(t.blocks, {
				x: e.clientX,
				y: e.clientY
			}, {
				rootRect: t.rootRect,
				canInsert: it()
			}));
		}), e.addEventListener("pointerdown", () => {
			Ue(null), st(null);
		}), e.addEventListener("click", (e) => {
			let t = e.target;
			if (t.closest("[contenteditable=\"true\"]")) {
				t.closest("a") && e.preventDefault();
				return;
			}
			e.preventDefault();
			let n = $e(t);
			n ? e.shiftKey && g.get().selected ? g.extendTo(n) : q.current.onInspect(n) : e.shiftKey || g.select(null);
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
			else if (!q.current.readOnly) {
				if (r && n.key.toLowerCase() === "z") {
					if (e.activeElement?.closest("[data-cms-entry-field]")) return;
					n.preventDefault();
					let r = e.activeElement, i = r?.closest("[data-cms-prop]"), a = r?.closest("[data-cms-instance-prop]"), o = i?.closest("[data-cms-node]");
					r?.blur(), n.shiftKey ? g.redo() : g.undo(), o?.dataset.cmsNode && i?.dataset.cmsProp && t(g.get().nodes, o.dataset.cmsNode) ? g.focus(o.dataset.cmsNode, "end", i.dataset.cmsProp, i.dataset.cmsIndex === void 0 ? void 0 : Number(i.dataset.cmsIndex)) : a?.dataset.cmsInstanceNode && t(g.get().nodes, a.dataset.cmsInstanceNode) && g.focus(a.dataset.cmsInstanceNode, "end", `values.${a.dataset.cmsInstanceProp}`);
				} else r && n.altKey && (n.code === "KeyT" || n.code === "KeyY") ? (n.preventDefault(), ct(n.code === "KeyT" ? "before" : "after")) : n.target.isContentEditable ? r || n.altKey || n.key.length !== 1 && ![
					"Backspace",
					"Delete",
					"Enter"
				].includes(n.key) || (Be.current = !0, ze(!0), st(null)) : yt(n);
			}
		});
		let r = (e) => g.get().blockMode && !!g.get().selected && !e.target.isContentEditable, i = (e, n) => {
			if (!r(e) || !e.clipboardData) return;
			let i = Re(g.get()).map((e) => t(g.get().nodes, e)).filter(Boolean);
			i.length && (e.preventDefault(), e.clipboardData.setData("text/plain", "cms-blocks:" + JSON.stringify(i)), n && !q.current.readOnly && g.removeSelection());
		};
		e.addEventListener("copy", (e) => i(e, !1)), e.addEventListener("cut", (e) => i(e, !0)), e.addEventListener("paste", (e) => {
			let t = e.clipboardData?.getData("text/plain") ?? "";
			if (!r(e) || q.current.readOnly || !t.startsWith("cms-blocks:")) return;
			e.preventDefault();
			let n;
			try {
				n = JSON.parse(t.slice(12)).map(u);
			} catch {
				return;
			}
			let i = g.get().nodes, a = o(i, Re(g.get()).at(-1), n.map((e) => e.type), v, y);
			a && n.length && (g.insert(a.parentId, a.index, n), g.select(n[0].id, !0), n.length > 1 && g.extendTo(n.at(-1).id));
		});
		let a = 0;
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
			De(() => {
				st(null), ot();
			}), clearTimeout(a), a = window.setTimeout(() => {
				G.current = null, ot();
			}, 150);
		}, { passive: !0 }), e.defaultView?.addEventListener("resize", () => {
			G.current = null, requestAnimationFrame(ot);
		}), e.querySelectorAll("img,link[rel=\"stylesheet\"]").forEach((e) => e.addEventListener("load", () => {
			G.current = null, requestAnimationFrame(ot);
		}, { once: !0 })), e.fonts.ready.then(() => {
			G.current = null, ot();
		});
	};
	k(() => ln.on("scroll-to", ({ node: e, top: t }) => {
		let n = N.current?.contentDocument, r = n && J(n, e);
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
			for (let t of D) {
				let n = J(e, t);
				for (; n;) n.dataset.cmsConditional === "hidden" && (n.dataset.cmsReveal = ""), n = n.parentElement;
			}
		}
	}, [D]);
	let xt = Zt({
		disabled: S,
		frame: N,
		scale: B.scale,
		invalidate: () => {
			G.current = null, ot();
		},
		target: (e, n) => {
			let r = tt();
			if (!r || e.x < r.rootRect.left || e.x > r.rootRect.left + r.rootRect.width || e.y < r.rootRect.top - 12 || e.y > r.rootRect.top + r.rootRect.height + 12) return null;
			let i = n.map((e) => t(g.get().nodes, e));
			if (i.some((e) => !e)) return null;
			let a = i.map((e) => e.type);
			return At(r.blocks, e, {
				rootRect: r.rootRect,
				maxDistance: Infinity,
				excludeIds: new Set(n),
				canInsert: (e) => nt(e, a)
			});
		},
		commit: (e, t) => g.moveTo(e, t.parentId, t.index)
	}), St = (e) => {
		let t = N.current?.contentDocument;
		if (!t) return !1;
		for (let n of [.25, .75]) for (let r = 0; r < 6; r++) if (Kn(t, (e.left + e.width * (r + .5) / 6 - B.left) / B.scale, (e.top + e.height * n) / B.scale)) return !0;
		return !1;
	}, Ct = ie(() => {
		let e = N.current.getBoundingClientRect();
		return {
			x: e.left,
			y: e.top,
			scale: B.scale
		};
	}, [B.scale]), wt = (e) => ({
		left: B.left + e.left * B.scale,
		top: e.top * B.scale,
		width: e.width * B.scale,
		height: e.height * B.scale
	});
	return /* @__PURE__ */ V(un.Provider, {
		value: ft,
		children: /* @__PURE__ */ H("div", {
			className: "flex h-full min-h-0 flex-col",
			"data-live-editor": !0,
			children: [
				pe && /* @__PURE__ */ V(fe, {
					compact: !0,
					message: pe,
					onRetry: () => z((e) => e + 1)
				}),
				/* @__PURE__ */ H("div", {
					ref: M,
					onPointerLeave: () => {
						g.hover(null), st(null);
					},
					onPointerMove: (e) => {
						e.target.closest("[data-cms-inserter]") || (st(null), g.hover(null));
					},
					className: "relative min-h-0 flex-1 overflow-hidden bg-sunken",
					children: [
						de && /* @__PURE__ */ V("div", {
							className: "absolute inset-0 z-drag grid place-items-center bg-bg",
							children: /* @__PURE__ */ V(me, {})
						}),
						/* @__PURE__ */ V("iframe", {
							ref: N,
							title: C("Live editor"),
							sandbox: "allow-same-origin",
							onLoad: bt,
							className: "absolute top-0 border-0 bg-white",
							style: {
								width: B.width,
								height: B.height,
								left: B.left,
								transformOrigin: "top left",
								transform: `scale(${B.scale})`
							}
						}),
						/* @__PURE__ */ H("div", {
							className: "pointer-events-none absolute inset-0 overflow-hidden",
							children: [
								!S && !xt.drag && !Fe && !Le && !K && ne && xe && !D.includes(ne) && /* @__PURE__ */ V("div", {
									"data-cms-hover": ne,
									className: "absolute z-raised border border-focus/50",
									style: wt(xe)
								}),
								!xt.drag && ye.map((e, t) => /* @__PURE__ */ V("div", {
									"data-cms-selection": !0,
									className: "absolute z-raised border-solid border-focus",
									style: {
										...wt(e),
										borderWidth: 1.5
									}
								}, t)),
								!S && !xt.drag && te && E && ye[0] && (() => {
									let e = r(T, D[0]), n = r(T, D.at(-1)), a = t(T, E);
									if (!e || !n || !a) return null;
									let o = i(T, e.parentId), s = (e) => ({
										label: Ne(e, v, w),
										icon: e.type === "component" ? "symbol" : v.get(e.type)?.icon ?? "square"
									}), c = e.parentId ? t(T, e.parentId) : null, { label: l, icon: u } = s(a);
									return /* @__PURE__ */ V(on, {
										id: E,
										label: D.length > 1 ? b(D.length, "{count} block", "{count} blocks") : l,
										icon: u,
										parent: c ? s(c) : null,
										box: wt(ye[0]),
										viewport: {
											width: B.width * B.scale + B.left * 2,
											height: B.height * B.scale
										},
										canMoveUp: e.index > 0,
										canMoveDown: n.index < o.length - 1,
										onSelectParent: () => c && d(c.id),
										onDrag: (e) => {
											Ue(null), xt.start(e, Re(g.get()), l);
										},
										onMove: (e) => g.nudgeSelection(e),
										onInsert: (e) => requestAnimationFrame(() => ct(e)),
										onDuplicate: () => g.duplicateSelection(),
										onDelete: () => g.removeSelection(),
										onMakeComponent: a.type !== "component" && _("entries.components.create") ? () => pt(g, f(g, v, y)) : void 0,
										covers: St
									});
								})(),
								!S && !xt.drag && we.filter((e) => e.inside).map((e) => {
									let n = {
										open: !!K && Un(K) === Un(e),
										onOpenChange: (t) => Ue(t ? e : null),
										returnFocus: lt,
										children: /* @__PURE__ */ V(Rt, {
											types: [...v.values()],
											allowed: (t) => nt(e.parentId, [t.name]),
											onChoose: (t) => ht(t, e),
											onClose: () => Ue(null)
										})
									};
									if (e.parentId === null) return T.length ? null : /* @__PURE__ */ V(rn, {
										target: e,
										position: wt,
										onWrite: nt(null) ? gt : void 0,
										...n
									}, "root");
									let r = e.hitRect.top;
									return t(T, e.parentId)?.children?.length || r + e.hitRect.height < 0 || r > B.height || !(n.open || ne === e.parentId || D.includes(e.parentId)) ? null : /* @__PURE__ */ V(nn, {
										target: e,
										position: wt,
										...n
									}, Un(e));
								}),
								!S && !xt.drag && (() => {
									let e = K && !K.inside ? K : !K && !Le ? Oe : null;
									return e ? /* @__PURE__ */ V(tn, {
										target: e,
										position: wt,
										open: K === e,
										onOpenChange: (t) => {
											Ue(t ? e : null), t || st(null);
										},
										returnFocus: lt,
										children: /* @__PURE__ */ V(Rt, {
											types: [...v.values()],
											allowed: (t) => nt(e.parentId, [t.name]),
											onChoose: (t) => ht(t, e),
											onClose: () => Ue(null)
										})
									}, Un(e)) : null;
								})(),
								xt.drag && /* @__PURE__ */ V(sn, {
									drag: xt.drag,
									position: wt
								})
							]
						})
					]
				}),
				P && /* @__PURE__ */ H(Te, { children: [
					/* @__PURE__ */ V(Yn, { slots: L }),
					h && /* @__PURE__ */ V($n, {
						doc: P,
						content: c,
						onChange: h,
						readOnly: S
					}),
					/* @__PURE__ */ V(at, {
						root: P,
						offset: Ct
					}),
					/* @__PURE__ */ V(Qn, {
						doc: P,
						frame: N.current,
						scale: B.scale
					})
				] })
			]
		})
	});
}
var Yn = O(function({ slots: e }) {
	let { store: n } = U(), r = W(n, (e) => e.nodes), i = new Set(e.filter((e) => !e.instance && e.prop === "items").map((e) => e.id)), a = /* @__PURE__ */ new Map();
	return /* @__PURE__ */ H(Te, { children: [e.filter((e) => e.instance || e.prop !== "items").map((e) => {
		let n = t(r, e.id);
		if (!n) return null;
		let i = `${e.instance ? "instance:" : ""}${e.id}:${e.prop}`, o = a.get(i) ?? 0;
		return a.set(i, o + 1), Ee(e.instance ? /* @__PURE__ */ V(Xn, {
			node: n,
			slot: e
		}) : [
			"text",
			"cite",
			"caption"
		].includes(e.prop) ? n.type === "paragraph" && e.prop === "text" ? /* @__PURE__ */ V(Bn, {
			node: n,
			prop: "text",
			tag: "span",
			placeholder: C("Write, or press “/” for blocks"),
			quiet: !0
		}) : /* @__PURE__ */ V(Bn, {
			node: n,
			prop: e.prop,
			tag: "span",
			placeholder: e.element.dataset.cmsPlaceholder ?? C("Write something…")
		}) : /* @__PURE__ */ V(Zn, {
			node: n,
			prop: e.prop
		}), e.element, `${i}:${o}`);
	}), [...i].map((n) => {
		let i = t(r, n);
		return i ? /* @__PURE__ */ V(Vn, {
			node: i,
			renderItem: (t, r) => {
				let i = e.find((e) => e.id === n && e.prop === "items" && e.index === t);
				return i ? Ee(r, i.element, `${n}:items:${t}`) : null;
			}
		}, n) : null;
	})] });
});
function Xn({ node: e, slot: n }) {
	let { store: r, readOnly: i } = U(), a = W(r, (t) => t.focus?.id === e.id && t.focus.prop === `values.${n.prop}` ? t.focus : null), o = String((Object.prototype.hasOwnProperty.call(e.props.values ?? {}, n.prop) ? e.props.values[n.prop] : n.instance.value) ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
	return /* @__PURE__ */ V(nt, {
		tag: "span",
		html: o,
		focus: a,
		plainText: !0,
		singleLine: n.instance.type === "text",
		disabled: i,
		placeholder: n.element.dataset.cmsPlaceholder ?? C("Write something…"),
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
function Zn({ node: e, prop: t }) {
	let { store: n, readOnly: r } = U(), i = W(n, (n) => n.focus?.id === e.id && n.focus.prop === t ? n.focus : null), a = String(e.props[t] ?? ""), o = t === "code" ? a.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>") : a;
	return /* @__PURE__ */ V(nt, {
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
function Qn({ doc: e, frame: n, scale: i }) {
	let s = jn(), { store: c, types: u, allowed: d } = U(), [f, h] = j(null);
	if (se(() => {
		h(s ? Ze(e) : null);
	}, [s, e]), Nn(!!s, [document, e]), !s || !f || !t(c.get().nodes, s.id)) return null;
	let g = (e) => {
		let n = l(e, u), i = c.get().nodes, f = r(i, s.id);
		if (!f || !n.length) return;
		let h = f.parentId ? t(i, f.parentId) : null, g = n.every((e) => p(h, e.type, u, h ? [] : d)) ? f : o(i, s.id, n.map((e) => e.type), u, d);
		g && (An(null), c.commit(m(a(i, s.id), g.parentId, g.index, n)), hn(c, n[0], Sn(xn(c.get().nodes, u, () => !1))));
	}, _ = n.getBoundingClientRect(), { maxHeight: v, ...y } = Mn({
		left: _.left + f.left * i,
		top: _.top + f.top * i,
		bottom: _.top + f.bottom * i
	});
	return Ee(/* @__PURE__ */ V("div", {
		"data-cms-slash": !0,
		className: "cms-pop fixed z-overlay overflow-hidden !p-0",
		style: y,
		children: /* @__PURE__ */ V(dt, {
			types: [...u.values()],
			query: s.query,
			showSearch: !1,
			compact: !0,
			style: { maxHeight: v },
			chooseFirst: s.enter,
			keyboardDocument: e,
			onChoose: g,
			onClose: () => An(null),
			onNoMatch: () => {
				An(null);
			},
			allowed: (e) => !!o(c.get().nodes, s.id, e.name, u, d)
		})
	}), document.body);
}
function $n({ doc: e, content: t, onChange: n, readOnly: r }) {
	let i = [...e.querySelectorAll("[data-cms-entry-field=\"title\"]")];
	return /* @__PURE__ */ V(Te, { children: i.map((i, a) => {
		let o = t.title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
		return Ee(/* @__PURE__ */ V(nt, {
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
var er = "w-[88px]", tr = "cms.inspector.collapsed";
function nr() {
	try {
		let e = JSON.parse(localStorage.getItem(tr) ?? "{}");
		return e && typeof e == "object" && !Array.isArray(e) ? Object.fromEntries(Object.entries(e).filter(([, e]) => typeof e == "boolean")) : {};
	} catch {
		return {};
	}
}
function rr({ title: e, children: t, open: n = !0, actions: r, empty: i, fields: a }) {
	let [o, s] = j(() => nr()[e] === void 0 ? n : !nr()[e]), c = (t) => {
		s(t);
		try {
			localStorage.setItem(tr, JSON.stringify({
				...nr(),
				[e]: !t
			}));
		} catch {}
	};
	return /* @__PURE__ */ H("section", {
		"data-section": e,
		className: "min-w-0 border-b border-border last:border-b-0",
		children: [/* @__PURE__ */ H("header", {
			className: "group/section flex h-10 items-center gap-1 pl-4 pr-3",
			children: [/* @__PURE__ */ H(M, {
				variant: "ghost",
				onClick: () => c(!o),
				"aria-expanded": o,
				className: z("!h-full min-w-0 flex-1 shrink !justify-start !gap-1 !rounded-none !bg-transparent !px-0 text-left !text-xs !font-semibold focus-visible:!-outline-offset-2", i ? "!text-muted" : "!text-ink"),
				children: [/* @__PURE__ */ V("span", {
					className: "min-w-0 truncate",
					children: e
				}), /* @__PURE__ */ V(F, {
					name: "chevron-down",
					size: 10,
					className: z("shrink-0 text-faint transition-[rotate,opacity] duration-fast", o ? "opacity-0 group-hover/section:opacity-100 group-focus-within/section:opacity-100" : "-rotate-90")
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
				children: C("None")
			}) : t
		})]
	});
}
function ir({ children: e, className: t }) {
	return /* @__PURE__ */ V("div", {
		"data-section": "content",
		className: z("space-y-1 border-b border-border px-4 py-3 last:border-b-0", t),
		children: e
	});
}
function ar({ title: e, action: t }) {
	return /* @__PURE__ */ H("div", {
		className: "flex h-7 items-center justify-between pt-1",
		children: [/* @__PURE__ */ V("span", {
			className: "text-xs text-muted",
			children: e
		}), t]
	});
}
function or({ field: e, children: t, htmlFor: n, className: r }) {
	let i = e.status, a = e.reset, o = t ?? e.label, s = z("flex min-h-7 min-w-0 shrink-0 items-center gap-1 text-left text-xs", er, i === "own" ? "text-ink" : "text-muted", r), c = /* @__PURE__ */ V("span", {
		className: "min-w-0 py-1 leading-[1.25] [overflow-wrap:anywhere]",
		children: o
	});
	return i === "own" && a ? /* @__PURE__ */ V(ge, {
		content: C("Reset {label}", { label: String(e.label ?? "") }),
		children: /* @__PURE__ */ V(M, {
			variant: "ghost",
			onClick: a,
			className: z(s, "!h-auto !justify-start !gap-1 !whitespace-normal !rounded-xs !bg-transparent !px-0 !text-xs !font-normal !text-ink decoration-faint decoration-dotted underline-offset-[3px] hover:underline"),
			children: c
		})
	}) : i === "inherited" ? /* @__PURE__ */ H("label", {
		htmlFor: n,
		className: s,
		title: C("Inherited from a larger screen, another state or the component"),
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
function sr(e) {
	if (e.stack === !0 || we.includes(e.type) && !e.component) return !0;
	if (e.type !== "select" || e.component || e.display !== "segmented") return !1;
	let t = Object.values(e.options ?? {}).map((e) => typeof e == "string" ? e : e && typeof e == "object" && "label" in e ? String(e.label ?? "") : "").filter(Boolean);
	return t.length > 3 || t.join(" ").length > 20;
}
var cr = (e) => e === "xs" || e === void 0 ? "sm" : e;
function Y({ fields: e, values: t, onChange: n, disabled: r, context: i = {}, className: a, bare: o }) {
	le(x.fields.subscribe, x.fields.version);
	let s = E();
	return /* @__PURE__ */ V("div", {
		className: z("min-w-0", a ?? "space-y-1"),
		children: e.filter((e) => ye(e, t)).map((e) => {
			let a = s?.fieldTypes.find((t) => t.key === e.type), c = x.fields.get(e.component ?? a?.component ?? e.type) ?? x.fields.get("json");
			if (!c) return null;
			let l = {
				...e,
				size: cr(e.size),
				fit: !0,
				id: ve(e, i.path)
			}, u = !o && sr(e), d = /* @__PURE__ */ V(c, {
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
				className: z("flex min-w-0", u ? "flex-col items-stretch" : "min-h-7 items-center gap-2", e.className),
				children: [!o && e.type !== "toggle" && /* @__PURE__ */ V(or, {
					field: l,
					htmlFor: l.id,
					className: u ? "!w-auto" : void 0
				}), /* @__PURE__ */ V("div", {
					className: z("flex min-w-0 items-center", !u && "flex-1"),
					children: d
				})]
			}, e.handle);
		})
	});
}
var lr = "cms-input h-7 w-full min-w-0 rounded-sm px-2 text-sm placeholder:text-ghost";
function ur(e) {
	return Array.isArray(e) ? String(e[0]) : e && typeof e == "object" && "min" in e ? `${e.min}–${e.max}` : String(e);
}
function dr({ color: e, dark: t, className: n }) {
	return /* @__PURE__ */ H("span", {
		className: z("relative inline-block size-4 shrink-0 overflow-hidden rounded-xs align-middle cms-checkerboard [--checker:6px]", n),
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
var fr = re(function({ className: e, children: t, ...n }, r) {
	return /* @__PURE__ */ V(M, {
		ref: r,
		variant: "ghost",
		icon: "plus",
		className: z("w-full !justify-start !gap-1.5 !px-1.5 !text-xs !font-normal !text-muted hover:!text-ink", e),
		...n,
		children: t
	});
});
function pr({ onClick: e, label: t = C("Add") }) {
	return /* @__PURE__ */ V(ge, {
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
function mr({ onClick: e, label: t = C("Remove") }) {
	return /* @__PURE__ */ V(ge, {
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
// admin/src/builder/fields/tokens.tsx
function hr() {
	let { byPath: e } = Pe();
	return (t) => {
		if (typeof t != "string" || !t.startsWith("token:")) return null;
		let [n, r] = t.slice(6).split("/"), i = e.get(n);
		return i ? {
			token: i,
			alpha: r
		} : null;
	};
}
function gr(e) {
	let { byPath: t } = Pe();
	return (n) => {
		let r = n.trim().replace(/^\$/, "").replace(/^token:/, "");
		return t.has(r) ? `token:${r}` : e && t.has(`${e}.${r}`) && /^[a-z0-9-]+$/i.test(r) && !/^-?\d*\.?\d+$/.test(r) ? `token:${e}.${r}` : null;
	};
}
var _r = (e) => ur(e.value);
function vr({ token: e, alpha: t, className: n }) {
	return /* @__PURE__ */ H("span", {
		className: z("inline-flex min-w-0 items-center gap-1 truncate rounded-xs bg-active px-1.5 leading-5 text-ink", n),
		title: `${e.path} · ${_r(e)}`,
		children: [/* @__PURE__ */ V("span", {
			className: "truncate",
			children: e.group === "color" ? e.name : e.path
		}), t && /* @__PURE__ */ H("span", {
			className: "text-muted",
			children: ["/", t]
		})]
	});
}
function yr({ group: e, value: t, onPick: n, detach: r }) {
	let { byGroup: i } = Pe(), a = i.get(e) ?? [], o = typeof t == "string" && t.startsWith("token:") ? t.slice(6).split("/")[0] : null;
	return a.length ? /* @__PURE__ */ H("div", { children: [
		/* @__PURE__ */ V("p", {
			className: "cms-label m-0 px-2 pb-1 pt-1.5 !text-2xs",
			children: C("Tokens")
		}),
		/* @__PURE__ */ V("div", {
			className: "max-h-60 overflow-y-auto",
			children: a.map((t) => /* @__PURE__ */ H(R, {
				compact: !0,
				onClick: () => n(`token:${t.path}`),
				className: z("flex h-7 w-full items-center gap-2 rounded-xs px-2 text-left text-xs hover:bg-hover", o === t.path && "bg-active"),
				children: [
					e === "color" && /* @__PURE__ */ V(dr, {
						color: String(t.value),
						dark: t.dark ? String(t.dark) : void 0
					}),
					e === "shadow" && /* @__PURE__ */ V("span", {
						className: "size-3.5 shrink-0 rounded-xs bg-bg",
						style: { boxShadow: String(t.value) }
					}),
					e === "radius" && /* @__PURE__ */ V("span", {
						className: "size-3.5 shrink-0 border-l-[1.5px] border-t-[1.5px] border-muted",
						style: { borderTopLeftRadius: String(t.value) }
					}),
					/* @__PURE__ */ V("span", {
						className: "min-w-0 truncate font-mono text-2xs",
						children: t.path
					}),
					/* @__PURE__ */ V("span", {
						className: "ml-auto max-w-[45%] shrink-0 truncate font-mono text-2xs text-faint",
						children: _r(t)
					}),
					o === t.path && /* @__PURE__ */ V(F, {
						name: "check",
						size: 12,
						className: "shrink-0 text-focus"
					})
				]
			}, t.path))
		}),
		o && r && /* @__PURE__ */ H(R, {
			compact: !0,
			onClick: r,
			className: "mt-1 flex h-7 w-full items-center gap-2 rounded-xs border-t border-border px-2 text-xs text-muted hover:bg-hover hover:text-text",
			children: [/* @__PURE__ */ V(F, {
				name: "unlink",
				size: 12
			}), C("Detach Token")]
		})
	] }) : /* @__PURE__ */ V("p", {
		className: "m-0 px-2 py-2 text-2xs text-faint",
		children: C("No {group} tokens in the design system.", { group: e })
	});
}
function br({ group: e, value: t, onPick: n, active: r, className: i, trigger: a }) {
	let [o, s] = j(!1), { byGroup: c, byPath: l } = Pe();
	if (!(c.get(e) ?? []).length) return null;
	let u = (e) => {
		n(e), s(!1);
	};
	return /* @__PURE__ */ V(de, {
		open: o,
		onOpenChange: s,
		align: "end",
		className: "w-60 !p-1",
		trigger: a ?? /* @__PURE__ */ V(R, {
			compact: !0,
			className: z("grid size-5 shrink-0 place-items-center rounded-xs text-faint transition-opacity hover:bg-hover hover:text-ink", !r && !o && "opacity-0 group-hover/value:opacity-100 group-focus-within/value:opacity-100", (r || o) && "text-ink", i),
			"aria-label": C("Design Tokens"),
			title: C("Design Tokens"),
			children: /* @__PURE__ */ V(F, {
				name: "symbol",
				size: 10
			})
		}),
		children: /* @__PURE__ */ V(yr, {
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
function xr(e, t) {
	let n = (e) => Object.entries(e).every(([e, n]) => Array.isArray(n) ? n.includes(t[e]) : t[e] === n), r = e.if, i = e.unless;
	return (!r || n(r)) && !(i && Object.entries(i).every(([e, n]) => Array.isArray(n) ? n.includes(t[e] ?? null) : (t[e] ?? null) === n));
}
function Sr({ field: e, ...t }) {
	let n = x.fields.get(e.component ?? e.type) ?? x.fields.get("json");
	return n ? /* @__PURE__ */ V("div", {
		className: z("min-w-0 flex-1", e.className),
		children: /* @__PURE__ */ V(n, {
			field: e,
			...t,
			context: t.context ?? {}
		})
	}) : null;
}
function Cr({ className: e, children: t }) {
	return /* @__PURE__ */ V("div", {
		className: z("relative flex min-w-0 flex-1 items-center gap-1", e),
		children: t
	});
}
var wr = /^(-?\d*\.?\d+)([a-z%]*)$/i, Tr = {
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
}, Er = (e, t, n) => Math.min(n ?? Infinity, Math.max(t ?? -Infinity, e)), Dr = (e) => Math.round(e * 1e3) / 1e3;
function Or(e) {
	return e.field.percent ? /* @__PURE__ */ V(kr, { ...e }) : /* @__PURE__ */ V(Nr, { ...e });
}
function kr({ field: e, value: t, onChange: n, ...r }) {
	let i = t == null || t === "" ? null : Number(t), a = (e) => typeof e == "number" ? Math.round(e * 100) : void 0, o = e.slider;
	return /* @__PURE__ */ V(Nr, {
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
function Ar(e, t) {
	let [n, r] = j(!1), i = t(e);
	return k(() => {
		if (i) return r(!1);
		let e = window.setTimeout(() => r(!0), 700);
		return () => window.clearTimeout(e);
	}, [e, i]), {
		shown: n && !i,
		show: () => r(!0)
	};
}
var jr = {
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
function Mr(e, t, n) {
	if (typeof CSS > "u") return !0;
	let r = e.replace(/token:[a-z]+\.[a-z0-9-]+(\/\d{1,3})?/g, "var(--token)"), i = t.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`);
	return /^-?[a-z]+(-[a-z]+)*$/.test(i) && CSS.supports(i, "inherit") ? CSS.supports(i, r) : (jr[n] ?? jr.length).some((e) => CSS.supports(e, r));
}
function Nr({ field: e, value: t, onChange: n, disabled: r, context: i }) {
	let a = hr(), o = gr(e.group), [s, c] = j(null), [l, u] = j(null), d = A(null), f = A(null), [p, m] = j(0);
	se(() => {
		let e = f.current ? f.current.offsetWidth + 4 : 0;
		e !== p && m(e);
	});
	let h = t == null || t === "" ? void 0 : String(t), g = e.unit ?? "px", _ = e.step ?? 1, v = e.min, y = e.max, b = e.group, x = e.prefixIcon ? /* @__PURE__ */ V(F, {
		name: e.prefixIcon,
		size: 13
	}) : e.prefix, ee = e.slider, S = e.menu, w = e.action, T = e.keywords ?? [], E = a(h), D = h?.match(wr), te = D ? D[2] || g : h ? "" : l ?? g, ne = g ? e.units ?? Tr[g] ?? [g] : [], re = !h || !!D, O = (e, t = te) => n(`${Dr(Er(e, v, y))}${t}`), ie = (e) => {
		re && O((D ? parseFloat(D[1]) : 0) + e);
	}, ae = (e, t) => {
		if (r || e.button !== 0 || document.activeElement === e.currentTarget || !re) return;
		e.preventDefault();
		let n = e.clientX, i = D ? parseFloat(D[1]) : 0, a = !1, o = (e) => {
			let t = e.clientX - n;
			!a && Math.abs(t) < 3 || (a = !0, document.body.style.cursor = "ew-resize", O(i + Math.round(t / 2) * _ * (e.shiftKey ? 10 : e.altKey ? .1 : 1)));
		}, s = () => {
			window.removeEventListener("pointermove", o), window.removeEventListener("pointerup", s), document.body.style.cursor = "", !a && t && d.current?.focus();
		};
		window.addEventListener("pointermove", o), window.addEventListener("pointerup", s);
	}, k = (t) => t === "" ? null : o(t) || (/^-?\d*\.?\d+$/.test(t) ? te ? `${t}${te}` : t : T.includes(t) || Mr(t, e.property ?? e.handle, g) ? t : void 0), oe = Ar(s ?? "", (e) => s === null || k(e.trim()) !== void 0), ce = () => {
		if (s === null) return;
		let e = s.trim();
		if (c(null), e === (D ? D[1] : h ?? "")) return;
		let t = k(e);
		t !== void 0 && n(t);
	}, le = (e) => {
		D ? n(`${D[1]}${e}`) : h || u(e);
	};
	return /* @__PURE__ */ H(Cr, { children: [
		ee && /* @__PURE__ */ V(Sr, {
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
			value: D ? parseFloat(D[1]) : null,
			onChange: (e) => n(e),
			disabled: r,
			context: i
		}),
		/* @__PURE__ */ H("div", {
			className: z("group/value relative flex h-7 min-w-0 flex-1 items-center", ee && "!w-16 !flex-none"),
			title: e.title,
			children: [
				x !== void 0 && /* @__PURE__ */ V("span", {
					onPointerDown: (e) => ae(e, !0),
					className: "absolute left-0 z-raised grid h-7 w-6 cursor-ew-resize select-none place-items-center text-xs text-faint hover:text-ink",
					children: x
				}),
				E && s === null ? /* @__PURE__ */ V(br, {
					group: b ?? E.token.group,
					value: h,
					onPick: n,
					trigger: /* @__PURE__ */ V(R, {
						compact: !0,
						onDoubleClick: () => c(h ?? ""),
						className: z(lr, "flex items-center pr-1 text-left", x !== void 0 && "!pl-6"),
						children: /* @__PURE__ */ V(vr, {
							token: E.token,
							alpha: E.alpha,
							className: "text-xs"
						})
					})
				}) : /* @__PURE__ */ V("input", {
					ref: d,
					id: ve(e),
					value: s ?? (D ? D[1] : h ?? ""),
					placeholder: e.placeholder,
					disabled: r,
					autoComplete: "off",
					spellCheck: !1,
					onPointerDown: (e) => ae(e, !0),
					onChange: (e) => c(e.target.value),
					onFocus: (e) => e.target.select(),
					onBlur: ce,
					"aria-invalid": oe.shown || void 0,
					onKeyDown: (e) => {
						e.key === "Enter" && (s !== null && k(s.trim()) === void 0 ? oe.show() : e.target.blur()), e.key === "Escape" && (c(null), requestAnimationFrame(() => d.current?.blur())), (e.key === "ArrowUp" || e.key === "ArrowDown") && re && (e.preventDefault(), c(null), ie((e.key === "ArrowUp" ? 1 : -1) * _ * (e.shiftKey ? 10 : e.altKey ? .1 : 1)));
					},
					className: z(lr, "tabular-nums", re && !r && "cursor-ew-resize focus:cursor-text", x !== void 0 && "!pl-6"),
					style: { paddingRight: p + 6 }
				}),
				(!E || s !== null) && /* @__PURE__ */ H("div", {
					ref: f,
					className: "pointer-events-none absolute inset-y-0 right-1 flex items-center",
					children: [
						b && /* @__PURE__ */ V(br, {
							group: b,
							value: h,
							onPick: n,
							className: "pointer-events-auto"
						}),
						te && ne.length > 0 && /* @__PURE__ */ V(L, {
							align: "end",
							trigger: /* @__PURE__ */ V(R, {
								compact: !0,
								disabled: r,
								className: z("pointer-events-auto h-5 min-w-5 rounded-xs px-1 text-2xs text-faint hover:bg-hover hover:text-ink data-[popup-open]:opacity-100"),
								"aria-label": C("Unit"),
								children: te
							}),
							items: [...ne.map((e) => ({
								label: e,
								checked: e === te,
								onSelect: () => le(e)
							})), ...T.length ? [{
								separator: !0,
								label: ""
							}, ...T.map((e) => ({
								label: e,
								checked: h === e,
								onSelect: () => n(e)
							}))] : []]
						}),
						!te && g && T.length > 0 && h && T.includes(h) && /* @__PURE__ */ V(L, {
							align: "end",
							trigger: /* @__PURE__ */ V(R, {
								compact: !0,
								className: "pointer-events-auto grid size-5 place-items-center rounded-xs text-faint hover:bg-hover hover:text-ink",
								"aria-label": C("Unit"),
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
		S && /* @__PURE__ */ V(L, {
			align: "end",
			trigger: /* @__PURE__ */ H(R, {
				compact: !0,
				className: "flex h-7 shrink-0 items-center gap-0.5 rounded-sm px-1.5 text-xs text-muted hover:bg-hover hover:text-ink",
				children: [S.label, /* @__PURE__ */ V(F, {
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
		w && /* @__PURE__ */ V(R, {
			compact: !0,
			onClick: () => n(w.value),
			className: "grid size-7 shrink-0 place-items-center rounded-sm text-muted hover:bg-hover hover:text-ink",
			title: w.label,
			"aria-label": w.label,
			children: /* @__PURE__ */ V(F, {
				name: w.icon,
				size: 14
			})
		})
	] });
}
// admin/src/builder/fields/composite.tsx
var Pr = {
	2: "grid grid-cols-2",
	3: "grid grid-cols-3",
	4: "grid grid-cols-4"
};
function Fr({ field: e, value: t, onChange: n, disabled: r, context: i }) {
	let a = t ?? {}, o = e.link, [s, c] = j(!o || e.split === !0), l = (s ? e.fields ?? [] : [o]).filter((e) => xr(e, a)), u = s ? Pr[e.columns] : void 0;
	return /* @__PURE__ */ H(Cr, { children: [/* @__PURE__ */ V("div", {
		className: z("min-w-0 flex-1 gap-1", u ?? "flex items-center"),
		children: l.map((e) => /* @__PURE__ */ V(Sr, {
			field: e,
			value: a[e.handle] ?? e.default ?? null,
			onChange: (t) => n({
				...a,
				[e.handle]: t
			}),
			disabled: r,
			context: i
		}, e.handle))
	}), o && /* @__PURE__ */ V(R, {
		compact: !0,
		onClick: () => c(!s),
		className: "grid size-7 shrink-0 place-items-center rounded-sm text-muted hover:bg-hover hover:text-ink",
		title: s ? e.joinLabel ?? C("The same for all") : e.splitLabel ?? C("Each One"),
		children: /* @__PURE__ */ V(F, {
			name: s ? "square" : "radius",
			size: 14
		})
	})] });
}
function Ir({ field: e, value: t, onChange: n, disabled: r, context: i }) {
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
				}) : /* @__PURE__ */ V(Sr, {
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
				typeof e.join == "string" && /* @__PURE__ */ V("span", {
					className: "text-xs text-faint",
					children: e.join
				}),
				/* @__PURE__ */ V(Sr, {
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
				/* @__PURE__ */ V(mr, { onClick: () => n(Object.fromEntries(Object.entries(a).filter(([e]) => e !== t))) })
			]
		}, t))
	});
}
function Lr(e, t) {
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
var Rr = () => [
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
], zr = () => [
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
function Br(t) {
	let { store: n, doc: r, catalog: i } = U(), a = T(), o = W(n, (n) => e(n.nodes, t.id)), s = w("entries/get", { id: r?.id ?? "" }, {
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
	if (r?.kind === "component") for (let e of r.props ?? []) u.push({
		path: `props.${e.handle}`,
		label: e.label ?? e.handle,
		group: C("Component Properties")
	});
	u.push(...Rr());
	for (let e of l.data?.fields ?? []) e.type !== "blocks" && u.push({
		path: `entry.${e.handle}${e.type === "date" ? "|date:F j, Y" : ""}`,
		label: e.label,
		group: C("Page Fields")
	});
	u.push(...zr());
	for (let e of a.globals) u.push({
		path: `globals.${e.handle}.`,
		label: C("{name} (add a field handle)", { name: e.title }),
		group: C("Global Sets")
	});
	return u;
}
// admin/src/builder/content/ContentPanel.tsx
var Vr = [
	"text",
	"textarea",
	"richtext",
	"markdown"
], Hr = (e, t) => !e.if || Object.entries(e.if).every(([e, n]) => {
	let r = t[e] ?? null;
	return Array.isArray(n) ? n.includes(r) : r === n;
});
function Ur({ field: e, value: t, bound: n, paths: r, onValue: i, onBind: a, extra: o }) {
	let s = e.type === "richtext" && e.inline && e.handle !== "text" && !e.component ? {
		...e,
		component: "blocks-inline-text"
	} : e, c = !n && we.includes(s.type) && !s.component, l = !n && sr(s), u = !n && s.type === "toggle", d = n ? {
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
	}, f = { [s.handle]: n ?? t }, p = (e, t) => n ? a(t) : i(t), m = c ? /* @__PURE__ */ V(P, {
		bare: !0,
		fields: [d],
		values: f,
		onChange: p,
		className: "min-w-0"
	}) : /* @__PURE__ */ V(Y, {
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
	let h = /* @__PURE__ */ V(ge, {
		content: C(n ? "Disconnect from Data" : "Connect to Data"),
		children: /* @__PURE__ */ V(I, {
			icon: "database",
			size: "xs",
			label: C(n ? "Disconnect from Data" : "Connect to Data"),
			title: void 0,
			onClick: () => a(n ? null : r[0]?.path ?? "entry.title"),
			className: z("overflow-hidden", n ? "!text-ink" : "!w-0 !text-faint hover:!text-ink focus-visible:!w-6 group-hover/prop:!w-6 [@media(hover:none)]:!w-6")
		})
	}), g = /* @__PURE__ */ H("span", {
		className: z("flex h-7 min-w-0 shrink-0 items-center gap-0.5", !l && "w-[88px]"),
		children: [/* @__PURE__ */ V("label", {
			htmlFor: ve(s),
			className: z("min-w-0 flex-1 truncate text-xs", n ? "text-ink" : "text-muted"),
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
function Wr({ node: e }) {
	let { store: t, types: n } = U(), r = n.get(e.type), i = Br(e), a = tt().filter((t) => t.id !== (e.anchor ?? e.props?.anchor)), o = e.bind ?? {}, s = {
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
	].includes(e.handle))), d = u.some((e) => e.component === "link") && u.some((e) => e.handle === "new_tab"), f = u.filter((e) => !(d && e.handle === "new_tab") && Hr(e, s)), p = f.filter((e) => !e.advanced), m = f.filter((e) => e.advanced), h = (t) => /* @__PURE__ */ V(Ur, {
		field: t,
		value: e.props?.[t.handle],
		bound: o[t.handle],
		paths: i,
		onValue: (e) => l(t.handle, e),
		onBind: (e) => c(t.handle, e),
		extra: v(t)
	}, t.handle), g = e.type === "repeat", v = (t) => t.component === "link" || t.type === "url" ? {
		anchors: a,
		...d ? {
			newTab: !!e.props?.new_tab,
			onNewTab: (e) => l("new_tab", e || void 0)
		} : {}
	} : void 0;
	return /* @__PURE__ */ H("div", { children: [
		e.type === "component" ? /* @__PURE__ */ V(Gr, {
			node: e,
			paths: i,
			setBind: c,
			anchors: a
		}) : g ? /* @__PURE__ */ V(Kr, { node: e }) : p.length > 0 && /* @__PURE__ */ V(ir, { children: p.map(h) }),
		/* @__PURE__ */ V(rr, {
			title: C("Visibility"),
			open: !!(o.visible || o.hidden || e.hidden),
			empty: !o.visible && !o.hidden && !e.hidden,
			children: /* @__PURE__ */ V(Y, {
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
						reset: () => c("visible", null)
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
		/* @__PURE__ */ H(rr, {
			title: C("Advanced"),
			open: !1,
			empty: !e.anchor && !e.attrs && !e.class && !e.persist && !m.some((t) => e.props?.[t.handle] !== void 0 && e.props?.[t.handle] !== t.default),
			children: [
				g ? /* @__PURE__ */ V(qr, { node: e }) : m.map(h),
				/* @__PURE__ */ V(Y, {
					fields: [
						{
							handle: "label",
							type: "text",
							size: "sm",
							commit: "blur",
							label: C("Layer Name"),
							placeholder: r?.title
						},
						...m.some((e) => e.handle === "anchor") && !e.anchor ? [] : [{
							handle: "anchor",
							type: "text",
							size: "sm",
							commit: "blur",
							label: C("Anchor"),
							placeholder: C("None"),
							mono: !0
						}],
						{
							handle: "class",
							type: "text",
							size: "sm",
							commit: "blur",
							label: C("Classes"),
							placeholder: C("None"),
							mono: !0
						},
						..._("site.code") ? [{
							handle: "persist",
							type: "text",
							size: "sm",
							commit: "blur",
							label: C("Persist As"),
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
				/* @__PURE__ */ V(ar, {
					title: C("Attributes"),
					action: /* @__PURE__ */ V(pr, {
						label: C("Add Attribute"),
						onClick: () => t.updateNode(e.id, { attrs: {
							...e.attrs ?? {},
							"aria-label": ""
						} })
					})
				}),
				/* @__PURE__ */ V(Y, {
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
						let i = e.attrs ?? {}, a = Lr(Object.fromEntries(Object.entries(i).map(([e, t]) => [e, o[`attr:${e}`] ?? t])), r);
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
				/* @__PURE__ */ V(ar, {
					title: C("States from Data"),
					action: /* @__PURE__ */ V(pr, {
						label: C("Add State from Data"),
						onClick: () => c("state:active", i[0]?.path ?? "item.active")
					})
				}),
				/* @__PURE__ */ V(Y, {
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
				})
			]
		})
	] });
}
function Gr({ node: e, paths: t, setBind: n, anchors: i }) {
	let { store: o } = U(), s = w("components/list", { working: !0 }, { staleTime: 3e4 }), c = s.data?.find((t) => t.handle === e.props?.ref), l = e.props?.values ?? {}, d = e.bind ?? {};
	return /* @__PURE__ */ H(ir, { children: [
		/* @__PURE__ */ V(Y, {
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
			onChange: (t, n) => n && o.updateProps(e.id, {
				ref: n,
				values: {}
			})
		}),
		(c?.props ?? []).map((r) => /* @__PURE__ */ V(Ur, {
			field: {
				...r,
				placeholder: r.placeholder ?? (Vr.includes(r.type) ? r.label : void 0)
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
			children: [c?.id && /* @__PURE__ */ V(M, {
				size: "sm",
				variant: "ghost",
				icon: "edit",
				onClick: () => y(`/content/components/${c.id}`),
				children: C("Edit Component")
			}), /* @__PURE__ */ V(M, {
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
				children: C("Detach")
			})]
		})
	] });
}
function Kr({ node: e }) {
	let { store: t, catalog: n } = U(), r = n.sources?.find((t) => t.name === e.props?.source), i = (n, r) => t.updateProps(e.id, { [n]: r }, `repeat:${e.id}:${n}`);
	return /* @__PURE__ */ H(ir, { children: [
		/* @__PURE__ */ V(Y, {
			fields: [{
				handle: "source",
				type: "select",
				size: "sm",
				label: C("List"),
				required: !0,
				options: (n.sources ?? []).map((e) => ({
					value: e.name,
					label: e.label
				}))
			}],
			values: { source: e.props?.source },
			onChange: (e, t) => t && i("source", t)
		}),
		/* @__PURE__ */ V(Y, {
			fields: (r?.fields ?? []).map((e) => ({
				...e,
				size: "sm",
				width: "full"
			})),
			values: Object.fromEntries((r?.fields ?? []).map((t) => [t.handle, e.props?.[t.handle]])),
			onChange: (e, t) => i(e, t)
		}),
		/* @__PURE__ */ V(Y, {
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
function qr({ node: e }) {
	let { store: t } = U(), n = (n, r) => t.updateProps(e.id, { [n]: r }, `repeat:${e.id}:${n}`);
	return /* @__PURE__ */ V(Y, {
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
function Jr(e) {
	let { store: t } = U(), n = W(t, (e) => e.breakpoint), r = W(t, (e) => e.state), i = Ie(n, r), a = Le(n, r), o = e.style ?? {}, s = (e) => {
		for (let t of a) {
			let n = o[t];
			if (n && n[e] !== void 0) return {
				value: String(n[e]),
				from: t
			};
		}
		return {
			value: void 0,
			from: null
		};
	}, c = (e) => s(e).value, l = (e) => {
		let { from: t } = s(e);
		return t === i ? "own" : t ? "inherited" : "none";
	}, u = (n, r) => {
		let a = { ...o[i] ?? {} };
		for (let [e, t] of Object.entries(n)) t == null || t === "" ? delete a[e] : a[e] = t;
		let s = {
			...o,
			[i]: a
		};
		Object.keys(a).length === 0 && delete s[i], t.updateNode(e.id, { style: Object.keys(s).length ? s : void 0 }, r ?? `style:${e.id}:${Object.keys(n).join(",")}`);
	};
	return {
		variant: i,
		breakpoint: n,
		state: r,
		style: o,
		value: c,
		status: l,
		set: (e, t) => u({ [e]: t }),
		write: u,
		own: () => Object.keys(o[i] ?? {})
	};
}
// admin/src/builder/css.ts
function Yr(e) {
	let t = [], n = 0, r = "";
	for (let i of e.trim()) i === "(" && n++, i === ")" && n--, /\s/.test(i) && n === 0 ? (r && t.push(r), r = "") : r += i;
	return r && t.push(r), t;
}
function Xr(e) {
	let t = [], n = 0, r = "";
	for (let i of e) i === "(" && n++, i === ")" && n--, i === "," && n === 0 ? (t.push(r.trim()), r = "") : r += i;
	return r.trim() && t.push(r.trim()), t;
}
function Zr(e) {
	if (e === void 0 || e === "") return null;
	let t = Yr(String(e));
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
function X({ s: e, fields: t, bare: n }) {
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
	return /* @__PURE__ */ V(Y, {
		bare: n,
		fields: a,
		values: i,
		onChange: (t, n) => {
			let a = r.find((e) => e.handle === t);
			if (a.set) return a.set(n);
			if (!n || typeof n != "object") return e.set(t, n);
			let o = $r(i[t] ?? {}, n);
			Object.keys(o).length && e.write(o);
		}
	});
}
var Qr = (e) => e === "none" ? void 0 : e;
function $r(e, t) {
	return Object.fromEntries(Object.entries(t ?? {}).filter(([t, n]) => n !== e[t]));
}
// admin/src/builder/design/Border.tsx
var ei = [
	"borderTopLeftRadius",
	"borderTopRightRadius",
	"borderBottomRightRadius",
	"borderBottomLeftRadius"
], ti = [
	"borderTop",
	"borderRight",
	"borderBottom",
	"borderLeft"
], ni = [
	"solid",
	"dashed",
	"dotted",
	"double",
	"none"
], ri = (e) => ni.includes(e), ii = (e) => /^-?[\d.]/.test(e) || /^token:(space|border)/.test(e) || /^(thin|medium|thick)$/.test(e);
function ai(e) {
	let t = Yr(e ?? "");
	return {
		width: t.find(ii),
		style: t.find(ri),
		color: t.find((e) => !ii(e) && !ri(e))
	};
}
var oi = (e) => e.width || e.style || e.color ? [
	e.width ?? "1px",
	e.style ?? "solid",
	e.color
].filter(Boolean).join(" ") : null, si = () => [
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
function ci({ s: e }) {
	let [t, n] = j(() => ti.find((t) => e.value(t)) ?? "all"), r = ai(e.value("border")), i = {
		width: e.value("borderWidth") ?? r.width,
		style: e.value("borderStyle") ?? r.style,
		color: e.value("borderColor") ?? r.color
	}, a = t === "all" ? i : ai(e.value(t)), o = ei.map((t) => e.value(t)), s = (t) => e.value(ei[t]) ?? Zr(e.value("borderRadius"))?.[t], c = ai(e.value("outline")), l = i.width || i.style || i.color || e.value("borderRadius") || o.some(Boolean) || ti.some((t) => e.value(t)) || e.value("outline"), u = (t) => (t === "all" ? [
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
		}) : e.set(t, oi(r));
	}, p = (e, t, n) => ({
		value: e,
		icon: t,
		title: d(e) ? `${n} · ${d(e) === "own" ? C("set") : C("inherited")}` : n
	});
	return /* @__PURE__ */ H(rr, {
		title: C("Border"),
		empty: !l,
		children: [/* @__PURE__ */ V(X, {
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
					set: (e) => f($r({
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
						prefixIcon: "square"
					}, {
						handle: "style",
						type: "select",
						size: "sm",
						label: C("Style"),
						options: si(),
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
					status: t === "all" ? Qr(e.status("borderColor")) : d(t),
					get: () => a.color,
					set: (e) => f({ color: e ?? void 0 })
				},
				{
					handle: "radius",
					type: "group",
					component: "blocks-group",
					label: C("Radius"),
					status: e.status("borderRadius") === "own" || ei.some((t) => e.status(t) === "own") ? "own" : Qr(e.status("borderRadius")),
					keys: ["borderRadius", ...ei],
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
						prefixIcon: "frame",
						placeholder: "0",
						min: 0
					},
					fields: ei.map((e, t) => ({
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
						...Object.fromEntries(ei.map((e, t) => [e, s(t)]))
					}),
					set: (t) => {
						if (t.borderRadius !== e.value("borderRadius")) return e.set("borderRadius", t.borderRadius);
						e.write({
							borderRadius: null,
							...Object.fromEntries(ei.map((e) => [e, t[e] ?? null]))
						});
					}
				}
			]
		}), /* @__PURE__ */ V("div", {
			className: "!mt-3 border-t border-border pt-2",
			children: /* @__PURE__ */ V(X, {
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
						set: (t) => e.set("outline", oi({
							...c,
							...$r({
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
							prefixIcon: "selection"
						}, {
							handle: "style",
							type: "select",
							size: "sm",
							label: C("Style"),
							options: si(),
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
						set: (t) => e.set("outline", oi({
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
						prefixIcon: "arrows-out-simple"
					} : null
				]
			})
		})]
	});
}
// admin/src/builder/design/more.tsx
var Z = (e, t, n = t[0]) => ({
	label: e,
	type: "select",
	size: "sm",
	placeholder: n,
	options: t.map((e) => ({
		value: e,
		label: e
	}))
}), Q = (e, t = {}) => ({
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
}), li = (e, t = {}) => ({
	label: e,
	type: "text",
	component: "blocks-value",
	unit: "",
	placeholder: "0",
	...t
}), ui = (e) => ({
	label: e,
	type: "color",
	component: "blocks-color",
	placeholder: C("None")
}), $ = (e, t = "") => ({
	label: e,
	type: "text",
	size: "sm",
	commit: "blur",
	mono: !0,
	placeholder: t
}), di = [
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
function fi() {
	let e = (e, t) => Object.fromEntries(Object.entries(t).map(([t, n]) => [t, {
		group: e,
		field: n
	}]));
	return {
		...e("layout", {
			alignContent: Z(C("Align Content"), [
				"normal",
				"start",
				"center",
				"end",
				"space-between",
				"space-around",
				"space-evenly",
				"stretch"
			]),
			placeItems: $(C("Place Items"), "center"),
			placeContent: $(C("Place Content"), "center"),
			gridTemplateAreas: $(C("Grid Areas"), "\"a b\" \"c c\""),
			gridAutoColumns: $(C("Auto Columns"), "auto"),
			gridAutoRows: $(C("Auto Rows"), "auto"),
			columns: li(C("Columns"), {
				placeholder: C("Auto"),
				min: 1
			}),
			columnRule: $(C("Column Rule"), "1px solid"),
			boxSizing: Z(C("Box Sizing"), ["border-box", "content-box"]),
			float: Z(C("Float||CSS property"), [
				"none",
				"left",
				"right"
			]),
			clear: Z(C("Clear||CSS property"), [
				"none",
				"left",
				"right",
				"both"
			]),
			containerType: Z(C("Container Type"), [
				"normal",
				"inline-size",
				"size"
			])
		}),
		...e("item", {
			justifySelf: Z(C("Justify Self"), [
				"auto",
				"start",
				"center",
				"end",
				"stretch"
			]),
			placeSelf: $(C("Place Self"), "center"),
			gridArea: $(C("Grid Area"), "a"),
			flexGrow: li(C("Flex Grow"), { min: 0 }),
			flexShrink: li(C("Flex Shrink"), {
				placeholder: "1",
				min: 0
			}),
			flexBasis: Q(C("Flex Basis"), { placeholder: C("Auto") })
		}),
		...e("position", { inset: Q(C("Inset"), { placeholder: C("Auto") }) }),
		...e("size", {
			overflowX: Z(C("Overflow X"), [
				"visible",
				"hidden",
				"clip",
				"scroll",
				"auto"
			]),
			overflowY: Z(C("Overflow Y"), [
				"visible",
				"hidden",
				"clip",
				"scroll",
				"auto"
			]),
			overscrollBehavior: Z(C("Overscroll"), [
				"auto",
				"contain",
				"none"
			]),
			scrollSnapType: Z(C("Snap Type"), [
				"none",
				"x mandatory",
				"x proximity",
				"y mandatory",
				"y proximity",
				"both mandatory"
			]),
			scrollSnapAlign: Z(C("Snap Align"), [
				"none",
				"start",
				"center",
				"end"
			]),
			scrollMarginTop: Q(C("Scroll Margin")),
			scrollPadding: Q(C("Scroll Padding")),
			scrollbarWidth: Z(C("Scrollbar"), [
				"auto",
				"thin",
				"none"
			])
		}),
		...e("typography", {
			textDecorationColor: ui(C("Decoration Color")),
			textDecorationThickness: Q(C("Line Thickness"), { placeholder: C("Auto") }),
			textUnderlineOffset: Q(C("Underline Offset"), {
				unit: "em",
				units: ["em", "px"],
				step: .05,
				placeholder: C("Auto")
			}),
			whiteSpace: Z(C("White Space"), [
				"normal",
				"nowrap",
				"pre",
				"pre-wrap",
				"pre-line",
				"break-spaces"
			]),
			wordBreak: Z(C("Word Break"), [
				"normal",
				"break-all",
				"keep-all",
				"break-word"
			]),
			overflowWrap: Z(C("Overflow Wrap"), [
				"normal",
				"anywhere",
				"break-word"
			]),
			hyphens: Z(C("Hyphens"), [
				"manual",
				"auto",
				"none"
			]),
			textIndent: Q(C("Indent"), {
				unit: "em",
				units: [
					"em",
					"px",
					"rem"
				]
			}),
			textOverflow: Z(C("Text Overflow"), ["clip", "ellipsis"]),
			fontVariantNumeric: Z(C("Numbers"), [
				"normal",
				"tabular-nums",
				"proportional-nums",
				"lining-nums",
				"oldstyle-nums",
				"slashed-zero"
			]),
			fontFeatureSettings: $(C("Font Features"), "\"ss01\""),
			fontVariationSettings: $(C("Font Variations"), "\"wght\" 500"),
			listStyle: Z(C("List Style"), [
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
			verticalAlign: Z(C("Vertical Align"), [
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
			background: $(C("Background"), "none"),
			backgroundBlendMode: Z(C("Blend Mode"), di)
		}),
		...e("effects", {
			userSelect: Z(C("User Select"), [
				"auto",
				"none",
				"text",
				"all"
			]),
			visibility: Z(C("Visibility"), [
				"visible",
				"hidden",
				"collapse"
			]),
			maskImage: $(C("Mask Image"), "linear-gradient(black, transparent)"),
			accentColor: ui(C("Accent Color")),
			fill: ui(C("Fill")),
			stroke: ui(C("Stroke")),
			strokeWidth: Q(C("Stroke Width")),
			content: $(C("Content"), "\"\"")
		}),
		...e("transform", {
			perspectiveOrigin: $(C("Vanishing Point"), "center"),
			transformStyle: Z(C("Transform Style"), ["flat", "preserve-3d"]),
			backfaceVisibility: Z(C("Backface"), ["visible", "hidden"])
		}),
		...e("transition", {
			transitionProperty: $(C("Property"), "all"),
			transitionDuration: $(C("Duration"), "200ms"),
			transitionTimingFunction: $(C("Easing"), "ease"),
			transitionDelay: $(C("Delay"), "0ms"),
			willChange: $(C("Will Change"), "auto")
		})
	};
}
function pi() {
	return {
		display: Z(C("Display"), [
			"block",
			"inline",
			"inline-block",
			"flex",
			"grid",
			"none"
		]),
		width: Q(C("Width"), {
			unit: "rem",
			units: [
				"rem",
				"px",
				"%",
				"ch"
			],
			placeholder: C("Auto")
		}),
		maxWidth: Q(C("Max Width"), {
			unit: "rem",
			units: [
				"rem",
				"px",
				"%",
				"ch"
			],
			placeholder: C("None")
		}),
		textAlign: Z(C("Align"), [
			"left",
			"center",
			"right",
			"justify"
		]),
		fontStyle: Z(C("Style"), ["normal", "italic"]),
		textTransform: Z(C("Case"), [
			"none",
			"uppercase",
			"lowercase",
			"capitalize"
		]),
		textDecoration: Z(C("Decoration"), [
			"none",
			"underline",
			"line-through",
			"overline"
		]),
		textWrap: Z(C("Wrap"), [
			"wrap",
			"balance",
			"pretty",
			"nowrap"
		]),
		textShadow: $(C("Text Shadow"), "0 1px 2px rgb(0 0 0 / 0.2)"),
		boxShadow: $(C("Shadow"), "0 4px 16px rgb(0 0 0 / 0.1)"),
		opacity: li(C("Opacity"), {
			percent: !0,
			step: .05,
			min: 0,
			max: 1,
			placeholder: "100"
		}),
		borderStyle: Z(C("Border Style"), [
			"solid",
			"dashed",
			"dotted",
			"double",
			"none"
		]),
		borderTop: $(C("Border Top"), "1px solid"),
		borderRight: $(C("Border Right"), "1px solid"),
		borderBottom: $(C("Border Bottom"), "1px solid"),
		borderLeft: $(C("Border Left"), "1px solid"),
		paddingTop: Q(C("Padding Top"), { unit: "rem" }),
		paddingRight: Q(C("Padding Right"), { unit: "rem" }),
		paddingBottom: Q(C("Padding Bottom"), { unit: "rem" }),
		paddingLeft: Q(C("Padding Left"), { unit: "rem" }),
		marginBlock: Q(C("Margin Block"), { unit: "rem" }),
		marginInline: Q(C("Margin Inline"), { unit: "rem" })
	};
}
function mi(e, t = fi()) {
	let n = e.replace(/([A-Z])/g, " $1");
	return {
		handle: e,
		type: "text",
		size: "sm",
		commit: "blur",
		mono: !0,
		label: n.charAt(0).toUpperCase() + n.slice(1),
		...t[e]?.field ?? pi()[e]
	};
}
function hi({ properties: e, labels: t = {}, onPick: n, label: r = C("Add a Property"), children: i }) {
	let [a, o] = j(!1), [s, c] = j(""), [l, u] = j(0), d = fi(), f = s.trim().toLowerCase(), p = e.map((e) => ({
		property: e,
		label: t[e] ?? String(mi(e, d).label)
	})).filter((e) => !f || e.label.toLowerCase().includes(f) || e.property.toLowerCase().includes(f.replace(/[\s-]/g, ""))), m = (e) => {
		e && (o(!1), n(e));
	};
	return e.length === 0 ? null : /* @__PURE__ */ H(de, {
		open: a,
		onOpenChange: (e) => {
			o(e), c(""), u(0);
		},
		align: "end",
		className: "flex w-60 flex-col overflow-hidden !p-0",
		trigger: i ?? /* @__PURE__ */ V(I, {
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
				value: s,
				onChange: (e) => {
					c(e.target.value), u(0);
				},
				onKeyDown: (e) => {
					(e.key === "ArrowDown" || e.key === "ArrowUp") && (e.preventDefault(), u((t) => Math.max(0, Math.min(p.length - 1, t + (e.key === "ArrowDown" ? 1 : -1))))), e.key === "Enter" && (e.preventDefault(), m(p[l]?.property));
				},
				placeholder: C("Search"),
				"aria-label": C("Search"),
				className: "h-full min-w-0 flex-1 bg-transparent text-sm text-text outline-none"
			})]
		}), /* @__PURE__ */ H("div", {
			role: "listbox",
			"aria-label": r,
			className: "max-h-64 overflow-y-auto overscroll-contain p-1",
			children: [p.length === 0 && /* @__PURE__ */ V("p", {
				className: "m-0 px-2 py-3 text-sm text-muted",
				children: C("No matches")
			}), p.map((e, t) => /* @__PURE__ */ V(M, {
				variant: "ghost",
				role: "option",
				"aria-selected": t === l,
				tabIndex: -1,
				onMouseEnter: () => u(t),
				onClick: () => m(e.property),
				"data-active": t === l || void 0,
				className: "w-full !justify-start !rounded-xs !px-2 text-left !font-normal",
				children: e.label
			}, e.property))]
		})]
	});
}
var gi = (e, t = fi()) => [...e].sort((e, n) => String(mi(e, t).label).localeCompare(String(mi(n, t).label)));
function _i({ s: e, group: t, title: n, open: r, empty: i, children: a }) {
	let [o, s] = j(null), c = fi(), l = Object.keys(c).filter((e) => c[e].group === t), u = l.filter((t) => e.value(t) !== void 0 || t === o);
	return /* @__PURE__ */ H(rr, {
		title: n,
		open: r,
		empty: i && u.length === 0,
		fields: !0,
		actions: /* @__PURE__ */ V(hi, {
			properties: gi(l.filter((e) => !u.includes(e)), c),
			onPick: s
		}),
		children: [a, u.length > 0 && /* @__PURE__ */ V(X, {
			s: e,
			fields: u.map((t) => ({
				...mi(t, c),
				set: (n) => {
					t === o && s(null), e.set(t, n);
				}
			}))
		})]
	});
}
function vi({ field: e, value: t, onChange: n, actions: r, disabled: i, bare: a }) {
	return /* @__PURE__ */ H("div", {
		className: "group/row flex items-start gap-1",
		children: [/* @__PURE__ */ V(P, {
			bare: a,
			layout: a ? void 0 : "inline",
			labelWidth: 120,
			className: "min-w-0 flex-1",
			disabled: i,
			fields: [e],
			values: { [e.handle]: t ?? null },
			onChange: (e, t) => n(t)
		}), /* @__PURE__ */ V("span", {
			className: "mt-0.5 flex size-6 shrink-0 items-center justify-center",
			children: r.length > 0 && !i && /* @__PURE__ */ V(L, {
				trigger: /* @__PURE__ */ V(I, {
					icon: "more",
					label: C("Property Actions"),
					size: "xs",
					className: "opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100 data-[popup-open]:opacity-100"
				}),
				items: r
			})
		})]
	});
}
function yi({ field: e, value: t, onChange: n, disabled: r }) {
	let i = t ?? {}, [a, o] = j(null), s = e.controls ?? [], c = (e) => (e.fields ?? [e]).map((e) => e.handle), l = /* @__PURE__ */ new Set([...e.hidden ?? [], ...s.flatMap(c)]), u = fi(), d = (e) => {
		let t = { ...i };
		for (let [n, r] of Object.entries(e)) r == null || r === "" ? delete t[n] : t[n] = r;
		n(t);
	}, f = s.filter((e) => c(e).some((e) => e in i) || e.handle === a), p = [...Object.keys(i).filter((e) => !l.has(e)), ...a && !(a in i) && !s.some((e) => e.handle === a) ? [a] : []], m = [...Object.keys(u).filter((e) => u[e].group !== "item" && u[e].group !== "layout"), ...Object.keys(pi())].filter((e) => !l.has(e) && !p.includes(e)), h = [...s.filter((e) => !f.includes(e)).map((e) => e.handle), ...gi(m, u)], g = Object.fromEntries(s.map((e) => [e.handle, String(e.label)])), _ = (e, t) => [{
		label: C("Remove"),
		icon: "trash",
		danger: !0,
		onSelect: () => {
			t === a && o(null), d(Object.fromEntries(e.map((e) => [e, null])));
		}
	}];
	return /* @__PURE__ */ H("div", {
		className: "space-y-1",
		children: [
			f.map((e) => {
				let t = c(e), n = e.fields ? Object.fromEntries(t.map((e) => [e, i[e] ?? null])) : i[e.handle], s = (n) => {
					e.handle === a && o(null), d(e.fields ? Object.fromEntries(t.map((e) => [e, n?.[e] ?? null])) : { [e.handle]: n });
				}, l = t.some((e) => e in i);
				return /* @__PURE__ */ V(vi, {
					field: {
						...e,
						status: l ? "own" : void 0,
						reset: () => d(Object.fromEntries(t.map((e) => [e, null])))
					},
					value: n,
					disabled: r,
					actions: _(t, e.handle),
					bare: e.component === "blocks-shadows",
					onChange: s
				}, e.handle);
			}),
			p.map((e) => /* @__PURE__ */ V(vi, {
				field: {
					...mi(e, u),
					status: e in i ? "own" : void 0,
					reset: () => d({ [e]: null })
				},
				value: i[e],
				disabled: r,
				actions: _([e], e),
				onChange: (t) => {
					e === a && o(null), d({ [e]: t });
				}
			}, e)),
			!r && h.length > 0 && /* @__PURE__ */ V("div", {
				className: "flex h-8 items-center",
				children: /* @__PURE__ */ V(hi, {
					properties: h,
					labels: g,
					onPick: o,
					children: /* @__PURE__ */ V(fr, {
						className: "-ml-1.5 !w-auto",
						children: C("Add a Property")
					})
				})
			})
		]
	});
}
// admin/src/builder/design/Effects.tsx
var bi = [
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
], xi = [
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
function Si({ s: e }) {
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
	return /* @__PURE__ */ H(_i, {
		s: e,
		group: "effects",
		title: C("Effects"),
		empty: !t,
		children: [
			/* @__PURE__ */ V(X, {
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
			/* @__PURE__ */ V(X, {
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
			/* @__PURE__ */ V(X, {
				s: e,
				bare: !0,
				fields: [{
					handle: "filter",
					type: "text",
					component: "blocks-filters",
					label: C("Filters")
				}]
			}),
			/* @__PURE__ */ V(X, {
				s: e,
				bare: !0,
				fields: [{
					handle: "backdropFilter",
					type: "text",
					component: "blocks-filters",
					label: C("Backdrop")
				}]
			}),
			/* @__PURE__ */ V(X, {
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
						options: bi
					},
					{
						handle: "cursor",
						type: "select",
						size: "sm",
						label: C("Cursor"),
						placeholder: C("Auto"),
						options: xi
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
function Ci(e) {
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
function wi({ r: e, g: t, b: n, a: r }) {
	let i = (e) => Math.round(e).toString(16).padStart(2, "0");
	return r >= 1 ? `#${i(e)}${i(t)}${i(n)}` : `rgb(${Math.round(e)} ${Math.round(t)} ${Math.round(n)} / ${Math.round(r * 100)}%)`;
}
function Ti({ r: e, g: t, b: n }) {
	e /= 255, t /= 255, n /= 255;
	let r = Math.max(e, t, n), i = r - Math.min(e, t, n);
	return {
		h: ((i === 0 ? 0 : r === e ? (t - n) / i % 6 : r === t ? (n - e) / i + 2 : (e - t) / i + 4) * 60 + 360) % 360,
		s: r === 0 ? 0 : i / r,
		v: r
	};
}
function Ei(e, t, n, r) {
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
function Di(e) {
	return /^token:[a-z]+\.[a-z0-9-]+(\/\d{1,3})?$/.test(e) ? !0 : typeof CSS < "u" && CSS.supports("color", e);
}
function Oi() {
	let { byPath: e } = Pe();
	return (t) => t ? t.replace(/token:([a-z]+\.[a-z0-9-]+)(?:\/(\d+))?/g, (t, n, r) => {
		let i = e.get(n), a = i ? String(i.value) : "transparent";
		return r ? `color-mix(in srgb, ${a} ${r}%, transparent)` : a;
	}) : "transparent";
}
function ki({ field: e, value: t, onChange: n }) {
	let [r, i] = j(!1), a = Oi(), o = hr(), s = t ?? void 0, c = o(s);
	return /* @__PURE__ */ V(Cr, { children: /* @__PURE__ */ V(de, {
		open: r,
		onOpenChange: i,
		align: "end",
		className: "w-64 !p-0",
		trigger: /* @__PURE__ */ H(R, {
			compact: !0,
			id: ve(e),
			className: z(lr, "flex items-center gap-1.5 pl-1 text-left"),
			children: [/* @__PURE__ */ V(dr, {
				color: s === void 0 && typeof e.swatch == "string" ? e.swatch : a(s),
				className: "!size-4"
			}), c ? /* @__PURE__ */ V(vr, {
				token: c.token,
				alpha: c.alpha
			}) : /* @__PURE__ */ V("span", {
				className: z("truncate font-mono", !s && "font-sans text-faint"),
				children: s ?? e.placeholder ?? C("None")
			})]
		}),
		children: /* @__PURE__ */ V(Ai, {
			label: e.label || C("Color"),
			value: s,
			onChange: n
		})
	}) });
}
function Ai({ label: e, value: t, onChange: n }) {
	let { byGroup: r } = Pe(), i = r.get("color") ?? [], a = Oi(), o = t?.startsWith("token:") ? t.slice(6).split("/")[0] : null, s = Ci(t?.startsWith("token:") ? a(t.split("/")[0]) : t) ?? {
		r: 0,
		g: 0,
		b: 0,
		a: 1
	}, [c, l] = j(() => ({
		...Ti(s),
		a: t?.includes("/") && t.startsWith("token:") ? Number(t.split("/")[1]) / 100 : s.a
	})), [u, d] = j(t ?? ""), f = Ar(u, (e) => !e.trim() || Di(e.trim())), [p, m] = j(() => i.length > 0 && (!t || t.startsWith("token:")) ? "tokens" : "custom"), h = A(null);
	k(() => d(t ?? ""), [t]);
	let g = (e, t, r, i) => {
		l({
			h: e,
			s: t,
			v: r,
			a: i
		}), n(wi(Ei(e, t, r, i)));
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
	}, v = o ? t?.includes("/") ? Number(t.split("/")[1]) / 100 : 1 : c.a, y = o ? a(`token:${o}`) : wi({ ...Ei(c.h, c.s, c.v, 1) }), b = /* @__PURE__ */ H("div", {
		onPointerDown: (e) => _(e, "alpha"),
		className: "relative h-2.5 cursor-ew-resize rounded-full cms-checkerboard",
		children: [/* @__PURE__ */ V("span", {
			className: "absolute inset-0 rounded-full",
			style: { background: `linear-gradient(to right, transparent, ${y})` }
		}), /* @__PURE__ */ V("span", {
			className: "pointer-events-none absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white ring-1 ring-black/30",
			style: { left: `${v * 100}%` }
		})]
	}), x = /* @__PURE__ */ V(R, {
		compact: !0,
		onClick: () => n(null),
		className: "h-7 shrink-0 rounded-sm px-2 text-xs text-muted hover:bg-hover hover:text-ink",
		children: C("Clear")
	});
	return /* @__PURE__ */ H("div", { children: [/* @__PURE__ */ H("div", {
		className: "flex h-9 items-center gap-2 border-b border-border pl-2.5 pr-1.5",
		children: [/* @__PURE__ */ V("span", {
			className: "min-w-0 flex-1 truncate text-xs font-medium text-text",
			children: e
		}), i.length > 0 && /* @__PURE__ */ V(pe, {
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
	}), p === "tokens" ? /* @__PURE__ */ H("div", { children: [/* @__PURE__ */ V("div", {
		role: "listbox",
		"aria-label": C("Color Tokens"),
		className: "max-h-60 overflow-y-auto p-1",
		children: i.map((e) => /* @__PURE__ */ H(R, {
			compact: !0,
			role: "option",
			"aria-selected": o === e.path,
			title: `${e.path} · ${String(e.value)}${e.dark ? ` / ${String(e.dark)}` : ""}`,
			onClick: () => n(`token:${e.path}`),
			className: z("flex h-7 w-full items-center gap-2 rounded-xs px-1.5 text-left text-xs hover:bg-hover", o === e.path && "bg-active"),
			children: [
				/* @__PURE__ */ V(dr, {
					color: String(e.value),
					dark: e.dark ? String(e.dark) : void 0,
					className: "!size-4"
				}),
				/* @__PURE__ */ V("span", {
					className: "min-w-0 flex-1 truncate text-text",
					children: e.name
				}),
				/* @__PURE__ */ V("span", {
					className: "max-w-[45%] shrink-0 truncate font-mono text-2xs text-faint",
					children: String(e.value)
				}),
				o === e.path ? /* @__PURE__ */ V(F, {
					name: "check",
					size: 12,
					className: "shrink-0 text-focus"
				}) : /* @__PURE__ */ V("span", { className: "w-3 shrink-0" })
			]
		}, e.path))
	}), /* @__PURE__ */ H("div", {
		className: "flex items-center gap-2 border-t border-border px-2.5 py-2",
		children: [o ? /* @__PURE__ */ H(Te, { children: [
			/* @__PURE__ */ V("span", {
				className: "shrink-0 text-xs text-muted",
				children: C("Opacity")
			}),
			/* @__PURE__ */ V("div", {
				className: "min-w-0 flex-1",
				children: b
			}),
			/* @__PURE__ */ H("span", {
				className: "w-8 shrink-0 text-right text-2xs tabular-nums text-muted",
				children: [Math.round(v * 100), "%"]
			})
		] }) : /* @__PURE__ */ V("span", { className: "flex-1" }), x]
	})] }) : /* @__PURE__ */ H("div", {
		className: "space-y-2 p-2.5",
		children: [
			/* @__PURE__ */ V("div", {
				ref: h,
				onPointerDown: (e) => _(e, "area"),
				className: "relative h-32 cursor-crosshair rounded-sm",
				style: { background: `linear-gradient(to top, black, transparent), linear-gradient(to right, white, hsl(${c.h} 100% 50%))` },
				children: /* @__PURE__ */ V("span", {
					className: "pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white ring-1 ring-black/30",
					style: {
						left: `${c.s * 100}%`,
						top: `${(1 - c.v) * 100}%`
					}
				})
			}),
			/* @__PURE__ */ V("div", {
				onPointerDown: (e) => _(e, "hue"),
				className: "relative h-2.5 cursor-ew-resize rounded-full",
				style: { background: "linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)" },
				children: /* @__PURE__ */ V("span", {
					className: "pointer-events-none absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white ring-1 ring-black/30",
					style: { left: `${c.h / 360 * 100}%` }
				})
			}),
			b,
			/* @__PURE__ */ H("div", {
				className: "flex gap-1.5",
				children: [/* @__PURE__ */ V("input", {
					value: u,
					spellCheck: !1,
					"aria-label": C("Color Value"),
					"aria-invalid": f.shown || void 0,
					onChange: (e) => d(e.target.value),
					onBlur: () => {
						let e = u.trim();
						if (e && !Di(e)) return d(t ?? "");
						e !== (t ?? "") && n(e || null);
					},
					onKeyDown: (e) => {
						e.key === "Escape" && d(t ?? ""), e.key === "Enter" && (u.trim() && !Di(u.trim()) ? f.show() : e.target.blur());
					},
					className: z(lr, "font-mono"),
					placeholder: ue
				}), x]
			})
		]
	})] });
}
// admin/src/builder/fields/style.tsx
function ji(e) {
	let t = e?.match(/^(linear|radial)-gradient\((.*)\)$/);
	if (!t) return null;
	let n = Xr(t[2]), r = t[1] === "linear" ? "180deg" : "circle";
	n[0] && (/deg$|^to /.test(n[0]) || /^(circle|ellipse)/.test(n[0])) && (r = n.shift());
	let i = n.map((e) => {
		let t = Yr(e);
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
function Mi(e) {
	return `${e.kind}-gradient(${[e.angle, ...e.stops.map((e) => `${e.color}${e.at ? ` ${e.at}` : ""}`)].join(", ")})`;
}
function Ni({ value: e, onChange: t, context: n }) {
	let r = Oi(), i = ji(e);
	if (!i) return null;
	let a = (e) => t(Mi(e));
	return /* @__PURE__ */ H("div", {
		className: "min-w-0 flex-1 space-y-1 rounded-md bg-active/60 p-1.5",
		children: [
			/* @__PURE__ */ V("div", {
				className: "h-6 rounded-sm ring-1 ring-inset ring-black/10",
				style: { background: r(Mi({
					...i,
					kind: "linear",
					angle: "90deg"
				})) }
			}),
			/* @__PURE__ */ V(Y, {
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
			i.stops.map((e, t) => /* @__PURE__ */ H("div", {
				className: "flex items-center gap-1",
				children: [/* @__PURE__ */ V(Y, {
					bare: !0,
					className: "min-w-0 flex-1",
					context: n,
					fields: [{
						handle: "stop",
						type: "group",
						component: "blocks-group",
						label: C("Stop||gradient"),
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
				}), i.stops.length > 2 && /* @__PURE__ */ V(mr, { onClick: () => a({
					...i,
					stops: i.stops.filter((e, n) => n !== t)
				}) })]
			}, t)),
			/* @__PURE__ */ H(R, {
				compact: !0,
				onClick: () => a({
					...i,
					stops: [...i.stops, {
						color: "token:color.foreground",
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
					C("Add Stop")
				]
			})
		]
	});
}
var Pi = [
	"flex-start",
	"center",
	"flex-end"
], Fi = () => [
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
function Ii({ field: e, value: t, onChange: n, context: r }) {
	let i = e.row === !0, a = t?.justifyContent ?? void 0, o = t?.alignItems ?? void 0;
	return /* @__PURE__ */ H(Cr, { children: [/* @__PURE__ */ V("div", {
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
			let r = Pi[i ? t : e], s = Pi[i ? e : t], c = (a ?? "flex-start") === r && (o ?? "stretch").replace("stretch", "flex-start") === s;
			return /* @__PURE__ */ V(R, {
				compact: !0,
				onClick: () => n({
					justifyContent: r,
					alignItems: s
				}),
				className: "grid place-items-center rounded-xs hover:bg-hover",
				title: `${r.replace("flex-", "")} · ${s.replace("flex-", "")}`,
				children: /* @__PURE__ */ V("span", { className: z("rounded-full", c ? "size-2 bg-ink" : "size-1 bg-faint") })
			}, `${t}${e}`);
		}))
	}), /* @__PURE__ */ V(Y, {
		bare: !0,
		className: "min-w-0 flex-1",
		context: r,
		fields: [{
			handle: "justifyContent",
			type: "select",
			size: "sm",
			label: C("Distribute"),
			options: Fi(),
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
					icon: i ? "align-top" : "justify-start",
					title: C("Start")
				},
				{
					value: "center",
					icon: i ? "align-middle" : "justify-center",
					title: C("Center")
				},
				{
					value: "flex-end",
					icon: i ? "align-bottom" : "justify-end",
					title: C("End")
				},
				{
					value: "stretch",
					icon: i ? "arrows-out-line-vertical" : "spacing",
					title: C("Stretch")
				},
				{
					value: "baseline",
					icon: "text",
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
var Li = [
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
], Ri = {
	left: "0%",
	top: "0%",
	center: "50%",
	right: "100%",
	bottom: "100%"
};
function zi(e) {
	let t = (e ?? "center").trim().split(/\s+/), n = (e) => e === "top" || e === "bottom";
	t.length === 1 && t.push("center");
	let [r, i] = n(t[0]) || t[1] && (t[1] === "left" || t[1] === "right") ? [t[1], t[0]] : t;
	return `${Ri[r] ?? r} ${Ri[i] ?? i}`;
}
function Bi({ field: e, value: t, onChange: n, context: r, disabled: i }) {
	let a = zi(t);
	return /* @__PURE__ */ H(Cr, { children: [/* @__PURE__ */ V("div", {
		className: "grid size-[60px] shrink-0 grid-cols-3 gap-px rounded-sm bg-bg p-1",
		role: "radiogroup",
		"aria-label": e.label,
		children: Li.flat().map((t) => {
			let r = a === zi(t);
			return /* @__PURE__ */ V(R, {
				compact: !0,
				role: "radio",
				"aria-checked": r,
				disabled: i,
				onClick: () => n(t === "center" && !e.required ? null : t),
				className: "grid place-items-center rounded-xs hover:bg-hover",
				title: t,
				children: /* @__PURE__ */ V("span", { className: z("rounded-full", r ? "size-2 bg-ink" : "size-1 bg-faint") })
			}, t);
		})
	}), /* @__PURE__ */ V(Sr, {
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
var Vi = {
	backgroundImage: null,
	backgroundSize: null,
	backgroundPosition: null,
	backgroundRepeat: null
};
function Hi({ s: e }) {
	let t = e.value("backgroundImage"), n = t ? ji(t) ? "gradient" : "image" : "none", r = t?.match(/^media:([0-9a-z]{26})$/i)?.[1], i = e.value("backgroundColor") || t;
	return /* @__PURE__ */ H(_i, {
		s: e,
		group: "fill",
		title: C("Fill"),
		empty: !i,
		children: [
			/* @__PURE__ */ V(X, {
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
							icon: "gradient",
							title: C("Gradient")
						},
						{
							value: "image",
							icon: "image",
							title: C("Image")
						}
					],
					keys: ["backgroundImage"],
					reset: () => e.write(Vi),
					get: () => n,
					set: (t) => {
						t === "gradient" ? e.set("backgroundImage", "linear-gradient(180deg, token:color.primary, token:color.background)") : t === "image" ? e.write({
							backgroundImage: "none",
							backgroundSize: "cover",
							backgroundPosition: "center"
						}) : e.write(Vi);
					}
				}]
			}),
			n === "gradient" && /* @__PURE__ */ V(X, {
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
			n === "image" && /* @__PURE__ */ V("div", {
				className: "rounded-md bg-active/60 p-1.5 text-xs",
				children: /* @__PURE__ */ V(P, {
					bare: !0,
					fields: [{
						handle: "bg",
						type: "media",
						label: C("Image"),
						max: 1,
						accept: "image/*"
					}],
					values: { bg: r ? [r] : [] },
					onChange: (t, n) => e.set("backgroundImage", n?.[0] ? `media:${n[0]}` : "none")
				})
			}),
			/* @__PURE__ */ V(X, {
				s: e,
				fields: [
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
						label: C("Repeat||again"),
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
								icon: "spacing",
								title: C("Tile Across")
							},
							{
								value: "repeat-y",
								icon: "arrows-out-line-vertical",
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
			t && n === "image" && !r && t !== "none" && /* @__PURE__ */ V("p", {
				className: z("cms-input h-7 w-full min-w-0 rounded-sm px-2 text-sm placeholder:text-ghost", "h-auto py-1 font-mono"),
				children: t
			})
		]
	});
}
// admin/src/builder/design/Layout.tsx
var Ui = () => [
	{
		value: "block",
		icon: "square",
		title: C("Block")
	},
	{
		value: "flex",
		icon: "rows",
		title: C("Stack (flex)")
	},
	{
		value: "grid",
		icon: "grid",
		title: C("Grid")
	},
	{
		value: "inline-flex",
		icon: "arrows-in-line-horizontal",
		title: C("Inline Stack")
	},
	{
		value: "none",
		icon: "eye-off",
		title: C("Hidden")
	}
];
function Wi({ s: e }) {
	let t = e.value("display"), n = t === "flex" || t === "inline-flex", r = t === "grid" || t === "inline-grid", i = n && (e.value("flexDirection") ?? "row").startsWith("row");
	return /* @__PURE__ */ V(_i, {
		s: e,
		group: "layout",
		title: C("Layout"),
		empty: !t,
		children: /* @__PURE__ */ V(X, {
			s: e,
			fields: [
				{
					handle: "display",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: C("Display"),
					options: Ui()
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
							icon: "arrow-right",
							title: C("Horizontal")
						},
						{
							value: "column",
							icon: "arrow-down",
							title: C("Vertical")
						},
						{
							value: "row-reverse",
							icon: "arrow-left",
							title: C("Horizontal, Reversed")
						},
						{
							value: "column-reverse",
							icon: "arrow-up",
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
						prefixIcon: "split",
						placeholder: "0",
						min: 0
					}, {
						handle: "rowGap",
						type: "text",
						component: "blocks-value",
						label: C("Rows"),
						group: "space",
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
					label: C("Align"),
					keys: ["alignItems", "justifyItems"],
					get: () => e.value("alignItems"),
					options: [
						{
							value: "start",
							icon: "align-top",
							title: C("Top")
						},
						{
							value: "center",
							icon: "align-middle",
							title: C("Middle")
						},
						{
							value: "end",
							icon: "align-bottom",
							title: C("Bottom")
						},
						{
							value: "stretch",
							icon: "arrows-out-line-vertical",
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
							icon: "arrow-right",
							title: C("Rows First")
						},
						{
							value: "column",
							icon: "arrow-down",
							title: C("Columns First")
						},
						{
							value: "row dense",
							icon: "group",
							title: C("Fill Gaps (Dense)")
						}
					]
				}
			]
		})
	});
}
function Gi({ s: e, parentDisplay: t }) {
	if (!t || !/flex|grid/.test(t)) return null;
	let n = t.includes("grid");
	return /* @__PURE__ */ V(_i, {
		s: e,
		group: "item",
		title: C(n ? "Grid Item" : "Stack Item"),
		open: !1,
		empty: !e.value("alignSelf") && !e.value("flex") && !e.value("gridColumn"),
		children: /* @__PURE__ */ V(X, {
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
							label: C("Fill||size")
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
							icon: "align-top",
							title: C("Start")
						},
						{
							value: "center",
							icon: "align-middle",
							title: C("Center")
						},
						{
							value: "flex-end",
							icon: "align-bottom",
							title: C("End")
						},
						{
							value: "stretch",
							icon: "arrows-out-line-vertical",
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
					prefixIcon: "list-ordered"
				}
			]
		})
	});
}
// admin/src/builder/design/Position.tsx
function Ki({ s: e }) {
	let t = e.value("position"), n = !!t && t !== "static";
	return /* @__PURE__ */ V(_i, {
		s: e,
		group: "position",
		title: C("Position"),
		open: !!t,
		empty: !t,
		children: /* @__PURE__ */ V(X, {
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
					]
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
					prefixIcon: "collection"
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
					}]
				}
			]
		})
	});
}
// admin/src/builder/design/Size.tsx
function qi(e, t, n) {
	let r = e.value(t), i = r === "100%" ? "fill" : r === "fit-content" ? "fit" : r === "auto" || !r ? "auto" : r.endsWith("vh") || r.endsWith("vw") || r.endsWith("dvh") ? "viewport" : "fixed", a = {
		fill: C("Fill||size"),
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
function Ji({ s: e, media: t }) {
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
	return /* @__PURE__ */ V(_i, {
		s: e,
		group: "size",
		title: C("Size"),
		empty: !n,
		children: /* @__PURE__ */ V(X, {
			s: e,
			fields: [
				qi(e, "width", C("Width")),
				qi(e, "height", C("Height")),
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
							icon: "eye",
							title: C("Visible")
						},
						{
							value: "hidden",
							icon: "eye-off",
							title: C("Hidden")
						},
						{
							value: "auto",
							icon: "mouse-scroll",
							title: C("Scroll When Needed")
						},
						{
							value: "clip",
							icon: "scissors",
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
					label: C("Fit||image"),
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
var Yi = [
	"Top",
	"Right",
	"Bottom",
	"Left"
];
function Xi(e, t, n) {
	return [
		`${t}${Yi[n]}`,
		n % 2 == 0 ? `${t}Block` : `${t}Inline`,
		t
	].find((t) => e.value(t) !== void 0) ?? null;
}
function Zi(e, t, n) {
	let r = Xi(e, t, n);
	if (!r) return;
	let i = e.value(r);
	if (r === t) return Zr(i)?.[n];
	if (r.endsWith("Block") || r.endsWith("Inline")) {
		let [e, t] = Yr(String(i));
		return n === 0 || n === 3 ? e : t ?? e;
	}
	return i;
}
var Qi = (e) => [
	e,
	`${e}Block`,
	`${e}Inline`,
	...Yi.map((t) => `${e}${t}`)
];
function $i({ s: e }) {
	let t = ["margin", "padding"], n = t.some((t) => Yi.some((n, r) => Zi(e, t, r))), r = Object.fromEntries(t.map((t) => [t, [
		0,
		1,
		2,
		3
	].map((n) => Zi(e, t, n))])), i = Object.fromEntries(t.map((t) => [t, [
		0,
		1,
		2,
		3
	].map((n) => {
		let r = Xi(e, t, n);
		return r ? e.status(r) === "own" ? "own" : "inherited" : "none";
	})])), a = (t, n) => {
		let r = {
			[t]: null,
			[`${t}Block`]: null,
			[`${t}Inline`]: null
		}, i = n.every((e) => e !== void 0 && e === n[0]);
		i && (r[t] = n[0]), Yi.forEach((e, a) => r[`${t}${e}`] = i ? null : n[a] ?? null), e.write(r);
	};
	return /* @__PURE__ */ V(rr, {
		title: C("Spacing"),
		empty: !n,
		children: /* @__PURE__ */ V(X, {
			s: e,
			bare: !0,
			fields: [{
				handle: "spacing",
				type: "json",
				component: "blocks-spacing",
				className: "items-start",
				label: C("Spacing"),
				sideStatus: i,
				keys: [...Qi("margin"), ...Qi("padding")],
				get: () => r,
				set: (e) => t.forEach((t) => e[t] !== r[t] && a(t, e[t]))
			}]
		})
	});
}
// admin/src/builder/design/StateBar.tsx
var ea = () => [
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
], ta = () => [
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
function na({ node: t }) {
	let { store: n } = U(), r = W(n, (e) => e.state), i = W(n, (e) => e.breakpoint), a = W(n, (n) => e(n.nodes, t.id)), o = /* @__PURE__ */ new Set([
		...Object.keys(t.logic?.states ?? {}).map((e) => `is-${e}`),
		...Object.keys(t.bind ?? {}).filter((e) => e.startsWith("state:")).map((e) => `is-${e.slice(6)}`),
		...t.logic?.behaviors?.scroll ? ["is-scrolled", ...t.logic.behaviors.scroll.hide ? ["is-hidden"] : []] : [],
		...Object.keys(t.style ?? {}).map((e) => e.split(":").pop()).filter((e) => e.startsWith("is-") || e.startsWith("in-"))
	]), s = /* @__PURE__ */ new Set();
	for (let e of a) Object.keys(e.logic?.states ?? {}).forEach((e) => s.add(`in-${e}`)), e.logic?.behaviors?.scroll && s.add("in-scrolled");
	let c = [...o, ...s].filter((e, t, n) => n.indexOf(e) === t), l = (e) => e.startsWith("is-") ? e.slice(3) : e.startsWith("in-") ? C("in {state}", { state: e.slice(3) }) : [...ea(), ...ta()].find((t) => t.value === e)?.label ?? e, u = (e) => n.setStyleState(e), d = (e) => Object.keys(t.style ?? {}).some((t) => t === e || t.endsWith(`:${e}`)), f = async () => {
		let e = await be({
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
		...ea(),
		...c.map((e) => ({
			value: e,
			label: l(e)
		})),
		...r && !ea().some((e) => e.value === r) && !c.includes(r) ? [{
			value: r,
			label: l(r)
		}] : []
	], m = i === "tablet" ? C("Tablet and Phone") : i === "mobile" ? C("Phone") : i;
	return /* @__PURE__ */ H("div", {
		className: "space-y-2 border-b border-border px-4 py-3",
		children: [/* @__PURE__ */ H("div", {
			className: "flex items-start gap-1",
			children: [/* @__PURE__ */ V("div", {
				"data-wrap": !0,
				className: "flex min-w-0 flex-1 flex-wrap gap-0.5 rounded-md bg-active p-0.5",
				role: "radiogroup",
				"aria-label": C("State"),
				children: p.map((e) => /* @__PURE__ */ H(M, {
					variant: "ghost",
					size: "xs",
					role: "radio",
					"aria-checked": r === e.value,
					onClick: () => u(e.value),
					className: z("relative flex-[1_0_auto] !rounded-sm !px-1.5", r === e.value ? "!bg-float !text-ink shadow-raise dark:!bg-fill" : "!bg-transparent !text-muted hover:!text-text"),
					children: [/* @__PURE__ */ V("span", { children: e.label }), e.value && d(e.value) && r !== e.value && /* @__PURE__ */ V("span", {
						className: "size-1 shrink-0 rounded-full bg-current opacity-70",
						"aria-hidden": !0
					})]
				}, e.value || "default"))
			}), /* @__PURE__ */ V(L, {
				align: "end",
				trigger: /* @__PURE__ */ V(I, {
					icon: "plus",
					label: C("More States")
				}),
				items: [
					...ta().map((e) => ({
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
		}), i !== "base" && /* @__PURE__ */ H("div", {
			className: "flex h-7 items-center gap-2 rounded-sm bg-bg px-2 text-xs text-text",
			children: [
				/* @__PURE__ */ V(F, {
					name: i === "mobile" ? "phone" : "tablet",
					size: 14,
					className: "shrink-0 text-muted"
				}),
				/* @__PURE__ */ V("span", {
					className: "min-w-0 flex-1 truncate",
					children: m
				}),
				/* @__PURE__ */ V(M, {
					variant: "ghost",
					size: "xs",
					onClick: () => n.setBreakpoint("base"),
					className: "!px-1 !font-normal !text-muted hover:!text-ink",
					children: C("Back to Desktop")
				})
			]
		})]
	});
}
// admin/src/builder/design/Transform.tsx
var ra = (e, t) => e?.match(RegExp(`${t}\\(([^)]*)\\)`))?.[1];
function ia({ s: e }) {
	let t = Yr(e.value("translate") ?? ""), n = e.value("transform"), r = [
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
		X: ra(n, "skewX"),
		Y: ra(n, "skewY")
	}, o = (n, r) => {
		let i = [t[0] ?? "0", t[1] ?? "0"];
		i[n] = r ?? "0", e.set("translate", i.every((e) => e === "0" || e === "0px") ? null : i.join(" "));
	}, s = (t, r) => {
		let i = Yr(n ?? "").filter((e) => !e.startsWith(`skew${t}(`));
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
	return /* @__PURE__ */ V(_i, {
		s: e,
		group: "transform",
		title: C("Transform"),
		open: !!r,
		empty: !r,
		children: /* @__PURE__ */ V(X, {
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
					set: (e) => Object.entries($r(i, e)).forEach(([e, t]) => o(e === "x" ? 0 : 1, t ?? null))
				},
				{
					handle: "rotate",
					type: "text",
					component: "blocks-value",
					label: C("Rotate"),
					unit: "deg",
					prefixIcon: "redo",
					placeholder: "0"
				},
				{
					handle: "scale",
					type: "text",
					component: "blocks-value",
					label: C("Scale"),
					unit: "",
					step: .01,
					prefixIcon: "arrows-out-simple",
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
					set: (e) => Object.entries($r(a, e)).forEach(([e, t]) => s(e, t ?? null))
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
					prefixIcon: "perspective",
					placeholder: "none",
					keywords: ["none"]
				}
			]
		})
	});
}
// admin/src/builder/design/Transition.tsx
var aa = () => [
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
function oa(e) {
	if (!e) return null;
	let t = Yr(e.replace(/,\s*(?![^(]*\))/g, ", ")), n = t.filter((e) => /^[\d.]+m?s$/.test(e) || e.startsWith("token:duration")), r = t.find((e) => /^(ease|linear|cubic-bezier|steps|token:ease)/.test(e));
	return {
		property: e.split(/\s+\d/)[0].replace(/\s+(ease|linear|cubic-bezier).*$/, "").trim() || "all",
		duration: n[0] ?? "200ms",
		ease: r ?? "ease",
		delay: n[1]
	};
}
function sa({ s: e }) {
	let { byGroup: t } = Pe(), n = oa(e.value("transition")), r = (t) => {
		let r = {
			property: "all",
			duration: "200ms",
			ease: "cubic-bezier(0.2, 0.8, 0.2, 1)",
			...n,
			...t
		}, i = r.property.split(",").map((e) => e.trim());
		e.set("transition", i.map((e) => `${e} ${r.duration} ${r.ease}${r.delay ? ` ${r.delay}` : ""}`).join(", "));
	};
	return /* @__PURE__ */ V(_i, {
		s: e,
		group: "transition",
		title: C("Transition"),
		open: !!n,
		empty: !n,
		children: n ? /* @__PURE__ */ V(X, {
			s: e,
			fields: [
				{
					handle: "property",
					type: "select",
					size: "sm",
					label: C("Animate"),
					placeholder: C("Everything"),
					options: aa(),
					keys: ["transition"],
					get: () => aa().find((e) => e.value.split(",")[0].trim() === n.property.split(",")[0].trim())?.value,
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
						prefixIcon: "timer"
					}, {
						handle: "delay",
						type: "text",
						component: "blocks-value",
						label: C("Delay"),
						unit: "ms",
						step: 10,
						min: 0,
						prefixIcon: "pause",
						placeholder: C("Delay")
					}]
				},
				{
					handle: "ease",
					type: "text",
					component: "ease",
					label: C("Curve"),
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
							label: C("Ease||curve")
						},
						{
							value: "ease-in-out",
							label: C("Ease In-Out")
						},
						{
							value: "linear",
							label: C("Linear")
						},
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
		}) : /* @__PURE__ */ V(M, {
			variant: "ghost",
			icon: "plus",
			onClick: () => r({}),
			className: "w-full !text-xs !font-normal !text-muted hover:!text-ink",
			children: C("Animate State Changes")
		})
	});
}
// admin/src/builder/design/Typography.tsx
var ca = () => [
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
function la({ s: e, prose: t }) {
	let { byGroup: n } = Pe(), r = n.get("font") ?? [], i = n.get("weight") ?? [], a = [
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
	].some((t) => e.value(t)), o = Yr(e.value("textStroke") ?? ""), s = {
		width: o.find((e) => /^-?[\d.]/.test(e)),
		color: o.find((e) => !/^-?[\d.]/.test(e))
	};
	return /* @__PURE__ */ H(_i, {
		s: e,
		group: "typography",
		title: C("Typography"),
		empty: !a && !t?.on,
		children: [
			t && /* @__PURE__ */ V(Y, {
				fields: [{
					handle: "prose",
					type: "toggle",
					label: C("Prose")
				}],
				values: { prose: t.on },
				onChange: (e, n) => t.onChange(!!n)
			}),
			/* @__PURE__ */ V(X, {
				s: e,
				fields: [
					{
						handle: "fontFamily",
						type: "select",
						size: "sm",
						label: C("Font"),
						placeholder: C("Inherit"),
						options: r.map((e) => ({
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
						options: [...i.map((e) => ({
							value: `token:${e.path}`,
							label: `${e.path} · ${e.value}`
						})), ...ca()]
					},
					{
						handle: "fontSize",
						type: "text",
						component: "blocks-value",
						label: C("Size"),
						group: "text",
						prefixIcon: "richtext",
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
						prefixIcon: "height",
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
								icon: "align-left",
								title: C("Left")
							},
							{
								value: "center",
								icon: "align-center",
								title: C("Center")
							},
							{
								value: "right",
								icon: "align-right",
								title: C("Right")
							},
							{
								value: "justify",
								icon: "align-justify",
								title: C("Justify||text")
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
							icon: "text",
							title: C("Upright")
						}, {
							value: "italic",
							icon: "italic",
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
								icon: "close",
								title: C("No Decoration")
							},
							{
								value: "underline",
								icon: "underline",
								title: C("Underline")
							},
							{
								value: "line-through",
								icon: "strike",
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
								icon: "close",
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
						prefixIcon: "list-tree"
					}
				]
			}),
			/* @__PURE__ */ V(X, {
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
			/* @__PURE__ */ V(X, {
				s: e,
				fields: [{
					handle: "stroke",
					type: "group",
					component: "blocks-group",
					label: C("Text Stroke"),
					keys: ["textStroke"],
					get: () => s,
					set: (t) => {
						let n = {
							...s,
							...$r(s, t)
						};
						e.set("textStroke", n.width ? `${n.width} ${n.color ?? "currentColor"}` : null);
					},
					fields: [{
						handle: "width",
						type: "text",
						component: "blocks-value",
						label: C("Width"),
						prefixIcon: "edit",
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
function ua({ node: e }) {
	let { types: t, store: n } = U(), r = t.get(e.type), i = Jr(e), a = W(n, (t) => c(t.nodes, e.id)), o = a ? a.style?.base?.display ?? (a.type === "stack" || a.type === "columns" || a.type === "grid" ? "flex" : void 0) : void 0, s = new Set(r?.styles?.length ? r.styles : [
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
	return e.type === "component" ? /* @__PURE__ */ V("p", {
		className: "m-0 p-4 text-xs text-muted",
		children: C("Edit the component to change its shared design.")
	}) : /* @__PURE__ */ H("div", { children: [
		/* @__PURE__ */ V(na, { node: e }),
		u.has("layout") && d && /* @__PURE__ */ V(Wi, { s: i }),
		f && /* @__PURE__ */ V(Gi, {
			s: i,
			parentDisplay: o
		}),
		u.has("position") && /* @__PURE__ */ V(Ki, { s: i }),
		u.has("size") && /* @__PURE__ */ V(Ji, {
			s: i,
			media: [
				"image",
				"video",
				"embed"
			].includes(e.type)
		}),
		u.has("spacing") && /* @__PURE__ */ V($i, { s: i }),
		u.has("typography") && /* @__PURE__ */ V(la, {
			s: i,
			prose: r?.fields?.some((e) => e.handle === "prose") ? {
				on: !!e.props?.prose,
				onChange: (t) => n.updateProps(e.id, { prose: t || void 0 }, `inspector:${e.id}:prose`)
			} : void 0
		}),
		u.has("fill") && /* @__PURE__ */ V(Hi, { s: i }),
		u.has("border") && /* @__PURE__ */ V(ci, { s: i }),
		u.has("effects") && /* @__PURE__ */ V(Si, { s: i }),
		u.has("transform") && /* @__PURE__ */ V(ia, { s: i }),
		u.has("transition") && /* @__PURE__ */ V(sa, { s: i })
	] });
}
// admin/src/builder/logic/LogicPanel.tsx
var da = () => [
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
], fa = () => [
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
], pa = () => [
	{
		value: "set",
		label: C("Set State"),
		icon: "edit"
	},
	{
		value: "toggle",
		label: C("Toggle State"),
		icon: "toggle-left"
	},
	{
		value: "add",
		label: C("Add to Number"),
		icon: "plus"
	},
	{
		value: "if",
		label: C("If … Then … Else"),
		icon: "github"
	},
	{
		value: "play",
		label: C("Play Animation"),
		icon: "play"
	},
	{
		value: "scroll",
		label: C("Scroll To"),
		icon: "mouse-scroll"
	},
	{
		value: "fetch",
		label: C("Load Page Part"),
		icon: "external"
	},
	{
		value: "copy",
		label: C("Copy to Clipboard"),
		icon: "copy"
	},
	{
		value: "go",
		label: C("Go to Link"),
		icon: "link-chain"
	},
	{
		value: "theme",
		label: C("Light or Dark Mode"),
		icon: "moon"
	},
	{
		value: "focus",
		label: C("Focus Element"),
		icon: "position"
	},
	{
		value: "lock",
		label: C("Lock Page Scrolling"),
		icon: "lock"
	},
	{
		value: "wait",
		label: C("Wait"),
		icon: "timer"
	},
	{
		value: "dispatch",
		label: C("Send Event"),
		icon: "broadcast"
	},
	{
		value: "run",
		label: C("Expression"),
		icon: "braces"
	}
];
function ma(t) {
	let { store: n } = U(), r = W(n, (n) => e(n.nodes, t.id));
	return [...new Set([...r, t].flatMap((e) => Object.keys(e.logic?.data ?? {})))];
}
function ha(e) {
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
var ga = (e) => typeof e == "string" ? `'${e}'` : JSON.stringify(e), _a = (e, t, n = {}) => ({
	handle: e,
	type: "text",
	size: "sm",
	commit: "blur",
	label: t,
	mono: !0,
	max: 1e4,
	list: va,
	placeholder: "open, count > 3, tab === 'a'",
	...n
}), va = "cms-logic-variables", ya = (e, ...t) => e ? t : [], ba = [
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
function xa({ label: e, options: t, value: n, onChange: r }) {
	return /* @__PURE__ */ H("div", {
		className: "flex min-h-7 items-center gap-2",
		children: [/* @__PURE__ */ V(or, { field: {
			handle: e,
			type: "select",
			label: e
		} }), /* @__PURE__ */ V("span", {
			className: "cms-input flex h-7 min-w-0 flex-1 rounded-sm",
			children: /* @__PURE__ */ V(L, {
				align: "end",
				trigger: /* @__PURE__ */ H(M, {
					variant: "ghost",
					"aria-label": e,
					className: "!h-full min-w-0 flex-1 shrink !justify-start !gap-1.5 !bg-transparent !pl-2 !pr-1.5 text-left !font-normal",
					children: [/* @__PURE__ */ V("span", {
						className: z("min-w-0 flex-1 truncate", !n.length && "text-ghost"),
						children: n.length ? n.join(", ") : C("None")
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
					label: C("None"),
					disabled: !0
				}]
			})
		})]
	});
}
var Sa = { strip: "[^A-Za-z0-9_-]" }, Ca = (e) => e.replace(/^[^A-Za-z_]+/, "").slice(0, 41);
function wa({ node: e }) {
	let { store: t } = U(), n = w("design-code/list", {}, { staleTime: 3e4 }), r = e.behavior, i = e.code ?? {}, a = (e, ...t) => [.../* @__PURE__ */ new Set([...n.data?.[e] ?? [], ...t.filter((e) => !!e)])], o = (n) => t.updateNode(e.id, { behavior: n && (n.module ?? r?.module) ? {
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
		className: z("-mx-1.5 space-y-1 rounded-sm px-1.5 py-1", r && "bg-sunken/60"),
		children: [
			/* @__PURE__ */ V(Y, {
				fields: [{
					handle: "module",
					type: "select",
					size: "sm",
					label: C("Script"),
					placeholder: C("None"),
					options: a("scripts", r?.module),
					status: r ? "own" : void 0,
					reset: () => o(null)
				}, ...ya(r, {
					handle: "when",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: C("Runs"),
					required: !0,
					options: [
						{
							value: "load",
							label: C("On Load")
						},
						{
							value: "visible",
							label: C("In View")
						},
						{
							value: "idle",
							label: C("When Idle")
						}
					]
				})],
				values: {
					module: r?.module,
					when: r?.when ?? "load"
				},
				onChange: (e, t) => o(e === "module" ? t ? { module: String(t) } : null : { when: t === "visible" || t === "idle" ? t : void 0 })
			}),
			r && /* @__PURE__ */ H(Te, { children: [/* @__PURE__ */ V(ar, {
				title: C("Options"),
				action: /* @__PURE__ */ V(pr, {
					label: C("Add Option"),
					onClick: () => {
						let e = "value", t = 2;
						for (; e in c;) e = `value${t++}`;
						o({ props: {
							...c,
							[e]: ""
						} });
					}
				})
			}), /* @__PURE__ */ V(Y, {
				bare: !0,
				fields: [{
					handle: "props",
					type: "json",
					component: "blocks-pairs",
					className: "items-start",
					label: C("Options"),
					key: Sa,
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
				values: { props: Object.fromEntries(Object.entries(c).map(([e, t]) => [e, ga(t)])) },
				onChange: (e, t) => {
					let n = Object.fromEntries(Object.entries(t).map(([e, t]) => [Ca(e), e in c && ga(c[e]) === t ? c[e] : ha(t ?? "")]).filter(([e]) => e !== ""));
					o({ props: Object.keys(n).length ? n : void 0 });
				}
			})] }),
			/* @__PURE__ */ V(xa, {
				label: C("Load Scripts"),
				options: a("scripts", ...i.scripts ?? []),
				value: i.scripts ?? [],
				onChange: (e) => s("scripts", e)
			}),
			/* @__PURE__ */ V(xa, {
				label: C("Load Styles"),
				options: a("styles", ...i.styles ?? []),
				value: i.styles ?? [],
				onChange: (e) => s("styles", e)
			})
		]
	});
}
function Ta({ node: e }) {
	let { store: t, types: n } = U(), r = e.logic ?? {}, i = ma(e), a = (n) => {
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
	].includes(e.type) || (n.get(e.type)?.html ?? "") === "a", c = r.behaviors ?? {}, l = _("site.code") && (!!e.behavior || !!e.code);
	return /* @__PURE__ */ H(Te, { children: [
		/* @__PURE__ */ V("datalist", {
			id: va,
			children: [...i, ...i.map((e) => `!${e}`)].map((e) => /* @__PURE__ */ V("option", { value: e }, e))
		}),
		/* @__PURE__ */ V(rr, {
			title: C("State"),
			empty: !r.data,
			open: !!r.data,
			actions: /* @__PURE__ */ V(pr, {
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
			children: /* @__PURE__ */ V(Y, {
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
				values: { data: Object.fromEntries(Object.entries(o).map(([e, t]) => [e, ga(t)])) },
				onChange: (e, t) => a({ data: Object.fromEntries(Object.entries(t).map(([e, t]) => [e, e in o && ga(o[e]) === t ? o[e] : ha(t ?? "")])) })
			})
		}),
		/* @__PURE__ */ H(rr, {
			title: C("Events"),
			empty: !r.on?.length && !r.init?.length,
			open: !!r.on?.length || !!r.init?.length,
			actions: /* @__PURE__ */ V(pr, {
				label: C("Add Event"),
				onClick: () => a({ on: [...r.on ?? [], {
					event: "click",
					actions: []
				}] })
			}),
			children: [
				r.init && /* @__PURE__ */ V(Da, {
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
					return /* @__PURE__ */ V(Da, {
						title: /* @__PURE__ */ V(Y, {
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
									options: da().filter((e) => e.value !== "init")
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
				!r.init && (r.on?.length ?? 0) > 0 && /* @__PURE__ */ V(fr, {
					onClick: () => a({ init: [] }),
					children: C("When the Page Loads")
				})
			]
		}),
		/* @__PURE__ */ H(rr, {
			title: C("Bindings"),
			empty: !r.show && !r.states && !r.text && !r.attrs,
			open: !!(r.show || r.states || r.text || r.attrs),
			children: [
				/* @__PURE__ */ V(Y, {
					fields: [_a("show", C("Show When"), {
						placeholder: C("Always"),
						status: r.show ? "own" : void 0,
						reset: () => a({
							show: void 0,
							transition: void 0
						})
					}), ...ya(r.show, {
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
				/* @__PURE__ */ V(ar, {
					title: C("States"),
					action: /* @__PURE__ */ V(pr, {
						label: C("Add State"),
						onClick: () => a({ states: {
							...r.states ?? {},
							[Object.keys(r.states ?? {}).length ? `state${Object.keys(r.states ?? {}).length + 1}` : "open"]: i[0] ?? "open"
						} })
					})
				}),
				/* @__PURE__ */ V(Y, {
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
						item: _a("expr", C("When||condition"))
					}],
					values: { states: r.states },
					onChange: (e, t) => a({ states: t })
				}),
				/* @__PURE__ */ V(Y, {
					fields: [_a("text", C("Text"), {
						placeholder: C("As Designed"),
						status: r.text ? "own" : void 0,
						reset: () => a({ text: void 0 })
					})],
					values: { text: r.text },
					onChange: (e, t) => a({ text: t || void 0 })
				}),
				/* @__PURE__ */ V(ar, {
					title: C("Attributes"),
					action: /* @__PURE__ */ V(pr, {
						label: C("Bind Attribute"),
						onClick: () => a({ attrs: {
							...r.attrs ?? {},
							"aria-expanded": i[0] ?? "open"
						} })
					})
				}),
				/* @__PURE__ */ V(Y, {
					bare: !0,
					fields: [{
						handle: "attrs",
						type: "json",
						component: "blocks-pairs",
						className: "items-start",
						label: C("Attributes"),
						key: {
							options: ba,
							className: ""
						},
						item: _a("expr", C("Value"))
					}],
					values: { attrs: r.attrs },
					onChange: (e, t) => a({ attrs: t })
				}),
				e.type === "input" && /* @__PURE__ */ V(Y, {
					fields: [{
						handle: "model",
						type: "select",
						size: "sm",
						label: C("Input Value"),
						placeholder: C("Not kept"),
						options: i,
						status: r.model ? "own" : void 0,
						reset: () => a({ model: void 0 })
					}],
					values: { model: r.model },
					onChange: (e, t) => a({ model: t || void 0 })
				})
			]
		}),
		/* @__PURE__ */ H(rr, {
			title: C("Behaviors"),
			empty: !r.behaviors && !r.component && !l,
			open: !!r.behaviors || !!r.component || l,
			children: [
				/* @__PURE__ */ V(Ea, {
					on: !!c.scroll,
					label: C("Scroll States"),
					onToggle: (e) => a({ behaviors: {
						...c,
						scroll: e ? { threshold: 20 } : void 0
					} }),
					fields: [{
						handle: "threshold",
						type: "text",
						component: "blocks-value",
						label: C("After||a distance"),
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
				/* @__PURE__ */ V(Ea, {
					on: !!c.spy,
					label: C("Scroll Spy"),
					onToggle: (e) => a({ behaviors: {
						...c,
						spy: e ? { offset: 96 } : void 0
					} })
				}),
				/* @__PURE__ */ V(Ea, {
					on: !!c.group,
					label: C("Hover Group"),
					onToggle: (e) => a({ behaviors: {
						...c,
						group: e || void 0
					} })
				}),
				/* @__PURE__ */ V(Ea, {
					on: !!c.menu,
					label: C("Menu"),
					onToggle: (e) => a({ behaviors: {
						...c,
						menu: e ? {} : void 0
					} })
				}),
				/* @__PURE__ */ V(Ea, {
					on: !!c.carousel,
					label: C("Carousel"),
					onToggle: (e) => a({ behaviors: {
						...c,
						carousel: e ? {} : void 0
					} })
				}),
				/* @__PURE__ */ V(Ea, {
					on: !!c.marquee,
					label: C("Marquee"),
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
				}),
				_("site.code") && /* @__PURE__ */ V(wa, { node: e }),
				/* @__PURE__ */ V(Y, {
					fields: [{
						handle: "component",
						type: "text",
						size: "sm",
						commit: "blur",
						label: C("Alpine"),
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
		s && /* @__PURE__ */ V(rr, {
			title: C("Load Into"),
			open: !!r.target,
			empty: !r.target && !r.merge,
			children: /* @__PURE__ */ V(Y, {
				fields: [
					{
						handle: "target",
						type: "json",
						component: "blocks-nodes",
						label: C("Update"),
						exclude: e.id,
						add: C("Element to Update"),
						addValue: e.id
					},
					...ya(r.target, {
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
function Ea({ on: e, label: t, onToggle: n, fields: r, values: i, onChange: a }) {
	return /* @__PURE__ */ H("div", {
		className: z("-mx-1.5 rounded-sm px-1.5 py-1", e && "bg-sunken/60"),
		children: [/* @__PURE__ */ V(Y, {
			fields: [{
				handle: "on",
				type: "toggle",
				size: "sm",
				label: t
			}],
			values: { on: e },
			onChange: (e, t) => n(!!t)
		}), e && r && /* @__PURE__ */ V(Y, {
			className: "mt-1 space-y-1 pl-10",
			fields: r,
			values: i ?? {},
			onChange: a ?? (() => {})
		})]
	});
}
function Da({ title: e, mods: t, onMods: n, actions: r, onActions: i, onRemove: a, variables: o, node: s }) {
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
							label: C("Event Options"),
							size: "xs",
							active: !!t?.length
						}),
						items: fa().map((e) => ({
							label: e.label,
							checked: t?.includes(e.value),
							onSelect: () => n(t?.includes(e.value) ? t.filter((t) => t !== e.value) : [...t ?? [], e.value])
						}))
					}),
					/* @__PURE__ */ V(mr, {
						onClick: a,
						label: C("Remove Event")
					})
				]
			}),
			t && t.length > 0 && /* @__PURE__ */ V("p", {
				className: "m-0 pl-5 text-2xs text-faint [overflow-wrap:anywhere]",
				children: t.map((e) => fa().find((t) => t.value === e)?.label).join(" · ")
			}),
			/* @__PURE__ */ V(Oa, {
				actions: r,
				onChange: i,
				variables: o,
				node: s
			})
		]
	});
}
function Oa({ actions: e, onChange: t, variables: n, node: r, depth: i = 0 }) {
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
		className: z("space-y-1", i > 0 && "border-l border-border pl-2"),
		children: [e.map((a, s) => /* @__PURE__ */ H("div", {
			className: "space-y-1 rounded-md bg-active/60 p-1.5",
			children: [/* @__PURE__ */ H("div", {
				className: "flex items-center gap-1",
				children: [
					/* @__PURE__ */ V(F, {
						name: pa().find((e) => e.value === a.do)?.icon ?? "dot-outline",
						size: 14,
						className: "shrink-0 text-muted"
					}),
					/* @__PURE__ */ V("span", {
						className: "min-w-0 flex-1 text-xs font-medium text-text [overflow-wrap:anywhere]",
						children: pa().find((e) => e.value === a.do)?.label ?? a.do
					}),
					/* @__PURE__ */ V(mr, {
						onClick: () => t(e.filter((e, t) => t !== s)),
						label: C("Remove Action")
					})
				]
			}), /* @__PURE__ */ V(Aa, {
				action: a,
				onChange: (e) => o(s, e),
				variables: n,
				node: r,
				depth: i
			})]
		}, s)), /* @__PURE__ */ V(L, {
			align: "start",
			trigger: /* @__PURE__ */ V(fr, { children: C("Add Action") }),
			items: pa().map((e) => ({
				label: e.label,
				icon: e.icon,
				onSelect: () => a(e.value)
			}))
		})]
	});
}
var ka = (e) => e === "top" || e === "bottom" ? e : e?.startsWith("#") ? "anchor" : "node";
function Aa({ action: e, onChange: n, variables: r, node: i, depth: a }) {
	let { store: o } = U(), s = tt(), c = W(o, (n) => e.do === "play" && e.node ? t(n.nodes, e.node) : null), l = {
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
			f = [l, _a("value", e.do === "set" ? C("To||set a value") : C("Add||to a number"), { placeholder: e.do === "set" ? "true, 'text', count + 1" : "1" })];
			break;
		case "toggle":
			f = [l];
			break;
		case "if":
			f = [_a("test", C("If"), { placeholder: "open" })];
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
				kind: ka(e.to),
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
				addValue: i.id
			}];
			break;
		case "copy":
			f = [_a("value", C("Text"), { placeholder: `'${C("Text to Copy")}'` })];
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
				onNewTab: (e) => n({ newTab: e || void 0 })
			}], m = (e, t) => ({ url: t ?? "" });
			break;
		case "theme":
			f = [d("mode", C("Mode"), [
				{
					value: "toggle",
					label: C("Switch||between two")
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
			}, _a("detail", C("Detail"), { placeholder: "detail" })], m = (e, t) => ({ [e]: e === "detail" ? t || void 0 : t ?? "" });
			break;
		case "run":
			f = [_a("expr", C("Run"), { placeholder: "count = count * 2" })];
			break;
		default: return /* @__PURE__ */ V("p", {
			className: z(lr, "h-auto whitespace-pre-wrap font-mono [overflow-wrap:anywhere]"),
			children: JSON.stringify(e)
		});
	}
	return /* @__PURE__ */ H("div", {
		className: "space-y-1",
		children: [/* @__PURE__ */ V(Y, {
			fields: f,
			values: p,
			onChange: (e, t) => n(m(e, t))
		}), e.do === "if" && /* @__PURE__ */ H(Te, { children: [
			/* @__PURE__ */ V("p", {
				className: "cms-label m-0 pt-1",
				children: C("Then")
			}),
			/* @__PURE__ */ V(Oa, {
				actions: e.then ?? [],
				onChange: (e) => n({ then: e }),
				variables: r,
				node: i,
				depth: a + 1
			}),
			/* @__PURE__ */ V("p", {
				className: "cms-label m-0 pt-1",
				children: C("Else")
			}),
			/* @__PURE__ */ V(Oa, {
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
var ja = (e) => ({
	appear: C("Appear"),
	scroll: C("Scroll"),
	hover: C("Hover and Press"),
	loop: C("Loop"),
	load: C("Page Load"),
	event: C("On Event")
})[e], Ma = "power3.out", Na = () => [
	{
		name: C("Fade In"),
		group: "appear",
		make: () => ({
			trigger: { type: "appear" },
			steps: [{
				target: "self",
				from: { opacity: 0 },
				duration: .8,
				ease: Ma
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
				ease: Ma
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
				ease: Ma
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
				ease: Ma
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
				ease: Ma,
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
				ease: Ma,
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
				ease: Ma
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
				ease: Ma
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
				ease: Ma
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
				ease: Ma,
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
				ease: Ma,
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
				ease: Ma,
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
				ease: Ma
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
				ease: Ma,
				stagger: .05
			}]
		})
	}
], Pa = () => ({
	appear: {
		label: C("Appear"),
		icon: "eye"
	},
	scroll: {
		label: C("Scroll"),
		icon: "mouse-scroll"
	},
	hover: {
		label: C("Hover"),
		icon: "hand-pointing"
	},
	press: {
		label: C("Press"),
		icon: "hand-tap"
	},
	load: {
		label: C("Page Load"),
		icon: "rocket"
	},
	loop: {
		label: C("Loop"),
		icon: "refresh"
	},
	event: {
		label: C("On Event"),
		icon: "broadcast"
	}
}), Fa = () => ({
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
}), Ia = () => [
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
], La = (e, t, n = {}) => ({
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
}), Ra = /^\d{1,5}(\.\d{1,2})?(px|rem|vh|svh|lvh|dvh)$/, za = [
	"vh",
	"svh",
	"lvh",
	"dvh",
	"px",
	"rem"
], Ba = (e, ...t) => e ? t : [], Va = [
	"heading",
	"paragraph",
	"link",
	"button",
	"quote"
], Ha = (e) => {
	let t = e.length + 1;
	for (; e.some((e) => e.id === `m${t}`);) t++;
	return `m${t}`;
}, Ua = (e = "self") => e.startsWith("#") ? C("Another Element") : {
	self: C("This Element"),
	children: C("Children"),
	words: C("Words"),
	lines: C("Lines||of text"),
	chars: C("Letters")
}[e] ?? e;
function Wa({ node: e }) {
	let { store: t } = U(), n = e.motion ?? [], [r, i] = j(n[0]?.id ?? null), a = (n) => t.updateNode(e.id, { motion: n.length ? n : void 0 }, `motion:${e.id}`), o = (e, t) => a(n.map((n) => n.id === e ? {
		...n,
		...t
	} : n)), s = Va.includes(e.type), c = Pa(), l = (t) => {
		let r = Ha(n), o = t ? {
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
		a([...n, o]), i(r), requestAnimationFrame(() => ln.emit("preview-motion", {
			node: e.id,
			motion: o
		}));
	}, u = Na(), d = [...new Set(u.map((e) => e.group))];
	return /* @__PURE__ */ V(rr, {
		title: C("Animations"),
		empty: n.length === 0,
		actions: /* @__PURE__ */ V(L, {
			align: "end",
			trigger: /* @__PURE__ */ V(I, {
				icon: "plus",
				label: C("Add Animation"),
				size: "xs"
			}),
			items: [
				...d.flatMap((e) => [{
					label: ja(e),
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
					icon: "wand",
					onSelect: () => l()
				}
			]
		}),
		children: n.map((t) => /* @__PURE__ */ H("div", {
			className: z("rounded-sm border", r === t.id ? "border-border-strong" : "border-border"),
			children: [/* @__PURE__ */ H("div", {
				className: "flex h-8 items-center gap-1.5 pl-2 pr-1",
				children: [
					/* @__PURE__ */ V(F, {
						name: c[t.trigger.type]?.icon ?? "wand",
						size: 13,
						className: "shrink-0 text-muted"
					}),
					/* @__PURE__ */ H(M, {
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
					/* @__PURE__ */ V(ge, {
						content: C("Preview Animation"),
						children: /* @__PURE__ */ V(I, {
							icon: "play",
							label: C("Preview Animation"),
							title: void 0,
							size: "xs",
							onClick: () => ln.emit("preview-motion", {
								node: e.id,
								motion: t
							})
						})
					}),
					/* @__PURE__ */ V(mr, {
						onClick: () => a(n.filter((e) => e.id !== t.id)),
						label: C("Remove Animation")
					})
				]
			}), r === t.id && /* @__PURE__ */ V(Ga, {
				node: e,
				motion: t,
				onChange: (e) => o(t.id, e)
			})]
		}, t.id))
	});
}
function Ga({ node: e, motion: t, onChange: n }) {
	let [r, i] = j(0), a = Pa(), o = t.trigger, s = (e) => n({ trigger: {
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
		}))
	}], f = [
		...Ba(o.type === "appear", {
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
		...Ba(o.type === "scroll", {
			handle: "start",
			type: "select",
			size: "sm",
			label: C("Begins"),
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
			label: C("Ends"),
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
		}, {
			handle: "pin",
			type: "text",
			component: "blocks-value",
			label: C("Pin Distance"),
			unit: "vh",
			units: za,
			step: 10,
			min: 0,
			max: 99999,
			placeholder: "0"
		}, La("scrub", C("Smoothing"), { max: 3 })),
		...Ba(l, {
			handle: "repeat",
			type: "select",
			display: "segmented",
			block: !0,
			size: "sm",
			label: C("Repeat||again"),
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
					label: C("Forever||repeat")
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
			if: { repeat: "-1" }
		}),
		...Ba(o.type === "scroll" || o.type === "appear", {
			handle: "watch",
			type: "select",
			component: "blocks-node",
			label: C("Watch"),
			placeholder: C("This Element"),
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
		e === "name" ? n({ name: t ?? "" }) : e === "type" ? t && s({ type: t }) : e === "start" || e === "end" ? s({ [e]: t ?? void 0 }) : e === "pin" ? s({ pin: typeof t == "string" && Ra.test(t.trim()) && parseFloat(t) > 0 ? t.trim() : void 0 }) : e === "scrub" ? s({ scrub: parseFloat(t) > 0 ? Math.min(3, Math.max(.05, parseFloat(t))) : void 0 }) : e === "replay" ? s({ once: !t && void 0 }) : e === "repeat" ? n({ repeat: Number(t ?? 0) }) : e === "yoyo" ? n({ yoyo: t || void 0 }) : e === "hold" ? n({ hold: t === "" || t == null ? void 0 : Number(t) }) : e === "watch" && s({ node: t ? `#${t}` : void 0 });
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
			/* @__PURE__ */ V(Y, {
				fields: [...d, ...f],
				values: m,
				onChange: h
			}),
			/* @__PURE__ */ H("div", {
				className: "flex min-h-7 items-center",
				children: [/* @__PURE__ */ V(or, { field: {
					handle: "on",
					type: "select",
					label: C("Plays On")
				} }), /* @__PURE__ */ V("div", {
					role: "group",
					"aria-label": C("Plays On"),
					className: "flex gap-0.5",
					children: [
						[
							"desktop",
							"monitor",
							C("Desktop")
						],
						[
							"tablet",
							"tablet",
							C("Tablet")
						],
						[
							"mobile",
							"phone",
							C("Phone")
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
					children: C("Animation ID")
				}), /* @__PURE__ */ V("code", {
					className: "select-all font-mono text-text",
					children: t.id
				})]
			}),
			/* @__PURE__ */ V(Ja, {
				steps: t.steps,
				active: u,
				onSelect: i,
				onChange: c,
				onAdd: g
			}),
			t.steps[u] && /* @__PURE__ */ V(Ya, {
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
function Ka(e) {
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
var qa = (e) => Math.max(0, Math.round(e * 20) / 20);
function Ja({ steps: e, active: t, onSelect: n, onChange: r, onAdd: i }) {
	let a = Ka(e), o = Math.max(.5, ...a.map((e) => e.start + e.duration + e.spread)), s = A(null), c = s.current?.total ?? Math.ceil(o * 2 + .25) / 2, l = c <= 1.5 ? .25 : c <= 4 ? .5 : c <= 10 ? 1 : 2, u = Array.from({ length: Math.floor(c / l) + 1 }, (e, t) => t * l), d = (e) => `${e / c * 100}%`, f = (t, i, a) => {
		t.preventDefault(), t.stopPropagation(), n(i);
		let o = t.currentTarget.closest("[data-track]");
		if (!o) return;
		s.current = {
			total: c,
			width: o.clientWidth
		};
		let l = t.clientX, u = e[i], d = a === "move" ? u.at === void 0 ? u.delay ?? 0 : u.at : u.duration ?? .6, f = (e) => {
			let t = (e.clientX - l) / s.current.width * s.current.total;
			a === "end" ? r(i, { duration: Math.max(.05, qa(d + t)) }) : u.at === void 0 ? r(i, { delay: qa(d + t) || void 0 }) : r(i, { at: qa(d + t) });
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
					children: C("Timeline")
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
					className: z("flex h-7 items-center pr-2", i === t && "bg-focus-soft"),
					children: [/* @__PURE__ */ V(M, {
						variant: "ghost",
						size: "xs",
						onClick: () => n(i),
						className: z("w-24 !justify-start !bg-transparent !pl-2 !pr-0 text-left !text-2xs", i === t ? "!font-medium !text-ink" : "!font-normal !text-muted hover:!text-text"),
						children: /* @__PURE__ */ V("span", {
							className: "truncate",
							children: Ua(e.target)
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
									t.shiftKey ? r(i, { duration: Math.max(.05, qa((e.duration ?? .6) + n)) }) : e.at === void 0 ? r(i, { delay: qa((e.delay ?? 0) + n) || void 0 }) : r(i, { at: qa(e.at + n) });
								},
								className: z("cms-focus-ring group/bar absolute top-1 flex h-4 cursor-grab items-center rounded-xs active:cursor-grabbing", i === t ? "bg-focus" : "bg-focus/50 hover:bg-focus/70"),
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
			/* @__PURE__ */ V(fr, {
				size: "xs",
				onClick: i,
				className: "ml-24 mt-0.5 !w-auto",
				children: C("Add Step")
			})
		]
	});
}
function Ya({ node: e, step: t, index: n, count: r, onChange: i, onRemove: a }) {
	let { catalog: o } = U(), { byGroup: s } = Pe(), c = t.target ?? "self", l = Fa(), u = Object.keys(o.motion?.properties ?? l), d = Va.includes(e.type), f = (e) => {
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
						children: C(e === "from" ? "From" : "To||end value")
					}), /* @__PURE__ */ V(L, {
						align: "end",
						trigger: /* @__PURE__ */ V(I, {
							icon: "plus",
							label: C(e === "from" ? "Add a Start Property" : "Add an End Property"),
							size: "xs"
						}),
						items: u.filter((e) => !(e in n)).map((e) => ({
							label: l[e] ?? e,
							onSelect: () => r(e, o.motion.properties[e] === "css" ? e === "clipPath" ? "inset(0% 0% 0% 0%)" : "token:color.primary" : e === "opacity" || e.startsWith("scale") ? "1" : "0")
						}))
					})]
				}),
				Object.keys(n).length === 0 && /* @__PURE__ */ V("p", {
					className: "m-0 text-2xs text-faint",
					children: C(e === "from" ? "As it looks now" : "As Designed")
				}),
				/* @__PURE__ */ V(Y, {
					bare: !0,
					fields: [{
						handle: e,
						type: "json",
						component: "blocks-pairs",
						className: "items-start",
						label: C(e === "from" ? "From" : "To||end value"),
						labels: l,
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
	return /* @__PURE__ */ H("div", {
		className: "space-y-2",
		children: [
			/* @__PURE__ */ H("div", {
				className: "flex h-7 items-center gap-1",
				children: [
					/* @__PURE__ */ V("span", {
						className: "text-xs font-semibold text-text",
						children: r > 1 ? C("Step {n}", { n: n + 1 }) : C("Animate")
					}),
					/* @__PURE__ */ V("span", { className: "flex-1" }),
					r > 1 && /* @__PURE__ */ V(mr, {
						onClick: a,
						label: C("Remove Step")
					})
				]
			}),
			/* @__PURE__ */ V(Y, {
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
							...d ? [
								{
									value: "words",
									label: C("Each Word")
								},
								{
									value: "lines",
									label: C("Each Line")
								},
								{
									value: "chars",
									label: C("Each Letter")
								}
							] : [],
							{
								value: "other",
								label: C("Another Element")
							}
						]
					},
					...Ba(c.startsWith("#"), {
						handle: "element",
						type: "select",
						component: "blocks-node",
						label: C("Element")
					}),
					...Ba(c === "words" || c === "chars", {
						handle: "mask",
						type: "toggle",
						size: "sm",
						label: C("Rise from Behind a Line")
					})
				],
				values: {
					target: c.startsWith("#") ? "other" : c,
					element: c.slice(1),
					mask: !!t.mask
				},
				onChange: (t, n) => i(t === "mask" ? { mask: n || void 0 } : { target: t === "target" ? n === "other" ? `#${e.id}` : n ?? "self" : n ? `#${n}` : "self" })
			}),
			f("from"),
			f("to"),
			/* @__PURE__ */ V(Y, {
				fields: [
					La("duration", C("Duration")),
					La("delay", C("Delay")),
					...Ba(c !== "self", La("stagger", C("Stagger"), { step: .01 })),
					...Ba(r > 1, La("at", C("Starts At||time"), { placeholder: C("After") })),
					{
						handle: "ease",
						type: "text",
						component: "ease",
						label: C("Ease"),
						placeholder: C("Smooth Out"),
						options: [...(s.get("ease") ?? []).map((e) => ({
							value: `token:${e.path}`,
							label: e.name,
							curve: String(e.value)
						})), ...Ia()]
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
var Xa = [
	"content",
	"design",
	"interact"
], Za = "cms.block.tab";
function Qa(e) {
	if (!e.scrollTop) return null;
	let t = e.getBoundingClientRect().top, n = [...e.querySelectorAll("[data-section]")].find((e) => e.getBoundingClientRect().bottom > t);
	return {
		section: n?.dataset.section,
		offset: n ? n.getBoundingClientRect().top - t : 0,
		scrollTop: e.scrollTop
	};
}
function $a(e, t) {
	let n = t.section && e.querySelector(`[data-section="${CSS.escape(t.section)}"]`);
	n ? e.scrollTop += n.getBoundingClientRect().top - e.getBoundingClientRect().top - t.offset : e.scrollTop = t.scrollTop;
}
function eo() {
	try {
		let e = sessionStorage.getItem(Za);
		return Xa.find((t) => t === e) ?? "content";
	} catch {
		return "content";
	}
}
function to({ node: e, onBack: t, backLabel: n, onClose: r }) {
	let { store: i, types: a, allowed: o, readOnly: s } = U(), c = a.get(e.type), l = Me(), [u, d] = j(eo), p = `block-inspector-${oe()}`, [m, h] = j(!1), g = A(null), v = A(e.id), y = A(null);
	v.current !== e.id && (v.current = e.id, y.current = g.current && Qa(g.current)), se(() => {
		g.current && y.current && $a(g.current, y.current), y.current = null;
	}, [e.id]);
	let b = (e) => {
		try {
			sessionStorage.setItem(Za, e);
		} catch {}
		d(e);
	}, x = !s && e.type !== "component" && _("entries.components.create");
	return /* @__PURE__ */ H("div", {
		className: "flex h-full min-h-0 min-w-0 flex-col",
		"data-blocks-inspector": !0,
		children: [
			/* @__PURE__ */ H("div", {
				className: z("flex h-12 shrink-0 items-center gap-1 pr-3", t ? "pl-2 max-sm:pl-4" : "pl-4"),
				children: [
					t && /* @__PURE__ */ V(I, {
						icon: "arrow-left",
						label: n ? C("Back to {name}", { name: n }) : C("Back"),
						size: "sm",
						onClick: t,
						className: "max-sm:!hidden"
					}),
					/* @__PURE__ */ V(F, {
						name: e.type === "component" ? "symbol" : c?.icon ?? "square",
						size: 16,
						className: "ml-1 shrink-0 text-muted"
					}),
					m ? /* @__PURE__ */ V("div", {
						className: "min-w-0 flex-1 pl-1",
						onBlur: () => h(!1),
						onKeyUp: (e) => e.key === "Escape" && e.target.blur(),
						children: /* @__PURE__ */ V(Y, {
							bare: !0,
							fields: [{
								handle: "label",
								type: "text",
								size: "sm",
								commit: "blur",
								label: C("Name"),
								autofocus: !0,
								placeholder: c?.title
							}],
							values: { label: e.label ?? "" },
							onChange: (t, n) => i.updateNode(e.id, { label: n.trim() || void 0 })
						})
					}) : /* @__PURE__ */ V(M, {
						variant: "ghost",
						onDoubleClick: () => !s && h(!0),
						className: "min-w-0 flex-1 shrink !justify-start !bg-transparent !pl-1 !pr-0 text-left !font-semibold !text-ink",
						title: s ? void 0 : C("Double-Click to Rename"),
						children: /* @__PURE__ */ V("span", {
							className: "truncate",
							children: Ne(e, a, l)
						})
					}),
					/* @__PURE__ */ V(L, {
						align: "end",
						trigger: /* @__PURE__ */ V(I, {
							icon: "more",
							label: C("Block Actions"),
							size: "sm"
						}),
						items: [
							{
								label: C("Rename"),
								icon: "edit",
								disabled: s,
								onSelect: () => h(!0)
							},
							{
								label: C("Duplicate"),
								icon: "copy",
								shortcut: "mod+d",
								disabled: s,
								onSelect: () => i.duplicate(e.id)
							},
							x && {
								label: C("Make a Component"),
								icon: "symbol",
								onSelect: () => {
									i.selection().includes(e.id) || i.select(e.id), pt(i, f(i, a, o));
								}
							},
							!!t && !!n && window.matchMedia("(max-width: 639px)").matches && {
								label: C("{name} Details", { name: n }),
								icon: "sidebar",
								onSelect: t
							},
							{
								label: C("Copy ID"),
								icon: "hash",
								onSelect: () => void B(e.id, { copied: C("Copied {reference}", { reference: e.id }) })
							},
							{
								separator: !0,
								label: ""
							},
							{
								label: C("Delete"),
								icon: "trash",
								shortcut: "⌫",
								danger: !0,
								disabled: s,
								onSelect: () => i.remove(e.id)
							}
						]
					}),
					r && /* @__PURE__ */ V(I, {
						icon: "close",
						label: C("Close Panel"),
						size: "sm",
						onClick: r,
						className: "max-sm:in-[.cms-block-sheet]:hidden"
					})
				]
			}),
			/* @__PURE__ */ V("div", {
				className: "flex h-10 shrink-0 items-center gap-2 border-b border-border pl-4 pr-3",
				children: /* @__PURE__ */ V(he, {
					id: p,
					value: u,
					onChange: b,
					bordered: !1,
					size: "sm",
					className: "h-full min-w-0 flex-1",
					tabs: Xa.map((e) => ({
						value: e,
						label: {
							content: C("Content"),
							design: C("Design"),
							interact: C("Interact")
						}[e]
					}))
				})
			}),
			/* @__PURE__ */ V("fieldset", {
				ref: g,
				role: "tabpanel",
				id: `${p}-${u}-panel`,
				"aria-labelledby": `${p}-${u}`,
				disabled: s,
				className: "m-0 min-h-0 min-w-0 flex-1 overflow-y-auto border-0 p-0",
				children: /* @__PURE__ */ H(D, { children: [
					u === "design" && /* @__PURE__ */ V(ua, { node: e }),
					u === "content" && /* @__PURE__ */ V(Wr, { node: e }),
					u === "interact" && /* @__PURE__ */ H(Te, { children: [/* @__PURE__ */ V(Wa, { node: e }), /* @__PURE__ */ V(Ta, { node: e })] })
				] }, e.id)
			})
		]
	});
}
export { Ae as $, jn as A, fn as B, lr as C, Ln as D, Fn as E, yn as F, it as G, ln as H, Sn as I, Ze as J, nt as K, un as L, Cn as M, xn as N, An as O, bn as P, W as Q, hn as R, or as S, Vn as T, dt as U, dn as V, at as W, Fe as X, G as Y, Re as Z, vr as _, ki as a, Y as b, Zr as c, Fr as d, Ne as et, Ir as f, br as g, Or as h, Bi as i, Pe as it, Nn as j, Mn as k, Xr as l, Sr as m, Ii as n, Me as nt, Oi as o, Cr as p, tt as q, Ni as r, U as rt, yi as s, to as t, je as tt, Yr as u, hr as v, Jn as w, mr as x, pr as y, mn as z };
