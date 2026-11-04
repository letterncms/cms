// \0rolldown/runtime.js
var e = Object.defineProperty, t = (t, n) => {
	let r = {};
	for (var i in t) e(r, i, {
		get: t[i],
		enumerable: !0
	});
	return n || e(r, Symbol.toStringTag, { value: "Module" }), r;
};
// admin/src/core/types.ts
function n() {
	return "b" + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
}
// admin/src/core/tree.ts
var r = /* @__PURE__ */ t({
	ancestors: () => c,
	clone: () => p,
	create: () => h,
	find: () => i,
	flatten: () => m,
	insert: () => d,
	isEmptyHtml: () => _,
	locate: () => a,
	move: () => f,
	parentOf: () => s,
	remove: () => u,
	siblings: () => o,
	summary: () => v,
	update: () => l
});
function i(e, t) {
	for (let n of e) {
		if (n.id === t) return n;
		if (n.children) {
			let e = i(n.children, t);
			if (e) return e;
		}
	}
	return null;
}
function a(e, t, n = null) {
	for (let r = 0; r < e.length; r++) {
		if (e[r].id === t) return {
			parentId: n,
			index: r
		};
		let i = e[r].children;
		if (i) {
			let n = a(i, t, e[r].id);
			if (n) return n;
		}
	}
	return null;
}
function o(e, t) {
	return t === null ? e : i(e, t)?.children ?? [];
}
function s(e, t) {
	let n = a(e, t);
	return n?.parentId ? i(e, n.parentId) : null;
}
function c(e, t) {
	let n = [], r = a(e, t);
	for (; r?.parentId;) {
		let t = i(e, r.parentId);
		if (!t) break;
		n.unshift(t), r = a(e, t.id);
	}
	return n;
}
function l(e, t, n) {
	return e.map((e) => e.id === t ? n(e) : e.children ? {
		...e,
		children: l(e.children, t, n)
	} : e);
}
function u(e, t) {
	return e.filter((e) => e.id !== t).map((e) => e.children ? {
		...e,
		children: u(e.children, t)
	} : e);
}
function d(e, t, n, r) {
	if (t === null) {
		let t = e.slice();
		return t.splice(Math.max(0, Math.min(n, t.length)), 0, ...r), t;
	}
	return l(e, t, (e) => {
		let t = (e.children ?? []).slice();
		return t.splice(Math.max(0, Math.min(n, t.length)), 0, ...r), {
			...e,
			children: t
		};
	});
}
function f(e, t, n, r) {
	let o = i(e, t), s = a(e, t);
	if (!o || !s || n && (n === t || i(o.children ?? [], n))) return e;
	let c = s.parentId === n && s.index < r ? r - 1 : r;
	return d(u(e, t), n, c, [o]);
}
function p(e) {
	return {
		...structuredClone(e),
		id: n(),
		children: e.children?.map(p)
	};
}
function m(e, t = 0, n = [], r = null) {
	for (let i of e) n.push({
		node: i,
		depth: t,
		parentId: r
	}), i.children && m(i.children, t + 1, n, i.id);
	return n;
}
function h(e, t = {}, r) {
	let i = { ...e.defaults ?? {} };
	for (let t of e.fields ?? []) t.default !== void 0 && i[t.handle] === void 0 && (i[t.handle] = t.default);
	let a = {
		id: n(),
		type: e.name,
		props: {
			...i,
			...t
		}
	};
	return e.children && (a.children = (e.template ?? []).map((e) => g(e, r))), a;
}
function g(e, t) {
	let r = t?.get(e.type ?? ""), i = r ? h(r, {}, t) : {
		id: n(),
		type: e.type ?? "paragraph",
		props: {}
	};
	return {
		...i,
		props: {
			...i.props,
			...e.props ?? {}
		},
		style: e.style,
		children: e.children ? e.children.map((e) => g(e, t)) : i.children
	};
}
function _(e) {
	return typeof e != "string" || e.replace(/<br\s*\/?>/g, "").replace(/&nbsp;/g, " ").replace(/<[^>]+>/g, "").trim() === "";
}
function v(e, t = 60) {
	let n = e.props ?? {}, r = [
		n.text,
		n.label,
		n.title,
		n.question,
		Array.isArray(n.items) ? n.items[0] : "",
		n.alt,
		n.url,
		n.collection,
		n.ref
	].map((e) => (typeof e == "string" ? e : "").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim()).find(Boolean) ?? "";
	return r.length > t ? r.slice(0, t - 1) + "…" : r;
}
// admin/src/core/insert.ts
function y(e, t) {
	return e.kind === "block" ? [h(e.type, {}, t)] : e.pattern.synced ? [{
		id: n(),
		type: "pattern",
		props: { ref: e.pattern.handle }
	}] : e.pattern.blocks.map((e) => p(e));
}
function b(e, t, n, r = []) {
	let i = n.get(t);
	if (e === null) return (r.length === 0 || r.includes(t)) && !i?.parent;
	let a = n.get(e.type);
	return !a?.children || i?.parent && i.parent !== e.type ? !1 : !Array.isArray(a.children) || a.children.includes(t);
}
function x(e, t, n) {
	let r = e.selection()[0], i = r ? s(e.get().nodes, r) : null;
	return b(i, "pattern", t, i ? [] : n);
}
function S(e, t, n, r, o = []) {
	let s = (e) => (Array.isArray(n) ? n : [n]).every((t) => b(e, t, r, e ? [] : o)), c = t;
	for (;;) {
		let t = a(e, c);
		if (!t) return s(null) ? {
			parentId: null,
			index: e.length
		} : null;
		let n = t.parentId ? i(e, t.parentId) : null;
		if (s(n)) return {
			parentId: t.parentId,
			index: t.index + 1
		};
		if (!n) return null;
		c = n.id;
	}
}
export { v as _, c as a, n as b, i as c, _ as d, a as f, o as g, u as h, x as i, m as l, s as m, y as n, p as o, f as p, S as r, h as s, b as t, d as u, r as v, l as y };
