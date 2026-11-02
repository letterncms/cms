import { can as e, loadManifest as t, locale as n, plural as r, registry as i, run as a, setQuery as o, t as s, useLocation as c, useManifest as l } from "@letterncms/sdk";
import { useEffect as u, useMemo as d, useRef as f, useState as p, useSyncExternalStore as m } from "react";
import { Button as h, Dialog as g, Fields as _, Icon as v, IconButton as y, Menu as b, Page as x, WidgetMessage as S, WidgetSlot as C, cn as w, confirm as T, toast as E, useShortcut as D } from "@letterncms/ui";
import { Fragment as O, jsx as k, jsxs as A } from "react/jsx-runtime";
import { DndContext as j, DragOverlay as M, KeyboardSensor as N, PointerSensor as P, closestCenter as F, pointerWithin as I, useDroppable as L, useSensor as R, useSensors as z } from "@dnd-kit/core";
import { SortableContext as B, arrayMove as V, rectSortingStrategy as H, sortableKeyboardCoordinates as U, useSortable as W } from "@dnd-kit/sortable";
import { CSS as G } from "@dnd-kit/utilities";
// admin/src/Gallery.tsx
function K({ open: e, onOpenChange: t, widgets: n, shown: r, onAdd: i, onRemove: a }) {
	let [o, c] = p("");
	u(() => {
		e && c("");
	}, [e]);
	let l = o.trim().toLowerCase(), d = n.filter((e) => !l || [
		e.label,
		e.description,
		e.source
	].some((e) => e.toLowerCase().includes(l))).sort((e, t) => e.label.localeCompare(t.label));
	return /* @__PURE__ */ A(g, {
		open: e,
		onOpenChange: t,
		size: "lg",
		title: s("Widgets"),
		footer: /* @__PURE__ */ A(O, { children: [/* @__PURE__ */ k("span", {
			className: "mr-auto text-xs text-muted",
			children: s("{count} on your home screen", { count: r.size })
		}), /* @__PURE__ */ k(h, {
			variant: "primary",
			onClick: () => t(!1),
			children: s("Done")
		})] }),
		children: [
			/* @__PURE__ */ k(_, {
				bare: !0,
				fields: [{
					handle: "search",
					type: "text",
					label: s("Search Widgets"),
					placeholder: s("Search widgets…"),
					icon: "search",
					autofocus: !0
				}],
				values: { search: o },
				onChange: (e, t) => c(String(t ?? "")),
				className: "mb-4"
			}),
			d.length === 0 && /* @__PURE__ */ k("p", {
				className: "m-0 py-10 text-center text-sm text-muted",
				children: s("No widget matches “{search}”", { search: o })
			}),
			/* @__PURE__ */ k(q, {
				widgets: d,
				shown: r,
				onAdd: i,
				onRemove: a
			})
		]
	});
}
function q({ widgets: e, shown: t, onAdd: n, onRemove: r }) {
	return /* @__PURE__ */ k("div", {
		className: "grid grid-cols-1 gap-2 pb-1 sm:grid-cols-2",
		children: e.map((e) => {
			let i = t.has(e.id);
			return /* @__PURE__ */ A("button", {
				type: "button",
				"aria-pressed": i,
				onClick: () => i ? r(e.id) : n(e),
				className: w("group flex items-start gap-3 rounded-lg border p-3 text-left transition-[background-color,border-color] duration-120 outline-none focus-visible:ring-2 focus-visible:ring-focus", i ? "border-border bg-surface" : "border-border hover:border-border-strong hover:bg-surface"),
				children: [
					/* @__PURE__ */ k("span", {
						className: "grid size-9 shrink-0 place-items-center rounded-md border border-border bg-bg text-muted",
						children: /* @__PURE__ */ k(v, {
							name: e.icon,
							size: 17
						})
					}),
					/* @__PURE__ */ A("span", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ A("span", {
							className: "flex items-baseline gap-2",
							children: [/* @__PURE__ */ k("span", {
								className: "truncate text-sm font-medium text-ink",
								children: e.label
							}), e.source.toLowerCase() !== e.label.toLowerCase() && /* @__PURE__ */ k("span", {
								className: "shrink-0 text-2xs text-faint",
								children: e.source
							})]
						}), /* @__PURE__ */ k("span", {
							className: "mt-0.5 line-clamp-2 block text-xs text-muted",
							children: e.description
						})]
					}),
					/* @__PURE__ */ A("span", {
						"aria-hidden": "true",
						className: w("mt-0.5 grid size-5 shrink-0 place-items-center rounded-full transition-colors duration-120", i ? "bg-ink text-ink-contrast group-hover:bg-danger" : "border border-border-strong text-faint group-hover:border-ink group-hover:text-ink"),
						children: [/* @__PURE__ */ k(v, {
							name: i ? "check" : "plus",
							size: 11,
							className: w(i && "group-hover:hidden")
						}), i && /* @__PURE__ */ k(v, {
							name: "minus",
							size: 11,
							className: "hidden group-hover:block"
						})]
					})
				]
			}, e.id);
		})
	});
}
// admin/src/Dashboard.tsx
function J(e) {
	let t = (/* @__PURE__ */ new Date()).getHours();
	return s(t < 5 ? "Working late, {name}" : t < 12 ? "Good morning, {name}" : t < 18 ? "Good afternoon, {name}" : "Good evening, {name}", { name: e });
}
var Y = (e) => {
	let t = I(e), n = t.find((e) => !String(e.id).startsWith("column:"));
	return n ? [n] : t.length ? t : F(e);
};
function X() {
	let n = l(), r = c();
	m(i.widgets.subscribe, i.widgets.version);
	let [f, g] = p(null), [_, v] = p(null), [j, M] = p(!1), N = f !== null, P = d(() => new Map(n.widgets.filter((e) => i.widgets.get(e.id)).map((e) => [e.id, e])), [n.widgets, i.widgets.version()]), F = n.home?.layout ?? {
		sections: n.dashboard,
		hidden: []
	}, I = f ?? F, L = new Set(I.hidden), R = (e) => I.sections.find((t) => t.id === e)?.items.filter((e) => P.has(e) && !L.has(e)) ?? [], z = N ? ["main", "side"] : ["main", "side"].filter((e) => R(e).length > 0), B = () => g(structuredClone(F)), V = () => {
		g(null), v(null);
	};
	u(() => {
		r.query.customize !== void 0 && (B(), o({ customize: null }));
	}, [r.query.customize]), D("escape", () => !_ && V(), N);
	let H = async (e) => {
		await t(), g(null), v(null), e && E.success(e);
	}, U = async (e) => {
		M(!0);
		try {
			await e();
		} catch (e) {
			E.error(e);
		} finally {
			M(!1);
		}
	}, W = () => U(async () => {
		JSON.stringify(f) !== JSON.stringify(F) && await a("account/update", { preferences: { dashboard: f } }), await H();
	}), G = () => U(async () => {
		await a("account/update", { preferences: { dashboard: null } }), await H(s("Home screen reset to the default"));
	}), q = () => U(async () => {
		await T({
			title: s("Make this everyone’s home screen?"),
			description: s("People who customized their own home screen keep theirs."),
			confirm: s("Save as Default")
		}) && (await a("settings/update", {
			namespace: "admin",
			values: { dashboard: f }
		}), await a("account/update", { preferences: { dashboard: null } }), await H(s("Saved as the default home screen")));
	}), J = (e) => g((t) => t && e(t)), Y = (e) => I.sections.find((t) => t.items.includes(e))?.id, X = (e) => J((t) => ({
		...t,
		hidden: [...t.hidden.filter((t) => t !== e), e]
	})), $ = (e, t) => J((n) => ({
		sections: n.sections.map((n) => ({
			...n,
			items: n.id === t ? [...n.items.filter((t) => t !== e), e] : n.items.filter((t) => t !== e)
		})),
		hidden: n.hidden.filter((t) => t !== e)
	}));
	return /* @__PURE__ */ A(x, {
		crumbs: [{
			label: s("Dashboard"),
			icon: "grid"
		}],
		width: "default",
		actions: N ? /* @__PURE__ */ A(O, { children: [
			/* @__PURE__ */ k(h, {
				icon: "plus",
				variant: "ghost",
				onClick: () => v("default"),
				children: s("Add Widget")
			}),
			(n.home?.personal || e("settings.manage")) && /* @__PURE__ */ k(b, {
				trigger: /* @__PURE__ */ k(y, {
					icon: "more",
					label: s("More")
				}),
				items: [e("settings.manage") && {
					label: s("Save as Default"),
					onSelect: q
				}, n.home?.personal && {
					label: s("Reset to Default"),
					icon: "undo",
					onSelect: G
				}]
			}),
			/* @__PURE__ */ k("span", { className: "mx-1 h-4 w-px bg-border" }),
			/* @__PURE__ */ k(h, {
				variant: "ghost",
				onClick: V,
				children: s("Cancel")
			}),
			/* @__PURE__ */ k(h, {
				variant: "primary",
				loading: j,
				onClick: W,
				children: s("Done")
			})
		] }) : /* @__PURE__ */ k(h, {
			variant: "ghost",
			icon: "layout",
			onClick: B,
			children: s("Customize")
		}),
		children: [
			/* @__PURE__ */ k(Z, {}),
			/* @__PURE__ */ k(Q, {}),
			N ? /* @__PURE__ */ k(ee, {
				widgets: P,
				shown: R,
				setDraft: g,
				columnOf: Y,
				onRemove: X,
				onAdd: v
			}) : z.length === 0 ? /* @__PURE__ */ k("div", {
				className: "rounded-lg border border-dashed border-border-strong",
				children: /* @__PURE__ */ k(S, {
					icon: "layout",
					title: s("Your home screen is empty"),
					description: s("Add widgets for what you want to keep an eye on."),
					action: /* @__PURE__ */ k(h, {
						icon: "plus",
						onClick: () => {
							B(), v("default");
						},
						children: s("Add Widgets")
					})
				})
			}) : /* @__PURE__ */ k("div", {
				className: w("grid grid-cols-1 gap-x-10 gap-y-10", z.length > 1 && "lg:grid-cols-[minmax(0,1fr)_300px]"),
				children: z.map((e) => /* @__PURE__ */ k("div", {
					className: "min-w-0 space-y-10",
					children: R(e).map((e) => /* @__PURE__ */ k(C, { widget: P.get(e) }, e))
				}, e))
			}),
			/* @__PURE__ */ k(K, {
				open: _ !== null,
				onOpenChange: (e) => !e && v(null),
				widgets: [...P.values()],
				shown: /* @__PURE__ */ new Set([...R("main"), ...R("side")]),
				onAdd: (e) => $(e.id, _ === "default" || _ === null ? e.column : _),
				onRemove: X
			})
		]
	});
}
function Z() {
	let e = l().user.name.split(" ")[0];
	return /* @__PURE__ */ A("div", {
		className: "mb-10",
		children: [/* @__PURE__ */ k("p", {
			className: "m-0 text-sm text-muted",
			children: (/* @__PURE__ */ new Date()).toLocaleDateString(n(), {
				weekday: "long",
				month: "long",
				day: "numeric"
			})
		}), /* @__PURE__ */ k("h1", {
			className: "m-0 mt-1 text-[28px] font-semibold leading-9 tracking-[-0.025em] text-ink",
			children: J(e)
		})]
	});
}
function Q() {
	let t = l(), n = Object.keys(t.packages.pending), i = Object.entries(t.home?.problems ?? {});
	return /* @__PURE__ */ A(O, { children: [i.length > 0 && /* @__PURE__ */ A("div", {
		role: "alert",
		className: "mb-8 rounded-lg border border-danger/25 bg-danger/5 px-4 py-3 text-sm",
		children: [/* @__PURE__ */ A("p", {
			className: "m-0 flex items-center gap-2 font-medium text-ink",
			children: [/* @__PURE__ */ k(v, {
				name: "warning",
				size: 15,
				className: "text-danger"
			}), r(i.length, "{count} plugin is invalid", "{count} plugins are invalid")]
		}), /* @__PURE__ */ k("ul", {
			className: "m-0 mt-1.5 list-none space-y-0.5 pl-[23px] text-muted",
			children: i.map(([e, t]) => /* @__PURE__ */ A("li", { children: [
				/* @__PURE__ */ k("span", {
					className: "font-mono text-xs text-text",
					children: e
				}),
				" — ",
				t
			] }, e))
		})]
	}), n.length > 0 && e("packages.manage") && /* @__PURE__ */ A("div", {
		className: "mb-8 flex items-center gap-3 rounded-lg border border-warning/30 bg-warning/6 px-4 py-3",
		children: [
			/* @__PURE__ */ k(v, {
				name: "database",
				className: "text-warning"
			}),
			/* @__PURE__ */ A("div", {
				className: "min-w-0 flex-1 text-sm",
				children: [/* @__PURE__ */ k("span", {
					className: "font-medium text-ink",
					children: s("Database updates pending")
				}), /* @__PURE__ */ A("span", {
					className: "text-muted",
					children: [" · ", n.join(", ")]
				})]
			}),
			/* @__PURE__ */ k(h, {
				size: "sm",
				variant: "primary",
				onClick: () => a("packages/sync").then(() => {
					E.success(s("Updated")), window.location.reload();
				}, E.error),
				children: s("Run Updates")
			})
		]
	})] });
}
function ee({ widgets: e, shown: t, setDraft: n, columnOf: r, onRemove: i, onAdd: a }) {
	let [o, s] = p(null), c = z(R(P, { activationConstraint: { distance: 4 } }), R(N, { coordinateGetter: U })), l = (e) => String(e).startsWith("column:") ? String(e).slice(7) : r(String(e)), u = ({ active: e, over: t }) => {
		if (!t) return;
		let i = String(e.id), a = r(i), o = l(t.id);
		a && o && a !== o && n((e) => e && {
			...e,
			sections: e.sections.map((e) => {
				if (e.id === a) return {
					...e,
					items: e.items.filter((e) => e !== i)
				};
				if (e.id !== o) return e;
				let n = String(t.id).startsWith("column:") ? e.items.length : Math.max(0, e.items.indexOf(String(t.id)));
				return {
					...e,
					items: [
						...e.items.slice(0, n),
						i,
						...e.items.slice(n)
					]
				};
			})
		});
	}, d = ({ active: e, over: t }) => {
		if (s(null), !t || e.id === t.id || String(t.id).startsWith("column:")) return;
		let i = r(String(e.id));
		n((n) => n && {
			...n,
			sections: n.sections.map((n) => {
				if (n.id !== i) return n;
				let r = n.items.indexOf(String(e.id)), a = n.items.indexOf(String(t.id));
				return r < 0 || a < 0 ? n : {
					...n,
					items: V(n.items, r, a)
				};
			})
		});
	}, f = o ? e.get(o) : null;
	return /* @__PURE__ */ A(j, {
		sensors: c,
		collisionDetection: Y,
		onDragStart: (e) => s(String(e.active.id)),
		onDragOver: u,
		onDragEnd: d,
		onDragCancel: () => s(null),
		children: [/* @__PURE__ */ k("div", {
			className: "grid grid-cols-1 gap-x-8 gap-y-8 lg:grid-cols-[minmax(0,1fr)_300px]",
			children: ["main", "side"].map((n) => /* @__PURE__ */ k($, {
				column: n,
				ids: t(n),
				widgets: e,
				active: o,
				onRemove: i,
				onAdd: () => a(n)
			}, n))
		}), /* @__PURE__ */ k(M, {
			dropAnimation: {
				duration: 180,
				easing: "cubic-bezier(0.2, 0.8, 0.2, 1)"
			},
			children: f && /* @__PURE__ */ A("div", {
				className: "flex h-11 cursor-grabbing items-center gap-2.5 rounded-lg bg-bg px-3.5 text-sm font-medium text-ink shadow-pop",
				children: [
					/* @__PURE__ */ k(v, {
						name: "drag",
						size: 14,
						className: "text-faint"
					}),
					/* @__PURE__ */ k(v, {
						name: f.icon,
						size: 15,
						className: "text-muted"
					}),
					f.label
				]
			})
		})]
	});
}
function $({ column: e, ids: t, widgets: n, active: r, onRemove: i, onAdd: a }) {
	let o = L({ id: `column:${e}` });
	return /* @__PURE__ */ A("div", {
		ref: o.setNodeRef,
		className: "min-w-0",
		children: [
			/* @__PURE__ */ k("p", {
				className: "m-0 mb-2 text-2xs font-medium uppercase tracking-[0.04em] text-faint",
				children: s(e === "main" ? "Main Column" : "Side Column")
			}),
			/* @__PURE__ */ k(B, {
				items: t,
				strategy: H,
				children: /* @__PURE__ */ k("div", {
					className: "space-y-3",
					children: t.map((e) => /* @__PURE__ */ k(te, {
						widget: n.get(e),
						dragging: r === e,
						onRemove: () => i(e)
					}, e))
				})
			}),
			/* @__PURE__ */ A("button", {
				type: "button",
				onClick: a,
				className: w("mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border-strong text-sm text-muted transition-colors duration-120 hover:border-faint hover:bg-surface hover:text-text", t.length === 0 ? "h-32" : "h-11", o.isOver && t.length === 0 && "border-focus bg-focus/5"),
				children: [/* @__PURE__ */ k(v, {
					name: "plus",
					size: 14
				}), s("Add Widget")]
			})
		]
	});
}
function te({ widget: e, dragging: t, onRemove: n }) {
	let r = W({ id: e.id }), [i, a] = p(!1), o = f(null);
	return u(() => {
		let e = o.current;
		if (!e) return;
		let t = new ResizeObserver(() => a(e.scrollHeight > e.clientHeight + 1));
		return t.observe(e), e.firstElementChild && t.observe(e.firstElementChild), () => t.disconnect();
	}, []), /* @__PURE__ */ A("div", {
		ref: r.setNodeRef,
		style: {
			transform: G.Translate.toString(r.transform),
			transition: r.transition
		},
		className: w("group relative rounded-lg border border-border bg-bg transition-[border-color,box-shadow,opacity] duration-120 hover:border-border-strong", t && "opacity-40"),
		children: [/* @__PURE__ */ k("div", {
			...r.attributes,
			...r.listeners,
			ref: o,
			"aria-label": s("Move {widget}", { widget: e.label }),
			className: w("max-h-80 cursor-grab overflow-hidden rounded-lg px-4 pb-4 pt-3 outline-none focus-visible:ring-2 focus-visible:ring-focus active:cursor-grabbing", i && "[mask-image:linear-gradient(to_bottom,black_calc(100%-48px),transparent)]"),
			children: /* @__PURE__ */ k("div", {
				inert: !0,
				className: "pointer-events-none select-none",
				children: /* @__PURE__ */ k(C, { widget: e })
			})
		}), /* @__PURE__ */ k("button", {
			type: "button",
			onClick: n,
			"aria-label": s("Remove {widget}", { widget: e.label }),
			title: s("Remove"),
			className: "absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-bg text-muted shadow-pop transition-[color,transform] duration-120 hover:scale-105 hover:text-danger",
			children: /* @__PURE__ */ k(v, {
				name: "minus",
				size: 13
			})
		})]
	});
}
export { X as default };
