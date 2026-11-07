import { CmsError as e, blockNavigation as t, can as n, events as r, invalidate as i, locale as a, navigate as o, panelsFor as s, plural as c, registry as l, run as u, t as d, timeAgo as f, useAbility as p, useConfig as m, useLocation as h, useManifest as g, useScreenContext as _ } from "@letterncms/sdk";
import { Suspense as v, useEffect as y, useMemo as ee, useRef as b, useState as x, useSyncExternalStore as S } from "react";
import { Button as C, Dialog as w, EmptyState as T, Fields as E, Icon as D, IconButton as O, InspectorPanel as te, Menu as ne, NotFoundState as k, Notice as re, Page as ie, PersonPicker as A, QueryError as j, ScreenSidebar as M, Spinner as ae, StatusDot as oe, Tabs as se, Tooltip as ce, Topbar as le, cn as ue, confirm as de, entryActionAvailability as fe, fieldControlId as pe, slugify as N, statusLabel as me, toast as he, useShortcut as ge, useWideInspector as _e, wideFieldTypes as P } from "@letterncms/ui";
import { Fragment as F, jsx as I, jsxs as L } from "react/jsx-runtime";
// admin/src/useCollection.ts
function R(e) {
	let t = g().collections.find((t) => t.handle === e), n = p("collections/get", { handle: e }, { staleTime: 6e4 });
	return {
		summary: t,
		collection: n.data,
		isLoading: n.isLoading,
		error: n.error
	};
}
// admin/src/entrySession.ts
var z = (e) => ({
	title: e.title,
	slug: e.slug,
	data: e.data,
	authorId: e.authorId
}), ve = (e, t) => e.title === t.title && e.slug === t.slug && e.authorId === t.authorId && JSON.stringify(e.data) === JSON.stringify(t.data), B = class {
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
		}, n = !this.state.entry || !ve(t, z(this.state.entry));
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
					working: r === this.edit ? z(i) : this.state.working,
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
					working: t === this.edit ? z(n) : this.state.working,
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
			...e ? { working: z(e) } : {},
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
function ye(e, n, r, a, o, s) {
	let c = b(!0), l = b(window.location.pathname);
	y(() => (c.current = !0, () => {
		c.current = !1;
	}), []);
	let [f] = x(() => new B(e, n, async (e, t, n) => {
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
function be(e, t, n) {
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
function V(e, t, n) {
	return t?.uri ? t.uri === "/" ? "/" : t.uri.replace(/[^/]+$/, n || t.slug) : (e.route ?? "/{slug}").replace("{parent_uri}/", "").replace("{slug}", n || "…").replace(/\{[a-z_]+\}/g, "…").replace(/\/+/g, "/");
}
function xe({ props: e, working: t, fields: r, titleInDetails: i, update: o }) {
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
	}, O = [
		...!h || c.route || m?.within ? [[d("Status"), /* @__PURE__ */ I(oe, {
			status: T,
			label: me(T),
			className: "text-text"
		}, "status")]] : [],
		...s?.publishedAt && T !== "draft" ? [[d(T === "scheduled" ? "Goes Live" : "Published"), /* @__PURE__ */ I("time", {
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
			...s ? [[d("ID"), /* @__PURE__ */ I("span", {
				className: "block select-all truncate font-mono text-xs text-faint",
				title: s.id,
				children: s.id
			}, "id")]] : []
		] : []
	], te = (n) => /* @__PURE__ */ I(H, {
		field: n,
		error: u[n.handle],
		children: /* @__PURE__ */ I(E, {
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
	return /* @__PURE__ */ L("div", { children: [
		/* @__PURE__ */ L(Se, { children: [
			i && /* @__PURE__ */ I(H, {
				field: {
					handle: "title",
					type: "text",
					label: d("Title")
				},
				error: u.title,
				children: /* @__PURE__ */ I(E, {
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
			y ? /* @__PURE__ */ L("div", {
				className: "flex min-h-7 items-start gap-2",
				children: [/* @__PURE__ */ I("span", {
					className: "flex h-7 w-[88px] shrink-0 items-center text-xs text-muted",
					children: d("URL")
				}), /* @__PURE__ */ I("span", {
					className: "flex h-7 min-w-0 flex-1 items-center",
					children: b?.path ? /* @__PURE__ */ I("span", {
						className: "truncate px-1 font-mono text-xs text-faint",
						title: b.path,
						children: b.path
					}) : /* @__PURE__ */ I("span", {
						className: "truncate px-1 text-xs text-faint",
						children: ee.isLoading ? "…" : d("Shown inside other pages")
					})
				})]
			}) : /* @__PURE__ */ I(H, {
				field: {
					handle: "slug",
					type: "text",
					label: c.route ? d("URL") : d("Handle")
				},
				error: u.slug,
				children: /* @__PURE__ */ I(E, {
					bare: !0,
					fields: [c.route ? {
						handle: "slug",
						type: "slug",
						label: d("URL"),
						component: "uri",
						uri: V(c, s, t.slug),
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
						slug: t.slug || N(t.title)
					},
					onChange: (e, t) => o({ [e]: t ?? "" }),
					errors: u,
					disabled: !l
				})
			}),
			!h && /* @__PURE__ */ I(H, {
				field: {
					handle: "authorId",
					type: "person",
					label: d("Author")
				},
				error: u.authorId,
				children: /* @__PURE__ */ I(A, {
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
			C.map(te)
		] }),
		w.map(({ group: e, inside: t, heading: n }) => /* @__PURE__ */ I(Se, {
			title: n,
			children: t.map(te)
		}, e)),
		O.length > 0 && /* @__PURE__ */ L(Se, {
			title: d("Info"),
			children: [/* @__PURE__ */ I("dl", {
				className: "m-0 space-y-1",
				children: O.map(([e, t]) => /* @__PURE__ */ L("div", {
					className: "flex min-h-7 items-start gap-2",
					children: [/* @__PURE__ */ I("dt", {
						className: "flex h-7 w-[88px] shrink-0 items-center truncate text-xs text-muted",
						children: e
					}), /* @__PURE__ */ I("dd", {
						className: "m-0 min-w-0 flex-1 break-words py-1 text-sm text-text",
						children: t
					})]
				}, e))
			}), s?.parentId && v.isError && /* @__PURE__ */ I(j, {
				message: v.error.message,
				onRetry: () => void v.refetch(),
				compact: !0
			})]
		})
	] });
}
function Se({ title: e, children: t }) {
	return /* @__PURE__ */ L("section", {
		className: ue("border-b border-border px-4 pb-3 last:border-b-0", !e && "pt-3"),
		children: [e && /* @__PURE__ */ I("h3", {
			className: "m-0 flex h-10 items-center text-xs font-semibold text-ink",
			children: e
		}), /* @__PURE__ */ I("div", {
			className: "space-y-1",
			children: t
		})]
	});
}
function H({ field: e, error: t, children: n }) {
	let r = e.type === "toggle", i = P.includes(e.type), a = !t && e.instructions ? /* @__PURE__ */ I("p", {
		className: "m-0 mt-1 text-xs text-muted",
		children: e.instructions
	}) : null, o = /* @__PURE__ */ I("label", {
		htmlFor: pe(e),
		className: ue("flex h-7 min-w-0 shrink-0 items-center text-xs text-muted", !i && "w-[88px]"),
		children: /* @__PURE__ */ I("span", {
			className: "truncate",
			children: e.label
		})
	});
	return r ? /* @__PURE__ */ L("div", {
		className: "py-1",
		children: [n, a]
	}) : i ? /* @__PURE__ */ L("div", {
		className: "pb-1",
		children: [
			o,
			n,
			a
		]
	}) : /* @__PURE__ */ L("div", {
		className: "flex min-h-7 items-start gap-2",
		children: [o, /* @__PURE__ */ L("div", {
			className: "min-w-0 flex-1",
			children: [n, a]
		})]
	});
}
function Ce({ entry: e, changes: t, busy: n, onClose: r, onPublish: i }) {
	let a = g(), [o, s] = x(e?.publishedAt ?? null), [c, l] = x(), u = e?.displayStatus === "scheduled", f = e?.status === "published" && !u, p = o ? new Date(o).getTime() : NaN, m = p > Date.now(), h = !!o && p !== new Date(e?.publishedAt ?? 0).getTime(), _ = d(m || !o && !f ? u ? "Change Schedule" : "Schedule" : f ? t ? "Publish Changes" : "Change Date" : "Publish"), v = !o || f && !t && !h || u && m && !h;
	return /* @__PURE__ */ I(w, {
		open: !0,
		onOpenChange: (e) => !e && !n && r(),
		title: d(u ? "Change Schedule" : f ? "Publication Date" : "Schedule"),
		footer: /* @__PURE__ */ L(F, { children: [/* @__PURE__ */ I(C, {
			disabled: n,
			onClick: r,
			children: d("Cancel")
		}), /* @__PURE__ */ I(C, {
			variant: "publish",
			loading: n,
			disabled: v,
			onClick: async () => {
				Number.isFinite(p) ? f && m ? l(d("Unpublish this entry before scheduling it for a future date.")) : await i(o) && r() : l(d("Choose a publication date and time."));
			},
			children: _
		})] }),
		children: /* @__PURE__ */ I(E, {
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
function we({ entry: e, editable: t, onRestore: n }) {
	let r = p("entries/revisions", { id: e?.id ?? "" }, { enabled: !!e });
	if (!e) return /* @__PURE__ */ I("p", {
		className: "m-0 px-4 py-3 text-sm text-muted",
		children: d("History starts after the first save.")
	});
	if (r.isLoading) return /* @__PURE__ */ I("div", {
		className: "grid place-items-center p-6 text-faint",
		children: /* @__PURE__ */ I(ae, {})
	});
	if (r.isError && !r.data) return /* @__PURE__ */ I(j, {
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
	return /* @__PURE__ */ L(F, { children: [
		r.isError && /* @__PURE__ */ I(j, {
			message: r.error.message,
			onRetry: () => void r.refetch(),
			compact: !0
		}),
		r.data?.length === 0 && /* @__PURE__ */ I("p", {
			className: "m-0 px-4 py-3 text-sm text-muted",
			children: d("No history yet.")
		}),
		/* @__PURE__ */ I("ol", {
			className: "m-0 list-none px-2 py-2",
			children: (r.data ?? []).map((r, o, s) => /* @__PURE__ */ L("li", {
				className: "group relative flex min-h-12 items-start gap-2.5 rounded-md px-2 py-2 hover:bg-hover",
				children: [
					o < s.length - 1 && /* @__PURE__ */ I("span", {
						className: "absolute bottom-[-10px] left-[11.5px] top-[22px] w-px bg-border",
						"aria-hidden": !0
					}),
					/* @__PURE__ */ I("span", {
						className: "relative grid h-5 w-2 shrink-0 place-items-center",
						"aria-hidden": !0,
						children: /* @__PURE__ */ I("span", { className: ue("size-2 rounded-full", r.action === "publish" ? "bg-success" : "bg-surface shadow-[inset_0_0_0_1.5px_var(--cms-border-strong)]") })
					}),
					/* @__PURE__ */ L("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ L("div", {
							className: "truncate text-sm text-text",
							children: [i[r.action] ?? r.action, r.title && r.title !== e.title && /* @__PURE__ */ L("span", {
								className: "text-muted",
								children: [" · ", r.title]
							})]
						}), /* @__PURE__ */ L("div", {
							className: "truncate text-xs text-faint",
							children: [
								r.user?.name ?? d("System"),
								" · ",
								/* @__PURE__ */ I("time", {
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
					o > 0 && t && /* @__PURE__ */ I(C, {
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
function Te(e, t, n = []) {
	return e.flatMap((e) => {
		if (e.id === t) return [];
		let r = [...n, e.title || d("Untitled")];
		return [{
			value: e.id,
			label: r.join(" / ")
		}, ...Te(e.children ?? [], t, r)];
	});
}
function Ee({ entry: e, collection: t, busy: n, onClose: r, onMove: i }) {
	let a = p("entries/tree", {
		collection: t.handle,
		locale: e.locale
	}, { refetchOnWindowFocus: !1 }), [o, s] = x(e.parentId), [c, l] = x(null), [u, f] = x(!1), m = b(!1), h = [{
		value: "",
		label: d("Root")
	}, ...Te(a.data ?? [], e.id)], g = o === null || h.some((e) => e.value === o), _ = !!a.data && !a.isError, v = n || u, y = c ?? (_ && !g ? d("This parent is no longer available. Choose another parent.") : void 0);
	return /* @__PURE__ */ L(w, {
		open: !0,
		title: d("Move {type}", { type: t.singular }),
		description: d("Choose a new parent for “{title}”.", { title: e.title }),
		onOpenChange: (e) => {
			!e && !v && r();
		},
		footer: /* @__PURE__ */ L(F, { children: [/* @__PURE__ */ I(C, {
			disabled: v,
			onClick: r,
			children: d("Cancel")
		}), /* @__PURE__ */ I(C, {
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
		children: [a.isLoading || !a.data && a.isFetching ? /* @__PURE__ */ L("div", {
			role: "status",
			className: "flex items-center gap-2 py-4 text-sm text-muted",
			children: [/* @__PURE__ */ I(ae, { size: 14 }), d("Loading available parents…")]
		}) : /* @__PURE__ */ L(F, { children: [a.isError && /* @__PURE__ */ I(j, {
			message: a.error.message,
			onRetry: () => void a.refetch()
		}), a.data && /* @__PURE__ */ I(E, {
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
		})] }), /* @__PURE__ */ L("div", {
			className: "mt-4 space-y-2 text-xs text-muted",
			children: [e.uri && /* @__PURE__ */ I("p", {
				className: "m-0",
				children: d("Moving a published entry can change its live URL and the URLs of its descendants.")
			}), /* @__PURE__ */ I("p", {
				className: "m-0",
				children: d("Saved unpublished changes stay in the working copy. Moving does not publish them.")
			})]
		})]
	});
}
// admin/src/EntryEditor.tsx
function U({ params: e }) {
	let { collection: t, summary: n, isLoading: r, error: a } = R(e.collection), c = e.id === "new", l = W(e.id, c), u = g(), { query: f } = h(), p = De(u, e.collection, l.data?.locale ?? f.locale), m = () => {
		l.refetch(), i("collections/get");
	}, _ = t?.resolvedFields.find((e) => e.handle === t.body), v = !!_ && s("entry.editor", { bodyField: _ }).length > 0 && /* @__PURE__ */ I(M, {
		title: d("Outline"),
		backTo: p.path,
		backLabel: p.label,
		children: null
	});
	if (r || !c && l.isLoading) return /* @__PURE__ */ L("div", {
		className: "flex h-full flex-col",
		children: [
			v,
			/* @__PURE__ */ I(le, { back: {
				to: p.path,
				label: p.label
			} }),
			/* @__PURE__ */ I("div", {
				className: "grid flex-1 place-items-center",
				children: /* @__PURE__ */ I(ae, {})
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
	].includes(y.type)) return /* @__PURE__ */ I(ie, {
		crumbs: b ? x.slice(0, 1) : [],
		children: /* @__PURE__ */ I(j, {
			message: y.message,
			onRetry: m
		})
	});
	if (!t || !n || !c && !l.data) {
		let e = b && /* @__PURE__ */ I(C, {
			onClick: () => o(p.path),
			children: d("Back to {label}", { label: b.title })
		});
		return /* @__PURE__ */ I(ie, {
			crumbs: x,
			children: y?.type === "forbidden" ? /* @__PURE__ */ I(T, {
				icon: "lock",
				title: d("Access denied"),
				description: y.message,
				action: e
			}) : /* @__PURE__ */ I(k, {
				icon: b?.icon ?? "file",
				action: e
			})
		});
	}
	return /* @__PURE__ */ L(F, { children: [v, /* @__PURE__ */ I(Oe, {
		collection: t,
		initial: c ? null : l.data,
		can: n.can
	}, `${e.collection}:${e.id}`)] });
}
function De(e, t, n) {
	let r = e.collections.find((e) => e.handle === t), i = e.collections.find((e) => e.handle === r?.within), a = i ?? r, o = n && n !== e.site.defaultLocale && e.site.locales.includes(n);
	return {
		path: `/content/${a?.handle ?? t}${o ? `?locale=${n}` : ""}`,
		label: a?.title ?? "",
		within: i
	};
}
function W(e, t) {
	return p("entries/get", { id: e }, {
		enabled: !t,
		refetchOnWindowFocus: !1
	});
}
function Oe({ collection: e, initial: t, can: n }) {
	let a = g(), { query: c } = h(), f = m("content").autosave ?? 1200, p = t?.locale ?? (a.site.locales.includes(c.locale ?? "") ? c.locale : a.site.defaultLocale), w = De(a, e.handle, p), D = w.path, k = w.within?.singular ?? a.collections.find((t) => t.handle === e.handle)?.singular ?? e.singular, ie = ee(() => ({
		...e,
		singular: k
	}), [e, k]), A = ye(t, {
		title: t?.title ?? "",
		slug: t?.slug ?? "",
		authorId: t ? t.authorId : a.user.id,
		data: t?.data ?? Object.fromEntries(e.resolvedFields.map((e) => [e.handle, e.default ?? null]))
	}, e.handle, p, f, n), j = A.editable, { entry: M, working: N, dirty: P, phase: R, errors: z, conflict: ve, update: B, session: V } = A, Se = !!g().collections.find((t) => t.handle === e.handle)?.within, H = {
		...fe(n, M),
		...Se ? { duplicate: !1 } : {}
	}, Te = _e(), [U, W] = x(() => Te), [Oe, Pe] = x(null), [Fe, Ie] = x(!1), Le = `cms.entry.panel.${e.handle}`, [Re, ze] = x(() => localStorage.getItem(Le) || "details"), [Be, Ve] = x(!1), [He, Ue] = x(!1), [We, G] = x(!1), K = b(() => A.save()), Ge = b({});
	S(l.panels.subscribe, l.panels.version);
	let q = R === "saving";
	_({
		kind: "entry",
		icon: e.icon,
		rightEdge: !0,
		data: () => {
			let { entry: t, working: n, dirty: r } = V.get();
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
			let e = V.get();
			j && e.dirty && e.working.title.trim() && await A.save().catch(() => {});
		}
	}), y(() => r.on("content.changed", () => {
		let e = V.get().entry?.id;
		e && u("entries/get", { id: e }).then((e) => {
			let t = V.get();
			t.dirty || t.phase === "saving" || e.version === t.entry?.version || V.command(async () => e);
		}).catch(() => {});
	}), [V]);
	let Ke = (e, t) => {
		B({ data: {
			...V.get().working.data,
			[e]: t
		} });
	}, J = async (e) => {
		try {
			return await e();
		} catch (e) {
			he.error(e);
			return;
		}
	}, Y = async (e = {}) => {
		Ge.current = e, K.current = () => A.save(e);
		try {
			return await A.save(e);
		} catch {
			return;
		}
	}, qe = async () => {
		Ge.current = {}, K.current = () => A.save(), await A.save();
	}, Je = async (e) => {
		if (!H.publish) return !1;
		Ie(!0);
		let t = await Y({
			publish: !0,
			...e ? { at: e } : {}
		});
		return Ie(!1), t ? (he.success(t.displayStatus === "scheduled" ? d("Scheduled") : d("Published")), !0) : !1;
	}, Ye = () => !V.get().dirty || de({
		title: d("Discard unsaved changes?"),
		description: d("Your unsaved edits will be replaced."),
		confirm: d("Discard changes"),
		danger: !0
	}), Xe = async () => {
		await Ye() && (A.cancel(), G(!0), K.current = Xe, await J(() => V.command((e) => u("entries/get", { id: e.id }))), G(!1));
	}, Ze = async (e, t = {}) => {
		await Ye() && (A.cancel(), G(!0), K.current = () => Ze(e, t), await J(() => V.command((n) => u(e, {
			...e === "entries/restore" ? {} : { id: n.id },
			...t,
			expectedVersion: n.version
		}))), G(!1), i("entries/", "content/"));
	}, Qe = async () => {
		M && H.delete && await de({
			title: d("Delete “{title}”?", { title: M.title }),
			description: d("This permanently deletes the entry and its history."),
			confirm: d("Delete"),
			danger: !0
		}) && (A.cancel(), K.current = Qe, await J(async () => {
			await V.command(async (e) => (await u("entries/delete", {
				id: e.id,
				expectedVersion: e.version
			}), e)), V.reset(), i("entries/", "content/"), o(D);
		}));
	}, $e = async () => {
		let t = V.get(), n = t.entry;
		H.duplicate && n && !t.dirty && t.phase !== "saving" && await J(async () => {
			let t = await u("entries/duplicate", {
				id: n.id,
				expectedVersion: n.version
			});
			o(`/content/${e.handle}/${t.id}`);
		});
	}, et = async (e) => {
		if (!H.move) return !1;
		A.cancel(), G(!0), K.current = () => et(e);
		try {
			if (V.get().dirty && !await A.save()) return !1;
			let t = await V.command((t) => u("entries/move", {
				id: t.id,
				parentId: e,
				expectedVersion: t.version
			}));
			return i("entries/", "content/"), !!t;
		} catch (e) {
			return he.error(e), !1;
		} finally {
			G(!1);
		}
	}, tt = async () => {
		M && ve && await J(async () => {
			let e = ve.version ?? (await u("entries/get", { id: M.id })).version;
			await Y({
				...Ge.current,
				expectedVersion: e
			});
		});
	}, X = {
		entry: M,
		collection: ie,
		content: N,
		values: N.data,
		title: N.title,
		setValue: Ke,
		save: qe,
		reload: Xe,
		editable: j && !We,
		can: n,
		errors: z
	}, nt = s("entry.toolbar", X);
	S(l.entryActions.subscribe, l.entryActions.version);
	let rt = l.entryActions.all().filter((e) => e.when?.(X) ?? !0).sort((e, t) => (e.order ?? 50) - (t.order ?? 50)), it = s("entry.sidebar", X), at = s("entry.body", X), ot = e.body, Z = e.resolvedFields.find((e) => e.handle === ot), Q = be(e.resolvedFields, ot, [...it, ...at]), st = [
		{
			value: "details",
			label: k,
			icon: e.icon || "file"
		},
		{
			value: "history",
			label: d("History"),
			icon: "history"
		},
		...it.map((e) => ({
			value: e.id,
			label: e.label ?? e.id,
			icon: e.icon
		}))
	], $ = st.some((e) => e.value === Re) ? Re : "details", ct = (e) => {
		ze(e), localStorage.setItem(Le, e);
	}, lt = () => {
		U || ct("details"), W(!U);
	}, ut = Q.document.filter((e) => !Me.includes(e.type)), dt = Q.document.filter((e) => Me.includes(e.type)), ft = {
		entry: M ?? void 0,
		collection: e.handle,
		locale: p
	}, pt = /* @__PURE__ */ L("div", {
		className: "flex h-full min-h-0 flex-col",
		children: [/* @__PURE__ */ L("div", {
			className: "flex h-12 shrink-0 items-center gap-2 border-b border-border pl-4 pr-2",
			children: [/* @__PURE__ */ I(se, {
				id: "entry-sidebar",
				value: $,
				onChange: ct,
				tabs: st,
				bordered: !1,
				fit: !0,
				className: "h-full min-w-0 flex-1"
			}), /* @__PURE__ */ I(O, {
				icon: "close",
				label: d("Close Panel"),
				size: "xs",
				onClick: () => W(!1)
			})]
		}), /* @__PURE__ */ I("div", {
			role: "tabpanel",
			id: `entry-sidebar-${$}-panel`,
			"aria-labelledby": `entry-sidebar-${$}`,
			className: "min-h-0 flex-1 overflow-y-auto",
			children: $ === "details" ? /* @__PURE__ */ I(xe, {
				props: X,
				working: N,
				fields: Z?.type === "blocks" ? [...Q.document, ...Q.sidebar] : Q.sidebar,
				titleInDetails: Z?.type === "blocks",
				update: B
			}) : $ === "history" ? /* @__PURE__ */ I(we, {
				entry: M,
				editable: H.restore && !q,
				onRestore: async (e) => {
					H.restore && await de({
						title: d("Restore this version?"),
						description: d("The current saved content stays in history."),
						confirm: d("Restore")
					}) && await Ze("entries/restore", { revisionId: e });
				}
			}) : it.filter((e) => e.id === $).map((e) => /* @__PURE__ */ I(e.component, { ...X }, e.id))
		})]
	}), mt = /* @__PURE__ */ L(F, { children: [/* @__PURE__ */ I(E, {
		bare: !0,
		fields: [{
			handle: "title",
			type: "text",
			label: d("Title"),
			component: "title",
			placeholder: d("Untitled"),
			autofocus: !M,
			onEnter: () => {
				Y(), Ae();
			},
			onDown: Ae
		}],
		values: { title: N.title },
		onChange: (e, t) => B({ title: t ?? "" }),
		errors: z,
		disabled: !X.editable
	}), (ut.length > 0 || dt.length > 0) && /* @__PURE__ */ L(je, {
		collection: e.handle,
		count: ut.length + dt.length,
		children: [ut.map((e) => /* @__PURE__ */ I(Ne, {
			field: e,
			value: N.data[e.handle],
			onChange: (t) => Ke(e.handle, t),
			error: z[e.handle],
			disabled: !X.editable,
			context: ft,
			values: N.data
		}, e.handle)), dt.length > 0 && /* @__PURE__ */ I(E, {
			fields: dt,
			values: N.data,
			onChange: Ke,
			errors: z,
			disabled: !X.editable,
			context: ft,
			className: "mt-4 !gap-y-4"
		})]
	})] }), ht = Z ? {
		...X,
		footer: /* @__PURE__ */ I(F, { children: at.map((e) => /* @__PURE__ */ I(e.component, { ...X }, e.id)) }),
		bodyField: Z,
		setTitle: (e) => B({ title: e }),
		sidebar: pt,
		sidebarOpen: U,
		setSidebarOpen: W,
		toolbar: Oe,
		listPath: D,
		listLabel: w.label
	} : null, gt = ht ? s("entry.editor", ht)[0] : null, _t = M?.displayStatus ?? "draft", vt = M?.status === "published" && _t !== "scheduled", yt = vt && !P && !M?.hasDraft, bt = !M && P && !N.title.trim(), xt = N.title || d("Untitled"), St = R === "error" ? d("Couldn’t save") : bt ? d("Add a title to save") : q ? d("Saving…") : P ? d("Unsaved") : M ? d("Saved") : "", Ct = /* @__PURE__ */ I("span", {
		"aria-hidden": "true",
		title: St || void 0,
		className: ue("block size-1.5 rounded-full", R === "error" || bt ? "bg-danger" : q || P ? "bg-faint" : "bg-transparent")
	});
	return ge("mod+s", () => {
		j && Y();
	}), ge("mod+shift+p", () => {
		H.publish && !yt && N.title.trim() && Je();
	}), ge("mod+.", lt), y(() => {
		let t = Object.keys(z)[0];
		if (!t) return;
		let n = t.replace(/^data\./, "").split("."), r = n[0], i = Q.claimed.get(r);
		(i || Z?.type === "blocks" && (r === "title" || Q.document.some((e) => e.handle === r)) || r === "authorId" || r === "slug" || Q.sidebar.some((e) => e.handle === r)) && (W(!0), ct(i ?? "details")), Q.document.some((e) => e.handle === r) && (localStorage.setItem(`cms.properties.${e.handle}`, "open"), window.dispatchEvent(new Event("cms.fields.reveal"))), requestAnimationFrame(() => {
			let e = document.getElementById(pe({ handle: n.at(-1) }, n.slice(0, -1))) ?? document.getElementById(`f-${r}`) ?? document.querySelector(`[data-field="${CSS.escape(r)}"] input, [data-field="${CSS.escape(r)}"] textarea, [data-field="${CSS.escape(r)}"] button`);
			e?.scrollIntoView({ block: "center" }), e?.focus();
		});
	}, [z]), /* @__PURE__ */ L("div", {
		className: "relative flex h-full flex-col",
		children: [
			/* @__PURE__ */ I(le, {
				back: {
					to: D,
					label: w.label
				},
				title: /* @__PURE__ */ L("span", {
					className: "relative block truncate pr-3.5",
					children: [xt, /* @__PURE__ */ I("span", {
						className: "absolute right-0 top-1/2 -translate-y-1/2",
						children: Ct
					})]
				}),
				children: /* @__PURE__ */ L(F, { children: [/* @__PURE__ */ L("span", {
					className: "relative min-w-0 truncate pr-3.5 text-sm font-medium text-ink max-sm:hidden lg:hidden",
					children: [xt, /* @__PURE__ */ I("span", {
						className: "absolute right-0 top-1/2 -translate-y-1/2",
						children: Ct
					})]
				}), gt && /* @__PURE__ */ I("div", {
					ref: Pe,
					className: "flex shrink-0 items-center gap-0.5 empty:hidden"
				})] }),
				actions: /* @__PURE__ */ L(F, { children: [
					/* @__PURE__ */ I("span", {
						role: "status",
						className: "sr-only",
						children: St
					}),
					nt.map((e) => /* @__PURE__ */ I(e.component, { ...X }, e.id)),
					/* @__PURE__ */ I(ce, {
						content: d("{name} Details", { name: k }),
						shortcut: "mod+.",
						children: /* @__PURE__ */ I(O, {
							icon: "sidebar",
							label: d("{name} Details", { name: k }),
							title: void 0,
							active: U,
							onClick: lt,
							className: "[&_svg]:-scale-x-100"
						})
					}),
					H.publish ? yt ? /* @__PURE__ */ I(oe, {
						status: _t,
						label: me(_t),
						className: "h-7 px-1.5 text-sm"
					}) : /* @__PURE__ */ L(C, {
						variant: "publish",
						disabled: !N.title.trim(),
						loading: Fe,
						onClick: () => {
							Je();
						},
						children: [/* @__PURE__ */ I("span", {
							className: "max-sm:hidden",
							children: d(_t === "scheduled" ? "Publish Now" : vt ? "Publish Changes" : "Publish")
						}), /* @__PURE__ */ I("span", {
							className: "sm:hidden",
							children: d("Publish")
						})]
					}) : j && /* @__PURE__ */ I(C, {
						variant: "primary",
						disabled: !P || q,
						loading: q,
						onClick: () => {
							Y();
						},
						children: d("Save Draft")
					}),
					/* @__PURE__ */ I(ne, {
						trigger: /* @__PURE__ */ I(O, {
							icon: "more",
							label: d("More Actions")
						}),
						items: [
							...rt.map((e) => ({
								label: e.label,
								icon: e.icon,
								onSelect: () => e.perform(X)
							})),
							M && vt && M.uri && !M.hasDraft ? {
								label: d("View on Site"),
								icon: "external",
								onSelect: () => {
									window.open(M.uri, "_blank", "noopener");
								}
							} : null,
							H.publish && {
								label: d(_t === "scheduled" ? "Change Schedule" : vt ? "Publication Date…" : "Schedule…"),
								icon: "calendar",
								onSelect: () => Ve(!0)
							},
							M && H.move && e.structure === "tree" && {
								label: d("Move…"),
								icon: "arrow-right",
								onSelect: () => Ue(!0)
							},
							M && H.duplicate && {
								label: d("Duplicate"),
								icon: "copy",
								disabled: q || P,
								description: q || P ? d("Save changes before duplicating") : void 0,
								onSelect: () => {
									$e();
								}
							},
							M && H.discard && M.hasDraft && {
								label: d("Discard Unpublished Changes"),
								icon: "undo",
								onSelect: () => {
									Ze("entries/discard-draft");
								}
							},
							M && H.unpublish && {
								label: d("Unpublish"),
								icon: "eye-off",
								onSelect: () => {
									Ze("entries/unpublish");
								}
							},
							M && H.delete && {
								separator: !0,
								label: ""
							},
							M && H.delete && {
								label: d("Delete"),
								icon: "trash",
								danger: !0,
								onSelect: Qe
							}
						]
					})
				] })
			}),
			Q.error && /* @__PURE__ */ I(re, {
				tone: "danger",
				className: "m-3",
				children: Q.error
			}),
			gt && ht ? /* @__PURE__ */ I("div", {
				className: "min-h-0 flex-1",
				children: /* @__PURE__ */ I(v, {
					fallback: /* @__PURE__ */ I("div", {
						className: "grid h-full place-items-center",
						children: /* @__PURE__ */ I(ae, {})
					}),
					children: /* @__PURE__ */ I(gt.component, { ...ht })
				})
			}) : /* @__PURE__ */ L("div", {
				className: "flex min-h-0 flex-1",
				children: [/* @__PURE__ */ I("div", {
					className: "min-w-0 flex-1 overflow-y-auto",
					children: /* @__PURE__ */ L("article", {
						className: "mx-auto w-full max-w-[784px] px-6 pb-24 pt-12 md:px-8 md:pt-16",
						children: [
							mt,
							Z?.type === "blocks" ? /* @__PURE__ */ I(T, {
								icon: "blocks",
								title: d("Block editor unavailable")
							}) : Z && /* @__PURE__ */ I("div", {
								className: "mt-8",
								"data-cms-body": !0,
								children: /* @__PURE__ */ I(E, {
									bare: !0,
									fields: [Z],
									values: N.data,
									onChange: Ke,
									errors: z,
									disabled: !X.editable,
									context: {
										...ft,
										title: N.title
									}
								})
							}),
							at.map((e) => /* @__PURE__ */ I(e.component, { ...X }, e.id))
						]
					})
				}), /* @__PURE__ */ I(te, {
					open: U,
					onOpenChange: W,
					title: k,
					children: pt
				})]
			}),
			Be && /* @__PURE__ */ I(Ce, {
				entry: M,
				changes: P || !!M?.hasDraft,
				busy: q,
				onClose: () => Ve(!1),
				onPublish: (e) => Je(e)
			}),
			He && M && /* @__PURE__ */ I(Ee, {
				entry: M,
				collection: ie,
				busy: q || We,
				onClose: () => Ue(!1),
				onMove: et
			}),
			A.error && R === "error" && /* @__PURE__ */ I(ke, {
				error: A.error,
				conflict: !!ve,
				dirty: P,
				onReload: Xe,
				onKeepMine: tt,
				onRetry: () => {
					K.current().catch(() => {});
				}
			})
		]
	});
}
function ke({ error: t, conflict: n, dirty: r, onReload: i, onKeepMine: a, onRetry: o }) {
	let s = t instanceof e && t.status > 0, c = n ? t.message : s && t.type === "invalid_input" ? d("Couldn’t save. Check the highlighted fields.") : s ? d("Couldn’t save. {reason}", { reason: t.message }) : d("Couldn’t save. Check your connection.");
	return /* @__PURE__ */ I("div", {
		className: "pointer-events-none absolute inset-x-0 top-14 z-30 flex justify-center px-4",
		children: /* @__PURE__ */ L("div", {
			role: "alert",
			className: "pointer-events-auto flex min-h-10 max-w-[560px] items-center gap-2.5 rounded-lg border border-border-float bg-float py-1.5 pl-3 pr-1.5 text-sm text-text shadow-pop",
			children: [
				/* @__PURE__ */ I(D, {
					name: "warning",
					size: 16,
					className: "shrink-0 text-danger"
				}),
				/* @__PURE__ */ I("span", {
					className: "min-w-0 flex-1",
					children: c
				}),
				n ? /* @__PURE__ */ L(F, { children: [/* @__PURE__ */ I(C, {
					size: "xs",
					variant: "ghost",
					onClick: i,
					children: d("Load Their Version")
				}), r && /* @__PURE__ */ I(C, {
					size: "xs",
					variant: "ghost",
					onClick: a,
					children: d("Keep Mine")
				})] }) : t.type !== "invalid_input" && /* @__PURE__ */ I(C, {
					size: "xs",
					variant: "ghost",
					onClick: o,
					children: d("Retry")
				})
			]
		})
	});
}
function Ae() {
	(document.querySelector("[data-cms-body] [contenteditable=\"true\"], [data-cms-body] textarea, [data-cms-body] input") ?? document.querySelector("[data-cms-fields] input, [data-cms-fields] textarea"))?.focus();
}
function je({ collection: e, count: t, children: n }) {
	let r = `cms.properties.${e}`, [i, a] = x(() => localStorage.getItem(r) !== "closed");
	return y(() => {
		let e = () => a(!0);
		return window.addEventListener("cms.fields.reveal", e), () => window.removeEventListener("cms.fields.reveal", e);
	}, []), /* @__PURE__ */ L("div", {
		className: "mt-6",
		"data-cms-fields": i ? "" : void 0,
		children: [i && /* @__PURE__ */ I("div", {
			className: "space-y-px",
			children: n
		}), /* @__PURE__ */ L("button", {
			type: "button",
			onClick: () => {
				localStorage.setItem(r, i ? "closed" : "open"), a(!i);
			},
			"aria-expanded": i,
			className: "-ml-1.5 mt-2 flex h-7 items-center gap-1.5 rounded-xs px-1.5 text-xs text-faint transition-colors hover:bg-hover hover:text-muted",
			children: [/* @__PURE__ */ I(D, {
				name: i ? "chevron-up" : "chevron-down",
				size: 12
			}), i ? d("Hide Properties") : c(t, "{count} property", "{count} properties")]
		})]
	});
}
var Me = [
	"repeater",
	"blocks",
	"richtext",
	"markdown",
	"json",
	"group",
	"code",
	"fields"
];
function Ne({ field: e, value: t, onChange: n, error: r, disabled: i, context: a, values: o }) {
	return /* @__PURE__ */ L("div", {
		className: "grid grid-cols-[148px_minmax(0,1fr)] items-start gap-3 py-0.5",
		children: [/* @__PURE__ */ I("div", {
			className: "flex h-8 items-center truncate text-sm text-muted",
			title: e.instructions ?? e.label,
			children: e.label
		}), /* @__PURE__ */ I("div", {
			className: "min-w-0",
			children: /* @__PURE__ */ I(E, {
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
export { U as default };
