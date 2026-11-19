import e from "./NewEntry-DHnzMbmA.js";
import { CmsError as t, blockNavigation as n, can as r, events as i, invalidate as a, locale as o, navigate as s, panelsFor as c, plural as l, registry as u, run as d, t as f, useAbility as p, useConfig as m, useLocation as h, useManifest as g, useScreenContext as _ } from "@letterncms/sdk";
import { Fragment as v, Suspense as y, useEffect as b, useMemo as ee, useRef as x, useState as S, useSyncExternalStore as C } from "react";
import { Button as w, Dialog as T, EmptyState as E, Fields as D, Icon as O, IconButton as k, InspectorPanel as te, Menu as ne, NotFoundState as re, Notice as ie, Page as A, PanelHeader as ae, PersonPicker as oe, QueryError as j, ScreenSidebar as se, SharedMark as ce, Spinner as le, StatusDot as ue, Tabs as de, Tooltip as M, Topbar as fe, VersionDialog as N, VersionList as pe, cn as P, confirm as me, copyText as he, entryActionAvailability as ge, fieldControlId as _e, fieldVisible as F, nativeName as I, settledValues as L, slugify as ve, statusLabel as ye, toast as be, useShortcut as xe, useVersion as R, useWideInspector as Se, wideFieldTypes as Ce } from "@letterncms/ui";
import { Fragment as z, jsx as B, jsxs as V } from "react/jsx-runtime";
// admin/src/useCollection.ts
function we(e, t) {
	let n = t ? e.resolvedBlueprints?.find((e) => e.handle === t) : void 0;
	return n ? {
		...e,
		resolvedFields: n.resolvedFields,
		blueprint: n.handle
	} : e;
}
function H(e) {
	let t = g().collections.find((t) => t.handle === e), n = p("collections/get", { handle: e }, { staleTime: 6e4 });
	return {
		summary: t,
		collection: n.data,
		isLoading: n.isLoading,
		error: n.error
	};
}
// admin/src/entrySession.ts
var Te = (e) => ({
	title: e.title,
	slug: e.slug,
	data: e.data,
	authorId: e.authorId
}), U = (e) => Object.fromEntries(Object.entries(e).map(([e, t]) => [e.replace(/^data\./, ""), t])), Ee = (e, t) => e.title === t.title && e.slug === t.slug && e.authorId === t.authorId && JSON.stringify(e.data) === JSON.stringify(t.data), W = class {
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
		}, n = !this.state.entry || !Ee(t, Te(this.state.entry));
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
					working: r === this.edit ? Te(i) : this.state.working,
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
					working: t === this.edit ? Te(n) : this.state.working,
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
			...e ? { working: Te(e) } : {},
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
function De(e, t, r, i, o, s, c = !1, l = null) {
	let u = x(!0), p = x(window.location.pathname);
	b(() => (u.current = !0, () => {
		u.current = !1;
	}), []);
	let [m] = S(() => new W(e, t, async (e, t, n) => {
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
	})), h = C(m.subscribe, m.get), g = !c && (h.entry ? s.edit : s.create), _ = x(void 0), v = () => clearTimeout(_.current);
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
function Oe(e, t, n) {
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
function G(e, t, n) {
	return t?.uri ? t.uri === "/" ? "/" : t.uri.replace(/[^/]+$/, n || t.slug) : (e.route ?? "/{slug}").replace("{parent_uri}/", "").replace("{slug}", n || "…").replace(/\{[a-z_]+\}/g, "…").replace(/\/+/g, "/");
}
function ke({ props: e, working: t, fields: n, titleInDetails: i, update: a }) {
	let { entry: s, collection: c, editable: l, errors: u } = e, d = g(), m = d.collections.find((e) => e.handle === c.handle), h = c.system === !0, _ = r("collections.manage"), v = p("entries/get-many", { ids: s?.parentId ? [s.parentId] : [] }, { enabled: _ && !!s?.parentId }), y = !!m?.within, b = m?.type === "global", ee = p("pages/builtin", {}, { enabled: y }), x = ee.data?.find((e) => e.collection === c.handle)?.pages.find((e) => e.handle === (s?.slug ?? t.slug)), S = (e) => new Intl.DateTimeFormat(o(), {
		dateStyle: "medium",
		timeStyle: "short",
		timeZone: d.site.timezone
	}).format(new Date(e)), C = (e) => e.section === "sidebar" ? "main" : e.section ?? "main", w = L(n, t.data), T = n.filter((e) => F(e, w)), E = T.filter((e) => C(e) === "main"), O = [...new Set(T.map(C))].filter((e) => e !== "main").map((e) => {
		let t = T.filter((t) => C(t) === e), n = e.replace(/[_-]/g, " ").replace(/\b\w/g, (e) => e.toUpperCase());
		return {
			group: e,
			inside: t,
			heading: t.length === 1 && t[0].label?.toLowerCase() === n.toLowerCase() ? null : n
		};
	}), k = s?.displayStatus ?? "draft", te = {
		entry: s ?? void 0,
		collection: c.handle,
		locale: s?.locale ?? d.site.defaultLocale
	}, ne = [
		...!h || c.route || m?.within ? [[f("Status"), /* @__PURE__ */ B(ue, {
			status: k,
			label: ye(k),
			className: "text-text"
		}, "status")]] : [],
		...s?.publishedAt && k !== "draft" ? [[f(k === "scheduled" ? "Goes Live" : "Published"), /* @__PURE__ */ B(M, {
			content: d.site.timezone,
			children: /* @__PURE__ */ B("time", {
				dateTime: s.publishedAt,
				children: S(s.publishedAt)
			})
		}, "published")]] : [],
		...s?.expiresAt && k !== "draft" ? [[f(k === "expired" ? "Ended" : "Ends"), /* @__PURE__ */ B(M, {
			content: d.site.timezone,
			children: /* @__PURE__ */ B("time", {
				dateTime: s.expiresAt,
				children: S(s.expiresAt)
			})
		}, "ends")]] : [],
		..._ ? [
			...s && c.structure === "tree" ? [[f("Parent"), s.parentId ? v.data?.[0]?.title ?? (v.isLoading ? f("Loading…") : "") : f("None")]] : [],
			...m?.within ? [] : [[f("Collection"), c.title]],
			...d.site.locales.length > 1 ? [[f("Language"), I(s?.locale ?? d.site.defaultLocale)]] : [],
			...s?.createdAt ? [[f("Created"), S(s.createdAt)]] : [],
			...s?.updatedAt ? [[f("Updated"), S(s.updatedAt)]] : []
		] : []
	], re = (t) => /* @__PURE__ */ B(je, {
		field: t,
		error: u[t.handle],
		children: /* @__PURE__ */ B(D, {
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
			context: te
		})
	}, t.handle);
	return /* @__PURE__ */ V("div", { children: [
		/* @__PURE__ */ V(Ae, { children: [
			i && /* @__PURE__ */ B(je, {
				field: {
					handle: "title",
					type: "text",
					label: f("Title")
				},
				error: u.title,
				children: /* @__PURE__ */ B(D, {
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
			y ? /* @__PURE__ */ V("div", {
				className: "flex min-h-7 items-start gap-2",
				children: [/* @__PURE__ */ B("span", {
					className: "flex h-7 w-[88px] shrink-0 items-center text-xs text-muted",
					children: f("URL")
				}), /* @__PURE__ */ B("span", {
					className: "flex h-7 min-w-0 flex-1 items-center",
					children: x?.path ? /* @__PURE__ */ B(M, {
						content: x.path,
						children: /* @__PURE__ */ B("span", {
							className: "truncate px-1 font-mono text-xs text-faint",
							children: x.path
						})
					}) : /* @__PURE__ */ B("span", {
						className: "truncate px-1 text-xs text-faint",
						children: ee.isLoading ? "…" : f("Shown inside other pages")
					})
				})]
			}) : !b && /* @__PURE__ */ B(je, {
				field: {
					handle: "slug",
					type: "text",
					label: c.route ? f("URL") : f("Handle")
				},
				error: u.slug,
				children: /* @__PURE__ */ B(D, {
					bare: !0,
					fields: [c.route ? {
						handle: "slug",
						type: "slug",
						label: f("URL"),
						component: "uri",
						uri: G(c, s, t.slug),
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
						slug: t.slug || ve(t.title)
					},
					onChange: (e, t) => a({ [e]: t ?? "" }),
					errors: u,
					disabled: !l
				})
			}),
			!h && !b && /* @__PURE__ */ B(je, {
				field: {
					handle: "authorId",
					type: "person",
					label: f("Author")
				},
				error: u.authorId,
				children: /* @__PURE__ */ B(oe, {
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
			E.map(re)
		] }),
		O.map(({ group: e, inside: t, heading: n }) => /* @__PURE__ */ B(Ae, {
			title: n,
			children: t.map(re)
		}, e)),
		ne.length > 0 && /* @__PURE__ */ V(Ae, {
			title: f("Info"),
			children: [/* @__PURE__ */ B("dl", {
				className: "m-0 space-y-1",
				children: ne.map(([e, t]) => /* @__PURE__ */ V("div", {
					className: "flex min-h-7 items-start gap-2",
					children: [/* @__PURE__ */ B("dt", {
						className: "flex h-7 w-[88px] shrink-0 items-center truncate text-xs text-muted",
						children: e
					}), /* @__PURE__ */ B("dd", {
						className: "m-0 min-w-0 flex-1 break-words py-1 text-sm text-text",
						children: t
					})]
				}, e))
			}), s?.parentId && v.isError && /* @__PURE__ */ B(j, {
				message: v.error.message,
				onRetry: () => void v.refetch(),
				compact: !0
			})]
		})
	] });
}
function Ae({ title: e, children: t }) {
	return /* @__PURE__ */ V("section", {
		className: P("border-b border-border px-4 pb-3 last:border-b-0", !e && "pt-3"),
		children: [e && /* @__PURE__ */ B("h3", {
			className: "m-0 flex h-10 items-center text-xs font-semibold text-ink",
			children: e
		}), /* @__PURE__ */ B("div", {
			className: "space-y-1",
			children: t
		})]
	});
}
function je({ field: e, error: t, children: n }) {
	let r = e.type === "toggle", i = Ce.includes(e.type), a = !t && e.instructions ? /* @__PURE__ */ B("p", {
		className: "m-0 mt-1 text-xs text-muted",
		children: e.instructions
	}) : null, o = /* @__PURE__ */ V("label", {
		htmlFor: _e(e),
		className: P("flex h-7 min-w-0 shrink-0 items-center text-xs text-muted", !i && "w-[88px]"),
		children: [/* @__PURE__ */ B("span", {
			className: "truncate",
			children: e.label
		}), typeof e.shared == "string" && /* @__PURE__ */ B(ce, {
			from: e.shared,
			className: "ml-1.5"
		})]
	});
	return r ? /* @__PURE__ */ V("div", {
		className: "py-1",
		children: [n, a]
	}) : i ? /* @__PURE__ */ V("div", {
		className: "pb-1",
		children: [
			o,
			n,
			a
		]
	}) : /* @__PURE__ */ V("div", {
		className: "flex min-h-7 items-start gap-2",
		children: [o, /* @__PURE__ */ V("div", {
			className: "min-w-0 flex-1",
			children: [n, a]
		})]
	});
}
function Me({ entry: e, changes: t, busy: n, onClose: r, onPublish: i }) {
	let a = g(), [o, s] = S(e?.publishedAt ?? null), c = e?.expiresAt && new Date(e.expiresAt).getTime() > Date.now() ? e.expiresAt : null, [l, u] = S(c), [d, p] = S(), [m, h] = S(), _ = e?.displayStatus === "scheduled", v = e?.status === "published" && !_ && e?.displayStatus !== "expired", y = o ? new Date(o).getTime() : NaN, b = y > Date.now(), ee = !!o && y !== new Date(e?.publishedAt ?? 0).getTime() || l !== c, x = f(b || !o && !v ? _ ? "Change Schedule" : "Schedule" : v ? t ? "Publish Changes" : "Change Date" : "Publish"), C = !o || v && !t && !ee || _ && b && !ee;
	return /* @__PURE__ */ V(T, {
		open: !0,
		onOpenChange: (e) => !e && !n && r(),
		title: f(_ ? "Change Schedule" : v ? "Publication Date" : "Schedule"),
		footer: /* @__PURE__ */ V(z, { children: [/* @__PURE__ */ B(w, {
			disabled: n,
			onClick: r,
			children: f("Cancel")
		}), /* @__PURE__ */ B(w, {
			variant: "publish",
			loading: n,
			disabled: C,
			onClick: async () => {
				Number.isFinite(y) ? v && b ? p(f("Unpublish this entry before scheduling it for a future date.")) : l && !(new Date(l).getTime() > Math.max(Date.now(), y)) ? h(f("Choose an end after the publication date, and not in the past.")) : await i(o, l === c ? void 0 : l) && r() : p(f("Choose a publication date and time."));
			},
			children: x
		})] }),
		children: [/* @__PURE__ */ B(D, {
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
		}), l && /* @__PURE__ */ B(w, {
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
var Ne = (e) => e.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim(), Pe = (e, t) => JSON.stringify(e ?? null) !== JSON.stringify(t ?? null), K = (e) => !!e && typeof e == "object" && !Array.isArray(e), Fe = (e) => K(e) && typeof e.id == "string" && typeof e.type == "string", Ie = (e) => Array.isArray(e) && e.some(Fe), Le = (e) => {
	let t = e.replace(/[_-]+/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
	return t.charAt(0).toUpperCase() + t.slice(1);
};
function q(e) {
	if (e == null || e === "") return "";
	if (typeof e == "string") return Ne(e);
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
		return typeof t == "string" ? Ne(t) : Object.entries(e).map(([e, t]) => `${Le(e)}: ${q(t)}`).filter((e) => !e.endsWith(": ")).join(", ");
	}
	return String(e);
}
function Re(e, t = /* @__PURE__ */ new Map()) {
	for (let n of e) {
		if (!Fe(n)) continue;
		let e = n.props ?? {}, r = [
			e.text,
			e.label,
			e.title,
			e.question,
			e.alt,
			...Array.isArray(e.items) ? e.items : []
		].map((e) => typeof e == "string" ? Ne(e) : q(e)).filter(Boolean).join(" · "), { children: i, ...a } = n;
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
	return (o || !a.length && Pe(t, n)) && a.push({
		label: a.length ? "" : e,
		now: "",
		then: f("Layout or design changed")
	}), a;
}
function Be(e, t, n) {
	if (!Pe(t, n)) return [];
	if (Ie(t) || Ie(n)) return ze(e, t, n);
	if ((K(t) || t == null) && (K(n) || n == null) && (K(t) || K(n))) {
		let r = K(t) ? t : {}, i = K(n) ? n : {};
		return [.../* @__PURE__ */ new Set([...Object.keys(r), ...Object.keys(i)])].flatMap((t) => Be(`${e} › ${Le(t)}`, r[t], i[t]));
	}
	let r = q(t), i = q(n);
	return !r && !i ? [] : [{
		label: e,
		now: r,
		then: r === i ? f("Changed") : i
	}];
}
function J(e, t, n, r) {
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
		...Pe(e.authorId, i.authorId) ? [{
			label: f("Author"),
			now: r,
			then: i.authorId ? f("Someone else") : ""
		}] : [],
		...[.../* @__PURE__ */ new Set([...Object.keys(e.data), ...Object.keys(a)])].flatMap((t) => Be(n.find((e) => e.handle === t)?.label ?? Le(t), e.data[t], a[t]))
	];
}
function Ve({ entry: e, working: t, fields: n, editable: r, onRestore: i }) {
	let [a, o] = S(null);
	return e ? /* @__PURE__ */ V(z, { children: [/* @__PURE__ */ B("div", {
		className: "px-1 py-1",
		children: /* @__PURE__ */ B(pe, {
			of: {
				kind: "entry",
				subject: e.id
			},
			title: e.title,
			onOpen: o
		})
	}), /* @__PURE__ */ B(He, {
		version: a,
		working: t,
		fields: n,
		author: e.author?.name ?? "",
		editable: r,
		onClose: () => o(null),
		onRestore: (e) => {
			o(null), i(e);
		}
	})] }) : /* @__PURE__ */ B(E, {
		compact: !0,
		icon: "history",
		title: f("No history yet")
	});
}
var Y = "grid grid-cols-[minmax(96px,0.6fr)_1fr_1fr] gap-x-4 px-3 py-2";
function He({ version: e, working: t, fields: n, author: r, editable: i, onClose: a, onRestore: o }) {
	let s = R(e), c = e && s.data ? J(t, s.data.snapshot, n, r) : null;
	return /* @__PURE__ */ B(N, {
		version: e,
		onClose: a,
		onRestore: i && e ? () => o(e.id) : void 0,
		loading: !c,
		failed: s.isError,
		onRetry: () => void s.refetch(),
		unchanged: !!c && c.length === 0,
		children: /* @__PURE__ */ V("div", {
			role: "table",
			className: "overflow-hidden rounded-lg border border-border",
			children: [/* @__PURE__ */ V("div", {
				role: "row",
				className: P(Y, "sticky top-0 border-b border-border bg-sunken text-xs font-medium text-muted"),
				children: [
					/* @__PURE__ */ B("span", { role: "columnheader" }),
					/* @__PURE__ */ B("span", {
						role: "columnheader",
						children: f("Current")
					}),
					/* @__PURE__ */ B("span", {
						role: "columnheader",
						children: f("This Version")
					})
				]
			}), (c ?? []).map((e, t) => /* @__PURE__ */ V("div", {
				role: "row",
				className: P(Y, "text-sm", t > 0 && (e.label ? "border-t border-border" : "border-t border-border/50")),
				children: [/* @__PURE__ */ B("span", {
					role: "rowheader",
					className: "min-w-0 break-words text-muted",
					children: e.label
				}), e.now && e.then ? /* @__PURE__ */ V(z, { children: [/* @__PURE__ */ B("span", {
					role: "cell",
					className: "min-w-0 break-words text-text",
					children: X(e.now, e.then, "del")
				}), /* @__PURE__ */ B("span", {
					role: "cell",
					className: "min-w-0 break-words text-text",
					children: X(e.now, e.then, "add")
				})] }) : /* @__PURE__ */ V(z, { children: [/* @__PURE__ */ B("span", {
					role: "cell",
					className: P("min-w-0 break-words", e.now ? "text-danger line-through decoration-danger/40" : "text-faint"),
					children: e.now || "—"
				}), /* @__PURE__ */ B("span", {
					role: "cell",
					className: P("min-w-0 break-words", e.then ? "text-success" : "text-faint"),
					children: e.then || "—"
				})] })]
			}, t))]
		})
	});
}
function X(e, t, n) {
	let r = e.split(/(\s+)/), i = t.split(/(\s+)/), a = n === "del" ? r : i, o = n === "del" ? "text-danger line-through decoration-danger/40" : "text-success";
	if (r.length * i.length > 25e4) return /* @__PURE__ */ B("span", {
		className: o,
		children: a.join("")
	});
	let s = r.length, c = i.length, l = Array.from({ length: s + 1 }, () => new Uint16Array(c + 1));
	for (let e = s - 1; e >= 0; e--) for (let t = c - 1; t >= 0; t--) l[e][t] = r[e] === i[t] ? l[e + 1][t + 1] + 1 : Math.max(l[e + 1][t], l[e][t + 1]);
	let u = /* @__PURE__ */ new Set();
	for (let e = 0, t = 0; e < s && t < c;) r[e] === i[t] ? (u.add(n === "del" ? e : t), e++, t++) : l[e + 1][t] >= l[e][t + 1] ? e++ : t++;
	return /* @__PURE__ */ B(z, { children: a.map((e, t) => u.has(t) || !e.trim() ? /* @__PURE__ */ B(v, { children: e }, t) : /* @__PURE__ */ B("span", {
		className: o,
		children: e
	}, t)) });
}
// admin/src/EntryMoveDialog.tsx
function Ue(e, t, n = []) {
	return e.flatMap((e) => {
		if (e.id === t) return [];
		let r = [...n, e.title || f("Untitled")];
		return [{
			value: e.id,
			label: r.join(" / ")
		}, ...Ue(e.children ?? [], t, r)];
	});
}
function We({ entry: e, collection: t, busy: n, onClose: r, onMove: i }) {
	let a = p("entries/tree", {
		collection: t.handle,
		locale: e.locale
	}, { refetchOnWindowFocus: !1 }), [o, s] = S(e.parentId), [c, l] = S(null), [u, d] = S(!1), m = x(!1), h = [{
		value: "",
		label: f("Root")
	}, ...Ue(a.data ?? [], e.id)], g = o === null || h.some((e) => e.value === o), _ = !!a.data && !a.isError, v = n || u, y = c ?? (_ && !g ? f("This parent is no longer available. Choose another parent.") : void 0);
	return /* @__PURE__ */ V(T, {
		open: !0,
		title: f("Move “{title}”", { title: e.title }),
		onOpenChange: (e) => {
			!e && !v && r();
		},
		footer: /* @__PURE__ */ V(z, { children: [/* @__PURE__ */ B(w, {
			disabled: v,
			onClick: r,
			children: f("Cancel")
		}), /* @__PURE__ */ B(w, {
			variant: "primary",
			loading: v,
			disabled: !_ || !g || o === e.parentId,
			onClick: async () => {
				if (!m.current && !v && _ && g && o !== e.parentId) {
					m.current = !0, d(!0), l(null);
					try {
						await i(o) ? r() : l(f("Could not move this entry. Try again."));
					} catch (e) {
						l(e instanceof Error ? e.message : f("Could not move this entry. Try again."));
					} finally {
						d(!1), m.current = !1;
					}
				}
			},
			children: f("Move")
		})] }),
		children: [a.isLoading || !a.data && a.isFetching ? /* @__PURE__ */ V("div", {
			role: "status",
			className: "flex items-center gap-2 py-4 text-sm text-muted",
			children: [/* @__PURE__ */ B(le, { size: 14 }), f("Loading available parents…")]
		}) : /* @__PURE__ */ V(z, { children: [a.isError && /* @__PURE__ */ B(j, {
			message: a.error.message,
			onRetry: () => void a.refetch()
		}), a.data && /* @__PURE__ */ B(D, {
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
		})] }), /* @__PURE__ */ V("div", {
			className: "mt-4 space-y-2 text-xs text-muted",
			children: [e.uri && /* @__PURE__ */ B("p", {
				className: "m-0",
				children: f("Moving a published entry can change its live URL and the URLs of its descendants.")
			}), /* @__PURE__ */ B("p", {
				className: "m-0",
				children: f("Saved unpublished changes stay in the working copy. Moving does not publish them.")
			})]
		})]
	});
}
// admin/src/EntryEditor.tsx
function Ge({ params: t }) {
	let { collection: n, summary: r, isLoading: i, error: o } = H(t.collection), l = t.id === "new", u = qe(t.id, l), d = g(), { query: p } = h(), m = l ? n?.resolvedBlueprints?.some((e) => e.handle === p.blueprint) ? p.blueprint : null : u.data?.blueprint ?? null, _ = l && !!n?.resolvedBlueprints?.length && p.blueprint === void 0, v = u.data?.sharedFields, y = Object.entries(u.data?.translations ?? {}).find(([, e]) => e === u.data?.originId)?.[0] ?? d.site.defaultLocale, b = ee(() => {
		let e = n && we(n, m);
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
	}, C = b?.resolvedFields.find((e) => e.body), T = !!C && c("entry.editor", { bodyField: C }).length > 0 && /* @__PURE__ */ B(se, {
		title: f("Outline||structure"),
		backTo: x.path,
		backLabel: x.label,
		children: null
	});
	if (i || !l && u.isLoading) return /* @__PURE__ */ V("div", {
		className: "flex h-full flex-col",
		children: [
			T,
			/* @__PURE__ */ B(fe, { back: x.back }),
			/* @__PURE__ */ B("div", {
				className: "grid flex-1 place-items-center",
				children: /* @__PURE__ */ B(le, {})
			})
		]
	});
	let E = o ?? u.error, D = !b || !l && !u.data, O = d.collections.find((e) => e.handle === (x.within?.handle ?? t.collection)), k = [...O ? [{
		label: O.title,
		to: x.path,
		icon: O.icon
	}] : [], { label: f("Not Found") }];
	if (D && E && ![
		"not_found",
		"forbidden",
		"invalid_input"
	].includes(E.type)) return /* @__PURE__ */ B(A, {
		crumbs: O ? k.slice(0, 1) : [],
		children: /* @__PURE__ */ B(j, {
			message: E.message,
			onRetry: S
		})
	});
	if (!b || !r || !l && !u.data) {
		let e = O && /* @__PURE__ */ B(w, {
			onClick: () => s(x.path),
			children: f("Back to {label}", { label: O.title })
		});
		return /* @__PURE__ */ B(A, {
			crumbs: k,
			children: E?.type === "forbidden" ? /* @__PURE__ */ V(z, { children: [/* @__PURE__ */ B(j, {
				title: f("Access denied"),
				message: E.message
			}), e && /* @__PURE__ */ B("div", {
				className: "mt-4",
				children: e
			})] }) : /* @__PURE__ */ B(re, {
				icon: O?.icon ?? "file",
				action: e
			})
		});
	}
	return _ ? /* @__PURE__ */ V(z, { children: [/* @__PURE__ */ B(fe, { back: {
		to: x.path,
		label: x.label
	} }), /* @__PURE__ */ B(e, {
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
	})] }) : /* @__PURE__ */ V(z, { children: [T, /* @__PURE__ */ B(Je, {
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
	return p("entries/get", { id: e }, {
		enabled: !t,
		refetchOnWindowFocus: !1
	});
}
function Je({ collection: e, blueprint: t, initial: n, can: r }) {
	let o = g(), { query: l } = h(), p = m("content").autosave ?? 1200, v = n?.locale ?? (o.site.locales.includes(l.locale ?? "") ? l.locale : o.site.defaultLocale), T = Ke(o, e.handle, v), re = T.path, A = T.within?.singular ?? o.collections.find((t) => t.handle === e.handle)?.singular ?? e.singular, oe = ee(() => ({
		...e,
		singular: A
	}), [e, A]), [j, se] = S(!1), N = De(n, {
		title: n?.title ?? (T.global ? o.collections.find((t) => t.handle === e.handle)?.title ?? "" : ""),
		slug: n?.slug ?? "",
		authorId: n ? n.authorId : o.user.id,
		data: n?.data ?? Object.fromEntries(e.resolvedFields.map((e) => [e.handle, e.default ?? null]))
	}, e.handle, v, p, r, j, t), pe = N.editable, { entry: F, working: I, dirty: L, phase: ve, errors: R, conflict: Ce, update: we, session: H } = N, Te = !!g().collections.find((t) => t.handle === e.handle)?.within, U = {
		...ge(r, F),
		...Te || T.global ? { duplicate: !1 } : {}
	}, Ee = Se(), [W, G] = S(() => Ee), [Ae, je] = S(null), [Ne, Pe] = S(!1), K = `cms.entry.panel.${e.handle}`, [Fe, Ie] = S(() => localStorage.getItem(K) || "details"), [Le, q] = S(!1), [Re, ze] = S(!1), [Be, J] = S(!1), Y = x(() => N.save()), He = x({});
	C(u.panels.subscribe, u.panels.version);
	let X = ve === "saving";
	_({
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
				locale: v,
				fields: n.data
			};
		},
		flush: async () => {
			let e = H.get();
			pe && e.dirty && e.working.title.trim() && await N.save().catch(() => {});
		}
	}), b(() => i.on("content.changed", () => {
		let e = H.get().entry?.id;
		e && d("entries/get", { id: e }).then((e) => {
			let t = H.get();
			t.dirty || t.phase === "saving" || e.version === t.entry?.version || H.command(async () => e);
		}).catch(() => {});
	}), [H]);
	let Ue = (e, t) => {
		we({ data: {
			...H.get().working.data,
			[e]: t
		} });
	}, Ge = async (e) => {
		try {
			return await e();
		} catch (e) {
			be.error(e);
			return;
		}
	}, qe = async (e = {}) => {
		He.current = e, Y.current = () => N.save(e);
		try {
			return await N.save(e);
		} catch {
			return;
		}
	}, Je = async () => {
		He.current = {}, Y.current = () => N.save(), await N.save();
	}, et = async (e, t) => {
		if (!U.publish) return !1;
		Pe(!0);
		let n = await qe({
			publish: !0,
			...e ? { at: e } : {},
			...t === void 0 ? {} : { expiresAt: t }
		});
		return Pe(!1), n ? (be.success(n.displayStatus === "scheduled" ? f("Scheduled") : f("Published")), !0) : !1;
	}, tt = () => !H.get().dirty || me({
		title: f("Discard unsaved changes?"),
		description: f("Your unsaved edits will be replaced."),
		confirm: f("Discard changes"),
		danger: !0
	}), nt = async () => {
		await tt() && (N.cancel(), J(!0), Y.current = nt, await Ge(() => H.command((e) => d("entries/get", { id: e.id }))), J(!1));
	}, rt = async (e, t = {}) => {
		await tt() && (N.cancel(), J(!0), Y.current = () => rt(e, t), await Ge(() => H.command((n) => d(e, {
			...e === "revisions/restore" ? {} : { id: n.id },
			...t,
			expectedVersion: n.version
		}))), J(!1), a("entries/", "revisions/", "content/"));
	}, it = async () => {
		F && await me({
			title: f("Discard unpublished changes to “{title}”?", { title: F.title }),
			description: f("Every change since it was last published is lost. The published version stays as it is."),
			confirm: f("Discard Changes"),
			danger: !0
		}) && await rt("entries/discard-draft");
	}, at = async () => {
		F && await me({
			title: f("Unpublish “{title}”?", { title: F.title }),
			description: f("It leaves the site and its address stops working until it is published again. Its content is kept as a draft."),
			confirm: f("Unpublish"),
			danger: !0
		}) && await rt("entries/unpublish");
	}, ot = async () => {
		F && U.delete && await me({
			title: f("Delete “{title}”?", { title: F.title }),
			description: f("This permanently deletes the entry and its history."),
			confirm: f("Delete"),
			danger: !0
		}) && (N.cancel(), Y.current = ot, await Ge(async () => {
			await H.command(async (e) => (await d("entries/delete", {
				id: e.id,
				expectedVersion: e.version
			}), e)), H.reset(), a("entries/", "revisions/", "content/"), s(re);
		}));
	}, st = async () => {
		let t = H.get(), n = t.entry;
		U.duplicate && n && !t.dirty && t.phase !== "saving" && await Ge(async () => {
			let t = await d("entries/duplicate", {
				id: n.id,
				expectedVersion: n.version
			});
			s(`/content/${e.handle}/${t.id}`);
		});
	}, ct = async (e) => {
		if (!U.move) return !1;
		N.cancel(), J(!0), Y.current = () => ct(e);
		try {
			if (H.get().dirty && !await N.save()) return !1;
			let t = await H.command((t) => d("entries/move", {
				id: t.id,
				parentId: e,
				expectedVersion: t.version
			}));
			return a("entries/", "revisions/", "content/"), !!t;
		} catch (e) {
			return be.error(e), !1;
		} finally {
			J(!1);
		}
	}, lt = async () => {
		F && Ce && await Ge(async () => {
			let e = Ce.version ?? (await d("entries/get", { id: F.id })).version;
			await qe({
				...He.current,
				expectedVersion: e
			});
		});
	}, Z = {
		entry: F,
		collection: oe,
		content: I,
		values: I.data,
		title: I.title,
		setValue: Ue,
		save: Je,
		reload: nt,
		editable: pe && !Be,
		can: r,
		errors: R,
		hold: se
	}, ut = c("entry.toolbar", Z), dt = c("entry.notice", Z);
	C(u.entryActions.subscribe, u.entryActions.version);
	let ft = u.entryActions.all().filter((e) => e.when?.(Z) ?? !0).sort((e, t) => (e.order ?? 50) - (t.order ?? 50)), pt = c("entry.sidebar", Z), mt = c("entry.body", Z), Q = e.resolvedFields.find((e) => e.body), ht = Q?.handle, $ = Oe(e.resolvedFields, ht, [...pt, ...mt]), gt = [
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
	], _t = gt.some((e) => e.value === Fe) ? Fe : "details", vt = (e) => {
		Ie(e), localStorage.setItem(K, e);
	}, yt = () => {
		W || vt("details"), G(!W);
	}, bt = $.document.filter((e) => !Qe.includes(e.type)), xt = $.document.filter((e) => Qe.includes(e.type)), St = {
		entry: F ?? void 0,
		collection: e.handle,
		blueprint: e.blueprint,
		locale: v
	}, Ct = /* @__PURE__ */ V("div", {
		className: "flex h-full min-h-0 flex-col",
		children: [/* @__PURE__ */ B(ae, {
			onClose: () => G(!1),
			children: /* @__PURE__ */ B(de, {
				id: "entry-sidebar",
				value: _t,
				onChange: vt,
				tabs: gt,
				bordered: !1,
				fit: !0,
				className: "h-full min-w-0 flex-1"
			})
		}), /* @__PURE__ */ B("div", {
			role: "tabpanel",
			id: `entry-sidebar-${_t}-panel`,
			"aria-labelledby": `entry-sidebar-${_t}`,
			className: "min-h-0 flex-1 overflow-y-auto",
			children: _t === "details" ? /* @__PURE__ */ B(ke, {
				props: Z,
				working: I,
				fields: Q?.type === "blocks" ? [...$.document, ...$.sidebar] : $.sidebar,
				titleInDetails: Q?.type === "blocks",
				update: we
			}) : _t === "history" ? /* @__PURE__ */ B(Ve, {
				entry: F,
				working: I,
				fields: e.resolvedFields,
				editable: U.restore && !X,
				onRestore: async (e) => {
					U.restore && await rt("revisions/restore", { revisionId: e });
				}
			}) : pt.filter((e) => e.id === _t).map((e) => /* @__PURE__ */ B(e.component, { ...Z }, e.id))
		})]
	}), wt = /* @__PURE__ */ V(z, { children: [!T.global && /* @__PURE__ */ B(D, {
		bare: !0,
		fields: [{
			handle: "title",
			type: "text",
			label: f("Title"),
			component: "title",
			placeholder: f("Untitled"),
			autofocus: !F,
			onEnter: () => {
				qe(), Xe();
			},
			onDown: Xe
		}],
		values: { title: I.title },
		onChange: (e, t) => we({ title: t ?? "" }),
		errors: R,
		disabled: !Z.editable
	}), (bt.length > 0 || xt.length > 0) && /* @__PURE__ */ V(Ze, {
		collection: e.handle,
		count: bt.length + xt.length,
		always: T.global,
		children: [bt.map((e) => /* @__PURE__ */ B($e, {
			field: e,
			value: I.data[e.handle],
			onChange: (t) => Ue(e.handle, t),
			error: R[e.handle],
			disabled: !Z.editable,
			context: St,
			values: I.data
		}, e.handle)), xt.length > 0 && /* @__PURE__ */ B(D, {
			fields: xt,
			values: I.data,
			onChange: Ue,
			errors: R,
			disabled: !Z.editable,
			context: St,
			className: "mt-4 !gap-y-4"
		})]
	})] }), Tt = Q ? {
		...Z,
		footer: /* @__PURE__ */ B(z, { children: mt.map((e) => /* @__PURE__ */ B(e.component, { ...Z }, e.id)) }),
		bodyField: Q,
		setTitle: (e) => we({ title: e }),
		sidebar: Ct,
		sidebarOpen: W,
		setSidebarOpen: G,
		toolbar: Ae,
		listPath: re,
		listLabel: T.label
	} : null, Et = Tt ? c("entry.editor", Tt)[0] : null, Dt = F?.displayStatus ?? "draft", Ot = F?.status === "published" && Dt !== "scheduled" && Dt !== "expired", kt = Ot && !L && !F?.hasDraft, At = !F && L && !I.title.trim(), jt = I.title || f("Untitled"), Mt = ve === "error" ? f("Couldn’t save") : At ? f("Add a title to save") : X ? f("Saving…") : L ? f("Unsaved") : F ? f("Saved") : "", Nt = /* @__PURE__ */ B(M, {
		content: Mt,
		children: /* @__PURE__ */ B("span", {
			"aria-hidden": "true",
			className: P("block size-1.5 rounded-full", ve === "error" || At ? "bg-danger" : X || L ? "bg-faint" : "bg-transparent")
		})
	}), Pt = ve === "error" || At, Ft = /* @__PURE__ */ V("span", {
		className: "flex min-w-0 items-center gap-1.5",
		children: [
			/* @__PURE__ */ B("span", {
				className: "truncate",
				children: jt
			}),
			Nt,
			Pt && /* @__PURE__ */ B("span", {
				className: "shrink-0 text-xs font-normal text-danger",
				children: Mt
			})
		]
	});
	return xe("mod+s", () => {
		pe && qe();
	}, !0, pe ? f("Save") : void 0), xe("mod+shift+p", () => {
		U.publish && !j && !kt && I.title.trim() && et();
	}, !0, U.publish && !j ? f("Publish") : void 0), xe("mod+.", yt, !0, f("{name} Details", { name: A })), b(() => {
		let t = Object.keys(R)[0];
		if (!t) return;
		let n = t.replace(/^data\./, "").split("."), r = n[0], i = $.claimed.get(r);
		(i || Q?.type === "blocks" && (r === "title" || $.document.some((e) => e.handle === r)) || r === "authorId" || r === "slug" || $.sidebar.some((e) => e.handle === r)) && (G(!0), vt(i ?? "details")), $.document.some((e) => e.handle === r) && (localStorage.setItem(`cms.properties.${e.handle}`, "open"), window.dispatchEvent(new Event("cms.fields.reveal"))), requestAnimationFrame(() => {
			let e = document.getElementById(_e({ handle: n.at(-1) }, n.slice(0, -1))) ?? document.getElementById(`f-${r}`) ?? document.querySelector(`[data-field="${CSS.escape(r)}"] input, [data-field="${CSS.escape(r)}"] textarea, [data-field="${CSS.escape(r)}"] button`);
			e?.scrollIntoView({ block: "center" }), e?.focus();
		});
	}, [R]), /* @__PURE__ */ V("div", {
		className: "relative flex h-full flex-col",
		children: [
			/* @__PURE__ */ B(fe, {
				className: "max-sm:[&_[data-workspace-toggle]]:hidden",
				back: T.back,
				title: Ft,
				children: /* @__PURE__ */ V(z, { children: [/* @__PURE__ */ B("span", {
					className: "min-w-0 text-sm font-medium text-ink max-sm:hidden lg:hidden",
					children: Ft
				}), Et && /* @__PURE__ */ B("div", {
					ref: je,
					className: "flex shrink-0 items-center gap-0.5 empty:hidden"
				})] }),
				actions: /* @__PURE__ */ V(z, { children: [
					/* @__PURE__ */ B("span", {
						role: "status",
						className: "sr-only",
						children: Mt
					}),
					ut.map((e) => /* @__PURE__ */ B(e.component, { ...Z }, e.id)),
					/* @__PURE__ */ B(M, {
						content: f("{name} Details", { name: A }),
						shortcut: "mod+.",
						children: /* @__PURE__ */ B(k, {
							icon: "sidebar",
							label: f("{name} Details", { name: A }),
							title: void 0,
							active: W,
							onClick: yt,
							className: "[&_svg]:-scale-x-100"
						})
					}),
					U.publish ? kt ? /* @__PURE__ */ B(ne, {
						trigger: /* @__PURE__ */ V(w, {
							variant: "ghost",
							className: "!gap-1 !px-1.5 !font-normal",
							children: [/* @__PURE__ */ B(ue, {
								status: Dt,
								label: ye(Dt),
								className: "text-sm"
							}), /* @__PURE__ */ B(O, {
								name: "chevron-down",
								size: 12,
								className: "shrink-0 text-faint"
							})]
						}),
						items: [{
							label: f("Publication Date…"),
							icon: "calendar",
							onSelect: () => q(!0)
						}, F && U.unpublish && {
							label: f("Unpublish"),
							icon: "eye-off",
							onSelect: () => {
								at();
							}
						}]
					}) : /* @__PURE__ */ V(w, {
						variant: "publish",
						disabled: !I.title.trim() || j,
						loading: Ne,
						onClick: () => {
							et();
						},
						children: [/* @__PURE__ */ B("span", {
							className: "max-sm:hidden",
							children: f(Dt === "scheduled" ? "Publish Now" : Ot ? "Publish Changes" : "Publish")
						}), /* @__PURE__ */ B("span", {
							className: "sm:hidden",
							children: f("Publish")
						})]
					}) : pe && /* @__PURE__ */ B(w, {
						variant: "primary",
						disabled: !L || X,
						loading: X,
						onClick: () => {
							qe();
						},
						children: f("Save Draft")
					}),
					/* @__PURE__ */ B(ne, {
						trigger: /* @__PURE__ */ B(k, {
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
							U.publish && !kt && {
								label: f(Dt === "scheduled" ? "Change Schedule" : Ot ? "Publication Date…" : "Schedule…"),
								icon: "calendar",
								onSelect: () => q(!0)
							},
							F && U.move && e.structure === "tree" && {
								label: f("Move…"),
								icon: "arrow-right",
								onSelect: () => ze(!0)
							},
							F && U.duplicate && {
								label: f("Duplicate"),
								icon: "copy",
								disabled: X || L,
								description: X || L ? f("Save changes before duplicating") : void 0,
								onSelect: () => {
									st();
								}
							},
							F && U.discard && F.hasDraft && {
								label: f("Discard Unpublished Changes"),
								icon: "undo",
								onSelect: () => {
									it();
								}
							},
							F && U.unpublish && !(U.publish && kt) && {
								label: f("Unpublish"),
								icon: "eye-off",
								onSelect: () => {
									at();
								}
							},
							F && {
								label: f("Copy ID"),
								icon: "hash",
								onSelect: () => void he(F.id, { copied: f("ID copied") })
							},
							F && U.delete && {
								separator: !0,
								label: ""
							},
							F && U.delete && {
								label: f("Delete"),
								icon: "trash",
								danger: !0,
								onSelect: ot
							}
						]
					})
				] })
			}),
			/* @__PURE__ */ V("div", {
				className: "flex h-8 shrink-0 items-center gap-3 border-b border-border px-4 sm:hidden",
				children: [/* @__PURE__ */ B("span", {
					className: "min-w-0 flex-1 truncate text-sm font-medium text-ink",
					children: jt
				}), /* @__PURE__ */ B("span", {
					"aria-hidden": "true",
					className: P("shrink-0 text-xs", Pt ? "text-danger" : "text-faint"),
					children: Mt
				})]
			}),
			$.error && /* @__PURE__ */ B(ie, {
				tone: "danger",
				className: "m-3",
				children: $.error
			}),
			dt.map((e) => /* @__PURE__ */ B(e.component, { ...Z }, e.id)),
			Et && Tt ? /* @__PURE__ */ B("div", {
				className: "min-h-0 flex-1",
				children: /* @__PURE__ */ B(y, {
					fallback: /* @__PURE__ */ B("div", {
						className: "grid h-full place-items-center",
						children: /* @__PURE__ */ B(le, {})
					}),
					children: /* @__PURE__ */ B(Et.component, { ...Tt })
				})
			}) : /* @__PURE__ */ V("div", {
				className: "flex min-h-0 flex-1",
				children: [/* @__PURE__ */ B("div", {
					className: "min-w-0 flex-1 overflow-y-auto",
					children: /* @__PURE__ */ V("article", {
						className: "mx-auto w-full max-w-[784px] px-6 pb-24 pt-12 md:px-8 md:pt-16",
						children: [
							wt,
							Q?.type === "blocks" ? /* @__PURE__ */ B(E, {
								icon: "blocks",
								title: f("Block editor unavailable")
							}) : Q && /* @__PURE__ */ V("div", {
								className: "mt-8",
								"data-cms-body": !0,
								children: [typeof Q.shared == "string" && /* @__PURE__ */ B(ce, {
									from: Q.shared,
									className: "mb-2"
								}), /* @__PURE__ */ B(D, {
									bare: !0,
									fields: [Q],
									values: I.data,
									onChange: Ue,
									errors: R,
									disabled: !Z.editable,
									context: {
										...St,
										title: I.title
									}
								})]
							}),
							mt.map((e) => /* @__PURE__ */ B(e.component, { ...Z }, e.id))
						]
					})
				}), /* @__PURE__ */ B(te, {
					open: W,
					onOpenChange: G,
					title: A,
					children: Ct
				})]
			}),
			Le && /* @__PURE__ */ B(Me, {
				entry: F,
				changes: L || !!F?.hasDraft,
				busy: X,
				onClose: () => q(!1),
				onPublish: (e, t) => et(e, t)
			}),
			Re && F && /* @__PURE__ */ B(We, {
				entry: F,
				collection: oe,
				busy: X || Be,
				onClose: () => ze(!1),
				onMove: ct
			}),
			N.error && ve === "error" && /* @__PURE__ */ B(Ye, {
				error: N.error,
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
function Ye({ error: e, conflict: n, dirty: r, onReload: i, onKeepMine: a, onRetry: o }) {
	let s = e instanceof t && e.status > 0, c = n ? e.message : s && e.type === "invalid_input" ? f("Couldn’t save. Check the highlighted fields.") : s ? f("Couldn’t save. {reason}", { reason: e.message }) : f("Couldn’t save. Check your connection.");
	return /* @__PURE__ */ B("div", {
		className: "pointer-events-none absolute inset-x-0 top-14 z-sticky flex justify-center px-4 max-sm:top-[5.5rem]",
		children: /* @__PURE__ */ V("div", {
			role: "alert",
			className: "pointer-events-auto flex min-h-10 max-w-[560px] items-center gap-2.5 rounded-lg border border-border-float bg-float py-1.5 pl-3 pr-1.5 text-sm text-text shadow-pop",
			children: [
				/* @__PURE__ */ B(O, {
					name: "warning",
					size: 16,
					className: "shrink-0 text-danger"
				}),
				/* @__PURE__ */ B("span", {
					className: "min-w-0 flex-1",
					children: c
				}),
				n ? /* @__PURE__ */ V(z, { children: [/* @__PURE__ */ B(w, {
					size: "xs",
					variant: "ghost",
					onClick: i,
					children: f("Load Their Version")
				}), r && /* @__PURE__ */ B(w, {
					size: "xs",
					variant: "ghost",
					onClick: a,
					children: f("Keep Mine")
				})] }) : e.type !== "invalid_input" && /* @__PURE__ */ B(w, {
					size: "xs",
					variant: "ghost",
					onClick: o,
					children: f("Try Again")
				})
			]
		})
	});
}
function Xe() {
	(document.querySelector("[data-cms-body] [contenteditable=\"true\"], [data-cms-body] textarea, [data-cms-body] input") ?? document.querySelector("[data-cms-fields] input, [data-cms-fields] textarea"))?.focus();
}
function Ze({ collection: e, count: t, always: n, children: r }) {
	let i = `cms.properties.${e}`, [a, o] = S(() => localStorage.getItem(i) !== "closed");
	return b(() => {
		let e = () => o(!0);
		return window.addEventListener("cms.fields.reveal", e), () => window.removeEventListener("cms.fields.reveal", e);
	}, []), n ? /* @__PURE__ */ B("div", {
		className: "mt-6",
		"data-cms-fields": "",
		children: /* @__PURE__ */ B("div", {
			className: "space-y-px",
			children: r
		})
	}) : /* @__PURE__ */ V("div", {
		className: "mt-6",
		"data-cms-fields": a ? "" : void 0,
		children: [a && /* @__PURE__ */ B("div", {
			className: "space-y-px",
			children: r
		}), /* @__PURE__ */ V(w, {
			variant: "ghost",
			onClick: () => {
				localStorage.setItem(i, a ? "closed" : "open"), o(!a);
			},
			"aria-expanded": a,
			className: "-ml-1.5 mt-2 !gap-1.5 !rounded-xs !px-1.5 !text-xs !font-normal !text-faint hover:!text-muted",
			children: [/* @__PURE__ */ B(O, {
				name: a ? "chevron-up" : "chevron-down",
				size: 12
			}), a ? f("Hide Properties") : l(t, "{count} property", "{count} properties")]
		})]
	});
}
var Qe = [
	"repeater",
	"blocks",
	"richtext",
	"markdown",
	"json",
	"group",
	"code",
	"fields"
];
function $e({ field: e, value: t, onChange: n, error: r, disabled: i, context: a, values: o }) {
	return /* @__PURE__ */ V("div", {
		className: "grid grid-cols-[148px_minmax(0,1fr)] items-start gap-3 py-0.5",
		children: [/* @__PURE__ */ V("div", {
			className: "flex h-8 min-w-0 items-center gap-1.5 text-sm text-muted",
			children: [/* @__PURE__ */ B(M, {
				content: e.instructions ?? e.label,
				children: /* @__PURE__ */ B("span", {
					className: "truncate",
					children: e.label
				})
			}), typeof e.shared == "string" && /* @__PURE__ */ B(ce, { from: e.shared })]
		}), /* @__PURE__ */ B("div", {
			className: "min-w-0",
			children: /* @__PURE__ */ B(D, {
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
