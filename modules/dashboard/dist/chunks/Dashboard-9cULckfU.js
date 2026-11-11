import { can as e, loadManifest as t, locale as n, plural as r, registry as i, run as a, setPreference as o, setQuery as s, t as c, useLocation as l, useManifest as u } from "@letterncms/sdk";
import { useEffect as d, useMemo as f, useState as p, useSyncExternalStore as m } from "react";
import { DndContext as h, DragOverlay as g, KeyboardSensor as _, PointerSensor as v, closestCenter as y, pointerWithin as b, useDroppable as x, useSensor as S, useSensors as C } from "@dnd-kit/core";
import { SortableContext as w, arrayMove as T, rectSortingStrategy as E, sortableKeyboardCoordinates as D, useSortable as O } from "@dnd-kit/sortable";
import { CSS as k } from "@dnd-kit/utilities";
import { Button as A, Dialog as j, Fields as M, Icon as N, IconButton as P, Notice as F, Page as ee, WidgetMessage as te, WidgetSlot as I, cn as L, confirm as R, toast as z, useShortcut as B } from "@letterncms/ui";
import { Fragment as V, jsx as H, jsxs as U } from "react/jsx-runtime";
// admin/src/Gallery.tsx
function ne({ open: e, onOpenChange: t, widgets: n, shown: r, onAdd: i, onRemove: a }) {
	let [o, s] = p("");
	d(() => {
		e && s("");
	}, [e]);
	let l = o.trim().toLowerCase(), u = n.filter((e) => !l || [
		e.label,
		e.description,
		e.source
	].some((e) => e.toLowerCase().includes(l))).sort((e, t) => e.label.localeCompare(t.label));
	return /* @__PURE__ */ U(j, {
		open: e,
		onOpenChange: t,
		size: "lg",
		title: c("Widgets"),
		description: c("{count} on your Dashboard", { count: r.size }),
		children: [
			/* @__PURE__ */ H(M, {
				bare: !0,
				fields: [{
					handle: "search",
					type: "text",
					label: c("Search Widgets"),
					placeholder: c("Search widgets…"),
					icon: "search",
					autofocus: !0
				}],
				values: { search: o },
				onChange: (e, t) => s(String(t ?? "")),
				className: "mb-4"
			}),
			u.length === 0 && /* @__PURE__ */ H("p", {
				className: "m-0 py-10 text-center text-sm text-muted",
				children: c("No widget matches “{search}”", { search: o })
			}),
			/* @__PURE__ */ H(W, {
				widgets: u,
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
						children: /* @__PURE__ */ H(N, {
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
						children: [/* @__PURE__ */ H(N, {
							name: i ? "check" : "plus",
							size: 11,
							className: L(i && "group-hover:hidden")
						}), i && /* @__PURE__ */ H(N, {
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
	return c(t < 5 ? "Working late, {name}" : t < 12 ? "Good morning, {name}" : t < 18 ? "Good afternoon, {name}" : "Good evening, {name}", { name: e });
}
var K = "grid grid-cols-1 gap-x-10 gap-y-10", q = "lg:grid-cols-[minmax(0,1fr)_300px]", J = "min-w-0 space-y-10", Y = (e) => {
	let t = b(e), n = t.find((e) => !String(e.id).startsWith("column:"));
	return n ? [n] : t.length ? t : y(e);
};
function X() {
	let n = u(), r = l();
	m(i.widgets.subscribe, i.widgets.version);
	let [h, g] = p(null), [_, v] = p(null), [y, b] = p(!1), [x, S] = p(!1), C = h !== null, w = e("settings.manage"), T = f(() => new Map(n.widgets.filter((e) => i.widgets.get(e.id)).map((e) => [e.id, e])), [n.widgets, i.widgets.version()]), E = n.home?.layout ?? {
		sections: n.dashboard,
		hidden: []
	}, D = h ?? E, O = new Set(D.hidden), k = (e) => D.sections.find((t) => t.id === e)?.items.filter((e) => T.has(e) && !O.has(e)) ?? [], j = C ? ["main", "side"] : ["main", "side"].filter((e) => k(e).length > 0), M = () => {
		g(structuredClone(E)), w && a("admin/arrangement", { of: "dashboard" }).then((e) => S(e.customized), () => S(!1));
	}, N = () => {
		g(null), v(null);
	};
	d(() => {
		r.query.customize !== void 0 && (M(), s({ customize: null }));
	}, [r.query.customize]), B("escape", () => !_ && N(), C);
	let P = async (e) => {
		await t(), g(null), v(null), e && z.success(e);
	}, F = async (e) => {
		b(!0);
		try {
			await e();
		} catch (e) {
			z.error(e);
		} finally {
			b(!1);
		}
	}, W = () => F(async () => {
		JSON.stringify(h) !== JSON.stringify(E) && await o("dashboard", h), await P();
	}), G = () => F(async () => {
		await o("dashboard", null), await P(c("Dashboard reset to the default"));
	}), Y = () => F(async () => {
		await R({
			title: c("Make this everyone’s Dashboard?"),
			description: c("People who customized their own Dashboard keep theirs."),
			confirm: c("Save as Default")
		}) && (await a("settings/update", {
			namespace: "admin",
			values: { dashboard: h }
		}), await o("dashboard", null), await P(c("Saved as the default Dashboard")));
	}), X = () => F(async () => {
		await R({
			title: c("Reset everyone’s Dashboard?"),
			description: c("People who customized their own Dashboard keep theirs."),
			confirm: c("Reset")
		}) && (await a("settings/update", {
			namespace: "admin",
			values: { dashboard: null }
		}), await P(c("Default Dashboard reset")));
	}), Z = (e) => g((t) => t && e(t)), Q = (e) => D.sections.find((t) => t.items.includes(e))?.id, $ = (e) => Z((t) => ({
		...t,
		hidden: [...t.hidden.filter((t) => t !== e), e]
	})), oe = (e, t) => Z((n) => ({
		sections: n.sections.map((n) => ({
			...n,
			items: n.id === t ? [...n.items.filter((t) => t !== e), e] : n.items.filter((t) => t !== e)
		})),
		hidden: n.hidden.filter((t) => t !== e)
	}));
	return /* @__PURE__ */ U(ee, {
		width: "wide",
		actions: C ? /* @__PURE__ */ U(V, { children: [
			n.home?.personal && /* @__PURE__ */ H(A, {
				variant: "ghost",
				icon: "undo",
				disabled: y,
				onClick: G,
				children: c("Reset to Default")
			}),
			w && /* @__PURE__ */ H(A, {
				variant: "ghost",
				disabled: y,
				onClick: Y,
				children: c("Save as Default")
			}),
			w && x && /* @__PURE__ */ H(A, {
				variant: "ghost",
				disabled: y,
				onClick: X,
				children: c("Reset Everyone’s Default")
			}),
			/* @__PURE__ */ H(A, {
				variant: "ghost",
				onClick: N,
				children: c("Cancel")
			}),
			/* @__PURE__ */ H(A, {
				variant: "primary",
				loading: y,
				onClick: W,
				children: c("Done")
			})
		] }) : /* @__PURE__ */ H(A, {
			variant: "ghost",
			icon: "layout",
			onClick: M,
			children: c("Customize")
		}),
		children: [
			/* @__PURE__ */ H(re, {}),
			/* @__PURE__ */ H(ie, {}),
			C ? /* @__PURE__ */ H(ae, {
				widgets: T,
				shown: k,
				setDraft: g,
				columnOf: Q,
				onRemove: $,
				onAdd: v
			}) : j.length === 0 ? /* @__PURE__ */ H("div", {
				className: "rounded-lg border border-dashed border-border-strong",
				children: /* @__PURE__ */ H(te, {
					icon: "layout",
					title: c("Your Dashboard is empty"),
					description: c("Add widgets for what you want to keep an eye on."),
					action: /* @__PURE__ */ H(A, {
						icon: "plus",
						onClick: () => {
							M(), v("default");
						},
						children: c("Add Widgets")
					})
				})
			}) : /* @__PURE__ */ H("div", {
				className: L(K, j.length > 1 && q),
				children: j.map((e) => /* @__PURE__ */ H("div", {
					className: J,
					children: k(e).map((e) => /* @__PURE__ */ H(I, { widget: T.get(e) }, e))
				}, e))
			}),
			/* @__PURE__ */ H(ne, {
				open: _ !== null,
				onOpenChange: (e) => !e && v(null),
				widgets: [...T.values()],
				shown: /* @__PURE__ */ new Set([...k("main"), ...k("side")]),
				onAdd: (e) => oe(e.id, _ === "default" || _ === null ? e.column : _),
				onRemove: $
			})
		]
	});
}
function re() {
	let e = u().user.name.split(" ")[0];
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
function ie() {
	let t = u(), n = Object.keys(t.packages.pending), i = Object.entries(t.home?.problems ?? {});
	return /* @__PURE__ */ U(V, { children: [i.length > 0 && /* @__PURE__ */ H(F, {
		tone: "danger",
		className: "mb-8",
		title: r(i.length, "{count} plugin is invalid", "{count} plugins are invalid"),
		children: /* @__PURE__ */ H("ul", {
			className: "m-0 list-none space-y-0.5 p-0",
			children: i.map(([e, t]) => /* @__PURE__ */ U("li", { children: [
				/* @__PURE__ */ H("span", {
					className: "font-mono text-xs text-text",
					children: e
				}),
				" — ",
				t
			] }, e))
		})
	}), n.length > 0 && e("packages.manage") && /* @__PURE__ */ H(F, {
		tone: "warning",
		icon: "database",
		className: "mb-8",
		title: c("Database updates are waiting"),
		action: /* @__PURE__ */ H(A, {
			size: "sm",
			variant: "primary",
			onClick: () => a("packages/sync").then(() => {
				z.success(c("Updated")), window.location.reload();
			}, z.error),
			children: c("Run Updates")
		})
	})] });
}
function ae({ widgets: e, shown: t, setDraft: n, columnOf: r, onRemove: i, onAdd: a }) {
	let [o, s] = p(null), c = C(S(v, { activationConstraint: { distance: 4 } }), S(_, { coordinateGetter: D })), l = (e) => String(e).startsWith("column:") ? String(e).slice(7) : r(String(e)), u = ({ active: e, over: t }) => {
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
					items: T(n.items, r, a)
				};
			})
		});
	}, f = o ? e.get(o) : null;
	return /* @__PURE__ */ U(h, {
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
		}), /* @__PURE__ */ H(g, {
			dropAnimation: {
				duration: 180,
				easing: "cubic-bezier(0.2, 0.8, 0.2, 1)"
			},
			children: f && /* @__PURE__ */ U("div", {
				className: "flex h-11 cursor-grabbing items-center gap-2.5 rounded-lg bg-bg px-3.5 text-sm font-medium text-ink shadow-pop",
				children: [
					/* @__PURE__ */ H(N, {
						name: "drag",
						size: 14,
						className: "text-faint"
					}),
					/* @__PURE__ */ H(N, {
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
function Z({ column: e, ids: t, widgets: n, active: r, onRemove: i, onAdd: a }) {
	let o = x({ id: `column:${e}` });
	return /* @__PURE__ */ U("div", {
		ref: o.setNodeRef,
		className: "min-w-0",
		children: [/* @__PURE__ */ H(w, {
			items: t,
			strategy: E,
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
			children: [/* @__PURE__ */ H(N, {
				name: "plus",
				size: 14
			}), c("Add Widget")]
		})]
	});
}
function Q({ widget: e, dragging: t, onRemove: n }) {
	let r = O({ id: e.id });
	return /* @__PURE__ */ U("div", {
		ref: r.setNodeRef,
		style: {
			transform: k.Translate.toString(r.transform),
			transition: r.transition
		},
		className: L("group relative", t && "opacity-40"),
		children: [/* @__PURE__ */ H("div", {
			...r.attributes,
			...r.listeners,
			"aria-label": c("Move {widget}", { widget: e.label }),
			className: "cursor-grab rounded-lg outline-none ring-1 ring-border-strong transition-shadow duration-120 hover:ring-faint focus-visible:ring-2 focus-visible:ring-focus active:cursor-grabbing",
			children: /* @__PURE__ */ H("div", {
				inert: !0,
				className: "pointer-events-none select-none [&_section>header>:is(a,button,div)]:invisible",
				children: /* @__PURE__ */ H(I, { widget: e })
			})
		}), /* @__PURE__ */ H(P, {
			icon: "close",
			size: "xs",
			label: c("Remove {widget}", { widget: e.label }),
			title: void 0,
			onClick: n,
			className: "absolute right-3 top-4 hover:text-danger"
		})]
	});
}
export { X as default };
