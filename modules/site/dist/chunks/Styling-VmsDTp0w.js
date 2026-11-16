import { a as e, c as t, d as n, l as r, n as i, s as a, u as o } from "./fields-CKXhwyJc.js";
import { CmsError as s, can as c, invalidate as l, run as u, setQuery as ee, t as d, useAbility as f, useLocation as p } from "@letterncms/sdk";
import { useEffect as m, useLayoutEffect as te, useMemo as h, useRef as g, useState as _ } from "react";
import { Button as v, Fields as ne, Icon as y, IconButton as b, Menu as re, NEW_COLOR as ie, Notice as ae, Popover as oe, Pressable as x, QueryError as S, SaveBar as C, ScreenSidebar as w, Segmented as se, SidebarRow as T, Spinner as E, Tooltip as D, Topbar as ce, cn as O, confirm as le, copyText as ue, deviceWidths as k, prompt as de, toast as A, useScreenSidebar as fe, useTheme as pe } from "@letterncms/ui";
import { ARTICLE as j, ColorPicker as me, FIELDS as he, InspectorSection as ge, PaletteGrid as M, PanelFields as _e, SCHEME as ve, SPACING_STEPS as ye, SchemeTile as N, Specimen as P, StyleBar as be, StylePanels as xe, Stylesheet as Se, StylingProvider as Ce, Swatch as we, lightDark as F, loadCompiler as Te, loadEngine as Ee, loadTailwindTheme as De, parseClass as I, schemesOf as Oe, screenFor as L, styleApi as R, styleLabel as z, styleSample as B, themeDefaults as ke, useSpecimenSheet as Ae, useStyling as V, withVariants as je } from "@letterncms/blocks";
import { Fragment as H, jsx as U, jsxs as W } from "react/jsx-runtime";
// admin/src/parts.tsx
var Me = "cms-reveal shrink-0", G = () => /* @__PURE__ */ U("span", { className: "size-6 shrink-0" });
function K({ title: e, onAdd: t, addLabel: n, action: r, children: i }) {
	return /* @__PURE__ */ W("section", {
		className: "mb-6",
		children: [
			e && /* @__PURE__ */ W("div", {
				className: "flex h-9 items-center justify-between border-b border-border",
				children: [
					/* @__PURE__ */ U("h3", {
						className: "m-0 text-xs font-semibold text-ink",
						children: e
					}),
					r,
					t && n && /* @__PURE__ */ U(D, {
						content: n,
						children: /* @__PURE__ */ U(b, {
							icon: "plus",
							label: n,
							title: void 0,
							size: "xs",
							onClick: t
						})
					})
				]
			}),
			i,
			!e && (r || t && n) && /* @__PURE__ */ U("div", {
				className: "flex h-9 items-center border-t border-border",
				children: r ?? /* @__PURE__ */ U(v, {
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
function q({ handle: e, label: t, value: n, onChange: r, field: i, disabled: a, className: o }) {
	return /* @__PURE__ */ U(ne, {
		bare: !0,
		className: O("flex min-w-0 flex-1", o),
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
function J({ name: e, copy: t = e, sample: n, after: r, below: i, wide: a, menu: o, children: s }) {
	return /* @__PURE__ */ W("div", {
		className: "cms-reveal-row group border-b border-border last:border-b-0",
		children: [/* @__PURE__ */ W("div", {
			className: "flex min-h-9 items-center gap-2 py-1",
			children: [
				n !== void 0 && /* @__PURE__ */ U("span", {
					className: "grid w-7 shrink-0 place-items-center",
					children: n
				}),
				/* @__PURE__ */ U(D, {
					content: d("Copy Name"),
					children: /* @__PURE__ */ U(v, {
						variant: "ghost",
						size: "xs",
						onClick: () => void ue(t, { copied: d("Copied {reference}", { reference: t }) }),
						"aria-label": d("Copy {reference}", { reference: t }),
						className: O("!justify-start !bg-transparent !px-0 text-left font-mono !font-normal hover:text-ink", a ? "min-w-0 flex-1 shrink" : n === void 0 ? "w-[120px] max-sm:w-20" : "w-[84px] max-sm:w-16"),
						children: /* @__PURE__ */ U("span", {
							className: "truncate",
							children: e
						})
					})
				}),
				a ? s : /* @__PURE__ */ U("div", {
					className: "flex w-60 min-w-0 shrink gap-1 max-lg:w-52 max-sm:w-auto max-sm:flex-1",
					children: s
				}),
				!a && /* @__PURE__ */ U("span", {
					className: "flex min-w-0 flex-1 items-center max-sm:hidden",
					children: r
				}),
				o && o.length > 0 ? /* @__PURE__ */ U(re, {
					trigger: /* @__PURE__ */ U(b, {
						icon: "more",
						label: d("Actions"),
						size: "xs",
						className: Me
					}),
					items: o
				}) : /* @__PURE__ */ U(G, {})
			]
		}), i]
	});
}
function Ne({ label: e, action: t, children: n }) {
	return /* @__PURE__ */ W("div", {
		className: "cms-reveal-row flex min-h-9 items-center gap-2 border-b border-border py-1 last:border-b-0",
		children: [
			/* @__PURE__ */ U("span", {
				className: "w-[120px] shrink-0 truncate text-xs text-text max-sm:w-20",
				children: e
			}),
			/* @__PURE__ */ U("div", {
				className: "flex w-60 min-w-0 shrink items-center max-lg:w-52 max-sm:w-auto max-sm:flex-1",
				children: n
			}),
			/* @__PURE__ */ U("span", { className: "min-w-0 flex-1 max-sm:hidden" }),
			t ? /* @__PURE__ */ U("span", {
				className: Me,
				children: t
			}) : /* @__PURE__ */ U(G, {})
		]
	});
}
function Pe({ onOpen: e, label: t, sample: n, menu: r }) {
	return /* @__PURE__ */ W("div", {
		className: "cms-reveal-row group flex items-center gap-2 border-b border-border py-1.5 last:border-b-0",
		children: [/* @__PURE__ */ W(v, {
			variant: "ghost",
			onClick: e,
			className: "!h-auto min-w-0 flex-1 shrink !justify-start !gap-3 !rounded-xs !bg-transparent !px-0 text-left !text-xs !font-normal focus-visible:!-outline-offset-2 hover:text-ink",
			children: [
				/* @__PURE__ */ U("span", {
					className: "w-28 shrink-0 truncate text-text max-sm:w-20",
					children: t
				}),
				n,
				/* @__PURE__ */ U(y, {
					name: "chevron-right",
					size: 12,
					className: "shrink-0 text-faint"
				})
			]
		}), r ?? /* @__PURE__ */ U(G, {})]
	});
}
// admin/src/preview.tsx
var Fe = {
	desktop: "100%",
	tablet: `${k.tablet}px`,
	phone: `${k.phone}px`
};
function Ie(e, t) {
	let [n, r] = _({
		source: void 0,
		compiler: null,
		problem: null
	}), i = g({
		base: e,
		css: t
	});
	i.current = {
		base: e,
		css: t
	};
	let a = g(!1), o = g({}), s = g(!1), c = g(!0);
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
							let n = await Te(t);
							if (n.build(e.base.candidates), !await Ee(t)) throw Error(d("Tailwind could not read the stylesheet."));
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
function Le({ viewport: e, desktop: t, children: n }) {
	let r = g(null), [i, a] = _({
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
	let o = e === "desktop" ? Math.max(i.width, t) : parseFloat(Fe[e]), s = i.width ? Math.min(1, i.width / o) : 1;
	return /* @__PURE__ */ U("div", {
		ref: r,
		className: "relative min-h-0 flex-1 overflow-hidden",
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
var Re = "cms-styling-draft";
function ze(e, t, n, r) {
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
	let l = e.getElementById(Re);
	l || (l = e.createElement("style"), l.id = Re, o[0] ? o[0].after(l) : e.head.appendChild(l)), l.textContent !== c && (l.textContent = c);
	for (let e of o) e.disabled = !0;
}
function Be({ frame: e, compile: t, published: n, viewport: r, desktop: i, mode: a, bordered: o }) {
	let [s, c] = _(0);
	return m(() => ze(e.current?.contentDocument, t, n, a), [
		e,
		t,
		n,
		a,
		s
	]), /* @__PURE__ */ W("div", {
		className: "relative flex min-h-0 flex-1 flex-col",
		children: [/* @__PURE__ */ U(Le, {
			viewport: r,
			desktop: i,
			children: (t) => /* @__PURE__ */ U("iframe", {
				ref: e,
				src: "/",
				title: d("Site Preview"),
				className: O("border-0 bg-bg", o && "border-x border-border"),
				style: t,
				onLoad: () => c((e) => e + 1)
			})
		}), t.problem && /* @__PURE__ */ U("div", {
			className: "absolute inset-x-3 top-3 rounded-lg bg-bg shadow-raise",
			children: /* @__PURE__ */ U(ae, {
				tone: "warning",
				title: d("Tailwind can’t read the stylesheet"),
				children: t.problem
			})
		})]
	});
}
// admin/src/styles.tsx
var Ve = (e) => e.replace(/^!|!$/g, ""), He = (e) => e.split(/\s+/).filter(Boolean), Ue = (e) => e.elements().find((e) => e.name === "body")?.classes.join(" ") ?? "", We = [
	"typography",
	"spacing",
	"fill",
	"border",
	"effects",
	"transition"
], Ge = () => [
	{
		selector: "body",
		label: d("Page"),
		node: {
			tag: "p",
			text: d("Page")
		},
		groups: ["typography", "fill"]
	},
	{
		selector: "::selection",
		label: d("Selection"),
		node: {
			tag: "span",
			text: d("Selection")
		},
		groups: ["typography", "fill"]
	},
	{
		selector: ":focus-visible",
		label: d("Focus Ring"),
		node: {
			tag: "span",
			text: d("Focus Ring"),
			className: "inline-block rounded-sm px-2"
		},
		groups: ["border", "effects"]
	},
	{
		selector: "hr",
		label: d("Divider"),
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
	}
], Ke = () => [
	{
		selector: "h1",
		label: d("Heading 1"),
		node: {
			tag: "h1",
			text: d("Heading 1")
		}
	},
	{
		selector: "h2",
		label: d("Heading 2"),
		node: {
			tag: "h2",
			text: d("Heading 2")
		}
	},
	{
		selector: "h3",
		label: d("Heading 3"),
		node: {
			tag: "h3",
			text: d("Heading 3")
		}
	},
	{
		selector: "h4",
		label: d("Heading 4"),
		node: {
			tag: "h4",
			text: d("Heading 4")
		}
	},
	{
		selector: "h5",
		label: d("Heading 5"),
		node: {
			tag: "h5",
			text: d("Heading 5")
		}
	},
	{
		selector: "h6",
		label: d("Heading 6"),
		node: {
			tag: "h6",
			text: d("Heading 6")
		}
	},
	{
		selector: "p",
		label: d("Paragraph"),
		node: {
			tag: "p",
			text: d("Paragraph")
		}
	},
	{
		selector: "a",
		label: d("Link"),
		node: {
			tag: "a",
			text: d("Link"),
			attributes: { href: "#" }
		}
	},
	{
		selector: "strong",
		label: d("Bold"),
		node: {
			tag: "strong",
			text: d("Bold")
		}
	},
	{
		selector: "small",
		label: d("Small"),
		node: {
			tag: "small",
			text: d("Small")
		}
	},
	{
		selector: "blockquote",
		label: d("Quote"),
		node: {
			tag: "blockquote",
			text: d("Quote")
		}
	},
	{
		selector: "code",
		label: d("Code"),
		node: {
			tag: "code",
			text: d("Code")
		}
	},
	{
		selector: "figcaption",
		label: d("Caption"),
		node: {
			tag: "figcaption",
			text: d("Caption")
		}
	}
], Y = (e) => ({
	tag: "div",
	text: "",
	markup: `<div class="cms-prose">${e}</div>`
}), qe = () => [
	{
		key: "h2",
		selector: j.h2,
		label: d("Heading 2"),
		node: Y(`<h2 style="margin:0">${d("Heading 2")}</h2>`)
	},
	{
		key: "h3",
		selector: j.h3,
		label: d("Heading 3"),
		node: Y(`<h3 style="margin:0">${d("Heading 3")}</h3>`)
	},
	{
		key: "p",
		selector: j.p,
		label: d("Paragraph"),
		node: Y(`<p style="margin:0">${d("Paragraph")}</p>`)
	},
	{
		key: "li",
		selector: j.li,
		label: d("List Item"),
		node: Y(`<ul><li>${d("List Item")}</li></ul>`)
	},
	{
		key: "blockquote",
		selector: j.blockquote,
		label: d("Quote"),
		node: Y(`<blockquote style="margin:0">${d("Quote")}</blockquote>`)
	},
	{
		key: "figure",
		selector: j.figure,
		label: d("Figure"),
		node: Y(`<figure style="margin:0">${d("Figure")}</figure>`),
		groups: [
			"spacing",
			"border",
			"effects"
		]
	},
	{
		key: "a",
		selector: j.a,
		label: d("Link"),
		node: Y(`<p><a href="#">${d("Link")}</a></p>`)
	}
];
function Je(e, t) {
	return !e || t.length === 0 ? !1 : t.every((t) => {
		let n = e.declarations(Ve(I(t).utility));
		return !!n && n.every((e) => /^(font|text-(?!indent)|letter|line-height|color$|white-space|word|overflow-wrap|hyphens|--tw-(font|leading|tracking|ordinal|slashed|numeric|text))/.test(e.property));
	});
}
function Ye(e, t, n) {
	let r = (e) => {
		let { variants: r, utility: i } = I(e);
		return Ve(i) === t ? je(r, i.replace(t, n)) : e;
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
var Xe = (e) => String(e ?? "").trim().toLowerCase().replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/^-+|-+$/g, "");
async function Ze(e, t, n, r, i = "", a = "") {
	let o = Xe((await de({
		title: n,
		fields: [{
			handle: "name",
			type: "text",
			label: d("Name"),
			placeholder: i ? "outline" : "lead",
			required: !0,
			autofocus: !0
		}],
		values: { name: a ? z(a) : "" },
		confirm: r
	}))?.name);
	if (!o) return null;
	let s = `${i}${o}`;
	return s === a ? null : /^[a-z][a-z0-9-]*$/.test(s) ? t.includes(s) || e?.valid(s) ? (A.error(d("There is already a style “{name}”.", { name: z(s) })), null) : s : (A.error(d("A name is lowercase letters, numbers and hyphens, and starts with a letter.")), null);
}
function Qe({ edit: e, samples: t, name: n, selector: r, node: i, classes: a, groups: o, write: s, menu: c }) {
	let l = V(), [u, ee] = _([]), d = h(() => L(t.device, 1280, l.breakpoints), [t.device, l.breakpoints]), f = R(l.engine, a, d, u, e.readOnly ? () => {} : s), p = Ue(e.sheet), m = Ae(t.compiler, [
		...He(p),
		...a.map((e) => Ve(I(e).utility)),
		...a,
		...He(i.className ?? "")
	]);
	return /* @__PURE__ */ W("div", {
		className: "-mx-4 -mt-2",
		children: [
			/* @__PURE__ */ U("div", {
				className: "sticky top-0 z-raised bg-bg",
				children: /* @__PURE__ */ U(be, {
					s: f,
					site: l.classes,
					source: l.source,
					disabled: e.readOnly,
					state: {
						classes: a,
						engine: l.engine,
						state: u,
						onState: ee
					},
					lead: /* @__PURE__ */ U($e, {
						name: n,
						selector: r
					}),
					actions: /* @__PURE__ */ U(et, { menu: c })
				})
			}),
			/* @__PURE__ */ U("div", {
				className: "border-b border-border p-4",
				children: /* @__PURE__ */ U(P, {
					sheet: m,
					node: i,
					page: p,
					mode: e.mode,
					align: "center",
					className: "h-28 rounded-md border border-border"
				})
			}),
			/* @__PURE__ */ U("div", {
				inert: e.readOnly,
				children: /* @__PURE__ */ U(xe, {
					s: f,
					groups: o
				})
			})
		]
	});
}
function $e({ name: e, selector: t }) {
	return /* @__PURE__ */ U("div", {
		className: "flex min-h-8 min-w-0 flex-1 items-center",
		children: e ? /* @__PURE__ */ U(D, {
			content: d("Copy Name"),
			children: /* @__PURE__ */ U(v, {
				variant: "ghost",
				size: "xs",
				onClick: () => void ue(e, { copied: d("Copied {reference}", { reference: e }) }),
				className: "min-w-0 shrink !px-1.5 font-mono !font-normal !text-muted hover:!text-ink",
				children: /* @__PURE__ */ W("span", {
					className: "truncate",
					children: [".", e]
				})
			})
		}) : t && /* @__PURE__ */ U("span", {
			className: "min-w-0 truncate px-1.5 font-mono text-xs text-muted",
			children: t
		})
	});
}
var et = ({ menu: e }) => e && e.length > 0 ? /* @__PURE__ */ U(re, {
	align: "end",
	trigger: /* @__PURE__ */ U(b, {
		icon: "more",
		label: d("Style Actions"),
		size: "sm"
	}),
	items: e
}) : null, X = (e, t) => ({
	property: e,
	label: t,
	field: {
		type: "color",
		component: "blocks-color"
	}
}), Z = (e, t, n = "px", r = ["px", "rem"]) => ({
	property: e,
	label: t,
	field: {
		component: "blocks-value",
		unit: n,
		units: r,
		min: 0,
		step: n === "px" ? 1 : .125
	}
}), tt = () => ({
	"var(--font-weight-normal)": d("Regular"),
	"var(--font-weight-medium)": d("Medium"),
	"var(--font-weight-semibold)": d("Semibold"),
	"var(--font-weight-bold)": d("Bold")
}), nt = () => [
	{
		key: "form:fields",
		label: d("Fields"),
		selector: he,
		layer: "base",
		sample: {
			tag: "div",
			text: "",
			markup: "<input class=\"cms-input\" placeholder=\"you@example.com\" tabindex=\"-1\" style=\"width:16rem\">"
		},
		sections: [
			{
				title: d("Field"),
				values: [
					X("--field-background", d("Fill")),
					X("--field-color", d("Text")),
					X("--field-placeholder", d("Placeholder")),
					Z("--field-border-width", d("Border")),
					X("--field-border-color", d("Border Color")),
					Z("--field-radius", d("Radius"), "rem", ["rem", "px"]),
					{
						property: "--field-shadow",
						label: d("Shadow"),
						field: { component: "site-shadow" }
					}
				]
			},
			{
				title: d("Pointed At"),
				values: [X("--field-hover-background", d("Fill")), X("--field-hover-border-color", d("Border Color"))]
			},
			{
				title: d("Focus"),
				values: [
					X("--field-focus-background", d("Fill")),
					X("--field-focus-border-color", d("Border Color")),
					X("--field-focus-ring-color", d("Ring")),
					Z("--field-focus-ring-width", d("Ring Width"))
				]
			},
			{
				title: d("Error"),
				values: [X("--field-invalid-color", d("Color"))]
			}
		]
	},
	{
		key: "form:labels",
		label: d("Labels"),
		selector: he,
		layer: "base",
		sample: {
			tag: "div",
			text: "",
			markup: `<div class="cms-field"><label class="cms-label">${d("Email")}</label><p class="cms-help">${d("We never share it.")}</p></div>`
		},
		sections: [
			{
				title: d("Label"),
				values: [
					{
						property: "--field-label-font-size",
						label: d("Size"),
						field: { component: "site-size" }
					},
					{
						property: "--field-label-font-weight",
						label: d("Weight"),
						field: {
							type: "select",
							options: tt()
						}
					},
					X("--field-label-color", d("Color"))
				]
			},
			{
				title: d("Help"),
				values: [{
					property: "--field-help-font-size",
					label: d("Size"),
					field: { component: "site-size" }
				}, X("--field-help-color", d("Color"))]
			},
			{
				title: d("Spacing"),
				values: [Z("--field-spacing-fields", d("Between Fields"), "rem", ["rem", "px"]), Z("--field-spacing-label", d("Under Label"), "rem", ["rem", "px"])]
			}
		]
	},
	{
		key: "form:choices",
		label: d("Choices"),
		selector: he,
		layer: "base",
		sample: {
			tag: "div",
			text: "",
			markup: rt()
		},
		sections: [
			{
				title: d("Checkbox"),
				values: [
					Z("--field-checkbox-size", d("Size"), "rem", ["rem", "px"]),
					Z("--field-checkbox-radius", d("Radius")),
					X("--field-checkbox-checked", d("Checked")),
					X("--field-checkbox-mark-color", d("Mark"))
				]
			},
			{
				title: d("Radio Button"),
				values: [X("--field-radio-checked", d("Checked"))]
			},
			{
				title: d("Switch"),
				values: [X("--field-switch-off", d("Off")), X("--field-switch-on", d("On"))]
			}
		]
	}
], rt = () => `<div style="display:flex;gap:1rem;white-space:nowrap"><label class="cms-choice"><input type="checkbox" class="cms-check" checked tabindex="-1"> ${d("Newsletter")}</label><label class="cms-choice"><input type="radio" class="cms-radio" checked tabindex="-1"> ${d("Lunch")}</label><label class="cms-choice"><input type="checkbox" role="switch" class="cms-switch" checked tabindex="-1"> ${d("Reminders")}</label></div>`, it = () => ({
	tag: "form",
	text: "",
	markup: `<div class="cms-form" style="white-space:normal">
<div class="cms-field"><label class="cms-label">${d("Email")}</label><input class="cms-input" placeholder="you@example.com" tabindex="-1"><p class="cms-help">${d("We never share it.")}</p></div>
<div class="cms-field"><select class="cms-input" tabindex="-1"><option>${d("Dinner for two")}</option></select></div>
${rt()}
</div>`
}), at = () => ({
	key: "article:spacing",
	label: d("Spacing in Articles"),
	selector: j.spacing,
	layer: "components",
	sample: Y(`<h2 style="margin:0">${d("Heading 2")}</h2><p>${d("Paragraph")}</p><p>${d("Paragraph")}</p><ul><li>${d("List Item")}</li><li>${d("List Item")}</li></ul>`),
	sections: [{
		title: "spacing",
		values: [
			Z("--prose-blocks", d("Blocks"), "em", [
				"em",
				"rem",
				"px"
			]),
			Z("--prose-headings", d("Above Headings"), "em", [
				"em",
				"rem",
				"px"
			]),
			Z("--prose-after-headings", d("Below Headings"), "em", [
				"em",
				"rem",
				"px"
			]),
			Z("--prose-items", d("List Items"), "em", [
				"em",
				"rem",
				"px"
			])
		]
	}]
});
function ot({ edit: e, samples: t, part: n }) {
	let { source: r } = V(), i = h(() => new Se(r?.files.cms ?? ""), [r?.files.cms]), a = Ue(e.sheet), o = Ae(t.compiler, He(a)), s = (t) => e.sheet.property(n.selector, t, n.layer), c = n.layer === "base" ? it() : n.sample;
	return /* @__PURE__ */ W("div", {
		className: "-mx-4 -mt-2",
		children: [
			/* @__PURE__ */ W("div", {
				className: "sticky top-0 z-raised flex items-center gap-1 border-b border-border bg-bg py-2 pl-4 pr-3",
				children: [/* @__PURE__ */ U($e, {}), /* @__PURE__ */ U(et, { menu: st(e, n) })]
			}),
			/* @__PURE__ */ U("div", {
				className: "border-b border-border p-4",
				children: /* @__PURE__ */ U(P, {
					sheet: o,
					node: c,
					page: a,
					mode: e.mode,
					align: "center",
					className: "h-64 rounded-md border border-border"
				})
			}),
			/* @__PURE__ */ U("div", {
				inert: e.readOnly,
				children: n.sections.map((t) => {
					let r = /* @__PURE__ */ U(_e, {
						fields: t.values.map((t) => ({
							handle: t.property,
							type: "text",
							size: "sm",
							label: t.label,
							...t.field,
							status: s(t.property) === void 0 ? void 0 : "own",
							reset: () => e.change((e) => e.setProperty(n.selector, t.property, null, n.layer))
						})),
						values: Object.fromEntries(t.values.map((e) => [e.property, s(e.property) ?? i.property(n.selector, e.property, n.layer) ?? null])),
						onChange: (t, r) => e.change((e) => e.setProperty(n.selector, t, r == null || r === "" ? null : String(r), n.layer))
					});
					return n.sections.length === 1 ? /* @__PURE__ */ U("div", {
						className: "space-y-1 px-4 py-3",
						children: r
					}, t.title) : /* @__PURE__ */ U(ge, {
						title: t.title,
						children: r
					}, t.title);
				})
			})
		]
	});
}
function st(e, t) {
	let n = t.sections.flatMap((e) => e.values);
	return e.readOnly || !n.some((n) => e.sheet.property(t.selector, n.property, t.layer) !== void 0) ? [] : [{
		label: d("Reset"),
		icon: "undo",
		onSelect: () => e.change((e) => n.reduce((e, n) => e.setProperty(t.selector, n.property, null, t.layer), e))
	}];
}
function ct({ edit: e, samples: t }) {
	let { engine: n } = V(), r = p().query.style ?? "", i = (e) => ee({
		style: e,
		tab: "styles"
	}, !1), [a, o] = _(null), s = [...e.sheet.elements(), ...e.sheet.elements("components")], c = (e) => s.find((t) => t.name === e)?.classes ?? [], l = e.sheet.utilities().filter((e) => /^[a-z][\w-]*$/.test(e.name) && !e.name.startsWith("scheme-")), u = l.filter((e) => e.name.startsWith("btn-")), f = l.filter((e) => !e.name.startsWith("btn-")), m = f.filter((e) => Je(n, e.classes) || a?.name === e.name && a.text), te = f.filter((e) => !m.includes(e)), h = Ue(e.sheet), g = Ae(t.compiler, [
		...He(h),
		...c("::selection"),
		...c(":focus-visible"),
		...Ge().flatMap((e) => He(e.node.className ?? "")),
		...l.map((e) => e.name)
	]), v = e.sheet.utilities().map((e) => e.name), ne = (e) => ["::selection", ":focus-visible"].includes(e.selector) ? {
		...e.node,
		className: [e.node.className, ...c(e.selector)].filter(Boolean).join(" ")
	} : e.node, y = async (t) => {
		let r = await Ze(n, v, d(t === "button" ? "New Button" : "New Style"), d(t === "button" ? "Create Button" : "Create Style"), t === "button" ? "btn-" : "");
		r && (t === "button" && u[0] ? e.change((e) => e.duplicateUtility(u[0].name, r)) : e.change((e) => e.setUtility(r, t === "text" ? ["text-base"] : t === "box" ? ["p-6"] : ["inline-flex"])), o({
			name: r,
			text: t === "text"
		}), i(r));
	}, ie = async (t) => {
		let a = await Ze(n, v, d("Rename"), d("Rename"), t.startsWith("btn-") ? "btn-" : "", t);
		a && (e.change((e) => Ye(e, t, a)), r === t && i(a));
	}, ae = async (t) => {
		let r = await Ze(n, v, d("Duplicate"), d("Duplicate"), t.startsWith("btn-") ? "btn-" : "");
		r && e.change((e) => e.duplicateUtility(t, r));
	}, oe = async (t) => {
		await le({
			title: d("Delete “{name}”?", { name: z(t) }),
			confirm: d("Delete"),
			danger: !0
		}) && (e.change((e) => e.removeUtility(t)), r === t && i(null));
	}, x = (t) => e.readOnly ? [] : [
		{
			label: d("Rename…"),
			icon: "edit",
			onSelect: () => void ie(t)
		},
		{
			label: d("Duplicate…"),
			icon: "copy",
			onSelect: () => void ae(t)
		},
		{
			separator: !0,
			label: ""
		},
		{
			label: d("Delete"),
			icon: "trash",
			danger: !0,
			onSelect: () => void oe(t)
		}
	], S = (t, n = "base") => e.readOnly || c(t).length === 0 ? [] : [{
		label: d("Reset"),
		icon: "undo",
		onSelect: () => e.change((e) => e.removeElement(t, n))
	}], C = [...Ge(), ...Ke()].find((e) => `element:${e.selector}` === r);
	if (C) return /* @__PURE__ */ U(Qe, {
		edit: e,
		samples: t,
		selector: C.selector,
		node: ne(C),
		classes: c(C.selector),
		groups: C.groups ?? We,
		menu: S(C.selector),
		write: (t) => e.change((e) => e.setElement(C.selector, t))
	}, r);
	let w = qe().find((e) => `article:${e.key}` === r);
	if (w) return /* @__PURE__ */ U(Qe, {
		edit: e,
		samples: t,
		selector: w.selector,
		node: w.node,
		classes: c(w.selector),
		groups: w.groups ?? We,
		menu: S(w.selector, "components"),
		write: (t) => e.change((e) => e.setElement(w.selector, t, "components"))
	}, r);
	let se = [...nt(), at()].find((e) => e.key === r);
	if (se) return /* @__PURE__ */ U(ot, {
		edit: e,
		samples: t,
		part: se
	}, r);
	let T = l.find((e) => e.name === r);
	if (T) return /* @__PURE__ */ U(Qe, {
		edit: e,
		samples: t,
		name: T.name,
		node: B(T.name),
		classes: T.classes,
		groups: m.includes(T) ? We : void 0,
		menu: x(T.name),
		write: (t) => e.change((e) => t.length > 0 || e.utilities().find((e) => e.name === T.name)?.custom ? e.setUtility(T.name, t) : e.removeUtility(T.name))
	}, r);
	let E = (t, n, r, a) => /* @__PURE__ */ U(Pe, {
		onOpen: () => i(t),
		label: n,
		sample: /* @__PURE__ */ U(P, {
			sheet: g,
			node: r,
			page: h,
			mode: e.mode,
			className: "h-12 min-w-0 flex-1 rounded-sm shadow-edge"
		}),
		menu: a.length ? /* @__PURE__ */ U(re, {
			trigger: /* @__PURE__ */ U(b, {
				icon: "more",
				label: d("Style Actions"),
				size: "xs",
				className: Me
			}),
			items: a
		}) : void 0
	}, t), D = (t) => e.readOnly ? void 0 : () => void y(t);
	return /* @__PURE__ */ W(H, { children: [
		/* @__PURE__ */ U(K, {
			title: d("Page"),
			children: Ge().map((e) => E(`element:${e.selector}`, e.label, ne(e), S(e.selector)))
		}),
		/* @__PURE__ */ W(K, {
			title: d("Text"),
			onAdd: D("text"),
			addLabel: d("New Text Style"),
			children: [Ke().map((e) => E(`element:${e.selector}`, e.label, e.node, S(e.selector))), m.map((e) => E(e.name, z(e.name), B(e.name), x(e.name)))]
		}),
		/* @__PURE__ */ U(K, {
			title: d("Buttons"),
			onAdd: D("button"),
			addLabel: d("New Button"),
			children: u.map((e) => E(e.name, z(e.name), B(e.name), x(e.name)))
		}),
		/* @__PURE__ */ U(K, {
			title: d("Forms"),
			children: nt().map((t) => E(t.key, t.label, t.sample, st(e, t)))
		}),
		/* @__PURE__ */ W(K, {
			title: d("Articles"),
			children: [E(at().key, d("Spacing"), at().sample, st(e, at())), qe().map((e) => E(`article:${e.key}`, e.label, e.node, S(e.selector, "components")))]
		}),
		/* @__PURE__ */ U(K, {
			title: d("Boxes"),
			onAdd: D("box"),
			addLabel: d("New Style"),
			children: te.map((e) => E(e.name, z(e.name), {
				...B(e.name),
				className: `${e.name} inline-block`
			}, x(e.name)))
		})
	] });
}
function lt(e, t) {
	let n = [...Ge(), ...Ke()].find((e) => `element:${e.selector}` === t);
	if (n) return n.label;
	let r = qe().find((e) => `article:${e.key}` === t);
	if (r) return d("{name} in Articles", { name: r.label });
	let i = [...nt(), at()].find((e) => e.key === t);
	return i ? i.label : e.utilities().some((e) => e.name === t) ? z(t) : null;
}
// admin/src/theme.tsx
function ut(e, t, n = () => !1) {
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
var dt = (e) => String(e ?? "").trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/^-+|-+$/g, "");
async function ft(e, t, n, r, i = "", a = "md") {
	let o = dt((await de({
		title: n,
		fields: [{
			handle: "name",
			type: "text",
			label: d("Name"),
			mono: !0,
			autofocus: !0,
			required: !0,
			placeholder: a
		}],
		values: { name: i },
		confirm: r
	}))?.name);
	return !o || o === i ? null : e.sheet.variable(`${t}${o}`) !== void 0 || e.defaults.has(`${t}${o}`) ? (A.error(d("“{name}” already exists", { name: o })), null) : o;
}
function pt(e, t, n, r) {
	let i = n.name.slice(0, n.name.length - n.key.length) + r, a = RegExp(`^(!?.*-)${n.key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}((?:/[^!]+)?!?)$`), o = (e) => {
		let { variants: i, utility: o } = I(e), s = a.exec(o);
		return !s || !t?.declarations(o.replace(/^!|!$/g, ""))?.some((e) => e.value.includes(`var(${n.name})`)) ? e : je(i, `${s[1]}${r}${s[2]}`);
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
var mt = (e, t) => e.variables().filter((e) => e.name === t || e.name.startsWith(`${t}--`)).reduce((e, t) => e.setVariable(t.name, null), e);
function ht(e, t) {
	let { engine: n } = V();
	return (r, i = []) => e.readOnly ? [] : r.builtIn ? [...i, ...r.written ? [...i.length ? [{
		separator: !0,
		label: ""
	}] : [], {
		label: d("Reset"),
		icon: "undo",
		onSelect: () => e.change((e) => mt(e, r.name))
	}] : []] : [
		{
			label: d("Rename…"),
			icon: "edit",
			onSelect: async () => {
				let i = await ft(e, t.prefix, d("Rename"), d("Rename"), r.key, t.placeholder);
				i && e.change((e) => pt(e, n, r, i));
			}
		},
		...i,
		{
			separator: !0,
			label: ""
		},
		{
			label: d("Delete"),
			icon: "trash",
			danger: !0,
			onSelect: () => e.change((e) => mt(e, r.name))
		}
	];
}
function Q({ edit: e, kind: t, row: n }) {
	let r = ht(e, t), i = async () => {
		let n = await ft(e, t.prefix, t.fresh, t.add, "", t.placeholder);
		n && e.change((e) => e.setVariable(`${t.prefix}${n}`, t.start));
	};
	return /* @__PURE__ */ U(K, {
		title: t.title,
		onAdd: e.readOnly ? void 0 : () => void i(),
		addLabel: t.add,
		children: ut(e, t.prefix, t.skip).map((t) => n(t, (n) => n !== null && e.change((e) => e.setVariable(t.name, n)), (e) => r(t, e)))
	});
}
var $ = (e, t = {}) => ({
	component: "blocks-value",
	unit: e,
	...t
}), gt = { component: "site-size" }, _t = $("rem", {
	units: [
		"rem",
		"px",
		"em"
	],
	step: .125,
	min: 0
}), vt = /^(.+)-(\d{2,3})$/;
function yt({ label: e, value: t, same: n, onChange: r, disabled: i, size: a = "md" }) {
	let { engine: o } = V(), [s, c] = _(!1), l = (e) => F(o ? o.resolve(e) : e).light, u = t ?? n ?? "transparent";
	return /* @__PURE__ */ U(oe, {
		open: s,
		onOpenChange: c,
		align: "end",
		className: "!p-0",
		trigger: /* @__PURE__ */ U(x, {
			compact: !0,
			"aria-label": e,
			title: `${e} · ${t ?? d("Same")}`,
			disabled: i,
			className: O("relative shrink-0 rounded-sm outline-offset-2 data-[popup-open]:ring-2 data-[popup-open]:ring-focus", a === "md" ? "size-7" : "size-6"),
			children: /* @__PURE__ */ U(we, {
				color: l(u),
				className: O("!size-full !rounded-sm", t === null && "opacity-35")
			})
		}),
		children: /* @__PURE__ */ U(me, {
			label: e,
			value: t ?? void 0,
			onChange: r
		})
	});
}
function bt({ edit: e, row: t }) {
	let [n, r] = _(!1);
	return /* @__PURE__ */ U(oe, {
		open: n,
		onOpenChange: r,
		align: "start",
		className: "!p-0",
		trigger: /* @__PURE__ */ W(x, {
			compact: !0,
			"aria-label": t.key,
			title: t.key,
			disabled: e.readOnly,
			className: "relative h-6 rounded-xs outline-offset-1 hover:z-raised hover:ring-2 hover:ring-float data-[popup-open]:z-raised data-[popup-open]:ring-2 data-[popup-open]:ring-focus",
			style: { background: F(t.value).light },
			children: [/* @__PURE__ */ U("span", { className: "cms-swatch-edge" }), t.written && /* @__PURE__ */ U("span", {
				className: "absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-edge",
				"aria-hidden": !0
			})]
		}),
		children: /* @__PURE__ */ U(me, {
			label: t.key,
			value: t.value,
			onChange: (n) => e.change((e) => n === null ? mt(e, t.name) : e.setVariable(t.name, n))
		})
	});
}
var xt = (e, t, n, r) => e.writeUtility(t, [{
	name: "--scheme",
	value: n
}, {
	name: "--scheme-text",
	value: r
}], ["scheme"]);
function St({ edit: e }) {
	let { engine: t } = V(), n = Oe(e.sheet), r = (n) => {
		let r = F(t ? t.resolve(n) : n);
		return e.mode === "dark" ? r.dark ?? r.light : r.light;
	}, i = async () => {
		let t = dt((await de({
			title: d("New Scheme"),
			fields: [{
				handle: "name",
				type: "text",
				label: d("Name"),
				mono: !0,
				autofocus: !0,
				required: !0,
				placeholder: "ocean"
			}],
			confirm: d("Add Scheme")
		}))?.name);
		if (t) {
			if (n.some((e) => e.key === t)) return void A.error(d("“{name}” already exists", { name: t }));
			e.change((e) => xt(e, `${ve}${t}`, "var(--color-foreground)", "var(--color-background)"));
		}
	}, a = async (t) => {
		let r = dt((await de({
			title: d("Rename"),
			fields: [{
				handle: "name",
				type: "text",
				label: d("Name"),
				mono: !0,
				autofocus: !0,
				required: !0
			}],
			values: { name: t.key },
			confirm: d("Rename")
		}))?.name);
		if (r && r !== t.key) {
			if (n.some((e) => e.key === r)) return void A.error(d("“{name}” already exists", { name: r }));
			e.change((e) => e.renameUtility(t.name, `${ve}${r}`));
		}
	};
	return /* @__PURE__ */ U(K, {
		title: d("Schemes"),
		onAdd: e.readOnly ? void 0 : () => void i(),
		addLabel: d("Add Scheme"),
		children: n.length > 0 && /* @__PURE__ */ U("div", {
			className: "grid grid-cols-2 gap-3 pt-3",
			children: n.map((t) => /* @__PURE__ */ W("div", {
				className: "cms-reveal-row group min-w-0",
				children: [/* @__PURE__ */ U(N, {
					size: "card",
					background: r(t.background),
					text: r(t.text)
				}), /* @__PURE__ */ W("div", {
					className: "flex h-9 items-center gap-1.5",
					children: [
						/* @__PURE__ */ U(D, {
							content: d("Copy Name"),
							children: /* @__PURE__ */ U(v, {
								variant: "ghost",
								size: "xs",
								onClick: () => void ue(t.name, { copied: d("Copied {reference}", { reference: t.name }) }),
								className: "min-w-0 flex-1 shrink !justify-start !bg-transparent !px-0 font-mono !font-normal hover:text-ink",
								children: /* @__PURE__ */ U("span", {
									className: "truncate",
									children: t.key
								})
							})
						}),
						/* @__PURE__ */ U(yt, {
							size: "sm",
							label: d("{name} Background", { name: t.key }),
							value: t.background,
							disabled: e.readOnly,
							onChange: (n) => n && e.change((e) => xt(e, t.name, n, t.text))
						}),
						/* @__PURE__ */ U(yt, {
							size: "sm",
							label: d("{name} Text", { name: t.key }),
							value: t.text,
							disabled: e.readOnly,
							onChange: (n) => n && e.change((e) => xt(e, t.name, t.background, n))
						}),
						e.readOnly ? /* @__PURE__ */ U(G, {}) : /* @__PURE__ */ U(re, {
							trigger: /* @__PURE__ */ U(b, {
								icon: "more",
								label: d("Actions"),
								size: "xs",
								className: "cms-reveal shrink-0"
							}),
							items: [
								{
									label: d("Rename…"),
									icon: "edit",
									onSelect: () => void a(t)
								},
								{
									separator: !0,
									label: ""
								},
								{
									label: d("Delete"),
									icon: "trash",
									danger: !0,
									onSelect: () => e.change((e) => e.removeUtility(t.name))
								}
							]
						})
					]
				})]
			}, t.name))
		})
	});
}
function Ct({ edit: e }) {
	let t = {
		prefix: "--color-",
		title: d("Colors"),
		add: d("Add Color"),
		fresh: d("New Color"),
		start: ie,
		placeholder: "brand"
	}, n = ht(e, t), r = ut(e, t.prefix), i = (t) => t.builtIn && e.palette.has(t.name), a = r.filter((e) => !i(e)), o = /* @__PURE__ */ new Map();
	for (let e of r.filter(i)) {
		let t = vt.exec(e.key)?.[1];
		t && o.set(t, [...o.get(t) ?? [], e]);
	}
	let s = async () => {
		let n = await ft(e, t.prefix, t.fresh, t.add, "", t.placeholder);
		n && e.change((e) => e.setVariable(`${t.prefix}${n}`, t.start));
	}, c = (t, n, r) => e.change((e) => e.setVariable(t.name, r && r !== n ? `light-dark(${n}, ${r})` : n));
	return /* @__PURE__ */ W(H, { children: [
		/* @__PURE__ */ W("section", {
			className: "mb-6",
			children: [/* @__PURE__ */ W("div", {
				className: "flex h-9 items-center gap-2 border-b border-border",
				children: [
					/* @__PURE__ */ U("h3", {
						className: "m-0 min-w-0 flex-1 text-xs font-semibold text-ink",
						children: t.title
					}),
					/* @__PURE__ */ U("span", {
						className: "grid w-7 place-items-center text-faint",
						title: d("Light"),
						children: /* @__PURE__ */ U(y, {
							name: "sun",
							size: 13
						})
					}),
					/* @__PURE__ */ U("span", {
						className: "grid w-7 place-items-center text-faint",
						title: d("Dark"),
						children: /* @__PURE__ */ U(y, {
							name: "moon",
							size: 13
						})
					}),
					e.readOnly ? /* @__PURE__ */ U(G, {}) : /* @__PURE__ */ U(D, {
						content: t.add,
						children: /* @__PURE__ */ U(b, {
							icon: "plus",
							label: t.add,
							title: void 0,
							size: "xs",
							className: "shrink-0",
							onClick: () => void s()
						})
					})
				]
			}), a.map((t) => {
				let { light: r, dark: i } = F(t.value);
				return /* @__PURE__ */ W(J, {
					name: t.key,
					wide: !0,
					menu: n(t),
					children: [/* @__PURE__ */ U(yt, {
						label: d("{name} in Light Mode", { name: t.key }),
						value: r,
						disabled: e.readOnly,
						onChange: (e) => e && c(t, e, i)
					}), /* @__PURE__ */ U(yt, {
						label: d("{name} in Dark Mode", { name: t.key }),
						value: i ?? null,
						same: r,
						disabled: e.readOnly,
						onChange: (e) => c(t, r, e ?? void 0)
					})]
				}, t.name);
			})]
		}),
		/* @__PURE__ */ U(St, { edit: e }),
		o.size > 0 && /* @__PURE__ */ U(K, {
			title: d("Palette"),
			children: /* @__PURE__ */ U(M, {
				head: !0,
				className: "py-3",
				families: [...o].map(([e, t]) => ({
					name: e,
					shades: t
				})),
				cell: (t) => /* @__PURE__ */ U(bt, {
					edit: e,
					row: t
				}, t.name)
			})
		})
	] });
}
function wt(e) {
	let t = e.flatMap((e) => String(e.weight ?? "400").split(/\s+/).map(Number)).filter((e) => e > 0), n = Math.min(...t), r = Math.max(...t), i = t.length === 0 ? "400" : n === r ? String(n) : `${n}–${r}`;
	return e.some((e) => e.style === "italic") ? `${i} · ${d("Italic")}` : i;
}
var Tt = (e, t) => /* @__PURE__ */ U("p", {
	className: "m-0 truncate pb-2.5 text-ink",
	style: {
		fontSize: `min(${e}, 2.75rem)`,
		lineHeight: 1.1,
		fontFamily: t
	},
	children: d("Ship It")
});
function Et({ edit: e, fonts: i }) {
	let o = [...new Set(i.faces.map((e) => e.family))], s = new Set(ut(e, "--font-", (e) => e.startsWith("weight-")).map((e) => t(r(e.value)))), c = o.map((e) => {
		let t = i.faces.filter((t) => t.family === e);
		return {
			family: e,
			styles: wt(t),
			fallback: t.some((e) => Array.isArray(e.fallback) ? e.fallback.length > 0 : !!e.fallback),
			used: s.has(e)
		};
	}), l = n("", "sans", !1), u = e.sheet.variable("--font-sans") ?? e.defaults.get("--font-sans"), ee = () => [
		["sans", d("Sans")],
		["serif", d("Serif")],
		["mono", d("Mono")]
	];
	return /* @__PURE__ */ W(H, { children: [
		/* @__PURE__ */ U(Q, {
			edit: e,
			kind: {
				prefix: "--font-",
				title: d("Fonts"),
				add: d("Add Font Family"),
				fresh: d("New Font Family"),
				start: l,
				placeholder: "display",
				skip: (e) => e.startsWith("weight-")
			},
			row: (o, s, l) => {
				let u = r(o.value), f = t(u), p = i.faces.filter((e) => e.family === f), m = p.some((e) => e.preload);
				return /* @__PURE__ */ U(J, {
					name: o.key,
					sample: /* @__PURE__ */ U("span", {
						className: "block max-w-7 overflow-hidden whitespace-nowrap text-center text-lg leading-none text-ink",
						style: { fontFamily: o.value },
						children: "Aa"
					}),
					menu: l([
						{
							heading: !0,
							label: d("Fallback")
						},
						...ee().map(([e, t]) => ({
							label: t,
							checked: a(u) === e,
							onSelect: () => s(n(f, e, u.includes(`${f} Fallback`)))
						})),
						...p.length ? [{
							separator: !0,
							label: ""
						}, {
							label: d("Preload"),
							checked: m,
							onSelect: () => i.preload(f, !m)
						}] : []
					]),
					children: /* @__PURE__ */ U(q, {
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
		/* @__PURE__ */ U(Q, {
			edit: e,
			kind: {
				prefix: "--text-",
				title: d("Text Sizes"),
				add: d("Add Text Size"),
				fresh: d("New Text Size"),
				start: "1.25rem",
				placeholder: "lead",
				skip: (e) => e.startsWith("shadow-")
			},
			row: (t, n, r) => /* @__PURE__ */ U(J, {
				name: t.key,
				menu: r(),
				below: Tt(t.value, u),
				children: /* @__PURE__ */ U(q, {
					handle: t.name,
					label: t.key,
					value: t.value,
					disabled: e.readOnly,
					field: gt,
					onChange: n
				})
			}, t.name)
		}),
		/* @__PURE__ */ U(Q, {
			edit: e,
			kind: {
				prefix: "--leading-",
				title: d("Line Heights"),
				add: d("Add Line Height"),
				fresh: d("New Line Height"),
				start: "1.5",
				placeholder: "airy"
			},
			row: (t, n, r) => /* @__PURE__ */ U(J, {
				name: t.key,
				menu: r(),
				sample: /* @__PURE__ */ U("span", {
					className: "flex w-4 flex-col",
					style: { gap: `${Math.max(1, (Number(t.value) - .8) * 6)}px` },
					children: [
						0,
						1,
						2
					].map((e) => /* @__PURE__ */ U("span", { className: O("h-0.5 rounded-full bg-muted", e === 2 && "w-2/3") }, e))
				}),
				children: /* @__PURE__ */ U(q, {
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
		/* @__PURE__ */ U(Q, {
			edit: e,
			kind: {
				prefix: "--tracking-",
				title: d("Letter Spacing"),
				add: d("Add Letter Spacing"),
				fresh: d("New Letter Spacing"),
				start: "0em",
				placeholder: "loose"
			},
			row: (t, n, r) => /* @__PURE__ */ U(J, {
				name: t.key,
				menu: r(),
				sample: /* @__PURE__ */ U("span", {
					className: "text-xs font-medium text-ink",
					style: { letterSpacing: t.value },
					children: "Aa"
				}),
				children: /* @__PURE__ */ U(q, {
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
var Dt = (e, t = gt) => (n, r, i) => /* @__PURE__ */ U(J, {
	name: n.key,
	menu: i(),
	children: /* @__PURE__ */ U(q, {
		handle: n.name,
		label: n.key,
		value: n.value,
		disabled: e.readOnly,
		field: t,
		onChange: r
	})
}, n.name);
function Ot({ edit: e }) {
	let t = [
		["sm", d("Small")],
		["md", d("Medium")],
		["lg", d("Large")]
	], n = [
		["height", d("Height")],
		["padding", d("Padding")],
		["text", d("Text")]
	], r = (t) => e.sheet.variable(t) ?? e.defaults.get(t) ?? null, i = "w-24 shrink-0 max-sm:min-w-0 max-sm:flex-1";
	return /* @__PURE__ */ W(K, {
		title: d("Buttons and Fields"),
		children: [/* @__PURE__ */ W("div", {
			className: "flex min-h-8 items-center gap-2 border-b border-border text-2xs text-faint",
			children: [
				/* @__PURE__ */ U("span", { className: "min-w-0 flex-1" }),
				n.map(([e, t]) => /* @__PURE__ */ U("span", {
					className: i,
					children: t
				}, e)),
				/* @__PURE__ */ U("span", { className: "size-6 shrink-0" })
			]
		}), t.map(([t, a]) => {
			let o = n.map(([e]) => `--control-${t}-${e}`), s = o.some((t) => e.sheet.variable(t) !== void 0);
			return /* @__PURE__ */ W("div", {
				className: "cms-reveal-row flex min-h-9 items-center gap-2 border-b border-border py-1 last:border-b-0",
				children: [
					/* @__PURE__ */ U("span", {
						className: "min-w-0 flex-1 truncate text-xs text-text",
						children: a
					}),
					n.map(([t, n], s) => /* @__PURE__ */ U("div", {
						className: i,
						children: /* @__PURE__ */ U(q, {
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
					s && !e.readOnly ? /* @__PURE__ */ U(D, {
						content: d("Reset"),
						children: /* @__PURE__ */ U(b, {
							icon: "undo",
							size: "xs",
							label: d("Reset"),
							title: void 0,
							className: "cms-reveal shrink-0",
							onClick: () => e.change((e) => o.reduce((e, t) => e.setVariable(t, null), e))
						})
					}) : /* @__PURE__ */ U("span", { className: "size-6 shrink-0" })
				]
			}, t);
		})]
	});
}
function kt(e) {
	let t = /^(-?[\d.]+)(rem|px)$/.exec(e.trim());
	return t ? Number(t[1]) * (t[2] === "rem" ? 16 : 1) : null;
}
function At({ step: e }) {
	let t = kt(e);
	return t === null ? null : /* @__PURE__ */ U("div", {
		className: "flex items-end gap-1.5 pb-3 pt-1",
		"aria-hidden": !0,
		children: ye.filter((e) => e > 0).map((e) => {
			let n = +(t * e).toFixed(2);
			return /* @__PURE__ */ W("span", {
				className: "flex min-w-0 flex-1 flex-col items-center gap-1",
				title: `${e} · ${n}px`,
				children: [/* @__PURE__ */ U("span", {
					className: "w-full rounded-xs bg-active",
					style: { height: Math.max(2, Math.min(n, 128) / 2) }
				}), /* @__PURE__ */ U("span", {
					className: "text-2xs tabular-nums text-faint",
					children: n
				})]
			}, e);
		})
	});
}
function jt({ edit: e }) {
	let t = {
		prefix: "--spacing-",
		title: d("Spacing"),
		add: d("Add Spacing"),
		fresh: d("New Spacing"),
		start: "2rem",
		placeholder: "gutter"
	}, n = ht(e, t), r = e.sheet.variable("--spacing"), i = async () => {
		let n = await ft(e, t.prefix, t.fresh, t.add, "", t.placeholder);
		n && e.change((e) => e.setVariable(`${t.prefix}${n}`, t.start));
	}, a = {
		name: "--spacing",
		key: "1",
		value: r ?? e.defaults.get("--spacing") ?? "0.25rem",
		builtIn: !0,
		written: r !== void 0
	};
	return /* @__PURE__ */ W(H, { children: [
		/* @__PURE__ */ W(K, {
			title: t.title,
			onAdd: e.readOnly ? void 0 : () => void i(),
			addLabel: t.add,
			children: [/* @__PURE__ */ U(J, {
				name: a.key,
				copy: a.name,
				menu: n(a),
				below: /* @__PURE__ */ U(At, { step: a.value }),
				children: /* @__PURE__ */ U(q, {
					handle: "--spacing",
					label: a.key,
					value: a.value,
					disabled: e.readOnly,
					field: gt,
					onChange: (t) => t !== null && e.change((e) => e.setVariable("--spacing", t))
				})
			}), ut(e, t.prefix).map((t) => Dt(e)(t, (n) => n !== null && e.change((e) => e.setVariable(t.name, n)), (e) => n(t, e)))]
		}),
		/* @__PURE__ */ U(Q, {
			edit: e,
			kind: {
				prefix: "--container-",
				title: d("Containers"),
				add: d("Add Container"),
				fresh: d("New Container"),
				start: "72rem",
				placeholder: "content"
			},
			row: Dt(e)
		}),
		/* @__PURE__ */ U(Q, {
			edit: e,
			kind: {
				prefix: "--breakpoint-",
				title: d("Breakpoints"),
				add: d("Add Breakpoint"),
				fresh: d("New Breakpoint"),
				start: "120rem",
				placeholder: "3xl"
			},
			row: Dt(e, _t)
		}),
		/* @__PURE__ */ U(Ot, { edit: e })
	] });
}
function Mt({ edit: t }) {
	let n = (n) => (r, i, a) => /* @__PURE__ */ U(J, {
		name: r.key,
		menu: a(),
		sample: /* @__PURE__ */ U(e, {
			value: r.value,
			kind: n
		}),
		children: /* @__PURE__ */ U(q, {
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
	return /* @__PURE__ */ W(H, { children: [
		/* @__PURE__ */ U(Q, {
			edit: t,
			kind: {
				prefix: "--radius-",
				title: d("Corners"),
				add: d("Add Radius"),
				fresh: d("New Radius"),
				start: "0.5rem",
				placeholder: "card"
			},
			row: (e, n, r) => /* @__PURE__ */ U(J, {
				name: e.key,
				menu: r(),
				sample: /* @__PURE__ */ U("span", {
					className: "size-5 translate-x-0.5 translate-y-0.5 border-l-[1.5px] border-t-[1.5px] border-muted",
					style: { borderTopLeftRadius: `min(${e.value}, 20px)` }
				}),
				children: /* @__PURE__ */ U(q, {
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
		/* @__PURE__ */ U(Q, {
			edit: t,
			kind: {
				prefix: "--shadow-",
				title: d("Shadows"),
				add: d("Add Shadow"),
				fresh: d("New Shadow"),
				start: "0 4px 16px -4px rgb(0 0 0 / 0.12)",
				placeholder: "card"
			},
			row: n("box")
		}),
		/* @__PURE__ */ U(Q, {
			edit: t,
			kind: {
				prefix: "--inset-shadow-",
				title: d("Inset Shadows"),
				add: d("Add Inset Shadow"),
				fresh: d("New Inset Shadow"),
				start: "inset 0 2px 4px rgb(0 0 0 / 0.08)",
				placeholder: "well"
			},
			row: n("box")
		}),
		/* @__PURE__ */ U(Q, {
			edit: t,
			kind: {
				prefix: "--drop-shadow-",
				title: d("Drop Shadows"),
				add: d("Add Drop Shadow"),
				fresh: d("New Drop Shadow"),
				start: "0 4px 8px rgb(0 0 0 / 0.12)",
				placeholder: "lifted"
			},
			row: n("drop")
		}),
		/* @__PURE__ */ U(Q, {
			edit: t,
			kind: {
				prefix: "--text-shadow-",
				title: d("Text Shadows"),
				add: d("Add Text Shadow"),
				fresh: d("New Text Shadow"),
				start: "0 1px 2px rgb(0 0 0 / 0.2)",
				placeholder: "glow"
			},
			row: n("text")
		}),
		/* @__PURE__ */ U(Q, {
			edit: t,
			kind: {
				prefix: "--blur-",
				title: d("Blur"),
				add: d("Add Blur"),
				fresh: d("New Blur"),
				start: "6px",
				placeholder: "soft"
			},
			row: (e, n, r) => /* @__PURE__ */ U(J, {
				name: e.key,
				menu: r(),
				sample: /* @__PURE__ */ U("span", {
					className: "size-3 rounded-full bg-muted",
					style: { filter: `blur(min(${e.value}, 6px))` }
				}),
				children: /* @__PURE__ */ U(q, {
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
		/* @__PURE__ */ U(Q, {
			edit: t,
			kind: {
				prefix: "--perspective-",
				title: d("Perspective"),
				add: d("Add Perspective"),
				fresh: d("New Perspective"),
				start: "800px",
				placeholder: "deep"
			},
			row: Dt(t, $("px", {
				units: ["px", "rem"],
				step: 10,
				min: 0
			}))
		})
	] });
}
function Nt(e, t) {
	let n = String(e ?? "").trim().match(/^(\d*\.?\d+)\s*(ms|s)?$/);
	if (!n) return t;
	let r = n[2] === "s" ? Number(n[1]) : Number(n[1]) / 1e3;
	return Math.min(2, Math.max(.05, Math.round(r * 1e3) / 1e3));
}
function Pt({ edit: e, transition: t, onTransition: n }) {
	let r = (t, n) => e.change((e) => e.setVariable(t, n)), a = (t) => e.sheet.variable(t) ?? e.defaults.get(t) ?? null, o = (t) => e.sheet.variable(t) !== void 0 && !e.readOnly ? /* @__PURE__ */ U(D, {
		content: d("Reset"),
		children: /* @__PURE__ */ U(b, {
			icon: "undo",
			size: "xs",
			label: d("Reset"),
			title: void 0,
			onClick: () => r(t, null)
		})
	}) : void 0;
	return /* @__PURE__ */ W(H, { children: [
		/* @__PURE__ */ U(Q, {
			edit: e,
			kind: {
				prefix: "--ease-",
				title: d("Easings"),
				add: d("Add Easing"),
				fresh: d("New Easing"),
				start: "cubic-bezier(0.2, 0.8, 0.2, 1)",
				placeholder: "snap"
			},
			row: (t, n, r) => /* @__PURE__ */ U(J, {
				name: t.key,
				menu: r(),
				children: /* @__PURE__ */ U(q, {
					handle: t.name,
					label: t.key,
					value: t.value,
					disabled: e.readOnly,
					field: { component: "ease" },
					onChange: n
				})
			}, t.name)
		}),
		/* @__PURE__ */ U(Q, {
			edit: e,
			kind: {
				prefix: "--duration-",
				title: d("Durations"),
				add: d("Add Duration"),
				fresh: d("New Duration"),
				start: "300ms",
				placeholder: "slow"
			},
			row: (t, n, r) => /* @__PURE__ */ U(J, {
				name: t.key,
				menu: r(),
				children: /* @__PURE__ */ U(q, {
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
		/* @__PURE__ */ U(Q, {
			edit: e,
			kind: {
				prefix: "--animate-",
				title: d("Animations"),
				add: d("Add Animation"),
				fresh: d("New Animation"),
				start: "spin 2s linear infinite",
				placeholder: "float"
			},
			row: (t, n, r) => /* @__PURE__ */ U(J, {
				name: t.key,
				menu: r(),
				sample: /* @__PURE__ */ U(i, {
					value: t.value,
					keyframes: e.keyframes
				}),
				children: /* @__PURE__ */ U(q, {
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
		/* @__PURE__ */ W(K, {
			title: d("Transitions"),
			children: [/* @__PURE__ */ U(Ne, {
				label: d("Duration"),
				action: o("--default-transition-duration"),
				children: /* @__PURE__ */ U(q, {
					handle: "--default-transition-duration",
					label: d("Duration"),
					value: a("--default-transition-duration"),
					disabled: e.readOnly,
					field: $("ms", {
						units: ["ms", "s"],
						step: 10,
						min: 0
					}),
					onChange: (e) => e && r("--default-transition-duration", e)
				})
			}), /* @__PURE__ */ U(Ne, {
				label: d("Easing"),
				action: o("--default-transition-timing-function"),
				children: /* @__PURE__ */ U(q, {
					handle: "--default-transition-timing-function",
					label: d("Easing"),
					value: a("--default-transition-timing-function"),
					disabled: e.readOnly,
					field: { component: "ease" },
					onChange: (e) => e && r("--default-transition-timing-function", e)
				})
			})]
		}),
		/* @__PURE__ */ W(K, {
			title: d("Page Transition"),
			children: [
				/* @__PURE__ */ U(Ne, {
					label: d("Effect"),
					children: /* @__PURE__ */ U(q, {
						handle: "type",
						label: d("Effect"),
						value: t.type,
						disabled: e.readOnly,
						field: {
							type: "select",
							mono: !1,
							required: !0,
							options: {
								none: d("None"),
								fade: d("Fade"),
								slide: d("Slide"),
								scale: d("Scale")
							}
						},
						onChange: (e) => n({
							...t,
							type: e ?? "none"
						})
					})
				}),
				t.type !== "none" && /* @__PURE__ */ U(Ne, {
					label: d("Duration"),
					children: /* @__PURE__ */ U(q, {
						handle: "duration",
						label: d("Duration"),
						value: `${Math.round(t.duration * 1e3)}ms`,
						disabled: e.readOnly,
						field: $("ms", {
							units: ["ms"],
							step: 10,
							min: 50,
							max: 2e3
						}),
						onChange: (e) => n({
							...t,
							duration: Nt(e, t.duration)
						})
					})
				}),
				/* @__PURE__ */ U(Ne, {
					label: d("Page Loads"),
					children: /* @__PURE__ */ U(q, {
						handle: "navigation",
						label: d("Page Loads"),
						value: t.navigation,
						disabled: e.readOnly,
						field: {
							type: "select",
							mono: !1,
							required: !0,
							options: {
								document: d("Full Page"),
								client: d("Instant")
							}
						},
						onChange: (e) => n({
							...t,
							navigation: e === "client" ? "client" : "document"
						})
					})
				})
			]
		})
	] });
}
// admin/src/Styling.tsx
var Ft = {}, It = [
	"colors",
	"typography",
	"layout",
	"effects",
	"motion",
	"styles"
];
function Lt() {
	return [
		{
			value: "colors",
			label: d("Colors"),
			icon: "palette"
		},
		{
			value: "typography",
			label: d("Typography"),
			icon: "typography"
		},
		{
			value: "layout",
			label: d("Layout"),
			icon: "ruler"
		},
		{
			value: "effects",
			label: d("Effects"),
			icon: "shadow"
		},
		{
			value: "motion",
			label: d("Motion"),
			icon: "speed"
		},
		{
			value: "styles",
			label: d("Styles"),
			icon: "symbol"
		}
	];
}
var Rt = (e, t) => JSON.stringify(e ?? null) === JSON.stringify(t ?? null), zt = /* @__PURE__ */ new Map();
function Bt() {
	let e = f("styling/get", {}, {
		refetchOnWindowFocus: !1,
		retry: !1
	}), t = f("styling/source", {}, {
		refetchOnWindowFocus: !1,
		retry: !1,
		staleTime: 6e4
	}), [n, r] = _(Ft), { query: i } = p(), a = i.style ? "styles" : It.includes(i.tab) ? i.tab : It[0], ne = (e) => ee({
		tab: e === It[0] ? null : e,
		style: null
	}), [y, re] = _(pe() === "dark" ? "dark" : "light"), [ie, oe] = _(!1), [x, ue] = _(() => window.matchMedia("(max-width: 767px)").matches);
	m(() => {
		let e = window.matchMedia("(max-width: 767px)"), t = () => ue(e.matches);
		return e.addEventListener("change", t), () => e.removeEventListener("change", t);
	}, []);
	let k = ie && x, [j, me] = _("desktop"), [he, ge] = _(!1), [M, _e] = _(null), ve = fe(), ye = g(null), N = e.data, P = n.css ?? N?.css, be = n.transition ?? N?.transition, xe = !!N && (n.css !== void 0 && n.css !== N.css || n.transition !== void 0 && !Rt(n.transition, N.transition)), we = !c("settings.manage"), F = h(() => new Se(P ?? ""), [P]), Te = Ie(t.data, P), Ee = h(() => F.variables().some((e) => e.value.startsWith("light-dark(")) || /color-scheme\s*:\s*light\s+dark\b/.test(F.css), [F]), [I, Oe] = _(null);
	m(() => {
		De().then(Oe);
	}, []);
	let L = g(null), R = `${a}:${i.style ?? ""}`, z = g(R);
	z.current !== R && (L.current && zt.set(z.current, L.current.scrollTop), z.current = R);
	let B = !!e.data && !!t.data && I !== null;
	te(() => {
		B && L.current && (L.current.scrollTop = zt.get(R) ?? 0);
	}, [R, B]);
	let Ae = t.data?.files.cms, V = h(() => {
		let e = /* @__PURE__ */ new Map();
		for (let t of [...ke(I ?? ""), ...ke(Ae ?? "")]) e.set(t.name, t.value);
		return e;
	}, [I, Ae]), je = h(() => new Set(ke(I ?? "").filter((e) => e.name.startsWith("--color-")).map((e) => e.name)), [I]), Me = h(() => o(I ?? "", P ?? ""), [I, P]);
	if (m(() => {
		let e = document.createElement("style");
		return e.textContent = (N?.fonts ?? []).map((e) => `@font-face{font-family:"${e.family}";src:url("${/^(https:\/\/|\/)/.test(e.src) ? e.src : `/_cms/fonts/${e.src.split("/").pop()}`}") format("woff2");font-weight:${e.weight ?? "400"};font-style:${e.style ?? "normal"};font-display:swap}`).join("\n"), document.head.appendChild(e), () => e.remove();
	}, [N?.fonts]), e.isLoading || t.isLoading || I === null) return /* @__PURE__ */ U("div", {
		className: "grid h-full place-items-center text-faint",
		children: /* @__PURE__ */ U(E, {})
	});
	if (!N || !t.data || P === void 0 || !be) return /* @__PURE__ */ W("div", {
		className: "flex h-full flex-col",
		children: [/* @__PURE__ */ U(ce, { crumbs: [{
			label: d("Styling"),
			icon: "palette"
		}] }), /* @__PURE__ */ U(S, {
			title: d("Couldn’t load the styling"),
			onRetry: () => {
				e.refetch(), t.refetch();
			},
			retrying: e.isRefetching || t.isRefetching
		})]
	});
	let G = {
		sheet: F,
		change: (e) => !we && r((t) => ({
			...t,
			css: e(new Se(t.css ?? N.css)).css
		})),
		readOnly: we,
		defaults: V,
		palette: je,
		keyframes: Me,
		mode: Ee ? y : "light"
	}, K = {
		compiler: Te.compiler,
		device: k ? "phone" : j
	}, q = a === "styles" && i.style ? lt(F, i.style) : null, J = () => {
		l("styling/"), ye.current?.contentWindow?.location.reload();
	}, Ne = async () => {
		if (xe && !he) {
			ge(!0), _e(null);
			try {
				let i = {};
				n.css !== void 0 && n.css !== N.css && (i.css = n.css), n.transition !== void 0 && !Rt(n.transition, N.transition) && (i.transition = n.transition), Object.keys(i).length > 0 && await u("styling/update", i), await Promise.all([e.refetch(), t.refetch()]), r(Ft), ye.current?.contentWindow?.location.reload();
			} catch (e) {
				_e({
					message: e instanceof Error ? e.message : String(e),
					refused: e instanceof s && e.type === "invalid_input"
				});
			} finally {
				ge(!1);
			}
		}
	}, Pe = {
		faces: N.fonts,
		add: async (e) => {
			try {
				if (e === "google") {
					let e = await de({
						title: d("Add a Google Font"),
						fields: [{
							handle: "family",
							type: "text",
							label: d("Name"),
							placeholder: "Inter Tight",
							autofocus: !0,
							required: !0
						}],
						confirm: d("Add Font")
					}), t = String(e?.family ?? "").trim();
					if (!t) return null;
					let n = await u("styling/fonts-import", { family: t });
					return A.success(d("{family} added", { family: t })), J(), {
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
				}), r = t.name.replace(/\.woff2$/i, ""), i = await de({
					title: d("Upload Font"),
					fields: [{
						handle: "family",
						type: "text",
						label: d("Family Name"),
						autofocus: !0,
						required: !0
					}],
					values: { family: r.replace(/[-_](regular|bold|variable|italic|\d+).*$/i, "").replace(/[-_]/g, " ") },
					confirm: d("Upload Font")
				}), a = String(i?.family ?? "").trim();
				return a ? (await u("styling/fonts-upload", {
					family: a,
					name: r,
					data: n,
					weight: /variable/i.test(r) ? "100 900" : "400",
					style: /italic/i.test(r) ? "italic" : "normal"
				}), A.success(d("{family} uploaded", { family: a })), J(), {
					family: a,
					fallback: !1
				}) : null;
			} catch (e) {
				return A.error(e), null;
			}
		},
		remove: async (e) => {
			if (await le({
				title: d("Remove {family}?", { family: e }),
				confirm: d("Remove Font"),
				danger: !0
			})) try {
				await u("styling/update", { fonts: N.fonts.filter((t) => t.family !== e) }), J();
			} catch (e) {
				A.error(e);
			}
		},
		preload: async (e, t) => {
			let n = N.fonts.some((t) => t.family === e && t.style !== "italic");
			try {
				await u("styling/update", { fonts: N.fonts.map((r) => r.family === e ? {
					...r,
					preload: t && (!n || r.style !== "italic")
				} : r) }), J();
			} catch (e) {
				A.error(e);
			}
		}
	}, Le = /* @__PURE__ */ W(H, { children: [
		a === "colors" && /* @__PURE__ */ U(Ct, { edit: G }),
		a === "typography" && /* @__PURE__ */ U(Et, {
			edit: G,
			fonts: Pe
		}),
		a === "layout" && /* @__PURE__ */ U(jt, { edit: G }),
		a === "effects" && /* @__PURE__ */ U(Mt, { edit: G }),
		a === "motion" && /* @__PURE__ */ U(Pt, {
			edit: G,
			transition: be,
			onTransition: (e) => !we && r((t) => ({
				...t,
				transition: e
			}))
		}),
		a === "styles" && /* @__PURE__ */ U(ct, {
			edit: G,
			samples: K
		})
	] });
	return /* @__PURE__ */ W("div", {
		className: "flex h-full flex-col",
		children: [
			/* @__PURE__ */ U(ce, {
				crumbs: [
					{
						label: d("Styling"),
						icon: "palette"
					},
					{
						label: Lt().find((e) => e.value === a)?.label ?? "",
						to: q ? `/styling?tab=${a}` : void 0
					},
					...q ? [{ label: q }] : []
				],
				actions: /* @__PURE__ */ W(H, { children: [/* @__PURE__ */ U(v, {
					variant: "ghost",
					icon: "eye",
					"aria-pressed": k,
					onClick: () => oe(!k),
					className: "md:hidden",
					children: d("Preview")
				}), /* @__PURE__ */ U(D, {
					content: d("Open Site"),
					children: /* @__PURE__ */ U(b, {
						icon: "external",
						label: d("Open Site"),
						title: void 0,
						onClick: () => window.open("/", "_blank", "noopener"),
						className: "max-md:hidden"
					})
				})] })
			}),
			/* @__PURE__ */ U(w, {
				title: d("Styling"),
				backTo: "/",
				backLabel: d("Dashboard"),
				nested: !0,
				children: /* @__PURE__ */ U("nav", {
					"aria-label": d("Styling"),
					className: ve.nested ? "space-y-px" : "px-2 pb-4",
					children: Lt().map((e) => /* @__PURE__ */ U(T, {
						label: e.label,
						icon: ve.nested ? void 0 : e.icon,
						active: a === e.value,
						onClick: () => ne(e.value)
					}, e.value))
				})
			}),
			/* @__PURE__ */ U(C, {
				dirty: xe,
				saving: he,
				error: M ? M.refused ? d("The stylesheet was not saved") : M.message : null,
				onSave: () => void Ne(),
				onDiscard: () => {
					r(Ft), _e(null);
				}
			}),
			/* @__PURE__ */ U(Ce, {
				source: Te.source ?? t.data,
				children: /* @__PURE__ */ W("div", {
					className: "grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(340px,420px)_minmax(0,1fr)] xl:grid-cols-[minmax(380px,460px)_minmax(0,1fr)]",
					children: [/* @__PURE__ */ W("div", {
						ref: L,
						onScroll: (e) => zt.set(R, e.currentTarget.scrollTop),
						className: O("overflow-y-auto border-border px-4 pb-16 pt-2 md:border-r", k && "max-md:hidden"),
						children: [M?.refused && /* @__PURE__ */ U(ae, {
							tone: "danger",
							className: "mb-3 mt-1",
							title: d("Tailwind refused the stylesheet"),
							onDismiss: () => _e(null),
							children: M.message
						}), Le]
					}), /* @__PURE__ */ W("div", {
						className: O("flex min-w-0 flex-col bg-sunken", !k && "max-md:hidden"),
						children: [/* @__PURE__ */ W("div", {
							className: "flex h-10 shrink-0 items-center gap-2 border-b border-border bg-bg px-3",
							children: [
								/* @__PURE__ */ U("span", {
									className: "max-md:hidden",
									children: /* @__PURE__ */ U(se, {
										size: "xs",
										"aria-label": d("Screen"),
										value: j,
										onChange: me,
										options: [
											{
												value: "desktop",
												icon: "desktop",
												title: d("Desktop")
											},
											{
												value: "tablet",
												icon: "tablet",
												title: d("Tablet")
											},
											{
												value: "phone",
												icon: "phone",
												title: d("Phone")
											}
										]
									})
								}),
								j !== "desktop" && /* @__PURE__ */ U("span", {
									className: "font-mono text-2xs text-faint max-md:hidden",
									children: Fe[j]
								}),
								/* @__PURE__ */ U("span", { className: "flex-1" }),
								Ee && /* @__PURE__ */ U(se, {
									size: "xs",
									"aria-label": d("Color Mode"),
									value: y,
									onChange: re,
									options: [{
										value: "light",
										icon: "sun",
										title: d("Light")
									}, {
										value: "dark",
										icon: "moon",
										title: d("Dark")
									}]
								})
							]
						}), /* @__PURE__ */ U(Vt, {
							frame: ye,
							compile: Te,
							published: N.stylesheet,
							viewport: k ? "phone" : j,
							mode: Ee ? y : null,
							bordered: j !== "desktop" && !k
						})]
					})]
				})
			})
		]
	});
}
function Vt(e) {
	let { breakpoints: t } = V();
	return /* @__PURE__ */ U(Be, {
		...e,
		desktop: t.find((e) => e.name === "lg")?.width ?? 1024
	});
}
export { Bt as default };
