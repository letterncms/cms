import { a as e, c as t, d as n, l as r, n as i, s as a, u as o } from "./fields-CKXhwyJc.js";
import { CmsError as s, can as c, invalidate as l, navigate as u, run as d, t as f, timeAgo as p, useAbility as m } from "@letterncms/sdk";
import { useEffect as h, useLayoutEffect as g, useMemo as _, useRef as v, useState as y } from "react";
import { Button as b, EmptyState as ee, Fields as te, Icon as ne, IconButton as x, Menu as re, NEW_COLOR as ie, Notice as ae, Popover as oe, Pressable as se, QueryError as ce, SaveBar as le, Segmented as ue, Spinner as de, Tooltip as S, Topbar as fe, cn as C, confirm as pe, copyText as w, deviceWidths as me, prompt as T, toast as E, useShortcut as he, useTheme as ge } from "@letterncms/ui";
import { ARTICLE as D, ColorPicker as _e, FIELDS as ve, InspectorSection as ye, PanelFields as be, SCHEME as xe, SPACING_STEPS as O, SchemeTile as k, Specimen as A, StyleBar as Se, StylePanels as Ce, Stylesheet as we, StylingProvider as Te, Swatch as Ee, lightDark as De, loadCompiler as Oe, loadEngine as ke, loadTailwindTheme as Ae, parseClass as j, schemesOf as je, screenFor as Me, styleApi as M, styleLabel as N, styleSample as Ne, themeDefaults as Pe, useSpecimenSheet as P, useStyling as F, withVariants as Fe } from "@letterncms/blocks";
import { Fragment as I, jsx as L, jsxs as R } from "react/jsx-runtime";
// admin/src/history.ts
var Ie = 700;
function Le(e, t, n) {
	let r = v({
		past: [],
		future: [],
		at: 0
	}), i = v(void 0), a = v(!1), [, o] = y(0);
	h(() => {
		let t = i.current;
		if (i.current = e, e === void 0 || t === void 0 || n(t, e)) return;
		if (a.current) {
			a.current = !1;
			return;
		}
		let s = Date.now();
		(s - r.current.at > Ie || r.current.past.length === 0) && r.current.past.push(t), r.current.at = s, r.current.future = [], o((e) => e + 1);
	}, [e, n]);
	let s = (e, n) => {
		let s = e.pop();
		s !== void 0 && i.current !== void 0 && (n.push(i.current), r.current.at = 0, a.current = !0, t(s), o((e) => e + 1));
	};
	return {
		undo: () => s(r.current.past, r.current.future),
		redo: () => s(r.current.future, r.current.past),
		canUndo: r.current.past.length > 0,
		canRedo: r.current.future.length > 0
	};
}
// admin/src/parts.tsx
var Re = (e, t) => e.variables().filter((e) => e.name === t || e.name.startsWith(`${t}--`)).map((e) => e.name);
function z(e, ...t) {
	return t.some((t) => [.../* @__PURE__ */ new Set([...Re(e.sheet, t), ...Re(e.saved, t)])].some((t) => (e.sheet.variable(t) ?? null) !== (e.saved.variable(t) ?? null)));
}
function ze(e, ...t) {
	e.change((n) => t.flatMap((t) => [.../* @__PURE__ */ new Set([...Re(n, t), ...Re(e.saved, t)])]).reduce((t, n) => t.setVariable(n, e.saved.variable(n) ?? null), n));
}
function B(e, { copy: t, revert: n, extra: r = [], own: i = [] }) {
	return [
		[...t ? [{
			label: f("Copy Name"),
			icon: "copy",
			onSelect: () => void w(t, { copied: f("Copied {reference}", { reference: t }) })
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
var V = ({ items: e }) => e.length > 0 ? /* @__PURE__ */ L(re, {
	trigger: /* @__PURE__ */ L(x, {
		icon: "more",
		label: f("Actions"),
		size: "xs",
		className: "cms-reveal shrink-0"
	}),
	items: e
}) : /* @__PURE__ */ L(Ve, {}), Be = "cms-reveal-row px-3", Ve = () => /* @__PURE__ */ L("span", { className: "size-6 shrink-0" }), He = ({ on: e }) => e ? /* @__PURE__ */ L("span", {
	role: "img",
	"aria-label": f("Unsaved changes"),
	className: "size-1.5 shrink-0 rounded-full bg-focus"
}) : null, Ue = ({ on: e, label: t }) => e ? /* @__PURE__ */ L(S, {
	content: t ?? f("Built In"),
	children: /* @__PURE__ */ L("span", {
		role: "img",
		"aria-label": t ?? f("Built In"),
		className: "pointer-events-auto relative grid shrink-0 place-items-center text-faint",
		children: /* @__PURE__ */ L(ne, {
			name: "lock",
			size: 12
		})
	})
}) : null, We = ({ children: e, locked: t, changed: n, className: r }) => /* @__PURE__ */ R("span", {
	className: C("flex min-w-0 items-center gap-1.5 text-sm text-text", r),
	children: [
		/* @__PURE__ */ L("span", {
			className: "truncate",
			children: e
		}),
		/* @__PURE__ */ L(Ue, { on: !!t }),
		/* @__PURE__ */ L(He, { on: !!n })
	]
});
function H({ title: e, onAdd: t, addLabel: n, action: r, plain: i, children: a }) {
	return /* @__PURE__ */ R("section", {
		className: "mb-7",
		children: [
			e && /* @__PURE__ */ R("div", {
				className: "flex h-9 items-center gap-2 pl-0.5 pr-3",
				children: [
					/* @__PURE__ */ L("h3", {
						className: "cms-label m-0 min-w-0 flex-1 truncate",
						children: e
					}),
					r,
					t && n && /* @__PURE__ */ L(S, {
						content: n,
						children: /* @__PURE__ */ L(x, {
							icon: "plus",
							label: n,
							title: void 0,
							size: "xs",
							onClick: t
						})
					})
				]
			}),
			i ? a : /* @__PURE__ */ L("div", {
				className: "divide-y divide-border overflow-hidden rounded-lg border border-border bg-bg",
				children: a
			}),
			!e && (r || t && n) && /* @__PURE__ */ L("div", {
				className: "flex h-9 items-center",
				children: r ?? /* @__PURE__ */ L(b, {
					variant: "ghost",
					size: "xs",
					icon: "plus",
					onClick: t,
					className: "-ml-1.5 !px-1.5 !font-normal !text-muted hover:!text-ink",
					children: n
				})
			})
		]
	});
}
function U({ handle: e, label: t, value: n, onChange: r, field: i, disabled: a, className: o }) {
	return /* @__PURE__ */ L(te, {
		bare: !0,
		className: C("flex min-w-0 flex-1", o),
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
		className: Be,
		children: [/* @__PURE__ */ R("div", {
			className: "flex min-h-10 items-center gap-2 py-1.5",
			children: [
				t !== void 0 && /* @__PURE__ */ L("span", {
					className: "grid w-7 shrink-0 place-items-center",
					children: t
				}),
				/* @__PURE__ */ L(We, {
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
				/* @__PURE__ */ L(V, { items: s })
			]
		}), r]
	});
}
function Ge({ label: e, changed: t, menu: n, children: r }) {
	return /* @__PURE__ */ R("div", {
		className: C(Be, "flex min-h-10 items-center gap-2 py-1.5"),
		children: [
			/* @__PURE__ */ L(We, {
				changed: t,
				className: "w-[120px] shrink-0 max-sm:w-20",
				children: e
			}),
			/* @__PURE__ */ L("div", {
				className: "flex w-56 min-w-0 shrink items-center max-lg:w-48 max-sm:w-auto max-sm:flex-1",
				children: r
			}),
			/* @__PURE__ */ L("span", { className: "min-w-0 flex-1 max-sm:hidden" }),
			/* @__PURE__ */ L(V, { items: n })
		]
	});
}
function Ke({ onOpen: e, label: t, sample: n, detail: r, locked: i, changed: a, menu: o = [] }) {
	return /* @__PURE__ */ R("div", {
		className: C("cms-reveal-row relative flex items-center gap-2 px-3 py-1.5 transition-colors duration-base hover:bg-hover", n ? "min-h-12" : "min-h-10"),
		children: [
			/* @__PURE__ */ L(se, {
				inset: !0,
				onClick: e,
				"aria-label": t,
				className: "absolute inset-0"
			}),
			/* @__PURE__ */ L(We, {
				locked: i,
				changed: a,
				className: C("pointer-events-none", n ? "w-28 shrink-0 max-sm:w-20" : "flex-1"),
				children: t
			}),
			n && /* @__PURE__ */ L("span", {
				className: "pointer-events-none flex min-w-0 flex-1",
				children: n
			}),
			r !== void 0 && /* @__PURE__ */ L("span", {
				className: "pointer-events-none shrink-0 text-xs tabular-nums text-muted",
				children: r
			}),
			/* @__PURE__ */ L("span", {
				className: "relative flex",
				children: /* @__PURE__ */ L(V, { items: o })
			}),
			/* @__PURE__ */ L(ne, {
				name: "chevron-right",
				size: 14,
				className: "pointer-events-none shrink-0 text-faint"
			})
		]
	});
}
// admin/src/preview.tsx
var qe = {
	desktop: "100%",
	tablet: `${me.tablet}px`,
	phone: `${me.phone}px`
};
function Je(e, t) {
	let [n, r] = y({
		source: void 0,
		compiler: null,
		problem: null
	}), i = v({
		base: e,
		css: t
	});
	i.current = {
		base: e,
		css: t
	};
	let a = v(!1), o = v({}), s = v(!1), c = v(!0);
	h(() => (c.current = !0, () => {
		c.current = !1;
	}), []);
	let l = !!n.source;
	return h(() => {
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
							let n = await Oe(t);
							if (n.build(e.base.candidates), !await ke(t)) throw Error(f("Tailwind could not read the stylesheet."));
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
function Ye({ viewport: e, desktop: t, children: n }) {
	let r = v(null), [i, a] = y({
		width: 0,
		height: 0
	});
	h(() => {
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
	let o = e === "desktop" ? Math.max(i.width, t) : parseFloat(qe[e]), s = i.width ? Math.min(1, i.width / o) : 1;
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
var Xe = "cms-styling-draft";
function Ze(e, t, n, r) {
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
	let l = e.getElementById(Xe);
	l || (l = e.createElement("style"), l.id = Xe, o[0] ? o[0].after(l) : e.head.appendChild(l)), l.textContent !== c && (l.textContent = c);
	for (let e of o) e.disabled = !0;
}
var Qe = "border-0 bg-bg md:rounded-md md:shadow-sheet";
function $e({ frame: e, compile: t, published: n, viewport: r, desktop: i, mode: a }) {
	let [o, s] = y(0);
	return h(() => Ze(e.current?.contentDocument, t, n, a), [
		e,
		t,
		n,
		a,
		o
	]), /* @__PURE__ */ R("div", {
		className: "relative flex min-h-0 flex-1 flex-col md:p-4",
		children: [/* @__PURE__ */ L(Ye, {
			viewport: r,
			desktop: i,
			children: (t) => /* @__PURE__ */ L("iframe", {
				ref: e,
				src: "/",
				title: f("Site Preview"),
				className: Qe,
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
// admin/src/styles.tsx
var et = (e) => e.replace(/^!|!$/g, ""), tt = (e) => e.split(/\s+/).filter(Boolean), nt = (e) => e.elements().find((e) => e.name === "body")?.classes.join(" ") ?? "", rt = [
	"typography",
	"spacing",
	"fill",
	"border",
	"effects",
	"transition"
], it = () => [
	{
		id: "body",
		selector: "body",
		label: f("Page"),
		node: {
			tag: "p",
			text: f("Page")
		},
		groups: ["typography", "fill"]
	},
	{
		id: "h1",
		selector: "h1",
		label: f("Heading 1"),
		node: {
			tag: "h1",
			text: f("Heading 1")
		}
	},
	{
		id: "h2",
		selector: "h2",
		label: f("Heading 2"),
		node: {
			tag: "h2",
			text: f("Heading 2")
		}
	},
	{
		id: "h3",
		selector: "h3",
		label: f("Heading 3"),
		node: {
			tag: "h3",
			text: f("Heading 3")
		}
	},
	{
		id: "h4",
		selector: "h4",
		label: f("Heading 4"),
		node: {
			tag: "h4",
			text: f("Heading 4")
		}
	},
	{
		id: "h5",
		selector: "h5",
		label: f("Heading 5"),
		node: {
			tag: "h5",
			text: f("Heading 5")
		}
	},
	{
		id: "h6",
		selector: "h6",
		label: f("Heading 6"),
		node: {
			tag: "h6",
			text: f("Heading 6")
		}
	},
	{
		id: "p",
		selector: "p",
		label: f("Paragraph"),
		node: {
			tag: "p",
			text: f("Paragraph")
		}
	},
	{
		id: "a",
		selector: "a",
		label: f("Link"),
		node: {
			tag: "a",
			text: f("Link"),
			attributes: { href: "#" }
		}
	},
	{
		id: "strong",
		selector: "strong",
		label: f("Bold"),
		node: {
			tag: "strong",
			text: f("Bold")
		}
	},
	{
		id: "small",
		selector: "small",
		label: f("Small"),
		node: {
			tag: "small",
			text: f("Small")
		}
	},
	{
		id: "blockquote",
		selector: "blockquote",
		label: f("Quote"),
		node: {
			tag: "blockquote",
			text: f("Quote")
		}
	},
	{
		id: "code",
		selector: "code",
		label: f("Code"),
		node: {
			tag: "code",
			text: f("Code")
		}
	},
	{
		id: "figcaption",
		selector: "figcaption",
		label: f("Caption"),
		node: {
			tag: "figcaption",
			text: f("Caption")
		}
	},
	{
		id: "hr",
		selector: "hr",
		label: f("Divider"),
		node: {
			tag: "hr",
			text: "",
			className: "w-40"
		},
		groups: [
			"border",
			"spacing",
			"size"
		]
	},
	{
		id: "selection",
		selector: "::selection",
		label: f("Selection"),
		node: {
			tag: "span",
			text: f("Selection")
		},
		groups: ["typography", "fill"]
	},
	{
		id: "focus",
		selector: ":focus-visible",
		label: f("Focus Ring"),
		node: {
			tag: "span",
			text: f("Focus Ring"),
			className: "inline-block rounded-sm px-2"
		},
		groups: ["border", "effects"]
	}
], G = (e) => ({
	tag: "div",
	text: "",
	markup: `<div class="cms-prose">${e}</div>`
}), at = () => [
	{
		id: "h2",
		key: "h2",
		selector: D.h2,
		label: f("Heading 2"),
		node: G(`<h2 style="margin:0">${f("Heading 2")}</h2>`)
	},
	{
		id: "h3",
		key: "h3",
		selector: D.h3,
		label: f("Heading 3"),
		node: G(`<h3 style="margin:0">${f("Heading 3")}</h3>`)
	},
	{
		id: "p",
		key: "p",
		selector: D.p,
		label: f("Paragraph"),
		node: G(`<p style="margin:0">${f("Paragraph")}</p>`)
	},
	{
		id: "li",
		key: "li",
		selector: D.li,
		label: f("List Item"),
		node: G(`<ul><li>${f("List Item")}</li></ul>`)
	},
	{
		id: "blockquote",
		key: "blockquote",
		selector: D.blockquote,
		label: f("Quote"),
		node: G(`<blockquote style="margin:0">${f("Quote")}</blockquote>`)
	},
	{
		id: "figure",
		key: "figure",
		selector: D.figure,
		label: f("Figure"),
		node: G(`<figure style="margin:0">${f("Figure")}</figure>`),
		groups: [
			"spacing",
			"border",
			"effects"
		]
	},
	{
		id: "a",
		key: "a",
		selector: D.a,
		label: f("Link"),
		node: G(`<p><a href="#">${f("Link")}</a></p>`)
	}
];
function ot(e, t, n) {
	let r = (e) => {
		let { variants: r, utility: i } = j(e);
		return et(i) === t ? Fe(r, i.replace(t, n)) : e;
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
var st = (e) => String(e ?? "").trim().toLowerCase().replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/^-+|-+$/g, "");
async function ct(e, t, n, r, i = "", a = "", o) {
	let s = await T({
		title: n,
		fields: [{
			handle: "name",
			type: "text",
			label: f("Name"),
			placeholder: i ? "outline" : "lead",
			required: !0,
			autofocus: !0
		}, ...o ? [{
			handle: "group",
			type: "text",
			label: f("Group"),
			placeholder: f("Cards"),
			suggestions: o
		}] : []],
		values: { name: a ? N(a) : "" },
		confirm: r
	}), c = st(s?.name);
	if (!c) return null;
	let l = `${i}${c}`;
	if (l === a) return null;
	if (!/^[a-z][a-z0-9-]*$/.test(l)) return E.error(f("A name is lowercase letters, numbers and hyphens, and starts with a letter.")), null;
	if (t.includes(l) || e?.valid(l)) return E.error(f("There is already a style “{name}”.", { name: N(l) })), null;
	let u = String(s?.group ?? "").trim();
	return u && Lt(u) ? null : {
		name: l,
		group: u || null
	};
}
function lt({ edit: e, samples: t, name: n, selector: r, node: i, classes: a, groups: o, write: s, menu: c }) {
	let l = F(), [u, d] = y([]), f = _(() => Me(t.device, 1280, l.breakpoints), [t.device, l.breakpoints]), p = M(l.engine, a, f, u, e.readOnly ? () => {} : s), m = nt(e.sheet), h = P(t.compiler, [
		...tt(m),
		...a.map((e) => et(j(e).utility)),
		...a,
		...tt(i.className ?? "")
	]);
	return /* @__PURE__ */ R("div", {
		className: "-mx-4 -mt-2",
		children: [
			/* @__PURE__ */ L("div", {
				className: "sticky top-0 z-raised bg-bg",
				children: /* @__PURE__ */ L(Se, {
					s: p,
					site: l.classes,
					source: l.source,
					disabled: e.readOnly,
					state: {
						classes: a,
						engine: l.engine,
						state: u,
						onState: d
					},
					lead: /* @__PURE__ */ L(ut, {
						name: n,
						selector: r
					}),
					actions: /* @__PURE__ */ L(dt, { menu: c })
				})
			}),
			/* @__PURE__ */ L("div", {
				className: "border-b border-border p-4",
				children: /* @__PURE__ */ L(A, {
					sheet: h,
					node: i,
					page: m,
					mode: e.mode,
					align: "center",
					className: "h-28 rounded-md border border-border"
				})
			}),
			/* @__PURE__ */ L("div", {
				inert: e.readOnly,
				children: /* @__PURE__ */ L(Ce, {
					s: p,
					groups: o
				})
			})
		]
	});
}
function ut({ name: e, selector: t }) {
	return /* @__PURE__ */ L("div", {
		className: "flex min-h-8 min-w-0 flex-1 items-center",
		children: e ? /* @__PURE__ */ L(S, {
			content: f("Copy Name"),
			children: /* @__PURE__ */ L(b, {
				variant: "ghost",
				size: "xs",
				onClick: () => void w(e, { copied: f("Copied {reference}", { reference: e }) }),
				className: "min-w-0 shrink !px-1.5 font-mono !font-normal !text-muted hover:!text-ink",
				children: /* @__PURE__ */ R("span", {
					className: "truncate",
					children: [".", e]
				})
			})
		}) : t && /* @__PURE__ */ L("span", {
			className: "min-w-0 truncate px-1.5 font-mono text-xs text-muted",
			children: t
		})
	});
}
var dt = ({ menu: e }) => e && e.length > 0 ? /* @__PURE__ */ L(re, {
	align: "end",
	trigger: /* @__PURE__ */ L(x, {
		icon: "more",
		label: f("Style Actions"),
		size: "sm"
	}),
	items: e
}) : null, K = (e, t) => ({
	property: e,
	label: t,
	field: {
		type: "color",
		component: "blocks-color"
	}
}), q = (e, t, n = "px", r = ["px", "rem"]) => ({
	property: e,
	label: t,
	field: {
		component: "blocks-value",
		unit: n,
		units: r,
		min: 0,
		step: n === "px" ? 1 : .125
	}
}), ft = () => ({
	"var(--font-weight-normal)": f("Regular"),
	"var(--font-weight-medium)": f("Medium"),
	"var(--font-weight-semibold)": f("Semibold"),
	"var(--font-weight-bold)": f("Bold")
}), pt = () => [
	{
		key: "fields",
		label: f("Fields"),
		selector: ve,
		layer: "base",
		sample: {
			tag: "div",
			text: "",
			markup: mt()
		},
		sections: [
			{
				title: f("Field"),
				values: [
					K("--field-background", f("Fill")),
					K("--field-color", f("Text")),
					K("--field-placeholder", f("Placeholder")),
					q("--field-border-width", f("Border")),
					K("--field-border-color", f("Border Color")),
					q("--field-radius", f("Radius"), "rem", ["rem", "px"]),
					{
						property: "--field-shadow",
						label: f("Shadow"),
						field: { component: "site-shadow" }
					}
				]
			},
			{
				title: f("Pointed At"),
				values: [K("--field-hover-background", f("Fill")), K("--field-hover-border-color", f("Border Color"))]
			},
			{
				title: f("Focus"),
				values: [
					K("--field-focus-background", f("Fill")),
					K("--field-focus-border-color", f("Border Color")),
					K("--field-focus-ring-color", f("Ring")),
					q("--field-focus-ring-width", f("Ring Width"))
				]
			},
			{
				title: f("Error"),
				values: [K("--field-invalid-color", f("Color"))]
			}
		]
	},
	{
		key: "labels",
		label: f("Labels"),
		selector: ve,
		layer: "base",
		sample: {
			tag: "div",
			text: "",
			markup: ht()
		},
		sections: [
			{
				title: f("Label"),
				values: [
					{
						property: "--field-label-font-size",
						label: f("Size"),
						field: { component: "site-size" }
					},
					{
						property: "--field-label-font-weight",
						label: f("Weight"),
						field: {
							type: "select",
							options: ft()
						}
					},
					K("--field-label-color", f("Color"))
				]
			},
			{
				title: f("Help"),
				values: [{
					property: "--field-help-font-size",
					label: f("Size"),
					field: { component: "site-size" }
				}, K("--field-help-color", f("Color"))]
			},
			{
				title: f("Spacing"),
				values: [q("--field-spacing-fields", f("Between Fields"), "rem", ["rem", "px"]), q("--field-spacing-label", f("Under Label"), "rem", ["rem", "px"])]
			}
		]
	},
	{
		key: "choices",
		label: f("Choices"),
		selector: ve,
		layer: "base",
		sample: {
			tag: "div",
			text: "",
			markup: gt()
		},
		sections: [
			{
				title: f("Checkbox"),
				values: [
					q("--field-checkbox-size", f("Size"), "rem", ["rem", "px"]),
					q("--field-checkbox-radius", f("Radius")),
					K("--field-checkbox-checked", f("Checked")),
					K("--field-checkbox-mark-color", f("Mark"))
				]
			},
			{
				title: f("Radio Button"),
				values: [K("--field-radio-checked", f("Checked"))]
			},
			{
				title: f("Switch"),
				values: [K("--field-switch-off", f("Off")), K("--field-switch-on", f("On"))]
			}
		]
	}
], J = (e) => e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"), mt = () => `<div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;width:min(22rem,100%);white-space:normal">
<input class="cms-input" placeholder="${J(f("Text Field"))}" tabindex="-1">
<input class="cms-input" data-cms-state="hover" placeholder="${J(f("Pointed At"))}" tabindex="-1">
<input class="cms-input" data-cms-state="focus" placeholder="${J(f("Focused"))}" tabindex="-1">
<input class="cms-input" aria-invalid="true" value="${J(f("Invalid"))}" tabindex="-1">
<textarea class="cms-input" rows="2" placeholder="${J(f("Text Area"))}" tabindex="-1" style="grid-column:1/-1"></textarea>
<select class="cms-input" tabindex="-1" style="grid-column:1/-1"><option>${J(f("Dropdown"))}</option></select>
</div>`, ht = () => `<div class="cms-form" style="width:min(18rem,100%);white-space:normal">
<div class="cms-field"><label class="cms-label">${J(f("Name"))}</label><input class="cms-input" tabindex="-1"><p class="cms-help">${J(f("As it appears on your order."))}</p></div>
<div class="cms-field"><label class="cms-label">${J(f("Email"))}</label><input class="cms-input" tabindex="-1"><p class="cms-help">${J(f("We never share it."))}</p></div>
</div>`, gt = () => `<div style="display:grid;grid-template-columns:repeat(3,auto);gap:.75rem 1.5rem;white-space:nowrap">
<label class="cms-choice"><input type="checkbox" class="cms-check" checked tabindex="-1"> ${J(f("Checked"))}</label>
<label class="cms-choice"><input type="radio" class="cms-radio" checked tabindex="-1"> ${J(f("Chosen"))}</label>
<label class="cms-choice"><input type="checkbox" role="switch" class="cms-switch" checked tabindex="-1"> ${J(f("On"))}</label>
<label class="cms-choice"><input type="checkbox" class="cms-check" tabindex="-1"> ${J(f("Unchecked"))}</label>
<label class="cms-choice"><input type="radio" class="cms-radio" tabindex="-1"> ${J(f("Not Chosen"))}</label>
<label class="cms-choice"><input type="checkbox" role="switch" class="cms-switch" tabindex="-1"> ${J(f("Off"))}</label>
</div>`, _t = () => ({
	key: "spacing",
	label: f("Spacing"),
	selector: D.spacing,
	layer: "components",
	sample: G(`<h2 style="margin:0">${f("Heading 2")}</h2><p>${f("Paragraph")}</p><p>${f("Paragraph")}</p><ul><li>${f("List Item")}</li><li>${f("List Item")}</li></ul>`),
	sections: [{
		title: "spacing",
		values: [
			q("--prose-blocks", f("Blocks"), "em", [
				"em",
				"rem",
				"px"
			]),
			q("--prose-headings", f("Above Headings"), "em", [
				"em",
				"rem",
				"px"
			]),
			q("--prose-after-headings", f("Below Headings"), "em", [
				"em",
				"rem",
				"px"
			]),
			q("--prose-items", f("List Items"), "em", [
				"em",
				"rem",
				"px"
			])
		]
	}]
});
function vt({ edit: e, samples: t, part: n }) {
	let { source: r } = F(), i = _(() => new we(r?.files.cms ?? ""), [r?.files.cms]), a = nt(e.sheet), o = P(t.compiler, tt(a)), s = (t) => e.sheet.property(n.selector, t, n.layer);
	return /* @__PURE__ */ R("div", {
		className: "-mx-4 -mt-2",
		children: [
			/* @__PURE__ */ L("div", {
				className: "sticky top-0 z-raised flex h-11 items-center justify-end border-b border-border bg-bg px-3",
				children: /* @__PURE__ */ L(dt, { menu: St(e, n) })
			}),
			/* @__PURE__ */ L("div", {
				className: "border-b border-border p-4",
				children: /* @__PURE__ */ L(A, {
					sheet: o,
					node: n.sample,
					page: a,
					mode: e.mode,
					align: "center",
					className: "h-72 rounded-md border border-border"
				})
			}),
			/* @__PURE__ */ L("div", {
				inert: e.readOnly,
				children: n.sections.map((t) => {
					let r = /* @__PURE__ */ L(be, {
						fields: t.values.map((t) => ({
							handle: t.property,
							type: "text",
							size: "sm",
							label: t.label,
							placeholder: f("Default"),
							...t.field,
							status: bt(e, n, t.property) ? "own" : void 0,
							reset: () => e.change((r) => r.setProperty(n.selector, t.property, e.saved.property(n.selector, t.property, n.layer) ?? null, n.layer))
						})),
						values: Object.fromEntries(t.values.map((e) => [e.property, s(e.property) ?? yt(i.property(n.selector, e.property, n.layer))])),
						onChange: (t, r) => e.change((e) => e.setProperty(n.selector, t, r == null || r === "" ? null : String(r), n.layer))
					});
					return n.sections.length === 1 ? /* @__PURE__ */ L("div", {
						className: "space-y-1 px-4 py-3",
						children: r
					}, t.title) : /* @__PURE__ */ L(ye, {
						title: t.title,
						children: r
					}, t.title);
				})
			})
		]
	});
}
var yt = (e) => e && /^(var\(--(?!field-)[\w-]+\)|-?[\d.]+[a-z%]*|#[0-9a-f]{3,8}|[a-z-]+)$/i.test(e.trim()) ? e : null, bt = (e, t, n) => (e.sheet.property(t.selector, n, t.layer) ?? null) !== (e.saved.property(t.selector, n, t.layer) ?? null), xt = (e, t) => t.sections.some((n) => n.values.some((n) => bt(e, t, n.property)));
function St(e, t) {
	let n = t.sections.flatMap((e) => e.values);
	return B(e, { revert: xt(e, t) ? () => e.change((r) => n.reduce((n, r) => n.setProperty(t.selector, r.property, e.saved.property(t.selector, r.property, t.layer) ?? null, t.layer), r)) : null });
}
var Ct = (e, t, n) => e.elements(n).find((e) => e.name === t)?.classes ?? [], wt = (e, t) => e.utilities().find((e) => e.name === t)?.classes, Tt = (e, t, n = "base") => Ct(e.sheet, t, n).join(" ") !== Ct(e.saved, t, n).join(" "), Et = (e, t) => wt(e.sheet, t)?.join(" ") !== wt(e.saved, t)?.join(" "), Dt = [
	"elements",
	"buttons",
	"forms",
	"articles"
], Y = "ungrouped", Ot = [...Dt, Y], kt = (e) => ({
	elements: f("Elements"),
	buttons: f("Buttons"),
	forms: f("Forms"),
	articles: f("Articles")
})[e], At = (e) => e.utilities().filter((e) => /^[a-z][\w-]*$/.test(e.name) && !e.name.startsWith("scheme-")), X = (e) => e.startsWith("btn-");
function jt(e) {
	let t = [];
	for (let n of At(e)) {
		if (!n.group || X(n.name) || t.some((e) => e.name === n.group)) continue;
		let e = st(n.group) || "group", r = e;
		for (let n = 2; Ot.includes(r) || t.some((e) => e.id === r); n++) r = `${e}-${n}`;
		t.push({
			id: r,
			name: n.group
		});
	}
	return t;
}
function Mt(e, t) {
	if (X(t)) return "buttons";
	let n = At(e).find((e) => e.name === t)?.group;
	return jt(e).find((e) => e.name === n)?.id ?? Y;
}
var Z = (e, t) => [
	"/design/styles",
	e,
	t
].filter(Boolean).map((e, t) => t === 0 ? e : encodeURIComponent(e)).join("/");
function Nt(e, t) {
	return t === Y ? f("Ungrouped") : kt(t) ?? jt(e).find((e) => e.id === t)?.name ?? null;
}
function Pt(e, t, n) {
	return t === "elements" ? it().find((e) => e.id === n)?.label ?? null : t === "forms" ? pt().find((e) => e.key === n)?.label ?? null : t === "articles" ? n === "spacing" ? _t().label : at().find((e) => e.id === n)?.label ?? null : At(e).some((e) => e.name === n) ? N(n) : null;
}
function Ft(e, [t, n]) {
	if (!t) return null;
	let r = Nt(e, t);
	if (!r) return null;
	if (!n) return {
		title: r,
		back: {
			to: Z(),
			label: f("Styles")
		}
	};
	let i = Pt(e, t, n);
	return i ? {
		title: i,
		back: {
			to: Z(t),
			label: r
		}
	} : null;
}
async function It(e, t, n, r = "") {
	let i = await T({
		title: t,
		fields: [{
			handle: "group",
			type: "text",
			label: f("Group"),
			placeholder: f("Cards"),
			autofocus: !0,
			suggestions: jt(e).map((e) => e.name)
		}],
		values: { group: r },
		confirm: n
	});
	if (!i) return;
	let a = String(i.group ?? "").trim();
	return a && Lt(a) ? void 0 : a || null;
}
function Lt(e) {
	let t = Ot.includes(st(e)) || Ot.some((t) => (t === Y ? f("Ungrouped") : kt(t))?.toLowerCase() === e.toLowerCase());
	return t && E.error(f("“{name}” is a group the site already has.", { name: e })), t;
}
function Rt({ edit: e, samples: t, path: n }) {
	let { engine: r } = F(), [i, a] = n, o = [...e.sheet.elements(), ...e.sheet.elements("components")], s = (e) => o.find((t) => t.name === e)?.classes ?? [], c = At(e.sheet), l = jt(e.sheet), d = nt(e.sheet), p = P(t.compiler, [
		...tt(d),
		...s("::selection"),
		...s(":focus-visible"),
		...it().flatMap((e) => tt(e.node.className ?? "")),
		...c.map((e) => e.name)
	]), m = e.sheet.utilities().map((e) => e.name), g = (e) => u(e), _ = !!i && !!a && ![
		"elements",
		"forms",
		"articles"
	].includes(i) && c.some((e) => e.name === a) && Mt(e.sheet, a) !== i;
	h(() => {
		_ && u(Z(Mt(e.sheet, a), a), { replace: !0 });
	}, [
		_,
		e.sheet,
		a
	]);
	let v = (e) => ["::selection", ":focus-visible"].includes(e.selector) ? {
		...e.node,
		className: [e.node.className, ...s(e.selector)].filter(Boolean).join(" ")
	} : e.node, y = async (t, n = !1) => {
		let i = t === "buttons", a = await ct(r, m, f(i ? "New Button" : "New Style"), f(i ? "Create Button" : "Create Style"), i ? "btn-" : "", "", n ? l.map((e) => e.name) : void 0);
		if (!a) return;
		let { name: o } = a, s = n ? a.group : l.find((e) => e.id === t)?.name ?? null, u = c.find((e) => X(e.name));
		e.change((e) => i && u ? e.duplicateUtility(u.name, o).setUtilityGroup(o, null) : e.setUtility(o, ["text-base"]).setUtilityGroup(o, s)), g(Z(i ? "buttons" : Y, o));
	}, b = async (t) => {
		let n = (await ct(r, m, f("Rename “{name}”", { name: N(t) }), f("Rename"), X(t) ? "btn-" : "", t))?.name;
		n && (e.change((e) => ot(e, t, n)), a === t && u(Z(i, n), { replace: !0 }));
	}, ee = async (t) => {
		let n = (await ct(r, m, f("Duplicate “{name}”", { name: N(t) }), X(t) ? f("Duplicate Button") : f("Duplicate Style"), X(t) ? "btn-" : ""))?.name;
		n && e.change((e) => e.duplicateUtility(t, n));
	}, te = async (t) => {
		let n = c.find((e) => e.name === t)?.group ?? "", r = await It(e.sheet, f("Move “{name}” to a Group", { name: N(t) }), f("Move Style"), n);
		r !== void 0 && (r ?? "") !== n && e.change((e) => e.setUtilityGroup(t, r));
	}, ne = (t) => {
		e.change((e) => e.removeUtility(t)), a === t && u(Z(i));
	}, x = (t) => B(e, {
		copy: t,
		revert: Et(e, t) && wt(e.saved, t) ? () => e.change((n) => n.setUtility(t, wt(e.saved, t))) : null,
		own: [
			{
				label: f("Rename…"),
				icon: "edit",
				onSelect: () => void b(t)
			},
			{
				label: f("Duplicate…"),
				icon: "copy",
				onSelect: () => void ee(t)
			},
			...X(t) ? [] : [{
				label: f("Move to Group…"),
				icon: "folder",
				onSelect: () => void te(t)
			}],
			{
				label: f("Delete"),
				icon: "trash",
				danger: !0,
				onSelect: () => ne(t)
			}
		]
	}), re = (t, n = "base") => B(e, { revert: Tt(e, t, n) ? () => {
		let r = Ct(e.saved, t, n);
		e.change((e) => r.length > 0 ? e.setElement(t, r, n) : e.removeElement(t, n));
	} : null });
	if (i && a) {
		let n = i === "elements" ? it().find((e) => e.id === a) : void 0;
		if (n) return /* @__PURE__ */ L(lt, {
			edit: e,
			samples: t,
			selector: n.selector,
			node: v(n),
			classes: s(n.selector),
			groups: n.groups ?? rt,
			menu: re(n.selector),
			write: (t) => e.change((e) => e.setElement(n.selector, t))
		}, a);
		let r = i === "articles" ? at().find((e) => e.id === a) : void 0;
		if (r) return /* @__PURE__ */ L(lt, {
			edit: e,
			samples: t,
			selector: r.selector,
			node: r.node,
			classes: s(r.selector),
			groups: r.groups ?? rt,
			menu: re(r.selector, "components"),
			write: (t) => e.change((e) => e.setElement(r.selector, t, "components"))
		}, a);
		let o = i === "forms" ? pt().find((e) => e.key === a) : i === "articles" && a === "spacing" ? _t() : void 0;
		if (o) return /* @__PURE__ */ L(vt, {
			edit: e,
			samples: t,
			part: o
		}, a);
		let l = c.find((e) => e.name === a);
		return l ? /* @__PURE__ */ L(lt, {
			edit: e,
			samples: t,
			name: l.name,
			node: Ne(l.name),
			classes: l.classes,
			menu: x(l.name),
			write: (t) => e.change((e) => t.length > 0 || e.utilities().find((e) => e.name === l.name)?.custom ? e.setUtility(l.name, t) : e.removeUtility(l.name))
		}, a) : null;
	}
	let ie = (t, n, r, i, a) => /* @__PURE__ */ L(Ke, {
		onOpen: () => g(t),
		label: n,
		changed: a,
		menu: i,
		sample: /* @__PURE__ */ L(A, {
			sheet: p,
			node: r,
			page: d,
			mode: e.mode,
			className: "h-12 min-w-0 flex-1 rounded-sm shadow-edge"
		})
	}, t), ae = (t, n) => t.map((t) => ie(Z(n, t.name), N(t.name), X(t.name) ? Ne(t.name) : {
		...Ne(t.name),
		className: `${t.name} inline-block`
	}, x(t.name), Et(e, t.name))), oe = (t, n = !1) => e.readOnly ? void 0 : () => void y(t, n);
	if (i === "elements") return /* @__PURE__ */ L(H, { children: it().map((t) => ie(Z("elements", t.id), t.label, v(t), re(t.selector), Tt(e, t.selector))) });
	if (i === "buttons") return /* @__PURE__ */ L(H, {
		onAdd: oe("buttons"),
		addLabel: f("New Button"),
		children: ae(c.filter((e) => X(e.name)), "buttons")
	});
	if (i === "forms") return /* @__PURE__ */ L(H, { children: pt().map((t) => ie(Z("forms", t.key), t.label, t.sample, St(e, t), xt(e, t))) });
	if (i === "articles") return /* @__PURE__ */ R(H, { children: [ie(Z("articles", "spacing"), _t().label, _t().sample, St(e, _t()), xt(e, _t())), at().map((t) => ie(Z("articles", t.id), t.label, t.node, re(t.selector, "components"), Tt(e, t.selector, "components")))] });
	let se = l.find((e) => e.id === i);
	if (se || i === Y) {
		let t = c.filter((t) => !X(t.name) && Mt(e.sheet, t.name) === i);
		return /* @__PURE__ */ L(H, {
			onAdd: oe(se ? se.id : null),
			addLabel: f("New Style"),
			children: ae(t, i)
		});
	}
	let ce = c.filter((t) => !X(t.name) && Mt(e.sheet, t.name) === Y), le = (t) => t.some((t) => Et(e, t.name)), ue = (t) => B(e, { own: [{
		label: f("Rename…"),
		icon: "edit",
		onSelect: async () => {
			let n = await It(e.sheet, f("Rename Group"), f("Rename"), t);
			n && e.change((e) => e.renameGroup(t, n));
		}
	}, {
		label: f("Delete"),
		icon: "trash",
		danger: !0,
		onSelect: () => e.change((e) => e.renameGroup(t, null))
	}] });
	return /* @__PURE__ */ R(H, {
		onAdd: oe(null, !0),
		addLabel: f("New Style"),
		children: [
			/* @__PURE__ */ L(Ke, {
				onOpen: () => g(Z("elements")),
				label: f("Elements"),
				locked: !0,
				detail: it().length,
				changed: it().some((t) => Tt(e, t.selector))
			}),
			/* @__PURE__ */ L(Ke, {
				onOpen: () => g(Z("buttons")),
				label: f("Buttons"),
				locked: !0,
				detail: c.filter((e) => X(e.name)).length,
				changed: le(c.filter((e) => X(e.name)))
			}),
			/* @__PURE__ */ L(Ke, {
				onOpen: () => g(Z("forms")),
				label: f("Forms"),
				locked: !0,
				detail: pt().length,
				changed: pt().some((t) => xt(e, t))
			}),
			/* @__PURE__ */ L(Ke, {
				onOpen: () => g(Z("articles")),
				label: f("Articles"),
				locked: !0,
				detail: at().length + 1,
				changed: xt(e, _t()) || at().some((t) => Tt(e, t.selector, "components"))
			}),
			l.map((e) => {
				let t = c.filter((t) => t.group === e.name && !X(t.name));
				return /* @__PURE__ */ L(Ke, {
					onOpen: () => g(Z(e.id)),
					label: e.name,
					detail: t.length,
					changed: le(t),
					menu: ue(e.name)
				}, e.id);
			}),
			ce.length > 0 && /* @__PURE__ */ L(Ke, {
				onOpen: () => g(Z(Y)),
				label: f("Ungrouped"),
				detail: ce.length,
				changed: le(ce)
			})
		]
	});
}
// admin/src/theme.tsx
function zt(e, t, n = () => !1) {
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
var Bt = (e) => String(e ?? "").trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/^-+|-+$/g, "");
async function Vt(e, t, n, r, i = "", a = "md") {
	let o = Bt((await T({
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
function Ht(e, t, n, r) {
	let i = n.name.slice(0, n.name.length - n.key.length) + r, a = RegExp(`^(!?.*-)${n.key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}((?:/[^!]+)?!?)$`), o = (e) => {
		let { variants: i, utility: o } = j(e), s = a.exec(o);
		return !s || !t?.declarations(o.replace(/^!|!$/g, ""))?.some((e) => e.value.includes(`var(${n.name})`)) ? e : Fe(i, `${s[1]}${r}${s[2]}`);
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
var Ut = (e, t) => e.variables().filter((e) => e.name === t || e.name.startsWith(`${t}--`)).reduce((e, t) => e.setVariable(t.name, null), e);
function Wt(e, t) {
	let { engine: n } = F();
	return (r, i = []) => B(e, {
		copy: r.key,
		revert: z(e, r.name) ? () => ze(e, r.name) : null,
		extra: i,
		own: r.builtIn ? [] : [{
			label: f("Rename…"),
			icon: "edit",
			onSelect: async () => {
				let i = await Vt(e, t.prefix, f("Rename “{name}”", { name: r.key }), f("Rename"), r.key, t.placeholder);
				i && e.change((e) => Ht(e, n, r, i));
			}
		}, {
			label: f("Delete"),
			icon: "trash",
			danger: !0,
			onSelect: () => e.change((e) => Ut(e, r.name))
		}]
	});
}
function Q({ edit: e, kind: t, row: n }) {
	let r = Wt(e, t), i = async () => {
		let n = await Vt(e, t.prefix, t.add, t.add, "", t.placeholder);
		n && e.change((e) => e.setVariable(`${t.prefix}${n}`, t.start));
	};
	return /* @__PURE__ */ L(H, {
		title: t.title,
		onAdd: e.readOnly ? void 0 : () => void i(),
		addLabel: t.add,
		children: zt(e, t.prefix, t.skip).map((t) => n(t, (n) => n !== null && e.change((e) => e.setVariable(t.name, n)), (e) => r(t, e)))
	});
}
var $ = (e, t = {}) => ({
	component: "blocks-value",
	unit: e,
	...t
}), Gt = { component: "site-size" }, Kt = $("rem", {
	units: [
		"rem",
		"px",
		"em"
	],
	step: .125,
	min: 0
});
function qt({ label: e, value: t, same: n, onChange: r, disabled: i, size: a = "md" }) {
	let { engine: o } = F(), [s, c] = y(!1), l = (e) => De(o ? o.resolve(e) : e).light, u = t ?? n ?? "transparent";
	return /* @__PURE__ */ L(oe, {
		open: s,
		onOpenChange: c,
		align: "end",
		className: "!p-0",
		trigger: /* @__PURE__ */ L("span", {
			className: "group/swatch inline-flex",
			children: /* @__PURE__ */ L(S, {
				content: `${e} · ${t ?? f("Same")}`,
				children: /* @__PURE__ */ L(se, {
					compact: !0,
					"aria-label": e,
					disabled: i,
					className: C("relative shrink-0 rounded-sm outline-offset-2 group-data-[popup-open]/swatch:ring-2 group-data-[popup-open]/swatch:ring-border-strong group-data-[popup-open]/swatch:ring-offset-2 group-data-[popup-open]/swatch:ring-offset-bg", a === "md" ? "size-7" : "size-6"),
					children: /* @__PURE__ */ L(Ee, {
						color: l(u),
						className: C("!size-full !rounded-sm", t === null && "opacity-35")
					})
				})
			})
		}),
		children: /* @__PURE__ */ L(_e, {
			label: e,
			value: t ?? void 0,
			onChange: r,
			clearable: n !== void 0
		})
	});
}
var Jt = (e, t, n, r) => e.writeUtility(t, [{
	name: "--scheme",
	value: n
}, {
	name: "--scheme-text",
	value: r
}], ["scheme"]);
function Yt({ edit: e }) {
	let { engine: t } = F(), n = je(e.sheet), r = (n) => {
		let r = De(t ? t.resolve(n) : n);
		return e.mode === "dark" ? r.dark ?? r.light : r.light;
	}, i = async () => {
		let t = Bt((await T({
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
			e.change((e) => Jt(e, `${xe}${t}`, "var(--color-foreground)", "var(--color-background)"));
		}
	}, a = async (t) => {
		let r = Bt((await T({
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
			e.change((e) => e.renameUtility(t.name, `${xe}${r}`));
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
				children: [/* @__PURE__ */ L(k, {
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
						/* @__PURE__ */ L(He, { on: o(t) }),
						/* @__PURE__ */ L(qt, {
							size: "sm",
							label: f("{name} Background", { name: t.key }),
							value: t.background,
							disabled: e.readOnly,
							onChange: (n) => n && e.change((e) => Jt(e, t.name, n, t.text))
						}),
						/* @__PURE__ */ L(qt, {
							size: "sm",
							label: f("{name} Text", { name: t.key }),
							value: t.text,
							disabled: e.readOnly,
							onChange: (n) => n && e.change((e) => Jt(e, t.name, t.background, n))
						}),
						/* @__PURE__ */ L(V, { items: B(e, {
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
function Xt({ edit: e }) {
	let t = {
		prefix: "--color-",
		title: f("Site Colors"),
		add: f("Add Color"),
		start: ie,
		placeholder: "brand"
	}, n = Wt(e, t), r = zt(e, t.prefix).filter((t) => !(t.builtIn && e.palette.has(t.name) && !t.written)), i = async () => {
		let n = await Vt(e, t.prefix, t.add, t.add, "", t.placeholder);
		n && e.change((e) => e.setVariable(`${t.prefix}${n}`, t.start));
	}, a = (t, n, r) => e.change((e) => e.setVariable(t.name, r && r !== n ? `light-dark(${n}, ${r})` : n));
	return /* @__PURE__ */ R(I, { children: [
		/* @__PURE__ */ L(Zt, { edit: e }),
		/* @__PURE__ */ L(H, {
			title: t.title,
			action: /* @__PURE__ */ R(I, { children: [
				/* @__PURE__ */ L(S, {
					content: f("Light"),
					children: /* @__PURE__ */ L("span", {
						role: "img",
						"aria-label": f("Light"),
						className: "grid w-7 place-items-center text-faint",
						children: /* @__PURE__ */ L(ne, {
							name: "sun",
							size: 13
						})
					})
				}),
				/* @__PURE__ */ L(S, {
					content: f("Dark"),
					children: /* @__PURE__ */ L("span", {
						role: "img",
						"aria-label": f("Dark"),
						className: "grid w-7 place-items-center text-faint",
						children: /* @__PURE__ */ L(ne, {
							name: "moon",
							size: 13
						})
					})
				}),
				e.readOnly && /* @__PURE__ */ L(Ve, {})
			] }),
			onAdd: e.readOnly ? void 0 : () => void i(),
			addLabel: t.add,
			children: r.map((t) => {
				let { light: r, dark: i } = De(t.value);
				return /* @__PURE__ */ R(W, {
					name: t.key,
					locked: t.builtIn,
					changed: z(e, t.name),
					wide: !0,
					menu: n(t),
					children: [/* @__PURE__ */ L(qt, {
						label: f("{name} in Light Mode", { name: t.key }),
						value: r,
						disabled: e.readOnly,
						onChange: (e) => e && a(t, e, i)
					}), /* @__PURE__ */ L(qt, {
						label: f("{name} in Dark Mode", { name: t.key }),
						value: i ?? null,
						same: r,
						disabled: e.readOnly,
						onChange: (e) => a(t, r, e ?? void 0)
					})]
				}, t.name);
			})
		}),
		/* @__PURE__ */ L(Yt, { edit: e })
	] });
}
function Zt({ edit: e }) {
	let { engine: n } = F(), i = (t) => e.sheet.variable(t) ?? e.defaults.get(t), a = (t) => {
		let r = i(t);
		if (!r) return;
		let a = De(n ? n.resolve(r) : r);
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
			].map((e) => /* @__PURE__ */ L("span", { className: C("pointer-events-none absolute bg-border-strong", e) }, e)),
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
function Qt(e) {
	let t = e.flatMap((e) => String(e.weight ?? "400").split(/\s+/).map(Number)).filter((e) => e > 0), n = Math.min(...t), r = Math.max(...t), i = t.length === 0 ? "400" : n === r ? String(n) : `${n}–${r}`;
	return e.some((e) => e.style === "italic") ? `${i} · ${f("Italic")}` : i;
}
var $t = (e, t) => /* @__PURE__ */ L("p", {
	className: "m-0 truncate pb-2.5 text-ink",
	style: {
		fontSize: `min(${e}, 2.75rem)`,
		lineHeight: 1.1,
		fontFamily: t
	},
	children: f("Ship It")
});
function en({ edit: e, fonts: i }) {
	let o = [...new Set(i.faces.map((e) => e.family))], s = new Set(zt(e, "--font-", (e) => e.startsWith("weight-")).map((e) => t(r(e.value)))), c = o.map((e) => {
		let t = i.faces.filter((t) => t.family === e);
		return {
			family: e,
			styles: Qt(t),
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
				below: $t(t.value, u),
				children: /* @__PURE__ */ L(U, {
					handle: t.name,
					label: t.key,
					value: t.value,
					disabled: e.readOnly,
					field: Gt,
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
					].map((e) => /* @__PURE__ */ L("span", { className: C("h-0.5 rounded-full bg-muted", e === 2 && "w-2/3") }, e))
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
var tn = (e, t = Gt) => (n, r, i) => /* @__PURE__ */ L(W, {
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
function nn({ edit: e }) {
	let t = [
		["sm", f("Small")],
		["md", f("Medium")],
		["lg", f("Large")]
	], n = [
		["height", f("Height")],
		["padding", f("Padding")],
		["text", f("Text")]
	], r = (t) => e.sheet.variable(t) ?? e.defaults.get(t) ?? null, i = "w-24 shrink-0 max-sm:min-w-0 max-sm:flex-1";
	return /* @__PURE__ */ R(H, {
		title: f("Buttons and Fields"),
		children: [/* @__PURE__ */ R("div", {
			className: "flex min-h-8 items-center gap-2 px-3 text-2xs text-faint",
			children: [
				/* @__PURE__ */ L("span", { className: "min-w-0 flex-1" }),
				n.map(([e, t]) => /* @__PURE__ */ L("span", {
					className: i,
					children: t
				}, e)),
				/* @__PURE__ */ L("span", { className: "size-6 shrink-0" })
			]
		}), t.map(([t, a]) => {
			let o = n.map(([e]) => `--control-${t}-${e}`), s = z(e, ...o);
			return /* @__PURE__ */ R("div", {
				className: C(Be, "flex min-h-10 items-center gap-2 py-1.5"),
				children: [
					/* @__PURE__ */ R("span", {
						className: "flex min-w-0 flex-1 items-center gap-1.5 text-sm text-text max-sm:w-16 max-sm:flex-none",
						children: [/* @__PURE__ */ L("span", {
							className: "truncate",
							children: a
						}), /* @__PURE__ */ L(He, { on: s })]
					}),
					n.map(([t, n], s) => /* @__PURE__ */ L("div", {
						className: i,
						children: /* @__PURE__ */ L(U, {
							handle: o[s],
							label: `${a} ${n}`,
							value: r(o[s]),
							disabled: e.readOnly,
							field: $("rem", {
								units: ["rem", "px"],
								step: .125,
								min: 0
							}),
							onChange: (t) => t !== null && e.change((e) => e.setVariable(o[s], t))
						})
					}, t)),
					/* @__PURE__ */ L(V, { items: B(e, { revert: s ? () => ze(e, ...o) : null }) })
				]
			}, t);
		})]
	});
}
function rn(e) {
	let t = /^(-?[\d.]+)(rem|px)$/.exec(e.trim());
	return t ? Number(t[1]) * (t[2] === "rem" ? 16 : 1) : null;
}
function an({ step: e }) {
	let t = rn(e);
	return t === null ? null : /* @__PURE__ */ L("div", {
		className: "flex items-end gap-1.5 pb-3 pt-1",
		"aria-hidden": !0,
		children: O.filter((e) => e > 0).map((e) => {
			let n = +(t * e).toFixed(2);
			return /* @__PURE__ */ R("span", {
				className: "flex min-w-0 flex-1 flex-col items-center gap-1",
				title: `${e} · ${n}px`,
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
function on({ edit: e }) {
	let t = {
		prefix: "--spacing-",
		title: f("Spacing"),
		add: f("Add Spacing"),
		start: "2rem",
		placeholder: "gutter"
	}, n = Wt(e, t), r = e.sheet.variable("--spacing"), i = async () => {
		let n = await Vt(e, t.prefix, t.add, t.add, "", t.placeholder);
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
				menu: B(e, { revert: z(e, a.name) ? () => ze(e, a.name) : null }),
				below: /* @__PURE__ */ L(an, { step: a.value }),
				children: /* @__PURE__ */ L(U, {
					handle: "--spacing",
					label: a.key,
					value: a.value,
					disabled: e.readOnly,
					field: Gt,
					onChange: (t) => t !== null && e.change((e) => e.setVariable("--spacing", t))
				})
			}), zt(e, t.prefix).map((t) => tn(e)(t, (n) => n !== null && e.change((e) => e.setVariable(t.name, n)), (e) => n(t, e)))]
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
			row: tn(e)
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
			row: tn(e, Kt)
		}),
		/* @__PURE__ */ L(nn, { edit: e })
	] });
}
function sn({ edit: t }) {
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
			row: tn(t, $("px", {
				units: ["px", "rem"],
				step: 10,
				min: 0
			}))
		})
	] });
}
function cn(e, t) {
	let n = String(e ?? "").trim().match(/^(\d*\.?\d+)\s*(ms|s)?$/);
	if (!n) return t;
	let r = n[2] === "s" ? Number(n[1]) : Number(n[1]) / 1e3;
	return Math.min(2, Math.max(.05, Math.round(r * 1e3) / 1e3));
}
function ln({ edit: e, transition: t, saved: n, onTransition: r }) {
	let a = (t, n) => e.change((e) => e.setVariable(t, n)), o = (t) => e.sheet.variable(t) ?? e.defaults.get(t) ?? null, s = (t) => B(e, {
		copy: t,
		revert: z(e, t) ? () => ze(e, t) : null
	}), c = (i) => B(e, { revert: t[i] === n[i] ? null : () => r({
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
			children: [/* @__PURE__ */ L(Ge, {
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
			}), /* @__PURE__ */ L(Ge, {
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
				/* @__PURE__ */ L(Ge, {
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
				t.type !== "none" && /* @__PURE__ */ L(Ge, {
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
							duration: cn(e, t.duration)
						})
					})
				}),
				/* @__PURE__ */ L(Ge, {
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
var un = {}, dn = [
	"colors",
	"typography",
	"layout",
	"effects",
	"motion",
	"styles"
], fn = (e) => ({
	colors: f("Colors"),
	typography: f("Typography"),
	layout: f("Layout"),
	effects: f("Effects"),
	motion: f("Motion"),
	styles: f("Styles")
})[e], pn = (e, t) => JSON.stringify(e ?? null) === JSON.stringify(t ?? null), mn = /* @__PURE__ */ new Map(), hn = (e, t) => e.css === t.css && pn(e.transition, t.transition);
function gn({ params: e }) {
	let t = m("styling/get", {}, {
		refetchOnWindowFocus: !1,
		retry: !1
	}), n = m("styling/source", {}, {
		refetchOnWindowFocus: !1,
		retry: !1,
		staleTime: 6e4
	}), [r, i] = y(un), [a, ...p] = (e["*"] ?? "").split("/").filter(Boolean), b = dn.includes(a) ? a : null;
	h(() => {
		b || u("/design/colors", { replace: !0 });
	}, [b]);
	let ee = b === "styles" && p.length > 0 && !!t.data && Ft(new we(r.css ?? t.data.css), p) === null;
	h(() => {
		ee && u(Z(), { replace: !0 });
	}, [ee]);
	let [te, ne] = y(ge() === "dark" ? "dark" : "light"), [re, ie] = y(!1), [oe, se] = y(() => window.matchMedia("(max-width: 767px)").matches);
	h(() => {
		let e = window.matchMedia("(max-width: 767px)"), t = () => se(e.matches);
		return e.addEventListener("change", t), () => e.removeEventListener("change", t);
	}, []);
	let w = re && oe, [me, D] = y("desktop"), [_e, ve] = y(!1), [ye, be] = y(null), xe = v(null), O = t.data, k = r.css ?? O?.css, A = r.transition ?? O?.transition, Se = !!O && (r.css !== void 0 && r.css !== O.css || r.transition !== void 0 && !pn(r.transition, O.transition)), Ce = !c("settings.manage"), Ee = _(() => new we(k ?? ""), [k]), De = _(() => new we(O?.css ?? ""), [O?.css]), Oe = Je(n.data, k), ke = _(() => Ee.variables().some((e) => e.value.startsWith("light-dark(")) || /color-scheme\s*:\s*light\s+dark\b/.test(Ee.css), [Ee]), [j, je] = y(null);
	h(() => {
		Ae().then(je);
	}, []);
	let Me = v(null), M = e["*"] ?? "", N = v(M);
	N.current !== M && (Me.current && mn.set(N.current, Me.current.scrollTop), N.current = M);
	let Ne = !!t.data && !!n.data && j !== null;
	g(() => {
		Ne && Me.current && (Me.current.scrollTop = mn.get(M) ?? 0);
	}, [M, Ne]);
	let P = Le(_(() => k !== void 0 && A ? {
		css: k,
		transition: A
	} : void 0, [k, A]), (e) => i({
		css: e.css,
		transition: e.transition
	}), hn);
	he("mod+z", P.undo, P.canUndo && !Ce, f("Undo")), he("mod+shift+z", P.redo, P.canRedo && !Ce, f("Redo"));
	let F = n.data?.files.cms, Fe = _(() => {
		let e = /* @__PURE__ */ new Map();
		for (let t of [...Pe(j ?? ""), ...Pe(F ?? "")]) e.set(t.name, t.value);
		return e;
	}, [j, F]), Ie = _(() => new Set(Pe(j ?? "").filter((e) => e.name.startsWith("--color-")).map((e) => e.name)), [j]), Re = _(() => o(j ?? "", k ?? ""), [j, k]);
	if (h(() => {
		let e = document.createElement("style");
		return e.textContent = (O?.fonts ?? []).map((e) => `@font-face{font-family:"${e.family}";src:url("${/^(https:\/\/|\/)/.test(e.src) ? e.src : `/_cms/fonts/${e.src.split("/").pop()}`}") format("woff2");font-weight:${e.weight ?? "400"};font-style:${e.style ?? "normal"};font-display:swap}`).join("\n"), document.head.appendChild(e), () => e.remove();
	}, [O?.fonts]), !b || t.isLoading || n.isLoading || j === null) return /* @__PURE__ */ L("div", {
		className: "grid h-full place-items-center text-faint",
		children: /* @__PURE__ */ L(de, {})
	});
	if (!O || !n.data || k === void 0 || !A) return /* @__PURE__ */ R("div", {
		className: "flex h-full flex-col",
		children: [/* @__PURE__ */ L(fe, { crumbs: [{ label: fn(b) }] }), /* @__PURE__ */ L(ce, {
			title: f("Couldn’t load the design"),
			onRetry: () => {
				t.refetch(), n.refetch();
			},
			retrying: t.isRefetching || n.isRefetching
		})]
	});
	let z = {
		sheet: Ee,
		saved: De,
		change: (e) => !Ce && i((t) => ({
			...t,
			css: e(new we(t.css ?? O.css)).css
		})),
		readOnly: Ce,
		defaults: Fe,
		palette: Ie,
		keyframes: Re,
		mode: ke ? te : "light"
	}, ze = {
		compiler: Oe.compiler,
		device: w ? "phone" : me
	}, B = b === "styles" ? Ft(Ee, p) : null, V = () => {
		l("styling/"), xe.current?.contentWindow?.location.reload();
	}, Be = async () => {
		if (Se && !_e) {
			ve(!0), be(null);
			try {
				let e = {};
				r.css !== void 0 && r.css !== O.css && (e.css = r.css), r.transition !== void 0 && !pn(r.transition, O.transition) && (e.transition = r.transition), Object.keys(e).length > 0 && await d("styling/update", e), await Promise.all([t.refetch(), n.refetch()]), i(un), xe.current?.contentWindow?.location.reload();
			} catch (e) {
				be({
					message: e instanceof Error ? e.message : String(e),
					refused: e instanceof s && e.type === "invalid_input"
				});
			} finally {
				ve(!1);
			}
		}
	}, Ve = {
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
					return E.success(f("{family} added", { family: t })), V(), {
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
				}), E.success(f("{family} uploaded", { family: a })), V(), {
					family: a,
					fallback: !1
				}) : null;
			} catch (e) {
				return E.error(e), null;
			}
		},
		remove: async (e) => {
			if (await pe({
				title: f("Remove {family}?", { family: e }),
				confirm: f("Remove Font"),
				danger: !0
			})) try {
				await d("styling/update", { fonts: O.fonts.filter((t) => t.family !== e) }), V();
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
				} : r) }), V();
			} catch (e) {
				E.error(e);
			}
		}
	}, He = /* @__PURE__ */ R(I, { children: [
		b === "colors" && /* @__PURE__ */ L(Xt, { edit: z }),
		b === "typography" && /* @__PURE__ */ L(en, {
			edit: z,
			fonts: Ve
		}),
		b === "layout" && /* @__PURE__ */ L(on, { edit: z }),
		b === "effects" && /* @__PURE__ */ L(sn, { edit: z }),
		b === "motion" && /* @__PURE__ */ L(ln, {
			edit: z,
			transition: A,
			saved: O.transition,
			onTransition: (e) => !Ce && i((t) => ({
				...t,
				transition: e
			}))
		}),
		b === "styles" && /* @__PURE__ */ L(Rt, {
			edit: z,
			samples: ze,
			path: p
		})
	] });
	return /* @__PURE__ */ R("div", {
		className: "flex h-full flex-col",
		children: [
			/* @__PURE__ */ L(fe, {
				divided: !0,
				back: B?.back,
				crumbs: [{ label: B?.title ?? fn(b) }],
				actions: /* @__PURE__ */ R(I, { children: [
					/* @__PURE__ */ L("span", {
						className: "md:hidden",
						children: /* @__PURE__ */ L(S, {
							content: f("Preview"),
							children: /* @__PURE__ */ L(x, {
								icon: "eye",
								label: f("Preview"),
								title: void 0,
								active: w,
								"aria-pressed": w,
								onClick: () => ie(!w)
							})
						})
					}),
					!Ce && /* @__PURE__ */ R(I, { children: [
						/* @__PURE__ */ L(S, {
							content: f("Undo"),
							shortcut: "mod+z",
							children: /* @__PURE__ */ L(x, {
								icon: "undo",
								label: f("Undo"),
								title: void 0,
								disabled: !P.canUndo,
								onClick: P.undo
							})
						}),
						/* @__PURE__ */ L(S, {
							content: f("Redo"),
							shortcut: "mod+shift+z",
							children: /* @__PURE__ */ L(x, {
								icon: "redo",
								label: f("Redo"),
								title: void 0,
								disabled: !P.canRedo,
								onClick: P.redo
							})
						}),
						/* @__PURE__ */ L("span", {
							className: "max-sm:hidden",
							children: /* @__PURE__ */ L(_n, { onOpen: (e) => i({
								css: e.css,
								transition: e.transition
							}) })
						})
					] }),
					/* @__PURE__ */ L("span", {
						className: "max-md:hidden",
						children: /* @__PURE__ */ L(ue, {
							size: "xs",
							"aria-label": f("Screen"),
							value: me,
							onChange: D,
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
					ke && /* @__PURE__ */ L(ue, {
						size: "xs",
						className: "max-sm:hidden",
						"aria-label": f("Color Mode"),
						value: te,
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
					/* @__PURE__ */ L(S, {
						content: f("Open Site"),
						children: /* @__PURE__ */ L(x, {
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
				dirty: Se,
				saving: _e,
				error: ye ? ye.refused ? f("The stylesheet was not saved") : ye.message : null,
				onSave: () => void Be(),
				onDiscard: () => {
					i(un), be(null);
				}
			}),
			/* @__PURE__ */ L(Te, {
				source: Oe.source ?? n.data,
				children: /* @__PURE__ */ R("div", {
					className: "grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(320px,380px)_minmax(0,1fr)] xl:grid-cols-[minmax(360px,420px)_minmax(0,1fr)]",
					children: [/* @__PURE__ */ L("div", {
						className: C("flex min-h-0 flex-col border-border md:border-r", w && "max-md:hidden"),
						children: /* @__PURE__ */ R("div", {
							ref: Me,
							onScroll: (e) => mn.set(M, e.currentTarget.scrollTop),
							className: "min-h-0 flex-1 overflow-y-auto px-4 pb-16 pt-2",
							children: [ye?.refused && /* @__PURE__ */ L(ae, {
								tone: "danger",
								className: "mb-3 mt-1",
								title: f("Tailwind refused the stylesheet"),
								onDismiss: () => be(null),
								children: ye.message
							}), He]
						})
					}), /* @__PURE__ */ L("div", {
						className: C("flex min-w-0 flex-col bg-sunken", !w && "max-md:hidden"),
						children: /* @__PURE__ */ L(vn, {
							frame: xe,
							compile: Oe,
							published: O.stylesheet,
							viewport: w ? "phone" : me,
							mode: ke ? te : null
						})
					})]
				})
			})
		]
	});
}
function _n({ onOpen: e }) {
	let [t, n] = y(!1), r = m("styling-versions/list", {}, { enabled: t }), i = async (t) => {
		try {
			e(await d("styling-versions/get", { id: t })), n(!1);
		} catch (e) {
			E.error(e);
		}
	};
	return /* @__PURE__ */ R(oe, {
		open: t,
		onOpenChange: n,
		align: "end",
		className: "w-72 !p-1",
		trigger: /* @__PURE__ */ L("span", { children: /* @__PURE__ */ L(S, {
			content: f("Versions"),
			children: /* @__PURE__ */ L(x, {
				icon: "history",
				label: f("Versions"),
				title: void 0,
				active: t
			})
		}) }),
		children: [/* @__PURE__ */ L("div", {
			className: "cms-label px-2 pb-1 pt-1.5",
			children: f("Versions")
		}), r.isPending ? /* @__PURE__ */ L("div", {
			className: "grid h-16 place-items-center text-faint",
			children: /* @__PURE__ */ L(de, { size: 14 })
		}) : r.isError ? /* @__PURE__ */ L(ce, {
			compact: !0,
			onRetry: () => void r.refetch(),
			retrying: r.isRefetching
		}) : r.data.length === 0 ? /* @__PURE__ */ L(ee, {
			compact: !0,
			icon: "history",
			title: f("No versions yet")
		}) : /* @__PURE__ */ L("div", {
			className: "max-h-80 space-y-px overflow-y-auto",
			children: r.data.map((e) => /* @__PURE__ */ R(se, {
				compact: !0,
				disabled: e.current,
				onClick: () => void i(e.id),
				className: "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm enabled:hover:bg-hover",
				children: [/* @__PURE__ */ R("span", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ L("span", {
						className: "block truncate text-text",
						children: p(e.at)
					}), e.user && /* @__PURE__ */ L("span", {
						className: "block truncate text-xs text-muted",
						children: e.user
					})]
				}), e.current && /* @__PURE__ */ L("span", {
					className: "shrink-0 text-xs text-muted",
					children: f("Current")
				})]
			}, e.id))
		})]
	});
}
function vn(e) {
	let { breakpoints: t } = F();
	return /* @__PURE__ */ L($e, {
		...e,
		desktop: t.find((e) => e.name === "lg")?.width ?? 1024
	});
}
export { gn as default };
