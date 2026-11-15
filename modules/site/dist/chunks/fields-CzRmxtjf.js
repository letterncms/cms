import { t as e } from "@letterncms/sdk";
import { forwardRef as t, useState as n } from "react";
import { Button as r, Fields as i, Icon as a, IconButton as o, Popover as s, Tooltip as c, cn as l, fieldControlId as u } from "@letterncms/ui";
import { jsx as d, jsxs as f } from "react/jsx-runtime";
// admin/src/fields.tsx
var p = {
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
}, m = /* @__PURE__ */ new Set([
	...Object.values(p).flat(),
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
function h(e) {
	return e.includes("monospace") ? "mono" : e.includes("serif") ? "serif" : "sans";
}
function g(e) {
	return String(e ?? "").split(",").map((e) => e.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
}
function _(e) {
	return e.map((e) => /^[a-zA-Z][\w-]*$/.test(e) ? e : `"${e.replace(/"/g, "")}"`).join(", ");
}
function v(e) {
	return e[0] && !m.has(e[0]) && !e[0].endsWith(" Fallback") ? e[0] : "";
}
function y(e, t, n) {
	return _([...e ? [e, ...n ? [`${e} Fallback`] : []] : [], ...p[t]]);
}
function b({ field: t, value: i, onChange: c, disabled: l }) {
	let [p, m] = n(!1), _ = g(i), b = v(_), x = h(_), S = t.fonts ?? [], C = (e, t) => c(y(e, x, t)), w = async (e) => {
		m(!1);
		let n = await t.onAdd?.(e);
		n && C(n.family, n.fallback);
	}, T = (e, t, n, i, o) => /* @__PURE__ */ f("div", {
		className: "cms-reveal-row flex items-center gap-1 rounded-sm pr-1 hover:bg-hover",
		children: [/* @__PURE__ */ f(r, {
			variant: "ghost",
			onClick: () => {
				C(e, i), m(!1);
			},
			className: "!h-9 min-w-0 flex-1 shrink !justify-start !gap-2 !bg-transparent !pl-2 !pr-0 text-left !font-normal",
			children: [/* @__PURE__ */ d("span", {
				className: "min-w-0 flex-1 truncate text-base leading-tight text-ink",
				style: e ? { fontFamily: `"${e}"` } : void 0,
				children: t
			}), n && /* @__PURE__ */ d("span", {
				className: "shrink-0 text-2xs tabular-nums text-faint",
				children: n
			})]
		}), /* @__PURE__ */ d("span", {
			className: "grid w-6 shrink-0 place-items-center",
			children: e === b ? /* @__PURE__ */ d(a, {
				name: "check",
				size: 14,
				className: "text-ink"
			}) : o
		})]
	}, e || "system"), E = (e, t, n) => /* @__PURE__ */ f(r, {
		variant: "ghost",
		size: "md",
		onClick: n,
		className: "w-full !justify-start !gap-2 !rounded-sm !px-2 text-left !text-xs !font-normal",
		children: [/* @__PURE__ */ d(a, {
			name: e,
			size: 14,
			className: "shrink-0 text-faint"
		}), t]
	});
	return /* @__PURE__ */ f(s, {
		open: p,
		onOpenChange: m,
		align: "end",
		className: "w-72 !p-1.5",
		trigger: /* @__PURE__ */ f(r, {
			variant: "ghost",
			id: u(t),
			disabled: l,
			className: "cms-input w-full min-w-0 shrink !justify-start !gap-2 !pl-2 !pr-1.5 text-left !font-normal",
			children: [/* @__PURE__ */ d("span", {
				className: "min-w-0 flex-1 truncate",
				style: b ? { fontFamily: `"${b}"` } : void 0,
				children: b || e("System Font")
			}), /* @__PURE__ */ d(a, {
				name: "chevrons-up-down",
				size: 14,
				className: "shrink-0 text-faint"
			})]
		}),
		children: [/* @__PURE__ */ f("div", {
			className: "max-h-72 overflow-y-auto",
			children: [
				T("", e("System Font"), "", !1),
				b && !S.some((e) => e.family === b) && T(b, b, "", _.includes(`${b} Fallback`)),
				S.map((n) => T(n.family, n.family, n.styles, n.fallback, !n.used && t.onRemove ? /* @__PURE__ */ d(o, {
					icon: "trash",
					label: e("Remove {family}", { family: n.family }),
					size: "xs",
					className: "cms-reveal",
					onClick: () => t.onRemove(n.family)
				}) : void 0))
			]
		}), !!t.onAdd && /* @__PURE__ */ f("div", {
			className: "mt-1 border-t border-border pt-1",
			children: [E("search", e("Add a Google Font…"), () => void w("google")), E("upload", e("Upload a .woff2 File…"), () => void w("upload"))]
		})]
	});
}
var x = t(function({ label: e, children: t, className: n, ...i }, o) {
	return /* @__PURE__ */ f(r, {
		ref: o,
		variant: "ghost",
		"aria-label": e,
		...i,
		className: l("cms-input w-full min-w-0 shrink !justify-start !gap-1.5 !pl-2 !pr-1.5 text-left !font-normal data-[popup-open]:border-focus", n),
		children: [/* @__PURE__ */ d("span", {
			className: "min-w-0 flex-1 truncate",
			children: t
		}), /* @__PURE__ */ d(a, {
			name: "chevrons-up-down",
			size: 11,
			className: "shrink-0 text-faint"
		})]
	});
}), S = (t) => [{
	label: e("None"),
	value: "none"
}, ...t ? [
	{
		label: e("Small"),
		value: "0 1px 1px rgb(0 0 0 / 0.08)"
	},
	{
		label: e("Medium"),
		value: "0 2px 4px rgb(0 0 0 / 0.12)"
	},
	{
		label: e("Large"),
		value: "0 8px 16px rgb(0 0 0 / 0.16)"
	}
] : [
	{
		label: e("Small"),
		value: "0 1px 2px rgb(0 0 0 / 0.06)"
	},
	{
		label: e("Medium"),
		value: "0 4px 16px -4px rgb(0 0 0 / 0.12)"
	},
	{
		label: e("Large"),
		value: "0 24px 48px -16px rgb(0 0 0 / 0.2)"
	}
]], C = ({ value: e, text: t }) => t ? /* @__PURE__ */ d("span", {
	className: "grid size-3.5 shrink-0 place-items-center text-xs font-semibold text-ink",
	style: { textShadow: e ?? void 0 },
	children: "A"
}) : /* @__PURE__ */ d("span", {
	className: "size-3.5 shrink-0 rounded-xs border border-border bg-bg",
	style: { boxShadow: e ?? void 0 }
});
function w({ field: t, value: n, onChange: o, disabled: c }) {
	let l = t.kind === "text", p = S(l).find((e) => e.value === n?.replace(/\s+/g, " ").trim()), m = {
		handle: "shadow",
		type: "text",
		component: "blocks-shadows",
		label: e("Shadow"),
		...l ? { kind: "text" } : {}
	}, h = l ? "0 2px 4px rgb(0 0 0 / 12%)" : "0 4px 16px 0 rgb(0 0 0 / 12%)";
	return /* @__PURE__ */ f(s, {
		align: "start",
		className: "w-72 p-1",
		trigger: /* @__PURE__ */ d(x, {
			id: u(t),
			disabled: c,
			label: t.label,
			children: p?.label ?? /* @__PURE__ */ d("span", {
				className: "font-mono text-xs",
				children: (n ?? "").replace(/\s+/g, " ").trim() || e("None")
			})
		}),
		children: [/* @__PURE__ */ d("div", {
			className: "space-y-px",
			children: S(l).map((e) => /* @__PURE__ */ f(r, {
				variant: "ghost",
				onClick: () => o(e.value),
				"data-active": e.value === p?.value || void 0,
				className: "w-full !justify-start !gap-2 !rounded-xs !px-2 text-left !text-xs !font-normal",
				children: [
					/* @__PURE__ */ d(C, {
						value: e.value,
						text: l
					}),
					/* @__PURE__ */ d("span", {
						className: "flex-1",
						children: e.label
					}),
					e.value === p?.value && /* @__PURE__ */ d(a, {
						name: "check",
						size: 12,
						className: "text-muted"
					})
				]
			}, e.value))
		}), /* @__PURE__ */ f("div", {
			className: "mt-1 border-t border-border px-1 pb-1 pt-2",
			children: [
				/* @__PURE__ */ d("p", {
					className: "m-0 mb-1 text-2xs font-medium text-muted",
					children: e("Custom||shadow")
				}),
				/* @__PURE__ */ d(i, {
					bare: !0,
					fields: [m],
					values: { shadow: n && n !== "none" ? n : h },
					onChange: (e, t) => o(t ?? "none")
				}),
				/* @__PURE__ */ f(r, {
					variant: "ghost",
					size: "xs",
					onClick: () => o(`${n && n !== "none" ? `${n}, ` : ""}${l ? "0 1px 2px rgb(0 0 0 / 10%)" : "0 2px 8px 0 rgb(0 0 0 / 10%)"}`),
					className: "mt-1.5 w-full !text-2xs !font-normal !text-muted hover:!text-text",
					children: [/* @__PURE__ */ d(a, {
						name: "plus",
						size: 11
					}), e("Add Layer")]
				})
			]
		})]
	});
}
function T(e) {
	let t = /^(-?\d*\.?\d+)(px|rem|em)?$/.exec(e.trim());
	return t ? Number(t[1]) * (t[2] === "rem" || t[2] === "em" ? 16 : 1) : null;
}
var E = (e, t = 4) => +e.toFixed(t), D = (e, t) => t === "px" ? `${E(e, 2)}px` : `${E(e / 16)}rem`;
function O(e) {
	let t = /^clamp\(\s*([^,]+?)\s*,\s*(?:(-?[\d.]+)(rem|px)\s*([+-])\s*)?([\d.]+)vw\s*,\s*([^,]+?)\s*\)$/.exec(e.trim());
	if (!t) return null;
	let n = T(t[1]), r = T(t[6]), i = Number(t[5]) / 100, a = t[2] === void 0 ? 0 : Number(t[2]) * (t[3] === "rem" ? 16 : 1) * (t[4] === "-" ? -1 : 1);
	return n === null || r === null || !i ? null : {
		min: n,
		max: r,
		from: E((n - a) / i, 1),
		to: E((r - a) / i, 1),
		unit: /px\s*$/.test(t[1]) ? "px" : "rem"
	};
}
function k({ min: e, max: t, from: n, to: r, unit: i }) {
	if (r === n) return D(t, i);
	let a = (t - e) / (r - n), o = e - a * n, s = `${D(Math.abs(o), i)} ${o < 0 ? "-" : "+"} ${E(a * 100)}vw`;
	return `clamp(${D(Math.min(e, t), i)}, ${o === 0 ? `${E(a * 100)}vw` : s}, ${D(Math.max(e, t), i)})`;
}
var A = (e) => String(E(e, 1));
function j({ field: t, value: r, onChange: a, disabled: l }) {
	let p = String(r ?? ""), m = O(p), h = T(p), [g, _] = n(!1), v = t.units ?? [
		"rem",
		"px",
		"em",
		"%",
		"vw"
	], y = {
		handle: t.handle,
		type: "text",
		component: "blocks-value",
		label: t.label,
		unit: "rem",
		units: v,
		step: .125,
		size: "sm"
	}, b = (e) => m && a(k({
		...m,
		...e
	})), S = (e) => T(String(e ?? "")) ?? null, C = !l && (m || h !== null) && /* @__PURE__ */ d(c, {
		content: e("Fluid Size"),
		children: /* @__PURE__ */ d(o, {
			icon: "width",
			size: "xs",
			label: e("Fluid Size"),
			title: void 0,
			"aria-pressed": !!m,
			active: !!m,
			onClick: () => a(m ? D(m.max, m.unit) : k({
				min: Math.max((h ?? 16) * .75, 1),
				max: h ?? 16,
				from: 360,
				to: 1280,
				unit: /px$/.test(p) ? "px" : "rem"
			}))
		})
	});
	return m ? /* @__PURE__ */ f("div", {
		className: "flex min-w-0 flex-1 items-center gap-1",
		children: [/* @__PURE__ */ d(s, {
			open: g,
			onOpenChange: _,
			align: "start",
			className: "w-64 !p-3",
			trigger: /* @__PURE__ */ d(x, {
				id: u(t),
				disabled: l,
				label: t.label,
				children: /* @__PURE__ */ f("span", {
					className: "font-mono tabular-nums",
					children: [
						A(m.min),
						" → ",
						A(m.max),
						"px"
					]
				})
			}),
			children: /* @__PURE__ */ f("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ f("div", {
					className: "grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ d(i, {
						bare: !0,
						fields: [{
							handle: "min",
							type: "text",
							component: "blocks-value",
							label: e("Smallest"),
							unit: "px",
							units: ["px", "rem"],
							step: 1,
							min: 0,
							size: "sm"
						}],
						values: { min: `${A(m.min)}px` },
						onChange: (e, t) => {
							let n = S(t);
							n !== null && b({ min: n });
						}
					}), /* @__PURE__ */ d(i, {
						bare: !0,
						fields: [{
							handle: "max",
							type: "text",
							component: "blocks-value",
							label: e("Largest"),
							unit: "px",
							units: ["px", "rem"],
							step: 1,
							min: 0,
							size: "sm"
						}],
						values: { max: `${A(m.max)}px` },
						onChange: (e, t) => {
							let n = S(t);
							n !== null && b({ max: n });
						}
					})]
				}), /* @__PURE__ */ f("div", {
					className: "grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ d(i, {
						bare: !0,
						fields: [{
							handle: "from",
							type: "text",
							component: "blocks-value",
							label: e("From Screen"),
							unit: "px",
							units: ["px"],
							step: 10,
							min: 0,
							size: "sm"
						}],
						values: { from: `${Math.round(m.from)}px` },
						onChange: (e, t) => {
							let n = S(t);
							n !== null && n < m.to && b({ from: n });
						}
					}), /* @__PURE__ */ d(i, {
						bare: !0,
						fields: [{
							handle: "to",
							type: "text",
							component: "blocks-value",
							label: e("To Screen"),
							unit: "px",
							units: ["px"],
							step: 10,
							min: 0,
							size: "sm"
						}],
						values: { to: `${Math.round(m.to)}px` },
						onChange: (e, t) => {
							let n = S(t);
							n !== null && n > m.from && b({ to: n });
						}
					})]
				})]
			})
		}), C]
	}) : /* @__PURE__ */ f("div", {
		className: "flex min-w-0 flex-1 items-center gap-1",
		children: [h === null && p !== "" ? /* @__PURE__ */ d(i, {
			bare: !0,
			className: "flex min-w-0 flex-1",
			disabled: l,
			fields: [{
				handle: t.handle,
				type: "text",
				label: t.label,
				size: "sm",
				mono: !0
			}],
			values: { [t.handle]: p },
			onChange: (e, t) => t && a(String(t))
		}) : /* @__PURE__ */ d(i, {
			bare: !0,
			className: "flex min-w-0 flex-1",
			disabled: l,
			fields: [y],
			values: { [t.handle]: p || null },
			onChange: (e, t) => t && a(String(t))
		}), C]
	});
}
export { v as a, h as i, w as n, g as o, j as r, y as s, b as t };
