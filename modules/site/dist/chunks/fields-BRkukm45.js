import { t as e } from "@letterncms/sdk";
import { forwardRef as t, useState as n } from "react";
import { Button as r, Fields as i, Icon as a, IconButton as o, Popover as s, Segmented as c, Tooltip as l, cn as u, fieldControlId as d } from "@letterncms/ui";
import { PanelFields as f, formatShadows as p, parseShadows as m } from "@letterncms/blocks";
import { jsx as h, jsxs as g } from "react/jsx-runtime";
// admin/src/fields.tsx
var _ = {
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
}, v = /* @__PURE__ */ new Set([
	...Object.values(_).flat(),
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
function y(e) {
	return e.includes("monospace") ? "mono" : e.includes("serif") ? "serif" : "sans";
}
function b(e) {
	return String(e ?? "").split(",").map((e) => e.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
}
function x(e) {
	return e.map((e) => /^[a-zA-Z][\w-]*$/.test(e) ? e : `"${e.replace(/"/g, "")}"`).join(", ");
}
function S(e) {
	return e[0] && !v.has(e[0]) && !e[0].endsWith(" Fallback") ? e[0] : "";
}
function C(e, t, n) {
	return x([...e ? [e, ...n ? [`${e} Fallback`] : []] : [], ..._[t]]);
}
function w({ field: t, value: i, onChange: c, disabled: l }) {
	let [u, f] = n(!1), p = b(i), m = S(p), _ = y(p), v = t.fonts ?? [], x = (e, t) => c(C(e, _, t)), w = async (e) => {
		f(!1);
		let n = await t.onAdd?.(e);
		n && x(n.family, n.fallback);
	}, T = (e, t, n, i, o) => /* @__PURE__ */ g("div", {
		className: "cms-reveal-row flex items-center gap-1 rounded-sm pr-1 hover:bg-hover",
		children: [/* @__PURE__ */ g(r, {
			variant: "ghost",
			onClick: () => {
				x(e, i), f(!1);
			},
			className: "!h-9 min-w-0 flex-1 shrink !justify-start !gap-2 !bg-transparent !pl-2 !pr-0 text-left !font-normal",
			children: [/* @__PURE__ */ h("span", {
				className: "min-w-0 flex-1 truncate text-base leading-tight text-ink",
				style: e ? { fontFamily: `"${e}"` } : void 0,
				children: t
			}), n && /* @__PURE__ */ h("span", {
				className: "shrink-0 text-2xs tabular-nums text-faint",
				children: n
			})]
		}), /* @__PURE__ */ h("span", {
			className: "grid w-6 shrink-0 place-items-center",
			children: e === m ? /* @__PURE__ */ h(a, {
				name: "check",
				size: 14,
				className: "text-ink"
			}) : o
		})]
	}, e || "system"), E = (e, t, n) => /* @__PURE__ */ g(r, {
		variant: "ghost",
		size: "md",
		onClick: n,
		className: "w-full !justify-start !gap-2 !rounded-sm !px-2 text-left !text-xs !font-normal",
		children: [/* @__PURE__ */ h(a, {
			name: e,
			size: 14,
			className: "shrink-0 text-faint"
		}), t]
	});
	return /* @__PURE__ */ g(s, {
		open: u,
		onOpenChange: f,
		align: "end",
		className: "w-72 !p-1.5",
		trigger: /* @__PURE__ */ g(r, {
			variant: "ghost",
			id: d(t),
			disabled: l,
			className: "cms-input w-full min-w-0 shrink !justify-start !gap-2 !pl-2 !pr-1.5 text-left !font-normal",
			children: [/* @__PURE__ */ h("span", {
				className: "min-w-0 flex-1 truncate",
				style: m ? { fontFamily: `"${m}"` } : void 0,
				children: m || e("System Font")
			}), /* @__PURE__ */ h(a, {
				name: "chevrons-up-down",
				size: 14,
				className: "shrink-0 text-faint"
			})]
		}),
		children: [/* @__PURE__ */ g("div", {
			className: "max-h-72 overflow-y-auto",
			children: [
				T("", e("System Font"), "", !1),
				m && !v.some((e) => e.family === m) && T(m, m, "", p.includes(`${m} Fallback`)),
				v.map((n) => T(n.family, n.family, n.styles, n.fallback, !n.used && t.onRemove ? /* @__PURE__ */ h(o, {
					icon: "trash",
					label: e("Remove {family}", { family: n.family }),
					size: "xs",
					className: "cms-reveal",
					onClick: () => t.onRemove(n.family)
				}) : void 0))
			]
		}), !!t.onAdd && /* @__PURE__ */ g("div", {
			className: "mt-1 border-t border-border pt-1",
			children: [E("search", e("Add a Google Font…"), () => void w("google")), E("upload", e("Upload a .woff2 File…"), () => void w("upload"))]
		})]
	});
}
var T = t(function({ label: e, children: t, className: n, ...i }, o) {
	return /* @__PURE__ */ g(r, {
		ref: o,
		variant: "ghost",
		"aria-label": e,
		...i,
		className: u("cms-input w-full min-w-0 shrink !justify-start !gap-1.5 !pl-2 !pr-1.5 text-left !font-normal data-[popup-open]:border-focus", n),
		children: [/* @__PURE__ */ h("span", {
			className: "min-w-0 flex-1 truncate",
			children: t
		}), /* @__PURE__ */ h(a, {
			name: "chevrons-up-down",
			size: 11,
			className: "shrink-0 text-faint"
		})]
	});
}), E = {
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
function D({ value: e, kind: t, large: n }) {
	let r = e && e !== "none" ? e : void 0;
	return t === "text" ? /* @__PURE__ */ h("span", {
		className: u("grid shrink-0 place-items-center font-semibold text-ink", n ? "text-5xl" : "size-5 text-base"),
		style: { textShadow: r },
		children: "A"
	}) : t === "drop" ? /* @__PURE__ */ h("span", {
		className: u("shrink-0 rounded-sm bg-float", n ? "size-16" : "size-5"),
		style: { filter: r ? r.split(/,(?![^(]*\))/).map((e) => `drop-shadow(${e.trim()})`).join(" ") : void 0 }
	}) : /* @__PURE__ */ h("span", {
		className: u("shrink-0 rounded-sm border border-border bg-float", n ? "size-16" : "size-5"),
		style: { boxShadow: r }
	});
}
var O = (t) => [
	t.inset ? e("Inside") : null,
	`Y ${t.y.replace(/px$/, "")}`,
	`${e("Blur")} ${t.blur.replace(/px$/, "")}`
].filter(Boolean).join(" · ");
function k({ field: t, value: n, onChange: i, disabled: a }) {
	let l = t.kind ?? "box", u = l !== "box", _ = m(n) ?? [], v = (e) => i(p(e, u) ?? "none"), y = (e, t) => v(_.map((n, r) => r === e ? {
		...n,
		...t
	} : n));
	return /* @__PURE__ */ g(s, {
		align: "start",
		className: "flex max-h-[min(36rem,80vh)] w-72 flex-col !p-0",
		trigger: /* @__PURE__ */ h(T, {
			id: d(t),
			disabled: a,
			label: t.label,
			children: _.length === 0 ? /* @__PURE__ */ h("span", {
				className: "text-faint",
				children: e("Add Shadow")
			}) : /* @__PURE__ */ h("span", {
				className: "truncate",
				children: _.length === 1 ? O(_[0]) : e("{n} Layers", { n: _.length })
			})
		}),
		children: [/* @__PURE__ */ h("div", {
			className: "grid h-28 shrink-0 place-items-center border-b border-border bg-sunken",
			children: /* @__PURE__ */ h(D, {
				value: n,
				kind: l,
				large: !0
			})
		}), /* @__PURE__ */ g("div", {
			className: "min-h-0 flex-1 space-y-3 overflow-y-auto p-3",
			children: [_.map((t, n) => /* @__PURE__ */ g("div", {
				className: "space-y-1.5",
				children: [
					/* @__PURE__ */ g("div", {
						className: "flex h-6 items-center justify-between",
						children: [/* @__PURE__ */ h("span", {
							className: "text-xs font-medium text-text",
							children: _.length > 1 ? e("Layer {n}", { n: n + 1 }) : e("Shadow")
						}), /* @__PURE__ */ h(o, {
							icon: "minus",
							size: "xs",
							label: e("Remove Layer"),
							onClick: () => v(_.filter((e, t) => t !== n))
						})]
					}),
					!u && /* @__PURE__ */ h(c, {
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
					/* @__PURE__ */ h(f, {
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
					/* @__PURE__ */ h(f, {
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
			}, n)), /* @__PURE__ */ h(r, {
				variant: "ghost",
				size: "xs",
				icon: "plus",
				onClick: () => v([..._, l === "box" ? E.box : E.text]),
				className: "-ml-1.5 !px-1.5 !font-normal !text-muted hover:!text-ink",
				children: _.length ? e("Add Layer") : e("Add Shadow")
			})]
		})]
	});
}
function A(e) {
	let t = /^(-?\d*\.?\d+)(px|rem|em)?$/.exec(e.trim());
	return t ? Number(t[1]) * (t[2] === "rem" || t[2] === "em" ? 16 : 1) : null;
}
var j = (e, t = 4) => +e.toFixed(t), M = (e, t) => t === "px" ? `${j(e, 2)}px` : `${j(e / 16)}rem`;
function N(e) {
	let t = /^clamp\(\s*([^,]+?)\s*,\s*(?:(-?[\d.]+)(rem|px)\s*([+-])\s*)?([\d.]+)vw\s*,\s*([^,]+?)\s*\)$/.exec(e.trim());
	if (!t) return null;
	let n = A(t[1]), r = A(t[6]), i = Number(t[5]) / 100, a = t[2] === void 0 ? 0 : Number(t[2]) * (t[3] === "rem" ? 16 : 1) * (t[4] === "-" ? -1 : 1);
	return n === null || r === null || !i ? null : {
		min: n,
		max: r,
		from: Math.round((n - a) / i),
		to: Math.round((r - a) / i),
		unit: /px\s*$/.test(t[1]) ? "px" : "rem"
	};
}
function P({ min: e, max: t, from: n, to: r, unit: i }) {
	if (r === n) return M(t, i);
	let a = (t - e) / (r - n), o = e - a * n, s = `${M(Math.abs(o), i)} ${o < 0 ? "-" : "+"} ${j(a * 100)}vw`;
	return `clamp(${M(Math.min(e, t), i)}, ${o === 0 ? `${j(a * 100)}vw` : s}, ${M(Math.max(e, t), i)})`;
}
var F = (e) => String(j(e, 1));
function I({ fluid: e }) {
	let t = Math.max(1600, e.to + 160), n = (e) => 8 + Math.max(0, Math.min(t, e)) / t * 232, r = Math.min(e.min, e.max), i = Math.max(e.min, e.max, r + 1), a = (e) => 50 - (e - r) / (i - r) * 36, o = `M${n(0)},${a(e.min)} L${n(e.from)},${a(e.min)} L${n(e.to)},${a(e.max)} L${n(t)},${a(e.max)}`;
	return /* @__PURE__ */ g("svg", {
		width: 248,
		height: 64,
		viewBox: "0 0 248 64",
		className: "block w-full overflow-visible rounded-sm bg-sunken text-ink",
		"aria-hidden": !0,
		children: [
			/* @__PURE__ */ h("line", {
				x1: n(e.from),
				y1: 4,
				x2: n(e.from),
				y2: 60,
				className: "stroke-border-strong",
				strokeDasharray: "2 3"
			}),
			/* @__PURE__ */ h("line", {
				x1: n(e.to),
				y1: 4,
				x2: n(e.to),
				y2: 60,
				className: "stroke-border-strong",
				strokeDasharray: "2 3"
			}),
			/* @__PURE__ */ h("path", {
				d: o,
				fill: "none",
				stroke: "currentColor",
				strokeWidth: 2,
				strokeLinejoin: "round",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ h("circle", {
				cx: n(e.from),
				cy: a(e.min),
				r: 3,
				fill: "currentColor"
			}),
			/* @__PURE__ */ h("circle", {
				cx: n(e.to),
				cy: a(e.max),
				r: 3,
				fill: "currentColor"
			})
		]
	});
}
function L({ handle: e, label: t, icon: n, value: r, min: a = 0, step: o = 1, onChange: s }) {
	return /* @__PURE__ */ h(i, {
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
		values: { [e]: `${F(r)}px` },
		onChange: (e, t) => {
			let n = A(String(t ?? ""));
			n !== null && s(n);
		}
	});
}
function R({ field: t, value: r, onChange: c, disabled: u }) {
	let f = String(r ?? ""), p = N(f), m = A(f), [_, v] = n(!1), y = t.units ?? [
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
	}, x = (e) => p && c(P({
		...p,
		...e
	})), S = !u && (p || m !== null) && /* @__PURE__ */ h(l, {
		content: e("Grow with the Screen"),
		children: /* @__PURE__ */ h(o, {
			icon: "width",
			size: "xs",
			label: e("Grow with the Screen"),
			title: void 0,
			"aria-pressed": !!p,
			active: !!p,
			onClick: () => c(p ? M(p.max, p.unit) : P({
				min: Math.max(j((m ?? 16) * .75, 0), 1),
				max: m ?? 16,
				from: 390,
				to: 1280,
				unit: /px$/.test(f) ? "px" : "rem"
			}))
		})
	});
	return p ? /* @__PURE__ */ g("div", {
		className: "flex min-w-0 flex-1 items-center gap-1",
		children: [/* @__PURE__ */ h(s, {
			open: _,
			onOpenChange: v,
			align: "start",
			className: "w-72 !p-3",
			trigger: /* @__PURE__ */ h(T, {
				id: d(t),
				disabled: u,
				label: t.label,
				children: /* @__PURE__ */ g("span", {
					className: "inline-flex items-center gap-1 tabular-nums",
					children: [
						/* @__PURE__ */ h(a, {
							name: "phone",
							size: 12,
							className: "text-faint"
						}),
						F(p.min),
						/* @__PURE__ */ h("span", {
							className: "text-faint",
							children: "→"
						}),
						/* @__PURE__ */ h(a, {
							name: "monitor",
							size: 12,
							className: "text-faint"
						}),
						F(p.max),
						"px"
					]
				})
			}),
			children: /* @__PURE__ */ g("div", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ h(I, { fluid: p }),
					/* @__PURE__ */ g("div", {
						className: "grid grid-cols-2 gap-2",
						children: [/* @__PURE__ */ h(L, {
							handle: "min",
							label: e("On a Phone"),
							icon: "phone",
							value: p.min,
							onChange: (e) => x({ min: e })
						}), /* @__PURE__ */ h(L, {
							handle: "max",
							label: e("On a Desktop"),
							icon: "monitor",
							value: p.max,
							onChange: (e) => x({ max: e })
						})]
					}),
					/* @__PURE__ */ g("div", {
						className: "grid grid-cols-2 gap-2",
						children: [/* @__PURE__ */ h(L, {
							handle: "from",
							label: e("Screen From"),
							icon: "width",
							value: p.from,
							step: 10,
							onChange: (e) => e < p.to && x({ from: e })
						}), /* @__PURE__ */ h(L, {
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
	}) : /* @__PURE__ */ g("div", {
		className: "flex min-w-0 flex-1 items-center gap-1",
		children: [m === null && f !== "" ? /* @__PURE__ */ h(i, {
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
		}) : /* @__PURE__ */ h(i, {
			bare: !0,
			className: "flex min-w-0 flex-1",
			disabled: u,
			fields: [b],
			values: { [t.handle]: f || null },
			onChange: (e, t) => t && c(String(t))
		}), S]
	});
}
var z = /^-?[\d.]+m?s$/, B = /^(linear|ease|ease-in|ease-out|ease-in-out|step-start|step-end|(cubic-bezier|steps|linear)\(.*\))$/;
function V(e) {
	if (/,(?![^(]*\))/.test(e)) return null;
	let t = e.trim().match(/[\w-]+\([^)]*\)|\S+/g) ?? [], n = {
		name: "",
		duration: "",
		easing: "",
		delay: "",
		forever: !1,
		alternate: !1
	};
	for (let e of t) if (z.test(e)) n.duration ? n.delay = e : n.duration = e;
	else if (B.test(e)) n.easing = e;
	else if (e === "infinite") n.forever = !0;
	else if (/^(alternate|alternate-reverse)$/.test(e)) n.alternate = !0;
	else if (/^(normal|reverse|forwards|backwards|both|none|running|paused|\d+)$/.test(e)) continue;
	else n.name ||= e;
	return n;
}
function H(e) {
	return [
		e.name,
		e.duration || "1s",
		e.easing,
		e.delay,
		e.forever ? "infinite" : "",
		e.alternate ? "alternate" : ""
	].filter(Boolean).join(" ");
}
function U(...e) {
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
function W({ value: e, keyframes: t, large: n }) {
	let r = V(e), i = r?.name && t[r.name] ? `cms-sample-${r.name}` : null, a = i && r ? t[r.name].replace(/@keyframes\s+[\w-]+/, `@keyframes ${i}`) : "";
	return /* @__PURE__ */ g("span", {
		className: u("grid shrink-0 place-items-center", n ? "size-16" : "size-5"),
		"aria-hidden": !0,
		children: [a && /* @__PURE__ */ h("style", { children: a }), /* @__PURE__ */ h("span", {
			className: u("rounded-xs bg-ink", n ? "size-6" : "size-2.5"),
			style: i && r ? { animation: H({
				...r,
				name: i
			}) } : void 0
		})]
	});
}
function G({ field: t, value: n, onChange: r, disabled: a }) {
	let o = t.keyframes ?? {}, c = String(n ?? ""), l = V(c), u = (e) => l && r(H({
		...l,
		...e
	}));
	if (!l) return /* @__PURE__ */ h(i, {
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
	return /* @__PURE__ */ g(s, {
		align: "start",
		className: "w-72 !p-0",
		trigger: /* @__PURE__ */ h(T, {
			id: d(t),
			disabled: a,
			label: t.label,
			children: /* @__PURE__ */ h("span", {
				className: "truncate",
				children: [
					l.name,
					l.duration,
					l.forever ? e("Forever") : e("Once")
				].filter(Boolean).join(" · ")
			})
		}),
		children: [/* @__PURE__ */ h("div", {
			className: "grid h-24 place-items-center border-b border-border bg-sunken",
			children: /* @__PURE__ */ h(W, {
				value: c,
				keyframes: o,
				large: !0
			})
		}), /* @__PURE__ */ h("div", {
			className: "space-y-2 p-3",
			children: /* @__PURE__ */ h(i, {
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
export { D as a, S as c, C as d, k as i, b as l, W as n, R as o, w as r, y as s, G as t, U as u };
