import { A as e, B as t, E as n, G as r, K as i, L as a, W as o, Y as s, f as c, j as l, l as u, q as d, t as f, w as p, x as m, z as h } from "./Inspector-Bl_ziQtl.js";
import { _ as g, a as _, c as v, f as y, l as b, n as x, r as S, t as C } from "./insert-C2qFyCIH.js";
import { events as w, plural as T, t as E, useScreenContext as D } from "@letterncms/sdk";
import { Button as O, Icon as k, IconButton as A, InspectorPanel as j, Menu as M, Popover as ee, QueryError as N, ScreenSidebar as te, Spinner as P, Tooltip as F, cn as I, fieldControlId as L, useScreenSidebar as ne, useWideInspector as re } from "@letterncms/ui";
import { useEffect as R, useMemo as z, useRef as B, useState as V } from "react";
import { Fragment as H, jsx as U, jsxs as W } from "react/jsx-runtime";
import { createPortal as ie } from "react-dom";
import { DndContext as G, PointerSensor as K, closestCenter as q, useSensor as J, useSensors as Y } from "@dnd-kit/core";
import { SortableContext as X, useSortable as Z, verticalListSortingStrategy as Q } from "@dnd-kit/sortable";
import { CSS as ae } from "@dnd-kit/utilities";
// admin/src/builder/Layers.tsx
function oe() {
	let { store: e, types: n, allowed: r, readOnly: i } = s(), a = t(e, (e) => e.nodes), o = t(e, (e) => e.selected), c = t(e, h), l = t(e, (e) => e.hovered), [u, d] = V({}), f = Y(J(K, { activationConstraint: { distance: 4 } }));
	R(() => {
		if (!o) return;
		let t = _(e.get().nodes, o).filter((e) => u[e.id]);
		t.length && d((e) => ({
			...e,
			...Object.fromEntries(t.map((e) => [e.id, !1]))
		})), document.querySelector(`[data-layer="${o}"]`)?.scrollIntoView({ block: "nearest" });
	}, [o]);
	let p = z(() => ce(a, (e) => !!n.get(e.type)?.children || !!e.children?.length), [a, n]), m = b(a).filter(({ node: e }) => !_(a, e.id).some((e) => u[e.id]));
	return a.length === 0 ? /* @__PURE__ */ U("div", {
		className: "px-4 py-3",
		children: /* @__PURE__ */ U("p", {
			className: "m-0 text-sm text-muted",
			children: E("No elements yet")
		})
	}) : /* @__PURE__ */ U(G, {
		sensors: f,
		collisionDetection: q,
		onDragEnd: (t) => {
			if (i || !t.over || t.active.id === t.over.id) return;
			let a = e.get().nodes, o = v(a, String(t.active.id)), s = v(a, String(t.over.id)), c = y(a, String(t.over.id)), l = y(a, String(t.active.id));
			if (!o || !s || !c || !l) return;
			if (n.get(s.type)?.children && !u[s.id] && C(s, o.type, n) && (s.children?.length ?? 0) === 0) return e.move(o.id, s.id, 0);
			let d = c.parentId ? v(a, c.parentId) : null;
			if (!C(d, o.type, n, d ? [] : r)) return;
			let f = l.parentId === c.parentId && l.index < c.index ? c.index + 1 : c.index;
			e.move(o.id, c.parentId, f);
		},
		children: /* @__PURE__ */ U(X, {
			items: m.map((e) => e.node.id),
			strategy: Q,
			children: /* @__PURE__ */ U("div", {
				className: "space-y-px px-2 pb-3 pt-1",
				onMouseLeave: () => e.hover(null),
				children: m.map(({ node: e, depth: t }) => /* @__PURE__ */ U(le, {
					node: e,
					depth: t,
					selected: c.includes(e.id),
					hovered: l === e.id,
					collapsed: !!u[e.id],
					hint: p.get(e.id),
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
function le({ node: t, depth: n, selected: i, hovered: a, collapsed: o, hint: c, onToggle: l }) {
	let { store: f, types: p, readOnly: m } = s(), h = p.get(t.type), { attributes: g, listeners: _, setNodeRef: v, transform: y, transition: b, isDragging: x } = Z({
		id: t.id,
		disabled: m
	}), S = (t.children?.length ?? 0) > 0, C = d(), w = !!h?.children || S, T = t.type === "pattern" ? r(t, p, C) : t.label || (w ? se(t, h?.title ?? t.type) : $(t, 48) || h?.title || t.type), D = !t.label && t.type !== "pattern" && !w && !$(t, 48), [O, A] = V(!1), j = t.type === "pattern", M = [
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
		onClick: (n) => {
			n.shiftKey ? f.extendTo(t.id) : e.emit("inspect", { node: t.id }), e.emit("scroll-to", { node: t.id });
		},
		onMouseEnter: () => f.hover(t.id),
		onKeyDown: (n) => {
			O || n.target !== n.currentTarget || (n.key === "Enter" || n.key === " " ? (n.preventDefault(), e.emit("inspect", { node: t.id }), e.emit("scroll-to", { node: t.id })) : !m && n.key === "F2" && (n.preventDefault(), A(!0)));
		},
		className: I("group relative flex h-7 cursor-default select-none items-center gap-1.5 rounded-md pr-1 text-sm outline-none focus-visible:shadow-[inset_0_0_0_1.5px_var(--cms-focus)]", i ? "bg-focus-soft text-ink" : a ? "bg-hover text-text" : "text-text", x && "z-10 bg-bg opacity-80 shadow-pop"),
		children: [
			/* @__PURE__ */ U("button", {
				type: "button",
				onClick: (e) => {
					e.stopPropagation(), l();
				},
				className: I("-mr-1 grid size-4 shrink-0 place-items-center rounded-xs text-faint hover:text-ink", !S && "invisible"),
				"aria-label": E(o ? "Expand" : "Collapse"),
				children: /* @__PURE__ */ U(k, {
					name: "b-caret-down",
					size: 10,
					className: I("transition-transform duration-120", o && "-rotate-90")
				})
			}),
			/* @__PURE__ */ U(k, {
				name: j ? "b-diamonds-four" : h?.icon ?? "square",
				size: 14,
				className: I("shrink-0", t.hidden ? "text-ghost" : i ? "text-ink" : j ? "text-muted" : "text-faint")
			}),
			O ? /* @__PURE__ */ U("div", {
				className: "min-w-0 flex-1",
				onClick: (e) => e.stopPropagation(),
				onPointerDown: (e) => e.stopPropagation(),
				onKeyDown: (e) => e.stopPropagation(),
				onKeyUp: (e) => e.key === "Escape" && e.target.blur(),
				onBlur: () => A(!1),
				children: /* @__PURE__ */ U(u, {
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
					values: { label: t.label ?? "" },
					onChange: (e, n) => f.updateNode(t.id, { label: n.trim() || void 0 })
				})
			}) : /* @__PURE__ */ W("span", {
				onDoubleClick: (e) => {
					e.stopPropagation(), m || A(!0);
				},
				title: m ? void 0 : E("Double-Click to Rename"),
				className: I("min-w-0 flex-1 truncate", t.hidden ? "text-faint line-through decoration-faint/60" : D && "text-muted"),
				children: [T, c && /* @__PURE__ */ U("span", {
					className: I("ml-1.5", i ? "text-muted" : "text-faint"),
					children: c
				})]
			}),
			!O && M.map((e) => /* @__PURE__ */ U(F, {
				content: e.title,
				children: /* @__PURE__ */ U("span", {
					className: "grid size-5 shrink-0 place-items-center text-faint group-hover:hidden",
					children: /* @__PURE__ */ U(k, {
						name: e.icon,
						size: 12
					})
				})
			}, e.icon)),
			/* @__PURE__ */ U(F, {
				content: t.hidden ? E("Show") : E("Hide"),
				children: /* @__PURE__ */ U("button", {
					type: "button",
					disabled: m,
					onClick: (e) => {
						e.stopPropagation(), f.updateNode(t.id, { hidden: !t.hidden || void 0 });
					},
					onPointerDown: (e) => e.stopPropagation(),
					className: I("grid size-6 shrink-0 place-items-center rounded-sm text-faint hover:bg-hover hover:text-ink", t.hidden ? "grid" : "hidden group-hover:grid group-focus-visible:grid"),
					"aria-label": t.hidden ? E("Show") : E("Hide"),
					children: /* @__PURE__ */ U(k, {
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
	let { catalog: t, types: n, isLoading: r, error: s, retry: c } = i(), l = e.bodyField.handle, u = a(e.values[l], (t) => e.setValue(l, t), !e.editable), d = B(e.values);
	d.current = e.values;
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
			children: /* @__PURE__ */ U(P, {})
		}), /* @__PURE__ */ U(j, {
			open: e.sidebarOpen,
			onOpenChange: e.setSidebarOpen,
			title: e.collection.singular,
			children: e.sidebar
		})]
	}) : t ? /* @__PURE__ */ W(o, {
		value: {
			store: u,
			catalog: t,
			types: n,
			entryId: e.entry?.id ?? null,
			fieldHandle: l,
			allowed: e.bodyField.allowed ?? [],
			getValues: () => d.current,
			title: e.title,
			doc: f,
			readOnly: !e.editable
		},
		children: [s && /* @__PURE__ */ U(N, {
			message: s.message,
			onRetry: c,
			compact: !0
		}), /* @__PURE__ */ U(pe, { props: e })]
	}) : /* @__PURE__ */ U(N, {
		message: s?.message,
		onRetry: c
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
	let { store: e } = s(), n = t(e, (e) => e.breakpoint), r = de(), i = r.find((e) => e.value === n) ?? r[0];
	return /* @__PURE__ */ U(M, {
		align: "start",
		trigger: /* @__PURE__ */ U(A, {
			icon: i.icon,
			label: `${E("Screen")}: ${i.label}`,
			active: n !== "base",
			className: "max-sm:hidden"
		}),
		items: r.map((t) => ({
			label: t.label,
			icon: t.icon,
			checked: t.value === n,
			onSelect: () => e.setBreakpoint(t.value)
		}))
	});
}
function pe({ props: r }) {
	let { store: i, types: a, allowed: o, readOnly: u } = s(), d = t(i, (e) => e.selected ? v(e.nodes, e.selected) : null), _ = t(i, (e) => e.blockMode), y = t(i, (e) => h(e).length), b = t(i, () => i.canUndo()), k = t(i, () => i.canRedo()), [M, N] = V(!1), P = ne(), [F, I] = V(!1), [z, G] = V(""), K = re(), q = t(i, h);
	R(() => {
		window.matchMedia("(max-width: 639px)").matches && i.setBreakpoint("mobile");
	}, [i]), D({ items: q.flatMap((e) => {
		let t = v(i.get().nodes, e);
		return t ? [{
			id: e,
			kind: "block",
			label: g(t, 40) || (a.get(t.type)?.title ?? E("Block")),
			icon: a.get(t.type)?.icon,
			read: () => v(i.get().nodes, e)
		}] : [];
	}) });
	let J = (e) => {
		i.select(e, !0), N(!0), r.setSidebarOpen(!0);
	};
	R(() => {
		d && _ ? (N(!0), r.setSidebarOpen(!0), K || P.setOpen(!1)) : d && K && r.sidebarOpen && N(!0);
	}, [
		d?.id,
		_,
		K
	]), R(() => {
		r.sidebarOpen || N(!1);
	}, [r.sidebarOpen]), R(() => {
		Object.keys(r.errors).length && N(!1);
	}, [r.errors]), R(() => e.on("preview-motion", () => w.emit("entry.preview")), []);
	let Y = B(J);
	Y.current = J, R(() => e.on("inspect", ({ node: e }) => Y.current(e)), []);
	let X = () => {
		i.select(null), N(!1);
	}, Z = (e) => {
		let t = i.get(), n = t.selected ? v(t.nodes, t.selected) : null;
		return n && (Array.isArray(e) ? e : [e]).every((e) => C(n, e, a)) ? {
			parentId: n.id,
			index: n.children?.length ?? 0
		} : t.selected ? S(t.nodes, t.selected, e, a, o) : (Array.isArray(e) ? e : [e]).every((e) => C(null, e, a, o)) ? {
			parentId: null,
			index: t.nodes.length
		} : null;
	}, Q = (e) => {
		let t = x(e, a);
		if (!t.length) return;
		let r = Z(t.map((e) => e.type));
		r && (i.insert(r.parentId, r.index, t), n(i, t[0], p(m(i.get().nodes, a, () => !1))), I(!1), G(""));
	};
	return /* @__PURE__ */ W("div", {
		className: "flex h-full min-h-0 flex-col",
		"data-block-workspace": !0,
		children: [
			r.toolbar && ie(/* @__PURE__ */ W(H, { children: [
				!u && /* @__PURE__ */ U(ee, {
					open: F,
					onOpenChange: I,
					align: "start",
					trigger: /* @__PURE__ */ U(A, {
						icon: "plus",
						label: E("Insert block"),
						className: "max-sm:hidden"
					}),
					className: "!p-0",
					children: /* @__PURE__ */ U(l, {
						types: [...a.values()],
						query: z,
						onQuery: G,
						onChoose: Q,
						onClose: () => I(!1),
						allowed: (e) => !!Z(e.name)
					})
				}),
				/* @__PURE__ */ U(A, {
					icon: "undo",
					label: E("Undo"),
					disabled: !b,
					onClick: i.undo,
					className: "max-sm:hidden"
				}),
				/* @__PURE__ */ U(A, {
					icon: "redo",
					label: E("Redo"),
					disabled: !k,
					onClick: i.redo,
					className: "max-sm:hidden"
				}),
				/* @__PURE__ */ U(fe, {})
			] }), r.toolbar),
			/* @__PURE__ */ U(te, {
				title: E("Outline"),
				backTo: r.listPath,
				backLabel: r.listLabel ?? r.collection.title,
				children: /* @__PURE__ */ U(oe, {})
			}),
			/* @__PURE__ */ W("div", {
				className: "flex min-h-0 flex-1",
				children: [/* @__PURE__ */ W("main", {
					id: L(r.bodyField),
					tabIndex: -1,
					"aria-label": r.bodyField.label,
					"aria-describedby": r.errors[r.bodyField.handle] ? `${L(r.bodyField)}-error` : void 0,
					className: "flex min-w-0 flex-1 flex-col outline-none",
					"data-editor-document": !0,
					children: [
						/* @__PURE__ */ U(c, {
							collection: r.collection.handle,
							entryId: r.entry?.id,
							content: r.content,
							onTitleChange: ["templates", "components"].includes(r.collection.handle) ? void 0 : r.setTitle,
							onInspect: J
						}),
						r.errors[r.bodyField.handle] && /* @__PURE__ */ U("p", {
							id: `${L(r.bodyField)}-error`,
							role: "alert",
							className: "m-0 shrink-0 px-3 py-2 text-xs text-danger",
							children: r.errors[r.bodyField.handle]
						}),
						/* @__PURE__ */ U("div", {
							className: "max-h-[30vh] shrink-0 overflow-y-auto",
							children: r.footer
						})
					]
				}), /* @__PURE__ */ U(j, {
					open: r.sidebarOpen,
					onOpenChange: r.setSidebarOpen,
					title: M && d ? a.get(d.type)?.title ?? E("Block") : r.collection.singular,
					children: M && d ? y > 1 ? /* @__PURE__ */ W(H, { children: [/* @__PURE__ */ W("div", {
						className: "flex h-12 shrink-0 items-center gap-1 border-b border-border pl-2 pr-3",
						children: [
							/* @__PURE__ */ U(A, {
								icon: "arrow-left",
								label: E("Back to {name}", { name: r.collection.singular }),
								size: "sm",
								onClick: X
							}),
							/* @__PURE__ */ U("span", {
								className: "min-w-0 flex-1 truncate pl-1 text-sm font-semibold text-ink",
								children: T(y, "{count} block selected", "{count} blocks selected")
							}),
							/* @__PURE__ */ U(A, {
								icon: "close",
								label: E("Close Panel"),
								size: "sm",
								onClick: () => r.setSidebarOpen(!1)
							})
						]
					}), !u && /* @__PURE__ */ U("div", {
						className: "px-2 py-3",
						children: /* @__PURE__ */ U(O, {
							variant: "ghost",
							size: "sm",
							icon: "trash",
							className: "text-danger",
							onClick: () => i.removeSelection(),
							children: E("Delete")
						})
					})] }) : /* @__PURE__ */ U(f, {
						node: d,
						onBack: X,
						backLabel: r.collection.singular,
						onClose: () => r.setSidebarOpen(!1)
					}) : r.sidebar
				})]
			})
		]
	});
}
export { ue as BlocksWorkspace };
