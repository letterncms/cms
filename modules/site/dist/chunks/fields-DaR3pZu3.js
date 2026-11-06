import { registry as e, t } from "@letterncms/sdk";
import { forwardRef as n, useEffect as r, useState as i } from "react";
import { Fields as a, Icon as o, IconButton as s, Input as c, Popover as l, Tooltip as u, cn as d, fieldControlId as f } from "@letterncms/ui";
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
function C({ field: e, value: n, onChange: r, disabled: a }) {
	let [c, u] = i(!1), d = x(n), p = d[0] && !y.has(d[0]) ? d[0] : "", g = b(d), _ = e.fonts ?? [], S = (e) => r([...e ? [e] : [], ...v[g]]), C = async (t) => {
		u(!1);
		let n = await e.onAdd?.(t);
		n && S(n);
	}, w = (e, t, n, r) => /* @__PURE__ */ h("div", {
		className: "group/font flex items-center gap-1 rounded-sm pr-1 hover:bg-hover",
		children: [/* @__PURE__ */ h("button", {
			type: "button",
			onClick: () => {
				S(e), u(!1);
			},
			className: "flex min-h-9 min-w-0 flex-1 items-center gap-2 pl-2 text-left",
			children: [/* @__PURE__ */ m("span", {
				className: "min-w-0 flex-1 truncate text-[15px] leading-tight text-ink",
				style: e ? { fontFamily: `"${e}"` } : void 0,
				children: t
			}), n && /* @__PURE__ */ m("span", {
				className: "shrink-0 text-2xs tabular-nums text-faint",
				children: n
			})]
		}), /* @__PURE__ */ m("span", {
			className: "grid w-5 shrink-0 place-items-center",
			children: e === p ? /* @__PURE__ */ m(o, {
				name: "check",
				size: 14,
				className: "text-ink"
			}) : r
		})]
	}, e || "system"), T = (e, t, n) => /* @__PURE__ */ h("button", {
		type: "button",
		onClick: n,
		className: "flex h-8 w-full items-center gap-2 rounded-sm px-2 text-left text-xs text-text hover:bg-hover hover:text-ink",
		children: [/* @__PURE__ */ m(o, {
			name: e,
			size: 14,
			className: "shrink-0 text-faint"
		}), t]
	});
	return /* @__PURE__ */ h(l, {
		open: c,
		onOpenChange: u,
		align: "end",
		className: "w-72 !p-1.5",
		trigger: /* @__PURE__ */ h("button", {
			type: "button",
			id: f(e),
			disabled: a,
			className: "cms-input flex h-7 w-full min-w-0 items-center gap-2 rounded-sm pl-2 pr-1.5 text-left text-sm",
			children: [/* @__PURE__ */ m("span", {
				className: "min-w-0 flex-1 truncate",
				style: p ? { fontFamily: `"${p}"` } : void 0,
				children: p || t("System Font")
			}), /* @__PURE__ */ m(o, {
				name: "chevrons-up-down",
				size: 14,
				className: "shrink-0 text-faint"
			})]
		}),
		children: [/* @__PURE__ */ h("div", {
			className: "max-h-72 overflow-y-auto",
			children: [w("", t("System Font"), ""), _.map((n) => w(n.family, n.family, n.styles, !n.used && /* @__PURE__ */ m(s, {
				icon: "trash",
				label: t("Remove {family}", { family: n.family }),
				size: "xs",
				className: "opacity-0 focus-visible:opacity-100 group-hover/font:opacity-100",
				onClick: () => e.onRemove?.(n.family)
			})))]
		}), /* @__PURE__ */ h("div", {
			className: "mt-1 border-t border-border pt-1",
			children: [T("search", t("Add a Google Font…"), () => void C("google")), T("upload", t("Upload a .woff2 File…"), () => void C("upload"))]
		})]
	});
}
var w = [
	"color",
	"backgroundColor",
	"fontFamily",
	"fontSize",
	"fontWeight",
	"fontStyle",
	"lineHeight",
	"letterSpacing",
	"textTransform",
	"textDecoration",
	"textUnderlineOffset",
	"textWrap",
	"marginBlock",
	"marginBlockStart",
	"marginBlockEnd",
	"padding",
	"paddingInline",
	"paddingBlock",
	"border",
	"borderColor",
	"borderWidth",
	"borderRadius",
	"boxShadow",
	"opacity",
	"transition"
];
function T({ field: e, value: n, onChange: r, disabled: a }) {
	let l = n ?? {}, [u, f] = i(!1), p = `site-decl-${e.handle.replace(/[^a-z0-9-]/gi, "-")}`, g = e.tokens ?? [], _ = (e, t) => {
		!t || t === e || t in l || r(Object.fromEntries(Object.entries(l).map(([n, r]) => n === e ? [t, r] : [n, r])));
	};
	return /* @__PURE__ */ h("div", {
		className: "cms-declarations group/decl py-2",
		children: [
			/* @__PURE__ */ h("div", {
				className: "flex h-6 items-center gap-1",
				children: [
					/* @__PURE__ */ m("span", {
						className: d("min-w-0 flex-1 truncate text-xs font-medium text-ink", e.mono !== !1 && "font-mono"),
						children: e.label
					}),
					/* @__PURE__ */ m(s, {
						icon: "plus",
						label: t("Add Property"),
						size: "xs",
						disabled: a,
						onClick: () => f(!0)
					}),
					e.removable === !0 && /* @__PURE__ */ m(s, {
						icon: "trash",
						label: t("Remove"),
						size: "xs",
						disabled: a,
						className: "opacity-0 group-hover/decl:opacity-100 focus-visible:opacity-100",
						onClick: () => r(null)
					})
				]
			}),
			/* @__PURE__ */ m("datalist", {
				id: `${p}-props`,
				children: w.filter((e) => !(e in l)).map((e) => /* @__PURE__ */ m("option", { value: e }, e))
			}),
			/* @__PURE__ */ m("datalist", {
				id: `${p}-values`,
				children: g.map((e) => /* @__PURE__ */ m("option", { value: e }, e))
			}),
			/* @__PURE__ */ h("div", {
				className: "mt-1 space-y-1",
				children: [Object.entries(l).map(([e, n]) => /* @__PURE__ */ h("div", {
					className: "group/row grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_20px] items-center gap-1",
					children: [
						/* @__PURE__ */ m(E, {
							value: e,
							list: `${p}-props`,
							disabled: a,
							onCommit: (t) => _(e, t)
						}),
						/* @__PURE__ */ m(c, {
							size: "xs",
							className: "font-mono",
							spellCheck: !1,
							list: `${p}-values`,
							"aria-label": t("{property} value", { property: e }),
							value: String(n),
							disabled: a,
							onChange: (t) => r({
								...l,
								[e]: t.target.value
							})
						}),
						/* @__PURE__ */ m("button", {
							type: "button",
							disabled: a,
							onClick: () => r(Object.fromEntries(Object.entries(l).filter(([t]) => t !== e))),
							className: "grid size-5 place-items-center rounded-xs text-faint opacity-0 hover:bg-hover hover:text-text group-hover/row:opacity-100 focus-visible:opacity-100",
							"aria-label": t("Remove {property}", { property: e }),
							children: /* @__PURE__ */ m(o, {
								name: "close",
								size: 10
							})
						})
					]
				}, e)), u && /* @__PURE__ */ m("div", {
					className: "grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_20px] items-center gap-1",
					children: /* @__PURE__ */ m(E, {
						value: "",
						autoFocus: !0,
						list: `${p}-props`,
						disabled: a,
						onCommit: (e) => {
							f(!1), e && !(e in l) && r({
								...l,
								[e]: ""
							});
						}
					})
				})]
			})
		]
	});
}
function E({ value: e, list: n, disabled: a, autoFocus: o, onCommit: s }) {
	let [l, u] = i(e);
	return r(() => u(e), [e]), /* @__PURE__ */ m(c, {
		size: "xs",
		className: "font-mono",
		spellCheck: !1,
		autoFocus: o,
		list: n,
		placeholder: t("property"),
		"aria-label": t("Property"),
		value: l,
		disabled: a,
		onChange: (e) => u(e.target.value),
		onBlur: () => s(l.trim()),
		onKeyDown: (t) => {
			t.key === "Enter" && t.target.blur(), t.key === "Escape" && (u(e), e || s(""));
		}
	});
}
function D({ field: e, onChange: n, disabled: r }) {
	let [a, s] = i(!1);
	return /* @__PURE__ */ h("label", {
		onDragOver: (e) => {
			e.preventDefault(), s(!0);
		},
		onDragLeave: () => s(!1),
		onDrop: (e) => {
			e.preventDefault(), s(!1);
			let t = e.dataTransfer.files?.[0];
			t && !r && n(t);
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
				disabled: r,
				className: "hidden",
				onChange: (e) => {
					e.target.files?.[0] && n(e.target.files[0]), e.target.value = "";
				}
			})
		]
	});
}
var O = n(function({ label: e, children: t, className: n, ...r }, i) {
	return /* @__PURE__ */ h("button", {
		ref: i,
		type: "button",
		"aria-label": e,
		...r,
		className: d("cms-input flex h-7 w-full min-w-0 items-center gap-1.5 rounded-sm pl-2 pr-1.5 text-left text-sm text-text transition-[border-color,box-shadow] duration-120 hover:bg-hover data-[popup-open]:border-focus disabled:opacity-50", n),
		children: [/* @__PURE__ */ m("span", {
			className: "min-w-0 flex-1 truncate",
			children: t
		}), /* @__PURE__ */ m(o, {
			name: "chevrons-up-down",
			size: 11,
			className: "shrink-0 text-faint"
		})]
	});
}), k = {
	handle: "shadow",
	type: "text",
	component: "blocks-shadows",
	label: "Shadow"
}, A = () => [
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
], j = ({ value: e }) => /* @__PURE__ */ m("span", {
	className: "size-3.5 shrink-0 rounded-[3px] border border-border bg-bg",
	style: { boxShadow: e ?? void 0 }
});
function M({ field: e, value: n, onChange: r, disabled: i }) {
	let s = A().find((e) => e.value === n?.replace(/\s+/g, " ").trim());
	return /* @__PURE__ */ h(l, {
		align: "start",
		className: "w-72 p-1",
		trigger: /* @__PURE__ */ m(O, {
			id: f(e),
			disabled: i,
			label: e.label,
			children: s?.label ?? t("Custom")
		}),
		children: [/* @__PURE__ */ m("div", {
			className: "space-y-px",
			children: A().map((e) => /* @__PURE__ */ h("button", {
				type: "button",
				onClick: () => r(e.value),
				className: d("flex h-7 w-full items-center gap-2 rounded-xs px-2 text-left text-xs transition-colors", e.value === s?.value ? "bg-active text-ink" : "text-text hover:bg-hover"),
				children: [
					/* @__PURE__ */ m(j, { value: e.value }),
					/* @__PURE__ */ m("span", {
						className: "flex-1",
						children: e.label
					}),
					e.value === s?.value && /* @__PURE__ */ m(o, {
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
					children: t("Custom")
				}),
				/* @__PURE__ */ m(a, {
					bare: !0,
					fields: [k],
					values: { shadow: n && n !== "none" ? n : "0 4px 16px 0 rgb(0 0 0 / 12%)" },
					onChange: (e, t) => r(t ?? "none")
				}),
				/* @__PURE__ */ h("button", {
					type: "button",
					onClick: () => r(`${n && n !== "none" ? `${n}, ` : ""}0 2px 8px 0 rgb(0 0 0 / 10%)`),
					className: "mt-1.5 flex h-6 w-full items-center justify-center gap-1 rounded-xs text-2xs text-muted hover:bg-hover hover:text-text",
					children: [/* @__PURE__ */ m(o, {
						name: "plus",
						size: 11
					}), t("Add Layer")]
				})
			]
		})]
	});
}
export { _ as a, S as c, M as i, D as n, b as o, C as r, x as s, T as t };
