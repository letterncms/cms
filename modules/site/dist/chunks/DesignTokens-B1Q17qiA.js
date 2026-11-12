import { a as e, o as t, s as n } from "./fields-BVuL0wU8.js";
import { can as r, invalidate as i, queryClient as a, run as o, t as s, useAbility as c, useTab as l } from "@letterncms/sdk";
import { Fragment as u, useEffect as d, useMemo as f, useRef as p, useState as m } from "react";
import { Button as h, Fields as g, Icon as _, IconButton as v, Menu as y, NEW_COLOR as b, QueryError as ee, SaveBar as te, ScreenSidebar as ne, Segmented as x, SidebarRow as re, Skeleton as S, Spinner as ie, Tooltip as C, Topbar as ae, cn as w, confirm as oe, copyText as T, deviceWidths as se, prompt as E, toast as D, useScreenSidebar as ce, useTheme as le } from "@letterncms/ui";
import { Fragment as O, jsx as k, jsxs as A } from "react/jsx-runtime";
// admin/src/design-parts.tsx
var j = { weight: "font-weight" }, ue = (e, t) => `--${j[e] ?? e}-${t}`;
function M(e, t) {
	return t && typeof t == "object" && !Array.isArray(t) && "min" in t ? de(String(t.min), String(t.max)) : e === "font" && Array.isArray(t) ? t.map((e) => /\s/.test(e) && !e.includes("\"") ? `"${e}"` : e).join(", ") : String(t ?? "").replace(/token:([a-z]+)\.([a-z0-9-]+)(?:\/(\d{1,3}))?/g, (e, t, n, r) => r ? `color-mix(in srgb, var(${ue(t, n)}) ${r}%, transparent)` : `var(${ue(t, n)})`);
}
function de(e, t) {
	let n = (e) => e.endsWith("rem") ? parseFloat(e) : parseFloat(e) / 16, r = n(e), i = n(t), a = (i - r) / 57.5, o = (e) => String(Math.round(e * 1e4) / 1e4);
	return `clamp(${o(Math.min(r, i))}rem, ${o(r - a * 22.5)}rem + ${o(a * 100)}vw, ${o(Math.max(r, i))}rem)`;
}
function fe(e) {
	let t = e && typeof e == "object" && "max" in e ? e.max : e, n = parseFloat(String(t ?? ""));
	return Number.isNaN(n) ? 0 : /r?em$/.test(String(t)) ? n * 16 : n;
}
function N({ title: e, onAdd: t, addLabel: n, action: r, children: i }) {
	let a = n ?? s("Add Token");
	return /* @__PURE__ */ A("section", {
		className: "mb-6",
		children: [
			e && /* @__PURE__ */ A("div", {
				className: "flex h-9 items-center justify-between border-b border-border",
				children: [
					/* @__PURE__ */ k("h3", {
						className: "m-0 text-xs font-semibold text-ink",
						children: e
					}),
					r,
					t && /* @__PURE__ */ k(C, {
						content: a,
						children: /* @__PURE__ */ k(v, {
							icon: "plus",
							label: a,
							title: void 0,
							size: "xs",
							onClick: t
						})
					})
				]
			}),
			i,
			!e && (r || t) && /* @__PURE__ */ k("div", {
				className: "flex h-9 items-center border-t border-border",
				children: r ?? /* @__PURE__ */ k(h, {
					variant: "ghost",
					size: "xs",
					icon: "plus",
					onClick: t,
					className: "-ml-1.5 !px-1.5 !font-normal !text-muted hover:!text-ink",
					children: a
				})
			})
		]
	});
}
function P({ open: e, onToggle: t, label: n, aside: r, menu: i, children: a }) {
	return /* @__PURE__ */ A("div", {
		className: "cms-reveal-row group border-b border-border last:border-b-0",
		children: [/* @__PURE__ */ A("div", {
			className: "flex min-h-10 items-center gap-2",
			children: [/* @__PURE__ */ A(h, {
				variant: "ghost",
				"aria-expanded": e,
				onClick: t,
				className: "!h-auto min-h-10 min-w-0 flex-1 shrink !justify-start !gap-1.5 !rounded-xs !bg-transparent !px-0 text-left !text-xs !font-normal focus-visible:!-outline-offset-2 hover:text-ink",
				children: [
					/* @__PURE__ */ k(_, {
						name: "chevron-right",
						size: 12,
						className: w("shrink-0 text-faint transition-transform duration-fast", e && "rotate-90")
					}),
					/* @__PURE__ */ k("span", {
						className: "min-w-0 flex-1 truncate",
						children: n
					}),
					r
				]
			}), i]
		}), e && /* @__PURE__ */ k("div", {
			className: "pb-3 pl-[18px]",
			children: a
		})]
	});
}
// admin/src/form-fields.tsx
function pe(e, t) {
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
function F(e, t, n, r, i, a = 0) {
	if (a > 8) return "transparent";
	let o = (e) => {
		let t = r.find((t) => t.path === e);
		return t ? String(i && t.dark ? t.dark : t.value) : null;
	}, s = new Map(Object.entries(t).flatMap(([e, t]) => Object.entries(t).map(([t, n]) => [n.variable, [e, t]]))), c = e.replace(/token:color\.([a-z0-9-]+)(?:\/(\d{1,3}))?/g, (e, t, n) => {
		let r = o(`color.${t}`) ?? "transparent";
		return n ? `color-mix(in srgb, ${r} ${n}%, transparent)` : r;
	});
	for (let e = c.indexOf("var("); e >= 0; e = c.indexOf("var(")) {
		let l = pe(c, e);
		if (!l) break;
		let u = s.get(l.name), d = l.name.startsWith("--color-") ? o(`color.${l.name.slice(8)}`) : null, f = u ? R(t, n, u[0], u[1], r) : d ?? l.fallback ?? "transparent";
		c = c.slice(0, e) + F(f, t, n, r, i, a + 1) + c.slice(l.end);
	}
	if (/^field:/.test(c)) {
		let [e, o] = c.slice(6).split(".");
		return F(R(t, n, e, o, r), t, n, r, i, a + 1);
	}
	return c.replace(/currentColor/gi, o("color.foreground") ?? "var(--cms-ink)");
}
function me() {
	return [
		{
			key: "field",
			label: s("All Fields"),
			parts: ["field"],
			specimen: "field"
		},
		{
			key: "states",
			label: s("States"),
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
			label: s("Labels and Help"),
			parts: ["label", "help"],
			specimen: "labels"
		},
		{
			key: "spacing",
			label: s("Size and Spacing"),
			parts: ["spacing"],
			specimen: "sizes"
		},
		{
			key: "select",
			label: s("Dropdowns"),
			parts: ["select"],
			specimen: "select"
		},
		{
			key: "textarea",
			label: s("Text Areas"),
			parts: ["textarea"],
			specimen: "textarea"
		},
		{
			key: "checkbox",
			label: s("Checkboxes||controls"),
			parts: ["checkbox"],
			specimen: "checkbox"
		},
		{
			key: "radio",
			label: s("Radio Buttons"),
			parts: ["radio"],
			specimen: "radio"
		},
		{
			key: "switch",
			label: s("Switches"),
			parts: ["switch"],
			specimen: "switch"
		},
		{
			key: "slider",
			label: s("Sliders"),
			parts: ["slider"],
			specimen: "slider"
		},
		{
			key: "tags",
			label: s("Tag Fields"),
			parts: ["tags"],
			specimen: "tags"
		},
		{
			key: "chips",
			label: s("Chips"),
			parts: ["chips"],
			specimen: "chips"
		},
		{
			key: "file",
			label: s("File Pickers"),
			parts: ["file"],
			specimen: "file"
		}
	];
}
function I(e, t) {
	let n = {
		"invalid.color": s("Color"),
		"invalid.ringColor": s("Ring"),
		"label.color": s("Color"),
		"help.color": s("Color"),
		"label.fontSize": s("Size"),
		"help.fontSize": s("Size"),
		"label.fontWeight": s("Weight"),
		"checkbox.background": s("Fill"),
		"checkbox.borderColor": s("Border"),
		"slider.fill": s("Filled Track"),
		"tags.background": s("Tag Fill"),
		"tags.color": s("Tag Text"),
		"tags.radius": s("Tag Radius"),
		"file.background": s("Button Fill"),
		"file.color": s("Button Text"),
		"file.radius": s("Button Radius"),
		"spacing.label": s("Label and Field"),
		"spacing.size": s("Form Size"),
		"switch.knobShadow": s("Shadow"),
		"slider.thumbShadow": s("Shadow"),
		"switch.radius": s("Radius"),
		"chips.background": s("Fill"),
		"chips.borderColor": s("Border")
	}, r = {
		height: s("Height"),
		paddingX: s("Padding"),
		background: s("Fill"),
		borderWidth: s("Border Width"),
		borderColor: s("Border"),
		radius: s("Radius"),
		color: s("Text"),
		fontSize: s("Text Size"),
		fontWeight: s("Weight"),
		placeholder: s("Placeholder"),
		shadow: s("Shadow"),
		ringWidth: s("Ring Width"),
		ringColor: s("Ring"),
		opacity: s("Opacity"),
		required: s("Required Mark"),
		fields: s("Fields"),
		list: s("Options"),
		choice: s("Box and Text"),
		arrowColor: s("Arrow"),
		arrowSize: s("Arrow Size"),
		minHeight: s("Minimum Height"),
		resize: s("Resize"),
		size: s("Size"),
		checked: s("Checked"),
		markColor: s("Mark"),
		mark: s("Mark Shape"),
		markWeight: s("Mark Weight"),
		markSize: s("Mark Size"),
		style: s("Style"),
		dotColor: s("Dot"),
		dotSize: s("Dot Size"),
		width: s("Width"),
		off: s("Off"),
		on: s("On"),
		knob: s("Knob"),
		inset: s("Knob Inset"),
		knobShadow: s("Knob Shadow"),
		trackHeight: s("Track Height"),
		track: s("Track"),
		thumbSize: s("Thumb Size"),
		thumb: s("Thumb"),
		thumbBorder: s("Thumb Border"),
		thumbShadow: s("Thumb Shadow"),
		selected: s("Selected"),
		selectedText: s("Selected Text")
	};
	return n[`${e}.${t}`] ?? r[t] ?? t;
}
function L(e) {
	return {
		sm: s("S"),
		md: s("M"),
		lg: s("L"),
		vertical: s("Vertical"),
		none: s("Fixed"),
		check: s("Check"),
		square: s("Square"),
		dot: s("Dot"),
		light: s("Light||weight"),
		regular: s("Regular"),
		bold: s("Bold"),
		ring: s("Ring")
	}[e] ?? e;
}
function he(e) {
	return {
		hover: s("Hover"),
		focus: s("Focus"),
		invalid: s("Invalid"),
		disabled: s("Disabled")
	}[e];
}
function R(e, t, n, r, i, a = 0) {
	let o = t[n]?.[r];
	if (o !== void 0 && o !== "") return String(o);
	let s = e[n]?.[r];
	if (!s || a > 5) return "";
	if (s.inherits) {
		let [n, r] = s.inherits.split(".");
		return R(e, t, n, r, i, a + 1);
	}
	let c = s.default;
	return Array.isArray(c) ? c.find((e) => !e.startsWith("token:") || i.some((t) => `token:${t.path}` === e)) ?? c[c.length - 1] : c ?? "";
}
function ge(e, t, n, r, i) {
	if (e[n][r].type === "choice") return "";
	let [a, o] = [n, r];
	for (let n = 0; n < 6 && e[a]?.[o]?.inherits && t[a]?.[o] === void 0; n++) [a, o] = e[a][o].inherits.split(".");
	let c = e[a]?.[o], l = t[a]?.[o], u = R(e, t, a, o, i), d = u.match(/^token:[a-z]+\.([a-z0-9-]+)$/);
	return d ? d[1] : l === void 0 && c?.hint ? {
		border: s("From border"),
		darker: s("Darker"),
		faint: s("Faint")
	}[c.hint] ?? c.hint : u === "currentColor" ? s("Text color") : /^0 0 (#0+|transparent)$/.test(u) ? s("None") : e[n][r].type === "shadow" ? s("Soft") : u === "999px" ? s("Round") : u;
}
function _e(e, t, n, r, i) {
	let a = r.filter((e) => e.group === "weight");
	return Object.entries(e[n] ?? {}).map(([o, s]) => {
		let c = {
			handle: o,
			label: I(n, o),
			placeholder: ge(e, t, n, o, r)
		};
		switch (s.type) {
			case "color": return {
				...c,
				type: "color",
				component: "blocks-color",
				swatch: F(R(e, t, n, o, r), e, t, r, i)
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
					label: L(e)
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
function ve(e, t) {
	let n = [];
	for (let [r, i] of Object.entries(t)) for (let [t, a] of Object.entries(i)) {
		let i = e[r]?.[t];
		if (!i || i.type === "choice" || a === "" || a === null) continue;
		let o = String(a), s = o.match(/^field:([a-z]+)\.([a-zA-Z]+)$/);
		n.push(`${i.variable}:${s ? `var(${e[s[1]]?.[s[2]]?.variable})` : typeof a == "number" && i.type === "length" && a !== 0 ? `${a}px` : M("", o)}`);
	}
	return n.join(";");
}
function ye({ schema: e, value: t, onChange: n, tokens: r, dark: i, open: a, onOpen: o }) {
	let [c, l] = m("focus"), u = (e, r) => {
		let i = Object.fromEntries(Object.entries(r).filter(([, e]) => e != null && e !== "")), a = Object.fromEntries(Object.entries(t).filter(([t]) => t !== e));
		n(Object.keys(i).length ? {
			...a,
			[e]: i
		} : a);
	}, d = (n, a, o) => {
		let s = _e(e, t, n, r, i).filter((e) => !o || o.includes(e.handle)).map((e) => ({
			...e,
			status: t[n]?.[e.handle] === void 0 ? void 0 : "own",
			reset: () => u(n, {
				...t[n],
				[e.handle]: null
			})
		}));
		return /* @__PURE__ */ A("div", {
			className: a ? "mt-3 first:mt-0" : void 0,
			children: [
				a && /* @__PURE__ */ k("h4", {
					className: "m-0 mb-1 text-2xs font-medium uppercase tracking-wide text-faint",
					children: a
				}),
				/* @__PURE__ */ k(g, {
					layout: "inline",
					fields: s.filter((e) => e.component !== "blocks-shadows"),
					values: t[n] ?? {},
					onChange: (e, r) => u(n, {
						...t[n],
						[e]: r
					})
				}),
				s.filter((e) => e.component === "blocks-shadows").map((e) => /* @__PURE__ */ k(g, {
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
	return /* @__PURE__ */ k(N, { children: me().map((e) => /* @__PURE__ */ k(P, {
		open: a === e.key,
		onToggle: () => o(a === e.key ? null : e.key),
		label: e.label,
		aside: f(e.parts) ? /* @__PURE__ */ k("span", {
			className: "size-1.5 shrink-0 rounded-full bg-focus",
			title: s("Changed")
		}) : void 0,
		menu: f(e.parts) ? /* @__PURE__ */ k(y, {
			trigger: /* @__PURE__ */ k(v, {
				icon: "more",
				label: s("Section Actions"),
				size: "xs",
				className: "cms-reveal shrink-0"
			}),
			items: [{
				label: s("Reset to Defaults"),
				icon: "undo",
				onSelect: () => n(Object.fromEntries(Object.entries(t).filter(([t]) => !e.parts.includes(t))))
			}]
		}) : void 0,
		children: e.key === "states" ? /* @__PURE__ */ A(O, { children: [/* @__PURE__ */ k("div", {
			className: "mb-2",
			children: /* @__PURE__ */ k(x, {
				size: "xs",
				block: !0,
				"aria-label": s("State"),
				value: c,
				onChange: l,
				options: [
					"hover",
					"focus",
					"invalid",
					"disabled"
				].map((e) => ({
					value: e,
					label: he(e)
				}))
			})
		}), d(c)] }) : e.key === "spacing" ? /* @__PURE__ */ A(O, { children: [d("spacing", void 0, ["size"]), d("spacing", s("Space Between"), [
			"fields",
			"label",
			"list",
			"choice"
		])] }) : e.key === "label" ? /* @__PURE__ */ A(O, { children: [d("label", s("Label")), d("help", s("Help Text"))] }) : d(e.parts[0])
	}, e.key)) });
}
function be(e) {
	return me().find((t) => t.key === e)?.specimen ?? null;
}
// admin/src/specimen.tsx
function xe(e, t) {
	if (!e?.head) return;
	let n = e.querySelector("link[rel=\"stylesheet\"][href*=\"/_cms/site/design-\"]"), r = e.getElementById("cms-design-preview");
	t.compiled === null ? (r?.remove(), n && (n.disabled = !1)) : (r || (r = e.createElement("style"), r.id = "cms-design-preview", n ? n.after(r) : e.head.appendChild(r)), r.textContent !== t.compiled && (r.textContent = t.compiled), n && (n.disabled = !0));
	let i = e.getElementById("cms-token-preview");
	i || (i = e.createElement("style"), i.id = "cms-token-preview", e.head.appendChild(i));
	let a = t.vars ? `:root:root:root{${t.vars}}` : "";
	i.textContent !== a && (i.textContent = a), e.documentElement.dataset.theme !== t.mode && (e.documentElement.dataset.theme = t.mode);
}
function Se(e, t, n) {
	if (!e?.body) return;
	for (let t of e.querySelectorAll("[data-part][data-active]")) t.removeAttribute("data-active");
	let r = t ? e.querySelector(`[data-part="${CSS.escape(t)}"]`) : null;
	r && (r.setAttribute("data-active", ""), r.scrollIntoView({
		behavior: n ? "smooth" : "instant",
		block: "nearest"
	}));
}
// admin/src/code-files.tsx
var z = "cms-reveal shrink-0", B = () => /* @__PURE__ */ A("div", {
	className: "space-y-2 py-3",
	children: [/* @__PURE__ */ k(S, { className: "h-3 w-32" }), /* @__PURE__ */ k(S, { className: "h-3 w-24" })]
}), Ce = ({ children: e }) => /* @__PURE__ */ k("p", {
	className: "m-0 py-3 text-xs text-faint",
	children: e
}), we = (e, t) => t.length > 0 ? /* @__PURE__ */ k(y, {
	trigger: /* @__PURE__ */ k(v, {
		icon: "more",
		label: e,
		size: "xs",
		className: z
	}),
	items: t
}) : /* @__PURE__ */ k("span", { className: "size-6 shrink-0" }), Te = {
	scripts: "export function mount(el, props) {\n}\n",
	styles: "\n"
}, Ee = {
	scripts: "js",
	styles: "css"
};
function De({ path: e, name: t, open: n, onToggle: r, edited: i, onEdit: a, allowed: o, onDelete: l }) {
	let u = c("design-code/get", { path: e }, {
		enabled: n && o && i === void 0,
		staleTime: 0
	});
	return /* @__PURE__ */ k(P, {
		open: n,
		onToggle: r,
		label: /* @__PURE__ */ k("span", {
			className: "font-mono",
			children: t
		}),
		menu: we(s("File Actions"), o ? [{
			label: s("Delete"),
			icon: "trash",
			danger: !0,
			onSelect: l
		}] : []),
		children: u.isError ? /* @__PURE__ */ k(ee, {
			compact: !0,
			onRetry: () => void u.refetch(),
			retrying: u.isRefetching
		}) : i === void 0 && !u.data ? /* @__PURE__ */ k(B, {}) : /* @__PURE__ */ k(g, {
			bare: !0,
			fields: [{
				handle: "contents",
				type: "code",
				label: t,
				rows: 14
			}],
			values: { contents: i ?? u.data?.contents ?? "" },
			onChange: (e, t) => a(t ?? ""),
			disabled: !o
		})
	});
}
function Oe({ css: e, js: t, onCustom: n, edits: a, onEdit: l }) {
	let u = r("site.code"), d = c("design-code/list"), f = c("design-vendor/list"), [p, h] = m(null), [_, v] = m(null), y = () => i("design-code/", "design-vendor/"), b = async (e, t) => {
		try {
			return await e(), y(), D.success(t), !0;
		} catch (e) {
			return D.error(e), !1;
		}
	}, te = async (e, t, n) => {
		v(e), await b(t, n), v(null);
	}, ne = async (e) => {
		let t = await E({
			title: s(e === "scripts" ? "New Script" : "New Style"),
			fields: [{
				handle: "name",
				type: "text",
				label: s("Name"),
				mono: !0,
				autofocus: !0,
				placeholder: "hero"
			}],
			confirm: s(e === "scripts" ? "Create Script" : "Create Style")
		}), n = String(t?.name ?? "").trim().toLowerCase().replace(/\.(js|css)$/, "").replace(/\s+/g, "-");
		if (!n) return;
		if ((d.data?.[e] ?? []).includes(n)) return void D.error(s("“{name}” already exists", { name: n }));
		let r = `${e}/${n}.${Ee[e]}`;
		await b(() => o("design-code/save", {
			path: r,
			contents: Te[e]
		}), s("{name} added", { name: n })) && h(r);
	}, x = async (e, t) => {
		await oe({
			title: s("Delete “{name}”?", { name: t }),
			confirm: s("Delete"),
			danger: !0
		}) && await b(() => o("design-code/delete", { path: e }), s("{name} deleted", { name: t })) && l(e, null);
	}, re = async () => {
		let e = await E({
			title: s("Add Library"),
			fields: [{
				handle: "package",
				type: "text",
				label: s("Package"),
				mono: !0,
				autofocus: !0,
				placeholder: "gsap@3.12.5"
			}],
			confirm: s("Add Library")
		}), t = String(e?.package ?? "").trim();
		t && await te("add", () => o("design-vendor/create", { package: t }), s("{name} added", { name: t }));
	}, S = async (e) => {
		await oe({
			title: s("Delete “{name}”?", { name: e }),
			confirm: s("Delete"),
			danger: !0
		}) && await b(() => o("design-vendor/delete", { import: e }), s("{name} deleted", { name: e }));
	}, C = (e, t, r, i) => /* @__PURE__ */ A(N, {
		title: t,
		onAdd: u ? () => void ne(e) : void 0,
		addLabel: r,
		children: [/* @__PURE__ */ k(P, {
			open: p === i.handle,
			onToggle: () => h(p === i.handle ? null : i.handle),
			label: i.label,
			menu: /* @__PURE__ */ k("span", { className: "size-6 shrink-0" }),
			children: /* @__PURE__ */ k(g, {
				bare: !0,
				fields: [{
					handle: i.handle,
					type: "code",
					label: i.label,
					rows: 14,
					placeholder: i.placeholder
				}],
				values: { [i.handle]: i.value },
				onChange: (e, t) => n({ [i.handle]: t ?? "" }),
				disabled: !u
			})
		}), d.isError ? /* @__PURE__ */ k(ee, {
			compact: !0,
			onRetry: () => void d.refetch(),
			retrying: d.isRefetching
		}) : d.data ? d.data[e].map((t) => {
			let n = `${e}/${t}.${Ee[e]}`;
			return /* @__PURE__ */ k(De, {
				path: n,
				name: t,
				open: p === n,
				onToggle: () => h(p === n ? null : n),
				edited: a[n],
				onEdit: (e) => l(n, e),
				allowed: u,
				onDelete: () => void x(n, t)
			}, n);
		}) : /* @__PURE__ */ k(B, {})]
	});
	return /* @__PURE__ */ A(O, { children: [
		C("styles", s("Styles"), s("New Style"), {
			handle: "css",
			label: s("Site CSS"),
			value: e,
			placeholder: ".cms-prose figure { margin-block: 2rem; }"
		}),
		C("scripts", s("Scripts"), s("New Script"), {
			handle: "js",
			label: s("Site JavaScript"),
			value: t,
			placeholder: "document.addEventListener('cms:alpine', (e) => …)"
		}),
		/* @__PURE__ */ k(N, {
			title: s("Libraries"),
			onAdd: u && _ !== "add" ? () => void re() : void 0,
			addLabel: s("Add Library"),
			action: _ === "add" ? /* @__PURE__ */ k("span", {
				role: "status",
				"aria-label": s("Working…"),
				className: "grid size-6 place-items-center text-faint",
				children: /* @__PURE__ */ k(ie, { size: 14 })
			}) : void 0,
			children: f.isError ? /* @__PURE__ */ k(ee, {
				compact: !0,
				onRetry: () => void f.refetch(),
				retrying: f.isRefetching
			}) : f.data ? f.data.imports.length === 0 ? /* @__PURE__ */ k(Ce, { children: s("No libraries") }) : f.data.imports.map((e) => /* @__PURE__ */ A("div", {
				className: "cms-reveal-row group flex min-h-10 items-center gap-2 border-b border-border last:border-b-0",
				children: [
					/* @__PURE__ */ k("span", {
						className: "min-w-0 flex-1 truncate font-mono text-xs text-text",
						children: e.import
					}),
					/* @__PURE__ */ k("span", {
						className: "shrink-0 font-mono text-2xs text-faint",
						children: e.version
					}),
					_ === e.import ? /* @__PURE__ */ k("span", {
						role: "status",
						"aria-label": s("Working…"),
						className: "grid size-6 shrink-0 place-items-center text-faint",
						children: /* @__PURE__ */ k(ie, { size: 14 })
					}) : we(s("Library Actions"), u ? [
						{
							label: s("Update"),
							icon: "refresh",
							disabled: !!_,
							onSelect: () => void te(e.import, () => o("design-vendor/update", { import: e.import }), s("{name} updated", { name: e.import }))
						},
						{
							separator: !0,
							label: ""
						},
						{
							label: s("Delete"),
							icon: "trash",
							danger: !0,
							disabled: !!_,
							onSelect: () => void S(e.import)
						}
					] : [])
				]
			}, e.import)) : /* @__PURE__ */ k(B, {})
		}),
		!u && /* @__PURE__ */ k("p", {
			className: "m-0 text-2xs text-warning",
			children: s("Editing code needs the “Edit custom CSS and JavaScript” permission.")
		})
	] });
}
// admin/src/DesignTokens.tsx
var ke = [
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
function Ae() {
	return [{
		group: s("Tokens"),
		items: [
			{
				value: "color",
				label: s("Colors"),
				icon: "palette"
			},
			{
				value: "type",
				label: s("Typography"),
				icon: "typography"
			},
			{
				value: "space",
				label: s("Spacing"),
				icon: "spacing"
			},
			{
				value: "sizes",
				label: s("Sizes"),
				icon: "ruler"
			},
			{
				value: "shape",
				label: s("Shape"),
				icon: "radius"
			},
			{
				value: "motion",
				label: s("Motion"),
				icon: "speed"
			}
		]
	}, {
		group: s("Styles"),
		items: [
			{
				value: "elements",
				label: s("Elements"),
				icon: "paragraph"
			},
			{
				value: "prose",
				label: s("Prose"),
				icon: "article"
			},
			{
				value: "buttons",
				label: s("Buttons"),
				icon: "button"
			},
			{
				value: "fields",
				label: s("Form Fields"),
				icon: "form-input"
			},
			{
				value: "code",
				label: s("Code"),
				icon: "code"
			}
		]
	}];
}
var je = "cms-reveal shrink-0";
function V(e) {
	return {
		color: s("Add Color"),
		font: s("Add Font Family"),
		text: s("Add Text Size"),
		weight: s("Add Weight"),
		leading: s("Add Line Height"),
		tracking: s("Add Letter Spacing"),
		space: s("Add Spacing"),
		container: s("Add Container"),
		breakpoint: s("Add Breakpoint"),
		radius: s("Add Radius"),
		shadow: s("Add Shadow"),
		duration: s("Add Duration"),
		ease: s("Add Easing")
	}[e] ?? s("Add Token");
}
function Me(e) {
	return {
		color: s("New Color"),
		font: s("New Font Family"),
		text: s("New Text Size"),
		weight: s("New Weight"),
		leading: s("New Line Height"),
		tracking: s("New Letter Spacing"),
		space: s("New Spacing"),
		container: s("New Container"),
		breakpoint: s("New Breakpoint"),
		radius: s("New Radius"),
		shadow: s("New Shadow"),
		duration: s("New Duration"),
		ease: s("New Easing")
	}[e] ?? s("New Token");
}
var Ne = {
	desktop: "100%",
	tablet: `${se.tablet}px`,
	phone: `${se.phone}px`
};
function Pe({ viewport: e, desktop: t, children: n }) {
	let r = p(null), [i, a] = m({
		width: 0,
		height: 0
	});
	d(() => {
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
	let o = e === "desktop" ? Math.max(i.width, t) : parseFloat(Ne[e]), s = i.width ? Math.min(1, i.width / o) : 1;
	return /* @__PURE__ */ k("div", {
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
var Fe = (e, t) => JSON.stringify(e ?? null) === JSON.stringify(t ?? null);
function Ie(e) {
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
		js: e.js ?? "",
		files: {}
	};
}
function Le(e, t, n) {
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
function Re(e, t) {
	let n = new Map(e.tokens.map((e) => [e.path, e])), r = new Set(t.tokens.map((e) => e.from).filter(Boolean)), i = {
		tokens: {},
		dark: {},
		rename: {},
		remove: e.tokens.filter((e) => !r.has(e.path)).map((e) => e.path)
	};
	for (let e of t.tokens) {
		let t = e.from ? n.get(e.from) : void 0;
		t && t.path !== e.path && (i.rename[t.path] = e.path), t && Fe(t.value, e.value) || (i.tokens[e.path] = e.value), t && Fe(t.dark || null, e.dark || null) || (i.dark[e.path] = e.dark || null);
	}
	for (let n of [
		"styles",
		"prose",
		"buttons",
		"fields",
		"transition"
	]) Fe(e[n], t[n]) || (i[n] = t[n]);
	return i;
}
function ze() {
	let i = c("design/get", {}, {
		refetchOnWindowFocus: !1,
		retry: !1
	}), u = f(() => i.data ? Ie(i.data) : null, [i.data]), [y, S] = m(null), [T, se] = l(ke), [j, de] = m(le() === "dark" ? "dark" : "light"), [P, pe] = m(!1), [F, me] = m(() => window.matchMedia("(max-width: 767px)").matches);
	d(() => {
		let e = window.matchMedia("(max-width: 767px)"), t = () => me(e.matches);
		return e.addEventListener("change", t), () => e.removeEventListener("change", t);
	}, []);
	let I = P && F, [L, he] = m("desktop"), [R, ge] = m(!1), [_e, z] = m(null), B = ce(), [Ce, we] = m(null), [Te, Ee] = m(null), [De, je] = m(null), [ze, Ge] = m(null), U = p(null), W = y ?? u, G = !!y && !!u && !Fe(y, u), K = (e) => u && S((t) => e(t ?? u)), q = f(() => G && u && y ? {
		...Re(u, y),
		css: y.css
	} : null, [
		G,
		u,
		y
	]);
	d(() => {
		if (!q) return we(null);
		let e = !0, t = setTimeout(() => {
			o("design/preview", q).then((t) => e && we(t.css), () => {});
		}, 150);
		return () => {
			e = !1, clearTimeout(t);
		};
	}, [q]);
	let Ke = f(() => (W?.tokens ?? []).map((e) => `${ue(e.group, e.name)}:${M(e.group, j === "dark" && e.dark ? e.dark : e.value)}`).join(";"), [W, j]), qe = {
		compiled: Ce,
		vars: G ? [Ke, ve(i.data?.fieldStyles ?? {}, W?.fields ?? {})].filter(Boolean).join(";") : "",
		mode: j
	}, Ye = () => xe(U.current?.contentDocument, qe), $e = T === "fields" || T === "buttons" || T === "sizes" || T === "prose" ? `/__specimen/${T}` : "/", et = T === "fields" ? be(ze) : T === "buttons" ? Te : T === "prose" && De?.replace(/:.*$/, "") || null;
	d(() => Se(U.current?.contentDocument, et, !0), [et]), d(Ye), d(() => {
		let e = document.createElement("style");
		return e.textContent = (i.data?.fonts ?? []).map((e) => `@font-face{font-family:"${e.family}";src:url("${/^(https:\/\/|\/)/.test(e.src) ? e.src : `/_cms/fonts/${e.src.split("/").pop()}`}") format("woff2");font-weight:${e.weight ?? "400"};font-style:${e.style ?? "normal"};font-display:swap}`).join("\n"), document.head.appendChild(e), () => e.remove();
	}, [i.data?.fonts]);
	let tt = async () => {
		if (G && !R && u && y) {
			ge(!0), z(null);
			try {
				let e = Re(u, y);
				(Object.keys(e.tokens).length + Object.keys(e.dark).length + Object.keys(e.rename).length + e.remove.length > 0 || [
					"styles",
					"prose",
					"buttons",
					"fields",
					"transition"
				].some((t) => t in e)) && await o("design/update", e), (y.css !== u.css || y.js !== u.js) && await o("design-code/set-custom", {
					css: y.css,
					...r("site.code") ? { js: y.js } : {}
				});
				for (let [e, t] of Object.entries(y.files)) await o("design-code/save", {
					path: e,
					contents: t
				});
				await a.invalidateQueries({ predicate: (e) => typeof e.queryKey[0] == "string" && e.queryKey[0].startsWith("design") }), S(null), U.current?.contentWindow?.location.reload();
			} catch (e) {
				z(e instanceof Error ? e.message : String(e));
			} finally {
				ge(!1);
			}
		}
	};
	if (i.isLoading) return /* @__PURE__ */ k("div", {
		className: "grid h-full place-items-center text-faint",
		children: /* @__PURE__ */ k(ie, {})
	});
	if (!i.data || !W) return /* @__PURE__ */ A("div", {
		className: "flex h-full flex-col",
		children: [/* @__PURE__ */ k(ae, { crumbs: [{
			label: s("Design System"),
			icon: "palette"
		}] }), /* @__PURE__ */ k(ee, {
			title: s("Couldn’t load the design system"),
			onRetry: () => void i.refetch(),
			retrying: i.isRefetching
		})]
	});
	let J = W.tokens, Y = (e) => J.filter((t) => t.group === e), nt = (e, t) => K((n) => ({
		...n,
		tokens: n.tokens.map((n) => n.path === e.path ? {
			...n,
			...t
		} : n)
	})), rt = (e) => K((t) => ({
		...t,
		tokens: t.tokens.filter((t) => t.path !== e.path)
	})), it = async (e, t, n = "") => {
		let r = await E({
			title: e,
			description: n ? s("Blocks that use token:{path} keep the old name.", { path: `${t}.${n}` }) : void 0,
			fields: [{
				handle: "name",
				type: "text",
				label: s("Name"),
				mono: !0,
				autofocus: !0,
				placeholder: t === "color" ? "brand" : "md"
			}],
			values: { name: n },
			confirm: n ? s("Rename") : V(t)
		}), i = String(r?.name ?? "").trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/^-+/, "");
		return !i || i === n ? null : J.some((e) => e.path === `${t}.${i}`) ? (D.error(s("“{name}” already exists", { name: i })), null) : i;
	}, X = async (e, t) => {
		let n = await it(Me(e), e);
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
			let t = await it(s("Rename Token"), e.group, e.name);
			t && K((n) => Le(n, e.path, `${e.group}.${t}`));
		},
		remove: rt
	}, at = (e, t) => K((n) => {
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
	}), Q = (e, t, n = "value") => /* @__PURE__ */ k(g, {
		bare: !0,
		className: w("flex min-w-0 flex-1", !["site-size", "blocks-color"].includes(String(t.component)) && "pr-8"),
		fields: [{
			handle: `${e.path}:${n}`,
			type: "text",
			label: e.name,
			size: "sm",
			mono: !0,
			...t
		}],
		values: { [`${e.path}:${n}`]: e[n] },
		onChange: (t, r) => nt(e, { [n]: n === "dark" ? r || null : r ?? e[n] })
	}), $ = (e, t = {}) => ({
		component: "blocks-value",
		unit: e,
		...t
	}), ot = Object.fromEntries(J.map((e) => [ue(e.group, e.name), M(e.group, j === "dark" && e.dark ? e.dark : e.value)])), st = M("ease", Y("ease")[0]?.value ?? "cubic-bezier(0.2, 0.8, 0.2, 1)"), ct = [...new Set((i.data.fonts ?? []).map((e) => e.family))], lt = () => {
		i.refetch(), U.current?.contentWindow?.location.reload();
	}, ut = ct.map((e) => ({
		family: e,
		styles: We((i.data.fonts ?? []).filter((t) => t.family === e)),
		used: Y("font").some((n) => t(n.value)[0] === e)
	})), dt = async (e) => {
		try {
			if (e === "google") {
				let e = await E({
					title: s("Add a Google Font"),
					description: s("Its files are downloaded to your site."),
					fields: [{
						handle: "family",
						type: "text",
						label: s("Name"),
						placeholder: "Inter Tight",
						autofocus: !0
					}],
					confirm: s("Add Font")
				}), t = String(e?.family ?? "").trim();
				return t ? (await o("design/fonts-import", { family: t }), D.success(s("{family} added", { family: t })), lt(), t) : null;
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
				title: s("Upload Font"),
				fields: [{
					handle: "family",
					type: "text",
					label: s("Family Name"),
					autofocus: !0
				}],
				values: { family: r.replace(/[-_](regular|bold|variable|italic|\d+).*$/i, "").replace(/[-_]/g, " ") },
				confirm: s("Upload")
			}), a = String(i?.family ?? "").trim();
			return a ? (await o("design/fonts-upload", {
				family: a,
				name: r,
				data: n,
				weight: /variable/i.test(r) ? "100 900" : "400",
				style: /italic/i.test(r) ? "italic" : "normal"
			}), D.success(s("{family} uploaded", { family: a })), lt(), a) : null;
		} catch (e) {
			return D.error(e), null;
		}
	}, ft = async (e) => {
		if (await oe({
			title: s("Remove {family}?", { family: e }),
			description: s("Its files are deleted from your site."),
			confirm: s("Remove"),
			danger: !0
		})) try {
			await o("design/update", { fonts: (i.data.fonts ?? []).filter((t) => t.family !== e) }), lt();
		} catch (e) {
			D.error(e);
		}
	};
	return /* @__PURE__ */ A("div", {
		className: "flex h-full flex-col",
		children: [
			/* @__PURE__ */ k(ae, {
				crumbs: [{
					label: s("Design System"),
					icon: "palette"
				}, { label: Ae().flatMap((e) => e.items).find((e) => e.value === T)?.label ?? "" }],
				actions: /* @__PURE__ */ A(O, { children: [/* @__PURE__ */ k(h, {
					variant: "ghost",
					icon: "eye",
					"aria-pressed": I,
					onClick: () => pe(!I),
					className: "md:hidden",
					children: s("Preview")
				}), /* @__PURE__ */ k(C, {
					content: s("Open Site"),
					children: /* @__PURE__ */ k(v, {
						icon: "external",
						label: s("Open Site"),
						title: void 0,
						onClick: () => window.open("/", "_blank", "noopener"),
						className: "max-md:hidden"
					})
				})] })
			}),
			/* @__PURE__ */ k(ne, {
				title: s("Design System"),
				backTo: "/",
				backLabel: s("Dashboard"),
				nested: !0,
				children: /* @__PURE__ */ k("nav", {
					"aria-label": s("Design System"),
					className: B.nested ? "space-y-px" : "px-2 pb-4",
					children: Ae().map((e, t) => /* @__PURE__ */ A("div", {
						className: w("space-y-px", t > 0 && (B.nested ? "mt-1" : "mt-4")),
						children: [!B.nested && /* @__PURE__ */ k("div", {
							className: "cms-label flex h-7 items-center px-2",
							children: e.group
						}), e.items.map((e) => /* @__PURE__ */ k(re, {
							label: e.label,
							icon: B.nested ? void 0 : e.icon,
							active: T === e.value,
							onClick: () => se(e.value)
						}, e.value))]
					}, e.group))
				})
			}),
			/* @__PURE__ */ k(te, {
				dirty: G,
				saving: R,
				error: _e,
				onSave: () => void tt(),
				onDiscard: () => {
					S(null), z(null);
				}
			}),
			/* @__PURE__ */ A("div", {
				className: "grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(340px,420px)_minmax(0,1fr)] xl:grid-cols-[minmax(380px,460px)_minmax(0,1fr)]",
				children: [/* @__PURE__ */ A("div", {
					className: w("overflow-y-auto border-border px-4 pb-16 pt-2 md:border-r", I && "max-md:hidden"),
					children: [
						T === "color" && /* @__PURE__ */ A(N, { children: [/* @__PURE__ */ A("div", {
							className: "flex min-h-9 items-center gap-2 border-b border-border text-2xs text-faint max-sm:flex-wrap max-sm:py-1",
							children: [
								/* @__PURE__ */ k("span", {
									className: "min-w-0 flex-1 max-sm:order-1 max-sm:basis-[calc(100%-2.5rem)]",
									children: s("Name")
								}),
								/* @__PURE__ */ A("span", {
									className: w(Be, "flex items-center gap-1"),
									children: [/* @__PURE__ */ k(_, {
										name: "sun",
										size: 11
									}), s("Light")]
								}),
								/* @__PURE__ */ A("span", {
									className: w(Be, "flex items-center gap-1"),
									children: [/* @__PURE__ */ k(_, {
										name: "moon",
										size: 11
									}), s("Dark")]
								}),
								/* @__PURE__ */ k(C, {
									content: V("color"),
									children: /* @__PURE__ */ k(v, {
										icon: "plus",
										label: V("color"),
										title: void 0,
										size: "xs",
										className: "shrink-0 max-sm:order-2",
										onClick: () => X("color", b)
									})
								})
							]
						}), Y("color").map((e) => /* @__PURE__ */ A(H, {
							token: e,
							...Z,
							wide: !0,
							children: [/* @__PURE__ */ k("div", {
								className: Be,
								children: Q(e, {
									type: "color",
									component: "blocks-color"
								})
							}), /* @__PURE__ */ k("div", {
								className: Be,
								children: Q(e, {
									type: "color",
									component: "blocks-color",
									placeholder: s("Same")
								}, "dark")
							})]
						}, e.from ?? e.path))] }),
						T === "type" && /* @__PURE__ */ A(O, { children: [
							/* @__PURE__ */ k(N, {
								title: s("Fonts"),
								onAdd: () => X("font", [
									...ct[0] ? [ct[0]] : [],
									"ui-sans-serif",
									"system-ui",
									"sans-serif"
								]),
								addLabel: V("font"),
								children: Y("font").map((r) => /* @__PURE__ */ k(H, {
									token: r,
									...Z,
									sample: /* @__PURE__ */ k("span", {
										className: "block max-w-7 overflow-hidden whitespace-nowrap text-center text-lg leading-none text-ink",
										style: { fontFamily: M("font", r.value) },
										children: "Aa"
									}),
									extra: [
										{
											separator: !0,
											label: ""
										},
										{
											heading: !0,
											label: s("Fallback")
										},
										...[
											"sans",
											"serif",
											"mono"
										].map((i) => ({
											label: {
												sans: s("Sans"),
												serif: s("Serif"),
												mono: s("Mono")
											}[i],
											checked: e(t(r.value)) === i,
											onSelect: () => nt(r, { value: n(r.value, i) })
										}))
									],
									children: Q(r, {
										component: "site-font-stack",
										fonts: ut,
										onAdd: dt,
										onRemove: ft
									})
								}, r.from ?? r.path))
							}),
							/* @__PURE__ */ k(N, {
								title: s("Type Scale"),
								onAdd: () => X("text", {
									min: "1rem",
									max: "1.25rem"
								}),
								addLabel: V("text"),
								children: Y("text").map((e) => /* @__PURE__ */ k(H, {
									token: e,
									...Z,
									below: /* @__PURE__ */ k("p", {
										className: "m-0 truncate pb-2.5 leading-[1.1] tracking-[-0.01em] text-ink",
										style: {
											fontSize: M("text", e.value),
											fontFamily: M("font", Y("font").find((e) => e.name === "display")?.value ?? Y("font")[0]?.value)
										},
										children: s("Ship It")
									}),
									children: Q(e, { component: "site-size" })
								}, e.from ?? e.path))
							}),
							/* @__PURE__ */ k(N, {
								title: s("Weights"),
								onAdd: () => X("weight", "600"),
								addLabel: V("weight"),
								children: Y("weight").map((e) => /* @__PURE__ */ k(H, {
									token: e,
									...Z,
									sample: /* @__PURE__ */ k("span", {
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
							/* @__PURE__ */ k(N, {
								title: s("Line Heights"),
								onAdd: () => X("leading", "1.5"),
								addLabel: V("leading"),
								children: Y("leading").map((e) => /* @__PURE__ */ k(H, {
									token: e,
									...Z,
									sample: /* @__PURE__ */ k("span", {
										className: "flex w-4 flex-col",
										style: { gap: `${Math.max(1, (Number(e.value) - .8) * 6)}px` },
										children: [
											0,
											1,
											2
										].map((e) => /* @__PURE__ */ k("span", { className: w("h-0.5 rounded-full bg-muted", e === 2 && "w-2/3") }, e))
									}),
									children: Q(e, $("", {
										step: .05,
										min: 0
									}))
								}, e.from ?? e.path))
							}),
							/* @__PURE__ */ k(N, {
								title: s("Letter Spacing"),
								onAdd: () => X("tracking", "0em"),
								addLabel: V("tracking"),
								children: Y("tracking").map((e) => /* @__PURE__ */ k(H, {
									token: e,
									...Z,
									sample: /* @__PURE__ */ k("span", {
										className: "text-xs font-medium text-ink",
										style: { letterSpacing: M("tracking", e.value) },
										children: "Aa"
									}),
									children: Q(e, $("em", {
										units: ["em", "px"],
										step: .005
									}))
								}, e.from ?? e.path))
							})
						] }),
						T === "space" && /* @__PURE__ */ A(O, { children: [
							/* @__PURE__ */ k(N, {
								onAdd: () => X("space", "1rem"),
								addLabel: V("space"),
								children: Y("space").map((e) => /* @__PURE__ */ k(H, {
									token: e,
									...Z,
									after: /* @__PURE__ */ k(Ue, {
										value: e.value,
										of: Y("space")
									}),
									children: Q(e, { component: "site-size" })
								}, e.from ?? e.path))
							}),
							/* @__PURE__ */ k(N, {
								title: s("Containers"),
								onAdd: () => X("container", "72rem"),
								addLabel: V("container"),
								children: Y("container").map((e) => /* @__PURE__ */ k(H, {
									token: e,
									...Z,
									after: /* @__PURE__ */ k(Ue, {
										value: e.value,
										of: Y("container")
									}),
									children: Q(e, { component: "site-size" })
								}, e.from ?? e.path))
							}),
							/* @__PURE__ */ k(N, {
								title: s("Breakpoints"),
								onAdd: () => X("breakpoint", "768px"),
								addLabel: V("breakpoint"),
								children: Y("breakpoint").map((e) => /* @__PURE__ */ k(H, {
									token: e,
									...Z,
									after: /* @__PURE__ */ k(Ue, {
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
						T === "shape" && /* @__PURE__ */ A(O, { children: [/* @__PURE__ */ k(N, {
							title: s("Radius"),
							onAdd: () => X("radius", "0.5rem"),
							addLabel: V("radius"),
							children: Y("radius").map((e) => /* @__PURE__ */ k(H, {
								token: e,
								...Z,
								sample: /* @__PURE__ */ k("span", {
									className: "size-5 translate-x-0.5 translate-y-0.5 border-l-[1.5px] border-t-[1.5px] border-muted",
									style: { borderTopLeftRadius: `min(${M("radius", e.value)}, 20px)` }
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
						}), /* @__PURE__ */ k(N, {
							title: s("Shadows"),
							onAdd: () => X("shadow", "0 4px 16px -4px rgb(0 0 0 / 0.12)"),
							addLabel: V("shadow"),
							children: Y("shadow").map((e) => /* @__PURE__ */ k(H, {
								token: e,
								...Z,
								sample: /* @__PURE__ */ k("span", {
									className: "size-5 shrink-0 rounded-xs border border-border bg-bg",
									style: { boxShadow: M("shadow", e.value) }
								}),
								children: Q(e, { component: "site-shadow" })
							}, e.from ?? e.path))
						})] }),
						T === "motion" && /* @__PURE__ */ A(O, { children: [
							/* @__PURE__ */ A(N, {
								title: s("Page Transition"),
								children: [
									/* @__PURE__ */ k(He, {
										label: s("Effect"),
										children: /* @__PURE__ */ k(g, {
											bare: !0,
											className: "flex min-w-0 flex-1",
											fields: [{
												handle: "type",
												type: "select",
												label: s("Effect"),
												size: "sm",
												required: !0,
												options: {
													none: s("None"),
													fade: s("Fade"),
													slide: s("Slide"),
													scale: s("Scale")
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
									}),
									W.transition.type !== "none" && /* @__PURE__ */ k(He, {
										label: s("Duration"),
										children: /* @__PURE__ */ k(g, {
											bare: !0,
											className: "flex min-w-0 flex-1",
											fields: [{
												handle: "duration",
												type: "text",
												component: "blocks-value",
												label: s("Duration"),
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
													duration: Ve(t, e.transition.duration)
												}
											}))
										})
									}),
									/* @__PURE__ */ k(He, {
										label: s("Page Loads"),
										children: /* @__PURE__ */ k(g, {
											bare: !0,
											className: "flex min-w-0 flex-1",
											fields: [{
												handle: "navigation",
												type: "select",
												label: s("Page Loads"),
												size: "sm",
												required: !0,
												options: {
													document: s("Full Page"),
													client: s("Instant")
												}
											}],
											values: { navigation: W.transition.navigation ?? "document" },
											onChange: (e, t) => K((e) => ({
												...e,
												transition: {
													...e.transition,
													navigation: t === "client" ? "client" : "document"
												}
											}))
										})
									})
								]
							}),
							/* @__PURE__ */ k(N, {
								title: s("Durations"),
								onAdd: () => X("duration", "300ms"),
								addLabel: V("duration"),
								children: Y("duration").map((e) => /* @__PURE__ */ k(H, {
									token: e,
									...Z,
									sample: /* @__PURE__ */ k("span", {
										className: "relative h-3 w-6",
										children: /* @__PURE__ */ k("span", {
											className: "absolute left-0 top-1/2 size-2 -translate-y-1/2 rounded-full bg-muted transition-transform group-hover:translate-x-4",
											style: {
												transitionDuration: M("duration", e.value),
												transitionTimingFunction: st
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
							/* @__PURE__ */ k(N, {
								title: s("Easing"),
								onAdd: () => X("ease", "cubic-bezier(0.2, 0.8, 0.2, 1)"),
								addLabel: V("ease"),
								children: Y("ease").map((e) => /* @__PURE__ */ k(H, {
									token: e,
									...Z,
									children: Q(e, { component: "ease" })
								}, e.from ?? e.path))
							})
						] }),
						T === "elements" && /* @__PURE__ */ k(O, { children: /* @__PURE__ */ k(Je, {
							options: i.data.elements ?? [],
							tokens: J,
							vars: ot,
							value: W.styles,
							onChange: (e) => K((t) => ({
								...t,
								styles: e
							}))
						}) }),
						T === "prose" && /* @__PURE__ */ k(Xe, {
							value: W.prose,
							options: i.data.proseElements ?? [],
							tokens: J,
							vars: ot,
							open: De,
							onOpen: je,
							onChange: (e) => K((t) => ({
								...t,
								prose: e
							}))
						}),
						T === "sizes" && /* @__PURE__ */ k(Ze, {
							defaults: i.data.controlSizes ?? {},
							tokens: J,
							onSet: at
						}),
						T === "buttons" && /* @__PURE__ */ k(Qe, {
							value: W.buttons,
							tokens: J,
							open: Te,
							onOpen: Ee,
							onChange: (e) => K((t) => ({
								...t,
								buttons: e
							}))
						}),
						T === "fields" && /* @__PURE__ */ k(ye, {
							schema: i.data.fieldStyles ?? {},
							value: W.fields,
							tokens: J,
							dark: j === "dark",
							open: ze,
							onOpen: Ge,
							onChange: (e) => K((t) => ({
								...t,
								fields: e
							}))
						}),
						T === "code" && /* @__PURE__ */ k(Oe, {
							css: W.css,
							js: W.js,
							onCustom: (e) => K((t) => ({
								...t,
								...e
							})),
							edits: W.files,
							onEdit: (e, t) => K((n) => ({
								...n,
								files: t === null ? Object.fromEntries(Object.entries(n.files).filter(([t]) => t !== e)) : {
									...n.files,
									[e]: t
								}
							}))
						})
					]
				}, T), /* @__PURE__ */ A("div", {
					className: w("flex min-w-0 flex-col bg-sunken", !I && "max-md:hidden"),
					children: [/* @__PURE__ */ A("div", {
						className: "flex h-10 shrink-0 items-center gap-2 border-b border-border bg-bg px-3",
						children: [
							/* @__PURE__ */ k("span", {
								className: "max-md:hidden",
								children: /* @__PURE__ */ k(x, {
									size: "xs",
									value: L,
									onChange: he,
									options: [
										{
											value: "desktop",
											icon: "desktop",
											title: s("Desktop")
										},
										{
											value: "tablet",
											icon: "tablet",
											title: s("Tablet")
										},
										{
											value: "phone",
											icon: "phone",
											title: s("Phone")
										}
									]
								})
							}),
							L !== "desktop" && /* @__PURE__ */ k("span", {
								className: "font-mono text-2xs text-faint max-md:hidden",
								children: Ne[L]
							}),
							/* @__PURE__ */ k("span", { className: "flex-1" }),
							/* @__PURE__ */ k(x, {
								size: "xs",
								value: j,
								onChange: de,
								options: [{
									value: "light",
									icon: "sun",
									title: s("Light")
								}, {
									value: "dark",
									icon: "moon",
									title: s("Dark")
								}]
							})
						]
					}), /* @__PURE__ */ k(Pe, {
						viewport: I ? "phone" : L,
						desktop: $e === "/" ? fe(i.data.breakpoints?.lg) || 1024 : 0,
						children: (e) => /* @__PURE__ */ k("iframe", {
							ref: U,
							src: $e,
							title: s($e === "/" ? "Site Preview" : "Specimen"),
							className: w("border-0 bg-bg", L !== "desktop" && !I && "border-x border-border"),
							style: e,
							onLoad: () => {
								Ye(), Se(U.current?.contentDocument, et, !1);
							}
						}, $e)
					})]
				})]
			})
		]
	});
}
var Be = "w-[108px] shrink-0 max-sm:order-3 max-sm:w-auto max-sm:min-w-0 max-sm:flex-1 max-sm:basis-[40%]";
function Ve(e, t) {
	let n = String(e ?? "").trim().match(/^(\d*\.?\d+)\s*(ms|s)?$/);
	if (!n) return t;
	let r = n[2] === "s" ? Number(n[1]) : Number(n[1]) / 1e3;
	return Math.min(2, Math.max(.05, Math.round(r * 1e3) / 1e3));
}
function H({ token: e, sample: t, after: n, below: r, wide: i, rename: a, remove: o, extra: c, children: l }) {
	let u = `token:${e.path}`, d = () => void T(u, { copied: s("Copied {reference}", { reference: u }) });
	return /* @__PURE__ */ A("div", {
		className: "cms-reveal-row group border-b border-border last:border-b-0",
		children: [/* @__PURE__ */ A("div", {
			className: w("flex min-h-9 items-center gap-2 py-1", i && "max-sm:flex-wrap"),
			children: [
				t !== void 0 && /* @__PURE__ */ k("span", {
					className: "grid w-7 shrink-0 place-items-center",
					children: t
				}),
				/* @__PURE__ */ k(C, {
					content: /* @__PURE__ */ k("span", {
						className: "font-mono",
						children: u
					}),
					children: /* @__PURE__ */ k(h, {
						variant: "ghost",
						size: "xs",
						onClick: d,
						"aria-label": s("Copy {reference}", { reference: u }),
						className: w("!justify-start !bg-transparent !px-0 text-left !font-normal hover:text-ink", i ? "min-w-0 flex-1 shrink max-sm:order-1 max-sm:basis-[calc(100%-2.5rem)]" : t === void 0 ? "w-[120px] max-sm:w-20" : "w-[84px] max-sm:w-16"),
						children: /* @__PURE__ */ k("span", {
							className: "truncate",
							children: e.name
						})
					})
				}),
				i ? l : /* @__PURE__ */ k("div", {
					className: "flex w-60 min-w-0 shrink max-lg:w-52 max-sm:w-auto max-sm:flex-1",
					children: l
				}),
				!i && /* @__PURE__ */ k("span", {
					className: "flex min-w-0 flex-1 items-center max-sm:hidden",
					children: n
				}),
				/* @__PURE__ */ k(y, {
					trigger: /* @__PURE__ */ k(v, {
						icon: "more",
						label: s("Token Actions"),
						size: "xs",
						className: w(je, i && "max-sm:order-2")
					}),
					items: [
						{
							label: s("Copy Reference"),
							icon: "copy",
							onSelect: d
						},
						{
							label: s("Rename…"),
							icon: "edit",
							onSelect: () => a(e)
						},
						...c ?? [],
						{
							separator: !0,
							label: ""
						},
						{
							label: s("Delete"),
							icon: "trash",
							danger: !0,
							onSelect: () => o(e)
						}
					]
				})
			]
		}), r]
	});
}
function He({ label: e, children: t }) {
	return /* @__PURE__ */ A("div", {
		className: "flex min-h-9 items-center gap-2 border-b border-border py-1 last:border-b-0",
		children: [
			/* @__PURE__ */ k("span", {
				className: "w-[120px] shrink-0 truncate text-xs text-text",
				children: e
			}),
			/* @__PURE__ */ k("div", {
				className: "flex w-60 min-w-0 shrink pr-8 max-lg:w-52",
				children: t
			}),
			/* @__PURE__ */ k("span", { className: "min-w-0 flex-1 max-sm:hidden" }),
			/* @__PURE__ */ k("span", { className: "size-6 shrink-0" })
		]
	});
}
function Ue({ value: e, of: t }) {
	let n = Math.max(...t.map((e) => fe(e.value)), 1);
	return fe(e) <= 0 ? null : /* @__PURE__ */ k("span", {
		className: "h-1.5 min-w-px rounded-full bg-border-strong",
		style: { width: `${fe(e) / n * 100}%` }
	});
}
function We(e) {
	let t = e.flatMap((e) => String(e.weight ?? "400").split(/\s+/).map(Number)).filter((e) => e > 0), n = Math.min(...t), r = Math.max(...t), i = t.length === 0 ? "400" : n === r ? String(n) : `${n}–${r}`;
	return e.some((e) => e.style === "italic") ? `${i} · ${s("Italic")}` : i;
}
function Ge(e) {
	return {
		html: s("Page"),
		body: s("Body"),
		h1: s("Heading 1"),
		h2: s("Heading 2"),
		h3: s("Heading 3"),
		h4: s("Heading 4"),
		h5: s("Heading 5"),
		h6: s("Heading 6"),
		p: s("Paragraph"),
		a: s("Link"),
		"a:hover": s("Link on Hover"),
		small: s("Small Text"),
		strong: s("Bold Text"),
		em: s("Italic Text"),
		mark: s("Highlight"),
		code: s("Code"),
		kbd: s("Keyboard Key"),
		pre: s("Code Block"),
		blockquote: s("Quote"),
		hr: s("Divider"),
		ul: s("Bulleted List"),
		ol: s("Numbered List"),
		li: s("List Item"),
		img: s("Image"),
		figcaption: s("Caption"),
		table: s("Table"),
		th: s("Table Header"),
		td: s("Table Cell"),
		"::selection": s("Selected Text"),
		":focus-visible": s("Focus Ring"),
		"h1 em": s("Italic in Heading 1"),
		"h2 em": s("Italic in Heading 2"),
		"h3 em": s("Italic in Heading 3"),
		"h1 strong": s("Bold in Heading 1"),
		"h2 strong": s("Bold in Heading 2")
	}[e] ?? e;
}
var U = {
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
}, W = /* @__PURE__ */ new Set([
	"fontWeight",
	"lineHeight",
	"opacity",
	"zIndex"
]);
function G(e) {
	return Object.fromEntries(Object.entries(e ?? {}).map(([e, t]) => [U[e] ?? e, t]));
}
function K(e) {
	return Object.fromEntries(Object.entries(G(e)).map(([e, t]) => [e, typeof t == "number" && !W.has(e) && t !== 0 ? `${t}px` : M("", t)]));
}
function q(e) {
	let t = (t) => e.filter((e) => e.group === t);
	return [
		{
			handle: "fontFamily",
			type: "select",
			size: "sm",
			label: s("Font"),
			placeholder: s("Inherit"),
			options: t("font").map((e) => ({
				value: `token:${e.path}`,
				label: e.name
			}))
		},
		{
			handle: "fontSize",
			type: "text",
			component: "blocks-value",
			label: s("Size"),
			group: "text",
			placeholder: s("Inherit"),
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
			label: s("Weight"),
			placeholder: s("Inherit"),
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
			label: s("Line Height"),
			group: "leading",
			unit: "",
			step: .05,
			placeholder: s("Inherit")
		},
		{
			handle: "letterSpacing",
			type: "text",
			component: "blocks-value",
			label: s("Letter Spacing"),
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
			label: s("Color"),
			placeholder: s("Inherit")
		}
	];
}
function Ke() {
	return [
		{
			handle: "backgroundColor",
			type: "color",
			component: "blocks-color",
			label: s("Fill"),
			placeholder: s("None")
		},
		{
			handle: "border",
			type: "group",
			component: "blocks-group",
			label: s("Border"),
			fields: [{
				handle: "borderWidth",
				type: "text",
				component: "blocks-value",
				label: s("Border Width"),
				placeholder: "0",
				min: 0,
				className: "!flex-none w-[64px]"
			}, {
				handle: "borderColor",
				type: "color",
				component: "blocks-color",
				label: s("Border Color"),
				placeholder: s("None")
			}]
		},
		{
			handle: "borderRadius",
			type: "text",
			component: "blocks-value",
			label: s("Radius"),
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
			label: s("Padding"),
			fields: [{
				handle: "paddingBlock",
				type: "text",
				component: "blocks-value",
				label: s("Vertical Padding"),
				group: "space",
				prefixIcon: "arrows-out-line-vertical",
				unit: "rem",
				placeholder: "0",
				min: 0
			}, {
				handle: "paddingInline",
				type: "text",
				component: "blocks-value",
				label: s("Horizontal Padding"),
				group: "space",
				prefixIcon: "spacing",
				unit: "rem",
				placeholder: "0",
				min: 0
			}]
		},
		{
			handle: "margin",
			type: "group",
			component: "blocks-group",
			label: s("Margin"),
			fields: [{
				handle: "marginTop",
				type: "text",
				component: "blocks-value",
				label: s("Top Margin"),
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
				label: s("Bottom Margin"),
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
function qe({ value: e, onChange: t, fields: n }) {
	return /* @__PURE__ */ k(g, {
		bare: !0,
		fields: [{
			handle: "style",
			type: "json",
			component: "blocks-more",
			label: s("Style"),
			controls: n
		}],
		values: { style: G(e) },
		onChange: (e, n) => t(n ?? {})
	});
}
function Je({ title: e, value: t, onChange: n, options: r, tokens: i, vars: a, open: o, onOpen: c }) {
	let [l, u] = m(null), d = c ? o ?? null : l, f = c ?? u, p = r.filter((e) => !(e in t)), g = [...q(i), ...Ke()];
	return /* @__PURE__ */ A(N, {
		title: e,
		action: /* @__PURE__ */ k(y, {
			trigger: e ? /* @__PURE__ */ k(v, {
				icon: "plus",
				label: s("Add Element"),
				size: "xs"
			}) : /* @__PURE__ */ k(h, {
				variant: "ghost",
				size: "xs",
				icon: "plus",
				className: "-ml-1.5 !px-1.5 !font-normal !text-muted hover:!text-ink",
				children: s("Add Element")
			}),
			items: p.map((e) => ({
				label: Ge(e),
				onSelect: () => {
					n({
						...t,
						[e]: {}
					}), f(e);
				}
			})),
			className: "max-h-72 overflow-auto"
		}),
		children: [Object.keys(t).length === 0 && /* @__PURE__ */ k("p", {
			className: "m-0 py-3 text-xs text-faint",
			children: s("No element styles")
		}), Object.entries(t).map(([e, r]) => /* @__PURE__ */ k(P, {
			open: d === e,
			onToggle: () => f(d === e ? null : e),
			label: Ge(e),
			aside: /* @__PURE__ */ k("span", {
				"aria-hidden": "true",
				className: "grid h-6 w-9 shrink-0 place-items-center rounded-xs",
				style: {
					...a,
					background: "var(--color-background)",
					color: "var(--color-foreground)"
				},
				children: /* @__PURE__ */ k("span", {
					className: "px-0.5",
					style: {
						...K(r),
						fontSize: 15,
						lineHeight: 1.2,
						margin: 0,
						paddingBlock: 0
					},
					children: "Aa"
				})
			}),
			menu: /* @__PURE__ */ k(y, {
				trigger: /* @__PURE__ */ k(v, {
					icon: "more",
					label: s("Element Actions"),
					size: "xs",
					className: je
				}),
				items: [{
					label: s("Delete"),
					icon: "trash",
					danger: !0,
					onSelect: () => n(Object.fromEntries(Object.entries(t).filter(([t]) => t !== e)))
				}]
			}),
			children: /* @__PURE__ */ k(qe, {
				value: r,
				fields: g,
				onChange: (r) => n({
					...t,
					[e]: r
				})
			})
		}, e))]
	});
}
var Ye = () => [
	[
		"blocks",
		s("Between Blocks"),
		"1.1em"
	],
	[
		"headings",
		s("Before Headings"),
		"1.8em"
	],
	[
		"afterHeadings",
		s("After Headings"),
		"0.6em"
	],
	[
		"items",
		s("Between List Items"),
		"0.35em"
	]
];
function Xe({ value: e, onChange: t, options: n, tokens: r, vars: i, open: a, onOpen: o }) {
	let { spacing: c = {}, ...l } = e, u = (e, n) => t({
		...Object.keys(e).length ? { spacing: e } : {},
		...n
	});
	return /* @__PURE__ */ A(O, { children: [/* @__PURE__ */ k(N, {
		title: s("Spacing"),
		children: Ye().map(([e, t, n]) => /* @__PURE__ */ k(He, {
			label: t,
			children: /* @__PURE__ */ k(g, {
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
	}), /* @__PURE__ */ k(Je, {
		title: s("Elements"),
		options: n,
		tokens: r,
		vars: i,
		open: a,
		onOpen: o,
		value: l,
		onChange: (e) => u(c, e)
	})] });
}
function Ze({ defaults: e, tokens: t, onSet: n }) {
	let r = [
		["sm", s("Small")],
		["md", s("Medium")],
		["lg", s("Large")]
	], i = [
		[
			"height",
			s("Height"),
			{
				unit: "rem",
				units: ["rem", "px"],
				step: .125,
				min: 0
			}
		],
		[
			"padding",
			s("Padding"),
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
			s("Text"),
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
	return /* @__PURE__ */ k(N, { children: /* @__PURE__ */ A("div", {
		className: "grid grid-cols-[52px_repeat(3,minmax(0,1fr))] items-center gap-x-2 gap-y-1.5 py-2 [&_input]:placeholder:text-muted",
		children: [
			/* @__PURE__ */ k("span", {}),
			i.map(([e, t]) => /* @__PURE__ */ k("span", {
				className: "text-2xs text-faint",
				children: t
			}, e)),
			r.map(([r, o]) => /* @__PURE__ */ A(u, { children: [/* @__PURE__ */ k("span", {
				className: "text-xs text-text",
				children: o
			}), i.map(([i, s, c]) => {
				let l = `control.${r}-${i}`, u = t.find((e) => e.path === l);
				return /* @__PURE__ */ k(g, {
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
	}) });
}
function Qe({ value: e, onChange: t, tokens: n, open: r, onOpen: i }) {
	let [a, o] = m("base"), c = async () => {
		let n = await E({
			title: s("New Button Variant"),
			fields: [{
				handle: "name",
				type: "text",
				label: s("Name"),
				placeholder: "outline",
				mono: !0,
				autofocus: !0
			}],
			confirm: s("Add Variant")
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
		...Ke().filter((e) => e.handle !== "padding" && e.handle !== "margin"),
		...q(n).filter((e) => [
			"fontWeight",
			"letterSpacing",
			"color"
		].includes(e.handle)).map((e) => e.handle === "color" ? {
			...e,
			label: s("Text")
		} : e),
		{
			handle: "boxShadow",
			type: "text",
			component: "blocks-shadows",
			label: s("Shadow"),
			group: "shadow"
		},
		{
			handle: "opacity",
			type: "text",
			component: "blocks-value",
			label: s("Opacity"),
			percent: !0,
			step: .05,
			min: 0,
			max: 1,
			placeholder: "100"
		}
	];
	return /* @__PURE__ */ A(N, {
		title: s("Button Variants"),
		onAdd: c,
		addLabel: s("Add Variant"),
		children: [Object.keys(e).length === 0 && /* @__PURE__ */ k("p", {
			className: "m-0 py-3 text-xs text-faint",
			children: s("No variants")
		}), Object.entries(e).map(([n, c]) => /* @__PURE__ */ A(P, {
			open: r === n,
			onToggle: () => i(r === n ? null : n),
			label: d(n),
			menu: /* @__PURE__ */ k(y, {
				trigger: /* @__PURE__ */ k(v, {
					icon: "more",
					label: s("Variant Actions"),
					size: "xs",
					className: je
				}),
				items: [{
					label: s("Delete"),
					icon: "trash",
					danger: !0,
					onSelect: () => t(Object.fromEntries(Object.entries(e).filter(([e]) => e !== n)))
				}]
			}),
			children: [
				/* @__PURE__ */ A("div", {
					className: "mb-2 flex items-center gap-1",
					children: [/* @__PURE__ */ k(g, {
						layout: "inline",
						labelWidth: 120,
						className: "min-w-0 flex-1",
						fields: [{
							handle: "surface",
							type: "color",
							component: "blocks-color",
							label: s("Shown On"),
							placeholder: s("Page Background")
						}],
						values: { surface: l(c).surface ?? null },
						onChange: (e, t) => u(n, t || void 0, l(c).states)
					}), /* @__PURE__ */ k("span", { className: "size-6 shrink-0" })]
				}),
				/* @__PURE__ */ k("div", {
					className: "mb-2",
					children: /* @__PURE__ */ k(x, {
						size: "xs",
						block: !0,
						"aria-label": s("State"),
						value: a,
						onChange: o,
						options: [
							{
								value: "base",
								label: s("Default")
							},
							{
								value: "hover",
								label: s("Hover")
							},
							{
								value: "active",
								label: s("Pressed")
							},
							{
								value: "focus-visible",
								label: s("Focus")
							}
						]
					})
				}),
				/* @__PURE__ */ k(qe, {
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
export { ze as default };
