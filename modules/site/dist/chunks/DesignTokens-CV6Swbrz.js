import { a as e, o as t, s as n } from "./fields-Bsyy4Wnr.js";
import { can as r, queryClient as i, run as a, t as o, useAbility as s, useTab as c } from "@letterncms/sdk";
import { Fragment as l, useEffect as u, useMemo as d, useRef as f, useState as p } from "react";
import { EmptyState as ee, Fields as m, Icon as h, IconButton as g, Menu as _, SaveBar as te, ScreenSidebar as ne, Segmented as v, SidebarRow as re, Spinner as ie, Tooltip as ae, Topbar as oe, cn as y, confirm as se, copyText as b, deviceWidths as x, prompt as S, toast as C, useScreenSidebar as ce } from "@letterncms/ui";
import { Fragment as w, jsx as T, jsxs as E } from "react/jsx-runtime";
// admin/src/design-parts.tsx
var D = { weight: "font-weight" }, O = (e, t) => `--${D[e] ?? e}-${t}`;
function k(e, t) {
	return t && typeof t == "object" && !Array.isArray(t) && "min" in t ? le(String(t.min), String(t.max)) : e === "font" && Array.isArray(t) ? t.map((e) => /\s/.test(e) && !e.includes("\"") ? `"${e}"` : e).join(", ") : String(t ?? "").replace(/token:([a-z]+)\.([a-z0-9-]+)(?:\/(\d{1,3}))?/g, (e, t, n, r) => r ? `color-mix(in srgb, var(${O(t, n)}) ${r}%, transparent)` : `var(${O(t, n)})`);
}
function le(e, t) {
	let n = (e) => e.endsWith("rem") ? parseFloat(e) : parseFloat(e) / 16, r = n(e), i = n(t), a = (i - r) / 57.5, o = (e) => String(Math.round(e * 1e4) / 1e4);
	return `clamp(${o(Math.min(r, i))}rem, ${o(r - a * 22.5)}rem + ${o(a * 100)}vw, ${o(Math.max(r, i))}rem)`;
}
function A(e) {
	let t = e && typeof e == "object" && "max" in e ? e.max : e, n = parseFloat(String(t ?? ""));
	return Number.isNaN(n) ? 0 : /r?em$/.test(String(t)) ? n * 16 : n;
}
function j({ title: e, onAdd: t, action: n, children: r }) {
	return /* @__PURE__ */ E("section", {
		className: "mb-6",
		children: [/* @__PURE__ */ E("div", {
			className: "flex h-9 items-center justify-between border-b border-border",
			children: [
				/* @__PURE__ */ T("h3", {
					className: "m-0 text-xs font-semibold text-ink",
					children: e
				}),
				n,
				t && /* @__PURE__ */ T(ae, {
					content: o("Add Token"),
					children: /* @__PURE__ */ T(g, {
						icon: "plus",
						label: o("Add Token"),
						size: "xs",
						onClick: t
					})
				})
			]
		}), r]
	});
}
function M({ open: e, onToggle: t, label: n, aside: r, menu: i, children: a }) {
	return /* @__PURE__ */ E("div", {
		className: "group border-b border-border last:border-b-0",
		children: [/* @__PURE__ */ E("div", {
			className: "flex min-h-10 items-center gap-2",
			children: [/* @__PURE__ */ E("button", {
				type: "button",
				"aria-expanded": e,
				onClick: t,
				className: "flex min-h-10 min-w-0 flex-1 items-center gap-1.5 rounded-xs text-left text-xs text-text outline-offset-[-2px] hover:text-ink",
				children: [
					/* @__PURE__ */ T(h, {
						name: "chevron-right",
						size: 12,
						className: y("shrink-0 text-faint transition-transform duration-120", e && "rotate-90")
					}),
					/* @__PURE__ */ T("span", {
						className: "min-w-0 flex-1 truncate",
						children: n
					}),
					r
				]
			}), i]
		}), e && /* @__PURE__ */ T("div", {
			className: "pb-3 pl-[18px]",
			children: a
		})]
	});
}
// admin/src/form-fields.tsx
function ue(e, t) {
	let n = 0;
	for (let r = t + 4; r < e.length; r++) if (e[r] === "(") n++;
	else if (e[r] === ")" && n-- === 0) {
		let n = e.slice(t + 4, r), i = n.indexOf(",");
		return {
			name: (i < 0 ? n : n.slice(0, i)).trim(),
			fallback: i < 0 ? null : n.slice(i + 1).trim(),
			end: r + 1
		};
	}
	return null;
}
function N(e, t, n, r, i, a = 0) {
	if (a > 8) return "transparent";
	let o = (e) => {
		let t = r.find((t) => t.path === e);
		return t ? String(i && t.dark ? t.dark : t.value) : null;
	}, s = new Map(Object.entries(t).flatMap(([e, t]) => Object.entries(t).map(([t, n]) => [n.variable, [e, t]]))), c = e.replace(/token:color\.([a-z0-9-]+)(?:\/(\d{1,3}))?/g, (e, t, n) => {
		let r = o(`color.${t}`) ?? "transparent";
		return n ? `color-mix(in srgb, ${r} ${n}%, transparent)` : r;
	});
	for (let e = c.indexOf("var("); e >= 0; e = c.indexOf("var(")) {
		let l = ue(c, e);
		if (!l) break;
		let u = s.get(l.name), d = l.name.startsWith("--color-") ? o(`color.${l.name.slice(8)}`) : null, f = u ? P(t, n, u[0], u[1], r) : d ?? l.fallback ?? "transparent";
		c = c.slice(0, e) + N(f, t, n, r, i, a + 1) + c.slice(l.end);
	}
	if (/^field:/.test(c)) {
		let [e, o] = c.slice(6).split(".");
		return N(P(t, n, e, o, r), t, n, r, i, a + 1);
	}
	return c.replace(/currentColor/gi, o("color.foreground") ?? "#161614");
}
function de() {
	return [
		{
			key: "field",
			label: o("All Fields"),
			parts: ["field"],
			specimen: "field"
		},
		{
			key: "states",
			label: o("States"),
			parts: [
				"hover",
				"focus",
				"invalid",
				"disabled"
			],
			specimen: "states"
		},
		{
			key: "label",
			label: o("Labels and Help"),
			parts: ["label", "help"],
			specimen: "labels"
		},
		{
			key: "spacing",
			label: o("Size and Spacing"),
			parts: ["spacing"],
			specimen: "sizes"
		},
		{
			key: "select",
			label: o("Dropdowns"),
			parts: ["select"],
			specimen: "select"
		},
		{
			key: "textarea",
			label: o("Text Areas"),
			parts: ["textarea"],
			specimen: "textarea"
		},
		{
			key: "checkbox",
			label: o("Checkboxes"),
			parts: ["checkbox"],
			specimen: "checkbox"
		},
		{
			key: "radio",
			label: o("Radio Buttons"),
			parts: ["radio"],
			specimen: "radio"
		},
		{
			key: "switch",
			label: o("Switches"),
			parts: ["switch"],
			specimen: "switch"
		},
		{
			key: "slider",
			label: o("Sliders"),
			parts: ["slider"],
			specimen: "slider"
		},
		{
			key: "tags",
			label: o("Tag Fields"),
			parts: ["tags"],
			specimen: "tags"
		},
		{
			key: "chips",
			label: o("Chips"),
			parts: ["chips"],
			specimen: "chips"
		},
		{
			key: "file",
			label: o("File Pickers"),
			parts: ["file"],
			specimen: "file"
		}
	];
}
function fe(e, t) {
	let n = {
		"invalid.color": o("Color"),
		"invalid.ringColor": o("Ring"),
		"label.color": o("Color"),
		"help.color": o("Color"),
		"label.fontSize": o("Size"),
		"help.fontSize": o("Size"),
		"label.fontWeight": o("Weight"),
		"checkbox.background": o("Fill"),
		"checkbox.borderColor": o("Border"),
		"slider.fill": o("Filled Track"),
		"tags.background": o("Tag Fill"),
		"tags.color": o("Tag Text"),
		"tags.radius": o("Tag Radius"),
		"file.background": o("Button Fill"),
		"file.color": o("Button Text"),
		"file.radius": o("Button Radius"),
		"spacing.label": o("Label and Field"),
		"spacing.size": o("Form Size"),
		"switch.knobShadow": o("Shadow"),
		"slider.thumbShadow": o("Shadow"),
		"switch.radius": o("Radius"),
		"chips.background": o("Fill"),
		"chips.borderColor": o("Border")
	}, r = {
		height: o("Height"),
		paddingX: o("Padding"),
		background: o("Fill"),
		borderWidth: o("Border Width"),
		borderColor: o("Border"),
		radius: o("Radius"),
		color: o("Text"),
		fontSize: o("Text Size"),
		fontWeight: o("Weight"),
		placeholder: o("Placeholder"),
		shadow: o("Shadow"),
		ringWidth: o("Ring Width"),
		ringColor: o("Ring"),
		opacity: o("Opacity"),
		required: o("Required Mark"),
		fields: o("Fields"),
		list: o("Options"),
		choice: o("Box and Text"),
		arrowColor: o("Arrow"),
		arrowSize: o("Arrow Size"),
		minHeight: o("Minimum Height"),
		resize: o("Resize"),
		size: o("Size"),
		checked: o("Checked"),
		markColor: o("Mark"),
		mark: o("Mark Shape"),
		markWeight: o("Mark Weight"),
		markSize: o("Mark Size"),
		style: o("Style"),
		dotColor: o("Dot"),
		dotSize: o("Dot Size"),
		width: o("Width"),
		off: o("Off"),
		on: o("On"),
		knob: o("Knob"),
		inset: o("Knob Inset"),
		knobShadow: o("Knob Shadow"),
		trackHeight: o("Track Height"),
		track: o("Track"),
		thumbSize: o("Thumb Size"),
		thumb: o("Thumb"),
		thumbBorder: o("Thumb Border"),
		thumbShadow: o("Thumb Shadow"),
		selected: o("Selected"),
		selectedText: o("Selected Text")
	};
	return n[`${e}.${t}`] ?? r[t] ?? t;
}
function pe(e) {
	return {
		sm: o("S"),
		md: o("M"),
		lg: o("L"),
		vertical: o("Vertical"),
		none: o("Fixed"),
		check: o("Check"),
		square: o("Square"),
		dot: o("Dot"),
		light: o("Light"),
		regular: o("Regular"),
		bold: o("Bold"),
		ring: o("Ring")
	}[e] ?? e;
}
function me(e) {
	return {
		hover: o("Hover"),
		focus: o("Focus"),
		invalid: o("Invalid"),
		disabled: o("Disabled")
	}[e];
}
function P(e, t, n, r, i, a = 0) {
	let o = t[n]?.[r];
	if (o !== void 0 && o !== "") return String(o);
	let s = e[n]?.[r];
	if (!s || a > 5) return "";
	if (s.inherits) {
		let [n, r] = s.inherits.split(".");
		return P(e, t, n, r, i, a + 1);
	}
	let c = s.default;
	return Array.isArray(c) ? c.find((e) => !e.startsWith("token:") || i.some((t) => `token:${t.path}` === e)) ?? c[c.length - 1] : c ?? "";
}
function F(e, t, n, r, i) {
	if (e[n][r].type === "choice") return "";
	let [a, s] = [n, r];
	for (let n = 0; n < 6 && e[a]?.[s]?.inherits && t[a]?.[s] === void 0; n++) [a, s] = e[a][s].inherits.split(".");
	let c = e[a]?.[s], l = t[a]?.[s], u = P(e, t, a, s, i), d = u.match(/^token:[a-z]+\.([a-z0-9-]+)$/);
	return d ? d[1] : l === void 0 && c?.hint ? {
		border: o("From border"),
		darker: o("Darker"),
		faint: o("Faint")
	}[c.hint] ?? c.hint : u === "currentColor" ? o("Text color") : u === "0 0 #0000" ? o("None") : e[n][r].type === "shadow" ? o("Soft") : u === "999px" ? o("Round") : u;
}
function he(e, t, n, r, i) {
	let a = r.filter((e) => e.group === "weight");
	return Object.entries(e[n] ?? {}).map(([o, s]) => {
		let c = {
			handle: o,
			label: fe(n, o),
			placeholder: F(e, t, n, o, r)
		};
		switch (s.type) {
			case "color": return {
				...c,
				type: "color",
				component: "blocks-color",
				swatch: N(P(e, t, n, o, r), e, t, r, i)
			};
			case "weight": return {
				...c,
				type: "select",
				size: "sm",
				options: [...a.map((e) => ({
					value: `token:${e.path}`,
					label: `${e.name} · ${e.value}`
				})), ...[
					"300",
					"400",
					"500",
					"600",
					"700"
				].map((e) => ({
					value: e,
					label: e
				}))]
			};
			case "shadow": return {
				...c,
				type: "text",
				component: "blocks-shadows",
				group: "shadow"
			};
			case "opacity": return {
				...c,
				type: "text",
				component: "blocks-value",
				percent: !0,
				step: .05,
				min: 0,
				max: 1
			};
			case "choice": return {
				...c,
				type: "select",
				component: "select",
				display: "segmented",
				required: !0,
				default: s.default,
				options: (s.options ?? []).map((e) => ({
					value: e,
					label: pe(e)
				}))
			};
			default: {
				let e = s.unit ?? (/(Width|inset|Size)$/.test(o) && !/^(size|thumbSize|arrowSize)$/.test(o) || o === "radius" || s.tokens === "radius" ? "px" : "rem");
				return {
					...c,
					type: "text",
					component: "blocks-value",
					unit: e,
					units: e === "%" ? ["%"] : [
						"rem",
						"px",
						"em"
					],
					group: s.tokens,
					min: 0,
					step: e === "rem" ? .125 : 1
				};
			}
		}
	});
}
function ge(e, t) {
	let n = [];
	for (let [r, i] of Object.entries(t)) for (let [t, a] of Object.entries(i)) {
		let i = e[r]?.[t];
		if (!i || i.type === "choice" || a === "" || a === null) continue;
		let o = String(a), s = o.match(/^field:([a-z]+)\.([a-zA-Z]+)$/);
		n.push(`${i.variable}:${s ? `var(${e[s[1]]?.[s[2]]?.variable})` : typeof a == "number" && i.type === "length" && a !== 0 ? `${a}px` : k("", o)}`);
	}
	return n.join(";");
}
function _e({ schema: e, value: t, onChange: n, tokens: r, dark: i, open: a, onOpen: s }) {
	let [c, l] = p("focus"), u = (e, r) => {
		let i = Object.fromEntries(Object.entries(r).filter(([, e]) => e != null && e !== "")), a = Object.fromEntries(Object.entries(t).filter(([t]) => t !== e));
		n(Object.keys(i).length ? {
			...a,
			[e]: i
		} : a);
	}, d = (n, a, o) => {
		let s = he(e, t, n, r, i).filter((e) => !o || o.includes(e.handle)).map((e) => ({
			...e,
			status: t[n]?.[e.handle] === void 0 ? void 0 : "own",
			reset: () => u(n, {
				...t[n],
				[e.handle]: null
			})
		}));
		return /* @__PURE__ */ E("div", {
			className: a ? "mt-3 first:mt-0" : void 0,
			children: [
				a && /* @__PURE__ */ T("h4", {
					className: "m-0 mb-1 text-2xs font-medium uppercase tracking-wide text-faint",
					children: a
				}),
				/* @__PURE__ */ T(m, {
					layout: "inline",
					fields: s.filter((e) => e.component !== "blocks-shadows"),
					values: t[n] ?? {},
					onChange: (e, r) => u(n, {
						...t[n],
						[e]: r
					})
				}),
				s.filter((e) => e.component === "blocks-shadows").map((e) => /* @__PURE__ */ T(m, {
					bare: !0,
					fields: [e],
					values: t[n] ?? {},
					onChange: (e, r) => u(n, {
						...t[n],
						[e]: r
					})
				}, e.handle))
			]
		}, `${n}-${a ?? ""}`);
	}, f = (e) => e.some((e) => Object.keys(t[e] ?? {}).length > 0);
	return /* @__PURE__ */ T(j, {
		title: o("Form Fields"),
		children: de().map((e) => /* @__PURE__ */ T(M, {
			open: a === e.key,
			onToggle: () => s(a === e.key ? null : e.key),
			label: e.label,
			aside: f(e.parts) ? /* @__PURE__ */ T("span", {
				className: "size-1.5 shrink-0 rounded-full bg-focus",
				title: o("Changed")
			}) : void 0,
			menu: f(e.parts) ? /* @__PURE__ */ T(_, {
				trigger: /* @__PURE__ */ T(g, {
					icon: "more",
					label: o("Section Actions"),
					size: "xs",
					className: "shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-[popup-open]:opacity-100"
				}),
				items: [{
					label: o("Reset to Defaults"),
					icon: "undo",
					onSelect: () => n(Object.fromEntries(Object.entries(t).filter(([t]) => !e.parts.includes(t))))
				}]
			}) : void 0,
			children: e.key === "states" ? /* @__PURE__ */ E(w, { children: [/* @__PURE__ */ T("div", {
				className: "mb-2",
				children: /* @__PURE__ */ T(v, {
					size: "xs",
					block: !0,
					"aria-label": o("State"),
					value: c,
					onChange: l,
					options: [
						"hover",
						"focus",
						"invalid",
						"disabled"
					].map((e) => ({
						value: e,
						label: me(e)
					}))
				})
			}), d(c)] }) : e.key === "spacing" ? /* @__PURE__ */ E(w, { children: [d("spacing", void 0, ["size"]), d("spacing", o("Space Between"), [
				"fields",
				"label",
				"list",
				"choice"
			])] }) : e.key === "label" ? /* @__PURE__ */ E(w, { children: [d("label", o("Label")), d("help", o("Help Text"))] }) : d(e.parts[0])
		}, e.key))
	});
}
function ve(e) {
	return de().find((t) => t.key === e)?.specimen ?? null;
}
// admin/src/specimen.tsx
function ye(e, t) {
	if (!e?.head) return;
	let n = e.querySelector("link[rel=\"stylesheet\"][href*=\"/_cms/site/design-\"]"), r = e.getElementById("cms-design-preview");
	t.compiled === null ? (r?.remove(), n && (n.disabled = !1)) : (r || (r = e.createElement("style"), r.id = "cms-design-preview", n ? n.after(r) : e.head.appendChild(r)), r.textContent !== t.compiled && (r.textContent = t.compiled), n && (n.disabled = !0));
	let i = e.getElementById("cms-token-preview");
	i || (i = e.createElement("style"), i.id = "cms-token-preview", e.head.appendChild(i));
	let a = t.vars ? `:root:root:root{${t.vars}}` : "";
	i.textContent !== a && (i.textContent = a), e.documentElement.dataset.theme !== t.mode && (e.documentElement.dataset.theme = t.mode);
}
function be(e, t, n) {
	if (!e?.body) return;
	for (let t of e.querySelectorAll("[data-part][data-active]")) t.removeAttribute("data-active");
	let r = t ? e.querySelector(`[data-part="${CSS.escape(t)}"]`) : null;
	r && (r.setAttribute("data-active", ""), r.scrollIntoView({
		behavior: n ? "smooth" : "instant",
		block: "nearest"
	}));
}
// admin/src/DesignTokens.tsx
var xe = [
	"color",
	"type",
	"space",
	"sizes",
	"shape",
	"motion",
	"elements",
	"prose",
	"buttons",
	"fields",
	"code"
];
function Se() {
	return [{
		group: o("Tokens"),
		items: [
			{
				value: "color",
				label: o("Colors"),
				icon: "palette"
			},
			{
				value: "type",
				label: o("Typography"),
				icon: "typography"
			},
			{
				value: "space",
				label: o("Spacing"),
				icon: "spacing"
			},
			{
				value: "sizes",
				label: o("Sizes"),
				icon: "ruler"
			},
			{
				value: "shape",
				label: o("Shape"),
				icon: "radius"
			},
			{
				value: "motion",
				label: o("Motion"),
				icon: "speed"
			}
		]
	}, {
		group: o("Styles"),
		items: [
			{
				value: "elements",
				label: o("Elements"),
				icon: "paragraph"
			},
			{
				value: "prose",
				label: o("Prose"),
				icon: "article"
			},
			{
				value: "buttons",
				label: o("Buttons"),
				icon: "button"
			},
			{
				value: "fields",
				label: o("Form Fields"),
				icon: "form-input"
			},
			{
				value: "code",
				label: o("Custom Code"),
				icon: "code"
			}
		]
	}];
}
function Ce(e) {
	return {
		color: o("New Color"),
		font: o("New Font Family"),
		text: o("New Text Size"),
		weight: o("New Weight"),
		leading: o("New Line Height"),
		tracking: o("New Letter Spacing"),
		space: o("New Spacing"),
		container: o("New Container"),
		breakpoint: o("New Breakpoint"),
		radius: o("New Radius"),
		shadow: o("New Shadow"),
		duration: o("New Duration"),
		ease: o("New Easing")
	}[e] ?? o("New Token");
}
var we = {
	desktop: "100%",
	tablet: `${x.tablet}px`,
	phone: `${x.phone}px`
};
function Te({ viewport: e, desktop: t, children: n }) {
	let r = f(null), [i, a] = p({
		width: 0,
		height: 0
	});
	u(() => {
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
	let o = e === "desktop" ? Math.max(i.width, t) : parseFloat(we[e]), s = i.width ? Math.min(1, i.width / o) : 1;
	return /* @__PURE__ */ T("div", {
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
var I = (e, t) => JSON.stringify(e ?? null) === JSON.stringify(t ?? null);
function Ee(e) {
	return {
		tokens: e.tokens.map((e) => ({
			...e,
			from: e.path
		})),
		styles: e.styles ?? {},
		prose: e.prose ?? {},
		buttons: e.buttons ?? {},
		fields: e.fields ?? {},
		transition: e.transition ?? {
			type: "none",
			duration: .3
		},
		css: e.css ?? "",
		js: e.js ?? ""
	};
}
function De(e, t, n) {
	let r = RegExp(`token:${t.replace(/[.-]/g, "\\$&")}(?![a-z0-9-])`, "g"), i = (e) => JSON.parse(JSON.stringify(e ?? null).replace(r, `token:${n}`));
	return {
		...e,
		styles: i(e.styles),
		prose: i(e.prose),
		buttons: i(e.buttons),
		fields: i(e.fields),
		tokens: e.tokens.map((e) => e.path === t ? {
			...e,
			path: n,
			name: n.split(".")[1]
		} : {
			...e,
			value: i(e.value),
			dark: i(e.dark)
		})
	};
}
function Oe(e, t) {
	let n = new Map(e.tokens.map((e) => [e.path, e])), r = new Set(t.tokens.map((e) => e.from).filter(Boolean)), i = {
		tokens: {},
		dark: {},
		rename: {},
		remove: e.tokens.filter((e) => !r.has(e.path)).map((e) => e.path)
	};
	for (let e of t.tokens) {
		let t = e.from ? n.get(e.from) : void 0;
		t && t.path !== e.path && (i.rename[t.path] = e.path), t && I(t.value, e.value) || (i.tokens[e.path] = e.value), t && I(t.dark || null, e.dark || null) || (i.dark[e.path] = e.dark || null);
	}
	for (let n of [
		"styles",
		"prose",
		"buttons",
		"fields",
		"transition"
	]) I(e[n], t[n]) || (i[n] = t[n]);
	return i;
}
function ke() {
	let l = s("design/get", {}, {
		refetchOnWindowFocus: !1,
		retry: !1
	}), _ = d(() => l.data ? Ee(l.data) : null, [l.data]), [b, x] = p(null), [D, le] = c(xe), [M, ue] = p("light"), [N, de] = p("desktop"), [fe, pe] = p(!1), [me, P] = p(null), F = ce(), [he, ke] = p(null), [V, Me] = p(null), [H, Ne] = p(null), [Pe, Fe] = p(null), U = f(null), W = b ?? _, G = !!b && !!_ && !I(b, _), K = (e) => _ && x((t) => e(t ?? _)), Ve = d(() => G && _ && b ? {
		...Oe(_, b),
		css: b.css
	} : null, [
		G,
		_,
		b
	]);
	u(() => {
		if (!Ve) return ke(null);
		let e = !0, t = setTimeout(() => {
			a("design/preview", Ve).then((t) => e && ke(t.css), () => {});
		}, 150);
		return () => {
			e = !1, clearTimeout(t);
		};
	}, [Ve]);
	let He = d(() => (W?.tokens ?? []).map((e) => `${O(e.group, e.name)}:${k(e.group, M === "dark" && e.dark ? e.dark : e.value)}`).join(";"), [W, M]), Ue = {
		compiled: he,
		vars: G ? [He, ge(l.data?.fieldStyles ?? {}, W?.fields ?? {})].filter(Boolean).join(";") : "",
		mode: M
	}, We = () => ye(U.current?.contentDocument, Ue), q = D === "fields" || D === "buttons" || D === "sizes" || D === "prose" ? `/__specimen/${D}` : "/", Ge = D === "fields" ? ve(Pe) : D === "buttons" ? V : D === "prose" && H?.replace(/:.*$/, "") || null;
	u(() => be(U.current?.contentDocument, Ge, !0), [Ge]), u(We), u(() => {
		let e = document.createElement("style");
		return e.textContent = (l.data?.fonts ?? []).map((e) => `@font-face{font-family:"${e.family}";src:url("${/^(https:\/\/|\/)/.test(e.src) ? e.src : `/_cms/fonts/${e.src.split("/").pop()}`}") format("woff2");font-weight:${e.weight ?? "400"};font-style:${e.style ?? "normal"};font-display:swap}`).join("\n"), document.head.appendChild(e), () => e.remove();
	}, [l.data?.fonts]);
	let Ke = async () => {
		if (G && !fe && _ && b) {
			pe(!0), P(null);
			try {
				let e = Oe(_, b);
				(Object.keys(e.tokens).length + Object.keys(e.dark).length + Object.keys(e.rename).length + e.remove.length > 0 || [
					"styles",
					"prose",
					"buttons",
					"fields",
					"transition"
				].some((t) => t in e)) && await a("design/update", e), (b.css !== _.css || b.js !== _.js) && await a("design/code", {
					css: b.css,
					...r("site.code") ? { js: b.js } : {}
				}), await i.invalidateQueries({ predicate: (e) => typeof e.queryKey[0] == "string" && e.queryKey[0].startsWith("design/") }), x(null), U.current?.contentWindow?.location.reload();
			} catch (e) {
				P(e instanceof Error ? e.message : String(e));
			} finally {
				pe(!1);
			}
		}
	};
	if (l.isLoading) return /* @__PURE__ */ T("div", {
		className: "grid h-full place-items-center text-faint",
		children: /* @__PURE__ */ T(ie, {})
	});
	if (!l.data || !W) return /* @__PURE__ */ E("div", {
		className: "flex h-full flex-col",
		children: [/* @__PURE__ */ T(oe, { crumbs: [{
			label: o("Design System"),
			icon: "palette"
		}] }), /* @__PURE__ */ T(ee, {
			icon: "palette",
			title: o("The design system could not be loaded"),
			description: l.error?.message
		})]
	});
	let J = W.tokens, Y = (e) => J.filter((t) => t.group === e), qe = (e, t) => K((n) => ({
		...n,
		tokens: n.tokens.map((n) => n.path === e.path ? {
			...n,
			...t
		} : n)
	})), Je = (e) => K((t) => ({
		...t,
		tokens: t.tokens.filter((t) => t.path !== e.path)
	})), Ye = async (e, t, n = "") => {
		let r = await S({
			title: e,
			description: n ? o("Blocks that use token:{path} keep the old name.", { path: `${t}.${n}` }) : void 0,
			fields: [{
				handle: "name",
				type: "text",
				label: o("Name"),
				mono: !0,
				autofocus: !0,
				placeholder: t === "color" ? "brand" : "md"
			}],
			values: { name: n },
			confirm: o(n ? "Rename" : "Add")
		}), i = String(r?.name ?? "").trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/^-+/, "");
		return !i || i === n ? null : J.some((e) => e.path === `${t}.${i}`) ? (C.error(o("“{name}” already exists", { name: i })), null) : i;
	}, X = async (e, t) => {
		let n = await Ye(Ce(e), e);
		n && K((r) => ({
			...r,
			tokens: [...r.tokens, {
				path: `${e}.${n}`,
				group: e,
				name: n,
				value: t,
				dark: null
			}]
		}));
	}, Z = {
		rename: async (e) => {
			let t = await Ye(o("Rename Token"), e.group, e.name);
			t && K((n) => De(n, e.path, `${e.group}.${t}`));
		},
		remove: Je
	}, Xe = (e, t) => K((n) => {
		let r = t == null || t === "", i = n.tokens.some((t) => t.path === e);
		return r ? {
			...n,
			tokens: n.tokens.filter((t) => t.path !== e)
		} : i ? {
			...n,
			tokens: n.tokens.map((n) => n.path === e ? {
				...n,
				value: t
			} : n)
		} : {
			...n,
			tokens: [...n.tokens, {
				path: e,
				group: "control",
				name: e.split(".")[1],
				value: t,
				dark: null
			}]
		};
	}), Q = (e, t, n = "value") => /* @__PURE__ */ T(m, {
		bare: !0,
		className: y("flex min-w-0 flex-1", !["site-size", "blocks-color"].includes(String(t.component)) && "pr-8"),
		fields: [{
			handle: `${e.path}:${n}`,
			type: "text",
			label: e.name,
			size: "sm",
			mono: !0,
			...t
		}],
		values: { [`${e.path}:${n}`]: e[n] },
		onChange: (t, r) => qe(e, { [n]: n === "dark" ? r || null : r ?? e[n] })
	}), $ = (e, t = {}) => ({
		component: "blocks-value",
		unit: e,
		...t
	}), Ze = Object.fromEntries(J.map((e) => [O(e.group, e.name), k(e.group, M === "dark" && e.dark ? e.dark : e.value)])), Qe = k("ease", Y("ease")[0]?.value ?? "cubic-bezier(0.2, 0.8, 0.2, 1)"), $e = [...new Set((l.data.fonts ?? []).map((e) => e.family))], et = () => {
		l.refetch(), U.current?.contentWindow?.location.reload();
	}, tt = $e.map((e) => ({
		family: e,
		styles: je((l.data.fonts ?? []).filter((t) => t.family === e)),
		used: Y("font").some((n) => t(n.value)[0] === e)
	})), nt = async (e) => {
		try {
			if (e === "google") {
				let e = await S({
					title: o("Add a Google Font"),
					description: o("Its files are downloaded to your site."),
					fields: [{
						handle: "family",
						type: "text",
						label: o("Name"),
						placeholder: "Inter Tight",
						autofocus: !0
					}],
					confirm: o("Add")
				}), t = String(e?.family ?? "").trim();
				return t ? (await a("design/fonts-import", { family: t }), C.success(o("{family} added", { family: t })), et(), t) : null;
			}
			let t = await new Promise((e) => {
				let t = document.createElement("input");
				t.type = "file", t.accept = ".woff2,font/woff2", t.onchange = () => e(t.files?.[0] ?? null), t.oncancel = () => e(null), t.click();
			});
			if (!t) return null;
			let n = await new Promise((e) => {
				let n = new FileReader();
				n.onload = () => e(String(n.result)), n.readAsDataURL(t);
			}), r = t.name.replace(/\.woff2$/i, ""), i = await S({
				title: o("Upload Font"),
				fields: [{
					handle: "family",
					type: "text",
					label: o("Family Name"),
					autofocus: !0
				}],
				values: { family: r.replace(/[-_](regular|bold|variable|italic|\d+).*$/i, "").replace(/[-_]/g, " ") },
				confirm: o("Upload")
			}), s = String(i?.family ?? "").trim();
			return s ? (await a("design/fonts-upload", {
				family: s,
				name: r,
				data: n,
				weight: /variable/i.test(r) ? "100 900" : "400",
				style: /italic/i.test(r) ? "italic" : "normal"
			}), C.success(o("{family} uploaded", { family: s })), et(), s) : null;
		} catch (e) {
			return C.error(e), null;
		}
	}, rt = async (e) => {
		if (await se({
			title: o("Remove {family}?", { family: e }),
			description: o("Its files are deleted from your site."),
			confirm: o("Remove"),
			danger: !0
		})) try {
			await a("design/update", { fonts: (l.data.fonts ?? []).filter((t) => t.family !== e) }), et();
		} catch (e) {
			C.error(e);
		}
	};
	return /* @__PURE__ */ E("div", {
		className: "flex h-full flex-col",
		children: [
			/* @__PURE__ */ T(oe, {
				crumbs: [{
					label: o("Design System"),
					icon: "palette"
				}, { label: Se().flatMap((e) => e.items).find((e) => e.value === D)?.label ?? "" }],
				actions: /* @__PURE__ */ T(ae, {
					content: o("Open Site"),
					children: /* @__PURE__ */ T(g, {
						icon: "external",
						label: o("Open Site"),
						onClick: () => window.open("/", "_blank", "noopener")
					})
				})
			}),
			/* @__PURE__ */ T(ne, {
				title: o("Design System"),
				backTo: "/",
				backLabel: o("Dashboard"),
				nested: !0,
				children: /* @__PURE__ */ T("nav", {
					"aria-label": o("Design System"),
					className: F.nested ? "space-y-px" : "px-2 pb-4",
					children: Se().map((e, t) => /* @__PURE__ */ E("div", {
						className: y("space-y-px", t > 0 && (F.nested ? "mt-1" : "mt-4")),
						children: [!F.nested && /* @__PURE__ */ T("div", {
							className: "cms-label flex h-7 items-center px-2",
							children: e.group
						}), e.items.map((e) => /* @__PURE__ */ T(re, {
							label: e.label,
							icon: F.nested ? void 0 : e.icon,
							active: D === e.value,
							onClick: () => le(e.value)
						}, e.value))]
					}, e.group))
				})
			}),
			/* @__PURE__ */ T(te, {
				dirty: G,
				saving: fe,
				error: me,
				onSave: () => void Ke(),
				onDiscard: () => {
					x(null), P(null);
				}
			}),
			/* @__PURE__ */ E("div", {
				className: "grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(340px,420px)_minmax(0,1fr)] xl:grid-cols-[minmax(380px,460px)_minmax(0,1fr)]",
				children: [/* @__PURE__ */ E("div", {
					className: "overflow-y-auto border-border px-4 pb-16 pt-2 md:border-r",
					children: [
						D === "color" && /* @__PURE__ */ E(j, {
							title: o("Colors"),
							onAdd: () => X("color", "#000000"),
							children: [/* @__PURE__ */ E("div", {
								className: "flex h-7 items-center gap-2 text-2xs text-faint",
								children: [
									/* @__PURE__ */ T("span", {
										className: "min-w-0 flex-1",
										children: o("Name")
									}),
									/* @__PURE__ */ E("span", {
										className: y(L, "flex items-center gap-1"),
										children: [/* @__PURE__ */ T(h, {
											name: "sun",
											size: 11
										}), o("Light")]
									}),
									/* @__PURE__ */ E("span", {
										className: y(L, "flex items-center gap-1"),
										children: [/* @__PURE__ */ T(h, {
											name: "moon",
											size: 11
										}), o("Dark")]
									}),
									/* @__PURE__ */ T("span", { className: "w-6 shrink-0" })
								]
							}), Y("color").map((e) => /* @__PURE__ */ E(R, {
								token: e,
								...Z,
								wide: !0,
								children: [/* @__PURE__ */ T("div", {
									className: L,
									children: Q(e, {
										type: "color",
										component: "blocks-color"
									})
								}), /* @__PURE__ */ T("div", {
									className: L,
									children: Q(e, {
										type: "color",
										component: "blocks-color",
										placeholder: o("Same")
									}, "dark")
								})]
							}, e.from ?? e.path))]
						}),
						D === "type" && /* @__PURE__ */ E(w, { children: [
							/* @__PURE__ */ T(j, {
								title: o("Fonts"),
								onAdd: () => X("font", [
									...$e[0] ? [$e[0]] : [],
									"ui-sans-serif",
									"system-ui",
									"sans-serif"
								]),
								children: Y("font").map((r) => /* @__PURE__ */ T(R, {
									token: r,
									...Z,
									sample: /* @__PURE__ */ T("span", {
										className: "block max-w-7 overflow-hidden whitespace-nowrap text-center text-[17px] leading-none text-ink",
										style: { fontFamily: k("font", r.value) },
										children: "Aa"
									}),
									extra: [
										{
											separator: !0,
											label: ""
										},
										{
											heading: !0,
											label: o("Fallback")
										},
										...[
											"sans",
											"serif",
											"mono"
										].map((i) => ({
											label: {
												sans: o("Sans"),
												serif: o("Serif"),
												mono: o("Mono")
											}[i],
											checked: e(t(r.value)) === i,
											onSelect: () => qe(r, { value: n(r.value, i) })
										}))
									],
									children: Q(r, {
										component: "site-font-stack",
										fonts: tt,
										onAdd: nt,
										onRemove: rt
									})
								}, r.from ?? r.path))
							}),
							/* @__PURE__ */ T(j, {
								title: o("Type Scale"),
								onAdd: () => X("text", {
									min: "1rem",
									max: "1.25rem"
								}),
								children: Y("text").map((e) => /* @__PURE__ */ T(R, {
									token: e,
									...Z,
									below: /* @__PURE__ */ T("p", {
										className: "m-0 truncate pb-2.5 leading-[1.1] tracking-[-0.01em] text-ink",
										style: {
											fontSize: k("text", e.value),
											fontFamily: k("font", Y("font").find((e) => e.name === "display")?.value ?? Y("font")[0]?.value)
										},
										children: o("Ship It")
									}),
									children: Q(e, { component: "site-size" })
								}, e.from ?? e.path))
							}),
							/* @__PURE__ */ T(j, {
								title: o("Weights"),
								onAdd: () => X("weight", "600"),
								children: Y("weight").map((e) => /* @__PURE__ */ T(R, {
									token: e,
									...Z,
									sample: /* @__PURE__ */ T("span", {
										className: "text-base text-ink",
										style: { fontWeight: Number(e.value) || 400 },
										children: "Ag"
									}),
									children: Q(e, $("", {
										step: 100,
										min: 100,
										max: 900
									}))
								}, e.from ?? e.path))
							}),
							/* @__PURE__ */ T(j, {
								title: o("Line Heights"),
								onAdd: () => X("leading", "1.5"),
								children: Y("leading").map((e) => /* @__PURE__ */ T(R, {
									token: e,
									...Z,
									sample: /* @__PURE__ */ T("span", {
										className: "flex w-4 flex-col",
										style: { gap: `${Math.max(1, (Number(e.value) - .8) * 6)}px` },
										children: [
											0,
											1,
											2
										].map((e) => /* @__PURE__ */ T("span", { className: y("h-0.5 rounded-full bg-muted", e === 2 && "w-2/3") }, e))
									}),
									children: Q(e, $("", {
										step: .05,
										min: 0
									}))
								}, e.from ?? e.path))
							}),
							/* @__PURE__ */ T(j, {
								title: o("Letter Spacing"),
								onAdd: () => X("tracking", "0em"),
								children: Y("tracking").map((e) => /* @__PURE__ */ T(R, {
									token: e,
									...Z,
									sample: /* @__PURE__ */ T("span", {
										className: "text-xs font-medium text-ink",
										style: { letterSpacing: k("tracking", e.value) },
										children: "Aa"
									}),
									children: Q(e, $("em", {
										units: ["em", "px"],
										step: .005
									}))
								}, e.from ?? e.path))
							})
						] }),
						D === "space" && /* @__PURE__ */ E(w, { children: [
							/* @__PURE__ */ T(j, {
								title: o("Spacing"),
								onAdd: () => X("space", "1rem"),
								children: Y("space").map((e) => /* @__PURE__ */ T(R, {
									token: e,
									...Z,
									after: /* @__PURE__ */ T(B, {
										value: e.value,
										of: Y("space")
									}),
									children: Q(e, { component: "site-size" })
								}, e.from ?? e.path))
							}),
							/* @__PURE__ */ T(j, {
								title: o("Containers"),
								onAdd: () => X("container", "72rem"),
								children: Y("container").map((e) => /* @__PURE__ */ T(R, {
									token: e,
									...Z,
									after: /* @__PURE__ */ T(B, {
										value: e.value,
										of: Y("container")
									}),
									children: Q(e, { component: "site-size" })
								}, e.from ?? e.path))
							}),
							/* @__PURE__ */ T(j, {
								title: o("Breakpoints"),
								onAdd: () => X("breakpoint", "768px"),
								children: Y("breakpoint").map((e) => /* @__PURE__ */ T(R, {
									token: e,
									...Z,
									after: /* @__PURE__ */ T(B, {
										value: e.value,
										of: Y("breakpoint")
									}),
									children: Q(e, $("px", {
										units: [
											"px",
											"rem",
											"em"
										],
										min: 0
									}))
								}, e.from ?? e.path))
							})
						] }),
						D === "shape" && /* @__PURE__ */ E(w, { children: [/* @__PURE__ */ T(j, {
							title: o("Radius"),
							onAdd: () => X("radius", "0.5rem"),
							children: Y("radius").map((e) => /* @__PURE__ */ T(R, {
								token: e,
								...Z,
								sample: /* @__PURE__ */ T("span", {
									className: "size-5 translate-x-0.5 translate-y-0.5 border-l-[1.5px] border-t-[1.5px] border-muted",
									style: { borderTopLeftRadius: `min(${k("radius", e.value)}, 20px)` }
								}),
								children: Q(e, $("px", {
									units: [
										"px",
										"rem",
										"%"
									],
									min: 0
								}))
							}, e.from ?? e.path))
						}), /* @__PURE__ */ T(j, {
							title: o("Shadows"),
							onAdd: () => X("shadow", "0 4px 16px -4px rgb(0 0 0 / 0.12)"),
							children: Y("shadow").map((e) => /* @__PURE__ */ T(R, {
								token: e,
								...Z,
								sample: /* @__PURE__ */ T("span", {
									className: "size-5 shrink-0 rounded-[5px] border border-border bg-bg",
									style: { boxShadow: k("shadow", e.value) }
								}),
								children: Q(e, { component: "site-shadow" })
							}, e.from ?? e.path))
						})] }),
						D === "motion" && /* @__PURE__ */ E(w, { children: [
							/* @__PURE__ */ E(j, {
								title: o("Page Transition"),
								children: [/* @__PURE__ */ T(z, {
									label: o("Effect"),
									children: /* @__PURE__ */ T(m, {
										bare: !0,
										className: "flex min-w-0 flex-1",
										fields: [{
											handle: "type",
											type: "select",
											label: o("Effect"),
											size: "sm",
											required: !0,
											options: {
												none: o("None"),
												fade: o("Fade"),
												slide: o("Slide"),
												scale: o("Scale")
											}
										}],
										values: W.transition,
										onChange: (e, t) => K((e) => ({
											...e,
											transition: {
												...e.transition,
												type: String(t ?? "none")
											}
										}))
									})
								}), W.transition.type !== "none" && /* @__PURE__ */ T(z, {
									label: o("Duration"),
									children: /* @__PURE__ */ T(m, {
										bare: !0,
										className: "flex min-w-0 flex-1",
										fields: [{
											handle: "duration",
											type: "text",
											component: "blocks-value",
											label: o("Duration"),
											unit: "ms",
											units: ["ms"],
											step: 10,
											min: 50,
											max: 2e3
										}],
										values: { duration: `${Math.round(W.transition.duration * 1e3)}ms` },
										onChange: (e, t) => K((e) => ({
											...e,
											transition: {
												...e.transition,
												duration: Ae(t, e.transition.duration)
											}
										}))
									})
								})]
							}),
							/* @__PURE__ */ T(j, {
								title: o("Durations"),
								onAdd: () => X("duration", "300ms"),
								children: Y("duration").map((e) => /* @__PURE__ */ T(R, {
									token: e,
									...Z,
									sample: /* @__PURE__ */ T("span", {
										className: "relative h-3 w-6",
										children: /* @__PURE__ */ T("span", {
											className: "absolute left-0 top-1/2 size-2 -translate-y-1/2 rounded-full bg-muted transition-transform group-hover:translate-x-4",
											style: {
												transitionDuration: k("duration", e.value),
												transitionTimingFunction: Qe
											}
										})
									}),
									children: Q(e, $("ms", {
										units: ["ms"],
										step: 10,
										min: 0
									}))
								}, e.from ?? e.path))
							}),
							/* @__PURE__ */ T(j, {
								title: o("Easing"),
								onAdd: () => X("ease", "cubic-bezier(0.2, 0.8, 0.2, 1)"),
								children: Y("ease").map((e) => /* @__PURE__ */ T(R, {
									token: e,
									...Z,
									children: Q(e, { component: "ease" })
								}, e.from ?? e.path))
							})
						] }),
						D === "elements" && /* @__PURE__ */ T(w, { children: /* @__PURE__ */ T(Ie, {
							title: o("Elements"),
							options: l.data.elements ?? [],
							tokens: J,
							vars: Ze,
							value: W.styles,
							onChange: (e) => K((t) => ({
								...t,
								styles: e
							}))
						}) }),
						D === "prose" && /* @__PURE__ */ T(Le, {
							value: W.prose,
							options: l.data.proseElements ?? [],
							tokens: J,
							vars: Ze,
							open: H,
							onOpen: Ne,
							onChange: (e) => K((t) => ({
								...t,
								prose: e
							}))
						}),
						D === "sizes" && /* @__PURE__ */ T(Re, {
							defaults: l.data.controlSizes ?? {},
							tokens: J,
							onSet: Xe
						}),
						D === "buttons" && /* @__PURE__ */ T(ze, {
							value: W.buttons,
							tokens: J,
							open: V,
							onOpen: Me,
							onChange: (e) => K((t) => ({
								...t,
								buttons: e
							}))
						}),
						D === "fields" && /* @__PURE__ */ T(_e, {
							schema: l.data.fieldStyles ?? {},
							value: W.fields,
							tokens: J,
							dark: M === "dark",
							open: Pe,
							onOpen: Fe,
							onChange: (e) => K((t) => ({
								...t,
								fields: e
							}))
						}),
						D === "code" && /* @__PURE__ */ T(Be, {
							css: W.css,
							js: W.js,
							onChange: (e) => K((t) => ({
								...t,
								...e
							}))
						})
					]
				}, D), /* @__PURE__ */ E("div", {
					className: "flex min-w-0 flex-col bg-sunken max-md:hidden",
					children: [/* @__PURE__ */ E("div", {
						className: "flex h-10 shrink-0 items-center gap-2 border-b border-border bg-bg px-3",
						children: [
							/* @__PURE__ */ T(v, {
								size: "xs",
								value: N,
								onChange: de,
								options: [
									{
										value: "desktop",
										icon: "desktop",
										title: o("Desktop")
									},
									{
										value: "tablet",
										icon: "tablet",
										title: o("Tablet")
									},
									{
										value: "phone",
										icon: "phone",
										title: o("Phone")
									}
								]
							}),
							N !== "desktop" && /* @__PURE__ */ T("span", {
								className: "font-mono text-2xs text-faint",
								children: we[N]
							}),
							/* @__PURE__ */ T("span", { className: "flex-1" }),
							/* @__PURE__ */ T(v, {
								size: "xs",
								value: M,
								onChange: ue,
								options: [{
									value: "light",
									icon: "sun",
									title: o("Light")
								}, {
									value: "dark",
									icon: "moon",
									title: o("Dark")
								}]
							})
						]
					}), /* @__PURE__ */ T(Te, {
						viewport: N,
						desktop: q === "/" ? A(l.data.breakpoints?.lg) || 1024 : 0,
						children: (e) => /* @__PURE__ */ T("iframe", {
							ref: U,
							src: q,
							title: o(q === "/" ? "Site Preview" : "Specimen"),
							className: y("border-0 bg-bg", N !== "desktop" && "border-x border-border"),
							style: e,
							onLoad: () => {
								We(), be(U.current?.contentDocument, Ge, !1);
							}
						}, q)
					})]
				})]
			})
		]
	});
}
var L = "w-[108px] shrink-0 max-sm:w-[92px]";
function Ae(e, t) {
	let n = String(e ?? "").trim().match(/^(\d*\.?\d+)\s*(ms|s)?$/);
	if (!n) return t;
	let r = n[2] === "s" ? Number(n[1]) : Number(n[1]) / 1e3;
	return Math.min(2, Math.max(.05, Math.round(r * 1e3) / 1e3));
}
function R({ token: e, sample: t, after: n, below: r, wide: i, rename: a, remove: s, extra: c, children: l }) {
	let u = `token:${e.path}`, d = () => void b(u, { copied: o("Copied {reference}", { reference: u }) });
	return /* @__PURE__ */ E("div", {
		className: "group border-b border-border last:border-b-0",
		children: [/* @__PURE__ */ E("div", {
			className: "flex min-h-9 items-center gap-2 py-1",
			children: [
				t !== void 0 && /* @__PURE__ */ T("span", {
					className: "grid w-7 shrink-0 place-items-center",
					children: t
				}),
				/* @__PURE__ */ T(ae, {
					content: /* @__PURE__ */ T("span", {
						className: "font-mono",
						children: u
					}),
					children: /* @__PURE__ */ T("button", {
						type: "button",
						onClick: d,
						title: e.name,
						className: y("h-6 truncate rounded-xs text-left text-xs text-text hover:text-ink", i ? "min-w-0 flex-1" : t === void 0 ? "w-[120px] shrink-0 max-sm:w-20" : "w-[84px] shrink-0 max-sm:w-16"),
						children: e.name
					})
				}),
				i ? l : /* @__PURE__ */ T("div", {
					className: "flex w-60 min-w-0 shrink max-lg:w-52 max-sm:w-auto max-sm:flex-1",
					children: l
				}),
				!i && /* @__PURE__ */ T("span", {
					className: "flex min-w-0 flex-1 items-center max-sm:hidden",
					children: n
				}),
				/* @__PURE__ */ T(_, {
					trigger: /* @__PURE__ */ T(g, {
						icon: "more",
						label: o("Token Actions"),
						size: "xs",
						className: "shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-[popup-open]:opacity-100"
					}),
					items: [
						{
							label: o("Copy Reference"),
							icon: "copy",
							onSelect: d
						},
						{
							label: o("Rename…"),
							icon: "edit",
							onSelect: () => a(e)
						},
						...c ?? [],
						{
							separator: !0,
							label: ""
						},
						{
							label: o("Delete"),
							icon: "trash",
							danger: !0,
							onSelect: () => s(e)
						}
					]
				})
			]
		}), r]
	});
}
function z({ label: e, children: t }) {
	return /* @__PURE__ */ E("div", {
		className: "flex min-h-9 items-center gap-2 border-b border-border py-1 last:border-b-0",
		children: [
			/* @__PURE__ */ T("span", {
				className: "w-[120px] shrink-0 truncate text-xs text-text",
				children: e
			}),
			/* @__PURE__ */ T("div", {
				className: "flex w-60 min-w-0 shrink pr-8 max-lg:w-52",
				children: t
			}),
			/* @__PURE__ */ T("span", { className: "min-w-0 flex-1 max-sm:hidden" }),
			/* @__PURE__ */ T("span", { className: "size-6 shrink-0" })
		]
	});
}
function B({ value: e, of: t }) {
	let n = Math.max(...t.map((e) => A(e.value)), 1);
	return A(e) <= 0 ? null : /* @__PURE__ */ T("span", {
		className: "h-1.5 min-w-px rounded-full bg-border-strong",
		style: { width: `${A(e) / n * 100}%` }
	});
}
function je(e) {
	let t = e.flatMap((e) => String(e.weight ?? "400").split(/\s+/).map(Number)).filter((e) => e > 0), n = Math.min(...t), r = Math.max(...t), i = t.length === 0 ? "400" : n === r ? String(n) : `${n}–${r}`;
	return e.some((e) => e.style === "italic") ? `${i} · ${o("Italic")}` : i;
}
function V(e) {
	return {
		html: o("Page"),
		body: o("Body"),
		h1: o("Heading 1"),
		h2: o("Heading 2"),
		h3: o("Heading 3"),
		h4: o("Heading 4"),
		h5: o("Heading 5"),
		h6: o("Heading 6"),
		p: o("Paragraph"),
		a: o("Link"),
		"a:hover": o("Link on Hover"),
		small: o("Small Text"),
		strong: o("Bold Text"),
		em: o("Italic Text"),
		mark: o("Highlight"),
		code: o("Code"),
		kbd: o("Keyboard Key"),
		pre: o("Code Block"),
		blockquote: o("Quote"),
		hr: o("Divider"),
		ul: o("Bulleted List"),
		ol: o("Numbered List"),
		li: o("List Item"),
		img: o("Image"),
		figcaption: o("Caption"),
		table: o("Table"),
		th: o("Table Header"),
		td: o("Table Cell"),
		"::selection": o("Selected Text"),
		":focus-visible": o("Focus Ring"),
		"h1 em": o("Italic in Heading 1"),
		"h2 em": o("Italic in Heading 2"),
		"h3 em": o("Italic in Heading 3"),
		"h1 strong": o("Bold in Heading 1"),
		"h2 strong": o("Bold in Heading 2")
	}[e] ?? e;
}
var Me = {
	font: "fontFamily",
	size: "fontSize",
	weight: "fontWeight",
	leading: "lineHeight",
	tracking: "letterSpacing",
	transform: "textTransform",
	decoration: "textDecoration",
	underlineOffset: "textUnderlineOffset",
	wrap: "textWrap",
	style: "fontStyle",
	features: "fontFeatureSettings",
	background: "backgroundColor",
	radius: "borderRadius"
}, H = /* @__PURE__ */ new Set([
	"fontWeight",
	"lineHeight",
	"opacity",
	"zIndex"
]);
function Ne(e) {
	return Object.fromEntries(Object.entries(e ?? {}).map(([e, t]) => [Me[e] ?? e, t]));
}
function Pe(e) {
	return Object.fromEntries(Object.entries(Ne(e)).map(([e, t]) => [e, typeof t == "number" && !H.has(e) && t !== 0 ? `${t}px` : k("", t)]));
}
function Fe(e) {
	let t = (t) => e.filter((e) => e.group === t);
	return [
		{
			handle: "fontFamily",
			type: "select",
			size: "sm",
			label: o("Font"),
			placeholder: o("Inherit"),
			options: t("font").map((e) => ({
				value: `token:${e.path}`,
				label: e.name
			}))
		},
		{
			handle: "fontSize",
			type: "text",
			component: "blocks-value",
			label: o("Size"),
			group: "text",
			placeholder: o("Inherit"),
			unit: "rem",
			units: [
				"rem",
				"px",
				"em",
				"%"
			],
			step: .125
		},
		{
			handle: "fontWeight",
			type: "select",
			size: "sm",
			label: o("Weight"),
			placeholder: o("Inherit"),
			options: [...t("weight").map((e) => ({
				value: `token:${e.path}`,
				label: `${e.name} · ${e.value}`
			})), ...[
				"100",
				"200",
				"300",
				"400",
				"500",
				"600",
				"700",
				"800",
				"900"
			].map((e) => ({
				value: e,
				label: e
			}))]
		},
		{
			handle: "lineHeight",
			type: "text",
			component: "blocks-value",
			label: o("Line Height"),
			group: "leading",
			unit: "",
			step: .05,
			placeholder: o("Inherit")
		},
		{
			handle: "letterSpacing",
			type: "text",
			component: "blocks-value",
			label: o("Letter Spacing"),
			group: "tracking",
			unit: "em",
			units: ["em", "px"],
			step: .005,
			placeholder: "0"
		},
		{
			handle: "color",
			type: "color",
			component: "blocks-color",
			label: o("Color"),
			placeholder: o("Inherit")
		}
	];
}
function U() {
	return [
		{
			handle: "backgroundColor",
			type: "color",
			component: "blocks-color",
			label: o("Fill"),
			placeholder: o("None")
		},
		{
			handle: "border",
			type: "group",
			component: "blocks-group",
			label: o("Border"),
			fields: [{
				handle: "borderWidth",
				type: "text",
				component: "blocks-value",
				label: o("Border Width"),
				placeholder: "0",
				min: 0,
				className: "!flex-none w-[64px]"
			}, {
				handle: "borderColor",
				type: "color",
				component: "blocks-color",
				label: o("Border Color"),
				placeholder: o("None")
			}]
		},
		{
			handle: "borderRadius",
			type: "text",
			component: "blocks-value",
			label: o("Radius"),
			group: "radius",
			unit: "px",
			units: [
				"px",
				"rem",
				"%"
			],
			min: 0,
			placeholder: "0"
		},
		{
			handle: "padding",
			type: "group",
			component: "blocks-group",
			label: o("Padding"),
			fields: [{
				handle: "paddingBlock",
				type: "text",
				component: "blocks-value",
				label: o("Vertical Padding"),
				group: "space",
				prefixIcon: "b-arrows-out-line-vertical",
				unit: "rem",
				placeholder: "0",
				min: 0
			}, {
				handle: "paddingInline",
				type: "text",
				component: "blocks-value",
				label: o("Horizontal Padding"),
				group: "space",
				prefixIcon: "b-arrows-out-line-horizontal",
				unit: "rem",
				placeholder: "0",
				min: 0
			}]
		},
		{
			handle: "margin",
			type: "group",
			component: "blocks-group",
			label: o("Margin"),
			fields: [{
				handle: "marginTop",
				type: "text",
				component: "blocks-value",
				label: o("Top Margin"),
				group: "space",
				prefix: "T",
				unit: "rem",
				units: [
					"rem",
					"em",
					"px"
				],
				placeholder: "0"
			}, {
				handle: "marginBottom",
				type: "text",
				component: "blocks-value",
				label: o("Bottom Margin"),
				group: "space",
				prefix: "B",
				unit: "rem",
				units: [
					"rem",
					"em",
					"px"
				],
				placeholder: "0"
			}]
		}
	];
}
function W({ value: e, onChange: t, fields: n }) {
	return /* @__PURE__ */ T(m, {
		bare: !0,
		fields: [{
			handle: "style",
			type: "json",
			component: "blocks-more",
			label: o("Style"),
			controls: n
		}],
		values: { style: Ne(e) },
		onChange: (e, n) => t(n ?? {})
	});
}
function Ie({ title: e, value: t, onChange: n, options: r, tokens: i, vars: a, open: s, onOpen: c }) {
	let [l, u] = p(null), d = c ? s ?? null : l, f = c ?? u, ee = r.filter((e) => !(e in t)), m = [...Fe(i), ...U()];
	return /* @__PURE__ */ E(j, {
		title: e,
		action: /* @__PURE__ */ T(_, {
			trigger: /* @__PURE__ */ T(g, {
				icon: "plus",
				label: o("Add Element"),
				size: "xs"
			}),
			items: ee.map((e) => ({
				label: V(e),
				onSelect: () => {
					n({
						...t,
						[e]: {}
					}), f(e);
				}
			})),
			className: "max-h-72 overflow-auto"
		}),
		children: [Object.keys(t).length === 0 && /* @__PURE__ */ T("p", {
			className: "m-0 py-3 text-xs text-faint",
			children: o("No element styles")
		}), Object.entries(t).map(([e, r]) => /* @__PURE__ */ T(M, {
			open: d === e,
			onToggle: () => f(d === e ? null : e),
			label: V(e),
			aside: /* @__PURE__ */ T("span", {
				"aria-hidden": "true",
				className: "grid h-6 w-9 shrink-0 place-items-center rounded-xs",
				style: {
					...a,
					background: "var(--color-background)",
					color: "var(--color-foreground)"
				},
				children: /* @__PURE__ */ T("span", {
					className: "px-0.5",
					style: {
						...Pe(r),
						fontSize: 15,
						lineHeight: 1.2,
						margin: 0,
						paddingBlock: 0
					},
					children: "Aa"
				})
			}),
			menu: /* @__PURE__ */ T(_, {
				trigger: /* @__PURE__ */ T(g, {
					icon: "more",
					label: o("Element Actions"),
					size: "xs",
					className: "shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-[popup-open]:opacity-100"
				}),
				items: [{
					label: o("Remove"),
					icon: "trash",
					danger: !0,
					onSelect: () => n(Object.fromEntries(Object.entries(t).filter(([t]) => t !== e)))
				}]
			}),
			children: /* @__PURE__ */ T(W, {
				value: r,
				fields: m,
				onChange: (r) => n({
					...t,
					[e]: r
				})
			})
		}, e))]
	});
}
var G = () => [
	[
		"blocks",
		o("Between Blocks"),
		"1.1em"
	],
	[
		"headings",
		o("Before Headings"),
		"1.8em"
	],
	[
		"afterHeadings",
		o("After Headings"),
		"0.6em"
	],
	[
		"items",
		o("Between List Items"),
		"0.35em"
	]
];
function Le({ value: e, onChange: t, options: n, tokens: r, vars: i, open: a, onOpen: s }) {
	let { spacing: c = {}, ...l } = e, u = (e, n) => t({
		...Object.keys(e).length ? { spacing: e } : {},
		...n
	});
	return /* @__PURE__ */ E(w, { children: [/* @__PURE__ */ T(j, {
		title: o("Spacing"),
		children: G().map(([e, t, n]) => /* @__PURE__ */ T(z, {
			label: t,
			children: /* @__PURE__ */ T(m, {
				bare: !0,
				className: "flex min-w-0 flex-1",
				fields: [{
					handle: e,
					type: "text",
					component: "blocks-value",
					label: t,
					group: "space",
					unit: "em",
					units: [
						"em",
						"rem",
						"px"
					],
					step: .05,
					min: 0,
					placeholder: n
				}],
				values: { [e]: c[e] ?? null },
				onChange: (t, n) => {
					let r = { ...c };
					n == null || n === "" ? delete r[e] : r[e] = n, u(r, l);
				}
			})
		}, e))
	}), /* @__PURE__ */ T(Ie, {
		title: o("Elements in Prose"),
		options: n,
		tokens: r,
		vars: i,
		open: a,
		onOpen: s,
		value: l,
		onChange: (e) => u(c, e)
	})] });
}
function Re({ defaults: e, tokens: t, onSet: n }) {
	let r = [
		["sm", o("Small")],
		["md", o("Medium")],
		["lg", o("Large")]
	], i = [
		[
			"height",
			o("Height"),
			{
				unit: "rem",
				units: ["rem", "px"],
				step: .125,
				min: 0
			}
		],
		[
			"padding",
			o("Padding"),
			{
				unit: "rem",
				units: [
					"rem",
					"px",
					"em"
				],
				step: .125,
				min: 0,
				group: "space"
			}
		],
		[
			"text",
			o("Text"),
			{
				unit: "rem",
				units: ["rem", "px"],
				step: .0625,
				min: 0,
				group: "text"
			}
		]
	], a = (e) => {
		let n = Array.isArray(e) ? e.find((e) => !e.startsWith("token:") || t.some((t) => `token:${t.path}` === e)) : e;
		return String(n ?? "").replace(/^token:[a-z]+\./, "");
	};
	return /* @__PURE__ */ T(j, {
		title: o("Sizes"),
		children: /* @__PURE__ */ E("div", {
			className: "grid grid-cols-[52px_repeat(3,minmax(0,1fr))] items-center gap-x-2 gap-y-1.5 py-2",
			children: [
				/* @__PURE__ */ T("span", {}),
				i.map(([e, t]) => /* @__PURE__ */ T("span", {
					className: "text-2xs text-faint",
					children: t
				}, e)),
				r.map(([r, o]) => /* @__PURE__ */ E(l, { children: [/* @__PURE__ */ T("span", {
					className: "text-xs text-text",
					children: o
				}), i.map(([i, s, c]) => {
					let l = `control.${r}-${i}`, u = t.find((e) => e.path === l);
					return /* @__PURE__ */ T(m, {
						bare: !0,
						fields: [{
							handle: l,
							type: "text",
							component: "blocks-value",
							label: `${o} ${s}`,
							placeholder: a(e[r]?.[i]),
							...c
						}],
						values: { [l]: u?.value ?? null },
						onChange: (e, t) => n(l, t)
					}, i);
				})] }, r))
			]
		})
	});
}
function ze({ value: e, onChange: t, tokens: n, open: r, onOpen: i }) {
	let [a, s] = p("base"), c = async () => {
		let n = await S({
			title: o("New Button Variant"),
			fields: [{
				handle: "name",
				type: "text",
				label: o("Name"),
				placeholder: "outline",
				mono: !0,
				autofocus: !0
			}],
			confirm: o("Add")
		}), r = String(n?.name ?? "").toLowerCase().replace(/[^a-z0-9-]/g, "");
		r && !(r in e) && (t({
			...e,
			[r]: {
				base: {},
				hover: {}
			}
		}), i(r));
	}, l = (e) => {
		let { surface: t, ...n } = e, r = [
			"base",
			"hover",
			"active",
			"focus-visible"
		].some((e) => e in n) ? n : { base: n };
		return {
			surface: typeof t == "string" ? t : void 0,
			states: r
		};
	}, u = (n, r, i) => t({
		...e,
		[n]: {
			...i,
			...r ? { surface: r } : {}
		}
	}), d = (e) => e.charAt(0).toUpperCase() + e.slice(1).replace(/-/g, " "), f = [
		...U().filter((e) => e.handle !== "padding" && e.handle !== "margin"),
		...Fe(n).filter((e) => [
			"fontWeight",
			"letterSpacing",
			"color"
		].includes(e.handle)).map((e) => e.handle === "color" ? {
			...e,
			label: o("Text")
		} : e),
		{
			handle: "boxShadow",
			type: "text",
			component: "blocks-shadows",
			label: o("Shadow"),
			group: "shadow"
		},
		{
			handle: "opacity",
			type: "text",
			component: "blocks-value",
			label: o("Opacity"),
			percent: !0,
			step: .05,
			min: 0,
			max: 1,
			placeholder: "100"
		}
	];
	return /* @__PURE__ */ E(j, {
		title: o("Button Variants"),
		onAdd: c,
		children: [Object.keys(e).length === 0 && /* @__PURE__ */ T("p", {
			className: "m-0 py-3 text-xs text-faint",
			children: o("No variants")
		}), Object.entries(e).map(([n, c]) => /* @__PURE__ */ E(M, {
			open: r === n,
			onToggle: () => i(r === n ? null : n),
			label: d(n),
			menu: /* @__PURE__ */ T(_, {
				trigger: /* @__PURE__ */ T(g, {
					icon: "more",
					label: o("Variant Actions"),
					size: "xs",
					className: "shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-[popup-open]:opacity-100"
				}),
				items: [{
					label: o("Delete"),
					icon: "trash",
					danger: !0,
					onSelect: () => t(Object.fromEntries(Object.entries(e).filter(([e]) => e !== n)))
				}]
			}),
			children: [
				/* @__PURE__ */ E("div", {
					className: "mb-2 flex items-center gap-1",
					children: [/* @__PURE__ */ T(m, {
						layout: "inline",
						labelWidth: 120,
						className: "min-w-0 flex-1",
						fields: [{
							handle: "surface",
							type: "color",
							component: "blocks-color",
							label: o("Shown On"),
							placeholder: o("Page Background")
						}],
						values: { surface: l(c).surface ?? null },
						onChange: (e, t) => u(n, t || void 0, l(c).states)
					}), /* @__PURE__ */ T("span", { className: "size-6 shrink-0" })]
				}),
				/* @__PURE__ */ T("div", {
					className: "mb-2",
					children: /* @__PURE__ */ T(v, {
						size: "xs",
						block: !0,
						"aria-label": o("State"),
						value: a,
						onChange: s,
						options: [
							{
								value: "base",
								label: o("Default")
							},
							{
								value: "hover",
								label: o("Hover")
							},
							{
								value: "active",
								label: o("Pressed")
							},
							{
								value: "focus-visible",
								label: o("Focus")
							}
						]
					})
				}),
				/* @__PURE__ */ T(W, {
					value: l(c).states[a],
					fields: f,
					onChange: (e) => u(n, l(c).surface, {
						...l(c).states,
						[a]: e
					})
				}, a)
			]
		}, n))]
	});
}
function Be({ css: e, js: t, onChange: n }) {
	let i = r("site.code"), a = (e, t, r, a) => /* @__PURE__ */ T(j, {
		title: t,
		children: /* @__PURE__ */ T("div", {
			className: "py-2.5",
			children: /* @__PURE__ */ T(m, {
				bare: !0,
				fields: [{
					handle: e,
					type: "code",
					label: t,
					rows: 14,
					placeholder: r
				}],
				values: { [e]: a },
				onChange: (t, r) => n({ [e]: r ?? "" }),
				disabled: !i
			})
		})
	});
	return /* @__PURE__ */ E(w, { children: [
		a("css", o("Custom CSS"), ".cms-prose figure { margin-block: 2rem; }", e),
		a("js", o("Custom JavaScript"), "document.addEventListener('cms:alpine', (e) => …)", t),
		!i && /* @__PURE__ */ T("p", {
			className: "m-0 text-2xs text-warning",
			children: o("Editing code needs the “Edit custom CSS and JavaScript” permission.")
		})
	] });
}
export { ke as default };
