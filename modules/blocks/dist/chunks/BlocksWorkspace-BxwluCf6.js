import { d as e, f as t, l as n, p as r, t as i, u as a } from "./Inserter-BpLCwxz0.js";
import { _ as o, a as s, c, f as l, i as u, l as d, n as f, t as p } from "./insert-DSPXdALv.js";
import { an as m, bt as h, et as g, ht as _, in as v, nn as y, ot as b, t as x, vt as S, wt as C } from "./Inspector-3UQLmKoz.js";
import { events as ee, plural as te, t as w, useScreenContext as T } from "@letterncms/sdk";
import { memo as E, useCallback as D, useDeferredValue as O, useEffect as k, useMemo as A, useRef as j, useState as M } from "react";
import { Button as ne, Dialog as re, Icon as N, IconButton as P, InspectorPanel as F, PanelHeader as ie, Popover as ae, QueryError as I, ScreenSidebar as oe, Segmented as se, Spinner as L, Tooltip as R, cn as z, fieldControlId as B, useScreenSidebar as ce, useWideInspector as le } from "@letterncms/ui";
import { Fragment as V, jsx as H, jsxs as U } from "react/jsx-runtime";
import { createPortal as ue } from "react-dom";
import { DndContext as W, PointerSensor as G, closestCenter as de, useSensor as fe, useSensors as K } from "@dnd-kit/core";
import { SortableContext as q, useSortable as J, verticalListSortingStrategy as Y } from "@dnd-kit/sortable";
import { CSS as X } from "@dnd-kit/utilities";
// admin/src/builder/Layers.tsx
var pe = E(function() {
	let { store: e, types: t, allowed: n, readOnly: i } = r(), [a, o] = M({}), s = K(fe(G, { activationConstraint: { distance: 4 } })), u = D((e) => o((t) => ({
		...t,
		[e]: !t[e]
	})), []), d = D((e) => o((t) => e.some((e) => t[e]) ? {
		...t,
		...Object.fromEntries(e.map((e) => [e, !1]))
	} : t), []);
	return /* @__PURE__ */ H(W, {
		sensors: s,
		collisionDetection: de,
		onDragEnd: (r) => {
			if (i || !r.over || r.active.id === r.over.id) return;
			let o = e.get().nodes, s = c(o, String(r.active.id)), u = c(o, String(r.over.id)), d = l(o, String(r.over.id)), f = l(o, String(r.active.id));
			if (!s || !u || !d || !f) return;
			if (t.get(u.type)?.children && !a[u.id] && p(u, s.type, t) && (u.children?.length ?? 0) === 0) return e.move(s.id, u.id, 0);
			let m = d.parentId ? c(o, d.parentId) : null;
			if (!p(m, s.type, t, m ? [] : n)) return;
			let h = f.parentId === d.parentId && f.index < d.index ? d.index + 1 : d.index;
			e.move(s.id, d.parentId, h);
		},
		children: /* @__PURE__ */ H(Z, {
			collapsed: a,
			onToggle: u,
			onReveal: d
		})
	});
});
function Z({ collapsed: e, onToggle: n, onReveal: i }) {
	let { store: a, types: o } = r(), c = O(m(a, (e) => e.nodes)), l = m(a, (e) => e.selected), u = m(a, v), d = m(a, (e) => e.hovered);
	k(() => {
		l && (i(s(a.get().nodes, l).map((e) => e.id)), document.querySelector(`[data-layer="${l}"]`)?.scrollIntoView({ block: "nearest" }));
	}, [l]);
	let f = A(() => me(c, (e) => !!o.get(e.type)?.children || !!e.children?.length), [c, o]), p = t(), h = A(() => {
		let t = [], n = (r, i) => r.forEach((r) => {
			t.push({
				node: r,
				depth: i
			}), r.children && !e[r.id] && n(r.children, i + 1);
		});
		return n(c, 0), t;
	}, [c, e]), g = h.map((e) => e.node.id).join(" "), _ = A(() => g ? g.split(" ") : [], [g]);
	return c.length === 0 ? /* @__PURE__ */ H("div", {
		className: "px-4 py-3",
		children: /* @__PURE__ */ H("p", {
			className: "m-0 text-sm text-muted",
			children: w("No elements yet")
		})
	}) : /* @__PURE__ */ H(q, {
		items: _,
		strategy: Y,
		children: /* @__PURE__ */ H("div", {
			className: "space-y-px px-2 pb-3 pt-1",
			onMouseLeave: () => a.hover(null),
			children: h.map(({ node: t, depth: r }) => /* @__PURE__ */ H(he, {
				node: t,
				depth: r,
				selected: u.includes(t.id),
				hovered: d === t.id,
				collapsed: !!e[t.id],
				hint: e[t.id] || !t.children?.length ? f.get(t.id) : void 0,
				components: p,
				onToggle: n
			}, t.id))
		})
	});
}
function Q(e, t) {
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
function me(e, t) {
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
var he = E(function({ node: e, depth: t, selected: n, hovered: i, collapsed: o, hint: s, components: c, onToggle: l }) {
	let { store: u, types: d, readOnly: f } = r(), p = d.get(e.type), { attributes: m, listeners: h, setNodeRef: _, transform: v, transition: y, isDragging: b } = J({
		id: e.id,
		disabled: f
	}), x = (e.children?.length ?? 0) > 0, S = !!p?.children || x, ee = e.type === "component" ? a(e, d, c) : e.label || (S ? Q(e, p?.title ?? e.type) : $(e, 48) || p?.title || e.type), te = !e.label && e.type !== "component" && !S && !$(e, 48), [T, E] = M(!1), D = e.type === "component", O = [
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
	].filter(Boolean), k = /* @__PURE__ */ U("span", {
		onDoubleClick: (e) => {
			e.stopPropagation(), f || E(!0);
		},
		title: f || O.length ? void 0 : w("Double-Click to Rename"),
		className: z("min-w-0 flex-1 truncate", e.hidden ? "text-faint line-through decoration-faint/60" : te && "text-muted"),
		children: [ee, s && /* @__PURE__ */ H("span", {
			className: z("ml-1.5", n ? "text-muted" : "text-faint"),
			children: s
		})]
	}), A = O.length ? /* @__PURE__ */ H(R, {
		content: /* @__PURE__ */ H("span", {
			className: "grid gap-1",
			children: O.map((e) => /* @__PURE__ */ U("span", {
				className: "flex items-center gap-1.5",
				children: [/* @__PURE__ */ H(N, {
					name: e.icon,
					size: 12
				}), e.title]
			}, e.icon))
		}),
		children: k
	}) : k;
	return /* @__PURE__ */ U("div", {
		ref: _,
		"data-layer": e.id,
		style: {
			transform: X.Translate.toString(v),
			transition: y,
			paddingLeft: 4 + t * 12
		},
		...m,
		...h,
		onClick: (t) => {
			t.shiftKey ? u.extendTo(e.id) : C.emit("inspect", { node: e.id }), C.emit("scroll-to", { node: e.id });
		},
		onMouseEnter: () => u.hover(e.id),
		onKeyDown: (t) => {
			T || t.target !== t.currentTarget || (t.key === "Enter" || t.key === " " ? (t.preventDefault(), C.emit("inspect", { node: e.id }), C.emit("scroll-to", { node: e.id })) : !f && t.key === "F2" && (t.preventDefault(), E(!0)));
		},
		className: z("group relative flex h-7 pointer-coarse:h-10 cursor-default select-none items-center gap-1.5 rounded-md pr-1 text-sm -outline-offset-2", n ? "bg-focus-soft text-ink" : i ? "bg-hover text-text" : "text-text", b && "z-drag bg-bg opacity-80 shadow-pop"),
		children: [
			/* @__PURE__ */ H(P, {
				icon: "chevron-down",
				size: "xs",
				label: w(o ? "Expand" : "Collapse"),
				title: void 0,
				onClick: (t) => {
					t.stopPropagation(), l(e.id);
				},
				className: z("-mr-1 !size-4 !bg-transparent !text-faint hover:!text-ink [&_svg]:size-2.5 [&_svg]:transition-transform [&_svg]:duration-fast", o && "[&_svg]:-rotate-90", !x && "invisible")
			}),
			/* @__PURE__ */ H(N, {
				name: D ? "symbol" : p?.icon ?? "square",
				size: 14,
				className: z("shrink-0", e.hidden ? "text-ghost" : n ? "text-ink" : D ? "text-muted" : "text-faint")
			}),
			T ? /* @__PURE__ */ H("div", {
				className: "min-w-0 flex-1",
				onClick: (e) => e.stopPropagation(),
				onPointerDown: (e) => e.stopPropagation(),
				onKeyDown: (e) => e.stopPropagation(),
				onKeyUp: (e) => e.key === "Escape" && e.target.blur(),
				onBlur: () => E(!1),
				children: /* @__PURE__ */ H(g, {
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
			}) : A,
			!T && O.map((e) => /* @__PURE__ */ H("span", {
				role: "img",
				"aria-label": e.title,
				className: "grid size-5 shrink-0 place-items-center text-faint group-hover:hidden group-focus-visible:hidden",
				children: /* @__PURE__ */ H(N, {
					name: e.icon,
					size: 12
				})
			}, e.icon)),
			/* @__PURE__ */ H("span", {
				className: e.hidden ? "contents" : "hidden group-hover:contents group-focus-visible:contents [@media(hover:none)]:contents",
				children: /* @__PURE__ */ H(R, {
					content: e.hidden ? w("Show") : w("Hide"),
					children: /* @__PURE__ */ H(P, {
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
});
// admin/src/BlocksWorkspace.tsx
function ge(t) {
	let { catalog: r, types: i, isLoading: a, error: o, retry: s } = e(), c = t.bodyField.handle, l = y(t.values[c], (e) => t.setValue(c, e), !t.editable), u = j(t.values);
	u.current = t.values;
	let d = t.collection.handle === "templates" ? "template" : t.collection.handle === "components" ? "component" : "entry", f = t.entry?.id ?? null, { collections: p, props: m } = t.values, h = t.bodyField.allowed ?? _e, g = A(() => r && {
		store: l,
		catalog: r,
		types: i,
		entryId: f,
		fieldHandle: c,
		allowed: h,
		getValues: () => u.current,
		title: t.title,
		doc: {
			kind: d,
			id: f ?? "",
			collections: p,
			props: m
		},
		readOnly: !t.editable
	}, [
		l,
		r,
		i,
		f,
		c,
		h,
		t.title,
		d,
		p,
		m,
		t.editable
	]);
	return a ? /* @__PURE__ */ U("div", {
		className: "flex h-full min-h-0",
		children: [/* @__PURE__ */ H("div", {
			className: "grid min-w-0 flex-1 place-items-center",
			children: /* @__PURE__ */ H(L, {})
		}), /* @__PURE__ */ H(F, {
			sheet: !0,
			className: ve,
			open: t.sidebarOpen,
			onOpenChange: t.setSidebarOpen,
			title: t.collection.singular,
			children: t.sidebar
		})]
	}) : g ? /* @__PURE__ */ U(n, {
		value: g,
		children: [o && /* @__PURE__ */ H(I, {
			message: o.message,
			onRetry: s,
			compact: !0
		}), /* @__PURE__ */ H(xe, { props: t })]
	}) : /* @__PURE__ */ H(I, {
		message: o?.message,
		onRetry: s
	});
}
var _e = [], ve = "cms-block-sheet", ye = () => [
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
function be() {
	let { store: e } = r(), t = m(e, (e) => e.device);
	return /* @__PURE__ */ H(se, {
		"aria-label": w("Screen"),
		value: t,
		onChange: e.setDevice,
		options: ye().map((e) => ({
			value: e.value,
			icon: e.icon,
			title: e.label
		})),
		className: "max-sm:hidden"
	});
}
function xe({ props: e }) {
	let { store: t, types: n, allowed: a, readOnly: s } = r(), l = m(t, (e) => e.selected ? c(e.nodes, e.selected) : null), d = O(l), g = m(t, (e) => e.blockMode), y = m(t, (e) => v(e).length), E = m(t, () => t.canUndo()), A = m(t, () => t.canRedo()), [N, I] = M(!1), se = ce(), [L, R] = M(!1), [z, W] = M(""), G = le(), [de] = M(() => window.matchMedia("(max-width: 639px)").matches), fe = m(t, v);
	k(() => {
		window.matchMedia("(max-width: 639px)").matches && t.setDevice("phone");
	}, [t]), T({ items: fe.flatMap((e) => {
		let r = c(t.get().nodes, e);
		return r ? [{
			id: e,
			kind: "block",
			label: o(r, 40) || (n.get(r.type)?.title ?? w("Block")),
			icon: n.get(r.type)?.icon,
			read: () => c(t.get().nodes, e)
		}] : [];
	}) });
	let K = (n) => {
		t.select(n, !0), I(!0), e.setSidebarOpen(!0);
	};
	k(() => {
		l && g ? (I(!0), e.setSidebarOpen(!0), G || se.setOpen(!1)) : l && G && e.sidebarOpen && I(!0);
	}, [
		l?.id,
		g,
		G
	]), k(() => {
		e.sidebarOpen ? !G && t.get().selected && (I(!0), window.matchMedia("(max-width: 639px)").matches && C.emit("scroll-to", {
			node: t.get().selected,
			top: !0
		})) : I(!1);
	}, [e.sidebarOpen]), k(() => {
		Object.keys(e.errors).length && I(!1);
	}, [e.errors]), k(() => C.on("preview-motion", () => ee.emit("entry.preview")), []);
	let q = j(K);
	q.current = K, k(() => C.on("inspect", ({ node: e }) => q.current(e)), []);
	let J = D(() => {
		t.select(null), I(!1);
	}, [t]), { setSidebarOpen: Y } = e, X = D(() => Y(!1), [Y]), Z = (e) => {
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
		i && (t.insert(i.parentId, i.index, r), h(t, r[0], S(_(t.get().nodes, n, () => !1))), R(!1), W(""));
	};
	return /* @__PURE__ */ U("div", {
		className: "flex h-full min-h-0 flex-col",
		"data-block-workspace": !0,
		children: [
			e.toolbar && ue(/* @__PURE__ */ U(V, { children: [
				!s && (de ? /* @__PURE__ */ U(V, { children: [/* @__PURE__ */ H(P, {
					icon: "plus",
					label: w("Insert Block"),
					onClick: () => R(!0)
				}), /* @__PURE__ */ H(re, {
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
				})] }) : /* @__PURE__ */ H(ae, {
					open: L,
					onOpenChange: R,
					align: "start",
					trigger: /* @__PURE__ */ H(P, {
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
				/* @__PURE__ */ H(P, {
					icon: "undo",
					label: w("Undo"),
					disabled: !E,
					onClick: t.undo
				}),
				/* @__PURE__ */ H(P, {
					icon: "redo",
					label: w("Redo"),
					disabled: !A,
					onClick: t.redo
				}),
				/* @__PURE__ */ H(be, {})
			] }), e.toolbar),
			/* @__PURE__ */ H(oe, {
				title: w("Outline||structure"),
				backTo: e.listPath,
				backLabel: e.listLabel ?? e.collection.title,
				children: /* @__PURE__ */ H(pe, {})
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
						/* @__PURE__ */ H(b, {
							collection: e.collection.handle,
							blueprint: e.collection.blueprint,
							entryId: e.entry?.id,
							content: e.content,
							onTitleChange: ["templates", "components"].includes(e.collection.handle) ? void 0 : e.setTitle,
							onInspect: K
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
				}), /* @__PURE__ */ H(F, {
					sheet: !0,
					className: ve,
					open: e.sidebarOpen,
					onOpenChange: e.setSidebarOpen,
					title: N && l ? n.get(l.type)?.title ?? w("Block") : e.collection.singular,
					children: N && l ? y > 1 ? /* @__PURE__ */ U(V, { children: [/* @__PURE__ */ H(ie, {
						title: te(y, "{count} block selected", "{count} blocks selected"),
						onBack: J,
						backLabel: e.collection.singular,
						onClose: () => e.setSidebarOpen(!1)
					}), !s && /* @__PURE__ */ H("div", {
						className: "px-2 py-3",
						children: /* @__PURE__ */ H(ne, {
							variant: "destructive",
							size: "sm",
							icon: "trash",
							onClick: () => t.removeSelection(),
							children: w("Delete")
						})
					})] }) : /* @__PURE__ */ H(x, {
						node: d?.id === l.id ? d : l,
						onBack: J,
						backLabel: e.collection.singular,
						onClose: X
					}) : e.sidebar
				})]
			})
		]
	});
}
export { ge as BlocksWorkspace };
