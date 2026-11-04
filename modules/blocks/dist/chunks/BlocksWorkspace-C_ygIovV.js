import { _ as e, a as t, c as n, f as r, l as i, n as a, r as o, t as s } from "./insert-BKwjfSi5.js";
import { C as c, D as l, G as u, I as d, K as f, Q as p, V as m, at as h, et as g, it as _, nt as v, ot as y, rt as b, t as x, tt as S, z as C } from "./Inspector-DOg1LnxA.js";
import { events as w, plural as T, t as E, useScreenContext as D } from "@letterncms/sdk";
import { useEffect as O, useMemo as k, useRef as A, useState as j } from "react";
import { Button as M, Icon as N, IconButton as P, InspectorPanel as F, Menu as I, Popover as ee, QueryError as L, ScreenSidebar as te, Spinner as R, Tooltip as z, cn as B, fieldControlId as V, useScreenSidebar as H, useWideInspector as U } from "@letterncms/ui";
import { Fragment as W, jsx as G, jsxs as K } from "react/jsx-runtime";
import { createPortal as ne } from "react-dom";
import { DndContext as q, PointerSensor as J, closestCenter as Y, useSensor as X, useSensors as Z } from "@dnd-kit/core";
import { SortableContext as Q, useSortable as re, verticalListSortingStrategy as ie } from "@dnd-kit/sortable";
import { CSS as ae } from "@dnd-kit/utilities";
// admin/src/builder/Layers.tsx
function oe() {
	let { store: e, types: a, allowed: o, readOnly: c } = y(), l = S(e, (e) => e.nodes), u = S(e, (e) => e.selected), d = S(e, g), f = S(e, (e) => e.hovered), [p, m] = j({}), h = Z(X(J, { activationConstraint: { distance: 4 } }));
	O(() => {
		if (!u) return;
		let n = t(e.get().nodes, u).filter((e) => p[e.id]);
		n.length && m((e) => ({
			...e,
			...Object.fromEntries(n.map((e) => [e.id, !1]))
		})), document.querySelector(`[data-layer="${u}"]`)?.scrollIntoView({ block: "nearest" });
	}, [u]);
	let _ = k(() => ce(l, (e) => !!a.get(e.type)?.children || !!e.children?.length), [l, a]), v = i(l).filter(({ node: e }) => !t(l, e.id).some((e) => p[e.id]));
	return l.length === 0 ? /* @__PURE__ */ G("div", {
		className: "px-4 py-3",
		children: /* @__PURE__ */ G("p", {
			className: "m-0 text-sm text-muted",
			children: E("No elements yet")
		})
	}) : /* @__PURE__ */ G(q, {
		sensors: h,
		collisionDetection: Y,
		onDragEnd: (t) => {
			if (c || !t.over || t.active.id === t.over.id) return;
			let i = e.get().nodes, l = n(i, String(t.active.id)), u = n(i, String(t.over.id)), d = r(i, String(t.over.id)), f = r(i, String(t.active.id));
			if (!l || !u || !d || !f) return;
			if (a.get(u.type)?.children && !p[u.id] && s(u, l.type, a) && (u.children?.length ?? 0) === 0) return e.move(l.id, u.id, 0);
			let m = d.parentId ? n(i, d.parentId) : null;
			if (!s(m, l.type, a, m ? [] : o)) return;
			let h = f.parentId === d.parentId && f.index < d.index ? d.index + 1 : d.index;
			e.move(l.id, d.parentId, h);
		},
		children: /* @__PURE__ */ G(Q, {
			items: v.map((e) => e.node.id),
			strategy: ie,
			children: /* @__PURE__ */ G("div", {
				className: "space-y-px px-2 pb-3 pt-1",
				onMouseLeave: () => e.hover(null),
				children: v.map(({ node: e, depth: t }) => /* @__PURE__ */ G(le, {
					node: e,
					depth: t,
					selected: d.includes(e.id),
					hovered: f === e.id,
					collapsed: !!p[e.id],
					hint: _.get(e.id),
					onToggle: () => m((t) => ({
						...t,
						[e.id]: !t[e.id]
					}))
				}, e.id))
			})
		})
	});
}
function se(e, t) {
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
	return i.display === "grid" ? E("Grid") : i.display === "flex" || i.display === "inline-flex" ? /column/.test(String(i.flexDirection ?? "")) ? E("Stack") : E("Row") : t;
}
function $(t, n) {
	let r = e(t, n);
	if (r) return r;
	let i = String(t.bind?.text ?? "").replace(/[{}]/g, "").split("|")[0].trim().split(".").pop() ?? "";
	return i ? i.replace(/[_-]+/g, " ").replace(/^\w/, (e) => e.toUpperCase()) : "";
}
function ce(e, t) {
	let n = /* @__PURE__ */ new Map();
	for (let { node: r } of i(e)) {
		if (!t(r) || r.label || r.type === "pattern") continue;
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
function le({ node: e, depth: t, selected: n, hovered: r, collapsed: i, hint: a, onToggle: o }) {
	let { store: s, types: l, readOnly: d } = y(), f = l.get(e.type), { attributes: p, listeners: m, setNodeRef: g, transform: _, transition: v, isDragging: x } = re({
		id: e.id,
		disabled: d
	}), S = (e.children?.length ?? 0) > 0, C = h(), w = !!f?.children || S, T = e.type === "pattern" ? b(e, l, C) : e.label || (w ? se(e, f?.title ?? e.type) : $(e, 48) || f?.title || e.type), D = !e.label && e.type !== "pattern" && !w && !$(e, 48), [O, k] = j(!1), A = e.type === "pattern", M = [
		e.motion?.length && {
			icon: "b-magic-wand",
			title: E("Animated")
		},
		e.logic && {
			icon: "b-lightning",
			title: E("Interactive")
		},
		e.bind && Object.keys(e.bind).some((e) => e !== "visible" && e !== "hidden") && {
			icon: "b-database",
			title: E("Connected to Data")
		},
		(e.logic?.show || e.bind?.visible || e.bind?.hidden) && {
			icon: "b-eye-slash",
			title: e.logic?.show ? E("Shown when {condition}", { condition: e.logic.show }) : E("Shown conditionally")
		}
	].filter(Boolean);
	return /* @__PURE__ */ K("div", {
		ref: g,
		"data-layer": e.id,
		style: {
			transform: ae.Translate.toString(_),
			transition: v,
			paddingLeft: 4 + t * 12
		},
		...p,
		...m,
		onClick: (t) => {
			t.shiftKey ? s.extendTo(e.id) : s.select(e.id, !0), u.emit("scroll-to", { node: e.id });
		},
		onMouseEnter: () => s.hover(e.id),
		onKeyDown: (t) => {
			O || t.target !== t.currentTarget || (t.key === "Enter" || t.key === " " ? (t.preventDefault(), s.select(e.id, !0), u.emit("scroll-to", { node: e.id })) : !d && t.key === "F2" && (t.preventDefault(), k(!0)));
		},
		className: B("group relative flex h-7 cursor-default select-none items-center gap-1.5 rounded-md pr-1 text-sm outline-none focus-visible:shadow-[inset_0_0_0_1.5px_var(--cms-focus)]", n ? "bg-focus-soft text-ink" : r ? "bg-hover text-text" : "text-text", x && "z-10 bg-bg opacity-80 shadow-pop"),
		children: [
			/* @__PURE__ */ G("button", {
				type: "button",
				onClick: (e) => {
					e.stopPropagation(), o();
				},
				className: B("-mr-1 grid size-4 shrink-0 place-items-center rounded-xs text-faint hover:text-ink", !S && "invisible"),
				"aria-label": E(i ? "Expand" : "Collapse"),
				children: /* @__PURE__ */ G(N, {
					name: "b-caret-down",
					size: 10,
					className: B("transition-transform duration-120", i && "-rotate-90")
				})
			}),
			/* @__PURE__ */ G(N, {
				name: A ? "b-diamonds-four" : f?.icon ?? "square",
				size: 14,
				className: B("shrink-0", e.hidden ? "text-ghost" : n ? "text-ink" : A ? "text-muted" : "text-faint")
			}),
			O ? /* @__PURE__ */ G("div", {
				className: "min-w-0 flex-1",
				onClick: (e) => e.stopPropagation(),
				onPointerDown: (e) => e.stopPropagation(),
				onKeyDown: (e) => e.stopPropagation(),
				onKeyUp: (e) => e.key === "Escape" && e.target.blur(),
				onBlur: () => k(!1),
				children: /* @__PURE__ */ G(c, {
					bare: !0,
					fields: [{
						handle: "label",
						type: "text",
						size: "sm",
						commit: "blur",
						label: E("Layer Name"),
						autofocus: !0,
						placeholder: f?.title
					}],
					values: { label: e.label ?? "" },
					onChange: (t, n) => s.updateNode(e.id, { label: n.trim() || void 0 })
				})
			}) : /* @__PURE__ */ K("span", {
				onDoubleClick: (e) => {
					e.stopPropagation(), d || k(!0);
				},
				title: d ? void 0 : E("Double-Click to Rename"),
				className: B("min-w-0 flex-1 truncate", e.hidden ? "text-faint line-through decoration-faint/60" : D && "text-muted"),
				children: [T, a && /* @__PURE__ */ G("span", {
					className: B("ml-1.5", n ? "text-muted" : "text-faint"),
					children: a
				})]
			}),
			!O && M.map((e) => /* @__PURE__ */ G(z, {
				content: e.title,
				children: /* @__PURE__ */ G("span", {
					className: "grid size-5 shrink-0 place-items-center text-faint group-hover:hidden",
					children: /* @__PURE__ */ G(N, {
						name: e.icon,
						size: 12
					})
				})
			}, e.icon)),
			/* @__PURE__ */ G(z, {
				content: e.hidden ? E("Show") : E("Hide"),
				children: /* @__PURE__ */ G("button", {
					type: "button",
					disabled: d,
					onClick: (t) => {
						t.stopPropagation(), s.updateNode(e.id, { hidden: !e.hidden || void 0 });
					},
					onPointerDown: (e) => e.stopPropagation(),
					className: B("grid size-6 shrink-0 place-items-center rounded-sm text-faint hover:bg-hover hover:text-ink", e.hidden ? "grid" : "hidden group-hover:grid group-focus-visible:grid"),
					"aria-label": e.hidden ? E("Show") : E("Hide"),
					children: /* @__PURE__ */ G(N, {
						name: e.hidden ? "eye-off" : "eye",
						size: 14
					})
				})
			})
		]
	});
}
// admin/src/BlocksWorkspace.tsx
function ue(e) {
	let { catalog: t, types: n, isLoading: r, error: i, retry: a } = _(), o = e.bodyField.handle, s = p(e.values[o], (t) => e.setValue(o, t), !e.editable), c = A(e.values);
	c.current = e.values;
	let l = {
		kind: e.collection.handle === "templates" ? "template" : e.collection.handle === "components" ? "pattern" : "entry",
		id: e.entry?.id ?? "",
		collections: e.values.collections,
		props: e.values.props
	};
	return r ? /* @__PURE__ */ K("div", {
		className: "flex h-full min-h-0",
		children: [/* @__PURE__ */ G("div", {
			className: "grid min-w-0 flex-1 place-items-center",
			children: /* @__PURE__ */ G(R, {})
		}), /* @__PURE__ */ G(F, {
			open: e.sidebarOpen,
			onOpenChange: e.setSidebarOpen,
			title: e.collection.singular,
			children: e.sidebar
		})]
	}) : t ? /* @__PURE__ */ K(v, {
		value: {
			store: s,
			catalog: t,
			types: n,
			entryId: e.entry?.id ?? null,
			fieldHandle: o,
			allowed: e.bodyField.allowed ?? [],
			getValues: () => c.current,
			title: e.title,
			doc: l,
			readOnly: !e.editable
		},
		children: [i && /* @__PURE__ */ G(L, {
			message: i.message,
			onRetry: a,
			compact: !0
		}), /* @__PURE__ */ G(pe, { props: e })]
	}) : /* @__PURE__ */ G(L, {
		message: i?.message,
		onRetry: a
	});
}
var de = () => [
	{
		value: "base",
		label: E("Desktop"),
		icon: "b-monitor"
	},
	{
		value: "tablet",
		label: E("Tablet"),
		icon: "b-device-tablet"
	},
	{
		value: "mobile",
		label: E("Phone"),
		icon: "b-device-mobile"
	}
];
function fe() {
	let { store: e } = y(), t = S(e, (e) => e.breakpoint), n = de(), r = n.find((e) => e.value === t) ?? n[0];
	return /* @__PURE__ */ G(I, {
		align: "start",
		trigger: /* @__PURE__ */ G(P, {
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
function pe({ props: t }) {
	let { store: r, types: i, allowed: c, readOnly: p } = y(), h = S(r, (e) => e.selected ? n(e.nodes, e.selected) : null), _ = S(r, (e) => e.blockMode), v = S(r, (e) => g(e).length), b = S(r, () => r.canUndo()), k = S(r, () => r.canRedo()), [A, N] = j(!1), I = H(), [L, R] = j(!1), [z, B] = j(""), q = U(), J = S(r, g);
	O(() => {
		window.matchMedia("(max-width: 639px)").matches && r.setBreakpoint("mobile");
	}, [r]), D({ items: J.flatMap((t) => {
		let a = n(r.get().nodes, t);
		return a ? [{
			id: t,
			kind: "block",
			label: e(a, 40) || (i.get(a.type)?.title ?? E("Block")),
			icon: i.get(a.type)?.icon,
			read: () => n(r.get().nodes, t)
		}] : [];
	}) });
	let Y = (e) => {
		r.select(e, !0), N(!0), t.setSidebarOpen(!0);
	};
	O(() => {
		h && _ ? (N(!0), t.setSidebarOpen(!0), q || I.setOpen(!1)) : h && q && t.sidebarOpen && N(!0);
	}, [
		h?.id,
		_,
		q
	]), O(() => {
		t.sidebarOpen || N(!1);
	}, [t.sidebarOpen]), O(() => {
		Object.keys(t.errors).length && N(!1);
	}, [t.errors]), O(() => u.on("preview-motion", () => w.emit("entry.preview")), []);
	let X = () => {
		r.select(null), N(!1);
	}, Z = (e) => {
		let t = r.get(), a = t.selected ? n(t.nodes, t.selected) : null;
		return a && (Array.isArray(e) ? e : [e]).every((e) => s(a, e, i)) ? {
			parentId: a.id,
			index: a.children?.length ?? 0
		} : t.selected ? o(t.nodes, t.selected, e, i, c) : (Array.isArray(e) ? e : [e]).every((e) => s(null, e, i, c)) ? {
			parentId: null,
			index: t.nodes.length
		} : null;
	}, Q = (e) => {
		let t = a(e, i);
		if (!t.length) return;
		let n = Z(t.map((e) => e.type));
		n && (r.insert(n.parentId, n.index, t), m(r, t[0], C(d(r.get().nodes, i, () => !1))), R(!1), B(""));
	};
	return /* @__PURE__ */ K("div", {
		className: "flex h-full min-h-0 flex-col",
		"data-block-workspace": !0,
		children: [
			t.toolbar && ne(/* @__PURE__ */ K(W, { children: [
				!p && /* @__PURE__ */ G(ee, {
					open: L,
					onOpenChange: R,
					align: "start",
					trigger: /* @__PURE__ */ G(P, {
						icon: "plus",
						label: E("Insert block"),
						className: "max-sm:hidden"
					}),
					className: "!p-0",
					children: /* @__PURE__ */ G(f, {
						types: [...i.values()],
						query: z,
						onQuery: B,
						onChoose: Q,
						onClose: () => R(!1),
						allowed: (e) => !!Z(e.name)
					})
				}),
				/* @__PURE__ */ G(P, {
					icon: "undo",
					label: E("Undo"),
					disabled: !b,
					onClick: r.undo,
					className: "max-sm:hidden"
				}),
				/* @__PURE__ */ G(P, {
					icon: "redo",
					label: E("Redo"),
					disabled: !k,
					onClick: r.redo,
					className: "max-sm:hidden"
				}),
				/* @__PURE__ */ G(fe, {})
			] }), t.toolbar),
			/* @__PURE__ */ G(te, {
				title: E("Outline"),
				backTo: t.listPath,
				backLabel: t.listLabel ?? t.collection.title,
				children: /* @__PURE__ */ G(oe, {})
			}),
			/* @__PURE__ */ K("div", {
				className: "flex min-h-0 flex-1",
				children: [/* @__PURE__ */ K("main", {
					id: V(t.bodyField),
					tabIndex: -1,
					"aria-label": t.bodyField.label,
					"aria-describedby": t.errors[t.bodyField.handle] ? `${V(t.bodyField)}-error` : void 0,
					className: "flex min-w-0 flex-1 flex-col outline-none",
					"data-editor-document": !0,
					children: [
						/* @__PURE__ */ G(l, {
							collection: t.collection.handle,
							entryId: t.entry?.id,
							content: t.content,
							onTitleChange: ["templates", "components"].includes(t.collection.handle) ? void 0 : t.setTitle,
							onInspect: Y
						}),
						t.errors[t.bodyField.handle] && /* @__PURE__ */ G("p", {
							id: `${V(t.bodyField)}-error`,
							role: "alert",
							className: "m-0 shrink-0 px-3 py-2 text-xs text-danger",
							children: t.errors[t.bodyField.handle]
						}),
						/* @__PURE__ */ G("div", {
							className: "max-h-[30vh] shrink-0 overflow-y-auto",
							children: t.footer
						})
					]
				}), /* @__PURE__ */ G(F, {
					open: t.sidebarOpen,
					onOpenChange: t.setSidebarOpen,
					title: A && h ? i.get(h.type)?.title ?? E("Block") : t.collection.singular,
					children: A && h ? v > 1 ? /* @__PURE__ */ K(W, { children: [/* @__PURE__ */ K("div", {
						className: "flex h-12 shrink-0 items-center gap-1 border-b border-border pl-2 pr-3",
						children: [
							/* @__PURE__ */ G(P, {
								icon: "arrow-left",
								label: E("Back to {name}", { name: t.collection.singular }),
								size: "sm",
								onClick: X
							}),
							/* @__PURE__ */ G("span", {
								className: "min-w-0 flex-1 truncate pl-1 text-sm font-semibold text-ink",
								children: T(v, "{count} block selected", "{count} blocks selected")
							}),
							/* @__PURE__ */ G(P, {
								icon: "close",
								label: E("Close Panel"),
								size: "sm",
								onClick: () => t.setSidebarOpen(!1)
							})
						]
					}), !p && /* @__PURE__ */ G("div", {
						className: "px-2 py-3",
						children: /* @__PURE__ */ G(M, {
							variant: "ghost",
							size: "sm",
							icon: "trash",
							className: "text-danger",
							onClick: () => r.removeSelection(),
							children: E("Delete")
						})
					})] }) : /* @__PURE__ */ G(x, {
						node: h,
						onBack: X,
						backLabel: t.collection.singular,
						onClose: () => t.setSidebarOpen(!1)
					}) : t.sidebar
				})]
			})
		]
	});
}
export { ue as BlocksWorkspace };
