import { $ as e, H as t, I as n, N as r, Q as i, R as a, U as o, Y as s, Z as c, b as l, et as u, nt as d, rt as f, t as p, tt as m, w as h } from "./Inspector-DK0NlwEG.js";
import { _ as g, a as _, c as v, f as y, i as b, l as x, n as S, t as C } from "./insert-Biw2VMgl.js";
import { events as w, plural as T, t as E, useScreenContext as D } from "@letterncms/sdk";
import { useEffect as O, useMemo as k, useRef as A, useState as j } from "react";
import { Button as M, Dialog as N, Icon as P, IconButton as F, InspectorPanel as I, Menu as L, PanelHeader as ee, Popover as te, QueryError as R, ScreenSidebar as ne, Spinner as z, Tooltip as B, cn as V, fieldControlId as H, useScreenSidebar as re, useWideInspector as ie } from "@letterncms/ui";
import { Fragment as U, jsx as W, jsxs as G } from "react/jsx-runtime";
import { createPortal as ae } from "react-dom";
import { DndContext as K, PointerSensor as q, closestCenter as oe, useSensor as se, useSensors as J } from "@dnd-kit/core";
import { SortableContext as Y, useSortable as X, verticalListSortingStrategy as Z } from "@dnd-kit/sortable";
import { CSS as Q } from "@dnd-kit/utilities";
// admin/src/builder/Layers.tsx
function ce() {
	let { store: e, types: t, allowed: n, readOnly: r } = f(), a = i(e, (e) => e.nodes), o = i(e, (e) => e.selected), s = i(e, c), l = i(e, (e) => e.hovered), [u, d] = j({}), p = J(se(q, { activationConstraint: { distance: 4 } }));
	O(() => {
		if (!o) return;
		let t = _(e.get().nodes, o).filter((e) => u[e.id]);
		t.length && d((e) => ({
			...e,
			...Object.fromEntries(t.map((e) => [e.id, !1]))
		})), document.querySelector(`[data-layer="${o}"]`)?.scrollIntoView({ block: "nearest" });
	}, [o]);
	let m = k(() => ue(a, (e) => !!t.get(e.type)?.children || !!e.children?.length), [a, t]), h = x(a).filter(({ node: e }) => !_(a, e.id).some((e) => u[e.id]));
	return a.length === 0 ? /* @__PURE__ */ W("div", {
		className: "px-4 py-3",
		children: /* @__PURE__ */ W("p", {
			className: "m-0 text-sm text-muted",
			children: E("No elements yet")
		})
	}) : /* @__PURE__ */ W(K, {
		sensors: p,
		collisionDetection: oe,
		onDragEnd: (i) => {
			if (r || !i.over || i.active.id === i.over.id) return;
			let a = e.get().nodes, o = v(a, String(i.active.id)), s = v(a, String(i.over.id)), c = y(a, String(i.over.id)), l = y(a, String(i.active.id));
			if (!o || !s || !c || !l) return;
			if (t.get(s.type)?.children && !u[s.id] && C(s, o.type, t) && (s.children?.length ?? 0) === 0) return e.move(o.id, s.id, 0);
			let d = c.parentId ? v(a, c.parentId) : null;
			if (!C(d, o.type, t, d ? [] : n)) return;
			let f = l.parentId === c.parentId && l.index < c.index ? c.index + 1 : c.index;
			e.move(o.id, c.parentId, f);
		},
		children: /* @__PURE__ */ W(Y, {
			items: h.map((e) => e.node.id),
			strategy: Z,
			children: /* @__PURE__ */ W("div", {
				className: "space-y-px px-2 pb-3 pt-1",
				onMouseLeave: () => e.hover(null),
				children: h.map(({ node: e, depth: t }) => /* @__PURE__ */ W(de, {
					node: e,
					depth: t,
					selected: s.includes(e.id),
					hovered: l === e.id,
					collapsed: !!u[e.id],
					hint: u[e.id] || !e.children?.length ? m.get(e.id) : void 0,
					onToggle: () => d((t) => ({
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
	let i = e.style?.base ?? {};
	return i.display === "grid" ? E("Grid") : i.display === "flex" || i.display === "inline-flex" ? /column/.test(String(i.flexDirection ?? "")) ? E("Stack") : E("Row||layout") : t;
}
function $(e, t) {
	let n = g(e, t);
	if (n) return n;
	let r = String(e.bind?.text ?? "").replace(/[{}]/g, "").split("|")[0].trim().split(".").pop() ?? "";
	return r ? r.replace(/[_-]+/g, " ").replace(/^\w/, (e) => e.toUpperCase()) : "";
}
function ue(e, t) {
	let n = /* @__PURE__ */ new Map();
	for (let { node: r } of x(e)) {
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
function de({ node: e, depth: n, selected: r, hovered: i, collapsed: a, hint: o, onToggle: s }) {
	let { store: c, types: p, readOnly: m } = f(), h = p.get(e.type), { attributes: g, listeners: _, setNodeRef: v, transform: y, transition: b, isDragging: x } = X({
		id: e.id,
		disabled: m
	}), S = (e.children?.length ?? 0) > 0, C = d(), w = !!h?.children || S, T = e.type === "component" ? u(e, p, C) : e.label || (w ? le(e, h?.title ?? e.type) : $(e, 48) || h?.title || e.type), D = !e.label && e.type !== "component" && !w && !$(e, 48), [O, k] = j(!1), A = e.type === "component", M = [
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
	].filter(Boolean), N = /* @__PURE__ */ G("span", {
		onDoubleClick: (e) => {
			e.stopPropagation(), m || k(!0);
		},
		title: m || M.length ? void 0 : E("Double-Click to Rename"),
		className: V("min-w-0 flex-1 truncate", e.hidden ? "text-faint line-through decoration-faint/60" : D && "text-muted"),
		children: [T, o && /* @__PURE__ */ W("span", {
			className: V("ml-1.5", r ? "text-muted" : "text-faint"),
			children: o
		})]
	}), I = M.length ? /* @__PURE__ */ W(B, {
		content: /* @__PURE__ */ W("span", {
			className: "grid gap-1",
			children: M.map((e) => /* @__PURE__ */ G("span", {
				className: "flex items-center gap-1.5",
				children: [/* @__PURE__ */ W(P, {
					name: e.icon,
					size: 12
				}), e.title]
			}, e.icon))
		}),
		children: N
	}) : N;
	return /* @__PURE__ */ G("div", {
		ref: v,
		"data-layer": e.id,
		style: {
			transform: Q.Translate.toString(y),
			transition: b,
			paddingLeft: 4 + n * 12
		},
		...g,
		..._,
		onClick: (n) => {
			n.shiftKey ? c.extendTo(e.id) : t.emit("inspect", { node: e.id }), t.emit("scroll-to", { node: e.id });
		},
		onMouseEnter: () => c.hover(e.id),
		onKeyDown: (n) => {
			O || n.target !== n.currentTarget || (n.key === "Enter" || n.key === " " ? (n.preventDefault(), t.emit("inspect", { node: e.id }), t.emit("scroll-to", { node: e.id })) : !m && n.key === "F2" && (n.preventDefault(), k(!0)));
		},
		className: V("group relative flex h-7 pointer-coarse:h-10 cursor-default select-none items-center gap-1.5 rounded-md pr-1 text-sm -outline-offset-2", r ? "bg-focus-soft text-ink" : i ? "bg-hover text-text" : "text-text", x && "z-drag bg-bg opacity-80 shadow-pop"),
		children: [
			/* @__PURE__ */ W(F, {
				icon: "chevron-down",
				size: "xs",
				label: E(a ? "Expand" : "Collapse"),
				title: void 0,
				onClick: (e) => {
					e.stopPropagation(), s();
				},
				className: V("-mr-1 !size-4 !bg-transparent !text-faint hover:!text-ink [&_svg]:size-2.5 [&_svg]:transition-transform [&_svg]:duration-fast", a && "[&_svg]:-rotate-90", !S && "invisible")
			}),
			/* @__PURE__ */ W(P, {
				name: A ? "symbol" : h?.icon ?? "square",
				size: 14,
				className: V("shrink-0", e.hidden ? "text-ghost" : r ? "text-ink" : A ? "text-muted" : "text-faint")
			}),
			O ? /* @__PURE__ */ W("div", {
				className: "min-w-0 flex-1",
				onClick: (e) => e.stopPropagation(),
				onPointerDown: (e) => e.stopPropagation(),
				onKeyDown: (e) => e.stopPropagation(),
				onKeyUp: (e) => e.key === "Escape" && e.target.blur(),
				onBlur: () => k(!1),
				children: /* @__PURE__ */ W(l, {
					bare: !0,
					fields: [{
						handle: "label",
						type: "text",
						size: "sm",
						commit: "blur",
						label: E("Layer Name"),
						autofocus: !0,
						placeholder: h?.title
					}],
					values: { label: e.label ?? "" },
					onChange: (t, n) => c.updateNode(e.id, { label: n.trim() || void 0 })
				})
			}) : I,
			!O && M.map((e) => /* @__PURE__ */ W("span", {
				role: "img",
				"aria-label": e.title,
				className: "grid size-5 shrink-0 place-items-center text-faint group-hover:hidden group-focus-visible:hidden",
				children: /* @__PURE__ */ W(P, {
					name: e.icon,
					size: 12
				})
			}, e.icon)),
			/* @__PURE__ */ W("span", {
				className: e.hidden ? "contents" : "hidden group-hover:contents group-focus-visible:contents [@media(hover:none)]:contents",
				children: /* @__PURE__ */ W(B, {
					content: e.hidden ? E("Show") : E("Hide"),
					children: /* @__PURE__ */ W(F, {
						icon: e.hidden ? "eye-off" : "eye",
						size: "xs",
						label: e.hidden ? E("Show") : E("Hide"),
						title: void 0,
						disabled: m,
						onClick: (t) => {
							t.stopPropagation(), c.updateNode(e.id, { hidden: !e.hidden || void 0 });
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
	let { catalog: n, types: r, isLoading: i, error: a, retry: o } = m(), c = t.bodyField.handle, l = s(t.values[c], (e) => t.setValue(c, e), !t.editable), u = A(t.values);
	u.current = t.values;
	let d = {
		kind: t.collection.handle === "templates" ? "template" : t.collection.handle === "components" ? "component" : "entry",
		id: t.entry?.id ?? "",
		collections: t.values.collections,
		props: t.values.props
	};
	return i ? /* @__PURE__ */ G("div", {
		className: "flex h-full min-h-0",
		children: [/* @__PURE__ */ W("div", {
			className: "grid min-w-0 flex-1 place-items-center",
			children: /* @__PURE__ */ W(z, {})
		}), /* @__PURE__ */ W(I, {
			sheet: !0,
			className: pe,
			open: t.sidebarOpen,
			onOpenChange: t.setSidebarOpen,
			title: t.collection.singular,
			children: t.sidebar
		})]
	}) : n ? /* @__PURE__ */ G(e, {
		value: {
			store: l,
			catalog: n,
			types: r,
			entryId: t.entry?.id ?? null,
			fieldHandle: c,
			allowed: t.bodyField.allowed ?? [],
			getValues: () => u.current,
			title: t.title,
			doc: d,
			readOnly: !t.editable
		},
		children: [a && /* @__PURE__ */ W(R, {
			message: a.message,
			onRetry: o,
			compact: !0
		}), /* @__PURE__ */ W(ge, { props: t })]
	}) : /* @__PURE__ */ W(R, {
		message: a?.message,
		onRetry: o
	});
}
var pe = "cms-block-sheet", me = () => [
	{
		value: "base",
		label: E("Desktop"),
		icon: "monitor"
	},
	{
		value: "tablet",
		label: E("Tablet"),
		icon: "tablet"
	},
	{
		value: "mobile",
		label: E("Phone"),
		icon: "phone"
	}
];
function he() {
	let { store: e } = f(), t = i(e, (e) => e.breakpoint), n = me(), r = n.find((e) => e.value === t) ?? n[0];
	return /* @__PURE__ */ W(L, {
		align: "start",
		trigger: /* @__PURE__ */ W(F, {
			icon: r.icon,
			label: `${E("Screen")}: ${r.label}`,
			active: t !== "base",
			className: "max-sm:hidden"
		}),
		items: n.map((n) => ({
			label: n.label,
			icon: n.icon,
			checked: n.value === t,
			onSelect: () => e.setBreakpoint(n.value)
		}))
	});
}
function ge({ props: e }) {
	let { store: s, types: l, allowed: u, readOnly: d } = f(), m = i(s, (e) => e.selected ? v(e.nodes, e.selected) : null), _ = i(s, (e) => e.blockMode), y = i(s, (e) => c(e).length), x = i(s, () => s.canUndo()), k = i(s, () => s.canRedo()), [P, L] = j(!1), R = re(), [z, B] = j(!1), [V, K] = j(""), q = ie(), [oe] = j(() => window.matchMedia("(max-width: 639px)").matches), se = i(s, c);
	O(() => {
		window.matchMedia("(max-width: 639px)").matches && s.setBreakpoint("mobile");
	}, [s]), D({ items: se.flatMap((e) => {
		let t = v(s.get().nodes, e);
		return t ? [{
			id: e,
			kind: "block",
			label: g(t, 40) || (l.get(t.type)?.title ?? E("Block")),
			icon: l.get(t.type)?.icon,
			read: () => v(s.get().nodes, e)
		}] : [];
	}) });
	let J = (t) => {
		s.select(t, !0), L(!0), e.setSidebarOpen(!0);
	};
	O(() => {
		m && _ ? (L(!0), e.setSidebarOpen(!0), q || R.setOpen(!1)) : m && q && e.sidebarOpen && L(!0);
	}, [
		m?.id,
		_,
		q
	]), O(() => {
		e.sidebarOpen ? !q && s.get().selected && (L(!0), window.matchMedia("(max-width: 639px)").matches && t.emit("scroll-to", {
			node: s.get().selected,
			top: !0
		})) : L(!1);
	}, [e.sidebarOpen]), O(() => {
		Object.keys(e.errors).length && L(!1);
	}, [e.errors]), O(() => t.on("preview-motion", () => w.emit("entry.preview")), []);
	let Y = A(J);
	Y.current = J, O(() => t.on("inspect", ({ node: e }) => Y.current(e)), []);
	let X = () => {
		s.select(null), L(!1);
	}, Z = (e) => {
		let t = s.get(), n = t.selected ? v(t.nodes, t.selected) : null;
		return n && (Array.isArray(e) ? e : [e]).every((e) => C(n, e, l)) ? {
			parentId: n.id,
			index: n.children?.length ?? 0
		} : t.selected ? b(t.nodes, t.selected, e, l, u) : (Array.isArray(e) ? e : [e]).every((e) => C(null, e, l, u)) ? {
			parentId: null,
			index: t.nodes.length
		} : null;
	}, Q = (e) => {
		let t = S(e, l);
		if (!t.length) return;
		let i = Z(t.map((e) => e.type));
		i && (s.insert(i.parentId, i.index, t), a(s, t[0], n(r(s.get().nodes, l, () => !1))), B(!1), K(""));
	};
	return /* @__PURE__ */ G("div", {
		className: "flex h-full min-h-0 flex-col",
		"data-block-workspace": !0,
		children: [
			e.toolbar && ae(/* @__PURE__ */ G(U, { children: [
				!d && (oe ? /* @__PURE__ */ G(U, { children: [/* @__PURE__ */ W(F, {
					icon: "plus",
					label: E("Insert Block"),
					onClick: () => B(!0)
				}), /* @__PURE__ */ W(N, {
					open: z,
					onOpenChange: B,
					title: E("Insert Block"),
					children: /* @__PURE__ */ W(o, {
						className: "!max-h-none !w-full",
						types: [...l.values()],
						query: V,
						onQuery: K,
						onChoose: Q,
						onClose: () => B(!1),
						allowed: (e) => !!Z(e.name)
					})
				})] }) : /* @__PURE__ */ W(te, {
					open: z,
					onOpenChange: B,
					align: "start",
					trigger: /* @__PURE__ */ W(F, {
						icon: "plus",
						label: E("Insert Block")
					}),
					className: "!p-0",
					children: /* @__PURE__ */ W(o, {
						types: [...l.values()],
						query: V,
						onQuery: K,
						onChoose: Q,
						onClose: () => B(!1),
						allowed: (e) => !!Z(e.name)
					})
				})),
				/* @__PURE__ */ W(F, {
					icon: "undo",
					label: E("Undo"),
					disabled: !x,
					onClick: s.undo
				}),
				/* @__PURE__ */ W(F, {
					icon: "redo",
					label: E("Redo"),
					disabled: !k,
					onClick: s.redo
				}),
				/* @__PURE__ */ W(he, {})
			] }), e.toolbar),
			/* @__PURE__ */ W(ne, {
				title: E("Outline||structure"),
				backTo: e.listPath,
				backLabel: e.listLabel ?? e.collection.title,
				children: /* @__PURE__ */ W(ce, {})
			}),
			/* @__PURE__ */ G("div", {
				className: "flex min-h-0 flex-1",
				children: [/* @__PURE__ */ G("main", {
					id: H(e.bodyField),
					tabIndex: -1,
					"aria-label": e.bodyField.label,
					"aria-describedby": e.errors[e.bodyField.handle] ? `${H(e.bodyField)}-error` : void 0,
					className: "flex min-w-0 flex-1 flex-col outline-none",
					"data-editor-document": !0,
					children: [
						/* @__PURE__ */ W(h, {
							collection: e.collection.handle,
							blueprint: e.collection.blueprint,
							entryId: e.entry?.id,
							content: e.content,
							onTitleChange: ["templates", "components"].includes(e.collection.handle) ? void 0 : e.setTitle,
							onInspect: J
						}),
						e.errors[e.bodyField.handle] && /* @__PURE__ */ W("p", {
							id: `${H(e.bodyField)}-error`,
							role: "alert",
							className: "m-0 shrink-0 px-3 py-2 text-xs text-danger",
							children: e.errors[e.bodyField.handle]
						}),
						/* @__PURE__ */ W("div", {
							className: "max-h-[30vh] shrink-0 overflow-y-auto",
							children: e.footer
						})
					]
				}), /* @__PURE__ */ W(I, {
					sheet: !0,
					className: pe,
					open: e.sidebarOpen,
					onOpenChange: e.setSidebarOpen,
					title: P && m ? l.get(m.type)?.title ?? E("Block") : e.collection.singular,
					children: P && m ? y > 1 ? /* @__PURE__ */ G(U, { children: [/* @__PURE__ */ W(ee, {
						title: T(y, "{count} block selected", "{count} blocks selected"),
						onBack: X,
						backLabel: e.collection.singular,
						onClose: () => e.setSidebarOpen(!1)
					}), !d && /* @__PURE__ */ W("div", {
						className: "px-2 py-3",
						children: /* @__PURE__ */ W(M, {
							variant: "destructive",
							size: "sm",
							icon: "trash",
							onClick: () => s.removeSelection(),
							children: E("Delete")
						})
					})] }) : /* @__PURE__ */ W(p, {
						node: m,
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
