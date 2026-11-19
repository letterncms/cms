import { B as e, P as t, Q as n, Y as r, an as i, at as a, cn as o, et as s, in as c, it as l, ln as u, on as d, rn as f, sn as p, t as m, tn as h } from "./Inspector-CVdH4V13.js";
import { _ as g, a as _, c as v, f as y, i as b, l as x, n as S, t as C } from "./insert-CkvRCi8F.js";
import { events as ee, plural as w, t as T, useScreenContext as E } from "@letterncms/sdk";
import { memo as D, useCallback as O, useDeferredValue as k, useEffect as A, useMemo as j, useRef as M, useState as N } from "react";
import { Button as te, Dialog as ne, Icon as P, IconButton as F, InspectorPanel as re, PanelHeader as ie, Popover as ae, QueryError as I, ScreenSidebar as oe, Segmented as L, Spinner as R, Tooltip as z, UndoRedo as se, cn as B, fieldControlId as V, useScreenSidebar as ce, useWideInspector as le } from "@letterncms/ui";
import { Fragment as H, jsx as U, jsxs as W } from "react/jsx-runtime";
import { createPortal as ue } from "react-dom";
import { DndContext as G, PointerSensor as K, closestCenter as de, useSensor as fe, useSensors as q } from "@dnd-kit/core";
import { SortableContext as J, useSortable as Y, verticalListSortingStrategy as X } from "@dnd-kit/sortable";
import { CSS as pe } from "@dnd-kit/utilities";
// admin/src/builder/Layers.tsx
var me = D(function() {
	let { store: e, types: t, allowed: n, readOnly: r } = u(), [i, a] = N({}), o = q(fe(K, { activationConstraint: { distance: 4 } })), s = O((e) => a((t) => ({
		...t,
		[e]: !t[e]
	})), []), c = O((e) => a((t) => e.some((e) => t[e]) ? {
		...t,
		...Object.fromEntries(e.map((e) => [e, !1]))
	} : t), []);
	return /* @__PURE__ */ U(G, {
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
		children: /* @__PURE__ */ U(Z, {
			collapsed: i,
			onToggle: s,
			onReveal: c
		})
	});
});
function Z({ collapsed: e, onToggle: t, onReveal: n }) {
	let { store: r, types: i } = u(), a = k(c(r, (e) => e.nodes)), s = c(r, (e) => e.selected), l = c(r, f), d = c(r, (e) => e.hovered);
	A(() => {
		s && (n(_(r.get().nodes, s).map((e) => e.id)), document.querySelector(`[data-layer="${s}"]`)?.scrollIntoView({ block: "nearest" }));
	}, [s]);
	let p = j(() => he(a, (e) => !!i.get(e.type)?.children || !!e.children?.length), [a, i]), m = o(), h = j(() => {
		let t = [], n = (r, i) => r.forEach((r) => {
			t.push({
				node: r,
				depth: i
			}), r.children && !e[r.id] && n(r.children, i + 1);
		});
		return n(a, 0), t;
	}, [a, e]), g = h.map((e) => e.node.id).join(" "), v = j(() => g ? g.split(" ") : [], [g]);
	return a.length === 0 ? /* @__PURE__ */ U("div", {
		className: "px-4 py-3",
		children: /* @__PURE__ */ U("p", {
			className: "m-0 text-sm text-muted",
			children: T("No elements yet")
		})
	}) : /* @__PURE__ */ U(J, {
		items: v,
		strategy: X,
		children: /* @__PURE__ */ U("div", {
			className: "space-y-px px-2 pb-3 pt-1",
			onMouseLeave: () => r.hover(null),
			children: h.map(({ node: n, depth: r }) => /* @__PURE__ */ U(ge, {
				node: n,
				depth: r,
				selected: l.includes(n.id),
				hovered: d === n.id,
				collapsed: !!e[n.id],
				hint: e[n.id] || !n.children?.length ? p.get(n.id) : void 0,
				components: m,
				onToggle: t
			}, n.id))
		})
	});
}
function Q(e, t) {
	if (e.type !== "box") return t;
	let n = {
		section: T("Section"),
		header: T("Header"),
		footer: T("Footer"),
		nav: T("Navigation"),
		main: T("Main Content"),
		aside: T("Aside"),
		article: T("Article"),
		ul: T("List"),
		ol: T("List"),
		li: T("List Item"),
		a: T("Link"),
		button: T("Button"),
		form: T("Form"),
		figure: T("Figure")
	}, r = String(e.props?.tag ?? "");
	if (n[r]) return n[r];
	let i = new Set((e.class ?? "").split(/\s+/).filter((e) => !e.includes(":")));
	return i.has("grid") || i.has("inline-grid") ? T("Grid") : i.has("flex") || i.has("inline-flex") ? i.has("flex-col") || i.has("flex-col-reverse") ? T("Stack") : T("Row||layout") : t;
}
function $(e, t) {
	let n = g(e, t);
	if (n) return n;
	let r = String(e.bind?.text ?? "").replace(/[{}]/g, "").split("|")[0].trim().split(".").pop() ?? "";
	return r ? r.replace(/[_-]+/g, " ").replace(/^\w/, (e) => e.toUpperCase()) : "";
}
function he(e, t) {
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
var ge = D(function({ node: e, depth: n, selected: r, hovered: i, collapsed: a, hint: o, components: s, onToggle: c }) {
	let { store: f, types: p, readOnly: m } = u(), h = p.get(e.type), { attributes: g, listeners: _, setNodeRef: v, transform: y, transition: b, isDragging: x } = Y({
		id: e.id,
		disabled: m
	}), S = (e.children?.length ?? 0) > 0, C = !!h?.children || S, ee = e.type === "component" ? d(e, p, s) : e.label || (C ? Q(e, h?.title ?? e.type) : $(e, 48) || h?.title || e.type), w = !e.label && e.type !== "component" && !C && !$(e, 48), [E, D] = N(!1), O = e.type === "component", k = [
		e.motion?.length && {
			icon: "animated",
			title: T("Animated")
		},
		e.logic && {
			icon: "interactive",
			title: T("Interactive")
		},
		e.bind && Object.keys(e.bind).some((e) => e !== "visible" && e !== "hidden") && {
			icon: "database",
			title: T("Connected to Data")
		},
		(e.logic?.show || e.bind?.visible || e.bind?.hidden) && {
			icon: "eye-off",
			title: e.logic?.show ? T("Shown when {condition}", { condition: e.logic.show }) : T("Shown conditionally")
		}
	].filter(Boolean), A = /* @__PURE__ */ W("span", {
		onDoubleClick: (e) => {
			e.stopPropagation(), m || D(!0);
		},
		className: B("min-w-0 flex-1 truncate", e.hidden ? "text-faint line-through decoration-faint/60" : w && "text-muted"),
		children: [ee, o && /* @__PURE__ */ U("span", {
			className: B("ml-1.5", r ? "text-muted" : "text-faint"),
			children: o
		})]
	}), j = k.length ? /* @__PURE__ */ U(z, {
		content: /* @__PURE__ */ U("span", {
			className: "grid gap-1",
			children: k.map((e) => /* @__PURE__ */ W("span", {
				className: "flex items-center gap-1.5",
				children: [/* @__PURE__ */ U(P, {
					name: e.icon,
					size: 12
				}), e.title]
			}, e.icon))
		}),
		children: A
	}) : /* @__PURE__ */ U(z, {
		content: m ? void 0 : T("Double-Click to Rename"),
		children: A
	});
	return /* @__PURE__ */ W("div", {
		ref: v,
		"data-layer": e.id,
		style: {
			transform: pe.Translate.toString(y),
			transition: b,
			paddingLeft: 4 + n * 12
		},
		...g,
		..._,
		onClick: (t) => {
			t.shiftKey ? f.extendTo(e.id) : l.emit("inspect", { node: e.id }), l.emit("scroll-to", { node: e.id });
		},
		onContextMenu: (t) => {
			if (m || E) return;
			t.preventDefault();
			let n = t.currentTarget.getBoundingClientRect(), r = t.clientX === 0 && t.clientY === 0;
			l.emit("block-menu", {
				node: e.id,
				x: r ? n.left + 24 : t.clientX,
				y: r ? n.bottom : t.clientY
			});
		},
		onMouseEnter: () => f.hover(e.id),
		onKeyDown: (t) => {
			E || t.target !== t.currentTarget || (t.key === "Enter" || t.key === " " ? (t.preventDefault(), l.emit("inspect", { node: e.id }), l.emit("scroll-to", { node: e.id })) : !m && t.key === "F2" && (t.preventDefault(), D(!0)));
		},
		className: B("group relative flex h-7 pointer-coarse:h-10 cursor-default select-none items-center gap-1.5 rounded-md pr-1 text-sm -outline-offset-2", r ? "bg-focus-soft text-ink" : i ? "bg-hover text-text" : "text-text", x && "z-drag bg-bg opacity-80 shadow-pop"),
		children: [
			/* @__PURE__ */ U(F, {
				icon: "chevron-down",
				size: "xs",
				label: T(a ? "Expand" : "Collapse"),
				title: void 0,
				onClick: (t) => {
					t.stopPropagation(), c(e.id);
				},
				className: B("-mr-1 !size-4 !bg-transparent !text-faint hover:!text-ink [&_svg]:size-2.5 [&_svg]:transition-transform [&_svg]:duration-fast", a && "[&_svg]:-rotate-90", !S && "invisible")
			}),
			/* @__PURE__ */ U(P, {
				name: O ? "symbol" : h?.icon ?? "square",
				size: 14,
				className: B("shrink-0", e.hidden ? "text-ghost" : r ? "text-ink" : O ? "text-muted" : "text-faint")
			}),
			E ? /* @__PURE__ */ U("div", {
				className: "min-w-0 flex-1",
				onClick: (e) => e.stopPropagation(),
				onPointerDown: (e) => e.stopPropagation(),
				onKeyDown: (e) => e.stopPropagation(),
				onKeyUp: (e) => e.key === "Escape" && e.target.blur(),
				onBlur: () => D(!1),
				children: /* @__PURE__ */ U(t, {
					bare: !0,
					fields: [{
						handle: "label",
						type: "text",
						size: "sm",
						commit: "blur",
						label: T("Layer Name"),
						autofocus: !0,
						placeholder: h?.title
					}],
					values: { label: e.label ?? "" },
					onChange: (t, n) => f.updateNode(e.id, { label: n.trim() || void 0 })
				})
			}) : j,
			!E && k.map((e) => /* @__PURE__ */ U("span", {
				role: "img",
				"aria-label": e.title,
				className: "grid size-5 shrink-0 place-items-center text-faint group-hover:hidden group-focus-visible:hidden",
				children: /* @__PURE__ */ U(P, {
					name: e.icon,
					size: 12
				})
			}, e.icon)),
			/* @__PURE__ */ U("span", {
				className: e.hidden ? "contents" : "hidden group-hover:contents group-focus-visible:contents [@media(hover:none)]:contents",
				children: /* @__PURE__ */ U(z, {
					content: e.hidden ? T("Show") : T("Hide"),
					children: /* @__PURE__ */ U(F, {
						icon: e.hidden ? "eye-off" : "eye",
						size: "xs",
						label: e.hidden ? T("Show") : T("Hide"),
						title: void 0,
						disabled: m,
						onClick: (t) => {
							t.stopPropagation(), f.updateNode(e.id, { hidden: !e.hidden || void 0 });
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
function _e(e) {
	let { catalog: t, types: n, isLoading: r, error: a, retry: o } = p(), s = e.bodyField.handle, c = h(e.values[s], (t) => e.setValue(s, t), !e.editable), l = M(e.values);
	l.current = e.values;
	let u = e.collection.handle === "templates" ? "template" : e.collection.handle === "components" ? "component" : "entry", d = e.entry?.id ?? null, { collections: f, props: m } = e.values, g = e.bodyField.allowed ?? ve, _ = j(() => t && {
		store: c,
		catalog: t,
		types: n,
		entryId: d,
		fieldHandle: s,
		allowed: g,
		getValues: () => l.current,
		title: e.title,
		doc: {
			kind: u,
			id: d ?? "",
			collections: f,
			props: m
		},
		readOnly: !e.editable
	}, [
		c,
		t,
		n,
		d,
		s,
		g,
		e.title,
		u,
		f,
		m,
		e.editable
	]);
	return r ? /* @__PURE__ */ W("div", {
		className: "flex h-full min-h-0",
		children: [/* @__PURE__ */ U("div", {
			className: "grid min-w-0 flex-1 place-items-center",
			children: /* @__PURE__ */ U(R, {})
		}), /* @__PURE__ */ U(re, {
			sheet: !0,
			className: ye,
			open: e.sidebarOpen,
			onOpenChange: e.setSidebarOpen,
			title: e.collection.singular,
			children: e.sidebar
		})]
	}) : _ ? /* @__PURE__ */ W(i, {
		value: _,
		children: [a && /* @__PURE__ */ U(I, {
			message: a.message,
			onRetry: o,
			compact: !0
		}), /* @__PURE__ */ U(Se, { props: e })]
	}) : /* @__PURE__ */ U(I, {
		message: a?.message,
		onRetry: o
	});
}
var ve = [], ye = "cms-block-sheet", be = () => [
	{
		value: "desktop",
		label: T("Desktop"),
		icon: "monitor"
	},
	{
		value: "tablet",
		label: T("Tablet"),
		icon: "tablet"
	},
	{
		value: "phone",
		label: T("Phone"),
		icon: "phone"
	}
];
function xe() {
	let { store: e } = u(), t = c(e, (e) => e.device);
	return /* @__PURE__ */ U(L, {
		"aria-label": T("Screen"),
		value: t,
		onChange: e.setDevice,
		options: be().map((e) => ({
			value: e.value,
			icon: e.icon,
			title: e.label
		})),
		className: "max-sm:hidden"
	});
}
function Se({ props: t }) {
	let { store: i, types: o, allowed: d, readOnly: p } = u(), h = c(i, (e) => e.selected ? v(e.nodes, e.selected) : null), _ = k(h), y = c(i, (e) => e.blockMode), x = c(i, (e) => f(e).length), D = c(i, () => i.canUndo()), j = c(i, () => i.canRedo()), [P, I] = N(!1), L = ce(), [R, z] = N(!1), [B, G] = N(""), K = le(), [de] = N(() => window.matchMedia("(max-width: 639px)").matches), fe = c(i, f);
	A(() => {
		window.matchMedia("(max-width: 639px)").matches && i.setDevice("phone");
	}, [i]), E({ items: fe.flatMap((e) => {
		let t = v(i.get().nodes, e);
		return t ? [{
			id: e,
			kind: "block",
			label: g(t, 40) || (o.get(t.type)?.title ?? T("Block")),
			icon: o.get(t.type)?.icon,
			read: () => v(i.get().nodes, e)
		}] : [];
	}) });
	let q = (e) => {
		i.select(e, !0), I(!0), t.setSidebarOpen(!0);
	};
	A(() => {
		h && y ? (I(!0), t.setSidebarOpen(!0), K || L.setOpen(!1)) : h && K && t.sidebarOpen && I(!0);
	}, [
		h?.id,
		y,
		K
	]), A(() => {
		t.sidebarOpen ? !K && i.get().selected && (I(!0), window.matchMedia("(max-width: 639px)").matches && l.emit("scroll-to", {
			node: i.get().selected,
			top: !0
		})) : I(!1);
	}, [t.sidebarOpen]), A(() => {
		Object.keys(t.errors).length && I(!1);
	}, [t.errors]), A(() => l.on("preview-motion", () => ee.emit("entry.preview")), []);
	let J = M(q);
	J.current = q, A(() => l.on("inspect", ({ node: e }) => J.current(e)), []);
	let Y = O(() => {
		i.select(null), I(!1);
	}, [i]), { setSidebarOpen: X } = t, pe = O(() => X(!1), [X]), Z = (e) => {
		let t = i.get(), n = t.selected ? v(t.nodes, t.selected) : null;
		return n && (Array.isArray(e) ? e : [e]).every((e) => C(n, e, o)) ? {
			parentId: n.id,
			index: n.children?.length ?? 0
		} : t.selected ? b(t.nodes, t.selected, e, o, d) : (Array.isArray(e) ? e : [e]).every((e) => C(null, e, o, d)) ? {
			parentId: null,
			index: t.nodes.length
		} : null;
	}, Q = (e) => {
		let t = S(e, o);
		if (!t.length) return;
		let a = Z(t.map((e) => e.type));
		a && (i.insert(a.parentId, a.index, t), s(i, t[0], n(r(i.get().nodes, o, () => !1))), z(!1), G(""));
	};
	return /* @__PURE__ */ W("div", {
		className: "flex h-full min-h-0 flex-col",
		"data-block-workspace": !0,
		children: [
			t.toolbar && ue(/* @__PURE__ */ W(H, { children: [
				!p && (de ? /* @__PURE__ */ W(H, { children: [/* @__PURE__ */ U(F, {
					icon: "plus",
					label: T("Insert Block"),
					onClick: () => z(!0)
				}), /* @__PURE__ */ U(ne, {
					open: R,
					onOpenChange: z,
					title: T("Insert Block"),
					children: /* @__PURE__ */ U(a, {
						className: "!max-h-none !w-full",
						types: [...o.values()],
						query: B,
						onQuery: G,
						onChoose: Q,
						onClose: () => z(!1),
						allowed: (e) => !!Z(e.name)
					})
				})] }) : /* @__PURE__ */ U(ae, {
					open: R,
					onOpenChange: z,
					align: "start",
					trigger: /* @__PURE__ */ U(F, {
						icon: "plus",
						label: T("Insert Block")
					}),
					className: "!p-0",
					children: /* @__PURE__ */ U(a, {
						types: [...o.values()],
						query: B,
						onQuery: G,
						onChoose: Q,
						onClose: () => z(!1),
						allowed: (e) => !!Z(e.name)
					})
				})),
				/* @__PURE__ */ U(se, {
					history: {
						undo: i.undo,
						redo: i.redo,
						canUndo: D,
						canRedo: j
					},
					keys: "own"
				}),
				/* @__PURE__ */ U(xe, {})
			] }), t.toolbar),
			/* @__PURE__ */ U(oe, {
				title: T("Outline||structure"),
				backTo: t.listPath,
				backLabel: t.listLabel ?? t.collection.title,
				children: /* @__PURE__ */ U(me, {})
			}),
			/* @__PURE__ */ W("div", {
				className: "flex min-h-0 flex-1",
				children: [/* @__PURE__ */ W("main", {
					id: V(t.bodyField),
					tabIndex: -1,
					"aria-label": t.bodyField.label,
					"aria-describedby": t.errors[t.bodyField.handle] ? `${V(t.bodyField)}-error` : void 0,
					className: "flex min-w-0 flex-1 flex-col outline-none",
					"data-editor-document": !0,
					children: [
						/* @__PURE__ */ U(e, {
							collection: t.collection.handle,
							blueprint: t.collection.blueprint,
							entryId: t.entry?.id,
							content: t.content,
							onTitleChange: ["templates", "components"].includes(t.collection.handle) ? void 0 : t.setTitle,
							onInspect: q
						}),
						t.errors[t.bodyField.handle] && /* @__PURE__ */ U("p", {
							id: `${V(t.bodyField)}-error`,
							role: "alert",
							className: "m-0 shrink-0 px-3 py-2 text-xs text-danger",
							children: t.errors[t.bodyField.handle]
						}),
						/* @__PURE__ */ U("div", {
							className: "max-h-[30vh] shrink-0 overflow-y-auto",
							children: t.footer
						})
					]
				}), /* @__PURE__ */ U(re, {
					sheet: !0,
					className: ye,
					open: t.sidebarOpen,
					onOpenChange: t.setSidebarOpen,
					title: P && h ? o.get(h.type)?.title ?? T("Block") : t.collection.singular,
					children: P && h ? x > 1 ? /* @__PURE__ */ W(H, { children: [/* @__PURE__ */ U(ie, {
						title: w(x, "{count} block selected", "{count} blocks selected"),
						onBack: Y,
						backLabel: t.collection.singular,
						onClose: () => t.setSidebarOpen(!1)
					}), !p && /* @__PURE__ */ U("div", {
						className: "px-2 py-3",
						children: /* @__PURE__ */ U(te, {
							variant: "destructive",
							size: "sm",
							icon: "trash",
							onClick: () => i.removeSelection(),
							children: T("Delete")
						})
					})] }) : /* @__PURE__ */ U(m, {
						node: _?.id === h.id ? _ : h,
						onBack: Y,
						backLabel: t.collection.singular,
						onClose: pe
					}) : t.sidebar
				})]
			})
		]
	});
}
export { _e as BlocksWorkspace };
