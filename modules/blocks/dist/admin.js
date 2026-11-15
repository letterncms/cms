import { d as e, l as t, p as n, t as r } from "./chunks/Inserter-CfdoRD1B.js";
import { _ as i, a, c as o, d as s, f as c, h as l, i as u, l as d, n as f, o as p, s as m, t as h, u as g } from "./chunks/insert-DZPaXAR2.js";
import { $ as _, A as v, At as y, B as ee, Bt as b, C as x, Ct as S, D as C, Dt as te, E as w, Et as ne, F as re, Ft as ie, G as ae, Gt as oe, H as se, Ht as ce, I as le, It as ue, J as de, Jt as fe, K as pe, Kt as me, L as he, Lt as ge, M as _e, Mt as ve, N as ye, Nt as be, O as xe, Ot as Se, P as Ce, Pt as we, Q as Te, R as Ee, Rt as De, S as Oe, St as ke, T as Ae, Tt as je, U as Me, Ut as Ne, V as Pe, Vt as Fe, W as Ie, Wt as Le, X as Re, Xt as T, Y as E, Yt as ze, Z as Be, _ as Ve, a as He, at as Ue, b as We, bt as D, c as Ge, ct as Ke, d as qe, dt as Je, et as Ye, f as Xe, ft as Ze, g as Qe, gt as O, h as $e, ht as et, i as tt, it as nt, j as rt, jt as it, k as at, kt as ot, l as st, lt as k, m as ct, mt as A, n as lt, nt as ut, o as dt, ot as ft, p as pt, pt as mt, q as ht, qt as gt, r as _t, rt as j, s as vt, st as yt, t as bt, tt as xt, u as St, ut as M, v as Ct, vt as wt, w as Tt, wt as Et, x as Dt, xt as Ot, y as kt, yt as At, z as jt, zt as Mt } from "./chunks/Inspector-BBkxM3ZJ.js";
import { navigate as Nt, registry as N, t as P, useAbility as F } from "@letterncms/sdk";
import { createContext as Pt, lazy as Ft, useContext as It, useEffect as I, useLayoutEffect as Lt, useMemo as Rt, useRef as L, useState as R } from "react";
import { Button as z, Fields as B, Icon as V, IconButton as H, InspectorPanel as zt, Menu as Bt, Popover as U, Pressable as W, QueryError as Vt, Segmented as Ht, Spinner as Ut, cn as G, fieldControlId as Wt } from "@letterncms/ui";
import { Fragment as Gt, jsx as K, jsxs as q } from "react/jsx-runtime";
import { createPortal as Kt } from "react-dom";
import { DndContext as qt, DragOverlay as Jt, PointerSensor as Yt, closestCenter as Xt, pointerWithin as Zt, useDraggable as Qt, useDroppable as $t, useSensor as en, useSensors as tn } from "@dnd-kit/core";
// admin/src/BlocksField.tsx
function nn({ field: n, value: r, onChange: i, context: a, disabled: s }) {
	let { catalog: c, types: l, isLoading: u, error: d, retry: f } = e(), p = gt(r, i, !!s), [m, h] = R(null), g = T(p, (e) => e.nodes), v = L(a);
	if (v.current = a, u) return /* @__PURE__ */ K("div", {
		className: "flex h-24 items-center justify-center text-faint",
		children: /* @__PURE__ */ K(Ut, {})
	});
	if (!c) return /* @__PURE__ */ K(Vt, {
		message: d?.message,
		onRetry: f
	});
	let y = {
		store: p,
		types: l,
		catalog: c,
		entryId: a.entry?.id ?? null,
		fieldHandle: n.handle,
		allowed: n.allowed ?? [],
		getValues: () => v.current.values ?? {},
		title: a.title ?? a.entry?.title ?? "",
		readOnly: !!s
	};
	return /* @__PURE__ */ q(t, {
		value: y,
		children: [/* @__PURE__ */ K("div", {
			className: "h-[480px] min-w-0 overflow-hidden rounded-sm border border-border",
			children: /* @__PURE__ */ K(_, {
				collection: a.collection,
				blueprint: a.blueprint,
				entryId: a.entry?.id,
				content: {
					title: a.title ?? a.entry?.title ?? "",
					slug: a.entry?.slug ?? "",
					authorId: a.entry?.authorId ?? null,
					data: {
						...a.values ?? a.entry?.data ?? {},
						[n.handle]: r ?? []
					}
				},
				onInspect: h,
				standalone: !0
			})
		}), /* @__PURE__ */ q(zt, {
			docked: !1,
			open: !!m,
			onOpenChange: (e) => !e && h(null),
			title: P("Block Settings"),
			children: [/* @__PURE__ */ K("div", {
				className: "flex h-10 shrink-0 items-center justify-end border-b border-border px-2",
				children: /* @__PURE__ */ K(H, {
					icon: "close",
					label: P("Close Panel"),
					size: "xs",
					onClick: () => h(null)
				})
			}), m && o(g, m) && /* @__PURE__ */ K(bt, {
				node: o(g, m),
				onClose: () => h(null)
			})]
		})]
	});
}
// admin/src/builder/content/BindField.tsx
function rn({ field: e, value: t, onChange: n, disabled: r }) {
	let [i, a] = R(!1), [o, s] = R(null), c = t ?? void 0, l = e.paths ?? [], u = [...new Set(l.map((e) => e.group))], d = l.find((e) => e.path === c)?.label;
	return /* @__PURE__ */ q(w, { children: [/* @__PURE__ */ q("div", {
		className: "relative flex min-w-0 flex-1 items-center",
		children: [/* @__PURE__ */ K(V, {
			name: "database",
			size: 13,
			className: "pointer-events-none absolute left-2 text-ink"
		}), /* @__PURE__ */ K("input", {
			id: Wt(e),
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
			className: G(Te, "!pl-7 font-mono text-ink placeholder:font-sans")
		})]
	}), /* @__PURE__ */ q(U, {
		open: i,
		onOpenChange: a,
		align: "end",
		className: "w-64 !p-1",
		trigger: /* @__PURE__ */ K(H, {
			icon: "chevron-down",
			size: "xs",
			label: P("Choose Data")
		}),
		children: [/* @__PURE__ */ K("div", {
			className: "max-h-80 overflow-y-auto",
			children: u.map((e) => /* @__PURE__ */ q("div", {
				className: "py-1",
				children: [/* @__PURE__ */ K("p", {
					className: "cms-label m-0 px-2 pb-1",
					children: e
				}), l.filter((t) => t.group === e).map((e) => /* @__PURE__ */ q(z, {
					variant: "ghost",
					"data-active": c === e.path || void 0,
					onClick: () => {
						n(e.path), a(!1);
					},
					className: "w-full !justify-start !gap-2 !rounded-xs !px-2 text-left !text-xs !font-normal",
					children: [
						/* @__PURE__ */ K("span", {
							className: "min-w-0 flex-1 truncate",
							children: e.label
						}),
						/* @__PURE__ */ K("span", {
							className: "max-w-[50%] shrink-0 truncate font-mono text-2xs text-faint",
							children: e.path
						}),
						c === e.path && /* @__PURE__ */ K(V, {
							name: "check",
							size: 11,
							className: "shrink-0"
						})
					]
				}, e.path))]
			}, e))
		}), /* @__PURE__ */ q("p", {
			className: "m-0 border-t border-border px-2 py-1.5 font-mono text-2xs leading-relaxed text-faint",
			title: P("Filters, and text mixed with data"),
			children: ["|date:M j, Y · |excerpt:120 · |upper · |default:Text · By ", "{entry.author}"]
		})]
	})] });
}
// admin/src/builder/fields/nodes.tsx
function an({ field: e, ...t }) {
	let { store: r, types: a } = n(), o = T(r, (e) => e.nodes), s = d(o).filter(({ node: t }) => t.id !== e.exclude).map(({ node: e, depth: t }) => ({
		value: e.id,
		label: `${"  ".repeat(t)}${e.label || i(e, 28) || a.get(e.type)?.title || e.type}`
	}));
	return /* @__PURE__ */ K(C, {
		...t,
		field: {
			...e,
			type: "select",
			component: void 0,
			size: "sm",
			options: s,
			placeholder: e.placeholder ?? P("Choose an Element")
		}
	});
}
function on({ field: e, value: t, onChange: n, disabled: r, context: i }) {
	let a = t ?? [], o = {
		handle: e.handle,
		type: "select",
		label: e.label,
		exclude: e.exclude
	};
	return /* @__PURE__ */ q("div", {
		className: "min-w-0 flex-1 space-y-1",
		children: [a.map((t, s) => /* @__PURE__ */ q("div", {
			className: "flex items-center gap-1",
			children: [/* @__PURE__ */ K(an, {
				field: {
					...o,
					handle: `${e.handle}-${s}`
				},
				value: t,
				onChange: (e) => n(e ? a.map((t, n) => n === s ? e : t) : a.filter((e, t) => t !== s)),
				disabled: r,
				context: i
			}), /* @__PURE__ */ K(E, { onClick: () => n(a.filter((e, t) => t !== s)) })]
		}, s)), /* @__PURE__ */ q(W, {
			compact: !0,
			onClick: () => n([...a, e.addValue]),
			className: "text-xs text-muted hover:text-text",
			children: ["+ ", e.add ?? P("Element")]
		})]
	});
}
// admin/src/builder/fields/clip.tsx
var sn = [
	{
		id: "triangle",
		label: () => P("Triangle"),
		value: "polygon(50% 0%, 100% 100%, 0% 100%)"
	},
	{
		id: "rhombus",
		label: () => P("Rhombus"),
		value: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)"
	},
	{
		id: "pentagon",
		label: () => P("Pentagon"),
		value: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)"
	},
	{
		id: "hexagon",
		label: () => P("Hexagon"),
		value: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)"
	},
	{
		id: "arrow",
		label: () => P("Arrow"),
		value: "polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%)"
	},
	{
		id: "chevron",
		label: () => P("Chevron"),
		value: "polygon(75% 0%, 100% 50%, 75% 100%, 0% 100%, 25% 50%, 0% 0%)"
	},
	{
		id: "star",
		label: () => P("Star"),
		value: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"
	},
	{
		id: "message",
		label: () => P("Message||shape"),
		value: "polygon(0% 0%, 100% 0%, 100% 75%, 75% 75%, 75% 100%, 50% 75%, 0% 75%)"
	},
	{
		id: "slant",
		label: () => P("Slanted Edge"),
		value: "polygon(0 0, 100% 0, 100% 85%, 0 100%)"
	},
	{
		id: "wedge",
		label: () => P("Wedge"),
		value: "polygon(0 0, 100% 0, 100% 100%, 0 85%)"
	}
], cn = (e) => e.replace(/\s+/g, " ").replace(/\b0%/g, "0").trim();
function ln(e) {
	if (!e || e === "none") return "none";
	let t = e.match(/^(inset|circle|ellipse|polygon)\(/);
	return t ? t[1] : "custom";
}
var un = (e, t) => e?.match(RegExp(`^${t}\\((.*)\\)$`))?.[1] ?? "";
function dn(e) {
	let [t, n] = un(e, "inset").split(/\s+round\s+/), r = Dt(t || "0") ?? [
		"0",
		"0",
		"0",
		"0"
	];
	return {
		top: r[0],
		right: r[1],
		bottom: r[2],
		left: r[3],
		round: n ?? ""
	};
}
function fn(e, t) {
	let [n, r] = un(e, t).split(/\s+at\s+/), i = x(n || ""), a = x(r || "50% 50%");
	return {
		rx: i[0] ?? "50%",
		ry: i[1] ?? i[0] ?? "50%",
		x: a[0] ?? "50%",
		y: a[1] ?? "50%"
	};
}
function pn({ field: e, value: t, onChange: n, context: r, disabled: i }) {
	let a = t ?? void 0, [o, s] = R(!1), c = o && a ? "custom" : ln(a), l = (t, n, r = {}) => ({
		handle: `${e.handle}-${t}`,
		type: "text",
		component: "blocks-value",
		label: n,
		...r
	}), u = (e) => {
		if (s(e === "custom"), e === "custom") return a ? void 0 : n("inset(0)");
		if (!e || e === "none") return n(null);
		if (e === "inset") return n("inset(0 round 12px)");
		if (e === "circle") return n("circle(50% at 50% 50%)");
		if (e === "ellipse") return n("ellipse(50% 40% at 50% 50%)");
		n(sn[0].value);
	}, d = dn(a), f = (e) => {
		let t = {
			...d,
			...e
		}, r = [
			t.top,
			t.right,
			t.bottom,
			t.left
		].map((e) => e || "0");
		n(`inset(${r.every((e) => e === r[0]) ? r[0] : r.join(" ")}${t.round ? ` round ${t.round}` : ""})`);
	}, p = c === "circle" || c === "ellipse" ? fn(a, c) : null, m = (e) => {
		let t = {
			...p,
			...e
		};
		n(c === "circle" ? `circle(${t.rx} at ${t.x} ${t.y})` : `ellipse(${t.rx} ${t.ry} at ${t.x} ${t.y})`);
	}, h = c === "polygon" ? sn.find((e) => cn(e.value) === cn(a)) : void 0;
	return /* @__PURE__ */ q("div", {
		className: "min-w-0 flex-1 space-y-1",
		children: [
			/* @__PURE__ */ K(C, {
				field: {
					handle: `${e.handle}-kind`,
					type: "select",
					size: "sm",
					label: e.label,
					placeholder: P("None"),
					options: [
						{
							value: "inset",
							label: P("Inset")
						},
						{
							value: "circle",
							label: P("Circle")
						},
						{
							value: "ellipse",
							label: P("Ellipse")
						},
						{
							value: "polygon",
							label: P("Shape")
						},
						{
							value: "custom",
							label: P("Custom")
						}
					]
				},
				value: c === "none" ? null : c,
				onChange: (e) => u(e),
				disabled: i,
				context: r
			}),
			c === "inset" && /* @__PURE__ */ q(Gt, { children: [/* @__PURE__ */ q(w, {
				className: "grid grid-cols-2 gap-1",
				children: [
					/* @__PURE__ */ K(C, {
						field: l("top", P("Top"), {
							prefix: "T",
							placeholder: "0",
							units: ["px", "%"]
						}),
						value: d.top,
						onChange: (e) => f({ top: e ?? "0" }),
						context: r
					}),
					/* @__PURE__ */ K(C, {
						field: l("right", P("Right"), {
							prefix: "R",
							placeholder: "0",
							units: ["px", "%"]
						}),
						value: d.right,
						onChange: (e) => f({ right: e ?? "0" }),
						context: r
					}),
					/* @__PURE__ */ K(C, {
						field: l("bottom", P("Bottom"), {
							prefix: "B",
							placeholder: "0",
							units: ["px", "%"]
						}),
						value: d.bottom,
						onChange: (e) => f({ bottom: e ?? "0" }),
						context: r
					}),
					/* @__PURE__ */ K(C, {
						field: l("left", P("Left"), {
							prefix: "L",
							placeholder: "0",
							units: ["px", "%"]
						}),
						value: d.left,
						onChange: (e) => f({ left: e ?? "0" }),
						context: r
					})
				]
			}), /* @__PURE__ */ K(C, {
				field: l("round", P("Corner Radius"), {
					prefix: "◜",
					placeholder: P("Corners"),
					group: "radius"
				}),
				value: d.round || null,
				onChange: (e) => f({ round: e ?? "" }),
				context: r
			})] }),
			p && /* @__PURE__ */ q(w, {
				className: "grid grid-cols-2 gap-1",
				children: [
					/* @__PURE__ */ K(C, {
						field: l("rx", P(c === "circle" ? "Radius" : "Width Radius"), {
							prefix: c === "circle" ? "R" : "W",
							unit: "%",
							units: ["%", "px"]
						}),
						value: p.rx,
						onChange: (e) => m({ rx: e ?? "50%" }),
						context: r
					}),
					c === "ellipse" ? /* @__PURE__ */ K(C, {
						field: l("ry", P("Height Radius"), {
							prefix: "H",
							unit: "%",
							units: ["%", "px"]
						}),
						value: p.ry,
						onChange: (e) => m({ ry: e ?? "50%" }),
						context: r
					}) : /* @__PURE__ */ K("span", {}),
					/* @__PURE__ */ K(C, {
						field: l("x", P("Center X"), {
							prefix: "X",
							unit: "%",
							units: ["%", "px"]
						}),
						value: p.x,
						onChange: (e) => m({ x: e ?? "50%" }),
						context: r
					}),
					/* @__PURE__ */ K(C, {
						field: l("y", P("Center Y"), {
							prefix: "Y",
							unit: "%",
							units: ["%", "px"]
						}),
						value: p.y,
						onChange: (e) => m({ y: e ?? "50%" }),
						context: r
					})
				]
			}),
			c === "polygon" && /* @__PURE__ */ K("div", {
				className: "grid grid-cols-5 gap-1",
				children: sn.map((e) => /* @__PURE__ */ K(W, {
					compact: !0,
					title: e.label(),
					"aria-label": e.label(),
					"aria-pressed": h?.id === e.id,
					onClick: () => n(e.value),
					className: G("grid aspect-square place-items-center rounded-xs border", h?.id === e.id ? "border-focus bg-focus/8" : "border-border hover:bg-hover"),
					children: /* @__PURE__ */ K("span", {
						className: G("size-4", h?.id === e.id ? "bg-focus" : "bg-muted"),
						style: { clipPath: e.value }
					})
				}, e.id))
			}),
			(c === "custom" || c === "polygon" && !h) && /* @__PURE__ */ K(C, {
				field: l("raw", e.label, {
					unit: "",
					placeholder: "polygon(…)"
				}),
				value: a ?? null,
				onChange: (e) => n(e || null),
				context: r
			})
		]
	});
}
// admin/src/builder/fields/conditions.tsx
var mn = () => [
	{
		value: "=",
		label: P("is")
	},
	{
		value: "!=",
		label: P("is not")
	},
	{
		value: "contains",
		label: P("contains")
	},
	{
		value: ">",
		label: P("is more than")
	},
	{
		value: "<",
		label: P("is less than")
	},
	{
		value: "not null",
		label: P("is set")
	},
	{
		value: "null",
		label: P("is empty")
	}
];
function hn({ field: e, value: t, onChange: n, disabled: r, context: i }) {
	let a = Array.isArray(t) ? t : [], o = (e) => n(e.length ? e : null), s = (e, t) => o(a.map((n, r) => r === e ? {
		...n,
		...t
	} : n));
	return /* @__PURE__ */ q("div", {
		className: "min-w-0 flex-1 space-y-1",
		children: [a.map((t, n) => /* @__PURE__ */ q("div", {
			className: "flex items-center gap-1",
			children: [
				/* @__PURE__ */ K(C, {
					field: {
						handle: `${e.handle}-${n}-field`,
						type: "text",
						size: "sm",
						commit: "blur",
						label: P("Field"),
						placeholder: P("Field"),
						mono: !0,
						className: "!w-[34%] !flex-none"
					},
					value: t.field ?? null,
					onChange: (e) => s(n, { field: String(e ?? "").trim() }),
					disabled: r,
					context: i
				}),
				/* @__PURE__ */ K(C, {
					field: {
						handle: `${e.handle}-${n}-op`,
						type: "select",
						size: "sm",
						required: !0,
						label: P("Comparison"),
						options: mn(),
						className: "!flex-none w-[92px]"
					},
					value: t.op ?? "=",
					onChange: (e) => s(n, { op: String(e ?? "=") }),
					disabled: r,
					context: i
				}),
				!["null", "not null"].includes(t.op ?? "") && /* @__PURE__ */ K(C, {
					field: {
						handle: `${e.handle}-${n}-value`,
						type: "text",
						size: "sm",
						commit: "blur",
						label: P("Value"),
						placeholder: P("Value")
					},
					value: t.value === void 0 || t.value === null ? null : String(t.value),
					onChange: (e) => s(n, { value: e ?? "" }),
					disabled: r,
					context: i
				}),
				/* @__PURE__ */ K(E, {
					label: P("Remove Condition"),
					onClick: () => o(a.filter((e, t) => t !== n))
				})
			]
		}, n)), /* @__PURE__ */ q(W, {
			compact: !0,
			disabled: r,
			onClick: () => o([...a, {
				field: "",
				op: "=",
				value: ""
			}]),
			className: "-ml-2 inline-flex h-7 items-center gap-1.5 rounded-sm px-2 text-xs text-muted hover:bg-hover hover:text-ink",
			children: [/* @__PURE__ */ K(V, {
				name: "plus",
				size: 13
			}), P("Add Condition")]
		})]
	});
}
// admin/src/builder/fields/inlineText.tsx
function gn({ field: e, value: t, onChange: n, disabled: r }) {
	let i = L(null);
	return I(() => {
		i.current && i.current.innerHTML !== (t ?? "") && document.activeElement !== i.current && (i.current.innerHTML = t ?? "");
	}, [t]), /* @__PURE__ */ K("div", {
		ref: i,
		id: Wt(e),
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
		className: G(Te, "cursor-text overflow-hidden whitespace-nowrap leading-[26px] outline-none [&_*]:inline empty:before:text-ghost empty:before:content-[attr(data-placeholder)]")
	});
}
// admin/src/builder/fields/shadows.tsx
var _n = /^-?[\d.]+(px|rem|em)?$/;
function vn(e) {
	return !e || e === "none" ? [] : /^var\(--[\w-]+\)$/.test(e.trim()) ? null : Oe(e).map((e) => {
		let t = x(e), n = t.includes("inset"), r = t.filter((e) => e !== "inset"), i = r.filter((e) => _n.test(e)), a = r.find((e) => !_n.test(e)) ?? "rgb(0 0 0 / 15%)";
		return {
			inset: n,
			x: i[0] ?? "0",
			y: i[1] ?? "0",
			blur: i[2] ?? "0",
			spread: i[3] ?? "0",
			color: a
		};
	});
}
function yn(e, t = !1) {
	return e.length ? e.map((e) => t ? `${e.x} ${e.y} ${e.blur} ${e.color}` : `${e.inset ? "inset " : ""}${e.x} ${e.y} ${e.blur} ${e.spread} ${e.color}`).join(", ") : null;
}
var bn = {
	inset: !1,
	x: "0px",
	y: "8px",
	blur: "24px",
	spread: "-8px",
	color: "rgb(0 0 0 / 18%)"
}, xn = {
	inset: !1,
	x: "0px",
	y: "1px",
	blur: "2px",
	spread: "0",
	color: "rgb(0 0 0 / 25%)"
}, Sn = (e) => e.replace(/px$/, "");
function Cn({ field: e, value: t, onChange: n, context: r }) {
	let i = e.kind === "text", a = i ? void 0 : e.group ?? "shadow", o = ye(), s = Qe(), [c, l] = R(null), u = o(t), d = vn(t) ?? [], f = (e) => n(yn(e, i));
	return /* @__PURE__ */ q("div", {
		className: "min-w-0 flex-1",
		children: [
			/* @__PURE__ */ q("div", {
				className: "group/value flex h-7 items-center gap-2",
				children: [
					/* @__PURE__ */ K(Re, { field: e }),
					/* @__PURE__ */ K("span", {
						className: "min-w-0 flex-1 truncate text-xs text-faint",
						children: !u && !d.length && typeof e.placeholder == "string" ? e.placeholder : ""
					}),
					a && /* @__PURE__ */ K(v, {
						group: a,
						value: t,
						onPick: n,
						active: !!u,
						className: "size-6"
					}),
					!u && /* @__PURE__ */ K(ht, {
						label: P(i ? "Add Text Shadow" : "Add Shadow"),
						onClick: () => {
							f([...d, i ? xn : bn]), l(d.length);
						}
					})
				]
			}),
			u && /* @__PURE__ */ q("div", {
				className: "flex h-7 items-center gap-2 pl-[88px]",
				children: [
					/* @__PURE__ */ K("span", {
						className: "size-4 shrink-0 rounded-xs border border-border bg-bg",
						style: { boxShadow: s(u.token.value) }
					}),
					/* @__PURE__ */ K(rt, {
						token: u.token,
						className: "text-xs"
					}),
					/* @__PURE__ */ K("span", { className: "flex-1" }),
					/* @__PURE__ */ K(E, {
						label: P("Remove Shadow"),
						onClick: () => n(null)
					})
				]
			}),
			d.map((e, t) => /* @__PURE__ */ q("div", {
				className: "flex h-7 items-center gap-1 pl-[88px]",
				children: [/* @__PURE__ */ q(U, {
					open: c === t,
					onOpenChange: (e) => l(e ? t : null),
					align: "end",
					className: "w-64 !p-2",
					trigger: /* @__PURE__ */ q(W, {
						compact: !0,
						className: G("flex h-7 min-w-0 flex-1 items-center gap-1.5 rounded-sm px-1.5 text-left text-xs hover:bg-hover", c === t && "bg-active"),
						children: [
							i ? /* @__PURE__ */ K("span", {
								className: "grid size-4 shrink-0 place-items-center text-2xs font-semibold text-text",
								style: { textShadow: s(yn([e], !0) ?? "") },
								children: "A"
							}) : /* @__PURE__ */ K("span", {
								className: "size-4 shrink-0 rounded-xs border border-border bg-bg",
								style: { boxShadow: s(yn([{
									...e,
									x: J(e.x),
									y: J(e.y),
									blur: J(e.blur),
									spread: J(e.spread)
								}]) ?? "") }
							}),
							/* @__PURE__ */ K("span", {
								className: "min-w-0 flex-1 truncate font-mono tabular-nums text-muted",
								children: [
									e.x,
									e.y,
									e.blur,
									...i ? [] : [e.spread]
								].map(Sn).join(" ")
							}),
							e.inset && /* @__PURE__ */ K("span", {
								className: "rounded-xs bg-sunken px-1 text-2xs text-muted",
								children: P("Inside")
							})
						]
					}),
					children: [/* @__PURE__ */ K("p", {
						className: "m-0 mb-2 text-xs font-semibold text-ink",
						children: P(i ? "Text Shadow" : "Shadow")
					}), /* @__PURE__ */ K(de, {
						context: r,
						fields: [
							!i && {
								handle: "inset",
								type: "select",
								display: "segmented",
								block: !0,
								size: "sm",
								required: !0,
								label: P("Type"),
								options: [{
									value: "outside",
									label: P("Outside")
								}, {
									value: "inside",
									label: P("Inside")
								}]
							},
							{
								handle: "x",
								type: "text",
								component: "blocks-value",
								label: P("X Offset"),
								prefix: "X",
								placeholder: "0"
							},
							{
								handle: "y",
								type: "text",
								component: "blocks-value",
								label: P("Y Offset"),
								prefix: "Y",
								placeholder: "0"
							},
							{
								handle: "blur",
								type: "text",
								component: "blocks-value",
								label: P("Blur"),
								min: 0,
								prefixIcon: "shadow",
								placeholder: "0"
							},
							!i && {
								handle: "spread",
								type: "text",
								component: "blocks-value",
								label: P("Spread"),
								prefixIcon: "arrows-out-simple",
								placeholder: "0"
							},
							{
								handle: "color",
								type: "color",
								component: "blocks-color",
								label: P("Color")
							}
						].filter(Boolean),
						values: {
							...e,
							inset: e.inset ? "inside" : "outside"
						},
						onChange: (e, n) => f(d.map((r, i) => i === t ? {
							...r,
							[e]: e === "inset" ? n === "inside" : n ?? (e === "color" ? "transparent" : "0")
						} : r))
					})]
				}), /* @__PURE__ */ K(E, {
					label: P("Remove Shadow"),
					onClick: () => f(d.filter((e, n) => n !== t))
				})]
			}, t))
		]
	});
}
function J(e) {
	let t = parseFloat(e);
	return Number.isNaN(t) ? e : `${Math.max(-4, Math.min(4, t / 4))}px`;
}
// admin/src/builder/fields/spacing.tsx
var wn = /^(-?\d*\.?\d+)([a-z%]*)$/i;
function Tn(e, t) {
	return t.shiftKey ? [
		0,
		1,
		2,
		3
	] : t.altKey ? [e, (e + 2) % 4] : [e];
}
function Y(e, t) {
	if (t.length === 4) return P(e === "margin" ? "Margin, All Sides" : "Padding, All Sides");
	if (t.length === 2) return t.includes(0) ? P(e === "margin" ? "Margin, Top and Bottom" : "Padding, Top and Bottom") : P(e === "margin" ? "Margin, Left and Right" : "Padding, Left and Right");
	let n = {
		0: P("top"),
		1: P("right"),
		2: P("bottom"),
		3: P("left")
	}[t[0]];
	return P(e === "margin" ? "Margin {side}" : "Padding {side}", { side: n });
}
function En({ field: e, value: t, onChange: n, context: r }) {
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
	}), c = (e, t) => /* @__PURE__ */ K(Dn, {
		box: e,
		index: t,
		value: o(e)[t],
		status: a[e]?.[t] ?? "none",
		onChange: (t, n) => s(e, t, n),
		context: r
	}, `${e}${t}`);
	return /* @__PURE__ */ K("div", {
		className: "min-w-0 flex-1 select-none",
		children: /* @__PURE__ */ q("div", {
			className: "relative grid grid-cols-[44px_1fr_44px] grid-rows-[24px_auto_24px] rounded-md bg-active/60",
			children: [
				/* @__PURE__ */ K("span", {
					className: "pointer-events-none absolute left-2 top-1 text-2xs text-faint",
					children: P("Margin")
				}),
				/* @__PURE__ */ K("span", {}),
				c("margin", 0),
				/* @__PURE__ */ K("span", {}),
				c("margin", 3),
				/* @__PURE__ */ q("div", {
					className: "relative grid grid-cols-[44px_1fr_44px] grid-rows-[24px_20px_24px] rounded-sm bg-bg ring-1 ring-border",
					children: [
						/* @__PURE__ */ K("span", {
							className: "pointer-events-none absolute left-2 top-1 text-2xs text-faint",
							children: P("Padding")
						}),
						/* @__PURE__ */ K("span", {}),
						c("padding", 0),
						/* @__PURE__ */ K("span", {}),
						c("padding", 3),
						/* @__PURE__ */ K("span", { className: "my-1 rounded-xs bg-active" }),
						c("padding", 1),
						/* @__PURE__ */ K("span", {}),
						c("padding", 2),
						/* @__PURE__ */ K("span", {})
					]
				}),
				c("margin", 1),
				/* @__PURE__ */ K("span", {}),
				c("margin", 2),
				/* @__PURE__ */ K("span", {})
			]
		})
	});
}
function Dn({ box: e, index: t, value: n, status: r, onChange: i, context: a }) {
	let o = ye(), [s, c] = R(!1), [l, u] = R([t]), [d, f] = R(!1), p = o(n), m = n?.match(wn), h = p ? p.token.name : m ? m[2] === "px" || !m[2] ? m[1] : `${m[1]}${m[2]}` : n ?? "0";
	return /* @__PURE__ */ K(U, {
		open: s,
		onOpenChange: c,
		align: "center",
		className: "w-60 !p-2",
		trigger: /* @__PURE__ */ K(W, {
			compact: !0,
			onPointerDown: (r) => {
				if (r.button !== 0) return;
				r.preventDefault();
				let a = {
					x: r.clientX,
					y: r.clientY
				}, o = m ? parseFloat(m[1]) : 0, s = m?.[2] || "px", c = !n || !!m, l = !1, u = (n) => {
					let r = n.clientX - a.x - (n.clientY - a.y);
					if (!l && Math.abs(r) < 3 || !c) return;
					l || f(!0), l = !0, document.body.style.cursor = t % 2 ? "ew-resize" : "ns-resize";
					let u = Math.round(o + Math.round(r / 2));
					i(Tn(t, n), `${e === "padding" ? Math.max(0, u) : u}${s}`);
				}, d = () => {
					if (window.removeEventListener("pointermove", u), window.removeEventListener("pointerup", d), document.body.style.cursor = "", f(!1), !l) return;
					let e = (e) => {
						e.stopPropagation(), e.preventDefault();
					};
					window.addEventListener("click", e, {
						capture: !0,
						once: !0
					}), setTimeout(() => window.removeEventListener("click", e, { capture: !0 }), 0);
				};
				window.addEventListener("pointermove", u), window.addEventListener("pointerup", d);
			},
			onClick: (e) => u(Tn(t, e)),
			"aria-label": Y(e, [t]),
			title: `${Y(e, [t])}${p ? ` · ${p.token.variable}` : ""}\n${P("Drag to change. Alt: opposite side too, Shift: all sides.")}`,
			className: G("mx-auto flex h-full min-w-0 max-w-full items-center justify-center rounded-xs px-1 text-xs tabular-nums outline-none transition-colors focus-visible:ring-2 focus-visible:ring-focus", t % 2 ? "cursor-ew-resize" : "cursor-ns-resize", r === "own" ? "font-medium text-ink" : r === "inherited" ? "text-text" : "text-faint", s || d ? "bg-active" : "hover:bg-hover"),
			children: /* @__PURE__ */ K("span", {
				className: G("truncate", p && "rounded-xs px-1 leading-4", p && "bg-active"),
				children: h
			})
		}),
		children: /* @__PURE__ */ K(On, {
			box: e,
			sides: l,
			value: n,
			onChange: (e) => i(l, e),
			close: () => c(!1),
			context: a
		})
	});
}
function On({ box: e, sides: t, value: n, onChange: r, close: i, context: a }) {
	let o = L(null);
	I(() => {
		(o.current?.querySelector("input"))?.focus();
	}, []);
	let s = (e) => {
		r(e), i();
	};
	return /* @__PURE__ */ q("div", {
		ref: o,
		onKeyDown: (e) => {
			e.key === "Enter" && requestAnimationFrame(i);
		},
		children: [
			/* @__PURE__ */ q("p", {
				className: "m-0 mb-1.5 flex items-center justify-between text-xs font-semibold text-ink",
				children: [Y(e, t), n !== void 0 && /* @__PURE__ */ K(W, {
					compact: !0,
					onClick: () => s(null),
					className: "rounded-xs px-1 text-2xs font-normal text-muted hover:bg-hover hover:text-text",
					children: P("Reset")
				})]
			}),
			/* @__PURE__ */ K(C, {
				field: {
					handle: `${e}-${t.join("")}`,
					type: "text",
					component: "blocks-value",
					label: Y(e, t),
					placeholder: "0",
					keywords: e === "margin" ? ["auto"] : [],
					min: e === "padding" ? 0 : void 0
				},
				value: n ?? null,
				onChange: (e) => r(e),
				context: a
			}),
			/* @__PURE__ */ K("div", {
				className: "mt-2",
				children: /* @__PURE__ */ K(at, {
					value: n,
					onPick: s,
					auto: e === "margin"
				})
			})
		]
	});
}
// admin/src/builder/fields/index.ts
function kn() {
	let e = {
		"blocks-value": xe,
		"blocks-color": ct,
		"blocks-bind": rn,
		"blocks-node": an,
		"blocks-nodes": on,
		"blocks-group": Tt,
		"blocks-pairs": Ae,
		"blocks-shadows": Cn,
		"blocks-gradient": Xe,
		"blocks-align": qe,
		"blocks-origin": pt,
		"blocks-spacing": En,
		"blocks-filters": Ct,
		"blocks-clip": pn,
		"blocks-conditions": hn,
		"blocks-inline-text": gn
	};
	for (let [t, n] of Object.entries(e)) N.fields.set(t, n);
}
// admin/src/builder/icons.ts
var X = "<rect x=\"44\" y=\"44\" width=\"168\" height=\"168\" rx=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"14\" stroke-dasharray=\"18 18\" opacity=\".4\"/>", An = {
	"b-side-all": "<rect x=\"44\" y=\"44\" width=\"168\" height=\"168\" rx=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"18\"/>",
	"b-side-top": X + "<path d=\"M44 44h168\" stroke=\"currentColor\" stroke-width=\"22\" stroke-linecap=\"round\"/>",
	"b-side-right": X + "<path d=\"M212 44v168\" stroke=\"currentColor\" stroke-width=\"22\" stroke-linecap=\"round\"/>",
	"b-side-bottom": X + "<path d=\"M44 212h168\" stroke=\"currentColor\" stroke-width=\"22\" stroke-linecap=\"round\"/>",
	"b-side-left": X + "<path d=\"M44 44v168\" stroke=\"currentColor\" stroke-width=\"22\" stroke-linecap=\"round\"/>"
};
function jn() {
	for (let [e, t] of Object.entries(An)) N.icons.get(e) || N.icons.set(e, t);
}
// admin/src/builder/content/IconField.tsx
var Mn = [
	"regular",
	"bold",
	"fill",
	"light"
], Nn = (e) => ({
	regular: P("Regular"),
	bold: P("Bold"),
	fill: P("Fill||weight"),
	light: P("Light||weight")
})[e], Pn = (e) => {
	let t = e.match(/^(.*)-(bold|fill|light)$/);
	return t ? {
		base: t[1],
		weight: t[2]
	} : {
		base: e,
		weight: "regular"
	};
};
function Fn({ field: e, value: t, onChange: n, disabled: r }) {
	let [i, a] = R(!1), [o, s] = R(""), [c, l] = R(""), u = (t ?? "").replace(/^ph:/, ""), { base: d, weight: f } = Pn(u), p = F("blocks/icons", {
		query: d,
		limit: 1
	}, {
		enabled: !!d,
		staleTime: Infinity
	}), m = F("blocks/icons", {
		query: c,
		limit: 160
	}, {
		enabled: i,
		staleTime: Infinity
	}), h = p.data?.find((e) => e.name === d) ?? p.data?.[0];
	I(() => {
		let e = window.setTimeout(() => l(o.trim()), 140);
		return () => window.clearTimeout(e);
	}, [o]);
	let g = (e, t = f) => n(t === "regular" ? e : `${e}-${t}`);
	return /* @__PURE__ */ q("div", {
		className: "group/icon relative min-w-0 flex-1",
		children: [/* @__PURE__ */ q(U, {
			open: i,
			onOpenChange: (e) => !r && a(e),
			className: "w-[284px] !p-0",
			trigger: /* @__PURE__ */ q(W, {
				id: Wt(e),
				disabled: r,
				"aria-label": e.label,
				className: G("cms-input flex h-7 w-full min-w-0 items-center gap-2 rounded-sm px-2 text-left text-sm disabled:opacity-50", u && "pr-6"),
				children: [
					u && h ? /* @__PURE__ */ K("span", {
						className: "grid size-3.5 shrink-0 place-items-center text-text [&_svg]:size-3.5",
						dangerouslySetInnerHTML: { __html: h.svg }
					}) : /* @__PURE__ */ K(V, {
						name: "star",
						size: 14,
						className: "shrink-0 text-faint"
					}),
					/* @__PURE__ */ K("span", {
						className: G("min-w-0 flex-1 truncate", !u && "text-ghost"),
						children: u ? d : e.placeholder || P("Choose an Icon")
					}),
					u && f !== "regular" && /* @__PURE__ */ K("span", {
						className: "shrink-0 text-faint",
						children: Nn(f)
					})
				]
			}),
			children: [
				/* @__PURE__ */ q("div", {
					className: "flex h-10 items-center gap-2 border-b border-border px-3",
					children: [
						/* @__PURE__ */ K(V, {
							name: "search",
							size: 14,
							className: "shrink-0 text-faint"
						}),
						/* @__PURE__ */ K("input", {
							autoFocus: !0,
							value: o,
							onChange: (e) => s(e.target.value),
							placeholder: P("Search Icons"),
							"aria-label": P("Search Icons"),
							spellCheck: !1,
							className: "h-full min-w-0 flex-1 bg-transparent text-sm text-text outline-none placeholder:text-faint"
						}),
						m.isFetching && /* @__PURE__ */ K(Ut, { size: 12 })
					]
				}),
				/* @__PURE__ */ K("div", {
					className: "border-b border-border p-1.5",
					children: /* @__PURE__ */ K(Ht, {
						size: "xs",
						block: !0,
						value: f,
						onChange: (e) => u ? g(d, e) : void 0,
						options: Mn.map((e) => ({
							value: e,
							label: Nn(e)
						}))
					})
				}),
				/* @__PURE__ */ q("div", {
					className: "grid max-h-64 grid-cols-8 gap-0.5 overflow-y-auto p-1.5",
					role: "listbox",
					"aria-label": P("Icons"),
					children: [(m.data ?? []).map((e) => /* @__PURE__ */ K(W, {
						role: "option",
						"aria-selected": e.name === d,
						title: e.name,
						onClick: () => {
							g(e.name), a(!1);
						},
						className: G("grid aspect-square place-items-center rounded-xs text-text hover:bg-hover [&_svg]:size-4", e.name === d && "bg-focus-soft text-focus"),
						dangerouslySetInnerHTML: { __html: e.svg }
					}, e.name)), !m.isFetching && m.data?.length === 0 && /* @__PURE__ */ K("p", {
						className: "col-span-8 m-0 py-6 text-center text-xs text-faint",
						children: P("No matches")
					})]
				})
			]
		}), u && !r && /* @__PURE__ */ K(W, {
			onClick: () => n(null),
			"aria-label": P("Remove Icon"),
			className: "absolute right-1 top-1/2 grid size-5 -translate-y-1/2 place-items-center rounded-xs text-faint opacity-0 hover:bg-hover hover:text-text focus-visible:opacity-100 group-hover/icon:opacity-100",
			children: /* @__PURE__ */ K(V, {
				name: "close",
				size: 12
			})
		})]
	});
}
// admin/src/write/Blocks.tsx
function In() {
	return /* @__PURE__ */ K("hr", { className: "my-3 border-0 border-t border-border-strong" });
}
function Ln({ nodes: e }) {
	let { store: t, types: r, allowed: i } = n(), { readOnly: a } = O(), o = e[e.length - 1];
	return /* @__PURE__ */ q("div", {
		className: "group/actions flex flex-wrap items-center gap-x-3 gap-y-2 py-1",
		children: [e.map((e) => /* @__PURE__ */ K(zn, { node: e }, e.id)), !a && o.type === "button" && r.has("button") && /* @__PURE__ */ K(H, {
			icon: "plus",
			label: P("Add a Button"),
			size: "xs",
			className: "opacity-0 transition-opacity group-hover/actions:opacity-100 focus-visible:opacity-100",
			onClick: () => {
				let e = t.get().nodes, n = u(e, o.id, "button", r, i), a = r.get("button");
				if (!n || !a) return;
				let s = m(a, {
					label: "",
					variant: o.type === "button" && (o.props.variant ?? "primary") === "primary" ? "secondary" : o.props.variant ?? "primary"
				}, r);
				t.insert(n.parentId, n.index, [s]), t.focus(s.id, "end", "label");
			}
		})]
	});
}
var Rn = {
	primary: "h-9 rounded-md bg-ink px-4 text-ink-contrast",
	secondary: "h-9 rounded-md border border-border-strong bg-bg px-4 text-text",
	ghost: "h-9 rounded-md px-3 text-text bg-sunken/60",
	link: "h-9 text-text underline decoration-border-strong underline-offset-4"
};
function zn({ node: e }) {
	let { store: t } = n(), { readOnly: r } = O(), [i, a] = R(!1), o = T(t, (t) => t.focus?.id === e.id && t.focus.prop === "label" ? t.focus : null), s = e.type === "link", c = String(e.props.url ?? ""), l = s ? Rn.link : Rn[e.props.variant ?? "primary"] ?? Rn.primary, u = Ot(), d = [
		At({
			handle: "url",
			label: P("Link"),
			placeholder: P("Paste a link or search pages"),
			autofocus: !c,
			anchors: u
		}),
		...s ? [] : [{
			handle: "variant",
			type: "select",
			label: P("Style"),
			display: "segmented",
			block: !0,
			options: [
				{
					value: "primary",
					label: P("Primary")
				},
				{
					value: "secondary",
					label: P("Secondary")
				},
				{
					value: "ghost",
					label: P("Ghost")
				},
				{
					value: "link",
					label: P("Text")
				}
			]
		}],
		{
			handle: "new_tab",
			type: "toggle",
			label: P("Open in New Tab")
		}
	];
	return /* @__PURE__ */ q("span", {
		className: "group/action relative inline-flex",
		children: [
			/* @__PURE__ */ K("span", {
				className: G("inline-flex items-center text-sm font-medium", l),
				children: /* @__PURE__ */ K(D, {
					html: String(e.props.label ?? ""),
					singleLine: !0,
					quiet: !0,
					disabled: r,
					placeholder: P(s ? "Link Text" : "Button Text"),
					className: "min-w-8 whitespace-nowrap",
					focus: o,
					onChange: (n) => t.updateProps(e.id, { label: n }),
					onFocus: () => t.get().selected !== e.id && t.select(e.id),
					onKeyDown: (n, r) => {
						(n.key === "Enter" || n.key === "Escape") && (n.preventDefault(), r.blur(), n.key === "Escape" && t.select(e.id, !0));
					}
				})
			}),
			!c && /* @__PURE__ */ K("span", {
				className: "pointer-events-none absolute -right-0.5 -top-0.5 size-2 rounded-full bg-warning ring-2 ring-bg",
				title: P("No link yet")
			}),
			!r && /* @__PURE__ */ K(U, {
				open: i,
				onOpenChange: a,
				align: "start",
				className: "w-80 !p-3",
				trigger: /* @__PURE__ */ K(W, {
					"aria-label": P("Edit Link"),
					title: c || P("Add a Link"),
					className: G("absolute -right-2.5 -top-2.5 grid size-6 place-items-center rounded-full border border-border bg-bg text-muted shadow-pop transition-opacity hover:text-text", i ? "opacity-100" : "opacity-0 group-hover/action:opacity-100 focus-visible:opacity-100"),
					children: /* @__PURE__ */ K(V, {
						name: "link",
						size: 12
					})
				}),
				children: /* @__PURE__ */ q("div", {
					className: "space-y-3",
					onKeyDown: (e) => e.key === "Enter" && !e.defaultPrevented && e.target.tagName === "INPUT" && a(!1),
					children: [/* @__PURE__ */ K(B, {
						fields: d,
						values: e.props,
						onChange: (n, r) => (n !== "variant" || r) && t.updateProps(e.id, { [n]: r ?? (n === "url" ? "" : r) }, `${n}:${e.id}`),
						className: "!gap-y-3"
					}), /* @__PURE__ */ K("div", {
						className: "flex justify-end border-t border-border pt-2.5",
						children: /* @__PURE__ */ K(z, {
							size: "xs",
							variant: "ghost",
							icon: "trash",
							onClick: () => {
								a(!1), t.remove(e.id);
							},
							children: P(s ? "Remove Link" : "Remove Button")
						})
					})]
				})
			})
		]
	});
}
function Bn(e) {
	let t = Array.isArray(e) ? e[0] : e, n = typeof t == "string" && /^(https?:|\/)/.test(t), r = F("media/get-many", { ids: [t] }, {
		enabled: typeof t == "string" && !n && t.length > 0,
		staleTime: 3e5,
		retry: !1
	});
	if (n) return t;
	let i = r.data?.items?.[0];
	return i ? i.url ?? i.thumb : null;
}
function Vn({ node: e }) {
	let { store: t } = n(), { settings: r, readOnly: i } = O(), a = Bn(e.props.image);
	return /* @__PURE__ */ q("figure", {
		className: "cms-block-figure m-0 py-1",
		children: [a ? /* @__PURE__ */ q("div", {
			className: "group/image relative",
			children: [
				/* @__PURE__ */ K("img", {
					src: a,
					alt: e.props.alt ?? "",
					className: "block max-h-[520px] w-full rounded-md bg-sunken object-cover",
					style: e.props.aspect && e.props.aspect !== "auto" ? { aspectRatio: e.props.aspect } : void 0
				}),
				!i && /* @__PURE__ */ K("div", {
					className: "absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover/image:opacity-100",
					children: /* @__PURE__ */ K(z, {
						size: "xs",
						variant: "secondary",
						icon: "settings",
						onClick: () => r(e.id),
						children: P("Edit")
					})
				}),
				!e.props.alt && !i && /* @__PURE__ */ K("span", {
					className: "absolute bottom-2 left-2 rounded-xs bg-bg/90 px-1.5 py-0.5 text-2xs text-muted opacity-0 shadow-pop transition-opacity group-hover/image:opacity-100",
					children: P("No alt text")
				})
			]
		}) : /* @__PURE__ */ q("div", {
			className: "flex h-36 flex-col items-center justify-center gap-3 rounded-md bg-surface text-faint",
			children: [/* @__PURE__ */ K(V, {
				name: "image",
				size: 22
			}), /* @__PURE__ */ K(B, {
				bare: !0,
				disabled: i,
				fields: [{
					handle: "image",
					type: "media",
					label: P("Image"),
					max: 1,
					accept: "image/*"
				}],
				values: { image: e.props.image },
				onChange: (n, r) => t.updateProps(e.id, { image: r })
			})]
		}), /* @__PURE__ */ K(Hn, { node: e })]
	});
}
function Hn({ node: e }) {
	let { store: t } = n(), { readOnly: r } = O(), i = T(t, (t) => t.focus?.id === e.id && t.focus.prop === "caption" ? t.focus : null);
	return r && !e.props.caption ? null : /* @__PURE__ */ K("figcaption", { children: /* @__PURE__ */ K(D, {
		html: String(e.props.caption ?? ""),
		quiet: !0,
		disabled: r,
		placeholder: P("Add a Caption"),
		focus: i,
		className: "mt-2 text-sm text-muted",
		onChange: (n) => t.updateProps(e.id, { caption: n }),
		onFocus: () => t.select(e.id)
	}) });
}
function Un(e) {
	let t = (Array.isArray(e) ? e : e ? [e] : []).filter((e) => typeof e == "string" && e !== ""), n = t.filter((e) => !/^(https?:|\/)/.test(e)), r = F("media/get-many", { ids: n }, {
		enabled: n.length > 0,
		staleTime: 3e5,
		retry: !1
	}), i = new Map((r.data?.items ?? []).map((e) => [e.id, e]));
	return t.flatMap((e) => /^(https?:|\/)/.test(e) ? [{
		id: e,
		url: e,
		thumb: e,
		filename: e.split(/[/?#]/).filter(Boolean).pop()
	}] : i.has(e) ? [i.get(e)] : []);
}
function Z({ node: e, type: t }) {
	let { settings: n } = O(), [r] = Un(e.props.file), i = String(e.props.url ?? ""), a = i ? i.replace(/^https?:\/\/(www\.)?/, "").split(/[/?#]/)[0] : "", o = {
		video: P("Add a video"),
		audio: P("Add audio"),
		file: P("Add a file")
	}[e.type] ?? P("Add a link to embed"), s = r ? r.name || r.filename : "", c = e.props.title || e.props.label || s || a || o, l = (e.props.title || e.props.label) && (s || a);
	return /* @__PURE__ */ q("figure", {
		className: "cms-block-figure m-0 py-1",
		children: [/* @__PURE__ */ q(W, {
			onClick: () => n(e.id),
			className: "flex h-14 w-full items-center gap-3 rounded-md bg-surface px-4 text-left hover:bg-hover",
			children: [/* @__PURE__ */ K(V, {
				name: t?.icon ?? "embed",
				size: 18,
				className: "text-muted"
			}), /* @__PURE__ */ q("span", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ K("span", {
					className: "block truncate text-sm text-text",
					children: c
				}), l && /* @__PURE__ */ K("span", {
					className: "block truncate text-xs text-faint",
					children: l
				})]
			})]
		}), t?.inline?.includes("caption") && /* @__PURE__ */ K(Hn, { node: e })]
	});
}
function Wn({ node: e, type: t }) {
	let { settings: n } = O(), r = Un(e.props.images);
	return /* @__PURE__ */ K("div", {
		className: "py-1",
		children: /* @__PURE__ */ K(W, {
			onClick: () => n(e.id),
			className: "block w-full rounded-md bg-surface p-2 text-left hover:bg-hover",
			children: r.length ? /* @__PURE__ */ K("span", {
				className: "grid grid-cols-4 gap-1.5 sm:grid-cols-6",
				children: r.slice(0, 12).map((e) => e.thumb ? /* @__PURE__ */ K("img", {
					src: e.thumb,
					alt: "",
					className: "aspect-square w-full rounded-xs object-cover"
				}, e.id) : /* @__PURE__ */ K("span", { className: "aspect-square rounded-xs bg-sunken" }, e.id))
			}) : /* @__PURE__ */ q("span", {
				className: "flex h-10 items-center gap-3 px-2 text-sm text-faint",
				children: [/* @__PURE__ */ K(V, {
					name: t?.icon ?? "media",
					size: 18
				}), P("Add images")]
			})
		})
	});
}
function Gn({ node: e }) {
	let { store: t } = n(), { settings: r, readOnly: i } = O();
	return /* @__PURE__ */ q("div", {
		className: "group/code relative py-1",
		onFocus: () => t.select(e.id),
		children: [/* @__PURE__ */ K(B, {
			bare: !0,
			disabled: i,
			fields: [{
				handle: "code",
				type: "code",
				label: P("Code"),
				placeholder: P("Code"),
				rows: 3,
				language: e.props.language
			}],
			values: { code: e.props.code ?? "" },
			onChange: (n, r) => t.updateProps(e.id, { code: r ?? "" }, `code:${e.id}`)
		}), /* @__PURE__ */ K(W, {
			onClick: () => r(e.id),
			className: "absolute right-2 top-2.5 rounded-xs px-1.5 font-mono text-2xs text-faint hover:bg-hover hover:text-text",
			children: e.props.language && e.props.language !== "plain" ? e.props.language : P("Plain Text")
		})]
	});
}
function Kn({ node: e }) {
	let { store: t } = n(), { readOnly: r } = O(), i = Array.isArray(e.props.rows) && e.props.rows.length ? e.props.rows : [["", ""], ["", ""]], a = Math.max(...i.map((e) => e.length)), o = (n, r, o) => t.updateProps(e.id, { rows: i.map((e, t) => t === n ? Array.from({ length: a }, (t, n) => n === r ? o : e[n] ?? "") : e) }, `table:${e.id}`), s = (n) => t.updateProps(e.id, { rows: n });
	return /* @__PURE__ */ q("div", {
		className: "group/table py-1",
		children: [/* @__PURE__ */ K("div", {
			className: "overflow-x-auto rounded-md border border-border",
			children: /* @__PURE__ */ K("table", {
				className: "w-full border-collapse text-sm",
				children: /* @__PURE__ */ K("tbody", { children: i.map((n, i) => /* @__PURE__ */ K("tr", {
					className: G("border-b border-border last:border-b-0", i === 0 && e.props.header !== !1 && "bg-surface font-medium"),
					children: Array.from({ length: a }, (a, s) => /* @__PURE__ */ K("td", {
						className: "min-w-24 border-r border-border px-3 py-2 align-top last:border-r-0",
						children: /* @__PURE__ */ K(D, {
							html: n[s] ?? "",
							singleLine: !0,
							disabled: r,
							onChange: (e) => o(i, s, e),
							onFocus: () => t.select(e.id)
						})
					}, s))
				}, i)) })
			})
		}), !r && /* @__PURE__ */ q("div", {
			className: "mt-1 flex gap-1 opacity-0 transition-opacity group-hover/table:opacity-100 group-focus-within/table:opacity-100",
			children: [
				/* @__PURE__ */ K(z, {
					size: "xs",
					variant: "ghost",
					icon: "plus",
					onClick: () => s([...i, Array(a).fill("")]),
					children: P("Row")
				}),
				/* @__PURE__ */ K(z, {
					size: "xs",
					variant: "ghost",
					icon: "plus",
					onClick: () => s(i.map((e) => [...e, ""])),
					children: P("Column")
				}),
				i.length > 1 && /* @__PURE__ */ K(z, {
					size: "xs",
					variant: "ghost",
					icon: "minus",
					onClick: () => s(i.slice(0, -1)),
					children: P("Row")
				}),
				a > 1 && /* @__PURE__ */ K(z, {
					size: "xs",
					variant: "ghost",
					icon: "minus",
					onClick: () => s(i.map((e) => e.slice(0, a - 1))),
					children: P("Column")
				})
			]
		})]
	});
}
function qn({ node: e }) {
	let { store: t } = n(), { readOnly: r } = O(), i = Array.isArray(e.props.items) ? e.props.items : [], a = (n, r) => t.updateProps(e.id, { items: i.map((e, t) => t === n ? {
		...e,
		...r
	} : e) }, `faq:${e.id}:${n}`), o = i.length ? i : [{
		question: "",
		answer: ""
	}];
	return /* @__PURE__ */ q("div", {
		className: "group/faq py-1",
		children: [/* @__PURE__ */ K("div", {
			className: "divide-y divide-border border-y border-border",
			children: o.map((n, o) => /* @__PURE__ */ q("div", {
				className: "py-3",
				children: [/* @__PURE__ */ q("div", {
					className: "flex items-start gap-2",
					children: [
						/* @__PURE__ */ K(V, {
							name: "chevron-down",
							size: 14,
							className: "mt-1 shrink-0 text-faint"
						}),
						/* @__PURE__ */ K(D, {
							html: Xn(n.question ?? ""),
							singleLine: !0,
							disabled: r,
							placeholder: P("Question"),
							className: "min-w-0 flex-1 text-base font-medium leading-6",
							onChange: (e) => a(o, { question: Zn(e) }),
							onFocus: () => t.select(e.id)
						}),
						!r && i.length > 1 && /* @__PURE__ */ K(H, {
							icon: "close",
							label: P("Remove Question"),
							size: "xs",
							className: "opacity-0 group-hover/faq:opacity-100",
							onClick: () => t.updateProps(e.id, { items: i.filter((e, t) => t !== o) })
						})
					]
				}), /* @__PURE__ */ K(D, {
					html: n.answer ?? "",
					quiet: !0,
					disabled: r,
					placeholder: P("Answer"),
					className: "mt-1 pl-[22px] text-base leading-6 text-muted",
					onChange: (e) => a(o, { answer: e }),
					onFocus: () => t.select(e.id)
				})]
			}, o))
		}), !r && /* @__PURE__ */ K(z, {
			size: "xs",
			variant: "ghost",
			icon: "plus",
			className: "mt-1 opacity-0 transition-opacity group-hover/faq:opacity-100",
			onClick: () => t.updateProps(e.id, { items: [...i, {
				question: "",
				answer: ""
			}] }),
			children: P("Question")
		})]
	});
}
function Jn({ node: e }) {
	let { store: t } = n(), { readOnly: r } = O(), i = F("components/list", { working: !0 }, { staleTime: 3e4 }), a = i.data?.find((t) => t.handle === e.props.ref), o = e.props.values ?? {}, s = e.bind ?? {}, c = (a?.props ?? []).filter((e) => e.type !== "json"), l = (n, r) => t.updateProps(e.id, { values: {
		...o,
		[n]: r
	} }, `values:${e.id}:${n}`), u = /* @__PURE__ */ q("div", {
		className: "flex h-8 items-center gap-2 text-xs",
		children: [
			/* @__PURE__ */ K(V, {
				name: "symbol",
				size: 13,
				className: "text-faint"
			}),
			/* @__PURE__ */ K("span", {
				className: "truncate font-medium text-muted",
				children: a?.title ?? (i.isLoading ? "…" : P("Missing component"))
			}),
			/* @__PURE__ */ K("span", { className: "flex-1" }),
			a?.id && /* @__PURE__ */ K(W, {
				onClick: () => Nt(`/content/components/${a.id}`),
				className: "rounded-xs px-1.5 text-faint opacity-0 transition-opacity hover:bg-hover hover:text-text group-hover/component:opacity-100",
				children: P("Edit Component")
			})
		]
	});
	return c.length === 0 ? /* @__PURE__ */ q("div", {
		className: "flex h-9 items-center gap-2 rounded-md px-1 text-sm text-faint",
		children: [
			/* @__PURE__ */ K(V, {
				name: "symbol",
				size: 14
			}),
			/* @__PURE__ */ K("span", {
				className: "truncate text-muted",
				children: a?.title ?? (i.isLoading ? "…" : P("Missing component"))
			}),
			a?.id && /* @__PURE__ */ K(W, {
				onClick: () => Nt(`/content/components/${a.id}`),
				className: "shrink-0 rounded-xs px-1 text-xs text-faint hover:bg-hover hover:text-text",
				children: P("Edit Component")
			})
		]
	}) : /* @__PURE__ */ q("div", {
		className: "group/component rounded-md border border-border px-3 pb-1",
		children: [u, c.length > 0 && /* @__PURE__ */ K("div", {
			className: "space-y-2.5 border-t border-border py-2.5",
			children: c.map((n) => {
				let i = o[n.handle] ?? n.default, a = s[`values.${n.handle}`];
				return /* @__PURE__ */ q("div", {
					className: "grid grid-cols-[120px_minmax(0,1fr)] items-start gap-3",
					children: [/* @__PURE__ */ K("span", {
						className: "truncate pt-[3px] text-xs text-faint",
						title: n.instructions,
						children: n.label
					}), a ? /* @__PURE__ */ K("span", {
						className: "pt-[3px] font-mono text-xs text-faint",
						children: a
					}) : [
						"text",
						"textarea",
						"richtext"
					].includes(n.type) ? /* @__PURE__ */ K(D, {
						html: n.type === "richtext" ? String(i ?? "") : Xn(String(i ?? "")),
						singleLine: n.type === "text",
						disabled: r,
						placeholder: n.placeholder ?? P("Empty"),
						className: "text-base leading-6",
						onChange: (e) => l(n.handle, n.type === "richtext" ? e : Zn(e)),
						onFocus: () => t.select(e.id)
					}) : /* @__PURE__ */ K(B, {
						bare: !0,
						disabled: r,
						fields: [n.type === "url" ? At({
							...n,
							label: n.label
						}) : {
							...n,
							size: "sm"
						}],
						values: { [n.handle]: i },
						onChange: (e, t) => l(n.handle, t)
					})]
				}, n.handle);
			})
		})]
	});
}
function Yn({ node: e, type: t }) {
	let { settings: n } = O(), r = i(e, 80);
	return /* @__PURE__ */ q(W, {
		onClick: () => n(e.id),
		className: "my-1 flex w-full items-center gap-3 rounded-md bg-surface px-3 py-2.5 text-left hover:bg-hover",
		children: [/* @__PURE__ */ K(V, {
			name: t?.icon ?? "square",
			size: 16,
			className: "shrink-0 text-muted"
		}), /* @__PURE__ */ q("span", {
			className: "min-w-0 flex-1",
			children: [/* @__PURE__ */ K("span", {
				className: "block text-sm text-text",
				children: t?.title ?? e.type
			}), (r || !t) && /* @__PURE__ */ K("span", {
				className: "block truncate text-xs text-faint",
				children: t ? r : P("Its plugin is off — the content is kept")
			})]
		})]
	});
}
function Xn(e) {
	return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
}
function Zn(e) {
	let t = document.createElement("div");
	return t.innerHTML = e.replace(/<br\s*\/?>/g, "\n"), t.textContent ?? "";
}
// admin/src/write/WriteEditor.tsx
var Q = /* @__PURE__ */ new Map(), Qn = (e) => Q.get(e) ?? Q.get(e.split("/")[0] + "/*"), $n = (e) => !!Qn(e), er = Pt(null);
function tr({ onInspect: e } = {}) {
	let { store: t, types: r, allowed: i, readOnly: l = !1 } = n(), d = T(t, (e) => e.nodes), f = Rt(() => Ke(d, r, $n), [d, r]), p = Rt(() => new Map(yt(f).map((e) => [k(e), e])), [f]), m = L(null), [g, _] = R(null), [v, y] = R(null), [ee, b] = R(null), x = tn(en(Yt, { activationConstraint: { distance: 5 } })), S = L(null), C = Rt(() => ({
		stops: () => {
			let e = t.get().nodes;
			return S.current?.nodes !== e && (S.current = {
				nodes: e,
				stops: Je(Ke(e, r, $n))
			}), S.current.stops;
		},
		settings: (n) => {
			t.select(n, !0), e ? e(n) : _(n);
		},
		readOnly: l
	}), [
		t,
		r,
		l,
		e
	]);
	Lt(() => {
		d.length === 0 && !l && h(null, "paragraph", r, i) && t.reset([et()]);
	}, [
		d,
		l,
		t,
		r,
		i
	]);
	let te = L(p);
	te.current = p, pr(t, m, C, te);
	let w = (e, n, s) => {
		let l = t.get().nodes, u = s === "before" ? M(n)[0] : M(n).at(-1), d = M(e);
		if (d.some((e) => e.id === u.id || a(l, u.id).some((t) => t.id === e.id))) return null;
		let f = c(l, u.id);
		if (!f) return null;
		let p = f.parentId ? o(l, f.parentId) : null;
		return d.every((e) => h(p, e.type, r, p ? [] : i)) ? {
			ids: d.map((e) => e.id),
			parentId: f.parentId,
			index: s === "before" ? f.index : f.index + 1
		} : null;
	};
	return /* @__PURE__ */ K(Ze.Provider, {
		value: C,
		children: /* @__PURE__ */ q("div", {
			ref: m,
			className: "relative",
			"data-cms-write": !0,
			children: [
				/* @__PURE__ */ q(qt, {
					sensors: x,
					collisionDetection: nr,
					onDragStart: (e) => b(p.get(String(e.active.id)) ?? null),
					onDragMove: (e) => {
						let t = p.get(String(e.active.id)), n = e.over ? p.get(String(e.over.id)) : null;
						if (!t || !n || e.over.id === e.active.id) return v && y(null);
						let r = e.activatorEvent.clientY + e.delta.y < e.over.rect.top + e.over.rect.height / 2 ? "before" : "after", i = w(t, n, r) ? {
							id: String(e.over.id),
							side: r
						} : null;
						(i?.id !== v?.id || i?.side !== v?.side) && y(i);
					},
					onDragEnd: (e) => {
						let n = p.get(String(e.active.id)), r = v ? p.get(v.id) : null;
						y(null), b(null);
						let i = n && r && v ? w(n, r, v.side) : null;
						i && t.moveTo(i.ids, i.parentId, i.index);
					},
					onDragCancel: () => {
						y(null), b(null);
					},
					children: [/* @__PURE__ */ K(er.Provider, {
						value: v,
						children: f.map((e, t) => /* @__PURE__ */ K(rr, {
							section: e,
							spaced: t > 0 && (e.container || f[t - 1].container)
						}, e.id))
					}), Kt(/* @__PURE__ */ K(Jt, {
						dropAnimation: null,
						children: ee && /* @__PURE__ */ K(dr, { row: ee })
					}), document.body)]
				}),
				!l && /* @__PURE__ */ K(W, {
					compact: !0,
					tabIndex: -1,
					"aria-label": P("Continue Writing"),
					onClick: () => {
						let e = C.stops().at(-1), n = e ? o(t.get().nodes, e.id) : null;
						if (n?.type === "paragraph" && s(n.props.text)) return A(t, e, "end");
						let a = t.get().nodes, c = f.at(-1), l = c?.container ? M(c.rows.at(-1)).at(-1).id : a.at(-1)?.id, d = l ? u(a, l, "paragraph", r, i) : {
							parentId: null,
							index: 0
						};
						if (!d) return;
						let p = et();
						t.insert(d.parentId, d.index, [p]), t.focus(p.id, "start");
					},
					className: "block h-28 w-full cursor-text"
				}),
				/* @__PURE__ */ K(wt, {}),
				/* @__PURE__ */ K(fr, {}),
				g && !e && /* @__PURE__ */ K(zt, {
					open: !0,
					onOpenChange: (e) => !e && _(null),
					title: P("Block"),
					children: o(d, g) && /* @__PURE__ */ K(bt, {
						node: o(d, g),
						onClose: () => _(null)
					})
				})
			]
		})
	});
}
var nr = (e) => {
	let t = Zt(e);
	if (t.length === 0) return Xt(e);
	let n = (t) => {
		let n = e.droppableRects.get(t);
		return n ? n.width * n.height : Infinity;
	};
	return [...t].sort((e, t) => n(e.id) - n(t.id)).slice(0, 1);
};
function rr({ section: e, spaced: t }) {
	return /* @__PURE__ */ q("section", {
		className: G("group/section relative", t && "mt-10"),
		children: [e.label && /* @__PURE__ */ K("div", {
			className: "pointer-events-none absolute right-[calc(100%+76px)] top-[5px] max-w-40 truncate whitespace-nowrap text-2xs text-faint opacity-0 transition-opacity duration-base group-focus-within/section:opacity-100 group-hover/section:opacity-100 max-xl:hidden",
			children: e.label
		}), e.rows.map((e, t) => /* @__PURE__ */ K($, {
			row: e,
			first: t === 0
		}, k(e)))]
	});
}
function ir(e, t) {
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
function $({ row: e, first: t, nested: r }) {
	let { store: i } = n(), { readOnly: a } = O(), o = k(e), s = M(e).map((e) => e.id), c = T(i, (e) => e.blockMode && ze(e).some((e) => s.includes(e))), l = It(er), u = $t({ id: o }), d = Qt({
		id: o,
		disabled: a
	}), { className: f, line: p } = ir(e, t);
	return /* @__PURE__ */ q("div", {
		ref: (e) => {
			u.setNodeRef(e), d.setNodeRef(e);
		},
		"data-row": o,
		"data-nested": r || void 0,
		style: { "--line": `${p}px` },
		className: G(r ? "group/nested" : "group/row", "relative py-[3px]", f, d.isDragging && "opacity-35", e.hidden && "opacity-45"),
		onMouseDown: (e) => {
			let t = e.target;
			t.closest("[data-row]") !== e.currentTarget || t.closest("[contenteditable=\"true\"],textarea,input,button,a,[role=\"button\"]") || (e.shiftKey && i.get().selected ? (e.preventDefault(), i.get().blockMode || i.select(i.get().selected, !0), i.extendTo(s.at(-1))) : (i.select(s[0], !0), s.length > 1 && i.extendTo(s.at(-1))));
		},
		children: [
			l?.id === o && /* @__PURE__ */ K("div", { className: G("pointer-events-none absolute inset-x-0 z-raised h-0.5 rounded-full bg-focus", l.side === "before" ? "-top-px" : "-bottom-px") }),
			!a && /* @__PURE__ */ K(sr, {
				row: e,
				handle: d,
				nested: r
			}),
			/* @__PURE__ */ K("div", {
				className: G("rounded-sm transition-[background-color,box-shadow] duration-fast", c && "bg-focus/10 ring-3 ring-focus/10"),
				children: /* @__PURE__ */ K(ar, { row: e })
			})
		]
	});
}
function ar({ row: e }) {
	let { types: t } = n(), { settings: r } = O();
	if (e.kind === "text") return /* @__PURE__ */ K(ut, { node: e.node });
	if (e.kind === "list") return /* @__PURE__ */ K(Ye, { node: e.node });
	if (e.kind === "actions") return /* @__PURE__ */ K(Ln, { nodes: e.nodes });
	if (e.kind === "container") {
		let n = t.get(e.node.type);
		return /* @__PURE__ */ q("div", {
			className: "rounded-md border border-border/70 px-4 pb-3 pt-2",
			children: [/* @__PURE__ */ q(W, {
				compact: !0,
				onClick: () => r(e.node.id),
				className: "mb-2 flex max-w-full items-center gap-1.5 text-xs text-faint hover:text-text",
				children: [/* @__PURE__ */ K(V, {
					name: n?.icon ?? "square",
					size: 12
				}), /* @__PURE__ */ K("span", {
					className: "truncate",
					children: e.node.label || n?.title || e.node.type
				})]
			}), e.rows.length ? e.rows.map((e, t) => /* @__PURE__ */ K($, {
				row: e,
				first: t === 0,
				nested: !0
			}, k(e))) : /* @__PURE__ */ K(or, { column: e.node })]
		});
	}
	if (e.kind === "columns") {
		let t = String(e.node.props.layout ?? "1-1").split("-").map((e) => `minmax(0,${e}fr)`).join(" ");
		return /* @__PURE__ */ K("div", {
			className: "grid gap-8 py-1 max-md:!grid-cols-1",
			style: { gridTemplateColumns: t },
			children: e.columns.map((e) => /* @__PURE__ */ K("div", {
				className: "min-w-0",
				children: e.rows.length ? e.rows.map((e, t) => /* @__PURE__ */ K($, {
					row: e,
					first: t === 0,
					nested: !0
				}, k(e))) : /* @__PURE__ */ K(or, { column: e.node })
			}, e.node.id))
		});
	}
	let i = e.node, a = t.get(i.type), o = Qn(i.type);
	if (o) return /* @__PURE__ */ K(o, {
		node: i,
		type: a,
		onSettings: r
	});
	switch (i.type) {
		case "image": return /* @__PURE__ */ K(Vn, { node: i });
		case "video":
		case "embed": return /* @__PURE__ */ K(Z, {
			node: i,
			type: a
		});
		case "code": return /* @__PURE__ */ K(Gn, { node: i });
		case "table": return /* @__PURE__ */ K(Kn, { node: i });
		case "divider": return /* @__PURE__ */ K(In, {});
		case "accordion": return /* @__PURE__ */ K(qn, { node: i });
		case "component": return /* @__PURE__ */ K(Jn, { node: i });
		default: return /* @__PURE__ */ K(Yn, {
			node: i,
			type: a
		});
	}
}
function or({ column: e }) {
	let { store: t, types: r } = n(), { readOnly: i } = O();
	return i || !h(e, "paragraph", r, []) ? null : /* @__PURE__ */ K(W, {
		compact: !0,
		onClick: () => {
			let n = et();
			t.insert(e.id, 0, [n]), t.focus(n.id, "start");
		},
		className: G(xt, "block w-full cursor-text py-[3px] text-left text-faint opacity-0 hover:opacity-100"),
		children: P("Write here")
	});
}
function sr({ row: e, handle: t, nested: i }) {
	let { store: a, types: o, allowed: s } = n(), c = O(), [l, d] = R(!1), [p, m] = R(""), h = T(a, (t) => t.blockMode && M(e).some((e) => e.id === t.selected)), g = M(e).at(-1), _ = (e) => {
		let t = f(e, o), n = u(a.get().nodes, g.id, t.map((e) => e.type), o, s);
		d(!1), m(""), n && (a.insert(n.parentId, n.index, t), mt(a, t[0], c.stops()));
	};
	return /* @__PURE__ */ q("div", {
		className: G("absolute top-[3px] z-raised flex h-[var(--line)] items-center gap-0.5 opacity-0 transition-opacity duration-fast focus-within:opacity-100", i ? "-left-[22px] group-hover/nested:opacity-100" : "-left-[54px] group-hover/row:opacity-100 group-has-[[data-nested]:hover]/row:!opacity-0", (l || h) && "!opacity-100"),
		children: [!i && /* @__PURE__ */ K(U, {
			open: l,
			onOpenChange: (e) => {
				d(e), e || m("");
			},
			align: "start",
			className: "!p-0",
			trigger: /* @__PURE__ */ K(H, {
				icon: "plus",
				label: P("Add Below"),
				size: "xs",
				className: "!text-faint hover:!text-text"
			}),
			children: /* @__PURE__ */ K(r, {
				types: [...o.values()],
				query: p,
				onQuery: m,
				onChoose: _,
				onClose: () => d(!1),
				allowed: (e) => !!u(a.get().nodes, g.id, e.name, o, s)
			})
		}), /* @__PURE__ */ K(Bt, {
			align: "start",
			trigger: /* @__PURE__ */ K(W, {
				compact: !0,
				ref: t.setActivatorNodeRef,
				...t.attributes,
				...t.listeners,
				"aria-label": P("Drag to move, click for options"),
				className: "grid h-6 w-[18px] cursor-grab place-items-center rounded-xs text-faint hover:bg-hover hover:text-text active:cursor-grabbing",
				children: /* @__PURE__ */ K(V, {
					name: "drag",
					size: 14
				})
			}),
			items: lr(a, e, o, s, c)
		})]
	});
}
var cr = [
	{
		label: () => P("Text"),
		icon: "paragraph",
		type: "paragraph",
		props: {}
	},
	{
		label: () => P("Heading 1"),
		icon: "heading",
		type: "heading",
		props: { level: "1" }
	},
	{
		label: () => P("Heading 2"),
		icon: "heading",
		type: "heading",
		props: { level: "2" }
	},
	{
		label: () => P("Heading 3"),
		icon: "heading",
		type: "heading",
		props: { level: "3" }
	},
	{
		label: () => P("Bulleted List"),
		icon: "list",
		type: "list",
		props: { ordered: !1 }
	},
	{
		label: () => P("Numbered List"),
		icon: "list-ordered",
		type: "list",
		props: { ordered: !0 }
	},
	{
		label: () => P("Quote"),
		icon: "quote",
		type: "quote",
		props: {}
	},
	{
		label: () => P("Callout"),
		icon: "info",
		type: "callout",
		props: { tone: "note" }
	}
];
function lr(e, t, n, r, i) {
	let a = M(t), s = a[0], c = t.kind === "text" || t.kind === "list", u = () => s.type === "list" ? (s.props.items ?? []).join("<br>") : String(s.props.text ?? ""), d = (e) => e.type === s.type && Object.entries(e.props).every(([e, t]) => String(s.props[e] ?? (e !== "ordered" && "")) === String(t)), f = (t) => () => {
		let n = t.type === "list" ? {
			...t.props,
			items: u().split(/<br\s*\/?>/)
		} : {
			...t.props,
			text: u(),
			...t.type === "quote" ? { cite: "" } : {}
		};
		e.updateNode(s.id, {
			type: t.type,
			props: n
		}), e.focus(s.id, "end", t.type === "list" ? "items" : "text", t.type === "list" ? 0 : void 0);
	}, p = a.length === 1, m = t.parent ? o(e.get().nodes, t.parent) : null;
	return [
		...c ? [
			{
				label: P("Turn Into"),
				heading: !0
			},
			...cr.filter((e) => n.has(e.type) && h(m, e.type, n, m ? [] : r)).map((e) => ({
				label: e.label(),
				icon: e.icon,
				checked: d(e),
				onSelect: f(e)
			})),
			{
				separator: !0,
				label: ""
			}
		] : [],
		p && {
			label: P("Settings"),
			icon: "settings",
			onSelect: () => i.settings(s.id)
		},
		{
			label: P("Duplicate"),
			icon: "copy",
			shortcut: "mod+d",
			onSelect: () => ur(e, a.map((e) => e.id))
		},
		{
			separator: !0,
			label: ""
		},
		{
			label: P("Delete"),
			icon: "trash",
			danger: !0,
			shortcut: "⌫",
			onSelect: () => e.commit(a.reduce((e, t) => l(e, t.id), e.get().nodes))
		}
	];
}
function ur(e, t) {
	let n = e.get().nodes, r = t.map((e) => o(n, e)).filter((e) => !!e).map(p), i = c(n, t.at(-1));
	i && r.length !== 0 && (e.insert(i.parentId, i.index + 1, r), e.select(r[0].id, !0), r.length > 1 && e.extendTo(r.at(-1).id));
}
function dr({ row: e }) {
	let t = M(e).map((e) => i(e, 60)).filter(Boolean).join(" · ");
	return /* @__PURE__ */ K("div", {
		className: "cms-pop max-w-[360px] truncate px-3 py-1.5 text-sm text-muted",
		children: t || P("Block")
	});
}
function fr() {
	let { store: e, types: t, allowed: i } = n(), a = O(), s = Ue(), [d, p] = R(null);
	if (F("components/list", {}, {
		staleTime: 6e4,
		enabled: i.length === 0 || i.includes("component")
	}), F("patterns/list", {}, { staleTime: 6e4 }), I(() => {
		if (!s) return p(null);
		let e = requestAnimationFrame(() => {
			let e = document.querySelector(`[data-row="${s.id}"] [contenteditable]`);
			p(ke() ?? e?.getBoundingClientRect() ?? null);
		});
		return () => cancelAnimationFrame(e);
	}, [s]), I(() => {
		if (!s) return;
		let e = () => !document.activeElement?.closest(`[data-row="${s.id}"]`) && j(null);
		return document.addEventListener("focusin", e), () => document.removeEventListener("focusin", e);
	}, [s]), ft(!!s, [document]), !s || !d) return null;
	let m = (n) => {
		let r = f(n, t), d = e.get().nodes, p = c(d, s.id);
		if (j(null), !p) return;
		let m = p.parentId ? o(d, p.parentId) : null;
		if (r.every((e) => h(m, e.type, t, m ? [] : i))) e.commit(g(l(d, s.id), p.parentId, p.index, r));
		else {
			let n = u(d, s.id, r.map((e) => e.type), t, i);
			if (!n) return;
			e.commit(g(l(d, s.id), n.parentId, n.index, r));
		}
		mt(e, r[0], a.stops());
	}, { maxHeight: _, ...v } = nt(d);
	return Kt(/* @__PURE__ */ K("div", {
		"data-cms-slash": !0,
		className: "cms-pop fixed z-overlay overflow-hidden !p-0",
		style: v,
		children: /* @__PURE__ */ K(r, {
			types: [...t.values()],
			query: s.query,
			chooseFirst: s.enter,
			components: i.length === 0 || i.includes("component"),
			onNoMatch: () => {
				let e = document.querySelector(`[data-row="${s.id}"] [contenteditable]`);
				j(null), e?.dispatchEvent(new KeyboardEvent("keydown", {
					key: "Enter",
					bubbles: !0,
					cancelable: !0
				}));
			},
			showSearch: !1,
			compact: !0,
			style: { maxHeight: _ },
			onChoose: m,
			onClose: () => j(null),
			allowed: (n) => !!u(e.get().nodes, s.id, n.name, t, i)
		})
	}), document.body);
}
function pr(e, t, n, r) {
	I(() => {
		let i = (i) => {
			if (i.defaultPrevented) return;
			let a = t.current?.contains(document.activeElement) || t.current?.contains(i.target), { selected: s, blockMode: c, nodes: l } = e.get(), u = i.metaKey || i.ctrlKey, d = document.activeElement === document.body || !document.activeElement;
			if (u && i.key.toLowerCase() === "z" && (a || c || d)) {
				i.preventDefault();
				let t = a && document.activeElement?.isContentEditable;
				document.activeElement?.blur(), i.shiftKey ? e.redo() : e.undo();
				let r = t && s ? n.stops().find((e) => e.id === s) : null;
				r && A(e, r, "end");
				return;
			}
			if (!c || !s || n.readOnly || i.target?.closest?.("input,textarea,[contenteditable=\"true\"],[role=\"dialog\"],[data-cms-settings]")) return;
			let f = [...r.current.values()], m = f.findIndex((e) => M(e).some((e) => e.id === s)), h = f[m], g = (t) => {
				if (!t) return;
				let n = M(t).map((e) => e.id);
				e.select(n[0], !0), n.length > 1 && e.extendTo(n.at(-1)), document.querySelector(`[data-row="${n[0]}"]`)?.scrollIntoView({ block: "nearest" });
			};
			if (i.key === "ArrowDown" || i.key === "ArrowUp") {
				i.preventDefault();
				let t = i.key === "ArrowUp";
				if (i.altKey) return e.nudge(s, t ? -1 : 1);
				if (i.shiftKey) return e.extend(t ? -1 : 1);
				g(f[m + (t ? -1 : 1)]);
			} else if (i.key === "Enter") {
				i.preventDefault();
				let t = n.stops().find((e) => e.id === s), r = h ? M(h)[0] : null;
				t ? A(e, t, "end") : r && n.settings(r.id);
			} else if (i.key === "Backspace" || i.key === "Delete") {
				i.preventDefault();
				let t = f[m - 1] ?? f.slice(m + 1).find((t) => !M(t).some((t) => e.selection().includes(t.id)));
				e.removeSelection(), g(t);
			} else if (u && i.key.toLowerCase() === "d") i.preventDefault(), ur(e, e.selection());
			else if (u && (i.key.toLowerCase() === "c" || i.key.toLowerCase() === "x")) {
				let t = e.selection().map((e) => o(l, e)).filter(Boolean);
				if (t.length === 0) return;
				i.preventDefault(), navigator.clipboard.writeText("cms-blocks:" + JSON.stringify(t)), i.key.toLowerCase() === "x" && e.removeSelection();
			} else u && i.key.toLowerCase() === "v" ? (i.preventDefault(), navigator.clipboard.readText().then((t) => {
				if (!t.startsWith("cms-blocks:")) return;
				let n = JSON.parse(t.slice(12)).map(p);
				e.insertAfter(e.selection().at(-1) ?? s, n), e.select(n[0].id, !0);
			})) : i.key === "Escape" && e.select(null);
		};
		return window.addEventListener("keydown", i), () => window.removeEventListener("keydown", i);
	}, [
		e,
		t,
		n,
		r
	]);
}
jn(), N.fields.set("blocks", nn), kn(), N.fields.set("blocks-icon", Fn), N.panels.set("blocks-editor", {
	slot: "entry.editor",
	label: P("Block Editor"),
	icon: "layout",
	component: Ft(() => import("./chunks/BlocksWorkspace-Cr17kULk.js").then((e) => ({ default: e.BlocksWorkspace }))),
	when: (e) => e.bodyField.type === "blocks"
}), N.widgets.set("blocks-design", Ft(() => import("./chunks/WidgetDesign-DibJhush.js"))), N.components.set("blocks/patterns", Ft(() => import("./chunks/Patterns-DVvtcqcQ.js"))), Q.set("audio", Z), Q.set("file", Z), Q.set("gallery", Wn);
export { kt as ClassChips, ge as ClassStyle, We as ClassesSection, ct as ColorField, $e as ColorPicker, ve as ELEMENTS, t as EditorProvider, fe as EditorStore, De as Engine, Ce as GRADIENT_MARKERS, bt as Inspector, Be as InspectorSection, de as PanelFields, lt as STYLE_GROUPS, at as SpacingChips, vt as Specimen, tt as StateMenu, _t as StylePanels, be as Stylesheet, S as StylingProvider, v as TokenButton, rt as TokenChip, _e as TokenList, tr as WriteEditor, Mt as arbitrary, He as askStyleName, we as balanced, Q as blockViews, Ge as buttonLabel, re as colorGroups, le as dataStates, b as everyScreen, he as gradientOf, Ee as gradientUtilities, Fe as layerOf, jt as layerUsed, ee as lightDark, Et as loadCompiler, je as loadEngine, ne as loadTailwindTheme, Pe as onLayer, ce as parseClass, se as partUtility, te as screenFor, Ne as screenVariant, Me as searchClasses, ie as shownVariable, Le as splitClasses, Ie as splitSiteClasses, dt as stateLabel, ae as styleApi, st as styleSample, ue as themeDefaults, oe as themeReference, Se as tokensOf, e as useCatalog, T as useEditor, n as useEditorContext, ot as useEngine, St as useSpecimenSheet, y as useStyling, it as useThemeTokens, pe as usedVariants, Ve as withAlpha, me as withVariants };
