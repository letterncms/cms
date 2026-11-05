import { $ as e, C as t, F as n, H as r, J as i, L as a, M as o, Q as s, V as c, X as l, Z as u, et as d, nt as f, t as p, tt as m, y as h } from "./Inspector-BAUn7uad.js";
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
	let { store: e, types: t, allowed: n, readOnly: r } = f(), i = u(e, (e) => e.nodes), a = u(e, (e) => e.selected), o = u(e, l), s = u(e, (e) => e.hovered), [c, d] = j({}), p = Y(J(K, { activationConstraint: { distance: 4 } }));
	O(() => {
		if (!a) return;
		let t = _(e.get().nodes, a).filter((e) => c[e.id]);
		t.length && d((e) => ({
			...e,
			...Object.fromEntries(t.map((e) => [e.id, !1]))
		})), document.querySelector(`[data-layer="${a}"]`)?.scrollIntoView({ block: "nearest" });
	}, [a]);
	let m = k(() => ce(i, (e) => !!t.get(e.type)?.children || !!e.children?.length), [i, t]), h = b(i).filter(({ node: e }) => !_(i, e.id).some((e) => c[e.id]));
	return i.length === 0 ? /* @__PURE__ */ U("div", {
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
			let a = e.get().nodes, o = v(a, String(i.active.id)), s = v(a, String(i.over.id)), l = y(a, String(i.over.id)), u = y(a, String(i.active.id));
			if (!o || !s || !l || !u) return;
			if (t.get(s.type)?.children && !c[s.id] && C(s, o.type, t) && (s.children?.length ?? 0) === 0) return e.move(o.id, s.id, 0);
			let d = l.parentId ? v(a, l.parentId) : null;
			if (!C(d, o.type, t, d ? [] : n)) return;
			let f = u.parentId === l.parentId && u.index < l.index ? l.index + 1 : l.index;
			e.move(o.id, l.parentId, f);
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
					selected: o.includes(e.id),
					hovered: s === e.id,
					collapsed: !!c[e.id],
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
function le({ node: t, depth: n, selected: r, hovered: i, collapsed: a, hint: o, onToggle: s }) {
	let { store: l, types: u, readOnly: d } = f(), p = u.get(t.type), { attributes: g, listeners: _, setNodeRef: v, transform: y, transition: b, isDragging: x } = Z({
		id: t.id,
		disabled: d
	}), S = (t.children?.length ?? 0) > 0, C = m(), w = !!p?.children || S, T = t.type === "pattern" ? e(t, u, C) : t.label || (w ? se(t, p?.title ?? t.type) : $(t, 48) || p?.title || t.type), D = !t.label && t.type !== "pattern" && !w && !$(t, 48), [O, k] = j(!1), A = t.type === "pattern", M = [
		t.motion?.length && {
			icon: "b-magic-wand",
			title: E("Animated")
		},
		t.logic && {
			icon: "b-lightning",
			title: E("Interactive")
		},
		t.bind && Object.keys(t.bind).some((e) => e !== "visible" && e !== "hidden") && {
			icon: "b-database",
			title: E("Connected to Data")
		},
		(t.logic?.show || t.bind?.visible || t.bind?.hidden) && {
			icon: "b-eye-slash",
			title: t.logic?.show ? E("Shown when {condition}", { condition: t.logic.show }) : E("Shown conditionally")
		}
	].filter(Boolean);
	return /* @__PURE__ */ W("div", {
		ref: v,
		"data-layer": t.id,
		style: {
			transform: ae.Translate.toString(y),
			transition: b,
			paddingLeft: 4 + n * 12
		},
		...g,
		..._,
		onClick: (e) => {
			e.shiftKey ? l.extendTo(t.id) : c.emit("inspect", { node: t.id }), c.emit("scroll-to", { node: t.id });
		},
		onMouseEnter: () => l.hover(t.id),
		onKeyDown: (e) => {
			O || e.target !== e.currentTarget || (e.key === "Enter" || e.key === " " ? (e.preventDefault(), c.emit("inspect", { node: t.id }), c.emit("scroll-to", { node: t.id })) : !d && e.key === "F2" && (e.preventDefault(), k(!0)));
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
				name: A ? "b-diamonds-four" : p?.icon ?? "square",
				size: 14,
				className: B("shrink-0", t.hidden ? "text-ghost" : r ? "text-ink" : A ? "text-muted" : "text-faint")
			}),
			O ? /* @__PURE__ */ U("div", {
				className: "min-w-0 flex-1",
				onClick: (e) => e.stopPropagation(),
				onPointerDown: (e) => e.stopPropagation(),
				onKeyDown: (e) => e.stopPropagation(),
				onKeyUp: (e) => e.key === "Escape" && e.target.blur(),
				onBlur: () => k(!1),
				children: /* @__PURE__ */ U(h, {
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
					values: { label: t.label ?? "" },
					onChange: (e, n) => l.updateNode(t.id, { label: n.trim() || void 0 })
				})
			}) : /* @__PURE__ */ W("span", {
				onDoubleClick: (e) => {
					e.stopPropagation(), d || k(!0);
				},
				title: d ? void 0 : E("Double-Click to Rename"),
				className: B("min-w-0 flex-1 truncate", t.hidden ? "text-faint line-through decoration-faint/60" : D && "text-muted"),
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
				content: t.hidden ? E("Show") : E("Hide"),
				children: /* @__PURE__ */ U("button", {
					type: "button",
					disabled: d,
					onClick: (e) => {
						e.stopPropagation(), l.updateNode(t.id, { hidden: !t.hidden || void 0 });
					},
					onPointerDown: (e) => e.stopPropagation(),
					className: B("grid size-6 shrink-0 place-items-center rounded-sm text-faint hover:bg-hover hover:text-ink", t.hidden ? "grid" : "hidden group-hover:grid group-focus-visible:grid"),
					"aria-label": t.hidden ? E("Show") : E("Hide"),
					children: /* @__PURE__ */ U(N, {
						name: t.hidden ? "eye-off" : "eye",
						size: 14
					})
				})
			})
		]
	});
}
// admin/src/BlocksWorkspace.tsx
function ue(e) {
	let { catalog: t, types: n, isLoading: r, error: a, retry: o } = d(), c = e.bodyField.handle, l = i(e.values[c], (t) => e.setValue(c, t), !e.editable), u = A(e.values);
	u.current = e.values;
	let f = {
		kind: e.collection.handle === "templates" ? "template" : e.collection.handle === "components" ? "pattern" : "entry",
		id: e.entry?.id ?? "",
		collections: e.values.collections,
		props: e.values.props
	};
	return r ? /* @__PURE__ */ W("div", {
		className: "flex h-full min-h-0",
		children: [/* @__PURE__ */ U("div", {
			className: "grid min-w-0 flex-1 place-items-center",
			children: /* @__PURE__ */ U(R, {})
		}), /* @__PURE__ */ U(F, {
			open: e.sidebarOpen,
			onOpenChange: e.setSidebarOpen,
			title: e.collection.singular,
			children: e.sidebar
		})]
	}) : t ? /* @__PURE__ */ W(s, {
		value: {
			store: l,
			catalog: t,
			types: n,
			entryId: e.entry?.id ?? null,
			fieldHandle: c,
			allowed: e.bodyField.allowed ?? [],
			getValues: () => u.current,
			title: e.title,
			doc: f,
			readOnly: !e.editable
		},
		children: [a && /* @__PURE__ */ U(L, {
			message: a.message,
			onRetry: o,
			compact: !0
		}), /* @__PURE__ */ U(pe, { props: e })]
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
	let { store: e } = f(), t = u(e, (e) => e.breakpoint), n = de(), r = n.find((e) => e.value === t) ?? n[0];
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
	let { store: i, types: s, allowed: d, readOnly: m } = f(), h = u(i, (e) => e.selected ? v(e.nodes, e.selected) : null), _ = u(i, (e) => e.blockMode), y = u(i, (e) => l(e).length), b = u(i, () => i.canUndo()), k = u(i, () => i.canRedo()), [N, I] = j(!1), L = ne(), [R, z] = j(!1), [B, G] = j(""), K = re(), q = u(i, l);
	O(() => {
		window.matchMedia("(max-width: 639px)").matches && i.setBreakpoint("mobile");
	}, [i]), D({ items: q.flatMap((e) => {
		let t = v(i.get().nodes, e);
		return t ? [{
			id: e,
			kind: "block",
			label: g(t, 40) || (s.get(t.type)?.title ?? E("Block")),
			icon: s.get(t.type)?.icon,
			read: () => v(i.get().nodes, e)
		}] : [];
	}) });
	let J = (t) => {
		i.select(t, !0), I(!0), e.setSidebarOpen(!0);
	};
	O(() => {
		h && _ ? (I(!0), e.setSidebarOpen(!0), K || L.setOpen(!1)) : h && K && e.sidebarOpen && I(!0);
	}, [
		h?.id,
		_,
		K
	]), O(() => {
		e.sidebarOpen || I(!1);
	}, [e.sidebarOpen]), O(() => {
		Object.keys(e.errors).length && I(!1);
	}, [e.errors]), O(() => c.on("preview-motion", () => w.emit("entry.preview")), []);
	let Y = A(J);
	Y.current = J, O(() => c.on("inspect", ({ node: e }) => Y.current(e)), []);
	let X = () => {
		i.select(null), I(!1);
	}, Z = (e) => {
		let t = i.get(), n = t.selected ? v(t.nodes, t.selected) : null;
		return n && (Array.isArray(e) ? e : [e]).every((e) => C(n, e, s)) ? {
			parentId: n.id,
			index: n.children?.length ?? 0
		} : t.selected ? S(t.nodes, t.selected, e, s, d) : (Array.isArray(e) ? e : [e]).every((e) => C(null, e, s, d)) ? {
			parentId: null,
			index: t.nodes.length
		} : null;
	}, Q = (e) => {
		let t = x(e, s);
		if (!t.length) return;
		let r = Z(t.map((e) => e.type));
		r && (i.insert(r.parentId, r.index, t), a(i, t[0], n(o(i.get().nodes, s, () => !1))), z(!1), G(""));
	};
	return /* @__PURE__ */ W("div", {
		className: "flex h-full min-h-0 flex-col",
		"data-block-workspace": !0,
		children: [
			e.toolbar && ie(/* @__PURE__ */ W(H, { children: [
				!m && /* @__PURE__ */ U(ee, {
					open: R,
					onOpenChange: z,
					align: "start",
					trigger: /* @__PURE__ */ U(P, {
						icon: "plus",
						label: E("Insert block"),
						className: "max-sm:hidden"
					}),
					className: "!p-0",
					children: /* @__PURE__ */ U(r, {
						types: [...s.values()],
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
					onClick: i.undo,
					className: "max-sm:hidden"
				}),
				/* @__PURE__ */ U(P, {
					icon: "redo",
					label: E("Redo"),
					disabled: !k,
					onClick: i.redo,
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
						/* @__PURE__ */ U(t, {
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
					title: N && h ? s.get(h.type)?.title ?? E("Block") : e.collection.singular,
					children: N && h ? y > 1 ? /* @__PURE__ */ W(H, { children: [/* @__PURE__ */ W("div", {
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
					}), !m && /* @__PURE__ */ U("div", {
						className: "px-2 py-3",
						children: /* @__PURE__ */ U(M, {
							variant: "ghost",
							size: "sm",
							icon: "trash",
							className: "text-danger",
							onClick: () => i.removeSelection(),
							children: E("Delete")
						})
					})] }) : /* @__PURE__ */ U(p, {
						node: h,
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
