import { t as e } from "./useCollection-DPy1gAYR.js";
import { CmsError as t, blockNavigation as n, can as r, events as i, invalidate as a, locale as o, navigate as s, panelsFor as c, plural as l, registry as u, run as d, t as f, timeAgo as p, useAbility as m, useConfig as h, useLocation as g, useManifest as _, useScreenContext as v } from "@letterncms/sdk";
import { Suspense as y, useEffect as b, useMemo as x, useRef as S, useState as C, useSyncExternalStore as ee } from "react";
import { Button as w, Dialog as T, EmptyState as te, Fields as E, Icon as D, IconButton as O, InspectorPanel as ne, Menu as re, NotFoundState as ie, Notice as ae, Page as k, PersonPicker as A, QueryError as j, ScreenSidebar as M, Spinner as oe, StatusDot as se, Tabs as ce, Tooltip as le, Topbar as ue, cn as de, confirm as fe, entryActionAvailability as pe, fieldControlId as me, slugify as N, statusLabel as he, toast as ge, useShortcut as _e, useWideInspector as ve, wideFieldTypes as P } from "@letterncms/ui";
import { Fragment as F, jsx as I, jsxs as L } from "react/jsx-runtime";
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
function be(e, t, r, i, o, s) {
	let c = S(!0), l = S(window.location.pathname);
	b(() => (c.current = !0, () => {
		c.current = !1;
	}), []);
	let [u] = C(() => new z(e, t, async (e, t, n) => {
		let o = e && !s.edit && n.publish ? await d("entries/publish", {
			id: e.id,
			...n.at ? { at: n.at } : {},
			expectedVersion: n.expectedVersion ?? e.version
		}) : e ? await d("entries/update", {
			id: e.id,
			...t,
			publish: !!n.publish,
			...n.at ? { at: n.at } : {},
			expectedVersion: n.expectedVersion ?? e.version
		}) : await d("entries/create", {
			collection: r,
			locale: i,
			...t,
			slug: t.slug || void 0,
			status: n.publish ? "published" : "draft",
			...n.at ? { at: n.at } : {}
		});
		return !e && c.current && window.location.pathname === l.current && window.history.replaceState(window.history.state, "", `${window.__CMS__.base}/content/${r}/${o.id}${i ? `?locale=${encodeURIComponent(i)}` : ""}`), a("entries/", "content/", "collections/overview"), o;
	})), p = ee(u.subscribe, u.get), m = p.entry ? s.edit : s.create, h = S(void 0), g = () => clearTimeout(h.current);
	b(() => (g(), m && o > 0 && p.dirty && p.phase !== "saving" && !p.error && !p.conflict && p.working.title.trim() && (h.current = setTimeout(() => void u.save().catch(() => {}), o)), g), [
		u,
		p,
		o,
		m
	]), b(() => n(() => u.get().dirty || u.get().phase === "saving" ? f("Discard unsaved changes?") : null), [u]), b(() => {
		let e = (e) => {
			(u.get().dirty || u.get().phase === "saving") && e.preventDefault();
		};
		return window.addEventListener("beforeunload", e), () => window.removeEventListener("beforeunload", e);
	}, [u]);
	let _ = (e = {}) => (g(), m || e.publish ? u.save(e) : Promise.resolve(p.entry));
	return {
		...p,
		session: u,
		editable: m,
		save: _,
		update: (e) => {
			m && u.update(e);
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
function Se({ props: e, working: t, fields: n, titleInDetails: i, update: a }) {
	let { entry: s, collection: c, editable: l, errors: u } = e, d = _(), p = d.collections.find((e) => e.handle === c.handle), h = c.system === !0, g = r("collections.manage"), v = m("entries/lookup", { ids: s?.parentId ? [s.parentId] : [] }, { enabled: g && !!s?.parentId }), y = !!p?.within, b = m("pages/builtin", {}, { enabled: y }), x = b.data?.find((e) => e.collection === c.handle)?.pages.find((e) => e.handle === (s?.slug ?? t.slug)), S = (e) => new Intl.DateTimeFormat(o(), {
		dateStyle: "medium",
		timeStyle: "short",
		timeZone: d.site.timezone
	}).format(new Date(e)), C = (e) => e.section === "sidebar" ? "main" : e.section ?? "main", ee = n.filter((e) => C(e) === "main"), w = [...new Set(n.map(C))].filter((e) => e !== "main").map((e) => {
		let t = n.filter((t) => C(t) === e), r = e.replace(/[_-]/g, " ").replace(/\b\w/g, (e) => e.toUpperCase());
		return {
			group: e,
			inside: t,
			heading: t.length === 1 && t[0].label?.toLowerCase() === r.toLowerCase() ? null : r
		};
	}), T = s?.displayStatus ?? "draft", te = {
		entry: s ?? void 0,
		collection: c.handle,
		locale: s?.locale ?? d.site.defaultLocale
	}, D = [
		...!h || c.route || p?.within ? [[f("Status"), /* @__PURE__ */ I(se, {
			status: T,
			label: he(T),
			className: "text-text"
		}, "status")]] : [],
		...s?.publishedAt && T !== "draft" ? [[f(T === "scheduled" ? "Goes Live" : "Published"), /* @__PURE__ */ I("time", {
			dateTime: s.publishedAt,
			title: d.site.timezone,
			children: S(s.publishedAt)
		}, "published")]] : [],
		...g ? [
			...s && c.structure === "tree" ? [[f("Parent"), s.parentId ? v.data?.[0]?.title ?? (v.isLoading ? f("Loading…") : "") : f("None")]] : [],
			...p?.within ? [] : [[f("Collection"), c.title]],
			...d.site.locales.length > 1 ? [[f("Language"), s?.locale ?? d.site.defaultLocale]] : [],
			...s?.createdAt ? [[f("Created"), S(s.createdAt)]] : [],
			...s?.updatedAt ? [[f("Updated"), S(s.updatedAt)]] : [],
			...s ? [[f("ID"), /* @__PURE__ */ I("span", {
				className: "block select-all truncate font-mono text-xs text-faint",
				title: s.id,
				children: s.id
			}, "id")]] : []
		] : []
	], O = (n) => /* @__PURE__ */ I(V, {
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
			context: te
		})
	}, n.handle);
	return /* @__PURE__ */ L("div", { children: [
		/* @__PURE__ */ L(Ce, { children: [
			i && /* @__PURE__ */ I(V, {
				field: {
					handle: "title",
					type: "text",
					label: f("Title")
				},
				error: u.title,
				children: /* @__PURE__ */ I(E, {
					bare: !0,
					fields: [{
						handle: "title",
						type: "text",
						label: f("Title"),
						size: "sm"
					}],
					values: { title: t.title },
					onChange: (e, t) => a({ title: t ?? "" }),
					errors: u,
					disabled: !l
				})
			}),
			y ? /* @__PURE__ */ L("div", {
				className: "flex min-h-7 items-start gap-2",
				children: [/* @__PURE__ */ I("span", {
					className: "flex h-7 w-[88px] shrink-0 items-center text-xs text-muted",
					children: f("URL")
				}), /* @__PURE__ */ I("span", {
					className: "flex h-7 min-w-0 flex-1 items-center",
					children: x?.path ? /* @__PURE__ */ I("span", {
						className: "truncate px-1 font-mono text-xs text-faint",
						title: x.path,
						children: x.path
					}) : /* @__PURE__ */ I("span", {
						className: "truncate px-1 text-xs text-faint",
						children: b.isLoading ? "…" : f("Shown inside other pages")
					})
				})]
			}) : /* @__PURE__ */ I(V, {
				field: {
					handle: "slug",
					type: "text",
					label: c.route ? f("URL") : f("Handle")
				},
				error: u.slug,
				children: /* @__PURE__ */ I(E, {
					bare: !0,
					fields: [c.route ? {
						handle: "slug",
						type: "slug",
						label: f("URL"),
						component: "uri",
						uri: B(c, s, t.slug),
						size: "sm"
					} : {
						handle: "slug",
						type: "text",
						label: f("Handle"),
						mono: !0,
						max: 180,
						size: "sm"
					}],
					values: {
						title: t.title,
						slug: t.slug || N(t.title)
					},
					onChange: (e, t) => a({ [e]: t ?? "" }),
					errors: u,
					disabled: !l
				})
			}),
			!h && /* @__PURE__ */ I(V, {
				field: {
					handle: "authorId",
					type: "person",
					label: f("Author")
				},
				error: u.authorId,
				children: /* @__PURE__ */ I(A, {
					id: "f-authorId",
					size: "sm",
					"aria-describedby": u.authorId ? "f-authorId-error" : void 0,
					value: t.authorId ? [t.authorId] : [],
					max: 1,
					disabled: !l,
					label: f("Assign Author"),
					onChange: (e) => a({ authorId: e[0] ?? null })
				})
			}),
			ee.map(O)
		] }),
		w.map(({ group: e, inside: t, heading: n }) => /* @__PURE__ */ I(Ce, {
			title: n,
			children: t.map(O)
		}, e)),
		D.length > 0 && /* @__PURE__ */ L(Ce, {
			title: f("Info"),
			children: [/* @__PURE__ */ I("dl", {
				className: "m-0 space-y-1",
				children: D.map(([e, t]) => /* @__PURE__ */ L("div", {
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
function Ce({ title: e, children: t }) {
	return /* @__PURE__ */ L("section", {
		className: de("border-b border-border px-4 pb-3 last:border-b-0", !e && "pt-3"),
		children: [e && /* @__PURE__ */ I("h3", {
			className: "m-0 flex h-10 items-center text-xs font-semibold text-ink",
			children: e
		}), /* @__PURE__ */ I("div", {
			className: "space-y-1",
			children: t
		})]
	});
}
function V({ field: e, error: t, children: n }) {
	let r = e.type === "toggle", i = P.includes(e.type), a = !t && e.instructions ? /* @__PURE__ */ I("p", {
		className: "m-0 mt-1 text-xs text-muted",
		children: e.instructions
	}) : null, o = /* @__PURE__ */ I("label", {
		htmlFor: me(e),
		className: de("flex h-7 min-w-0 shrink-0 items-center text-xs text-muted", !i && "w-[88px]"),
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
function we({ entry: e, changes: t, busy: n, onClose: r, onPublish: i }) {
	let a = _(), [o, s] = C(e?.publishedAt ?? null), [c, l] = C(), u = e?.displayStatus === "scheduled", d = e?.status === "published" && !u, p = o ? new Date(o).getTime() : NaN, m = p > Date.now(), h = !!o && p !== new Date(e?.publishedAt ?? 0).getTime(), g = f(m || !o && !d ? u ? "Change Schedule" : "Schedule" : d ? t ? "Publish Changes" : "Change Date" : "Publish"), v = !o || d && !t && !h || u && m && !h;
	return /* @__PURE__ */ I(T, {
		open: !0,
		onOpenChange: (e) => !e && !n && r(),
		title: f(u ? "Change Schedule" : d ? "Publication Date" : "Schedule"),
		footer: /* @__PURE__ */ L(F, { children: [/* @__PURE__ */ I(w, {
			disabled: n,
			onClick: r,
			children: f("Cancel")
		}), /* @__PURE__ */ I(w, {
			variant: "publish",
			loading: n,
			disabled: v,
			onClick: async () => {
				Number.isFinite(p) ? d && m ? l(f("Unpublish this entry before scheduling it for a future date.")) : await i(o) && r() : l(f("Choose a publication date and time."));
			},
			children: g
		})] }),
		children: /* @__PURE__ */ I(E, {
			fields: [{
				handle: "at",
				type: "date",
				time: !0,
				timezone: a.site.timezone,
				label: f("Date and Time"),
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
	let r = m("entries/revisions", { id: e?.id ?? "" }, { enabled: !!e });
	if (!e) return /* @__PURE__ */ I("p", {
		className: "m-0 px-4 py-3 text-sm text-muted",
		children: f("History starts after the first save.")
	});
	if (r.isLoading) return /* @__PURE__ */ I("div", {
		className: "grid place-items-center p-6 text-faint",
		children: /* @__PURE__ */ I(oe, {})
	});
	if (r.isError && !r.data) return /* @__PURE__ */ I(j, {
		message: r.error.message,
		onRetry: () => void r.refetch()
	});
	let i = {
		create: f("Created"),
		save: f("Edited"),
		publish: f("Published"),
		unpublish: f("Unpublished"),
		restore: f("Restored"),
		discard: f("Discarded Changes"),
		move: f("Moved")
	};
	return /* @__PURE__ */ L(F, { children: [
		r.isError && /* @__PURE__ */ I(j, {
			message: r.error.message,
			onRetry: () => void r.refetch(),
			compact: !0
		}),
		r.data?.length === 0 && /* @__PURE__ */ I("p", {
			className: "m-0 px-4 py-3 text-sm text-muted",
			children: f("No history yet.")
		}),
		/* @__PURE__ */ I("ol", {
			className: "m-0 list-none px-2 py-2",
			children: (r.data ?? []).map((r, a, s) => /* @__PURE__ */ L("li", {
				className: "group relative flex min-h-12 items-start gap-2.5 rounded-md px-2 py-2 hover:bg-hover",
				children: [
					a < s.length - 1 && /* @__PURE__ */ I("span", {
						className: "absolute bottom-[-10px] left-[11.5px] top-[22px] w-px bg-border",
						"aria-hidden": !0
					}),
					/* @__PURE__ */ I("span", {
						className: "relative grid h-5 w-2 shrink-0 place-items-center",
						"aria-hidden": !0,
						children: /* @__PURE__ */ I("span", { className: de("size-2 rounded-full", r.action === "publish" ? "bg-success" : "bg-surface shadow-[inset_0_0_0_1.5px_var(--cms-border-strong)]") })
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
								r.user?.name ?? f("System"),
								" · ",
								/* @__PURE__ */ I("time", {
									dateTime: r.createdAt,
									title: new Date(r.createdAt).toLocaleString(o(), {
										dateStyle: "medium",
										timeStyle: "short"
									}),
									children: p(r.createdAt)
								})
							]
						})]
					}),
					a > 0 && t && /* @__PURE__ */ I(w, {
						size: "xs",
						variant: "secondary",
						className: "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 max-md:opacity-100",
						onClick: () => n(r.id),
						children: f("Restore")
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
		let r = [...n, e.title || f("Untitled")];
		return [{
			value: e.id,
			label: r.join(" / ")
		}, ...Ee(e.children ?? [], t, r)];
	});
}
function De({ entry: e, collection: t, busy: n, onClose: r, onMove: i }) {
	let a = m("entries/tree", {
		collection: t.handle,
		locale: e.locale
	}, { refetchOnWindowFocus: !1 }), [o, s] = C(e.parentId), [c, l] = C(null), [u, d] = C(!1), p = S(!1), h = [{
		value: "",
		label: f("Root")
	}, ...Ee(a.data ?? [], e.id)], g = o === null || h.some((e) => e.value === o), _ = !!a.data && !a.isError, v = n || u, y = c ?? (_ && !g ? f("This parent is no longer available. Choose another parent.") : void 0);
	return /* @__PURE__ */ L(T, {
		open: !0,
		title: f("Move {type}", { type: t.singular }),
		description: f("Choose a new parent for “{title}”.", { title: e.title }),
		onOpenChange: (e) => {
			!e && !v && r();
		},
		footer: /* @__PURE__ */ L(F, { children: [/* @__PURE__ */ I(w, {
			disabled: v,
			onClick: r,
			children: f("Cancel")
		}), /* @__PURE__ */ I(w, {
			variant: "primary",
			loading: v,
			disabled: !_ || !g || o === e.parentId,
			onClick: async () => {
				if (!p.current && !v && _ && g && o !== e.parentId) {
					p.current = !0, d(!0), l(null);
					try {
						await i(o) ? r() : l(f("Could not move this entry. Try again."));
					} catch (e) {
						l(e instanceof Error ? e.message : f("Could not move this entry. Try again."));
					} finally {
						d(!1), p.current = !1;
					}
				}
			},
			children: f("Move")
		})] }),
		children: [a.isLoading || !a.data && a.isFetching ? /* @__PURE__ */ L("div", {
			role: "status",
			className: "flex items-center gap-2 py-4 text-sm text-muted",
			children: [/* @__PURE__ */ I(oe, { size: 14 }), f("Loading available parents…")]
		}) : /* @__PURE__ */ L(F, { children: [a.isError && /* @__PURE__ */ I(j, {
			message: a.error.message,
			onRetry: () => void a.refetch()
		}), a.data && /* @__PURE__ */ I(E, {
			fields: [{
				handle: "parentId",
				type: "select",
				label: f("Parent"),
				required: !0,
				options: g ? h : [...h, {
					value: o,
					label: f("Unavailable parent")
				}],
				instructions: f("Choose Root to place this entry at the top level.")
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
				children: f("Moving a published entry can change its live URL and the URLs of its descendants.")
			}), /* @__PURE__ */ I("p", {
				className: "m-0",
				children: f("Saved unpublished changes stay in the working copy. Moving does not publish them.")
			})]
		})]
	});
}
// admin/src/EntryEditor.tsx
function H({ params: t }) {
	let { collection: n, summary: r, isLoading: i, error: o } = e(t.collection), l = t.id === "new", u = U(t.id, l), d = _(), { query: p } = g(), m = Oe(d, t.collection, u.data?.locale ?? p.locale), h = () => {
		u.refetch(), a("collections/get");
	}, v = n?.resolvedFields.find((e) => e.handle === n.body), y = !!v && c("entry.editor", { bodyField: v }).length > 0 && /* @__PURE__ */ I(M, {
		title: f("Outline"),
		backTo: m.path,
		backLabel: m.label,
		children: null
	});
	if (i || !l && u.isLoading) return /* @__PURE__ */ L("div", {
		className: "flex h-full flex-col",
		children: [
			y,
			/* @__PURE__ */ I(ue, { back: {
				to: m.path,
				label: m.label
			} }),
			/* @__PURE__ */ I("div", {
				className: "grid flex-1 place-items-center",
				children: /* @__PURE__ */ I(oe, {})
			})
		]
	});
	let b = o ?? u.error, x = !n || !l && !u.data, S = d.collections.find((e) => e.handle === (m.within?.handle ?? t.collection)), C = [...S ? [{
		label: S.title,
		to: m.path,
		icon: S.icon
	}] : [], { label: f("Not Found") }];
	if (x && b && ![
		"not_found",
		"forbidden",
		"invalid_input"
	].includes(b.type)) return /* @__PURE__ */ I(k, {
		crumbs: S ? C.slice(0, 1) : [],
		children: /* @__PURE__ */ I(j, {
			message: b.message,
			onRetry: h
		})
	});
	if (!n || !r || !l && !u.data) {
		let e = S && /* @__PURE__ */ I(w, {
			onClick: () => s(m.path),
			children: f("Back to {label}", { label: S.title })
		});
		return /* @__PURE__ */ I(k, {
			crumbs: C,
			children: b?.type === "forbidden" ? /* @__PURE__ */ I(te, {
				icon: "lock",
				title: f("Access denied"),
				description: b.message,
				action: e
			}) : /* @__PURE__ */ I(ie, {
				icon: S?.icon ?? "file",
				action: e
			})
		});
	}
	return /* @__PURE__ */ L(F, { children: [y, /* @__PURE__ */ I(ke, {
		collection: n,
		initial: l ? null : u.data,
		can: r.can
	}, `${t.collection}:${t.id}`)] });
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
	return m("entries/get", { id: e }, {
		enabled: !t,
		refetchOnWindowFocus: !1
	});
}
function ke({ collection: e, initial: t, can: n }) {
	let r = _(), { query: o } = g(), l = h("content").autosave ?? 1200, p = t?.locale ?? (r.site.locales.includes(o.locale ?? "") ? o.locale : r.site.defaultLocale), m = Oe(r, e.handle, p), T = m.path, D = m.within?.singular ?? r.collections.find((t) => t.handle === e.handle)?.singular ?? e.singular, ie = x(() => ({
		...e,
		singular: D
	}), [e, D]), k = be(t, {
		title: t?.title ?? "",
		slug: t?.slug ?? "",
		authorId: t ? t.authorId : r.user.id,
		data: t?.data ?? Object.fromEntries(e.resolvedFields.map((e) => [e.handle, e.default ?? null]))
	}, e.handle, p, l, n), A = k.editable, { entry: j, working: M, dirty: N, phase: P, errors: R, conflict: ye, update: z, session: B } = k, Ce = !!_().collections.find((t) => t.handle === e.handle)?.within, V = {
		...pe(n, j),
		...Ce ? { duplicate: !1 } : {}
	}, Ee = ve(), [H, U] = C(() => Ee), [ke, Ie] = C(null), [Le, Re] = C(!1), ze = `cms.entry.panel.${e.handle}`, [Be, Ve] = C(() => localStorage.getItem(ze) || "details"), [He, Ue] = C(!1), [We, Ge] = C(!1), [Ke, W] = C(!1), G = S(() => k.save()), qe = S({});
	ee(u.panels.subscribe, u.panels.version);
	let K = P === "saving";
	v({
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
	}), b(() => i.on("content.changed", () => {
		let e = B.get().entry?.id;
		e && d("entries/get", { id: e }).then((e) => {
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
		return Re(!1), t ? (ge.success(t.displayStatus === "scheduled" ? f("Scheduled") : f("Published")), !0) : !1;
	}, Ze = () => !B.get().dirty || fe({
		title: f("Discard unsaved changes?"),
		description: f("Your unsaved edits will be replaced."),
		confirm: f("Discard changes"),
		danger: !0
	}), Qe = async () => {
		await Ze() && (k.cancel(), W(!0), G.current = Qe, await q(() => B.command((e) => d("entries/get", { id: e.id }))), W(!1));
	}, $e = async (e, t = {}) => {
		await Ze() && (k.cancel(), W(!0), G.current = () => $e(e, t), await q(() => B.command((n) => d(e, {
			...e === "entries/restore" ? {} : { id: n.id },
			...t,
			expectedVersion: n.version
		}))), W(!1), a("entries/", "content/"));
	}, et = async () => {
		j && V.delete && await fe({
			title: f("Delete “{title}”?", { title: j.title }),
			description: f("This permanently deletes the entry and its history."),
			confirm: f("Delete"),
			danger: !0
		}) && (k.cancel(), G.current = et, await q(async () => {
			await B.command(async (e) => (await d("entries/delete", {
				id: e.id,
				expectedVersion: e.version
			}), e)), B.reset(), a("entries/", "content/"), s(T);
		}));
	}, tt = async () => {
		let t = B.get(), n = t.entry;
		V.duplicate && n && !t.dirty && t.phase !== "saving" && await q(async () => {
			let t = await d("entries/duplicate", {
				id: n.id,
				expectedVersion: n.version
			});
			s(`/content/${e.handle}/${t.id}`);
		});
	}, nt = async (e) => {
		if (!V.move) return !1;
		k.cancel(), W(!0), G.current = () => nt(e);
		try {
			if (B.get().dirty && !await k.save()) return !1;
			let t = await B.command((t) => d("entries/move", {
				id: t.id,
				parentId: e,
				expectedVersion: t.version
			}));
			return a("entries/", "content/"), !!t;
		} catch (e) {
			return ge.error(e), !1;
		} finally {
			W(!1);
		}
	}, rt = async () => {
		j && ye && await q(async () => {
			let e = ye.version ?? (await d("entries/get", { id: j.id })).version;
			await J({
				...qe.current,
				expectedVersion: e
			});
		});
	}, Y = {
		entry: j,
		collection: ie,
		content: M,
		values: M.data,
		title: M.title,
		setValue: Je,
		save: Ye,
		reload: Qe,
		editable: A && !Ke,
		can: n,
		errors: R
	}, it = c("entry.toolbar", Y);
	ee(u.entryActions.subscribe, u.entryActions.version);
	let at = u.entryActions.all().filter((e) => e.when?.(Y) ?? !0).sort((e, t) => (e.order ?? 50) - (t.order ?? 50)), ot = c("entry.sidebar", Y), st = c("entry.body", Y), ct = e.body, X = e.resolvedFields.find((e) => e.handle === ct), Z = xe(e.resolvedFields, ct, [...ot, ...st]), lt = [
		{
			value: "details",
			label: D,
			icon: e.icon || "file"
		},
		{
			value: "history",
			label: f("History"),
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
	}, ht = /* @__PURE__ */ L("div", {
		className: "flex h-full min-h-0 flex-col",
		children: [/* @__PURE__ */ L("div", {
			className: "flex h-12 shrink-0 items-center gap-2 border-b border-border pl-4 pr-2",
			children: [/* @__PURE__ */ I(ce, {
				id: "entry-sidebar",
				value: Q,
				onChange: ut,
				tabs: lt,
				bordered: !1,
				fit: !0,
				className: "h-full min-w-0 flex-1"
			}), /* @__PURE__ */ I(O, {
				icon: "close",
				label: f("Close Panel"),
				size: "xs",
				onClick: () => U(!1)
			})]
		}), /* @__PURE__ */ I("div", {
			role: "tabpanel",
			id: `entry-sidebar-${Q}-panel`,
			"aria-labelledby": `entry-sidebar-${Q}`,
			className: "min-h-0 flex-1 overflow-y-auto",
			children: Q === "details" ? /* @__PURE__ */ I(Se, {
				props: Y,
				working: M,
				fields: X?.type === "blocks" ? [...Z.document, ...Z.sidebar] : Z.sidebar,
				titleInDetails: X?.type === "blocks",
				update: z
			}) : Q === "history" ? /* @__PURE__ */ I(Te, {
				entry: j,
				editable: V.restore && !K,
				onRestore: async (e) => {
					V.restore && await fe({
						title: f("Restore this version?"),
						description: f("The current saved content stays in history."),
						confirm: f("Restore")
					}) && await $e("entries/restore", { revisionId: e });
				}
			}) : ot.filter((e) => e.id === Q).map((e) => /* @__PURE__ */ I(e.component, { ...Y }, e.id))
		})]
	}), gt = /* @__PURE__ */ L(F, { children: [/* @__PURE__ */ I(E, {
		bare: !0,
		fields: [{
			handle: "title",
			type: "text",
			label: f("Title"),
			component: "title",
			placeholder: f("Untitled"),
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
	}), (ft.length > 0 || pt.length > 0) && /* @__PURE__ */ L(Ne, {
		collection: e.handle,
		count: ft.length + pt.length,
		children: [ft.map((e) => /* @__PURE__ */ I(Fe, {
			field: e,
			value: M.data[e.handle],
			onChange: (t) => Je(e.handle, t),
			error: R[e.handle],
			disabled: !Y.editable,
			context: mt,
			values: M.data
		}, e.handle)), pt.length > 0 && /* @__PURE__ */ I(E, {
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
		footer: /* @__PURE__ */ I(F, { children: st.map((e) => /* @__PURE__ */ I(e.component, { ...Y }, e.id)) }),
		bodyField: X,
		setTitle: (e) => z({ title: e }),
		sidebar: ht,
		sidebarOpen: H,
		setSidebarOpen: U,
		toolbar: ke,
		listPath: T,
		listLabel: m.label
	} : null, vt = _t ? c("entry.editor", _t)[0] : null, $ = j?.displayStatus ?? "draft", yt = j?.status === "published" && $ !== "scheduled", bt = yt && !N && !j?.hasDraft, xt = !j && N && !M.title.trim(), St = M.title || f("Untitled"), Ct = P === "error" ? f("Couldn’t save") : xt ? f("Add a title to save") : K ? f("Saving…") : N ? f("Unsaved") : j ? f("Saved") : "", wt = /* @__PURE__ */ I("span", {
		"aria-hidden": "true",
		title: Ct || void 0,
		className: de("block size-1.5 rounded-full", P === "error" || xt ? "bg-danger" : K || N ? "bg-faint" : "bg-transparent")
	});
	return _e("mod+s", () => {
		A && J();
	}), _e("mod+shift+p", () => {
		V.publish && !bt && M.title.trim() && Xe();
	}), _e("mod+.", dt), b(() => {
		let t = Object.keys(R)[0];
		if (!t) return;
		let n = t.replace(/^data\./, "").split("."), r = n[0], i = Z.claimed.get(r);
		(i || X?.type === "blocks" && (r === "title" || Z.document.some((e) => e.handle === r)) || r === "authorId" || r === "slug" || Z.sidebar.some((e) => e.handle === r)) && (U(!0), ut(i ?? "details")), Z.document.some((e) => e.handle === r) && (localStorage.setItem(`cms.properties.${e.handle}`, "open"), window.dispatchEvent(new Event("cms.fields.reveal"))), requestAnimationFrame(() => {
			let e = document.getElementById(me({ handle: n.at(-1) }, n.slice(0, -1))) ?? document.getElementById(`f-${r}`) ?? document.querySelector(`[data-field="${CSS.escape(r)}"] input, [data-field="${CSS.escape(r)}"] textarea, [data-field="${CSS.escape(r)}"] button`);
			e?.scrollIntoView({ block: "center" }), e?.focus();
		});
	}, [R]), /* @__PURE__ */ L("div", {
		className: "relative flex h-full flex-col",
		children: [
			/* @__PURE__ */ I(ue, {
				back: {
					to: T,
					label: m.label
				},
				title: /* @__PURE__ */ L("span", {
					className: "relative block truncate pr-3.5",
					children: [St, /* @__PURE__ */ I("span", {
						className: "absolute right-0 top-1/2 -translate-y-1/2",
						children: wt
					})]
				}),
				children: /* @__PURE__ */ L(F, { children: [/* @__PURE__ */ L("span", {
					className: "relative min-w-0 truncate pr-3.5 text-sm font-medium text-ink max-sm:hidden lg:hidden",
					children: [St, /* @__PURE__ */ I("span", {
						className: "absolute right-0 top-1/2 -translate-y-1/2",
						children: wt
					})]
				}), vt && /* @__PURE__ */ I("div", {
					ref: Ie,
					className: "flex shrink-0 items-center gap-0.5 empty:hidden"
				})] }),
				actions: /* @__PURE__ */ L(F, { children: [
					/* @__PURE__ */ I("span", {
						role: "status",
						className: "sr-only",
						children: Ct
					}),
					it.map((e) => /* @__PURE__ */ I(e.component, { ...Y }, e.id)),
					/* @__PURE__ */ I(le, {
						content: f("{name} Details", { name: D }),
						shortcut: "mod+.",
						children: /* @__PURE__ */ I(O, {
							icon: "sidebar",
							label: f("{name} Details", { name: D }),
							title: void 0,
							active: H,
							onClick: dt,
							className: "[&_svg]:-scale-x-100"
						})
					}),
					V.publish ? /* @__PURE__ */ I(Ae, {
						labels: [
							he($),
							f("Publish Now"),
							f("Publish Changes"),
							f("Publish")
						],
						children: bt ? /* @__PURE__ */ I(se, {
							status: $,
							label: he($),
							className: "h-7 px-1.5 text-sm"
						}) : /* @__PURE__ */ L(w, {
							variant: "publish",
							disabled: !M.title.trim(),
							loading: Le,
							onClick: () => {
								Xe();
							},
							children: [/* @__PURE__ */ I("span", {
								className: "max-sm:hidden",
								children: f($ === "scheduled" ? "Publish Now" : yt ? "Publish Changes" : "Publish")
							}), /* @__PURE__ */ I("span", {
								className: "sm:hidden",
								children: f("Publish")
							})]
						})
					}) : A && /* @__PURE__ */ I(w, {
						variant: "primary",
						disabled: !N || K,
						loading: K,
						onClick: () => {
							J();
						},
						children: f("Save Draft")
					}),
					/* @__PURE__ */ I(re, {
						trigger: /* @__PURE__ */ I(O, {
							icon: "more",
							label: f("More Actions")
						}),
						items: [
							...at.map((e) => ({
								label: e.label,
								icon: e.icon,
								onSelect: () => e.perform(Y)
							})),
							j && yt && j.uri && !j.hasDraft ? {
								label: f("View on Site"),
								icon: "external",
								onSelect: () => {
									window.open(j.uri, "_blank", "noopener");
								}
							} : null,
							V.publish && {
								label: f($ === "scheduled" ? "Change Schedule" : yt ? "Publication Date…" : "Schedule…"),
								icon: "calendar",
								onSelect: () => Ue(!0)
							},
							j && V.move && e.structure === "tree" && {
								label: f("Move…"),
								icon: "arrow-right",
								onSelect: () => Ge(!0)
							},
							j && V.duplicate && {
								label: f("Duplicate"),
								icon: "copy",
								disabled: K || N,
								description: K || N ? f("Save changes before duplicating") : void 0,
								onSelect: () => {
									tt();
								}
							},
							j && V.discard && j.hasDraft && {
								label: f("Discard Unpublished Changes"),
								icon: "undo",
								onSelect: () => {
									$e("entries/discard-draft");
								}
							},
							j && V.unpublish && {
								label: f("Unpublish"),
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
								label: f("Delete"),
								icon: "trash",
								danger: !0,
								onSelect: et
							}
						]
					})
				] })
			}),
			Z.error && /* @__PURE__ */ I(ae, {
				tone: "danger",
				className: "m-3",
				children: Z.error
			}),
			vt && _t ? /* @__PURE__ */ I("div", {
				className: "min-h-0 flex-1",
				children: /* @__PURE__ */ I(y, {
					fallback: /* @__PURE__ */ I("div", {
						className: "grid h-full place-items-center",
						children: /* @__PURE__ */ I(oe, {})
					}),
					children: /* @__PURE__ */ I(vt.component, { ..._t })
				})
			}) : /* @__PURE__ */ L("div", {
				className: "flex min-h-0 flex-1",
				children: [/* @__PURE__ */ I("div", {
					className: "min-w-0 flex-1 overflow-y-auto",
					children: /* @__PURE__ */ L("article", {
						className: "mx-auto w-full max-w-[784px] px-6 pb-24 pt-12 md:px-8 md:pt-16",
						children: [
							gt,
							X?.type === "blocks" ? /* @__PURE__ */ I(te, {
								icon: "blocks",
								title: f("Block editor unavailable")
							}) : X && /* @__PURE__ */ I("div", {
								className: "mt-8",
								"data-cms-body": !0,
								children: /* @__PURE__ */ I(E, {
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
							st.map((e) => /* @__PURE__ */ I(e.component, { ...Y }, e.id))
						]
					})
				}), /* @__PURE__ */ I(ne, {
					open: H,
					onOpenChange: U,
					title: D,
					children: ht
				})]
			}),
			He && /* @__PURE__ */ I(we, {
				entry: j,
				changes: N || !!j?.hasDraft,
				busy: K,
				onClose: () => Ue(!1),
				onPublish: (e) => Xe(e)
			}),
			We && j && /* @__PURE__ */ I(De, {
				entry: j,
				collection: ie,
				busy: K || Ke,
				onClose: () => Ge(!1),
				onMove: nt
			}),
			k.error && P === "error" && /* @__PURE__ */ I(je, {
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
	return /* @__PURE__ */ L("span", {
		className: "grid justify-items-end [&>*]:col-start-1 [&>*]:row-start-1",
		children: [e.map((e) => /* @__PURE__ */ I("span", {
			"aria-hidden": !0,
			className: "invisible h-0 overflow-hidden px-2.5 text-sm font-medium max-sm:hidden",
			children: e
		}, e)), t]
	});
}
function je({ error: e, conflict: n, dirty: r, onReload: i, onKeepMine: a, onRetry: o }) {
	let s = e instanceof t && e.status > 0, c = n ? e.message : s && e.type === "invalid_input" ? f("Couldn’t save. Check the highlighted fields.") : s ? f("Couldn’t save. {reason}", { reason: e.message }) : f("Couldn’t save. Check your connection.");
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
				n ? /* @__PURE__ */ L(F, { children: [/* @__PURE__ */ I(w, {
					size: "xs",
					variant: "ghost",
					onClick: i,
					children: f("Load Their Version")
				}), r && /* @__PURE__ */ I(w, {
					size: "xs",
					variant: "ghost",
					onClick: a,
					children: f("Keep Mine")
				})] }) : e.type !== "invalid_input" && /* @__PURE__ */ I(w, {
					size: "xs",
					variant: "ghost",
					onClick: o,
					children: f("Retry")
				})
			]
		})
	});
}
function Me() {
	(document.querySelector("[data-cms-body] [contenteditable=\"true\"], [data-cms-body] textarea, [data-cms-body] input") ?? document.querySelector("[data-cms-fields] input, [data-cms-fields] textarea"))?.focus();
}
function Ne({ collection: e, count: t, children: n }) {
	let r = `cms.properties.${e}`, [i, a] = C(() => localStorage.getItem(r) !== "closed");
	return b(() => {
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
			}), i ? f("Hide Properties") : l(t, "{count} property", "{count} properties")]
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
export { H as default };
