import { a as e, c as t, d as n, l as r, n as i, s as a, u as o } from "./fields-DCCGjhjk.js";
import { CmsError as s, can as c, invalidate as l, navigate as u, run as d, t as f, timeAgo as p, useAbility as m } from "@letterncms/sdk";
import { useEffect as h, useLayoutEffect as ee, useMemo as g, useRef as _, useState as v } from "react";
import { Button as y, EmptyState as te, Fields as ne, Icon as re, IconButton as b, Menu as ie, NEW_COLOR as ae, NoMatches as oe, Notice as se, Popover as x, Pressable as S, QueryError as ce, SaveBar as le, Section as ue, Segmented as de, SettingsPanel as fe, Spinner as pe, Tooltip as C, Topbar as me, cn as w, confirm as he, copyText as ge, deviceWidths as _e, prompt as ve, toast as T, useShortcut as ye, useTheme as be } from "@letterncms/ui";
import { ARTICLE as E, ColorPicker as xe, FIELDS as Se, InspectorSection as D, PanelFields as O, SCHEME as k, SPACING_STEPS as Ce, SchemeTile as A, Specimen as j, StyleBar as we, StylePanels as Te, Stylesheet as Ee, StylingProvider as De, Swatch as Oe, lightDark as M, loadCompiler as ke, loadEngine as Ae, loadTailwindTheme as je, parseClass as N, schemesOf as Me, screenFor as Ne, shownInState as P, styleApi as Pe, styleSample as Fe, themeDefaults as Ie, useSpecimenSheet as Le, useStyling as F, withVariants as I } from "@letterncms/blocks";
import { Fragment as L, jsx as R, jsxs as z } from "react/jsx-runtime";
// admin/src/history.ts
var Re = 700;
function ze(e, t, n) {
	let r = _({
		past: [],
		future: [],
		at: 0
	}), i = _(void 0), a = _(!1), [, o] = v(0);
	h(() => {
		let t = i.current;
		if (i.current = e, e === void 0 || t === void 0 || n(t, e)) return;
		if (a.current) {
			a.current = !1;
			return;
		}
		let s = Date.now();
		(s - r.current.at > Re || r.current.past.length === 0) && r.current.past.push(t), r.current.at = s, r.current.future = [], o((e) => e + 1);
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
var Be = (e, t) => e.variables().filter((e) => e.name === t || e.name.startsWith(`${t}--`)).map((e) => e.name);
function B(e, ...t) {
	return t.some((t) => [.../* @__PURE__ */ new Set([...Be(e.sheet, t), ...Be(e.saved, t)])].some((t) => (e.sheet.variable(t) ?? null) !== (e.saved.variable(t) ?? null)));
}
function Ve(e, ...t) {
	e.change((n) => t.flatMap((t) => [.../* @__PURE__ */ new Set([...Be(n, t), ...Be(e.saved, t)])]).reduce((t, n) => t.setVariable(n, e.saved.variable(n) ?? null), n));
}
function V(e, { copy: t, revert: n, extra: r = [], own: i = [] }) {
	return [
		[...t ? [{
			label: f("Copy Name"),
			icon: "copy",
			onSelect: () => void ge(t, { copied: f("Copied {reference}", { reference: t }) })
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
var He = ({ items: e }) => e.length > 0 ? /* @__PURE__ */ R(ie, {
	trigger: /* @__PURE__ */ R(b, {
		icon: "more",
		label: f("Actions"),
		size: "xs",
		className: "cms-reveal shrink-0"
	}),
	items: e
}) : /* @__PURE__ */ R(We, {}), Ue = "cms-reveal-row", We = () => /* @__PURE__ */ R("span", { className: "size-6 shrink-0" }), Ge = ({ on: e }) => e ? /* @__PURE__ */ R("span", {
	role: "img",
	"aria-label": f("Unsaved changes"),
	className: "size-1.5 shrink-0 rounded-full bg-focus"
}) : null, Ke = ({ on: e, label: t }) => e ? /* @__PURE__ */ R(C, {
	content: t ?? f("Built In"),
	children: /* @__PURE__ */ R("span", {
		role: "img",
		"aria-label": t ?? f("Built In"),
		className: "pointer-events-auto relative grid shrink-0 place-items-center text-faint",
		children: /* @__PURE__ */ R(re, {
			name: "lock",
			size: 12
		})
	})
}) : null, qe = ({ children: e, locked: t, changed: n, className: r }) => /* @__PURE__ */ z("span", {
	className: w("flex min-w-0 items-center gap-1.5 text-sm text-text", r),
	children: [
		/* @__PURE__ */ R("span", {
			className: "truncate",
			children: e
		}),
		/* @__PURE__ */ R(Ke, { on: !!t }),
		/* @__PURE__ */ R(Ge, { on: !!n })
	]
});
function H({ title: e, onAdd: t, addLabel: n, action: r, plain: i, children: a }) {
	let o = t && n && /* @__PURE__ */ R(C, {
		content: n,
		children: /* @__PURE__ */ R(b, {
			icon: "plus",
			label: n,
			title: void 0,
			size: "xs",
			onClick: t
		})
	});
	return /* @__PURE__ */ z(ue, {
		className: "mb-7",
		title: e,
		actions: e && (r || o) ? /* @__PURE__ */ z("span", {
			className: "flex items-center gap-2 pr-4 sm:pr-5",
			children: [r, o]
		}) : void 0,
		children: [i ? a : /* @__PURE__ */ R(fe, {
			className: "overflow-hidden",
			children: a
		}), !e && (r || o) && /* @__PURE__ */ R("div", {
			className: "flex h-9 items-center",
			children: r ?? /* @__PURE__ */ R(y, {
				variant: "ghost",
				size: "xs",
				icon: "plus",
				onClick: t,
				className: "-ml-1.5 !px-1.5 !font-normal !text-muted hover:!text-ink",
				children: n
			})
		})]
	});
}
function U({ handle: e, label: t, value: n, onChange: r, field: i, disabled: a, className: o }) {
	return /* @__PURE__ */ R(ne, {
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
	return /* @__PURE__ */ z("div", {
		className: Ue,
		children: [/* @__PURE__ */ z("div", {
			className: "flex min-h-12 items-center gap-2 py-2",
			children: [
				t !== void 0 && /* @__PURE__ */ R("span", {
					className: "grid w-7 shrink-0 place-items-center",
					children: t
				}),
				/* @__PURE__ */ R(qe, {
					locked: a,
					changed: o,
					className: i ? "flex-1" : t === void 0 ? "w-[120px] shrink-0 max-sm:w-20" : "w-[84px] shrink-0 max-sm:w-20",
					children: e
				}),
				i ? c : /* @__PURE__ */ R("div", {
					className: "flex w-56 min-w-0 shrink gap-1 max-lg:w-48 max-sm:w-auto max-sm:flex-1",
					children: c
				}),
				!i && /* @__PURE__ */ R("span", {
					className: "flex min-w-0 flex-1 items-center max-sm:hidden",
					children: n
				}),
				/* @__PURE__ */ R(He, { items: s })
			]
		}), r]
	});
}
function Je({ label: e, changed: t, menu: n, children: r }) {
	return /* @__PURE__ */ z("div", {
		className: w(Ue, "flex min-h-12 items-center gap-2 py-2"),
		children: [
			/* @__PURE__ */ R(qe, {
				changed: t,
				className: "w-[120px] shrink-0 max-sm:w-20",
				children: e
			}),
			/* @__PURE__ */ R("div", {
				className: "flex w-56 min-w-0 shrink items-center max-lg:w-48 max-sm:w-auto max-sm:flex-1",
				children: r
			}),
			/* @__PURE__ */ R("span", { className: "min-w-0 flex-1 max-sm:hidden" }),
			/* @__PURE__ */ R(He, { items: n })
		]
	});
}
function Ye({ onOpen: e, label: t, sample: n, detail: r, locked: i, changed: a, menu: o = [] }) {
	return /* @__PURE__ */ z("div", {
		className: "cms-reveal-row relative -mx-4 flex min-h-12 items-center gap-2 px-4 py-2 transition-colors duration-base hover:bg-hover sm:-mx-5 sm:px-5",
		children: [
			/* @__PURE__ */ R(S, {
				inset: !0,
				onClick: e,
				"aria-label": t,
				className: "absolute inset-0"
			}),
			/* @__PURE__ */ R(qe, {
				locked: i,
				changed: a,
				className: w("pointer-events-none", n ? "w-28 shrink-0 max-sm:w-20" : "flex-1"),
				children: t
			}),
			n && /* @__PURE__ */ R("span", {
				className: "pointer-events-none flex min-w-0 flex-1",
				children: n
			}),
			r !== void 0 && /* @__PURE__ */ R("span", {
				className: "pointer-events-none shrink-0 text-xs tabular-nums text-muted",
				children: r
			}),
			/* @__PURE__ */ R("span", {
				className: "relative flex",
				children: /* @__PURE__ */ R(He, { items: o })
			}),
			/* @__PURE__ */ R(re, {
				name: "chevron-right",
				size: 14,
				className: "pointer-events-none shrink-0 text-faint"
			})
		]
	});
}
// admin/src/preview.tsx
var Xe = {
	desktop: "100%",
	tablet: `${_e.tablet}px`,
	phone: `${_e.phone}px`
};
function Ze(e, t) {
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
							let n = await ke(t);
							if (n.build(e.base.candidates), !await Ae(t)) throw Error(f("Tailwind could not read the stylesheet."));
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
function Qe({ viewport: e, desktop: t, children: n }) {
	let r = _(null), [i, a] = v({
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
	let o = e === "desktop" ? Math.max(i.width, t) : parseFloat(Xe[e]), s = i.width ? Math.min(1, i.width / o) : 1;
	return /* @__PURE__ */ R("div", {
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
var $e = "cms-styling-draft";
function et(e, t, n, r) {
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
	let l = e.getElementById($e);
	l || (l = e.createElement("style"), l.id = $e, o[0] ? o[0].after(l) : e.head.appendChild(l)), l.textContent !== c && (l.textContent = c);
	for (let e of o) e.disabled = !0;
}
var tt = "border-0 bg-bg md:rounded-md md:shadow-sheet";
function nt({ frame: e, compile: t, published: n, viewport: r, desktop: i, mode: a }) {
	let [o, s] = v(0);
	return h(() => et(e.current?.contentDocument, t, n, a), [
		e,
		t,
		n,
		a,
		o
	]), /* @__PURE__ */ z("div", {
		className: "relative flex min-h-0 flex-1 flex-col md:p-4",
		children: [/* @__PURE__ */ R(Qe, {
			viewport: r,
			desktop: i,
			children: (t) => /* @__PURE__ */ R("iframe", {
				ref: e,
				src: "/",
				title: f("Site Preview"),
				className: tt,
				style: t,
				onLoad: () => s((e) => e + 1)
			})
		}), t.problem && /* @__PURE__ */ R("div", {
			className: "absolute inset-x-3 top-3 rounded-lg bg-bg shadow-raise",
			children: /* @__PURE__ */ R(se, {
				tone: "warning",
				title: f("Tailwind can’t read the stylesheet"),
				children: t.problem
			})
		})]
	});
}
// admin/src/classes.tsx
var rt = (e) => e.replace(/^!|!$/g, ""), it = (e) => e.split(/\s+/).filter(Boolean), at = (e) => e.elements().find((e) => e.name === "body")?.classes.join(" ") ?? "", ot = [
	"typography",
	"spacing",
	"fill",
	"border",
	"effects",
	"transition"
], st = () => [
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
}), ct = () => [
	{
		id: "h2",
		key: "h2",
		selector: E.h2,
		label: f("Heading 2"),
		node: G(`<h2 style="margin:0">${f("Heading 2")}</h2>`)
	},
	{
		id: "h3",
		key: "h3",
		selector: E.h3,
		label: f("Heading 3"),
		node: G(`<h3 style="margin:0">${f("Heading 3")}</h3>`)
	},
	{
		id: "p",
		key: "p",
		selector: E.p,
		label: f("Paragraph"),
		node: G(`<p style="margin:0">${f("Paragraph")}</p>`)
	},
	{
		id: "li",
		key: "li",
		selector: E.li,
		label: f("List Item"),
		node: G(`<ul><li>${f("List Item")}</li></ul>`)
	},
	{
		id: "blockquote",
		key: "blockquote",
		selector: E.blockquote,
		label: f("Quote"),
		node: G(`<blockquote style="margin:0">${f("Quote")}</blockquote>`)
	},
	{
		id: "figure",
		key: "figure",
		selector: E.figure,
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
		selector: E.a,
		label: f("Link"),
		node: G(`<p><a href="#">${f("Link")}</a></p>`)
	}
];
function lt(e, t, n) {
	let r = (e) => {
		let { variants: r, utility: i } = N(e);
		return rt(i) === t ? I(r, i.replace(t, n)) : e;
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
var ut = (e) => String(e ?? "").trim().toLowerCase().replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/^-+|-+$/g, "");
async function dt(e, t, n, r, i = "", a = "", o) {
	let s = await ve({
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
		values: { name: a ? a.slice(i.length) : "" },
		confirm: r
	}), c = ut(s?.name);
	if (!c) return null;
	let l = `${i}${c}`;
	if (l === a) return null;
	if (!/^[a-z][a-z0-9-]*$/.test(l)) return T.error(f("A name is lowercase letters, numbers and hyphens, and starts with a letter.")), null;
	if (t.includes(l) || e?.valid(l)) return T.error(f("There is already a class “{name}”.", { name: l })), null;
	let u = String(s?.group ?? "").trim();
	return u && zt(u) ? null : {
		name: l,
		group: u || null
	};
}
function ft({ edit: e, samples: t, node: n, classes: r, groups: i, write: a, menu: o }) {
	let s = F(), [c, l] = v([]), u = g(() => Ne(t.device, 1280, s.breakpoints), [t.device, s.breakpoints]), d = Pe(s.engine, r, u, c, e.readOnly ? () => {} : a), f = at(e.sheet), p = P(r, c), m = p.length ? {
		...n,
		className: [n.className, ...p].filter(Boolean).join(" ")
	} : n, h = Le(t.compiler, [
		...it(f),
		...r.map((e) => rt(N(e).utility)),
		...r,
		...p,
		...it(n.className ?? "")
	]);
	return /* @__PURE__ */ z("div", {
		className: "-mx-4 -mt-2",
		children: [
			/* @__PURE__ */ R(we, {
				s: d,
				site: s.classes,
				source: s.source,
				disabled: e.readOnly,
				state: {
					classes: r,
					engine: s.engine,
					state: c,
					onState: l
				},
				menu: o,
				saveAs: !1
			}),
			/* @__PURE__ */ R("div", {
				className: "border-b border-border p-4",
				children: /* @__PURE__ */ R(j, {
					sheet: h,
					node: m,
					page: f,
					mode: e.mode,
					align: "center",
					className: "h-28 rounded-md border border-border"
				})
			}),
			/* @__PURE__ */ R("div", {
				inert: e.readOnly,
				children: /* @__PURE__ */ R(Te, {
					s: d,
					groups: i
				})
			})
		]
	});
}
var pt = ({ menu: e }) => e && e.length > 0 ? /* @__PURE__ */ R(ie, {
	align: "end",
	trigger: /* @__PURE__ */ R(b, {
		icon: "more",
		label: f("Class Actions"),
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
}), mt = () => ({
	"var(--font-weight-normal)": f("Regular"),
	"var(--font-weight-medium)": f("Medium"),
	"var(--font-weight-semibold)": f("Semibold"),
	"var(--font-weight-bold)": f("Bold")
}), ht = () => [
	{
		key: "fields",
		label: f("Fields"),
		selector: Se,
		layer: "base",
		sample: {
			tag: "div",
			text: "",
			markup: gt()
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
		selector: Se,
		layer: "base",
		sample: {
			tag: "div",
			text: "",
			markup: _t()
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
							options: mt()
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
		selector: Se,
		layer: "base",
		sample: {
			tag: "div",
			text: "",
			markup: vt()
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
], J = (e) => e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"), gt = () => `<div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;width:min(22rem,100%);white-space:normal">
<input class="cms-input" placeholder="${J(f("Text Field"))}" tabindex="-1">
<input class="cms-input" data-cms-state="hover" placeholder="${J(f("Pointed At"))}" tabindex="-1">
<input class="cms-input" data-cms-state="focus" placeholder="${J(f("Focused"))}" tabindex="-1">
<input class="cms-input" aria-invalid="true" value="${J(f("Invalid"))}" tabindex="-1">
<textarea class="cms-input" rows="2" placeholder="${J(f("Text Area"))}" tabindex="-1" style="grid-column:1/-1"></textarea>
<select class="cms-input" tabindex="-1" style="grid-column:1/-1"><option>${J(f("Dropdown"))}</option></select>
</div>`, _t = () => `<div class="cms-form" style="width:min(18rem,100%);white-space:normal">
<div class="cms-field"><label class="cms-label">${J(f("Name"))}</label><input class="cms-input" tabindex="-1"><p class="cms-help">${J(f("As it appears on your order."))}</p></div>
<div class="cms-field"><label class="cms-label">${J(f("Email"))}</label><input class="cms-input" tabindex="-1"><p class="cms-help">${J(f("We never share it."))}</p></div>
</div>`, vt = () => `<div style="display:grid;grid-template-columns:repeat(3,auto);gap:.75rem 1.5rem;white-space:nowrap">
<label class="cms-choice"><input type="checkbox" class="cms-check" checked tabindex="-1"> ${J(f("Checked"))}</label>
<label class="cms-choice"><input type="radio" class="cms-radio" checked tabindex="-1"> ${J(f("Chosen"))}</label>
<label class="cms-choice"><input type="checkbox" role="switch" class="cms-switch" checked tabindex="-1"> ${J(f("On"))}</label>
<label class="cms-choice"><input type="checkbox" class="cms-check" tabindex="-1"> ${J(f("Unchecked"))}</label>
<label class="cms-choice"><input type="radio" class="cms-radio" tabindex="-1"> ${J(f("Not Chosen"))}</label>
<label class="cms-choice"><input type="checkbox" role="switch" class="cms-switch" tabindex="-1"> ${J(f("Off"))}</label>
</div>`, yt = () => ({
	key: "spacing",
	label: f("Spacing"),
	selector: E.spacing,
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
function bt({ edit: e, samples: t, part: n }) {
	let { source: r } = F(), i = g(() => new Ee(r?.files.cms ?? ""), [r?.files.cms]), a = at(e.sheet), o = Le(t.compiler, it(a)), s = (t) => e.sheet.property(n.selector, t, n.layer);
	return /* @__PURE__ */ z("div", {
		className: "-mx-4 -mt-2",
		children: [
			/* @__PURE__ */ R("div", {
				className: "flex h-11 items-center justify-end border-b border-border px-3",
				children: /* @__PURE__ */ R(pt, { menu: wt(e, n) })
			}),
			/* @__PURE__ */ R("div", {
				className: "border-b border-border p-4",
				children: /* @__PURE__ */ R(j, {
					sheet: o,
					node: n.sample,
					page: a,
					mode: e.mode,
					align: "center",
					className: "h-72 rounded-md border border-border"
				})
			}),
			/* @__PURE__ */ R("div", {
				inert: e.readOnly,
				children: n.sections.map((t) => {
					let r = /* @__PURE__ */ R(O, {
						fields: t.values.map((t) => ({
							handle: t.property,
							type: "text",
							size: "sm",
							label: t.label,
							placeholder: f("Default"),
							...t.field,
							status: St(e, n, t.property) ? "own" : void 0,
							reset: () => e.change((r) => r.setProperty(n.selector, t.property, e.saved.property(n.selector, t.property, n.layer) ?? null, n.layer))
						})),
						values: Object.fromEntries(t.values.map((e) => [e.property, s(e.property) ?? xt(i.property(n.selector, e.property, n.layer))])),
						onChange: (t, r) => e.change((e) => e.setProperty(n.selector, t, r == null || r === "" ? null : String(r), n.layer))
					});
					return n.sections.length === 1 ? /* @__PURE__ */ R("div", {
						className: "space-y-1 px-4 py-3",
						children: r
					}, t.title) : /* @__PURE__ */ R(D, {
						title: t.title,
						children: r
					}, t.title);
				})
			})
		]
	});
}
var xt = (e) => e && /^(var\(--(?!field-)[\w-]+\)|-?[\d.]+[a-z%]*|#[0-9a-f]{3,8}|[a-z-]+)$/i.test(e.trim()) ? e : null, St = (e, t, n) => (e.sheet.property(t.selector, n, t.layer) ?? null) !== (e.saved.property(t.selector, n, t.layer) ?? null), Ct = (e, t) => t.sections.some((n) => n.values.some((n) => St(e, t, n.property)));
function wt(e, t) {
	let n = t.sections.flatMap((e) => e.values);
	return V(e, { revert: Ct(e, t) ? () => e.change((r) => n.reduce((n, r) => n.setProperty(t.selector, r.property, e.saved.property(t.selector, r.property, t.layer) ?? null, t.layer), r)) : null });
}
var Tt = (e, t, n) => e.elements(n).find((e) => e.name === t)?.classes ?? [], Et = (e, t) => e.utilities().find((e) => e.name === t)?.classes, Dt = (e, t, n = "base") => Tt(e.sheet, t, n).join(" ") !== Tt(e.saved, t, n).join(" "), Ot = (e, t) => Et(e.sheet, t)?.join(" ") !== Et(e.saved, t)?.join(" "), kt = [
	"elements",
	"buttons",
	"forms",
	"articles"
], Y = "ungrouped", At = [...kt, Y], jt = (e) => ({
	elements: f("Elements"),
	buttons: f("Buttons"),
	forms: f("Forms"),
	articles: f("Articles")
})[e], Mt = (e) => e.utilities().filter((e) => /^[a-z][\w-]*$/.test(e.name) && !e.name.startsWith("scheme-")), X = (e) => e.startsWith("btn-");
function Nt(e) {
	let t = [];
	for (let n of Mt(e)) {
		if (!n.group || X(n.name) || t.some((e) => e.name === n.group)) continue;
		let e = ut(n.group) || "group", r = e;
		for (let n = 2; At.includes(r) || t.some((e) => e.id === r); n++) r = `${e}-${n}`;
		t.push({
			id: r,
			name: n.group
		});
	}
	return t;
}
function Pt(e, t) {
	if (X(t)) return "buttons";
	let n = Mt(e).find((e) => e.name === t)?.group;
	return Nt(e).find((e) => e.name === n)?.id ?? Y;
}
var Z = (e, t) => [
	"/design/classes",
	e,
	t
].filter(Boolean).map((e, t) => t === 0 ? e : encodeURIComponent(e)).join("/");
function Ft(e, t) {
	return t === Y ? f("Ungrouped") : jt(t) ?? Nt(e).find((e) => e.id === t)?.name ?? null;
}
function It(e, t, n) {
	return t === "elements" ? st().find((e) => e.id === n)?.label ?? null : t === "forms" ? ht().find((e) => e.key === n)?.label ?? null : t === "articles" ? n === "spacing" ? yt().label : ct().find((e) => e.id === n)?.label ?? null : Mt(e).some((e) => e.name === n) ? n : null;
}
function Lt(e, [t, n]) {
	if (!t) return null;
	let r = Ft(e, t);
	if (!r) return null;
	if (!n) return [{
		label: f("Classes"),
		to: Z()
	}, { label: r }];
	let i = It(e, t, n);
	return i ? [
		{
			label: f("Classes"),
			to: Z()
		},
		{
			label: r,
			to: Z(t)
		},
		{ label: i }
	] : null;
}
async function Rt(e, t, n, r = "") {
	let i = await ve({
		title: t,
		fields: [{
			handle: "group",
			type: "text",
			label: f("Group"),
			placeholder: f("Cards"),
			autofocus: !0,
			suggestions: Nt(e).map((e) => e.name)
		}],
		values: { group: r },
		confirm: n
	});
	if (!i) return;
	let a = String(i.group ?? "").trim();
	return a && zt(a) ? void 0 : a || null;
}
function zt(e) {
	let t = At.includes(ut(e)) || At.some((t) => (t === Y ? f("Ungrouped") : jt(t))?.toLowerCase() === e.toLowerCase());
	return t && T.error(f("“{name}” is a group the site already has.", { name: e })), t;
}
function Bt({ edit: e, samples: t, path: n }) {
	let { engine: r } = F(), [i, a] = v(""), [o, s] = n, c = [...e.sheet.elements(), ...e.sheet.elements("components")], l = (e) => c.find((t) => t.name === e)?.classes ?? [], d = Mt(e.sheet), p = Nt(e.sheet), m = e.sheet.utilities().map((e) => e.name), ee = (e) => u(e), g = !!o && !!s && ![
		"elements",
		"forms",
		"articles"
	].includes(o) && d.some((e) => e.name === s) && Pt(e.sheet, s) !== o;
	h(() => {
		g && u(Z(Pt(e.sheet, s), s), { replace: !0 });
	}, [
		g,
		e.sheet,
		s
	]);
	let _ = (e) => ["::selection", ":focus-visible"].includes(e.selector) ? {
		...e.node,
		className: [e.node.className, ...l(e.selector)].filter(Boolean).join(" ")
	} : e.node, y = async (t, n = !1) => {
		let i = t === "buttons", a = await dt(r, m, f(i ? "New Button" : "New Class"), f(i ? "Create Button" : "Create Class"), i ? "btn-" : "", "", n ? p.map((e) => e.name) : void 0);
		if (!a) return;
		let { name: o } = a, s = n ? a.group : p.find((e) => e.id === t)?.name ?? null, c = d.find((e) => X(e.name));
		e.change((e) => i && c ? e.duplicateUtility(c.name, o).setUtilityGroup(o, null) : e.setUtility(o, ["text-base"]).setUtilityGroup(o, s)), ee(Z(i ? "buttons" : Y, o));
	}, te = async (t) => {
		let n = (await dt(r, m, f("Rename “{name}”", { name: t }), f("Rename"), X(t) ? "btn-" : "", t))?.name;
		n && (e.change((e) => lt(e, t, n)), s === t && u(Z(o, n), { replace: !0 }));
	}, re = async (t) => {
		let n = (await dt(r, m, f("Duplicate “{name}”", { name: t }), X(t) ? f("Duplicate Button") : f("Duplicate Class"), X(t) ? "btn-" : ""))?.name;
		n && e.change((e) => e.duplicateUtility(t, n));
	}, b = async (t) => {
		let n = d.find((e) => e.name === t)?.group ?? "", r = await Rt(e.sheet, f("Move “{name}” to a Group", { name: t }), f("Move Class"), n);
		r !== void 0 && (r ?? "") !== n && e.change((e) => e.setUtilityGroup(t, r));
	}, ie = (t) => {
		e.change((e) => e.removeUtility(t)), s === t && u(Z(o));
	}, ae = (t) => V(e, {
		copy: t,
		revert: Ot(e, t) && Et(e.saved, t) ? () => e.change((n) => n.setUtility(t, Et(e.saved, t))) : null,
		own: [
			{
				label: f("Rename…"),
				icon: "edit",
				onSelect: () => void te(t)
			},
			{
				label: f("Duplicate…"),
				icon: "copy",
				onSelect: () => void re(t)
			},
			...X(t) ? [] : [{
				label: f("Move to Group…"),
				icon: "folder",
				onSelect: () => void b(t)
			}],
			{
				label: f("Delete"),
				icon: "trash",
				danger: !0,
				onSelect: () => ie(t)
			}
		]
	}), se = (t, n = "base") => V(e, { revert: Dt(e, t, n) ? () => {
		let r = Tt(e.saved, t, n);
		e.change((e) => r.length > 0 ? e.setElement(t, r, n) : e.removeElement(t, n));
	} : null });
	if (o && s) {
		let n = o === "elements" ? st().find((e) => e.id === s) : void 0;
		if (n) return /* @__PURE__ */ R(ft, {
			edit: e,
			samples: t,
			node: _(n),
			classes: l(n.selector),
			groups: n.groups ?? ot,
			menu: se(n.selector),
			write: (t) => e.change((e) => e.setElement(n.selector, t))
		}, s);
		let r = o === "articles" ? ct().find((e) => e.id === s) : void 0;
		if (r) return /* @__PURE__ */ R(ft, {
			edit: e,
			samples: t,
			node: r.node,
			classes: l(r.selector),
			groups: r.groups ?? ot,
			menu: se(r.selector, "components"),
			write: (t) => e.change((e) => e.setElement(r.selector, t, "components"))
		}, s);
		let i = o === "forms" ? ht().find((e) => e.key === s) : o === "articles" && s === "spacing" ? yt() : void 0;
		if (i) return /* @__PURE__ */ R(bt, {
			edit: e,
			samples: t,
			part: i
		}, s);
		let a = d.find((e) => e.name === s);
		return a ? /* @__PURE__ */ R(ft, {
			edit: e,
			samples: t,
			node: Fe(a.name),
			classes: a.classes,
			menu: ae(a.name),
			write: (t) => e.change((e) => t.length > 0 || e.utilities().find((e) => e.name === a.name)?.custom ? e.setUtility(a.name, t) : e.removeUtility(a.name))
		}, s) : null;
	}
	let x = (t, n, r, i, a) => ({
		to: Z(t, n),
		label: r,
		group: Ft(e.sheet, t) ?? "",
		menu: i,
		changed: a
	}), S = (t, n) => x(n, t.name, t.name, ae(t.name), Ot(e, t.name)), ce = d.filter((t) => !X(t.name) && Pt(e.sheet, t.name) === Y), le = (t) => {
		if (t === "elements") return st().map((t) => x("elements", t.id, t.label, se(t.selector), Dt(e, t.selector)));
		if (t === "buttons") return d.filter((e) => X(e.name)).map((e) => S(e, "buttons"));
		if (t === "forms") return ht().map((t) => x("forms", t.key, t.label, wt(e, t), Ct(e, t)));
		if (t === "articles") return [x("articles", "spacing", yt().label, wt(e, yt()), Ct(e, yt())), ...ct().map((t) => x("articles", t.id, t.label, se(t.selector, "components"), Dt(e, t.selector, "components")))];
		if (t === Y) return ce.map((e) => S(e, Y));
		let n = p.find((e) => e.id === t);
		return n ? d.filter((e) => e.group === n.name && !X(e.name)).map((e) => S(e, t)) : [];
	}, ue = [
		...kt,
		...p.map((e) => e.id),
		...ce.length ? [Y] : []
	], de = i.trim().toLowerCase().split(/\s+/).filter(Boolean), fe = (e) => de.every((t) => `${e.label} ${e.to.split("/").pop()}`.toLowerCase().includes(t)), pe = (e, t) => e.map((e) => /* @__PURE__ */ R(Ye, {
		onOpen: () => ee(e.to),
		label: e.label,
		changed: e.changed,
		menu: e.menu,
		detail: t?.(e)
	}, e.to)), C = (t, n = !1) => e.readOnly ? void 0 : () => void y(t, n), me = (e) => /* @__PURE__ */ R("div", {
		className: "mb-4",
		children: /* @__PURE__ */ R(ne, {
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
	}), w = (e, t) => {
		let n = e.filter(fe);
		return n.length ? /* @__PURE__ */ R(H, { children: pe(n, t) }) : /* @__PURE__ */ R(oe, { onClear: () => a("") });
	};
	if (o) {
		let t = le(o), n = o === "buttons" ? C("buttons") : o === Y || p.some((e) => e.id === o) ? C(o === Y ? null : o) : void 0;
		return /* @__PURE__ */ z(L, { children: [t.length > 7 && me(f("Search {items}", { items: Ft(e.sheet, o) ?? f("Classes") })), de.length ? w(t) : /* @__PURE__ */ R(H, {
			onAdd: n,
			addLabel: f(o === "buttons" ? "New Button" : "New Class"),
			children: pe(t)
		})] });
	}
	let he = (e) => e.some((e) => e.changed), ge = (t) => V(e, { own: [{
		label: f("Rename…"),
		icon: "edit",
		onSelect: async () => {
			let n = await Rt(e.sheet, f("Rename Group"), f("Rename"), t);
			n && e.change((e) => e.renameGroup(t, n));
		}
	}, {
		label: f("Delete"),
		icon: "trash",
		danger: !0,
		onSelect: () => e.change((e) => e.renameGroup(t, null))
	}] });
	return /* @__PURE__ */ z(L, { children: [me(f("Search Classes")), de.length ? w(ue.flatMap(le), (e) => e.group) : /* @__PURE__ */ R(H, {
		onAdd: C(null, !0),
		addLabel: f("New Class"),
		children: ue.map((t) => {
			let n = le(t), r = p.find((e) => e.id === t);
			return /* @__PURE__ */ R(Ye, {
				onOpen: () => ee(Z(t)),
				label: Ft(e.sheet, t) ?? t,
				locked: !r && t !== Y,
				detail: n.length,
				changed: he(n),
				menu: r ? ge(r.name) : []
			}, t);
		})
	})] });
}
// admin/src/theme.tsx
function Vt(e, t, n = () => !1) {
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
var Ht = (e) => String(e ?? "").trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/^-+|-+$/g, "");
async function Ut(e, t, n, r, i = "", a = "md") {
	let o = Ht((await ve({
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
	return !o || o === i ? null : e.sheet.variable(`${t}${o}`) !== void 0 || e.defaults.has(`${t}${o}`) ? (T.error(f("“{name}” already exists", { name: o })), null) : o;
}
function Wt(e, t, n, r) {
	let i = n.name.slice(0, n.name.length - n.key.length) + r, a = RegExp(`^(!?.*-)${n.key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}((?:/[^!]+)?!?)$`), o = (e) => {
		let { variants: i, utility: o } = N(e), s = a.exec(o);
		return !s || !t?.declarations(o.replace(/^!|!$/g, ""))?.some((e) => e.value.includes(`var(${n.name})`)) ? e : I(i, `${s[1]}${r}${s[2]}`);
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
var Gt = (e, t) => e.variables().filter((e) => e.name === t || e.name.startsWith(`${t}--`)).reduce((e, t) => e.setVariable(t.name, null), e);
function Kt(e, t) {
	let { engine: n } = F();
	return (r, i = []) => V(e, {
		copy: r.key,
		revert: B(e, r.name) ? () => Ve(e, r.name) : null,
		extra: i,
		own: r.builtIn ? [] : [{
			label: f("Rename…"),
			icon: "edit",
			onSelect: async () => {
				let i = await Ut(e, t.prefix, f("Rename “{name}”", { name: r.key }), f("Rename"), r.key, t.placeholder);
				i && e.change((e) => Wt(e, n, r, i));
			}
		}, {
			label: f("Delete"),
			icon: "trash",
			danger: !0,
			onSelect: () => e.change((e) => Gt(e, r.name))
		}]
	});
}
function Q({ edit: e, kind: t, row: n }) {
	let r = Kt(e, t), i = async () => {
		let n = await Ut(e, t.prefix, t.add, t.add, "", t.placeholder);
		n && e.change((e) => e.setVariable(`${t.prefix}${n}`, t.start));
	};
	return /* @__PURE__ */ R(H, {
		title: t.title,
		onAdd: e.readOnly ? void 0 : () => void i(),
		addLabel: t.add,
		children: Vt(e, t.prefix, t.skip).map((t) => n(t, (n) => n !== null && e.change((e) => e.setVariable(t.name, n)), (e) => r(t, e)))
	});
}
var $ = (e, t = {}) => ({
	component: "blocks-value",
	unit: e,
	...t
}), qt = { component: "site-size" }, Jt = $("rem", {
	units: [
		"rem",
		"px",
		"em"
	],
	step: .125,
	min: 0
});
function Yt({ label: e, value: t, same: n, onChange: r, disabled: i, size: a = "md" }) {
	let { engine: o } = F(), [s, c] = v(!1), l = (e) => M(o ? o.resolve(e) : e).light, u = t ?? n ?? "transparent";
	return /* @__PURE__ */ R(x, {
		open: s,
		onOpenChange: c,
		align: "end",
		className: "!p-0",
		trigger: /* @__PURE__ */ R("span", {
			className: "group/swatch inline-flex",
			children: /* @__PURE__ */ R(C, {
				content: `${e} · ${t ?? f("Same")}`,
				children: /* @__PURE__ */ R(S, {
					compact: !0,
					"aria-label": e,
					disabled: i,
					className: w("relative shrink-0 rounded-sm outline-offset-2 group-data-[popup-open]/swatch:ring-2 group-data-[popup-open]/swatch:ring-border-strong group-data-[popup-open]/swatch:ring-offset-2 group-data-[popup-open]/swatch:ring-offset-bg", a === "md" ? "size-7" : "size-6"),
					children: /* @__PURE__ */ R(Oe, {
						color: l(u),
						className: w("!size-full !rounded-sm", t === null && "opacity-35")
					})
				})
			})
		}),
		children: /* @__PURE__ */ R(xe, {
			label: e,
			value: t ?? void 0,
			onChange: r,
			clearable: n !== void 0
		})
	});
}
var Xt = (e, t, n, r) => e.writeUtility(t, [{
	name: "--scheme",
	value: n
}, {
	name: "--scheme-text",
	value: r
}], ["scheme"]);
function Zt({ edit: e }) {
	let { engine: t } = F(), n = Me(e.sheet), r = (n) => {
		let r = M(t ? t.resolve(n) : n);
		return e.mode === "dark" ? r.dark ?? r.light : r.light;
	}, i = async () => {
		let t = Ht((await ve({
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
			if (n.some((e) => e.key === t)) return void T.error(f("“{name}” already exists", { name: t }));
			e.change((e) => Xt(e, `${k}${t}`, "var(--color-foreground)", "var(--color-background)"));
		}
	}, a = async (t) => {
		let r = Ht((await ve({
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
			if (n.some((e) => e.key === r)) return void T.error(f("“{name}” already exists", { name: r }));
			e.change((e) => e.renameUtility(t.name, `${k}${r}`));
		}
	}, o = (t) => e.sheet.utilityProperties(t.name).map((e) => e.value).join() !== e.saved.utilityProperties(t.name).map((e) => e.value).join();
	return /* @__PURE__ */ R(H, {
		plain: !0,
		title: f("Schemes"),
		onAdd: e.readOnly ? void 0 : () => void i(),
		addLabel: f("Add Scheme"),
		children: n.length > 0 && /* @__PURE__ */ R("div", {
			className: "grid grid-cols-2 gap-3 pt-1",
			children: n.map((t) => /* @__PURE__ */ z("div", {
				className: "cms-reveal-row group min-w-0",
				children: [/* @__PURE__ */ R(A, {
					size: "card",
					background: r(t.background),
					text: r(t.text)
				}), /* @__PURE__ */ z("div", {
					className: "flex h-9 items-center gap-1.5",
					children: [
						/* @__PURE__ */ R("span", {
							className: "min-w-0 flex-1 truncate text-sm text-text",
							children: t.key
						}),
						/* @__PURE__ */ R(Ge, { on: o(t) }),
						/* @__PURE__ */ R(Yt, {
							size: "sm",
							label: f("{name} Background", { name: t.key }),
							value: t.background,
							disabled: e.readOnly,
							onChange: (n) => n && e.change((e) => Xt(e, t.name, n, t.text))
						}),
						/* @__PURE__ */ R(Yt, {
							size: "sm",
							label: f("{name} Text", { name: t.key }),
							value: t.text,
							disabled: e.readOnly,
							onChange: (n) => n && e.change((e) => Xt(e, t.name, t.background, n))
						}),
						/* @__PURE__ */ R(He, { items: V(e, {
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
function Qt({ edit: e }) {
	let t = {
		prefix: "--color-",
		title: f("Site Colors"),
		add: f("Add Color"),
		start: ae,
		placeholder: "brand"
	}, n = Kt(e, t), r = Vt(e, t.prefix).filter((t) => !(t.builtIn && e.palette.has(t.name) && !t.written)), i = async () => {
		let n = await Ut(e, t.prefix, t.add, t.add, "", t.placeholder);
		n && e.change((e) => e.setVariable(`${t.prefix}${n}`, t.start));
	}, a = (t, n, r) => e.change((e) => e.setVariable(t.name, r && r !== n ? `light-dark(${n}, ${r})` : n));
	return /* @__PURE__ */ z(L, { children: [
		/* @__PURE__ */ R($t, { edit: e }),
		/* @__PURE__ */ R(H, {
			title: t.title,
			action: /* @__PURE__ */ z(L, { children: [
				/* @__PURE__ */ R(C, {
					content: f("Light"),
					children: /* @__PURE__ */ R("span", {
						role: "img",
						"aria-label": f("Light"),
						className: "grid w-7 place-items-center text-faint",
						children: /* @__PURE__ */ R(re, {
							name: "sun",
							size: 13
						})
					})
				}),
				/* @__PURE__ */ R(C, {
					content: f("Dark"),
					children: /* @__PURE__ */ R("span", {
						role: "img",
						"aria-label": f("Dark"),
						className: "grid w-7 place-items-center text-faint",
						children: /* @__PURE__ */ R(re, {
							name: "moon",
							size: 13
						})
					})
				}),
				e.readOnly && /* @__PURE__ */ R(We, {})
			] }),
			onAdd: e.readOnly ? void 0 : () => void i(),
			addLabel: t.add,
			children: r.map((t) => {
				let { light: r, dark: i } = M(t.value);
				return /* @__PURE__ */ z(W, {
					name: t.key,
					locked: t.builtIn,
					changed: B(e, t.name),
					wide: !0,
					menu: n(t),
					children: [/* @__PURE__ */ R(Yt, {
						label: f("{name} in Light Mode", { name: t.key }),
						value: r,
						disabled: e.readOnly,
						onChange: (e) => e && a(t, e, i)
					}), /* @__PURE__ */ R(Yt, {
						label: f("{name} in Dark Mode", { name: t.key }),
						value: i ?? null,
						same: r,
						disabled: e.readOnly,
						onChange: (e) => a(t, r, e ?? void 0)
					})]
				}, t.name);
			})
		}),
		/* @__PURE__ */ R(Zt, { edit: e })
	] });
}
function $t({ edit: e }) {
	let { engine: n } = F(), i = (t) => e.sheet.variable(t) ?? e.defaults.get(t), a = (t) => {
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
	return /* @__PURE__ */ z("figure", {
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
			].map((e) => /* @__PURE__ */ R("span", { className: w("pointer-events-none absolute bg-border-strong", e) }, e)),
			/* @__PURE__ */ z("div", {
				className: "relative overflow-hidden rounded-xs p-5",
				style: {
					background: a("--color-background") ?? "white",
					color: a("--color-foreground")
				},
				children: [/* @__PURE__ */ z("div", {
					className: "flex items-end justify-between gap-4",
					children: [/* @__PURE__ */ R("span", {
						className: "block truncate leading-none",
						style: {
							fontFamily: s,
							fontSize: 56
						},
						children: "Aa"
					}), /* @__PURE__ */ R("span", {
						className: "max-w-[60%] truncate pb-1 text-right font-mono text-2xs uppercase tracking-wider opacity-60",
						children: t(r(s ?? "")) || o.slice(7)
					})]
				}), /* @__PURE__ */ R("div", {
					className: "mt-5 grid gap-1.5",
					style: { gridTemplateColumns: `repeat(${Math.max(c.length, 1)}, minmax(0, 1fr))` },
					children: c.map((e) => /* @__PURE__ */ z("div", {
						className: "min-w-0",
						children: [
							/* @__PURE__ */ R("span", {
								className: "relative block h-10 rounded-xs",
								style: { background: e.color },
								children: /* @__PURE__ */ R("span", { className: "cms-swatch-edge" })
							}),
							/* @__PURE__ */ R("span", {
								className: "mt-1.5 block truncate text-2xs",
								children: e.key
							}),
							/* @__PURE__ */ R("span", {
								className: "block truncate font-mono text-2xs opacity-60",
								children: e.color
							})
						]
					}, e.key))
				})]
			}),
			/* @__PURE__ */ R("span", { className: "cms-swatch-edge pointer-events-none !inset-3 rounded-xs" })
		]
	});
}
function en(e) {
	let t = e.flatMap((e) => String(e.weight ?? "400").split(/\s+/).map(Number)).filter((e) => e > 0), n = Math.min(...t), r = Math.max(...t), i = t.length === 0 ? "400" : n === r ? String(n) : `${n}–${r}`;
	return e.some((e) => e.style === "italic") ? `${i} · ${f("Italic")}` : i;
}
var tn = (e, t) => /* @__PURE__ */ R("p", {
	className: "m-0 truncate pb-2.5 text-ink",
	style: {
		fontSize: `min(${e}, 2.75rem)`,
		lineHeight: 1.1,
		fontFamily: t
	},
	children: f("Ship It")
});
function nn({ edit: e, fonts: i }) {
	let o = [...new Set(i.faces.map((e) => e.family))], s = new Set(Vt(e, "--font-", (e) => e.startsWith("weight-")).map((e) => t(r(e.value)))), c = o.map((e) => {
		let t = i.faces.filter((t) => t.family === e);
		return {
			family: e,
			styles: en(t),
			fallback: t.some((e) => Array.isArray(e.fallback) ? e.fallback.length > 0 : !!e.fallback),
			used: s.has(e)
		};
	}), l = n("", "sans", !1), u = e.sheet.variable("--font-sans") ?? e.defaults.get("--font-sans"), d = () => [
		["sans", f("Sans")],
		["serif", f("Serif")],
		["mono", f("Mono")]
	];
	return /* @__PURE__ */ z(L, { children: [
		/* @__PURE__ */ R(Q, {
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
				return /* @__PURE__ */ R(W, {
					name: o.key,
					locked: o.builtIn,
					changed: B(e, o.name),
					sample: /* @__PURE__ */ R("span", {
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
					children: /* @__PURE__ */ R(U, {
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
		/* @__PURE__ */ R(Q, {
			edit: e,
			kind: {
				prefix: "--text-",
				title: f("Text Sizes"),
				add: f("Add Text Size"),
				start: "1.25rem",
				placeholder: "lead",
				skip: (e) => e.startsWith("shadow-")
			},
			row: (t, n, r) => /* @__PURE__ */ R(W, {
				name: t.key,
				locked: t.builtIn,
				changed: B(e, t.name),
				menu: r(),
				below: tn(t.value, u),
				children: /* @__PURE__ */ R(U, {
					handle: t.name,
					label: t.key,
					value: t.value,
					disabled: e.readOnly,
					field: qt,
					onChange: n
				})
			}, t.name)
		}),
		/* @__PURE__ */ R(Q, {
			edit: e,
			kind: {
				prefix: "--leading-",
				title: f("Line Heights"),
				add: f("Add Line Height"),
				start: "1.5",
				placeholder: "airy"
			},
			row: (t, n, r) => /* @__PURE__ */ R(W, {
				name: t.key,
				locked: t.builtIn,
				changed: B(e, t.name),
				menu: r(),
				sample: /* @__PURE__ */ R("span", {
					className: "flex w-4 flex-col",
					style: { gap: `${Math.max(1, (Number(t.value) - .8) * 6)}px` },
					children: [
						0,
						1,
						2
					].map((e) => /* @__PURE__ */ R("span", { className: w("h-0.5 rounded-full bg-muted", e === 2 && "w-2/3") }, e))
				}),
				children: /* @__PURE__ */ R(U, {
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
		/* @__PURE__ */ R(Q, {
			edit: e,
			kind: {
				prefix: "--tracking-",
				title: f("Letter Spacing"),
				add: f("Add Letter Spacing"),
				start: "0em",
				placeholder: "loose"
			},
			row: (t, n, r) => /* @__PURE__ */ R(W, {
				name: t.key,
				locked: t.builtIn,
				changed: B(e, t.name),
				menu: r(),
				sample: /* @__PURE__ */ R("span", {
					className: "text-xs font-medium text-ink",
					style: { letterSpacing: t.value },
					children: "Aa"
				}),
				children: /* @__PURE__ */ R(U, {
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
var rn = (e, t = qt) => (n, r, i) => /* @__PURE__ */ R(W, {
	name: n.key,
	locked: n.builtIn,
	changed: B(e, n.name),
	menu: i(),
	children: /* @__PURE__ */ R(U, {
		handle: n.name,
		label: n.key,
		value: n.value,
		disabled: e.readOnly,
		field: t,
		onChange: r
	})
}, n.name);
function an({ edit: e }) {
	let t = [
		["sm", f("Small")],
		["md", f("Medium")],
		["lg", f("Large")]
	], n = [
		["height", f("Height")],
		["padding", f("Padding")],
		["text", f("Text")]
	], r = (t) => e.sheet.variable(t) ?? e.defaults.get(t) ?? null;
	return /* @__PURE__ */ R(H, {
		title: f("Buttons and Fields"),
		children: t.flatMap(([t, i]) => [/* @__PURE__ */ R("div", {
			className: "flex h-9 items-end pb-1.5 text-xs font-medium text-muted",
			children: i
		}, t), ...n.map(([n, a]) => {
			let o = `--control-${t}-${n}`;
			return /* @__PURE__ */ R(Je, {
				label: a,
				changed: B(e, o),
				menu: V(e, {
					copy: o,
					revert: B(e, o) ? () => Ve(e, o) : null
				}),
				children: /* @__PURE__ */ R(U, {
					handle: o,
					label: `${i} ${a}`,
					value: r(o),
					disabled: e.readOnly,
					field: $("rem", {
						units: ["rem", "px"],
						step: .125,
						min: 0
					}),
					onChange: (t) => t !== null && e.change((e) => e.setVariable(o, t))
				})
			}, o);
		})])
	});
}
function on(e) {
	let t = /^(-?[\d.]+)(rem|px)$/.exec(e.trim());
	return t ? Number(t[1]) * (t[2] === "rem" ? 16 : 1) : null;
}
function sn({ step: e }) {
	let t = on(e);
	return t === null ? null : /* @__PURE__ */ R("div", {
		className: "flex items-end gap-1.5 pb-3 pt-1",
		"aria-hidden": !0,
		children: Ce.filter((e) => e > 0).map((e) => {
			let n = +(t * e).toFixed(2);
			return /* @__PURE__ */ z("span", {
				className: "flex min-w-0 flex-1 flex-col items-center gap-1",
				children: [/* @__PURE__ */ R("span", {
					className: "w-full rounded-xs bg-active",
					style: { height: Math.max(2, Math.min(n, 128) / 2) }
				}), /* @__PURE__ */ R("span", {
					className: "text-2xs tabular-nums text-faint",
					children: n
				})]
			}, e);
		})
	});
}
function cn({ edit: e }) {
	let t = {
		prefix: "--spacing-",
		title: f("Spacing"),
		add: f("Add Spacing"),
		start: "2rem",
		placeholder: "gutter"
	}, n = Kt(e, t), r = e.sheet.variable("--spacing"), i = async () => {
		let n = await Ut(e, t.prefix, t.add, t.add, "", t.placeholder);
		n && e.change((e) => e.setVariable(`${t.prefix}${n}`, t.start));
	}, a = {
		name: "--spacing",
		key: "1",
		value: r ?? e.defaults.get("--spacing") ?? "0.25rem",
		builtIn: !0,
		written: r !== void 0
	};
	return /* @__PURE__ */ z(L, { children: [
		/* @__PURE__ */ z(H, {
			title: t.title,
			onAdd: e.readOnly ? void 0 : () => void i(),
			addLabel: t.add,
			children: [/* @__PURE__ */ R(W, {
				name: a.key,
				locked: !0,
				changed: B(e, a.name),
				menu: V(e, { revert: B(e, a.name) ? () => Ve(e, a.name) : null }),
				below: /* @__PURE__ */ R(sn, { step: a.value }),
				children: /* @__PURE__ */ R(U, {
					handle: "--spacing",
					label: a.key,
					value: a.value,
					disabled: e.readOnly,
					field: qt,
					onChange: (t) => t !== null && e.change((e) => e.setVariable("--spacing", t))
				})
			}), Vt(e, t.prefix).map((t) => rn(e)(t, (n) => n !== null && e.change((e) => e.setVariable(t.name, n)), (e) => n(t, e)))]
		}),
		/* @__PURE__ */ R(Q, {
			edit: e,
			kind: {
				prefix: "--container-",
				title: f("Containers"),
				add: f("Add Container"),
				start: "72rem",
				placeholder: "content"
			},
			row: rn(e)
		}),
		/* @__PURE__ */ R(Q, {
			edit: e,
			kind: {
				prefix: "--breakpoint-",
				title: f("Breakpoints"),
				add: f("Add Breakpoint"),
				start: "120rem",
				placeholder: "3xl"
			},
			row: rn(e, Jt)
		}),
		/* @__PURE__ */ R(an, { edit: e })
	] });
}
function ln({ edit: t }) {
	let n = (n) => (r, i, a) => /* @__PURE__ */ R(W, {
		name: r.key,
		locked: r.builtIn,
		changed: B(t, r.name),
		menu: a(),
		sample: /* @__PURE__ */ R(e, {
			value: r.value,
			kind: n
		}),
		children: /* @__PURE__ */ R(U, {
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
	return /* @__PURE__ */ z(L, { children: [
		/* @__PURE__ */ R(Q, {
			edit: t,
			kind: {
				prefix: "--radius-",
				title: f("Corners"),
				add: f("Add Radius"),
				start: "0.5rem",
				placeholder: "card"
			},
			row: (e, n, r) => /* @__PURE__ */ R(W, {
				name: e.key,
				locked: e.builtIn,
				changed: B(t, e.name),
				menu: r(),
				sample: /* @__PURE__ */ R("span", {
					className: "size-5 translate-x-0.5 translate-y-0.5 border-l-[1.5px] border-t-[1.5px] border-muted",
					style: { borderTopLeftRadius: `min(${e.value}, 20px)` }
				}),
				children: /* @__PURE__ */ R(U, {
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
		/* @__PURE__ */ R(Q, {
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
		/* @__PURE__ */ R(Q, {
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
		/* @__PURE__ */ R(Q, {
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
		/* @__PURE__ */ R(Q, {
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
		/* @__PURE__ */ R(Q, {
			edit: t,
			kind: {
				prefix: "--blur-",
				title: f("Blur"),
				add: f("Add Blur"),
				start: "6px",
				placeholder: "soft"
			},
			row: (e, n, r) => /* @__PURE__ */ R(W, {
				name: e.key,
				locked: e.builtIn,
				changed: B(t, e.name),
				menu: r(),
				sample: /* @__PURE__ */ R("span", {
					className: "size-3 rounded-full bg-muted",
					style: { filter: `blur(min(${e.value}, 6px))` }
				}),
				children: /* @__PURE__ */ R(U, {
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
		/* @__PURE__ */ R(Q, {
			edit: t,
			kind: {
				prefix: "--perspective-",
				title: f("Perspective"),
				add: f("Add Perspective"),
				start: "800px",
				placeholder: "deep"
			},
			row: rn(t, $("px", {
				units: ["px", "rem"],
				step: 10,
				min: 0
			}))
		})
	] });
}
function un(e, t) {
	let n = String(e ?? "").trim().match(/^(\d*\.?\d+)\s*(ms|s)?$/);
	if (!n) return t;
	let r = n[2] === "s" ? Number(n[1]) : Number(n[1]) / 1e3;
	return Math.min(2, Math.max(.05, Math.round(r * 1e3) / 1e3));
}
function dn({ edit: e, transition: t, saved: n, onTransition: r }) {
	let a = (t, n) => e.change((e) => e.setVariable(t, n)), o = (t) => e.sheet.variable(t) ?? e.defaults.get(t) ?? null, s = (t) => V(e, {
		copy: t,
		revert: B(e, t) ? () => Ve(e, t) : null
	}), c = (i) => V(e, { revert: t[i] === n[i] ? null : () => r({
		...t,
		[i]: n[i]
	}) });
	return /* @__PURE__ */ z(L, { children: [
		/* @__PURE__ */ R(Q, {
			edit: e,
			kind: {
				prefix: "--ease-",
				title: f("Easings"),
				add: f("Add Easing"),
				start: "cubic-bezier(0.2, 0.8, 0.2, 1)",
				placeholder: "snap"
			},
			row: (t, n, r) => /* @__PURE__ */ R(W, {
				name: t.key,
				locked: t.builtIn,
				changed: B(e, t.name),
				menu: r(),
				children: /* @__PURE__ */ R(U, {
					handle: t.name,
					label: t.key,
					value: t.value,
					disabled: e.readOnly,
					field: { component: "ease" },
					onChange: n
				})
			}, t.name)
		}),
		/* @__PURE__ */ R(Q, {
			edit: e,
			kind: {
				prefix: "--duration-",
				title: f("Durations"),
				add: f("Add Duration"),
				start: "300ms",
				placeholder: "slow"
			},
			row: (t, n, r) => /* @__PURE__ */ R(W, {
				name: t.key,
				locked: t.builtIn,
				changed: B(e, t.name),
				menu: r(),
				children: /* @__PURE__ */ R(U, {
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
		/* @__PURE__ */ R(Q, {
			edit: e,
			kind: {
				prefix: "--animate-",
				title: f("Animations"),
				add: f("Add Animation"),
				start: "spin 2s linear infinite",
				placeholder: "float"
			},
			row: (t, n, r) => /* @__PURE__ */ R(W, {
				name: t.key,
				locked: t.builtIn,
				changed: B(e, t.name),
				menu: r(),
				sample: /* @__PURE__ */ R(i, {
					value: t.value,
					keyframes: e.keyframes
				}),
				children: /* @__PURE__ */ R(U, {
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
		/* @__PURE__ */ z(H, {
			title: f("Transitions"),
			children: [/* @__PURE__ */ R(Je, {
				label: f("Duration"),
				changed: B(e, "--default-transition-duration"),
				menu: s("--default-transition-duration"),
				children: /* @__PURE__ */ R(U, {
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
			}), /* @__PURE__ */ R(Je, {
				label: f("Easing"),
				changed: B(e, "--default-transition-timing-function"),
				menu: s("--default-transition-timing-function"),
				children: /* @__PURE__ */ R(U, {
					handle: "--default-transition-timing-function",
					label: f("Easing"),
					value: o("--default-transition-timing-function"),
					disabled: e.readOnly,
					field: { component: "ease" },
					onChange: (e) => e && a("--default-transition-timing-function", e)
				})
			})]
		}),
		/* @__PURE__ */ z(H, {
			title: f("Page Transition"),
			children: [
				/* @__PURE__ */ R(Je, {
					label: f("Effect"),
					changed: t.type !== n.type,
					menu: c("type"),
					children: /* @__PURE__ */ R(U, {
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
				t.type !== "none" && /* @__PURE__ */ R(Je, {
					label: f("Duration"),
					changed: t.duration !== n.duration,
					menu: c("duration"),
					children: /* @__PURE__ */ R(U, {
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
							duration: un(e, t.duration)
						})
					})
				}),
				/* @__PURE__ */ R(Je, {
					label: f("Page Loads"),
					changed: t.navigation !== n.navigation,
					menu: c("navigation"),
					children: /* @__PURE__ */ R(U, {
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
var fn = {}, pn = [
	"colors",
	"typography",
	"layout",
	"effects",
	"motion",
	"classes"
], mn = (e) => ({
	colors: f("Colors"),
	typography: f("Typography"),
	layout: f("Layout"),
	effects: f("Effects"),
	motion: f("Motion"),
	classes: f("Classes")
})[e], hn = (e, t) => JSON.stringify(e ?? null) === JSON.stringify(t ?? null), gn = /* @__PURE__ */ new Map(), _n = (e, t) => e.css === t.css && hn(e.transition, t.transition);
function vn({ params: e }) {
	let t = m("styling/get", {}, {
		refetchOnWindowFocus: !1,
		retry: !1
	}), n = m("styling/source", {}, {
		refetchOnWindowFocus: !1,
		retry: !1,
		staleTime: 6e4
	}), [r, i] = v(fn), [a, ...p] = (e["*"] ?? "").split("/").filter(Boolean), y = pn.includes(a) ? a : null;
	h(() => {
		y || u("/design/colors", { replace: !0 });
	}, [y]);
	let te = y === "classes" && p.length > 0 && !!t.data && Lt(new Ee(r.css ?? t.data.css), p) === null;
	h(() => {
		te && u(Z(), { replace: !0 });
	}, [te]);
	let [ne, re] = v(be() === "dark" ? "dark" : "light"), [ie, ae] = v(!1), [oe, x] = v(() => window.matchMedia("(max-width: 767px)").matches);
	h(() => {
		let e = window.matchMedia("(max-width: 767px)"), t = () => x(e.matches);
		return e.addEventListener("change", t), () => e.removeEventListener("change", t);
	}, []);
	let S = ie && oe, [ue, fe] = v("desktop"), [ge, _e] = v(!1), [E, xe] = v(null), Se = _(null), D = t.data, O = r.css ?? D?.css, k = r.transition ?? D?.transition, Ce = !!D && (r.css !== void 0 && r.css !== D.css || r.transition !== void 0 && !hn(r.transition, D.transition)), A = !c("settings.manage"), j = g(() => new Ee(O ?? ""), [O]), we = g(() => new Ee(D?.css ?? ""), [D?.css]), Te = Ze(n.data, O), Oe = g(() => j.variables().some((e) => e.value.startsWith("light-dark(")) || /color-scheme\s*:\s*light\s+dark\b/.test(j.css), [j]), [M, ke] = v(null);
	h(() => {
		je().then(ke);
	}, []);
	let Ae = _(null), N = e["*"] ?? "", Me = _(N);
	Me.current !== N && (Ae.current && gn.set(Me.current, Ae.current.scrollTop), Me.current = N);
	let Ne = !!t.data && !!n.data && M !== null;
	ee(() => {
		Ne && Ae.current && (Ae.current.scrollTop = gn.get(N) ?? 0);
	}, [N, Ne]);
	let P = ze(g(() => O !== void 0 && k ? {
		css: O,
		transition: k
	} : void 0, [O, k]), (e) => i({
		css: e.css,
		transition: e.transition
	}), _n);
	ye("mod+z", P.undo, P.canUndo && !A, f("Undo")), ye("mod+shift+z", P.redo, P.canRedo && !A, f("Redo"));
	let Pe = n.data?.files.cms, Fe = g(() => {
		let e = /* @__PURE__ */ new Map();
		for (let t of [...Ie(M ?? ""), ...Ie(Pe ?? "")]) e.set(t.name, t.value);
		return e;
	}, [M, Pe]), Le = g(() => new Set(Ie(M ?? "").filter((e) => e.name.startsWith("--color-")).map((e) => e.name)), [M]), F = g(() => o(M ?? "", O ?? ""), [M, O]);
	if (h(() => {
		let e = document.createElement("style");
		return e.textContent = (D?.fonts ?? []).map((e) => `@font-face{font-family:"${e.family}";src:url("${/^(https:\/\/|\/)/.test(e.src) ? e.src : `/_cms/fonts/${e.src.split("/").pop()}`}") format("woff2");font-weight:${e.weight ?? "400"};font-style:${e.style ?? "normal"};font-display:swap}`).join("\n"), document.head.appendChild(e), () => e.remove();
	}, [D?.fonts]), !y || t.isLoading || n.isLoading || M === null) return /* @__PURE__ */ R("div", {
		className: "grid h-full place-items-center text-faint",
		children: /* @__PURE__ */ R(pe, {})
	});
	if (!D || !n.data || O === void 0 || !k) return /* @__PURE__ */ z("div", {
		className: "flex h-full flex-col",
		children: [/* @__PURE__ */ R(me, { crumbs: [{ label: mn(y) }] }), /* @__PURE__ */ R(ce, {
			title: f("Couldn’t load the design"),
			onRetry: () => {
				t.refetch(), n.refetch();
			},
			retrying: t.isRefetching || n.isRefetching
		})]
	});
	let I = {
		sheet: j,
		saved: we,
		change: (e) => !A && i((t) => ({
			...t,
			css: e(new Ee(t.css ?? D.css)).css
		})),
		readOnly: A,
		defaults: Fe,
		palette: Le,
		keyframes: F,
		mode: Oe ? ne : "light"
	}, Re = {
		compiler: Te.compiler,
		device: S ? "phone" : ue
	}, Be = y === "classes" ? Lt(j, p) : null, B = () => {
		l("styling/"), Se.current?.contentWindow?.location.reload();
	}, Ve = async () => {
		if (Ce && !ge) {
			_e(!0), xe(null);
			try {
				let e = {};
				r.css !== void 0 && r.css !== D.css && (e.css = r.css), r.transition !== void 0 && !hn(r.transition, D.transition) && (e.transition = r.transition), Object.keys(e).length > 0 && await d("styling/update", e), await Promise.all([t.refetch(), n.refetch()]), i(fn), Se.current?.contentWindow?.location.reload();
			} catch (e) {
				xe({
					message: e instanceof Error ? e.message : String(e),
					refused: e instanceof s && e.type === "invalid_input"
				});
			} finally {
				_e(!1);
			}
		}
	}, V = {
		faces: D.fonts,
		add: async (e) => {
			try {
				if (e === "google") {
					let e = await ve({
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
					return T.success(f("{family} added", { family: t })), B(), {
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
				}), r = t.name.replace(/\.woff2$/i, ""), i = await ve({
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
				}), T.success(f("{family} uploaded", { family: a })), B(), {
					family: a,
					fallback: !1
				}) : null;
			} catch (e) {
				return T.error(e), null;
			}
		},
		remove: async (e) => {
			if (await he({
				title: f("Remove {family}?", { family: e }),
				confirm: f("Remove Font"),
				danger: !0
			})) try {
				await d("styling/update", { fonts: D.fonts.filter((t) => t.family !== e) }), B();
			} catch (e) {
				T.error(e);
			}
		},
		preload: async (e, t) => {
			let n = D.fonts.some((t) => t.family === e && t.style !== "italic");
			try {
				await d("styling/update", { fonts: D.fonts.map((r) => r.family === e ? {
					...r,
					preload: t && (!n || r.style !== "italic")
				} : r) }), B();
			} catch (e) {
				T.error(e);
			}
		}
	}, He = /* @__PURE__ */ z(L, { children: [
		y === "colors" && /* @__PURE__ */ R(Qt, { edit: I }),
		y === "typography" && /* @__PURE__ */ R(nn, {
			edit: I,
			fonts: V
		}),
		y === "layout" && /* @__PURE__ */ R(cn, { edit: I }),
		y === "effects" && /* @__PURE__ */ R(ln, { edit: I }),
		y === "motion" && /* @__PURE__ */ R(dn, {
			edit: I,
			transition: k,
			saved: D.transition,
			onTransition: (e) => !A && i((t) => ({
				...t,
				transition: e
			}))
		}),
		y === "classes" && /* @__PURE__ */ R(Bt, {
			edit: I,
			samples: Re,
			path: p
		}, p[0] ?? "")
	] });
	return /* @__PURE__ */ z("div", {
		className: "flex h-full flex-col",
		children: [
			/* @__PURE__ */ R(me, {
				divided: !0,
				crumbs: Be ?? [{ label: mn(y) }],
				actions: /* @__PURE__ */ z(L, { children: [
					/* @__PURE__ */ R("span", {
						className: "md:hidden",
						children: /* @__PURE__ */ R(C, {
							content: f("Preview"),
							children: /* @__PURE__ */ R(b, {
								icon: "eye",
								label: f("Preview"),
								title: void 0,
								active: S,
								"aria-pressed": S,
								onClick: () => ae(!S)
							})
						})
					}),
					!A && /* @__PURE__ */ z(L, { children: [
						/* @__PURE__ */ R(C, {
							content: f("Undo"),
							shortcut: "mod+z",
							children: /* @__PURE__ */ R(b, {
								icon: "undo",
								label: f("Undo"),
								title: void 0,
								disabled: !P.canUndo,
								onClick: P.undo
							})
						}),
						/* @__PURE__ */ R(C, {
							content: f("Redo"),
							shortcut: "mod+shift+z",
							children: /* @__PURE__ */ R(b, {
								icon: "redo",
								label: f("Redo"),
								title: void 0,
								disabled: !P.canRedo,
								onClick: P.redo
							})
						}),
						/* @__PURE__ */ R("span", {
							className: "max-sm:hidden",
							children: /* @__PURE__ */ R(yn, { onOpen: (e) => i({
								css: e.css,
								transition: e.transition
							}) })
						})
					] }),
					/* @__PURE__ */ R("span", {
						className: "max-md:hidden",
						children: /* @__PURE__ */ R(de, {
							size: "xs",
							"aria-label": f("Screen"),
							value: ue,
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
					Oe && /* @__PURE__ */ R(de, {
						size: "xs",
						className: "max-sm:hidden",
						"aria-label": f("Color Mode"),
						value: ne,
						onChange: re,
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
					/* @__PURE__ */ R(C, {
						content: f("Open Site"),
						children: /* @__PURE__ */ R(b, {
							icon: "external",
							label: f("Open Site"),
							title: void 0,
							onClick: () => window.open("/", "_blank", "noopener"),
							className: "max-md:hidden"
						})
					})
				] })
			}),
			/* @__PURE__ */ R(le, {
				within: "/design",
				dirty: Ce,
				saving: ge,
				error: E ? E.refused ? f("The stylesheet was not saved") : E.message : null,
				onSave: () => void Ve(),
				onDiscard: () => {
					i(fn), xe(null);
				}
			}),
			/* @__PURE__ */ R(De, {
				source: Te.source ?? n.data,
				children: /* @__PURE__ */ z("div", {
					className: "grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(320px,380px)_minmax(0,1fr)] xl:grid-cols-[minmax(360px,420px)_minmax(0,1fr)]",
					children: [/* @__PURE__ */ R("div", {
						className: w("flex min-h-0 flex-col border-border md:border-r", S && "max-md:hidden"),
						children: /* @__PURE__ */ z("div", {
							ref: Ae,
							onScroll: (e) => gn.set(N, e.currentTarget.scrollTop),
							className: "min-h-0 flex-1 overflow-y-auto px-4 pb-16 pt-2",
							children: [E?.refused && /* @__PURE__ */ R(se, {
								tone: "danger",
								className: "mb-3 mt-1",
								title: f("Tailwind refused the stylesheet"),
								onDismiss: () => xe(null),
								children: E.message
							}), He]
						})
					}), /* @__PURE__ */ R("div", {
						className: w("flex min-w-0 flex-col bg-sunken", !S && "max-md:hidden"),
						children: /* @__PURE__ */ R(bn, {
							frame: Se,
							compile: Te,
							published: D.stylesheet,
							viewport: S ? "phone" : ue,
							mode: Oe ? ne : null
						})
					})]
				})
			})
		]
	});
}
function yn({ onOpen: e }) {
	let [t, n] = v(!1), r = m("styling-versions/list", {}, { enabled: t }), i = async (t) => {
		try {
			e(await d("styling-versions/get", { id: t })), n(!1);
		} catch (e) {
			T.error(e);
		}
	};
	return /* @__PURE__ */ z(x, {
		open: t,
		onOpenChange: n,
		align: "end",
		className: "w-72 !p-1",
		trigger: /* @__PURE__ */ R("span", { children: /* @__PURE__ */ R(C, {
			content: f("Versions"),
			children: /* @__PURE__ */ R(b, {
				icon: "history",
				label: f("Versions"),
				title: void 0,
				active: t
			})
		}) }),
		children: [/* @__PURE__ */ R("div", {
			className: "cms-label px-2 pb-1 pt-1.5",
			children: f("Versions")
		}), r.isPending ? /* @__PURE__ */ R("div", {
			className: "grid h-16 place-items-center text-faint",
			children: /* @__PURE__ */ R(pe, { size: 14 })
		}) : r.isError ? /* @__PURE__ */ R(ce, {
			compact: !0,
			onRetry: () => void r.refetch(),
			retrying: r.isRefetching
		}) : r.data.length === 0 ? /* @__PURE__ */ R(te, {
			compact: !0,
			icon: "history",
			title: f("No versions yet")
		}) : /* @__PURE__ */ R("div", {
			className: "max-h-80 space-y-px overflow-y-auto",
			children: r.data.map((e) => /* @__PURE__ */ z(S, {
				compact: !0,
				disabled: e.current,
				onClick: () => void i(e.id),
				className: "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm enabled:hover:bg-hover",
				children: [/* @__PURE__ */ z("span", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ R("span", {
						className: "block truncate text-text",
						children: p(e.at)
					}), e.user && /* @__PURE__ */ R("span", {
						className: "block truncate text-xs text-muted",
						children: e.user
					})]
				}), e.current && /* @__PURE__ */ R("span", {
					className: "shrink-0 text-xs text-muted",
					children: f("Current")
				})]
			}, e.id))
		})]
	});
}
function bn(e) {
	let { breakpoints: t } = F();
	return /* @__PURE__ */ R(nt, {
		...e,
		desktop: t.find((e) => e.name === "lg")?.width ?? 1024
	});
}
export { vn as default };
