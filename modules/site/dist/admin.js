import { events as e, prefetchAbility as t, registry as n, t as r } from "@letterncms/sdk";
import { Suspense as i, forwardRef as a, lazy as o, useEffect as s, useState as c } from "react";
import { Fields as l, Icon as u, IconButton as d, Input as f, Popover as p, Select as m, Spinner as h, Tooltip as g, cn as _, fieldControlId as v } from "@letterncms/ui";
import { Fragment as y, jsx as b, jsxs as x } from "react/jsx-runtime";
// admin/src/fields.tsx
function S({ field: e, value: t, onChange: r, disabled: i }) {
	let a = n.fields.get("blocks-value");
	return a ? /* @__PURE__ */ b(a, {
		field: {
			...e,
			component: "blocks-value"
		},
		value: t,
		onChange: (e) => r(e == null ? null : String(e)),
		disabled: i,
		context: {}
	}) : /* @__PURE__ */ b(f, {
		id: v(e),
		size: "sm",
		className: "min-w-0 flex-1 font-mono",
		"aria-label": e.label,
		placeholder: e.placeholder,
		value: String(t ?? ""),
		disabled: i,
		onChange: (e) => r(e.target.value)
	});
}
function C({ field: e, value: t, onChange: n, disabled: i }) {
	let a = !!t && typeof t == "object" && "min" in t, o = (e) => e.match(/[a-z%]+$/i)?.[0] ?? "", s = a && o(String(t.min)) === o(String(t.max)), c = (t, n) => ({
		...e,
		handle: `${e.handle}-${t}`,
		label: n,
		unit: "rem",
		units: t === "min" && s ? [] : [
			"rem",
			"px",
			"em",
			"%",
			"vw"
		],
		step: .125
	});
	return /* @__PURE__ */ x("div", {
		className: "flex min-w-0 flex-1 items-center gap-1",
		children: [a ? /* @__PURE__ */ x(y, { children: [
			/* @__PURE__ */ b("div", {
				className: "min-w-0 flex-1",
				title: r("Phone"),
				children: /* @__PURE__ */ b(S, {
					field: c("min", r("Phone")),
					value: t.min,
					disabled: i,
					onChange: (e) => n({
						...t,
						min: e ?? "0"
					})
				})
			}),
			/* @__PURE__ */ b(u, {
				name: "arrow-right",
				size: 10,
				className: "shrink-0 text-faint"
			}),
			/* @__PURE__ */ b("div", {
				className: "min-w-0 flex-1",
				title: r("Desktop"),
				children: /* @__PURE__ */ b(S, {
					field: c("max", r("Desktop")),
					value: t.max,
					disabled: i,
					onChange: (e) => n({
						...t,
						max: e ?? "0"
					})
				})
			})
		] }) : /* @__PURE__ */ b("div", {
			className: "min-w-0 flex-1",
			children: /* @__PURE__ */ b(S, {
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
				value: t ?? null,
				disabled: i,
				onChange: (e) => n(e ?? "0")
			})
		}), /* @__PURE__ */ b(g, {
			content: r(a ? "Use One Size" : "Scale from Phone to Desktop"),
			children: /* @__PURE__ */ b(d, {
				icon: "width",
				label: r("Fluid"),
				size: "sm",
				active: a,
				disabled: i,
				onClick: () => n(a ? t.max : {
					min: String(t ?? ""),
					max: String(t ?? "")
				})
			})
		})]
	});
}
var w = {
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
}, T = /* @__PURE__ */ new Set([
	...Object.values(w).flat(),
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
function E(e) {
	return e.includes("monospace") ? "mono" : e.includes("serif") ? "serif" : "sans";
}
function D({ field: e, value: t, onChange: n, disabled: i }) {
	let a = Array.isArray(t) ? t : String(t ?? "").split(",").map((e) => e.trim().replace(/^["']|["']$/g, "")).filter(Boolean), o = a[0] && !T.has(a[0]) ? a[0] : "", s = E(a), c = [.../* @__PURE__ */ new Set([...e.families ?? [], ...o ? [o] : []])], l = (e, t) => n([...e ? [e] : [], ...w[t]]);
	return /* @__PURE__ */ x("div", {
		className: "flex min-w-0 flex-1 items-center gap-1",
		children: [/* @__PURE__ */ b(m, {
			id: v(e),
			size: "sm",
			className: "min-w-0 flex-[3]",
			"aria-label": r("Font"),
			disabled: i,
			value: o || "system",
			onChange: (e) => l(e === "system" || !e ? "" : e, s),
			options: [{
				value: "system",
				label: r("System")
			}, ...c.map((e) => ({
				value: e,
				label: e
			}))]
		}), /* @__PURE__ */ b(m, {
			size: "sm",
			className: "min-w-0 flex-[2]",
			"aria-label": r("Fallback"),
			disabled: i,
			value: s,
			onChange: (e) => l(o, e ?? "sans"),
			options: [
				{
					value: "sans",
					label: r("Sans")
				},
				{
					value: "serif",
					label: r("Serif")
				},
				{
					value: "mono",
					label: r("Mono")
				}
			]
		})]
	});
}
var O = [
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
function k({ field: e, value: t, onChange: n, disabled: i }) {
	let a = t ?? {}, [o, s] = c(!1), l = `site-decl-${e.handle.replace(/[^a-z0-9-]/gi, "-")}`, p = e.tokens ?? [], m = (e, t) => {
		!t || t === e || t in a || n(Object.fromEntries(Object.entries(a).map(([n, r]) => n === e ? [t, r] : [n, r])));
	};
	return /* @__PURE__ */ x("div", {
		className: "cms-declarations group/decl py-2",
		children: [
			/* @__PURE__ */ x("div", {
				className: "flex h-6 items-center gap-1",
				children: [
					/* @__PURE__ */ b("span", {
						className: _("min-w-0 flex-1 truncate text-xs font-medium text-ink", e.mono !== !1 && "font-mono"),
						children: e.label
					}),
					/* @__PURE__ */ b(d, {
						icon: "plus",
						label: r("Add Property"),
						size: "xs",
						disabled: i,
						onClick: () => s(!0)
					}),
					e.removable === !0 && /* @__PURE__ */ b(d, {
						icon: "trash",
						label: r("Remove"),
						size: "xs",
						disabled: i,
						className: "opacity-0 group-hover/decl:opacity-100 focus-visible:opacity-100",
						onClick: () => n(null)
					})
				]
			}),
			/* @__PURE__ */ b("datalist", {
				id: `${l}-props`,
				children: O.filter((e) => !(e in a)).map((e) => /* @__PURE__ */ b("option", { value: e }, e))
			}),
			/* @__PURE__ */ b("datalist", {
				id: `${l}-values`,
				children: p.map((e) => /* @__PURE__ */ b("option", { value: e }, e))
			}),
			/* @__PURE__ */ x("div", {
				className: "mt-1 space-y-1",
				children: [Object.entries(a).map(([e, t]) => /* @__PURE__ */ x("div", {
					className: "group/row grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_20px] items-center gap-1",
					children: [
						/* @__PURE__ */ b(A, {
							value: e,
							list: `${l}-props`,
							disabled: i,
							onCommit: (t) => m(e, t)
						}),
						/* @__PURE__ */ b(f, {
							size: "xs",
							className: "font-mono",
							spellCheck: !1,
							list: `${l}-values`,
							"aria-label": r("{property} value", { property: e }),
							value: String(t),
							disabled: i,
							onChange: (t) => n({
								...a,
								[e]: t.target.value
							})
						}),
						/* @__PURE__ */ b("button", {
							type: "button",
							disabled: i,
							onClick: () => n(Object.fromEntries(Object.entries(a).filter(([t]) => t !== e))),
							className: "grid size-5 place-items-center rounded-xs text-faint opacity-0 hover:bg-hover hover:text-text group-hover/row:opacity-100 focus-visible:opacity-100",
							"aria-label": r("Remove {property}", { property: e }),
							children: /* @__PURE__ */ b(u, {
								name: "close",
								size: 10
							})
						})
					]
				}, e)), o && /* @__PURE__ */ b("div", {
					className: "grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_20px] items-center gap-1",
					children: /* @__PURE__ */ b(A, {
						value: "",
						autoFocus: !0,
						list: `${l}-props`,
						disabled: i,
						onCommit: (e) => {
							s(!1), e && !(e in a) && n({
								...a,
								[e]: ""
							});
						}
					})
				})]
			})
		]
	});
}
function A({ value: e, list: t, disabled: n, autoFocus: i, onCommit: a }) {
	let [o, l] = c(e);
	return s(() => l(e), [e]), /* @__PURE__ */ b(f, {
		size: "xs",
		className: "font-mono",
		spellCheck: !1,
		autoFocus: i,
		list: t,
		placeholder: r("property"),
		"aria-label": r("Property"),
		value: o,
		disabled: n,
		onChange: (e) => l(e.target.value),
		onBlur: () => a(o.trim()),
		onKeyDown: (t) => {
			t.key === "Enter" && t.target.blur(), t.key === "Escape" && (l(e), e || a(""));
		}
	});
}
function j({ field: e, onChange: t, disabled: n }) {
	let [i, a] = c(!1);
	return /* @__PURE__ */ x("label", {
		onDragOver: (e) => {
			e.preventDefault(), a(!0);
		},
		onDragLeave: () => a(!1),
		onDrop: (e) => {
			e.preventDefault(), a(!1);
			let r = e.dataTransfer.files?.[0];
			r && !n && t(r);
		},
		className: _("flex h-14 cursor-pointer items-center justify-center gap-2 rounded-sm border border-dashed text-xs text-muted transition-colors hover:bg-hover hover:text-text", i ? "border-focus bg-hover" : "border-border-strong"),
		children: [
			/* @__PURE__ */ b(u, {
				name: "upload",
				size: 14
			}),
			e.placeholder ?? r("Choose a File"),
			/* @__PURE__ */ b("input", {
				id: v(e),
				type: "file",
				accept: e.accept,
				disabled: n,
				className: "hidden",
				onChange: (e) => {
					e.target.files?.[0] && t(e.target.files[0]), e.target.value = "";
				}
			})
		]
	});
}
var M = a(function({ label: e, children: t, className: n, ...r }, i) {
	return /* @__PURE__ */ x("button", {
		ref: i,
		type: "button",
		"aria-label": e,
		...r,
		className: _("cms-input flex h-7 w-full min-w-0 items-center gap-1.5 rounded-sm pl-2 pr-1.5 text-left text-sm text-text transition-[border-color,box-shadow] duration-120 hover:bg-hover data-[popup-open]:border-focus disabled:opacity-50", n),
		children: [/* @__PURE__ */ b("span", {
			className: "min-w-0 flex-1 truncate",
			children: t
		}), /* @__PURE__ */ b(u, {
			name: "chevrons-up-down",
			size: 11,
			className: "shrink-0 text-faint"
		})]
	});
}), N = {
	handle: "shadow",
	type: "text",
	component: "blocks-shadows",
	label: "Shadow"
}, P = () => [
	{
		label: r("None"),
		value: "none"
	},
	{
		label: r("Small"),
		value: "0 1px 2px rgb(0 0 0 / 0.06)"
	},
	{
		label: r("Medium"),
		value: "0 4px 16px -4px rgb(0 0 0 / 0.12)"
	},
	{
		label: r("Large"),
		value: "0 24px 48px -16px rgb(0 0 0 / 0.2)"
	}
], F = ({ value: e }) => /* @__PURE__ */ b("span", {
	className: "size-3.5 shrink-0 rounded-[3px] border border-border bg-bg",
	style: { boxShadow: e ?? void 0 }
});
function I({ field: e, value: t, onChange: n, disabled: i }) {
	let a = P().find((e) => e.value === t?.replace(/\s+/g, " ").trim());
	return /* @__PURE__ */ x(p, {
		align: "start",
		className: "w-72 p-1",
		trigger: /* @__PURE__ */ b(M, {
			id: v(e),
			disabled: i,
			label: e.label,
			children: a?.label ?? r("Custom")
		}),
		children: [/* @__PURE__ */ b("div", {
			className: "space-y-px",
			children: P().map((e) => /* @__PURE__ */ x("button", {
				type: "button",
				onClick: () => n(e.value),
				className: _("flex h-7 w-full items-center gap-2 rounded-xs px-2 text-left text-xs transition-colors", e.value === a?.value ? "bg-active text-ink" : "text-text hover:bg-hover"),
				children: [
					/* @__PURE__ */ b(F, { value: e.value }),
					/* @__PURE__ */ b("span", {
						className: "flex-1",
						children: e.label
					}),
					e.value === a?.value && /* @__PURE__ */ b(u, {
						name: "check",
						size: 12,
						className: "text-muted"
					})
				]
			}, e.value))
		}), /* @__PURE__ */ x("div", {
			className: "mt-1 border-t border-border px-1 pb-1 pt-2",
			children: [
				/* @__PURE__ */ b("p", {
					className: "m-0 mb-1 text-2xs font-medium text-muted",
					children: r("Custom")
				}),
				/* @__PURE__ */ b(l, {
					bare: !0,
					fields: [N],
					values: { shadow: t && t !== "none" ? t : "0 4px 16px 0 rgb(0 0 0 / 12%)" },
					onChange: (e, t) => n(t ?? "none")
				}),
				/* @__PURE__ */ x("button", {
					type: "button",
					onClick: () => n(`${t && t !== "none" ? `${t}, ` : ""}0 2px 8px 0 rgb(0 0 0 / 10%)`),
					className: "mt-1.5 flex h-6 w-full items-center justify-center gap-1 rounded-xs text-2xs text-muted hover:bg-hover hover:text-text",
					children: [/* @__PURE__ */ b(u, {
						name: "plus",
						size: 11
					}), r("Add Layer")]
				})
			]
		})]
	});
}
// admin/src/PreviewDialog.tsx
var L = o(() => import("./chunks/RenderedPreview-64rF8xvp.js").then((e) => ({ default: e.RenderedPreview })));
function R({ entry: t, content: n, collection: r }) {
	let [a, o] = c(!1);
	return s(() => e.on("entry.preview", () => o(!0)), []), a ? /* @__PURE__ */ b(i, {
		fallback: /* @__PURE__ */ b(h, {}),
		children: /* @__PURE__ */ b(L, {
			entry: t,
			collection: r.handle,
			content: n,
			onClose: () => o(!1)
		})
	}) : null;
}
// admin/src/TemplateField.tsx
function z({ field: e, value: t, onChange: n, disabled: i, error: a }) {
	let o = t ?? "", s = typeof e.fallbackHandle == "string" ? e.fallbackHandle : null, c = Object.entries(e.options ?? {}).filter(([e]) => e !== "" && (e !== s || e === o)).map(([e, t]) => ({
		value: e,
		label: t
	})), l = String(e.placeholder ?? r("Content Only")), u = o !== "" && !c.some((e) => e.value === o), d = [
		{
			value: "",
			label: l.toLowerCase() === r("Default").toLowerCase() ? r("Default") : r("Default ({template})", { template: l })
		},
		...c,
		...u ? [{
			value: o,
			label: r("Missing: {template}", { template: o })
		}] : []
	];
	return /* @__PURE__ */ b(m, {
		id: v(e),
		"aria-label": e.label,
		"aria-describedby": e.describedBy,
		valueHint: u ? r("Using {template}", { template: l }) : void 0,
		value: o,
		onChange: (e) => n(e ?? ""),
		options: d,
		disabled: i,
		invalid: !!a
	});
}
n.fields.set("site-template", z), n.fields.set("site-size", C), n.fields.set("site-font-stack", D), n.fields.set("site-declarations", k), n.fields.set("site-file", j), n.fields.set("site-shadow", I), n.widgets.set("site-status", o(() => import("./chunks/WidgetSite-BEUEPy6X.js"))), n.panels.set("site-preview", {
	slot: "entry.toolbar",
	component: R,
	order: 10
}), n.entryActions.set("site-preview", {
	label: r("Preview"),
	icon: "eye",
	order: 10,
	when: ({ collection: e, entry: t }) => !!(e.route || e.body) && !(t?.uri && t.status === "published" && t.displayStatus !== "scheduled" && !t.hasDraft),
	perform: () => e.emit("entry.preview")
}), n.routes.set("/design", {
	path: "/design",
	component: o(() => import("./chunks/DesignTokens-C7PD-jqR.js")),
	load: () => t("design/get")
});
