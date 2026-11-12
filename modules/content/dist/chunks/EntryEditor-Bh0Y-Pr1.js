import e from "./NewEntry-DHnzMbmA.js";
import { CmsError as t, blockNavigation as n, can as r, events as i, invalidate as a, locale as o, navigate as s, panelsFor as c, plural as l, registry as u, run as d, t as f, timeAgo as p, useAbility as m, useConfig as h, useLocation as g, useManifest as _, useScreenContext as v } from "@letterncms/sdk";
import { Suspense as y, useEffect as b, useMemo as x, useRef as S, useState as C, useSyncExternalStore as w } from "react";
import { Button as T, Dialog as E, EmptyState as D, Fields as O, Icon as k, IconButton as A, InspectorPanel as ee, Menu as te, NotFoundState as ne, Notice as re, Page as j, PersonPicker as ie, QueryError as M, ScreenSidebar as ae, SharedMark as oe, Spinner as se, StatusDot as ce, Tabs as le, Tooltip as ue, Topbar as de, cn as N, confirm as fe, copyText as pe, entryActionAvailability as me, fieldControlId as he, slugify as P, statusLabel as ge, toast as _e, useShortcut as ve, useWideInspector as ye, wideFieldTypes as F } from "@letterncms/ui";
import { Fragment as I, jsx as L, jsxs as R } from "react/jsx-runtime";
// admin/src/useCollection.ts
function z(e, t) {
	let n = t ? e.resolvedBlueprints?.find((e) => e.handle === t) : void 0;
	return n ? {
		...e,
		resolvedFields: n.resolvedFields
	} : e;
}
function B(e) {
	let t = _().collections.find((t) => t.handle === e), n = m("collections/get", { handle: e }, { staleTime: 6e4 });
	return {
		summary: t,
		collection: n.data,
		isLoading: n.isLoading,
		error: n.error
	};
}
// admin/src/entrySession.ts
var V = (e) => ({
	title: e.title,
	slug: e.slug,
	data: e.data,
	authorId: e.authorId
}), be = (e) => Object.fromEntries(Object.entries(e).map(([e, t]) => [e.replace(/^data\./, ""), t])), H = (e, t) => e.title === t.title && e.slug === t.slug && e.authorId === t.authorId && JSON.stringify(e.data) === JSON.stringify(t.data), xe = class {
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
		}, n = !this.state.entry || !H(t, V(this.state.entry));
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
			errors: t.type === "invalid_input" ? be(t.details ?? {}) : {},
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
					working: r === this.edit ? V(i) : this.state.working,
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
					working: t === this.edit ? V(n) : this.state.working,
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
			...e ? { working: V(e) } : {},
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
function Se(e, t, r, i, o, s, c = !1, l = null) {
	let u = S(!0), p = S(window.location.pathname);
	b(() => (u.current = !0, () => {
		u.current = !1;
	}), []);
	let [m] = C(() => new xe(e, t, async (e, t, n) => {
		let o = n.publish && n.expiresAt !== void 0 ? { expiresAt: n.expiresAt } : {}, c = e && !s.edit && n.publish ? await d("entries/publish", {
			id: e.id,
			...n.at ? { at: n.at } : {},
			...o,
			expectedVersion: n.expectedVersion ?? e.version
		}) : e ? await d("entries/update", {
			id: e.id,
			...t,
			publish: !!n.publish,
			...n.at ? { at: n.at } : {},
			...o,
			expectedVersion: n.expectedVersion ?? e.version
		}) : await d("entries/create", {
			collection: r,
			locale: i,
			...l ? { blueprint: l } : {},
			...t,
			slug: t.slug || void 0,
			status: n.publish ? "published" : "draft",
			...n.at ? { at: n.at } : {},
			...o.expiresAt ? o : {}
		});
		return !e && u.current && window.location.pathname === p.current && window.history.replaceState(window.history.state, "", `${window.__CMS__.base}/content/${r}/${c.id}${i ? `?locale=${encodeURIComponent(i)}` : ""}`), a("entries/", "revisions/", "content/", "collections/overview"), c;
	})), h = w(m.subscribe, m.get), g = !c && (h.entry ? s.edit : s.create), _ = S(void 0), v = () => clearTimeout(_.current);
	b(() => (v(), g && o > 0 && h.dirty && h.phase !== "saving" && !h.error && !h.conflict && h.working.title.trim() && (_.current = setTimeout(() => void m.save().catch(() => {}), o)), v), [
		m,
		h,
		o,
		g
	]), b(() => n(() => m.get().dirty || m.get().phase === "saving" ? f("Discard unsaved changes?") : null), [m]), b(() => {
		let e = (e) => {
			(m.get().dirty || m.get().phase === "saving") && e.preventDefault();
		};
		return window.addEventListener("beforeunload", e), () => window.removeEventListener("beforeunload", e);
	}, [m]);
	let y = (e = {}) => (v(), !c && (g || e.publish) ? m.save(e) : Promise.resolve(h.entry));
	return {
		...h,
		session: m,
		editable: g,
		save: y,
		update: (e) => {
			g && m.update(e);
		},
		cancel: v
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
function we(e, t, n) {
	return t?.uri ? t.uri === "/" ? "/" : t.uri.replace(/[^/]+$/, n || t.slug) : (e.route ?? "/{slug}").replace("{parent_uri}/", "").replace("{slug}", n || "…").replace(/\{[a-z_]+\}/g, "…").replace(/\/+/g, "/");
}
function Te({ props: e, working: t, fields: n, titleInDetails: i, update: a }) {
	let { entry: s, collection: c, editable: l, errors: u } = e, d = _(), p = d.collections.find((e) => e.handle === c.handle), h = c.system === !0, g = r("collections.manage"), v = m("entries/get-many", { ids: s?.parentId ? [s.parentId] : [] }, { enabled: g && !!s?.parentId }), y = !!p?.within, b = m("pages/builtin", {}, { enabled: y }), x = b.data?.find((e) => e.collection === c.handle)?.pages.find((e) => e.handle === (s?.slug ?? t.slug)), S = (e) => new Intl.DateTimeFormat(o(), {
		dateStyle: "medium",
		timeStyle: "short",
		timeZone: d.site.timezone
	}).format(new Date(e)), C = (e) => e.section === "sidebar" ? "main" : e.section ?? "main", w = n.filter((e) => C(e) === "main"), T = [...new Set(n.map(C))].filter((e) => e !== "main").map((e) => {
		let t = n.filter((t) => C(t) === e), r = e.replace(/[_-]/g, " ").replace(/\b\w/g, (e) => e.toUpperCase());
		return {
			group: e,
			inside: t,
			heading: t.length === 1 && t[0].label?.toLowerCase() === r.toLowerCase() ? null : r
		};
	}), E = s?.displayStatus ?? "draft", D = {
		entry: s ?? void 0,
		collection: c.handle,
		locale: s?.locale ?? d.site.defaultLocale
	}, k = [
		...!h || c.route || p?.within ? [[f("Status"), /* @__PURE__ */ L(ce, {
			status: E,
			label: ge(E),
			className: "text-text"
		}, "status")]] : [],
		...s?.publishedAt && E !== "draft" ? [[f(E === "scheduled" ? "Goes Live" : "Published"), /* @__PURE__ */ L("time", {
			dateTime: s.publishedAt,
			title: d.site.timezone,
			children: S(s.publishedAt)
		}, "published")]] : [],
		...s?.expiresAt && E !== "draft" ? [[f(E === "expired" ? "Ended" : "Ends"), /* @__PURE__ */ L("time", {
			dateTime: s.expiresAt,
			title: d.site.timezone,
			children: S(s.expiresAt)
		}, "ends")]] : [],
		...g ? [
			...s && c.structure === "tree" ? [[f("Parent"), s.parentId ? v.data?.[0]?.title ?? (v.isLoading ? f("Loading…") : "") : f("None")]] : [],
			...p?.within ? [] : [[f("Collection"), c.title]],
			...d.site.locales.length > 1 ? [[f("Language"), s?.locale ?? d.site.defaultLocale]] : [],
			...s?.createdAt ? [[f("Created"), S(s.createdAt)]] : [],
			...s?.updatedAt ? [[f("Updated"), S(s.updatedAt)]] : []
		] : []
	], A = (n) => /* @__PURE__ */ L(Ee, {
		field: n,
		error: u[n.handle],
		children: /* @__PURE__ */ L(O, {
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
	return /* @__PURE__ */ R("div", { children: [
		/* @__PURE__ */ R(U, { children: [
			i && /* @__PURE__ */ L(Ee, {
				field: {
					handle: "title",
					type: "text",
					label: f("Title")
				},
				error: u.title,
				children: /* @__PURE__ */ L(O, {
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
			y ? /* @__PURE__ */ R("div", {
				className: "flex min-h-7 items-start gap-2",
				children: [/* @__PURE__ */ L("span", {
					className: "flex h-7 w-[88px] shrink-0 items-center text-xs text-muted",
					children: f("URL")
				}), /* @__PURE__ */ L("span", {
					className: "flex h-7 min-w-0 flex-1 items-center",
					children: x?.path ? /* @__PURE__ */ L("span", {
						className: "truncate px-1 font-mono text-xs text-faint",
						title: x.path,
						children: x.path
					}) : /* @__PURE__ */ L("span", {
						className: "truncate px-1 text-xs text-faint",
						children: b.isLoading ? "…" : f("Shown inside other pages")
					})
				})]
			}) : /* @__PURE__ */ L(Ee, {
				field: {
					handle: "slug",
					type: "text",
					label: c.route ? f("URL") : f("Handle")
				},
				error: u.slug,
				children: /* @__PURE__ */ L(O, {
					bare: !0,
					fields: [c.route ? {
						handle: "slug",
						type: "slug",
						label: f("URL"),
						component: "uri",
						uri: we(c, s, t.slug),
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
						slug: t.slug || P(t.title)
					},
					onChange: (e, t) => a({ [e]: t ?? "" }),
					errors: u,
					disabled: !l
				})
			}),
			!h && /* @__PURE__ */ L(Ee, {
				field: {
					handle: "authorId",
					type: "person",
					label: f("Author")
				},
				error: u.authorId,
				children: /* @__PURE__ */ L(ie, {
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
			w.map(A)
		] }),
		T.map(({ group: e, inside: t, heading: n }) => /* @__PURE__ */ L(U, {
			title: n,
			children: t.map(A)
		}, e)),
		k.length > 0 && /* @__PURE__ */ R(U, {
			title: f("Info"),
			children: [/* @__PURE__ */ L("dl", {
				className: "m-0 space-y-1",
				children: k.map(([e, t]) => /* @__PURE__ */ R("div", {
					className: "flex min-h-7 items-start gap-2",
					children: [/* @__PURE__ */ L("dt", {
						className: "flex h-7 w-[88px] shrink-0 items-center truncate text-xs text-muted",
						children: e
					}), /* @__PURE__ */ L("dd", {
						className: "m-0 min-w-0 flex-1 break-words py-1 text-sm text-text",
						children: t
					})]
				}, e))
			}), s?.parentId && v.isError && /* @__PURE__ */ L(M, {
				message: v.error.message,
				onRetry: () => void v.refetch(),
				compact: !0
			})]
		})
	] });
}
function U({ title: e, children: t }) {
	return /* @__PURE__ */ R("section", {
		className: N("border-b border-border px-4 pb-3 last:border-b-0", !e && "pt-3"),
		children: [e && /* @__PURE__ */ L("h3", {
			className: "m-0 flex h-10 items-center text-xs font-semibold text-ink",
			children: e
		}), /* @__PURE__ */ L("div", {
			className: "space-y-1",
			children: t
		})]
	});
}
function Ee({ field: e, error: t, children: n }) {
	let r = e.type === "toggle", i = F.includes(e.type), a = !t && e.instructions ? /* @__PURE__ */ L("p", {
		className: "m-0 mt-1 text-xs text-muted",
		children: e.instructions
	}) : null, o = /* @__PURE__ */ R("label", {
		htmlFor: he(e),
		className: N("flex h-7 min-w-0 shrink-0 items-center text-xs text-muted", !i && "w-[88px]"),
		children: [/* @__PURE__ */ L("span", {
			className: "truncate",
			children: e.label
		}), typeof e.shared == "string" && /* @__PURE__ */ L(oe, {
			from: e.shared,
			className: "ml-1.5"
		})]
	});
	return r ? /* @__PURE__ */ R("div", {
		className: "py-1",
		children: [n, a]
	}) : i ? /* @__PURE__ */ R("div", {
		className: "pb-1",
		children: [
			o,
			n,
			a
		]
	}) : /* @__PURE__ */ R("div", {
		className: "flex min-h-7 items-start gap-2",
		children: [o, /* @__PURE__ */ R("div", {
			className: "min-w-0 flex-1",
			children: [n, a]
		})]
	});
}
function De({ entry: e, changes: t, busy: n, onClose: r, onPublish: i }) {
	let a = _(), [o, s] = C(e?.publishedAt ?? null), c = e?.expiresAt && new Date(e.expiresAt).getTime() > Date.now() ? e.expiresAt : null, [l, u] = C(c), [d, p] = C(), [m, h] = C(), g = e?.displayStatus === "scheduled", v = e?.status === "published" && !g && e?.displayStatus !== "expired", y = o ? new Date(o).getTime() : NaN, b = y > Date.now(), x = !!o && y !== new Date(e?.publishedAt ?? 0).getTime() || l !== c, S = f(b || !o && !v ? g ? "Change Schedule" : "Schedule" : v ? t ? "Publish Changes" : "Change Date" : "Publish"), w = !o || v && !t && !x || g && b && !x;
	return /* @__PURE__ */ R(E, {
		open: !0,
		onOpenChange: (e) => !e && !n && r(),
		title: f(g ? "Change Schedule" : v ? "Publication Date" : "Schedule"),
		footer: /* @__PURE__ */ R(I, { children: [/* @__PURE__ */ L(T, {
			disabled: n,
			onClick: r,
			children: f("Cancel")
		}), /* @__PURE__ */ L(T, {
			variant: "publish",
			loading: n,
			disabled: w,
			onClick: async () => {
				Number.isFinite(y) ? v && b ? p(f("Unpublish this entry before scheduling it for a future date.")) : l && !(new Date(l).getTime() > Math.max(Date.now(), y)) ? h(f("Choose an end after the publication date, and not in the past.")) : await i(o, l === c ? void 0 : l) && r() : p(f("Choose a publication date and time."));
			},
			children: S
		})] }),
		children: [/* @__PURE__ */ L(O, {
			fields: [{
				handle: "at",
				type: "date",
				time: !0,
				timezone: a.site.timezone,
				label: f("Starts"),
				required: !0
			}, {
				handle: "ends",
				type: "date",
				time: !0,
				timezone: a.site.timezone,
				label: f("Ends")
			}],
			values: {
				at: o,
				ends: l
			},
			onChange: (e, t) => {
				e === "ends" ? (u(t || null), h(void 0)) : (s(t), p(void 0));
			},
			errors: {
				...d ? { at: d } : {},
				...m ? { ends: m } : {}
			},
			disabled: n
		}), l && /* @__PURE__ */ L(T, {
			variant: "ghost",
			size: "sm",
			icon: "close",
			className: "-ml-2 mt-1",
			disabled: n,
			onClick: () => {
				u(null), h(void 0);
			},
			children: f("Remove End Date")
		})]
	});
}
// admin/src/EntryHistory.tsx
var W = (e) => new Date(e).toLocaleString(o(), {
	dateStyle: "medium",
	timeStyle: "short"
}), Oe = (e) => e.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim(), G = (e, t) => JSON.stringify(e ?? null) !== JSON.stringify(t ?? null), K = (e) => !!e && typeof e == "object" && !Array.isArray(e), ke = (e) => K(e) && typeof e.id == "string" && typeof e.type == "string", Ae = (e) => Array.isArray(e) && e.some(ke), je = (e) => {
	let t = e.replace(/[_-]+/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
	return t.charAt(0).toUpperCase() + t.slice(1);
};
function q(e) {
	if (e == null || e === "") return "";
	if (typeof e == "string") return Oe(e);
	if (typeof e == "boolean") return e ? f("Yes") : "";
	if (Array.isArray(e)) return e.map(q).filter(Boolean).join(", ");
	if (K(e)) {
		let t = [
			e.title,
			e.name,
			e.label,
			e.filename,
			e.text,
			e.url,
			e.id
		].find((e) => typeof e == "string" && e !== "");
		return typeof t == "string" ? Oe(t) : Object.entries(e).map(([e, t]) => `${je(e)}: ${q(t)}`).filter((e) => !e.endsWith(": ")).join(", ");
	}
	return String(e);
}
function Me(e, t = /* @__PURE__ */ new Map()) {
	for (let n of e) {
		if (!ke(n)) continue;
		let e = n.props ?? {}, r = [
			e.text,
			e.label,
			e.title,
			e.question,
			e.alt,
			...Array.isArray(e.items) ? e.items : []
		].map((e) => typeof e == "string" ? Oe(e) : q(e)).filter(Boolean).join(" · "), { children: i, ...a } = n;
		t.set(n.id, {
			words: r,
			raw: JSON.stringify(a)
		}), Array.isArray(i) && Me(i, t);
	}
	return t;
}
function Ne(e, t, n) {
	let r = Me(Array.isArray(t) ? t : []), i = Me(Array.isArray(n) ? n : []), a = [], o = !1;
	for (let t of /* @__PURE__ */ new Set([...r.keys(), ...i.keys()])) {
		let n = r.get(t), s = i.get(t);
		n?.raw !== s?.raw && ((n?.words ?? "") === (s?.words ?? "") ? o = !0 : a.push({
			label: a.length ? "" : e,
			now: n?.words ?? "",
			then: s?.words ?? ""
		}));
	}
	return (o || !a.length && G(t, n)) && a.push({
		label: a.length ? "" : e,
		now: "",
		then: f("Layout or design changed")
	}), a;
}
function Pe(e, t, n) {
	if (!G(t, n)) return [];
	if (Ae(t) || Ae(n)) return Ne(e, t, n);
	if ((K(t) || t == null) && (K(n) || n == null) && (K(t) || K(n))) {
		let r = K(t) ? t : {}, i = K(n) ? n : {};
		return [.../* @__PURE__ */ new Set([...Object.keys(r), ...Object.keys(i)])].flatMap((t) => Pe(`${e} › ${je(t)}`, r[t], i[t]));
	}
	let r = q(t), i = q(n);
	return !r && !i ? [] : [{
		label: e,
		now: r,
		then: r === i ? f("Changed") : i
	}];
}
function Fe(e, t, n, r) {
	let i = {
		title: t.title,
		slug: t.slug,
		data: t.data,
		authorId: t.authorId,
		...t.draft
	}, a = i.data ?? {};
	return [
		...Pe(f("Title"), e.title, i.title),
		...Pe(f("URL"), e.slug, i.slug),
		...G(e.authorId, i.authorId) ? [{
			label: f("Author"),
			now: r,
			then: i.authorId ? f("Someone else") : ""
		}] : [],
		...[.../* @__PURE__ */ new Set([...Object.keys(e.data), ...Object.keys(a)])].flatMap((t) => Pe(n.find((e) => e.handle === t)?.label ?? je(t), e.data[t], a[t]))
	];
}
function Ie({ entry: e, working: t, fields: n, editable: r, onRestore: i }) {
	let a = m("revisions/list", { entryId: e?.id ?? "" }, { enabled: !!e }), [o, s] = C(null);
	if (!e) return /* @__PURE__ */ L(D, {
		compact: !0,
		icon: "history",
		title: f("No history yet")
	});
	if (a.isLoading) return /* @__PURE__ */ L("div", {
		className: "grid place-items-center p-6 text-faint",
		children: /* @__PURE__ */ L(se, {})
	});
	if (a.isError && !a.data) return /* @__PURE__ */ L(M, {
		message: a.error.message,
		onRetry: () => void a.refetch()
	});
	let c = {
		create: f("Created"),
		save: f("Edited"),
		publish: f("Published"),
		unpublish: f("Unpublished"),
		restore: f("Restored"),
		discard: f("Discarded Changes"),
		move: f("Moved")
	}, l = (e) => c[e.action] ?? e.action;
	return /* @__PURE__ */ R(I, { children: [
		a.isError && /* @__PURE__ */ L(M, {
			message: a.error.message,
			onRetry: () => void a.refetch(),
			compact: !0
		}),
		a.data?.length === 0 && /* @__PURE__ */ L(D, {
			compact: !0,
			icon: "history",
			title: f("No history yet")
		}),
		/* @__PURE__ */ L("ol", {
			className: "m-0 list-none px-2 py-2",
			children: (a.data ?? []).map((t, n, r) => {
				let i = /* @__PURE__ */ R(I, { children: [/* @__PURE__ */ L("span", {
					className: "relative grid h-5 w-2 shrink-0 place-items-center",
					"aria-hidden": !0,
					children: /* @__PURE__ */ L("span", { className: N("size-2 rounded-full", t.action === "publish" ? "bg-success" : "bg-surface ring-1 ring-inset ring-border-strong") })
				}), /* @__PURE__ */ R("span", {
					className: "block min-w-0 flex-1",
					children: [/* @__PURE__ */ R("span", {
						className: "block truncate text-sm text-text",
						children: [l(t), t.title && t.title !== e.title && /* @__PURE__ */ R("span", {
							className: "text-muted",
							children: [" · ", t.title]
						})]
					}), /* @__PURE__ */ R("span", {
						className: "block truncate text-xs text-faint",
						children: [
							t.user?.name ?? f("System"),
							" · ",
							/* @__PURE__ */ L("time", {
								dateTime: t.createdAt,
								title: W(t.createdAt),
								children: p(t.createdAt)
							})
						]
					})]
				})] });
				return /* @__PURE__ */ R("li", {
					className: "relative",
					children: [n < r.length - 1 && /* @__PURE__ */ L("span", {
						className: "absolute bottom-[-10px] left-[11.5px] top-[22px] w-px bg-border",
						"aria-hidden": !0
					}), n > 0 ? /* @__PURE__ */ L(T, {
						variant: "ghost",
						onClick: () => s(t),
						className: "!h-auto min-h-12 w-full !items-start !justify-start !gap-2.5 !whitespace-normal !rounded-md !px-2 !py-2 text-left !font-normal",
						children: i
					}) : /* @__PURE__ */ L("div", {
						className: "flex min-h-12 items-start gap-2.5 px-2 py-2",
						children: i
					})]
				}, t.id);
			})
		}),
		/* @__PURE__ */ L(Re, {
			revision: o,
			title: o ? `${l(o)} · ${W(o.createdAt)}` : "",
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
var Le = "grid grid-cols-[minmax(96px,0.6fr)_1fr_1fr] gap-x-4 px-3 py-2";
function Re({ revision: e, title: t, working: n, fields: r, author: i, editable: a, onClose: o, onRestore: s }) {
	let c = m("revisions/get", { id: e?.id ?? "" }, { enabled: !!e }), l = e && c.data ? Fe(n, c.data.snapshot, r, i) : null;
	return /* @__PURE__ */ L(E, {
		open: !!e,
		onOpenChange: (e) => {
			e || o();
		},
		title: t,
		size: "lg",
		className: "max-sm:max-h-[72dvh] max-sm:before:mx-auto max-sm:before:mt-2 max-sm:before:h-1 max-sm:before:w-9 max-sm:before:shrink-0 max-sm:before:rounded-full max-sm:before:bg-border-strong max-sm:before:content-['']",
		...a ? {
			onSubmit: () => e && s(e.id),
			submitLabel: f("Restore Version"),
			submitDisabled: !l?.length
		} : {},
		children: c.isError ? /* @__PURE__ */ L(M, {
			compact: !0,
			message: f("Couldn’t load this version"),
			onRetry: () => void c.refetch(),
			retrying: c.isRefetching
		}) : l ? l.length === 0 ? /* @__PURE__ */ L("p", {
			role: "status",
			className: "m-0 py-6 text-center text-sm text-muted",
			children: f("Same as now")
		}) : /* @__PURE__ */ R("div", {
			role: "table",
			className: "overflow-hidden rounded-lg border border-border",
			children: [/* @__PURE__ */ R("div", {
				role: "row",
				className: N(Le, "sticky top-0 border-b border-border bg-sunken text-xs font-medium text-muted"),
				children: [
					/* @__PURE__ */ L("span", { role: "columnheader" }),
					/* @__PURE__ */ L("span", {
						role: "columnheader",
						children: f("Current")
					}),
					/* @__PURE__ */ L("span", {
						role: "columnheader",
						children: f("This Version")
					})
				]
			}), l.map((e, t) => /* @__PURE__ */ R("div", {
				role: "row",
				className: N(Le, "text-sm", t > 0 && (e.label ? "border-t border-border" : "border-t border-border/50")),
				children: [
					/* @__PURE__ */ L("span", {
						role: "rowheader",
						className: "min-w-0 break-words text-muted",
						children: e.label
					}),
					/* @__PURE__ */ L("span", {
						role: "cell",
						className: N("min-w-0 break-words", e.now ? "text-danger line-through decoration-danger/40" : "text-faint"),
						children: e.now || "—"
					}),
					/* @__PURE__ */ L("span", {
						role: "cell",
						className: N("min-w-0 break-words", e.then ? "text-success" : "text-faint"),
						children: e.then || "—"
					})
				]
			}, t))]
		}) : /* @__PURE__ */ L("div", {
			className: "grid place-items-center py-10 text-faint",
			children: /* @__PURE__ */ L(se, {})
		})
	});
}
// admin/src/EntryMoveDialog.tsx
function ze(e, t, n = []) {
	return e.flatMap((e) => {
		if (e.id === t) return [];
		let r = [...n, e.title || f("Untitled")];
		return [{
			value: e.id,
			label: r.join(" / ")
		}, ...ze(e.children ?? [], t, r)];
	});
}
function Be({ entry: e, collection: t, busy: n, onClose: r, onMove: i }) {
	let a = m("entries/tree", {
		collection: t.handle,
		locale: e.locale
	}, { refetchOnWindowFocus: !1 }), [o, s] = C(e.parentId), [c, l] = C(null), [u, d] = C(!1), p = S(!1), h = [{
		value: "",
		label: f("Root")
	}, ...ze(a.data ?? [], e.id)], g = o === null || h.some((e) => e.value === o), _ = !!a.data && !a.isError, v = n || u, y = c ?? (_ && !g ? f("This parent is no longer available. Choose another parent.") : void 0);
	return /* @__PURE__ */ R(E, {
		open: !0,
		title: f("Move {type}", { type: t.singular }),
		description: f("Choose a new parent for “{title}”.", { title: e.title }),
		onOpenChange: (e) => {
			!e && !v && r();
		},
		footer: /* @__PURE__ */ R(I, { children: [/* @__PURE__ */ L(T, {
			disabled: v,
			onClick: r,
			children: f("Cancel")
		}), /* @__PURE__ */ L(T, {
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
		children: [a.isLoading || !a.data && a.isFetching ? /* @__PURE__ */ R("div", {
			role: "status",
			className: "flex items-center gap-2 py-4 text-sm text-muted",
			children: [/* @__PURE__ */ L(se, { size: 14 }), f("Loading available parents…")]
		}) : /* @__PURE__ */ R(I, { children: [a.isError && /* @__PURE__ */ L(M, {
			message: a.error.message,
			onRetry: () => void a.refetch()
		}), a.data && /* @__PURE__ */ L(O, {
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
		})] }), /* @__PURE__ */ R("div", {
			className: "mt-4 space-y-2 text-xs text-muted",
			children: [e.uri && /* @__PURE__ */ L("p", {
				className: "m-0",
				children: f("Moving a published entry can change its live URL and the URLs of its descendants.")
			}), /* @__PURE__ */ L("p", {
				className: "m-0",
				children: f("Saved unpublished changes stay in the working copy. Moving does not publish them.")
			})]
		})]
	});
}
// admin/src/EntryEditor.tsx
function Ve({ params: t }) {
	let { collection: n, summary: r, isLoading: i, error: o } = B(t.collection), l = t.id === "new", u = J(t.id, l), d = _(), { query: p } = g(), m = l ? n?.resolvedBlueprints?.some((e) => e.handle === p.blueprint) ? p.blueprint : null : u.data?.blueprint ?? null, h = l && !!n?.resolvedBlueprints?.length && p.blueprint === void 0, v = u.data?.sharedFields, y = Object.entries(u.data?.translations ?? {}).find(([, e]) => e === u.data?.originId)?.[0] ?? d.site.defaultLocale, b = x(() => {
		let e = n && z(n, m);
		return e && v?.length ? {
			...e,
			resolvedFields: e.resolvedFields.map((e) => v.includes(e.handle) ? {
				...e,
				readOnly: !0,
				shared: y
			} : e)
		} : e;
	}, [
		n,
		m,
		v?.join(","),
		y
	]), S = He(d, t.collection, u.data?.locale ?? p.locale), C = () => {
		u.refetch(), a("collections/get");
	}, w = b?.resolvedFields.find((e) => e.handle === b.body), E = !!w && c("entry.editor", { bodyField: w }).length > 0 && /* @__PURE__ */ L(ae, {
		title: f("Outline||structure"),
		backTo: S.path,
		backLabel: S.label,
		children: null
	});
	if (i || !l && u.isLoading) return /* @__PURE__ */ R("div", {
		className: "flex h-full flex-col",
		children: [
			E,
			/* @__PURE__ */ L(de, { back: {
				to: S.path,
				label: S.label
			} }),
			/* @__PURE__ */ L("div", {
				className: "grid flex-1 place-items-center",
				children: /* @__PURE__ */ L(se, {})
			})
		]
	});
	let D = o ?? u.error, O = !b || !l && !u.data, k = d.collections.find((e) => e.handle === (S.within?.handle ?? t.collection)), A = [...k ? [{
		label: k.title,
		to: S.path,
		icon: k.icon
	}] : [], { label: f("Not Found") }];
	if (O && D && ![
		"not_found",
		"forbidden",
		"invalid_input"
	].includes(D.type)) return /* @__PURE__ */ L(j, {
		crumbs: k ? A.slice(0, 1) : [],
		children: /* @__PURE__ */ L(M, {
			message: D.message,
			onRetry: C
		})
	});
	if (!b || !r || !l && !u.data) {
		let e = k && /* @__PURE__ */ L(T, {
			onClick: () => s(S.path),
			children: f("Back to {label}", { label: k.title })
		});
		return /* @__PURE__ */ L(j, {
			crumbs: A,
			children: D?.type === "forbidden" ? /* @__PURE__ */ R(I, { children: [/* @__PURE__ */ L(M, {
				title: f("Access denied"),
				message: D.message
			}), e && /* @__PURE__ */ L("div", {
				className: "mt-4",
				children: e
			})] }) : /* @__PURE__ */ L(ne, {
				icon: k?.icon ?? "file",
				action: e
			})
		});
	}
	return h ? /* @__PURE__ */ R(I, { children: [/* @__PURE__ */ L(de, { back: {
		to: S.path,
		label: S.label
	} }), /* @__PURE__ */ L(e, {
		props: {
			collection: b.handle,
			locale: p.locale,
			title: r.newLabel,
			kinds: [{
				handle: "",
				title: r.singular
			}, ...b.resolvedBlueprints.map((e) => ({
				handle: e.handle,
				title: e.title
			}))]
		},
		close: () => s(S.path),
		disabled: !1,
		onAction: () => {},
		scope: {}
	})] }) : /* @__PURE__ */ R(I, { children: [E, /* @__PURE__ */ L(Y, {
		collection: b,
		blueprint: m,
		initial: l ? null : u.data,
		can: r.can
	}, `${t.collection}:${t.id}:${m ?? ""}`)] });
}
function He(e, t, n) {
	let r = e.collections.find((e) => e.handle === t), i = e.collections.find((e) => e.handle === r?.within), a = i ?? r, o = n && n !== e.site.defaultLocale && e.site.locales.includes(n), s = r?.tab ? `?tab=${r.tab}` : o ? `?locale=${n}` : "";
	return {
		path: `/content/${a?.handle ?? t}${s}`,
		label: a?.title ?? "",
		within: i
	};
}
function J(e, t) {
	return m("entries/get", { id: e }, {
		enabled: !t,
		refetchOnWindowFocus: !1
	});
}
function Y({ collection: e, blueprint: t, initial: n, can: r }) {
	let o = _(), { query: l } = g(), p = h("content").autosave ?? 1200, m = n?.locale ?? (o.site.locales.includes(l.locale ?? "") ? l.locale : o.site.defaultLocale), E = He(o, e.handle, m), ne = E.path, j = E.within?.singular ?? o.collections.find((t) => t.handle === e.handle)?.singular ?? e.singular, ie = x(() => ({
		...e,
		singular: j
	}), [e, j]), [M, ae] = C(!1), P = Se(n, {
		title: n?.title ?? "",
		slug: n?.slug ?? "",
		authorId: n ? n.authorId : o.user.id,
		data: n?.data ?? Object.fromEntries(e.resolvedFields.map((e) => [e.handle, e.default ?? null]))
	}, e.handle, m, p, r, M, t), F = P.editable, { entry: z, working: B, dirty: V, phase: be, errors: H, conflict: xe, update: we, session: U } = P, Ee = !!_().collections.find((t) => t.handle === e.handle)?.within, W = {
		...me(r, z),
		...Ee ? { duplicate: !1 } : {}
	}, Oe = ye(), [G, K] = C(() => Oe), [ke, Ae] = C(null), [je, q] = C(!1), Me = `cms.entry.panel.${e.handle}`, [Ne, Pe] = C(() => localStorage.getItem(Me) || "details"), [Fe, Le] = C(!1), [Re, ze] = C(!1), [Ve, J] = C(!1), Y = S(() => P.save()), Je = S({});
	w(u.panels.subscribe, u.panels.version);
	let X = be === "saving";
	v({
		kind: "entry",
		icon: e.icon,
		rightEdge: !0,
		data: () => {
			let { entry: t, working: n, dirty: r } = U.get();
			return {
				collection: e.handle,
				id: t?.id ?? null,
				status: t?.displayStatus ?? "draft",
				unsaved: r,
				title: n.title,
				slug: n.slug,
				url: t?.uri ?? null,
				locale: m,
				fields: n.data
			};
		},
		flush: async () => {
			let e = U.get();
			F && e.dirty && e.working.title.trim() && await P.save().catch(() => {});
		}
	}), b(() => i.on("content.changed", () => {
		let e = U.get().entry?.id;
		e && d("entries/get", { id: e }).then((e) => {
			let t = U.get();
			t.dirty || t.phase === "saving" || e.version === t.entry?.version || U.command(async () => e);
		}).catch(() => {});
	}), [U]);
	let Ye = (e, t) => {
		we({ data: {
			...U.get().working.data,
			[e]: t
		} });
	}, Xe = async (e) => {
		try {
			return await e();
		} catch (e) {
			_e.error(e);
			return;
		}
	}, Ze = async (e = {}) => {
		Je.current = e, Y.current = () => P.save(e);
		try {
			return await P.save(e);
		} catch {
			return;
		}
	}, Qe = async () => {
		Je.current = {}, Y.current = () => P.save(), await P.save();
	}, $e = async (e, t) => {
		if (!W.publish) return !1;
		q(!0);
		let n = await Ze({
			publish: !0,
			...e ? { at: e } : {},
			...t === void 0 ? {} : { expiresAt: t }
		});
		return q(!1), n ? (_e.success(n.displayStatus === "scheduled" ? f("Scheduled") : f("Published")), !0) : !1;
	}, et = () => !U.get().dirty || fe({
		title: f("Discard unsaved changes?"),
		description: f("Your unsaved edits will be replaced."),
		confirm: f("Discard changes"),
		danger: !0
	}), tt = async () => {
		await et() && (P.cancel(), J(!0), Y.current = tt, await Xe(() => U.command((e) => d("entries/get", { id: e.id }))), J(!1));
	}, nt = async (e, t = {}) => {
		await et() && (P.cancel(), J(!0), Y.current = () => nt(e, t), await Xe(() => U.command((n) => d(e, {
			...e === "revisions/restore" ? {} : { id: n.id },
			...t,
			expectedVersion: n.version
		}))), J(!1), a("entries/", "revisions/", "content/"));
	}, rt = async () => {
		z && W.delete && await fe({
			title: f("Delete “{title}”?", { title: z.title }),
			description: f("This permanently deletes the entry and its history."),
			confirm: f("Delete"),
			danger: !0
		}) && (P.cancel(), Y.current = rt, await Xe(async () => {
			await U.command(async (e) => (await d("entries/delete", {
				id: e.id,
				expectedVersion: e.version
			}), e)), U.reset(), a("entries/", "revisions/", "content/"), s(ne);
		}));
	}, it = async () => {
		let t = U.get(), n = t.entry;
		W.duplicate && n && !t.dirty && t.phase !== "saving" && await Xe(async () => {
			let t = await d("entries/duplicate", {
				id: n.id,
				expectedVersion: n.version
			});
			s(`/content/${e.handle}/${t.id}`);
		});
	}, at = async (e) => {
		if (!W.move) return !1;
		P.cancel(), J(!0), Y.current = () => at(e);
		try {
			if (U.get().dirty && !await P.save()) return !1;
			let t = await U.command((t) => d("entries/move", {
				id: t.id,
				parentId: e,
				expectedVersion: t.version
			}));
			return a("entries/", "revisions/", "content/"), !!t;
		} catch (e) {
			return _e.error(e), !1;
		} finally {
			J(!1);
		}
	}, ot = async () => {
		z && xe && await Xe(async () => {
			let e = xe.version ?? (await d("entries/get", { id: z.id })).version;
			await Ze({
				...Je.current,
				expectedVersion: e
			});
		});
	}, Z = {
		entry: z,
		collection: ie,
		content: B,
		values: B.data,
		title: B.title,
		setValue: Ye,
		save: Qe,
		reload: tt,
		editable: F && !Ve,
		can: r,
		errors: H,
		hold: ae
	}, st = c("entry.toolbar", Z), ct = c("entry.notice", Z);
	w(u.entryActions.subscribe, u.entryActions.version);
	let lt = u.entryActions.all().filter((e) => e.when?.(Z) ?? !0).sort((e, t) => (e.order ?? 50) - (t.order ?? 50)), ut = c("entry.sidebar", Z), dt = c("entry.body", Z), ft = e.body, Q = e.resolvedFields.find((e) => e.handle === ft), $ = Ce(e.resolvedFields, ft, [...ut, ...dt]), pt = [
		{
			value: "details",
			label: j,
			icon: e.icon || "file"
		},
		{
			value: "history",
			label: f("History"),
			icon: "history"
		},
		...ut.map((e) => ({
			value: e.id,
			label: e.label ?? e.id,
			icon: e.icon
		}))
	], mt = pt.some((e) => e.value === Ne) ? Ne : "details", ht = (e) => {
		Pe(e), localStorage.setItem(Me, e);
	}, gt = () => {
		G || ht("details"), K(!G);
	}, _t = $.document.filter((e) => !Ke.includes(e.type)), vt = $.document.filter((e) => Ke.includes(e.type)), yt = {
		entry: z ?? void 0,
		collection: e.handle,
		locale: m
	}, bt = /* @__PURE__ */ R("div", {
		className: "flex h-full min-h-0 flex-col",
		children: [/* @__PURE__ */ R("div", {
			className: "flex h-12 shrink-0 items-center gap-2 border-b border-border pl-4 pr-2",
			children: [/* @__PURE__ */ L(le, {
				id: "entry-sidebar",
				value: mt,
				onChange: ht,
				tabs: pt,
				bordered: !1,
				fit: !0,
				className: "h-full min-w-0 flex-1"
			}), /* @__PURE__ */ L(A, {
				icon: "close",
				label: f("Close Panel"),
				onClick: () => K(!1)
			})]
		}), /* @__PURE__ */ L("div", {
			role: "tabpanel",
			id: `entry-sidebar-${mt}-panel`,
			"aria-labelledby": `entry-sidebar-${mt}`,
			className: "min-h-0 flex-1 overflow-y-auto",
			children: mt === "details" ? /* @__PURE__ */ L(Te, {
				props: Z,
				working: B,
				fields: Q?.type === "blocks" ? [...$.document, ...$.sidebar] : $.sidebar,
				titleInDetails: Q?.type === "blocks",
				update: we
			}) : mt === "history" ? /* @__PURE__ */ L(Ie, {
				entry: z,
				working: B,
				fields: e.resolvedFields,
				editable: W.restore && !X,
				onRestore: async (e) => {
					W.restore && await nt("revisions/restore", { revisionId: e });
				}
			}) : ut.filter((e) => e.id === mt).map((e) => /* @__PURE__ */ L(e.component, { ...Z }, e.id))
		})]
	}), xt = /* @__PURE__ */ R(I, { children: [/* @__PURE__ */ L(O, {
		bare: !0,
		fields: [{
			handle: "title",
			type: "text",
			label: f("Title"),
			component: "title",
			placeholder: f("Untitled"),
			autofocus: !z,
			onEnter: () => {
				Ze(), We();
			},
			onDown: We
		}],
		values: { title: B.title },
		onChange: (e, t) => we({ title: t ?? "" }),
		errors: H,
		disabled: !Z.editable
	}), (_t.length > 0 || vt.length > 0) && /* @__PURE__ */ R(Ge, {
		collection: e.handle,
		count: _t.length + vt.length,
		children: [_t.map((e) => /* @__PURE__ */ L(qe, {
			field: e,
			value: B.data[e.handle],
			onChange: (t) => Ye(e.handle, t),
			error: H[e.handle],
			disabled: !Z.editable,
			context: yt,
			values: B.data
		}, e.handle)), vt.length > 0 && /* @__PURE__ */ L(O, {
			fields: vt,
			values: B.data,
			onChange: Ye,
			errors: H,
			disabled: !Z.editable,
			context: yt,
			className: "mt-4 !gap-y-4"
		})]
	})] }), St = Q ? {
		...Z,
		footer: /* @__PURE__ */ L(I, { children: dt.map((e) => /* @__PURE__ */ L(e.component, { ...Z }, e.id)) }),
		bodyField: Q,
		setTitle: (e) => we({ title: e }),
		sidebar: bt,
		sidebarOpen: G,
		setSidebarOpen: K,
		toolbar: ke,
		listPath: ne,
		listLabel: E.label
	} : null, Ct = St ? c("entry.editor", St)[0] : null, wt = z?.displayStatus ?? "draft", Tt = z?.status === "published" && wt !== "scheduled" && wt !== "expired", Et = Tt && !V && !z?.hasDraft, Dt = !z && V && !B.title.trim(), Ot = B.title || f("Untitled"), kt = be === "error" ? f("Couldn’t save") : Dt ? f("Add a title to save") : X ? f("Saving…") : V ? f("Unsaved") : z ? f("Saved") : "", At = /* @__PURE__ */ L("span", {
		"aria-hidden": "true",
		title: kt || void 0,
		className: N("block size-1.5 rounded-full", be === "error" || Dt ? "bg-danger" : X || V ? "bg-faint" : "bg-transparent")
	}), jt = be === "error" || Dt, Mt = /* @__PURE__ */ R("span", {
		className: "flex min-w-0 items-center gap-1.5",
		children: [
			/* @__PURE__ */ L("span", {
				className: "truncate",
				children: Ot
			}),
			At,
			jt && /* @__PURE__ */ L("span", {
				className: "shrink-0 text-xs font-normal text-danger",
				children: kt
			})
		]
	});
	return ve("mod+s", () => {
		F && Ze();
	}, !0, F ? f("Save") : void 0), ve("mod+shift+p", () => {
		W.publish && !M && !Et && B.title.trim() && $e();
	}, !0, W.publish && !M ? f("Publish") : void 0), ve("mod+.", gt, !0, f("{name} Details", { name: j })), b(() => {
		let t = Object.keys(H)[0];
		if (!t) return;
		let n = t.replace(/^data\./, "").split("."), r = n[0], i = $.claimed.get(r);
		(i || Q?.type === "blocks" && (r === "title" || $.document.some((e) => e.handle === r)) || r === "authorId" || r === "slug" || $.sidebar.some((e) => e.handle === r)) && (K(!0), ht(i ?? "details")), $.document.some((e) => e.handle === r) && (localStorage.setItem(`cms.properties.${e.handle}`, "open"), window.dispatchEvent(new Event("cms.fields.reveal"))), requestAnimationFrame(() => {
			let e = document.getElementById(he({ handle: n.at(-1) }, n.slice(0, -1))) ?? document.getElementById(`f-${r}`) ?? document.querySelector(`[data-field="${CSS.escape(r)}"] input, [data-field="${CSS.escape(r)}"] textarea, [data-field="${CSS.escape(r)}"] button`);
			e?.scrollIntoView({ block: "center" }), e?.focus();
		});
	}, [H]), /* @__PURE__ */ R("div", {
		className: "relative flex h-full flex-col",
		children: [
			/* @__PURE__ */ L(de, {
				className: "max-sm:[&_[data-workspace-toggle]]:hidden",
				back: {
					to: ne,
					label: E.label
				},
				title: Mt,
				children: /* @__PURE__ */ R(I, { children: [/* @__PURE__ */ L("span", {
					className: "min-w-0 text-sm font-medium text-ink max-sm:hidden lg:hidden",
					children: Mt
				}), Ct && /* @__PURE__ */ L("div", {
					ref: Ae,
					className: "flex shrink-0 items-center gap-0.5 empty:hidden"
				})] }),
				actions: /* @__PURE__ */ R(I, { children: [
					/* @__PURE__ */ L("span", {
						role: "status",
						className: "sr-only",
						children: kt
					}),
					st.map((e) => /* @__PURE__ */ L(e.component, { ...Z }, e.id)),
					/* @__PURE__ */ L(ue, {
						content: f("{name} Details", { name: j }),
						shortcut: "mod+.",
						children: /* @__PURE__ */ L(A, {
							icon: "sidebar",
							label: f("{name} Details", { name: j }),
							title: void 0,
							active: G,
							onClick: gt,
							className: "[&_svg]:-scale-x-100"
						})
					}),
					W.publish ? Et ? /* @__PURE__ */ L(te, {
						trigger: /* @__PURE__ */ R(T, {
							variant: "ghost",
							className: "!gap-1 !px-1.5 !font-normal",
							children: [/* @__PURE__ */ L(ce, {
								status: wt,
								label: ge(wt),
								className: "text-sm"
							}), /* @__PURE__ */ L(k, {
								name: "chevron-down",
								size: 12,
								className: "shrink-0 text-faint"
							})]
						}),
						items: [{
							label: f("Publication Date…"),
							icon: "calendar",
							onSelect: () => Le(!0)
						}, z && W.unpublish && {
							label: f("Unpublish"),
							icon: "eye-off",
							onSelect: () => {
								nt("entries/unpublish");
							}
						}]
					}) : /* @__PURE__ */ R(T, {
						variant: "publish",
						disabled: !B.title.trim() || M,
						loading: je,
						onClick: () => {
							$e();
						},
						children: [/* @__PURE__ */ L("span", {
							className: "max-sm:hidden",
							children: f(wt === "scheduled" ? "Publish Now" : Tt ? "Publish Changes" : "Publish")
						}), /* @__PURE__ */ L("span", {
							className: "sm:hidden",
							children: f("Publish")
						})]
					}) : F && /* @__PURE__ */ L(T, {
						variant: "primary",
						disabled: !V || X,
						loading: X,
						onClick: () => {
							Ze();
						},
						children: f("Save Draft")
					}),
					/* @__PURE__ */ L(te, {
						trigger: /* @__PURE__ */ L(A, {
							icon: "more",
							label: f("More Actions")
						}),
						items: [
							...lt.map((e) => ({
								label: e.label,
								icon: e.icon,
								onSelect: () => e.perform(Z)
							})),
							z && Tt && z.uri && !z.hasDraft ? {
								label: f("View on Site"),
								icon: "external",
								onSelect: () => {
									window.open(z.uri, "_blank", "noopener");
								}
							} : null,
							W.publish && !Et && {
								label: f(wt === "scheduled" ? "Change Schedule" : Tt ? "Publication Date…" : "Schedule…"),
								icon: "calendar",
								onSelect: () => Le(!0)
							},
							z && W.move && e.structure === "tree" && {
								label: f("Move…"),
								icon: "arrow-right",
								onSelect: () => ze(!0)
							},
							z && W.duplicate && {
								label: f("Duplicate"),
								icon: "copy",
								disabled: X || V,
								description: X || V ? f("Save changes before duplicating") : void 0,
								onSelect: () => {
									it();
								}
							},
							z && W.discard && z.hasDraft && {
								label: f("Discard Unpublished Changes"),
								icon: "undo",
								onSelect: () => {
									nt("entries/discard-draft");
								}
							},
							z && W.unpublish && !(W.publish && Et) && {
								label: f("Unpublish"),
								icon: "eye-off",
								onSelect: () => {
									nt("entries/unpublish");
								}
							},
							z && {
								label: f("Copy ID"),
								icon: "hash",
								onSelect: () => void pe(z.id, { copied: f("ID copied") })
							},
							z && W.delete && {
								separator: !0,
								label: ""
							},
							z && W.delete && {
								label: f("Delete"),
								icon: "trash",
								danger: !0,
								onSelect: rt
							}
						]
					})
				] })
			}),
			/* @__PURE__ */ R("div", {
				className: "flex h-8 shrink-0 items-center gap-3 border-b border-border px-4 sm:hidden",
				children: [/* @__PURE__ */ L("span", {
					className: "min-w-0 flex-1 truncate text-sm font-medium text-ink",
					children: Ot
				}), /* @__PURE__ */ L("span", {
					"aria-hidden": "true",
					className: N("shrink-0 text-xs", jt ? "text-danger" : "text-faint"),
					children: kt
				})]
			}),
			$.error && /* @__PURE__ */ L(re, {
				tone: "danger",
				className: "m-3",
				children: $.error
			}),
			ct.map((e) => /* @__PURE__ */ L(e.component, { ...Z }, e.id)),
			Ct && St ? /* @__PURE__ */ L("div", {
				className: "min-h-0 flex-1",
				children: /* @__PURE__ */ L(y, {
					fallback: /* @__PURE__ */ L("div", {
						className: "grid h-full place-items-center",
						children: /* @__PURE__ */ L(se, {})
					}),
					children: /* @__PURE__ */ L(Ct.component, { ...St })
				})
			}) : /* @__PURE__ */ R("div", {
				className: "flex min-h-0 flex-1",
				children: [/* @__PURE__ */ L("div", {
					className: "min-w-0 flex-1 overflow-y-auto",
					children: /* @__PURE__ */ R("article", {
						className: "mx-auto w-full max-w-[784px] px-6 pb-24 pt-12 md:px-8 md:pt-16",
						children: [
							xt,
							Q?.type === "blocks" ? /* @__PURE__ */ L(D, {
								icon: "blocks",
								title: f("Block editor unavailable")
							}) : Q && /* @__PURE__ */ R("div", {
								className: "mt-8",
								"data-cms-body": !0,
								children: [typeof Q.shared == "string" && /* @__PURE__ */ L(oe, {
									from: Q.shared,
									className: "mb-2"
								}), /* @__PURE__ */ L(O, {
									bare: !0,
									fields: [Q],
									values: B.data,
									onChange: Ye,
									errors: H,
									disabled: !Z.editable,
									context: {
										...yt,
										title: B.title
									}
								})]
							}),
							dt.map((e) => /* @__PURE__ */ L(e.component, { ...Z }, e.id))
						]
					})
				}), /* @__PURE__ */ L(ee, {
					open: G,
					onOpenChange: K,
					title: j,
					children: bt
				})]
			}),
			Fe && /* @__PURE__ */ L(De, {
				entry: z,
				changes: V || !!z?.hasDraft,
				busy: X,
				onClose: () => Le(!1),
				onPublish: (e, t) => $e(e, t)
			}),
			Re && z && /* @__PURE__ */ L(Be, {
				entry: z,
				collection: ie,
				busy: X || Ve,
				onClose: () => ze(!1),
				onMove: at
			}),
			P.error && be === "error" && /* @__PURE__ */ L(Ue, {
				error: P.error,
				conflict: !!xe,
				dirty: V,
				onReload: tt,
				onKeepMine: ot,
				onRetry: () => {
					Y.current().catch(() => {});
				}
			})
		]
	});
}
function Ue({ error: e, conflict: n, dirty: r, onReload: i, onKeepMine: a, onRetry: o }) {
	let s = e instanceof t && e.status > 0, c = n ? e.message : s && e.type === "invalid_input" ? f("Couldn’t save. Check the highlighted fields.") : s ? f("Couldn’t save. {reason}", { reason: e.message }) : f("Couldn’t save. Check your connection.");
	return /* @__PURE__ */ L("div", {
		className: "pointer-events-none absolute inset-x-0 top-14 z-sticky flex justify-center px-4 max-sm:top-[5.5rem]",
		children: /* @__PURE__ */ R("div", {
			role: "alert",
			className: "pointer-events-auto flex min-h-10 max-w-[560px] items-center gap-2.5 rounded-lg border border-border-float bg-float py-1.5 pl-3 pr-1.5 text-sm text-text shadow-pop",
			children: [
				/* @__PURE__ */ L(k, {
					name: "warning",
					size: 16,
					className: "shrink-0 text-danger"
				}),
				/* @__PURE__ */ L("span", {
					className: "min-w-0 flex-1",
					children: c
				}),
				n ? /* @__PURE__ */ R(I, { children: [/* @__PURE__ */ L(T, {
					size: "xs",
					variant: "ghost",
					onClick: i,
					children: f("Load Their Version")
				}), r && /* @__PURE__ */ L(T, {
					size: "xs",
					variant: "ghost",
					onClick: a,
					children: f("Keep Mine")
				})] }) : e.type !== "invalid_input" && /* @__PURE__ */ L(T, {
					size: "xs",
					variant: "ghost",
					onClick: o,
					children: f("Try Again")
				})
			]
		})
	});
}
function We() {
	(document.querySelector("[data-cms-body] [contenteditable=\"true\"], [data-cms-body] textarea, [data-cms-body] input") ?? document.querySelector("[data-cms-fields] input, [data-cms-fields] textarea"))?.focus();
}
function Ge({ collection: e, count: t, children: n }) {
	let r = `cms.properties.${e}`, [i, a] = C(() => localStorage.getItem(r) !== "closed");
	return b(() => {
		let e = () => a(!0);
		return window.addEventListener("cms.fields.reveal", e), () => window.removeEventListener("cms.fields.reveal", e);
	}, []), /* @__PURE__ */ R("div", {
		className: "mt-6",
		"data-cms-fields": i ? "" : void 0,
		children: [i && /* @__PURE__ */ L("div", {
			className: "space-y-px",
			children: n
		}), /* @__PURE__ */ R(T, {
			variant: "ghost",
			onClick: () => {
				localStorage.setItem(r, i ? "closed" : "open"), a(!i);
			},
			"aria-expanded": i,
			className: "-ml-1.5 mt-2 !gap-1.5 !rounded-xs !px-1.5 !text-xs !font-normal !text-faint hover:!text-muted",
			children: [/* @__PURE__ */ L(k, {
				name: i ? "chevron-up" : "chevron-down",
				size: 12
			}), i ? f("Hide Properties") : l(t, "{count} property", "{count} properties")]
		})]
	});
}
var Ke = [
	"repeater",
	"blocks",
	"richtext",
	"markdown",
	"json",
	"group",
	"code",
	"fields"
];
function qe({ field: e, value: t, onChange: n, error: r, disabled: i, context: a, values: o }) {
	return /* @__PURE__ */ R("div", {
		className: "grid grid-cols-[148px_minmax(0,1fr)] items-start gap-3 py-0.5",
		children: [/* @__PURE__ */ R("div", {
			className: "flex h-8 min-w-0 items-center gap-1.5 text-sm text-muted",
			title: e.instructions ?? e.label,
			children: [/* @__PURE__ */ L("span", {
				className: "truncate",
				children: e.label
			}), typeof e.shared == "string" && /* @__PURE__ */ L(oe, { from: e.shared })]
		}), /* @__PURE__ */ L("div", {
			className: "min-w-0",
			children: /* @__PURE__ */ L(O, {
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
export { Ve as default };
