import { t as e } from "./useCollection-DPy1gAYR.js";
import { Link as t, batch as n, getManifest as r, invalidate as i, locale as a, navigate as o, plural as s, run as c, setQuery as l, t as u, useAbility as d, useAction as f, useLocation as p, useManifest as m } from "@letterncms/sdk";
import { useEffect as h, useMemo as g, useState as _ } from "react";
import { Avatar as v, AvatarStack as y, Button as b, Checkbox as x, DataCalendar as S, DataCard as C, DataGrid as w, DateCell as ee, EmptyState as te, Fields as ne, Icon as T, IconButton as re, Menu as E, NoMatches as ie, NotFoundState as ae, Notice as oe, OverviewControls as se, PagePagination as ce, QueryError as le, SelectionBar as ue, Skeleton as D, StatusDot as O, TableFrame as de, TableHeader as k, TableMeta as A, TableRow as j, calendarRange as M, cn as N, confirm as fe, copyText as pe, entryActionAvailability as me, entryFieldColumns as he, nextTableSort as ge, recordDateColumns as _e, rowActionsClass as ve, standardEntryColumns as ye, toast as P, useOverviewSource as be, useRecordNavigation as xe, useShortcut as Se, useViewPrefs as F } from "@letterncms/ui";
import { Fragment as Ce, jsx as I, jsxs as L } from "react/jsx-runtime";
import { DndContext as we, PointerSensor as Te, closestCenter as R, useSensor as z, useSensors as Ee } from "@dnd-kit/core";
import { SortableContext as B, arrayMove as De, useSortable as V, verticalListSortingStrategy as Oe } from "@dnd-kit/sortable";
import { CSS as ke } from "@dnd-kit/utilities";
// admin/src/EntryActions.tsx
function Ae({ item: e, handle: t, className: n }) {
	let r = m().collections.find((e) => e.handle === t)?.can, a = me(r, e), s = f("entries/duplicate", {
		invalidates: ["entries/", "content/"],
		onSuccess: (e) => o(`/content/${t}/${e.id}`),
		onError: P.error
	}), l = !!e.uri && e.displayStatus !== "draft" && e.displayStatus !== "scheduled", d = (t, n) => c(t, {
		id: e.id,
		expectedVersion: e.version
	}).then(() => {
		P.success(n), i("entries/", "content/");
	}, P.error);
	return /* @__PURE__ */ L("div", {
		className: N("flex items-center gap-0.5 has-[[data-popup-open]]:opacity-100", n),
		children: [l && /* @__PURE__ */ I(re, {
			icon: "external",
			label: u("View on Site"),
			size: "xs",
			onClick: () => window.open(e.uri, "_blank", "noopener")
		}), /* @__PURE__ */ I(E, {
			trigger: /* @__PURE__ */ I(re, {
				icon: "more",
				label: u("More"),
				size: "xs"
			}),
			items: [
				{
					label: u("Open"),
					icon: "edit",
					onSelect: () => o(`/content/${t}/${e.id}`)
				},
				a.duplicate ? {
					label: u("Duplicate"),
					icon: "copy",
					onSelect: () => s.mutate({
						id: e.id,
						expectedVersion: e.version
					})
				} : null,
				a.publish && (e.displayStatus === "draft" || e.displayStatus === "changed") ? {
					label: u("Publish"),
					icon: "rocket",
					onSelect: () => d("entries/publish", u("Published"))
				} : null,
				a.unpublish && e.displayStatus !== "draft" ? {
					label: u("Unpublish"),
					icon: "eye-off",
					onSelect: () => d("entries/unpublish", u("Unpublished"))
				} : null,
				e.uri ? {
					label: u("Copy URL"),
					icon: "link",
					onSelect: () => void pe(new URL(e.uri, window.location.origin).href, {
						copied: u("URL copied"),
						failed: u("Couldn’t copy the URL")
					})
				} : null,
				a.delete ? {
					separator: !0,
					label: ""
				} : null,
				a.delete ? {
					label: u("Delete"),
					icon: "trash",
					danger: !0,
					onSelect: async () => {
						await fe({
							title: u("Delete “{title}”?", { title: e.title }),
							description: u("This cannot be undone."),
							confirm: u("Delete"),
							danger: !0
						}) && c("entries/delete", {
							id: e.id,
							expectedVersion: e.version
						}).then(() => {
							P.success(u("Deleted")), i("entries/", "content/");
						}, P.error);
					}
				} : null
			]
		})]
	});
}
// admin/src/EntriesTable.tsx
var je = 20;
function Me({ handle: e, columns: t, ctx: n, items: r, tree: i, loading: a, stale: o, selected: s, onSelect: c, sort: l, onSort: d, cursor: f, urls: p = [] }) {
	let m = !!i && Ne(r), h = U(t, [...G(r).map((e) => e.uri ?? ""), ...p], m, !!i), g = {
		id: "title",
		label: u("Title"),
		width: 0,
		sort: "title",
		render: () => null
	}, _ = G(r).map((e) => e.id), v = _.filter((e) => s.has(e)).length;
	return /* @__PURE__ */ L(de, {
		template: h,
		label: u("Entries"),
		busy: a || o,
		children: [/* @__PURE__ */ L(j, {
			header: !0,
			className: "relative",
			children: [
				/* @__PURE__ */ I("div", {
					role: "columnheader",
					className: W,
					children: /* @__PURE__ */ I(x, {
						checked: _.length > 0 && v === _.length,
						indeterminate: v > 0 && v < _.length,
						label: /* @__PURE__ */ I("span", {
							className: "sr-only",
							children: u("Select All")
						}),
						onChange: (e) => c(_, e),
						disabled: a || _.length === 0
					})
				}),
				m && /* @__PURE__ */ I("span", { role: "none" }),
				/* @__PURE__ */ I(Pe, {
					column: g,
					sort: l,
					onSort: d
				}),
				t.map((e) => /* @__PURE__ */ I(Pe, {
					column: e,
					sort: l,
					onSort: d
				}, e.id)),
				/* @__PURE__ */ I(k, {
					label: u("Actions"),
					hiddenLabel: !0
				})
			]
		}), a ? /* @__PURE__ */ I(K, {
			columns: t,
			tree: m
		}) : /* @__PURE__ */ I("div", {
			className: N("transition-opacity duration-180", o && "opacity-60"),
			children: i ? /* @__PURE__ */ I(J, {
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
			}) : r.map((r) => /* @__PURE__ */ I(q, {
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
var H = (e) => `minmax(120px,${Math.min(360, Math.max(120, Math.ceil(Math.max(0, ...e.map((e) => e.length)) * 7.3) + 8))}px)`;
function U(e, t = [], n = !1, r = n) {
	return [
		...n ? ["0px"] : [],
		"minmax(200px,1fr)",
		...e.map((e) => e.id === "uri" ? H(t) : typeof e.width == "number" ? `${e.width}px` : e.width),
		r ? "76px" : "52px"
	].join(" ");
}
var W = "relative z-10 flex items-center max-sm:w-4 max-sm:shrink-0 sm:absolute sm:right-full sm:top-1/2 sm:-translate-y-1/2 md:mr-1 [&_label]:gap-0", Ne = (e) => e.some((e) => (e.children?.length ?? 0) > 0);
function G(e) {
	return e.flatMap((e) => [e, ...G(e.children ?? [])]);
}
function Pe({ column: e, sort: t, onSort: n }) {
	let r = t?.field === e.sort;
	return /* @__PURE__ */ I(k, {
		label: e.label,
		align: e.align,
		direction: r ? t.desc ? "descending" : "ascending" : void 0,
		onSort: e.sort ? () => n(e) : void 0
	});
}
function K({ columns: e, tree: t }) {
	return /* @__PURE__ */ I("div", {
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
		].map((n, r) => /* @__PURE__ */ L(j, {
			className: "max-sm:[&>*:nth-child(n+3)]:hidden",
			children: [
				t && /* @__PURE__ */ I("span", {}),
				/* @__PURE__ */ I("div", {
					style: { width: n },
					className: "max-sm:flex-1",
					children: /* @__PURE__ */ I(D, { className: "h-3" })
				}),
				e.map((e) => /* @__PURE__ */ I(D, { className: "h-3 w-3/5" }, e.id)),
				/* @__PURE__ */ I("span", {})
			]
		}, r))
	});
}
function q({ item: e, handle: n, columns: r, ctx: i, selected: a, onSelect: o, active: s, depth: c = 0, expander: l, dragHandle: d, tree: f }) {
	return /* @__PURE__ */ L(j, {
		recordId: e.id,
		selected: a,
		active: s,
		children: [
			/* @__PURE__ */ I("div", {
				role: "cell",
				"data-row-check": "",
				className: W,
				children: /* @__PURE__ */ I(x, {
					checked: a,
					onChange: (t) => o([e.id], t),
					label: /* @__PURE__ */ I("span", {
						className: "sr-only",
						children: u("Select {name}", { name: e.title || u("Untitled") })
					})
				})
			}),
			f && /* @__PURE__ */ I("span", {
				role: "none",
				className: "max-sm:hidden"
			}),
			/* @__PURE__ */ L("div", {
				role: "cell",
				className: "flex min-w-0 items-center max-sm:flex-1",
				style: c ? { paddingLeft: c * je } : void 0,
				children: [l, /* @__PURE__ */ I(t, {
					to: `/content/${n}/${e.id}`,
					className: "min-w-0 truncate text-sm font-medium text-text no-underline outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-focus",
					children: e.title || /* @__PURE__ */ I("span", {
						className: "text-faint",
						children: u("Untitled")
					})
				})]
			}),
			/* @__PURE__ */ I(A, { children: r.map((t) => /* @__PURE__ */ I("div", {
				role: "cell",
				"data-align": t.align,
				className: N("flex min-w-0 items-center", t.align === "end" && "justify-end"),
				children: t.render(e, i)
			}, t.id)) }),
			/* @__PURE__ */ L("div", {
				role: "cell",
				"data-table-actions": !0,
				className: ve,
				children: [d, /* @__PURE__ */ I(Ae, {
					item: e,
					handle: n
				})]
			})
		]
	});
}
function J(e) {
	let [t, n] = _({}), r = e.collapsed ?? t, a = e.setCollapsed ?? n, { handle: o, nodes: s, parentId: l, depth: d } = e, f = m().collections.find((e) => e.handle === o)?.can, p = s.every((e) => me(f, e).move), [h, g] = _(null), v = h ?? s, y = Ee(z(Te, { activationConstraint: { distance: 4 } }));
	return /* @__PURE__ */ I(we, {
		sensors: y,
		collisionDetection: R,
		onDragEnd: async (e) => {
			if (!p || !e.over || e.active.id === e.over.id) return;
			let t = v.map((e) => e.id), n = De(v, t.indexOf(String(e.active.id)), t.indexOf(String(e.over.id)));
			g(n);
			try {
				await c("entries/reorder", {
					collection: o,
					ids: n.map((e) => e.id),
					parentId: l,
					versions: Object.fromEntries(n.map((e) => [e.id, e.version]))
				}), i("entries/");
			} catch (e) {
				P.error(e);
			} finally {
				g(null);
			}
		},
		children: /* @__PURE__ */ I(B, {
			items: v.map((e) => e.id),
			strategy: Oe,
			children: v.map((t) => {
				let n = t.children ?? [], i = !r[t.id];
				return /* @__PURE__ */ I(Y, {
					id: t.id,
					disabled: !p,
					children: (s) => /* @__PURE__ */ L(Ce, { children: [/* @__PURE__ */ I(q, {
						item: t,
						handle: o,
						columns: e.columns,
						ctx: e.ctx,
						selected: e.selected.has(t.id),
						onSelect: e.onSelect,
						active: e.cursor === t.id,
						depth: d,
						tree: e.nested,
						dragHandle: s,
						expander: n.length > 0 && /* @__PURE__ */ I("button", {
							type: "button",
							onClick: () => a((e) => ({
								...e,
								[t.id]: i
							})),
							className: "relative z-10 -ml-5 mr-0 grid size-5 shrink-0 -translate-x-0.5 place-items-center rounded-xs text-faint transition-colors duration-120 hover:bg-hover hover:text-text",
							"aria-expanded": i,
							"aria-label": u(i ? "Collapse" : "Expand"),
							children: /* @__PURE__ */ I(T, {
								name: "chevron-right",
								size: 12,
								className: N("transition-transform duration-120", i && "rotate-90")
							})
						})
					}), n.length > 0 && i && /* @__PURE__ */ I(J, {
						...e,
						nodes: n,
						parentId: t.id,
						depth: d + 1,
						collapsed: r,
						setCollapsed: a
					})] })
				}, t.id);
			})
		})
	});
}
function Y({ id: e, children: t, disabled: n }) {
	let { attributes: r, listeners: i, setNodeRef: a, transform: o, transition: s, isDragging: c } = V({
		id: e,
		disabled: n
	}), l = /* @__PURE__ */ I("button", {
		type: "button",
		...r,
		...i,
		className: "grid size-6 cursor-grab place-items-center rounded-xs text-faint transition-colors duration-120 hover:bg-hover hover:text-text active:cursor-grabbing max-sm:hidden",
		"aria-label": u("Drag to Reorder"),
		children: /* @__PURE__ */ I(T, {
			name: "drag",
			size: 14
		})
	});
	return /* @__PURE__ */ I("div", {
		ref: a,
		style: {
			transform: ke.Transform.toString(o),
			transition: s
		},
		className: N(c && "relative z-20 bg-bg shadow-pop"),
		children: t(n ? null : l)
	});
}
// admin/src/BuiltinPages.tsx
function Fe({ groups: e, columns: n, urls: r, nested: a, tree: s }) {
	let [l, d] = _(null), f = U(n, r, a, s), p = async (e, t) => {
		d(`${e.id}/${t.handle}`);
		try {
			let { id: n } = await c("pages/customise", {
				group: e.id,
				handle: t.handle
			});
			i("pages/builtin", "entries/"), o(`/content/${e.collection}/${n}`);
		} catch (e) {
			P.error(e);
		} finally {
			d(null);
		}
	}, m = (e, t) => t.id === "uri" ? e.path ? /* @__PURE__ */ I("span", {
		className: "block truncate font-mono text-xs text-faint",
		children: e.path
	}) : /* @__PURE__ */ I("span", {
		className: "block truncate text-xs text-faint",
		children: u("Shown inside other pages")
	}) : t.id === "status" ? e.status === "conflict" ? /* @__PURE__ */ I(O, {
		status: "warning",
		label: u("A page has this address"),
		className: "whitespace-nowrap"
	}) : e.status === "draft" ? /* @__PURE__ */ I(O, { status: "draft" }) : e.status === "customised" ? /* @__PURE__ */ I(O, { status: "published" }) : /* @__PURE__ */ I(O, {
		status: "neutral",
		label: u("Standard")
	}) : null;
	return /* @__PURE__ */ L("section", {
		className: "mt-10",
		"aria-label": u("Built-in Pages"),
		children: [/* @__PURE__ */ I("h2", {
			className: "m-0 mb-3 text-sm font-semibold text-ink",
			children: u("Built-in Pages")
		}), /* @__PURE__ */ I("div", {
			className: "space-y-6",
			children: e.map((e) => /* @__PURE__ */ L("div", { children: [/* @__PURE__ */ I("div", {
				className: "cms-label mb-1.5",
				children: e.label
			}), /* @__PURE__ */ I(de, {
				template: f,
				label: e.label,
				children: e.pages.map((r) => {
					let i = `${e.id}/${r.handle}`;
					return /* @__PURE__ */ L(j, {
						className: N(l === i && "opacity-60"),
						children: [
							a && /* @__PURE__ */ I("span", {
								role: "none",
								className: "max-sm:hidden"
							}),
							/* @__PURE__ */ I("div", {
								role: "cell",
								className: "flex min-w-0 items-center max-sm:flex-1",
								children: r.id ? /* @__PURE__ */ I(t, {
									to: `/content/${e.collection}/${r.id}`,
									className: "min-w-0 truncate text-sm font-medium text-text no-underline outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-focus",
									children: r.label
								}) : /* @__PURE__ */ I("span", {
									className: "min-w-0 truncate text-sm font-medium text-text",
									children: r.label
								})
							}),
							/* @__PURE__ */ I(A, { children: n.map((e) => /* @__PURE__ */ I("div", {
								role: "cell",
								className: "flex min-w-0 items-center overflow-visible",
								children: m(r, e)
							}, e.id)) }),
							/* @__PURE__ */ I("div", {
								role: "cell",
								className: "relative z-10 flex min-w-0 items-center justify-end [&>*]:shrink-0",
								children: !r.id && r.status === "standard" && e.canCustomise && /* @__PURE__ */ I(b, {
									size: "xs",
									variant: "ghost",
									loading: l === i,
									disabled: l !== null,
									onClick: () => void p(e, r),
									children: u("Customize")
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
var X = (e) => e.toISOString().slice(0, 19).replace("T", " ");
function Ie(e, t, n, r = "published") {
	let i = M(n), a = r === "published" ? "published_at" : "updated_at";
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
				value: X(i.start)
			}, {
				field: a,
				operator: "<",
				value: X(i.end)
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
function Le({ handle: e, filters: t, dateField: n, selection: r, cursor: i, onItems: a }) {
	let { query: o } = p(), { dated: s, undated: c } = Ie(e, t, o.month, n), d = be({
		ability: "entries/list",
		input: s,
		perPage: 200
	}, !0), f = be({
		ability: "entries/list",
		input: c,
		perPage: 200
	}, !0), m = [...d.items, ...f.items], g = m.map((e) => `${e.id}:${e.version}`).join(",");
	return h(() => {
		a?.(m);
	}, [g, a]), /* @__PURE__ */ I(S, {
		label: u("Entries"),
		items: m,
		month: o.month,
		onMonth: (e) => l({ month: e }),
		date: (e) => n === "published" ? e.publishedAt : e.updatedAt,
		rowKey: (e) => e.id,
		rowHref: (t) => `/content/${e}/${t.id}`,
		title: (e) => /* @__PURE__ */ L("span", {
			className: "flex min-w-0 items-center gap-1.5",
			children: [/* @__PURE__ */ I(O, {
				status: e.displayStatus,
				label: ""
			}), /* @__PURE__ */ I("span", {
				className: "truncate",
				children: e.title || u("Untitled")
			})]
		}),
		loading: d.loading || f.loading,
		stale: d.stale || f.stale,
		error: d.error || f.error,
		onRetry: () => {
			d.retry(), f.retry();
		},
		selection: r,
		cursor: i
	});
}
// admin/src/listColumns.tsx
function Re(e, t, n) {
	let r = [];
	e.routable && r.push({
		id: "uri",
		label: u("URL"),
		width: "minmax(120px,0.6fr)",
		sort: "uri",
		render: (e) => e.uri && /* @__PURE__ */ I("span", {
			className: "block truncate font-mono text-xs text-faint",
			children: e.uri
		})
	}), r.push({
		id: "status",
		label: u("Status"),
		width: 104,
		sort: "status",
		render: (e) => /* @__PURE__ */ I(O, { status: e.displayStatus })
	});
	for (let e of he(t?.resolvedFields ?? t?.fields ?? [])) {
		let t = e.field;
		r.push({
			...e,
			render: (e, n) => /* @__PURE__ */ I(Ke, {
				field: t,
				value: e.values?.[t.handle],
				ctx: n
			})
		});
	}
	return n.length > 1 && r.push({
		id: "translations",
		label: u("Languages"),
		width: 24 + n.length * 26,
		render: (e, t) => /* @__PURE__ */ I(Ge, {
			item: e,
			locales: t.locales
		})
	}), r.push({
		id: "author",
		label: u("Author"),
		width: 132,
		sort: "author_id",
		render: (e) => e.author ? /* @__PURE__ */ I(We, { person: e.author }) : /* @__PURE__ */ I("span", {
			className: "text-xs text-faint",
			children: e.authorId ? u("Unavailable person") : u("Unassigned")
		})
	}), r.push(..._e((e) => e, {
		published: "published_at",
		updated: "updated_at"
	}).map((e) => ({
		...e,
		width: e.width
	}))), r;
}
function ze(e, t, n = "table") {
	return t?.default_columns ?? ye(e.routable, n, t?.resolvedFields ?? t?.fields);
}
function Be(e) {
	return (e?.resolvedFields ?? e?.fields ?? []).filter((e) => e.type === "media");
}
function Ve(e) {
	return (e?.resolvedFields ?? e?.fields ?? []).find((e) => e.type === "textarea" || e.type === "text" && !["title", "slug"].includes(e.handle));
}
function He(e) {
	return (Array.isArray(e) ? e : typeof e == "string" && e ? [e] : []).filter((e) => typeof e == "string" && e !== "");
}
function Ue(e, t) {
	let n = t.media.get(e.toLowerCase());
	return n ? n.thumb ?? (n.kind === "image" ? n.url : null) : e.startsWith("/") || e.startsWith("http") ? e : null;
}
function We({ person: e }) {
	return /* @__PURE__ */ L("span", {
		className: "flex min-w-0 items-center gap-1.5 text-xs text-muted",
		children: [/* @__PURE__ */ I(v, {
			name: e.name,
			initials: e.initials,
			src: e.avatar,
			size: 18
		}), /* @__PURE__ */ I("span", {
			className: "truncate",
			children: e.name
		})]
	});
}
function Ge({ item: e, locales: t }) {
	let n = new Set(e.translations ?? [e.locale]);
	return /* @__PURE__ */ I("span", {
		className: "flex items-center gap-1",
		children: t.map((e) => /* @__PURE__ */ I("span", {
			title: n.has(e) ? void 0 : u("Not translated"),
			className: N("inline-flex h-4.5 w-[22px] items-center justify-center rounded-xs font-mono text-[10px] uppercase", n.has(e) ? "bg-sunken text-text" : "text-faint/70"),
			children: e
		}, e))
	});
}
function Z(e, t) {
	let n = e.options;
	if (n && !Array.isArray(n) && typeof n == "object") return n[String(t)] ?? String(t);
	if (Array.isArray(n)) {
		let e = n.find((e) => String(typeof e == "object" ? e.value : e) === String(t));
		if (e && typeof e == "object") return e.label ?? String(t);
	}
	return String(t);
}
function Ke({ field: e, value: t, ctx: n }) {
	if (t == null || t === "" || Array.isArray(t) && t.length === 0) return null;
	switch (e.type) {
		case "toggle": return t ? /* @__PURE__ */ I(T, {
			name: "check",
			size: 14,
			className: "text-text",
			"aria-label": u("Yes")
		}) : null;
		case "number": return /* @__PURE__ */ I("span", {
			className: "block truncate text-right text-xs tabular-nums text-text",
			children: Number(t).toLocaleString(a())
		});
		case "date": return /* @__PURE__ */ I(ee, { iso: String(t) });
		case "select": {
			let n = (Array.isArray(t) ? t : [t]).map((t) => Z(e, t));
			return /* @__PURE__ */ I("span", {
				className: "block truncate text-xs text-text",
				children: n.join(", ")
			});
		}
		case "tags": return /* @__PURE__ */ I(qe, { labels: (Array.isArray(t) ? t : [t]).map(String) });
		case "entries": return /* @__PURE__ */ I(qe, { labels: t.map((e) => e.title) });
		case "users": {
			let e = t;
			return e.length === 1 ? /* @__PURE__ */ I(We, { person: e[0] }) : /* @__PURE__ */ I(y, {
				people: e,
				size: 18,
				max: 3
			});
		}
		case "media": {
			let e = He(t), r = Ue(e[0], n);
			return /* @__PURE__ */ L("span", {
				className: "flex items-center gap-1",
				children: [/* @__PURE__ */ I("span", {
					className: "grid size-6 shrink-0 place-items-center overflow-hidden rounded-xs border border-border bg-sunken text-faint",
					children: r ? /* @__PURE__ */ I("img", {
						src: r,
						alt: "",
						loading: "lazy",
						className: "size-full object-cover"
					}) : /* @__PURE__ */ I(T, {
						name: "file",
						size: 12
					})
				}), e.length > 1 && /* @__PURE__ */ L("span", {
					className: "text-2xs text-faint",
					children: ["+", e.length - 1]
				})]
			});
		}
		case "color": return /* @__PURE__ */ L("span", {
			className: "flex items-center gap-1.5 text-xs",
			children: [/* @__PURE__ */ I("span", {
				className: "size-3 shrink-0 rounded-full border border-border",
				style: { background: String(t) }
			}), /* @__PURE__ */ I("span", {
				className: "truncate font-mono text-muted",
				children: String(t)
			})]
		});
		case "slug":
		case "url":
		case "email": return /* @__PURE__ */ I("span", {
			className: "block truncate font-mono text-xs text-muted",
			children: String(t)
		});
		default: return /* @__PURE__ */ I("span", {
			className: N("block truncate text-xs", e.type === "textarea" ? "text-muted" : "text-text"),
			children: typeof t == "object" ? JSON.stringify(t) : String(t)
		});
	}
}
function qe({ labels: e }) {
	return /* @__PURE__ */ L("span", {
		className: "flex min-w-0 items-center gap-1",
		children: [e.slice(0, 2).map((e, t) => /* @__PURE__ */ I("span", {
			className: "inline-flex h-5 min-w-0 shrink items-center rounded-xs bg-sunken px-1.5 text-2xs text-text",
			children: /* @__PURE__ */ I("span", {
				className: "truncate",
				children: e
			})
		}, t)), e.length > 2 && /* @__PURE__ */ L("span", {
			className: "shrink-0 text-2xs text-faint",
			children: ["+", e.length - 2]
		})]
	});
}
// admin/src/EntriesGrid.tsx
function Je({ handle: e, items: t, ctx: n, media: r, excerpt: i, columns: a, visible: o, icon: s, loading: c, stale: l, selected: u, onSelect: d, cursor: f }) {
	return /* @__PURE__ */ I(w, {
		loading: c,
		stale: l,
		media: !!r,
		children: t.map((t) => /* @__PURE__ */ I(Ye, {
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
function Ye({ item: e, handle: t, ctx: n, media: r, excerpt: i, columns: a, visible: o, icon: s, selected: c, onSelect: l, active: d }) {
	let f = r ? He(e.values?.[r.handle]) : [], p = f[0] ? Ue(f[0], n) : null, m = !r && i && !a.some((e) => e.field?.handle === i.handle) ? Xe(e.values?.[i.handle]) : "", h = a.filter((e) => e.id === "translations" || e.field && e.field.handle !== r?.handle), g = o.has("published") && e.publishedAt ? {
		label: u("Published"),
		iso: e.publishedAt,
		relative: !1
	} : o.has("updated") && e.updatedAt ? {
		label: u("Updated"),
		iso: e.updatedAt,
		relative: !0
	} : null;
	return /* @__PURE__ */ L(C, {
		recordId: e.id,
		title: e.title || /* @__PURE__ */ I("span", {
			className: "text-faint",
			children: u("Untitled")
		}),
		href: `/content/${t}/${e.id}`,
		icon: s,
		selected: c,
		active: d,
		onSelect: (t) => l([e.id], t),
		actions: /* @__PURE__ */ I(Ae, {
			item: e,
			handle: t
		}),
		image: r ? p ? /* @__PURE__ */ I("img", {
			src: p,
			alt: "",
			loading: "lazy",
			className: "absolute inset-0 size-full object-cover"
		}) : /* @__PURE__ */ I("div", {
			className: "grid size-full place-items-center text-faint",
			children: /* @__PURE__ */ I(T, {
				name: "image",
				size: 20
			})
		}) : void 0,
		footer: /* @__PURE__ */ L(Ce, { children: [o.has("status") && /* @__PURE__ */ I(O, { status: e.displayStatus }), /* @__PURE__ */ L("span", {
			className: "ml-auto flex min-w-0 items-center gap-1.5",
			children: [o.has("author") && (e.author ? /* @__PURE__ */ I(v, {
				name: e.author.name,
				initials: e.author.initials,
				src: e.author.avatar,
				size: 16
			}) : /* @__PURE__ */ I("span", {
				className: "text-2xs text-faint",
				children: e.authorId ? u("Unavailable person") : u("Unassigned")
			})), g && /* @__PURE__ */ L("span", {
				className: "flex min-w-0 items-center gap-1 text-xs text-faint",
				children: [g.label, /* @__PURE__ */ I(ee, {
					iso: g.iso,
					relative: g.relative
				})]
			})]
		})] }),
		children: [
			o.has("uri") && e.uri && /* @__PURE__ */ I("span", {
				className: N("mt-0.5 truncate font-mono text-2xs text-faint", !r && "pl-[22px]"),
				children: e.uri
			}),
			m && /* @__PURE__ */ I("p", {
				className: "m-0 mt-1.5 line-clamp-3 pl-[22px] text-xs leading-relaxed text-muted",
				children: m
			}),
			h.length > 0 && /* @__PURE__ */ I("dl", {
				className: N("m-0 mt-2 space-y-1.5", !r && "pl-[22px]"),
				children: h.map((t) => /* @__PURE__ */ L("div", {
					className: "flex min-w-0 items-center justify-between gap-3 text-xs",
					children: [/* @__PURE__ */ I("dt", {
						className: "min-w-0 flex-1 truncate text-faint",
						children: t.label
					}), /* @__PURE__ */ I("dd", {
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
var Q = (e) => r().collections.find((t) => t.handle === e)?.defaultView ?? "table";
function Ze(e, t = Q(e)) {
	return F(`entries.${e}`, t);
}
// admin/src/EntriesList.tsx
function Qe(e) {
	try {
		let t = new Intl.DisplayNames([e], { type: "language" }).of(e) ?? e;
		return t.charAt(0).toLocaleUpperCase(e) + t.slice(1);
	} catch {
		return e;
	}
}
function $e(e, t, n, r, i) {
	let a = e.collections.find((e) => e.handle === t), o = e.site.locales, s = o.includes(i.locale ?? "") ? i.locale : e.site.defaultLocale, c = i.q ?? "", l = i.status ?? "any", u = Number(i.page ?? 1), d = a?.structure === "tree", f = a?.structure === "dated", p = [
		"table",
		...Be(n).length > 0 || a?.defaultView === "grid" ? ["grid"] : [],
		...f || a?.defaultView === "calendar" ? ["calendar"] : []
	], m = p.includes(r.view) ? r.view : "table", h = a ? Re(a, n, o) : [], g = new Set(r.columns ?? (a ? ze(a, n, m) : [])), _ = h.filter((e) => g.has(e.id)), v = [$(), ...h.filter((e) => e.sort)], y = r.sort && v.some((e) => e.sort === r.sort.replace(/^-/, "")) ? r.sort : null, b = d ? null : n?.sort ?? (f ? "-published_at" : "title"), x = !!c || l !== "any", S = d && !y && !x && m !== "calendar", C = [...new Set(_.filter((e) => e.field).map((e) => e.field.handle))].sort();
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
function et({ props: t }) {
	let r = t.collection, a = m(), { summary: c, collection: f, error: v, isLoading: y } = e(r), { query: x } = p(), [S, C] = _(x.q ?? ""), w = x.status ?? "any", ee = Number(x.page ?? 1), E = a.site.locales, D = E.includes(x.locale ?? "") ? x.locale : a.site.defaultLocale, O = me(c?.can), de = `/content/${r}/new${D === a.site.defaultLocale ? "" : `?locale=${D}`}`, [k, A] = Ze(r), [j, M] = _(/* @__PURE__ */ new Set()), [N, pe] = _(!1), [he, _e] = _([]), [ve, ye] = _([]), { all: be, shown: F, columns: we, sortable: Te, sortKey: R, ownSort: z, isTree: Ee, view: B, views: De, showTree: V, filtered: Oe, fields: ke, input: Ae } = g(() => $e(a, r, f, k, {
		...x,
		q: S
	}), [
		a,
		r,
		f,
		k,
		x,
		S
	]), je = R ? {
		field: R.replace(/^-/, ""),
		desc: R.startsWith("-")
	} : z ? {
		field: z.replace(/^-/, ""),
		desc: z.startsWith("-"),
		implicit: !0
	} : null, H = Be(f)[0], U = Ve(f), W = d("entries/list", Ae, {
		enabled: !!c && !V && B !== "calendar",
		placeholderData: (e) => e
	}), Pe = d("pages/builtin", {}, { enabled: r === "pages" }), K = d("entries/tree", {
		collection: r,
		locale: D,
		fields: ke
	}, {
		enabled: !!c && V,
		placeholderData: (e) => e
	}), q = V ? K.data ?? [] : W.data?.items ?? [], J = V ? G(q) : q, Y = V ? K.isLoading : W.isLoading, X = V ? K.isPlaceholderData : W.isPlaceholderData, Ie = v ?? (V ? K.error : W.error), Re = () => {
		v && i("collections/get"), V ? K.refetch() : W.refetch();
	}, Ue = {
		published: J.some((e) => !!e.publishedAt),
		updated: J.some((e) => !!e.updatedAt)
	}, We = (e) => Y || !(e.id in Ue) || Ue[e.id], Ge = be.filter(We), Z = we.filter(We), Ke = [...Z.filter((e) => e.field?.type === "media").map((e) => e.field.handle), ...B === "grid" && H ? [H.handle] : []], qe = [...new Set(J.flatMap((e) => Ke.flatMap((t) => He(e.values?.[t]))))].filter((e) => /^[0-9a-z]{26}$/i.test(e)), Ye = d("media/lookup", { ids: qe }, {
		enabled: qe.length > 0 && a.fieldTypes.some((e) => e.key === "media"),
		staleTime: 3e5,
		placeholderData: (e) => e
	}), Xe = g(() => ({
		media: new Map((Ye.data?.items ?? []).map((e) => [e.id.toLowerCase(), e])),
		locales: E
	}), [Ye.data, E]);
	h(() => C(x.q ?? ""), [r]), h(() => {
		M(/* @__PURE__ */ new Set()), _e([]);
	}, [
		r,
		ee,
		w,
		S,
		D,
		R
	]);
	let Q = (e, t) => M((n) => {
		let r = new Set(n);
		for (let n of e) t ? r.add(n) : r.delete(n);
		return r;
	});
	Se("c", () => O.create && o(de));
	let et = xe({
		resetKey: `${r}:${ee}:${w}:${S}:${D}:${R}`,
		selection: {
			ids: j,
			onSelect: Q
		},
		onOpen: (e) => o(`/content/${r}/${e}`)
	});
	if (!c) return /* @__PURE__ */ I(ae, {
		icon: "collection",
		action: /* @__PURE__ */ I(b, {
			onClick: () => o("/"),
			children: u("Go Home")
		})
	});
	let $ = (e) => {
		A({ sort: e }), l({ page: null });
	}, tt = (e) => $(ge(e.sort, R, e.descFirst, z)), nt = async (e) => {
		if (N || X || !j.size || (e === "entries/delete" ? !O.delete : !O.publish)) return;
		let t = [...j], r = B === "calendar" ? ve : J;
		if (t.some((e) => !r.some((t) => t.id === e))) {
			P.error(u("The selection changed. Refresh and select the entries again."));
			return;
		}
		let a = t.length;
		if ((e !== "entries/delete" || await fe({
			title: s(a, "Delete {count} entry?", "Delete {count} entries?"),
			description: u("This cannot be undone."),
			confirm: u("Delete"),
			danger: !0
		})) && !N) {
			pe(!0), _e([]);
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
				o.length ? P.error(u("{failed} of {total} failed.", {
					failed: o.length,
					total: a
				})) : e === "entries/publish" ? P.success(s(a, "Published {count} entry", "Published {count} entries")) : e === "entries/unpublish" ? P.success(s(a, "Unpublished {count} entry", "Unpublished {count} entries")) : P.success(s(a, "Deleted {count} entry", "Deleted {count} entries")), _e(o), M(new Set(o.map((e) => e.id))), i("entries/", "content/");
			} catch (e) {
				P.error(e);
			} finally {
				pe(!1);
			}
		}
	}, rt = () => {
		C(""), l({
			q: null,
			status: null,
			page: null
		});
	}, it = R ? Te.find((e) => e.sort === R.replace(/^-/, "")) : void 0, at = ze(c, f, B), ot = B !== (c.defaultView ?? "table") || !!R || k.calendarDate !== "published" || !!x.month || Ge.some((e) => F.has(e.id) !== at.includes(e.id)), st = (B === "calendar" ? ve : J).filter((e) => j.has(e.id)), ct = st.some((e) => e.displayStatus === "draft" || e.displayStatus === "changed"), lt = st.some((e) => e.displayStatus !== "draft"), ut = r === "pages" && B !== "calendar" && !Oe ? (Pe.data ?? []).filter((e) => e.pages.length > 0) : [], dt = !Y && !y && !Ie && J.length === 0;
	return /* @__PURE__ */ L(Ce, { children: [
		/* @__PURE__ */ L("div", {
			className: "mb-3 flex flex-wrap items-center gap-x-2 gap-y-2",
			children: [/* @__PURE__ */ I(ne, {
				bare: !0,
				layout: "inline",
				className: "flex min-w-0 flex-1 flex-wrap items-center gap-2 max-sm:contents",
				fields: [
					{
						handle: "q",
						type: "text",
						label: u("Search"),
						icon: "search",
						size: "sm",
						className: "w-full sm:w-60",
						placeholder: u("Search {items}…", { items: c.title.toLowerCase() })
					},
					{
						handle: "status",
						type: "select",
						label: u("Status"),
						display: "segmented",
						required: !0,
						className: "shrink-0",
						options: {
							any: u("All"),
							published: u("Published"),
							draft: u("Drafts")
						}
					},
					...E.length > 1 ? [{
						handle: "locale",
						type: "select",
						label: u("Language"),
						display: "segmented",
						required: !0,
						className: "shrink-0",
						options: E.map((e) => ({
							value: e,
							label: e.toUpperCase(),
							title: Qe(e)
						}))
					}] : []
				],
				values: {
					q: S,
					status: w,
					locale: D
				},
				onChange: (e, t) => {
					e === "q" ? (C(t ?? ""), l({
						q: t,
						page: null
					})) : l(e === "status" ? {
						status: t === "any" ? null : t,
						page: null
					} : {
						locale: t === a.site.defaultLocale ? null : t,
						page: null
					});
				}
			}), /* @__PURE__ */ I(se, {
				view: B,
				views: De,
				all: Ge,
				shown: F,
				sortable: Te,
				sortKey: R,
				implicitSort: z,
				isTree: Ee,
				onColumns: (e) => A({ columns: e }),
				onSort: $,
				onView: (e) => A({ view: e }),
				calendarDate: k.calendarDate,
				onCalendarDate: (e) => A({ calendarDate: e }),
				onReset: ot ? () => {
					A({
						view: null,
						sort: null,
						columns: null,
						calendarDate: "published"
					}), l({
						page: null,
						month: null
					});
				} : void 0,
				children: it && B !== "calendar" && /* @__PURE__ */ L("span", {
					className: "inline-flex h-6 items-center gap-1 rounded-sm bg-sunken pl-2 pr-0.5 text-xs text-muted",
					title: u("Sorted by {column}", { column: it.label }),
					children: [
						/* @__PURE__ */ I(T, {
							name: R.startsWith("-") ? "arrow-down" : "arrow-up",
							size: 11
						}),
						/* @__PURE__ */ I("span", {
							className: "max-w-32 truncate",
							children: it.label
						}),
						Ee ? /* @__PURE__ */ I(b, {
							size: "xs",
							variant: "ghost",
							icon: "list-tree",
							className: "ml-1 h-5 px-1.5",
							onClick: () => $(null),
							children: u("Show Tree")
						}) : /* @__PURE__ */ I(re, {
							icon: "close",
							label: u("Reset Sort"),
							size: "xs",
							className: "size-5",
							onClick: () => $(null)
						})
					]
				})
			})]
		}),
		Ie && B !== "calendar" && /* @__PURE__ */ I(le, {
			message: `${u("Couldn’t load entries.")} ${Ie.message}`,
			onRetry: Re
		}),
		he.length > 0 && /* @__PURE__ */ I(oe, {
			tone: "warning",
			className: "my-3",
			title: u("Failed entries remain selected. Retry the action for these entries."),
			children: /* @__PURE__ */ I("ul", {
				className: "m-0 space-y-1 pl-4",
				children: he.map((e) => /* @__PURE__ */ L("li", { children: [
					/* @__PURE__ */ I("span", {
						className: "font-medium text-text",
						children: e.title
					}),
					": ",
					e.message
				] }, e.id))
			})
		}),
		B === "calendar" ? /* @__PURE__ */ I(Le, {
			onItems: ye,
			handle: r,
			filters: {
				locale: D,
				status: w,
				search: S || void 0
			},
			dateField: k.calendarDate,
			selection: {
				ids: j,
				onSelect: Q
			},
			cursor: et
		}) : dt ? Oe ? /* @__PURE__ */ I(ie, { onClear: rt }) : /* @__PURE__ */ I(te, {
			icon: c.icon,
			title: u("No {items} yet", { items: c.title.toLowerCase() })
		}) : B === "grid" ? /* @__PURE__ */ I(Je, {
			handle: r,
			items: J,
			ctx: Xe,
			media: H && F.has(`field:${H.handle}`) ? H : void 0,
			excerpt: U && F.has(`field:${U.handle}`) ? U : void 0,
			columns: Z,
			visible: F,
			icon: c.icon,
			loading: Y || y,
			stale: X,
			selected: j,
			onSelect: Q,
			cursor: et
		}) : /* @__PURE__ */ I(Me, {
			handle: r,
			columns: Z,
			ctx: Xe,
			items: q,
			urls: ut.flatMap((e) => e.pages.map((e) => e.path ?? "")),
			tree: V,
			loading: Y || y,
			stale: X,
			selected: j,
			onSelect: Q,
			sort: je,
			onSort: tt,
			cursor: et
		}),
		ut.length > 0 && B === "table" && /* @__PURE__ */ I(Fe, {
			groups: ut,
			columns: Z,
			nested: V && Ne(q),
			tree: V,
			urls: [...G(q).map((e) => e.uri ?? ""), ...ut.flatMap((e) => e.pages.map((e) => e.path ?? ""))]
		}),
		!V && B !== "calendar" && W.data && /* @__PURE__ */ I(ce, {
			page: W.data.page,
			pages: W.data.pages,
			total: W.data.total,
			perPage: W.data.perPage ?? 50,
			onPage: (e) => l({ page: e > 1 ? e : null })
		}),
		/* @__PURE__ */ L(ue, {
			count: j.size,
			onClear: () => M(/* @__PURE__ */ new Set()),
			children: [
				O.publish && ct && /* @__PURE__ */ I(b, {
					size: "sm",
					variant: "ghost",
					disabled: N || X,
					onClick: () => nt("entries/publish"),
					children: u("Publish")
				}),
				O.publish && lt && /* @__PURE__ */ I(b, {
					size: "sm",
					variant: "ghost",
					disabled: N || X,
					onClick: () => nt("entries/unpublish"),
					children: u("Unpublish")
				}),
				O.delete && /* @__PURE__ */ I(b, {
					size: "sm",
					variant: "ghost",
					disabled: N || X,
					onClick: () => nt("entries/delete"),
					children: u("Delete")
				})
			]
		})
	] });
}
function $() {
	return {
		id: "title",
		label: u("Title"),
		width: 0,
		sort: "title",
		render: () => null
	};
}
export { et as default, Qe as languageName };
