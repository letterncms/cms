import { t as e } from "./useCollection-DPy1gAYR.js";
import { Link as t, batch as n, getManifest as r, invalidate as i, locale as a, navigate as o, plural as s, prefetchAbility as c, run as l, setQuery as u, t as d, useAbility as f, useAction as p, useLocation as m, useManifest as h } from "@letterncms/sdk";
import { useEffect as g, useMemo as _, useState as v } from "react";
import { Avatar as y, AvatarStack as b, Button as x, Checkbox as S, DataCalendar as ee, DataCard as C, DataGrid as te, DataTable as w, DateCell as T, EmptyState as ne, Fields as re, Icon as E, IconButton as ie, Menu as D, OverviewControls as ae, Page as oe, PagePagination as se, QueryError as ce, SelectionBar as le, Skeleton as O, StatusDot as k, TableFrame as A, TableHeader as j, TableRow as M, calendarRange as N, cn as P, confirm as ue, entryActionAvailability as de, entryFieldColumns as fe, loadOverviewSource as F, nextTableSort as pe, readViewPrefs as me, recordDateColumns as he, standardEntryColumns as ge, toast as I, useOverviewSource as L, useRecordNavigation as _e, useShortcut as ve, useViewPrefs as ye } from "@letterncms/ui";
import { Fragment as be, jsx as R, jsxs as z } from "react/jsx-runtime";
import { DndContext as xe, PointerSensor as B, closestCenter as V, useSensor as Se, useSensors as H } from "@dnd-kit/core";
import { SortableContext as U, arrayMove as Ce, useSortable as we, verticalListSortingStrategy as Te } from "@dnd-kit/sortable";
import { CSS as Ee } from "@dnd-kit/utilities";
// admin/src/EntriesCalendar.tsx
var W = (e) => e.toISOString().slice(0, 19).replace("T", " ");
function G(e, t, n, r = "published") {
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
				value: W(i.start)
			}, {
				field: a,
				operator: "<",
				value: W(i.end)
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
function De({ handle: e, filters: t, dateField: n, selection: r, cursor: i, onItems: a }) {
	let { query: o } = m(), { dated: s, undated: c } = G(e, t, o.month, n), l = L({
		ability: "entries/list",
		input: s,
		perPage: 200
	}, !0), f = L({
		ability: "entries/list",
		input: c,
		perPage: 200
	}, !0), p = [...l.items, ...f.items], h = p.map((e) => `${e.id}:${e.version}`).join(",");
	return g(() => {
		a?.(p);
	}, [h, a]), /* @__PURE__ */ R(ee, {
		label: d("Entries"),
		items: p,
		month: o.month,
		onMonth: (e) => u({ month: e }),
		date: (e) => n === "published" ? e.publishedAt : e.updatedAt,
		rowKey: (e) => e.id,
		rowHref: (t) => `/content/${e}/${t.id}`,
		title: (e) => /* @__PURE__ */ z("span", {
			className: "flex min-w-0 items-center gap-1.5",
			children: [/* @__PURE__ */ R(k, {
				status: e.displayStatus,
				label: ""
			}), /* @__PURE__ */ R("span", {
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
// admin/src/EntryActions.tsx
function K({ item: e, handle: t, className: n }) {
	let r = h().collections.find((e) => e.handle === t)?.can, a = de(r, e), s = p("entries/duplicate", {
		invalidates: ["entries/", "content/"],
		onSuccess: (e) => o(`/content/${t}/${e.id}`),
		onError: I.error
	}), c = !!e.uri && e.displayStatus !== "draft" && e.displayStatus !== "scheduled";
	return /* @__PURE__ */ z("div", {
		className: P("flex items-center gap-0.5 has-[[data-popup-open]]:opacity-100", n),
		children: [c && /* @__PURE__ */ R(ie, {
			icon: "external",
			label: d("View on Site"),
			size: "xs",
			onClick: () => window.open(e.uri, "_blank", "noopener")
		}), /* @__PURE__ */ R(D, {
			trigger: /* @__PURE__ */ R(ie, {
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
				e.uri ? {
					label: d("Copy URL"),
					icon: "link",
					onSelect: () => navigator.clipboard.writeText(new URL(e.uri, window.location.origin).href).then(() => I.success(d("URL copied")), I.error)
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
							I.success(d("Deleted")), i("entries/", "content/");
						}, I.error);
					}
				} : null
			]
		})]
	});
}
// admin/src/listColumns.tsx
function q(e, t, n) {
	let r = [];
	e.routable && r.push({
		id: "uri",
		label: d("URL"),
		width: "minmax(120px,0.6fr)",
		sort: "uri",
		render: (e) => e.uri && /* @__PURE__ */ R("span", {
			className: "block truncate font-mono text-xs text-faint",
			children: e.uri
		})
	}), r.push({
		id: "status",
		label: d("Status"),
		width: 104,
		sort: "status",
		render: (e) => /* @__PURE__ */ R(k, { status: e.displayStatus })
	});
	for (let e of fe(t?.resolvedFields ?? t?.fields ?? [])) {
		let t = e.field;
		r.push({
			...e,
			render: (e, n) => /* @__PURE__ */ R(Ne, {
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
		render: (e, t) => /* @__PURE__ */ R(X, {
			item: e,
			locales: t.locales
		})
	}), r.push({
		id: "author",
		label: d("Author"),
		width: 132,
		sort: "author_id",
		render: (e) => e.author ? /* @__PURE__ */ R(Y, { person: e.author }) : /* @__PURE__ */ R("span", {
			className: "text-xs text-faint",
			children: e.authorId ? d("Unavailable person") : d("Unassigned")
		})
	}), r.push(...he((e) => e, {
		published: "published_at",
		updated: "updated_at"
	}).map((e) => ({
		...e,
		width: e.width
	}))), r;
}
function Oe(e, t, n = "table") {
	return t?.default_columns ?? ge(e.routable, t?.listing, n, t?.resolvedFields ?? t?.fields);
}
function ke(e) {
	return (e?.resolvedFields ?? e?.fields ?? []).filter((e) => e.type === "media");
}
function Ae(e) {
	return (e?.resolvedFields ?? e?.fields ?? []).find((e) => e.type === "textarea" || e.type === "text" && !["title", "slug"].includes(e.handle));
}
function je(e) {
	return (Array.isArray(e) ? e : typeof e == "string" && e ? [e] : []).filter((e) => typeof e == "string" && e !== "");
}
function J(e, t) {
	let n = t.media.get(e.toLowerCase());
	return n ? n.thumb ?? (n.kind === "image" ? n.url : null) : e.startsWith("/") || e.startsWith("http") ? e : null;
}
function Y({ person: e }) {
	return /* @__PURE__ */ z("span", {
		className: "flex min-w-0 items-center gap-1.5 text-xs text-muted",
		children: [/* @__PURE__ */ R(y, {
			name: e.name,
			initials: e.initials,
			src: e.avatar,
			size: 18
		}), /* @__PURE__ */ R("span", {
			className: "truncate",
			children: e.name
		})]
	});
}
function X({ item: e, locales: t }) {
	let n = new Set(e.translations ?? [e.locale]);
	return /* @__PURE__ */ R("span", {
		className: "flex items-center gap-1",
		children: t.map((e) => /* @__PURE__ */ R("span", {
			title: n.has(e) ? void 0 : d("Not translated"),
			className: P("inline-flex h-4.5 w-[22px] items-center justify-center rounded-xs font-mono text-[10px] uppercase", n.has(e) ? "bg-sunken text-text" : "text-faint/70"),
			children: e
		}, e))
	});
}
function Me(e, t) {
	let n = e.options;
	if (n && !Array.isArray(n) && typeof n == "object") return n[String(t)] ?? String(t);
	if (Array.isArray(n)) {
		let e = n.find((e) => String(typeof e == "object" ? e.value : e) === String(t));
		if (e && typeof e == "object") return e.label ?? String(t);
	}
	return String(t);
}
function Ne({ field: e, value: t, ctx: n }) {
	if (t == null || t === "" || Array.isArray(t) && t.length === 0) return null;
	switch (e.type) {
		case "toggle": return t ? /* @__PURE__ */ R(E, {
			name: "check",
			size: 14,
			className: "text-text",
			"aria-label": d("Yes")
		}) : null;
		case "number": return /* @__PURE__ */ R("span", {
			className: "block truncate text-right text-xs tabular-nums text-text",
			children: Number(t).toLocaleString(a())
		});
		case "date": return /* @__PURE__ */ R(T, { iso: String(t) });
		case "select": {
			let n = (Array.isArray(t) ? t : [t]).map((t) => Me(e, t));
			return /* @__PURE__ */ R("span", {
				className: "block truncate text-xs text-text",
				children: n.join(", ")
			});
		}
		case "tags": return /* @__PURE__ */ R(Pe, { labels: (Array.isArray(t) ? t : [t]).map(String) });
		case "entries": return /* @__PURE__ */ R(Pe, { labels: t.map((e) => e.title) });
		case "users": {
			let e = t;
			return e.length === 1 ? /* @__PURE__ */ R(Y, { person: e[0] }) : /* @__PURE__ */ R(b, {
				people: e,
				size: 18,
				max: 3
			});
		}
		case "media": {
			let e = je(t), r = J(e[0], n);
			return /* @__PURE__ */ z("span", {
				className: "flex items-center gap-1",
				children: [/* @__PURE__ */ R("span", {
					className: "grid size-6 shrink-0 place-items-center overflow-hidden rounded-xs border border-border bg-sunken text-faint",
					children: r ? /* @__PURE__ */ R("img", {
						src: r,
						alt: "",
						loading: "lazy",
						className: "size-full object-cover"
					}) : /* @__PURE__ */ R(E, {
						name: "file",
						size: 12
					})
				}), e.length > 1 && /* @__PURE__ */ z("span", {
					className: "text-2xs text-faint",
					children: ["+", e.length - 1]
				})]
			});
		}
		case "color": return /* @__PURE__ */ z("span", {
			className: "flex items-center gap-1.5 text-xs",
			children: [/* @__PURE__ */ R("span", {
				className: "size-3 shrink-0 rounded-full border border-border",
				style: { background: String(t) }
			}), /* @__PURE__ */ R("span", {
				className: "truncate font-mono text-muted",
				children: String(t)
			})]
		});
		case "slug":
		case "url":
		case "email": return /* @__PURE__ */ R("span", {
			className: "block truncate font-mono text-xs text-muted",
			children: String(t)
		});
		default: return /* @__PURE__ */ R("span", {
			className: P("block truncate text-xs", e.type === "textarea" ? "text-muted" : "text-text"),
			children: typeof t == "object" ? JSON.stringify(t) : String(t)
		});
	}
}
function Pe({ labels: e }) {
	return /* @__PURE__ */ z("span", {
		className: "flex min-w-0 items-center gap-1",
		children: [e.slice(0, 2).map((e, t) => /* @__PURE__ */ R("span", {
			className: "inline-flex h-5 min-w-0 shrink items-center rounded-xs bg-sunken px-1.5 text-2xs text-text",
			children: /* @__PURE__ */ R("span", {
				className: "truncate",
				children: e
			})
		}, t)), e.length > 2 && /* @__PURE__ */ z("span", {
			className: "shrink-0 text-2xs text-faint",
			children: ["+", e.length - 2]
		})]
	});
}
// admin/src/EntriesGrid.tsx
function Fe({ handle: e, items: t, ctx: n, media: r, excerpt: i, columns: a, visible: o, icon: s, loading: c, stale: l, selected: u, onSelect: d, cursor: f }) {
	return /* @__PURE__ */ R(te, {
		loading: c,
		stale: l,
		media: !!r,
		children: t.map((t) => /* @__PURE__ */ R(Ie, {
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
function Ie({ item: e, handle: t, ctx: n, media: r, excerpt: i, columns: a, visible: o, icon: s, selected: c, onSelect: l, active: u }) {
	let f = r ? je(e.values?.[r.handle]) : [], p = f[0] ? J(f[0], n) : null, m = !r && i && !a.some((e) => e.field?.handle === i.handle) ? Le(e.values?.[i.handle]) : "", h = a.filter((e) => e.id === "translations" || e.field && e.field.handle !== r?.handle);
	return /* @__PURE__ */ z(C, {
		recordId: e.id,
		title: e.title || /* @__PURE__ */ R("span", {
			className: "text-faint",
			children: d("Untitled")
		}),
		href: `/content/${t}/${e.id}`,
		icon: s,
		selected: c,
		active: u,
		onSelect: (t) => l([e.id], t),
		actions: /* @__PURE__ */ R(K, {
			item: e,
			handle: t
		}),
		image: r ? p ? /* @__PURE__ */ R("img", {
			src: p,
			alt: "",
			loading: "lazy",
			className: "absolute inset-0 size-full object-cover"
		}) : /* @__PURE__ */ R("div", {
			className: "grid size-full place-items-center text-faint",
			children: /* @__PURE__ */ R(E, {
				name: "image",
				size: 20
			})
		}) : void 0,
		footer: /* @__PURE__ */ z(be, { children: [o.has("status") && /* @__PURE__ */ R(k, { status: e.displayStatus }), /* @__PURE__ */ z("span", {
			className: "ml-auto flex min-w-0 items-center gap-1.5",
			children: [
				o.has("author") && (e.author ? /* @__PURE__ */ R(y, {
					name: e.author.name,
					initials: e.author.initials,
					src: e.author.avatar,
					size: 16
				}) : /* @__PURE__ */ R("span", {
					className: "text-2xs text-faint",
					children: e.authorId ? d("Unavailable person") : d("Unassigned")
				})),
				o.has("published") && /* @__PURE__ */ R("span", {
					"aria-label": d("Published"),
					children: /* @__PURE__ */ R(T, { iso: e.publishedAt })
				}),
				o.has("updated") && /* @__PURE__ */ R("span", {
					"aria-label": d("Updated"),
					children: /* @__PURE__ */ R(T, {
						iso: e.updatedAt,
						relative: !0
					})
				})
			]
		})] }),
		children: [
			o.has("uri") && e.uri && /* @__PURE__ */ R("span", {
				className: P("mt-0.5 truncate font-mono text-2xs text-faint", !r && "pl-[22px]"),
				children: e.uri
			}),
			m && /* @__PURE__ */ R("p", {
				className: "m-0 mt-1.5 line-clamp-3 pl-[22px] text-xs leading-relaxed text-muted",
				children: m
			}),
			h.length > 0 && /* @__PURE__ */ R("dl", {
				className: P("m-0 mt-2 space-y-1.5", !r && "pl-[22px]"),
				children: h.map((t) => /* @__PURE__ */ z("div", {
					className: "flex min-w-0 items-center justify-between gap-3 text-xs",
					children: [/* @__PURE__ */ R("dt", {
						className: "min-w-0 flex-1 truncate text-faint",
						children: t.label
					}), /* @__PURE__ */ R("dd", {
						className: "m-0 min-w-0 max-w-[65%] truncate",
						children: t.render(e, n)
					})]
				}, t.id))
			})
		]
	});
}
function Le(e) {
	return typeof e == "string" ? e.replace(/<[^>]+>/g, " ").replace(/[#>*_`~[\]()!-]+/g, " ").replace(/\s+/g, " ").trim() : "";
}
// admin/src/EntriesTable.tsx
var Re = 20;
function ze({ handle: e, columns: t, ctx: n, items: r, tree: i, loading: a, stale: o, selected: s, onSelect: c, sort: l, onSort: u, cursor: f }) {
	if (!i) return /* @__PURE__ */ R(w, {
		label: d("Entries"),
		items: r,
		rowKey: (e) => e.id,
		rowHref: (t) => `/content/${e}/${t.id}`,
		columns: [{
			id: "title",
			label: d("Title"),
			sort: "title",
			render: (e) => e.title || /* @__PURE__ */ R("span", {
				className: "text-faint",
				children: d("Untitled")
			})
		}, ...t.map((e) => ({
			...e,
			width: typeof e.width == "number" ? `${e.width}px` : e.width,
			render: (t) => e.render(t, n)
		}))],
		loading: a,
		stale: o,
		selection: {
			ids: s,
			onSelect: c
		},
		cursor: f,
		sort: l ? `${l.desc ? "-" : ""}${l.field}` : null,
		onSort: (e) => u(e.id === "title" ? {
			id: "title",
			label: d("Title"),
			width: 0,
			sort: "title",
			render: () => null
		} : t.find((t) => t.id === e.id)),
		actions: (t) => /* @__PURE__ */ R(K, {
			item: t,
			handle: e
		})
	});
	let p = Be(t, i), m = {
		id: "title",
		label: d("Title"),
		width: 0,
		sort: "title",
		render: () => null
	}, h = i ? Ve(r).map((e) => e.id) : r.map((e) => e.id), g = h.filter((e) => s.has(e)).length;
	return /* @__PURE__ */ z(A, {
		template: p,
		label: d("Entries"),
		busy: a || o,
		children: [/* @__PURE__ */ z(M, {
			header: !0,
			children: [
				/* @__PURE__ */ R("div", {
					role: "columnheader",
					className: "flex items-center",
					children: /* @__PURE__ */ R(S, {
						checked: h.length > 0 && g === h.length,
						indeterminate: g > 0 && g < h.length,
						label: /* @__PURE__ */ R("span", {
							className: "sr-only",
							children: d("Select All")
						}),
						onChange: (e) => c(h, e),
						disabled: a || h.length === 0
					})
				}),
				/* @__PURE__ */ R(Z, {
					column: m,
					sort: l,
					onSort: u
				}),
				t.map((e) => /* @__PURE__ */ R(Z, {
					column: e,
					sort: l,
					onSort: u
				}, e.id)),
				/* @__PURE__ */ R(j, {
					label: d("Actions"),
					hiddenLabel: !0
				})
			]
		}), a ? /* @__PURE__ */ R(He, { columns: t }) : /* @__PURE__ */ R("div", {
			className: P("transition-opacity duration-180", o && "opacity-60"),
			children: i ? /* @__PURE__ */ R(Ue, {
				handle: e,
				nodes: r,
				parentId: null,
				depth: 0,
				columns: t,
				ctx: n,
				selected: s,
				onSelect: c,
				cursor: f
			}) : r.map((r) => /* @__PURE__ */ R(Q, {
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
function Be(e, t) {
	return [
		`${t ? 28 : 16}px`,
		"minmax(200px,1fr)",
		...e.map((e) => typeof e.width == "number" ? `${e.width}px` : e.width),
		"52px"
	].join(" ");
}
function Ve(e) {
	return e.flatMap((e) => [e, ...Ve(e.children ?? [])]);
}
function Z({ column: e, sort: t, onSort: n }) {
	let r = t?.field === e.sort;
	return /* @__PURE__ */ R(j, {
		label: e.label,
		align: e.align,
		direction: r ? t.desc ? "descending" : "ascending" : void 0,
		onSort: e.sort ? () => n(e) : void 0
	});
}
function He({ columns: e }) {
	return /* @__PURE__ */ R("div", {
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
		].map((t, n) => /* @__PURE__ */ z(M, {
			className: "h-9",
			children: [
				/* @__PURE__ */ R(O, { className: "size-4 rounded-[4px]" }),
				/* @__PURE__ */ R("div", {
					style: { width: t },
					children: /* @__PURE__ */ R(O, { className: "h-3" })
				}),
				e.map((e) => /* @__PURE__ */ R(O, { className: "h-3 w-3/5" }, e.id)),
				/* @__PURE__ */ R("span", {})
			]
		}, n))
	});
}
function Q({ item: e, handle: n, columns: r, ctx: i, selected: a, onSelect: o, active: s, depth: c = 0, expander: l, dragHandle: u }) {
	return /* @__PURE__ */ z(M, {
		recordId: e.id,
		selected: a,
		className: P("h-9", s && "bg-hover"),
		children: [
			u,
			/* @__PURE__ */ R("div", {
				role: "cell",
				className: "relative z-10 flex items-center",
				children: /* @__PURE__ */ R(S, {
					checked: a,
					onChange: (t) => o([e.id], t),
					label: /* @__PURE__ */ R("span", {
						className: "sr-only",
						children: d("Select {name}", { name: e.title || d("Untitled") })
					})
				})
			}),
			/* @__PURE__ */ z("div", {
				role: "cell",
				className: "flex min-w-0 items-center",
				style: c ? { paddingLeft: c * Re } : void 0,
				children: [l, /* @__PURE__ */ R(t, {
					to: `/content/${n}/${e.id}`,
					className: "min-w-0 truncate text-sm font-medium text-text no-underline outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-focus",
					children: e.title || /* @__PURE__ */ R("span", {
						className: "text-faint",
						children: d("Untitled")
					})
				})]
			}),
			r.map((t) => /* @__PURE__ */ R("div", {
				role: "cell",
				"data-align": t.align,
				className: P("flex min-w-0 items-center", t.align === "end" && "justify-end"),
				children: t.render(e, i)
			}, t.id)),
			/* @__PURE__ */ R("div", {
				role: "cell",
				"data-table-actions": !0,
				className: "relative z-10 flex min-w-0 items-center justify-end [&>*]:shrink-0",
				children: /* @__PURE__ */ R(K, {
					item: e,
					handle: n,
					className: "opacity-0 transition-opacity duration-120 group-hover:opacity-100 group-focus-within:opacity-100"
				})
			})
		]
	});
}
function Ue(e) {
	let [t, n] = v({}), r = e.collapsed ?? t, a = e.setCollapsed ?? n, { handle: o, nodes: s, parentId: c, depth: u } = e, f = h().collections.find((e) => e.handle === o)?.can, p = s.every((e) => de(f, e).move), [m, g] = v(null), _ = m ?? s, y = H(Se(B, { activationConstraint: { distance: 4 } }));
	return /* @__PURE__ */ R(xe, {
		sensors: y,
		collisionDetection: V,
		onDragEnd: async (e) => {
			if (!p || !e.over || e.active.id === e.over.id) return;
			let t = _.map((e) => e.id), n = Ce(_, t.indexOf(String(e.active.id)), t.indexOf(String(e.over.id)));
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
		children: /* @__PURE__ */ R(U, {
			items: _.map((e) => e.id),
			strategy: Te,
			children: _.map((t) => {
				let n = t.children ?? [], i = !r[t.id];
				return /* @__PURE__ */ R(We, {
					id: t.id,
					disabled: !p,
					children: (s) => /* @__PURE__ */ z(be, { children: [/* @__PURE__ */ R(Q, {
						item: t,
						handle: o,
						columns: e.columns,
						ctx: e.ctx,
						selected: e.selected.has(t.id),
						onSelect: e.onSelect,
						active: e.cursor === t.id,
						depth: u,
						dragHandle: s,
						expander: n.length > 0 && /* @__PURE__ */ R("button", {
							type: "button",
							onClick: () => a((e) => ({
								...e,
								[t.id]: i
							})),
							className: "relative z-10 -ml-5 mr-0 grid size-5 shrink-0 -translate-x-0.5 place-items-center rounded-xs text-faint transition-colors duration-120 hover:bg-hover hover:text-text",
							"aria-expanded": i,
							"aria-label": d(i ? "Collapse" : "Expand"),
							children: /* @__PURE__ */ R(E, {
								name: "chevron-right",
								size: 12,
								className: P("transition-transform duration-120", i && "rotate-90")
							})
						})
					}), n.length > 0 && i && /* @__PURE__ */ R(Ue, {
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
function We({ id: e, children: t, disabled: n }) {
	let { attributes: r, listeners: i, setNodeRef: a, transform: o, transition: s, isDragging: c } = we({
		id: e,
		disabled: n
	}), l = /* @__PURE__ */ R("button", {
		type: "button",
		...r,
		...i,
		className: "absolute -left-6 top-1/2 z-10 grid h-6 w-5 -translate-y-1/2 cursor-grab place-items-center rounded-xs text-faint opacity-0 transition-opacity duration-120 hover:bg-hover hover:text-text focus-visible:opacity-100 group-hover:opacity-100 active:cursor-grabbing",
		"aria-label": d("Drag to Reorder"),
		children: /* @__PURE__ */ R(E, {
			name: "drag",
			size: 14
		})
	});
	return /* @__PURE__ */ R("div", {
		ref: a,
		style: {
			transform: Ee.Transform.toString(o),
			transition: s
		},
		className: P(c && "relative z-20 bg-bg shadow-pop"),
		children: t(n ? null : l)
	});
}
// admin/src/listPrefs.ts
var Ge = (e) => r().collections.find((t) => t.handle === e)?.defaultView ?? "table";
function $(e, t = Ge(e)) {
	return me(`entries.${e}`, t);
}
function Ke(e, t = Ge(e)) {
	return ye(`entries.${e}`, t);
}
// admin/src/EntriesList.tsx
function qe(e) {
	try {
		let t = new Intl.DisplayNames([e], { type: "language" }).of(e) ?? e;
		return t.charAt(0).toLocaleUpperCase(e) + t.slice(1);
	} catch {
		return e;
	}
}
function Je(e, t, n, r, i) {
	let a = e.collections.find((e) => e.handle === t), o = e.site.locales, s = o.includes(i.locale ?? "") ? i.locale : e.site.defaultLocale, c = i.q ?? "", l = i.status ?? "any", u = Number(i.page ?? 1), d = a?.structure === "tree", f = a?.structure === "dated", p = r.view, m = a ? q(a, n, o) : [], h = new Set(r.columns ?? (a ? Oe(a, n, p) : [])), g = m.filter((e) => h.has(e.id)), _ = [Qe(), ...m.filter((e) => e.sort)], v = r.sort && _.some((e) => e.sort === r.sort.replace(/^-/, "")) ? r.sort : null, y = d ? null : n?.sort ?? (f ? "-published_at" : "title"), b = !!c || l !== "any", x = d && !v && !b && p !== "calendar", S = [...new Set(g.filter((e) => e.field).map((e) => e.field.handle))].sort();
	return {
		all: m,
		shown: h,
		columns: g,
		sortable: _,
		sortKey: v,
		ownSort: y,
		isTree: d,
		view: p,
		showTree: x,
		filtered: b,
		fields: S,
		locale: s,
		input: {
			collection: t,
			locale: s,
			search: c || void 0,
			status: l,
			page: u,
			perPage: e.config?.content?.perPage ?? 50,
			sort: v ?? void 0,
			fields: S
		}
	};
}
async function Ye(e, t) {
	let n = r();
	if (!n.collections.some((t) => t.handle === e)) return;
	let i = Je(n, e, await c("collections/get", { handle: e }), $(e), t);
	if (i.view === "calendar") {
		let { dated: n, undated: r } = G(e, {
			locale: i.locale,
			status: t.status ?? "any",
			search: t.q || void 0
		}, t.month, $(e).calendarDate);
		await Promise.all([F({
			ability: "entries/list",
			input: n,
			perPage: 200
		}), F({
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
function Xe({ params: t }) {
	let r = t.collection, a = h(), { summary: c, collection: l, error: p, isLoading: y } = e(r), { query: b } = m(), [S, ee] = v(b.q ?? ""), C = b.status ?? "any", te = Number(b.page ?? 1), w = a.site.locales, T = w.includes(b.locale ?? "") ? b.locale : a.site.defaultLocale, D = de(c?.can), O = `/content/${r}/new${T === a.site.defaultLocale ? "" : `?locale=${T}`}`, [k, A] = Ke(r), [j, M] = v(/* @__PURE__ */ new Set()), [N, P] = v(!1), [fe, F] = v([]), [me, he] = v([]), { all: ge, shown: L, columns: ye, sortable: xe, sortKey: B, ownSort: V, isTree: Se, view: H, showTree: U, filtered: Ce, fields: we, input: Te } = _(() => Je(a, r, l, k, {
		...b,
		q: S
	}), [
		a,
		r,
		l,
		k,
		b,
		S
	]), Ee = B ? {
		field: B.replace(/^-/, ""),
		desc: B.startsWith("-")
	} : V ? {
		field: V.replace(/^-/, ""),
		desc: V.startsWith("-"),
		implicit: !0
	} : null, W = ke(l)[0], G = Ae(l), K = f("entries/list", Te, {
		enabled: !!c && !U && H !== "calendar",
		placeholderData: (e) => e
	}), q = f("entries/tree", {
		collection: r,
		locale: T,
		fields: we
	}, {
		enabled: !!c && U,
		placeholderData: (e) => e
	}), Oe = U ? q.data ?? [] : K.data?.items ?? [], J = U ? Ve(Oe) : Oe, Y = U ? q.isLoading : K.isLoading, X = U ? q.isPlaceholderData : K.isPlaceholderData, Me = p ?? (U ? q.error : K.error), Ne = () => {
		p && i("collections/get"), U ? q.refetch() : K.refetch();
	}, Pe = U ? J.length : K.data?.total ?? 0, Ie = [...ye.filter((e) => e.field?.type === "media").map((e) => e.field.handle), ...H === "grid" && W ? [W.handle] : []], Le = [...new Set(J.flatMap((e) => Ie.flatMap((t) => je(e.values?.[t]))))].filter((e) => /^[0-9a-z]{26}$/i.test(e)), Re = f("media/lookup", { ids: Le }, {
		enabled: Le.length > 0 && a.fieldTypes.some((e) => e.key === "media"),
		staleTime: 3e5,
		placeholderData: (e) => e
	}), Be = _(() => ({
		media: new Map((Re.data?.items ?? []).map((e) => [e.id.toLowerCase(), e])),
		locales: w
	}), [Re.data, w]);
	g(() => ee(b.q ?? ""), [r]), g(() => {
		M(/* @__PURE__ */ new Set()), F([]);
	}, [
		r,
		te,
		C,
		S,
		T,
		B,
		H
	]);
	let Z = (e, t) => M((n) => {
		let r = new Set(n);
		for (let n of e) t ? r.add(n) : r.delete(n);
		return r;
	});
	ve("c", () => D.create && o(O));
	let He = _e({
		resetKey: `${r}:${te}:${C}:${S}:${T}:${B}`,
		selection: {
			ids: j,
			onSelect: Z
		},
		onOpen: (e) => o(`/content/${r}/${e}`)
	});
	if (!c) return /* @__PURE__ */ R(oe, {
		crumbs: [{ label: d("Not Found") }],
		children: /* @__PURE__ */ R(ne, {
			icon: "collection",
			title: d("Collection not found"),
			description: d("It may have been removed, or you lack access.")
		})
	});
	let Q = (e) => {
		A({ sort: e }), u({ page: null });
	}, Ue = (e) => Q(pe(e.sort, B, e.descFirst, V)), We = async (e) => {
		if (N || X || !j.size || (e === "entries/delete" ? !D.delete : !D.publish)) return;
		let t = [...j], r = H === "calendar" ? me : J;
		if (t.some((e) => !r.some((t) => t.id === e))) {
			I.error(d("The selection changed. Refresh and select the entries again."));
			return;
		}
		let a = t.length;
		if ((e !== "entries/delete" || await ue({
			title: s(a, "Delete {count} entry?", "Delete {count} entries?"),
			description: d("This cannot be undone."),
			confirm: d("Delete"),
			danger: !0
		})) && !N) {
			P(!0), F([]);
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
				})) : e === "entries/publish" ? I.success(s(a, "Published {count} entry", "Published {count} entries")) : e === "entries/unpublish" ? I.success(s(a, "Unpublished {count} entry", "Unpublished {count} entries")) : I.success(s(a, "Deleted {count} entry", "Deleted {count} entries")), F(o), M(new Set(o.map((e) => e.id))), i("entries/", "content/");
			} catch (e) {
				I.error(e);
			} finally {
				P(!1);
			}
		}
	}, Ge = () => {
		ee(""), u({
			q: null,
			status: null,
			page: null
		});
	}, $ = B ? xe.find((e) => e.sort === B.replace(/^-/, "")) : void 0, Ye = !Y && !y && !Me && J.length === 0, Xe = (e) => D.create && /* @__PURE__ */ R(x, {
		variant: "primary",
		icon: "plus",
		onClick: () => o(O),
		title: e ? d("New (C)") : void 0,
		children: c.newLabel
	});
	return /* @__PURE__ */ z(oe, {
		width: "wide",
		crumbs: [{
			label: /* @__PURE__ */ R(Ze, {
				title: c.title,
				count: Y || H === "calendar" ? null : Pe
			}),
			icon: c.icon
		}],
		actions: Xe(!0),
		children: [
			/* @__PURE__ */ z("div", {
				className: "mb-3 flex flex-wrap items-center gap-x-2 gap-y-2",
				children: [/* @__PURE__ */ R(re, {
					bare: !0,
					layout: "inline",
					className: "flex min-w-0 flex-1 flex-wrap items-center gap-2",
					fields: [
						{
							handle: "q",
							type: "text",
							label: d("Search"),
							icon: "search",
							size: "sm",
							className: "min-w-36 max-w-64 flex-1",
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
								title: qe(e)
							}))
						}] : []
					],
					values: {
						q: S,
						status: C,
						locale: T
					},
					onChange: (e, t) => {
						e === "q" ? (ee(t ?? ""), u({
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
				}), /* @__PURE__ */ R(ae, {
					view: H,
					all: ge,
					shown: L,
					sortable: xe,
					sortKey: B,
					isTree: Se,
					onColumns: (e) => A({ columns: e }),
					onSort: Q,
					onView: (e) => A({ view: e }),
					calendarDate: k.calendarDate,
					onCalendarDate: (e) => A({ calendarDate: e }),
					onReset: () => {
						A({
							view: null,
							sort: null,
							columns: null,
							calendarDate: "published"
						}), u({
							page: null,
							month: null
						});
					},
					children: $ && H !== "calendar" && /* @__PURE__ */ z("span", {
						className: "inline-flex h-6 items-center gap-1 rounded-sm bg-sunken pl-2 pr-0.5 text-xs text-muted",
						title: d("Sorted by {column}", { column: $.label }),
						children: [
							/* @__PURE__ */ R(E, {
								name: B.startsWith("-") ? "arrow-down" : "arrow-up",
								size: 11
							}),
							/* @__PURE__ */ R("span", {
								className: "max-w-32 truncate",
								children: $.label
							}),
							Se ? /* @__PURE__ */ R(x, {
								size: "xs",
								variant: "ghost",
								icon: "list-tree",
								className: "ml-1 h-5 px-1.5",
								onClick: () => Q(null),
								children: d("Show Tree")
							}) : /* @__PURE__ */ R(ie, {
								icon: "close",
								label: d("Reset Sort"),
								size: "xs",
								className: "size-5",
								onClick: () => Q(null)
							})
						]
					})
				})]
			}),
			Me && H !== "calendar" && /* @__PURE__ */ R(ce, {
				message: `${d("Couldn’t load entries.")} ${Me.message}`,
				onRetry: Ne
			}),
			fe.length > 0 && /* @__PURE__ */ z("div", {
				role: "alert",
				className: "border-y border-warning/30 px-3 py-3 text-sm text-muted",
				children: [/* @__PURE__ */ R("p", {
					className: "m-0",
					children: d("Failed entries remain selected. Retry the action for these entries.")
				}), /* @__PURE__ */ R("ul", {
					className: "mb-0 mt-2 space-y-1 pl-4",
					children: fe.map((e) => /* @__PURE__ */ z("li", { children: [
						/* @__PURE__ */ R("span", {
							className: "font-medium text-text",
							children: e.title
						}),
						": ",
						e.message
					] }, e.id))
				})]
			}),
			H === "calendar" ? /* @__PURE__ */ R(De, {
				onItems: he,
				handle: r,
				filters: {
					locale: T,
					status: C,
					search: S || void 0
				},
				dateField: k.calendarDate,
				selection: {
					ids: j,
					onSelect: Z
				},
				cursor: He
			}) : Ye ? /* @__PURE__ */ R("div", {
				className: "border-y border-border",
				children: Ce ? /* @__PURE__ */ R(ne, {
					icon: "search",
					title: d("No matches"),
					description: d("Nothing matches these filters."),
					action: /* @__PURE__ */ R(x, {
						onClick: Ge,
						children: d("Clear Filters")
					})
				}) : /* @__PURE__ */ R(ne, {
					icon: c.icon,
					title: d("No {items} yet", { items: c.title.toLowerCase() }),
					action: Xe(!1)
				})
			}) : H === "grid" ? /* @__PURE__ */ R(Fe, {
				handle: r,
				items: J,
				ctx: Be,
				media: W && L.has(`field:${W.handle}`) ? W : void 0,
				excerpt: G && L.has(`field:${G.handle}`) ? G : void 0,
				columns: ye,
				visible: L,
				icon: c.icon,
				loading: Y || y,
				stale: X,
				selected: j,
				onSelect: Z,
				cursor: He
			}) : /* @__PURE__ */ R(ze, {
				handle: r,
				columns: ye,
				ctx: Be,
				items: Oe,
				tree: U,
				loading: Y || y,
				stale: X,
				selected: j,
				onSelect: Z,
				sort: Ee,
				onSort: Ue,
				cursor: He
			}),
			!U && H !== "calendar" && K.data && /* @__PURE__ */ R(se, {
				page: K.data.page,
				pages: K.data.pages,
				total: K.data.total,
				perPage: K.data.perPage ?? 50,
				onPage: (e) => u({ page: e > 1 ? e : null })
			}),
			/* @__PURE__ */ z(le, {
				count: j.size,
				onClear: () => M(/* @__PURE__ */ new Set()),
				children: [D.publish && /* @__PURE__ */ z(be, { children: [/* @__PURE__ */ R(x, {
					size: "sm",
					variant: "ghost",
					disabled: N || X,
					onClick: () => We("entries/publish"),
					children: d("Publish")
				}), /* @__PURE__ */ R(x, {
					size: "sm",
					variant: "ghost",
					disabled: N || X,
					onClick: () => We("entries/unpublish"),
					children: d("Unpublish")
				})] }), D.delete && /* @__PURE__ */ R(x, {
					size: "sm",
					variant: "ghost",
					disabled: N || X,
					onClick: () => We("entries/delete"),
					children: d("Delete")
				})]
			})
		]
	});
}
function Ze({ title: e, count: t }) {
	return /* @__PURE__ */ z(be, { children: [e, t !== null && /* @__PURE__ */ R("span", {
		className: "ml-0.5 font-normal tabular-nums text-faint",
		title: s(t, "{count} entry", "{count} entries"),
		children: t.toLocaleString(a())
	})] });
}
function Qe() {
	return {
		id: "title",
		label: d("Title"),
		width: 0,
		sort: "title",
		render: () => null
	};
}
export { Xe as default, qe as languageName, Ye as loadEntriesList };
