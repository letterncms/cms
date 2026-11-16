import { $t as e, B as t, P as n, Q as r, Y as i, an as a, at as o, et as s, in as c, it as l, nn as u, on as d, rn as f, sn as p, t as m, tn as h } from "./Inspector-Dn4Zpr_0.js";
import { _ as g, a as _, c as v, f as y, i as b, l as x, n as S, t as C } from "./insert-V_nHpAvO.js";
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
	let { store: r, types: i } = p(), a = O(u(r, (e) => e.nodes)), o = u(r, (e) => e.selected), s = u(r, h), c = u(r, (e) => e.hovered);
	k(() => {
		o && (n(_(r.get().nodes, o).map((e) => e.id)), document.querySelector(`[data-layer="${o}"]`)?.scrollIntoView({ block: "nearest" }));
	}, [o]);
	let l = A(() => me(a, (e) => !!i.get(e.type)?.children || !!e.children?.length), [a, i]), f = d(), m = A(() => {
		let t = [], n = (r, i) => r.forEach((r) => {
			t.push({
				node: r,
				depth: i
			}), r.children && !e[r.id] && n(r.children, i + 1);
		});
		return n(a, 0), t;
	}, [a, e]), g = m.map((e) => e.node.id).join(" "), v = A(() => g ? g.split(" ") : [], [g]);
	return a.length === 0 ? /* @__PURE__ */ H("div", {
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
			onMouseLeave: () => r.hover(null),
			children: m.map(({ node: n, depth: r }) => /* @__PURE__ */ H(he, {
				node: n,
				depth: r,
				selected: s.includes(n.id),
				hovered: c === n.id,
				collapsed: !!e[n.id],
				hint: e[n.id] || !n.children?.length ? l.get(n.id) : void 0,
				components: f,
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
var he = E(function({ node: e, depth: t, selected: r, hovered: i, collapsed: a, hint: o, components: s, onToggle: u }) {
	let { store: d, types: f, readOnly: m } = p(), h = f.get(e.type), { attributes: g, listeners: _, setNodeRef: v, transform: y, transition: b, isDragging: x } = J({
		id: e.id,
		disabled: m
	}), S = (e.children?.length ?? 0) > 0, C = !!h?.children || S, ee = e.type === "component" ? c(e, f, s) : e.label || (C ? Q(e, h?.title ?? e.type) : $(e, 48) || h?.title || e.type), te = !e.label && e.type !== "component" && !C && !$(e, 48), [T, E] = M(!1), D = e.type === "component", O = [
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
			e.stopPropagation(), m || E(!0);
		},
		className: z("min-w-0 flex-1 truncate", e.hidden ? "text-faint line-through decoration-faint/60" : te && "text-muted"),
		children: [ee, o && /* @__PURE__ */ H("span", {
			className: z("ml-1.5", r ? "text-muted" : "text-faint"),
			children: o
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
	}) : /* @__PURE__ */ H(R, {
		content: m ? void 0 : w("Double-Click to Rename"),
		children: k
	});
	return /* @__PURE__ */ U("div", {
		ref: v,
		"data-layer": e.id,
		style: {
			transform: X.Translate.toString(y),
			transition: b,
			paddingLeft: 4 + t * 12
		},
		...g,
		..._,
		onClick: (t) => {
			t.shiftKey ? d.extendTo(e.id) : l.emit("inspect", { node: e.id }), l.emit("scroll-to", { node: e.id });
		},
		onContextMenu: (t) => {
			if (m || T) return;
			t.preventDefault();
			let n = t.currentTarget.getBoundingClientRect(), r = t.clientX === 0 && t.clientY === 0;
			l.emit("block-menu", {
				node: e.id,
				x: r ? n.left + 24 : t.clientX,
				y: r ? n.bottom : t.clientY
			});
		},
		onMouseEnter: () => d.hover(e.id),
		onKeyDown: (t) => {
			T || t.target !== t.currentTarget || (t.key === "Enter" || t.key === " " ? (t.preventDefault(), l.emit("inspect", { node: e.id }), l.emit("scroll-to", { node: e.id })) : !m && t.key === "F2" && (t.preventDefault(), E(!0)));
		},
		className: z("group relative flex h-7 pointer-coarse:h-10 cursor-default select-none items-center gap-1.5 rounded-md pr-1 text-sm -outline-offset-2", r ? "bg-focus-soft text-ink" : i ? "bg-hover text-text" : "text-text", x && "z-drag bg-bg opacity-80 shadow-pop"),
		children: [
			/* @__PURE__ */ H(P, {
				icon: "chevron-down",
				size: "xs",
				label: w(a ? "Expand" : "Collapse"),
				title: void 0,
				onClick: (t) => {
					t.stopPropagation(), u(e.id);
				},
				className: z("-mr-1 !size-4 !bg-transparent !text-faint hover:!text-ink [&_svg]:size-2.5 [&_svg]:transition-transform [&_svg]:duration-fast", a && "[&_svg]:-rotate-90", !S && "invisible")
			}),
			/* @__PURE__ */ H(N, {
				name: D ? "symbol" : h?.icon ?? "square",
				size: 14,
				className: z("shrink-0", e.hidden ? "text-ghost" : r ? "text-ink" : D ? "text-muted" : "text-faint")
			}),
			T ? /* @__PURE__ */ H("div", {
				className: "min-w-0 flex-1",
				onClick: (e) => e.stopPropagation(),
				onPointerDown: (e) => e.stopPropagation(),
				onKeyDown: (e) => e.stopPropagation(),
				onKeyUp: (e) => e.key === "Escape" && e.target.blur(),
				onBlur: () => E(!1),
				children: /* @__PURE__ */ H(n, {
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
					values: { label: e.label ?? "" },
					onChange: (t, n) => d.updateNode(e.id, { label: n.trim() || void 0 })
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
						disabled: m,
						onClick: (t) => {
							t.stopPropagation(), d.updateNode(e.id, { hidden: !e.hidden || void 0 });
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
	let { catalog: n, types: r, isLoading: i, error: o, retry: s } = a(), c = t.bodyField.handle, l = e(t.values[c], (e) => t.setValue(c, e), !t.editable), u = j(t.values);
	u.current = t.values;
	let d = t.collection.handle === "templates" ? "template" : t.collection.handle === "components" ? "component" : "entry", p = t.entry?.id ?? null, { collections: m, props: h } = t.values, g = t.bodyField.allowed ?? _e, _ = A(() => n && {
		store: l,
		catalog: n,
		types: r,
		entryId: p,
		fieldHandle: c,
		allowed: g,
		getValues: () => u.current,
		title: t.title,
		doc: {
			kind: d,
			id: p ?? "",
			collections: m,
			props: h
		},
		readOnly: !t.editable
	}, [
		l,
		n,
		r,
		p,
		c,
		g,
		t.title,
		d,
		m,
		h,
		t.editable
	]);
	return i ? /* @__PURE__ */ U("div", {
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
	}) : _ ? /* @__PURE__ */ U(f, {
		value: _,
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
	let { store: e } = p(), t = u(e, (e) => e.device);
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
	let { store: n, types: a, allowed: c, readOnly: d } = p(), f = u(n, (e) => e.selected ? v(e.nodes, e.selected) : null), _ = O(f), y = u(n, (e) => e.blockMode), x = u(n, (e) => h(e).length), E = u(n, () => n.canUndo()), A = u(n, () => n.canRedo()), [N, I] = M(!1), se = ce(), [L, R] = M(!1), [z, W] = M(""), G = le(), [de] = M(() => window.matchMedia("(max-width: 639px)").matches), fe = u(n, h);
	k(() => {
		window.matchMedia("(max-width: 639px)").matches && n.setDevice("phone");
	}, [n]), T({ items: fe.flatMap((e) => {
		let t = v(n.get().nodes, e);
		return t ? [{
			id: e,
			kind: "block",
			label: g(t, 40) || (a.get(t.type)?.title ?? w("Block")),
			icon: a.get(t.type)?.icon,
			read: () => v(n.get().nodes, e)
		}] : [];
	}) });
	let K = (t) => {
		n.select(t, !0), I(!0), e.setSidebarOpen(!0);
	};
	k(() => {
		f && y ? (I(!0), e.setSidebarOpen(!0), G || se.setOpen(!1)) : f && G && e.sidebarOpen && I(!0);
	}, [
		f?.id,
		y,
		G
	]), k(() => {
		e.sidebarOpen ? !G && n.get().selected && (I(!0), window.matchMedia("(max-width: 639px)").matches && l.emit("scroll-to", {
			node: n.get().selected,
			top: !0
		})) : I(!1);
	}, [e.sidebarOpen]), k(() => {
		Object.keys(e.errors).length && I(!1);
	}, [e.errors]), k(() => l.on("preview-motion", () => ee.emit("entry.preview")), []);
	let q = j(K);
	q.current = K, k(() => l.on("inspect", ({ node: e }) => q.current(e)), []);
	let J = D(() => {
		n.select(null), I(!1);
	}, [n]), { setSidebarOpen: Y } = e, X = D(() => Y(!1), [Y]), Z = (e) => {
		let t = n.get(), r = t.selected ? v(t.nodes, t.selected) : null;
		return r && (Array.isArray(e) ? e : [e]).every((e) => C(r, e, a)) ? {
			parentId: r.id,
			index: r.children?.length ?? 0
		} : t.selected ? b(t.nodes, t.selected, e, a, c) : (Array.isArray(e) ? e : [e]).every((e) => C(null, e, a, c)) ? {
			parentId: null,
			index: t.nodes.length
		} : null;
	}, Q = (e) => {
		let t = S(e, a);
		if (!t.length) return;
		let o = Z(t.map((e) => e.type));
		o && (n.insert(o.parentId, o.index, t), s(n, t[0], r(i(n.get().nodes, a, () => !1))), R(!1), W(""));
	};
	return /* @__PURE__ */ U("div", {
		className: "flex h-full min-h-0 flex-col",
		"data-block-workspace": !0,
		children: [
			e.toolbar && ue(/* @__PURE__ */ U(V, { children: [
				!d && (de ? /* @__PURE__ */ U(V, { children: [/* @__PURE__ */ H(P, {
					icon: "plus",
					label: w("Insert Block"),
					onClick: () => R(!0)
				}), /* @__PURE__ */ H(re, {
					open: L,
					onOpenChange: R,
					title: w("Insert Block"),
					children: /* @__PURE__ */ H(o, {
						className: "!max-h-none !w-full",
						types: [...a.values()],
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
					children: /* @__PURE__ */ H(o, {
						types: [...a.values()],
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
					onClick: n.undo
				}),
				/* @__PURE__ */ H(P, {
					icon: "redo",
					label: w("Redo"),
					disabled: !A,
					onClick: n.redo
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
						/* @__PURE__ */ H(t, {
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
					title: N && f ? a.get(f.type)?.title ?? w("Block") : e.collection.singular,
					children: N && f ? x > 1 ? /* @__PURE__ */ U(V, { children: [/* @__PURE__ */ H(ie, {
						title: te(x, "{count} block selected", "{count} blocks selected"),
						onBack: J,
						backLabel: e.collection.singular,
						onClose: () => e.setSidebarOpen(!1)
					}), !d && /* @__PURE__ */ H("div", {
						className: "px-2 py-3",
						children: /* @__PURE__ */ H(ne, {
							variant: "destructive",
							size: "sm",
							icon: "trash",
							onClick: () => n.removeSelection(),
							children: w("Delete")
						})
					})] }) : /* @__PURE__ */ H(m, {
						node: _?.id === f.id ? _ : f,
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
