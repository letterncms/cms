import e from "./NewEntry-DHnzMbmA.js";
import { CmsError as t, blockNavigation as n, can as r, events as i, invalidate as a, locale as o, navigate as s, panelsFor as c, plural as l, registry as u, run as d, t as f, timeAgo as p, useAbility as m, useConfig as h, useLocation as g, useManifest as _, useScreenContext as v } from "@letterncms/sdk";
import { Fragment as y, Suspense as b, useEffect as x, useMemo as ee, useRef as S, useState as C, useSyncExternalStore as w } from "react";
import { Button as T, Dialog as E, EmptyState as te, Fields as D, Icon as O, IconButton as ne, InspectorPanel as re, Menu as ie, NotFoundState as k, Notice as ae, Page as oe, PanelHeader as se, PersonPicker as ce, QueryError as A, ScreenSidebar as j, SharedMark as le, Spinner as ue, StatusDot as de, Tabs as fe, Tooltip as M, Topbar as pe, cn as N, confirm as me, copyText as he, entryActionAvailability as ge, fieldControlId as _e, fieldVisible as ve, nativeName as P, settledValues as F, slugify as I, statusLabel as ye, toast as be, useShortcut as xe, useWideInspector as Se, wideFieldTypes as Ce } from "@letterncms/ui";
import { Fragment as L, jsx as R, jsxs as z } from "react/jsx-runtime";
// admin/src/useCollection.ts
function B(e, t) {
	let n = t ? e.resolvedBlueprints?.find((e) => e.handle === t) : void 0;
	return n ? {
		...e,
		resolvedFields: n.resolvedFields,
		blueprint: n.handle
	} : e;
}
function we(e) {
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
}), H = (e) => Object.fromEntries(Object.entries(e).map(([e, t]) => [e.replace(/^data\./, ""), t])), Te = (e, t) => e.title === t.title && e.slug === t.slug && e.authorId === t.authorId && JSON.stringify(e.data) === JSON.stringify(t.data), U = class {
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
		}, n = !this.state.entry || !Te(t, V(this.state.entry));
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
			errors: t.type === "invalid_input" ? H(t.details ?? {}) : {},
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
function Ee(e, t, r, i, o, s, c = !1, l = null) {
	let u = S(!0), p = S(window.location.pathname);
	x(() => (u.current = !0, () => {
		u.current = !1;
	}), []);
	let [m] = C(() => new U(e, t, async (e, t, n) => {
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
function De(e, t, n) {
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
function Oe(e, t, n) {
	return t?.uri ? t.uri === "/" ? "/" : t.uri.replace(/[^/]+$/, n || t.slug) : (e.route ?? "/{slug}").replace("{parent_uri}/", "").replace("{slug}", n || "…").replace(/\{[a-z_]+\}/g, "…").replace(/\/+/g, "/");
}
function ke({ props: e, working: t, fields: n, titleInDetails: i, update: a }) {
	let { entry: s, collection: c, editable: l, errors: u } = e, d = _(), p = d.collections.find((e) => e.handle === c.handle), h = c.system === !0, g = r("collections.manage"), v = m("entries/get-many", { ids: s?.parentId ? [s.parentId] : [] }, { enabled: g && !!s?.parentId }), y = !!p?.within, b = p?.type === "global", x = m("pages/builtin", {}, { enabled: y }), ee = x.data?.find((e) => e.collection === c.handle)?.pages.find((e) => e.handle === (s?.slug ?? t.slug)), S = (e) => new Intl.DateTimeFormat(o(), {
		dateStyle: "medium",
		timeStyle: "short",
		timeZone: d.site.timezone
	}).format(new Date(e)), C = (e) => e.section === "sidebar" ? "main" : e.section ?? "main", w = F(n, t.data), T = n.filter((e) => ve(e, w)), E = T.filter((e) => C(e) === "main"), te = [...new Set(T.map(C))].filter((e) => e !== "main").map((e) => {
		let t = T.filter((t) => C(t) === e), n = e.replace(/[_-]/g, " ").replace(/\b\w/g, (e) => e.toUpperCase());
		return {
			group: e,
			inside: t,
			heading: t.length === 1 && t[0].label?.toLowerCase() === n.toLowerCase() ? null : n
		};
	}), O = s?.displayStatus ?? "draft", ne = {
		entry: s ?? void 0,
		collection: c.handle,
		locale: s?.locale ?? d.site.defaultLocale
	}, re = [
		...!h || c.route || p?.within ? [[f("Status"), /* @__PURE__ */ R(de, {
			status: O,
			label: ye(O),
			className: "text-text"
		}, "status")]] : [],
		...s?.publishedAt && O !== "draft" ? [[f(O === "scheduled" ? "Goes Live" : "Published"), /* @__PURE__ */ R(M, {
			content: d.site.timezone,
			children: /* @__PURE__ */ R("time", {
				dateTime: s.publishedAt,
				children: S(s.publishedAt)
			})
		}, "published")]] : [],
		...s?.expiresAt && O !== "draft" ? [[f(O === "expired" ? "Ended" : "Ends"), /* @__PURE__ */ R(M, {
			content: d.site.timezone,
			children: /* @__PURE__ */ R("time", {
				dateTime: s.expiresAt,
				children: S(s.expiresAt)
			})
		}, "ends")]] : [],
		...g ? [
			...s && c.structure === "tree" ? [[f("Parent"), s.parentId ? v.data?.[0]?.title ?? (v.isLoading ? f("Loading…") : "") : f("None")]] : [],
			...p?.within ? [] : [[f("Collection"), c.title]],
			...d.site.locales.length > 1 ? [[f("Language"), P(s?.locale ?? d.site.defaultLocale)]] : [],
			...s?.createdAt ? [[f("Created"), S(s.createdAt)]] : [],
			...s?.updatedAt ? [[f("Updated"), S(s.updatedAt)]] : []
		] : []
	], ie = (t) => /* @__PURE__ */ R(G, {
		field: t,
		error: u[t.handle],
		children: /* @__PURE__ */ R(D, {
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
			context: ne
		})
	}, t.handle);
	return /* @__PURE__ */ z("div", { children: [
		/* @__PURE__ */ z(W, { children: [
			i && /* @__PURE__ */ R(G, {
				field: {
					handle: "title",
					type: "text",
					label: f("Title")
				},
				error: u.title,
				children: /* @__PURE__ */ R(D, {
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
			y ? /* @__PURE__ */ z("div", {
				className: "flex min-h-7 items-start gap-2",
				children: [/* @__PURE__ */ R("span", {
					className: "flex h-7 w-[88px] shrink-0 items-center text-xs text-muted",
					children: f("URL")
				}), /* @__PURE__ */ R("span", {
					className: "flex h-7 min-w-0 flex-1 items-center",
					children: ee?.path ? /* @__PURE__ */ R(M, {
						content: ee.path,
						children: /* @__PURE__ */ R("span", {
							className: "truncate px-1 font-mono text-xs text-faint",
							children: ee.path
						})
					}) : /* @__PURE__ */ R("span", {
						className: "truncate px-1 text-xs text-faint",
						children: x.isLoading ? "…" : f("Shown inside other pages")
					})
				})]
			}) : !b && /* @__PURE__ */ R(G, {
				field: {
					handle: "slug",
					type: "text",
					label: c.route ? f("URL") : f("Handle")
				},
				error: u.slug,
				children: /* @__PURE__ */ R(D, {
					bare: !0,
					fields: [c.route ? {
						handle: "slug",
						type: "slug",
						label: f("URL"),
						component: "uri",
						uri: Oe(c, s, t.slug),
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
						slug: t.slug || I(t.title)
					},
					onChange: (e, t) => a({ [e]: t ?? "" }),
					errors: u,
					disabled: !l
				})
			}),
			!h && !b && /* @__PURE__ */ R(G, {
				field: {
					handle: "authorId",
					type: "person",
					label: f("Author")
				},
				error: u.authorId,
				children: /* @__PURE__ */ R(ce, {
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
			E.map(ie)
		] }),
		te.map(({ group: e, inside: t, heading: n }) => /* @__PURE__ */ R(W, {
			title: n,
			children: t.map(ie)
		}, e)),
		re.length > 0 && /* @__PURE__ */ z(W, {
			title: f("Info"),
			children: [/* @__PURE__ */ R("dl", {
				className: "m-0 space-y-1",
				children: re.map(([e, t]) => /* @__PURE__ */ z("div", {
					className: "flex min-h-7 items-start gap-2",
					children: [/* @__PURE__ */ R("dt", {
						className: "flex h-7 w-[88px] shrink-0 items-center truncate text-xs text-muted",
						children: e
					}), /* @__PURE__ */ R("dd", {
						className: "m-0 min-w-0 flex-1 break-words py-1 text-sm text-text",
						children: t
					})]
				}, e))
			}), s?.parentId && v.isError && /* @__PURE__ */ R(A, {
				message: v.error.message,
				onRetry: () => void v.refetch(),
				compact: !0
			})]
		})
	] });
}
function W({ title: e, children: t }) {
	return /* @__PURE__ */ z("section", {
		className: N("border-b border-border px-4 pb-3 last:border-b-0", !e && "pt-3"),
		children: [e && /* @__PURE__ */ R("h3", {
			className: "m-0 flex h-10 items-center text-xs font-semibold text-ink",
			children: e
		}), /* @__PURE__ */ R("div", {
			className: "space-y-1",
			children: t
		})]
	});
}
function G({ field: e, error: t, children: n }) {
	let r = e.type === "toggle", i = Ce.includes(e.type), a = !t && e.instructions ? /* @__PURE__ */ R("p", {
		className: "m-0 mt-1 text-xs text-muted",
		children: e.instructions
	}) : null, o = /* @__PURE__ */ z("label", {
		htmlFor: _e(e),
		className: N("flex h-7 min-w-0 shrink-0 items-center text-xs text-muted", !i && "w-[88px]"),
		children: [/* @__PURE__ */ R("span", {
			className: "truncate",
			children: e.label
		}), typeof e.shared == "string" && /* @__PURE__ */ R(le, {
			from: e.shared,
			className: "ml-1.5"
		})]
	});
	return r ? /* @__PURE__ */ z("div", {
		className: "py-1",
		children: [n, a]
	}) : i ? /* @__PURE__ */ z("div", {
		className: "pb-1",
		children: [
			o,
			n,
			a
		]
	}) : /* @__PURE__ */ z("div", {
		className: "flex min-h-7 items-start gap-2",
		children: [o, /* @__PURE__ */ z("div", {
			className: "min-w-0 flex-1",
			children: [n, a]
		})]
	});
}
function Ae({ entry: e, changes: t, busy: n, onClose: r, onPublish: i }) {
	let a = _(), [o, s] = C(e?.publishedAt ?? null), c = e?.expiresAt && new Date(e.expiresAt).getTime() > Date.now() ? e.expiresAt : null, [l, u] = C(c), [d, p] = C(), [m, h] = C(), g = e?.displayStatus === "scheduled", v = e?.status === "published" && !g && e?.displayStatus !== "expired", y = o ? new Date(o).getTime() : NaN, b = y > Date.now(), x = !!o && y !== new Date(e?.publishedAt ?? 0).getTime() || l !== c, ee = f(b || !o && !v ? g ? "Change Schedule" : "Schedule" : v ? t ? "Publish Changes" : "Change Date" : "Publish"), S = !o || v && !t && !x || g && b && !x;
	return /* @__PURE__ */ z(E, {
		open: !0,
		onOpenChange: (e) => !e && !n && r(),
		title: f(g ? "Change Schedule" : v ? "Publication Date" : "Schedule"),
		footer: /* @__PURE__ */ z(L, { children: [/* @__PURE__ */ R(T, {
			disabled: n,
			onClick: r,
			children: f("Cancel")
		}), /* @__PURE__ */ R(T, {
			variant: "publish",
			loading: n,
			disabled: S,
			onClick: async () => {
				Number.isFinite(y) ? v && b ? p(f("Unpublish this entry before scheduling it for a future date.")) : l && !(new Date(l).getTime() > Math.max(Date.now(), y)) ? h(f("Choose an end after the publication date, and not in the past.")) : await i(o, l === c ? void 0 : l) && r() : p(f("Choose a publication date and time."));
			},
			children: ee
		})] }),
		children: [/* @__PURE__ */ R(D, {
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
		}), l && /* @__PURE__ */ R(T, {
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
var je = (e) => new Date(e).toLocaleString(o(), {
	dateStyle: "medium",
	timeStyle: "short"
}), Me = (e) => e.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim(), Ne = (e, t) => JSON.stringify(e ?? null) !== JSON.stringify(t ?? null), K = (e) => !!e && typeof e == "object" && !Array.isArray(e), Pe = (e) => K(e) && typeof e.id == "string" && typeof e.type == "string", Fe = (e) => Array.isArray(e) && e.some(Pe), Ie = (e) => {
	let t = e.replace(/[_-]+/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
	return t.charAt(0).toUpperCase() + t.slice(1);
};
function Le(e) {
	if (e == null || e === "") return "";
	if (typeof e == "string") return Me(e);
	if (typeof e == "boolean") return e ? f("Yes") : "";
	if (Array.isArray(e)) return e.map(Le).filter(Boolean).join(", ");
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
		return typeof t == "string" ? Me(t) : Object.entries(e).map(([e, t]) => `${Ie(e)}: ${Le(t)}`).filter((e) => !e.endsWith(": ")).join(", ");
	}
	return String(e);
}
function Re(e, t = /* @__PURE__ */ new Map()) {
	for (let n of e) {
		if (!Pe(n)) continue;
		let e = n.props ?? {}, r = [
			e.text,
			e.label,
			e.title,
			e.question,
			e.alt,
			...Array.isArray(e.items) ? e.items : []
		].map((e) => typeof e == "string" ? Me(e) : Le(e)).filter(Boolean).join(" · "), { children: i, ...a } = n;
		t.set(n.id, {
			words: r,
			raw: JSON.stringify(a)
		}), Array.isArray(i) && Re(i, t);
	}
	return t;
}
function ze(e, t, n) {
	let r = Re(Array.isArray(t) ? t : []), i = Re(Array.isArray(n) ? n : []), a = [], o = !1;
	for (let t of /* @__PURE__ */ new Set([...r.keys(), ...i.keys()])) {
		let n = r.get(t), s = i.get(t);
		n?.raw !== s?.raw && ((n?.words ?? "") === (s?.words ?? "") ? o = !0 : a.push({
			label: a.length ? "" : e,
			now: n?.words ?? "",
			then: s?.words ?? ""
		}));
	}
	return (o || !a.length && Ne(t, n)) && a.push({
		label: a.length ? "" : e,
		now: "",
		then: f("Layout or design changed")
	}), a;
}
function Be(e, t, n) {
	if (!Ne(t, n)) return [];
	if (Fe(t) || Fe(n)) return ze(e, t, n);
	if ((K(t) || t == null) && (K(n) || n == null) && (K(t) || K(n))) {
		let r = K(t) ? t : {}, i = K(n) ? n : {};
		return [.../* @__PURE__ */ new Set([...Object.keys(r), ...Object.keys(i)])].flatMap((t) => Be(`${e} › ${Ie(t)}`, r[t], i[t]));
	}
	let r = Le(t), i = Le(n);
	return !r && !i ? [] : [{
		label: e,
		now: r,
		then: r === i ? f("Changed") : i
	}];
}
function Ve(e, t, n, r) {
	let i = {
		title: t.title,
		slug: t.slug,
		data: t.data,
		authorId: t.authorId,
		...t.draft
	}, a = i.data ?? {};
	return [
		...Be(f("Title"), e.title, i.title),
		...Be(f("URL"), e.slug, i.slug),
		...Ne(e.authorId, i.authorId) ? [{
			label: f("Author"),
			now: r,
			then: i.authorId ? f("Someone else") : ""
		}] : [],
		...[.../* @__PURE__ */ new Set([...Object.keys(e.data), ...Object.keys(a)])].flatMap((t) => Be(n.find((e) => e.handle === t)?.label ?? Ie(t), e.data[t], a[t]))
	];
}
function He({ entry: e, working: t, fields: n, editable: r, onRestore: i }) {
	let a = m("revisions/list", { entryId: e?.id ?? "" }, { enabled: !!e }), [o, s] = C(null);
	if (!e) return /* @__PURE__ */ R(te, {
		compact: !0,
		icon: "history",
		title: f("No history yet")
	});
	if (a.isLoading) return /* @__PURE__ */ R("div", {
		className: "grid place-items-center p-6 text-faint",
		children: /* @__PURE__ */ R(ue, {})
	});
	if (a.isError && !a.data) return /* @__PURE__ */ R(A, {
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
	return /* @__PURE__ */ z(L, { children: [
		a.isError && /* @__PURE__ */ R(A, {
			message: a.error.message,
			onRetry: () => void a.refetch(),
			compact: !0
		}),
		a.data?.length === 0 && /* @__PURE__ */ R(te, {
			compact: !0,
			icon: "history",
			title: f("No history yet")
		}),
		/* @__PURE__ */ R("ol", {
			className: "m-0 list-none px-2 py-2",
			children: (a.data ?? []).map((t, n, r) => {
				let i = /* @__PURE__ */ z(L, { children: [/* @__PURE__ */ R("span", {
					className: "relative grid h-5 w-2 shrink-0 place-items-center",
					"aria-hidden": !0,
					children: /* @__PURE__ */ R("span", { className: N("size-2 rounded-full", t.action === "publish" ? "bg-success" : "bg-surface ring-1 ring-inset ring-border-strong") })
				}), /* @__PURE__ */ z("span", {
					className: "block min-w-0 flex-1",
					children: [/* @__PURE__ */ z("span", {
						className: "block truncate text-sm text-text",
						children: [l(t), t.title && t.title !== e.title && /* @__PURE__ */ z("span", {
							className: "text-muted",
							children: [" · ", t.title]
						})]
					}), /* @__PURE__ */ z("span", {
						className: "block truncate text-xs text-faint",
						children: [
							t.user?.name ?? f("System"),
							" · ",
							/* @__PURE__ */ R(M, {
								content: je(t.createdAt),
								children: /* @__PURE__ */ R("time", {
									dateTime: t.createdAt,
									children: p(t.createdAt)
								})
							})
						]
					})]
				})] });
				return /* @__PURE__ */ z("li", {
					className: "relative",
					children: [n < r.length - 1 && /* @__PURE__ */ R("span", {
						className: "absolute bottom-[-10px] left-[11.5px] top-[22px] w-px bg-border",
						"aria-hidden": !0
					}), n > 0 ? /* @__PURE__ */ R(T, {
						variant: "ghost",
						onClick: () => s(t),
						className: "!h-auto min-h-12 w-full !items-start !justify-start !gap-2.5 !whitespace-normal !rounded-md !px-2 !py-2 text-left !font-normal",
						children: i
					}) : /* @__PURE__ */ R("div", {
						className: "flex min-h-12 items-start gap-2.5 px-2 py-2",
						children: i
					})]
				}, t.id);
			})
		}),
		/* @__PURE__ */ R(J, {
			revision: o,
			title: o ? `${l(o)} · ${je(o.createdAt)}` : "",
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
var q = "grid grid-cols-[minmax(96px,0.6fr)_1fr_1fr] gap-x-4 px-3 py-2";
function J({ revision: e, title: t, working: n, fields: r, author: i, editable: a, onClose: o, onRestore: s }) {
	let c = m("revisions/get", { id: e?.id ?? "" }, { enabled: !!e }), l = e && c.data ? Ve(n, c.data.snapshot, r, i) : null;
	return /* @__PURE__ */ R(E, {
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
		children: c.isError ? /* @__PURE__ */ R(A, {
			compact: !0,
			message: f("Couldn’t load this version"),
			onRetry: () => void c.refetch(),
			retrying: c.isRefetching
		}) : l ? l.length === 0 ? /* @__PURE__ */ R("p", {
			role: "status",
			className: "m-0 py-6 text-center text-sm text-muted",
			children: f("Same as now")
		}) : /* @__PURE__ */ z("div", {
			role: "table",
			className: "overflow-hidden rounded-lg border border-border",
			children: [/* @__PURE__ */ z("div", {
				role: "row",
				className: N(q, "sticky top-0 border-b border-border bg-sunken text-xs font-medium text-muted"),
				children: [
					/* @__PURE__ */ R("span", { role: "columnheader" }),
					/* @__PURE__ */ R("span", {
						role: "columnheader",
						children: f("Current")
					}),
					/* @__PURE__ */ R("span", {
						role: "columnheader",
						children: f("This Version")
					})
				]
			}), l.map((e, t) => /* @__PURE__ */ z("div", {
				role: "row",
				className: N(q, "text-sm", t > 0 && (e.label ? "border-t border-border" : "border-t border-border/50")),
				children: [/* @__PURE__ */ R("span", {
					role: "rowheader",
					className: "min-w-0 break-words text-muted",
					children: e.label
				}), e.now && e.then ? /* @__PURE__ */ z(L, { children: [/* @__PURE__ */ R("span", {
					role: "cell",
					className: "min-w-0 break-words text-text",
					children: Ue(e.now, e.then, "del")
				}), /* @__PURE__ */ R("span", {
					role: "cell",
					className: "min-w-0 break-words text-text",
					children: Ue(e.now, e.then, "add")
				})] }) : /* @__PURE__ */ z(L, { children: [/* @__PURE__ */ R("span", {
					role: "cell",
					className: N("min-w-0 break-words", e.now ? "text-danger line-through decoration-danger/40" : "text-faint"),
					children: e.now || "—"
				}), /* @__PURE__ */ R("span", {
					role: "cell",
					className: N("min-w-0 break-words", e.then ? "text-success" : "text-faint"),
					children: e.then || "—"
				})] })]
			}, t))]
		}) : /* @__PURE__ */ R("div", {
			className: "grid place-items-center py-10 text-faint",
			children: /* @__PURE__ */ R(ue, {})
		})
	});
}
function Ue(e, t, n) {
	let r = e.split(/(\s+)/), i = t.split(/(\s+)/), a = n === "del" ? r : i, o = n === "del" ? "text-danger line-through decoration-danger/40" : "text-success";
	if (r.length * i.length > 25e4) return /* @__PURE__ */ R("span", {
		className: o,
		children: a.join("")
	});
	let s = r.length, c = i.length, l = Array.from({ length: s + 1 }, () => new Uint16Array(c + 1));
	for (let e = s - 1; e >= 0; e--) for (let t = c - 1; t >= 0; t--) l[e][t] = r[e] === i[t] ? l[e + 1][t + 1] + 1 : Math.max(l[e + 1][t], l[e][t + 1]);
	let u = /* @__PURE__ */ new Set();
	for (let e = 0, t = 0; e < s && t < c;) r[e] === i[t] ? (u.add(n === "del" ? e : t), e++, t++) : l[e + 1][t] >= l[e][t + 1] ? e++ : t++;
	return /* @__PURE__ */ R(L, { children: a.map((e, t) => u.has(t) || !e.trim() ? /* @__PURE__ */ R(y, { children: e }, t) : /* @__PURE__ */ R("span", {
		className: o,
		children: e
	}, t)) });
}
// admin/src/EntryMoveDialog.tsx
function Y(e, t, n = []) {
	return e.flatMap((e) => {
		if (e.id === t) return [];
		let r = [...n, e.title || f("Untitled")];
		return [{
			value: e.id,
			label: r.join(" / ")
		}, ...Y(e.children ?? [], t, r)];
	});
}
function We({ entry: e, collection: t, busy: n, onClose: r, onMove: i }) {
	let a = m("entries/tree", {
		collection: t.handle,
		locale: e.locale
	}, { refetchOnWindowFocus: !1 }), [o, s] = C(e.parentId), [c, l] = C(null), [u, d] = C(!1), p = S(!1), h = [{
		value: "",
		label: f("Root")
	}, ...Y(a.data ?? [], e.id)], g = o === null || h.some((e) => e.value === o), _ = !!a.data && !a.isError, v = n || u, y = c ?? (_ && !g ? f("This parent is no longer available. Choose another parent.") : void 0);
	return /* @__PURE__ */ z(E, {
		open: !0,
		title: f("Move “{title}”", { title: e.title }),
		onOpenChange: (e) => {
			!e && !v && r();
		},
		footer: /* @__PURE__ */ z(L, { children: [/* @__PURE__ */ R(T, {
			disabled: v,
			onClick: r,
			children: f("Cancel")
		}), /* @__PURE__ */ R(T, {
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
		children: [a.isLoading || !a.data && a.isFetching ? /* @__PURE__ */ z("div", {
			role: "status",
			className: "flex items-center gap-2 py-4 text-sm text-muted",
			children: [/* @__PURE__ */ R(ue, { size: 14 }), f("Loading available parents…")]
		}) : /* @__PURE__ */ z(L, { children: [a.isError && /* @__PURE__ */ R(A, {
			message: a.error.message,
			onRetry: () => void a.refetch()
		}), a.data && /* @__PURE__ */ R(D, {
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
		})] }), /* @__PURE__ */ z("div", {
			className: "mt-4 space-y-2 text-xs text-muted",
			children: [e.uri && /* @__PURE__ */ R("p", {
				className: "m-0",
				children: f("Moving a published entry can change its live URL and the URLs of its descendants.")
			}), /* @__PURE__ */ R("p", {
				className: "m-0",
				children: f("Saved unpublished changes stay in the working copy. Moving does not publish them.")
			})]
		})]
	});
}
// admin/src/EntryEditor.tsx
function Ge({ params: t }) {
	let { collection: n, summary: r, isLoading: i, error: o } = we(t.collection), l = t.id === "new", u = qe(t.id, l), d = _(), { query: p } = g(), m = l ? n?.resolvedBlueprints?.some((e) => e.handle === p.blueprint) ? p.blueprint : null : u.data?.blueprint ?? null, h = l && !!n?.resolvedBlueprints?.length && p.blueprint === void 0, v = u.data?.sharedFields, y = Object.entries(u.data?.translations ?? {}).find(([, e]) => e === u.data?.originId)?.[0] ?? d.site.defaultLocale, b = ee(() => {
		let e = n && B(n, m);
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
	]), x = Ke(d, t.collection, u.data?.locale ?? p.locale), S = () => {
		u.refetch(), a("collections/get");
	}, C = b?.resolvedFields.find((e) => e.body), w = !!C && c("entry.editor", { bodyField: C }).length > 0 && /* @__PURE__ */ R(j, {
		title: f("Outline||structure"),
		backTo: x.path,
		backLabel: x.label,
		children: null
	});
	if (i || !l && u.isLoading) return /* @__PURE__ */ z("div", {
		className: "flex h-full flex-col",
		children: [
			w,
			/* @__PURE__ */ R(pe, { back: x.back }),
			/* @__PURE__ */ R("div", {
				className: "grid flex-1 place-items-center",
				children: /* @__PURE__ */ R(ue, {})
			})
		]
	});
	let E = o ?? u.error, te = !b || !l && !u.data, D = d.collections.find((e) => e.handle === (x.within?.handle ?? t.collection)), O = [...D ? [{
		label: D.title,
		to: x.path,
		icon: D.icon
	}] : [], { label: f("Not Found") }];
	if (te && E && ![
		"not_found",
		"forbidden",
		"invalid_input"
	].includes(E.type)) return /* @__PURE__ */ R(oe, {
		crumbs: D ? O.slice(0, 1) : [],
		children: /* @__PURE__ */ R(A, {
			message: E.message,
			onRetry: S
		})
	});
	if (!b || !r || !l && !u.data) {
		let e = D && /* @__PURE__ */ R(T, {
			onClick: () => s(x.path),
			children: f("Back to {label}", { label: D.title })
		});
		return /* @__PURE__ */ R(oe, {
			crumbs: O,
			children: E?.type === "forbidden" ? /* @__PURE__ */ z(L, { children: [/* @__PURE__ */ R(A, {
				title: f("Access denied"),
				message: E.message
			}), e && /* @__PURE__ */ R("div", {
				className: "mt-4",
				children: e
			})] }) : /* @__PURE__ */ R(k, {
				icon: D?.icon ?? "file",
				action: e
			})
		});
	}
	return h ? /* @__PURE__ */ z(L, { children: [/* @__PURE__ */ R(pe, { back: {
		to: x.path,
		label: x.label
	} }), /* @__PURE__ */ R(e, {
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
	})] }) : /* @__PURE__ */ z(L, { children: [w, /* @__PURE__ */ R(X, {
		collection: b,
		blueprint: m,
		initial: l ? null : u.data,
		can: r.can
	}, `${t.collection}:${t.id}:${m ?? ""}`)] });
}
function Ke(e, t, n) {
	let r = e.collections.find((e) => e.handle === t), i = e.collections.find((e) => e.handle === r?.within), a = i ?? r, o = n && n !== e.site.defaultLocale && e.site.locales.includes(n) ? `?locale=${n}` : "", s = `/content/${a?.handle ?? t}${o}`, c = a?.title ?? "";
	return {
		path: s,
		label: c,
		within: i,
		global: r?.type === "global",
		back: r?.type === "global" ? null : {
			to: s,
			label: c
		}
	};
}
function qe(e, t) {
	return m("entries/get", { id: e }, {
		enabled: !t,
		refetchOnWindowFocus: !1
	});
}
function X({ collection: e, blueprint: t, initial: n, can: r }) {
	let o = _(), { query: l } = g(), p = h("content").autosave ?? 1200, m = n?.locale ?? (o.site.locales.includes(l.locale ?? "") ? l.locale : o.site.defaultLocale), y = Ke(o, e.handle, m), E = y.path, k = y.within?.singular ?? o.collections.find((t) => t.handle === e.handle)?.singular ?? e.singular, oe = ee(() => ({
		...e,
		singular: k
	}), [e, k]), [ce, A] = C(!1), j = Ee(n, {
		title: n?.title ?? (y.global ? o.collections.find((t) => t.handle === e.handle)?.title ?? "" : ""),
		slug: n?.slug ?? "",
		authorId: n ? n.authorId : o.user.id,
		data: n?.data ?? Object.fromEntries(e.resolvedFields.map((e) => [e.handle, e.default ?? null]))
	}, e.handle, m, p, r, ce, t), ve = j.editable, { entry: P, working: F, dirty: I, phase: Ce, errors: B, conflict: we, update: V, session: H } = j, Te = !!_().collections.find((t) => t.handle === e.handle)?.within, U = {
		...ge(r, P),
		...Te || y.global ? { duplicate: !1 } : {}
	}, Oe = Se(), [W, G] = C(() => Oe), [je, Me] = C(null), [Ne, K] = C(!1), Pe = `cms.entry.panel.${e.handle}`, [Fe, Ie] = C(() => localStorage.getItem(Pe) || "details"), [Le, Re] = C(!1), [ze, Be] = C(!1), [Ve, q] = C(!1), J = S(() => j.save()), Ue = S({});
	w(u.panels.subscribe, u.panels.version);
	let Y = Ce === "saving";
	v({
		kind: "entry",
		icon: e.icon,
		rightEdge: !0,
		data: () => {
			let { entry: t, working: n, dirty: r } = H.get();
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
			let e = H.get();
			ve && e.dirty && e.working.title.trim() && await j.save().catch(() => {});
		}
	}), x(() => i.on("content.changed", () => {
		let e = H.get().entry?.id;
		e && d("entries/get", { id: e }).then((e) => {
			let t = H.get();
			t.dirty || t.phase === "saving" || e.version === t.entry?.version || H.command(async () => e);
		}).catch(() => {});
	}), [H]);
	let Ge = (e, t) => {
		V({ data: {
			...H.get().working.data,
			[e]: t
		} });
	}, qe = async (e) => {
		try {
			return await e();
		} catch (e) {
			be.error(e);
			return;
		}
	}, X = async (e = {}) => {
		Ue.current = e, J.current = () => j.save(e);
		try {
			return await j.save(e);
		} catch {
			return;
		}
	}, $e = async () => {
		Ue.current = {}, J.current = () => j.save(), await j.save();
	}, et = async (e, t) => {
		if (!U.publish) return !1;
		K(!0);
		let n = await X({
			publish: !0,
			...e ? { at: e } : {},
			...t === void 0 ? {} : { expiresAt: t }
		});
		return K(!1), n ? (be.success(n.displayStatus === "scheduled" ? f("Scheduled") : f("Published")), !0) : !1;
	}, tt = () => !H.get().dirty || me({
		title: f("Discard unsaved changes?"),
		description: f("Your unsaved edits will be replaced."),
		confirm: f("Discard changes"),
		danger: !0
	}), nt = async () => {
		await tt() && (j.cancel(), q(!0), J.current = nt, await qe(() => H.command((e) => d("entries/get", { id: e.id }))), q(!1));
	}, rt = async (e, t = {}) => {
		await tt() && (j.cancel(), q(!0), J.current = () => rt(e, t), await qe(() => H.command((n) => d(e, {
			...e === "revisions/restore" ? {} : { id: n.id },
			...t,
			expectedVersion: n.version
		}))), q(!1), a("entries/", "revisions/", "content/"));
	}, it = async () => {
		P && await me({
			title: f("Discard unpublished changes to “{title}”?", { title: P.title }),
			description: f("Every change since it was last published is lost. The published version stays as it is."),
			confirm: f("Discard Changes"),
			danger: !0
		}) && await rt("entries/discard-draft");
	}, at = async () => {
		P && await me({
			title: f("Unpublish “{title}”?", { title: P.title }),
			description: f("It leaves the site and its address stops working until it is published again. Its content is kept as a draft."),
			confirm: f("Unpublish"),
			danger: !0
		}) && await rt("entries/unpublish");
	}, ot = async () => {
		P && U.delete && await me({
			title: f("Delete “{title}”?", { title: P.title }),
			description: f("This permanently deletes the entry and its history."),
			confirm: f("Delete"),
			danger: !0
		}) && (j.cancel(), J.current = ot, await qe(async () => {
			await H.command(async (e) => (await d("entries/delete", {
				id: e.id,
				expectedVersion: e.version
			}), e)), H.reset(), a("entries/", "revisions/", "content/"), s(E);
		}));
	}, st = async () => {
		let t = H.get(), n = t.entry;
		U.duplicate && n && !t.dirty && t.phase !== "saving" && await qe(async () => {
			let t = await d("entries/duplicate", {
				id: n.id,
				expectedVersion: n.version
			});
			s(`/content/${e.handle}/${t.id}`);
		});
	}, ct = async (e) => {
		if (!U.move) return !1;
		j.cancel(), q(!0), J.current = () => ct(e);
		try {
			if (H.get().dirty && !await j.save()) return !1;
			let t = await H.command((t) => d("entries/move", {
				id: t.id,
				parentId: e,
				expectedVersion: t.version
			}));
			return a("entries/", "revisions/", "content/"), !!t;
		} catch (e) {
			return be.error(e), !1;
		} finally {
			q(!1);
		}
	}, lt = async () => {
		P && we && await qe(async () => {
			let e = we.version ?? (await d("entries/get", { id: P.id })).version;
			await X({
				...Ue.current,
				expectedVersion: e
			});
		});
	}, Z = {
		entry: P,
		collection: oe,
		content: F,
		values: F.data,
		title: F.title,
		setValue: Ge,
		save: $e,
		reload: nt,
		editable: ve && !Ve,
		can: r,
		errors: B,
		hold: A
	}, ut = c("entry.toolbar", Z), dt = c("entry.notice", Z);
	w(u.entryActions.subscribe, u.entryActions.version);
	let ft = u.entryActions.all().filter((e) => e.when?.(Z) ?? !0).sort((e, t) => (e.order ?? 50) - (t.order ?? 50)), pt = c("entry.sidebar", Z), mt = c("entry.body", Z), Q = e.resolvedFields.find((e) => e.body), ht = Q?.handle, $ = De(e.resolvedFields, ht, [...pt, ...mt]), gt = [
		{
			value: "details",
			label: k,
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
	], _t = gt.some((e) => e.value === Fe) ? Fe : "details", vt = (e) => {
		Ie(e), localStorage.setItem(Pe, e);
	}, yt = () => {
		W || vt("details"), G(!W);
	}, bt = $.document.filter((e) => !Ze.includes(e.type)), xt = $.document.filter((e) => Ze.includes(e.type)), St = {
		entry: P ?? void 0,
		collection: e.handle,
		blueprint: e.blueprint,
		locale: m
	}, Ct = /* @__PURE__ */ z("div", {
		className: "flex h-full min-h-0 flex-col",
		children: [/* @__PURE__ */ R(se, {
			onClose: () => G(!1),
			children: /* @__PURE__ */ R(fe, {
				id: "entry-sidebar",
				value: _t,
				onChange: vt,
				tabs: gt,
				bordered: !1,
				fit: !0,
				className: "h-full min-w-0 flex-1"
			})
		}), /* @__PURE__ */ R("div", {
			role: "tabpanel",
			id: `entry-sidebar-${_t}-panel`,
			"aria-labelledby": `entry-sidebar-${_t}`,
			className: "min-h-0 flex-1 overflow-y-auto",
			children: _t === "details" ? /* @__PURE__ */ R(ke, {
				props: Z,
				working: F,
				fields: Q?.type === "blocks" ? [...$.document, ...$.sidebar] : $.sidebar,
				titleInDetails: Q?.type === "blocks",
				update: V
			}) : _t === "history" ? /* @__PURE__ */ R(He, {
				entry: P,
				working: F,
				fields: e.resolvedFields,
				editable: U.restore && !Y,
				onRestore: async (e) => {
					U.restore && await rt("revisions/restore", { revisionId: e });
				}
			}) : pt.filter((e) => e.id === _t).map((e) => /* @__PURE__ */ R(e.component, { ...Z }, e.id))
		})]
	}), wt = /* @__PURE__ */ z(L, { children: [!y.global && /* @__PURE__ */ R(D, {
		bare: !0,
		fields: [{
			handle: "title",
			type: "text",
			label: f("Title"),
			component: "title",
			placeholder: f("Untitled"),
			autofocus: !P,
			onEnter: () => {
				X(), Ye();
			},
			onDown: Ye
		}],
		values: { title: F.title },
		onChange: (e, t) => V({ title: t ?? "" }),
		errors: B,
		disabled: !Z.editable
	}), (bt.length > 0 || xt.length > 0) && /* @__PURE__ */ z(Xe, {
		collection: e.handle,
		count: bt.length + xt.length,
		always: y.global,
		children: [bt.map((e) => /* @__PURE__ */ R(Qe, {
			field: e,
			value: F.data[e.handle],
			onChange: (t) => Ge(e.handle, t),
			error: B[e.handle],
			disabled: !Z.editable,
			context: St,
			values: F.data
		}, e.handle)), xt.length > 0 && /* @__PURE__ */ R(D, {
			fields: xt,
			values: F.data,
			onChange: Ge,
			errors: B,
			disabled: !Z.editable,
			context: St,
			className: "mt-4 !gap-y-4"
		})]
	})] }), Tt = Q ? {
		...Z,
		footer: /* @__PURE__ */ R(L, { children: mt.map((e) => /* @__PURE__ */ R(e.component, { ...Z }, e.id)) }),
		bodyField: Q,
		setTitle: (e) => V({ title: e }),
		sidebar: Ct,
		sidebarOpen: W,
		setSidebarOpen: G,
		toolbar: je,
		listPath: E,
		listLabel: y.label
	} : null, Et = Tt ? c("entry.editor", Tt)[0] : null, Dt = P?.displayStatus ?? "draft", Ot = P?.status === "published" && Dt !== "scheduled" && Dt !== "expired", kt = Ot && !I && !P?.hasDraft, At = !P && I && !F.title.trim(), jt = F.title || f("Untitled"), Mt = Ce === "error" ? f("Couldn’t save") : At ? f("Add a title to save") : Y ? f("Saving…") : I ? f("Unsaved") : P ? f("Saved") : "", Nt = /* @__PURE__ */ R(M, {
		content: Mt,
		children: /* @__PURE__ */ R("span", {
			"aria-hidden": "true",
			className: N("block size-1.5 rounded-full", Ce === "error" || At ? "bg-danger" : Y || I ? "bg-faint" : "bg-transparent")
		})
	}), Pt = Ce === "error" || At, Ft = /* @__PURE__ */ z("span", {
		className: "flex min-w-0 items-center gap-1.5",
		children: [
			/* @__PURE__ */ R("span", {
				className: "truncate",
				children: jt
			}),
			Nt,
			Pt && /* @__PURE__ */ R("span", {
				className: "shrink-0 text-xs font-normal text-danger",
				children: Mt
			})
		]
	});
	return xe("mod+s", () => {
		ve && X();
	}, !0, ve ? f("Save") : void 0), xe("mod+shift+p", () => {
		U.publish && !ce && !kt && F.title.trim() && et();
	}, !0, U.publish && !ce ? f("Publish") : void 0), xe("mod+.", yt, !0, f("{name} Details", { name: k })), x(() => {
		let t = Object.keys(B)[0];
		if (!t) return;
		let n = t.replace(/^data\./, "").split("."), r = n[0], i = $.claimed.get(r);
		(i || Q?.type === "blocks" && (r === "title" || $.document.some((e) => e.handle === r)) || r === "authorId" || r === "slug" || $.sidebar.some((e) => e.handle === r)) && (G(!0), vt(i ?? "details")), $.document.some((e) => e.handle === r) && (localStorage.setItem(`cms.properties.${e.handle}`, "open"), window.dispatchEvent(new Event("cms.fields.reveal"))), requestAnimationFrame(() => {
			let e = document.getElementById(_e({ handle: n.at(-1) }, n.slice(0, -1))) ?? document.getElementById(`f-${r}`) ?? document.querySelector(`[data-field="${CSS.escape(r)}"] input, [data-field="${CSS.escape(r)}"] textarea, [data-field="${CSS.escape(r)}"] button`);
			e?.scrollIntoView({ block: "center" }), e?.focus();
		});
	}, [B]), /* @__PURE__ */ z("div", {
		className: "relative flex h-full flex-col",
		children: [
			/* @__PURE__ */ R(pe, {
				className: "max-sm:[&_[data-workspace-toggle]]:hidden",
				back: y.back,
				title: Ft,
				children: /* @__PURE__ */ z(L, { children: [/* @__PURE__ */ R("span", {
					className: "min-w-0 text-sm font-medium text-ink max-sm:hidden lg:hidden",
					children: Ft
				}), Et && /* @__PURE__ */ R("div", {
					ref: Me,
					className: "flex shrink-0 items-center gap-0.5 empty:hidden"
				})] }),
				actions: /* @__PURE__ */ z(L, { children: [
					/* @__PURE__ */ R("span", {
						role: "status",
						className: "sr-only",
						children: Mt
					}),
					ut.map((e) => /* @__PURE__ */ R(e.component, { ...Z }, e.id)),
					/* @__PURE__ */ R(M, {
						content: f("{name} Details", { name: k }),
						shortcut: "mod+.",
						children: /* @__PURE__ */ R(ne, {
							icon: "sidebar",
							label: f("{name} Details", { name: k }),
							title: void 0,
							active: W,
							onClick: yt,
							className: "[&_svg]:-scale-x-100"
						})
					}),
					U.publish ? kt ? /* @__PURE__ */ R(ie, {
						trigger: /* @__PURE__ */ z(T, {
							variant: "ghost",
							className: "!gap-1 !px-1.5 !font-normal",
							children: [/* @__PURE__ */ R(de, {
								status: Dt,
								label: ye(Dt),
								className: "text-sm"
							}), /* @__PURE__ */ R(O, {
								name: "chevron-down",
								size: 12,
								className: "shrink-0 text-faint"
							})]
						}),
						items: [{
							label: f("Publication Date…"),
							icon: "calendar",
							onSelect: () => Re(!0)
						}, P && U.unpublish && {
							label: f("Unpublish"),
							icon: "eye-off",
							onSelect: () => {
								at();
							}
						}]
					}) : /* @__PURE__ */ z(T, {
						variant: "publish",
						disabled: !F.title.trim() || ce,
						loading: Ne,
						onClick: () => {
							et();
						},
						children: [/* @__PURE__ */ R("span", {
							className: "max-sm:hidden",
							children: f(Dt === "scheduled" ? "Publish Now" : Ot ? "Publish Changes" : "Publish")
						}), /* @__PURE__ */ R("span", {
							className: "sm:hidden",
							children: f("Publish")
						})]
					}) : ve && /* @__PURE__ */ R(T, {
						variant: "primary",
						disabled: !I || Y,
						loading: Y,
						onClick: () => {
							X();
						},
						children: f("Save Draft")
					}),
					/* @__PURE__ */ R(ie, {
						trigger: /* @__PURE__ */ R(ne, {
							icon: "more",
							label: f("More Actions")
						}),
						items: [
							...ft.map((e) => ({
								label: e.label,
								icon: e.icon,
								onSelect: () => e.perform(Z)
							})),
							P && Ot && P.uri && !P.hasDraft ? {
								label: f("View on Site"),
								icon: "external",
								onSelect: () => {
									window.open(P.uri, "_blank", "noopener");
								}
							} : null,
							U.publish && !kt && {
								label: f(Dt === "scheduled" ? "Change Schedule" : Ot ? "Publication Date…" : "Schedule…"),
								icon: "calendar",
								onSelect: () => Re(!0)
							},
							P && U.move && e.structure === "tree" && {
								label: f("Move…"),
								icon: "arrow-right",
								onSelect: () => Be(!0)
							},
							P && U.duplicate && {
								label: f("Duplicate"),
								icon: "copy",
								disabled: Y || I,
								description: Y || I ? f("Save changes before duplicating") : void 0,
								onSelect: () => {
									st();
								}
							},
							P && U.discard && P.hasDraft && {
								label: f("Discard Unpublished Changes"),
								icon: "undo",
								onSelect: () => {
									it();
								}
							},
							P && U.unpublish && !(U.publish && kt) && {
								label: f("Unpublish"),
								icon: "eye-off",
								onSelect: () => {
									at();
								}
							},
							P && {
								label: f("Copy ID"),
								icon: "hash",
								onSelect: () => void he(P.id, { copied: f("ID copied") })
							},
							P && U.delete && {
								separator: !0,
								label: ""
							},
							P && U.delete && {
								label: f("Delete"),
								icon: "trash",
								danger: !0,
								onSelect: ot
							}
						]
					})
				] })
			}),
			/* @__PURE__ */ z("div", {
				className: "flex h-8 shrink-0 items-center gap-3 border-b border-border px-4 sm:hidden",
				children: [/* @__PURE__ */ R("span", {
					className: "min-w-0 flex-1 truncate text-sm font-medium text-ink",
					children: jt
				}), /* @__PURE__ */ R("span", {
					"aria-hidden": "true",
					className: N("shrink-0 text-xs", Pt ? "text-danger" : "text-faint"),
					children: Mt
				})]
			}),
			$.error && /* @__PURE__ */ R(ae, {
				tone: "danger",
				className: "m-3",
				children: $.error
			}),
			dt.map((e) => /* @__PURE__ */ R(e.component, { ...Z }, e.id)),
			Et && Tt ? /* @__PURE__ */ R("div", {
				className: "min-h-0 flex-1",
				children: /* @__PURE__ */ R(b, {
					fallback: /* @__PURE__ */ R("div", {
						className: "grid h-full place-items-center",
						children: /* @__PURE__ */ R(ue, {})
					}),
					children: /* @__PURE__ */ R(Et.component, { ...Tt })
				})
			}) : /* @__PURE__ */ z("div", {
				className: "flex min-h-0 flex-1",
				children: [/* @__PURE__ */ R("div", {
					className: "min-w-0 flex-1 overflow-y-auto",
					children: /* @__PURE__ */ z("article", {
						className: "mx-auto w-full max-w-[784px] px-6 pb-24 pt-12 md:px-8 md:pt-16",
						children: [
							wt,
							Q?.type === "blocks" ? /* @__PURE__ */ R(te, {
								icon: "blocks",
								title: f("Block editor unavailable")
							}) : Q && /* @__PURE__ */ z("div", {
								className: "mt-8",
								"data-cms-body": !0,
								children: [typeof Q.shared == "string" && /* @__PURE__ */ R(le, {
									from: Q.shared,
									className: "mb-2"
								}), /* @__PURE__ */ R(D, {
									bare: !0,
									fields: [Q],
									values: F.data,
									onChange: Ge,
									errors: B,
									disabled: !Z.editable,
									context: {
										...St,
										title: F.title
									}
								})]
							}),
							mt.map((e) => /* @__PURE__ */ R(e.component, { ...Z }, e.id))
						]
					})
				}), /* @__PURE__ */ R(re, {
					open: W,
					onOpenChange: G,
					title: k,
					children: Ct
				})]
			}),
			Le && /* @__PURE__ */ R(Ae, {
				entry: P,
				changes: I || !!P?.hasDraft,
				busy: Y,
				onClose: () => Re(!1),
				onPublish: (e, t) => et(e, t)
			}),
			ze && P && /* @__PURE__ */ R(We, {
				entry: P,
				collection: oe,
				busy: Y || Ve,
				onClose: () => Be(!1),
				onMove: ct
			}),
			j.error && Ce === "error" && /* @__PURE__ */ R(Je, {
				error: j.error,
				conflict: !!we,
				dirty: I,
				onReload: nt,
				onKeepMine: lt,
				onRetry: () => {
					J.current().catch(() => {});
				}
			})
		]
	});
}
function Je({ error: e, conflict: n, dirty: r, onReload: i, onKeepMine: a, onRetry: o }) {
	let s = e instanceof t && e.status > 0, c = n ? e.message : s && e.type === "invalid_input" ? f("Couldn’t save. Check the highlighted fields.") : s ? f("Couldn’t save. {reason}", { reason: e.message }) : f("Couldn’t save. Check your connection.");
	return /* @__PURE__ */ R("div", {
		className: "pointer-events-none absolute inset-x-0 top-14 z-sticky flex justify-center px-4 max-sm:top-[5.5rem]",
		children: /* @__PURE__ */ z("div", {
			role: "alert",
			className: "pointer-events-auto flex min-h-10 max-w-[560px] items-center gap-2.5 rounded-lg border border-border-float bg-float py-1.5 pl-3 pr-1.5 text-sm text-text shadow-pop",
			children: [
				/* @__PURE__ */ R(O, {
					name: "warning",
					size: 16,
					className: "shrink-0 text-danger"
				}),
				/* @__PURE__ */ R("span", {
					className: "min-w-0 flex-1",
					children: c
				}),
				n ? /* @__PURE__ */ z(L, { children: [/* @__PURE__ */ R(T, {
					size: "xs",
					variant: "ghost",
					onClick: i,
					children: f("Load Their Version")
				}), r && /* @__PURE__ */ R(T, {
					size: "xs",
					variant: "ghost",
					onClick: a,
					children: f("Keep Mine")
				})] }) : e.type !== "invalid_input" && /* @__PURE__ */ R(T, {
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
function Xe({ collection: e, count: t, always: n, children: r }) {
	let i = `cms.properties.${e}`, [a, o] = C(() => localStorage.getItem(i) !== "closed");
	return x(() => {
		let e = () => o(!0);
		return window.addEventListener("cms.fields.reveal", e), () => window.removeEventListener("cms.fields.reveal", e);
	}, []), n ? /* @__PURE__ */ R("div", {
		className: "mt-6",
		"data-cms-fields": "",
		children: /* @__PURE__ */ R("div", {
			className: "space-y-px",
			children: r
		})
	}) : /* @__PURE__ */ z("div", {
		className: "mt-6",
		"data-cms-fields": a ? "" : void 0,
		children: [a && /* @__PURE__ */ R("div", {
			className: "space-y-px",
			children: r
		}), /* @__PURE__ */ z(T, {
			variant: "ghost",
			onClick: () => {
				localStorage.setItem(i, a ? "closed" : "open"), o(!a);
			},
			"aria-expanded": a,
			className: "-ml-1.5 mt-2 !gap-1.5 !rounded-xs !px-1.5 !text-xs !font-normal !text-faint hover:!text-muted",
			children: [/* @__PURE__ */ R(O, {
				name: a ? "chevron-up" : "chevron-down",
				size: 12
			}), a ? f("Hide Properties") : l(t, "{count} property", "{count} properties")]
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
	return /* @__PURE__ */ z("div", {
		className: "grid grid-cols-[148px_minmax(0,1fr)] items-start gap-3 py-0.5",
		children: [/* @__PURE__ */ z("div", {
			className: "flex h-8 min-w-0 items-center gap-1.5 text-sm text-muted",
			children: [/* @__PURE__ */ R(M, {
				content: e.instructions ?? e.label,
				children: /* @__PURE__ */ R("span", {
					className: "truncate",
					children: e.label
				})
			}), typeof e.shared == "string" && /* @__PURE__ */ R(le, { from: e.shared })]
		}), /* @__PURE__ */ R("div", {
			className: "min-w-0",
			children: /* @__PURE__ */ R(D, {
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
export { Ge as default };
