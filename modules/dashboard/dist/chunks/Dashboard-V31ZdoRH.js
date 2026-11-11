import { Link as e, can as t, invalidate as n, loadManifest as r, locale as i, registry as a, run as o, setPreference as s, setQuery as c, t as l, useAbility as u, useLocation as d, useManifest as f } from "@letterncms/sdk";
import { useEffect as p, useMemo as ee, useState as m, useSyncExternalStore as te } from "react";
import { DndContext as h, DragOverlay as g, KeyboardSensor as _, PointerSensor as v, closestCenter as y, pointerWithin as b, useDroppable as x, useSensor as S, useSensors as C } from "@dnd-kit/core";
import { SortableContext as w, arrayMove as T, rectSortingStrategy as E, sortableKeyboardCoordinates as D, useSortable as O } from "@dnd-kit/sortable";
import { CSS as k } from "@dnd-kit/utilities";
import { Button as A, Dialog as j, EmptyState as M, Fields as N, Icon as P, IconButton as F, List as I, Notice as L, Page as R, Section as z, WidgetSlot as B, cn as V, confirm as H, toast as U, useShortcut as ne } from "@letterncms/ui";
import { Fragment as W, jsx as G, jsxs as K } from "react/jsx-runtime";
// admin/src/Gallery.tsx
function re({ open: e, onOpenChange: t, widgets: n, shown: r, onAdd: i, onRemove: a }) {
	let [o, s] = m("");
	p(() => {
		e && s("");
	}, [e]);
	let c = o.trim().toLowerCase(), u = n.filter((e) => !c || [
		e.label,
		e.description,
		e.source
	].some((e) => e.toLowerCase().includes(c))).sort((e, t) => e.label.localeCompare(t.label));
	return /* @__PURE__ */ K(j, {
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
			return /* @__PURE__ */ K("button", {
				type: "button",
				"aria-pressed": i,
				onClick: () => i ? r(e.id) : n(e),
				className: V("group flex items-start gap-3 rounded-lg border p-3 text-left transition-[background-color,border-color] duration-120 outline-none focus-visible:ring-2 focus-visible:ring-focus", i ? "border-border bg-surface" : "border-border hover:border-border-strong hover:bg-surface"),
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
						className: V("mt-0.5 grid size-5 shrink-0 place-items-center rounded-full transition-colors duration-120", i ? "bg-ink text-ink-contrast group-hover:bg-danger" : "border border-border-strong text-faint group-hover:border-ink group-hover:text-ink"),
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
function ie() {
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
		}), t("settings.manage") && /* @__PURE__ */ G(A, {
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
	let t = b(e), n = t.find((e) => !String(e.id).startsWith("column:"));
	return n ? [n] : t.length ? t : y(e);
};
function $() {
	let e = f(), n = d();
	te(a.widgets.subscribe, a.widgets.version);
	let [i, u] = m(null), [h, g] = m(null), [_, v] = m(!1), [y, b] = m(!1), x = i !== null, S = t("settings.manage"), C = ee(() => new Map(e.widgets.filter((e) => a.widgets.get(e.id)).map((e) => [e.id, e])), [e.widgets, a.widgets.version()]), w = e.home?.layout ?? {
		sections: e.dashboard,
		hidden: []
	}, T = i ?? w, E = new Set(T.hidden), D = (e) => T.sections.find((t) => t.id === e)?.items.filter((e) => C.has(e) && !E.has(e)) ?? [], O = x ? ["main", "side"] : ["main", "side"].filter((e) => D(e).length > 0), k = () => {
		u(structuredClone(w)), S && o("admin/arrangement", { of: "dashboard" }).then((e) => b(e.customized), () => b(!1));
	}, j = () => {
		u(null), g(null);
	};
	p(() => {
		n.query.customize !== void 0 && (k(), c({ customize: null }));
	}, [n.query.customize]), ne("escape", () => !h && j(), x);
	let N = async (e) => {
		await r(), u(null), g(null), e && U.success(e);
	}, P = async (e) => {
		v(!0);
		try {
			await e();
		} catch (e) {
			U.error(e);
		} finally {
			v(!1);
		}
	}, F = () => P(async () => {
		JSON.stringify(i) !== JSON.stringify(w) && await s("dashboard", i), await N();
	}), I = () => P(async () => {
		await s("dashboard", null), await N(l("Dashboard reset to the default"));
	}), L = () => P(async () => {
		await H({
			title: l("Make this everyone’s Dashboard?"),
			description: l("People who customized their own Dashboard keep theirs."),
			confirm: l("Save as Default")
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
	}), q = (e) => u((t) => t && e(t)), J = (e) => T.sections.find((t) => t.items.includes(e))?.id, Q = (e) => q((t) => ({
		...t,
		hidden: [...t.hidden.filter((t) => t !== e), e]
	})), $ = (e, t) => q((n) => ({
		sections: n.sections.map((n) => ({
			...n,
			items: n.id === t ? [...n.items.filter((t) => t !== e), e] : n.items.filter((t) => t !== e)
		})),
		hidden: n.hidden.filter((t) => t !== e)
	}));
	return /* @__PURE__ */ K(R, {
		width: "wide",
		actions: x ? /* @__PURE__ */ K(W, { children: [
			e.home?.personal && /* @__PURE__ */ G(A, {
				variant: "ghost",
				icon: "undo",
				disabled: _,
				onClick: I,
				children: l("Reset to Default")
			}),
			S && /* @__PURE__ */ G(A, {
				variant: "ghost",
				disabled: _,
				onClick: L,
				children: l("Save as Default")
			}),
			S && y && /* @__PURE__ */ G(A, {
				variant: "ghost",
				disabled: _,
				onClick: z,
				children: l("Reset Everyone’s Default")
			}),
			/* @__PURE__ */ G(A, {
				variant: "ghost",
				onClick: j,
				children: l("Cancel")
			}),
			/* @__PURE__ */ G(A, {
				variant: "primary",
				loading: _,
				onClick: F,
				children: l("Done")
			})
		] }) : /* @__PURE__ */ G(A, {
			variant: "ghost",
			icon: "layout",
			onClick: k,
			children: l("Customize")
		}),
		children: [
			/* @__PURE__ */ G(ae, {}),
			/* @__PURE__ */ G(oe, {}),
			!x && /* @__PURE__ */ G(ie, {}),
			x ? /* @__PURE__ */ G(se, {
				widgets: C,
				shown: D,
				setDraft: u,
				columnOf: J,
				onRemove: Q,
				onAdd: g
			}) : O.length === 0 ? /* @__PURE__ */ G("div", {
				className: "rounded-lg border border-dashed border-border-strong",
				children: /* @__PURE__ */ G(M, {
					compact: !0,
					icon: "layout",
					title: l("Your dashboard is empty"),
					action: /* @__PURE__ */ G(A, {
						icon: "plus",
						onClick: () => {
							k(), g("default");
						},
						children: l("Add Widgets")
					})
				})
			}) : /* @__PURE__ */ G("div", {
				className: V(Y, O.length > 1 && X),
				children: O.map((e) => /* @__PURE__ */ G("div", {
					className: Z,
					children: D(e).map((e) => /* @__PURE__ */ G(B, { widget: C.get(e) }, e))
				}, e))
			}),
			/* @__PURE__ */ G(re, {
				open: h !== null,
				onOpenChange: (e) => !e && g(null),
				widgets: [...C.values()],
				shown: /* @__PURE__ */ new Set([...D("main"), ...D("side")]),
				onAdd: (e) => $(e.id, h === "default" || h === null ? e.column : h),
				onRemove: Q
			})
		]
	});
}
function ae() {
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
function oe() {
	let e = f(), n = Object.keys(e.packages.pending);
	return /* @__PURE__ */ G(W, { children: n.length > 0 && t("packages.manage") && /* @__PURE__ */ G(L, {
		tone: "warning",
		icon: "database",
		className: "mb-8",
		title: l("Database updates are waiting"),
		action: /* @__PURE__ */ G(A, {
			size: "sm",
			variant: "primary",
			onClick: () => o("packages/migrate").then(() => {
				U.success(l("Updated")), window.location.reload();
			}, U.error),
			children: l("Run Updates")
		})
	}) });
}
function se({ widgets: e, shown: t, setDraft: n, columnOf: r, onRemove: i, onAdd: a }) {
	let [o, s] = m(null), c = C(S(v, { activationConstraint: { distance: 4 } }), S(_, { coordinateGetter: D })), l = (e) => String(e).startsWith("column:") ? String(e).slice(7) : r(String(e)), u = ({ active: e, over: t }) => {
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
	return /* @__PURE__ */ K(h, {
		sensors: c,
		collisionDetection: Q,
		onDragStart: (e) => s(String(e.active.id)),
		onDragOver: u,
		onDragEnd: d,
		onDragCancel: () => s(null),
		children: [/* @__PURE__ */ G("div", {
			className: V(Y, X),
			children: ["main", "side"].map((n) => /* @__PURE__ */ G(ce, {
				column: n,
				ids: t(n),
				widgets: e,
				active: o,
				onRemove: i,
				onAdd: () => a(n)
			}, n))
		}), /* @__PURE__ */ G(g, {
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
function ce({ column: e, ids: t, widgets: n, active: r, onRemove: i, onAdd: a }) {
	let o = x({ id: `column:${e}` });
	return /* @__PURE__ */ K("div", {
		ref: o.setNodeRef,
		className: "min-w-0",
		children: [/* @__PURE__ */ G(w, {
			items: t,
			strategy: E,
			children: /* @__PURE__ */ G("div", {
				className: Z,
				children: t.map((e) => /* @__PURE__ */ G(le, {
					widget: n.get(e),
					dragging: r === e,
					onRemove: () => i(e)
				}, e))
			})
		}), /* @__PURE__ */ K("button", {
			type: "button",
			onClick: a,
			className: V("flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border-strong text-sm text-muted transition-colors duration-120 hover:border-faint hover:bg-sunken hover:text-text", t.length === 0 ? "h-32" : "mt-10 h-11", o.isOver && t.length === 0 && "border-focus bg-focus/5"),
			children: [/* @__PURE__ */ G(P, {
				name: "plus",
				size: 14
			}), l("Add Widget")]
		})]
	});
}
function le({ widget: e, dragging: t, onRemove: n }) {
	let r = O({ id: e.id });
	return /* @__PURE__ */ K("div", {
		ref: r.setNodeRef,
		style: {
			transform: k.Translate.toString(r.transform),
			transition: r.transition
		},
		className: V("group relative", t && "opacity-40"),
		children: [/* @__PURE__ */ G("div", {
			...r.attributes,
			...r.listeners,
			"aria-label": l("Move {widget}", { widget: e.label }),
			className: "cursor-grab rounded-lg outline-none ring-1 ring-border-strong transition-shadow duration-120 hover:ring-faint focus-visible:ring-2 focus-visible:ring-focus active:cursor-grabbing",
			children: /* @__PURE__ */ G("div", {
				inert: !0,
				className: "pointer-events-none select-none [&_section>header>:is(a,button,div)]:invisible",
				children: /* @__PURE__ */ G(B, { widget: e })
			})
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
