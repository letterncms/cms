import { $ as e, $t as t, A as n, At as r, B as i, Bt as a, C as o, Ct as s, D as c, Dt as l, E as u, Et as d, F as f, Ft as p, G as m, Gt as h, H as g, Ht as _, I as v, It as y, J as ee, Jt as b, K as te, Kt as ne, L as re, Lt as ie, M as ae, Mt as oe, N as se, Nt as ce, O as le, Ot as ue, P as de, Pt as fe, Q as pe, Qt as me, R as he, Rt as ge, S as _e, St as ve, T as ye, Tt as be, U as xe, Ut as Se, V as Ce, Vt as we, W as x, Wt as Te, X as S, Xt as Ee, Y as De, Yt as Oe, Z as C, Zt as ke, _ as Ae, _t as je, a as Me, an as Ne, at as Pe, b as Fe, bt as Ie, c as Le, ct as w, d as Re, dt as ze, en as Be, et as Ve, f as He, ft as Ue, g as We, gt as Ge, h as Ke, ht as qe, i as Je, j as Ye, jt as Xe, k as Ze, kt as Qe, l as $e, lt as et, m as tt, mt as nt, n as rt, nn as T, nt as E, o as it, ot as at, p as ot, pt as st, q as ct, qt as lt, r as ut, rn as dt, rt as D, s as ft, sn as O, st as pt, t as mt, tn as ht, tt as gt, u as _t, ut as vt, v as yt, vt as bt, w as xt, wt as St, x as Ct, xt as wt, y as Tt, yt as Et, z as Dt, zt as Ot } from "./chunks/Inspector-Dn4Zpr_0.js";
import { _ as kt, a as At, c as k, d as jt, f as Mt, h as Nt, i as A, l as Pt, n as Ft, o as It, s as Lt, t as j, u as Rt } from "./chunks/insert-V_nHpAvO.js";
import { navigate as zt, registry as M, t as N, useAbility as P } from "@letterncms/sdk";
import { createContext as Bt, lazy as Vt, useContext as Ht, useEffect as F, useLayoutEffect as Ut, useMemo as I, useRef as L, useState as R } from "react";
import { Button as z, Fields as B, Icon as V, IconButton as H, InspectorPanel as Wt, Menu as Gt, Popover as U, Pressable as W, QueryError as Kt, Segmented as qt, Spinner as Jt, Tooltip as G, cn as K, fieldControlId as Yt, revealSelected as Xt } from "@letterncms/ui";
import { Fragment as Zt, jsx as q, jsxs as J } from "react/jsx-runtime";
import { createPortal as Qt } from "react-dom";
import { DndContext as $t, DragOverlay as en, PointerSensor as tn, closestCenter as nn, pointerWithin as rn, useDraggable as an, useDroppable as on, useSensor as sn, useSensors as cn } from "@dnd-kit/core";
// admin/src/BlocksField.tsx
function ln({ field: e, value: n, onChange: r, context: a, disabled: o }) {
	let { catalog: s, types: c, isLoading: l, error: u, retry: d } = Ne(), f = t(n, r, !!o), [p, m] = R(null), h = T(f, (e) => e.nodes), g = L(a);
	if (g.current = a, l) return /* @__PURE__ */ q("div", {
		className: "flex h-24 items-center justify-center text-faint",
		children: /* @__PURE__ */ q(Jt, {})
	});
	if (!s) return /* @__PURE__ */ q(Kt, {
		message: u?.message,
		onRetry: d
	});
	let _ = {
		store: f,
		types: c,
		catalog: s,
		entryId: a.entry?.id ?? null,
		fieldHandle: e.handle,
		allowed: e.allowed ?? [],
		getValues: () => g.current.values ?? {},
		title: a.title ?? a.entry?.title ?? "",
		readOnly: !!o
	};
	return /* @__PURE__ */ J(dt, {
		value: _,
		children: [/* @__PURE__ */ q("div", {
			className: "h-[480px] min-w-0 overflow-hidden rounded-sm border border-border",
			children: /* @__PURE__ */ q(i, {
				collection: a.collection,
				blueprint: a.blueprint,
				entryId: a.entry?.id,
				content: {
					title: a.title ?? a.entry?.title ?? "",
					slug: a.entry?.slug ?? "",
					authorId: a.entry?.authorId ?? null,
					data: {
						...a.values ?? a.entry?.data ?? {},
						[e.handle]: n ?? []
					}
				},
				onInspect: m,
				standalone: !0
			})
		}), /* @__PURE__ */ J(Wt, {
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
			}), p && k(h, p) && /* @__PURE__ */ q(mt, {
				node: k(h, p),
				onClose: () => m(null)
			})]
		})]
	});
}
// admin/src/builder/content/BindField.tsx
function un({ field: e, value: t, onChange: n, disabled: r }) {
	let [i, a] = R(!1), [o, s] = R(null), c = t ?? void 0, l = e.paths ?? [], u = [...new Set(l.map((e) => e.group))], d = l.find((e) => e.path === c)?.label;
	return /* @__PURE__ */ J(ye, { children: [/* @__PURE__ */ J("div", {
		className: "relative flex min-w-0 flex-1 items-center",
		children: [/* @__PURE__ */ q(V, {
			name: "database",
			size: 13,
			className: "pointer-events-none absolute left-2 text-ink"
		}), /* @__PURE__ */ q(G, {
			content: d,
			children: /* @__PURE__ */ q("input", {
				id: Yt(e),
				value: o ?? c ?? "",
				placeholder: e.placeholder ?? "entry.title",
				disabled: r,
				spellCheck: !1,
				onChange: (e) => s(e.target.value),
				onBlur: () => {
					o !== null && n(o.trim() || null), s(null);
				},
				onKeyDown: (e) => e.key === "Enter" && e.target.blur(),
				"aria-label": e.label,
				className: K(Dt, "!pl-7 font-mono text-ink placeholder:font-sans")
			})
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
			children: u.map((e) => /* @__PURE__ */ J("div", {
				className: "py-1",
				children: [/* @__PURE__ */ q("p", {
					className: "cms-label m-0 px-2 pb-1",
					children: e
				}), l.filter((t) => t.group === e).map((e) => /* @__PURE__ */ J(z, {
					variant: "ghost",
					"data-active": c === e.path || void 0,
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
						c === e.path && /* @__PURE__ */ q(V, {
							name: "check",
							size: 11,
							className: "shrink-0"
						})
					]
				}, e.path))]
			}, e))
		}), /* @__PURE__ */ q(G, {
			content: N("Filters, and text mixed with data"),
			children: /* @__PURE__ */ J("p", {
				className: "m-0 border-t border-border px-2 py-1.5 font-mono text-2xs leading-relaxed text-faint",
				children: ["|date:M j, Y · |excerpt:120 · |upper · |default:Text · By ", "{entry.author}"]
			})
		})]
	})] });
}
// admin/src/builder/fields/nodes.tsx
function dn({ field: e, ...t }) {
	let { store: n, types: r } = O(), i = T(n, (e) => e.nodes), a = Pt(i).filter(({ node: t }) => t.id !== e.exclude).map(({ node: e, depth: t }) => ({
		value: e.id,
		label: `${"  ".repeat(t)}${e.label || kt(e, 28) || r.get(e.type)?.title || e.type}`
	}));
	return /* @__PURE__ */ q(u, {
		...t,
		field: {
			...e,
			type: "select",
			component: void 0,
			size: "sm",
			options: a,
			placeholder: e.placeholder ?? N("Choose an Element")
		}
	});
}
function fn({ field: e, value: t, onChange: n, disabled: r, context: i }) {
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
			children: [/* @__PURE__ */ q(dn, {
				field: {
					...o,
					handle: `${e.handle}-${s}`
				},
				value: t,
				onChange: (e) => n(e ? a.map((t, n) => n === s ? e : t) : a.filter((e, t) => t !== s)),
				disabled: r,
				context: i
			}), /* @__PURE__ */ q(f, { onClick: () => n(a.filter((e, t) => t !== s)) })]
		}, s)), /* @__PURE__ */ J(W, {
			compact: !0,
			onClick: () => n([...a, e.addValue]),
			className: "text-xs text-muted hover:text-text",
			children: ["+ ", e.add ?? N("Element")]
		})]
	});
}
// admin/src/builder/fields/clip.tsx
var pn = [
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
], mn = (e) => e.replace(/\s+/g, " ").replace(/\b0%/g, "0").trim();
function hn(e) {
	if (!e || e === "none") return "none";
	let t = e.match(/^(inset|circle|ellipse|polygon)\(/);
	return t ? t[1] : "custom";
}
var gn = (e, t) => e?.match(RegExp(`^${t}\\((.*)\\)$`))?.[1] ?? "";
function _n(e) {
	let [t, n] = gn(e, "inset").split(/\s+round\s+/), r = Fe(t || "0") ?? [
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
function vn(e, t) {
	let [n, r] = gn(e, t).split(/\s+at\s+/), i = _e(n || ""), a = _e(r || "50% 50%");
	return {
		rx: i[0] ?? "50%",
		ry: i[1] ?? i[0] ?? "50%",
		x: a[0] ?? "50%",
		y: a[1] ?? "50%"
	};
}
function yn({ field: e, value: t, onChange: n, context: r, disabled: i }) {
	let a = t ?? void 0, [o, s] = R(!1), c = o && a ? "custom" : hn(a), l = (t, n, r = {}) => ({
		handle: `${e.handle}-${t}`,
		type: "text",
		component: "blocks-value",
		label: n,
		...r
	}), d = (e) => {
		if (s(e === "custom"), e === "custom") return a ? void 0 : n("inset(0)");
		if (!e || e === "none") return n(null);
		if (e === "inset") return n("inset(0 round 12px)");
		if (e === "circle") return n("circle(50% at 50% 50%)");
		if (e === "ellipse") return n("ellipse(50% 40% at 50% 50%)");
		n(pn[0].value);
	}, f = _n(a), p = (e) => {
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
	}, m = c === "circle" || c === "ellipse" ? vn(a, c) : null, h = (e) => {
		let t = {
			...m,
			...e
		};
		n(c === "circle" ? `circle(${t.rx} at ${t.x} ${t.y})` : `ellipse(${t.rx} ${t.ry} at ${t.x} ${t.y})`);
	}, g = c === "polygon" ? pn.find((e) => mn(e.value) === mn(a)) : void 0;
	return /* @__PURE__ */ J("div", {
		className: "min-w-0 flex-1 space-y-1",
		children: [
			/* @__PURE__ */ q(u, {
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
				value: c === "none" ? null : c,
				onChange: (e) => d(e),
				disabled: i,
				context: r
			}),
			c === "inset" && /* @__PURE__ */ J(Zt, { children: [/* @__PURE__ */ J(ye, {
				className: "grid grid-cols-2 gap-1",
				children: [
					/* @__PURE__ */ q(u, {
						field: l("top", N("Top"), {
							prefix: "T",
							placeholder: "0",
							units: ["px", "%"]
						}),
						value: f.top,
						onChange: (e) => p({ top: e ?? "0" }),
						context: r
					}),
					/* @__PURE__ */ q(u, {
						field: l("right", N("Right"), {
							prefix: "R",
							placeholder: "0",
							units: ["px", "%"]
						}),
						value: f.right,
						onChange: (e) => p({ right: e ?? "0" }),
						context: r
					}),
					/* @__PURE__ */ q(u, {
						field: l("bottom", N("Bottom"), {
							prefix: "B",
							placeholder: "0",
							units: ["px", "%"]
						}),
						value: f.bottom,
						onChange: (e) => p({ bottom: e ?? "0" }),
						context: r
					}),
					/* @__PURE__ */ q(u, {
						field: l("left", N("Left"), {
							prefix: "L",
							placeholder: "0",
							units: ["px", "%"]
						}),
						value: f.left,
						onChange: (e) => p({ left: e ?? "0" }),
						context: r
					})
				]
			}), /* @__PURE__ */ q(u, {
				field: l("round", N("Corner Radius"), {
					prefix: "◜",
					placeholder: N("Corners"),
					group: "radius"
				}),
				value: f.round || null,
				onChange: (e) => p({ round: e ?? "" }),
				context: r
			})] }),
			m && /* @__PURE__ */ J(ye, {
				className: "grid grid-cols-2 gap-1",
				children: [
					/* @__PURE__ */ q(u, {
						field: l("rx", N(c === "circle" ? "Radius" : "Width Radius"), {
							prefix: c === "circle" ? "R" : "W",
							unit: "%",
							units: ["%", "px"]
						}),
						value: m.rx,
						onChange: (e) => h({ rx: e ?? "50%" }),
						context: r
					}),
					c === "ellipse" ? /* @__PURE__ */ q(u, {
						field: l("ry", N("Height Radius"), {
							prefix: "H",
							unit: "%",
							units: ["%", "px"]
						}),
						value: m.ry,
						onChange: (e) => h({ ry: e ?? "50%" }),
						context: r
					}) : /* @__PURE__ */ q("span", {}),
					/* @__PURE__ */ q(u, {
						field: l("x", N("Center X"), {
							prefix: "X",
							unit: "%",
							units: ["%", "px"]
						}),
						value: m.x,
						onChange: (e) => h({ x: e ?? "50%" }),
						context: r
					}),
					/* @__PURE__ */ q(u, {
						field: l("y", N("Center Y"), {
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
			c === "polygon" && /* @__PURE__ */ q("div", {
				className: "grid grid-cols-5 gap-1",
				children: pn.map((e) => /* @__PURE__ */ q(G, {
					content: e.label(),
					children: /* @__PURE__ */ q(W, {
						compact: !0,
						"aria-label": e.label(),
						"aria-pressed": g?.id === e.id,
						onClick: () => n(e.value),
						className: K("grid aspect-square place-items-center rounded-xs border", g?.id === e.id ? "border-focus bg-focus/8" : "border-border hover:bg-hover"),
						children: /* @__PURE__ */ q("span", {
							className: K("size-4", g?.id === e.id ? "bg-focus" : "bg-muted"),
							style: { clipPath: e.value }
						})
					})
				}, e.id))
			}),
			(c === "custom" || c === "polygon" && !g) && /* @__PURE__ */ q(u, {
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
var bn = () => [
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
function xn({ field: e, value: t, onChange: n, disabled: r, context: i }) {
	let a = Array.isArray(t) ? t : [], o = (e) => n(e.length ? e : null), s = (e, t) => o(a.map((n, r) => r === e ? {
		...n,
		...t
	} : n));
	return /* @__PURE__ */ J("div", {
		className: "min-w-0 flex-1 space-y-1",
		children: [a.map((t, n) => /* @__PURE__ */ J("div", {
			className: "flex items-center gap-1",
			children: [
				/* @__PURE__ */ q(u, {
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
				/* @__PURE__ */ q(u, {
					field: {
						handle: `${e.handle}-${n}-op`,
						type: "select",
						size: "sm",
						required: !0,
						label: N("Comparison"),
						options: bn(),
						className: "!flex-none w-[92px]"
					},
					value: t.op ?? "=",
					onChange: (e) => s(n, { op: String(e ?? "=") }),
					disabled: r,
					context: i
				}),
				!["null", "not null"].includes(t.op ?? "") && /* @__PURE__ */ q(u, {
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
				/* @__PURE__ */ q(f, {
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
function Sn({ field: e, value: t, onChange: n, disabled: r }) {
	let i = L(null);
	return F(() => {
		i.current && i.current.innerHTML !== (t ?? "") && document.activeElement !== i.current && (i.current.innerHTML = t ?? "");
	}, [t]), /* @__PURE__ */ q("div", {
		ref: i,
		id: Yt(e),
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
		className: K(Dt, "cursor-text overflow-hidden whitespace-nowrap leading-[26px] outline-none [&_*]:inline empty:before:text-ghost empty:before:content-[attr(data-placeholder)]")
	});
}
// admin/src/builder/fields/shadows.tsx
var Cn = /^-?[\d.]+(px|rem|em)?$/;
function wn(e) {
	return !e || e === "none" ? [] : /^var\(--[\w-]+\)$/.test(e.trim()) ? null : Ct(e).map((e) => {
		let t = _e(e), n = t.includes("inset"), r = t.filter((e) => e !== "inset"), i = r.filter((e) => Cn.test(e)), a = r.find((e) => !Cn.test(e)) ?? "rgb(0 0 0 / 15%)";
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
var Tn = {
	inset: !1,
	x: "0px",
	y: "8px",
	blur: "24px",
	spread: "-8px",
	color: "rgb(0 0 0 / 18%)"
}, En = {
	inset: !1,
	x: "0px",
	y: "1px",
	blur: "2px",
	spread: "0",
	color: "rgb(0 0 0 / 25%)"
}, Dn = (e) => e.replace(/px$/, "");
function On({ field: e, value: t, onChange: r, context: i }) {
	let a = e.kind === "text", o = a ? void 0 : e.group ?? "shadow", s = ae(), c = Ae(), [l, u] = R(null), d = s(t), p = wn(t) ?? [], m = (e) => r(Y(e, a));
	return /* @__PURE__ */ J("div", {
		className: "min-w-0 flex-1",
		children: [
			/* @__PURE__ */ J("div", {
				className: "group/value flex h-7 items-center gap-2",
				children: [
					/* @__PURE__ */ q(v, { field: e }),
					/* @__PURE__ */ q("span", {
						className: "min-w-0 flex-1 truncate text-xs text-faint",
						children: !d && !p.length && typeof e.placeholder == "string" ? e.placeholder : ""
					}),
					o && /* @__PURE__ */ q(Ze, {
						group: o,
						value: t,
						onPick: r,
						active: !!d,
						className: "size-6"
					}),
					!d && /* @__PURE__ */ q(se, {
						label: N(a ? "Add Text Shadow" : "Add Shadow"),
						onClick: () => {
							m([...p, a ? En : Tn]), u(p.length);
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
					/* @__PURE__ */ q(n, {
						token: d.token,
						className: "text-xs"
					}),
					/* @__PURE__ */ q("span", { className: "flex-1" }),
					/* @__PURE__ */ q(f, {
						label: N("Remove Shadow"),
						onClick: () => r(null)
					})
				]
			}),
			p.map((e, t) => /* @__PURE__ */ J("div", {
				className: "flex h-7 items-center gap-1 pl-[88px]",
				children: [/* @__PURE__ */ J(U, {
					open: l === t,
					onOpenChange: (e) => u(e ? t : null),
					align: "end",
					className: "w-64 !p-2",
					trigger: /* @__PURE__ */ J(W, {
						compact: !0,
						className: K("flex h-7 min-w-0 flex-1 items-center gap-1.5 rounded-sm px-1.5 text-left text-xs hover:bg-hover", l === t && "bg-active"),
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
								].map(Dn).join(" ")
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
					}), /* @__PURE__ */ q(de, {
						context: i,
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
						onChange: (e, n) => m(p.map((r, i) => i === t ? {
							...r,
							[e]: e === "inset" ? n === "inside" : n ?? (e === "color" ? "transparent" : "0")
						} : r))
					})]
				}), /* @__PURE__ */ q(f, {
					label: N("Remove Shadow"),
					onClick: () => m(p.filter((e, n) => n !== t))
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
var kn = /^(-?\d*\.?\d+)([a-z%]*)$/i;
function An(e, t) {
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
function jn({ field: e, value: t, onChange: n, context: r }) {
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
	}), c = (e, t) => /* @__PURE__ */ q(Mn, {
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
function Mn({ box: e, index: t, value: n, status: r, onChange: i, context: a }) {
	let o = ae(), [s, c] = R(!1), [l, u] = R([t]), [d, f] = R(!1), p = o(n), m = n?.match(kn), h = p ? p.token.name : m ? m[2] === "px" || !m[2] ? m[1] : `${m[1]}${m[2]}` : n ?? "0";
	return /* @__PURE__ */ q(U, {
		open: s,
		onOpenChange: c,
		align: "center",
		className: "w-64 !p-3",
		trigger: /* @__PURE__ */ q(G, {
			content: /* @__PURE__ */ J("span", { children: [
				Z(e, [t]),
				p ? ` · ${p.token.variable}` : "",
				/* @__PURE__ */ q("br", {}),
				N("Drag to change. Alt: opposite side too, Shift: all sides.")
			] }),
			children: /* @__PURE__ */ q(W, {
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
						i(An(t, n), `${e === "padding" ? Math.max(0, u) : u}${s}`);
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
				onClick: (e) => u(An(t, e)),
				"aria-label": Z(e, [t]),
				className: K("mx-auto flex h-full min-w-0 max-w-full items-center justify-center rounded-xs px-1 text-xs tabular-nums outline-none transition-colors focus-visible:ring-2 focus-visible:ring-focus", t % 2 ? "cursor-ew-resize" : "cursor-ns-resize", r === "none" ? "text-faint" : "text-ink", s || d ? "bg-active" : "hover:bg-hover"),
				children: /* @__PURE__ */ q("span", {
					className: K("truncate", r !== "none" && "rounded-xs px-1 leading-4", r === "own" ? "bg-focus-soft" : r === "inherited" && "bg-active"),
					children: h
				})
			})
		}),
		children: /* @__PURE__ */ q(Nn, {
			box: e,
			sides: l,
			value: n,
			onChange: (e) => i(l, e),
			close: () => c(!1),
			context: a
		})
	});
}
function Nn({ box: e, sides: t, value: n, onChange: r, close: i, context: a }) {
	let o = L(null);
	F(() => {
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
			/* @__PURE__ */ q(u, {
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
				children: /* @__PURE__ */ q(le, {
					value: n,
					onPick: s,
					auto: e === "margin"
				})
			})
		]
	});
}
// admin/src/builder/fields/index.ts
function Pn() {
	let e = {
		"blocks-value": c,
		"blocks-color": Ke,
		"blocks-bind": un,
		"blocks-node": dn,
		"blocks-nodes": fn,
		"blocks-group": o,
		"blocks-pairs": xt,
		"blocks-shadows": On,
		"blocks-gradient": ot,
		"blocks-align": He,
		"blocks-origin": tt,
		"blocks-spacing": jn,
		"blocks-filters": Tt,
		"blocks-clip": yn,
		"blocks-conditions": xn,
		"blocks-inline-text": Sn
	};
	for (let [t, n] of Object.entries(e)) M.fields.set(t, n);
}
// admin/src/builder/icons.ts
var Q = "<rect x=\"44\" y=\"44\" width=\"168\" height=\"168\" rx=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"14\" stroke-dasharray=\"18 18\" opacity=\".4\"/>", Fn = {
	"b-side-all": "<rect x=\"44\" y=\"44\" width=\"168\" height=\"168\" rx=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"18\"/>",
	"b-side-top": Q + "<path d=\"M44 44h168\" stroke=\"currentColor\" stroke-width=\"22\" stroke-linecap=\"round\"/>",
	"b-side-right": Q + "<path d=\"M212 44v168\" stroke=\"currentColor\" stroke-width=\"22\" stroke-linecap=\"round\"/>",
	"b-side-bottom": Q + "<path d=\"M44 212h168\" stroke=\"currentColor\" stroke-width=\"22\" stroke-linecap=\"round\"/>",
	"b-side-left": Q + "<path d=\"M44 44v168\" stroke=\"currentColor\" stroke-width=\"22\" stroke-linecap=\"round\"/>"
};
function In() {
	for (let [e, t] of Object.entries(Fn)) M.icons.get(e) || M.icons.set(e, t);
}
// admin/src/builder/content/IconField.tsx
var Ln = [
	"regular",
	"bold",
	"fill",
	"light"
], Rn = (e) => ({
	regular: N("Regular"),
	bold: N("Bold"),
	fill: N("Fill||weight"),
	light: N("Light||weight")
})[e], zn = (e) => {
	let t = e.match(/^(.*)-(bold|fill|light)$/);
	return t ? {
		base: t[1],
		weight: t[2]
	} : {
		base: e,
		weight: "regular"
	};
};
function Bn({ field: e, value: t, onChange: n, disabled: r }) {
	let [i, a] = R(!1), [o, s] = R(""), [c, l] = R(""), u = (t ?? "").replace(/^ph:/, ""), { base: d, weight: f } = zn(u), p = P("blocks/icons", {
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
	}), h = p.data?.find((e) => e.name === d) ?? p.data?.[0], g = !c && h?.name === d && m.data && !m.data.some((e) => e.name === d) ? [h, ...m.data] : m.data;
	F(() => {
		let e = window.setTimeout(() => l(o.trim()), 140);
		return () => window.clearTimeout(e);
	}, [o]);
	let _ = (e, t = f) => n(t === "regular" ? e : `${e}-${t}`);
	return /* @__PURE__ */ J("div", {
		className: "group/icon relative min-w-0 flex-1",
		children: [/* @__PURE__ */ J(U, {
			open: i,
			onOpenChange: (e) => !r && a(e),
			className: "w-[284px] !p-0",
			trigger: /* @__PURE__ */ J(W, {
				id: Yt(e),
				disabled: r,
				"aria-label": e.label,
				className: K("cms-input flex h-7 w-full min-w-0 items-center gap-2 rounded-sm px-2 text-left text-sm disabled:opacity-50", u && "pr-6"),
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
						className: K("min-w-0 flex-1 truncate", !u && "text-ghost"),
						children: u ? d : e.placeholder || N("Choose an Icon")
					}),
					u && f !== "regular" && /* @__PURE__ */ q("span", {
						className: "shrink-0 text-faint",
						children: Rn(f)
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
						m.isFetching && /* @__PURE__ */ q(Jt, { size: 12 })
					]
				}),
				/* @__PURE__ */ q("div", {
					className: "border-b border-border p-1.5",
					children: /* @__PURE__ */ q(qt, {
						size: "xs",
						block: !0,
						value: f,
						onChange: (e) => u ? _(d, e) : void 0,
						options: Ln.map((e) => ({
							value: e,
							label: Rn(e)
						}))
					})
				}),
				/* @__PURE__ */ J("div", {
					ref: Xt,
					className: "grid max-h-64 grid-cols-8 gap-0.5 overflow-y-auto p-1.5",
					role: "listbox",
					"aria-label": N("Icons"),
					children: [(g ?? []).map((e) => /* @__PURE__ */ q(G, {
						content: e.name,
						children: /* @__PURE__ */ q(W, {
							role: "option",
							"aria-selected": e.name === d,
							"aria-label": e.name,
							onClick: () => {
								_(e.name), a(!1);
							},
							className: K("grid aspect-square place-items-center rounded-xs text-text hover:bg-hover [&_svg]:size-4", e.name === d && "bg-focus-soft text-focus"),
							dangerouslySetInnerHTML: { __html: e.svg }
						})
					}, e.name)), !m.isFetching && m.data?.length === 0 && /* @__PURE__ */ q("p", {
						className: "col-span-8 m-0 py-6 text-center text-xs text-faint",
						children: N("No matches")
					})]
				}, g ? "icons" : "loading")
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
function Vn() {
	return /* @__PURE__ */ q("hr", { className: "my-3 border-0 border-t border-border-strong" });
}
function Hn({ nodes: e }) {
	let { store: t, types: n, allowed: r } = O(), { readOnly: i } = D(), a = e[e.length - 1];
	return /* @__PURE__ */ J("div", {
		className: "group/actions flex flex-wrap items-center gap-x-3 gap-y-2 py-1",
		children: [e.map((e) => /* @__PURE__ */ q(Wn, { node: e }, e.id)), !i && a.type === "button" && n.has("button") && /* @__PURE__ */ q(H, {
			icon: "plus",
			label: N("Add a Button"),
			size: "xs",
			className: "opacity-0 transition-opacity group-hover/actions:opacity-100 focus-visible:opacity-100",
			onClick: () => {
				let e = t.get().nodes, i = A(e, a.id, "button", n, r), o = n.get("button");
				if (!i || !o) return;
				let s = Lt(o, {
					label: "",
					variant: a.type === "button" && (a.props.variant ?? "primary") === "primary" ? "secondary" : a.props.variant ?? "primary"
				}, n);
				t.insert(i.parentId, i.index, [s]), t.focus(s.id, "end", "label");
			}
		})]
	});
}
var Un = {
	primary: "h-9 rounded-md bg-ink px-4 text-ink-contrast",
	secondary: "h-9 rounded-md border border-border-strong bg-bg px-4 text-text",
	ghost: "h-9 rounded-md px-3 text-text bg-sunken/60",
	link: "h-9 text-text underline decoration-border-strong underline-offset-4"
};
function Wn({ node: e }) {
	let { store: t } = O(), { readOnly: n } = D(), [r, i] = R(!1), a = T(t, (t) => t.focus?.id === e.id && t.focus.prop === "label" ? t.focus : null), o = e.type === "link", s = String(e.props.url ?? ""), c = o ? Un.link : Un[e.props.variant ?? "primary"] ?? Un.primary, l = et(), u = [
		pt({
			handle: "url",
			label: N("Link"),
			placeholder: N("Paste a link or search pages"),
			autofocus: !s,
			anchors: l
		}),
		...o ? [] : [{
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
				className: K("inline-flex items-center text-sm font-medium", c),
				children: /* @__PURE__ */ q(w, {
					html: String(e.props.label ?? ""),
					singleLine: !0,
					quiet: !0,
					disabled: n,
					placeholder: N(o ? "Link Text" : "Button Text"),
					className: "min-w-8 whitespace-nowrap",
					focus: a,
					onChange: (n) => t.updateProps(e.id, { label: n }),
					onFocus: () => t.get().selected !== e.id && t.select(e.id),
					onKeyDown: (n, r) => {
						(n.key === "Enter" || n.key === "Escape") && (n.preventDefault(), r.blur(), n.key === "Escape" && t.select(e.id, !0));
					}
				})
			}),
			!s && /* @__PURE__ */ q("span", {
				className: "pointer-events-none absolute -right-0.5 -top-0.5 size-2 rounded-full bg-warning ring-2 ring-bg",
				"aria-hidden": !0
			}),
			!n && /* @__PURE__ */ q(U, {
				open: r,
				onOpenChange: i,
				align: "start",
				className: "w-80 !p-3",
				trigger: /* @__PURE__ */ q(G, {
					content: s || N("Add a Link"),
					children: /* @__PURE__ */ q(W, {
						"aria-label": N("Edit Link"),
						className: K("absolute -right-2.5 -top-2.5 grid size-6 place-items-center rounded-full border border-border bg-bg text-muted shadow-pop transition-opacity hover:text-text", r ? "opacity-100" : "opacity-0 group-hover/action:opacity-100 focus-visible:opacity-100"),
						children: /* @__PURE__ */ q(V, {
							name: "link",
							size: 12
						})
					})
				}),
				children: /* @__PURE__ */ J("div", {
					className: "space-y-3",
					onKeyDown: (e) => e.key === "Enter" && !e.defaultPrevented && e.target.tagName === "INPUT" && i(!1),
					children: [/* @__PURE__ */ q(B, {
						fields: u,
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
								i(!1), t.remove(e.id);
							},
							children: N(o ? "Remove Link" : "Remove Button")
						})
					})]
				})
			})
		]
	});
}
function Gn(e) {
	let t = Array.isArray(e) ? e[0] : e, n = typeof t == "string" && /^(https?:|\/)/.test(t), r = P("media/get-many", { ids: [t] }, {
		enabled: typeof t == "string" && !n && t.length > 0,
		staleTime: 3e5,
		retry: !1
	});
	if (n) return t;
	let i = r.data?.items?.[0];
	return i ? i.url ?? i.thumb : null;
}
function Kn({ node: e }) {
	let { store: t } = O(), { settings: n, readOnly: r } = D(), i = Gn(e.props.image);
	return /* @__PURE__ */ J("figure", {
		className: "cms-block-figure m-0 py-1",
		children: [i ? /* @__PURE__ */ J("div", {
			className: "group/image relative",
			children: [
				/* @__PURE__ */ q("img", {
					src: i,
					alt: e.props.alt ?? "",
					className: "block max-h-[520px] w-full rounded-md bg-sunken object-cover",
					style: e.props.aspect && e.props.aspect !== "auto" ? { aspectRatio: e.props.aspect } : void 0
				}),
				!r && /* @__PURE__ */ q("div", {
					className: "absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover/image:opacity-100",
					children: /* @__PURE__ */ q(z, {
						size: "xs",
						variant: "secondary",
						icon: "settings",
						onClick: () => n(e.id),
						children: N("Edit")
					})
				}),
				!e.props.alt && !r && /* @__PURE__ */ q("span", {
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
				disabled: r,
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
		}), /* @__PURE__ */ q(qn, { node: e })]
	});
}
function qn({ node: e }) {
	let { store: t } = O(), { readOnly: n } = D(), r = T(t, (t) => t.focus?.id === e.id && t.focus.prop === "caption" ? t.focus : null);
	return n && !e.props.caption ? null : /* @__PURE__ */ q("figcaption", { children: /* @__PURE__ */ q(w, {
		html: String(e.props.caption ?? ""),
		quiet: !0,
		disabled: n,
		placeholder: N("Add a Caption"),
		focus: r,
		className: "mt-2 text-sm text-muted",
		onChange: (n) => t.updateProps(e.id, { caption: n }),
		onFocus: () => t.select(e.id)
	}) });
}
function Jn(e) {
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
function Yn({ node: e, type: t }) {
	let { settings: n } = D(), [r] = Jn(e.props.file), i = String(e.props.url ?? ""), a = i ? i.replace(/^https?:\/\/(www\.)?/, "").split(/[/?#]/)[0] : "", o = {
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
		}), t?.inline?.includes("caption") && /* @__PURE__ */ q(qn, { node: e })]
	});
}
function Xn({ node: e, type: t }) {
	let { settings: n } = D(), r = Jn(e.props.images);
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
function Zn({ node: e }) {
	let { store: t } = O(), { settings: n, readOnly: r } = D();
	return /* @__PURE__ */ J("div", {
		className: "group/code relative py-1",
		onFocus: () => t.select(e.id),
		children: [/* @__PURE__ */ q(B, {
			bare: !0,
			disabled: r,
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
			onClick: () => n(e.id),
			className: "absolute right-2 top-2.5 rounded-xs px-1.5 font-mono text-2xs text-faint hover:bg-hover hover:text-text",
			children: e.props.language && e.props.language !== "plain" ? e.props.language : N("Plain Text")
		})]
	});
}
function Qn({ node: e }) {
	let { store: t } = O(), { readOnly: n } = D(), r = Array.isArray(e.props.rows) && e.props.rows.length ? e.props.rows : [["", ""], ["", ""]], i = Math.max(...r.map((e) => e.length)), a = (n, a, o) => t.updateProps(e.id, { rows: r.map((e, t) => t === n ? Array.from({ length: i }, (t, n) => n === a ? o : e[n] ?? "") : e) }, `table:${e.id}`), o = (n) => t.updateProps(e.id, { rows: n });
	return /* @__PURE__ */ J("div", {
		className: "group/table py-1",
		children: [/* @__PURE__ */ q("div", {
			className: "overflow-x-auto rounded-md border border-border",
			children: /* @__PURE__ */ q("table", {
				className: "w-full border-collapse text-sm",
				children: /* @__PURE__ */ q("tbody", { children: r.map((r, o) => /* @__PURE__ */ q("tr", {
					className: K("border-b border-border last:border-b-0", o === 0 && e.props.header !== !1 && "bg-surface font-medium"),
					children: Array.from({ length: i }, (i, s) => /* @__PURE__ */ q("td", {
						className: "min-w-24 border-r border-border px-3 py-2 align-top last:border-r-0",
						children: /* @__PURE__ */ q(w, {
							html: r[s] ?? "",
							singleLine: !0,
							disabled: n,
							onChange: (e) => a(o, s, e),
							onFocus: () => t.select(e.id)
						})
					}, s))
				}, o)) })
			})
		}), !n && /* @__PURE__ */ J("div", {
			className: "mt-1 flex gap-1 opacity-0 transition-opacity group-hover/table:opacity-100 group-focus-within/table:opacity-100",
			children: [
				/* @__PURE__ */ q(z, {
					size: "xs",
					variant: "ghost",
					icon: "plus",
					onClick: () => o([...r, Array(i).fill("")]),
					children: N("Row")
				}),
				/* @__PURE__ */ q(z, {
					size: "xs",
					variant: "ghost",
					icon: "plus",
					onClick: () => o(r.map((e) => [...e, ""])),
					children: N("Column")
				}),
				r.length > 1 && /* @__PURE__ */ q(z, {
					size: "xs",
					variant: "ghost",
					icon: "minus",
					onClick: () => o(r.slice(0, -1)),
					children: N("Row")
				}),
				i > 1 && /* @__PURE__ */ q(z, {
					size: "xs",
					variant: "ghost",
					icon: "minus",
					onClick: () => o(r.map((e) => e.slice(0, i - 1))),
					children: N("Column")
				})
			]
		})]
	});
}
function $n({ node: e }) {
	let { store: t } = O(), { readOnly: n } = D(), r = Array.isArray(e.props.items) ? e.props.items : [], i = (n, i) => t.updateProps(e.id, { items: r.map((e, t) => t === n ? {
		...e,
		...i
	} : e) }, `faq:${e.id}:${n}`), a = r.length ? r : [{
		question: "",
		answer: ""
	}];
	return /* @__PURE__ */ J("div", {
		className: "group/faq py-1",
		children: [/* @__PURE__ */ q("div", {
			className: "divide-y divide-border border-y border-border",
			children: a.map((a, o) => /* @__PURE__ */ J("div", {
				className: "py-3",
				children: [/* @__PURE__ */ J("div", {
					className: "flex items-start gap-2",
					children: [
						/* @__PURE__ */ q(V, {
							name: "chevron-down",
							size: 14,
							className: "mt-1 shrink-0 text-faint"
						}),
						/* @__PURE__ */ q(w, {
							html: nr(a.question ?? ""),
							singleLine: !0,
							disabled: n,
							placeholder: N("Question"),
							className: "min-w-0 flex-1 text-base font-medium leading-6",
							onChange: (e) => i(o, { question: rr(e) }),
							onFocus: () => t.select(e.id)
						}),
						!n && r.length > 1 && /* @__PURE__ */ q(H, {
							icon: "close",
							label: N("Remove Question"),
							size: "xs",
							className: "opacity-0 group-hover/faq:opacity-100",
							onClick: () => t.updateProps(e.id, { items: r.filter((e, t) => t !== o) })
						})
					]
				}), /* @__PURE__ */ q(w, {
					html: a.answer ?? "",
					quiet: !0,
					disabled: n,
					placeholder: N("Answer"),
					className: "mt-1 pl-[22px] text-base leading-6 text-muted",
					onChange: (e) => i(o, { answer: e }),
					onFocus: () => t.select(e.id)
				})]
			}, o))
		}), !n && /* @__PURE__ */ q(z, {
			size: "xs",
			variant: "ghost",
			icon: "plus",
			className: "mt-1 opacity-0 transition-opacity group-hover/faq:opacity-100",
			onClick: () => t.updateProps(e.id, { items: [...r, {
				question: "",
				answer: ""
			}] }),
			children: N("Question")
		})]
	});
}
function er({ node: e }) {
	let { store: t } = O(), { readOnly: n } = D(), r = P("components/list", { working: !0 }, { staleTime: 3e4 }), i = r.data?.find((t) => t.handle === e.props.ref), a = e.props.values ?? {}, o = e.bind ?? {}, s = (i?.props ?? []).filter((e) => e.type !== "json"), c = (n, r) => t.updateProps(e.id, { values: {
		...a,
		[n]: r
	} }, `values:${e.id}:${n}`), l = /* @__PURE__ */ J("div", {
		className: "flex h-8 items-center gap-2 text-xs",
		children: [
			/* @__PURE__ */ q(V, {
				name: "symbol",
				size: 13,
				className: "text-faint"
			}),
			/* @__PURE__ */ q("span", {
				className: "truncate font-medium text-muted",
				children: i?.title ?? (r.isLoading ? "…" : N("Missing component"))
			}),
			/* @__PURE__ */ q("span", { className: "flex-1" }),
			i?.id && /* @__PURE__ */ q(W, {
				onClick: () => zt(`/content/components/${i.id}`),
				className: "rounded-xs px-1.5 text-faint opacity-0 transition-opacity hover:bg-hover hover:text-text group-hover/component:opacity-100",
				children: N("Edit Component")
			})
		]
	});
	return s.length === 0 ? /* @__PURE__ */ J("div", {
		className: "flex h-9 items-center gap-2 rounded-md px-1 text-sm text-faint",
		children: [
			/* @__PURE__ */ q(V, {
				name: "symbol",
				size: 14
			}),
			/* @__PURE__ */ q("span", {
				className: "truncate text-muted",
				children: i?.title ?? (r.isLoading ? "…" : N("Missing component"))
			}),
			i?.id && /* @__PURE__ */ q(W, {
				onClick: () => zt(`/content/components/${i.id}`),
				className: "shrink-0 rounded-xs px-1 text-xs text-faint hover:bg-hover hover:text-text",
				children: N("Edit Component")
			})
		]
	}) : /* @__PURE__ */ J("div", {
		className: "group/component rounded-md border border-border px-3 pb-1",
		children: [l, s.length > 0 && /* @__PURE__ */ q("div", {
			className: "space-y-2.5 border-t border-border py-2.5",
			children: s.map((r) => {
				let i = a[r.handle] ?? r.default, s = o[`values.${r.handle}`];
				return /* @__PURE__ */ J("div", {
					className: "grid grid-cols-[120px_minmax(0,1fr)] items-start gap-3",
					children: [/* @__PURE__ */ q(G, {
						content: r.instructions,
						children: /* @__PURE__ */ q("span", {
							className: "truncate pt-[3px] text-xs text-faint",
							children: r.label
						})
					}), s ? /* @__PURE__ */ q("span", {
						className: "pt-[3px] font-mono text-xs text-faint",
						children: s
					}) : [
						"text",
						"textarea",
						"richtext"
					].includes(r.type) ? /* @__PURE__ */ q(w, {
						html: r.type === "richtext" ? String(i ?? "") : nr(String(i ?? "")),
						singleLine: r.type === "text",
						disabled: n,
						placeholder: r.placeholder ?? N("Empty"),
						className: "text-base leading-6",
						onChange: (e) => c(r.handle, r.type === "richtext" ? e : rr(e)),
						onFocus: () => t.select(e.id)
					}) : /* @__PURE__ */ q(B, {
						bare: !0,
						disabled: n,
						fields: [r.type === "url" ? pt({
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
function tr({ node: e, type: t }) {
	let { settings: n } = D(), r = kt(e, 80);
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
function nr(e) {
	return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
}
function rr(e) {
	let t = document.createElement("div");
	return t.innerHTML = e.replace(/<br\s*\/?>/g, "\n"), t.textContent ?? "";
}
// admin/src/write/WriteEditor.tsx
var $ = /* @__PURE__ */ new Map(), ir = (e) => $.get(e) ?? $.get(e.split("/")[0] + "/*"), ar = (e) => !!ir(e), or = Bt(null);
function sr({ onInspect: t } = {}) {
	let { store: n, types: r, allowed: i, readOnly: a = !1 } = O(), o = T(n, (e) => e.nodes), s = I(() => De(o, r, ar), [o, r]), c = I(() => new Map(ee(s).map((e) => [S(e), e])), [s]), l = L(null), [u, d] = R(null), [f, p] = R(null), [m, h] = R(null), g = cn(sn(tn, { activationConstraint: { distance: 5 } })), _ = L(null), v = I(() => ({
		stops: () => {
			let e = n.get().nodes;
			return _.current?.nodes !== e && (_.current = {
				nodes: e,
				stops: pe(De(e, r, ar))
			}), _.current.stops;
		},
		settings: (e) => {
			n.select(e, !0), t ? t(e) : d(e);
		},
		readOnly: a
	}), [
		n,
		r,
		a,
		t
	]);
	Ut(() => {
		o.length === 0 && !a && j(null, "paragraph", r, i) && n.reset([E()]);
	}, [
		o,
		a,
		n,
		r,
		i
	]);
	let y = L(c);
	y.current = c, br(n, l, v, y);
	let b = (e, t, a) => {
		let o = n.get().nodes, s = a === "before" ? C(t)[0] : C(t).at(-1), c = C(e);
		if (c.some((e) => e.id === s.id || At(o, s.id).some((t) => t.id === e.id))) return null;
		let l = Mt(o, s.id);
		if (!l) return null;
		let u = l.parentId ? k(o, l.parentId) : null;
		return c.every((e) => j(u, e.type, r, u ? [] : i)) ? {
			ids: c.map((e) => e.id),
			parentId: l.parentId,
			index: a === "before" ? l.index : l.index + 1
		} : null;
	};
	return /* @__PURE__ */ q(e.Provider, {
		value: v,
		children: /* @__PURE__ */ J("div", {
			ref: l,
			className: "relative",
			"data-cms-write": !0,
			children: [
				/* @__PURE__ */ J($t, {
					sensors: g,
					collisionDetection: cr,
					onDragStart: (e) => h(c.get(String(e.active.id)) ?? null),
					onDragMove: (e) => {
						let t = c.get(String(e.active.id)), n = e.over ? c.get(String(e.over.id)) : null;
						if (!t || !n || e.over.id === e.active.id) return f && p(null);
						let r = e.activatorEvent.clientY + e.delta.y < e.over.rect.top + e.over.rect.height / 2 ? "before" : "after", i = b(t, n, r) ? {
							id: String(e.over.id),
							side: r
						} : null;
						(i?.id !== f?.id || i?.side !== f?.side) && p(i);
					},
					onDragEnd: (e) => {
						let t = c.get(String(e.active.id)), r = f ? c.get(f.id) : null;
						p(null), h(null);
						let i = t && r && f ? b(t, r, f.side) : null;
						i && n.moveTo(i.ids, i.parentId, i.index);
					},
					onDragCancel: () => {
						p(null), h(null);
					},
					children: [/* @__PURE__ */ q(or.Provider, {
						value: f,
						children: s.map((e, t) => /* @__PURE__ */ q(lr, {
							section: e,
							spaced: t > 0 && (e.container || s[t - 1].container)
						}, e.id))
					}), Qt(/* @__PURE__ */ q(en, {
						dropAnimation: null,
						children: m && /* @__PURE__ */ q(vr, { row: m })
					}), document.body)]
				}),
				!a && /* @__PURE__ */ q(W, {
					compact: !0,
					tabIndex: -1,
					"aria-label": N("Continue Writing"),
					onClick: () => {
						let e = v.stops().at(-1), t = e ? k(n.get().nodes, e.id) : null;
						if (t?.type === "paragraph" && jt(t.props.text)) return gt(n, e, "end");
						let a = n.get().nodes, o = s.at(-1), c = o?.container ? C(o.rows.at(-1)).at(-1).id : a.at(-1)?.id, l = c ? A(a, c, "paragraph", r, i) : {
							parentId: null,
							index: 0
						};
						if (!l) return;
						let u = E();
						n.insert(l.parentId, l.index, [u]), n.focus(u.id, "start");
					},
					className: "block h-28 w-full cursor-text"
				}),
				/* @__PURE__ */ q(at, {}),
				/* @__PURE__ */ q(yr, {}),
				u && !t && /* @__PURE__ */ q(Wt, {
					open: !0,
					onOpenChange: (e) => !e && d(null),
					title: N("Block"),
					children: k(o, u) && /* @__PURE__ */ q(mt, {
						node: k(o, u),
						onClose: () => d(null)
					})
				})
			]
		})
	});
}
var cr = (e) => {
	let t = rn(e);
	if (t.length === 0) return nn(e);
	let n = (t) => {
		let n = e.droppableRects.get(t);
		return n ? n.width * n.height : Infinity;
	};
	return [...t].sort((e, t) => n(e.id) - n(t.id)).slice(0, 1);
};
function lr({ section: e, spaced: t }) {
	return /* @__PURE__ */ J("section", {
		className: K("group/section relative", t && "mt-10"),
		children: [e.label && /* @__PURE__ */ q("div", {
			className: "pointer-events-none absolute right-[calc(100%+76px)] top-[5px] max-w-40 truncate whitespace-nowrap text-2xs text-faint opacity-0 transition-opacity duration-base group-focus-within/section:opacity-100 group-hover/section:opacity-100 max-xl:hidden",
			children: e.label
		}), e.rows.map((e, t) => /* @__PURE__ */ q(dr, {
			row: e,
			first: t === 0
		}, S(e)))]
	});
}
function ur(e, t) {
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
function dr({ row: e, first: t, nested: n }) {
	let { store: r } = O(), { readOnly: i } = D(), a = S(e), o = C(e).map((e) => e.id), s = T(r, (e) => e.blockMode && ht(e).some((e) => o.includes(e))), c = Ht(or), l = on({ id: a }), u = an({
		id: a,
		disabled: i
	}), { className: d, line: f } = ur(e, t);
	return /* @__PURE__ */ J("div", {
		ref: (e) => {
			l.setNodeRef(e), u.setNodeRef(e);
		},
		"data-row": a,
		"data-nested": n || void 0,
		style: { "--line": `${f}px` },
		className: K(n ? "group/nested" : "group/row", "relative py-[3px]", d, u.isDragging && "opacity-35", e.hidden && "opacity-45"),
		onMouseDown: (e) => {
			let t = e.target;
			t.closest("[data-row]") !== e.currentTarget || t.closest("[contenteditable=\"true\"],textarea,input,button,a,[role=\"button\"]") || (e.shiftKey && r.get().selected ? (e.preventDefault(), r.get().blockMode || r.select(r.get().selected, !0), r.extendTo(o.at(-1))) : (r.select(o[0], !0), o.length > 1 && r.extendTo(o.at(-1))));
		},
		children: [
			c?.id === a && /* @__PURE__ */ q("div", { className: K("pointer-events-none absolute inset-x-0 z-raised h-0.5 rounded-full bg-focus", c.side === "before" ? "-top-px" : "-bottom-px") }),
			!i && /* @__PURE__ */ q(mr, {
				row: e,
				handle: u,
				nested: n
			}),
			/* @__PURE__ */ q("div", {
				className: K("rounded-sm transition-[background-color,box-shadow] duration-fast", s && "bg-focus/10 ring-3 ring-focus/10"),
				children: /* @__PURE__ */ q(fr, { row: e })
			})
		]
	});
}
function fr({ row: e }) {
	let { types: t } = O(), { settings: n } = D();
	if (e.kind === "text") return /* @__PURE__ */ q(xe, { node: e.node });
	if (e.kind === "list") return /* @__PURE__ */ q(Ce, { node: e.node });
	if (e.kind === "actions") return /* @__PURE__ */ q(Hn, { nodes: e.nodes });
	if (e.kind === "container") {
		let r = t.get(e.node.type);
		return /* @__PURE__ */ J("div", {
			className: "rounded-md border border-border/70 px-4 pb-3 pt-2",
			children: [/* @__PURE__ */ J(W, {
				compact: !0,
				onClick: () => n(e.node.id),
				className: "mb-2 flex max-w-full items-center gap-1.5 text-xs text-faint hover:text-text",
				children: [/* @__PURE__ */ q(V, {
					name: r?.icon ?? "square",
					size: 12
				}), /* @__PURE__ */ q("span", {
					className: "truncate",
					children: e.node.label || r?.title || e.node.type
				})]
			}), e.rows.length ? e.rows.map((e, t) => /* @__PURE__ */ q(dr, {
				row: e,
				first: t === 0,
				nested: !0
			}, S(e))) : /* @__PURE__ */ q(pr, { column: e.node })]
		});
	}
	if (e.kind === "columns") {
		let t = String(e.node.props.layout ?? "1-1").split("-").map((e) => `minmax(0,${e}fr)`).join(" ");
		return /* @__PURE__ */ q("div", {
			className: "grid gap-8 py-1 max-md:!grid-cols-1",
			style: { gridTemplateColumns: t },
			children: e.columns.map((e) => /* @__PURE__ */ q("div", {
				className: "min-w-0",
				children: e.rows.length ? e.rows.map((e, t) => /* @__PURE__ */ q(dr, {
					row: e,
					first: t === 0,
					nested: !0
				}, S(e))) : /* @__PURE__ */ q(pr, { column: e.node })
			}, e.node.id))
		});
	}
	let r = e.node, i = t.get(r.type), a = ir(r.type);
	if (a) return /* @__PURE__ */ q(a, {
		node: r,
		type: i,
		onSettings: n
	});
	switch (r.type) {
		case "image": return /* @__PURE__ */ q(Kn, { node: r });
		case "video":
		case "embed": return /* @__PURE__ */ q(Yn, {
			node: r,
			type: i
		});
		case "code": return /* @__PURE__ */ q(Zn, { node: r });
		case "table": return /* @__PURE__ */ q(Qn, { node: r });
		case "divider": return /* @__PURE__ */ q(Vn, {});
		case "accordion": return /* @__PURE__ */ q($n, { node: r });
		case "component": return /* @__PURE__ */ q(er, { node: r });
		default: return /* @__PURE__ */ q(tr, {
			node: r,
			type: i
		});
	}
}
function pr({ column: e }) {
	let { store: t, types: n } = O(), { readOnly: r } = D();
	return r || !j(e, "paragraph", n, []) ? null : /* @__PURE__ */ q(W, {
		compact: !0,
		onClick: () => {
			let n = E();
			t.insert(e.id, 0, [n]), t.focus(n.id, "start");
		},
		className: K(g, "block w-full cursor-text py-[3px] text-left text-faint opacity-0 hover:opacity-100"),
		children: N("Write here")
	});
}
function mr({ row: e, handle: t, nested: n }) {
	let { store: r, types: i, allowed: a } = O(), o = D(), [s, c] = R(!1), [l, u] = R(""), d = T(r, (t) => t.blockMode && C(e).some((e) => e.id === t.selected)), f = C(e).at(-1), p = (e) => {
		let t = Ft(e, i), n = A(r.get().nodes, f.id, t.map((e) => e.type), i, a);
		c(!1), u(""), n && (r.insert(n.parentId, n.index, t), Ve(r, t[0], o.stops()));
	};
	return /* @__PURE__ */ J("div", {
		className: K("absolute top-[3px] z-raised flex h-[var(--line)] items-center gap-0.5 opacity-0 transition-opacity duration-fast focus-within:opacity-100", n ? "-left-[22px] group-hover/nested:opacity-100" : "-left-[54px] group-hover/row:opacity-100 group-has-[[data-nested]:hover]/row:!opacity-0", (s || d) && "!opacity-100"),
		children: [!n && /* @__PURE__ */ q(U, {
			open: s,
			onOpenChange: (e) => {
				c(e), e || u("");
			},
			align: "start",
			className: "!p-0",
			trigger: /* @__PURE__ */ q(H, {
				icon: "plus",
				label: N("Add Below"),
				size: "xs",
				className: "!text-faint hover:!text-text"
			}),
			children: /* @__PURE__ */ q(Pe, {
				types: [...i.values()],
				query: l,
				onQuery: u,
				onChoose: p,
				onClose: () => c(!1),
				allowed: (e) => !!A(r.get().nodes, f.id, e.name, i, a)
			})
		}), /* @__PURE__ */ q(Gt, {
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
			items: gr(r, e, i, a, o)
		})]
	});
}
var hr = [
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
function gr(e, t, n, r, i) {
	let a = C(t), o = a[0], s = t.kind === "text" || t.kind === "list", c = () => o.type === "list" ? (o.props.items ?? []).join("<br>") : String(o.props.text ?? ""), l = (e) => e.type === o.type && Object.entries(e.props).every(([e, t]) => String(o.props[e] ?? (e !== "ordered" && "")) === String(t)), u = (t) => () => {
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
	}, d = a.length === 1, f = t.parent ? k(e.get().nodes, t.parent) : null;
	return [
		...s ? [
			{
				label: N("Turn Into"),
				heading: !0
			},
			...hr.filter((e) => n.has(e.type) && j(f, e.type, n, f ? [] : r)).map((e) => ({
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
			onSelect: () => _r(e, a.map((e) => e.id))
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
			onSelect: () => e.commit(a.reduce((e, t) => Nt(e, t.id), e.get().nodes))
		}
	];
}
function _r(e, t) {
	let n = e.get().nodes, r = t.map((e) => k(n, e)).filter((e) => !!e).map(It), i = Mt(n, t.at(-1));
	i && r.length !== 0 && (e.insert(i.parentId, i.index + 1, r), e.select(r[0].id, !0), r.length > 1 && e.extendTo(r.at(-1).id));
}
function vr({ row: e }) {
	let t = C(e).map((e) => kt(e, 60)).filter(Boolean).join(" · ");
	return /* @__PURE__ */ q("div", {
		className: "cms-pop max-w-[360px] truncate px-3 py-1.5 text-sm text-muted",
		children: t || N("Block")
	});
}
function yr() {
	let { store: e, types: t, allowed: n } = O(), r = D(), i = te(), [a, o] = R(null);
	if (P("components/list", {}, { staleTime: 6e4 }), F(() => {
		if (!i) return o(null);
		let e = requestAnimationFrame(() => {
			let e = document.querySelector(`[data-row="${i.id}"] [contenteditable]`);
			o(vt() ?? e?.getBoundingClientRect() ?? null);
		});
		return () => cancelAnimationFrame(e);
	}, [i]), F(() => {
		if (!i) return;
		let e = () => !document.activeElement?.closest(`[data-row="${i.id}"]`) && x(null);
		return document.addEventListener("focusin", e), () => document.removeEventListener("focusin", e);
	}, [i]), ct(!!i, [document]), !i || !a) return null;
	let s = (a) => {
		let o = Ft(a, t), s = e.get().nodes, c = Mt(s, i.id);
		if (x(null), !c) return;
		let l = c.parentId ? k(s, c.parentId) : null;
		if (o.every((e) => j(l, e.type, t, l ? [] : n))) e.commit(Rt(Nt(s, i.id), c.parentId, c.index, o));
		else {
			let r = A(s, i.id, o.map((e) => e.type), t, n);
			if (!r) return;
			e.commit(Rt(Nt(s, i.id), r.parentId, r.index, o));
		}
		Ve(e, o[0], r.stops());
	}, { maxHeight: c, ...l } = m(a);
	return Qt(/* @__PURE__ */ q("div", {
		"data-cms-slash": !0,
		className: "cms-pop fixed z-overlay overflow-hidden !p-0",
		style: l,
		children: /* @__PURE__ */ q(Pe, {
			types: [...t.values()],
			query: i.query,
			chooseFirst: i.enter,
			components: n.length === 0 || n.includes("component"),
			onNoMatch: () => {
				let e = document.querySelector(`[data-row="${i.id}"] [contenteditable]`);
				x(null), e?.dispatchEvent(new KeyboardEvent("keydown", {
					key: "Enter",
					bubbles: !0,
					cancelable: !0
				}));
			},
			showSearch: !1,
			compact: !0,
			style: { maxHeight: c },
			onChoose: s,
			onClose: () => x(null),
			allowed: (r) => !!A(e.get().nodes, i.id, r.name, t, n)
		})
	}), document.body);
}
function br(e, t, n, r) {
	F(() => {
		let i = (i) => {
			if (i.defaultPrevented) return;
			let a = t.current?.contains(document.activeElement) || t.current?.contains(i.target), { selected: o, blockMode: s, nodes: c } = e.get(), l = i.metaKey || i.ctrlKey, u = document.activeElement === document.body || !document.activeElement;
			if (l && i.key.toLowerCase() === "z" && (a || s || u)) {
				i.preventDefault();
				let t = a && document.activeElement?.isContentEditable;
				document.activeElement?.blur(), i.shiftKey ? e.redo() : e.undo();
				let r = t && o ? n.stops().find((e) => e.id === o) : null;
				r && gt(e, r, "end");
				return;
			}
			if (!s || !o || n.readOnly || i.target?.closest?.("input,textarea,[contenteditable=\"true\"],[role=\"dialog\"],[data-cms-settings]")) return;
			let d = [...r.current.values()], f = d.findIndex((e) => C(e).some((e) => e.id === o)), p = d[f], m = (t) => {
				if (!t) return;
				let n = C(t).map((e) => e.id);
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
				let t = n.stops().find((e) => e.id === o), r = p ? C(p)[0] : null;
				t ? gt(e, t, "end") : r && n.settings(r.id);
			} else if (i.key === "Backspace" || i.key === "Delete") {
				i.preventDefault();
				let t = d[f - 1] ?? d.slice(f + 1).find((t) => !C(t).some((t) => e.selection().includes(t.id)));
				e.removeSelection(), m(t);
			} else if (l && i.key.toLowerCase() === "d") i.preventDefault(), _r(e, e.selection());
			else if (l && (i.key.toLowerCase() === "c" || i.key.toLowerCase() === "x")) {
				let t = e.selection().map((e) => k(c, e)).filter(Boolean);
				if (t.length === 0) return;
				i.preventDefault(), navigator.clipboard.writeText("cms-blocks:" + JSON.stringify(t)), i.key.toLowerCase() === "x" && e.removeSelection();
			} else l && i.key.toLowerCase() === "v" ? (i.preventDefault(), navigator.clipboard.readText().then((t) => {
				if (!t.startsWith("cms-blocks:")) return;
				let n = JSON.parse(t.slice(12)).map(It);
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
// admin/src/builder/specimen.tsx
function xr(e, t) {
	let [n] = R(() => typeof CSSStyleSheet < "u" ? new CSSStyleSheet() : null), [r, i] = R(!1), a = t.join(" ");
	return F(() => {
		if (n && e) try {
			n.replaceSync(e.build(t)), i(!0);
		} catch (e) {
			console.error(e);
		}
	}, [
		n,
		e,
		a
	]), r ? n : null;
}
function Sr({ sheet: e, node: t, page: n, mode: r, className: i, align: a = "start" }) {
	let o = L(null);
	return Ut(() => {
		let i = o.current;
		if (!i) return;
		let s = i.shadowRoot ?? i.attachShadow({ mode: "open" });
		s.adoptedStyleSheets = e ? [e] : [];
		let c = document.createElement("div");
		c.className = n, c.setAttribute("data-size", "md"), c.setAttribute("data-theme", r), c.style.cssText = `color-scheme:${r};background:var(--color-background);color:var(--color-foreground);padding:0 10px;box-sizing:border-box;display:flex;align-items:center;justify-content:${a === "center" ? "center" : "flex-start"};height:100%;overflow:hidden;min-height:0;margin:0`;
		let l = document.createElement("div");
		if (l.style.cssText = `transform-origin:${a === "center" ? "center" : "left"} center;flex:none;max-width:none;${t.markup ? "width:min(100%,22rem)" : "white-space:nowrap"}`, t.markup) l.innerHTML = t.markup;
		else {
			let e = document.createElement(t.tag);
			e.textContent = t.text, t.className && (e.className = t.className);
			for (let [n, r] of Object.entries(t.attributes ?? {})) e.setAttribute(n, r);
			e.style.margin = "0", l.appendChild(e);
		}
		c.appendChild(l), s.replaceChildren(c);
		let u = () => {
			l.style.transform = "";
			let e = i.getBoundingClientRect(), t = l.getBoundingClientRect(), n = Math.min(1, (e.width - 20) / Math.max(1, t.width, l.scrollWidth), e.height / Math.max(1, t.height, l.scrollHeight));
			n < 1 && (l.style.transform = `scale(${n})`);
		};
		u();
		let d = new ResizeObserver(u);
		return d.observe(i), document.fonts?.ready.then(u), () => d.disconnect();
	}, [
		e,
		t.tag,
		t.text,
		t.className,
		t.markup,
		JSON.stringify(t.attributes),
		n,
		r,
		a
	]), /* @__PURE__ */ q("div", {
		ref: o,
		"aria-hidden": "true",
		className: K("min-w-0 overflow-hidden", i)
	});
}
var Cr = (e) => e.replace(/^(btn|scheme)-/, "").split("-").filter(Boolean).map((e) => e.charAt(0).toUpperCase() + e.slice(1)).join(" ");
function wr(e) {
	return e.startsWith("btn-") ? {
		tag: "span",
		text: Cr(e),
		className: `cms-button ${e}`
	} : e.startsWith("scheme-") ? {
		tag: "span",
		text: Cr(e),
		className: `${e} inline-block rounded-md px-4 py-2`
	} : {
		tag: "span",
		text: Cr(e),
		className: e
	};
}
In(), M.fields.set("blocks", ln), Pn(), M.fields.set("blocks-icon", Bn), M.panels.set("blocks-editor", {
	slot: "entry.editor",
	label: N("Block Editor"),
	icon: "layout",
	component: Vt(() => import("./chunks/BlocksWorkspace-DuKXkrMh.js").then((e) => ({ default: e.BlocksWorkspace }))),
	when: (e) => e.bodyField.type === "blocks"
}), M.widgets.set("blocks-design", Vt(() => import("./chunks/WidgetDesign-BsI0HI9G.js"))), $.set("audio", Yn), $.set("file", Yn), $.set("gallery", Xn);
export { Ie as ARTICLE, Le as ClassChips, Se as ClassStyle, Ke as ColorField, We as ColorPicker, wt as ELEMENTS, dt as EditorProvider, Be as EditorStore, Te as Engine, ve as FIELDS, l as GRADIENT_MARKERS, mt as Inspector, re as InspectorSection, de as PanelFields, $e as SCHEME, ue as SPACING_STEPS, rt as STYLE_GROUPS, _t as SchemeTile, le as SpacingChips, Sr as Specimen, Je as StateMenu, Me as StyleBar, ut as StylePanels, s as Stylesheet, ze as StylingProvider, he as Swatch, Ze as TokenButton, n as TokenChip, Ye as TokenList, sr as WriteEditor, h as arbitrary, it as askStyleName, St as balanced, $ as blockViews, Qe as colorGroups, r as dataStates, ne as everyScreen, Y as formatShadows, Xe as gradientOf, oe as gradientUtilities, lt as layerOf, ce as layerUsed, fe as lightDark, Ue as loadCompiler, st as loadEngine, nt as loadTailwindTheme, p as onLayer, b as parseClass, wn as parseShadows, y as partUtility, Re as schemesOf, qe as screenFor, Oe as screenVariant, ie as searchClasses, ge as shownInState, be as shownVariable, Ot as spacingChoices, Ee as splitClasses, a as splitSiteClasses, ft as stateLabel, we as styleApi, wr as styleSample, d as themeDefaults, ke as themeReference, Ge as tokensOf, Ne as useCatalog, T as useEditor, O as useEditorContext, je as useEngine, xr as useSpecimenSheet, bt as useStyling, Et as useThemeTokens, _ as usedVariants, yt as withAlpha, me as withVariants };
