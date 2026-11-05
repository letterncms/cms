import { CmsError as e, blockNavigation as t, can as n, events as r, invalidate as i, locale as a, navigate as o, panelsFor as s, plural as c, registry as l, run as u, t as d, timeAgo as f, useAbility as p, useConfig as m, useLocation as h, useManifest as g, useScreenContext as _ } from "@letterncms/sdk";
import { Suspense as v, useEffect as y, useMemo as ee, useRef as b, useState as x, useSyncExternalStore as S } from "react";
import { Button as C, Dialog as w, EmptyState as T, Fields as E, Icon as D, IconButton as te, InspectorPanel as ne, Menu as re, NotFoundState as O, Notice as ie, Page as ae, PersonPicker as k, QueryError as A, ScreenSidebar as j, Spinner as oe, StatusDot as se, Tabs as ce, Tooltip as le, Topbar as ue, cn as de, confirm as fe, entryActionAvailability as pe, fieldControlId as me, slugify as M, statusLabel as he, toast as ge, useShortcut as _e, useWideInspector as ve, wideFieldTypes as N } from "@letterncms/ui";
import { Fragment as P, jsx as F, jsxs as I } from "react/jsx-runtime";
// admin/src/useCollection.ts
function L(e) {
	let t = g().collections.find((t) => t.handle === e), n = p("collections/get", { handle: e }, { staleTime: 6e4 });
	return {
		summary: t,
		collection: n.data,
		isLoading: n.isLoading,
		error: n.error
	};
}
// admin/src/entrySession.ts
var R = (e) => ({
	title: e.title,
	slug: e.slug,
	data: e.data,
	authorId: e.authorId
}), ye = (e, t) => e.title === t.title && e.slug === t.slug && e.authorId === t.authorId && JSON.stringify(e.data) === JSON.stringify(t.data), z = class {
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
		}, n = !this.state.entry || !ye(t, R(this.state.entry));
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
					working: r === this.edit ? R(i) : this.state.working,
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
					working: t === this.edit ? R(n) : this.state.working,
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
			...e ? { working: R(e) } : {},
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
function be(e, n, r, a, o, s) {
	let c = b(!0), l = b(window.location.pathname);
	y(() => (c.current = !0, () => {
		c.current = !1;
	}), []);
	let [f] = x(() => new z(e, n, async (e, t, n) => {
		let o = e && !s.edit && n.publish ? await u("entries/publish", {
			id: e.id,
			...n.at ? { at: n.at } : {},
			expectedVersion: n.expectedVersion ?? e.version
		}) : e ? await u("entries/update", {
			id: e.id,
			...t,
			publish: !!n.publish,
			...n.at ? { at: n.at } : {},
			expectedVersion: n.expectedVersion ?? e.version
		}) : await u("entries/create", {
			collection: r,
			locale: a,
			...t,
			slug: t.slug || void 0,
			status: n.publish ? "published" : "draft",
			...n.at ? { at: n.at } : {}
		});
		return !e && c.current && window.location.pathname === l.current && window.history.replaceState(window.history.state, "", `${window.__CMS__.base}/content/${r}/${o.id}${a ? `?locale=${encodeURIComponent(a)}` : ""}`), i("entries/", "content/", "collections/overview"), o;
	})), p = S(f.subscribe, f.get), m = p.entry ? s.edit : s.create, h = b(void 0), g = () => clearTimeout(h.current);
	y(() => (g(), m && o > 0 && p.dirty && p.phase !== "saving" && !p.error && !p.conflict && p.working.title.trim() && (h.current = setTimeout(() => void f.save().catch(() => {}), o)), g), [
		f,
		p,
		o,
		m
	]), y(() => t(() => f.get().dirty || f.get().phase === "saving" ? d("Discard unsaved changes?") : null), [f]), y(() => {
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
function xe(e, t, n) {
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
function B(e, t, n) {
	return t?.uri ? t.uri === "/" ? "/" : t.uri.replace(/[^/]+$/, n || t.slug) : (e.route ?? "/{slug}").replace("{parent_uri}/", "").replace("{slug}", n || "…").replace(/\{[a-z_]+\}/g, "…").replace(/\/+/g, "/");
}
function Se({ props: e, working: t, fields: r, titleInDetails: i, update: o }) {
	let { entry: s, collection: c, editable: l, errors: u } = e, f = g(), m = f.collections.find((e) => e.handle === c.handle), h = c.system === !0, _ = n("collections.manage"), v = p("entries/lookup", { ids: s?.parentId ? [s.parentId] : [] }, { enabled: _ && !!s?.parentId }), y = !!m?.within, ee = p("pages/builtin", {}, { enabled: y }), b = ee.data?.find((e) => e.collection === c.handle)?.pages.find((e) => e.handle === (s?.slug ?? t.slug)), x = (e) => new Intl.DateTimeFormat(a(), {
		dateStyle: "medium",
		timeStyle: "short",
		timeZone: f.site.timezone
	}).format(new Date(e)), S = (e) => e.section === "sidebar" ? "main" : e.section ?? "main", C = r.filter((e) => S(e) === "main"), w = [...new Set(r.map(S))].filter((e) => e !== "main").map((e) => {
		let t = r.filter((t) => S(t) === e), n = e.replace(/[_-]/g, " ").replace(/\b\w/g, (e) => e.toUpperCase());
		return {
			group: e,
			inside: t,
			heading: t.length === 1 && t[0].label?.toLowerCase() === n.toLowerCase() ? null : n
		};
	}), T = s?.displayStatus ?? "draft", D = {
		entry: s ?? void 0,
		collection: c.handle,
		locale: s?.locale ?? f.site.defaultLocale
	}, te = [
		...!h || c.route || m?.within ? [[d("Status"), /* @__PURE__ */ F(se, {
			status: T,
			label: he(T),
			className: "text-text"
		}, "status")]] : [],
		...s?.publishedAt && T !== "draft" ? [[d(T === "scheduled" ? "Goes Live" : "Published"), /* @__PURE__ */ F("time", {
			dateTime: s.publishedAt,
			title: f.site.timezone,
			children: x(s.publishedAt)
		}, "published")]] : [],
		..._ ? [
			...s && c.structure === "tree" ? [[d("Parent"), s.parentId ? v.data?.[0]?.title ?? (v.isLoading ? d("Loading…") : "") : d("None")]] : [],
			...m?.within ? [] : [[d("Collection"), c.title]],
			...f.site.locales.length > 1 ? [[d("Language"), s?.locale ?? f.site.defaultLocale]] : [],
			...s?.createdAt ? [[d("Created"), x(s.createdAt)]] : [],
			...s?.updatedAt ? [[d("Updated"), x(s.updatedAt)]] : [],
			...s ? [[d("ID"), /* @__PURE__ */ F("span", {
				className: "block select-all truncate font-mono text-xs text-faint",
				title: s.id,
				children: s.id
			}, "id")]] : []
		] : []
	], ne = (n) => /* @__PURE__ */ F(V, {
		field: n,
		error: u[n.handle],
		children: /* @__PURE__ */ F(E, {
			bare: !0,
			fields: [{
				...n,
				width: "full",
				size: n.size ?? "sm",
				rows: n.type === "textarea" ? n.rows ?? 3 : n.rows
			}],
			values: t.data,
			onChange: e.setValue,
			errors: u,
			disabled: !l,
			context: D
		})
	}, n.handle);
	return /* @__PURE__ */ I("div", { children: [
		/* @__PURE__ */ I(Ce, { children: [
			i && /* @__PURE__ */ F(V, {
				field: {
					handle: "title",
					type: "text",
					label: d("Title")
				},
				error: u.title,
				children: /* @__PURE__ */ F(E, {
					bare: !0,
					fields: [{
						handle: "title",
						type: "text",
						label: d("Title"),
						size: "sm"
					}],
					values: { title: t.title },
					onChange: (e, t) => o({ title: t ?? "" }),
					errors: u,
					disabled: !l
				})
			}),
			y ? /* @__PURE__ */ I("div", {
				className: "flex min-h-7 items-start gap-2",
				children: [/* @__PURE__ */ F("span", {
					className: "flex h-7 w-[88px] shrink-0 items-center text-xs text-muted",
					children: d("URL")
				}), /* @__PURE__ */ F("span", {
					className: "flex h-7 min-w-0 flex-1 items-center",
					children: b?.path ? /* @__PURE__ */ F("span", {
						className: "truncate px-1 font-mono text-xs text-faint",
						title: b.path,
						children: b.path
					}) : /* @__PURE__ */ F("span", {
						className: "truncate px-1 text-xs text-faint",
						children: ee.isLoading ? "…" : d("Shown inside other pages")
					})
				})]
			}) : /* @__PURE__ */ F(V, {
				field: {
					handle: "slug",
					type: "text",
					label: c.route ? d("URL") : d("Handle")
				},
				error: u.slug,
				children: /* @__PURE__ */ F(E, {
					bare: !0,
					fields: [c.route ? {
						handle: "slug",
						type: "slug",
						label: d("URL"),
						component: "uri",
						uri: B(c, s, t.slug),
						size: "sm"
					} : {
						handle: "slug",
						type: "text",
						label: d("Handle"),
						mono: !0,
						max: 180,
						size: "sm"
					}],
					values: {
						title: t.title,
						slug: t.slug || M(t.title)
					},
					onChange: (e, t) => o({ [e]: t ?? "" }),
					errors: u,
					disabled: !l
				})
			}),
			!h && /* @__PURE__ */ F(V, {
				field: {
					handle: "authorId",
					type: "person",
					label: d("Author")
				},
				error: u.authorId,
				children: /* @__PURE__ */ F(k, {
					id: "f-authorId",
					size: "sm",
					"aria-describedby": u.authorId ? "f-authorId-error" : void 0,
					value: t.authorId ? [t.authorId] : [],
					max: 1,
					disabled: !l,
					label: d("Assign Author"),
					onChange: (e) => o({ authorId: e[0] ?? null })
				})
			}),
			C.map(ne)
		] }),
		w.map(({ group: e, inside: t, heading: n }) => /* @__PURE__ */ F(Ce, {
			title: n,
			children: t.map(ne)
		}, e)),
		te.length > 0 && /* @__PURE__ */ I(Ce, {
			title: d("Info"),
			children: [/* @__PURE__ */ F("dl", {
				className: "m-0 space-y-1",
				children: te.map(([e, t]) => /* @__PURE__ */ I("div", {
					className: "flex min-h-7 items-start gap-2",
					children: [/* @__PURE__ */ F("dt", {
						className: "flex h-7 w-[88px] shrink-0 items-center truncate text-xs text-muted",
						children: e
					}), /* @__PURE__ */ F("dd", {
						className: "m-0 min-w-0 flex-1 break-words py-1 text-sm text-text",
						children: t
					})]
				}, e))
			}), s?.parentId && v.isError && /* @__PURE__ */ F(A, {
				message: v.error.message,
				onRetry: () => void v.refetch(),
				compact: !0
			})]
		})
	] });
}
function Ce({ title: e, children: t }) {
	return /* @__PURE__ */ I("section", {
		className: de("border-b border-border px-4 pb-3 last:border-b-0", !e && "pt-3"),
		children: [e && /* @__PURE__ */ F("h3", {
			className: "m-0 flex h-10 items-center text-xs font-semibold text-ink",
			children: e
		}), /* @__PURE__ */ F("div", {
			className: "space-y-1",
			children: t
		})]
	});
}
function V({ field: e, error: t, children: n }) {
	let r = e.type === "toggle", i = N.includes(e.type), a = !t && e.instructions ? /* @__PURE__ */ F("p", {
		className: "m-0 mt-1 text-xs text-muted",
		children: e.instructions
	}) : null, o = /* @__PURE__ */ F("label", {
		htmlFor: me(e),
		className: de("flex h-7 min-w-0 shrink-0 items-center text-xs text-muted", !i && "w-[88px]"),
		children: /* @__PURE__ */ F("span", {
			className: "truncate",
			children: e.label
		})
	});
	return r ? /* @__PURE__ */ I("div", {
		className: "py-1",
		children: [n, a]
	}) : i ? /* @__PURE__ */ I("div", {
		className: "pb-1",
		children: [
			o,
			n,
			a
		]
	}) : /* @__PURE__ */ I("div", {
		className: "flex min-h-7 items-start gap-2",
		children: [o, /* @__PURE__ */ I("div", {
			className: "min-w-0 flex-1",
			children: [n, a]
		})]
	});
}
function we({ entry: e, changes: t, busy: n, onClose: r, onPublish: i }) {
	let a = g(), [o, s] = x(e?.publishedAt ?? null), [c, l] = x(), u = e?.displayStatus === "scheduled", f = e?.status === "published" && !u, p = o ? new Date(o).getTime() : NaN, m = p > Date.now(), h = !!o && p !== new Date(e?.publishedAt ?? 0).getTime(), _ = d(m || !o && !f ? u ? "Change Schedule" : "Schedule" : f ? t ? "Publish Changes" : "Change Date" : "Publish"), v = !o || f && !t && !h || u && m && !h;
	return /* @__PURE__ */ F(w, {
		open: !0,
		onOpenChange: (e) => !e && !n && r(),
		title: d(u ? "Change Schedule" : f ? "Publication Date" : "Schedule"),
		footer: /* @__PURE__ */ I(P, { children: [/* @__PURE__ */ F(C, {
			disabled: n,
			onClick: r,
			children: d("Cancel")
		}), /* @__PURE__ */ F(C, {
			variant: "publish",
			loading: n,
			disabled: v,
			onClick: async () => {
				Number.isFinite(p) ? f && m ? l(d("Unpublish this entry before scheduling it for a future date.")) : await i(o) && r() : l(d("Choose a publication date and time."));
			},
			children: _
		})] }),
		children: /* @__PURE__ */ F(E, {
			fields: [{
				handle: "at",
				type: "date",
				time: !0,
				timezone: a.site.timezone,
				label: d("Date and Time"),
				required: !0
			}],
			values: { at: o },
			onChange: (e, t) => {
				s(t), l(void 0);
			},
			errors: c ? { at: c } : {},
			disabled: n
		})
	});
}
// admin/src/EntryHistory.tsx
function Te({ entry: e, editable: t, onRestore: n }) {
	let r = p("entries/revisions", { id: e?.id ?? "" }, { enabled: !!e });
	if (!e) return /* @__PURE__ */ F("p", {
		className: "m-0 px-4 py-3 text-sm text-muted",
		children: d("History starts after the first save.")
	});
	if (r.isLoading) return /* @__PURE__ */ F("div", {
		className: "grid place-items-center p-6 text-faint",
		children: /* @__PURE__ */ F(oe, {})
	});
	if (r.isError && !r.data) return /* @__PURE__ */ F(A, {
		message: r.error.message,
		onRetry: () => void r.refetch()
	});
	let i = {
		create: d("Created"),
		save: d("Edited"),
		publish: d("Published"),
		unpublish: d("Unpublished"),
		restore: d("Restored"),
		discard: d("Discarded Changes"),
		move: d("Moved")
	};
	return /* @__PURE__ */ I(P, { children: [
		r.isError && /* @__PURE__ */ F(A, {
			message: r.error.message,
			onRetry: () => void r.refetch(),
			compact: !0
		}),
		r.data?.length === 0 && /* @__PURE__ */ F("p", {
			className: "m-0 px-4 py-3 text-sm text-muted",
			children: d("No history yet.")
		}),
		/* @__PURE__ */ F("ol", {
			className: "m-0 list-none px-2 py-2",
			children: (r.data ?? []).map((r, o, s) => /* @__PURE__ */ I("li", {
				className: "group relative flex min-h-12 items-start gap-2.5 rounded-md px-2 py-2 hover:bg-hover",
				children: [
					o < s.length - 1 && /* @__PURE__ */ F("span", {
						className: "absolute bottom-[-10px] left-[11.5px] top-[22px] w-px bg-border",
						"aria-hidden": !0
					}),
					/* @__PURE__ */ F("span", {
						className: "relative grid h-5 w-2 shrink-0 place-items-center",
						"aria-hidden": !0,
						children: /* @__PURE__ */ F("span", { className: de("size-2 rounded-full", r.action === "publish" ? "bg-success" : "bg-surface shadow-[inset_0_0_0_1.5px_var(--cms-border-strong)]") })
					}),
					/* @__PURE__ */ I("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ I("div", {
							className: "truncate text-sm text-text",
							children: [i[r.action] ?? r.action, r.title && r.title !== e.title && /* @__PURE__ */ I("span", {
								className: "text-muted",
								children: [" · ", r.title]
							})]
						}), /* @__PURE__ */ I("div", {
							className: "truncate text-xs text-faint",
							children: [
								r.user?.name ?? d("System"),
								" · ",
								/* @__PURE__ */ F("time", {
									dateTime: r.createdAt,
									title: new Date(r.createdAt).toLocaleString(a(), {
										dateStyle: "medium",
										timeStyle: "short"
									}),
									children: f(r.createdAt)
								})
							]
						})]
					}),
					o > 0 && t && /* @__PURE__ */ F(C, {
						size: "xs",
						variant: "secondary",
						className: "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 max-md:opacity-100",
						onClick: () => n(r.id),
						children: d("Restore")
					})
				]
			}, r.id))
		})
	] });
}
// admin/src/EntryMoveDialog.tsx
function Ee(e, t, n = []) {
	return e.flatMap((e) => {
		if (e.id === t) return [];
		let r = [...n, e.title || d("Untitled")];
		return [{
			value: e.id,
			label: r.join(" / ")
		}, ...Ee(e.children ?? [], t, r)];
	});
}
function De({ entry: e, collection: t, busy: n, onClose: r, onMove: i }) {
	let a = p("entries/tree", {
		collection: t.handle,
		locale: e.locale
	}, { refetchOnWindowFocus: !1 }), [o, s] = x(e.parentId), [c, l] = x(null), [u, f] = x(!1), m = b(!1), h = [{
		value: "",
		label: d("Root")
	}, ...Ee(a.data ?? [], e.id)], g = o === null || h.some((e) => e.value === o), _ = !!a.data && !a.isError, v = n || u, y = c ?? (_ && !g ? d("This parent is no longer available. Choose another parent.") : void 0);
	return /* @__PURE__ */ I(w, {
		open: !0,
		title: d("Move {type}", { type: t.singular }),
		description: d("Choose a new parent for “{title}”.", { title: e.title }),
		onOpenChange: (e) => {
			!e && !v && r();
		},
		footer: /* @__PURE__ */ I(P, { children: [/* @__PURE__ */ F(C, {
			disabled: v,
			onClick: r,
			children: d("Cancel")
		}), /* @__PURE__ */ F(C, {
			variant: "primary",
			loading: v,
			disabled: !_ || !g || o === e.parentId,
			onClick: async () => {
				if (!m.current && !v && _ && g && o !== e.parentId) {
					m.current = !0, f(!0), l(null);
					try {
						await i(o) ? r() : l(d("Could not move this entry. Try again."));
					} catch (e) {
						l(e instanceof Error ? e.message : d("Could not move this entry. Try again."));
					} finally {
						f(!1), m.current = !1;
					}
				}
			},
			children: d("Move")
		})] }),
		children: [a.isLoading || !a.data && a.isFetching ? /* @__PURE__ */ I("div", {
			role: "status",
			className: "flex items-center gap-2 py-4 text-sm text-muted",
			children: [/* @__PURE__ */ F(oe, { size: 14 }), d("Loading available parents…")]
		}) : /* @__PURE__ */ I(P, { children: [a.isError && /* @__PURE__ */ F(A, {
			message: a.error.message,
			onRetry: () => void a.refetch()
		}), a.data && /* @__PURE__ */ F(E, {
			fields: [{
				handle: "parentId",
				type: "select",
				label: d("Parent"),
				required: !0,
				options: g ? h : [...h, {
					value: o,
					label: d("Unavailable parent")
				}],
				instructions: d("Choose Root to place this entry at the top level.")
			}],
			values: { parentId: o ?? "" },
			onChange: (e, t) => {
				s(t || null), l(null);
			},
			errors: y ? { parentId: y } : {},
			disabled: v || a.isError
		})] }), /* @__PURE__ */ I("div", {
			className: "mt-4 space-y-2 text-xs text-muted",
			children: [e.uri && /* @__PURE__ */ F("p", {
				className: "m-0",
				children: d("Moving a published entry can change its live URL and the URLs of its descendants.")
			}), /* @__PURE__ */ F("p", {
				className: "m-0",
				children: d("Saved unpublished changes stay in the working copy. Moving does not publish them.")
			})]
		})]
	});
}
// admin/src/EntryEditor.tsx
function H({ params: e }) {
	let { collection: t, summary: n, isLoading: r, error: a } = L(e.collection), c = e.id === "new", l = U(e.id, c), u = g(), { query: f } = h(), p = Oe(u, e.collection, l.data?.locale ?? f.locale), m = () => {
		l.refetch(), i("collections/get");
	}, _ = t?.resolvedFields.find((e) => e.handle === t.body), v = !!_ && s("entry.editor", { bodyField: _ }).length > 0 && /* @__PURE__ */ F(j, {
		title: d("Outline"),
		backTo: p.path,
		backLabel: p.label,
		children: null
	});
	if (r || !c && l.isLoading) return /* @__PURE__ */ I("div", {
		className: "flex h-full flex-col",
		children: [
			v,
			/* @__PURE__ */ F(ue, { back: {
				to: p.path,
				label: p.label
			} }),
			/* @__PURE__ */ F("div", {
				className: "grid flex-1 place-items-center",
				children: /* @__PURE__ */ F(oe, {})
			})
		]
	});
	let y = a ?? l.error, ee = !t || !c && !l.data, b = u.collections.find((t) => t.handle === (p.within?.handle ?? e.collection)), x = [...b ? [{
		label: b.title,
		to: p.path,
		icon: b.icon
	}] : [], { label: d("Not Found") }];
	if (ee && y && ![
		"not_found",
		"forbidden",
		"invalid_input"
	].includes(y.type)) return /* @__PURE__ */ F(ae, {
		crumbs: b ? x.slice(0, 1) : [],
		children: /* @__PURE__ */ F(A, {
			message: y.message,
			onRetry: m
		})
	});
	if (!t || !n || !c && !l.data) {
		let e = b && /* @__PURE__ */ F(C, {
			onClick: () => o(p.path),
			children: d("Back to {label}", { label: b.title })
		});
		return /* @__PURE__ */ F(ae, {
			crumbs: x,
			children: y?.type === "forbidden" ? /* @__PURE__ */ F(T, {
				icon: "lock",
				title: d("Access denied"),
				description: y.message,
				action: e
			}) : /* @__PURE__ */ F(O, {
				icon: b?.icon ?? "file",
				action: e
			})
		});
	}
	return /* @__PURE__ */ I(P, { children: [v, /* @__PURE__ */ F(ke, {
		collection: t,
		initial: c ? null : l.data,
		can: n.can
	}, `${e.collection}:${e.id}`)] });
}
function Oe(e, t, n) {
	let r = e.collections.find((e) => e.handle === t), i = e.collections.find((e) => e.handle === r?.within), a = i ?? r, o = n && n !== e.site.defaultLocale && e.site.locales.includes(n);
	return {
		path: `/content/${a?.handle ?? t}${o ? `?locale=${n}` : ""}`,
		label: a?.title ?? "",
		within: i
	};
}
function U(e, t) {
	return p("entries/get", { id: e }, {
		enabled: !t,
		refetchOnWindowFocus: !1
	});
}
function ke({ collection: e, initial: t, can: n }) {
	let a = g(), { query: c } = h(), f = m("content").autosave ?? 1200, p = t?.locale ?? (a.site.locales.includes(c.locale ?? "") ? c.locale : a.site.defaultLocale), w = Oe(a, e.handle, p), D = w.path, O = w.within?.singular ?? a.collections.find((t) => t.handle === e.handle)?.singular ?? e.singular, ae = ee(() => ({
		...e,
		singular: O
	}), [e, O]), k = be(t, {
		title: t?.title ?? "",
		slug: t?.slug ?? "",
		authorId: t ? t.authorId : a.user.id,
		data: t?.data ?? Object.fromEntries(e.resolvedFields.map((e) => [e.handle, e.default ?? null]))
	}, e.handle, p, f, n), A = k.editable, { entry: j, working: M, dirty: N, phase: L, errors: R, conflict: ye, update: z, session: B } = k, Ce = !!g().collections.find((t) => t.handle === e.handle)?.within, V = {
		...pe(n, j),
		...Ce ? { duplicate: !1 } : {}
	}, Ee = ve(), [H, U] = x(() => Ee), [ke, Ie] = x(null), [Le, Re] = x(!1), ze = `cms.entry.panel.${e.handle}`, [Be, Ve] = x(() => localStorage.getItem(ze) || "details"), [He, Ue] = x(!1), [We, Ge] = x(!1), [Ke, W] = x(!1), G = b(() => k.save()), qe = b({});
	S(l.panels.subscribe, l.panels.version);
	let K = L === "saving";
	_({
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
				locale: p,
				fields: n.data
			};
		},
		flush: async () => {
			let e = B.get();
			A && e.dirty && e.working.title.trim() && await k.save().catch(() => {});
		}
	}), y(() => r.on("content.changed", () => {
		let e = B.get().entry?.id;
		e && u("entries/get", { id: e }).then((e) => {
			let t = B.get();
			t.dirty || t.phase === "saving" || e.version === t.entry?.version || B.command(async () => e);
		}).catch(() => {});
	}), [B]);
	let Je = (e, t) => {
		z({ data: {
			...B.get().working.data,
			[e]: t
		} });
	}, q = async (e) => {
		try {
			return await e();
		} catch (e) {
			ge.error(e);
			return;
		}
	}, J = async (e = {}) => {
		qe.current = e, G.current = () => k.save(e);
		try {
			return await k.save(e);
		} catch {
			return;
		}
	}, Ye = async () => {
		qe.current = {}, G.current = () => k.save(), await k.save();
	}, Xe = async (e) => {
		if (!V.publish) return !1;
		Re(!0);
		let t = await J({
			publish: !0,
			...e ? { at: e } : {}
		});
		return Re(!1), t ? (ge.success(t.displayStatus === "scheduled" ? d("Scheduled") : d("Published")), !0) : !1;
	}, Ze = () => !B.get().dirty || fe({
		title: d("Discard unsaved changes?"),
		description: d("Your unsaved edits will be replaced."),
		confirm: d("Discard changes"),
		danger: !0
	}), Qe = async () => {
		await Ze() && (k.cancel(), W(!0), G.current = Qe, await q(() => B.command((e) => u("entries/get", { id: e.id }))), W(!1));
	}, $e = async (e, t = {}) => {
		await Ze() && (k.cancel(), W(!0), G.current = () => $e(e, t), await q(() => B.command((n) => u(e, {
			...e === "entries/restore" ? {} : { id: n.id },
			...t,
			expectedVersion: n.version
		}))), W(!1), i("entries/", "content/"));
	}, et = async () => {
		j && V.delete && await fe({
			title: d("Delete “{title}”?", { title: j.title }),
			description: d("This permanently deletes the entry and its history."),
			confirm: d("Delete"),
			danger: !0
		}) && (k.cancel(), G.current = et, await q(async () => {
			await B.command(async (e) => (await u("entries/delete", {
				id: e.id,
				expectedVersion: e.version
			}), e)), B.reset(), i("entries/", "content/"), o(D);
		}));
	}, tt = async () => {
		let t = B.get(), n = t.entry;
		V.duplicate && n && !t.dirty && t.phase !== "saving" && await q(async () => {
			let t = await u("entries/duplicate", {
				id: n.id,
				expectedVersion: n.version
			});
			o(`/content/${e.handle}/${t.id}`);
		});
	}, nt = async (e) => {
		if (!V.move) return !1;
		k.cancel(), W(!0), G.current = () => nt(e);
		try {
			if (B.get().dirty && !await k.save()) return !1;
			let t = await B.command((t) => u("entries/move", {
				id: t.id,
				parentId: e,
				expectedVersion: t.version
			}));
			return i("entries/", "content/"), !!t;
		} catch (e) {
			return ge.error(e), !1;
		} finally {
			W(!1);
		}
	}, rt = async () => {
		j && ye && await q(async () => {
			let e = ye.version ?? (await u("entries/get", { id: j.id })).version;
			await J({
				...qe.current,
				expectedVersion: e
			});
		});
	}, Y = {
		entry: j,
		collection: ae,
		content: M,
		values: M.data,
		title: M.title,
		setValue: Je,
		save: Ye,
		reload: Qe,
		editable: A && !Ke,
		can: n,
		errors: R
	}, it = s("entry.toolbar", Y);
	S(l.entryActions.subscribe, l.entryActions.version);
	let at = l.entryActions.all().filter((e) => e.when?.(Y) ?? !0).sort((e, t) => (e.order ?? 50) - (t.order ?? 50)), ot = s("entry.sidebar", Y), st = s("entry.body", Y), ct = e.body, X = e.resolvedFields.find((e) => e.handle === ct), Z = xe(e.resolvedFields, ct, [...ot, ...st]), lt = [
		{
			value: "details",
			label: O,
			icon: e.icon || "file"
		},
		{
			value: "history",
			label: d("History"),
			icon: "history"
		},
		...ot.map((e) => ({
			value: e.id,
			label: e.label ?? e.id,
			icon: e.icon
		}))
	], Q = lt.some((e) => e.value === Be) ? Be : "details", ut = (e) => {
		Ve(e), localStorage.setItem(ze, e);
	}, dt = () => {
		H || ut("details"), U(!H);
	}, ft = Z.document.filter((e) => !Pe.includes(e.type)), pt = Z.document.filter((e) => Pe.includes(e.type)), mt = {
		entry: j ?? void 0,
		collection: e.handle,
		locale: p
	}, ht = /* @__PURE__ */ I("div", {
		className: "flex h-full min-h-0 flex-col",
		children: [/* @__PURE__ */ I("div", {
			className: "flex h-12 shrink-0 items-center gap-2 border-b border-border pl-4 pr-2",
			children: [/* @__PURE__ */ F(ce, {
				id: "entry-sidebar",
				value: Q,
				onChange: ut,
				tabs: lt,
				bordered: !1,
				fit: !0,
				className: "h-full min-w-0 flex-1"
			}), /* @__PURE__ */ F(te, {
				icon: "close",
				label: d("Close Panel"),
				size: "xs",
				onClick: () => U(!1)
			})]
		}), /* @__PURE__ */ F("div", {
			role: "tabpanel",
			id: `entry-sidebar-${Q}-panel`,
			"aria-labelledby": `entry-sidebar-${Q}`,
			className: "min-h-0 flex-1 overflow-y-auto",
			children: Q === "details" ? /* @__PURE__ */ F(Se, {
				props: Y,
				working: M,
				fields: X?.type === "blocks" ? [...Z.document, ...Z.sidebar] : Z.sidebar,
				titleInDetails: X?.type === "blocks",
				update: z
			}) : Q === "history" ? /* @__PURE__ */ F(Te, {
				entry: j,
				editable: V.restore && !K,
				onRestore: async (e) => {
					V.restore && await fe({
						title: d("Restore this version?"),
						description: d("The current saved content stays in history."),
						confirm: d("Restore")
					}) && await $e("entries/restore", { revisionId: e });
				}
			}) : ot.filter((e) => e.id === Q).map((e) => /* @__PURE__ */ F(e.component, { ...Y }, e.id))
		})]
	}), gt = /* @__PURE__ */ I(P, { children: [/* @__PURE__ */ F(E, {
		bare: !0,
		fields: [{
			handle: "title",
			type: "text",
			label: d("Title"),
			component: "title",
			placeholder: d("Untitled"),
			autofocus: !j,
			onEnter: () => {
				J(), Me();
			},
			onDown: Me
		}],
		values: { title: M.title },
		onChange: (e, t) => z({ title: t ?? "" }),
		errors: R,
		disabled: !Y.editable
	}), (ft.length > 0 || pt.length > 0) && /* @__PURE__ */ I(Ne, {
		collection: e.handle,
		count: ft.length + pt.length,
		children: [ft.map((e) => /* @__PURE__ */ F(Fe, {
			field: e,
			value: M.data[e.handle],
			onChange: (t) => Je(e.handle, t),
			error: R[e.handle],
			disabled: !Y.editable,
			context: mt,
			values: M.data
		}, e.handle)), pt.length > 0 && /* @__PURE__ */ F(E, {
			fields: pt,
			values: M.data,
			onChange: Je,
			errors: R,
			disabled: !Y.editable,
			context: mt,
			className: "mt-4 !gap-y-4"
		})]
	})] }), _t = X ? {
		...Y,
		footer: /* @__PURE__ */ F(P, { children: st.map((e) => /* @__PURE__ */ F(e.component, { ...Y }, e.id)) }),
		bodyField: X,
		setTitle: (e) => z({ title: e }),
		sidebar: ht,
		sidebarOpen: H,
		setSidebarOpen: U,
		toolbar: ke,
		listPath: D,
		listLabel: w.label
	} : null, vt = _t ? s("entry.editor", _t)[0] : null, $ = j?.displayStatus ?? "draft", yt = j?.status === "published" && $ !== "scheduled", bt = yt && !N && !j?.hasDraft, xt = !j && N && !M.title.trim(), St = M.title || d("Untitled"), Ct = L === "error" ? d("Couldn’t save") : xt ? d("Add a title to save") : K ? d("Saving…") : N ? d("Unsaved") : j ? d("Saved") : "", wt = /* @__PURE__ */ F("span", {
		"aria-hidden": "true",
		title: Ct || void 0,
		className: de("block size-1.5 rounded-full", L === "error" || xt ? "bg-danger" : K || N ? "bg-faint" : "bg-transparent")
	});
	return _e("mod+s", () => {
		A && J();
	}), _e("mod+shift+p", () => {
		V.publish && !bt && M.title.trim() && Xe();
	}), _e("mod+.", dt), y(() => {
		let t = Object.keys(R)[0];
		if (!t) return;
		let n = t.replace(/^data\./, "").split("."), r = n[0], i = Z.claimed.get(r);
		(i || X?.type === "blocks" && (r === "title" || Z.document.some((e) => e.handle === r)) || r === "authorId" || r === "slug" || Z.sidebar.some((e) => e.handle === r)) && (U(!0), ut(i ?? "details")), Z.document.some((e) => e.handle === r) && (localStorage.setItem(`cms.properties.${e.handle}`, "open"), window.dispatchEvent(new Event("cms.fields.reveal"))), requestAnimationFrame(() => {
			let e = document.getElementById(me({ handle: n.at(-1) }, n.slice(0, -1))) ?? document.getElementById(`f-${r}`) ?? document.querySelector(`[data-field="${CSS.escape(r)}"] input, [data-field="${CSS.escape(r)}"] textarea, [data-field="${CSS.escape(r)}"] button`);
			e?.scrollIntoView({ block: "center" }), e?.focus();
		});
	}, [R]), /* @__PURE__ */ I("div", {
		className: "relative flex h-full flex-col",
		children: [
			/* @__PURE__ */ F(ue, {
				back: {
					to: D,
					label: w.label
				},
				title: /* @__PURE__ */ I("span", {
					className: "relative block truncate pr-3.5",
					children: [St, /* @__PURE__ */ F("span", {
						className: "absolute right-0 top-1/2 -translate-y-1/2",
						children: wt
					})]
				}),
				children: /* @__PURE__ */ I(P, { children: [/* @__PURE__ */ I("span", {
					className: "relative min-w-0 truncate pr-3.5 text-sm font-medium text-ink max-sm:hidden lg:hidden",
					children: [St, /* @__PURE__ */ F("span", {
						className: "absolute right-0 top-1/2 -translate-y-1/2",
						children: wt
					})]
				}), vt && /* @__PURE__ */ F("div", {
					ref: Ie,
					className: "flex shrink-0 items-center gap-0.5 empty:hidden"
				})] }),
				actions: /* @__PURE__ */ I(P, { children: [
					/* @__PURE__ */ F("span", {
						role: "status",
						className: "sr-only",
						children: Ct
					}),
					it.map((e) => /* @__PURE__ */ F(e.component, { ...Y }, e.id)),
					/* @__PURE__ */ F(le, {
						content: d("{name} Details", { name: O }),
						shortcut: "mod+.",
						children: /* @__PURE__ */ F(te, {
							icon: "sidebar",
							label: d("{name} Details", { name: O }),
							title: void 0,
							active: H,
							onClick: dt,
							className: "[&_svg]:-scale-x-100"
						})
					}),
					V.publish ? /* @__PURE__ */ F(Ae, {
						labels: [
							he($),
							d("Publish Now"),
							d("Publish Changes"),
							d("Publish")
						],
						children: bt ? /* @__PURE__ */ F(se, {
							status: $,
							label: he($),
							className: "h-7 px-1.5 text-sm"
						}) : /* @__PURE__ */ I(C, {
							variant: "publish",
							disabled: !M.title.trim(),
							loading: Le,
							onClick: () => {
								Xe();
							},
							children: [/* @__PURE__ */ F("span", {
								className: "max-sm:hidden",
								children: d($ === "scheduled" ? "Publish Now" : yt ? "Publish Changes" : "Publish")
							}), /* @__PURE__ */ F("span", {
								className: "sm:hidden",
								children: d("Publish")
							})]
						})
					}) : A && /* @__PURE__ */ F(C, {
						variant: "primary",
						disabled: !N || K,
						loading: K,
						onClick: () => {
							J();
						},
						children: d("Save Draft")
					}),
					/* @__PURE__ */ F(re, {
						trigger: /* @__PURE__ */ F(te, {
							icon: "more",
							label: d("More Actions")
						}),
						items: [
							...at.map((e) => ({
								label: e.label,
								icon: e.icon,
								onSelect: () => e.perform(Y)
							})),
							j && yt && j.uri && !j.hasDraft ? {
								label: d("View on Site"),
								icon: "external",
								onSelect: () => {
									window.open(j.uri, "_blank", "noopener");
								}
							} : null,
							V.publish && {
								label: d($ === "scheduled" ? "Change Schedule" : yt ? "Publication Date…" : "Schedule…"),
								icon: "calendar",
								onSelect: () => Ue(!0)
							},
							j && V.move && e.structure === "tree" && {
								label: d("Move…"),
								icon: "arrow-right",
								onSelect: () => Ge(!0)
							},
							j && V.duplicate && {
								label: d("Duplicate"),
								icon: "copy",
								disabled: K || N,
								description: K || N ? d("Save changes before duplicating") : void 0,
								onSelect: () => {
									tt();
								}
							},
							j && V.discard && j.hasDraft && {
								label: d("Discard Unpublished Changes"),
								icon: "undo",
								onSelect: () => {
									$e("entries/discard-draft");
								}
							},
							j && V.unpublish && {
								label: d("Unpublish"),
								icon: "eye-off",
								onSelect: () => {
									$e("entries/unpublish");
								}
							},
							j && V.delete && {
								separator: !0,
								label: ""
							},
							j && V.delete && {
								label: d("Delete"),
								icon: "trash",
								danger: !0,
								onSelect: et
							}
						]
					})
				] })
			}),
			Z.error && /* @__PURE__ */ F(ie, {
				tone: "danger",
				className: "m-3",
				children: Z.error
			}),
			vt && _t ? /* @__PURE__ */ F("div", {
				className: "min-h-0 flex-1",
				children: /* @__PURE__ */ F(v, {
					fallback: /* @__PURE__ */ F("div", {
						className: "grid h-full place-items-center",
						children: /* @__PURE__ */ F(oe, {})
					}),
					children: /* @__PURE__ */ F(vt.component, { ..._t })
				})
			}) : /* @__PURE__ */ I("div", {
				className: "flex min-h-0 flex-1",
				children: [/* @__PURE__ */ F("div", {
					className: "min-w-0 flex-1 overflow-y-auto",
					children: /* @__PURE__ */ I("article", {
						className: "mx-auto w-full max-w-[784px] px-6 pb-24 pt-12 md:px-8 md:pt-16",
						children: [
							gt,
							X?.type === "blocks" ? /* @__PURE__ */ F(T, {
								icon: "blocks",
								title: d("Block editor unavailable")
							}) : X && /* @__PURE__ */ F("div", {
								className: "mt-8",
								"data-cms-body": !0,
								children: /* @__PURE__ */ F(E, {
									bare: !0,
									fields: [X],
									values: M.data,
									onChange: Je,
									errors: R,
									disabled: !Y.editable,
									context: {
										...mt,
										title: M.title
									}
								})
							}),
							st.map((e) => /* @__PURE__ */ F(e.component, { ...Y }, e.id))
						]
					})
				}), /* @__PURE__ */ F(ne, {
					open: H,
					onOpenChange: U,
					title: O,
					children: ht
				})]
			}),
			He && /* @__PURE__ */ F(we, {
				entry: j,
				changes: N || !!j?.hasDraft,
				busy: K,
				onClose: () => Ue(!1),
				onPublish: (e) => Xe(e)
			}),
			We && j && /* @__PURE__ */ F(De, {
				entry: j,
				collection: ae,
				busy: K || Ke,
				onClose: () => Ge(!1),
				onMove: nt
			}),
			k.error && L === "error" && /* @__PURE__ */ F(je, {
				error: k.error,
				conflict: !!ye,
				dirty: N,
				onReload: Qe,
				onKeepMine: rt,
				onRetry: () => {
					G.current().catch(() => {});
				}
			})
		]
	});
}
function Ae({ labels: e, children: t }) {
	return /* @__PURE__ */ I("span", {
		className: "grid justify-items-end [&>*]:col-start-1 [&>*]:row-start-1",
		children: [e.map((e) => /* @__PURE__ */ F("span", {
			"aria-hidden": !0,
			className: "invisible h-0 overflow-hidden px-2.5 text-sm font-medium max-sm:hidden",
			children: e
		}, e)), t]
	});
}
function je({ error: t, conflict: n, dirty: r, onReload: i, onKeepMine: a, onRetry: o }) {
	let s = t instanceof e && t.status > 0, c = n ? t.message : s && t.type === "invalid_input" ? d("Couldn’t save. Check the highlighted fields.") : s ? d("Couldn’t save. {reason}", { reason: t.message }) : d("Couldn’t save. Check your connection.");
	return /* @__PURE__ */ F("div", {
		className: "pointer-events-none absolute inset-x-0 top-14 z-30 flex justify-center px-4",
		children: /* @__PURE__ */ I("div", {
			role: "alert",
			className: "pointer-events-auto flex min-h-10 max-w-[560px] items-center gap-2.5 rounded-lg border border-border-float bg-float py-1.5 pl-3 pr-1.5 text-sm text-text shadow-pop",
			children: [
				/* @__PURE__ */ F(D, {
					name: "warning",
					size: 16,
					className: "shrink-0 text-danger"
				}),
				/* @__PURE__ */ F("span", {
					className: "min-w-0 flex-1",
					children: c
				}),
				n ? /* @__PURE__ */ I(P, { children: [/* @__PURE__ */ F(C, {
					size: "xs",
					variant: "ghost",
					onClick: i,
					children: d("Load Their Version")
				}), r && /* @__PURE__ */ F(C, {
					size: "xs",
					variant: "ghost",
					onClick: a,
					children: d("Keep Mine")
				})] }) : t.type !== "invalid_input" && /* @__PURE__ */ F(C, {
					size: "xs",
					variant: "ghost",
					onClick: o,
					children: d("Retry")
				})
			]
		})
	});
}
function Me() {
	(document.querySelector("[data-cms-body] [contenteditable=\"true\"], [data-cms-body] textarea, [data-cms-body] input") ?? document.querySelector("[data-cms-fields] input, [data-cms-fields] textarea"))?.focus();
}
function Ne({ collection: e, count: t, children: n }) {
	let r = `cms.properties.${e}`, [i, a] = x(() => localStorage.getItem(r) !== "closed");
	return y(() => {
		let e = () => a(!0);
		return window.addEventListener("cms.fields.reveal", e), () => window.removeEventListener("cms.fields.reveal", e);
	}, []), /* @__PURE__ */ I("div", {
		className: "mt-6",
		"data-cms-fields": i ? "" : void 0,
		children: [i && /* @__PURE__ */ F("div", {
			className: "space-y-px",
			children: n
		}), /* @__PURE__ */ I("button", {
			type: "button",
			onClick: () => {
				localStorage.setItem(r, i ? "closed" : "open"), a(!i);
			},
			"aria-expanded": i,
			className: "-ml-1.5 mt-2 flex h-7 items-center gap-1.5 rounded-xs px-1.5 text-xs text-faint transition-colors hover:bg-hover hover:text-muted",
			children: [/* @__PURE__ */ F(D, {
				name: i ? "chevron-up" : "chevron-down",
				size: 12
			}), i ? d("Hide Properties") : c(t, "{count} property", "{count} properties")]
		})]
	});
}
var Pe = [
	"repeater",
	"blocks",
	"richtext",
	"markdown",
	"json",
	"group",
	"code",
	"fields"
];
function Fe({ field: e, value: t, onChange: n, error: r, disabled: i, context: a, values: o }) {
	return /* @__PURE__ */ I("div", {
		className: "grid grid-cols-[148px_minmax(0,1fr)] items-start gap-3 py-0.5",
		children: [/* @__PURE__ */ F("div", {
			className: "flex h-8 items-center truncate text-sm text-muted",
			title: e.instructions ?? e.label,
			children: e.label
		}), /* @__PURE__ */ F("div", {
			className: "min-w-0",
			children: /* @__PURE__ */ F(E, {
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
export { H as default };
