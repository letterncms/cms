import { d as e, f as t, l as n, p as r, t as i, u as a } from "./Inserter-CfdoRD1B.js";
import { _ as o, a as s, c, f as l, i as u, l as d, n as f, t as p } from "./insert-DZPaXAR2.js";
import { $ as m, J as h, Qt as g, Yt as _, Zt as v, _t as y, ct as b, dt as ee, pt as x, t as te } from "./Inspector-CftFu-9O.js";
import { events as S, plural as C, t as w, useScreenContext as T } from "@letterncms/sdk";
import { useEffect as E, useMemo as D, useRef as O, useState as k } from "react";
import { Button as A, Dialog as j, Icon as M, IconButton as N, InspectorPanel as P, PanelHeader as ne, Popover as re, QueryError as F, ScreenSidebar as ie, Segmented as I, Spinner as L, Tooltip as R, cn as z, fieldControlId as B, useScreenSidebar as ae, useWideInspector as oe } from "@letterncms/ui";
import { Fragment as V, jsx as H, jsxs as U } from "react/jsx-runtime";
import { createPortal as se } from "react-dom";
import { DndContext as W, PointerSensor as G, closestCenter as K, useSensor as q, useSensors as J } from "@dnd-kit/core";
import { SortableContext as Y, useSortable as X, verticalListSortingStrategy as Z } from "@dnd-kit/sortable";
import { CSS as Q } from "@dnd-kit/utilities";
// admin/src/builder/Layers.tsx
function ce() {
	let { store: e, types: t, allowed: n, readOnly: i } = r(), a = g(e, (e) => e.nodes), o = g(e, (e) => e.selected), u = g(e, v), f = g(e, (e) => e.hovered), [m, h] = k({}), _ = J(q(G, { activationConstraint: { distance: 4 } }));
	E(() => {
		if (!o) return;
		let t = s(e.get().nodes, o).filter((e) => m[e.id]);
		t.length && h((e) => ({
			...e,
			...Object.fromEntries(t.map((e) => [e.id, !1]))
		})), document.querySelector(`[data-layer="${o}"]`)?.scrollIntoView({ block: "nearest" });
	}, [o]);
	let y = D(() => ue(a, (e) => !!t.get(e.type)?.children || !!e.children?.length), [a, t]), b = d(a).filter(({ node: e }) => !s(a, e.id).some((e) => m[e.id]));
	return a.length === 0 ? /* @__PURE__ */ H("div", {
		className: "px-4 py-3",
		children: /* @__PURE__ */ H("p", {
			className: "m-0 text-sm text-muted",
			children: w("No elements yet")
		})
	}) : /* @__PURE__ */ H(W, {
		sensors: _,
		collisionDetection: K,
		onDragEnd: (r) => {
			if (i || !r.over || r.active.id === r.over.id) return;
			let a = e.get().nodes, o = c(a, String(r.active.id)), s = c(a, String(r.over.id)), u = l(a, String(r.over.id)), d = l(a, String(r.active.id));
			if (!o || !s || !u || !d) return;
			if (t.get(s.type)?.children && !m[s.id] && p(s, o.type, t) && (s.children?.length ?? 0) === 0) return e.move(o.id, s.id, 0);
			let f = u.parentId ? c(a, u.parentId) : null;
			if (!p(f, o.type, t, f ? [] : n)) return;
			let h = d.parentId === u.parentId && d.index < u.index ? u.index + 1 : u.index;
			e.move(o.id, u.parentId, h);
		},
		children: /* @__PURE__ */ H(Y, {
			items: b.map((e) => e.node.id),
			strategy: Z,
			children: /* @__PURE__ */ H("div", {
				className: "space-y-px px-2 pb-3 pt-1",
				onMouseLeave: () => e.hover(null),
				children: b.map(({ node: e, depth: t }) => /* @__PURE__ */ H(de, {
					node: e,
					depth: t,
					selected: u.includes(e.id),
					hovered: f === e.id,
					collapsed: !!m[e.id],
					hint: m[e.id] || !e.children?.length ? y.get(e.id) : void 0,
					onToggle: () => h((t) => ({
						...t,
						[e.id]: !t[e.id]
					}))
				}, e.id))
			})
		})
	});
}
function le(e, t) {
	if (e.type !== "box") return t;
	let n = {
		section: w("Section"),
		header: w("Header"),
		footer: w("Footer"),
		nav: w("Navigation"),
		main: w("Main Content"),
		aside: w("Aside"),
		article: w("Article"),
		ul: w("List"),
		ol: w("List"),
		li: w("List Item"),
		a: w("Link"),
		button: w("Button"),
		form: w("Form"),
		figure: w("Figure")
	}, r = String(e.props?.tag ?? "");
	if (n[r]) return n[r];
	let i = new Set((e.class ?? "").split(/\s+/).filter((e) => !e.includes(":")));
	return i.has("grid") || i.has("inline-grid") ? w("Grid") : i.has("flex") || i.has("inline-flex") ? i.has("flex-col") || i.has("flex-col-reverse") ? w("Stack") : w("Row||layout") : t;
}
function $(e, t) {
	let n = o(e, t);
	if (n) return n;
	let r = String(e.bind?.text ?? "").replace(/[{}]/g, "").split("|")[0].trim().split(".").pop() ?? "";
	return r ? r.replace(/[_-]+/g, " ").replace(/^\w/, (e) => e.toUpperCase()) : "";
}
function ue(e, t) {
	let n = /* @__PURE__ */ new Map();
	for (let { node: r } of d(e)) {
		if (!t(r) || r.label || r.type === "component") continue;
		let e = r.children ?? [], i = e.find((e) => e.type === "heading" && $(e, 48));
		if (i) {
			n.set(r.id, $(i, 48));
			continue;
		}
		let a = e.filter((e) => !t(e)).map((e) => $(e, 32)).filter(Boolean).slice(0, 2);
		a.length && n.set(r.id, a.join(" · "));
	}
	return n;
}
function de({ node: e, depth: n, selected: i, hovered: o, collapsed: s, hint: c, onToggle: l }) {
	let { store: u, types: d, readOnly: f } = r(), p = d.get(e.type), { attributes: m, listeners: g, setNodeRef: _, transform: v, transition: b, isDragging: ee } = X({
		id: e.id,
		disabled: f
	}), x = (e.children?.length ?? 0) > 0, te = t(), S = !!p?.children || x, C = e.type === "component" ? a(e, d, te) : e.label || (S ? le(e, p?.title ?? e.type) : $(e, 48) || p?.title || e.type), T = !e.label && e.type !== "component" && !S && !$(e, 48), [E, D] = k(!1), O = e.type === "component", A = [
		e.motion?.length && {
			icon: "animated",
			title: w("Animated")
		},
		e.logic && {
			icon: "interactive",
			title: w("Interactive")
		},
		e.bind && Object.keys(e.bind).some((e) => e !== "visible" && e !== "hidden") && {
			icon: "database",
			title: w("Connected to Data")
		},
		(e.logic?.show || e.bind?.visible || e.bind?.hidden) && {
			icon: "eye-off",
			title: e.logic?.show ? w("Shown when {condition}", { condition: e.logic.show }) : w("Shown conditionally")
		}
	].filter(Boolean), j = /* @__PURE__ */ U("span", {
		onDoubleClick: (e) => {
			e.stopPropagation(), f || D(!0);
		},
		title: f || A.length ? void 0 : w("Double-Click to Rename"),
		className: z("min-w-0 flex-1 truncate", e.hidden ? "text-faint line-through decoration-faint/60" : T && "text-muted"),
		children: [C, c && /* @__PURE__ */ H("span", {
			className: z("ml-1.5", i ? "text-muted" : "text-faint"),
			children: c
		})]
	}), P = A.length ? /* @__PURE__ */ H(R, {
		content: /* @__PURE__ */ H("span", {
			className: "grid gap-1",
			children: A.map((e) => /* @__PURE__ */ U("span", {
				className: "flex items-center gap-1.5",
				children: [/* @__PURE__ */ H(M, {
					name: e.icon,
					size: 12
				}), e.title]
			}, e.icon))
		}),
		children: j
	}) : j;
	return /* @__PURE__ */ U("div", {
		ref: _,
		"data-layer": e.id,
		style: {
			transform: Q.Translate.toString(v),
			transition: b,
			paddingLeft: 4 + n * 12
		},
		...m,
		...g,
		onClick: (t) => {
			t.shiftKey ? u.extendTo(e.id) : y.emit("inspect", { node: e.id }), y.emit("scroll-to", { node: e.id });
		},
		onMouseEnter: () => u.hover(e.id),
		onKeyDown: (t) => {
			E || t.target !== t.currentTarget || (t.key === "Enter" || t.key === " " ? (t.preventDefault(), y.emit("inspect", { node: e.id }), y.emit("scroll-to", { node: e.id })) : !f && t.key === "F2" && (t.preventDefault(), D(!0)));
		},
		className: z("group relative flex h-7 pointer-coarse:h-10 cursor-default select-none items-center gap-1.5 rounded-md pr-1 text-sm -outline-offset-2", i ? "bg-focus-soft text-ink" : o ? "bg-hover text-text" : "text-text", ee && "z-drag bg-bg opacity-80 shadow-pop"),
		children: [
			/* @__PURE__ */ H(N, {
				icon: "chevron-down",
				size: "xs",
				label: w(s ? "Expand" : "Collapse"),
				title: void 0,
				onClick: (e) => {
					e.stopPropagation(), l();
				},
				className: z("-mr-1 !size-4 !bg-transparent !text-faint hover:!text-ink [&_svg]:size-2.5 [&_svg]:transition-transform [&_svg]:duration-fast", s && "[&_svg]:-rotate-90", !x && "invisible")
			}),
			/* @__PURE__ */ H(M, {
				name: O ? "symbol" : p?.icon ?? "square",
				size: 14,
				className: z("shrink-0", e.hidden ? "text-ghost" : i ? "text-ink" : O ? "text-muted" : "text-faint")
			}),
			E ? /* @__PURE__ */ H("div", {
				className: "min-w-0 flex-1",
				onClick: (e) => e.stopPropagation(),
				onPointerDown: (e) => e.stopPropagation(),
				onKeyDown: (e) => e.stopPropagation(),
				onKeyUp: (e) => e.key === "Escape" && e.target.blur(),
				onBlur: () => D(!1),
				children: /* @__PURE__ */ H(h, {
					bare: !0,
					fields: [{
						handle: "label",
						type: "text",
						size: "sm",
						commit: "blur",
						label: w("Layer Name"),
						autofocus: !0,
						placeholder: p?.title
					}],
					values: { label: e.label ?? "" },
					onChange: (t, n) => u.updateNode(e.id, { label: n.trim() || void 0 })
				})
			}) : P,
			!E && A.map((e) => /* @__PURE__ */ H("span", {
				role: "img",
				"aria-label": e.title,
				className: "grid size-5 shrink-0 place-items-center text-faint group-hover:hidden group-focus-visible:hidden",
				children: /* @__PURE__ */ H(M, {
					name: e.icon,
					size: 12
				})
			}, e.icon)),
			/* @__PURE__ */ H("span", {
				className: e.hidden ? "contents" : "hidden group-hover:contents group-focus-visible:contents [@media(hover:none)]:contents",
				children: /* @__PURE__ */ H(R, {
					content: e.hidden ? w("Show") : w("Hide"),
					children: /* @__PURE__ */ H(N, {
						icon: e.hidden ? "eye-off" : "eye",
						size: "xs",
						label: e.hidden ? w("Show") : w("Hide"),
						title: void 0,
						disabled: f,
						onClick: (t) => {
							t.stopPropagation(), u.updateNode(e.id, { hidden: !e.hidden || void 0 });
						},
						onPointerDown: (e) => e.stopPropagation(),
						className: "!text-faint hover:!text-ink"
					})
				})
			})
		]
	});
}
// admin/src/BlocksWorkspace.tsx
function fe(t) {
	let { catalog: r, types: i, isLoading: a, error: o, retry: s } = e(), c = t.bodyField.handle, l = _(t.values[c], (e) => t.setValue(c, e), !t.editable), u = O(t.values);
	u.current = t.values;
	let d = {
		kind: t.collection.handle === "templates" ? "template" : t.collection.handle === "components" ? "component" : "entry",
		id: t.entry?.id ?? "",
		collections: t.values.collections,
		props: t.values.props
	};
	return a ? /* @__PURE__ */ U("div", {
		className: "flex h-full min-h-0",
		children: [/* @__PURE__ */ H("div", {
			className: "grid min-w-0 flex-1 place-items-center",
			children: /* @__PURE__ */ H(L, {})
		}), /* @__PURE__ */ H(P, {
			sheet: !0,
			className: pe,
			open: t.sidebarOpen,
			onOpenChange: t.setSidebarOpen,
			title: t.collection.singular,
			children: t.sidebar
		})]
	}) : r ? /* @__PURE__ */ U(n, {
		value: {
			store: l,
			catalog: r,
			types: i,
			entryId: t.entry?.id ?? null,
			fieldHandle: c,
			allowed: t.bodyField.allowed ?? [],
			getValues: () => u.current,
			title: t.title,
			doc: d,
			readOnly: !t.editable
		},
		children: [o && /* @__PURE__ */ H(F, {
			message: o.message,
			onRetry: s,
			compact: !0
		}), /* @__PURE__ */ H(ge, { props: t })]
	}) : /* @__PURE__ */ H(F, {
		message: o?.message,
		onRetry: s
	});
}
var pe = "cms-block-sheet", me = () => [
	{
		value: "desktop",
		label: w("Desktop"),
		icon: "monitor"
	},
	{
		value: "tablet",
		label: w("Tablet"),
		icon: "tablet"
	},
	{
		value: "phone",
		label: w("Phone"),
		icon: "phone"
	}
];
function he() {
	let { store: e } = r(), t = g(e, (e) => e.device);
	return /* @__PURE__ */ H(I, {
		"aria-label": w("Screen"),
		value: t,
		onChange: e.setDevice,
		options: me().map((e) => ({
			value: e.value,
			icon: e.icon,
			title: e.label
		})),
		className: "max-sm:hidden"
	});
}
function ge({ props: e }) {
	let { store: t, types: n, allowed: a, readOnly: s } = r(), l = g(t, (e) => e.selected ? c(e.nodes, e.selected) : null), d = g(t, (e) => e.blockMode), h = g(t, (e) => v(e).length), _ = g(t, () => t.canUndo()), D = g(t, () => t.canRedo()), [M, F] = k(!1), I = ae(), [L, R] = k(!1), [z, W] = k(""), G = oe(), [K] = k(() => window.matchMedia("(max-width: 639px)").matches), q = g(t, v);
	E(() => {
		window.matchMedia("(max-width: 639px)").matches && t.setDevice("phone");
	}, [t]), T({ items: q.flatMap((e) => {
		let r = c(t.get().nodes, e);
		return r ? [{
			id: e,
			kind: "block",
			label: o(r, 40) || (n.get(r.type)?.title ?? w("Block")),
			icon: n.get(r.type)?.icon,
			read: () => c(t.get().nodes, e)
		}] : [];
	}) });
	let J = (n) => {
		t.select(n, !0), F(!0), e.setSidebarOpen(!0);
	};
	E(() => {
		l && d ? (F(!0), e.setSidebarOpen(!0), G || I.setOpen(!1)) : l && G && e.sidebarOpen && F(!0);
	}, [
		l?.id,
		d,
		G
	]), E(() => {
		e.sidebarOpen ? !G && t.get().selected && (F(!0), window.matchMedia("(max-width: 639px)").matches && y.emit("scroll-to", {
			node: t.get().selected,
			top: !0
		})) : F(!1);
	}, [e.sidebarOpen]), E(() => {
		Object.keys(e.errors).length && F(!1);
	}, [e.errors]), E(() => y.on("preview-motion", () => S.emit("entry.preview")), []);
	let Y = O(J);
	Y.current = J, E(() => y.on("inspect", ({ node: e }) => Y.current(e)), []);
	let X = () => {
		t.select(null), F(!1);
	}, Z = (e) => {
		let r = t.get(), i = r.selected ? c(r.nodes, r.selected) : null;
		return i && (Array.isArray(e) ? e : [e]).every((e) => p(i, e, n)) ? {
			parentId: i.id,
			index: i.children?.length ?? 0
		} : r.selected ? u(r.nodes, r.selected, e, n, a) : (Array.isArray(e) ? e : [e]).every((e) => p(null, e, n, a)) ? {
			parentId: null,
			index: r.nodes.length
		} : null;
	}, Q = (e) => {
		let r = f(e, n);
		if (!r.length) return;
		let i = Z(r.map((e) => e.type));
		i && (t.insert(i.parentId, i.index, r), x(t, r[0], ee(b(t.get().nodes, n, () => !1))), R(!1), W(""));
	};
	return /* @__PURE__ */ U("div", {
		className: "flex h-full min-h-0 flex-col",
		"data-block-workspace": !0,
		children: [
			e.toolbar && se(/* @__PURE__ */ U(V, { children: [
				!s && (K ? /* @__PURE__ */ U(V, { children: [/* @__PURE__ */ H(N, {
					icon: "plus",
					label: w("Insert Block"),
					onClick: () => R(!0)
				}), /* @__PURE__ */ H(j, {
					open: L,
					onOpenChange: R,
					title: w("Insert Block"),
					children: /* @__PURE__ */ H(i, {
						className: "!max-h-none !w-full",
						types: [...n.values()],
						query: z,
						onQuery: W,
						onChoose: Q,
						onClose: () => R(!1),
						allowed: (e) => !!Z(e.name)
					})
				})] }) : /* @__PURE__ */ H(re, {
					open: L,
					onOpenChange: R,
					align: "start",
					trigger: /* @__PURE__ */ H(N, {
						icon: "plus",
						label: w("Insert Block")
					}),
					className: "!p-0",
					children: /* @__PURE__ */ H(i, {
						types: [...n.values()],
						query: z,
						onQuery: W,
						onChoose: Q,
						onClose: () => R(!1),
						allowed: (e) => !!Z(e.name)
					})
				})),
				/* @__PURE__ */ H(N, {
					icon: "undo",
					label: w("Undo"),
					disabled: !_,
					onClick: t.undo
				}),
				/* @__PURE__ */ H(N, {
					icon: "redo",
					label: w("Redo"),
					disabled: !D,
					onClick: t.redo
				}),
				/* @__PURE__ */ H(he, {})
			] }), e.toolbar),
			/* @__PURE__ */ H(ie, {
				title: w("Outline||structure"),
				backTo: e.listPath,
				backLabel: e.listLabel ?? e.collection.title,
				children: /* @__PURE__ */ H(ce, {})
			}),
			/* @__PURE__ */ U("div", {
				className: "flex min-h-0 flex-1",
				children: [/* @__PURE__ */ U("main", {
					id: B(e.bodyField),
					tabIndex: -1,
					"aria-label": e.bodyField.label,
					"aria-describedby": e.errors[e.bodyField.handle] ? `${B(e.bodyField)}-error` : void 0,
					className: "flex min-w-0 flex-1 flex-col outline-none",
					"data-editor-document": !0,
					children: [
						/* @__PURE__ */ H(m, {
							collection: e.collection.handle,
							blueprint: e.collection.blueprint,
							entryId: e.entry?.id,
							content: e.content,
							onTitleChange: ["templates", "components"].includes(e.collection.handle) ? void 0 : e.setTitle,
							onInspect: J
						}),
						e.errors[e.bodyField.handle] && /* @__PURE__ */ H("p", {
							id: `${B(e.bodyField)}-error`,
							role: "alert",
							className: "m-0 shrink-0 px-3 py-2 text-xs text-danger",
							children: e.errors[e.bodyField.handle]
						}),
						/* @__PURE__ */ H("div", {
							className: "max-h-[30vh] shrink-0 overflow-y-auto",
							children: e.footer
						})
					]
				}), /* @__PURE__ */ H(P, {
					sheet: !0,
					className: pe,
					open: e.sidebarOpen,
					onOpenChange: e.setSidebarOpen,
					title: M && l ? n.get(l.type)?.title ?? w("Block") : e.collection.singular,
					children: M && l ? h > 1 ? /* @__PURE__ */ U(V, { children: [/* @__PURE__ */ H(ne, {
						title: C(h, "{count} block selected", "{count} blocks selected"),
						onBack: X,
						backLabel: e.collection.singular,
						onClose: () => e.setSidebarOpen(!1)
					}), !s && /* @__PURE__ */ H("div", {
						className: "px-2 py-3",
						children: /* @__PURE__ */ H(A, {
							variant: "destructive",
							size: "sm",
							icon: "trash",
							onClick: () => t.removeSelection(),
							children: w("Delete")
						})
					})] }) : /* @__PURE__ */ H(te, {
						node: l,
						onBack: X,
						backLabel: e.collection.singular,
						onClose: () => e.setSidebarOpen(!1)
					}) : e.sidebar
				})]
			})
		]
	});
}
export { fe as BlocksWorkspace };
