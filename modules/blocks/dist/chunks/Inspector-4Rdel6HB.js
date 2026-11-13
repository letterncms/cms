import { c as e, f as t, i as n, m as r, n as i, o as a, p as o, r as s, s as c, t as l, u } from "./Inserter-CpCHuBqp.js";
import { a as d, c as f, d as p, f as m, g as h, h as g, i as _, l as v, m as y, n as b, o as x, p as S, r as ee, t as te, u as C, v as w, y as T } from "./insert-D8JHaZaj.js";
import { can as E, getManifest as ne, invalidate as D, navigate as re, plural as ie, registry as ae, requestText as oe, run as se, t as O, useAbility as k, useManifest as ce, useManifestIfLoaded as le } from "@letterncms/sdk";
import { Fragment as ue, createContext as de, createElement as A, forwardRef as fe, memo as pe, useCallback as me, useContext as j, useEffect as M, useId as he, useLayoutEffect as ge, useMemo as _e, useRef as N, useState as P, useSyncExternalStore as ve } from "react";
import { Button as F, Dialog as ye, Fields as be, Icon as I, IconButton as L, Menu as xe, NEW_COLOR as R, Notice as Se, PanelHeader as Ce, Popover as we, Pressable as z, QueryError as Te, Segmented as Ee, Spinner as De, Tabs as Oe, Tooltip as ke, cn as B, copyText as Ae, deviceWidths as je, fieldControlId as Me, fieldVisible as Ne, prompt as Pe, slugify as Fe, toast as Ie, useShortcutLabel as V, wideFieldTypes as Le } from "@letterncms/ui";
import { Fragment as Re, jsx as H, jsxs as U } from "react/jsx-runtime";
import { createPortal as ze, flushSync as Be } from "react-dom";
import { createRoot as W } from "react-dom/client";
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
	selection = () => We(this.state);
	extendTo(e) {
		let { selected: t, nodes: n, blockMode: r } = this.state, i = t ? m(n, t) : null, a = m(n, e);
		if (!t || !i || !a || i.parentId !== a.parentId) return this.select(e, r);
		this.set({ head: e === t ? null : e });
	}
	extend(e) {
		let { selected: t, head: n, nodes: r } = this.state, i = t ? m(r, t) : null;
		if (!t || !i) return;
		let a = h(r, i.parentId), o = a.findIndex((e) => e.id === (n ?? t)) + e;
		o >= 0 && o < a.length && this.extendTo(a[o].id);
	}
	removeSelection() {
		let e = this.selection();
		this.commit(e.reduce((e, t) => g(e, t), this.state.nodes)), this.set({
			selected: null,
			head: null
		});
	}
	replaceSelection(e) {
		let t = this.selection(), n = t[0] ? m(this.state.nodes, t[0]) : null;
		if (!n) return;
		let r = t.reduce((e, t) => g(e, t), this.state.nodes);
		this.commit(C(r, n.parentId, n.index, e)), this.set({
			selected: e[0]?.id ?? null,
			head: null
		});
	}
	hover = (e) => this.state.hovered !== e && this.set({ hovered: e });
	setBreakpoint = (e) => this.set({ breakpoint: e });
	setStyleState = (e) => this.set({ state: e });
	variant = () => He(this.state.breakpoint, this.state.state);
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
		this.commit(w(this.state.nodes, e, (e) => ({
			...e,
			props: {
				...e.props,
				...t
			}
		})), n || `props:${e}`);
	}
	updateNode(e, t, n = "") {
		this.commit(w(this.state.nodes, e, (e) => ({
			...e,
			...t
		})), n);
	}
	insert(e, t, n) {
		this.commit(C(this.state.nodes, e, t, n));
	}
	insertAfter(e, t) {
		if (!e) return this.insert(null, this.state.nodes.length, t);
		let n = m(this.state.nodes, e);
		if (!n) return this.insert(null, this.state.nodes.length, t);
		this.insert(n.parentId, n.index + 1, t);
	}
	remove(e) {
		this.commit(g(this.state.nodes, e)), this.state.selected === e && this.set({
			selected: null,
			head: null
		});
	}
	move(e, t, n) {
		this.commit(S(this.state.nodes, e, t, n));
	}
	moveTo(e, t, n) {
		let r = this.state.nodes;
		if (t && e.some((e) => e === t || d(r, t).some((t) => t.id === e))) return;
		let i = e.map((e) => f(r, e)).filter((e) => !!e), a = e.filter((e) => {
			let i = m(r, e);
			return i && i.parentId === t && i.index < n;
		}).length, o = C(e.reduce((e, t) => g(e, t), r), t, n - a, i);
		JSON.stringify(o) !== JSON.stringify(r) && this.commit(o);
	}
	nudge(e, t) {
		let n = m(this.state.nodes, e);
		if (!n) return;
		let r = h(this.state.nodes, n.parentId).length, i = n.index + t;
		i < 0 || i >= r || this.move(e, n.parentId, t > 0 ? i + 1 : i);
	}
	nudgeSelection(e) {
		let t = this.selection(), n = t[0] ? m(this.state.nodes, t[0]) : null, r = t.length ? m(this.state.nodes, t.at(-1)) : null;
		if (!n || !r || n.parentId !== r.parentId) return;
		let i = h(this.state.nodes, n.parentId).length;
		e < 0 && n.index === 0 || e > 0 && r.index === i - 1 || this.moveTo(t, n.parentId, e < 0 ? n.index - 1 : r.index + 2);
	}
	duplicate(e) {
		let t = f(this.state.nodes, e);
		if (!t) return;
		let n = x(t);
		this.insertAfter(e, [n]), this.select(n.id);
	}
	duplicateSelection() {
		let e = this.selection(), t = this.state.nodes, n = e.map((e) => f(t, e)).filter((e) => !!e).map(x), r = e.length ? m(t, e.at(-1)) : null;
		r && n.length && (this.insert(r.parentId, r.index + 1, n), this.select(n[0].id, !0), n.length > 1 && this.extendTo(n.at(-1).id));
	}
	wrap(e, t) {
		let n = f(this.state.nodes, e), r = m(this.state.nodes, e);
		if (!n || !r) return;
		let i = {
			...t,
			children: [n]
		};
		this.commit(C(g(this.state.nodes, e), r.parentId, r.index, [i])), this.select(i.id);
	}
	unwrap(e) {
		let t = f(this.state.nodes, e), n = m(this.state.nodes, e);
		t && n && t.children && this.commit(C(g(this.state.nodes, e), n.parentId, n.index, t.children));
	}
};
function He(e, t) {
	return e === "base" ? t || "base" : t ? `${e}:${t}` : e;
}
function Ue(e, t) {
	let n = e === "mobile" ? [
		"mobile",
		"tablet",
		"base"
	] : e === "tablet" ? ["tablet", "base"] : ["base"], r = [];
	if (t) for (let e of n) r.push(He(e, t));
	return r.push(...n), r;
}
function We(e) {
	if (!e.selected) return [];
	if (!e.head) return [e.selected];
	let t = m(e.nodes, e.selected);
	if (!t) return [e.selected];
	let n = h(e.nodes, t.parentId), r = n.findIndex((t) => t.id === e.selected), i = n.findIndex((t) => t.id === e.head);
	return i < 0 ? [e.selected] : n.slice(Math.min(r, i), Math.max(r, i) + 1).map((e) => e.id);
}
function Ge(e, t) {
	if (Object.is(e, t)) return !0;
	if (Array.isArray(e) && Array.isArray(t)) return e.length === t.length && e.every((e, n) => Object.is(e, t[n]));
	if (e && t && typeof e == "object" && typeof t == "object") {
		let n = Object.keys(e), r = Object.keys(t);
		return n.length === r.length && n.every((n) => Object.is(e[n], t[n]));
	}
	return !1;
}
function G(e, t) {
	let n = N(null);
	return ve(e.subscribe, () => {
		let r = t(e.get());
		return n.current && Ge(n.current.value, r) ? n.current.value : (n.current = { value: r }, r);
	});
}
// admin/src/core/uniqueIds.ts
function Ke(e, t) {
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
function qe(e, t, n) {
	let r = N(t);
	r.current = t;
	let [i] = P(() => new Ve(Ke(Array.isArray(e) ? e : [], T), (e) => r.current(e), n)), a = N(e);
	return i.setReadOnly(n), M(() => {
		if (a.current === e) return;
		a.current = e;
		let t = Ke(Array.isArray(e) ? e : [], T);
		JSON.stringify(t) !== JSON.stringify(i.get().nodes) && i.reset(t);
	}, [i, e]), i;
}
// admin/src/core/caret.ts
function Je(e = document) {
	return e.getSelection()?.isCollapsed ?? !0;
}
function Ye(e, t) {
	let n = e.ownerDocument.getSelection();
	if (!n || n.rangeCount === 0) return null;
	let r = n.getRangeAt(0);
	if (!e.contains(r.startContainer)) return null;
	let i = e.ownerDocument.createRange();
	return i.selectNodeContents(e), t ? i.setEnd(r.startContainer, r.startOffset) : i.setStart(r.endContainer, r.endOffset), i;
}
function Xe(e) {
	return e ? e.toString().replace(/​/g, "") : "";
}
function Ze(e) {
	return Je(e.ownerDocument) && Xe(Ye(e, !0)) === "" && !$e(Ye(e, !0)).includes("<br");
}
function Qe(e) {
	return Je(e.ownerDocument) && Xe(Ye(e, !1)) === "";
}
function $e(e) {
	if (!e) return "";
	let t = e.startContainer.ownerDocument.createElement("div");
	return t.appendChild(e.cloneContents()), t.innerHTML;
}
function et(e) {
	return Xe(Ye(e, !0)).length;
}
function tt(e) {
	let t = Ye(e, !0), n = Ye(e, !1);
	return [$e(t), $e(n)];
}
function nt(e) {
	let t = q(e.ownerDocument);
	return !t || t.top - e.getBoundingClientRect().top < K(e) * .8;
}
function rt(e) {
	let t = q(e.ownerDocument);
	return !t || e.getBoundingClientRect().bottom - t.bottom < K(e) * .8;
}
function K(e) {
	let t = parseFloat(e.ownerDocument.defaultView.getComputedStyle(e).lineHeight);
	return Number.isFinite(t) ? t : 20;
}
function q(e = document) {
	let t = e.getSelection();
	if (!t || t.rangeCount === 0) return null;
	let n = t.getRangeAt(0).cloneRange(), r = n.getClientRects();
	if (r.length > 0) return r[0];
	let i = e.createElement("span");
	i.textContent = "​", n.insertNode(i);
	let a = i.getBoundingClientRect();
	return i.remove(), a;
}
function it(e, t) {
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
function at(e) {
	let t = document.createElement("div");
	return t.innerHTML = e, (t.textContent ?? "").length;
}
function ot(e) {
	return e.replace(/\u200B/g, "").replace(/<(\/?)strike>/g, "<$1s>").replace(/<(\/?)b>/g, "<$1strong>").replace(/<(\/?)i>/g, "<$1em>").replace(/<div><br><\/div>/g, "<br>").replace(/<\/?(div|p|span)[^>]*>/g, "").replace(/ style="[^"]*"/g, "").replace(/&nbsp;/g, " ").replace(/<br>$/, "");
}
var st = [
	["**", "strong"],
	["__", "strong"],
	["~~", "s"],
	["`", "code"],
	["*", "em"],
	["_", "em"]
];
function ct(e = document) {
	let t = e.getSelection();
	if (!t || !t.isCollapsed || t.rangeCount === 0) return !1;
	let n = t.anchorNode;
	if (!n || n.nodeType !== Node.TEXT_NODE || n.parentElement?.closest("code")) return !1;
	let r = t.anchorOffset, i = (n.textContent ?? "").slice(0, r);
	for (let [a, o] of st) {
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
function lt() {
	let { store: e } = o(), t = G(e, (e) => e.nodes), n = /* @__PURE__ */ new Map(), r = [];
	for (let { node: e } of v(t)) {
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
function J({ html: e, onChange: t, tag: n = "div", placeholder: r, className: i = "", focus: a, onKeyDown: o, onFocus: s, onPaste: c, disabled: l, singleLine: u, quiet: d, plainText: f }) {
	let p = N(null), m = N(e);
	ge(() => {
		let t = p.current;
		t && (t.ownerDocument.activeElement === t ? m.current = e : (ot(t.innerHTML) !== e && (t.innerHTML = e), m.current = ot(t.innerHTML)));
	}, [e]), ge(() => {
		a && p.current && it(p.current, a.at);
	}, [a?.nonce]);
	let h = () => {
		let e = p.current;
		if (!e) return;
		let n = ot(e.innerHTML);
		n !== m.current && (m.current = n, t(n, e));
	};
	return A(n, {
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
			!f && t.inputType === "insertText" && t.data && /[*_~`]/.test(t.data) && ct(e.currentTarget.ownerDocument), h();
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
			}[e.key.toLowerCase()]), h()) : n && e.shiftKey && e.key.toLowerCase() === "x" ? (e.preventDefault(), t.execCommand("strikeThrough"), h()) : n && e.key.toLowerCase() === "k" ? (e.preventDefault(), e.stopPropagation(), p.current?.ownerDocument.dispatchEvent(new CustomEvent("cms:link"))) : n && e.key.toLowerCase() === "e" ? (e.preventDefault(), ut("code", t), h()) : e.key === "Enter" && e.shiftKey && !u ? (e.preventDefault(), t.execCommand("insertLineBreak"), h()) : p.current && o?.(e, p.current);
		},
		onPaste: (e) => {
			e.preventDefault();
			let t = e.currentTarget.ownerDocument, n = e.clipboardData.getData("text/plain");
			!f && /^(https?:\/\/|mailto:)\S+$/i.test(n.trim()) && !t.getSelection()?.isCollapsed ? (t.execCommand("createLink", !1, n.trim()), h()) : p.current && c?.(n, p.current) || (t.execCommand("insertText", !1, u ? n.replace(/\s*\n\s*/g, " ") : n), h());
		},
		onBlur: () => h()
	});
}
function ut(e, t = document) {
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
function dt(e) {
	return {
		...e,
		type: "url",
		component: "link"
	};
}
// admin/src/core/FormatToolbar.tsx
function ft({ root: e = document, offset: t }) {
	let [n, r] = P(null), [i, a] = P({}), [o, s] = P(!1), [c, l] = P(""), u = N(null), d = N(null), f = N(() => {}), p = lt();
	if (M(() => {
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
		ut(t, e), d.current?.dispatchEvent(new Event("input", { bubbles: !0 })), e.dispatchEvent(new Event("selectionchange"));
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
	}, v = (e, t, n, r) => /* @__PURE__ */ H(ke, {
		content: t,
		shortcut: n,
		children: /* @__PURE__ */ H(z, {
			compact: !0,
			"aria-label": t,
			"aria-pressed": !!i[e] || e === "link" && o,
			onMouseDown: (e) => e.preventDefault(),
			onClick: r,
			className: B("grid size-7 place-items-center rounded-xs hover:bg-white/12 hover:text-ink-contrast", i[e] || e === "link" && o ? "bg-white/14 text-ink-contrast" : "text-ink-contrast/75"),
			children: /* @__PURE__ */ H(I, {
				name: e,
				size: 14
			})
		})
	}, e), y = () => {
		s(!1);
		let t = d.current, n = e.getSelection();
		t && u.current && n && (t.focus({ preventScroll: !0 }), n.removeAllRanges(), n.addRange(u.current));
	}, b = dt({
		handle: "url",
		label: O("Link"),
		size: "sm",
		autofocus: !0,
		anchors: p,
		placeholder: O("Paste a link or search pages"),
		onClose: y
	});
	return ze(/* @__PURE__ */ U("div", {
		className: "fixed z-overlay flex -translate-x-1/2 -translate-y-full items-center gap-0.5 rounded-md bg-ink p-1 shadow-pop",
		style: {
			left: n.x,
			top: n.y - 8
		},
		onMouseDown: (e) => !o && e.preventDefault(),
		onKeyDown: (e) => e.key === "Escape" && y(),
		children: [
			v("bold", O("Bold"), "mod+b", () => m("bold")),
			v("italic", O("Italic"), "mod+i", () => m("italic")),
			v("underline", O("Underline"), "mod+u", () => m("underline")),
			v("strike", O("Strikethrough"), "mod+shift+x", () => m("strikeThrough")),
			v("code", O("Code"), "mod+e", () => h("code")),
			/* @__PURE__ */ H("span", { className: "mx-0.5 h-4 w-px bg-white/15" }),
			v("link", O("Link"), "mod+k", g),
			o && /* @__PURE__ */ H("div", {
				className: "pointer-events-none absolute inset-0 opacity-0",
				"aria-hidden": !0,
				children: /* @__PURE__ */ H(be, {
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
function pt(e, t, n = "component") {
	let r = e.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 56) || n, i = r;
	for (let e = 2; t.has(i); e++) i = `${r}-${e}`;
	return i;
}
var mt = [
	"Heroes",
	"Text",
	"Media",
	"Features",
	"People",
	"Lists",
	"Calls to Action",
	"Pages"
];
function ht(e) {
	let t = document.createElement("div");
	document.body.appendChild(t);
	let n = W(t);
	n.render(e(() => setTimeout(() => {
		n.unmount(), t.remove();
	}, 250)));
}
function gt(e) {
	return e.selection().map((t) => f(e.get().nodes, t)).filter((e) => !!e);
}
function _t(e) {
	let t = gt(e);
	t.length !== 0 && ht((n) => {
		function r() {
			let [r, i] = P(!0), [a, o] = P({
				title: "",
				category: "",
				description: ""
			}), [s, c] = P(!1), l = () => {
				i(!1), n();
			}, u = async () => {
				let n = a.title.trim();
				if (n) {
					c(!0);
					try {
						let r = await se("components/list"), i = pt(n, new Set(r.map((e) => e.handle)));
						await se("components/save", {
							handle: i,
							title: n,
							description: a.description.trim(),
							category: a.category.trim() || void 0,
							blocks: t
						}), D("components/"), e.replaceSelection([{
							id: T(),
							type: "component",
							props: { ref: i }
						}]), Ie.success(O("“{title}” is now a component", { title: n })), l();
					} catch (e) {
						Ie.error(e), c(!1);
					}
				}
			};
			return /* @__PURE__ */ H(ye, {
				open: r,
				onOpenChange: (e) => !e && l(),
				size: "sm",
				title: O("Make a Component"),
				description: ie(t.length, "{count} block, the same on every page", "{count} blocks, the same on every page"),
				onSubmit: () => void u(),
				submitLabel: O("Make Component"),
				submitDisabled: !a.title.trim(),
				busy: s,
				children: /* @__PURE__ */ H(be, {
					fields: [
						{
							handle: "title",
							type: "text",
							label: O("Name"),
							required: !0,
							autofocus: !0,
							max: 120,
							placeholder: O("Pricing Card")
						},
						{
							handle: "category",
							type: "text",
							label: O("Category"),
							max: 60,
							placeholder: O("Components")
						},
						{
							handle: "description",
							type: "text",
							label: O("Description"),
							max: 500,
							placeholder: O("When to Use It")
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
function vt(e) {
	let t = gt(e);
	t.length !== 0 && ht((e) => {
		function n() {
			let [n, r] = P(!0), [i, a] = P({
				title: "",
				category: "",
				description: ""
			}), [o, s] = P(!1), c = () => {
				r(!1), e();
			}, l = async () => {
				let e = i.title.trim();
				if (e) {
					s(!0);
					try {
						let n = await se("patterns/list", { working: !0 }), r = pt(e, new Set(n.map((e) => e.handle)), "pattern");
						await se("patterns/save", {
							handle: r,
							title: e,
							description: i.description.trim(),
							category: i.category.trim() || void 0,
							blocks: t
						}), D("patterns/"), Ie.success(O("Saved “{title}” as a pattern", { title: e })), c();
					} catch (e) {
						Ie.error(e), s(!1);
					}
				}
			};
			return /* @__PURE__ */ H(ye, {
				open: n,
				onOpenChange: (e) => !e && c(),
				size: "sm",
				title: O("Save as Pattern"),
				description: ie(t.length, "{count} block to start from on any page", "{count} blocks to start from on any page"),
				onSubmit: () => void l(),
				submitLabel: O("Save Pattern"),
				submitDisabled: !i.title.trim(),
				busy: o,
				children: /* @__PURE__ */ H(be, {
					fields: [
						{
							handle: "title",
							type: "text",
							label: O("Name"),
							required: !0,
							autofocus: !0,
							max: 120,
							placeholder: O("Hero With Photo")
						},
						{
							handle: "category",
							type: "text",
							label: O("Category"),
							max: 60,
							placeholder: O("Heroes"),
							suggestions: mt
						},
						{
							handle: "description",
							type: "text",
							label: O("Description"),
							max: 500,
							placeholder: O("When to Use It")
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
var yt = "Pages";
function bt(e) {
	let t = k("patterns/list", { category: yt }, {
		enabled: e,
		staleTime: 6e4
	});
	return e ? t.data ?? [] : [];
}
function xt({ open: t, onOpenChange: n, patterns: r, onChoose: i }) {
	return /* @__PURE__ */ H(ye, {
		open: t,
		onOpenChange: n,
		size: "lg",
		title: O("Start From a Pattern"),
		children: /* @__PURE__ */ H("div", {
			className: "grid gap-4 sm:grid-cols-2",
			children: r.map((t) => /* @__PURE__ */ U(z, {
				onClick: () => i(t),
				className: "block min-w-0 rounded-md p-1 text-left hover:bg-hover",
				children: [
					/* @__PURE__ */ H(e, {
						handle: t.handle,
						maxHeight: 280
					}),
					/* @__PURE__ */ H("span", {
						className: "mt-2 block truncate text-sm font-medium text-text",
						children: t.title
					}),
					t.description && /* @__PURE__ */ H("span", {
						className: "mt-0.5 line-clamp-2 block text-xs text-muted",
						children: t.description
					})
				]
			}, t.handle))
		})
	});
}
// admin/src/core/insertionTargets.ts
var St = 4, Ct = 6, wt = 16, Tt = (e) => e.left + e.width, Et = (e) => e.top + e.height, Dt = (e, t) => t === "x" ? e.left + e.width / 2 : e.top + e.height / 2, Ot = (e, t) => t === "x" ? e.left : e.top, kt = (e, t) => t === "x" ? Tt(e) : Et(e), At = (e) => [
	e.left,
	e.top,
	e.width,
	e.height
].every(Number.isFinite) && e.width > 0 && e.height >= 0, jt = (e, t) => t.x >= e.left && t.x <= Tt(e) && t.y >= e.top && t.y <= Et(e);
function Mt(e, t) {
	return Math.hypot(Math.max(e.left - t.x, 0, t.x - Tt(e)), Math.max(e.top - t.y, 0, t.y - Et(e)));
}
function Nt(e, t) {
	return Math.min(Et(e), Et(t)) - Math.max(e.top, t.top) > 0 && Math.abs(Dt(t, "x") - Dt(e, "x")) > Math.abs(Dt(t, "y") - Dt(e, "y")) ? "x" : "y";
}
function Pt(e, t, n) {
	let r = Math.min(Et(e), Et(t)) - Math.max(e.top, t.top), i = Math.min(Tt(e), Tt(t)) - Math.max(e.left, t.left);
	return n === "x" && r > 0 ? "x" : n === "y" && i > 0 ? "y" : Nt(e, t);
}
function Ft(e, t) {
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
function It(e, t) {
	let { byId: n, depth: r, isExcluded: i } = Ft(e, t.excludeIds), a = /* @__PURE__ */ new Map([[null, []]]);
	for (let t of e) {
		if (!At(t.rect) || !t.container && t.rect.height === 0 || i(t)) continue;
		let e = a.get(t.parentId) ?? [];
		e.push(t), a.set(t.parentId, e), t.container && !a.has(t.id) && a.set(t.id, []);
	}
	let o = [];
	for (let [e, i] of a) {
		let a = e === null ? null : n.get(e), s = e === null ? t.rootRect : a?.rect;
		if (!s || !At(s)) continue;
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
			let f = Math.sign(i - r), p = Math.min(Math.abs(i - r) / 2, St), m = l === "from" ? r + f * p : l === "to" ? i - f * p : (r + i) / 2, h = Math.min(r, i), g = Math.abs(i - r), _ = n === "x" ? {
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
				width: Math.max(Tt(e), Tt(t)) - n,
				height: Math.max(Et(e), Et(t)) - r
			};
		}, m = c[0], h = c.at(-1), g = c.length > 1 ? Pt(m.rect, c[1].rect, l) : l ?? "y", _ = c.length > 1 ? Pt(c.at(-2).rect, h.rect, l) : l ?? "y", v = c.length < 2 || Dt(c[1].rect, g) >= Dt(m.rect, g), y = c.length < 2 || Dt(h.rect, _) >= Dt(c.at(-2).rect, _), b = v ? Ot(m.rect, g) : kt(m.rect, g), x = y ? kt(h.rect, _) : Ot(h.rect, _);
		f(m.index, g, v ? Ot(s, g) : kt(s, g), b, g === "x" ? m.rect : s, m.rect, "edge", "to");
		for (let e = 1; e < c.length; e++) {
			let t = c[e - 1], n = c[e], r = Pt(t.rect, n.rect, l), i = Dt(n.rect, r) >= Dt(t.rect, r), a = i ? kt(t.rect, r) : Ot(t.rect, r), o = i ? Ot(n.rect, r) : kt(n.rect, r), u = Math.max(t.rect.top, n.rect.top), d = Math.min(Et(t.rect), Et(n.rect)), m = r === "x" ? {
				left: s.left,
				top: u,
				width: s.width,
				height: Math.max(0, d - u)
			} : s, h = i ? o < a : o > a;
			f(n.index, r, h ? (a + o) / 2 : a, h ? (a + o) / 2 : o, m, r === "x" && m.height > 0 ? m : p(t.rect, n.rect), "between");
		}
		f(h.index + 1, _, x, y ? kt(s, _) : Ot(s, _), _ === "x" ? h.rect : s, h.rect, "edge", "from");
	}
	return o;
}
function Lt(e, t, n) {
	if (![t.x, t.y].every(Number.isFinite)) return null;
	let r = It(e, n).flatMap((e) => {
		if (e.inside) return [];
		let n = e.axis === "x", r = n ? t.x : t.y, i = n ? t.y : t.x, a = (n ? e.rect.left : e.rect.top) + 1, o = n ? e.hitRect.left : e.hitRect.top, s = n ? e.hitRect.width : e.hitRect.height, c = Math.max(0, Ct - s / 2), l = Math.max(o - c, a - wt), u = Math.min(o + s + c, a + wt), d = n ? e.hitRect.top : e.hitRect.left, f = d + (n ? e.hitRect.height : e.hitRect.width);
		return r >= l && r <= u && i >= d && i <= f ? [{
			target: e,
			distance: Math.abs(r - a)
		}] : [];
	});
	if (!r.length) return null;
	let i = Math.min(...r.map((e) => e.distance));
	return r.filter((e) => e.distance <= i + 2).sort((e, t) => Number(e.target.kind === "edge") - Number(t.target.kind === "edge") || t.target.depth - e.target.depth || e.distance - t.distance)[0].target;
}
function Rt(e, t, n) {
	if (![t.x, t.y].every(Number.isFinite)) return null;
	let { isExcluded: r } = Ft(e, n.excludeIds);
	return e.some((e) => r(e) && jt(e.rect, t)) ? null : It(e, n).map((e) => ({
		target: e,
		distance: Mt(e.inside ? e.hitRect : e.rect, t)
	})).filter(({ distance: e }) => e <= (n.maxDistance ?? 80)).sort((e, t) => e.distance - t.distance || t.target.depth - e.target.depth)[0]?.target ?? null;
}
// admin/src/core/QuickInserter.tsx
var zt = "cms:blocks:recent", Bt = [
	"paragraph",
	"heading",
	"image",
	"list",
	"button",
	"box"
], Vt = 6, Ht = 9, Ut = 3;
function Wt() {
	try {
		let e = JSON.parse(localStorage.getItem(zt) ?? "[]");
		return Array.isArray(e) ? e.filter((e) => typeof e == "string") : [];
	} catch {
		return [];
	}
}
function Gt(e) {
	if (e.kind === "block") try {
		localStorage.setItem(zt, JSON.stringify([e.type.name, ...Wt().filter((t) => t !== e.type.name)].slice(0, 12)));
	} catch {}
}
function Kt({ types: e, allowed: t, onChoose: r, onClose: o }) {
	let [c, u] = P(""), [d, f] = P(!1), [p, m] = P(0), { items: h } = a(e, c, t, !!c.trim()), g = _e(() => {
		if (c.trim()) return h.slice(0, Ht);
		let e = [...Wt(), ...Bt], t = (t) => {
			let n = t.kind === "block" ? e.indexOf(t.type.name) : -1;
			return n < 0 ? e.length : n;
		};
		return h.filter((e) => e.kind === "block").sort((e, n) => t(e) - t(n)).slice(0, Vt);
	}, [h, c]);
	M(() => m(0), [c]);
	let _ = (e) => {
		Gt(e), r(e);
	};
	return d ? /* @__PURE__ */ H("div", {
		"data-cms-insert-menu": !0,
		"data-cms-browse": !0,
		children: /* @__PURE__ */ H(l, {
			types: e,
			query: c,
			onQuery: u,
			allowed: t,
			onChoose: _,
			onClose: o
		})
	}) : /* @__PURE__ */ U("div", {
		"data-cms-insert-menu": !0,
		className: "flex w-[300px] flex-col",
		onKeyDown: (e) => {
			let t = {
				ArrowRight: 1,
				ArrowLeft: -1,
				ArrowDown: Ut,
				ArrowUp: -3
			}[e.key];
			t && g.length ? (e.preventDefault(), m((e) => Math.max(0, Math.min(g.length - 1, e + t)))) : e.key === "Enter" && g[p] ? (e.preventDefault(), _(g[p])) : e.key === "Escape" && (e.preventDefault(), o());
		},
		children: [
			/* @__PURE__ */ H("div", {
				className: "p-2 pb-0",
				children: /* @__PURE__ */ H(be, {
					bare: !0,
					fields: [{
						handle: "query",
						type: "text",
						label: O("Search"),
						icon: "search",
						size: "sm",
						autofocus: !0,
						placeholder: O("Search Blocks")
					}],
					values: { query: c },
					onChange: (e, t) => u(t ?? "")
				})
			}),
			/* @__PURE__ */ U("div", {
				role: "listbox",
				"aria-label": c.trim() ? O("Results") : O("Suggestions"),
				className: "grid grid-cols-3 gap-1 p-2",
				children: [g.map((e, t) => {
					let r = n(e), a = i(e);
					return /* @__PURE__ */ U(F, {
						variant: "ghost",
						role: "option",
						"aria-selected": t === p,
						"data-index": t,
						onMouseMove: () => t !== p && m(t),
						onMouseDown: (e) => e.preventDefault(),
						onClick: () => _(e),
						"data-active": t === p || void 0,
						className: "!h-[68px] min-w-0 shrink !flex-col !gap-1.5 !px-1",
						children: [/* @__PURE__ */ H(I, {
							name: a,
							size: 20
						}), /* @__PURE__ */ H("span", {
							className: "w-full truncate text-center text-xs font-medium",
							children: r
						})]
					}, s(e));
				}), !g.length && /* @__PURE__ */ H("div", {
					className: "col-span-3 px-3 py-5 text-center text-xs text-faint",
					children: O("No matching blocks")
				})]
			}),
			/* @__PURE__ */ U(F, {
				variant: "ghost",
				size: "lg",
				onMouseDown: (e) => e.preventDefault(),
				onClick: () => f(!0),
				className: "!h-9 !gap-1.5 !rounded-none border-t border-border !text-sm focus-visible:!-outline-offset-2",
				children: [O("Browse All"), /* @__PURE__ */ H(I, {
					name: "arrow-right",
					size: 14,
					className: "text-muted"
				})]
			})
		]
	});
}
// admin/src/core/canvas.ts
function qt(e, t) {
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
function Jt(e, t) {
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
var Yt = { weight: "font-weight" }, Xt = "/_cms/site/";
function Zt(e, t = location.href) {
	try {
		let n = new URL(e, t);
		return n.origin === location.origin && n.pathname.startsWith(Xt) ? n.pathname : null;
	} catch {
		return null;
	}
}
var Qt = /\bimport\s*(?:[\w$*{}\s,]+?\s*from\s*)?["']([^"']+)["']|\bexport\s*[\w$*{}\s,]*?\s*from\s*["']([^"']+)["']|\bimport\s*\(\s*["']([^"']+)["']\s*\)/g;
async function $t(e, t) {
	let n = {}, r = {}, i = /* @__PURE__ */ new Set(), a = async (e) => {
		if (i.has(e) || i.size > 200) return;
		i.add(e);
		let o = await fetch(e, { credentials: "same-origin" }).then((e) => e.ok ? e.text() : "", () => ""), s = [];
		for (let i of o.matchAll(Qt)) {
			let a = i[1] ?? i[2] ?? i[3], o = /^(\/|\.\/|\.\.\/)/.test(a), c = o ? Zt(a, location.origin + e) : a, l = c ? Zt(t.imports?.[c] ?? (o ? c : "")) : null;
			c && l && (t.imports?.[c] && (n[c] = l), t.integrity?.[l] && (r[l] = t.integrity[l]), s.push(l));
		}
		await Promise.all(s.map(a));
	};
	return await a(e), {
		imports: n,
		...Object.keys(r).length ? { integrity: r } : {}
	};
}
async function en(e, t) {
	let n;
	try {
		n = JSON.parse(e.querySelector("script[data-cms-importmap]")?.textContent ?? "{}");
	} catch {
		return null;
	}
	let r = await $t(t, n);
	if (!Object.keys(r.imports ?? {}).length) return null;
	let i = document.createElement("script");
	return i.type = "importmap", i.dataset.cmsCanvas = "", i.nonce = document.querySelector("script[nonce]")?.nonce ?? "", i.textContent = JSON.stringify(r), document.head.append(i), i;
}
function tn(e) {
	try {
		return JSON.parse(e.dataset.cmsCanvas ?? "[]").flatMap((e) => {
			let t = typeof e?.src == "string" ? Zt(e.src) : null;
			return t ? [{
				...e,
				src: t
			}] : [];
		});
	} catch {
		return [];
	}
}
var nn = (e, t) => console.error("[cms] canvas behavior", e, t);
function rn() {
	let e = [], t = [];
	async function n(e, n, r) {
		let i = r.defaultView;
		if (i) try {
			let a = await en(r, n.src);
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
			let s = () => i.getComputedStyle(e.el), c = {
				token: (e) => {
					let t = e.indexOf("."), n = e.slice(0, t);
					return s().getPropertyValue(`--${Yt[n] ?? n}-${e.slice(t + 1)}`).trim();
				},
				reducedMotion: i.matchMedia("(prefers-reduced-motion: reduce)").matches,
				signal: e.abort.signal,
				canvas: !0,
				window: i,
				document: r
			}, l = o.mount ?? o.default, u = await qt(i, () => l?.(e.el, n.props ?? {}, c));
			if (e.abort.signal.aborted) {
				typeof u == "function" && u();
				return;
			}
			typeof u == "function" && (e.cleanup = u), e.unpicture = Jt(e.el, i);
		} catch (e) {
			nn(n.src, e);
		}
	}
	return {
		mount(t) {
			for (let r of t.querySelectorAll("[data-cms-canvas]")) for (let i of tn(r)) {
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
					nn(e.module ? "unmount" : "mount", t);
				}
			}
			t.forEach((e) => e.remove()), t = [];
		}
	};
}
// admin/src/core/morph.ts
function an(e, t) {
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
function on(e) {
	let t = N(e);
	t.current = e;
	let [n, r] = P(null), i = N(null), a = N(() => {});
	return M(() => {
		e.disabled && a.current();
	}, [e.disabled]), M(() => () => a.current(), []), {
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
var sn = 32, cn = 6, ln = 4;
function un({ target: e, position: t, ...n }) {
	let r = t(e.rect);
	return /* @__PURE__ */ U(Re, { children: [/* @__PURE__ */ H("div", {
		"data-cms-insertion-line": !0,
		className: B("pointer-events-none absolute z-raised rounded-full bg-focus", e.axis === "x" ? "cms-block-line-y" : "cms-block-line-x"),
		style: {
			...r,
			minWidth: 2,
			minHeight: 2
		}
	}), /* @__PURE__ */ H(pn, {
		...n,
		label: O("Insert Block"),
		className: "cms-block-plus absolute size-6 -translate-x-1/2 -translate-y-1/2 rounded-xs bg-signal text-signal-ink shadow-sm",
		style: {
			left: r.left + r.width / 2,
			top: r.top + r.height / 2
		},
		data: { "data-cms-inserter": `${e.parentId ?? ""}:${e.index}` }
	})] });
}
function dn({ target: e, position: t, ...n }) {
	let r = t(e.hitRect);
	return /* @__PURE__ */ H(pn, {
		...n,
		label: O("Insert Block"),
		className: "cms-block-chrome absolute size-7 -translate-x-1/2 -translate-y-1/2 rounded-sm border border-border-strong bg-bg text-muted shadow-sm hover:border-focus hover:text-focus",
		style: {
			left: r.left + r.width / 2,
			top: r.top + Math.min(r.height / 2, 40)
		},
		data: { "data-cms-appender": e.parentId ?? "" }
	});
}
function fn({ target: e, position: t, onWrite: n, onPattern: r, ...i }) {
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
				children: O("Write, or press “/” for blocks")
			}),
			r && /* @__PURE__ */ U(Re, { children: [/* @__PURE__ */ H("span", { className: "mx-1 h-4 border-l border-border" }), /* @__PURE__ */ H(z, {
				compact: !0,
				onClick: r,
				className: "cms-focus-ring h-8 rounded-xs px-1 text-sm text-muted hover:text-text",
				children: O("Start From a Pattern")
			})] }),
			/* @__PURE__ */ H(pn, {
				...i,
				label: O("Insert Block"),
				className: "size-8 rounded-xs text-muted hover:bg-hover hover:text-text"
			})
		]
	});
}
function pn({ open: e, onOpenChange: t, returnFocus: n, children: r, label: i, className: a, style: o, data: s }) {
	return /* @__PURE__ */ H(we, {
		open: e,
		onOpenChange: t,
		side: "bottom",
		align: "center",
		className: "!overflow-hidden !p-0",
		returnFocus: n,
		trigger: /* @__PURE__ */ H(z, {
			compact: !0,
			...s,
			"aria-label": e ? O("Close") : i,
			"aria-expanded": e,
			className: B("cms-focus-ring pointer-events-auto z-drag grid place-items-center", a),
			style: o,
			children: /* @__PURE__ */ H(I, {
				name: "plus",
				size: 14,
				className: B("cms-block-plus-icon", e && "rotate-45")
			})
		}),
		children: e && r
	});
}
function mn({ id: e, label: t, icon: n, parent: r, box: i, viewport: a, canMoveUp: o, canMoveDown: s, onSelectParent: c, onDrag: l, onMove: u, onInsert: d, onDuplicate: f, onMakeComponent: p, onSavePattern: m, onDelete: h, covers: g }) {
	let _ = N(null), [v, y] = P(240);
	ge(() => {
		_.current && y(_.current.offsetWidth);
	});
	let b = i.top + i.height;
	if (b < 40 || i.top > a.height - sn || i.left > a.width || i.left + i.width < 0) return null;
	let x = (e) => Math.max(ln, Math.min(a.width - v - ln, e)), S = x(i.left), ee = x(i.left + i.width - v), te = i.top - sn - cn, C = b + cn, w = Math.max(ln, i.top + ln), T = (e) => e >= ln && e + sn <= a.height - ln, { left: E, top: ne } = [
		te,
		C,
		w
	].flatMap((e) => [{
		left: S,
		top: e
	}, {
		left: ee,
		top: e
	}]).find((e) => T(e.top) && !g?.({
		...e,
		width: v,
		height: sn
	})) ?? {
		left: S,
		top: T(te) ? te : w
	};
	return /* @__PURE__ */ U("div", {
		ref: _,
		"data-cms-block-controls": e,
		role: "toolbar",
		"aria-label": O("Block Actions"),
		className: "cms-block-chrome pointer-events-auto absolute z-bar flex h-8 items-center gap-0.5 rounded-sm border border-border bg-bg pl-0.5 pr-1 shadow-pop",
		style: {
			left: E,
			top: ne
		},
		children: [
			/* @__PURE__ */ H(z, {
				compact: !0,
				"aria-label": O("Drag to Reorder"),
				title: O("Drag to Reorder"),
				className: "cms-focus-ring grid h-6 w-4 touch-none cursor-grab place-items-center rounded-xs text-faint hover:bg-hover hover:text-muted active:cursor-grabbing",
				onPointerDown: l,
				children: /* @__PURE__ */ H(I, {
					name: "drag",
					size: 12
				})
			}),
			r && /* @__PURE__ */ H(ke, {
				content: O("Select {block}", { block: r.label }),
				children: /* @__PURE__ */ H(L, {
					size: "xs",
					icon: "arrow-elbow-left-up",
					label: O("Select {block}", { block: r.label }),
					onClick: c
				})
			}),
			/* @__PURE__ */ H("span", { className: "mx-0.5 h-4 border-l border-border" }),
			/* @__PURE__ */ U("span", {
				className: "flex h-6 max-w-40 items-center gap-1.5 px-1 text-xs font-medium text-text",
				children: [/* @__PURE__ */ H(I, {
					name: n,
					size: 14,
					className: "shrink-0 text-muted"
				}), /* @__PURE__ */ H("span", {
					className: "truncate",
					children: t
				})]
			}),
			/* @__PURE__ */ H(L, {
				size: "xs",
				icon: "chevron-up",
				label: O("Move Up"),
				disabled: !o,
				onClick: () => u(-1)
			}),
			/* @__PURE__ */ H(L, {
				size: "xs",
				icon: "chevron-down",
				label: O("Move Down"),
				disabled: !s,
				onClick: () => u(1)
			}),
			/* @__PURE__ */ H("span", { className: "mx-0.5 h-4 border-l border-border" }),
			/* @__PURE__ */ H(xe, {
				align: "end",
				trigger: /* @__PURE__ */ H(L, {
					size: "xs",
					icon: "more",
					label: O("More Block Actions")
				}),
				items: [
					{
						label: O("Insert Before"),
						icon: "arrow-up",
						shortcut: "alt+mod+t",
						onSelect: () => d("before")
					},
					{
						label: O("Insert After"),
						icon: "arrow-down",
						shortcut: "alt+mod+y",
						onSelect: () => d("after")
					},
					{
						label: O("Duplicate"),
						icon: "duplicate",
						shortcut: "mod+d",
						onSelect: f
					},
					p && {
						label: O("Make a Component"),
						icon: "symbol",
						onSelect: p
					},
					m && {
						label: O("Save as Pattern"),
						icon: "section-copy",
						onSelect: m
					},
					{
						separator: !0,
						label: ""
					},
					{
						label: O("Delete"),
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
function hn({ drag: e, position: t }) {
	return /* @__PURE__ */ U(Re, { children: [
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
var gn = new EventTarget(), _n = {
	emit(e, t) {
		gn.dispatchEvent(new CustomEvent(e, { detail: t }));
	},
	on(e, t) {
		let n = (e) => t(e.detail);
		return gn.addEventListener(e, n), () => gn.removeEventListener(e, n);
	}
}, vn = de({
	stops: () => [],
	settings: () => {},
	readOnly: !1
}), yn = () => j(vn);
function bn(e = "") {
	return {
		id: T(),
		type: "paragraph",
		props: { text: e }
	};
}
function xn(e, t, n, r) {
	return e.id === t && e.prop === n && (r === void 0 || e.index === r);
}
function Sn(e, t, n) {
	e.focus(t.id, n, t.prop, t.index);
}
function Cn(e, t, n) {
	if (!t) return;
	let r = /* @__PURE__ */ new Set(), i = (e) => {
		r.add(e.id), e.children?.forEach(i);
	};
	i(t);
	let a = n.find((e) => r.has(e.id));
	a ? Sn(e, a, "start") : e.select(t.id, !0);
}
function wn(e) {
	let t = e.getElementById("f-title");
	return t ? (t.focus(), t.setSelectionRange(t.value.length, t.value.length), !0) : !1;
}
function Tn(e, t, n, r, i) {
	if (e.shiftKey || e.metaKey || e.ctrlKey || e.altKey) return !1;
	let a = e.key === "ArrowUp" && nt(t) || e.key === "ArrowLeft" && Ze(t), o = e.key === "ArrowDown" && rt(t) || e.key === "ArrowRight" && Qe(t);
	if (a) {
		let a = r[i - 1];
		if (a) Sn(n, a, "end");
		else if (e.key !== "ArrowUp" || !wn(t.ownerDocument)) return !1;
		return e.preventDefault(), !0;
	}
	if (o) {
		let t = r[i + 1];
		return t ? (e.preventDefault(), Sn(n, t, "start"), !0) : !1;
	}
	return !1;
}
// admin/src/write/outline.ts
var En = [
	"paragraph",
	"heading",
	"quote",
	"callout"
];
function Dn(e) {
	return e.kind === "actions" ? e.nodes : [e.node];
}
function On(e) {
	return Dn(e)[0].id;
}
function kn(e, t, n) {
	let r = {
		types: t,
		custom: n
	}, i = [];
	for (let t of e) {
		let e = Mn(t, null, !1, r), n = e.kind === "container" || e.kind === "columns", a = i.at(-1);
		!n && a && !a.container ? Pn(a.rows, e) : i.push({
			id: t.id,
			label: n && t.label?.trim() || null,
			rows: [e],
			container: n
		});
	}
	return i;
}
function An(e) {
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
function jn(e) {
	let t = [], n = (e) => {
		for (let r of e) if (t.push(r), r.kind === "columns") for (let e of r.columns) n(e.rows);
		else r.kind === "container" && n(r.rows);
	};
	for (let t of e) n(t.rows);
	return t;
}
function Mn(e, t, n, r) {
	let i = n || !!e.hidden, a = {
		parent: t,
		hidden: i
	}, o = r.types.get(e.type), s = r.custom(e.type), c = (e.children?.length ?? 0) > 0;
	return e.type === "columns" && o && !s ? {
		kind: "columns",
		node: e,
		columns: (e.children ?? []).map((e) => ({
			node: e,
			rows: Nn(e.children ?? [], e.id, i || !!e.hidden, r)
		})),
		...a
	} : !s && o && !c && (e.type === "button" || e.type === "link") ? {
		kind: "actions",
		nodes: [e],
		...a
	} : o?.children || c ? {
		kind: "container",
		node: e,
		rows: Nn(e.children ?? [], e.id, i, r),
		...a
	} : !o || s ? {
		kind: "block",
		node: e,
		...a
	} : En.includes(e.type) ? {
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
function Nn(e, t, n, r) {
	let i = [];
	for (let a of e) Pn(i, Mn(a, t, n, r));
	return i;
}
function Pn(e, t) {
	let n = e.at(-1);
	t.kind === "actions" && n?.kind === "actions" && n.parent === t.parent && n.hidden === t.hidden ? n.nodes.push(...t.nodes) : e.push(t);
}
// admin/src/write/slash.ts
var Fn = null, In = /* @__PURE__ */ new Set();
function Ln(e) {
	return Fn?.id === e ? Fn : null;
}
function Rn(e) {
	JSON.stringify(e) !== JSON.stringify(Fn) && (Fn = e, In.forEach((e) => e()));
}
function zn() {
	return ve((e) => (In.add(e), () => In.delete(e)), () => Fn);
}
function Bn(e, t = 360, n = 300) {
	let r = window.innerHeight - e.bottom - 6 - 8, i = e.top - 6 - 8, a = r >= Math.min(t, 220) || r >= i;
	return {
		left: Math.max(8, Math.min(window.innerWidth - n - 8, e.left - 4)),
		top: a ? e.bottom + 6 : void 0,
		bottom: a ? void 0 : window.innerHeight - e.top + 6,
		maxHeight: Math.max(120, Math.min(t, a ? r : i))
	};
}
function Vn(e, t) {
	M(() => {
		if (!e) return;
		let n = (e) => !e.target?.closest?.("[data-cms-slash]") && Rn(null), r = t.filter((e) => !!e);
		return r.forEach((e) => e.addEventListener("pointerdown", n, !0)), () => r.forEach((e) => e.removeEventListener("pointerdown", n, !0));
	}, [e, ...t]);
}
// admin/src/write/Text.tsx
var Hn = {
	1: "text-display font-semibold",
	2: "text-3xl font-semibold",
	3: "text-2xl font-semibold",
	4: "text-xl font-semibold",
	5: "text-lg font-semibold",
	6: "text-base font-semibold uppercase tracking-[0.04em] text-muted"
}, Un = "text-lg leading-7", Wn = {
	note: {
		icon: "info",
		className: "bg-surface",
		label: () => O("Note")
	},
	tip: {
		icon: "sparkle",
		className: "bg-success/7",
		label: () => O("Tip")
	},
	warning: {
		icon: "warning",
		className: "bg-warning/9",
		label: () => O("Warning")
	},
	danger: {
		icon: "error",
		className: "bg-danger/7",
		label: () => O("Danger")
	}
};
function Gn({ node: e }) {
	if (e.type === "quote") return /* @__PURE__ */ U("blockquote", {
		className: "m-0 border-l-[3px] border-text/80 py-0.5 pl-4",
		children: [/* @__PURE__ */ H(Jn, {
			node: e,
			prop: "text",
			className: "text-lg leading-7",
			placeholder: O("Quote")
		}), /* @__PURE__ */ H(Jn, {
			node: e,
			prop: "cite",
			className: "cms-block-cite mt-1 text-sm text-muted",
			placeholder: O("Attribution"),
			quiet: !0
		})]
	});
	if (e.type === "callout") return /* @__PURE__ */ H(qn, { node: e });
	if (e.type === "heading") {
		let t = String(e.props.level ?? 2);
		return /* @__PURE__ */ H(Jn, {
			node: e,
			prop: "text",
			tag: `h${t}`,
			className: Hn[t] ?? Hn[2],
			placeholder: O("Heading {level}", { level: t })
		});
	}
	return /* @__PURE__ */ H(Kn, { node: e });
}
function Kn({ node: e }) {
	let { store: t } = o(), n = G(t, (t) => t.nodes.length === 1 && t.nodes[0].id === e.id);
	return /* @__PURE__ */ H(Jn, {
		node: e,
		prop: "text",
		tag: "p",
		className: Un,
		placeholder: O("Write, or press “/” for blocks"),
		quiet: !n
	});
}
function qn({ node: e }) {
	let { store: t } = o(), { readOnly: n } = yn(), r = Wn[e.props.tone] ?? Wn.note;
	return /* @__PURE__ */ U("div", {
		className: B("flex gap-3 rounded-md px-4 py-3", r.className),
		children: [/* @__PURE__ */ H(xe, {
			align: "start",
			trigger: /* @__PURE__ */ H(z, {
				compact: !0,
				disabled: n,
				"aria-label": O("Callout Style"),
				className: "grid h-[27px] w-5 shrink-0 place-items-center rounded-xs text-muted hover:text-text",
				children: /* @__PURE__ */ H(I, {
					name: r.icon,
					size: 17
				})
			}),
			items: Object.entries(Wn).map(([n, r]) => ({
				label: r.label(),
				icon: r.icon,
				checked: n === (e.props.tone ?? "note"),
				onSelect: () => t.updateProps(e.id, { tone: n })
			}))
		}), /* @__PURE__ */ H(Jn, {
			node: e,
			prop: "text",
			className: B(Un, "min-w-0 flex-1"),
			placeholder: O("Write a note")
		})]
	});
}
function Jn({ node: e, prop: t, tag: n = "div", className: r, placeholder: i, quiet: a }) {
	let { store: s, types: l, allowed: u } = o(), { stops: d, readOnly: h } = yn(), v = G(s, (n) => n.focus?.id === e.id && (n.focus.prop ?? "text") === t ? n.focus : null), y = String(e.props[t] ?? ""), b = (n, r) => {
		if (e.type === "paragraph" && t === "text" && x(n, r)) return;
		s.updateProps(e.id, { [t]: n }, `text:${e.id}:${t}`);
		let i = e.type === "paragraph" ? n.replace(/<[^>]+>/g, "").match(/^\/([\w-]*)$/) : null;
		Rn(i ? {
			id: e.id,
			query: i[1]
		} : null);
	}, x = (t, n) => {
		let r = t.replace(/&nbsp;/g, " "), i = (t, r, i) => {
			let a = m(s.get().nodes, e.id), o = a?.parentId ? f(s.get().nodes, a.parentId) : null;
			if (!l.has(t) || !te(o, t, l, o ? [] : u)) return !1;
			let c = Math.max(0, et(n) - at(i));
			return s.updateNode(e.id, {
				type: t,
				props: r
			}), s.focus(e.id, c, t === "list" ? "items" : "text", t === "list" ? 0 : void 0), !0;
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
			let t = bn(), { nodes: n } = s.get(), r = m(n, e.id);
			return s.commit(C(w(n, e.id, (e) => ({
				...e,
				type: "divider",
				props: {}
			})), r?.parentId ?? null, (r?.index ?? n.length) + 1, [t])), s.focus(t.id, "start"), !0;
		}
		return !1;
	}, S = (n, r) => {
		if (n.defaultPrevented) return;
		let i = d(), a = i.findIndex((n) => xn(n, e.id, t)), o = i[a], { nodes: h } = s.get();
		if (n.key === "Enter" && !n.shiftKey && !n.metaKey && !n.ctrlKey && !n.altKey) {
			n.preventDefault();
			let i = Ln(e.id);
			if (i && c(!0, !!document.querySelector("[data-cms-slash]"))) return Rn({
				...i,
				enter: !0
			});
			if (t === "cite") {
				let t = bn(), n = _(h, e.id, "paragraph", l, u);
				if (!n) return;
				s.insert(n.parentId, n.index, [t]), s.focus(t.id, "start");
				return;
			}
			let [a, o] = tt(r);
			if (p(a) && !p(o)) {
				let t = m(h, e.id);
				if (!t) return;
				s.insert(t.parentId, t.index, [bn()]), s.focus(e.id, "start");
				return;
			}
			let d = e.type === "paragraph" ? {
				id: T(),
				type: "paragraph",
				props: {
					...e.props,
					text: o
				},
				...e.style ? { style: structuredClone(e.style) } : {},
				...e.class ? { class: e.class } : {}
			} : bn(o), f = _(h, e.id, "paragraph", l, u);
			if (!f) return;
			s.commit(C(w(h, e.id, (e) => ({
				...e,
				props: {
					...e.props,
					[t]: a
				}
			})), f.parentId, f.index, [d])), s.focus(d.id, "start");
		} else if (n.key === "Backspace" && Ze(r)) {
			if (t === "cite") {
				p(y) && (n.preventDefault(), s.focus(e.id, "end", "text"));
				return;
			}
			if (e.type !== "paragraph") {
				n.preventDefault(), s.updateNode(e.id, {
					type: "paragraph",
					props: { text: y }
				}), s.focus(e.id, "start");
				return;
			}
			let r = i[a - 1];
			if (!r) return;
			if (n.preventDefault(), p(y)) {
				s.remove(e.id), Sn(s, r, "end");
				return;
			}
			if (r.parent === o?.parent && ee(r, y)) return;
			Sn(s, r, "end");
		} else if (n.key === "Delete" && Qe(r) && t === "text") {
			let t = i[a + 1], r = t && t.prop === "text" && t.parent === o?.parent ? f(h, t.id) : null;
			if (!r || !["paragraph", "heading"].includes(r.type)) return;
			n.preventDefault();
			let c = at(y);
			s.commit(g(w(h, e.id, (e) => ({
				...e,
				props: {
					...e.props,
					text: y + String(r.props.text ?? "")
				}
			})), r.id)), s.focus(e.id, c);
		} else Tn(n, r, s, i, a) || n.key === "Escape" && (n.preventDefault(), r.blur(), s.select(e.id, !0));
	}, ee = (t, n) => {
		let { nodes: r } = s.get(), i = f(r, t.id);
		if (!i) return !1;
		if (t.prop === "items") {
			let a = [...i.props.items ?? [""]], o = a[t.index ?? 0] ?? "";
			return a[t.index ?? 0] = o + n, s.commit(g(w(r, i.id, (e) => ({
				...e,
				props: {
					...e.props,
					items: a
				}
			})), e.id)), Sn(s, t, at(o)), !0;
		}
		if (t.prop !== "text" || ![
			"paragraph",
			"heading",
			"quote",
			"callout"
		].includes(i.type)) return !1;
		let a = String(i.props.text ?? "");
		return s.commit(g(w(r, i.id, (e) => ({
			...e,
			props: {
				...e.props,
				text: a + n
			}
		})), e.id)), Sn(s, t, at(a)), !0;
	};
	return /* @__PURE__ */ H(J, {
		tag: n,
		html: y,
		onChange: b,
		placeholder: i,
		quiet: a,
		className: r,
		focus: v,
		disabled: h,
		onKeyDown: S,
		onFocus: () => s.get().selected !== e.id && s.select(e.id),
		onPaste: (n) => !n.includes("\n") || t !== "text" ? !1 : (import("./paste-BDX20QuD.js").then((t) => t.pasteMarkdown(s, e, n, l, u)), !0)
	});
}
function Yn({ node: e, renderItem: t }) {
	let { store: n, types: r, allowed: i } = o(), { stops: a, readOnly: s } = yn(), c = Array.isArray(e.props.items) && e.props.items.length ? e.props.items : [""], l = G(n, (t) => t.focus?.id === e.id && t.focus.prop === "items" ? t.focus : null), u = !!e.props.ordered, d = (t, r = `list:${e.id}`) => n.updateProps(e.id, { items: t }, r), f = (t) => (o, s) => {
		if (o.defaultPrevented) return;
		let { nodes: l } = n.get(), u = a(), f = u.findIndex((n) => xn(n, e.id, "items", t));
		if (o.key === "Enter" && !o.shiftKey && !o.metaKey && !o.ctrlKey) {
			if (o.preventDefault(), p(c[t]) && t === c.length - 1) {
				let t = bn(), a = c.slice(0, -1), o = _(l, e.id, "paragraph", r, i);
				if (!o) return;
				let s = a.length ? w(l, e.id, (e) => ({
					...e,
					props: {
						...e.props,
						items: a
					}
				})) : l, u = C(s, o.parentId, o.index, [t]);
				n.commit(a.length ? u : g(u, e.id)), n.focus(t.id, "start");
				return;
			}
			let [a, u] = tt(s);
			d([
				...c.slice(0, t),
				a,
				u,
				...c.slice(t + 1)
			], ""), n.focus(e.id, "start", "items", t + 1);
		} else if (o.key === "Backspace" && Ze(s)) {
			if (o.preventDefault(), t === 0) {
				let t = bn(c[0]), r = m(l, e.id), i = c.slice(1), a = C(l, r?.parentId ?? null, r?.index ?? 0, [t]);
				a = i.length ? w(a, e.id, (e) => ({
					...e,
					props: {
						...e.props,
						items: i
					}
				})) : g(a, e.id), n.commit(a), n.focus(t.id, "start");
				return;
			}
			d([
				...c.slice(0, t - 1),
				c[t - 1] + c[t],
				...c.slice(t + 1)
			], ""), n.focus(e.id, at(c[t - 1]), "items", t - 1);
		} else Tn(o, s, n, u, f) || o.key === "Escape" && (o.preventDefault(), s.blur(), n.select(e.id, !0));
	}, h = (r, i) => /* @__PURE__ */ H(J, {
		html: r,
		className: t ? void 0 : "min-w-0 flex-1 pl-1",
		tag: t ? "span" : "div",
		placeholder: O("List"),
		quiet: !0,
		disabled: s,
		focus: l && (l.index ?? 0) === i ? l : null,
		onChange: (e) => d(c.map((t, n) => n === i ? e : t)),
		onKeyDown: f(i),
		onFocus: () => n.get().selected !== e.id && n.select(e.id)
	});
	return t ? /* @__PURE__ */ H(Re, { children: c.map((e, n) => t(n, h(e, n))) }) : /* @__PURE__ */ H("div", {
		className: B(Un, "space-y-0.5"),
		children: c.map((e, t) => /* @__PURE__ */ U("div", {
			className: "flex",
			children: [/* @__PURE__ */ H("span", {
				className: B("w-6 shrink-0 select-none text-muted", u ? "pr-1.5 text-right tabular-nums" : "pl-1.5"),
				"aria-hidden": !0,
				children: u ? `${t + 1}.` : "•"
			}), h(e, t)]
		}, t))
	});
}
// admin/src/LiveEditor.tsx
var Xn = (e, t, n) => e.axis === "x" ? {
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
}, Zn = (e) => `${e.parentId ?? ""}:${e.index}:${e.inside ? "inside" : e.axis}`, Qn = "\nhtml{scrollbar-width:thin;scrollbar-color:rgb(127 127 127/.35) transparent}\n[data-cms-document][data-cms-node]{cursor:default}\n.cms-block-text{display:block;min-width:1ch;min-height:1lh;white-space:pre-wrap;overflow-wrap:break-word;outline:none;border-radius:0;font:inherit;color:inherit;line-height:inherit;text-align:inherit;cursor:text}\n.cms-block-text:empty::before{content:attr(data-placeholder);opacity:.4;pointer-events:none}\n.cms-block-text[data-quiet]:empty:not(:focus)::before{content:none}\n[data-cms-prop]{cursor:text}\n.cms-block-text::selection,.cms-block-text ::selection{background:rgb(0 122 255/.2)}\nimg,a{-webkit-user-drag:none}\n[data-cms-conditional=hidden]:not([data-cms-reveal]){display:none!important}\n[data-cms-editor-empty-root]{visibility:hidden}\n.cms-js [data-cms-appear]{visibility:visible!important}\n", $n = /* @__PURE__ */ new Set([
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
function er(e, t, n) {
	let r = e.elementFromPoint(t, n);
	if (!r || r === e.body || r === e.documentElement) return !1;
	if ($n.has(r.tagName) || r.closest("svg")) return !0;
	let i = [...r.childNodes].filter((e) => e.nodeType === Node.TEXT_NODE && e.textContent?.trim());
	if (!i.length) return !1;
	let a = e.createRange();
	return i.some((e) => (a.selectNodeContents(e), [...a.getClientRects()].some((e) => t >= e.left - 2 && t <= e.right + 2 && n >= e.top - 2 && n <= e.bottom + 2)));
}
function tr(e) {
	let t = parseFloat(e ?? "");
	return Number.isNaN(t) ? 0 : /r?em$/.test(e ?? "") ? t * 16 : t;
}
function nr({ collection: e, blueprint: n, entryId: i, content: a, onInspect: s, standalone: c, onTitleChange: l }) {
	let { store: d, types: p, allowed: g, fieldHandle: y, readOnly: S = !1 } = o(), C = t(), w = G(d, (e) => e.nodes), T = G(d, (e) => e.selected), D = G(d, We), re = G(d, (e) => e.blockMode), ae = G(d, (e) => e.hovered), se = G(d, (e) => e.breakpoint), k = O("Page Builder"), ce = !S && !!T && re;
	V("up", O("Select Previous Block"), k, ce), V("down", O("Select Next Block"), k, ce), V("shift+up", O("Select the Block Above Too"), k, ce), V("shift+down", O("Select the Block Below Too"), k, ce), V("alt+up", O("Move Up"), k, ce), V("alt+down", O("Move Down"), k, ce), V("enter", O("Edit Block"), k, ce), V("mod+d", O("Duplicate Block"), k, ce), V("backspace", O("Delete Block"), k, ce), V("escape", O("Deselect"), k, !!T), V("mod+alt+t", O("Insert Before"), k, !S && !!T), V("mod+alt+y", O("Insert After"), k, !S && !!T), V("mod+z", O("Undo"), k, !S), V("mod+shift+z", O("Redo"), k, !S);
	let { breakpoints: le } = r(), ue = tr(le.lg) || 1024, de = N(null), A = N(null), [fe, pe] = P(null), j = N(""), [he, ve] = P([]), [F, ye] = P(!0), [be, I] = P(null), [L, xe] = P(0), [R, Se] = P({
		width: 1024,
		height: 700,
		scale: 1,
		left: 0
	}), [Ce, we] = P([]), [z, Ee] = P(null), [Oe, ke] = P([]), [B, Ae] = P(null), Me = N(0), Ne = N(""), [Pe, Fe] = P(!1), [Ie, Le] = P(!1), ze = N(!1), W = N(null), Ve = _e(() => {
		let e = [], t = (n, r) => n.forEach((n, i) => {
			e.push({
				node: n,
				parentId: r,
				index: i
			}), n.children && t(n.children, n.id);
		});
		return t(w, null), e;
	}, [w]), He = N(Ve);
	He.current = Ve;
	let [Ue, Ge] = P(null), [Ke, qe] = P(!1), Je = bt(!!e && !!ne().collections.find((t) => t.handle === e)?.routable && !S && !c), Ye = N(Ue);
	Ye.current = Ue;
	let Xe = N(null);
	M(() => {
		Ue || (Xe.current = null);
	}, [Ue]);
	let Ze = N(0), Qe = N({
		busy: !1,
		queued: !1,
		timer: 0,
		alive: !0
	}), $e = N(async () => {}), et = () => {
		let e = Qe.current;
		e.queued = !0, !(!e.alive || e.busy || e.timer) && (e.timer = window.setTimeout(() => {
			e.timer = 0, $e.current();
		}, j.current ? 80 : 0));
	}, tt = () => He.current.map(({ node: e, parentId: t, index: n }) => `${t}:${n}:${e.id}:${e.type}:${e.type === "list" ? e.props.items?.length ?? 0 : ""}`).join("|"), nt = N(null), rt = N(rn());
	M(() => () => rt.current.unmount(), []);
	let K = N({
		content: a,
		onInspect: s,
		readOnly: S,
		layout: R,
		onTitleChange: l
	});
	K.current = {
		content: a,
		onInspect: s,
		readOnly: S,
		layout: R,
		onTitleChange: l
	};
	let q = (e, t) => e.querySelector(`[data-cms-document="${j.current}"][data-cms-node="${CSS.escape(t)}"]`) ?? e.querySelector(`[data-cms-proto-document="${j.current}"][data-cms-proto="${CSS.escape(t)}"]`), it = (e) => {
		let t = "[data-cms-document][data-cms-node],[data-cms-proto-document][data-cms-proto]", n = e?.closest?.(t) ?? null;
		for (; n;) {
			let e = n.dataset.cmsDocument === j.current ? n.dataset.cmsNode : n.dataset.cmsProtoDocument === j.current ? n.dataset.cmsProto : void 0;
			if (e && f(d.get().nodes, e)) return e;
			n = n.parentElement?.closest(t) ?? null;
		}
		return null;
	}, at = (e) => {
		if (e.ownerDocument.defaultView?.getComputedStyle(e).display !== "contents") return e.getBoundingClientRect();
		let t = e.ownerDocument.createRange();
		return t.selectNodeContents(e), t.getBoundingClientRect();
	}, ot = () => {
		if (W.current) return W.current;
		let e = A.current?.contentDocument, t = e?.querySelector(`[data-cms-editor-root="${j.current}"]`);
		if (!e || !t) return null;
		let n = (t) => {
			let n = e.defaultView.getComputedStyle(t);
			return n.display.includes("flex") && n.flexDirection.startsWith("row") || n.display.includes("grid") && n.gridTemplateColumns.split(" ").length > 1 ? "x" : "y";
		}, r = new Map([...e.querySelectorAll(`[data-cms-document="${j.current}"][data-cms-node]`)].map((e) => [e.dataset.cmsNode, e])), i = He.current.flatMap(({ node: t, parentId: i, index: a }) => {
			let o = r.get(t.id);
			return !o || e.defaultView.getComputedStyle(o).display === "none" ? [] : [{
				id: t.id,
				parentId: i,
				index: a,
				rect: at(o),
				container: !!p.get(t.type)?.children && !["repeat", "component"].includes(t.type),
				axis: n(o)
			}];
		}), a = at(t);
		return a.width === 0 && (a = at(t.parentElement ?? e.body)), i.length || (a = {
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
	}, st = (e, t = ["paragraph"]) => {
		let n = e ? f(d.get().nodes, e) : null;
		return t.every((e) => te(n, e, p, n ? [] : g));
	}, ct = (e) => [...p.values()].some((t) => st(e, [t.name])), lt = () => {
		let e = /* @__PURE__ */ new Map();
		return (t) => e.get(t) ?? e.set(t, ct(t)).get(t);
	}, J = () => {
		let e = A.current?.contentDocument, t = ot();
		if (!e || !t) return;
		we(We(d.get()).flatMap((t) => {
			let n = q(e, t);
			return n ? [at(n)] : [];
		}));
		let n = d.get().hovered, r = n ? q(e, n) : null;
		Ee(r ? at(r) : null);
		let i = It(t.blocks, {
			rootRect: t.rootRect,
			canInsert: lt()
		});
		ke(i), Ge((t) => {
			if (!t) return t;
			let n = Xe.current?.key === Zn(t) ? Xe.current : null, r = n ? q(e, n.id) : null, a = n ? r ? Xn(t, at(r), n.side) : t : i.find((e) => Zn(e) === Zn(t)) ?? t, o = a.inside ? a.hitRect.top : a.rect.top;
			return o < 0 || o > K.current.layout.height ? null : a;
		});
	}, ut = (e) => {
		let t = e ? Zn(e) : "";
		t !== Ne.current && (Ne.current = t, clearTimeout(Me.current), Ae(null), e && (Me.current = window.setTimeout(() => Ae(e), 80)));
	}, dt = (e) => {
		let t = We(d.get()), n = t.length ? m(d.get().nodes, e === "before" ? t[0] : t.at(-1)) : null, r = A.current?.contentDocument;
		if (!n || !r || K.current.readOnly || !ct(n.parentId)) return;
		let i = e === "before" ? n.index : n.index + 1, a = q(r, e === "before" ? t[0] : t.at(-1)), o = a ? at(a) : null, s = r.defaultView, c = K.current.layout.height;
		if (o) {
			let t = e === "before" ? o.top : o.top + o.height;
			(t < 48 || t > c - 160) && s.scrollBy(0, t - c / 3);
		}
		requestAnimationFrame(() => {
			W.current = null;
			let r = ot(), o = a ? at(a) : null;
			if (!o) return;
			let s = Xn((r && It(r.blocks, {
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
			Xe.current = {
				key: Zn(s),
				id: e === "before" ? t[0] : t.at(-1),
				side: e
			}, ut(null), Ge(s);
		});
	}, pt = () => {
		let e = fe?.activeElement;
		if (document.activeElement === A.current && e?.isContentEditable) return e;
		let t = d.get().focus;
		return (t && fe ? q(fe, t.id) : null)?.querySelector("[data-cms-inline]") ?? null;
	}, mt = (e) => {
		W.current = null;
		let t = [];
		if (K.current.onTitleChange) for (let t of e.querySelectorAll("[data-cms-entry-field=\"title\"]")) t.querySelector("[data-cms-inline]") || t.replaceChildren();
		for (let n of e.querySelectorAll("[data-cms-prop]")) {
			let e = n.closest("[data-cms-document][data-cms-node]");
			e?.dataset.cmsDocument === j.current && e.dataset.cmsNode && (n.querySelector("[data-cms-inline]") || n.replaceChildren(), t.push({
				element: n,
				id: e.dataset.cmsNode,
				prop: n.dataset.cmsProp,
				...n.dataset.cmsIndex === void 0 ? {} : { index: Number(n.dataset.cmsIndex) }
			}));
		}
		for (let n of e.querySelectorAll("[data-cms-instance-prop]")) n.dataset.cmsInstanceDocument === j.current && n.dataset.cmsInstanceNode && (n.querySelector("[data-cms-inline]") || n.replaceChildren(), t.push({
			element: n,
			id: n.dataset.cmsInstanceNode,
			prop: n.dataset.cmsInstanceProp,
			instance: {
				type: n.dataset.cmsInstanceType ?? "text",
				value: n.dataset.cmsInstanceValue ?? ""
			}
		}));
		ve(t), requestAnimationFrame(J);
	}, ht = () => {
		let e = A.current?.contentDocument, t = e?.querySelector("[data-cms-editor-root]");
		if (!e || !t || !j.current) return;
		let n = new Set(v(d.get().nodes).map(({ node: e }) => e.id));
		for (let t of e.querySelectorAll("[data-cms-document][data-cms-node]")) t.dataset.cmsDocument === j.current && !n.has(t.dataset.cmsNode) && t.remove();
		let r = (t, n) => {
			for (let i = 0; i < t.length; i++) {
				let a = t[i], o = q(e, a.id);
				if (!o || o.dataset.cmsType !== a.type) {
					let r = e.querySelector(`template[data-cms-prototype="${CSS.escape(a.type)}"]`)?.content.firstElementChild?.cloneNode(!0);
					if (!r) continue;
					if (r.dataset.cmsNode = a.id, r.dataset.cmsDocument = j.current, o) o.replaceWith(r);
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
				a.children && !["repeat", "component"].includes(a.type) && r(a.children, o);
			}
		};
		d.get().nodes.length && t.querySelector(":scope > [data-cms-editor-empty-root]")?.remove(), r(d.get().nodes, t), mt(e);
	}, gt = _e(() => ({
		stops: () => An(kn(d.get().nodes, p, () => !1)).filter((e) => he.some((t) => t.id === e.id && t.prop === e.prop && (e.index === void 0 || t.index === e.index))),
		settings: (e) => K.current.onInspect(e),
		readOnly: S
	}), [
		d,
		p,
		he,
		S
	]), yt = N(gt);
	yt.current = gt, ge(() => {
		W.current = null, ht();
	}, [w, fe]), ge(() => {
		if (!de.current) return;
		let e = () => {
			let e = de.current, t = Math.max(e.clientWidth, ue), n = se === "tablet" ? je.tablet : se === "mobile" ? Math.min(je.phone, e.clientWidth) : t, r = Math.min(1, e.clientWidth / n);
			W.current = null, Se({
				width: n,
				scale: r,
				height: e.clientHeight / r,
				left: Math.max(0, (e.clientWidth - n * r) / 2)
			});
		};
		e();
		let t = new ResizeObserver(e);
		return t.observe(de.current), () => t.disconnect();
	}, [se, ue]), M(() => {
		requestAnimationFrame(J);
	}, [
		T,
		D,
		ae,
		R,
		fe
	]), $e.current = async () => {
		let t = Qe.current;
		t.queued = !1, t.busy = !0;
		let r = Ze.current, o = tt(), s = new AbortController();
		nt.current = s;
		try {
			let { text: l, headers: u } = await oe("POST", i ? `/__preview/${i}` : "/__preview", {
				...a,
				collection: e,
				...i ? {} : { blueprint: n },
				field: y,
				standalone: c,
				data: {
					...a.data,
					[y]: d.get().nodes
				},
				play: !1
			}, { signal: s.signal });
			if (!t.alive || s.signal.aborted || r !== Ze.current && o !== tt()) return;
			let f = u.get("X-Cms-Editor-Document");
			if (!f) throw Error(O("The editor could not load its rendering context."));
			let p = new DOMParser().parseFromString(l, "text/html");
			if (!p.querySelector(`[data-cms-editor-root="${f}"]`)) throw Error(O("This template has no content outlet. Choose a template that includes the content field."));
			p.querySelectorAll("script").forEach((e) => {
				e.type === "importmap" && (e.dataset.cmsImportmap = ""), e.type = "text/cms-off", e.removeAttribute("src");
			}), j.current = f;
			let m = A.current?.contentDocument;
			m?.documentElement?.hasAttribute("data-cms-bridge-ready") ? (rt.current.unmount(), an(m, p), m.documentElement.setAttribute("data-cms-bridge-ready", ""), mt(m), rt.current.mount(m)) : A.current && (A.current.srcdoc = p.documentElement.outerHTML), r === Ze.current && I(null);
		} catch (e) {
			!s.signal.aborted && r === Ze.current && (I(e instanceof Error ? e.message : String(e)), ye(!1));
		} finally {
			t.busy = !1, t.queued && et();
		}
	}, M(() => {
		Ze.current++, et();
	}, [
		i,
		e,
		n,
		a,
		w,
		y,
		c,
		L
	]), M(() => (Qe.current.alive = !0, Qe.current.queued && et(), () => {
		Qe.current.alive = !1, clearTimeout(Qe.current.timer), Qe.current.timer = 0, nt.current?.abort();
	}), []);
	let St = (e, t) => {
		let n = b(e, p);
		n.length && !S && st(t.parentId, n.map((e) => e.type)) && (d.insert(t.parentId, t.index, n), Cn(d, n[0], An(kn(d.get().nodes, p, () => !1))), Ge(null), ut(null));
	}, Ct = () => {
		if (K.current.readOnly || !st(null)) return;
		let e = bn();
		d.insert(null, 0, [e]), d.focus(e.id, "start");
	}, wt = () => {
		let e = A.current?.contentDocument;
		return e ? He.current.filter(({ node: t }) => {
			let n = q(e, t.id);
			return !!n && e.defaultView.getComputedStyle(n).display !== "none";
		}).map(({ node: e }) => e.id) : [];
	}, Tt = (e) => {
		if (!e) return;
		d.select(e, !0);
		let t = A.current?.contentDocument;
		(t && q(t, e))?.scrollIntoView({ block: "nearest" });
	}, Et = (e) => {
		let t = e.metaKey || e.ctrlKey, n = We(d.get()), r = d.get().selected;
		if (e.key === "Escape") {
			d.select(null);
			return;
		}
		if (!r || !d.get().blockMode) return;
		let i = wt(), a = i.indexOf(d.get().head ?? r);
		if (["ArrowUp", "ArrowDown"].includes(e.key)) {
			e.preventDefault();
			let t = e.key === "ArrowUp";
			e.altKey ? d.nudgeSelection(t ? -1 : 1) : e.shiftKey ? d.extend(t ? -1 : 1) : Tt(i[a + (t ? -1 : 1)]);
		} else if (e.key === "Enter") {
			e.preventDefault();
			let t = f(d.get().nodes, r), n = yt.current.stops(), i = t ? new Set(v([t]).map((e) => e.node.id)) : /* @__PURE__ */ new Set();
			n.some((e) => i.has(e.id)) ? Cn(d, t, n) : K.current.onInspect(r);
		} else if (e.key === "Backspace" || e.key === "Delete") {
			e.preventDefault();
			let t = new Set(n.flatMap((e) => {
				let t = f(d.get().nodes, e);
				return t ? v([t]).map((e) => e.node.id) : [];
			})), r = i.findIndex((e) => t.has(e)), a = i.slice(0, Math.max(0, r)).reverse().find((e) => !t.has(e)) ?? i.slice(r + 1).find((e) => !t.has(e));
			d.removeSelection(), Tt(a);
		} else t && e.key.toLowerCase() === "d" && (e.preventDefault(), d.duplicateSelection());
	}, Dt = () => {
		let e = A.current?.contentDocument;
		if (!e || !j.current) return;
		if (!e.querySelector("[data-cms-editor-root]")) {
			ye(!1), I(O("This template has no content outlet. Choose a template that includes the content field."));
			return;
		}
		e.documentElement.setAttribute("data-cms-bridge-ready", "");
		let t = e.createElement("style");
		t.dataset.cmsBridge = "", t.textContent = Qn, e.head.appendChild(t), pe(e), mt(e), ye(!1), rt.current.unmount(), rt.current.mount(e), e.addEventListener("submit", (e) => e.preventDefault(), !0), e.addEventListener("dragstart", (e) => e.preventDefault()), e.addEventListener("focusout", (e) => {
			e.target.isContentEditable && Fe(!1), et();
		}), e.addEventListener("focusin", (e) => {
			let t = e.target;
			if (!t.isContentEditable) return;
			Fe(!0);
			let n = t.closest("[data-cms-instance-node],[data-cms-document][data-cms-node]");
			d.select(n?.dataset.cmsInstanceNode ?? n?.dataset.cmsNode ?? null), d.hover(null);
		}), e.addEventListener("pointermove", (e) => {
			if (K.current.readOnly || (ze.current && (e.movementX || e.movementY) && (ze.current = !1, Le(!1)), d.hover(it(e.target)), ze.current || Ye.current)) return;
			let t = ot();
			ut(t && Lt(t.blocks, {
				x: e.clientX,
				y: e.clientY
			}, {
				rootRect: t.rootRect,
				canInsert: lt()
			}));
		}), e.addEventListener("pointerdown", () => {
			Ge(null), ut(null);
		}), e.addEventListener("click", (e) => {
			let t = e.target;
			if (t.closest("[contenteditable=\"true\"]")) {
				t.closest("a") && e.preventDefault();
				return;
			}
			e.preventDefault();
			let n = it(t);
			n ? e.shiftKey && d.get().selected ? d.extendTo(n) : K.current.onInspect(n) : e.shiftKey || d.select(null);
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
			else if (!K.current.readOnly) {
				if (n && t.key.toLowerCase() === "z") {
					if (e.activeElement?.closest("[data-cms-entry-field]")) return;
					t.preventDefault();
					let n = e.activeElement, r = n?.closest("[data-cms-prop]"), i = n?.closest("[data-cms-instance-prop]"), a = r?.closest("[data-cms-node]");
					n?.blur(), t.shiftKey ? d.redo() : d.undo(), a?.dataset.cmsNode && r?.dataset.cmsProp && f(d.get().nodes, a.dataset.cmsNode) ? d.focus(a.dataset.cmsNode, "end", r.dataset.cmsProp, r.dataset.cmsIndex === void 0 ? void 0 : Number(r.dataset.cmsIndex)) : i?.dataset.cmsInstanceNode && f(d.get().nodes, i.dataset.cmsInstanceNode) && d.focus(i.dataset.cmsInstanceNode, "end", `values.${i.dataset.cmsInstanceProp}`);
				} else n && t.altKey && (t.code === "KeyT" || t.code === "KeyY") ? (t.preventDefault(), dt(t.code === "KeyT" ? "before" : "after")) : t.target.isContentEditable ? n || t.altKey || t.key.length !== 1 && ![
					"Backspace",
					"Delete",
					"Enter"
				].includes(t.key) || (ze.current = !0, Le(!0), ut(null)) : Et(t);
			}
		});
		let n = (e) => d.get().blockMode && !!d.get().selected && !e.target.isContentEditable, r = (e, t) => {
			if (!n(e) || !e.clipboardData) return;
			let r = We(d.get()).map((e) => f(d.get().nodes, e)).filter(Boolean);
			r.length && (e.preventDefault(), e.clipboardData.setData("text/plain", "cms-blocks:" + JSON.stringify(r)), t && !K.current.readOnly && d.removeSelection());
		};
		e.addEventListener("copy", (e) => r(e, !1)), e.addEventListener("cut", (e) => r(e, !0)), e.addEventListener("paste", (e) => {
			let t = e.clipboardData?.getData("text/plain") ?? "";
			if (!n(e) || K.current.readOnly || !t.startsWith("cms-blocks:")) return;
			e.preventDefault();
			let r;
			try {
				r = JSON.parse(t.slice(12)).map(x);
			} catch {
				return;
			}
			let i = d.get().nodes, a = _(i, We(d.get()).at(-1), r.map((e) => e.type), p, g);
			a && r.length && (d.insert(a.parentId, a.index, r), d.select(r[0].id, !0), r.length > 1 && d.extendTo(r.at(-1).id));
		});
		let i = 0;
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
			Be(() => {
				ut(null), J();
			}), clearTimeout(i), i = window.setTimeout(() => {
				W.current = null, J();
			}, 150);
		}, { passive: !0 }), e.defaultView?.addEventListener("resize", () => {
			W.current = null, requestAnimationFrame(J);
		}), e.querySelectorAll("img,link[rel=\"stylesheet\"]").forEach((e) => e.addEventListener("load", () => {
			W.current = null, requestAnimationFrame(J);
		}, { once: !0 })), e.fonts.ready.then(() => {
			W.current = null, J();
		});
	};
	M(() => _n.on("scroll-to", ({ node: e, top: t }) => {
		let n = A.current?.contentDocument, r = n && q(n, e);
		r && t ? n.defaultView?.scrollTo({
			top: Math.max(0, r.getBoundingClientRect().top + n.defaultView.scrollY - 72),
			behavior: "smooth"
		}) : r && r.scrollIntoView({
			block: "center",
			behavior: "smooth"
		});
	}), []), M(() => {
		let e = A.current?.contentDocument;
		if (e) {
			e.querySelectorAll("[data-cms-reveal]").forEach((e) => e.removeAttribute("data-cms-reveal"));
			for (let t of D) {
				let n = q(e, t);
				for (; n;) n.dataset.cmsConditional === "hidden" && (n.dataset.cmsReveal = ""), n = n.parentElement;
			}
		}
	}, [D]);
	let Ot = on({
		disabled: S,
		frame: A,
		scale: R.scale,
		invalidate: () => {
			W.current = null, J();
		},
		target: (e, t) => {
			let n = ot();
			if (!n || e.x < n.rootRect.left || e.x > n.rootRect.left + n.rootRect.width || e.y < n.rootRect.top - 12 || e.y > n.rootRect.top + n.rootRect.height + 12) return null;
			let r = t.map((e) => f(d.get().nodes, e));
			if (r.some((e) => !e)) return null;
			let i = r.map((e) => e.type);
			return Rt(n.blocks, e, {
				rootRect: n.rootRect,
				maxDistance: Infinity,
				excludeIds: new Set(t),
				canInsert: (e) => st(e, i)
			});
		},
		commit: (e, t) => d.moveTo(e, t.parentId, t.index)
	}), kt = (e) => {
		let t = A.current?.contentDocument;
		if (!t) return !1;
		for (let n of [.25, .75]) for (let r = 0; r < 6; r++) if (er(t, (e.left + e.width * (r + .5) / 6 - R.left) / R.scale, (e.top + e.height * n) / R.scale)) return !0;
		return !1;
	}, At = me(() => {
		let e = A.current.getBoundingClientRect();
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
	return /* @__PURE__ */ U(vn.Provider, {
		value: gt,
		children: [Ke && /* @__PURE__ */ H(xt, {
			open: !0,
			onOpenChange: qe,
			patterns: Je,
			onChoose: (e) => {
				let t = e.blocks.map((e) => x(e));
				d.insert(null, 0, t), d.select(t[0]?.id ?? null), qe(!1);
			}
		}), /* @__PURE__ */ U("div", {
			className: "flex h-full min-h-0 flex-col",
			"data-live-editor": !0,
			children: [
				be && /* @__PURE__ */ H(Te, {
					compact: !0,
					message: be,
					onRetry: () => xe((e) => e + 1)
				}),
				/* @__PURE__ */ U("div", {
					ref: de,
					onPointerLeave: () => {
						d.hover(null), ut(null);
					},
					onPointerMove: (e) => {
						e.target.closest("[data-cms-inserter]") || (ut(null), d.hover(null));
					},
					className: "relative min-h-0 flex-1 overflow-hidden bg-sunken",
					children: [
						F && /* @__PURE__ */ H("div", {
							className: "absolute inset-0 z-drag grid place-items-center bg-bg",
							children: /* @__PURE__ */ H(De, {})
						}),
						/* @__PURE__ */ H("iframe", {
							ref: A,
							title: O("Live editor"),
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
						/* @__PURE__ */ U("div", {
							className: "pointer-events-none absolute inset-0 overflow-hidden",
							children: [
								!S && !Ot.drag && !Pe && !Ie && !Ue && ae && z && !D.includes(ae) && /* @__PURE__ */ H("div", {
									"data-cms-hover": ae,
									className: "absolute z-raised border border-focus/50",
									style: jt(z)
								}),
								!Ot.drag && Ce.map((e, t) => /* @__PURE__ */ H("div", {
									"data-cms-selection": !0,
									className: "absolute z-raised border-solid border-focus",
									style: {
										...jt(e),
										borderWidth: 1.5
									}
								}, t)),
								!S && !Ot.drag && re && T && Ce[0] && (() => {
									let e = m(w, D[0]), t = m(w, D.at(-1)), n = f(w, T);
									if (!e || !t || !n) return null;
									let r = h(w, e.parentId), i = (e) => ({
										label: u(e, p, C),
										icon: e.type === "component" ? "symbol" : p.get(e.type)?.icon ?? "square"
									}), a = e.parentId ? f(w, e.parentId) : null, { label: o, icon: c } = i(n);
									return /* @__PURE__ */ H(mn, {
										id: T,
										label: D.length > 1 ? ie(D.length, "{count} block", "{count} blocks") : o,
										icon: c,
										parent: a ? i(a) : null,
										box: jt(Ce[0]),
										viewport: {
											width: R.width * R.scale + R.left * 2,
											height: R.height * R.scale
										},
										canMoveUp: e.index > 0,
										canMoveDown: t.index < r.length - 1,
										onSelectParent: () => a && s(a.id),
										onDrag: (e) => {
											Ge(null), Ot.start(e, We(d.get()), o);
										},
										onMove: (e) => d.nudgeSelection(e),
										onInsert: (e) => requestAnimationFrame(() => dt(e)),
										onDuplicate: () => d.duplicateSelection(),
										onDelete: () => d.removeSelection(),
										onMakeComponent: n.type !== "component" && E("entries.components.create") && ee(d, p, g) ? () => _t(d) : void 0,
										onSavePattern: E("entries.patterns.create") ? () => vt(d) : void 0,
										covers: kt
									});
								})(),
								!S && !Ot.drag && Oe.filter((e) => e.inside).map((e) => {
									let t = {
										open: !!Ue && Zn(Ue) === Zn(e),
										onOpenChange: (t) => Ge(t ? e : null),
										returnFocus: pt,
										children: /* @__PURE__ */ H(Kt, {
											types: [...p.values()],
											allowed: (t) => st(e.parentId, [t.name]),
											onChoose: (t) => St(t, e),
											onClose: () => Ge(null)
										})
									};
									if (e.parentId === null) return w.length ? null : /* @__PURE__ */ H(fn, {
										target: e,
										position: jt,
										onWrite: st(null) ? Ct : void 0,
										onPattern: Je.length ? () => qe(!0) : void 0,
										...t
									}, "root");
									let n = e.hitRect.top;
									return f(w, e.parentId)?.children?.length || n + e.hitRect.height < 0 || n > R.height || !(t.open || ae === e.parentId || D.includes(e.parentId)) ? null : /* @__PURE__ */ H(dn, {
										target: e,
										position: jt,
										...t
									}, Zn(e));
								}),
								!S && !Ot.drag && (() => {
									let e = Ue && !Ue.inside ? Ue : !Ue && !Ie ? B : null;
									return e ? /* @__PURE__ */ H(un, {
										target: e,
										position: jt,
										open: Ue === e,
										onOpenChange: (t) => {
											Ge(t ? e : null), t || ut(null);
										},
										returnFocus: pt,
										children: /* @__PURE__ */ H(Kt, {
											types: [...p.values()],
											allowed: (t) => st(e.parentId, [t.name]),
											onChoose: (t) => St(t, e),
											onClose: () => Ge(null)
										})
									}, Zn(e)) : null;
								})(),
								Ot.drag && /* @__PURE__ */ H(hn, {
									drag: Ot.drag,
									position: jt
								})
							]
						})
					]
				}),
				fe && /* @__PURE__ */ U(Re, { children: [
					/* @__PURE__ */ H(rr, { slots: he }),
					l && /* @__PURE__ */ H(sr, {
						doc: fe,
						content: a,
						onChange: l,
						readOnly: S
					}),
					/* @__PURE__ */ H(ft, {
						root: fe,
						offset: At
					}),
					/* @__PURE__ */ H(or, {
						doc: fe,
						frame: A.current,
						scale: R.scale
					})
				] })
			]
		})]
	});
}
var rr = pe(function({ slots: e }) {
	let { store: t } = o(), n = G(t, (e) => e.nodes), r = new Set(e.filter((e) => !e.instance && e.prop === "items").map((e) => e.id)), i = /* @__PURE__ */ new Map();
	return /* @__PURE__ */ U(Re, { children: [e.filter((e) => e.instance || e.prop !== "items").map((e) => {
		let t = f(n, e.id);
		if (!t) return null;
		let r = `${e.instance ? "instance:" : ""}${e.id}:${e.prop}`, a = i.get(r) ?? 0;
		return i.set(r, a + 1), ze(e.instance ? /* @__PURE__ */ H(ir, {
			node: t,
			slot: e
		}) : [
			"text",
			"cite",
			"caption"
		].includes(e.prop) ? t.type === "paragraph" && e.prop === "text" ? /* @__PURE__ */ H(Jn, {
			node: t,
			prop: "text",
			tag: "span",
			placeholder: O("Write, or press “/” for blocks"),
			quiet: !0
		}) : /* @__PURE__ */ H(Jn, {
			node: t,
			prop: e.prop,
			tag: "span",
			placeholder: e.element.dataset.cmsPlaceholder ?? O("Write something…")
		}) : /* @__PURE__ */ H(ar, {
			node: t,
			prop: e.prop
		}), e.element, `${r}:${a}`);
	}), [...r].map((t) => {
		let r = f(n, t);
		return r ? /* @__PURE__ */ H(Yn, {
			node: r,
			renderItem: (n, r) => {
				let i = e.find((e) => e.id === t && e.prop === "items" && e.index === n);
				return i ? ze(r, i.element, `${t}:items:${n}`) : null;
			}
		}, t) : null;
	})] });
});
function ir({ node: e, slot: t }) {
	let { store: n, readOnly: r } = o(), i = G(n, (n) => n.focus?.id === e.id && n.focus.prop === `values.${t.prop}` ? n.focus : null), a = String((Object.prototype.hasOwnProperty.call(e.props.values ?? {}, t.prop) ? e.props.values[t.prop] : t.instance.value) ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
	return /* @__PURE__ */ H(J, {
		tag: "span",
		html: a,
		focus: i,
		plainText: !0,
		singleLine: t.instance.type === "text",
		disabled: r,
		placeholder: t.element.dataset.cmsPlaceholder ?? O("Write something…"),
		onFocus: () => n.select(e.id),
		onChange: (r, i) => n.updateProps(e.id, { values: {
			...f(n.get().nodes, e.id)?.props.values,
			[t.prop]: i.innerText
		} }, `instance:${e.id}:${t.prop}`),
		onKeyDown: (r, i) => {
			(r.key === "Escape" || r.key === "Enter" && t.instance.type === "text") && (r.preventDefault(), i.blur(), n.select(e.id, !0));
		}
	});
}
function ar({ node: e, prop: t }) {
	let { store: n, readOnly: r } = o(), i = G(n, (n) => n.focus?.id === e.id && n.focus.prop === t ? n.focus : null), a = String(e.props[t] ?? ""), s = t === "code" ? a.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>") : a;
	return /* @__PURE__ */ H(J, {
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
function or({ doc: e, frame: t, scale: n }) {
	let r = zn(), { store: i, types: a, allowed: s } = o(), [c, u] = P(null);
	if (ge(() => {
		u(r ? q(e) : null);
	}, [r, e]), Vn(!!r, [document, e]), !r || !c || !f(i.get().nodes, r.id)) return null;
	let d = (e) => {
		let t = b(e, a), n = i.get().nodes, o = m(n, r.id);
		if (!o || !t.length) return;
		let c = o.parentId ? f(n, o.parentId) : null, l = t.every((e) => te(c, e.type, a, c ? [] : s)) ? o : _(n, r.id, t.map((e) => e.type), a, s);
		l && (Rn(null), i.commit(C(g(n, r.id), l.parentId, l.index, t)), Cn(i, t[0], An(kn(i.get().nodes, a, () => !1))));
	}, p = t.getBoundingClientRect(), { maxHeight: h, ...v } = Bn({
		left: p.left + c.left * n,
		top: p.top + c.top * n,
		bottom: p.top + c.bottom * n
	});
	return ze(/* @__PURE__ */ H("div", {
		"data-cms-slash": !0,
		className: "cms-pop fixed z-overlay overflow-hidden !p-0",
		style: v,
		children: /* @__PURE__ */ H(l, {
			types: [...a.values()],
			query: r.query,
			showSearch: !1,
			compact: !0,
			style: { maxHeight: h },
			chooseFirst: r.enter,
			keyboardDocument: e,
			onChoose: d,
			onClose: () => Rn(null),
			onNoMatch: () => {
				Rn(null);
			},
			allowed: (e) => !!_(i.get().nodes, r.id, e.name, a, s)
		})
	}), document.body);
}
function sr({ doc: e, content: t, onChange: n, readOnly: r }) {
	let i = [...e.querySelectorAll("[data-cms-entry-field=\"title\"]")];
	return /* @__PURE__ */ H(Re, { children: i.map((i, a) => {
		let o = t.title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
		return ze(/* @__PURE__ */ H(J, {
			tag: "span",
			html: o,
			singleLine: !0,
			disabled: r,
			placeholder: O("Untitled"),
			onChange: (e, t) => n(t.textContent ?? ""),
			onKeyDown: (t, n) => {
				t.key === "Enter" && (t.preventDefault(), n.blur(), e.querySelector("[data-cms-editor-root] [contenteditable=\"true\"]")?.focus());
			}
		}), i, `title:${a}`);
	}) });
}
// admin/src/builder/controls.tsx
var cr = "w-[88px]", lr = "cms.inspector.collapsed";
function ur() {
	try {
		let e = JSON.parse(localStorage.getItem(lr) ?? "{}");
		return e && typeof e == "object" && !Array.isArray(e) ? Object.fromEntries(Object.entries(e).filter(([, e]) => typeof e == "boolean")) : {};
	} catch {
		return {};
	}
}
function dr({ title: e, children: t, open: n = !0, actions: r, empty: i, fields: a }) {
	let [o, s] = P(() => ur()[e] === void 0 ? n : !ur()[e]), c = (t) => {
		s(t);
		try {
			localStorage.setItem(lr, JSON.stringify({
				...ur(),
				[e]: !t
			}));
		} catch {}
	};
	return /* @__PURE__ */ U("section", {
		"data-section": e,
		className: "min-w-0 border-b border-border last:border-b-0",
		children: [/* @__PURE__ */ U("header", {
			className: "group/section flex h-10 items-center gap-1 pl-4 pr-3",
			children: [/* @__PURE__ */ U(F, {
				variant: "ghost",
				onClick: () => c(!o),
				"aria-expanded": o,
				className: B("!h-full min-w-0 flex-1 shrink !justify-start !gap-1 !rounded-none !bg-transparent !px-0 text-left !text-xs !font-semibold focus-visible:!-outline-offset-2", i ? "!text-muted" : "!text-ink"),
				children: [/* @__PURE__ */ H("span", {
					className: "min-w-0 truncate",
					children: e
				}), /* @__PURE__ */ H(I, {
					name: "chevron-down",
					size: 10,
					className: B("shrink-0 text-faint transition-[rotate,opacity] duration-fast", o ? "opacity-0 group-hover/section:opacity-100 group-focus-within/section:opacity-100" : "-rotate-90")
				})]
			}), r && /* @__PURE__ */ H("span", {
				className: "contents",
				onClickCapture: () => !o && c(!0),
				children: r
			})]
		}), o && /* @__PURE__ */ H("div", {
			className: "space-y-1 px-4 pb-3",
			children: i && r && !a ? /* @__PURE__ */ H("p", {
				className: "m-0 flex h-7 items-center text-xs text-faint",
				children: O("None")
			}) : t
		})]
	});
}
function fr({ children: e, className: t }) {
	return /* @__PURE__ */ H("div", {
		"data-section": "content",
		className: B("space-y-1 border-b border-border px-4 py-3 last:border-b-0", t),
		children: e
	});
}
function pr({ title: e, action: t }) {
	return /* @__PURE__ */ U("div", {
		className: "flex h-7 items-center justify-between pt-1",
		children: [/* @__PURE__ */ H("span", {
			className: "text-xs text-muted",
			children: e
		}), t]
	});
}
function mr({ field: e, children: t, htmlFor: n, className: r }) {
	let i = e.status, a = e.reset, o = t ?? e.label, s = B("flex min-h-7 min-w-0 shrink-0 items-center gap-1 text-left text-xs", cr, i === "own" ? "text-ink" : "text-muted", r), c = /* @__PURE__ */ H("span", {
		className: "min-w-0 py-1 leading-[1.25] [overflow-wrap:anywhere]",
		children: o
	});
	return i === "own" && a ? /* @__PURE__ */ H(ke, {
		content: O("Reset {label}", { label: String(e.label ?? "") }),
		children: /* @__PURE__ */ H(F, {
			variant: "ghost",
			onClick: a,
			className: B(s, "!h-auto !justify-start !gap-1 !whitespace-normal !rounded-xs !bg-transparent !px-0 !text-xs !font-normal !text-ink decoration-faint decoration-dotted underline-offset-[3px] hover:underline"),
			children: c
		})
	}) : i === "inherited" ? /* @__PURE__ */ U("label", {
		htmlFor: n,
		className: s,
		title: O("Inherited from a larger screen, another state or the component"),
		children: [c, /* @__PURE__ */ H("span", {
			className: "size-1 shrink-0 rounded-full bg-warning",
			"aria-hidden": !0
		})]
	}) : /* @__PURE__ */ H("label", {
		htmlFor: n,
		className: s,
		title: e.instructions,
		children: c
	});
}
function hr(e) {
	if (e.stack === !0 || Le.includes(e.type) && !e.component) return !0;
	if (e.type !== "select" || e.component || e.display !== "segmented") return !1;
	let t = Object.values(e.options ?? {}).map((e) => typeof e == "string" ? e : e && typeof e == "object" && "label" in e ? String(e.label ?? "") : "").filter(Boolean);
	return t.length > 3 || t.join(" ").length > 20;
}
var gr = (e) => e === "xs" || e === void 0 ? "sm" : e;
function Y({ fields: e, values: t, onChange: n, disabled: r, context: i = {}, className: a, bare: o }) {
	ve(ae.fields.subscribe, ae.fields.version);
	let s = le();
	return /* @__PURE__ */ H("div", {
		className: B("min-w-0", a ?? "space-y-1"),
		children: e.filter((e) => Ne(e, t)).map((e) => {
			let a = s?.fieldTypes.find((t) => t.key === e.type), c = ae.fields.get(e.component ?? a?.component ?? e.type) ?? ae.fields.get("json");
			if (!c) return null;
			let l = {
				...e,
				size: gr(e.size),
				fit: !0,
				id: Me(e, i.path)
			}, u = !o && hr(e), d = /* @__PURE__ */ H(c, {
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
				className: B("flex min-w-0", u ? "flex-col items-stretch" : "min-h-7 items-center gap-2", e.className),
				children: [!o && e.type !== "toggle" && /* @__PURE__ */ H(mr, {
					field: l,
					htmlFor: l.id,
					className: u ? "!w-auto" : void 0
				}), /* @__PURE__ */ H("div", {
					className: B("flex min-w-0 items-center", !u && "flex-1"),
					children: d
				})]
			}, e.handle);
		})
	});
}
var _r = "cms-input h-7 w-full min-w-0 rounded-sm px-2 text-sm placeholder:text-ghost";
function vr(e) {
	return Array.isArray(e) ? String(e[0]) : e && typeof e == "object" && "min" in e ? `${e.min}–${e.max}` : String(e);
}
function yr({ color: e, dark: t, className: n }) {
	return /* @__PURE__ */ U("span", {
		className: B("relative inline-block size-4 shrink-0 overflow-hidden rounded-xs align-middle cms-checkerboard [--checker:6px]", n),
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
var br = fe(function({ className: e, children: t, ...n }, r) {
	return /* @__PURE__ */ H(F, {
		ref: r,
		variant: "ghost",
		icon: "plus",
		className: B("w-full !justify-start !gap-1.5 !px-1.5 !text-xs !font-normal !text-muted hover:!text-ink", e),
		...n,
		children: t
	});
});
function xr({ onClick: e, label: t = O("Add") }) {
	return /* @__PURE__ */ H(ke, {
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
function Sr({ onClick: e, label: t = O("Remove") }) {
	return /* @__PURE__ */ H(ke, {
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
function Cr() {
	let { byPath: e } = r();
	return (t) => {
		if (typeof t != "string" || !t.startsWith("token:")) return null;
		let [n, r] = t.slice(6).split("/"), i = e.get(n);
		return i ? {
			token: i,
			alpha: r
		} : null;
	};
}
function wr(e) {
	let { byPath: t } = r();
	return (n) => {
		let r = n.trim().replace(/^\$/, "").replace(/^token:/, "");
		return t.has(r) ? `token:${r}` : e && t.has(`${e}.${r}`) && /^[a-z0-9-]+$/i.test(r) && !/^-?\d*\.?\d+$/.test(r) ? `token:${e}.${r}` : null;
	};
}
var Tr = (e) => vr(e.value);
function Er({ token: e, alpha: t, className: n }) {
	return /* @__PURE__ */ U("span", {
		className: B("inline-flex min-w-0 items-center gap-1 truncate rounded-xs bg-active px-1.5 leading-5 text-ink", n),
		title: `${e.path} · ${Tr(e)}`,
		children: [/* @__PURE__ */ H("span", {
			className: "truncate",
			children: e.group === "color" ? e.name : e.path
		}), t && /* @__PURE__ */ U("span", {
			className: "text-muted",
			children: ["/", t]
		})]
	});
}
function Dr({ group: e, value: t, onPick: n, detach: i }) {
	let { byGroup: a } = r(), o = a.get(e) ?? [], s = typeof t == "string" && t.startsWith("token:") ? t.slice(6).split("/")[0] : null;
	return o.length ? /* @__PURE__ */ U("div", { children: [
		/* @__PURE__ */ H("p", {
			className: "cms-label m-0 px-2 pb-1 pt-1.5 !text-2xs",
			children: O("Tokens")
		}),
		/* @__PURE__ */ H("div", {
			className: "max-h-60 overflow-y-auto",
			children: o.map((t) => /* @__PURE__ */ U(z, {
				compact: !0,
				onClick: () => n(`token:${t.path}`),
				className: B("flex h-7 w-full items-center gap-2 rounded-xs px-2 text-left text-xs hover:bg-hover", s === t.path && "bg-active"),
				children: [
					e === "color" && /* @__PURE__ */ H(yr, {
						color: String(t.value),
						dark: t.dark ? String(t.dark) : void 0
					}),
					e === "shadow" && /* @__PURE__ */ H("span", {
						className: "size-3.5 shrink-0 rounded-xs bg-bg",
						style: { boxShadow: String(t.value) }
					}),
					e === "radius" && /* @__PURE__ */ H("span", {
						className: "size-3.5 shrink-0 border-l-[1.5px] border-t-[1.5px] border-muted",
						style: { borderTopLeftRadius: String(t.value) }
					}),
					/* @__PURE__ */ H("span", {
						className: "min-w-0 truncate font-mono text-2xs",
						children: t.path
					}),
					/* @__PURE__ */ H("span", {
						className: "ml-auto max-w-[45%] shrink-0 truncate font-mono text-2xs text-faint",
						children: Tr(t)
					}),
					s === t.path && /* @__PURE__ */ H(I, {
						name: "check",
						size: 12,
						className: "shrink-0 text-focus"
					})
				]
			}, t.path))
		}),
		s && i && /* @__PURE__ */ U(z, {
			compact: !0,
			onClick: i,
			className: "mt-1 flex h-7 w-full items-center gap-2 rounded-xs border-t border-border px-2 text-xs text-muted hover:bg-hover hover:text-text",
			children: [/* @__PURE__ */ H(I, {
				name: "unlink",
				size: 12
			}), O("Detach Token")]
		})
	] }) : /* @__PURE__ */ H("p", {
		className: "m-0 px-2 py-2 text-2xs text-faint",
		children: O("No {group} tokens in the design.", { group: e })
	});
}
function Or({ group: e, value: t, onPick: n, active: i, className: a, trigger: o }) {
	let [s, c] = P(!1), { byGroup: l, byPath: u } = r();
	if (!(l.get(e) ?? []).length) return null;
	let d = (e) => {
		n(e), c(!1);
	};
	return /* @__PURE__ */ H(we, {
		open: s,
		onOpenChange: c,
		align: "end",
		className: "w-60 !p-1",
		trigger: o ?? /* @__PURE__ */ H(z, {
			compact: !0,
			className: B("grid size-5 shrink-0 place-items-center rounded-xs text-faint transition-opacity hover:bg-hover hover:text-ink", !i && !s && "opacity-0 group-hover/value:opacity-100 group-focus-within/value:opacity-100", (i || s) && "text-ink", a),
			"aria-label": O("Design Tokens"),
			title: O("Design Tokens"),
			children: /* @__PURE__ */ H(I, {
				name: "symbol",
				size: 10
			})
		}),
		children: /* @__PURE__ */ H(Dr, {
			group: e,
			value: t,
			onPick: d,
			detach: () => {
				let e = typeof t == "string" ? u.get(t.slice(6).split("/")[0]) : void 0;
				d(e && typeof e.value == "string" ? e.value : null);
			}
		})
	});
}
// admin/src/builder/fields/controls.tsx
function kr(e, t) {
	let n = (e) => Object.entries(e).every(([e, n]) => Array.isArray(n) ? n.includes(t[e]) : t[e] === n), r = e.if, i = e.unless;
	return (!r || n(r)) && !(i && Object.entries(i).every(([e, n]) => Array.isArray(n) ? n.includes(t[e] ?? null) : (t[e] ?? null) === n));
}
function Ar({ field: e, ...t }) {
	let n = ae.fields.get(e.component ?? e.type) ?? ae.fields.get("json");
	return n ? /* @__PURE__ */ H("div", {
		className: B("min-w-0 flex-1", e.className),
		children: /* @__PURE__ */ H(n, {
			field: e,
			...t,
			context: t.context ?? {}
		})
	}) : null;
}
function jr({ className: e, children: t }) {
	return /* @__PURE__ */ H("div", {
		className: B("relative flex min-w-0 flex-1 items-center gap-1", e),
		children: t
	});
}
var Mr = /^(-?\d*\.?\d+)([a-z%]*)$/i, Nr = {
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
}, Pr = (e, t, n) => Math.min(n ?? Infinity, Math.max(t ?? -Infinity, e)), Fr = (e) => Math.round(e * 1e3) / 1e3;
function Ir(e) {
	return e.field.percent ? /* @__PURE__ */ H(Lr, { ...e }) : /* @__PURE__ */ H(Vr, { ...e });
}
function Lr({ field: e, value: t, onChange: n, ...r }) {
	let i = t == null || t === "" ? null : Number(t), a = (e) => typeof e == "number" ? Math.round(e * 100) : void 0, o = e.slider;
	return /* @__PURE__ */ H(Vr, {
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
function Rr(e, t) {
	let [n, r] = P(!1), i = t(e);
	return M(() => {
		if (i) return r(!1);
		let e = window.setTimeout(() => r(!0), 700);
		return () => window.clearTimeout(e);
	}, [e, i]), {
		shown: n && !i,
		show: () => r(!0)
	};
}
var zr = {
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
function Br(e, t, n) {
	if (typeof CSS > "u") return !0;
	let r = e.replace(/token:[a-z]+\.[a-z0-9-]+(\/\d{1,3})?/g, "var(--token)"), i = t.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`);
	return /^-?[a-z]+(-[a-z]+)*$/.test(i) && CSS.supports(i, "inherit") ? CSS.supports(i, r) : (zr[n] ?? zr.length).some((e) => CSS.supports(e, r));
}
function Vr({ field: e, value: t, onChange: n, disabled: r, context: i }) {
	let a = Cr(), o = wr(e.group), [s, c] = P(null), [l, u] = P(null), d = N(null), f = N(null), [p, m] = P(0);
	ge(() => {
		let e = f.current ? f.current.offsetWidth + 4 : 0;
		e !== p && m(e);
	});
	let h = t == null || t === "" ? void 0 : String(t), g = e.unit ?? "px", _ = e.step ?? 1, v = e.min, y = e.max, b = e.group, x = e.prefixIcon ? /* @__PURE__ */ H(I, {
		name: e.prefixIcon,
		size: 13
	}) : e.prefix, S = e.slider, ee = e.menu, te = e.action, C = e.keywords ?? [], w = a(h), T = h?.match(Mr), E = T ? T[2] || g : h ? "" : l ?? g, ne = g ? e.units ?? Nr[g] ?? [g] : [], D = !h || !!T, re = (e, t = E) => n(`${Fr(Pr(e, v, y))}${t}`), ie = (e) => {
		D && re((T ? parseFloat(T[1]) : 0) + e);
	}, ae = (e, t) => {
		if (r || e.button !== 0 || document.activeElement === e.currentTarget || !D) return;
		e.preventDefault();
		let n = e.clientX, i = T ? parseFloat(T[1]) : 0, a = !1, o = (e) => {
			let t = e.clientX - n;
			!a && Math.abs(t) < 3 || (a = !0, document.body.style.cursor = "ew-resize", re(i + Math.round(t / 2) * _ * (e.shiftKey ? 10 : e.altKey ? .1 : 1)));
		}, s = () => {
			window.removeEventListener("pointermove", o), window.removeEventListener("pointerup", s), document.body.style.cursor = "", !a && t && d.current?.focus();
		};
		window.addEventListener("pointermove", o), window.addEventListener("pointerup", s);
	}, oe = (t) => t === "" ? null : o(t) || (/^-?\d*\.?\d+$/.test(t) ? E ? `${t}${E}` : t : C.includes(t) || Br(t, e.property ?? e.handle, g) ? t : void 0), se = Rr(s ?? "", (e) => s === null || oe(e.trim()) !== void 0), k = () => {
		if (s === null) return;
		let e = s.trim();
		if (c(null), e === (T ? T[1] : h ?? "")) return;
		let t = oe(e);
		t !== void 0 && n(t);
	}, ce = (e) => {
		T ? n(`${T[1]}${e}`) : h || u(e);
	};
	return /* @__PURE__ */ U(jr, { children: [
		S && /* @__PURE__ */ H(Ar, {
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
			value: T ? parseFloat(T[1]) : null,
			onChange: (e) => n(e),
			disabled: r,
			context: i
		}),
		/* @__PURE__ */ U("div", {
			className: B("group/value relative flex h-7 min-w-0 flex-1 items-center", S && "!w-16 !flex-none"),
			title: e.title,
			children: [
				x !== void 0 && /* @__PURE__ */ H("span", {
					onPointerDown: (e) => ae(e, !0),
					className: "absolute left-0 z-raised grid h-7 w-6 cursor-ew-resize select-none place-items-center text-xs text-faint hover:text-ink",
					children: x
				}),
				w && s === null ? /* @__PURE__ */ H(Or, {
					group: b ?? w.token.group,
					value: h,
					onPick: n,
					trigger: /* @__PURE__ */ H(z, {
						compact: !0,
						onDoubleClick: () => c(h ?? ""),
						className: B(_r, "flex items-center pr-1 text-left", x !== void 0 && "!pl-6"),
						children: /* @__PURE__ */ H(Er, {
							token: w.token,
							alpha: w.alpha,
							className: "text-xs"
						})
					})
				}) : /* @__PURE__ */ H("input", {
					ref: d,
					id: Me(e),
					value: s ?? (T ? T[1] : h ?? ""),
					placeholder: e.placeholder,
					disabled: r,
					autoComplete: "off",
					spellCheck: !1,
					onPointerDown: (e) => ae(e, !0),
					onChange: (e) => c(e.target.value),
					onFocus: (e) => e.target.select(),
					onBlur: k,
					"aria-invalid": se.shown || void 0,
					onKeyDown: (e) => {
						e.key === "Enter" && (s !== null && oe(s.trim()) === void 0 ? se.show() : e.target.blur()), e.key === "Escape" && (c(null), requestAnimationFrame(() => d.current?.blur())), (e.key === "ArrowUp" || e.key === "ArrowDown") && D && (e.preventDefault(), c(null), ie((e.key === "ArrowUp" ? 1 : -1) * _ * (e.shiftKey ? 10 : e.altKey ? .1 : 1)));
					},
					className: B(_r, "tabular-nums", D && !r && "cursor-ew-resize focus:cursor-text", x !== void 0 && "!pl-6"),
					style: { paddingRight: p + 6 }
				}),
				(!w || s !== null) && /* @__PURE__ */ U("div", {
					ref: f,
					className: "pointer-events-none absolute inset-y-0 right-1 flex items-center",
					children: [
						b && /* @__PURE__ */ H(Or, {
							group: b,
							value: h,
							onPick: n,
							className: "pointer-events-auto"
						}),
						E && ne.length > 0 && /* @__PURE__ */ H(xe, {
							align: "end",
							trigger: /* @__PURE__ */ H(z, {
								compact: !0,
								disabled: r,
								className: B("pointer-events-auto h-5 min-w-5 rounded-xs px-1 text-2xs text-faint hover:bg-hover hover:text-ink data-[popup-open]:opacity-100"),
								"aria-label": O("Unit"),
								children: E
							}),
							items: [...ne.map((e) => ({
								label: e,
								checked: e === E,
								onSelect: () => ce(e)
							})), ...C.length ? [{
								separator: !0,
								label: ""
							}, ...C.map((e) => ({
								label: e,
								checked: h === e,
								onSelect: () => n(e)
							}))] : []]
						}),
						!E && g && C.length > 0 && h && C.includes(h) && /* @__PURE__ */ H(xe, {
							align: "end",
							trigger: /* @__PURE__ */ H(z, {
								compact: !0,
								className: "pointer-events-auto grid size-5 place-items-center rounded-xs text-faint hover:bg-hover hover:text-ink",
								"aria-label": O("Unit"),
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
		ee && /* @__PURE__ */ H(xe, {
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
		te && /* @__PURE__ */ H(z, {
			compact: !0,
			onClick: () => n(te.value),
			className: "grid size-7 shrink-0 place-items-center rounded-sm text-muted hover:bg-hover hover:text-ink",
			title: te.label,
			"aria-label": te.label,
			children: /* @__PURE__ */ H(I, {
				name: te.icon,
				size: 14
			})
		})
	] });
}
// admin/src/builder/fields/composite.tsx
var Hr = {
	2: "grid grid-cols-2",
	3: "grid grid-cols-3",
	4: "grid grid-cols-4"
};
function Ur({ field: e, value: t, onChange: n, disabled: r, context: i }) {
	let a = t ?? {}, o = e.link, [s, c] = P(!o || e.split === !0), l = (s ? e.fields ?? [] : [o]).filter((e) => kr(e, a)), u = s ? Hr[e.columns] : void 0;
	return /* @__PURE__ */ U(jr, { children: [/* @__PURE__ */ H("div", {
		className: B("min-w-0 flex-1 gap-1", u ?? "flex items-center"),
		children: l.map((e) => /* @__PURE__ */ H(Ar, {
			field: e,
			value: a[e.handle] ?? e.default ?? null,
			onChange: (t) => n({
				...a,
				[e.handle]: t
			}),
			disabled: r,
			context: i
		}, e.handle))
	}), o && /* @__PURE__ */ H(z, {
		compact: !0,
		onClick: () => c(!s),
		className: "grid size-7 shrink-0 place-items-center rounded-sm text-muted hover:bg-hover hover:text-ink",
		title: s ? e.joinLabel ?? O("The same for all") : e.splitLabel ?? O("Each One"),
		children: /* @__PURE__ */ H(I, {
			name: s ? "square" : "radius",
			size: 14
		})
	})] });
}
function Wr({ field: e, value: t, onChange: n, disabled: r, context: i }) {
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
				}) : /* @__PURE__ */ H(Ar, {
					field: {
						handle: `${e.handle}-${t}`,
						type: o.options ? "select" : "text",
						size: "sm",
						commit: "blur",
						label: O("Name"),
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
				/* @__PURE__ */ H(Ar, {
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
				/* @__PURE__ */ H(Sr, { onClick: () => n(Object.fromEntries(Object.entries(a).filter(([e]) => e !== t))) })
			]
		}, t))
	});
}
function Gr(e, t) {
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
var Kr = () => [
	{
		path: "entry.author.name",
		label: O("Author"),
		group: O("Page")
	},
	{
		path: "entry.title",
		label: O("Title"),
		group: O("Page")
	},
	{
		path: "entry.url",
		label: O("Link"),
		group: O("Page")
	},
	{
		path: "entry.date|date:F j, Y",
		label: O("Published Date"),
		group: O("Page")
	},
	{
		path: "entry.updated|date:F j, Y",
		label: O("Updated Date"),
		group: O("Page")
	},
	{
		path: "entry.parent.title",
		label: O("Parent Title"),
		group: O("Page")
	},
	{
		path: "entry.prev.url",
		label: O("Previous Page Link"),
		group: O("Page")
	},
	{
		path: "entry.prev.title",
		label: O("Previous Page Title"),
		group: O("Page")
	},
	{
		path: "entry.next.url",
		label: O("Next Page Link"),
		group: O("Page")
	},
	{
		path: "entry.next.title",
		label: O("Next Page Title"),
		group: O("Page")
	}
], qr = () => [
	{
		path: "site.name",
		label: O("Site Name"),
		group: O("Site")
	},
	{
		path: "site.description",
		label: O("Site Description"),
		group: O("Site")
	},
	{
		path: "site.url",
		label: O("Site URL"),
		group: O("Site")
	},
	{
		path: "© {site.year} {site.name}",
		label: O("Copyright Line"),
		group: O("Site")
	},
	{
		path: "page.uri",
		label: O("Current Path"),
		group: O("Site")
	},
	{
		path: "pagination.prev",
		label: O("Previous Page of a List"),
		group: O("Pagination")
	},
	{
		path: "pagination.next",
		label: O("Next Page of a List"),
		group: O("Pagination")
	},
	{
		path: "{pagination.current} / {pagination.total}",
		label: O("Page x of y"),
		group: O("Pagination")
	}
];
function Jr(e) {
	let { store: t, doc: n, catalog: r } = o(), i = ce(), a = G(t, (t) => d(t.nodes, e.id)), s = k("entries/get", { id: n?.id ?? "" }, {
		enabled: n?.kind === "entry",
		staleTime: 6e4
	}), c = n?.kind === "template" ? n.collections?.length ? n.collections : i.collections.filter((e) => e.routable).map((e) => e.handle).slice(0, 1) : s.data ? [s.data.collection] : [], l = k("collections/get", { handle: c[0] ?? "" }, {
		enabled: !!c[0],
		staleTime: 3e5
	}), u = [];
	for (let e of [...a].reverse()) {
		if (e.type !== "repeat") continue;
		let t = e.props?.as || "item", n = r.sources?.find((t) => t.name === e.props?.source), i = O("{list} item ({name})", {
			list: n?.label ?? O("List"),
			name: t
		});
		for (let [e, r] of Object.entries(n?.item ?? {})) u.push({
			path: `${t}.${e}`,
			label: r,
			group: i
		});
		e.props?.source === "entries" && e.props?.collection && u.push({
			path: `${t}.excerpt`,
			label: O("Excerpt Field"),
			group: i
		}, {
			path: `${t}.cover`,
			label: O("Cover Image Field"),
			group: i
		}), e.props?.source === "list" && u.push({
			path: `{${t}}`,
			label: O("The Item Itself (Text)"),
			group: i
		}), u.push({
			path: "index",
			label: O("Position (1, 2, 3…)"),
			group: i
		}, {
			path: "first",
			label: O("Is First"),
			group: i
		}, {
			path: "last",
			label: O("Is Last"),
			group: i
		});
	}
	if (n?.kind === "component") for (let e of n.props ?? []) u.push({
		path: `props.${e.handle}`,
		label: e.label ?? e.handle,
		group: O("Component Properties")
	});
	u.push(...Kr());
	for (let e of l.data?.fields ?? []) e.type !== "blocks" && u.push({
		path: `entry.${e.handle}${e.type === "date" ? "|date:F j, Y" : ""}`,
		label: e.label,
		group: O("Page Fields")
	});
	u.push(...qr());
	for (let e of i.globals) u.push({
		path: `globals.${e.handle}.`,
		label: O("{name} (add a field handle)", { name: e.title }),
		group: O("Globals")
	});
	return u;
}
// admin/src/builder/content/ContentPanel.tsx
var Yr = [
	"text",
	"textarea",
	"richtext",
	"markdown"
], Xr = (e, t) => !e.if || Object.entries(e.if).every(([e, n]) => {
	let r = t[e] ?? null;
	return Array.isArray(n) ? n.includes(r) : r === n;
});
function Zr({ field: e, value: t, bound: n, paths: r, onValue: i, onBind: a, extra: o }) {
	let s = e.type === "richtext" && e.inline && e.handle !== "text" && !e.component ? {
		...e,
		component: "blocks-inline-text"
	} : e, c = !n && Le.includes(s.type) && !s.component, l = !n && hr(s), u = !n && s.type === "toggle", d = n ? {
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
	}, f = { [s.handle]: n ?? t }, p = (e, t) => n ? a(t) : i(t), m = c ? /* @__PURE__ */ H(be, {
		bare: !0,
		fields: [d],
		values: f,
		onChange: p,
		className: "min-w-0"
	}) : /* @__PURE__ */ H(Y, {
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
	let h = /* @__PURE__ */ H(ke, {
		content: O(n ? "Disconnect from Data" : "Connect to Data"),
		children: /* @__PURE__ */ H(L, {
			icon: "database",
			size: "xs",
			label: O(n ? "Disconnect from Data" : "Connect to Data"),
			title: void 0,
			onClick: () => a(n ? null : r[0]?.path ?? "entry.title"),
			className: B("overflow-hidden", n ? "!text-ink" : "!w-0 !text-faint hover:!text-ink focus-visible:!w-6 group-hover/prop:!w-6 [@media(hover:none)]:!w-6")
		})
	}), g = /* @__PURE__ */ U("span", {
		className: B("flex h-7 min-w-0 shrink-0 items-center gap-0.5", !l && "w-[88px]"),
		children: [/* @__PURE__ */ H("label", {
			htmlFor: Me(s),
			className: B("min-w-0 flex-1 truncate text-xs", n ? "text-ink" : "text-muted"),
			title: s.instructions,
			children: s.label
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
function Qr({ node: e }) {
	let { store: t, types: n } = o(), r = n.get(e.type), i = Jr(e), a = lt().filter((t) => t.id !== (e.anchor ?? e.props?.anchor)), s = e.bind ?? {}, c = {
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
	].includes(e.handle))), f = d.some((e) => e.component === "link") && d.some((e) => e.handle === "new_tab"), p = d.filter((e) => !(f && e.handle === "new_tab") && Xr(e, c)), m = p.filter((e) => !e.advanced), h = p.filter((e) => e.advanced), g = (t) => /* @__PURE__ */ H(Zr, {
		field: t,
		value: e.props?.[t.handle],
		bound: s[t.handle],
		paths: i,
		onValue: (e) => u(t.handle, e),
		onBind: (e) => l(t.handle, e),
		extra: v(t)
	}, t.handle), _ = e.type === "repeat", v = (t) => t.component === "link" || t.type === "url" ? {
		anchors: a,
		...f ? {
			newTab: !!e.props?.new_tab,
			onNewTab: (e) => u("new_tab", e || void 0)
		} : {}
	} : void 0;
	return !r && e.type !== "component" ? /* @__PURE__ */ U(fr, { children: [/* @__PURE__ */ H(Se, {
		title: O("Its plugin is off"),
		children: O("This block is kept as it is and shows again when its plugin is turned on.")
	}), Object.keys(e.props ?? {}).length > 0 && /* @__PURE__ */ H("pre", {
		"aria-label": O("Settings"),
		className: "m-0 mt-3 overflow-x-auto rounded-md bg-sunken p-3 font-mono text-xs text-muted",
		children: JSON.stringify(e.props, null, 2)
	})] }) : /* @__PURE__ */ U("div", { children: [
		e.type === "component" ? /* @__PURE__ */ H($r, {
			node: e,
			paths: i,
			setBind: l,
			anchors: a
		}) : _ ? /* @__PURE__ */ H(ei, { node: e }) : m.length > 0 && /* @__PURE__ */ H(fr, { children: m.map(g) }),
		/* @__PURE__ */ H(dr, {
			title: O("Visibility"),
			open: !!(s.visible || s.hidden || e.hidden),
			empty: !s.visible && !s.hidden && !e.hidden,
			children: /* @__PURE__ */ H(Y, {
				fields: [
					{
						handle: "shown",
						type: "toggle",
						size: "sm",
						label: O("Show on the Site")
					},
					{
						handle: "visible",
						type: "text",
						component: "blocks-bind",
						label: O("Only If"),
						paths: i,
						placeholder: O("Always"),
						status: s.visible ? "own" : void 0,
						reset: () => l("visible", null)
					},
					{
						handle: "hidden",
						type: "text",
						component: "blocks-bind",
						label: O("Hide If"),
						paths: i,
						placeholder: O("Never"),
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
		/* @__PURE__ */ U(dr, {
			title: O("Advanced"),
			open: !1,
			empty: !e.anchor && !e.attrs && !e.class && !e.persist && !h.some((t) => e.props?.[t.handle] !== void 0 && e.props?.[t.handle] !== t.default),
			children: [
				_ ? /* @__PURE__ */ H(ti, { node: e }) : h.map(g),
				/* @__PURE__ */ H(Y, {
					fields: [
						{
							handle: "label",
							type: "text",
							size: "sm",
							commit: "blur",
							label: O("Layer Name"),
							placeholder: r?.title
						},
						...h.some((e) => e.handle === "anchor") && !e.anchor ? [] : [{
							handle: "anchor",
							type: "text",
							size: "sm",
							commit: "blur",
							label: O("Anchor"),
							placeholder: O("None"),
							mono: !0
						}],
						{
							handle: "class",
							type: "text",
							size: "sm",
							commit: "blur",
							label: O("Classes"),
							placeholder: O("None"),
							mono: !0
						},
						...E("site.code") ? [{
							handle: "persist",
							type: "text",
							size: "sm",
							commit: "blur",
							label: O("Persist As"),
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
				/* @__PURE__ */ H(pr, {
					title: O("Attributes"),
					action: /* @__PURE__ */ H(xr, {
						label: O("Add Attribute"),
						onClick: () => t.updateNode(e.id, { attrs: {
							...e.attrs ?? {},
							"aria-label": ""
						} })
					})
				}),
				/* @__PURE__ */ H(Y, {
					bare: !0,
					fields: [{
						handle: "attrs",
						type: "json",
						component: "blocks-pairs",
						className: "items-start",
						label: O("Attributes"),
						key: { lower: !0 },
						item: {
							handle: "value",
							type: "text",
							size: "sm",
							commit: "blur",
							label: O("Value")
						},
						items: Object.fromEntries(Object.keys(e.attrs ?? {}).filter((e) => s[`attr:${e}`]).map((e) => [e, {
							handle: "bind",
							type: "text",
							component: "blocks-bind",
							label: O("Data"),
							paths: i
						}]))
					}],
					values: { attrs: Object.fromEntries(Object.entries(e.attrs ?? {}).map(([e, t]) => [e, s[`attr:${e}`] ?? t])) },
					onChange: (n, r) => {
						let i = e.attrs ?? {}, a = Gr(Object.fromEntries(Object.entries(i).map(([e, t]) => [e, s[`attr:${e}`] ?? t])), r);
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
				/* @__PURE__ */ H(pr, {
					title: O("States from Data"),
					action: /* @__PURE__ */ H(xr, {
						label: O("Add State from Data"),
						onClick: () => l("state:active", i[0]?.path ?? "item.active")
					})
				}),
				/* @__PURE__ */ H(Y, {
					bare: !0,
					fields: [{
						handle: "states",
						type: "json",
						component: "blocks-pairs",
						className: "items-start",
						label: O("States from Data"),
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
							label: O("Data"),
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
function $r({ node: e, paths: t, setBind: n, anchors: r }) {
	let { store: i } = o(), a = k("components/list", { working: !0 }, { staleTime: 3e4 }), s = a.data?.find((t) => t.handle === e.props?.ref), c = e.props?.values ?? {}, l = e.bind ?? {};
	return /* @__PURE__ */ U(fr, { children: [
		/* @__PURE__ */ H(Y, {
			fields: [{
				handle: "ref",
				type: "select",
				size: "sm",
				label: O("Component"),
				required: !0,
				options: (a.data ?? []).map((e) => ({
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
		(s?.props ?? []).map((a) => /* @__PURE__ */ H(Zr, {
			field: {
				...a,
				placeholder: a.placeholder ?? (Yr.includes(a.type) ? a.label : void 0)
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
		/* @__PURE__ */ U("div", {
			className: "-ml-2 flex gap-1 pt-1",
			children: [s?.id && /* @__PURE__ */ H(F, {
				size: "sm",
				variant: "ghost",
				icon: "edit",
				onClick: () => re(`/content/components/${s.id}`),
				children: O("Edit Component")
			}), /* @__PURE__ */ H(F, {
				size: "sm",
				variant: "ghost",
				icon: "scissors",
				onClick: () => {
					if (!s) return;
					let t = m(i.get().nodes, e.id);
					if (!t) return;
					let n = s.blocks.map((e) => x(e));
					i.commit(C(g(i.get().nodes, e.id), t.parentId, t.index, n)), i.select(n[0]?.id ?? null);
				},
				disabled: !s,
				children: O("Detach")
			})]
		})
	] });
}
function ei({ node: e }) {
	let { store: t, catalog: n } = o(), r = n.sources?.find((t) => t.name === e.props?.source), i = (n, r) => t.updateProps(e.id, { [n]: r }, `repeat:${e.id}:${n}`);
	return /* @__PURE__ */ U(fr, { children: [
		/* @__PURE__ */ H(Y, {
			fields: [{
				handle: "source",
				type: "select",
				size: "sm",
				label: O("List"),
				required: !0,
				options: (n.sources ?? []).map((e) => ({
					value: e.name,
					label: e.label
				}))
			}],
			values: { source: e.props?.source },
			onChange: (e, t) => t && i("source", t)
		}),
		/* @__PURE__ */ H(Y, {
			fields: (r?.fields ?? []).map((e) => ({
				...e,
				size: "sm",
				width: "full"
			})),
			values: Object.fromEntries((r?.fields ?? []).map((t) => [t.handle, e.props?.[t.handle]])),
			onChange: (e, t) => i(e, t)
		}),
		/* @__PURE__ */ H(Y, {
			fields: [{
				handle: "empty",
				type: "text",
				size: "sm",
				commit: "blur",
				label: O("When Empty"),
				placeholder: O("Show Nothing")
			}],
			values: { empty: e.props?.empty },
			onChange: (e, t) => i(e, t || void 0)
		})
	] });
}
function ti({ node: e }) {
	let { store: t } = o(), n = (n, r) => t.updateProps(e.id, { [n]: r }, `repeat:${e.id}:${n}`);
	return /* @__PURE__ */ H(Y, {
		fields: [{
			handle: "tag",
			type: "select",
			size: "sm",
			label: O("HTML Tag"),
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
			label: O("Item Name"),
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
function ni(e) {
	let { store: t } = o(), n = G(t, (e) => e.breakpoint), r = G(t, (e) => e.state), i = He(n, r), a = Ue(n, r), s = e.style ?? {}, c = (e) => {
		for (let t of a) {
			let n = s[t];
			if (n && n[e] !== void 0) return {
				value: String(n[e]),
				from: t
			};
		}
		return {
			value: void 0,
			from: null
		};
	}, l = (e) => c(e).value, u = (e) => {
		let { from: t } = c(e);
		return t === i ? "own" : t ? "inherited" : "none";
	}, d = (n, r) => {
		let a = { ...s[i] ?? {} };
		for (let [e, t] of Object.entries(n)) t == null || t === "" ? delete a[e] : a[e] = t;
		let o = {
			...s,
			[i]: a
		};
		Object.keys(a).length === 0 && delete o[i], t.updateNode(e.id, { style: Object.keys(o).length ? o : void 0 }, r ?? `style:${e.id}:${Object.keys(n).join(",")}`);
	};
	return {
		variant: i,
		breakpoint: n,
		state: r,
		style: s,
		value: l,
		status: u,
		set: (e, t) => d({ [e]: t }),
		write: d,
		own: () => Object.keys(s[i] ?? {})
	};
}
// admin/src/builder/css.ts
function ri(e) {
	let t = [], n = 0, r = "";
	for (let i of e.trim()) i === "(" && n++, i === ")" && n--, /\s/.test(i) && n === 0 ? (r && t.push(r), r = "") : r += i;
	return r && t.push(r), t;
}
function ii(e) {
	let t = [], n = 0, r = "";
	for (let i of e) i === "(" && n++, i === ")" && n--, i === "," && n === 0 ? (t.push(r.trim()), r = "") : r += i;
	return r.trim() && t.push(r.trim()), t;
}
function ai(e) {
	if (e === void 0 || e === "") return null;
	let t = ri(String(e));
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
	return /* @__PURE__ */ H(Y, {
		bare: n,
		fields: a,
		values: i,
		onChange: (t, n) => {
			let a = r.find((e) => e.handle === t);
			if (a.set) return a.set(n);
			if (!n || typeof n != "object") return e.set(t, n);
			let o = si(i[t] ?? {}, n);
			Object.keys(o).length && e.write(o);
		}
	});
}
var oi = (e) => e === "none" ? void 0 : e;
function si(e, t) {
	return Object.fromEntries(Object.entries(t ?? {}).filter(([t, n]) => n !== e[t]));
}
// admin/src/builder/design/Border.tsx
var ci = [
	"borderTopLeftRadius",
	"borderTopRightRadius",
	"borderBottomRightRadius",
	"borderBottomLeftRadius"
], li = [
	"borderTop",
	"borderRight",
	"borderBottom",
	"borderLeft"
], ui = [
	"solid",
	"dashed",
	"dotted",
	"double",
	"none"
], di = (e) => ui.includes(e), fi = (e) => /^-?[\d.]/.test(e) || /^token:(space|border)/.test(e) || /^(thin|medium|thick)$/.test(e);
function pi(e) {
	let t = ri(e ?? "");
	return {
		width: t.find(fi),
		style: t.find(di),
		color: t.find((e) => !fi(e) && !di(e))
	};
}
var mi = (e) => e.width || e.style || e.color ? [
	e.width ?? "1px",
	e.style ?? "solid",
	e.color
].filter(Boolean).join(" ") : null, hi = () => [
	{
		value: "solid",
		label: O("Solid")
	},
	{
		value: "dashed",
		label: O("Dashed")
	},
	{
		value: "dotted",
		label: O("Dotted")
	},
	{
		value: "double",
		label: O("Double")
	},
	{
		value: "none",
		label: O("None")
	}
];
function gi({ s: e }) {
	let [t, n] = P(() => li.find((t) => e.value(t)) ?? "all"), r = pi(e.value("border")), i = {
		width: e.value("borderWidth") ?? r.width,
		style: e.value("borderStyle") ?? r.style,
		color: e.value("borderColor") ?? r.color
	}, a = t === "all" ? i : pi(e.value(t)), o = ci.map((t) => e.value(t)), s = (t) => e.value(ci[t]) ?? ai(e.value("borderRadius"))?.[t], c = pi(e.value("outline")), l = i.width || i.style || i.color || e.value("borderRadius") || o.some(Boolean) || li.some((t) => e.value(t)) || e.value("outline"), u = (t) => (t === "all" ? [
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
		}) : e.set(t, mi(r));
	}, p = (e, t, n) => ({
		value: e,
		icon: t,
		title: d(e) ? `${n} · ${d(e) === "own" ? O("set") : O("inherited")}` : n
	});
	return /* @__PURE__ */ U(dr, {
		title: O("Border"),
		empty: !l,
		children: [/* @__PURE__ */ H(X, {
			s: e,
			fields: [
				{
					handle: "edge",
					type: "select",
					display: "segmented",
					block: !0,
					required: !0,
					size: "sm",
					label: O("Sides"),
					keys: [],
					get: () => t,
					set: (e) => e && n(e),
					options: [
						p("all", "b-side-all", O("All Sides")),
						p("borderTop", "b-side-top", O("Top")),
						p("borderRight", "b-side-right", O("Right")),
						p("borderBottom", "b-side-bottom", O("Bottom")),
						p("borderLeft", "b-side-left", O("Left"))
					]
				},
				{
					handle: "line",
					type: "group",
					component: "blocks-group",
					label: O("Width"),
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
					set: (e) => f(si({
						width: a.width,
						style: a.style
					}, e)),
					fields: [{
						handle: "width",
						type: "text",
						component: "blocks-value",
						label: O("Width"),
						placeholder: "0",
						min: 0,
						prefixIcon: "square"
					}, {
						handle: "style",
						type: "select",
						size: "sm",
						label: O("Style"),
						options: hi(),
						placeholder: O("Style")
					}]
				},
				{
					handle: "lineColor",
					type: "color",
					component: "blocks-color",
					label: O("Color"),
					placeholder: O("Text Color"),
					keys: t === "all" ? ["border", "borderColor"] : [t],
					status: t === "all" ? oi(e.status("borderColor")) : d(t),
					get: () => a.color,
					set: (e) => f({ color: e ?? void 0 })
				},
				{
					handle: "radius",
					type: "group",
					component: "blocks-group",
					label: O("Radius"),
					status: e.status("borderRadius") === "own" || ci.some((t) => e.status(t) === "own") ? "own" : oi(e.status("borderRadius")),
					keys: ["borderRadius", ...ci],
					columns: 2,
					split: o.some(Boolean),
					splitLabel: O("Each Corner"),
					joinLabel: O("Same radius for every corner"),
					link: {
						handle: "borderRadius",
						type: "text",
						component: "blocks-value",
						label: O("Radius"),
						group: "radius",
						prefixIcon: "frame",
						placeholder: "0",
						min: 0
					},
					fields: ci.map((e, t) => ({
						handle: e,
						type: "text",
						component: "blocks-value",
						label: [
							O("Top Left"),
							O("Top Right"),
							O("Bottom Right"),
							O("Bottom Left")
						][t],
						title: [
							O("Top Left"),
							O("Top Right"),
							O("Bottom Right"),
							O("Bottom Left")
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
						...Object.fromEntries(ci.map((e, t) => [e, s(t)]))
					}),
					set: (t) => {
						if (t.borderRadius !== e.value("borderRadius")) return e.set("borderRadius", t.borderRadius);
						e.write({
							borderRadius: null,
							...Object.fromEntries(ci.map((e) => [e, t[e] ?? null]))
						});
					}
				}
			]
		}), /* @__PURE__ */ H("div", {
			className: "!mt-3 border-t border-border pt-2",
			children: /* @__PURE__ */ H(X, {
				s: e,
				fields: [
					{
						handle: "outlineLine",
						type: "group",
						component: "blocks-group",
						label: O("Outline"),
						keys: ["outline"],
						get: () => ({
							width: c.width,
							style: c.style
						}),
						set: (t) => e.set("outline", mi({
							...c,
							...si({
								width: c.width,
								style: c.style
							}, t)
						})),
						fields: [{
							handle: "width",
							type: "text",
							component: "blocks-value",
							label: O("Width"),
							placeholder: "0",
							min: 0,
							prefixIcon: "selection"
						}, {
							handle: "style",
							type: "select",
							size: "sm",
							label: O("Style"),
							options: hi(),
							placeholder: O("Style")
						}]
					},
					c.width || c.style ? {
						handle: "outlineColor",
						type: "color",
						component: "blocks-color",
						label: O("Outline Color"),
						placeholder: O("Text Color"),
						keys: ["outline"],
						get: () => c.color,
						set: (t) => e.set("outline", mi({
							...c,
							color: t ?? void 0
						}))
					} : null,
					c.width || c.style || e.value("outlineOffset") ? {
						handle: "outlineOffset",
						type: "text",
						component: "blocks-value",
						label: O("Offset"),
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
}), _i = (e, t = {}) => ({
	label: e,
	type: "text",
	component: "blocks-value",
	unit: "",
	placeholder: "0",
	...t
}), vi = (e) => ({
	label: e,
	type: "color",
	component: "blocks-color",
	placeholder: O("None")
}), $ = (e, t = "") => ({
	label: e,
	type: "text",
	size: "sm",
	commit: "blur",
	mono: !0,
	placeholder: t
}), yi = [
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
function bi() {
	let e = (e, t) => Object.fromEntries(Object.entries(t).map(([t, n]) => [t, {
		group: e,
		field: n
	}]));
	return {
		...e("layout", {
			alignContent: Z(O("Align Content"), [
				"normal",
				"start",
				"center",
				"end",
				"space-between",
				"space-around",
				"space-evenly",
				"stretch"
			]),
			placeItems: $(O("Place Items"), "center"),
			placeContent: $(O("Place Content"), "center"),
			gridTemplateAreas: $(O("Grid Areas"), "\"a b\" \"c c\""),
			gridAutoColumns: $(O("Auto Columns"), "auto"),
			gridAutoRows: $(O("Auto Rows"), "auto"),
			columns: _i(O("Columns"), {
				placeholder: O("Auto"),
				min: 1
			}),
			columnRule: $(O("Column Rule"), "1px solid"),
			boxSizing: Z(O("Box Sizing"), ["border-box", "content-box"]),
			float: Z(O("Float||CSS property"), [
				"none",
				"left",
				"right"
			]),
			clear: Z(O("Clear||CSS property"), [
				"none",
				"left",
				"right",
				"both"
			]),
			containerType: Z(O("Container Type"), [
				"normal",
				"inline-size",
				"size"
			])
		}),
		...e("item", {
			justifySelf: Z(O("Justify Self"), [
				"auto",
				"start",
				"center",
				"end",
				"stretch"
			]),
			placeSelf: $(O("Place Self"), "center"),
			gridArea: $(O("Grid Area"), "a"),
			flexGrow: _i(O("Flex Grow"), { min: 0 }),
			flexShrink: _i(O("Flex Shrink"), {
				placeholder: "1",
				min: 0
			}),
			flexBasis: Q(O("Flex Basis"), { placeholder: O("Auto") })
		}),
		...e("position", { inset: Q(O("Inset"), { placeholder: O("Auto") }) }),
		...e("size", {
			overflowX: Z(O("Overflow X"), [
				"visible",
				"hidden",
				"clip",
				"scroll",
				"auto"
			]),
			overflowY: Z(O("Overflow Y"), [
				"visible",
				"hidden",
				"clip",
				"scroll",
				"auto"
			]),
			overscrollBehavior: Z(O("Overscroll"), [
				"auto",
				"contain",
				"none"
			]),
			scrollSnapType: Z(O("Snap Type"), [
				"none",
				"x mandatory",
				"x proximity",
				"y mandatory",
				"y proximity",
				"both mandatory"
			]),
			scrollSnapAlign: Z(O("Snap Align"), [
				"none",
				"start",
				"center",
				"end"
			]),
			scrollMarginTop: Q(O("Scroll Margin")),
			scrollPadding: Q(O("Scroll Padding")),
			scrollbarWidth: Z(O("Scrollbar"), [
				"auto",
				"thin",
				"none"
			])
		}),
		...e("typography", {
			textDecorationColor: vi(O("Decoration Color")),
			textDecorationThickness: Q(O("Line Thickness"), { placeholder: O("Auto") }),
			textUnderlineOffset: Q(O("Underline Offset"), {
				unit: "em",
				units: ["em", "px"],
				step: .05,
				placeholder: O("Auto")
			}),
			whiteSpace: Z(O("White Space"), [
				"normal",
				"nowrap",
				"pre",
				"pre-wrap",
				"pre-line",
				"break-spaces"
			]),
			wordBreak: Z(O("Word Break"), [
				"normal",
				"break-all",
				"keep-all",
				"break-word"
			]),
			overflowWrap: Z(O("Overflow Wrap"), [
				"normal",
				"anywhere",
				"break-word"
			]),
			hyphens: Z(O("Hyphens"), [
				"manual",
				"auto",
				"none"
			]),
			textIndent: Q(O("Indent"), {
				unit: "em",
				units: [
					"em",
					"px",
					"rem"
				]
			}),
			textOverflow: Z(O("Text Overflow"), ["clip", "ellipsis"]),
			fontVariantNumeric: Z(O("Numbers"), [
				"normal",
				"tabular-nums",
				"proportional-nums",
				"lining-nums",
				"oldstyle-nums",
				"slashed-zero"
			]),
			fontFeatureSettings: $(O("Font Features"), "\"ss01\""),
			fontVariationSettings: $(O("Font Variations"), "\"wght\" 500"),
			listStyle: Z(O("List Style"), [
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
			verticalAlign: Z(O("Vertical Align"), [
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
			background: $(O("Background"), "none"),
			backgroundBlendMode: Z(O("Blend Mode"), yi)
		}),
		...e("effects", {
			userSelect: Z(O("User Select"), [
				"auto",
				"none",
				"text",
				"all"
			]),
			visibility: Z(O("Visibility"), [
				"visible",
				"hidden",
				"collapse"
			]),
			maskImage: $(O("Mask Image"), "linear-gradient(black, transparent)"),
			accentColor: vi(O("Accent Color")),
			fill: vi(O("Fill")),
			stroke: vi(O("Stroke")),
			strokeWidth: Q(O("Stroke Width")),
			content: $(O("Content"), "\"\"")
		}),
		...e("transform", {
			perspectiveOrigin: $(O("Vanishing Point"), "center"),
			transformStyle: Z(O("Transform Style"), ["flat", "preserve-3d"]),
			backfaceVisibility: Z(O("Backface"), ["visible", "hidden"])
		}),
		...e("transition", {
			transitionProperty: $(O("Property"), "all"),
			transitionDuration: $(O("Duration"), "200ms"),
			transitionTimingFunction: $(O("Easing"), "ease"),
			transitionDelay: $(O("Delay"), "0ms"),
			willChange: $(O("Will Change"), "auto")
		})
	};
}
function xi() {
	return {
		display: Z(O("Display"), [
			"block",
			"inline",
			"inline-block",
			"flex",
			"grid",
			"none"
		]),
		width: Q(O("Width"), {
			unit: "rem",
			units: [
				"rem",
				"px",
				"%",
				"ch"
			],
			placeholder: O("Auto")
		}),
		maxWidth: Q(O("Max Width"), {
			unit: "rem",
			units: [
				"rem",
				"px",
				"%",
				"ch"
			],
			placeholder: O("None")
		}),
		textAlign: Z(O("Align"), [
			"left",
			"center",
			"right",
			"justify"
		]),
		fontStyle: Z(O("Style"), ["normal", "italic"]),
		textTransform: Z(O("Case"), [
			"none",
			"uppercase",
			"lowercase",
			"capitalize"
		]),
		textDecoration: Z(O("Decoration"), [
			"none",
			"underline",
			"line-through",
			"overline"
		]),
		textWrap: Z(O("Wrap"), [
			"wrap",
			"balance",
			"pretty",
			"nowrap"
		]),
		textShadow: $(O("Text Shadow"), "0 1px 2px rgb(0 0 0 / 0.2)"),
		boxShadow: $(O("Shadow"), "0 4px 16px rgb(0 0 0 / 0.1)"),
		opacity: _i(O("Opacity"), {
			percent: !0,
			step: .05,
			min: 0,
			max: 1,
			placeholder: "100"
		}),
		borderStyle: Z(O("Border Style"), [
			"solid",
			"dashed",
			"dotted",
			"double",
			"none"
		]),
		borderTop: $(O("Border Top"), "1px solid"),
		borderRight: $(O("Border Right"), "1px solid"),
		borderBottom: $(O("Border Bottom"), "1px solid"),
		borderLeft: $(O("Border Left"), "1px solid"),
		paddingTop: Q(O("Padding Top"), { unit: "rem" }),
		paddingRight: Q(O("Padding Right"), { unit: "rem" }),
		paddingBottom: Q(O("Padding Bottom"), { unit: "rem" }),
		paddingLeft: Q(O("Padding Left"), { unit: "rem" }),
		marginBlock: Q(O("Margin Block"), { unit: "rem" }),
		marginInline: Q(O("Margin Inline"), { unit: "rem" })
	};
}
function Si(e, t = bi()) {
	let n = e.replace(/([A-Z])/g, " $1");
	return {
		handle: e,
		type: "text",
		size: "sm",
		commit: "blur",
		mono: !0,
		label: n.charAt(0).toUpperCase() + n.slice(1),
		...t[e]?.field ?? xi()[e]
	};
}
function Ci({ properties: e, labels: t = {}, onPick: n, label: r = O("Add a Property"), children: i }) {
	let [a, o] = P(!1), [s, c] = P(""), [l, u] = P(0), d = bi(), f = s.trim().toLowerCase(), p = e.map((e) => ({
		property: e,
		label: t[e] ?? String(Si(e, d).label)
	})).filter((e) => !f || e.label.toLowerCase().includes(f) || e.property.toLowerCase().includes(f.replace(/[\s-]/g, ""))), m = (e) => {
		e && (o(!1), n(e));
	};
	return e.length === 0 ? null : /* @__PURE__ */ U(we, {
		open: a,
		onOpenChange: (e) => {
			o(e), c(""), u(0);
		},
		align: "end",
		className: "flex w-60 flex-col overflow-hidden !p-0",
		trigger: i ?? /* @__PURE__ */ H(L, {
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
				value: s,
				onChange: (e) => {
					c(e.target.value), u(0);
				},
				onKeyDown: (e) => {
					(e.key === "ArrowDown" || e.key === "ArrowUp") && (e.preventDefault(), u((t) => Math.max(0, Math.min(p.length - 1, t + (e.key === "ArrowDown" ? 1 : -1))))), e.key === "Enter" && (e.preventDefault(), m(p[l]?.property));
				},
				placeholder: O("Search"),
				"aria-label": O("Search"),
				className: "h-full min-w-0 flex-1 bg-transparent text-sm text-text outline-none"
			})]
		}), /* @__PURE__ */ U("div", {
			role: "listbox",
			"aria-label": r,
			className: "max-h-64 overflow-y-auto overscroll-contain p-1",
			children: [p.length === 0 && /* @__PURE__ */ H("p", {
				className: "m-0 px-2 py-3 text-sm text-muted",
				children: O("No matches")
			}), p.map((e, t) => /* @__PURE__ */ H(F, {
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
var wi = (e, t = bi()) => [...e].sort((e, n) => String(Si(e, t).label).localeCompare(String(Si(n, t).label)));
function Ti({ s: e, group: t, title: n, open: r, empty: i, children: a }) {
	let [o, s] = P(null), c = bi(), l = Object.keys(c).filter((e) => c[e].group === t), u = l.filter((t) => e.value(t) !== void 0 || t === o);
	return /* @__PURE__ */ U(dr, {
		title: n,
		open: r,
		empty: i && u.length === 0,
		fields: !0,
		actions: /* @__PURE__ */ H(Ci, {
			properties: wi(l.filter((e) => !u.includes(e)), c),
			onPick: s
		}),
		children: [a, u.length > 0 && /* @__PURE__ */ H(X, {
			s: e,
			fields: u.map((t) => ({
				...Si(t, c),
				set: (n) => {
					t === o && s(null), e.set(t, n);
				}
			}))
		})]
	});
}
function Ei({ field: e, value: t, onChange: n, actions: r, disabled: i, bare: a }) {
	return /* @__PURE__ */ U("div", {
		className: "group/row flex items-start gap-1",
		children: [/* @__PURE__ */ H(be, {
			bare: a,
			layout: a ? void 0 : "inline",
			labelWidth: 120,
			className: "min-w-0 flex-1",
			disabled: i,
			fields: [e],
			values: { [e.handle]: t ?? null },
			onChange: (e, t) => n(t)
		}), /* @__PURE__ */ H("span", {
			className: "mt-0.5 flex size-6 shrink-0 items-center justify-center",
			children: r.length > 0 && !i && /* @__PURE__ */ H(xe, {
				trigger: /* @__PURE__ */ H(L, {
					icon: "more",
					label: O("Property Actions"),
					size: "xs",
					className: "opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100 data-[popup-open]:opacity-100"
				}),
				items: r
			})
		})]
	});
}
function Di({ field: e, value: t, onChange: n, disabled: r }) {
	let i = t ?? {}, [a, o] = P(null), s = e.controls ?? [], c = (e) => (e.fields ?? [e]).map((e) => e.handle), l = /* @__PURE__ */ new Set([...e.hidden ?? [], ...s.flatMap(c)]), u = bi(), d = (e) => {
		let t = { ...i };
		for (let [n, r] of Object.entries(e)) r == null || r === "" ? delete t[n] : t[n] = r;
		n(t);
	}, f = s.filter((e) => c(e).some((e) => e in i) || e.handle === a), p = [...Object.keys(i).filter((e) => !l.has(e)), ...a && !(a in i) && !s.some((e) => e.handle === a) ? [a] : []], m = [...Object.keys(u).filter((e) => u[e].group !== "item" && u[e].group !== "layout"), ...Object.keys(xi())].filter((e) => !l.has(e) && !p.includes(e)), h = [...s.filter((e) => !f.includes(e)).map((e) => e.handle), ...wi(m, u)], g = Object.fromEntries(s.map((e) => [e.handle, String(e.label)])), _ = (e, t) => [{
		label: O("Remove"),
		icon: "trash",
		danger: !0,
		onSelect: () => {
			t === a && o(null), d(Object.fromEntries(e.map((e) => [e, null])));
		}
	}];
	return /* @__PURE__ */ U("div", {
		className: "space-y-1",
		children: [
			f.map((e) => {
				let t = c(e), n = e.fields ? Object.fromEntries(t.map((e) => [e, i[e] ?? null])) : i[e.handle], s = (n) => {
					e.handle === a && o(null), d(e.fields ? Object.fromEntries(t.map((e) => [e, n?.[e] ?? null])) : { [e.handle]: n });
				}, l = t.some((e) => e in i);
				return /* @__PURE__ */ H(Ei, {
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
			p.map((e) => /* @__PURE__ */ H(Ei, {
				field: {
					...Si(e, u),
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
			!r && h.length > 0 && /* @__PURE__ */ H("div", {
				className: "flex h-8 items-center",
				children: /* @__PURE__ */ H(Ci, {
					properties: h,
					labels: g,
					onPick: o,
					children: /* @__PURE__ */ H(br, {
						className: "-ml-1.5 !w-auto",
						children: O("Add a Property")
					})
				})
			})
		]
	});
}
// admin/src/builder/design/Effects.tsx
var Oi = [
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
], ki = [
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
function Ai({ s: e }) {
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
	return /* @__PURE__ */ U(Ti, {
		s: e,
		group: "effects",
		title: O("Effects"),
		empty: !t,
		children: [
			/* @__PURE__ */ H(X, {
				s: e,
				fields: [{
					handle: "opacity",
					type: "text",
					component: "blocks-value",
					label: O("Opacity"),
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
			/* @__PURE__ */ H(X, {
				s: e,
				bare: !0,
				fields: [{
					handle: "boxShadow",
					type: "text",
					component: "blocks-shadows",
					label: O("Shadows"),
					group: "shadow"
				}]
			}),
			/* @__PURE__ */ H(X, {
				s: e,
				bare: !0,
				fields: [{
					handle: "filter",
					type: "text",
					component: "blocks-filters",
					label: O("Filters")
				}]
			}),
			/* @__PURE__ */ H(X, {
				s: e,
				bare: !0,
				fields: [{
					handle: "backdropFilter",
					type: "text",
					component: "blocks-filters",
					label: O("Backdrop")
				}]
			}),
			/* @__PURE__ */ H(X, {
				s: e,
				fields: [
					{
						handle: "clipPath",
						type: "text",
						component: "blocks-clip",
						label: O("Clip Path"),
						className: "items-start py-0.5 [&>label]:leading-6"
					},
					{
						handle: "mixBlendMode",
						type: "select",
						size: "sm",
						label: O("Blending"),
						placeholder: O("Normal"),
						options: Oi
					},
					{
						handle: "cursor",
						type: "select",
						size: "sm",
						label: O("Cursor"),
						placeholder: O("Auto"),
						options: ki
					},
					{
						handle: "pointerEvents",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: O("Clicks"),
						placeholder: "auto",
						options: [{
							value: "auto",
							label: O("On")
						}, {
							value: "none",
							label: O("Pass Through")
						}]
					}
				]
			})
		]
	});
}
// admin/src/builder/color.tsx
function ji(e) {
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
function Mi({ r: e, g: t, b: n, a: r }) {
	let i = (e) => Math.round(e).toString(16).padStart(2, "0");
	return r >= 1 ? `#${i(e)}${i(t)}${i(n)}` : `rgb(${Math.round(e)} ${Math.round(t)} ${Math.round(n)} / ${Math.round(r * 100)}%)`;
}
function Ni({ r: e, g: t, b: n }) {
	e /= 255, t /= 255, n /= 255;
	let r = Math.max(e, t, n), i = r - Math.min(e, t, n);
	return {
		h: ((i === 0 ? 0 : r === e ? (t - n) / i % 6 : r === t ? (n - e) / i + 2 : (e - t) / i + 4) * 60 + 360) % 360,
		s: r === 0 ? 0 : i / r,
		v: r
	};
}
function Pi(e, t, n, r) {
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
function Fi(e) {
	return /^token:[a-z]+\.[a-z0-9-]+(\/\d{1,3})?$/.test(e) ? !0 : typeof CSS < "u" && CSS.supports("color", e);
}
function Ii() {
	let { byPath: e } = r();
	return (t) => t ? t.replace(/token:([a-z]+\.[a-z0-9-]+)(?:\/(\d+))?/g, (t, n, r) => {
		let i = e.get(n), a = i ? String(i.value) : "transparent";
		return r ? `color-mix(in srgb, ${a} ${r}%, transparent)` : a;
	}) : "transparent";
}
function Li({ field: e, value: t, onChange: n }) {
	let [r, i] = P(!1), a = Ii(), o = Cr(), s = t ?? void 0, c = o(s);
	return /* @__PURE__ */ H(jr, { children: /* @__PURE__ */ H(we, {
		open: r,
		onOpenChange: i,
		align: "end",
		className: "w-64 !p-0",
		trigger: /* @__PURE__ */ U(z, {
			compact: !0,
			id: Me(e),
			className: B(_r, "flex items-center gap-1.5 pl-1 text-left"),
			children: [/* @__PURE__ */ H(yr, {
				color: s === void 0 && typeof e.swatch == "string" ? e.swatch : a(s),
				className: "!size-4"
			}), c ? /* @__PURE__ */ H(Er, {
				token: c.token,
				alpha: c.alpha
			}) : /* @__PURE__ */ H("span", {
				className: B("truncate font-mono", !s && "font-sans text-faint"),
				children: s ?? e.placeholder ?? O("None")
			})]
		}),
		children: /* @__PURE__ */ H(Ri, {
			label: e.label || O("Color"),
			value: s,
			onChange: n
		})
	}) });
}
function Ri({ label: e, value: t, onChange: n }) {
	let { byGroup: i } = r(), a = i.get("color") ?? [], o = Ii(), s = t?.startsWith("token:") ? t.slice(6).split("/")[0] : null, c = ji(t?.startsWith("token:") ? o(t.split("/")[0]) : t) ?? {
		r: 0,
		g: 0,
		b: 0,
		a: 1
	}, [l, u] = P(() => ({
		...Ni(c),
		a: t?.includes("/") && t.startsWith("token:") ? Number(t.split("/")[1]) / 100 : c.a
	})), [d, f] = P(t ?? ""), p = Rr(d, (e) => !e.trim() || Fi(e.trim())), [m, h] = P(() => a.length > 0 && (!t || t.startsWith("token:")) ? "tokens" : "custom"), g = N(null);
	M(() => f(t ?? ""), [t]);
	let _ = (e, t, r, i) => {
		u({
			h: e,
			s: t,
			v: r,
			a: i
		}), n(Mi(Pi(e, t, r, i)));
	}, v = (e, r) => {
		let i = e.currentTarget;
		i.setPointerCapture(e.pointerId);
		let a = (e) => {
			let a = i.getBoundingClientRect(), o = Math.max(0, Math.min(1, (e.clientX - a.left) / a.width)), s = Math.max(0, Math.min(1, (e.clientY - a.top) / a.height));
			r === "area" ? _(l.h, o, 1 - s, l.a) : r === "hue" ? _(o * 360, l.s, l.v, l.a) : t?.startsWith("token:") ? n(`${t.split("/")[0]}${o < .995 ? `/${Math.round(o * 100)}` : ""}`) : _(l.h, l.s, l.v, Math.round(o * 100) / 100);
		};
		a(e);
		let o = (e) => a(e), s = () => {
			i.removeEventListener("pointermove", o), i.removeEventListener("pointerup", s);
		};
		i.addEventListener("pointermove", o), i.addEventListener("pointerup", s);
	}, y = s ? t?.includes("/") ? Number(t.split("/")[1]) / 100 : 1 : l.a, b = s ? o(`token:${s}`) : Mi({ ...Pi(l.h, l.s, l.v, 1) }), x = /* @__PURE__ */ U("div", {
		onPointerDown: (e) => v(e, "alpha"),
		className: "relative h-2.5 cursor-ew-resize rounded-full cms-checkerboard",
		children: [/* @__PURE__ */ H("span", {
			className: "absolute inset-0 rounded-full",
			style: { background: `linear-gradient(to right, transparent, ${b})` }
		}), /* @__PURE__ */ H("span", {
			className: "pointer-events-none absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white ring-1 ring-black/30",
			style: { left: `${y * 100}%` }
		})]
	}), S = /* @__PURE__ */ H(z, {
		compact: !0,
		onClick: () => n(null),
		className: "h-7 shrink-0 rounded-sm px-2 text-xs text-muted hover:bg-hover hover:text-ink",
		children: O("Clear")
	});
	return /* @__PURE__ */ U("div", { children: [/* @__PURE__ */ U("div", {
		className: "flex h-9 items-center gap-2 border-b border-border pl-2.5 pr-1.5",
		children: [/* @__PURE__ */ H("span", {
			className: "min-w-0 flex-1 truncate text-xs font-medium text-text",
			children: e
		}), a.length > 0 && /* @__PURE__ */ H(Ee, {
			size: "xs",
			value: m,
			onChange: h,
			options: [{
				value: "tokens",
				label: O("Tokens")
			}, {
				value: "custom",
				label: O("Custom")
			}]
		})]
	}), m === "tokens" ? /* @__PURE__ */ U("div", { children: [/* @__PURE__ */ H("div", {
		role: "listbox",
		"aria-label": O("Color Tokens"),
		className: "max-h-60 overflow-y-auto p-1",
		children: a.map((e) => /* @__PURE__ */ U(z, {
			compact: !0,
			role: "option",
			"aria-selected": s === e.path,
			title: `${e.path} · ${String(e.value)}${e.dark ? ` / ${String(e.dark)}` : ""}`,
			onClick: () => n(`token:${e.path}`),
			className: B("flex h-7 w-full items-center gap-2 rounded-xs px-1.5 text-left text-xs hover:bg-hover", s === e.path && "bg-active"),
			children: [
				/* @__PURE__ */ H(yr, {
					color: String(e.value),
					dark: e.dark ? String(e.dark) : void 0,
					className: "!size-4"
				}),
				/* @__PURE__ */ H("span", {
					className: "min-w-0 flex-1 truncate text-text",
					children: e.name
				}),
				/* @__PURE__ */ H("span", {
					className: "max-w-[45%] shrink-0 truncate font-mono text-2xs text-faint",
					children: String(e.value)
				}),
				s === e.path ? /* @__PURE__ */ H(I, {
					name: "check",
					size: 12,
					className: "shrink-0 text-focus"
				}) : /* @__PURE__ */ H("span", { className: "w-3 shrink-0" })
			]
		}, e.path))
	}), /* @__PURE__ */ U("div", {
		className: "flex items-center gap-2 border-t border-border px-2.5 py-2",
		children: [s ? /* @__PURE__ */ U(Re, { children: [
			/* @__PURE__ */ H("span", {
				className: "shrink-0 text-xs text-muted",
				children: O("Opacity")
			}),
			/* @__PURE__ */ H("div", {
				className: "min-w-0 flex-1",
				children: x
			}),
			/* @__PURE__ */ U("span", {
				className: "w-8 shrink-0 text-right text-2xs tabular-nums text-muted",
				children: [Math.round(y * 100), "%"]
			})
		] }) : /* @__PURE__ */ H("span", { className: "flex-1" }), S]
	})] }) : /* @__PURE__ */ U("div", {
		className: "space-y-2 p-2.5",
		children: [
			/* @__PURE__ */ H("div", {
				ref: g,
				onPointerDown: (e) => v(e, "area"),
				className: "relative h-32 cursor-crosshair rounded-sm",
				style: { background: `linear-gradient(to top, black, transparent), linear-gradient(to right, white, hsl(${l.h} 100% 50%))` },
				children: /* @__PURE__ */ H("span", {
					className: "pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white ring-1 ring-black/30",
					style: {
						left: `${l.s * 100}%`,
						top: `${(1 - l.v) * 100}%`
					}
				})
			}),
			/* @__PURE__ */ H("div", {
				onPointerDown: (e) => v(e, "hue"),
				className: "relative h-2.5 cursor-ew-resize rounded-full",
				style: { background: "linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)" },
				children: /* @__PURE__ */ H("span", {
					className: "pointer-events-none absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white ring-1 ring-black/30",
					style: { left: `${l.h / 360 * 100}%` }
				})
			}),
			x,
			/* @__PURE__ */ U("div", {
				className: "flex gap-1.5",
				children: [/* @__PURE__ */ H("input", {
					value: d,
					spellCheck: !1,
					"aria-label": O("Color Value"),
					"aria-invalid": p.shown || void 0,
					onChange: (e) => f(e.target.value),
					onBlur: () => {
						let e = d.trim();
						if (e && !Fi(e)) return f(t ?? "");
						e !== (t ?? "") && n(e || null);
					},
					onKeyDown: (e) => {
						e.key === "Escape" && f(t ?? ""), e.key === "Enter" && (d.trim() && !Fi(d.trim()) ? p.show() : e.target.blur());
					},
					className: B(_r, "font-mono"),
					placeholder: R
				}), S]
			})
		]
	})] });
}
// admin/src/builder/fields/style.tsx
function zi(e) {
	let t = e?.match(/^(linear|radial)-gradient\((.*)\)$/);
	if (!t) return null;
	let n = ii(t[2]), r = t[1] === "linear" ? "180deg" : "circle";
	n[0] && (/deg$|^to /.test(n[0]) || /^(circle|ellipse)/.test(n[0])) && (r = n.shift());
	let i = n.map((e) => {
		let t = ri(e);
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
function Bi(e) {
	return `${e.kind}-gradient(${[e.angle, ...e.stops.map((e) => `${e.color}${e.at ? ` ${e.at}` : ""}`)].join(", ")})`;
}
function Vi({ value: e, onChange: t, context: n }) {
	let r = Ii(), i = zi(e);
	if (!i) return null;
	let a = (e) => t(Bi(e));
	return /* @__PURE__ */ U("div", {
		className: "min-w-0 flex-1 space-y-1 rounded-md bg-active/60 p-1.5",
		children: [
			/* @__PURE__ */ H("div", {
				className: "h-6 rounded-sm ring-1 ring-inset ring-black/10",
				style: { background: r(Bi({
					...i,
					kind: "linear",
					angle: "90deg"
				})) }
			}),
			/* @__PURE__ */ H(Y, {
				bare: !0,
				context: n,
				fields: [{
					handle: "shape",
					type: "group",
					component: "blocks-group",
					label: O("Shape"),
					fields: [{
						handle: "kind",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: O("Kind"),
						required: !0,
						options: [{
							value: "linear",
							label: O("Linear")
						}, {
							value: "radial",
							label: O("Radial")
						}]
					}, {
						handle: "angle",
						type: "text",
						component: "blocks-value",
						label: O("Angle"),
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
				children: [/* @__PURE__ */ H(Y, {
					bare: !0,
					className: "min-w-0 flex-1",
					context: n,
					fields: [{
						handle: "stop",
						type: "group",
						component: "blocks-group",
						label: O("Stop||gradient"),
						fields: [{
							handle: "color",
							type: "color",
							component: "blocks-color",
							label: O("Color")
						}, {
							handle: "at",
							type: "text",
							component: "blocks-value",
							label: O("Position"),
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
				}), i.stops.length > 2 && /* @__PURE__ */ H(Sr, { onClick: () => a({
					...i,
					stops: i.stops.filter((e, n) => n !== t)
				}) })]
			}, t)),
			/* @__PURE__ */ U(z, {
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
					/* @__PURE__ */ H(I, {
						name: "plus",
						size: 14
					}),
					" ",
					O("Add Stop")
				]
			})
		]
	});
}
var Hi = [
	"flex-start",
	"center",
	"flex-end"
], Ui = () => [
	{
		value: "flex-start",
		label: O("Start")
	},
	{
		value: "center",
		label: O("Center")
	},
	{
		value: "flex-end",
		label: O("End")
	},
	{
		value: "space-between",
		label: O("Space Between")
	},
	{
		value: "space-around",
		label: O("Space Around")
	},
	{
		value: "space-evenly",
		label: O("Space Evenly")
	}
];
function Wi({ field: e, value: t, onChange: n, context: r }) {
	let i = e.row === !0, a = t?.justifyContent ?? void 0, o = t?.alignItems ?? void 0;
	return /* @__PURE__ */ U(jr, { children: [/* @__PURE__ */ H("div", {
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
			let r = Hi[i ? t : e], s = Hi[i ? e : t], c = (a ?? "flex-start") === r && (o ?? "stretch").replace("stretch", "flex-start") === s;
			return /* @__PURE__ */ H(z, {
				compact: !0,
				onClick: () => n({
					justifyContent: r,
					alignItems: s
				}),
				className: "grid place-items-center rounded-xs hover:bg-hover",
				title: `${r.replace("flex-", "")} · ${s.replace("flex-", "")}`,
				children: /* @__PURE__ */ H("span", { className: B("rounded-full", c ? "size-2 bg-ink" : "size-1 bg-faint") })
			}, `${t}${e}`);
		}))
	}), /* @__PURE__ */ H(Y, {
		bare: !0,
		className: "min-w-0 flex-1",
		context: r,
		fields: [{
			handle: "justifyContent",
			type: "select",
			size: "sm",
			label: O("Distribute"),
			options: Ui(),
			placeholder: O("Distribute")
		}, {
			handle: "alignItems",
			type: "select",
			display: "segmented",
			block: !0,
			size: "sm",
			label: O("Align"),
			options: [
				{
					value: "flex-start",
					icon: i ? "align-top" : "justify-start",
					title: O("Start")
				},
				{
					value: "center",
					icon: i ? "align-middle" : "justify-center",
					title: O("Center")
				},
				{
					value: "flex-end",
					icon: i ? "align-bottom" : "justify-end",
					title: O("End")
				},
				{
					value: "stretch",
					icon: i ? "arrows-out-line-vertical" : "spacing",
					title: O("Stretch")
				},
				{
					value: "baseline",
					icon: "text",
					title: O("Baseline")
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
var Gi = [
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
], Ki = {
	left: "0%",
	top: "0%",
	center: "50%",
	right: "100%",
	bottom: "100%"
};
function qi(e) {
	let t = (e ?? "center").trim().split(/\s+/), n = (e) => e === "top" || e === "bottom";
	t.length === 1 && t.push("center");
	let [r, i] = n(t[0]) || t[1] && (t[1] === "left" || t[1] === "right") ? [t[1], t[0]] : t;
	return `${Ki[r] ?? r} ${Ki[i] ?? i}`;
}
function Ji({ field: e, value: t, onChange: n, context: r, disabled: i }) {
	let a = qi(t);
	return /* @__PURE__ */ U(jr, { children: [/* @__PURE__ */ H("div", {
		className: "grid size-[60px] shrink-0 grid-cols-3 gap-px rounded-sm bg-bg p-1",
		role: "radiogroup",
		"aria-label": e.label,
		children: Gi.flat().map((t) => {
			let r = a === qi(t);
			return /* @__PURE__ */ H(z, {
				compact: !0,
				role: "radio",
				"aria-checked": r,
				disabled: i,
				onClick: () => n(t === "center" && !e.required ? null : t),
				className: "grid place-items-center rounded-xs hover:bg-hover",
				title: t,
				children: /* @__PURE__ */ H("span", { className: B("rounded-full", r ? "size-2 bg-ink" : "size-1 bg-faint") })
			}, t);
		})
	}), /* @__PURE__ */ H(Ar, {
		field: {
			handle: `${e.handle}-value`,
			type: "text",
			component: "blocks-value",
			label: e.label,
			unit: "",
			placeholder: O("Center")
		},
		value: t ?? null,
		onChange: (e) => n(e || null),
		context: r,
		disabled: i
	})] });
}
// admin/src/builder/design/Fill.tsx
var Yi = {
	backgroundImage: null,
	backgroundSize: null,
	backgroundPosition: null,
	backgroundRepeat: null
};
function Xi({ s: e }) {
	let t = e.value("backgroundImage"), n = t ? zi(t) ? "gradient" : "image" : "none", r = t?.match(/^media:([0-9a-z]{26})$/i)?.[1], i = e.value("backgroundColor") || t;
	return /* @__PURE__ */ U(Ti, {
		s: e,
		group: "fill",
		title: O("Fill"),
		empty: !i,
		children: [
			/* @__PURE__ */ H(X, {
				s: e,
				fields: [{
					handle: "backgroundColor",
					type: "color",
					component: "blocks-color",
					label: O("Color")
				}, {
					handle: "kind",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: O("Image"),
					options: [
						{
							value: "none",
							label: O("None")
						},
						{
							value: "gradient",
							icon: "gradient",
							title: O("Gradient")
						},
						{
							value: "image",
							icon: "image",
							title: O("Image")
						}
					],
					keys: ["backgroundImage"],
					reset: () => e.write(Yi),
					get: () => n,
					set: (t) => {
						t === "gradient" ? e.set("backgroundImage", "linear-gradient(180deg, token:color.primary, token:color.background)") : t === "image" ? e.write({
							backgroundImage: "none",
							backgroundSize: "cover",
							backgroundPosition: "center"
						}) : e.write(Yi);
					}
				}]
			}),
			n === "gradient" && /* @__PURE__ */ H(X, {
				s: e,
				bare: !0,
				fields: [{
					handle: "backgroundImage",
					type: "text",
					component: "blocks-gradient",
					className: "items-start",
					label: O("Gradient")
				}]
			}),
			n === "image" && /* @__PURE__ */ H("div", {
				className: "rounded-md bg-active/60 p-1.5 text-xs",
				children: /* @__PURE__ */ H(be, {
					bare: !0,
					fields: [{
						handle: "bg",
						type: "media",
						label: O("Image"),
						max: 1,
						accept: "image/*"
					}],
					values: { bg: r ? [r] : [] },
					onChange: (t, n) => e.set("backgroundImage", n?.[0] ? `media:${n[0]}` : "none")
				})
			}),
			/* @__PURE__ */ H(X, {
				s: e,
				fields: [
					n === "image" && {
						handle: "backgroundSize",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: O("Size"),
						options: [
							{
								value: "cover",
								label: O("Cover")
							},
							{
								value: "contain",
								label: O("Contain")
							},
							{
								value: "auto",
								label: O("Original")
							}
						]
					},
					n === "image" && {
						handle: "backgroundPosition",
						type: "json",
						component: "blocks-origin",
						label: O("Position"),
						className: "items-start py-0.5 [&>label]:leading-6"
					},
					n === "image" && {
						handle: "backgroundRepeat",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: O("Repeat||again"),
						placeholder: "repeat",
						options: [
							{
								value: "no-repeat",
								label: O("Once")
							},
							{
								value: "repeat",
								label: O("Tile")
							},
							{
								value: "repeat-x",
								icon: "spacing",
								title: O("Tile Across")
							},
							{
								value: "repeat-y",
								icon: "arrows-out-line-vertical",
								title: O("Tile Down")
							}
						]
					},
					n === "image" && {
						handle: "backgroundAttachment",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: O("Scrolling"),
						options: [{
							value: "scroll",
							label: O("With Page")
						}, {
							value: "fixed",
							label: O("Fixed")
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
						label: O("Clip"),
						options: [{
							value: "border-box",
							label: O("Box")
						}, {
							value: "text",
							label: O("Text")
						}],
						get: () => e.value("backgroundClip") ?? "border-box",
						set: (t) => e.write({
							backgroundClip: t === "text" ? "text" : null,
							color: t === "text" ? "transparent" : null
						})
					}
				]
			}),
			t && n === "image" && !r && t !== "none" && /* @__PURE__ */ H("p", {
				className: B("cms-input h-7 w-full min-w-0 rounded-sm px-2 text-sm placeholder:text-ghost", "h-auto py-1 font-mono"),
				children: t
			})
		]
	});
}
// admin/src/builder/design/Layout.tsx
var Zi = () => [
	{
		value: "block",
		icon: "square",
		title: O("Block")
	},
	{
		value: "flex",
		icon: "rows",
		title: O("Stack (flex)")
	},
	{
		value: "grid",
		icon: "grid",
		title: O("Grid")
	},
	{
		value: "inline-flex",
		icon: "arrows-in-line-horizontal",
		title: O("Inline Stack")
	},
	{
		value: "none",
		icon: "eye-off",
		title: O("Hidden")
	}
];
function Qi({ s: e }) {
	let t = e.value("display"), n = t === "flex" || t === "inline-flex", r = t === "grid" || t === "inline-grid", i = n && (e.value("flexDirection") ?? "row").startsWith("row");
	return /* @__PURE__ */ H(Ti, {
		s: e,
		group: "layout",
		title: O("Layout"),
		empty: !t,
		children: /* @__PURE__ */ H(X, {
			s: e,
			fields: [
				{
					handle: "display",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: O("Display"),
					options: Zi()
				},
				n && {
					handle: "flexDirection",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: O("Direction"),
					get: () => e.value("flexDirection") ?? "row",
					options: [
						{
							value: "row",
							icon: "arrow-right",
							title: O("Horizontal")
						},
						{
							value: "column",
							icon: "arrow-down",
							title: O("Vertical")
						},
						{
							value: "row-reverse",
							icon: "arrow-left",
							title: O("Horizontal, Reversed")
						},
						{
							value: "column-reverse",
							icon: "arrow-up",
							title: O("Vertical, Reversed")
						}
					]
				},
				n && {
					handle: "align",
					type: "json",
					component: "blocks-align",
					label: O("Align"),
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
					label: O("Gap"),
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
					label: O("Wrap"),
					options: [{
						value: "nowrap",
						label: O("One Line")
					}, {
						value: "wrap",
						label: O("Wrap")
					}],
					get: () => e.value("flexWrap") ?? "nowrap",
					set: (t) => e.set("flexWrap", t === "wrap" ? "wrap" : null)
				},
				r && {
					handle: "gridTemplateColumns",
					type: "text",
					component: "blocks-value",
					label: O("Columns"),
					placeholder: O("3 or 1fr 2fr"),
					unit: "",
					min: 1,
					title: O("A number of equal columns, or any grid template (1fr 2fr, repeat(auto-fill, minmax(16rem, 1fr)))")
				},
				r && {
					handle: "gridTemplateRows",
					type: "text",
					component: "blocks-value",
					label: O("Rows"),
					placeholder: "auto",
					unit: ""
				},
				r && {
					handle: "gaps",
					type: "group",
					component: "blocks-group",
					label: O("Gap"),
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
						label: O("Columns"),
						group: "space",
						prefixIcon: "split",
						placeholder: "0",
						min: 0
					}, {
						handle: "rowGap",
						type: "text",
						component: "blocks-value",
						label: O("Rows"),
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
					label: O("Align"),
					keys: ["alignItems", "justifyItems"],
					get: () => e.value("alignItems"),
					options: [
						{
							value: "start",
							icon: "align-top",
							title: O("Top")
						},
						{
							value: "center",
							icon: "align-middle",
							title: O("Middle")
						},
						{
							value: "end",
							icon: "align-bottom",
							title: O("Bottom")
						},
						{
							value: "stretch",
							icon: "arrows-out-line-vertical",
							title: O("Stretch")
						}
					]
				},
				r && {
					handle: "gridAutoFlow",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: O("Flow"),
					options: [
						{
							value: "row",
							icon: "arrow-right",
							title: O("Rows First")
						},
						{
							value: "column",
							icon: "arrow-down",
							title: O("Columns First")
						},
						{
							value: "row dense",
							icon: "group",
							title: O("Fill Gaps (Dense)")
						}
					]
				}
			]
		})
	});
}
function $i({ s: e, parentDisplay: t }) {
	if (!t || !/flex|grid/.test(t)) return null;
	let n = t.includes("grid");
	return /* @__PURE__ */ H(Ti, {
		s: e,
		group: "item",
		title: O(n ? "Grid Item" : "Stack Item"),
		open: !1,
		empty: !e.value("alignSelf") && !e.value("flex") && !e.value("gridColumn"),
		children: /* @__PURE__ */ H(X, {
			s: e,
			fields: [
				n && {
					handle: "gridColumn",
					type: "text",
					component: "blocks-value",
					label: O("Column"),
					placeholder: "auto",
					unit: "",
					title: O("Span a number of columns (2), or a range (1 / -1 for full width)")
				},
				n && {
					handle: "gridRow",
					type: "text",
					component: "blocks-value",
					label: O("Row"),
					placeholder: "auto",
					unit: ""
				},
				!n && {
					handle: "flex",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: O("Grow"),
					options: [
						{
							value: "1 1 0%",
							label: O("Fill||size")
						},
						{
							value: "0 0 auto",
							label: O("Fixed")
						},
						{
							value: "0 1 auto",
							label: O("Shrink")
						}
					]
				},
				{
					handle: "alignSelf",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: O("Align Self"),
					options: [
						{
							value: "flex-start",
							icon: "align-top",
							title: O("Start")
						},
						{
							value: "center",
							icon: "align-middle",
							title: O("Center")
						},
						{
							value: "flex-end",
							icon: "align-bottom",
							title: O("End")
						},
						{
							value: "stretch",
							icon: "arrows-out-line-vertical",
							title: O("Stretch")
						}
					]
				},
				{
					handle: "order",
					type: "text",
					component: "blocks-value",
					label: O("Display Order"),
					unit: "",
					placeholder: "0",
					prefixIcon: "list-ordered"
				}
			]
		})
	});
}
// admin/src/builder/design/Position.tsx
function ea({ s: e }) {
	let t = e.value("position"), n = !!t && t !== "static";
	return /* @__PURE__ */ H(Ti, {
		s: e,
		group: "position",
		title: O("Position"),
		open: !!t,
		empty: !t,
		children: /* @__PURE__ */ H(X, {
			s: e,
			fields: [
				{
					handle: "position",
					type: "select",
					size: "sm",
					label: O("Type"),
					placeholder: O("Static"),
					options: [
						{
							value: "static",
							label: O("Static")
						},
						{
							value: "relative",
							label: O("Relative")
						},
						{
							value: "absolute",
							label: O("Absolute")
						},
						{
							value: "fixed",
							label: O("Fixed")
						},
						{
							value: "sticky",
							label: O("Sticky")
						}
					]
				},
				n && {
					handle: "offsets",
					type: "group",
					component: "blocks-group",
					label: O("Offsets"),
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
							top: O("Top"),
							right: O("Right"),
							bottom: O("Bottom"),
							left: O("Left")
						}[e],
						title: {
							top: O("Top"),
							right: O("Right"),
							bottom: O("Bottom"),
							left: O("Left")
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
					label: O("Z-index"),
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
					label: O("Isolation"),
					placeholder: "auto",
					options: [{
						value: "auto",
						label: O("Auto")
					}, {
						value: "isolate",
						label: O("Isolate")
					}]
				}
			]
		})
	});
}
// admin/src/builder/design/Size.tsx
function ta(e, t, n) {
	let r = e.value(t), i = r === "100%" ? "fill" : r === "fit-content" ? "fit" : r === "auto" || !r ? "auto" : r.endsWith("vh") || r.endsWith("vw") || r.endsWith("dvh") ? "viewport" : "fixed", a = {
		fill: O("Fill||size"),
		fit: O("Fit"),
		auto: O("Auto"),
		viewport: O("Window"),
		fixed: O("Fixed")
	};
	return {
		handle: t,
		type: "text",
		component: "blocks-value",
		label: n,
		prefix: t === "width" ? "W" : "H",
		placeholder: O("Auto"),
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
					label: O("Fill the Parent (100%)"),
					value: "100%",
					checked: i === "fill"
				},
				{
					label: O("Fit the Content"),
					value: "fit-content",
					checked: i === "fit"
				},
				{
					label: O("Auto"),
					value: null,
					checked: i === "auto"
				},
				{
					label: O(t === "width" ? "Window Width (100vw)" : "Window Height (100dvh)"),
					value: t === "width" ? "100vw" : "100dvh",
					checked: i === "viewport"
				}
			]
		}
	};
}
function na({ s: e, media: t }) {
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
	return /* @__PURE__ */ H(Ti, {
		s: e,
		group: "size",
		title: O("Size"),
		empty: !n,
		children: /* @__PURE__ */ H(X, {
			s: e,
			fields: [
				ta(e, "width", O("Width")),
				ta(e, "height", O("Height")),
				{
					handle: "limits",
					type: "group",
					component: "blocks-group",
					label: O("Min · Max"),
					columns: 2,
					fields: [
						{
							handle: "minWidth",
							type: "text",
							component: "blocks-value",
							label: O("Min Width"),
							prefix: "W",
							placeholder: O("Min"),
							title: O("Minimum Width"),
							min: 0
						},
						{
							handle: "maxWidth",
							type: "text",
							component: "blocks-value",
							label: O("Max Width"),
							prefix: "W",
							placeholder: O("Max"),
							group: "container",
							title: O("Maximum Width"),
							min: 0,
							keywords: ["none"]
						},
						{
							handle: "minHeight",
							type: "text",
							component: "blocks-value",
							label: O("Min Height"),
							prefix: "H",
							placeholder: O("Min"),
							title: O("Minimum Height"),
							min: 0
						},
						{
							handle: "maxHeight",
							type: "text",
							component: "blocks-value",
							label: O("Max Height"),
							prefix: "H",
							placeholder: O("Max"),
							title: O("Maximum Height"),
							min: 0,
							keywords: ["none"]
						}
					]
				},
				{
					handle: "aspectRatio",
					type: "select",
					size: "sm",
					label: O("Aspect"),
					placeholder: O("Auto"),
					options: [
						{
							value: "1/1",
							label: O("1:1 square")
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
							label: O("3:4 portrait")
						},
						{
							value: "4/5",
							label: "4:5"
						},
						{
							value: "9/16",
							label: O("9:16 story")
						}
					]
				},
				{
					handle: "overflow",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: O("Overflow"),
					placeholder: "visible",
					options: [
						{
							value: "visible",
							icon: "eye",
							title: O("Visible")
						},
						{
							value: "hidden",
							icon: "eye-off",
							title: O("Hidden")
						},
						{
							value: "auto",
							icon: "mouse-scroll",
							title: O("Scroll When Needed")
						},
						{
							value: "clip",
							icon: "scissors",
							title: O("Clip, without scrolling")
						}
					]
				},
				t && {
					handle: "objectFit",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: O("Fit||image"),
					options: [
						{
							value: "cover",
							label: O("Cover")
						},
						{
							value: "contain",
							label: O("Contain")
						},
						{
							value: "fill",
							label: O("Stretch")
						},
						{
							value: "none",
							label: O("None")
						}
					]
				},
				t && {
					handle: "objectPosition",
					type: "json",
					component: "blocks-origin",
					label: O("Focus"),
					className: "items-start py-0.5 [&>label]:leading-6"
				}
			]
		})
	});
}
// admin/src/builder/design/Spacing.tsx
var ra = [
	"Top",
	"Right",
	"Bottom",
	"Left"
];
function ia(e, t, n) {
	return [
		`${t}${ra[n]}`,
		n % 2 == 0 ? `${t}Block` : `${t}Inline`,
		t
	].find((t) => e.value(t) !== void 0) ?? null;
}
function aa(e, t, n) {
	let r = ia(e, t, n);
	if (!r) return;
	let i = e.value(r);
	if (r === t) return ai(i)?.[n];
	if (r.endsWith("Block") || r.endsWith("Inline")) {
		let [e, t] = ri(String(i));
		return n === 0 || n === 3 ? e : t ?? e;
	}
	return i;
}
var oa = (e) => [
	e,
	`${e}Block`,
	`${e}Inline`,
	...ra.map((t) => `${e}${t}`)
];
function sa({ s: e }) {
	let t = ["margin", "padding"], n = t.some((t) => ra.some((n, r) => aa(e, t, r))), r = Object.fromEntries(t.map((t) => [t, [
		0,
		1,
		2,
		3
	].map((n) => aa(e, t, n))])), i = Object.fromEntries(t.map((t) => [t, [
		0,
		1,
		2,
		3
	].map((n) => {
		let r = ia(e, t, n);
		return r ? e.status(r) === "own" ? "own" : "inherited" : "none";
	})])), a = (t, n) => {
		let r = {
			[t]: null,
			[`${t}Block`]: null,
			[`${t}Inline`]: null
		}, i = n.every((e) => e !== void 0 && e === n[0]);
		i && (r[t] = n[0]), ra.forEach((e, a) => r[`${t}${e}`] = i ? null : n[a] ?? null), e.write(r);
	};
	return /* @__PURE__ */ H(dr, {
		title: O("Spacing"),
		empty: !n,
		children: /* @__PURE__ */ H(X, {
			s: e,
			bare: !0,
			fields: [{
				handle: "spacing",
				type: "json",
				component: "blocks-spacing",
				className: "items-start",
				label: O("Spacing"),
				sideStatus: i,
				keys: [...oa("margin"), ...oa("padding")],
				get: () => r,
				set: (e) => t.forEach((t) => e[t] !== r[t] && a(t, e[t]))
			}]
		})
	});
}
// admin/src/builder/design/StateBar.tsx
var ca = () => [
	{
		value: "",
		label: O("Default")
	},
	{
		value: "hover",
		label: O("Hover")
	},
	{
		value: "active",
		label: O("Pressed")
	},
	{
		value: "focus-visible",
		label: O("Focus")
	}
], la = () => [
	{
		value: "before",
		label: O("Before")
	},
	{
		value: "after",
		label: O("After")
	},
	{
		value: "placeholder",
		label: O("Placeholder")
	},
	{
		value: "first",
		label: O("First Item")
	},
	{
		value: "last",
		label: O("Last Item")
	},
	{
		value: "odd",
		label: O("Odd Items")
	},
	{
		value: "even",
		label: O("Even Items")
	},
	{
		value: "current",
		label: O("Current Page")
	},
	{
		value: "group-hover",
		label: O("Hover on Hover Group")
	},
	{
		value: "dark",
		label: O("Dark Mode")
	},
	{
		value: "open",
		label: O("When Open")
	}
];
function ua({ node: e }) {
	let { store: t } = o(), n = G(t, (e) => e.state), r = G(t, (e) => e.breakpoint), i = G(t, (t) => d(t.nodes, e.id)), a = /* @__PURE__ */ new Set([
		...Object.keys(e.logic?.states ?? {}).map((e) => `is-${e}`),
		...Object.keys(e.bind ?? {}).filter((e) => e.startsWith("state:")).map((e) => `is-${e.slice(6)}`),
		...e.logic?.behaviors?.scroll ? ["is-scrolled", ...e.logic.behaviors.scroll.hide ? ["is-hidden"] : []] : [],
		...Object.keys(e.style ?? {}).map((e) => e.split(":").pop()).filter((e) => e.startsWith("is-") || e.startsWith("in-"))
	]), s = /* @__PURE__ */ new Set();
	for (let e of i) Object.keys(e.logic?.states ?? {}).forEach((e) => s.add(`in-${e}`)), e.logic?.behaviors?.scroll && s.add("in-scrolled");
	let c = [...a, ...s].filter((e, t, n) => n.indexOf(e) === t), l = (e) => e.startsWith("is-") ? e.slice(3) : e.startsWith("in-") ? O("in {state}", { state: e.slice(3) }) : [...ca(), ...la()].find((t) => t.value === e)?.label ?? e, u = (e) => t.setStyleState(e), f = (t) => Object.keys(e.style ?? {}).some((e) => e === t || e.endsWith(`:${t}`)), p = async () => {
		let e = await Pe({
			title: O("Custom State"),
			description: O("A state a script, behavior or data sets (is-open). Style it here, set it in Interact → States."),
			fields: [{
				handle: "name",
				type: "text",
				label: O("Name"),
				placeholder: "open, active…",
				mono: !0
			}],
			confirm: O("Style It")
		}), t = String(e?.name ?? "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
		t && u(`is-${t}`);
	}, m = [
		...ca(),
		...c.map((e) => ({
			value: e,
			label: l(e)
		})),
		...n && !ca().some((e) => e.value === n) && !c.includes(n) ? [{
			value: n,
			label: l(n)
		}] : []
	], h = r === "tablet" ? O("Tablet and Phone") : r === "mobile" ? O("Phone") : r;
	return /* @__PURE__ */ U("div", {
		className: "space-y-2 border-b border-border px-4 py-3",
		children: [/* @__PURE__ */ U("div", {
			className: "flex items-start gap-1",
			children: [/* @__PURE__ */ H("div", {
				"data-wrap": !0,
				className: "flex min-w-0 flex-1 flex-wrap gap-0.5 rounded-md bg-active p-0.5",
				role: "radiogroup",
				"aria-label": O("State"),
				children: m.map((e) => /* @__PURE__ */ U(F, {
					variant: "ghost",
					size: "xs",
					role: "radio",
					"aria-checked": n === e.value,
					onClick: () => u(e.value),
					className: B("relative flex-[1_0_auto] !rounded-sm !px-1.5", n === e.value ? "!bg-float !text-ink shadow-raise dark:!bg-fill" : "!bg-transparent !text-muted hover:!text-text"),
					children: [/* @__PURE__ */ H("span", { children: e.label }), e.value && f(e.value) && n !== e.value && /* @__PURE__ */ H("span", {
						className: "size-1 shrink-0 rounded-full bg-current opacity-70",
						"aria-hidden": !0
					})]
				}, e.value || "default"))
			}), /* @__PURE__ */ H(xe, {
				align: "end",
				trigger: /* @__PURE__ */ H(L, {
					icon: "plus",
					label: O("More States")
				}),
				items: [
					...la().map((e) => ({
						label: e.label,
						onSelect: () => u(e.value),
						checked: n === e.value
					})),
					{
						separator: !0,
						label: ""
					},
					{
						label: O("Custom State…"),
						onSelect: () => void p()
					}
				]
			})]
		}), r !== "base" && /* @__PURE__ */ U("div", {
			className: "flex h-7 items-center gap-2 rounded-sm bg-bg px-2 text-xs text-text",
			children: [
				/* @__PURE__ */ H(I, {
					name: r === "mobile" ? "phone" : "tablet",
					size: 14,
					className: "shrink-0 text-muted"
				}),
				/* @__PURE__ */ H("span", {
					className: "min-w-0 flex-1 truncate",
					children: h
				}),
				/* @__PURE__ */ H(F, {
					variant: "ghost",
					size: "xs",
					onClick: () => t.setBreakpoint("base"),
					className: "!px-1 !font-normal !text-muted hover:!text-ink",
					children: O("Back to Desktop")
				})
			]
		})]
	});
}
// admin/src/builder/design/Transform.tsx
var da = (e, t) => e?.match(RegExp(`${t}\\(([^)]*)\\)`))?.[1];
function fa({ s: e }) {
	let t = ri(e.value("translate") ?? ""), n = e.value("transform"), r = [
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
		X: da(n, "skewX"),
		Y: da(n, "skewY")
	}, o = (n, r) => {
		let i = [t[0] ?? "0", t[1] ?? "0"];
		i[n] = r ?? "0", e.set("translate", i.every((e) => e === "0" || e === "0px") ? null : i.join(" "));
	}, s = (t, r) => {
		let i = ri(n ?? "").filter((e) => !e.startsWith(`skew${t}(`));
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
	return /* @__PURE__ */ H(Ti, {
		s: e,
		group: "transform",
		title: O("Transform"),
		open: !!r,
		empty: !r,
		children: /* @__PURE__ */ H(X, {
			s: e,
			fields: [
				{
					handle: "move",
					type: "group",
					component: "blocks-group",
					label: O("Move"),
					keys: ["translate"],
					fields: c("px"),
					get: () => i,
					set: (e) => Object.entries(si(i, e)).forEach(([e, t]) => o(e === "x" ? 0 : 1, t ?? null))
				},
				{
					handle: "rotate",
					type: "text",
					component: "blocks-value",
					label: O("Rotate"),
					unit: "deg",
					prefixIcon: "redo",
					placeholder: "0"
				},
				{
					handle: "scale",
					type: "text",
					component: "blocks-value",
					label: O("Scale"),
					unit: "",
					step: .01,
					prefixIcon: "arrows-out-simple",
					placeholder: "1"
				},
				{
					handle: "skew",
					type: "group",
					component: "blocks-group",
					label: O("Skew"),
					keys: ["transform"],
					fields: c("deg").map((e) => ({
						...e,
						handle: e.handle.toUpperCase()
					})),
					get: () => a,
					set: (e) => Object.entries(si(a, e)).forEach(([e, t]) => s(e, t ?? null))
				},
				{
					handle: "transformOrigin",
					type: "json",
					component: "blocks-origin",
					label: O("Origin"),
					className: "items-start py-0.5 [&>label]:leading-6"
				},
				{
					handle: "perspective",
					type: "text",
					component: "blocks-value",
					label: O("Perspective"),
					prefixIcon: "perspective",
					placeholder: "none",
					keywords: ["none"]
				}
			]
		})
	});
}
// admin/src/builder/design/Transition.tsx
var pa = () => [
	{
		value: "all",
		label: O("Everything")
	},
	{
		value: "color, background-color, border-color, text-decoration-color, fill, stroke",
		label: O("Colors")
	},
	{
		value: "transform, translate, rotate, scale",
		label: O("Transform")
	},
	{
		value: "opacity",
		label: O("Opacity")
	},
	{
		value: "opacity, transform, translate, scale",
		label: O("Opacity and Transform")
	},
	{
		value: "box-shadow",
		label: O("Shadow")
	}
];
function ma(e) {
	if (!e) return null;
	let t = ri(e.replace(/,\s*(?![^(]*\))/g, ", ")), n = t.filter((e) => /^[\d.]+m?s$/.test(e) || e.startsWith("token:duration")), r = t.find((e) => /^(ease|linear|cubic-bezier|steps|token:ease)/.test(e));
	return {
		property: e.split(/\s+\d/)[0].replace(/\s+(ease|linear|cubic-bezier).*$/, "").trim() || "all",
		duration: n[0] ?? "200ms",
		ease: r ?? "ease",
		delay: n[1]
	};
}
function ha({ s: e }) {
	let { byGroup: t } = r(), n = ma(e.value("transition")), i = (t) => {
		let r = {
			property: "all",
			duration: "200ms",
			ease: "cubic-bezier(0.2, 0.8, 0.2, 1)",
			...n,
			...t
		}, i = r.property.split(",").map((e) => e.trim());
		e.set("transition", i.map((e) => `${e} ${r.duration} ${r.ease}${r.delay ? ` ${r.delay}` : ""}`).join(", "));
	};
	return /* @__PURE__ */ H(Ti, {
		s: e,
		group: "transition",
		title: O("Transition"),
		open: !!n,
		empty: !n,
		children: n ? /* @__PURE__ */ H(X, {
			s: e,
			fields: [
				{
					handle: "property",
					type: "select",
					size: "sm",
					label: O("Animate"),
					placeholder: O("Everything"),
					options: pa(),
					keys: ["transition"],
					get: () => pa().find((e) => e.value.split(",")[0].trim() === n.property.split(",")[0].trim())?.value,
					set: (e) => i({ property: e ?? "all" })
				},
				{
					handle: "timing",
					type: "group",
					component: "blocks-group",
					label: O("Duration"),
					keys: ["transition"],
					get: () => ({
						duration: n.duration,
						delay: n.delay
					}),
					set: (e) => i(e.duration === n.duration ? { delay: e.delay ?? void 0 } : { duration: e.duration ?? "200ms" }),
					fields: [{
						handle: "duration",
						type: "text",
						component: "blocks-value",
						label: O("Duration"),
						unit: "ms",
						step: 10,
						min: 0,
						group: "duration",
						prefixIcon: "timer"
					}, {
						handle: "delay",
						type: "text",
						component: "blocks-value",
						label: O("Delay"),
						unit: "ms",
						step: 10,
						min: 0,
						prefixIcon: "pause",
						placeholder: O("Delay")
					}]
				},
				{
					handle: "ease",
					type: "text",
					component: "ease",
					label: O("Curve"),
					keys: ["transition"],
					get: () => n.ease,
					set: (e) => i({ ease: e ?? "ease" }),
					options: [
						...(t.get("ease") ?? []).map((e) => ({
							value: `token:${e.path}`,
							label: e.name,
							curve: String(e.value)
						})),
						{
							value: "ease",
							label: O("Ease||curve")
						},
						{
							value: "ease-in-out",
							label: O("Ease In-Out")
						},
						{
							value: "linear",
							label: O("Linear")
						},
						{
							value: "cubic-bezier(0.2, 0.8, 0.2, 1)",
							label: O("Smooth Out")
						},
						{
							value: "cubic-bezier(0.65, 0, 0.35, 1)",
							label: O("Smooth In-Out")
						},
						{
							value: "cubic-bezier(0.34, 1.56, 0.64, 1)",
							label: O("Overshoot")
						}
					]
				}
			]
		}) : /* @__PURE__ */ H(F, {
			variant: "ghost",
			icon: "plus",
			onClick: () => i({}),
			className: "w-full !text-xs !font-normal !text-muted hover:!text-ink",
			children: O("Animate State Changes")
		})
	});
}
// admin/src/builder/design/Typography.tsx
var ga = () => [
	{
		value: "100",
		label: O("Thin 100")
	},
	{
		value: "200",
		label: O("Extra Light 200")
	},
	{
		value: "300",
		label: O("Light 300")
	},
	{
		value: "400",
		label: O("Regular 400")
	},
	{
		value: "500",
		label: O("Medium 500")
	},
	{
		value: "600",
		label: O("Semibold 600")
	},
	{
		value: "700",
		label: O("Bold 700")
	},
	{
		value: "800",
		label: O("Extra Bold 800")
	},
	{
		value: "900",
		label: O("Black 900")
	}
];
function _a({ s: e, prose: t }) {
	let { byGroup: n } = r(), i = n.get("font") ?? [], a = n.get("weight") ?? [], o = [
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
	].some((t) => e.value(t)), s = ri(e.value("textStroke") ?? ""), c = {
		width: s.find((e) => /^-?[\d.]/.test(e)),
		color: s.find((e) => !/^-?[\d.]/.test(e))
	};
	return /* @__PURE__ */ U(Ti, {
		s: e,
		group: "typography",
		title: O("Typography"),
		empty: !o && !t?.on,
		children: [
			t && /* @__PURE__ */ H(Y, {
				fields: [{
					handle: "prose",
					type: "toggle",
					label: O("Prose")
				}],
				values: { prose: t.on },
				onChange: (e, n) => t.onChange(!!n)
			}),
			/* @__PURE__ */ H(X, {
				s: e,
				fields: [
					{
						handle: "fontFamily",
						type: "select",
						size: "sm",
						label: O("Font"),
						placeholder: O("Inherit"),
						options: i.map((e) => ({
							value: `token:${e.path}`,
							label: `${e.path} · ${Array.isArray(e.value) ? e.value[0] : e.value}`
						}))
					},
					{
						handle: "fontWeight",
						type: "select",
						size: "sm",
						label: O("Weight"),
						placeholder: O("Inherit"),
						options: [...a.map((e) => ({
							value: `token:${e.path}`,
							label: `${e.path} · ${e.value}`
						})), ...ga()]
					},
					{
						handle: "fontSize",
						type: "text",
						component: "blocks-value",
						label: O("Size"),
						group: "text",
						prefixIcon: "richtext",
						placeholder: O("Inherit"),
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
						label: O("Line Height"),
						group: "leading",
						prefixIcon: "height",
						unit: "",
						step: .05,
						placeholder: O("Inherit"),
						title: O("Line Height (1.2 = 120%)")
					},
					{
						handle: "letterSpacing",
						type: "text",
						component: "blocks-value",
						label: O("Letter Spacing"),
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
						label: O("Color"),
						placeholder: O("Inherit")
					},
					{
						handle: "textAlign",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: O("Align"),
						placeholder: "left",
						options: [
							{
								value: "left",
								icon: "align-left",
								title: O("Left")
							},
							{
								value: "center",
								icon: "align-center",
								title: O("Center")
							},
							{
								value: "right",
								icon: "align-right",
								title: O("Right")
							},
							{
								value: "justify",
								icon: "align-justify",
								title: O("Justify||text")
							}
						]
					},
					{
						handle: "fontStyle",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: O("Style"),
						placeholder: "normal",
						options: [{
							value: "normal",
							icon: "text",
							title: O("Upright")
						}, {
							value: "italic",
							icon: "italic",
							title: O("Italic")
						}]
					},
					{
						handle: "textDecoration",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: O("Decoration"),
						placeholder: "none",
						options: [
							{
								value: "none",
								icon: "close",
								title: O("No Decoration")
							},
							{
								value: "underline",
								icon: "underline",
								title: O("Underline")
							},
							{
								value: "line-through",
								icon: "strike",
								title: O("Strike Through")
							}
						]
					},
					{
						handle: "textTransform",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: O("Case"),
						placeholder: "none",
						options: [
							{
								value: "none",
								icon: "close",
								title: O("As Typed")
							},
							{
								value: "uppercase",
								label: "AA",
								title: O("Uppercase")
							},
							{
								value: "capitalize",
								label: "Aa",
								title: O("Capitalize")
							},
							{
								value: "lowercase",
								label: "aa",
								title: O("Lowercase")
							}
						]
					},
					{
						handle: "textWrap",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: O("Wrap"),
						options: [
							{
								value: "balance",
								label: O("Balance")
							},
							{
								value: "pretty",
								label: O("Pretty")
							},
							{
								value: "nowrap",
								label: O("None")
							}
						]
					},
					{
						handle: "lineClamp",
						type: "text",
						component: "blocks-value",
						label: O("Max Lines"),
						unit: "",
						min: 1,
						placeholder: O("All"),
						prefixIcon: "list-tree"
					}
				]
			}),
			/* @__PURE__ */ H(X, {
				s: e,
				bare: !0,
				fields: [{
					handle: "textShadow",
					type: "text",
					component: "blocks-shadows",
					kind: "text",
					label: O("Text Shadow")
				}]
			}),
			/* @__PURE__ */ H(X, {
				s: e,
				fields: [{
					handle: "stroke",
					type: "group",
					component: "blocks-group",
					label: O("Text Stroke"),
					keys: ["textStroke"],
					get: () => c,
					set: (t) => {
						let n = {
							...c,
							...si(c, t)
						};
						e.set("textStroke", n.width ? `${n.width} ${n.color ?? "currentColor"}` : null);
					},
					fields: [{
						handle: "width",
						type: "text",
						component: "blocks-value",
						label: O("Width"),
						prefixIcon: "edit",
						placeholder: "0",
						min: 0,
						step: .5,
						className: "!flex-none w-[72px]"
					}, {
						handle: "color",
						type: "color",
						component: "blocks-color",
						label: O("Color"),
						placeholder: O("Text Color")
					}]
				}]
			})
		]
	});
}
// admin/src/builder/design/DesignPanel.tsx
function va({ node: e }) {
	let { types: t, store: n } = o(), r = t.get(e.type), i = ni(e), a = G(n, (t) => y(t.nodes, e.id)), s = a ? a.style?.base?.display ?? (a.type === "stack" || a.type === "columns" || a.type === "grid" ? "flex" : void 0) : void 0, c = new Set(r?.styles?.length ? r.styles : [
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
	]), l = e.type === "outlet" && !e.props?.wrap, u = l ? new Set([...c].filter((e) => e === "typography")) : c, d = !!r?.children || e.type === "repeat", f = !l && !!s && /flex|grid/.test(s);
	return e.type === "component" ? /* @__PURE__ */ H("p", {
		className: "m-0 p-4 text-xs text-muted",
		children: O("Edit the component to change its shared design.")
	}) : /* @__PURE__ */ U("div", { children: [
		/* @__PURE__ */ H(ua, { node: e }),
		u.has("layout") && d && /* @__PURE__ */ H(Qi, { s: i }),
		f && /* @__PURE__ */ H($i, {
			s: i,
			parentDisplay: s
		}),
		u.has("position") && /* @__PURE__ */ H(ea, { s: i }),
		u.has("size") && /* @__PURE__ */ H(na, {
			s: i,
			media: [
				"image",
				"video",
				"embed"
			].includes(e.type)
		}),
		u.has("spacing") && /* @__PURE__ */ H(sa, { s: i }),
		u.has("typography") && /* @__PURE__ */ H(_a, {
			s: i,
			prose: r?.fields?.some((e) => e.handle === "prose") ? {
				on: !!e.props?.prose,
				onChange: (t) => n.updateProps(e.id, { prose: t || void 0 }, `inspector:${e.id}:prose`)
			} : void 0
		}),
		u.has("fill") && /* @__PURE__ */ H(Xi, { s: i }),
		u.has("border") && /* @__PURE__ */ H(gi, { s: i }),
		u.has("effects") && /* @__PURE__ */ H(Ai, { s: i }),
		u.has("transform") && /* @__PURE__ */ H(fa, { s: i }),
		u.has("transition") && /* @__PURE__ */ H(ha, { s: i })
	] });
}
// admin/src/builder/logic/LogicPanel.tsx
var ya = () => [
	{
		value: "click",
		label: O("Click")
	},
	{
		value: "mouseenter",
		label: O("Pointer Enters")
	},
	{
		value: "mouseleave",
		label: O("Pointer Leaves")
	},
	{
		value: "focus",
		label: O("Gets Focus")
	},
	{
		value: "blur",
		label: O("Loses Focus")
	},
	{
		value: "input",
		label: O("Typing")
	},
	{
		value: "change",
		label: O("Value Changes")
	},
	{
		value: "submit",
		label: O("Form Submit")
	},
	{
		value: "keydown",
		label: O("Key Pressed")
	},
	{
		value: "enter",
		label: O("Scrolls into View")
	},
	{
		value: "leave",
		label: O("Scrolls Out of View")
	},
	{
		value: "scroll",
		label: O("Page Scrolls")
	},
	{
		value: "resize",
		label: O("Window Resizes")
	},
	{
		value: "init",
		label: O("Page Loads")
	}
], ba = () => [
	{
		value: "prevent",
		label: O("Prevent Default")
	},
	{
		value: "stop",
		label: O("Stop Propagation")
	},
	{
		value: "outside",
		label: O("Outside This Element")
	},
	{
		value: "window",
		label: O("Anywhere on the Page")
	},
	{
		value: "once",
		label: O("Only Once")
	},
	{
		value: "self",
		label: O("On This Element Only")
	},
	{
		value: "debounce",
		label: O("Debounce")
	}
], xa = () => [
	{
		value: "set",
		label: O("Set State"),
		icon: "edit"
	},
	{
		value: "toggle",
		label: O("Toggle State"),
		icon: "toggle-left"
	},
	{
		value: "add",
		label: O("Add to Number"),
		icon: "plus"
	},
	{
		value: "if",
		label: O("If … Then … Else"),
		icon: "github"
	},
	{
		value: "play",
		label: O("Play Animation"),
		icon: "play"
	},
	{
		value: "scroll",
		label: O("Scroll To"),
		icon: "mouse-scroll"
	},
	{
		value: "fetch",
		label: O("Load Page Part"),
		icon: "external"
	},
	{
		value: "copy",
		label: O("Copy to Clipboard"),
		icon: "copy"
	},
	{
		value: "go",
		label: O("Go to Link"),
		icon: "link-chain"
	},
	{
		value: "theme",
		label: O("Light or Dark Mode"),
		icon: "moon"
	},
	{
		value: "focus",
		label: O("Focus Element"),
		icon: "position"
	},
	{
		value: "lock",
		label: O("Lock Page Scrolling"),
		icon: "lock"
	},
	{
		value: "wait",
		label: O("Wait"),
		icon: "timer"
	},
	{
		value: "dispatch",
		label: O("Send Event"),
		icon: "broadcast"
	},
	{
		value: "run",
		label: O("Expression"),
		icon: "braces"
	}
];
function Sa(e) {
	let { store: t } = o(), n = G(t, (t) => d(t.nodes, e.id));
	return [...new Set([...n, e].flatMap((e) => Object.keys(e.logic?.data ?? {})))];
}
function Ca(e) {
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
var wa = (e) => typeof e == "string" ? `'${e}'` : JSON.stringify(e), Ta = (e, t, n = {}) => ({
	handle: e,
	type: "text",
	size: "sm",
	commit: "blur",
	label: t,
	mono: !0,
	max: 1e4,
	list: Ea,
	placeholder: "open, count > 3, tab === 'a'",
	...n
}), Ea = "cms-logic-variables", Da = (e, ...t) => e ? t : [], Oa = [
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
function ka({ label: e, options: t, value: n, onChange: r }) {
	return /* @__PURE__ */ U("div", {
		className: "flex min-h-7 items-center gap-2",
		children: [/* @__PURE__ */ H(mr, { field: {
			handle: e,
			type: "select",
			label: e
		} }), /* @__PURE__ */ H("span", {
			className: "cms-input flex h-7 min-w-0 flex-1 rounded-sm",
			children: /* @__PURE__ */ H(xe, {
				align: "end",
				trigger: /* @__PURE__ */ U(F, {
					variant: "ghost",
					"aria-label": e,
					className: "!h-full min-w-0 flex-1 shrink !justify-start !gap-1.5 !bg-transparent !pl-2 !pr-1.5 text-left !font-normal",
					children: [/* @__PURE__ */ H("span", {
						className: B("min-w-0 flex-1 truncate", !n.length && "text-ghost"),
						children: n.length ? n.join(", ") : O("None")
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
					label: O("None"),
					disabled: !0
				}]
			})
		})]
	});
}
var Aa = { strip: "[^A-Za-z0-9_-]" }, ja = (e) => e.replace(/^[^A-Za-z_]+/, "").slice(0, 41);
function Ma({ node: e }) {
	let { store: t } = o(), n = k("design-code/list", {}, { staleTime: 3e4 }), r = e.behavior, i = e.code ?? {}, a = (e, ...t) => [.../* @__PURE__ */ new Set([...n.data?.[e] ?? [], ...t.filter((e) => !!e)])], s = (n) => t.updateNode(e.id, { behavior: n && (n.module ?? r?.module) ? {
		...r,
		...n
	} : void 0 }, `behavior:${e.id}`), c = (n, r) => {
		let a = {
			...i,
			[n]: r.length ? r : void 0
		};
		t.updateNode(e.id, { code: a.scripts || a.styles ? a : void 0 });
	}, l = r?.props ?? {};
	return /* @__PURE__ */ U("div", {
		className: B("-mx-1.5 space-y-1 rounded-sm px-1.5 py-1", r && "bg-sunken/60"),
		children: [
			/* @__PURE__ */ H(Y, {
				fields: [{
					handle: "module",
					type: "select",
					size: "sm",
					label: O("Script"),
					placeholder: O("None"),
					options: a("scripts", r?.module),
					status: r ? "own" : void 0,
					reset: () => s(null)
				}, ...Da(r, {
					handle: "when",
					type: "select",
					display: "segmented",
					block: !0,
					size: "sm",
					label: O("Runs"),
					required: !0,
					options: [
						{
							value: "load",
							label: O("On Load")
						},
						{
							value: "visible",
							label: O("In View")
						},
						{
							value: "idle",
							label: O("When Idle")
						}
					]
				})],
				values: {
					module: r?.module,
					when: r?.when ?? "load"
				},
				onChange: (e, t) => s(e === "module" ? t ? { module: String(t) } : null : { when: t === "visible" || t === "idle" ? t : void 0 })
			}),
			r && /* @__PURE__ */ U(Re, { children: [/* @__PURE__ */ H(pr, {
				title: O("Options"),
				action: /* @__PURE__ */ H(xr, {
					label: O("Add Option"),
					onClick: () => {
						let e = "value", t = 2;
						for (; e in l;) e = `value${t++}`;
						s({ props: {
							...l,
							[e]: ""
						} });
					}
				})
			}), /* @__PURE__ */ H(Y, {
				bare: !0,
				fields: [{
					handle: "props",
					type: "json",
					component: "blocks-pairs",
					className: "items-start",
					label: O("Options"),
					key: Aa,
					join: "=",
					item: {
						handle: "value",
						type: "text",
						size: "sm",
						commit: "blur",
						label: O("Value"),
						mono: !0
					}
				}],
				values: { props: Object.fromEntries(Object.entries(l).map(([e, t]) => [e, wa(t)])) },
				onChange: (e, t) => {
					let n = Object.fromEntries(Object.entries(t).map(([e, t]) => [ja(e), e in l && wa(l[e]) === t ? l[e] : Ca(t ?? "")]).filter(([e]) => e !== ""));
					s({ props: Object.keys(n).length ? n : void 0 });
				}
			})] }),
			/* @__PURE__ */ H(ka, {
				label: O("Load Scripts"),
				options: a("scripts", ...i.scripts ?? []),
				value: i.scripts ?? [],
				onChange: (e) => c("scripts", e)
			}),
			/* @__PURE__ */ H(ka, {
				label: O("Load Styles"),
				options: a("styles", ...i.styles ?? []),
				value: i.styles ?? [],
				onChange: (e) => c("styles", e)
			})
		]
	});
}
function Na({ node: e }) {
	let { store: t, types: n } = o(), r = e.logic ?? {}, i = Sa(e), a = (n) => {
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
	return /* @__PURE__ */ U(Re, { children: [
		/* @__PURE__ */ H("datalist", {
			id: Ea,
			children: [...i, ...i.map((e) => `!${e}`)].map((e) => /* @__PURE__ */ H("option", { value: e }, e))
		}),
		/* @__PURE__ */ H(dr, {
			title: O("State"),
			empty: !r.data,
			open: !!r.data,
			actions: /* @__PURE__ */ H(xr, {
				label: O("Add Variable"),
				onClick: () => {
					let e = "open", t = 1;
					for (; e in s;) e = `value${t++}`;
					a({ data: {
						...s,
						[e]: e !== "open" && ""
					} });
				}
			}),
			children: /* @__PURE__ */ H(Y, {
				bare: !0,
				fields: [{
					handle: "data",
					type: "json",
					component: "blocks-pairs",
					className: "items-start",
					label: O("Variables"),
					key: { strip: "[^a-zA-Z0-9_]" },
					join: "=",
					item: {
						handle: "value",
						type: "text",
						size: "sm",
						commit: "blur",
						label: O("Value"),
						mono: !0
					}
				}],
				values: { data: Object.fromEntries(Object.entries(s).map(([e, t]) => [e, wa(t)])) },
				onChange: (e, t) => a({ data: Object.fromEntries(Object.entries(t).map(([e, t]) => [e, e in s && wa(s[e]) === t ? s[e] : Ca(t ?? "")])) })
			})
		}),
		/* @__PURE__ */ U(dr, {
			title: O("Events"),
			empty: !r.on?.length && !r.init?.length,
			open: !!r.on?.length || !!r.init?.length,
			actions: /* @__PURE__ */ H(xr, {
				label: O("Add Event"),
				onClick: () => a({ on: [...r.on ?? [], {
					event: "click",
					actions: []
				}] })
			}),
			children: [
				r.init && /* @__PURE__ */ H(Fa, {
					title: O("Page Loads"),
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
					return /* @__PURE__ */ H(Fa, {
						title: /* @__PURE__ */ H(Y, {
							bare: !0,
							className: "min-w-0 flex-1",
							fields: [{
								handle: "trigger",
								type: "group",
								component: "blocks-group",
								label: O("Event"),
								fields: [{
									handle: "event",
									type: "select",
									size: "sm",
									label: O("Event"),
									required: !0,
									options: ya().filter((e) => e.value !== "init")
								}, {
									handle: "key",
									type: "text",
									size: "sm",
									commit: "blur",
									label: O("Keyboard Key"),
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
				!r.init && (r.on?.length ?? 0) > 0 && /* @__PURE__ */ H(br, {
					onClick: () => a({ init: [] }),
					children: O("When the Page Loads")
				})
			]
		}),
		/* @__PURE__ */ U(dr, {
			title: O("Bindings"),
			empty: !r.show && !r.states && !r.text && !r.attrs,
			open: !!(r.show || r.states || r.text || r.attrs),
			children: [
				/* @__PURE__ */ H(Y, {
					fields: [Ta("show", O("Show When"), {
						placeholder: O("Always"),
						status: r.show ? "own" : void 0,
						reset: () => a({
							show: void 0,
							transition: void 0
						})
					}), ...Da(r.show, {
						handle: "transition",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						label: O("Transition"),
						options: [
							{
								value: "none",
								label: O("None")
							},
							{
								value: "fade",
								label: O("Fade")
							},
							{
								value: "scale",
								label: O("Scale")
							},
							{
								value: "collapse",
								label: O("Collapse")
							}
						]
					})],
					values: {
						show: r.show,
						transition: r.transition ?? "none"
					},
					onChange: (e, t) => a(e === "show" ? { show: t || void 0 } : { transition: t && t !== "none" ? t : void 0 })
				}),
				/* @__PURE__ */ H(pr, {
					title: O("States"),
					action: /* @__PURE__ */ H(xr, {
						label: O("Add State"),
						onClick: () => a({ states: {
							...r.states ?? {},
							[Object.keys(r.states ?? {}).length ? `state${Object.keys(r.states ?? {}).length + 1}` : "open"]: i[0] ?? "open"
						} })
					})
				}),
				/* @__PURE__ */ H(Y, {
					bare: !0,
					fields: [{
						handle: "states",
						type: "json",
						component: "blocks-pairs",
						className: "items-start",
						label: O("States"),
						key: {
							prefix: "is-",
							lower: !0,
							strip: "[^a-z0-9-]",
							className: "!w-[34%] !flex-none"
						},
						join: O("when"),
						item: Ta("expr", O("When||condition"))
					}],
					values: { states: r.states },
					onChange: (e, t) => a({ states: t })
				}),
				/* @__PURE__ */ H(Y, {
					fields: [Ta("text", O("Text"), {
						placeholder: O("As Designed"),
						status: r.text ? "own" : void 0,
						reset: () => a({ text: void 0 })
					})],
					values: { text: r.text },
					onChange: (e, t) => a({ text: t || void 0 })
				}),
				/* @__PURE__ */ H(pr, {
					title: O("Attributes"),
					action: /* @__PURE__ */ H(xr, {
						label: O("Bind Attribute"),
						onClick: () => a({ attrs: {
							...r.attrs ?? {},
							"aria-expanded": i[0] ?? "open"
						} })
					})
				}),
				/* @__PURE__ */ H(Y, {
					bare: !0,
					fields: [{
						handle: "attrs",
						type: "json",
						component: "blocks-pairs",
						className: "items-start",
						label: O("Attributes"),
						key: {
							options: Oa,
							className: ""
						},
						item: Ta("expr", O("Value"))
					}],
					values: { attrs: r.attrs },
					onChange: (e, t) => a({ attrs: t })
				}),
				e.type === "input" && /* @__PURE__ */ H(Y, {
					fields: [{
						handle: "model",
						type: "select",
						size: "sm",
						label: O("Input Value"),
						placeholder: O("Not kept"),
						options: i,
						status: r.model ? "own" : void 0,
						reset: () => a({ model: void 0 })
					}],
					values: { model: r.model },
					onChange: (e, t) => a({ model: t || void 0 })
				})
			]
		}),
		/* @__PURE__ */ U(dr, {
			title: O("Behaviors"),
			empty: !r.behaviors && !r.component && !u,
			open: !!r.behaviors || !!r.component || u,
			children: [
				/* @__PURE__ */ H(Pa, {
					on: !!l.scroll,
					label: O("Scroll States"),
					onToggle: (e) => a({ behaviors: {
						...l,
						scroll: e ? { threshold: 20 } : void 0
					} }),
					fields: [{
						handle: "threshold",
						type: "text",
						component: "blocks-value",
						label: O("After||a distance"),
						unit: "",
						prefix: "px"
					}, {
						handle: "hide",
						type: "toggle",
						size: "sm",
						label: O("Add is-hidden While Scrolling Down")
					}],
					values: {
						threshold: String(l.scroll?.threshold ?? 20),
						hide: !!l.scroll?.hide
					},
					onChange: (e, t) => a({ behaviors: {
						...l,
						scroll: {
							...l.scroll,
							[e]: e === "threshold" ? Number(t ?? 20) : t
						}
					} })
				}),
				/* @__PURE__ */ H(Pa, {
					on: !!l.spy,
					label: O("Scroll Spy"),
					onToggle: (e) => a({ behaviors: {
						...l,
						spy: e ? { offset: 96 } : void 0
					} })
				}),
				/* @__PURE__ */ H(Pa, {
					on: !!l.group,
					label: O("Hover Group"),
					onToggle: (e) => a({ behaviors: {
						...l,
						group: e || void 0
					} })
				}),
				/* @__PURE__ */ H(Pa, {
					on: !!l.menu,
					label: O("Menu"),
					onToggle: (e) => a({ behaviors: {
						...l,
						menu: e ? {} : void 0
					} })
				}),
				/* @__PURE__ */ H(Pa, {
					on: !!l.carousel,
					label: O("Carousel"),
					onToggle: (e) => a({ behaviors: {
						...l,
						carousel: e ? {} : void 0
					} })
				}),
				/* @__PURE__ */ H(Pa, {
					on: !!l.marquee,
					label: O("Marquee"),
					onToggle: (e) => a({ behaviors: {
						...l,
						marquee: e ? { speed: 60 } : void 0
					} }),
					fields: [
						{
							handle: "speed",
							type: "text",
							component: "blocks-value",
							label: O("Speed"),
							unit: "",
							prefix: "px/s",
							title: O("Pixels per Second")
						},
						{
							handle: "reverse",
							type: "toggle",
							size: "sm",
							label: O("Reverse")
						},
						{
							handle: "pause",
							type: "toggle",
							size: "sm",
							label: O("Pause on Hover")
						}
					],
					values: {
						speed: String(l.marquee?.speed ?? 60),
						reverse: !!l.marquee?.reverse,
						pause: !!l.marquee?.pause
					},
					onChange: (e, t) => a({ behaviors: {
						...l,
						marquee: {
							...l.marquee,
							[e]: e === "speed" ? Number(t ?? 60) : t
						}
					} })
				}),
				E("site.code") && /* @__PURE__ */ H(Ma, { node: e }),
				/* @__PURE__ */ H(Y, {
					fields: [{
						handle: "component",
						type: "text",
						size: "sm",
						commit: "blur",
						label: O("Alpine"),
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
		c && /* @__PURE__ */ H(dr, {
			title: O("Load Into"),
			open: !!r.target,
			empty: !r.target && !r.merge,
			children: /* @__PURE__ */ H(Y, {
				fields: [
					{
						handle: "target",
						type: "json",
						component: "blocks-nodes",
						label: O("Update"),
						exclude: e.id,
						add: O("Element to Update"),
						addValue: e.id
					},
					...Da(r.target, {
						handle: "push",
						type: "toggle",
						size: "sm",
						label: O("Update the Address Bar")
					}),
					{
						handle: "merge",
						type: "select",
						size: "sm",
						label: O("When Loaded"),
						placeholder: O("Replace It"),
						options: [
							{
								value: "replace",
								label: O("Replace It")
							},
							{
								value: "update",
								label: O("Replace What Is Inside")
							},
							{
								value: "append",
								label: O("Add to the End")
							},
							{
								value: "prepend",
								label: O("Add to the Start")
							},
							{
								value: "morph",
								label: O("Morph (Keep State)")
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
function Pa({ on: e, label: t, onToggle: n, fields: r, values: i, onChange: a }) {
	return /* @__PURE__ */ U("div", {
		className: B("-mx-1.5 rounded-sm px-1.5 py-1", e && "bg-sunken/60"),
		children: [/* @__PURE__ */ H(Y, {
			fields: [{
				handle: "on",
				type: "toggle",
				size: "sm",
				label: t
			}],
			values: { on: e },
			onChange: (e, t) => n(!!t)
		}), e && r && /* @__PURE__ */ H(Y, {
			className: "mt-1 space-y-1 pl-10",
			fields: r,
			values: i ?? {},
			onChange: a ?? (() => {})
		})]
	});
}
function Fa({ title: e, mods: t, onMods: n, actions: r, onActions: i, onRemove: a, variables: o, node: s }) {
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
					n && /* @__PURE__ */ H(xe, {
						align: "end",
						trigger: /* @__PURE__ */ H(L, {
							icon: "faders",
							label: O("Event Options"),
							size: "xs",
							active: !!t?.length
						}),
						items: ba().map((e) => ({
							label: e.label,
							checked: t?.includes(e.value),
							onSelect: () => n(t?.includes(e.value) ? t.filter((t) => t !== e.value) : [...t ?? [], e.value])
						}))
					}),
					/* @__PURE__ */ H(Sr, {
						onClick: a,
						label: O("Remove Event")
					})
				]
			}),
			t && t.length > 0 && /* @__PURE__ */ H("p", {
				className: "m-0 pl-5 text-2xs text-faint [overflow-wrap:anywhere]",
				children: t.map((e) => ba().find((t) => t.value === e)?.label).join(" · ")
			}),
			/* @__PURE__ */ H(Ia, {
				actions: r,
				onChange: i,
				variables: o,
				node: s
			})
		]
	});
}
function Ia({ actions: e, onChange: t, variables: n, node: r, depth: i = 0 }) {
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
		className: B("space-y-1", i > 0 && "border-l border-border pl-2"),
		children: [e.map((a, s) => /* @__PURE__ */ U("div", {
			className: "space-y-1 rounded-md bg-active/60 p-1.5",
			children: [/* @__PURE__ */ U("div", {
				className: "flex items-center gap-1",
				children: [
					/* @__PURE__ */ H(I, {
						name: xa().find((e) => e.value === a.do)?.icon ?? "dot-outline",
						size: 14,
						className: "shrink-0 text-muted"
					}),
					/* @__PURE__ */ H("span", {
						className: "min-w-0 flex-1 text-xs font-medium text-text [overflow-wrap:anywhere]",
						children: xa().find((e) => e.value === a.do)?.label ?? a.do
					}),
					/* @__PURE__ */ H(Sr, {
						onClick: () => t(e.filter((e, t) => t !== s)),
						label: O("Remove Action")
					})
				]
			}), /* @__PURE__ */ H(Ra, {
				action: a,
				onChange: (e) => o(s, e),
				variables: n,
				node: r,
				depth: i
			})]
		}, s)), /* @__PURE__ */ H(xe, {
			align: "start",
			trigger: /* @__PURE__ */ H(br, { children: O("Add Action") }),
			items: xa().map((e) => ({
				label: e.label,
				icon: e.icon,
				onSelect: () => a(e.value)
			}))
		})]
	});
}
var La = (e) => e === "top" || e === "bottom" ? e : e?.startsWith("#") ? "anchor" : "node";
function Ra({ action: e, onChange: t, variables: n, node: r, depth: i }) {
	let { store: a } = o(), s = lt(), c = G(a, (t) => e.do === "play" && e.node ? f(t.nodes, e.node) : null), l = {
		handle: "var",
		type: "select",
		size: "sm",
		label: O("Variable"),
		options: n,
		placeholder: O("Variable")
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
	}), p = [], m = e, h = (e, t) => ({ [e]: t ?? "" });
	switch (e.do) {
		case "set":
		case "add":
			p = [l, Ta("value", e.do === "set" ? O("To||set a value") : O("Add||to a number"), { placeholder: e.do === "set" ? "true, 'text', count + 1" : "1" })];
			break;
		case "toggle":
			p = [l];
			break;
		case "if":
			p = [Ta("test", O("If"), { placeholder: "open" })];
			break;
		case "play":
			p = [
				u("node", O("Element")),
				{
					handle: "motion",
					type: "select",
					size: "sm",
					label: O("Animation"),
					options: (c?.motion ?? []).map((e) => ({
						value: e.id,
						label: e.name || e.id
					})),
					placeholder: c?.motion?.length ? O("First Animation") : O("No animations on it")
				},
				d("mode", O("Play"), [
					{
						value: "play",
						label: O("Play")
					},
					{
						value: "reverse",
						label: O("Reverse")
					},
					{
						value: "toggle",
						label: O("Toggle")
					},
					{
						value: "restart",
						label: O("Restart")
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
					label: O("To"),
					required: !0,
					options: [
						{
							value: "top",
							label: O("Top of Page")
						},
						{
							value: "bottom",
							label: O("Bottom of Page")
						},
						{
							value: "anchor",
							label: O("Section")
						},
						{
							value: "node",
							label: O("Element")
						}
					]
				},
				{
					handle: "anchor",
					type: "select",
					size: "sm",
					label: O("Section"),
					options: s.map((e) => ({
						value: `#${e.id}`,
						label: e.label
					})),
					placeholder: O("Choose a Section"),
					if: { kind: "anchor" }
				},
				u("node", O("Element"), { if: { kind: "node" } }),
				{
					handle: "offset",
					type: "text",
					component: "blocks-value",
					label: O("Offset"),
					unit: "",
					prefix: "px",
					placeholder: "0",
					title: O("Offset in pixels, e.g. a sticky header’s height")
				}
			], m = {
				kind: La(e.to),
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
				label: O("Page"),
				placeholder: "/blog/page/2",
				mono: !0
			}, {
				handle: "target",
				type: "json",
				component: "blocks-nodes",
				label: O("Update"),
				addValue: r.id
			}];
			break;
		case "copy":
			p = [Ta("value", O("Text"), { placeholder: `'${O("Text to Copy")}'` })];
			break;
		case "go":
			p = [{
				handle: "url",
				type: "url",
				component: "link",
				reference: !0,
				size: "sm",
				label: O("Link"),
				anchors: s,
				newTab: !!e.newTab,
				onNewTab: (e) => t({ newTab: e || void 0 })
			}], h = (e, t) => ({ url: t ?? "" });
			break;
		case "theme":
			p = [d("mode", O("Mode"), [
				{
					value: "toggle",
					label: O("Switch||between two")
				},
				{
					value: "light",
					label: O("Light")
				},
				{
					value: "dark",
					label: O("Dark")
				},
				{
					value: "system",
					label: O("System")
				}
			])], m = { mode: e.mode ?? "toggle" };
			break;
		case "focus":
			p = [u("node", O("Element"))], h = (e, t) => ({ node: t ?? void 0 });
			break;
		case "lock":
			p = [d("on", O("Scrolling"), [{
				value: "on",
				label: O("Lock")
			}, {
				value: "off",
				label: O("Unlock")
			}])], m = { on: e.on === !1 ? "off" : "on" }, h = (e, t) => ({ on: t !== "off" });
			break;
		case "wait":
			p = [{
				handle: "ms",
				type: "text",
				component: "blocks-value",
				label: O("Wait"),
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
				label: O("Event"),
				placeholder: "event-name",
				mono: !0
			}, Ta("detail", O("Detail"), { placeholder: "detail" })], h = (e, t) => ({ [e]: e === "detail" ? t || void 0 : t ?? "" });
			break;
		case "run":
			p = [Ta("expr", O("Run"), { placeholder: "count = count * 2" })];
			break;
		default: return /* @__PURE__ */ H("p", {
			className: B(_r, "h-auto whitespace-pre-wrap font-mono [overflow-wrap:anywhere]"),
			children: JSON.stringify(e)
		});
	}
	return /* @__PURE__ */ U("div", {
		className: "space-y-1",
		children: [/* @__PURE__ */ H(Y, {
			fields: p,
			values: m,
			onChange: (e, n) => t(h(e, n))
		}), e.do === "if" && /* @__PURE__ */ U(Re, { children: [
			/* @__PURE__ */ H("p", {
				className: "cms-label m-0 pt-1",
				children: O("Then")
			}),
			/* @__PURE__ */ H(Ia, {
				actions: e.then ?? [],
				onChange: (e) => t({ then: e }),
				variables: n,
				node: r,
				depth: i + 1
			}),
			/* @__PURE__ */ H("p", {
				className: "cms-label m-0 pt-1",
				children: O("Else")
			}),
			/* @__PURE__ */ H(Ia, {
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
var za = (e) => ({
	appear: O("Appear"),
	scroll: O("Scroll"),
	hover: O("Hover and Press"),
	loop: O("Loop"),
	load: O("Page Load"),
	event: O("On Event")
})[e], Ba = "power3.out", Va = () => [
	{
		name: O("Fade In"),
		group: "appear",
		make: () => ({
			trigger: { type: "appear" },
			steps: [{
				target: "self",
				from: { opacity: 0 },
				duration: .8,
				ease: Ba
			}]
		})
	},
	{
		name: O("Fade Up"),
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
				ease: Ba
			}]
		})
	},
	{
		name: O("Slide in from Left"),
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
				ease: Ba
			}]
		})
	},
	{
		name: O("Scale In"),
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
		name: O("Blur In"),
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
				ease: Ba
			}]
		})
	},
	{
		name: O("Reveal (Wipe Up)"),
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
		name: O("Children one by one"),
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
				ease: Ba,
				stagger: .08
			}]
		})
	},
	{
		name: O("Words Rise"),
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
				ease: Ba,
				stagger: .04
			}]
		})
	},
	{
		name: O("Words Slide Up (Masked)"),
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
		name: O("Parallax"),
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
		name: O("Zoom While Scrolling"),
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
		name: O("Fade Through"),
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
		name: O("Highlight Words"),
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
		name: O("Rotate While Scrolling"),
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
		name: O("Slide Sideways"),
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
		name: O("Lift"),
		group: "hover",
		make: () => ({
			trigger: { type: "hover" },
			steps: [{
				target: "self",
				to: { y: -6 },
				duration: .3,
				ease: Ba
			}]
		})
	},
	{
		name: O("Grow"),
		group: "hover",
		make: () => ({
			trigger: { type: "hover" },
			steps: [{
				target: "self",
				to: { scale: 1.04 },
				duration: .35,
				ease: Ba
			}]
		})
	},
	{
		name: O("Zoom Image Inside"),
		group: "hover",
		make: () => ({
			trigger: { type: "hover" },
			steps: [{
				target: "children",
				to: { scale: 1.06 },
				duration: .6,
				ease: Ba
			}]
		})
	},
	{
		name: O("Press"),
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
		name: O("Float"),
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
		name: O("Spin"),
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
		name: O("Pulse"),
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
		name: O("Intro: Fade Up"),
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
				ease: Ba,
				delay: .1
			}]
		})
	},
	{
		name: O("Intro: Words"),
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
				ease: Ba,
				stagger: .05
			}]
		})
	},
	{
		name: O("Intro: Children"),
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
				ease: Ba,
				stagger: .1
			}]
		})
	},
	{
		name: O("Open (Fade and Scale)"),
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
				ease: Ba
			}]
		})
	},
	{
		name: O("Slide in Panel"),
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
				ease: Ba,
				stagger: .05
			}]
		})
	}
], Ha = () => ({
	appear: {
		label: O("Appear"),
		icon: "eye"
	},
	scroll: {
		label: O("Scroll"),
		icon: "mouse-scroll"
	},
	hover: {
		label: O("Hover"),
		icon: "hand-pointing"
	},
	press: {
		label: O("Press"),
		icon: "hand-tap"
	},
	load: {
		label: O("Page Load"),
		icon: "rocket"
	},
	loop: {
		label: O("Loop"),
		icon: "refresh"
	},
	event: {
		label: O("On Event"),
		icon: "broadcast"
	}
}), Ua = () => ({
	opacity: O("Opacity"),
	x: O("Move X"),
	y: O("Move Y"),
	xPercent: O("Move X %"),
	yPercent: O("Move Y %"),
	z: O("Move Z"),
	scale: O("Scale"),
	scaleX: O("Scale X"),
	scaleY: O("Scale Y"),
	rotate: O("Rotate"),
	rotateX: O("Rotate X (3D)"),
	rotateY: O("Rotate Y (3D)"),
	skewX: O("Skew X"),
	skewY: O("Skew Y"),
	blur: O("Blur"),
	brightness: O("Brightness"),
	grayscale: O("Grayscale"),
	clipPath: O("Clip Path"),
	backgroundColor: O("Fill"),
	color: O("Text Color"),
	borderColor: O("Border Color"),
	borderRadius: O("Radius"),
	boxShadow: O("Shadow"),
	letterSpacing: O("Letter Spacing"),
	transformOrigin: O("Origin"),
	perspective: O("Perspective")
}), Wa = () => [
	{
		value: "power3.out",
		label: O("Smooth Out")
	},
	{
		value: "expo.out",
		label: O("Expo Out")
	},
	{
		value: "power4.inOut",
		label: O("Smooth In-Out")
	},
	{
		value: "power2.out",
		label: O("Gentle Out")
	},
	{
		value: "back.out(1.7)",
		label: O("Overshoot")
	},
	{
		value: "elastic.out(1, 0.4)",
		label: O("Elastic")
	},
	{
		value: "bounce.out",
		label: O("Bounce")
	},
	{
		value: "sine.inOut",
		label: O("Sine In-Out")
	},
	{
		value: "power2.in",
		label: O("Ease In")
	},
	{
		value: "none",
		label: O("Linear")
	},
	{
		value: "cubic-bezier(0.2, 0.8, 0.2, 1)",
		label: O("Signature Ease")
	}
], Ga = (e, t, n = {}) => ({
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
}), Ka = /^\d{1,5}(\.\d{1,2})?(px|rem|vh|svh|lvh|dvh)$/, qa = [
	"vh",
	"svh",
	"lvh",
	"dvh",
	"px",
	"rem"
], Ja = (e, ...t) => e ? t : [], Ya = [
	"heading",
	"paragraph",
	"link",
	"button",
	"quote"
], Xa = (e) => {
	let t = e.length + 1;
	for (; e.some((e) => e.id === `m${t}`);) t++;
	return `m${t}`;
}, Za = (e = "self") => e.startsWith("#") ? O("Another Element") : {
	self: O("This Element"),
	children: O("Children"),
	words: O("Words"),
	lines: O("Lines||of text"),
	chars: O("Letters")
}[e] ?? e;
function Qa({ node: e }) {
	let { store: t } = o(), n = e.motion ?? [], [r, i] = P(n[0]?.id ?? null), a = (n) => t.updateNode(e.id, { motion: n.length ? n : void 0 }, `motion:${e.id}`), s = (e, t) => a(n.map((n) => n.id === e ? {
		...n,
		...t
	} : n)), c = Ya.includes(e.type), l = Ha(), u = (t) => {
		let r = Xa(n), o = t ? {
			id: r,
			name: t.name,
			...t.make()
		} : {
			id: r,
			name: O("Custom"),
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
		a([...n, o]), i(r), requestAnimationFrame(() => _n.emit("preview-motion", {
			node: e.id,
			motion: o
		}));
	}, d = Va(), f = [...new Set(d.map((e) => e.group))];
	return /* @__PURE__ */ H(dr, {
		title: O("Animations"),
		empty: n.length === 0,
		actions: /* @__PURE__ */ H(xe, {
			align: "end",
			trigger: /* @__PURE__ */ H(L, {
				icon: "plus",
				label: O("Add Animation"),
				size: "xs"
			}),
			items: [
				...f.flatMap((e) => [{
					label: za(e),
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
					label: O("Custom Animation"),
					icon: "animated",
					onSelect: () => u()
				}
			]
		}),
		children: n.map((t) => /* @__PURE__ */ U("div", {
			className: B("rounded-sm border", r === t.id ? "border-border-strong" : "border-border"),
			children: [/* @__PURE__ */ U("div", {
				className: "flex h-8 items-center gap-1.5 pl-2 pr-1",
				children: [
					/* @__PURE__ */ H(I, {
						name: l[t.trigger.type]?.icon ?? "animated",
						size: 13,
						className: "shrink-0 text-muted"
					}),
					/* @__PURE__ */ U(F, {
						variant: "ghost",
						onClick: () => i(r === t.id ? null : t.id),
						"aria-expanded": r === t.id,
						className: "min-w-0 flex-1 shrink !justify-start !gap-1.5 !bg-transparent !px-0 text-left !text-xs",
						children: [/* @__PURE__ */ H("span", {
							className: "truncate font-medium text-ink",
							children: t.name || l[t.trigger.type]?.label
						}), /* @__PURE__ */ H("span", {
							className: "shrink-0 font-normal text-faint",
							children: l[t.trigger.type]?.label
						})]
					}),
					/* @__PURE__ */ H(ke, {
						content: O("Preview Animation"),
						children: /* @__PURE__ */ H(L, {
							icon: "play",
							label: O("Preview Animation"),
							title: void 0,
							size: "xs",
							onClick: () => _n.emit("preview-motion", {
								node: e.id,
								motion: t
							})
						})
					}),
					/* @__PURE__ */ H(Sr, {
						onClick: () => a(n.filter((e) => e.id !== t.id)),
						label: O("Remove Animation")
					})
				]
			}), r === t.id && /* @__PURE__ */ H($a, {
				node: e,
				motion: t,
				onChange: (e) => s(t.id, e)
			})]
		}, t.id))
	});
}
function $a({ node: e, motion: t, onChange: n }) {
	let [r, i] = P(0), a = Ha(), o = t.trigger, s = (e) => n({ trigger: {
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
		label: O("Name")
	}, {
		handle: "type",
		type: "select",
		size: "sm",
		label: O("Trigger"),
		required: !0,
		options: Object.entries(a).map(([e, t]) => ({
			value: e,
			label: t.label
		}))
	}], f = [
		...Ja(o.type === "appear", {
			handle: "start",
			type: "select",
			size: "sm",
			label: O("Starts"),
			placeholder: O("A little into view"),
			options: [
				{
					value: "top 95%",
					label: O("As soon as it peeks in")
				},
				{
					value: "top 85%",
					label: O("A little into view")
				},
				{
					value: "top 65%",
					label: O("A third into view")
				},
				{
					value: "center center",
					label: O("At the Center")
				}
			]
		}, {
			handle: "replay",
			type: "toggle",
			size: "sm",
			label: O("Reverse When Scrolled Back")
		}),
		...Ja(o.type === "scroll", {
			handle: "start",
			type: "select",
			size: "sm",
			label: O("Begins"),
			placeholder: O("Enters the Screen"),
			options: [
				{
					value: "top bottom",
					label: O("Enters the Screen")
				},
				{
					value: "top 80%",
					label: O("Top at 80%")
				},
				{
					value: "top center",
					label: O("Top at Center")
				},
				{
					value: "top top",
					label: O("Top at Top")
				},
				{
					value: "center center",
					label: O("Centered")
				}
			]
		}, {
			handle: "end",
			type: "select",
			size: "sm",
			label: O("Ends"),
			placeholder: O("Leaves the Screen"),
			options: [
				{
					value: "bottom top",
					label: O("Leaves the Screen")
				},
				{
					value: "center center",
					label: O("Centered")
				},
				{
					value: "top top",
					label: O("Top at Top")
				},
				{
					value: "bottom center",
					label: O("Bottom at Center")
				},
				{
					value: "bottom bottom",
					label: O("Bottom at Bottom")
				}
			]
		}, {
			handle: "pin",
			type: "text",
			component: "blocks-value",
			label: O("Pin Distance"),
			unit: "vh",
			units: qa,
			step: 10,
			min: 0,
			max: 99999,
			placeholder: "0"
		}, Ga("scrub", O("Smoothing"), { max: 3 })),
		...Ja(l, {
			handle: "repeat",
			type: "select",
			display: "segmented",
			block: !0,
			size: "sm",
			label: O("Repeat||again"),
			required: !0,
			options: [
				{
					value: "0",
					label: O("Once")
				},
				{
					value: "1",
					label: O("Twice")
				},
				{
					value: "-1",
					label: O("Forever||repeat")
				}
			]
		}, {
			handle: "yoyo",
			type: "toggle",
			size: "sm",
			label: O("Back and Forth")
		}, {
			handle: "hold",
			type: "number",
			size: "sm",
			label: O("Loop as a Timeline, Resting (s)"),
			if: { repeat: "-1" }
		}),
		...Ja(o.type === "scroll" || o.type === "appear", {
			handle: "watch",
			type: "select",
			component: "blocks-node",
			label: O("Watch"),
			placeholder: O("This Element"),
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
		e === "name" ? n({ name: t ?? "" }) : e === "type" ? t && s({ type: t }) : e === "start" || e === "end" ? s({ [e]: t ?? void 0 }) : e === "pin" ? s({ pin: typeof t == "string" && Ka.test(t.trim()) && parseFloat(t) > 0 ? t.trim() : void 0 }) : e === "scrub" ? s({ scrub: parseFloat(t) > 0 ? Math.min(3, Math.max(.05, parseFloat(t))) : void 0 }) : e === "replay" ? s({ once: !t && void 0 }) : e === "repeat" ? n({ repeat: Number(t ?? 0) }) : e === "yoyo" ? n({ yoyo: t || void 0 }) : e === "hold" ? n({ hold: t === "" || t == null ? void 0 : Number(t) }) : e === "watch" && s({ node: t ? `#${t}` : void 0 });
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
			/* @__PURE__ */ H(Y, {
				fields: [...d, ...f],
				values: m,
				onChange: h
			}),
			/* @__PURE__ */ U("div", {
				className: "flex min-h-7 items-center",
				children: [/* @__PURE__ */ H(mr, { field: {
					handle: "on",
					type: "select",
					label: O("Plays On")
				} }), /* @__PURE__ */ H("div", {
					role: "group",
					"aria-label": O("Plays On"),
					className: "flex gap-0.5",
					children: [
						[
							"desktop",
							"monitor",
							O("Desktop")
						],
						[
							"tablet",
							"tablet",
							O("Tablet")
						],
						[
							"mobile",
							"phone",
							O("Phone")
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
					children: O("Animation ID")
				}), /* @__PURE__ */ H("code", {
					className: "select-all font-mono text-text",
					children: t.id
				})]
			}),
			/* @__PURE__ */ H(no, {
				steps: t.steps,
				active: u,
				onSelect: i,
				onChange: c,
				onAdd: g
			}),
			t.steps[u] && /* @__PURE__ */ H(ro, {
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
function eo(e) {
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
var to = (e) => Math.max(0, Math.round(e * 20) / 20);
function no({ steps: e, active: t, onSelect: n, onChange: r, onAdd: i }) {
	let a = eo(e), o = Math.max(.5, ...a.map((e) => e.start + e.duration + e.spread)), s = N(null), c = s.current?.total ?? Math.ceil(o * 2 + .25) / 2, l = c <= 1.5 ? .25 : c <= 4 ? .5 : c <= 10 ? 1 : 2, u = Array.from({ length: Math.floor(c / l) + 1 }, (e, t) => t * l), d = (e) => `${e / c * 100}%`, f = (t, i, a) => {
		t.preventDefault(), t.stopPropagation(), n(i);
		let o = t.currentTarget.closest("[data-track]");
		if (!o) return;
		s.current = {
			total: c,
			width: o.clientWidth
		};
		let l = t.clientX, u = e[i], d = a === "move" ? u.at === void 0 ? u.delay ?? 0 : u.at : u.duration ?? .6, f = (e) => {
			let t = (e.clientX - l) / s.current.width * s.current.total;
			a === "end" ? r(i, { duration: Math.max(.05, to(d + t)) }) : u.at === void 0 ? r(i, { delay: to(d + t) || void 0 }) : r(i, { at: to(d + t) });
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
					children: O("Timeline")
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
					className: B("flex h-7 items-center pr-2", i === t && "bg-focus-soft"),
					children: [/* @__PURE__ */ H(F, {
						variant: "ghost",
						size: "xs",
						onClick: () => n(i),
						className: B("w-24 !justify-start !bg-transparent !pl-2 !pr-0 text-left !text-2xs", i === t ? "!font-medium !text-ink" : "!font-normal !text-muted hover:!text-text"),
						children: /* @__PURE__ */ H("span", {
							className: "truncate",
							children: Za(e.target)
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
								"aria-label": O("Step {n}", { n: i + 1 }),
								"aria-valuenow": o.start,
								"aria-valuetext": O("Starts at {start}s, runs {duration}s", {
									start: o.start.toFixed(2),
									duration: o.duration.toFixed(2)
								}),
								onPointerDown: (e) => f(e, i, "move"),
								onKeyDown: (t) => {
									if (t.key !== "ArrowLeft" && t.key !== "ArrowRight") return;
									t.preventDefault();
									let n = t.key === "ArrowRight" ? .05 : -.05;
									t.shiftKey ? r(i, { duration: Math.max(.05, to((e.duration ?? .6) + n)) }) : e.at === void 0 ? r(i, { delay: to((e.delay ?? 0) + n) || void 0 }) : r(i, { at: to(e.at + n) });
								},
								className: B("cms-focus-ring group/bar absolute top-1 flex h-4 cursor-grab items-center rounded-xs active:cursor-grabbing", i === t ? "bg-focus" : "bg-focus/50 hover:bg-focus/70"),
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
			/* @__PURE__ */ H(br, {
				size: "xs",
				onClick: i,
				className: "ml-24 mt-0.5 !w-auto",
				children: O("Add Step")
			})
		]
	});
}
function ro({ node: e, step: t, index: n, count: i, onChange: a, onRemove: s }) {
	let { catalog: c } = o(), { byGroup: l } = r(), u = t.target ?? "self", d = Ua(), f = Object.keys(c.motion?.properties ?? d), p = Ya.includes(e.type), m = (e) => {
		let n = t[e] ?? {}, r = (t, r) => a({ [e]: {
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
						children: O(e === "from" ? "From" : "To||end value")
					}), /* @__PURE__ */ H(xe, {
						align: "end",
						trigger: /* @__PURE__ */ H(L, {
							icon: "plus",
							label: O(e === "from" ? "Add a Start Property" : "Add an End Property"),
							size: "xs"
						}),
						items: f.filter((e) => !(e in n)).map((e) => ({
							label: d[e] ?? e,
							onSelect: () => r(e, c.motion.properties[e] === "css" ? e === "clipPath" ? "inset(0% 0% 0% 0%)" : "token:color.primary" : e === "opacity" || e.startsWith("scale") ? "1" : "0")
						}))
					})]
				}),
				Object.keys(n).length === 0 && /* @__PURE__ */ H("p", {
					className: "m-0 text-2xs text-faint",
					children: O(e === "from" ? "As it looks now" : "As Designed")
				}),
				/* @__PURE__ */ H(Y, {
					bare: !0,
					fields: [{
						handle: e,
						type: "json",
						component: "blocks-pairs",
						className: "items-start",
						label: O(e === "from" ? "From" : "To||end value"),
						labels: d,
						item: {
							handle: "value",
							type: "text",
							component: "blocks-value",
							label: O("Value"),
							unit: ""
						},
						items: Object.fromEntries(Object.keys(n).map((e) => [e, {
							handle: "value",
							type: "text",
							component: "blocks-value",
							label: O("Value"),
							unit: "",
							step: e === "opacity" || e.startsWith("scale") ? .05 : 1,
							group: e.toLowerCase().includes("color") ? "color" : void 0
						}]))
					}],
					values: { [e]: n },
					onChange: (t, n) => {
						let r = Object.fromEntries(Object.entries(n).filter(([, e]) => e !== null && e !== "").map(([e, t]) => [e, typeof t == "string" && /^-?[\d.]+$/.test(t) ? Number(t) : t]));
						a({ [e]: Object.keys(r).length ? r : void 0 });
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
						children: i > 1 ? O("Step {n}", { n: n + 1 }) : O("Animate")
					}),
					/* @__PURE__ */ H("span", { className: "flex-1" }),
					i > 1 && /* @__PURE__ */ H(Sr, {
						onClick: s,
						label: O("Remove Step")
					})
				]
			}),
			/* @__PURE__ */ H(Y, {
				fields: [
					{
						handle: "target",
						type: "select",
						size: "sm",
						label: O("Target"),
						required: !0,
						options: [
							{
								value: "self",
								label: O("This Element")
							},
							{
								value: "children",
								label: O("Each Child in Turn")
							},
							...p ? [
								{
									value: "words",
									label: O("Each Word")
								},
								{
									value: "lines",
									label: O("Each Line")
								},
								{
									value: "chars",
									label: O("Each Letter")
								}
							] : [],
							{
								value: "other",
								label: O("Another Element")
							}
						]
					},
					...Ja(u.startsWith("#"), {
						handle: "element",
						type: "select",
						component: "blocks-node",
						label: O("Element")
					}),
					...Ja(u === "words" || u === "chars", {
						handle: "mask",
						type: "toggle",
						size: "sm",
						label: O("Rise from Behind a Line")
					})
				],
				values: {
					target: u.startsWith("#") ? "other" : u,
					element: u.slice(1),
					mask: !!t.mask
				},
				onChange: (t, n) => a(t === "mask" ? { mask: n || void 0 } : { target: t === "target" ? n === "other" ? `#${e.id}` : n ?? "self" : n ? `#${n}` : "self" })
			}),
			m("from"),
			m("to"),
			/* @__PURE__ */ H(Y, {
				fields: [
					Ga("duration", O("Duration")),
					Ga("delay", O("Delay")),
					...Ja(u !== "self", Ga("stagger", O("Stagger"), { step: .01 })),
					...Ja(i > 1, Ga("at", O("Starts At||time"), { placeholder: O("After") })),
					{
						handle: "ease",
						type: "text",
						component: "ease",
						label: O("Ease"),
						placeholder: O("Smooth Out"),
						options: [...(l.get("ease") ?? []).map((e) => ({
							value: `token:${e.path}`,
							label: e.name,
							curve: String(e.value)
						})), ...Wa()]
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
					if (e === "ease") return a({ ease: t ?? void 0 });
					let n = parseFloat(t);
					a({ [e]: e === "duration" ? n > 0 ? n : .6 : n > 0 || e === "at" && n === 0 ? n : void 0 });
				}
			})
		]
	});
}
// admin/src/builder/Inspector.tsx
var io = [
	"content",
	"design",
	"interact"
], ao = "cms.block.tab";
function oo(e) {
	if (!e.scrollTop) return null;
	let t = e.getBoundingClientRect().top, n = [...e.querySelectorAll("[data-section]")].find((e) => e.getBoundingClientRect().bottom > t);
	return {
		section: n?.dataset.section,
		offset: n ? n.getBoundingClientRect().top - t : 0,
		scrollTop: e.scrollTop
	};
}
function so(e, t) {
	let n = t.section && e.querySelector(`[data-section="${CSS.escape(t.section)}"]`);
	n ? e.scrollTop += n.getBoundingClientRect().top - e.getBoundingClientRect().top - t.offset : e.scrollTop = t.scrollTop;
}
function co() {
	try {
		let e = sessionStorage.getItem(ao);
		return io.find((t) => t === e) ?? "content";
	} catch {
		return "content";
	}
}
function lo({ node: e, onBack: n, backLabel: r, onClose: i }) {
	let { store: a, types: s, allowed: c, readOnly: l } = o(), d = s.get(e.type), f = t(), [p, m] = P(co), h = `block-inspector-${he()}`, [g, _] = P(!1), v = N(null), y = N(e.id), b = N(null);
	y.current !== e.id && (y.current = e.id, b.current = v.current && oo(v.current)), ge(() => {
		v.current && b.current && so(v.current, b.current), b.current = null;
	}, [e.id]);
	let x = (e) => {
		try {
			sessionStorage.setItem(ao, e);
		} catch {}
		m(e);
	}, S = !l && e.type !== "component" && E("entries.components.create");
	return /* @__PURE__ */ U("div", {
		className: "flex h-full min-h-0 min-w-0 flex-col",
		"data-blocks-inspector": !0,
		children: [
			/* @__PURE__ */ H(Ce, {
				bordered: !1,
				onBack: n,
				backLabel: r,
				onClose: i,
				icon: e.type === "component" ? "symbol" : d?.icon ?? "square",
				actions: /* @__PURE__ */ H(xe, {
					align: "end",
					trigger: /* @__PURE__ */ H(L, {
						icon: "more",
						label: O("Block Actions"),
						size: "sm"
					}),
					items: [
						{
							label: O("Rename"),
							icon: "edit",
							disabled: l,
							onSelect: () => _(!0)
						},
						{
							label: O("Duplicate"),
							icon: "copy",
							shortcut: "mod+d",
							disabled: l,
							onSelect: () => a.duplicate(e.id)
						},
						S && ee(a, s, c) && {
							label: O("Make a Component"),
							icon: "symbol",
							onSelect: () => {
								a.selection().includes(e.id) || a.select(e.id), _t(a);
							}
						},
						!l && E("entries.patterns.create") && {
							label: O("Save as Pattern"),
							icon: "section-copy",
							onSelect: () => {
								a.selection().includes(e.id) || a.select(e.id), vt(a);
							}
						},
						{
							label: O("Copy ID"),
							icon: "hash",
							onSelect: () => void Ae(e.id, { copied: O("Copied {reference}", { reference: e.id }) })
						},
						{
							separator: !0,
							label: ""
						},
						{
							label: O("Delete"),
							icon: "trash",
							shortcut: "⌫",
							danger: !0,
							disabled: l,
							onSelect: () => a.remove(e.id)
						}
					]
				}),
				children: g ? /* @__PURE__ */ H("div", {
					className: "min-w-0 flex-1 pl-1",
					onBlur: () => _(!1),
					onKeyUp: (e) => e.key === "Escape" && e.target.blur(),
					children: /* @__PURE__ */ H(Y, {
						bare: !0,
						fields: [{
							handle: "label",
							type: "text",
							size: "sm",
							commit: "blur",
							label: O("Name"),
							autofocus: !0,
							placeholder: d?.title
						}],
						values: { label: e.label ?? "" },
						onChange: (t, n) => a.updateNode(e.id, { label: n.trim() || void 0 })
					})
				}) : /* @__PURE__ */ H(F, {
					variant: "ghost",
					onDoubleClick: () => !l && _(!0),
					className: "min-w-0 flex-1 shrink !justify-start !bg-transparent !pl-1 !pr-0 text-left !font-medium !text-ink",
					title: l ? void 0 : O("Double-Click to Rename"),
					children: /* @__PURE__ */ H("span", {
						className: "truncate",
						children: u(e, s, f)
					})
				})
			}),
			/* @__PURE__ */ H("div", {
				className: "flex h-10 shrink-0 items-center gap-2 border-b border-border pl-4 pr-3",
				children: /* @__PURE__ */ H(Oe, {
					id: h,
					value: p,
					onChange: x,
					bordered: !1,
					size: "sm",
					className: "h-full min-w-0 flex-1",
					tabs: io.map((e) => ({
						value: e,
						label: {
							content: O("Content"),
							design: O("Design"),
							interact: O("Interact")
						}[e]
					}))
				})
			}),
			/* @__PURE__ */ H("fieldset", {
				ref: v,
				role: "tabpanel",
				id: `${h}-${p}-panel`,
				"aria-labelledby": `${h}-${p}`,
				disabled: l || !d && e.type !== "component",
				className: "m-0 min-h-0 min-w-0 flex-1 overflow-y-auto border-0 p-0",
				children: /* @__PURE__ */ U(ue, { children: [
					p === "design" && /* @__PURE__ */ H(va, { node: e }),
					p === "content" && /* @__PURE__ */ H(Qr, { node: e }),
					p === "interact" && /* @__PURE__ */ U(Re, { children: [/* @__PURE__ */ H(Qa, { node: e }), /* @__PURE__ */ H(Na, { node: e })] })
				] }, e.id)
			})
		]
	});
}
export { zn as A, bn as B, _r as C, Gn as D, Un as E, Dn as F, J as G, _n as H, An as I, qe as J, lt as K, vn as L, jn as M, kn as N, Rn as O, On as P, Cn as R, mr as S, Yn as T, ft as U, yn as V, dt as W, We as X, Ve as Y, G as Z, Er as _, Li as a, Y as b, ai as c, Ur as d, Wr as f, Or as g, Ir as h, Ji as i, Vn as j, Bn as k, ii as l, Ar as m, Wi as n, Ii as o, jr as p, q, Vi as r, Di as s, lo as t, ri as u, Cr as v, nr as w, Sr as x, xr as y, Sn as z };
