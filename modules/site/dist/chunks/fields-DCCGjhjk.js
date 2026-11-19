import { t as e } from "@letterncms/sdk";
import { forwardRef as t, useState as n } from "react";
import { Button as r, Fields as i, Icon as a, IconButton as o, Popover as s, Segmented as c, Tooltip as l, cn as u, fieldControlId as d, revealSelected as f } from "@letterncms/ui";
import { PanelFields as p, formatShadows as m, parseShadows as h } from "@letterncms/blocks";
import { jsx as g, jsxs as _ } from "react/jsx-runtime";
// admin/src/fields.tsx
var v = {
	sans: [
		"ui-sans-serif",
		"system-ui",
		"sans-serif"
	],
	serif: [
		"ui-serif",
		"Georgia",
		"serif"
	],
	mono: [
		"ui-monospace",
		"SF Mono",
		"Menlo",
		"monospace"
	]
}, y = /* @__PURE__ */ new Set([
	...Object.values(v).flat(),
	"-apple-system",
	"BlinkMacSystemFont",
	"Segoe UI",
	"Roboto",
	"Helvetica Neue",
	"Helvetica",
	"Arial",
	"Times New Roman",
	"Times",
	"Courier New",
	"Consolas",
	"Monaco",
	"cursive",
	"fantasy"
]);
function b(e) {
	return e.includes("monospace") ? "mono" : e.includes("serif") ? "serif" : "sans";
}
function x(e) {
	return String(e ?? "").split(",").map((e) => e.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
}
function S(e) {
	return e.map((e) => /^[a-zA-Z][\w-]*$/.test(e) ? e : `"${e.replace(/"/g, "")}"`).join(", ");
}
function C(e) {
	return e[0] && !y.has(e[0]) && !e[0].endsWith(" Fallback") ? e[0] : "";
}
function w(e, t, n) {
	return S([...e ? [e, ...n ? [`${e} Fallback`] : []] : [], ...v[t]]);
}
function T({ field: t, value: i, onChange: c, disabled: l }) {
	let [u, p] = n(!1), m = x(i), h = C(m), v = b(m), y = t.fonts ?? [], S = (e, t) => c(w(e, v, t)), T = async (e) => {
		p(!1);
		let n = await t.onAdd?.(e);
		n && S(n.family, n.fallback);
	}, E = (e, t, n, i, o) => /* @__PURE__ */ _("div", {
		"data-selected": e === h || void 0,
		className: "cms-reveal-row flex items-center gap-1 rounded-sm pr-1 hover:bg-hover",
		children: [/* @__PURE__ */ _(r, {
			variant: "ghost",
			onClick: () => {
				S(e, i), p(!1);
			},
			className: "!h-9 min-w-0 flex-1 shrink !justify-start !gap-2 !bg-transparent !pl-2 !pr-0 text-left !font-normal",
			children: [/* @__PURE__ */ g("span", {
				className: "min-w-0 flex-1 truncate text-base leading-tight text-ink",
				style: e ? { fontFamily: `"${e}"` } : void 0,
				children: t
			}), n && /* @__PURE__ */ g("span", {
				className: "shrink-0 text-2xs tabular-nums text-faint",
				children: n
			})]
		}), /* @__PURE__ */ g("span", {
			className: "grid w-6 shrink-0 place-items-center",
			children: e === h ? /* @__PURE__ */ g(a, {
				name: "check",
				size: 14,
				className: "text-ink"
			}) : o
		})]
	}, e || "system"), D = (e, t, n) => /* @__PURE__ */ _(r, {
		variant: "ghost",
		size: "md",
		onClick: n,
		className: "w-full !justify-start !gap-2 !rounded-sm !px-2 text-left !text-xs !font-normal",
		children: [/* @__PURE__ */ g(a, {
			name: e,
			size: 14,
			className: "shrink-0 text-faint"
		}), t]
	});
	return /* @__PURE__ */ _(s, {
		open: u,
		onOpenChange: p,
		align: "end",
		className: "w-72 !p-1.5",
		trigger: /* @__PURE__ */ _(r, {
			variant: "ghost",
			id: d(t),
			disabled: l,
			className: "cms-input w-full min-w-0 shrink !justify-start !gap-2 !pl-2 !pr-1.5 text-left !font-normal",
			children: [/* @__PURE__ */ g("span", {
				className: "min-w-0 flex-1 truncate",
				style: h ? { fontFamily: `"${h}"` } : void 0,
				children: h || e("System Font")
			}), /* @__PURE__ */ g(a, {
				name: "chevrons-up-down",
				size: 14,
				className: "shrink-0 text-faint"
			})]
		}),
		children: [/* @__PURE__ */ _("div", {
			ref: f,
			className: "max-h-72 overflow-y-auto",
			children: [
				E("", e("System Font"), "", !1),
				h && !y.some((e) => e.family === h) && E(h, h, "", m.includes(`${h} Fallback`)),
				y.map((n) => E(n.family, n.family, n.styles, n.fallback, !n.used && t.onRemove ? /* @__PURE__ */ g(o, {
					icon: "trash",
					label: e("Remove {family}", { family: n.family }),
					size: "xs",
					className: "cms-reveal",
					onClick: () => t.onRemove(n.family)
				}) : void 0))
			]
		}), !!t.onAdd && /* @__PURE__ */ _("div", {
			className: "mt-1 border-t border-border pt-1",
			children: [D("search", e("Add a Google Font…"), () => void T("google")), D("upload", e("Upload a .woff2 File…"), () => void T("upload"))]
		})]
	});
}
var E = t(function({ label: e, children: t, className: n, ...i }, o) {
	return /* @__PURE__ */ _(r, {
		ref: o,
		variant: "ghost",
		"aria-label": e,
		...i,
		className: u("cms-input w-full min-w-0 flex-1 !shrink !justify-start !gap-1.5 !pl-2 !pr-1.5 text-left !font-normal data-[popup-open]:border-focus", n),
		children: [/* @__PURE__ */ g("span", {
			className: "min-w-0 flex-1 truncate",
			children: t
		}), /* @__PURE__ */ g(a, {
			name: "chevrons-up-down",
			size: 11,
			className: "shrink-0 text-faint"
		})]
	});
}), D = {
	box: {
		inset: !1,
		x: "0px",
		y: "4px",
		blur: "12px",
		spread: "-2px",
		color: "rgb(0 0 0 / 12%)"
	},
	text: {
		inset: !1,
		x: "0px",
		y: "1px",
		blur: "2px",
		spread: "0",
		color: "rgb(0 0 0 / 25%)"
	}
};
function O({ value: e, kind: t, large: n }) {
	let r = e && e !== "none" ? e : void 0;
	return t === "text" ? /* @__PURE__ */ g("span", {
		className: u("grid shrink-0 place-items-center font-semibold text-ink", n ? "text-5xl" : "size-5 text-base"),
		style: { textShadow: r },
		children: "A"
	}) : t === "drop" ? /* @__PURE__ */ g("span", {
		className: u("shrink-0 rounded-sm bg-float", n ? "size-16" : "size-5"),
		style: { filter: r ? r.split(/,(?![^(]*\))/).map((e) => `drop-shadow(${e.trim()})`).join(" ") : void 0 }
	}) : /* @__PURE__ */ g("span", {
		className: u("shrink-0 rounded-sm border border-border bg-float", n ? "size-16" : "size-5"),
		style: { boxShadow: r }
	});
}
var k = (t) => [
	t.inset ? e("Inside") : null,
	`Y ${t.y.replace(/px$/, "")}`,
	`${e("Blur")} ${t.blur.replace(/px$/, "")}`
].filter(Boolean).join(" · ");
function A({ field: t, value: n, onChange: i, disabled: a }) {
	let l = t.kind ?? "box", u = l !== "box", f = h(n) ?? [], v = (e) => i(m(e, u) ?? "none"), y = (e, t) => v(f.map((n, r) => r === e ? {
		...n,
		...t
	} : n));
	return /* @__PURE__ */ _(s, {
		align: "start",
		className: "flex max-h-[min(36rem,80vh)] w-72 flex-col !p-0",
		trigger: /* @__PURE__ */ g(E, {
			id: d(t),
			disabled: a,
			label: t.label,
			children: f.length === 0 ? /* @__PURE__ */ g("span", {
				className: "text-faint",
				children: e("Add Shadow")
			}) : /* @__PURE__ */ g("span", {
				className: "truncate",
				children: f.length === 1 ? k(f[0]) : e("{n} Layers", { n: f.length })
			})
		}),
		children: [/* @__PURE__ */ g("div", {
			className: "grid h-28 shrink-0 place-items-center border-b border-border bg-sunken",
			children: /* @__PURE__ */ g(O, {
				value: n,
				kind: l,
				large: !0
			})
		}), /* @__PURE__ */ _("div", {
			className: "min-h-0 flex-1 space-y-3 overflow-y-auto p-3",
			children: [f.map((t, n) => /* @__PURE__ */ _("div", {
				className: "space-y-1.5",
				children: [
					/* @__PURE__ */ _("div", {
						className: "flex h-6 items-center justify-between",
						children: [/* @__PURE__ */ g("span", {
							className: "text-xs font-medium text-text",
							children: f.length > 1 ? e("Layer {n}", { n: n + 1 }) : e("Shadow")
						}), /* @__PURE__ */ g(o, {
							icon: "minus",
							size: "xs",
							label: e("Remove Layer"),
							onClick: () => v(f.filter((e, t) => t !== n))
						})]
					}),
					!u && /* @__PURE__ */ g(c, {
						size: "xs",
						block: !0,
						"aria-label": e("Position"),
						value: t.inset ? "inside" : "outside",
						onChange: (e) => y(n, { inset: e === "inside" }),
						options: [{
							value: "outside",
							label: e("Outside")
						}, {
							value: "inside",
							label: e("Inside")
						}]
					}),
					/* @__PURE__ */ g(p, {
						className: "grid grid-cols-2 gap-1",
						bare: !0,
						fields: [
							{
								handle: "x",
								type: "text",
								component: "blocks-value",
								label: e("X Offset"),
								prefix: "X",
								placeholder: "0"
							},
							{
								handle: "y",
								type: "text",
								component: "blocks-value",
								label: e("Y Offset"),
								prefix: "Y",
								placeholder: "0"
							},
							{
								handle: "blur",
								type: "text",
								component: "blocks-value",
								label: e("Blur"),
								min: 0,
								prefixIcon: "shadow",
								placeholder: "0"
							},
							...u ? [] : [{
								handle: "spread",
								type: "text",
								component: "blocks-value",
								label: e("Spread"),
								prefixIcon: "arrows-out-simple",
								placeholder: "0"
							}]
						],
						values: t,
						onChange: (e, t) => y(n, { [e]: t == null || t === "" ? "0" : String(t) })
					}),
					/* @__PURE__ */ g(p, {
						bare: !0,
						fields: [{
							handle: "color",
							type: "color",
							component: "blocks-color",
							label: e("Color")
						}],
						values: t,
						onChange: (e, t) => y(n, { color: String(t ?? "transparent") })
					})
				]
			}, n)), /* @__PURE__ */ g(r, {
				variant: "ghost",
				size: "xs",
				icon: "plus",
				onClick: () => v([...f, l === "box" ? D.box : D.text]),
				className: "-ml-1.5 !px-1.5 !font-normal !text-muted hover:!text-ink",
				children: f.length ? e("Add Layer") : e("Add Shadow")
			})]
		})]
	});
}
function j(e) {
	let t = /^(-?\d*\.?\d+)(px|rem|em)?$/.exec(e.trim());
	return t ? Number(t[1]) * (t[2] === "rem" || t[2] === "em" ? 16 : 1) : null;
}
var M = (e, t = 4) => +e.toFixed(t), N = (e, t) => t === "px" ? `${M(e, 2)}px` : `${M(e / 16)}rem`;
function P(e) {
	let t = /^clamp\(\s*([^,]+?)\s*,\s*(?:(-?[\d.]+)(rem|px)\s*([+-])\s*)?([\d.]+)vw\s*,\s*([^,]+?)\s*\)$/.exec(e.trim());
	if (!t) return null;
	let n = j(t[1]), r = j(t[6]), i = Number(t[5]) / 100, a = t[2] === void 0 ? 0 : Number(t[2]) * (t[3] === "rem" ? 16 : 1) * (t[4] === "-" ? -1 : 1);
	return n === null || r === null || !i ? null : {
		min: n,
		max: r,
		from: Math.round((n - a) / i),
		to: Math.round((r - a) / i),
		unit: /px\s*$/.test(t[1]) ? "px" : "rem"
	};
}
function F({ min: e, max: t, from: n, to: r, unit: i }) {
	if (r === n) return N(t, i);
	let a = (t - e) / (r - n), o = e - a * n, s = `${N(Math.abs(o), i)} ${o < 0 ? "-" : "+"} ${M(a * 100)}vw`;
	return `clamp(${N(Math.min(e, t), i)}, ${o === 0 ? `${M(a * 100)}vw` : s}, ${N(Math.max(e, t), i)})`;
}
var I = (e) => String(M(e, 1));
function L({ fluid: e }) {
	let t = Math.max(1600, e.to + 160), n = (e) => 8 + Math.max(0, Math.min(t, e)) / t * 232, r = Math.min(e.min, e.max), i = Math.max(e.min, e.max, r + 1), a = (e) => 50 - (e - r) / (i - r) * 36, o = `M${n(0)},${a(e.min)} L${n(e.from)},${a(e.min)} L${n(e.to)},${a(e.max)} L${n(t)},${a(e.max)}`;
	return /* @__PURE__ */ _("svg", {
		width: 248,
		height: 64,
		viewBox: "0 0 248 64",
		className: "block w-full overflow-visible rounded-sm bg-sunken text-ink",
		"aria-hidden": !0,
		children: [
			/* @__PURE__ */ g("line", {
				x1: n(e.from),
				y1: 4,
				x2: n(e.from),
				y2: 60,
				className: "stroke-border-strong",
				strokeDasharray: "2 3"
			}),
			/* @__PURE__ */ g("line", {
				x1: n(e.to),
				y1: 4,
				x2: n(e.to),
				y2: 60,
				className: "stroke-border-strong",
				strokeDasharray: "2 3"
			}),
			/* @__PURE__ */ g("path", {
				d: o,
				fill: "none",
				stroke: "currentColor",
				strokeWidth: 2,
				strokeLinejoin: "round",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ g("circle", {
				cx: n(e.from),
				cy: a(e.min),
				r: 3,
				fill: "currentColor"
			}),
			/* @__PURE__ */ g("circle", {
				cx: n(e.to),
				cy: a(e.max),
				r: 3,
				fill: "currentColor"
			})
		]
	});
}
function R({ handle: e, label: t, icon: n, value: r, min: a = 0, step: o = 1, onChange: s }) {
	return /* @__PURE__ */ g(i, {
		className: "min-w-0",
		fields: [{
			handle: e,
			type: "text",
			component: "blocks-value",
			label: t,
			unit: "px",
			units: ["px"],
			step: o,
			min: a,
			size: "sm",
			...n ? { prefixIcon: n } : {}
		}],
		values: { [e]: `${I(r)}px` },
		onChange: (e, t) => {
			let n = j(String(t ?? ""));
			n !== null && s(n);
		}
	});
}
function z({ field: t, value: r, onChange: c, disabled: u }) {
	let f = String(r ?? ""), p = P(f), m = j(f), [h, v] = n(!1), y = t.units ?? [
		"rem",
		"px",
		"em",
		"%",
		"vw"
	], b = {
		handle: t.handle,
		type: "text",
		component: "blocks-value",
		label: t.label,
		unit: "rem",
		units: y,
		step: .125,
		size: "sm"
	}, x = (e) => p && c(F({
		...p,
		...e
	})), S = u || !p && m === null ? /* @__PURE__ */ g("span", { className: "size-6 shrink-0" }) : /* @__PURE__ */ g(l, {
		content: e("Grow with the Screen"),
		children: /* @__PURE__ */ g(o, {
			icon: "width",
			size: "xs",
			label: e("Grow with the Screen"),
			title: void 0,
			"aria-pressed": !!p,
			active: !!p,
			onClick: () => c(p ? N(p.max, p.unit) : F({
				min: Math.max(M((m ?? 16) * .75, 0), 1),
				max: m ?? 16,
				from: 390,
				to: 1280,
				unit: /px$/.test(f) ? "px" : "rem"
			}))
		})
	});
	return p ? /* @__PURE__ */ _("div", {
		className: "flex min-w-0 flex-1 items-center gap-1",
		children: [/* @__PURE__ */ g(s, {
			open: h,
			onOpenChange: v,
			align: "start",
			className: "w-72 !p-3",
			trigger: /* @__PURE__ */ g(E, {
				id: d(t),
				disabled: u,
				label: t.label,
				children: /* @__PURE__ */ _("span", {
					className: "inline-flex items-center gap-1 tabular-nums",
					children: [
						/* @__PURE__ */ g(a, {
							name: "phone",
							size: 12,
							className: "text-faint"
						}),
						I(p.min),
						/* @__PURE__ */ g("span", {
							className: "text-faint",
							children: "→"
						}),
						/* @__PURE__ */ g(a, {
							name: "monitor",
							size: 12,
							className: "text-faint"
						}),
						I(p.max),
						"px"
					]
				})
			}),
			children: /* @__PURE__ */ _("div", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ g(L, { fluid: p }),
					/* @__PURE__ */ _("div", {
						className: "grid grid-cols-2 gap-2",
						children: [/* @__PURE__ */ g(R, {
							handle: "min",
							label: e("On a Phone"),
							icon: "phone",
							value: p.min,
							onChange: (e) => x({ min: e })
						}), /* @__PURE__ */ g(R, {
							handle: "max",
							label: e("On a Desktop"),
							icon: "monitor",
							value: p.max,
							onChange: (e) => x({ max: e })
						})]
					}),
					/* @__PURE__ */ _("div", {
						className: "grid grid-cols-2 gap-2",
						children: [/* @__PURE__ */ g(R, {
							handle: "from",
							label: e("Screen From"),
							icon: "width",
							value: p.from,
							step: 10,
							onChange: (e) => e < p.to && x({ from: e })
						}), /* @__PURE__ */ g(R, {
							handle: "to",
							label: e("Screen To"),
							icon: "width",
							value: p.to,
							step: 10,
							onChange: (e) => e > p.from && x({ to: e })
						})]
					})
				]
			})
		}), S]
	}) : /* @__PURE__ */ _("div", {
		className: "flex min-w-0 flex-1 items-center gap-1",
		children: [m === null && f !== "" ? /* @__PURE__ */ g(i, {
			bare: !0,
			className: "flex min-w-0 flex-1",
			disabled: u,
			fields: [{
				handle: t.handle,
				type: "text",
				label: t.label,
				size: "sm",
				mono: !0
			}],
			values: { [t.handle]: f },
			onChange: (e, t) => t && c(String(t))
		}) : /* @__PURE__ */ g(i, {
			bare: !0,
			className: "flex min-w-0 flex-1",
			disabled: u,
			fields: [b],
			values: { [t.handle]: f || null },
			onChange: (e, t) => t && c(String(t))
		}), S]
	});
}
var B = /^-?[\d.]+m?s$/, V = /^(linear|ease|ease-in|ease-out|ease-in-out|step-start|step-end|(cubic-bezier|steps|linear)\(.*\))$/;
function H(e) {
	if (/,(?![^(]*\))/.test(e)) return null;
	let t = e.trim().match(/[\w-]+\([^)]*\)|\S+/g) ?? [], n = {
		name: "",
		duration: "",
		easing: "",
		delay: "",
		forever: !1,
		alternate: !1
	};
	for (let e of t) if (B.test(e)) n.duration ? n.delay = e : n.duration = e;
	else if (V.test(e)) n.easing = e;
	else if (e === "infinite") n.forever = !0;
	else if (/^(alternate|alternate-reverse)$/.test(e)) n.alternate = !0;
	else if (/^(normal|reverse|forwards|backwards|both|none|running|paused|\d+)$/.test(e)) continue;
	else n.name ||= e;
	return n;
}
function U(e) {
	return [
		e.name,
		e.duration || "1s",
		e.easing,
		e.delay,
		e.forever ? "infinite" : "",
		e.alternate ? "alternate" : ""
	].filter(Boolean).join(" ");
}
function W(...e) {
	let t = {};
	for (let n of e) {
		let e = /@keyframes\s+([\w-]+)\s*\{/g, r;
		for (; r = e.exec(n);) {
			let i = 1, a = e.lastIndex;
			for (; a < n.length && i > 0; a++) i += n[a] === "{" ? 1 : n[a] === "}" ? -1 : 0;
			t[r[1]] = n.slice(r.index, a);
		}
	}
	return t;
}
function G({ value: e, keyframes: t, large: n }) {
	let r = H(e), i = r?.name && t[r.name] ? `cms-sample-${r.name}` : null, a = i && r ? t[r.name].replace(/@keyframes\s+[\w-]+/, `@keyframes ${i}`) : "";
	return /* @__PURE__ */ _("span", {
		className: u("grid shrink-0 place-items-center", n ? "size-16" : "size-5"),
		"aria-hidden": !0,
		children: [a && /* @__PURE__ */ g("style", { children: a }), /* @__PURE__ */ g("span", {
			className: u("rounded-xs bg-ink", n ? "size-6" : "size-2.5"),
			style: i && r ? { animation: U({
				...r,
				name: i
			}) } : void 0
		})]
	});
}
function K({ field: t, value: n, onChange: r, disabled: a }) {
	let o = t.keyframes ?? {}, c = String(n ?? ""), l = H(c), u = (e) => l && r(U({
		...l,
		...e
	}));
	if (!l) return /* @__PURE__ */ g(i, {
		bare: !0,
		className: "flex min-w-0 flex-1",
		disabled: a,
		fields: [{
			handle: t.handle,
			type: "text",
			label: t.label,
			size: "sm",
			mono: !0
		}],
		values: { [t.handle]: c },
		onChange: (e, t) => t && r(String(t))
	});
	let f = [.../* @__PURE__ */ new Set([...Object.keys(o), ...l.name ? [l.name] : []])];
	return /* @__PURE__ */ _(s, {
		align: "start",
		className: "w-72 !p-0",
		trigger: /* @__PURE__ */ g(E, {
			id: d(t),
			disabled: a,
			label: t.label,
			children: /* @__PURE__ */ g("span", {
				className: "truncate",
				children: [
					l.name,
					l.duration,
					l.forever ? e("Forever") : e("Once")
				].filter(Boolean).join(" · ")
			})
		}),
		children: [/* @__PURE__ */ g("div", {
			className: "grid h-24 place-items-center border-b border-border bg-sunken",
			children: /* @__PURE__ */ g(G, {
				value: c,
				keyframes: o,
				large: !0
			})
		}), /* @__PURE__ */ g("div", {
			className: "space-y-2 p-3",
			children: /* @__PURE__ */ g(i, {
				fields: [
					{
						handle: "name",
						type: "select",
						size: "sm",
						label: e("Keyframes"),
						required: !0,
						options: Object.fromEntries(f.map((e) => [e, e]))
					},
					{
						handle: "duration",
						type: "text",
						component: "blocks-value",
						size: "sm",
						label: e("Duration"),
						unit: "ms",
						units: ["ms", "s"],
						step: 50,
						min: 0
					},
					{
						handle: "easing",
						type: "text",
						component: "ease",
						size: "sm",
						label: e("Easing"),
						placeholder: e("Ease")
					},
					{
						handle: "repeat",
						type: "select",
						display: "segmented",
						block: !0,
						size: "sm",
						required: !0,
						label: e("Repeat"),
						options: [{
							value: "once",
							label: e("Once")
						}, {
							value: "forever",
							label: e("Forever")
						}]
					},
					{
						handle: "alternate",
						type: "toggle",
						label: e("Back and Forth")
					}
				],
				values: {
					name: l.name,
					duration: l.duration || null,
					easing: l.easing || null,
					repeat: l.forever ? "forever" : "once",
					alternate: l.alternate
				},
				onChange: (e, t) => {
					u(e === "repeat" ? { forever: t === "forever" } : e === "alternate" ? { alternate: !!t } : { [e]: t == null ? "" : String(t) });
				}
			})
		})]
	});
}
export { O as a, C as c, w as d, A as i, x as l, G as n, z as o, T as r, b as s, K as t, W as u };
