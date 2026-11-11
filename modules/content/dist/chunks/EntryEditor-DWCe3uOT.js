import { CmsError as e, blockNavigation as t, can as n, events as r, invalidate as i, locale as a, navigate as o, panelsFor as s, plural as c, registry as l, run as u, t as d, timeAgo as f, useAbility as p, useConfig as m, useLocation as h, useManifest as g, useScreenContext as _ } from "@letterncms/sdk";
import { Suspense as v, useEffect as y, useMemo as ee, useRef as b, useState as x, useSyncExternalStore as S } from "react";
import { Button as C, Dialog as w, EmptyState as T, Fields as E, Icon as te, IconButton as ne, InspectorPanel as re, Menu as ie, NotFoundState as ae, Notice as oe, Page as D, PersonPicker as se, QueryError as O, ScreenSidebar as k, Spinner as A, StatusDot as ce, Tabs as le, Tooltip as ue, Topbar as de, cn as j, confirm as fe, copyText as pe, entryActionAvailability as me, fieldControlId as he, slugify as M, statusLabel as ge, toast as _e, useShortcut as ve, useWideInspector as ye, wideFieldTypes as N } from "@letterncms/ui";
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
}), z = (e) => Object.fromEntries(Object.entries(e).map(([e, t]) => [e.replace(/^data\./, ""), t])), be = (e, t) => e.title === t.title && e.slug === t.slug && e.authorId === t.authorId && JSON.stringify(e.data) === JSON.stringify(t.data), xe = class {
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
		}, n = !this.state.entry || !be(t, R(this.state.entry));
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
			errors: t.type === "invalid_input" ? z(t.details ?? {}) : {},
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
function Se(e, n, r, a, o, s) {
	let c = b(!0), l = b(window.location.pathname);
	y(() => (c.current = !0, () => {
		c.current = !1;
	}), []);
	let [f] = x(() => new xe(e, n, async (e, t, n) => {
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
		return !e && c.current && window.location.pathname === l.current && window.history.replaceState(window.history.state, "", `${window.__CMS__.base}/content/${r}/${o.id}${a ? `?locale=${encodeURIComponent(a)}` : ""}`), i("entries/", "revisions/", "content/", "collections/overview"), o;
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
function Ce(e, t, n) {
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
function we({ props: e, working: t, fields: r, titleInDetails: i, update: o }) {
	let { entry: s, collection: c, editable: l, errors: u } = e, f = g(), m = f.collections.find((e) => e.handle === c.handle), h = c.system === !0, _ = n("collections.manage"), v = p("entries/get-many", { ids: s?.parentId ? [s.parentId] : [] }, { enabled: _ && !!s?.parentId }), y = !!m?.within, ee = p("pages/builtin", {}, { enabled: y }), b = ee.data?.find((e) => e.collection === c.handle)?.pages.find((e) => e.handle === (s?.slug ?? t.slug)), x = (e) => new Intl.DateTimeFormat(a(), {
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
	}), T = s?.displayStatus ?? "draft", te = {
		entry: s ?? void 0,
		collection: c.handle,
		locale: s?.locale ?? f.site.defaultLocale
	}, ne = [
		...!h || c.route || m?.within ? [[d("Status"), /* @__PURE__ */ F(ce, {
			status: T,
			label: ge(T),
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
			...s?.updatedAt ? [[d("Updated"), x(s.updatedAt)]] : []
		] : []
	], re = (n) => /* @__PURE__ */ F(V, {
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
			context: te
		})
	}, n.handle);
	return /* @__PURE__ */ I("div", { children: [
		/* @__PURE__ */ I(Te, { children: [
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
				children: /* @__PURE__ */ F(se, {
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
			C.map(re)
		] }),
		w.map(({ group: e, inside: t, heading: n }) => /* @__PURE__ */ F(Te, {
			title: n,
			children: t.map(re)
		}, e)),
		ne.length > 0 && /* @__PURE__ */ I(Te, {
			title: d("Info"),
			children: [/* @__PURE__ */ F("dl", {
				className: "m-0 space-y-1",
				children: ne.map(([e, t]) => /* @__PURE__ */ I("div", {
					className: "flex min-h-7 items-start gap-2",
					children: [/* @__PURE__ */ F("dt", {
						className: "flex h-7 w-[88px] shrink-0 items-center truncate text-xs text-muted",
						children: e
					}), /* @__PURE__ */ F("dd", {
						className: "m-0 min-w-0 flex-1 break-words py-1 text-sm text-text",
						children: t
					})]
				}, e))
			}), s?.parentId && v.isError && /* @__PURE__ */ F(O, {
				message: v.error.message,
				onRetry: () => void v.refetch(),
				compact: !0
			})]
		})
	] });
}
function Te({ title: e, children: t }) {
	return /* @__PURE__ */ I("section", {
		className: j("border-b border-border px-4 pb-3 last:border-b-0", !e && "pt-3"),
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
		htmlFor: he(e),
		className: j("flex h-7 min-w-0 shrink-0 items-center text-xs text-muted", !i && "w-[88px]"),
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
function Ee({ entry: e, changes: t, busy: n, onClose: r, onPublish: i }) {
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
var De = (e) => new Date(e).toLocaleString(a(), {
	dateStyle: "medium",
	timeStyle: "short"
}), H = (e) => e.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim(), U = (e, t) => JSON.stringify(e ?? null) !== JSON.stringify(t ?? null), W = (e) => !!e && typeof e == "object" && !Array.isArray(e), Oe = (e) => W(e) && typeof e.id == "string" && typeof e.type == "string", ke = (e) => Array.isArray(e) && e.some(Oe), Ae = (e) => {
	let t = e.replace(/[_-]+/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
	return t.charAt(0).toUpperCase() + t.slice(1);
};
function G(e) {
	if (e == null || e === "") return "";
	if (typeof e == "string") return H(e);
	if (typeof e == "boolean") return e ? d("Yes") : "";
	if (Array.isArray(e)) return e.map(G).filter(Boolean).join(", ");
	if (W(e)) {
		let t = [
			e.title,
			e.name,
			e.label,
			e.filename,
			e.text,
			e.url,
			e.id
		].find((e) => typeof e == "string" && e !== "");
		return typeof t == "string" ? H(t) : Object.entries(e).map(([e, t]) => `${Ae(e)}: ${G(t)}`).filter((e) => !e.endsWith(": ")).join(", ");
	}
	return String(e);
}
function K(e, t = /* @__PURE__ */ new Map()) {
	for (let n of e) {
		if (!Oe(n)) continue;
		let e = n.props ?? {}, r = [
			e.text,
			e.label,
			e.title,
			e.question,
			e.alt,
			...Array.isArray(e.items) ? e.items : []
		].map((e) => typeof e == "string" ? H(e) : G(e)).filter(Boolean).join(" · "), { children: i, ...a } = n;
		t.set(n.id, {
			words: r,
			raw: JSON.stringify(a)
		}), Array.isArray(i) && K(i, t);
	}
	return t;
}
function je(e, t, n) {
	let r = K(Array.isArray(t) ? t : []), i = K(Array.isArray(n) ? n : []), a = [], o = !1;
	for (let t of /* @__PURE__ */ new Set([...r.keys(), ...i.keys()])) {
		let n = r.get(t), s = i.get(t);
		n?.raw !== s?.raw && ((n?.words ?? "") === (s?.words ?? "") ? o = !0 : a.push({
			label: a.length ? "" : e,
			now: n?.words ?? "",
			then: s?.words ?? ""
		}));
	}
	return (o || !a.length && U(t, n)) && a.push({
		label: a.length ? "" : e,
		now: "",
		then: d("Layout or design changed")
	}), a;
}
function Me(e, t, n) {
	if (!U(t, n)) return [];
	if (ke(t) || ke(n)) return je(e, t, n);
	if ((W(t) || t == null) && (W(n) || n == null) && (W(t) || W(n))) {
		let r = W(t) ? t : {}, i = W(n) ? n : {};
		return [.../* @__PURE__ */ new Set([...Object.keys(r), ...Object.keys(i)])].flatMap((t) => Me(`${e} › ${Ae(t)}`, r[t], i[t]));
	}
	let r = G(t), i = G(n);
	return !r && !i ? [] : [{
		label: e,
		now: r,
		then: r === i ? d("Changed") : i
	}];
}
function Ne(e, t, n, r) {
	let i = {
		title: t.title,
		slug: t.slug,
		data: t.data,
		authorId: t.authorId,
		...t.draft
	}, a = i.data ?? {};
	return [
		...Me(d("Title"), e.title, i.title),
		...Me(d("URL"), e.slug, i.slug),
		...U(e.authorId, i.authorId) ? [{
			label: d("Author"),
			now: r,
			then: i.authorId ? d("Someone else") : ""
		}] : [],
		...[.../* @__PURE__ */ new Set([...Object.keys(e.data), ...Object.keys(a)])].flatMap((t) => Me(n.find((e) => e.handle === t)?.label ?? Ae(t), e.data[t], a[t]))
	];
}
function Pe({ entry: e, working: t, fields: n, editable: r, onRestore: i }) {
	let a = p("revisions/list", { entryId: e?.id ?? "" }, { enabled: !!e }), [o, s] = x(null);
	if (!e) return /* @__PURE__ */ F(T, {
		compact: !0,
		icon: "history",
		title: d("No history yet")
	});
	if (a.isLoading) return /* @__PURE__ */ F("div", {
		className: "grid place-items-center p-6 text-faint",
		children: /* @__PURE__ */ F(A, {})
	});
	if (a.isError && !a.data) return /* @__PURE__ */ F(O, {
		message: a.error.message,
		onRetry: () => void a.refetch()
	});
	let c = {
		create: d("Created"),
		save: d("Edited"),
		publish: d("Published"),
		unpublish: d("Unpublished"),
		restore: d("Restored"),
		discard: d("Discarded Changes"),
		move: d("Moved")
	}, l = (e) => c[e.action] ?? e.action;
	return /* @__PURE__ */ I(P, { children: [
		a.isError && /* @__PURE__ */ F(O, {
			message: a.error.message,
			onRetry: () => void a.refetch(),
			compact: !0
		}),
		a.data?.length === 0 && /* @__PURE__ */ F(T, {
			compact: !0,
			icon: "history",
			title: d("No history yet")
		}),
		/* @__PURE__ */ F("ol", {
			className: "m-0 list-none px-2 py-2",
			children: (a.data ?? []).map((t, n, r) => {
				let i = /* @__PURE__ */ I(P, { children: [/* @__PURE__ */ F("span", {
					className: "relative grid h-5 w-2 shrink-0 place-items-center",
					"aria-hidden": !0,
					children: /* @__PURE__ */ F("span", { className: j("size-2 rounded-full", t.action === "publish" ? "bg-success" : "bg-surface ring-1 ring-inset ring-border-strong") })
				}), /* @__PURE__ */ I("span", {
					className: "block min-w-0 flex-1",
					children: [/* @__PURE__ */ I("span", {
						className: "block truncate text-sm text-text",
						children: [l(t), t.title && t.title !== e.title && /* @__PURE__ */ I("span", {
							className: "text-muted",
							children: [" · ", t.title]
						})]
					}), /* @__PURE__ */ I("span", {
						className: "block truncate text-xs text-faint",
						children: [
							t.user?.name ?? d("System"),
							" · ",
							/* @__PURE__ */ F("time", {
								dateTime: t.createdAt,
								title: De(t.createdAt),
								children: f(t.createdAt)
							})
						]
					})]
				})] });
				return /* @__PURE__ */ I("li", {
					className: "relative",
					children: [n < r.length - 1 && /* @__PURE__ */ F("span", {
						className: "absolute bottom-[-10px] left-[11.5px] top-[22px] w-px bg-border",
						"aria-hidden": !0
					}), n > 0 ? /* @__PURE__ */ F(C, {
						variant: "ghost",
						onClick: () => s(t),
						className: "!h-auto min-h-12 w-full !items-start !justify-start !gap-2.5 !whitespace-normal !rounded-md !px-2 !py-2 text-left !font-normal",
						children: i
					}) : /* @__PURE__ */ F("div", {
						className: "flex min-h-12 items-start gap-2.5 px-2 py-2",
						children: i
					})]
				}, t.id);
			})
		}),
		/* @__PURE__ */ F(Ie, {
			revision: o,
			title: o ? `${l(o)} · ${De(o.createdAt)}` : "",
			working: t,
			fields: n,
			author: e.author?.name ?? "",
			editable: r,
			onClose: () => s(null),
			onRestore: (e) => {
				s(null), i(e);
			}
		})
	] });
}
var Fe = "grid grid-cols-[minmax(96px,0.6fr)_1fr_1fr] gap-x-4 px-3 py-2";
function Ie({ revision: e, title: t, working: n, fields: r, author: i, editable: a, onClose: o, onRestore: s }) {
	let c = p("revisions/get", { id: e?.id ?? "" }, { enabled: !!e }), l = e && c.data ? Ne(n, c.data.snapshot, r, i) : null;
	return /* @__PURE__ */ F(w, {
		open: !!e,
		onOpenChange: (e) => {
			e || o();
		},
		title: t,
		size: "lg",
		className: "max-sm:max-h-[72dvh] max-sm:before:mx-auto max-sm:before:mt-2 max-sm:before:h-1 max-sm:before:w-9 max-sm:before:shrink-0 max-sm:before:rounded-full max-sm:before:bg-border-strong max-sm:before:content-['']",
		...a ? {
			onSubmit: () => e && s(e.id),
			submitLabel: d("Restore Version"),
			submitDisabled: !l?.length
		} : {},
		children: c.isError ? /* @__PURE__ */ F(O, {
			compact: !0,
			message: d("Couldn’t load this version"),
			onRetry: () => void c.refetch(),
			retrying: c.isRefetching
		}) : l ? l.length === 0 ? /* @__PURE__ */ F("p", {
			role: "status",
			className: "m-0 py-6 text-center text-sm text-muted",
			children: d("Same as now")
		}) : /* @__PURE__ */ I("div", {
			role: "table",
			className: "overflow-hidden rounded-lg border border-border",
			children: [/* @__PURE__ */ I("div", {
				role: "row",
				className: j(Fe, "sticky top-0 border-b border-border bg-sunken text-xs font-medium text-muted"),
				children: [
					/* @__PURE__ */ F("span", { role: "columnheader" }),
					/* @__PURE__ */ F("span", {
						role: "columnheader",
						children: d("Current")
					}),
					/* @__PURE__ */ F("span", {
						role: "columnheader",
						children: d("This Version")
					})
				]
			}), l.map((e, t) => /* @__PURE__ */ I("div", {
				role: "row",
				className: j(Fe, "text-sm", t > 0 && (e.label ? "border-t border-border" : "border-t border-border/50")),
				children: [
					/* @__PURE__ */ F("span", {
						role: "rowheader",
						className: "min-w-0 break-words text-muted",
						children: e.label
					}),
					/* @__PURE__ */ F("span", {
						role: "cell",
						className: j("min-w-0 break-words", e.now ? "text-danger line-through decoration-danger/40" : "text-faint"),
						children: e.now || "—"
					}),
					/* @__PURE__ */ F("span", {
						role: "cell",
						className: j("min-w-0 break-words", e.then ? "text-success" : "text-faint"),
						children: e.then || "—"
					})
				]
			}, t))]
		}) : /* @__PURE__ */ F("div", {
			className: "grid place-items-center py-10 text-faint",
			children: /* @__PURE__ */ F(A, {})
		})
	});
}
// admin/src/EntryMoveDialog.tsx
function Le(e, t, n = []) {
	return e.flatMap((e) => {
		if (e.id === t) return [];
		let r = [...n, e.title || d("Untitled")];
		return [{
			value: e.id,
			label: r.join(" / ")
		}, ...Le(e.children ?? [], t, r)];
	});
}
function Re({ entry: e, collection: t, busy: n, onClose: r, onMove: i }) {
	let a = p("entries/tree", {
		collection: t.handle,
		locale: e.locale
	}, { refetchOnWindowFocus: !1 }), [o, s] = x(e.parentId), [c, l] = x(null), [u, f] = x(!1), m = b(!1), h = [{
		value: "",
		label: d("Root")
	}, ...Le(a.data ?? [], e.id)], g = o === null || h.some((e) => e.value === o), _ = !!a.data && !a.isError, v = n || u, y = c ?? (_ && !g ? d("This parent is no longer available. Choose another parent.") : void 0);
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
			children: [/* @__PURE__ */ F(A, { size: 14 }), d("Loading available parents…")]
		}) : /* @__PURE__ */ I(P, { children: [a.isError && /* @__PURE__ */ F(O, {
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
function q({ params: e }) {
	let { collection: t, summary: n, isLoading: r, error: a } = L(e.collection), c = e.id === "new", l = J(e.id, c), u = g(), { query: f } = h(), p = ze(u, e.collection, l.data?.locale ?? f.locale), m = () => {
		l.refetch(), i("collections/get");
	}, _ = t?.resolvedFields.find((e) => e.handle === t.body), v = !!_ && s("entry.editor", { bodyField: _ }).length > 0 && /* @__PURE__ */ F(k, {
		title: d("Outline"),
		backTo: p.path,
		backLabel: p.label,
		children: null
	});
	if (r || !c && l.isLoading) return /* @__PURE__ */ I("div", {
		className: "flex h-full flex-col",
		children: [
			v,
			/* @__PURE__ */ F(de, { back: {
				to: p.path,
				label: p.label
			} }),
			/* @__PURE__ */ F("div", {
				className: "grid flex-1 place-items-center",
				children: /* @__PURE__ */ F(A, {})
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
	].includes(y.type)) return /* @__PURE__ */ F(D, {
		crumbs: b ? x.slice(0, 1) : [],
		children: /* @__PURE__ */ F(O, {
			message: y.message,
			onRetry: m
		})
	});
	if (!t || !n || !c && !l.data) {
		let e = b && /* @__PURE__ */ F(C, {
			onClick: () => o(p.path),
			children: d("Back to {label}", { label: b.title })
		});
		return /* @__PURE__ */ F(D, {
			crumbs: x,
			children: y?.type === "forbidden" ? /* @__PURE__ */ I(P, { children: [/* @__PURE__ */ F(O, {
				title: d("Access denied"),
				message: y.message
			}), e && /* @__PURE__ */ F("div", {
				className: "mt-4",
				children: e
			})] }) : /* @__PURE__ */ F(ae, {
				icon: b?.icon ?? "file",
				action: e
			})
		});
	}
	return /* @__PURE__ */ I(P, { children: [v, /* @__PURE__ */ F(Be, {
		collection: t,
		initial: c ? null : l.data,
		can: n.can
	}, `${e.collection}:${e.id}`)] });
}
function ze(e, t, n) {
	let r = e.collections.find((e) => e.handle === t), i = e.collections.find((e) => e.handle === r?.within), a = i ?? r, o = n && n !== e.site.defaultLocale && e.site.locales.includes(n), s = r?.tab ? `?tab=${r.tab}` : o ? `?locale=${n}` : "";
	return {
		path: `/content/${a?.handle ?? t}${s}`,
		label: a?.title ?? "",
		within: i
	};
}
function J(e, t) {
	return p("entries/get", { id: e }, {
		enabled: !t,
		refetchOnWindowFocus: !1
	});
}
function Be({ collection: e, initial: t, can: n }) {
	let a = g(), { query: c } = h(), f = m("content").autosave ?? 1200, p = t?.locale ?? (a.site.locales.includes(c.locale ?? "") ? c.locale : a.site.defaultLocale), w = ze(a, e.handle, p), ae = w.path, D = w.within?.singular ?? a.collections.find((t) => t.handle === e.handle)?.singular ?? e.singular, se = ee(() => ({
		...e,
		singular: D
	}), [e, D]), O = Se(t, {
		title: t?.title ?? "",
		slug: t?.slug ?? "",
		authorId: t ? t.authorId : a.user.id,
		data: t?.data ?? Object.fromEntries(e.resolvedFields.map((e) => [e.handle, e.default ?? null]))
	}, e.handle, p, f, n), k = O.editable, { entry: M, working: N, dirty: L, phase: R, errors: z, conflict: be, update: xe, session: B } = O, Te = !!g().collections.find((t) => t.handle === e.handle)?.within, V = {
		...me(n, M),
		...Te ? { duplicate: !1 } : {}
	}, De = ye(), [H, U] = x(() => De), [W, Oe] = x(null), [ke, Ae] = x(!1), G = `cms.entry.panel.${e.handle}`, [K, je] = x(() => localStorage.getItem(G) || "details"), [Me, Ne] = x(!1), [Fe, Ie] = x(!1), [Le, q] = x(!1), J = b(() => O.save()), Be = b({});
	S(l.panels.subscribe, l.panels.version);
	let Y = R === "saving";
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
			k && e.dirty && e.working.title.trim() && await O.save().catch(() => {});
		}
	}), y(() => r.on("content.changed", () => {
		let e = B.get().entry?.id;
		e && u("entries/get", { id: e }).then((e) => {
			let t = B.get();
			t.dirty || t.phase === "saving" || e.version === t.entry?.version || B.command(async () => e);
		}).catch(() => {});
	}), [B]);
	let Ke = (e, t) => {
		xe({ data: {
			...B.get().working.data,
			[e]: t
		} });
	}, qe = async (e) => {
		try {
			return await e();
		} catch (e) {
			_e.error(e);
			return;
		}
	}, Je = async (e = {}) => {
		Be.current = e, J.current = () => O.save(e);
		try {
			return await O.save(e);
		} catch {
			return;
		}
	}, Ye = async () => {
		Be.current = {}, J.current = () => O.save(), await O.save();
	}, Xe = async (e) => {
		if (!V.publish) return !1;
		Ae(!0);
		let t = await Je({
			publish: !0,
			...e ? { at: e } : {}
		});
		return Ae(!1), t ? (_e.success(t.displayStatus === "scheduled" ? d("Scheduled") : d("Published")), !0) : !1;
	}, Ze = () => !B.get().dirty || fe({
		title: d("Discard unsaved changes?"),
		description: d("Your unsaved edits will be replaced."),
		confirm: d("Discard changes"),
		danger: !0
	}), Qe = async () => {
		await Ze() && (O.cancel(), q(!0), J.current = Qe, await qe(() => B.command((e) => u("entries/get", { id: e.id }))), q(!1));
	}, $e = async (e, t = {}) => {
		await Ze() && (O.cancel(), q(!0), J.current = () => $e(e, t), await qe(() => B.command((n) => u(e, {
			...e === "revisions/restore" ? {} : { id: n.id },
			...t,
			expectedVersion: n.version
		}))), q(!1), i("entries/", "revisions/", "content/"));
	}, et = async () => {
		M && V.delete && await fe({
			title: d("Delete “{title}”?", { title: M.title }),
			description: d("This permanently deletes the entry and its history."),
			confirm: d("Delete"),
			danger: !0
		}) && (O.cancel(), J.current = et, await qe(async () => {
			await B.command(async (e) => (await u("entries/delete", {
				id: e.id,
				expectedVersion: e.version
			}), e)), B.reset(), i("entries/", "revisions/", "content/"), o(ae);
		}));
	}, tt = async () => {
		let t = B.get(), n = t.entry;
		V.duplicate && n && !t.dirty && t.phase !== "saving" && await qe(async () => {
			let t = await u("entries/duplicate", {
				id: n.id,
				expectedVersion: n.version
			});
			o(`/content/${e.handle}/${t.id}`);
		});
	}, nt = async (e) => {
		if (!V.move) return !1;
		O.cancel(), q(!0), J.current = () => nt(e);
		try {
			if (B.get().dirty && !await O.save()) return !1;
			let t = await B.command((t) => u("entries/move", {
				id: t.id,
				parentId: e,
				expectedVersion: t.version
			}));
			return i("entries/", "revisions/", "content/"), !!t;
		} catch (e) {
			return _e.error(e), !1;
		} finally {
			q(!1);
		}
	}, rt = async () => {
		M && be && await qe(async () => {
			let e = be.version ?? (await u("entries/get", { id: M.id })).version;
			await Je({
				...Be.current,
				expectedVersion: e
			});
		});
	}, X = {
		entry: M,
		collection: se,
		content: N,
		values: N.data,
		title: N.title,
		setValue: Ke,
		save: Ye,
		reload: Qe,
		editable: k && !Le,
		can: n,
		errors: z
	}, it = s("entry.toolbar", X);
	S(l.entryActions.subscribe, l.entryActions.version);
	let at = l.entryActions.all().filter((e) => e.when?.(X) ?? !0).sort((e, t) => (e.order ?? 50) - (t.order ?? 50)), ot = s("entry.sidebar", X), st = s("entry.body", X), ct = e.body, Z = e.resolvedFields.find((e) => e.handle === ct), Q = Ce(e.resolvedFields, ct, [...ot, ...st]), lt = [
		{
			value: "details",
			label: D,
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
	], $ = lt.some((e) => e.value === K) ? K : "details", ut = (e) => {
		je(e), localStorage.setItem(G, e);
	}, dt = () => {
		H || ut("details"), U(!H);
	}, ft = Q.document.filter((e) => !We.includes(e.type)), pt = Q.document.filter((e) => We.includes(e.type)), mt = {
		entry: M ?? void 0,
		collection: e.handle,
		locale: p
	}, ht = /* @__PURE__ */ I("div", {
		className: "flex h-full min-h-0 flex-col",
		children: [/* @__PURE__ */ I("div", {
			className: "flex h-12 shrink-0 items-center gap-2 border-b border-border pl-4 pr-2",
			children: [/* @__PURE__ */ F(le, {
				id: "entry-sidebar",
				value: $,
				onChange: ut,
				tabs: lt,
				bordered: !1,
				fit: !0,
				className: "h-full min-w-0 flex-1"
			}), /* @__PURE__ */ F(ne, {
				icon: "close",
				label: d("Close Panel"),
				onClick: () => U(!1)
			})]
		}), /* @__PURE__ */ F("div", {
			role: "tabpanel",
			id: `entry-sidebar-${$}-panel`,
			"aria-labelledby": `entry-sidebar-${$}`,
			className: "min-h-0 flex-1 overflow-y-auto",
			children: $ === "details" ? /* @__PURE__ */ F(we, {
				props: X,
				working: N,
				fields: Z?.type === "blocks" ? [...Q.document, ...Q.sidebar] : Q.sidebar,
				titleInDetails: Z?.type === "blocks",
				update: xe
			}) : $ === "history" ? /* @__PURE__ */ F(Pe, {
				entry: M,
				working: N,
				fields: e.resolvedFields,
				editable: V.restore && !Y,
				onRestore: async (e) => {
					V.restore && await $e("revisions/restore", { revisionId: e });
				}
			}) : ot.filter((e) => e.id === $).map((e) => /* @__PURE__ */ F(e.component, { ...X }, e.id))
		})]
	}), gt = /* @__PURE__ */ I(P, { children: [/* @__PURE__ */ F(E, {
		bare: !0,
		fields: [{
			handle: "title",
			type: "text",
			label: d("Title"),
			component: "title",
			placeholder: d("Untitled"),
			autofocus: !M,
			onEnter: () => {
				Je(), He();
			},
			onDown: He
		}],
		values: { title: N.title },
		onChange: (e, t) => xe({ title: t ?? "" }),
		errors: z,
		disabled: !X.editable
	}), (ft.length > 0 || pt.length > 0) && /* @__PURE__ */ I(Ue, {
		collection: e.handle,
		count: ft.length + pt.length,
		children: [ft.map((e) => /* @__PURE__ */ F(Ge, {
			field: e,
			value: N.data[e.handle],
			onChange: (t) => Ke(e.handle, t),
			error: z[e.handle],
			disabled: !X.editable,
			context: mt,
			values: N.data
		}, e.handle)), pt.length > 0 && /* @__PURE__ */ F(E, {
			fields: pt,
			values: N.data,
			onChange: Ke,
			errors: z,
			disabled: !X.editable,
			context: mt,
			className: "mt-4 !gap-y-4"
		})]
	})] }), _t = Z ? {
		...X,
		footer: /* @__PURE__ */ F(P, { children: st.map((e) => /* @__PURE__ */ F(e.component, { ...X }, e.id)) }),
		bodyField: Z,
		setTitle: (e) => xe({ title: e }),
		sidebar: ht,
		sidebarOpen: H,
		setSidebarOpen: U,
		toolbar: W,
		listPath: ae,
		listLabel: w.label
	} : null, vt = _t ? s("entry.editor", _t)[0] : null, yt = M?.displayStatus ?? "draft", bt = M?.status === "published" && yt !== "scheduled", xt = bt && !L && !M?.hasDraft, St = !M && L && !N.title.trim(), Ct = N.title || d("Untitled"), wt = R === "error" ? d("Couldn’t save") : St ? d("Add a title to save") : Y ? d("Saving…") : L ? d("Unsaved") : M ? d("Saved") : "", Tt = /* @__PURE__ */ F("span", {
		"aria-hidden": "true",
		title: wt || void 0,
		className: j("block size-1.5 rounded-full", R === "error" || St ? "bg-danger" : Y || L ? "bg-faint" : "bg-transparent")
	}), Et = R === "error" || St, Dt = /* @__PURE__ */ I("span", {
		className: "flex min-w-0 items-center gap-1.5",
		children: [
			/* @__PURE__ */ F("span", {
				className: "truncate",
				children: Ct
			}),
			Tt,
			Et && /* @__PURE__ */ F("span", {
				className: "shrink-0 text-xs font-normal text-danger",
				children: wt
			})
		]
	});
	return ve("mod+s", () => {
		k && Je();
	}, !0, k ? d("Save") : void 0), ve("mod+shift+p", () => {
		V.publish && !xt && N.title.trim() && Xe();
	}, !0, V.publish ? d("Publish") : void 0), ve("mod+.", dt, !0, d("{name} Details", { name: D })), y(() => {
		let t = Object.keys(z)[0];
		if (!t) return;
		let n = t.replace(/^data\./, "").split("."), r = n[0], i = Q.claimed.get(r);
		(i || Z?.type === "blocks" && (r === "title" || Q.document.some((e) => e.handle === r)) || r === "authorId" || r === "slug" || Q.sidebar.some((e) => e.handle === r)) && (U(!0), ut(i ?? "details")), Q.document.some((e) => e.handle === r) && (localStorage.setItem(`cms.properties.${e.handle}`, "open"), window.dispatchEvent(new Event("cms.fields.reveal"))), requestAnimationFrame(() => {
			let e = document.getElementById(he({ handle: n.at(-1) }, n.slice(0, -1))) ?? document.getElementById(`f-${r}`) ?? document.querySelector(`[data-field="${CSS.escape(r)}"] input, [data-field="${CSS.escape(r)}"] textarea, [data-field="${CSS.escape(r)}"] button`);
			e?.scrollIntoView({ block: "center" }), e?.focus();
		});
	}, [z]), /* @__PURE__ */ I("div", {
		className: "relative flex h-full flex-col",
		children: [
			/* @__PURE__ */ F(de, {
				className: "max-sm:[&_[data-workspace-toggle]]:hidden",
				back: {
					to: ae,
					label: w.label
				},
				title: Dt,
				children: /* @__PURE__ */ I(P, { children: [/* @__PURE__ */ F("span", {
					className: "min-w-0 text-sm font-medium text-ink max-sm:hidden lg:hidden",
					children: Dt
				}), vt && /* @__PURE__ */ F("div", {
					ref: Oe,
					className: "flex shrink-0 items-center gap-0.5 empty:hidden"
				})] }),
				actions: /* @__PURE__ */ I(P, { children: [
					/* @__PURE__ */ F("span", {
						role: "status",
						className: "sr-only",
						children: wt
					}),
					it.map((e) => /* @__PURE__ */ F(e.component, { ...X }, e.id)),
					/* @__PURE__ */ F(ue, {
						content: d("{name} Details", { name: D }),
						shortcut: "mod+.",
						children: /* @__PURE__ */ F(ne, {
							icon: "sidebar",
							label: d("{name} Details", { name: D }),
							title: void 0,
							active: H,
							onClick: dt,
							className: "[&_svg]:-scale-x-100"
						})
					}),
					V.publish ? xt ? /* @__PURE__ */ F(ie, {
						trigger: /* @__PURE__ */ I(C, {
							variant: "ghost",
							className: "!gap-1 !px-1.5 !font-normal",
							children: [/* @__PURE__ */ F(ce, {
								status: yt,
								label: ge(yt),
								className: "text-sm"
							}), /* @__PURE__ */ F(te, {
								name: "chevron-down",
								size: 12,
								className: "shrink-0 text-faint"
							})]
						}),
						items: [{
							label: d("Publication Date…"),
							icon: "calendar",
							onSelect: () => Ne(!0)
						}, M && V.unpublish && {
							label: d("Unpublish"),
							icon: "eye-off",
							onSelect: () => {
								$e("entries/unpublish");
							}
						}]
					}) : /* @__PURE__ */ I(C, {
						variant: "publish",
						disabled: !N.title.trim(),
						loading: ke,
						onClick: () => {
							Xe();
						},
						children: [/* @__PURE__ */ F("span", {
							className: "max-sm:hidden",
							children: d(yt === "scheduled" ? "Publish Now" : bt ? "Publish Changes" : "Publish")
						}), /* @__PURE__ */ F("span", {
							className: "sm:hidden",
							children: d("Publish")
						})]
					}) : k && /* @__PURE__ */ F(C, {
						variant: "primary",
						disabled: !L || Y,
						loading: Y,
						onClick: () => {
							Je();
						},
						children: d("Save Draft")
					}),
					/* @__PURE__ */ F(ie, {
						trigger: /* @__PURE__ */ F(ne, {
							icon: "more",
							label: d("More Actions")
						}),
						items: [
							...at.map((e) => ({
								label: e.label,
								icon: e.icon,
								onSelect: () => e.perform(X)
							})),
							M && bt && M.uri && !M.hasDraft ? {
								label: d("View on Site"),
								icon: "external",
								onSelect: () => {
									window.open(M.uri, "_blank", "noopener");
								}
							} : null,
							V.publish && !xt && {
								label: d(yt === "scheduled" ? "Change Schedule" : bt ? "Publication Date…" : "Schedule…"),
								icon: "calendar",
								onSelect: () => Ne(!0)
							},
							M && V.move && e.structure === "tree" && {
								label: d("Move…"),
								icon: "arrow-right",
								onSelect: () => Ie(!0)
							},
							M && V.duplicate && {
								label: d("Duplicate"),
								icon: "copy",
								disabled: Y || L,
								description: Y || L ? d("Save changes before duplicating") : void 0,
								onSelect: () => {
									tt();
								}
							},
							M && V.discard && M.hasDraft && {
								label: d("Discard Unpublished Changes"),
								icon: "undo",
								onSelect: () => {
									$e("entries/discard-draft");
								}
							},
							M && V.unpublish && !(V.publish && xt) && {
								label: d("Unpublish"),
								icon: "eye-off",
								onSelect: () => {
									$e("entries/unpublish");
								}
							},
							M && {
								label: d("Copy ID"),
								icon: "hash",
								onSelect: () => void pe(M.id, { copied: d("ID copied") })
							},
							M && V.delete && {
								separator: !0,
								label: ""
							},
							M && V.delete && {
								label: d("Delete"),
								icon: "trash",
								danger: !0,
								onSelect: et
							}
						]
					})
				] })
			}),
			/* @__PURE__ */ I("div", {
				className: "flex h-8 shrink-0 items-center gap-3 border-b border-border px-4 sm:hidden",
				children: [/* @__PURE__ */ F("span", {
					className: "min-w-0 flex-1 truncate text-sm font-medium text-ink",
					children: Ct
				}), /* @__PURE__ */ F("span", {
					"aria-hidden": "true",
					className: j("shrink-0 text-xs", Et ? "text-danger" : "text-faint"),
					children: wt
				})]
			}),
			Q.error && /* @__PURE__ */ F(oe, {
				tone: "danger",
				className: "m-3",
				children: Q.error
			}),
			vt && _t ? /* @__PURE__ */ F("div", {
				className: "min-h-0 flex-1",
				children: /* @__PURE__ */ F(v, {
					fallback: /* @__PURE__ */ F("div", {
						className: "grid h-full place-items-center",
						children: /* @__PURE__ */ F(A, {})
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
							Z?.type === "blocks" ? /* @__PURE__ */ F(T, {
								icon: "blocks",
								title: d("Block editor unavailable")
							}) : Z && /* @__PURE__ */ F("div", {
								className: "mt-8",
								"data-cms-body": !0,
								children: /* @__PURE__ */ F(E, {
									bare: !0,
									fields: [Z],
									values: N.data,
									onChange: Ke,
									errors: z,
									disabled: !X.editable,
									context: {
										...mt,
										title: N.title
									}
								})
							}),
							st.map((e) => /* @__PURE__ */ F(e.component, { ...X }, e.id))
						]
					})
				}), /* @__PURE__ */ F(re, {
					open: H,
					onOpenChange: U,
					title: D,
					children: ht
				})]
			}),
			Me && /* @__PURE__ */ F(Ee, {
				entry: M,
				changes: L || !!M?.hasDraft,
				busy: Y,
				onClose: () => Ne(!1),
				onPublish: (e) => Xe(e)
			}),
			Fe && M && /* @__PURE__ */ F(Re, {
				entry: M,
				collection: se,
				busy: Y || Le,
				onClose: () => Ie(!1),
				onMove: nt
			}),
			O.error && R === "error" && /* @__PURE__ */ F(Ve, {
				error: O.error,
				conflict: !!be,
				dirty: L,
				onReload: Qe,
				onKeepMine: rt,
				onRetry: () => {
					J.current().catch(() => {});
				}
			})
		]
	});
}
function Ve({ error: t, conflict: n, dirty: r, onReload: i, onKeepMine: a, onRetry: o }) {
	let s = t instanceof e && t.status > 0, c = n ? t.message : s && t.type === "invalid_input" ? d("Couldn’t save. Check the highlighted fields.") : s ? d("Couldn’t save. {reason}", { reason: t.message }) : d("Couldn’t save. Check your connection.");
	return /* @__PURE__ */ F("div", {
		className: "pointer-events-none absolute inset-x-0 top-14 z-sticky flex justify-center px-4 max-sm:top-[5.5rem]",
		children: /* @__PURE__ */ I("div", {
			role: "alert",
			className: "pointer-events-auto flex min-h-10 max-w-[560px] items-center gap-2.5 rounded-lg border border-border-float bg-float py-1.5 pl-3 pr-1.5 text-sm text-text shadow-pop",
			children: [
				/* @__PURE__ */ F(te, {
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
					children: d("Try Again")
				})
			]
		})
	});
}
function He() {
	(document.querySelector("[data-cms-body] [contenteditable=\"true\"], [data-cms-body] textarea, [data-cms-body] input") ?? document.querySelector("[data-cms-fields] input, [data-cms-fields] textarea"))?.focus();
}
function Ue({ collection: e, count: t, children: n }) {
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
		}), /* @__PURE__ */ I(C, {
			variant: "ghost",
			onClick: () => {
				localStorage.setItem(r, i ? "closed" : "open"), a(!i);
			},
			"aria-expanded": i,
			className: "-ml-1.5 mt-2 !gap-1.5 !rounded-xs !px-1.5 !text-xs !font-normal !text-faint hover:!text-muted",
			children: [/* @__PURE__ */ F(te, {
				name: i ? "chevron-up" : "chevron-down",
				size: 12
			}), i ? d("Hide Properties") : c(t, "{count} property", "{count} properties")]
		})]
	});
}
var We = [
	"repeater",
	"blocks",
	"richtext",
	"markdown",
	"json",
	"group",
	"code",
	"fields"
];
function Ge({ field: e, value: t, onChange: n, error: r, disabled: i, context: a, values: o }) {
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
export { q as default };
