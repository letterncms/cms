import { $ as e, $t as t, A as n, At as r, B as i, Bt as a, C as o, D as s, Dt as c, E as l, Et as u, F as d, Ft as f, G as p, Gt as m, H as h, Ht as g, I as _, It as ee, J as te, Jt as ne, K as re, Kt as ie, L as ae, Lt as oe, M as se, Mt as ce, N as le, Nt as ue, O as de, Ot as fe, P as pe, Pt as me, Q as he, Qt as ge, R as _e, Rt as ve, S as ye, St as v, T as be, Tt as xe, U as Se, Ut as Ce, V as we, Vt as Te, W as Ee, Wt as De, X as Oe, Xt as ke, Y as Ae, Yt as je, Z as Me, Zt as Ne, _ as Pe, _t as Fe, a as Ie, an as y, at as Le, b as Re, bt as b, c as ze, cn as Be, ct as Ve, d as He, dt as Ue, en as We, et as x, f as Ge, ft as Ke, g as qe, gt as S, h as Je, ht as C, i as Ye, in as Xe, it as Ze, j as Qe, jt as $e, k as w, kt as et, l as tt, lt as T, m as nt, mt as rt, n as it, nn as at, nt as ot, o as st, on as ct, ot as lt, p as ut, pt as dt, q as ft, qt as pt, r as mt, rn as ht, rt as gt, s as _t, st as vt, t as E, tn as yt, tt as bt, u as xt, un as D, ut as St, v as Ct, vt as wt, w as Tt, wt as Et, x as Dt, xt as Ot, y as kt, yt as At, z as jt, zt as Mt } from "./chunks/Inspector-C29q4sX7.js";
import { _ as Nt, a as Pt, c as O, d as Ft, f as k, h as A, i as j, l as It, n as Lt, o as Rt, s as zt, t as M, u as Bt } from "./chunks/insert-DSPXdALv.js";
import { navigate as Vt, registry as N, t as P, useAbility as F } from "@letterncms/sdk";
import { createContext as Ht, lazy as Ut, useContext as Wt, useEffect as I, useLayoutEffect as Gt, useMemo as L, useRef as R, useState as z } from "react";
import { Button as B, Fields as V, Icon as H, IconButton as U, InspectorPanel as Kt, Menu as qt, Popover as W, Pressable as G, QueryError as Jt, Segmented as Yt, Spinner as Xt, cn as K, fieldControlId as Zt } from "@letterncms/ui";
import { Fragment as Qt, jsx as q, jsxs as J } from "react/jsx-runtime";
import { createPortal as $t } from "react-dom";
import { DndContext as en, DragOverlay as tn, PointerSensor as nn, closestCenter as rn, pointerWithin as an, useDraggable as on, useDroppable as sn, useSensor as cn, useSensors as ln } from "@dnd-kit/core";
// admin/src/BlocksField.tsx
function un({ field: e, value: t, onChange: n, context: r, disabled: i }) {
	let { catalog: a, types: o, isLoading: s, error: c, retry: l } = Be(), u = at(t, n, !!i), [d, f] = z(null), p = y(u, (e) => e.nodes), m = R(r);
	if (m.current = r, s) return /* @__PURE__ */ q("div", {
		className: "flex h-24 items-center justify-center text-faint",
		children: /* @__PURE__ */ q(Xt, {})
	});
	if (!a) return /* @__PURE__ */ q(Jt, {
		message: c?.message,
		onRetry: l
	});
	let h = {
		store: u,
		types: o,
		catalog: a,
		entryId: r.entry?.id ?? null,
		fieldHandle: e.handle,
		allowed: e.allowed ?? [],
		getValues: () => m.current.values ?? {},
		title: r.title ?? r.entry?.title ?? "",
		readOnly: !!i
	};
	return /* @__PURE__ */ J(ct, {
		value: h,
		children: [/* @__PURE__ */ q("div", {
			className: "h-[480px] min-w-0 overflow-hidden rounded-sm border border-border",
			children: /* @__PURE__ */ q(Le, {
				collection: r.collection,
				blueprint: r.blueprint,
				entryId: r.entry?.id,
				content: {
					title: r.title ?? r.entry?.title ?? "",
					slug: r.entry?.slug ?? "",
					authorId: r.entry?.authorId ?? null,
					data: {
						...r.values ?? r.entry?.data ?? {},
						[e.handle]: t ?? []
					}
				},
				onInspect: f,
				standalone: !0
			})
		}), /* @__PURE__ */ J(Kt, {
			docked: !1,
			open: !!d,
			onOpenChange: (e) => !e && f(null),
			title: P("Block Settings"),
			children: [/* @__PURE__ */ q("div", {
				className: "flex h-10 shrink-0 items-center justify-end border-b border-border px-2",
				children: /* @__PURE__ */ q(U, {
					icon: "close",
					label: P("Close Panel"),
					size: "xs",
					onClick: () => f(null)
				})
			}), d && O(p, d) && /* @__PURE__ */ q(E, {
				node: O(p, d),
				onClose: () => f(null)
			})]
		})]
	});
}
// admin/src/builder/content/BindField.tsx
function dn({ field: e, value: t, onChange: n, disabled: r }) {
	let [i, a] = z(!1), [o, s] = z(null), c = t ?? void 0, l = e.paths ?? [], u = [...new Set(l.map((e) => e.group))], d = l.find((e) => e.path === c)?.label;
	return /* @__PURE__ */ J(w, { children: [/* @__PURE__ */ J("div", {
		className: "relative flex min-w-0 flex-1 items-center",
		children: [/* @__PURE__ */ q(H, {
			name: "database",
			size: 13,
			className: "pointer-events-none absolute left-2 text-ink"
		}), /* @__PURE__ */ q("input", {
			id: Zt(e),
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
			className: K(Ze, "!pl-7 font-mono text-ink placeholder:font-sans")
		})]
	}), /* @__PURE__ */ J(W, {
		open: i,
		onOpenChange: a,
		align: "end",
		className: "w-64 !p-1",
		trigger: /* @__PURE__ */ q(U, {
			icon: "chevron-down",
			size: "xs",
			label: P("Choose Data")
		}),
		children: [/* @__PURE__ */ q("div", {
			className: "max-h-80 overflow-y-auto",
			children: u.map((e) => /* @__PURE__ */ J("div", {
				className: "py-1",
				children: [/* @__PURE__ */ q("p", {
					className: "cms-label m-0 px-2 pb-1",
					children: e
				}), l.filter((t) => t.group === e).map((e) => /* @__PURE__ */ J(B, {
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
						c === e.path && /* @__PURE__ */ q(H, {
							name: "check",
							size: 11,
							className: "shrink-0"
						})
					]
				}, e.path))]
			}, e))
		}), /* @__PURE__ */ J("p", {
			className: "m-0 border-t border-border px-2 py-1.5 font-mono text-2xs leading-relaxed text-faint",
			title: P("Filters, and text mixed with data"),
			children: ["|date:M j, Y · |excerpt:120 · |upper · |default:Text · By ", "{entry.author}"]
		})]
	})] });
}
// admin/src/builder/fields/nodes.tsx
function fn({ field: e, ...t }) {
	let { store: r, types: i } = D(), a = y(r, (e) => e.nodes), o = It(a).filter(({ node: t }) => t.id !== e.exclude).map(({ node: e, depth: t }) => ({
		value: e.id,
		label: `${"  ".repeat(t)}${e.label || Nt(e, 28) || i.get(e.type)?.title || e.type}`
	}));
	return /* @__PURE__ */ q(n, {
		...t,
		field: {
			...e,
			type: "select",
			component: void 0,
			size: "sm",
			options: o,
			placeholder: e.placeholder ?? P("Choose an Element")
		}
	});
}
function pn({ field: e, value: t, onChange: n, disabled: r, context: i }) {
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
			children: [/* @__PURE__ */ q(fn, {
				field: {
					...o,
					handle: `${e.handle}-${s}`
				},
				value: t,
				onChange: (e) => n(e ? a.map((t, n) => n === s ? e : t) : a.filter((e, t) => t !== s)),
				disabled: r,
				context: i
			}), /* @__PURE__ */ q(x, { onClick: () => n(a.filter((e, t) => t !== s)) })]
		}, s)), /* @__PURE__ */ J(G, {
			compact: !0,
			onClick: () => n([...a, e.addValue]),
			className: "text-xs text-muted hover:text-text",
			children: ["+ ", e.add ?? P("Element")]
		})]
	});
}
// admin/src/builder/fields/clip.tsx
var mn = [
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
], hn = (e) => e.replace(/\s+/g, " ").replace(/\b0%/g, "0").trim();
function gn(e) {
	if (!e || e === "none") return "none";
	let t = e.match(/^(inset|circle|ellipse|polygon)\(/);
	return t ? t[1] : "custom";
}
var _n = (e, t) => e?.match(RegExp(`^${t}\\((.*)\\)$`))?.[1] ?? "";
function vn(e) {
	let [t, n] = _n(e, "inset").split(/\s+round\s+/), r = Tt(t || "0") ?? [
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
function yn(e, t) {
	let [n, r] = _n(e, t).split(/\s+at\s+/), i = l(n || ""), a = l(r || "50% 50%");
	return {
		rx: i[0] ?? "50%",
		ry: i[1] ?? i[0] ?? "50%",
		x: a[0] ?? "50%",
		y: a[1] ?? "50%"
	};
}
function bn({ field: e, value: t, onChange: r, context: i, disabled: a }) {
	let o = t ?? void 0, [s, c] = z(!1), l = s && o ? "custom" : gn(o), u = (t, n, r = {}) => ({
		handle: `${e.handle}-${t}`,
		type: "text",
		component: "blocks-value",
		label: n,
		...r
	}), d = (e) => {
		if (c(e === "custom"), e === "custom") return o ? void 0 : r("inset(0)");
		if (!e || e === "none") return r(null);
		if (e === "inset") return r("inset(0 round 12px)");
		if (e === "circle") return r("circle(50% at 50% 50%)");
		if (e === "ellipse") return r("ellipse(50% 40% at 50% 50%)");
		r(mn[0].value);
	}, f = vn(o), p = (e) => {
		let t = {
			...f,
			...e
		}, n = [
			t.top,
			t.right,
			t.bottom,
			t.left
		].map((e) => e || "0");
		r(`inset(${n.every((e) => e === n[0]) ? n[0] : n.join(" ")}${t.round ? ` round ${t.round}` : ""})`);
	}, m = l === "circle" || l === "ellipse" ? yn(o, l) : null, h = (e) => {
		let t = {
			...m,
			...e
		};
		r(l === "circle" ? `circle(${t.rx} at ${t.x} ${t.y})` : `ellipse(${t.rx} ${t.ry} at ${t.x} ${t.y})`);
	}, g = l === "polygon" ? mn.find((e) => hn(e.value) === hn(o)) : void 0;
	return /* @__PURE__ */ J("div", {
		className: "min-w-0 flex-1 space-y-1",
		children: [
			/* @__PURE__ */ q(n, {
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
				value: l === "none" ? null : l,
				onChange: (e) => d(e),
				disabled: a,
				context: i
			}),
			l === "inset" && /* @__PURE__ */ J(Qt, { children: [/* @__PURE__ */ J(w, {
				className: "grid grid-cols-2 gap-1",
				children: [
					/* @__PURE__ */ q(n, {
						field: u("top", P("Top"), {
							prefix: "T",
							placeholder: "0",
							units: ["px", "%"]
						}),
						value: f.top,
						onChange: (e) => p({ top: e ?? "0" }),
						context: i
					}),
					/* @__PURE__ */ q(n, {
						field: u("right", P("Right"), {
							prefix: "R",
							placeholder: "0",
							units: ["px", "%"]
						}),
						value: f.right,
						onChange: (e) => p({ right: e ?? "0" }),
						context: i
					}),
					/* @__PURE__ */ q(n, {
						field: u("bottom", P("Bottom"), {
							prefix: "B",
							placeholder: "0",
							units: ["px", "%"]
						}),
						value: f.bottom,
						onChange: (e) => p({ bottom: e ?? "0" }),
						context: i
					}),
					/* @__PURE__ */ q(n, {
						field: u("left", P("Left"), {
							prefix: "L",
							placeholder: "0",
							units: ["px", "%"]
						}),
						value: f.left,
						onChange: (e) => p({ left: e ?? "0" }),
						context: i
					})
				]
			}), /* @__PURE__ */ q(n, {
				field: u("round", P("Corner Radius"), {
					prefix: "◜",
					placeholder: P("Corners"),
					group: "radius"
				}),
				value: f.round || null,
				onChange: (e) => p({ round: e ?? "" }),
				context: i
			})] }),
			m && /* @__PURE__ */ J(w, {
				className: "grid grid-cols-2 gap-1",
				children: [
					/* @__PURE__ */ q(n, {
						field: u("rx", P(l === "circle" ? "Radius" : "Width Radius"), {
							prefix: l === "circle" ? "R" : "W",
							unit: "%",
							units: ["%", "px"]
						}),
						value: m.rx,
						onChange: (e) => h({ rx: e ?? "50%" }),
						context: i
					}),
					l === "ellipse" ? /* @__PURE__ */ q(n, {
						field: u("ry", P("Height Radius"), {
							prefix: "H",
							unit: "%",
							units: ["%", "px"]
						}),
						value: m.ry,
						onChange: (e) => h({ ry: e ?? "50%" }),
						context: i
					}) : /* @__PURE__ */ q("span", {}),
					/* @__PURE__ */ q(n, {
						field: u("x", P("Center X"), {
							prefix: "X",
							unit: "%",
							units: ["%", "px"]
						}),
						value: m.x,
						onChange: (e) => h({ x: e ?? "50%" }),
						context: i
					}),
					/* @__PURE__ */ q(n, {
						field: u("y", P("Center Y"), {
							prefix: "Y",
							unit: "%",
							units: ["%", "px"]
						}),
						value: m.y,
						onChange: (e) => h({ y: e ?? "50%" }),
						context: i
					})
				]
			}),
			l === "polygon" && /* @__PURE__ */ q("div", {
				className: "grid grid-cols-5 gap-1",
				children: mn.map((e) => /* @__PURE__ */ q(G, {
					compact: !0,
					title: e.label(),
					"aria-label": e.label(),
					"aria-pressed": g?.id === e.id,
					onClick: () => r(e.value),
					className: K("grid aspect-square place-items-center rounded-xs border", g?.id === e.id ? "border-focus bg-focus/8" : "border-border hover:bg-hover"),
					children: /* @__PURE__ */ q("span", {
						className: K("size-4", g?.id === e.id ? "bg-focus" : "bg-muted"),
						style: { clipPath: e.value }
					})
				}, e.id))
			}),
			(l === "custom" || l === "polygon" && !g) && /* @__PURE__ */ q(n, {
				field: u("raw", e.label, {
					unit: "",
					placeholder: "polygon(…)"
				}),
				value: o ?? null,
				onChange: (e) => r(e || null),
				context: i
			})
		]
	});
}
// admin/src/builder/fields/conditions.tsx
var xn = () => [
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
function Sn({ field: e, value: t, onChange: r, disabled: i, context: a }) {
	let o = Array.isArray(t) ? t : [], s = (e) => r(e.length ? e : null), c = (e, t) => s(o.map((n, r) => r === e ? {
		...n,
		...t
	} : n));
	return /* @__PURE__ */ J("div", {
		className: "min-w-0 flex-1 space-y-1",
		children: [o.map((t, r) => /* @__PURE__ */ J("div", {
			className: "flex items-center gap-1",
			children: [
				/* @__PURE__ */ q(n, {
					field: {
						handle: `${e.handle}-${r}-field`,
						type: "text",
						size: "sm",
						commit: "blur",
						label: P("Field"),
						placeholder: P("Field"),
						mono: !0,
						className: "!w-[34%] !flex-none"
					},
					value: t.field ?? null,
					onChange: (e) => c(r, { field: String(e ?? "").trim() }),
					disabled: i,
					context: a
				}),
				/* @__PURE__ */ q(n, {
					field: {
						handle: `${e.handle}-${r}-op`,
						type: "select",
						size: "sm",
						required: !0,
						label: P("Comparison"),
						options: xn(),
						className: "!flex-none w-[92px]"
					},
					value: t.op ?? "=",
					onChange: (e) => c(r, { op: String(e ?? "=") }),
					disabled: i,
					context: a
				}),
				!["null", "not null"].includes(t.op ?? "") && /* @__PURE__ */ q(n, {
					field: {
						handle: `${e.handle}-${r}-value`,
						type: "text",
						size: "sm",
						commit: "blur",
						label: P("Value"),
						placeholder: P("Value")
					},
					value: t.value === void 0 || t.value === null ? null : String(t.value),
					onChange: (e) => c(r, { value: e ?? "" }),
					disabled: i,
					context: a
				}),
				/* @__PURE__ */ q(x, {
					label: P("Remove Condition"),
					onClick: () => s(o.filter((e, t) => t !== r))
				})
			]
		}, r)), /* @__PURE__ */ J(G, {
			compact: !0,
			disabled: i,
			onClick: () => s([...o, {
				field: "",
				op: "=",
				value: ""
			}]),
			className: "-ml-2 inline-flex h-7 items-center gap-1.5 rounded-sm px-2 text-xs text-muted hover:bg-hover hover:text-ink",
			children: [/* @__PURE__ */ q(H, {
				name: "plus",
				size: 13
			}), P("Add Condition")]
		})]
	});
}
// admin/src/builder/fields/inlineText.tsx
function Cn({ field: e, value: t, onChange: n, disabled: r }) {
	let i = R(null);
	return I(() => {
		i.current && i.current.innerHTML !== (t ?? "") && document.activeElement !== i.current && (i.current.innerHTML = t ?? "");
	}, [t]), /* @__PURE__ */ q("div", {
		ref: i,
		id: Zt(e),
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
		className: K(Ze, "cursor-text overflow-hidden whitespace-nowrap leading-[26px] outline-none [&_*]:inline empty:before:text-ghost empty:before:content-[attr(data-placeholder)]")
	});
}
// admin/src/builder/fields/shadows.tsx
var wn = /^-?[\d.]+(px|rem|em)?$/;
function Tn(e) {
	return !e || e === "none" ? [] : /^var\(--[\w-]+\)$/.test(e.trim()) ? null : be(e).map((e) => {
		let t = l(e), n = t.includes("inset"), r = t.filter((e) => e !== "inset"), i = r.filter((e) => wn.test(e)), a = r.find((e) => !wn.test(e)) ?? "rgb(0 0 0 / 15%)";
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
var En = {
	inset: !1,
	x: "0px",
	y: "8px",
	blur: "24px",
	spread: "-8px",
	color: "rgb(0 0 0 / 18%)"
}, Dn = {
	inset: !1,
	x: "0px",
	y: "1px",
	blur: "2px",
	spread: "0",
	color: "rgb(0 0 0 / 25%)"
}, On = (e) => e.replace(/px$/, "");
function kn({ field: t, value: n, onChange: r, context: i }) {
	let a = t.kind === "text", o = a ? void 0 : t.group ?? "shadow", s = _(), c = Dt(), [l, u] = z(null), d = s(n), f = Tn(n) ?? [], p = (e) => r(Y(e, a));
	return /* @__PURE__ */ J("div", {
		className: "min-w-0 flex-1",
		children: [
			/* @__PURE__ */ J("div", {
				className: "group/value flex h-7 items-center gap-2",
				children: [
					/* @__PURE__ */ q(bt, { field: t }),
					/* @__PURE__ */ q("span", {
						className: "min-w-0 flex-1 truncate text-xs text-faint",
						children: !d && !f.length && typeof t.placeholder == "string" ? t.placeholder : ""
					}),
					o && /* @__PURE__ */ q(le, {
						group: o,
						value: n,
						onPick: r,
						active: !!d,
						className: "size-6"
					}),
					!d && /* @__PURE__ */ q(he, {
						label: P(a ? "Add Text Shadow" : "Add Shadow"),
						onClick: () => {
							p([...f, a ? Dn : En]), u(f.length);
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
					/* @__PURE__ */ q(pe, {
						token: d.token,
						className: "text-xs"
					}),
					/* @__PURE__ */ q("span", { className: "flex-1" }),
					/* @__PURE__ */ q(x, {
						label: P("Remove Shadow"),
						onClick: () => r(null)
					})
				]
			}),
			f.map((t, n) => /* @__PURE__ */ J("div", {
				className: "flex h-7 items-center gap-1 pl-[88px]",
				children: [/* @__PURE__ */ J(W, {
					open: l === n,
					onOpenChange: (e) => u(e ? n : null),
					align: "end",
					className: "w-64 !p-2",
					trigger: /* @__PURE__ */ J(G, {
						compact: !0,
						className: K("flex h-7 min-w-0 flex-1 items-center gap-1.5 rounded-sm px-1.5 text-left text-xs hover:bg-hover", l === n && "bg-active"),
						children: [
							a ? /* @__PURE__ */ q("span", {
								className: "grid size-4 shrink-0 place-items-center text-2xs font-semibold text-text",
								style: { textShadow: c(Y([t], !0) ?? "") },
								children: "A"
							}) : /* @__PURE__ */ q("span", {
								className: "size-4 shrink-0 rounded-xs border border-border bg-bg",
								style: { boxShadow: c(Y([{
									...t,
									x: X(t.x),
									y: X(t.y),
									blur: X(t.blur),
									spread: X(t.spread)
								}]) ?? "") }
							}),
							/* @__PURE__ */ q("span", {
								className: "min-w-0 flex-1 truncate font-mono tabular-nums text-muted",
								children: [
									t.x,
									t.y,
									t.blur,
									...a ? [] : [t.spread]
								].map(On).join(" ")
							}),
							t.inset && /* @__PURE__ */ q("span", {
								className: "rounded-xs bg-sunken px-1 text-2xs text-muted",
								children: P("Inside")
							})
						]
					}),
					children: [/* @__PURE__ */ q("p", {
						className: "m-0 mb-2 text-xs font-semibold text-ink",
						children: P(a ? "Text Shadow" : "Shadow")
					}), /* @__PURE__ */ q(e, {
						context: i,
						fields: [
							!a && {
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
							!a && {
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
							...t,
							inset: t.inset ? "inside" : "outside"
						},
						onChange: (e, t) => p(f.map((r, i) => i === n ? {
							...r,
							[e]: e === "inset" ? t === "inside" : t ?? (e === "color" ? "transparent" : "0")
						} : r))
					})]
				}), /* @__PURE__ */ q(x, {
					label: P("Remove Shadow"),
					onClick: () => p(f.filter((e, t) => t !== n))
				})]
			}, n))
		]
	});
}
function X(e) {
	let t = parseFloat(e);
	return Number.isNaN(t) ? e : `${Math.max(-4, Math.min(4, t / 4))}px`;
}
// admin/src/builder/fields/spacing.tsx
var An = /^(-?\d*\.?\d+)([a-z%]*)$/i;
function jn(e, t) {
	return t.shiftKey ? [
		0,
		1,
		2,
		3
	] : t.altKey ? [e, (e + 2) % 4] : [e];
}
function Z(e, t) {
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
function Mn({ field: e, value: t, onChange: n, context: r }) {
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
	}), c = (e, t) => /* @__PURE__ */ q(Nn, {
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
					children: P("Margin")
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
							children: P("Padding")
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
function Nn({ box: e, index: t, value: n, status: r, onChange: i, context: a }) {
	let o = _(), [s, c] = z(!1), [l, u] = z([t]), [d, f] = z(!1), p = o(n), m = n?.match(An), h = p ? p.token.name : m ? m[2] === "px" || !m[2] ? m[1] : `${m[1]}${m[2]}` : n ?? "0";
	return /* @__PURE__ */ q(W, {
		open: s,
		onOpenChange: c,
		align: "center",
		className: "w-64 !p-3",
		trigger: /* @__PURE__ */ q(G, {
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
					i(jn(t, n), `${e === "padding" ? Math.max(0, u) : u}${s}`);
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
			onClick: (e) => u(jn(t, e)),
			"aria-label": Z(e, [t]),
			title: `${Z(e, [t])}${p ? ` · ${p.token.variable}` : ""}\n${P("Drag to change. Alt: opposite side too, Shift: all sides.")}`,
			className: K("mx-auto flex h-full min-w-0 max-w-full items-center justify-center rounded-xs px-1 text-xs tabular-nums outline-none transition-colors focus-visible:ring-2 focus-visible:ring-focus", t % 2 ? "cursor-ew-resize" : "cursor-ns-resize", r === "none" ? "text-faint" : "text-ink", s || d ? "bg-active" : "hover:bg-hover"),
			children: /* @__PURE__ */ q("span", {
				className: K("truncate", r !== "none" && "rounded-xs px-1 leading-4", r === "own" ? "bg-focus-soft" : r === "inherited" && "bg-active"),
				children: h
			})
		}),
		children: /* @__PURE__ */ q(Pn, {
			box: e,
			sides: l,
			value: n,
			onChange: (e) => i(l, e),
			close: () => c(!1),
			context: a
		})
	});
}
function Pn({ box: e, sides: t, value: r, onChange: i, close: a, context: o }) {
	let s = R(null);
	I(() => {
		(s.current?.querySelector("input"))?.focus();
	}, []);
	let c = (e) => {
		i(e), a();
	};
	return /* @__PURE__ */ J("div", {
		ref: s,
		onKeyDown: (e) => {
			e.key === "Enter" && requestAnimationFrame(a);
		},
		children: [
			/* @__PURE__ */ J("div", {
				className: "mb-2 flex h-6 items-center justify-between gap-2",
				children: [/* @__PURE__ */ q("span", {
					className: "min-w-0 truncate text-xs font-semibold text-ink",
					children: Z(e, t)
				}), r !== void 0 && /* @__PURE__ */ q(B, {
					variant: "ghost",
					size: "xs",
					onClick: () => c(null),
					className: "shrink-0 !px-1.5 !font-normal !text-muted hover:!text-ink",
					children: P("Reset")
				})]
			}),
			/* @__PURE__ */ q(n, {
				field: {
					handle: `${e}-${t.join("")}`,
					type: "text",
					component: "blocks-value",
					label: Z(e, t),
					placeholder: "0",
					keywords: e === "margin" ? ["auto"] : [],
					min: e === "padding" ? 0 : void 0
				},
				value: r ?? null,
				onChange: (e) => i(e),
				context: o
			}),
			/* @__PURE__ */ q("div", {
				className: "mt-3",
				children: /* @__PURE__ */ q(se, {
					value: r,
					onPick: c,
					auto: e === "margin"
				})
			})
		]
	});
}
// admin/src/builder/fields/index.ts
function Fn() {
	let e = {
		"blocks-value": Qe,
		"blocks-color": kt,
		"blocks-bind": dn,
		"blocks-node": fn,
		"blocks-nodes": pn,
		"blocks-group": s,
		"blocks-pairs": de,
		"blocks-shadows": kn,
		"blocks-gradient": Pe,
		"blocks-align": qe,
		"blocks-origin": Ct,
		"blocks-spacing": Mn,
		"blocks-filters": o,
		"blocks-clip": bn,
		"blocks-conditions": Sn,
		"blocks-inline-text": Cn
	};
	for (let [t, n] of Object.entries(e)) N.fields.set(t, n);
}
// admin/src/builder/icons.ts
var Q = "<rect x=\"44\" y=\"44\" width=\"168\" height=\"168\" rx=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"14\" stroke-dasharray=\"18 18\" opacity=\".4\"/>", In = {
	"b-side-all": "<rect x=\"44\" y=\"44\" width=\"168\" height=\"168\" rx=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"18\"/>",
	"b-side-top": Q + "<path d=\"M44 44h168\" stroke=\"currentColor\" stroke-width=\"22\" stroke-linecap=\"round\"/>",
	"b-side-right": Q + "<path d=\"M212 44v168\" stroke=\"currentColor\" stroke-width=\"22\" stroke-linecap=\"round\"/>",
	"b-side-bottom": Q + "<path d=\"M44 212h168\" stroke=\"currentColor\" stroke-width=\"22\" stroke-linecap=\"round\"/>",
	"b-side-left": Q + "<path d=\"M44 44v168\" stroke=\"currentColor\" stroke-width=\"22\" stroke-linecap=\"round\"/>"
};
function Ln() {
	for (let [e, t] of Object.entries(In)) N.icons.get(e) || N.icons.set(e, t);
}
// admin/src/builder/content/IconField.tsx
var Rn = [
	"regular",
	"bold",
	"fill",
	"light"
], zn = (e) => ({
	regular: P("Regular"),
	bold: P("Bold"),
	fill: P("Fill||weight"),
	light: P("Light||weight")
})[e], Bn = (e) => {
	let t = e.match(/^(.*)-(bold|fill|light)$/);
	return t ? {
		base: t[1],
		weight: t[2]
	} : {
		base: e,
		weight: "regular"
	};
};
function Vn({ field: e, value: t, onChange: n, disabled: r }) {
	let [i, a] = z(!1), [o, s] = z(""), [c, l] = z(""), u = (t ?? "").replace(/^ph:/, ""), { base: d, weight: f } = Bn(u), p = F("blocks/icons", {
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
	return /* @__PURE__ */ J("div", {
		className: "group/icon relative min-w-0 flex-1",
		children: [/* @__PURE__ */ J(W, {
			open: i,
			onOpenChange: (e) => !r && a(e),
			className: "w-[284px] !p-0",
			trigger: /* @__PURE__ */ J(G, {
				id: Zt(e),
				disabled: r,
				"aria-label": e.label,
				className: K("cms-input flex h-7 w-full min-w-0 items-center gap-2 rounded-sm px-2 text-left text-sm disabled:opacity-50", u && "pr-6"),
				children: [
					u && h ? /* @__PURE__ */ q("span", {
						className: "grid size-3.5 shrink-0 place-items-center text-text [&_svg]:size-3.5",
						dangerouslySetInnerHTML: { __html: h.svg }
					}) : /* @__PURE__ */ q(H, {
						name: "star",
						size: 14,
						className: "shrink-0 text-faint"
					}),
					/* @__PURE__ */ q("span", {
						className: K("min-w-0 flex-1 truncate", !u && "text-ghost"),
						children: u ? d : e.placeholder || P("Choose an Icon")
					}),
					u && f !== "regular" && /* @__PURE__ */ q("span", {
						className: "shrink-0 text-faint",
						children: zn(f)
					})
				]
			}),
			children: [
				/* @__PURE__ */ J("div", {
					className: "flex h-10 items-center gap-2 border-b border-border px-3",
					children: [
						/* @__PURE__ */ q(H, {
							name: "search",
							size: 14,
							className: "shrink-0 text-faint"
						}),
						/* @__PURE__ */ q("input", {
							autoFocus: !0,
							value: o,
							onChange: (e) => s(e.target.value),
							placeholder: P("Search Icons"),
							"aria-label": P("Search Icons"),
							spellCheck: !1,
							className: "h-full min-w-0 flex-1 bg-transparent text-sm text-text outline-none placeholder:text-faint"
						}),
						m.isFetching && /* @__PURE__ */ q(Xt, { size: 12 })
					]
				}),
				/* @__PURE__ */ q("div", {
					className: "border-b border-border p-1.5",
					children: /* @__PURE__ */ q(Yt, {
						size: "xs",
						block: !0,
						value: f,
						onChange: (e) => u ? g(d, e) : void 0,
						options: Rn.map((e) => ({
							value: e,
							label: zn(e)
						}))
					})
				}),
				/* @__PURE__ */ J("div", {
					className: "grid max-h-64 grid-cols-8 gap-0.5 overflow-y-auto p-1.5",
					role: "listbox",
					"aria-label": P("Icons"),
					children: [(m.data ?? []).map((e) => /* @__PURE__ */ q(G, {
						role: "option",
						"aria-selected": e.name === d,
						title: e.name,
						onClick: () => {
							g(e.name), a(!1);
						},
						className: K("grid aspect-square place-items-center rounded-xs text-text hover:bg-hover [&_svg]:size-4", e.name === d && "bg-focus-soft text-focus"),
						dangerouslySetInnerHTML: { __html: e.svg }
					}, e.name)), !m.isFetching && m.data?.length === 0 && /* @__PURE__ */ q("p", {
						className: "col-span-8 m-0 py-6 text-center text-xs text-faint",
						children: P("No matches")
					})]
				})
			]
		}), u && !r && /* @__PURE__ */ q(G, {
			onClick: () => n(null),
			"aria-label": P("Remove Icon"),
			className: "absolute right-1 top-1/2 grid size-5 -translate-y-1/2 place-items-center rounded-xs text-faint opacity-0 hover:bg-hover hover:text-text focus-visible:opacity-100 group-hover/icon:opacity-100",
			children: /* @__PURE__ */ q(H, {
				name: "close",
				size: 12
			})
		})]
	});
}
// admin/src/write/Blocks.tsx
function Hn() {
	return /* @__PURE__ */ q("hr", { className: "my-3 border-0 border-t border-border-strong" });
}
function Un({ nodes: e }) {
	let { store: t, types: n, allowed: r } = D(), { readOnly: i } = v(), a = e[e.length - 1];
	return /* @__PURE__ */ J("div", {
		className: "group/actions flex flex-wrap items-center gap-x-3 gap-y-2 py-1",
		children: [e.map((e) => /* @__PURE__ */ q(Gn, { node: e }, e.id)), !i && a.type === "button" && n.has("button") && /* @__PURE__ */ q(U, {
			icon: "plus",
			label: P("Add a Button"),
			size: "xs",
			className: "opacity-0 transition-opacity group-hover/actions:opacity-100 focus-visible:opacity-100",
			onClick: () => {
				let e = t.get().nodes, i = j(e, a.id, "button", n, r), o = n.get("button");
				if (!i || !o) return;
				let s = zt(o, {
					label: "",
					variant: a.type === "button" && (a.props.variant ?? "primary") === "primary" ? "secondary" : a.props.variant ?? "primary"
				}, n);
				t.insert(i.parentId, i.index, [s]), t.focus(s.id, "end", "label");
			}
		})]
	});
}
var Wn = {
	primary: "h-9 rounded-md bg-ink px-4 text-ink-contrast",
	secondary: "h-9 rounded-md border border-border-strong bg-bg px-4 text-text",
	ghost: "h-9 rounded-md px-3 text-text bg-sunken/60",
	link: "h-9 text-text underline decoration-border-strong underline-offset-4"
};
function Gn({ node: e }) {
	let { store: t } = D(), { readOnly: n } = v(), [r, i] = z(!1), a = y(t, (t) => t.focus?.id === e.id && t.focus.prop === "label" ? t.focus : null), o = e.type === "link", s = String(e.props.url ?? ""), l = o ? Wn.link : Wn[e.props.variant ?? "primary"] ?? Wn.primary, d = fe(), f = [
		u({
			handle: "url",
			label: P("Link"),
			placeholder: P("Paste a link or search pages"),
			autofocus: !s,
			anchors: d
		}),
		...o ? [] : [{
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
	return /* @__PURE__ */ J("span", {
		className: "group/action relative inline-flex",
		children: [
			/* @__PURE__ */ q("span", {
				className: K("inline-flex items-center text-sm font-medium", l),
				children: /* @__PURE__ */ q(c, {
					html: String(e.props.label ?? ""),
					singleLine: !0,
					quiet: !0,
					disabled: n,
					placeholder: P(o ? "Link Text" : "Button Text"),
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
				title: P("No link yet")
			}),
			!n && /* @__PURE__ */ q(W, {
				open: r,
				onOpenChange: i,
				align: "start",
				className: "w-80 !p-3",
				trigger: /* @__PURE__ */ q(G, {
					"aria-label": P("Edit Link"),
					title: s || P("Add a Link"),
					className: K("absolute -right-2.5 -top-2.5 grid size-6 place-items-center rounded-full border border-border bg-bg text-muted shadow-pop transition-opacity hover:text-text", r ? "opacity-100" : "opacity-0 group-hover/action:opacity-100 focus-visible:opacity-100"),
					children: /* @__PURE__ */ q(H, {
						name: "link",
						size: 12
					})
				}),
				children: /* @__PURE__ */ J("div", {
					className: "space-y-3",
					onKeyDown: (e) => e.key === "Enter" && !e.defaultPrevented && e.target.tagName === "INPUT" && i(!1),
					children: [/* @__PURE__ */ q(V, {
						fields: f,
						values: e.props,
						onChange: (n, r) => (n !== "variant" || r) && t.updateProps(e.id, { [n]: r ?? (n === "url" ? "" : r) }, `${n}:${e.id}`),
						className: "!gap-y-3"
					}), /* @__PURE__ */ q("div", {
						className: "flex justify-end border-t border-border pt-2.5",
						children: /* @__PURE__ */ q(B, {
							size: "xs",
							variant: "ghost",
							icon: "trash",
							onClick: () => {
								i(!1), t.remove(e.id);
							},
							children: P(o ? "Remove Link" : "Remove Button")
						})
					})]
				})
			})
		]
	});
}
function Kn(e) {
	let t = Array.isArray(e) ? e[0] : e, n = typeof t == "string" && /^(https?:|\/)/.test(t), r = F("media/get-many", { ids: [t] }, {
		enabled: typeof t == "string" && !n && t.length > 0,
		staleTime: 3e5,
		retry: !1
	});
	if (n) return t;
	let i = r.data?.items?.[0];
	return i ? i.url ?? i.thumb : null;
}
function qn({ node: e }) {
	let { store: t } = D(), { settings: n, readOnly: r } = v(), i = Kn(e.props.image);
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
					children: /* @__PURE__ */ q(B, {
						size: "xs",
						variant: "secondary",
						icon: "settings",
						onClick: () => n(e.id),
						children: P("Edit")
					})
				}),
				!e.props.alt && !r && /* @__PURE__ */ q("span", {
					className: "absolute bottom-2 left-2 rounded-xs bg-bg/90 px-1.5 py-0.5 text-2xs text-muted opacity-0 shadow-pop transition-opacity group-hover/image:opacity-100",
					children: P("No alt text")
				})
			]
		}) : /* @__PURE__ */ J("div", {
			className: "flex h-36 flex-col items-center justify-center gap-3 rounded-md bg-surface text-faint",
			children: [/* @__PURE__ */ q(H, {
				name: "image",
				size: 22
			}), /* @__PURE__ */ q(V, {
				bare: !0,
				disabled: r,
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
		}), /* @__PURE__ */ q(Jn, { node: e })]
	});
}
function Jn({ node: e }) {
	let { store: t } = D(), { readOnly: n } = v(), r = y(t, (t) => t.focus?.id === e.id && t.focus.prop === "caption" ? t.focus : null);
	return n && !e.props.caption ? null : /* @__PURE__ */ q("figcaption", { children: /* @__PURE__ */ q(c, {
		html: String(e.props.caption ?? ""),
		quiet: !0,
		disabled: n,
		placeholder: P("Add a Caption"),
		focus: r,
		className: "mt-2 text-sm text-muted",
		onChange: (n) => t.updateProps(e.id, { caption: n }),
		onFocus: () => t.select(e.id)
	}) });
}
function Yn(e) {
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
function Xn({ node: e, type: t }) {
	let { settings: n } = v(), [r] = Yn(e.props.file), i = String(e.props.url ?? ""), a = i ? i.replace(/^https?:\/\/(www\.)?/, "").split(/[/?#]/)[0] : "", o = {
		video: P("Add a video"),
		audio: P("Add audio"),
		file: P("Add a file")
	}[e.type] ?? P("Add a link to embed"), s = r ? r.name || r.filename : "", c = e.props.title || e.props.label || s || a || o, l = (e.props.title || e.props.label) && (s || a);
	return /* @__PURE__ */ J("figure", {
		className: "cms-block-figure m-0 py-1",
		children: [/* @__PURE__ */ J(G, {
			onClick: () => n(e.id),
			className: "flex h-14 w-full items-center gap-3 rounded-md bg-surface px-4 text-left hover:bg-hover",
			children: [/* @__PURE__ */ q(H, {
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
		}), t?.inline?.includes("caption") && /* @__PURE__ */ q(Jn, { node: e })]
	});
}
function Zn({ node: e, type: t }) {
	let { settings: n } = v(), r = Yn(e.props.images);
	return /* @__PURE__ */ q("div", {
		className: "py-1",
		children: /* @__PURE__ */ q(G, {
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
				children: [/* @__PURE__ */ q(H, {
					name: t?.icon ?? "media",
					size: 18
				}), P("Add images")]
			})
		})
	});
}
function Qn({ node: e }) {
	let { store: t } = D(), { settings: n, readOnly: r } = v();
	return /* @__PURE__ */ J("div", {
		className: "group/code relative py-1",
		onFocus: () => t.select(e.id),
		children: [/* @__PURE__ */ q(V, {
			bare: !0,
			disabled: r,
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
		}), /* @__PURE__ */ q(G, {
			onClick: () => n(e.id),
			className: "absolute right-2 top-2.5 rounded-xs px-1.5 font-mono text-2xs text-faint hover:bg-hover hover:text-text",
			children: e.props.language && e.props.language !== "plain" ? e.props.language : P("Plain Text")
		})]
	});
}
function $n({ node: e }) {
	let { store: t } = D(), { readOnly: n } = v(), r = Array.isArray(e.props.rows) && e.props.rows.length ? e.props.rows : [["", ""], ["", ""]], i = Math.max(...r.map((e) => e.length)), a = (n, a, o) => t.updateProps(e.id, { rows: r.map((e, t) => t === n ? Array.from({ length: i }, (t, n) => n === a ? o : e[n] ?? "") : e) }, `table:${e.id}`), o = (n) => t.updateProps(e.id, { rows: n });
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
						children: /* @__PURE__ */ q(c, {
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
				/* @__PURE__ */ q(B, {
					size: "xs",
					variant: "ghost",
					icon: "plus",
					onClick: () => o([...r, Array(i).fill("")]),
					children: P("Row")
				}),
				/* @__PURE__ */ q(B, {
					size: "xs",
					variant: "ghost",
					icon: "plus",
					onClick: () => o(r.map((e) => [...e, ""])),
					children: P("Column")
				}),
				r.length > 1 && /* @__PURE__ */ q(B, {
					size: "xs",
					variant: "ghost",
					icon: "minus",
					onClick: () => o(r.slice(0, -1)),
					children: P("Row")
				}),
				i > 1 && /* @__PURE__ */ q(B, {
					size: "xs",
					variant: "ghost",
					icon: "minus",
					onClick: () => o(r.map((e) => e.slice(0, i - 1))),
					children: P("Column")
				})
			]
		})]
	});
}
function er({ node: e }) {
	let { store: t } = D(), { readOnly: n } = v(), r = Array.isArray(e.props.items) ? e.props.items : [], i = (n, i) => t.updateProps(e.id, { items: r.map((e, t) => t === n ? {
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
						/* @__PURE__ */ q(H, {
							name: "chevron-down",
							size: 14,
							className: "mt-1 shrink-0 text-faint"
						}),
						/* @__PURE__ */ q(c, {
							html: rr(a.question ?? ""),
							singleLine: !0,
							disabled: n,
							placeholder: P("Question"),
							className: "min-w-0 flex-1 text-base font-medium leading-6",
							onChange: (e) => i(o, { question: ir(e) }),
							onFocus: () => t.select(e.id)
						}),
						!n && r.length > 1 && /* @__PURE__ */ q(U, {
							icon: "close",
							label: P("Remove Question"),
							size: "xs",
							className: "opacity-0 group-hover/faq:opacity-100",
							onClick: () => t.updateProps(e.id, { items: r.filter((e, t) => t !== o) })
						})
					]
				}), /* @__PURE__ */ q(c, {
					html: a.answer ?? "",
					quiet: !0,
					disabled: n,
					placeholder: P("Answer"),
					className: "mt-1 pl-[22px] text-base leading-6 text-muted",
					onChange: (e) => i(o, { answer: e }),
					onFocus: () => t.select(e.id)
				})]
			}, o))
		}), !n && /* @__PURE__ */ q(B, {
			size: "xs",
			variant: "ghost",
			icon: "plus",
			className: "mt-1 opacity-0 transition-opacity group-hover/faq:opacity-100",
			onClick: () => t.updateProps(e.id, { items: [...r, {
				question: "",
				answer: ""
			}] }),
			children: P("Question")
		})]
	});
}
function tr({ node: e }) {
	let { store: t } = D(), { readOnly: n } = v(), r = F("components/list", { working: !0 }, { staleTime: 3e4 }), i = r.data?.find((t) => t.handle === e.props.ref), a = e.props.values ?? {}, o = e.bind ?? {}, s = (i?.props ?? []).filter((e) => e.type !== "json"), l = (n, r) => t.updateProps(e.id, { values: {
		...a,
		[n]: r
	} }, `values:${e.id}:${n}`), d = /* @__PURE__ */ J("div", {
		className: "flex h-8 items-center gap-2 text-xs",
		children: [
			/* @__PURE__ */ q(H, {
				name: "symbol",
				size: 13,
				className: "text-faint"
			}),
			/* @__PURE__ */ q("span", {
				className: "truncate font-medium text-muted",
				children: i?.title ?? (r.isLoading ? "…" : P("Missing component"))
			}),
			/* @__PURE__ */ q("span", { className: "flex-1" }),
			i?.id && /* @__PURE__ */ q(G, {
				onClick: () => Vt(`/content/components/${i.id}`),
				className: "rounded-xs px-1.5 text-faint opacity-0 transition-opacity hover:bg-hover hover:text-text group-hover/component:opacity-100",
				children: P("Edit Component")
			})
		]
	});
	return s.length === 0 ? /* @__PURE__ */ J("div", {
		className: "flex h-9 items-center gap-2 rounded-md px-1 text-sm text-faint",
		children: [
			/* @__PURE__ */ q(H, {
				name: "symbol",
				size: 14
			}),
			/* @__PURE__ */ q("span", {
				className: "truncate text-muted",
				children: i?.title ?? (r.isLoading ? "…" : P("Missing component"))
			}),
			i?.id && /* @__PURE__ */ q(G, {
				onClick: () => Vt(`/content/components/${i.id}`),
				className: "shrink-0 rounded-xs px-1 text-xs text-faint hover:bg-hover hover:text-text",
				children: P("Edit Component")
			})
		]
	}) : /* @__PURE__ */ J("div", {
		className: "group/component rounded-md border border-border px-3 pb-1",
		children: [d, s.length > 0 && /* @__PURE__ */ q("div", {
			className: "space-y-2.5 border-t border-border py-2.5",
			children: s.map((r) => {
				let i = a[r.handle] ?? r.default, s = o[`values.${r.handle}`];
				return /* @__PURE__ */ J("div", {
					className: "grid grid-cols-[120px_minmax(0,1fr)] items-start gap-3",
					children: [/* @__PURE__ */ q("span", {
						className: "truncate pt-[3px] text-xs text-faint",
						title: r.instructions,
						children: r.label
					}), s ? /* @__PURE__ */ q("span", {
						className: "pt-[3px] font-mono text-xs text-faint",
						children: s
					}) : [
						"text",
						"textarea",
						"richtext"
					].includes(r.type) ? /* @__PURE__ */ q(c, {
						html: r.type === "richtext" ? String(i ?? "") : rr(String(i ?? "")),
						singleLine: r.type === "text",
						disabled: n,
						placeholder: r.placeholder ?? P("Empty"),
						className: "text-base leading-6",
						onChange: (e) => l(r.handle, r.type === "richtext" ? e : ir(e)),
						onFocus: () => t.select(e.id)
					}) : /* @__PURE__ */ q(V, {
						bare: !0,
						disabled: n,
						fields: [r.type === "url" ? u({
							...r,
							label: r.label
						}) : {
							...r,
							size: "sm"
						}],
						values: { [r.handle]: i },
						onChange: (e, t) => l(r.handle, t)
					})]
				}, r.handle);
			})
		})]
	});
}
function nr({ node: e, type: t }) {
	let { settings: n } = v(), r = Nt(e, 80);
	return /* @__PURE__ */ J(G, {
		onClick: () => n(e.id),
		className: "my-1 flex w-full items-center gap-3 rounded-md bg-surface px-3 py-2.5 text-left hover:bg-hover",
		children: [/* @__PURE__ */ q(H, {
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
				children: t ? r : P("Its plugin is off — the content is kept")
			})]
		})]
	});
}
function rr(e) {
	return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
}
function ir(e) {
	let t = document.createElement("div");
	return t.innerHTML = e.replace(/<br\s*\/?>/g, "\n"), t.textContent ?? "";
}
// admin/src/write/WriteEditor.tsx
var $ = /* @__PURE__ */ new Map(), ar = (e) => $.get(e) ?? $.get(e.split("/")[0] + "/*"), or = (e) => !!ar(e), sr = Ht(null);
function cr({ onInspect: e } = {}) {
	let { store: t, types: n, allowed: r, readOnly: i = !1 } = D(), a = y(t, (e) => e.nodes), o = L(() => rt(a, n, or), [a, n]), s = L(() => new Map(dt(o).map((e) => [C(e), e])), [o]), c = R(null), [l, u] = z(null), [d, f] = z(null), [p, m] = z(null), h = ln(cn(nn, { activationConstraint: { distance: 5 } })), g = R(null), _ = L(() => ({
		stops: () => {
			let e = t.get().nodes;
			return g.current?.nodes !== e && (g.current = {
				nodes: e,
				stops: Fe(rt(e, n, or))
			}), g.current.stops;
		},
		settings: (n) => {
			t.select(n, !0), e ? e(n) : u(n);
		},
		readOnly: i
	}), [
		t,
		n,
		i,
		e
	]);
	Gt(() => {
		a.length === 0 && !i && M(null, "paragraph", n, r) && t.reset([Ot()]);
	}, [
		a,
		i,
		t,
		n,
		r
	]);
	let ee = R(s);
	ee.current = s, xr(t, c, _, ee);
	let te = (e, i, a) => {
		let o = t.get().nodes, s = a === "before" ? S(i)[0] : S(i).at(-1), c = S(e);
		if (c.some((e) => e.id === s.id || Pt(o, s.id).some((t) => t.id === e.id))) return null;
		let l = k(o, s.id);
		if (!l) return null;
		let u = l.parentId ? O(o, l.parentId) : null;
		return c.every((e) => M(u, e.type, n, u ? [] : r)) ? {
			ids: c.map((e) => e.id),
			parentId: l.parentId,
			index: a === "before" ? l.index : l.index + 1
		} : null;
	};
	return /* @__PURE__ */ q(wt.Provider, {
		value: _,
		children: /* @__PURE__ */ J("div", {
			ref: c,
			className: "relative",
			"data-cms-write": !0,
			children: [
				/* @__PURE__ */ J(en, {
					sensors: h,
					collisionDetection: lr,
					onDragStart: (e) => m(s.get(String(e.active.id)) ?? null),
					onDragMove: (e) => {
						let t = s.get(String(e.active.id)), n = e.over ? s.get(String(e.over.id)) : null;
						if (!t || !n || e.over.id === e.active.id) return d && f(null);
						let r = e.activatorEvent.clientY + e.delta.y < e.over.rect.top + e.over.rect.height / 2 ? "before" : "after", i = te(t, n, r) ? {
							id: String(e.over.id),
							side: r
						} : null;
						(i?.id !== d?.id || i?.side !== d?.side) && f(i);
					},
					onDragEnd: (e) => {
						let n = s.get(String(e.active.id)), r = d ? s.get(d.id) : null;
						f(null), m(null);
						let i = n && r && d ? te(n, r, d.side) : null;
						i && t.moveTo(i.ids, i.parentId, i.index);
					},
					onDragCancel: () => {
						f(null), m(null);
					},
					children: [/* @__PURE__ */ q(sr.Provider, {
						value: d,
						children: o.map((e, t) => /* @__PURE__ */ q(ur, {
							section: e,
							spaced: t > 0 && (e.container || o[t - 1].container)
						}, e.id))
					}), $t(/* @__PURE__ */ q(tn, {
						dropAnimation: null,
						children: p && /* @__PURE__ */ q(yr, { row: p })
					}), document.body)]
				}),
				!i && /* @__PURE__ */ q(G, {
					compact: !0,
					tabIndex: -1,
					"aria-label": P("Continue Writing"),
					onClick: () => {
						let e = _.stops().at(-1), i = e ? O(t.get().nodes, e.id) : null;
						if (i?.type === "paragraph" && Ft(i.props.text)) return b(t, e, "end");
						let a = t.get().nodes, s = o.at(-1), c = s?.container ? S(s.rows.at(-1)).at(-1).id : a.at(-1)?.id, l = c ? j(a, c, "paragraph", n, r) : {
							parentId: null,
							index: 0
						};
						if (!l) return;
						let u = Ot();
						t.insert(l.parentId, l.index, [u]), t.focus(u.id, "start");
					},
					className: "block h-28 w-full cursor-text"
				}),
				/* @__PURE__ */ q(xe, {}),
				/* @__PURE__ */ q(br, {}),
				l && !e && /* @__PURE__ */ q(Kt, {
					open: !0,
					onOpenChange: (e) => !e && u(null),
					title: P("Block"),
					children: O(a, l) && /* @__PURE__ */ q(E, {
						node: O(a, l),
						onClose: () => u(null)
					})
				})
			]
		})
	});
}
var lr = (e) => {
	let t = an(e);
	if (t.length === 0) return rn(e);
	let n = (t) => {
		let n = e.droppableRects.get(t);
		return n ? n.width * n.height : Infinity;
	};
	return [...t].sort((e, t) => n(e.id) - n(t.id)).slice(0, 1);
};
function ur({ section: e, spaced: t }) {
	return /* @__PURE__ */ J("section", {
		className: K("group/section relative", t && "mt-10"),
		children: [e.label && /* @__PURE__ */ q("div", {
			className: "pointer-events-none absolute right-[calc(100%+76px)] top-[5px] max-w-40 truncate whitespace-nowrap text-2xs text-faint opacity-0 transition-opacity duration-base group-focus-within/section:opacity-100 group-hover/section:opacity-100 max-xl:hidden",
			children: e.label
		}), e.rows.map((e, t) => /* @__PURE__ */ q(fr, {
			row: e,
			first: t === 0
		}, C(e)))]
	});
}
function dr(e, t) {
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
function fr({ row: e, first: t, nested: n }) {
	let { store: r } = D(), { readOnly: i } = v(), a = C(e), o = S(e).map((e) => e.id), s = y(r, (e) => e.blockMode && Xe(e).some((e) => o.includes(e))), c = Wt(sr), l = sn({ id: a }), u = on({
		id: a,
		disabled: i
	}), { className: d, line: f } = dr(e, t);
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
			!i && /* @__PURE__ */ q(hr, {
				row: e,
				handle: u,
				nested: n
			}),
			/* @__PURE__ */ q("div", {
				className: K("rounded-sm transition-[background-color,box-shadow] duration-fast", s && "bg-focus/10 ring-3 ring-focus/10"),
				children: /* @__PURE__ */ q(pr, { row: e })
			})
		]
	});
}
function pr({ row: e }) {
	let { types: t } = D(), { settings: n } = v();
	if (e.kind === "text") return /* @__PURE__ */ q(Ve, { node: e.node });
	if (e.kind === "list") return /* @__PURE__ */ q(lt, { node: e.node });
	if (e.kind === "actions") return /* @__PURE__ */ q(Un, { nodes: e.nodes });
	if (e.kind === "container") {
		let r = t.get(e.node.type);
		return /* @__PURE__ */ J("div", {
			className: "rounded-md border border-border/70 px-4 pb-3 pt-2",
			children: [/* @__PURE__ */ J(G, {
				compact: !0,
				onClick: () => n(e.node.id),
				className: "mb-2 flex max-w-full items-center gap-1.5 text-xs text-faint hover:text-text",
				children: [/* @__PURE__ */ q(H, {
					name: r?.icon ?? "square",
					size: 12
				}), /* @__PURE__ */ q("span", {
					className: "truncate",
					children: e.node.label || r?.title || e.node.type
				})]
			}), e.rows.length ? e.rows.map((e, t) => /* @__PURE__ */ q(fr, {
				row: e,
				first: t === 0,
				nested: !0
			}, C(e))) : /* @__PURE__ */ q(mr, { column: e.node })]
		});
	}
	if (e.kind === "columns") {
		let t = String(e.node.props.layout ?? "1-1").split("-").map((e) => `minmax(0,${e}fr)`).join(" ");
		return /* @__PURE__ */ q("div", {
			className: "grid gap-8 py-1 max-md:!grid-cols-1",
			style: { gridTemplateColumns: t },
			children: e.columns.map((e) => /* @__PURE__ */ q("div", {
				className: "min-w-0",
				children: e.rows.length ? e.rows.map((e, t) => /* @__PURE__ */ q(fr, {
					row: e,
					first: t === 0,
					nested: !0
				}, C(e))) : /* @__PURE__ */ q(mr, { column: e.node })
			}, e.node.id))
		});
	}
	let r = e.node, i = t.get(r.type), a = ar(r.type);
	if (a) return /* @__PURE__ */ q(a, {
		node: r,
		type: i,
		onSettings: n
	});
	switch (r.type) {
		case "image": return /* @__PURE__ */ q(qn, { node: r });
		case "video":
		case "embed": return /* @__PURE__ */ q(Xn, {
			node: r,
			type: i
		});
		case "code": return /* @__PURE__ */ q(Qn, { node: r });
		case "table": return /* @__PURE__ */ q($n, { node: r });
		case "divider": return /* @__PURE__ */ q(Hn, {});
		case "accordion": return /* @__PURE__ */ q(er, { node: r });
		case "component": return /* @__PURE__ */ q(tr, { node: r });
		default: return /* @__PURE__ */ q(nr, {
			node: r,
			type: i
		});
	}
}
function mr({ column: e }) {
	let { store: t, types: n } = D(), { readOnly: r } = v();
	return r || !M(e, "paragraph", n, []) ? null : /* @__PURE__ */ q(G, {
		compact: !0,
		onClick: () => {
			let n = Ot();
			t.insert(e.id, 0, [n]), t.focus(n.id, "start");
		},
		className: K(vt, "block w-full cursor-text py-[3px] text-left text-faint opacity-0 hover:opacity-100"),
		children: P("Write here")
	});
}
function hr({ row: e, handle: t, nested: n }) {
	let { store: r, types: i, allowed: a } = D(), o = v(), [s, c] = z(!1), [l, u] = z(""), d = y(r, (t) => t.blockMode && S(e).some((e) => e.id === t.selected)), f = S(e).at(-1), p = (e) => {
		let t = Lt(e, i), n = j(r.get().nodes, f.id, t.map((e) => e.type), i, a);
		c(!1), u(""), n && (r.insert(n.parentId, n.index, t), At(r, t[0], o.stops()));
	};
	return /* @__PURE__ */ J("div", {
		className: K("absolute top-[3px] z-raised flex h-[var(--line)] items-center gap-0.5 opacity-0 transition-opacity duration-fast focus-within:opacity-100", n ? "-left-[22px] group-hover/nested:opacity-100" : "-left-[54px] group-hover/row:opacity-100 group-has-[[data-nested]:hover]/row:!opacity-0", (s || d) && "!opacity-100"),
		children: [!n && /* @__PURE__ */ q(W, {
			open: s,
			onOpenChange: (e) => {
				c(e), e || u("");
			},
			align: "start",
			className: "!p-0",
			trigger: /* @__PURE__ */ q(U, {
				icon: "plus",
				label: P("Add Below"),
				size: "xs",
				className: "!text-faint hover:!text-text"
			}),
			children: /* @__PURE__ */ q(Et, {
				types: [...i.values()],
				query: l,
				onQuery: u,
				onChoose: p,
				onClose: () => c(!1),
				allowed: (e) => !!j(r.get().nodes, f.id, e.name, i, a)
			})
		}), /* @__PURE__ */ q(qt, {
			align: "start",
			trigger: /* @__PURE__ */ q(G, {
				compact: !0,
				ref: t.setActivatorNodeRef,
				...t.attributes,
				...t.listeners,
				"aria-label": P("Drag to move, click for options"),
				className: "grid h-6 w-[18px] cursor-grab place-items-center rounded-xs text-faint hover:bg-hover hover:text-text active:cursor-grabbing",
				children: /* @__PURE__ */ q(H, {
					name: "drag",
					size: 14
				})
			}),
			items: _r(r, e, i, a, o)
		})]
	});
}
var gr = [
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
function _r(e, t, n, r, i) {
	let a = S(t), o = a[0], s = t.kind === "text" || t.kind === "list", c = () => o.type === "list" ? (o.props.items ?? []).join("<br>") : String(o.props.text ?? ""), l = (e) => e.type === o.type && Object.entries(e.props).every(([e, t]) => String(o.props[e] ?? (e !== "ordered" && "")) === String(t)), u = (t) => () => {
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
	}, d = a.length === 1, f = t.parent ? O(e.get().nodes, t.parent) : null;
	return [
		...s ? [
			{
				label: P("Turn Into"),
				heading: !0
			},
			...gr.filter((e) => n.has(e.type) && M(f, e.type, n, f ? [] : r)).map((e) => ({
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
			label: P("Settings"),
			icon: "settings",
			onSelect: () => i.settings(o.id)
		},
		{
			label: P("Duplicate"),
			icon: "copy",
			shortcut: "mod+d",
			onSelect: () => vr(e, a.map((e) => e.id))
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
			onSelect: () => e.commit(a.reduce((e, t) => A(e, t.id), e.get().nodes))
		}
	];
}
function vr(e, t) {
	let n = e.get().nodes, r = t.map((e) => O(n, e)).filter((e) => !!e).map(Rt), i = k(n, t.at(-1));
	i && r.length !== 0 && (e.insert(i.parentId, i.index + 1, r), e.select(r[0].id, !0), r.length > 1 && e.extendTo(r.at(-1).id));
}
function yr({ row: e }) {
	let t = S(e).map((e) => Nt(e, 60)).filter(Boolean).join(" · ");
	return /* @__PURE__ */ q("div", {
		className: "cms-pop max-w-[360px] truncate px-3 py-1.5 text-sm text-muted",
		children: t || P("Block")
	});
}
function br() {
	let { store: e, types: t, allowed: n } = D(), r = v(), i = Ue(), [a, o] = z(null);
	if (F("components/list", {}, {
		staleTime: 6e4,
		enabled: n.length === 0 || n.includes("component")
	}), F("patterns/list", {}, { staleTime: 6e4 }), I(() => {
		if (!i) return o(null);
		let e = requestAnimationFrame(() => {
			let e = document.querySelector(`[data-row="${i.id}"] [contenteditable]`);
			o(et() ?? e?.getBoundingClientRect() ?? null);
		});
		return () => cancelAnimationFrame(e);
	}, [i]), I(() => {
		if (!i) return;
		let e = () => !document.activeElement?.closest(`[data-row="${i.id}"]`) && T(null);
		return document.addEventListener("focusin", e), () => document.removeEventListener("focusin", e);
	}, [i]), Ke(!!i, [document]), !i || !a) return null;
	let s = (a) => {
		let o = Lt(a, t), s = e.get().nodes, c = k(s, i.id);
		if (T(null), !c) return;
		let l = c.parentId ? O(s, c.parentId) : null;
		if (o.every((e) => M(l, e.type, t, l ? [] : n))) e.commit(Bt(A(s, i.id), c.parentId, c.index, o));
		else {
			let r = j(s, i.id, o.map((e) => e.type), t, n);
			if (!r) return;
			e.commit(Bt(A(s, i.id), r.parentId, r.index, o));
		}
		At(e, o[0], r.stops());
	}, { maxHeight: c, ...l } = St(a);
	return $t(/* @__PURE__ */ q("div", {
		"data-cms-slash": !0,
		className: "cms-pop fixed z-overlay overflow-hidden !p-0",
		style: l,
		children: /* @__PURE__ */ q(Et, {
			types: [...t.values()],
			query: i.query,
			chooseFirst: i.enter,
			components: n.length === 0 || n.includes("component"),
			onNoMatch: () => {
				let e = document.querySelector(`[data-row="${i.id}"] [contenteditable]`);
				T(null), e?.dispatchEvent(new KeyboardEvent("keydown", {
					key: "Enter",
					bubbles: !0,
					cancelable: !0
				}));
			},
			showSearch: !1,
			compact: !0,
			style: { maxHeight: c },
			onChoose: s,
			onClose: () => T(null),
			allowed: (r) => !!j(e.get().nodes, i.id, r.name, t, n)
		})
	}), document.body);
}
function xr(e, t, n, r) {
	I(() => {
		let i = (i) => {
			if (i.defaultPrevented) return;
			let a = t.current?.contains(document.activeElement) || t.current?.contains(i.target), { selected: o, blockMode: s, nodes: c } = e.get(), l = i.metaKey || i.ctrlKey, u = document.activeElement === document.body || !document.activeElement;
			if (l && i.key.toLowerCase() === "z" && (a || s || u)) {
				i.preventDefault();
				let t = a && document.activeElement?.isContentEditable;
				document.activeElement?.blur(), i.shiftKey ? e.redo() : e.undo();
				let r = t && o ? n.stops().find((e) => e.id === o) : null;
				r && b(e, r, "end");
				return;
			}
			if (!s || !o || n.readOnly || i.target?.closest?.("input,textarea,[contenteditable=\"true\"],[role=\"dialog\"],[data-cms-settings]")) return;
			let d = [...r.current.values()], f = d.findIndex((e) => S(e).some((e) => e.id === o)), p = d[f], m = (t) => {
				if (!t) return;
				let n = S(t).map((e) => e.id);
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
				let t = n.stops().find((e) => e.id === o), r = p ? S(p)[0] : null;
				t ? b(e, t, "end") : r && n.settings(r.id);
			} else if (i.key === "Backspace" || i.key === "Delete") {
				i.preventDefault();
				let t = d[f - 1] ?? d.slice(f + 1).find((t) => !S(t).some((t) => e.selection().includes(t.id)));
				e.removeSelection(), m(t);
			} else if (l && i.key.toLowerCase() === "d") i.preventDefault(), vr(e, e.selection());
			else if (l && (i.key.toLowerCase() === "c" || i.key.toLowerCase() === "x")) {
				let t = e.selection().map((e) => O(c, e)).filter(Boolean);
				if (t.length === 0) return;
				i.preventDefault(), navigator.clipboard.writeText("cms-blocks:" + JSON.stringify(t)), i.key.toLowerCase() === "x" && e.removeSelection();
			} else l && i.key.toLowerCase() === "v" ? (i.preventDefault(), navigator.clipboard.readText().then((t) => {
				if (!t.startsWith("cms-blocks:")) return;
				let n = JSON.parse(t.slice(12)).map(Rt);
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
Ln(), N.fields.set("blocks", un), Fn(), N.fields.set("blocks-icon", Vn), N.panels.set("blocks-editor", {
	slot: "entry.editor",
	label: P("Block Editor"),
	icon: "layout",
	component: Ut(() => import("./chunks/BlocksWorkspace-BOBjTY2h.js").then((e) => ({ default: e.BlocksWorkspace }))),
	when: (e) => e.bodyField.type === "blocks"
}), N.widgets.set("blocks-design", Ut(() => import("./chunks/WidgetDesign-BsI0HI9G.js"))), $.set("audio", Xn), $.set("file", Xn), $.set("gallery", Zn);
export { Mt as ARTICLE, ze as ClassChips, ie as ClassStyle, kt as ColorField, Re as ColorPicker, a as ELEMENTS, ct as EditorProvider, ht as EditorStore, pt as Engine, Te as FIELDS, ae as GRADIENT_MARKERS, E as Inspector, ot as InspectorSection, e as PanelFields, ut as SCHEME, _e as SPACING_STEPS, it as STYLE_GROUPS, nt as SchemeTile, se as SpacingChips, tt as Specimen, Ye as StateMenu, Ie as StyleBar, mt as StylePanels, g as Stylesheet, r as StylingProvider, gt as Swatch, le as TokenButton, pe as TokenChip, d as TokenList, cr as WriteEditor, ne as arbitrary, st as askStyleName, Ce as balanced, $ as blockViews, jt as colorGroups, i as dataStates, je as everyScreen, Y as formatShadows, we as gradientOf, h as gradientUtilities, ke as layerOf, Se as layerUsed, Ee as lightDark, $e as loadCompiler, ce as loadEngine, ue as loadTailwindTheme, p as onLayer, Ne as parseClass, Tn as parseShadows, re as partUtility, Je as schemesOf, me as screenFor, ge as screenVariant, ft as searchClasses, De as shownVariable, te as spacingChoices, t as splitClasses, Ae as splitSiteClasses, _t as stateLabel, Oe as styleApi, xt as styleLabel, He as styleSample, m as themeDefaults, We as themeReference, f as tokensOf, Be as useCatalog, y as useEditor, D as useEditorContext, ee as useEngine, Ge as useSpecimenSheet, oe as useStyling, ve as useThemeTokens, Me as usedVariants, ye as withAlpha, yt as withVariants };
