import { $ as e, A as t, B as n, C as r, D as i, E as a, F as o, G as s, I as c, J as l, K as u, L as d, M as f, N as p, O as m, P as h, Q as g, R as _, S as v, T as y, U as b, V as x, W as ee, X as S, Y as te, Z as C, _ as w, a as ne, b as re, c as ie, d as ae, f as oe, g as se, h as ce, i as le, it as ue, j as de, k as fe, l as pe, m as T, n as me, o as he, p as E, q as ge, r as _e, rt as D, s as ve, t as ye, tt as be, u as O, v as xe, w as Se, x as k, y as Ce, z as A } from "./chunks/Inspector-C8RWCVRQ.js";
import { _ as j, a as we, c as M, d as Te, f as Ee, h as De, l as Oe, n as ke, o as Ae, r as N, s as je, t as P, u as Me } from "./chunks/insert-C2qFyCIH.js";
import { navigate as Ne, registry as F, t as I, useAbility as L } from "@letterncms/sdk";
import { createContext as Pe, lazy as Fe, useContext as Ie, useEffect as R, useLayoutEffect as Le, useMemo as z, useRef as B, useState as V } from "react";
import { Button as H, Fields as U, Icon as W, IconButton as G, InspectorPanel as Re, Menu as ze, Popover as K, QueryError as Be, Segmented as Ve, Spinner as He, cn as q, fieldControlId as Ue } from "@letterncms/ui";
import { Fragment as We, jsx as J, jsxs as Y } from "react/jsx-runtime";
import { createPortal as Ge } from "react-dom";
import { DndContext as Ke, DragOverlay as qe, PointerSensor as Je, closestCenter as Ye, pointerWithin as Xe, useDraggable as Ze, useDroppable as Qe, useSensor as $e, useSensors as et } from "@dnd-kit/core";
// admin/src/BlocksField.tsx
function tt({ field: t, value: n, onChange: r, context: i, disabled: a }) {
	let { catalog: o, types: s, isLoading: c, error: l, retry: u } = be(), d = te(n, r, !!a), [f, p] = V(null), m = g(d, (e) => e.nodes), h = B(i);
	if (h.current = i, c) return /* @__PURE__ */ J("div", {
		className: "flex h-24 items-center justify-center text-faint",
		children: /* @__PURE__ */ J(He, {})
	});
	if (!o) return /* @__PURE__ */ J(Be, {
		message: l?.message,
		onRetry: u
	});
	let _ = {
		store: d,
		types: s,
		catalog: o,
		entryId: i.entry?.id ?? null,
		fieldHandle: t.handle,
		allowed: t.allowed ?? [],
		getValues: () => h.current.values ?? {},
		title: i.title ?? i.entry?.title ?? "",
		readOnly: !!a
	};
	return /* @__PURE__ */ Y(e, {
		value: _,
		children: [/* @__PURE__ */ J("div", {
			className: "h-[480px] min-w-0 overflow-hidden rounded-sm border border-border",
			children: /* @__PURE__ */ J(Se, {
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
				onInspect: p,
				standalone: !0
			})
		}), /* @__PURE__ */ Y(Re, {
			docked: !1,
			open: !!f,
			onOpenChange: (e) => !e && p(null),
			title: I("Block Settings"),
			children: [/* @__PURE__ */ J("div", {
				className: "flex h-10 shrink-0 items-center justify-end border-b border-border px-2",
				children: /* @__PURE__ */ J(G, {
					icon: "close",
					label: I("Close Panel"),
					size: "xs",
					onClick: () => p(null)
				})
			}), f && M(m, f) && /* @__PURE__ */ J(ye, {
				node: M(m, f),
				onClose: () => p(null)
			})]
		})]
	});
}
// admin/src/builder/content/BindField.tsx
function nt({ field: e, value: t, onChange: n, disabled: i }) {
	let [a, o] = V(!1), [s, c] = V(null), l = t ?? void 0, u = e.paths ?? [], d = [...new Set(u.map((e) => e.group))], f = u.find((e) => e.path === l)?.label;
	return /* @__PURE__ */ Y(E, { children: [/* @__PURE__ */ Y("div", {
		className: "relative flex min-w-0 flex-1 items-center",
		children: [/* @__PURE__ */ J(W, {
			name: "database",
			size: 13,
			className: "pointer-events-none absolute left-2 text-ink"
		}), /* @__PURE__ */ J("input", {
			id: Ue(e),
			value: s ?? l ?? "",
			placeholder: e.placeholder ?? "entry.title",
			disabled: i,
			spellCheck: !1,
			onChange: (e) => c(e.target.value),
			onBlur: () => {
				s !== null && n(s.trim() || null), c(null);
			},
			onKeyDown: (e) => e.key === "Enter" && e.target.blur(),
			title: f,
			"aria-label": e.label,
			className: q(r, "!pl-7 font-mono text-ink placeholder:font-sans")
		})]
	}), /* @__PURE__ */ Y(K, {
		open: a,
		onOpenChange: o,
		align: "end",
		className: "w-64 !p-1",
		trigger: /* @__PURE__ */ J(G, {
			icon: "chevron-down",
			size: "xs",
			label: I("Choose Data")
		}),
		children: [/* @__PURE__ */ J("div", {
			className: "max-h-80 overflow-y-auto",
			children: d.map((e) => /* @__PURE__ */ Y("div", {
				className: "py-1",
				children: [/* @__PURE__ */ J("p", {
					className: "cms-label m-0 px-2 pb-1",
					children: e
				}), u.filter((t) => t.group === e).map((e) => /* @__PURE__ */ Y(H, {
					variant: "ghost",
					"data-active": l === e.path || void 0,
					onClick: () => {
						n(e.path), o(!1);
					},
					className: "w-full !justify-start !gap-2 !rounded-xs !px-2 text-left !text-xs !font-normal",
					children: [
						/* @__PURE__ */ J("span", {
							className: "min-w-0 flex-1 truncate",
							children: e.label
						}),
						/* @__PURE__ */ J("span", {
							className: "max-w-[50%] shrink-0 truncate font-mono text-2xs text-faint",
							children: e.path
						}),
						l === e.path && /* @__PURE__ */ J(W, {
							name: "check",
							size: 11,
							className: "shrink-0"
						})
					]
				}, e.path))]
			}, e))
		}), /* @__PURE__ */ Y("p", {
			className: "m-0 border-t border-border px-2 py-1.5 font-mono text-2xs leading-relaxed text-faint",
			title: I("Filters, and text mixed with data"),
			children: ["|date:M j, Y · |excerpt:120 · |upper · |default:Text · By ", "{entry.author}"]
		})]
	})] });
}
// admin/src/builder/fields/nodes.tsx
function rt({ field: e, ...t }) {
	let { store: n, types: r } = D(), i = g(n, (e) => e.nodes), a = Oe(i).filter(({ node: t }) => t.id !== e.exclude).map(({ node: e, depth: t }) => ({
		value: e.id,
		label: `${"  ".repeat(t)}${e.label || j(e, 28) || r.get(e.type)?.title || e.type}`
	}));
	return /* @__PURE__ */ J(T, {
		...t,
		field: {
			...e,
			type: "select",
			component: void 0,
			size: "sm",
			options: a,
			placeholder: e.placeholder ?? I("Choose an Element")
		}
	});
}
function it({ field: e, value: t, onChange: n, disabled: r, context: i }) {
	let a = t ?? [], o = {
		handle: e.handle,
		type: "select",
		label: e.label,
		exclude: e.exclude
	};
	return /* @__PURE__ */ Y("div", {
		className: "min-w-0 flex-1 space-y-1",
		children: [a.map((t, s) => /* @__PURE__ */ Y("div", {
			className: "flex items-center gap-1",
			children: [/* @__PURE__ */ J(rt, {
				field: {
					...o,
					handle: `${e.handle}-${s}`
				},
				value: t,
				onChange: (e) => n(e ? a.map((t, n) => n === s ? e : t) : a.filter((e, t) => t !== s)),
				disabled: r,
				context: i
			}), /* @__PURE__ */ J(k, { onClick: () => n(a.filter((e, t) => t !== s)) })]
		}, s)), /* @__PURE__ */ Y("button", {
			type: "button",
			onClick: () => n([...a, e.addValue]),
			className: "text-xs text-muted hover:text-text",
			children: ["+ ", e.add ?? I("Element")]
		})]
	});
}
// admin/src/builder/fields/clip.tsx
var at = [
	{
		id: "triangle",
		label: () => I("Triangle"),
		value: "polygon(50% 0%, 100% 100%, 0% 100%)"
	},
	{
		id: "rhombus",
		label: () => I("Rhombus"),
		value: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)"
	},
	{
		id: "pentagon",
		label: () => I("Pentagon"),
		value: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)"
	},
	{
		id: "hexagon",
		label: () => I("Hexagon"),
		value: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)"
	},
	{
		id: "arrow",
		label: () => I("Arrow"),
		value: "polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%)"
	},
	{
		id: "chevron",
		label: () => I("Chevron"),
		value: "polygon(75% 0%, 100% 50%, 75% 100%, 0% 100%, 25% 50%, 0% 0%)"
	},
	{
		id: "star",
		label: () => I("Star"),
		value: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"
	},
	{
		id: "message",
		label: () => I("Message"),
		value: "polygon(0% 0%, 100% 0%, 100% 75%, 75% 75%, 75% 100%, 50% 75%, 0% 75%)"
	},
	{
		id: "slant",
		label: () => I("Slanted Edge"),
		value: "polygon(0 0, 100% 0, 100% 85%, 0 100%)"
	},
	{
		id: "wedge",
		label: () => I("Wedge"),
		value: "polygon(0 0, 100% 0, 100% 100%, 0 85%)"
	}
], ot = (e) => e.replace(/\s+/g, " ").replace(/\b0%/g, "0").trim();
function st(e) {
	if (!e || e === "none") return "none";
	let t = e.match(/^(inset|circle|ellipse|polygon)\(/);
	return t ? t[1] : "custom";
}
var ct = (e, t) => e?.match(RegExp(`^${t}\\((.*)\\)$`))?.[1] ?? "";
function lt(e) {
	let [t, n] = ct(e, "inset").split(/\s+round\s+/), r = ie(t || "0") ?? [
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
function ut(e, t) {
	let [n, r] = ct(e, t).split(/\s+at\s+/), i = O(n || ""), a = O(r || "50% 50%");
	return {
		rx: i[0] ?? "50%",
		ry: i[1] ?? i[0] ?? "50%",
		x: a[0] ?? "50%",
		y: a[1] ?? "50%"
	};
}
function dt({ field: e, value: t, onChange: n, context: r, disabled: i }) {
	let a = t ?? void 0, [o, s] = V(!1), c = o && a ? "custom" : st(a), l = (t, n, r = {}) => ({
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
		n(at[0].value);
	}, d = lt(a), f = (e) => {
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
	}, p = c === "circle" || c === "ellipse" ? ut(a, c) : null, m = (e) => {
		let t = {
			...p,
			...e
		};
		n(c === "circle" ? `circle(${t.rx} at ${t.x} ${t.y})` : `ellipse(${t.rx} ${t.ry} at ${t.x} ${t.y})`);
	}, h = c === "polygon" ? at.find((e) => ot(e.value) === ot(a)) : void 0;
	return /* @__PURE__ */ Y("div", {
		className: "min-w-0 flex-1 space-y-1",
		children: [
			/* @__PURE__ */ J(T, {
				field: {
					handle: `${e.handle}-kind`,
					type: "select",
					size: "sm",
					label: e.label,
					placeholder: I("None"),
					options: [
						{
							value: "inset",
							label: I("Inset")
						},
						{
							value: "circle",
							label: I("Circle")
						},
						{
							value: "ellipse",
							label: I("Ellipse")
						},
						{
							value: "polygon",
							label: I("Shape")
						},
						{
							value: "custom",
							label: I("Custom")
						}
					]
				},
				value: c === "none" ? null : c,
				onChange: (e) => u(e),
				disabled: i,
				context: r
			}),
			c === "inset" && /* @__PURE__ */ Y(We, { children: [/* @__PURE__ */ Y(E, {
				className: "grid grid-cols-2 gap-1",
				children: [
					/* @__PURE__ */ J(T, {
						field: l("top", I("Top"), {
							prefix: "T",
							placeholder: "0",
							units: ["px", "%"]
						}),
						value: d.top,
						onChange: (e) => f({ top: e ?? "0" }),
						context: r
					}),
					/* @__PURE__ */ J(T, {
						field: l("right", I("Right"), {
							prefix: "R",
							placeholder: "0",
							units: ["px", "%"]
						}),
						value: d.right,
						onChange: (e) => f({ right: e ?? "0" }),
						context: r
					}),
					/* @__PURE__ */ J(T, {
						field: l("bottom", I("Bottom"), {
							prefix: "B",
							placeholder: "0",
							units: ["px", "%"]
						}),
						value: d.bottom,
						onChange: (e) => f({ bottom: e ?? "0" }),
						context: r
					}),
					/* @__PURE__ */ J(T, {
						field: l("left", I("Left"), {
							prefix: "L",
							placeholder: "0",
							units: ["px", "%"]
						}),
						value: d.left,
						onChange: (e) => f({ left: e ?? "0" }),
						context: r
					})
				]
			}), /* @__PURE__ */ J(T, {
				field: l("round", I("Corner Radius"), {
					prefix: "◜",
					placeholder: I("Corners"),
					group: "radius"
				}),
				value: d.round || null,
				onChange: (e) => f({ round: e ?? "" }),
				context: r
			})] }),
			p && /* @__PURE__ */ Y(E, {
				className: "grid grid-cols-2 gap-1",
				children: [
					/* @__PURE__ */ J(T, {
						field: l("rx", I(c === "circle" ? "Radius" : "Width Radius"), {
							prefix: c === "circle" ? "R" : "W",
							unit: "%",
							units: ["%", "px"]
						}),
						value: p.rx,
						onChange: (e) => m({ rx: e ?? "50%" }),
						context: r
					}),
					c === "ellipse" ? /* @__PURE__ */ J(T, {
						field: l("ry", I("Height Radius"), {
							prefix: "H",
							unit: "%",
							units: ["%", "px"]
						}),
						value: p.ry,
						onChange: (e) => m({ ry: e ?? "50%" }),
						context: r
					}) : /* @__PURE__ */ J("span", {}),
					/* @__PURE__ */ J(T, {
						field: l("x", I("Center X"), {
							prefix: "X",
							unit: "%",
							units: ["%", "px"]
						}),
						value: p.x,
						onChange: (e) => m({ x: e ?? "50%" }),
						context: r
					}),
					/* @__PURE__ */ J(T, {
						field: l("y", I("Center Y"), {
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
			c === "polygon" && /* @__PURE__ */ J("div", {
				className: "grid grid-cols-5 gap-1",
				children: at.map((e) => /* @__PURE__ */ J("button", {
					type: "button",
					title: e.label(),
					"aria-label": e.label(),
					"aria-pressed": h?.id === e.id,
					onClick: () => n(e.value),
					className: q("grid aspect-square place-items-center rounded-xs border", h?.id === e.id ? "border-focus bg-focus/8" : "border-border hover:bg-hover"),
					children: /* @__PURE__ */ J("span", {
						className: q("size-4", h?.id === e.id ? "bg-focus" : "bg-muted"),
						style: { clipPath: e.value }
					})
				}, e.id))
			}),
			(c === "custom" || c === "polygon" && !h) && /* @__PURE__ */ J(T, {
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
var ft = () => [
	{
		value: "=",
		label: I("is")
	},
	{
		value: "!=",
		label: I("is not")
	},
	{
		value: "contains",
		label: I("contains")
	},
	{
		value: ">",
		label: I("is more than")
	},
	{
		value: "<",
		label: I("is less than")
	},
	{
		value: "not null",
		label: I("is set")
	},
	{
		value: "null",
		label: I("is empty")
	}
];
function pt({ field: e, value: t, onChange: n, disabled: r, context: i }) {
	let a = Array.isArray(t) ? t : [], o = (e) => n(e.length ? e : null), s = (e, t) => o(a.map((n, r) => r === e ? {
		...n,
		...t
	} : n));
	return /* @__PURE__ */ Y("div", {
		className: "min-w-0 flex-1 space-y-1",
		children: [a.map((t, n) => /* @__PURE__ */ Y("div", {
			className: "flex items-center gap-1",
			children: [
				/* @__PURE__ */ J(T, {
					field: {
						handle: `${e.handle}-${n}-field`,
						type: "text",
						size: "sm",
						commit: "blur",
						label: I("Field"),
						placeholder: I("Field"),
						mono: !0,
						className: "!w-[34%] !flex-none"
					},
					value: t.field ?? null,
					onChange: (e) => s(n, { field: String(e ?? "").trim() }),
					disabled: r,
					context: i
				}),
				/* @__PURE__ */ J(T, {
					field: {
						handle: `${e.handle}-${n}-op`,
						type: "select",
						size: "sm",
						required: !0,
						label: I("Comparison"),
						options: ft(),
						className: "!flex-none w-[92px]"
					},
					value: t.op ?? "=",
					onChange: (e) => s(n, { op: String(e ?? "=") }),
					disabled: r,
					context: i
				}),
				!["null", "not null"].includes(t.op ?? "") && /* @__PURE__ */ J(T, {
					field: {
						handle: `${e.handle}-${n}-value`,
						type: "text",
						size: "sm",
						commit: "blur",
						label: I("Value"),
						placeholder: I("Value")
					},
					value: t.value === void 0 || t.value === null ? null : String(t.value),
					onChange: (e) => s(n, { value: e ?? "" }),
					disabled: r,
					context: i
				}),
				/* @__PURE__ */ J(k, {
					label: I("Remove Condition"),
					onClick: () => o(a.filter((e, t) => t !== n))
				})
			]
		}, n)), /* @__PURE__ */ Y("button", {
			type: "button",
			disabled: r,
			onClick: () => o([...a, {
				field: "",
				op: "=",
				value: ""
			}]),
			className: "-ml-2 inline-flex h-7 items-center gap-1.5 rounded-sm px-2 text-xs text-muted hover:bg-hover hover:text-ink",
			children: [/* @__PURE__ */ J(W, {
				name: "plus",
				size: 13
			}), I("Add Condition")]
		})]
	});
}
// admin/src/builder/fields/filters.tsx
var mt = [
	{
		name: "blur",
		label: () => I("Blur"),
		unit: "px",
		initial: "8px",
		step: 1,
		min: 0,
		icon: "shadow"
	},
	{
		name: "brightness",
		label: () => I("Brightness"),
		unit: "%",
		initial: "100%",
		step: 5,
		min: 0,
		icon: "sun"
	},
	{
		name: "contrast",
		label: () => I("Contrast"),
		unit: "%",
		initial: "100%",
		step: 5,
		min: 0,
		icon: "opacity"
	},
	{
		name: "saturate",
		label: () => I("Saturation"),
		unit: "%",
		initial: "100%",
		step: 5,
		min: 0,
		icon: "drop-half"
	},
	{
		name: "grayscale",
		label: () => I("Grayscale"),
		unit: "%",
		initial: "100%",
		step: 5,
		min: 0,
		max: 100,
		icon: "opacity"
	},
	{
		name: "hue-rotate",
		label: () => I("Hue"),
		unit: "deg",
		initial: "90deg",
		step: 1,
		icon: "refresh"
	},
	{
		name: "invert",
		label: () => I("Invert"),
		unit: "%",
		initial: "100%",
		step: 5,
		min: 0,
		max: 100,
		icon: "opacity"
	},
	{
		name: "sepia",
		label: () => I("Sepia"),
		unit: "%",
		initial: "100%",
		step: 5,
		min: 0,
		max: 100,
		icon: "theme"
	}
];
function ht(e) {
	return !e || e === "none" ? [] : O(e).map((e) => {
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
var gt = (e) => e.length ? e.map((e) => mt.some((t) => t.name === e.name) || e.value ? `${e.name}(${e.value})` : e.name).join(" ") : null;
function _t({ field: e, value: t, onChange: n, context: r, disabled: i }) {
	let a = ht(t), o = mt.filter((e) => !a.some((t) => t.name === e.name)), s = (e) => n(gt(e));
	return /* @__PURE__ */ Y("div", {
		className: "min-w-0 flex-1",
		children: [/* @__PURE__ */ Y("div", {
			className: "flex h-7 items-center gap-2",
			children: [
				/* @__PURE__ */ J(v, { field: e }),
				/* @__PURE__ */ J("span", {
					className: "min-w-0 flex-1 truncate text-xs text-faint",
					children: a.length ? "" : I("None")
				}),
				o.length > 0 && /* @__PURE__ */ J(ze, {
					align: "end",
					trigger: /* @__PURE__ */ J("button", {
						type: "button",
						disabled: i,
						className: "grid size-6 shrink-0 place-items-center rounded-sm text-muted hover:bg-hover hover:text-ink",
						"aria-label": I("Add a Filter"),
						title: I("Add a Filter"),
						children: /* @__PURE__ */ J(W, {
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
		}), a.map((t, n) => {
			let o = mt.find((e) => e.name === t.name), c = o ? {
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
			return /* @__PURE__ */ Y("div", {
				className: "flex h-7 items-center gap-2",
				children: [
					/* @__PURE__ */ Y("span", {
						className: "flex w-[88px] shrink-0 items-center gap-1.5 truncate pl-2 text-xs text-muted",
						children: [/* @__PURE__ */ J(W, {
							name: o?.icon ?? "faders",
							size: 13,
							className: "shrink-0 text-faint"
						}), o?.label() ?? t.name]
					}),
					/* @__PURE__ */ J(T, {
						field: c,
						value: o?.unit === "%" && /^[\d.]+$/.test(t.value) ? `${Math.round(parseFloat(t.value) * 1e3) / 10}%` : t.value || null,
						onChange: (e) => s(a.map((t, r) => r === n ? {
							...t,
							value: String(e ?? o?.initial ?? "")
						} : t)),
						disabled: i,
						context: r
					}),
					/* @__PURE__ */ J(k, {
						label: I("Remove Filter"),
						onClick: () => s(a.filter((e, t) => t !== n))
					})
				]
			}, t.name + n);
		})]
	});
}
// admin/src/builder/fields/inlineText.tsx
function vt({ field: e, value: t, onChange: n, disabled: i }) {
	let a = B(null);
	return R(() => {
		a.current && a.current.innerHTML !== (t ?? "") && document.activeElement !== a.current && (a.current.innerHTML = t ?? "");
	}, [t]), /* @__PURE__ */ J("div", {
		ref: a,
		id: Ue(e),
		role: "textbox",
		"aria-label": e.label,
		"aria-multiline": !1,
		contentEditable: !i,
		suppressContentEditableWarning: !0,
		"data-placeholder": e.placeholder ?? "",
		onInput: () => n(a.current?.innerHTML ?? ""),
		onKeyDown: (e) => e.key === "Enter" && e.preventDefault(),
		onPaste: (e) => {
			e.preventDefault(), document.execCommand("insertText", !1, e.clipboardData.getData("text/plain").replace(/\s*\n\s*/g, " "));
		},
		className: q(r, "cursor-text overflow-hidden whitespace-nowrap leading-[26px] outline-none [&_*]:inline empty:before:text-ghost empty:before:content-[attr(data-placeholder)]")
	});
}
// admin/src/builder/fields/shadows.tsx
var yt = /^-?[\d.]+(px|rem|em)?$/;
function bt(e) {
	return !e || e === "none" ? [] : e.startsWith("token:") ? null : pe(e).map((e) => {
		let t = O(e), n = t.includes("inset"), r = t.filter((e) => e !== "inset"), i = r.filter((e) => yt.test(e)), a = r.find((e) => !yt.test(e)) ?? "rgb(0 0 0 / 15%)";
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
function xt(e, t = !1) {
	return e.length ? e.map((e) => t ? `${e.x} ${e.y} ${e.blur} ${e.color}` : `${e.inset ? "inset " : ""}${e.x} ${e.y} ${e.blur} ${e.spread} ${e.color}`).join(", ") : null;
}
var St = {
	inset: !1,
	x: "0px",
	y: "8px",
	blur: "24px",
	spread: "-8px",
	color: "rgb(0 0 0 / 18%)"
}, Ct = {
	inset: !1,
	x: "0px",
	y: "1px",
	blur: "2px",
	spread: "0",
	color: "rgb(0 0 0 / 25%)"
}, wt = (e) => e.replace(/px$/, "");
function Tt({ field: e, value: t, onChange: n, context: r }) {
	let i = e.kind === "text", a = i ? void 0 : e.group ?? "shadow", o = xe(), s = he(), [c, l] = V(null), u = o(t), d = bt(t) ?? [], f = (e) => n(xt(e, i));
	return /* @__PURE__ */ Y("div", {
		className: "min-w-0 flex-1",
		children: [
			/* @__PURE__ */ Y("div", {
				className: "group/value flex h-7 items-center gap-2",
				children: [
					/* @__PURE__ */ J(v, { field: e }),
					/* @__PURE__ */ J("span", {
						className: "min-w-0 flex-1 truncate text-xs text-faint",
						children: !u && !d.length ? typeof e.placeholder == "string" && e.placeholder ? e.placeholder : I("None") : ""
					}),
					a && /* @__PURE__ */ J(se, {
						group: a,
						value: t,
						onPick: n,
						active: !!u,
						className: "size-6"
					}),
					!u && /* @__PURE__ */ J(Ce, {
						label: I(i ? "Add Text Shadow" : "Add Shadow"),
						onClick: () => {
							f([...d, i ? Ct : St]), l(d.length);
						}
					})
				]
			}),
			u && /* @__PURE__ */ Y("div", {
				className: "flex h-7 items-center gap-2 pl-[88px]",
				children: [
					/* @__PURE__ */ J("span", {
						className: "size-4 shrink-0 rounded-[3px] border border-border bg-bg",
						style: { boxShadow: s(String(u.token.value)) }
					}),
					/* @__PURE__ */ J(w, {
						token: u.token,
						className: "text-xs"
					}),
					/* @__PURE__ */ J("span", { className: "flex-1" }),
					/* @__PURE__ */ J(k, {
						label: I("Remove Shadow"),
						onClick: () => n(null)
					})
				]
			}),
			d.map((e, t) => /* @__PURE__ */ Y("div", {
				className: "flex h-7 items-center gap-1 pl-[88px]",
				children: [/* @__PURE__ */ Y(K, {
					open: c === t,
					onOpenChange: (e) => l(e ? t : null),
					align: "end",
					className: "w-64 !p-2",
					trigger: /* @__PURE__ */ Y("button", {
						type: "button",
						className: q("flex h-7 min-w-0 flex-1 items-center gap-1.5 rounded-sm px-1.5 text-left text-xs hover:bg-hover", c === t && "bg-active"),
						children: [
							i ? /* @__PURE__ */ J("span", {
								className: "grid size-4 shrink-0 place-items-center text-[11px] font-semibold text-text",
								style: { textShadow: s(xt([e], !0) ?? "") },
								children: "A"
							}) : /* @__PURE__ */ J("span", {
								className: "size-4 shrink-0 rounded-[3px] border border-border bg-bg",
								style: { boxShadow: s(xt([{
									...e,
									x: X(e.x),
									y: X(e.y),
									blur: X(e.blur),
									spread: X(e.spread)
								}]) ?? "") }
							}),
							/* @__PURE__ */ J("span", {
								className: "min-w-0 flex-1 truncate font-mono tabular-nums text-muted",
								children: [
									e.x,
									e.y,
									e.blur,
									...i ? [] : [e.spread]
								].map(wt).join(" ")
							}),
							e.inset && /* @__PURE__ */ J("span", {
								className: "rounded-[3px] bg-sunken px-1 text-2xs text-muted",
								children: I("Inside")
							})
						]
					}),
					children: [/* @__PURE__ */ J("p", {
						className: "m-0 mb-2 text-xs font-semibold text-ink",
						children: I(i ? "Text Shadow" : "Shadow")
					}), /* @__PURE__ */ J(re, {
						context: r,
						fields: [
							!i && {
								handle: "inset",
								type: "select",
								display: "segmented",
								block: !0,
								size: "sm",
								required: !0,
								label: I("Type"),
								options: [{
									value: "outside",
									label: I("Outside")
								}, {
									value: "inside",
									label: I("Inside")
								}]
							},
							{
								handle: "x",
								type: "text",
								component: "blocks-value",
								label: I("X Offset"),
								prefix: "X",
								placeholder: "0"
							},
							{
								handle: "y",
								type: "text",
								component: "blocks-value",
								label: I("Y Offset"),
								prefix: "Y",
								placeholder: "0"
							},
							{
								handle: "blur",
								type: "text",
								component: "blocks-value",
								label: I("Blur"),
								min: 0,
								prefixIcon: "shadow",
								placeholder: "0"
							},
							!i && {
								handle: "spread",
								type: "text",
								component: "blocks-value",
								label: I("Spread"),
								prefixIcon: "arrows-out-simple",
								placeholder: "0"
							},
							{
								handle: "color",
								type: "color",
								component: "blocks-color",
								label: I("Color")
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
				}), /* @__PURE__ */ J(k, {
					label: I("Remove Shadow"),
					onClick: () => f(d.filter((e, n) => n !== t))
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
var Et = /^(-?\d*\.?\d+)([a-z%]*)$/i;
function Dt(e, t) {
	return t.shiftKey ? [
		0,
		1,
		2,
		3
	] : t.altKey ? [e, (e + 2) % 4] : [e];
}
function Z(e, t) {
	if (t.length === 4) return I(e === "margin" ? "Margin, All Sides" : "Padding, All Sides");
	if (t.length === 2) return t.includes(0) ? I(e === "margin" ? "Margin, Top and Bottom" : "Padding, Top and Bottom") : I(e === "margin" ? "Margin, Left and Right" : "Padding, Left and Right");
	let n = {
		0: I("top"),
		1: I("right"),
		2: I("bottom"),
		3: I("left")
	}[t[0]];
	return I(e === "margin" ? "Margin {side}" : "Padding {side}", { side: n });
}
function Ot({ field: e, value: t, onChange: n, context: r }) {
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
	}), c = (e, t) => /* @__PURE__ */ J(kt, {
		box: e,
		index: t,
		value: o(e)[t],
		status: a[e]?.[t] ?? "none",
		onChange: (t, n) => s(e, t, n),
		context: r
	}, `${e}${t}`);
	return /* @__PURE__ */ J("div", {
		className: "min-w-0 flex-1 select-none",
		children: /* @__PURE__ */ Y("div", {
			className: "relative grid grid-cols-[44px_1fr_44px] grid-rows-[24px_auto_24px] rounded-md bg-active/60",
			children: [
				/* @__PURE__ */ J("span", {
					className: "pointer-events-none absolute left-2 top-1 text-2xs text-faint",
					children: I("Margin")
				}),
				/* @__PURE__ */ J("span", {}),
				c("margin", 0),
				/* @__PURE__ */ J("span", {}),
				c("margin", 3),
				/* @__PURE__ */ Y("div", {
					className: "relative grid grid-cols-[44px_1fr_44px] grid-rows-[24px_20px_24px] rounded-sm bg-bg shadow-[0_0_0_1px_var(--cms-border)]",
					children: [
						/* @__PURE__ */ J("span", {
							className: "pointer-events-none absolute left-2 top-1 text-2xs text-faint",
							children: I("Padding")
						}),
						/* @__PURE__ */ J("span", {}),
						c("padding", 0),
						/* @__PURE__ */ J("span", {}),
						c("padding", 3),
						/* @__PURE__ */ J("span", { className: "my-1 rounded-xs bg-active" }),
						c("padding", 1),
						/* @__PURE__ */ J("span", {}),
						c("padding", 2),
						/* @__PURE__ */ J("span", {})
					]
				}),
				c("margin", 1),
				/* @__PURE__ */ J("span", {}),
				c("margin", 2),
				/* @__PURE__ */ J("span", {})
			]
		})
	});
}
function kt({ box: e, index: t, value: n, status: r, onChange: i, context: a }) {
	let o = xe(), [s, c] = V(!1), [l, u] = V([t]), [d, f] = V(!1), p = o(n), m = n?.match(Et), h = p ? p.token.name : m ? m[2] === "px" || !m[2] ? m[1] : `${m[1]}${m[2]}` : n ?? "0";
	return /* @__PURE__ */ J(K, {
		open: s,
		onOpenChange: c,
		align: "center",
		className: "w-60 !p-2",
		trigger: /* @__PURE__ */ J("button", {
			type: "button",
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
					i(Dt(t, n), `${e === "padding" ? Math.max(0, u) : u}${s}`);
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
			onClick: (e) => u(Dt(t, e)),
			"aria-label": Z(e, [t]),
			title: `${Z(e, [t])}${p ? ` · ${p.token.path}` : ""}\n${I("Drag to change. Alt: opposite side too, Shift: all sides.")}`,
			className: q("mx-auto flex h-full min-w-0 max-w-full items-center justify-center rounded-xs px-1 text-xs tabular-nums outline-none transition-colors focus-visible:ring-2 focus-visible:ring-focus", t % 2 ? "cursor-ew-resize" : "cursor-ns-resize", r === "own" ? "font-medium text-ink" : r === "inherited" ? "text-text" : "text-faint", s || d ? "bg-active" : "hover:bg-hover"),
			children: /* @__PURE__ */ J("span", {
				className: q("truncate", p && "rounded-[3px] px-1 leading-4", p && "bg-active"),
				children: h
			})
		}),
		children: /* @__PURE__ */ J(jt, {
			box: e,
			sides: l,
			value: n,
			onChange: (e) => i(l, e),
			close: () => c(!1),
			context: a
		})
	});
}
var At = [
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
function jt({ box: e, sides: t, value: n, onChange: r, close: i, context: a }) {
	let { byGroup: o } = ue(), s = o.get("space") ?? [], c = B(null);
	R(() => {
		(c.current?.querySelector("input"))?.focus();
	}, []);
	let l = (e) => {
		r(e), i();
	};
	return /* @__PURE__ */ Y("div", {
		ref: c,
		onKeyDown: (e) => {
			e.key === "Enter" && requestAnimationFrame(i);
		},
		children: [
			/* @__PURE__ */ Y("p", {
				className: "m-0 mb-1.5 flex items-center justify-between text-xs font-semibold text-ink",
				children: [Z(e, t), n !== void 0 && /* @__PURE__ */ J("button", {
					type: "button",
					onClick: () => l(null),
					className: "rounded-xs px-1 text-2xs font-normal text-muted hover:bg-hover hover:text-text",
					children: I("Reset")
				})]
			}),
			/* @__PURE__ */ J(T, {
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
			s.length > 0 ? /* @__PURE__ */ Y(We, { children: [/* @__PURE__ */ J("p", {
				className: "cms-label m-0 mb-1 mt-2.5 !text-2xs",
				children: I("Space Tokens")
			}), /* @__PURE__ */ J("div", {
				className: "flex flex-wrap gap-1",
				children: s.map((e) => /* @__PURE__ */ J("button", {
					type: "button",
					title: `${e.path} · ${typeof e.value == "object" && e.value ? Object.values(e.value).join("–") : String(e.value)}`,
					onClick: () => l(`token:${e.path}`),
					className: q("h-6 min-w-7 rounded-xs px-1.5 text-2xs tabular-nums", n === `token:${e.path}` ? "bg-focus text-white" : "bg-sunken text-text hover:bg-hover"),
					children: e.name
				}, e.path))
			})] }) : /* @__PURE__ */ J("div", {
				className: "mt-2 flex flex-wrap gap-1",
				children: At.map((e) => /* @__PURE__ */ J("button", {
					type: "button",
					onClick: () => l(e),
					className: q("h-6 min-w-7 rounded-xs px-1.5 text-2xs tabular-nums", n === e ? "bg-focus text-white" : "bg-sunken text-text hover:bg-hover"),
					children: e.replace("px", "")
				}, e))
			}),
			e === "margin" && /* @__PURE__ */ J("button", {
				type: "button",
				onClick: () => l("auto"),
				className: q("mt-1 h-6 rounded-xs px-1.5 text-2xs", n === "auto" ? "bg-focus text-white" : "bg-sunken text-text hover:bg-hover"),
				children: I("Auto")
			})
		]
	});
}
// admin/src/builder/fields/index.ts
function Mt() {
	let e = {
		"blocks-value": ce,
		"blocks-color": ne,
		"blocks-bind": nt,
		"blocks-node": rt,
		"blocks-nodes": it,
		"blocks-group": ae,
		"blocks-pairs": oe,
		"blocks-more": ve,
		"blocks-shadows": Tt,
		"blocks-gradient": _e,
		"blocks-align": me,
		"blocks-origin": le,
		"blocks-spacing": Ot,
		"blocks-filters": _t,
		"blocks-clip": dt,
		"blocks-conditions": pt,
		"blocks-inline-text": vt
	};
	for (let [t, n] of Object.entries(e)) F.fields.set(t, n);
}
// admin/src/builder/icons.ts
var Q = "<rect x=\"44\" y=\"44\" width=\"168\" height=\"168\" rx=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"14\" stroke-dasharray=\"18 18\" opacity=\".4\"/>", Nt = {
	"b-side-all": "<rect x=\"44\" y=\"44\" width=\"168\" height=\"168\" rx=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"18\"/>",
	"b-side-top": Q + "<path d=\"M44 44h168\" stroke=\"currentColor\" stroke-width=\"22\" stroke-linecap=\"round\"/>",
	"b-side-right": Q + "<path d=\"M212 44v168\" stroke=\"currentColor\" stroke-width=\"22\" stroke-linecap=\"round\"/>",
	"b-side-bottom": Q + "<path d=\"M44 212h168\" stroke=\"currentColor\" stroke-width=\"22\" stroke-linecap=\"round\"/>",
	"b-side-left": Q + "<path d=\"M44 44v168\" stroke=\"currentColor\" stroke-width=\"22\" stroke-linecap=\"round\"/>"
};
function Pt() {
	for (let [e, t] of Object.entries(Nt)) F.icons.get(e) || F.icons.set(e, t);
}
// admin/src/builder/content/IconField.tsx
var Ft = [
	"regular",
	"bold",
	"fill",
	"light"
], It = (e) => ({
	regular: I("Regular"),
	bold: I("Bold"),
	fill: I("Fill"),
	light: I("Light")
})[e], Lt = (e) => {
	let t = e.match(/^(.*)-(bold|fill|light)$/);
	return t ? {
		base: t[1],
		weight: t[2]
	} : {
		base: e,
		weight: "regular"
	};
};
function Rt({ field: e, value: t, onChange: n, disabled: r }) {
	let [i, a] = V(!1), [o, s] = V(""), [c, l] = V(""), u = (t ?? "").replace(/^ph:/, ""), { base: d, weight: f } = Lt(u), p = L("blocks/icons", {
		query: d,
		limit: 1
	}, {
		enabled: !!d,
		staleTime: Infinity
	}), m = L("blocks/icons", {
		query: c,
		limit: 160
	}, {
		enabled: i,
		staleTime: Infinity
	}), h = p.data?.find((e) => e.name === d) ?? p.data?.[0];
	R(() => {
		let e = window.setTimeout(() => l(o.trim()), 140);
		return () => window.clearTimeout(e);
	}, [o]);
	let g = (e, t = f) => n(t === "regular" ? e : `${e}-${t}`);
	return /* @__PURE__ */ Y("div", {
		className: "group/icon relative min-w-0 flex-1",
		children: [/* @__PURE__ */ Y(K, {
			open: i,
			onOpenChange: (e) => !r && a(e),
			className: "w-[284px] !p-0",
			trigger: /* @__PURE__ */ Y("button", {
				type: "button",
				id: Ue(e),
				disabled: r,
				"aria-label": e.label,
				className: q("cms-input flex h-7 w-full min-w-0 items-center gap-2 rounded-sm px-2 text-left text-sm disabled:opacity-50", u && "pr-6"),
				children: [
					u && h ? /* @__PURE__ */ J("span", {
						className: "grid size-3.5 shrink-0 place-items-center text-text [&_svg]:size-3.5",
						dangerouslySetInnerHTML: { __html: h.svg }
					}) : /* @__PURE__ */ J(W, {
						name: "star",
						size: 14,
						className: "shrink-0 text-faint"
					}),
					/* @__PURE__ */ J("span", {
						className: q("min-w-0 flex-1 truncate", !u && "text-ghost"),
						children: u ? d : e.placeholder || I("Choose an Icon")
					}),
					u && f !== "regular" && /* @__PURE__ */ J("span", {
						className: "shrink-0 text-faint",
						children: It(f)
					})
				]
			}),
			children: [
				/* @__PURE__ */ Y("div", {
					className: "flex h-10 items-center gap-2 border-b border-border px-3",
					children: [
						/* @__PURE__ */ J(W, {
							name: "search",
							size: 14,
							className: "shrink-0 text-faint"
						}),
						/* @__PURE__ */ J("input", {
							autoFocus: !0,
							value: o,
							onChange: (e) => s(e.target.value),
							placeholder: I("Search Icons"),
							"aria-label": I("Search Icons"),
							spellCheck: !1,
							className: "h-full min-w-0 flex-1 bg-transparent text-sm text-text outline-none placeholder:text-faint"
						}),
						m.isFetching && /* @__PURE__ */ J(He, { size: 12 })
					]
				}),
				/* @__PURE__ */ J("div", {
					className: "border-b border-border p-1.5",
					children: /* @__PURE__ */ J(Ve, {
						size: "xs",
						block: !0,
						value: f,
						onChange: (e) => u ? g(d, e) : void 0,
						options: Ft.map((e) => ({
							value: e,
							label: It(e)
						}))
					})
				}),
				/* @__PURE__ */ Y("div", {
					className: "grid max-h-64 grid-cols-8 gap-0.5 overflow-y-auto p-1.5",
					role: "listbox",
					"aria-label": I("Icons"),
					children: [(m.data ?? []).map((e) => /* @__PURE__ */ J("button", {
						type: "button",
						role: "option",
						"aria-selected": e.name === d,
						title: e.name,
						onClick: () => {
							g(e.name), a(!1);
						},
						className: q("grid aspect-square place-items-center rounded-xs text-text hover:bg-hover [&_svg]:size-4", e.name === d && "bg-focus-soft text-focus"),
						dangerouslySetInnerHTML: { __html: e.svg }
					}, e.name)), !m.isFetching && m.data?.length === 0 && /* @__PURE__ */ J("p", {
						className: "col-span-8 m-0 py-6 text-center text-xs text-faint",
						children: I("No matches")
					})]
				})
			]
		}), u && !r && /* @__PURE__ */ J("button", {
			type: "button",
			onClick: () => n(null),
			"aria-label": I("Remove Icon"),
			className: "absolute right-1 top-1/2 grid size-5 -translate-y-1/2 place-items-center rounded-xs text-faint opacity-0 hover:bg-hover hover:text-text focus-visible:opacity-100 group-hover/icon:opacity-100",
			children: /* @__PURE__ */ J(W, {
				name: "close",
				size: 12
			})
		})]
	});
}
// admin/src/write/Blocks.tsx
function zt() {
	return /* @__PURE__ */ J("hr", { className: "my-3 border-0 border-t border-border-strong" });
}
function Bt({ nodes: e }) {
	let { store: t, types: n, allowed: r } = D(), { readOnly: i } = x(), a = e[e.length - 1];
	return /* @__PURE__ */ Y("div", {
		className: "group/actions flex flex-wrap items-center gap-x-3 gap-y-2 py-1",
		children: [e.map((e) => /* @__PURE__ */ J(Ht, { node: e }, e.id)), !i && a.type === "button" && n.has("button") && /* @__PURE__ */ J(G, {
			icon: "plus",
			label: I("Add a Button"),
			size: "xs",
			className: "opacity-0 transition-opacity group-hover/actions:opacity-100 focus-visible:opacity-100",
			onClick: () => {
				let e = t.get().nodes, i = N(e, a.id, "button", n, r), o = n.get("button");
				if (!i || !o) return;
				let s = je(o, {
					label: "",
					variant: a.type === "button" && (a.props.variant ?? "primary") === "primary" ? "secondary" : a.props.variant ?? "primary"
				}, n);
				t.insert(i.parentId, i.index, [s]), t.focus(s.id, "end", "label");
			}
		})]
	});
}
var Vt = {
	primary: "h-9 rounded-md bg-ink px-4 text-ink-contrast",
	secondary: "h-9 rounded-md border border-border-strong bg-bg px-4 text-text",
	ghost: "h-9 rounded-md px-3 text-text bg-sunken/60",
	link: "h-9 text-text underline decoration-border-strong underline-offset-4"
};
function Ht({ node: e }) {
	let { store: t } = D(), { readOnly: n } = x(), [r, i] = V(!1), a = g(t, (t) => t.focus?.id === e.id && t.focus.prop === "label" ? t.focus : null), o = e.type === "link", c = String(e.props.url ?? ""), l = o ? Vt.link : Vt[e.props.variant ?? "primary"] ?? Vt.primary, d = ge(), f = [
		s({
			handle: "url",
			label: I("Link"),
			placeholder: I("Paste a link or search pages"),
			autofocus: !c,
			anchors: d
		}),
		...o ? [] : [{
			handle: "variant",
			type: "select",
			label: I("Style"),
			display: "segmented",
			block: !0,
			options: [
				{
					value: "primary",
					label: I("Primary")
				},
				{
					value: "secondary",
					label: I("Secondary")
				},
				{
					value: "ghost",
					label: I("Ghost")
				},
				{
					value: "link",
					label: I("Text")
				}
			]
		}],
		{
			handle: "new_tab",
			type: "toggle",
			label: I("Open in New Tab")
		}
	];
	return /* @__PURE__ */ Y("span", {
		className: "group/action relative inline-flex",
		children: [
			/* @__PURE__ */ J("span", {
				className: q("inline-flex items-center text-sm font-medium", l),
				children: /* @__PURE__ */ J(u, {
					html: String(e.props.label ?? ""),
					singleLine: !0,
					quiet: !0,
					disabled: n,
					placeholder: I(o ? "Link Text" : "Button Text"),
					className: "min-w-8 whitespace-nowrap",
					focus: a,
					onChange: (n) => t.updateProps(e.id, { label: n }),
					onFocus: () => t.get().selected !== e.id && t.select(e.id),
					onKeyDown: (n, r) => {
						(n.key === "Enter" || n.key === "Escape") && (n.preventDefault(), r.blur(), n.key === "Escape" && t.select(e.id, !0));
					}
				})
			}),
			!c && /* @__PURE__ */ J("span", {
				className: "pointer-events-none absolute -right-0.5 -top-0.5 size-2 rounded-full bg-warning ring-2 ring-bg",
				title: I("No link yet")
			}),
			!n && /* @__PURE__ */ J(K, {
				open: r,
				onOpenChange: i,
				align: "start",
				className: "w-80 !p-3",
				trigger: /* @__PURE__ */ J("button", {
					type: "button",
					"aria-label": I("Edit Link"),
					title: c || I("Add a Link"),
					className: q("absolute -right-2.5 -top-2.5 grid size-6 place-items-center rounded-full border border-border bg-bg text-muted shadow-pop transition-opacity hover:text-text", r ? "opacity-100" : "opacity-0 group-hover/action:opacity-100 focus-visible:opacity-100"),
					children: /* @__PURE__ */ J(W, {
						name: "link",
						size: 12
					})
				}),
				children: /* @__PURE__ */ Y("div", {
					className: "space-y-3",
					onKeyDown: (e) => e.key === "Enter" && !e.defaultPrevented && e.target.tagName === "INPUT" && i(!1),
					children: [/* @__PURE__ */ J(U, {
						fields: f,
						values: e.props,
						onChange: (n, r) => (n !== "variant" || r) && t.updateProps(e.id, { [n]: r ?? (n === "url" ? "" : r) }, `${n}:${e.id}`),
						className: "!gap-y-3"
					}), /* @__PURE__ */ J("div", {
						className: "flex justify-end border-t border-border pt-2.5",
						children: /* @__PURE__ */ J(H, {
							size: "xs",
							variant: "ghost",
							icon: "trash",
							onClick: () => {
								i(!1), t.remove(e.id);
							},
							children: I(o ? "Remove Link" : "Remove Button")
						})
					})]
				})
			})
		]
	});
}
function Ut(e) {
	let t = Array.isArray(e) ? e[0] : e, n = typeof t == "string" && /^(https?:|\/)/.test(t), r = L("media/get-many", { ids: [t] }, {
		enabled: typeof t == "string" && !n && t.length > 0,
		staleTime: 3e5,
		retry: !1
	});
	if (n) return t;
	let i = r.data?.items?.[0];
	return i ? i.url ?? i.thumb : null;
}
function Wt({ node: e }) {
	let { store: t } = D(), { settings: n, readOnly: r } = x(), i = Ut(e.props.image);
	return /* @__PURE__ */ Y("figure", {
		className: "cms-block-figure m-0 py-1",
		children: [i ? /* @__PURE__ */ Y("div", {
			className: "group/image relative",
			children: [
				/* @__PURE__ */ J("img", {
					src: i,
					alt: e.props.alt ?? "",
					className: "block max-h-[520px] w-full rounded-md bg-sunken object-cover",
					style: e.props.aspect && e.props.aspect !== "auto" ? { aspectRatio: e.props.aspect } : void 0
				}),
				!r && /* @__PURE__ */ J("div", {
					className: "absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover/image:opacity-100",
					children: /* @__PURE__ */ J(H, {
						size: "xs",
						variant: "secondary",
						icon: "settings",
						onClick: () => n(e.id),
						children: I("Edit")
					})
				}),
				!e.props.alt && !r && /* @__PURE__ */ J("span", {
					className: "absolute bottom-2 left-2 rounded-xs bg-bg/90 px-1.5 py-0.5 text-2xs text-muted opacity-0 shadow-pop transition-opacity group-hover/image:opacity-100",
					children: I("No alt text")
				})
			]
		}) : /* @__PURE__ */ Y("div", {
			className: "flex h-36 flex-col items-center justify-center gap-3 rounded-md bg-surface text-faint",
			children: [/* @__PURE__ */ J(W, {
				name: "image",
				size: 22
			}), /* @__PURE__ */ J(U, {
				bare: !0,
				disabled: r,
				fields: [{
					handle: "image",
					type: "media",
					label: I("Image"),
					max: 1,
					accept: "image/*"
				}],
				values: { image: e.props.image },
				onChange: (n, r) => t.updateProps(e.id, { image: r })
			})]
		}), /* @__PURE__ */ J(Gt, { node: e })]
	});
}
function Gt({ node: e }) {
	let { store: t } = D(), { readOnly: n } = x(), r = g(t, (t) => t.focus?.id === e.id && t.focus.prop === "caption" ? t.focus : null);
	return n && !e.props.caption ? null : /* @__PURE__ */ J("figcaption", { children: /* @__PURE__ */ J(u, {
		html: String(e.props.caption ?? ""),
		quiet: !0,
		disabled: n,
		placeholder: I("Add a Caption"),
		focus: r,
		className: "mt-2 text-sm text-muted",
		onChange: (n) => t.updateProps(e.id, { caption: n }),
		onFocus: () => t.select(e.id)
	}) });
}
function Kt({ node: e, type: t }) {
	let { settings: n } = x(), r = String(e.props.url ?? ""), i = r ? r.replace(/^https?:\/\/(www\.)?/, "").split(/[/?#]/)[0] : "";
	return /* @__PURE__ */ Y("figure", {
		className: "cms-block-figure m-0 py-1",
		children: [/* @__PURE__ */ Y("button", {
			type: "button",
			onClick: () => n(e.id),
			className: "flex h-14 w-full items-center gap-3 rounded-md bg-surface px-4 text-left hover:bg-hover",
			children: [/* @__PURE__ */ J(W, {
				name: t?.icon ?? "embed",
				size: 18,
				className: "text-muted"
			}), /* @__PURE__ */ Y("span", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ J("span", {
					className: "block truncate text-sm text-text",
					children: e.props.title || i || (e.type === "video" ? I("Add a video link") : I("Add a link to embed"))
				}), i && e.props.title && /* @__PURE__ */ J("span", {
					className: "block truncate text-xs text-faint",
					children: i
				})]
			})]
		}), t?.inline?.includes("caption") && /* @__PURE__ */ J(Gt, { node: e })]
	});
}
function qt({ node: e }) {
	let { store: t } = D(), { settings: n, readOnly: r } = x();
	return /* @__PURE__ */ Y("div", {
		className: "group/code relative py-1",
		onFocus: () => t.select(e.id),
		children: [/* @__PURE__ */ J(U, {
			bare: !0,
			disabled: r,
			fields: [{
				handle: "code",
				type: "code",
				label: I("Code"),
				placeholder: I("Code"),
				rows: 3
			}],
			values: { code: e.props.code ?? "" },
			onChange: (n, r) => t.updateProps(e.id, { code: r ?? "" }, `code:${e.id}`)
		}), /* @__PURE__ */ J("button", {
			type: "button",
			onClick: () => n(e.id),
			className: "absolute right-2 top-2.5 rounded-xs px-1.5 font-mono text-2xs text-faint hover:bg-hover hover:text-text",
			children: e.props.language && e.props.language !== "plain" ? e.props.language : I("Plain Text")
		})]
	});
}
function Jt({ node: e }) {
	let { store: t } = D(), { readOnly: n } = x(), r = Array.isArray(e.props.rows) && e.props.rows.length ? e.props.rows : [["", ""], ["", ""]], i = Math.max(...r.map((e) => e.length)), a = (n, a, o) => t.updateProps(e.id, { rows: r.map((e, t) => t === n ? Array.from({ length: i }, (t, n) => n === a ? o : e[n] ?? "") : e) }, `table:${e.id}`), o = (n) => t.updateProps(e.id, { rows: n });
	return /* @__PURE__ */ Y("div", {
		className: "group/table py-1",
		children: [/* @__PURE__ */ J("div", {
			className: "overflow-x-auto rounded-md border border-border",
			children: /* @__PURE__ */ J("table", {
				className: "w-full border-collapse text-sm",
				children: /* @__PURE__ */ J("tbody", { children: r.map((r, o) => /* @__PURE__ */ J("tr", {
					className: q("border-b border-border last:border-b-0", o === 0 && e.props.header !== !1 && "bg-surface font-medium"),
					children: Array.from({ length: i }, (i, s) => /* @__PURE__ */ J("td", {
						className: "min-w-24 border-r border-border px-3 py-2 align-top last:border-r-0",
						children: /* @__PURE__ */ J(u, {
							html: r[s] ?? "",
							singleLine: !0,
							disabled: n,
							onChange: (e) => a(o, s, e),
							onFocus: () => t.select(e.id)
						})
					}, s))
				}, o)) })
			})
		}), !n && /* @__PURE__ */ Y("div", {
			className: "mt-1 flex gap-1 opacity-0 transition-opacity group-hover/table:opacity-100 group-focus-within/table:opacity-100",
			children: [
				/* @__PURE__ */ J(H, {
					size: "xs",
					variant: "ghost",
					icon: "plus",
					onClick: () => o([...r, Array(i).fill("")]),
					children: I("Row")
				}),
				/* @__PURE__ */ J(H, {
					size: "xs",
					variant: "ghost",
					icon: "plus",
					onClick: () => o(r.map((e) => [...e, ""])),
					children: I("Column")
				}),
				r.length > 1 && /* @__PURE__ */ J(H, {
					size: "xs",
					variant: "ghost",
					icon: "minus",
					onClick: () => o(r.slice(0, -1)),
					children: I("Row")
				}),
				i > 1 && /* @__PURE__ */ J(H, {
					size: "xs",
					variant: "ghost",
					icon: "minus",
					onClick: () => o(r.map((e) => e.slice(0, i - 1))),
					children: I("Column")
				})
			]
		})]
	});
}
function Yt({ node: e }) {
	let { store: t } = D(), { readOnly: n } = x(), r = Array.isArray(e.props.items) ? e.props.items : [], i = (n, i) => t.updateProps(e.id, { items: r.map((e, t) => t === n ? {
		...e,
		...i
	} : e) }, `faq:${e.id}:${n}`), a = r.length ? r : [{
		question: "",
		answer: ""
	}];
	return /* @__PURE__ */ Y("div", {
		className: "group/faq py-1",
		children: [/* @__PURE__ */ J("div", {
			className: "divide-y divide-border border-y border-border",
			children: a.map((a, o) => /* @__PURE__ */ Y("div", {
				className: "py-3",
				children: [/* @__PURE__ */ Y("div", {
					className: "flex items-start gap-2",
					children: [
						/* @__PURE__ */ J(W, {
							name: "chevron-down",
							size: 14,
							className: "mt-1 shrink-0 text-faint"
						}),
						/* @__PURE__ */ J(u, {
							html: Qt(a.question ?? ""),
							singleLine: !0,
							disabled: n,
							placeholder: I("Question"),
							className: "min-w-0 flex-1 text-[15px] font-medium leading-6",
							onChange: (e) => i(o, { question: $t(e) }),
							onFocus: () => t.select(e.id)
						}),
						!n && r.length > 1 && /* @__PURE__ */ J(G, {
							icon: "close",
							label: I("Remove Question"),
							size: "xs",
							className: "opacity-0 group-hover/faq:opacity-100",
							onClick: () => t.updateProps(e.id, { items: r.filter((e, t) => t !== o) })
						})
					]
				}), /* @__PURE__ */ J(u, {
					html: a.answer ?? "",
					quiet: !0,
					disabled: n,
					placeholder: I("Answer"),
					className: "mt-1 pl-[22px] text-base leading-6 text-muted",
					onChange: (e) => i(o, { answer: e }),
					onFocus: () => t.select(e.id)
				})]
			}, o))
		}), !n && /* @__PURE__ */ J(H, {
			size: "xs",
			variant: "ghost",
			icon: "plus",
			className: "mt-1 opacity-0 transition-opacity group-hover/faq:opacity-100",
			onClick: () => t.updateProps(e.id, { items: [...r, {
				question: "",
				answer: ""
			}] }),
			children: I("Question")
		})]
	});
}
function Xt({ node: e }) {
	let { store: t } = D(), { readOnly: n } = x(), r = L("components/list", { working: !0 }, { staleTime: 3e4 }), i = r.data?.find((t) => t.handle === e.props.ref), a = e.props.values ?? {}, o = e.bind ?? {}, c = (i?.props ?? []).filter((e) => e.type !== "json"), l = (n, r) => t.updateProps(e.id, { values: {
		...a,
		[n]: r
	} }, `values:${e.id}:${n}`), d = /* @__PURE__ */ Y("div", {
		className: "flex h-8 items-center gap-2 text-xs",
		children: [
			/* @__PURE__ */ J(W, {
				name: "symbol",
				size: 13,
				className: "text-faint"
			}),
			/* @__PURE__ */ J("span", {
				className: "truncate font-medium text-muted",
				children: i?.title ?? (r.isLoading ? "…" : I("Missing component"))
			}),
			/* @__PURE__ */ J("span", { className: "flex-1" }),
			i?.id && /* @__PURE__ */ J("button", {
				type: "button",
				onClick: () => Ne(`/content/components/${i.id}`),
				className: "rounded-xs px-1.5 text-faint opacity-0 transition-opacity hover:bg-hover hover:text-text group-hover/component:opacity-100",
				children: I("Edit Component")
			})
		]
	});
	return c.length === 0 ? /* @__PURE__ */ Y("div", {
		className: "flex h-9 items-center gap-2 rounded-md px-1 text-sm text-faint",
		children: [
			/* @__PURE__ */ J(W, {
				name: "symbol",
				size: 14
			}),
			/* @__PURE__ */ J("span", {
				className: "truncate text-muted",
				children: i?.title ?? (r.isLoading ? "…" : I("Missing component"))
			}),
			i?.id && /* @__PURE__ */ J("button", {
				type: "button",
				onClick: () => Ne(`/content/components/${i.id}`),
				className: "shrink-0 rounded-xs px-1 text-xs text-faint hover:bg-hover hover:text-text",
				children: I("Edit Component")
			})
		]
	}) : /* @__PURE__ */ Y("div", {
		className: "group/component rounded-md border border-border px-3 pb-1",
		children: [d, c.length > 0 && /* @__PURE__ */ J("div", {
			className: "space-y-2.5 border-t border-border py-2.5",
			children: c.map((r) => {
				let i = a[r.handle] ?? r.default, c = o[`values.${r.handle}`];
				return /* @__PURE__ */ Y("div", {
					className: "grid grid-cols-[120px_minmax(0,1fr)] items-start gap-3",
					children: [/* @__PURE__ */ J("span", {
						className: "truncate pt-[3px] text-xs text-faint",
						title: r.instructions,
						children: r.label
					}), c ? /* @__PURE__ */ J("span", {
						className: "pt-[3px] font-mono text-xs text-faint",
						children: c
					}) : [
						"text",
						"textarea",
						"richtext"
					].includes(r.type) ? /* @__PURE__ */ J(u, {
						html: r.type === "richtext" ? String(i ?? "") : Qt(String(i ?? "")),
						singleLine: r.type === "text",
						disabled: n,
						placeholder: r.placeholder ?? I("Empty"),
						className: "text-base leading-6",
						onChange: (e) => l(r.handle, r.type === "richtext" ? e : $t(e)),
						onFocus: () => t.select(e.id)
					}) : /* @__PURE__ */ J(U, {
						bare: !0,
						disabled: n,
						fields: [r.type === "url" ? s({
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
function Zt({ node: e, type: t }) {
	let { settings: n } = x(), r = j(e, 80);
	return /* @__PURE__ */ Y("button", {
		type: "button",
		onClick: () => n(e.id),
		className: "my-1 flex w-full items-center gap-3 rounded-md bg-surface px-3 py-2.5 text-left hover:bg-hover",
		children: [/* @__PURE__ */ J(W, {
			name: t?.icon ?? "square",
			size: 16,
			className: "shrink-0 text-muted"
		}), /* @__PURE__ */ Y("span", {
			className: "min-w-0 flex-1",
			children: [/* @__PURE__ */ J("span", {
				className: "block text-sm text-text",
				children: t?.title ?? e.type
			}), (r || !t) && /* @__PURE__ */ J("span", {
				className: "block truncate text-xs text-faint",
				children: t ? r : I("Its plugin is off — the content is kept")
			})]
		})]
	});
}
function Qt(e) {
	return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
}
function $t(e) {
	let t = document.createElement("div");
	return t.innerHTML = e.replace(/<br\s*\/?>/g, "\n"), t.textContent ?? "";
}
// admin/src/write/WriteEditor.tsx
var $ = /* @__PURE__ */ new Map(), en = (e) => $.get(e) ?? $.get(e.split("/")[0] + "/*"), tn = (e) => !!en(e), nn = Pe(null);
function rn({ onInspect: e } = {}) {
	let { store: t, types: r, allowed: i, readOnly: a = !1 } = D(), s = g(t, (e) => e.nodes), l = z(() => p(s, r, tn), [s, r]), u = z(() => new Map(f(l).map((e) => [h(e), e])), [l]), m = B(null), [_, v] = V(null), [y, b] = V(null), [x, S] = V(null), te = et($e(Je, { activationConstraint: { distance: 5 } })), C = B(null), w = z(() => ({
		stops: () => {
			let e = t.get().nodes;
			return C.current?.nodes !== e && (C.current = {
				nodes: e,
				stops: c(p(e, r, tn))
			}), C.current.stops;
		},
		settings: (n) => {
			t.select(n, !0), e ? e(n) : v(n);
		},
		readOnly: a
	}), [
		t,
		r,
		a,
		e
	]);
	Le(() => {
		s.length === 0 && !a && P(null, "paragraph", r, i) && t.reset([n()]);
	}, [
		s,
		a,
		t,
		r,
		i
	]);
	let ne = B(u);
	ne.current = u, _n(t, m, w, ne);
	let re = (e, n, a) => {
		let s = t.get().nodes, c = a === "before" ? o(n)[0] : o(n).at(-1), l = o(e);
		if (l.some((e) => e.id === c.id || we(s, c.id).some((t) => t.id === e.id))) return null;
		let u = Ee(s, c.id);
		if (!u) return null;
		let d = u.parentId ? M(s, u.parentId) : null;
		return l.every((e) => P(d, e.type, r, d ? [] : i)) ? {
			ids: l.map((e) => e.id),
			parentId: u.parentId,
			index: a === "before" ? u.index : u.index + 1
		} : null;
	};
	return /* @__PURE__ */ J(d.Provider, {
		value: w,
		children: /* @__PURE__ */ Y("div", {
			ref: m,
			className: "relative",
			"data-cms-write": !0,
			children: [
				/* @__PURE__ */ Y(Ke, {
					sensors: te,
					collisionDetection: an,
					onDragStart: (e) => S(u.get(String(e.active.id)) ?? null),
					onDragMove: (e) => {
						let t = u.get(String(e.active.id)), n = e.over ? u.get(String(e.over.id)) : null;
						if (!t || !n || e.over.id === e.active.id) return y && b(null);
						let r = e.activatorEvent.clientY + e.delta.y < e.over.rect.top + e.over.rect.height / 2 ? "before" : "after", i = re(t, n, r) ? {
							id: String(e.over.id),
							side: r
						} : null;
						(i?.id !== y?.id || i?.side !== y?.side) && b(i);
					},
					onDragEnd: (e) => {
						let n = u.get(String(e.active.id)), r = y ? u.get(y.id) : null;
						b(null), S(null);
						let i = n && r && y ? re(n, r, y.side) : null;
						i && t.moveTo(i.ids, i.parentId, i.index);
					},
					onDragCancel: () => {
						b(null), S(null);
					},
					children: [/* @__PURE__ */ J(nn.Provider, {
						value: y,
						children: l.map((e, t) => /* @__PURE__ */ J(on, {
							section: e,
							spaced: t > 0 && (e.container || l[t - 1].container)
						}, e.id))
					}), Ge(/* @__PURE__ */ J(qe, {
						dropAnimation: null,
						children: x && /* @__PURE__ */ J(hn, { row: x })
					}), document.body)]
				}),
				!a && /* @__PURE__ */ J("button", {
					type: "button",
					tabIndex: -1,
					"aria-label": I("Continue Writing"),
					onClick: () => {
						let e = w.stops().at(-1), a = e ? M(t.get().nodes, e.id) : null;
						if (a?.type === "paragraph" && Te(a.props.text)) return A(t, e, "end");
						let s = t.get().nodes, c = l.at(-1), u = c?.container ? o(c.rows.at(-1)).at(-1).id : s.at(-1)?.id, d = u ? N(s, u, "paragraph", r, i) : {
							parentId: null,
							index: 0
						};
						if (!d) return;
						let f = n();
						t.insert(d.parentId, d.index, [f]), t.focus(f.id, "start");
					},
					className: "block h-28 w-full cursor-text"
				}),
				/* @__PURE__ */ J(ee, {}),
				/* @__PURE__ */ J(gn, {}),
				_ && !e && /* @__PURE__ */ J(Re, {
					open: !0,
					onOpenChange: (e) => !e && v(null),
					title: I("Block"),
					children: M(s, _) && /* @__PURE__ */ J(ye, {
						node: M(s, _),
						onClose: () => v(null)
					})
				})
			]
		})
	});
}
var an = (e) => {
	let t = Xe(e);
	if (t.length === 0) return Ye(e);
	let n = (t) => {
		let n = e.droppableRects.get(t);
		return n ? n.width * n.height : Infinity;
	};
	return [...t].sort((e, t) => n(e.id) - n(t.id)).slice(0, 1);
};
function on({ section: e, spaced: t }) {
	return /* @__PURE__ */ Y("section", {
		className: q("group/section relative", t && "mt-10"),
		children: [e.label && /* @__PURE__ */ J("div", {
			className: "pointer-events-none absolute right-[calc(100%+76px)] top-[5px] max-w-40 truncate whitespace-nowrap text-2xs text-faint opacity-0 transition-opacity duration-150 group-focus-within/section:opacity-100 group-hover/section:opacity-100 max-xl:hidden",
			children: e.label
		}), e.rows.map((e, t) => /* @__PURE__ */ J(cn, {
			row: e,
			first: t === 0
		}, h(e)))]
	});
}
function sn(e, t) {
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
function cn({ row: e, first: t, nested: n }) {
	let { store: r } = D(), { readOnly: i } = x(), a = h(e), s = o(e).map((e) => e.id), c = g(r, (e) => e.blockMode && C(e).some((e) => s.includes(e))), l = Ie(nn), u = Qe({ id: a }), d = Ze({
		id: a,
		disabled: i
	}), { className: f, line: p } = sn(e, t);
	return /* @__PURE__ */ Y("div", {
		ref: (e) => {
			u.setNodeRef(e), d.setNodeRef(e);
		},
		"data-row": a,
		"data-nested": n || void 0,
		style: { "--line": `${p}px` },
		className: q(n ? "group/nested" : "group/row", "relative py-[3px]", f, d.isDragging && "opacity-35", e.hidden && "opacity-45"),
		onMouseDown: (e) => {
			let t = e.target;
			t.closest("[data-row]") !== e.currentTarget || t.closest("[contenteditable=\"true\"],textarea,input,button,a,[role=\"button\"]") || (e.shiftKey && r.get().selected ? (e.preventDefault(), r.get().blockMode || r.select(r.get().selected, !0), r.extendTo(s.at(-1))) : (r.select(s[0], !0), s.length > 1 && r.extendTo(s.at(-1))));
		},
		children: [
			l?.id === a && /* @__PURE__ */ J("div", { className: q("pointer-events-none absolute inset-x-0 z-10 h-0.5 rounded-full bg-focus", l.side === "before" ? "-top-px" : "-bottom-px") }),
			!i && /* @__PURE__ */ J(dn, {
				row: e,
				handle: d,
				nested: n
			}),
			/* @__PURE__ */ J("div", {
				className: q("rounded-sm transition-[background-color,box-shadow] duration-100", c && "bg-focus/10 shadow-[0_0_0_3px_color-mix(in_srgb,var(--cms-focus)_10%,transparent)]"),
				children: /* @__PURE__ */ J(ln, { row: e })
			})
		]
	});
}
function ln({ row: e }) {
	let { types: t } = D(), { settings: n } = x();
	if (e.kind === "text") return /* @__PURE__ */ J(i, { node: e.node });
	if (e.kind === "list") return /* @__PURE__ */ J(y, { node: e.node });
	if (e.kind === "actions") return /* @__PURE__ */ J(Bt, { nodes: e.nodes });
	if (e.kind === "container") {
		let r = t.get(e.node.type);
		return /* @__PURE__ */ Y("div", {
			className: "rounded-md border border-border/70 px-4 pb-3 pt-2",
			children: [/* @__PURE__ */ Y("button", {
				type: "button",
				onClick: () => n(e.node.id),
				className: "mb-2 flex max-w-full items-center gap-1.5 text-xs text-faint hover:text-text",
				children: [/* @__PURE__ */ J(W, {
					name: r?.icon ?? "square",
					size: 12
				}), /* @__PURE__ */ J("span", {
					className: "truncate",
					children: e.node.label || r?.title || e.node.type
				})]
			}), e.rows.length ? e.rows.map((e, t) => /* @__PURE__ */ J(cn, {
				row: e,
				first: t === 0,
				nested: !0
			}, h(e))) : /* @__PURE__ */ J(un, { column: e.node })]
		});
	}
	if (e.kind === "columns") {
		let t = String(e.node.props.layout ?? "1-1").split("-").map((e) => `minmax(0,${e}fr)`).join(" ");
		return /* @__PURE__ */ J("div", {
			className: "grid gap-8 py-1 max-md:!grid-cols-1",
			style: { gridTemplateColumns: t },
			children: e.columns.map((e) => /* @__PURE__ */ J("div", {
				className: "min-w-0",
				children: e.rows.length ? e.rows.map((e, t) => /* @__PURE__ */ J(cn, {
					row: e,
					first: t === 0,
					nested: !0
				}, h(e))) : /* @__PURE__ */ J(un, { column: e.node })
			}, e.node.id))
		});
	}
	let r = e.node, a = t.get(r.type), o = en(r.type);
	if (o) return /* @__PURE__ */ J(o, {
		node: r,
		type: a,
		onSettings: n
	});
	switch (r.type) {
		case "image": return /* @__PURE__ */ J(Wt, { node: r });
		case "video":
		case "embed": return /* @__PURE__ */ J(Kt, {
			node: r,
			type: a
		});
		case "code": return /* @__PURE__ */ J(qt, { node: r });
		case "table": return /* @__PURE__ */ J(Jt, { node: r });
		case "divider": return /* @__PURE__ */ J(zt, {});
		case "accordion": return /* @__PURE__ */ J(Yt, { node: r });
		case "pattern": return /* @__PURE__ */ J(Xt, { node: r });
		default: return /* @__PURE__ */ J(Zt, {
			node: r,
			type: a
		});
	}
}
function un({ column: e }) {
	let { store: t, types: r } = D(), { readOnly: i } = x();
	return i || !P(e, "paragraph", r, []) ? null : /* @__PURE__ */ J("button", {
		type: "button",
		onClick: () => {
			let r = n();
			t.insert(e.id, 0, [r]), t.focus(r.id, "start");
		},
		className: q(a, "block w-full cursor-text py-[3px] text-left text-faint opacity-0 hover:opacity-100"),
		children: I("Write here")
	});
}
function dn({ row: e, handle: t, nested: n }) {
	let { store: r, types: i, allowed: a } = D(), s = x(), [c, l] = V(!1), [u, d] = V(""), f = g(r, (t) => t.blockMode && o(e).some((e) => e.id === t.selected)), p = o(e).at(-1), m = (e) => {
		let t = ke(e, i), n = N(r.get().nodes, p.id, t.map((e) => e.type), i, a);
		l(!1), d(""), n && (r.insert(n.parentId, n.index, t), _(r, t[0], s.stops()));
	};
	return /* @__PURE__ */ Y("div", {
		className: q("absolute top-[3px] z-10 flex h-[var(--line)] items-center gap-0.5 opacity-0 transition-opacity duration-100 focus-within:opacity-100", n ? "-left-[22px] group-hover/nested:opacity-100" : "-left-[54px] group-hover/row:opacity-100 group-has-[[data-nested]:hover]/row:!opacity-0", (c || f) && "!opacity-100"),
		children: [!n && /* @__PURE__ */ J(K, {
			open: c,
			onOpenChange: (e) => {
				l(e), e || d("");
			},
			align: "start",
			className: "!p-0",
			trigger: /* @__PURE__ */ J(G, {
				icon: "plus",
				label: I("Add Below"),
				size: "xs",
				className: "!text-faint hover:!text-text"
			}),
			children: /* @__PURE__ */ J(b, {
				types: [...i.values()],
				query: u,
				onQuery: d,
				onChoose: m,
				onClose: () => l(!1),
				allowed: (e) => !!N(r.get().nodes, p.id, e.name, i, a)
			})
		}), /* @__PURE__ */ J(ze, {
			align: "start",
			trigger: /* @__PURE__ */ J("button", {
				type: "button",
				ref: t.setActivatorNodeRef,
				...t.attributes,
				...t.listeners,
				"aria-label": I("Drag to move, click for options"),
				className: "grid h-6 w-[18px] cursor-grab place-items-center rounded-xs text-faint hover:bg-hover hover:text-text active:cursor-grabbing",
				children: /* @__PURE__ */ J(W, {
					name: "drag",
					size: 14
				})
			}),
			items: pn(r, e, i, a, s)
		})]
	});
}
var fn = [
	{
		label: () => I("Text"),
		icon: "paragraph",
		type: "paragraph",
		props: {}
	},
	{
		label: () => I("Heading 1"),
		icon: "heading",
		type: "heading",
		props: { level: "1" }
	},
	{
		label: () => I("Heading 2"),
		icon: "heading",
		type: "heading",
		props: { level: "2" }
	},
	{
		label: () => I("Heading 3"),
		icon: "heading",
		type: "heading",
		props: { level: "3" }
	},
	{
		label: () => I("Bulleted List"),
		icon: "list",
		type: "list",
		props: { ordered: !1 }
	},
	{
		label: () => I("Numbered List"),
		icon: "list-ordered",
		type: "list",
		props: { ordered: !0 }
	},
	{
		label: () => I("Quote"),
		icon: "quote",
		type: "quote",
		props: {}
	},
	{
		label: () => I("Callout"),
		icon: "info",
		type: "callout",
		props: { tone: "note" }
	}
];
function pn(e, t, n, r, i) {
	let a = o(t), s = a[0], c = t.kind === "text" || t.kind === "list", l = () => s.type === "list" ? (s.props.items ?? []).join("<br>") : String(s.props.text ?? ""), u = (e) => e.type === s.type && Object.entries(e.props).every(([e, t]) => String(s.props[e] ?? (e !== "ordered" && "")) === String(t)), d = (t) => () => {
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
	}, f = a.length === 1, p = t.parent ? M(e.get().nodes, t.parent) : null;
	return [
		...c ? [
			{
				label: I("Turn Into"),
				heading: !0
			},
			...fn.filter((e) => n.has(e.type) && P(p, e.type, n, p ? [] : r)).map((e) => ({
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
			label: I("Settings"),
			icon: "settings",
			onSelect: () => i.settings(s.id)
		},
		{
			label: I("Duplicate"),
			icon: "copy",
			shortcut: "mod+d",
			onSelect: () => mn(e, a.map((e) => e.id))
		},
		{
			separator: !0,
			label: ""
		},
		{
			label: I("Delete"),
			icon: "trash",
			danger: !0,
			shortcut: "⌫",
			onSelect: () => e.commit(a.reduce((e, t) => De(e, t.id), e.get().nodes))
		}
	];
}
function mn(e, t) {
	let n = e.get().nodes, r = t.map((e) => M(n, e)).filter((e) => !!e).map(Ae), i = Ee(n, t.at(-1));
	i && r.length !== 0 && (e.insert(i.parentId, i.index + 1, r), e.select(r[0].id, !0), r.length > 1 && e.extendTo(r.at(-1).id));
}
function hn({ row: e }) {
	let t = o(e).map((e) => j(e, 60)).filter(Boolean).join(" · ");
	return /* @__PURE__ */ J("div", {
		className: "cms-pop max-w-[360px] truncate px-3 py-1.5 text-sm text-muted",
		children: t || I("Block")
	});
}
function gn() {
	let { store: e, types: n, allowed: r } = D(), i = x(), a = t(), [o, s] = V(null);
	if (L("components/list", {}, {
		staleTime: 6e4,
		enabled: r.length === 0 || r.includes("pattern")
	}), R(() => {
		if (!a) return s(null);
		let e = requestAnimationFrame(() => {
			let e = document.querySelector(`[data-row="${a.id}"] [contenteditable]`);
			s(l() ?? e?.getBoundingClientRect() ?? null);
		});
		return () => cancelAnimationFrame(e);
	}, [a]), R(() => {
		if (!a) return;
		let e = () => !document.activeElement?.closest(`[data-row="${a.id}"]`) && m(null);
		return document.addEventListener("focusin", e), () => document.removeEventListener("focusin", e);
	}, [a]), de(!!a, [document]), !a || !o) return null;
	let c = (t) => {
		let o = ke(t, n), s = e.get().nodes, c = Ee(s, a.id);
		if (m(null), !c) return;
		let l = c.parentId ? M(s, c.parentId) : null;
		if (o.every((e) => P(l, e.type, n, l ? [] : r))) e.commit(Me(De(s, a.id), c.parentId, c.index, o));
		else {
			let t = N(s, a.id, o.map((e) => e.type), n, r);
			if (!t) return;
			e.commit(Me(De(s, a.id), t.parentId, t.index, o));
		}
		_(e, o[0], i.stops());
	}, { maxHeight: u, ...d } = fe(o);
	return Ge(/* @__PURE__ */ J("div", {
		"data-cms-slash": !0,
		className: "cms-pop fixed z-[60] overflow-hidden !p-0",
		style: d,
		children: /* @__PURE__ */ J(b, {
			types: [...n.values()],
			query: a.query,
			chooseFirst: a.enter,
			patterns: r.length === 0 || r.includes("pattern"),
			onNoMatch: () => {
				let e = document.querySelector(`[data-row="${a.id}"] [contenteditable]`);
				m(null), e?.dispatchEvent(new KeyboardEvent("keydown", {
					key: "Enter",
					bubbles: !0,
					cancelable: !0
				}));
			},
			showSearch: !1,
			compact: !0,
			style: { maxHeight: u },
			onChoose: c,
			onClose: () => m(null),
			allowed: (t) => !!N(e.get().nodes, a.id, t.name, n, r)
		})
	}), document.body);
}
function _n(e, t, n, r) {
	R(() => {
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
			let f = [...r.current.values()], p = f.findIndex((e) => o(e).some((e) => e.id === s)), m = f[p], h = (t) => {
				if (!t) return;
				let n = o(t).map((e) => e.id);
				e.select(n[0], !0), n.length > 1 && e.extendTo(n.at(-1)), document.querySelector(`[data-row="${n[0]}"]`)?.scrollIntoView({ block: "nearest" });
			};
			if (i.key === "ArrowDown" || i.key === "ArrowUp") {
				i.preventDefault();
				let t = i.key === "ArrowUp";
				if (i.altKey) return e.nudge(s, t ? -1 : 1);
				if (i.shiftKey) return e.extend(t ? -1 : 1);
				h(f[p + (t ? -1 : 1)]);
			} else if (i.key === "Enter") {
				i.preventDefault();
				let t = n.stops().find((e) => e.id === s), r = m ? o(m)[0] : null;
				t ? A(e, t, "end") : r && n.settings(r.id);
			} else if (i.key === "Backspace" || i.key === "Delete") {
				i.preventDefault();
				let t = f[p - 1] ?? f.slice(p + 1).find((t) => !o(t).some((t) => e.selection().includes(t.id)));
				e.removeSelection(), h(t);
			} else if (u && i.key.toLowerCase() === "d") i.preventDefault(), mn(e, e.selection());
			else if (u && (i.key.toLowerCase() === "c" || i.key.toLowerCase() === "x")) {
				let t = e.selection().map((e) => M(l, e)).filter(Boolean);
				if (t.length === 0) return;
				i.preventDefault(), navigator.clipboard.writeText("cms-blocks:" + JSON.stringify(t)), i.key.toLowerCase() === "x" && e.removeSelection();
			} else u && i.key.toLowerCase() === "v" ? (i.preventDefault(), navigator.clipboard.readText().then((t) => {
				if (!t.startsWith("cms-blocks:")) return;
				let n = JSON.parse(t.slice(12)).map(Ae);
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
Pt(), F.fields.set("blocks", tt), Mt(), F.fields.set("blocks-icon", Rt), F.panels.set("blocks-editor", {
	slot: "entry.editor",
	label: I("Block Editor"),
	icon: "layout",
	component: Fe(() => import("./chunks/BlocksWorkspace-vvYvR3Vl.js").then((e) => ({ default: e.BlocksWorkspace }))),
	when: (e) => e.bodyField.type === "blocks"
}), F.widgets.set("blocks-design", Fe(() => import("./chunks/WidgetDesign-ejI_VtLz.js")));
export { e as EditorProvider, S as EditorStore, ye as Inspector, rn as WriteEditor, $ as blockViews, be as useCatalog, g as useEditor, D as useEditorContext };
