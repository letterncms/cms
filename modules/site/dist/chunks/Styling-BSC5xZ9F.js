import { i as e, n as t } from "./preview-J_UEsfe8.js";
import { a as n, c as r, d as i, l as a, n as o, s, u as c } from "./fields-CKXhwyJc.js";
import { CmsError as l, can as u, invalidate as ee, run as d, setQuery as f, t as p, timeAgo as m, useAbility as te, useLocation as ne } from "@letterncms/sdk";
import { useEffect as re, useLayoutEffect as ie, useMemo as h, useRef as g, useState as _ } from "react";
import { Button as v, Fields as ae, Icon as y, IconButton as b, Menu as oe, NEW_COLOR as se, Notice as ce, Popover as x, Pressable as S, QueryError as le, SaveBar as C, Segmented as w, Spinner as ue, Tooltip as T, Topbar as de, cn as E, confirm as fe, copyText as pe, prompt as me, toast as D, useShortcut as he, useTheme as ge } from "@letterncms/ui";
import { ARTICLE as O, ColorPicker as _e, FIELDS as ve, InspectorSection as ye, PaletteGrid as be, PanelFields as xe, SCHEME as k, SPACING_STEPS as A, SchemeTile as Se, Specimen as Ce, StyleBar as j, StylePanels as we, Stylesheet as Te, StylingProvider as Ee, Swatch as De, lightDark as M, loadTailwindTheme as Oe, parseClass as N, schemesOf as P, screenFor as ke, styleApi as Ae, styleLabel as F, styleSample as I, themeDefaults as je, useSpecimenSheet as Me, useStyling as L, withVariants as Ne } from "@letterncms/blocks";
import { Fragment as R, jsx as z, jsxs as B } from "react/jsx-runtime";
// admin/src/history.ts
var Pe = 700;
function Fe(e, t, n) {
	let r = g({
		past: [],
		future: [],
		at: 0
	}), i = g(void 0), a = g(!1), [, o] = _(0);
	re(() => {
		let t = i.current;
		if (i.current = e, e === void 0 || t === void 0 || n(t, e)) return;
		if (a.current) {
			a.current = !1;
			return;
		}
		let s = Date.now();
		(s - r.current.at > Pe || r.current.past.length === 0) && r.current.past.push(t), r.current.at = s, r.current.future = [], o((e) => e + 1);
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
var Ie = (e, t) => e.variables().filter((e) => e.name === t || e.name.startsWith(`${t}--`)).map((e) => e.name);
function V(e, ...t) {
	return t.some((t) => [.../* @__PURE__ */ new Set([...Ie(e.sheet, t), ...Ie(e.saved, t)])].some((t) => (e.sheet.variable(t) ?? null) !== (e.saved.variable(t) ?? null)));
}
function H(e, ...t) {
	e.change((n) => t.flatMap((t) => [.../* @__PURE__ */ new Set([...Ie(n, t), ...Ie(e.saved, t)])]).reduce((t, n) => t.setVariable(n, e.saved.variable(n) ?? null), n));
}
var Le = (e) => ({
	label: p("Revert"),
	icon: "undo",
	onSelect: e
}), U = "cms-reveal shrink-0", W = "cms-reveal-row px-3 transition-colors duration-base hover:bg-hover", G = () => /* @__PURE__ */ z("span", { className: "size-6 shrink-0" }), Re = ({ on: e }) => e ? /* @__PURE__ */ z("span", {
	role: "img",
	"aria-label": p("Unsaved changes"),
	className: "size-1.5 shrink-0 rounded-full bg-focus"
}) : null;
function K({ title: e, onAdd: t, addLabel: n, action: r, plain: i, children: a }) {
	return /* @__PURE__ */ B("section", {
		className: "mb-7",
		children: [
			e && /* @__PURE__ */ B("div", {
				className: "flex h-9 items-center gap-2 pl-0.5 pr-3",
				children: [
					/* @__PURE__ */ z("h3", {
						className: "cms-label m-0 min-w-0 flex-1 truncate",
						children: e
					}),
					r,
					t && n && /* @__PURE__ */ z(T, {
						content: n,
						children: /* @__PURE__ */ z(b, {
							icon: "plus",
							label: n,
							title: void 0,
							size: "xs",
							onClick: t
						})
					})
				]
			}),
			i ? a : /* @__PURE__ */ z("div", {
				className: "divide-y divide-border overflow-hidden rounded-lg border border-border bg-bg",
				children: a
			}),
			!e && (r || t && n) && /* @__PURE__ */ z("div", {
				className: "flex h-9 items-center",
				children: r ?? /* @__PURE__ */ z(v, {
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
	return /* @__PURE__ */ z(ae, {
		bare: !0,
		className: E("flex min-w-0 flex-1", o),
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
function J({ name: e, copy: t = e, sample: n, after: r, below: i, wide: a, changed: o, menu: s, children: c }) {
	return /* @__PURE__ */ B("div", {
		className: E(W, "group"),
		children: [/* @__PURE__ */ B("div", {
			className: "flex min-h-10 items-center gap-2 py-1.5",
			children: [
				n !== void 0 && /* @__PURE__ */ z("span", {
					className: "grid w-7 shrink-0 place-items-center",
					children: n
				}),
				/* @__PURE__ */ B("span", {
					className: E("flex min-w-0 items-center gap-1.5", a ? "flex-1" : n === void 0 ? "w-[120px] max-sm:w-20" : "w-[84px] max-sm:w-16"),
					children: [/* @__PURE__ */ z(T, {
						content: p("Copy Name"),
						children: /* @__PURE__ */ z(v, {
							variant: "ghost",
							size: "xs",
							onClick: () => void pe(t, { copied: p("Copied {reference}", { reference: t }) }),
							"aria-label": p("Copy {reference}", { reference: t }),
							className: "min-w-0 shrink !justify-start !bg-transparent !px-0 text-left !text-sm !font-normal !text-text hover:!text-ink",
							children: /* @__PURE__ */ z("span", {
								className: "truncate",
								children: e
							})
						})
					}), /* @__PURE__ */ z(Re, { on: !!o })]
				}),
				a ? c : /* @__PURE__ */ z("div", {
					className: "flex w-56 min-w-0 shrink gap-1 max-lg:w-48 max-sm:w-auto max-sm:flex-1",
					children: c
				}),
				!a && /* @__PURE__ */ z("span", {
					className: "flex min-w-0 flex-1 items-center max-sm:hidden",
					children: r
				}),
				s && s.length > 0 ? /* @__PURE__ */ z(oe, {
					trigger: /* @__PURE__ */ z(b, {
						icon: "more",
						label: p("Actions"),
						size: "xs",
						className: U
					}),
					items: s
				}) : /* @__PURE__ */ z(G, {})
			]
		}), i]
	});
}
function ze({ label: e, changed: t, action: n, children: r }) {
	return /* @__PURE__ */ B("div", {
		className: E(W, "flex min-h-10 items-center gap-2 py-1.5"),
		children: [
			/* @__PURE__ */ B("span", {
				className: "flex w-[120px] shrink-0 items-center gap-1.5 text-sm text-text max-sm:w-20",
				children: [/* @__PURE__ */ z("span", {
					className: "truncate",
					children: e
				}), /* @__PURE__ */ z(Re, { on: !!t })]
			}),
			/* @__PURE__ */ z("div", {
				className: "flex w-56 min-w-0 shrink items-center max-lg:w-48 max-sm:w-auto max-sm:flex-1",
				children: r
			}),
			/* @__PURE__ */ z("span", { className: "min-w-0 flex-1 max-sm:hidden" }),
			n ? /* @__PURE__ */ z("span", {
				className: U,
				children: n
			}) : /* @__PURE__ */ z(G, {})
		]
	});
}
function Be({ onOpen: e, label: t, sample: n, changed: r, menu: i }) {
	return /* @__PURE__ */ B("div", {
		className: E(W, "group flex items-center gap-2 py-1.5"),
		children: [/* @__PURE__ */ B(v, {
			variant: "ghost",
			onClick: e,
			className: "!h-auto min-h-9 min-w-0 flex-1 shrink !justify-start !gap-3 !rounded-xs !bg-transparent !px-0 text-left !text-sm !font-normal focus-visible:!-outline-offset-2 hover:text-ink",
			children: [
				/* @__PURE__ */ B("span", {
					className: "flex w-28 shrink-0 items-center gap-1.5 text-text max-sm:w-20",
					children: [/* @__PURE__ */ z("span", {
						className: "truncate",
						children: t
					}), /* @__PURE__ */ z(Re, { on: !!r })]
				}),
				n,
				/* @__PURE__ */ z(y, {
					name: "chevron-right",
					size: 14,
					className: "ml-auto shrink-0 text-faint"
				})
			]
		}), i ?? /* @__PURE__ */ z(G, {})]
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
		label: p("Page"),
		node: {
			tag: "p",
			text: p("Page")
		},
		groups: ["typography", "fill"]
	},
	{
		selector: "::selection",
		label: p("Selection"),
		node: {
			tag: "span",
			text: p("Selection")
		},
		groups: ["typography", "fill"]
	},
	{
		selector: ":focus-visible",
		label: p("Focus Ring"),
		node: {
			tag: "span",
			text: p("Focus Ring"),
			className: "inline-block rounded-sm px-2"
		},
		groups: ["border", "effects"]
	},
	{
		selector: "hr",
		label: p("Divider"),
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
		label: p("Heading 1"),
		node: {
			tag: "h1",
			text: p("Heading 1")
		}
	},
	{
		selector: "h2",
		label: p("Heading 2"),
		node: {
			tag: "h2",
			text: p("Heading 2")
		}
	},
	{
		selector: "h3",
		label: p("Heading 3"),
		node: {
			tag: "h3",
			text: p("Heading 3")
		}
	},
	{
		selector: "h4",
		label: p("Heading 4"),
		node: {
			tag: "h4",
			text: p("Heading 4")
		}
	},
	{
		selector: "h5",
		label: p("Heading 5"),
		node: {
			tag: "h5",
			text: p("Heading 5")
		}
	},
	{
		selector: "h6",
		label: p("Heading 6"),
		node: {
			tag: "h6",
			text: p("Heading 6")
		}
	},
	{
		selector: "p",
		label: p("Paragraph"),
		node: {
			tag: "p",
			text: p("Paragraph")
		}
	},
	{
		selector: "a",
		label: p("Link"),
		node: {
			tag: "a",
			text: p("Link"),
			attributes: { href: "#" }
		}
	},
	{
		selector: "strong",
		label: p("Bold"),
		node: {
			tag: "strong",
			text: p("Bold")
		}
	},
	{
		selector: "small",
		label: p("Small"),
		node: {
			tag: "small",
			text: p("Small")
		}
	},
	{
		selector: "blockquote",
		label: p("Quote"),
		node: {
			tag: "blockquote",
			text: p("Quote")
		}
	},
	{
		selector: "code",
		label: p("Code"),
		node: {
			tag: "code",
			text: p("Code")
		}
	},
	{
		selector: "figcaption",
		label: p("Caption"),
		node: {
			tag: "figcaption",
			text: p("Caption")
		}
	}
], Y = (e) => ({
	tag: "div",
	text: "",
	markup: `<div class="cms-prose">${e}</div>`
}), qe = () => [
	{
		key: "h2",
		selector: O.h2,
		label: p("Heading 2"),
		node: Y(`<h2 style="margin:0">${p("Heading 2")}</h2>`)
	},
	{
		key: "h3",
		selector: O.h3,
		label: p("Heading 3"),
		node: Y(`<h3 style="margin:0">${p("Heading 3")}</h3>`)
	},
	{
		key: "p",
		selector: O.p,
		label: p("Paragraph"),
		node: Y(`<p style="margin:0">${p("Paragraph")}</p>`)
	},
	{
		key: "li",
		selector: O.li,
		label: p("List Item"),
		node: Y(`<ul><li>${p("List Item")}</li></ul>`)
	},
	{
		key: "blockquote",
		selector: O.blockquote,
		label: p("Quote"),
		node: Y(`<blockquote style="margin:0">${p("Quote")}</blockquote>`)
	},
	{
		key: "figure",
		selector: O.figure,
		label: p("Figure"),
		node: Y(`<figure style="margin:0">${p("Figure")}</figure>`),
		groups: [
			"spacing",
			"border",
			"effects"
		]
	},
	{
		key: "a",
		selector: O.a,
		label: p("Link"),
		node: Y(`<p><a href="#">${p("Link")}</a></p>`)
	}
];
function Je(e, t) {
	return !e || t.length === 0 ? !1 : t.every((t) => {
		let n = e.declarations(Ve(N(t).utility));
		return !!n && n.every((e) => /^(font|text-(?!indent)|letter|line-height|color$|white-space|word|overflow-wrap|hyphens|--tw-(font|leading|tracking|ordinal|slashed|numeric|text))/.test(e.property));
	});
}
function Ye(e, t, n) {
	let r = (e) => {
		let { variants: r, utility: i } = N(e);
		return Ve(i) === t ? Ne(r, i.replace(t, n)) : e;
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
	let o = Xe((await me({
		title: n,
		fields: [{
			handle: "name",
			type: "text",
			label: p("Name"),
			placeholder: i ? "outline" : "lead",
			required: !0,
			autofocus: !0
		}],
		values: { name: a ? F(a) : "" },
		confirm: r
	}))?.name);
	if (!o) return null;
	let s = `${i}${o}`;
	return s === a ? null : /^[a-z][a-z0-9-]*$/.test(s) ? t.includes(s) || e?.valid(s) ? (D.error(p("There is already a style “{name}”.", { name: F(s) })), null) : s : (D.error(p("A name is lowercase letters, numbers and hyphens, and starts with a letter.")), null);
}
function Qe({ edit: e, samples: t, name: n, selector: r, node: i, classes: a, groups: o, write: s, menu: c }) {
	let l = L(), [u, ee] = _([]), d = h(() => ke(t.device, 1280, l.breakpoints), [t.device, l.breakpoints]), f = Ae(l.engine, a, d, u, e.readOnly ? () => {} : s), p = Ue(e.sheet), m = Me(t.compiler, [
		...He(p),
		...a.map((e) => Ve(N(e).utility)),
		...a,
		...He(i.className ?? "")
	]);
	return /* @__PURE__ */ B("div", {
		className: "-mx-4 -mt-2",
		children: [
			/* @__PURE__ */ z("div", {
				className: "sticky top-0 z-raised bg-bg",
				children: /* @__PURE__ */ z(j, {
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
					lead: /* @__PURE__ */ z($e, {
						name: n,
						selector: r
					}),
					actions: /* @__PURE__ */ z(et, { menu: c })
				})
			}),
			/* @__PURE__ */ z("div", {
				className: "border-b border-border p-4",
				children: /* @__PURE__ */ z(Ce, {
					sheet: m,
					node: i,
					page: p,
					mode: e.mode,
					align: "center",
					className: "h-28 rounded-md border border-border"
				})
			}),
			/* @__PURE__ */ z("div", {
				inert: e.readOnly,
				children: /* @__PURE__ */ z(we, {
					s: f,
					groups: o
				})
			})
		]
	});
}
function $e({ name: e, selector: t }) {
	return /* @__PURE__ */ z("div", {
		className: "flex min-h-8 min-w-0 flex-1 items-center",
		children: e ? /* @__PURE__ */ z(T, {
			content: p("Copy Name"),
			children: /* @__PURE__ */ z(v, {
				variant: "ghost",
				size: "xs",
				onClick: () => void pe(e, { copied: p("Copied {reference}", { reference: e }) }),
				className: "min-w-0 shrink !px-1.5 font-mono !font-normal !text-muted hover:!text-ink",
				children: /* @__PURE__ */ B("span", {
					className: "truncate",
					children: [".", e]
				})
			})
		}) : t && /* @__PURE__ */ z("span", {
			className: "min-w-0 truncate px-1.5 font-mono text-xs text-muted",
			children: t
		})
	});
}
var et = ({ menu: e }) => e && e.length > 0 ? /* @__PURE__ */ z(oe, {
	align: "end",
	trigger: /* @__PURE__ */ z(b, {
		icon: "more",
		label: p("Style Actions"),
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
	"var(--font-weight-normal)": p("Regular"),
	"var(--font-weight-medium)": p("Medium"),
	"var(--font-weight-semibold)": p("Semibold"),
	"var(--font-weight-bold)": p("Bold")
}), nt = () => [
	{
		key: "form:fields",
		label: p("Fields"),
		selector: ve,
		layer: "base",
		sample: {
			tag: "div",
			text: "",
			markup: "<input class=\"cms-input\" placeholder=\"you@example.com\" tabindex=\"-1\" style=\"width:16rem\">"
		},
		sections: [
			{
				title: p("Field"),
				values: [
					X("--field-background", p("Fill")),
					X("--field-color", p("Text")),
					X("--field-placeholder", p("Placeholder")),
					Z("--field-border-width", p("Border")),
					X("--field-border-color", p("Border Color")),
					Z("--field-radius", p("Radius"), "rem", ["rem", "px"]),
					{
						property: "--field-shadow",
						label: p("Shadow"),
						field: { component: "site-shadow" }
					}
				]
			},
			{
				title: p("Pointed At"),
				values: [X("--field-hover-background", p("Fill")), X("--field-hover-border-color", p("Border Color"))]
			},
			{
				title: p("Focus"),
				values: [
					X("--field-focus-background", p("Fill")),
					X("--field-focus-border-color", p("Border Color")),
					X("--field-focus-ring-color", p("Ring")),
					Z("--field-focus-ring-width", p("Ring Width"))
				]
			},
			{
				title: p("Error"),
				values: [X("--field-invalid-color", p("Color"))]
			}
		]
	},
	{
		key: "form:labels",
		label: p("Labels"),
		selector: ve,
		layer: "base",
		sample: {
			tag: "div",
			text: "",
			markup: `<div class="cms-field"><label class="cms-label">${p("Email")}</label><p class="cms-help">${p("We never share it.")}</p></div>`
		},
		sections: [
			{
				title: p("Label"),
				values: [
					{
						property: "--field-label-font-size",
						label: p("Size"),
						field: { component: "site-size" }
					},
					{
						property: "--field-label-font-weight",
						label: p("Weight"),
						field: {
							type: "select",
							options: tt()
						}
					},
					X("--field-label-color", p("Color"))
				]
			},
			{
				title: p("Help"),
				values: [{
					property: "--field-help-font-size",
					label: p("Size"),
					field: { component: "site-size" }
				}, X("--field-help-color", p("Color"))]
			},
			{
				title: p("Spacing"),
				values: [Z("--field-spacing-fields", p("Between Fields"), "rem", ["rem", "px"]), Z("--field-spacing-label", p("Under Label"), "rem", ["rem", "px"])]
			}
		]
	},
	{
		key: "form:choices",
		label: p("Choices"),
		selector: ve,
		layer: "base",
		sample: {
			tag: "div",
			text: "",
			markup: rt()
		},
		sections: [
			{
				title: p("Checkbox"),
				values: [
					Z("--field-checkbox-size", p("Size"), "rem", ["rem", "px"]),
					Z("--field-checkbox-radius", p("Radius")),
					X("--field-checkbox-checked", p("Checked")),
					X("--field-checkbox-mark-color", p("Mark"))
				]
			},
			{
				title: p("Radio Button"),
				values: [X("--field-radio-checked", p("Checked"))]
			},
			{
				title: p("Switch"),
				values: [X("--field-switch-off", p("Off")), X("--field-switch-on", p("On"))]
			}
		]
	}
], rt = () => `<div style="display:flex;gap:1rem;white-space:nowrap"><label class="cms-choice"><input type="checkbox" class="cms-check" checked tabindex="-1"> ${p("Newsletter")}</label><label class="cms-choice"><input type="radio" class="cms-radio" checked tabindex="-1"> ${p("Lunch")}</label><label class="cms-choice"><input type="checkbox" role="switch" class="cms-switch" checked tabindex="-1"> ${p("Reminders")}</label></div>`, it = () => ({
	tag: "form",
	text: "",
	markup: `<div class="cms-form" style="white-space:normal">
<div class="cms-field"><label class="cms-label">${p("Email")}</label><input class="cms-input" placeholder="you@example.com" tabindex="-1"><p class="cms-help">${p("We never share it.")}</p></div>
<div class="cms-field"><select class="cms-input" tabindex="-1"><option>${p("Dinner for two")}</option></select></div>
${rt()}
</div>`
}), at = () => ({
	key: "article:spacing",
	label: p("Spacing in Articles"),
	selector: O.spacing,
	layer: "components",
	sample: Y(`<h2 style="margin:0">${p("Heading 2")}</h2><p>${p("Paragraph")}</p><p>${p("Paragraph")}</p><ul><li>${p("List Item")}</li><li>${p("List Item")}</li></ul>`),
	sections: [{
		title: "spacing",
		values: [
			Z("--prose-blocks", p("Blocks"), "em", [
				"em",
				"rem",
				"px"
			]),
			Z("--prose-headings", p("Above Headings"), "em", [
				"em",
				"rem",
				"px"
			]),
			Z("--prose-after-headings", p("Below Headings"), "em", [
				"em",
				"rem",
				"px"
			]),
			Z("--prose-items", p("List Items"), "em", [
				"em",
				"rem",
				"px"
			])
		]
	}]
});
function ot({ edit: e, samples: t, part: n }) {
	let { source: r } = L(), i = h(() => new Te(r?.files.cms ?? ""), [r?.files.cms]), a = Ue(e.sheet), o = Me(t.compiler, He(a)), s = (t) => e.sheet.property(n.selector, t, n.layer), c = n.layer === "base" ? it() : n.sample;
	return /* @__PURE__ */ B("div", {
		className: "-mx-4 -mt-2",
		children: [
			/* @__PURE__ */ B("div", {
				className: "sticky top-0 z-raised flex items-center gap-1 border-b border-border bg-bg py-2 pl-4 pr-3",
				children: [/* @__PURE__ */ z($e, {}), /* @__PURE__ */ z(et, { menu: lt(e, n) })]
			}),
			/* @__PURE__ */ z("div", {
				className: "border-b border-border p-4",
				children: /* @__PURE__ */ z(Ce, {
					sheet: o,
					node: c,
					page: a,
					mode: e.mode,
					align: "center",
					className: "h-64 rounded-md border border-border"
				})
			}),
			/* @__PURE__ */ z("div", {
				inert: e.readOnly,
				children: n.sections.map((t) => {
					let r = /* @__PURE__ */ z(xe, {
						fields: t.values.map((t) => ({
							handle: t.property,
							type: "text",
							size: "sm",
							label: t.label,
							...t.field,
							status: st(e, n, t.property) ? "own" : void 0,
							reset: () => e.change((r) => r.setProperty(n.selector, t.property, e.saved.property(n.selector, t.property, n.layer) ?? null, n.layer))
						})),
						values: Object.fromEntries(t.values.map((e) => [e.property, s(e.property) ?? i.property(n.selector, e.property, n.layer) ?? null])),
						onChange: (t, r) => e.change((e) => e.setProperty(n.selector, t, r == null || r === "" ? null : String(r), n.layer))
					});
					return n.sections.length === 1 ? /* @__PURE__ */ z("div", {
						className: "space-y-1 px-4 py-3",
						children: r
					}, t.title) : /* @__PURE__ */ z(ye, {
						title: t.title,
						children: r
					}, t.title);
				})
			})
		]
	});
}
var st = (e, t, n) => (e.sheet.property(t.selector, n, t.layer) ?? null) !== (e.saved.property(t.selector, n, t.layer) ?? null), ct = (e, t) => t.sections.some((n) => n.values.some((n) => st(e, t, n.property)));
function lt(e, t) {
	if (e.readOnly || !ct(e, t)) return [];
	let n = t.sections.flatMap((e) => e.values);
	return [Le(() => e.change((r) => n.reduce((n, r) => n.setProperty(t.selector, r.property, e.saved.property(t.selector, r.property, t.layer) ?? null, t.layer), r)))];
}
var ut = (e, t, n) => e.elements(n).find((e) => e.name === t)?.classes ?? [], dt = (e, t) => e.utilities().find((e) => e.name === t)?.classes, ft = (e, t, n = "base") => ut(e.sheet, t, n).join(" ") !== ut(e.saved, t, n).join(" "), pt = (e, t) => dt(e.sheet, t)?.join(" ") !== dt(e.saved, t)?.join(" ");
function mt({ edit: e, samples: t }) {
	let { engine: n } = L(), r = ne().query.style ?? "", i = (e) => f({
		style: e,
		tab: "styles"
	}, !1), [a, o] = _(null), s = [...e.sheet.elements(), ...e.sheet.elements("components")], c = (e) => s.find((t) => t.name === e)?.classes ?? [], l = e.sheet.utilities().filter((e) => /^[a-z][\w-]*$/.test(e.name) && !e.name.startsWith("scheme-")), u = l.filter((e) => e.name.startsWith("btn-")), ee = l.filter((e) => !e.name.startsWith("btn-")), d = ee.filter((e) => Je(n, e.classes) || a?.name === e.name && a.text), m = ee.filter((e) => !d.includes(e)), te = Ue(e.sheet), re = Me(t.compiler, [
		...He(te),
		...c("::selection"),
		...c(":focus-visible"),
		...Ge().flatMap((e) => He(e.node.className ?? "")),
		...l.map((e) => e.name)
	]), ie = e.sheet.utilities().map((e) => e.name), h = (e) => ["::selection", ":focus-visible"].includes(e.selector) ? {
		...e.node,
		className: [e.node.className, ...c(e.selector)].filter(Boolean).join(" ")
	} : e.node, g = async (t) => {
		let r = await Ze(n, ie, p(t === "button" ? "New Button" : "New Style"), p(t === "button" ? "Create Button" : "Create Style"), t === "button" ? "btn-" : "");
		r && (t === "button" && u[0] ? e.change((e) => e.duplicateUtility(u[0].name, r)) : e.change((e) => e.setUtility(r, t === "text" ? ["text-base"] : t === "box" ? ["p-6"] : ["inline-flex"])), o({
			name: r,
			text: t === "text"
		}), i(r));
	}, v = async (t) => {
		let a = await Ze(n, ie, p("Rename"), p("Rename"), t.startsWith("btn-") ? "btn-" : "", t);
		a && (e.change((e) => Ye(e, t, a)), r === t && i(a));
	}, ae = async (t) => {
		let r = await Ze(n, ie, p("Duplicate"), p("Duplicate"), t.startsWith("btn-") ? "btn-" : "");
		r && e.change((e) => e.duplicateUtility(t, r));
	}, y = async (t) => {
		await fe({
			title: p("Delete “{name}”?", { name: F(t) }),
			confirm: p("Delete"),
			danger: !0
		}) && (e.change((e) => e.removeUtility(t)), r === t && i(null));
	}, se = (t) => e.readOnly ? [] : [
		...pt(e, t) && dt(e.saved, t) ? [Le(() => e.change((n) => n.setUtility(t, dt(e.saved, t)))), {
			separator: !0,
			label: ""
		}] : [],
		{
			label: p("Rename…"),
			icon: "edit",
			onSelect: () => void v(t)
		},
		{
			label: p("Duplicate…"),
			icon: "copy",
			onSelect: () => void ae(t)
		},
		{
			separator: !0,
			label: ""
		},
		{
			label: p("Delete"),
			icon: "trash",
			danger: !0,
			onSelect: () => void y(t)
		}
	], ce = (t, n = "base") => e.readOnly || !ft(e, t, n) ? [] : [Le(() => {
		let r = ut(e.saved, t, n);
		e.change((e) => r.length > 0 ? e.setElement(t, r, n) : e.removeElement(t, n));
	})], x = [...Ge(), ...Ke()].find((e) => `element:${e.selector}` === r);
	if (x) return /* @__PURE__ */ z(Qe, {
		edit: e,
		samples: t,
		selector: x.selector,
		node: h(x),
		classes: c(x.selector),
		groups: x.groups ?? We,
		menu: ce(x.selector),
		write: (t) => e.change((e) => e.setElement(x.selector, t))
	}, r);
	let S = qe().find((e) => `article:${e.key}` === r);
	if (S) return /* @__PURE__ */ z(Qe, {
		edit: e,
		samples: t,
		selector: S.selector,
		node: S.node,
		classes: c(S.selector),
		groups: S.groups ?? We,
		menu: ce(S.selector, "components"),
		write: (t) => e.change((e) => e.setElement(S.selector, t, "components"))
	}, r);
	let le = [...nt(), at()].find((e) => e.key === r);
	if (le) return /* @__PURE__ */ z(ot, {
		edit: e,
		samples: t,
		part: le
	}, r);
	let C = l.find((e) => e.name === r);
	if (C) return /* @__PURE__ */ z(Qe, {
		edit: e,
		samples: t,
		name: C.name,
		node: I(C.name),
		classes: C.classes,
		groups: d.includes(C) ? We : void 0,
		menu: se(C.name),
		write: (t) => e.change((e) => t.length > 0 || e.utilities().find((e) => e.name === C.name)?.custom ? e.setUtility(C.name, t) : e.removeUtility(C.name))
	}, r);
	let w = (t, n, r, a, o) => /* @__PURE__ */ z(Be, {
		onOpen: () => i(t),
		label: n,
		changed: o,
		sample: /* @__PURE__ */ z(Ce, {
			sheet: re,
			node: r,
			page: te,
			mode: e.mode,
			className: "h-12 min-w-0 flex-1 rounded-sm shadow-edge"
		}),
		menu: a.length ? /* @__PURE__ */ z(oe, {
			trigger: /* @__PURE__ */ z(b, {
				icon: "more",
				label: p("Style Actions"),
				size: "xs",
				className: U
			}),
			items: a
		}) : void 0
	}, t), ue = (t) => e.readOnly ? void 0 : () => void g(t);
	return /* @__PURE__ */ B(R, { children: [
		/* @__PURE__ */ z(K, {
			title: p("Page"),
			children: Ge().map((t) => w(`element:${t.selector}`, t.label, h(t), ce(t.selector), ft(e, t.selector)))
		}),
		/* @__PURE__ */ B(K, {
			title: p("Text"),
			onAdd: ue("text"),
			addLabel: p("New Text Style"),
			children: [Ke().map((t) => w(`element:${t.selector}`, t.label, t.node, ce(t.selector), ft(e, t.selector))), d.map((t) => w(t.name, F(t.name), I(t.name), se(t.name), pt(e, t.name)))]
		}),
		/* @__PURE__ */ z(K, {
			title: p("Buttons"),
			onAdd: ue("button"),
			addLabel: p("New Button"),
			children: u.map((t) => w(t.name, F(t.name), I(t.name), se(t.name), pt(e, t.name)))
		}),
		/* @__PURE__ */ z(K, {
			title: p("Forms"),
			children: nt().map((t) => w(t.key, t.label, t.sample, lt(e, t), ct(e, t)))
		}),
		/* @__PURE__ */ B(K, {
			title: p("Articles"),
			children: [w(at().key, p("Spacing"), at().sample, lt(e, at()), ct(e, at())), qe().map((t) => w(`article:${t.key}`, t.label, t.node, ce(t.selector, "components"), ft(e, t.selector, "components")))]
		}),
		/* @__PURE__ */ z(K, {
			title: p("Boxes"),
			onAdd: ue("box"),
			addLabel: p("New Style"),
			children: m.map((t) => w(t.name, F(t.name), {
				...I(t.name),
				className: `${t.name} inline-block`
			}, se(t.name), pt(e, t.name)))
		})
	] });
}
function ht(e, t) {
	let n = [...Ge(), ...Ke()].find((e) => `element:${e.selector}` === t);
	if (n) return n.label;
	let r = qe().find((e) => `article:${e.key}` === t);
	if (r) return p("{name} in Articles", { name: r.label });
	let i = [...nt(), at()].find((e) => e.key === t);
	return i ? i.label : e.utilities().some((e) => e.name === t) ? F(t) : null;
}
// admin/src/theme.tsx
function gt(e, t, n = () => !1) {
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
var _t = (e) => String(e ?? "").trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/^-+|-+$/g, "");
async function vt(e, t, n, r, i = "", a = "md") {
	let o = _t((await me({
		title: n,
		fields: [{
			handle: "name",
			type: "text",
			label: p("Name"),
			mono: !0,
			autofocus: !0,
			required: !0,
			placeholder: a
		}],
		values: { name: i },
		confirm: r
	}))?.name);
	return !o || o === i ? null : e.sheet.variable(`${t}${o}`) !== void 0 || e.defaults.has(`${t}${o}`) ? (D.error(p("“{name}” already exists", { name: o })), null) : o;
}
function yt(e, t, n, r) {
	let i = n.name.slice(0, n.name.length - n.key.length) + r, a = RegExp(`^(!?.*-)${n.key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}((?:/[^!]+)?!?)$`), o = (e) => {
		let { variants: i, utility: o } = N(e), s = a.exec(o);
		return !s || !t?.declarations(o.replace(/^!|!$/g, ""))?.some((e) => e.value.includes(`var(${n.name})`)) ? e : Ne(i, `${s[1]}${r}${s[2]}`);
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
var bt = (e, t) => e.variables().filter((e) => e.name === t || e.name.startsWith(`${t}--`)).reduce((e, t) => e.setVariable(t.name, null), e);
function xt(e, t) {
	let { engine: n } = L();
	return (r, i = []) => {
		if (e.readOnly) return [];
		let a = V(e, r.name) ? [Le(() => H(e, r.name))] : [];
		return r.builtIn ? [
			...i,
			...a.length && i.length ? [{
				separator: !0,
				label: ""
			}] : [],
			...a
		] : [
			...a,
			{
				label: p("Rename…"),
				icon: "edit",
				onSelect: async () => {
					let i = await vt(e, t.prefix, p("Rename"), p("Rename"), r.key, t.placeholder);
					i && e.change((e) => yt(e, n, r, i));
				}
			},
			...i,
			{
				separator: !0,
				label: ""
			},
			{
				label: p("Delete"),
				icon: "trash",
				danger: !0,
				onSelect: () => e.change((e) => bt(e, r.name))
			}
		];
	};
}
function Q({ edit: e, kind: t, row: n }) {
	let r = xt(e, t), i = async () => {
		let n = await vt(e, t.prefix, t.fresh, t.add, "", t.placeholder);
		n && e.change((e) => e.setVariable(`${t.prefix}${n}`, t.start));
	};
	return /* @__PURE__ */ z(K, {
		title: t.title,
		onAdd: e.readOnly ? void 0 : () => void i(),
		addLabel: t.add,
		children: gt(e, t.prefix, t.skip).map((t) => n(t, (n) => n !== null && e.change((e) => e.setVariable(t.name, n)), (e) => r(t, e)))
	});
}
var $ = (e, t = {}) => ({
	component: "blocks-value",
	unit: e,
	...t
}), St = { component: "site-size" }, Ct = $("rem", {
	units: [
		"rem",
		"px",
		"em"
	],
	step: .125,
	min: 0
}), wt = /^(.+)-(\d{2,3})$/;
function Tt({ label: e, value: t, same: n, onChange: r, disabled: i, size: a = "md" }) {
	let { engine: o } = L(), [s, c] = _(!1), l = (e) => M(o ? o.resolve(e) : e).light, u = t ?? n ?? "transparent";
	return /* @__PURE__ */ z(x, {
		open: s,
		onOpenChange: c,
		align: "end",
		className: "!p-0",
		trigger: /* @__PURE__ */ z(S, {
			compact: !0,
			"aria-label": e,
			title: `${e} · ${t ?? p("Same")}`,
			disabled: i,
			className: E("relative shrink-0 rounded-sm outline-offset-2 data-[popup-open]:ring-2 data-[popup-open]:ring-focus", a === "md" ? "size-7" : "size-6"),
			children: /* @__PURE__ */ z(De, {
				color: l(u),
				className: E("!size-full !rounded-sm", t === null && "opacity-35")
			})
		}),
		children: /* @__PURE__ */ z(_e, {
			label: e,
			value: t ?? void 0,
			onChange: r
		})
	});
}
function Et({ edit: e, row: t }) {
	let [n, r] = _(!1);
	return /* @__PURE__ */ z(x, {
		open: n,
		onOpenChange: r,
		align: "start",
		className: "!p-0",
		trigger: /* @__PURE__ */ B(S, {
			compact: !0,
			"aria-label": t.key,
			title: t.key,
			disabled: e.readOnly,
			className: "relative h-6 rounded-xs outline-offset-1 hover:z-raised hover:ring-2 hover:ring-float data-[popup-open]:z-raised data-[popup-open]:ring-2 data-[popup-open]:ring-focus",
			style: { background: M(t.value).light },
			children: [/* @__PURE__ */ z("span", { className: "cms-swatch-edge" }), V(e, t.name) && /* @__PURE__ */ z("span", {
				className: "absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-edge",
				"aria-hidden": !0
			})]
		}),
		children: /* @__PURE__ */ z(_e, {
			label: t.key,
			value: t.value,
			onChange: (n) => n === null ? H(e, t.name) : e.change((e) => e.setVariable(t.name, n))
		})
	});
}
var Dt = (e, t, n, r) => e.writeUtility(t, [{
	name: "--scheme",
	value: n
}, {
	name: "--scheme-text",
	value: r
}], ["scheme"]);
function Ot({ edit: e }) {
	let { engine: t } = L(), n = P(e.sheet), r = (n) => {
		let r = M(t ? t.resolve(n) : n);
		return e.mode === "dark" ? r.dark ?? r.light : r.light;
	}, i = async () => {
		let t = _t((await me({
			title: p("New Scheme"),
			fields: [{
				handle: "name",
				type: "text",
				label: p("Name"),
				mono: !0,
				autofocus: !0,
				required: !0,
				placeholder: "ocean"
			}],
			confirm: p("Add Scheme")
		}))?.name);
		if (t) {
			if (n.some((e) => e.key === t)) return void D.error(p("“{name}” already exists", { name: t }));
			e.change((e) => Dt(e, `${k}${t}`, "var(--color-foreground)", "var(--color-background)"));
		}
	}, a = async (t) => {
		let r = _t((await me({
			title: p("Rename"),
			fields: [{
				handle: "name",
				type: "text",
				label: p("Name"),
				mono: !0,
				autofocus: !0,
				required: !0
			}],
			values: { name: t.key },
			confirm: p("Rename")
		}))?.name);
		if (r && r !== t.key) {
			if (n.some((e) => e.key === r)) return void D.error(p("“{name}” already exists", { name: r }));
			e.change((e) => e.renameUtility(t.name, `${k}${r}`));
		}
	};
	return /* @__PURE__ */ z(K, {
		plain: !0,
		title: p("Schemes"),
		onAdd: e.readOnly ? void 0 : () => void i(),
		addLabel: p("Add Scheme"),
		children: n.length > 0 && /* @__PURE__ */ z("div", {
			className: "grid grid-cols-2 gap-3 pt-1",
			children: n.map((t) => /* @__PURE__ */ B("div", {
				className: "cms-reveal-row group min-w-0",
				children: [/* @__PURE__ */ z(Se, {
					size: "card",
					background: r(t.background),
					text: r(t.text)
				}), /* @__PURE__ */ B("div", {
					className: "flex h-9 items-center gap-1.5",
					children: [
						/* @__PURE__ */ z(T, {
							content: p("Copy Name"),
							children: /* @__PURE__ */ z(v, {
								variant: "ghost",
								size: "xs",
								onClick: () => void pe(t.name, { copied: p("Copied {reference}", { reference: t.name }) }),
								className: "min-w-0 flex-1 shrink !justify-start !bg-transparent !px-0 !text-sm !font-normal !text-text hover:!text-ink",
								children: /* @__PURE__ */ z("span", {
									className: "truncate",
									children: t.key
								})
							})
						}),
						/* @__PURE__ */ z(Re, { on: e.sheet.utilityProperties(t.name).map((e) => e.value).join() !== e.saved.utilityProperties(t.name).map((e) => e.value).join() }),
						/* @__PURE__ */ z(Tt, {
							size: "sm",
							label: p("{name} Background", { name: t.key }),
							value: t.background,
							disabled: e.readOnly,
							onChange: (n) => n && e.change((e) => Dt(e, t.name, n, t.text))
						}),
						/* @__PURE__ */ z(Tt, {
							size: "sm",
							label: p("{name} Text", { name: t.key }),
							value: t.text,
							disabled: e.readOnly,
							onChange: (n) => n && e.change((e) => Dt(e, t.name, t.background, n))
						}),
						e.readOnly ? /* @__PURE__ */ z(G, {}) : /* @__PURE__ */ z(oe, {
							trigger: /* @__PURE__ */ z(b, {
								icon: "more",
								label: p("Actions"),
								size: "xs",
								className: "cms-reveal shrink-0"
							}),
							items: [
								{
									label: p("Rename…"),
									icon: "edit",
									onSelect: () => void a(t)
								},
								{
									separator: !0,
									label: ""
								},
								{
									label: p("Delete"),
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
function kt({ edit: e }) {
	let t = {
		prefix: "--color-",
		title: p("Site Colors"),
		add: p("Add Color"),
		fresh: p("New Color"),
		start: se,
		placeholder: "brand"
	}, n = xt(e, t), r = gt(e, t.prefix), i = (t) => t.builtIn && e.palette.has(t.name), a = r.filter((e) => !i(e)), o = /* @__PURE__ */ new Map();
	for (let e of r.filter(i)) {
		let t = wt.exec(e.key)?.[1];
		t && o.set(t, [...o.get(t) ?? [], e]);
	}
	let s = async () => {
		let n = await vt(e, t.prefix, t.fresh, t.add, "", t.placeholder);
		n && e.change((e) => e.setVariable(`${t.prefix}${n}`, t.start));
	}, c = (t, n, r) => e.change((e) => e.setVariable(t.name, r && r !== n ? `light-dark(${n}, ${r})` : n));
	return /* @__PURE__ */ B(R, { children: [
		/* @__PURE__ */ z(K, {
			title: t.title,
			action: /* @__PURE__ */ B(R, { children: [
				/* @__PURE__ */ z("span", {
					className: "grid w-7 place-items-center text-faint",
					title: p("Light"),
					children: /* @__PURE__ */ z(y, {
						name: "sun",
						size: 13
					})
				}),
				/* @__PURE__ */ z("span", {
					className: "grid w-7 place-items-center text-faint",
					title: p("Dark"),
					children: /* @__PURE__ */ z(y, {
						name: "moon",
						size: 13
					})
				}),
				e.readOnly && /* @__PURE__ */ z(G, {})
			] }),
			onAdd: e.readOnly ? void 0 : () => void s(),
			addLabel: t.add,
			children: a.map((t) => {
				let { light: r, dark: i } = M(t.value);
				return /* @__PURE__ */ B(J, {
					name: t.key,
					changed: V(e, t.name),
					wide: !0,
					menu: n(t),
					children: [/* @__PURE__ */ z(Tt, {
						label: p("{name} in Light Mode", { name: t.key }),
						value: r,
						disabled: e.readOnly,
						onChange: (e) => e && c(t, e, i)
					}), /* @__PURE__ */ z(Tt, {
						label: p("{name} in Dark Mode", { name: t.key }),
						value: i ?? null,
						same: r,
						disabled: e.readOnly,
						onChange: (e) => c(t, r, e ?? void 0)
					})]
				}, t.name);
			})
		}),
		/* @__PURE__ */ z(Ot, { edit: e }),
		o.size > 0 && /* @__PURE__ */ z(K, {
			plain: !0,
			title: p("Palette"),
			children: /* @__PURE__ */ z(be, {
				head: !0,
				className: "pb-3",
				families: [...o].map(([e, t]) => ({
					name: e,
					shades: t
				})),
				cell: (t) => /* @__PURE__ */ z(Et, {
					edit: e,
					row: t
				}, t.name)
			})
		})
	] });
}
function At(e) {
	let t = e.flatMap((e) => String(e.weight ?? "400").split(/\s+/).map(Number)).filter((e) => e > 0), n = Math.min(...t), r = Math.max(...t), i = t.length === 0 ? "400" : n === r ? String(n) : `${n}–${r}`;
	return e.some((e) => e.style === "italic") ? `${i} · ${p("Italic")}` : i;
}
var jt = (e, t) => /* @__PURE__ */ z("p", {
	className: "m-0 truncate pb-2.5 text-ink",
	style: {
		fontSize: `min(${e}, 2.75rem)`,
		lineHeight: 1.1,
		fontFamily: t
	},
	children: p("Ship It")
});
function Mt({ edit: e, fonts: t }) {
	let n = [...new Set(t.faces.map((e) => e.family))], o = new Set(gt(e, "--font-", (e) => e.startsWith("weight-")).map((e) => r(a(e.value)))), c = n.map((e) => {
		let n = t.faces.filter((t) => t.family === e);
		return {
			family: e,
			styles: At(n),
			fallback: n.some((e) => Array.isArray(e.fallback) ? e.fallback.length > 0 : !!e.fallback),
			used: o.has(e)
		};
	}), l = i("", "sans", !1), u = e.sheet.variable("--font-sans") ?? e.defaults.get("--font-sans"), ee = () => [
		["sans", p("Sans")],
		["serif", p("Serif")],
		["mono", p("Mono")]
	];
	return /* @__PURE__ */ B(R, { children: [
		/* @__PURE__ */ z(Q, {
			edit: e,
			kind: {
				prefix: "--font-",
				title: p("Fonts"),
				add: p("Add Font Family"),
				fresh: p("New Font Family"),
				start: l,
				placeholder: "display",
				skip: (e) => e.startsWith("weight-")
			},
			row: (n, o, l) => {
				let u = a(n.value), d = r(u), f = t.faces.filter((e) => e.family === d), m = f.some((e) => e.preload);
				return /* @__PURE__ */ z(J, {
					name: n.key,
					changed: V(e, n.name),
					sample: /* @__PURE__ */ z("span", {
						className: "block max-w-7 overflow-hidden whitespace-nowrap text-center text-lg leading-none text-ink",
						style: { fontFamily: n.value },
						children: "Aa"
					}),
					menu: l([
						{
							heading: !0,
							label: p("Fallback")
						},
						...ee().map(([e, t]) => ({
							label: t,
							checked: s(u) === e,
							onSelect: () => o(i(d, e, u.includes(`${d} Fallback`)))
						})),
						...f.length ? [{
							separator: !0,
							label: ""
						}, {
							label: p("Preload"),
							checked: m,
							onSelect: () => t.preload(d, !m)
						}] : []
					]),
					children: /* @__PURE__ */ z(q, {
						handle: n.name,
						label: n.key,
						value: n.value,
						disabled: e.readOnly,
						field: {
							component: "site-font-stack",
							fonts: c,
							...e.readOnly ? {} : {
								onAdd: t.add,
								onRemove: t.remove
							}
						},
						onChange: o
					})
				}, n.name);
			}
		}),
		/* @__PURE__ */ z(Q, {
			edit: e,
			kind: {
				prefix: "--text-",
				title: p("Text Sizes"),
				add: p("Add Text Size"),
				fresh: p("New Text Size"),
				start: "1.25rem",
				placeholder: "lead",
				skip: (e) => e.startsWith("shadow-")
			},
			row: (t, n, r) => /* @__PURE__ */ z(J, {
				name: t.key,
				changed: V(e, t.name),
				menu: r(),
				below: jt(t.value, u),
				children: /* @__PURE__ */ z(q, {
					handle: t.name,
					label: t.key,
					value: t.value,
					disabled: e.readOnly,
					field: St,
					onChange: n
				})
			}, t.name)
		}),
		/* @__PURE__ */ z(Q, {
			edit: e,
			kind: {
				prefix: "--leading-",
				title: p("Line Heights"),
				add: p("Add Line Height"),
				fresh: p("New Line Height"),
				start: "1.5",
				placeholder: "airy"
			},
			row: (t, n, r) => /* @__PURE__ */ z(J, {
				name: t.key,
				changed: V(e, t.name),
				menu: r(),
				sample: /* @__PURE__ */ z("span", {
					className: "flex w-4 flex-col",
					style: { gap: `${Math.max(1, (Number(t.value) - .8) * 6)}px` },
					children: [
						0,
						1,
						2
					].map((e) => /* @__PURE__ */ z("span", { className: E("h-0.5 rounded-full bg-muted", e === 2 && "w-2/3") }, e))
				}),
				children: /* @__PURE__ */ z(q, {
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
		/* @__PURE__ */ z(Q, {
			edit: e,
			kind: {
				prefix: "--tracking-",
				title: p("Letter Spacing"),
				add: p("Add Letter Spacing"),
				fresh: p("New Letter Spacing"),
				start: "0em",
				placeholder: "loose"
			},
			row: (t, n, r) => /* @__PURE__ */ z(J, {
				name: t.key,
				changed: V(e, t.name),
				menu: r(),
				sample: /* @__PURE__ */ z("span", {
					className: "text-xs font-medium text-ink",
					style: { letterSpacing: t.value },
					children: "Aa"
				}),
				children: /* @__PURE__ */ z(q, {
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
var Nt = (e, t = St) => (n, r, i) => /* @__PURE__ */ z(J, {
	name: n.key,
	changed: V(e, n.name),
	menu: i(),
	children: /* @__PURE__ */ z(q, {
		handle: n.name,
		label: n.key,
		value: n.value,
		disabled: e.readOnly,
		field: t,
		onChange: r
	})
}, n.name);
function Pt({ edit: e }) {
	let t = [
		["sm", p("Small")],
		["md", p("Medium")],
		["lg", p("Large")]
	], n = [
		["height", p("Height")],
		["padding", p("Padding")],
		["text", p("Text")]
	], r = (t) => e.sheet.variable(t) ?? e.defaults.get(t) ?? null, i = "w-24 shrink-0 max-sm:min-w-0 max-sm:flex-1";
	return /* @__PURE__ */ B(K, {
		title: p("Buttons and Fields"),
		children: [/* @__PURE__ */ B("div", {
			className: "flex min-h-8 items-center gap-2 px-3 text-2xs text-faint",
			children: [
				/* @__PURE__ */ z("span", { className: "min-w-0 flex-1" }),
				n.map(([e, t]) => /* @__PURE__ */ z("span", {
					className: i,
					children: t
				}, e)),
				/* @__PURE__ */ z("span", { className: "size-6 shrink-0" })
			]
		}), t.map(([t, a]) => {
			let o = n.map(([e]) => `--control-${t}-${e}`), s = V(e, ...o);
			return /* @__PURE__ */ B("div", {
				className: E(W, "flex min-h-10 items-center gap-2 py-1.5"),
				children: [
					/* @__PURE__ */ B("span", {
						className: "flex min-w-0 flex-1 items-center gap-1.5 text-sm text-text",
						children: [/* @__PURE__ */ z("span", {
							className: "truncate",
							children: a
						}), /* @__PURE__ */ z(Re, { on: s })]
					}),
					n.map(([t, n], s) => /* @__PURE__ */ z("div", {
						className: i,
						children: /* @__PURE__ */ z(q, {
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
					s && !e.readOnly ? /* @__PURE__ */ z(T, {
						content: p("Revert"),
						children: /* @__PURE__ */ z(b, {
							icon: "undo",
							size: "xs",
							label: p("Revert"),
							title: void 0,
							className: "shrink-0",
							onClick: () => H(e, ...o)
						})
					}) : /* @__PURE__ */ z(G, {})
				]
			}, t);
		})]
	});
}
function Ft(e) {
	let t = /^(-?[\d.]+)(rem|px)$/.exec(e.trim());
	return t ? Number(t[1]) * (t[2] === "rem" ? 16 : 1) : null;
}
function It({ step: e }) {
	let t = Ft(e);
	return t === null ? null : /* @__PURE__ */ z("div", {
		className: "flex items-end gap-1.5 pb-3 pt-1",
		"aria-hidden": !0,
		children: A.filter((e) => e > 0).map((e) => {
			let n = +(t * e).toFixed(2);
			return /* @__PURE__ */ B("span", {
				className: "flex min-w-0 flex-1 flex-col items-center gap-1",
				title: `${e} · ${n}px`,
				children: [/* @__PURE__ */ z("span", {
					className: "w-full rounded-xs bg-active",
					style: { height: Math.max(2, Math.min(n, 128) / 2) }
				}), /* @__PURE__ */ z("span", {
					className: "text-2xs tabular-nums text-faint",
					children: n
				})]
			}, e);
		})
	});
}
function Lt({ edit: e }) {
	let t = {
		prefix: "--spacing-",
		title: p("Spacing"),
		add: p("Add Spacing"),
		fresh: p("New Spacing"),
		start: "2rem",
		placeholder: "gutter"
	}, n = xt(e, t), r = e.sheet.variable("--spacing"), i = async () => {
		let n = await vt(e, t.prefix, t.fresh, t.add, "", t.placeholder);
		n && e.change((e) => e.setVariable(`${t.prefix}${n}`, t.start));
	}, a = {
		name: "--spacing",
		key: "1",
		value: r ?? e.defaults.get("--spacing") ?? "0.25rem",
		builtIn: !0,
		written: r !== void 0
	};
	return /* @__PURE__ */ B(R, { children: [
		/* @__PURE__ */ B(K, {
			title: t.title,
			onAdd: e.readOnly ? void 0 : () => void i(),
			addLabel: t.add,
			children: [/* @__PURE__ */ z(J, {
				name: a.key,
				copy: a.name,
				changed: V(e, a.name),
				menu: n(a),
				below: /* @__PURE__ */ z(It, { step: a.value }),
				children: /* @__PURE__ */ z(q, {
					handle: "--spacing",
					label: a.key,
					value: a.value,
					disabled: e.readOnly,
					field: St,
					onChange: (t) => t !== null && e.change((e) => e.setVariable("--spacing", t))
				})
			}), gt(e, t.prefix).map((t) => Nt(e)(t, (n) => n !== null && e.change((e) => e.setVariable(t.name, n)), (e) => n(t, e)))]
		}),
		/* @__PURE__ */ z(Q, {
			edit: e,
			kind: {
				prefix: "--container-",
				title: p("Containers"),
				add: p("Add Container"),
				fresh: p("New Container"),
				start: "72rem",
				placeholder: "content"
			},
			row: Nt(e)
		}),
		/* @__PURE__ */ z(Q, {
			edit: e,
			kind: {
				prefix: "--breakpoint-",
				title: p("Breakpoints"),
				add: p("Add Breakpoint"),
				fresh: p("New Breakpoint"),
				start: "120rem",
				placeholder: "3xl"
			},
			row: Nt(e, Ct)
		}),
		/* @__PURE__ */ z(Pt, { edit: e })
	] });
}
function Rt({ edit: e }) {
	let t = (t) => (r, i, a) => /* @__PURE__ */ z(J, {
		name: r.key,
		changed: V(e, r.name),
		menu: a(),
		sample: /* @__PURE__ */ z(n, {
			value: r.value,
			kind: t
		}),
		children: /* @__PURE__ */ z(q, {
			handle: r.name,
			label: r.key,
			value: r.value,
			disabled: e.readOnly,
			field: {
				component: "site-shadow",
				kind: t
			},
			onChange: i
		})
	}, r.name);
	return /* @__PURE__ */ B(R, { children: [
		/* @__PURE__ */ z(Q, {
			edit: e,
			kind: {
				prefix: "--radius-",
				title: p("Corners"),
				add: p("Add Radius"),
				fresh: p("New Radius"),
				start: "0.5rem",
				placeholder: "card"
			},
			row: (t, n, r) => /* @__PURE__ */ z(J, {
				name: t.key,
				changed: V(e, t.name),
				menu: r(),
				sample: /* @__PURE__ */ z("span", {
					className: "size-5 translate-x-0.5 translate-y-0.5 border-l-[1.5px] border-t-[1.5px] border-muted",
					style: { borderTopLeftRadius: `min(${t.value}, 20px)` }
				}),
				children: /* @__PURE__ */ z(q, {
					handle: t.name,
					label: t.key,
					value: t.value,
					disabled: e.readOnly,
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
			}, t.name)
		}),
		/* @__PURE__ */ z(Q, {
			edit: e,
			kind: {
				prefix: "--shadow-",
				title: p("Shadows"),
				add: p("Add Shadow"),
				fresh: p("New Shadow"),
				start: "0 4px 16px -4px rgb(0 0 0 / 0.12)",
				placeholder: "card"
			},
			row: t("box")
		}),
		/* @__PURE__ */ z(Q, {
			edit: e,
			kind: {
				prefix: "--inset-shadow-",
				title: p("Inset Shadows"),
				add: p("Add Inset Shadow"),
				fresh: p("New Inset Shadow"),
				start: "inset 0 2px 4px rgb(0 0 0 / 0.08)",
				placeholder: "well"
			},
			row: t("box")
		}),
		/* @__PURE__ */ z(Q, {
			edit: e,
			kind: {
				prefix: "--drop-shadow-",
				title: p("Drop Shadows"),
				add: p("Add Drop Shadow"),
				fresh: p("New Drop Shadow"),
				start: "0 4px 8px rgb(0 0 0 / 0.12)",
				placeholder: "lifted"
			},
			row: t("drop")
		}),
		/* @__PURE__ */ z(Q, {
			edit: e,
			kind: {
				prefix: "--text-shadow-",
				title: p("Text Shadows"),
				add: p("Add Text Shadow"),
				fresh: p("New Text Shadow"),
				start: "0 1px 2px rgb(0 0 0 / 0.2)",
				placeholder: "glow"
			},
			row: t("text")
		}),
		/* @__PURE__ */ z(Q, {
			edit: e,
			kind: {
				prefix: "--blur-",
				title: p("Blur"),
				add: p("Add Blur"),
				fresh: p("New Blur"),
				start: "6px",
				placeholder: "soft"
			},
			row: (t, n, r) => /* @__PURE__ */ z(J, {
				name: t.key,
				changed: V(e, t.name),
				menu: r(),
				sample: /* @__PURE__ */ z("span", {
					className: "size-3 rounded-full bg-muted",
					style: { filter: `blur(min(${t.value}, 6px))` }
				}),
				children: /* @__PURE__ */ z(q, {
					handle: t.name,
					label: t.key,
					value: t.value,
					disabled: e.readOnly,
					field: $("px", {
						units: ["px", "rem"],
						step: 1,
						min: 0
					}),
					onChange: n
				})
			}, t.name)
		}),
		/* @__PURE__ */ z(Q, {
			edit: e,
			kind: {
				prefix: "--perspective-",
				title: p("Perspective"),
				add: p("Add Perspective"),
				fresh: p("New Perspective"),
				start: "800px",
				placeholder: "deep"
			},
			row: Nt(e, $("px", {
				units: ["px", "rem"],
				step: 10,
				min: 0
			}))
		})
	] });
}
function zt(e, t) {
	let n = String(e ?? "").trim().match(/^(\d*\.?\d+)\s*(ms|s)?$/);
	if (!n) return t;
	let r = n[2] === "s" ? Number(n[1]) : Number(n[1]) / 1e3;
	return Math.min(2, Math.max(.05, Math.round(r * 1e3) / 1e3));
}
function Bt({ edit: e, transition: t, saved: n, onTransition: r }) {
	let i = (t, n) => e.change((e) => e.setVariable(t, n)), a = (t) => e.sheet.variable(t) ?? e.defaults.get(t) ?? null, s = (t) => V(e, t) && !e.readOnly ? /* @__PURE__ */ z(T, {
		content: p("Revert"),
		children: /* @__PURE__ */ z(b, {
			icon: "undo",
			size: "xs",
			label: p("Revert"),
			title: void 0,
			onClick: () => H(e, t)
		})
	}) : void 0;
	return /* @__PURE__ */ B(R, { children: [
		/* @__PURE__ */ z(Q, {
			edit: e,
			kind: {
				prefix: "--ease-",
				title: p("Easings"),
				add: p("Add Easing"),
				fresh: p("New Easing"),
				start: "cubic-bezier(0.2, 0.8, 0.2, 1)",
				placeholder: "snap"
			},
			row: (t, n, r) => /* @__PURE__ */ z(J, {
				name: t.key,
				changed: V(e, t.name),
				menu: r(),
				children: /* @__PURE__ */ z(q, {
					handle: t.name,
					label: t.key,
					value: t.value,
					disabled: e.readOnly,
					field: { component: "ease" },
					onChange: n
				})
			}, t.name)
		}),
		/* @__PURE__ */ z(Q, {
			edit: e,
			kind: {
				prefix: "--duration-",
				title: p("Durations"),
				add: p("Add Duration"),
				fresh: p("New Duration"),
				start: "300ms",
				placeholder: "slow"
			},
			row: (t, n, r) => /* @__PURE__ */ z(J, {
				name: t.key,
				changed: V(e, t.name),
				menu: r(),
				children: /* @__PURE__ */ z(q, {
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
		/* @__PURE__ */ z(Q, {
			edit: e,
			kind: {
				prefix: "--animate-",
				title: p("Animations"),
				add: p("Add Animation"),
				fresh: p("New Animation"),
				start: "spin 2s linear infinite",
				placeholder: "float"
			},
			row: (t, n, r) => /* @__PURE__ */ z(J, {
				name: t.key,
				changed: V(e, t.name),
				menu: r(),
				sample: /* @__PURE__ */ z(o, {
					value: t.value,
					keyframes: e.keyframes
				}),
				children: /* @__PURE__ */ z(q, {
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
		/* @__PURE__ */ B(K, {
			title: p("Transitions"),
			children: [/* @__PURE__ */ z(ze, {
				label: p("Duration"),
				changed: V(e, "--default-transition-duration"),
				action: s("--default-transition-duration"),
				children: /* @__PURE__ */ z(q, {
					handle: "--default-transition-duration",
					label: p("Duration"),
					value: a("--default-transition-duration"),
					disabled: e.readOnly,
					field: $("ms", {
						units: ["ms", "s"],
						step: 10,
						min: 0
					}),
					onChange: (e) => e && i("--default-transition-duration", e)
				})
			}), /* @__PURE__ */ z(ze, {
				label: p("Easing"),
				changed: V(e, "--default-transition-timing-function"),
				action: s("--default-transition-timing-function"),
				children: /* @__PURE__ */ z(q, {
					handle: "--default-transition-timing-function",
					label: p("Easing"),
					value: a("--default-transition-timing-function"),
					disabled: e.readOnly,
					field: { component: "ease" },
					onChange: (e) => e && i("--default-transition-timing-function", e)
				})
			})]
		}),
		/* @__PURE__ */ B(K, {
			title: p("Page Transition"),
			children: [
				/* @__PURE__ */ z(ze, {
					label: p("Effect"),
					changed: t.type !== n.type,
					children: /* @__PURE__ */ z(q, {
						handle: "type",
						label: p("Effect"),
						value: t.type,
						disabled: e.readOnly,
						field: {
							type: "select",
							mono: !1,
							required: !0,
							options: {
								none: p("None"),
								fade: p("Fade"),
								slide: p("Slide"),
								scale: p("Scale")
							}
						},
						onChange: (e) => r({
							...t,
							type: e ?? "none"
						})
					})
				}),
				t.type !== "none" && /* @__PURE__ */ z(ze, {
					label: p("Duration"),
					changed: t.duration !== n.duration,
					children: /* @__PURE__ */ z(q, {
						handle: "duration",
						label: p("Duration"),
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
							duration: zt(e, t.duration)
						})
					})
				}),
				/* @__PURE__ */ z(ze, {
					label: p("Page Loads"),
					changed: t.navigation !== n.navigation,
					children: /* @__PURE__ */ z(q, {
						handle: "navigation",
						label: p("Page Loads"),
						value: t.navigation,
						disabled: e.readOnly,
						field: {
							type: "select",
							mono: !1,
							required: !0,
							options: {
								document: p("Full Page"),
								client: p("Instant")
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
// admin/src/Styling.tsx
var Vt = {}, Ht = [
	"colors",
	"typography",
	"layout",
	"effects",
	"motion",
	"styles"
];
function Ut() {
	return [
		{
			value: "colors",
			label: p("Colors"),
			icon: "palette"
		},
		{
			value: "typography",
			label: p("Typography"),
			icon: "typography"
		},
		{
			value: "layout",
			label: p("Layout"),
			icon: "ruler"
		},
		{
			value: "effects",
			label: p("Effects"),
			icon: "shadow"
		},
		{
			value: "motion",
			label: p("Motion"),
			icon: "speed"
		},
		{
			value: "styles",
			label: p("Styles"),
			icon: "symbol"
		}
	];
}
var Wt = (e, t) => JSON.stringify(e ?? null) === JSON.stringify(t ?? null), Gt = { styles: 0 }, Kt = (e, t) => e.css === t.css && Wt(e.transition, t.transition);
function qt() {
	let t = te("styling/get", {}, {
		refetchOnWindowFocus: !1,
		retry: !1
	}), n = te("styling/source", {}, {
		refetchOnWindowFocus: !1,
		retry: !1,
		staleTime: 6e4
	}), [r, i] = _(Vt), { query: a } = ne(), o = a.style ? "styles" : Ht.includes(a.tab) ? a.tab : null, s = (e) => f({
		tab: e,
		style: null
	}), [m, ae] = _(ge() === "dark" ? "dark" : "light"), [y, oe] = _(!1), [se, x] = _(() => window.matchMedia("(max-width: 767px)").matches);
	re(() => {
		let e = window.matchMedia("(max-width: 767px)"), t = () => x(e.matches);
		return e.addEventListener("change", t), () => e.removeEventListener("change", t);
	}, []);
	let S = y && se, [pe, O] = _("desktop"), [_e, ve] = _(!1), [ye, be] = _(null), xe = g(null), k = t.data, A = r.css ?? k?.css, Se = r.transition ?? k?.transition, Ce = !!k && (r.css !== void 0 && r.css !== k.css || r.transition !== void 0 && !Wt(r.transition, k.transition)), j = !u("settings.manage"), we = h(() => new Te(A ?? ""), [A]), De = h(() => new Te(k?.css ?? ""), [k?.css]), M = e(n.data, A), N = h(() => we.variables().some((e) => e.value.startsWith("light-dark(")) || /color-scheme\s*:\s*light\s+dark\b/.test(we.css), [we]), [P, ke] = _(null);
	re(() => {
		Oe().then(ke);
	}, []);
	let Ae = g(null), F = `${o}:${a.style ?? ""}`, I = g(F);
	I.current !== F && (Ae.current && I.current === "styles:" && (Gt.styles = Ae.current.scrollTop), I.current = F);
	let Me = !!t.data && !!n.data && P !== null;
	ie(() => {
		Me && Ae.current && (Ae.current.scrollTop = F === "styles:" ? Gt.styles : 0);
	}, [F, Me]);
	let L = Fe(h(() => A !== void 0 && Se ? {
		css: A,
		transition: Se
	} : void 0, [A, Se]), (e) => i({
		css: e.css,
		transition: e.transition
	}), Kt);
	he("mod+z", L.undo, L.canUndo && !j, p("Undo")), he("mod+shift+z", L.redo, L.canRedo && !j, p("Redo"));
	let Ne = n.data?.files.cms, Pe = h(() => {
		let e = /* @__PURE__ */ new Map();
		for (let t of [...je(P ?? ""), ...je(Ne ?? "")]) e.set(t.name, t.value);
		return e;
	}, [P, Ne]), Ie = h(() => new Set(je(P ?? "").filter((e) => e.name.startsWith("--color-")).map((e) => e.name)), [P]), V = h(() => c(P ?? "", A ?? ""), [P, A]);
	if (re(() => {
		let e = document.createElement("style");
		return e.textContent = (k?.fonts ?? []).map((e) => `@font-face{font-family:"${e.family}";src:url("${/^(https:\/\/|\/)/.test(e.src) ? e.src : `/_cms/fonts/${e.src.split("/").pop()}`}") format("woff2");font-weight:${e.weight ?? "400"};font-style:${e.style ?? "normal"};font-display:swap}`).join("\n"), document.head.appendChild(e), () => e.remove();
	}, [k?.fonts]), t.isLoading || n.isLoading || P === null) return /* @__PURE__ */ z("div", {
		className: "grid h-full place-items-center text-faint",
		children: /* @__PURE__ */ z(ue, {})
	});
	if (!k || !n.data || A === void 0 || !Se) return /* @__PURE__ */ B("div", {
		className: "flex h-full flex-col",
		children: [/* @__PURE__ */ z(de, { crumbs: [{
			label: p("Styling"),
			icon: "palette"
		}] }), /* @__PURE__ */ z(le, {
			title: p("Couldn’t load the styling"),
			onRetry: () => {
				t.refetch(), n.refetch();
			},
			retrying: t.isRefetching || n.isRefetching
		})]
	});
	let H = {
		sheet: we,
		saved: De,
		change: (e) => !j && i((t) => ({
			...t,
			css: e(new Te(t.css ?? k.css)).css
		})),
		readOnly: j,
		defaults: Pe,
		palette: Ie,
		keyframes: V,
		mode: N ? m : "light"
	}, Le = {
		compiler: M.compiler,
		device: S ? "phone" : pe
	}, U = o === "styles" && a.style ? ht(we, a.style) : null, W = () => {
		ee("styling/"), xe.current?.contentWindow?.location.reload();
	}, G = async () => {
		if (Ce && !_e) {
			ve(!0), be(null);
			try {
				let e = {};
				r.css !== void 0 && r.css !== k.css && (e.css = r.css), r.transition !== void 0 && !Wt(r.transition, k.transition) && (e.transition = r.transition), Object.keys(e).length > 0 && await d("styling/update", e), await Promise.all([t.refetch(), n.refetch()]), i(Vt), xe.current?.contentWindow?.location.reload();
			} catch (e) {
				be({
					message: e instanceof Error ? e.message : String(e),
					refused: e instanceof l && e.type === "invalid_input"
				});
			} finally {
				ve(!1);
			}
		}
	}, Re = {
		faces: k.fonts,
		add: async (e) => {
			try {
				if (e === "google") {
					let e = await me({
						title: p("Add a Google Font"),
						fields: [{
							handle: "family",
							type: "text",
							label: p("Name"),
							placeholder: "Inter Tight",
							autofocus: !0,
							required: !0
						}],
						confirm: p("Add Font")
					}), t = String(e?.family ?? "").trim();
					if (!t) return null;
					let n = await d("styling/fonts-import", { family: t });
					return D.success(p("{family} added", { family: t })), W(), {
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
				}), r = t.name.replace(/\.woff2$/i, ""), i = await me({
					title: p("Upload Font"),
					fields: [{
						handle: "family",
						type: "text",
						label: p("Family Name"),
						autofocus: !0,
						required: !0
					}],
					values: { family: r.replace(/[-_](regular|bold|variable|italic|\d+).*$/i, "").replace(/[-_]/g, " ") },
					confirm: p("Upload Font")
				}), a = String(i?.family ?? "").trim();
				return a ? (await d("styling/fonts-upload", {
					family: a,
					name: r,
					data: n,
					weight: /variable/i.test(r) ? "100 900" : "400",
					style: /italic/i.test(r) ? "italic" : "normal"
				}), D.success(p("{family} uploaded", { family: a })), W(), {
					family: a,
					fallback: !1
				}) : null;
			} catch (e) {
				return D.error(e), null;
			}
		},
		remove: async (e) => {
			if (await fe({
				title: p("Remove {family}?", { family: e }),
				confirm: p("Remove Font"),
				danger: !0
			})) try {
				await d("styling/update", { fonts: k.fonts.filter((t) => t.family !== e) }), W();
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
				} : r) }), W();
			} catch (e) {
				D.error(e);
			}
		}
	}, K = /* @__PURE__ */ B(R, { children: [
		o === "colors" && /* @__PURE__ */ z(kt, { edit: H }),
		o === "typography" && /* @__PURE__ */ z(Mt, {
			edit: H,
			fonts: Re
		}),
		o === "layout" && /* @__PURE__ */ z(Lt, { edit: H }),
		o === "effects" && /* @__PURE__ */ z(Rt, { edit: H }),
		o === "motion" && /* @__PURE__ */ z(Bt, {
			edit: H,
			transition: Se,
			saved: k.transition,
			onTransition: (e) => !j && i((t) => ({
				...t,
				transition: e
			}))
		}),
		o === "styles" && /* @__PURE__ */ z(mt, {
			edit: H,
			samples: Le
		})
	] }), q = Ut().find((e) => e.value === o);
	return /* @__PURE__ */ B("div", {
		className: "flex h-full flex-col",
		children: [
			/* @__PURE__ */ z(de, {
				divided: !0,
				crumbs: [
					{
						label: p("Styling"),
						icon: "theme",
						to: o ? "/styling" : void 0
					},
					...q ? [{
						label: q.label,
						to: U ? `/styling?tab=${q.value}` : void 0
					}] : [],
					...U ? [{ label: U }] : []
				],
				actions: /* @__PURE__ */ B(R, { children: [
					/* @__PURE__ */ z(v, {
						variant: "ghost",
						icon: "eye",
						"aria-pressed": S,
						onClick: () => oe(!S),
						className: "md:hidden",
						children: p("Preview")
					}),
					!j && /* @__PURE__ */ B(R, { children: [
						/* @__PURE__ */ z(T, {
							content: p("Undo"),
							shortcut: "mod+z",
							children: /* @__PURE__ */ z(b, {
								icon: "undo",
								label: p("Undo"),
								title: void 0,
								disabled: !L.canUndo,
								onClick: L.undo
							})
						}),
						/* @__PURE__ */ z(T, {
							content: p("Redo"),
							shortcut: "mod+shift+z",
							children: /* @__PURE__ */ z(b, {
								icon: "redo",
								label: p("Redo"),
								title: void 0,
								disabled: !L.canRedo,
								onClick: L.redo
							})
						}),
						/* @__PURE__ */ z("span", {
							className: "max-sm:hidden",
							children: /* @__PURE__ */ z(Yt, { onOpen: (e) => i({
								css: e.css,
								transition: e.transition
							}) })
						})
					] }),
					/* @__PURE__ */ z("span", {
						className: "max-md:hidden",
						children: /* @__PURE__ */ z(w, {
							size: "xs",
							"aria-label": p("Screen"),
							value: pe,
							onChange: O,
							options: [
								{
									value: "desktop",
									icon: "desktop",
									title: p("Desktop")
								},
								{
									value: "tablet",
									icon: "tablet",
									title: p("Tablet")
								},
								{
									value: "phone",
									icon: "phone",
									title: p("Phone")
								}
							]
						})
					}),
					N && /* @__PURE__ */ z(w, {
						size: "xs",
						className: "max-sm:hidden",
						"aria-label": p("Color Mode"),
						value: m,
						onChange: ae,
						options: [{
							value: "light",
							icon: "sun",
							title: p("Light")
						}, {
							value: "dark",
							icon: "moon",
							title: p("Dark")
						}]
					}),
					/* @__PURE__ */ z(T, {
						content: p("Open Site"),
						children: /* @__PURE__ */ z(b, {
							icon: "external",
							label: p("Open Site"),
							title: void 0,
							onClick: () => window.open("/", "_blank", "noopener"),
							className: "max-md:hidden"
						})
					})
				] })
			}),
			/* @__PURE__ */ z(C, {
				dirty: Ce,
				saving: _e,
				error: ye ? ye.refused ? p("The stylesheet was not saved") : ye.message : null,
				onSave: () => void G(),
				onDiscard: () => {
					i(Vt), be(null);
				}
			}),
			/* @__PURE__ */ z(Ee, {
				source: M.source ?? n.data,
				children: /* @__PURE__ */ B("div", {
					className: "grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(320px,380px)_minmax(0,1fr)] xl:grid-cols-[minmax(360px,420px)_minmax(0,1fr)]",
					children: [/* @__PURE__ */ B("div", {
						className: E("flex min-h-0 flex-col border-border md:border-r", S && "max-md:hidden"),
						children: [q && !U && /* @__PURE__ */ B("div", {
							className: "flex h-12 shrink-0 items-center gap-1 px-2",
							children: [/* @__PURE__ */ z(T, {
								content: p("Back to {label}", { label: p("Styling") }),
								children: /* @__PURE__ */ z(b, {
									icon: "chevron-left",
									label: p("Back to {label}", { label: p("Styling") }),
									title: void 0,
									onClick: () => f({
										tab: null,
										style: null
									})
								})
							}), /* @__PURE__ */ z("h2", {
								className: "m-0 truncate text-sm font-semibold text-ink",
								children: q.label
							})]
						}), /* @__PURE__ */ B("div", {
							ref: Ae,
							onScroll: (e) => {
								F === "styles:" && (Gt.styles = e.currentTarget.scrollTop);
							},
							className: E("min-h-0 flex-1 overflow-y-auto px-4 pb-16", !q && "pt-4"),
							children: [ye?.refused && /* @__PURE__ */ z(ce, {
								tone: "danger",
								className: "mb-3 mt-1",
								title: p("Tailwind refused the stylesheet"),
								onDismiss: () => be(null),
								children: ye.message
							}), q ? K : /* @__PURE__ */ z(Jt, {
								edit: H,
								onOpen: s
							})]
						})]
					}), /* @__PURE__ */ z("div", {
						className: E("flex min-w-0 flex-col bg-sunken", !S && "max-md:hidden"),
						children: /* @__PURE__ */ z(Xt, {
							frame: xe,
							compile: M,
							published: k.stylesheet,
							viewport: S ? "phone" : pe,
							mode: N ? m : null
						})
					})]
				})
			})
		]
	});
}
function Jt({ edit: e, onOpen: t }) {
	let { engine: n } = L(), r = (t) => e.sheet.variable(t) ?? e.defaults.get(t), i = (t) => {
		let i = r(t);
		if (!i) return;
		let a = M(n ? n.resolve(i) : i);
		return e.mode === "dark" ? a.dark ?? a.light : a.light;
	}, a = r("--font-display") ?? r("--font-serif") ?? r("--font-sans"), o = [
		"--color-primary",
		"--color-accent",
		"--color-foreground"
	].map(i).filter((e) => !!e).slice(0, 2);
	return /* @__PURE__ */ B(R, { children: [/* @__PURE__ */ B("div", {
		"aria-hidden": !0,
		className: "relative mb-6 flex aspect-[16/10] items-center justify-center gap-6 overflow-hidden rounded-lg",
		style: { background: i("--color-background") ?? "white" },
		children: [
			/* @__PURE__ */ z("span", {
				className: "leading-none",
				style: {
					fontFamily: a,
					fontSize: 88,
					color: i("--color-foreground")
				},
				children: "Aa"
			}),
			o.length > 0 && /* @__PURE__ */ z("span", {
				className: "flex flex-col gap-3",
				children: o.map((e, t) => /* @__PURE__ */ z("span", {
					className: "relative size-10 rounded-full",
					style: { background: e },
					children: /* @__PURE__ */ z("span", { className: "cms-swatch-edge" })
				}, t))
			}),
			/* @__PURE__ */ z("span", { className: "cms-swatch-edge" })
		]
	}), /* @__PURE__ */ z("nav", {
		"aria-label": p("Styling"),
		className: "divide-y divide-border overflow-hidden rounded-lg border border-border",
		children: Ut().map((e) => /* @__PURE__ */ B(S, {
			inset: !0,
			onClick: () => t(e.value),
			className: "flex h-12 w-full items-center gap-3 px-3 text-left text-sm text-text transition-colors duration-base hover:bg-hover",
			children: [
				/* @__PURE__ */ z(y, {
					name: e.icon,
					size: 18,
					className: "shrink-0 text-muted"
				}),
				/* @__PURE__ */ z("span", {
					className: "min-w-0 flex-1 truncate",
					children: e.label
				}),
				/* @__PURE__ */ z(y, {
					name: "chevron-right",
					size: 14,
					className: "shrink-0 text-faint"
				})
			]
		}, e.value))
	})] });
}
function Yt({ onOpen: e }) {
	let [t, n] = _(!1), r = te("styling-versions/list", {}, { enabled: t }), i = async (t) => {
		try {
			e(await d("styling-versions/get", { id: t })), n(!1);
		} catch (e) {
			D.error(e);
		}
	};
	return /* @__PURE__ */ B(x, {
		open: t,
		onOpenChange: n,
		align: "end",
		className: "w-72 !p-1",
		trigger: /* @__PURE__ */ z("span", { children: /* @__PURE__ */ z(T, {
			content: p("Versions"),
			children: /* @__PURE__ */ z(b, {
				icon: "history",
				label: p("Versions"),
				title: void 0,
				active: t
			})
		}) }),
		children: [/* @__PURE__ */ z("div", {
			className: "cms-label px-2 pb-1 pt-1.5",
			children: p("Versions")
		}), r.isPending ? /* @__PURE__ */ z("div", {
			className: "grid h-16 place-items-center text-faint",
			children: /* @__PURE__ */ z(ue, { size: 14 })
		}) : r.isError ? /* @__PURE__ */ z(le, {
			compact: !0,
			onRetry: () => void r.refetch(),
			retrying: r.isRefetching
		}) : r.data.length === 0 ? /* @__PURE__ */ z("p", {
			className: "m-0 px-2 py-2 text-sm text-muted",
			children: p("No versions yet")
		}) : /* @__PURE__ */ z("div", {
			className: "max-h-80 space-y-px overflow-y-auto",
			children: r.data.map((e) => /* @__PURE__ */ B(S, {
				compact: !0,
				disabled: e.current,
				onClick: () => void i(e.id),
				className: "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm enabled:hover:bg-hover",
				children: [/* @__PURE__ */ B("span", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ z("span", {
						className: "block truncate text-text",
						children: m(e.at)
					}), e.user && /* @__PURE__ */ z("span", {
						className: "block truncate text-xs text-muted",
						children: e.user
					})]
				}), e.current && /* @__PURE__ */ z("span", {
					className: "shrink-0 text-xs text-muted",
					children: p("Current")
				})]
			}, e.id))
		})]
	});
}
function Xt(e) {
	let { breakpoints: n } = L();
	return /* @__PURE__ */ z(t, {
		...e,
		desktop: n.find((e) => e.name === "lg")?.width ?? 1024
	});
}
export { qt as default };
