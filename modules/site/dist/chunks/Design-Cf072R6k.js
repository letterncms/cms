import { a as e, c as t, d as n, l as r, n as i, s as a, u as o } from "./fields-DCCGjhjk.js";
import { CmsError as s, can as c, invalidate as l, navigate as u, run as d, t as f, useAbility as p } from "@letterncms/sdk";
import { useEffect as m, useLayoutEffect as h, useMemo as g, useRef as _, useState as v } from "react";
import { Button as y, EmptyState as b, Fields as ee, Icon as x, IconButton as te, Menu as ne, NEW_COLOR as re, NoMatches as ie, Notice as ae, Popover as oe, Pressable as se, QueryError as ce, SaveBar as le, Section as S, Segmented as ue, SettingsPanel as C, Spinner as de, Tooltip as w, Topbar as fe, UndoRedo as pe, VersionsButton as me, cn as T, confirm as he, copyText as ge, deviceWidths as _e, prompt as E, toast as D, useTheme as ve, useUndo as ye } from "@letterncms/ui";
import { ARTICLE as O, ColorPicker as be, FIELDS as xe, InspectorSection as Se, PanelFields as k, SCHEME as A, SPACING_STEPS as Ce, SchemeTile as we, Specimen as Te, StyleBar as Ee, StylePanels as De, Stylesheet as Oe, StylingProvider as ke, Swatch as Ae, lightDark as j, loadCompiler as M, loadEngine as je, loadTailwindTheme as Me, parseClass as N, schemesOf as P, screenFor as Ne, shownInState as Pe, styleApi as Fe, styleSample as Ie, themeDefaults as Le, useSpecimenSheet as Re, useStyling as F, withVariants as ze } from "@letterncms/blocks";
import { Fragment as I, jsx as L, jsxs as R } from "react/jsx-runtime";
// admin/src/parts.tsx
var Be = (e, t) => e.variables().filter((e) => e.name === t || e.name.startsWith(`${t}--`)).map((e) => e.name);
function z(e, ...t) {
	return t.some((t) => [.../* @__PURE__ */ new Set([...Be(e.sheet, t), ...Be(e.saved, t)])].some((t) => (e.sheet.variable(t) ?? null) !== (e.saved.variable(t) ?? null)));
}
function B(e, ...t) {
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
var Ve = ({ items: e }) => e.length > 0 ? /* @__PURE__ */ L(ne, {
	trigger: /* @__PURE__ */ L(te, {
		icon: "more",
		label: f("Actions"),
		size: "xs",
		className: "cms-reveal shrink-0"
	}),
	items: e
}) : /* @__PURE__ */ L(Ue, {}), He = "cms-reveal-row", Ue = () => /* @__PURE__ */ L("span", { className: "size-6 shrink-0" }), We = ({ on: e }) => e ? /* @__PURE__ */ L("span", {
	role: "img",
	"aria-label": f("Unsaved changes"),
	className: "size-1.5 shrink-0 rounded-full bg-focus"
}) : null, Ge = ({ on: e, label: t }) => e ? /* @__PURE__ */ L(w, {
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
}) : null, Ke = ({ children: e, locked: t, changed: n, className: r }) => /* @__PURE__ */ R("span", {
	className: T("flex min-w-0 items-center gap-1.5 text-sm text-text", r),
	children: [
		/* @__PURE__ */ L("span", {
			className: "truncate",
			children: e
		}),
		/* @__PURE__ */ L(Ge, { on: !!t }),
		/* @__PURE__ */ L(We, { on: !!n })
	]
});
function H({ title: e, onAdd: t, addLabel: n, action: r, plain: i, children: a }) {
	let o = t && n && /* @__PURE__ */ L(w, {
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
		actions: e && (r || o) ? /* @__PURE__ */ R("span", {
			className: "flex items-center gap-2 pr-4 sm:pr-5",
			children: [r, o]
		}) : void 0,
		children: [i ? a : /* @__PURE__ */ L(C, {
			className: "overflow-hidden",
			children: a
		}), !e && (r || o) && /* @__PURE__ */ L("div", {
			className: "flex h-9 items-center",
			children: r ?? /* @__PURE__ */ L(y, {
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
	return /* @__PURE__ */ L(ee, {
		bare: !0,
		className: T("flex min-w-0 flex-1", o),
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
		className: He,
		children: [/* @__PURE__ */ R("div", {
			className: "flex min-h-12 items-center gap-2 py-2",
			children: [
				t !== void 0 && /* @__PURE__ */ L("span", {
					className: "grid w-7 shrink-0 place-items-center",
					children: t
				}),
				/* @__PURE__ */ L(Ke, {
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
				/* @__PURE__ */ L(Ve, { items: s })
			]
		}), r]
	});
}
function qe({ label: e, changed: t, menu: n, children: r }) {
	return /* @__PURE__ */ R("div", {
		className: T(He, "flex min-h-12 items-center gap-2 py-2"),
		children: [
			/* @__PURE__ */ L(Ke, {
				changed: t,
				className: "w-[120px] shrink-0 max-sm:w-20",
				children: e
			}),
			/* @__PURE__ */ L("div", {
				className: "flex w-56 min-w-0 shrink items-center max-lg:w-48 max-sm:w-auto max-sm:flex-1",
				children: r
			}),
			/* @__PURE__ */ L("span", { className: "min-w-0 flex-1 max-sm:hidden" }),
			/* @__PURE__ */ L(Ve, { items: n })
		]
	});
}
function Je({ onOpen: e, label: t, sample: n, detail: r, locked: i, changed: a, menu: o = [] }) {
	return /* @__PURE__ */ R("div", {
		className: "cms-reveal-row relative -mx-4 flex min-h-12 items-center gap-2 px-4 py-2 transition-colors duration-base hover:bg-hover sm:-mx-5 sm:px-5",
		children: [
			/* @__PURE__ */ L(se, {
				inset: !0,
				onClick: e,
				"aria-label": t,
				className: "absolute inset-0"
			}),
			/* @__PURE__ */ L(Ke, {
				locked: i,
				changed: a,
				className: T("pointer-events-none", n ? "w-28 shrink-0 max-sm:w-20" : "flex-1"),
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
				children: /* @__PURE__ */ L(Ve, { items: o })
			}),
			/* @__PURE__ */ L(x, {
				name: "chevron-right",
				size: 14,
				className: "pointer-events-none shrink-0 text-faint"
			})
		]
	});
}
// admin/src/preview.tsx
var Ye = {
	desktop: "100%",
	tablet: `${_e.tablet}px`,
	phone: `${_e.phone}px`
};
function Xe(e, t) {
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
							let n = await M(t);
							if (n.build(e.base.candidates), !await je(t)) throw Error(f("Tailwind could not read the stylesheet."));
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
function Ze({ viewport: e, desktop: t, children: n }) {
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
	let o = e === "desktop" ? Math.max(i.width, t) : parseFloat(Ye[e]), s = i.width ? Math.min(1, i.width / o) : 1;
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
var Qe = "cms-styling-draft";
function $e(e, t, n, r) {
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
	let l = e.getElementById(Qe);
	l || (l = e.createElement("style"), l.id = Qe, o[0] ? o[0].after(l) : e.head.appendChild(l)), l.textContent !== c && (l.textContent = c);
	for (let e of o) e.disabled = !0;
}
var et = "border-0 bg-bg md:rounded-md md:shadow-sheet";
function tt({ frame: e, compile: t, published: n, viewport: r, desktop: i, mode: a }) {
	let [o, s] = v(0);
	return m(() => $e(e.current?.contentDocument, t, n, a), [
		e,
		t,
		n,
		a,
		o
	]), /* @__PURE__ */ R("div", {
		className: "relative flex min-h-0 flex-1 flex-col md:p-4",
		children: [/* @__PURE__ */ L(Ze, {
			viewport: r,
			desktop: i,
			children: (t) => /* @__PURE__ */ L("iframe", {
				ref: e,
				src: "/",
				title: f("Site Preview"),
				className: et,
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
// admin/src/classes.tsx
var nt = (e) => e.replace(/^!|!$/g, ""), rt = (e) => e.split(/\s+/).filter(Boolean), it = (e) => e.elements().find((e) => e.name === "body")?.classes.join(" ") ?? "", at = [
	"typography",
	"spacing",
	"fill",
	"border",
	"effects",
	"transition"
], ot = () => [
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
}), st = () => [
	{
		id: "h2",
		key: "h2",
		selector: O.h2,
		label: f("Heading 2"),
		node: G(`<h2 style="margin:0">${f("Heading 2")}</h2>`)
	},
	{
		id: "h3",
		key: "h3",
		selector: O.h3,
		label: f("Heading 3"),
		node: G(`<h3 style="margin:0">${f("Heading 3")}</h3>`)
	},
	{
		id: "p",
		key: "p",
		selector: O.p,
		label: f("Paragraph"),
		node: G(`<p style="margin:0">${f("Paragraph")}</p>`)
	},
	{
		id: "li",
		key: "li",
		selector: O.li,
		label: f("List Item"),
		node: G(`<ul><li>${f("List Item")}</li></ul>`)
	},
	{
		id: "blockquote",
		key: "blockquote",
		selector: O.blockquote,
		label: f("Quote"),
		node: G(`<blockquote style="margin:0">${f("Quote")}</blockquote>`)
	},
	{
		id: "figure",
		key: "figure",
		selector: O.figure,
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
		selector: O.a,
		label: f("Link"),
		node: G(`<p><a href="#">${f("Link")}</a></p>`)
	}
];
function ct(e, t, n) {
	let r = (e) => {
		let { variants: r, utility: i } = N(e);
		return nt(i) === t ? ze(r, i.replace(t, n)) : e;
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
var lt = (e) => String(e ?? "").trim().toLowerCase().replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/^-+|-+$/g, ""), ut = (e) => ({
	handle: "group",
	type: "select",
	label: f("Group"),
	placeholder: f("No Group"),
	options: e.map((e) => ({
		value: e,
		label: e
	}))
});
async function dt(e, t, n, r, i = "", a = "", o) {
	let s = await E({
		title: n,
		fields: [{
			handle: "name",
			type: "text",
			label: f("Name"),
			placeholder: i ? "outline" : "lead",
			required: !0,
			autofocus: !0
		}, ...o?.names.length ? [ut(o.names)] : []],
		values: {
			name: a ? a.slice(i.length) : "",
			group: o?.group ?? null
		},
		confirm: r
	}), c = lt(s?.name);
	if (!c) return null;
	let l = `${i}${c}`;
	return l === a ? null : /^[a-z][a-z0-9-]*$/.test(l) ? t.includes(l) || e?.valid(l) ? (D.error(f("There is already a class “{name}”.", { name: l })), null) : {
		name: l,
		group: o?.names.length ? String(s?.group ?? "") || null : o?.group ?? null
	} : (D.error(f("A name is lowercase letters, numbers and hyphens, and starts with a letter.")), null);
}
function ft({ edit: e, samples: t, node: n, classes: r, groups: i, write: a, menu: o }) {
	let s = F(), [c, l] = v([]), u = g(() => Ne(t.device, 1280, s.breakpoints), [t.device, s.breakpoints]), d = Fe(s.engine, r, u, c, e.readOnly ? () => {} : a), f = it(e.sheet), p = Pe(r, c), m = p.length ? {
		...n,
		className: [n.className, ...p].filter(Boolean).join(" ")
	} : n, h = Re(t.compiler, [
		...rt(f),
		...r.map((e) => nt(N(e).utility)),
		...r,
		...p,
		...rt(n.className ?? "")
	]);
	return /* @__PURE__ */ R("div", {
		className: "-mx-4 -mt-2",
		children: [
			/* @__PURE__ */ L(Ee, {
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
			/* @__PURE__ */ L("div", {
				className: "border-b border-border p-4",
				children: /* @__PURE__ */ L(Te, {
					sheet: h,
					node: m,
					page: f,
					mode: e.mode,
					align: "center",
					className: "h-28 rounded-md border border-border"
				})
			}),
			/* @__PURE__ */ L("div", {
				inert: e.readOnly,
				children: /* @__PURE__ */ L(De, {
					s: d,
					groups: i
				})
			})
		]
	});
}
var pt = ({ menu: e }) => e && e.length > 0 ? /* @__PURE__ */ L(ne, {
	align: "end",
	trigger: /* @__PURE__ */ L(te, {
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
		selector: xe,
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
		selector: xe,
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
		selector: xe,
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
	selector: O.spacing,
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
	let { source: r } = F(), i = g(() => new Oe(r?.files.cms ?? ""), [r?.files.cms]), a = it(e.sheet), o = Re(t.compiler, rt(a)), s = (t) => e.sheet.property(n.selector, t, n.layer);
	return /* @__PURE__ */ R("div", {
		className: "-mx-4 -mt-2",
		children: [
			/* @__PURE__ */ L("div", {
				className: "flex h-11 items-center justify-end border-b border-border px-3",
				children: /* @__PURE__ */ L(pt, { menu: wt(e, n) })
			}),
			/* @__PURE__ */ L("div", {
				className: "border-b border-border p-4",
				children: /* @__PURE__ */ L(Te, {
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
					let r = /* @__PURE__ */ L(k, {
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
					return n.sections.length === 1 ? /* @__PURE__ */ L("div", {
						className: "space-y-1 px-4 py-3",
						children: r
					}, t.title) : /* @__PURE__ */ L(Se, {
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
	for (let n of e.groups()) {
		let e = lt(n) || "group", r = e;
		for (let n = 2; At.includes(r) || t.some((e) => e.id === r); n++) r = `${e}-${n}`;
		t.push({
			id: r,
			name: n
		});
	}
	return t;
}
var Pt = (e, t) => t && !e.groups().includes(t) ? e.addGroup(t) : e;
function Ft(e, t) {
	if (X(t)) return "buttons";
	let n = Mt(e).find((e) => e.name === t)?.group;
	return Nt(e).find((e) => e.name === n)?.id ?? Y;
}
var Z = (e, t) => [
	"/design/classes",
	e,
	t
].filter(Boolean).map((e, t) => t === 0 ? e : encodeURIComponent(e)).join("/");
function It(e, t) {
	return t === Y ? f("Ungrouped") : jt(t) ?? Nt(e).find((e) => e.id === t)?.name ?? null;
}
function Lt(e, t, n) {
	return t === "elements" ? ot().find((e) => e.id === n)?.label ?? null : t === "forms" ? ht().find((e) => e.key === n)?.label ?? null : t === "articles" ? n === "spacing" ? yt().label : st().find((e) => e.id === n)?.label ?? null : Mt(e).some((e) => e.name === n) ? n : null;
}
function Rt(e, [t, n]) {
	if (!t) return null;
	let r = It(e, t);
	if (!r) return null;
	if (!n) return [{
		label: f("Classes"),
		to: Z()
	}, { label: r }];
	let i = Lt(e, t, n);
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
async function zt(e, t, n, r = "") {
	let i = await E({
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
	return !a || a === r || Bt(a) ? null : e.groups().includes(a) ? (D.error(f("There is already a group “{name}”.", { name: a })), null) : a;
}
function Bt(e) {
	let t = At.includes(lt(e)) || At.some((t) => (t === Y ? f("Ungrouped") : jt(t))?.toLowerCase() === e.toLowerCase());
	return t && D.error(f("“{name}” is a group the site already has.", { name: e })), t;
}
function Vt({ edit: e, samples: t, path: n }) {
	let { engine: r } = F(), [i, a] = v(""), [o, s] = n, c = [...e.sheet.elements(), ...e.sheet.elements("components")], l = (e) => c.find((t) => t.name === e)?.classes ?? [], d = Mt(e.sheet), p = Nt(e.sheet), h = e.sheet.utilities().map((e) => e.name), g = (e) => u(e), _ = !!o && !!s && ![
		"elements",
		"forms",
		"articles"
	].includes(o) && d.some((e) => e.name === s) && Ft(e.sheet, s) !== o;
	m(() => {
		_ && u(Z(Ft(e.sheet, s), s), { replace: !0 });
	}, [
		_,
		e.sheet,
		s
	]);
	let x = (e) => ["::selection", ":focus-visible"].includes(e.selector) ? {
		...e.node,
		className: [e.node.className, ...l(e.selector)].filter(Boolean).join(" ")
	} : e.node, te = async (t) => {
		let n = t === "buttons", i = await dt(r, h, f(n ? "New Button" : "New Class"), f(n ? "Create Button" : "Create Class"), n ? "btn-" : "", "", n ? void 0 : {
			names: p.map((e) => e.name),
			group: p.find((e) => e.id === t)?.name ?? null
		});
		if (!i) return;
		let { name: a, group: o } = i, s = d.find((e) => X(e.name));
		e.change((e) => n && s ? e.duplicateUtility(s.name, a).setUtilityGroup(a, null) : e.setUtility(a, ["text-base"]).setUtilityGroup(a, o)), g(Z(n ? "buttons" : Y, a));
	}, ne = async (t) => {
		let n = (await dt(r, h, f("Rename “{name}”", { name: t }), f("Rename"), X(t) ? "btn-" : "", t))?.name;
		n && (e.change((e) => ct(e, t, n)), s === t && u(Z(o, n), { replace: !0 }));
	}, re = async (t) => {
		let n = (await dt(r, h, f("Duplicate “{name}”", { name: t }), X(t) ? f("Duplicate Button") : f("Duplicate Class"), X(t) ? "btn-" : ""))?.name;
		n && e.change((e) => e.duplicateUtility(t, n));
	}, ae = async (t) => {
		let n = d.find((e) => e.name === t)?.group ?? null, r = await E({
			title: f("Move “{name}” to a Group", { name: t }),
			fields: [ut(p.map((e) => e.name))],
			values: { group: n },
			confirm: f("Move Class")
		});
		if (!r) return;
		let i = String(r.group ?? "") || null;
		i !== n && e.change((e) => Pt(e.setUtilityGroup(t, i), n));
	}, oe = (t) => {
		let n = d.find((e) => e.name === t)?.group;
		e.change((e) => Pt(e.removeUtility(t), n)), s === t && u(Z(o));
	}, se = (t) => V(e, {
		copy: t,
		revert: Ot(e, t) && Et(e.saved, t) ? () => e.change((n) => n.setUtility(t, Et(e.saved, t))) : null,
		own: [
			{
				label: f("Rename…"),
				icon: "edit",
				onSelect: () => void ne(t)
			},
			{
				label: f("Duplicate…"),
				icon: "copy",
				onSelect: () => void re(t)
			},
			...X(t) || p.length === 0 ? [] : [{
				label: f("Move to Group…"),
				icon: "folder",
				onSelect: () => void ae(t)
			}],
			{
				label: f("Delete"),
				icon: "trash",
				danger: !0,
				onSelect: () => oe(t)
			}
		]
	}), ce = (t, n = "base") => V(e, { revert: Dt(e, t, n) ? () => {
		let r = Tt(e.saved, t, n);
		e.change((e) => r.length > 0 ? e.setElement(t, r, n) : e.removeElement(t, n));
	} : null });
	if (o && s) {
		let n = o === "elements" ? ot().find((e) => e.id === s) : void 0;
		if (n) return /* @__PURE__ */ L(ft, {
			edit: e,
			samples: t,
			node: x(n),
			classes: l(n.selector),
			groups: n.groups ?? at,
			menu: ce(n.selector),
			write: (t) => e.change((e) => e.setElement(n.selector, t))
		}, s);
		let r = o === "articles" ? st().find((e) => e.id === s) : void 0;
		if (r) return /* @__PURE__ */ L(ft, {
			edit: e,
			samples: t,
			node: r.node,
			classes: l(r.selector),
			groups: r.groups ?? at,
			menu: ce(r.selector, "components"),
			write: (t) => e.change((e) => e.setElement(r.selector, t, "components"))
		}, s);
		let i = o === "forms" ? ht().find((e) => e.key === s) : o === "articles" && s === "spacing" ? yt() : void 0;
		if (i) return /* @__PURE__ */ L(bt, {
			edit: e,
			samples: t,
			part: i
		}, s);
		let a = d.find((e) => e.name === s);
		return a ? /* @__PURE__ */ L(ft, {
			edit: e,
			samples: t,
			node: Ie(a.name),
			classes: a.classes,
			menu: se(a.name),
			write: (t) => e.change((e) => t.length > 0 || e.utilities().find((e) => e.name === a.name)?.custom ? e.setUtility(a.name, t) : e.removeUtility(a.name))
		}, s) : null;
	}
	let le = (t, n, r, i, a) => ({
		to: Z(t, n),
		label: r,
		group: It(e.sheet, t) ?? "",
		menu: i,
		changed: a
	}), S = (t, n) => le(n, t.name, t.name, se(t.name), Ot(e, t.name)), ue = d.filter((t) => !X(t.name) && Ft(e.sheet, t.name) === Y), C = (t) => {
		if (t === "elements") return ot().map((t) => le("elements", t.id, t.label, ce(t.selector), Dt(e, t.selector)));
		if (t === "buttons") return d.filter((e) => X(e.name)).map((e) => S(e, "buttons"));
		if (t === "forms") return ht().map((t) => le("forms", t.key, t.label, wt(e, t), Ct(e, t)));
		if (t === "articles") return [le("articles", "spacing", yt().label, wt(e, yt()), Ct(e, yt())), ...st().map((t) => le("articles", t.id, t.label, ce(t.selector, "components"), Dt(e, t.selector, "components")))];
		if (t === Y) return ue.map((e) => S(e, Y));
		let n = p.find((e) => e.id === t);
		return n ? d.filter((e) => e.group === n.name && !X(e.name)).map((e) => S(e, t)) : [];
	}, de = [
		...kt,
		...p.map((e) => e.id),
		...ue.length ? [Y] : []
	], w = i.trim().toLowerCase().split(/\s+/).filter(Boolean), fe = (e) => w.every((t) => `${e.label} ${e.to.split("/").pop()}`.toLowerCase().includes(t)), pe = (e, t) => e.map((e) => /* @__PURE__ */ L(Je, {
		onOpen: () => g(e.to),
		label: e.label,
		changed: e.changed,
		menu: e.menu,
		detail: t?.(e)
	}, e.to)), me = (t) => e.readOnly ? void 0 : () => void te(t), T = (e) => /* @__PURE__ */ L("div", {
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
	}), he = (e, t) => {
		let n = e.filter(fe);
		return n.length ? /* @__PURE__ */ L(H, { children: pe(n, t) }) : /* @__PURE__ */ L(ie, { onClear: () => a("") });
	};
	if (o) {
		let t = C(o), n = o === "buttons" ? me("buttons") : o === Y || p.some((e) => e.id === o) ? me(o === Y ? null : o) : void 0;
		return t.length === 0 ? /* @__PURE__ */ L(b, {
			compact: !0,
			icon: "folder",
			title: f("No classes yet"),
			action: n && /* @__PURE__ */ L(y, {
				icon: "plus",
				onClick: n,
				children: f("New Class")
			})
		}) : /* @__PURE__ */ R(I, { children: [t.length > 7 && T(f("Search {items}", { items: It(e.sheet, o) ?? f("Classes") })), w.length ? he(t) : /* @__PURE__ */ L(H, {
			onAdd: n,
			addLabel: f(o === "buttons" ? "New Button" : "New Class"),
			children: pe(t)
		})] });
	}
	let ge = (e) => e.some((e) => e.changed), _e = (t) => V(e, { own: [{
		label: f("Rename…"),
		icon: "edit",
		onSelect: async () => {
			let n = await zt(e.sheet, f("Rename Group"), f("Rename"), t);
			n && e.change((e) => e.renameGroup(t, n));
		}
	}, {
		label: f("Delete"),
		icon: "trash",
		danger: !0,
		onSelect: () => e.change((e) => e.renameGroup(t, null))
	}] }), D = async () => {
		let t = await zt(e.sheet, f("New Group"), f("Create Group"));
		t && e.change((e) => e.addGroup(t));
	}, ve = "ml-0 !px-1.5 !font-normal !text-muted first:-ml-1.5 hover:!text-ink";
	return /* @__PURE__ */ R(I, { children: [T(f("Search Classes")), w.length ? he(de.flatMap(C), (e) => e.group) : /* @__PURE__ */ L(H, {
		action: e.readOnly ? void 0 : /* @__PURE__ */ R("span", {
			className: "flex items-center gap-3",
			children: [/* @__PURE__ */ L(y, {
				variant: "ghost",
				size: "xs",
				icon: "plus",
				onClick: () => void te(null),
				className: ve,
				children: f("New Class")
			}), /* @__PURE__ */ L(y, {
				variant: "ghost",
				size: "xs",
				icon: "folder",
				onClick: () => void D(),
				className: ve,
				children: f("New Group")
			})]
		}),
		children: de.map((t) => {
			let n = C(t), r = p.find((e) => e.id === t);
			return /* @__PURE__ */ L(Je, {
				onOpen: () => g(Z(t)),
				label: It(e.sheet, t) ?? t,
				locked: !r && t !== Y,
				detail: n.length,
				changed: ge(n) || !!r && !e.saved.groups().includes(r.name),
				menu: r ? _e(r.name) : []
			}, t);
		})
	})] });
}
// admin/src/theme.tsx
function Ht(e, t, n = () => !1) {
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
var Ut = (e) => String(e ?? "").trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/^-+|-+$/g, "");
async function Wt(e, t, n, r, i = "", a = "md") {
	let o = Ut((await E({
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
	return !o || o === i ? null : e.sheet.variable(`${t}${o}`) !== void 0 || e.defaults.has(`${t}${o}`) ? (D.error(f("“{name}” already exists", { name: o })), null) : o;
}
function Gt(e, t, n, r) {
	let i = n.name.slice(0, n.name.length - n.key.length) + r, a = RegExp(`^(!?.*-)${n.key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}((?:/[^!]+)?!?)$`), o = (e) => {
		let { variants: i, utility: o } = N(e), s = a.exec(o);
		return !s || !t?.declarations(o.replace(/^!|!$/g, ""))?.some((e) => e.value.includes(`var(${n.name})`)) ? e : ze(i, `${s[1]}${r}${s[2]}`);
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
var Kt = (e, t) => e.variables().filter((e) => e.name === t || e.name.startsWith(`${t}--`)).reduce((e, t) => e.setVariable(t.name, null), e);
function qt(e, t) {
	let { engine: n } = F();
	return (r, i = []) => V(e, {
		copy: r.key,
		revert: z(e, r.name) ? () => B(e, r.name) : null,
		extra: i,
		own: r.builtIn ? [] : [{
			label: f("Rename…"),
			icon: "edit",
			onSelect: async () => {
				let i = await Wt(e, t.prefix, f("Rename “{name}”", { name: r.key }), f("Rename"), r.key, t.placeholder);
				i && e.change((e) => Gt(e, n, r, i));
			}
		}, {
			label: f("Delete"),
			icon: "trash",
			danger: !0,
			onSelect: () => e.change((e) => Kt(e, r.name))
		}]
	});
}
function Q({ edit: e, kind: t, row: n }) {
	let r = qt(e, t), i = async () => {
		let n = await Wt(e, t.prefix, t.add, t.add, "", t.placeholder);
		n && e.change((e) => e.setVariable(`${t.prefix}${n}`, t.start));
	};
	return /* @__PURE__ */ L(H, {
		title: t.title,
		onAdd: e.readOnly ? void 0 : () => void i(),
		addLabel: t.add,
		children: Ht(e, t.prefix, t.skip).map((t) => n(t, (n) => n !== null && e.change((e) => e.setVariable(t.name, n)), (e) => r(t, e)))
	});
}
var $ = (e, t = {}) => ({
	component: "blocks-value",
	unit: e,
	...t
}), Jt = { component: "site-size" }, Yt = $("rem", {
	units: [
		"rem",
		"px",
		"em"
	],
	step: .125,
	min: 0
});
function Xt({ label: e, value: t, same: n, onChange: r, disabled: i, size: a = "md" }) {
	let { engine: o } = F(), [s, c] = v(!1), l = (e) => j(o ? o.resolve(e) : e).light, u = t ?? n ?? "transparent";
	return /* @__PURE__ */ L(oe, {
		open: s,
		onOpenChange: c,
		align: "end",
		className: "!p-0",
		trigger: /* @__PURE__ */ L("span", {
			className: "group/swatch inline-flex",
			children: /* @__PURE__ */ L(w, {
				content: `${e} · ${t ?? f("Same")}`,
				children: /* @__PURE__ */ L(se, {
					compact: !0,
					"aria-label": e,
					disabled: i,
					className: T("relative shrink-0 rounded-sm outline-offset-2 group-data-[popup-open]/swatch:ring-2 group-data-[popup-open]/swatch:ring-border-strong group-data-[popup-open]/swatch:ring-offset-2 group-data-[popup-open]/swatch:ring-offset-bg", a === "md" ? "size-7" : "size-6"),
					children: /* @__PURE__ */ L(Ae, {
						color: l(u),
						className: T("!size-full !rounded-sm", t === null && "opacity-35")
					})
				})
			})
		}),
		children: /* @__PURE__ */ L(be, {
			label: e,
			value: t ?? void 0,
			onChange: r,
			clearable: n !== void 0
		})
	});
}
var Zt = (e, t, n, r) => e.writeUtility(t, [{
	name: "--scheme",
	value: n
}, {
	name: "--scheme-text",
	value: r
}], ["scheme"]);
function Qt({ edit: e }) {
	let { engine: t } = F(), n = P(e.sheet), r = (n) => {
		let r = j(t ? t.resolve(n) : n);
		return e.mode === "dark" ? r.dark ?? r.light : r.light;
	}, i = async () => {
		let t = Ut((await E({
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
			if (n.some((e) => e.key === t)) return void D.error(f("“{name}” already exists", { name: t }));
			e.change((e) => Zt(e, `${A}${t}`, "var(--color-foreground)", "var(--color-background)"));
		}
	}, a = async (t) => {
		let r = Ut((await E({
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
			if (n.some((e) => e.key === r)) return void D.error(f("“{name}” already exists", { name: r }));
			e.change((e) => e.renameUtility(t.name, `${A}${r}`));
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
				children: [/* @__PURE__ */ L(we, {
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
						/* @__PURE__ */ L(We, { on: o(t) }),
						/* @__PURE__ */ L(Xt, {
							size: "sm",
							label: f("{name} Background", { name: t.key }),
							value: t.background,
							disabled: e.readOnly,
							onChange: (n) => n && e.change((e) => Zt(e, t.name, n, t.text))
						}),
						/* @__PURE__ */ L(Xt, {
							size: "sm",
							label: f("{name} Text", { name: t.key }),
							value: t.text,
							disabled: e.readOnly,
							onChange: (n) => n && e.change((e) => Zt(e, t.name, t.background, n))
						}),
						/* @__PURE__ */ L(Ve, { items: V(e, {
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
function $t({ edit: e }) {
	let t = {
		prefix: "--color-",
		title: f("Site Colors"),
		add: f("Add Color"),
		start: re,
		placeholder: "brand"
	}, n = qt(e, t), r = Ht(e, t.prefix).filter((t) => !(t.builtIn && e.palette.has(t.name) && !t.written)), i = async () => {
		let n = await Wt(e, t.prefix, t.add, t.add, "", t.placeholder);
		n && e.change((e) => e.setVariable(`${t.prefix}${n}`, t.start));
	}, a = (t, n, r) => e.change((e) => e.setVariable(t.name, r && r !== n ? `light-dark(${n}, ${r})` : n));
	return /* @__PURE__ */ R(I, { children: [
		/* @__PURE__ */ L(en, { edit: e }),
		/* @__PURE__ */ L(H, {
			title: t.title,
			action: /* @__PURE__ */ R(I, { children: [
				/* @__PURE__ */ L(w, {
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
				/* @__PURE__ */ L(w, {
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
				e.readOnly && /* @__PURE__ */ L(Ue, {})
			] }),
			onAdd: e.readOnly ? void 0 : () => void i(),
			addLabel: t.add,
			children: r.map((t) => {
				let { light: r, dark: i } = j(t.value);
				return /* @__PURE__ */ R(W, {
					name: t.key,
					locked: t.builtIn,
					changed: z(e, t.name),
					wide: !0,
					menu: n(t),
					children: [/* @__PURE__ */ L(Xt, {
						label: f("{name} in Light Mode", { name: t.key }),
						value: r,
						disabled: e.readOnly,
						onChange: (e) => e && a(t, e, i)
					}), /* @__PURE__ */ L(Xt, {
						label: f("{name} in Dark Mode", { name: t.key }),
						value: i ?? null,
						same: r,
						disabled: e.readOnly,
						onChange: (e) => a(t, r, e ?? void 0)
					})]
				}, t.name);
			})
		}),
		/* @__PURE__ */ L(Qt, { edit: e })
	] });
}
function en({ edit: e }) {
	let { engine: n } = F(), i = (t) => e.sheet.variable(t) ?? e.defaults.get(t), a = (t) => {
		let r = i(t);
		if (!r) return;
		let a = j(n ? n.resolve(r) : r);
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
			].map((e) => /* @__PURE__ */ L("span", { className: T("pointer-events-none absolute bg-border-strong", e) }, e)),
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
function tn(e) {
	let t = e.flatMap((e) => String(e.weight ?? "400").split(/\s+/).map(Number)).filter((e) => e > 0), n = Math.min(...t), r = Math.max(...t), i = t.length === 0 ? "400" : n === r ? String(n) : `${n}–${r}`;
	return e.some((e) => e.style === "italic") ? `${i} · ${f("Italic")}` : i;
}
var nn = (e, t) => /* @__PURE__ */ L("p", {
	className: "m-0 truncate pb-2.5 text-ink",
	style: {
		fontSize: `min(${e}, 2.75rem)`,
		lineHeight: 1.1,
		fontFamily: t
	},
	children: f("Ship It")
});
function rn({ edit: e, fonts: i }) {
	let o = [...new Set(i.faces.map((e) => e.family))], s = new Set(Ht(e, "--font-", (e) => e.startsWith("weight-")).map((e) => t(r(e.value)))), c = o.map((e) => {
		let t = i.faces.filter((t) => t.family === e);
		return {
			family: e,
			styles: tn(t),
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
				below: nn(t.value, u),
				children: /* @__PURE__ */ L(U, {
					handle: t.name,
					label: t.key,
					value: t.value,
					disabled: e.readOnly,
					field: Jt,
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
					].map((e) => /* @__PURE__ */ L("span", { className: T("h-0.5 rounded-full bg-muted", e === 2 && "w-2/3") }, e))
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
var an = (e, t = Jt) => (n, r, i) => /* @__PURE__ */ L(W, {
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
function on({ edit: e }) {
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
			return /* @__PURE__ */ L(qe, {
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
function sn(e) {
	let t = /^(-?[\d.]+)(rem|px)$/.exec(e.trim());
	return t ? Number(t[1]) * (t[2] === "rem" ? 16 : 1) : null;
}
function cn({ step: e }) {
	let t = sn(e);
	return t === null ? null : /* @__PURE__ */ L("div", {
		className: "flex items-end gap-1.5 pb-3 pt-1",
		"aria-hidden": !0,
		children: Ce.filter((e) => e > 0).map((e) => {
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
function ln({ edit: e }) {
	let t = {
		prefix: "--spacing-",
		title: f("Spacing"),
		add: f("Add Spacing"),
		start: "2rem",
		placeholder: "gutter"
	}, n = qt(e, t), r = e.sheet.variable("--spacing"), i = async () => {
		let n = await Wt(e, t.prefix, t.add, t.add, "", t.placeholder);
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
				below: /* @__PURE__ */ L(cn, { step: a.value }),
				children: /* @__PURE__ */ L(U, {
					handle: "--spacing",
					label: a.key,
					value: a.value,
					disabled: e.readOnly,
					field: Jt,
					onChange: (t) => t !== null && e.change((e) => e.setVariable("--spacing", t))
				})
			}), Ht(e, t.prefix).map((t) => an(e)(t, (n) => n !== null && e.change((e) => e.setVariable(t.name, n)), (e) => n(t, e)))]
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
			row: an(e)
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
			row: an(e, Yt)
		}),
		/* @__PURE__ */ L(on, { edit: e })
	] });
}
function un({ edit: t }) {
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
			row: an(t, $("px", {
				units: ["px", "rem"],
				step: 10,
				min: 0
			}))
		})
	] });
}
function dn(e, t) {
	let n = String(e ?? "").trim().match(/^(\d*\.?\d+)\s*(ms|s)?$/);
	if (!n) return t;
	let r = n[2] === "s" ? Number(n[1]) : Number(n[1]) / 1e3;
	return Math.min(2, Math.max(.05, Math.round(r * 1e3) / 1e3));
}
function fn({ edit: e, transition: t, saved: n, onTransition: r }) {
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
			children: [/* @__PURE__ */ L(qe, {
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
			}), /* @__PURE__ */ L(qe, {
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
				/* @__PURE__ */ L(qe, {
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
				t.type !== "none" && /* @__PURE__ */ L(qe, {
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
							duration: dn(e, t.duration)
						})
					})
				}),
				/* @__PURE__ */ L(qe, {
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
var pn = {}, mn = [
	"colors",
	"typography",
	"layout",
	"effects",
	"motion",
	"classes"
], hn = (e) => ({
	colors: f("Colors"),
	typography: f("Typography"),
	layout: f("Layout"),
	effects: f("Effects"),
	motion: f("Motion"),
	classes: f("Classes")
})[e], gn = (e, t) => JSON.stringify(e ?? null) === JSON.stringify(t ?? null), _n = /* @__PURE__ */ new Map(), vn = (e, t) => e.css === t.css && gn(e.transition, t.transition);
function yn({ params: e }) {
	let t = p("styling/get", {}, {
		refetchOnWindowFocus: !1,
		retry: !1
	}), n = p("styling/source", {}, {
		refetchOnWindowFocus: !1,
		retry: !1,
		staleTime: 6e4
	}), [r, i] = v(pn), [a, ...y] = (e["*"] ?? "").split("/").filter(Boolean), b = mn.includes(a) ? a : null;
	m(() => {
		b || u("/design/colors", { replace: !0 });
	}, [b]);
	let ee = b === "classes" && y.length > 0 && !!t.data && Rt(new Oe(r.css ?? t.data.css), y) === null;
	m(() => {
		ee && u(Z(), { replace: !0 });
	}, [ee]);
	let [x, ne] = v(ve() === "dark" ? "dark" : "light"), [re, ie] = v(!1), [oe, se] = v(() => window.matchMedia("(max-width: 767px)").matches);
	m(() => {
		let e = window.matchMedia("(max-width: 767px)"), t = () => se(e.matches);
		return e.addEventListener("change", t), () => e.removeEventListener("change", t);
	}, []);
	let S = re && oe, [C, ge] = v("desktop"), [_e, O] = v(!1), [be, xe] = v(null), Se = _(null), k = t.data, A = r.css ?? k?.css, Ce = r.transition ?? k?.transition, we = !!k && (r.css !== void 0 && r.css !== k.css || r.transition !== void 0 && !gn(r.transition, k.transition)), Te = !c("settings.manage"), Ee = g(() => new Oe(A ?? ""), [A]), De = g(() => new Oe(k?.css ?? ""), [k?.css]), Ae = Xe(n.data, A), j = g(() => Ee.variables().some((e) => e.value.startsWith("light-dark(")) || /color-scheme\s*:\s*light\s+dark\b/.test(Ee.css), [Ee]), [M, je] = v(null);
	m(() => {
		Me().then(je);
	}, []);
	let N = _(null), P = e["*"] ?? "", Ne = _(P);
	Ne.current !== P && (N.current && _n.set(Ne.current, N.current.scrollTop), Ne.current = P);
	let Pe = !!t.data && !!n.data && M !== null;
	h(() => {
		Pe && N.current && (N.current.scrollTop = _n.get(P) ?? 0);
	}, [P, Pe]);
	let Fe = g(() => A !== void 0 && Ce ? {
		css: A,
		transition: Ce
	} : void 0, [A, Ce]), Ie = ye(Fe, (e) => i({
		css: e.css,
		transition: e.transition
	}), vn), Re = async (e) => {
		try {
			let { snapshot: t } = await d("revisions/get", { id: e });
			i({
				css: t.css,
				transition: t.transition
			});
		} catch (e) {
			D.error(e);
		}
	}, F = n.data?.files.cms, ze = g(() => {
		let e = /* @__PURE__ */ new Map();
		for (let t of [...Le(M ?? ""), ...Le(F ?? "")]) e.set(t.name, t.value);
		return e;
	}, [M, F]), Be = g(() => new Set(Le(M ?? "").filter((e) => e.name.startsWith("--color-")).map((e) => e.name)), [M]), z = g(() => o(M ?? "", A ?? ""), [M, A]);
	if (m(() => {
		let e = document.createElement("style");
		return e.textContent = (k?.fonts ?? []).map((e) => `@font-face{font-family:"${e.family}";src:url("${/^(https:\/\/|\/)/.test(e.src) ? e.src : `/_cms/fonts/${e.src.split("/").pop()}`}") format("woff2");font-weight:${e.weight ?? "400"};font-style:${e.style ?? "normal"};font-display:swap}`).join("\n"), document.head.appendChild(e), () => e.remove();
	}, [k?.fonts]), !b || t.isLoading || n.isLoading || M === null) return /* @__PURE__ */ L("div", {
		className: "grid h-full place-items-center text-faint",
		children: /* @__PURE__ */ L(de, {})
	});
	if (!k || !n.data || A === void 0 || !Ce) return /* @__PURE__ */ R("div", {
		className: "flex h-full flex-col",
		children: [/* @__PURE__ */ L(fe, { crumbs: [{ label: hn(b) }] }), /* @__PURE__ */ L(ce, {
			title: f("Couldn’t load the design"),
			onRetry: () => {
				t.refetch(), n.refetch();
			},
			retrying: t.isRefetching || n.isRefetching
		})]
	});
	let B = {
		sheet: Ee,
		saved: De,
		change: (e) => !Te && i((t) => ({
			...t,
			css: e(new Oe(t.css ?? k.css)).css
		})),
		readOnly: Te,
		defaults: ze,
		palette: Be,
		keyframes: z,
		mode: j ? x : "light"
	}, V = {
		compiler: Ae.compiler,
		device: S ? "phone" : C
	}, Ve = b === "classes" ? Rt(Ee, y) : null, He = () => {
		l("styling/", "revisions/"), Se.current?.contentWindow?.location.reload();
	}, Ue = async () => {
		if (we && !_e) {
			O(!0), xe(null);
			try {
				let e = {};
				r.css !== void 0 && r.css !== k.css && (e.css = r.css), r.transition !== void 0 && !gn(r.transition, k.transition) && (e.transition = r.transition), Object.keys(e).length > 0 && await d("styling/update", e), await Promise.all([t.refetch(), n.refetch()]), i(pn), Se.current?.contentWindow?.location.reload();
			} catch (e) {
				xe({
					message: e instanceof Error ? e.message : String(e),
					refused: e instanceof s && e.type === "invalid_input"
				});
			} finally {
				O(!1);
			}
		}
	}, We = {
		faces: k.fonts,
		add: async (e) => {
			try {
				if (e === "google") {
					let e = await E({
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
					return D.success(f("{family} added", { family: t })), He(), {
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
				}), r = t.name.replace(/\.woff2$/i, ""), i = await E({
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
				}), D.success(f("{family} uploaded", { family: a })), He(), {
					family: a,
					fallback: !1
				}) : null;
			} catch (e) {
				return D.error(e), null;
			}
		},
		remove: async (e) => {
			if (await he({
				title: f("Remove {family}?", { family: e }),
				confirm: f("Remove Font"),
				danger: !0
			})) try {
				await d("styling/update", { fonts: k.fonts.filter((t) => t.family !== e) }), He();
			} catch (e) {
				D.error(e);
			}
		},
		preload: async (e, t) => {
			let n = k.fonts.some((t) => t.family === e && t.style !== "italic");
			try {
				await d("styling/update", { fonts: k.fonts.map((r) => r.family === e ? {
					...r,
					preload: t && (!n || r.style !== "italic")
				} : r) }), He();
			} catch (e) {
				D.error(e);
			}
		}
	}, Ge = /* @__PURE__ */ R(I, { children: [
		b === "colors" && /* @__PURE__ */ L($t, { edit: B }),
		b === "typography" && /* @__PURE__ */ L(rn, {
			edit: B,
			fonts: We
		}),
		b === "layout" && /* @__PURE__ */ L(ln, { edit: B }),
		b === "effects" && /* @__PURE__ */ L(un, { edit: B }),
		b === "motion" && /* @__PURE__ */ L(fn, {
			edit: B,
			transition: Ce,
			saved: k.transition,
			onTransition: (e) => !Te && i((t) => ({
				...t,
				transition: e
			}))
		}),
		b === "classes" && /* @__PURE__ */ L(Vt, {
			edit: B,
			samples: V,
			path: y
		}, y[0] ?? "")
	] });
	return /* @__PURE__ */ R("div", {
		className: "flex h-full flex-col",
		children: [
			/* @__PURE__ */ L(fe, {
				divided: !0,
				crumbs: Ve ?? [{ label: hn(b) }],
				actions: /* @__PURE__ */ R(I, { children: [
					/* @__PURE__ */ L("span", {
						className: "md:hidden",
						children: /* @__PURE__ */ L(w, {
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
					!Te && /* @__PURE__ */ R(I, { children: [/* @__PURE__ */ L(pe, { history: Ie }), /* @__PURE__ */ L("span", {
						className: "max-sm:hidden",
						children: /* @__PURE__ */ L(me, {
							of: {
								kind: "styling",
								subject: "theme"
							},
							onOpen: (e) => void Re(e.id)
						})
					})] }),
					/* @__PURE__ */ L("span", {
						className: "max-md:hidden",
						children: /* @__PURE__ */ L(ue, {
							size: "xs",
							"aria-label": f("Screen"),
							value: C,
							onChange: ge,
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
					j && /* @__PURE__ */ L(ue, {
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
					/* @__PURE__ */ L(w, {
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
				dirty: we,
				saving: _e,
				error: be ? be.refused ? f("The stylesheet was not saved") : be.message : null,
				onSave: () => void Ue(),
				onDiscard: () => {
					i(pn), xe(null);
				}
			}),
			/* @__PURE__ */ L(ke, {
				source: Ae.source ?? n.data,
				children: /* @__PURE__ */ R("div", {
					className: "grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(320px,380px)_minmax(0,1fr)] xl:grid-cols-[minmax(360px,420px)_minmax(0,1fr)]",
					children: [/* @__PURE__ */ L("div", {
						className: T("flex min-h-0 flex-col border-border md:border-r", S && "max-md:hidden"),
						children: /* @__PURE__ */ R("div", {
							ref: N,
							onScroll: (e) => _n.set(P, e.currentTarget.scrollTop),
							className: "min-h-0 flex-1 overflow-y-auto px-4 pb-16 pt-2",
							children: [be?.refused && /* @__PURE__ */ L(ae, {
								tone: "danger",
								className: "mb-3 mt-1",
								title: f("Tailwind refused the stylesheet"),
								onDismiss: () => xe(null),
								children: be.message
							}), Ge]
						})
					}), /* @__PURE__ */ L("div", {
						className: T("flex min-w-0 flex-col bg-sunken", !S && "max-md:hidden"),
						children: /* @__PURE__ */ L(bn, {
							frame: Se,
							compile: Ae,
							published: k.stylesheet,
							viewport: S ? "phone" : C,
							mode: j ? x : null
						})
					})]
				})
			})
		]
	});
}
function bn(e) {
	let { breakpoints: t } = F();
	return /* @__PURE__ */ L(tt, {
		...e,
		desktop: t.find((e) => e.name === "lg")?.width ?? 1024
	});
}
export { yn as default };
