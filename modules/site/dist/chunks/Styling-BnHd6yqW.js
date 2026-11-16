import { i as e, n as t } from "./preview-J_UEsfe8.js";
import { a as n, c as r, d as i, l as a, n as o, s, u as c } from "./fields-CKXhwyJc.js";
import { CmsError as l, can as u, invalidate as ee, run as d, setQuery as f, t as p, useAbility as m, useLocation as te } from "@letterncms/sdk";
import { useEffect as ne, useLayoutEffect as re, useMemo as h, useRef as ie, useState as g } from "react";
import { Button as _, Fields as ae, Icon as oe, IconButton as v, Menu as se, NEW_COLOR as ce, Notice as le, Popover as y, Pressable as b, QueryError as x, SaveBar as ue, ScreenSidebar as S, Segmented as C, SidebarRow as de, Spinner as fe, Tooltip as w, Topbar as pe, cn as T, confirm as me, copyText as E, prompt as D, toast as O, useTheme as he } from "@letterncms/ui";
import { ARTICLE as k, ColorPicker as ge, FIELDS as _e, InspectorSection as ve, PaletteGrid as A, PanelFields as ye, SCHEME as be, SPACING_STEPS as j, SchemeTile as M, Specimen as xe, StyleBar as Se, StylePanels as Ce, Stylesheet as we, StylingProvider as Te, Swatch as N, lightDark as P, loadTailwindTheme as Ee, parseClass as F, schemesOf as I, screenFor as De, styleApi as L, styleLabel as R, styleSample as z, themeDefaults as Oe, useSpecimenSheet as ke, useStyling as B, withVariants as Ae } from "@letterncms/blocks";
import { Fragment as V, jsx as H, jsxs as U } from "react/jsx-runtime";
// admin/src/parts.tsx
var je = "cms-reveal shrink-0", Me = "cms-reveal-row -mx-2 rounded-sm px-2 transition-colors duration-base hover:bg-hover", W = () => /* @__PURE__ */ H("span", { className: "size-6 shrink-0" });
function G({ title: e, onAdd: t, addLabel: n, action: r, children: i }) {
	return /* @__PURE__ */ U("section", {
		className: "mb-8",
		children: [
			e && /* @__PURE__ */ U("div", {
				className: "mb-1 flex h-9 items-center justify-between",
				children: [
					/* @__PURE__ */ H("h3", {
						className: "m-0 text-xs font-semibold text-ink",
						children: e
					}),
					r,
					t && n && /* @__PURE__ */ H(w, {
						content: n,
						children: /* @__PURE__ */ H(v, {
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
			!e && (r || t && n) && /* @__PURE__ */ H("div", {
				className: "flex h-9 items-center",
				children: r ?? /* @__PURE__ */ H(_, {
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
function K({ handle: e, label: t, value: n, onChange: r, field: i, disabled: a, className: o }) {
	return /* @__PURE__ */ H(ae, {
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
function q({ name: e, copy: t = e, sample: n, after: r, below: i, wide: a, menu: o, children: s }) {
	return /* @__PURE__ */ U("div", {
		className: T(Me, "group"),
		children: [/* @__PURE__ */ U("div", {
			className: "flex min-h-9 items-center gap-2 py-1",
			children: [
				n !== void 0 && /* @__PURE__ */ H("span", {
					className: "grid w-7 shrink-0 place-items-center",
					children: n
				}),
				/* @__PURE__ */ H(w, {
					content: p("Copy Name"),
					children: /* @__PURE__ */ H(_, {
						variant: "ghost",
						size: "xs",
						onClick: () => void E(t, { copied: p("Copied {reference}", { reference: t }) }),
						"aria-label": p("Copy {reference}", { reference: t }),
						className: T("!justify-start !bg-transparent !px-0 text-left !font-normal hover:text-ink", a ? "min-w-0 flex-1 shrink" : n === void 0 ? "w-[120px] max-sm:w-20" : "w-[84px] max-sm:w-16"),
						children: /* @__PURE__ */ H("span", {
							className: "truncate",
							children: e
						})
					})
				}),
				a ? s : /* @__PURE__ */ H("div", {
					className: "flex w-60 min-w-0 shrink gap-1 max-lg:w-52 max-sm:w-auto max-sm:flex-1",
					children: s
				}),
				!a && /* @__PURE__ */ H("span", {
					className: "flex min-w-0 flex-1 items-center max-sm:hidden",
					children: r
				}),
				o && o.length > 0 ? /* @__PURE__ */ H(se, {
					trigger: /* @__PURE__ */ H(v, {
						icon: "more",
						label: p("Actions"),
						size: "xs",
						className: je
					}),
					items: o
				}) : /* @__PURE__ */ H(W, {})
			]
		}), i]
	});
}
function J({ label: e, action: t, children: n }) {
	return /* @__PURE__ */ U("div", {
		className: T(Me, "flex min-h-9 items-center gap-2 py-1"),
		children: [
			/* @__PURE__ */ H("span", {
				className: "w-[120px] shrink-0 truncate text-xs text-text max-sm:w-20",
				children: e
			}),
			/* @__PURE__ */ H("div", {
				className: "flex w-60 min-w-0 shrink items-center max-lg:w-52 max-sm:w-auto max-sm:flex-1",
				children: n
			}),
			/* @__PURE__ */ H("span", { className: "min-w-0 flex-1 max-sm:hidden" }),
			t ? /* @__PURE__ */ H("span", {
				className: je,
				children: t
			}) : /* @__PURE__ */ H(W, {})
		]
	});
}
function Ne({ onOpen: e, label: t, sample: n, menu: r }) {
	return /* @__PURE__ */ U("div", {
		className: T(Me, "group flex items-center gap-2 py-1.5"),
		children: [/* @__PURE__ */ U(_, {
			variant: "ghost",
			onClick: e,
			className: "!h-auto min-w-0 flex-1 shrink !justify-start !gap-3 !rounded-xs !bg-transparent !px-0 text-left !text-xs !font-normal focus-visible:!-outline-offset-2 hover:text-ink",
			children: [
				/* @__PURE__ */ H("span", {
					className: "w-28 shrink-0 truncate text-text max-sm:w-20",
					children: t
				}),
				n,
				/* @__PURE__ */ H(oe, {
					name: "chevron-right",
					size: 12,
					className: "shrink-0 text-faint"
				})
			]
		}), r ?? /* @__PURE__ */ H(W, {})]
	});
}
// admin/src/styles.tsx
var Pe = (e) => e.replace(/^!|!$/g, ""), Fe = (e) => e.split(/\s+/).filter(Boolean), Ie = (e) => e.elements().find((e) => e.name === "body")?.classes.join(" ") ?? "", Le = [
	"typography",
	"spacing",
	"fill",
	"border",
	"effects",
	"transition"
], Re = () => [
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
], ze = () => [
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
}), Be = () => [
	{
		key: "h2",
		selector: k.h2,
		label: p("Heading 2"),
		node: Y(`<h2 style="margin:0">${p("Heading 2")}</h2>`)
	},
	{
		key: "h3",
		selector: k.h3,
		label: p("Heading 3"),
		node: Y(`<h3 style="margin:0">${p("Heading 3")}</h3>`)
	},
	{
		key: "p",
		selector: k.p,
		label: p("Paragraph"),
		node: Y(`<p style="margin:0">${p("Paragraph")}</p>`)
	},
	{
		key: "li",
		selector: k.li,
		label: p("List Item"),
		node: Y(`<ul><li>${p("List Item")}</li></ul>`)
	},
	{
		key: "blockquote",
		selector: k.blockquote,
		label: p("Quote"),
		node: Y(`<blockquote style="margin:0">${p("Quote")}</blockquote>`)
	},
	{
		key: "figure",
		selector: k.figure,
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
		selector: k.a,
		label: p("Link"),
		node: Y(`<p><a href="#">${p("Link")}</a></p>`)
	}
];
function Ve(e, t) {
	return !e || t.length === 0 ? !1 : t.every((t) => {
		let n = e.declarations(Pe(F(t).utility));
		return !!n && n.every((e) => /^(font|text-(?!indent)|letter|line-height|color$|white-space|word|overflow-wrap|hyphens|--tw-(font|leading|tracking|ordinal|slashed|numeric|text))/.test(e.property));
	});
}
function He(e, t, n) {
	let r = (e) => {
		let { variants: r, utility: i } = F(e);
		return Pe(i) === t ? Ae(r, i.replace(t, n)) : e;
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
var Ue = (e) => String(e ?? "").trim().toLowerCase().replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/^-+|-+$/g, "");
async function We(e, t, n, r, i = "", a = "") {
	let o = Ue((await D({
		title: n,
		fields: [{
			handle: "name",
			type: "text",
			label: p("Name"),
			placeholder: i ? "outline" : "lead",
			required: !0,
			autofocus: !0
		}],
		values: { name: a ? R(a) : "" },
		confirm: r
	}))?.name);
	if (!o) return null;
	let s = `${i}${o}`;
	return s === a ? null : /^[a-z][a-z0-9-]*$/.test(s) ? t.includes(s) || e?.valid(s) ? (O.error(p("There is already a style “{name}”.", { name: R(s) })), null) : s : (O.error(p("A name is lowercase letters, numbers and hyphens, and starts with a letter.")), null);
}
function Ge({ edit: e, samples: t, name: n, selector: r, node: i, classes: a, groups: o, write: s, menu: c }) {
	let l = B(), [u, ee] = g([]), d = h(() => De(t.device, 1280, l.breakpoints), [t.device, l.breakpoints]), f = L(l.engine, a, d, u, e.readOnly ? () => {} : s), p = Ie(e.sheet), m = ke(t.compiler, [
		...Fe(p),
		...a.map((e) => Pe(F(e).utility)),
		...a,
		...Fe(i.className ?? "")
	]);
	return /* @__PURE__ */ U("div", {
		className: "-mx-4 -mt-2",
		children: [
			/* @__PURE__ */ H("div", {
				className: "sticky top-0 z-raised bg-bg",
				children: /* @__PURE__ */ H(Se, {
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
					lead: /* @__PURE__ */ H(Ke, {
						name: n,
						selector: r
					}),
					actions: /* @__PURE__ */ H(qe, { menu: c })
				})
			}),
			/* @__PURE__ */ H("div", {
				className: "border-b border-border p-4",
				children: /* @__PURE__ */ H(xe, {
					sheet: m,
					node: i,
					page: p,
					mode: e.mode,
					align: "center",
					className: "h-28 rounded-md border border-border"
				})
			}),
			/* @__PURE__ */ H("div", {
				inert: e.readOnly,
				children: /* @__PURE__ */ H(Ce, {
					s: f,
					groups: o
				})
			})
		]
	});
}
function Ke({ name: e, selector: t }) {
	return /* @__PURE__ */ H("div", {
		className: "flex min-h-8 min-w-0 flex-1 items-center",
		children: e ? /* @__PURE__ */ H(w, {
			content: p("Copy Name"),
			children: /* @__PURE__ */ H(_, {
				variant: "ghost",
				size: "xs",
				onClick: () => void E(e, { copied: p("Copied {reference}", { reference: e }) }),
				className: "min-w-0 shrink !px-1.5 font-mono !font-normal !text-muted hover:!text-ink",
				children: /* @__PURE__ */ U("span", {
					className: "truncate",
					children: [".", e]
				})
			})
		}) : t && /* @__PURE__ */ H("span", {
			className: "min-w-0 truncate px-1.5 font-mono text-xs text-muted",
			children: t
		})
	});
}
var qe = ({ menu: e }) => e && e.length > 0 ? /* @__PURE__ */ H(se, {
	align: "end",
	trigger: /* @__PURE__ */ H(v, {
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
}), Je = () => ({
	"var(--font-weight-normal)": p("Regular"),
	"var(--font-weight-medium)": p("Medium"),
	"var(--font-weight-semibold)": p("Semibold"),
	"var(--font-weight-bold)": p("Bold")
}), Ye = () => [
	{
		key: "form:fields",
		label: p("Fields"),
		selector: _e,
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
		selector: _e,
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
							options: Je()
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
		selector: _e,
		layer: "base",
		sample: {
			tag: "div",
			text: "",
			markup: Xe()
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
], Xe = () => `<div style="display:flex;gap:1rem;white-space:nowrap"><label class="cms-choice"><input type="checkbox" class="cms-check" checked tabindex="-1"> ${p("Newsletter")}</label><label class="cms-choice"><input type="radio" class="cms-radio" checked tabindex="-1"> ${p("Lunch")}</label><label class="cms-choice"><input type="checkbox" role="switch" class="cms-switch" checked tabindex="-1"> ${p("Reminders")}</label></div>`, Ze = () => ({
	tag: "form",
	text: "",
	markup: `<div class="cms-form" style="white-space:normal">
<div class="cms-field"><label class="cms-label">${p("Email")}</label><input class="cms-input" placeholder="you@example.com" tabindex="-1"><p class="cms-help">${p("We never share it.")}</p></div>
<div class="cms-field"><select class="cms-input" tabindex="-1"><option>${p("Dinner for two")}</option></select></div>
${Xe()}
</div>`
}), Qe = () => ({
	key: "article:spacing",
	label: p("Spacing in Articles"),
	selector: k.spacing,
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
function $e({ edit: e, samples: t, part: n }) {
	let { source: r } = B(), i = h(() => new we(r?.files.cms ?? ""), [r?.files.cms]), a = Ie(e.sheet), o = ke(t.compiler, Fe(a)), s = (t) => e.sheet.property(n.selector, t, n.layer), c = n.layer === "base" ? Ze() : n.sample;
	return /* @__PURE__ */ U("div", {
		className: "-mx-4 -mt-2",
		children: [
			/* @__PURE__ */ U("div", {
				className: "sticky top-0 z-raised flex items-center gap-1 border-b border-border bg-bg py-2 pl-4 pr-3",
				children: [/* @__PURE__ */ H(Ke, {}), /* @__PURE__ */ H(qe, { menu: et(e, n) })]
			}),
			/* @__PURE__ */ H("div", {
				className: "border-b border-border p-4",
				children: /* @__PURE__ */ H(xe, {
					sheet: o,
					node: c,
					page: a,
					mode: e.mode,
					align: "center",
					className: "h-64 rounded-md border border-border"
				})
			}),
			/* @__PURE__ */ H("div", {
				inert: e.readOnly,
				children: n.sections.map((t) => {
					let r = /* @__PURE__ */ H(ye, {
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
					return n.sections.length === 1 ? /* @__PURE__ */ H("div", {
						className: "space-y-1 px-4 py-3",
						children: r
					}, t.title) : /* @__PURE__ */ H(ve, {
						title: t.title,
						children: r
					}, t.title);
				})
			})
		]
	});
}
function et(e, t) {
	let n = t.sections.flatMap((e) => e.values);
	return e.readOnly || !n.some((n) => e.sheet.property(t.selector, n.property, t.layer) !== void 0) ? [] : [{
		label: p("Reset"),
		icon: "undo",
		onSelect: () => e.change((e) => n.reduce((e, n) => e.setProperty(t.selector, n.property, null, t.layer), e))
	}];
}
function tt({ edit: e, samples: t }) {
	let { engine: n } = B(), r = te().query.style ?? "", i = (e) => f({
		style: e,
		tab: "styles"
	}, !1), [a, o] = g(null), s = [...e.sheet.elements(), ...e.sheet.elements("components")], c = (e) => s.find((t) => t.name === e)?.classes ?? [], l = e.sheet.utilities().filter((e) => /^[a-z][\w-]*$/.test(e.name) && !e.name.startsWith("scheme-")), u = l.filter((e) => e.name.startsWith("btn-")), ee = l.filter((e) => !e.name.startsWith("btn-")), d = ee.filter((e) => Ve(n, e.classes) || a?.name === e.name && a.text), m = ee.filter((e) => !d.includes(e)), ne = Ie(e.sheet), re = ke(t.compiler, [
		...Fe(ne),
		...c("::selection"),
		...c(":focus-visible"),
		...Re().flatMap((e) => Fe(e.node.className ?? "")),
		...l.map((e) => e.name)
	]), h = e.sheet.utilities().map((e) => e.name), ie = (e) => ["::selection", ":focus-visible"].includes(e.selector) ? {
		...e.node,
		className: [e.node.className, ...c(e.selector)].filter(Boolean).join(" ")
	} : e.node, _ = async (t) => {
		let r = await We(n, h, p(t === "button" ? "New Button" : "New Style"), p(t === "button" ? "Create Button" : "Create Style"), t === "button" ? "btn-" : "");
		r && (t === "button" && u[0] ? e.change((e) => e.duplicateUtility(u[0].name, r)) : e.change((e) => e.setUtility(r, t === "text" ? ["text-base"] : t === "box" ? ["p-6"] : ["inline-flex"])), o({
			name: r,
			text: t === "text"
		}), i(r));
	}, ae = async (t) => {
		let a = await We(n, h, p("Rename"), p("Rename"), t.startsWith("btn-") ? "btn-" : "", t);
		a && (e.change((e) => He(e, t, a)), r === t && i(a));
	}, oe = async (t) => {
		let r = await We(n, h, p("Duplicate"), p("Duplicate"), t.startsWith("btn-") ? "btn-" : "");
		r && e.change((e) => e.duplicateUtility(t, r));
	}, ce = async (t) => {
		await me({
			title: p("Delete “{name}”?", { name: R(t) }),
			confirm: p("Delete"),
			danger: !0
		}) && (e.change((e) => e.removeUtility(t)), r === t && i(null));
	}, le = (t) => e.readOnly ? [] : [
		{
			label: p("Rename…"),
			icon: "edit",
			onSelect: () => void ae(t)
		},
		{
			label: p("Duplicate…"),
			icon: "copy",
			onSelect: () => void oe(t)
		},
		{
			separator: !0,
			label: ""
		},
		{
			label: p("Delete"),
			icon: "trash",
			danger: !0,
			onSelect: () => void ce(t)
		}
	], y = (t, n = "base") => e.readOnly || c(t).length === 0 ? [] : [{
		label: p("Reset"),
		icon: "undo",
		onSelect: () => e.change((e) => e.removeElement(t, n))
	}], b = [...Re(), ...ze()].find((e) => `element:${e.selector}` === r);
	if (b) return /* @__PURE__ */ H(Ge, {
		edit: e,
		samples: t,
		selector: b.selector,
		node: ie(b),
		classes: c(b.selector),
		groups: b.groups ?? Le,
		menu: y(b.selector),
		write: (t) => e.change((e) => e.setElement(b.selector, t))
	}, r);
	let x = Be().find((e) => `article:${e.key}` === r);
	if (x) return /* @__PURE__ */ H(Ge, {
		edit: e,
		samples: t,
		selector: x.selector,
		node: x.node,
		classes: c(x.selector),
		groups: x.groups ?? Le,
		menu: y(x.selector, "components"),
		write: (t) => e.change((e) => e.setElement(x.selector, t, "components"))
	}, r);
	let ue = [...Ye(), Qe()].find((e) => e.key === r);
	if (ue) return /* @__PURE__ */ H($e, {
		edit: e,
		samples: t,
		part: ue
	}, r);
	let S = l.find((e) => e.name === r);
	if (S) return /* @__PURE__ */ H(Ge, {
		edit: e,
		samples: t,
		name: S.name,
		node: z(S.name),
		classes: S.classes,
		groups: d.includes(S) ? Le : void 0,
		menu: le(S.name),
		write: (t) => e.change((e) => t.length > 0 || e.utilities().find((e) => e.name === S.name)?.custom ? e.setUtility(S.name, t) : e.removeUtility(S.name))
	}, r);
	let C = (t, n, r, a) => /* @__PURE__ */ H(Ne, {
		onOpen: () => i(t),
		label: n,
		sample: /* @__PURE__ */ H(xe, {
			sheet: re,
			node: r,
			page: ne,
			mode: e.mode,
			className: "h-12 min-w-0 flex-1 rounded-sm shadow-edge"
		}),
		menu: a.length ? /* @__PURE__ */ H(se, {
			trigger: /* @__PURE__ */ H(v, {
				icon: "more",
				label: p("Style Actions"),
				size: "xs",
				className: je
			}),
			items: a
		}) : void 0
	}, t), de = (t) => e.readOnly ? void 0 : () => void _(t);
	return /* @__PURE__ */ U(V, { children: [
		/* @__PURE__ */ H(G, {
			title: p("Page"),
			children: Re().map((e) => C(`element:${e.selector}`, e.label, ie(e), y(e.selector)))
		}),
		/* @__PURE__ */ U(G, {
			title: p("Text"),
			onAdd: de("text"),
			addLabel: p("New Text Style"),
			children: [ze().map((e) => C(`element:${e.selector}`, e.label, e.node, y(e.selector))), d.map((e) => C(e.name, R(e.name), z(e.name), le(e.name)))]
		}),
		/* @__PURE__ */ H(G, {
			title: p("Buttons"),
			onAdd: de("button"),
			addLabel: p("New Button"),
			children: u.map((e) => C(e.name, R(e.name), z(e.name), le(e.name)))
		}),
		/* @__PURE__ */ H(G, {
			title: p("Forms"),
			children: Ye().map((t) => C(t.key, t.label, t.sample, et(e, t)))
		}),
		/* @__PURE__ */ U(G, {
			title: p("Articles"),
			children: [C(Qe().key, p("Spacing"), Qe().sample, et(e, Qe())), Be().map((e) => C(`article:${e.key}`, e.label, e.node, y(e.selector, "components")))]
		}),
		/* @__PURE__ */ H(G, {
			title: p("Boxes"),
			onAdd: de("box"),
			addLabel: p("New Style"),
			children: m.map((e) => C(e.name, R(e.name), {
				...z(e.name),
				className: `${e.name} inline-block`
			}, le(e.name)))
		})
	] });
}
function nt(e, t) {
	let n = [...Re(), ...ze()].find((e) => `element:${e.selector}` === t);
	if (n) return n.label;
	let r = Be().find((e) => `article:${e.key}` === t);
	if (r) return p("{name} in Articles", { name: r.label });
	let i = [...Ye(), Qe()].find((e) => e.key === t);
	return i ? i.label : e.utilities().some((e) => e.name === t) ? R(t) : null;
}
// admin/src/theme.tsx
function rt(e, t, n = () => !1) {
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
var it = (e) => String(e ?? "").trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/^-+|-+$/g, "");
async function at(e, t, n, r, i = "", a = "md") {
	let o = it((await D({
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
	return !o || o === i ? null : e.sheet.variable(`${t}${o}`) !== void 0 || e.defaults.has(`${t}${o}`) ? (O.error(p("“{name}” already exists", { name: o })), null) : o;
}
function ot(e, t, n, r) {
	let i = n.name.slice(0, n.name.length - n.key.length) + r, a = RegExp(`^(!?.*-)${n.key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}((?:/[^!]+)?!?)$`), o = (e) => {
		let { variants: i, utility: o } = F(e), s = a.exec(o);
		return !s || !t?.declarations(o.replace(/^!|!$/g, ""))?.some((e) => e.value.includes(`var(${n.name})`)) ? e : Ae(i, `${s[1]}${r}${s[2]}`);
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
var st = (e, t) => e.variables().filter((e) => e.name === t || e.name.startsWith(`${t}--`)).reduce((e, t) => e.setVariable(t.name, null), e);
function ct(e, t) {
	let { engine: n } = B();
	return (r, i = []) => e.readOnly ? [] : r.builtIn ? [...i, ...r.written ? [...i.length ? [{
		separator: !0,
		label: ""
	}] : [], {
		label: p("Reset"),
		icon: "undo",
		onSelect: () => e.change((e) => st(e, r.name))
	}] : []] : [
		{
			label: p("Rename…"),
			icon: "edit",
			onSelect: async () => {
				let i = await at(e, t.prefix, p("Rename"), p("Rename"), r.key, t.placeholder);
				i && e.change((e) => ot(e, n, r, i));
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
			onSelect: () => e.change((e) => st(e, r.name))
		}
	];
}
function Q({ edit: e, kind: t, row: n }) {
	let r = ct(e, t), i = async () => {
		let n = await at(e, t.prefix, t.fresh, t.add, "", t.placeholder);
		n && e.change((e) => e.setVariable(`${t.prefix}${n}`, t.start));
	};
	return /* @__PURE__ */ H(G, {
		title: t.title,
		onAdd: e.readOnly ? void 0 : () => void i(),
		addLabel: t.add,
		children: rt(e, t.prefix, t.skip).map((t) => n(t, (n) => n !== null && e.change((e) => e.setVariable(t.name, n)), (e) => r(t, e)))
	});
}
var $ = (e, t = {}) => ({
	component: "blocks-value",
	unit: e,
	...t
}), lt = { component: "site-size" }, ut = $("rem", {
	units: [
		"rem",
		"px",
		"em"
	],
	step: .125,
	min: 0
}), dt = /^(.+)-(\d{2,3})$/;
function ft({ label: e, value: t, same: n, onChange: r, disabled: i, size: a = "md" }) {
	let { engine: o } = B(), [s, c] = g(!1), l = (e) => P(o ? o.resolve(e) : e).light, u = t ?? n ?? "transparent";
	return /* @__PURE__ */ H(y, {
		open: s,
		onOpenChange: c,
		align: "end",
		className: "!p-0",
		trigger: /* @__PURE__ */ H(b, {
			compact: !0,
			"aria-label": e,
			title: `${e} · ${t ?? p("Same")}`,
			disabled: i,
			className: T("relative shrink-0 rounded-sm outline-offset-2 data-[popup-open]:ring-2 data-[popup-open]:ring-focus", a === "md" ? "size-7" : "size-6"),
			children: /* @__PURE__ */ H(N, {
				color: l(u),
				className: T("!size-full !rounded-sm", t === null && "opacity-35")
			})
		}),
		children: /* @__PURE__ */ H(ge, {
			label: e,
			value: t ?? void 0,
			onChange: r
		})
	});
}
function pt({ edit: e, row: t }) {
	let [n, r] = g(!1);
	return /* @__PURE__ */ H(y, {
		open: n,
		onOpenChange: r,
		align: "start",
		className: "!p-0",
		trigger: /* @__PURE__ */ U(b, {
			compact: !0,
			"aria-label": t.key,
			title: t.key,
			disabled: e.readOnly,
			className: "relative h-6 rounded-xs outline-offset-1 hover:z-raised hover:ring-2 hover:ring-float data-[popup-open]:z-raised data-[popup-open]:ring-2 data-[popup-open]:ring-focus",
			style: { background: P(t.value).light },
			children: [/* @__PURE__ */ H("span", { className: "cms-swatch-edge" }), t.written && /* @__PURE__ */ H("span", {
				className: "absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-edge",
				"aria-hidden": !0
			})]
		}),
		children: /* @__PURE__ */ H(ge, {
			label: t.key,
			value: t.value,
			onChange: (n) => e.change((e) => n === null ? st(e, t.name) : e.setVariable(t.name, n))
		})
	});
}
var mt = (e, t, n, r) => e.writeUtility(t, [{
	name: "--scheme",
	value: n
}, {
	name: "--scheme-text",
	value: r
}], ["scheme"]);
function ht({ edit: e }) {
	let { engine: t } = B(), n = I(e.sheet), r = (n) => {
		let r = P(t ? t.resolve(n) : n);
		return e.mode === "dark" ? r.dark ?? r.light : r.light;
	}, i = async () => {
		let t = it((await D({
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
			if (n.some((e) => e.key === t)) return void O.error(p("“{name}” already exists", { name: t }));
			e.change((e) => mt(e, `${be}${t}`, "var(--color-foreground)", "var(--color-background)"));
		}
	}, a = async (t) => {
		let r = it((await D({
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
			if (n.some((e) => e.key === r)) return void O.error(p("“{name}” already exists", { name: r }));
			e.change((e) => e.renameUtility(t.name, `${be}${r}`));
		}
	};
	return /* @__PURE__ */ H(G, {
		title: p("Schemes"),
		onAdd: e.readOnly ? void 0 : () => void i(),
		addLabel: p("Add Scheme"),
		children: n.length > 0 && /* @__PURE__ */ H("div", {
			className: "grid grid-cols-2 gap-3 pt-3",
			children: n.map((t) => /* @__PURE__ */ U("div", {
				className: "cms-reveal-row group min-w-0",
				children: [/* @__PURE__ */ H(M, {
					size: "card",
					background: r(t.background),
					text: r(t.text)
				}), /* @__PURE__ */ U("div", {
					className: "flex h-9 items-center gap-1.5",
					children: [
						/* @__PURE__ */ H(w, {
							content: p("Copy Name"),
							children: /* @__PURE__ */ H(_, {
								variant: "ghost",
								size: "xs",
								onClick: () => void E(t.name, { copied: p("Copied {reference}", { reference: t.name }) }),
								className: "min-w-0 flex-1 shrink !justify-start !bg-transparent !px-0 !font-normal hover:text-ink",
								children: /* @__PURE__ */ H("span", {
									className: "truncate",
									children: t.key
								})
							})
						}),
						/* @__PURE__ */ H(ft, {
							size: "sm",
							label: p("{name} Background", { name: t.key }),
							value: t.background,
							disabled: e.readOnly,
							onChange: (n) => n && e.change((e) => mt(e, t.name, n, t.text))
						}),
						/* @__PURE__ */ H(ft, {
							size: "sm",
							label: p("{name} Text", { name: t.key }),
							value: t.text,
							disabled: e.readOnly,
							onChange: (n) => n && e.change((e) => mt(e, t.name, t.background, n))
						}),
						e.readOnly ? /* @__PURE__ */ H(W, {}) : /* @__PURE__ */ H(se, {
							trigger: /* @__PURE__ */ H(v, {
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
function gt({ edit: e }) {
	let t = {
		prefix: "--color-",
		title: p("Colors"),
		add: p("Add Color"),
		fresh: p("New Color"),
		start: ce,
		placeholder: "brand"
	}, n = ct(e, t), r = rt(e, t.prefix), i = (t) => t.builtIn && e.palette.has(t.name), a = r.filter((e) => !i(e)), o = /* @__PURE__ */ new Map();
	for (let e of r.filter(i)) {
		let t = dt.exec(e.key)?.[1];
		t && o.set(t, [...o.get(t) ?? [], e]);
	}
	let s = async () => {
		let n = await at(e, t.prefix, t.fresh, t.add, "", t.placeholder);
		n && e.change((e) => e.setVariable(`${t.prefix}${n}`, t.start));
	}, c = (t, n, r) => e.change((e) => e.setVariable(t.name, r && r !== n ? `light-dark(${n}, ${r})` : n));
	return /* @__PURE__ */ U(V, { children: [
		/* @__PURE__ */ U("section", {
			className: "mb-8",
			children: [/* @__PURE__ */ U("div", {
				className: "mb-1 flex h-9 items-center gap-2",
				children: [
					/* @__PURE__ */ H("h3", {
						className: "m-0 min-w-0 flex-1 text-xs font-semibold text-ink",
						children: t.title
					}),
					/* @__PURE__ */ H("span", {
						className: "grid w-7 place-items-center text-faint",
						title: p("Light"),
						children: /* @__PURE__ */ H(oe, {
							name: "sun",
							size: 13
						})
					}),
					/* @__PURE__ */ H("span", {
						className: "grid w-7 place-items-center text-faint",
						title: p("Dark"),
						children: /* @__PURE__ */ H(oe, {
							name: "moon",
							size: 13
						})
					}),
					e.readOnly ? /* @__PURE__ */ H(W, {}) : /* @__PURE__ */ H(w, {
						content: t.add,
						children: /* @__PURE__ */ H(v, {
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
				let { light: r, dark: i } = P(t.value);
				return /* @__PURE__ */ U(q, {
					name: t.key,
					wide: !0,
					menu: n(t),
					children: [/* @__PURE__ */ H(ft, {
						label: p("{name} in Light Mode", { name: t.key }),
						value: r,
						disabled: e.readOnly,
						onChange: (e) => e && c(t, e, i)
					}), /* @__PURE__ */ H(ft, {
						label: p("{name} in Dark Mode", { name: t.key }),
						value: i ?? null,
						same: r,
						disabled: e.readOnly,
						onChange: (e) => c(t, r, e ?? void 0)
					})]
				}, t.name);
			})]
		}),
		/* @__PURE__ */ H(ht, { edit: e }),
		o.size > 0 && /* @__PURE__ */ H(G, {
			title: p("Palette"),
			children: /* @__PURE__ */ H(A, {
				head: !0,
				className: "py-3",
				families: [...o].map(([e, t]) => ({
					name: e,
					shades: t
				})),
				cell: (t) => /* @__PURE__ */ H(pt, {
					edit: e,
					row: t
				}, t.name)
			})
		})
	] });
}
function _t(e) {
	let t = e.flatMap((e) => String(e.weight ?? "400").split(/\s+/).map(Number)).filter((e) => e > 0), n = Math.min(...t), r = Math.max(...t), i = t.length === 0 ? "400" : n === r ? String(n) : `${n}–${r}`;
	return e.some((e) => e.style === "italic") ? `${i} · ${p("Italic")}` : i;
}
var vt = (e, t) => /* @__PURE__ */ H("p", {
	className: "m-0 truncate pb-2.5 text-ink",
	style: {
		fontSize: `min(${e}, 2.75rem)`,
		lineHeight: 1.1,
		fontFamily: t
	},
	children: p("Ship It")
});
function yt({ edit: e, fonts: t }) {
	let n = [...new Set(t.faces.map((e) => e.family))], o = new Set(rt(e, "--font-", (e) => e.startsWith("weight-")).map((e) => r(a(e.value)))), c = n.map((e) => {
		let n = t.faces.filter((t) => t.family === e);
		return {
			family: e,
			styles: _t(n),
			fallback: n.some((e) => Array.isArray(e.fallback) ? e.fallback.length > 0 : !!e.fallback),
			used: o.has(e)
		};
	}), l = i("", "sans", !1), u = e.sheet.variable("--font-sans") ?? e.defaults.get("--font-sans"), ee = () => [
		["sans", p("Sans")],
		["serif", p("Serif")],
		["mono", p("Mono")]
	];
	return /* @__PURE__ */ U(V, { children: [
		/* @__PURE__ */ H(Q, {
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
				return /* @__PURE__ */ H(q, {
					name: n.key,
					sample: /* @__PURE__ */ H("span", {
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
					children: /* @__PURE__ */ H(K, {
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
		/* @__PURE__ */ H(Q, {
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
			row: (t, n, r) => /* @__PURE__ */ H(q, {
				name: t.key,
				menu: r(),
				below: vt(t.value, u),
				children: /* @__PURE__ */ H(K, {
					handle: t.name,
					label: t.key,
					value: t.value,
					disabled: e.readOnly,
					field: lt,
					onChange: n
				})
			}, t.name)
		}),
		/* @__PURE__ */ H(Q, {
			edit: e,
			kind: {
				prefix: "--leading-",
				title: p("Line Heights"),
				add: p("Add Line Height"),
				fresh: p("New Line Height"),
				start: "1.5",
				placeholder: "airy"
			},
			row: (t, n, r) => /* @__PURE__ */ H(q, {
				name: t.key,
				menu: r(),
				sample: /* @__PURE__ */ H("span", {
					className: "flex w-4 flex-col",
					style: { gap: `${Math.max(1, (Number(t.value) - .8) * 6)}px` },
					children: [
						0,
						1,
						2
					].map((e) => /* @__PURE__ */ H("span", { className: T("h-0.5 rounded-full bg-muted", e === 2 && "w-2/3") }, e))
				}),
				children: /* @__PURE__ */ H(K, {
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
		/* @__PURE__ */ H(Q, {
			edit: e,
			kind: {
				prefix: "--tracking-",
				title: p("Letter Spacing"),
				add: p("Add Letter Spacing"),
				fresh: p("New Letter Spacing"),
				start: "0em",
				placeholder: "loose"
			},
			row: (t, n, r) => /* @__PURE__ */ H(q, {
				name: t.key,
				menu: r(),
				sample: /* @__PURE__ */ H("span", {
					className: "text-xs font-medium text-ink",
					style: { letterSpacing: t.value },
					children: "Aa"
				}),
				children: /* @__PURE__ */ H(K, {
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
var bt = (e, t = lt) => (n, r, i) => /* @__PURE__ */ H(q, {
	name: n.key,
	menu: i(),
	children: /* @__PURE__ */ H(K, {
		handle: n.name,
		label: n.key,
		value: n.value,
		disabled: e.readOnly,
		field: t,
		onChange: r
	})
}, n.name);
function xt({ edit: e }) {
	let t = [
		["sm", p("Small")],
		["md", p("Medium")],
		["lg", p("Large")]
	], n = [
		["height", p("Height")],
		["padding", p("Padding")],
		["text", p("Text")]
	], r = (t) => e.sheet.variable(t) ?? e.defaults.get(t) ?? null, i = "w-24 shrink-0 max-sm:min-w-0 max-sm:flex-1";
	return /* @__PURE__ */ U(G, {
		title: p("Buttons and Fields"),
		children: [/* @__PURE__ */ U("div", {
			className: "flex min-h-8 items-center gap-2 text-2xs text-faint",
			children: [
				/* @__PURE__ */ H("span", { className: "min-w-0 flex-1" }),
				n.map(([e, t]) => /* @__PURE__ */ H("span", {
					className: i,
					children: t
				}, e)),
				/* @__PURE__ */ H("span", { className: "size-6 shrink-0" })
			]
		}), t.map(([t, a]) => {
			let o = n.map(([e]) => `--control-${t}-${e}`), s = o.some((t) => e.sheet.variable(t) !== void 0);
			return /* @__PURE__ */ U("div", {
				className: T(Me, "flex min-h-9 items-center gap-2 py-1"),
				children: [
					/* @__PURE__ */ H("span", {
						className: "min-w-0 flex-1 truncate text-xs text-text",
						children: a
					}),
					n.map(([t, n], s) => /* @__PURE__ */ H("div", {
						className: i,
						children: /* @__PURE__ */ H(K, {
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
					s && !e.readOnly ? /* @__PURE__ */ H(w, {
						content: p("Reset"),
						children: /* @__PURE__ */ H(v, {
							icon: "undo",
							size: "xs",
							label: p("Reset"),
							title: void 0,
							className: "cms-reveal shrink-0",
							onClick: () => e.change((e) => o.reduce((e, t) => e.setVariable(t, null), e))
						})
					}) : /* @__PURE__ */ H("span", { className: "size-6 shrink-0" })
				]
			}, t);
		})]
	});
}
function St(e) {
	let t = /^(-?[\d.]+)(rem|px)$/.exec(e.trim());
	return t ? Number(t[1]) * (t[2] === "rem" ? 16 : 1) : null;
}
function Ct({ step: e }) {
	let t = St(e);
	return t === null ? null : /* @__PURE__ */ H("div", {
		className: "flex items-end gap-1.5 pb-3 pt-1",
		"aria-hidden": !0,
		children: j.filter((e) => e > 0).map((e) => {
			let n = +(t * e).toFixed(2);
			return /* @__PURE__ */ U("span", {
				className: "flex min-w-0 flex-1 flex-col items-center gap-1",
				title: `${e} · ${n}px`,
				children: [/* @__PURE__ */ H("span", {
					className: "w-full rounded-xs bg-active",
					style: { height: Math.max(2, Math.min(n, 128) / 2) }
				}), /* @__PURE__ */ H("span", {
					className: "text-2xs tabular-nums text-faint",
					children: n
				})]
			}, e);
		})
	});
}
function wt({ edit: e }) {
	let t = {
		prefix: "--spacing-",
		title: p("Spacing"),
		add: p("Add Spacing"),
		fresh: p("New Spacing"),
		start: "2rem",
		placeholder: "gutter"
	}, n = ct(e, t), r = e.sheet.variable("--spacing"), i = async () => {
		let n = await at(e, t.prefix, t.fresh, t.add, "", t.placeholder);
		n && e.change((e) => e.setVariable(`${t.prefix}${n}`, t.start));
	}, a = {
		name: "--spacing",
		key: "1",
		value: r ?? e.defaults.get("--spacing") ?? "0.25rem",
		builtIn: !0,
		written: r !== void 0
	};
	return /* @__PURE__ */ U(V, { children: [
		/* @__PURE__ */ U(G, {
			title: t.title,
			onAdd: e.readOnly ? void 0 : () => void i(),
			addLabel: t.add,
			children: [/* @__PURE__ */ H(q, {
				name: a.key,
				copy: a.name,
				menu: n(a),
				below: /* @__PURE__ */ H(Ct, { step: a.value }),
				children: /* @__PURE__ */ H(K, {
					handle: "--spacing",
					label: a.key,
					value: a.value,
					disabled: e.readOnly,
					field: lt,
					onChange: (t) => t !== null && e.change((e) => e.setVariable("--spacing", t))
				})
			}), rt(e, t.prefix).map((t) => bt(e)(t, (n) => n !== null && e.change((e) => e.setVariable(t.name, n)), (e) => n(t, e)))]
		}),
		/* @__PURE__ */ H(Q, {
			edit: e,
			kind: {
				prefix: "--container-",
				title: p("Containers"),
				add: p("Add Container"),
				fresh: p("New Container"),
				start: "72rem",
				placeholder: "content"
			},
			row: bt(e)
		}),
		/* @__PURE__ */ H(Q, {
			edit: e,
			kind: {
				prefix: "--breakpoint-",
				title: p("Breakpoints"),
				add: p("Add Breakpoint"),
				fresh: p("New Breakpoint"),
				start: "120rem",
				placeholder: "3xl"
			},
			row: bt(e, ut)
		}),
		/* @__PURE__ */ H(xt, { edit: e })
	] });
}
function Tt({ edit: e }) {
	let t = (t) => (r, i, a) => /* @__PURE__ */ H(q, {
		name: r.key,
		menu: a(),
		sample: /* @__PURE__ */ H(n, {
			value: r.value,
			kind: t
		}),
		children: /* @__PURE__ */ H(K, {
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
	return /* @__PURE__ */ U(V, { children: [
		/* @__PURE__ */ H(Q, {
			edit: e,
			kind: {
				prefix: "--radius-",
				title: p("Corners"),
				add: p("Add Radius"),
				fresh: p("New Radius"),
				start: "0.5rem",
				placeholder: "card"
			},
			row: (t, n, r) => /* @__PURE__ */ H(q, {
				name: t.key,
				menu: r(),
				sample: /* @__PURE__ */ H("span", {
					className: "size-5 translate-x-0.5 translate-y-0.5 border-l-[1.5px] border-t-[1.5px] border-muted",
					style: { borderTopLeftRadius: `min(${t.value}, 20px)` }
				}),
				children: /* @__PURE__ */ H(K, {
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
		/* @__PURE__ */ H(Q, {
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
		/* @__PURE__ */ H(Q, {
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
		/* @__PURE__ */ H(Q, {
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
		/* @__PURE__ */ H(Q, {
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
		/* @__PURE__ */ H(Q, {
			edit: e,
			kind: {
				prefix: "--blur-",
				title: p("Blur"),
				add: p("Add Blur"),
				fresh: p("New Blur"),
				start: "6px",
				placeholder: "soft"
			},
			row: (t, n, r) => /* @__PURE__ */ H(q, {
				name: t.key,
				menu: r(),
				sample: /* @__PURE__ */ H("span", {
					className: "size-3 rounded-full bg-muted",
					style: { filter: `blur(min(${t.value}, 6px))` }
				}),
				children: /* @__PURE__ */ H(K, {
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
		/* @__PURE__ */ H(Q, {
			edit: e,
			kind: {
				prefix: "--perspective-",
				title: p("Perspective"),
				add: p("Add Perspective"),
				fresh: p("New Perspective"),
				start: "800px",
				placeholder: "deep"
			},
			row: bt(e, $("px", {
				units: ["px", "rem"],
				step: 10,
				min: 0
			}))
		})
	] });
}
function Et(e, t) {
	let n = String(e ?? "").trim().match(/^(\d*\.?\d+)\s*(ms|s)?$/);
	if (!n) return t;
	let r = n[2] === "s" ? Number(n[1]) : Number(n[1]) / 1e3;
	return Math.min(2, Math.max(.05, Math.round(r * 1e3) / 1e3));
}
function Dt({ edit: e, transition: t, onTransition: n }) {
	let r = (t, n) => e.change((e) => e.setVariable(t, n)), i = (t) => e.sheet.variable(t) ?? e.defaults.get(t) ?? null, a = (t) => e.sheet.variable(t) !== void 0 && !e.readOnly ? /* @__PURE__ */ H(w, {
		content: p("Reset"),
		children: /* @__PURE__ */ H(v, {
			icon: "undo",
			size: "xs",
			label: p("Reset"),
			title: void 0,
			onClick: () => r(t, null)
		})
	}) : void 0;
	return /* @__PURE__ */ U(V, { children: [
		/* @__PURE__ */ H(Q, {
			edit: e,
			kind: {
				prefix: "--ease-",
				title: p("Easings"),
				add: p("Add Easing"),
				fresh: p("New Easing"),
				start: "cubic-bezier(0.2, 0.8, 0.2, 1)",
				placeholder: "snap"
			},
			row: (t, n, r) => /* @__PURE__ */ H(q, {
				name: t.key,
				menu: r(),
				children: /* @__PURE__ */ H(K, {
					handle: t.name,
					label: t.key,
					value: t.value,
					disabled: e.readOnly,
					field: { component: "ease" },
					onChange: n
				})
			}, t.name)
		}),
		/* @__PURE__ */ H(Q, {
			edit: e,
			kind: {
				prefix: "--duration-",
				title: p("Durations"),
				add: p("Add Duration"),
				fresh: p("New Duration"),
				start: "300ms",
				placeholder: "slow"
			},
			row: (t, n, r) => /* @__PURE__ */ H(q, {
				name: t.key,
				menu: r(),
				children: /* @__PURE__ */ H(K, {
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
		/* @__PURE__ */ H(Q, {
			edit: e,
			kind: {
				prefix: "--animate-",
				title: p("Animations"),
				add: p("Add Animation"),
				fresh: p("New Animation"),
				start: "spin 2s linear infinite",
				placeholder: "float"
			},
			row: (t, n, r) => /* @__PURE__ */ H(q, {
				name: t.key,
				menu: r(),
				sample: /* @__PURE__ */ H(o, {
					value: t.value,
					keyframes: e.keyframes
				}),
				children: /* @__PURE__ */ H(K, {
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
		/* @__PURE__ */ U(G, {
			title: p("Transitions"),
			children: [/* @__PURE__ */ H(J, {
				label: p("Duration"),
				action: a("--default-transition-duration"),
				children: /* @__PURE__ */ H(K, {
					handle: "--default-transition-duration",
					label: p("Duration"),
					value: i("--default-transition-duration"),
					disabled: e.readOnly,
					field: $("ms", {
						units: ["ms", "s"],
						step: 10,
						min: 0
					}),
					onChange: (e) => e && r("--default-transition-duration", e)
				})
			}), /* @__PURE__ */ H(J, {
				label: p("Easing"),
				action: a("--default-transition-timing-function"),
				children: /* @__PURE__ */ H(K, {
					handle: "--default-transition-timing-function",
					label: p("Easing"),
					value: i("--default-transition-timing-function"),
					disabled: e.readOnly,
					field: { component: "ease" },
					onChange: (e) => e && r("--default-transition-timing-function", e)
				})
			})]
		}),
		/* @__PURE__ */ U(G, {
			title: p("Page Transition"),
			children: [
				/* @__PURE__ */ H(J, {
					label: p("Effect"),
					children: /* @__PURE__ */ H(K, {
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
						onChange: (e) => n({
							...t,
							type: e ?? "none"
						})
					})
				}),
				t.type !== "none" && /* @__PURE__ */ H(J, {
					label: p("Duration"),
					children: /* @__PURE__ */ H(K, {
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
						onChange: (e) => n({
							...t,
							duration: Et(e, t.duration)
						})
					})
				}),
				/* @__PURE__ */ H(J, {
					label: p("Page Loads"),
					children: /* @__PURE__ */ H(K, {
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
var Ot = {}, kt = [
	"colors",
	"typography",
	"layout",
	"effects",
	"motion",
	"styles"
];
function At() {
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
var jt = (e, t) => JSON.stringify(e ?? null) === JSON.stringify(t ?? null), Mt = /* @__PURE__ */ new Map();
function Nt() {
	let t = m("styling/get", {}, {
		refetchOnWindowFocus: !1,
		retry: !1
	}), n = m("styling/source", {}, {
		refetchOnWindowFocus: !1,
		retry: !1,
		staleTime: 6e4
	}), [r, i] = g(Ot), { query: a } = te(), o = a.style ? "styles" : kt.includes(a.tab) ? a.tab : null, s = (e) => f({
		tab: e,
		style: null
	}), [ae, oe] = g(he() === "dark" ? "dark" : "light"), [se, ce] = g(!1), [y, b] = g(() => window.matchMedia("(max-width: 767px)").matches);
	ne(() => {
		let e = window.matchMedia("(max-width: 767px)"), t = () => b(e.matches);
		return e.addEventListener("change", t), () => e.removeEventListener("change", t);
	}, []);
	let E = se && y, [k, ge] = g("desktop"), [_e, ve] = g(!1), [A, ye] = g(null), be = ie(null), j = t.data, M = r.css ?? j?.css, xe = r.transition ?? j?.transition, Se = !!j && (r.css !== void 0 && r.css !== j.css || r.transition !== void 0 && !jt(r.transition, j.transition)), Ce = !u("settings.manage"), N = h(() => new we(M ?? ""), [M]), P = e(n.data, M), F = h(() => N.variables().some((e) => e.value.startsWith("light-dark(")) || /color-scheme\s*:\s*light\s+dark\b/.test(N.css), [N]), [I, De] = g(null);
	ne(() => {
		Ee().then(De);
	}, []);
	let L = ie(null), R = `${o}:${a.style ?? ""}`, z = ie(R);
	z.current !== R && (L.current && Mt.set(z.current, L.current.scrollTop), z.current = R);
	let ke = !!t.data && !!n.data && I !== null;
	re(() => {
		ke && L.current && (L.current.scrollTop = Mt.get(R) ?? 0);
	}, [R, ke]);
	let B = n.data?.files.cms, Ae = h(() => {
		let e = /* @__PURE__ */ new Map();
		for (let t of [...Oe(I ?? ""), ...Oe(B ?? "")]) e.set(t.name, t.value);
		return e;
	}, [I, B]), je = h(() => new Set(Oe(I ?? "").filter((e) => e.name.startsWith("--color-")).map((e) => e.name)), [I]), Me = h(() => c(I ?? "", M ?? ""), [I, M]);
	if (ne(() => {
		let e = document.createElement("style");
		return e.textContent = (j?.fonts ?? []).map((e) => `@font-face{font-family:"${e.family}";src:url("${/^(https:\/\/|\/)/.test(e.src) ? e.src : `/_cms/fonts/${e.src.split("/").pop()}`}") format("woff2");font-weight:${e.weight ?? "400"};font-style:${e.style ?? "normal"};font-display:swap}`).join("\n"), document.head.appendChild(e), () => e.remove();
	}, [j?.fonts]), t.isLoading || n.isLoading || I === null) return /* @__PURE__ */ H("div", {
		className: "grid h-full place-items-center text-faint",
		children: /* @__PURE__ */ H(fe, {})
	});
	if (!j || !n.data || M === void 0 || !xe) return /* @__PURE__ */ U("div", {
		className: "flex h-full flex-col",
		children: [/* @__PURE__ */ H(pe, { crumbs: [{
			label: p("Styling"),
			icon: "palette"
		}] }), /* @__PURE__ */ H(x, {
			title: p("Couldn’t load the styling"),
			onRetry: () => {
				t.refetch(), n.refetch();
			},
			retrying: t.isRefetching || n.isRefetching
		})]
	});
	let W = {
		sheet: N,
		change: (e) => !Ce && i((t) => ({
			...t,
			css: e(new we(t.css ?? j.css)).css
		})),
		readOnly: Ce,
		defaults: Ae,
		palette: je,
		keyframes: Me,
		mode: F ? ae : "light"
	}, G = {
		compiler: P.compiler,
		device: E ? "phone" : k
	}, K = o === "styles" && a.style ? nt(N, a.style) : null, q = () => {
		ee("styling/"), be.current?.contentWindow?.location.reload();
	}, J = async () => {
		if (Se && !_e) {
			ve(!0), ye(null);
			try {
				let e = {};
				r.css !== void 0 && r.css !== j.css && (e.css = r.css), r.transition !== void 0 && !jt(r.transition, j.transition) && (e.transition = r.transition), Object.keys(e).length > 0 && await d("styling/update", e), await Promise.all([t.refetch(), n.refetch()]), i(Ot), be.current?.contentWindow?.location.reload();
			} catch (e) {
				ye({
					message: e instanceof Error ? e.message : String(e),
					refused: e instanceof l && e.type === "invalid_input"
				});
			} finally {
				ve(!1);
			}
		}
	}, Ne = {
		faces: j.fonts,
		add: async (e) => {
			try {
				if (e === "google") {
					let e = await D({
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
					return O.success(p("{family} added", { family: t })), q(), {
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
				}), r = t.name.replace(/\.woff2$/i, ""), i = await D({
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
				}), O.success(p("{family} uploaded", { family: a })), q(), {
					family: a,
					fallback: !1
				}) : null;
			} catch (e) {
				return O.error(e), null;
			}
		},
		remove: async (e) => {
			if (await me({
				title: p("Remove {family}?", { family: e }),
				confirm: p("Remove Font"),
				danger: !0
			})) try {
				await d("styling/update", { fonts: j.fonts.filter((t) => t.family !== e) }), q();
			} catch (e) {
				O.error(e);
			}
		},
		preload: async (e, t) => {
			let n = j.fonts.some((t) => t.family === e && t.style !== "italic");
			try {
				await d("styling/update", { fonts: j.fonts.map((r) => r.family === e ? {
					...r,
					preload: t && (!n || r.style !== "italic")
				} : r) }), q();
			} catch (e) {
				O.error(e);
			}
		}
	}, Pe = /* @__PURE__ */ U(V, { children: [
		o === "colors" && /* @__PURE__ */ H(gt, { edit: W }),
		o === "typography" && /* @__PURE__ */ H(yt, {
			edit: W,
			fonts: Ne
		}),
		o === "layout" && /* @__PURE__ */ H(wt, { edit: W }),
		o === "effects" && /* @__PURE__ */ H(Tt, { edit: W }),
		o === "motion" && /* @__PURE__ */ H(Dt, {
			edit: W,
			transition: xe,
			onTransition: (e) => !Ce && i((t) => ({
				...t,
				transition: e
			}))
		}),
		o === "styles" && /* @__PURE__ */ H(tt, {
			edit: W,
			samples: G
		})
	] });
	return /* @__PURE__ */ U("div", {
		className: "flex h-full flex-col",
		children: [
			/* @__PURE__ */ H(pe, {
				crumbs: [
					{
						label: p("Styling"),
						icon: "theme",
						to: o ? "/styling" : void 0
					},
					...o ? [{
						label: At().find((e) => e.value === o)?.label ?? "",
						to: K ? `/styling?tab=${o}` : void 0
					}] : [],
					...K ? [{ label: K }] : []
				],
				actions: /* @__PURE__ */ U(V, { children: [
					o && /* @__PURE__ */ H(_, {
						variant: "ghost",
						icon: "eye",
						"aria-pressed": E,
						onClick: () => ce(!E),
						className: "md:hidden",
						children: p("Preview")
					}),
					/* @__PURE__ */ H("span", {
						className: "max-md:hidden",
						children: /* @__PURE__ */ H(C, {
							size: "xs",
							"aria-label": p("Screen"),
							value: k,
							onChange: ge,
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
					F && /* @__PURE__ */ H(C, {
						size: "xs",
						"aria-label": p("Color Mode"),
						value: ae,
						onChange: oe,
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
					/* @__PURE__ */ H(w, {
						content: p("Open Site"),
						children: /* @__PURE__ */ H(v, {
							icon: "external",
							label: p("Open Site"),
							title: void 0,
							onClick: () => window.open("/", "_blank", "noopener"),
							className: "max-md:hidden"
						})
					})
				] })
			}),
			/* @__PURE__ */ H(S, {
				title: p("Styling"),
				backTo: "/design",
				backLabel: p("Design"),
				step: !0,
				children: /* @__PURE__ */ H("nav", {
					"aria-label": p("Styling"),
					className: "space-y-px px-2 pb-4",
					children: At().map((e) => /* @__PURE__ */ H(de, {
						label: e.label,
						icon: e.icon,
						active: o === e.value,
						onClick: () => s(e.value)
					}, e.value))
				})
			}),
			/* @__PURE__ */ H(ue, {
				dirty: Se,
				saving: _e,
				error: A ? A.refused ? p("The stylesheet was not saved") : A.message : null,
				onSave: () => void J(),
				onDiscard: () => {
					i(Ot), ye(null);
				}
			}),
			/* @__PURE__ */ H(Te, {
				source: P.source ?? n.data,
				children: /* @__PURE__ */ U("div", {
					className: T("grid min-h-0 flex-1 grid-cols-1", o && "md:grid-cols-[minmax(340px,420px)_minmax(0,1fr)] xl:grid-cols-[minmax(380px,460px)_minmax(0,1fr)]"),
					children: [o && /* @__PURE__ */ U("div", {
						ref: L,
						onScroll: (e) => Mt.set(R, e.currentTarget.scrollTop),
						className: T("overflow-y-auto border-border px-4 pb-16 pt-2 md:border-r", E && "max-md:hidden"),
						children: [A?.refused && /* @__PURE__ */ H(le, {
							tone: "danger",
							className: "mb-3 mt-1",
							title: p("Tailwind refused the stylesheet"),
							onDismiss: () => ye(null),
							children: A.message
						}), Pe]
					}), /* @__PURE__ */ H("div", {
						className: T("flex min-w-0 flex-col bg-sunken", o && !E && "max-md:hidden"),
						children: /* @__PURE__ */ H(Pt, {
							frame: be,
							compile: P,
							published: j.stylesheet,
							viewport: E ? "phone" : k,
							mode: F ? ae : null
						})
					})]
				})
			})
		]
	});
}
function Pt(e) {
	let { breakpoints: n } = B();
	return /* @__PURE__ */ H(t, {
		...e,
		desktop: n.find((e) => e.name === "lg")?.width ?? 1024
	});
}
export { Nt as default };
