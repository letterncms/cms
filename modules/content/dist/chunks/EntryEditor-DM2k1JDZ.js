import { t as e } from "./useCollection-DPy1gAYR.js";
import { blockNavigation as t, events as n, invalidate as r, locale as i, navigate as a, panelsFor as o, plural as s, registry as c, run as l, t as u, timeAgo as d, useAbility as f, useConfig as p, useLocation as m, useManifest as h, useScreenContext as g } from "@letterncms/sdk";
import { Suspense as _, useEffect as v, useRef as y, useState as b, useSyncExternalStore as x } from "react";
import { Button as S, Dialog as C, EmptyState as ee, Field as te, Fields as w, Icon as T, IconButton as ne, InspectorPanel as re, Menu as ie, Page as E, PersonPicker as D, QueryError as O, Spinner as k, StatusDot as ae, Tabs as oe, Tooltip as se, Topbar as ce, cn as le, confirm as ue, entryActionAvailability as de, fieldControlId as fe, slugify as A, toast as pe, useShortcut as me, useWideInspector as he } from "@letterncms/ui";
import { Fragment as j, jsx as M, jsxs as N } from "react/jsx-runtime";
// admin/src/entrySession.ts
var P = (e) => ({
	title: e.title,
	slug: e.slug,
	data: e.data,
	authorId: e.authorId
}), F = (e, t) => e.title === t.title && e.slug === t.slug && e.authorId === t.authorId && JSON.stringify(e.data) === JSON.stringify(t.data), I = class {
	state;
	listeners = /* @__PURE__ */ new Set();
	queue = Promise.resolve();
	edit = 0;
	disposed = !1;
	persist;
	constructor(e, t, n) {
		this.persist = n, this.state = {
			entry: e,
			working: t,
			dirty: !1,
			phase: "idle",
			error: null,
			errors: {},
			conflict: null
		};
	}
	get = () => this.state;
	subscribe = (e) => (this.listeners.add(e), () => {
		this.listeners.delete(e);
	});
	emit(e) {
		this.state = {
			...this.state,
			...e
		}, this.disposed || this.listeners.forEach((e) => e());
	}
	update(e) {
		this.edit++;
		let t = {
			...this.state.working,
			...e
		}, n = !this.state.entry || !F(t, P(this.state.entry));
		this.emit({
			working: t,
			dirty: n,
			phase: this.state.phase === "saving" ? "saving" : this.state.error ? "error" : "idle"
		});
	}
	enqueue(e) {
		let t = this.queue.then(e);
		return this.queue = t.catch(() => {}), t;
	}
	fail(e) {
		let t = e instanceof Error ? e : Error(String(e));
		this.emit({
			phase: "error",
			error: t,
			errors: t.type === "invalid_input" ? t.details ?? {} : {},
			conflict: t.type === "conflict" ? {
				message: t.message,
				version: t.details?.version
			} : null
		});
	}
	save(e = {}) {
		return this.enqueue(async () => {
			if (this.state.conflict && !e.expectedVersion) throw this.state.error;
			if (!this.state.dirty && !e.publish) return this.state.entry;
			let { entry: t, working: n } = this.state;
			if (!n.title.trim()) return this.emit({ errors: { title: "A title is required." } }), null;
			let r = this.edit;
			this.emit({
				phase: "saving",
				error: null
			});
			try {
				let i = await this.persist(t, n, e);
				return this.emit({
					entry: i,
					working: r === this.edit ? P(i) : this.state.working,
					dirty: r !== this.edit,
					phase: "saved",
					error: null,
					errors: {},
					conflict: null
				}), i;
			} catch (e) {
				throw this.fail(e), e;
			}
		});
	}
	command(e) {
		return this.enqueue(async () => {
			if (!this.state.entry) return null;
			let t = this.edit;
			this.emit({
				phase: "saving",
				error: null
			});
			try {
				let n = await e(this.state.entry);
				return this.emit({
					entry: n,
					working: t === this.edit ? P(n) : this.state.working,
					dirty: t !== this.edit,
					phase: "saved",
					error: null,
					errors: {},
					conflict: null
				}), n;
			} catch (e) {
				throw this.fail(e), e;
			}
		});
	}
	reset(e = this.state.entry) {
		this.edit++, this.emit({
			entry: e,
			...e ? { working: P(e) } : {},
			dirty: !1,
			phase: "idle",
			error: null,
			errors: {},
			conflict: null
		});
	}
	dispose() {
		this.disposed = !0, this.listeners.clear();
	}
};
// admin/src/useEntrySession.ts
function ge(e, n, i, a, o, s) {
	let c = y(!0), d = y(window.location.pathname);
	v(() => (c.current = !0, () => {
		c.current = !1;
	}), []);
	let [f] = b(() => new I(e, n, async (e, t, n) => {
		let o = e && !s.edit && n.publish ? await l("entries/publish", {
			id: e.id,
			...n.at ? { at: n.at } : {},
			expectedVersion: n.expectedVersion ?? e.version
		}) : e ? await l("entries/update", {
			id: e.id,
			...t,
			publish: !!n.publish,
			...n.at ? { at: n.at } : {},
			expectedVersion: n.expectedVersion ?? e.version
		}) : await l("entries/create", {
			collection: i,
			locale: a,
			...t,
			slug: t.slug || void 0,
			status: n.publish ? "published" : "draft",
			...n.at ? { at: n.at } : {}
		});
		return !e && c.current && window.location.pathname === d.current && window.history.replaceState(null, "", `${window.__CMS__.base}/content/${i}/${o.id}${a ? `?locale=${encodeURIComponent(a)}` : ""}`), r("entries/", "content/", "collections/overview"), o;
	})), p = x(f.subscribe, f.get), m = p.entry ? s.edit : s.create, h = y(void 0), g = () => clearTimeout(h.current);
	v(() => (g(), m && o > 0 && p.dirty && p.phase !== "saving" && !p.error && !p.conflict && p.working.title.trim() && (h.current = setTimeout(() => void f.save().catch(() => {}), o)), g), [
		f,
		p,
		o,
		m
	]), v(() => t(() => f.get().dirty || f.get().phase === "saving" ? u("You have unsaved changes. Leave anyway?") : null), [f]), v(() => {
		let e = (e) => {
			(f.get().dirty || f.get().phase === "saving") && e.preventDefault();
		};
		return window.addEventListener("beforeunload", e), () => window.removeEventListener("beforeunload", e);
	}, [f]);
	let _ = (e = {}) => (g(), m || e.publish ? f.save(e) : Promise.resolve(p.entry));
	return {
		...p,
		session: f,
		editable: m,
		save: _,
		update: (e) => {
			m && f.update(e);
		},
		cancel: g
	};
}
// admin/src/entryFields.ts
function _e(e, t, n) {
	let r = /* @__PURE__ */ new Map(), i = null;
	for (let e of n) for (let t of e.fieldHandles ?? []) r.has(t) && (i = `Field “${t}” is claimed by both “${r.get(t)}” and “${e.id}”.`), r.set(t, e.id);
	let a = e.filter((e) => e.handle !== t && !r.has(e.handle));
	return {
		error: i,
		document: a.filter((e) => (e.section ?? "main") === "main"),
		sidebar: a.filter((e) => (e.section ?? "main") !== "main"),
		claimed: r
	};
}
// admin/src/EntryDetails.tsx
function L(e, t, n) {
	return t?.uri ? t.uri === "/" ? "/" : t.uri.replace(/[^/]+$/, n || t.slug) : (e.route ?? "/{slug}").replace("{parent_uri}/", "").replace("{slug}", n || "…").replace(/\{[a-z_]+\}/g, "…").replace(/\/+/g, "/");
}
function ve({ props: e, working: t, fields: n, titleInDetails: r, update: a, onPublishing: o, onMoving: s }) {
	let { entry: c, collection: l, editable: d, errors: p } = e, m = h(), g = de(e.can, c), _ = f("entries/lookup", { ids: c?.parentId ? [c.parentId] : [] }, { enabled: !!c?.parentId }), v = (e) => e ? new Intl.DateTimeFormat(i(), {
		dateStyle: "medium",
		timeStyle: "short",
		timeZone: m.site.timezone
	}).format(new Date(e)) : u("Unknown"), y = (e) => e.section === "sidebar" ? "main" : e.section ?? "main", b = [...new Set(n.map(y))], x = c?.displayStatus ?? "draft", C = {
		draft: "Draft",
		changed: "Changes",
		published: "Published",
		scheduled: "Scheduled"
	};
	return /* @__PURE__ */ N("div", {
		className: "space-y-5 p-4",
		children: [
			/* @__PURE__ */ N("section", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ M("div", {
						className: "cms-caps",
						children: u("Identity")
					}),
					/* @__PURE__ */ M(w, {
						fields: [...r ? [{
							handle: "title",
							type: "text",
							label: u("Title")
						}] : [], l.route ? {
							handle: "slug",
							type: "slug",
							label: u("URL"),
							component: "uri",
							uri: L(l, c, t.slug)
						} : {
							handle: "slug",
							type: "text",
							label: u("Handle"),
							mono: !0,
							max: 180
						}],
						values: {
							title: t.title,
							slug: t.slug || A(t.title)
						},
						onChange: (e, t) => a({ [e]: t ?? "" }),
						errors: p,
						disabled: !d
					}),
					/* @__PURE__ */ M(te, {
						label: u("Author"),
						htmlFor: "f-authorId",
						error: p.authorId,
						children: /* @__PURE__ */ M(D, {
							id: "f-authorId",
							"aria-describedby": p.authorId ? "f-authorId-error" : void 0,
							value: t.authorId ? [t.authorId] : [],
							max: 1,
							disabled: !d,
							label: u("Assign author"),
							onChange: (e) => a({ authorId: e[0] ?? null })
						})
					})
				]
			}),
			b.map((r) => /* @__PURE__ */ N("section", {
				className: "space-y-3 border-t border-border pt-4",
				children: [/* @__PURE__ */ M("div", {
					className: "cms-caps",
					children: r === "main" || r === "sidebar" ? u("Properties") : r.replace(/[_-]/g, " ")
				}), /* @__PURE__ */ M(w, {
					fields: n.filter((e) => y(e) === r).map((e) => ({
						...e,
						width: "full"
					})),
					values: t.data,
					onChange: e.setValue,
					errors: p,
					disabled: !d,
					context: {
						entry: c ?? void 0,
						collection: l.handle,
						locale: c?.locale ?? m.site.defaultLocale
					}
				})]
			}, r)),
			/* @__PURE__ */ N("section", {
				className: "space-y-3 border-t border-border pt-4",
				children: [
					/* @__PURE__ */ M("div", {
						className: "cms-caps",
						children: u("Publishing")
					}),
					/* @__PURE__ */ N("div", {
						className: "grid justify-items-start gap-2",
						children: [
							/* @__PURE__ */ M(ae, {
								status: x,
								label: u(C[x])
							}),
							c?.publishedAt && /* @__PURE__ */ N("time", {
								dateTime: c.publishedAt,
								className: "text-xs leading-5 text-muted",
								children: [
									v(c.publishedAt),
									" · ",
									m.site.timezone
								]
							}),
							g.publish && /* @__PURE__ */ M(S, {
								size: "xs",
								disabled: !t.title.trim(),
								onClick: o,
								children: c?.displayStatus === "scheduled" ? u("Change schedule") : u("Publication date…")
							})
						]
					}),
					c?.hasDraft && /* @__PURE__ */ M("p", {
						className: "m-0 text-xs text-muted",
						children: u("Unpublished changes are saved separately from the published version.")
					})
				]
			}),
			/* @__PURE__ */ N("section", {
				className: "space-y-2 border-t border-border pt-4",
				children: [
					/* @__PURE__ */ M("div", {
						className: "cms-caps",
						children: u("Record")
					}),
					c && l.structure === "tree" && /* @__PURE__ */ N("div", {
						className: "flex items-center gap-2 text-xs",
						children: [
							/* @__PURE__ */ M("span", {
								className: "text-muted",
								children: u("Parent")
							}),
							/* @__PURE__ */ M("span", {
								className: "min-w-0 flex-1 truncate",
								children: c.parentId ? _.data?.[0]?.title ?? (_.isLoading ? u("Loading…") : _.isError ? u("Unknown") : u("Unavailable parent")) : u("Root")
							}),
							g.move && /* @__PURE__ */ M(S, {
								size: "xs",
								onClick: s,
								children: u("Move")
							})
						]
					}),
					c?.parentId && _.isError && /* @__PURE__ */ M(O, {
						message: _.error.message,
						onRetry: () => void _.refetch(),
						compact: !0
					}),
					/* @__PURE__ */ N("dl", {
						className: "m-0 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-2 text-xs",
						children: [
							/* @__PURE__ */ M("dt", {
								className: "text-muted",
								children: u("Collection")
							}),
							/* @__PURE__ */ M("dd", {
								className: "m-0 break-words",
								children: l.title
							}),
							/* @__PURE__ */ M("dt", {
								className: "text-muted",
								children: u("Language")
							}),
							/* @__PURE__ */ M("dd", {
								className: "m-0",
								children: c?.locale ?? m.site.defaultLocale
							}),
							/* @__PURE__ */ M("dt", {
								className: "text-muted",
								children: u("Created")
							}),
							/* @__PURE__ */ M("dd", {
								className: "m-0",
								children: v(c?.createdAt)
							}),
							/* @__PURE__ */ M("dt", {
								className: "text-muted",
								children: u("Updated")
							}),
							/* @__PURE__ */ M("dd", {
								className: "m-0",
								children: v(c?.updatedAt)
							}),
							c && /* @__PURE__ */ N(j, { children: [/* @__PURE__ */ M("dt", {
								className: "text-muted",
								children: u("ID")
							}), /* @__PURE__ */ M("dd", {
								className: "m-0 break-all font-mono text-faint",
								children: c.id
							})] })
						]
					})
				]
			})
		]
	});
}
function ye({ entry: e, busy: t, onClose: n, onPublish: r }) {
	let i = h(), [a, o] = b(e?.publishedAt ?? null), [s, c] = b(), l = e?.status === "published" && e.displayStatus !== "scheduled", d = !!a && new Date(a).getTime() > Date.now();
	return /* @__PURE__ */ M(C, {
		open: !0,
		onOpenChange: (e) => !e && !t && n(),
		title: u("Publication date"),
		description: u(l ? "Publish changes immediately. Future scheduling is available for unpublished entries." : "Choose when this saved version becomes public."),
		footer: /* @__PURE__ */ N(j, { children: [/* @__PURE__ */ M(S, {
			disabled: t,
			onClick: n,
			children: u("Cancel")
		}), /* @__PURE__ */ M(S, {
			variant: "publish",
			loading: t,
			onClick: async () => {
				!a || !Number.isFinite(new Date(a).getTime()) ? c(u("Choose a publication date and time.")) : l && d ? c(u("Unpublish this entry before scheduling it for a future date.")) : await r(a) && n();
			},
			children: u(d && !l ? "Schedule" : "Publish")
		})] }),
		children: /* @__PURE__ */ M(w, {
			fields: [{
				handle: "at",
				type: "date",
				time: !0,
				timezone: i.site.timezone,
				label: u("Date and time"),
				required: !0
			}],
			values: { at: a },
			onChange: (e, t) => {
				o(t), c(void 0);
			},
			errors: s ? { at: s } : {},
			disabled: t
		})
	});
}
// admin/src/EntryHistory.tsx
function be({ entry: e, editable: t, onRestore: n }) {
	let r = f("entries/revisions", { id: e?.id ?? "" }, { enabled: !!e });
	if (!e) return /* @__PURE__ */ M("p", {
		className: "m-0 p-4 text-sm text-faint",
		children: u("History starts after the first save.")
	});
	if (r.isLoading) return /* @__PURE__ */ M("div", {
		className: "grid place-items-center p-6 text-faint",
		children: /* @__PURE__ */ M(k, {})
	});
	if (r.isError && !r.data) return /* @__PURE__ */ M(O, {
		message: r.error.message,
		onRetry: () => void r.refetch()
	});
	let a = {
		create: u("Created"),
		save: u("Edited"),
		publish: u("Published"),
		unpublish: u("Unpublished"),
		restore: u("Restored"),
		discard: u("Discarded changes"),
		move: u("Moved")
	};
	return /* @__PURE__ */ N(j, { children: [
		r.isError && /* @__PURE__ */ M(O, {
			message: r.error.message,
			onRetry: () => void r.refetch(),
			compact: !0
		}),
		r.data?.length === 0 && /* @__PURE__ */ M("p", {
			className: "p-4 text-sm text-muted",
			children: u("No history available.")
		}),
		/* @__PURE__ */ M("ol", {
			className: "m-0 list-none p-2",
			children: (r.data ?? []).map((e, r) => /* @__PURE__ */ N("li", {
				className: "group flex items-start gap-3 rounded-sm px-2 py-2 hover:bg-surface",
				children: [
					/* @__PURE__ */ M("span", { className: le("mt-1.5 size-2 shrink-0 rounded-full", e.action === "publish" ? "bg-success" : "bg-border-strong") }),
					/* @__PURE__ */ N("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ N("div", {
							className: "text-sm text-text",
							children: [a[e.action] ?? e.action, /* @__PURE__ */ N("span", {
								className: "text-muted",
								children: [" · ", e.user?.name ?? u("System")]
							})]
						}), /* @__PURE__ */ N("div", {
							className: "truncate text-xs text-faint",
							title: new Date(e.createdAt).toLocaleString(i(), {
								dateStyle: "medium",
								timeStyle: "short"
							}),
							children: [
								d(e.createdAt),
								" · ",
								e.title
							]
						})]
					}),
					r > 0 && t && /* @__PURE__ */ M(S, {
						size: "xs",
						variant: "ghost",
						onClick: () => n(e.id),
						children: u("Restore")
					})
				]
			}, e.id))
		})
	] });
}
// admin/src/EntryMoveDialog.tsx
function R(e, t, n = []) {
	return e.flatMap((e) => {
		if (e.id === t) return [];
		let r = [...n, e.title || u("Untitled")];
		return [{
			value: e.id,
			label: r.join(" / ")
		}, ...R(e.children ?? [], t, r)];
	});
}
function xe({ entry: e, collection: t, busy: n, onClose: r, onMove: i }) {
	let a = f("entries/tree", {
		collection: t.handle,
		locale: e.locale
	}, { refetchOnWindowFocus: !1 }), [o, s] = b(e.parentId), [c, l] = b(null), [d, p] = b(!1), m = y(!1), h = [{
		value: "",
		label: u("Root")
	}, ...R(a.data ?? [], e.id)], g = o === null || h.some((e) => e.value === o), _ = !!a.data && !a.isError, v = n || d, x = c ?? (_ && !g ? u("This parent is no longer available. Choose another parent.") : void 0);
	return /* @__PURE__ */ N(C, {
		open: !0,
		title: u("Move {type}", { type: t.singular }),
		description: u("Choose a new parent for “{title}”.", { title: e.title }),
		onOpenChange: (e) => {
			!e && !v && r();
		},
		footer: /* @__PURE__ */ N(j, { children: [/* @__PURE__ */ M(S, {
			disabled: v,
			onClick: r,
			children: u("Cancel")
		}), /* @__PURE__ */ M(S, {
			variant: "primary",
			loading: v,
			disabled: !_ || !g || o === e.parentId,
			onClick: async () => {
				if (!m.current && !v && _ && g && o !== e.parentId) {
					m.current = !0, p(!0), l(null);
					try {
						await i(o) ? r() : l(u("Could not move this entry. Try again."));
					} catch (e) {
						l(e instanceof Error ? e.message : u("Could not move this entry. Try again."));
					} finally {
						p(!1), m.current = !1;
					}
				}
			},
			children: u("Move")
		})] }),
		children: [a.isLoading || !a.data && a.isFetching ? /* @__PURE__ */ N("div", {
			role: "status",
			className: "flex items-center gap-2 py-4 text-sm text-muted",
			children: [/* @__PURE__ */ M(k, { size: 14 }), u("Loading available parents…")]
		}) : /* @__PURE__ */ N(j, { children: [a.isError && /* @__PURE__ */ M(O, {
			message: a.error.message,
			onRetry: () => void a.refetch()
		}), a.data && /* @__PURE__ */ M(w, {
			fields: [{
				handle: "parentId",
				type: "select",
				label: u("Parent"),
				required: !0,
				options: g ? h : [...h, {
					value: o,
					label: u("Unavailable parent")
				}],
				instructions: u("Choose Root to place this entry at the top level.")
			}],
			values: { parentId: o ?? "" },
			onChange: (e, t) => {
				s(t || null), l(null);
			},
			errors: x ? { parentId: x } : {},
			disabled: v || a.isError
		})] }), /* @__PURE__ */ N("div", {
			className: "mt-4 space-y-2 text-xs text-muted",
			children: [e.uri && /* @__PURE__ */ M("p", {
				className: "m-0",
				children: u("Moving a published entry can change its live URL and the URLs of its descendants.")
			}), /* @__PURE__ */ M("p", {
				className: "m-0",
				children: u("Saved unpublished changes stay in the working copy. Moving does not publish them.")
			})]
		})]
	});
}
// admin/src/EntryEditor.tsx
function Se({ params: t }) {
	let { collection: n, summary: i, isLoading: o, error: s } = e(t.collection), c = t.id === "new", l = z(t.id, c), d = () => {
		l.refetch(), r("collections/get");
	};
	if (o || !c && l.isLoading) return /* @__PURE__ */ N("div", {
		className: "flex h-full flex-col",
		children: [/* @__PURE__ */ M(ce, { crumbs: [{
			label: i?.title ?? "…",
			to: `/content/${t.collection}`
		}] }), /* @__PURE__ */ M("div", {
			className: "grid flex-1 place-items-center",
			children: /* @__PURE__ */ M(k, {})
		})]
	});
	let f = s ?? l.error;
	return (!n || !c && !l.data) && f && !["not_found", "forbidden"].includes(f.type) ? /* @__PURE__ */ M(E, {
		crumbs: [{ label: u("Content") }],
		children: /* @__PURE__ */ M(O, {
			message: f.message,
			onRetry: d
		})
	}) : !n || !i || !c && !l.data ? /* @__PURE__ */ M(E, {
		crumbs: [{ label: u("Content") }],
		children: /* @__PURE__ */ M(ee, {
			icon: "file",
			title: f?.type === "forbidden" ? u("Access denied") : u("Entry not found"),
			description: f?.message ?? u("It may have been deleted."),
			action: /* @__PURE__ */ M(S, {
				onClick: () => a(`/content/${t.collection}`),
				children: u("Go Back")
			})
		})
	}) : /* @__PURE__ */ M(B, {
		collection: n,
		initial: c ? null : l.data,
		can: i.can,
		loadError: f?.message,
		retryLoad: d
	}, `${t.collection}:${t.id}`);
}
function z(e, t) {
	return f("entries/get", { id: e }, {
		enabled: !t,
		refetchOnWindowFocus: !1
	});
}
function B({ collection: e, initial: t, can: i, loadError: s, retryLoad: d }) {
	let f = h(), { query: C } = m(), te = p("content").autosave ?? 1200, T = t?.locale ?? (f.site.locales.includes(C.locale ?? "") ? C.locale : f.site.defaultLocale), E = `/content/${e.handle}${T === f.site.defaultLocale ? "" : `?locale=${T}`}`, D = ge(t, {
		title: t?.title ?? "",
		slug: t?.slug ?? "",
		authorId: t ? t.authorId : f.user.id,
		data: t?.data ?? Object.fromEntries(e.resolvedFields.map((e) => [e.handle, e.default ?? null]))
	}, e.handle, T, te, i), A = D.editable, { entry: P, working: F, dirty: I, phase: L, errors: R, conflict: Se, update: z, session: B } = D, V = de(i, P), Oe = he(), [H, U] = b(() => Oe), [ke, Ae] = b(null), [je, Me] = b(!1), Ne = `cms.entry.panel.${e.handle}`, [Pe, Fe] = b(() => localStorage.getItem(Ne) || "details"), [Ie, Le] = b(!1), [Re, ze] = b(!1), [Be, W] = b(!1), G = y(() => D.save()), Ve = y({});
	x(c.panels.subscribe, c.panels.version);
	let K = L === "saving";
	g({
		kind: "entry",
		icon: e.icon,
		rightEdge: !0,
		data: () => {
			let { entry: t, working: n, dirty: r } = B.get();
			return {
				collection: e.handle,
				id: t?.id ?? null,
				status: t?.displayStatus ?? "draft",
				unsaved: r,
				title: n.title,
				slug: n.slug,
				url: t?.uri ?? null,
				locale: T,
				fields: n.data
			};
		},
		flush: async () => {
			let e = B.get();
			A && e.dirty && e.working.title.trim() && await D.save().catch(() => {});
		}
	}), v(() => n.on("content.changed", () => {
		let e = B.get().entry?.id;
		e && l("entries/get", { id: e }).then((e) => {
			let t = B.get();
			t.dirty || t.phase === "saving" || e.version === t.entry?.version || B.command(async () => e);
		}).catch(() => {});
	}), [B]);
	let q = (e, t) => {
		z({ data: {
			...B.get().working.data,
			[e]: t
		} });
	}, J = async (e) => {
		try {
			return await e();
		} catch (e) {
			pe.error(e);
			return;
		}
	}, Y = async (e = {}) => (Ve.current = e, G.current = () => D.save(e), J(() => D.save(e))), He = async () => {
		Ve.current = {}, G.current = () => D.save();
		try {
			await D.save();
		} catch (e) {
			throw pe.error(e), e;
		}
	}, Ue = async (e) => {
		if (!V.publish) return !1;
		Me(!0);
		let t = await Y({
			publish: !0,
			...e ? { at: e } : {}
		});
		return Me(!1), t ? (pe.success(t.displayStatus === "scheduled" ? u("Scheduled") : u("Published")), !0) : !1;
	}, We = () => !B.get().dirty || ue({
		title: u("Discard unsaved changes?"),
		description: u("Your unsaved edits will be replaced."),
		confirm: u("Discard changes"),
		danger: !0
	}), Ge = async () => {
		await We() && (D.cancel(), W(!0), G.current = Ge, await J(() => B.command((e) => l("entries/get", { id: e.id }))), W(!1));
	}, Ke = async (e, t = {}) => {
		await We() && (D.cancel(), W(!0), G.current = () => Ke(e, t), await J(() => B.command((n) => l(e, {
			...e === "entries/restore" ? {} : { id: n.id },
			...t,
			expectedVersion: n.version
		}))), W(!1), r("entries/", "content/"));
	}, qe = async () => {
		P && V.delete && await ue({
			title: u("Delete “{title}”?", { title: P.title }),
			description: u("This permanently deletes the entry and its history."),
			confirm: u("Delete"),
			danger: !0
		}) && (D.cancel(), G.current = qe, await J(async () => {
			await B.command(async (e) => (await l("entries/delete", {
				id: e.id,
				expectedVersion: e.version
			}), e)), B.reset(), r("entries/", "content/"), a(E);
		}));
	}, Je = async () => {
		let t = B.get(), n = t.entry;
		V.duplicate && n && !t.dirty && t.phase !== "saving" && await J(async () => {
			let t = await l("entries/duplicate", {
				id: n.id,
				expectedVersion: n.version
			});
			a(`/content/${e.handle}/${t.id}`);
		});
	}, Ye = async (e) => {
		if (!V.move) return !1;
		D.cancel(), W(!0), G.current = () => Ye(e);
		try {
			if (B.get().dirty && !await D.save()) return !1;
			let t = await B.command((t) => l("entries/move", {
				id: t.id,
				parentId: e,
				expectedVersion: t.version
			}));
			return r("entries/", "content/"), !!t;
		} catch (e) {
			return pe.error(e), !1;
		} finally {
			W(!1);
		}
	}, Xe = async () => {
		P && Se && await J(async () => {
			let e = Se.version ?? (await l("entries/get", { id: P.id })).version;
			await Y({
				...Ve.current,
				expectedVersion: e
			});
		});
	}, X = {
		entry: P,
		collection: e,
		content: F,
		values: F.data,
		title: F.title,
		setValue: q,
		save: He,
		reload: Ge,
		editable: A && !Be,
		can: i,
		errors: R
	}, Ze = o("entry.toolbar", X);
	x(c.entryActions.subscribe, c.entryActions.version);
	let Qe = c.entryActions.all().filter((e) => e.when?.(X) ?? !0).sort((e, t) => (e.order ?? 50) - (t.order ?? 50)), $e = o("entry.sidebar", X), et = o("entry.body", X), tt = e.body, Z = e.resolvedFields.find((e) => e.handle === tt), Q = _e(e.resolvedFields, tt, [...$e, ...et]), nt = [
		{
			value: "details",
			label: e.singular
		},
		{
			value: "history",
			label: u("History")
		},
		...$e.map((e) => ({
			value: e.id,
			label: e.label ?? e.id
		}))
	], $ = nt.some((e) => e.value === Pe) ? Pe : "details", rt = (e) => {
		Fe(e), localStorage.setItem(Ne, e);
	}, it = () => {
		H || rt("details"), U(!H);
	}, at = Q.document.filter((e) => !Ee.includes(e.type)), ot = Q.document.filter((e) => Ee.includes(e.type)), st = {
		entry: P ?? void 0,
		collection: e.handle,
		locale: T
	}, ct = /* @__PURE__ */ N("div", {
		className: "flex h-full min-h-0 flex-col",
		children: [/* @__PURE__ */ N("div", {
			className: "flex h-10 shrink-0 items-center gap-2 border-b border-border pl-3 pr-2",
			children: [/* @__PURE__ */ M(oe, {
				id: "entry-sidebar",
				value: $,
				onChange: rt,
				tabs: nt,
				bordered: !1,
				className: "h-full min-w-0 flex-1"
			}), /* @__PURE__ */ M(ne, {
				icon: "close",
				label: u("Close Panel"),
				size: "xs",
				onClick: () => U(!1)
			})]
		}), /* @__PURE__ */ M("div", {
			role: "tabpanel",
			id: `entry-sidebar-${$}-panel`,
			"aria-labelledby": `entry-sidebar-${$}`,
			className: "min-h-0 flex-1 overflow-y-auto",
			children: $ === "details" ? /* @__PURE__ */ M(ve, {
				props: X,
				working: F,
				fields: Z?.type === "blocks" ? [...Q.document, ...Q.sidebar] : Q.sidebar,
				titleInDetails: Z?.type === "blocks",
				update: z,
				onPublishing: () => Le(!0),
				onMoving: () => ze(!0)
			}) : $ === "history" ? /* @__PURE__ */ M(be, {
				entry: P,
				editable: V.restore && !K,
				onRestore: async (e) => {
					V.restore && await ue({
						title: u("Restore this version?"),
						description: u("The current saved content stays in history."),
						confirm: u("Restore")
					}) && await Ke("entries/restore", { revisionId: e });
				}
			}) : $e.filter((e) => e.id === $).map((e) => /* @__PURE__ */ M(e.component, { ...X }, e.id))
		})]
	}), lt = /* @__PURE__ */ N(j, { children: [/* @__PURE__ */ M(w, {
		bare: !0,
		fields: [{
			handle: "title",
			type: "text",
			label: u("Title"),
			component: "title",
			placeholder: u("Untitled"),
			autofocus: !P,
			onEnter: () => {
				Y(), we();
			},
			onDown: we
		}],
		values: { title: F.title },
		onChange: (e, t) => z({ title: t ?? "" }),
		errors: R,
		disabled: !X.editable
	}), (at.length > 0 || ot.length > 0) && /* @__PURE__ */ N(Te, {
		collection: e.handle,
		count: at.length + ot.length,
		children: [at.map((e) => /* @__PURE__ */ M(De, {
			field: e,
			value: F.data[e.handle],
			onChange: (t) => q(e.handle, t),
			error: R[e.handle],
			disabled: !X.editable,
			context: st,
			values: F.data
		}, e.handle)), ot.length > 0 && /* @__PURE__ */ M(w, {
			fields: ot,
			values: F.data,
			onChange: q,
			errors: R,
			disabled: !X.editable,
			context: st,
			className: "mt-4 !gap-y-4"
		})]
	})] }), ut = Z ? {
		...X,
		footer: /* @__PURE__ */ M(j, { children: et.map((e) => /* @__PURE__ */ M(e.component, { ...X }, e.id)) }),
		bodyField: Z,
		setTitle: (e) => z({ title: e }),
		sidebar: ct,
		sidebarOpen: H,
		setSidebarOpen: U,
		toolbar: ke,
		listPath: E
	} : null, dt = ut ? o("entry.editor", ut)[0] : null, ft = P?.displayStatus ?? "draft", pt = P?.status === "published" && ft !== "scheduled", mt = pt && !I && !P?.hasDraft, ht = !P && I && !F.title.trim();
	return me("mod+s", () => {
		A && Y();
	}), me("mod+shift+p", () => {
		V.publish && !mt && F.title.trim() && Ue();
	}), me("mod+.", it), v(() => {
		let t = Object.keys(R)[0];
		if (!t) return;
		let n = t.replace(/^data\./, "").split("."), r = n[0], i = Q.claimed.get(r);
		(i || Z?.type === "blocks" && (r === "title" || Q.document.some((e) => e.handle === r)) || r === "authorId" || r === "slug" || Q.sidebar.some((e) => e.handle === r)) && (U(!0), rt(i ?? "details")), Q.document.some((e) => e.handle === r) && (localStorage.setItem(`cms.properties.${e.handle}`, "open"), window.dispatchEvent(new Event("cms.fields.reveal"))), requestAnimationFrame(() => {
			let e = document.getElementById(fe({ handle: n.at(-1) }, n.slice(0, -1))) ?? document.getElementById(`f-${r}`) ?? document.querySelector(`[data-field="${CSS.escape(r)}"] input, [data-field="${CSS.escape(r)}"] textarea, [data-field="${CSS.escape(r)}"] button`);
			e?.scrollIntoView({ block: "center" }), e?.focus();
		});
	}, [R]), /* @__PURE__ */ N("div", {
		className: "flex h-full flex-col",
		children: [
			/* @__PURE__ */ M(ce, {
				back: {
					to: E,
					label: e.title
				},
				title: F.title || u("Untitled"),
				children: dt ? /* @__PURE__ */ M("div", {
					ref: Ae,
					className: "flex shrink-0 items-center gap-0.5"
				}) : void 0,
				actions: /* @__PURE__ */ N(j, { children: [
					/* @__PURE__ */ M("span", {
						role: "status",
						className: le("mr-1 text-xs", L === "error" ? "text-danger" : "text-faint", L !== "error" && !ht && !K && !I && "sr-only"),
						children: L === "error" ? u("Couldn’t save") : ht ? u("Add a title to save") : K ? u("Saving…") : I ? u("Unsaved") : P ? u("Saved") : ""
					}),
					Ze.map((e) => /* @__PURE__ */ M(e.component, { ...X }, e.id)),
					/* @__PURE__ */ M(se, {
						content: u("Entry details"),
						shortcut: "mod+.",
						children: /* @__PURE__ */ M(ne, {
							icon: "sidebar",
							label: u("Entry details"),
							title: void 0,
							active: H,
							onClick: it,
							className: "[&_svg]:-scale-x-100"
						})
					}),
					V.publish ? mt ? /* @__PURE__ */ M(ae, {
						status: ft,
						className: "h-8 px-2 text-sm"
					}) : /* @__PURE__ */ N(S, {
						variant: "publish",
						size: "md",
						disabled: !F.title.trim(),
						loading: je,
						onClick: () => {
							Ue();
						},
						children: [/* @__PURE__ */ M("span", {
							className: "max-sm:hidden",
							children: u(ft === "scheduled" ? "Publish now" : pt ? "Publish Changes" : "Publish")
						}), /* @__PURE__ */ M("span", {
							className: "sm:hidden",
							children: u("Publish")
						})]
					}) : A && /* @__PURE__ */ M(S, {
						variant: "primary",
						size: "md",
						disabled: !I || K,
						loading: K,
						onClick: () => {
							Y();
						},
						children: u("Save Draft")
					}),
					/* @__PURE__ */ M(ie, {
						trigger: /* @__PURE__ */ M(ne, {
							icon: "more",
							label: u("More Actions")
						}),
						items: [
							...Qe.map((e) => ({
								label: e.label,
								icon: e.icon,
								onSelect: () => e.perform(X)
							})),
							P && pt && P.uri ? {
								label: u("View on Site"),
								icon: "external",
								onSelect: () => {
									window.open(P.uri, "_blank", "noopener");
								}
							} : null,
							V.publish && {
								label: u(ft === "scheduled" ? "Change schedule" : pt ? "Publication date…" : "Schedule…"),
								icon: "calendar",
								onSelect: () => Le(!0)
							},
							P && V.duplicate && {
								label: u("Duplicate"),
								icon: "copy",
								disabled: K || I,
								description: K || I ? u("Save changes before duplicating") : void 0,
								onSelect: () => {
									Je();
								}
							},
							P && V.discard && P.hasDraft && {
								label: u("Discard Unpublished Changes"),
								icon: "undo",
								onSelect: () => {
									Ke("entries/discard-draft");
								}
							},
							P && V.unpublish && {
								label: u("Unpublish"),
								icon: "eye-off",
								onSelect: () => {
									Ke("entries/unpublish");
								}
							},
							P && V.delete && {
								label: u("Delete"),
								icon: "trash",
								danger: !0,
								onSelect: qe
							}
						]
					})
				] })
			}),
			s && /* @__PURE__ */ M(O, {
				message: s,
				onRetry: d,
				compact: !0
			}),
			Q.error && /* @__PURE__ */ M("div", {
				role: "alert",
				className: "border-b border-danger/20 p-3 text-sm text-danger",
				children: Q.error
			}),
			D.error && /* @__PURE__ */ M(Ce, {
				message: D.error.message,
				conflict: !!Se,
				dirty: I,
				onReload: Ge,
				onKeepMine: Xe,
				onRetry: () => {
					J(G.current);
				}
			}),
			dt && ut ? /* @__PURE__ */ M("div", {
				className: "min-h-0 flex-1",
				children: /* @__PURE__ */ M(_, {
					fallback: /* @__PURE__ */ M("div", {
						className: "grid h-full place-items-center",
						children: /* @__PURE__ */ M(k, {})
					}),
					children: /* @__PURE__ */ M(dt.component, { ...ut })
				})
			}) : /* @__PURE__ */ N("div", {
				className: "flex min-h-0 flex-1",
				children: [/* @__PURE__ */ M("div", {
					className: "min-w-0 flex-1 overflow-y-auto",
					children: /* @__PURE__ */ N("article", {
						className: "mx-auto w-full max-w-[784px] px-6 pb-24 pt-12 md:px-8 md:pt-16",
						children: [
							lt,
							Z?.type === "blocks" ? /* @__PURE__ */ M(ee, {
								icon: "blocks",
								title: u("Block editor unavailable")
							}) : Z && /* @__PURE__ */ M("div", {
								className: "mt-8",
								"data-cms-body": !0,
								children: /* @__PURE__ */ M(w, {
									bare: !0,
									fields: [Z],
									values: F.data,
									onChange: q,
									errors: R,
									disabled: !X.editable,
									context: {
										...st,
										title: F.title
									}
								})
							}),
							et.map((e) => /* @__PURE__ */ M(e.component, { ...X }, e.id))
						]
					})
				}), /* @__PURE__ */ M(re, {
					open: H,
					onOpenChange: U,
					title: e.singular,
					children: ct
				})]
			}),
			Ie && /* @__PURE__ */ M(ye, {
				entry: P,
				busy: K,
				onClose: () => Le(!1),
				onPublish: (e) => Ue(e)
			}),
			Re && P && /* @__PURE__ */ M(xe, {
				entry: P,
				collection: e,
				busy: K || Be,
				onClose: () => ze(!1),
				onMove: Ye
			})
		]
	});
}
function Ce({ message: e, conflict: t, dirty: n, onReload: r, onKeepMine: i, onRetry: a }) {
	return /* @__PURE__ */ N("div", {
		role: "alert",
		className: "flex flex-wrap items-center gap-2 border-b border-warning/30 bg-warning/8 px-4 py-2 text-sm",
		children: [
			/* @__PURE__ */ M(T, {
				name: "warning",
				size: 15
			}),
			/* @__PURE__ */ M("span", {
				className: "min-w-0 flex-1",
				children: e
			}),
			t ? /* @__PURE__ */ N(j, { children: [/* @__PURE__ */ M(S, {
				size: "xs",
				onClick: r,
				children: u("Load Their Version")
			}), n && /* @__PURE__ */ M(S, {
				size: "xs",
				onClick: i,
				children: u("Keep Mine")
			})] }) : /* @__PURE__ */ M(S, {
				size: "xs",
				onClick: a,
				children: u("Retry")
			})
		]
	});
}
function we() {
	(document.querySelector("[data-cms-body] [contenteditable=\"true\"], [data-cms-body] textarea, [data-cms-body] input") ?? document.querySelector("[data-cms-fields] input, [data-cms-fields] textarea"))?.focus();
}
function Te({ collection: e, count: t, children: n }) {
	let r = `cms.properties.${e}`, [i, a] = b(() => localStorage.getItem(r) !== "closed");
	return v(() => {
		let e = () => a(!0);
		return window.addEventListener("cms.fields.reveal", e), () => window.removeEventListener("cms.fields.reveal", e);
	}, []), /* @__PURE__ */ N("div", {
		className: "mt-6",
		"data-cms-fields": i ? "" : void 0,
		children: [i && /* @__PURE__ */ M("div", {
			className: "space-y-px",
			children: n
		}), /* @__PURE__ */ N("button", {
			type: "button",
			onClick: () => {
				localStorage.setItem(r, i ? "closed" : "open"), a(!i);
			},
			"aria-expanded": i,
			className: "-ml-1.5 mt-2 flex h-7 items-center gap-1.5 rounded-xs px-1.5 text-xs text-faint transition-colors hover:bg-hover hover:text-muted",
			children: [/* @__PURE__ */ M(T, {
				name: i ? "chevron-up" : "chevron-down",
				size: 12
			}), i ? u("Hide Properties") : s(t, "{count} property", "{count} properties")]
		})]
	});
}
var Ee = [
	"repeater",
	"blocks",
	"richtext",
	"markdown",
	"json",
	"group",
	"code",
	"fields",
	"table",
	"grid"
];
function De({ field: e, value: t, onChange: n, error: r, disabled: i, context: a, values: o }) {
	return /* @__PURE__ */ N("div", {
		className: "grid grid-cols-[148px_minmax(0,1fr)] items-start gap-3 py-0.5",
		children: [/* @__PURE__ */ M("div", {
			className: "flex h-8 items-center truncate text-sm text-muted",
			title: e.instructions ?? e.label,
			children: e.label
		}), /* @__PURE__ */ M("div", {
			className: "min-w-0",
			children: /* @__PURE__ */ M(w, {
				bare: !0,
				fields: [{
					...e,
					width: "full",
					size: e.size ?? "sm",
					rows: e.type === "textarea" ? e.rows ?? 2 : e.rows
				}],
				values: {
					...o,
					[e.handle]: t
				},
				onChange: (e, t) => n(t),
				errors: r ? { [e.handle]: r } : {},
				disabled: i,
				context: a
			})
		})]
	});
}
export { Se as default };
