import { a as e, c as t, d as n, l as r, n as i, s as a, u as o } from "./fields-BRkukm45.js";
import { a as s, c, o as l, r as u, s as d, t as f } from "./parts-BTZNa8Cp.js";
import { CmsError as p, can as m, invalidate as h, run as g, setQuery as ee, t as _, useAbility as te, useLocation as ne } from "@letterncms/sdk";
import { useEffect as v, useMemo as y, useRef as b, useState as x } from "react";
import { Button as re, Icon as ie, IconButton as S, Menu as C, NEW_COLOR as w, Notice as ae, Popover as T, Pressable as E, QueryError as D, SaveBar as O, ScreenSidebar as oe, Segmented as k, SidebarRow as A, Spinner as se, Tooltip as j, Topbar as ce, cn as M, confirm as le, copyText as ue, deviceWidths as N, prompt as P, toast as F, useScreenSidebar as de, useTheme as fe } from "@letterncms/ui";
import { ARTICLE as I, ClassesSection as pe, ColorPicker as me, FIELDS as L, InspectorSection as R, PanelFields as he, Specimen as ge, StateMenu as _e, StylePanels as ve, Stylesheet as ye, StylingProvider as be, lightDark as z, loadCompiler as xe, loadEngine as B, loadTailwindTheme as Se, parseClass as Ce, screenFor as we, styleApi as Te, styleLabel as V, styleSample as Ee, themeDefaults as De, useSpecimenSheet as H, useStyling as U, withVariants as W } from "@letterncms/blocks";
import { Fragment as G, jsx as K, jsxs as q } from "react/jsx-runtime";
// admin/src/preview.tsx
var Oe = {
	desktop: "100%",
	tablet: `${N.tablet}px`,
	phone: `${N.phone}px`
};
function ke(e, t) {
	let [n, r] = x({
		source: void 0,
		compiler: null,
		problem: null
	}), i = b({
		base: e,
		css: t
	});
	i.current = {
		base: e,
		css: t
	};
	let a = b(!1), o = b({}), s = b(!1), c = b(!0);
	v(() => (c.current = !0, () => {
		c.current = !1;
	}), []);
	let l = !!n.source;
	return v(() => {
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
							let n = await xe(t);
							if (n.build(e.base.candidates), !await B(t)) throw Error(_("Tailwind could not read the stylesheet."));
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
function Ae({ viewport: e, desktop: t, children: n }) {
	let r = b(null), [i, a] = x({
		width: 0,
		height: 0
	});
	v(() => {
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
	let o = e === "desktop" ? Math.max(i.width, t) : parseFloat(Oe[e]), s = i.width ? Math.min(1, i.width / o) : 1;
	return /* @__PURE__ */ K("div", {
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
var je = "cms-styling-draft";
function Me(e, t, n, r) {
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
	let l = e.getElementById(je);
	l || (l = e.createElement("style"), l.id = je, o[0] ? o[0].after(l) : e.head.appendChild(l)), l.textContent !== c && (l.textContent = c);
	for (let e of o) e.disabled = !0;
}
function Ne({ frame: e, compile: t, published: n, viewport: r, desktop: i, mode: a, bordered: o }) {
	let [s, c] = x(0);
	return v(() => Me(e.current?.contentDocument, t, n, a), [
		e,
		t,
		n,
		a,
		s
	]), /* @__PURE__ */ q("div", {
		className: "relative flex min-h-0 flex-1 flex-col",
		children: [/* @__PURE__ */ K(Ae, {
			viewport: r,
			desktop: i,
			children: (t) => /* @__PURE__ */ K("iframe", {
				ref: e,
				src: "/",
				title: _("Site Preview"),
				className: M("border-0 bg-bg", o && "border-x border-border"),
				style: t,
				onLoad: () => c((e) => e + 1)
			})
		}), t.problem && /* @__PURE__ */ K("div", {
			className: "absolute inset-x-3 top-3 rounded-lg bg-bg shadow-raise",
			children: /* @__PURE__ */ K(ae, {
				tone: "warning",
				title: _("Tailwind can’t read the stylesheet"),
				children: t.problem
			})
		})]
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
		label: _("Page"),
		node: {
			tag: "p",
			text: _("Page")
		},
		groups: ["typography", "fill"]
	},
	{
		selector: "::selection",
		label: _("Selection"),
		node: {
			tag: "span",
			text: _("Selection")
		},
		groups: ["typography", "fill"]
	},
	{
		selector: ":focus-visible",
		label: _("Focus Ring"),
		node: {
			tag: "span",
			text: _("Focus Ring"),
			className: "inline-block rounded-sm px-2"
		},
		groups: ["border", "effects"]
	},
	{
		selector: "hr",
		label: _("Divider"),
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
		label: _("Heading 1"),
		node: {
			tag: "h1",
			text: _("Heading 1")
		}
	},
	{
		selector: "h2",
		label: _("Heading 2"),
		node: {
			tag: "h2",
			text: _("Heading 2")
		}
	},
	{
		selector: "h3",
		label: _("Heading 3"),
		node: {
			tag: "h3",
			text: _("Heading 3")
		}
	},
	{
		selector: "h4",
		label: _("Heading 4"),
		node: {
			tag: "h4",
			text: _("Heading 4")
		}
	},
	{
		selector: "h5",
		label: _("Heading 5"),
		node: {
			tag: "h5",
			text: _("Heading 5")
		}
	},
	{
		selector: "h6",
		label: _("Heading 6"),
		node: {
			tag: "h6",
			text: _("Heading 6")
		}
	},
	{
		selector: "p",
		label: _("Paragraph"),
		node: {
			tag: "p",
			text: _("Paragraph")
		}
	},
	{
		selector: "a",
		label: _("Link"),
		node: {
			tag: "a",
			text: _("Link"),
			attributes: { href: "#" }
		}
	},
	{
		selector: "strong",
		label: _("Bold"),
		node: {
			tag: "strong",
			text: _("Bold")
		}
	},
	{
		selector: "small",
		label: _("Small"),
		node: {
			tag: "small",
			text: _("Small")
		}
	},
	{
		selector: "blockquote",
		label: _("Quote"),
		node: {
			tag: "blockquote",
			text: _("Quote")
		}
	},
	{
		selector: "code",
		label: _("Code"),
		node: {
			tag: "code",
			text: _("Code")
		}
	},
	{
		selector: "figcaption",
		label: _("Caption"),
		node: {
			tag: "figcaption",
			text: _("Caption")
		}
	}
], J = (e) => ({
	tag: "div",
	text: "",
	markup: `<div class="cms-prose">${e}</div>`
}), Be = () => [
	{
		key: "h2",
		selector: I.h2,
		label: _("Heading 2"),
		node: J(`<h2 style="margin:0">${_("Heading 2")}</h2>`)
	},
	{
		key: "h3",
		selector: I.h3,
		label: _("Heading 3"),
		node: J(`<h3 style="margin:0">${_("Heading 3")}</h3>`)
	},
	{
		key: "p",
		selector: I.p,
		label: _("Paragraph"),
		node: J(`<p style="margin:0">${_("Paragraph")}</p>`)
	},
	{
		key: "li",
		selector: I.li,
		label: _("List Item"),
		node: J(`<ul><li>${_("List Item")}</li></ul>`)
	},
	{
		key: "blockquote",
		selector: I.blockquote,
		label: _("Quote"),
		node: J(`<blockquote style="margin:0">${_("Quote")}</blockquote>`)
	},
	{
		key: "figure",
		selector: I.figure,
		label: _("Figure"),
		node: J(`<figure style="margin:0">${_("Figure")}</figure>`),
		groups: [
			"spacing",
			"border",
			"effects"
		]
	},
	{
		key: "a",
		selector: I.a,
		label: _("Link"),
		node: J(`<p><a href="#">${_("Link")}</a></p>`)
	}
];
function Ve(e, t) {
	return !e || t.length === 0 ? !1 : t.every((t) => {
		let n = e.declarations(Pe(Ce(t).utility));
		return !!n && n.every((e) => /^(font|text-(?!indent)|letter|line-height|color$|white-space|word|overflow-wrap|hyphens|--tw-(font|leading|tracking|ordinal|slashed|numeric|text))/.test(e.property));
	});
}
function He(e, t, n) {
	let r = (e) => {
		let { variants: r, utility: i } = Ce(e);
		return Pe(i) === t ? W(r, i.replace(t, n)) : e;
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
	let o = Ue((await P({
		title: n,
		fields: [{
			handle: "name",
			type: "text",
			label: _("Name"),
			placeholder: i ? "outline" : "lead",
			required: !0,
			autofocus: !0
		}],
		values: { name: a ? V(a) : "" },
		confirm: r
	}))?.name);
	if (!o) return null;
	let s = `${i}${o}`;
	return s === a ? null : /^[a-z][a-z0-9-]*$/.test(s) ? t.includes(s) || e?.valid(s) ? (F.error(_("There is already a style “{name}”.", { name: V(s) })), null) : s : (F.error(_("A name is lowercase letters, numbers and hyphens, and starts with a letter.")), null);
}
function Ge({ edit: e, samples: t, label: n, name: r, node: i, classes: a, groups: o, write: s, onBack: c, menu: l }) {
	let u = U(), [d, f] = x([]), p = y(() => we(t.device, 1280, u.breakpoints), [t.device, u.breakpoints]), m = Te(u.engine, a, p, d, e.readOnly ? () => {} : s), h = Ie(e.sheet), g = H(t.compiler, [
		...Fe(h),
		...a.map((e) => Pe(Ce(e).utility)),
		...a,
		...Fe(i.className ?? "")
	]);
	return /* @__PURE__ */ q("div", {
		className: "-mx-4 -mt-2",
		children: [
			/* @__PURE__ */ K(Ke, {
				label: n,
				name: r,
				onBack: c,
				menu: l,
				children: /* @__PURE__ */ K(_e, {
					classes: a,
					engine: u.engine,
					state: d,
					onState: f
				})
			}),
			/* @__PURE__ */ K("div", {
				className: "border-b border-border p-4",
				children: /* @__PURE__ */ K(ge, {
					sheet: g,
					node: i,
					page: h,
					mode: e.mode,
					align: "center",
					className: "h-28 rounded-md border border-border"
				})
			}),
			/* @__PURE__ */ q("div", {
				inert: e.readOnly,
				children: [/* @__PURE__ */ K(ve, {
					s: m,
					groups: o
				}), /* @__PURE__ */ K(pe, {
					s: m,
					site: u.classes,
					disabled: e.readOnly
				})]
			})
		]
	});
}
function Ke({ label: e, name: t, onBack: n, menu: r, children: i }) {
	return /* @__PURE__ */ q("div", {
		className: "flex h-10 items-center gap-1 border-b border-border px-2",
		children: [
			/* @__PURE__ */ K(re, {
				variant: "ghost",
				size: "sm",
				icon: "arrow-left",
				onClick: n,
				className: "min-w-0 shrink !justify-start !px-2",
				children: /* @__PURE__ */ K("span", {
					className: "truncate",
					children: e
				})
			}),
			t && /* @__PURE__ */ K(j, {
				content: _("Copy Name"),
				children: /* @__PURE__ */ K(re, {
					variant: "ghost",
					size: "xs",
					onClick: () => void ue(t, { copied: _("Copied {reference}", { reference: t }) }),
					className: "min-w-0 shrink !px-1 font-mono !font-normal !text-faint hover:!text-text",
					children: /* @__PURE__ */ K("span", {
						className: "truncate",
						children: t
					})
				})
			}),
			/* @__PURE__ */ K("span", { className: "flex-1" }),
			i,
			r && r.length > 0 && /* @__PURE__ */ K(C, {
				align: "end",
				trigger: /* @__PURE__ */ K(S, {
					icon: "more",
					label: _("Style Actions"),
					size: "xs"
				}),
				items: r
			})
		]
	});
}
var Y = (e, t) => ({
	property: e,
	label: t,
	field: {
		type: "color",
		component: "blocks-color"
	}
}), X = (e, t, n = "px", r = ["px", "rem"]) => ({
	property: e,
	label: t,
	field: {
		component: "blocks-value",
		unit: n,
		units: r,
		min: 0,
		step: n === "px" ? 1 : .125
	}
}), qe = () => ({
	"var(--font-weight-normal)": _("Regular"),
	"var(--font-weight-medium)": _("Medium"),
	"var(--font-weight-semibold)": _("Semibold"),
	"var(--font-weight-bold)": _("Bold")
}), Je = () => [
	{
		key: "form:fields",
		label: _("Fields"),
		selector: L,
		layer: "base",
		sample: {
			tag: "div",
			text: "",
			markup: "<input class=\"cms-input\" placeholder=\"you@example.com\" tabindex=\"-1\" style=\"width:16rem\">"
		},
		sections: [
			{
				title: _("Field"),
				values: [
					Y("--field-background", _("Fill")),
					Y("--field-color", _("Text")),
					Y("--field-placeholder", _("Placeholder")),
					X("--field-border-width", _("Border")),
					Y("--field-border-color", _("Border Color")),
					X("--field-radius", _("Radius"), "rem", ["rem", "px"]),
					{
						property: "--field-shadow",
						label: _("Shadow"),
						field: { component: "site-shadow" }
					}
				]
			},
			{
				title: _("Pointed At"),
				values: [Y("--field-hover-background", _("Fill")), Y("--field-hover-border-color", _("Border Color"))]
			},
			{
				title: _("Focus"),
				values: [
					Y("--field-focus-background", _("Fill")),
					Y("--field-focus-border-color", _("Border Color")),
					Y("--field-focus-ring-color", _("Ring")),
					X("--field-focus-ring-width", _("Ring Width"))
				]
			},
			{
				title: _("Error"),
				values: [Y("--field-invalid-color", _("Color"))]
			}
		]
	},
	{
		key: "form:labels",
		label: _("Labels"),
		selector: L,
		layer: "base",
		sample: {
			tag: "div",
			text: "",
			markup: `<div class="cms-field"><label class="cms-label">${_("Email")}</label><p class="cms-help">${_("We never share it.")}</p></div>`
		},
		sections: [
			{
				title: _("Label"),
				values: [
					{
						property: "--field-label-font-size",
						label: _("Size"),
						field: { component: "site-size" }
					},
					{
						property: "--field-label-font-weight",
						label: _("Weight"),
						field: {
							type: "select",
							options: qe()
						}
					},
					Y("--field-label-color", _("Color"))
				]
			},
			{
				title: _("Help"),
				values: [{
					property: "--field-help-font-size",
					label: _("Size"),
					field: { component: "site-size" }
				}, Y("--field-help-color", _("Color"))]
			},
			{
				title: _("Spacing"),
				values: [X("--field-spacing-fields", _("Between Fields"), "rem", ["rem", "px"]), X("--field-spacing-label", _("Under Label"), "rem", ["rem", "px"])]
			}
		]
	},
	{
		key: "form:choices",
		label: _("Choices"),
		selector: L,
		layer: "base",
		sample: {
			tag: "div",
			text: "",
			markup: Ye()
		},
		sections: [
			{
				title: _("Checkbox"),
				values: [
					X("--field-checkbox-size", _("Size"), "rem", ["rem", "px"]),
					X("--field-checkbox-radius", _("Radius")),
					Y("--field-checkbox-checked", _("Checked")),
					Y("--field-checkbox-mark-color", _("Mark"))
				]
			},
			{
				title: _("Radio Button"),
				values: [Y("--field-radio-checked", _("Checked"))]
			},
			{
				title: _("Switch"),
				values: [Y("--field-switch-off", _("Off")), Y("--field-switch-on", _("On"))]
			}
		]
	}
], Ye = () => `<div style="display:flex;gap:1rem;white-space:nowrap"><label class="cms-choice"><input type="checkbox" class="cms-check" checked tabindex="-1"> ${_("Newsletter")}</label><label class="cms-choice"><input type="radio" class="cms-radio" checked tabindex="-1"> ${_("Lunch")}</label><label class="cms-choice"><input type="checkbox" role="switch" class="cms-switch" checked tabindex="-1"> ${_("Reminders")}</label></div>`, Xe = () => ({
	tag: "form",
	text: "",
	markup: `<div class="cms-form" style="white-space:normal">
<div class="cms-field"><label class="cms-label">${_("Email")}</label><input class="cms-input" placeholder="you@example.com" tabindex="-1"><p class="cms-help">${_("We never share it.")}</p></div>
<div class="cms-field"><select class="cms-input" tabindex="-1"><option>${_("Dinner for two")}</option></select></div>
${Ye()}
</div>`
}), Ze = () => ({
	key: "article:spacing",
	label: _("Spacing in Articles"),
	selector: I.spacing,
	layer: "components",
	sample: J(`<h2 style="margin:0">${_("Heading 2")}</h2><p>${_("Paragraph")}</p><p>${_("Paragraph")}</p><ul><li>${_("List Item")}</li><li>${_("List Item")}</li></ul>`),
	sections: [{
		title: "spacing",
		values: [
			X("--prose-blocks", _("Blocks"), "em", [
				"em",
				"rem",
				"px"
			]),
			X("--prose-headings", _("Above Headings"), "em", [
				"em",
				"rem",
				"px"
			]),
			X("--prose-after-headings", _("Below Headings"), "em", [
				"em",
				"rem",
				"px"
			]),
			X("--prose-items", _("List Items"), "em", [
				"em",
				"rem",
				"px"
			])
		]
	}]
});
function Qe({ edit: e, samples: t, part: n, onBack: r }) {
	let { source: i } = U(), a = y(() => new ye(i?.files.cms ?? ""), [i?.files.cms]), o = Ie(e.sheet), s = H(t.compiler, Fe(o)), c = (t) => e.sheet.property(n.selector, t, n.layer), l = n.layer === "base" ? Xe() : n.sample;
	return /* @__PURE__ */ q("div", {
		className: "-mx-4 -mt-2",
		children: [
			/* @__PURE__ */ K(Ke, {
				label: n.label,
				onBack: r,
				menu: $e(e, n)
			}),
			/* @__PURE__ */ K("div", {
				className: "border-b border-border p-4",
				children: /* @__PURE__ */ K(ge, {
					sheet: s,
					node: l,
					page: o,
					mode: e.mode,
					align: "center",
					className: "h-64 rounded-md border border-border"
				})
			}),
			/* @__PURE__ */ K("div", {
				inert: e.readOnly,
				children: n.sections.map((t) => {
					let r = /* @__PURE__ */ K(he, {
						fields: t.values.map((t) => ({
							handle: t.property,
							type: "text",
							size: "sm",
							label: t.label,
							...t.field,
							status: c(t.property) === void 0 ? void 0 : "own",
							reset: () => e.change((e) => e.setProperty(n.selector, t.property, null, n.layer))
						})),
						values: Object.fromEntries(t.values.map((e) => [e.property, c(e.property) ?? a.property(n.selector, e.property, n.layer) ?? null])),
						onChange: (t, r) => e.change((e) => e.setProperty(n.selector, t, r == null || r === "" ? null : String(r), n.layer))
					});
					return n.sections.length === 1 ? /* @__PURE__ */ K("div", {
						className: "space-y-1 px-4 py-3",
						children: r
					}, t.title) : /* @__PURE__ */ K(R, {
						title: t.title,
						children: r
					}, t.title);
				})
			})
		]
	});
}
function $e(e, t) {
	let n = t.sections.flatMap((e) => e.values);
	return e.readOnly || !n.some((n) => e.sheet.property(t.selector, n.property, t.layer) !== void 0) ? [] : [{
		label: _("Reset"),
		icon: "undo",
		onSelect: () => e.change((e) => n.reduce((e, n) => e.setProperty(t.selector, n.property, null, t.layer), e))
	}];
}
function et({ edit: e, samples: t }) {
	let { engine: n } = U(), r = ne().query.style ?? "", i = (e) => ee({
		style: e,
		tab: "styles"
	}, !1), [a, o] = x(null), l = [...e.sheet.elements(), ...e.sheet.elements("components")], d = (e) => l.find((t) => t.name === e)?.classes ?? [], f = e.sheet.utilities().filter((e) => /^[a-z][\w-]*$/.test(e.name) && !e.name.startsWith("scheme-")), p = f.filter((e) => e.name.startsWith("btn-")), m = f.filter((e) => !e.name.startsWith("btn-")), h = m.filter((e) => Ve(n, e.classes) || a?.name === e.name && a.text), g = m.filter((e) => !h.includes(e)), te = Ie(e.sheet), v = H(t.compiler, [
		...Fe(te),
		...d("::selection"),
		...d(":focus-visible"),
		...Re().flatMap((e) => Fe(e.node.className ?? "")),
		...f.map((e) => e.name)
	]), y = e.sheet.utilities().map((e) => e.name), b = (e) => ["::selection", ":focus-visible"].includes(e.selector) ? {
		...e.node,
		className: [e.node.className, ...d(e.selector)].filter(Boolean).join(" ")
	} : e.node, re = async (t) => {
		let r = await We(n, y, _(t === "button" ? "New Button" : "New Style"), _(t === "button" ? "Create Button" : "Create Style"), t === "button" ? "btn-" : "");
		r && (t === "button" && p[0] ? e.change((e) => e.duplicateUtility(p[0].name, r)) : e.change((e) => e.setUtility(r, t === "text" ? ["text-base"] : t === "box" ? ["p-6"] : ["inline-flex"])), o({
			name: r,
			text: t === "text"
		}), i(r));
	}, ie = async (t) => {
		let a = await We(n, y, _("Rename"), _("Rename"), t.startsWith("btn-") ? "btn-" : "", t);
		a && (e.change((e) => He(e, t, a)), r === t && i(a));
	}, w = async (t) => {
		let r = await We(n, y, _("Duplicate"), _("Duplicate"), t.startsWith("btn-") ? "btn-" : "");
		r && e.change((e) => e.duplicateUtility(t, r));
	}, ae = async (t) => {
		await le({
			title: _("Delete “{name}”?", { name: V(t) }),
			confirm: _("Delete"),
			danger: !0
		}) && (e.change((e) => e.removeUtility(t)), r === t && i(null));
	}, T = (t) => e.readOnly ? [] : [
		{
			label: _("Rename…"),
			icon: "edit",
			onSelect: () => void ie(t)
		},
		{
			label: _("Duplicate…"),
			icon: "copy",
			onSelect: () => void w(t)
		},
		{
			separator: !0,
			label: ""
		},
		{
			label: _("Delete"),
			icon: "trash",
			danger: !0,
			onSelect: () => void ae(t)
		}
	], E = (t, n = "base") => e.readOnly || d(t).length === 0 ? [] : [{
		label: _("Reset"),
		icon: "undo",
		onSelect: () => e.change((e) => e.removeElement(t, n))
	}], D = [...Re(), ...ze()].find((e) => `element:${e.selector}` === r);
	if (D) return /* @__PURE__ */ K(Ge, {
		edit: e,
		samples: t,
		label: D.label,
		node: b(D),
		classes: d(D.selector),
		groups: D.groups ?? Le,
		onBack: () => i(null),
		menu: E(D.selector),
		write: (t) => e.change((e) => e.setElement(D.selector, t))
	}, r);
	let O = Be().find((e) => `article:${e.key}` === r);
	if (O) return /* @__PURE__ */ K(Ge, {
		edit: e,
		samples: t,
		label: _("{name} in Articles", { name: O.label }),
		node: O.node,
		classes: d(O.selector),
		groups: O.groups ?? Le,
		onBack: () => i(null),
		menu: E(O.selector, "components"),
		write: (t) => e.change((e) => e.setElement(O.selector, t, "components"))
	}, r);
	let oe = [...Je(), Ze()].find((e) => e.key === r);
	if (oe) return /* @__PURE__ */ K(Qe, {
		edit: e,
		samples: t,
		part: oe,
		onBack: () => i(null)
	}, r);
	let k = f.find((e) => e.name === r);
	if (k) return /* @__PURE__ */ K(Ge, {
		edit: e,
		samples: t,
		label: V(k.name),
		name: k.name,
		node: Ee(k.name),
		classes: k.classes,
		groups: h.includes(k) ? Le : void 0,
		onBack: () => i(null),
		menu: T(k.name),
		write: (t) => e.change((e) => t.length > 0 || e.utilities().find((e) => e.name === k.name)?.custom ? e.setUtility(k.name, t) : e.removeUtility(k.name))
	}, r);
	let A = (t, n, r, a, o = !1) => /* @__PURE__ */ K(s, {
		onOpen: () => i(t),
		sample: /* @__PURE__ */ K(ge, {
			sheet: v,
			node: r,
			page: te,
			mode: e.mode,
			className: o ? "h-14 min-w-0 flex-1 rounded-sm" : "h-11 min-w-0 flex-1 rounded-sm"
		}),
		label: /* @__PURE__ */ K("span", {
			className: "sr-only",
			children: n
		}),
		menu: a.length ? /* @__PURE__ */ K(C, {
			trigger: /* @__PURE__ */ K(S, {
				icon: "more",
				label: _("Style Actions"),
				size: "xs",
				className: c
			}),
			items: a
		}) : void 0
	}, t), se = (t) => e.readOnly ? void 0 : () => void re(t);
	return /* @__PURE__ */ q(G, { children: [
		/* @__PURE__ */ K(u, {
			title: _("Page"),
			children: Re().map((e) => A(`element:${e.selector}`, e.label, b(e), E(e.selector)))
		}),
		/* @__PURE__ */ q(u, {
			title: _("Text"),
			onAdd: se("text"),
			addLabel: _("New Text Style"),
			children: [ze().map((e) => A(`element:${e.selector}`, e.label, e.node, E(e.selector), e.selector.startsWith("h"))), h.map((e) => A(e.name, V(e.name), Ee(e.name), T(e.name), !0))]
		}),
		/* @__PURE__ */ K(u, {
			title: _("Buttons"),
			onAdd: se("button"),
			addLabel: _("New Button"),
			children: p.map((e) => A(e.name, V(e.name), Ee(e.name), T(e.name), !0))
		}),
		/* @__PURE__ */ K(u, {
			title: _("Forms"),
			children: Je().map((t) => A(t.key, t.label, t.sample, $e(e, t), !0))
		}),
		/* @__PURE__ */ q(u, {
			title: _("Articles"),
			children: [/* @__PURE__ */ K(s, {
				onOpen: () => i("article:spacing"),
				label: _("Spacing"),
				summary: "",
				menu: $e(e, Ze()).length ? /* @__PURE__ */ K(C, {
					trigger: /* @__PURE__ */ K(S, {
						icon: "more",
						label: _("Style Actions"),
						size: "xs",
						className: c
					}),
					items: $e(e, Ze())
				}) : void 0
			}), Be().map((e) => A(`article:${e.key}`, e.label, e.node, E(e.selector, "components"), [
				"h2",
				"h3",
				"blockquote"
			].includes(e.key)))]
		}),
		/* @__PURE__ */ K(u, {
			title: _("Boxes"),
			onAdd: se("box"),
			addLabel: _("New Style"),
			children: g.map((e) => A(e.name, V(e.name), {
				...Ee(e.name),
				className: `${e.name} inline-block`
			}, T(e.name), !0))
		})
	] });
}
// admin/src/theme.tsx
function tt(e, t, n = () => !1) {
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
var nt = (e) => String(e ?? "").trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/^-+|-+$/g, "");
async function rt(e, t, n, r, i = "", a = "md") {
	let o = nt((await P({
		title: n,
		fields: [{
			handle: "name",
			type: "text",
			label: _("Name"),
			mono: !0,
			autofocus: !0,
			required: !0,
			placeholder: a
		}],
		values: { name: i },
		confirm: r
	}))?.name);
	return !o || o === i ? null : e.sheet.variable(`${t}${o}`) !== void 0 || e.defaults.has(`${t}${o}`) ? (F.error(_("“{name}” already exists", { name: o })), null) : o;
}
function it(e, t, n, r) {
	let i = n.name.slice(0, n.name.length - n.key.length) + r, a = RegExp(`^(!?.*-)${n.key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}((?:/[^!]+)?!?)$`), o = (e) => {
		let { variants: i, utility: o } = Ce(e), s = a.exec(o);
		return !s || !t?.declarations(o.replace(/^!|!$/g, ""))?.some((e) => e.value.includes(`var(${n.name})`)) ? e : W(i, `${s[1]}${r}${s[2]}`);
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
var at = (e, t) => e.variables().filter((e) => e.name === t || e.name.startsWith(`${t}--`)).reduce((e, t) => e.setVariable(t.name, null), e);
function ot(e, t) {
	let { engine: n } = U();
	return (r, i = []) => e.readOnly ? [] : r.builtIn ? [...i, ...r.written ? [...i.length ? [{
		separator: !0,
		label: ""
	}] : [], {
		label: _("Reset"),
		icon: "undo",
		onSelect: () => e.change((e) => at(e, r.name))
	}] : []] : [
		{
			label: _("Rename…"),
			icon: "edit",
			onSelect: async () => {
				let i = await rt(e, t.prefix, _("Rename"), _("Rename"), r.key, t.placeholder);
				i && e.change((e) => it(e, n, r, i));
			}
		},
		...i,
		{
			separator: !0,
			label: ""
		},
		{
			label: _("Delete"),
			icon: "trash",
			danger: !0,
			onSelect: () => e.change((e) => at(e, r.name))
		}
	];
}
function Z({ edit: e, kind: t, row: n }) {
	let r = ot(e, t), i = async () => {
		let n = await rt(e, t.prefix, t.fresh, t.add, "", t.placeholder);
		n && e.change((e) => e.setVariable(`${t.prefix}${n}`, t.start));
	};
	return /* @__PURE__ */ K(u, {
		title: t.title,
		onAdd: e.readOnly ? void 0 : () => void i(),
		addLabel: t.add,
		children: tt(e, t.prefix, t.skip).map((t) => n(t, (n) => n !== null && e.change((e) => e.setVariable(t.name, n)), (e) => r(t, e)))
	});
}
var Q = (e, t = {}) => ({
	component: "blocks-value",
	unit: e,
	...t
}), st = { component: "site-size" }, ct = Q("rem", {
	units: [
		"rem",
		"px",
		"em"
	],
	step: .125,
	min: 0
}), $ = "w-[108px] shrink-0 max-sm:order-3 max-sm:w-auto max-sm:min-w-0 max-sm:flex-1 max-sm:basis-[40%]", lt = /^(.+)-(\d{2,3})$/;
function ut({ edit: e, row: t }) {
	let [n, r] = x(!1), i = /* @__PURE__ */ K(E, {
		compact: !0,
		"aria-label": t.key,
		disabled: e.readOnly,
		className: M("relative h-6 min-w-0 flex-1 outline-offset-1 transition-transform duration-fast first:rounded-l-xs last:rounded-r-xs hover:z-raised hover:scale-y-125 hover:shadow-pop hover:ring-2 hover:ring-float", n && "z-raised ring-2 ring-focus"),
		style: { background: z(t.value).light },
		children: t.written && /* @__PURE__ */ K("span", {
			className: "absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-edge",
			"aria-hidden": !0
		})
	});
	return /* @__PURE__ */ K(T, {
		open: n,
		onOpenChange: r,
		align: "start",
		className: "w-64 !p-0",
		trigger: /* @__PURE__ */ K("span", {
			className: "flex min-w-0 flex-1",
			children: /* @__PURE__ */ K(j, {
				content: t.key,
				children: i
			})
		}),
		children: /* @__PURE__ */ K(me, {
			label: t.key,
			value: t.value,
			onChange: (n) => e.change((e) => n === null ? at(e, t.name) : e.setVariable(t.name, n))
		})
	});
}
var dt = "scheme-";
function ft(e) {
	return e.utilities().filter((e) => e.name.startsWith(dt) && e.classes.includes("scheme")).map((t) => {
		let n = new Map(e.utilityProperties(t.name).map((e) => [e.name, e.value]));
		return {
			name: t.name,
			key: t.name.slice(7),
			background: n.get("--scheme") ?? "transparent",
			text: n.get("--scheme-text") ?? "currentColor"
		};
	});
}
var pt = (e) => /^transparent$|\/\s*(0?\.\d+|\d{1,2}(\.\d+)?%)\s*\)$/.test(e.trim()), mt = (e, t, n, r) => e.writeUtility(t, [{
	name: "--scheme",
	value: n
}, {
	name: "--scheme-text",
	value: r
}], ["scheme"]);
function ht({ edit: e }) {
	let { engine: t } = U(), n = ft(e.sheet), r = (n) => t ? z(t.resolve(n))[e.mode === "dark" ? "dark" : "light"] ?? z(t.resolve(n)).light : n, i = async () => {
		let t = nt((await P({
			title: _("New Scheme"),
			fields: [{
				handle: "name",
				type: "text",
				label: _("Name"),
				mono: !0,
				autofocus: !0,
				required: !0,
				placeholder: "ocean"
			}],
			confirm: _("Add Scheme")
		}))?.name);
		if (t) {
			if (n.some((e) => e.key === t)) return void F.error(_("“{name}” already exists", { name: t }));
			e.change((e) => mt(e, `${dt}${t}`, "var(--color-foreground)", "var(--color-background)"));
		}
	}, a = async (t) => {
		let r = nt((await P({
			title: _("Rename"),
			fields: [{
				handle: "name",
				type: "text",
				label: _("Name"),
				mono: !0,
				autofocus: !0,
				required: !0
			}],
			values: { name: t.key },
			confirm: _("Rename")
		}))?.name);
		if (r && r !== t.key) {
			if (n.some((e) => e.key === r)) return void F.error(_("“{name}” already exists", { name: r }));
			e.change((e) => e.renameUtility(t.name, `${dt}${r}`));
		}
	};
	return /* @__PURE__ */ q(u, {
		title: _("Schemes"),
		onAdd: e.readOnly ? void 0 : () => void i(),
		addLabel: _("Add Scheme"),
		children: [n.length > 0 && /* @__PURE__ */ q("div", {
			className: "flex min-h-8 items-center gap-2 border-b border-border text-2xs text-faint max-sm:hidden",
			children: [
				/* @__PURE__ */ K("span", { className: "min-w-0 flex-1" }),
				/* @__PURE__ */ K("span", {
					className: $,
					children: _("Background")
				}),
				/* @__PURE__ */ K("span", {
					className: $,
					children: _("Text")
				}),
				/* @__PURE__ */ K("span", { className: "size-6 shrink-0" })
			]
		}), n.map((t) => /* @__PURE__ */ q(d, {
			name: t.key,
			copy: t.name,
			wide: !0,
			sample: /* @__PURE__ */ K("span", {
				className: M("grid size-6 overflow-hidden rounded-xs shadow-edge", pt(r(t.background)) && "cms-checkerboard"),
				children: /* @__PURE__ */ K("span", {
					className: "grid place-items-center text-xs font-semibold",
					style: {
						background: r(t.background),
						color: r(t.text),
						textShadow: pt(r(t.background)) ? "0 0 3px rgb(0 0 0 / 0.7)" : void 0
					},
					children: "Aa"
				})
			}),
			menu: e.readOnly ? [] : [
				{
					label: _("Rename…"),
					icon: "edit",
					onSelect: () => void a(t)
				},
				{
					separator: !0,
					label: ""
				},
				{
					label: _("Delete"),
					icon: "trash",
					danger: !0,
					onSelect: () => e.change((e) => e.removeUtility(t.name))
				}
			],
			children: [/* @__PURE__ */ K("div", {
				className: $,
				children: /* @__PURE__ */ K(f, {
					handle: `${t.name}:background`,
					label: _("{name} Background", { name: t.key }),
					value: t.background,
					disabled: e.readOnly,
					field: {
						type: "color",
						component: "blocks-color"
					},
					onChange: (n) => n && e.change((e) => mt(e, t.name, n, t.text))
				})
			}), /* @__PURE__ */ K("div", {
				className: $,
				children: /* @__PURE__ */ K(f, {
					handle: `${t.name}:text`,
					label: _("{name} Text", { name: t.key }),
					value: t.text,
					disabled: e.readOnly,
					field: {
						type: "color",
						component: "blocks-color"
					},
					onChange: (n) => n && e.change((e) => mt(e, t.name, t.background, n))
				})
			})]
		}, t.name))]
	});
}
function gt({ edit: e }) {
	let t = {
		prefix: "--color-",
		title: _("Colors"),
		add: _("Add Color"),
		fresh: _("New Color"),
		start: w,
		placeholder: "brand"
	}, n = ot(e, t), r = tt(e, t.prefix), i = (t) => t.builtIn && e.palette.has(t.name), a = r.filter((e) => !i(e)), o = /* @__PURE__ */ new Map();
	for (let e of r.filter(i)) {
		let t = lt.exec(e.key)?.[1];
		t && o.set(t, [...o.get(t) ?? [], e]);
	}
	let s = async () => {
		let n = await rt(e, t.prefix, t.fresh, t.add, "", t.placeholder);
		n && e.change((e) => e.setVariable(`${t.prefix}${n}`, t.start));
	}, c = (t, n, r) => e.change((e) => e.setVariable(t.name, r && r !== n ? `light-dark(${n}, ${r})` : n));
	return /* @__PURE__ */ q(G, { children: [
		/* @__PURE__ */ q(u, { children: [/* @__PURE__ */ q("div", {
			className: "flex min-h-9 items-center gap-2 border-b border-border text-2xs text-faint max-sm:flex-wrap max-sm:py-1",
			children: [
				/* @__PURE__ */ K("span", {
					className: "min-w-0 flex-1 max-sm:order-1 max-sm:basis-[calc(100%-2.5rem)]",
					children: _("Name")
				}),
				/* @__PURE__ */ q("span", {
					className: M($, "flex items-center gap-1"),
					children: [/* @__PURE__ */ K(ie, {
						name: "sun",
						size: 11
					}), _("Light")]
				}),
				/* @__PURE__ */ q("span", {
					className: M($, "flex items-center gap-1"),
					children: [/* @__PURE__ */ K(ie, {
						name: "moon",
						size: 11
					}), _("Dark")]
				}),
				e.readOnly ? /* @__PURE__ */ K("span", { className: "size-6 shrink-0 max-sm:order-2" }) : /* @__PURE__ */ K(j, {
					content: t.add,
					children: /* @__PURE__ */ K(S, {
						icon: "plus",
						label: t.add,
						title: void 0,
						size: "xs",
						className: "shrink-0 max-sm:order-2",
						onClick: () => void s()
					})
				})
			]
		}), a.map((t) => {
			let { light: r, dark: i } = z(t.value);
			return /* @__PURE__ */ q(d, {
				name: t.key,
				wide: !0,
				menu: n(t),
				children: [/* @__PURE__ */ K("div", {
					className: $,
					children: /* @__PURE__ */ K(f, {
						handle: `${t.name}:light`,
						label: _("{name} in Light Mode", { name: t.key }),
						value: r,
						disabled: e.readOnly,
						field: {
							type: "color",
							component: "blocks-color"
						},
						onChange: (e) => e && c(t, e, i)
					})
				}), /* @__PURE__ */ K("div", {
					className: $,
					children: /* @__PURE__ */ K(f, {
						handle: `${t.name}:dark`,
						label: _("{name} in Dark Mode", { name: t.key }),
						value: i ?? null,
						disabled: e.readOnly,
						field: {
							type: "color",
							component: "blocks-color",
							placeholder: _("Same"),
							swatch: r
						},
						onChange: (e) => c(t, r, e ?? void 0)
					})
				})]
			}, t.name);
		})] }),
		/* @__PURE__ */ K(ht, { edit: e }),
		o.size > 0 && /* @__PURE__ */ K(u, {
			title: _("Palette"),
			children: /* @__PURE__ */ K("div", {
				className: "space-y-1.5 py-2",
				children: [...o].filter(([e]) => e).map(([t, n]) => /* @__PURE__ */ q("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ K("span", {
						className: "w-16 shrink-0 truncate font-mono text-xs text-text",
						children: t
					}), /* @__PURE__ */ K("div", {
						className: "flex min-w-0 flex-1 gap-px",
						children: n.map((t) => /* @__PURE__ */ K(ut, {
							edit: e,
							row: t
						}, t.name))
					})]
				}, t))
			})
		})
	] });
}
function _t(e) {
	let t = e.flatMap((e) => String(e.weight ?? "400").split(/\s+/).map(Number)).filter((e) => e > 0), n = Math.min(...t), r = Math.max(...t), i = t.length === 0 ? "400" : n === r ? String(n) : `${n}–${r}`;
	return e.some((e) => e.style === "italic") ? `${i} · ${_("Italic")}` : i;
}
var vt = (e, t) => /* @__PURE__ */ K("p", {
	className: "m-0 truncate pb-2.5 text-ink",
	style: {
		fontSize: `min(${e}, 2.75rem)`,
		lineHeight: 1.1,
		fontFamily: t
	},
	children: _("Ship It")
});
function yt({ edit: e, fonts: i }) {
	let o = [...new Set(i.faces.map((e) => e.family))], s = new Set(tt(e, "--font-", (e) => e.startsWith("weight-")).map((e) => t(r(e.value)))), c = o.map((e) => {
		let t = i.faces.filter((t) => t.family === e);
		return {
			family: e,
			styles: _t(t),
			fallback: t.some((e) => Array.isArray(e.fallback) ? e.fallback.length > 0 : !!e.fallback),
			used: s.has(e)
		};
	}), l = n("", "sans", !1), u = e.sheet.variable("--font-sans") ?? e.defaults.get("--font-sans"), p = () => [
		["sans", _("Sans")],
		["serif", _("Serif")],
		["mono", _("Mono")]
	];
	return /* @__PURE__ */ q(G, { children: [
		/* @__PURE__ */ K(Z, {
			edit: e,
			kind: {
				prefix: "--font-",
				title: _("Fonts"),
				add: _("Add Font Family"),
				fresh: _("New Font Family"),
				start: l,
				placeholder: "display",
				skip: (e) => e.startsWith("weight-")
			},
			row: (o, s, l) => {
				let u = r(o.value), m = t(u), h = i.faces.filter((e) => e.family === m), g = h.some((e) => e.preload);
				return /* @__PURE__ */ K(d, {
					name: o.key,
					sample: /* @__PURE__ */ K("span", {
						className: "block max-w-7 overflow-hidden whitespace-nowrap text-center text-lg leading-none text-ink",
						style: { fontFamily: o.value },
						children: "Aa"
					}),
					menu: l([
						{
							heading: !0,
							label: _("Fallback")
						},
						...p().map(([e, t]) => ({
							label: t,
							checked: a(u) === e,
							onSelect: () => s(n(m, e, u.includes(`${m} Fallback`)))
						})),
						...h.length ? [{
							separator: !0,
							label: ""
						}, {
							label: _("Preload"),
							checked: g,
							onSelect: () => i.preload(m, !g)
						}] : []
					]),
					children: /* @__PURE__ */ K(f, {
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
		/* @__PURE__ */ K(Z, {
			edit: e,
			kind: {
				prefix: "--text-",
				title: _("Text Sizes"),
				add: _("Add Text Size"),
				fresh: _("New Text Size"),
				start: "1.25rem",
				placeholder: "lead",
				skip: (e) => e.startsWith("shadow-")
			},
			row: (t, n, r) => /* @__PURE__ */ K(d, {
				name: t.key,
				menu: r(),
				below: vt(t.value, u),
				children: /* @__PURE__ */ K(f, {
					handle: t.name,
					label: t.key,
					value: t.value,
					disabled: e.readOnly,
					field: st,
					onChange: n
				})
			}, t.name)
		}),
		/* @__PURE__ */ K(Z, {
			edit: e,
			kind: {
				prefix: "--leading-",
				title: _("Line Heights"),
				add: _("Add Line Height"),
				fresh: _("New Line Height"),
				start: "1.5",
				placeholder: "airy"
			},
			row: (t, n, r) => /* @__PURE__ */ K(d, {
				name: t.key,
				menu: r(),
				sample: /* @__PURE__ */ K("span", {
					className: "flex w-4 flex-col",
					style: { gap: `${Math.max(1, (Number(t.value) - .8) * 6)}px` },
					children: [
						0,
						1,
						2
					].map((e) => /* @__PURE__ */ K("span", { className: M("h-0.5 rounded-full bg-muted", e === 2 && "w-2/3") }, e))
				}),
				children: /* @__PURE__ */ K(f, {
					handle: t.name,
					label: t.key,
					value: t.value,
					disabled: e.readOnly,
					field: Q("", {
						step: .05,
						min: 0
					}),
					onChange: n
				})
			}, t.name)
		}),
		/* @__PURE__ */ K(Z, {
			edit: e,
			kind: {
				prefix: "--tracking-",
				title: _("Letter Spacing"),
				add: _("Add Letter Spacing"),
				fresh: _("New Letter Spacing"),
				start: "0em",
				placeholder: "loose"
			},
			row: (t, n, r) => /* @__PURE__ */ K(d, {
				name: t.key,
				menu: r(),
				sample: /* @__PURE__ */ K("span", {
					className: "text-xs font-medium text-ink",
					style: { letterSpacing: t.value },
					children: "Aa"
				}),
				children: /* @__PURE__ */ K(f, {
					handle: t.name,
					label: t.key,
					value: t.value,
					disabled: e.readOnly,
					field: Q("em", {
						units: ["em", "px"],
						step: .005
					}),
					onChange: n
				})
			}, t.name)
		})
	] });
}
var bt = (e, t = st) => (n, r, i) => /* @__PURE__ */ K(d, {
	name: n.key,
	menu: i(),
	children: /* @__PURE__ */ K(f, {
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
		["sm", _("Small")],
		["md", _("Medium")],
		["lg", _("Large")]
	], n = [
		["height", _("Height")],
		["padding", _("Padding")],
		["text", _("Text")]
	], r = (t) => e.sheet.variable(t) ?? e.defaults.get(t) ?? null, i = "w-24 shrink-0 max-sm:min-w-0 max-sm:flex-1";
	return /* @__PURE__ */ q(u, {
		title: _("Buttons and Fields"),
		children: [/* @__PURE__ */ q("div", {
			className: "flex min-h-8 items-center gap-2 border-b border-border text-2xs text-faint",
			children: [
				/* @__PURE__ */ K("span", { className: "min-w-0 flex-1" }),
				n.map(([e, t]) => /* @__PURE__ */ K("span", {
					className: i,
					children: t
				}, e)),
				/* @__PURE__ */ K("span", { className: "size-6 shrink-0" })
			]
		}), t.map(([t, a]) => {
			let o = n.map(([e]) => `--control-${t}-${e}`), s = o.some((t) => e.sheet.variable(t) !== void 0);
			return /* @__PURE__ */ q("div", {
				className: "cms-reveal-row flex min-h-9 items-center gap-2 border-b border-border py-1 last:border-b-0",
				children: [
					/* @__PURE__ */ K("span", {
						className: "min-w-0 flex-1 truncate text-xs text-text",
						children: a
					}),
					n.map(([t, n], s) => /* @__PURE__ */ K("div", {
						className: i,
						children: /* @__PURE__ */ K(f, {
							handle: o[s],
							label: `${a} ${n}`,
							value: r(o[s]),
							disabled: e.readOnly,
							field: Q("rem", {
								units: ["rem", "px"],
								step: .125,
								min: 0
							}),
							onChange: (t) => t !== null && e.change((e) => e.setVariable(o[s], t))
						})
					}, t)),
					s && !e.readOnly ? /* @__PURE__ */ K(j, {
						content: _("Reset"),
						children: /* @__PURE__ */ K(S, {
							icon: "undo",
							size: "xs",
							label: _("Reset"),
							title: void 0,
							className: "cms-reveal shrink-0",
							onClick: () => e.change((e) => o.reduce((e, t) => e.setVariable(t, null), e))
						})
					}) : /* @__PURE__ */ K("span", { className: "size-6 shrink-0" })
				]
			}, t);
		})]
	});
}
function St({ edit: e }) {
	let t = {
		prefix: "--spacing-",
		title: _("Spacing"),
		add: _("Add Spacing"),
		fresh: _("New Spacing"),
		start: "2rem",
		placeholder: "gutter"
	}, n = ot(e, t), r = e.sheet.variable("--spacing"), i = async () => {
		let n = await rt(e, t.prefix, t.fresh, t.add, "", t.placeholder);
		n && e.change((e) => e.setVariable(`${t.prefix}${n}`, t.start));
	}, a = {
		name: "--spacing",
		key: "1",
		value: r ?? e.defaults.get("--spacing") ?? "0.25rem",
		builtIn: !0,
		written: r !== void 0
	};
	return /* @__PURE__ */ q(G, { children: [
		/* @__PURE__ */ q(u, {
			title: t.title,
			onAdd: e.readOnly ? void 0 : () => void i(),
			addLabel: t.add,
			children: [/* @__PURE__ */ K(d, {
				name: a.key,
				copy: a.name,
				menu: n(a),
				children: /* @__PURE__ */ K(f, {
					handle: "--spacing",
					label: a.key,
					value: a.value,
					disabled: e.readOnly,
					field: st,
					onChange: (t) => t !== null && e.change((e) => e.setVariable("--spacing", t))
				})
			}), tt(e, t.prefix).map((t) => bt(e)(t, (n) => n !== null && e.change((e) => e.setVariable(t.name, n)), (e) => n(t, e)))]
		}),
		/* @__PURE__ */ K(Z, {
			edit: e,
			kind: {
				prefix: "--container-",
				title: _("Containers"),
				add: _("Add Container"),
				fresh: _("New Container"),
				start: "72rem",
				placeholder: "content"
			},
			row: bt(e)
		}),
		/* @__PURE__ */ K(Z, {
			edit: e,
			kind: {
				prefix: "--breakpoint-",
				title: _("Breakpoints"),
				add: _("Add Breakpoint"),
				fresh: _("New Breakpoint"),
				start: "120rem",
				placeholder: "3xl"
			},
			row: bt(e, ct)
		}),
		/* @__PURE__ */ K(xt, { edit: e })
	] });
}
function Ct({ edit: t }) {
	let n = (n) => (r, i, a) => /* @__PURE__ */ K(d, {
		name: r.key,
		menu: a(),
		sample: /* @__PURE__ */ K(e, {
			value: r.value,
			kind: n
		}),
		children: /* @__PURE__ */ K(f, {
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
	return /* @__PURE__ */ q(G, { children: [
		/* @__PURE__ */ K(Z, {
			edit: t,
			kind: {
				prefix: "--radius-",
				title: _("Corners"),
				add: _("Add Radius"),
				fresh: _("New Radius"),
				start: "0.5rem",
				placeholder: "card"
			},
			row: (e, n, r) => /* @__PURE__ */ K(d, {
				name: e.key,
				menu: r(),
				sample: /* @__PURE__ */ K("span", {
					className: "size-5 translate-x-0.5 translate-y-0.5 border-l-[1.5px] border-t-[1.5px] border-muted",
					style: { borderTopLeftRadius: `min(${e.value}, 20px)` }
				}),
				children: /* @__PURE__ */ K(f, {
					handle: e.name,
					label: e.key,
					value: e.value,
					disabled: t.readOnly,
					field: Q("rem", {
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
		/* @__PURE__ */ K(Z, {
			edit: t,
			kind: {
				prefix: "--shadow-",
				title: _("Shadows"),
				add: _("Add Shadow"),
				fresh: _("New Shadow"),
				start: "0 4px 16px -4px rgb(0 0 0 / 0.12)",
				placeholder: "card"
			},
			row: n("box")
		}),
		/* @__PURE__ */ K(Z, {
			edit: t,
			kind: {
				prefix: "--inset-shadow-",
				title: _("Inset Shadows"),
				add: _("Add Inset Shadow"),
				fresh: _("New Inset Shadow"),
				start: "inset 0 2px 4px rgb(0 0 0 / 0.08)",
				placeholder: "well"
			},
			row: n("box")
		}),
		/* @__PURE__ */ K(Z, {
			edit: t,
			kind: {
				prefix: "--drop-shadow-",
				title: _("Drop Shadows"),
				add: _("Add Drop Shadow"),
				fresh: _("New Drop Shadow"),
				start: "0 4px 8px rgb(0 0 0 / 0.12)",
				placeholder: "lifted"
			},
			row: n("drop")
		}),
		/* @__PURE__ */ K(Z, {
			edit: t,
			kind: {
				prefix: "--text-shadow-",
				title: _("Text Shadows"),
				add: _("Add Text Shadow"),
				fresh: _("New Text Shadow"),
				start: "0 1px 2px rgb(0 0 0 / 0.2)",
				placeholder: "glow"
			},
			row: n("text")
		}),
		/* @__PURE__ */ K(Z, {
			edit: t,
			kind: {
				prefix: "--blur-",
				title: _("Blur"),
				add: _("Add Blur"),
				fresh: _("New Blur"),
				start: "6px",
				placeholder: "soft"
			},
			row: (e, n, r) => /* @__PURE__ */ K(d, {
				name: e.key,
				menu: r(),
				sample: /* @__PURE__ */ K("span", {
					className: "size-3 rounded-full bg-muted",
					style: { filter: `blur(min(${e.value}, 6px))` }
				}),
				children: /* @__PURE__ */ K(f, {
					handle: e.name,
					label: e.key,
					value: e.value,
					disabled: t.readOnly,
					field: Q("px", {
						units: ["px", "rem"],
						step: 1,
						min: 0
					}),
					onChange: n
				})
			}, e.name)
		}),
		/* @__PURE__ */ K(Z, {
			edit: t,
			kind: {
				prefix: "--perspective-",
				title: _("Perspective"),
				add: _("Add Perspective"),
				fresh: _("New Perspective"),
				start: "800px",
				placeholder: "deep"
			},
			row: bt(t, Q("px", {
				units: ["px", "rem"],
				step: 10,
				min: 0
			}))
		})
	] });
}
function wt(e, t) {
	let n = String(e ?? "").trim().match(/^(\d*\.?\d+)\s*(ms|s)?$/);
	if (!n) return t;
	let r = n[2] === "s" ? Number(n[1]) : Number(n[1]) / 1e3;
	return Math.min(2, Math.max(.05, Math.round(r * 1e3) / 1e3));
}
function Tt({ edit: e, transition: t, onTransition: n }) {
	let r = (t, n) => e.change((e) => e.setVariable(t, n)), a = (t) => e.sheet.variable(t) ?? e.defaults.get(t) ?? null, o = (t) => e.sheet.variable(t) !== void 0 && !e.readOnly ? /* @__PURE__ */ K(j, {
		content: _("Reset"),
		children: /* @__PURE__ */ K(S, {
			icon: "undo",
			size: "xs",
			label: _("Reset"),
			title: void 0,
			onClick: () => r(t, null)
		})
	}) : void 0;
	return /* @__PURE__ */ q(G, { children: [
		/* @__PURE__ */ K(Z, {
			edit: e,
			kind: {
				prefix: "--ease-",
				title: _("Easings"),
				add: _("Add Easing"),
				fresh: _("New Easing"),
				start: "cubic-bezier(0.2, 0.8, 0.2, 1)",
				placeholder: "snap"
			},
			row: (t, n, r) => /* @__PURE__ */ K(d, {
				name: t.key,
				menu: r(),
				children: /* @__PURE__ */ K(f, {
					handle: t.name,
					label: t.key,
					value: t.value,
					disabled: e.readOnly,
					field: { component: "ease" },
					onChange: n
				})
			}, t.name)
		}),
		/* @__PURE__ */ K(Z, {
			edit: e,
			kind: {
				prefix: "--duration-",
				title: _("Durations"),
				add: _("Add Duration"),
				fresh: _("New Duration"),
				start: "300ms",
				placeholder: "slow"
			},
			row: (t, n, r) => /* @__PURE__ */ K(d, {
				name: t.key,
				menu: r(),
				children: /* @__PURE__ */ K(f, {
					handle: t.name,
					label: t.key,
					value: t.value,
					disabled: e.readOnly,
					field: Q("ms", {
						units: ["ms", "s"],
						step: 50,
						min: 0
					}),
					onChange: n
				})
			}, t.name)
		}),
		/* @__PURE__ */ K(Z, {
			edit: e,
			kind: {
				prefix: "--animate-",
				title: _("Animations"),
				add: _("Add Animation"),
				fresh: _("New Animation"),
				start: "spin 2s linear infinite",
				placeholder: "float"
			},
			row: (t, n, r) => /* @__PURE__ */ K(d, {
				name: t.key,
				menu: r(),
				sample: /* @__PURE__ */ K(i, {
					value: t.value,
					keyframes: e.keyframes
				}),
				children: /* @__PURE__ */ K(f, {
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
		/* @__PURE__ */ q(u, {
			title: _("Transitions"),
			children: [/* @__PURE__ */ K(l, {
				label: _("Duration"),
				action: o("--default-transition-duration"),
				children: /* @__PURE__ */ K(f, {
					handle: "--default-transition-duration",
					label: _("Duration"),
					value: a("--default-transition-duration"),
					disabled: e.readOnly,
					field: Q("ms", {
						units: ["ms", "s"],
						step: 10,
						min: 0
					}),
					onChange: (e) => e && r("--default-transition-duration", e)
				})
			}), /* @__PURE__ */ K(l, {
				label: _("Easing"),
				action: o("--default-transition-timing-function"),
				children: /* @__PURE__ */ K(f, {
					handle: "--default-transition-timing-function",
					label: _("Easing"),
					value: a("--default-transition-timing-function"),
					disabled: e.readOnly,
					field: { component: "ease" },
					onChange: (e) => e && r("--default-transition-timing-function", e)
				})
			})]
		}),
		/* @__PURE__ */ q(u, {
			title: _("Page Transition"),
			children: [
				/* @__PURE__ */ K(l, {
					label: _("Effect"),
					children: /* @__PURE__ */ K(f, {
						handle: "type",
						label: _("Effect"),
						value: t.type,
						disabled: e.readOnly,
						field: {
							type: "select",
							mono: !1,
							required: !0,
							options: {
								none: _("None"),
								fade: _("Fade"),
								slide: _("Slide"),
								scale: _("Scale")
							}
						},
						onChange: (e) => n({
							...t,
							type: e ?? "none"
						})
					})
				}),
				t.type !== "none" && /* @__PURE__ */ K(l, {
					label: _("Duration"),
					children: /* @__PURE__ */ K(f, {
						handle: "duration",
						label: _("Duration"),
						value: `${Math.round(t.duration * 1e3)}ms`,
						disabled: e.readOnly,
						field: Q("ms", {
							units: ["ms"],
							step: 10,
							min: 50,
							max: 2e3
						}),
						onChange: (e) => n({
							...t,
							duration: wt(e, t.duration)
						})
					})
				}),
				/* @__PURE__ */ K(l, {
					label: _("Page Loads"),
					children: /* @__PURE__ */ K(f, {
						handle: "navigation",
						label: _("Page Loads"),
						value: t.navigation,
						disabled: e.readOnly,
						field: {
							type: "select",
							mono: !1,
							required: !0,
							options: {
								document: _("Full Page"),
								client: _("Instant")
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
var Et = {}, Dt = [
	"colors",
	"typography",
	"layout",
	"effects",
	"motion",
	"styles"
];
function Ot() {
	return [
		{
			value: "colors",
			label: _("Colors"),
			icon: "palette"
		},
		{
			value: "typography",
			label: _("Typography"),
			icon: "typography"
		},
		{
			value: "layout",
			label: _("Layout"),
			icon: "ruler"
		},
		{
			value: "effects",
			label: _("Effects"),
			icon: "shadow"
		},
		{
			value: "motion",
			label: _("Motion"),
			icon: "speed"
		},
		{
			value: "styles",
			label: _("Styles"),
			icon: "symbol"
		}
	];
}
var kt = (e, t) => JSON.stringify(e ?? null) === JSON.stringify(t ?? null);
function At() {
	let e = te("styling/get", {}, {
		refetchOnWindowFocus: !1,
		retry: !1
	}), t = te("styling/source", {}, {
		refetchOnWindowFocus: !1,
		retry: !1,
		staleTime: 6e4
	}), [n, r] = x(Et), { query: i } = ne(), a = i.style ? "styles" : Dt.includes(i.tab) ? i.tab : Dt[0], s = (e) => ee({
		tab: e === Dt[0] ? null : e,
		style: null
	}), [c, l] = x(fe() === "dark" ? "dark" : "light"), [u, d] = x(!1), [f, ie] = x(() => window.matchMedia("(max-width: 767px)").matches);
	v(() => {
		let e = window.matchMedia("(max-width: 767px)"), t = () => ie(e.matches);
		return e.addEventListener("change", t), () => e.removeEventListener("change", t);
	}, []);
	let C = u && f, [w, T] = x("desktop"), [E, ue] = x(!1), [N, I] = x(null), pe = de(), me = b(null), L = e.data, R = n.css ?? L?.css, he = n.transition ?? L?.transition, ge = !!L && (n.css !== void 0 && n.css !== L.css || n.transition !== void 0 && !kt(n.transition, L.transition)), _e = !m("settings.manage"), ve = y(() => new ye(R ?? ""), [R]), z = ke(t.data, R), xe = y(() => ve.variables().some((e) => e.value.startsWith("light-dark(")) || /color-scheme\s*:\s*light\s+dark\b/.test(ve.css), [ve]), [B, Ce] = x(null);
	v(() => {
		Se().then(Ce);
	}, []);
	let we = t.data?.files.cms, Te = y(() => {
		let e = /* @__PURE__ */ new Map();
		for (let t of [...De(B ?? ""), ...De(we ?? "")]) e.set(t.name, t.value);
		return e;
	}, [B, we]), V = y(() => new Set(De(B ?? "").filter((e) => e.name.startsWith("--color-")).map((e) => e.name)), [B]), Ee = y(() => o(B ?? "", R ?? ""), [B, R]);
	if (v(() => {
		let e = document.createElement("style");
		return e.textContent = (L?.fonts ?? []).map((e) => `@font-face{font-family:"${e.family}";src:url("${/^(https:\/\/|\/)/.test(e.src) ? e.src : `/_cms/fonts/${e.src.split("/").pop()}`}") format("woff2");font-weight:${e.weight ?? "400"};font-style:${e.style ?? "normal"};font-display:swap}`).join("\n"), document.head.appendChild(e), () => e.remove();
	}, [L?.fonts]), e.isLoading || t.isLoading || B === null) return /* @__PURE__ */ K("div", {
		className: "grid h-full place-items-center text-faint",
		children: /* @__PURE__ */ K(se, {})
	});
	if (!L || !t.data || R === void 0 || !he) return /* @__PURE__ */ q("div", {
		className: "flex h-full flex-col",
		children: [/* @__PURE__ */ K(ce, { crumbs: [{
			label: _("Styling"),
			icon: "palette"
		}] }), /* @__PURE__ */ K(D, {
			title: _("Couldn’t load the styling"),
			onRetry: () => {
				e.refetch(), t.refetch();
			},
			retrying: e.isRefetching || t.isRefetching
		})]
	});
	let H = {
		sheet: ve,
		change: (e) => !_e && r((t) => ({
			...t,
			css: e(new ye(t.css ?? L.css)).css
		})),
		readOnly: _e,
		defaults: Te,
		palette: V,
		keyframes: Ee,
		mode: xe ? c : "light"
	}, U = {
		compiler: z.compiler,
		device: C ? "phone" : w
	}, W = () => {
		h("styling/"), me.current?.contentWindow?.location.reload();
	}, Ae = async () => {
		if (ge && !E) {
			ue(!0), I(null);
			try {
				let i = {};
				n.css !== void 0 && n.css !== L.css && (i.css = n.css), n.transition !== void 0 && !kt(n.transition, L.transition) && (i.transition = n.transition), Object.keys(i).length > 0 && await g("styling/update", i), await Promise.all([e.refetch(), t.refetch()]), r(Et), me.current?.contentWindow?.location.reload();
			} catch (e) {
				I({
					message: e instanceof Error ? e.message : String(e),
					refused: e instanceof p && e.type === "invalid_input"
				});
			} finally {
				ue(!1);
			}
		}
	}, je = {
		faces: L.fonts,
		add: async (e) => {
			try {
				if (e === "google") {
					let e = await P({
						title: _("Add a Google Font"),
						fields: [{
							handle: "family",
							type: "text",
							label: _("Name"),
							placeholder: "Inter Tight",
							autofocus: !0,
							required: !0
						}],
						confirm: _("Add Font")
					}), t = String(e?.family ?? "").trim();
					if (!t) return null;
					let n = await g("styling/fonts-import", { family: t });
					return F.success(_("{family} added", { family: t })), W(), {
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
				}), r = t.name.replace(/\.woff2$/i, ""), i = await P({
					title: _("Upload Font"),
					fields: [{
						handle: "family",
						type: "text",
						label: _("Family Name"),
						autofocus: !0,
						required: !0
					}],
					values: { family: r.replace(/[-_](regular|bold|variable|italic|\d+).*$/i, "").replace(/[-_]/g, " ") },
					confirm: _("Upload Font")
				}), a = String(i?.family ?? "").trim();
				return a ? (await g("styling/fonts-upload", {
					family: a,
					name: r,
					data: n,
					weight: /variable/i.test(r) ? "100 900" : "400",
					style: /italic/i.test(r) ? "italic" : "normal"
				}), F.success(_("{family} uploaded", { family: a })), W(), {
					family: a,
					fallback: !1
				}) : null;
			} catch (e) {
				return F.error(e), null;
			}
		},
		remove: async (e) => {
			if (await le({
				title: _("Remove {family}?", { family: e }),
				confirm: _("Remove Font"),
				danger: !0
			})) try {
				await g("styling/update", { fonts: L.fonts.filter((t) => t.family !== e) }), W();
			} catch (e) {
				F.error(e);
			}
		},
		preload: async (e, t) => {
			let n = L.fonts.some((t) => t.family === e && t.style !== "italic");
			try {
				await g("styling/update", { fonts: L.fonts.map((r) => r.family === e ? {
					...r,
					preload: t && (!n || r.style !== "italic")
				} : r) }), W();
			} catch (e) {
				F.error(e);
			}
		}
	}, Me = /* @__PURE__ */ q(G, { children: [
		a === "colors" && /* @__PURE__ */ K(gt, { edit: H }),
		a === "typography" && /* @__PURE__ */ K(yt, {
			edit: H,
			fonts: je
		}),
		a === "layout" && /* @__PURE__ */ K(St, { edit: H }),
		a === "effects" && /* @__PURE__ */ K(Ct, { edit: H }),
		a === "motion" && /* @__PURE__ */ K(Tt, {
			edit: H,
			transition: he,
			onTransition: (e) => !_e && r((t) => ({
				...t,
				transition: e
			}))
		}),
		a === "styles" && /* @__PURE__ */ K(et, {
			edit: H,
			samples: U
		})
	] });
	return /* @__PURE__ */ q("div", {
		className: "flex h-full flex-col",
		children: [
			/* @__PURE__ */ K(ce, {
				crumbs: [{
					label: _("Styling"),
					icon: "palette"
				}, { label: Ot().find((e) => e.value === a)?.label ?? "" }],
				actions: /* @__PURE__ */ q(G, { children: [/* @__PURE__ */ K(re, {
					variant: "ghost",
					icon: "eye",
					"aria-pressed": C,
					onClick: () => d(!C),
					className: "md:hidden",
					children: _("Preview")
				}), /* @__PURE__ */ K(j, {
					content: _("Open Site"),
					children: /* @__PURE__ */ K(S, {
						icon: "external",
						label: _("Open Site"),
						title: void 0,
						onClick: () => window.open("/", "_blank", "noopener"),
						className: "max-md:hidden"
					})
				})] })
			}),
			/* @__PURE__ */ K(oe, {
				title: _("Styling"),
				backTo: "/",
				backLabel: _("Dashboard"),
				nested: !0,
				children: /* @__PURE__ */ K("nav", {
					"aria-label": _("Styling"),
					className: pe.nested ? "space-y-px" : "px-2 pb-4",
					children: Ot().map((e) => /* @__PURE__ */ K(A, {
						label: e.label,
						icon: pe.nested ? void 0 : e.icon,
						active: a === e.value,
						onClick: () => s(e.value)
					}, e.value))
				})
			}),
			/* @__PURE__ */ K(O, {
				dirty: ge,
				saving: E,
				error: N ? N.refused ? _("The stylesheet was not saved") : N.message : null,
				onSave: () => void Ae(),
				onDiscard: () => {
					r(Et), I(null);
				}
			}),
			/* @__PURE__ */ K(be, {
				source: z.source ?? t.data,
				children: /* @__PURE__ */ q("div", {
					className: "grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(340px,420px)_minmax(0,1fr)] xl:grid-cols-[minmax(380px,460px)_minmax(0,1fr)]",
					children: [/* @__PURE__ */ q("div", {
						className: M("overflow-y-auto border-border px-4 pb-16 pt-2 md:border-r", C && "max-md:hidden"),
						children: [N?.refused && /* @__PURE__ */ K(ae, {
							tone: "danger",
							className: "mb-3 mt-1",
							title: _("Tailwind refused the stylesheet"),
							onDismiss: () => I(null),
							children: N.message
						}), Me]
					}, a), /* @__PURE__ */ q("div", {
						className: M("flex min-w-0 flex-col bg-sunken", !C && "max-md:hidden"),
						children: [/* @__PURE__ */ q("div", {
							className: "flex h-10 shrink-0 items-center gap-2 border-b border-border bg-bg px-3",
							children: [
								/* @__PURE__ */ K("span", {
									className: "max-md:hidden",
									children: /* @__PURE__ */ K(k, {
										size: "xs",
										"aria-label": _("Screen"),
										value: w,
										onChange: T,
										options: [
											{
												value: "desktop",
												icon: "desktop",
												title: _("Desktop")
											},
											{
												value: "tablet",
												icon: "tablet",
												title: _("Tablet")
											},
											{
												value: "phone",
												icon: "phone",
												title: _("Phone")
											}
										]
									})
								}),
								w !== "desktop" && /* @__PURE__ */ K("span", {
									className: "font-mono text-2xs text-faint max-md:hidden",
									children: Oe[w]
								}),
								/* @__PURE__ */ K("span", { className: "flex-1" }),
								xe && /* @__PURE__ */ K(k, {
									size: "xs",
									"aria-label": _("Color Mode"),
									value: c,
									onChange: l,
									options: [{
										value: "light",
										icon: "sun",
										title: _("Light")
									}, {
										value: "dark",
										icon: "moon",
										title: _("Dark")
									}]
								})
							]
						}), /* @__PURE__ */ K(jt, {
							frame: me,
							compile: z,
							published: L.stylesheet,
							viewport: C ? "phone" : w,
							mode: xe ? c : null,
							bordered: w !== "desktop" && !C
						})]
					})]
				})
			})
		]
	});
}
function jt(e) {
	let { breakpoints: t } = U();
	return /* @__PURE__ */ K(Ne, {
		...e,
		desktop: t.find((e) => e.name === "lg")?.width ?? 1024
	});
}
export { At as default };
