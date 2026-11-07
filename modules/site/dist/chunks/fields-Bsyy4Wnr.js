import { registry as e, t } from "@letterncms/sdk";
import { forwardRef as n, useState as r } from "react";
import { Fields as i, Icon as a, IconButton as o, Input as s, Popover as c, Tooltip as l, cn as u, fieldControlId as d } from "@letterncms/ui";
import { Fragment as f, jsx as p, jsxs as m } from "react/jsx-runtime";
// admin/src/fields.tsx
function h({ field: t, value: n, onChange: r, disabled: i }) {
	let a = e.fields.get("blocks-value");
	return a ? /* @__PURE__ */ p(a, {
		field: {
			...t,
			component: "blocks-value"
		},
		value: n,
		onChange: (e) => r(e == null ? null : String(e)),
		disabled: i,
		context: {}
	}) : /* @__PURE__ */ p(s, {
		id: d(t),
		size: "sm",
		className: "min-w-0 flex-1 font-mono",
		"aria-label": t.label,
		placeholder: t.placeholder,
		value: String(n ?? ""),
		disabled: i,
		onChange: (e) => r(e.target.value)
	});
}
function g({ field: e, value: n, onChange: r, disabled: i }) {
	let s = !!n && typeof n == "object" && "min" in n, c = (e) => e.match(/[a-z%]+$/i)?.[0] ?? "", u = s && c(String(n.min)) === c(String(n.max)), d = (t, n) => ({
		...e,
		handle: `${e.handle}-${t}`,
		label: n,
		unit: "rem",
		units: t === "min" && u ? [] : [
			"rem",
			"px",
			"em",
			"%",
			"vw"
		],
		step: .125
	});
	return /* @__PURE__ */ m("div", {
		className: "flex min-w-0 flex-1 items-center gap-1",
		children: [s ? /* @__PURE__ */ m(f, { children: [
			/* @__PURE__ */ p("div", {
				className: "min-w-0 flex-1",
				title: t("Phone"),
				children: /* @__PURE__ */ p(h, {
					field: d("min", t("Phone")),
					value: n.min,
					disabled: i,
					onChange: (e) => r({
						...n,
						min: e ?? "0"
					})
				})
			}),
			/* @__PURE__ */ p(a, {
				name: "arrow-right",
				size: 10,
				className: "shrink-0 text-faint"
			}),
			/* @__PURE__ */ p("div", {
				className: "min-w-0 flex-1",
				title: t("Desktop"),
				children: /* @__PURE__ */ p(h, {
					field: d("max", t("Desktop")),
					value: n.max,
					disabled: i,
					onChange: (e) => r({
						...n,
						max: e ?? "0"
					})
				})
			})
		] }) : /* @__PURE__ */ p("div", {
			className: "min-w-0 flex-1",
			children: /* @__PURE__ */ p(h, {
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
		}), /* @__PURE__ */ p(l, {
			content: t(s ? "Use One Size" : "Scale from Phone to Desktop"),
			children: /* @__PURE__ */ p(o, {
				icon: "width",
				label: t("Fluid"),
				size: "sm",
				active: s,
				disabled: i,
				onClick: () => r(s ? n.max : {
					min: String(n ?? ""),
					max: String(n ?? "")
				})
			})
		})]
	});
}
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
	return Array.isArray(e) ? e.map(String) : String(e ?? "").split(",").map((e) => e.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
}
function x(e, t) {
	let n = b(e);
	return [...n[0] && !v.has(n[0]) ? [n[0]] : [], ..._[t]];
}
function S({ field: e, value: n, onChange: i, disabled: s }) {
	let [l, u] = r(!1), f = b(n), h = f[0] && !v.has(f[0]) ? f[0] : "", g = y(f), x = e.fonts ?? [], S = (e) => i([...e ? [e] : [], ..._[g]]), C = async (t) => {
		u(!1);
		let n = await e.onAdd?.(t);
		n && S(n);
	}, w = (e, t, n, r) => /* @__PURE__ */ m("div", {
		className: "group/font flex items-center gap-1 rounded-sm pr-1 hover:bg-hover",
		children: [/* @__PURE__ */ m("button", {
			type: "button",
			onClick: () => {
				S(e), u(!1);
			},
			className: "flex min-h-9 min-w-0 flex-1 items-center gap-2 pl-2 text-left",
			children: [/* @__PURE__ */ p("span", {
				className: "min-w-0 flex-1 truncate text-[15px] leading-tight text-ink",
				style: e ? { fontFamily: `"${e}"` } : void 0,
				children: t
			}), n && /* @__PURE__ */ p("span", {
				className: "shrink-0 text-2xs tabular-nums text-faint",
				children: n
			})]
		}), /* @__PURE__ */ p("span", {
			className: "grid w-5 shrink-0 place-items-center",
			children: e === h ? /* @__PURE__ */ p(a, {
				name: "check",
				size: 14,
				className: "text-ink"
			}) : r
		})]
	}, e || "system"), T = (e, t, n) => /* @__PURE__ */ m("button", {
		type: "button",
		onClick: n,
		className: "flex h-8 w-full items-center gap-2 rounded-sm px-2 text-left text-xs text-text hover:bg-hover hover:text-ink",
		children: [/* @__PURE__ */ p(a, {
			name: e,
			size: 14,
			className: "shrink-0 text-faint"
		}), t]
	});
	return /* @__PURE__ */ m(c, {
		open: l,
		onOpenChange: u,
		align: "end",
		className: "w-72 !p-1.5",
		trigger: /* @__PURE__ */ m("button", {
			type: "button",
			id: d(e),
			disabled: s,
			className: "cms-input flex h-7 w-full min-w-0 items-center gap-2 rounded-sm pl-2 pr-1.5 text-left text-sm",
			children: [/* @__PURE__ */ p("span", {
				className: "min-w-0 flex-1 truncate",
				style: h ? { fontFamily: `"${h}"` } : void 0,
				children: h || t("System Font")
			}), /* @__PURE__ */ p(a, {
				name: "chevrons-up-down",
				size: 14,
				className: "shrink-0 text-faint"
			})]
		}),
		children: [/* @__PURE__ */ m("div", {
			className: "max-h-72 overflow-y-auto",
			children: [w("", t("System Font"), ""), x.map((n) => w(n.family, n.family, n.styles, !n.used && /* @__PURE__ */ p(o, {
				icon: "trash",
				label: t("Remove {family}", { family: n.family }),
				size: "xs",
				className: "opacity-0 focus-visible:opacity-100 group-hover/font:opacity-100",
				onClick: () => e.onRemove?.(n.family)
			})))]
		}), /* @__PURE__ */ m("div", {
			className: "mt-1 border-t border-border pt-1",
			children: [T("search", t("Add a Google Font…"), () => void C("google")), T("upload", t("Upload a .woff2 File…"), () => void C("upload"))]
		})]
	});
}
function C({ field: e, onChange: n, disabled: i }) {
	let [o, s] = r(!1);
	return /* @__PURE__ */ m("label", {
		onDragOver: (e) => {
			e.preventDefault(), s(!0);
		},
		onDragLeave: () => s(!1),
		onDrop: (e) => {
			e.preventDefault(), s(!1);
			let t = e.dataTransfer.files?.[0];
			t && !i && n(t);
		},
		className: u("flex h-14 cursor-pointer items-center justify-center gap-2 rounded-sm border border-dashed text-xs text-muted transition-colors hover:bg-hover hover:text-text", o ? "border-focus bg-hover" : "border-border-strong"),
		children: [
			/* @__PURE__ */ p(a, {
				name: "upload",
				size: 14
			}),
			e.placeholder ?? t("Choose a File"),
			/* @__PURE__ */ p("input", {
				id: d(e),
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
var w = n(function({ label: e, children: t, className: n, ...r }, i) {
	return /* @__PURE__ */ m("button", {
		ref: i,
		type: "button",
		"aria-label": e,
		...r,
		className: u("cms-input flex h-7 w-full min-w-0 items-center gap-1.5 rounded-sm pl-2 pr-1.5 text-left text-sm text-text transition-[border-color,box-shadow] duration-120 hover:bg-hover data-[popup-open]:border-focus disabled:opacity-50", n),
		children: [/* @__PURE__ */ p("span", {
			className: "min-w-0 flex-1 truncate",
			children: t
		}), /* @__PURE__ */ p(a, {
			name: "chevrons-up-down",
			size: 11,
			className: "shrink-0 text-faint"
		})]
	});
}), T = {
	handle: "shadow",
	type: "text",
	component: "blocks-shadows",
	label: "Shadow"
}, E = () => [
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
], D = ({ value: e }) => /* @__PURE__ */ p("span", {
	className: "size-3.5 shrink-0 rounded-[3px] border border-border bg-bg",
	style: { boxShadow: e ?? void 0 }
});
function O({ field: e, value: n, onChange: r, disabled: o }) {
	let s = E().find((e) => e.value === n?.replace(/\s+/g, " ").trim());
	return /* @__PURE__ */ m(c, {
		align: "start",
		className: "w-72 p-1",
		trigger: /* @__PURE__ */ p(w, {
			id: d(e),
			disabled: o,
			label: e.label,
			children: s?.label ?? t("Custom")
		}),
		children: [/* @__PURE__ */ p("div", {
			className: "space-y-px",
			children: E().map((e) => /* @__PURE__ */ m("button", {
				type: "button",
				onClick: () => r(e.value),
				className: u("flex h-7 w-full items-center gap-2 rounded-xs px-2 text-left text-xs transition-colors", e.value === s?.value ? "bg-active text-ink" : "text-text hover:bg-hover"),
				children: [
					/* @__PURE__ */ p(D, { value: e.value }),
					/* @__PURE__ */ p("span", {
						className: "flex-1",
						children: e.label
					}),
					e.value === s?.value && /* @__PURE__ */ p(a, {
						name: "check",
						size: 12,
						className: "text-muted"
					})
				]
			}, e.value))
		}), /* @__PURE__ */ m("div", {
			className: "mt-1 border-t border-border px-1 pb-1 pt-2",
			children: [
				/* @__PURE__ */ p("p", {
					className: "m-0 mb-1 text-2xs font-medium text-muted",
					children: t("Custom")
				}),
				/* @__PURE__ */ p(i, {
					bare: !0,
					fields: [T],
					values: { shadow: n && n !== "none" ? n : "0 4px 16px 0 rgb(0 0 0 / 12%)" },
					onChange: (e, t) => r(t ?? "none")
				}),
				/* @__PURE__ */ m("button", {
					type: "button",
					onClick: () => r(`${n && n !== "none" ? `${n}, ` : ""}0 2px 8px 0 rgb(0 0 0 / 10%)`),
					className: "mt-1.5 flex h-6 w-full items-center justify-center gap-1 rounded-xs text-2xs text-muted hover:bg-hover hover:text-text",
					children: [/* @__PURE__ */ p(a, {
						name: "plus",
						size: 11
					}), t("Add Layer")]
				})
			]
		})]
	});
}
export { y as a, g as i, S as n, b as o, O as r, x as s, C as t };
