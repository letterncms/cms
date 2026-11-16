import e from "./NewEntry-DHnzMbmA.js";
import { CmsError as t, blockNavigation as n, can as r, events as i, invalidate as a, locale as o, navigate as s, panelsFor as c, plural as l, registry as u, run as d, t as f, timeAgo as p, useAbility as m, useConfig as h, useLocation as g, useManifest as _, useScreenContext as v } from "@letterncms/sdk";
import { Fragment as y, Suspense as b, useEffect as x, useMemo as S, useRef as C, useState as w, useSyncExternalStore as T } from "react";
import { Button as E, Dialog as D, EmptyState as O, Fields as k, Icon as ee, IconButton as te, InspectorPanel as ne, Menu as re, NotFoundState as A, Notice as ie, Page as ae, PanelHeader as oe, PersonPicker as se, QueryError as j, ScreenSidebar as M, SharedMark as ce, Spinner as le, StatusDot as ue, Tabs as de, Tooltip as N, Topbar as fe, cn as P, confirm as pe, copyText as me, entryActionAvailability as he, fieldControlId as ge, fieldVisible as _e, nativeName as F, settledValues as I, slugify as L, statusLabel as ve, toast as ye, useShortcut as be, useWideInspector as xe, wideFieldTypes as Se } from "@letterncms/ui";
import { Fragment as R, jsx as z, jsxs as B } from "react/jsx-runtime";
// admin/src/useCollection.ts
function V(e, t) {
	let n = t ? e.resolvedBlueprints?.find((e) => e.handle === t) : void 0;
	return n ? {
		...e,
		resolvedFields: n.resolvedFields,
		blueprint: n.handle
	} : e;
}
function Ce(e) {
	let t = _().collections.find((t) => t.handle === e), n = m("collections/get", { handle: e }, { staleTime: 6e4 });
	return {
		summary: t,
		collection: n.data,
		isLoading: n.isLoading,
		error: n.error
	};
}
// admin/src/entrySession.ts
var H = (e) => ({
	title: e.title,
	slug: e.slug,
	data: e.data,
	authorId: e.authorId
}), U = (e) => Object.fromEntries(Object.entries(e).map(([e, t]) => [e.replace(/^data\./, ""), t])), we = (e, t) => e.title === t.title && e.slug === t.slug && e.authorId === t.authorId && JSON.stringify(e.data) === JSON.stringify(t.data), W = class {
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
		}, n = !this.state.entry || !we(t, H(this.state.entry));
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
			errors: t.type === "invalid_input" ? U(t.details ?? {}) : {},
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
					working: r === this.edit ? H(i) : this.state.working,
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
					working: t === this.edit ? H(n) : this.state.working,
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
			...e ? { working: H(e) } : {},
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
function Te(e, t, r, i, o, s, c = !1, l = null) {
	let u = C(!0), p = C(window.location.pathname);
	x(() => (u.current = !0, () => {
		u.current = !1;
	}), []);
	let [m] = w(() => new W(e, t, async (e, t, n) => {
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
	})), h = T(m.subscribe, m.get), g = !c && (h.entry ? s.edit : s.create), _ = C(void 0), v = () => clearTimeout(_.current);
	x(() => (v(), g && o > 0 && h.dirty && h.phase !== "saving" && !h.error && !h.conflict && h.working.title.trim() && (_.current = setTimeout(() => void m.save().catch(() => {}), o)), v), [
		m,
		h,
		o,
		g
	]), x(() => n(() => m.get().dirty || m.get().phase === "saving" ? f("Discard unsaved changes?") : null), [m]), x(() => {
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
function Ee(e, t, n) {
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
function De(e, t, n) {
	return t?.uri ? t.uri === "/" ? "/" : t.uri.replace(/[^/]+$/, n || t.slug) : (e.route ?? "/{slug}").replace("{parent_uri}/", "").replace("{slug}", n || "…").replace(/\{[a-z_]+\}/g, "…").replace(/\/+/g, "/");
}
function Oe({ props: e, working: t, fields: n, titleInDetails: i, update: a }) {
	let { entry: s, collection: c, editable: l, errors: u } = e, d = _(), p = d.collections.find((e) => e.handle === c.handle), h = c.system === !0, g = r("collections.manage"), v = m("entries/get-many", { ids: s?.parentId ? [s.parentId] : [] }, { enabled: g && !!s?.parentId }), y = !!p?.within, b = m("pages/builtin", {}, { enabled: y }), x = b.data?.find((e) => e.collection === c.handle)?.pages.find((e) => e.handle === (s?.slug ?? t.slug)), S = (e) => new Intl.DateTimeFormat(o(), {
		dateStyle: "medium",
		timeStyle: "short",
		timeZone: d.site.timezone
	}).format(new Date(e)), C = (e) => e.section === "sidebar" ? "main" : e.section ?? "main", w = I(n, t.data), T = n.filter((e) => _e(e, w)), E = T.filter((e) => C(e) === "main"), D = [...new Set(T.map(C))].filter((e) => e !== "main").map((e) => {
		let t = T.filter((t) => C(t) === e), n = e.replace(/[_-]/g, " ").replace(/\b\w/g, (e) => e.toUpperCase());
		return {
			group: e,
			inside: t,
			heading: t.length === 1 && t[0].label?.toLowerCase() === n.toLowerCase() ? null : n
		};
	}), O = s?.displayStatus ?? "draft", ee = {
		entry: s ?? void 0,
		collection: c.handle,
		locale: s?.locale ?? d.site.defaultLocale
	}, te = [
		...!h || c.route || p?.within ? [[f("Status"), /* @__PURE__ */ z(ue, {
			status: O,
			label: ve(O),
			className: "text-text"
		}, "status")]] : [],
		...s?.publishedAt && O !== "draft" ? [[f(O === "scheduled" ? "Goes Live" : "Published"), /* @__PURE__ */ z(N, {
			content: d.site.timezone,
			children: /* @__PURE__ */ z("time", {
				dateTime: s.publishedAt,
				children: S(s.publishedAt)
			})
		}, "published")]] : [],
		...s?.expiresAt && O !== "draft" ? [[f(O === "expired" ? "Ended" : "Ends"), /* @__PURE__ */ z(N, {
			content: d.site.timezone,
			children: /* @__PURE__ */ z("time", {
				dateTime: s.expiresAt,
				children: S(s.expiresAt)
			})
		}, "ends")]] : [],
		...g ? [
			...s && c.structure === "tree" ? [[f("Parent"), s.parentId ? v.data?.[0]?.title ?? (v.isLoading ? f("Loading…") : "") : f("None")]] : [],
			...p?.within ? [] : [[f("Collection"), c.title]],
			...d.site.locales.length > 1 ? [[f("Language"), F(s?.locale ?? d.site.defaultLocale)]] : [],
			...s?.createdAt ? [[f("Created"), S(s.createdAt)]] : [],
			...s?.updatedAt ? [[f("Updated"), S(s.updatedAt)]] : []
		] : []
	], ne = (t) => /* @__PURE__ */ z(K, {
		field: t,
		error: u[t.handle],
		children: /* @__PURE__ */ z(k, {
			bare: !0,
			fields: [{
				...t,
				width: "full",
				size: t.size ?? "sm",
				rows: t.type === "textarea" ? t.rows ?? 3 : t.rows
			}],
			values: w,
			onChange: e.setValue,
			errors: u,
			disabled: !l,
			context: ee
		})
	}, t.handle);
	return /* @__PURE__ */ B("div", { children: [
		/* @__PURE__ */ B(G, { children: [
			i && /* @__PURE__ */ z(K, {
				field: {
					handle: "title",
					type: "text",
					label: f("Title")
				},
				error: u.title,
				children: /* @__PURE__ */ z(k, {
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
			y ? /* @__PURE__ */ B("div", {
				className: "flex min-h-7 items-start gap-2",
				children: [/* @__PURE__ */ z("span", {
					className: "flex h-7 w-[88px] shrink-0 items-center text-xs text-muted",
					children: f("URL")
				}), /* @__PURE__ */ z("span", {
					className: "flex h-7 min-w-0 flex-1 items-center",
					children: x?.path ? /* @__PURE__ */ z(N, {
						content: x.path,
						children: /* @__PURE__ */ z("span", {
							className: "truncate px-1 font-mono text-xs text-faint",
							children: x.path
						})
					}) : /* @__PURE__ */ z("span", {
						className: "truncate px-1 text-xs text-faint",
						children: b.isLoading ? "…" : f("Shown inside other pages")
					})
				})]
			}) : /* @__PURE__ */ z(K, {
				field: {
					handle: "slug",
					type: "text",
					label: c.route ? f("URL") : f("Handle")
				},
				error: u.slug,
				children: /* @__PURE__ */ z(k, {
					bare: !0,
					fields: [c.route ? {
						handle: "slug",
						type: "slug",
						label: f("URL"),
						component: "uri",
						uri: De(c, s, t.slug),
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
						slug: t.slug || L(t.title)
					},
					onChange: (e, t) => a({ [e]: t ?? "" }),
					errors: u,
					disabled: !l
				})
			}),
			!h && /* @__PURE__ */ z(K, {
				field: {
					handle: "authorId",
					type: "person",
					label: f("Author")
				},
				error: u.authorId,
				children: /* @__PURE__ */ z(se, {
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
			E.map(ne)
		] }),
		D.map(({ group: e, inside: t, heading: n }) => /* @__PURE__ */ z(G, {
			title: n,
			children: t.map(ne)
		}, e)),
		te.length > 0 && /* @__PURE__ */ B(G, {
			title: f("Info"),
			children: [/* @__PURE__ */ z("dl", {
				className: "m-0 space-y-1",
				children: te.map(([e, t]) => /* @__PURE__ */ B("div", {
					className: "flex min-h-7 items-start gap-2",
					children: [/* @__PURE__ */ z("dt", {
						className: "flex h-7 w-[88px] shrink-0 items-center truncate text-xs text-muted",
						children: e
					}), /* @__PURE__ */ z("dd", {
						className: "m-0 min-w-0 flex-1 break-words py-1 text-sm text-text",
						children: t
					})]
				}, e))
			}), s?.parentId && v.isError && /* @__PURE__ */ z(j, {
				message: v.error.message,
				onRetry: () => void v.refetch(),
				compact: !0
			})]
		})
	] });
}
function G({ title: e, children: t }) {
	return /* @__PURE__ */ B("section", {
		className: P("border-b border-border px-4 pb-3 last:border-b-0", !e && "pt-3"),
		children: [e && /* @__PURE__ */ z("h3", {
			className: "m-0 flex h-10 items-center text-xs font-semibold text-ink",
			children: e
		}), /* @__PURE__ */ z("div", {
			className: "space-y-1",
			children: t
		})]
	});
}
function K({ field: e, error: t, children: n }) {
	let r = e.type === "toggle", i = Se.includes(e.type), a = !t && e.instructions ? /* @__PURE__ */ z("p", {
		className: "m-0 mt-1 text-xs text-muted",
		children: e.instructions
	}) : null, o = /* @__PURE__ */ B("label", {
		htmlFor: ge(e),
		className: P("flex h-7 min-w-0 shrink-0 items-center text-xs text-muted", !i && "w-[88px]"),
		children: [/* @__PURE__ */ z("span", {
			className: "truncate",
			children: e.label
		}), typeof e.shared == "string" && /* @__PURE__ */ z(ce, {
			from: e.shared,
			className: "ml-1.5"
		})]
	});
	return r ? /* @__PURE__ */ B("div", {
		className: "py-1",
		children: [n, a]
	}) : i ? /* @__PURE__ */ B("div", {
		className: "pb-1",
		children: [
			o,
			n,
			a
		]
	}) : /* @__PURE__ */ B("div", {
		className: "flex min-h-7 items-start gap-2",
		children: [o, /* @__PURE__ */ B("div", {
			className: "min-w-0 flex-1",
			children: [n, a]
		})]
	});
}
function ke({ entry: e, changes: t, busy: n, onClose: r, onPublish: i }) {
	let a = _(), [o, s] = w(e?.publishedAt ?? null), c = e?.expiresAt && new Date(e.expiresAt).getTime() > Date.now() ? e.expiresAt : null, [l, u] = w(c), [d, p] = w(), [m, h] = w(), g = e?.displayStatus === "scheduled", v = e?.status === "published" && !g && e?.displayStatus !== "expired", y = o ? new Date(o).getTime() : NaN, b = y > Date.now(), x = !!o && y !== new Date(e?.publishedAt ?? 0).getTime() || l !== c, S = f(b || !o && !v ? g ? "Change Schedule" : "Schedule" : v ? t ? "Publish Changes" : "Change Date" : "Publish"), C = !o || v && !t && !x || g && b && !x;
	return /* @__PURE__ */ B(D, {
		open: !0,
		onOpenChange: (e) => !e && !n && r(),
		title: f(g ? "Change Schedule" : v ? "Publication Date" : "Schedule"),
		footer: /* @__PURE__ */ B(R, { children: [/* @__PURE__ */ z(E, {
			disabled: n,
			onClick: r,
			children: f("Cancel")
		}), /* @__PURE__ */ z(E, {
			variant: "publish",
			loading: n,
			disabled: C,
			onClick: async () => {
				Number.isFinite(y) ? v && b ? p(f("Unpublish this entry before scheduling it for a future date.")) : l && !(new Date(l).getTime() > Math.max(Date.now(), y)) ? h(f("Choose an end after the publication date, and not in the past.")) : await i(o, l === c ? void 0 : l) && r() : p(f("Choose a publication date and time."));
			},
			children: S
		})] }),
		children: [/* @__PURE__ */ z(k, {
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
		}), l && /* @__PURE__ */ z(E, {
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
var Ae = (e) => new Date(e).toLocaleString(o(), {
	dateStyle: "medium",
	timeStyle: "short"
}), je = (e) => e.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim(), Me = (e, t) => JSON.stringify(e ?? null) !== JSON.stringify(t ?? null), q = (e) => !!e && typeof e == "object" && !Array.isArray(e), Ne = (e) => q(e) && typeof e.id == "string" && typeof e.type == "string", Pe = (e) => Array.isArray(e) && e.some(Ne), Fe = (e) => {
	let t = e.replace(/[_-]+/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
	return t.charAt(0).toUpperCase() + t.slice(1);
};
function Ie(e) {
	if (e == null || e === "") return "";
	if (typeof e == "string") return je(e);
	if (typeof e == "boolean") return e ? f("Yes") : "";
	if (Array.isArray(e)) return e.map(Ie).filter(Boolean).join(", ");
	if (q(e)) {
		let t = [
			e.title,
			e.name,
			e.label,
			e.filename,
			e.text,
			e.url,
			e.id
		].find((e) => typeof e == "string" && e !== "");
		return typeof t == "string" ? je(t) : Object.entries(e).map(([e, t]) => `${Fe(e)}: ${Ie(t)}`).filter((e) => !e.endsWith(": ")).join(", ");
	}
	return String(e);
}
function Le(e, t = /* @__PURE__ */ new Map()) {
	for (let n of e) {
		if (!Ne(n)) continue;
		let e = n.props ?? {}, r = [
			e.text,
			e.label,
			e.title,
			e.question,
			e.alt,
			...Array.isArray(e.items) ? e.items : []
		].map((e) => typeof e == "string" ? je(e) : Ie(e)).filter(Boolean).join(" · "), { children: i, ...a } = n;
		t.set(n.id, {
			words: r,
			raw: JSON.stringify(a)
		}), Array.isArray(i) && Le(i, t);
	}
	return t;
}
function Re(e, t, n) {
	let r = Le(Array.isArray(t) ? t : []), i = Le(Array.isArray(n) ? n : []), a = [], o = !1;
	for (let t of /* @__PURE__ */ new Set([...r.keys(), ...i.keys()])) {
		let n = r.get(t), s = i.get(t);
		n?.raw !== s?.raw && ((n?.words ?? "") === (s?.words ?? "") ? o = !0 : a.push({
			label: a.length ? "" : e,
			now: n?.words ?? "",
			then: s?.words ?? ""
		}));
	}
	return (o || !a.length && Me(t, n)) && a.push({
		label: a.length ? "" : e,
		now: "",
		then: f("Layout or design changed")
	}), a;
}
function ze(e, t, n) {
	if (!Me(t, n)) return [];
	if (Pe(t) || Pe(n)) return Re(e, t, n);
	if ((q(t) || t == null) && (q(n) || n == null) && (q(t) || q(n))) {
		let r = q(t) ? t : {}, i = q(n) ? n : {};
		return [.../* @__PURE__ */ new Set([...Object.keys(r), ...Object.keys(i)])].flatMap((t) => ze(`${e} › ${Fe(t)}`, r[t], i[t]));
	}
	let r = Ie(t), i = Ie(n);
	return !r && !i ? [] : [{
		label: e,
		now: r,
		then: r === i ? f("Changed") : i
	}];
}
function Be(e, t, n, r) {
	let i = {
		title: t.title,
		slug: t.slug,
		data: t.data,
		authorId: t.authorId,
		...t.draft
	}, a = i.data ?? {};
	return [
		...ze(f("Title"), e.title, i.title),
		...ze(f("URL"), e.slug, i.slug),
		...Me(e.authorId, i.authorId) ? [{
			label: f("Author"),
			now: r,
			then: i.authorId ? f("Someone else") : ""
		}] : [],
		...[.../* @__PURE__ */ new Set([...Object.keys(e.data), ...Object.keys(a)])].flatMap((t) => ze(n.find((e) => e.handle === t)?.label ?? Fe(t), e.data[t], a[t]))
	];
}
function Ve({ entry: e, working: t, fields: n, editable: r, onRestore: i }) {
	let a = m("revisions/list", { entryId: e?.id ?? "" }, { enabled: !!e }), [o, s] = w(null);
	if (!e) return /* @__PURE__ */ z(O, {
		compact: !0,
		icon: "history",
		title: f("No history yet")
	});
	if (a.isLoading) return /* @__PURE__ */ z("div", {
		className: "grid place-items-center p-6 text-faint",
		children: /* @__PURE__ */ z(le, {})
	});
	if (a.isError && !a.data) return /* @__PURE__ */ z(j, {
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
	return /* @__PURE__ */ B(R, { children: [
		a.isError && /* @__PURE__ */ z(j, {
			message: a.error.message,
			onRetry: () => void a.refetch(),
			compact: !0
		}),
		a.data?.length === 0 && /* @__PURE__ */ z(O, {
			compact: !0,
			icon: "history",
			title: f("No history yet")
		}),
		/* @__PURE__ */ z("ol", {
			className: "m-0 list-none px-2 py-2",
			children: (a.data ?? []).map((t, n, r) => {
				let i = /* @__PURE__ */ B(R, { children: [/* @__PURE__ */ z("span", {
					className: "relative grid h-5 w-2 shrink-0 place-items-center",
					"aria-hidden": !0,
					children: /* @__PURE__ */ z("span", { className: P("size-2 rounded-full", t.action === "publish" ? "bg-success" : "bg-surface ring-1 ring-inset ring-border-strong") })
				}), /* @__PURE__ */ B("span", {
					className: "block min-w-0 flex-1",
					children: [/* @__PURE__ */ B("span", {
						className: "block truncate text-sm text-text",
						children: [l(t), t.title && t.title !== e.title && /* @__PURE__ */ B("span", {
							className: "text-muted",
							children: [" · ", t.title]
						})]
					}), /* @__PURE__ */ B("span", {
						className: "block truncate text-xs text-faint",
						children: [
							t.user?.name ?? f("System"),
							" · ",
							/* @__PURE__ */ z(N, {
								content: Ae(t.createdAt),
								children: /* @__PURE__ */ z("time", {
									dateTime: t.createdAt,
									children: p(t.createdAt)
								})
							})
						]
					})]
				})] });
				return /* @__PURE__ */ B("li", {
					className: "relative",
					children: [n < r.length - 1 && /* @__PURE__ */ z("span", {
						className: "absolute bottom-[-10px] left-[11.5px] top-[22px] w-px bg-border",
						"aria-hidden": !0
					}), n > 0 ? /* @__PURE__ */ z(E, {
						variant: "ghost",
						onClick: () => s(t),
						className: "!h-auto min-h-12 w-full !items-start !justify-start !gap-2.5 !whitespace-normal !rounded-md !px-2 !py-2 text-left !font-normal",
						children: i
					}) : /* @__PURE__ */ z("div", {
						className: "flex min-h-12 items-start gap-2.5 px-2 py-2",
						children: i
					})]
				}, t.id);
			})
		}),
		/* @__PURE__ */ z(Y, {
			revision: o,
			title: o ? `${l(o)} · ${Ae(o.createdAt)}` : "",
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
var J = "grid grid-cols-[minmax(96px,0.6fr)_1fr_1fr] gap-x-4 px-3 py-2";
function Y({ revision: e, title: t, working: n, fields: r, author: i, editable: a, onClose: o, onRestore: s }) {
	let c = m("revisions/get", { id: e?.id ?? "" }, { enabled: !!e }), l = e && c.data ? Be(n, c.data.snapshot, r, i) : null;
	return /* @__PURE__ */ z(D, {
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
		children: c.isError ? /* @__PURE__ */ z(j, {
			compact: !0,
			message: f("Couldn’t load this version"),
			onRetry: () => void c.refetch(),
			retrying: c.isRefetching
		}) : l ? l.length === 0 ? /* @__PURE__ */ z("p", {
			role: "status",
			className: "m-0 py-6 text-center text-sm text-muted",
			children: f("Same as now")
		}) : /* @__PURE__ */ B("div", {
			role: "table",
			className: "overflow-hidden rounded-lg border border-border",
			children: [/* @__PURE__ */ B("div", {
				role: "row",
				className: P(J, "sticky top-0 border-b border-border bg-sunken text-xs font-medium text-muted"),
				children: [
					/* @__PURE__ */ z("span", { role: "columnheader" }),
					/* @__PURE__ */ z("span", {
						role: "columnheader",
						children: f("Current")
					}),
					/* @__PURE__ */ z("span", {
						role: "columnheader",
						children: f("This Version")
					})
				]
			}), l.map((e, t) => /* @__PURE__ */ B("div", {
				role: "row",
				className: P(J, "text-sm", t > 0 && (e.label ? "border-t border-border" : "border-t border-border/50")),
				children: [/* @__PURE__ */ z("span", {
					role: "rowheader",
					className: "min-w-0 break-words text-muted",
					children: e.label
				}), e.now && e.then ? /* @__PURE__ */ B(R, { children: [/* @__PURE__ */ z("span", {
					role: "cell",
					className: "min-w-0 break-words text-text",
					children: He(e.now, e.then, "del")
				}), /* @__PURE__ */ z("span", {
					role: "cell",
					className: "min-w-0 break-words text-text",
					children: He(e.now, e.then, "add")
				})] }) : /* @__PURE__ */ B(R, { children: [/* @__PURE__ */ z("span", {
					role: "cell",
					className: P("min-w-0 break-words", e.now ? "text-danger line-through decoration-danger/40" : "text-faint"),
					children: e.now || "—"
				}), /* @__PURE__ */ z("span", {
					role: "cell",
					className: P("min-w-0 break-words", e.then ? "text-success" : "text-faint"),
					children: e.then || "—"
				})] })]
			}, t))]
		}) : /* @__PURE__ */ z("div", {
			className: "grid place-items-center py-10 text-faint",
			children: /* @__PURE__ */ z(le, {})
		})
	});
}
function He(e, t, n) {
	let r = e.split(/(\s+)/), i = t.split(/(\s+)/), a = n === "del" ? r : i, o = n === "del" ? "text-danger line-through decoration-danger/40" : "text-success";
	if (r.length * i.length > 25e4) return /* @__PURE__ */ z("span", {
		className: o,
		children: a.join("")
	});
	let s = r.length, c = i.length, l = Array.from({ length: s + 1 }, () => new Uint16Array(c + 1));
	for (let e = s - 1; e >= 0; e--) for (let t = c - 1; t >= 0; t--) l[e][t] = r[e] === i[t] ? l[e + 1][t + 1] + 1 : Math.max(l[e + 1][t], l[e][t + 1]);
	let u = /* @__PURE__ */ new Set();
	for (let e = 0, t = 0; e < s && t < c;) r[e] === i[t] ? (u.add(n === "del" ? e : t), e++, t++) : l[e + 1][t] >= l[e][t + 1] ? e++ : t++;
	return /* @__PURE__ */ z(R, { children: a.map((e, t) => u.has(t) || !e.trim() ? /* @__PURE__ */ z(y, { children: e }, t) : /* @__PURE__ */ z("span", {
		className: o,
		children: e
	}, t)) });
}
// admin/src/EntryMoveDialog.tsx
function X(e, t, n = []) {
	return e.flatMap((e) => {
		if (e.id === t) return [];
		let r = [...n, e.title || f("Untitled")];
		return [{
			value: e.id,
			label: r.join(" / ")
		}, ...X(e.children ?? [], t, r)];
	});
}
function Ue({ entry: e, collection: t, busy: n, onClose: r, onMove: i }) {
	let a = m("entries/tree", {
		collection: t.handle,
		locale: e.locale
	}, { refetchOnWindowFocus: !1 }), [o, s] = w(e.parentId), [c, l] = w(null), [u, d] = w(!1), p = C(!1), h = [{
		value: "",
		label: f("Root")
	}, ...X(a.data ?? [], e.id)], g = o === null || h.some((e) => e.value === o), _ = !!a.data && !a.isError, v = n || u, y = c ?? (_ && !g ? f("This parent is no longer available. Choose another parent.") : void 0);
	return /* @__PURE__ */ B(D, {
		open: !0,
		title: f("Move “{title}”", { title: e.title }),
		onOpenChange: (e) => {
			!e && !v && r();
		},
		footer: /* @__PURE__ */ B(R, { children: [/* @__PURE__ */ z(E, {
			disabled: v,
			onClick: r,
			children: f("Cancel")
		}), /* @__PURE__ */ z(E, {
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
		children: [a.isLoading || !a.data && a.isFetching ? /* @__PURE__ */ B("div", {
			role: "status",
			className: "flex items-center gap-2 py-4 text-sm text-muted",
			children: [/* @__PURE__ */ z(le, { size: 14 }), f("Loading available parents…")]
		}) : /* @__PURE__ */ B(R, { children: [a.isError && /* @__PURE__ */ z(j, {
			message: a.error.message,
			onRetry: () => void a.refetch()
		}), a.data && /* @__PURE__ */ z(k, {
			fields: [{
				handle: "parentId",
				type: "select",
				label: f("Parent"),
				required: !0,
				options: g ? h : [...h, {
					value: o,
					label: f("Unavailable parent")
				}]
			}],
			values: { parentId: o ?? "" },
			onChange: (e, t) => {
				s(t || null), l(null);
			},
			errors: y ? { parentId: y } : {},
			disabled: v || a.isError
		})] }), /* @__PURE__ */ B("div", {
			className: "mt-4 space-y-2 text-xs text-muted",
			children: [e.uri && /* @__PURE__ */ z("p", {
				className: "m-0",
				children: f("Moving a published entry can change its live URL and the URLs of its descendants.")
			}), /* @__PURE__ */ z("p", {
				className: "m-0",
				children: f("Saved unpublished changes stay in the working copy. Moving does not publish them.")
			})]
		})]
	});
}
// admin/src/EntryEditor.tsx
function We({ params: t }) {
	let { collection: n, summary: r, isLoading: i, error: o } = Ce(t.collection), l = t.id === "new", u = Ke(t.id, l), d = _(), { query: p } = g(), m = l ? n?.resolvedBlueprints?.some((e) => e.handle === p.blueprint) ? p.blueprint : null : u.data?.blueprint ?? null, h = l && !!n?.resolvedBlueprints?.length && p.blueprint === void 0, v = u.data?.sharedFields, y = Object.entries(u.data?.translations ?? {}).find(([, e]) => e === u.data?.originId)?.[0] ?? d.site.defaultLocale, b = S(() => {
		let e = n && V(n, m);
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
	]), x = Ge(d, t.collection, u.data?.locale ?? p.locale), C = () => {
		u.refetch(), a("collections/get");
	}, w = b?.resolvedFields.find((e) => e.body), T = !!w && c("entry.editor", { bodyField: w }).length > 0 && /* @__PURE__ */ z(M, {
		title: f("Outline||structure"),
		backTo: x.path,
		backLabel: x.label,
		children: null
	});
	if (i || !l && u.isLoading) return /* @__PURE__ */ B("div", {
		className: "flex h-full flex-col",
		children: [
			T,
			/* @__PURE__ */ z(fe, { back: {
				to: x.path,
				label: x.label
			} }),
			/* @__PURE__ */ z("div", {
				className: "grid flex-1 place-items-center",
				children: /* @__PURE__ */ z(le, {})
			})
		]
	});
	let D = o ?? u.error, O = !b || !l && !u.data, k = d.collections.find((e) => e.handle === (x.within?.handle ?? t.collection)), ee = [...k ? [{
		label: k.title,
		to: x.path,
		icon: k.icon
	}] : [], { label: f("Not Found") }];
	if (O && D && ![
		"not_found",
		"forbidden",
		"invalid_input"
	].includes(D.type)) return /* @__PURE__ */ z(ae, {
		crumbs: k ? ee.slice(0, 1) : [],
		children: /* @__PURE__ */ z(j, {
			message: D.message,
			onRetry: C
		})
	});
	if (!b || !r || !l && !u.data) {
		let e = k && /* @__PURE__ */ z(E, {
			onClick: () => s(x.path),
			children: f("Back to {label}", { label: k.title })
		});
		return /* @__PURE__ */ z(ae, {
			crumbs: ee,
			children: D?.type === "forbidden" ? /* @__PURE__ */ B(R, { children: [/* @__PURE__ */ z(j, {
				title: f("Access denied"),
				message: D.message
			}), e && /* @__PURE__ */ z("div", {
				className: "mt-4",
				children: e
			})] }) : /* @__PURE__ */ z(A, {
				icon: k?.icon ?? "file",
				action: e
			})
		});
	}
	return h ? /* @__PURE__ */ B(R, { children: [/* @__PURE__ */ z(fe, { back: {
		to: x.path,
		label: x.label
	} }), /* @__PURE__ */ z(e, {
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
		close: () => s(x.path),
		disabled: !1,
		onAction: () => {},
		scope: {}
	})] }) : /* @__PURE__ */ B(R, { children: [T, /* @__PURE__ */ z(qe, {
		collection: b,
		blueprint: m,
		initial: l ? null : u.data,
		can: r.can
	}, `${t.collection}:${t.id}:${m ?? ""}`)] });
}
function Ge(e, t, n) {
	let r = e.collections.find((e) => e.handle === t), i = e.collections.find((e) => e.handle === r?.within), a = i ?? r, o = n && n !== e.site.defaultLocale && e.site.locales.includes(n) ? `?locale=${n}` : "";
	return {
		path: `/content/${a?.handle ?? t}${o}`,
		label: a?.title ?? "",
		within: i
	};
}
function Ke(e, t) {
	return m("entries/get", { id: e }, {
		enabled: !t,
		refetchOnWindowFocus: !1
	});
}
function qe({ collection: e, blueprint: t, initial: n, can: r }) {
	let o = _(), { query: l } = g(), p = h("content").autosave ?? 1200, m = n?.locale ?? (o.site.locales.includes(l.locale ?? "") ? l.locale : o.site.defaultLocale), y = Ge(o, e.handle, m), D = y.path, A = y.within?.singular ?? o.collections.find((t) => t.handle === e.handle)?.singular ?? e.singular, ae = S(() => ({
		...e,
		singular: A
	}), [e, A]), [se, j] = w(!1), M = Te(n, {
		title: n?.title ?? "",
		slug: n?.slug ?? "",
		authorId: n ? n.authorId : o.user.id,
		data: n?.data ?? Object.fromEntries(e.resolvedFields.map((e) => [e.handle, e.default ?? null]))
	}, e.handle, m, p, r, se, t), _e = M.editable, { entry: F, working: I, dirty: L, phase: Se, errors: V, conflict: Ce, update: H, session: U } = M, we = !!_().collections.find((t) => t.handle === e.handle)?.within, W = {
		...he(r, F),
		...we ? { duplicate: !1 } : {}
	}, De = xe(), [G, K] = w(() => De), [Ae, je] = w(null), [Me, q] = w(!1), Ne = `cms.entry.panel.${e.handle}`, [Pe, Fe] = w(() => localStorage.getItem(Ne) || "details"), [Ie, Le] = w(!1), [Re, ze] = w(!1), [Be, J] = w(!1), Y = C(() => M.save()), He = C({});
	T(u.panels.subscribe, u.panels.version);
	let X = Se === "saving";
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
			_e && e.dirty && e.working.title.trim() && await M.save().catch(() => {});
		}
	}), x(() => i.on("content.changed", () => {
		let e = U.get().entry?.id;
		e && d("entries/get", { id: e }).then((e) => {
			let t = U.get();
			t.dirty || t.phase === "saving" || e.version === t.entry?.version || U.command(async () => e);
		}).catch(() => {});
	}), [U]);
	let We = (e, t) => {
		H({ data: {
			...U.get().working.data,
			[e]: t
		} });
	}, Ke = async (e) => {
		try {
			return await e();
		} catch (e) {
			ye.error(e);
			return;
		}
	}, qe = async (e = {}) => {
		He.current = e, Y.current = () => M.save(e);
		try {
			return await M.save(e);
		} catch {
			return;
		}
	}, $e = async () => {
		He.current = {}, Y.current = () => M.save(), await M.save();
	}, et = async (e, t) => {
		if (!W.publish) return !1;
		q(!0);
		let n = await qe({
			publish: !0,
			...e ? { at: e } : {},
			...t === void 0 ? {} : { expiresAt: t }
		});
		return q(!1), n ? (ye.success(n.displayStatus === "scheduled" ? f("Scheduled") : f("Published")), !0) : !1;
	}, tt = () => !U.get().dirty || pe({
		title: f("Discard unsaved changes?"),
		description: f("Your unsaved edits will be replaced."),
		confirm: f("Discard changes"),
		danger: !0
	}), nt = async () => {
		await tt() && (M.cancel(), J(!0), Y.current = nt, await Ke(() => U.command((e) => d("entries/get", { id: e.id }))), J(!1));
	}, rt = async (e, t = {}) => {
		await tt() && (M.cancel(), J(!0), Y.current = () => rt(e, t), await Ke(() => U.command((n) => d(e, {
			...e === "revisions/restore" ? {} : { id: n.id },
			...t,
			expectedVersion: n.version
		}))), J(!1), a("entries/", "revisions/", "content/"));
	}, it = async () => {
		F && await pe({
			title: f("Discard unpublished changes to “{title}”?", { title: F.title }),
			description: f("Every change since it was last published is lost. The published version stays as it is."),
			confirm: f("Discard Changes"),
			danger: !0
		}) && await rt("entries/discard-draft");
	}, at = async () => {
		F && await pe({
			title: f("Unpublish “{title}”?", { title: F.title }),
			description: f("It leaves the site and its address stops working until it is published again. Its content is kept as a draft."),
			confirm: f("Unpublish"),
			danger: !0
		}) && await rt("entries/unpublish");
	}, ot = async () => {
		F && W.delete && await pe({
			title: f("Delete “{title}”?", { title: F.title }),
			description: f("This permanently deletes the entry and its history."),
			confirm: f("Delete"),
			danger: !0
		}) && (M.cancel(), Y.current = ot, await Ke(async () => {
			await U.command(async (e) => (await d("entries/delete", {
				id: e.id,
				expectedVersion: e.version
			}), e)), U.reset(), a("entries/", "revisions/", "content/"), s(D);
		}));
	}, st = async () => {
		let t = U.get(), n = t.entry;
		W.duplicate && n && !t.dirty && t.phase !== "saving" && await Ke(async () => {
			let t = await d("entries/duplicate", {
				id: n.id,
				expectedVersion: n.version
			});
			s(`/content/${e.handle}/${t.id}`);
		});
	}, ct = async (e) => {
		if (!W.move) return !1;
		M.cancel(), J(!0), Y.current = () => ct(e);
		try {
			if (U.get().dirty && !await M.save()) return !1;
			let t = await U.command((t) => d("entries/move", {
				id: t.id,
				parentId: e,
				expectedVersion: t.version
			}));
			return a("entries/", "revisions/", "content/"), !!t;
		} catch (e) {
			return ye.error(e), !1;
		} finally {
			J(!1);
		}
	}, lt = async () => {
		F && Ce && await Ke(async () => {
			let e = Ce.version ?? (await d("entries/get", { id: F.id })).version;
			await qe({
				...He.current,
				expectedVersion: e
			});
		});
	}, Z = {
		entry: F,
		collection: ae,
		content: I,
		values: I.data,
		title: I.title,
		setValue: We,
		save: $e,
		reload: nt,
		editable: _e && !Be,
		can: r,
		errors: V,
		hold: j
	}, ut = c("entry.toolbar", Z), dt = c("entry.notice", Z);
	T(u.entryActions.subscribe, u.entryActions.version);
	let ft = u.entryActions.all().filter((e) => e.when?.(Z) ?? !0).sort((e, t) => (e.order ?? 50) - (t.order ?? 50)), pt = c("entry.sidebar", Z), mt = c("entry.body", Z), Q = e.resolvedFields.find((e) => e.body), ht = Q?.handle, $ = Ee(e.resolvedFields, ht, [...pt, ...mt]), gt = [
		{
			value: "details",
			label: A,
			icon: e.icon || "file"
		},
		{
			value: "history",
			label: f("History"),
			icon: "history"
		},
		...pt.map((e) => ({
			value: e.id,
			label: e.label ?? e.id,
			icon: e.icon
		}))
	], _t = gt.some((e) => e.value === Pe) ? Pe : "details", vt = (e) => {
		Fe(e), localStorage.setItem(Ne, e);
	}, yt = () => {
		G || vt("details"), K(!G);
	}, bt = $.document.filter((e) => !Ze.includes(e.type)), xt = $.document.filter((e) => Ze.includes(e.type)), St = {
		entry: F ?? void 0,
		collection: e.handle,
		blueprint: e.blueprint,
		locale: m
	}, Ct = /* @__PURE__ */ B("div", {
		className: "flex h-full min-h-0 flex-col",
		children: [/* @__PURE__ */ z(oe, {
			onClose: () => K(!1),
			children: /* @__PURE__ */ z(de, {
				id: "entry-sidebar",
				value: _t,
				onChange: vt,
				tabs: gt,
				bordered: !1,
				fit: !0,
				className: "h-full min-w-0 flex-1"
			})
		}), /* @__PURE__ */ z("div", {
			role: "tabpanel",
			id: `entry-sidebar-${_t}-panel`,
			"aria-labelledby": `entry-sidebar-${_t}`,
			className: "min-h-0 flex-1 overflow-y-auto",
			children: _t === "details" ? /* @__PURE__ */ z(Oe, {
				props: Z,
				working: I,
				fields: Q?.type === "blocks" ? [...$.document, ...$.sidebar] : $.sidebar,
				titleInDetails: Q?.type === "blocks",
				update: H
			}) : _t === "history" ? /* @__PURE__ */ z(Ve, {
				entry: F,
				working: I,
				fields: e.resolvedFields,
				editable: W.restore && !X,
				onRestore: async (e) => {
					W.restore && await rt("revisions/restore", { revisionId: e });
				}
			}) : pt.filter((e) => e.id === _t).map((e) => /* @__PURE__ */ z(e.component, { ...Z }, e.id))
		})]
	}), wt = /* @__PURE__ */ B(R, { children: [/* @__PURE__ */ z(k, {
		bare: !0,
		fields: [{
			handle: "title",
			type: "text",
			label: f("Title"),
			component: "title",
			placeholder: f("Untitled"),
			autofocus: !F,
			onEnter: () => {
				qe(), Ye();
			},
			onDown: Ye
		}],
		values: { title: I.title },
		onChange: (e, t) => H({ title: t ?? "" }),
		errors: V,
		disabled: !Z.editable
	}), (bt.length > 0 || xt.length > 0) && /* @__PURE__ */ B(Xe, {
		collection: e.handle,
		count: bt.length + xt.length,
		children: [bt.map((e) => /* @__PURE__ */ z(Qe, {
			field: e,
			value: I.data[e.handle],
			onChange: (t) => We(e.handle, t),
			error: V[e.handle],
			disabled: !Z.editable,
			context: St,
			values: I.data
		}, e.handle)), xt.length > 0 && /* @__PURE__ */ z(k, {
			fields: xt,
			values: I.data,
			onChange: We,
			errors: V,
			disabled: !Z.editable,
			context: St,
			className: "mt-4 !gap-y-4"
		})]
	})] }), Tt = Q ? {
		...Z,
		footer: /* @__PURE__ */ z(R, { children: mt.map((e) => /* @__PURE__ */ z(e.component, { ...Z }, e.id)) }),
		bodyField: Q,
		setTitle: (e) => H({ title: e }),
		sidebar: Ct,
		sidebarOpen: G,
		setSidebarOpen: K,
		toolbar: Ae,
		listPath: D,
		listLabel: y.label
	} : null, Et = Tt ? c("entry.editor", Tt)[0] : null, Dt = F?.displayStatus ?? "draft", Ot = F?.status === "published" && Dt !== "scheduled" && Dt !== "expired", kt = Ot && !L && !F?.hasDraft, At = !F && L && !I.title.trim(), jt = I.title || f("Untitled"), Mt = Se === "error" ? f("Couldn’t save") : At ? f("Add a title to save") : X ? f("Saving…") : L ? f("Unsaved") : F ? f("Saved") : "", Nt = /* @__PURE__ */ z(N, {
		content: Mt,
		children: /* @__PURE__ */ z("span", {
			"aria-hidden": "true",
			className: P("block size-1.5 rounded-full", Se === "error" || At ? "bg-danger" : X || L ? "bg-faint" : "bg-transparent")
		})
	}), Pt = Se === "error" || At, Ft = /* @__PURE__ */ B("span", {
		className: "flex min-w-0 items-center gap-1.5",
		children: [
			/* @__PURE__ */ z("span", {
				className: "truncate",
				children: jt
			}),
			Nt,
			Pt && /* @__PURE__ */ z("span", {
				className: "shrink-0 text-xs font-normal text-danger",
				children: Mt
			})
		]
	});
	return be("mod+s", () => {
		_e && qe();
	}, !0, _e ? f("Save") : void 0), be("mod+shift+p", () => {
		W.publish && !se && !kt && I.title.trim() && et();
	}, !0, W.publish && !se ? f("Publish") : void 0), be("mod+.", yt, !0, f("{name} Details", { name: A })), x(() => {
		let t = Object.keys(V)[0];
		if (!t) return;
		let n = t.replace(/^data\./, "").split("."), r = n[0], i = $.claimed.get(r);
		(i || Q?.type === "blocks" && (r === "title" || $.document.some((e) => e.handle === r)) || r === "authorId" || r === "slug" || $.sidebar.some((e) => e.handle === r)) && (K(!0), vt(i ?? "details")), $.document.some((e) => e.handle === r) && (localStorage.setItem(`cms.properties.${e.handle}`, "open"), window.dispatchEvent(new Event("cms.fields.reveal"))), requestAnimationFrame(() => {
			let e = document.getElementById(ge({ handle: n.at(-1) }, n.slice(0, -1))) ?? document.getElementById(`f-${r}`) ?? document.querySelector(`[data-field="${CSS.escape(r)}"] input, [data-field="${CSS.escape(r)}"] textarea, [data-field="${CSS.escape(r)}"] button`);
			e?.scrollIntoView({ block: "center" }), e?.focus();
		});
	}, [V]), /* @__PURE__ */ B("div", {
		className: "relative flex h-full flex-col",
		children: [
			/* @__PURE__ */ z(fe, {
				className: "max-sm:[&_[data-workspace-toggle]]:hidden",
				back: {
					to: D,
					label: y.label
				},
				title: Ft,
				children: /* @__PURE__ */ B(R, { children: [/* @__PURE__ */ z("span", {
					className: "min-w-0 text-sm font-medium text-ink max-sm:hidden lg:hidden",
					children: Ft
				}), Et && /* @__PURE__ */ z("div", {
					ref: je,
					className: "flex shrink-0 items-center gap-0.5 empty:hidden"
				})] }),
				actions: /* @__PURE__ */ B(R, { children: [
					/* @__PURE__ */ z("span", {
						role: "status",
						className: "sr-only",
						children: Mt
					}),
					ut.map((e) => /* @__PURE__ */ z(e.component, { ...Z }, e.id)),
					/* @__PURE__ */ z(N, {
						content: f("{name} Details", { name: A }),
						shortcut: "mod+.",
						children: /* @__PURE__ */ z(te, {
							icon: "sidebar",
							label: f("{name} Details", { name: A }),
							title: void 0,
							active: G,
							onClick: yt,
							className: "[&_svg]:-scale-x-100"
						})
					}),
					W.publish ? kt ? /* @__PURE__ */ z(re, {
						trigger: /* @__PURE__ */ B(E, {
							variant: "ghost",
							className: "!gap-1 !px-1.5 !font-normal",
							children: [/* @__PURE__ */ z(ue, {
								status: Dt,
								label: ve(Dt),
								className: "text-sm"
							}), /* @__PURE__ */ z(ee, {
								name: "chevron-down",
								size: 12,
								className: "shrink-0 text-faint"
							})]
						}),
						items: [{
							label: f("Publication Date…"),
							icon: "calendar",
							onSelect: () => Le(!0)
						}, F && W.unpublish && {
							label: f("Unpublish"),
							icon: "eye-off",
							onSelect: () => {
								at();
							}
						}]
					}) : /* @__PURE__ */ B(E, {
						variant: "publish",
						disabled: !I.title.trim() || se,
						loading: Me,
						onClick: () => {
							et();
						},
						children: [/* @__PURE__ */ z("span", {
							className: "max-sm:hidden",
							children: f(Dt === "scheduled" ? "Publish Now" : Ot ? "Publish Changes" : "Publish")
						}), /* @__PURE__ */ z("span", {
							className: "sm:hidden",
							children: f("Publish")
						})]
					}) : _e && /* @__PURE__ */ z(E, {
						variant: "primary",
						disabled: !L || X,
						loading: X,
						onClick: () => {
							qe();
						},
						children: f("Save Draft")
					}),
					/* @__PURE__ */ z(re, {
						trigger: /* @__PURE__ */ z(te, {
							icon: "more",
							label: f("More Actions")
						}),
						items: [
							...ft.map((e) => ({
								label: e.label,
								icon: e.icon,
								onSelect: () => e.perform(Z)
							})),
							F && Ot && F.uri && !F.hasDraft ? {
								label: f("View on Site"),
								icon: "external",
								onSelect: () => {
									window.open(F.uri, "_blank", "noopener");
								}
							} : null,
							W.publish && !kt && {
								label: f(Dt === "scheduled" ? "Change Schedule" : Ot ? "Publication Date…" : "Schedule…"),
								icon: "calendar",
								onSelect: () => Le(!0)
							},
							F && W.move && e.structure === "tree" && {
								label: f("Move…"),
								icon: "arrow-right",
								onSelect: () => ze(!0)
							},
							F && W.duplicate && {
								label: f("Duplicate"),
								icon: "copy",
								disabled: X || L,
								description: X || L ? f("Save changes before duplicating") : void 0,
								onSelect: () => {
									st();
								}
							},
							F && W.discard && F.hasDraft && {
								label: f("Discard Unpublished Changes"),
								icon: "undo",
								onSelect: () => {
									it();
								}
							},
							F && W.unpublish && !(W.publish && kt) && {
								label: f("Unpublish"),
								icon: "eye-off",
								onSelect: () => {
									at();
								}
							},
							F && {
								label: f("Copy ID"),
								icon: "hash",
								onSelect: () => void me(F.id, { copied: f("ID copied") })
							},
							F && W.delete && {
								separator: !0,
								label: ""
							},
							F && W.delete && {
								label: f("Delete"),
								icon: "trash",
								danger: !0,
								onSelect: ot
							}
						]
					})
				] })
			}),
			/* @__PURE__ */ B("div", {
				className: "flex h-8 shrink-0 items-center gap-3 border-b border-border px-4 sm:hidden",
				children: [/* @__PURE__ */ z("span", {
					className: "min-w-0 flex-1 truncate text-sm font-medium text-ink",
					children: jt
				}), /* @__PURE__ */ z("span", {
					"aria-hidden": "true",
					className: P("shrink-0 text-xs", Pt ? "text-danger" : "text-faint"),
					children: Mt
				})]
			}),
			$.error && /* @__PURE__ */ z(ie, {
				tone: "danger",
				className: "m-3",
				children: $.error
			}),
			dt.map((e) => /* @__PURE__ */ z(e.component, { ...Z }, e.id)),
			Et && Tt ? /* @__PURE__ */ z("div", {
				className: "min-h-0 flex-1",
				children: /* @__PURE__ */ z(b, {
					fallback: /* @__PURE__ */ z("div", {
						className: "grid h-full place-items-center",
						children: /* @__PURE__ */ z(le, {})
					}),
					children: /* @__PURE__ */ z(Et.component, { ...Tt })
				})
			}) : /* @__PURE__ */ B("div", {
				className: "flex min-h-0 flex-1",
				children: [/* @__PURE__ */ z("div", {
					className: "min-w-0 flex-1 overflow-y-auto",
					children: /* @__PURE__ */ B("article", {
						className: "mx-auto w-full max-w-[784px] px-6 pb-24 pt-12 md:px-8 md:pt-16",
						children: [
							wt,
							Q?.type === "blocks" ? /* @__PURE__ */ z(O, {
								icon: "blocks",
								title: f("Block editor unavailable")
							}) : Q && /* @__PURE__ */ B("div", {
								className: "mt-8",
								"data-cms-body": !0,
								children: [typeof Q.shared == "string" && /* @__PURE__ */ z(ce, {
									from: Q.shared,
									className: "mb-2"
								}), /* @__PURE__ */ z(k, {
									bare: !0,
									fields: [Q],
									values: I.data,
									onChange: We,
									errors: V,
									disabled: !Z.editable,
									context: {
										...St,
										title: I.title
									}
								})]
							}),
							mt.map((e) => /* @__PURE__ */ z(e.component, { ...Z }, e.id))
						]
					})
				}), /* @__PURE__ */ z(ne, {
					open: G,
					onOpenChange: K,
					title: A,
					children: Ct
				})]
			}),
			Ie && /* @__PURE__ */ z(ke, {
				entry: F,
				changes: L || !!F?.hasDraft,
				busy: X,
				onClose: () => Le(!1),
				onPublish: (e, t) => et(e, t)
			}),
			Re && F && /* @__PURE__ */ z(Ue, {
				entry: F,
				collection: ae,
				busy: X || Be,
				onClose: () => ze(!1),
				onMove: ct
			}),
			M.error && Se === "error" && /* @__PURE__ */ z(Je, {
				error: M.error,
				conflict: !!Ce,
				dirty: L,
				onReload: nt,
				onKeepMine: lt,
				onRetry: () => {
					Y.current().catch(() => {});
				}
			})
		]
	});
}
function Je({ error: e, conflict: n, dirty: r, onReload: i, onKeepMine: a, onRetry: o }) {
	let s = e instanceof t && e.status > 0, c = n ? e.message : s && e.type === "invalid_input" ? f("Couldn’t save. Check the highlighted fields.") : s ? f("Couldn’t save. {reason}", { reason: e.message }) : f("Couldn’t save. Check your connection.");
	return /* @__PURE__ */ z("div", {
		className: "pointer-events-none absolute inset-x-0 top-14 z-sticky flex justify-center px-4 max-sm:top-[5.5rem]",
		children: /* @__PURE__ */ B("div", {
			role: "alert",
			className: "pointer-events-auto flex min-h-10 max-w-[560px] items-center gap-2.5 rounded-lg border border-border-float bg-float py-1.5 pl-3 pr-1.5 text-sm text-text shadow-pop",
			children: [
				/* @__PURE__ */ z(ee, {
					name: "warning",
					size: 16,
					className: "shrink-0 text-danger"
				}),
				/* @__PURE__ */ z("span", {
					className: "min-w-0 flex-1",
					children: c
				}),
				n ? /* @__PURE__ */ B(R, { children: [/* @__PURE__ */ z(E, {
					size: "xs",
					variant: "ghost",
					onClick: i,
					children: f("Load Their Version")
				}), r && /* @__PURE__ */ z(E, {
					size: "xs",
					variant: "ghost",
					onClick: a,
					children: f("Keep Mine")
				})] }) : e.type !== "invalid_input" && /* @__PURE__ */ z(E, {
					size: "xs",
					variant: "ghost",
					onClick: o,
					children: f("Try Again")
				})
			]
		})
	});
}
function Ye() {
	(document.querySelector("[data-cms-body] [contenteditable=\"true\"], [data-cms-body] textarea, [data-cms-body] input") ?? document.querySelector("[data-cms-fields] input, [data-cms-fields] textarea"))?.focus();
}
function Xe({ collection: e, count: t, children: n }) {
	let r = `cms.properties.${e}`, [i, a] = w(() => localStorage.getItem(r) !== "closed");
	return x(() => {
		let e = () => a(!0);
		return window.addEventListener("cms.fields.reveal", e), () => window.removeEventListener("cms.fields.reveal", e);
	}, []), /* @__PURE__ */ B("div", {
		className: "mt-6",
		"data-cms-fields": i ? "" : void 0,
		children: [i && /* @__PURE__ */ z("div", {
			className: "space-y-px",
			children: n
		}), /* @__PURE__ */ B(E, {
			variant: "ghost",
			onClick: () => {
				localStorage.setItem(r, i ? "closed" : "open"), a(!i);
			},
			"aria-expanded": i,
			className: "-ml-1.5 mt-2 !gap-1.5 !rounded-xs !px-1.5 !text-xs !font-normal !text-faint hover:!text-muted",
			children: [/* @__PURE__ */ z(ee, {
				name: i ? "chevron-up" : "chevron-down",
				size: 12
			}), i ? f("Hide Properties") : l(t, "{count} property", "{count} properties")]
		})]
	});
}
var Ze = [
	"repeater",
	"blocks",
	"richtext",
	"markdown",
	"json",
	"group",
	"code",
	"fields"
];
function Qe({ field: e, value: t, onChange: n, error: r, disabled: i, context: a, values: o }) {
	return /* @__PURE__ */ B("div", {
		className: "grid grid-cols-[148px_minmax(0,1fr)] items-start gap-3 py-0.5",
		children: [/* @__PURE__ */ B("div", {
			className: "flex h-8 min-w-0 items-center gap-1.5 text-sm text-muted",
			children: [/* @__PURE__ */ z(N, {
				content: e.instructions ?? e.label,
				children: /* @__PURE__ */ z("span", {
					className: "truncate",
					children: e.label
				})
			}), typeof e.shared == "string" && /* @__PURE__ */ z(ce, { from: e.shared })]
		}), /* @__PURE__ */ z("div", {
			className: "min-w-0",
			children: /* @__PURE__ */ z(k, {
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
export { We as default };
