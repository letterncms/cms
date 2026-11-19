// admin/src/core/types.ts
function e() {
	return "b" + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
}
// admin/src/core/tree.ts
function t(e, n) {
	for (let r of e) {
		if (r.id === n) return r;
		if (r.children) {
			let e = t(r.children, n);
			if (e) return e;
		}
	}
	return null;
}
function n(e, t, r = null) {
	for (let i = 0; i < e.length; i++) {
		if (e[i].id === t) return {
			parentId: r,
			index: i
		};
		let a = e[i].children;
		if (a) {
			let r = n(a, t, e[i].id);
			if (r) return r;
		}
	}
	return null;
}
function r(e, n) {
	return n === null ? e : t(e, n)?.children ?? [];
}
function i(e, r) {
	let i = n(e, r);
	return i?.parentId ? t(e, i.parentId) : null;
}
function a(e, r) {
	let i = [], a = n(e, r);
	for (; a?.parentId;) {
		let r = t(e, a.parentId);
		if (!r) break;
		i.unshift(r), a = n(e, r.id);
	}
	return i;
}
var o = (e, t) => t.length === e.children.length && t.every((t, n) => t === e.children[n]) ? e : {
	...e,
	children: t
};
function s(e, t, n) {
	return e.map((e) => e.id === t ? n(e) : e.children ? o(e, s(e.children, t, n)) : e);
}
function c(e, t) {
	return e.filter((e) => e.id !== t).map((e) => e.children ? o(e, c(e.children, t)) : e);
}
function l(e, t, n, r) {
	if (t === null) {
		let t = e.slice();
		return t.splice(Math.max(0, Math.min(n, t.length)), 0, ...r), t;
	}
	return s(e, t, (e) => {
		let t = (e.children ?? []).slice();
		return t.splice(Math.max(0, Math.min(n, t.length)), 0, ...r), {
			...e,
			children: t
		};
	});
}
function u(e, r, i, a) {
	let o = t(e, r), s = n(e, r);
	if (!o || !s || i && (i === r || t(o.children ?? [], i))) return e;
	let u = s.parentId === i && s.index < a ? a - 1 : a;
	return l(c(e, r), i, u, [o]);
}
function d(t) {
	return {
		...structuredClone(t),
		id: e(),
		children: t.children?.map(d)
	};
}
function f(e, t = 0, n = [], r = null) {
	for (let i of e) n.push({
		node: i,
		depth: t,
		parentId: r
	}), i.children && f(i.children, t + 1, n, i.id);
	return n;
}
function p(t, n = {}, r) {
	let i = { ...t.defaults ?? {} };
	for (let e of t.fields ?? []) e.default !== void 0 && i[e.handle] === void 0 && (i[e.handle] = e.default);
	let a = {
		id: e(),
		type: t.name,
		props: {
			...i,
			...n
		}
	};
	return t.children && (a.children = (t.template ?? []).map((e) => m(e, r))), a;
}
function m(t, n) {
	let r = n?.get(t.type ?? ""), i = r ? p(r, {}, n) : {
		id: e(),
		type: t.type ?? "paragraph",
		props: {}
	};
	return {
		...i,
		props: {
			...i.props,
			...t.props ?? {}
		},
		...t.class ? { class: t.class } : {},
		children: t.children ? t.children.map((e) => m(e, n)) : i.children
	};
}
function h(e) {
	return typeof e != "string" || e.replace(/<br\s*\/?>/g, "").replace(/&nbsp;/g, " ").replace(/<[^>]+>/g, "").trim() === "";
}
function g(e, t = 60) {
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
function _(t, n) {
	return t.kind === "block" ? [p(t.type, {}, n)] : t.component.synced ? [{
		id: e(),
		type: "component",
		props: { ref: t.component.handle }
	}] : t.component.blocks.map((e) => d(e));
}
function v(e, t, n, r = []) {
	let i = n.get(t);
	if (e === null) return (r.length === 0 || r.includes(t)) && !i?.parent;
	let a = n.get(e.type);
	return !a?.children || i?.parent && i.parent !== e.type && e.type !== "repeat" ? !1 : !Array.isArray(a.children) || a.children.includes(t);
}
function y(e, t, n) {
	let r = e.selection()[0], a = r ? i(e.get().nodes, r) : null;
	return v(a, "component", t, a ? [] : n);
}
function b(e, r, i, a, o = []) {
	let s = (e) => (Array.isArray(i) ? i : [i]).every((t) => v(e, t, a, e ? [] : o)), c = r;
	for (;;) {
		let r = n(e, c);
		if (!r) return s(null) ? {
			parentId: null,
			index: e.length
		} : null;
		let i = r.parentId ? t(e, r.parentId) : null;
		if (s(i)) return {
			parentId: r.parentId,
			index: r.index + 1
		};
		if (!i) return null;
		c = i.id;
	}
}
export { g as _, a, t as c, h as d, n as f, r as g, c as h, b as i, f as l, i as m, _ as n, d as o, u as p, y as r, p as s, v as t, l as u, s as v, e as y };
