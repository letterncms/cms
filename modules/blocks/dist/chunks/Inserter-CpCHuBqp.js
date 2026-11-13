import { t as e, useAbility as t } from "@letterncms/sdk";
import { createContext as n, useContext as r, useEffect as i, useLayoutEffect as a, useMemo as o, useRef as s, useState as c } from "react";
import { Button as l, Fields as u, Icon as d, Segmented as f, cn as p } from "@letterncms/ui";
import { jsx as m, jsxs as h } from "react/jsx-runtime";
// admin/src/core/context.tsx
var g = n(null);
function _({ value: e, children: t }) {
	return e.store.setReadOnly(!!e.readOnly), /* @__PURE__ */ m(g.Provider, {
		value: e,
		children: t
	});
}
function v() {
	let e = r(g);
	if (!e) throw Error("Block editor context missing");
	return e;
}
function y() {
	let e = t("blocks/types", {}, { staleTime: 3e5 }), n = o(() => new Map((e.data?.blocks ?? []).map((e) => [e.name, e])), [e.data]);
	return {
		catalog: e.data,
		types: n,
		isLoading: e.isLoading,
		error: e.error,
		retry: () => void e.refetch()
	};
}
function b() {
	let e = t("components/list", {}, { staleTime: 6e4 });
	return o(() => new Map((e.data ?? []).map((e) => [e.handle, e.title])), [e.data]);
}
function x(e, t, n) {
	return e.label || (e.type === "component" ? n.get(String(e.props?.ref ?? "")) : void 0) || t.get(e.type)?.title || e.type;
}
function S() {
	let e = t("design/get", {}, {
		staleTime: 6e4,
		retry: !1
	});
	return o(() => {
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
// admin/src/core/PatternPreview.tsx
var C = 1280;
function w({ handle: e, maxHeight: t = 360, className: n }) {
	let r = s(null), [i, o] = c(.2), [l, u] = c(720);
	a(() => {
		let e = r.current;
		if (!e) return;
		let t = () => o(e.clientWidth / C || .2);
		t();
		let n = new ResizeObserver(t);
		return n.observe(e), () => n.disconnect();
	}, []);
	let d = (e) => {
		try {
			let t = e.contentDocument?.documentElement;
			t && u(Math.max(120, Math.min(6e3, t.scrollHeight)));
		} catch {}
	};
	return /* @__PURE__ */ m("div", {
		ref: r,
		"aria-hidden": "true",
		className: p("relative w-full overflow-hidden rounded-md border border-border bg-surface", n),
		style: { height: Math.min(t, l * i) },
		children: /* @__PURE__ */ m("iframe", {
			src: `/__pattern/${encodeURIComponent(e)}`,
			title: "",
			loading: "lazy",
			tabIndex: -1,
			onLoad: (e) => d(e.currentTarget),
			className: "pointer-events-none absolute left-0 top-0 origin-top-left border-0",
			style: {
				width: C,
				height: l,
				transform: `scale(${i})`
			}
		})
	});
}
// admin/src/core/slashKeys.ts
function T(e, t, n) {
	return t >= 0 && t < e ? "choose" : n ? "wait" : "pass";
}
function E(e, t) {
	return e > 0 ? "choose" : t ? "wait" : "release";
}
function D(e, t) {
	return e && !t;
}
// admin/src/core/Inserter.tsx
var O = (e) => e.replace(/[-_]+/g, " ").replace(/(^|\s)\S/g, (e) => e.toUpperCase()), k = (e) => e.kind === "block" ? e.type.title : e.kind === "component" ? e.component.title : e.pattern.title, A = (e) => e.kind === "block" ? e.type.icon : e.kind === "component" ? "symbol" : "section-copy", j = (e) => e.kind === "block" ? e.type.name : e.kind === "component" ? `c-${e.component.handle}` : `p-${e.pattern.handle}`;
function M(e, t) {
	return e.blocks.length > 0 && e.blocks.every((e) => t(e.type));
}
var N = (e, t) => !t || [
	e.title,
	e.category,
	e.description,
	...e.keywords ?? []
].some((e) => e.toLowerCase().includes(t));
function P(n, r, i, a = !0) {
	let s = t("components/list", {}, { staleTime: 6e4 }), c = t("patterns/list", {}, { staleTime: 6e4 }), { catalog: l } = y();
	return {
		items: o(() => {
			let t = l?.categories ?? [], o = (e) => {
				let n = t.findIndex((t) => t.name === e);
				return n < 0 ? t.length : n;
			}, u = (e) => t.find((t) => t.name === e)?.label ?? O(e), d = r.trim().toLowerCase(), f = (e) => e.toLowerCase().includes(d), p = n.filter((e) => i ? i(e) : !e.parent).filter((e) => !d || f(e.title) || f(e.name) || (e.keywords ?? []).some(f)).sort((e, n) => o(e.category) - o(n.category) || (o(e.category) === t.length ? u(e.category).localeCompare(u(n.category)) : 0)), m = (e) => {
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
			})), v = (a ? c.data ?? [] : []).filter((e) => M(e, g) && N(e, d)).map((t) => ({
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
function F({ types: t, query: n, onQuery: r, onChoose: g, onClose: _, allowed: v, showSearch: y = !0, className: b, style: x, compact: S, chooseFirst: C, onNoMatch: D, components: O = !0, keyboardDocument: M }) {
	let { items: N, loading: F } = P(t, n, v, O), [I, L] = c("blocks"), R = o(() => N.filter((e) => e.kind === "pattern"), [N]), z = O && !S && R.length > 0 && !n.trim(), B = z && I === "patterns" ? R : N, [V, H] = c(0), U = s(null);
	i(() => H(0), [n, I]);
	let W = s({
		items: B,
		active: V,
		loading: F
	});
	W.current = {
		items: B,
		active: V,
		loading: F
	};
	let G = s(!!C);
	i(() => {
		if (!G.current) return;
		let e = E(B.length, F);
		e !== "wait" && (G.current = !1, e === "choose" ? g(B[0]) : D?.());
	}, [B, F]), a(() => {
		let e = (e) => {
			let { items: t, active: n, loading: r } = W.current;
			if (e.key === "ArrowDown") e.preventDefault(), H((e) => Math.min(t.length - 1, e + 1));
			else if (e.key === "ArrowUp") e.preventDefault(), H((e) => Math.max(0, e - 1));
			else if (e.key === "Enter") {
				let i = T(t.length, n, r);
				i !== "pass" && (e.preventDefault(), e.stopPropagation(), i === "choose" ? g(t[n]) : G.current = !0);
			} else e.key === "Escape" && (e.preventDefault(), _?.());
		};
		return window.addEventListener("keydown", e, !0), M?.addEventListener("keydown", e, !0), () => {
			window.removeEventListener("keydown", e, !0), M?.removeEventListener("keydown", e, !0);
		};
	}, [
		g,
		_,
		M
	]), i(() => {
		U.current?.querySelector(`[data-index="${V}"]`)?.scrollIntoView({ block: "nearest" });
	}, [V]);
	let K = "";
	return /* @__PURE__ */ h("div", {
		className: p("flex max-h-[min(420px,60vh)] w-[300px] flex-col", b),
		style: x,
		children: [
			y && /* @__PURE__ */ m("div", {
				className: "border-b border-border p-1.5",
				children: /* @__PURE__ */ m(u, {
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
			z && /* @__PURE__ */ m("div", {
				className: "border-b border-border p-1.5",
				children: /* @__PURE__ */ m(f, {
					size: "sm",
					block: !0,
					"aria-label": e("Show"),
					value: I,
					onChange: L,
					options: [{
						value: "blocks",
						label: e("Blocks")
					}, {
						value: "patterns",
						label: e("Patterns")
					}]
				})
			}),
			/* @__PURE__ */ h("div", {
				ref: U,
				className: "min-h-0 flex-1 overflow-y-auto p-1",
				children: [
					B.length === 0 && /* @__PURE__ */ m("div", {
						className: "px-3 py-6 text-center text-xs text-faint",
						children: e("No matching blocks")
					}),
					z && I === "patterns" && B.map((e, t) => {
						if (e.kind !== "pattern") return null;
						let n = e.pattern.category === K ? null : e.pattern.category;
						return K = e.pattern.category, /* @__PURE__ */ h("div", { children: [n && /* @__PURE__ */ m("div", {
							className: "cms-label px-2 pb-1 pt-2",
							children: n
						}), /* @__PURE__ */ h(l, {
							variant: "ghost",
							size: "md",
							"data-index": t,
							title: e.pattern.description || void 0,
							onMouseMove: () => t !== V && H(t),
							onMouseDown: (e) => e.preventDefault(),
							onClick: () => g(e),
							"data-active": t === V || void 0,
							className: "!h-auto w-full !flex-col !items-stretch !gap-1.5 !rounded-sm !p-1.5 text-left",
							children: [/* @__PURE__ */ m(w, {
								handle: e.pattern.handle,
								maxHeight: 160
							}), /* @__PURE__ */ m("span", {
								className: "min-w-0 truncate px-0.5 text-sm",
								children: e.pattern.title
							})]
						})] }, j(e));
					}),
					!(z && I === "patterns") && B.map((t, n) => {
						let r = t.group === K ? null : t.group;
						K = t.group;
						let i = k(t), a = t.kind === "block" ? t.type.description : t.kind === "component" ? t.component.description || e("Component") : t.pattern.description || t.pattern.category, o = A(t);
						return /* @__PURE__ */ h("div", { children: [r && /* @__PURE__ */ m("div", {
							className: "cms-label px-2 pb-1 pt-2",
							children: r
						}), /* @__PURE__ */ h(l, {
							variant: "ghost",
							size: "md",
							"data-index": n,
							title: a || void 0,
							onMouseMove: () => n !== V && H(n),
							onMouseDown: (e) => e.preventDefault(),
							onClick: () => g(t),
							"data-active": n === V || void 0,
							className: p("w-full !justify-start !gap-2.5 !rounded-sm !px-2 text-left", !S && "!h-9"),
							children: [/* @__PURE__ */ m("span", {
								className: "grid size-7 shrink-0 place-items-center rounded-xs border border-border bg-surface text-muted",
								children: /* @__PURE__ */ m(d, {
									name: o,
									size: 14
								})
							}), /* @__PURE__ */ m("span", {
								className: "min-w-0 truncate",
								children: i
							})]
						})] }, j(t));
					})
				]
			})
		]
	});
}
export { N as a, w as c, y as d, b as f, k as i, _ as l, S as m, A as n, P as o, v as p, j as r, D as s, F as t, x as u };
