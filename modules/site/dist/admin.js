import { events as e, prefetchAbility as t, registry as n, t as r } from "@letterncms/sdk";
import { Suspense as i, forwardRef as a, lazy as o, useEffect as s, useRef as c, useState as l } from "react";
import { Fields as u, Icon as d, IconButton as f, Input as p, Popover as m, Select as h, Spinner as g, Tooltip as _, cn as v, fieldControlId as y } from "@letterncms/ui";
import { Fragment as b, jsx as x, jsxs as S } from "react/jsx-runtime";
// admin/src/fields.tsx
function C({ field: e, value: t, onChange: r, disabled: i }) {
	let a = n.fields.get("blocks-value");
	return a ? /* @__PURE__ */ x(a, {
		field: {
			...e,
			component: "blocks-value"
		},
		value: t,
		onChange: (e) => r(e == null ? null : String(e)),
		disabled: i,
		context: {}
	}) : /* @__PURE__ */ x(p, {
		id: y(e),
		size: "sm",
		className: "min-w-0 flex-1 font-mono",
		"aria-label": e.label,
		placeholder: e.placeholder,
		value: String(t ?? ""),
		disabled: i,
		onChange: (e) => r(e.target.value)
	});
}
function w({ field: e, value: t, onChange: n, disabled: i }) {
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
	return /* @__PURE__ */ S("div", {
		className: "flex min-w-0 flex-1 items-center gap-1",
		children: [a ? /* @__PURE__ */ S(b, { children: [
			/* @__PURE__ */ x("div", {
				className: "min-w-0 flex-1",
				title: r("Phone"),
				children: /* @__PURE__ */ x(C, {
					field: c("min", r("Phone")),
					value: t.min,
					disabled: i,
					onChange: (e) => n({
						...t,
						min: e ?? "0"
					})
				})
			}),
			/* @__PURE__ */ x(d, {
				name: "arrow-right",
				size: 10,
				className: "shrink-0 text-faint"
			}),
			/* @__PURE__ */ x("div", {
				className: "min-w-0 flex-1",
				title: r("Desktop"),
				children: /* @__PURE__ */ x(C, {
					field: c("max", r("Desktop")),
					value: t.max,
					disabled: i,
					onChange: (e) => n({
						...t,
						max: e ?? "0"
					})
				})
			})
		] }) : /* @__PURE__ */ x("div", {
			className: "min-w-0 flex-1",
			children: /* @__PURE__ */ x(C, {
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
		}), /* @__PURE__ */ x(_, {
			content: r(a ? "Use One Size" : "Scale from Phone to Desktop"),
			children: /* @__PURE__ */ x(f, {
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
var T = {
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
}, E = /* @__PURE__ */ new Set([
	...Object.values(T).flat(),
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
function D(e) {
	return e.includes("monospace") ? "mono" : e.includes("serif") ? "serif" : "sans";
}
function O({ field: e, value: t, onChange: n, disabled: i }) {
	let a = Array.isArray(t) ? t : String(t ?? "").split(",").map((e) => e.trim().replace(/^["']|["']$/g, "")).filter(Boolean), o = a[0] && !E.has(a[0]) ? a[0] : "", s = D(a), c = [.../* @__PURE__ */ new Set([...e.families ?? [], ...o ? [o] : []])], l = (e, t) => n([...e ? [e] : [], ...T[t]]);
	return /* @__PURE__ */ S("div", {
		className: "flex min-w-0 flex-1 items-center gap-1",
		children: [/* @__PURE__ */ x(h, {
			id: y(e),
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
		}), /* @__PURE__ */ x(h, {
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
var k = [
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
function A({ field: e, value: t, onChange: n, disabled: i }) {
	let a = t ?? {}, [o, s] = l(!1), c = `site-decl-${e.handle.replace(/[^a-z0-9-]/gi, "-")}`, u = e.tokens ?? [], m = (e, t) => {
		!t || t === e || t in a || n(Object.fromEntries(Object.entries(a).map(([n, r]) => n === e ? [t, r] : [n, r])));
	};
	return /* @__PURE__ */ S("div", {
		className: "cms-declarations group/decl py-2",
		children: [
			/* @__PURE__ */ S("div", {
				className: "flex h-6 items-center gap-1",
				children: [
					/* @__PURE__ */ x("span", {
						className: v("min-w-0 flex-1 truncate text-xs font-medium text-ink", e.mono !== !1 && "font-mono"),
						children: e.label
					}),
					/* @__PURE__ */ x(f, {
						icon: "plus",
						label: r("Add Property"),
						size: "xs",
						disabled: i,
						onClick: () => s(!0)
					}),
					e.removable === !0 && /* @__PURE__ */ x(f, {
						icon: "trash",
						label: r("Remove"),
						size: "xs",
						disabled: i,
						className: "opacity-0 group-hover/decl:opacity-100 focus-visible:opacity-100",
						onClick: () => n(null)
					})
				]
			}),
			/* @__PURE__ */ x("datalist", {
				id: `${c}-props`,
				children: k.filter((e) => !(e in a)).map((e) => /* @__PURE__ */ x("option", { value: e }, e))
			}),
			/* @__PURE__ */ x("datalist", {
				id: `${c}-values`,
				children: u.map((e) => /* @__PURE__ */ x("option", { value: e }, e))
			}),
			/* @__PURE__ */ S("div", {
				className: "mt-1 space-y-1",
				children: [Object.entries(a).map(([e, t]) => /* @__PURE__ */ S("div", {
					className: "group/row grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_20px] items-center gap-1",
					children: [
						/* @__PURE__ */ x(j, {
							value: e,
							list: `${c}-props`,
							disabled: i,
							onCommit: (t) => m(e, t)
						}),
						/* @__PURE__ */ x(p, {
							size: "xs",
							className: "font-mono",
							spellCheck: !1,
							list: `${c}-values`,
							"aria-label": r("{property} value", { property: e }),
							value: String(t),
							disabled: i,
							onChange: (t) => n({
								...a,
								[e]: t.target.value
							})
						}),
						/* @__PURE__ */ x("button", {
							type: "button",
							disabled: i,
							onClick: () => n(Object.fromEntries(Object.entries(a).filter(([t]) => t !== e))),
							className: "grid size-5 place-items-center rounded-xs text-faint opacity-0 hover:bg-hover hover:text-text group-hover/row:opacity-100 focus-visible:opacity-100",
							"aria-label": r("Remove {property}", { property: e }),
							children: /* @__PURE__ */ x(d, {
								name: "close",
								size: 10
							})
						})
					]
				}, e)), o && /* @__PURE__ */ x("div", {
					className: "grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_20px] items-center gap-1",
					children: /* @__PURE__ */ x(j, {
						value: "",
						autoFocus: !0,
						list: `${c}-props`,
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
function j({ value: e, list: t, disabled: n, autoFocus: i, onCommit: a }) {
	let [o, c] = l(e);
	return s(() => c(e), [e]), /* @__PURE__ */ x(p, {
		size: "xs",
		className: "font-mono",
		spellCheck: !1,
		autoFocus: i,
		list: t,
		placeholder: r("property"),
		"aria-label": r("Property"),
		value: o,
		disabled: n,
		onChange: (e) => c(e.target.value),
		onBlur: () => a(o.trim()),
		onKeyDown: (t) => {
			t.key === "Enter" && t.target.blur(), t.key === "Escape" && (c(e), e || a(""));
		}
	});
}
function M({ field: e, onChange: t, disabled: n }) {
	let [i, a] = l(!1);
	return /* @__PURE__ */ S("label", {
		onDragOver: (e) => {
			e.preventDefault(), a(!0);
		},
		onDragLeave: () => a(!1),
		onDrop: (e) => {
			e.preventDefault(), a(!1);
			let r = e.dataTransfer.files?.[0];
			r && !n && t(r);
		},
		className: v("flex h-14 cursor-pointer items-center justify-center gap-2 rounded-sm border border-dashed text-xs text-muted transition-colors hover:bg-hover hover:text-text", i ? "border-focus bg-hover" : "border-border-strong"),
		children: [
			/* @__PURE__ */ x(d, {
				name: "upload",
				size: 14
			}),
			e.placeholder ?? r("Choose a File"),
			/* @__PURE__ */ x("input", {
				id: y(e),
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
var N = {
	linear: [
		0,
		0,
		1,
		1
	],
	ease: [
		.25,
		.1,
		.25,
		1
	],
	"ease-in": [
		.42,
		0,
		1,
		1
	],
	"ease-out": [
		0,
		0,
		.58,
		1
	],
	"ease-in-out": [
		.42,
		0,
		.58,
		1
	]
}, P = () => [
	{
		label: r("Ease Out"),
		value: "cubic-bezier(0.2, 0.8, 0.2, 1)"
	},
	{
		label: r("Ease In-Out"),
		value: "cubic-bezier(0.65, 0, 0.35, 1)"
	},
	{
		label: r("Ease In"),
		value: "cubic-bezier(0.55, 0, 1, 0.45)"
	},
	{
		label: r("Overshoot"),
		value: "cubic-bezier(0.34, 1.56, 0.64, 1)"
	},
	{
		label: r("Linear"),
		value: "linear"
	}
];
function F(e) {
	let t = String(e ?? "").trim();
	if (t in N) return N[t];
	let n = t.match(/^cubic-bezier\(([^)]+)\)$/)?.[1].split(",").map(Number);
	return n && n.length === 4 && n.every((e) => !Number.isNaN(e)) ? n : null;
}
var I = (e) => Math.round(e * 100) / 100, L = ([e, t, n, r]) => `cubic-bezier(${I(e)}, ${I(t)}, ${I(n)}, ${I(r)})`;
function R({ value: e, size: t = 24, className: n }) {
	let [r, i, a, o] = F(e) ?? N.ease, s = t / 6, c = (e, n) => `${s + e * (t - 2 * s)},${t - s - n * (t - 2 * s)}`;
	return /* @__PURE__ */ x("svg", {
		width: t,
		height: t,
		viewBox: `0 0 ${t} ${t}`,
		className: v("shrink-0 overflow-visible", n),
		"aria-hidden": !0,
		children: /* @__PURE__ */ x("path", {
			d: `M${c(0, 0)} C${c(r, i)} ${c(a, o)} ${c(1, 1)}`,
			fill: "none",
			stroke: "currentColor",
			strokeWidth: t > 40 ? 2 : 1.5,
			strokeLinecap: "round"
		})
	});
}
var z = a(function({ label: e, preview: t, children: n, className: r, ...i }, a) {
	return /* @__PURE__ */ S("button", {
		ref: a,
		type: "button",
		"aria-label": e,
		...i,
		className: v("cms-input flex h-7 w-full min-w-0 items-center gap-1.5 rounded-sm pl-2 pr-1.5 text-left text-sm text-text transition-[border-color,box-shadow] duration-120 hover:bg-hover data-[popup-open]:border-focus disabled:opacity-50", r),
		children: [
			t,
			/* @__PURE__ */ x("span", {
				className: "min-w-0 flex-1 truncate",
				children: n
			}),
			/* @__PURE__ */ x(d, {
				name: "chevrons-up-down",
				size: 11,
				className: "shrink-0 text-faint"
			})
		]
	});
});
function B({ field: e, value: t, onChange: n, disabled: i }) {
	let a = P().find((e) => e.value === t?.replace(/\s+/g, " ").trim());
	return /* @__PURE__ */ x(m, {
		align: "start",
		className: "w-56 !p-0",
		trigger: /* @__PURE__ */ x(z, {
			id: y(e),
			disabled: i,
			label: e.label,
			preview: /* @__PURE__ */ x(R, {
				value: t,
				size: 14,
				className: "text-muted"
			}),
			children: a?.label ?? r("Custom")
		}),
		children: /* @__PURE__ */ x(V, {
			value: t,
			onChange: n
		})
	});
}
function V({ value: e, onChange: t }) {
	let n = c(null), r = F(e) ?? N.ease, i = (e, t) => [28 + e * 144, 172 - t * 144], a = (e) => (i) => {
		let a = i.currentTarget;
		a.setPointerCapture(i.pointerId);
		let o = (i) => {
			let a = n.current.getBoundingClientRect(), o = Math.max(0, Math.min(1, ((i.clientX - a.left) / a.width * 200 - 28) / 144)), s = Math.max(-.6, Math.min(1.6, (172 - (i.clientY - a.top) / a.height * 200) / 144)), c = [...r];
			c[e * 2] = o, c[e * 2 + 1] = s, t(L(c));
		}, s = () => {
			a.removeEventListener("pointermove", o), a.removeEventListener("pointerup", s);
		};
		a.addEventListener("pointermove", o), a.addEventListener("pointerup", s);
	}, [o, s] = i(0, 0), [l, u] = i(1, 1), [d, f] = i(r[0], r[1]), [p, m] = i(r[2], r[3]);
	return /* @__PURE__ */ S("div", { children: [/* @__PURE__ */ S("svg", {
		ref: n,
		viewBox: "0 0 200 200",
		className: "block w-full touch-none select-none border-b border-border bg-sunken/60",
		children: [
			/* @__PURE__ */ x("rect", {
				x: 28,
				y: 28,
				width: 144,
				height: 144,
				fill: "none",
				stroke: "var(--cms-border)"
			}),
			/* @__PURE__ */ x("line", {
				x1: o,
				y1: s,
				x2: d,
				y2: f,
				stroke: "var(--cms-faint)"
			}),
			/* @__PURE__ */ x("line", {
				x1: l,
				y1: u,
				x2: p,
				y2: m,
				stroke: "var(--cms-faint)"
			}),
			/* @__PURE__ */ x("path", {
				d: `M${o},${s} C${d},${f} ${p},${m} ${l},${u}`,
				fill: "none",
				stroke: "var(--cms-ink)",
				strokeWidth: 2,
				strokeLinecap: "round"
			}),
			[[d, f], [p, m]].map(([e, t], n) => /* @__PURE__ */ x("circle", {
				cx: e,
				cy: t,
				r: 6,
				fill: "var(--cms-bg)",
				stroke: "var(--cms-ink)",
				strokeWidth: 1.5,
				className: "cursor-grab active:cursor-grabbing",
				onPointerDown: a(n)
			}, n))
		]
	}), /* @__PURE__ */ x("div", {
		className: "flex flex-wrap gap-1 p-2",
		children: P().map((n) => /* @__PURE__ */ S("button", {
			type: "button",
			onClick: () => t(n.value),
			className: v("flex h-6 items-center gap-1 rounded-xs px-1.5 text-2xs transition-colors", e === n.value ? "bg-active text-ink" : "text-muted hover:bg-hover hover:text-text"),
			children: [/* @__PURE__ */ x(R, {
				value: n.value,
				size: 12
			}), n.label]
		}, n.value))
	})] });
}
var H = {
	handle: "shadow",
	type: "text",
	component: "blocks-shadows",
	label: "Shadow"
}, U = () => [
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
], W = ({ value: e }) => /* @__PURE__ */ x("span", {
	className: "size-3.5 shrink-0 rounded-[3px] border border-border bg-bg",
	style: { boxShadow: e ?? void 0 }
});
function G({ field: e, value: t, onChange: n, disabled: i }) {
	let a = U().find((e) => e.value === t?.replace(/\s+/g, " ").trim());
	return /* @__PURE__ */ S(m, {
		align: "start",
		className: "w-72 p-1",
		trigger: /* @__PURE__ */ x(z, {
			id: y(e),
			disabled: i,
			label: e.label,
			children: a?.label ?? r("Custom")
		}),
		children: [/* @__PURE__ */ x("div", {
			className: "space-y-px",
			children: U().map((e) => /* @__PURE__ */ S("button", {
				type: "button",
				onClick: () => n(e.value),
				className: v("flex h-7 w-full items-center gap-2 rounded-xs px-2 text-left text-xs transition-colors", e.value === a?.value ? "bg-active text-ink" : "text-text hover:bg-hover"),
				children: [
					/* @__PURE__ */ x(W, { value: e.value }),
					/* @__PURE__ */ x("span", {
						className: "flex-1",
						children: e.label
					}),
					e.value === a?.value && /* @__PURE__ */ x(d, {
						name: "check",
						size: 12,
						className: "text-muted"
					})
				]
			}, e.value))
		}), /* @__PURE__ */ S("div", {
			className: "mt-1 border-t border-border px-1 pb-1 pt-2",
			children: [
				/* @__PURE__ */ x("p", {
					className: "m-0 mb-1 text-2xs font-medium text-muted",
					children: r("Custom")
				}),
				/* @__PURE__ */ x(u, {
					bare: !0,
					fields: [H],
					values: { shadow: t && t !== "none" ? t : "0 4px 16px 0 rgb(0 0 0 / 12%)" },
					onChange: (e, t) => n(t ?? "none")
				}),
				/* @__PURE__ */ S("button", {
					type: "button",
					onClick: () => n(`${t && t !== "none" ? `${t}, ` : ""}0 2px 8px 0 rgb(0 0 0 / 10%)`),
					className: "mt-1.5 flex h-6 w-full items-center justify-center gap-1 rounded-xs text-2xs text-muted hover:bg-hover hover:text-text",
					children: [/* @__PURE__ */ x(d, {
						name: "plus",
						size: 11
					}), r("Add Layer")]
				})
			]
		})]
	});
}
// admin/src/PreviewDialog.tsx
var K = o(() => import("./chunks/RenderedPreview-B7xIZLMj.js").then((e) => ({ default: e.RenderedPreview })));
function q({ entry: t, content: n, collection: r }) {
	let [a, o] = l(!1);
	return s(() => e.on("entry.preview", () => o(!0)), []), a ? /* @__PURE__ */ x(i, {
		fallback: /* @__PURE__ */ x(g, {}),
		children: /* @__PURE__ */ x(K, {
			entry: t,
			collection: r.handle,
			content: n,
			onClose: () => o(!1)
		})
	}) : null;
}
// admin/src/TemplateField.tsx
function J({ field: e, value: t, onChange: n, disabled: i, error: a }) {
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
	return /* @__PURE__ */ x(h, {
		id: y(e),
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
n.fields.set("site-template", J), n.fields.set("site-size", w), n.fields.set("site-font-stack", O), n.fields.set("site-declarations", A), n.fields.set("site-file", M), n.fields.set("site-ease", B), n.fields.set("site-shadow", G), n.widgets.set("site-status", o(() => import("./chunks/WidgetSite-BEUEPy6X.js"))), n.panels.set("site-preview", {
	id: "site-preview",
	slot: "entry.toolbar",
	component: q,
	order: 10
}), n.entryActions.set("site-preview", {
	id: "site-preview",
	label: r("Preview"),
	icon: "eye",
	order: 10,
	when: ({ collection: e, entry: t }) => !!(e.route || e.body) && !(t?.uri && t.status === "published" && t.displayStatus !== "scheduled" && !t.hasDraft),
	perform: () => e.emit("entry.preview")
}), n.routes.set("/design", {
	path: "/design",
	component: o(() => import("./chunks/DesignTokens-7z2qETCN.js")),
	load: () => t("design/get")
});
