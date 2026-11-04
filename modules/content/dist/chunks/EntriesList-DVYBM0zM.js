import { t as e } from "./useCollection-DPy1gAYR.js";
import { Link as t, batch as n, getManifest as r, invalidate as i, locale as a, navigate as o, plural as s, prefetchAbility as c, run as l, setQuery as u, t as d, useAbility as f, useAction as p, useLocation as m, useManifest as h } from "@letterncms/sdk";
import { useEffect as g, useMemo as _, useState as v } from "react";
import { Avatar as y, AvatarStack as b, Button as x, Checkbox as S, DataCalendar as C, DataCard as w, DataGrid as ee, DateCell as T, EmptyState as te, Fields as ne, Icon as E, IconButton as re, Menu as D, NoMatches as ie, NotFoundState as ae, OverviewControls as oe, PagePagination as se, QueryError as ce, SelectionBar as le, Skeleton as O, StatusDot as k, TableFrame as A, TableHeader as j, TableMeta as M, TableRow as N, calendarRange as P, cn as F, confirm as ue, copyText as de, entryActionAvailability as fe, entryFieldColumns as pe, loadOverviewSource as me, nextTableSort as he, readViewPrefs as ge, recordDateColumns as _e, rowActionsClass as I, standardEntryColumns as ve, toast as L, useOverviewSource as ye, useRecordNavigation as be, useShortcut as xe, useViewPrefs as R } from "@letterncms/ui";
import { Fragment as Se, jsx as z, jsxs as B } from "react/jsx-runtime";
import { DndContext as V, PointerSensor as Ce, closestCenter as H, useSensor as we, useSensors as U } from "@dnd-kit/core";
import { SortableContext as Te, arrayMove as Ee, useSortable as De, verticalListSortingStrategy as Oe } from "@dnd-kit/sortable";
import { CSS as W } from "@dnd-kit/utilities";
// admin/src/EntryActions.tsx
function G({ item: e, handle: t, className: n }) {
	let r = h().collections.find((e) => e.handle === t)?.can, a = fe(r, e), s = p("entries/duplicate", {
		invalidates: ["entries/", "content/"],
		onSuccess: (e) => o(`/content/${t}/${e.id}`),
		onError: L.error
	}), c = !!e.uri && e.displayStatus !== "draft" && e.displayStatus !== "scheduled", u = (t, n) => l(t, {
		id: e.id,
		expectedVersion: e.version
	}).then(() => {
		L.success(n), i("entries/", "content/");
	}, L.error);
	return /* @__PURE__ */ B("div", {
		className: F("flex items-center gap-0.5 has-[[data-popup-open]]:opacity-100", n),
		children: [c && /* @__PURE__ */ z(re, {
			icon: "external",
			label: d("View on Site"),
			size: "xs",
			onClick: () => window.open(e.uri, "_blank", "noopener")
		}), /* @__PURE__ */ z(D, {
			trigger: /* @__PURE__ */ z(re, {
				icon: "more",
				label: d("More"),
				size: "xs"
			}),
			items: [
				{
					label: d("Open"),
					icon: "edit",
					onSelect: () => o(`/content/${t}/${e.id}`)
				},
				a.duplicate ? {
					label: d("Duplicate"),
					icon: "copy",
					onSelect: () => s.mutate({
						id: e.id,
						expectedVersion: e.version
					})
				} : null,
				a.publish && (e.displayStatus === "draft" || e.displayStatus === "changed") ? {
					label: d("Publish"),
					icon: "rocket",
					onSelect: () => u("entries/publish", d("Published"))
				} : null,
				a.unpublish && e.displayStatus !== "draft" ? {
					label: d("Unpublish"),
					icon: "eye-off",
					onSelect: () => u("entries/unpublish", d("Unpublished"))
				} : null,
				e.uri ? {
					label: d("Copy URL"),
					icon: "link",
					onSelect: () => void de(new URL(e.uri, window.location.origin).href, {
						copied: d("URL copied"),
						failed: d("Couldn’t copy the URL")
					})
				} : null,
				a.delete ? {
					separator: !0,
					label: ""
				} : null,
				a.delete ? {
					label: d("Delete"),
					icon: "trash",
					danger: !0,
					onSelect: async () => {
						await ue({
							title: d("Delete “{title}”?", { title: e.title }),
							description: d("This cannot be undone."),
							confirm: d("Delete"),
							danger: !0
						}) && l("entries/delete", {
							id: e.id,
							expectedVersion: e.version
						}).then(() => {
							L.success(d("Deleted")), i("entries/", "content/");
						}, L.error);
					}
				} : null
			]
		})]
	});
}
// admin/src/EntriesTable.tsx
var K = 20;
function ke({ handle: e, columns: t, ctx: n, items: r, tree: i, loading: a, stale: o, selected: s, onSelect: c, sort: l, onSort: u, cursor: f, urls: p = [] }) {
	let m = !!i && je(r), h = q(t, [...Y(r).map((e) => e.uri ?? ""), ...p], m, !!i), g = {
		id: "title",
		label: d("Title"),
		width: 0,
		sort: "title",
		render: () => null
	}, _ = Y(r).map((e) => e.id), v = _.filter((e) => s.has(e)).length;
	return /* @__PURE__ */ B(A, {
		template: h,
		label: d("Entries"),
		busy: a || o,
		children: [/* @__PURE__ */ B(N, {
			header: !0,
			className: "relative",
			children: [
				/* @__PURE__ */ z("div", {
					role: "columnheader",
					className: J,
					children: /* @__PURE__ */ z(S, {
						checked: _.length > 0 && v === _.length,
						indeterminate: v > 0 && v < _.length,
						label: /* @__PURE__ */ z("span", {
							className: "sr-only",
							children: d("Select All")
						}),
						onChange: (e) => c(_, e),
						disabled: a || _.length === 0
					})
				}),
				m && /* @__PURE__ */ z("span", { role: "none" }),
				/* @__PURE__ */ z(X, {
					column: g,
					sort: l,
					onSort: u
				}),
				t.map((e) => /* @__PURE__ */ z(X, {
					column: e,
					sort: l,
					onSort: u
				}, e.id)),
				/* @__PURE__ */ z(j, {
					label: d("Actions"),
					hiddenLabel: !0
				})
			]
		}), a ? /* @__PURE__ */ z(Me, {
			columns: t,
			tree: m
		}) : /* @__PURE__ */ z("div", {
			className: F("transition-opacity duration-180", o && "opacity-60"),
			children: i ? /* @__PURE__ */ z(Ne, {
				handle: e,
				nested: m,
				nodes: r,
				parentId: null,
				depth: 0,
				columns: t,
				ctx: n,
				selected: s,
				onSelect: c,
				cursor: f
			}) : r.map((r) => /* @__PURE__ */ z(Z, {
				item: r,
				handle: e,
				columns: t,
				ctx: n,
				selected: s.has(r.id),
				onSelect: c,
				active: f === r.id
			}, r.id))
		})]
	});
}
var Ae = (e) => `minmax(120px,${Math.min(360, Math.max(120, Math.ceil(Math.max(0, ...e.map((e) => e.length)) * 7.3) + 8))}px)`;
function q(e, t = [], n = !1, r = n) {
	return [
		...n ? ["0px"] : [],
		"minmax(200px,1fr)",
		...e.map((e) => e.id === "uri" ? Ae(t) : typeof e.width == "number" ? `${e.width}px` : e.width),
		r ? "76px" : "52px"
	].join(" ");
}
var J = "relative z-10 flex items-center max-sm:w-4 max-sm:shrink-0 sm:absolute sm:right-full sm:top-1/2 sm:-translate-y-1/2 md:mr-1 [&_label]:gap-0", je = (e) => e.some((e) => (e.children?.length ?? 0) > 0);
function Y(e) {
	return e.flatMap((e) => [e, ...Y(e.children ?? [])]);
}
function X({ column: e, sort: t, onSort: n }) {
	let r = t?.field === e.sort;
	return /* @__PURE__ */ z(j, {
		label: e.label,
		align: e.align,
		direction: r ? t.desc ? "descending" : "ascending" : void 0,
		onSort: e.sort ? () => n(e) : void 0
	});
}
function Me({ columns: e, tree: t }) {
	return /* @__PURE__ */ z("div", {
		"aria-hidden": "true",
		children: [
			"56%",
			"38%",
			"64%",
			"44%",
			"50%",
			"32%",
			"60%",
			"42%"
		].map((n, r) => /* @__PURE__ */ B(N, {
			className: "max-sm:[&>*:nth-child(n+3)]:hidden",
			children: [
				t && /* @__PURE__ */ z("span", {}),
				/* @__PURE__ */ z("div", {
					style: { width: n },
					className: "max-sm:flex-1",
					children: /* @__PURE__ */ z(O, { className: "h-3" })
				}),
				e.map((e) => /* @__PURE__ */ z(O, { className: "h-3 w-3/5" }, e.id)),
				/* @__PURE__ */ z("span", {})
			]
		}, r))
	});
}
function Z({ item: e, handle: n, columns: r, ctx: i, selected: a, onSelect: o, active: s, depth: c = 0, expander: l, dragHandle: u, tree: f }) {
	return /* @__PURE__ */ B(N, {
		recordId: e.id,
		selected: a,
		active: s,
		children: [
			/* @__PURE__ */ z("div", {
				role: "cell",
				"data-row-check": "",
				className: J,
				children: /* @__PURE__ */ z(S, {
					checked: a,
					onChange: (t) => o([e.id], t),
					label: /* @__PURE__ */ z("span", {
						className: "sr-only",
						children: d("Select {name}", { name: e.title || d("Untitled") })
					})
				})
			}),
			f && /* @__PURE__ */ z("span", {
				role: "none",
				className: "max-sm:hidden"
			}),
			/* @__PURE__ */ B("div", {
				role: "cell",
				className: "flex min-w-0 items-center max-sm:flex-1",
				style: c ? { paddingLeft: c * K } : void 0,
				children: [l, /* @__PURE__ */ z(t, {
					to: `/content/${n}/${e.id}`,
					className: "min-w-0 truncate text-sm font-medium text-text no-underline outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-focus",
					children: e.title || /* @__PURE__ */ z("span", {
						className: "text-faint",
						children: d("Untitled")
					})
				})]
			}),
			/* @__PURE__ */ z(M, { children: r.map((t) => /* @__PURE__ */ z("div", {
				role: "cell",
				"data-align": t.align,
				className: F("flex min-w-0 items-center", t.align === "end" && "justify-end"),
				children: t.render(e, i)
			}, t.id)) }),
			/* @__PURE__ */ B("div", {
				role: "cell",
				"data-table-actions": !0,
				className: I,
				children: [u, /* @__PURE__ */ z(G, {
					item: e,
					handle: n
				})]
			})
		]
	});
}
function Ne(e) {
	let [t, n] = v({}), r = e.collapsed ?? t, a = e.setCollapsed ?? n, { handle: o, nodes: s, parentId: c, depth: u } = e, f = h().collections.find((e) => e.handle === o)?.can, p = s.every((e) => fe(f, e).move), [m, g] = v(null), _ = m ?? s, y = U(we(Ce, { activationConstraint: { distance: 4 } }));
	return /* @__PURE__ */ z(V, {
		sensors: y,
		collisionDetection: H,
		onDragEnd: async (e) => {
			if (!p || !e.over || e.active.id === e.over.id) return;
			let t = _.map((e) => e.id), n = Ee(_, t.indexOf(String(e.active.id)), t.indexOf(String(e.over.id)));
			g(n);
			try {
				await l("entries/reorder", {
					collection: o,
					ids: n.map((e) => e.id),
					parentId: c,
					versions: Object.fromEntries(n.map((e) => [e.id, e.version]))
				}), i("entries/");
			} catch (e) {
				L.error(e);
			} finally {
				g(null);
			}
		},
		children: /* @__PURE__ */ z(Te, {
			items: _.map((e) => e.id),
			strategy: Oe,
			children: _.map((t) => {
				let n = t.children ?? [], i = !r[t.id];
				return /* @__PURE__ */ z(Pe, {
					id: t.id,
					disabled: !p,
					children: (s) => /* @__PURE__ */ B(Se, { children: [/* @__PURE__ */ z(Z, {
						item: t,
						handle: o,
						columns: e.columns,
						ctx: e.ctx,
						selected: e.selected.has(t.id),
						onSelect: e.onSelect,
						active: e.cursor === t.id,
						depth: u,
						tree: e.nested,
						dragHandle: s,
						expander: n.length > 0 && /* @__PURE__ */ z("button", {
							type: "button",
							onClick: () => a((e) => ({
								...e,
								[t.id]: i
							})),
							className: "relative z-10 -ml-5 mr-0 grid size-5 shrink-0 -translate-x-0.5 place-items-center rounded-xs text-faint transition-colors duration-120 hover:bg-hover hover:text-text",
							"aria-expanded": i,
							"aria-label": d(i ? "Collapse" : "Expand"),
							children: /* @__PURE__ */ z(E, {
								name: "chevron-right",
								size: 12,
								className: F("transition-transform duration-120", i && "rotate-90")
							})
						})
					}), n.length > 0 && i && /* @__PURE__ */ z(Ne, {
						...e,
						nodes: n,
						parentId: t.id,
						depth: u + 1,
						collapsed: r,
						setCollapsed: a
					})] })
				}, t.id);
			})
		})
	});
}
function Pe({ id: e, children: t, disabled: n }) {
	let { attributes: r, listeners: i, setNodeRef: a, transform: o, transition: s, isDragging: c } = De({
		id: e,
		disabled: n
	}), l = /* @__PURE__ */ z("button", {
		type: "button",
		...r,
		...i,
		className: "grid size-6 cursor-grab place-items-center rounded-xs text-faint transition-colors duration-120 hover:bg-hover hover:text-text active:cursor-grabbing max-sm:hidden",
		"aria-label": d("Drag to Reorder"),
		children: /* @__PURE__ */ z(E, {
			name: "drag",
			size: 14
		})
	});
	return /* @__PURE__ */ z("div", {
		ref: a,
		style: {
			transform: W.Transform.toString(o),
			transition: s
		},
		className: F(c && "relative z-20 bg-bg shadow-pop"),
		children: t(n ? null : l)
	});
}
// admin/src/BuiltinPages.tsx
function Fe({ groups: e, columns: n, urls: r, nested: a, tree: s }) {
	let [c, u] = v(null), f = q(n, r, a, s), p = async (e, t) => {
		u(`${e.id}/${t.handle}`);
		try {
			let { id: n } = await l("pages/customise", {
				group: e.id,
				handle: t.handle
			});
			i("pages/builtin", "entries/"), o(`/content/${e.collection}/${n}`);
		} catch (e) {
			L.error(e);
		} finally {
			u(null);
		}
	}, m = (e, t) => t.id === "uri" ? e.path ? /* @__PURE__ */ z("span", {
		className: "block truncate font-mono text-xs text-faint",
		children: e.path
	}) : /* @__PURE__ */ z("span", {
		className: "block truncate text-xs text-faint",
		children: d("Shown inside other pages")
	}) : t.id === "status" ? e.status === "conflict" ? /* @__PURE__ */ z(k, {
		status: "warning",
		label: d("A page has this address"),
		className: "whitespace-nowrap"
	}) : e.status === "draft" ? /* @__PURE__ */ z(k, { status: "draft" }) : e.status === "customised" ? /* @__PURE__ */ z(k, { status: "published" }) : /* @__PURE__ */ z(k, {
		status: "neutral",
		label: d("Standard")
	}) : null;
	return /* @__PURE__ */ B("section", {
		className: "mt-10",
		"aria-label": d("Built-in Pages"),
		children: [/* @__PURE__ */ z("h2", {
			className: "m-0 mb-3 text-sm font-semibold text-ink",
			children: d("Built-in Pages")
		}), /* @__PURE__ */ z("div", {
			className: "space-y-6",
			children: e.map((e) => /* @__PURE__ */ B("div", { children: [/* @__PURE__ */ z("div", {
				className: "cms-label mb-1.5",
				children: e.label
			}), /* @__PURE__ */ z(A, {
				template: f,
				label: e.label,
				children: e.pages.map((r) => {
					let i = `${e.id}/${r.handle}`;
					return /* @__PURE__ */ B(N, {
						className: F(c === i && "opacity-60"),
						children: [
							a && /* @__PURE__ */ z("span", {
								role: "none",
								className: "max-sm:hidden"
							}),
							/* @__PURE__ */ z("div", {
								role: "cell",
								className: "flex min-w-0 items-center max-sm:flex-1",
								children: r.id ? /* @__PURE__ */ z(t, {
									to: `/content/${e.collection}/${r.id}`,
									className: "min-w-0 truncate text-sm font-medium text-text no-underline outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-focus",
									children: r.label
								}) : /* @__PURE__ */ z("span", {
									className: "min-w-0 truncate text-sm font-medium text-text",
									children: r.label
								})
							}),
							/* @__PURE__ */ z(M, { children: n.map((e) => /* @__PURE__ */ z("div", {
								role: "cell",
								className: "flex min-w-0 items-center overflow-visible",
								children: m(r, e)
							}, e.id)) }),
							/* @__PURE__ */ z("div", {
								role: "cell",
								className: "relative z-10 flex min-w-0 items-center justify-end [&>*]:shrink-0",
								children: !r.id && r.status === "standard" && e.canCustomise && /* @__PURE__ */ z(x, {
									size: "xs",
									variant: "ghost",
									loading: c === i,
									disabled: c !== null,
									onClick: () => void p(e, r),
									children: d("Customize")
								})
							})
						]
					}, r.handle);
				})
			})] }, e.id))
		})]
	});
}
// admin/src/EntriesCalendar.tsx
var Ie = (e) => e.toISOString().slice(0, 19).replace("T", " ");
function Le(e, t, n, r = "published") {
	let i = P(n), a = r === "published" ? "published_at" : "updated_at";
	return {
		...i,
		dated: {
			collection: e,
			...t,
			sort: a,
			perPage: 200,
			filters: [{
				field: a,
				operator: ">=",
				value: Ie(i.start)
			}, {
				field: a,
				operator: "<",
				value: Ie(i.end)
			}]
		},
		undated: {
			collection: e,
			...t,
			sort: "-updated_at",
			perPage: 200,
			filters: [{
				field: a,
				operator: "null"
			}]
		}
	};
}
function Re({ handle: e, filters: t, dateField: n, selection: r, cursor: i, onItems: a }) {
	let { query: o } = m(), { dated: s, undated: c } = Le(e, t, o.month, n), l = ye({
		ability: "entries/list",
		input: s,
		perPage: 200
	}, !0), f = ye({
		ability: "entries/list",
		input: c,
		perPage: 200
	}, !0), p = [...l.items, ...f.items], h = p.map((e) => `${e.id}:${e.version}`).join(",");
	return g(() => {
		a?.(p);
	}, [h, a]), /* @__PURE__ */ z(C, {
		label: d("Entries"),
		items: p,
		month: o.month,
		onMonth: (e) => u({ month: e }),
		date: (e) => n === "published" ? e.publishedAt : e.updatedAt,
		rowKey: (e) => e.id,
		rowHref: (t) => `/content/${e}/${t.id}`,
		title: (e) => /* @__PURE__ */ B("span", {
			className: "flex min-w-0 items-center gap-1.5",
			children: [/* @__PURE__ */ z(k, {
				status: e.displayStatus,
				label: ""
			}), /* @__PURE__ */ z("span", {
				className: "truncate",
				children: e.title || d("Untitled")
			})]
		}),
		loading: l.loading || f.loading,
		stale: l.stale || f.stale,
		error: l.error || f.error,
		onRetry: () => {
			l.retry(), f.retry();
		},
		selection: r,
		cursor: i
	});
}
// admin/src/listColumns.tsx
function ze(e, t, n) {
	let r = [];
	e.routable && r.push({
		id: "uri",
		label: d("URL"),
		width: "minmax(120px,0.6fr)",
		sort: "uri",
		render: (e) => e.uri && /* @__PURE__ */ z("span", {
			className: "block truncate font-mono text-xs text-faint",
			children: e.uri
		})
	}), r.push({
		id: "status",
		label: d("Status"),
		width: 104,
		sort: "status",
		render: (e) => /* @__PURE__ */ z(k, { status: e.displayStatus })
	});
	for (let e of pe(t?.resolvedFields ?? t?.fields ?? [])) {
		let t = e.field;
		r.push({
			...e,
			render: (e, n) => /* @__PURE__ */ z(qe, {
				field: t,
				value: e.values?.[t.handle],
				ctx: n
			})
		});
	}
	return n.length > 1 && r.push({
		id: "translations",
		label: d("Languages"),
		width: 24 + n.length * 26,
		render: (e, t) => /* @__PURE__ */ z(Ge, {
			item: e,
			locales: t.locales
		})
	}), r.push({
		id: "author",
		label: d("Author"),
		width: 132,
		sort: "author_id",
		render: (e) => e.author ? /* @__PURE__ */ z(We, { person: e.author }) : /* @__PURE__ */ z("span", {
			className: "text-xs text-faint",
			children: e.authorId ? d("Unavailable person") : d("Unassigned")
		})
	}), r.push(..._e((e) => e, {
		published: "published_at",
		updated: "updated_at"
	}).map((e) => ({
		...e,
		width: e.width
	}))), r;
}
function Be(e, t, n = "table") {
	return t?.default_columns ?? ve(e.routable, t?.listing, n, t?.resolvedFields ?? t?.fields);
}
function Ve(e) {
	return (e?.resolvedFields ?? e?.fields ?? []).filter((e) => e.type === "media");
}
function He(e) {
	return (e?.resolvedFields ?? e?.fields ?? []).find((e) => e.type === "textarea" || e.type === "text" && !["title", "slug"].includes(e.handle));
}
function Ue(e) {
	return (Array.isArray(e) ? e : typeof e == "string" && e ? [e] : []).filter((e) => typeof e == "string" && e !== "");
}
function Q(e, t) {
	let n = t.media.get(e.toLowerCase());
	return n ? n.thumb ?? (n.kind === "image" ? n.url : null) : e.startsWith("/") || e.startsWith("http") ? e : null;
}
function We({ person: e }) {
	return /* @__PURE__ */ B("span", {
		className: "flex min-w-0 items-center gap-1.5 text-xs text-muted",
		children: [/* @__PURE__ */ z(y, {
			name: e.name,
			initials: e.initials,
			src: e.avatar,
			size: 18
		}), /* @__PURE__ */ z("span", {
			className: "truncate",
			children: e.name
		})]
	});
}
function Ge({ item: e, locales: t }) {
	let n = new Set(e.translations ?? [e.locale]);
	return /* @__PURE__ */ z("span", {
		className: "flex items-center gap-1",
		children: t.map((e) => /* @__PURE__ */ z("span", {
			title: n.has(e) ? void 0 : d("Not translated"),
			className: F("inline-flex h-4.5 w-[22px] items-center justify-center rounded-xs font-mono text-[10px] uppercase", n.has(e) ? "bg-sunken text-text" : "text-faint/70"),
			children: e
		}, e))
	});
}
function Ke(e, t) {
	let n = e.options;
	if (n && !Array.isArray(n) && typeof n == "object") return n[String(t)] ?? String(t);
	if (Array.isArray(n)) {
		let e = n.find((e) => String(typeof e == "object" ? e.value : e) === String(t));
		if (e && typeof e == "object") return e.label ?? String(t);
	}
	return String(t);
}
function qe({ field: e, value: t, ctx: n }) {
	if (t == null || t === "" || Array.isArray(t) && t.length === 0) return null;
	switch (e.type) {
		case "toggle": return t ? /* @__PURE__ */ z(E, {
			name: "check",
			size: 14,
			className: "text-text",
			"aria-label": d("Yes")
		}) : null;
		case "number": return /* @__PURE__ */ z("span", {
			className: "block truncate text-right text-xs tabular-nums text-text",
			children: Number(t).toLocaleString(a())
		});
		case "date": return /* @__PURE__ */ z(T, { iso: String(t) });
		case "select": {
			let n = (Array.isArray(t) ? t : [t]).map((t) => Ke(e, t));
			return /* @__PURE__ */ z("span", {
				className: "block truncate text-xs text-text",
				children: n.join(", ")
			});
		}
		case "tags": return /* @__PURE__ */ z($, { labels: (Array.isArray(t) ? t : [t]).map(String) });
		case "entries": return /* @__PURE__ */ z($, { labels: t.map((e) => e.title) });
		case "users": {
			let e = t;
			return e.length === 1 ? /* @__PURE__ */ z(We, { person: e[0] }) : /* @__PURE__ */ z(b, {
				people: e,
				size: 18,
				max: 3
			});
		}
		case "media": {
			let e = Ue(t), r = Q(e[0], n);
			return /* @__PURE__ */ B("span", {
				className: "flex items-center gap-1",
				children: [/* @__PURE__ */ z("span", {
					className: "grid size-6 shrink-0 place-items-center overflow-hidden rounded-xs border border-border bg-sunken text-faint",
					children: r ? /* @__PURE__ */ z("img", {
						src: r,
						alt: "",
						loading: "lazy",
						className: "size-full object-cover"
					}) : /* @__PURE__ */ z(E, {
						name: "file",
						size: 12
					})
				}), e.length > 1 && /* @__PURE__ */ B("span", {
					className: "text-2xs text-faint",
					children: ["+", e.length - 1]
				})]
			});
		}
		case "color": return /* @__PURE__ */ B("span", {
			className: "flex items-center gap-1.5 text-xs",
			children: [/* @__PURE__ */ z("span", {
				className: "size-3 shrink-0 rounded-full border border-border",
				style: { background: String(t) }
			}), /* @__PURE__ */ z("span", {
				className: "truncate font-mono text-muted",
				children: String(t)
			})]
		});
		case "slug":
		case "url":
		case "email": return /* @__PURE__ */ z("span", {
			className: "block truncate font-mono text-xs text-muted",
			children: String(t)
		});
		default: return /* @__PURE__ */ z("span", {
			className: F("block truncate text-xs", e.type === "textarea" ? "text-muted" : "text-text"),
			children: typeof t == "object" ? JSON.stringify(t) : String(t)
		});
	}
}
function $({ labels: e }) {
	return /* @__PURE__ */ B("span", {
		className: "flex min-w-0 items-center gap-1",
		children: [e.slice(0, 2).map((e, t) => /* @__PURE__ */ z("span", {
			className: "inline-flex h-5 min-w-0 shrink items-center rounded-xs bg-sunken px-1.5 text-2xs text-text",
			children: /* @__PURE__ */ z("span", {
				className: "truncate",
				children: e
			})
		}, t)), e.length > 2 && /* @__PURE__ */ B("span", {
			className: "shrink-0 text-2xs text-faint",
			children: ["+", e.length - 2]
		})]
	});
}
// admin/src/EntriesGrid.tsx
function Je({ handle: e, items: t, ctx: n, media: r, excerpt: i, columns: a, visible: o, icon: s, loading: c, stale: l, selected: u, onSelect: d, cursor: f }) {
	return /* @__PURE__ */ z(ee, {
		loading: c,
		stale: l,
		media: !!r,
		children: t.map((t) => /* @__PURE__ */ z(Ye, {
			item: t,
			handle: e,
			ctx: n,
			media: r,
			excerpt: i,
			columns: a,
			visible: o,
			icon: s,
			selected: u.has(t.id),
			onSelect: d,
			active: f === t.id
		}, t.id))
	});
}
function Ye({ item: e, handle: t, ctx: n, media: r, excerpt: i, columns: a, visible: o, icon: s, selected: c, onSelect: l, active: u }) {
	let f = r ? Ue(e.values?.[r.handle]) : [], p = f[0] ? Q(f[0], n) : null, m = !r && i && !a.some((e) => e.field?.handle === i.handle) ? Xe(e.values?.[i.handle]) : "", h = a.filter((e) => e.id === "translations" || e.field && e.field.handle !== r?.handle), g = o.has("published") && e.publishedAt ? {
		label: d("Published"),
		iso: e.publishedAt,
		relative: !1
	} : o.has("updated") && e.updatedAt ? {
		label: d("Updated"),
		iso: e.updatedAt,
		relative: !0
	} : null;
	return /* @__PURE__ */ B(w, {
		recordId: e.id,
		title: e.title || /* @__PURE__ */ z("span", {
			className: "text-faint",
			children: d("Untitled")
		}),
		href: `/content/${t}/${e.id}`,
		icon: s,
		selected: c,
		active: u,
		onSelect: (t) => l([e.id], t),
		actions: /* @__PURE__ */ z(G, {
			item: e,
			handle: t
		}),
		image: r ? p ? /* @__PURE__ */ z("img", {
			src: p,
			alt: "",
			loading: "lazy",
			className: "absolute inset-0 size-full object-cover"
		}) : /* @__PURE__ */ z("div", {
			className: "grid size-full place-items-center text-faint",
			children: /* @__PURE__ */ z(E, {
				name: "image",
				size: 20
			})
		}) : void 0,
		footer: /* @__PURE__ */ B(Se, { children: [o.has("status") && /* @__PURE__ */ z(k, { status: e.displayStatus }), /* @__PURE__ */ B("span", {
			className: "ml-auto flex min-w-0 items-center gap-1.5",
			children: [o.has("author") && (e.author ? /* @__PURE__ */ z(y, {
				name: e.author.name,
				initials: e.author.initials,
				src: e.author.avatar,
				size: 16
			}) : /* @__PURE__ */ z("span", {
				className: "text-2xs text-faint",
				children: e.authorId ? d("Unavailable person") : d("Unassigned")
			})), g && /* @__PURE__ */ B("span", {
				className: "flex min-w-0 items-center gap-1 text-xs text-faint",
				children: [g.label, /* @__PURE__ */ z(T, {
					iso: g.iso,
					relative: g.relative
				})]
			})]
		})] }),
		children: [
			o.has("uri") && e.uri && /* @__PURE__ */ z("span", {
				className: F("mt-0.5 truncate font-mono text-2xs text-faint", !r && "pl-[22px]"),
				children: e.uri
			}),
			m && /* @__PURE__ */ z("p", {
				className: "m-0 mt-1.5 line-clamp-3 pl-[22px] text-xs leading-relaxed text-muted",
				children: m
			}),
			h.length > 0 && /* @__PURE__ */ z("dl", {
				className: F("m-0 mt-2 space-y-1.5", !r && "pl-[22px]"),
				children: h.map((t) => /* @__PURE__ */ B("div", {
					className: "flex min-w-0 items-center justify-between gap-3 text-xs",
					children: [/* @__PURE__ */ z("dt", {
						className: "min-w-0 flex-1 truncate text-faint",
						children: t.label
					}), /* @__PURE__ */ z("dd", {
						className: "m-0 min-w-0 max-w-[65%] truncate",
						children: t.render(e, n)
					})]
				}, t.id))
			})
		]
	});
}
function Xe(e) {
	return typeof e == "string" ? e.replace(/<[^>]+>/g, " ").replace(/[#>*_`~[\]()!-]+/g, " ").replace(/\s+/g, " ").trim() : "";
}
// admin/src/listPrefs.ts
var Ze = (e) => r().collections.find((t) => t.handle === e)?.defaultView ?? "table";
function Qe(e, t = Ze(e)) {
	return ge(`entries.${e}`, t);
}
function $e(e, t = Ze(e)) {
	return R(`entries.${e}`, t);
}
// admin/src/EntriesList.tsx
function et(e) {
	try {
		let t = new Intl.DisplayNames([e], { type: "language" }).of(e) ?? e;
		return t.charAt(0).toLocaleUpperCase(e) + t.slice(1);
	} catch {
		return e;
	}
}
function tt(e, t, n, r, i) {
	let a = e.collections.find((e) => e.handle === t), o = e.site.locales, s = o.includes(i.locale ?? "") ? i.locale : e.site.defaultLocale, c = i.q ?? "", l = i.status ?? "any", u = Number(i.page ?? 1), d = a?.structure === "tree", f = a?.structure === "dated", p = [
		"table",
		...Ve(n).length > 0 || a?.defaultView === "grid" ? ["grid"] : [],
		...f || a?.defaultView === "calendar" ? ["calendar"] : []
	], m = p.includes(r.view) ? r.view : "table", h = a ? ze(a, n, o) : [], g = new Set(r.columns ?? (a ? Be(a, n, m) : [])), _ = h.filter((e) => g.has(e.id)), v = [it(), ...h.filter((e) => e.sort)], y = r.sort && v.some((e) => e.sort === r.sort.replace(/^-/, "")) ? r.sort : null, b = d ? null : n?.sort ?? (f ? "-published_at" : "title"), x = !!c || l !== "any", S = d && !y && !x && m !== "calendar", C = [...new Set(_.filter((e) => e.field).map((e) => e.field.handle))].sort();
	return {
		all: h,
		shown: g,
		columns: _,
		sortable: v,
		sortKey: y,
		ownSort: b,
		isTree: d,
		view: m,
		views: p,
		showTree: S,
		filtered: x,
		fields: C,
		locale: s,
		input: {
			collection: t,
			locale: s,
			search: c || void 0,
			status: l,
			page: u,
			perPage: e.config?.content?.perPage ?? 50,
			sort: y ?? void 0,
			fields: C
		}
	};
}
async function nt(e, t) {
	let n = r();
	if (!n.collections.some((t) => t.handle === e)) return;
	let i = tt(n, e, await c("collections/get", { handle: e }), Qe(e), t);
	if (i.view === "calendar") {
		let { dated: n, undated: r } = Le(e, {
			locale: i.locale,
			status: t.status ?? "any",
			search: t.q || void 0
		}, t.month, Qe(e).calendarDate);
		await Promise.all([me({
			ability: "entries/list",
			input: n,
			perPage: 200
		}), me({
			ability: "entries/list",
			input: r,
			perPage: 200
		})]);
	} else await c(i.showTree ? "entries/tree" : "entries/list", i.showTree ? {
		collection: e,
		locale: i.locale,
		fields: i.fields
	} : i.input);
}
function rt({ props: t }) {
	let r = t.collection, a = h(), { summary: c, collection: l, error: p, isLoading: y } = e(r), { query: b } = m(), [S, C] = v(b.q ?? ""), w = b.status ?? "any", ee = Number(b.page ?? 1), T = a.site.locales, D = T.includes(b.locale ?? "") ? b.locale : a.site.defaultLocale, O = fe(c?.can), k = `/content/${r}/new${D === a.site.defaultLocale ? "" : `?locale=${D}`}`, [A, j] = $e(r), [M, N] = v(/* @__PURE__ */ new Set()), [P, F] = v(!1), [de, pe] = v([]), [me, ge] = v([]), { all: _e, shown: I, columns: ve, sortable: ye, sortKey: R, ownSort: V, isTree: Ce, view: H, views: we, showTree: U, filtered: Te, fields: Ee, input: De } = _(() => tt(a, r, l, A, {
		...b,
		q: S
	}), [
		a,
		r,
		l,
		A,
		b,
		S
	]), Oe = R ? {
		field: R.replace(/^-/, ""),
		desc: R.startsWith("-")
	} : V ? {
		field: V.replace(/^-/, ""),
		desc: V.startsWith("-"),
		implicit: !0
	} : null, W = Ve(l)[0], G = He(l), K = f("entries/list", De, {
		enabled: !!c && !U && H !== "calendar",
		placeholderData: (e) => e
	}), Ae = f("pages/builtin", {}, { enabled: r === "pages" }), q = f("entries/tree", {
		collection: r,
		locale: D,
		fields: Ee
	}, {
		enabled: !!c && U,
		placeholderData: (e) => e
	}), J = U ? q.data ?? [] : K.data?.items ?? [], X = U ? Y(J) : J, Me = U ? q.isLoading : K.isLoading, Z = U ? q.isPlaceholderData : K.isPlaceholderData, Ne = p ?? (U ? q.error : K.error), Pe = () => {
		p && i("collections/get"), U ? q.refetch() : K.refetch();
	}, Ie = {
		published: X.some((e) => !!e.publishedAt),
		updated: X.some((e) => !!e.updatedAt)
	}, Le = (e) => Me || !(e.id in Ie) || Ie[e.id], ze = _e.filter(Le), Q = ve.filter(Le), We = [...Q.filter((e) => e.field?.type === "media").map((e) => e.field.handle), ...H === "grid" && W ? [W.handle] : []], Ge = [...new Set(X.flatMap((e) => We.flatMap((t) => Ue(e.values?.[t]))))].filter((e) => /^[0-9a-z]{26}$/i.test(e)), Ke = f("media/lookup", { ids: Ge }, {
		enabled: Ge.length > 0 && a.fieldTypes.some((e) => e.key === "media"),
		staleTime: 3e5,
		placeholderData: (e) => e
	}), qe = _(() => ({
		media: new Map((Ke.data?.items ?? []).map((e) => [e.id.toLowerCase(), e])),
		locales: T
	}), [Ke.data, T]);
	g(() => C(b.q ?? ""), [r]), g(() => {
		N(/* @__PURE__ */ new Set()), pe([]);
	}, [
		r,
		ee,
		w,
		S,
		D,
		R
	]);
	let $ = (e, t) => N((n) => {
		let r = new Set(n);
		for (let n of e) t ? r.add(n) : r.delete(n);
		return r;
	});
	xe("c", () => O.create && o(k));
	let Ye = be({
		resetKey: `${r}:${ee}:${w}:${S}:${D}:${R}`,
		selection: {
			ids: M,
			onSelect: $
		},
		onOpen: (e) => o(`/content/${r}/${e}`)
	});
	if (!c) return /* @__PURE__ */ z(ae, {
		icon: "collection",
		action: /* @__PURE__ */ z(x, {
			onClick: () => o("/"),
			children: d("Go Home")
		})
	});
	let Xe = (e) => {
		j({ sort: e }), u({ page: null });
	}, Ze = (e) => Xe(he(e.sort, R, e.descFirst, V)), Qe = async (e) => {
		if (P || Z || !M.size || (e === "entries/delete" ? !O.delete : !O.publish)) return;
		let t = [...M], r = H === "calendar" ? me : X;
		if (t.some((e) => !r.some((t) => t.id === e))) {
			L.error(d("The selection changed. Refresh and select the entries again."));
			return;
		}
		let a = t.length;
		if ((e !== "entries/delete" || await ue({
			title: s(a, "Delete {count} entry?", "Delete {count} entries?"),
			description: d("This cannot be undone."),
			confirm: d("Delete"),
			danger: !0
		})) && !P) {
			F(!0), pe([]);
			try {
				let o = (await n(t.map((t) => ({
					ability: e,
					input: {
						id: t,
						expectedVersion: r.find((e) => e.id === t).version
					}
				})), !1)).flatMap((e, n) => "error" in e ? [{
					id: t[n],
					title: r.find((e) => e.id === t[n]).title,
					message: e.error.message
				}] : []);
				o.length ? L.error(d("{failed} of {total} failed.", {
					failed: o.length,
					total: a
				})) : e === "entries/publish" ? L.success(s(a, "Published {count} entry", "Published {count} entries")) : e === "entries/unpublish" ? L.success(s(a, "Unpublished {count} entry", "Unpublished {count} entries")) : L.success(s(a, "Deleted {count} entry", "Deleted {count} entries")), pe(o), N(new Set(o.map((e) => e.id))), i("entries/", "content/");
			} catch (e) {
				L.error(e);
			} finally {
				F(!1);
			}
		}
	}, nt = () => {
		C(""), u({
			q: null,
			status: null,
			page: null
		});
	}, rt = R ? ye.find((e) => e.sort === R.replace(/^-/, "")) : void 0, it = Be(c, l, H), at = H !== (c.defaultView ?? "table") || !!R || A.calendarDate !== "published" || !!b.month || ze.some((e) => I.has(e.id) !== it.includes(e.id)), ot = (H === "calendar" ? me : X).filter((e) => M.has(e.id)), st = ot.some((e) => e.displayStatus === "draft" || e.displayStatus === "changed"), ct = ot.some((e) => e.displayStatus !== "draft"), lt = r === "pages" && H !== "calendar" && !Te ? (Ae.data ?? []).filter((e) => e.pages.length > 0) : [], ut = !Me && !y && !Ne && X.length === 0;
	return /* @__PURE__ */ B(Se, { children: [
		/* @__PURE__ */ B("div", {
			className: "mb-3 flex flex-wrap items-center gap-x-2 gap-y-2",
			children: [/* @__PURE__ */ z(ne, {
				bare: !0,
				layout: "inline",
				className: "flex min-w-0 flex-1 flex-wrap items-center gap-2 max-sm:contents",
				fields: [
					{
						handle: "q",
						type: "text",
						label: d("Search"),
						icon: "search",
						size: "sm",
						className: "w-full sm:w-60",
						placeholder: d("Search {items}…", { items: c.title.toLowerCase() })
					},
					{
						handle: "status",
						type: "select",
						label: d("Status"),
						display: "segmented",
						required: !0,
						className: "shrink-0",
						options: {
							any: d("All"),
							published: d("Published"),
							draft: d("Drafts")
						}
					},
					...T.length > 1 ? [{
						handle: "locale",
						type: "select",
						label: d("Language"),
						display: "segmented",
						required: !0,
						className: "shrink-0",
						options: T.map((e) => ({
							value: e,
							label: e.toUpperCase(),
							title: et(e)
						}))
					}] : []
				],
				values: {
					q: S,
					status: w,
					locale: D
				},
				onChange: (e, t) => {
					e === "q" ? (C(t ?? ""), u({
						q: t,
						page: null
					})) : u(e === "status" ? {
						status: t === "any" ? null : t,
						page: null
					} : {
						locale: t === a.site.defaultLocale ? null : t,
						page: null
					});
				}
			}), /* @__PURE__ */ z(oe, {
				view: H,
				views: we,
				all: ze,
				shown: I,
				sortable: ye,
				sortKey: R,
				implicitSort: V,
				isTree: Ce,
				onColumns: (e) => j({ columns: e }),
				onSort: Xe,
				onView: (e) => j({ view: e }),
				calendarDate: A.calendarDate,
				onCalendarDate: (e) => j({ calendarDate: e }),
				onReset: at ? () => {
					j({
						view: null,
						sort: null,
						columns: null,
						calendarDate: "published"
					}), u({
						page: null,
						month: null
					});
				} : void 0,
				children: rt && H !== "calendar" && /* @__PURE__ */ B("span", {
					className: "inline-flex h-6 items-center gap-1 rounded-sm bg-sunken pl-2 pr-0.5 text-xs text-muted",
					title: d("Sorted by {column}", { column: rt.label }),
					children: [
						/* @__PURE__ */ z(E, {
							name: R.startsWith("-") ? "arrow-down" : "arrow-up",
							size: 11
						}),
						/* @__PURE__ */ z("span", {
							className: "max-w-32 truncate",
							children: rt.label
						}),
						Ce ? /* @__PURE__ */ z(x, {
							size: "xs",
							variant: "ghost",
							icon: "list-tree",
							className: "ml-1 h-5 px-1.5",
							onClick: () => Xe(null),
							children: d("Show Tree")
						}) : /* @__PURE__ */ z(re, {
							icon: "close",
							label: d("Reset Sort"),
							size: "xs",
							className: "size-5",
							onClick: () => Xe(null)
						})
					]
				})
			})]
		}),
		Ne && H !== "calendar" && /* @__PURE__ */ z(ce, {
			message: `${d("Couldn’t load entries.")} ${Ne.message}`,
			onRetry: Pe
		}),
		de.length > 0 && /* @__PURE__ */ B("div", {
			role: "alert",
			className: "border-y border-warning/30 px-3 py-3 text-sm text-muted",
			children: [/* @__PURE__ */ z("p", {
				className: "m-0",
				children: d("Failed entries remain selected. Retry the action for these entries.")
			}), /* @__PURE__ */ z("ul", {
				className: "mb-0 mt-2 space-y-1 pl-4",
				children: de.map((e) => /* @__PURE__ */ B("li", { children: [
					/* @__PURE__ */ z("span", {
						className: "font-medium text-text",
						children: e.title
					}),
					": ",
					e.message
				] }, e.id))
			})]
		}),
		H === "calendar" ? /* @__PURE__ */ z(Re, {
			onItems: ge,
			handle: r,
			filters: {
				locale: D,
				status: w,
				search: S || void 0
			},
			dateField: A.calendarDate,
			selection: {
				ids: M,
				onSelect: $
			},
			cursor: Ye
		}) : ut ? Te ? /* @__PURE__ */ z(ie, { onClear: nt }) : /* @__PURE__ */ z(te, {
			icon: c.icon,
			title: d("No {items} yet", { items: c.title.toLowerCase() })
		}) : H === "grid" ? /* @__PURE__ */ z(Je, {
			handle: r,
			items: X,
			ctx: qe,
			media: W && I.has(`field:${W.handle}`) ? W : void 0,
			excerpt: G && I.has(`field:${G.handle}`) ? G : void 0,
			columns: Q,
			visible: I,
			icon: c.icon,
			loading: Me || y,
			stale: Z,
			selected: M,
			onSelect: $,
			cursor: Ye
		}) : /* @__PURE__ */ z(ke, {
			handle: r,
			columns: Q,
			ctx: qe,
			items: J,
			urls: lt.flatMap((e) => e.pages.map((e) => e.path ?? "")),
			tree: U,
			loading: Me || y,
			stale: Z,
			selected: M,
			onSelect: $,
			sort: Oe,
			onSort: Ze,
			cursor: Ye
		}),
		lt.length > 0 && H === "table" && /* @__PURE__ */ z(Fe, {
			groups: lt,
			columns: Q,
			nested: U && je(J),
			tree: U,
			urls: [...Y(J).map((e) => e.uri ?? ""), ...lt.flatMap((e) => e.pages.map((e) => e.path ?? ""))]
		}),
		!U && H !== "calendar" && K.data && /* @__PURE__ */ z(se, {
			page: K.data.page,
			pages: K.data.pages,
			total: K.data.total,
			perPage: K.data.perPage ?? 50,
			onPage: (e) => u({ page: e > 1 ? e : null })
		}),
		/* @__PURE__ */ B(le, {
			count: M.size,
			onClear: () => N(/* @__PURE__ */ new Set()),
			children: [
				O.publish && st && /* @__PURE__ */ z(x, {
					size: "sm",
					variant: "ghost",
					disabled: P || Z,
					onClick: () => Qe("entries/publish"),
					children: d("Publish")
				}),
				O.publish && ct && /* @__PURE__ */ z(x, {
					size: "sm",
					variant: "ghost",
					disabled: P || Z,
					onClick: () => Qe("entries/unpublish"),
					children: d("Unpublish")
				}),
				O.delete && /* @__PURE__ */ z(x, {
					size: "sm",
					variant: "ghost",
					disabled: P || Z,
					onClick: () => Qe("entries/delete"),
					children: d("Delete")
				})
			]
		})
	] });
}
function it() {
	return {
		id: "title",
		label: d("Title"),
		width: 0,
		sort: "title",
		render: () => null
	};
}
export { rt as default, et as languageName, nt as loadEntriesList };
