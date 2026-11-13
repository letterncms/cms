import { Link as e, can as t, invalidate as n, loadManifest as r, locale as i, registry as a, run as o, setPreference as s, setQuery as c, t as l, useAbility as u, useLocation as d, useManifest as f } from "@letterncms/sdk";
import { useEffect as p, useMemo as ee, useState as m, useSyncExternalStore as h } from "react";
import { DndContext as g, DragOverlay as _, KeyboardSensor as v, PointerSensor as y, closestCenter as b, pointerWithin as x, useDroppable as S, useSensor as C, useSensors as w } from "@dnd-kit/core";
import { SortableContext as T, arrayMove as E, rectSortingStrategy as D, sortableKeyboardCoordinates as O, useSortable as k } from "@dnd-kit/sortable";
import { CSS as A } from "@dnd-kit/utilities";
import { Button as j, Dialog as M, EmptyState as te, Fields as N, Icon as P, IconButton as F, List as I, Menu as ne, Notice as L, Page as re, Pressable as R, Section as z, WidgetSlot as B, cn as V, confirm as H, toast as U, useShortcut as ie } from "@letterncms/ui";
import { Fragment as W, jsx as G, jsxs as K } from "react/jsx-runtime";
// admin/src/Gallery.tsx
function ae({ open: e, onOpenChange: t, widgets: n, shown: r, onAdd: i, onRemove: a }) {
	let [o, s] = m("");
	p(() => {
		e && s("");
	}, [e]);
	let c = o.trim().toLowerCase(), u = n.filter((e) => !c || [
		e.label,
		e.description,
		e.source
	].some((e) => e.toLowerCase().includes(c))).sort((e, t) => e.label.localeCompare(t.label));
	return /* @__PURE__ */ K(M, {
		open: e,
		onOpenChange: t,
		size: "lg",
		title: l("Widgets"),
		description: l("{count} on your Dashboard", { count: r.size }),
		children: [
			/* @__PURE__ */ G(N, {
				bare: !0,
				fields: [{
					handle: "search",
					type: "text",
					label: l("Search Widgets"),
					placeholder: l("Search Widgets"),
					icon: "search",
					autofocus: !0
				}],
				values: { search: o },
				onChange: (e, t) => s(String(t ?? "")),
				className: "mb-4"
			}),
			u.length === 0 && /* @__PURE__ */ G("p", {
				className: "m-0 py-10 text-center text-sm text-muted",
				children: l("No matches")
			}),
			/* @__PURE__ */ G(q, {
				widgets: u,
				shown: r,
				onAdd: i,
				onRemove: a
			})
		]
	});
}
function q({ widgets: e, shown: t, onAdd: n, onRemove: r }) {
	return /* @__PURE__ */ G("div", {
		className: "grid grid-cols-1 gap-2 pb-1 sm:grid-cols-2",
		children: e.map((e) => {
			let i = t.has(e.id);
			return /* @__PURE__ */ K(R, {
				active: i,
				onClick: () => i ? r(e.id) : n(e),
				className: V("group flex items-start gap-3 rounded-lg border p-3 text-left transition-[background-color,border-color] duration-base", i ? "border-border bg-surface" : "border-border hover:border-border-strong hover:bg-surface"),
				children: [
					/* @__PURE__ */ G("span", {
						className: "grid size-9 shrink-0 place-items-center rounded-md bg-sunken text-muted",
						children: /* @__PURE__ */ G(P, {
							name: e.icon,
							size: 17
						})
					}),
					/* @__PURE__ */ K("span", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ K("span", {
							className: "flex items-baseline gap-2",
							children: [/* @__PURE__ */ G("span", {
								className: "truncate text-sm font-medium text-ink",
								children: e.label
							}), e.source.toLowerCase() !== e.label.toLowerCase() && /* @__PURE__ */ G("span", {
								className: "shrink-0 text-2xs text-faint",
								children: e.source
							})]
						}), /* @__PURE__ */ G("span", {
							className: "mt-0.5 line-clamp-2 block text-xs text-muted",
							children: e.description
						})]
					}),
					/* @__PURE__ */ K("span", {
						"aria-hidden": "true",
						className: V("mt-0.5 grid size-5 shrink-0 place-items-center rounded-full transition-colors duration-base", i ? "bg-ink text-ink-contrast group-hover:bg-danger" : "border border-border-strong text-faint group-hover:border-ink group-hover:text-ink"),
						children: [/* @__PURE__ */ G(P, {
							name: i ? "check" : "plus",
							size: 11,
							className: V(i && "group-hover:hidden")
						}), i && /* @__PURE__ */ G(P, {
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
// admin/src/Start.tsx
function oe() {
	let r = u("dashboard-start/get");
	if (!r.data?.open) return null;
	let i = async () => {
		try {
			await o("dashboard-start/update", { dismissed: !0 }), n("dashboard-start/");
		} catch (e) {
			U.error(e);
		}
	};
	return /* @__PURE__ */ G(z, {
		className: "mb-8",
		title: l("Get Started"),
		actions: /* @__PURE__ */ K(W, { children: [/* @__PURE__ */ G("span", {
			className: "text-xs tabular-nums text-faint",
			children: l("{done} of {total}", {
				done: r.data.steps.filter((e) => e.done).length,
				total: r.data.steps.length
			})
		}), t("settings.manage") && /* @__PURE__ */ G(j, {
			variant: "ghost",
			onClick: () => void i(),
			children: l("Hide")
		})] }),
		children: /* @__PURE__ */ G(I, { children: r.data.steps.map((t) => /* @__PURE__ */ K("div", {
			role: "listitem",
			className: "flex min-h-11 items-center gap-3 px-3 text-sm",
			children: [/* @__PURE__ */ G(P, {
				name: t.done ? "check-circle" : "circle",
				size: 16,
				className: t.done ? "shrink-0 text-success" : "shrink-0 text-faint"
			}), t.done ? /* @__PURE__ */ G("span", {
				className: "min-w-0 flex-1 truncate text-muted",
				children: t.label
			}) : /* @__PURE__ */ K(e, {
				to: t.to,
				className: "cms-touch -my-px flex min-w-0 flex-1 items-center gap-2 self-stretch rounded-sm font-medium text-ink no-underline -outline-offset-2 hover:underline",
				children: [/* @__PURE__ */ G("span", {
					className: "min-w-0 flex-1 truncate",
					children: t.label
				}), /* @__PURE__ */ G(P, {
					name: "chevron-right",
					size: 14,
					className: "shrink-0 text-faint"
				})]
			})]
		}, t.id)) })
	});
}
// admin/src/Dashboard.tsx
function J(e) {
	let t = (/* @__PURE__ */ new Date()).getHours();
	return l(t < 5 ? "Working late, {name}" : t < 12 ? "Good morning, {name}" : t < 18 ? "Good afternoon, {name}" : "Good evening, {name}", { name: e });
}
var Y = "grid grid-cols-1 gap-x-10 gap-y-10", X = "lg:grid-cols-[minmax(0,1fr)_300px]", Z = "min-w-0 space-y-10", Q = (e) => {
	let t = x(e), n = t.find((e) => !String(e.id).startsWith("column:"));
	return n ? [n] : t.length ? t : b(e);
};
function $() {
	let e = f(), n = d();
	h(a.widgets.subscribe, a.widgets.version);
	let [i, u] = m(null), [g, _] = m(null), [v, y] = m(!1), [b, x] = m(!1), S = i !== null, C = t("settings.manage"), w = ee(() => new Map(e.widgets.filter((e) => a.widgets.get(e.id)).map((e) => [e.id, e])), [e.widgets, a.widgets.version()]), T = e.home?.layout ?? {
		sections: e.dashboard,
		hidden: []
	}, E = i ?? T, D = new Set(E.hidden), O = (e) => E.sections.find((t) => t.id === e)?.items.filter((e) => w.has(e) && !D.has(e)) ?? [], k = S ? ["main", "side"] : ["main", "side"].filter((e) => O(e).length > 0), A = () => {
		u(structuredClone(T)), C && o("admin/arrangement", { of: "dashboard" }).then((e) => x(e.customized), () => x(!1));
	}, M = () => {
		u(null), _(null);
	};
	p(() => {
		n.query.customize !== void 0 && (A(), c({ customize: null }));
	}, [n.query.customize]), ie("escape", () => !g && M(), S);
	let N = async (e) => {
		await r(), u(null), _(null), e && U.success(e);
	}, P = async (e) => {
		y(!0);
		try {
			await e();
		} catch (e) {
			U.error(e);
		} finally {
			y(!1);
		}
	}, I = () => P(async () => {
		JSON.stringify(i) !== JSON.stringify(T) && await s("dashboard", i), await N();
	}), L = () => P(async () => {
		await s("dashboard", null), await N(l("Dashboard reset to the default"));
	}), R = () => P(async () => {
		await H({
			title: l("Make this everyone’s Dashboard?"),
			description: l("People who customized their own Dashboard keep theirs."),
			confirm: l("Save for Everyone")
		}) && (await o("settings/update", {
			namespace: "admin",
			values: { dashboard: i }
		}), await s("dashboard", null), await N(l("Saved as the default Dashboard")));
	}), z = () => P(async () => {
		await H({
			title: l("Reset everyone’s Dashboard?"),
			description: l("People who customized their own Dashboard keep theirs."),
			confirm: l("Reset")
		}) && (await o("settings/update", {
			namespace: "admin",
			values: { dashboard: null }
		}), await N(l("Default Dashboard reset")));
	}), q = (e) => u((t) => t && e(t)), J = (e) => E.sections.find((t) => t.items.includes(e))?.id, Q = (e) => q((t) => ({
		...t,
		hidden: [...t.hidden.filter((t) => t !== e), e]
	})), $ = (e, t) => q((n) => ({
		sections: n.sections.map((n) => ({
			...n,
			items: n.id === t ? [...n.items.filter((t) => t !== e), e] : n.items.filter((t) => t !== e)
		})),
		hidden: n.hidden.filter((t) => t !== e)
	}));
	return /* @__PURE__ */ K(re, {
		width: "wide",
		actions: S ? /* @__PURE__ */ K(W, { children: [
			(e.home?.personal || C) && /* @__PURE__ */ G(ne, {
				align: "end",
				trigger: /* @__PURE__ */ G(F, {
					icon: "more",
					label: l("More"),
					disabled: v
				}),
				items: [
					e.home?.personal && {
						label: l("Reset to Default"),
						icon: "undo",
						onSelect: L
					},
					C && {
						label: l("Save for Everyone"),
						icon: "users",
						onSelect: R
					},
					C && b && {
						label: l("Reset Everyone’s Default"),
						icon: "refresh",
						onSelect: z
					}
				]
			}),
			/* @__PURE__ */ G(j, {
				variant: "ghost",
				onClick: M,
				children: l("Cancel")
			}),
			/* @__PURE__ */ G(j, {
				variant: "primary",
				loading: v,
				onClick: I,
				children: l("Done")
			})
		] }) : /* @__PURE__ */ G(j, {
			variant: "ghost",
			icon: "layout",
			onClick: A,
			children: l("Customize")
		}),
		children: [
			/* @__PURE__ */ G(se, {}),
			/* @__PURE__ */ G(ce, {}),
			!S && /* @__PURE__ */ G(oe, {}),
			S ? /* @__PURE__ */ G(le, {
				widgets: w,
				shown: O,
				setDraft: u,
				columnOf: J,
				onRemove: Q,
				onAdd: _
			}) : k.length === 0 ? /* @__PURE__ */ G("div", {
				className: "rounded-lg border border-dashed border-border-strong",
				children: /* @__PURE__ */ G(te, {
					compact: !0,
					icon: "layout",
					title: l("Your dashboard is empty"),
					action: /* @__PURE__ */ G(j, {
						icon: "plus",
						onClick: () => {
							A(), _("default");
						},
						children: l("Add Widgets")
					})
				})
			}) : /* @__PURE__ */ G("div", {
				className: V(Y, k.length > 1 && X),
				children: k.map((e) => /* @__PURE__ */ G("div", {
					className: Z,
					children: O(e).map((e) => /* @__PURE__ */ G(B, { widget: w.get(e) }, e))
				}, e))
			}),
			/* @__PURE__ */ G(ae, {
				open: g !== null,
				onOpenChange: (e) => !e && _(null),
				widgets: [...w.values()],
				shown: /* @__PURE__ */ new Set([...O("main"), ...O("side")]),
				onAdd: (e) => $(e.id, g === "default" || g === null ? e.column : g),
				onRemove: Q
			})
		]
	});
}
function se() {
	let e = f().user.name.split(" ")[0];
	return /* @__PURE__ */ K("div", {
		className: "mb-8",
		children: [/* @__PURE__ */ G("p", {
			className: "m-0 text-sm text-muted",
			children: (/* @__PURE__ */ new Date()).toLocaleDateString(i(), {
				weekday: "long",
				month: "long",
				day: "numeric"
			})
		}), /* @__PURE__ */ G("h1", {
			className: "m-0 mt-0.5 text-2xl font-semibold text-ink",
			children: J(e)
		})]
	});
}
function ce() {
	let e = f(), n = Object.keys(e.packages.pending);
	return /* @__PURE__ */ G(W, { children: n.length > 0 && t("packages.manage") && /* @__PURE__ */ G(L, {
		tone: "warning",
		icon: "database",
		className: "mb-8",
		title: l("Database updates are waiting"),
		action: /* @__PURE__ */ G(j, {
			size: "sm",
			variant: "primary",
			onClick: () => o("packages/migrate").then(() => {
				U.success(l("Updated")), window.location.reload();
			}, U.error),
			children: l("Run Updates")
		})
	}) });
}
function le({ widgets: e, shown: t, setDraft: n, columnOf: r, onRemove: i, onAdd: a }) {
	let [o, s] = m(null), c = w(C(y, { activationConstraint: { distance: 4 } }), C(v, { coordinateGetter: O })), l = (e) => String(e).startsWith("column:") ? String(e).slice(7) : r(String(e)), u = ({ active: e, over: t }) => {
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
					items: E(n.items, r, a)
				};
			})
		});
	}, f = o ? e.get(o) : null;
	return /* @__PURE__ */ K(g, {
		sensors: c,
		collisionDetection: Q,
		onDragStart: (e) => s(String(e.active.id)),
		onDragOver: u,
		onDragEnd: d,
		onDragCancel: () => s(null),
		children: [/* @__PURE__ */ G("div", {
			className: V(Y, X),
			children: ["main", "side"].map((n) => /* @__PURE__ */ G(ue, {
				column: n,
				ids: t(n),
				widgets: e,
				active: o,
				onRemove: i,
				onAdd: () => a(n)
			}, n))
		}), /* @__PURE__ */ G(_, {
			dropAnimation: {
				duration: 180,
				easing: "cubic-bezier(0.2, 0.8, 0.2, 1)"
			},
			children: f && /* @__PURE__ */ K("div", {
				className: "flex h-11 cursor-grabbing items-center gap-2.5 rounded-lg bg-bg px-3.5 text-sm font-medium text-ink shadow-pop",
				children: [
					/* @__PURE__ */ G(P, {
						name: "drag",
						size: 14,
						className: "text-faint"
					}),
					/* @__PURE__ */ G(P, {
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
function ue({ column: e, ids: t, widgets: n, active: r, onRemove: i, onAdd: a }) {
	let o = S({ id: `column:${e}` });
	return /* @__PURE__ */ K("div", {
		ref: o.setNodeRef,
		className: "min-w-0",
		children: [/* @__PURE__ */ G(T, {
			items: t,
			strategy: D,
			children: /* @__PURE__ */ G("div", {
				className: Z,
				children: t.map((e) => /* @__PURE__ */ G(de, {
					widget: n.get(e),
					dragging: r === e,
					onRemove: () => i(e)
				}, e))
			})
		}), /* @__PURE__ */ K(R, {
			onClick: a,
			className: V("flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border-strong text-sm text-muted transition-colors duration-base hover:border-faint hover:bg-sunken hover:text-text", t.length === 0 ? "h-32" : "mt-10 h-11", o.isOver && t.length === 0 && "border-focus bg-focus/5"),
			children: [/* @__PURE__ */ G(P, {
				name: "plus",
				size: 14
			}), l("Add Widget")]
		})]
	});
}
function de({ widget: e, dragging: t, onRemove: n }) {
	let r = k({ id: e.id });
	return /* @__PURE__ */ K("div", {
		ref: r.setNodeRef,
		style: {
			transform: A.Translate.toString(r.transform),
			transition: r.transition
		},
		className: V("group relative", t && "opacity-40"),
		children: [/* @__PURE__ */ K("div", {
			...r.attributes,
			...r.listeners,
			"aria-label": l("Move {widget}", { widget: e.label }),
			className: "cursor-grab rounded-lg outline-none ring-1 ring-border-strong transition-shadow duration-base hover:ring-faint focus-visible:ring-2 focus-visible:ring-focus active:cursor-grabbing",
			children: [/* @__PURE__ */ G("div", {
				inert: !0,
				className: "pointer-events-none select-none [&_section>header>:is(a,button,div)]:invisible",
				children: /* @__PURE__ */ G(B, { widget: e })
			}), /* @__PURE__ */ G(P, {
				name: "drag",
				size: 16,
				className: "pointer-events-none absolute right-12 top-5 text-faint"
			})]
		}), /* @__PURE__ */ G(F, {
			icon: "close",
			size: "xs",
			label: l("Remove {widget}", { widget: e.label }),
			title: void 0,
			onClick: n,
			className: "absolute right-3 top-4 hover:text-danger"
		})]
	});
}
export { $ as default };
