import { d as e, l as t, m as n, p as r, t as i } from "./chunks/Inserter-CpCHuBqp.js";
import { _ as a, a as o, c as s, d as c, f as l, h as u, i as d, l as f, n as p, o as m, s as h, t as g, u as _ } from "./chunks/insert-D8JHaZaj.js";
import { A as v, B as y, C as b, D as ee, E as x, F as S, G as C, I as te, J as w, K as T, L as ne, M as re, N as ie, O as E, P as D, R as O, S as ae, T as oe, U as se, V as k, W as ce, X as le, Y as ue, Z as A, _ as de, a as fe, b as pe, c as me, d as he, f as ge, g as _e, h as ve, i as ye, j as be, k as xe, l as Se, m as j, n as Ce, o as we, p as Te, q as Ee, r as De, s as Oe, t as ke, u as M, v as Ae, w as je, x as N, y as Me, z as Ne } from "./chunks/Inspector-4Rdel6HB.js";
import { navigate as Pe, registry as P, t as F, useAbility as I } from "@letterncms/sdk";
import { createContext as Fe, lazy as Ie, useContext as Le, useEffect as L, useLayoutEffect as Re, useMemo as ze, useRef as R, useState as z } from "react";
import { Button as B, Fields as V, Icon as H, IconButton as U, InspectorPanel as Be, Menu as Ve, Popover as W, Pressable as G, QueryError as He, Segmented as Ue, Spinner as We, cn as K, fieldControlId as Ge } from "@letterncms/ui";
import { Fragment as Ke, jsx as q, jsxs as J } from "react/jsx-runtime";
import { createPortal as qe } from "react-dom";
import { DndContext as Je, DragOverlay as Ye, PointerSensor as Xe, closestCenter as Ze, pointerWithin as Qe, useDraggable as $e, useDroppable as et, useSensor as tt, useSensors as nt } from "@dnd-kit/core";
// admin/src/BlocksField.tsx
function rt({ field: n, value: r, onChange: i, context: a, disabled: o }) {
	let { catalog: c, types: l, isLoading: u, error: d, retry: f } = e(), p = w(r, i, !!o), [m, h] = z(null), g = A(p, (e) => e.nodes), _ = R(a);
	if (_.current = a, u) return /* @__PURE__ */ q("div", {
		className: "flex h-24 items-center justify-center text-faint",
		children: /* @__PURE__ */ q(We, {})
	});
	if (!c) return /* @__PURE__ */ q(He, {
		message: d?.message,
		onRetry: f
	});
	let v = {
		store: p,
		types: l,
		catalog: c,
		entryId: a.entry?.id ?? null,
		fieldHandle: n.handle,
		allowed: n.allowed ?? [],
		getValues: () => _.current.values ?? {},
		title: a.title ?? a.entry?.title ?? "",
		readOnly: !!o
	};
	return /* @__PURE__ */ J(t, {
		value: v,
		children: [/* @__PURE__ */ q("div", {
			className: "h-[480px] min-w-0 overflow-hidden rounded-sm border border-border",
			children: /* @__PURE__ */ q(je, {
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
		}), /* @__PURE__ */ J(Be, {
			docked: !1,
			open: !!m,
			onOpenChange: (e) => !e && h(null),
			title: F("Block Settings"),
			children: [/* @__PURE__ */ q("div", {
				className: "flex h-10 shrink-0 items-center justify-end border-b border-border px-2",
				children: /* @__PURE__ */ q(U, {
					icon: "close",
					label: F("Close Panel"),
					size: "xs",
					onClick: () => h(null)
				})
			}), m && s(g, m) && /* @__PURE__ */ q(ke, {
				node: s(g, m),
				onClose: () => h(null)
			})]
		})]
	});
}
// admin/src/builder/content/BindField.tsx
function it({ field: e, value: t, onChange: n, disabled: r }) {
	let [i, a] = z(!1), [o, s] = z(null), c = t ?? void 0, l = e.paths ?? [], u = [...new Set(l.map((e) => e.group))], d = l.find((e) => e.path === c)?.label;
	return /* @__PURE__ */ J(Te, { children: [/* @__PURE__ */ J("div", {
		className: "relative flex min-w-0 flex-1 items-center",
		children: [/* @__PURE__ */ q(H, {
			name: "database",
			size: 13,
			className: "pointer-events-none absolute left-2 text-ink"
		}), /* @__PURE__ */ q("input", {
			id: Ge(e),
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
			className: K(b, "!pl-7 font-mono text-ink placeholder:font-sans")
		})]
	}), /* @__PURE__ */ J(W, {
		open: i,
		onOpenChange: a,
		align: "end",
		className: "w-64 !p-1",
		trigger: /* @__PURE__ */ q(U, {
			icon: "chevron-down",
			size: "xs",
			label: F("Choose Data")
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
			title: F("Filters, and text mixed with data"),
			children: ["|date:M j, Y · |excerpt:120 · |upper · |default:Text · By ", "{entry.author}"]
		})]
	})] });
}
// admin/src/builder/fields/nodes.tsx
function at({ field: e, ...t }) {
	let { store: n, types: i } = r(), o = A(n, (e) => e.nodes), s = f(o).filter(({ node: t }) => t.id !== e.exclude).map(({ node: e, depth: t }) => ({
		value: e.id,
		label: `${"  ".repeat(t)}${e.label || a(e, 28) || i.get(e.type)?.title || e.type}`
	}));
	return /* @__PURE__ */ q(j, {
		...t,
		field: {
			...e,
			type: "select",
			component: void 0,
			size: "sm",
			options: s,
			placeholder: e.placeholder ?? F("Choose an Element")
		}
	});
}
function ot({ field: e, value: t, onChange: n, disabled: r, context: i }) {
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
			children: [/* @__PURE__ */ q(at, {
				field: {
					...o,
					handle: `${e.handle}-${s}`
				},
				value: t,
				onChange: (e) => n(e ? a.map((t, n) => n === s ? e : t) : a.filter((e, t) => t !== s)),
				disabled: r,
				context: i
			}), /* @__PURE__ */ q(N, { onClick: () => n(a.filter((e, t) => t !== s)) })]
		}, s)), /* @__PURE__ */ J(G, {
			compact: !0,
			onClick: () => n([...a, e.addValue]),
			className: "text-xs text-muted hover:text-text",
			children: ["+ ", e.add ?? F("Element")]
		})]
	});
}
// admin/src/builder/fields/clip.tsx
var st = [
	{
		id: "triangle",
		label: () => F("Triangle"),
		value: "polygon(50% 0%, 100% 100%, 0% 100%)"
	},
	{
		id: "rhombus",
		label: () => F("Rhombus"),
		value: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)"
	},
	{
		id: "pentagon",
		label: () => F("Pentagon"),
		value: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)"
	},
	{
		id: "hexagon",
		label: () => F("Hexagon"),
		value: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)"
	},
	{
		id: "arrow",
		label: () => F("Arrow"),
		value: "polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%)"
	},
	{
		id: "chevron",
		label: () => F("Chevron"),
		value: "polygon(75% 0%, 100% 50%, 75% 100%, 0% 100%, 25% 50%, 0% 0%)"
	},
	{
		id: "star",
		label: () => F("Star"),
		value: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"
	},
	{
		id: "message",
		label: () => F("Message||shape"),
		value: "polygon(0% 0%, 100% 0%, 100% 75%, 75% 75%, 75% 100%, 50% 75%, 0% 75%)"
	},
	{
		id: "slant",
		label: () => F("Slanted Edge"),
		value: "polygon(0 0, 100% 0, 100% 85%, 0 100%)"
	},
	{
		id: "wedge",
		label: () => F("Wedge"),
		value: "polygon(0 0, 100% 0, 100% 100%, 0 85%)"
	}
], ct = (e) => e.replace(/\s+/g, " ").replace(/\b0%/g, "0").trim();
function lt(e) {
	if (!e || e === "none") return "none";
	let t = e.match(/^(inset|circle|ellipse|polygon)\(/);
	return t ? t[1] : "custom";
}
var ut = (e, t) => e?.match(RegExp(`^${t}\\((.*)\\)$`))?.[1] ?? "";
function dt(e) {
	let [t, n] = ut(e, "inset").split(/\s+round\s+/), r = me(t || "0") ?? [
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
function ft(e, t) {
	let [n, r] = ut(e, t).split(/\s+at\s+/), i = M(n || ""), a = M(r || "50% 50%");
	return {
		rx: i[0] ?? "50%",
		ry: i[1] ?? i[0] ?? "50%",
		x: a[0] ?? "50%",
		y: a[1] ?? "50%"
	};
}
function pt({ field: e, value: t, onChange: n, context: r, disabled: i }) {
	let a = t ?? void 0, [o, s] = z(!1), c = o && a ? "custom" : lt(a), l = (t, n, r = {}) => ({
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
		n(st[0].value);
	}, d = dt(a), f = (e) => {
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
	}, p = c === "circle" || c === "ellipse" ? ft(a, c) : null, m = (e) => {
		let t = {
			...p,
			...e
		};
		n(c === "circle" ? `circle(${t.rx} at ${t.x} ${t.y})` : `ellipse(${t.rx} ${t.ry} at ${t.x} ${t.y})`);
	}, h = c === "polygon" ? st.find((e) => ct(e.value) === ct(a)) : void 0;
	return /* @__PURE__ */ J("div", {
		className: "min-w-0 flex-1 space-y-1",
		children: [
			/* @__PURE__ */ q(j, {
				field: {
					handle: `${e.handle}-kind`,
					type: "select",
					size: "sm",
					label: e.label,
					placeholder: F("None"),
					options: [
						{
							value: "inset",
							label: F("Inset")
						},
						{
							value: "circle",
							label: F("Circle")
						},
						{
							value: "ellipse",
							label: F("Ellipse")
						},
						{
							value: "polygon",
							label: F("Shape")
						},
						{
							value: "custom",
							label: F("Custom")
						}
					]
				},
				value: c === "none" ? null : c,
				onChange: (e) => u(e),
				disabled: i,
				context: r
			}),
			c === "inset" && /* @__PURE__ */ J(Ke, { children: [/* @__PURE__ */ J(Te, {
				className: "grid grid-cols-2 gap-1",
				children: [
					/* @__PURE__ */ q(j, {
						field: l("top", F("Top"), {
							prefix: "T",
							placeholder: "0",
							units: ["px", "%"]
						}),
						value: d.top,
						onChange: (e) => f({ top: e ?? "0" }),
						context: r
					}),
					/* @__PURE__ */ q(j, {
						field: l("right", F("Right"), {
							prefix: "R",
							placeholder: "0",
							units: ["px", "%"]
						}),
						value: d.right,
						onChange: (e) => f({ right: e ?? "0" }),
						context: r
					}),
					/* @__PURE__ */ q(j, {
						field: l("bottom", F("Bottom"), {
							prefix: "B",
							placeholder: "0",
							units: ["px", "%"]
						}),
						value: d.bottom,
						onChange: (e) => f({ bottom: e ?? "0" }),
						context: r
					}),
					/* @__PURE__ */ q(j, {
						field: l("left", F("Left"), {
							prefix: "L",
							placeholder: "0",
							units: ["px", "%"]
						}),
						value: d.left,
						onChange: (e) => f({ left: e ?? "0" }),
						context: r
					})
				]
			}), /* @__PURE__ */ q(j, {
				field: l("round", F("Corner Radius"), {
					prefix: "◜",
					placeholder: F("Corners"),
					group: "radius"
				}),
				value: d.round || null,
				onChange: (e) => f({ round: e ?? "" }),
				context: r
			})] }),
			p && /* @__PURE__ */ J(Te, {
				className: "grid grid-cols-2 gap-1",
				children: [
					/* @__PURE__ */ q(j, {
						field: l("rx", F(c === "circle" ? "Radius" : "Width Radius"), {
							prefix: c === "circle" ? "R" : "W",
							unit: "%",
							units: ["%", "px"]
						}),
						value: p.rx,
						onChange: (e) => m({ rx: e ?? "50%" }),
						context: r
					}),
					c === "ellipse" ? /* @__PURE__ */ q(j, {
						field: l("ry", F("Height Radius"), {
							prefix: "H",
							unit: "%",
							units: ["%", "px"]
						}),
						value: p.ry,
						onChange: (e) => m({ ry: e ?? "50%" }),
						context: r
					}) : /* @__PURE__ */ q("span", {}),
					/* @__PURE__ */ q(j, {
						field: l("x", F("Center X"), {
							prefix: "X",
							unit: "%",
							units: ["%", "px"]
						}),
						value: p.x,
						onChange: (e) => m({ x: e ?? "50%" }),
						context: r
					}),
					/* @__PURE__ */ q(j, {
						field: l("y", F("Center Y"), {
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
			c === "polygon" && /* @__PURE__ */ q("div", {
				className: "grid grid-cols-5 gap-1",
				children: st.map((e) => /* @__PURE__ */ q(G, {
					compact: !0,
					title: e.label(),
					"aria-label": e.label(),
					"aria-pressed": h?.id === e.id,
					onClick: () => n(e.value),
					className: K("grid aspect-square place-items-center rounded-xs border", h?.id === e.id ? "border-focus bg-focus/8" : "border-border hover:bg-hover"),
					children: /* @__PURE__ */ q("span", {
						className: K("size-4", h?.id === e.id ? "bg-focus" : "bg-muted"),
						style: { clipPath: e.value }
					})
				}, e.id))
			}),
			(c === "custom" || c === "polygon" && !h) && /* @__PURE__ */ q(j, {
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
var mt = () => [
	{
		value: "=",
		label: F("is")
	},
	{
		value: "!=",
		label: F("is not")
	},
	{
		value: "contains",
		label: F("contains")
	},
	{
		value: ">",
		label: F("is more than")
	},
	{
		value: "<",
		label: F("is less than")
	},
	{
		value: "not null",
		label: F("is set")
	},
	{
		value: "null",
		label: F("is empty")
	}
];
function ht({ field: e, value: t, onChange: n, disabled: r, context: i }) {
	let a = Array.isArray(t) ? t : [], o = (e) => n(e.length ? e : null), s = (e, t) => o(a.map((n, r) => r === e ? {
		...n,
		...t
	} : n));
	return /* @__PURE__ */ J("div", {
		className: "min-w-0 flex-1 space-y-1",
		children: [a.map((t, n) => /* @__PURE__ */ J("div", {
			className: "flex items-center gap-1",
			children: [
				/* @__PURE__ */ q(j, {
					field: {
						handle: `${e.handle}-${n}-field`,
						type: "text",
						size: "sm",
						commit: "blur",
						label: F("Field"),
						placeholder: F("Field"),
						mono: !0,
						className: "!w-[34%] !flex-none"
					},
					value: t.field ?? null,
					onChange: (e) => s(n, { field: String(e ?? "").trim() }),
					disabled: r,
					context: i
				}),
				/* @__PURE__ */ q(j, {
					field: {
						handle: `${e.handle}-${n}-op`,
						type: "select",
						size: "sm",
						required: !0,
						label: F("Comparison"),
						options: mt(),
						className: "!flex-none w-[92px]"
					},
					value: t.op ?? "=",
					onChange: (e) => s(n, { op: String(e ?? "=") }),
					disabled: r,
					context: i
				}),
				!["null", "not null"].includes(t.op ?? "") && /* @__PURE__ */ q(j, {
					field: {
						handle: `${e.handle}-${n}-value`,
						type: "text",
						size: "sm",
						commit: "blur",
						label: F("Value"),
						placeholder: F("Value")
					},
					value: t.value === void 0 || t.value === null ? null : String(t.value),
					onChange: (e) => s(n, { value: e ?? "" }),
					disabled: r,
					context: i
				}),
				/* @__PURE__ */ q(N, {
					label: F("Remove Condition"),
					onClick: () => o(a.filter((e, t) => t !== n))
				})
			]
		}, n)), /* @__PURE__ */ J(G, {
			compact: !0,
			disabled: r,
			onClick: () => o([...a, {
				field: "",
				op: "=",
				value: ""
			}]),
			className: "-ml-2 inline-flex h-7 items-center gap-1.5 rounded-sm px-2 text-xs text-muted hover:bg-hover hover:text-ink",
			children: [/* @__PURE__ */ q(H, {
				name: "plus",
				size: 13
			}), F("Add Condition")]
		})]
	});
}
// admin/src/builder/fields/filters.tsx
var gt = [
	{
		name: "blur",
		label: () => F("Blur"),
		unit: "px",
		initial: "8px",
		step: 1,
		min: 0,
		icon: "shadow"
	},
	{
		name: "brightness",
		label: () => F("Brightness"),
		unit: "%",
		initial: "100%",
		step: 5,
		min: 0,
		icon: "sun"
	},
	{
		name: "contrast",
		label: () => F("Contrast"),
		unit: "%",
		initial: "100%",
		step: 5,
		min: 0,
		icon: "opacity"
	},
	{
		name: "saturate",
		label: () => F("Saturation"),
		unit: "%",
		initial: "100%",
		step: 5,
		min: 0,
		icon: "drop-half"
	},
	{
		name: "grayscale",
		label: () => F("Grayscale"),
		unit: "%",
		initial: "100%",
		step: 5,
		min: 0,
		max: 100,
		icon: "opacity"
	},
	{
		name: "hue-rotate",
		label: () => F("Hue"),
		unit: "deg",
		initial: "90deg",
		step: 1,
		icon: "refresh"
	},
	{
		name: "invert",
		label: () => F("Invert"),
		unit: "%",
		initial: "100%",
		step: 5,
		min: 0,
		max: 100,
		icon: "opacity"
	},
	{
		name: "sepia",
		label: () => F("Sepia"),
		unit: "%",
		initial: "100%",
		step: 5,
		min: 0,
		max: 100,
		icon: "theme"
	}
];
function _t(e) {
	return !e || e === "none" ? [] : M(e).map((e) => {
		let t = e.match(/^([a-z-]+)\((.*)\)$/);
		return t ? {
			name: t[1],
			value: t[2]
		} : {
			name: e,
			value: ""
		};
	});
}
var vt = (e) => e.length ? e.map((e) => gt.some((t) => t.name === e.name) || e.value ? `${e.name}(${e.value})` : e.name).join(" ") : null;
function yt({ field: e, value: t, onChange: n, context: r, disabled: i }) {
	let a = _t(t), o = gt.filter((e) => !a.some((t) => t.name === e.name)), s = (e) => n(vt(e));
	return /* @__PURE__ */ J("div", {
		className: "min-w-0 flex-1",
		children: [/* @__PURE__ */ J("div", {
			className: "flex h-7 items-center gap-2",
			children: [
				/* @__PURE__ */ q(ae, {
					field: e,
					className: a.length ? "!w-auto" : void 0
				}),
				/* @__PURE__ */ q("span", {
					className: "min-w-0 flex-1 truncate text-xs text-faint",
					children: a.length ? "" : F("None")
				}),
				o.length > 0 && /* @__PURE__ */ q(Ve, {
					align: "end",
					trigger: /* @__PURE__ */ q(G, {
						compact: !0,
						disabled: i,
						className: "grid size-6 shrink-0 place-items-center rounded-sm text-muted hover:bg-hover hover:text-ink",
						"aria-label": F("Add a Filter"),
						title: F("Add a Filter"),
						children: /* @__PURE__ */ q(H, {
							name: "plus",
							size: 14
						})
					}),
					items: o.map((e) => ({
						label: e.label(),
						icon: e.icon,
						onSelect: () => s([...a, {
							name: e.name,
							value: e.initial
						}])
					}))
				})
			]
		}), a.length > 0 && /* @__PURE__ */ q("div", {
			className: "mt-1 space-y-1",
			children: a.map((t, n) => {
				let o = gt.find((e) => e.name === t.name), c = o ? {
					handle: `${e.handle}-${t.name}`,
					type: "text",
					component: "blocks-value",
					label: o.label(),
					unit: o.unit,
					step: o.step,
					min: o.min,
					max: o.max,
					placeholder: o.initial
				} : {
					handle: `${e.handle}-${t.name}`,
					type: "text",
					component: "blocks-value",
					label: t.name,
					unit: ""
				};
				return /* @__PURE__ */ J("div", {
					className: "flex h-7 items-center gap-2",
					children: [
						/* @__PURE__ */ J("span", {
							className: "flex w-[88px] shrink-0 items-center gap-1.5 truncate pl-2 text-xs text-muted",
							children: [/* @__PURE__ */ q(H, {
								name: o?.icon ?? "faders",
								size: 13,
								className: "shrink-0 text-faint"
							}), o?.label() ?? t.name]
						}),
						/* @__PURE__ */ q(j, {
							field: c,
							value: o?.unit === "%" && /^[\d.]+$/.test(t.value) ? `${Math.round(parseFloat(t.value) * 1e3) / 10}%` : t.value || null,
							onChange: (e) => s(a.map((t, r) => r === n ? {
								...t,
								value: String(e ?? o?.initial ?? "")
							} : t)),
							disabled: i,
							context: r
						}),
						/* @__PURE__ */ q(N, {
							label: F("Remove Filter"),
							onClick: () => s(a.filter((e, t) => t !== n))
						})
					]
				}, t.name + n);
			})
		})]
	});
}
// admin/src/builder/fields/inlineText.tsx
function bt({ field: e, value: t, onChange: n, disabled: r }) {
	let i = R(null);
	return L(() => {
		i.current && i.current.innerHTML !== (t ?? "") && document.activeElement !== i.current && (i.current.innerHTML = t ?? "");
	}, [t]), /* @__PURE__ */ q("div", {
		ref: i,
		id: Ge(e),
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
		className: K(b, "cursor-text overflow-hidden whitespace-nowrap leading-[26px] outline-none [&_*]:inline empty:before:text-ghost empty:before:content-[attr(data-placeholder)]")
	});
}
// admin/src/builder/fields/shadows.tsx
var xt = /^-?[\d.]+(px|rem|em)?$/;
function St(e) {
	return !e || e === "none" ? [] : e.startsWith("token:") ? null : Se(e).map((e) => {
		let t = M(e), n = t.includes("inset"), r = t.filter((e) => e !== "inset"), i = r.filter((e) => xt.test(e)), a = r.find((e) => !xt.test(e)) ?? "rgb(0 0 0 / 15%)";
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
function Ct(e, t = !1) {
	return e.length ? e.map((e) => t ? `${e.x} ${e.y} ${e.blur} ${e.color}` : `${e.inset ? "inset " : ""}${e.x} ${e.y} ${e.blur} ${e.spread} ${e.color}`).join(", ") : null;
}
var wt = {
	inset: !1,
	x: "0px",
	y: "8px",
	blur: "24px",
	spread: "-8px",
	color: "rgb(0 0 0 / 18%)"
}, Tt = {
	inset: !1,
	x: "0px",
	y: "1px",
	blur: "2px",
	spread: "0",
	color: "rgb(0 0 0 / 25%)"
}, Et = (e) => e.replace(/px$/, "");
function Dt({ field: e, value: t, onChange: n, context: r }) {
	let i = e.kind === "text", a = i ? void 0 : e.group ?? "shadow", o = Ae(), s = we(), [c, l] = z(null), u = o(t), d = St(t) ?? [], f = (e) => n(Ct(e, i));
	return /* @__PURE__ */ J("div", {
		className: "min-w-0 flex-1",
		children: [
			/* @__PURE__ */ J("div", {
				className: "group/value flex h-7 items-center gap-2",
				children: [
					/* @__PURE__ */ q(ae, { field: e }),
					/* @__PURE__ */ q("span", {
						className: "min-w-0 flex-1 truncate text-xs text-faint",
						children: !u && !d.length ? typeof e.placeholder == "string" && e.placeholder ? e.placeholder : F("None") : ""
					}),
					a && /* @__PURE__ */ q(_e, {
						group: a,
						value: t,
						onPick: n,
						active: !!u,
						className: "size-6"
					}),
					!u && /* @__PURE__ */ q(Me, {
						label: F(i ? "Add Text Shadow" : "Add Shadow"),
						onClick: () => {
							f([...d, i ? Tt : wt]), l(d.length);
						}
					})
				]
			}),
			u && /* @__PURE__ */ J("div", {
				className: "flex h-7 items-center gap-2 pl-[88px]",
				children: [
					/* @__PURE__ */ q("span", {
						className: "size-4 shrink-0 rounded-xs border border-border bg-bg",
						style: { boxShadow: s(String(u.token.value)) }
					}),
					/* @__PURE__ */ q(de, {
						token: u.token,
						className: "text-xs"
					}),
					/* @__PURE__ */ q("span", { className: "flex-1" }),
					/* @__PURE__ */ q(N, {
						label: F("Remove Shadow"),
						onClick: () => n(null)
					})
				]
			}),
			d.map((e, t) => /* @__PURE__ */ J("div", {
				className: "flex h-7 items-center gap-1 pl-[88px]",
				children: [/* @__PURE__ */ J(W, {
					open: c === t,
					onOpenChange: (e) => l(e ? t : null),
					align: "end",
					className: "w-64 !p-2",
					trigger: /* @__PURE__ */ J(G, {
						compact: !0,
						className: K("flex h-7 min-w-0 flex-1 items-center gap-1.5 rounded-sm px-1.5 text-left text-xs hover:bg-hover", c === t && "bg-active"),
						children: [
							i ? /* @__PURE__ */ q("span", {
								className: "grid size-4 shrink-0 place-items-center text-2xs font-semibold text-text",
								style: { textShadow: s(Ct([e], !0) ?? "") },
								children: "A"
							}) : /* @__PURE__ */ q("span", {
								className: "size-4 shrink-0 rounded-xs border border-border bg-bg",
								style: { boxShadow: s(Ct([{
									...e,
									x: Y(e.x),
									y: Y(e.y),
									blur: Y(e.blur),
									spread: Y(e.spread)
								}]) ?? "") }
							}),
							/* @__PURE__ */ q("span", {
								className: "min-w-0 flex-1 truncate font-mono tabular-nums text-muted",
								children: [
									e.x,
									e.y,
									e.blur,
									...i ? [] : [e.spread]
								].map(Et).join(" ")
							}),
							e.inset && /* @__PURE__ */ q("span", {
								className: "rounded-xs bg-sunken px-1 text-2xs text-muted",
								children: F("Inside")
							})
						]
					}),
					children: [/* @__PURE__ */ q("p", {
						className: "m-0 mb-2 text-xs font-semibold text-ink",
						children: F(i ? "Text Shadow" : "Shadow")
					}), /* @__PURE__ */ q(pe, {
						context: r,
						fields: [
							!i && {
								handle: "inset",
								type: "select",
								display: "segmented",
								block: !0,
								size: "sm",
								required: !0,
								label: F("Type"),
								options: [{
									value: "outside",
									label: F("Outside")
								}, {
									value: "inside",
									label: F("Inside")
								}]
							},
							{
								handle: "x",
								type: "text",
								component: "blocks-value",
								label: F("X Offset"),
								prefix: "X",
								placeholder: "0"
							},
							{
								handle: "y",
								type: "text",
								component: "blocks-value",
								label: F("Y Offset"),
								prefix: "Y",
								placeholder: "0"
							},
							{
								handle: "blur",
								type: "text",
								component: "blocks-value",
								label: F("Blur"),
								min: 0,
								prefixIcon: "shadow",
								placeholder: "0"
							},
							!i && {
								handle: "spread",
								type: "text",
								component: "blocks-value",
								label: F("Spread"),
								prefixIcon: "arrows-out-simple",
								placeholder: "0"
							},
							{
								handle: "color",
								type: "color",
								component: "blocks-color",
								label: F("Color")
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
				}), /* @__PURE__ */ q(N, {
					label: F("Remove Shadow"),
					onClick: () => f(d.filter((e, n) => n !== t))
				})]
			}, t))
		]
	});
}
function Y(e) {
	let t = parseFloat(e);
	return Number.isNaN(t) ? e : `${Math.max(-4, Math.min(4, t / 4))}px`;
}
// admin/src/builder/fields/spacing.tsx
var Ot = /^(-?\d*\.?\d+)([a-z%]*)$/i;
function kt(e, t) {
	return t.shiftKey ? [
		0,
		1,
		2,
		3
	] : t.altKey ? [e, (e + 2) % 4] : [e];
}
function X(e, t) {
	if (t.length === 4) return F(e === "margin" ? "Margin, All Sides" : "Padding, All Sides");
	if (t.length === 2) return t.includes(0) ? F(e === "margin" ? "Margin, Top and Bottom" : "Padding, Top and Bottom") : F(e === "margin" ? "Margin, Left and Right" : "Padding, Left and Right");
	let n = {
		0: F("top"),
		1: F("right"),
		2: F("bottom"),
		3: F("left")
	}[t[0]];
	return F(e === "margin" ? "Margin {side}" : "Padding {side}", { side: n });
}
function At({ field: e, value: t, onChange: n, context: r }) {
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
	}), c = (e, t) => /* @__PURE__ */ q(jt, {
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
					children: F("Margin")
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
							children: F("Padding")
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
function jt({ box: e, index: t, value: n, status: r, onChange: i, context: a }) {
	let o = Ae(), [s, c] = z(!1), [l, u] = z([t]), [d, f] = z(!1), p = o(n), m = n?.match(Ot), h = p ? p.token.name : m ? m[2] === "px" || !m[2] ? m[1] : `${m[1]}${m[2]}` : n ?? "0";
	return /* @__PURE__ */ q(W, {
		open: s,
		onOpenChange: c,
		align: "center",
		className: "w-60 !p-2",
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
					i(kt(t, n), `${e === "padding" ? Math.max(0, u) : u}${s}`);
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
			onClick: (e) => u(kt(t, e)),
			"aria-label": X(e, [t]),
			title: `${X(e, [t])}${p ? ` · ${p.token.path}` : ""}\n${F("Drag to change. Alt: opposite side too, Shift: all sides.")}`,
			className: K("mx-auto flex h-full min-w-0 max-w-full items-center justify-center rounded-xs px-1 text-xs tabular-nums outline-none transition-colors focus-visible:ring-2 focus-visible:ring-focus", t % 2 ? "cursor-ew-resize" : "cursor-ns-resize", r === "own" ? "font-medium text-ink" : r === "inherited" ? "text-text" : "text-faint", s || d ? "bg-active" : "hover:bg-hover"),
			children: /* @__PURE__ */ q("span", {
				className: K("truncate", p && "rounded-xs px-1 leading-4", p && "bg-active"),
				children: h
			})
		}),
		children: /* @__PURE__ */ q(Nt, {
			box: e,
			sides: l,
			value: n,
			onChange: (e) => i(l, e),
			close: () => c(!1),
			context: a
		})
	});
}
var Mt = [
	"0",
	"4px",
	"8px",
	"12px",
	"16px",
	"24px",
	"32px",
	"48px",
	"64px",
	"96px"
];
function Nt({ box: e, sides: t, value: r, onChange: i, close: a, context: o }) {
	let { byGroup: s } = n(), c = s.get("space") ?? [], l = R(null);
	L(() => {
		(l.current?.querySelector("input"))?.focus();
	}, []);
	let u = (e) => {
		i(e), a();
	};
	return /* @__PURE__ */ J("div", {
		ref: l,
		onKeyDown: (e) => {
			e.key === "Enter" && requestAnimationFrame(a);
		},
		children: [
			/* @__PURE__ */ J("p", {
				className: "m-0 mb-1.5 flex items-center justify-between text-xs font-semibold text-ink",
				children: [X(e, t), r !== void 0 && /* @__PURE__ */ q(G, {
					compact: !0,
					onClick: () => u(null),
					className: "rounded-xs px-1 text-2xs font-normal text-muted hover:bg-hover hover:text-text",
					children: F("Reset")
				})]
			}),
			/* @__PURE__ */ q(j, {
				field: {
					handle: `${e}-${t.join("")}`,
					type: "text",
					component: "blocks-value",
					label: X(e, t),
					placeholder: "0",
					keywords: e === "margin" ? ["auto"] : [],
					min: e === "padding" ? 0 : void 0
				},
				value: r ?? null,
				onChange: (e) => i(e),
				context: o
			}),
			c.length > 0 ? /* @__PURE__ */ J(Ke, { children: [/* @__PURE__ */ q("p", {
				className: "cms-label m-0 mb-1 mt-2.5 !text-2xs",
				children: F("Space Tokens")
			}), /* @__PURE__ */ q("div", {
				className: "flex flex-wrap gap-1",
				children: c.map((e) => /* @__PURE__ */ q(G, {
					compact: !0,
					title: `${e.path} · ${typeof e.value == "object" && e.value ? Object.values(e.value).join("–") : String(e.value)}`,
					onClick: () => u(`token:${e.path}`),
					className: K("h-6 min-w-7 rounded-xs px-1.5 text-2xs tabular-nums", r === `token:${e.path}` ? "bg-signal text-signal-ink" : "bg-sunken text-text hover:bg-hover"),
					children: e.name
				}, e.path))
			})] }) : /* @__PURE__ */ q("div", {
				className: "mt-2 flex flex-wrap gap-1",
				children: Mt.map((e) => /* @__PURE__ */ q(G, {
					compact: !0,
					onClick: () => u(e),
					className: K("h-6 min-w-7 rounded-xs px-1.5 text-2xs tabular-nums", r === e ? "bg-signal text-signal-ink" : "bg-sunken text-text hover:bg-hover"),
					children: e.replace("px", "")
				}, e))
			}),
			e === "margin" && /* @__PURE__ */ q(G, {
				compact: !0,
				onClick: () => u("auto"),
				className: K("mt-1 h-6 rounded-xs px-1.5 text-2xs", r === "auto" ? "bg-signal text-signal-ink" : "bg-sunken text-text hover:bg-hover"),
				children: F("Auto")
			})
		]
	});
}
// admin/src/builder/fields/index.ts
function Pt() {
	let e = {
		"blocks-value": ve,
		"blocks-color": fe,
		"blocks-bind": it,
		"blocks-node": at,
		"blocks-nodes": ot,
		"blocks-group": he,
		"blocks-pairs": ge,
		"blocks-more": Oe,
		"blocks-shadows": Dt,
		"blocks-gradient": De,
		"blocks-align": Ce,
		"blocks-origin": ye,
		"blocks-spacing": At,
		"blocks-filters": yt,
		"blocks-clip": pt,
		"blocks-conditions": ht,
		"blocks-inline-text": bt
	};
	for (let [t, n] of Object.entries(e)) P.fields.set(t, n);
}
// admin/src/builder/icons.ts
var Z = "<rect x=\"44\" y=\"44\" width=\"168\" height=\"168\" rx=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"14\" stroke-dasharray=\"18 18\" opacity=\".4\"/>", Ft = {
	"b-side-all": "<rect x=\"44\" y=\"44\" width=\"168\" height=\"168\" rx=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"18\"/>",
	"b-side-top": Z + "<path d=\"M44 44h168\" stroke=\"currentColor\" stroke-width=\"22\" stroke-linecap=\"round\"/>",
	"b-side-right": Z + "<path d=\"M212 44v168\" stroke=\"currentColor\" stroke-width=\"22\" stroke-linecap=\"round\"/>",
	"b-side-bottom": Z + "<path d=\"M44 212h168\" stroke=\"currentColor\" stroke-width=\"22\" stroke-linecap=\"round\"/>",
	"b-side-left": Z + "<path d=\"M44 44v168\" stroke=\"currentColor\" stroke-width=\"22\" stroke-linecap=\"round\"/>"
};
function It() {
	for (let [e, t] of Object.entries(Ft)) P.icons.get(e) || P.icons.set(e, t);
}
// admin/src/builder/content/IconField.tsx
var Lt = [
	"regular",
	"bold",
	"fill",
	"light"
], Rt = (e) => ({
	regular: F("Regular"),
	bold: F("Bold"),
	fill: F("Fill||weight"),
	light: F("Light||weight")
})[e], zt = (e) => {
	let t = e.match(/^(.*)-(bold|fill|light)$/);
	return t ? {
		base: t[1],
		weight: t[2]
	} : {
		base: e,
		weight: "regular"
	};
};
function Bt({ field: e, value: t, onChange: n, disabled: r }) {
	let [i, a] = z(!1), [o, s] = z(""), [c, l] = z(""), u = (t ?? "").replace(/^ph:/, ""), { base: d, weight: f } = zt(u), p = I("blocks/icons", {
		query: d,
		limit: 1
	}, {
		enabled: !!d,
		staleTime: Infinity
	}), m = I("blocks/icons", {
		query: c,
		limit: 160
	}, {
		enabled: i,
		staleTime: Infinity
	}), h = p.data?.find((e) => e.name === d) ?? p.data?.[0];
	L(() => {
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
				id: Ge(e),
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
						children: u ? d : e.placeholder || F("Choose an Icon")
					}),
					u && f !== "regular" && /* @__PURE__ */ q("span", {
						className: "shrink-0 text-faint",
						children: Rt(f)
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
							placeholder: F("Search Icons"),
							"aria-label": F("Search Icons"),
							spellCheck: !1,
							className: "h-full min-w-0 flex-1 bg-transparent text-sm text-text outline-none placeholder:text-faint"
						}),
						m.isFetching && /* @__PURE__ */ q(We, { size: 12 })
					]
				}),
				/* @__PURE__ */ q("div", {
					className: "border-b border-border p-1.5",
					children: /* @__PURE__ */ q(Ue, {
						size: "xs",
						block: !0,
						value: f,
						onChange: (e) => u ? g(d, e) : void 0,
						options: Lt.map((e) => ({
							value: e,
							label: Rt(e)
						}))
					})
				}),
				/* @__PURE__ */ J("div", {
					className: "grid max-h-64 grid-cols-8 gap-0.5 overflow-y-auto p-1.5",
					role: "listbox",
					"aria-label": F("Icons"),
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
						children: F("No matches")
					})]
				})
			]
		}), u && !r && /* @__PURE__ */ q(G, {
			onClick: () => n(null),
			"aria-label": F("Remove Icon"),
			className: "absolute right-1 top-1/2 grid size-5 -translate-y-1/2 place-items-center rounded-xs text-faint opacity-0 hover:bg-hover hover:text-text focus-visible:opacity-100 group-hover/icon:opacity-100",
			children: /* @__PURE__ */ q(H, {
				name: "close",
				size: 12
			})
		})]
	});
}
// admin/src/write/Blocks.tsx
function Vt() {
	return /* @__PURE__ */ q("hr", { className: "my-3 border-0 border-t border-border-strong" });
}
function Ht({ nodes: e }) {
	let { store: t, types: n, allowed: i } = r(), { readOnly: a } = k(), o = e[e.length - 1];
	return /* @__PURE__ */ J("div", {
		className: "group/actions flex flex-wrap items-center gap-x-3 gap-y-2 py-1",
		children: [e.map((e) => /* @__PURE__ */ q(Wt, { node: e }, e.id)), !a && o.type === "button" && n.has("button") && /* @__PURE__ */ q(U, {
			icon: "plus",
			label: F("Add a Button"),
			size: "xs",
			className: "opacity-0 transition-opacity group-hover/actions:opacity-100 focus-visible:opacity-100",
			onClick: () => {
				let e = t.get().nodes, r = d(e, o.id, "button", n, i), a = n.get("button");
				if (!r || !a) return;
				let s = h(a, {
					label: "",
					variant: o.type === "button" && (o.props.variant ?? "primary") === "primary" ? "secondary" : o.props.variant ?? "primary"
				}, n);
				t.insert(r.parentId, r.index, [s]), t.focus(s.id, "end", "label");
			}
		})]
	});
}
var Ut = {
	primary: "h-9 rounded-md bg-ink px-4 text-ink-contrast",
	secondary: "h-9 rounded-md border border-border-strong bg-bg px-4 text-text",
	ghost: "h-9 rounded-md px-3 text-text bg-sunken/60",
	link: "h-9 text-text underline decoration-border-strong underline-offset-4"
};
function Wt({ node: e }) {
	let { store: t } = r(), { readOnly: n } = k(), [i, a] = z(!1), o = A(t, (t) => t.focus?.id === e.id && t.focus.prop === "label" ? t.focus : null), s = e.type === "link", c = String(e.props.url ?? ""), l = s ? Ut.link : Ut[e.props.variant ?? "primary"] ?? Ut.primary, u = T(), d = [
		ce({
			handle: "url",
			label: F("Link"),
			placeholder: F("Paste a link or search pages"),
			autofocus: !c,
			anchors: u
		}),
		...s ? [] : [{
			handle: "variant",
			type: "select",
			label: F("Style"),
			display: "segmented",
			block: !0,
			options: [
				{
					value: "primary",
					label: F("Primary")
				},
				{
					value: "secondary",
					label: F("Secondary")
				},
				{
					value: "ghost",
					label: F("Ghost")
				},
				{
					value: "link",
					label: F("Text")
				}
			]
		}],
		{
			handle: "new_tab",
			type: "toggle",
			label: F("Open in New Tab")
		}
	];
	return /* @__PURE__ */ J("span", {
		className: "group/action relative inline-flex",
		children: [
			/* @__PURE__ */ q("span", {
				className: K("inline-flex items-center text-sm font-medium", l),
				children: /* @__PURE__ */ q(C, {
					html: String(e.props.label ?? ""),
					singleLine: !0,
					quiet: !0,
					disabled: n,
					placeholder: F(s ? "Link Text" : "Button Text"),
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
				title: F("No link yet")
			}),
			!n && /* @__PURE__ */ q(W, {
				open: i,
				onOpenChange: a,
				align: "start",
				className: "w-80 !p-3",
				trigger: /* @__PURE__ */ q(G, {
					"aria-label": F("Edit Link"),
					title: c || F("Add a Link"),
					className: K("absolute -right-2.5 -top-2.5 grid size-6 place-items-center rounded-full border border-border bg-bg text-muted shadow-pop transition-opacity hover:text-text", i ? "opacity-100" : "opacity-0 group-hover/action:opacity-100 focus-visible:opacity-100"),
					children: /* @__PURE__ */ q(H, {
						name: "link",
						size: 12
					})
				}),
				children: /* @__PURE__ */ J("div", {
					className: "space-y-3",
					onKeyDown: (e) => e.key === "Enter" && !e.defaultPrevented && e.target.tagName === "INPUT" && a(!1),
					children: [/* @__PURE__ */ q(V, {
						fields: d,
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
								a(!1), t.remove(e.id);
							},
							children: F(s ? "Remove Link" : "Remove Button")
						})
					})]
				})
			})
		]
	});
}
function Gt(e) {
	let t = Array.isArray(e) ? e[0] : e, n = typeof t == "string" && /^(https?:|\/)/.test(t), r = I("media/get-many", { ids: [t] }, {
		enabled: typeof t == "string" && !n && t.length > 0,
		staleTime: 3e5,
		retry: !1
	});
	if (n) return t;
	let i = r.data?.items?.[0];
	return i ? i.url ?? i.thumb : null;
}
function Kt({ node: e }) {
	let { store: t } = r(), { settings: n, readOnly: i } = k(), a = Gt(e.props.image);
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
					children: /* @__PURE__ */ q(B, {
						size: "xs",
						variant: "secondary",
						icon: "settings",
						onClick: () => n(e.id),
						children: F("Edit")
					})
				}),
				!e.props.alt && !i && /* @__PURE__ */ q("span", {
					className: "absolute bottom-2 left-2 rounded-xs bg-bg/90 px-1.5 py-0.5 text-2xs text-muted opacity-0 shadow-pop transition-opacity group-hover/image:opacity-100",
					children: F("No alt text")
				})
			]
		}) : /* @__PURE__ */ J("div", {
			className: "flex h-36 flex-col items-center justify-center gap-3 rounded-md bg-surface text-faint",
			children: [/* @__PURE__ */ q(H, {
				name: "image",
				size: 22
			}), /* @__PURE__ */ q(V, {
				bare: !0,
				disabled: i,
				fields: [{
					handle: "image",
					type: "media",
					label: F("Image"),
					max: 1,
					accept: "image/*"
				}],
				values: { image: e.props.image },
				onChange: (n, r) => t.updateProps(e.id, { image: r })
			})]
		}), /* @__PURE__ */ q(qt, { node: e })]
	});
}
function qt({ node: e }) {
	let { store: t } = r(), { readOnly: n } = k(), i = A(t, (t) => t.focus?.id === e.id && t.focus.prop === "caption" ? t.focus : null);
	return n && !e.props.caption ? null : /* @__PURE__ */ q("figcaption", { children: /* @__PURE__ */ q(C, {
		html: String(e.props.caption ?? ""),
		quiet: !0,
		disabled: n,
		placeholder: F("Add a Caption"),
		focus: i,
		className: "mt-2 text-sm text-muted",
		onChange: (n) => t.updateProps(e.id, { caption: n }),
		onFocus: () => t.select(e.id)
	}) });
}
function Jt(e) {
	let t = (Array.isArray(e) ? e : e ? [e] : []).filter((e) => typeof e == "string" && e !== ""), n = t.filter((e) => !/^(https?:|\/)/.test(e)), r = I("media/get-many", { ids: n }, {
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
function Q({ node: e, type: t }) {
	let { settings: n } = k(), [r] = Jt(e.props.file), i = String(e.props.url ?? ""), a = i ? i.replace(/^https?:\/\/(www\.)?/, "").split(/[/?#]/)[0] : "", o = {
		video: F("Add a video"),
		audio: F("Add audio"),
		file: F("Add a file")
	}[e.type] ?? F("Add a link to embed"), s = r ? r.name || r.filename : "", c = e.props.title || e.props.label || s || a || o, l = (e.props.title || e.props.label) && (s || a);
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
		}), t?.inline?.includes("caption") && /* @__PURE__ */ q(qt, { node: e })]
	});
}
function Yt({ node: e, type: t }) {
	let { settings: n } = k(), r = Jt(e.props.images);
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
				}), F("Add images")]
			})
		})
	});
}
function Xt({ node: e }) {
	let { store: t } = r(), { settings: n, readOnly: i } = k();
	return /* @__PURE__ */ J("div", {
		className: "group/code relative py-1",
		onFocus: () => t.select(e.id),
		children: [/* @__PURE__ */ q(V, {
			bare: !0,
			disabled: i,
			fields: [{
				handle: "code",
				type: "code",
				label: F("Code"),
				placeholder: F("Code"),
				rows: 3,
				language: e.props.language
			}],
			values: { code: e.props.code ?? "" },
			onChange: (n, r) => t.updateProps(e.id, { code: r ?? "" }, `code:${e.id}`)
		}), /* @__PURE__ */ q(G, {
			onClick: () => n(e.id),
			className: "absolute right-2 top-2.5 rounded-xs px-1.5 font-mono text-2xs text-faint hover:bg-hover hover:text-text",
			children: e.props.language && e.props.language !== "plain" ? e.props.language : F("Plain Text")
		})]
	});
}
function Zt({ node: e }) {
	let { store: t } = r(), { readOnly: n } = k(), i = Array.isArray(e.props.rows) && e.props.rows.length ? e.props.rows : [["", ""], ["", ""]], a = Math.max(...i.map((e) => e.length)), o = (n, r, o) => t.updateProps(e.id, { rows: i.map((e, t) => t === n ? Array.from({ length: a }, (t, n) => n === r ? o : e[n] ?? "") : e) }, `table:${e.id}`), s = (n) => t.updateProps(e.id, { rows: n });
	return /* @__PURE__ */ J("div", {
		className: "group/table py-1",
		children: [/* @__PURE__ */ q("div", {
			className: "overflow-x-auto rounded-md border border-border",
			children: /* @__PURE__ */ q("table", {
				className: "w-full border-collapse text-sm",
				children: /* @__PURE__ */ q("tbody", { children: i.map((r, i) => /* @__PURE__ */ q("tr", {
					className: K("border-b border-border last:border-b-0", i === 0 && e.props.header !== !1 && "bg-surface font-medium"),
					children: Array.from({ length: a }, (a, s) => /* @__PURE__ */ q("td", {
						className: "min-w-24 border-r border-border px-3 py-2 align-top last:border-r-0",
						children: /* @__PURE__ */ q(C, {
							html: r[s] ?? "",
							singleLine: !0,
							disabled: n,
							onChange: (e) => o(i, s, e),
							onFocus: () => t.select(e.id)
						})
					}, s))
				}, i)) })
			})
		}), !n && /* @__PURE__ */ J("div", {
			className: "mt-1 flex gap-1 opacity-0 transition-opacity group-hover/table:opacity-100 group-focus-within/table:opacity-100",
			children: [
				/* @__PURE__ */ q(B, {
					size: "xs",
					variant: "ghost",
					icon: "plus",
					onClick: () => s([...i, Array(a).fill("")]),
					children: F("Row")
				}),
				/* @__PURE__ */ q(B, {
					size: "xs",
					variant: "ghost",
					icon: "plus",
					onClick: () => s(i.map((e) => [...e, ""])),
					children: F("Column")
				}),
				i.length > 1 && /* @__PURE__ */ q(B, {
					size: "xs",
					variant: "ghost",
					icon: "minus",
					onClick: () => s(i.slice(0, -1)),
					children: F("Row")
				}),
				a > 1 && /* @__PURE__ */ q(B, {
					size: "xs",
					variant: "ghost",
					icon: "minus",
					onClick: () => s(i.map((e) => e.slice(0, a - 1))),
					children: F("Column")
				})
			]
		})]
	});
}
function Qt({ node: e }) {
	let { store: t } = r(), { readOnly: n } = k(), i = Array.isArray(e.props.items) ? e.props.items : [], a = (n, r) => t.updateProps(e.id, { items: i.map((e, t) => t === n ? {
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
			children: o.map((r, o) => /* @__PURE__ */ J("div", {
				className: "py-3",
				children: [/* @__PURE__ */ J("div", {
					className: "flex items-start gap-2",
					children: [
						/* @__PURE__ */ q(H, {
							name: "chevron-down",
							size: 14,
							className: "mt-1 shrink-0 text-faint"
						}),
						/* @__PURE__ */ q(C, {
							html: tn(r.question ?? ""),
							singleLine: !0,
							disabled: n,
							placeholder: F("Question"),
							className: "min-w-0 flex-1 text-base font-medium leading-6",
							onChange: (e) => a(o, { question: nn(e) }),
							onFocus: () => t.select(e.id)
						}),
						!n && i.length > 1 && /* @__PURE__ */ q(U, {
							icon: "close",
							label: F("Remove Question"),
							size: "xs",
							className: "opacity-0 group-hover/faq:opacity-100",
							onClick: () => t.updateProps(e.id, { items: i.filter((e, t) => t !== o) })
						})
					]
				}), /* @__PURE__ */ q(C, {
					html: r.answer ?? "",
					quiet: !0,
					disabled: n,
					placeholder: F("Answer"),
					className: "mt-1 pl-[22px] text-base leading-6 text-muted",
					onChange: (e) => a(o, { answer: e }),
					onFocus: () => t.select(e.id)
				})]
			}, o))
		}), !n && /* @__PURE__ */ q(B, {
			size: "xs",
			variant: "ghost",
			icon: "plus",
			className: "mt-1 opacity-0 transition-opacity group-hover/faq:opacity-100",
			onClick: () => t.updateProps(e.id, { items: [...i, {
				question: "",
				answer: ""
			}] }),
			children: F("Question")
		})]
	});
}
function $t({ node: e }) {
	let { store: t } = r(), { readOnly: n } = k(), i = I("components/list", { working: !0 }, { staleTime: 3e4 }), a = i.data?.find((t) => t.handle === e.props.ref), o = e.props.values ?? {}, s = e.bind ?? {}, c = (a?.props ?? []).filter((e) => e.type !== "json"), l = (n, r) => t.updateProps(e.id, { values: {
		...o,
		[n]: r
	} }, `values:${e.id}:${n}`), u = /* @__PURE__ */ J("div", {
		className: "flex h-8 items-center gap-2 text-xs",
		children: [
			/* @__PURE__ */ q(H, {
				name: "symbol",
				size: 13,
				className: "text-faint"
			}),
			/* @__PURE__ */ q("span", {
				className: "truncate font-medium text-muted",
				children: a?.title ?? (i.isLoading ? "…" : F("Missing component"))
			}),
			/* @__PURE__ */ q("span", { className: "flex-1" }),
			a?.id && /* @__PURE__ */ q(G, {
				onClick: () => Pe(`/content/components/${a.id}`),
				className: "rounded-xs px-1.5 text-faint opacity-0 transition-opacity hover:bg-hover hover:text-text group-hover/component:opacity-100",
				children: F("Edit Component")
			})
		]
	});
	return c.length === 0 ? /* @__PURE__ */ J("div", {
		className: "flex h-9 items-center gap-2 rounded-md px-1 text-sm text-faint",
		children: [
			/* @__PURE__ */ q(H, {
				name: "symbol",
				size: 14
			}),
			/* @__PURE__ */ q("span", {
				className: "truncate text-muted",
				children: a?.title ?? (i.isLoading ? "…" : F("Missing component"))
			}),
			a?.id && /* @__PURE__ */ q(G, {
				onClick: () => Pe(`/content/components/${a.id}`),
				className: "shrink-0 rounded-xs px-1 text-xs text-faint hover:bg-hover hover:text-text",
				children: F("Edit Component")
			})
		]
	}) : /* @__PURE__ */ J("div", {
		className: "group/component rounded-md border border-border px-3 pb-1",
		children: [u, c.length > 0 && /* @__PURE__ */ q("div", {
			className: "space-y-2.5 border-t border-border py-2.5",
			children: c.map((r) => {
				let i = o[r.handle] ?? r.default, a = s[`values.${r.handle}`];
				return /* @__PURE__ */ J("div", {
					className: "grid grid-cols-[120px_minmax(0,1fr)] items-start gap-3",
					children: [/* @__PURE__ */ q("span", {
						className: "truncate pt-[3px] text-xs text-faint",
						title: r.instructions,
						children: r.label
					}), a ? /* @__PURE__ */ q("span", {
						className: "pt-[3px] font-mono text-xs text-faint",
						children: a
					}) : [
						"text",
						"textarea",
						"richtext"
					].includes(r.type) ? /* @__PURE__ */ q(C, {
						html: r.type === "richtext" ? String(i ?? "") : tn(String(i ?? "")),
						singleLine: r.type === "text",
						disabled: n,
						placeholder: r.placeholder ?? F("Empty"),
						className: "text-base leading-6",
						onChange: (e) => l(r.handle, r.type === "richtext" ? e : nn(e)),
						onFocus: () => t.select(e.id)
					}) : /* @__PURE__ */ q(V, {
						bare: !0,
						disabled: n,
						fields: [r.type === "url" ? ce({
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
function en({ node: e, type: t }) {
	let { settings: n } = k(), r = a(e, 80);
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
				children: t ? r : F("Its plugin is off — the content is kept")
			})]
		})]
	});
}
function tn(e) {
	return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
}
function nn(e) {
	let t = document.createElement("div");
	return t.innerHTML = e.replace(/<br\s*\/?>/g, "\n"), t.textContent ?? "";
}
// admin/src/write/WriteEditor.tsx
var $ = /* @__PURE__ */ new Map(), rn = (e) => $.get(e) ?? $.get(e.split("/")[0] + "/*"), an = (e) => !!rn(e), on = Fe(null);
function sn({ onInspect: e } = {}) {
	let { store: t, types: n, allowed: i, readOnly: a = !1 } = r(), u = A(t, (e) => e.nodes), f = ze(() => ie(u, n, an), [u, n]), p = ze(() => new Map(re(f).map((e) => [D(e), e])), [f]), m = R(null), [h, _] = z(null), [v, b] = z(null), [ee, x] = z(null), C = nt(tt(Xe, { activationConstraint: { distance: 5 } })), w = R(null), T = ze(() => ({
		stops: () => {
			let e = t.get().nodes;
			return w.current?.nodes !== e && (w.current = {
				nodes: e,
				stops: te(ie(e, n, an))
			}), w.current.stops;
		},
		settings: (n) => {
			t.select(n, !0), e ? e(n) : _(n);
		},
		readOnly: a
	}), [
		t,
		n,
		a,
		e
	]);
	Re(() => {
		u.length === 0 && !a && g(null, "paragraph", n, i) && t.reset([y()]);
	}, [
		u,
		a,
		t,
		n,
		i
	]);
	let E = R(p);
	E.current = p, bn(t, m, T, E);
	let O = (e, r, a) => {
		let c = t.get().nodes, u = a === "before" ? S(r)[0] : S(r).at(-1), d = S(e);
		if (d.some((e) => e.id === u.id || o(c, u.id).some((t) => t.id === e.id))) return null;
		let f = l(c, u.id);
		if (!f) return null;
		let p = f.parentId ? s(c, f.parentId) : null;
		return d.every((e) => g(p, e.type, n, p ? [] : i)) ? {
			ids: d.map((e) => e.id),
			parentId: f.parentId,
			index: a === "before" ? f.index : f.index + 1
		} : null;
	};
	return /* @__PURE__ */ q(ne.Provider, {
		value: T,
		children: /* @__PURE__ */ J("div", {
			ref: m,
			className: "relative",
			"data-cms-write": !0,
			children: [
				/* @__PURE__ */ J(Je, {
					sensors: C,
					collisionDetection: cn,
					onDragStart: (e) => x(p.get(String(e.active.id)) ?? null),
					onDragMove: (e) => {
						let t = p.get(String(e.active.id)), n = e.over ? p.get(String(e.over.id)) : null;
						if (!t || !n || e.over.id === e.active.id) return v && b(null);
						let r = e.activatorEvent.clientY + e.delta.y < e.over.rect.top + e.over.rect.height / 2 ? "before" : "after", i = O(t, n, r) ? {
							id: String(e.over.id),
							side: r
						} : null;
						(i?.id !== v?.id || i?.side !== v?.side) && b(i);
					},
					onDragEnd: (e) => {
						let n = p.get(String(e.active.id)), r = v ? p.get(v.id) : null;
						b(null), x(null);
						let i = n && r && v ? O(n, r, v.side) : null;
						i && t.moveTo(i.ids, i.parentId, i.index);
					},
					onDragCancel: () => {
						b(null), x(null);
					},
					children: [/* @__PURE__ */ q(on.Provider, {
						value: v,
						children: f.map((e, t) => /* @__PURE__ */ q(ln, {
							section: e,
							spaced: t > 0 && (e.container || f[t - 1].container)
						}, e.id))
					}), qe(/* @__PURE__ */ q(Ye, {
						dropAnimation: null,
						children: ee && /* @__PURE__ */ q(vn, { row: ee })
					}), document.body)]
				}),
				!a && /* @__PURE__ */ q(G, {
					compact: !0,
					tabIndex: -1,
					"aria-label": F("Continue Writing"),
					onClick: () => {
						let e = T.stops().at(-1), r = e ? s(t.get().nodes, e.id) : null;
						if (r?.type === "paragraph" && c(r.props.text)) return Ne(t, e, "end");
						let a = t.get().nodes, o = f.at(-1), l = o?.container ? S(o.rows.at(-1)).at(-1).id : a.at(-1)?.id, u = l ? d(a, l, "paragraph", n, i) : {
							parentId: null,
							index: 0
						};
						if (!u) return;
						let p = y();
						t.insert(u.parentId, u.index, [p]), t.focus(p.id, "start");
					},
					className: "block h-28 w-full cursor-text"
				}),
				/* @__PURE__ */ q(se, {}),
				/* @__PURE__ */ q(yn, {}),
				h && !e && /* @__PURE__ */ q(Be, {
					open: !0,
					onOpenChange: (e) => !e && _(null),
					title: F("Block"),
					children: s(u, h) && /* @__PURE__ */ q(ke, {
						node: s(u, h),
						onClose: () => _(null)
					})
				})
			]
		})
	});
}
var cn = (e) => {
	let t = Qe(e);
	if (t.length === 0) return Ze(e);
	let n = (t) => {
		let n = e.droppableRects.get(t);
		return n ? n.width * n.height : Infinity;
	};
	return [...t].sort((e, t) => n(e.id) - n(t.id)).slice(0, 1);
};
function ln({ section: e, spaced: t }) {
	return /* @__PURE__ */ J("section", {
		className: K("group/section relative", t && "mt-10"),
		children: [e.label && /* @__PURE__ */ q("div", {
			className: "pointer-events-none absolute right-[calc(100%+76px)] top-[5px] max-w-40 truncate whitespace-nowrap text-2xs text-faint opacity-0 transition-opacity duration-base group-focus-within/section:opacity-100 group-hover/section:opacity-100 max-xl:hidden",
			children: e.label
		}), e.rows.map((e, t) => /* @__PURE__ */ q(dn, {
			row: e,
			first: t === 0
		}, D(e)))]
	});
}
function un(e, t) {
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
function dn({ row: e, first: t, nested: n }) {
	let { store: i } = r(), { readOnly: a } = k(), o = D(e), s = S(e).map((e) => e.id), c = A(i, (e) => e.blockMode && le(e).some((e) => s.includes(e))), l = Le(on), u = et({ id: o }), d = $e({
		id: o,
		disabled: a
	}), { className: f, line: p } = un(e, t);
	return /* @__PURE__ */ J("div", {
		ref: (e) => {
			u.setNodeRef(e), d.setNodeRef(e);
		},
		"data-row": o,
		"data-nested": n || void 0,
		style: { "--line": `${p}px` },
		className: K(n ? "group/nested" : "group/row", "relative py-[3px]", f, d.isDragging && "opacity-35", e.hidden && "opacity-45"),
		onMouseDown: (e) => {
			let t = e.target;
			t.closest("[data-row]") !== e.currentTarget || t.closest("[contenteditable=\"true\"],textarea,input,button,a,[role=\"button\"]") || (e.shiftKey && i.get().selected ? (e.preventDefault(), i.get().blockMode || i.select(i.get().selected, !0), i.extendTo(s.at(-1))) : (i.select(s[0], !0), s.length > 1 && i.extendTo(s.at(-1))));
		},
		children: [
			l?.id === o && /* @__PURE__ */ q("div", { className: K("pointer-events-none absolute inset-x-0 z-raised h-0.5 rounded-full bg-focus", l.side === "before" ? "-top-px" : "-bottom-px") }),
			!a && /* @__PURE__ */ q(mn, {
				row: e,
				handle: d,
				nested: n
			}),
			/* @__PURE__ */ q("div", {
				className: K("rounded-sm transition-[background-color,box-shadow] duration-fast", c && "bg-focus/10 ring-3 ring-focus/10"),
				children: /* @__PURE__ */ q(fn, { row: e })
			})
		]
	});
}
function fn({ row: e }) {
	let { types: t } = r(), { settings: n } = k();
	if (e.kind === "text") return /* @__PURE__ */ q(ee, { node: e.node });
	if (e.kind === "list") return /* @__PURE__ */ q(oe, { node: e.node });
	if (e.kind === "actions") return /* @__PURE__ */ q(Ht, { nodes: e.nodes });
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
			}), e.rows.length ? e.rows.map((e, t) => /* @__PURE__ */ q(dn, {
				row: e,
				first: t === 0,
				nested: !0
			}, D(e))) : /* @__PURE__ */ q(pn, { column: e.node })]
		});
	}
	if (e.kind === "columns") {
		let t = String(e.node.props.layout ?? "1-1").split("-").map((e) => `minmax(0,${e}fr)`).join(" ");
		return /* @__PURE__ */ q("div", {
			className: "grid gap-8 py-1 max-md:!grid-cols-1",
			style: { gridTemplateColumns: t },
			children: e.columns.map((e) => /* @__PURE__ */ q("div", {
				className: "min-w-0",
				children: e.rows.length ? e.rows.map((e, t) => /* @__PURE__ */ q(dn, {
					row: e,
					first: t === 0,
					nested: !0
				}, D(e))) : /* @__PURE__ */ q(pn, { column: e.node })
			}, e.node.id))
		});
	}
	let i = e.node, a = t.get(i.type), o = rn(i.type);
	if (o) return /* @__PURE__ */ q(o, {
		node: i,
		type: a,
		onSettings: n
	});
	switch (i.type) {
		case "image": return /* @__PURE__ */ q(Kt, { node: i });
		case "video":
		case "embed": return /* @__PURE__ */ q(Q, {
			node: i,
			type: a
		});
		case "code": return /* @__PURE__ */ q(Xt, { node: i });
		case "table": return /* @__PURE__ */ q(Zt, { node: i });
		case "divider": return /* @__PURE__ */ q(Vt, {});
		case "accordion": return /* @__PURE__ */ q(Qt, { node: i });
		case "component": return /* @__PURE__ */ q($t, { node: i });
		default: return /* @__PURE__ */ q(en, {
			node: i,
			type: a
		});
	}
}
function pn({ column: e }) {
	let { store: t, types: n } = r(), { readOnly: i } = k();
	return i || !g(e, "paragraph", n, []) ? null : /* @__PURE__ */ q(G, {
		compact: !0,
		onClick: () => {
			let n = y();
			t.insert(e.id, 0, [n]), t.focus(n.id, "start");
		},
		className: K(x, "block w-full cursor-text py-[3px] text-left text-faint opacity-0 hover:opacity-100"),
		children: F("Write here")
	});
}
function mn({ row: e, handle: t, nested: n }) {
	let { store: a, types: o, allowed: s } = r(), c = k(), [l, u] = z(!1), [f, m] = z(""), h = A(a, (t) => t.blockMode && S(e).some((e) => e.id === t.selected)), g = S(e).at(-1), _ = (e) => {
		let t = p(e, o), n = d(a.get().nodes, g.id, t.map((e) => e.type), o, s);
		u(!1), m(""), n && (a.insert(n.parentId, n.index, t), O(a, t[0], c.stops()));
	};
	return /* @__PURE__ */ J("div", {
		className: K("absolute top-[3px] z-raised flex h-[var(--line)] items-center gap-0.5 opacity-0 transition-opacity duration-fast focus-within:opacity-100", n ? "-left-[22px] group-hover/nested:opacity-100" : "-left-[54px] group-hover/row:opacity-100 group-has-[[data-nested]:hover]/row:!opacity-0", (l || h) && "!opacity-100"),
		children: [!n && /* @__PURE__ */ q(W, {
			open: l,
			onOpenChange: (e) => {
				u(e), e || m("");
			},
			align: "start",
			className: "!p-0",
			trigger: /* @__PURE__ */ q(U, {
				icon: "plus",
				label: F("Add Below"),
				size: "xs",
				className: "!text-faint hover:!text-text"
			}),
			children: /* @__PURE__ */ q(i, {
				types: [...o.values()],
				query: f,
				onQuery: m,
				onChoose: _,
				onClose: () => u(!1),
				allowed: (e) => !!d(a.get().nodes, g.id, e.name, o, s)
			})
		}), /* @__PURE__ */ q(Ve, {
			align: "start",
			trigger: /* @__PURE__ */ q(G, {
				compact: !0,
				ref: t.setActivatorNodeRef,
				...t.attributes,
				...t.listeners,
				"aria-label": F("Drag to move, click for options"),
				className: "grid h-6 w-[18px] cursor-grab place-items-center rounded-xs text-faint hover:bg-hover hover:text-text active:cursor-grabbing",
				children: /* @__PURE__ */ q(H, {
					name: "drag",
					size: 14
				})
			}),
			items: gn(a, e, o, s, c)
		})]
	});
}
var hn = [
	{
		label: () => F("Text"),
		icon: "paragraph",
		type: "paragraph",
		props: {}
	},
	{
		label: () => F("Heading 1"),
		icon: "heading",
		type: "heading",
		props: { level: "1" }
	},
	{
		label: () => F("Heading 2"),
		icon: "heading",
		type: "heading",
		props: { level: "2" }
	},
	{
		label: () => F("Heading 3"),
		icon: "heading",
		type: "heading",
		props: { level: "3" }
	},
	{
		label: () => F("Bulleted List"),
		icon: "list",
		type: "list",
		props: { ordered: !1 }
	},
	{
		label: () => F("Numbered List"),
		icon: "list-ordered",
		type: "list",
		props: { ordered: !0 }
	},
	{
		label: () => F("Quote"),
		icon: "quote",
		type: "quote",
		props: {}
	},
	{
		label: () => F("Callout"),
		icon: "info",
		type: "callout",
		props: { tone: "note" }
	}
];
function gn(e, t, n, r, i) {
	let a = S(t), o = a[0], c = t.kind === "text" || t.kind === "list", l = () => o.type === "list" ? (o.props.items ?? []).join("<br>") : String(o.props.text ?? ""), d = (e) => e.type === o.type && Object.entries(e.props).every(([e, t]) => String(o.props[e] ?? (e !== "ordered" && "")) === String(t)), f = (t) => () => {
		let n = t.type === "list" ? {
			...t.props,
			items: l().split(/<br\s*\/?>/)
		} : {
			...t.props,
			text: l(),
			...t.type === "quote" ? { cite: "" } : {}
		};
		e.updateNode(o.id, {
			type: t.type,
			props: n
		}), e.focus(o.id, "end", t.type === "list" ? "items" : "text", t.type === "list" ? 0 : void 0);
	}, p = a.length === 1, m = t.parent ? s(e.get().nodes, t.parent) : null;
	return [
		...c ? [
			{
				label: F("Turn Into"),
				heading: !0
			},
			...hn.filter((e) => n.has(e.type) && g(m, e.type, n, m ? [] : r)).map((e) => ({
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
			label: F("Settings"),
			icon: "settings",
			onSelect: () => i.settings(o.id)
		},
		{
			label: F("Duplicate"),
			icon: "copy",
			shortcut: "mod+d",
			onSelect: () => _n(e, a.map((e) => e.id))
		},
		{
			separator: !0,
			label: ""
		},
		{
			label: F("Delete"),
			icon: "trash",
			danger: !0,
			shortcut: "⌫",
			onSelect: () => e.commit(a.reduce((e, t) => u(e, t.id), e.get().nodes))
		}
	];
}
function _n(e, t) {
	let n = e.get().nodes, r = t.map((e) => s(n, e)).filter((e) => !!e).map(m), i = l(n, t.at(-1));
	i && r.length !== 0 && (e.insert(i.parentId, i.index + 1, r), e.select(r[0].id, !0), r.length > 1 && e.extendTo(r.at(-1).id));
}
function vn({ row: e }) {
	let t = S(e).map((e) => a(e, 60)).filter(Boolean).join(" · ");
	return /* @__PURE__ */ q("div", {
		className: "cms-pop max-w-[360px] truncate px-3 py-1.5 text-sm text-muted",
		children: t || F("Block")
	});
}
function yn() {
	let { store: e, types: t, allowed: n } = r(), a = k(), o = v(), [c, f] = z(null);
	if (I("components/list", {}, {
		staleTime: 6e4,
		enabled: n.length === 0 || n.includes("component")
	}), I("patterns/list", {}, { staleTime: 6e4 }), L(() => {
		if (!o) return f(null);
		let e = requestAnimationFrame(() => {
			let e = document.querySelector(`[data-row="${o.id}"] [contenteditable]`);
			f(Ee() ?? e?.getBoundingClientRect() ?? null);
		});
		return () => cancelAnimationFrame(e);
	}, [o]), L(() => {
		if (!o) return;
		let e = () => !document.activeElement?.closest(`[data-row="${o.id}"]`) && E(null);
		return document.addEventListener("focusin", e), () => document.removeEventListener("focusin", e);
	}, [o]), be(!!o, [document]), !o || !c) return null;
	let m = (r) => {
		let i = p(r, t), c = e.get().nodes, f = l(c, o.id);
		if (E(null), !f) return;
		let m = f.parentId ? s(c, f.parentId) : null;
		if (i.every((e) => g(m, e.type, t, m ? [] : n))) e.commit(_(u(c, o.id), f.parentId, f.index, i));
		else {
			let r = d(c, o.id, i.map((e) => e.type), t, n);
			if (!r) return;
			e.commit(_(u(c, o.id), r.parentId, r.index, i));
		}
		O(e, i[0], a.stops());
	}, { maxHeight: h, ...y } = xe(c);
	return qe(/* @__PURE__ */ q("div", {
		"data-cms-slash": !0,
		className: "cms-pop fixed z-overlay overflow-hidden !p-0",
		style: y,
		children: /* @__PURE__ */ q(i, {
			types: [...t.values()],
			query: o.query,
			chooseFirst: o.enter,
			components: n.length === 0 || n.includes("component"),
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
			style: { maxHeight: h },
			onChoose: m,
			onClose: () => E(null),
			allowed: (r) => !!d(e.get().nodes, o.id, r.name, t, n)
		})
	}), document.body);
}
function bn(e, t, n, r) {
	L(() => {
		let i = (i) => {
			if (i.defaultPrevented) return;
			let a = t.current?.contains(document.activeElement) || t.current?.contains(i.target), { selected: o, blockMode: c, nodes: l } = e.get(), u = i.metaKey || i.ctrlKey, d = document.activeElement === document.body || !document.activeElement;
			if (u && i.key.toLowerCase() === "z" && (a || c || d)) {
				i.preventDefault();
				let t = a && document.activeElement?.isContentEditable;
				document.activeElement?.blur(), i.shiftKey ? e.redo() : e.undo();
				let r = t && o ? n.stops().find((e) => e.id === o) : null;
				r && Ne(e, r, "end");
				return;
			}
			if (!c || !o || n.readOnly || i.target?.closest?.("input,textarea,[contenteditable=\"true\"],[role=\"dialog\"],[data-cms-settings]")) return;
			let f = [...r.current.values()], p = f.findIndex((e) => S(e).some((e) => e.id === o)), h = f[p], g = (t) => {
				if (!t) return;
				let n = S(t).map((e) => e.id);
				e.select(n[0], !0), n.length > 1 && e.extendTo(n.at(-1)), document.querySelector(`[data-row="${n[0]}"]`)?.scrollIntoView({ block: "nearest" });
			};
			if (i.key === "ArrowDown" || i.key === "ArrowUp") {
				i.preventDefault();
				let t = i.key === "ArrowUp";
				if (i.altKey) return e.nudge(o, t ? -1 : 1);
				if (i.shiftKey) return e.extend(t ? -1 : 1);
				g(f[p + (t ? -1 : 1)]);
			} else if (i.key === "Enter") {
				i.preventDefault();
				let t = n.stops().find((e) => e.id === o), r = h ? S(h)[0] : null;
				t ? Ne(e, t, "end") : r && n.settings(r.id);
			} else if (i.key === "Backspace" || i.key === "Delete") {
				i.preventDefault();
				let t = f[p - 1] ?? f.slice(p + 1).find((t) => !S(t).some((t) => e.selection().includes(t.id)));
				e.removeSelection(), g(t);
			} else if (u && i.key.toLowerCase() === "d") i.preventDefault(), _n(e, e.selection());
			else if (u && (i.key.toLowerCase() === "c" || i.key.toLowerCase() === "x")) {
				let t = e.selection().map((e) => s(l, e)).filter(Boolean);
				if (t.length === 0) return;
				i.preventDefault(), navigator.clipboard.writeText("cms-blocks:" + JSON.stringify(t)), i.key.toLowerCase() === "x" && e.removeSelection();
			} else u && i.key.toLowerCase() === "v" ? (i.preventDefault(), navigator.clipboard.readText().then((t) => {
				if (!t.startsWith("cms-blocks:")) return;
				let n = JSON.parse(t.slice(12)).map(m);
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
It(), P.fields.set("blocks", rt), Pt(), P.fields.set("blocks-icon", Bt), P.panels.set("blocks-editor", {
	slot: "entry.editor",
	label: F("Block Editor"),
	icon: "layout",
	component: Ie(() => import("./chunks/BlocksWorkspace-khVhVEdM.js").then((e) => ({ default: e.BlocksWorkspace }))),
	when: (e) => e.bodyField.type === "blocks"
}), P.widgets.set("blocks-design", Ie(() => import("./chunks/WidgetDesign-DoOAhPs-.js"))), P.components.set("blocks/patterns", Ie(() => import("./chunks/Patterns-D0fgT_wm.js"))), $.set("audio", Q), $.set("file", Q), $.set("gallery", Yt);
export { t as EditorProvider, ue as EditorStore, ke as Inspector, sn as WriteEditor, $ as blockViews, e as useCatalog, A as useEditor, r as useEditorContext };
