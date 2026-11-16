import { d as e, l as t, p as n, t as r } from "./chunks/Inserter-CfdoRD1B.js";
import { $ as i, $t as a, A as o, At as s, B as c, Bt as l, C as u, Ct as d, D as f, Dt as p, E as m, Et as h, F as g, Ft as _, G as v, Gt as y, H as ee, Ht as te, I as ne, It as re, J as ie, Jt as ae, K as oe, Kt as se, L as ce, Lt as le, M as ue, Mt as de, N as fe, Nt as pe, O as me, Ot as he, P as ge, Pt as _e, Q as ve, Qt as ye, R as be, Rt as xe, S as Se, St as b, T as Ce, Tt as we, U as Te, Ut as Ee, V as De, Vt as Oe, W as ke, Wt as Ae, X as je, Xt as Me, Y as Ne, Yt as Pe, Z as Fe, Zt as Ie, _ as Le, _t as x, a as Re, an as S, at as ze, b as Be, bt as Ve, c as He, ct as Ue, d as We, dt as Ge, en as Ke, et as qe, f as Je, ft as Ye, g as Xe, gt as C, h as Ze, ht as Qe, i as $e, in as et, it as tt, j as w, jt as nt, k as rt, kt as it, l as at, lt as ot, m as st, mt as ct, n as lt, nn as ut, nt as dt, o as ft, ot as pt, p as mt, pt as ht, q as gt, qt as _t, r as vt, rn as yt, rt as bt, s as xt, st as St, t as Ct, tn as wt, tt as T, u as Tt, ut as E, v as Et, vt as Dt, w as Ot, x as kt, xt as At, y as jt, yt as Mt, z as Nt, zt as Pt } from "./chunks/Inspector-CNV8GGaH.js";
import { _ as Ft, a as It, c as D, d as Lt, f as O, h as k, i as A, l as Rt, n as zt, o as Bt, s as Vt, t as j, u as Ht } from "./chunks/insert-DZPaXAR2.js";
import { navigate as Ut, registry as M, t as N, useAbility as P } from "@letterncms/sdk";
import { createContext as Wt, lazy as F, useContext as Gt, useEffect as I, useLayoutEffect as Kt, useMemo as qt, useRef as L, useState as R } from "react";
import { Button as z, Fields as B, Icon as V, IconButton as H, InspectorPanel as Jt, Menu as Yt, Popover as U, Pressable as W, QueryError as Xt, Segmented as Zt, Spinner as Qt, cn as G, fieldControlId as K } from "@letterncms/ui";
import { Fragment as $t, jsx as q, jsxs as J } from "react/jsx-runtime";
import { createPortal as en } from "react-dom";
import { DndContext as tn, DragOverlay as nn, PointerSensor as rn, closestCenter as an, pointerWithin as on, useDraggable as sn, useDroppable as cn, useSensor as ln, useSensors as un } from "@dnd-kit/core";
// admin/src/BlocksField.tsx
function dn({ field: n, value: r, onChange: i, context: a, disabled: o }) {
	let { catalog: s, types: c, isLoading: l, error: u, retry: d } = e(), f = ut(r, i, !!o), [p, m] = R(null), h = S(f, (e) => e.nodes), g = L(a);
	if (g.current = a, l) return /* @__PURE__ */ q("div", {
		className: "flex h-24 items-center justify-center text-faint",
		children: /* @__PURE__ */ q(Qt, {})
	});
	if (!s) return /* @__PURE__ */ q(Xt, {
		message: u?.message,
		onRetry: d
	});
	let _ = {
		store: f,
		types: c,
		catalog: s,
		entryId: a.entry?.id ?? null,
		fieldHandle: n.handle,
		allowed: n.allowed ?? [],
		getValues: () => g.current.values ?? {},
		title: a.title ?? a.entry?.title ?? "",
		readOnly: !!o
	};
	return /* @__PURE__ */ J(t, {
		value: _,
		children: [/* @__PURE__ */ q("div", {
			className: "h-[480px] min-w-0 overflow-hidden rounded-sm border border-border",
			children: /* @__PURE__ */ q(pt, {
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
				onInspect: m,
				standalone: !0
			})
		}), /* @__PURE__ */ J(Jt, {
			docked: !1,
			open: !!p,
			onOpenChange: (e) => !e && m(null),
			title: N("Block Settings"),
			children: [/* @__PURE__ */ q("div", {
				className: "flex h-10 shrink-0 items-center justify-end border-b border-border px-2",
				children: /* @__PURE__ */ q(H, {
					icon: "close",
					label: N("Close Panel"),
					size: "xs",
					onClick: () => m(null)
				})
			}), p && D(h, p) && /* @__PURE__ */ q(Ct, {
				node: D(h, p),
				onClose: () => m(null)
			})]
		})]
	});
}
// admin/src/builder/content/BindField.tsx
function fn({ field: e, value: t, onChange: n, disabled: r }) {
	let [i, a] = R(!1), [s, c] = R(null), l = t ?? void 0, u = e.paths ?? [], d = [...new Set(u.map((e) => e.group))], f = u.find((e) => e.path === l)?.label;
	return /* @__PURE__ */ J(o, { children: [/* @__PURE__ */ J("div", {
		className: "relative flex min-w-0 flex-1 items-center",
		children: [/* @__PURE__ */ q(V, {
			name: "database",
			size: 13,
			className: "pointer-events-none absolute left-2 text-ink"
		}), /* @__PURE__ */ q("input", {
			id: K(e),
			value: s ?? l ?? "",
			placeholder: e.placeholder ?? "entry.title",
			disabled: r,
			spellCheck: !1,
			onChange: (e) => c(e.target.value),
			onBlur: () => {
				s !== null && n(s.trim() || null), c(null);
			},
			onKeyDown: (e) => e.key === "Enter" && e.target.blur(),
			title: f,
			"aria-label": e.label,
			className: G(ze, "!pl-7 font-mono text-ink placeholder:font-sans")
		})]
	}), /* @__PURE__ */ J(U, {
		open: i,
		onOpenChange: a,
		align: "end",
		className: "w-64 !p-1",
		trigger: /* @__PURE__ */ q(H, {
			icon: "chevron-down",
			size: "xs",
			label: N("Choose Data")
		}),
		children: [/* @__PURE__ */ q("div", {
			className: "max-h-80 overflow-y-auto",
			children: d.map((e) => /* @__PURE__ */ J("div", {
				className: "py-1",
				children: [/* @__PURE__ */ q("p", {
					className: "cms-label m-0 px-2 pb-1",
					children: e
				}), u.filter((t) => t.group === e).map((e) => /* @__PURE__ */ J(z, {
					variant: "ghost",
					"data-active": l === e.path || void 0,
					onClick: () => {
						n(e.path), a(!1);
					},
					className: "w-full !justify-start !gap-2 !rounded-xs !px-2 text-left !text-xs !font-normal",
					children: [
						/* @__PURE__ */ q("span", {
							className: "min-w-0 flex-1 truncate",
							children: e.label
						}),
						/* @__PURE__ */ q("span", {
							className: "max-w-[50%] shrink-0 truncate font-mono text-2xs text-faint",
							children: e.path
						}),
						l === e.path && /* @__PURE__ */ q(V, {
							name: "check",
							size: 11,
							className: "shrink-0"
						})
					]
				}, e.path))]
			}, e))
		}), /* @__PURE__ */ J("p", {
			className: "m-0 border-t border-border px-2 py-1.5 font-mono text-2xs leading-relaxed text-faint",
			title: N("Filters, and text mixed with data"),
			children: ["|date:M j, Y · |excerpt:120 · |upper · |default:Text · By ", "{entry.author}"]
		})]
	})] });
}
// admin/src/builder/fields/nodes.tsx
function pn({ field: e, ...t }) {
	let { store: r, types: i } = n(), a = S(r, (e) => e.nodes), o = Rt(a).filter(({ node: t }) => t.id !== e.exclude).map(({ node: e, depth: t }) => ({
		value: e.id,
		label: `${"  ".repeat(t)}${e.label || Ft(e, 28) || i.get(e.type)?.title || e.type}`
	}));
	return /* @__PURE__ */ q(w, {
		...t,
		field: {
			...e,
			type: "select",
			component: void 0,
			size: "sm",
			options: o,
			placeholder: e.placeholder ?? N("Choose an Element")
		}
	});
}
function mn({ field: e, value: t, onChange: n, disabled: r, context: i }) {
	let a = t ?? [], o = {
		handle: e.handle,
		type: "select",
		label: e.label,
		exclude: e.exclude
	};
	return /* @__PURE__ */ J("div", {
		className: "min-w-0 flex-1 space-y-1",
		children: [a.map((t, s) => /* @__PURE__ */ J("div", {
			className: "flex items-center gap-1",
			children: [/* @__PURE__ */ q(pn, {
				field: {
					...o,
					handle: `${e.handle}-${s}`
				},
				value: t,
				onChange: (e) => n(e ? a.map((t, n) => n === s ? e : t) : a.filter((e, t) => t !== s)),
				disabled: r,
				context: i
			}), /* @__PURE__ */ q(T, { onClick: () => n(a.filter((e, t) => t !== s)) })]
		}, s)), /* @__PURE__ */ J(W, {
			compact: !0,
			onClick: () => n([...a, e.addValue]),
			className: "text-xs text-muted hover:text-text",
			children: ["+ ", e.add ?? N("Element")]
		})]
	});
}
// admin/src/builder/fields/clip.tsx
var hn = [
	{
		id: "triangle",
		label: () => N("Triangle"),
		value: "polygon(50% 0%, 100% 100%, 0% 100%)"
	},
	{
		id: "rhombus",
		label: () => N("Rhombus"),
		value: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)"
	},
	{
		id: "pentagon",
		label: () => N("Pentagon"),
		value: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)"
	},
	{
		id: "hexagon",
		label: () => N("Hexagon"),
		value: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)"
	},
	{
		id: "arrow",
		label: () => N("Arrow"),
		value: "polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%)"
	},
	{
		id: "chevron",
		label: () => N("Chevron"),
		value: "polygon(75% 0%, 100% 50%, 75% 100%, 0% 100%, 25% 50%, 0% 0%)"
	},
	{
		id: "star",
		label: () => N("Star"),
		value: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"
	},
	{
		id: "message",
		label: () => N("Message||shape"),
		value: "polygon(0% 0%, 100% 0%, 100% 75%, 75% 75%, 75% 100%, 50% 75%, 0% 75%)"
	},
	{
		id: "slant",
		label: () => N("Slanted Edge"),
		value: "polygon(0 0, 100% 0, 100% 85%, 0 100%)"
	},
	{
		id: "wedge",
		label: () => N("Wedge"),
		value: "polygon(0 0, 100% 0, 100% 100%, 0 85%)"
	}
], gn = (e) => e.replace(/\s+/g, " ").replace(/\b0%/g, "0").trim();
function _n(e) {
	if (!e || e === "none") return "none";
	let t = e.match(/^(inset|circle|ellipse|polygon)\(/);
	return t ? t[1] : "custom";
}
var vn = (e, t) => e?.match(RegExp(`^${t}\\((.*)\\)$`))?.[1] ?? "";
function yn(e) {
	let [t, n] = vn(e, "inset").split(/\s+round\s+/), r = Ce(t || "0") ?? [
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
function bn(e, t) {
	let [n, r] = vn(e, t).split(/\s+at\s+/), i = f(n || ""), a = f(r || "50% 50%");
	return {
		rx: i[0] ?? "50%",
		ry: i[1] ?? i[0] ?? "50%",
		x: a[0] ?? "50%",
		y: a[1] ?? "50%"
	};
}
function xn({ field: e, value: t, onChange: n, context: r, disabled: i }) {
	let a = t ?? void 0, [s, c] = R(!1), l = s && a ? "custom" : _n(a), u = (t, n, r = {}) => ({
		handle: `${e.handle}-${t}`,
		type: "text",
		component: "blocks-value",
		label: n,
		...r
	}), d = (e) => {
		if (c(e === "custom"), e === "custom") return a ? void 0 : n("inset(0)");
		if (!e || e === "none") return n(null);
		if (e === "inset") return n("inset(0 round 12px)");
		if (e === "circle") return n("circle(50% at 50% 50%)");
		if (e === "ellipse") return n("ellipse(50% 40% at 50% 50%)");
		n(hn[0].value);
	}, f = yn(a), p = (e) => {
		let t = {
			...f,
			...e
		}, r = [
			t.top,
			t.right,
			t.bottom,
			t.left
		].map((e) => e || "0");
		n(`inset(${r.every((e) => e === r[0]) ? r[0] : r.join(" ")}${t.round ? ` round ${t.round}` : ""})`);
	}, m = l === "circle" || l === "ellipse" ? bn(a, l) : null, h = (e) => {
		let t = {
			...m,
			...e
		};
		n(l === "circle" ? `circle(${t.rx} at ${t.x} ${t.y})` : `ellipse(${t.rx} ${t.ry} at ${t.x} ${t.y})`);
	}, g = l === "polygon" ? hn.find((e) => gn(e.value) === gn(a)) : void 0;
	return /* @__PURE__ */ J("div", {
		className: "min-w-0 flex-1 space-y-1",
		children: [
			/* @__PURE__ */ q(w, {
				field: {
					handle: `${e.handle}-kind`,
					type: "select",
					size: "sm",
					label: e.label,
					placeholder: N("None"),
					options: [
						{
							value: "inset",
							label: N("Inset")
						},
						{
							value: "circle",
							label: N("Circle")
						},
						{
							value: "ellipse",
							label: N("Ellipse")
						},
						{
							value: "polygon",
							label: N("Shape")
						},
						{
							value: "custom",
							label: N("Custom")
						}
					]
				},
				value: l === "none" ? null : l,
				onChange: (e) => d(e),
				disabled: i,
				context: r
			}),
			l === "inset" && /* @__PURE__ */ J($t, { children: [/* @__PURE__ */ J(o, {
				className: "grid grid-cols-2 gap-1",
				children: [
					/* @__PURE__ */ q(w, {
						field: u("top", N("Top"), {
							prefix: "T",
							placeholder: "0",
							units: ["px", "%"]
						}),
						value: f.top,
						onChange: (e) => p({ top: e ?? "0" }),
						context: r
					}),
					/* @__PURE__ */ q(w, {
						field: u("right", N("Right"), {
							prefix: "R",
							placeholder: "0",
							units: ["px", "%"]
						}),
						value: f.right,
						onChange: (e) => p({ right: e ?? "0" }),
						context: r
					}),
					/* @__PURE__ */ q(w, {
						field: u("bottom", N("Bottom"), {
							prefix: "B",
							placeholder: "0",
							units: ["px", "%"]
						}),
						value: f.bottom,
						onChange: (e) => p({ bottom: e ?? "0" }),
						context: r
					}),
					/* @__PURE__ */ q(w, {
						field: u("left", N("Left"), {
							prefix: "L",
							placeholder: "0",
							units: ["px", "%"]
						}),
						value: f.left,
						onChange: (e) => p({ left: e ?? "0" }),
						context: r
					})
				]
			}), /* @__PURE__ */ q(w, {
				field: u("round", N("Corner Radius"), {
					prefix: "◜",
					placeholder: N("Corners"),
					group: "radius"
				}),
				value: f.round || null,
				onChange: (e) => p({ round: e ?? "" }),
				context: r
			})] }),
			m && /* @__PURE__ */ J(o, {
				className: "grid grid-cols-2 gap-1",
				children: [
					/* @__PURE__ */ q(w, {
						field: u("rx", N(l === "circle" ? "Radius" : "Width Radius"), {
							prefix: l === "circle" ? "R" : "W",
							unit: "%",
							units: ["%", "px"]
						}),
						value: m.rx,
						onChange: (e) => h({ rx: e ?? "50%" }),
						context: r
					}),
					l === "ellipse" ? /* @__PURE__ */ q(w, {
						field: u("ry", N("Height Radius"), {
							prefix: "H",
							unit: "%",
							units: ["%", "px"]
						}),
						value: m.ry,
						onChange: (e) => h({ ry: e ?? "50%" }),
						context: r
					}) : /* @__PURE__ */ q("span", {}),
					/* @__PURE__ */ q(w, {
						field: u("x", N("Center X"), {
							prefix: "X",
							unit: "%",
							units: ["%", "px"]
						}),
						value: m.x,
						onChange: (e) => h({ x: e ?? "50%" }),
						context: r
					}),
					/* @__PURE__ */ q(w, {
						field: u("y", N("Center Y"), {
							prefix: "Y",
							unit: "%",
							units: ["%", "px"]
						}),
						value: m.y,
						onChange: (e) => h({ y: e ?? "50%" }),
						context: r
					})
				]
			}),
			l === "polygon" && /* @__PURE__ */ q("div", {
				className: "grid grid-cols-5 gap-1",
				children: hn.map((e) => /* @__PURE__ */ q(W, {
					compact: !0,
					title: e.label(),
					"aria-label": e.label(),
					"aria-pressed": g?.id === e.id,
					onClick: () => n(e.value),
					className: G("grid aspect-square place-items-center rounded-xs border", g?.id === e.id ? "border-focus bg-focus/8" : "border-border hover:bg-hover"),
					children: /* @__PURE__ */ q("span", {
						className: G("size-4", g?.id === e.id ? "bg-focus" : "bg-muted"),
						style: { clipPath: e.value }
					})
				}, e.id))
			}),
			(l === "custom" || l === "polygon" && !g) && /* @__PURE__ */ q(w, {
				field: u("raw", e.label, {
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
var Sn = () => [
	{
		value: "=",
		label: N("is")
	},
	{
		value: "!=",
		label: N("is not")
	},
	{
		value: "contains",
		label: N("contains")
	},
	{
		value: ">",
		label: N("is more than")
	},
	{
		value: "<",
		label: N("is less than")
	},
	{
		value: "not null",
		label: N("is set")
	},
	{
		value: "null",
		label: N("is empty")
	}
];
function Cn({ field: e, value: t, onChange: n, disabled: r, context: i }) {
	let a = Array.isArray(t) ? t : [], o = (e) => n(e.length ? e : null), s = (e, t) => o(a.map((n, r) => r === e ? {
		...n,
		...t
	} : n));
	return /* @__PURE__ */ J("div", {
		className: "min-w-0 flex-1 space-y-1",
		children: [a.map((t, n) => /* @__PURE__ */ J("div", {
			className: "flex items-center gap-1",
			children: [
				/* @__PURE__ */ q(w, {
					field: {
						handle: `${e.handle}-${n}-field`,
						type: "text",
						size: "sm",
						commit: "blur",
						label: N("Field"),
						placeholder: N("Field"),
						mono: !0,
						className: "!w-[34%] !flex-none"
					},
					value: t.field ?? null,
					onChange: (e) => s(n, { field: String(e ?? "").trim() }),
					disabled: r,
					context: i
				}),
				/* @__PURE__ */ q(w, {
					field: {
						handle: `${e.handle}-${n}-op`,
						type: "select",
						size: "sm",
						required: !0,
						label: N("Comparison"),
						options: Sn(),
						className: "!flex-none w-[92px]"
					},
					value: t.op ?? "=",
					onChange: (e) => s(n, { op: String(e ?? "=") }),
					disabled: r,
					context: i
				}),
				!["null", "not null"].includes(t.op ?? "") && /* @__PURE__ */ q(w, {
					field: {
						handle: `${e.handle}-${n}-value`,
						type: "text",
						size: "sm",
						commit: "blur",
						label: N("Value"),
						placeholder: N("Value")
					},
					value: t.value === void 0 || t.value === null ? null : String(t.value),
					onChange: (e) => s(n, { value: e ?? "" }),
					disabled: r,
					context: i
				}),
				/* @__PURE__ */ q(T, {
					label: N("Remove Condition"),
					onClick: () => o(a.filter((e, t) => t !== n))
				})
			]
		}, n)), /* @__PURE__ */ J(W, {
			compact: !0,
			disabled: r,
			onClick: () => o([...a, {
				field: "",
				op: "=",
				value: ""
			}]),
			className: "-ml-2 inline-flex h-7 items-center gap-1.5 rounded-sm px-2 text-xs text-muted hover:bg-hover hover:text-ink",
			children: [/* @__PURE__ */ q(V, {
				name: "plus",
				size: 13
			}), N("Add Condition")]
		})]
	});
}
// admin/src/builder/fields/inlineText.tsx
function wn({ field: e, value: t, onChange: n, disabled: r }) {
	let i = L(null);
	return I(() => {
		i.current && i.current.innerHTML !== (t ?? "") && document.activeElement !== i.current && (i.current.innerHTML = t ?? "");
	}, [t]), /* @__PURE__ */ q("div", {
		ref: i,
		id: K(e),
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
		className: G(ze, "cursor-text overflow-hidden whitespace-nowrap leading-[26px] outline-none [&_*]:inline empty:before:text-ghost empty:before:content-[attr(data-placeholder)]")
	});
}
// admin/src/builder/fields/shadows.tsx
var Tn = /^-?[\d.]+(px|rem|em)?$/;
function En(e) {
	return !e || e === "none" ? [] : /^var\(--[\w-]+\)$/.test(e.trim()) ? null : m(e).map((e) => {
		let t = f(e), n = t.includes("inset"), r = t.filter((e) => e !== "inset"), i = r.filter((e) => Tn.test(e)), a = r.find((e) => !Tn.test(e)) ?? "rgb(0 0 0 / 15%)";
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
function Y(e, t = !1) {
	return e.length ? e.map((e) => t ? `${e.x} ${e.y} ${e.blur} ${e.color}` : `${e.inset ? "inset " : ""}${e.x} ${e.y} ${e.blur} ${e.spread} ${e.color}`).join(", ") : null;
}
var Dn = {
	inset: !1,
	x: "0px",
	y: "8px",
	blur: "24px",
	spread: "-8px",
	color: "rgb(0 0 0 / 18%)"
}, On = {
	inset: !1,
	x: "0px",
	y: "1px",
	blur: "2px",
	spread: "0",
	color: "rgb(0 0 0 / 25%)"
}, kn = (e) => e.replace(/px$/, "");
function An({ field: e, value: t, onChange: n, context: r }) {
	let a = e.kind === "text", o = a ? void 0 : e.group ?? "shadow", s = ce(), c = Et(), [l, u] = R(null), d = s(t), f = En(t) ?? [], p = (e) => n(Y(e, a));
	return /* @__PURE__ */ J("div", {
		className: "min-w-0 flex-1",
		children: [
			/* @__PURE__ */ J("div", {
				className: "group/value flex h-7 items-center gap-2",
				children: [
					/* @__PURE__ */ q(dt, { field: e }),
					/* @__PURE__ */ q("span", {
						className: "min-w-0 flex-1 truncate text-xs text-faint",
						children: !d && !f.length && typeof e.placeholder == "string" ? e.placeholder : ""
					}),
					o && /* @__PURE__ */ q(ge, {
						group: o,
						value: t,
						onPick: n,
						active: !!d,
						className: "size-6"
					}),
					!d && /* @__PURE__ */ q(i, {
						label: N(a ? "Add Text Shadow" : "Add Shadow"),
						onClick: () => {
							p([...f, a ? On : Dn]), u(f.length);
						}
					})
				]
			}),
			d && /* @__PURE__ */ J("div", {
				className: "flex h-7 items-center gap-2 pl-[88px]",
				children: [
					/* @__PURE__ */ q("span", {
						className: "size-4 shrink-0 rounded-xs border border-border bg-bg",
						style: { boxShadow: c(d.token.value) }
					}),
					/* @__PURE__ */ q(g, {
						token: d.token,
						className: "text-xs"
					}),
					/* @__PURE__ */ q("span", { className: "flex-1" }),
					/* @__PURE__ */ q(T, {
						label: N("Remove Shadow"),
						onClick: () => n(null)
					})
				]
			}),
			f.map((e, t) => /* @__PURE__ */ J("div", {
				className: "flex h-7 items-center gap-1 pl-[88px]",
				children: [/* @__PURE__ */ J(U, {
					open: l === t,
					onOpenChange: (e) => u(e ? t : null),
					align: "end",
					className: "w-64 !p-2",
					trigger: /* @__PURE__ */ J(W, {
						compact: !0,
						className: G("flex h-7 min-w-0 flex-1 items-center gap-1.5 rounded-sm px-1.5 text-left text-xs hover:bg-hover", l === t && "bg-active"),
						children: [
							a ? /* @__PURE__ */ q("span", {
								className: "grid size-4 shrink-0 place-items-center text-2xs font-semibold text-text",
								style: { textShadow: c(Y([e], !0) ?? "") },
								children: "A"
							}) : /* @__PURE__ */ q("span", {
								className: "size-4 shrink-0 rounded-xs border border-border bg-bg",
								style: { boxShadow: c(Y([{
									...e,
									x: X(e.x),
									y: X(e.y),
									blur: X(e.blur),
									spread: X(e.spread)
								}]) ?? "") }
							}),
							/* @__PURE__ */ q("span", {
								className: "min-w-0 flex-1 truncate font-mono tabular-nums text-muted",
								children: [
									e.x,
									e.y,
									e.blur,
									...a ? [] : [e.spread]
								].map(kn).join(" ")
							}),
							e.inset && /* @__PURE__ */ q("span", {
								className: "rounded-xs bg-sunken px-1 text-2xs text-muted",
								children: N("Inside")
							})
						]
					}),
					children: [/* @__PURE__ */ q("p", {
						className: "m-0 mb-2 text-xs font-semibold text-ink",
						children: N(a ? "Text Shadow" : "Shadow")
					}), /* @__PURE__ */ q(qe, {
						context: r,
						fields: [
							!a && {
								handle: "inset",
								type: "select",
								display: "segmented",
								block: !0,
								size: "sm",
								required: !0,
								label: N("Type"),
								options: [{
									value: "outside",
									label: N("Outside")
								}, {
									value: "inside",
									label: N("Inside")
								}]
							},
							{
								handle: "x",
								type: "text",
								component: "blocks-value",
								label: N("X Offset"),
								prefix: "X",
								placeholder: "0"
							},
							{
								handle: "y",
								type: "text",
								component: "blocks-value",
								label: N("Y Offset"),
								prefix: "Y",
								placeholder: "0"
							},
							{
								handle: "blur",
								type: "text",
								component: "blocks-value",
								label: N("Blur"),
								min: 0,
								prefixIcon: "shadow",
								placeholder: "0"
							},
							!a && {
								handle: "spread",
								type: "text",
								component: "blocks-value",
								label: N("Spread"),
								prefixIcon: "arrows-out-simple",
								placeholder: "0"
							},
							{
								handle: "color",
								type: "color",
								component: "blocks-color",
								label: N("Color")
							}
						].filter(Boolean),
						values: {
							...e,
							inset: e.inset ? "inside" : "outside"
						},
						onChange: (e, n) => p(f.map((r, i) => i === t ? {
							...r,
							[e]: e === "inset" ? n === "inside" : n ?? (e === "color" ? "transparent" : "0")
						} : r))
					})]
				}), /* @__PURE__ */ q(T, {
					label: N("Remove Shadow"),
					onClick: () => p(f.filter((e, n) => n !== t))
				})]
			}, t))
		]
	});
}
function X(e) {
	let t = parseFloat(e);
	return Number.isNaN(t) ? e : `${Math.max(-4, Math.min(4, t / 4))}px`;
}
// admin/src/builder/fields/spacing.tsx
var jn = /^(-?\d*\.?\d+)([a-z%]*)$/i;
function Mn(e, t) {
	return t.shiftKey ? [
		0,
		1,
		2,
		3
	] : t.altKey ? [e, (e + 2) % 4] : [e];
}
function Z(e, t) {
	if (t.length === 4) return N(e === "margin" ? "Margin, All Sides" : "Padding, All Sides");
	if (t.length === 2) return t.includes(0) ? N(e === "margin" ? "Margin, Top and Bottom" : "Padding, Top and Bottom") : N(e === "margin" ? "Margin, Left and Right" : "Padding, Left and Right");
	let n = {
		0: N("top"),
		1: N("right"),
		2: N("bottom"),
		3: N("left")
	}[t[0]];
	return N(e === "margin" ? "Margin {side}" : "Padding {side}", { side: n });
}
function Nn({ field: e, value: t, onChange: n, context: r }) {
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
	}), c = (e, t) => /* @__PURE__ */ q(Pn, {
		box: e,
		index: t,
		value: o(e)[t],
		status: a[e]?.[t] ?? "none",
		onChange: (t, n) => s(e, t, n),
		context: r
	}, `${e}${t}`);
	return /* @__PURE__ */ q("div", {
		className: "min-w-0 flex-1 select-none",
		children: /* @__PURE__ */ J("div", {
			className: "relative grid grid-cols-[44px_1fr_44px] grid-rows-[24px_auto_24px] rounded-md bg-active/60",
			children: [
				/* @__PURE__ */ q("span", {
					className: "pointer-events-none absolute left-2 top-1 text-2xs text-faint",
					children: N("Margin")
				}),
				/* @__PURE__ */ q("span", {}),
				c("margin", 0),
				/* @__PURE__ */ q("span", {}),
				c("margin", 3),
				/* @__PURE__ */ J("div", {
					className: "relative grid grid-cols-[44px_1fr_44px] grid-rows-[24px_20px_24px] rounded-sm bg-bg ring-1 ring-border",
					children: [
						/* @__PURE__ */ q("span", {
							className: "pointer-events-none absolute left-2 top-1 text-2xs text-faint",
							children: N("Padding")
						}),
						/* @__PURE__ */ q("span", {}),
						c("padding", 0),
						/* @__PURE__ */ q("span", {}),
						c("padding", 3),
						/* @__PURE__ */ q("span", { className: "my-1 rounded-xs bg-active" }),
						c("padding", 1),
						/* @__PURE__ */ q("span", {}),
						c("padding", 2),
						/* @__PURE__ */ q("span", {})
					]
				}),
				c("margin", 1),
				/* @__PURE__ */ q("span", {}),
				c("margin", 2),
				/* @__PURE__ */ q("span", {})
			]
		})
	});
}
function Pn({ box: e, index: t, value: n, status: r, onChange: i, context: a }) {
	let o = ce(), [s, c] = R(!1), [l, u] = R([t]), [d, f] = R(!1), p = o(n), m = n?.match(jn), h = p ? p.token.name : m ? m[2] === "px" || !m[2] ? m[1] : `${m[1]}${m[2]}` : n ?? "0";
	return /* @__PURE__ */ q(U, {
		open: s,
		onOpenChange: c,
		align: "center",
		className: "w-64 !p-3",
		trigger: /* @__PURE__ */ q(W, {
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
					i(Mn(t, n), `${e === "padding" ? Math.max(0, u) : u}${s}`);
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
			onClick: (e) => u(Mn(t, e)),
			"aria-label": Z(e, [t]),
			title: `${Z(e, [t])}${p ? ` · ${p.token.variable}` : ""}\n${N("Drag to change. Alt: opposite side too, Shift: all sides.")}`,
			className: G("mx-auto flex h-full min-w-0 max-w-full items-center justify-center rounded-xs px-1 text-xs tabular-nums outline-none transition-colors focus-visible:ring-2 focus-visible:ring-focus", t % 2 ? "cursor-ew-resize" : "cursor-ns-resize", r === "none" ? "text-faint" : "text-ink", s || d ? "bg-active" : "hover:bg-hover"),
			children: /* @__PURE__ */ q("span", {
				className: G("truncate", r !== "none" && "rounded-xs px-1 leading-4", r === "own" ? "bg-focus-soft" : r === "inherited" && "bg-active"),
				children: h
			})
		}),
		children: /* @__PURE__ */ q(Fn, {
			box: e,
			sides: l,
			value: n,
			onChange: (e) => i(l, e),
			close: () => c(!1),
			context: a
		})
	});
}
function Fn({ box: e, sides: t, value: n, onChange: r, close: i, context: a }) {
	let o = L(null);
	I(() => {
		(o.current?.querySelector("input"))?.focus();
	}, []);
	let s = (e) => {
		r(e), i();
	};
	return /* @__PURE__ */ J("div", {
		ref: o,
		onKeyDown: (e) => {
			e.key === "Enter" && requestAnimationFrame(i);
		},
		children: [
			/* @__PURE__ */ J("div", {
				className: "mb-2 flex h-6 items-center justify-between gap-2",
				children: [/* @__PURE__ */ q("span", {
					className: "min-w-0 truncate text-xs font-semibold text-ink",
					children: Z(e, t)
				}), n !== void 0 && /* @__PURE__ */ q(z, {
					variant: "ghost",
					size: "xs",
					onClick: () => s(null),
					className: "shrink-0 !px-1.5 !font-normal !text-muted hover:!text-ink",
					children: N("Reset")
				})]
			}),
			/* @__PURE__ */ q(w, {
				field: {
					handle: `${e}-${t.join("")}`,
					type: "text",
					component: "blocks-value",
					label: Z(e, t),
					placeholder: "0",
					keywords: e === "margin" ? ["auto"] : [],
					min: e === "padding" ? 0 : void 0
				},
				value: n ?? null,
				onChange: (e) => r(e),
				context: a
			}),
			/* @__PURE__ */ q("div", {
				className: "mt-3",
				children: /* @__PURE__ */ q(fe, {
					value: n,
					onPick: s,
					auto: e === "margin"
				})
			})
		]
	});
}
// admin/src/builder/fields/index.ts
function In() {
	let e = {
		"blocks-value": ue,
		"blocks-color": Xe,
		"blocks-bind": fn,
		"blocks-node": pn,
		"blocks-nodes": mn,
		"blocks-group": me,
		"blocks-pairs": rt,
		"blocks-shadows": An,
		"blocks-gradient": st,
		"blocks-align": mt,
		"blocks-origin": Ze,
		"blocks-spacing": Nn,
		"blocks-filters": Ot,
		"blocks-clip": xn,
		"blocks-conditions": Cn,
		"blocks-inline-text": wn
	};
	for (let [t, n] of Object.entries(e)) M.fields.set(t, n);
}
// admin/src/builder/icons.ts
var Q = "<rect x=\"44\" y=\"44\" width=\"168\" height=\"168\" rx=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"14\" stroke-dasharray=\"18 18\" opacity=\".4\"/>", Ln = {
	"b-side-all": "<rect x=\"44\" y=\"44\" width=\"168\" height=\"168\" rx=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"18\"/>",
	"b-side-top": Q + "<path d=\"M44 44h168\" stroke=\"currentColor\" stroke-width=\"22\" stroke-linecap=\"round\"/>",
	"b-side-right": Q + "<path d=\"M212 44v168\" stroke=\"currentColor\" stroke-width=\"22\" stroke-linecap=\"round\"/>",
	"b-side-bottom": Q + "<path d=\"M44 212h168\" stroke=\"currentColor\" stroke-width=\"22\" stroke-linecap=\"round\"/>",
	"b-side-left": Q + "<path d=\"M44 44v168\" stroke=\"currentColor\" stroke-width=\"22\" stroke-linecap=\"round\"/>"
};
function Rn() {
	for (let [e, t] of Object.entries(Ln)) M.icons.get(e) || M.icons.set(e, t);
}
// admin/src/builder/content/IconField.tsx
var zn = [
	"regular",
	"bold",
	"fill",
	"light"
], Bn = (e) => ({
	regular: N("Regular"),
	bold: N("Bold"),
	fill: N("Fill||weight"),
	light: N("Light||weight")
})[e], Vn = (e) => {
	let t = e.match(/^(.*)-(bold|fill|light)$/);
	return t ? {
		base: t[1],
		weight: t[2]
	} : {
		base: e,
		weight: "regular"
	};
};
function Hn({ field: e, value: t, onChange: n, disabled: r }) {
	let [i, a] = R(!1), [o, s] = R(""), [c, l] = R(""), u = (t ?? "").replace(/^ph:/, ""), { base: d, weight: f } = Vn(u), p = P("blocks/icons", {
		query: d,
		limit: 1
	}, {
		enabled: !!d,
		staleTime: Infinity
	}), m = P("blocks/icons", {
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
	return /* @__PURE__ */ J("div", {
		className: "group/icon relative min-w-0 flex-1",
		children: [/* @__PURE__ */ J(U, {
			open: i,
			onOpenChange: (e) => !r && a(e),
			className: "w-[284px] !p-0",
			trigger: /* @__PURE__ */ J(W, {
				id: K(e),
				disabled: r,
				"aria-label": e.label,
				className: G("cms-input flex h-7 w-full min-w-0 items-center gap-2 rounded-sm px-2 text-left text-sm disabled:opacity-50", u && "pr-6"),
				children: [
					u && h ? /* @__PURE__ */ q("span", {
						className: "grid size-3.5 shrink-0 place-items-center text-text [&_svg]:size-3.5",
						dangerouslySetInnerHTML: { __html: h.svg }
					}) : /* @__PURE__ */ q(V, {
						name: "star",
						size: 14,
						className: "shrink-0 text-faint"
					}),
					/* @__PURE__ */ q("span", {
						className: G("min-w-0 flex-1 truncate", !u && "text-ghost"),
						children: u ? d : e.placeholder || N("Choose an Icon")
					}),
					u && f !== "regular" && /* @__PURE__ */ q("span", {
						className: "shrink-0 text-faint",
						children: Bn(f)
					})
				]
			}),
			children: [
				/* @__PURE__ */ J("div", {
					className: "flex h-10 items-center gap-2 border-b border-border px-3",
					children: [
						/* @__PURE__ */ q(V, {
							name: "search",
							size: 14,
							className: "shrink-0 text-faint"
						}),
						/* @__PURE__ */ q("input", {
							autoFocus: !0,
							value: o,
							onChange: (e) => s(e.target.value),
							placeholder: N("Search Icons"),
							"aria-label": N("Search Icons"),
							spellCheck: !1,
							className: "h-full min-w-0 flex-1 bg-transparent text-sm text-text outline-none placeholder:text-faint"
						}),
						m.isFetching && /* @__PURE__ */ q(Qt, { size: 12 })
					]
				}),
				/* @__PURE__ */ q("div", {
					className: "border-b border-border p-1.5",
					children: /* @__PURE__ */ q(Zt, {
						size: "xs",
						block: !0,
						value: f,
						onChange: (e) => u ? g(d, e) : void 0,
						options: zn.map((e) => ({
							value: e,
							label: Bn(e)
						}))
					})
				}),
				/* @__PURE__ */ J("div", {
					className: "grid max-h-64 grid-cols-8 gap-0.5 overflow-y-auto p-1.5",
					role: "listbox",
					"aria-label": N("Icons"),
					children: [(m.data ?? []).map((e) => /* @__PURE__ */ q(W, {
						role: "option",
						"aria-selected": e.name === d,
						title: e.name,
						onClick: () => {
							g(e.name), a(!1);
						},
						className: G("grid aspect-square place-items-center rounded-xs text-text hover:bg-hover [&_svg]:size-4", e.name === d && "bg-focus-soft text-focus"),
						dangerouslySetInnerHTML: { __html: e.svg }
					}, e.name)), !m.isFetching && m.data?.length === 0 && /* @__PURE__ */ q("p", {
						className: "col-span-8 m-0 py-6 text-center text-xs text-faint",
						children: N("No matches")
					})]
				})
			]
		}), u && !r && /* @__PURE__ */ q(W, {
			onClick: () => n(null),
			"aria-label": N("Remove Icon"),
			className: "absolute right-1 top-1/2 grid size-5 -translate-y-1/2 place-items-center rounded-xs text-faint opacity-0 hover:bg-hover hover:text-text focus-visible:opacity-100 group-hover/icon:opacity-100",
			children: /* @__PURE__ */ q(V, {
				name: "close",
				size: 12
			})
		})]
	});
}
// admin/src/write/Blocks.tsx
function Un() {
	return /* @__PURE__ */ q("hr", { className: "my-3 border-0 border-t border-border-strong" });
}
function Wn({ nodes: e }) {
	let { store: t, types: r, allowed: i } = n(), { readOnly: a } = d(), o = e[e.length - 1];
	return /* @__PURE__ */ J("div", {
		className: "group/actions flex flex-wrap items-center gap-x-3 gap-y-2 py-1",
		children: [e.map((e) => /* @__PURE__ */ q(Kn, { node: e }, e.id)), !a && o.type === "button" && r.has("button") && /* @__PURE__ */ q(H, {
			icon: "plus",
			label: N("Add a Button"),
			size: "xs",
			className: "opacity-0 transition-opacity group-hover/actions:opacity-100 focus-visible:opacity-100",
			onClick: () => {
				let e = t.get().nodes, n = A(e, o.id, "button", r, i), a = r.get("button");
				if (!n || !a) return;
				let s = Vt(a, {
					label: "",
					variant: o.type === "button" && (o.props.variant ?? "primary") === "primary" ? "secondary" : o.props.variant ?? "primary"
				}, r);
				t.insert(n.parentId, n.index, [s]), t.focus(s.id, "end", "label");
			}
		})]
	});
}
var Gn = {
	primary: "h-9 rounded-md bg-ink px-4 text-ink-contrast",
	secondary: "h-9 rounded-md border border-border-strong bg-bg px-4 text-text",
	ghost: "h-9 rounded-md px-3 text-text bg-sunken/60",
	link: "h-9 text-text underline decoration-border-strong underline-offset-4"
};
function Kn({ node: e }) {
	let { store: t } = n(), { readOnly: r } = d(), [i, a] = R(!1), o = S(t, (t) => t.focus?.id === e.id && t.focus.prop === "label" ? t.focus : null), s = e.type === "link", c = String(e.props.url ?? ""), l = s ? Gn.link : Gn[e.props.variant ?? "primary"] ?? Gn.primary, u = he(), f = [
		h({
			handle: "url",
			label: N("Link"),
			placeholder: N("Paste a link or search pages"),
			autofocus: !c,
			anchors: u
		}),
		...s ? [] : [{
			handle: "variant",
			type: "select",
			label: N("Style"),
			display: "segmented",
			block: !0,
			options: [
				{
					value: "primary",
					label: N("Primary")
				},
				{
					value: "secondary",
					label: N("Secondary")
				},
				{
					value: "ghost",
					label: N("Ghost")
				},
				{
					value: "link",
					label: N("Text")
				}
			]
		}],
		{
			handle: "new_tab",
			type: "toggle",
			label: N("Open in New Tab")
		}
	];
	return /* @__PURE__ */ J("span", {
		className: "group/action relative inline-flex",
		children: [
			/* @__PURE__ */ q("span", {
				className: G("inline-flex items-center text-sm font-medium", l),
				children: /* @__PURE__ */ q(p, {
					html: String(e.props.label ?? ""),
					singleLine: !0,
					quiet: !0,
					disabled: r,
					placeholder: N(s ? "Link Text" : "Button Text"),
					className: "min-w-8 whitespace-nowrap",
					focus: o,
					onChange: (n) => t.updateProps(e.id, { label: n }),
					onFocus: () => t.get().selected !== e.id && t.select(e.id),
					onKeyDown: (n, r) => {
						(n.key === "Enter" || n.key === "Escape") && (n.preventDefault(), r.blur(), n.key === "Escape" && t.select(e.id, !0));
					}
				})
			}),
			!c && /* @__PURE__ */ q("span", {
				className: "pointer-events-none absolute -right-0.5 -top-0.5 size-2 rounded-full bg-warning ring-2 ring-bg",
				title: N("No link yet")
			}),
			!r && /* @__PURE__ */ q(U, {
				open: i,
				onOpenChange: a,
				align: "start",
				className: "w-80 !p-3",
				trigger: /* @__PURE__ */ q(W, {
					"aria-label": N("Edit Link"),
					title: c || N("Add a Link"),
					className: G("absolute -right-2.5 -top-2.5 grid size-6 place-items-center rounded-full border border-border bg-bg text-muted shadow-pop transition-opacity hover:text-text", i ? "opacity-100" : "opacity-0 group-hover/action:opacity-100 focus-visible:opacity-100"),
					children: /* @__PURE__ */ q(V, {
						name: "link",
						size: 12
					})
				}),
				children: /* @__PURE__ */ J("div", {
					className: "space-y-3",
					onKeyDown: (e) => e.key === "Enter" && !e.defaultPrevented && e.target.tagName === "INPUT" && a(!1),
					children: [/* @__PURE__ */ q(B, {
						fields: f,
						values: e.props,
						onChange: (n, r) => (n !== "variant" || r) && t.updateProps(e.id, { [n]: r ?? (n === "url" ? "" : r) }, `${n}:${e.id}`),
						className: "!gap-y-3"
					}), /* @__PURE__ */ q("div", {
						className: "flex justify-end border-t border-border pt-2.5",
						children: /* @__PURE__ */ q(z, {
							size: "xs",
							variant: "ghost",
							icon: "trash",
							onClick: () => {
								a(!1), t.remove(e.id);
							},
							children: N(s ? "Remove Link" : "Remove Button")
						})
					})]
				})
			})
		]
	});
}
function qn(e) {
	let t = Array.isArray(e) ? e[0] : e, n = typeof t == "string" && /^(https?:|\/)/.test(t), r = P("media/get-many", { ids: [t] }, {
		enabled: typeof t == "string" && !n && t.length > 0,
		staleTime: 3e5,
		retry: !1
	});
	if (n) return t;
	let i = r.data?.items?.[0];
	return i ? i.url ?? i.thumb : null;
}
function Jn({ node: e }) {
	let { store: t } = n(), { settings: r, readOnly: i } = d(), a = qn(e.props.image);
	return /* @__PURE__ */ J("figure", {
		className: "cms-block-figure m-0 py-1",
		children: [a ? /* @__PURE__ */ J("div", {
			className: "group/image relative",
			children: [
				/* @__PURE__ */ q("img", {
					src: a,
					alt: e.props.alt ?? "",
					className: "block max-h-[520px] w-full rounded-md bg-sunken object-cover",
					style: e.props.aspect && e.props.aspect !== "auto" ? { aspectRatio: e.props.aspect } : void 0
				}),
				!i && /* @__PURE__ */ q("div", {
					className: "absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover/image:opacity-100",
					children: /* @__PURE__ */ q(z, {
						size: "xs",
						variant: "secondary",
						icon: "settings",
						onClick: () => r(e.id),
						children: N("Edit")
					})
				}),
				!e.props.alt && !i && /* @__PURE__ */ q("span", {
					className: "absolute bottom-2 left-2 rounded-xs bg-bg/90 px-1.5 py-0.5 text-2xs text-muted opacity-0 shadow-pop transition-opacity group-hover/image:opacity-100",
					children: N("No alt text")
				})
			]
		}) : /* @__PURE__ */ J("div", {
			className: "flex h-36 flex-col items-center justify-center gap-3 rounded-md bg-surface text-faint",
			children: [/* @__PURE__ */ q(V, {
				name: "image",
				size: 22
			}), /* @__PURE__ */ q(B, {
				bare: !0,
				disabled: i,
				fields: [{
					handle: "image",
					type: "media",
					label: N("Image"),
					max: 1,
					accept: "image/*"
				}],
				values: { image: e.props.image },
				onChange: (n, r) => t.updateProps(e.id, { image: r })
			})]
		}), /* @__PURE__ */ q(Yn, { node: e })]
	});
}
function Yn({ node: e }) {
	let { store: t } = n(), { readOnly: r } = d(), i = S(t, (t) => t.focus?.id === e.id && t.focus.prop === "caption" ? t.focus : null);
	return r && !e.props.caption ? null : /* @__PURE__ */ q("figcaption", { children: /* @__PURE__ */ q(p, {
		html: String(e.props.caption ?? ""),
		quiet: !0,
		disabled: r,
		placeholder: N("Add a Caption"),
		focus: i,
		className: "mt-2 text-sm text-muted",
		onChange: (n) => t.updateProps(e.id, { caption: n }),
		onFocus: () => t.select(e.id)
	}) });
}
function Xn(e) {
	let t = (Array.isArray(e) ? e : e ? [e] : []).filter((e) => typeof e == "string" && e !== ""), n = t.filter((e) => !/^(https?:|\/)/.test(e)), r = P("media/get-many", { ids: n }, {
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
function Zn({ node: e, type: t }) {
	let { settings: n } = d(), [r] = Xn(e.props.file), i = String(e.props.url ?? ""), a = i ? i.replace(/^https?:\/\/(www\.)?/, "").split(/[/?#]/)[0] : "", o = {
		video: N("Add a video"),
		audio: N("Add audio"),
		file: N("Add a file")
	}[e.type] ?? N("Add a link to embed"), s = r ? r.name || r.filename : "", c = e.props.title || e.props.label || s || a || o, l = (e.props.title || e.props.label) && (s || a);
	return /* @__PURE__ */ J("figure", {
		className: "cms-block-figure m-0 py-1",
		children: [/* @__PURE__ */ J(W, {
			onClick: () => n(e.id),
			className: "flex h-14 w-full items-center gap-3 rounded-md bg-surface px-4 text-left hover:bg-hover",
			children: [/* @__PURE__ */ q(V, {
				name: t?.icon ?? "embed",
				size: 18,
				className: "text-muted"
			}), /* @__PURE__ */ J("span", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ q("span", {
					className: "block truncate text-sm text-text",
					children: c
				}), l && /* @__PURE__ */ q("span", {
					className: "block truncate text-xs text-faint",
					children: l
				})]
			})]
		}), t?.inline?.includes("caption") && /* @__PURE__ */ q(Yn, { node: e })]
	});
}
function Qn({ node: e, type: t }) {
	let { settings: n } = d(), r = Xn(e.props.images);
	return /* @__PURE__ */ q("div", {
		className: "py-1",
		children: /* @__PURE__ */ q(W, {
			onClick: () => n(e.id),
			className: "block w-full rounded-md bg-surface p-2 text-left hover:bg-hover",
			children: r.length ? /* @__PURE__ */ q("span", {
				className: "grid grid-cols-4 gap-1.5 sm:grid-cols-6",
				children: r.slice(0, 12).map((e) => e.thumb ? /* @__PURE__ */ q("img", {
					src: e.thumb,
					alt: "",
					className: "aspect-square w-full rounded-xs object-cover"
				}, e.id) : /* @__PURE__ */ q("span", { className: "aspect-square rounded-xs bg-sunken" }, e.id))
			}) : /* @__PURE__ */ J("span", {
				className: "flex h-10 items-center gap-3 px-2 text-sm text-faint",
				children: [/* @__PURE__ */ q(V, {
					name: t?.icon ?? "media",
					size: 18
				}), N("Add images")]
			})
		})
	});
}
function $n({ node: e }) {
	let { store: t } = n(), { settings: r, readOnly: i } = d();
	return /* @__PURE__ */ J("div", {
		className: "group/code relative py-1",
		onFocus: () => t.select(e.id),
		children: [/* @__PURE__ */ q(B, {
			bare: !0,
			disabled: i,
			fields: [{
				handle: "code",
				type: "code",
				label: N("Code"),
				placeholder: N("Code"),
				rows: 3,
				language: e.props.language
			}],
			values: { code: e.props.code ?? "" },
			onChange: (n, r) => t.updateProps(e.id, { code: r ?? "" }, `code:${e.id}`)
		}), /* @__PURE__ */ q(W, {
			onClick: () => r(e.id),
			className: "absolute right-2 top-2.5 rounded-xs px-1.5 font-mono text-2xs text-faint hover:bg-hover hover:text-text",
			children: e.props.language && e.props.language !== "plain" ? e.props.language : N("Plain Text")
		})]
	});
}
function er({ node: e }) {
	let { store: t } = n(), { readOnly: r } = d(), i = Array.isArray(e.props.rows) && e.props.rows.length ? e.props.rows : [["", ""], ["", ""]], a = Math.max(...i.map((e) => e.length)), o = (n, r, o) => t.updateProps(e.id, { rows: i.map((e, t) => t === n ? Array.from({ length: a }, (t, n) => n === r ? o : e[n] ?? "") : e) }, `table:${e.id}`), s = (n) => t.updateProps(e.id, { rows: n });
	return /* @__PURE__ */ J("div", {
		className: "group/table py-1",
		children: [/* @__PURE__ */ q("div", {
			className: "overflow-x-auto rounded-md border border-border",
			children: /* @__PURE__ */ q("table", {
				className: "w-full border-collapse text-sm",
				children: /* @__PURE__ */ q("tbody", { children: i.map((n, i) => /* @__PURE__ */ q("tr", {
					className: G("border-b border-border last:border-b-0", i === 0 && e.props.header !== !1 && "bg-surface font-medium"),
					children: Array.from({ length: a }, (a, s) => /* @__PURE__ */ q("td", {
						className: "min-w-24 border-r border-border px-3 py-2 align-top last:border-r-0",
						children: /* @__PURE__ */ q(p, {
							html: n[s] ?? "",
							singleLine: !0,
							disabled: r,
							onChange: (e) => o(i, s, e),
							onFocus: () => t.select(e.id)
						})
					}, s))
				}, i)) })
			})
		}), !r && /* @__PURE__ */ J("div", {
			className: "mt-1 flex gap-1 opacity-0 transition-opacity group-hover/table:opacity-100 group-focus-within/table:opacity-100",
			children: [
				/* @__PURE__ */ q(z, {
					size: "xs",
					variant: "ghost",
					icon: "plus",
					onClick: () => s([...i, Array(a).fill("")]),
					children: N("Row")
				}),
				/* @__PURE__ */ q(z, {
					size: "xs",
					variant: "ghost",
					icon: "plus",
					onClick: () => s(i.map((e) => [...e, ""])),
					children: N("Column")
				}),
				i.length > 1 && /* @__PURE__ */ q(z, {
					size: "xs",
					variant: "ghost",
					icon: "minus",
					onClick: () => s(i.slice(0, -1)),
					children: N("Row")
				}),
				a > 1 && /* @__PURE__ */ q(z, {
					size: "xs",
					variant: "ghost",
					icon: "minus",
					onClick: () => s(i.map((e) => e.slice(0, a - 1))),
					children: N("Column")
				})
			]
		})]
	});
}
function tr({ node: e }) {
	let { store: t } = n(), { readOnly: r } = d(), i = Array.isArray(e.props.items) ? e.props.items : [], a = (n, r) => t.updateProps(e.id, { items: i.map((e, t) => t === n ? {
		...e,
		...r
	} : e) }, `faq:${e.id}:${n}`), o = i.length ? i : [{
		question: "",
		answer: ""
	}];
	return /* @__PURE__ */ J("div", {
		className: "group/faq py-1",
		children: [/* @__PURE__ */ q("div", {
			className: "divide-y divide-border border-y border-border",
			children: o.map((n, o) => /* @__PURE__ */ J("div", {
				className: "py-3",
				children: [/* @__PURE__ */ J("div", {
					className: "flex items-start gap-2",
					children: [
						/* @__PURE__ */ q(V, {
							name: "chevron-down",
							size: 14,
							className: "mt-1 shrink-0 text-faint"
						}),
						/* @__PURE__ */ q(p, {
							html: ir(n.question ?? ""),
							singleLine: !0,
							disabled: r,
							placeholder: N("Question"),
							className: "min-w-0 flex-1 text-base font-medium leading-6",
							onChange: (e) => a(o, { question: ar(e) }),
							onFocus: () => t.select(e.id)
						}),
						!r && i.length > 1 && /* @__PURE__ */ q(H, {
							icon: "close",
							label: N("Remove Question"),
							size: "xs",
							className: "opacity-0 group-hover/faq:opacity-100",
							onClick: () => t.updateProps(e.id, { items: i.filter((e, t) => t !== o) })
						})
					]
				}), /* @__PURE__ */ q(p, {
					html: n.answer ?? "",
					quiet: !0,
					disabled: r,
					placeholder: N("Answer"),
					className: "mt-1 pl-[22px] text-base leading-6 text-muted",
					onChange: (e) => a(o, { answer: e }),
					onFocus: () => t.select(e.id)
				})]
			}, o))
		}), !r && /* @__PURE__ */ q(z, {
			size: "xs",
			variant: "ghost",
			icon: "plus",
			className: "mt-1 opacity-0 transition-opacity group-hover/faq:opacity-100",
			onClick: () => t.updateProps(e.id, { items: [...i, {
				question: "",
				answer: ""
			}] }),
			children: N("Question")
		})]
	});
}
function nr({ node: e }) {
	let { store: t } = n(), { readOnly: r } = d(), i = P("components/list", { working: !0 }, { staleTime: 3e4 }), a = i.data?.find((t) => t.handle === e.props.ref), o = e.props.values ?? {}, s = e.bind ?? {}, c = (a?.props ?? []).filter((e) => e.type !== "json"), l = (n, r) => t.updateProps(e.id, { values: {
		...o,
		[n]: r
	} }, `values:${e.id}:${n}`), u = /* @__PURE__ */ J("div", {
		className: "flex h-8 items-center gap-2 text-xs",
		children: [
			/* @__PURE__ */ q(V, {
				name: "symbol",
				size: 13,
				className: "text-faint"
			}),
			/* @__PURE__ */ q("span", {
				className: "truncate font-medium text-muted",
				children: a?.title ?? (i.isLoading ? "…" : N("Missing component"))
			}),
			/* @__PURE__ */ q("span", { className: "flex-1" }),
			a?.id && /* @__PURE__ */ q(W, {
				onClick: () => Ut(`/content/components/${a.id}`),
				className: "rounded-xs px-1.5 text-faint opacity-0 transition-opacity hover:bg-hover hover:text-text group-hover/component:opacity-100",
				children: N("Edit Component")
			})
		]
	});
	return c.length === 0 ? /* @__PURE__ */ J("div", {
		className: "flex h-9 items-center gap-2 rounded-md px-1 text-sm text-faint",
		children: [
			/* @__PURE__ */ q(V, {
				name: "symbol",
				size: 14
			}),
			/* @__PURE__ */ q("span", {
				className: "truncate text-muted",
				children: a?.title ?? (i.isLoading ? "…" : N("Missing component"))
			}),
			a?.id && /* @__PURE__ */ q(W, {
				onClick: () => Ut(`/content/components/${a.id}`),
				className: "shrink-0 rounded-xs px-1 text-xs text-faint hover:bg-hover hover:text-text",
				children: N("Edit Component")
			})
		]
	}) : /* @__PURE__ */ J("div", {
		className: "group/component rounded-md border border-border px-3 pb-1",
		children: [u, c.length > 0 && /* @__PURE__ */ q("div", {
			className: "space-y-2.5 border-t border-border py-2.5",
			children: c.map((n) => {
				let i = o[n.handle] ?? n.default, a = s[`values.${n.handle}`];
				return /* @__PURE__ */ J("div", {
					className: "grid grid-cols-[120px_minmax(0,1fr)] items-start gap-3",
					children: [/* @__PURE__ */ q("span", {
						className: "truncate pt-[3px] text-xs text-faint",
						title: n.instructions,
						children: n.label
					}), a ? /* @__PURE__ */ q("span", {
						className: "pt-[3px] font-mono text-xs text-faint",
						children: a
					}) : [
						"text",
						"textarea",
						"richtext"
					].includes(n.type) ? /* @__PURE__ */ q(p, {
						html: n.type === "richtext" ? String(i ?? "") : ir(String(i ?? "")),
						singleLine: n.type === "text",
						disabled: r,
						placeholder: n.placeholder ?? N("Empty"),
						className: "text-base leading-6",
						onChange: (e) => l(n.handle, n.type === "richtext" ? e : ar(e)),
						onFocus: () => t.select(e.id)
					}) : /* @__PURE__ */ q(B, {
						bare: !0,
						disabled: r,
						fields: [n.type === "url" ? h({
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
function rr({ node: e, type: t }) {
	let { settings: n } = d(), r = Ft(e, 80);
	return /* @__PURE__ */ J(W, {
		onClick: () => n(e.id),
		className: "my-1 flex w-full items-center gap-3 rounded-md bg-surface px-3 py-2.5 text-left hover:bg-hover",
		children: [/* @__PURE__ */ q(V, {
			name: t?.icon ?? "square",
			size: 16,
			className: "shrink-0 text-muted"
		}), /* @__PURE__ */ J("span", {
			className: "min-w-0 flex-1",
			children: [/* @__PURE__ */ q("span", {
				className: "block text-sm text-text",
				children: t?.title ?? e.type
			}), (r || !t) && /* @__PURE__ */ q("span", {
				className: "block truncate text-xs text-faint",
				children: t ? r : N("Its plugin is off — the content is kept")
			})]
		})]
	});
}
function ir(e) {
	return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
}
function ar(e) {
	let t = document.createElement("div");
	return t.innerHTML = e.replace(/<br\s*\/?>/g, "\n"), t.textContent ?? "";
}
// admin/src/write/WriteEditor.tsx
var $ = /* @__PURE__ */ new Map(), or = (e) => $.get(e) ?? $.get(e.split("/")[0] + "/*"), sr = (e) => !!or(e), cr = Wt(null);
function lr({ onInspect: e } = {}) {
	let { store: t, types: r, allowed: i, readOnly: a = !1 } = n(), o = S(t, (e) => e.nodes), s = qt(() => Qe(o, r, sr), [o, r]), c = qt(() => new Map(ct(s).map((e) => [C(e), e])), [s]), l = L(null), [u, d] = R(null), [f, p] = R(null), [m, h] = R(null), g = un(ln(rn, { activationConstraint: { distance: 5 } })), _ = L(null), v = qt(() => ({
		stops: () => {
			let e = t.get().nodes;
			return _.current?.nodes !== e && (_.current = {
				nodes: e,
				stops: Dt(Qe(e, r, sr))
			}), _.current.stops;
		},
		settings: (n) => {
			t.select(n, !0), e ? e(n) : d(n);
		},
		readOnly: a
	}), [
		t,
		r,
		a,
		e
	]);
	Kt(() => {
		o.length === 0 && !a && j(null, "paragraph", r, i) && t.reset([b()]);
	}, [
		o,
		a,
		t,
		r,
		i
	]);
	let y = L(c);
	y.current = c, Sr(t, l, v, y);
	let ee = (e, n, a) => {
		let o = t.get().nodes, s = a === "before" ? x(n)[0] : x(n).at(-1), c = x(e);
		if (c.some((e) => e.id === s.id || It(o, s.id).some((t) => t.id === e.id))) return null;
		let l = O(o, s.id);
		if (!l) return null;
		let u = l.parentId ? D(o, l.parentId) : null;
		return c.every((e) => j(u, e.type, r, u ? [] : i)) ? {
			ids: c.map((e) => e.id),
			parentId: l.parentId,
			index: a === "before" ? l.index : l.index + 1
		} : null;
	};
	return /* @__PURE__ */ q(Mt.Provider, {
		value: v,
		children: /* @__PURE__ */ J("div", {
			ref: l,
			className: "relative",
			"data-cms-write": !0,
			children: [
				/* @__PURE__ */ J(tn, {
					sensors: g,
					collisionDetection: ur,
					onDragStart: (e) => h(c.get(String(e.active.id)) ?? null),
					onDragMove: (e) => {
						let t = c.get(String(e.active.id)), n = e.over ? c.get(String(e.over.id)) : null;
						if (!t || !n || e.over.id === e.active.id) return f && p(null);
						let r = e.activatorEvent.clientY + e.delta.y < e.over.rect.top + e.over.rect.height / 2 ? "before" : "after", i = ee(t, n, r) ? {
							id: String(e.over.id),
							side: r
						} : null;
						(i?.id !== f?.id || i?.side !== f?.side) && p(i);
					},
					onDragEnd: (e) => {
						let n = c.get(String(e.active.id)), r = f ? c.get(f.id) : null;
						p(null), h(null);
						let i = n && r && f ? ee(n, r, f.side) : null;
						i && t.moveTo(i.ids, i.parentId, i.index);
					},
					onDragCancel: () => {
						p(null), h(null);
					},
					children: [/* @__PURE__ */ q(cr.Provider, {
						value: f,
						children: s.map((e, t) => /* @__PURE__ */ q(dr, {
							section: e,
							spaced: t > 0 && (e.container || s[t - 1].container)
						}, e.id))
					}), en(/* @__PURE__ */ q(nn, {
						dropAnimation: null,
						children: m && /* @__PURE__ */ q(br, { row: m })
					}), document.body)]
				}),
				!a && /* @__PURE__ */ q(W, {
					compact: !0,
					tabIndex: -1,
					"aria-label": N("Continue Writing"),
					onClick: () => {
						let e = v.stops().at(-1), n = e ? D(t.get().nodes, e.id) : null;
						if (n?.type === "paragraph" && Lt(n.props.text)) return At(t, e, "end");
						let a = t.get().nodes, o = s.at(-1), c = o?.container ? x(o.rows.at(-1)).at(-1).id : a.at(-1)?.id, l = c ? A(a, c, "paragraph", r, i) : {
							parentId: null,
							index: 0
						};
						if (!l) return;
						let u = b();
						t.insert(l.parentId, l.index, [u]), t.focus(u.id, "start");
					},
					className: "block h-28 w-full cursor-text"
				}),
				/* @__PURE__ */ q(we, {}),
				/* @__PURE__ */ q(xr, {}),
				u && !e && /* @__PURE__ */ q(Jt, {
					open: !0,
					onOpenChange: (e) => !e && d(null),
					title: N("Block"),
					children: D(o, u) && /* @__PURE__ */ q(Ct, {
						node: D(o, u),
						onClose: () => d(null)
					})
				})
			]
		})
	});
}
var ur = (e) => {
	let t = on(e);
	if (t.length === 0) return an(e);
	let n = (t) => {
		let n = e.droppableRects.get(t);
		return n ? n.width * n.height : Infinity;
	};
	return [...t].sort((e, t) => n(e.id) - n(t.id)).slice(0, 1);
};
function dr({ section: e, spaced: t }) {
	return /* @__PURE__ */ J("section", {
		className: G("group/section relative", t && "mt-10"),
		children: [e.label && /* @__PURE__ */ q("div", {
			className: "pointer-events-none absolute right-[calc(100%+76px)] top-[5px] max-w-40 truncate whitespace-nowrap text-2xs text-faint opacity-0 transition-opacity duration-base group-focus-within/section:opacity-100 group-hover/section:opacity-100 max-xl:hidden",
			children: e.label
		}), e.rows.map((e, t) => /* @__PURE__ */ q(pr, {
			row: e,
			first: t === 0
		}, C(e)))]
	});
}
function fr(e, t) {
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
function pr({ row: e, first: t, nested: r }) {
	let { store: i } = n(), { readOnly: a } = d(), o = C(e), s = x(e).map((e) => e.id), c = S(i, (e) => e.blockMode && et(e).some((e) => s.includes(e))), l = Gt(cr), u = cn({ id: o }), f = sn({
		id: o,
		disabled: a
	}), { className: p, line: m } = fr(e, t);
	return /* @__PURE__ */ J("div", {
		ref: (e) => {
			u.setNodeRef(e), f.setNodeRef(e);
		},
		"data-row": o,
		"data-nested": r || void 0,
		style: { "--line": `${m}px` },
		className: G(r ? "group/nested" : "group/row", "relative py-[3px]", p, f.isDragging && "opacity-35", e.hidden && "opacity-45"),
		onMouseDown: (e) => {
			let t = e.target;
			t.closest("[data-row]") !== e.currentTarget || t.closest("[contenteditable=\"true\"],textarea,input,button,a,[role=\"button\"]") || (e.shiftKey && i.get().selected ? (e.preventDefault(), i.get().blockMode || i.select(i.get().selected, !0), i.extendTo(s.at(-1))) : (i.select(s[0], !0), s.length > 1 && i.extendTo(s.at(-1))));
		},
		children: [
			l?.id === o && /* @__PURE__ */ q("div", { className: G("pointer-events-none absolute inset-x-0 z-raised h-0.5 rounded-full bg-focus", l.side === "before" ? "-top-px" : "-bottom-px") }),
			!a && /* @__PURE__ */ q(gr, {
				row: e,
				handle: f,
				nested: r
			}),
			/* @__PURE__ */ q("div", {
				className: G("rounded-sm transition-[background-color,box-shadow] duration-fast", c && "bg-focus/10 ring-3 ring-focus/10"),
				children: /* @__PURE__ */ q(mr, { row: e })
			})
		]
	});
}
function mr({ row: e }) {
	let { types: t } = n(), { settings: r } = d();
	if (e.kind === "text") return /* @__PURE__ */ q(ot, { node: e.node });
	if (e.kind === "list") return /* @__PURE__ */ q(St, { node: e.node });
	if (e.kind === "actions") return /* @__PURE__ */ q(Wn, { nodes: e.nodes });
	if (e.kind === "container") {
		let n = t.get(e.node.type);
		return /* @__PURE__ */ J("div", {
			className: "rounded-md border border-border/70 px-4 pb-3 pt-2",
			children: [/* @__PURE__ */ J(W, {
				compact: !0,
				onClick: () => r(e.node.id),
				className: "mb-2 flex max-w-full items-center gap-1.5 text-xs text-faint hover:text-text",
				children: [/* @__PURE__ */ q(V, {
					name: n?.icon ?? "square",
					size: 12
				}), /* @__PURE__ */ q("span", {
					className: "truncate",
					children: e.node.label || n?.title || e.node.type
				})]
			}), e.rows.length ? e.rows.map((e, t) => /* @__PURE__ */ q(pr, {
				row: e,
				first: t === 0,
				nested: !0
			}, C(e))) : /* @__PURE__ */ q(hr, { column: e.node })]
		});
	}
	if (e.kind === "columns") {
		let t = String(e.node.props.layout ?? "1-1").split("-").map((e) => `minmax(0,${e}fr)`).join(" ");
		return /* @__PURE__ */ q("div", {
			className: "grid gap-8 py-1 max-md:!grid-cols-1",
			style: { gridTemplateColumns: t },
			children: e.columns.map((e) => /* @__PURE__ */ q("div", {
				className: "min-w-0",
				children: e.rows.length ? e.rows.map((e, t) => /* @__PURE__ */ q(pr, {
					row: e,
					first: t === 0,
					nested: !0
				}, C(e))) : /* @__PURE__ */ q(hr, { column: e.node })
			}, e.node.id))
		});
	}
	let i = e.node, a = t.get(i.type), o = or(i.type);
	if (o) return /* @__PURE__ */ q(o, {
		node: i,
		type: a,
		onSettings: r
	});
	switch (i.type) {
		case "image": return /* @__PURE__ */ q(Jn, { node: i });
		case "video":
		case "embed": return /* @__PURE__ */ q(Zn, {
			node: i,
			type: a
		});
		case "code": return /* @__PURE__ */ q($n, { node: i });
		case "table": return /* @__PURE__ */ q(er, { node: i });
		case "divider": return /* @__PURE__ */ q(Un, {});
		case "accordion": return /* @__PURE__ */ q(tr, { node: i });
		case "component": return /* @__PURE__ */ q(nr, { node: i });
		default: return /* @__PURE__ */ q(rr, {
			node: i,
			type: a
		});
	}
}
function hr({ column: e }) {
	let { store: t, types: r } = n(), { readOnly: i } = d();
	return i || !j(e, "paragraph", r, []) ? null : /* @__PURE__ */ q(W, {
		compact: !0,
		onClick: () => {
			let n = b();
			t.insert(e.id, 0, [n]), t.focus(n.id, "start");
		},
		className: G(Ue, "block w-full cursor-text py-[3px] text-left text-faint opacity-0 hover:opacity-100"),
		children: N("Write here")
	});
}
function gr({ row: e, handle: t, nested: i }) {
	let { store: a, types: o, allowed: s } = n(), c = d(), [l, u] = R(!1), [f, p] = R(""), m = S(a, (t) => t.blockMode && x(e).some((e) => e.id === t.selected)), h = x(e).at(-1), g = (e) => {
		let t = zt(e, o), n = A(a.get().nodes, h.id, t.map((e) => e.type), o, s);
		u(!1), p(""), n && (a.insert(n.parentId, n.index, t), Ve(a, t[0], c.stops()));
	};
	return /* @__PURE__ */ J("div", {
		className: G("absolute top-[3px] z-raised flex h-[var(--line)] items-center gap-0.5 opacity-0 transition-opacity duration-fast focus-within:opacity-100", i ? "-left-[22px] group-hover/nested:opacity-100" : "-left-[54px] group-hover/row:opacity-100 group-has-[[data-nested]:hover]/row:!opacity-0", (l || m) && "!opacity-100"),
		children: [!i && /* @__PURE__ */ q(U, {
			open: l,
			onOpenChange: (e) => {
				u(e), e || p("");
			},
			align: "start",
			className: "!p-0",
			trigger: /* @__PURE__ */ q(H, {
				icon: "plus",
				label: N("Add Below"),
				size: "xs",
				className: "!text-faint hover:!text-text"
			}),
			children: /* @__PURE__ */ q(r, {
				types: [...o.values()],
				query: f,
				onQuery: p,
				onChoose: g,
				onClose: () => u(!1),
				allowed: (e) => !!A(a.get().nodes, h.id, e.name, o, s)
			})
		}), /* @__PURE__ */ q(Yt, {
			align: "start",
			trigger: /* @__PURE__ */ q(W, {
				compact: !0,
				ref: t.setActivatorNodeRef,
				...t.attributes,
				...t.listeners,
				"aria-label": N("Drag to move, click for options"),
				className: "grid h-6 w-[18px] cursor-grab place-items-center rounded-xs text-faint hover:bg-hover hover:text-text active:cursor-grabbing",
				children: /* @__PURE__ */ q(V, {
					name: "drag",
					size: 14
				})
			}),
			items: vr(a, e, o, s, c)
		})]
	});
}
var _r = [
	{
		label: () => N("Text"),
		icon: "paragraph",
		type: "paragraph",
		props: {}
	},
	{
		label: () => N("Heading 1"),
		icon: "heading",
		type: "heading",
		props: { level: "1" }
	},
	{
		label: () => N("Heading 2"),
		icon: "heading",
		type: "heading",
		props: { level: "2" }
	},
	{
		label: () => N("Heading 3"),
		icon: "heading",
		type: "heading",
		props: { level: "3" }
	},
	{
		label: () => N("Bulleted List"),
		icon: "list",
		type: "list",
		props: { ordered: !1 }
	},
	{
		label: () => N("Numbered List"),
		icon: "list-ordered",
		type: "list",
		props: { ordered: !0 }
	},
	{
		label: () => N("Quote"),
		icon: "quote",
		type: "quote",
		props: {}
	},
	{
		label: () => N("Callout"),
		icon: "info",
		type: "callout",
		props: { tone: "note" }
	}
];
function vr(e, t, n, r, i) {
	let a = x(t), o = a[0], s = t.kind === "text" || t.kind === "list", c = () => o.type === "list" ? (o.props.items ?? []).join("<br>") : String(o.props.text ?? ""), l = (e) => e.type === o.type && Object.entries(e.props).every(([e, t]) => String(o.props[e] ?? (e !== "ordered" && "")) === String(t)), u = (t) => () => {
		let n = t.type === "list" ? {
			...t.props,
			items: c().split(/<br\s*\/?>/)
		} : {
			...t.props,
			text: c(),
			...t.type === "quote" ? { cite: "" } : {}
		};
		e.updateNode(o.id, {
			type: t.type,
			props: n
		}), e.focus(o.id, "end", t.type === "list" ? "items" : "text", t.type === "list" ? 0 : void 0);
	}, d = a.length === 1, f = t.parent ? D(e.get().nodes, t.parent) : null;
	return [
		...s ? [
			{
				label: N("Turn Into"),
				heading: !0
			},
			..._r.filter((e) => n.has(e.type) && j(f, e.type, n, f ? [] : r)).map((e) => ({
				label: e.label(),
				icon: e.icon,
				checked: l(e),
				onSelect: u(e)
			})),
			{
				separator: !0,
				label: ""
			}
		] : [],
		d && {
			label: N("Settings"),
			icon: "settings",
			onSelect: () => i.settings(o.id)
		},
		{
			label: N("Duplicate"),
			icon: "copy",
			shortcut: "mod+d",
			onSelect: () => yr(e, a.map((e) => e.id))
		},
		{
			separator: !0,
			label: ""
		},
		{
			label: N("Delete"),
			icon: "trash",
			danger: !0,
			shortcut: "⌫",
			onSelect: () => e.commit(a.reduce((e, t) => k(e, t.id), e.get().nodes))
		}
	];
}
function yr(e, t) {
	let n = e.get().nodes, r = t.map((e) => D(n, e)).filter((e) => !!e).map(Bt), i = O(n, t.at(-1));
	i && r.length !== 0 && (e.insert(i.parentId, i.index + 1, r), e.select(r[0].id, !0), r.length > 1 && e.extendTo(r.at(-1).id));
}
function br({ row: e }) {
	let t = x(e).map((e) => Ft(e, 60)).filter(Boolean).join(" · ");
	return /* @__PURE__ */ q("div", {
		className: "cms-pop max-w-[360px] truncate px-3 py-1.5 text-sm text-muted",
		children: t || N("Block")
	});
}
function xr() {
	let { store: e, types: t, allowed: i } = n(), a = d(), o = Ye(), [s, c] = R(null);
	if (P("components/list", {}, {
		staleTime: 6e4,
		enabled: i.length === 0 || i.includes("component")
	}), P("patterns/list", {}, { staleTime: 6e4 }), I(() => {
		if (!o) return c(null);
		let e = requestAnimationFrame(() => {
			let e = document.querySelector(`[data-row="${o.id}"] [contenteditable]`);
			c(it() ?? e?.getBoundingClientRect() ?? null);
		});
		return () => cancelAnimationFrame(e);
	}, [o]), I(() => {
		if (!o) return;
		let e = () => !document.activeElement?.closest(`[data-row="${o.id}"]`) && E(null);
		return document.addEventListener("focusin", e), () => document.removeEventListener("focusin", e);
	}, [o]), ht(!!o, [document]), !o || !s) return null;
	let l = (n) => {
		let r = zt(n, t), s = e.get().nodes, c = O(s, o.id);
		if (E(null), !c) return;
		let l = c.parentId ? D(s, c.parentId) : null;
		if (r.every((e) => j(l, e.type, t, l ? [] : i))) e.commit(Ht(k(s, o.id), c.parentId, c.index, r));
		else {
			let n = A(s, o.id, r.map((e) => e.type), t, i);
			if (!n) return;
			e.commit(Ht(k(s, o.id), n.parentId, n.index, r));
		}
		Ve(e, r[0], a.stops());
	}, { maxHeight: u, ...f } = Ge(s);
	return en(/* @__PURE__ */ q("div", {
		"data-cms-slash": !0,
		className: "cms-pop fixed z-overlay overflow-hidden !p-0",
		style: f,
		children: /* @__PURE__ */ q(r, {
			types: [...t.values()],
			query: o.query,
			chooseFirst: o.enter,
			components: i.length === 0 || i.includes("component"),
			onNoMatch: () => {
				let e = document.querySelector(`[data-row="${o.id}"] [contenteditable]`);
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
			allowed: (n) => !!A(e.get().nodes, o.id, n.name, t, i)
		})
	}), document.body);
}
function Sr(e, t, n, r) {
	I(() => {
		let i = (i) => {
			if (i.defaultPrevented) return;
			let a = t.current?.contains(document.activeElement) || t.current?.contains(i.target), { selected: o, blockMode: s, nodes: c } = e.get(), l = i.metaKey || i.ctrlKey, u = document.activeElement === document.body || !document.activeElement;
			if (l && i.key.toLowerCase() === "z" && (a || s || u)) {
				i.preventDefault();
				let t = a && document.activeElement?.isContentEditable;
				document.activeElement?.blur(), i.shiftKey ? e.redo() : e.undo();
				let r = t && o ? n.stops().find((e) => e.id === o) : null;
				r && At(e, r, "end");
				return;
			}
			if (!s || !o || n.readOnly || i.target?.closest?.("input,textarea,[contenteditable=\"true\"],[role=\"dialog\"],[data-cms-settings]")) return;
			let d = [...r.current.values()], f = d.findIndex((e) => x(e).some((e) => e.id === o)), p = d[f], m = (t) => {
				if (!t) return;
				let n = x(t).map((e) => e.id);
				e.select(n[0], !0), n.length > 1 && e.extendTo(n.at(-1)), document.querySelector(`[data-row="${n[0]}"]`)?.scrollIntoView({ block: "nearest" });
			};
			if (i.key === "ArrowDown" || i.key === "ArrowUp") {
				i.preventDefault();
				let t = i.key === "ArrowUp";
				if (i.altKey) return e.nudge(o, t ? -1 : 1);
				if (i.shiftKey) return e.extend(t ? -1 : 1);
				m(d[f + (t ? -1 : 1)]);
			} else if (i.key === "Enter") {
				i.preventDefault();
				let t = n.stops().find((e) => e.id === o), r = p ? x(p)[0] : null;
				t ? At(e, t, "end") : r && n.settings(r.id);
			} else if (i.key === "Backspace" || i.key === "Delete") {
				i.preventDefault();
				let t = d[f - 1] ?? d.slice(f + 1).find((t) => !x(t).some((t) => e.selection().includes(t.id)));
				e.removeSelection(), m(t);
			} else if (l && i.key.toLowerCase() === "d") i.preventDefault(), yr(e, e.selection());
			else if (l && (i.key.toLowerCase() === "c" || i.key.toLowerCase() === "x")) {
				let t = e.selection().map((e) => D(c, e)).filter(Boolean);
				if (t.length === 0) return;
				i.preventDefault(), navigator.clipboard.writeText("cms-blocks:" + JSON.stringify(t)), i.key.toLowerCase() === "x" && e.removeSelection();
			} else l && i.key.toLowerCase() === "v" ? (i.preventDefault(), navigator.clipboard.readText().then((t) => {
				if (!t.startsWith("cms-blocks:")) return;
				let n = JSON.parse(t.slice(12)).map(Bt);
				e.insertAfter(e.selection().at(-1) ?? o, n), e.select(n[0].id, !0);
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
Rn(), M.fields.set("blocks", dn), In(), M.fields.set("blocks-icon", Hn), M.panels.set("blocks-editor", {
	slot: "entry.editor",
	label: N("Block Editor"),
	icon: "layout",
	component: F(() => import("./chunks/BlocksWorkspace-C7shr8jg.js").then((e) => ({ default: e.BlocksWorkspace }))),
	when: (e) => e.bodyField.type === "blocks"
}), M.widgets.set("blocks-design", F(() => import("./chunks/WidgetDesign-DibJhush.js"))), M.components.set("blocks/patterns", F(() => import("./chunks/Patterns-DVvtcqcQ.js"))), $.set("audio", Zn), $.set("file", Zn), $.set("gallery", Qn);
export { Pt as ARTICLE, He as ClassChips, se as ClassStyle, Xe as ColorField, Le as ColorPicker, l as ELEMENTS, t as EditorProvider, yt as EditorStore, _t as Engine, Oe as FIELDS, be as GRADIENT_MARKERS, Ct as Inspector, bt as InspectorSection, Be as PaletteGrid, qe as PanelFields, kt as SCHEME, Nt as SPACING_STEPS, lt as STYLE_GROUPS, Se as SchemeTile, fe as SpacingChips, at as Specimen, $e as StateMenu, Re as StyleBar, vt as StylePanels, te as Stylesheet, s as StylingProvider, tt as Swatch, ge as TokenButton, g as TokenChip, ne as TokenList, lr as WriteEditor, ae as arbitrary, ft as askStyleName, Ee as balanced, $ as blockViews, c as colorGroups, De as dataStates, Pe as everyScreen, Y as formatShadows, ee as gradientOf, Te as gradientUtilities, Me as layerOf, ke as layerUsed, v as lightDark, nt as loadCompiler, de as loadEngine, pe as loadTailwindTheme, oe as onLayer, Ie as parseClass, En as parseShadows, gt as partUtility, u as schemesOf, _e as screenFor, ye as screenVariant, ie as searchClasses, Ae as shownVariable, Ne as spacingChoices, a as splitClasses, je as splitSiteClasses, xt as stateLabel, Fe as styleApi, Tt as styleLabel, We as styleSample, y as themeDefaults, Ke as themeReference, _ as tokensOf, e as useCatalog, S as useEditor, n as useEditorContext, re as useEngine, Je as useSpecimenSheet, le as useStyling, xe as useThemeTokens, ve as usedVariants, jt as withAlpha, wt as withVariants };
