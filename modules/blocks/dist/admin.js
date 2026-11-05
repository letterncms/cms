import { B as e, C as t, D as n, E as r, F as i, H as a, I as o, J as s, K as c, L as l, M as u, N as d, O as f, P as p, R as m, S as h, T as g, U as _, V as v, W as y, Y as b, _ as x, a as S, b as ee, c as C, d as w, f as T, g as E, h as D, i as te, j as ne, k as O, m as re, n as ie, o as ae, p as oe, r as se, s as ce, t as k, u as le, v as ue, w as de, x as fe, y as pe, z as me } from "./chunks/Inspector-Bl_ziQtl.js";
import { _ as A, a as he, c as j, d as ge, f as M, h as N, l as _e, n as ve, o as ye, r as P, s as be, t as F, u as xe } from "./chunks/insert-C2qFyCIH.js";
import { navigate as Se, registry as I, t as L, useAbility as R } from "@letterncms/sdk";
import { Button as z, Fields as B, Icon as V, IconButton as H, InspectorPanel as Ce, Menu as we, Popover as U, QueryError as Te, Segmented as Ee, Spinner as De, cn as W, fieldControlId as G } from "@letterncms/ui";
import { createContext as Oe, lazy as ke, useContext as Ae, useEffect as K, useLayoutEffect as je, useMemo as q, useRef as J, useState as Y } from "react";
import { jsx as X, jsxs as Z } from "react/jsx-runtime";
import { createPortal as Me } from "react-dom";
import { DndContext as Ne, DragOverlay as Pe, PointerSensor as Fe, closestCenter as Ie, pointerWithin as Le, useDraggable as Re, useDroppable as ze, useSensor as Be, useSensors as Ve } from "@dnd-kit/core";
// admin/src/builder/color.tsx
var He = [
	"",
	"90",
	"75",
	"50",
	"25",
	"10",
	"5"
], Ue = [
	"background",
	"background-muted",
	"background-emphasis",
	"surface",
	"foreground",
	"foreground-muted",
	"foreground-subtle",
	"border",
	"border-strong"
];
function We({ field: e, value: t, onChange: n }) {
	let r = s(), i = r.resolved, [a, o] = Y(!1), c = typeof t == "string" && t !== "" ? t : null, [l, u = ""] = (c ?? "").split("/"), d = r.catalog?.collections.palettes ?? [], f = (e, t = u) => n(e ? t ? `${e}/${t}` : e : null), p = (e, t) => /* @__PURE__ */ Z("button", {
		type: "button",
		onClick: () => f(e),
		title: e,
		"aria-pressed": l === e,
		className: W("flex h-7 min-w-0 items-center gap-1.5 rounded-xs px-1.5 text-left text-2xs hover:bg-hover", l === e && "bg-active text-ink"),
		children: [/* @__PURE__ */ X("span", {
			className: "size-3.5 shrink-0 rounded-full ring-1 ring-border",
			style: { background: v(e, i) }
		}), /* @__PURE__ */ X("span", {
			className: "min-w-0 truncate",
			children: t ?? e
		})]
	}, e);
	return /* @__PURE__ */ Z(U, {
		open: a,
		onOpenChange: o,
		className: "w-72 !p-2",
		trigger: /* @__PURE__ */ Z("button", {
			type: "button",
			id: G(e),
			className: W("flex h-7 min-w-0 flex-1 items-center gap-1.5 rounded-sm bg-active/60 px-2 text-left text-xs hover:bg-active", !c && "text-faint"),
			children: [
				/* @__PURE__ */ X("span", {
					className: "size-3.5 shrink-0 rounded-full ring-1 ring-border",
					style: { background: c ? v(c, i) : "transparent" }
				}),
				/* @__PURE__ */ X("span", {
					className: W("min-w-0 truncate", c && "font-medium text-ink"),
					children: c ? l : e.placeholder ?? L("Inherit")
				}),
				u && /* @__PURE__ */ Z("span", {
					className: "ml-auto shrink-0 text-2xs text-faint",
					children: [u, "%"]
				})
			]
		}),
		children: [
			/* @__PURE__ */ X("p", {
				className: "m-0 px-1 pb-1 text-2xs font-medium text-faint",
				children: L("This scheme")
			}),
			/* @__PURE__ */ X("div", {
				className: "grid grid-cols-2 gap-px",
				children: Ue.map((e) => p(e))
			}),
			/* @__PURE__ */ X("p", {
				className: "m-0 px-1 pb-1 pt-2 text-2xs font-medium text-faint",
				children: L("Palettes")
			}),
			/* @__PURE__ */ X("div", {
				className: "space-y-1.5",
				children: d.map((e) => /* @__PURE__ */ Z("div", { children: [/* @__PURE__ */ Z("div", {
					className: "grid grid-cols-4 gap-px",
					children: [
						p(e, e),
						p(`on-${e}`, L("on")),
						p(`${e}-soft`, L("soft")),
						p(`${e}-text`, L("text"))
					]
				}), /* @__PURE__ */ X("div", {
					className: "mt-0.5 grid grid-cols-11 overflow-hidden rounded-xs",
					children: [
						"50",
						"100",
						"200",
						"300",
						"400",
						"500",
						"600",
						"700",
						"800",
						"900",
						"950"
					].map((t) => /* @__PURE__ */ X("button", {
						type: "button",
						title: `${e}-${t}`,
						"aria-label": `${e}-${t}`,
						onClick: () => f(`${e}-${t}`),
						className: W("h-3.5 hover:scale-y-150 transition-transform", l === `${e}-${t}` && "outline-2 -outline-offset-2 outline-focus"),
						style: { background: i?.palettes[e]?.shades[t] }
					}, t))
				})] }, e))
			}),
			/* @__PURE__ */ X("div", {
				className: "mt-2 grid grid-cols-4 gap-px border-t border-border pt-2",
				children: [
					"white",
					"black",
					"transparent",
					"current"
				].map((e) => p(e))
			}),
			/* @__PURE__ */ X("p", {
				className: "m-0 px-1 pb-1 pt-2 text-2xs font-medium text-faint",
				children: L("Opacity")
			}),
			/* @__PURE__ */ X("div", {
				className: "flex gap-px",
				children: He.map((e) => /* @__PURE__ */ X("button", {
					type: "button",
					disabled: !c,
					onClick: () => f(l, e),
					"aria-pressed": u === e,
					className: W("h-6 flex-1 rounded-xs text-2xs hover:bg-hover disabled:opacity-40", u === e && "bg-active text-ink"),
					children: e || "100"
				}, e || "100"))
			}),
			c && /* @__PURE__ */ Z("button", {
				type: "button",
				onClick: () => {
					n(null), o(!1);
				},
				className: "mt-2 flex h-7 w-full items-center gap-2 rounded-xs border-t border-border px-1 text-xs text-muted hover:bg-hover hover:text-text",
				children: [/* @__PURE__ */ X(V, {
					name: "b-x",
					size: 12
				}), L("Clear")]
			})
		]
	});
}
// admin/src/BlocksField.tsx
function Ge({ field: t, value: n, onChange: r, context: i, disabled: a }) {
	let { catalog: o, types: s, isLoading: u, error: d, retry: f } = c(), p = l(n, r, !!a), [m, h] = Y(null), g = e(p, (e) => e.nodes), _ = J(i);
	if (_.current = i, u) return /* @__PURE__ */ X("div", {
		className: "flex h-24 items-center justify-center text-faint",
		children: /* @__PURE__ */ X(De, {})
	});
	if (!o) return /* @__PURE__ */ X(Te, {
		message: d?.message,
		onRetry: f
	});
	let v = {
		store: p,
		types: s,
		catalog: o,
		entryId: i.entry?.id ?? null,
		fieldHandle: t.handle,
		allowed: t.allowed ?? [],
		getValues: () => _.current.values ?? {},
		title: i.title ?? i.entry?.title ?? "",
		readOnly: !!a
	};
	return /* @__PURE__ */ Z(y, {
		value: v,
		children: [/* @__PURE__ */ X("div", {
			className: "h-[480px] min-w-0 overflow-hidden rounded-sm border border-border",
			children: /* @__PURE__ */ X(T, {
				collection: i.collection,
				entryId: i.entry?.id,
				content: {
					title: i.title ?? i.entry?.title ?? "",
					slug: i.entry?.slug ?? "",
					authorId: i.entry?.authorId ?? null,
					data: {
						...i.values ?? i.entry?.data ?? {},
						[t.handle]: n ?? []
					}
				},
				onInspect: h,
				standalone: !0
			})
		}), /* @__PURE__ */ Z(Ce, {
			docked: !1,
			open: !!m,
			onOpenChange: (e) => !e && h(null),
			title: L("Block Settings"),
			children: [/* @__PURE__ */ X("div", {
				className: "flex h-10 shrink-0 items-center justify-end border-b border-border px-2",
				children: /* @__PURE__ */ X(H, {
					icon: "close",
					label: L("Close Panel"),
					size: "xs",
					onClick: () => h(null)
				})
			}), m && j(g, m) && /* @__PURE__ */ X(k, {
				node: j(g, m),
				onClose: () => h(null)
			})]
		})]
	});
}
// admin/src/builder/content/BindField.tsx
function Ke({ field: e, value: t, onChange: n, disabled: r }) {
	let [i, a] = Y(!1), [o, s] = Y(null), c = t ?? void 0, l = e.paths ?? [], u = [...new Set(l.map((e) => e.group))], d = l.find((e) => e.path === c)?.label;
	return /* @__PURE__ */ Z(ce, { children: [/* @__PURE__ */ Z("div", {
		className: "relative flex min-w-0 flex-1 items-center",
		children: [/* @__PURE__ */ X(V, {
			name: "b-database",
			size: 13,
			className: "pointer-events-none absolute left-2 text-ink"
		}), /* @__PURE__ */ X("input", {
			id: G(e),
			value: o ?? c ?? "",
			placeholder: e.placeholder ?? "entry.title",
			disabled: r,
			spellCheck: !1,
			onChange: (e) => s(e.target.value),
			onBlur: () => {
				o !== null && n(o.trim() || null), s(null);
			},
			onKeyDown: (e) => e.key === "Enter" && e.target.blur(),
			title: d,
			"aria-label": e.label,
			className: W(w, "!pl-7 font-mono text-ink placeholder:font-sans")
		})]
	}), /* @__PURE__ */ Z(U, {
		open: i,
		onOpenChange: a,
		align: "end",
		className: "w-64 !p-1",
		trigger: /* @__PURE__ */ X("button", {
			type: "button",
			className: "grid size-6 shrink-0 place-items-center rounded-xs text-muted hover:bg-hover hover:text-text",
			"aria-label": L("Choose Data"),
			children: /* @__PURE__ */ X(V, {
				name: "b-caret-down",
				size: 12
			})
		}),
		children: [/* @__PURE__ */ X("div", {
			className: "max-h-80 overflow-y-auto",
			children: u.map((e) => /* @__PURE__ */ Z("div", {
				className: "py-1",
				children: [/* @__PURE__ */ X("p", {
					className: "cms-label m-0 px-2 pb-1",
					children: e
				}), l.filter((t) => t.group === e).map((e) => /* @__PURE__ */ Z("button", {
					type: "button",
					onClick: () => {
						n(e.path), a(!1);
					},
					className: W("flex h-7 w-full items-center gap-2 rounded-xs px-2 text-left text-xs hover:bg-hover", c === e.path && "bg-active"),
					children: [
						/* @__PURE__ */ X("span", {
							className: "min-w-0 flex-1 truncate",
							children: e.label
						}),
						/* @__PURE__ */ X("span", {
							className: "max-w-[50%] shrink-0 truncate font-mono text-2xs text-faint",
							children: e.path
						}),
						c === e.path && /* @__PURE__ */ X(V, {
							name: "check",
							size: 11,
							className: "shrink-0"
						})
					]
				}, e.path))]
			}, e))
		}), /* @__PURE__ */ Z("p", {
			className: "m-0 border-t border-border px-2 py-1.5 font-mono text-2xs leading-relaxed text-faint",
			title: L("Filters, and text mixed with data"),
			children: ["|date:M j, Y · |excerpt:120 · |upper · |default:Text · By ", "{entry.author}"]
		})]
	})] });
}
// admin/src/builder/fields/nodes.tsx
function qe({ field: t, ...n }) {
	let { store: r, types: i } = b(), a = e(r, (e) => e.nodes), o = _e(a).filter(({ node: e }) => e.id !== t.exclude).map(({ node: e, depth: t }) => ({
		value: e.id,
		label: `${"  ".repeat(t)}${e.label || A(e, 28) || i.get(e.type)?.title || e.type}`
	}));
	return /* @__PURE__ */ X(C, {
		...n,
		field: {
			...t,
			type: "select",
			component: void 0,
			size: "sm",
			options: o,
			placeholder: t.placeholder ?? L("Choose an Element")
		}
	});
}
function Je({ field: e, value: t, onChange: n, disabled: r, context: i }) {
	let a = t ?? [], o = {
		handle: e.handle,
		type: "select",
		label: e.label,
		exclude: e.exclude
	};
	return /* @__PURE__ */ Z("div", {
		className: "min-w-0 flex-1 space-y-1",
		children: [a.map((t, s) => /* @__PURE__ */ Z("div", {
			className: "flex items-center gap-1",
			children: [/* @__PURE__ */ X(qe, {
				field: {
					...o,
					handle: `${e.handle}-${s}`
				},
				value: t,
				onChange: (e) => n(e ? a.map((t, n) => n === s ? e : t) : a.filter((e, t) => t !== s)),
				disabled: r,
				context: i
			}), /* @__PURE__ */ X(le, { onClick: () => n(a.filter((e, t) => t !== s)) })]
		}, s)), /* @__PURE__ */ Z("button", {
			type: "button",
			onClick: () => n([...a, e.addValue]),
			className: "text-xs text-muted hover:text-text",
			children: ["+ ", e.add ?? L("Element")]
		})]
	});
}
// admin/src/builder/fields/conditions.tsx
var Ye = () => [
	{
		value: "=",
		label: L("is")
	},
	{
		value: "!=",
		label: L("is not")
	},
	{
		value: "contains",
		label: L("contains")
	},
	{
		value: ">",
		label: L("is more than")
	},
	{
		value: "<",
		label: L("is less than")
	},
	{
		value: "not null",
		label: L("is set")
	},
	{
		value: "null",
		label: L("is empty")
	}
];
function Xe({ field: e, value: t, onChange: n, disabled: r, context: i }) {
	let a = Array.isArray(t) ? t : [], o = (e) => n(e.length ? e : null), s = (e, t) => o(a.map((n, r) => r === e ? {
		...n,
		...t
	} : n));
	return /* @__PURE__ */ Z("div", {
		className: "min-w-0 flex-1 space-y-1",
		children: [a.map((t, n) => /* @__PURE__ */ Z("div", {
			className: "flex items-center gap-1",
			children: [
				/* @__PURE__ */ X(C, {
					field: {
						handle: `${e.handle}-${n}-field`,
						type: "text",
						size: "sm",
						commit: "blur",
						label: L("Field"),
						placeholder: L("Field"),
						mono: !0,
						className: "!w-[34%] !flex-none"
					},
					value: t.field ?? null,
					onChange: (e) => s(n, { field: String(e ?? "").trim() }),
					disabled: r,
					context: i
				}),
				/* @__PURE__ */ X(C, {
					field: {
						handle: `${e.handle}-${n}-op`,
						type: "select",
						size: "sm",
						required: !0,
						label: L("Comparison"),
						options: Ye(),
						className: "!flex-none w-[92px]"
					},
					value: t.op ?? "=",
					onChange: (e) => s(n, { op: String(e ?? "=") }),
					disabled: r,
					context: i
				}),
				!["null", "not null"].includes(t.op ?? "") && /* @__PURE__ */ X(C, {
					field: {
						handle: `${e.handle}-${n}-value`,
						type: "text",
						size: "sm",
						commit: "blur",
						label: L("Value"),
						placeholder: L("Value")
					},
					value: t.value === void 0 || t.value === null ? null : String(t.value),
					onChange: (e) => s(n, { value: e ?? "" }),
					disabled: r,
					context: i
				}),
				/* @__PURE__ */ X(le, {
					label: L("Remove Condition"),
					onClick: () => o(a.filter((e, t) => t !== n))
				})
			]
		}, n)), /* @__PURE__ */ Z("button", {
			type: "button",
			disabled: r,
			onClick: () => o([...a, {
				field: "",
				op: "=",
				value: ""
			}]),
			className: "-ml-2 inline-flex h-7 items-center gap-1.5 rounded-sm px-2 text-xs text-muted hover:bg-hover hover:text-ink",
			children: [/* @__PURE__ */ X(V, {
				name: "b-plus",
				size: 13
			}), L("Add Condition")]
		})]
	});
}
// admin/src/builder/fields/inlineText.tsx
function Ze({ field: e, value: t, onChange: n, disabled: r }) {
	let i = J(null);
	return K(() => {
		i.current && i.current.innerHTML !== (t ?? "") && document.activeElement !== i.current && (i.current.innerHTML = t ?? "");
	}, [t]), /* @__PURE__ */ X("div", {
		ref: i,
		id: G(e),
		role: "textbox",
		"aria-label": e.label,
		"aria-multiline": !1,
		contentEditable: !r,
		suppressContentEditableWarning: !0,
		"data-placeholder": e.placeholder ?? "",
		onInput: () => n(i.current?.innerHTML ?? ""),
		onKeyDown: (e) => e.key === "Enter" && e.preventDefault(),
		onPaste: (e) => {
			e.preventDefault(), document.execCommand("insertText", !1, e.clipboardData.getData("text/plain").replace(/\s*\n\s*/g, " "));
		},
		className: W(w, "cursor-text overflow-hidden whitespace-nowrap leading-[26px] outline-none [&_*]:inline empty:before:text-ghost empty:before:content-[attr(data-placeholder)]")
	});
}
// admin/src/builder/fields/spacing.tsx
function Qe(e, t) {
	return t.shiftKey ? [
		0,
		1,
		2,
		3
	] : t.altKey ? [e, (e + 2) % 4] : [e];
}
function $e(e, t) {
	if (t.length === 4) return L(e === "margin" ? "Margin, All Sides" : "Padding, All Sides");
	if (t.length === 2) return t.includes(0) ? L(e === "margin" ? "Margin, Top and Bottom" : "Padding, Top and Bottom") : L(e === "margin" ? "Margin, Left and Right" : "Padding, Left and Right");
	let n = {
		0: L("top"),
		1: L("right"),
		2: L("bottom"),
		3: L("left")
	}[t[0]];
	return L(e === "margin" ? "Margin {side}" : "Padding {side}", { side: n });
}
function et({ field: e, value: t, onChange: n, context: r }) {
	let i = t ?? {
		margin: [],
		padding: []
	}, a = e.sideStatus ?? {}, o = (e) => Array.isArray(i[e]) ? i[e] : [], s = (e, t, r) => n({
		...i,
		[e]: [
			0,
			1,
			2,
			3
		].map((n) => t.includes(n) ? r ?? void 0 : o(e)[n])
	}), c = (e, t) => /* @__PURE__ */ X(tt, {
		box: e,
		index: t,
		value: o(e)[t],
		status: a[e]?.[t] ?? "none",
		onChange: (t, n) => s(e, t, n),
		context: r
	}, `${e}${t}`);
	return /* @__PURE__ */ X("div", {
		className: "min-w-0 flex-1 select-none",
		children: /* @__PURE__ */ Z("div", {
			className: "relative grid grid-cols-[44px_1fr_44px] grid-rows-[24px_auto_24px] rounded-md bg-active/60",
			children: [
				/* @__PURE__ */ X("span", {
					className: "pointer-events-none absolute left-2 top-1 text-2xs text-faint",
					children: L("Margin")
				}),
				/* @__PURE__ */ X("span", {}),
				c("margin", 0),
				/* @__PURE__ */ X("span", {}),
				c("margin", 3),
				/* @__PURE__ */ Z("div", {
					className: "relative grid grid-cols-[44px_1fr_44px] grid-rows-[24px_20px_24px] rounded-sm bg-bg shadow-[0_0_0_1px_var(--cms-border)]",
					children: [
						/* @__PURE__ */ X("span", {
							className: "pointer-events-none absolute left-2 top-1 text-2xs text-faint",
							children: L("Padding")
						}),
						/* @__PURE__ */ X("span", {}),
						c("padding", 0),
						/* @__PURE__ */ X("span", {}),
						c("padding", 3),
						/* @__PURE__ */ X("span", { className: "my-1 rounded-xs bg-active" }),
						c("padding", 1),
						/* @__PURE__ */ X("span", {}),
						c("padding", 2),
						/* @__PURE__ */ X("span", {})
					]
				}),
				c("margin", 1),
				/* @__PURE__ */ X("span", {}),
				c("margin", 2),
				/* @__PURE__ */ X("span", {})
			]
		})
	});
}
function tt({ box: e, index: t, value: n, status: r, onChange: i }) {
	let a = s(), [o, c] = Y(!1), [l, u] = Y([t]), [d, f] = Y(!1), p = a.names(e === "margin" ? "marginTop" : "paddingTop").filter((e) => e !== "auto" && !/^v[wh]-/.test(e) && !Object.keys(a.resolved?.spaceRoles ?? {}).includes(e));
	return /* @__PURE__ */ X(U, {
		open: o,
		onOpenChange: c,
		align: "center",
		className: "w-64 !p-2",
		trigger: /* @__PURE__ */ X("button", {
			type: "button",
			onPointerDown: (r) => {
				if (r.button !== 0) return;
				r.preventDefault();
				let a = {
					x: r.clientX,
					y: r.clientY
				}, o = e === "margin" ? [...p.slice(1).reverse().map((e) => `-${e}`), ...p] : p, s = Math.max(0, o.indexOf(n ?? "0")), c = !1, l = (e) => {
					let n = Math.trunc((e.clientX - a.x - (e.clientY - a.y)) / 12);
					(c || n !== 0) && (c || f(!0), c = !0, document.body.style.cursor = t % 2 ? "ew-resize" : "ns-resize", i(Qe(t, e), o[Math.max(0, Math.min(o.length - 1, s + n))]));
				}, u = () => {
					if (window.removeEventListener("pointermove", l), window.removeEventListener("pointerup", u), document.body.style.cursor = "", f(!1), !c) return;
					let e = (e) => {
						e.stopPropagation(), e.preventDefault();
					};
					window.addEventListener("click", e, {
						capture: !0,
						once: !0
					}), setTimeout(() => window.removeEventListener("click", e, { capture: !0 }), 0);
				};
				window.addEventListener("pointermove", l), window.addEventListener("pointerup", u);
			},
			onClick: (e) => u(Qe(t, e)),
			"aria-label": $e(e, [t]),
			title: `${$e(e, [t])}\n${L("Drag to step through the space scale. Alt: opposite side too, Shift: all sides.")}`,
			className: W("mx-auto flex h-full min-w-0 max-w-full items-center justify-center rounded-xs px-1 text-xs tabular-nums outline-none transition-colors focus-visible:ring-2 focus-visible:ring-focus", t % 2 ? "cursor-ew-resize" : "cursor-ns-resize", r === "own" ? "font-medium text-ink" : r === "inherited" ? "text-text" : "text-faint", o || d ? "bg-active" : "hover:bg-hover"),
			children: /* @__PURE__ */ X("span", {
				className: "truncate",
				children: n ?? "0"
			})
		}),
		children: /* @__PURE__ */ X(nt, {
			box: e,
			sides: l,
			value: n,
			onChange: (e) => i(l, e),
			close: () => c(!1)
		})
	});
}
function nt({ box: e, sides: t, value: n, onChange: r, close: i }) {
	let a = s(), o = a.resolved, c = Object.keys(o?.spaceRoles ?? {}), l = a.names(e === "margin" ? "marginTop" : "paddingTop").filter((e) => e !== "auto" && !/^v[wh]-/.test(e)).filter((e) => !c.includes(e)), u = n?.startsWith("-") ?? !1, d = (e) => {
		r(e), i();
	}, f = (e) => {
		let t = o?.space[o.spaceRoles[e] ?? e];
		return t ? Math.round(t.min) === Math.round(t.max) ? `${Math.round(t.max)}px` : `${Math.round(t.min)}–${Math.round(t.max)}px` : "";
	}, p = (e, t = e) => {
		let r = u && e !== "0" && !c.includes(e) ? `-${e}` : e;
		return /* @__PURE__ */ X("button", {
			type: "button",
			title: f(e),
			onClick: () => d(r),
			className: W("h-6 min-w-8 rounded-xs px-1.5 text-2xs tabular-nums", n === r ? "bg-focus text-white" : "bg-sunken text-text hover:bg-hover"),
			children: t
		}, e);
	};
	return /* @__PURE__ */ Z("div", { children: [
		/* @__PURE__ */ Z("p", {
			className: "m-0 mb-1.5 flex items-center justify-between text-xs font-semibold text-ink",
			children: [$e(e, t), n !== void 0 && /* @__PURE__ */ X("button", {
				type: "button",
				onClick: () => d(null),
				className: "rounded-xs px-1 text-2xs font-normal text-muted hover:bg-hover hover:text-text",
				children: L("Reset")
			})]
		}),
		/* @__PURE__ */ X("div", {
			className: "flex flex-wrap gap-1",
			children: l.map((e) => p(e))
		}),
		/* @__PURE__ */ X("p", {
			className: "cms-label m-0 mb-1 mt-2.5 !text-2xs",
			children: L("Roles")
		}),
		/* @__PURE__ */ X("div", {
			className: "flex flex-wrap gap-1",
			children: c.map((e) => p(e))
		}),
		e === "margin" && /* @__PURE__ */ Z("div", {
			className: "mt-2 flex gap-1 border-t border-border pt-2",
			children: [/* @__PURE__ */ X("button", {
				type: "button",
				onClick: () => d("auto"),
				className: W("h-6 rounded-xs px-1.5 text-2xs", n === "auto" ? "bg-focus text-white" : "bg-sunken text-text hover:bg-hover"),
				children: L("Auto")
			}), /* @__PURE__ */ X("button", {
				type: "button",
				disabled: !n || n === "auto" || n === "0" || c.includes(n),
				onClick: () => n && d(u ? n.slice(1) : `-${n}`),
				"aria-pressed": u,
				className: W("h-6 rounded-xs px-1.5 text-2xs disabled:opacity-40", u ? "bg-focus text-white" : "bg-sunken text-text hover:bg-hover"),
				children: L("Negative")
			})]
		})
	] });
}
// admin/src/builder/motion/EaseCurve.tsx
var rt = {
	linear: [
		0,
		0,
		1,
		1
	],
	in: [
		.55,
		0,
		1,
		.45
	],
	out: [
		.22,
		1,
		.36,
		1
	],
	"in-out": [
		.65,
		0,
		.35,
		1
	],
	expo: [
		.19,
		1,
		.22,
		1
	],
	emphasized: [
		.16,
		1,
		.3,
		1
	],
	swift: [
		.32,
		.72,
		0,
		1
	],
	overshoot: [
		.34,
		1.56,
		.64,
		1
	],
	anticipate: [
		.7,
		-.4,
		.3,
		1.4
	],
	spring: [
		.2,
		1.5,
		.4,
		.95
	],
	bounce: [
		.3,
		1.3,
		.5,
		1
	]
};
function it(e) {
	return rt[e ?? "out"] ?? rt.out;
}
function at({ value: e, size: t = 32, className: n }) {
	let [r, i, a, o] = it(e), s = (e, n) => `${4 + e * (t - 8)},${t - 4 - n * (t - 8)}`;
	return /* @__PURE__ */ X("svg", {
		width: t,
		height: t,
		viewBox: `0 0 ${t} ${t}`,
		className: n ?? "shrink-0 rounded-xs bg-sunken text-focus",
		"aria-hidden": !0,
		children: /* @__PURE__ */ X("path", {
			d: `M${s(0, 0)} C${s(r, i)} ${s(a, o)} ${s(1, 1)}`,
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "1.5",
			strokeLinecap: "round"
		})
	});
}
// admin/src/builder/fields/token.tsx
var ot = 14;
function st({ field: e, value: t, onChange: n }) {
	let r = s(), i = e.property ?? e.handle, o = r.property(i), c = r.names(i), [l, u] = Y(!1), [d, f] = Y(""), p = J(null), m = typeof t == "string" && t !== "" ? t : null, h = !!m?.startsWith("-") && !!o?.negative, g = h ? m.slice(1) : m, v = c.filter((e) => !(o?.keywords ?? []).includes(e)), y = o?.kind ?? "keyword", b = e.placeholder ?? L("Inherit");
	if (!o) return /* @__PURE__ */ X("span", {
		className: "text-xs text-faint",
		children: L("Not in the design vocabulary")
	});
	let x = (e) => {
		n(e === null ? null : h && v.includes(e) && e !== "0" ? `-${e}` : e), u(!1), f("");
	}, S = (e) => {
		let t = g ? v.indexOf(g) : -1, r = v[Math.max(0, Math.min(v.length - 1, (t < 0 ? Math.floor(v.length / 2) - 1 : t) + e))];
		r && n(h && r !== "0" ? `-${r}` : r);
	}, ee = (e) => {
		e.key === "ArrowUp" || e.key === "ArrowRight" ? (e.preventDefault(), S(e.shiftKey ? 3 : 1)) : e.key === "ArrowDown" || e.key === "ArrowLeft" ? (e.preventDefault(), S(e.shiftKey ? -3 : -1)) : (e.key === "Backspace" || e.key === "Delete") && m && (e.preventDefault(), n(null));
	}, C = (e) => {
		e.button === 0 && v.length && (p.current = {
			x: e.clientX,
			index: g ? v.indexOf(g) : -1,
			moved: !1
		});
	}, w = (e) => {
		let t = p.current;
		if (!t) return;
		let r = Math.trunc((e.clientX - t.x) / ot);
		if (r === 0 && !t.moved) return;
		t.moved || e.currentTarget.setPointerCapture(e.pointerId), t.moved = !0;
		let i = t.index < 0 ? Math.floor(v.length / 2) - 1 : t.index, a = v[Math.max(0, Math.min(v.length - 1, i + r))];
		a && a !== g && n(h && a !== "0" ? `-${a}` : a);
	}, T = (e) => {
		p.current?.moved && (e.preventDefault(), setTimeout(() => u(!1))), p.current = null;
	}, E = d ? c.filter((e) => e.includes(d.toLowerCase())) : c, D = a(y, E, o.keywords ?? []);
	return /* @__PURE__ */ Z("div", {
		className: "group/value flex min-w-0 flex-1 items-center gap-1",
		children: [/* @__PURE__ */ Z(U, {
			open: l,
			onOpenChange: (e) => {
				u(e), e || f("");
			},
			className: "w-64 !p-1",
			trigger: /* @__PURE__ */ Z("button", {
				type: "button",
				id: G(e),
				onKeyDown: ee,
				onPointerDown: C,
				onPointerMove: w,
				onPointerUp: T,
				className: W("flex h-7 min-w-0 flex-1 cursor-ew-resize items-center gap-1.5 rounded-sm bg-active/60 px-2 text-left text-xs hover:bg-active focus-visible:outline-2 focus-visible:outline-focus", !m && "text-faint"),
				title: L("Click to pick, drag sideways or use the arrow keys to step"),
				children: [
					!!e.prefixIcon && /* @__PURE__ */ X(V, {
						name: e.prefixIcon,
						size: 12,
						className: "shrink-0 text-faint"
					}),
					m && /* @__PURE__ */ X(ct, {
						kind: y,
						name: g
					}),
					/* @__PURE__ */ X("span", {
						className: W("min-w-0 truncate", m && "font-medium text-ink"),
						children: m ?? b
					}),
					m && /* @__PURE__ */ X("span", {
						className: "ml-auto shrink-0 truncate text-2xs text-faint",
						children: _(y, g, r.resolved)
					})
				]
			}),
			children: [
				c.length > 12 && /* @__PURE__ */ X("input", {
					autoFocus: !0,
					value: d,
					onChange: (e) => f(e.target.value),
					onKeyDown: (e) => {
						e.key === "Enter" && E[0] && x(E[0]);
					},
					placeholder: L("Filter"),
					className: "mb-1 h-7 w-full rounded-xs bg-active/60 px-2 text-xs outline-none placeholder:text-faint"
				}),
				/* @__PURE__ */ Z("div", {
					className: "max-h-80 overflow-y-auto",
					role: "listbox",
					"aria-label": e.label,
					children: [D.map((e) => /* @__PURE__ */ Z("div", { children: [D.length > 1 && /* @__PURE__ */ X("p", {
						className: "m-0 px-2 pb-0.5 pt-1.5 text-2xs font-medium text-faint",
						children: e.label
					}), e.names.map((e) => /* @__PURE__ */ Z("button", {
						type: "button",
						role: "option",
						"aria-selected": g === e,
						onClick: () => x(e),
						className: W("flex h-7 w-full items-center gap-2 rounded-xs px-2 text-left text-xs text-text hover:bg-hover", g === e && "bg-active text-ink"),
						children: [
							/* @__PURE__ */ X(ct, {
								kind: y,
								name: e
							}),
							/* @__PURE__ */ X("span", {
								className: "min-w-0 truncate",
								children: e
							}),
							/* @__PURE__ */ X("span", {
								className: "ml-auto max-w-[50%] shrink-0 truncate text-2xs text-faint",
								children: _(y, e, r.resolved)
							}),
							g === e && /* @__PURE__ */ X(V, {
								name: "b-check",
								size: 12,
								className: "shrink-0 text-focus"
							})
						]
					}, e))] }, e.label)), !E.length && /* @__PURE__ */ X("p", {
						className: "m-0 px-2 py-2 text-xs text-faint",
						children: L("No name matches.")
					})]
				}),
				m && /* @__PURE__ */ Z("button", {
					type: "button",
					onClick: () => x(null),
					className: "mt-1 flex h-7 w-full items-center gap-2 rounded-xs border-t border-border px-2 text-xs text-muted hover:bg-hover hover:text-text",
					children: [/* @__PURE__ */ X(V, {
						name: "b-x",
						size: 12
					}), L("Clear")]
				})
			]
		}), o.negative && /* @__PURE__ */ X("button", {
			type: "button",
			onClick: () => m && m !== "0" && n(h ? g : `-${g}`),
			disabled: !m || m === "0" || !v.includes(g),
			"aria-pressed": h,
			title: L("Negative"),
			className: W("grid size-7 shrink-0 place-items-center rounded-sm text-xs text-faint hover:bg-hover hover:text-ink disabled:opacity-30", h && "bg-active text-ink"),
			children: "−"
		})]
	});
}
function ct({ kind: e, name: t }) {
	let n = s().resolved;
	if (!n) return null;
	let r = "size-3.5 shrink-0";
	if (e === "color") return /* @__PURE__ */ X("span", {
		className: W(r, "rounded-full ring-1 ring-border"),
		style: { background: v(t, n) }
	});
	if (e === "radius") return /* @__PURE__ */ X("span", {
		className: W(r, "border-l-[1.5px] border-t-[1.5px] border-muted"),
		style: { borderTopLeftRadius: n.radii[t] === "9999px" ? "7px" : n.radii[t] }
	});
	if (e === "ease") return /* @__PURE__ */ X(at, {
		value: t,
		size: 16,
		className: "shrink-0 rounded-[3px] bg-sunken text-focus"
	});
	if (e === "shadow") return /* @__PURE__ */ X("span", {
		className: W(r, "rounded-[3px] bg-bg"),
		style: { boxShadow: t === "none" ? void 0 : lt[t] }
	});
	if ([
		"space",
		"inset",
		"translate",
		"size"
	].includes(e)) {
		let e = n.space[n.spaceRoles[t] ?? t];
		return e ? /* @__PURE__ */ X("span", {
			className: "flex w-4 shrink-0 items-center",
			children: /* @__PURE__ */ X("span", {
				className: "h-1.5 rounded-full bg-muted",
				style: { width: `${Math.max(2, Math.min(16, e.max / 8))}px` }
			})
		}) : null;
	}
	return null;
}
var lt = {
	xs: "0 1px 1px rgb(0 0 0/.2)",
	sm: "0 1px 2px rgb(0 0 0/.25)",
	md: "0 2px 4px rgb(0 0 0/.25)",
	lg: "0 3px 6px rgb(0 0 0/.3)",
	xl: "0 4px 8px rgb(0 0 0/.3)",
	"2xl": "0 6px 10px rgb(0 0 0/.35)",
	inner: "inset 0 1px 2px rgb(0 0 0/.3)"
};
// admin/src/builder/fields/index.ts
function ut() {
	let e = {
		"blocks-token": st,
		"blocks-color": We,
		"blocks-bind": Ke,
		"blocks-node": qe,
		"blocks-nodes": Je,
		"blocks-group": S,
		"blocks-pairs": ae,
		"blocks-gradient": se,
		"blocks-align": ie,
		"blocks-origin": te,
		"blocks-spacing": et,
		"blocks-conditions": Xe,
		"blocks-inline-text": Ze
	};
	for (let [t, n] of Object.entries(e)) I.fields.set(t, n);
}
// admin/src/builder/icon-data.ts
var dt = {
	"b-square": "<path fill=\"currentColor\" d=\"M208 32H48a16 16 0 0 0-16 16v160a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16m0 176H48V48h160z\"/>",
	"b-rows": "<path fill=\"currentColor\" d=\"M208 136H48a16 16 0 0 0-16 16v40a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16v-40a16 16 0 0 0-16-16m0 56H48v-40h160zm0-144H48a16 16 0 0 0-16 16v40a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16V64a16 16 0 0 0-16-16m0 56H48V64h160z\"/>",
	"b-columns": "<path fill=\"currentColor\" d=\"M104 32H64a16 16 0 0 0-16 16v160a16 16 0 0 0 16 16h40a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16m0 176H64V48h40Zm88-176h-40a16 16 0 0 0-16 16v160a16 16 0 0 0 16 16h40a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16m0 176h-40V48h40Z\"/>",
	"b-grid-four": "<path fill=\"currentColor\" d=\"M200 40H56a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h144a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16m0 80h-64V56h64Zm-80-64v64H56V56Zm-64 80h64v64H56Zm144 64h-64v-64h64z\"/>",
	"b-text-t": "<path fill=\"currentColor\" d=\"M208 56v32a8 8 0 0 1-16 0V64h-56v128h24a8 8 0 0 1 0 16H96a8 8 0 0 1 0-16h24V64H64v24a8 8 0 0 1-16 0V56a8 8 0 0 1 8-8h144a8 8 0 0 1 8 8\"/>",
	"b-text-h": "<path fill=\"currentColor\" d=\"M208 56v144a8 8 0 0 1-16 0v-64H64v64a8 8 0 0 1-16 0V56a8 8 0 0 1 16 0v64h128V56a8 8 0 0 1 16 0\"/>",
	"b-text-aa": "<path fill=\"currentColor\" d=\"M87.24 52.59a8 8 0 0 0-14.48 0l-64 136a8 8 0 1 0 14.48 6.81L39.9 160h80.2l16.66 35.4a8 8 0 1 0 14.48-6.81ZM47.43 144L80 74.79L112.57 144ZM200 96c-12.76 0-22.73 3.47-29.63 10.32a8 8 0 0 0 11.26 11.36c3.8-3.77 10-5.68 18.37-5.68c13.23 0 24 9 24 20v3.22a42.76 42.76 0 0 0-24-7.22c-22.06 0-40 16.15-40 36s17.94 36 40 36a42.73 42.73 0 0 0 24-7.25a8 8 0 0 0 16-.75v-60c0-19.85-17.94-36-40-36m0 88c-13.23 0-24-9-24-20s10.77-20 24-20s24 9 24 20s-10.77 20-24 20\"/>",
	"b-link-simple": "<path fill=\"currentColor\" d=\"M165.66 90.34a8 8 0 0 1 0 11.32l-64 64a8 8 0 0 1-11.32-11.32l64-64a8 8 0 0 1 11.32 0M215.6 40.4a56 56 0 0 0-79.2 0l-30.06 30.05a8 8 0 0 0 11.32 11.32l30.06-30a40 40 0 0 1 56.57 56.56l-30.07 30.06a8 8 0 0 0 11.31 11.32l30.07-30.11a56 56 0 0 0 0-79.2m-77.26 133.82l-30.06 30.06a40 40 0 1 1-56.56-56.57l30.05-30.05a8 8 0 0 0-11.32-11.32L40.4 136.4a56 56 0 0 0 79.2 79.2l30.06-30.07a8 8 0 0 0-11.32-11.31\"/>",
	"b-image": "<path fill=\"currentColor\" d=\"M216 40H40a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16m0 16v102.75l-26.07-26.06a16 16 0 0 0-22.63 0l-20 20l-44-44a16 16 0 0 0-22.62 0L40 149.37V56ZM40 172l52-52l80 80H40Zm176 28h-21.37l-36-36l20-20L216 181.38zm-72-100a12 12 0 1 1 12 12a12 12 0 0 1-12-12\"/>",
	"b-star": "<path fill=\"currentColor\" d=\"M239.18 97.26A16.38 16.38 0 0 0 224.92 86l-59-4.76l-22.78-55.09a16.36 16.36 0 0 0-30.27 0L90.11 81.23L31.08 86a16.46 16.46 0 0 0-9.37 28.86l45 38.83L53 211.75a16.38 16.38 0 0 0 24.5 17.82l50.5-31.08l50.53 31.08A16.4 16.4 0 0 0 203 211.75l-13.76-58.07l45-38.83a16.43 16.43 0 0 0 4.94-17.59m-15.34 5.47l-48.7 42a8 8 0 0 0-2.56 7.91l14.88 62.8a.37.37 0 0 1-.17.48c-.18.14-.23.11-.38 0l-54.72-33.65a8 8 0 0 0-8.38 0l-54.72 33.67c-.15.09-.19.12-.38 0a.37.37 0 0 1-.17-.48l14.88-62.8a8 8 0 0 0-2.56-7.91l-48.7-42c-.12-.1-.23-.19-.13-.5s.18-.27.33-.29l63.92-5.16a8 8 0 0 0 6.72-4.94l24.62-59.61c.08-.17.11-.25.35-.25s.27.08.35.25L153 91.86a8 8 0 0 0 6.75 4.92l63.92 5.16c.15 0 .24 0 .33.29s0 .4-.16.5\"/>",
	"b-play-circle": "<path fill=\"currentColor\" d=\"M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88m48.24-94.78l-64-40A8 8 0 0 0 100 88v80a8 8 0 0 0 12.24 6.78l64-40a8 8 0 0 0 0-13.56M116 153.57v-51.14L156.91 128Z\"/>",
	"b-cursor-click": "<path fill=\"currentColor\" d=\"M88 24v-8a8 8 0 0 1 16 0v8a8 8 0 0 1-16 0m-72 80h8a8 8 0 0 0 0-16h-8a8 8 0 0 0 0 16m108.42-64.84a8 8 0 0 0 10.74-3.58l8-16a8 8 0 0 0-14.31-7.16l-8 16a8 8 0 0 0 3.57 10.74m-96 81.69l-16 8a8 8 0 0 0 7.16 14.31l16-8a8 8 0 1 0-7.16-14.31M219.31 184a16 16 0 0 1 0 22.63l-12.68 12.68a16 16 0 0 1-22.63 0L132.7 168L115 214.09c0 .1-.08.21-.13.32a15.83 15.83 0 0 1-14.6 9.59h-.79a15.83 15.83 0 0 1-14.41-11L32.8 52.92A16 16 0 0 1 52.92 32.8L213 85.07a16 16 0 0 1 1.41 29.8l-.32.13L168 132.69ZM208 195.31L156.69 144a16 16 0 0 1 4.93-26l.32-.14l45.95-17.64L48 48l52.2 159.86l17.65-46c0-.11.08-.22.13-.33a16 16 0 0 1 11.69-9.34a16.7 16.7 0 0 1 3-.28a16 16 0 0 1 11.3 4.69l51.34 51.4Z\"/>",
	"b-repeat": "<path fill=\"currentColor\" d=\"M24 128a72.08 72.08 0 0 1 72-72h108.69l-10.35-10.34a8 8 0 0 1 11.32-11.32l24 24a8 8 0 0 1 0 11.32l-24 24a8 8 0 0 1-11.32-11.32L204.69 72H96a56.06 56.06 0 0 0-56 56a8 8 0 0 1-16 0m200-8a8 8 0 0 0-8 8a56.06 56.06 0 0 1-56 56H51.31l10.35-10.34a8 8 0 0 0-11.32-11.32l-24 24a8 8 0 0 0 0 11.32l24 24a8 8 0 0 0 11.32-11.32L51.31 200H160a72.08 72.08 0 0 0 72-72a8 8 0 0 0-8-8\"/>",
	"b-article": "<path fill=\"currentColor\" d=\"M216 40H40a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16m0 160H40V56h176zM184 96a8 8 0 0 1-8 8H80a8 8 0 0 1 0-16h96a8 8 0 0 1 8 8m0 32a8 8 0 0 1-8 8H80a8 8 0 0 1 0-16h96a8 8 0 0 1 8 8m0 32a8 8 0 0 1-8 8H80a8 8 0 0 1 0-16h96a8 8 0 0 1 8 8\"/>",
	"b-diamond": "<path fill=\"currentColor\" d=\"m235.33 116.72l-96.05-96.06a16 16 0 0 0-22.56 0l-96 96.06a16 16 0 0 0 0 22.56l96.05 96.06a16 16 0 0 0 22.56 0l96.05-96.06a16 16 0 0 0 0-22.56ZM128 224l-96-96l96-96l96 96Z\"/>",
	"b-diamonds-four": "<path fill=\"currentColor\" d=\"M122.34 109.66a8 8 0 0 0 11.32 0l40-40a8 8 0 0 0 0-11.32l-40-40a8 8 0 0 0-11.32 0l-40 40a8 8 0 0 0 0 11.32ZM128 35.31L156.69 64L128 92.69L99.31 64Zm5.66 111a8 8 0 0 0-11.32 0l-40 40a8 8 0 0 0 0 11.32l40 40a8 8 0 0 0 11.32 0l40-40a8 8 0 0 0 0-11.32ZM128 220.69L99.31 192L128 163.31L156.69 192Zm109.66-98.35l-40-40a8 8 0 0 0-11.32 0l-40 40a8 8 0 0 0 0 11.32l40 40a8 8 0 0 0 11.32 0l40-40a8 8 0 0 0 0-11.32M192 156.69L163.31 128L192 99.31L220.69 128Zm-82.34-34.35l-40-40a8 8 0 0 0-11.32 0l-40 40a8 8 0 0 0 0 11.32l40 40a8 8 0 0 0 11.32 0l40-40a8 8 0 0 0 0-11.32M64 156.69L35.31 128L64 99.31L92.69 128Z\"/>",
	"b-stack": "<path fill=\"currentColor\" d=\"M230.91 172a8 8 0 0 1-2.91 10.91l-96 56a8 8 0 0 1-8.06 0l-96-56A8 8 0 0 1 36 169.09l92 53.65l92-53.65a8 8 0 0 1 10.91 2.91M220 121.09l-92 53.65l-92-53.65a8 8 0 0 0-8 13.82l96 56a8 8 0 0 0 8.06 0l96-56a8 8 0 1 0-8.06-13.82M24 80a8 8 0 0 1 4-6.91l96-56a8 8 0 0 1 8.06 0l96 56a8 8 0 0 1 0 13.82l-96 56a8 8 0 0 1-8.06 0l-96-56A8 8 0 0 1 24 80m23.88 0L128 126.74L208.12 80L128 33.26Z\"/>",
	"b-squares-four": "<path fill=\"currentColor\" d=\"M104 40H56a16 16 0 0 0-16 16v48a16 16 0 0 0 16 16h48a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16m0 64H56V56h48zm96-64h-48a16 16 0 0 0-16 16v48a16 16 0 0 0 16 16h48a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16m0 64h-48V56h48zm-96 32H56a16 16 0 0 0-16 16v48a16 16 0 0 0 16 16h48a16 16 0 0 0 16-16v-48a16 16 0 0 0-16-16m0 64H56v-48h48zm96-64h-48a16 16 0 0 0-16 16v48a16 16 0 0 0 16 16h48a16 16 0 0 0 16-16v-48a16 16 0 0 0-16-16m0 64h-48v-48h48z\"/>",
	"b-list-bullets": "<path fill=\"currentColor\" d=\"M80 64a8 8 0 0 1 8-8h128a8 8 0 0 1 0 16H88a8 8 0 0 1-8-8m136 56H88a8 8 0 0 0 0 16h128a8 8 0 0 0 0-16m0 64H88a8 8 0 0 0 0 16h128a8 8 0 0 0 0-16M44 52a12 12 0 1 0 12 12a12 12 0 0 0-12-12m0 64a12 12 0 1 0 12 12a12 12 0 0 0-12-12m0 64a12 12 0 1 0 12 12a12 12 0 0 0-12-12\"/>",
	"b-quotes": "<path fill=\"currentColor\" d=\"M100 56H40a16 16 0 0 0-16 16v64a16 16 0 0 0 16 16h60v8a32 32 0 0 1-32 32a8 8 0 0 0 0 16a48.05 48.05 0 0 0 48-48V72a16 16 0 0 0-16-16m0 80H40V72h60Zm116-80h-60a16 16 0 0 0-16 16v64a16 16 0 0 0 16 16h60v8a32 32 0 0 1-32 32a8 8 0 0 0 0 16a48.05 48.05 0 0 0 48-48V72a16 16 0 0 0-16-16m0 80h-60V72h60Z\"/>",
	"b-code": "<path fill=\"currentColor\" d=\"M69.12 94.15L28.5 128l40.62 33.85a8 8 0 1 1-10.24 12.29l-48-40a8 8 0 0 1 0-12.29l48-40a8 8 0 0 1 10.24 12.3m176 27.7l-48-40a8 8 0 1 0-10.24 12.3L227.5 128l-40.62 33.85a8 8 0 1 0 10.24 12.29l48-40a8 8 0 0 0 0-12.29m-82.39-89.37a8 8 0 0 0-10.25 4.79l-64 176a8 8 0 0 0 4.79 10.26A8.1 8.1 0 0 0 96 224a8 8 0 0 0 7.52-5.27l64-176a8 8 0 0 0-4.79-10.25\"/>",
	"b-info": "<path fill=\"currentColor\" d=\"M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88m16-40a8 8 0 0 1-8 8a16 16 0 0 1-16-16v-40a8 8 0 0 1 0-16a16 16 0 0 1 16 16v40a8 8 0 0 1 8 8m-32-92a12 12 0 1 1 12 12a12 12 0 0 1-12-12\"/>",
	"b-table": "<path fill=\"currentColor\" d=\"M224 48H32a8 8 0 0 0-8 8v136a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a8 8 0 0 0-8-8M40 112h40v32H40Zm56 0h120v32H96Zm120-48v32H40V64ZM40 160h40v32H40Zm176 32H96v-32h120z\"/>",
	"b-minus": "<path fill=\"currentColor\" d=\"M224 128a8 8 0 0 1-8 8H40a8 8 0 0 1 0-16h176a8 8 0 0 1 8 8\"/>",
	"b-arrows-vertical": "<path fill=\"currentColor\" d=\"M165.66 194.34a8 8 0 0 1 0 11.32l-32 32a8 8 0 0 1-11.32 0l-32-32a8 8 0 0 1 11.32-11.32L120 212.69V43.31l-18.34 18.35a8 8 0 0 1-11.32-11.32l32-32a8 8 0 0 1 11.32 0l32 32a8 8 0 0 1-11.32 11.32L136 43.31v169.38l18.34-18.35a8 8 0 0 1 11.32 0\"/>",
	"b-magnifying-glass": "<path fill=\"currentColor\" d=\"m229.66 218.34l-50.07-50.06a88.11 88.11 0 1 0-11.31 11.31l50.06 50.07a8 8 0 0 0 11.32-11.32M40 112a72 72 0 1 1 72 72a72.08 72.08 0 0 1-72-72\"/>",
	"b-list-dashes": "<path fill=\"currentColor\" d=\"M88 64a8 8 0 0 1 8-8h120a8 8 0 0 1 0 16H96a8 8 0 0 1-8-8m128 56H96a8 8 0 0 0 0 16h120a8 8 0 0 0 0-16m0 64H96a8 8 0 0 0 0 16h120a8 8 0 0 0 0-16M56 56H40a8 8 0 0 0 0 16h16a8 8 0 0 0 0-16m0 64H40a8 8 0 0 0 0 16h16a8 8 0 0 0 0-16m0 64H40a8 8 0 0 0 0 16h16a8 8 0 0 0 0-16\"/>",
	"b-browser": "<path fill=\"currentColor\" d=\"M216 40H40a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16m0 16v32H40V56Zm0 144H40v-96h176z\"/>",
	"b-video-camera": "<path fill=\"currentColor\" d=\"M251.77 73a8 8 0 0 0-8.21.39L208 97.05V72a16 16 0 0 0-16-16H32a16 16 0 0 0-16 16v112a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16v-25l35.56 23.71A8 8 0 0 0 248 184a8 8 0 0 0 8-8V80a8 8 0 0 0-4.23-7M192 184H32V72h160zm48-22.95l-32-21.33v-23.44L240 95Z\"/>",
	"b-frame-corners": "<path fill=\"currentColor\" d=\"M200 80v32a8 8 0 0 1-16 0V88h-24a8 8 0 0 1 0-16h32a8 8 0 0 1 8 8M96 168H72v-24a8 8 0 0 0-16 0v32a8 8 0 0 0 8 8h32a8 8 0 0 0 0-16M232 56v144a16 16 0 0 1-16 16H40a16 16 0 0 1-16-16V56a16 16 0 0 1 16-16h176a16 16 0 0 1 16 16m-16 144V56H40v144z\"/>",
	"b-cards": "<path fill=\"currentColor\" d=\"M184 72H40a16 16 0 0 0-16 16v112a16 16 0 0 0 16 16h144a16 16 0 0 0 16-16V88a16 16 0 0 0-16-16m0 128H40V88h144zm48-144v120a8 8 0 0 1-16 0V56H64a8 8 0 0 1 0-16h152a16 16 0 0 1 16 16\"/>",
	"b-circle-dashed": "<path fill=\"currentColor\" d=\"M96.26 37.05a8 8 0 0 1 5.74-9.76a104.1 104.1 0 0 1 52 0a8 8 0 0 1-2 15.75a8.2 8.2 0 0 1-2-.26a88.1 88.1 0 0 0-44 0a8 8 0 0 1-9.74-5.73M53.79 55.14a104.05 104.05 0 0 0-26 45a8 8 0 0 0 15.42 4.27a88 88 0 0 1 22-38.09a8 8 0 0 0-11.42-11.18m-10.58 96.41a8 8 0 1 0-15.42 4.28a104.1 104.1 0 0 0 26 45a8 8 0 0 0 11.41-11.22a88.14 88.14 0 0 1-21.99-38.06M150 213.22a88 88 0 0 1-44 0a8 8 0 1 0-4 15.49a104.1 104.1 0 0 0 52 0a8 8 0 0 0-4-15.49M222.65 146a8 8 0 0 0-9.85 5.58a87.9 87.9 0 0 1-22 38.08a8 8 0 1 0 11.42 11.21a104 104 0 0 0 26-45a8 8 0 0 0-5.57-9.87m-9.86-41.54a8 8 0 0 0 15.42-4.28a104 104 0 0 0-26-45A8 8 0 1 0 190.8 66.4a88 88 0 0 1 21.99 38.05Z\"/>",
	"b-text-indent": "<path fill=\"currentColor\" d=\"M224 128a8 8 0 0 1-8 8H112a8 8 0 0 1 0-16h104a8 8 0 0 1 8 8M112 72h104a8 8 0 0 0 0-16H112a8 8 0 0 0 0 16m104 112H40a8 8 0 0 0 0 16h176a8 8 0 0 0 0-16M34.34 141.66a8 8 0 0 0 11.32 0l40-40a8 8 0 0 0 0-11.32l-40-40a8 8 0 0 0-11.32 11.32L68.69 96l-34.35 34.34a8 8 0 0 0 0 11.32\"/>",
	"b-textbox": "<path fill=\"currentColor\" d=\"M112 40a8 8 0 0 0-8 8v16H24A16 16 0 0 0 8 80v96a16 16 0 0 0 16 16h80v16a8 8 0 0 0 16 0V48a8 8 0 0 0-8-8M24 176V80h80v96Zm224-96v96a16 16 0 0 1-16 16h-88a8 8 0 0 1 0-16h88V80h-88a8 8 0 0 1 0-16h88a16 16 0 0 1 16 16M88 112a8 8 0 0 1-8 8h-8v24a8 8 0 0 1-16 0v-24h-8a8 8 0 0 1 0-16h32a8 8 0 0 1 8 8\"/>",
	"b-check-square": "<path fill=\"currentColor\" d=\"M173.66 98.34a8 8 0 0 1 0 11.32l-56 56a8 8 0 0 1-11.32 0l-24-24a8 8 0 0 1 11.32-11.32L112 148.69l50.34-50.35a8 8 0 0 1 11.32 0M224 48v160a16 16 0 0 1-16 16H48a16 16 0 0 1-16-16V48a16 16 0 0 1 16-16h160a16 16 0 0 1 16 16m-16 160V48H48v160z\"/>",
	"b-list-checks": "<path fill=\"currentColor\" d=\"M224 128a8 8 0 0 1-8 8h-88a8 8 0 0 1 0-16h88a8 8 0 0 1 8 8m-96-56h88a8 8 0 0 0 0-16h-88a8 8 0 0 0 0 16m88 112h-88a8 8 0 0 0 0 16h88a8 8 0 0 0 0-16M82.34 42.34L56 68.69L45.66 58.34a8 8 0 0 0-11.32 11.32l16 16a8 8 0 0 0 11.32 0l32-32a8 8 0 0 0-11.32-11.32m0 64L56 132.69l-10.34-10.35a8 8 0 0 0-11.32 11.32l16 16a8 8 0 0 0 11.32 0l32-32a8 8 0 0 0-11.32-11.32m0 64L56 196.69l-10.34-10.35a8 8 0 0 0-11.32 11.32l16 16a8 8 0 0 0 11.32 0l32-32a8 8 0 0 0-11.32-11.32\"/>",
	"b-upload-simple": "<path fill=\"currentColor\" d=\"M224 144v64a8 8 0 0 1-8 8H40a8 8 0 0 1-8-8v-64a8 8 0 0 1 16 0v56h160v-56a8 8 0 0 1 16 0M93.66 77.66L120 51.31V144a8 8 0 0 0 16 0V51.31l26.34 26.35a8 8 0 0 0 11.32-11.32l-40-40a8 8 0 0 0-11.32 0l-40 40a8 8 0 0 0 11.32 11.32\"/>",
	"b-calendar-blank": "<path fill=\"currentColor\" d=\"M208 32h-24v-8a8 8 0 0 0-16 0v8H88v-8a8 8 0 0 0-16 0v8H48a16 16 0 0 0-16 16v160a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16M72 48v8a8 8 0 0 0 16 0v-8h80v8a8 8 0 0 0 16 0v-8h24v32H48V48Zm136 160H48V96h160z\"/>",
	"b-hash": "<path fill=\"currentColor\" d=\"M224 88h-48.6l8.47-46.57a8 8 0 0 0-15.74-2.86l-9 49.43H111.4l8.47-46.57a8 8 0 0 0-15.74-2.86L95.14 88H48a8 8 0 0 0 0 16h44.23l-8.73 48H32a8 8 0 0 0 0 16h48.6l-8.47 46.57a8 8 0 0 0 6.44 9.3A8 8 0 0 0 80 224a8 8 0 0 0 7.86-6.57l9-49.43h47.74l-8.47 46.57a8 8 0 0 0 6.44 9.3a8 8 0 0 0 1.43.13a8 8 0 0 0 7.86-6.57l9-49.43H208a8 8 0 0 0 0-16h-44.23l8.73-48H224a8 8 0 0 0 0-16m-76.5 64H99.77l8.73-48h47.73Z\"/>",
	"b-at": "<path fill=\"currentColor\" d=\"M128 24a104 104 0 0 0 0 208c21.51 0 44.1-6.48 60.43-17.33a8 8 0 0 0-8.86-13.33C166 210.38 146.21 216 128 216a88 88 0 1 1 88-88c0 26.45-10.88 32-20 32s-20-5.55-20-32V88a8 8 0 0 0-16 0v4.26a48 48 0 1 0 5.93 65.1c6 12 16.35 18.64 30.07 18.64c22.54 0 36-17.94 36-48A104.11 104.11 0 0 0 128 24m0 136a32 32 0 1 1 32-32a32 32 0 0 1-32 32\"/>",
	"b-phone": "<path fill=\"currentColor\" d=\"m222.37 158.46l-47.11-21.11l-.13-.06a16 16 0 0 0-15.17 1.4a8 8 0 0 0-.75.56L134.87 160c-15.42-7.49-31.34-23.29-38.83-38.51l20.78-24.71c.2-.25.39-.5.57-.77a16 16 0 0 0 1.32-15.06v-.12L97.54 33.64a16 16 0 0 0-16.62-9.52A56.26 56.26 0 0 0 32 80c0 79.4 64.6 144 144 144a56.26 56.26 0 0 0 55.88-48.92a16 16 0 0 0-9.51-16.62M176 208A128.14 128.14 0 0 1 48 80a40.2 40.2 0 0 1 34.87-40a.6.6 0 0 0 0 .12l21 47l-20.67 24.74a6 6 0 0 0-.57.77a16 16 0 0 0-1 15.7c9.06 18.53 27.73 37.06 46.46 46.11a16 16 0 0 0 15.75-1.14a8 8 0 0 0 .74-.56L168.89 152l47 21.05h.11A40.21 40.21 0 0 1 176 208\"/>",
	"b-globe-simple": "<path fill=\"currentColor\" d=\"M128 24a104 104 0 1 0 104 104A104.12 104.12 0 0 0 128 24m87.62 96h-39.83c-1.79-36.51-15.85-62.33-27.38-77.6a88.19 88.19 0 0 1 67.22 77.6ZM96.23 136h63.54c-2.31 41.61-22.23 67.11-31.77 77c-9.55-9.9-29.46-35.4-31.77-77m0-16c2.31-41.61 22.23-67.11 31.77-77c9.55 9.93 29.46 35.43 31.77 77Zm11.36-77.6C96.06 57.67 82 83.49 80.21 120H40.37a88.19 88.19 0 0 1 67.22-77.6M40.37 136h39.84c1.82 36.51 15.85 62.33 27.38 77.6A88.19 88.19 0 0 1 40.37 136m108 77.6c11.53-15.27 25.56-41.09 27.38-77.6h39.84a88.19 88.19 0 0 1-67.18 77.6Z\"/>",
	"b-toggle-left": "<path fill=\"currentColor\" d=\"M176 56H80a72 72 0 0 0 0 144h96a72 72 0 0 0 0-144m0 128H80a56 56 0 0 1 0-112h96a56 56 0 0 1 0 112M80 88a40 40 0 1 0 40 40a40 40 0 0 0-40-40m0 64a24 24 0 1 1 24-24a24 24 0 0 1-24 24\"/>",
	"b-radio-button": "<path fill=\"currentColor\" d=\"M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88m0-144a56 56 0 1 0 56 56a56.06 56.06 0 0 0-56-56m0 96a40 40 0 1 1 40-40a40 40 0 0 1-40 40\"/>",
	"b-caret-circle-down": "<path fill=\"currentColor\" d=\"M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88m45.66-109.66a8 8 0 0 1 0 11.32l-40 40a8 8 0 0 1-11.32 0l-40-40a8 8 0 0 1 11.32-11.32L128 140.69l34.34-34.35a8 8 0 0 1 11.32 0\"/>",
	"b-paperclip": "<path fill=\"currentColor\" d=\"M209.66 122.34a8 8 0 0 1 0 11.32l-82.05 82a56 56 0 0 1-79.2-79.21l99.26-100.72a40 40 0 1 1 56.61 56.55L105 193a24 24 0 1 1-34-34l83.3-84.62a8 8 0 1 1 11.4 11.22l-83.31 84.71a8 8 0 1 0 11.27 11.36L192.93 81A24 24 0 1 0 159 47L59.76 147.68a40 40 0 1 0 56.53 56.62l82.06-82a8 8 0 0 1 11.31.04\"/>",
	"b-eye-slash": "<path fill=\"currentColor\" d=\"M53.92 34.62a8 8 0 1 0-11.84 10.76l19.24 21.17C25 88.84 9.38 123.2 8.69 124.76a8 8 0 0 0 0 6.5c.35.79 8.82 19.57 27.65 38.4C61.43 194.74 93.12 208 128 208a127.1 127.1 0 0 0 52.07-10.83l22 24.21a8 8 0 1 0 11.84-10.76Zm47.33 75.84l41.67 45.85a32 32 0 0 1-41.67-45.85M128 192c-30.78 0-57.67-11.19-79.93-33.25A133.2 133.2 0 0 1 25 128c4.69-8.79 19.66-33.39 47.35-49.38l18 19.75a48 48 0 0 0 63.66 70l14.73 16.2A112 112 0 0 1 128 192m6-95.43a8 8 0 0 1 3-15.72a48.16 48.16 0 0 1 38.77 42.64a8 8 0 0 1-7.22 8.71a6 6 0 0 1-.75 0a8 8 0 0 1-8-7.26A32.09 32.09 0 0 0 134 96.57m113.28 34.69c-.42.94-10.55 23.37-33.36 43.8a8 8 0 1 1-10.67-11.92a132.8 132.8 0 0 0 27.8-35.14a133.2 133.2 0 0 0-23.12-30.77C185.67 75.19 158.78 64 128 64a118.4 118.4 0 0 0-19.36 1.57A8 8 0 1 1 106 49.79A134 134 0 0 1 128 48c34.88 0 66.57 13.26 91.66 38.35c18.83 18.83 27.3 37.62 27.65 38.41a8 8 0 0 1 0 6.5Z\"/>",
	"b-shield-check": "<path fill=\"currentColor\" d=\"M208 40H48a16 16 0 0 0-16 16v56c0 52.72 25.52 84.67 46.93 102.19c23.06 18.86 46 25.26 47 25.53a8 8 0 0 0 4.2 0c1-.27 23.91-6.67 47-25.53C198.48 196.67 224 164.72 224 112V56a16 16 0 0 0-16-16m0 72c0 37.07-13.66 67.16-40.6 89.42a129.3 129.3 0 0 1-39.4 22.2a128.3 128.3 0 0 1-38.92-21.81C61.82 179.51 48 149.3 48 112V56h160ZM82.34 141.66a8 8 0 0 1 11.32-11.32L112 148.69l50.34-50.35a8 8 0 0 1 11.32 11.32l-56 56a8 8 0 0 1-11.32 0Z\"/>",
	"b-paper-plane-tilt": "<path fill=\"currentColor\" d=\"M227.32 28.68a16 16 0 0 0-15.66-4.08h-.15L19.57 82.84a16 16 0 0 0-2.49 29.8L102 154l41.3 84.87a15.86 15.86 0 0 0 14.44 9.13q.69 0 1.38-.06a15.88 15.88 0 0 0 14-11.51l58.2-191.94v-.15a16 16 0 0 0-4-15.66m-69.49 203.17l-.05.14v-.07l-40.06-82.3l48-48a8 8 0 0 0-11.31-11.31l-48 48l-82.33-40.06h-.07h.14L216 40Z\"/>",
	"b-align-left": "<path fill=\"currentColor\" d=\"M48 40v176a8 8 0 0 1-16 0V40a8 8 0 0 1 16 0m16 64V64a16 16 0 0 1 16-16h96a16 16 0 0 1 16 16v40a16 16 0 0 1-16 16H80a16 16 0 0 1-16-16m16 0h96V64H80Zm152 48v40a16 16 0 0 1-16 16H80a16 16 0 0 1-16-16v-40a16 16 0 0 1 16-16h136a16 16 0 0 1 16 16m-16 40v-40H80v40z\"/>",
	"b-align-center-horizontal": "<path fill=\"currentColor\" d=\"M208 136h-72v-16h48a16 16 0 0 0 16-16V64a16 16 0 0 0-16-16h-48V32a8 8 0 0 0-16 0v16H72a16 16 0 0 0-16 16v40a16 16 0 0 0 16 16h48v16H48a16 16 0 0 0-16 16v40a16 16 0 0 0 16 16h72v16a8 8 0 0 0 16 0v-16h72a16 16 0 0 0 16-16v-40a16 16 0 0 0-16-16M72 64h112v40H72Zm136 128H48v-40h160z\"/>",
	"b-align-right": "<path fill=\"currentColor\" d=\"M224 40v176a8 8 0 0 1-16 0V40a8 8 0 0 1 16 0m-32 24v40a16 16 0 0 1-16 16H80a16 16 0 0 1-16-16V64a16 16 0 0 1 16-16h96a16 16 0 0 1 16 16m-16 0H80v40h96Zm16 88v40a16 16 0 0 1-16 16H40a16 16 0 0 1-16-16v-40a16 16 0 0 1 16-16h136a16 16 0 0 1 16 16m-16 0H40v40h136Z\"/>",
	"b-align-top": "<path fill=\"currentColor\" d=\"M224 40a8 8 0 0 1-8 8H40a8 8 0 0 1 0-16h176a8 8 0 0 1 8 8m-16 40v96a16 16 0 0 1-16 16h-40a16 16 0 0 1-16-16V80a16 16 0 0 1 16-16h40a16 16 0 0 1 16 16m-16 0h-40v96h40Zm-72 0v136a16 16 0 0 1-16 16H64a16 16 0 0 1-16-16V80a16 16 0 0 1 16-16h40a16 16 0 0 1 16 16m-16 0H64v136h40Z\"/>",
	"b-align-center-vertical": "<path fill=\"currentColor\" d=\"M224 120h-16V72a16 16 0 0 0-16-16h-40a16 16 0 0 0-16 16v48h-16V48a16 16 0 0 0-16-16H64a16 16 0 0 0-16 16v72H32a8 8 0 0 0 0 16h16v72a16 16 0 0 0 16 16h40a16 16 0 0 0 16-16v-72h16v48a16 16 0 0 0 16 16h40a16 16 0 0 0 16-16v-48h16a8 8 0 0 0 0-16m-120 88H64V48h40Zm88-24h-40V72h40Z\"/>",
	"b-align-bottom": "<path fill=\"currentColor\" d=\"M224 216a8 8 0 0 1-8 8H40a8 8 0 0 1 0-16h176a8 8 0 0 1 8 8m-88-40V80a16 16 0 0 1 16-16h40a16 16 0 0 1 16 16v96a16 16 0 0 1-16 16h-40a16 16 0 0 1-16-16m16 0h40V80h-40Zm-104 0V40a16 16 0 0 1 16-16h40a16 16 0 0 1 16 16v136a16 16 0 0 1-16 16H64a16 16 0 0 1-16-16m16 0h40V40H64Z\"/>",
	"b-text-align-left": "<path fill=\"currentColor\" d=\"M32 64a8 8 0 0 1 8-8h176a8 8 0 0 1 0 16H40a8 8 0 0 1-8-8m8 48h128a8 8 0 0 0 0-16H40a8 8 0 0 0 0 16m176 24H40a8 8 0 0 0 0 16h176a8 8 0 0 0 0-16m-48 40H40a8 8 0 0 0 0 16h128a8 8 0 0 0 0-16\"/>",
	"b-text-align-center": "<path fill=\"currentColor\" d=\"M32 64a8 8 0 0 1 8-8h176a8 8 0 0 1 0 16H40a8 8 0 0 1-8-8m32 32a8 8 0 0 0 0 16h128a8 8 0 0 0 0-16Zm152 40H40a8 8 0 0 0 0 16h176a8 8 0 0 0 0-16m-24 40H64a8 8 0 0 0 0 16h128a8 8 0 0 0 0-16\"/>",
	"b-text-align-right": "<path fill=\"currentColor\" d=\"M32 64a8 8 0 0 1 8-8h176a8 8 0 0 1 0 16H40a8 8 0 0 1-8-8m184 32H88a8 8 0 0 0 0 16h128a8 8 0 0 0 0-16m0 40H40a8 8 0 0 0 0 16h176a8 8 0 0 0 0-16m0 40H88a8 8 0 0 0 0 16h128a8 8 0 0 0 0-16\"/>",
	"b-text-align-justify": "<path fill=\"currentColor\" d=\"M32 64a8 8 0 0 1 8-8h176a8 8 0 0 1 0 16H40a8 8 0 0 1-8-8m184 32H40a8 8 0 0 0 0 16h176a8 8 0 0 0 0-16m0 40H40a8 8 0 0 0 0 16h176a8 8 0 0 0 0-16m0 40H40a8 8 0 0 0 0 16h176a8 8 0 0 0 0-16\"/>",
	"b-text-underline": "<path fill=\"currentColor\" d=\"M200 224a8 8 0 0 1-8 8H64a8 8 0 0 1 0-16h128a8 8 0 0 1 8 8m-72-24a64.07 64.07 0 0 0 64-64V56a8 8 0 0 0-16 0v80a48 48 0 0 1-96 0V56a8 8 0 0 0-16 0v80a64.07 64.07 0 0 0 64 64\"/>",
	"b-text-strikethrough": "<path fill=\"currentColor\" d=\"M224 128a8 8 0 0 1-8 8h-40.07c9.19 7.11 16.07 17.2 16.07 32c0 13.34-7 25.7-19.75 34.79C160.33 211.31 144.61 216 128 216s-32.33-4.69-44.25-13.21C71 193.7 64 181.34 64 168a8 8 0 0 1 16 0c0 17.35 22 32 48 32s48-14.65 48-32c0-14.85-10.54-23.58-38.77-32H40a8 8 0 0 1 0-16h176a8 8 0 0 1 8 8M76.33 104a8 8 0 0 0 7.61-10.49a17.3 17.3 0 0 1-.83-5.51c0-18.24 19.3-32 44.89-32c18.84 0 34.16 7.42 41 19.85a8 8 0 0 0 14-7.7C173.33 50.52 152.77 40 128 40c-34.71 0-60.89 20.63-60.89 48a33.7 33.7 0 0 0 1.62 10.49a8 8 0 0 0 7.6 5.51\"/>",
	"b-text-italic": "<path fill=\"currentColor\" d=\"M200 56a8 8 0 0 1-8 8h-34.23L115.1 192H144a8 8 0 0 1 0 16H64a8 8 0 0 1 0-16h34.23L140.9 64H112a8 8 0 0 1 0-16h80a8 8 0 0 1 8 8\"/>",
	"b-arrow-down": "<path fill=\"currentColor\" d=\"m205.66 149.66l-72 72a8 8 0 0 1-11.32 0l-72-72a8 8 0 0 1 11.32-11.32L120 196.69V40a8 8 0 0 1 16 0v156.69l58.34-58.35a8 8 0 0 1 11.32 11.32\"/>",
	"b-arrow-right": "<path fill=\"currentColor\" d=\"m221.66 133.66l-72 72a8 8 0 0 1-11.32-11.32L196.69 136H40a8 8 0 0 1 0-16h156.69l-58.35-58.34a8 8 0 0 1 11.32-11.32l72 72a8 8 0 0 1 0 11.32\"/>",
	"b-arrow-up": "<path fill=\"currentColor\" d=\"M205.66 117.66a8 8 0 0 1-11.32 0L136 59.31V216a8 8 0 0 1-16 0V59.31l-58.34 58.35a8 8 0 0 1-11.32-11.32l72-72a8 8 0 0 1 11.32 0l72 72a8 8 0 0 1 0 11.32\"/>",
	"b-arrow-left": "<path fill=\"currentColor\" d=\"M224 128a8 8 0 0 1-8 8H59.31l58.35 58.34a8 8 0 0 1-11.32 11.32l-72-72a8 8 0 0 1 0-11.32l72-72a8 8 0 0 1 11.32 11.32L59.31 120H216a8 8 0 0 1 8 8\"/>",
	"b-arrows-out-line-horizontal": "<path fill=\"currentColor\" d=\"M136 40v176a8 8 0 0 1-16 0V40a8 8 0 0 1 16 0m-40 80H35.31l18.35-18.34a8 8 0 0 0-11.32-11.32l-32 32a8 8 0 0 0 0 11.32l32 32a8 8 0 0 0 11.32-11.32L35.31 136H96a8 8 0 0 0 0-16m149.66 2.34l-32-32a8 8 0 0 0-11.32 11.32L220.69 120H160a8 8 0 0 0 0 16h60.69l-18.35 18.34a8 8 0 0 0 11.32 11.32l32-32a8 8 0 0 0 0-11.32\"/>",
	"b-arrows-in-line-horizontal": "<path fill=\"currentColor\" d=\"M136 40v176a8 8 0 0 1-16 0V40a8 8 0 0 1 16 0M69.66 90.34a8 8 0 0 0-11.32 11.32L76.69 120H16a8 8 0 0 0 0 16h60.69l-18.35 18.34a8 8 0 0 0 11.32 11.32l32-32a8 8 0 0 0 0-11.32ZM240 120h-60.69l18.35-18.34a8 8 0 0 0-11.32-11.32l-32 32a8 8 0 0 0 0 11.32l32 32a8 8 0 0 0 11.32-11.32L179.31 136H240a8 8 0 0 0 0-16\"/>",
	"b-arrows-out-line-vertical": "<path fill=\"currentColor\" d=\"M224 128a8 8 0 0 1-8 8H40a8 8 0 0 1 0-16h176a8 8 0 0 1 8 8M101.66 53.66L120 35.31V96a8 8 0 0 0 16 0V35.31l18.34 18.35a8 8 0 0 0 11.32-11.32l-32-32a8 8 0 0 0-11.32 0l-32 32a8 8 0 0 0 11.32 11.32m52.68 148.68L136 220.69V160a8 8 0 0 0-16 0v60.69l-18.34-18.35a8 8 0 0 0-11.32 11.32l32 32a8 8 0 0 0 11.32 0l32-32a8 8 0 0 0-11.32-11.32\"/>",
	"b-arrows-in-line-vertical": "<path fill=\"currentColor\" d=\"M224 128a8 8 0 0 1-8 8H40a8 8 0 0 1 0-16h176a8 8 0 0 1 8 8m-101.66-26.34a8 8 0 0 0 11.32 0l32-32a8 8 0 0 0-11.32-11.32L136 76.69V16a8 8 0 0 0-16 0v60.69l-18.34-18.35a8 8 0 0 0-11.32 11.32Zm11.32 52.68a8 8 0 0 0-11.32 0l-32 32a8 8 0 0 0 11.32 11.32L120 179.31V240a8 8 0 0 0 16 0v-60.69l18.34 18.35a8 8 0 0 0 11.32-11.32Z\"/>",
	"b-arrow-u-down-left": "<path fill=\"currentColor\" d=\"M232 112a64.07 64.07 0 0 1-64 64H51.31l34.35 34.34a8 8 0 0 1-11.32 11.32l-48-48a8 8 0 0 1 0-11.32l48-48a8 8 0 0 1 11.32 11.32L51.31 160H168a48 48 0 0 0 0-96H80a8 8 0 0 1 0-16h88a64.07 64.07 0 0 1 64 64\"/>",
	"b-corners-out": "<path fill=\"currentColor\" d=\"M216 48v40a8 8 0 0 1-16 0V56h-32a8 8 0 0 1 0-16h40a8 8 0 0 1 8 8M88 200H56v-32a8 8 0 0 0-16 0v40a8 8 0 0 0 8 8h40a8 8 0 0 0 0-16m120-40a8 8 0 0 0-8 8v32h-32a8 8 0 0 0 0 16h40a8 8 0 0 0 8-8v-40a8 8 0 0 0-8-8M88 40H48a8 8 0 0 0-8 8v40a8 8 0 0 0 16 0V56h32a8 8 0 0 0 0-16\"/>",
	"b-link": "<path fill=\"currentColor\" d=\"M240 88.23a54.43 54.43 0 0 1-16 37L189.25 160a54.27 54.27 0 0 1-38.63 16h-.05A54.63 54.63 0 0 1 96 119.84a8 8 0 0 1 16 .45A38.62 38.62 0 0 0 150.58 160a38.4 38.4 0 0 0 27.31-11.31l34.75-34.75a38.63 38.63 0 0 0-54.63-54.63l-11 11A8 8 0 0 1 135.7 59l11-11a54.65 54.65 0 0 1 77.3 0a54.86 54.86 0 0 1 16 40.23m-131 97.43l-11 11A38.4 38.4 0 0 1 70.6 208a38.63 38.63 0 0 1-27.29-65.94L78 107.31a38.63 38.63 0 0 1 66 28.4a8 8 0 0 0 16 .45A54.86 54.86 0 0 0 144 96a54.65 54.65 0 0 0-77.27 0L32 130.75A54.62 54.62 0 0 0 70.56 224a54.28 54.28 0 0 0 38.64-16l11-11a8 8 0 0 0-11.2-11.34\"/>",
	"b-link-break": "<path fill=\"currentColor\" d=\"M198.63 57.37a32 32 0 0 0-45.19-.06l-11.65 12.21a8 8 0 0 1-11.58-11l11.72-12.29a2 2 0 0 1 .13-.13a48 48 0 0 1 67.88 67.88a2 2 0 0 1-.13.13l-12.29 11.72a8 8 0 0 1-11-11.58l12.21-11.65a32 32 0 0 0-.1-45.23m-84.42 129.11l-11.65 12.21a32 32 0 0 1-45.25-45.25l12.21-11.65a8 8 0 0 0-11-11.58l-12.33 11.72a2 2 0 0 0-.13.13a48 48 0 0 0 67.88 67.88a2 2 0 0 0 .13-.13l11.72-12.29a8 8 0 1 0-11.58-11ZM216 152h-24a8 8 0 0 0 0 16h24a8 8 0 0 0 0-16M40 104h24a8 8 0 0 0 0-16H40a8 8 0 0 0 0 16m120 80a8 8 0 0 0-8 8v24a8 8 0 0 0 16 0v-24a8 8 0 0 0-8-8M96 72a8 8 0 0 0 8-8V40a8 8 0 0 0-16 0v24a8 8 0 0 0 8 8\"/>",
	"b-crosshair": "<path fill=\"currentColor\" d=\"M232 120h-8.34A96.14 96.14 0 0 0 136 32.34V24a8 8 0 0 0-16 0v8.34A96.14 96.14 0 0 0 32.34 120H24a8 8 0 0 0 0 16h8.34A96.14 96.14 0 0 0 120 223.66V232a8 8 0 0 0 16 0v-8.34A96.14 96.14 0 0 0 223.66 136H232a8 8 0 0 0 0-16m-96 87.6V200a8 8 0 0 0-16 0v7.6A80.15 80.15 0 0 1 48.4 136H56a8 8 0 0 0 0-16h-7.6A80.15 80.15 0 0 1 120 48.4V56a8 8 0 0 0 16 0v-7.6a80.15 80.15 0 0 1 71.6 71.6H200a8 8 0 0 0 0 16h7.6a80.15 80.15 0 0 1-71.6 71.6M128 88a40 40 0 1 0 40 40a40 40 0 0 0-40-40m0 64a24 24 0 1 1 24-24a24 24 0 0 1-24 24\"/>",
	"b-push-pin": "<path fill=\"currentColor\" d=\"m235.32 81.37l-60.69-60.68a16 16 0 0 0-22.63 0l-53.63 53.8c-10.66-3.34-35-7.37-60.4 13.14a16 16 0 0 0-1.29 23.78L85 159.71l-42.66 42.63a8 8 0 0 0 11.32 11.32L96.29 171l48.29 48.29A16 16 0 0 0 155.9 224h1.13a15.93 15.93 0 0 0 11.64-6.33c19.64-26.1 17.75-47.32 13.19-60L235.33 104a16 16 0 0 0-.01-22.63M224 92.69l-57.27 57.46a8 8 0 0 0-1.49 9.22c9.46 18.93-1.8 38.59-9.34 48.62L48 100.08c12.08-9.74 23.64-12.31 32.48-12.31A40.1 40.1 0 0 1 96.81 91a8 8 0 0 0 9.25-1.51L163.32 32L224 92.68Z\"/>",
	"b-anchor": "<path fill=\"currentColor\" d=\"M216 136a8 8 0 0 0-8 8c0 24.69-13.77 29.64-38.1 36.28c-11.36 3.1-24.12 6.6-33.9 14.34V128h32a8 8 0 0 0 0-16h-32V87a32 32 0 1 0-16 0v25H88a8 8 0 0 0 0 16h32v66.62c-9.78-7.74-22.54-11.24-33.9-14.34C61.77 173.64 48 168.69 48 144a8 8 0 0 0-16 0c0 38.11 27.67 45.66 49.9 51.72c24.33 6.64 38.1 11.59 38.1 36.28a8 8 0 0 0 16 0c0-24.69 13.77-29.64 38.1-36.28c22.23-6.06 49.9-13.61 49.9-51.72a8 8 0 0 0-8-8M112 56a16 16 0 1 1 16 16a16 16 0 0 1-16-16\"/>",
	"b-drop": "<path fill=\"currentColor\" d=\"M174 47.75a254.2 254.2 0 0 0-41.45-38.3a8 8 0 0 0-9.18 0A254.2 254.2 0 0 0 82 47.75C54.51 79.32 40 112.6 40 144a88 88 0 0 0 176 0c0-31.4-14.51-64.68-42-96.25M128 216a72.08 72.08 0 0 1-72-72c0-57.23 55.47-105 72-118c16.53 13 72 60.75 72 118a72.08 72.08 0 0 1-72 72m55.89-62.66a57.6 57.6 0 0 1-46.56 46.55a9 9 0 0 1-1.33.11a8 8 0 0 1-1.32-15.89c16.57-2.79 30.63-16.85 33.44-33.45a8 8 0 0 1 15.78 2.68Z\"/>",
	"b-drop-half": "<path fill=\"currentColor\" d=\"M174 47.75a254.2 254.2 0 0 0-41.45-38.3a8 8 0 0 0-9.18 0A254.2 254.2 0 0 0 82 47.75C54.51 79.32 40 112.6 40 144a88 88 0 0 0 176 0c0-31.4-14.51-64.68-42-96.25M200 144a71 71 0 0 1-.46 8H136v-16h63.64q.36 4 .36 8m-16.61-56H136V72h36.89a176 176 0 0 1 10.5 16M136 200h37.19A71.67 71.67 0 0 1 136 215.54Zm0-16v-16h59.87a72 72 0 0 1-8 16Zm0-64v-16h55.39a117 117 0 0 1 5.45 16Zm23.89-64H136V32.6A257 257 0 0 1 159.89 56M56 144c0-50 42.26-92.71 64-111.4v182.94A72.08 72.08 0 0 1 56 144\"/>",
	"b-circle-half": "<path fill=\"currentColor\" d=\"M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m8 16.37a86.4 86.4 0 0 1 16 3v169.3a86.4 86.4 0 0 1-16 3Zm32 9.26a87.8 87.8 0 0 1 16 10.54v135.66a87.8 87.8 0 0 1-16 10.54ZM40 128a88.11 88.11 0 0 1 80-87.63v175.26A88.11 88.11 0 0 1 40 128m160 50.54V77.46a87.82 87.82 0 0 1 0 101.08\"/>",
	"b-cursor": "<path fill=\"currentColor\" d=\"M168 132.69L214.08 115l.33-.13a16 16 0 0 0-1.41-29.8L52.92 32.8A15.95 15.95 0 0 0 32.8 52.92L85.07 213a15.82 15.82 0 0 0 14.41 11h.78a15.84 15.84 0 0 0 14.61-9.59l.13-.33L132.69 168L184 219.31a16 16 0 0 0 22.63 0l12.68-12.68a16 16 0 0 0 0-22.63ZM195.31 208L144 156.69a16 16 0 0 0-26 4.93c0 .11-.09.22-.13.32l-17.65 46L48 48l159.85 52.2l-45.95 17.64l-.32.13a16 16 0 0 0-4.93 26L208 195.31Z\"/>",
	"b-magic-wand": "<path fill=\"currentColor\" d=\"M48 64a8 8 0 0 1 8-8h16V40a8 8 0 0 1 16 0v16h16a8 8 0 0 1 0 16H88v16a8 8 0 0 1-16 0V72H56a8 8 0 0 1-8-8m136 128h-8v-8a8 8 0 0 0-16 0v8h-8a8 8 0 0 0 0 16h8v8a8 8 0 0 0 16 0v-8h8a8 8 0 0 0 0-16m56-48h-16v-16a8 8 0 0 0-16 0v16h-16a8 8 0 0 0 0 16h16v16a8 8 0 0 0 16 0v-16h16a8 8 0 0 0 0-16m-20.69-64L80 219.31a16 16 0 0 1-22.62 0l-20.7-20.68a16 16 0 0 1 0-22.63L176 36.69a16 16 0 0 1 22.63 0l20.68 20.68a16 16 0 0 1 0 22.63m-54.63 32L144 91.31l-96 96L68.68 208ZM208 68.69L187.31 48l-32 32L176 100.69Z\"/>",
	"b-lightning": "<path fill=\"currentColor\" d=\"M215.79 118.17a8 8 0 0 0-5-5.66L153.18 90.9l14.66-73.33a8 8 0 0 0-13.69-7l-112 120a8 8 0 0 0 3 13l57.63 21.61l-14.62 73.25a8 8 0 0 0 13.69 7l112-120a8 8 0 0 0 1.94-7.26M109.37 214l10.47-52.38a8 8 0 0 0-5-9.06L62 132.71l84.62-90.66l-10.46 52.38a8 8 0 0 0 5 9.06l52.8 19.8Z\"/>",
	"b-timer": "<path fill=\"currentColor\" d=\"M128 40a96 96 0 1 0 96 96a96.11 96.11 0 0 0-96-96m0 176a80 80 0 1 1 80-80a80.09 80.09 0 0 1-80 80m45.66-125.66a8 8 0 0 1 0 11.32l-40 40a8 8 0 0 1-11.32-11.32l40-40a8 8 0 0 1 11.32 0M96 16a8 8 0 0 1 8-8h48a8 8 0 0 1 0 16h-48a8 8 0 0 1-8-8\"/>",
	"b-arrows-clockwise": "<path fill=\"currentColor\" d=\"M224 48v48a8 8 0 0 1-8 8h-48a8 8 0 0 1 0-16h28.69l-14.63-14.63a79.56 79.56 0 0 0-56.13-23.43h-.45a79.52 79.52 0 0 0-55.89 22.77a8 8 0 0 1-11.18-11.44a96 96 0 0 1 135 .79L208 76.69V48a8 8 0 0 1 16 0m-37.59 135.29a80 80 0 0 1-112.47-.66L59.31 168H88a8 8 0 0 0 0-16H40a8 8 0 0 0-8 8v48a8 8 0 0 0 16 0v-28.69l14.63 14.63A95.43 95.43 0 0 0 130 222.06h.53a95.36 95.36 0 0 0 67.07-27.33a8 8 0 0 0-11.18-11.44Z\"/>",
	"b-hand-pointing": "<path fill=\"currentColor\" d=\"M196 88a27.86 27.86 0 0 0-13.35 3.39A28 28 0 0 0 144 74.7V44a28 28 0 0 0-56 0v80l-3.82-6.13A28 28 0 0 0 35.73 146l4.67 8.23C74.81 214.89 89.05 240 136 240a88.1 88.1 0 0 0 88-88v-36a28 28 0 0 0-28-28m12 64a72.08 72.08 0 0 1-72 72c-37.63 0-47.84-18-81.68-77.68l-4.69-8.27V138A12 12 0 0 1 54 121.61a11.9 11.9 0 0 1 6-1.6a12 12 0 0 1 10.41 6a2 2 0 0 0 .14.23l18.67 30A8 8 0 0 0 104 152V44a12 12 0 0 1 24 0v68a8 8 0 0 0 16 0v-12a12 12 0 0 1 24 0v20a8 8 0 0 0 16 0v-4a12 12 0 0 1 24 0Z\"/>",
	"b-hand-tap": "<path fill=\"currentColor\" d=\"M56 76a60 60 0 0 1 120 0a8 8 0 0 1-16 0a44 44 0 0 0-88 0a8 8 0 1 1-16 0m140 44a27.9 27.9 0 0 0-13.36 3.39A28 28 0 0 0 144 106.7V76a28 28 0 0 0-56 0v80l-3.82-6.13a28 28 0 0 0-48.41 28.17l29.32 50a8 8 0 1 0 13.8-8.04L49.6 170a12 12 0 1 1 20.78-12l.14.23l18.68 30A8 8 0 0 0 104 184V76a12 12 0 0 1 24 0v68a8 8 0 1 0 16 0v-12a12 12 0 0 1 24 0v20a8 8 0 0 0 16 0v-4a12 12 0 0 1 24 0v36c0 21.61-7.1 36.3-7.16 36.42a8 8 0 0 0 3.58 10.73a7.9 7.9 0 0 0 3.58.85a8 8 0 0 0 7.16-4.42c.37-.73 8.85-18 8.85-43.58v-36A28 28 0 0 0 196 120\"/>",
	"b-eye": "<path fill=\"currentColor\" d=\"M247.31 124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57 61.26 162.88 48 128 48S61.43 61.26 36.34 86.35C17.51 105.18 9 124 8.69 124.76a8 8 0 0 0 0 6.5c.35.79 8.82 19.57 27.65 38.4C61.43 194.74 93.12 208 128 208s66.57-13.26 91.66-38.34c18.83-18.83 27.3-37.61 27.65-38.4a8 8 0 0 0 0-6.5M128 192c-30.78 0-57.67-11.19-79.93-33.25A133.5 133.5 0 0 1 25 128a133.3 133.3 0 0 1 23.07-30.75C70.33 75.19 97.22 64 128 64s57.67 11.19 79.93 33.25A133.5 133.5 0 0 1 231.05 128c-7.21 13.46-38.62 64-103.05 64m0-112a48 48 0 1 0 48 48a48.05 48.05 0 0 0-48-48m0 80a32 32 0 1 1 32-32a32 32 0 0 1-32 32\"/>",
	"b-mouse-scroll": "<path fill=\"currentColor\" d=\"M144 16h-32a64.07 64.07 0 0 0-64 64v96a64.07 64.07 0 0 0 64 64h32a64.07 64.07 0 0 0 64-64V80a64.07 64.07 0 0 0-64-64m48 160a48.05 48.05 0 0 1-48 48h-32a48.05 48.05 0 0 1-48-48V80a48.05 48.05 0 0 1 48-48h32a48.05 48.05 0 0 1 48 48Zm-56-92.69v89.38l10.34-10.35a8 8 0 0 1 11.32 11.32l-24 24a8 8 0 0 1-11.32 0l-24-24a8 8 0 0 1 11.32-11.32L120 172.69V83.31l-10.34 10.35a8 8 0 0 1-11.32-11.32l24-24a8 8 0 0 1 11.32 0l24 24a8 8 0 0 1-11.32 11.32Z\"/>",
	"b-rocket-launch": "<path fill=\"currentColor\" d=\"M223.85 47.12a16 16 0 0 0-15-15c-12.58-.75-44.73.4-71.41 27.07L132.69 64H74.36A15.9 15.9 0 0 0 63 68.68L28.7 103a16 16 0 0 0 9.07 27.16l38.47 5.37l44.21 44.21l5.37 38.49a15.94 15.94 0 0 0 10.78 12.92a16.1 16.1 0 0 0 5.1.83a15.9 15.9 0 0 0 11.3-4.68l34.32-34.3a15.9 15.9 0 0 0 4.68-11.36v-58.33l4.77-4.77c26.68-26.68 27.83-58.83 27.08-71.42M74.36 80h42.33l-39.53 39.52L40 114.34Zm74.41-9.45a76.65 76.65 0 0 1 59.11-22.47a76.46 76.46 0 0 1-22.42 59.16L128 164.68L91.32 128ZM176 181.64L141.67 216l-5.19-37.17L176 139.31Zm-74.16 9.5C97.34 201 82.29 224 40 224a8 8 0 0 1-8-8c0-42.29 23-57.34 32.86-61.85a8 8 0 0 1 6.64 14.56c-6.43 2.93-20.62 12.36-23.12 38.91c26.55-2.5 36-16.69 38.91-23.12a8 8 0 1 1 14.56 6.64Z\"/>",
	"b-broadcast": "<path fill=\"currentColor\" d=\"M128 88a40 40 0 1 0 40 40a40 40 0 0 0-40-40m0 64a24 24 0 1 1 24-24a24 24 0 0 1-24 24m73.71 7.14a80 80 0 0 1-14.08 22.2a8 8 0 0 1-11.92-10.67a63.95 63.95 0 0 0 0-85.33a8 8 0 1 1 11.92-10.67a80.08 80.08 0 0 1 14.08 84.47M69 103.09a64 64 0 0 0 11.26 67.58a8 8 0 0 1-11.92 10.67a79.93 79.93 0 0 1 0-106.67a8 8 0 1 1 11.95 10.67A63.8 63.8 0 0 0 69 103.09M248 128a119.58 119.58 0 0 1-34.29 84a8 8 0 1 1-11.42-11.2a103.9 103.9 0 0 0 0-145.56A8 8 0 1 1 213.71 44A119.58 119.58 0 0 1 248 128M53.71 200.78A8 8 0 1 1 42.29 212a119.87 119.87 0 0 1 0-168a8 8 0 1 1 11.42 11.2a103.9 103.9 0 0 0 0 145.56Z\"/>",
	"b-database": "<path fill=\"currentColor\" d=\"M128 24c-53.83 0-96 24.6-96 56v96c0 31.4 42.17 56 96 56s96-24.6 96-56V80c0-31.4-42.17-56-96-56m80 104c0 9.62-7.88 19.43-21.61 26.92C170.93 163.35 150.19 168 128 168s-42.93-4.65-58.39-13.08C55.88 147.43 48 137.62 48 128v-16.64c17.06 15 46.23 24.64 80 24.64s62.94-9.68 80-24.64ZM69.61 53.08C85.07 44.65 105.81 40 128 40s42.93 4.65 58.39 13.08C200.12 60.57 208 70.38 208 80s-7.88 19.43-21.61 26.92C170.93 115.35 150.19 120 128 120s-42.93-4.65-58.39-13.08C55.88 99.43 48 89.62 48 80s7.88-19.43 21.61-26.92m116.78 149.84C170.93 211.35 150.19 216 128 216s-42.93-4.65-58.39-13.08C55.88 195.43 48 185.62 48 176v-16.64c17.06 15 46.23 24.64 80 24.64s62.94-9.68 80-24.64V176c0 9.62-7.88 19.43-21.61 26.92\"/>",
	"b-plug": "<path fill=\"currentColor\" d=\"M237.66 66.34a8 8 0 0 0-11.32 0L192 100.69L155.31 64l34.35-34.34a8 8 0 1 0-11.32-11.32L144 52.69l-26.34-26.35a8 8 0 0 0-11.32 11.32l6.35 6.34l-53 53a40 40 0 0 0 0 56.57l15.71 15.71l-49.06 49.06a8 8 0 0 0 11.32 11.32l49.09-49.09l15.71 15.71a40 40 0 0 0 56.57 0l53-53l6.34 6.35a8 8 0 0 0 11.32-11.32L203.31 112l34.35-34.34a8 8 0 0 0 0-11.32M147.72 185a24 24 0 0 1-33.95 0L71 142.23a24 24 0 0 1 0-33.95l53-53L200.69 132Z\"/>",
	"b-brackets-curly": "<path fill=\"currentColor\" d=\"M43.18 128a29.8 29.8 0 0 1 8 10.26c4.8 9.9 4.8 22 4.8 33.74c0 24.31 1 36 24 36a8 8 0 0 1 0 16c-17.48 0-29.32-6.14-35.2-18.26c-4.8-9.9-4.8-22-4.8-33.74c0-24.31-1-36-24-36a8 8 0 0 1 0-16c23 0 24-11.69 24-36c0-11.72 0-23.84 4.8-33.74C50.68 38.14 62.52 32 80 32a8 8 0 0 1 0 16c-23 0-24 11.69-24 36c0 11.72 0 23.84-4.8 33.74A29.8 29.8 0 0 1 43.18 128M240 120c-23 0-24-11.69-24-36c0-11.72 0-23.84-4.8-33.74C205.32 38.14 193.48 32 176 32a8 8 0 0 0 0 16c23 0 24 11.69 24 36c0 11.72 0 23.84 4.8 33.74a29.8 29.8 0 0 0 8 10.26a29.8 29.8 0 0 0-8 10.26c-4.8 9.9-4.8 22-4.8 33.74c0 24.31-1 36-24 36a8 8 0 0 0 0 16c17.48 0 29.32-6.14 35.2-18.26c4.8-9.9 4.8-22 4.8-33.74c0-24.31 1-36 24-36a8 8 0 0 0 0-16\"/>",
	"b-paint-bucket": "<path fill=\"currentColor\" d=\"M234.53 139.07a8 8 0 0 0 3.13-13.24L122.17 10.34a8 8 0 0 0-11.31 0L70.25 51l-24.6-24.66a8 8 0 0 0-11.31 11.32l24.6 24.6L15 106.17a24 24 0 0 0 0 33.94L99.89 225a24 24 0 0 0 33.94 0l78.49-78.49Zm-32.19-5.24l-79.83 79.83a8 8 0 0 1-11.31 0L26.34 128.8a8 8 0 0 1 0-11.31l43.91-43.92l29.12 29.12a28 28 0 1 0 11.31-11.32L81.57 62.26l35-34.95L217.19 128l-11.72 3.9a8.1 8.1 0 0 0-3.13 1.93m-86.83-26.31a13.26 13.26 0 1 1-.05.06s.05-.05.05-.06m123.15 56a8 8 0 0 0-13.32 0C223.57 166.23 208 190.09 208 208a24 24 0 0 0 48 0c0-17.91-15.57-41.77-17.34-44.44ZM232 216a8 8 0 0 1-8-8c0-6.8 4-16.32 8-24.08c4 7.76 8 17.34 8 24.08a8 8 0 0 1-8 8\"/>",
	"b-gradient": "<path fill=\"currentColor\" d=\"M24 104a8 8 0 0 1 8-8h80a8 8 0 0 1 0 16H32a8 8 0 0 1-8-8m200-8h-80a8 8 0 0 0 0 16h80a8 8 0 0 0 0-16M72 136H32a8 8 0 0 0 0 16h40a8 8 0 0 0 0-16m152 0h-40a8 8 0 0 0 0 16h40a8 8 0 0 0 0-16m-128 8a8 8 0 0 0 8 8h48a8 8 0 0 0 0-16h-48a8 8 0 0 0-8 8m-40 32H32a8 8 0 0 0 0 16h24a8 8 0 0 0 0-16m56 0H88a8 8 0 0 0 0 16h24a8 8 0 0 0 0-16m56 0h-24a8 8 0 0 0 0 16h24a8 8 0 0 0 0-16m56 0h-24a8 8 0 0 0 0 16h24a8 8 0 0 0 0-16M32 72h192a8 8 0 0 0 0-16H32a8 8 0 0 0 0 16\"/>",
	"b-selection": "<path fill=\"currentColor\" d=\"M152 40a8 8 0 0 1-8 8h-32a8 8 0 0 1 0-16h32a8 8 0 0 1 8 8m-8 168h-32a8 8 0 0 0 0 16h32a8 8 0 0 0 0-16m64-176h-24a8 8 0 0 0 0 16h24v24a8 8 0 0 0 16 0V48a16 16 0 0 0-16-16m8 72a8 8 0 0 0-8 8v32a8 8 0 0 0 16 0v-32a8 8 0 0 0-8-8m0 72a8 8 0 0 0-8 8v24h-24a8 8 0 0 0 0 16h24a16 16 0 0 0 16-16v-24a8 8 0 0 0-8-8M40 152a8 8 0 0 0 8-8v-32a8 8 0 0 0-16 0v32a8 8 0 0 0 8 8m32 56H48v-24a8 8 0 0 0-16 0v24a16 16 0 0 0 16 16h24a8 8 0 0 0 0-16m0-176H48a16 16 0 0 0-16 16v24a8 8 0 0 0 16 0V48h24a8 8 0 0 0 0-16\"/>",
	"b-plus": "<path fill=\"currentColor\" d=\"M224 128a8 8 0 0 1-8 8h-80v80a8 8 0 0 1-16 0v-80H40a8 8 0 0 1 0-16h80V40a8 8 0 0 1 16 0v80h80a8 8 0 0 1 8 8\"/>",
	"b-x": "<path fill=\"currentColor\" d=\"M205.66 194.34a8 8 0 0 1-11.32 11.32L128 139.31l-66.34 66.35a8 8 0 0 1-11.32-11.32L116.69 128L50.34 61.66a8 8 0 0 1 11.32-11.32L128 116.69l66.34-66.35a8 8 0 0 1 11.32 11.32L139.31 128Z\"/>",
	"b-trash": "<path fill=\"currentColor\" d=\"M216 48h-40v-8a24 24 0 0 0-24-24h-48a24 24 0 0 0-24 24v8H40a8 8 0 0 0 0 16h8v144a16 16 0 0 0 16 16h128a16 16 0 0 0 16-16V64h8a8 8 0 0 0 0-16M96 40a8 8 0 0 1 8-8h48a8 8 0 0 1 8 8v8H96Zm96 168H64V64h128Zm-80-104v64a8 8 0 0 1-16 0v-64a8 8 0 0 1 16 0m48 0v64a8 8 0 0 1-16 0v-64a8 8 0 0 1 16 0\"/>",
	"b-copy": "<path fill=\"currentColor\" d=\"M216 32H88a8 8 0 0 0-8 8v40H40a8 8 0 0 0-8 8v128a8 8 0 0 0 8 8h128a8 8 0 0 0 8-8v-40h40a8 8 0 0 0 8-8V40a8 8 0 0 0-8-8m-56 176H48V96h112Zm48-48h-32V88a8 8 0 0 0-8-8H96V48h112Z\"/>",
	"b-caret-down": "<path fill=\"currentColor\" d=\"m213.66 101.66l-80 80a8 8 0 0 1-11.32 0l-80-80a8 8 0 0 1 11.32-11.32L128 164.69l74.34-74.35a8 8 0 0 1 11.32 11.32\"/>",
	"b-caret-right": "<path fill=\"currentColor\" d=\"m181.66 133.66l-80 80a8 8 0 0 1-11.32-11.32L164.69 128L90.34 53.66a8 8 0 0 1 11.32-11.32l80 80a8 8 0 0 1 0 11.32\"/>",
	"b-dots-three": "<path fill=\"currentColor\" d=\"M140 128a12 12 0 1 1-12-12a12 12 0 0 1 12 12m56-12a12 12 0 1 0 12 12a12 12 0 0 0-12-12m-136 0a12 12 0 1 0 12 12a12 12 0 0 0-12-12\"/>",
	"b-play": "<path fill=\"currentColor\" d=\"M232.4 114.49L88.32 26.35a16 16 0 0 0-16.2-.3A15.86 15.86 0 0 0 64 39.87v176.26A15.94 15.94 0 0 0 80 232a16.07 16.07 0 0 0 8.36-2.35l144.04-88.14a15.81 15.81 0 0 0 0-27ZM80 215.94V40l143.83 88Z\"/>",
	"b-pause": "<path fill=\"currentColor\" d=\"M200 32h-40a16 16 0 0 0-16 16v160a16 16 0 0 0 16 16h40a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16m0 176h-40V48h40ZM96 32H56a16 16 0 0 0-16 16v160a16 16 0 0 0 16 16h40a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16m0 176H56V48h40Z\"/>",
	"b-monitor": "<path fill=\"currentColor\" d=\"M208 40H48a24 24 0 0 0-24 24v112a24 24 0 0 0 24 24h160a24 24 0 0 0 24-24V64a24 24 0 0 0-24-24m8 136a8 8 0 0 1-8 8H48a8 8 0 0 1-8-8V64a8 8 0 0 1 8-8h160a8 8 0 0 1 8 8Zm-48 48a8 8 0 0 1-8 8H96a8 8 0 0 1 0-16h64a8 8 0 0 1 8 8\"/>",
	"b-device-tablet": "<path fill=\"currentColor\" d=\"M192 24H64a24 24 0 0 0-24 24v160a24 24 0 0 0 24 24h128a24 24 0 0 0 24-24V48a24 24 0 0 0-24-24M56 72h144v112H56Zm8-32h128a8 8 0 0 1 8 8v8H56v-8a8 8 0 0 1 8-8m128 176H64a8 8 0 0 1-8-8v-8h144v8a8 8 0 0 1-8 8\"/>",
	"b-device-mobile": "<path fill=\"currentColor\" d=\"M176 16H80a24 24 0 0 0-24 24v176a24 24 0 0 0 24 24h96a24 24 0 0 0 24-24V40a24 24 0 0 0-24-24M72 64h112v128H72Zm8-32h96a8 8 0 0 1 8 8v8H72v-8a8 8 0 0 1 8-8m96 192H80a8 8 0 0 1-8-8v-8h112v8a8 8 0 0 1-8 8\"/>",
	"b-arrow-counter-clockwise": "<path fill=\"currentColor\" d=\"M224 128a96 96 0 0 1-94.71 96H128a95.38 95.38 0 0 1-65.9-26.2a8 8 0 0 1 11-11.63a80 80 0 1 0-1.67-114.78a3 3 0 0 1-.26.25L44.59 96H72a8 8 0 0 1 0 16H24a8 8 0 0 1-8-8V56a8 8 0 0 1 16 0v29.8L60.25 60A96 96 0 0 1 224 128\"/>",
	"b-arrow-clockwise": "<path fill=\"currentColor\" d=\"M240 56v48a8 8 0 0 1-8 8h-48a8 8 0 0 1 0-16h27.4l-26.59-24.36l-.25-.24a80 80 0 1 0-1.67 114.78a8 8 0 0 1 11 11.63A95.44 95.44 0 0 1 128 224h-1.32a96 96 0 1 1 69.07-164L224 85.8V56a8 8 0 1 1 16 0\"/>",
	"b-sidebar-simple": "<path fill=\"currentColor\" d=\"M216 40H40a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16M40 56h40v144H40Zm176 144H96V56h120z\"/>",
	"b-stack-simple": "<path fill=\"currentColor\" d=\"m12 111l112 64a8 8 0 0 0 7.94 0l112-64a8 8 0 0 0 0-13.9l-112-64a8 8 0 0 0-7.94 0l-112 64a8 8 0 0 0 0 13.9m116-61.79L223.87 104L128 158.79L32.13 104ZM246.94 140a8 8 0 0 1-2.94 11l-112 64a8 8 0 0 1-7.94 0L12 151a8 8 0 0 1 8-13.95l108 61.74l108-61.74a8 8 0 0 1 10.94 2.95\"/>",
	"b-files": "<path fill=\"currentColor\" d=\"m213.66 66.34l-40-40A8 8 0 0 0 168 24H88a16 16 0 0 0-16 16v16H56a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h112a16 16 0 0 0 16-16v-16h16a16 16 0 0 0 16-16V72a8 8 0 0 0-2.34-5.66M168 216H56V72h76.69L168 107.31zm32-32h-16v-80a8 8 0 0 0-2.34-5.66l-40-40A8 8 0 0 0 136 56H88V40h76.69L200 75.31Zm-56-32a8 8 0 0 1-8 8H88a8 8 0 0 1 0-16h48a8 8 0 0 1 8 8m0 32a8 8 0 0 1-8 8H88a8 8 0 0 1 0-16h48a8 8 0 0 1 8 8\"/>",
	"b-file": "<path fill=\"currentColor\" d=\"m213.66 82.34l-56-56A8 8 0 0 0 152 24H56a16 16 0 0 0-16 16v176a16 16 0 0 0 16 16h144a16 16 0 0 0 16-16V88a8 8 0 0 0-2.34-5.66M160 51.31L188.69 80H160ZM200 216H56V40h88v48a8 8 0 0 0 8 8h48z\"/>",
	"b-file-dashed": "<path fill=\"currentColor\" d=\"M80 224a8 8 0 0 1-8 8H56a16 16 0 0 1-16-16v-32a8 8 0 0 1 16 0v32h16a8 8 0 0 1 8 8M216 88v48a8 8 0 0 1-16 0V96h-48a8 8 0 0 1-8-8V40h-24a8 8 0 0 1 0-16h32a8 8 0 0 1 5.66 2.34l56 56A8 8 0 0 1 216 88m-56-8h28.69L160 51.31ZM80 24H56a16 16 0 0 0-16 16v24a8 8 0 0 0 16 0V40h24a8 8 0 0 0 0-16m128 144a8 8 0 0 0-8 8v40h-8a8 8 0 0 0 0 16h8a16 16 0 0 0 16-16v-40a8 8 0 0 0-8-8M48 152a8 8 0 0 0 8-8v-40a8 8 0 0 0-16 0v40a8 8 0 0 0 8 8m104 64h-40a8 8 0 0 0 0 16h40a8 8 0 0 0 0-16\"/>",
	"b-layout": "<path fill=\"currentColor\" d=\"M216 40H40a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16m0 16v40H40V56ZM40 112h56v88H40Zm176 88H112v-88h104z\"/>",
	"b-puzzle-piece": "<path fill=\"currentColor\" d=\"M220.27 158.54a8 8 0 0 0-7.7-.46a20 20 0 1 1 0-36.16a8 8 0 0 0 11.43-7.23V72a16 16 0 0 0-16-16h-36.22a35 35 0 0 0 .22-4a36.1 36.1 0 0 0-11.36-26.24a36 36 0 0 0-60.55 23.62a36.6 36.6 0 0 0 .14 6.62H64a16 16 0 0 0-16 16v32.22a35 35 0 0 0-4-.22a36.12 36.12 0 0 0-26.24 11.36a35.7 35.7 0 0 0-9.69 27a36.08 36.08 0 0 0 33.31 33.6a35.7 35.7 0 0 0 6.62-.14V208a16 16 0 0 0 16 16h144a16 16 0 0 0 16-16v-42.69a8 8 0 0 0-3.73-6.77M208 208H64v-42.69a8 8 0 0 0-11.43-7.23a20 20 0 1 1 0-36.16A8 8 0 0 0 64 114.69V72h46.69a8 8 0 0 0 7.23-11.43a20 20 0 1 1 36.16 0A8 8 0 0 0 161.31 72H208v32.23a35.7 35.7 0 0 0-6.62-.14A36 36 0 0 0 204 176a35 35 0 0 0 4-.22Z\"/>",
	"b-shapes": "<path fill=\"currentColor\" d=\"M71.59 61.47a8 8 0 0 0-15.18 0l-40 120A8 8 0 0 0 24 192h80a8 8 0 0 0 7.59-10.53ZM35.1 176L64 89.3L92.9 176ZM208 76a52 52 0 1 0-52 52a52.06 52.06 0 0 0 52-52m-88 0a36 36 0 1 1 36 36a36 36 0 0 1-36-36m104 68h-88a8 8 0 0 0-8 8v56a8 8 0 0 0 8 8h88a8 8 0 0 0 8-8v-56a8 8 0 0 0-8-8m-8 56h-72v-40h72Z\"/>",
	"b-swatches": "<path fill=\"currentColor\" d=\"M88 180a12 12 0 1 1-12-12a12 12 0 0 1 12 12m152-23.81V208a16 16 0 0 1-16 16H76a46.4 46.4 0 0 1-7.94-.68a44 44 0 0 1-35.43-50.95l25-143.13a15.94 15.94 0 0 1 18.47-13L130.84 26a16 16 0 0 1 12.92 18.52l-12.08 69L199.49 89a16 16 0 0 1 20.45 9.52L239 150.69a18.4 18.4 0 0 1 1 5.5m-137 28.68l25-143.13L73.46 32l-25 143.1a28 28 0 0 0 22.44 32.47A27.3 27.3 0 0 0 91.46 203A27.84 27.84 0 0 0 103 184.87M116.78 195L224 156.11L204.92 104l-76.42 27.7l-9.78 55.92a44.6 44.6 0 0 1-1.94 7.38M224 173.12L127.74 208H224Z\"/>",
	"b-paint-brush": "<path fill=\"currentColor\" d=\"M232 32a8 8 0 0 0-8-8c-44.08 0-89.31 49.71-114.43 82.63A60 60 0 0 0 32 164c0 30.88-19.54 44.73-20.47 45.37A8 8 0 0 0 16 224h76a60 60 0 0 0 57.37-77.57C182.3 121.31 232 76.08 232 32M92 208H34.63C41.38 198.41 48 183.92 48 164a44 44 0 1 1 44 44m32.42-94.45q5.14-6.66 10.09-12.55A76.2 76.2 0 0 1 155 121.49q-5.9 4.94-12.55 10.09a60.5 60.5 0 0 0-18.03-18.03m42.7-2.68a92.6 92.6 0 0 0-22-22c31.78-34.53 55.75-45 69.9-47.91c-2.85 14.16-13.37 38.13-47.9 69.91\"/>",
	"b-sparkle": "<path fill=\"currentColor\" d=\"M197.58 129.06L146 110l-19-51.62a15.92 15.92 0 0 0-29.88 0L78 110l-51.62 19a15.92 15.92 0 0 0 0 29.88L78 178l19 51.62a15.92 15.92 0 0 0 29.88 0L146 178l51.62-19a15.92 15.92 0 0 0 0-29.88ZM137 164.22a8 8 0 0 0-4.74 4.74L112 223.85L91.78 169a8 8 0 0 0-4.78-4.78L32.15 144L87 123.78a8 8 0 0 0 4.78-4.78L112 64.15L132.22 119a8 8 0 0 0 4.74 4.74L191.85 144ZM144 40a8 8 0 0 1 8-8h16V16a8 8 0 0 1 16 0v16h16a8 8 0 0 1 0 16h-16v16a8 8 0 0 1-16 0V48h-16a8 8 0 0 1-8-8m104 48a8 8 0 0 1-8 8h-8v8a8 8 0 0 1-16 0v-8h-8a8 8 0 0 1 0-16h8v-8a8 8 0 0 1 16 0v8h8a8 8 0 0 1 8 8\"/>",
	"b-moon": "<path fill=\"currentColor\" d=\"M233.54 142.23a8 8 0 0 0-8-2a88.08 88.08 0 0 1-109.8-109.8a8 8 0 0 0-10-10a104.84 104.84 0 0 0-52.91 37A104 104 0 0 0 136 224a103.1 103.1 0 0 0 62.52-20.88a104.84 104.84 0 0 0 37-52.91a8 8 0 0 0-1.98-7.98m-44.64 48.11A88 88 0 0 1 65.66 67.11a89 89 0 0 1 31.4-26A106 106 0 0 0 96 56a104.11 104.11 0 0 0 104 104a106 106 0 0 0 14.92-1.06a89 89 0 0 1-26.02 31.4\"/>",
	"b-sun": "<path fill=\"currentColor\" d=\"M120 40V16a8 8 0 0 1 16 0v24a8 8 0 0 1-16 0m72 88a64 64 0 1 1-64-64a64.07 64.07 0 0 1 64 64m-16 0a48 48 0 1 0-48 48a48.05 48.05 0 0 0 48-48M58.34 69.66a8 8 0 0 0 11.32-11.32l-16-16a8 8 0 0 0-11.32 11.32Zm0 116.68l-16 16a8 8 0 0 0 11.32 11.32l16-16a8 8 0 0 0-11.32-11.32M192 72a8 8 0 0 0 5.66-2.34l16-16a8 8 0 0 0-11.32-11.32l-16 16A8 8 0 0 0 192 72m5.66 114.34a8 8 0 0 0-11.32 11.32l16 16a8 8 0 0 0 11.32-11.32ZM48 128a8 8 0 0 0-8-8H16a8 8 0 0 0 0 16h24a8 8 0 0 0 8-8m80 80a8 8 0 0 0-8 8v24a8 8 0 0 0 16 0v-24a8 8 0 0 0-8-8m112-88h-24a8 8 0 0 0 0 16h24a8 8 0 0 0 0-16\"/>",
	"b-arrow-square-out": "<path fill=\"currentColor\" d=\"M224 104a8 8 0 0 1-16 0V59.32l-66.33 66.34a8 8 0 0 1-11.32-11.32L196.68 48H152a8 8 0 0 1 0-16h64a8 8 0 0 1 8 8Zm-40 24a8 8 0 0 0-8 8v72H48V80h72a8 8 0 0 0 0-16H48a16 16 0 0 0-16 16v128a16 16 0 0 0 16 16h128a16 16 0 0 0 16-16v-72a8 8 0 0 0-8-8\"/>",
	"b-check": "<path fill=\"currentColor\" d=\"m229.66 77.66l-128 128a8 8 0 0 1-11.32 0l-56-56a8 8 0 0 1 11.32-11.32L96 188.69L218.34 66.34a8 8 0 0 1 11.32 11.32\"/>",
	"b-warning": "<path fill=\"currentColor\" d=\"M236.8 188.09L149.35 36.22a24.76 24.76 0 0 0-42.7 0L19.2 188.09a23.51 23.51 0 0 0 0 23.72A24.35 24.35 0 0 0 40.55 224h174.9a24.35 24.35 0 0 0 21.33-12.19a23.51 23.51 0 0 0 .02-23.72m-13.87 15.71a8.5 8.5 0 0 1-7.48 4.2H40.55a8.5 8.5 0 0 1-7.48-4.2a7.59 7.59 0 0 1 0-7.72l87.45-151.87a8.75 8.75 0 0 1 15 0l87.45 151.87a7.59 7.59 0 0 1-.04 7.72M120 144v-40a8 8 0 0 1 16 0v40a8 8 0 0 1-16 0m20 36a12 12 0 1 1-12-12a12 12 0 0 1 12 12\"/>",
	"b-bezier-curve": "<path fill=\"currentColor\" d=\"M221.07 144.41A96.68 96.68 0 0 0 181 88h59a8 8 0 0 0 0-16h-81a32 32 0 0 0-62 0H16a8 8 0 0 0 0 16h59a96.68 96.68 0 0 0-40.07 56.41A32 32 0 1 0 51.08 146A80.6 80.6 0 0 1 99 93.44a32 32 0 0 0 58.06 0A80.6 80.6 0 0 1 204.92 146a32 32 0 1 0 16.15-1.57ZM56 176a16 16 0 1 1-16-16a16 16 0 0 1 16 16m72-80a16 16 0 1 1 16-16a16 16 0 0 1-16 16m88 96a16 16 0 1 1 16-16a16 16 0 0 1-16 16\"/>",
	"b-flow-arrow": "<path fill=\"currentColor\" d=\"m245.66 74.34l-32-32a8 8 0 0 0-11.32 11.32L220.69 72H208c-49.33 0-61.05 28.12-71.38 52.92c-9.38 22.51-16.92 40.59-49.48 42.84a40 40 0 1 0 .1 16c43.26-2.65 54.34-29.15 64.14-52.69C161.41 107 169.33 88 208 88h12.69l-18.35 18.34a8 8 0 0 0 11.32 11.32l32-32a8 8 0 0 0 0-11.32M48 200a24 24 0 1 1 24-24a24 24 0 0 1-24 24\"/>",
	"b-git-branch": "<path fill=\"currentColor\" d=\"M232 64a32 32 0 1 0-40 31v17a8 8 0 0 1-8 8H96a23.8 23.8 0 0 0-8 1.38V95a32 32 0 1 0-16 0v66a32 32 0 1 0 16 0v-17a8 8 0 0 1 8-8h88a24 24 0 0 0 24-24V95a32.06 32.06 0 0 0 24-31M64 64a16 16 0 1 1 16 16a16 16 0 0 1-16-16m32 128a16 16 0 1 1-16-16a16 16 0 0 1 16 16M200 80a16 16 0 1 1 16-16a16 16 0 0 1-16 16\"/>",
	"b-chat-circle": "<path fill=\"currentColor\" d=\"M128 24a104 104 0 0 0-91.82 152.88l-11.35 34.05a16 16 0 0 0 20.24 20.24l34.05-11.35A104 104 0 1 0 128 24m0 192a87.87 87.87 0 0 1-44.06-11.81a8 8 0 0 0-6.54-.67L40 216l12.47-37.4a8 8 0 0 0-.66-6.54A88 88 0 1 1 128 216\"/>",
	"b-keyboard": "<path fill=\"currentColor\" d=\"M224 48H32a16 16 0 0 0-16 16v128a16 16 0 0 0 16 16h192a16 16 0 0 0 16-16V64a16 16 0 0 0-16-16m0 144H32V64h192zm-16-64a8 8 0 0 1-8 8H56a8 8 0 0 1 0-16h144a8 8 0 0 1 8 8m0-32a8 8 0 0 1-8 8H56a8 8 0 0 1 0-16h144a8 8 0 0 1 8 8M72 160a8 8 0 0 1-8 8h-8a8 8 0 0 1 0-16h8a8 8 0 0 1 8 8m96 0a8 8 0 0 1-8 8H96a8 8 0 0 1 0-16h64a8 8 0 0 1 8 8m40 0a8 8 0 0 1-8 8h-8a8 8 0 0 1 0-16h8a8 8 0 0 1 8 8\"/>",
	"b-lock-simple": "<path fill=\"currentColor\" d=\"M208 80h-32V56a48 48 0 0 0-96 0v24H48a16 16 0 0 0-16 16v112a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16V96a16 16 0 0 0-16-16M96 56a32 32 0 0 1 64 0v24H96Zm112 152H48V96h160z\"/>",
	"b-scroll": "<path fill=\"currentColor\" d=\"M96 104a8 8 0 0 1 8-8h64a8 8 0 0 1 0 16h-64a8 8 0 0 1-8-8m8 40h64a8 8 0 0 0 0-16h-64a8 8 0 0 0 0 16m128 48a32 32 0 0 1-32 32H88a32 32 0 0 1-32-32V64a16 16 0 0 0-32 0c0 5.74 4.83 9.62 4.88 9.66A8 8 0 0 1 24 88a7.9 7.9 0 0 1-4.79-1.61C18.05 85.54 8 77.61 8 64a32 32 0 0 1 32-32h136a32 32 0 0 1 32 32v104h8a8 8 0 0 1 4.8 1.6c1.2.86 11.2 8.79 11.2 22.4M96.26 173.48A8.07 8.07 0 0 1 104 168h88V64a16 16 0 0 0-16-16H67.69A31.7 31.7 0 0 1 72 64v128a16 16 0 0 0 32 0c0-5.74-4.83-9.62-4.88-9.66a7.82 7.82 0 0 1-2.86-8.86M216 192a12.58 12.58 0 0 0-3.23-8h-94a27 27 0 0 1 1.21 8a31.8 31.8 0 0 1-4.29 16H200a16 16 0 0 0 16-16\"/>",
	"b-spiral": "<path fill=\"currentColor\" d=\"M248 144a8 8 0 0 1-16 0a96.11 96.11 0 0 0-96-96a88.1 88.1 0 0 0-88 88a80.09 80.09 0 0 0 80 80a72.08 72.08 0 0 0 72-72a64.07 64.07 0 0 0-64-64a56.06 56.06 0 0 0-56 56a48.05 48.05 0 0 0 48 48a40 40 0 0 0 40-40a32 32 0 0 0-32-32a24 24 0 0 0-24 24a16 16 0 0 0 16 16a8 8 0 0 0 8-8a8 8 0 0 1 0-16a16 16 0 0 1 16 16a24 24 0 0 1-24 24a32 32 0 0 1-32-32a40 40 0 0 1 40-40a48.05 48.05 0 0 1 48 48a56.06 56.06 0 0 1-56 56a64.07 64.07 0 0 1-64-64a72.08 72.08 0 0 1 72-72a80.09 80.09 0 0 1 80 80a88.1 88.1 0 0 1-88 88a96.11 96.11 0 0 1-96-96A104.11 104.11 0 0 1 136 32a112.12 112.12 0 0 1 112 112\"/>",
	"b-waves": "<path fill=\"currentColor\" d=\"M222.16 177.25a8 8 0 0 1-1 11.25c-17.36 14.39-32.86 19.5-47 19.5c-18.58 0-34.82-8.82-49.93-17c-25.35-13.76-47.24-25.64-79.07.74a8 8 0 1 1-10.22-12.31c40.17-33.28 70.32-16.92 96.93-2.48c25.35 13.75 47.24 25.63 79.07-.74a8 8 0 0 1 11.22 1.04m-11.27-57c-31.83 26.38-53.72 14.5-79.07.74c-26.61-14.43-56.76-30.79-96.93 2.49a8 8 0 0 0 10.22 12.31c31.83-26.38 53.72-14.5 79.07-.74c15.11 8.19 31.35 17 49.93 17c14.14 0 29.64-5.11 47-19.5a8 8 0 1 0-10.22-12.31ZM45.11 79.8c31.83-26.37 53.72-14.49 79.07-.74c15.11 8.2 31.35 17 49.93 17c14.14 0 29.64-5.12 47-19.5a8 8 0 1 0-10.22-12.31c-31.83 26.38-53.72 14.5-79.07.74c-26.61-14.41-56.76-30.77-96.93 2.51a8 8 0 1 0 10.22 12.3\"/>",
	"b-path": "<path fill=\"currentColor\" d=\"M200 168a32.06 32.06 0 0 0-31 24H72a32 32 0 0 1 0-64h96a40 40 0 0 0 0-80H72a8 8 0 0 0 0 16h96a24 24 0 0 1 0 48H72a48 48 0 0 0 0 96h97a32 32 0 1 0 31-40m0 48a16 16 0 1 1 16-16a16 16 0 0 1-16 16\"/>",
	"b-selection-all": "<path fill=\"currentColor\" d=\"M104 40a8 8 0 0 1 8-8h32a8 8 0 0 1 0 16h-32a8 8 0 0 1-8-8m40 168h-32a8 8 0 0 0 0 16h32a8 8 0 0 0 0-16m64-176h-24a8 8 0 0 0 0 16h24v24a8 8 0 0 0 16 0V48a16 16 0 0 0-16-16m8 72a8 8 0 0 0-8 8v32a8 8 0 0 0 16 0v-32a8 8 0 0 0-8-8m0 72a8 8 0 0 0-8 8v24h-24a8 8 0 0 0 0 16h24a16 16 0 0 0 16-16v-24a8 8 0 0 0-8-8M40 152a8 8 0 0 0 8-8v-32a8 8 0 0 0-16 0v32a8 8 0 0 0 8 8m32 56H48v-24a8 8 0 0 0-16 0v24a16 16 0 0 0 16 16h24a8 8 0 0 0 0-16M40 80a8 8 0 0 0 8-8V48h24a8 8 0 0 0 0-16H48a16 16 0 0 0-16 16v24a8 8 0 0 0 8 8m136 104H80a8 8 0 0 1-8-8V80a8 8 0 0 1 8-8h96a8 8 0 0 1 8 8v96a8 8 0 0 1-8 8m-8-96H88v80h80Z\"/>",
	"b-selection-plus": "<path fill=\"currentColor\" d=\"M152 40a8 8 0 0 1-8 8h-32a8 8 0 0 1 0-16h32a8 8 0 0 1 8 8m-8 168h-32a8 8 0 0 0 0 16h32a8 8 0 0 0 0-16m64-160v24a8 8 0 0 0 16 0V48a16 16 0 0 0-16-16h-24a8 8 0 0 0 0 16Zm8 56a8 8 0 0 0-8 8v32a8 8 0 0 0 16 0v-32a8 8 0 0 0-8-8M40 152a8 8 0 0 0 8-8v-32a8 8 0 0 0-16 0v32a8 8 0 0 0 8 8m32 56H48v-24a8 8 0 0 0-16 0v24a16 16 0 0 0 16 16h24a8 8 0 0 0 0-16m0-176H48a16 16 0 0 0-16 16v24a8 8 0 0 0 16 0V48h24a8 8 0 0 0 0-16m168 176h-16v-16a8 8 0 0 0-16 0v16h-16a8 8 0 0 0 0 16h16v16a8 8 0 0 0 16 0v-16h16a8 8 0 0 0 0-16\"/>",
	"b-cube": "<path fill=\"currentColor\" d=\"m223.68 66.15l-88-48.15a15.88 15.88 0 0 0-15.36 0l-88 48.17a16 16 0 0 0-8.32 14v95.64a16 16 0 0 0 8.32 14l88 48.17a15.88 15.88 0 0 0 15.36 0l88-48.17a16 16 0 0 0 8.32-14V80.18a16 16 0 0 0-8.32-14.03M128 32l80.34 44L128 120L47.66 76ZM40 90l80 43.78v85.79l-80-43.75Zm96 129.57v-85.75L216 90v85.78Z\"/>",
	"b-arrows-out-cardinal": "<path fill=\"currentColor\" d=\"M90.34 61.66a8 8 0 0 1 0-11.32l32-32a8 8 0 0 1 11.32 0l32 32a8 8 0 0 1-11.32 11.32L136 43.31V96a8 8 0 0 1-16 0V43.31l-18.34 18.35a8 8 0 0 1-11.32 0m64 132.68L136 212.69V160a8 8 0 0 0-16 0v52.69l-18.34-18.35a8 8 0 0 0-11.32 11.32l32 32a8 8 0 0 0 11.32 0l32-32a8 8 0 0 0-11.32-11.32m83.32-72l-32-32a8 8 0 0 0-11.32 11.32L212.69 120H160a8 8 0 0 0 0 16h52.69l-18.35 18.34a8 8 0 0 0 11.32 11.32l32-32a8 8 0 0 0 0-11.32M43.31 136H96a8 8 0 0 0 0-16H43.31l18.35-18.34a8 8 0 0 0-11.32-11.32l-32 32a8 8 0 0 0 0 11.32l32 32a8 8 0 0 0 11.32-11.32Z\"/>",
	"b-resize": "<path fill=\"currentColor\" d=\"M136 112H48a8 8 0 0 0-8 8v88a8 8 0 0 0 8 8h88a8 8 0 0 0 8-8v-88a8 8 0 0 0-8-8m-8 88H56v-72h72Zm88-16v16a16 16 0 0 1-16 16h-24a8 8 0 0 1 0-16h24v-16a8 8 0 0 1 16 0m0-72v32a8 8 0 0 1-16 0v-32a8 8 0 0 1 16 0m0-56v16a8 8 0 0 1-16 0V56h-16a8 8 0 0 1 0-16h16a16 16 0 0 1 16 16m-64-8a8 8 0 0 1-8 8h-32a8 8 0 0 1 0-16h32a8 8 0 0 1 8 8M40 80V56a16 16 0 0 1 16-16h16a8 8 0 0 1 0 16H56v24a8 8 0 0 1-16 0\"/>",
	"b-ruler": "<path fill=\"currentColor\" d=\"m235.32 73.37l-52.69-52.68a16 16 0 0 0-22.63 0L20.68 160a16 16 0 0 0 0 22.63l52.69 52.68a16 16 0 0 0 22.63 0L235.32 96a16 16 0 0 0 0-22.63M84.68 224L32 171.31l32-32l26.34 26.35a8 8 0 0 0 11.32-11.32L75.31 128L96 107.31l26.34 26.35a8 8 0 0 0 11.32-11.32L107.31 96L128 75.31l26.34 26.35a8 8 0 0 0 11.32-11.32L139.31 64l32-32L224 84.69Z\"/>",
	"b-eyedropper": "<path fill=\"currentColor\" d=\"M224 67.3a35.8 35.8 0 0 0-11.26-25.66c-14-13.28-36.72-12.78-50.62 1.13L142.8 62.2a24 24 0 0 0-33.14.77l-9 9a16 16 0 0 0 0 22.64l2 2.06l-51 51a39.75 39.75 0 0 0-10.53 38l-8 18.41A13.68 13.68 0 0 0 36 219.3a15.92 15.92 0 0 0 17.71 3.35L71.23 215a39.89 39.89 0 0 0 37.06-10.75l51-51l2.06 2.06a16 16 0 0 0 22.62 0l9-9a24 24 0 0 0 .74-33.18l19.75-19.87A35.75 35.75 0 0 0 224 67.3M97 193a24 24 0 0 1-24 6a8 8 0 0 0-5.55.31l-18.1 7.91L57 189.41a8 8 0 0 0 .25-5.75A23.88 23.88 0 0 1 63 159l51-51l33.94 34ZM202.13 82l-25.37 25.52a8 8 0 0 0 0 11.3l4.89 4.89a8 8 0 0 1 0 11.32l-9 9L112 83.26l9-9a8 8 0 0 1 11.31 0l4.89 4.89a8 8 0 0 0 11.33 0l24.94-25.09c7.81-7.82 20.5-8.18 28.29-.81a20 20 0 0 1 .39 28.7Z\"/>",
	"b-circle": "<path fill=\"currentColor\" d=\"M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88\"/>",
	"b-gear-six": "<path fill=\"currentColor\" d=\"M128 80a48 48 0 1 0 48 48a48.05 48.05 0 0 0-48-48m0 80a32 32 0 1 1 32-32a32 32 0 0 1-32 32m109.94-52.79a8 8 0 0 0-3.89-5.4l-29.83-17l-.12-33.62a8 8 0 0 0-2.83-6.08a111.9 111.9 0 0 0-36.72-20.67a8 8 0 0 0-6.46.59L128 41.85L97.88 25a8 8 0 0 0-6.47-.6a112.1 112.1 0 0 0-36.68 20.75a8 8 0 0 0-2.83 6.07l-.15 33.65l-29.83 17a8 8 0 0 0-3.89 5.4a106.5 106.5 0 0 0 0 41.56a8 8 0 0 0 3.89 5.4l29.83 17l.12 33.62a8 8 0 0 0 2.83 6.08a111.9 111.9 0 0 0 36.72 20.67a8 8 0 0 0 6.46-.59L128 214.15L158.12 231a7.9 7.9 0 0 0 3.9 1a8.1 8.1 0 0 0 2.57-.42a112.1 112.1 0 0 0 36.68-20.73a8 8 0 0 0 2.83-6.07l.15-33.65l29.83-17a8 8 0 0 0 3.89-5.4a106.5 106.5 0 0 0-.03-41.52m-15 34.91l-28.57 16.25a8 8 0 0 0-3 3c-.58 1-1.19 2.06-1.81 3.06a7.94 7.94 0 0 0-1.22 4.21l-.15 32.25a95.9 95.9 0 0 1-25.37 14.3L134 199.13a8 8 0 0 0-3.91-1h-3.83a8.1 8.1 0 0 0-4.1 1l-28.84 16.1A96 96 0 0 1 67.88 201l-.11-32.2a8 8 0 0 0-1.22-4.22c-.62-1-1.23-2-1.8-3.06a8.1 8.1 0 0 0-3-3.06l-28.6-16.29a90.5 90.5 0 0 1 0-28.26l28.52-16.28a8 8 0 0 0 3-3c.58-1 1.19-2.06 1.81-3.06a7.94 7.94 0 0 0 1.22-4.21l.15-32.25a95.9 95.9 0 0 1 25.37-14.3L122 56.87a8 8 0 0 0 4.1 1h3.64a8.1 8.1 0 0 0 4.1-1l28.84-16.1A96 96 0 0 1 188.12 55l.11 32.2a8 8 0 0 0 1.22 4.22c.62 1 1.23 2 1.8 3.06a8.1 8.1 0 0 0 3 3.06l28.6 16.29a90.5 90.5 0 0 1 .05 28.29Z\"/>",
	"b-house": "<path fill=\"currentColor\" d=\"m219.31 108.68l-80-80a16 16 0 0 0-22.62 0l-80 80A15.87 15.87 0 0 0 32 120v96a8 8 0 0 0 8 8h64a8 8 0 0 0 8-8v-56h32v56a8 8 0 0 0 8 8h64a8 8 0 0 0 8-8v-96a15.87 15.87 0 0 0-4.69-11.32M208 208h-48v-56a8 8 0 0 0-8-8h-48a8 8 0 0 0-8 8v56H48v-88l80-80l80 80Z\"/>",
	"b-pencil-simple": "<path fill=\"currentColor\" d=\"m227.31 73.37l-44.68-44.69a16 16 0 0 0-22.63 0L36.69 152A15.86 15.86 0 0 0 32 163.31V208a16 16 0 0 0 16 16h44.69a15.86 15.86 0 0 0 11.31-4.69L227.31 96a16 16 0 0 0 0-22.63M92.69 208H48v-44.69l88-88L180.69 120ZM192 108.68L147.31 64l24-24L216 84.68Z\"/>",
	"b-arrow-elbow-down-right": "<path fill=\"currentColor\" d=\"m221.66 181.66l-48 48a8 8 0 0 1-11.32-11.32L196.69 184H72a8 8 0 0 1-8-8V32a8 8 0 0 1 16 0v136h116.69l-34.35-34.34a8 8 0 0 1 11.32-11.32l48 48a8 8 0 0 1 0 11.32\"/>",
	"b-arrow-elbow-left-up": "<path fill=\"currentColor\" d=\"M240 192a8 8 0 0 1-8 8H88a8 8 0 0 1-8-8V67.31l-34.34 34.35a8 8 0 0 1-11.32-11.32l48-48a8 8 0 0 1 11.32 0l48 48a8 8 0 0 1-11.32 11.32L96 67.31V184h136a8 8 0 0 1 8 8\"/>",
	"b-dot-outline": "<path fill=\"currentColor\" d=\"M128 96a32 32 0 1 0 32 32a32 32 0 0 0-32-32m0 48a16 16 0 1 1 16-16a16 16 0 0 1-16 16\"/>",
	"b-question": "<path fill=\"currentColor\" d=\"M140 180a12 12 0 1 1-12-12a12 12 0 0 1 12 12M128 72c-22.06 0-40 16.15-40 36v4a8 8 0 0 0 16 0v-4c0-11 10.77-20 24-20s24 9 24 20s-10.77 20-24 20a8 8 0 0 0-8 8v8a8 8 0 0 0 16 0v-.72c18.24-3.35 32-17.9 32-35.28c0-19.85-17.94-36-40-36m104 56A104 104 0 1 1 128 24a104.11 104.11 0 0 1 104 104m-16 0a88 88 0 1 0-88 88a88.1 88.1 0 0 0 88-88\"/>",
	"b-text-columns": "<path fill=\"currentColor\" d=\"M120 64a8 8 0 0 1-8 8H40a8 8 0 0 1 0-16h72a8 8 0 0 1 8 8m-8 32H40a8 8 0 0 0 0 16h72a8 8 0 0 0 0-16m0 40H40a8 8 0 0 0 0 16h72a8 8 0 0 0 0-16m0 40H40a8 8 0 0 0 0 16h72a8 8 0 0 0 0-16m32-104h72a8 8 0 0 0 0-16h-72a8 8 0 0 0 0 16m72 24h-72a8 8 0 0 0 0 16h72a8 8 0 0 0 0-16m0 40h-72a8 8 0 0 0 0 16h72a8 8 0 0 0 0-16m0 40h-72a8 8 0 0 0 0 16h72a8 8 0 0 0 0-16\"/>",
	"b-split-horizontal": "<path fill=\"currentColor\" d=\"M112 48v160a8 8 0 0 1-16 0v-72H43.31l18.35 18.34a8 8 0 0 1-11.32 11.32l-32-32a8 8 0 0 1 0-11.32l32-32a8 8 0 0 1 11.32 11.32L43.31 120H96V48a8 8 0 0 1 16 0m125.66 74.34l-32-32a8 8 0 0 0-11.32 11.32L212.69 120H160V48a8 8 0 0 0-16 0v160a8 8 0 0 0 16 0v-72h52.69l-18.35 18.34a8 8 0 0 0 11.32 11.32l32-32a8 8 0 0 0 0-11.32\"/>",
	"b-split-vertical": "<path fill=\"currentColor\" d=\"M216 152a8 8 0 0 1-8 8h-72v52.69l18.34-18.35a8 8 0 0 1 11.32 11.32l-32 32a8 8 0 0 1-11.32 0l-32-32a8 8 0 0 1 11.32-11.32L120 212.69V160H48a8 8 0 0 1 0-16h160a8 8 0 0 1 8 8M48 112h160a8 8 0 0 0 0-16h-72V43.31l18.34 18.35a8 8 0 0 0 11.32-11.32l-32-32a8 8 0 0 0-11.32 0l-32 32a8 8 0 0 0 11.32 11.32L120 43.31V96H48a8 8 0 0 0 0 16\"/>",
	"b-square-half": "<path fill=\"currentColor\" d=\"M200 40H56a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h144a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16m-64 80h64v16h-64Zm0-16V88h64v16Zm0 48h64v16h-64Zm64-80h-64V56h64ZM56 56h64v144H56Zm144 144h-64v-16h64z\"/>",
	"b-square-split-horizontal": "<path fill=\"currentColor\" d=\"M200 40H56a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h144a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16M56 56h64v144H56Zm144 144h-64V56h64z\"/>",
	"b-perspective": "<path fill=\"currentColor\" d=\"M240 120h-16V48a16 16 0 0 0-18.86-15.74l-160 29.09A16 16 0 0 0 32 77.09V120H16a8 8 0 0 0 0 16h16v42.91a16 16 0 0 0 13.14 15.74l160 29.09a16.5 16.5 0 0 0 2.86.26a16 16 0 0 0 16-16v-72h16a8 8 0 0 0 0-16M48 77.09L208 48v72H48ZM208 208L48 178.91V136h160Z\"/>",
	"b-angle": "<path fill=\"currentColor\" d=\"M96 72a8 8 0 0 1 8-8a104.11 104.11 0 0 1 104 104a8 8 0 0 1-16 0a88.1 88.1 0 0 0-88-88a8 8 0 0 1-8-8m144 120H80V32a8 8 0 0 0-16 0v32H32a8 8 0 0 0 0 16h32v120a8 8 0 0 0 8 8h168a8 8 0 0 0 0-16\"/>",
	"b-arrows-out-simple": "<path fill=\"currentColor\" d=\"M216 48v48a8 8 0 0 1-16 0V67.31l-50.34 50.35a8 8 0 0 1-11.32-11.32L188.69 56H160a8 8 0 0 1 0-16h48a8 8 0 0 1 8 8m-109.66 90.34L56 188.69V160a8 8 0 0 0-16 0v48a8 8 0 0 0 8 8h48a8 8 0 0 0 0-16H67.31l50.35-50.34a8 8 0 0 0-11.32-11.32\"/>",
	"b-list-numbers": "<path fill=\"currentColor\" d=\"M224 128a8 8 0 0 1-8 8H104a8 8 0 0 1 0-16h112a8 8 0 0 1 8 8M104 72h112a8 8 0 0 0 0-16H104a8 8 0 0 0 0 16m112 112H104a8 8 0 0 0 0 16h112a8 8 0 0 0 0-16M43.58 55.16L48 52.94V104a8 8 0 0 0 16 0V40a8 8 0 0 0-11.58-7.16l-16 8a8 8 0 0 0 7.16 14.32m36.19 101.56a23.73 23.73 0 0 0-9.6-15.95a24.86 24.86 0 0 0-34.11 4.7a23.6 23.6 0 0 0-3.57 6.46a8 8 0 1 0 15 5.47a7.8 7.8 0 0 1 1.18-2.13a8.76 8.76 0 0 1 12-1.59a7.9 7.9 0 0 1 3.26 5.32a7.64 7.64 0 0 1-1.57 5.78a1 1 0 0 0-.08.11l-28.69 38.32A8 8 0 0 0 40 216h32a8 8 0 0 0 0-16H56l19.08-25.53a23.47 23.47 0 0 0 4.69-17.75\"/>",
	"b-hand-grabbing": "<path fill=\"currentColor\" d=\"M188 80a27.8 27.8 0 0 0-13.36 3.4a28 28 0 0 0-46.64-11A28 28 0 0 0 80 92v20H68a28 28 0 0 0-28 28v12a88 88 0 0 0 176 0v-44a28 28 0 0 0-28-28m12 72a72 72 0 0 1-144 0v-12a12 12 0 0 1 12-12h12v24a8 8 0 0 0 16 0V92a12 12 0 0 1 24 0v28a8 8 0 0 0 16 0V92a12 12 0 0 1 24 0v28a8 8 0 0 0 16 0v-12a12 12 0 0 1 24 0Z\"/>",
	"b-scissors": "<path fill=\"currentColor\" d=\"M157.73 113.13a8 8 0 0 1 2.09-11.13l67.66-46.3a8 8 0 0 1 9 13.21l-67.67 46.3a7.9 7.9 0 0 1-4.51 1.4a8 8 0 0 1-6.57-3.48m80.87 85.09a8 8 0 0 1-11.12 2.08L136 137.7l-42.51 29.08a36 36 0 1 1-9-13.19L121.83 128l-37.39-25.59a35.86 35.86 0 1 1 9-13.19l143 97.87a8 8 0 0 1 2.16 11.13M80 180a20 20 0 1 0-5.86 14.14A19.85 19.85 0 0 0 80 180m-5.86-89.87a20 20 0 1 0-28.28 0a19.85 19.85 0 0 0 28.28 0\"/>",
	"b-clipboard-text": "<path fill=\"currentColor\" d=\"M168 152a8 8 0 0 1-8 8H96a8 8 0 0 1 0-16h64a8 8 0 0 1 8 8m-8-40H96a8 8 0 0 0 0 16h64a8 8 0 0 0 0-16m56-64v168a16 16 0 0 1-16 16H56a16 16 0 0 1-16-16V48a16 16 0 0 1 16-16h36.26a47.92 47.92 0 0 1 71.48 0H200a16 16 0 0 1 16 16M96 64h64a32 32 0 0 0-64 0m104-16h-26.75A47.9 47.9 0 0 1 176 64v8a8 8 0 0 1-8 8H88a8 8 0 0 1-8-8v-8a47.9 47.9 0 0 1 2.75-16H56v168h144Z\"/>",
	"b-faders": "<path fill=\"currentColor\" d=\"M136 120v96a8 8 0 0 1-16 0v-96a8 8 0 0 1 16 0m64 72a8 8 0 0 0-8 8v16a8 8 0 0 0 16 0v-16a8 8 0 0 0-8-8m24-32h-16V40a8 8 0 0 0-16 0v120h-16a8 8 0 0 0 0 16h48a8 8 0 0 0 0-16m-168 0a8 8 0 0 0-8 8v48a8 8 0 0 0 16 0v-48a8 8 0 0 0-8-8m24-32H64V40a8 8 0 0 0-16 0v88H32a8 8 0 0 0 0 16h48a8 8 0 0 0 0-16m72-48h-16V40a8 8 0 0 0-16 0v40h-16a8 8 0 0 0 0 16h48a8 8 0 0 0 0-16\"/>",
	"b-sliders-horizontal": "<path fill=\"currentColor\" d=\"M40 88h33a32 32 0 0 0 62 0h81a8 8 0 0 0 0-16h-81a32 32 0 0 0-62 0H40a8 8 0 0 0 0 16m64-24a16 16 0 1 1-16 16a16 16 0 0 1 16-16m112 104h-17a32 32 0 0 0-62 0H40a8 8 0 0 0 0 16h97a32 32 0 0 0 62 0h17a8 8 0 0 0 0-16m-48 24a16 16 0 1 1 16-16a16 16 0 0 1-16 16\"/>",
	"b-cursor-text": "<path fill=\"currentColor\" d=\"M184 208a8 8 0 0 1-8 8h-16a40 40 0 0 1-32-16a40 40 0 0 1-32 16H80a8 8 0 0 1 0-16h16a24 24 0 0 0 24-24v-40h-16a8 8 0 0 1 0-16h16V80a24 24 0 0 0-24-24H80a8 8 0 0 1 0-16h16a40 40 0 0 1 32 16a40 40 0 0 1 32-16h16a8 8 0 0 1 0 16h-16a24 24 0 0 0-24 24v40h16a8 8 0 0 1 0 16h-16v40a24 24 0 0 0 24 24h16a8 8 0 0 1 8 8\"/>",
	"b-subtitles": "<path fill=\"currentColor\" d=\"M224 48H32a16 16 0 0 0-16 16v128a16 16 0 0 0 16 16h192a16 16 0 0 0 16-16V64a16 16 0 0 0-16-16m0 144H32V64h192zM48 136a8 8 0 0 1 8-8h16a8 8 0 0 1 0 16H56a8 8 0 0 1-8-8m160 0a8 8 0 0 1-8 8h-96a8 8 0 0 1 0-16h96a8 8 0 0 1 8 8m-48 32a8 8 0 0 1-8 8H56a8 8 0 0 1 0-16h96a8 8 0 0 1 8 8m48 0a8 8 0 0 1-8 8h-16a8 8 0 0 1 0-16h16a8 8 0 0 1 8 8\"/>",
	"b-brackets-angle": "<path fill=\"currentColor\" d=\"M86.75 44.3L33.48 128l53.27 83.7a8 8 0 0 1-2.46 11.05A7.9 7.9 0 0 1 80 224a8 8 0 0 1-6.76-3.71l-56-88a8 8 0 0 1 0-8.59l56-88a8 8 0 1 1 13.5 8.59Zm152 79.41l-56-88a8 8 0 1 0-13.5 8.59l53.27 83.7l-53.27 83.7a8 8 0 0 0 2.46 11.05A7.9 7.9 0 0 0 176 224a8 8 0 0 0 6.76-3.71l56-88a8 8 0 0 0-.01-8.58\"/>",
	"b-tag": "<path fill=\"currentColor\" d=\"M243.31 136L144 36.69A15.86 15.86 0 0 0 132.69 32H40a8 8 0 0 0-8 8v92.69A15.86 15.86 0 0 0 36.69 144L136 243.31a16 16 0 0 0 22.63 0l84.68-84.68a16 16 0 0 0 0-22.63m-96 96L48 132.69V48h84.69L232 147.31ZM96 84a12 12 0 1 1-12-12a12 12 0 0 1 12 12\"/>",
	"b-clock": "<path fill=\"currentColor\" d=\"M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88m64-88a8 8 0 0 1-8 8h-56a8 8 0 0 1-8-8V72a8 8 0 0 1 16 0v48h48a8 8 0 0 1 8 8\"/>"
}, Q = "<rect x=\"44\" y=\"44\" width=\"168\" height=\"168\" rx=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"14\" stroke-dasharray=\"18 18\" opacity=\".4\"/>", ft = {
	"b-side-all": "<rect x=\"44\" y=\"44\" width=\"168\" height=\"168\" rx=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"18\"/>",
	"b-side-top": Q + "<path d=\"M44 44h168\" stroke=\"currentColor\" stroke-width=\"22\" stroke-linecap=\"round\"/>",
	"b-side-right": Q + "<path d=\"M212 44v168\" stroke=\"currentColor\" stroke-width=\"22\" stroke-linecap=\"round\"/>",
	"b-side-bottom": Q + "<path d=\"M44 212h168\" stroke=\"currentColor\" stroke-width=\"22\" stroke-linecap=\"round\"/>",
	"b-side-left": Q + "<path d=\"M44 44v168\" stroke=\"currentColor\" stroke-width=\"22\" stroke-linecap=\"round\"/>"
};
function pt() {
	for (let [e, t] of Object.entries({
		...dt,
		...ft
	})) I.icons.get(e) || I.icons.set(e, t);
}
// admin/src/builder/content/IconField.tsx
var mt = [
	"regular",
	"bold",
	"fill",
	"light"
], ht = (e) => ({
	regular: L("Regular"),
	bold: L("Bold"),
	fill: L("Fill"),
	light: L("Light")
})[e], gt = (e) => {
	let t = e.match(/^(.*)-(bold|fill|light)$/);
	return t ? {
		base: t[1],
		weight: t[2]
	} : {
		base: e,
		weight: "regular"
	};
};
function _t({ field: e, value: t, onChange: n, disabled: r }) {
	let [i, a] = Y(!1), [o, s] = Y(""), [c, l] = Y(""), u = (t ?? "").replace(/^ph:/, ""), { base: d, weight: f } = gt(u), p = R("blocks/icons", {
		query: d,
		limit: 1
	}, {
		enabled: !!d,
		staleTime: Infinity
	}), m = R("blocks/icons", {
		query: c,
		limit: 160
	}, {
		enabled: i,
		staleTime: Infinity
	}), h = p.data?.find((e) => e.name === d) ?? p.data?.[0];
	K(() => {
		let e = window.setTimeout(() => l(o.trim()), 140);
		return () => window.clearTimeout(e);
	}, [o]);
	let g = (e, t = f) => n(t === "regular" ? e : `${e}-${t}`);
	return /* @__PURE__ */ Z("div", {
		className: "group/icon relative min-w-0 flex-1",
		children: [/* @__PURE__ */ Z(U, {
			open: i,
			onOpenChange: (e) => !r && a(e),
			className: "w-[284px] !p-0",
			trigger: /* @__PURE__ */ Z("button", {
				type: "button",
				id: G(e),
				disabled: r,
				"aria-label": e.label,
				className: W("cms-input flex h-7 w-full min-w-0 items-center gap-2 rounded-sm px-2 text-left text-sm disabled:opacity-50", u && "pr-6"),
				children: [
					u && h ? /* @__PURE__ */ X("span", {
						className: "grid size-3.5 shrink-0 place-items-center text-text [&_svg]:size-3.5",
						dangerouslySetInnerHTML: { __html: h.svg }
					}) : /* @__PURE__ */ X(V, {
						name: "star",
						size: 14,
						className: "shrink-0 text-faint"
					}),
					/* @__PURE__ */ X("span", {
						className: W("min-w-0 flex-1 truncate", !u && "text-ghost"),
						children: u ? d : e.placeholder || L("Choose an Icon")
					}),
					u && f !== "regular" && /* @__PURE__ */ X("span", {
						className: "shrink-0 text-faint",
						children: ht(f)
					})
				]
			}),
			children: [
				/* @__PURE__ */ Z("div", {
					className: "flex h-10 items-center gap-2 border-b border-border px-3",
					children: [
						/* @__PURE__ */ X(V, {
							name: "search",
							size: 14,
							className: "shrink-0 text-faint"
						}),
						/* @__PURE__ */ X("input", {
							autoFocus: !0,
							value: o,
							onChange: (e) => s(e.target.value),
							placeholder: L("Search Icons"),
							"aria-label": L("Search Icons"),
							spellCheck: !1,
							className: "h-full min-w-0 flex-1 bg-transparent text-sm text-text outline-none placeholder:text-faint"
						}),
						m.isFetching && /* @__PURE__ */ X(De, { size: 12 })
					]
				}),
				/* @__PURE__ */ X("div", {
					className: "border-b border-border p-1.5",
					children: /* @__PURE__ */ X(Ee, {
						size: "xs",
						block: !0,
						value: f,
						onChange: (e) => u ? g(d, e) : void 0,
						options: mt.map((e) => ({
							value: e,
							label: ht(e)
						}))
					})
				}),
				/* @__PURE__ */ Z("div", {
					className: "grid max-h-64 grid-cols-8 gap-0.5 overflow-y-auto p-1.5",
					role: "listbox",
					"aria-label": L("Icons"),
					children: [(m.data ?? []).map((e) => /* @__PURE__ */ X("button", {
						type: "button",
						role: "option",
						"aria-selected": e.name === d,
						title: e.name,
						onClick: () => {
							g(e.name), a(!1);
						},
						className: W("grid aspect-square place-items-center rounded-xs text-text hover:bg-hover [&_svg]:size-4", e.name === d && "bg-focus-soft text-focus"),
						dangerouslySetInnerHTML: { __html: e.svg }
					}, e.name)), !m.isFetching && m.data?.length === 0 && /* @__PURE__ */ X("p", {
						className: "col-span-8 m-0 py-6 text-center text-xs text-faint",
						children: L("No icons found")
					})]
				})
			]
		}), u && !r && /* @__PURE__ */ X("button", {
			type: "button",
			onClick: () => n(null),
			"aria-label": L("Remove Icon"),
			className: "absolute right-1 top-1/2 grid size-5 -translate-y-1/2 place-items-center rounded-xs text-faint opacity-0 hover:bg-hover hover:text-text focus-visible:opacity-100 group-hover/icon:opacity-100",
			children: /* @__PURE__ */ X(V, {
				name: "close",
				size: 12
			})
		})]
	});
}
// admin/src/write/Blocks.tsx
function vt() {
	return /* @__PURE__ */ X("hr", { className: "my-3 border-0 border-t border-border-strong" });
}
function yt({ nodes: e }) {
	let { store: t, types: n, allowed: r } = b(), { readOnly: i } = O(), a = e[e.length - 1];
	return /* @__PURE__ */ Z("div", {
		className: "group/actions flex flex-wrap items-center gap-x-3 gap-y-2 py-1",
		children: [e.map((e) => /* @__PURE__ */ X(xt, { node: e }, e.id)), !i && a.type === "button" && n.has("button") && /* @__PURE__ */ X(H, {
			icon: "plus",
			label: L("Add a Button"),
			size: "xs",
			className: "opacity-0 transition-opacity group-hover/actions:opacity-100 focus-visible:opacity-100",
			onClick: () => {
				let e = t.get().nodes, i = P(e, a.id, "button", n, r), o = n.get("button");
				if (!i || !o) return;
				let s = be(o, {
					label: "",
					variant: a.type === "button" && (a.props.variant ?? "primary") === "primary" ? "secondary" : a.props.variant ?? "primary"
				}, n);
				t.insert(i.parentId, i.index, [s]), t.focus(s.id, "end", "label");
			}
		})]
	});
}
var bt = {
	primary: "h-9 rounded-md bg-ink px-4 text-ink-contrast",
	secondary: "h-9 rounded-md border border-border-strong bg-bg px-4 text-text",
	ghost: "h-9 rounded-md px-3 text-text bg-sunken/60",
	link: "h-9 text-text underline decoration-border-strong underline-offset-4"
};
function xt({ node: t }) {
	let { store: n } = b(), { readOnly: r } = O(), [a, o] = Y(!1), s = e(n, (e) => e.focus?.id === t.id && e.focus.prop === "label" ? e.focus : null), c = t.type === "link", l = String(t.props.url ?? ""), u = c ? bt.link : bt[t.props.variant ?? "primary"] ?? bt.primary, f = i(), m = [
		d({
			handle: "url",
			label: L("Link"),
			placeholder: L("Paste a link or search pages"),
			autofocus: !l,
			anchors: f
		}),
		...c ? [] : [{
			handle: "variant",
			type: "select",
			label: L("Style"),
			display: "segmented",
			block: !0,
			options: [
				{
					value: "primary",
					label: L("Primary")
				},
				{
					value: "secondary",
					label: L("Secondary")
				},
				{
					value: "ghost",
					label: L("Ghost")
				},
				{
					value: "link",
					label: L("Text")
				}
			]
		}],
		{
			handle: "new_tab",
			type: "toggle",
			label: L("Open in New Tab")
		}
	];
	return /* @__PURE__ */ Z("span", {
		className: "group/action relative inline-flex",
		children: [
			/* @__PURE__ */ X("span", {
				className: W("inline-flex items-center text-sm font-medium", u),
				children: /* @__PURE__ */ X(p, {
					html: String(t.props.label ?? ""),
					singleLine: !0,
					quiet: !0,
					disabled: r,
					placeholder: L(c ? "Link Text" : "Button Text"),
					className: "min-w-8 whitespace-nowrap",
					focus: s,
					onChange: (e) => n.updateProps(t.id, { label: e }),
					onFocus: () => n.get().selected !== t.id && n.select(t.id),
					onKeyDown: (e, r) => {
						(e.key === "Enter" || e.key === "Escape") && (e.preventDefault(), r.blur(), e.key === "Escape" && n.select(t.id, !0));
					}
				})
			}),
			!l && /* @__PURE__ */ X("span", {
				className: "pointer-events-none absolute -right-0.5 -top-0.5 size-2 rounded-full bg-warning ring-2 ring-bg",
				title: L("No link yet")
			}),
			!r && /* @__PURE__ */ X(U, {
				open: a,
				onOpenChange: o,
				align: "start",
				className: "w-80 !p-3",
				trigger: /* @__PURE__ */ X("button", {
					type: "button",
					"aria-label": L("Edit Link"),
					title: l || L("Add a Link"),
					className: W("absolute -right-2.5 -top-2.5 grid size-6 place-items-center rounded-full border border-border bg-bg text-muted shadow-pop transition-opacity hover:text-text", a ? "opacity-100" : "opacity-0 group-hover/action:opacity-100 focus-visible:opacity-100"),
					children: /* @__PURE__ */ X(V, {
						name: "link",
						size: 12
					})
				}),
				children: /* @__PURE__ */ Z("div", {
					className: "space-y-3",
					onKeyDown: (e) => e.key === "Enter" && !e.defaultPrevented && e.target.tagName === "INPUT" && o(!1),
					children: [/* @__PURE__ */ X(B, {
						fields: m,
						values: t.props,
						onChange: (e, r) => (e !== "variant" || r) && n.updateProps(t.id, { [e]: r ?? (e === "url" ? "" : r) }, `${e}:${t.id}`),
						className: "!gap-y-3"
					}), /* @__PURE__ */ X("div", {
						className: "flex justify-end border-t border-border pt-2.5",
						children: /* @__PURE__ */ X(z, {
							size: "xs",
							variant: "ghost",
							icon: "trash",
							onClick: () => {
								o(!1), n.remove(t.id);
							},
							children: L(c ? "Remove Link" : "Remove Button")
						})
					})]
				})
			})
		]
	});
}
function St(e) {
	let t = Array.isArray(e) ? e[0] : e, n = typeof t == "string" && /^(https?:|\/)/.test(t), r = R("media/lookup", { ids: [t] }, {
		enabled: typeof t == "string" && !n && t.length > 0,
		staleTime: 3e5,
		retry: !1
	});
	if (n) return t;
	let i = r.data?.items?.[0];
	return i ? i.url ?? i.thumb : null;
}
function Ct({ node: e }) {
	let { store: t } = b(), { settings: n, readOnly: r } = O(), i = St(e.props.image);
	return /* @__PURE__ */ Z("figure", {
		className: "cms-block-figure m-0 py-1",
		children: [i ? /* @__PURE__ */ Z("div", {
			className: "group/image relative",
			children: [
				/* @__PURE__ */ X("img", {
					src: i,
					alt: e.props.alt ?? "",
					className: "block max-h-[520px] w-full rounded-md bg-sunken object-cover",
					style: e.props.aspect && e.props.aspect !== "auto" ? { aspectRatio: e.props.aspect } : void 0
				}),
				!r && /* @__PURE__ */ X("div", {
					className: "absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover/image:opacity-100",
					children: /* @__PURE__ */ X(z, {
						size: "xs",
						variant: "secondary",
						icon: "settings",
						onClick: () => n(e.id),
						children: L("Edit")
					})
				}),
				!e.props.alt && !r && /* @__PURE__ */ X("span", {
					className: "absolute bottom-2 left-2 rounded-xs bg-bg/90 px-1.5 py-0.5 text-2xs text-muted opacity-0 shadow-pop transition-opacity group-hover/image:opacity-100",
					children: L("No alt text")
				})
			]
		}) : /* @__PURE__ */ Z("div", {
			className: "flex h-36 flex-col items-center justify-center gap-3 rounded-md bg-surface text-faint",
			children: [/* @__PURE__ */ X(V, {
				name: "image",
				size: 22
			}), /* @__PURE__ */ X(B, {
				bare: !0,
				disabled: r,
				fields: [{
					handle: "image",
					type: "media",
					label: L("Image"),
					max: 1,
					accept: "image/*"
				}],
				values: { image: e.props.image },
				onChange: (n, r) => t.updateProps(e.id, { image: r })
			})]
		}), /* @__PURE__ */ X(wt, { node: e })]
	});
}
function wt({ node: t }) {
	let { store: n } = b(), { readOnly: r } = O(), i = e(n, (e) => e.focus?.id === t.id && e.focus.prop === "caption" ? e.focus : null);
	return r && !t.props.caption ? null : /* @__PURE__ */ X("figcaption", { children: /* @__PURE__ */ X(p, {
		html: String(t.props.caption ?? ""),
		quiet: !0,
		disabled: r,
		placeholder: L("Add a Caption"),
		focus: i,
		className: "mt-2 text-sm text-muted",
		onChange: (e) => n.updateProps(t.id, { caption: e }),
		onFocus: () => n.select(t.id)
	}) });
}
function Tt({ node: e, type: t }) {
	let { settings: n } = O(), r = String(e.props.url ?? ""), i = r ? r.replace(/^https?:\/\/(www\.)?/, "").split(/[/?#]/)[0] : "";
	return /* @__PURE__ */ Z("figure", {
		className: "cms-block-figure m-0 py-1",
		children: [/* @__PURE__ */ Z("button", {
			type: "button",
			onClick: () => n(e.id),
			className: "flex h-14 w-full items-center gap-3 rounded-md bg-surface px-4 text-left hover:bg-hover",
			children: [/* @__PURE__ */ X(V, {
				name: t?.icon ?? "embed",
				size: 18,
				className: "text-muted"
			}), /* @__PURE__ */ Z("span", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ X("span", {
					className: "block truncate text-sm text-text",
					children: e.props.title || i || (e.type === "video" ? L("Add a video link") : L("Add a link to embed"))
				}), i && e.props.title && /* @__PURE__ */ X("span", {
					className: "block truncate text-xs text-faint",
					children: i
				})]
			})]
		}), t?.inline?.includes("caption") && /* @__PURE__ */ X(wt, { node: e })]
	});
}
function Et({ node: e }) {
	let { store: t } = b(), { settings: n, readOnly: r } = O();
	return /* @__PURE__ */ Z("div", {
		className: "group/code relative py-1",
		onFocus: () => t.select(e.id),
		children: [/* @__PURE__ */ X(B, {
			bare: !0,
			disabled: r,
			fields: [{
				handle: "code",
				type: "code",
				label: L("Code"),
				placeholder: L("Code"),
				rows: 3
			}],
			values: { code: e.props.code ?? "" },
			onChange: (n, r) => t.updateProps(e.id, { code: r ?? "" }, `code:${e.id}`)
		}), /* @__PURE__ */ X("button", {
			type: "button",
			onClick: () => n(e.id),
			className: "absolute right-2 top-2.5 rounded-xs px-1.5 font-mono text-2xs text-faint hover:bg-hover hover:text-text",
			children: e.props.language && e.props.language !== "plain" ? e.props.language : L("Plain Text")
		})]
	});
}
function Dt({ node: e }) {
	let { store: t } = b(), { readOnly: n } = O(), r = Array.isArray(e.props.rows) && e.props.rows.length ? e.props.rows : [["", ""], ["", ""]], i = Math.max(...r.map((e) => e.length)), a = (n, a, o) => t.updateProps(e.id, { rows: r.map((e, t) => t === n ? Array.from({ length: i }, (t, n) => n === a ? o : e[n] ?? "") : e) }, `table:${e.id}`), o = (n) => t.updateProps(e.id, { rows: n });
	return /* @__PURE__ */ Z("div", {
		className: "group/table py-1",
		children: [/* @__PURE__ */ X("div", {
			className: "overflow-x-auto rounded-md border border-border",
			children: /* @__PURE__ */ X("table", {
				className: "w-full border-collapse text-sm",
				children: /* @__PURE__ */ X("tbody", { children: r.map((r, o) => /* @__PURE__ */ X("tr", {
					className: W("border-b border-border last:border-b-0", o === 0 && e.props.header !== !1 && "bg-surface font-medium"),
					children: Array.from({ length: i }, (i, s) => /* @__PURE__ */ X("td", {
						className: "min-w-24 border-r border-border px-3 py-2 align-top last:border-r-0",
						children: /* @__PURE__ */ X(p, {
							html: r[s] ?? "",
							singleLine: !0,
							disabled: n,
							onChange: (e) => a(o, s, e),
							onFocus: () => t.select(e.id)
						})
					}, s))
				}, o)) })
			})
		}), !n && /* @__PURE__ */ Z("div", {
			className: "mt-1 flex gap-1 opacity-0 transition-opacity group-hover/table:opacity-100 group-focus-within/table:opacity-100",
			children: [
				/* @__PURE__ */ X(z, {
					size: "xs",
					variant: "ghost",
					icon: "plus",
					onClick: () => o([...r, Array(i).fill("")]),
					children: L("Row")
				}),
				/* @__PURE__ */ X(z, {
					size: "xs",
					variant: "ghost",
					icon: "plus",
					onClick: () => o(r.map((e) => [...e, ""])),
					children: L("Column")
				}),
				r.length > 1 && /* @__PURE__ */ X(z, {
					size: "xs",
					variant: "ghost",
					icon: "minus",
					onClick: () => o(r.slice(0, -1)),
					children: L("Row")
				}),
				i > 1 && /* @__PURE__ */ X(z, {
					size: "xs",
					variant: "ghost",
					icon: "minus",
					onClick: () => o(r.map((e) => e.slice(0, i - 1))),
					children: L("Column")
				})
			]
		})]
	});
}
function Ot({ node: e }) {
	let { store: t } = b(), { readOnly: n } = O(), r = Array.isArray(e.props.items) ? e.props.items : [], i = (n, i) => t.updateProps(e.id, { items: r.map((e, t) => t === n ? {
		...e,
		...i
	} : e) }, `faq:${e.id}:${n}`), a = r.length ? r : [{
		question: "",
		answer: ""
	}];
	return /* @__PURE__ */ Z("div", {
		className: "group/faq py-1",
		children: [/* @__PURE__ */ X("div", {
			className: "divide-y divide-border border-y border-border",
			children: a.map((a, o) => /* @__PURE__ */ Z("div", {
				className: "py-3",
				children: [/* @__PURE__ */ Z("div", {
					className: "flex items-start gap-2",
					children: [
						/* @__PURE__ */ X(V, {
							name: "chevron-down",
							size: 14,
							className: "mt-1 shrink-0 text-faint"
						}),
						/* @__PURE__ */ X(p, {
							html: jt(a.question ?? ""),
							singleLine: !0,
							disabled: n,
							placeholder: L("Question"),
							className: "min-w-0 flex-1 text-[15px] font-medium leading-6",
							onChange: (e) => i(o, { question: Mt(e) }),
							onFocus: () => t.select(e.id)
						}),
						!n && r.length > 1 && /* @__PURE__ */ X(H, {
							icon: "close",
							label: L("Remove Question"),
							size: "xs",
							className: "opacity-0 group-hover/faq:opacity-100",
							onClick: () => t.updateProps(e.id, { items: r.filter((e, t) => t !== o) })
						})
					]
				}), /* @__PURE__ */ X(p, {
					html: a.answer ?? "",
					quiet: !0,
					disabled: n,
					placeholder: L("Answer"),
					className: "mt-1 pl-[22px] text-[15px] leading-6 text-muted",
					onChange: (e) => i(o, { answer: e }),
					onFocus: () => t.select(e.id)
				})]
			}, o))
		}), !n && /* @__PURE__ */ X(z, {
			size: "xs",
			variant: "ghost",
			icon: "plus",
			className: "mt-1 opacity-0 transition-opacity group-hover/faq:opacity-100",
			onClick: () => t.updateProps(e.id, { items: [...r, {
				question: "",
				answer: ""
			}] }),
			children: L("Question")
		})]
	});
}
function kt({ node: e }) {
	let { store: t } = b(), { readOnly: n } = O(), r = R("patterns/list", { working: !0 }, { staleTime: 3e4 }), i = r.data?.find((t) => t.handle === e.props.ref), a = e.props.values ?? {}, o = e.bind ?? {}, s = (i?.props ?? []).filter((e) => e.type !== "json"), c = (n, r) => t.updateProps(e.id, { values: {
		...a,
		[n]: r
	} }, `values:${e.id}:${n}`), l = /* @__PURE__ */ Z("div", {
		className: "flex h-8 items-center gap-2 text-xs",
		children: [
			/* @__PURE__ */ X(V, {
				name: "symbol",
				size: 13,
				className: "text-faint"
			}),
			/* @__PURE__ */ X("span", {
				className: "truncate font-medium text-muted",
				children: i?.title ?? (r.isLoading ? "…" : L("Missing component"))
			}),
			/* @__PURE__ */ X("span", { className: "flex-1" }),
			i?.id && /* @__PURE__ */ X("button", {
				type: "button",
				onClick: () => Se(`/content/components/${i.id}`),
				className: "rounded-xs px-1.5 text-faint opacity-0 transition-opacity hover:bg-hover hover:text-text group-hover/component:opacity-100",
				children: L("Edit Component")
			})
		]
	});
	return s.length === 0 ? /* @__PURE__ */ Z("div", {
		className: "flex h-9 items-center gap-2 rounded-md px-1 text-sm text-faint",
		children: [
			/* @__PURE__ */ X(V, {
				name: "symbol",
				size: 14
			}),
			/* @__PURE__ */ X("span", {
				className: "truncate text-muted",
				children: i?.title ?? (r.isLoading ? "…" : L("Missing component"))
			}),
			i?.id && /* @__PURE__ */ X("button", {
				type: "button",
				onClick: () => Se(`/content/components/${i.id}`),
				className: "shrink-0 rounded-xs px-1 text-xs text-faint hover:bg-hover hover:text-text",
				children: L("Edit Component")
			})
		]
	}) : /* @__PURE__ */ Z("div", {
		className: "group/component rounded-md border border-border px-3 pb-1",
		children: [l, s.length > 0 && /* @__PURE__ */ X("div", {
			className: "space-y-2.5 border-t border-border py-2.5",
			children: s.map((r) => {
				let i = a[r.handle] ?? r.default, s = o[`values.${r.handle}`];
				return /* @__PURE__ */ Z("div", {
					className: "grid grid-cols-[120px_minmax(0,1fr)] items-start gap-3",
					children: [/* @__PURE__ */ X("span", {
						className: "truncate pt-[3px] text-xs text-faint",
						title: r.instructions,
						children: r.label
					}), s ? /* @__PURE__ */ X("span", {
						className: "pt-[3px] font-mono text-xs text-faint",
						children: s
					}) : [
						"text",
						"textarea",
						"richtext"
					].includes(r.type) ? /* @__PURE__ */ X(p, {
						html: r.type === "richtext" ? String(i ?? "") : jt(String(i ?? "")),
						singleLine: r.type === "text",
						disabled: n,
						placeholder: r.placeholder ?? L("Empty"),
						className: "text-[15px] leading-6",
						onChange: (e) => c(r.handle, r.type === "richtext" ? e : Mt(e)),
						onFocus: () => t.select(e.id)
					}) : /* @__PURE__ */ X(B, {
						bare: !0,
						disabled: n,
						fields: [r.type === "url" ? d({
							...r,
							label: r.label
						}) : {
							...r,
							size: "sm"
						}],
						values: { [r.handle]: i },
						onChange: (e, t) => c(r.handle, t)
					})]
				}, r.handle);
			})
		})]
	});
}
function At({ node: e, type: t }) {
	let { settings: n } = O(), r = A(e, 80);
	return /* @__PURE__ */ Z("button", {
		type: "button",
		onClick: () => n(e.id),
		className: "my-1 flex w-full items-center gap-3 rounded-md bg-surface px-3 py-2.5 text-left hover:bg-hover",
		children: [/* @__PURE__ */ X(V, {
			name: t?.icon ?? "square",
			size: 16,
			className: "shrink-0 text-muted"
		}), /* @__PURE__ */ Z("span", {
			className: "min-w-0 flex-1",
			children: [/* @__PURE__ */ X("span", {
				className: "block text-sm text-text",
				children: t?.title ?? e.type
			}), (r || !t) && /* @__PURE__ */ X("span", {
				className: "block truncate text-xs text-faint",
				children: t ? r : L("Its plugin is off — the content is kept")
			})]
		})]
	});
}
function jt(e) {
	return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
}
function Mt(e) {
	let t = document.createElement("div");
	return t.innerHTML = e.replace(/<br\s*\/?>/g, "\n"), t.textContent ?? "";
}
// admin/src/write/WriteEditor.tsx
var Nt = /* @__PURE__ */ new Map(), Pt = (e) => Nt.get(e) ?? Nt.get(e.split("/")[0] + "/*"), Ft = (e) => !!Pt(e), It = Oe(null);
function Lt({ onInspect: r } = {}) {
	let { store: i, types: a, allowed: o, readOnly: s = !1 } = b(), c = e(i, (e) => e.nodes), l = q(() => fe(c, a, Ft), [c, a]), d = q(() => new Map(ee(l).map((e) => [h(e), e])), [l]), p = J(null), [m, _] = Y(null), [v, y] = Y(null), [x, S] = Y(null), C = Ve(Be(Fe, { activationConstraint: { distance: 5 } })), w = J(null), T = q(() => ({
		stops: () => {
			let e = i.get().nodes;
			return w.current?.nodes !== e && (w.current = {
				nodes: e,
				stops: de(fe(e, a, Ft))
			}), w.current.stops;
		},
		settings: (e) => {
			i.select(e, !0), r ? r(e) : _(e);
		},
		readOnly: s
	}), [
		i,
		a,
		s,
		r
	]);
	je(() => {
		c.length === 0 && !s && F(null, "paragraph", a, o) && i.reset([f()]);
	}, [
		c,
		s,
		i,
		a,
		o
	]);
	let E = J(d);
	E.current = d, Yt(i, p, T, E);
	let D = (e, n, r) => {
		let s = i.get().nodes, c = r === "before" ? t(n)[0] : t(n).at(-1), l = t(e);
		if (l.some((e) => e.id === c.id || he(s, c.id).some((t) => t.id === e.id))) return null;
		let u = M(s, c.id);
		if (!u) return null;
		let d = u.parentId ? j(s, u.parentId) : null;
		return l.every((e) => F(d, e.type, a, d ? [] : o)) ? {
			ids: l.map((e) => e.id),
			parentId: u.parentId,
			index: r === "before" ? u.index : u.index + 1
		} : null;
	};
	return /* @__PURE__ */ X(g.Provider, {
		value: T,
		children: /* @__PURE__ */ Z("div", {
			ref: p,
			className: "relative",
			"data-cms-write": !0,
			children: [
				/* @__PURE__ */ Z(Ne, {
					sensors: C,
					collisionDetection: Rt,
					onDragStart: (e) => S(d.get(String(e.active.id)) ?? null),
					onDragMove: (e) => {
						let t = d.get(String(e.active.id)), n = e.over ? d.get(String(e.over.id)) : null;
						if (!t || !n || e.over.id === e.active.id) return v && y(null);
						let r = e.activatorEvent.clientY + e.delta.y < e.over.rect.top + e.over.rect.height / 2 ? "before" : "after", i = D(t, n, r) ? {
							id: String(e.over.id),
							side: r
						} : null;
						(i?.id !== v?.id || i?.side !== v?.side) && y(i);
					},
					onDragEnd: (e) => {
						let t = d.get(String(e.active.id)), n = v ? d.get(v.id) : null;
						y(null), S(null);
						let r = t && n && v ? D(t, n, v.side) : null;
						r && i.moveTo(r.ids, r.parentId, r.index);
					},
					onDragCancel: () => {
						y(null), S(null);
					},
					children: [/* @__PURE__ */ X(It.Provider, {
						value: v,
						children: l.map((e, t) => /* @__PURE__ */ X(zt, {
							section: e,
							spaced: t > 0 && (e.container || l[t - 1].container)
						}, e.id))
					}), Me(/* @__PURE__ */ X(Pe, {
						dropAnimation: null,
						children: x && /* @__PURE__ */ X(qt, { row: x })
					}), document.body)]
				}),
				!s && /* @__PURE__ */ X("button", {
					type: "button",
					tabIndex: -1,
					"aria-label": L("Continue Writing"),
					onClick: () => {
						let e = T.stops().at(-1), r = e ? j(i.get().nodes, e.id) : null;
						if (r?.type === "paragraph" && ge(r.props.text)) return n(i, e, "end");
						let s = i.get().nodes, c = l.at(-1), u = c?.container ? t(c.rows.at(-1)).at(-1).id : s.at(-1)?.id, d = u ? P(s, u, "paragraph", a, o) : {
							parentId: null,
							index: 0
						};
						if (!d) return;
						let p = f();
						i.insert(d.parentId, d.index, [p]), i.focus(p.id, "start");
					},
					className: "block h-28 w-full cursor-text"
				}),
				/* @__PURE__ */ X(u, {}),
				/* @__PURE__ */ X(Jt, {}),
				m && !r && /* @__PURE__ */ X(Ce, {
					open: !0,
					onOpenChange: (e) => !e && _(null),
					title: L("Block"),
					children: j(c, m) && /* @__PURE__ */ X(k, {
						node: j(c, m),
						onClose: () => _(null)
					})
				})
			]
		})
	});
}
var Rt = (e) => {
	let t = Le(e);
	if (t.length === 0) return Ie(e);
	let n = (t) => {
		let n = e.droppableRects.get(t);
		return n ? n.width * n.height : Infinity;
	};
	return [...t].sort((e, t) => n(e.id) - n(t.id)).slice(0, 1);
};
function zt({ section: e, spaced: t }) {
	return /* @__PURE__ */ Z("section", {
		className: W("group/section relative", t && "mt-10"),
		children: [e.label && /* @__PURE__ */ X("div", {
			className: "pointer-events-none absolute right-[calc(100%+76px)] top-[5px] max-w-40 truncate whitespace-nowrap text-2xs text-faint opacity-0 transition-opacity duration-150 group-focus-within/section:opacity-100 group-hover/section:opacity-100 max-xl:hidden",
			children: e.label
		}), e.rows.map((e, t) => /* @__PURE__ */ X($, {
			row: e,
			first: t === 0
		}, h(e)))]
	});
}
function Bt(e, t) {
	if (e.kind === "text" && e.node.type === "heading") {
		let n = String(e.node.props.level ?? 2), r = {
			1: 38,
			2: 32,
			3: 28
		}[n] ?? 26;
		return {
			className: t ? "" : n === "1" ? "mt-8" : n === "2" ? "mt-7" : "mt-5",
			line: r
		};
	}
	return e.kind === "actions" ? {
		className: t ? "" : "mt-2",
		line: 44
	} : e.kind === "text" || e.kind === "list" ? {
		className: t ? "" : "mt-1",
		line: 27
	} : {
		className: t ? "" : "mt-2",
		line: 30
	};
}
function $({ row: n, first: r, nested: i }) {
	let { store: a } = b(), { readOnly: o } = O(), s = h(n), c = t(n).map((e) => e.id), l = e(a, (e) => e.blockMode && me(e).some((e) => c.includes(e))), u = Ae(It), d = ze({ id: s }), f = Re({
		id: s,
		disabled: o
	}), { className: p, line: m } = Bt(n, r);
	return /* @__PURE__ */ Z("div", {
		ref: (e) => {
			d.setNodeRef(e), f.setNodeRef(e);
		},
		"data-row": s,
		"data-nested": i || void 0,
		style: { "--line": `${m}px` },
		className: W(i ? "group/nested" : "group/row", "relative py-[3px]", p, f.isDragging && "opacity-35", n.hidden && "opacity-45"),
		onMouseDown: (e) => {
			let t = e.target;
			t.closest("[data-row]") !== e.currentTarget || t.closest("[contenteditable=\"true\"],textarea,input,button,a,[role=\"button\"]") || (e.shiftKey && a.get().selected ? (e.preventDefault(), a.get().blockMode || a.select(a.get().selected, !0), a.extendTo(c.at(-1))) : (a.select(c[0], !0), c.length > 1 && a.extendTo(c.at(-1))));
		},
		children: [
			u?.id === s && /* @__PURE__ */ X("div", { className: W("pointer-events-none absolute inset-x-0 z-10 h-0.5 rounded-full bg-focus", u.side === "before" ? "-top-px" : "-bottom-px") }),
			!o && /* @__PURE__ */ X(Ut, {
				row: n,
				handle: f,
				nested: i
			}),
			/* @__PURE__ */ X("div", {
				className: W("rounded-sm transition-[background-color,box-shadow] duration-100", l && "bg-focus/10 shadow-[0_0_0_3px_color-mix(in_srgb,var(--cms-focus)_10%,transparent)]"),
				children: /* @__PURE__ */ X(Vt, { row: n })
			})
		]
	});
}
function Vt({ row: e }) {
	let { types: t } = b(), { settings: n } = O();
	if (e.kind === "text") return /* @__PURE__ */ X(D, { node: e.node });
	if (e.kind === "list") return /* @__PURE__ */ X(oe, { node: e.node });
	if (e.kind === "actions") return /* @__PURE__ */ X(yt, { nodes: e.nodes });
	if (e.kind === "container") {
		let r = t.get(e.node.type);
		return /* @__PURE__ */ Z("div", {
			className: "rounded-md border border-border/70 px-4 pb-3 pt-2",
			children: [/* @__PURE__ */ Z("button", {
				type: "button",
				onClick: () => n(e.node.id),
				className: "mb-2 flex max-w-full items-center gap-1.5 text-xs text-faint hover:text-text",
				children: [/* @__PURE__ */ X(V, {
					name: r?.icon ?? "square",
					size: 12
				}), /* @__PURE__ */ X("span", {
					className: "truncate",
					children: e.node.label || r?.title || e.node.type
				})]
			}), e.rows.length ? e.rows.map((e, t) => /* @__PURE__ */ X($, {
				row: e,
				first: t === 0,
				nested: !0
			}, h(e))) : /* @__PURE__ */ X(Ht, { column: e.node })]
		});
	}
	if (e.kind === "columns") {
		let t = String(e.node.props.layout ?? "1-1").split("-").map((e) => `minmax(0,${e}fr)`).join(" ");
		return /* @__PURE__ */ X("div", {
			className: "grid gap-8 py-1 max-md:!grid-cols-1",
			style: { gridTemplateColumns: t },
			children: e.columns.map((e) => /* @__PURE__ */ X("div", {
				className: "min-w-0",
				children: e.rows.length ? e.rows.map((e, t) => /* @__PURE__ */ X($, {
					row: e,
					first: t === 0,
					nested: !0
				}, h(e))) : /* @__PURE__ */ X(Ht, { column: e.node })
			}, e.node.id))
		});
	}
	let r = e.node, i = t.get(r.type), a = Pt(r.type);
	if (a) return /* @__PURE__ */ X(a, {
		node: r,
		type: i,
		onSettings: n
	});
	switch (r.type) {
		case "image": return /* @__PURE__ */ X(Ct, { node: r });
		case "video":
		case "embed": return /* @__PURE__ */ X(Tt, {
			node: r,
			type: i
		});
		case "code": return /* @__PURE__ */ X(Et, { node: r });
		case "table": return /* @__PURE__ */ X(Dt, { node: r });
		case "divider": return /* @__PURE__ */ X(vt, {});
		case "accordion": return /* @__PURE__ */ X(Ot, { node: r });
		case "pattern": return /* @__PURE__ */ X(kt, { node: r });
		default: return /* @__PURE__ */ X(At, {
			node: r,
			type: i
		});
	}
}
function Ht({ column: e }) {
	let { store: t, types: n } = b(), { readOnly: r } = O();
	return r || !F(e, "paragraph", n, []) ? null : /* @__PURE__ */ X("button", {
		type: "button",
		onClick: () => {
			let n = f();
			t.insert(e.id, 0, [n]), t.focus(n.id, "start");
		},
		className: W(re, "block w-full cursor-text py-[3px] text-left text-faint opacity-0 hover:opacity-100"),
		children: L("Write here")
	});
}
function Ut({ row: n, handle: i, nested: a }) {
	let { store: o, types: s, allowed: c } = b(), l = O(), [u, d] = Y(!1), [f, p] = Y(""), m = e(o, (e) => e.blockMode && t(n).some((t) => t.id === e.selected)), h = t(n).at(-1), g = (e) => {
		let t = ve(e, s), n = P(o.get().nodes, h.id, t.map((e) => e.type), s, c);
		d(!1), p(""), n && (o.insert(n.parentId, n.index, t), r(o, t[0], l.stops()));
	};
	return /* @__PURE__ */ Z("div", {
		className: W("absolute top-[3px] z-10 flex h-[var(--line)] items-center gap-0.5 opacity-0 transition-opacity duration-100 focus-within:opacity-100", a ? "-left-[22px] group-hover/nested:opacity-100" : "-left-[54px] group-hover/row:opacity-100 group-has-[[data-nested]:hover]/row:!opacity-0", (u || m) && "!opacity-100"),
		children: [!a && /* @__PURE__ */ X(U, {
			open: u,
			onOpenChange: (e) => {
				d(e), e || p("");
			},
			align: "start",
			className: "!p-0",
			trigger: /* @__PURE__ */ X(H, {
				icon: "plus",
				label: L("Add Below"),
				size: "xs",
				className: "!text-faint hover:!text-text"
			}),
			children: /* @__PURE__ */ X(ne, {
				types: [...s.values()],
				query: f,
				onQuery: p,
				onChoose: g,
				onClose: () => d(!1),
				allowed: (e) => !!P(o.get().nodes, h.id, e.name, s, c)
			})
		}), /* @__PURE__ */ X(we, {
			align: "start",
			trigger: /* @__PURE__ */ X("button", {
				type: "button",
				ref: i.setActivatorNodeRef,
				...i.attributes,
				...i.listeners,
				"aria-label": L("Drag to move, click for options"),
				className: "grid h-6 w-[18px] cursor-grab place-items-center rounded-xs text-faint hover:bg-hover hover:text-text active:cursor-grabbing",
				children: /* @__PURE__ */ X(V, {
					name: "drag",
					size: 14
				})
			}),
			items: Gt(o, n, s, c, l)
		})]
	});
}
var Wt = [
	{
		label: () => L("Text"),
		icon: "paragraph",
		type: "paragraph",
		props: {}
	},
	{
		label: () => L("Heading 1"),
		icon: "heading",
		type: "heading",
		props: { level: "1" }
	},
	{
		label: () => L("Heading 2"),
		icon: "heading",
		type: "heading",
		props: { level: "2" }
	},
	{
		label: () => L("Heading 3"),
		icon: "heading",
		type: "heading",
		props: { level: "3" }
	},
	{
		label: () => L("Bulleted List"),
		icon: "list",
		type: "list",
		props: { ordered: !1 }
	},
	{
		label: () => L("Numbered List"),
		icon: "list-ordered",
		type: "list",
		props: { ordered: !0 }
	},
	{
		label: () => L("Quote"),
		icon: "quote",
		type: "quote",
		props: {}
	},
	{
		label: () => L("Callout"),
		icon: "info",
		type: "callout",
		props: { tone: "note" }
	}
];
function Gt(e, n, r, i, a) {
	let o = t(n), s = o[0], c = n.kind === "text" || n.kind === "list", l = () => s.type === "list" ? (s.props.items ?? []).join("<br>") : String(s.props.text ?? ""), u = (e) => e.type === s.type && Object.entries(e.props).every(([e, t]) => String(s.props[e] ?? (e !== "ordered" && "")) === String(t)), d = (t) => () => {
		let n = t.type === "list" ? {
			...t.props,
			items: l().split(/<br\s*\/?>/)
		} : {
			...t.props,
			text: l(),
			...t.type === "quote" ? { cite: "" } : {}
		};
		e.updateNode(s.id, {
			type: t.type,
			props: n
		}), e.focus(s.id, "end", t.type === "list" ? "items" : "text", t.type === "list" ? 0 : void 0);
	}, f = o.length === 1, p = n.parent ? j(e.get().nodes, n.parent) : null;
	return [
		...c ? [
			{
				label: L("Turn Into"),
				heading: !0
			},
			...Wt.filter((e) => r.has(e.type) && F(p, e.type, r, p ? [] : i)).map((e) => ({
				label: e.label(),
				icon: e.icon,
				checked: u(e),
				onSelect: d(e)
			})),
			{
				separator: !0,
				label: ""
			}
		] : [],
		f && {
			label: L("Settings"),
			icon: "settings",
			onSelect: () => a.settings(s.id)
		},
		{
			label: L("Duplicate"),
			icon: "copy",
			shortcut: "mod+d",
			onSelect: () => Kt(e, o.map((e) => e.id))
		},
		{
			separator: !0,
			label: ""
		},
		{
			label: L("Delete"),
			icon: "trash",
			danger: !0,
			shortcut: "⌫",
			onSelect: () => e.commit(o.reduce((e, t) => N(e, t.id), e.get().nodes))
		}
	];
}
function Kt(e, t) {
	let n = e.get().nodes, r = t.map((e) => j(n, e)).filter((e) => !!e).map(ye), i = M(n, t.at(-1));
	i && r.length !== 0 && (e.insert(i.parentId, i.index + 1, r), e.select(r[0].id, !0), r.length > 1 && e.extendTo(r.at(-1).id));
}
function qt({ row: e }) {
	let n = t(e).map((e) => A(e, 60)).filter(Boolean).join(" · ");
	return /* @__PURE__ */ X("div", {
		className: "cms-pop max-w-[360px] truncate px-3 py-1.5 text-sm text-muted",
		children: n || L("Block")
	});
}
function Jt() {
	let { store: e, types: t, allowed: n } = b(), i = O(), a = ue(), [s, c] = Y(null);
	if (R("patterns/list", {}, {
		staleTime: 6e4,
		enabled: n.length === 0 || n.includes("pattern")
	}), K(() => {
		if (!a) return c(null);
		let e = requestAnimationFrame(() => {
			let e = document.querySelector(`[data-row="${a.id}"] [contenteditable]`);
			c(o() ?? e?.getBoundingClientRect() ?? null);
		});
		return () => cancelAnimationFrame(e);
	}, [a]), K(() => {
		if (!a) return;
		let e = () => !document.activeElement?.closest(`[data-row="${a.id}"]`) && E(null);
		return document.addEventListener("focusin", e), () => document.removeEventListener("focusin", e);
	}, [a]), pe(!!a, [document]), !a || !s) return null;
	let l = (o) => {
		let s = ve(o, t), c = e.get().nodes, l = M(c, a.id);
		if (E(null), !l) return;
		let u = l.parentId ? j(c, l.parentId) : null;
		if (s.every((e) => F(u, e.type, t, u ? [] : n))) e.commit(xe(N(c, a.id), l.parentId, l.index, s));
		else {
			let r = P(c, a.id, s.map((e) => e.type), t, n);
			if (!r) return;
			e.commit(xe(N(c, a.id), r.parentId, r.index, s));
		}
		r(e, s[0], i.stops());
	}, { maxHeight: u, ...d } = x(s);
	return Me(/* @__PURE__ */ X("div", {
		"data-cms-slash": !0,
		className: "cms-pop fixed z-[60] overflow-hidden !p-0",
		style: d,
		children: /* @__PURE__ */ X(ne, {
			types: [...t.values()],
			query: a.query,
			chooseFirst: a.enter,
			patterns: n.length === 0 || n.includes("pattern"),
			onNoMatch: () => {
				let e = document.querySelector(`[data-row="${a.id}"] [contenteditable]`);
				E(null), e?.dispatchEvent(new KeyboardEvent("keydown", {
					key: "Enter",
					bubbles: !0,
					cancelable: !0
				}));
			},
			showSearch: !1,
			compact: !0,
			style: { maxHeight: u },
			onChoose: l,
			onClose: () => E(null),
			allowed: (r) => !!P(e.get().nodes, a.id, r.name, t, n)
		})
	}), document.body);
}
function Yt(e, r, i, a) {
	K(() => {
		let o = (o) => {
			if (o.defaultPrevented) return;
			let s = r.current?.contains(document.activeElement) || r.current?.contains(o.target), { selected: c, blockMode: l, nodes: u } = e.get(), d = o.metaKey || o.ctrlKey, f = document.activeElement === document.body || !document.activeElement;
			if (d && o.key.toLowerCase() === "z" && (s || l || f)) {
				o.preventDefault();
				let t = s && document.activeElement?.isContentEditable;
				document.activeElement?.blur(), o.shiftKey ? e.redo() : e.undo();
				let r = t && c ? i.stops().find((e) => e.id === c) : null;
				r && n(e, r, "end");
				return;
			}
			if (!l || !c || i.readOnly || o.target?.closest?.("input,textarea,[contenteditable=\"true\"],[role=\"dialog\"],[data-cms-settings]")) return;
			let p = [...a.current.values()], m = p.findIndex((e) => t(e).some((e) => e.id === c)), h = p[m], g = (n) => {
				if (!n) return;
				let r = t(n).map((e) => e.id);
				e.select(r[0], !0), r.length > 1 && e.extendTo(r.at(-1)), document.querySelector(`[data-row="${r[0]}"]`)?.scrollIntoView({ block: "nearest" });
			};
			if (o.key === "ArrowDown" || o.key === "ArrowUp") {
				o.preventDefault();
				let t = o.key === "ArrowUp";
				if (o.altKey) return e.nudge(c, t ? -1 : 1);
				if (o.shiftKey) return e.extend(t ? -1 : 1);
				g(p[m + (t ? -1 : 1)]);
			} else if (o.key === "Enter") {
				o.preventDefault();
				let r = i.stops().find((e) => e.id === c), a = h ? t(h)[0] : null;
				r ? n(e, r, "end") : a && i.settings(a.id);
			} else if (o.key === "Backspace" || o.key === "Delete") {
				o.preventDefault();
				let n = p[m - 1] ?? p.slice(m + 1).find((n) => !t(n).some((t) => e.selection().includes(t.id)));
				e.removeSelection(), g(n);
			} else if (d && o.key.toLowerCase() === "d") o.preventDefault(), Kt(e, e.selection());
			else if (d && (o.key.toLowerCase() === "c" || o.key.toLowerCase() === "x")) {
				let t = e.selection().map((e) => j(u, e)).filter(Boolean);
				if (t.length === 0) return;
				o.preventDefault(), navigator.clipboard.writeText("cms-blocks:" + JSON.stringify(t)), o.key.toLowerCase() === "x" && e.removeSelection();
			} else d && o.key.toLowerCase() === "v" ? (o.preventDefault(), navigator.clipboard.readText().then((t) => {
				if (!t.startsWith("cms-blocks:")) return;
				let n = JSON.parse(t.slice(12)).map(ye);
				e.insertAfter(e.selection().at(-1) ?? c, n), e.select(n[0].id, !0);
			})) : o.key === "Escape" && e.select(null);
		};
		return window.addEventListener("keydown", o), () => window.removeEventListener("keydown", o);
	}, [
		e,
		r,
		i,
		a
	]);
}
pt(), I.fields.set("blocks", Ge), I.fields.set("color", We), ut(), I.fields.set("blocks-icon", _t), I.panels.set("blocks-editor", {
	slot: "entry.editor",
	label: L("Block Editor"),
	icon: "layout",
	component: ke(() => import("./chunks/BlocksWorkspace-BSJB2Ezt.js").then((e) => ({ default: e.BlocksWorkspace }))),
	when: (e) => e.bodyField.type === "blocks"
}), I.widgets.set("blocks-design", ke(() => import("./chunks/WidgetDesign-ejI_VtLz.js")));
export { y as EditorProvider, m as EditorStore, k as Inspector, Lt as WriteEditor, Nt as blockViews, c as useCatalog, s as useDesign, e as useEditor, b as useEditorContext };
