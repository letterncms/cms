import { can as e, queryClient as t, run as n, t as r, useAbility as i, useTab as a } from "@letterncms/sdk";
import { Fragment as o, useEffect as s, useMemo as c, useRef as l, useState as u } from "react";
import { Button as d, EmptyState as f, Fields as p, Icon as m, IconButton as h, Menu as g, SaveBar as _, ScreenSidebar as ee, Segmented as v, SidebarRow as te, Spinner as ne, Tooltip as re, Topbar as ie, cn as y, confirm as b, copyText as x, deviceWidths as S, prompt as ae, toast as C, useScreenSidebar as oe } from "@letterncms/ui";
import { Fragment as w, jsx as T, jsxs as E } from "react/jsx-runtime";
// admin/src/design-parts.tsx
var D = { weight: "font-weight" }, O = (e, t) => `--${D[e] ?? e}-${t}`;
function k(e, t) {
	return t && typeof t == "object" && !Array.isArray(t) && "min" in t ? se(String(t.min), String(t.max)) : e === "font" && Array.isArray(t) ? t.map((e) => /\s/.test(e) && !e.includes("\"") ? `"${e}"` : e).join(", ") : String(t ?? "").replace(/token:([a-z]+)\.([a-z0-9-]+)(?:\/(\d{1,3}))?/g, (e, t, n, r) => r ? `color-mix(in srgb, var(${O(t, n)}) ${r}%, transparent)` : `var(${O(t, n)})`);
}
function se(e, t) {
	let n = (e) => e.endsWith("rem") ? parseFloat(e) : parseFloat(e) / 16, r = n(e), i = n(t), a = (i - r) / 57.5, o = (e) => String(Math.round(e * 1e4) / 1e4);
	return `clamp(${o(Math.min(r, i))}rem, ${o(r - a * 22.5)}rem + ${o(a * 100)}vw, ${o(Math.max(r, i))}rem)`;
}
function ce(e) {
	let t = e && typeof e == "object" && "max" in e ? e.max : e, n = parseFloat(String(t ?? ""));
	return Number.isNaN(n) ? 0 : /r?em$/.test(String(t)) ? n * 16 : n;
}
function A({ title: e, onAdd: t, action: n, children: i }) {
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
				t && /* @__PURE__ */ T(re, {
					content: r("Add Token"),
					children: /* @__PURE__ */ T(h, {
						icon: "plus",
						label: r("Add Token"),
						size: "xs",
						onClick: t
					})
				})
			]
		}), i]
	});
}
function j({ open: e, onToggle: t, label: n, aside: r, menu: i, children: a }) {
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
					/* @__PURE__ */ T(m, {
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
function le(e, t) {
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
function M(e, t, n, r, i, a = 0) {
	if (a > 8) return "transparent";
	let o = (e) => {
		let t = r.find((t) => t.path === e);
		return t ? String(i && t.dark ? t.dark : t.value) : null;
	}, s = new Map(Object.entries(t).flatMap(([e, t]) => Object.entries(t).map(([t, n]) => [n.variable, [e, t]]))), c = e.replace(/token:color\.([a-z0-9-]+)(?:\/(\d{1,3}))?/g, (e, t, n) => {
		let r = o(`color.${t}`) ?? "transparent";
		return n ? `color-mix(in srgb, ${r} ${n}%, transparent)` : r;
	});
	for (let e = c.indexOf("var("); e >= 0; e = c.indexOf("var(")) {
		let l = le(c, e);
		if (!l) break;
		let u = s.get(l.name), d = l.name.startsWith("--color-") ? o(`color.${l.name.slice(8)}`) : null, f = u ? I(t, n, u[0], u[1], r) : d ?? l.fallback ?? "transparent";
		c = c.slice(0, e) + M(f, t, n, r, i, a + 1) + c.slice(l.end);
	}
	if (/^field:/.test(c)) {
		let [e, o] = c.slice(6).split(".");
		return M(I(t, n, e, o, r), t, n, r, i, a + 1);
	}
	return c.replace(/currentColor/gi, o("color.foreground") ?? "#161614");
}
function N() {
	return [
		{
			key: "field",
			label: r("All Fields"),
			parts: ["field"],
			specimen: "field"
		},
		{
			key: "states",
			label: r("States"),
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
			label: r("Labels and Help"),
			parts: ["label", "help"],
			specimen: "labels"
		},
		{
			key: "spacing",
			label: r("Size and Spacing"),
			parts: ["spacing"],
			specimen: "sizes"
		},
		{
			key: "select",
			label: r("Dropdowns"),
			parts: ["select"],
			specimen: "select"
		},
		{
			key: "textarea",
			label: r("Text Areas"),
			parts: ["textarea"],
			specimen: "textarea"
		},
		{
			key: "checkbox",
			label: r("Checkboxes"),
			parts: ["checkbox"],
			specimen: "checkbox"
		},
		{
			key: "radio",
			label: r("Radio Buttons"),
			parts: ["radio"],
			specimen: "radio"
		},
		{
			key: "switch",
			label: r("Switches"),
			parts: ["switch"],
			specimen: "switch"
		},
		{
			key: "slider",
			label: r("Sliders"),
			parts: ["slider"],
			specimen: "slider"
		},
		{
			key: "tags",
			label: r("Tag Fields"),
			parts: ["tags"],
			specimen: "tags"
		},
		{
			key: "chips",
			label: r("Chips"),
			parts: ["chips"],
			specimen: "chips"
		},
		{
			key: "file",
			label: r("File Pickers"),
			parts: ["file"],
			specimen: "file"
		}
	];
}
function ue(e, t) {
	let n = {
		"invalid.color": r("Color"),
		"invalid.ringColor": r("Ring"),
		"label.color": r("Color"),
		"help.color": r("Color"),
		"label.fontSize": r("Size"),
		"help.fontSize": r("Size"),
		"label.fontWeight": r("Weight"),
		"checkbox.background": r("Fill"),
		"checkbox.borderColor": r("Border"),
		"slider.fill": r("Filled Track"),
		"tags.background": r("Tag Fill"),
		"tags.color": r("Tag Text"),
		"tags.radius": r("Tag Radius"),
		"file.background": r("Button Fill"),
		"file.color": r("Button Text"),
		"file.radius": r("Button Radius"),
		"spacing.label": r("Label and Field"),
		"spacing.size": r("Form Size"),
		"switch.knobShadow": r("Shadow"),
		"slider.thumbShadow": r("Shadow"),
		"switch.radius": r("Radius"),
		"chips.background": r("Fill"),
		"chips.borderColor": r("Border")
	}, i = {
		height: r("Height"),
		paddingX: r("Padding"),
		background: r("Fill"),
		borderWidth: r("Border Width"),
		borderColor: r("Border"),
		radius: r("Radius"),
		color: r("Text"),
		fontSize: r("Text Size"),
		fontWeight: r("Weight"),
		placeholder: r("Placeholder"),
		shadow: r("Shadow"),
		ringWidth: r("Ring Width"),
		ringColor: r("Ring"),
		opacity: r("Opacity"),
		required: r("Required Mark"),
		fields: r("Fields"),
		list: r("Options"),
		choice: r("Box and Text"),
		arrowColor: r("Arrow"),
		arrowSize: r("Arrow Size"),
		minHeight: r("Minimum Height"),
		resize: r("Resize"),
		size: r("Size"),
		checked: r("Checked"),
		markColor: r("Mark"),
		mark: r("Mark Shape"),
		markWeight: r("Mark Weight"),
		markSize: r("Mark Size"),
		style: r("Style"),
		dotColor: r("Dot"),
		dotSize: r("Dot Size"),
		width: r("Width"),
		off: r("Off"),
		on: r("On"),
		knob: r("Knob"),
		inset: r("Knob Inset"),
		knobShadow: r("Knob Shadow"),
		trackHeight: r("Track Height"),
		track: r("Track"),
		thumbSize: r("Thumb Size"),
		thumb: r("Thumb"),
		thumbBorder: r("Thumb Border"),
		thumbShadow: r("Thumb Shadow"),
		selected: r("Selected"),
		selectedText: r("Selected Text")
	};
	return n[`${e}.${t}`] ?? i[t] ?? t;
}
function P(e) {
	return {
		sm: r("S"),
		md: r("M"),
		lg: r("L"),
		vertical: r("Vertical"),
		none: r("Fixed"),
		check: r("Check"),
		square: r("Square"),
		dot: r("Dot"),
		light: r("Light"),
		regular: r("Regular"),
		bold: r("Bold"),
		ring: r("Ring")
	}[e] ?? e;
}
function F(e) {
	return {
		hover: r("Hover"),
		focus: r("Focus"),
		invalid: r("Invalid"),
		disabled: r("Disabled")
	}[e];
}
function I(e, t, n, r, i, a = 0) {
	let o = t[n]?.[r];
	if (o !== void 0 && o !== "") return String(o);
	let s = e[n]?.[r];
	if (!s || a > 5) return "";
	if (s.inherits) {
		let [n, r] = s.inherits.split(".");
		return I(e, t, n, r, i, a + 1);
	}
	let c = s.default;
	return Array.isArray(c) ? c.find((e) => !e.startsWith("token:") || i.some((t) => `token:${t.path}` === e)) ?? c[c.length - 1] : c ?? "";
}
function de(e, t, n, i, a) {
	if (e[n][i].type === "choice") return "";
	let [o, s] = [n, i];
	for (let n = 0; n < 6 && e[o]?.[s]?.inherits && t[o]?.[s] === void 0; n++) [o, s] = e[o][s].inherits.split(".");
	let c = e[o]?.[s], l = t[o]?.[s], u = I(e, t, o, s, a), d = u.match(/^token:[a-z]+\.([a-z0-9-]+)$/);
	return d ? d[1] : l === void 0 && c?.hint ? {
		border: r("From border"),
		darker: r("Darker"),
		faint: r("Faint")
	}[c.hint] ?? c.hint : u === "currentColor" ? r("Text color") : u === "0 0 #0000" ? r("None") : e[n][i].type === "shadow" ? r("Soft") : u === "999px" ? r("Round") : u;
}
function fe(e, t, n, r, i) {
	let a = r.filter((e) => e.group === "weight");
	return Object.entries(e[n] ?? {}).map(([o, s]) => {
		let c = {
			handle: o,
			label: ue(n, o),
			placeholder: de(e, t, n, o, r)
		};
		switch (s.type) {
			case "color": return {
				...c,
				type: "color",
				component: "blocks-color",
				swatch: M(I(e, t, n, o, r), e, t, r, i)
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
					label: P(e)
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
function pe(e, t) {
	let n = [];
	for (let [r, i] of Object.entries(t)) for (let [t, a] of Object.entries(i)) {
		let i = e[r]?.[t];
		if (!i || i.type === "choice" || a === "" || a === null) continue;
		let o = String(a), s = o.match(/^field:([a-z]+)\.([a-zA-Z]+)$/);
		n.push(`${i.variable}:${s ? `var(${e[s[1]]?.[s[2]]?.variable})` : typeof a == "number" && i.type === "length" && a !== 0 ? `${a}px` : k("", o)}`);
	}
	return n.join(";");
}
function me({ schema: e, value: t, onChange: n, tokens: i, dark: a, open: o, onOpen: s, note: c }) {
	let [l, d] = u("focus"), f = (e, r) => {
		let i = Object.fromEntries(Object.entries(r).filter(([, e]) => e != null && e !== "")), a = Object.fromEntries(Object.entries(t).filter(([t]) => t !== e));
		n(Object.keys(i).length ? {
			...a,
			[e]: i
		} : a);
	}, m = (n, r, o) => {
		let s = fe(e, t, n, i, a).filter((e) => !o || o.includes(e.handle)).map((e) => ({
			...e,
			status: t[n]?.[e.handle] === void 0 ? void 0 : "own",
			reset: () => f(n, {
				...t[n],
				[e.handle]: null
			})
		}));
		return /* @__PURE__ */ E("div", {
			className: r ? "mt-3 first:mt-0" : void 0,
			children: [
				r && /* @__PURE__ */ T("h4", {
					className: "m-0 mb-1 text-2xs font-medium uppercase tracking-wide text-faint",
					children: r
				}),
				/* @__PURE__ */ T(p, {
					layout: "inline",
					fields: s.filter((e) => e.component !== "blocks-shadows"),
					values: t[n] ?? {},
					onChange: (e, r) => f(n, {
						...t[n],
						[e]: r
					})
				}),
				s.filter((e) => e.component === "blocks-shadows").map((e) => /* @__PURE__ */ T(p, {
					bare: !0,
					fields: [e],
					values: t[n] ?? {},
					onChange: (e, r) => f(n, {
						...t[n],
						[e]: r
					})
				}, e.handle))
			]
		}, `${n}-${r ?? ""}`);
	}, _ = (e) => e.some((e) => Object.keys(t[e] ?? {}).length > 0);
	return /* @__PURE__ */ E(A, {
		title: r("Form Fields"),
		children: [c, N().map((e) => /* @__PURE__ */ T(j, {
			open: o === e.key,
			onToggle: () => s(o === e.key ? null : e.key),
			label: e.label,
			aside: _(e.parts) ? /* @__PURE__ */ T("span", {
				className: "size-1.5 shrink-0 rounded-full bg-focus",
				title: r("Changed")
			}) : void 0,
			menu: _(e.parts) ? /* @__PURE__ */ T(g, {
				trigger: /* @__PURE__ */ T(h, {
					icon: "more",
					label: r("Section Actions"),
					size: "xs",
					className: "shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-[popup-open]:opacity-100"
				}),
				items: [{
					label: r("Reset to Defaults"),
					icon: "undo",
					onSelect: () => n(Object.fromEntries(Object.entries(t).filter(([t]) => !e.parts.includes(t))))
				}]
			}) : void 0,
			children: e.key === "states" ? /* @__PURE__ */ E(w, { children: [/* @__PURE__ */ T("div", {
				className: "mb-2",
				children: /* @__PURE__ */ T(v, {
					size: "xs",
					block: !0,
					"aria-label": r("State"),
					value: l,
					onChange: d,
					options: [
						"hover",
						"focus",
						"invalid",
						"disabled"
					].map((e) => ({
						value: e,
						label: F(e)
					}))
				})
			}), m(l)] }) : e.key === "spacing" ? /* @__PURE__ */ E(w, { children: [m("spacing", void 0, ["size"]), m("spacing", r("Space Between"), [
				"fields",
				"label",
				"list",
				"choice"
			])] }) : e.key === "label" ? /* @__PURE__ */ E(w, { children: [m("label", r("Label")), m("help", r("Help Text"))] }) : m(e.parts[0])
		}, e.key))]
	});
}
function he(e) {
	return N().find((t) => t.key === e)?.specimen ?? null;
}
// admin/src/specimen.tsx
function ge(e, t) {
	if (!e?.head) return;
	let n = e.querySelector("link[rel=\"stylesheet\"][href*=\"/_cms/site/design-\"]"), r = e.getElementById("cms-design-preview");
	t.compiled === null ? (r?.remove(), n && (n.disabled = !1)) : (r || (r = e.createElement("style"), r.id = "cms-design-preview", n ? n.after(r) : e.head.appendChild(r)), r.textContent !== t.compiled && (r.textContent = t.compiled), n && (n.disabled = !0));
	let i = e.getElementById("cms-token-preview");
	i || (i = e.createElement("style"), i.id = "cms-token-preview", e.head.appendChild(i));
	let a = t.vars ? `:root:root:root{${t.vars}}` : "";
	i.textContent !== a && (i.textContent = a), e.documentElement.dataset.theme !== t.mode && (e.documentElement.dataset.theme = t.mode);
}
function _e(e, t, n) {
	if (!e?.body) return;
	for (let t of e.querySelectorAll("[data-part][data-active]")) t.removeAttribute("data-active");
	let r = t ? e.querySelector(`[data-part="${CSS.escape(t)}"]`) : null;
	r && (r.setAttribute("data-active", ""), r.scrollIntoView({
		behavior: n ? "smooth" : "instant",
		block: "nearest"
	}));
}
// admin/src/DesignTokens.tsx
var ve = [
	"color",
	"type",
	"space",
	"shape",
	"motion",
	"elements",
	"buttons",
	"fields",
	"code"
];
function ye() {
	return [{
		group: r("Tokens"),
		items: [
			{
				value: "color",
				label: r("Colors"),
				icon: "palette"
			},
			{
				value: "type",
				label: r("Typography"),
				icon: "typography"
			},
			{
				value: "space",
				label: r("Spacing"),
				icon: "spacing"
			},
			{
				value: "shape",
				label: r("Shape"),
				icon: "radius"
			},
			{
				value: "motion",
				label: r("Motion"),
				icon: "speed"
			}
		]
	}, {
		group: r("Styles"),
		items: [
			{
				value: "elements",
				label: r("Elements"),
				icon: "paragraph"
			},
			{
				value: "buttons",
				label: r("Buttons"),
				icon: "button"
			},
			{
				value: "fields",
				label: r("Form Fields"),
				icon: "form-input"
			},
			{
				value: "code",
				label: r("Custom Code"),
				icon: "code"
			}
		]
	}];
}
function be(e) {
	return {
		color: r("New Color"),
		font: r("New Font Family"),
		text: r("New Text Size"),
		weight: r("New Weight"),
		leading: r("New Line Height"),
		tracking: r("New Letter Spacing"),
		space: r("New Spacing"),
		container: r("New Container"),
		breakpoint: r("New Breakpoint"),
		radius: r("New Radius"),
		shadow: r("New Shadow"),
		duration: r("New Duration"),
		ease: r("New Easing")
	}[e] ?? r("New Token");
}
var xe = {
	desktop: "100%",
	tablet: `${S.tablet}px`,
	phone: `${S.phone}px`
};
function Se({ viewport: e, desktop: t, children: n }) {
	let r = l(null), [i, a] = u({
		width: 0,
		height: 0
	});
	s(() => {
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
	let o = e === "desktop" ? Math.max(i.width, t) : parseFloat(xe[e]), c = i.width ? Math.min(1, i.width / o) : 1;
	return /* @__PURE__ */ T("div", {
		ref: r,
		className: "relative min-h-0 flex-1 overflow-hidden",
		children: i.width > 0 && n({
			position: "absolute",
			top: 0,
			left: Math.max(0, (i.width - o * c) / 2),
			width: o,
			height: i.height / c,
			transform: c < 1 ? `scale(${c})` : void 0,
			transformOrigin: "top left"
		})
	});
}
var L = (e, t) => JSON.stringify(e ?? null) === JSON.stringify(t ?? null);
function Ce(e) {
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
function we(e, t, n) {
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
function Te(e, t) {
	let n = new Map(e.tokens.map((e) => [e.path, e])), r = new Set(t.tokens.map((e) => e.from).filter(Boolean)), i = {
		tokens: {},
		dark: {},
		rename: {},
		remove: e.tokens.filter((e) => !r.has(e.path)).map((e) => e.path)
	};
	for (let e of t.tokens) {
		let t = e.from ? n.get(e.from) : void 0;
		t && t.path !== e.path && (i.rename[t.path] = e.path), t && L(t.value, e.value) || (i.tokens[e.path] = e.value), t && L(t.dark || null, e.dark || null) || (i.dark[e.path] = e.dark || null);
	}
	for (let n of [
		"styles",
		"prose",
		"buttons",
		"fields",
		"transition"
	]) L(e[n], t[n]) || (i[n] = t[n]);
	return i;
}
function Ee() {
	let o = i("design/get", {}, {
		refetchOnWindowFocus: !1,
		retry: !1
	}), d = c(() => o.data ? Ce(o.data) : null, [o.data]), [g, b] = u(null), [x, S] = a(ve), [D, se] = u("light"), [j, le] = u("desktop"), [M, N] = u(!1), [ue, P] = u(null), F = oe(), [I, de] = u(null), [fe, Ee] = u(null), [B, je] = u(null), V = l(null), H = g ?? d, U = !!g && !!d && !L(g, d), W = (e) => d && b((t) => e(t ?? d)), G = c(() => U && d && g ? {
		...Te(d, g),
		css: g.css
	} : null, [
		U,
		d,
		g
	]);
	s(() => {
		if (!G) return de(null);
		let e = !0, t = setTimeout(() => {
			n("design/preview", G).then((t) => e && de(t.css), () => {});
		}, 150);
		return () => {
			e = !1, clearTimeout(t);
		};
	}, [G]);
	let Me = c(() => (H?.tokens ?? []).map((e) => `${O(e.group, e.name)}:${k(e.group, D === "dark" && e.dark ? e.dark : e.value)}`).join(";"), [H, D]), Re = {
		compiled: I,
		vars: U ? [Me, pe(o.data?.fieldStyles ?? {}, H?.fields ?? {})].filter(Boolean).join(";") : "",
		mode: D
	}, ze = () => ge(V.current?.contentDocument, Re), K = x === "fields" ? "/__specimen/fields" : x === "buttons" ? "/__specimen/buttons" : "/", q = x === "fields" ? he(B) : x === "buttons" ? fe : null;
	s(() => _e(V.current?.contentDocument, q, !0), [q]), s(ze), s(() => {
		let e = document.createElement("style");
		return e.textContent = (o.data?.fonts ?? []).map((e) => `@font-face{font-family:"${e.family}";src:url("${/^(https:\/\/|\/)/.test(e.src) ? e.src : `/_cms/fonts/${e.src.split("/").pop()}`}") format("woff2");font-weight:${e.weight ?? "400"};font-style:${e.style ?? "normal"};font-display:swap}`).join("\n"), document.head.appendChild(e), () => e.remove();
	}, [o.data?.fonts]);
	let Be = async () => {
		if (U && !M && d && g) {
			N(!0), P(null);
			try {
				let r = Te(d, g);
				(Object.keys(r.tokens).length + Object.keys(r.dark).length + Object.keys(r.rename).length + r.remove.length > 0 || [
					"styles",
					"prose",
					"buttons",
					"fields",
					"transition"
				].some((e) => e in r)) && await n("design/update", r), (g.css !== d.css || g.js !== d.js) && await n("design/code", {
					css: g.css,
					...e("site.code") ? { js: g.js } : {}
				}), await t.invalidateQueries({ predicate: (e) => typeof e.queryKey[0] == "string" && e.queryKey[0].startsWith("design/") }), b(null), V.current?.contentWindow?.location.reload();
			} catch (e) {
				P(e instanceof Error ? e.message : String(e));
			} finally {
				N(!1);
			}
		}
	};
	if (o.isLoading) return /* @__PURE__ */ T("div", {
		className: "grid h-full place-items-center text-faint",
		children: /* @__PURE__ */ T(ne, {})
	});
	if (!o.data || !H) return /* @__PURE__ */ E("div", {
		className: "flex h-full flex-col",
		children: [/* @__PURE__ */ T(ie, { crumbs: [{
			label: r("Design System"),
			icon: "palette"
		}] }), /* @__PURE__ */ T(f, {
			icon: "palette",
			title: r("The design system could not be loaded"),
			description: o.error?.message
		})]
	});
	let J = H.tokens, Y = (e) => J.filter((t) => t.group === e), Ve = (e, t) => W((n) => ({
		...n,
		tokens: n.tokens.map((n) => n.path === e.path ? {
			...n,
			...t
		} : n)
	})), He = (e) => W((t) => ({
		...t,
		tokens: t.tokens.filter((t) => t.path !== e.path)
	})), Ue = async (e, t, n = "") => {
		let i = await ae({
			title: e,
			description: n ? r("Blocks that use token:{path} keep the old name.", { path: `${t}.${n}` }) : void 0,
			fields: [{
				handle: "name",
				type: "text",
				label: r("Name"),
				mono: !0,
				autofocus: !0,
				placeholder: t === "color" ? "brand" : "md"
			}],
			values: { name: n },
			confirm: r(n ? "Rename" : "Add")
		}), a = String(i?.name ?? "").trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/^-+/, "");
		return !a || a === n ? null : J.some((e) => e.path === `${t}.${a}`) ? (C.error(r("“{name}” already exists", { name: a })), null) : a;
	}, X = async (e, t) => {
		let n = await Ue(be(e), e);
		n && W((r) => ({
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
			let t = await Ue(r("Rename Token"), e.group, e.name);
			t && W((n) => we(n, e.path, `${e.group}.${t}`));
		},
		remove: He
	}, We = (e, t) => W((n) => {
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
	}), Q = (e, t, n = "value") => /* @__PURE__ */ T(p, {
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
		onChange: (t, r) => Ve(e, { [n]: n === "dark" ? r || null : r ?? e[n] })
	}), $ = (e, t = {}) => ({
		component: "blocks-value",
		unit: e,
		...t
	}), Ge = Object.fromEntries(J.map((e) => [O(e.group, e.name), k(e.group, D === "dark" && e.dark ? e.dark : e.value)])), Ke = k("ease", Y("ease")[0]?.value ?? "cubic-bezier(0.2, 0.8, 0.2, 1)"), qe = [...new Set((o.data.fonts ?? []).map((e) => e.family))];
	return /* @__PURE__ */ E("div", {
		className: "flex h-full flex-col",
		children: [
			/* @__PURE__ */ T(ie, {
				crumbs: [{
					label: r("Design System"),
					icon: "palette"
				}, { label: ye().flatMap((e) => e.items).find((e) => e.value === x)?.label ?? "" }],
				actions: /* @__PURE__ */ T(re, {
					content: r("Open Site"),
					children: /* @__PURE__ */ T(h, {
						icon: "external",
						label: r("Open Site"),
						onClick: () => window.open("/", "_blank", "noopener")
					})
				})
			}),
			/* @__PURE__ */ T(ee, {
				title: r("Design System"),
				backTo: "/",
				backLabel: r("Dashboard"),
				nested: !0,
				children: /* @__PURE__ */ T("nav", {
					"aria-label": r("Design System"),
					className: F.nested ? "space-y-px" : "px-2 pb-4",
					children: ye().map((e, t) => /* @__PURE__ */ E("div", {
						className: y("space-y-px", t > 0 && (F.nested ? "mt-1" : "mt-4")),
						children: [!F.nested && /* @__PURE__ */ T("div", {
							className: "cms-label flex h-7 items-center px-2",
							children: e.group
						}), e.items.map((e) => /* @__PURE__ */ T(te, {
							label: e.label,
							icon: F.nested ? void 0 : e.icon,
							active: x === e.value,
							onClick: () => S(e.value)
						}, e.value))]
					}, e.group))
				})
			}),
			/* @__PURE__ */ T(_, {
				dirty: U,
				saving: M,
				error: ue,
				onSave: () => void Be(),
				onDiscard: () => {
					b(null), P(null);
				}
			}),
			/* @__PURE__ */ E("div", {
				className: "grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(340px,420px)_minmax(0,1fr)] xl:grid-cols-[minmax(380px,460px)_minmax(0,1fr)]",
				children: [/* @__PURE__ */ E("div", {
					className: "overflow-y-auto border-border px-4 pb-16 pt-2 md:border-r",
					children: [
						x === "color" && /* @__PURE__ */ E(A, {
							title: r("Colors"),
							onAdd: () => X("color", "#000000"),
							children: [/* @__PURE__ */ E("div", {
								className: "flex h-7 items-center gap-2 text-2xs text-faint",
								children: [
									/* @__PURE__ */ T("span", {
										className: "min-w-0 flex-1",
										children: r("Name")
									}),
									/* @__PURE__ */ E("span", {
										className: y(R, "flex items-center gap-1"),
										children: [/* @__PURE__ */ T(m, {
											name: "sun",
											size: 11
										}), r("Light")]
									}),
									/* @__PURE__ */ E("span", {
										className: y(R, "flex items-center gap-1"),
										children: [/* @__PURE__ */ T(m, {
											name: "moon",
											size: 11
										}), r("Dark")]
									}),
									/* @__PURE__ */ T("span", { className: "w-6 shrink-0" })
								]
							}), Y("color").map((e) => /* @__PURE__ */ E(z, {
								token: e,
								...Z,
								wide: !0,
								children: [/* @__PURE__ */ T("div", {
									className: R,
									children: Q(e, {
										type: "color",
										component: "blocks-color"
									})
								}), /* @__PURE__ */ T("div", {
									className: R,
									children: Q(e, {
										type: "color",
										component: "blocks-color",
										placeholder: r("Same")
									}, "dark")
								})]
							}, e.from ?? e.path))]
						}),
						x === "type" && /* @__PURE__ */ E(w, { children: [
							/* @__PURE__ */ T(A, {
								title: r("Font Families"),
								onAdd: () => X("font", [
									...qe[0] ? [qe[0]] : [],
									"ui-sans-serif",
									"system-ui",
									"sans-serif"
								]),
								children: Y("font").map((e) => /* @__PURE__ */ T(z, {
									token: e,
									...Z,
									below: /* @__PURE__ */ T("p", {
										className: "m-0 truncate pb-2.5 text-lg leading-tight text-ink",
										style: { fontFamily: k("font", e.value) },
										children: r("The quick brown fox jumps over the lazy dog")
									}),
									children: Q(e, {
										component: "site-font-stack",
										families: qe
									})
								}, e.from ?? e.path))
							}),
							/* @__PURE__ */ T(Ae, {
								fonts: o.data.fonts ?? [],
								tokens: Y("font"),
								onChanged: () => {
									o.refetch(), V.current?.contentWindow?.location.reload();
								}
							}),
							/* @__PURE__ */ T(A, {
								title: r("Type Scale"),
								onAdd: () => X("text", {
									min: "1rem",
									max: "1.25rem"
								}),
								children: Y("text").map((e) => /* @__PURE__ */ T(z, {
									token: e,
									...Z,
									below: /* @__PURE__ */ T("p", {
										className: "m-0 truncate pb-2.5 leading-[1.1] tracking-[-0.01em] text-ink",
										style: {
											fontSize: k("text", e.value),
											fontFamily: k("font", Y("font").find((e) => e.name === "display")?.value ?? Y("font")[0]?.value)
										},
										children: r("Ship It")
									}),
									children: Q(e, { component: "site-size" })
								}, e.from ?? e.path))
							}),
							/* @__PURE__ */ T(A, {
								title: r("Weights"),
								onAdd: () => X("weight", "600"),
								children: Y("weight").map((e) => /* @__PURE__ */ T(z, {
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
							/* @__PURE__ */ T(A, {
								title: r("Line Heights"),
								onAdd: () => X("leading", "1.5"),
								children: Y("leading").map((e) => /* @__PURE__ */ T(z, {
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
							/* @__PURE__ */ T(A, {
								title: r("Letter Spacing"),
								onAdd: () => X("tracking", "0em"),
								children: Y("tracking").map((e) => /* @__PURE__ */ T(z, {
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
						x === "space" && /* @__PURE__ */ E(w, { children: [
							/* @__PURE__ */ T(A, {
								title: r("Spacing"),
								onAdd: () => X("space", "1rem"),
								children: Y("space").map((e) => /* @__PURE__ */ T(z, {
									token: e,
									...Z,
									after: /* @__PURE__ */ T(ke, {
										value: e.value,
										of: Y("space")
									}),
									children: Q(e, { component: "site-size" })
								}, e.from ?? e.path))
							}),
							/* @__PURE__ */ T(Fe, {
								defaults: o.data.controlSizes ?? {},
								tokens: J,
								onSet: We
							}),
							/* @__PURE__ */ T(A, {
								title: r("Containers"),
								onAdd: () => X("container", "72rem"),
								children: Y("container").map((e) => /* @__PURE__ */ T(z, {
									token: e,
									...Z,
									after: /* @__PURE__ */ T(ke, {
										value: e.value,
										of: Y("container")
									}),
									children: Q(e, { component: "site-size" })
								}, e.from ?? e.path))
							}),
							/* @__PURE__ */ T(A, {
								title: r("Breakpoints"),
								onAdd: () => X("breakpoint", "768px"),
								children: Y("breakpoint").map((e) => /* @__PURE__ */ T(z, {
									token: e,
									...Z,
									after: /* @__PURE__ */ T(ke, {
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
						x === "shape" && /* @__PURE__ */ E(w, { children: [/* @__PURE__ */ T(A, {
							title: r("Radius"),
							onAdd: () => X("radius", "0.5rem"),
							children: Y("radius").map((e) => /* @__PURE__ */ T(z, {
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
						}), /* @__PURE__ */ T(A, {
							title: r("Shadows"),
							onAdd: () => X("shadow", "0 4px 16px -4px rgb(0 0 0 / 0.12)"),
							children: Y("shadow").map((e) => /* @__PURE__ */ T(z, {
								token: e,
								...Z,
								sample: /* @__PURE__ */ T("span", {
									className: "size-5 shrink-0 rounded-[5px] border border-border bg-bg",
									style: { boxShadow: k("shadow", e.value) }
								}),
								children: Q(e, { component: "site-shadow" })
							}, e.from ?? e.path))
						})] }),
						x === "motion" && /* @__PURE__ */ E(w, { children: [
							/* @__PURE__ */ E(A, {
								title: r("Page Transition"),
								children: [/* @__PURE__ */ T(Oe, {
									label: r("Effect"),
									children: /* @__PURE__ */ T(p, {
										bare: !0,
										className: "flex min-w-0 flex-1",
										fields: [{
											handle: "type",
											type: "select",
											label: r("Effect"),
											size: "sm",
											required: !0,
											options: {
												none: r("None"),
												fade: r("Fade"),
												slide: r("Slide"),
												scale: r("Scale")
											}
										}],
										values: H.transition,
										onChange: (e, t) => W((e) => ({
											...e,
											transition: {
												...e.transition,
												type: String(t ?? "none")
											}
										}))
									})
								}), H.transition.type !== "none" && /* @__PURE__ */ T(Oe, {
									label: r("Duration"),
									children: /* @__PURE__ */ T(p, {
										bare: !0,
										className: "flex min-w-0 flex-1",
										fields: [{
											handle: "duration",
											type: "text",
											component: "blocks-value",
											label: r("Duration"),
											unit: "ms",
											units: ["ms"],
											step: 10,
											min: 50,
											max: 2e3
										}],
										values: { duration: `${Math.round(H.transition.duration * 1e3)}ms` },
										onChange: (e, t) => W((e) => ({
											...e,
											transition: {
												...e.transition,
												duration: De(t, e.transition.duration)
											}
										}))
									})
								})]
							}),
							/* @__PURE__ */ T(A, {
								title: r("Durations"),
								onAdd: () => X("duration", "300ms"),
								children: Y("duration").map((e) => /* @__PURE__ */ T(z, {
									token: e,
									...Z,
									sample: /* @__PURE__ */ T("span", {
										className: "relative h-3 w-6",
										children: /* @__PURE__ */ T("span", {
											className: "absolute left-0 top-1/2 size-2 -translate-y-1/2 rounded-full bg-muted transition-transform group-hover:translate-x-4",
											style: {
												transitionDuration: k("duration", e.value),
												transitionTimingFunction: Ke
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
							/* @__PURE__ */ T(A, {
								title: r("Easing"),
								onAdd: () => X("ease", "cubic-bezier(0.2, 0.8, 0.2, 1)"),
								children: Y("ease").map((e) => /* @__PURE__ */ T(z, {
									token: e,
									...Z,
									children: Q(e, { component: "ease" })
								}, e.from ?? e.path))
							})
						] }),
						x === "elements" && /* @__PURE__ */ E(w, { children: [/* @__PURE__ */ T(Ne, {
							title: r("Elements"),
							options: o.data.elements ?? [],
							tokens: J,
							vars: Ge,
							value: H.styles,
							onChange: (e) => W((t) => ({
								...t,
								styles: e
							}))
						}), /* @__PURE__ */ T(Ne, {
							title: r("Prose"),
							options: o.data.elements ?? [],
							tokens: J,
							vars: Ge,
							value: H.prose,
							onChange: (e) => W((t) => ({
								...t,
								prose: e
							}))
						})] }),
						x === "buttons" && /* @__PURE__ */ T(Ie, {
							value: H.buttons,
							tokens: J,
							open: fe,
							onOpen: Ee,
							onSizes: () => S("space"),
							onChange: (e) => W((t) => ({
								...t,
								buttons: e
							}))
						}),
						x === "fields" && /* @__PURE__ */ T(me, {
							schema: o.data.fieldStyles ?? {},
							value: H.fields,
							tokens: J,
							dark: D === "dark",
							open: B,
							onOpen: je,
							note: /* @__PURE__ */ T(Pe, { onSizes: () => S("space") }),
							onChange: (e) => W((t) => ({
								...t,
								fields: e
							}))
						}),
						x === "code" && /* @__PURE__ */ T(Le, {
							css: H.css,
							js: H.js,
							onChange: (e) => W((t) => ({
								...t,
								...e
							}))
						})
					]
				}, x), /* @__PURE__ */ E("div", {
					className: "flex min-w-0 flex-col bg-sunken max-md:hidden",
					children: [/* @__PURE__ */ E("div", {
						className: "flex h-10 shrink-0 items-center gap-2 border-b border-border bg-bg px-3",
						children: [
							/* @__PURE__ */ T(v, {
								size: "xs",
								value: j,
								onChange: le,
								options: [
									{
										value: "desktop",
										icon: "desktop",
										title: r("Desktop")
									},
									{
										value: "tablet",
										icon: "tablet",
										title: r("Tablet")
									},
									{
										value: "phone",
										icon: "phone",
										title: r("Phone")
									}
								]
							}),
							j !== "desktop" && /* @__PURE__ */ T("span", {
								className: "font-mono text-2xs text-faint",
								children: xe[j]
							}),
							/* @__PURE__ */ T("span", { className: "flex-1" }),
							/* @__PURE__ */ T(v, {
								size: "xs",
								value: D,
								onChange: se,
								options: [{
									value: "light",
									icon: "sun",
									title: r("Light")
								}, {
									value: "dark",
									icon: "moon",
									title: r("Dark")
								}]
							})
						]
					}), /* @__PURE__ */ T(Se, {
						viewport: j,
						desktop: K === "/" ? ce(o.data.breakpoints?.lg) || 1024 : 0,
						children: (e) => /* @__PURE__ */ T("iframe", {
							ref: V,
							src: K,
							title: r(K === "/" ? "Site Preview" : x === "buttons" ? "Button Specimen" : "Form Field Specimen"),
							className: y("border-0 bg-bg", j !== "desktop" && "border-x border-border"),
							style: e,
							onLoad: () => {
								ze(), _e(V.current?.contentDocument, q, !1);
							}
						}, K)
					})]
				})]
			})
		]
	});
}
var R = "w-[108px] shrink-0 max-sm:w-[92px]";
function De(e, t) {
	let n = String(e ?? "").trim().match(/^(\d*\.?\d+)\s*(ms|s)?$/);
	if (!n) return t;
	let r = n[2] === "s" ? Number(n[1]) : Number(n[1]) / 1e3;
	return Math.min(2, Math.max(.05, Math.round(r * 1e3) / 1e3));
}
function z({ token: e, sample: t, after: n, below: i, wide: a, rename: o, remove: s, children: c }) {
	let l = `token:${e.path}`, u = () => void x(l, { copied: r("Copied {reference}", { reference: l }) });
	return /* @__PURE__ */ E("div", {
		className: "group border-b border-border last:border-b-0",
		children: [/* @__PURE__ */ E("div", {
			className: "flex min-h-9 items-center gap-2 py-1",
			children: [
				t !== void 0 && /* @__PURE__ */ T("span", {
					className: "grid w-7 shrink-0 place-items-center",
					children: t
				}),
				/* @__PURE__ */ T(re, {
					content: /* @__PURE__ */ T("span", {
						className: "font-mono",
						children: l
					}),
					children: /* @__PURE__ */ T("button", {
						type: "button",
						onClick: u,
						title: e.name,
						className: y("h-6 truncate rounded-xs text-left text-xs text-text hover:text-ink", a ? "min-w-0 flex-1" : t === void 0 ? "w-[120px] shrink-0 max-sm:w-20" : "w-[84px] shrink-0 max-sm:w-16"),
						children: e.name
					})
				}),
				a ? c : /* @__PURE__ */ T("div", {
					className: "flex w-60 shrink-0 max-lg:w-52 max-sm:w-auto max-sm:min-w-0 max-sm:flex-1",
					children: c
				}),
				!a && /* @__PURE__ */ T("span", {
					className: "flex min-w-0 flex-1 items-center max-sm:hidden",
					children: n
				}),
				/* @__PURE__ */ T(g, {
					trigger: /* @__PURE__ */ T(h, {
						icon: "more",
						label: r("Token Actions"),
						size: "xs",
						className: "shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-[popup-open]:opacity-100"
					}),
					items: [
						{
							label: r("Copy Reference"),
							icon: "copy",
							onSelect: u
						},
						{
							label: r("Rename…"),
							icon: "edit",
							onSelect: () => o(e)
						},
						{
							separator: !0,
							label: ""
						},
						{
							label: r("Delete"),
							icon: "trash",
							danger: !0,
							onSelect: () => s(e)
						}
					]
				})
			]
		}), i]
	});
}
function Oe({ label: e, children: t }) {
	return /* @__PURE__ */ E("div", {
		className: "flex min-h-9 items-center gap-2 border-b border-border py-1 last:border-b-0",
		children: [/* @__PURE__ */ T("span", {
			className: "w-[120px] shrink-0 truncate text-xs text-text",
			children: e
		}), /* @__PURE__ */ T("div", {
			className: "flex w-60 shrink-0 pr-8 max-lg:w-52",
			children: t
		})]
	});
}
function ke({ value: e, of: t }) {
	let n = Math.max(...t.map((e) => ce(e.value)), 1);
	return /* @__PURE__ */ T("span", {
		className: "h-1.5 min-w-px rounded-full bg-border-strong",
		style: { width: `${ce(e) / n * 100}%` }
	});
}
function Ae({ fonts: e, tokens: t, onChanged: i }) {
	let [a, o] = u(""), [s, c] = u(!1), l = [...new Set(e.map((e) => e.family))], f = async () => {
		let e = a.trim();
		if (e) {
			c(!0);
			try {
				await n("design/fonts-import", { family: e }), C.success(r("{family} added", { family: e })), o(""), i();
			} catch (e) {
				C.error(e);
			} finally {
				c(!1);
			}
		}
	}, m = async (e) => {
		let t = await new Promise((t) => {
			let n = new FileReader();
			n.onload = () => t(String(n.result)), n.readAsDataURL(e);
		}), a = e.name.replace(/\.woff2$/i, ""), o = await ae({
			title: r("Upload Font"),
			fields: [{
				handle: "family",
				type: "text",
				label: r("Family Name"),
				autofocus: !0
			}],
			values: { family: a.replace(/[-_](regular|bold|variable|italic|\d+).*$/i, "").replace(/[-_]/g, " ") },
			confirm: r("Upload")
		}), s = String(o?.family ?? "").trim();
		if (s) try {
			await n("design/fonts-upload", {
				family: s,
				name: a,
				data: t,
				weight: /variable/i.test(a) ? "100 900" : "400",
				style: /italic/i.test(a) ? "italic" : "normal"
			}), C.success(r("{family} uploaded", { family: s })), i();
		} catch (e) {
			C.error(e);
		}
	}, _ = async (t) => {
		if (await b({
			title: r("Remove {family}?", { family: t }),
			description: r("Font families that use it fall back to the system font."),
			confirm: r("Remove"),
			danger: !0
		})) try {
			await n("design/update", { fonts: e.filter((e) => e.family !== t) }), i();
		} catch (e) {
			C.error(e);
		}
	};
	return /* @__PURE__ */ E(A, {
		title: r("Font Files"),
		children: [
			l.length === 0 && /* @__PURE__ */ T("p", {
				className: "m-0 py-3 text-xs text-faint",
				children: r("None yet. The site uses system fonts.")
			}),
			l.map((n) => {
				let i = e.filter((e) => e.family === n), a = t.filter((e) => Array.isArray(e.value) && e.value[0] === n).map((e) => e.name);
				return /* @__PURE__ */ E("div", {
					className: "group flex items-center gap-3 border-b border-border py-2.5",
					children: [
						/* @__PURE__ */ T("span", {
							className: "grid size-9 shrink-0 place-items-center rounded-sm bg-sunken text-lg text-ink",
							style: { fontFamily: `"${n}"` },
							children: "Aa"
						}),
						/* @__PURE__ */ E("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ T("p", {
								className: "m-0 truncate text-sm text-ink",
								style: { fontFamily: `"${n}"` },
								children: n
							}), /* @__PURE__ */ E("p", {
								className: "m-0 truncate text-2xs text-faint",
								children: [i.map((e) => `${e.weight ?? "400"}${e.style === "italic" ? " italic" : ""}`).join(" · "), a.length > 0 && ` · ${r("used by {names}", { names: a.join(", ") })}`]
							})]
						}),
						/* @__PURE__ */ T(g, {
							trigger: /* @__PURE__ */ T(h, {
								icon: "more",
								label: r("Font Actions"),
								size: "xs",
								className: "opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-[popup-open]:opacity-100"
							}),
							items: [{
								label: r("Remove"),
								icon: "trash",
								danger: !0,
								onSelect: () => void _(n)
							}]
						})
					]
				}, n);
			}),
			/* @__PURE__ */ E("form", {
				className: "flex items-center gap-2 py-2.5",
				onSubmit: (e) => {
					e.preventDefault(), f();
				},
				children: [/* @__PURE__ */ T(p, {
					bare: !0,
					className: "min-w-0 flex-1",
					fields: [{
						handle: "family",
						type: "text",
						label: r("Google Font"),
						size: "sm",
						placeholder: r("Google Font, like Inter Tight"),
						icon: "search"
					}],
					values: { family: a },
					onChange: (e, t) => o(t ?? "")
				}), /* @__PURE__ */ T(d, {
					type: "submit",
					size: "sm",
					loading: s,
					disabled: !a.trim(),
					children: r("Add")
				})]
			}),
			/* @__PURE__ */ T(p, {
				bare: !0,
				fields: [{
					handle: "file",
					type: "json",
					component: "site-file",
					label: r("Font File"),
					placeholder: r("Drop a .woff2 file or choose one"),
					accept: ".woff2,font/woff2"
				}],
				values: {},
				onChange: (e, t) => t && void m(t)
			})
		]
	});
}
function B(e) {
	return {
		html: r("Page"),
		body: r("Body"),
		h1: r("Heading 1"),
		h2: r("Heading 2"),
		h3: r("Heading 3"),
		h4: r("Heading 4"),
		h5: r("Heading 5"),
		h6: r("Heading 6"),
		p: r("Paragraph"),
		a: r("Link"),
		"a:hover": r("Link on Hover"),
		small: r("Small Text"),
		strong: r("Bold Text"),
		em: r("Italic Text"),
		mark: r("Highlight"),
		code: r("Code"),
		kbd: r("Keyboard Key"),
		pre: r("Code Block"),
		blockquote: r("Quote"),
		hr: r("Divider"),
		ul: r("Bulleted List"),
		ol: r("Numbered List"),
		li: r("List Item"),
		img: r("Image"),
		figcaption: r("Caption"),
		table: r("Table"),
		th: r("Table Header"),
		td: r("Table Cell"),
		"::selection": r("Selected Text"),
		":focus-visible": r("Focus Ring"),
		"h1 em": r("Italic in Heading 1"),
		"h2 em": r("Italic in Heading 2"),
		"h3 em": r("Italic in Heading 3"),
		"h1 strong": r("Bold in Heading 1"),
		"h2 strong": r("Bold in Heading 2")
	}[e] ?? e;
}
var je = {
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
}, V = /* @__PURE__ */ new Set([
	"fontWeight",
	"lineHeight",
	"opacity",
	"zIndex"
]);
function H(e) {
	return Object.fromEntries(Object.entries(e ?? {}).map(([e, t]) => [je[e] ?? e, t]));
}
function U(e) {
	return Object.fromEntries(Object.entries(H(e)).map(([e, t]) => [e, typeof t == "number" && !V.has(e) && t !== 0 ? `${t}px` : k("", t)]));
}
function W(e) {
	let t = (t) => e.filter((e) => e.group === t);
	return [
		{
			handle: "fontFamily",
			type: "select",
			size: "sm",
			label: r("Font"),
			placeholder: r("Inherit"),
			options: t("font").map((e) => ({
				value: `token:${e.path}`,
				label: e.name
			}))
		},
		{
			handle: "fontSize",
			type: "text",
			component: "blocks-value",
			label: r("Size"),
			group: "text",
			placeholder: r("Inherit"),
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
			label: r("Weight"),
			placeholder: r("Inherit"),
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
			label: r("Line Height"),
			group: "leading",
			unit: "",
			step: .05,
			placeholder: r("Inherit")
		},
		{
			handle: "letterSpacing",
			type: "text",
			component: "blocks-value",
			label: r("Letter Spacing"),
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
			label: r("Color"),
			placeholder: r("Inherit")
		}
	];
}
function G() {
	return [
		{
			handle: "backgroundColor",
			type: "color",
			component: "blocks-color",
			label: r("Fill"),
			placeholder: r("None")
		},
		{
			handle: "border",
			type: "group",
			component: "blocks-group",
			label: r("Border"),
			fields: [{
				handle: "borderWidth",
				type: "text",
				component: "blocks-value",
				label: r("Border Width"),
				placeholder: "0",
				min: 0,
				className: "!flex-none w-[64px]"
			}, {
				handle: "borderColor",
				type: "color",
				component: "blocks-color",
				label: r("Border Color"),
				placeholder: r("None")
			}]
		},
		{
			handle: "borderRadius",
			type: "text",
			component: "blocks-value",
			label: r("Radius"),
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
			label: r("Padding"),
			fields: [{
				handle: "paddingBlock",
				type: "text",
				component: "blocks-value",
				label: r("Vertical Padding"),
				group: "space",
				prefixIcon: "b-arrows-out-line-vertical",
				unit: "rem",
				placeholder: "0",
				min: 0
			}, {
				handle: "paddingInline",
				type: "text",
				component: "blocks-value",
				label: r("Horizontal Padding"),
				group: "space",
				prefixIcon: "b-arrows-out-line-horizontal",
				unit: "rem",
				placeholder: "0",
				min: 0
			}]
		}
	];
}
function Me({ value: e, onChange: t, fields: n, tokens: i }) {
	let a = H(e), o = (e) => (e.fields ?? [e]).map((e) => e.handle), s = new Set(n.flatMap(o)), c = (e) => {
		let n = { ...a };
		for (let [t, r] of Object.entries(e)) r == null || r === "" ? delete n[t] : n[t] = r;
		t(n);
	}, l = {}, u = n.map((e) => {
		let t = o(e);
		return l[e.handle] = e.fields ? Object.fromEntries(t.map((e) => [e, a[e] ?? null])) : a[e.handle] ?? null, {
			...e,
			status: t.some((e) => e in a) ? "own" : void 0,
			reset: () => c(Object.fromEntries(t.map((e) => [e, null])))
		};
	}), d = Object.fromEntries(Object.entries(a).filter(([e]) => !s.has(e)));
	return /* @__PURE__ */ E(w, { children: [
		/* @__PURE__ */ T(p, {
			layout: "inline",
			fields: u.filter((e) => e.component !== "blocks-shadows"),
			values: l,
			onChange: (e, t) => {
				let r = n.find((t) => t.handle === e);
				c(r?.fields ? Object.fromEntries(o(r).map((e) => [e, t?.[e] ?? null])) : { [e]: t });
			}
		}),
		u.filter((e) => e.component === "blocks-shadows").map((e) => /* @__PURE__ */ T(p, {
			bare: !0,
			fields: [e],
			values: l,
			onChange: (e, t) => c({ [e]: t })
		}, e.handle)),
		/* @__PURE__ */ T(p, {
			bare: !0,
			fields: [{
				handle: "css",
				type: "json",
				component: "site-declarations",
				label: r("CSS"),
				mono: !1,
				tokens: i.map((e) => `token:${e.path}`)
			}],
			values: { css: d },
			onChange: (e, n) => t({
				...Object.fromEntries(Object.entries(a).filter(([e]) => s.has(e))),
				...n ?? {}
			})
		})
	] });
}
function Ne({ title: e, value: t, onChange: n, options: i, tokens: a, vars: o }) {
	let [s, c] = u(null), l = i.filter((e) => !(e in t)), d = [...W(a), ...G()];
	return /* @__PURE__ */ E(A, {
		title: e,
		action: /* @__PURE__ */ T(g, {
			trigger: /* @__PURE__ */ T(h, {
				icon: "plus",
				label: r("Add Element"),
				size: "xs"
			}),
			items: l.map((e) => ({
				label: B(e),
				onSelect: () => {
					n({
						...t,
						[e]: {}
					}), c(e);
				}
			})),
			className: "max-h-72 overflow-auto"
		}),
		children: [Object.keys(t).length === 0 && /* @__PURE__ */ T("p", {
			className: "m-0 py-3 text-xs text-faint",
			children: r("No element styles")
		}), Object.entries(t).map(([e, i]) => /* @__PURE__ */ T(j, {
			open: s === e,
			onToggle: () => c(s === e ? null : e),
			label: B(e),
			aside: /* @__PURE__ */ T("span", {
				"aria-hidden": "true",
				className: "grid h-6 w-9 shrink-0 place-items-center rounded-xs",
				style: {
					...o,
					background: "var(--color-background)",
					color: "var(--color-foreground)"
				},
				children: /* @__PURE__ */ T("span", {
					className: "px-0.5",
					style: {
						...U(i),
						fontSize: 15,
						lineHeight: 1.2,
						margin: 0,
						paddingBlock: 0
					},
					children: "Aa"
				})
			}),
			menu: /* @__PURE__ */ T(g, {
				trigger: /* @__PURE__ */ T(h, {
					icon: "more",
					label: r("Element Actions"),
					size: "xs",
					className: "shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-[popup-open]:opacity-100"
				}),
				items: [{
					label: r("Remove"),
					icon: "trash",
					danger: !0,
					onSelect: () => n(Object.fromEntries(Object.entries(t).filter(([t]) => t !== e)))
				}]
			}),
			children: /* @__PURE__ */ T(Me, {
				value: i,
				fields: d,
				tokens: a,
				onChange: (r) => n({
					...t,
					[e]: r
				})
			})
		}, e))]
	});
}
function Pe({ onSizes: e }) {
	return /* @__PURE__ */ E("p", {
		className: "m-0 flex items-center gap-1.5 border-b border-border py-2.5 text-xs text-muted",
		children: [
			/* @__PURE__ */ T(m, {
				name: "info",
				size: 13,
				className: "shrink-0 text-faint"
			}),
			/* @__PURE__ */ T("span", {
				className: "min-w-0 flex-1",
				children: r("Heights, padding and text size are the Control Sizes buttons and fields share.")
			}),
			/* @__PURE__ */ T("button", {
				type: "button",
				onClick: e,
				className: "shrink-0 cursor-pointer text-text underline decoration-faint underline-offset-2 hover:text-ink",
				children: r("Edit Sizes")
			})
		]
	});
}
function Fe({ defaults: e, tokens: t, onSet: n }) {
	let i = [
		["sm", r("Small")],
		["md", r("Medium")],
		["lg", r("Large")]
	], a = [
		[
			"height",
			r("Height"),
			{
				unit: "rem",
				units: ["rem", "px"],
				step: .125,
				min: 0
			}
		],
		[
			"padding",
			r("Padding"),
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
			r("Text"),
			{
				unit: "rem",
				units: ["rem", "px"],
				step: .0625,
				min: 0,
				group: "text"
			}
		]
	], s = (e) => {
		let n = Array.isArray(e) ? e.find((e) => !e.startsWith("token:") || t.some((t) => `token:${t.path}` === e)) : e;
		return String(n ?? "").replace(/^token:[a-z]+\./, "");
	};
	return /* @__PURE__ */ E(A, {
		title: r("Control Sizes"),
		children: [/* @__PURE__ */ T("p", {
			className: "m-0 pb-1 pt-2 text-xs text-muted",
			children: r("Buttons, form fields, tags and chips of the same size line up.")
		}), /* @__PURE__ */ E("div", {
			className: "grid grid-cols-[52px_repeat(3,minmax(0,1fr))] items-center gap-x-2 gap-y-1.5 py-2",
			children: [
				/* @__PURE__ */ T("span", {}),
				a.map(([e, t]) => /* @__PURE__ */ T("span", {
					className: "text-2xs text-faint",
					children: t
				}, e)),
				i.map(([r, i]) => /* @__PURE__ */ E(o, { children: [/* @__PURE__ */ T("span", {
					className: "text-xs text-text",
					children: i
				}), a.map(([a, o, c]) => {
					let l = `control.${r}-${a}`, u = t.find((e) => e.path === l);
					return /* @__PURE__ */ T(p, {
						bare: !0,
						fields: [{
							handle: l,
							type: "text",
							component: "blocks-value",
							label: `${i} ${o}`,
							placeholder: s(e[r]?.[a]),
							...c
						}],
						values: { [l]: u?.value ?? null },
						onChange: (e, t) => n(l, t)
					}, a);
				})] }, r))
			]
		})]
	});
}
function Ie({ value: e, onChange: t, tokens: n, open: i, onOpen: a, onSizes: o }) {
	let [s, c] = u("base"), l = async () => {
		let n = await ae({
			title: r("New Button Variant"),
			fields: [{
				handle: "name",
				type: "text",
				label: r("Name"),
				placeholder: "outline",
				mono: !0,
				autofocus: !0
			}],
			confirm: r("Add")
		}), i = String(n?.name ?? "").toLowerCase().replace(/[^a-z0-9-]/g, "");
		i && !(i in e) && (t({
			...e,
			[i]: {
				base: {},
				hover: {}
			}
		}), a(i));
	}, d = (e) => [
		"base",
		"hover",
		"active",
		"focus-visible"
	].some((t) => t in e) ? e : { base: e }, f = (e) => e.charAt(0).toUpperCase() + e.slice(1).replace(/-/g, " "), p = [
		...G().filter((e) => e.handle !== "padding"),
		...W(n).filter((e) => [
			"fontWeight",
			"letterSpacing",
			"color"
		].includes(e.handle)).map((e) => e.handle === "color" ? {
			...e,
			label: r("Text")
		} : e),
		{
			handle: "boxShadow",
			type: "text",
			component: "blocks-shadows",
			label: r("Shadow"),
			group: "shadow"
		},
		{
			handle: "opacity",
			type: "text",
			component: "blocks-value",
			label: r("Opacity"),
			percent: !0,
			step: .05,
			min: 0,
			max: 1,
			placeholder: "100"
		}
	];
	return /* @__PURE__ */ E(A, {
		title: r("Button Variants"),
		onAdd: l,
		children: [
			/* @__PURE__ */ T(Pe, { onSizes: o }),
			Object.keys(e).length === 0 && /* @__PURE__ */ T("p", {
				className: "m-0 py-3 text-xs text-faint",
				children: r("No variants")
			}),
			Object.entries(e).map(([o, l]) => /* @__PURE__ */ E(j, {
				open: i === o,
				onToggle: () => a(i === o ? null : o),
				label: f(o),
				menu: /* @__PURE__ */ T(g, {
					trigger: /* @__PURE__ */ T(h, {
						icon: "more",
						label: r("Variant Actions"),
						size: "xs",
						className: "shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-[popup-open]:opacity-100"
					}),
					items: [{
						label: r("Delete"),
						icon: "trash",
						danger: !0,
						onSelect: () => t(Object.fromEntries(Object.entries(e).filter(([e]) => e !== o)))
					}]
				}),
				children: [/* @__PURE__ */ T("div", {
					className: "mb-2",
					children: /* @__PURE__ */ T(v, {
						size: "xs",
						block: !0,
						"aria-label": r("State"),
						value: s,
						onChange: c,
						options: [
							{
								value: "base",
								label: r("Default")
							},
							{
								value: "hover",
								label: r("Hover")
							},
							{
								value: "active",
								label: r("Pressed")
							},
							{
								value: "focus-visible",
								label: r("Focus")
							}
						]
					})
				}), /* @__PURE__ */ T(Me, {
					value: d(l)[s],
					fields: p,
					tokens: n,
					onChange: (n) => t({
						...e,
						[o]: {
							...d(l),
							[s]: n
						}
					})
				}, s)]
			}, o))
		]
	});
}
function Le({ css: t, js: n, onChange: i }) {
	let a = e("site.code"), o = (e, t, n, r) => /* @__PURE__ */ T(A, {
		title: t,
		children: /* @__PURE__ */ T("div", {
			className: "py-2.5",
			children: /* @__PURE__ */ T(p, {
				bare: !0,
				fields: [{
					handle: e,
					type: "code",
					label: t,
					rows: 14,
					placeholder: n
				}],
				values: { [e]: r },
				onChange: (t, n) => i({ [e]: n ?? "" }),
				disabled: !a
			})
		})
	});
	return /* @__PURE__ */ E(w, { children: [
		o("css", r("Custom CSS"), ".cms-prose figure { margin-block: 2rem; }", t),
		o("js", r("Custom JavaScript"), "document.addEventListener('cms:alpine', (e) => …)", n),
		!a && /* @__PURE__ */ T("p", {
			className: "m-0 text-2xs text-warning",
			children: r("Editing code needs the “Edit custom CSS and JavaScript” permission.")
		})
	] });
}
export { Ee as default };
