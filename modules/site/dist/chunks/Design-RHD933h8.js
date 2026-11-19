import { a as e, c as t, d as n, l as r, n as i, s as a, u as o } from "./fields-DCCGjhjk.js";
import { CmsError as s, can as c, invalidate as l, navigate as u, run as d, t as f, useAbility as p } from "@letterncms/sdk";
import { useEffect as m, useLayoutEffect as h, useMemo as g, useRef as _, useState as v } from "react";
import { Button as y, EmptyState as b, Fields as ee, Icon as x, IconButton as te, Menu as ne, NEW_COLOR as re, NoMatches as ie, Notice as ae, Popover as oe, Pressable as se, QueryError as ce, SaveBar as le, Section as S, Segmented as ue, SettingsPanel as de, SortableTree as fe, Spinner as pe, Tooltip as C, Topbar as me, UndoRedo as he, VersionsButton as ge, cn as w, confirm as _e, copyText as ve, deviceWidths as ye, prompt as T, toast as E, useTheme as be, useUndo as xe } from "@letterncms/ui";
import { ARTICLE as D, ColorPicker as Se, ELEMENTS as Ce, FORM as O, ID_STYLE as k, InspectorSection as we, MORE_ELEMENTS as Te, PanelFields as Ee, SCHEME as De, SPACING_STEPS as Oe, STYLE_GROUPS as A, SchemeTile as ke, Specimen as Ae, StyleBar as je, StylePanels as j, Stylesheet as Me, StylingProvider as Ne, Swatch as Pe, lightDark as M, loadCompiler as N, loadEngine as Fe, loadTailwindTheme as Ie, parseClass as Le, schemesOf as Re, screenFor as ze, shownInState as Be, styleApi as Ve, styleSample as He, themeDefaults as Ue, useSpecimenSheet as We, useStyling as P, withVariants as F } from "@letterncms/blocks";
import { Fragment as I, jsx as L, jsxs as R } from "react/jsx-runtime";
// admin/src/parts.tsx
var Ge = (e) => {
	let t = e && typeof e == "object" ? e : {};
	return {
		order: Array.isArray(t.order) ? t.order : [],
		groups: t.groups && !Array.isArray(t.groups) ? t.groups : {}
	};
}, Ke = (e, t) => e.variables().filter((e) => e.name === t || e.name.startsWith(`${t}--`)).map((e) => e.name);
function z(e, ...t) {
	return t.some((t) => [.../* @__PURE__ */ new Set([...Ke(e.sheet, t), ...Ke(e.saved, t)])].some((t) => (e.sheet.variable(t) ?? null) !== (e.saved.variable(t) ?? null)));
}
function B(e, ...t) {
	e.change((n) => t.flatMap((t) => [.../* @__PURE__ */ new Set([...Ke(n, t), ...Ke(e.saved, t)])]).reduce((t, n) => t.setVariable(n, e.saved.variable(n) ?? null), n));
}
function V(e, { copy: t, revert: n, extra: r = [], own: i = [] }) {
	return [
		[...t ? [{
			label: f("Copy Name"),
			icon: "copy",
			onSelect: () => void ve(t, { copied: f("Copied {reference}", { reference: t }) })
		}] : [], ...!e.readOnly && n !== void 0 ? [{
			label: f("Revert"),
			icon: "undo",
			disabled: !n,
			onSelect: () => n?.()
		}] : []],
		e.readOnly ? [] : r,
		e.readOnly ? [] : i
	].filter((e) => e.length > 0).flatMap((e, t) => t === 0 ? e : [{
		separator: !0,
		label: ""
	}, ...e]);
}
var qe = ({ items: e }) => e.length > 0 ? /* @__PURE__ */ L(ne, {
	trigger: /* @__PURE__ */ L(te, {
		icon: "more",
		label: f("Actions"),
		size: "xs",
		className: "cms-reveal shrink-0"
	}),
	items: e
}) : /* @__PURE__ */ L(Ye, {}), Je = "cms-reveal-row", Ye = () => /* @__PURE__ */ L("span", { className: "size-6 shrink-0" }), Xe = ({ on: e }) => e ? /* @__PURE__ */ L("span", {
	role: "img",
	"aria-label": f("Unsaved changes"),
	className: "size-1.5 shrink-0 rounded-full bg-focus"
}) : null, Ze = ({ on: e, label: t }) => e ? /* @__PURE__ */ L(C, {
	content: t ?? f("Built In"),
	children: /* @__PURE__ */ L("span", {
		role: "img",
		"aria-label": t ?? f("Built In"),
		className: "pointer-events-auto relative grid shrink-0 place-items-center text-faint",
		children: /* @__PURE__ */ L(x, {
			name: "lock",
			size: 12
		})
	})
}) : null, Qe = ({ children: e, locked: t, changed: n, className: r }) => /* @__PURE__ */ R("span", {
	className: w("flex min-w-0 items-center gap-1.5 text-sm text-text", r),
	children: [
		/* @__PURE__ */ L("span", {
			className: "truncate",
			children: e
		}),
		/* @__PURE__ */ L(Ze, { on: !!t }),
		/* @__PURE__ */ L(Xe, { on: !!n })
	]
});
function H({ title: e, onAdd: t, addLabel: n, action: r, below: i, plain: a, children: o }) {
	let s = t && n && /* @__PURE__ */ L(C, {
		content: n,
		children: /* @__PURE__ */ L(te, {
			icon: "plus",
			label: n,
			title: void 0,
			size: "xs",
			onClick: t
		})
	});
	return /* @__PURE__ */ R(S, {
		className: "mb-7",
		title: e,
		actions: e && (r || s) ? /* @__PURE__ */ R("span", {
			className: "flex items-center gap-2 pr-4 sm:pr-5",
			children: [r, s]
		}) : void 0,
		children: [
			a ? o : /* @__PURE__ */ L(de, {
				className: "overflow-hidden",
				children: o
			}),
			!e && (r || s) && /* @__PURE__ */ L("div", {
				className: "flex h-9 items-center",
				children: r ?? /* @__PURE__ */ L(y, {
					variant: "ghost",
					size: "xs",
					icon: "plus",
					onClick: t,
					className: "-ml-1.5 !px-1.5 !font-normal !text-muted hover:!text-ink",
					children: n
				})
			}),
			i && /* @__PURE__ */ L("div", {
				className: "flex h-9 items-center",
				children: i
			})
		]
	});
}
function U({ handle: e, label: t, value: n, onChange: r, field: i, disabled: a, className: o }) {
	return /* @__PURE__ */ L(ee, {
		bare: !0,
		className: w("flex min-w-0 flex-1", o),
		disabled: a,
		fields: [{
			handle: e,
			type: "text",
			label: t,
			size: "sm",
			mono: !0,
			...i
		}],
		values: { [e]: n ?? null },
		onChange: (e, t) => r(t == null || t === "" ? null : String(t))
	});
}
function W({ name: e, sample: t, after: n, below: r, wide: i, locked: a, changed: o, menu: s, children: c }) {
	return /* @__PURE__ */ R("div", {
		className: Je,
		children: [/* @__PURE__ */ R("div", {
			className: "flex min-h-12 items-center gap-2 py-2",
			children: [
				t !== void 0 && /* @__PURE__ */ L("span", {
					className: "grid w-7 shrink-0 place-items-center",
					children: t
				}),
				/* @__PURE__ */ L(Qe, {
					locked: a,
					changed: o,
					className: i ? "flex-1" : t === void 0 ? "w-[120px] shrink-0 max-sm:w-20" : "w-[84px] shrink-0 max-sm:w-20",
					children: e
				}),
				i ? c : /* @__PURE__ */ L("div", {
					className: "flex w-56 min-w-0 shrink gap-1 max-lg:w-48 max-sm:w-auto max-sm:flex-1",
					children: c
				}),
				!i && /* @__PURE__ */ L("span", {
					className: "flex min-w-0 flex-1 items-center max-sm:hidden",
					children: n
				}),
				/* @__PURE__ */ L(qe, { items: s })
			]
		}), r]
	});
}
function $e({ label: e, changed: t, menu: n, children: r }) {
	return /* @__PURE__ */ R("div", {
		className: w(Je, "flex min-h-12 items-center gap-2 py-2"),
		children: [
			/* @__PURE__ */ L(Qe, {
				changed: t,
				className: "w-[120px] shrink-0 max-sm:w-20",
				children: e
			}),
			/* @__PURE__ */ L("div", {
				className: "flex w-56 min-w-0 shrink items-center max-lg:w-48 max-sm:w-auto max-sm:flex-1",
				children: r
			}),
			/* @__PURE__ */ L("span", { className: "min-w-0 flex-1 max-sm:hidden" }),
			/* @__PURE__ */ L(qe, { items: n })
		]
	});
}
function et({ handle: e, label: t, onOpen: n, detail: r, locked: i, changed: a, menu: o = [], heading: s }) {
	return /* @__PURE__ */ R("div", {
		className: w(Je, "relative flex min-h-12 items-center gap-2 py-2 pr-4 sm:pr-5", e ? "pl-1" : "pl-4 sm:pl-5", n && "transition-colors duration-base hover:bg-hover"),
		children: [
			n && /* @__PURE__ */ L(se, {
				inset: !0,
				onClick: n,
				"aria-label": t,
				className: "absolute inset-0"
			}),
			e && /* @__PURE__ */ L("span", {
				className: "cms-reveal relative flex",
				children: e
			}),
			/* @__PURE__ */ L(Qe, {
				locked: i,
				changed: a,
				className: w("pointer-events-none flex-1", s && "font-semibold text-ink"),
				children: t
			}),
			r !== void 0 && /* @__PURE__ */ L("span", {
				className: "pointer-events-none shrink-0 text-xs tabular-nums text-muted",
				children: r
			}),
			/* @__PURE__ */ L("span", {
				className: "relative flex",
				children: /* @__PURE__ */ L(qe, { items: o })
			}),
			n ? /* @__PURE__ */ L(x, {
				name: "chevron-right",
				size: 14,
				className: "pointer-events-none shrink-0 text-faint"
			}) : /* @__PURE__ */ L("span", { className: "size-3.5 shrink-0" })
		]
	});
}
// admin/src/preview.tsx
var tt = {
	desktop: "100%",
	tablet: `${ye.tablet}px`,
	phone: `${ye.phone}px`
};
function nt(e, t) {
	let [n, r] = v({
		source: void 0,
		compiler: null,
		problem: null
	}), i = _({
		base: e,
		css: t
	});
	i.current = {
		base: e,
		css: t
	};
	let a = _(!1), o = _({}), s = _(!1), c = _(!0);
	m(() => (c.current = !0, () => {
		c.current = !1;
	}), []);
	let l = !!n.source;
	return m(() => {
		if (!e || t === void 0) return;
		let n = async () => {
			if (a.current = !0, !s.current) {
				s.current = !0;
				try {
					for (; a.current && c.current;) {
						a.current = !1;
						let e = i.current;
						if (!e.base || e.css === void 0) break;
						if (o.current.base === e.base && o.current.css === e.css) continue;
						o.current = e;
						let t = {
							css: e.css,
							files: e.base.files
						};
						try {
							let n = await N(t);
							if (n.build(e.base.candidates), !await Fe(t)) throw Error(f("Tailwind could not read the stylesheet."));
							c.current && r({
								source: {
									...e.base,
									css: e.css
								},
								compiler: n,
								problem: null
							});
						} catch (e) {
							c.current && r((t) => ({
								...t,
								problem: e instanceof Error ? e.message : String(e)
							}));
						}
					}
				} finally {
					s.current = !1;
				}
			}
		}, u = setTimeout(() => void n(), l ? 150 : 0);
		return () => clearTimeout(u);
	}, [
		e,
		t,
		l
	]), n;
}
function rt({ viewport: e, desktop: t, children: n }) {
	let r = _(null), [i, a] = v({
		width: 0,
		height: 0
	});
	m(() => {
		let e = r.current;
		if (!e) return;
		let t = () => a({
			width: e.clientWidth,
			height: e.clientHeight
		});
		t();
		let n = new ResizeObserver(t);
		return n.observe(e), () => n.disconnect();
	}, []);
	let o = e === "desktop" ? Math.max(i.width, t) : parseFloat(tt[e]), s = i.width ? Math.min(1, i.width / o) : 1;
	return /* @__PURE__ */ L("div", {
		ref: r,
		className: "relative min-h-0 flex-1",
		children: i.width > 0 && n({
			position: "absolute",
			top: 0,
			left: Math.max(0, (i.width - o * s) / 2),
			width: o,
			height: i.height / s,
			transform: s < 1 ? `scale(${s})` : void 0,
			transformOrigin: "top left"
		})
	});
}
var it = "cms-styling-draft";
function at(e, t, n, r) {
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
	let l = e.getElementById(it);
	l || (l = e.createElement("style"), l.id = it, o[0] ? o[0].after(l) : e.head.appendChild(l)), l.textContent !== c && (l.textContent = c);
	for (let e of o) e.disabled = !0;
}
var ot = "border-0 bg-bg md:rounded-md md:shadow-sheet";
function st({ frame: e, compile: t, published: n, viewport: r, desktop: i, mode: a }) {
	let [o, s] = v(0);
	return m(() => at(e.current?.contentDocument, t, n, a), [
		e,
		t,
		n,
		a,
		o
	]), /* @__PURE__ */ R("div", {
		className: "relative flex min-h-0 flex-1 flex-col md:p-4",
		children: [/* @__PURE__ */ L(rt, {
			viewport: r,
			desktop: i,
			children: (t) => /* @__PURE__ */ L("iframe", {
				ref: e,
				src: "/",
				title: f("Site Preview"),
				className: ot,
				style: t,
				onLoad: () => s((e) => e + 1)
			})
		}), t.problem && /* @__PURE__ */ L("div", {
			className: "absolute inset-x-3 top-3 rounded-lg bg-bg shadow-raise",
			children: /* @__PURE__ */ L(ae, {
				tone: "warning",
				title: f("Tailwind can’t read the stylesheet"),
				children: t.problem
			})
		})]
	});
}
// admin/src/styles/arrangement.ts
var ct = (e, t) => [...t.filter((t) => e.includes(t)), ...e.filter((e) => !t.includes(e))];
function lt(e, t) {
	let n = /* @__PURE__ */ new Set(), r = (e) => e.flatMap((e) => typeof e == "string" ? !t.includes(e) || n.has(e) ? [] : (n.add(e), [e]) : [{
		name: e.name,
		items: r(e.items)
	}]);
	return [...r(e), ...t.filter((e) => !n.has(e))];
}
var ut = (e, t) => e.flatMap((e) => typeof e == "string" ? e === t ? [] : [e] : [{
	name: e.name,
	items: ut(e.items, t)
}]), dt = (e, t, n = null) => {
	for (let r of e) {
		if (r === t) return n;
		if (typeof r != "string") {
			let e = dt(r.items, t, r.name);
			if (e) return e;
		}
	}
	return null;
}, ft = (e) => e.flatMap((e) => typeof e == "string" ? [] : [e.name, ...ft(e.items)]), pt = (e) => (e.children ?? []).reduce((e, t) => e + (t.kind === "group" ? pt(t) : 1), 0);
function mt(e, t, n) {
	return e.flatMap((e) => {
		if (typeof e != "string") return [{
			id: `group:${e.name}`,
			kind: "group",
			label: e.name,
			menu: n(e.name),
			children: mt(e.items, t, n)
		}];
		let r = t(e);
		return r ? [r] : [];
	});
}
var ht = (e) => e.map((e) => e.kind === "group" ? {
	name: e.label,
	items: ht(e.children ?? [])
} : e.id.slice(5));
function gt(e, t, n) {
	return e.flatMap((e) => typeof e == "string" ? [e] : e.name === t ? n ? [n(e)] : e.items : [{
		name: e.name,
		items: gt(e.items, t, n)
	}]);
}
function _t(e, t, n) {
	let r = (e) => e.map((e) => typeof e == "string" ? e === t ? n : e : {
		name: e.name,
		items: r(e.items)
	});
	return {
		...e,
		groups: Object.fromEntries(Object.entries(e.groups).map(([e, t]) => [e, r(t)]))
	};
}
function vt(e, t, n) {
	let r = Object.fromEntries(Object.entries(e.groups).flatMap(([e, r]) => e === t ? n ? [[n, r]] : [] : [[e, r]]));
	return {
		order: e.order.flatMap((e) => e === t ? n ? [n] : [] : [e]),
		groups: r
	};
}
// admin/src/styles/catalog.tsx
var yt = (...e) => e.filter(Boolean).join(" "), bt = [
	"typography",
	"spacing",
	"fill",
	"border",
	"effects",
	"transition"
], xt = [
	"size",
	"spacing",
	"typography",
	"fill",
	"border",
	"effects",
	"transition"
], St = [
	"fill",
	"border",
	"effects",
	"transition"
], Ct = (e) => (t) => ({
	...e,
	className: yt(e.className, ...t.shown) || void 0
}), G = (e) => e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"), K = (e) => ({
	tag: "div",
	text: "",
	markup: e
}), wt = () => {
	let e = (e, t, n, r) => ({
		id: e,
		kind: "element",
		selector: e,
		layer: "base",
		label: t,
		sample: Ct(n),
		groups: r,
		given: !0
	}), t = (t, n, r) => e(t, n, {
		tag: t,
		text: n
	}, r);
	return [
		e("body", f("Page"), {
			tag: "p",
			text: f("Page")
		}, ["typography", "fill"]),
		t("h1", f("Heading 1")),
		t("h2", f("Heading 2")),
		t("h3", f("Heading 3")),
		t("h4", f("Heading 4")),
		t("h5", f("Heading 5")),
		t("h6", f("Heading 6")),
		t("p", f("Paragraph")),
		e("a", f("Link"), {
			tag: "a",
			text: f("Link"),
			attributes: { href: "#" }
		}),
		t("strong", f("Bold")),
		t("small", f("Small")),
		t("blockquote", f("Quote")),
		t("code", f("Code")),
		t("figcaption", f("Caption")),
		e("hr", f("Divider"), {
			tag: "hr",
			text: "",
			className: "w-40"
		}, [
			"border",
			"spacing",
			"size"
		]),
		{
			id: "selection",
			kind: "element",
			given: !0,
			selector: "::selection",
			layer: "base",
			label: f("Selection"),
			groups: ["typography", "fill"],
			sample: (e) => ({
				tag: "span",
				text: f("Selection"),
				className: yt(...e.classes, ...e.shown)
			})
		},
		{
			id: "focus",
			kind: "element",
			given: !0,
			selector: ":focus-visible",
			layer: "base",
			label: f("Focus Ring"),
			groups: ["border", "effects"],
			sample: (e) => ({
				tag: "span",
				text: f("Focus Ring"),
				className: yt("inline-block rounded-sm px-2", ...e.classes, ...e.shown)
			})
		}
	];
}, Tt = "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 160 100%22%3E%3Crect width=%22160%22 height=%22100%22 fill=%22%23a3a3a3%22/%3E%3Cpath d=%22M0 100 55 45l35 35 22-22 48 42z%22 fill=%22%23737373%22/%3E%3C/svg%3E", Et = () => {
	let e = (e) => {
		let t = (t, n) => ({
			label: t,
			node: {
				tag: e,
				text: t
			},
			groups: n
		});
		switch (e) {
			case "em": return t(f("Emphasis"));
			case "mark": return t(f("Highlight"));
			case "del": return t(f("Deleted Text"));
			case "sup": return t(f("Superscript"));
			case "sub": return t(f("Subscript"));
			case "abbr": return t(f("Abbreviation"));
			case "cite": return t(f("Citation"));
			case "kbd": return t(f("Keyboard Key"));
			case "pre": return t(f("Code Block"));
			case "address": return t(f("Address"));
			case "summary": return t(f("Summary"));
			case "details": return {
				label: f("Details"),
				node: K(`<details open><summary>${G(f("Summary"))}</summary>${G(f("Details"))}</details>`)
			};
			case "ul": return {
				label: f("Bulleted List"),
				node: K(`<ul><li>${G(f("List Item"))}</li><li>${G(f("List Item"))}</li></ul>`)
			};
			case "ol": return {
				label: f("Numbered List"),
				node: K(`<ol><li>${G(f("List Item"))}</li><li>${G(f("List Item"))}</li></ol>`)
			};
			case "li": return {
				label: f("List Item"),
				node: K(`<ul><li>${G(f("List Item"))}</li></ul>`)
			};
			case "dl": return {
				label: f("Description List"),
				node: K(`<dl><dt>${G(f("Term"))}</dt><dd>${G(f("Description"))}</dd></dl>`)
			};
			case "dt": return {
				label: f("Term"),
				node: K(`<dl><dt>${G(f("Term"))}</dt></dl>`)
			};
			case "dd": return {
				label: f("Description"),
				node: K(`<dl><dd>${G(f("Description"))}</dd></dl>`)
			};
			case "table": return {
				label: f("Table"),
				node: K(Dt()),
				groups: [
					"spacing",
					"typography",
					"fill",
					"border",
					"effects"
				]
			};
			case "caption": return {
				label: f("Table Caption"),
				node: K(Dt())
			};
			case "th": return {
				label: f("Table Header"),
				node: K(Dt())
			};
			case "td": return {
				label: f("Table Cell"),
				node: K(Dt())
			};
			case "img": return {
				label: f("Image"),
				node: {
					tag: "img",
					text: "",
					attributes: {
						src: Tt,
						alt: "",
						width: "160",
						height: "100"
					}
				},
				groups: [
					"size",
					"border",
					"effects"
				]
			};
			case "figure": return {
				label: f("Figure"),
				node: K(`<figure><img src="${Tt}" alt="" width="160" height="100" style="display:block"><figcaption>${G(f("Caption"))}</figcaption></figure>`),
				groups: [
					"spacing",
					"fill",
					"border",
					"effects"
				]
			};
		}
	};
	return Te.map((t) => {
		let { label: n, node: r, groups: i } = e(t);
		return {
			id: t,
			kind: "element",
			selector: t,
			layer: "base",
			label: n,
			groups: i,
			sample: r.markup ? () => r : Ct(r)
		};
	});
}, Dt = () => `<table><caption>${G(f("Table Caption"))}</caption><thead><tr><th>${G(f("Table Header"))}</th><th>${G(f("Table Header"))}</th></tr></thead><tbody><tr><td>${G(f("Table Cell"))}</td><td>${G(f("Table Cell"))}</td></tr></tbody></table>`, q = (e) => () => K(`<div class="cms-prose">${e}</div>`), Ot = (e, t) => ({
	handle: e,
	property: e,
	label: t,
	field: {
		component: "blocks-value",
		unit: "em",
		units: [
			"em",
			"rem",
			"px"
		],
		min: 0,
		step: .125
	}
}), kt = () => [
	{
		id: "article",
		kind: "part",
		given: !0,
		selector: D.spacing,
		layer: "components",
		label: f("Article"),
		sample: q(`<h2 style="margin:0">${G(f("Heading 2"))}</h2><p>${G(f("Paragraph"))}</p><ul><li>${G(f("List Item"))}</li><li>${G(f("List Item"))}</li></ul>`),
		parts: [{
			title: f("Text Spacing"),
			values: [
				Ot("--prose-blocks", f("Blocks")),
				Ot("--prose-headings", f("Above Headings")),
				Ot("--prose-after-headings", f("Below Headings")),
				Ot("--prose-items", f("List Items"))
			]
		}]
	},
	{
		id: "h2",
		kind: "part",
		given: !0,
		selector: D.h2,
		layer: "components",
		label: f("Heading 2"),
		sample: q(`<h2 style="margin:0">${G(f("Heading 2"))}</h2>`)
	},
	{
		id: "h3",
		kind: "part",
		given: !0,
		selector: D.h3,
		layer: "components",
		label: f("Heading 3"),
		sample: q(`<h3 style="margin:0">${G(f("Heading 3"))}</h3>`)
	},
	{
		id: "p",
		kind: "part",
		given: !0,
		selector: D.p,
		layer: "components",
		label: f("Paragraph"),
		sample: q(`<p style="margin:0">${G(f("Paragraph"))}</p>`)
	},
	{
		id: "li",
		kind: "part",
		given: !0,
		selector: D.li,
		layer: "components",
		label: f("List Item"),
		sample: q(`<ul><li>${G(f("List Item"))}</li></ul>`)
	},
	{
		id: "blockquote",
		kind: "part",
		given: !0,
		selector: D.blockquote,
		layer: "components",
		label: f("Quote"),
		sample: q(`<blockquote style="margin:0">${G(f("Quote"))}</blockquote>`)
	},
	{
		id: "figure",
		kind: "part",
		given: !0,
		selector: D.figure,
		layer: "components",
		label: f("Figure"),
		sample: q(`<figure style="margin:0">${G(f("Figure"))}</figure>`),
		groups: [
			"spacing",
			"border",
			"effects"
		]
	},
	{
		id: "a",
		kind: "part",
		given: !0,
		selector: D.a,
		layer: "components",
		label: f("Link"),
		sample: q(`<p><a href="#">${G(f("Link"))}</a></p>`)
	}
];
function At(e, t = !1) {
	let n = e.flatMap((e) => e === "hover" ? ["hover"] : e === "focus-visible" || e === "focus" ? ["focus"] : e === "active" ? ["hover"] : []);
	return yt(n.length > 0 && `data-cms-state="${n.join(" ")}"`, e.includes("aria-invalid") && "aria-invalid=\"true\"", e.includes("disabled") && "disabled", (t || e.includes("checked")) && "checked", "tabindex=\"-1\"");
}
var jt = (e) => K(`<div class="cms-form" style="white-space:normal">${e}</div>`), Mt = (e) => K(`<div style="display:grid;gap:.75rem;white-space:normal">${e}</div>`), J = (e, t) => t ? e.shown.join(" ") : "", Nt = (e, t) => {
	let n = (n, r, i, a, o = !1) => `<div class="cms-field"><label class="cms-label ${t === "label" ? J(e, !0) : ""}">${G(n)}</label><input class="cms-input" placeholder="${G(i)}" value="${G(r)}" ${o ? "aria-invalid=\"true\"" : ""} tabindex="-1">${a}</div>`, r = (n) => t === "help" ? `<p class="cms-help ${J(e, !0)}">${G(n)}</p>` : "", i = t === "error" ? `<p class="cms-msg ${J(e, !0)}">${G(f("Enter an email address."))}</p>` : "";
	return jt(n(f("Name"), "", f("Your name"), r(f("As it appears on your order."))) + n(f("Email"), t === "error" ? "" : "ada@example.com", "ada@example.com", r(f("We never share it.")) + i, t === "error"));
}, Y = (e, t, n = ["rem", "px"]) => ({
	handle: e,
	property: e,
	label: t,
	field: {
		component: "blocks-value",
		unit: n[0],
		units: n,
		min: 0,
		step: n[0] === "px" ? 1 : .125
	}
}), Pt = (e, t) => ({
	handle: e,
	property: e,
	label: t,
	field: {
		type: "color",
		component: "blocks-color"
	}
}), Ft = ["label-beside", "label-inside"], It = (e) => e.elements("components").find((e) => e.name === O.field)?.classes.find((e) => Ft.includes(e)) ?? "above", Lt = (e, t) => {
	let n = e.elements("components").find((e) => e.name === O.field)?.classes.filter((e) => !Ft.includes(e)) ?? [];
	return e.setElement(O.field, t && t !== "above" ? [...n, String(t)] : n, "components");
}, Rt = () => {
	let e = (e, t, n, r, i) => ({
		id: e,
		kind: "part",
		given: !0,
		selector: t,
		layer: "components",
		label: n,
		sample: r,
		groups: xt,
		states: [
			"aria-invalid",
			"disabled",
			"placeholder"
		],
		parts: i
	}), t = (e, t, n, r, i) => ({
		id: e,
		kind: "part",
		given: !0,
		selector: t,
		layer: "components",
		label: n,
		groups: St,
		states: [
			"checked",
			"aria-invalid",
			"disabled"
		],
		parts: i,
		sample: (e) => K(`<div style="display:grid;grid-template-columns:repeat(${r.length},auto);gap:.75rem 1.5rem;justify-content:center;white-space:nowrap">${[!1, !0].map((t) => r.map((n) => `<label class="cms-choice">${n === "radio" ? `<input type="radio" class="cms-radio ${J(e, !0)}" ${At(e.state, t)}>` : `<input type="checkbox"${n === "switch" ? " role=\"switch\"" : ""} class="cms-${n} ${J(e, !0)}" ${At(e.state, t)}>`} ${G(t || e.state.includes("checked") ? f("On") : f("Off"))}</label>`).join("")).join("")}</div>`)
	}), n = (e, t, n, r = "") => `<input class="cms-input ${J(e, t)}" placeholder="${G(n)}" value="${G(r)}" ${At(e.state)}>`, r = (e, t) => `<textarea class="cms-input ${J(e, t)}" rows="3" placeholder="${G(f("Text Area"))}" ${At(e.state)}></textarea>`, i = (e, t) => `<select class="cms-input ${J(e, t)}" ${At(e.state)}><option>${G(f("Dropdown"))}</option></select>`;
	return [
		e("fields", O.fields, f("All Fields"), (e) => Mt(n(e, !0, f("Text Field")) + i(e, !0) + r(e, !0))),
		e("text", O.text, f("Text Field"), (e) => Mt(n(e, !0, f("Text Field")) + n(e, !0, f("Text Field"), "ada@example.com"))),
		e("textarea", O.textarea, f("Text Area"), (e) => Mt(r(e, !0))),
		e("select", O.select, f("Dropdown"), (e) => Mt(i(e, !0)), [{
			title: f("Arrow"),
			values: [Pt("--field-select-arrow-color", f("Color")), Y("--field-select-arrow-size", f("Size"))]
		}]),
		t("choices", O.choices, f("All Choices"), [
			"check",
			"radio",
			"switch"
		]),
		t("checkbox", O.checkbox, f("Checkbox"), ["check"], [{
			title: f("Box"),
			values: [Y("--field-checkbox-size", f("Size"))]
		}, {
			title: f("Check Mark"),
			values: [Pt("--field-checkbox-mark-color", f("Color")), {
				handle: "--field-checkbox-mark-size",
				property: "--field-checkbox-mark-size",
				label: f("Size"),
				field: {
					component: "blocks-value",
					unit: "%",
					units: ["%"],
					min: 0,
					max: 100,
					step: 5
				}
			}]
		}]),
		t("radio", O.radio, f("Radio Button"), ["radio"], [{
			title: f("Circle"),
			values: [Y("--field-radio-size", f("Size"))]
		}, {
			title: f("Dot"),
			values: [Pt("--field-radio-on-dot", f("Color")), {
				handle: "--field-radio-dot-size",
				property: "--field-radio-dot-size",
				label: f("Size"),
				field: {
					component: "blocks-value",
					unit: "%",
					units: ["%"],
					min: 0,
					max: 100,
					step: 5
				}
			}]
		}]),
		t("switch", O.switch, f("Switch"), ["switch"], [{
			title: f("Track"),
			values: [
				Y("--field-switch-width", f("Width")),
				Y("--field-switch-height", f("Height")),
				Y("--field-switch-border-width", f("Border"), ["px", "rem"])
			]
		}, {
			title: f("Knob"),
			values: [
				Pt("--field-switch-knob", f("Color")),
				Pt("--field-switch-knob-on", f("Color When On")),
				Y("--field-switch-inset", f("Inset"), ["px", "rem"]),
				{
					handle: "--field-switch-knob-shadow",
					property: "--field-switch-knob-shadow",
					label: f("Shadow"),
					field: { component: "site-shadow" }
				}
			]
		}]),
		{
			id: "option",
			kind: "part",
			given: !0,
			selector: O.option,
			layer: "components",
			label: f("Option Text"),
			groups: bt,
			sample: (e) => K(`<div style="display:grid;gap:.75rem;white-space:nowrap"><label class="cms-choice ${J(e, !0)}"><input type="checkbox" class="cms-check" checked tabindex="-1"> ${G(f("Send me the newsletter"))}</label><label class="cms-choice ${J(e, !0)}"><input type="radio" class="cms-radio" tabindex="-1"> ${G(f("Not now"))}</label></div>`)
		},
		{
			id: "label",
			kind: "part",
			given: !0,
			selector: O.label,
			layer: "components",
			label: f("Label"),
			groups: bt,
			sample: (e) => Nt(e, "label"),
			parts: [{
				title: f("Layout"),
				values: [
					{
						handle: "position",
						label: f("Position"),
						field: {
							type: "select",
							display: "segmented",
							block: !0,
							options: [
								{
									value: "above",
									label: f("Above")
								},
								{
									value: "label-beside",
									label: f("Beside")
								},
								{
									value: "label-inside",
									label: f("Inside")
								}
							]
						},
						read: It,
						write: Lt
					},
					{
						...Y("--field-label-width", f("Label Width")),
						selector: O.field,
						field: {
							...Y("--field-label-width", "").field,
							if: { position: "label-beside" }
						}
					},
					{
						...Y("--field-spacing-label", f("Under Label")),
						selector: O.field
					},
					{
						...Y("--field-spacing-fields", f("Between Fields")),
						selector: O.form
					}
				]
			}]
		},
		{
			id: "help",
			kind: "part",
			given: !0,
			selector: O.help,
			layer: "components",
			label: f("Help Text"),
			groups: bt,
			sample: (e) => Nt(e, "help")
		},
		{
			id: "error",
			kind: "part",
			given: !0,
			selector: O.error,
			layer: "components",
			label: f("Error Message"),
			groups: bt,
			sample: (e) => Nt(e, "error")
		}
	];
}, zt = (e, t) => ({
	id: e,
	kind: "class",
	selector: e,
	layer: "base",
	label: e,
	sample: Ct(He(e)),
	groups: t
}), Bt = (e, t) => ({
	id: e,
	kind: "id",
	selector: e,
	layer: "components",
	label: e,
	sample: Ct({
		tag: "p",
		text: e.slice(1),
		attributes: { id: e.slice(1) }
	}),
	groups: t
}), Vt = [
	"elements",
	"buttons",
	"forms",
	"articles"
], Ht = [
	"elements",
	"forms",
	"articles"
], Ut = "ungrouped", Wt = [...Vt, Ut], Gt = (e) => ({
	elements: f("Elements"),
	buttons: f("Buttons"),
	forms: f("Forms"),
	articles: f("Articles")
})[e], Kt = (e) => e.replace(/^!|!$/g, ""), qt = (e) => String(e ?? "").trim().toLowerCase().replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/^-+|-+$/g, ""), Jt = (e) => e.startsWith("btn-"), Yt = (e) => e.utilities().filter((e) => /^[a-z][\w-]*$/.test(e.name) && !e.name.startsWith("scheme-")), Xt = (e) => e && Ht.includes(e.toLowerCase()) ? e.toLowerCase() : null;
function Zt(e) {
	let t = [];
	for (let n of e.groups()) {
		if (Xt(n)) continue;
		let e = qt(n) || "group", r = e;
		for (let n = 2; Wt.includes(r) || t.some((e) => e.id === r); n++) r = `${e}-${n}`;
		t.push({
			id: r,
			name: n
		});
	}
	return t;
}
var Qt = (e, t, n) => Xt(t) ?? Zt(e).find((e) => e.name === t)?.id ?? n;
function $t(e) {
	let t = [
		...wt().map((e) => ({
			...e,
			home: "elements"
		})),
		...Rt().map((e) => ({
			...e,
			home: "forms"
		})),
		...kt().map((e) => ({
			...e,
			home: "articles"
		}))
	], n = Et(), r = e.elements("base").flatMap((t) => {
		let r = n.find((e) => e.selector === t.name);
		return r ? [{
			...r,
			home: Qt(e, t.group, "elements")
		}] : [];
	}), i = e.elements("components").filter((e) => k.test(e.name)).map((t) => ({
		...Bt(t.name, A),
		home: Qt(e, t.group, Ut)
	})), a = Yt(e).map((t) => ({
		...zt(t.name, A),
		home: Jt(t.name) ? "buttons" : Qt(e, t.group, Ut)
	}));
	return [
		...t,
		...r,
		...i,
		...a
	];
}
function en(e, t, n) {
	let r = $t(e);
	return r.find((e) => e.home === t && e.id === n) ?? r.find((e) => e.id === n && !e.given);
}
var tn = (e) => Et().filter((t) => !e.elements("base").some((e) => e.name === t.selector)), X = (e, t) => [
	"/design/styles",
	e,
	t
].filter(Boolean).map((e, t) => t === 0 ? e : encodeURIComponent(e)).join("/");
function nn(e, t) {
	return t === "ungrouped" ? f("Ungrouped") : Gt(t) ?? Zt(e).find((e) => e.id === t)?.name ?? null;
}
function rn(e, [t, n]) {
	if (!t) return null;
	let r = nn(e, t);
	if (!r) return null;
	if (!n) return [{
		label: f("Styles"),
		to: X()
	}, { label: r }];
	let i = en(e, t, n) ?? (t === "elements" ? Et().find((e) => e.id === n) : void 0);
	return i ? [
		{
			label: f("Styles"),
			to: X()
		},
		{
			label: r,
			to: X(t)
		},
		{ label: i.label }
	] : null;
}
var an = () => /* @__PURE__ */ new Set([
	...Ce,
	...Te,
	...wt().map((e) => e.id),
	...kt().map((e) => e.id),
	...Rt().map((e) => e.id)
]), on = (e, t) => (t.kind === "class" ? e.utilities().find((e) => e.name === t.selector)?.classes : e.elements(t.layer).find((e) => e.name === t.selector)?.classes) ?? [], sn = (e, t) => t.kind === "class" ? e.utilities().some((e) => e.name === t.selector) : e.elements(t.layer).some((e) => e.name === t.selector);
function cn(e, t, n) {
	if (t.kind !== "class") return e.setElement(t.selector, n, t.layer);
	let r = e.utilities().find((e) => e.name === t.selector)?.custom;
	return n.length > 0 || r ? e.setUtility(t.selector, n) : e.removeUtility(t.selector);
}
var ln = (e, t, n) => t.kind === "class" ? e.setUtilityGroup(t.selector, n) : e.setElementGroup(t.selector, n, t.layer), un = (e, t) => (t.kind === "class" ? Yt(e).find((e) => e.name === t.selector)?.group : e.elements(t.layer).find((e) => e.name === t.selector)?.group) ?? null, dn = (e, t) => t && !Xt(t) && !e.groups().includes(t) ? e.addGroup(t) : e, fn = (e, t) => t.kind === "class" ? e.removeUtility(t.selector) : e.removeElement(t.selector, t.layer);
function pn(e, t, n) {
	let r = (e) => {
		let { variants: r, utility: i } = Le(e);
		return Kt(i) === t ? F(r, i.replace(t, n)) : e;
	}, i = e.renameUtility(t, n);
	for (let e of i.utilities()) {
		let t = e.classes.map(r);
		t.some((t, n) => t !== e.classes[n]) && (i = i.setUtility(e.name, t));
	}
	for (let e of ["base", "components"]) for (let t of i.elements(e)) {
		let n = t.classes.map(r);
		n.some((e, n) => e !== t.classes[n]) && (i = i.setElement(t.name, n, e));
	}
	return i;
}
var mn = (e, t) => t.selector ?? e.selector;
function Z(e, t, n) {
	return n.read ? n.read(e) : e.property(mn(t, n), n.property, t.layer) ?? null;
}
function hn(e, t, n, r) {
	return n.write ? n.write(e, r) : e.setProperty(mn(t, n), n.property, r == null || r === "" ? null : String(r), t.layer);
}
var gn = (e, t, n, r) => r.property ? e.property(":root, [data-theme]", r.property, "base") ?? t.property(mn(n, r), r.property, n.layer) ?? t.property(":root, [data-theme]", r.property, "base") : void 0;
function _n(e, t) {
	return on(e.sheet, t).join(" ") !== on(e.saved, t).join(" ") || sn(e.sheet, t) !== sn(e.saved, t) || (t.parts ?? []).some((n) => n.values.some((n) => JSON.stringify(Z(e.sheet, t, n)) !== JSON.stringify(Z(e.saved, t, n))));
}
function vn(e, t) {
	e.change((n) => {
		let r = (t.parts ?? []).flatMap((e) => e.values);
		if (t.kind === "class") {
			let r = e.saved.utilities().find((e) => e.name === t.selector);
			return r ? n.setUtility(t.selector, r.classes) : n;
		}
		return sn(e.saved, t) ? r.reduce((n, r) => hn(n, t, r, Z(e.saved, t, r)), n.setElement(t.selector, on(e.saved, t), t.layer)) : r.reduce((n, r) => r.selector || r.write ? hn(n, t, r, Z(e.saved, t, r)) : n, n.removeElement(t.selector, t.layer));
	});
}
// admin/src/styles/StyleEditor.tsx
var yn = (e) => e.split(/\s+/).filter(Boolean), bn = (e) => e.elements().find((e) => e.name === "body")?.classes.join(" ") ?? "";
function xn({ edit: e, samples: t, style: n, menu: r }) {
	let i = P(), [a, o] = v([]), s = g(() => ze(t.device, 1280, i.breakpoints), [t.device, i.breakpoints]), c = on(e.sheet, n), l = Ve(i.engine, c, s, a, e.readOnly ? () => {} : (t) => e.change((e) => cn(e, n, t))), u = bn(e.sheet), d = Be(c, a), f = n.sample({
		state: a,
		shown: d,
		classes: c
	}), p = We(t.compiler, [
		...yn(u),
		...c.map((e) => Kt(Le(e).utility)),
		...c,
		...d,
		...yn(f.className ?? "")
	]);
	return /* @__PURE__ */ R("div", {
		className: "-mx-4 -mt-2",
		children: [
			/* @__PURE__ */ L("div", {
				className: "border-b border-border",
				children: /* @__PURE__ */ L(Ae, {
					sheet: p,
					node: f,
					page: u,
					mode: e.mode,
					align: "center",
					auto: !0,
					className: "min-h-32"
				})
			}),
			/* @__PURE__ */ L("div", {
				className: "border-b border-border",
				children: /* @__PURE__ */ L(je, {
					s: l,
					site: i.classes,
					source: i.source,
					disabled: e.readOnly,
					state: {
						classes: c,
						engine: i.engine,
						state: a,
						onState: o,
						primary: n.states
					},
					menu: r,
					saveAs: !1
				})
			}),
			/* @__PURE__ */ R("div", {
				inert: e.readOnly,
				children: [(n.parts ?? []).map((t) => /* @__PURE__ */ L(Sn, {
					edit: e,
					style: n,
					part: t
				}, t.title)), /* @__PURE__ */ L(j, {
					s: l,
					groups: n.groups ?? bt
				})]
			})
		]
	});
}
function Sn({ edit: e, style: t, part: n }) {
	let { source: r } = P(), i = g(() => new Me(r?.files.cms ?? ""), [r?.files.cms]), a = Object.fromEntries(n.values.map((n) => [n.handle, Z(e.sheet, t, n) ?? Cn(gn(e.sheet, i, t, n))])), o = (n) => JSON.stringify(Z(e.sheet, t, n)) !== JSON.stringify(Z(e.saved, t, n)), s = n.values.some((n) => n.read ? n.read(e.sheet) !== "above" : Z(e.sheet, t, n) !== null);
	return /* @__PURE__ */ L(we, {
		title: n.title,
		empty: !s,
		children: /* @__PURE__ */ L(Ee, {
			fields: n.values.map((n) => ({
				type: "text",
				size: "sm",
				placeholder: f("Default"),
				...n.field,
				handle: n.handle,
				label: n.label,
				status: o(n) ? "own" : void 0,
				reset: () => e.change((r) => hn(r, t, n, Z(e.saved, t, n)))
			})),
			values: a,
			onChange: (r, i) => {
				let a = n.values.find((e) => e.handle === r);
				a && e.change((e) => hn(e, t, a, i));
			}
		})
	});
}
var Cn = (e) => e && /^(var\(--(?!field-)[\w-]+\)|-?[\d.]+[a-z%]*|#[0-9a-f]{3,8}|[a-z-]+)$/i.test(e.trim()) ? e : null;
// admin/src/styles/Styles.tsx
async function wn(e, t, n, r = "") {
	let i = await T({
		title: t,
		fields: [{
			handle: "name",
			type: "text",
			label: f("Name"),
			placeholder: f("Headings"),
			required: !0,
			autofocus: !0
		}],
		values: { name: r },
		confirm: n
	}), a = String(i?.name ?? "").trim();
	return !a || a === r ? null : e.includes(a) ? (E.error(f("There is already a group “{name}”.", { name: a })), null) : a;
}
async function Tn(e, t, n, r = "") {
	let i = await T({
		title: t,
		fields: [{
			handle: "group",
			type: "text",
			label: f("Name"),
			placeholder: f("Cards"),
			required: !0,
			autofocus: !0
		}],
		values: { group: r },
		confirm: n
	}), a = String(i?.group ?? "").replace(/\*\/|\n/g, "").trim();
	return !a || a === r ? null : [...Vt, "ungrouped"].some((e) => e === qt(a) || (e === "ungrouped" ? f("Ungrouped") : Gt(e))?.toLowerCase() === a.toLowerCase()) ? (E.error(f("“{name}” is a group the site already has.", { name: a })), null) : e.groups().includes(a) ? (E.error(f("There is already a group “{name}”.", { name: a })), null) : a;
}
var En = (e) => ({
	handle: "group",
	type: "select",
	label: f("Group"),
	placeholder: f("No Group"),
	options: [...Ht.map((e) => ({
		value: e,
		label: Gt(e)
	})), ...e.map((e) => ({
		value: e.name,
		label: e.name
	}))]
});
function Dn(e, t) {
	return /^[a-z][a-z0-9-]*$/.test(e) ? !t || (E.error(f("There is already a style “{name}”.", { name: e })), !1) : (E.error(f("A name is lowercase letters, numbers and hyphens, and starts with a letter.")), !1);
}
function On({ edit: e, samples: t, path: n }) {
	let { engine: r } = P(), [i, a] = v(""), [o, s] = n, c = $t(e.sheet), l = Zt(e.sheet), d = (e) => u(e), p = o && s ? en(e.sheet, o, s) : void 0, h = !!p && p.home !== o;
	m(() => {
		h && p && u(X(p.home, p.id), { replace: !0 });
	}, [
		h,
		p?.home,
		p?.id
	]);
	let g = (e) => e && Ht.includes(e) ? e : l.find((t) => t.id === e)?.name ?? null, _ = (t) => e.sheet.utilities().some((e) => e.name === t) || !!r?.valid(t) || an().has(t), x = (t) => e.sheet.elements("components").some((e) => e.name === t), te = async (t) => {
		if (t === "buttons") return void ne();
		let n = tn(e.sheet), r = [
			{
				value: "class",
				label: f("Class")
			},
			...n.length ? [{
				value: "element",
				label: f("Element")
			}] : [],
			{
				value: "id",
				label: f("ID")
			}
		], i = await T({
			title: f("New Style"),
			fields: [
				{
					handle: "type",
					type: "select",
					display: "segmented",
					block: !0,
					label: f("Type"),
					options: r
				},
				{
					handle: "name",
					type: "text",
					label: f("Name"),
					placeholder: "card",
					autofocus: !0,
					if: { type: ["class", "id"] }
				},
				{
					handle: "element",
					type: "select",
					label: f("Element"),
					options: n.map((e) => ({
						value: e.id,
						label: e.label
					})),
					if: { type: "element" }
				},
				En(l)
			],
			values: {
				type: "class",
				name: "",
				element: n[0]?.id ?? null,
				group: g(t)
			},
			confirm: f("Create Style")
		});
		if (!i) return;
		let a = String(i.type ?? "class"), o = String(i.group ?? "") || null;
		if (a === "element") {
			let t = n.find((e) => e.id === i.element);
			return t ? (e.change((e) => e.addElement(t.selector, "base", o === "elements" ? null : o)), d(X("elements", t.id))) : void 0;
		}
		let s = qt(i.name);
		if (s) {
			if (a === "id") return Dn(s, x(`#${s}`)) ? (e.change((e) => e.addElement(`#${s}`, "components", o)), d(X(Ut, `#${s}`))) : void 0;
			Dn(s, _(s)) && (e.change((e) => e.setUtility(s, ["text-base"]).setUtilityGroup(s, o)), d(X(Ut, s)));
		}
	}, ne = async () => {
		let t = `btn-${qt((await T({
			title: f("New Style"),
			fields: [{
				handle: "name",
				type: "text",
				label: f("Name"),
				placeholder: "outline",
				required: !0,
				autofocus: !0
			}],
			values: { name: "" },
			confirm: f("Create Style")
		}))?.name)}`;
		if (t === "btn-" || !Dn(t, _(t))) return;
		let n = Yt(e.sheet).find((e) => Jt(e.name));
		e.change((e) => n ? e.duplicateUtility(n.name, t).setUtilityGroup(t, null) : e.setUtility(t, ["text-base"])), d(X("buttons", t));
	}, re = async (t) => {
		let n = t.kind === "id", r = Jt(t.selector) ? "btn-" : "", i = n ? t.selector.slice(1) : t.selector.slice(r.length), a = qt((await T({
			title: f("Rename “{name}”", { name: t.label }),
			fields: [{
				handle: "name",
				type: "text",
				label: f("Name"),
				required: !0,
				autofocus: !0
			}],
			values: { name: i },
			confirm: f("Rename")
		}))?.name);
		if (!a || a === i) return;
		let c = n ? `#${a}` : `${r}${a}`;
		Dn(a, n ? x(c) : _(c)) && (e.change((e) => n ? e.renameElement(t.selector, c, "components") : pn(e, t.selector, c)), e.arrange((e) => _t(e, t.id, c)), s === t.id && u(X(o, c), { replace: !0 }));
	}, ae = async (t) => {
		let n = t.kind === "id", r = Jt(t.selector) ? "btn-" : "", i = qt((await T({
			title: f("Duplicate “{name}”", { name: t.label }),
			fields: [{
				handle: "name",
				type: "text",
				label: f("Name"),
				required: !0,
				autofocus: !0
			}],
			values: { name: "" },
			confirm: f("Duplicate Style")
		}))?.name);
		if (!i) return;
		let a = n ? `#${i}` : `${r}${i}`;
		Dn(i, n ? x(a) : _(a)) && e.change((e) => n ? e.duplicateElement(t.selector, a, "components") : e.duplicateUtility(t.selector, a));
	}, oe = (t) => {
		let n = un(e.sheet, t);
		e.change((e) => dn(fn(e, t), n)), s === t.id && u(X(o));
	}, se = (t, n = []) => V(e, {
		extra: n,
		copy: t.kind === "class" || t.kind === "id" ? t.selector : void 0,
		revert: _n(e, t) && (t.kind !== "class" || sn(e.saved, t)) ? () => vn(e, t) : null,
		own: t.given ? [] : [...t.kind === "element" ? [] : [{
			label: f("Rename…"),
			icon: "edit",
			onSelect: () => void re(t)
		}, {
			label: f("Duplicate…"),
			icon: "copy",
			onSelect: () => void ae(t)
		}], {
			label: f("Delete"),
			icon: "trash",
			danger: !0,
			onSelect: () => oe(t)
		}]
	});
	if (o && s) return p && !h ? /* @__PURE__ */ L(xn, {
		edit: e,
		samples: t,
		style: p,
		menu: se(p)
	}, `${o}/${s}`) : null;
	let ce = (t) => c.filter((e) => e.home === t).map((n) => ({
		key: n.id,
		to: X(t, n.id),
		label: n.label,
		group: nn(e.sheet, t) ?? "",
		menu: se(n),
		changed: _n(e, n),
		style: n
	})), le = (e) => l.find((t) => t.id === e)?.name ?? e, S = c.some((e) => e.home === Ut), ue = ct([
		...Vt,
		...l.map((e) => e.id),
		...S ? [Ut] : []
	], e.arrangement.order.map((e) => l.find((t) => t.name === e)?.id ?? e)), pe = i.trim().toLowerCase().split(/\s+/).filter(Boolean), C = (e) => /* @__PURE__ */ L("div", {
		className: "mb-4",
		children: /* @__PURE__ */ L(ee, {
			bare: !0,
			fields: [{
				handle: "search",
				type: "text",
				label: f("Search"),
				icon: "search",
				size: "sm",
				placeholder: e
			}],
			values: { search: i },
			onChange: (e, t) => a(String(t ?? ""))
		})
	}), me = (e, t) => {
		let n = e.filter((e) => pe.every((t) => `${e.label} ${e.key}`.toLowerCase().includes(t)));
		return n.length ? /* @__PURE__ */ L(H, {
			plain: !0,
			children: /* @__PURE__ */ L(de, {
				className: "overflow-hidden",
				children: /* @__PURE__ */ L("div", {
					className: "-mx-4 divide-y divide-border sm:-mx-5",
					children: n.map((e) => /* @__PURE__ */ L(et, {
						handle: null,
						onOpen: () => d(e.to),
						label: e.label,
						changed: e.changed,
						menu: e.menu,
						detail: t?.(e)
					}, e.to))
				})
			})
		}) : /* @__PURE__ */ L(ie, { onClear: () => a("") });
	}, he = "ml-0 !px-1.5 !font-normal !text-muted first:-ml-1.5 hover:!text-ink", ge = (t, n) => e.readOnly ? void 0 : /* @__PURE__ */ R("span", {
		className: "flex items-center gap-3",
		children: [/* @__PURE__ */ L(y, {
			variant: "ghost",
			size: "xs",
			icon: "plus",
			onClick: () => void te(t),
			className: he,
			children: f("New Style")
		}), /* @__PURE__ */ L(y, {
			variant: "ghost",
			size: "xs",
			icon: "folder",
			onClick: n,
			className: he,
			children: f("New Group")
		})]
	}), w = (t, n, r) => /* @__PURE__ */ L(de, {
		className: "overflow-hidden",
		children: /* @__PURE__ */ L(fe, {
			items: t,
			onChange: n,
			maxDepth: r,
			canNest: (e) => e.kind === "group",
			indent: 20,
			className: "-mx-4 !space-y-0 divide-y divide-border sm:-mx-5",
			renderItem: (t, { handle: n }) => t.kind === "group" ? /* @__PURE__ */ L(et, {
				heading: !0,
				handle: e.readOnly ? null : n,
				label: t.label,
				detail: pt(t),
				menu: t.menu
			}) : /* @__PURE__ */ L(et, {
				handle: e.readOnly ? null : n,
				onOpen: () => d(t.to ?? X()),
				label: t.label,
				locked: t.locked,
				detail: t.detail,
				changed: t.changed,
				menu: t.menu
			})
		})
	});
	if (o) {
		let t = ce(o), n = o === "ungrouped" || Vt.includes(o) || l.some((e) => e.id === o), r = le(o), i = lt(e.arrangement.groups[r] ?? [], t.map((e) => e.key)), a = (t) => e.arrange((e) => ({
			...e,
			groups: {
				...e.groups,
				[r]: t
			}
		})), s = ft(i), c = async () => {
			let e = await wn(s, f("New Group"), f("Create Group"));
			e && a([{
				name: e,
				items: []
			}, ...i]);
		}, u = async (t) => {
			let n = nn(e.sheet, o) ?? o, c = t.style.given || o === "buttons" ? [] : [
				...Ht.map((e) => ({
					value: `to:${e}`,
					label: Gt(e)
				})),
				...l.map((e) => ({
					value: `to:${e.name}`,
					label: e.name
				})),
				...t.style.kind === "element" ? [] : [{
					value: "to:",
					label: f("No Group")
				}]
			].filter((e) => e.value !== `to:${r}` && (o !== "ungrouped" || e.value !== "to:") && (o !== "elements" || t.style.kind !== "element" || e.value !== "to:elements")), u = [
				{
					value: "here",
					label: n
				},
				...s.map((e) => ({
					value: `in:${e}`,
					label: `${n} › ${e}`
				})),
				...c
			], d = dt(i, t.key), p = await T({
				title: f("Move “{name}” to a Group", { name: t.label }),
				fields: [{
					handle: "group",
					type: "select",
					label: f("Group"),
					required: !0,
					options: u
				}],
				values: { group: d ? `in:${d}` : "here" },
				confirm: f("Move to Group")
			});
			if (!p) return;
			let m = String(p.group ?? "here"), h = ut(i, t.key);
			if (m.startsWith("to:")) {
				let n = m.slice(3) || null, r = un(e.sheet, t.style);
				return e.change((e) => dn(ln(e, t.style, t.style.kind === "element" && n === "elements" ? null : n), r)), a(h);
			}
			a(m.startsWith("in:") ? gt(h, m.slice(3), (e) => ({
				...e,
				items: [...e.items, t.key]
			})) : [...h, t.key]);
		}, d = mt(i, (n) => {
			let r = t.find((e) => e.key === n);
			if (!r) return;
			let i = !e.readOnly && (s.length > 0 || !r.style.given && o !== "buttons") ? se(r.style, [{
				label: f("Move to Group…"),
				icon: "folder",
				onSelect: () => void u(r)
			}]) : r.menu;
			return {
				id: `item:${n}`,
				kind: "item",
				label: r.label,
				to: r.to,
				menu: i,
				changed: r.changed
			};
		}, (t) => V(e, { own: [{
			label: f("Rename…"),
			icon: "edit",
			onSelect: async () => {
				let e = await wn(s, f("Rename Group"), f("Rename"), t);
				e && a(gt(i, t, (t) => ({
					...t,
					name: e
				})));
			}
		}, {
			label: f("Delete"),
			icon: "trash",
			danger: !0,
			onSelect: () => a(gt(i, t, null))
		}] }));
		return t.length === 0 && s.length === 0 ? /* @__PURE__ */ L(b, {
			compact: !0,
			icon: "folder",
			title: f("No styles yet"),
			action: !e.readOnly && n && /* @__PURE__ */ L(y, {
				icon: "plus",
				onClick: () => void te(o === "ungrouped" ? null : o),
				children: f("New Style")
			})
		}) : /* @__PURE__ */ R(I, { children: [t.length > 7 && C(f("Search {items}", { items: nn(e.sheet, o) ?? f("Styles") })), pe.length ? me(t) : /* @__PURE__ */ L(H, {
			plain: !0,
			action: n ? ge(o === "ungrouped" ? null : o, () => void c()) : void 0,
			children: w(d, (e) => a(ht(e)), 3)
		})] });
	}
	let _e = (t) => V(e, { own: [{
		label: f("Rename…"),
		icon: "edit",
		onSelect: async () => {
			let n = await Tn(e.sheet, f("Rename Group"), f("Rename"), t);
			n && (e.change((e) => e.renameGroup(t, n)), e.arrange((e) => vt(e, t, n)));
		}
	}, {
		label: f("Delete"),
		icon: "trash",
		danger: !0,
		onSelect: () => {
			e.change((e) => e.renameGroup(t, null)), e.arrange((e) => vt(e, t, null));
		}
	}] }), ve = async () => {
		let t = await Tn(e.sheet, f("New Group"), f("Create Group"));
		t && e.change((e) => e.addGroup(t));
	};
	return /* @__PURE__ */ R(I, { children: [C(f("Search Styles")), pe.length ? me(ue.flatMap(ce), (e) => e.group) : /* @__PURE__ */ L(H, {
		plain: !0,
		action: ge(null, () => void ve()),
		children: w(ue.map((t) => {
			let n = ce(t), r = l.find((e) => e.id === t);
			return {
				id: `item:${t}`,
				kind: "item",
				label: nn(e.sheet, t) ?? t,
				to: X(t),
				locked: !r && t !== "ungrouped",
				detail: n.length,
				changed: n.some((e) => e.changed) || !!r && !e.saved.groups().includes(r.name),
				menu: r ? _e(r.name) : []
			};
		}), (t) => e.arrange((e) => ({
			...e,
			order: t.map((e) => le(e.id.slice(5)))
		})), 0)
	})] });
}
// admin/src/theme.tsx
function kn(e, t, n = () => !1) {
	let r = (e) => {
		if (!e.startsWith(t)) return null;
		let r = e.slice(t.length);
		return r === "" || r.includes("--") || r.includes("*") || n(r) ? null : r;
	}, i = new Map(e.sheet.variables().filter((e) => r(e.name) !== null).map((e) => [e.name, e.value])), a = e.sheet.variable(`${t}*`) === "initial" || e.sheet.variable("--*") === "initial", o = [];
	for (let [t, n] of a ? [] : e.defaults) {
		let e = r(t);
		e !== null && o.push({
			name: t,
			key: e,
			value: i.get(t) ?? n,
			builtIn: !0,
			written: i.has(t)
		});
	}
	for (let [t, n] of i) (a || !e.defaults.has(t)) && o.push({
		name: t,
		key: r(t),
		value: n,
		builtIn: !1,
		written: !0
	});
	return o;
}
var An = (e) => String(e ?? "").trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/^-+|-+$/g, "");
async function jn(e, t, n, r, i = "", a = "md") {
	let o = An((await T({
		title: n,
		fields: [{
			handle: "name",
			type: "text",
			label: f("Name"),
			mono: !0,
			autofocus: !0,
			required: !0,
			placeholder: a
		}],
		values: { name: i },
		confirm: r
	}))?.name);
	return !o || o === i ? null : e.sheet.variable(`${t}${o}`) !== void 0 || e.defaults.has(`${t}${o}`) ? (E.error(f("“{name}” already exists", { name: o })), null) : o;
}
function Mn(e, t, n, r) {
	let i = n.name.slice(0, n.name.length - n.key.length) + r, a = RegExp(`^(!?.*-)${n.key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}((?:/[^!]+)?!?)$`), o = (e) => {
		let { variants: i, utility: o } = Le(e), s = a.exec(o);
		return !s || !t?.declarations(o.replace(/^!|!$/g, ""))?.some((e) => e.value.includes(`var(${n.name})`)) ? e : F(i, `${s[1]}${r}${s[2]}`);
	}, s = e;
	for (let t of e.utilities()) {
		let e = t.classes.map(o);
		e.some((e, n) => e !== t.classes[n]) && (s = s.setUtility(t.name, e));
	}
	for (let t of e.elements()) {
		let e = t.classes.map(o);
		e.some((e, n) => e !== t.classes[n]) && (s = s.setElement(t.name, e));
	}
	return s.renameVariable(n.name, i);
}
var Nn = (e, t) => e.variables().filter((e) => e.name === t || e.name.startsWith(`${t}--`)).reduce((e, t) => e.setVariable(t.name, null), e);
function Pn(e, t) {
	let { engine: n } = P();
	return (r, i = []) => V(e, {
		copy: r.key,
		revert: z(e, r.name) ? () => B(e, r.name) : null,
		extra: i,
		own: r.builtIn ? [] : [{
			label: f("Rename…"),
			icon: "edit",
			onSelect: async () => {
				let i = await jn(e, t.prefix, f("Rename “{name}”", { name: r.key }), f("Rename"), r.key, t.placeholder);
				i && e.change((e) => Mn(e, n, r, i));
			}
		}, {
			label: f("Delete"),
			icon: "trash",
			danger: !0,
			onSelect: () => e.change((e) => Nn(e, r.name))
		}]
	});
}
function Q({ edit: e, kind: t, row: n }) {
	let r = Pn(e, t), i = async () => {
		let n = await jn(e, t.prefix, t.add, t.add, "", t.placeholder);
		n && e.change((e) => e.setVariable(`${t.prefix}${n}`, t.start));
	};
	return /* @__PURE__ */ L(H, {
		title: t.title,
		onAdd: e.readOnly ? void 0 : () => void i(),
		addLabel: t.add,
		children: kn(e, t.prefix, t.skip).map((t) => n(t, (n) => n !== null && e.change((e) => e.setVariable(t.name, n)), (e) => r(t, e)))
	});
}
var $ = (e, t = {}) => ({
	component: "blocks-value",
	unit: e,
	...t
}), Fn = { component: "site-size" }, In = $("rem", {
	units: [
		"rem",
		"px",
		"em"
	],
	step: .125,
	min: 0
});
function Ln({ label: e, value: t, same: n, onChange: r, disabled: i, size: a = "md" }) {
	let { engine: o } = P(), [s, c] = v(!1), l = (e) => M(o ? o.resolve(e) : e).light, u = t ?? n ?? "transparent";
	return /* @__PURE__ */ L(oe, {
		open: s,
		onOpenChange: c,
		align: "end",
		className: "!p-0",
		trigger: /* @__PURE__ */ L("span", {
			className: "group/swatch inline-flex",
			children: /* @__PURE__ */ L(C, {
				content: `${e} · ${t ?? f("Same")}`,
				children: /* @__PURE__ */ L(se, {
					compact: !0,
					"aria-label": e,
					disabled: i,
					className: w("relative shrink-0 rounded-sm outline-offset-2 group-data-[popup-open]/swatch:ring-2 group-data-[popup-open]/swatch:ring-border-strong group-data-[popup-open]/swatch:ring-offset-2 group-data-[popup-open]/swatch:ring-offset-bg", a === "md" ? "size-7" : "size-6"),
					children: /* @__PURE__ */ L(Pe, {
						color: l(u),
						className: w("!size-full !rounded-sm", t === null && "opacity-35")
					})
				})
			})
		}),
		children: /* @__PURE__ */ L(Se, {
			label: e,
			value: t ?? void 0,
			onChange: r,
			clearable: n !== void 0
		})
	});
}
var Rn = (e, t, n, r) => e.writeUtility(t, [{
	name: "--scheme",
	value: n
}, {
	name: "--scheme-text",
	value: r
}], ["scheme"]);
function zn({ edit: e }) {
	let { engine: t } = P(), n = Re(e.sheet), r = (n) => {
		let r = M(t ? t.resolve(n) : n);
		return e.mode === "dark" ? r.dark ?? r.light : r.light;
	}, i = async () => {
		let t = An((await T({
			title: f("Add Scheme"),
			fields: [{
				handle: "name",
				type: "text",
				label: f("Name"),
				mono: !0,
				autofocus: !0,
				required: !0,
				placeholder: "ocean"
			}],
			confirm: f("Add Scheme")
		}))?.name);
		if (t) {
			if (n.some((e) => e.key === t)) return void E.error(f("“{name}” already exists", { name: t }));
			e.change((e) => Rn(e, `${De}${t}`, "var(--color-foreground)", "var(--color-background)"));
		}
	}, a = async (t) => {
		let r = An((await T({
			title: f("Rename “{name}”", { name: t.key }),
			fields: [{
				handle: "name",
				type: "text",
				label: f("Name"),
				mono: !0,
				autofocus: !0,
				required: !0
			}],
			values: { name: t.key },
			confirm: f("Rename")
		}))?.name);
		if (r && r !== t.key) {
			if (n.some((e) => e.key === r)) return void E.error(f("“{name}” already exists", { name: r }));
			e.change((e) => e.renameUtility(t.name, `${De}${r}`));
		}
	}, o = (t) => e.sheet.utilityProperties(t.name).map((e) => e.value).join() !== e.saved.utilityProperties(t.name).map((e) => e.value).join();
	return /* @__PURE__ */ L(H, {
		plain: !0,
		title: f("Schemes"),
		onAdd: e.readOnly ? void 0 : () => void i(),
		addLabel: f("Add Scheme"),
		children: n.length > 0 && /* @__PURE__ */ L("div", {
			className: "grid grid-cols-2 gap-3 pt-1",
			children: n.map((t) => /* @__PURE__ */ R("div", {
				className: "cms-reveal-row group min-w-0",
				children: [/* @__PURE__ */ L(ke, {
					size: "card",
					background: r(t.background),
					text: r(t.text)
				}), /* @__PURE__ */ R("div", {
					className: "flex h-9 items-center gap-1.5",
					children: [
						/* @__PURE__ */ L("span", {
							className: "min-w-0 flex-1 truncate text-sm text-text",
							children: t.key
						}),
						/* @__PURE__ */ L(Xe, { on: o(t) }),
						/* @__PURE__ */ L(Ln, {
							size: "sm",
							label: f("{name} Background", { name: t.key }),
							value: t.background,
							disabled: e.readOnly,
							onChange: (n) => n && e.change((e) => Rn(e, t.name, n, t.text))
						}),
						/* @__PURE__ */ L(Ln, {
							size: "sm",
							label: f("{name} Text", { name: t.key }),
							value: t.text,
							disabled: e.readOnly,
							onChange: (n) => n && e.change((e) => Rn(e, t.name, t.background, n))
						}),
						/* @__PURE__ */ L(qe, { items: V(e, {
							copy: t.name,
							revert: o(t) ? () => e.change((n) => e.saved.utilities().some((e) => e.name === t.name) ? n.writeUtility(t.name, e.saved.utilityProperties(t.name), ["scheme"]) : n.removeUtility(t.name)) : null,
							own: [{
								label: f("Rename…"),
								icon: "edit",
								onSelect: () => void a(t)
							}, {
								label: f("Delete"),
								icon: "trash",
								danger: !0,
								onSelect: () => e.change((e) => e.removeUtility(t.name))
							}]
						}) })
					]
				})]
			}, t.name))
		})
	});
}
function Bn({ edit: e }) {
	let t = {
		prefix: "--color-",
		title: f("Site Colors"),
		add: f("Add Color"),
		start: re,
		placeholder: "brand"
	}, n = Pn(e, t), r = kn(e, t.prefix).filter((t) => !(t.builtIn && e.palette.has(t.name) && !t.written)), i = async () => {
		let n = await jn(e, t.prefix, t.add, t.add, "", t.placeholder);
		n && e.change((e) => e.setVariable(`${t.prefix}${n}`, t.start));
	}, a = (t, n, r) => e.change((e) => e.setVariable(t.name, r && r !== n ? `light-dark(${n}, ${r})` : n));
	return /* @__PURE__ */ R(I, { children: [
		/* @__PURE__ */ L(Vn, { edit: e }),
		/* @__PURE__ */ L(H, {
			title: t.title,
			action: /* @__PURE__ */ R(I, { children: [
				/* @__PURE__ */ L(C, {
					content: f("Light"),
					children: /* @__PURE__ */ L("span", {
						role: "img",
						"aria-label": f("Light"),
						className: "grid w-7 place-items-center text-faint",
						children: /* @__PURE__ */ L(x, {
							name: "sun",
							size: 13
						})
					})
				}),
				/* @__PURE__ */ L(C, {
					content: f("Dark"),
					children: /* @__PURE__ */ L("span", {
						role: "img",
						"aria-label": f("Dark"),
						className: "grid w-7 place-items-center text-faint",
						children: /* @__PURE__ */ L(x, {
							name: "moon",
							size: 13
						})
					})
				}),
				e.readOnly && /* @__PURE__ */ L(Ye, {})
			] }),
			onAdd: e.readOnly ? void 0 : () => void i(),
			addLabel: t.add,
			children: r.map((t) => {
				let { light: r, dark: i } = M(t.value);
				return /* @__PURE__ */ R(W, {
					name: t.key,
					locked: t.builtIn,
					changed: z(e, t.name),
					wide: !0,
					menu: n(t),
					children: [/* @__PURE__ */ L(Ln, {
						label: f("{name} in Light Mode", { name: t.key }),
						value: r,
						disabled: e.readOnly,
						onChange: (e) => e && a(t, e, i)
					}), /* @__PURE__ */ L(Ln, {
						label: f("{name} in Dark Mode", { name: t.key }),
						value: i ?? null,
						same: r,
						disabled: e.readOnly,
						onChange: (e) => a(t, r, e ?? void 0)
					})]
				}, t.name);
			})
		}),
		/* @__PURE__ */ L(zn, { edit: e })
	] });
}
function Vn({ edit: e }) {
	let { engine: n } = P(), i = (t) => e.sheet.variable(t) ?? e.defaults.get(t), a = (t) => {
		let r = i(t);
		if (!r) return;
		let a = M(n ? n.resolve(r) : r);
		return e.mode === "dark" ? a.dark ?? a.light : a.light;
	}, o = [
		"--font-display",
		"--font-serif",
		"--font-sans"
	].find((t) => e.sheet.variable(t) !== void 0) ?? "--font-sans", s = i(o), c = [
		"primary",
		"accent",
		"foreground",
		"background"
	].map((e) => ({
		key: e,
		color: a(`--color-${e}`)
	})).filter((e) => !!e.color);
	return /* @__PURE__ */ R("figure", {
		"aria-hidden": !0,
		className: "relative m-0 mb-7 mt-3 p-3",
		children: [
			[
				"left-0 top-3 h-px w-2",
				"left-3 top-0 h-2 w-px",
				"right-0 top-3 h-px w-2",
				"right-3 top-0 h-2 w-px",
				"bottom-3 left-0 h-px w-2",
				"bottom-0 left-3 h-2 w-px",
				"bottom-3 right-0 h-px w-2",
				"bottom-0 right-3 h-2 w-px"
			].map((e) => /* @__PURE__ */ L("span", { className: w("pointer-events-none absolute bg-border-strong", e) }, e)),
			/* @__PURE__ */ R("div", {
				className: "relative overflow-hidden rounded-xs p-5",
				style: {
					background: a("--color-background") ?? "white",
					color: a("--color-foreground")
				},
				children: [/* @__PURE__ */ R("div", {
					className: "flex items-end justify-between gap-4",
					children: [/* @__PURE__ */ L("span", {
						className: "block truncate leading-none",
						style: {
							fontFamily: s,
							fontSize: 56
						},
						children: "Aa"
					}), /* @__PURE__ */ L("span", {
						className: "max-w-[60%] truncate pb-1 text-right font-mono text-2xs uppercase tracking-wider opacity-60",
						children: t(r(s ?? "")) || o.slice(7)
					})]
				}), /* @__PURE__ */ L("div", {
					className: "mt-5 grid gap-1.5",
					style: { gridTemplateColumns: `repeat(${Math.max(c.length, 1)}, minmax(0, 1fr))` },
					children: c.map((e) => /* @__PURE__ */ R("div", {
						className: "min-w-0",
						children: [
							/* @__PURE__ */ L("span", {
								className: "relative block h-10 rounded-xs",
								style: { background: e.color },
								children: /* @__PURE__ */ L("span", { className: "cms-swatch-edge" })
							}),
							/* @__PURE__ */ L("span", {
								className: "mt-1.5 block truncate text-2xs",
								children: e.key
							}),
							/* @__PURE__ */ L("span", {
								className: "block truncate font-mono text-2xs opacity-60",
								children: e.color
							})
						]
					}, e.key))
				})]
			}),
			/* @__PURE__ */ L("span", { className: "cms-swatch-edge pointer-events-none !inset-3 rounded-xs" })
		]
	});
}
function Hn(e) {
	let t = e.flatMap((e) => String(e.weight ?? "400").split(/\s+/).map(Number)).filter((e) => e > 0), n = Math.min(...t), r = Math.max(...t), i = t.length === 0 ? "400" : n === r ? String(n) : `${n}–${r}`;
	return e.some((e) => e.style === "italic") ? `${i} · ${f("Italic")}` : i;
}
var Un = (e, t) => /* @__PURE__ */ L("p", {
	className: "m-0 truncate pb-2.5 text-ink",
	style: {
		fontSize: `min(${e}, 2.75rem)`,
		lineHeight: 1.1,
		fontFamily: t
	},
	children: f("Ship It")
});
function Wn({ edit: e, fonts: i }) {
	let o = [...new Set(i.faces.map((e) => e.family))], s = new Set(kn(e, "--font-", (e) => e.startsWith("weight-")).map((e) => t(r(e.value)))), c = o.map((e) => {
		let t = i.faces.filter((t) => t.family === e);
		return {
			family: e,
			styles: Hn(t),
			fallback: t.some((e) => Array.isArray(e.fallback) ? e.fallback.length > 0 : !!e.fallback),
			used: s.has(e)
		};
	}), l = n("", "sans", !1), u = e.sheet.variable("--font-sans") ?? e.defaults.get("--font-sans"), d = () => [
		["sans", f("Sans")],
		["serif", f("Serif")],
		["mono", f("Mono")]
	];
	return /* @__PURE__ */ R(I, { children: [
		/* @__PURE__ */ L(Q, {
			edit: e,
			kind: {
				prefix: "--font-",
				title: f("Fonts"),
				add: f("Add Font Family"),
				start: l,
				placeholder: "display",
				skip: (e) => e.startsWith("weight-")
			},
			row: (o, s, l) => {
				let u = r(o.value), p = t(u), m = i.faces.filter((e) => e.family === p), h = m.some((e) => e.preload);
				return /* @__PURE__ */ L(W, {
					name: o.key,
					locked: o.builtIn,
					changed: z(e, o.name),
					sample: /* @__PURE__ */ L("span", {
						className: "block max-w-7 overflow-hidden whitespace-nowrap text-center text-lg leading-none text-ink",
						style: { fontFamily: o.value },
						children: "Aa"
					}),
					menu: l([
						{
							heading: !0,
							label: f("Fallback")
						},
						...d().map(([e, t]) => ({
							label: t,
							checked: a(u) === e,
							onSelect: () => s(n(p, e, u.includes(`${p} Fallback`)))
						})),
						...m.length ? [{
							separator: !0,
							label: ""
						}, {
							label: f("Preload"),
							checked: h,
							onSelect: () => i.preload(p, !h)
						}] : []
					]),
					children: /* @__PURE__ */ L(U, {
						handle: o.name,
						label: o.key,
						value: o.value,
						disabled: e.readOnly,
						field: {
							component: "site-font-stack",
							fonts: c,
							...e.readOnly ? {} : {
								onAdd: i.add,
								onRemove: i.remove
							}
						},
						onChange: s
					})
				}, o.name);
			}
		}),
		/* @__PURE__ */ L(Q, {
			edit: e,
			kind: {
				prefix: "--text-",
				title: f("Text Sizes"),
				add: f("Add Text Size"),
				start: "1.25rem",
				placeholder: "lead",
				skip: (e) => e.startsWith("shadow-")
			},
			row: (t, n, r) => /* @__PURE__ */ L(W, {
				name: t.key,
				locked: t.builtIn,
				changed: z(e, t.name),
				menu: r(),
				below: Un(t.value, u),
				children: /* @__PURE__ */ L(U, {
					handle: t.name,
					label: t.key,
					value: t.value,
					disabled: e.readOnly,
					field: Fn,
					onChange: n
				})
			}, t.name)
		}),
		/* @__PURE__ */ L(Q, {
			edit: e,
			kind: {
				prefix: "--leading-",
				title: f("Line Heights"),
				add: f("Add Line Height"),
				start: "1.5",
				placeholder: "airy"
			},
			row: (t, n, r) => /* @__PURE__ */ L(W, {
				name: t.key,
				locked: t.builtIn,
				changed: z(e, t.name),
				menu: r(),
				sample: /* @__PURE__ */ L("span", {
					className: "flex w-4 flex-col",
					style: { gap: `${Math.max(1, (Number(t.value) - .8) * 6)}px` },
					children: [
						0,
						1,
						2
					].map((e) => /* @__PURE__ */ L("span", { className: w("h-0.5 rounded-full bg-muted", e === 2 && "w-2/3") }, e))
				}),
				children: /* @__PURE__ */ L(U, {
					handle: t.name,
					label: t.key,
					value: t.value,
					disabled: e.readOnly,
					field: $("", {
						step: .05,
						min: 0
					}),
					onChange: n
				})
			}, t.name)
		}),
		/* @__PURE__ */ L(Q, {
			edit: e,
			kind: {
				prefix: "--tracking-",
				title: f("Letter Spacing"),
				add: f("Add Letter Spacing"),
				start: "0em",
				placeholder: "loose"
			},
			row: (t, n, r) => /* @__PURE__ */ L(W, {
				name: t.key,
				locked: t.builtIn,
				changed: z(e, t.name),
				menu: r(),
				sample: /* @__PURE__ */ L("span", {
					className: "text-xs font-medium text-ink",
					style: { letterSpacing: t.value },
					children: "Aa"
				}),
				children: /* @__PURE__ */ L(U, {
					handle: t.name,
					label: t.key,
					value: t.value,
					disabled: e.readOnly,
					field: $("em", {
						units: ["em", "px"],
						step: .005
					}),
					onChange: n
				})
			}, t.name)
		})
	] });
}
var Gn = (e, t = Fn) => (n, r, i) => /* @__PURE__ */ L(W, {
	name: n.key,
	locked: n.builtIn,
	changed: z(e, n.name),
	menu: i(),
	children: /* @__PURE__ */ L(U, {
		handle: n.name,
		label: n.key,
		value: n.value,
		disabled: e.readOnly,
		field: t,
		onChange: r
	})
}, n.name);
function Kn({ edit: e }) {
	let [t, n] = v("md"), r = [
		{
			value: "sm",
			label: f("Small")
		},
		{
			value: "md",
			label: f("Medium")
		},
		{
			value: "lg",
			label: f("Large")
		}
	], i = [
		["height", f("Height")],
		["padding", f("Padding")],
		["text", f("Text")]
	], a = r.find((e) => e.value === t).label, o = (t) => e.sheet.variable(t) ?? e.defaults.get(t) ?? null;
	return /* @__PURE__ */ L(H, {
		title: f("Buttons and Fields"),
		action: /* @__PURE__ */ L(ue, {
			size: "xs",
			"aria-label": f("Size"),
			value: t,
			onChange: n,
			options: r
		}),
		children: i.map(([n, r]) => {
			let i = `--control-${t}-${n}`;
			return /* @__PURE__ */ L($e, {
				label: r,
				changed: z(e, i),
				menu: V(e, {
					copy: i,
					revert: z(e, i) ? () => B(e, i) : null
				}),
				children: /* @__PURE__ */ L(U, {
					handle: i,
					label: `${a} ${r}`,
					value: o(i),
					disabled: e.readOnly,
					field: $("rem", {
						units: ["rem", "px"],
						step: .125,
						min: 0
					}),
					onChange: (t) => t !== null && e.change((e) => e.setVariable(i, t))
				})
			}, i);
		})
	});
}
function qn(e) {
	let t = /^(-?[\d.]+)(rem|px)$/.exec(e.trim());
	return t ? Number(t[1]) * (t[2] === "rem" ? 16 : 1) : null;
}
function Jn({ step: e }) {
	let t = qn(e);
	return t === null ? null : /* @__PURE__ */ L("div", {
		className: "flex items-end gap-1.5 pb-3 pt-1",
		"aria-hidden": !0,
		children: Oe.filter((e) => e > 0).map((e) => {
			let n = +(t * e).toFixed(2);
			return /* @__PURE__ */ R("span", {
				className: "flex min-w-0 flex-1 flex-col items-center gap-1",
				children: [/* @__PURE__ */ L("span", {
					className: "w-full rounded-xs bg-active",
					style: { height: Math.max(2, Math.min(n, 128) / 2) }
				}), /* @__PURE__ */ L("span", {
					className: "text-2xs tabular-nums text-faint",
					children: n
				})]
			}, e);
		})
	});
}
function Yn({ edit: e }) {
	let t = {
		prefix: "--spacing-",
		title: f("Spacing"),
		add: f("Add Spacing"),
		start: "2rem",
		placeholder: "gutter"
	}, n = Pn(e, t), r = e.sheet.variable("--spacing"), i = async () => {
		let n = await jn(e, t.prefix, t.add, t.add, "", t.placeholder);
		n && e.change((e) => e.setVariable(`${t.prefix}${n}`, t.start));
	}, a = {
		name: "--spacing",
		key: "1",
		value: r ?? e.defaults.get("--spacing") ?? "0.25rem",
		builtIn: !0,
		written: r !== void 0
	};
	return /* @__PURE__ */ R(I, { children: [
		/* @__PURE__ */ R(H, {
			title: t.title,
			onAdd: e.readOnly ? void 0 : () => void i(),
			addLabel: t.add,
			children: [/* @__PURE__ */ L(W, {
				name: a.key,
				locked: !0,
				changed: z(e, a.name),
				menu: V(e, { revert: z(e, a.name) ? () => B(e, a.name) : null }),
				below: /* @__PURE__ */ L(Jn, { step: a.value }),
				children: /* @__PURE__ */ L(U, {
					handle: "--spacing",
					label: a.key,
					value: a.value,
					disabled: e.readOnly,
					field: Fn,
					onChange: (t) => t !== null && e.change((e) => e.setVariable("--spacing", t))
				})
			}), kn(e, t.prefix).map((t) => Gn(e)(t, (n) => n !== null && e.change((e) => e.setVariable(t.name, n)), (e) => n(t, e)))]
		}),
		/* @__PURE__ */ L(Q, {
			edit: e,
			kind: {
				prefix: "--container-",
				title: f("Containers"),
				add: f("Add Container"),
				start: "72rem",
				placeholder: "content"
			},
			row: Gn(e)
		}),
		/* @__PURE__ */ L(Q, {
			edit: e,
			kind: {
				prefix: "--breakpoint-",
				title: f("Breakpoints"),
				add: f("Add Breakpoint"),
				start: "120rem",
				placeholder: "3xl"
			},
			row: Gn(e, In)
		}),
		/* @__PURE__ */ L(Kn, { edit: e })
	] });
}
function Xn({ edit: t }) {
	let n = (n) => (r, i, a) => /* @__PURE__ */ L(W, {
		name: r.key,
		locked: r.builtIn,
		changed: z(t, r.name),
		menu: a(),
		sample: /* @__PURE__ */ L(e, {
			value: r.value,
			kind: n
		}),
		children: /* @__PURE__ */ L(U, {
			handle: r.name,
			label: r.key,
			value: r.value,
			disabled: t.readOnly,
			field: {
				component: "site-shadow",
				kind: n
			},
			onChange: i
		})
	}, r.name);
	return /* @__PURE__ */ R(I, { children: [
		/* @__PURE__ */ L(Q, {
			edit: t,
			kind: {
				prefix: "--radius-",
				title: f("Corners"),
				add: f("Add Radius"),
				start: "0.5rem",
				placeholder: "card"
			},
			row: (e, n, r) => /* @__PURE__ */ L(W, {
				name: e.key,
				locked: e.builtIn,
				changed: z(t, e.name),
				menu: r(),
				sample: /* @__PURE__ */ L("span", {
					className: "size-5 translate-x-0.5 translate-y-0.5 border-l-[1.5px] border-t-[1.5px] border-muted",
					style: { borderTopLeftRadius: `min(${e.value}, 20px)` }
				}),
				children: /* @__PURE__ */ L(U, {
					handle: e.name,
					label: e.key,
					value: e.value,
					disabled: t.readOnly,
					field: $("rem", {
						units: [
							"rem",
							"px",
							"%"
						],
						step: .125,
						min: 0
					}),
					onChange: n
				})
			}, e.name)
		}),
		/* @__PURE__ */ L(Q, {
			edit: t,
			kind: {
				prefix: "--shadow-",
				title: f("Shadows"),
				add: f("Add Shadow"),
				start: "0 4px 16px -4px rgb(0 0 0 / 0.12)",
				placeholder: "card"
			},
			row: n("box")
		}),
		/* @__PURE__ */ L(Q, {
			edit: t,
			kind: {
				prefix: "--inset-shadow-",
				title: f("Inset Shadows"),
				add: f("Add Inset Shadow"),
				start: "inset 0 2px 4px rgb(0 0 0 / 0.08)",
				placeholder: "well"
			},
			row: n("box")
		}),
		/* @__PURE__ */ L(Q, {
			edit: t,
			kind: {
				prefix: "--drop-shadow-",
				title: f("Drop Shadows"),
				add: f("Add Drop Shadow"),
				start: "0 4px 8px rgb(0 0 0 / 0.12)",
				placeholder: "lifted"
			},
			row: n("drop")
		}),
		/* @__PURE__ */ L(Q, {
			edit: t,
			kind: {
				prefix: "--text-shadow-",
				title: f("Text Shadows"),
				add: f("Add Text Shadow"),
				start: "0 1px 2px rgb(0 0 0 / 0.2)",
				placeholder: "glow"
			},
			row: n("text")
		}),
		/* @__PURE__ */ L(Q, {
			edit: t,
			kind: {
				prefix: "--blur-",
				title: f("Blur"),
				add: f("Add Blur"),
				start: "6px",
				placeholder: "soft"
			},
			row: (e, n, r) => /* @__PURE__ */ L(W, {
				name: e.key,
				locked: e.builtIn,
				changed: z(t, e.name),
				menu: r(),
				sample: /* @__PURE__ */ L("span", {
					className: "size-3 rounded-full bg-muted",
					style: { filter: `blur(min(${e.value}, 6px))` }
				}),
				children: /* @__PURE__ */ L(U, {
					handle: e.name,
					label: e.key,
					value: e.value,
					disabled: t.readOnly,
					field: $("px", {
						units: ["px", "rem"],
						step: 1,
						min: 0
					}),
					onChange: n
				})
			}, e.name)
		}),
		/* @__PURE__ */ L(Q, {
			edit: t,
			kind: {
				prefix: "--perspective-",
				title: f("Perspective"),
				add: f("Add Perspective"),
				start: "800px",
				placeholder: "deep"
			},
			row: Gn(t, $("px", {
				units: ["px", "rem"],
				step: 10,
				min: 0
			}))
		})
	] });
}
function Zn(e, t) {
	let n = String(e ?? "").trim().match(/^(\d*\.?\d+)\s*(ms|s)?$/);
	if (!n) return t;
	let r = n[2] === "s" ? Number(n[1]) : Number(n[1]) / 1e3;
	return Math.min(2, Math.max(.05, Math.round(r * 1e3) / 1e3));
}
function Qn({ edit: e, transition: t, saved: n, onTransition: r }) {
	let a = (t, n) => e.change((e) => e.setVariable(t, n)), o = (t) => e.sheet.variable(t) ?? e.defaults.get(t) ?? null, s = (t) => V(e, {
		copy: t,
		revert: z(e, t) ? () => B(e, t) : null
	}), c = (i) => V(e, { revert: t[i] === n[i] ? null : () => r({
		...t,
		[i]: n[i]
	}) });
	return /* @__PURE__ */ R(I, { children: [
		/* @__PURE__ */ L(Q, {
			edit: e,
			kind: {
				prefix: "--ease-",
				title: f("Easings"),
				add: f("Add Easing"),
				start: "cubic-bezier(0.2, 0.8, 0.2, 1)",
				placeholder: "snap"
			},
			row: (t, n, r) => /* @__PURE__ */ L(W, {
				name: t.key,
				locked: t.builtIn,
				changed: z(e, t.name),
				menu: r(),
				children: /* @__PURE__ */ L(U, {
					handle: t.name,
					label: t.key,
					value: t.value,
					disabled: e.readOnly,
					field: { component: "ease" },
					onChange: n
				})
			}, t.name)
		}),
		/* @__PURE__ */ L(Q, {
			edit: e,
			kind: {
				prefix: "--duration-",
				title: f("Durations"),
				add: f("Add Duration"),
				start: "300ms",
				placeholder: "slow"
			},
			row: (t, n, r) => /* @__PURE__ */ L(W, {
				name: t.key,
				locked: t.builtIn,
				changed: z(e, t.name),
				menu: r(),
				children: /* @__PURE__ */ L(U, {
					handle: t.name,
					label: t.key,
					value: t.value,
					disabled: e.readOnly,
					field: $("ms", {
						units: ["ms", "s"],
						step: 50,
						min: 0
					}),
					onChange: n
				})
			}, t.name)
		}),
		/* @__PURE__ */ L(Q, {
			edit: e,
			kind: {
				prefix: "--animate-",
				title: f("Animations"),
				add: f("Add Animation"),
				start: "spin 2s linear infinite",
				placeholder: "float"
			},
			row: (t, n, r) => /* @__PURE__ */ L(W, {
				name: t.key,
				locked: t.builtIn,
				changed: z(e, t.name),
				menu: r(),
				sample: /* @__PURE__ */ L(i, {
					value: t.value,
					keyframes: e.keyframes
				}),
				children: /* @__PURE__ */ L(U, {
					handle: t.name,
					label: t.key,
					value: t.value,
					disabled: e.readOnly,
					field: {
						component: "site-animation",
						keyframes: e.keyframes
					},
					onChange: n
				})
			}, t.name)
		}),
		/* @__PURE__ */ R(H, {
			title: f("Transitions"),
			children: [/* @__PURE__ */ L($e, {
				label: f("Duration"),
				changed: z(e, "--default-transition-duration"),
				menu: s("--default-transition-duration"),
				children: /* @__PURE__ */ L(U, {
					handle: "--default-transition-duration",
					label: f("Duration"),
					value: o("--default-transition-duration"),
					disabled: e.readOnly,
					field: $("ms", {
						units: ["ms", "s"],
						step: 10,
						min: 0
					}),
					onChange: (e) => e && a("--default-transition-duration", e)
				})
			}), /* @__PURE__ */ L($e, {
				label: f("Easing"),
				changed: z(e, "--default-transition-timing-function"),
				menu: s("--default-transition-timing-function"),
				children: /* @__PURE__ */ L(U, {
					handle: "--default-transition-timing-function",
					label: f("Easing"),
					value: o("--default-transition-timing-function"),
					disabled: e.readOnly,
					field: { component: "ease" },
					onChange: (e) => e && a("--default-transition-timing-function", e)
				})
			})]
		}),
		/* @__PURE__ */ R(H, {
			title: f("Page Transition"),
			children: [
				/* @__PURE__ */ L($e, {
					label: f("Effect"),
					changed: t.type !== n.type,
					menu: c("type"),
					children: /* @__PURE__ */ L(U, {
						handle: "type",
						label: f("Effect"),
						value: t.type,
						disabled: e.readOnly,
						field: {
							type: "select",
							mono: !1,
							required: !0,
							options: {
								none: f("None"),
								fade: f("Fade"),
								slide: f("Slide"),
								scale: f("Scale")
							}
						},
						onChange: (e) => r({
							...t,
							type: e ?? "none"
						})
					})
				}),
				t.type !== "none" && /* @__PURE__ */ L($e, {
					label: f("Duration"),
					changed: t.duration !== n.duration,
					menu: c("duration"),
					children: /* @__PURE__ */ L(U, {
						handle: "duration",
						label: f("Duration"),
						value: `${Math.round(t.duration * 1e3)}ms`,
						disabled: e.readOnly,
						field: $("ms", {
							units: ["ms"],
							step: 10,
							min: 50,
							max: 2e3
						}),
						onChange: (e) => r({
							...t,
							duration: Zn(e, t.duration)
						})
					})
				}),
				/* @__PURE__ */ L($e, {
					label: f("Page Loads"),
					changed: t.navigation !== n.navigation,
					menu: c("navigation"),
					children: /* @__PURE__ */ L(U, {
						handle: "navigation",
						label: f("Page Loads"),
						value: t.navigation,
						disabled: e.readOnly,
						field: {
							type: "select",
							mono: !1,
							required: !0,
							options: {
								document: f("Full Page"),
								client: f("Instant")
							}
						},
						onChange: (e) => r({
							...t,
							navigation: e === "client" ? "client" : "document"
						})
					})
				})
			]
		})
	] });
}
// admin/src/Design.tsx
var $n = {}, er = [
	"colors",
	"typography",
	"layout",
	"effects",
	"motion",
	"styles"
], tr = (e) => ({
	colors: f("Colors"),
	typography: f("Typography"),
	layout: f("Layout"),
	effects: f("Effects"),
	motion: f("Motion"),
	styles: f("Styles")
})[e], nr = (e, t) => JSON.stringify(e ?? null) === JSON.stringify(t ?? null), rr = /* @__PURE__ */ new Map(), ir = (e, t) => e.css === t.css && nr(e.transition, t.transition) && nr(e.arrangement, t.arrangement);
function ar({ params: e }) {
	let t = p("styling/get", {}, {
		refetchOnWindowFocus: !1,
		retry: !1
	}), n = p("styling/source", {}, {
		refetchOnWindowFocus: !1,
		retry: !1,
		staleTime: 6e4
	}), [r, i] = v($n), [a, ...y] = (e["*"] ?? "").split("/").filter(Boolean), b = er.includes(a) ? a : null;
	m(() => {
		b || u(a === "classes" ? `/design/styles${e["*"].slice(a.length)}` : "/design/colors", { replace: !0 });
	}, [b]);
	let ee = b === "styles" && y.length > 0 && !!t.data && rn(new Me(r.css ?? t.data.css), y) === null;
	m(() => {
		ee && u(X(), { replace: !0 });
	}, [ee]);
	let [x, ne] = v(be() === "dark" ? "dark" : "light"), [re, ie] = v(!1), [oe, se] = v(() => window.matchMedia("(max-width: 767px)").matches);
	m(() => {
		let e = window.matchMedia("(max-width: 767px)"), t = () => se(e.matches);
		return e.addEventListener("change", t), () => e.removeEventListener("change", t);
	}, []);
	let S = re && oe, [de, fe] = v("desktop"), [ve, ye] = v(!1), [D, Se] = v(null), Ce = _(null), O = t.data, k = r.css ?? O?.css, we = r.transition ?? O?.transition, Te = g(() => Ge(O?.arrangement), [O?.arrangement]), Ee = r.arrangement ?? Te, De = !!O && (r.css !== void 0 && r.css !== O.css || r.transition !== void 0 && !nr(r.transition, O.transition) || r.arrangement !== void 0 && !nr(r.arrangement, Te)), Oe = !c("settings.manage"), A = g(() => new Me(k ?? ""), [k]), ke = g(() => new Me(O?.css ?? ""), [O?.css]), Ae = nt(n.data, k), je = g(() => A.variables().some((e) => e.value.startsWith("light-dark(")) || /color-scheme\s*:\s*light\s+dark\b/.test(A.css), [A]), [j, Pe] = v(null);
	m(() => {
		Ie().then(Pe);
	}, []);
	let M = _(null), N = e["*"] ?? "", Fe = _(N);
	Fe.current !== N && (M.current && rr.set(Fe.current, M.current.scrollTop), Fe.current = N);
	let Le = !!t.data && !!n.data && j !== null;
	h(() => {
		Le && M.current && (M.current.scrollTop = rr.get(N) ?? 0);
	}, [N, Le]);
	let Re = g(() => k !== void 0 && we ? {
		css: k,
		transition: we,
		arrangement: Ee
	} : void 0, [
		k,
		we,
		Ee
	]), ze = xe(Re, (e) => i({
		css: e.css,
		transition: e.transition,
		arrangement: e.arrangement
	}), ir), Be = async (e) => {
		try {
			let { snapshot: t } = await d("revisions/get", { id: e });
			i({
				css: t.css,
				transition: t.transition,
				arrangement: Ge(t.arrangement)
			});
		} catch (e) {
			E.error(e);
		}
	}, Ve = n.data?.files.cms, He = g(() => {
		let e = /* @__PURE__ */ new Map();
		for (let t of [...Ue(j ?? ""), ...Ue(Ve ?? "")]) e.set(t.name, t.value);
		return e;
	}, [j, Ve]), We = g(() => new Set(Ue(j ?? "").filter((e) => e.name.startsWith("--color-")).map((e) => e.name)), [j]), P = g(() => o(j ?? "", k ?? ""), [j, k]);
	if (m(() => {
		let e = document.createElement("style");
		return e.textContent = (O?.fonts ?? []).map((e) => `@font-face{font-family:"${e.family}";src:url("${/^(https:\/\/|\/)/.test(e.src) ? e.src : `/_cms/fonts/${e.src.split("/").pop()}`}") format("woff2");font-weight:${e.weight ?? "400"};font-style:${e.style ?? "normal"};font-display:swap}`).join("\n"), document.head.appendChild(e), () => e.remove();
	}, [O?.fonts]), !b || t.isLoading || n.isLoading || j === null) return /* @__PURE__ */ L("div", {
		className: "grid h-full place-items-center text-faint",
		children: /* @__PURE__ */ L(pe, {})
	});
	if (!O || !n.data || k === void 0 || !we) return /* @__PURE__ */ R("div", {
		className: "flex h-full flex-col",
		children: [/* @__PURE__ */ L(me, { crumbs: [{ label: tr(b) }] }), /* @__PURE__ */ L(ce, {
			title: f("Couldn’t load the design"),
			onRetry: () => {
				t.refetch(), n.refetch();
			},
			retrying: t.isRefetching || n.isRefetching
		})]
	});
	let F = {
		sheet: A,
		saved: ke,
		change: (e) => !Oe && i((t) => ({
			...t,
			css: e(new Me(t.css ?? O.css)).css
		})),
		arrangement: Ee,
		savedArrangement: Te,
		arrange: (e) => !Oe && i((t) => ({
			...t,
			arrangement: e(t.arrangement ?? Te)
		})),
		readOnly: Oe,
		defaults: He,
		palette: We,
		keyframes: P,
		mode: je ? x : "light"
	}, Ke = {
		compiler: Ae.compiler,
		device: S ? "phone" : de
	}, z = b === "styles" ? rn(A, y) : null, B = () => {
		l("styling/", "revisions/"), Ce.current?.contentWindow?.location.reload();
	}, V = async () => {
		if (De && !ve) {
			ye(!0), Se(null);
			try {
				let e = {};
				r.css !== void 0 && r.css !== O.css && (e.css = r.css), r.transition !== void 0 && !nr(r.transition, O.transition) && (e.transition = r.transition), r.arrangement !== void 0 && !nr(r.arrangement, Te) && (e.arrangement = r.arrangement), Object.keys(e).length > 0 && await d("styling/update", e), await Promise.all([t.refetch(), n.refetch()]), i($n), Ce.current?.contentWindow?.location.reload();
			} catch (e) {
				Se({
					message: e instanceof Error ? e.message : String(e),
					refused: e instanceof s && e.type === "invalid_input"
				});
			} finally {
				ye(!1);
			}
		}
	}, qe = {
		faces: O.fonts,
		add: async (e) => {
			try {
				if (e === "google") {
					let e = await T({
						title: f("Add a Google Font"),
						fields: [{
							handle: "family",
							type: "text",
							label: f("Name"),
							placeholder: "Inter Tight",
							autofocus: !0,
							required: !0
						}],
						confirm: f("Add Font")
					}), t = String(e?.family ?? "").trim();
					if (!t) return null;
					let n = await d("styling/fonts-import", { family: t });
					return E.success(f("{family} added", { family: t })), B(), {
						family: t,
						fallback: n.fonts.some((e) => !!e.fallback)
					};
				}
				let t = await new Promise((e) => {
					let t = document.createElement("input");
					t.type = "file", t.accept = ".woff2,font/woff2", t.onchange = () => e(t.files?.[0] ?? null), t.oncancel = () => e(null), t.click();
				});
				if (!t) return null;
				let n = await new Promise((e) => {
					let n = new FileReader();
					n.onload = () => e(String(n.result)), n.readAsDataURL(t);
				}), r = t.name.replace(/\.woff2$/i, ""), i = await T({
					title: f("Upload Font"),
					fields: [{
						handle: "family",
						type: "text",
						label: f("Family Name"),
						autofocus: !0,
						required: !0
					}],
					values: { family: r.replace(/[-_](regular|bold|variable|italic|\d+).*$/i, "").replace(/[-_]/g, " ") },
					confirm: f("Upload Font")
				}), a = String(i?.family ?? "").trim();
				return a ? (await d("styling/fonts-upload", {
					family: a,
					name: r,
					data: n,
					weight: /variable/i.test(r) ? "100 900" : "400",
					style: /italic/i.test(r) ? "italic" : "normal"
				}), E.success(f("{family} uploaded", { family: a })), B(), {
					family: a,
					fallback: !1
				}) : null;
			} catch (e) {
				return E.error(e), null;
			}
		},
		remove: async (e) => {
			if (await _e({
				title: f("Remove {family}?", { family: e }),
				confirm: f("Remove Font"),
				danger: !0
			})) try {
				await d("styling/update", { fonts: O.fonts.filter((t) => t.family !== e) }), B();
			} catch (e) {
				E.error(e);
			}
		},
		preload: async (e, t) => {
			let n = O.fonts.some((t) => t.family === e && t.style !== "italic");
			try {
				await d("styling/update", { fonts: O.fonts.map((r) => r.family === e ? {
					...r,
					preload: t && (!n || r.style !== "italic")
				} : r) }), B();
			} catch (e) {
				E.error(e);
			}
		}
	}, Je = /* @__PURE__ */ R(I, { children: [
		b === "colors" && /* @__PURE__ */ L(Bn, { edit: F }),
		b === "typography" && /* @__PURE__ */ L(Wn, {
			edit: F,
			fonts: qe
		}),
		b === "layout" && /* @__PURE__ */ L(Yn, { edit: F }),
		b === "effects" && /* @__PURE__ */ L(Xn, { edit: F }),
		b === "motion" && /* @__PURE__ */ L(Qn, {
			edit: F,
			transition: we,
			saved: O.transition,
			onTransition: (e) => !Oe && i((t) => ({
				...t,
				transition: e
			}))
		}),
		b === "styles" && /* @__PURE__ */ L(On, {
			edit: F,
			samples: Ke,
			path: y
		}, y[0] ?? "")
	] });
	return /* @__PURE__ */ R("div", {
		className: "flex h-full flex-col",
		children: [
			/* @__PURE__ */ L(me, {
				divided: !0,
				crumbs: z ?? [{ label: tr(b) }],
				actions: /* @__PURE__ */ R(I, { children: [
					/* @__PURE__ */ L("span", {
						className: "md:hidden",
						children: /* @__PURE__ */ L(C, {
							content: f("Preview"),
							children: /* @__PURE__ */ L(te, {
								icon: "eye",
								label: f("Preview"),
								title: void 0,
								active: S,
								"aria-pressed": S,
								onClick: () => ie(!S)
							})
						})
					}),
					!Oe && /* @__PURE__ */ R(I, { children: [/* @__PURE__ */ L(he, { history: ze }), /* @__PURE__ */ L("span", {
						className: "max-sm:hidden",
						children: /* @__PURE__ */ L(ge, {
							of: {
								kind: "styling",
								subject: "theme"
							},
							onOpen: (e) => void Be(e.id)
						})
					})] }),
					/* @__PURE__ */ L("span", {
						className: "max-md:hidden",
						children: /* @__PURE__ */ L(ue, {
							size: "xs",
							"aria-label": f("Screen"),
							value: de,
							onChange: fe,
							options: [
								{
									value: "desktop",
									icon: "desktop",
									title: f("Desktop")
								},
								{
									value: "tablet",
									icon: "tablet",
									title: f("Tablet")
								},
								{
									value: "phone",
									icon: "phone",
									title: f("Phone")
								}
							]
						})
					}),
					je && /* @__PURE__ */ L(ue, {
						size: "xs",
						className: "max-sm:hidden",
						"aria-label": f("Color Mode"),
						value: x,
						onChange: ne,
						options: [{
							value: "light",
							icon: "sun",
							title: f("Light")
						}, {
							value: "dark",
							icon: "moon",
							title: f("Dark")
						}]
					}),
					/* @__PURE__ */ L(C, {
						content: f("Open Site"),
						children: /* @__PURE__ */ L(te, {
							icon: "external",
							label: f("Open Site"),
							title: void 0,
							onClick: () => window.open("/", "_blank", "noopener"),
							className: "max-md:hidden"
						})
					})
				] })
			}),
			/* @__PURE__ */ L(le, {
				within: "/design",
				dirty: De,
				saving: ve,
				error: D ? D.refused ? f("The stylesheet was not saved") : D.message : null,
				onSave: () => void V(),
				onDiscard: () => {
					i($n), Se(null);
				}
			}),
			/* @__PURE__ */ L(Ne, {
				source: Ae.source ?? n.data,
				children: /* @__PURE__ */ R("div", {
					className: "grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(320px,380px)_minmax(0,1fr)] xl:grid-cols-[minmax(360px,420px)_minmax(0,1fr)]",
					children: [/* @__PURE__ */ L("div", {
						className: w("flex min-h-0 flex-col border-border md:border-r", S && "max-md:hidden"),
						children: /* @__PURE__ */ R("div", {
							ref: M,
							onScroll: (e) => rr.set(N, e.currentTarget.scrollTop),
							className: "min-h-0 flex-1 overflow-y-auto px-4 pb-16 pt-2",
							children: [D?.refused && /* @__PURE__ */ L(ae, {
								tone: "danger",
								className: "mb-3 mt-1",
								title: f("Tailwind refused the stylesheet"),
								onDismiss: () => Se(null),
								children: D.message
							}), Je]
						})
					}), /* @__PURE__ */ L("div", {
						className: w("flex min-w-0 flex-col bg-sunken", !S && "max-md:hidden"),
						children: /* @__PURE__ */ L(or, {
							frame: Ce,
							compile: Ae,
							published: O.stylesheet,
							viewport: S ? "phone" : de,
							mode: je ? x : null
						})
					})]
				})
			})
		]
	});
}
function or(e) {
	let { breakpoints: t } = P();
	return /* @__PURE__ */ L(st, {
		...e,
		desktop: t.find((e) => e.name === "lg")?.width ?? 1024
	});
}
export { ar as default };
