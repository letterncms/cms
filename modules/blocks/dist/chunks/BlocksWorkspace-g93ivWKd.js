import { $ as e, H as t, I as n, N as r, Q as i, R as a, U as o, Y as s, Z as c, b as l, et as u, nt as d, rt as f, t as p, tt as m, w as h } from "./Inspector-CxXGn_Y0.js";
import { _ as g, a as _, c as v, f as y, l as b, n as x, r as S, t as C } from "./insert-C2qFyCIH.js";
import { events as w, plural as T, t as E, useScreenContext as D } from "@letterncms/sdk";
import { useEffect as O, useMemo as k, useRef as A, useState as j } from "react";
import { Button as M, Icon as N, IconButton as P, InspectorPanel as F, Menu as I, Popover as ee, QueryError as L, ScreenSidebar as te, Spinner as R, Tooltip as z, cn as B, fieldControlId as V, useScreenSidebar as ne, useWideInspector as re } from "@letterncms/ui";
import { Fragment as H, jsx as U, jsxs as W } from "react/jsx-runtime";
import { createPortal as ie } from "react-dom";
import { DndContext as G, PointerSensor as K, closestCenter as q, useSensor as J, useSensors as Y } from "@dnd-kit/core";
import { SortableContext as X, useSortable as Z, verticalListSortingStrategy as Q } from "@dnd-kit/sortable";
import { CSS as ae } from "@dnd-kit/utilities";
// admin/src/builder/Layers.tsx
function oe() {
	let { store: e, types: t, allowed: n, readOnly: r } = f(), a = i(e, (e) => e.nodes), o = i(e, (e) => e.selected), s = i(e, c), l = i(e, (e) => e.hovered), [u, d] = j({}), p = Y(J(K, { activationConstraint: { distance: 4 } }));
	O(() => {
		if (!o) return;
		let t = _(e.get().nodes, o).filter((e) => u[e.id]);
		t.length && d((e) => ({
			...e,
			...Object.fromEntries(t.map((e) => [e.id, !1]))
		})), document.querySelector(`[data-layer="${o}"]`)?.scrollIntoView({ block: "nearest" });
	}, [o]);
	let m = k(() => ce(a, (e) => !!t.get(e.type)?.children || !!e.children?.length), [a, t]), h = b(a).filter(({ node: e }) => !_(a, e.id).some((e) => u[e.id]));
	return a.length === 0 ? /* @__PURE__ */ U("div", {
		className: "px-4 py-3",
		children: /* @__PURE__ */ U("p", {
			className: "m-0 text-sm text-muted",
			children: E("No elements yet")
		})
	}) : /* @__PURE__ */ U(G, {
		sensors: p,
		collisionDetection: q,
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
		children: /* @__PURE__ */ U(X, {
			items: h.map((e) => e.node.id),
			strategy: Q,
			children: /* @__PURE__ */ U("div", {
				className: "space-y-px px-2 pb-3 pt-1",
				onMouseLeave: () => e.hover(null),
				children: h.map(({ node: e, depth: t }) => /* @__PURE__ */ U(le, {
					node: e,
					depth: t,
					selected: s.includes(e.id),
					hovered: l === e.id,
					collapsed: !!u[e.id],
					hint: m.get(e.id),
					onToggle: () => d((t) => ({
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
function $(e, t) {
	let n = g(e, t);
	if (n) return n;
	let r = String(e.bind?.text ?? "").replace(/[{}]/g, "").split("|")[0].trim().split(".").pop() ?? "";
	return r ? r.replace(/[_-]+/g, " ").replace(/^\w/, (e) => e.toUpperCase()) : "";
}
function ce(e, t) {
	let n = /* @__PURE__ */ new Map();
	for (let { node: r } of b(e)) {
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
function le({ node: e, depth: n, selected: r, hovered: i, collapsed: a, hint: o, onToggle: s }) {
	let { store: c, types: p, readOnly: m } = f(), h = p.get(e.type), { attributes: g, listeners: _, setNodeRef: v, transform: y, transition: b, isDragging: x } = Z({
		id: e.id,
		disabled: m
	}), S = (e.children?.length ?? 0) > 0, C = d(), w = !!h?.children || S, T = e.type === "pattern" ? u(e, p, C) : e.label || (w ? se(e, h?.title ?? e.type) : $(e, 48) || h?.title || e.type), D = !e.label && e.type !== "pattern" && !w && !$(e, 48), [O, k] = j(!1), A = e.type === "pattern", M = [
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
	return /* @__PURE__ */ W("div", {
		ref: v,
		"data-layer": e.id,
		style: {
			transform: ae.Translate.toString(y),
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
		className: B("group relative flex h-7 cursor-default select-none items-center gap-1.5 rounded-md pr-1 text-sm outline-none focus-visible:shadow-[inset_0_0_0_1.5px_var(--cms-focus)]", r ? "bg-focus-soft text-ink" : i ? "bg-hover text-text" : "text-text", x && "z-10 bg-bg opacity-80 shadow-pop"),
		children: [
			/* @__PURE__ */ U("button", {
				type: "button",
				onClick: (e) => {
					e.stopPropagation(), s();
				},
				className: B("-mr-1 grid size-4 shrink-0 place-items-center rounded-xs text-faint hover:text-ink", !S && "invisible"),
				"aria-label": E(a ? "Expand" : "Collapse"),
				children: /* @__PURE__ */ U(N, {
					name: "b-caret-down",
					size: 10,
					className: B("transition-transform duration-120", a && "-rotate-90")
				})
			}),
			/* @__PURE__ */ U(N, {
				name: A ? "b-diamonds-four" : h?.icon ?? "square",
				size: 14,
				className: B("shrink-0", e.hidden ? "text-ghost" : r ? "text-ink" : A ? "text-muted" : "text-faint")
			}),
			O ? /* @__PURE__ */ U("div", {
				className: "min-w-0 flex-1",
				onClick: (e) => e.stopPropagation(),
				onPointerDown: (e) => e.stopPropagation(),
				onKeyDown: (e) => e.stopPropagation(),
				onKeyUp: (e) => e.key === "Escape" && e.target.blur(),
				onBlur: () => k(!1),
				children: /* @__PURE__ */ U(l, {
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
			}) : /* @__PURE__ */ W("span", {
				onDoubleClick: (e) => {
					e.stopPropagation(), m || k(!0);
				},
				title: m ? void 0 : E("Double-Click to Rename"),
				className: B("min-w-0 flex-1 truncate", e.hidden ? "text-faint line-through decoration-faint/60" : D && "text-muted"),
				children: [T, o && /* @__PURE__ */ U("span", {
					className: B("ml-1.5", r ? "text-muted" : "text-faint"),
					children: o
				})]
			}),
			!O && M.map((e) => /* @__PURE__ */ U(z, {
				content: e.title,
				children: /* @__PURE__ */ U("span", {
					className: "grid size-5 shrink-0 place-items-center text-faint group-hover:hidden",
					children: /* @__PURE__ */ U(N, {
						name: e.icon,
						size: 12
					})
				})
			}, e.icon)),
			/* @__PURE__ */ U(z, {
				content: e.hidden ? E("Show") : E("Hide"),
				children: /* @__PURE__ */ U("button", {
					type: "button",
					disabled: m,
					onClick: (t) => {
						t.stopPropagation(), c.updateNode(e.id, { hidden: !e.hidden || void 0 });
					},
					onPointerDown: (e) => e.stopPropagation(),
					className: B("grid size-6 shrink-0 place-items-center rounded-sm text-faint hover:bg-hover hover:text-ink", e.hidden ? "grid" : "hidden group-hover:grid group-focus-visible:grid"),
					"aria-label": e.hidden ? E("Show") : E("Hide"),
					children: /* @__PURE__ */ U(N, {
						name: e.hidden ? "eye-off" : "eye",
						size: 14
					})
				})
			})
		]
	});
}
// admin/src/BlocksWorkspace.tsx
function ue(t) {
	let { catalog: n, types: r, isLoading: i, error: a, retry: o } = m(), c = t.bodyField.handle, l = s(t.values[c], (e) => t.setValue(c, e), !t.editable), u = A(t.values);
	u.current = t.values;
	let d = {
		kind: t.collection.handle === "templates" ? "template" : t.collection.handle === "components" ? "pattern" : "entry",
		id: t.entry?.id ?? "",
		collections: t.values.collections,
		props: t.values.props
	};
	return i ? /* @__PURE__ */ W("div", {
		className: "flex h-full min-h-0",
		children: [/* @__PURE__ */ U("div", {
			className: "grid min-w-0 flex-1 place-items-center",
			children: /* @__PURE__ */ U(R, {})
		}), /* @__PURE__ */ U(F, {
			open: t.sidebarOpen,
			onOpenChange: t.setSidebarOpen,
			title: t.collection.singular,
			children: t.sidebar
		})]
	}) : n ? /* @__PURE__ */ W(e, {
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
		children: [a && /* @__PURE__ */ U(L, {
			message: a.message,
			onRetry: o,
			compact: !0
		}), /* @__PURE__ */ U(pe, { props: t })]
	}) : /* @__PURE__ */ U(L, {
		message: a?.message,
		onRetry: o
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
	let { store: e } = f(), t = i(e, (e) => e.breakpoint), n = de(), r = n.find((e) => e.value === t) ?? n[0];
	return /* @__PURE__ */ U(I, {
		align: "start",
		trigger: /* @__PURE__ */ U(P, {
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
function pe({ props: e }) {
	let { store: s, types: l, allowed: u, readOnly: d } = f(), m = i(s, (e) => e.selected ? v(e.nodes, e.selected) : null), _ = i(s, (e) => e.blockMode), y = i(s, (e) => c(e).length), b = i(s, () => s.canUndo()), k = i(s, () => s.canRedo()), [N, I] = j(!1), L = ne(), [R, z] = j(!1), [B, G] = j(""), K = re(), q = i(s, c);
	O(() => {
		window.matchMedia("(max-width: 639px)").matches && s.setBreakpoint("mobile");
	}, [s]), D({ items: q.flatMap((e) => {
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
		s.select(t, !0), I(!0), e.setSidebarOpen(!0);
	};
	O(() => {
		m && _ ? (I(!0), e.setSidebarOpen(!0), K || L.setOpen(!1)) : m && K && e.sidebarOpen && I(!0);
	}, [
		m?.id,
		_,
		K
	]), O(() => {
		e.sidebarOpen || I(!1);
	}, [e.sidebarOpen]), O(() => {
		Object.keys(e.errors).length && I(!1);
	}, [e.errors]), O(() => t.on("preview-motion", () => w.emit("entry.preview")), []);
	let Y = A(J);
	Y.current = J, O(() => t.on("inspect", ({ node: e }) => Y.current(e)), []);
	let X = () => {
		s.select(null), I(!1);
	}, Z = (e) => {
		let t = s.get(), n = t.selected ? v(t.nodes, t.selected) : null;
		return n && (Array.isArray(e) ? e : [e]).every((e) => C(n, e, l)) ? {
			parentId: n.id,
			index: n.children?.length ?? 0
		} : t.selected ? S(t.nodes, t.selected, e, l, u) : (Array.isArray(e) ? e : [e]).every((e) => C(null, e, l, u)) ? {
			parentId: null,
			index: t.nodes.length
		} : null;
	}, Q = (e) => {
		let t = x(e, l);
		if (!t.length) return;
		let i = Z(t.map((e) => e.type));
		i && (s.insert(i.parentId, i.index, t), a(s, t[0], n(r(s.get().nodes, l, () => !1))), z(!1), G(""));
	};
	return /* @__PURE__ */ W("div", {
		className: "flex h-full min-h-0 flex-col",
		"data-block-workspace": !0,
		children: [
			e.toolbar && ie(/* @__PURE__ */ W(H, { children: [
				!d && /* @__PURE__ */ U(ee, {
					open: R,
					onOpenChange: z,
					align: "start",
					trigger: /* @__PURE__ */ U(P, {
						icon: "plus",
						label: E("Insert block"),
						className: "max-sm:hidden"
					}),
					className: "!p-0",
					children: /* @__PURE__ */ U(o, {
						types: [...l.values()],
						query: B,
						onQuery: G,
						onChoose: Q,
						onClose: () => z(!1),
						allowed: (e) => !!Z(e.name)
					})
				}),
				/* @__PURE__ */ U(P, {
					icon: "undo",
					label: E("Undo"),
					disabled: !b,
					onClick: s.undo,
					className: "max-sm:hidden"
				}),
				/* @__PURE__ */ U(P, {
					icon: "redo",
					label: E("Redo"),
					disabled: !k,
					onClick: s.redo,
					className: "max-sm:hidden"
				}),
				/* @__PURE__ */ U(fe, {})
			] }), e.toolbar),
			/* @__PURE__ */ U(te, {
				title: E("Outline"),
				backTo: e.listPath,
				backLabel: e.listLabel ?? e.collection.title,
				children: /* @__PURE__ */ U(oe, {})
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
						/* @__PURE__ */ U(h, {
							collection: e.collection.handle,
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
					open: e.sidebarOpen,
					onOpenChange: e.setSidebarOpen,
					title: N && m ? l.get(m.type)?.title ?? E("Block") : e.collection.singular,
					children: N && m ? y > 1 ? /* @__PURE__ */ W(H, { children: [/* @__PURE__ */ W("div", {
						className: "flex h-12 shrink-0 items-center gap-1 border-b border-border pl-2 pr-3",
						children: [
							/* @__PURE__ */ U(P, {
								icon: "arrow-left",
								label: E("Back to {name}", { name: e.collection.singular }),
								size: "sm",
								onClick: X
							}),
							/* @__PURE__ */ U("span", {
								className: "min-w-0 flex-1 truncate pl-1 text-sm font-semibold text-ink",
								children: T(y, "{count} block selected", "{count} blocks selected")
							}),
							/* @__PURE__ */ U(P, {
								icon: "close",
								label: E("Close Panel"),
								size: "sm",
								onClick: () => e.setSidebarOpen(!1)
							})
						]
					}), !d && /* @__PURE__ */ U("div", {
						className: "px-2 py-3",
						children: /* @__PURE__ */ U(M, {
							variant: "ghost",
							size: "sm",
							icon: "trash",
							className: "text-danger",
							onClick: () => s.removeSelection(),
							children: E("Delete")
						})
					})] }) : /* @__PURE__ */ U(p, {
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
export { ue as BlocksWorkspace };
