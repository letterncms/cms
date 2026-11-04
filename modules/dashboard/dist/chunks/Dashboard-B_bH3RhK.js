import { can as e, loadManifest as t, locale as n, plural as r, registry as i, run as a, setQuery as o, t as s, useLocation as c, useManifest as l } from "@letterncms/sdk";
import { useEffect as u, useMemo as d, useState as f, useSyncExternalStore as p } from "react";
import { DndContext as m, DragOverlay as h, KeyboardSensor as g, PointerSensor as _, closestCenter as v, pointerWithin as y, useDroppable as b, useSensor as x, useSensors as S } from "@dnd-kit/core";
import { SortableContext as C, arrayMove as w, rectSortingStrategy as T, sortableKeyboardCoordinates as E, useSortable as D } from "@dnd-kit/sortable";
import { CSS as O } from "@dnd-kit/utilities";
import { Button as k, Dialog as A, Fields as j, Icon as M, IconButton as N, Page as P, WidgetMessage as F, WidgetSlot as I, cn as L, confirm as R, toast as z, useShortcut as B } from "@letterncms/ui";
import { Fragment as V, jsx as H, jsxs as U } from "react/jsx-runtime";
// admin/src/Gallery.tsx
function ee({ open: e, onOpenChange: t, widgets: n, shown: r, onAdd: i, onRemove: a }) {
	let [o, c] = f("");
	u(() => {
		e && c("");
	}, [e]);
	let l = o.trim().toLowerCase(), d = n.filter((e) => !l || [
		e.label,
		e.description,
		e.source
	].some((e) => e.toLowerCase().includes(l))).sort((e, t) => e.label.localeCompare(t.label));
	return /* @__PURE__ */ U(A, {
		open: e,
		onOpenChange: t,
		size: "lg",
		title: s("Widgets"),
		description: s("{count} on your Dashboard", { count: r.size }),
		children: [
			/* @__PURE__ */ H(j, {
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
			d.length === 0 && /* @__PURE__ */ H("p", {
				className: "m-0 py-10 text-center text-sm text-muted",
				children: s("No widget matches “{search}”", { search: o })
			}),
			/* @__PURE__ */ H(W, {
				widgets: d,
				shown: r,
				onAdd: i,
				onRemove: a
			})
		]
	});
}
function W({ widgets: e, shown: t, onAdd: n, onRemove: r }) {
	return /* @__PURE__ */ H("div", {
		className: "grid grid-cols-1 gap-2 pb-1 sm:grid-cols-2",
		children: e.map((e) => {
			let i = t.has(e.id);
			return /* @__PURE__ */ U("button", {
				type: "button",
				"aria-pressed": i,
				onClick: () => i ? r(e.id) : n(e),
				className: L("group flex items-start gap-3 rounded-lg border p-3 text-left transition-[background-color,border-color] duration-120 outline-none focus-visible:ring-2 focus-visible:ring-focus", i ? "border-border bg-surface" : "border-border hover:border-border-strong hover:bg-surface"),
				children: [
					/* @__PURE__ */ H("span", {
						className: "grid size-9 shrink-0 place-items-center rounded-md bg-sunken text-muted",
						children: /* @__PURE__ */ H(M, {
							name: e.icon,
							size: 17
						})
					}),
					/* @__PURE__ */ U("span", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ U("span", {
							className: "flex items-baseline gap-2",
							children: [/* @__PURE__ */ H("span", {
								className: "truncate text-sm font-medium text-ink",
								children: e.label
							}), e.source.toLowerCase() !== e.label.toLowerCase() && /* @__PURE__ */ H("span", {
								className: "shrink-0 text-2xs text-faint",
								children: e.source
							})]
						}), /* @__PURE__ */ H("span", {
							className: "mt-0.5 line-clamp-2 block text-xs text-muted",
							children: e.description
						})]
					}),
					/* @__PURE__ */ U("span", {
						"aria-hidden": "true",
						className: L("mt-0.5 grid size-5 shrink-0 place-items-center rounded-full transition-colors duration-120", i ? "bg-ink text-ink-contrast group-hover:bg-danger" : "border border-border-strong text-faint group-hover:border-ink group-hover:text-ink"),
						children: [/* @__PURE__ */ H(M, {
							name: i ? "check" : "plus",
							size: 11,
							className: L(i && "group-hover:hidden")
						}), i && /* @__PURE__ */ H(M, {
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
function G(e) {
	let t = (/* @__PURE__ */ new Date()).getHours();
	return s(t < 5 ? "Working late, {name}" : t < 12 ? "Good morning, {name}" : t < 18 ? "Good afternoon, {name}" : "Good evening, {name}", { name: e });
}
var K = "grid grid-cols-1 gap-x-10 gap-y-10", q = "lg:grid-cols-[minmax(0,1fr)_300px]", J = "min-w-0 space-y-10", Y = (e) => {
	let t = y(e), n = t.find((e) => !String(e.id).startsWith("column:"));
	return n ? [n] : t.length ? t : v(e);
};
function X() {
	let n = l(), r = c();
	p(i.widgets.subscribe, i.widgets.version);
	let [m, h] = f(null), [g, _] = f(null), [v, y] = f(!1), [b, x] = f(!1), S = m !== null, C = e("settings.manage"), w = d(() => new Map(n.widgets.filter((e) => i.widgets.get(e.id)).map((e) => [e.id, e])), [n.widgets, i.widgets.version()]), T = n.home?.layout ?? {
		sections: n.dashboard,
		hidden: []
	}, E = m ?? T, D = new Set(E.hidden), O = (e) => E.sections.find((t) => t.id === e)?.items.filter((e) => w.has(e) && !D.has(e)) ?? [], A = S ? ["main", "side"] : ["main", "side"].filter((e) => O(e).length > 0), j = () => {
		h(structuredClone(T)), C && a("admin/arrangement", { of: "dashboard" }).then((e) => x(e.customized), () => x(!1));
	}, M = () => {
		h(null), _(null);
	};
	u(() => {
		r.query.customize !== void 0 && (j(), o({ customize: null }));
	}, [r.query.customize]), B("escape", () => !g && M(), S);
	let N = async (e) => {
		await t(), h(null), _(null), e && z.success(e);
	}, W = async (e) => {
		y(!0);
		try {
			await e();
		} catch (e) {
			z.error(e);
		} finally {
			y(!1);
		}
	}, G = () => W(async () => {
		JSON.stringify(m) !== JSON.stringify(T) && await a("account/update", { preferences: { dashboard: m } }), await N();
	}), Y = () => W(async () => {
		await a("account/update", { preferences: { dashboard: null } }), await N(s("Dashboard reset to the default"));
	}), X = () => W(async () => {
		await R({
			title: s("Make this everyone’s Dashboard?"),
			description: s("People who customized their own Dashboard keep theirs."),
			confirm: s("Save as Default")
		}) && (await a("settings/update", {
			namespace: "admin",
			values: { dashboard: m }
		}), await a("account/update", { preferences: { dashboard: null } }), await N(s("Saved as the default Dashboard")));
	}), Z = () => W(async () => {
		await R({
			title: s("Reset everyone’s Dashboard?"),
			description: s("People who customized their own Dashboard keep theirs."),
			confirm: s("Reset")
		}) && (await a("settings/update", {
			namespace: "admin",
			values: { dashboard: null }
		}), await N(s("Default Dashboard reset")));
	}), Q = (e) => h((t) => t && e(t)), ie = (e) => E.sections.find((t) => t.items.includes(e))?.id, $ = (e) => Q((t) => ({
		...t,
		hidden: [...t.hidden.filter((t) => t !== e), e]
	})), ae = (e, t) => Q((n) => ({
		sections: n.sections.map((n) => ({
			...n,
			items: n.id === t ? [...n.items.filter((t) => t !== e), e] : n.items.filter((t) => t !== e)
		})),
		hidden: n.hidden.filter((t) => t !== e)
	}));
	return /* @__PURE__ */ U(P, {
		width: "wide",
		actions: S ? /* @__PURE__ */ U(V, { children: [
			n.home?.personal && /* @__PURE__ */ H(k, {
				variant: "ghost",
				icon: "undo",
				disabled: v,
				onClick: Y,
				children: s("Reset to Default")
			}),
			C && /* @__PURE__ */ H(k, {
				variant: "ghost",
				disabled: v,
				onClick: X,
				children: s("Save as Default")
			}),
			C && b && /* @__PURE__ */ H(k, {
				variant: "ghost",
				disabled: v,
				onClick: Z,
				children: s("Reset Everyone’s Default")
			}),
			/* @__PURE__ */ H(k, {
				variant: "ghost",
				onClick: M,
				children: s("Cancel")
			}),
			/* @__PURE__ */ H(k, {
				variant: "primary",
				loading: v,
				onClick: G,
				children: s("Done")
			})
		] }) : /* @__PURE__ */ H(k, {
			variant: "ghost",
			icon: "layout",
			onClick: j,
			children: s("Customize")
		}),
		children: [
			/* @__PURE__ */ H(te, {}),
			/* @__PURE__ */ H(ne, {}),
			S ? /* @__PURE__ */ H(re, {
				widgets: w,
				shown: O,
				setDraft: h,
				columnOf: ie,
				onRemove: $,
				onAdd: _
			}) : A.length === 0 ? /* @__PURE__ */ H("div", {
				className: "rounded-lg border border-dashed border-border-strong",
				children: /* @__PURE__ */ H(F, {
					icon: "layout",
					title: s("Your Dashboard is empty"),
					description: s("Add widgets for what you want to keep an eye on."),
					action: /* @__PURE__ */ H(k, {
						icon: "plus",
						onClick: () => {
							j(), _("default");
						},
						children: s("Add Widgets")
					})
				})
			}) : /* @__PURE__ */ H("div", {
				className: L(K, A.length > 1 && q),
				children: A.map((e) => /* @__PURE__ */ H("div", {
					className: J,
					children: O(e).map((e) => /* @__PURE__ */ H(I, { widget: w.get(e) }, e))
				}, e))
			}),
			/* @__PURE__ */ H(ee, {
				open: g !== null,
				onOpenChange: (e) => !e && _(null),
				widgets: [...w.values()],
				shown: /* @__PURE__ */ new Set([...O("main"), ...O("side")]),
				onAdd: (e) => ae(e.id, g === "default" || g === null ? e.column : g),
				onRemove: $
			})
		]
	});
}
function te() {
	let e = l().user.name.split(" ")[0];
	return /* @__PURE__ */ U("div", {
		className: "mb-10",
		children: [/* @__PURE__ */ H("p", {
			className: "m-0 text-sm text-muted",
			children: (/* @__PURE__ */ new Date()).toLocaleDateString(n(), {
				weekday: "long",
				month: "long",
				day: "numeric"
			})
		}), /* @__PURE__ */ H("h1", {
			className: "m-0 mt-1 text-[28px] font-semibold leading-9 tracking-[-0.025em] text-ink",
			children: G(e)
		})]
	});
}
function ne() {
	let t = l(), n = Object.keys(t.packages.pending), i = Object.entries(t.home?.problems ?? {});
	return /* @__PURE__ */ U(V, { children: [i.length > 0 && /* @__PURE__ */ U("div", {
		role: "alert",
		className: "mb-8 rounded-lg border border-danger/25 bg-danger/5 px-4 py-3 text-sm",
		children: [/* @__PURE__ */ U("p", {
			className: "m-0 flex items-center gap-2 font-medium text-ink",
			children: [/* @__PURE__ */ H(M, {
				name: "warning",
				size: 15,
				className: "text-danger"
			}), r(i.length, "{count} plugin is invalid", "{count} plugins are invalid")]
		}), /* @__PURE__ */ H("ul", {
			className: "m-0 mt-1.5 list-none space-y-0.5 pl-[23px] text-muted",
			children: i.map(([e, t]) => /* @__PURE__ */ U("li", { children: [
				/* @__PURE__ */ H("span", {
					className: "font-mono text-xs text-text",
					children: e
				}),
				" — ",
				t
			] }, e))
		})]
	}), n.length > 0 && e("packages.manage") && /* @__PURE__ */ U("div", {
		className: "mb-8 flex items-center gap-3 rounded-lg border border-warning/30 bg-warning/6 px-4 py-3",
		children: [
			/* @__PURE__ */ H(M, {
				name: "database",
				className: "text-warning"
			}),
			/* @__PURE__ */ H("div", {
				className: "min-w-0 flex-1 text-sm",
				children: /* @__PURE__ */ H("span", {
					className: "font-medium text-ink",
					children: s("Database updates are waiting")
				})
			}),
			/* @__PURE__ */ H(k, {
				size: "sm",
				variant: "primary",
				onClick: () => a("packages/sync").then(() => {
					z.success(s("Updated")), window.location.reload();
				}, z.error),
				children: s("Run Updates")
			})
		]
	})] });
}
function re({ widgets: e, shown: t, setDraft: n, columnOf: r, onRemove: i, onAdd: a }) {
	let [o, s] = f(null), c = S(x(_, { activationConstraint: { distance: 4 } }), x(g, { coordinateGetter: E })), l = (e) => String(e).startsWith("column:") ? String(e).slice(7) : r(String(e)), u = ({ active: e, over: t }) => {
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
					items: w(n.items, r, a)
				};
			})
		});
	}, p = o ? e.get(o) : null;
	return /* @__PURE__ */ U(m, {
		sensors: c,
		collisionDetection: Y,
		onDragStart: (e) => s(String(e.active.id)),
		onDragOver: u,
		onDragEnd: d,
		onDragCancel: () => s(null),
		children: [/* @__PURE__ */ H("div", {
			className: L(K, q),
			children: ["main", "side"].map((n) => /* @__PURE__ */ H(Z, {
				column: n,
				ids: t(n),
				widgets: e,
				active: o,
				onRemove: i,
				onAdd: () => a(n)
			}, n))
		}), /* @__PURE__ */ H(h, {
			dropAnimation: {
				duration: 180,
				easing: "cubic-bezier(0.2, 0.8, 0.2, 1)"
			},
			children: p && /* @__PURE__ */ U("div", {
				className: "flex h-11 cursor-grabbing items-center gap-2.5 rounded-lg bg-bg px-3.5 text-sm font-medium text-ink shadow-pop",
				children: [
					/* @__PURE__ */ H(M, {
						name: "drag",
						size: 14,
						className: "text-faint"
					}),
					/* @__PURE__ */ H(M, {
						name: p.icon,
						size: 15,
						className: "text-muted"
					}),
					p.label
				]
			})
		})]
	});
}
function Z({ column: e, ids: t, widgets: n, active: r, onRemove: i, onAdd: a }) {
	let o = b({ id: `column:${e}` });
	return /* @__PURE__ */ U("div", {
		ref: o.setNodeRef,
		className: "min-w-0",
		children: [/* @__PURE__ */ H(C, {
			items: t,
			strategy: T,
			children: /* @__PURE__ */ H("div", {
				className: J,
				children: t.map((e) => /* @__PURE__ */ H(Q, {
					widget: n.get(e),
					dragging: r === e,
					onRemove: () => i(e)
				}, e))
			})
		}), /* @__PURE__ */ U("button", {
			type: "button",
			onClick: a,
			className: L("flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border-strong text-sm text-muted transition-colors duration-120 hover:border-faint hover:bg-sunken hover:text-text", t.length === 0 ? "h-32" : "mt-10 h-11", o.isOver && t.length === 0 && "border-focus bg-focus/5"),
			children: [/* @__PURE__ */ H(M, {
				name: "plus",
				size: 14
			}), s("Add Widget")]
		})]
	});
}
function Q({ widget: e, dragging: t, onRemove: n }) {
	let r = D({ id: e.id });
	return /* @__PURE__ */ U("div", {
		ref: r.setNodeRef,
		style: {
			transform: O.Translate.toString(r.transform),
			transition: r.transition
		},
		className: L("group relative", t && "opacity-40"),
		children: [/* @__PURE__ */ H("div", {
			...r.attributes,
			...r.listeners,
			"aria-label": s("Move {widget}", { widget: e.label }),
			className: "cursor-grab rounded-lg outline-none ring-1 ring-border-strong transition-shadow duration-120 hover:ring-faint focus-visible:ring-2 focus-visible:ring-focus active:cursor-grabbing",
			children: /* @__PURE__ */ H("div", {
				inert: !0,
				className: "pointer-events-none select-none [&_section>header>:is(a,button,div)]:invisible",
				children: /* @__PURE__ */ H(I, { widget: e })
			})
		}), /* @__PURE__ */ H(N, {
			icon: "close",
			size: "xs",
			label: s("Remove {widget}", { widget: e.label }),
			title: void 0,
			onClick: n,
			className: "absolute right-3 top-4 hover:text-danger"
		})]
	});
}
export { X as default };
