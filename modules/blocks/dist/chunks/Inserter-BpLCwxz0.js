import { t as e, useAbility as t } from "@letterncms/sdk";
import { createContext as n, useContext as r, useEffect as i, useLayoutEffect as a, useMemo as o, useRef as s, useState as c } from "react";
import { Button as l, Fields as u, Icon as d, PagePreview as f, Segmented as p, cn as m } from "@letterncms/ui";
import { jsx as h, jsxs as g } from "react/jsx-runtime";
// admin/src/core/context.tsx
var _ = n(null);
function v({ value: e, children: t }) {
	return e.store.setReadOnly(!!e.readOnly), /* @__PURE__ */ h(_.Provider, {
		value: e,
		children: t
	});
}
function y() {
	let e = r(_);
	if (!e) throw Error("Block editor context missing");
	return e;
}
function b() {
	let e = t("blocks/types", {}, { staleTime: 3e5 }), n = o(() => new Map((e.data?.blocks ?? []).map((e) => [e.name, e])), [e.data]);
	return {
		catalog: e.data,
		types: n,
		isLoading: e.isLoading,
		error: e.error,
		retry: () => void e.refetch()
	};
}
function x() {
	let e = t("components/list", {}, { staleTime: 6e4 });
	return o(() => new Map((e.data ?? []).map((e) => [e.handle, e.title])), [e.data]);
}
function S(e, t, n) {
	return e.label || (e.type === "component" ? n.get(String(e.props?.ref ?? "")) : void 0) || t.get(e.type)?.title || e.type;
}
// admin/src/core/slashKeys.ts
function C(e, t, n) {
	return t >= 0 && t < e ? "choose" : n ? "wait" : "pass";
}
function w(e, t) {
	return e > 0 ? "choose" : t ? "wait" : "release";
}
function T(e, t) {
	return e && !t;
}
// admin/src/core/Inserter.tsx
var E = (e) => `/__pattern/${encodeURIComponent(e)}`, D = (e) => e.replace(/[-_]+/g, " ").replace(/(^|\s)\S/g, (e) => e.toUpperCase()), O = (e) => e.kind === "block" ? e.type.title : e.kind === "component" ? e.component.title : e.pattern.title, k = (e) => e.kind === "block" ? e.type.icon : e.kind === "component" ? "symbol" : "section-copy", A = (e) => e.kind === "block" ? e.type.name : e.kind === "component" ? `c-${e.component.handle}` : `p-${e.pattern.handle}`;
function j(e, t) {
	return e.blocks.length > 0 && e.blocks.every((e) => t(e.type));
}
var M = (e, t) => !t || [
	e.title,
	e.category,
	e.description,
	...e.keywords ?? []
].some((e) => e.toLowerCase().includes(t));
function N(n, r, i, a = !0) {
	let s = t("components/list", {}, { staleTime: 6e4 }), c = t("patterns/list", {}, { staleTime: 6e4 }), { catalog: l } = b();
	return {
		items: o(() => {
			let t = l?.categories ?? [], o = (e) => {
				let n = t.findIndex((t) => t.name === e);
				return n < 0 ? t.length : n;
			}, u = (e) => t.find((t) => t.name === e)?.label ?? D(e), d = r.trim().toLowerCase(), f = (e) => e.toLowerCase().includes(d), p = n.filter((e) => i ? i(e) : !e.parent).filter((e) => !d || f(e.title) || f(e.name) || (e.keywords ?? []).some(f)).sort((e, n) => o(e.category) - o(n.category) || (o(e.category) === t.length ? u(e.category).localeCompare(u(n.category)) : 0)), m = (e) => {
				let t = e.title.toLowerCase();
				return t === d ? 0 : t.startsWith(d) ? 1 : f(e.title) ? 2 : 3;
			}, h = (d ? [...p].sort((e, t) => m(e) - m(t)) : p).map((t) => ({
				kind: "block",
				type: t,
				group: d ? e("Blocks") : u(t.category)
			})), g = (e) => {
				let t = n.find((t) => t.name === e);
				return !!t && (i ? i(t) : !t.parent);
			}, _ = (a && g("component") ? s.data ?? [] : []).filter((e) => !d || f(e.title) || f(e.category) || f(e.description)).map((t) => ({
				kind: "component",
				component: t,
				group: e("Components")
			})), v = (a ? c.data ?? [] : []).filter((e) => j(e, g) && M(e, d)).map((t) => ({
				kind: "pattern",
				pattern: t,
				group: e("Patterns")
			}));
			return [
				...h,
				..._,
				...v
			];
		}, [
			n,
			r,
			s.data,
			c.data,
			i,
			a,
			l
		]),
		loading: a && (s.isLoading || c.isLoading)
	};
}
function P({ types: t, query: n, onQuery: r, onChoose: _, onClose: v, allowed: y, showSearch: b = !0, className: x, style: S, compact: T, chooseFirst: D, onNoMatch: j, components: M = !0, keyboardDocument: P }) {
	let { items: F, loading: I } = N(t, n, y, M), [L, R] = c("blocks"), z = o(() => F.filter((e) => e.kind === "pattern"), [F]), B = M && !T && z.length > 0 && !n.trim(), V = B && L === "patterns" ? z : F, [H, U] = c(0), W = s(null);
	i(() => U(0), [n, L]);
	let G = s({
		items: V,
		active: H,
		loading: I
	});
	G.current = {
		items: V,
		active: H,
		loading: I
	};
	let K = s(!!D);
	i(() => {
		if (!K.current) return;
		let e = w(V.length, I);
		e !== "wait" && (K.current = !1, e === "choose" ? _(V[0]) : j?.());
	}, [V, I]), a(() => {
		let e = (e) => {
			let { items: t, active: n, loading: r } = G.current;
			if (e.key === "ArrowDown") e.preventDefault(), U((e) => Math.min(t.length - 1, e + 1));
			else if (e.key === "ArrowUp") e.preventDefault(), U((e) => Math.max(0, e - 1));
			else if (e.key === "Enter") {
				let i = C(t.length, n, r);
				i !== "pass" && (e.preventDefault(), e.stopPropagation(), i === "choose" ? _(t[n]) : K.current = !0);
			} else e.key === "Escape" && (e.preventDefault(), v?.());
		};
		return window.addEventListener("keydown", e, !0), P?.addEventListener("keydown", e, !0), () => {
			window.removeEventListener("keydown", e, !0), P?.removeEventListener("keydown", e, !0);
		};
	}, [
		_,
		v,
		P
	]), i(() => {
		W.current?.querySelector(`[data-index="${H}"]`)?.scrollIntoView({ block: "nearest" });
	}, [H]);
	let q = "";
	return /* @__PURE__ */ g("div", {
		className: m("flex max-h-[min(420px,60vh)] w-[300px] flex-col", x),
		style: S,
		children: [
			b && /* @__PURE__ */ h("div", {
				className: "border-b border-border p-1.5",
				children: /* @__PURE__ */ h(u, {
					bare: !0,
					fields: [{
						handle: "query",
						type: "text",
						label: e("Search"),
						icon: "search",
						size: "sm",
						autofocus: !0,
						placeholder: e("Search Blocks")
					}],
					values: { query: n },
					onChange: (e, t) => r?.(t ?? "")
				})
			}),
			B && /* @__PURE__ */ h("div", {
				className: "border-b border-border p-1.5",
				children: /* @__PURE__ */ h(p, {
					size: "sm",
					block: !0,
					"aria-label": e("Show"),
					value: L,
					onChange: R,
					options: [{
						value: "blocks",
						label: e("Blocks")
					}, {
						value: "patterns",
						label: e("Patterns")
					}]
				})
			}),
			/* @__PURE__ */ g("div", {
				ref: W,
				className: "min-h-0 flex-1 overflow-y-auto p-1",
				children: [
					V.length === 0 && /* @__PURE__ */ h("div", {
						className: "px-3 py-6 text-center text-xs text-faint",
						children: e("No matching blocks")
					}),
					B && L === "patterns" && V.map((e, t) => {
						if (e.kind !== "pattern") return null;
						let n = e.pattern.category === q ? null : e.pattern.category;
						return q = e.pattern.category, /* @__PURE__ */ g("div", { children: [n && /* @__PURE__ */ h("div", {
							className: "cms-label px-2 pb-1 pt-2",
							children: n
						}), /* @__PURE__ */ g(l, {
							variant: "ghost",
							size: "md",
							"data-index": t,
							title: e.pattern.description || void 0,
							onMouseMove: () => t !== H && U(t),
							onMouseDown: (e) => e.preventDefault(),
							onClick: () => _(e),
							"data-active": t === H || void 0,
							className: "!h-auto w-full !flex-col !items-stretch !gap-1.5 !rounded-sm !p-1.5 text-left",
							children: [/* @__PURE__ */ h(f, {
								src: E(e.pattern.handle),
								maxHeight: 160
							}), /* @__PURE__ */ h("span", {
								className: "min-w-0 truncate px-0.5 text-sm",
								children: e.pattern.title
							})]
						})] }, A(e));
					}),
					!(B && L === "patterns") && V.map((t, n) => {
						let r = t.group === q ? null : t.group;
						q = t.group;
						let i = O(t), a = t.kind === "block" ? t.type.description : t.kind === "component" ? t.component.description || e("Component") : t.pattern.description || t.pattern.category, o = k(t);
						return /* @__PURE__ */ g("div", { children: [r && /* @__PURE__ */ h("div", {
							className: "cms-label px-2 pb-1 pt-2",
							children: r
						}), /* @__PURE__ */ g(l, {
							variant: "ghost",
							size: "md",
							"data-index": n,
							title: a || void 0,
							onMouseMove: () => n !== H && U(n),
							onMouseDown: (e) => e.preventDefault(),
							onClick: () => _(t),
							"data-active": n === H || void 0,
							className: m("w-full !justify-start !gap-2.5 !rounded-sm !px-2 text-left", !T && "!h-9"),
							children: [/* @__PURE__ */ h("span", {
								className: "grid size-7 shrink-0 place-items-center rounded-xs border border-border bg-surface text-muted",
								children: /* @__PURE__ */ h(d, {
									name: o,
									size: 14
								})
							}), /* @__PURE__ */ h("span", {
								className: "min-w-0 truncate",
								children: i
							})]
						})] }, A(t));
					})
				]
			})
		]
	});
}
export { M as a, T as c, b as d, x as f, O as i, v as l, k as n, E as o, y as p, A as r, N as s, P as t, S as u };
