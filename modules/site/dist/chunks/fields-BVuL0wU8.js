import { registry as e, t } from "@letterncms/sdk";
import { forwardRef as n, useState as r } from "react";
import { Button as i, Fields as a, Icon as o, IconButton as s, Input as c, Popover as l, Tooltip as u, cn as d, fieldControlId as f } from "@letterncms/ui";
import { Fragment as p, jsx as m, jsxs as h } from "react/jsx-runtime";
// admin/src/fields.tsx
function g({ field: t, value: n, onChange: r, disabled: i }) {
	let a = e.fields.get("blocks-value");
	return a ? /* @__PURE__ */ m(a, {
		field: {
			...t,
			component: "blocks-value"
		},
		value: n,
		onChange: (e) => r(e == null ? null : String(e)),
		disabled: i,
		context: {}
	}) : /* @__PURE__ */ m(c, {
		id: f(t),
		size: "sm",
		className: "min-w-0 flex-1 font-mono",
		"aria-label": t.label,
		placeholder: t.placeholder,
		value: String(n ?? ""),
		disabled: i,
		onChange: (e) => r(e.target.value)
	});
}
function _({ field: e, value: n, onChange: r, disabled: i }) {
	let a = !!n && typeof n == "object" && "min" in n, c = (e) => e.match(/[a-z%]+$/i)?.[0] ?? "", l = a && c(String(n.min)) === c(String(n.max)), d = (t, n) => ({
		...e,
		handle: `${e.handle}-${t}`,
		label: n,
		unit: "rem",
		units: t === "min" && l ? [] : [
			"rem",
			"px",
			"em",
			"%",
			"vw"
		],
		step: .125
	});
	return /* @__PURE__ */ h("div", {
		className: "flex min-w-0 flex-1 items-center gap-1",
		children: [a ? /* @__PURE__ */ h(p, { children: [
			/* @__PURE__ */ m("div", {
				className: "min-w-0 flex-1",
				title: t("Phone"),
				children: /* @__PURE__ */ m(g, {
					field: d("min", t("Phone")),
					value: n.min,
					disabled: i,
					onChange: (e) => r({
						...n,
						min: e ?? "0"
					})
				})
			}),
			/* @__PURE__ */ m(o, {
				name: "arrow-right",
				size: 10,
				className: "shrink-0 text-faint"
			}),
			/* @__PURE__ */ m("div", {
				className: "min-w-0 flex-1",
				title: t("Desktop"),
				children: /* @__PURE__ */ m(g, {
					field: d("max", t("Desktop")),
					value: n.max,
					disabled: i,
					onChange: (e) => r({
						...n,
						max: e ?? "0"
					})
				})
			})
		] }) : /* @__PURE__ */ m("div", {
			className: "min-w-0 flex-1",
			children: /* @__PURE__ */ m(g, {
				field: {
					...e,
					unit: "rem",
					units: [
						"rem",
						"px",
						"em",
						"%",
						"vw"
					],
					step: .125
				},
				value: n ?? null,
				disabled: i,
				onChange: (e) => r(e ?? "0")
			})
		}), /* @__PURE__ */ m(u, {
			content: t(a ? "Use One Size" : "Scale from Phone to Desktop"),
			children: /* @__PURE__ */ m(s, {
				icon: "width",
				label: t("Fluid"),
				size: "sm",
				active: a,
				disabled: i,
				onClick: () => r(a ? n.max : {
					min: String(n ?? ""),
					max: String(n ?? "")
				})
			})
		})]
	});
}
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
	return Array.isArray(e) ? e.map(String) : String(e ?? "").split(",").map((e) => e.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
}
function S(e, t) {
	let n = x(e);
	return [...n[0] && !y.has(n[0]) ? [n[0]] : [], ...v[t]];
}
function C({ field: e, value: n, onChange: a, disabled: c }) {
	let [u, d] = r(!1), p = x(n), g = p[0] && !y.has(p[0]) ? p[0] : "", _ = b(p), S = e.fonts ?? [], C = (e) => a([...e ? [e] : [], ...v[_]]), w = async (t) => {
		d(!1);
		let n = await e.onAdd?.(t);
		n && C(n);
	}, T = (e, t, n, r) => /* @__PURE__ */ h("div", {
		className: "group/font flex items-center gap-1 rounded-sm pr-1 hover:bg-hover",
		children: [/* @__PURE__ */ h(i, {
			variant: "ghost",
			onClick: () => {
				C(e), d(!1);
			},
			className: "!h-9 min-w-0 flex-1 shrink !justify-start !gap-2 !bg-transparent !pl-2 !pr-0 text-left !font-normal",
			children: [/* @__PURE__ */ m("span", {
				className: "min-w-0 flex-1 truncate text-base leading-tight text-ink",
				style: e ? { fontFamily: `"${e}"` } : void 0,
				children: t
			}), n && /* @__PURE__ */ m("span", {
				className: "shrink-0 text-2xs tabular-nums text-faint",
				children: n
			})]
		}), /* @__PURE__ */ m("span", {
			className: "grid w-5 shrink-0 place-items-center",
			children: e === g ? /* @__PURE__ */ m(o, {
				name: "check",
				size: 14,
				className: "text-ink"
			}) : r
		})]
	}, e || "system"), E = (e, t, n) => /* @__PURE__ */ h(i, {
		variant: "ghost",
		size: "md",
		onClick: n,
		className: "w-full !justify-start !gap-2 !rounded-sm !px-2 text-left !text-xs !font-normal",
		children: [/* @__PURE__ */ m(o, {
			name: e,
			size: 14,
			className: "shrink-0 text-faint"
		}), t]
	});
	return /* @__PURE__ */ h(l, {
		open: u,
		onOpenChange: d,
		align: "end",
		className: "w-72 !p-1.5",
		trigger: /* @__PURE__ */ h(i, {
			variant: "ghost",
			id: f(e),
			disabled: c,
			className: "cms-input w-full min-w-0 shrink !justify-start !gap-2 !pl-2 !pr-1.5 text-left !font-normal",
			children: [/* @__PURE__ */ m("span", {
				className: "min-w-0 flex-1 truncate",
				style: g ? { fontFamily: `"${g}"` } : void 0,
				children: g || t("System Font")
			}), /* @__PURE__ */ m(o, {
				name: "chevrons-up-down",
				size: 14,
				className: "shrink-0 text-faint"
			})]
		}),
		children: [/* @__PURE__ */ h("div", {
			className: "max-h-72 overflow-y-auto",
			children: [T("", t("System Font"), ""), S.map((n) => T(n.family, n.family, n.styles, !n.used && /* @__PURE__ */ m(s, {
				icon: "trash",
				label: t("Remove {family}", { family: n.family }),
				size: "xs",
				className: "opacity-0 focus-visible:opacity-100 group-hover/font:opacity-100",
				onClick: () => e.onRemove?.(n.family)
			})))]
		}), /* @__PURE__ */ h("div", {
			className: "mt-1 border-t border-border pt-1",
			children: [E("search", t("Add a Google Font…"), () => void w("google")), E("upload", t("Upload a .woff2 File…"), () => void w("upload"))]
		})]
	});
}
function w({ field: e, onChange: n, disabled: i }) {
	let [a, s] = r(!1);
	return /* @__PURE__ */ h("label", {
		onDragOver: (e) => {
			e.preventDefault(), s(!0);
		},
		onDragLeave: () => s(!1),
		onDrop: (e) => {
			e.preventDefault(), s(!1);
			let t = e.dataTransfer.files?.[0];
			t && !i && n(t);
		},
		className: d("flex h-14 cursor-pointer items-center justify-center gap-2 rounded-sm border border-dashed text-xs text-muted transition-colors hover:bg-hover hover:text-text", a ? "border-focus bg-hover" : "border-border-strong"),
		children: [
			/* @__PURE__ */ m(o, {
				name: "upload",
				size: 14
			}),
			e.placeholder ?? t("Choose a File"),
			/* @__PURE__ */ m("input", {
				id: f(e),
				type: "file",
				accept: e.accept,
				disabled: i,
				className: "hidden",
				onChange: (e) => {
					e.target.files?.[0] && n(e.target.files[0]), e.target.value = "";
				}
			})
		]
	});
}
var T = n(function({ label: e, children: t, className: n, ...r }, a) {
	return /* @__PURE__ */ h(i, {
		ref: a,
		variant: "ghost",
		"aria-label": e,
		...r,
		className: d("cms-input w-full min-w-0 shrink !justify-start !gap-1.5 !pl-2 !pr-1.5 text-left !font-normal data-[popup-open]:border-focus", n),
		children: [/* @__PURE__ */ m("span", {
			className: "min-w-0 flex-1 truncate",
			children: t
		}), /* @__PURE__ */ m(o, {
			name: "chevrons-up-down",
			size: 11,
			className: "shrink-0 text-faint"
		})]
	});
}), E = {
	handle: "shadow",
	type: "text",
	component: "blocks-shadows",
	label: "Shadow"
}, D = () => [
	{
		label: t("None"),
		value: "none"
	},
	{
		label: t("Small"),
		value: "0 1px 2px rgb(0 0 0 / 0.06)"
	},
	{
		label: t("Medium"),
		value: "0 4px 16px -4px rgb(0 0 0 / 0.12)"
	},
	{
		label: t("Large"),
		value: "0 24px 48px -16px rgb(0 0 0 / 0.2)"
	}
], O = ({ value: e }) => /* @__PURE__ */ m("span", {
	className: "size-3.5 shrink-0 rounded-xs border border-border bg-bg",
	style: { boxShadow: e ?? void 0 }
});
function k({ field: e, value: n, onChange: r, disabled: s }) {
	let c = D().find((e) => e.value === n?.replace(/\s+/g, " ").trim());
	return /* @__PURE__ */ h(l, {
		align: "start",
		className: "w-72 p-1",
		trigger: /* @__PURE__ */ m(T, {
			id: f(e),
			disabled: s,
			label: e.label,
			children: c?.label ?? t("Custom||shadow")
		}),
		children: [/* @__PURE__ */ m("div", {
			className: "space-y-px",
			children: D().map((e) => /* @__PURE__ */ h(i, {
				variant: "ghost",
				onClick: () => r(e.value),
				"data-active": e.value === c?.value || void 0,
				className: "w-full !justify-start !gap-2 !rounded-xs !px-2 text-left !text-xs !font-normal",
				children: [
					/* @__PURE__ */ m(O, { value: e.value }),
					/* @__PURE__ */ m("span", {
						className: "flex-1",
						children: e.label
					}),
					e.value === c?.value && /* @__PURE__ */ m(o, {
						name: "check",
						size: 12,
						className: "text-muted"
					})
				]
			}, e.value))
		}), /* @__PURE__ */ h("div", {
			className: "mt-1 border-t border-border px-1 pb-1 pt-2",
			children: [
				/* @__PURE__ */ m("p", {
					className: "m-0 mb-1 text-2xs font-medium text-muted",
					children: t("Custom||shadow")
				}),
				/* @__PURE__ */ m(a, {
					bare: !0,
					fields: [E],
					values: { shadow: n && n !== "none" ? n : "0 4px 16px 0 rgb(0 0 0 / 12%)" },
					onChange: (e, t) => r(t ?? "none")
				}),
				/* @__PURE__ */ h(i, {
					variant: "ghost",
					size: "xs",
					onClick: () => r(`${n && n !== "none" ? `${n}, ` : ""}0 2px 8px 0 rgb(0 0 0 / 10%)`),
					className: "mt-1.5 w-full !text-2xs !font-normal !text-muted hover:!text-text",
					children: [/* @__PURE__ */ m(o, {
						name: "plus",
						size: 11
					}), t("Add Layer")]
				})
			]
		})]
	});
}
export { b as a, _ as i, C as n, x as o, k as r, S as s, w as t };
