import { $ as e, Ct as t, _t as n, an as r, at as i, cn as a, in as o, ln as s, mt as c, nn as l, on as u, sn as d, t as f, un as p, wt as m, yt as h } from "./Inspector-C29q4sX7.js";
import { _ as g, a as _, c as v, f as y, i as b, l as x, n as S, t as C } from "./insert-DSPXdALv.js";
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
	let { store: e, types: t, allowed: n, readOnly: r } = p(), [i, a] = M({}), o = K(fe(G, { activationConstraint: { distance: 4 } })), s = D((e) => a((t) => ({
		...t,
		[e]: !t[e]
	})), []), c = D((e) => a((t) => e.some((e) => t[e]) ? {
		...t,
		...Object.fromEntries(e.map((e) => [e, !1]))
	} : t), []);
	return /* @__PURE__ */ H(W, {
		sensors: o,
		collisionDetection: de,
		onDragEnd: (a) => {
			if (r || !a.over || a.active.id === a.over.id) return;
			let o = e.get().nodes, s = v(o, String(a.active.id)), c = v(o, String(a.over.id)), l = y(o, String(a.over.id)), u = y(o, String(a.active.id));
			if (!s || !c || !l || !u) return;
			if (t.get(c.type)?.children && !i[c.id] && C(c, s.type, t) && (c.children?.length ?? 0) === 0) return e.move(s.id, c.id, 0);
			let d = l.parentId ? v(o, l.parentId) : null;
			if (!C(d, s.type, t, d ? [] : n)) return;
			let f = u.parentId === l.parentId && u.index < l.index ? l.index + 1 : l.index;
			e.move(s.id, l.parentId, f);
		},
		children: /* @__PURE__ */ H(Z, {
			collapsed: i,
			onToggle: s,
			onReveal: c
		})
	});
});
function Z({ collapsed: e, onToggle: t, onReveal: n }) {
	let { store: i, types: a } = p(), c = O(r(i, (e) => e.nodes)), l = r(i, (e) => e.selected), u = r(i, o), d = r(i, (e) => e.hovered);
	k(() => {
		l && (n(_(i.get().nodes, l).map((e) => e.id)), document.querySelector(`[data-layer="${l}"]`)?.scrollIntoView({ block: "nearest" }));
	}, [l]);
	let f = A(() => me(c, (e) => !!a.get(e.type)?.children || !!e.children?.length), [c, a]), m = s(), h = A(() => {
		let t = [], n = (r, i) => r.forEach((r) => {
			t.push({
				node: r,
				depth: i
			}), r.children && !e[r.id] && n(r.children, i + 1);
		});
		return n(c, 0), t;
	}, [c, e]), g = h.map((e) => e.node.id).join(" "), v = A(() => g ? g.split(" ") : [], [g]);
	return c.length === 0 ? /* @__PURE__ */ H("div", {
		className: "px-4 py-3",
		children: /* @__PURE__ */ H("p", {
			className: "m-0 text-sm text-muted",
			children: w("No elements yet")
		})
	}) : /* @__PURE__ */ H(q, {
		items: v,
		strategy: Y,
		children: /* @__PURE__ */ H("div", {
			className: "space-y-px px-2 pb-3 pt-1",
			onMouseLeave: () => i.hover(null),
			children: h.map(({ node: n, depth: r }) => /* @__PURE__ */ H(he, {
				node: n,
				depth: r,
				selected: u.includes(n.id),
				hovered: d === n.id,
				collapsed: !!e[n.id],
				hint: e[n.id] || !n.children?.length ? f.get(n.id) : void 0,
				components: m,
				onToggle: t
			}, n.id))
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
	let n = g(e, t);
	if (n) return n;
	let r = String(e.bind?.text ?? "").replace(/[{}]/g, "").split("|")[0].trim().split(".").pop() ?? "";
	return r ? r.replace(/[_-]+/g, " ").replace(/^\w/, (e) => e.toUpperCase()) : "";
}
function me(e, t) {
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
var he = E(function({ node: n, depth: r, selected: i, hovered: a, collapsed: o, hint: s, components: c, onToggle: l }) {
	let { store: u, types: f, readOnly: m } = p(), h = f.get(n.type), { attributes: g, listeners: _, setNodeRef: v, transform: y, transition: b, isDragging: x } = J({
		id: n.id,
		disabled: m
	}), S = (n.children?.length ?? 0) > 0, C = !!h?.children || S, ee = n.type === "component" ? d(n, f, c) : n.label || (C ? Q(n, h?.title ?? n.type) : $(n, 48) || h?.title || n.type), te = !n.label && n.type !== "component" && !C && !$(n, 48), [T, E] = M(!1), D = n.type === "component", O = [
		n.motion?.length && {
			icon: "animated",
			title: w("Animated")
		},
		n.logic && {
			icon: "interactive",
			title: w("Interactive")
		},
		n.bind && Object.keys(n.bind).some((e) => e !== "visible" && e !== "hidden") && {
			icon: "database",
			title: w("Connected to Data")
		},
		(n.logic?.show || n.bind?.visible || n.bind?.hidden) && {
			icon: "eye-off",
			title: n.logic?.show ? w("Shown when {condition}", { condition: n.logic.show }) : w("Shown conditionally")
		}
	].filter(Boolean), k = /* @__PURE__ */ U("span", {
		onDoubleClick: (e) => {
			e.stopPropagation(), m || E(!0);
		},
		title: m || O.length ? void 0 : w("Double-Click to Rename"),
		className: z("min-w-0 flex-1 truncate", n.hidden ? "text-faint line-through decoration-faint/60" : te && "text-muted"),
		children: [ee, s && /* @__PURE__ */ H("span", {
			className: z("ml-1.5", i ? "text-muted" : "text-faint"),
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
		ref: v,
		"data-layer": n.id,
		style: {
			transform: X.Translate.toString(y),
			transition: b,
			paddingLeft: 4 + r * 12
		},
		...g,
		..._,
		onClick: (e) => {
			e.shiftKey ? u.extendTo(n.id) : t.emit("inspect", { node: n.id }), t.emit("scroll-to", { node: n.id });
		},
		onMouseEnter: () => u.hover(n.id),
		onKeyDown: (e) => {
			T || e.target !== e.currentTarget || (e.key === "Enter" || e.key === " " ? (e.preventDefault(), t.emit("inspect", { node: n.id }), t.emit("scroll-to", { node: n.id })) : !m && e.key === "F2" && (e.preventDefault(), E(!0)));
		},
		className: z("group relative flex h-7 pointer-coarse:h-10 cursor-default select-none items-center gap-1.5 rounded-md pr-1 text-sm -outline-offset-2", i ? "bg-focus-soft text-ink" : a ? "bg-hover text-text" : "text-text", x && "z-drag bg-bg opacity-80 shadow-pop"),
		children: [
			/* @__PURE__ */ H(P, {
				icon: "chevron-down",
				size: "xs",
				label: w(o ? "Expand" : "Collapse"),
				title: void 0,
				onClick: (e) => {
					e.stopPropagation(), l(n.id);
				},
				className: z("-mr-1 !size-4 !bg-transparent !text-faint hover:!text-ink [&_svg]:size-2.5 [&_svg]:transition-transform [&_svg]:duration-fast", o && "[&_svg]:-rotate-90", !S && "invisible")
			}),
			/* @__PURE__ */ H(N, {
				name: D ? "symbol" : h?.icon ?? "square",
				size: 14,
				className: z("shrink-0", n.hidden ? "text-ghost" : i ? "text-ink" : D ? "text-muted" : "text-faint")
			}),
			T ? /* @__PURE__ */ H("div", {
				className: "min-w-0 flex-1",
				onClick: (e) => e.stopPropagation(),
				onPointerDown: (e) => e.stopPropagation(),
				onKeyDown: (e) => e.stopPropagation(),
				onKeyUp: (e) => e.key === "Escape" && e.target.blur(),
				onBlur: () => E(!1),
				children: /* @__PURE__ */ H(e, {
					bare: !0,
					fields: [{
						handle: "label",
						type: "text",
						size: "sm",
						commit: "blur",
						label: w("Layer Name"),
						autofocus: !0,
						placeholder: h?.title
					}],
					values: { label: n.label ?? "" },
					onChange: (e, t) => u.updateNode(n.id, { label: t.trim() || void 0 })
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
				className: n.hidden ? "contents" : "hidden group-hover:contents group-focus-visible:contents [@media(hover:none)]:contents",
				children: /* @__PURE__ */ H(R, {
					content: n.hidden ? w("Show") : w("Hide"),
					children: /* @__PURE__ */ H(P, {
						icon: n.hidden ? "eye-off" : "eye",
						size: "xs",
						label: n.hidden ? w("Show") : w("Hide"),
						title: void 0,
						disabled: m,
						onClick: (e) => {
							e.stopPropagation(), u.updateNode(n.id, { hidden: !n.hidden || void 0 });
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
function ge(e) {
	let { catalog: t, types: n, isLoading: r, error: i, retry: o } = a(), s = e.bodyField.handle, c = l(e.values[s], (t) => e.setValue(s, t), !e.editable), d = j(e.values);
	d.current = e.values;
	let f = e.collection.handle === "templates" ? "template" : e.collection.handle === "components" ? "component" : "entry", p = e.entry?.id ?? null, { collections: m, props: h } = e.values, g = e.bodyField.allowed ?? _e, _ = A(() => t && {
		store: c,
		catalog: t,
		types: n,
		entryId: p,
		fieldHandle: s,
		allowed: g,
		getValues: () => d.current,
		title: e.title,
		doc: {
			kind: f,
			id: p ?? "",
			collections: m,
			props: h
		},
		readOnly: !e.editable
	}, [
		c,
		t,
		n,
		p,
		s,
		g,
		e.title,
		f,
		m,
		h,
		e.editable
	]);
	return r ? /* @__PURE__ */ U("div", {
		className: "flex h-full min-h-0",
		children: [/* @__PURE__ */ H("div", {
			className: "grid min-w-0 flex-1 place-items-center",
			children: /* @__PURE__ */ H(L, {})
		}), /* @__PURE__ */ H(F, {
			sheet: !0,
			className: ve,
			open: e.sidebarOpen,
			onOpenChange: e.setSidebarOpen,
			title: e.collection.singular,
			children: e.sidebar
		})]
	}) : _ ? /* @__PURE__ */ U(u, {
		value: _,
		children: [i && /* @__PURE__ */ H(I, {
			message: i.message,
			onRetry: o,
			compact: !0
		}), /* @__PURE__ */ H(xe, { props: e })]
	}) : /* @__PURE__ */ H(I, {
		message: i?.message,
		onRetry: o
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
	let { store: e } = p(), t = r(e, (e) => e.device);
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
	let { store: a, types: s, allowed: l, readOnly: u } = p(), d = r(a, (e) => e.selected ? v(e.nodes, e.selected) : null), _ = O(d), y = r(a, (e) => e.blockMode), x = r(a, (e) => o(e).length), E = r(a, () => a.canUndo()), A = r(a, () => a.canRedo()), [N, I] = M(!1), se = ce(), [L, R] = M(!1), [z, W] = M(""), G = le(), [de] = M(() => window.matchMedia("(max-width: 639px)").matches), fe = r(a, o);
	k(() => {
		window.matchMedia("(max-width: 639px)").matches && a.setDevice("phone");
	}, [a]), T({ items: fe.flatMap((e) => {
		let t = v(a.get().nodes, e);
		return t ? [{
			id: e,
			kind: "block",
			label: g(t, 40) || (s.get(t.type)?.title ?? w("Block")),
			icon: s.get(t.type)?.icon,
			read: () => v(a.get().nodes, e)
		}] : [];
	}) });
	let K = (t) => {
		a.select(t, !0), I(!0), e.setSidebarOpen(!0);
	};
	k(() => {
		d && y ? (I(!0), e.setSidebarOpen(!0), G || se.setOpen(!1)) : d && G && e.sidebarOpen && I(!0);
	}, [
		d?.id,
		y,
		G
	]), k(() => {
		e.sidebarOpen ? !G && a.get().selected && (I(!0), window.matchMedia("(max-width: 639px)").matches && t.emit("scroll-to", {
			node: a.get().selected,
			top: !0
		})) : I(!1);
	}, [e.sidebarOpen]), k(() => {
		Object.keys(e.errors).length && I(!1);
	}, [e.errors]), k(() => t.on("preview-motion", () => ee.emit("entry.preview")), []);
	let q = j(K);
	q.current = K, k(() => t.on("inspect", ({ node: e }) => q.current(e)), []);
	let J = D(() => {
		a.select(null), I(!1);
	}, [a]), { setSidebarOpen: Y } = e, X = D(() => Y(!1), [Y]), Z = (e) => {
		let t = a.get(), n = t.selected ? v(t.nodes, t.selected) : null;
		return n && (Array.isArray(e) ? e : [e]).every((e) => C(n, e, s)) ? {
			parentId: n.id,
			index: n.children?.length ?? 0
		} : t.selected ? b(t.nodes, t.selected, e, s, l) : (Array.isArray(e) ? e : [e]).every((e) => C(null, e, s, l)) ? {
			parentId: null,
			index: t.nodes.length
		} : null;
	}, Q = (e) => {
		let t = S(e, s);
		if (!t.length) return;
		let r = Z(t.map((e) => e.type));
		r && (a.insert(r.parentId, r.index, t), h(a, t[0], n(c(a.get().nodes, s, () => !1))), R(!1), W(""));
	};
	return /* @__PURE__ */ U("div", {
		className: "flex h-full min-h-0 flex-col",
		"data-block-workspace": !0,
		children: [
			e.toolbar && ue(/* @__PURE__ */ U(V, { children: [
				!u && (de ? /* @__PURE__ */ U(V, { children: [/* @__PURE__ */ H(P, {
					icon: "plus",
					label: w("Insert Block"),
					onClick: () => R(!0)
				}), /* @__PURE__ */ H(re, {
					open: L,
					onOpenChange: R,
					title: w("Insert Block"),
					children: /* @__PURE__ */ H(m, {
						className: "!max-h-none !w-full",
						types: [...s.values()],
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
					children: /* @__PURE__ */ H(m, {
						types: [...s.values()],
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
					onClick: a.undo
				}),
				/* @__PURE__ */ H(P, {
					icon: "redo",
					label: w("Redo"),
					disabled: !A,
					onClick: a.redo
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
						/* @__PURE__ */ H(i, {
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
					title: N && d ? s.get(d.type)?.title ?? w("Block") : e.collection.singular,
					children: N && d ? x > 1 ? /* @__PURE__ */ U(V, { children: [/* @__PURE__ */ H(ie, {
						title: te(x, "{count} block selected", "{count} blocks selected"),
						onBack: J,
						backLabel: e.collection.singular,
						onClose: () => e.setSidebarOpen(!1)
					}), !u && /* @__PURE__ */ H("div", {
						className: "px-2 py-3",
						children: /* @__PURE__ */ H(ne, {
							variant: "destructive",
							size: "sm",
							icon: "trash",
							onClick: () => a.removeSelection(),
							children: w("Delete")
						})
					})] }) : /* @__PURE__ */ H(f, {
						node: _?.id === d.id ? _ : d,
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
