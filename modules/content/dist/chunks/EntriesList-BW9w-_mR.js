import { t as e } from "./useCollection-DPy1gAYR.js";
import { Link as t, batch as n, getManifest as r, invalidate as i, locale as a, navigate as o, plural as s, prefetchAbility as c, run as l, setQuery as u, t as d, useAbility as f, useAction as p, useLocation as m, useManifest as h } from "@letterncms/sdk";
import { useEffect as g, useMemo as _, useState as v } from "react";
import { Avatar as y, AvatarStack as b, Button as x, Checkbox as S, DataCalendar as C, DataCard as ee, DataGrid as te, DateCell as w, EmptyState as ne, Fields as re, Icon as T, IconButton as ie, Menu as E, NoMatches as ae, NotFoundState as oe, OverviewControls as se, Page as ce, PagePagination as le, QueryError as ue, SelectionBar as de, Skeleton as D, StatusDot as O, TableFrame as k, TableHeader as A, TableMeta as j, TableRow as M, calendarRange as N, cn as P, confirm as fe, copyText as pe, entryActionAvailability as me, entryFieldColumns as he, loadOverviewSource as ge, nextTableSort as _e, readViewPrefs as ve, recordDateColumns as ye, rowActionsClass as F, standardEntryColumns as be, toast as I, useOverviewSource as xe, useRecordNavigation as Se, useShortcut as Ce, useViewPrefs as L } from "@letterncms/ui";
import { Fragment as R, jsx as z, jsxs as B } from "react/jsx-runtime";
import { DndContext as we, PointerSensor as V, closestCenter as Te, useSensor as H, useSensors as Ee } from "@dnd-kit/core";
import { SortableContext as De, arrayMove as Oe, useSortable as ke, verticalListSortingStrategy as U } from "@dnd-kit/sortable";
import { CSS as Ae } from "@dnd-kit/utilities";
// admin/src/EntryActions.tsx
function W({ item: e, handle: t, className: n }) {
	let r = h().collections.find((e) => e.handle === t)?.can, a = me(r, e), s = p("entries/duplicate", {
		invalidates: ["entries/", "content/"],
		onSuccess: (e) => o(`/content/${t}/${e.id}`),
		onError: I.error
	}), c = !!e.uri && e.displayStatus !== "draft" && e.displayStatus !== "scheduled", u = (t, n) => l(t, {
		id: e.id,
		expectedVersion: e.version
	}).then(() => {
		I.success(n), i("entries/", "content/");
	}, I.error);
	return /* @__PURE__ */ B("div", {
		className: P("flex items-center gap-0.5 has-[[data-popup-open]]:opacity-100", n),
		children: [c && /* @__PURE__ */ z(ie, {
			icon: "external",
			label: d("View on Site"),
			size: "xs",
			onClick: () => window.open(e.uri, "_blank", "noopener")
		}), /* @__PURE__ */ z(E, {
			trigger: /* @__PURE__ */ z(ie, {
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
					onSelect: () => void pe(new URL(e.uri, window.location.origin).href, {
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
						await fe({
							title: d("Delete “{title}”?", { title: e.title }),
							description: d("This cannot be undone."),
							confirm: d("Delete"),
							danger: !0
						}) && l("entries/delete", {
							id: e.id,
							expectedVersion: e.version
						}).then(() => {
							I.success(d("Deleted")), i("entries/", "content/");
						}, I.error);
					}
				} : null
			]
		})]
	});
}
// admin/src/EntriesTable.tsx
var je = 20;
function Me({ handle: e, columns: t, ctx: n, items: r, tree: i, loading: a, stale: o, selected: s, onSelect: c, sort: l, onSort: u, cursor: f, urls: p = [] }) {
	let m = !!i && Pe(r), h = G(t, [...q(r).map((e) => e.uri ?? ""), ...p], m, !!i), g = {
		id: "title",
		label: d("Title"),
		width: 0,
		sort: "title",
		render: () => null
	}, _ = q(r).map((e) => e.id), v = _.filter((e) => s.has(e)).length;
	return /* @__PURE__ */ B(k, {
		template: h,
		label: d("Entries"),
		busy: a || o,
		children: [/* @__PURE__ */ B(M, {
			header: !0,
			className: "relative",
			children: [
				/* @__PURE__ */ z("div", {
					role: "columnheader",
					className: K,
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
				/* @__PURE__ */ z(J, {
					column: g,
					sort: l,
					onSort: u
				}),
				t.map((e) => /* @__PURE__ */ z(J, {
					column: e,
					sort: l,
					onSort: u
				}, e.id)),
				/* @__PURE__ */ z(A, {
					label: d("Actions"),
					hiddenLabel: !0
				})
			]
		}), a ? /* @__PURE__ */ z(Y, {
			columns: t,
			tree: m
		}) : /* @__PURE__ */ z("div", {
			className: P("transition-opacity duration-180", o && "opacity-60"),
			children: i ? /* @__PURE__ */ z(Z, {
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
			}) : r.map((r) => /* @__PURE__ */ z(X, {
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
var Ne = (e) => `minmax(120px,${Math.min(360, Math.max(120, Math.ceil(Math.max(0, ...e.map((e) => e.length)) * 7.3) + 8))}px)`;
function G(e, t = [], n = !1, r = n) {
	return [
		...n ? ["0px"] : [],
		"minmax(200px,1fr)",
		...e.map((e) => e.id === "uri" ? Ne(t) : typeof e.width == "number" ? `${e.width}px` : e.width),
		r ? "76px" : "52px"
	].join(" ");
}
var K = "relative z-10 flex items-center max-sm:w-4 max-sm:shrink-0 sm:absolute sm:right-full sm:top-1/2 sm:-translate-y-1/2 md:mr-1 [&_label]:gap-0", Pe = (e) => e.some((e) => (e.children?.length ?? 0) > 0);
function q(e) {
	return e.flatMap((e) => [e, ...q(e.children ?? [])]);
}
function J({ column: e, sort: t, onSort: n }) {
	let r = t?.field === e.sort;
	return /* @__PURE__ */ z(A, {
		label: e.label,
		align: e.align,
		direction: r ? t.desc ? "descending" : "ascending" : void 0,
		onSort: e.sort ? () => n(e) : void 0
	});
}
function Y({ columns: e, tree: t }) {
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
		].map((n, r) => /* @__PURE__ */ B(M, {
			className: "max-sm:[&>*:nth-child(n+3)]:hidden",
			children: [
				t && /* @__PURE__ */ z("span", {}),
				/* @__PURE__ */ z("div", {
					style: { width: n },
					className: "max-sm:flex-1",
					children: /* @__PURE__ */ z(D, { className: "h-3" })
				}),
				e.map((e) => /* @__PURE__ */ z(D, { className: "h-3 w-3/5" }, e.id)),
				/* @__PURE__ */ z("span", {})
			]
		}, r))
	});
}
function X({ item: e, handle: n, columns: r, ctx: i, selected: a, onSelect: o, active: s, depth: c = 0, expander: l, dragHandle: u, tree: f }) {
	return /* @__PURE__ */ B(M, {
		recordId: e.id,
		selected: a,
		active: s,
		children: [
			/* @__PURE__ */ z("div", {
				role: "cell",
				"data-row-check": "",
				className: K,
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
				style: c ? { paddingLeft: c * je } : void 0,
				children: [l, /* @__PURE__ */ z(t, {
					to: `/content/${n}/${e.id}`,
					className: "min-w-0 truncate text-sm font-medium text-text no-underline outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-focus",
					children: e.title || /* @__PURE__ */ z("span", {
						className: "text-faint",
						children: d("Untitled")
					})
				})]
			}),
			/* @__PURE__ */ z(j, { children: r.map((t) => /* @__PURE__ */ z("div", {
				role: "cell",
				"data-align": t.align,
				className: P("flex min-w-0 items-center", t.align === "end" && "justify-end"),
				children: t.render(e, i)
			}, t.id)) }),
			/* @__PURE__ */ B("div", {
				role: "cell",
				"data-table-actions": !0,
				className: F,
				children: [u, /* @__PURE__ */ z(W, {
					item: e,
					handle: n
				})]
			})
		]
	});
}
function Z(e) {
	let [t, n] = v({}), r = e.collapsed ?? t, a = e.setCollapsed ?? n, { handle: o, nodes: s, parentId: c, depth: u } = e, f = h().collections.find((e) => e.handle === o)?.can, p = s.every((e) => me(f, e).move), [m, g] = v(null), _ = m ?? s, y = Ee(H(V, { activationConstraint: { distance: 4 } }));
	return /* @__PURE__ */ z(we, {
		sensors: y,
		collisionDetection: Te,
		onDragEnd: async (e) => {
			if (!p || !e.over || e.active.id === e.over.id) return;
			let t = _.map((e) => e.id), n = Oe(_, t.indexOf(String(e.active.id)), t.indexOf(String(e.over.id)));
			g(n);
			try {
				await l("entries/reorder", {
					collection: o,
					ids: n.map((e) => e.id),
					parentId: c,
					versions: Object.fromEntries(n.map((e) => [e.id, e.version]))
				}), i("entries/");
			} catch (e) {
				I.error(e);
			} finally {
				g(null);
			}
		},
		children: /* @__PURE__ */ z(De, {
			items: _.map((e) => e.id),
			strategy: U,
			children: _.map((t) => {
				let n = t.children ?? [], i = !r[t.id];
				return /* @__PURE__ */ z(Fe, {
					id: t.id,
					disabled: !p,
					children: (s) => /* @__PURE__ */ B(R, { children: [/* @__PURE__ */ z(X, {
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
							children: /* @__PURE__ */ z(T, {
								name: "chevron-right",
								size: 12,
								className: P("transition-transform duration-120", i && "rotate-90")
							})
						})
					}), n.length > 0 && i && /* @__PURE__ */ z(Z, {
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
function Fe({ id: e, children: t, disabled: n }) {
	let { attributes: r, listeners: i, setNodeRef: a, transform: o, transition: s, isDragging: c } = ke({
		id: e,
		disabled: n
	}), l = /* @__PURE__ */ z("button", {
		type: "button",
		...r,
		...i,
		className: "grid size-6 cursor-grab place-items-center rounded-xs text-faint transition-colors duration-120 hover:bg-hover hover:text-text active:cursor-grabbing max-sm:hidden",
		"aria-label": d("Drag to Reorder"),
		children: /* @__PURE__ */ z(T, {
			name: "drag",
			size: 14
		})
	});
	return /* @__PURE__ */ z("div", {
		ref: a,
		style: {
			transform: Ae.Transform.toString(o),
			transition: s
		},
		className: P(c && "relative z-20 bg-bg shadow-pop"),
		children: t(n ? null : l)
	});
}
// admin/src/BuiltinPages.tsx
function Ie({ groups: e, columns: n, urls: r, nested: a, tree: s }) {
	let [c, u] = v(null), f = G(n, r, a, s), p = async (e, t) => {
		u(`${e.id}/${t.handle}`);
		try {
			let { id: n } = await l("pages/customise", {
				group: e.id,
				handle: t.handle
			});
			i("pages/builtin", "entries/"), o(`/content/${e.collection}/${n}`);
		} catch (e) {
			I.error(e);
		} finally {
			u(null);
		}
	}, m = (e, t) => t.id === "uri" ? e.path ? /* @__PURE__ */ z("span", {
		className: "block truncate font-mono text-xs text-faint",
		children: e.path
	}) : /* @__PURE__ */ z("span", {
		className: "block truncate text-xs text-faint",
		children: d("Shown inside other pages")
	}) : t.id === "status" ? e.status === "conflict" ? /* @__PURE__ */ z(O, {
		status: "warning",
		label: d("A page has this address"),
		className: "whitespace-nowrap"
	}) : e.status === "draft" ? /* @__PURE__ */ z(O, { status: "draft" }) : e.status === "customised" ? /* @__PURE__ */ z(O, { status: "published" }) : /* @__PURE__ */ z(O, {
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
			}), /* @__PURE__ */ z(k, {
				template: f,
				label: e.label,
				children: e.pages.map((r) => {
					let i = `${e.id}/${r.handle}`;
					return /* @__PURE__ */ B(M, {
						className: P(c === i && "opacity-60"),
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
							/* @__PURE__ */ z(j, { children: n.map((e) => /* @__PURE__ */ z("div", {
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
var Le = (e) => e.toISOString().slice(0, 19).replace("T", " ");
function Re(e, t, n, r = "published") {
	let i = N(n), a = r === "published" ? "published_at" : "updated_at";
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
				value: Le(i.start)
			}, {
				field: a,
				operator: "<",
				value: Le(i.end)
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
function ze({ handle: e, filters: t, dateField: n, selection: r, cursor: i, onItems: a }) {
	let { query: o } = m(), { dated: s, undated: c } = Re(e, t, o.month, n), l = xe({
		ability: "entries/list",
		input: s,
		perPage: 200
	}, !0), f = xe({
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
			children: [/* @__PURE__ */ z(O, {
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
function Be(e, t, n) {
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
		render: (e) => /* @__PURE__ */ z(O, { status: e.displayStatus })
	});
	for (let e of he(t?.resolvedFields ?? t?.fields ?? [])) {
		let t = e.field;
		r.push({
			...e,
			render: (e, n) => /* @__PURE__ */ z(Je, {
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
		render: (e, t) => /* @__PURE__ */ z(Ke, {
			item: e,
			locales: t.locales
		})
	}), r.push({
		id: "author",
		label: d("Author"),
		width: 132,
		sort: "author_id",
		render: (e) => e.author ? /* @__PURE__ */ z(Ge, { person: e.author }) : /* @__PURE__ */ z("span", {
			className: "text-xs text-faint",
			children: e.authorId ? d("Unavailable person") : d("Unassigned")
		})
	}), r.push(...ye((e) => e, {
		published: "published_at",
		updated: "updated_at"
	}).map((e) => ({
		...e,
		width: e.width
	}))), r;
}
function Ve(e, t, n = "table") {
	return t?.default_columns ?? be(e.routable, t?.listing, n, t?.resolvedFields ?? t?.fields);
}
function He(e) {
	return (e?.resolvedFields ?? e?.fields ?? []).filter((e) => e.type === "media");
}
function Ue(e) {
	return (e?.resolvedFields ?? e?.fields ?? []).find((e) => e.type === "textarea" || e.type === "text" && !["title", "slug"].includes(e.handle));
}
function We(e) {
	return (Array.isArray(e) ? e : typeof e == "string" && e ? [e] : []).filter((e) => typeof e == "string" && e !== "");
}
function Q(e, t) {
	let n = t.media.get(e.toLowerCase());
	return n ? n.thumb ?? (n.kind === "image" ? n.url : null) : e.startsWith("/") || e.startsWith("http") ? e : null;
}
function Ge({ person: e }) {
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
function Ke({ item: e, locales: t }) {
	let n = new Set(e.translations ?? [e.locale]);
	return /* @__PURE__ */ z("span", {
		className: "flex items-center gap-1",
		children: t.map((e) => /* @__PURE__ */ z("span", {
			title: n.has(e) ? void 0 : d("Not translated"),
			className: P("inline-flex h-4.5 w-[22px] items-center justify-center rounded-xs font-mono text-[10px] uppercase", n.has(e) ? "bg-sunken text-text" : "text-faint/70"),
			children: e
		}, e))
	});
}
function qe(e, t) {
	let n = e.options;
	if (n && !Array.isArray(n) && typeof n == "object") return n[String(t)] ?? String(t);
	if (Array.isArray(n)) {
		let e = n.find((e) => String(typeof e == "object" ? e.value : e) === String(t));
		if (e && typeof e == "object") return e.label ?? String(t);
	}
	return String(t);
}
function Je({ field: e, value: t, ctx: n }) {
	if (t == null || t === "" || Array.isArray(t) && t.length === 0) return null;
	switch (e.type) {
		case "toggle": return t ? /* @__PURE__ */ z(T, {
			name: "check",
			size: 14,
			className: "text-text",
			"aria-label": d("Yes")
		}) : null;
		case "number": return /* @__PURE__ */ z("span", {
			className: "block truncate text-right text-xs tabular-nums text-text",
			children: Number(t).toLocaleString(a())
		});
		case "date": return /* @__PURE__ */ z(w, { iso: String(t) });
		case "select": {
			let n = (Array.isArray(t) ? t : [t]).map((t) => qe(e, t));
			return /* @__PURE__ */ z("span", {
				className: "block truncate text-xs text-text",
				children: n.join(", ")
			});
		}
		case "tags": return /* @__PURE__ */ z(Ye, { labels: (Array.isArray(t) ? t : [t]).map(String) });
		case "entries": return /* @__PURE__ */ z(Ye, { labels: t.map((e) => e.title) });
		case "users": {
			let e = t;
			return e.length === 1 ? /* @__PURE__ */ z(Ge, { person: e[0] }) : /* @__PURE__ */ z(b, {
				people: e,
				size: 18,
				max: 3
			});
		}
		case "media": {
			let e = We(t), r = Q(e[0], n);
			return /* @__PURE__ */ B("span", {
				className: "flex items-center gap-1",
				children: [/* @__PURE__ */ z("span", {
					className: "grid size-6 shrink-0 place-items-center overflow-hidden rounded-xs border border-border bg-sunken text-faint",
					children: r ? /* @__PURE__ */ z("img", {
						src: r,
						alt: "",
						loading: "lazy",
						className: "size-full object-cover"
					}) : /* @__PURE__ */ z(T, {
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
			className: P("block truncate text-xs", e.type === "textarea" ? "text-muted" : "text-text"),
			children: typeof t == "object" ? JSON.stringify(t) : String(t)
		});
	}
}
function Ye({ labels: e }) {
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
function Xe({ handle: e, items: t, ctx: n, media: r, excerpt: i, columns: a, visible: o, icon: s, loading: c, stale: l, selected: u, onSelect: d, cursor: f }) {
	return /* @__PURE__ */ z(te, {
		loading: c,
		stale: l,
		media: !!r,
		children: t.map((t) => /* @__PURE__ */ z(Ze, {
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
function Ze({ item: e, handle: t, ctx: n, media: r, excerpt: i, columns: a, visible: o, icon: s, selected: c, onSelect: l, active: u }) {
	let f = r ? We(e.values?.[r.handle]) : [], p = f[0] ? Q(f[0], n) : null, m = !r && i && !a.some((e) => e.field?.handle === i.handle) ? Qe(e.values?.[i.handle]) : "", h = a.filter((e) => e.id === "translations" || e.field && e.field.handle !== r?.handle), g = o.has("published") && e.publishedAt ? {
		label: d("Published"),
		iso: e.publishedAt,
		relative: !1
	} : o.has("updated") && e.updatedAt ? {
		label: d("Updated"),
		iso: e.updatedAt,
		relative: !0
	} : null;
	return /* @__PURE__ */ B(ee, {
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
		actions: /* @__PURE__ */ z(W, {
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
			children: /* @__PURE__ */ z(T, {
				name: "image",
				size: 20
			})
		}) : void 0,
		footer: /* @__PURE__ */ B(R, { children: [o.has("status") && /* @__PURE__ */ z(O, { status: e.displayStatus }), /* @__PURE__ */ B("span", {
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
				children: [g.label, /* @__PURE__ */ z(w, {
					iso: g.iso,
					relative: g.relative
				})]
			})]
		})] }),
		children: [
			o.has("uri") && e.uri && /* @__PURE__ */ z("span", {
				className: P("mt-0.5 truncate font-mono text-2xs text-faint", !r && "pl-[22px]"),
				children: e.uri
			}),
			m && /* @__PURE__ */ z("p", {
				className: "m-0 mt-1.5 line-clamp-3 pl-[22px] text-xs leading-relaxed text-muted",
				children: m
			}),
			h.length > 0 && /* @__PURE__ */ z("dl", {
				className: P("m-0 mt-2 space-y-1.5", !r && "pl-[22px]"),
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
function Qe(e) {
	return typeof e == "string" ? e.replace(/<[^>]+>/g, " ").replace(/[#>*_`~[\]()!-]+/g, " ").replace(/\s+/g, " ").trim() : "";
}
// admin/src/listPrefs.ts
var $ = (e) => r().collections.find((t) => t.handle === e)?.defaultView ?? "table";
function $e(e, t = $(e)) {
	return ve(`entries.${e}`, t);
}
function et(e, t = $(e)) {
	return L(`entries.${e}`, t);
}
// admin/src/EntriesList.tsx
function tt(e) {
	try {
		let t = new Intl.DisplayNames([e], { type: "language" }).of(e) ?? e;
		return t.charAt(0).toLocaleUpperCase(e) + t.slice(1);
	} catch {
		return e;
	}
}
function nt(e, t, n, r, i) {
	let a = e.collections.find((e) => e.handle === t), o = e.site.locales, s = o.includes(i.locale ?? "") ? i.locale : e.site.defaultLocale, c = i.q ?? "", l = i.status ?? "any", u = Number(i.page ?? 1), d = a?.structure === "tree", f = a?.structure === "dated", p = [
		"table",
		...He(n).length > 0 || a?.defaultView === "grid" ? ["grid"] : [],
		...f || a?.defaultView === "calendar" ? ["calendar"] : []
	], m = p.includes(r.view) ? r.view : "table", h = a ? Be(a, n, o) : [], g = new Set(r.columns ?? (a ? Ve(a, n, m) : [])), _ = h.filter((e) => g.has(e.id)), v = [ot(), ...h.filter((e) => e.sort)], y = r.sort && v.some((e) => e.sort === r.sort.replace(/^-/, "")) ? r.sort : null, b = d ? null : n?.sort ?? (f ? "-published_at" : "title"), x = !!c || l !== "any", S = d && !y && !x && m !== "calendar", C = [...new Set(_.filter((e) => e.field).map((e) => e.field.handle))].sort();
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
async function rt(e, t) {
	let n = r();
	if (!n.collections.some((t) => t.handle === e)) return;
	let i = nt(n, e, await c("collections/get", { handle: e }), $e(e), t);
	if (i.view === "calendar") {
		let { dated: n, undated: r } = Re(e, {
			locale: i.locale,
			status: t.status ?? "any",
			search: t.q || void 0
		}, t.month, $e(e).calendarDate);
		await Promise.all([ge({
			ability: "entries/list",
			input: n,
			perPage: 200
		}), ge({
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
function it({ params: t }) {
	let r = t.collection, a = h(), { summary: c, collection: l, error: p, isLoading: y } = e(r), { query: b } = m(), [S, C] = v(b.q ?? ""), ee = b.status ?? "any", te = Number(b.page ?? 1), w = a.site.locales, E = w.includes(b.locale ?? "") ? b.locale : a.site.defaultLocale, D = me(c?.can), O = `/content/${r}/new${E === a.site.defaultLocale ? "" : `?locale=${E}`}`, [k, A] = et(r), [j, M] = v(/* @__PURE__ */ new Set()), [N, P] = v(!1), [pe, he] = v([]), [ge, ve] = v([]), { all: ye, shown: F, columns: be, sortable: xe, sortKey: L, ownSort: R, isTree: we, view: V, views: Te, showTree: H, filtered: Ee, fields: De, input: Oe } = _(() => nt(a, r, l, k, {
		...b,
		q: S
	}), [
		a,
		r,
		l,
		k,
		b,
		S
	]), ke = L ? {
		field: L.replace(/^-/, ""),
		desc: L.startsWith("-")
	} : R ? {
		field: R.replace(/^-/, ""),
		desc: R.startsWith("-"),
		implicit: !0
	} : null, U = He(l)[0], Ae = Ue(l), W = f("entries/list", Oe, {
		enabled: !!c && !H && V !== "calendar",
		placeholderData: (e) => e
	}), je = f("entries/list", {
		...Oe,
		page: 1,
		perPage: 1,
		fields: []
	}, {
		enabled: !!c && V === "calendar",
		placeholderData: (e) => e
	}), Ne = f("pages/builtin", {}, { enabled: r === "pages" }), G = f("entries/tree", {
		collection: r,
		locale: E,
		fields: De
	}, {
		enabled: !!c && H,
		placeholderData: (e) => e
	}), K = H ? G.data ?? [] : W.data?.items ?? [], J = H ? q(K) : K, Y = H ? G.isLoading : W.isLoading, X = H ? G.isPlaceholderData : W.isPlaceholderData, Z = p ?? (H ? G.error : W.error), Fe = () => {
		p && i("collections/get"), H ? G.refetch() : W.refetch();
	}, Le = {
		published: J.some((e) => !!e.publishedAt),
		updated: J.some((e) => !!e.updatedAt)
	}, Re = (e) => Y || !(e.id in Le) || Le[e.id], Be = ye.filter(Re), Q = be.filter(Re), Ge = V === "calendar" ? je.data?.total ?? null : Y ? null : H ? J.length : W.data?.total ?? 0, Ke = [...Q.filter((e) => e.field?.type === "media").map((e) => e.field.handle), ...V === "grid" && U ? [U.handle] : []], qe = [...new Set(J.flatMap((e) => Ke.flatMap((t) => We(e.values?.[t]))))].filter((e) => /^[0-9a-z]{26}$/i.test(e)), Je = f("media/lookup", { ids: qe }, {
		enabled: qe.length > 0 && a.fieldTypes.some((e) => e.key === "media"),
		staleTime: 3e5,
		placeholderData: (e) => e
	}), Ye = _(() => ({
		media: new Map((Je.data?.items ?? []).map((e) => [e.id.toLowerCase(), e])),
		locales: w
	}), [Je.data, w]);
	g(() => C(b.q ?? ""), [r]), g(() => {
		M(/* @__PURE__ */ new Set()), he([]);
	}, [
		r,
		te,
		ee,
		S,
		E,
		L
	]);
	let Ze = (e, t) => M((n) => {
		let r = new Set(n);
		for (let n of e) t ? r.add(n) : r.delete(n);
		return r;
	});
	Ce("c", () => D.create && o(O));
	let Qe = Se({
		resetKey: `${r}:${te}:${ee}:${S}:${E}:${L}`,
		selection: {
			ids: j,
			onSelect: Ze
		},
		onOpen: (e) => o(`/content/${r}/${e}`)
	});
	if (!c) return /* @__PURE__ */ z(ce, {
		crumbs: [{ label: d("Not Found") }],
		children: /* @__PURE__ */ z(oe, {
			icon: "collection",
			action: /* @__PURE__ */ z(x, {
				onClick: () => o("/"),
				children: d("Go Home")
			})
		})
	});
	let $ = (e) => {
		A({ sort: e }), u({ page: null });
	}, $e = (e) => $(_e(e.sort, L, e.descFirst, R)), rt = async (e) => {
		if (N || X || !j.size || (e === "entries/delete" ? !D.delete : !D.publish)) return;
		let t = [...j], r = V === "calendar" ? ge : J;
		if (t.some((e) => !r.some((t) => t.id === e))) {
			I.error(d("The selection changed. Refresh and select the entries again."));
			return;
		}
		let a = t.length;
		if ((e !== "entries/delete" || await fe({
			title: s(a, "Delete {count} entry?", "Delete {count} entries?"),
			description: d("This cannot be undone."),
			confirm: d("Delete"),
			danger: !0
		})) && !N) {
			P(!0), he([]);
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
				o.length ? I.error(d("{failed} of {total} failed.", {
					failed: o.length,
					total: a
				})) : e === "entries/publish" ? I.success(s(a, "Published {count} entry", "Published {count} entries")) : e === "entries/unpublish" ? I.success(s(a, "Unpublished {count} entry", "Unpublished {count} entries")) : I.success(s(a, "Deleted {count} entry", "Deleted {count} entries")), he(o), M(new Set(o.map((e) => e.id))), i("entries/", "content/");
			} catch (e) {
				I.error(e);
			} finally {
				P(!1);
			}
		}
	}, it = () => {
		C(""), u({
			q: null,
			status: null,
			page: null
		});
	}, ot = L ? xe.find((e) => e.sort === L.replace(/^-/, "")) : void 0, st = Ve(c, l, V), ct = V !== (c.defaultView ?? "table") || !!L || k.calendarDate !== "published" || !!b.month || Be.some((e) => F.has(e.id) !== st.includes(e.id)), lt = (V === "calendar" ? ge : J).filter((e) => j.has(e.id)), ut = lt.some((e) => e.displayStatus === "draft" || e.displayStatus === "changed"), dt = lt.some((e) => e.displayStatus !== "draft"), ft = r === "pages" && V !== "calendar" && !Ee ? (Ne.data ?? []).filter((e) => e.pages.length > 0) : [], pt = !Y && !y && !Z && J.length === 0, mt = D.create && /* @__PURE__ */ z(x, {
		variant: "primary",
		icon: "plus",
		onClick: () => o(O),
		title: d("New (C)"),
		children: c.newLabel
	});
	return /* @__PURE__ */ B(ce, {
		width: "wide",
		crumbs: [{
			label: /* @__PURE__ */ z(at, {
				title: c.title,
				count: Ge
			}),
			icon: c.icon
		}],
		actions: mt,
		children: [
			/* @__PURE__ */ B("div", {
				className: "mb-3 flex flex-wrap items-center gap-x-2 gap-y-2",
				children: [/* @__PURE__ */ z(re, {
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
						...w.length > 1 ? [{
							handle: "locale",
							type: "select",
							label: d("Language"),
							display: "segmented",
							required: !0,
							className: "shrink-0",
							options: w.map((e) => ({
								value: e,
								label: e.toUpperCase(),
								title: tt(e)
							}))
						}] : []
					],
					values: {
						q: S,
						status: ee,
						locale: E
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
				}), /* @__PURE__ */ z(se, {
					view: V,
					views: Te,
					all: Be,
					shown: F,
					sortable: xe,
					sortKey: L,
					implicitSort: R,
					isTree: we,
					onColumns: (e) => A({ columns: e }),
					onSort: $,
					onView: (e) => A({ view: e }),
					calendarDate: k.calendarDate,
					onCalendarDate: (e) => A({ calendarDate: e }),
					onReset: ct ? () => {
						A({
							view: null,
							sort: null,
							columns: null,
							calendarDate: "published"
						}), u({
							page: null,
							month: null
						});
					} : void 0,
					children: ot && V !== "calendar" && /* @__PURE__ */ B("span", {
						className: "inline-flex h-6 items-center gap-1 rounded-sm bg-sunken pl-2 pr-0.5 text-xs text-muted",
						title: d("Sorted by {column}", { column: ot.label }),
						children: [
							/* @__PURE__ */ z(T, {
								name: L.startsWith("-") ? "arrow-down" : "arrow-up",
								size: 11
							}),
							/* @__PURE__ */ z("span", {
								className: "max-w-32 truncate",
								children: ot.label
							}),
							we ? /* @__PURE__ */ z(x, {
								size: "xs",
								variant: "ghost",
								icon: "list-tree",
								className: "ml-1 h-5 px-1.5",
								onClick: () => $(null),
								children: d("Show Tree")
							}) : /* @__PURE__ */ z(ie, {
								icon: "close",
								label: d("Reset Sort"),
								size: "xs",
								className: "size-5",
								onClick: () => $(null)
							})
						]
					})
				})]
			}),
			Z && V !== "calendar" && /* @__PURE__ */ z(ue, {
				message: `${d("Couldn’t load entries.")} ${Z.message}`,
				onRetry: Fe
			}),
			pe.length > 0 && /* @__PURE__ */ B("div", {
				role: "alert",
				className: "border-y border-warning/30 px-3 py-3 text-sm text-muted",
				children: [/* @__PURE__ */ z("p", {
					className: "m-0",
					children: d("Failed entries remain selected. Retry the action for these entries.")
				}), /* @__PURE__ */ z("ul", {
					className: "mb-0 mt-2 space-y-1 pl-4",
					children: pe.map((e) => /* @__PURE__ */ B("li", { children: [
						/* @__PURE__ */ z("span", {
							className: "font-medium text-text",
							children: e.title
						}),
						": ",
						e.message
					] }, e.id))
				})]
			}),
			V === "calendar" ? /* @__PURE__ */ z(ze, {
				onItems: ve,
				handle: r,
				filters: {
					locale: E,
					status: ee,
					search: S || void 0
				},
				dateField: k.calendarDate,
				selection: {
					ids: j,
					onSelect: Ze
				},
				cursor: Qe
			}) : pt ? Ee ? /* @__PURE__ */ z(ae, { onClear: it }) : /* @__PURE__ */ z(ne, {
				icon: c.icon,
				title: d("No {items} yet", { items: c.title.toLowerCase() })
			}) : V === "grid" ? /* @__PURE__ */ z(Xe, {
				handle: r,
				items: J,
				ctx: Ye,
				media: U && F.has(`field:${U.handle}`) ? U : void 0,
				excerpt: Ae && F.has(`field:${Ae.handle}`) ? Ae : void 0,
				columns: Q,
				visible: F,
				icon: c.icon,
				loading: Y || y,
				stale: X,
				selected: j,
				onSelect: Ze,
				cursor: Qe
			}) : /* @__PURE__ */ z(Me, {
				handle: r,
				columns: Q,
				ctx: Ye,
				items: K,
				urls: ft.flatMap((e) => e.pages.map((e) => e.path ?? "")),
				tree: H,
				loading: Y || y,
				stale: X,
				selected: j,
				onSelect: Ze,
				sort: ke,
				onSort: $e,
				cursor: Qe
			}),
			ft.length > 0 && V === "table" && /* @__PURE__ */ z(Ie, {
				groups: ft,
				columns: Q,
				nested: H && Pe(K),
				tree: H,
				urls: [...q(K).map((e) => e.uri ?? ""), ...ft.flatMap((e) => e.pages.map((e) => e.path ?? ""))]
			}),
			!H && V !== "calendar" && W.data && /* @__PURE__ */ z(le, {
				page: W.data.page,
				pages: W.data.pages,
				total: W.data.total,
				perPage: W.data.perPage ?? 50,
				onPage: (e) => u({ page: e > 1 ? e : null })
			}),
			/* @__PURE__ */ B(de, {
				count: j.size,
				onClear: () => M(/* @__PURE__ */ new Set()),
				children: [
					D.publish && ut && /* @__PURE__ */ z(x, {
						size: "sm",
						variant: "ghost",
						disabled: N || X,
						onClick: () => rt("entries/publish"),
						children: d("Publish")
					}),
					D.publish && dt && /* @__PURE__ */ z(x, {
						size: "sm",
						variant: "ghost",
						disabled: N || X,
						onClick: () => rt("entries/unpublish"),
						children: d("Unpublish")
					}),
					D.delete && /* @__PURE__ */ z(x, {
						size: "sm",
						variant: "ghost",
						disabled: N || X,
						onClick: () => rt("entries/delete"),
						children: d("Delete")
					})
				]
			})
		]
	});
}
function at({ title: e, count: t }) {
	return /* @__PURE__ */ B(R, { children: [e, t !== null && /* @__PURE__ */ z("span", {
		className: "ml-2 font-normal tabular-nums text-faint",
		title: s(t, "{count} entry", "{count} entries"),
		children: t.toLocaleString(a())
	})] });
}
function ot() {
	return {
		id: "title",
		label: d("Title"),
		width: 0,
		sort: "title",
		render: () => null
	};
}
export { it as default, tt as languageName, rt as loadEntriesList };
