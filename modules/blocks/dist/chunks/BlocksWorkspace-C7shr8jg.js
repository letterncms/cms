import { d as e, f as t, l as n, p as r, t as i, u as a } from "./Inserter-CfdoRD1B.js";
import { _ as o, a as s, c, f as l, i as u, l as d, n as f, t as p } from "./insert-DZPaXAR2.js";
import { an as m, bt as h, et as g, ht as _, in as v, nn as y, ot as b, t as x, vt as S, wt as C } from "./Inspector-CNV8GGaH.js";
import { events as w, plural as T, t as E, useScreenContext as ee } from "@letterncms/sdk";
import { useEffect as D, useMemo as O, useRef as k, useState as A } from "react";
import { Button as j, Dialog as M, Icon as N, IconButton as P, InspectorPanel as F, PanelHeader as te, Popover as ne, QueryError as I, ScreenSidebar as re, Segmented as L, Spinner as R, Tooltip as z, cn as B, fieldControlId as V, useScreenSidebar as ie, useWideInspector as ae } from "@letterncms/ui";
import { Fragment as H, jsx as U, jsxs as W } from "react/jsx-runtime";
import { createPortal as oe } from "react-dom";
import { DndContext as G, PointerSensor as K, closestCenter as q, useSensor as se, useSensors as J } from "@dnd-kit/core";
import { SortableContext as Y, useSortable as X, verticalListSortingStrategy as Z } from "@dnd-kit/sortable";
import { CSS as Q } from "@dnd-kit/utilities";
// admin/src/builder/Layers.tsx
function ce() {
	let { store: e, types: t, allowed: n, readOnly: i } = r(), a = m(e, (e) => e.nodes), o = m(e, (e) => e.selected), u = m(e, v), f = m(e, (e) => e.hovered), [h, g] = A({}), _ = J(se(K, { activationConstraint: { distance: 4 } }));
	D(() => {
		if (!o) return;
		let t = s(e.get().nodes, o).filter((e) => h[e.id]);
		t.length && g((e) => ({
			...e,
			...Object.fromEntries(t.map((e) => [e.id, !1]))
		})), document.querySelector(`[data-layer="${o}"]`)?.scrollIntoView({ block: "nearest" });
	}, [o]);
	let y = O(() => ue(a, (e) => !!t.get(e.type)?.children || !!e.children?.length), [a, t]), b = d(a).filter(({ node: e }) => !s(a, e.id).some((e) => h[e.id]));
	return a.length === 0 ? /* @__PURE__ */ U("div", {
		className: "px-4 py-3",
		children: /* @__PURE__ */ U("p", {
			className: "m-0 text-sm text-muted",
			children: E("No elements yet")
		})
	}) : /* @__PURE__ */ U(G, {
		sensors: _,
		collisionDetection: q,
		onDragEnd: (r) => {
			if (i || !r.over || r.active.id === r.over.id) return;
			let a = e.get().nodes, o = c(a, String(r.active.id)), s = c(a, String(r.over.id)), u = l(a, String(r.over.id)), d = l(a, String(r.active.id));
			if (!o || !s || !u || !d) return;
			if (t.get(s.type)?.children && !h[s.id] && p(s, o.type, t) && (s.children?.length ?? 0) === 0) return e.move(o.id, s.id, 0);
			let f = u.parentId ? c(a, u.parentId) : null;
			if (!p(f, o.type, t, f ? [] : n)) return;
			let m = d.parentId === u.parentId && d.index < u.index ? u.index + 1 : u.index;
			e.move(o.id, u.parentId, m);
		},
		children: /* @__PURE__ */ U(Y, {
			items: b.map((e) => e.node.id),
			strategy: Z,
			children: /* @__PURE__ */ U("div", {
				className: "space-y-px px-2 pb-3 pt-1",
				onMouseLeave: () => e.hover(null),
				children: b.map(({ node: e, depth: t }) => /* @__PURE__ */ U(de, {
					node: e,
					depth: t,
					selected: u.includes(e.id),
					hovered: f === e.id,
					collapsed: !!h[e.id],
					hint: h[e.id] || !e.children?.length ? y.get(e.id) : void 0,
					onToggle: () => g((t) => ({
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
		section: E("Section"),
		header: E("Header"),
		footer: E("Footer"),
		nav: E("Navigation"),
		main: E("Main Content"),
		aside: E("Aside"),
		article: E("Article"),
		ul: E("List"),
		ol: E("List"),
		li: E("List Item"),
		a: E("Link"),
		button: E("Button"),
		form: E("Form"),
		figure: E("Figure")
	}, r = String(e.props?.tag ?? "");
	if (n[r]) return n[r];
	let i = new Set((e.class ?? "").split(/\s+/).filter((e) => !e.includes(":")));
	return i.has("grid") || i.has("inline-grid") ? E("Grid") : i.has("flex") || i.has("inline-flex") ? i.has("flex-col") || i.has("flex-col-reverse") ? E("Stack") : E("Row||layout") : t;
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
	let { store: u, types: d, readOnly: f } = r(), p = d.get(e.type), { attributes: m, listeners: h, setNodeRef: _, transform: v, transition: y, isDragging: b } = X({
		id: e.id,
		disabled: f
	}), x = (e.children?.length ?? 0) > 0, S = t(), w = !!p?.children || x, T = e.type === "component" ? a(e, d, S) : e.label || (w ? le(e, p?.title ?? e.type) : $(e, 48) || p?.title || e.type), ee = !e.label && e.type !== "component" && !w && !$(e, 48), [D, O] = A(!1), k = e.type === "component", j = [
		e.motion?.length && {
			icon: "animated",
			title: E("Animated")
		},
		e.logic && {
			icon: "interactive",
			title: E("Interactive")
		},
		e.bind && Object.keys(e.bind).some((e) => e !== "visible" && e !== "hidden") && {
			icon: "database",
			title: E("Connected to Data")
		},
		(e.logic?.show || e.bind?.visible || e.bind?.hidden) && {
			icon: "eye-off",
			title: e.logic?.show ? E("Shown when {condition}", { condition: e.logic.show }) : E("Shown conditionally")
		}
	].filter(Boolean), M = /* @__PURE__ */ W("span", {
		onDoubleClick: (e) => {
			e.stopPropagation(), f || O(!0);
		},
		title: f || j.length ? void 0 : E("Double-Click to Rename"),
		className: B("min-w-0 flex-1 truncate", e.hidden ? "text-faint line-through decoration-faint/60" : ee && "text-muted"),
		children: [T, c && /* @__PURE__ */ U("span", {
			className: B("ml-1.5", i ? "text-muted" : "text-faint"),
			children: c
		})]
	}), F = j.length ? /* @__PURE__ */ U(z, {
		content: /* @__PURE__ */ U("span", {
			className: "grid gap-1",
			children: j.map((e) => /* @__PURE__ */ W("span", {
				className: "flex items-center gap-1.5",
				children: [/* @__PURE__ */ U(N, {
					name: e.icon,
					size: 12
				}), e.title]
			}, e.icon))
		}),
		children: M
	}) : M;
	return /* @__PURE__ */ W("div", {
		ref: _,
		"data-layer": e.id,
		style: {
			transform: Q.Translate.toString(v),
			transition: y,
			paddingLeft: 4 + n * 12
		},
		...m,
		...h,
		onClick: (t) => {
			t.shiftKey ? u.extendTo(e.id) : C.emit("inspect", { node: e.id }), C.emit("scroll-to", { node: e.id });
		},
		onMouseEnter: () => u.hover(e.id),
		onKeyDown: (t) => {
			D || t.target !== t.currentTarget || (t.key === "Enter" || t.key === " " ? (t.preventDefault(), C.emit("inspect", { node: e.id }), C.emit("scroll-to", { node: e.id })) : !f && t.key === "F2" && (t.preventDefault(), O(!0)));
		},
		className: B("group relative flex h-7 pointer-coarse:h-10 cursor-default select-none items-center gap-1.5 rounded-md pr-1 text-sm -outline-offset-2", i ? "bg-focus-soft text-ink" : o ? "bg-hover text-text" : "text-text", b && "z-drag bg-bg opacity-80 shadow-pop"),
		children: [
			/* @__PURE__ */ U(P, {
				icon: "chevron-down",
				size: "xs",
				label: E(s ? "Expand" : "Collapse"),
				title: void 0,
				onClick: (e) => {
					e.stopPropagation(), l();
				},
				className: B("-mr-1 !size-4 !bg-transparent !text-faint hover:!text-ink [&_svg]:size-2.5 [&_svg]:transition-transform [&_svg]:duration-fast", s && "[&_svg]:-rotate-90", !x && "invisible")
			}),
			/* @__PURE__ */ U(N, {
				name: k ? "symbol" : p?.icon ?? "square",
				size: 14,
				className: B("shrink-0", e.hidden ? "text-ghost" : i ? "text-ink" : k ? "text-muted" : "text-faint")
			}),
			D ? /* @__PURE__ */ U("div", {
				className: "min-w-0 flex-1",
				onClick: (e) => e.stopPropagation(),
				onPointerDown: (e) => e.stopPropagation(),
				onKeyDown: (e) => e.stopPropagation(),
				onKeyUp: (e) => e.key === "Escape" && e.target.blur(),
				onBlur: () => O(!1),
				children: /* @__PURE__ */ U(g, {
					bare: !0,
					fields: [{
						handle: "label",
						type: "text",
						size: "sm",
						commit: "blur",
						label: E("Layer Name"),
						autofocus: !0,
						placeholder: p?.title
					}],
					values: { label: e.label ?? "" },
					onChange: (t, n) => u.updateNode(e.id, { label: n.trim() || void 0 })
				})
			}) : F,
			!D && j.map((e) => /* @__PURE__ */ U("span", {
				role: "img",
				"aria-label": e.title,
				className: "grid size-5 shrink-0 place-items-center text-faint group-hover:hidden group-focus-visible:hidden",
				children: /* @__PURE__ */ U(N, {
					name: e.icon,
					size: 12
				})
			}, e.icon)),
			/* @__PURE__ */ U("span", {
				className: e.hidden ? "contents" : "hidden group-hover:contents group-focus-visible:contents [@media(hover:none)]:contents",
				children: /* @__PURE__ */ U(z, {
					content: e.hidden ? E("Show") : E("Hide"),
					children: /* @__PURE__ */ U(P, {
						icon: e.hidden ? "eye-off" : "eye",
						size: "xs",
						label: e.hidden ? E("Show") : E("Hide"),
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
	let { catalog: r, types: i, isLoading: a, error: o, retry: s } = e(), c = t.bodyField.handle, l = y(t.values[c], (e) => t.setValue(c, e), !t.editable), u = k(t.values);
	u.current = t.values;
	let d = {
		kind: t.collection.handle === "templates" ? "template" : t.collection.handle === "components" ? "component" : "entry",
		id: t.entry?.id ?? "",
		collections: t.values.collections,
		props: t.values.props
	};
	return a ? /* @__PURE__ */ W("div", {
		className: "flex h-full min-h-0",
		children: [/* @__PURE__ */ U("div", {
			className: "grid min-w-0 flex-1 place-items-center",
			children: /* @__PURE__ */ U(R, {})
		}), /* @__PURE__ */ U(F, {
			sheet: !0,
			className: pe,
			open: t.sidebarOpen,
			onOpenChange: t.setSidebarOpen,
			title: t.collection.singular,
			children: t.sidebar
		})]
	}) : r ? /* @__PURE__ */ W(n, {
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
		children: [o && /* @__PURE__ */ U(I, {
			message: o.message,
			onRetry: s,
			compact: !0
		}), /* @__PURE__ */ U(ge, { props: t })]
	}) : /* @__PURE__ */ U(I, {
		message: o?.message,
		onRetry: s
	});
}
var pe = "cms-block-sheet", me = () => [
	{
		value: "desktop",
		label: E("Desktop"),
		icon: "monitor"
	},
	{
		value: "tablet",
		label: E("Tablet"),
		icon: "tablet"
	},
	{
		value: "phone",
		label: E("Phone"),
		icon: "phone"
	}
];
function he() {
	let { store: e } = r(), t = m(e, (e) => e.device);
	return /* @__PURE__ */ U(L, {
		"aria-label": E("Screen"),
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
	let { store: t, types: n, allowed: a, readOnly: s } = r(), l = m(t, (e) => e.selected ? c(e.nodes, e.selected) : null), d = m(t, (e) => e.blockMode), g = m(t, (e) => v(e).length), y = m(t, () => t.canUndo()), O = m(t, () => t.canRedo()), [N, I] = A(!1), L = ie(), [R, z] = A(!1), [B, G] = A(""), K = ae(), [q] = A(() => window.matchMedia("(max-width: 639px)").matches), se = m(t, v);
	D(() => {
		window.matchMedia("(max-width: 639px)").matches && t.setDevice("phone");
	}, [t]), ee({ items: se.flatMap((e) => {
		let r = c(t.get().nodes, e);
		return r ? [{
			id: e,
			kind: "block",
			label: o(r, 40) || (n.get(r.type)?.title ?? E("Block")),
			icon: n.get(r.type)?.icon,
			read: () => c(t.get().nodes, e)
		}] : [];
	}) });
	let J = (n) => {
		t.select(n, !0), I(!0), e.setSidebarOpen(!0);
	};
	D(() => {
		l && d ? (I(!0), e.setSidebarOpen(!0), K || L.setOpen(!1)) : l && K && e.sidebarOpen && I(!0);
	}, [
		l?.id,
		d,
		K
	]), D(() => {
		e.sidebarOpen ? !K && t.get().selected && (I(!0), window.matchMedia("(max-width: 639px)").matches && C.emit("scroll-to", {
			node: t.get().selected,
			top: !0
		})) : I(!1);
	}, [e.sidebarOpen]), D(() => {
		Object.keys(e.errors).length && I(!1);
	}, [e.errors]), D(() => C.on("preview-motion", () => w.emit("entry.preview")), []);
	let Y = k(J);
	Y.current = J, D(() => C.on("inspect", ({ node: e }) => Y.current(e)), []);
	let X = () => {
		t.select(null), I(!1);
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
		i && (t.insert(i.parentId, i.index, r), h(t, r[0], S(_(t.get().nodes, n, () => !1))), z(!1), G(""));
	};
	return /* @__PURE__ */ W("div", {
		className: "flex h-full min-h-0 flex-col",
		"data-block-workspace": !0,
		children: [
			e.toolbar && oe(/* @__PURE__ */ W(H, { children: [
				!s && (q ? /* @__PURE__ */ W(H, { children: [/* @__PURE__ */ U(P, {
					icon: "plus",
					label: E("Insert Block"),
					onClick: () => z(!0)
				}), /* @__PURE__ */ U(M, {
					open: R,
					onOpenChange: z,
					title: E("Insert Block"),
					children: /* @__PURE__ */ U(i, {
						className: "!max-h-none !w-full",
						types: [...n.values()],
						query: B,
						onQuery: G,
						onChoose: Q,
						onClose: () => z(!1),
						allowed: (e) => !!Z(e.name)
					})
				})] }) : /* @__PURE__ */ U(ne, {
					open: R,
					onOpenChange: z,
					align: "start",
					trigger: /* @__PURE__ */ U(P, {
						icon: "plus",
						label: E("Insert Block")
					}),
					className: "!p-0",
					children: /* @__PURE__ */ U(i, {
						types: [...n.values()],
						query: B,
						onQuery: G,
						onChoose: Q,
						onClose: () => z(!1),
						allowed: (e) => !!Z(e.name)
					})
				})),
				/* @__PURE__ */ U(P, {
					icon: "undo",
					label: E("Undo"),
					disabled: !y,
					onClick: t.undo
				}),
				/* @__PURE__ */ U(P, {
					icon: "redo",
					label: E("Redo"),
					disabled: !O,
					onClick: t.redo
				}),
				/* @__PURE__ */ U(he, {})
			] }), e.toolbar),
			/* @__PURE__ */ U(re, {
				title: E("Outline||structure"),
				backTo: e.listPath,
				backLabel: e.listLabel ?? e.collection.title,
				children: /* @__PURE__ */ U(ce, {})
			}),
			/* @__PURE__ */ W("div", {
				className: "flex min-h-0 flex-1",
				children: [/* @__PURE__ */ W("main", {
					id: V(e.bodyField),
					tabIndex: -1,
					"aria-label": e.bodyField.label,
					"aria-describedby": e.errors[e.bodyField.handle] ? `${V(e.bodyField)}-error` : void 0,
					className: "flex min-w-0 flex-1 flex-col outline-none",
					"data-editor-document": !0,
					children: [
						/* @__PURE__ */ U(b, {
							collection: e.collection.handle,
							blueprint: e.collection.blueprint,
							entryId: e.entry?.id,
							content: e.content,
							onTitleChange: ["templates", "components"].includes(e.collection.handle) ? void 0 : e.setTitle,
							onInspect: J
						}),
						e.errors[e.bodyField.handle] && /* @__PURE__ */ U("p", {
							id: `${V(e.bodyField)}-error`,
							role: "alert",
							className: "m-0 shrink-0 px-3 py-2 text-xs text-danger",
							children: e.errors[e.bodyField.handle]
						}),
						/* @__PURE__ */ U("div", {
							className: "max-h-[30vh] shrink-0 overflow-y-auto",
							children: e.footer
						})
					]
				}), /* @__PURE__ */ U(F, {
					sheet: !0,
					className: pe,
					open: e.sidebarOpen,
					onOpenChange: e.setSidebarOpen,
					title: N && l ? n.get(l.type)?.title ?? E("Block") : e.collection.singular,
					children: N && l ? g > 1 ? /* @__PURE__ */ W(H, { children: [/* @__PURE__ */ U(te, {
						title: T(g, "{count} block selected", "{count} blocks selected"),
						onBack: X,
						backLabel: e.collection.singular,
						onClose: () => e.setSidebarOpen(!1)
					}), !s && /* @__PURE__ */ U("div", {
						className: "px-2 py-3",
						children: /* @__PURE__ */ U(j, {
							variant: "destructive",
							size: "sm",
							icon: "trash",
							onClick: () => t.removeSelection(),
							children: E("Delete")
						})
					})] }) : /* @__PURE__ */ U(x, {
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
