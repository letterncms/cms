import { t as e } from "@letterncms/sdk";
import { useEffect as t, useRef as n, useState as r } from "react";
import { Notice as i, deviceWidths as a } from "@letterncms/ui";
import { loadCompiler as o, loadEngine as s } from "@letterncms/blocks";
import { jsx as c, jsxs as l } from "react/jsx-runtime";
// admin/src/preview.tsx
var u = {
	desktop: "100%",
	tablet: `${a.tablet}px`,
	phone: `${a.phone}px`
};
function d(i, a) {
	let [c, l] = r({
		source: void 0,
		compiler: null,
		problem: null
	}), u = n({
		base: i,
		css: a
	});
	u.current = {
		base: i,
		css: a
	};
	let d = n(!1), f = n({}), p = n(!1), m = n(!0);
	t(() => (m.current = !0, () => {
		m.current = !1;
	}), []);
	let h = !!c.source;
	return t(() => {
		if (!i || a === void 0) return;
		let t = async () => {
			if (d.current = !0, !p.current) {
				p.current = !0;
				try {
					for (; d.current && m.current;) {
						d.current = !1;
						let t = u.current;
						if (!t.base || t.css === void 0) break;
						if (f.current.base === t.base && f.current.css === t.css) continue;
						f.current = t;
						let n = {
							css: t.css,
							files: t.base.files
						};
						try {
							let r = await o(n);
							if (r.build(t.base.candidates), !await s(n)) throw Error(e("Tailwind could not read the stylesheet."));
							m.current && l({
								source: {
									...t.base,
									css: t.css
								},
								compiler: r,
								problem: null
							});
						} catch (e) {
							m.current && l((t) => ({
								...t,
								problem: e instanceof Error ? e.message : String(e)
							}));
						}
					}
				} finally {
					p.current = !1;
				}
			}
		}, n = setTimeout(() => void t(), h ? 150 : 0);
		return () => clearTimeout(n);
	}, [
		i,
		a,
		h
	]), c;
}
function f({ viewport: e, desktop: i, children: a }) {
	let o = n(null), [s, l] = r({
		width: 0,
		height: 0
	});
	t(() => {
		let e = o.current;
		if (!e) return;
		let t = () => l({
			width: e.clientWidth,
			height: e.clientHeight
		});
		t();
		let n = new ResizeObserver(t);
		return n.observe(e), () => n.disconnect();
	}, []);
	let d = e === "desktop" ? Math.max(s.width, i) : parseFloat(u[e]), f = s.width ? Math.min(1, s.width / d) : 1;
	return /* @__PURE__ */ c("div", {
		ref: o,
		className: "relative min-h-0 flex-1",
		children: s.width > 0 && a({
			position: "absolute",
			top: 0,
			left: Math.max(0, (s.width - d * f) / 2),
			width: d,
			height: s.height / f,
			transform: f < 1 ? `scale(${f})` : void 0,
			transformOrigin: "top left"
		})
	});
}
var p = "cms-styling-draft";
function m(e, t, n, r) {
	if (!e?.head) return;
	let i = e.documentElement;
	if (r ? (i.dataset.theme !== r && (i.dataset.theme = r), i.style.colorScheme = r) : i.style.colorScheme && (delete i.dataset.theme, i.style.colorScheme = ""), !t.compiler || !t.source) return;
	let a = n.replace(/[^/-]*$/, ""), o = [...e.querySelectorAll("link[rel=\"stylesheet\"]")].filter((e) => a !== "" && (e.getAttribute("href") ?? "").startsWith(a)), s = new Set(t.source.candidates);
	for (let t of e.querySelectorAll("[class]")) for (let e of t.classList) s.add(e);
	let c;
	try {
		c = t.source.faces + t.compiler.build([...s]);
	} catch (e) {
		console.error(e);
		return;
	}
	let l = e.getElementById(p);
	l || (l = e.createElement("style"), l.id = p, o[0] ? o[0].after(l) : e.head.appendChild(l)), l.textContent !== c && (l.textContent = c);
	for (let e of o) e.disabled = !0;
}
var h = "border-0 bg-bg md:rounded-md md:shadow-sheet";
function g({ frame: n, compile: a, published: o, viewport: s, desktop: u, mode: d }) {
	let [p, g] = r(0);
	return t(() => m(n.current?.contentDocument, a, o, d), [
		n,
		a,
		o,
		d,
		p
	]), /* @__PURE__ */ l("div", {
		className: "relative flex min-h-0 flex-1 flex-col md:p-4",
		children: [/* @__PURE__ */ c(f, {
			viewport: s,
			desktop: u,
			children: (t) => /* @__PURE__ */ c("iframe", {
				ref: n,
				src: "/",
				title: e("Site Preview"),
				className: h,
				style: t,
				onLoad: () => g((e) => e + 1)
			})
		}), a.problem && /* @__PURE__ */ c("div", {
			className: "absolute inset-x-3 top-3 rounded-lg bg-bg shadow-raise",
			children: /* @__PURE__ */ c(i, {
				tone: "warning",
				title: e("Tailwind can’t read the stylesheet"),
				children: a.problem
			})
		})]
	});
}
export { d as i, g as n, u as r, h as t };
