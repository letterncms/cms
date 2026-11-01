import { t as e } from "./useCollection-DPy1gAYR.js";
import { blockNavigation as t, events as n, invalidate as r, locale as i, navigate as a, panelsFor as o, plural as s, registry as c, run as l, t as u, timeAgo as d, useAbility as f, useConfig as p, useLocation as m, useManifest as h } from "@letterncms/sdk";
import { Suspense as g, useEffect as _, useRef as v, useState as y, useSyncExternalStore as b } from "react";
import { Button as x, Dialog as S, EmptyState as C, Field as ee, Fields as w, Icon as T, IconButton as E, InspectorPanel as te, Menu as ne, Page as re, PersonPicker as D, QueryError as O, Spinner as ie, StatusDot as ae, Tabs as oe, Tooltip as se, Topbar as ce, cn as le, confirm as ue, entryActionAvailability as de, fieldControlId as fe, slugify as pe, toast as k, useShortcut as me, useWideInspector as he } from "@letterncms/ui";
import { Fragment as A, jsx as j, jsxs as M } from "react/jsx-runtime";
// admin/src/entrySession.ts
var N = (e) => ({
	title: e.title,
	slug: e.slug,
	data: e.data,
	authorId: e.authorId
}), P = class {
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
		this.edit++, this.emit({
			working: {
				...this.state.working,
				...e
			},
			dirty: !0,
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
					working: r === this.edit ? N(i) : this.state.working,
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
					working: t === this.edit ? N(n) : this.state.working,
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
			...e ? { working: N(e) } : {},
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
	let c = v(!0), d = v(window.location.pathname);
	_(() => (c.current = !0, () => {
		c.current = !1;
	}), []);
	let [f] = y(() => new P(e, n, async (e, t, n) => {
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
	})), p = b(f.subscribe, f.get), m = p.entry ? s.edit : s.create, h = v(void 0), g = () => clearTimeout(h.current);
	_(() => (g(), m && o > 0 && p.dirty && p.phase !== "saving" && !p.error && !p.conflict && p.working.title.trim() && (h.current = setTimeout(() => void f.save().catch(() => {}), o)), g), [
		f,
		p,
		o,
		m
	]), _(() => t(() => f.get().dirty || f.get().phase === "saving" ? u("You have unsaved changes. Leave anyway?") : null), [f]), _(() => {
		let e = (e) => {
			(f.get().dirty || f.get().phase === "saving") && e.preventDefault();
		};
		return window.addEventListener("beforeunload", e), () => window.removeEventListener("beforeunload", e);
	}, [f]);
	let x = (e = {}) => (g(), m || e.publish ? f.save(e) : Promise.resolve(p.entry));
	return {
		...p,
		session: f,
		editable: m,
		save: x,
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
function F(e, t, n) {
	return t?.uri ? t.uri === "/" ? "/" : t.uri.replace(/[^/]+$/, n || t.slug) : (e.route ?? "/{slug}").replace("{parent_uri}/", "").replace("{slug}", n || "…").replace(/\{[a-z_]+\}/g, "…").replace(/\/+/g, "/");
}
function ve({ props: e, working: t, fields: n, titleInDetails: r, update: a, onPublishing: o, onMoving: s }) {
	let { entry: c, collection: l, editable: d, errors: p } = e, m = h(), g = de(e.can, c), _ = f("entries/lookup", { ids: c?.parentId ? [c.parentId] : [] }, { enabled: !!c?.parentId }), v = (e) => e ? new Intl.DateTimeFormat(i(), {
		dateStyle: "medium",
		timeStyle: "short",
		timeZone: m.site.timezone
	}).format(new Date(e)) : u("Unknown"), y = (e) => e.section === "sidebar" ? "main" : e.section ?? "main", b = [...new Set(n.map(y))], S = c?.displayStatus ?? "draft", C = {
		draft: "Draft",
		changed: "Changes",
		published: "Published",
		scheduled: "Scheduled"
	};
	return /* @__PURE__ */ M("div", {
		className: "space-y-5 p-4",
		children: [
			/* @__PURE__ */ M("section", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ j("div", {
						className: "cms-caps",
						children: u("Identity")
					}),
					/* @__PURE__ */ j(w, {
						fields: [...r ? [{
							handle: "title",
							type: "text",
							label: u("Title")
						}] : [], l.route ? {
							handle: "slug",
							type: "slug",
							label: u("URL"),
							component: "uri",
							uri: F(l, c, t.slug)
						} : {
							handle: "slug",
							type: "text",
							label: u("Handle"),
							mono: !0,
							max: 180
						}],
						values: {
							title: t.title,
							slug: t.slug || pe(t.title)
						},
						onChange: (e, t) => a({ [e]: t ?? "" }),
						errors: p,
						disabled: !d
					}),
					/* @__PURE__ */ j(ee, {
						label: u("Author"),
						htmlFor: "f-authorId",
						error: p.authorId,
						children: /* @__PURE__ */ j(D, {
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
			b.map((r) => /* @__PURE__ */ M("section", {
				className: "space-y-3 border-t border-border pt-4",
				children: [/* @__PURE__ */ j("div", {
					className: "cms-caps",
					children: r === "main" || r === "sidebar" ? u("Properties") : r.replace(/[_-]/g, " ")
				}), /* @__PURE__ */ j(w, {
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
			/* @__PURE__ */ M("section", {
				className: "space-y-3 border-t border-border pt-4",
				children: [
					/* @__PURE__ */ j("div", {
						className: "cms-caps",
						children: u("Publishing")
					}),
					/* @__PURE__ */ M("div", {
						className: "grid justify-items-start gap-2",
						children: [
							/* @__PURE__ */ j(ae, {
								status: S,
								label: u(C[S])
							}),
							c?.publishedAt && /* @__PURE__ */ M("time", {
								dateTime: c.publishedAt,
								className: "text-xs leading-5 text-muted",
								children: [
									v(c.publishedAt),
									" · ",
									m.site.timezone
								]
							}),
							g.publish && /* @__PURE__ */ j(x, {
								size: "xs",
								disabled: !t.title.trim(),
								onClick: o,
								children: c?.displayStatus === "scheduled" ? u("Change schedule") : u("Publication date…")
							})
						]
					}),
					c?.hasDraft && /* @__PURE__ */ j("p", {
						className: "m-0 text-xs text-muted",
						children: u("Unpublished changes are saved separately from the published version.")
					})
				]
			}),
			/* @__PURE__ */ M("section", {
				className: "space-y-2 border-t border-border pt-4",
				children: [
					/* @__PURE__ */ j("div", {
						className: "cms-caps",
						children: u("Record")
					}),
					c && l.structure === "tree" && /* @__PURE__ */ M("div", {
						className: "flex items-center gap-2 text-xs",
						children: [
							/* @__PURE__ */ j("span", {
								className: "text-muted",
								children: u("Parent")
							}),
							/* @__PURE__ */ j("span", {
								className: "min-w-0 flex-1 truncate",
								children: c.parentId ? _.data?.[0]?.title ?? (_.isLoading ? u("Loading…") : _.isError ? u("Unknown") : u("Unavailable parent")) : u("Root")
							}),
							g.move && /* @__PURE__ */ j(x, {
								size: "xs",
								onClick: s,
								children: u("Move")
							})
						]
					}),
					c?.parentId && _.isError && /* @__PURE__ */ j(O, {
						message: _.error.message,
						onRetry: () => void _.refetch(),
						compact: !0
					}),
					/* @__PURE__ */ M("dl", {
						className: "m-0 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-2 text-xs",
						children: [
							/* @__PURE__ */ j("dt", {
								className: "text-muted",
								children: u("Collection")
							}),
							/* @__PURE__ */ j("dd", {
								className: "m-0 break-words",
								children: l.title
							}),
							/* @__PURE__ */ j("dt", {
								className: "text-muted",
								children: u("Language")
							}),
							/* @__PURE__ */ j("dd", {
								className: "m-0",
								children: c?.locale ?? m.site.defaultLocale
							}),
							/* @__PURE__ */ j("dt", {
								className: "text-muted",
								children: u("Created")
							}),
							/* @__PURE__ */ j("dd", {
								className: "m-0",
								children: v(c?.createdAt)
							}),
							/* @__PURE__ */ j("dt", {
								className: "text-muted",
								children: u("Updated")
							}),
							/* @__PURE__ */ j("dd", {
								className: "m-0",
								children: v(c?.updatedAt)
							}),
							c && /* @__PURE__ */ M(A, { children: [/* @__PURE__ */ j("dt", {
								className: "text-muted",
								children: u("ID")
							}), /* @__PURE__ */ j("dd", {
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
	let i = h(), [a, o] = y(e?.publishedAt ?? null), [s, c] = y(), l = e?.status === "published" && e.displayStatus !== "scheduled", d = !!a && new Date(a).getTime() > Date.now();
	return /* @__PURE__ */ j(S, {
		open: !0,
		onOpenChange: (e) => !e && !t && n(),
		title: u("Publication date"),
		description: u(l ? "Publish changes immediately. Future scheduling is available for unpublished entries." : "Choose when this saved version becomes public."),
		footer: /* @__PURE__ */ M(A, { children: [/* @__PURE__ */ j(x, {
			disabled: t,
			onClick: n,
			children: u("Cancel")
		}), /* @__PURE__ */ j(x, {
			variant: "publish",
			loading: t,
			onClick: async () => {
				!a || !Number.isFinite(new Date(a).getTime()) ? c(u("Choose a publication date and time.")) : l && d ? c(u("Unpublish this entry before scheduling it for a future date.")) : await r(a) && n();
			},
			children: u(d && !l ? "Schedule" : "Publish")
		})] }),
		children: /* @__PURE__ */ j(w, {
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
	if (!e) return /* @__PURE__ */ j("p", {
		className: "m-0 p-4 text-sm text-faint",
		children: u("History starts after the first save.")
	});
	if (r.isLoading) return /* @__PURE__ */ j("div", {
		className: "grid place-items-center p-6 text-faint",
		children: /* @__PURE__ */ j(ie, {})
	});
	if (r.isError && !r.data) return /* @__PURE__ */ j(O, {
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
	return /* @__PURE__ */ M(A, { children: [
		r.isError && /* @__PURE__ */ j(O, {
			message: r.error.message,
			onRetry: () => void r.refetch(),
			compact: !0
		}),
		r.data?.length === 0 && /* @__PURE__ */ j("p", {
			className: "p-4 text-sm text-muted",
			children: u("No history available.")
		}),
		/* @__PURE__ */ j("ol", {
			className: "m-0 list-none p-2",
			children: (r.data ?? []).map((e, r) => /* @__PURE__ */ M("li", {
				className: "group flex items-start gap-3 rounded-sm px-2 py-2 hover:bg-surface",
				children: [
					/* @__PURE__ */ j("span", { className: le("mt-1.5 size-2 shrink-0 rounded-full", e.action === "publish" ? "bg-success" : "bg-border-strong") }),
					/* @__PURE__ */ M("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ M("div", {
							className: "text-sm text-text",
							children: [a[e.action] ?? e.action, /* @__PURE__ */ M("span", {
								className: "text-muted",
								children: [" · ", e.user?.name ?? u("System")]
							})]
						}), /* @__PURE__ */ M("div", {
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
					r > 0 && t && /* @__PURE__ */ j(x, {
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
function I(e, t, n = []) {
	return e.flatMap((e) => {
		if (e.id === t) return [];
		let r = [...n, e.title || u("Untitled")];
		return [{
			value: e.id,
			label: r.join(" / ")
		}, ...I(e.children ?? [], t, r)];
	});
}
function xe({ entry: e, collection: t, busy: n, onClose: r, onMove: i }) {
	let a = f("entries/tree", {
		collection: t.handle,
		locale: e.locale
	}, { refetchOnWindowFocus: !1 }), [o, s] = y(e.parentId), [c, l] = y(null), [d, p] = y(!1), m = v(!1), h = [{
		value: "",
		label: u("Root")
	}, ...I(a.data ?? [], e.id)], g = o === null || h.some((e) => e.value === o), _ = !!a.data && !a.isError, b = n || d, C = c ?? (_ && !g ? u("This parent is no longer available. Choose another parent.") : void 0);
	return /* @__PURE__ */ M(S, {
		open: !0,
		title: u("Move {type}", { type: t.singular }),
		description: u("Choose a new parent for “{title}”.", { title: e.title }),
		onOpenChange: (e) => {
			!e && !b && r();
		},
		footer: /* @__PURE__ */ M(A, { children: [/* @__PURE__ */ j(x, {
			disabled: b,
			onClick: r,
			children: u("Cancel")
		}), /* @__PURE__ */ j(x, {
			variant: "primary",
			loading: b,
			disabled: !_ || !g || o === e.parentId,
			onClick: async () => {
				if (!m.current && !b && _ && g && o !== e.parentId) {
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
		children: [a.isLoading || !a.data && a.isFetching ? /* @__PURE__ */ M("div", {
			role: "status",
			className: "flex items-center gap-2 py-4 text-sm text-muted",
			children: [/* @__PURE__ */ j(ie, { size: 14 }), u("Loading available parents…")]
		}) : /* @__PURE__ */ M(A, { children: [a.isError && /* @__PURE__ */ j(O, {
			message: a.error.message,
			onRetry: () => void a.refetch()
		}), a.data && /* @__PURE__ */ j(w, {
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
			errors: C ? { parentId: C } : {},
			disabled: b || a.isError
		})] }), /* @__PURE__ */ M("div", {
			className: "mt-4 space-y-2 text-xs text-muted",
			children: [e.uri && /* @__PURE__ */ j("p", {
				className: "m-0",
				children: u("Moving a published entry can change its live URL and the URLs of its descendants.")
			}), /* @__PURE__ */ j("p", {
				className: "m-0",
				children: u("Saved unpublished changes stay in the working copy. Moving does not publish them.")
			})]
		})]
	});
}
// admin/src/EntryEditor.tsx
function L({ params: t }) {
	let { collection: n, summary: i, isLoading: o, error: s } = e(t.collection), c = t.id === "new", l = R(t.id, c), d = () => {
		l.refetch(), r("collections/get");
	};
	if (o || !c && l.isLoading) return /* @__PURE__ */ M("div", {
		className: "flex h-full flex-col",
		children: [/* @__PURE__ */ j(ce, { crumbs: [{
			label: i?.title ?? "…",
			to: `/content/${t.collection}`
		}] }), /* @__PURE__ */ j("div", {
			className: "grid flex-1 place-items-center",
			children: /* @__PURE__ */ j(ie, {})
		})]
	});
	let f = s ?? l.error;
	return (!n || !c && !l.data) && f && !["not_found", "forbidden"].includes(f.type) ? /* @__PURE__ */ j(re, {
		crumbs: [{ label: u("Content") }],
		children: /* @__PURE__ */ j(O, {
			message: f.message,
			onRetry: d
		})
	}) : !n || !i || !c && !l.data ? /* @__PURE__ */ j(re, {
		crumbs: [{ label: u("Content") }],
		children: /* @__PURE__ */ j(C, {
			icon: "file",
			title: f?.type === "forbidden" ? u("Access denied") : u("Entry not found"),
			description: f?.message ?? u("It may have been deleted."),
			action: /* @__PURE__ */ j(x, {
				onClick: () => a(`/content/${t.collection}`),
				children: u("Go Back")
			})
		})
	}) : /* @__PURE__ */ j(z, {
		collection: n,
		initial: c ? null : l.data,
		can: i.can,
		loadError: f?.message,
		retryLoad: d
	}, `${t.collection}:${t.id}`);
}
function R(e, t) {
	return f("entries/get", { id: e }, {
		enabled: !t,
		refetchOnWindowFocus: !1
	});
}
function z({ collection: e, initial: t, can: i, loadError: s, retryLoad: d }) {
	let f = h(), { query: S } = m(), ee = p("content").autosave ?? 1200;
	_(() => (n.emit("shell.compact", !0), () => n.emit("shell.compact", !1)), []);
	let T = t?.locale ?? (f.site.locales.includes(S.locale ?? "") ? S.locale : f.site.defaultLocale), re = `/content/${e.handle}${T === f.site.defaultLocale ? "" : `?locale=${T}`}`, D = ge(t, {
		title: t?.title ?? "",
		slug: t?.slug ?? "",
		authorId: t ? t.authorId : f.user.id,
		data: t?.data ?? Object.fromEntries(e.resolvedFields.map((e) => [e.handle, e.default ?? null]))
	}, e.handle, T, ee, i), pe = D.editable, { entry: N, working: P, dirty: F, phase: I, errors: L, conflict: R, update: z, session: B } = D, V = de(i, N), De = he(), [H, U] = y(() => De), Oe = `cms.entry.panel.${e.handle}`, [ke, Ae] = y(() => localStorage.getItem(Oe) || "details"), [je, Me] = y(!1), [Ne, Pe] = y(!1), [Fe, W] = y(!1), G = v(() => D.save()), Ie = v({});
	b(c.panels.subscribe, c.panels.version);
	let K = I === "saving", Le = (e, t) => {
		z({ data: {
			...B.get().working.data,
			[e]: t
		} });
	}, q = async (e) => {
		try {
			return await e();
		} catch (e) {
			k.error(e);
			return;
		}
	}, J = async (e = {}) => (Ie.current = e, G.current = () => D.save(e), q(() => D.save(e))), Re = async () => {
		Ie.current = {}, G.current = () => D.save();
		try {
			await D.save();
		} catch (e) {
			throw k.error(e), e;
		}
	}, ze = async (e) => {
		if (!V.publish) return !1;
		let t = await J({
			publish: !0,
			...e ? { at: e } : {}
		});
		return t ? (k.success(t.displayStatus === "scheduled" ? u("Scheduled") : u("Published")), !0) : !1;
	}, Be = () => !B.get().dirty || ue({
		title: u("Discard unsaved changes?"),
		description: u("Your unsaved edits will be replaced."),
		confirm: u("Discard changes"),
		danger: !0
	}), Ve = async () => {
		await Be() && (D.cancel(), W(!0), G.current = Ve, await q(() => B.command((e) => l("entries/get", { id: e.id }))), W(!1));
	}, He = async (e, t = {}) => {
		await Be() && (D.cancel(), W(!0), G.current = () => He(e, t), await q(() => B.command((n) => l(e, {
			...e === "entries/restore" ? {} : { id: n.id },
			...t,
			expectedVersion: n.version
		}))), W(!1), r("entries/", "content/"));
	}, Ue = async () => {
		N && V.delete && await ue({
			title: u("Delete “{title}”?", { title: N.title }),
			description: u("This permanently deletes the entry and its history."),
			confirm: u("Delete"),
			danger: !0
		}) && (D.cancel(), G.current = Ue, await q(async () => {
			await B.command(async (e) => (await l("entries/delete", {
				id: e.id,
				expectedVersion: e.version
			}), e)), B.reset(), r("entries/", "content/"), a(re);
		}));
	}, We = async () => {
		let t = B.get(), n = t.entry;
		V.duplicate && n && !t.dirty && t.phase !== "saving" && await q(async () => {
			let t = await l("entries/duplicate", {
				id: n.id,
				expectedVersion: n.version
			});
			a(`/content/${e.handle}/${t.id}`);
		});
	}, Ge = async (e) => {
		if (!V.move) return !1;
		D.cancel(), W(!0), G.current = () => Ge(e);
		try {
			if (B.get().dirty && !await D.save()) return !1;
			let t = await B.command((t) => l("entries/move", {
				id: t.id,
				parentId: e,
				expectedVersion: t.version
			}));
			return r("entries/", "content/"), !!t;
		} catch (e) {
			return k.error(e), !1;
		} finally {
			W(!1);
		}
	}, Ke = async () => {
		N && R && await q(async () => {
			let e = R.version ?? (await l("entries/get", { id: N.id })).version;
			await J({
				...Ie.current,
				expectedVersion: e
			});
		});
	}, Y = {
		entry: N,
		collection: e,
		content: P,
		values: P.data,
		title: P.title,
		setValue: Le,
		save: Re,
		reload: Ve,
		editable: pe && !Fe,
		can: i,
		errors: L
	}, qe = o("entry.toolbar", Y), Je = o("entry.sidebar", Y), Ye = o("entry.body", Y), Xe = e.body, X = e.resolvedFields.find((e) => e.handle === Xe), Z = _e(e.resolvedFields, Xe, [...Je, ...Ye]), Ze = [
		{
			value: "details",
			label: e.singular
		},
		{
			value: "history",
			label: u("History")
		},
		...Je.map((e) => ({
			value: e.id,
			label: e.label ?? e.id
		}))
	], Q = Ze.some((e) => e.value === ke) ? ke : "details", Qe = (e) => {
		Ae(e), localStorage.setItem(Oe, e);
	}, $e = () => {
		H || Qe("details"), U(!H);
	}, et = Z.document.filter((e) => !Te.includes(e.type)), tt = Z.document.filter((e) => Te.includes(e.type)), nt = {
		entry: N ?? void 0,
		collection: e.handle,
		locale: T
	}, rt = /* @__PURE__ */ M("div", {
		className: "flex h-full min-h-0 flex-col",
		children: [/* @__PURE__ */ M("div", {
			className: "flex h-10 shrink-0 items-center gap-2 border-b border-border pl-3 pr-2",
			children: [/* @__PURE__ */ j(oe, {
				id: "entry-sidebar",
				value: Q,
				onChange: Qe,
				tabs: Ze,
				bordered: !1,
				className: "h-full min-w-0 flex-1"
			}), /* @__PURE__ */ j(E, {
				icon: "close",
				label: u("Close Panel"),
				size: "xs",
				onClick: () => U(!1)
			})]
		}), /* @__PURE__ */ j("div", {
			role: "tabpanel",
			id: `entry-sidebar-${Q}-panel`,
			"aria-labelledby": `entry-sidebar-${Q}`,
			className: "min-h-0 flex-1 overflow-y-auto",
			children: Q === "details" ? /* @__PURE__ */ j(ve, {
				props: Y,
				working: P,
				fields: X?.type === "blocks" ? [...Z.document, ...Z.sidebar] : Z.sidebar,
				titleInDetails: X?.type === "blocks",
				update: z,
				onPublishing: () => Me(!0),
				onMoving: () => Pe(!0)
			}) : Q === "history" ? /* @__PURE__ */ j(be, {
				entry: N,
				editable: V.restore && !K,
				onRestore: async (e) => {
					V.restore && await ue({
						title: u("Restore this version?"),
						description: u("The current saved content stays in history."),
						confirm: u("Restore")
					}) && await He("entries/restore", { revisionId: e });
				}
			}) : Je.filter((e) => e.id === Q).map((e) => /* @__PURE__ */ j(e.component, { ...Y }, e.id))
		})]
	}), it = /* @__PURE__ */ M(A, { children: [/* @__PURE__ */ j(w, {
		bare: !0,
		fields: [{
			handle: "title",
			type: "text",
			label: u("Title"),
			component: "title",
			placeholder: u("Untitled"),
			autofocus: !N,
			onEnter: () => {
				J(), Ce();
			},
			onDown: Ce
		}],
		values: { title: P.title },
		onChange: (e, t) => z({ title: t ?? "" }),
		errors: L,
		disabled: !Y.editable
	}), (et.length > 0 || tt.length > 0) && /* @__PURE__ */ M(we, {
		collection: e.handle,
		count: et.length + tt.length,
		children: [et.map((e) => /* @__PURE__ */ j(Ee, {
			field: e,
			value: P.data[e.handle],
			onChange: (t) => Le(e.handle, t),
			error: L[e.handle],
			disabled: !Y.editable,
			context: nt,
			values: P.data
		}, e.handle)), tt.length > 0 && /* @__PURE__ */ j(w, {
			fields: tt,
			values: P.data,
			onChange: Le,
			errors: L,
			disabled: !Y.editable,
			context: nt,
			className: "mt-4 !gap-y-4"
		})]
	})] }), at = X ? {
		...Y,
		footer: /* @__PURE__ */ j(A, { children: Ye.map((e) => /* @__PURE__ */ j(e.component, { ...Y }, e.id)) }),
		bodyField: X,
		setTitle: (e) => z({ title: e }),
		sidebar: rt,
		sidebarOpen: H,
		setSidebarOpen: U
	} : null, ot = at ? o("entry.editor", at)[0] : null, st = N?.displayStatus ?? "draft", $ = N?.status === "published" && st !== "scheduled", ct = K || !P.title.trim() || $ && !F && !N?.hasDraft, lt = !N && F && !P.title.trim();
	return me("mod+s", () => {
		pe && J();
	}), me("mod+shift+p", () => {
		V.publish && !ct && ze();
	}), me("mod+.", $e), _(() => {
		let t = Object.keys(L)[0];
		if (!t) return;
		let n = t.replace(/^data\./, "").split("."), r = n[0], i = Z.claimed.get(r);
		(i || X?.type === "blocks" && (r === "title" || Z.document.some((e) => e.handle === r)) || r === "authorId" || r === "slug" || Z.sidebar.some((e) => e.handle === r)) && (U(!0), Qe(i ?? "details")), Z.document.some((e) => e.handle === r) && (localStorage.setItem(`cms.properties.${e.handle}`, "open"), window.dispatchEvent(new Event("cms.fields.reveal"))), requestAnimationFrame(() => {
			let e = document.getElementById(fe({ handle: n.at(-1) }, n.slice(0, -1))) ?? document.getElementById(`f-${r}`) ?? document.querySelector(`[data-field="${CSS.escape(r)}"] input, [data-field="${CSS.escape(r)}"] textarea, [data-field="${CSS.escape(r)}"] button`);
			e?.scrollIntoView({ block: "center" }), e?.focus();
		});
	}, [L]), /* @__PURE__ */ M("div", {
		className: "flex h-full flex-col",
		children: [
			/* @__PURE__ */ j(ce, {
				crumbs: [{
					label: e.title,
					to: re,
					icon: e.icon
				}, { label: P.title || u("Untitled") }],
				actions: /* @__PURE__ */ M(A, { children: [
					/* @__PURE__ */ j("span", {
						role: "status",
						className: le("text-xs", I === "error" ? "text-danger" : "text-faint"),
						children: I === "error" ? u("Couldn’t save") : K ? u("Saving…") : lt ? u("Add a title to save") : F ? u("Unsaved") : N ? u("Saved") : ""
					}),
					/* @__PURE__ */ j(ae, { status: F && $ ? "changed" : st }),
					qe.map((e) => /* @__PURE__ */ j(e.component, { ...Y }, e.id)),
					/* @__PURE__ */ j(se, {
						content: u("Entry details"),
						shortcut: "mod+.",
						children: /* @__PURE__ */ j(E, {
							icon: "sidebar",
							label: u("Entry details"),
							active: H,
							onClick: $e
						})
					}),
					N && /* @__PURE__ */ j(ne, {
						trigger: /* @__PURE__ */ j(E, {
							icon: "more",
							label: u("More Actions")
						}),
						items: [
							$ && N.uri ? {
								label: u("View on Site"),
								icon: "external",
								onSelect: () => {
									window.open(N.uri, "_blank", "noopener");
								}
							} : null,
							V.duplicate && {
								label: u("Duplicate"),
								icon: "copy",
								disabled: K || F,
								description: K || F ? u("Save changes before duplicating") : void 0,
								onSelect: () => {
									We();
								}
							},
							V.discard && N.hasDraft && {
								label: u("Discard Unpublished Changes"),
								icon: "undo",
								onSelect: () => {
									He("entries/discard-draft");
								}
							},
							V.unpublish && {
								label: u("Unpublish"),
								icon: "eye-off",
								onSelect: () => {
									He("entries/unpublish");
								}
							},
							V.delete && {
								label: u("Delete"),
								icon: "trash",
								danger: !0,
								onSelect: Ue
							}
						]
					}),
					V.publish ? /* @__PURE__ */ M(A, { children: [/* @__PURE__ */ j(x, {
						variant: "publish",
						disabled: ct,
						loading: K,
						onClick: () => {
							ze();
						},
						children: u(st === "scheduled" ? "Publish now" : $ ? "Publish Changes" : "Publish")
					}), /* @__PURE__ */ j(ne, {
						trigger: /* @__PURE__ */ j(E, {
							icon: "chevron-down",
							label: u("Publication options"),
							disabled: K
						}),
						items: [{
							label: u(st === "scheduled" ? "Change schedule" : $ ? "Publication date…" : "Schedule…"),
							onSelect: () => Me(!0)
						}]
					})] }) : pe && /* @__PURE__ */ j(x, {
						variant: "primary",
						disabled: !F || K,
						loading: K,
						onClick: () => {
							J();
						},
						children: u("Save Draft")
					})
				] })
			}),
			s && /* @__PURE__ */ j(O, {
				message: s,
				onRetry: d,
				compact: !0
			}),
			Z.error && /* @__PURE__ */ j("div", {
				role: "alert",
				className: "border-b border-danger/20 p-3 text-sm text-danger",
				children: Z.error
			}),
			D.error && /* @__PURE__ */ j(Se, {
				message: D.error.message,
				conflict: !!R,
				dirty: F,
				onReload: Ve,
				onKeepMine: Ke,
				onRetry: () => {
					q(G.current);
				}
			}),
			ot && at ? /* @__PURE__ */ j("div", {
				className: "min-h-0 flex-1",
				children: /* @__PURE__ */ j(g, {
					fallback: /* @__PURE__ */ j("div", {
						className: "grid h-full place-items-center",
						children: /* @__PURE__ */ j(ie, {})
					}),
					children: /* @__PURE__ */ j(ot.component, { ...at })
				})
			}) : /* @__PURE__ */ M("div", {
				className: "flex min-h-0 flex-1",
				children: [/* @__PURE__ */ j("div", {
					className: "min-w-0 flex-1 overflow-y-auto",
					children: /* @__PURE__ */ M("article", {
						className: "mx-auto w-full max-w-[784px] px-6 pb-24 pt-12 md:px-8 md:pt-16",
						children: [
							it,
							X?.type === "blocks" ? /* @__PURE__ */ j(C, {
								icon: "blocks",
								title: u("Block editor unavailable")
							}) : X && /* @__PURE__ */ j("div", {
								className: "mt-8",
								"data-cms-body": !0,
								children: /* @__PURE__ */ j(w, {
									bare: !0,
									fields: [X],
									values: P.data,
									onChange: Le,
									errors: L,
									disabled: !Y.editable,
									context: {
										...nt,
										title: P.title
									}
								})
							}),
							Ye.map((e) => /* @__PURE__ */ j(e.component, { ...Y }, e.id))
						]
					})
				}), /* @__PURE__ */ j(te, {
					open: H,
					onOpenChange: U,
					title: e.singular,
					children: rt
				})]
			}),
			je && /* @__PURE__ */ j(ye, {
				entry: N,
				busy: K,
				onClose: () => Me(!1),
				onPublish: (e) => ze(e)
			}),
			Ne && N && /* @__PURE__ */ j(xe, {
				entry: N,
				collection: e,
				busy: K || Fe,
				onClose: () => Pe(!1),
				onMove: Ge
			})
		]
	});
}
function Se({ message: e, conflict: t, dirty: n, onReload: r, onKeepMine: i, onRetry: a }) {
	return /* @__PURE__ */ M("div", {
		role: "alert",
		className: "flex flex-wrap items-center gap-2 border-b border-warning/30 bg-warning/8 px-4 py-2 text-sm",
		children: [
			/* @__PURE__ */ j(T, {
				name: "warning",
				size: 15
			}),
			/* @__PURE__ */ j("span", {
				className: "min-w-0 flex-1",
				children: e
			}),
			t ? /* @__PURE__ */ M(A, { children: [/* @__PURE__ */ j(x, {
				size: "xs",
				onClick: r,
				children: u("Load Their Version")
			}), n && /* @__PURE__ */ j(x, {
				size: "xs",
				onClick: i,
				children: u("Keep Mine")
			})] }) : /* @__PURE__ */ j(x, {
				size: "xs",
				onClick: a,
				children: u("Retry")
			})
		]
	});
}
function Ce() {
	(document.querySelector("[data-cms-body] [contenteditable=\"true\"], [data-cms-body] textarea, [data-cms-body] input") ?? document.querySelector("[data-cms-fields] input, [data-cms-fields] textarea"))?.focus();
}
function we({ collection: e, count: t, children: n }) {
	let r = `cms.properties.${e}`, [i, a] = y(() => localStorage.getItem(r) !== "closed");
	return _(() => {
		let e = () => a(!0);
		return window.addEventListener("cms.fields.reveal", e), () => window.removeEventListener("cms.fields.reveal", e);
	}, []), /* @__PURE__ */ M("div", {
		className: "mt-6",
		"data-cms-fields": i ? "" : void 0,
		children: [i && /* @__PURE__ */ j("div", {
			className: "space-y-px",
			children: n
		}), /* @__PURE__ */ M("button", {
			type: "button",
			onClick: () => {
				localStorage.setItem(r, i ? "closed" : "open"), a(!i);
			},
			"aria-expanded": i,
			className: "-ml-1.5 mt-2 flex h-7 items-center gap-1.5 rounded-xs px-1.5 text-xs text-faint transition-colors hover:bg-hover hover:text-muted",
			children: [/* @__PURE__ */ j(T, {
				name: i ? "chevron-up" : "chevron-down",
				size: 12
			}), i ? u("Hide Properties") : s(t, "{count} property", "{count} properties")]
		})]
	});
}
var Te = [
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
function Ee({ field: e, value: t, onChange: n, error: r, disabled: i, context: a, values: o }) {
	return /* @__PURE__ */ M("div", {
		className: "grid grid-cols-[148px_minmax(0,1fr)] items-start gap-3 py-0.5",
		children: [/* @__PURE__ */ j("div", {
			className: "flex h-8 items-center truncate text-sm text-muted",
			title: e.instructions ?? e.label,
			children: e.label
		}), /* @__PURE__ */ j("div", {
			className: "min-w-0",
			children: /* @__PURE__ */ j(w, {
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
export { L as default };
