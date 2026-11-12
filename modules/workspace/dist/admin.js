import { CmsError as e, Link as t, adminUrl as n, boot as r, eventStream as i, events as a, getManifest as o, loadManifest as s, matchPath as c, navigate as l, onManifest as u, panelsFor as d, prefetch as f, queryClient as p, registry as m, run as h, screenContext as g, screenText as _, setPreference as v, t as y, timeAgo as b, useAction as x, useLocation as S, useManifest as C, useScreen as w } from "@letterncms/sdk";
import { Button as T, Dock as E, Fields as D, Icon as O, IconButton as k, Kbd as A, Menu as j, Notice as ee, Pressable as M, QueryError as N, SidebarRow as P, Spinner as F, Surface as I, Textarea as te, Tooltip as L, View as ne, cn as R, confirm as re, copyText as ie, fillTemplate as ae, toast as oe, useInspectorOpen as se, useShortcutLabel as ce } from "@letterncms/ui";
import { Fragment as le, createContext as ue, useCallback as z, useContext as de, useEffect as B, useId as fe, useLayoutEffect as pe, useRef as V, useState as H, useSyncExternalStore as me } from "react";
import { Fragment as he, jsx as U, jsxs as W } from "react/jsx-runtime";
import { useInfiniteQuery as ge } from "@tanstack/react-query";
// admin/src/store.ts
var _e = "cms.chat.open", ve = "cms.chat.detached", ye = "cms.chat.current";
function be() {
	try {
		return {
			mode: localStorage.getItem(_e) === "true" && window.matchMedia("(min-width: 1024px)").matches ? "docked" : "closed",
			thread: sessionStorage.getItem(ye) || null,
			detached: localStorage.getItem(ve) === "true"
		};
	} catch {
		return {
			mode: "closed",
			thread: null,
			detached: !1
		};
	}
}
var xe = /* @__PURE__ */ new Set(), G = {
	...be(),
	fresh: 0,
	palette: 0,
	history: !1,
	title: "",
	prompt: null,
	searching: !1,
	focus: 0,
	contextPath: "/",
	dismissed: [],
	selectedText: "",
	attached: {},
	skills: {},
	commands: {},
	drafts: {},
	options: {},
	working: null,
	awaiting: !1
}, K = null, q = null, Se = -Infinity, Ce = !1;
function we() {
	let e = Ce;
	return Ce = !1, {
		back: performance.now() - Se < 300,
		focus: e
	};
}
function Te(e) {
	return e ? `/chat/${encodeURIComponent(e)}` : "/chat/new";
}
function Ee(e) {
	let t = /^\/chat\/([^/]+)$/.exec(e);
	return t ? t[1] === "new" ? null : decodeURIComponent(t[1]) : void 0;
}
var De = "workspace.mode";
function Oe() {
	let e = o().user.preferences?.[De];
	return e === "local" || e === "ai" ? e : Ae() ? "ai" : "local";
}
function ke(e) {
	v(De, e).catch(() => {}), Z.set({ chosen: e });
}
function Ae() {
	return o().config?.workspace?.agent ?? null;
}
function je() {
	return o().config?.workspace?.setup ?? null;
}
function J() {
	return Oe() === "local" ? null : Ae();
}
var Me = () => window.location.pathname.slice(r.base.length) || "/";
function Ne(e, t = !1) {
	let n = Te(e);
	Me() !== n && l(n, {
		replace: t,
		overlay: !0
	});
}
function Pe() {
	try {
		localStorage.setItem(_e, String(G.mode !== "closed")), localStorage.setItem(ve, String(G.detached)), G.thread ? sessionStorage.setItem(ye, G.thread) : sessionStorage.removeItem(ye);
	} catch {}
}
var Y = () => G.thread ?? "new", Fe = /(^|\n)\/[^\n]*$/, X = null;
function Ie(e) {
	let t = X;
	X = null;
	let n = t ? G.drafts[t.key] ?? "" : "";
	return t && e && Fe.test(n) && Z.set({ drafts: {
		...G.drafts,
		[t.key]: n.replace(Fe, "")
	} }), t;
}
var Le = null;
document.addEventListener("pointerdown", (e) => {
	Le = null, X && e.target instanceof Element && !e.target.closest(".cms-dock, [role=\"menu\"], [role=\"listbox\"], [role=\"dialog\"], [role=\"alertdialog\"]") && (Le = e.target, Z.dismissPalette());
}, !0);
var Re = () => !!document.querySelector(".cms-dock")?.parentElement?.closest("[data-base-ui-inert]"), Z = {
	get: () => G,
	key: Y,
	set(e) {
		let t = G;
		G = {
			...G,
			...e.thread !== void 0 && e.thread !== G.thread ? { title: "" } : {},
			...e
		}, xe.forEach((e) => e()), (G.mode !== t.mode || G.thread !== t.thread || G.detached !== t.detached) && Pe();
	},
	open() {
		G.mode === "closed" ? (q = document.activeElement, Z.set({
			mode: "docked",
			focus: G.focus + 1
		})) : Z.set({ focus: G.focus + 1 });
	},
	close() {
		if (Ie(!0), G.mode === "closed") return;
		let e = G.mode === "full";
		Z.set({ mode: "closed" }), e && l(K ?? "/", { overlay: K !== null }), Se = performance.now(), q instanceof HTMLElement && q.isConnected && q !== document.body ? q.focus() : Ce = !0, q = null;
	},
	palette(e) {
		if (Re() || e && Le && e.contains(Le)) return;
		let t = G.mode !== "closed" && !!document.activeElement?.closest(".cms-dock");
		if (X && t) return Z.dismissPalette();
		let n = Y();
		G.commands[n] && Z.command(null);
		let r = G.drafts[n] ?? "", i = Fe.test(r) ? r : r.trim() ? `${r.trimEnd()}\n/` : "/";
		X = {
			key: n,
			opened: G.mode === "closed" || (X?.opened ?? !1)
		}, G.mode === "closed" && (q = document.activeElement), Z.set({
			mode: G.mode === "closed" ? "docked" : G.mode,
			history: !1,
			drafts: {
				...G.drafts,
				[n]: i
			},
			palette: G.palette + 1,
			focus: G.focus + 1
		});
	},
	inPalette: () => X !== null && X.key === Y(),
	dismissPalette() {
		Ie(!0)?.opened && Z.close();
	},
	pickedFromPalette(e) {
		Ie(!0)?.opened && e && (Z.close(), Ce = !1);
	},
	leavePalette() {
		X?.key === Y() && Ie(!1);
	},
	toggle() {
		let e = document.activeElement?.closest(".cms-dock");
		G.mode === "closed" || !e ? Z.open() : G.mode === "full" ? Z.minimize() : Z.close();
	},
	maximize() {
		K = Me() + window.location.search, Ne(G.thread);
	},
	minimize() {
		G.mode === "full" && l(K ?? "/", { overlay: K !== null });
	},
	select(e) {
		e !== G.thread && Ie(!0), G.mode === "full" && Ne(e), G.mode === "closed" && (q = document.activeElement), Z.set({
			thread: e,
			mode: G.mode === "closed" ? "docked" : G.mode,
			history: !1,
			prompt: null,
			focus: G.focus + 1
		});
	},
	newChat() {
		G.working?.thread !== null && Z.set({ fresh: G.fresh + 1 }), Z.select(null);
	},
	ask(e) {
		G.drafts[Y()]?.trim() ? Z.select(G.thread) : Z.newChat(), e?.trim() && Z.set({
			prompt: e.trim(),
			searching: !1
		});
	},
	send(e) {
		e.trim() && Z.set({
			prompt: e.trim(),
			searching: !1
		});
	},
	search(e) {
		e.trim() && Z.set({
			prompt: e.trim(),
			searching: !0
		});
	},
	draft(e) {
		Z.set({ drafts: {
			...G.drafts,
			[Y()]: e
		} });
	},
	option(e, t) {
		Z.set({ options: {
			...G.options,
			[Y()]: {
				...G.options[Y()] ?? {},
				[e]: t
			}
		} });
	},
	command(e) {
		Z.set({ commands: {
			...G.commands,
			[Y()]: e
		} });
	},
	deleted(e) {
		let { [e]: t, ...n } = G.drafts, { [e]: r, ...i } = G.options;
		Z.set({
			drafts: n,
			options: i
		}), Me() === Te(e) && Ne(null, !0), G.thread === e && Z.set({
			thread: null,
			prompt: null,
			focus: G.focus + 1
		});
	},
	created(e, t) {
		if (G.thread !== e) {
			let { new: n, ...r } = G.options, { new: i, ...a } = G.commands;
			Z.set({
				thread: e,
				title: t,
				drafts: {
					...G.drafts,
					[e]: G.drafts.new ?? "",
					new: ""
				},
				options: n ? {
					...r,
					[e]: n
				} : r,
				commands: i ? {
					...a,
					[e]: i
				} : a
			});
		} else Z.set({ title: t });
		Me() === "/chat/new" && Ne(e, !0);
	},
	subscribe(e) {
		return xe.add(e), () => {
			xe.delete(e);
		};
	}
}, ze = (e) => e.site.kits?.find((e) => e.active)?.handle ?? null, Be;
try {
	Be = ze(o());
} catch {}
u((e) => {
	let t = ze(e);
	Be !== void 0 && t !== Be && (Ie(!1), Z.set({
		thread: null,
		history: !1,
		prompt: null,
		drafts: {},
		options: {},
		commands: {},
		attached: {},
		skills: {},
		fresh: G.fresh + 1
	}), Ee(Me()) !== void 0 && Ne(null, !0)), Be = t;
});
function Q() {
	return me(Z.subscribe, Z.get);
}
function Ve() {
	let e = se();
	return {
		chosen: Q().detached,
		required: w().rightEdge === !0 || e
	};
}
// admin/src/ChatToggle.tsx
function He() {
	let { mode: e, working: t, awaiting: n } = Q(), r = e !== "closed", i = V(null);
	return pe(() => {
		let e = i.current;
		if (r || !e) return;
		let { back: t, focus: n } = we();
		e.toggleAttribute("data-back", t), n && e.focus();
	}, [r]), r ? null : /* @__PURE__ */ U(L, {
		content: y("Chat"),
		shortcut: "mod+j",
		side: "bottom",
		children: /* @__PURE__ */ W(T, {
			ref: i,
			"data-workspace-toggle": !0,
			variant: "tonal",
			onClick: () => Z.open(),
			className: "cms-chat-toggle",
			children: [
				!t && !n && /* @__PURE__ */ U(O, {
					name: "comment-solid",
					size: 16,
					className: "shrink-0 text-signal"
				}),
				n && /* @__PURE__ */ U("span", {
					role: "status",
					"aria-label": y("Waiting for your go-ahead"),
					className: "size-1.5 rounded-full bg-signal ring-1 ring-border-strong"
				}),
				!n && t && /* @__PURE__ */ U("span", {
					role: "status",
					"aria-label": y("Working…"),
					children: /* @__PURE__ */ U(F, { size: 12 })
				}),
				/* @__PURE__ */ U("span", {
					className: "max-sm:sr-only",
					children: y("Chat")
				})
			]
		})
	});
}
// admin/src/schema.ts
var Ue = {
	title: () => y("Title"),
	name: () => y("Name"),
	email: () => y("Email"),
	slug: () => y("Slug"),
	status: () => y("Status"),
	label: () => y("Label"),
	url: () => y("Link"),
	menu: () => y("Menu"),
	roles: () => y("Roles"),
	password: () => y("Password"),
	collection: () => y("Collection"),
	query: () => y("Search"),
	search: () => y("Search"),
	description: () => y("Description"),
	code: () => y("Code")
};
function We(e) {
	return Ue[e] ? Ue[e]() : e.replace(/Id$/, "").replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").trim().replace(/\b\w/g, (e) => e.toUpperCase());
}
var Ge = (e) => (Array.isArray(e.type) ? e.type : [e.type]).filter((e) => typeof e == "string" && e !== "null"), Ke = (e) => !e.pattern && ![
	"ulid",
	"date-time",
	"uri"
].includes(e.format), qe = (e) => e === "id" || e === "ids" || /Id$/.test(e) || e === "entry";
function Je(e) {
	if (!e) return null;
	if (Array.isArray(e.oneOf) && e.oneOf.length > 0 && e.oneOf.every((e) => e && "const" in e)) return Object.fromEntries(e.oneOf.map((e) => [String(e.const), String(e.title ?? e.const)]));
	if (!Array.isArray(e.enum)) return null;
	let t = e["x-labels"] && typeof e["x-labels"] == "object" ? e["x-labels"] : {};
	return Object.fromEntries(e.enum.map((e) => [String(e), typeof t[String(e)] == "string" && t[String(e)] !== "" ? String(t[String(e)]) : String(e)]));
}
function Ye(e, t) {
	return [
		"entry",
		"entryId",
		"parentId",
		"originId"
	].includes(t) ? "entries" : ["userId", "authorId"].includes(t) ? "users" : t !== "id" || !e ? null : e.startsWith("entries/") ? "entries" : e.startsWith("users/") ? "users" : null;
}
function Xe(e, t, n = {}) {
	let r = e?.properties && typeof e.properties == "object" ? e.properties : {};
	return (Array.isArray(e?.required) ? e.required : []).every((e) => e in n || !qe(e) || Je(r[e]) !== null || Ye(t, e) !== null);
}
function Ze(e, t = {}, n = !1, r) {
	let i = e?.properties && typeof e.properties == "object" && !Array.isArray(e.properties) ? e.properties : {}, a = Array.isArray(e?.required) ? e.required : [], o = [...a.filter((e) => e in i), ...Object.keys(i).filter((e) => !a.includes(e))], s = [], c = 0;
	for (let e of o) {
		if (e in t) continue;
		let o = i[e] ?? {}, l = a.includes(e), [u] = Ge(o), d = Je(o), f = qe(e) && !d ? Ye(r, e) : null;
		if (!l) {
			if (n || c >= 6 || !Ke(o) && !d || ![
				"string",
				"boolean",
				"integer",
				"number"
			].includes(u ?? "")) continue;
			c++;
		}
		let p = {
			handle: e,
			type: "text",
			label: o.title ?? (f === "entries" ? y("Page") : f === "users" ? y("Person") : We(e)),
			...l ? { required: !0 } : {},
			...o.default === void 0 ? {} : { default: o.default }
		};
		f ? s.push({
			...p,
			type: f,
			max: 1,
			single: !0
		}) : d ? s.push({
			...p,
			type: "select",
			options: d,
			display: "dropdown"
		}) : u === "boolean" ? s.push({
			...p,
			type: "toggle"
		}) : u === "integer" || u === "number" ? s.push({
			...p,
			type: "number",
			...o.minimum === void 0 ? {} : { min: o.minimum },
			...o.maximum === void 0 ? {} : { max: o.maximum },
			...u === "integer" ? { step: 1 } : {}
		}) : u === "array" && Je(o.items) ? s.push({
			...p,
			type: "select",
			multiple: !0,
			options: Je(o.items)
		}) : u === "array" && Ge(o.items ?? {})[0] === "string" ? s.push({
			...p,
			type: "tags"
		}) : u === "object" || u === "array" ? s.push({
			...p,
			type: "json"
		}) : s.push({
			...p,
			...o.format === "email" ? { type: "email" } : {},
			...o.maxLength && o.maxLength > 2e3 ? { type: "textarea" } : {},
			.../pass(word)?|secret|token|key$/i.test(e) ? { secret: !0 } : {}
		});
	}
	return s;
}
function Qe(e, t) {
	let n = new Set(e.filter((e) => e.single).map((e) => e.handle));
	return Object.fromEntries(Object.entries(t).map(([e, t]) => [e, n.has(e) && Array.isArray(t) ? t[0] : t]));
}
function $e(e, t, n) {
	return n ? {
		...e,
		[n]: t
	} : {
		...e,
		...Object.fromEntries(Object.entries(t).filter(([, e]) => e !== "" && e != null && !(Array.isArray(e) && e.length === 0)))
	};
}
function et(e, t) {
	let n = [];
	for (let r of e) {
		let e = t[r.handle];
		if (e == null || e === "" || r.secret || r.single) continue;
		let i = r.options && typeof r.options == "object" && !Array.isArray(r.options) ? r.options : null;
		i ? n.push((Array.isArray(e) ? e : [e]).map((e) => i[String(e)] ?? String(e)).join(", ")) : r.type === "toggle" ? e === !0 && n.push(r.label) : typeof e == "string" || typeof e == "number" ? n.push(String(e)) : Array.isArray(e) && e.every((e) => typeof e == "string") && n.push(e.join(", "));
	}
	return n.filter((e) => e.length < 80).slice(0, 3).join(" · ");
}
function tt(e, t = {}) {
	return (Array.isArray(e?.required) ? e.required : []).every((e) => e in t);
}
// admin/src/commands.ts
var nt = null;
u(() => {
	nt = null;
});
var rt = () => nt ??= h("workspace/commands").catch(() => (nt = null, [])), it = (e, ...t) => {
	let n = t.filter(Boolean).join(" ").toLowerCase();
	return e.trim().toLowerCase().split(/\s+/).filter(Boolean).every((e) => n.includes(e));
}, at = /* @__PURE__ */ new WeakSet(), ot = (e) => (at.add(e), e);
m.composer.set("workspace-search", {
	trigger: "/",
	label: y("Search"),
	order: 90,
	search: (e) => {
		let t = e.trim();
		if (t.length < 2) return [];
		let n = J();
		return [...n ? [ot({
			id: "ask",
			label: y("Ask {name}", { name: n.label }),
			detail: `“${t}”`,
			icon: "comment",
			group: y("Ask"),
			perform: () => Z.send(t)
		})] : [], ot({
			id: "search",
			label: y("Search for “{query}”", { query: t }),
			icon: "search",
			perform: () => Z.search(t)
		})];
	}
}), m.composer.set("workspace-create", {
	trigger: "/",
	label: y("New"),
	order: 20,
	search: async (e) => {
		let t = (await rt()).find((e) => e.name === "entries/create");
		return t ? o().collections.filter((t) => t.can.create && !t.within && it(e, t.newLabel, t.title, t.singular, t.handle, `new ${t.singular}`, "create")).map((e) => ({
			id: `create:${e.handle}`,
			label: e.newLabel,
			icon: "plus",
			command: {
				ability: "entries/create",
				input: { collection: e.handle },
				schema: t.input,
				required: !0
			}
		})) : [];
	}
}), m.composer.set("workspace-places", {
	trigger: "/",
	label: y("Go To"),
	order: 30,
	search: (e) => {
		let t = o(), n = window.location.pathname.slice(r.base.length) || "/";
		return [...t.nav.filter((e) => !e.home || e.id.startsWith("settings.")).map((e) => ({
			id: `go:${e.id}`,
			icon: e.icon,
			path: e.path,
			label: e.home && e.id.startsWith("settings.") ? y("{name} Settings", { name: t.nav.find((t) => t.id === e.home)?.label ?? e.label }) : e.label
		})), ...t.globals.map((e) => ({
			id: `go:global:${e.handle}`,
			label: e.title,
			icon: e.icon,
			path: `/globals/${e.handle}`
		}))].filter((t) => t.path !== n && it(e, t.label)).slice(0, e ? 8 : 6).map(({ path: e, ...t }) => ({
			...t,
			to: e,
			perform: () => l(e)
		}));
	}
}), m.composer.set("workspace-commands", {
	trigger: "/",
	label: y("Commands"),
	order: 40,
	search: async (e) => {
		let t = await rt();
		return [...m.commands.all().filter((t) => t.when?.() !== !1 && it(e, t.label, ...t.keywords ?? [])).map((e) => ({
			id: `command:${e.id}`,
			label: e.label,
			icon: e.icon ?? "command",
			shortcut: e.shortcut,
			perform: () => void e.perform()
		})), ...o().commands.filter((t) => it(e, t.label, ...t.keywords ?? [])).map((e) => {
			let n = e.ability ? t.find((t) => t.name === e.ability) : void 0;
			return e.ability && (n || !e.path) ? {
				id: `ability:${e.id}`,
				label: e.label,
				icon: e.icon,
				command: {
					ability: e.ability,
					input: e.input ?? {},
					schema: n?.input,
					required: !0
				}
			} : {
				id: `go:${e.id}`,
				label: e.label,
				icon: e.icon,
				perform: () => e.path && l(e.path)
			};
		})];
	}
}), m.composer.set("workspace-settings", {
	trigger: "/",
	label: y("Settings"),
	order: 50,
	search: (e) => o().settings.filter((t) => it(e, t.label, t.namespace, "settings")).slice(0, e ? 8 : 4).map((e) => ({
		id: `settings:${e.namespace}`,
		label: y("{name} Settings", { name: e.label }),
		icon: e.icon,
		command: {
			ability: "settings/update",
			input: { namespace: e.namespace },
			into: "values",
			load: () => h("settings/get", { namespace: e.namespace })
		}
	}))
}), m.composer.set("workspace-abilities", {
	trigger: "/",
	label: y("Abilities"),
	order: 60,
	search: async (e) => e.trim() === "" ? [] : (await rt()).filter((t) => it(e, t.label, t.group, t.name) && Xe(t.input, t.name)).map((e) => ({
		id: `run:${e.name}`,
		label: e.label,
		group: e.group,
		icon: e.icon,
		command: {
			ability: e.name,
			schema: e.input,
			destructive: e.destructive
		}
	}))
});
// admin/src/NewChatRow.tsx
function st({ onNavigate: e }) {
	return /* @__PURE__ */ U(P, {
		label: y("New Chat"),
		icon: "compose",
		onClick: () => {
			e?.(), Z.newChat();
		}
	});
}
// admin/src/context.ts
var ct = 4e4, lt = 12e3, ut = 4e3;
function dt(e, t) {
	if (e.private) return [];
	let n = [];
	if (e.title && n.push({
		id: "page",
		kind: "page",
		label: e.title,
		icon: e.icon ?? "file",
		to: t.contextPath,
		read: e.kind ? async () => ({
			kind: e.kind,
			...e.data?.()
		}) : () => _(lt)
	}), n.push(...e.items ?? []), t.selectedText) {
		let e = t.selectedText.slice(0, ut);
		n.push({
			id: "text",
			kind: "selected_text",
			label: e.replace(/\s+/g, " "),
			icon: "quote",
			read: () => e
		});
	}
	return n.filter((e) => !t.dismissed.includes(e.id));
}
function ft(e, t) {
	let n = t.attached[t.thread ?? "new"] ?? [];
	return [...dt(e, t), ...n.filter((n) => !dt(e, t).some((e) => e.id === n.id))];
}
var pt = (e) => {
	if (e != null && e !== "") try {
		return (typeof e == "string" ? e : JSON.stringify(e)).slice(0, ct);
	} catch {
		return;
	}
}, mt = /* @__PURE__ */ new Map();
async function ht(e) {
	let t = g.get(), n = Z.get(), r = e ?? "new", i = ft(t, n), a = n.skills[r]?.skill;
	Z.set({
		attached: {
			...n.attached,
			[r]: []
		},
		skills: {
			...n.skills,
			[r]: null
		},
		selectedText: ""
	}), await t.flush?.();
	let o = e && mt.get(e) || /* @__PURE__ */ new Map(), s = new Map(o), c = await Promise.all(i.map(async (e) => {
		let t = {
			kind: e.kind,
			label: e.label,
			icon: e.icon,
			to: e.to
		}, n = pt(await Promise.resolve().then(() => e.read?.()).catch(() => void 0));
		return n === void 0 ? t : o.get(e.id) === n ? {
			...t,
			unchanged: !0
		} : (s.set(e.id, n), {
			...t,
			content: n
		});
	}));
	return {
		context: {
			path: i.some((e) => e.id === "page") || t.private ? n.contextPath : void 0,
			items: c,
			skill: a ?? void 0
		},
		carry: (e) => mt.set(e, s)
	};
}
function gt(e) {
	e && mt.delete(e);
}
document.addEventListener("selectionchange", () => {
	let e = document.getSelection(), t = e?.anchorNode, n = t instanceof Element ? t : t?.parentElement;
	if (!e || !n?.closest("[data-cms-screen]")) return;
	let r = e.isCollapsed ? "" : e.toString().trim();
	r !== Z.get().selectedText && Z.set({
		selectedText: r,
		dismissed: Z.get().dismissed.filter((e) => e !== "text")
	});
});
var _t = {
	page: () => y("{brand} sees this page"),
	block: () => y("{brand} sees this block"),
	selected_text: () => y("{brand} sees the text you selected")
}, vt = () => window.matchMedia("(pointer: coarse)").matches;
function yt(e, t, n) {
	let r = /(?:^|\s)@([^\s@]*)$|(?:^|\n)\/([^\n/]*)$/.exec(e.slice(0, t));
	if (!r || r[1] !== void 0 && !n) return null;
	let i = r[1] === void 0 ? "/" : "@", a = r[1] ?? r[2] ?? "";
	return {
		char: i,
		query: a,
		start: t - a.length - 1
	};
}
function bt(e, t) {
	let n = t.trim().toLowerCase();
	if (!n) return 0;
	let r = e.label.trim().toLowerCase();
	return r === n ? 4 : r.startsWith(n) ? 3 : r.split(/[\s\-–—/]+/).some((e) => e.startsWith(n)) ? 2 : +!!r.includes(n);
}
function xt(e) {
	let t = me(m.composer.subscribe, m.composer.version), [n, r] = H([]), [i, a] = H(!1), [o, s] = H(null), c = e?.char, l = e?.query, u = c ? c + (l ?? "") : null;
	return B(() => {
		if (!c) {
			r([]), s(null);
			return;
		}
		let e = !1;
		a(!0);
		let t = m.composer.all().filter((e) => e.trigger === c).sort((e, t) => (e.order ?? 50) - (t.order ?? 50)), n = setTimeout(() => {
			let n = /* @__PURE__ */ new Map(), i = t.length;
			i || (a(!1), s(c + (l ?? "")));
			for (let o of t) Promise.resolve().then(() => o.search(l ?? "")).catch(() => []).then((u) => {
				if (e) return;
				n.set(o.id, u);
				let d = /* @__PURE__ */ new Set(), f = /* @__PURE__ */ new Map();
				for (let e of t) for (let t of n.get(e.id) ?? []) {
					let n = `${t.kind ?? ""}:${t.label.trim().toLowerCase()}`;
					if (d.has(n)) continue;
					d.add(n);
					let r = t.group ?? e.label;
					f.has(r) || f.set(r, {
						source: e,
						label: r,
						options: []
					}), f.get(r).options.push(t);
				}
				r([...f.values()].map((e) => ({
					...e,
					options: e.options.map((e, t) => ({
						option: e,
						i: t,
						rank: bt(e, l ?? "")
					})).sort((e, t) => t.rank - e.rank || e.i - t.i).map(({ option: e }) => e)
				}))), --i === 0 && (a(!1), s(c + (l ?? "")));
			});
		}, l ? 120 : 0);
		return () => {
			e = !0, clearTimeout(n);
		};
	}, [
		c,
		l,
		t
	]), {
		groups: n,
		loading: i,
		settled: !i && u !== null && o === u
	};
}
function St({ onAdd: e }) {
	let t = Q(), n = w(), r = t.thread ?? "new", i = ft(n, t), a = t.skills[r], o = new Set(dt(n, t).map((e) => e.id)), s = n.title && !n.private && t.dismissed.includes("page"), c = (e) => {
		e.id === "text" ? Z.set({ selectedText: "" }) : o.has(e.id) ? Z.set({ dismissed: [...t.dismissed, e.id] }) : Z.set({ attached: {
			...t.attached,
			[r]: (t.attached[r] ?? []).filter((t) => t.id !== e.id)
		} });
	};
	return /* @__PURE__ */ W("div", {
		className: "flex flex-wrap items-center gap-1 px-2 pt-2",
		children: [
			/* @__PURE__ */ U(L, {
				content: y("Add Context"),
				shortcut: "@",
				children: /* @__PURE__ */ U(M, {
					compact: !0,
					"aria-label": y("Add Context"),
					onClick: e,
					className: "cms-thread-chip justify-center !px-0 w-[22px] text-muted hover:text-text",
					children: /* @__PURE__ */ U("span", {
						"aria-hidden": "true",
						className: "text-xs leading-none",
						children: "@"
					})
				})
			}),
			a && /* @__PURE__ */ U(Ct, {
				icon: a.icon ?? "sparkle",
				label: a.label,
				hint: a.detail ?? a.label,
				strong: !0,
				onRemove: () => Z.set({ skills: {
					...t.skills,
					[r]: null
				} })
			}),
			i.map((e) => /* @__PURE__ */ U(Ct, {
				icon: e.icon ?? "file",
				label: e.label,
				hint: (e.kind && _t[e.kind]?.()) ?? e.label,
				strong: !o.has(e.id),
				onRemove: () => c(e)
			}, e.id)),
			s && /* @__PURE__ */ W(M, {
				compact: !0,
				onClick: () => Z.set({ dismissed: t.dismissed.filter((e) => e !== "page") }),
				className: "cms-thread-chip pr-1.5 text-faint hover:text-text",
				children: [/* @__PURE__ */ U(O, {
					name: "plus",
					size: 11
				}), /* @__PURE__ */ U("span", {
					className: "truncate",
					children: n.title
				})]
			})
		]
	});
}
function Ct({ icon: e, label: t, hint: n, strong: r, onRemove: i }) {
	return /* @__PURE__ */ W("span", {
		className: R("cms-thread-chip", r ? "text-text" : "text-muted"),
		children: [/* @__PURE__ */ U(L, {
			content: n,
			children: /* @__PURE__ */ W("span", {
				tabIndex: 0,
				className: "flex min-w-0 items-center gap-1 outline-offset-1",
				children: [/* @__PURE__ */ U(O, {
					name: e,
					size: 11,
					className: "shrink-0"
				}), /* @__PURE__ */ U("span", {
					className: "truncate",
					children: t
				})]
			})
		}), /* @__PURE__ */ U(M, {
			compact: !0,
			"aria-label": y("Remove {name}", { name: t }),
			onClick: i,
			className: "grid size-4 shrink-0 place-items-center rounded-xs text-faint hover:bg-hover hover:text-text",
			children: /* @__PURE__ */ U(O, {
				name: "close",
				size: 10
			})
		})]
	});
}
function wt({ id: e, trigger: t, groups: n, loading: r, active: i, onActive: a, onPick: o }) {
	let s = V(null), c = V(!1);
	pe(() => {
		s.current?.querySelector("[aria-selected=\"true\"]")?.scrollIntoView({ block: "nearest" });
	}, [i]);
	let l = -1;
	return /* @__PURE__ */ W("div", {
		ref: s,
		onMouseMove: () => {
			c.current = !0;
		},
		id: e,
		role: "listbox",
		"aria-label": t.char === "@" ? y("Add Context") : y("Commands"),
		className: "cms-pop absolute inset-x-0 bottom-full z-sticky mb-1.5 max-h-80 overflow-y-auto overscroll-contain p-1",
		children: [n.map(({ source: t, label: n, options: r }) => /* @__PURE__ */ W("div", {
			role: "group",
			"aria-label": n,
			children: [/* @__PURE__ */ U("div", {
				className: "flex h-6 items-center px-2 text-2xs font-medium text-faint",
				children: n
			}), r.map((t) => {
				l++;
				let n = l;
				return /* @__PURE__ */ W("div", {
					id: `${e}-${n}`,
					role: "option",
					"aria-selected": n === i,
					onMouseEnter: () => {
						c.current && a(n);
					},
					onMouseMove: () => {
						n !== i && a(n);
					},
					onMouseDown: (e) => {
						e.preventDefault(), o(t);
					},
					className: R("cms-thread-option flex min-h-8 cursor-default items-center gap-2 rounded-sm px-2 py-1 text-sm", n === i ? "bg-hover text-ink" : "text-text"),
					children: [
						/* @__PURE__ */ U(O, {
							name: t.icon ?? "file",
							size: 14,
							className: "shrink-0 text-muted"
						}),
						/* @__PURE__ */ U("span", {
							className: "shrink-0 truncate",
							children: t.label
						}),
						t.detail && /* @__PURE__ */ U("span", {
							className: "min-w-0 flex-1 truncate text-xs text-faint",
							children: t.detail
						}),
						t.shortcut && /* @__PURE__ */ U("span", {
							className: "ml-auto shrink-0 pl-2 [@media(pointer:coarse)]:hidden",
							children: /* @__PURE__ */ U(A, { keys: t.shortcut })
						})
					]
				}, t.id);
			})]
		}, `${t.id}:${n}`)), n.length === 0 && /* @__PURE__ */ U("div", {
			className: "flex h-8 items-center gap-2 px-2 text-sm text-muted",
			children: r ? /* @__PURE__ */ W(he, { children: [
				/* @__PURE__ */ U(F, { size: 12 }),
				" ",
				y("Looking…")
			] }) : y("No matches")
		})]
	});
}
function Tt({ pending: e, busy: t, onRun: n, onCancel: r }) {
	let i = e.option.command, [a, o] = H(null), [s, c] = H({}), l = i.load ? a ?? [] : Ze(i.schema, i.input ?? {}, i.required, i.ability), [u, d] = H(() => ({
		...Object.fromEntries(l.filter((e) => e.default !== void 0).map((e) => [e.handle, e.default])),
		...e.values
	}));
	B(() => {
		if (!i.load) return;
		let e = !1;
		return i.load().then((t) => {
			e || (o(t.fields), c(t.values ?? {}), d((e) => ({
				...t.values ?? {},
				...e
			})));
		}).catch((t) => !e && h(t instanceof Error ? t.message : String(t))), () => {
			e = !0;
		};
	}, []);
	let [f, p] = H({}), [m, h] = H(null), [g, _] = H(!1), v = fe(), b = async () => {
		if (g || t) return;
		_(!0), h(null);
		let e = Qe(l, u), r = i.load && i.into ? Object.fromEntries(Object.entries(e).filter(([e, t]) => JSON.stringify(t) !== JSON.stringify(s[e]))) : e, a = i.scope ? ae(i.input ?? {}, {
			...i.scope,
			values: r
		}) : $e(i.input ?? {}, r, i.into), o = await n(i.scope && Object.keys(i.input ?? {}).length === 0 ? r : a, et(l, r));
		_(!1), o !== !0 && (p(o.details), h(Object.keys(o.details).some((e) => l.some((t) => t.handle === e)) ? null : o.message));
	};
	return /* @__PURE__ */ W("form", {
		id: v,
		"aria-label": e.option.label,
		onSubmit: (e) => {
			e.preventDefault(), b();
		},
		onKeyDown: (e) => {
			e.key === "Escape" && (e.preventDefault(), e.stopPropagation(), r()), e.key === "Enter" && !e.nativeEvent.isComposing && e.target instanceof HTMLInputElement && (e.preventDefault(), b());
		},
		className: "cms-thread-command px-3 pb-1 pt-2.5",
		children: [
			/* @__PURE__ */ W("div", {
				className: "mb-2 flex items-center gap-1.5 text-sm font-medium text-ink",
				children: [/* @__PURE__ */ U(O, {
					name: e.option.icon ?? "command",
					size: 14,
					className: "text-muted"
				}), /* @__PURE__ */ U("span", {
					className: "min-w-0 truncate",
					children: e.option.label
				})]
			}),
			i.load && !a && !m && /* @__PURE__ */ U("div", {
				className: "grid h-16 place-items-center text-faint",
				children: /* @__PURE__ */ U(F, { size: 14 })
			}),
			l.length > 0 && /* @__PURE__ */ U("div", {
				className: "cms-thread-command-fields -mx-1 max-h-[min(50dvh,440px)] overflow-y-auto overscroll-contain px-1 pb-1",
				children: /* @__PURE__ */ U(D, {
					fields: l.map((e, t) => ({
						autofocus: t === 0,
						...e
					})),
					values: u,
					errors: f,
					onChange: (t, n) => {
						d((e) => ({
							...e,
							[t]: n
						})), p(({ [t]: e, ...n }) => n), Z.command({
							...e,
							values: {
								...e.values,
								[t]: n
							}
						});
					}
				})
			}),
			m && /* @__PURE__ */ U("p", {
				role: "alert",
				className: "m-0 mt-2 text-sm text-danger",
				children: m
			}),
			/* @__PURE__ */ W("div", {
				className: "flex justify-end gap-1.5 pb-1.5 pt-3",
				children: [/* @__PURE__ */ U(T, {
					size: "sm",
					variant: "ghost",
					onClick: r,
					disabled: g,
					children: y("Cancel")
				}), /* @__PURE__ */ U(T, {
					size: "sm",
					type: "submit",
					variant: i.destructive ? "danger" : "primary",
					loading: g,
					disabled: t || !!i.load && !a,
					autoFocus: l.length === 0 && !i.load,
					children: i.confirm ?? (i.load ? y("Save") : y("Run"))
				})]
			})
		]
	});
}
function Et({ placeholder: e, focus: t, busy: n, onSubmit: r, onCommand: i, children: a }) {
	let { drafts: o, thread: s, commands: c, palette: l } = Q(), u = s ?? "new", d = o[u] ?? "", p = c[u] ?? null, m = J() !== null, h = V(null), [g, _] = H(0), [v, y] = H(null), [b, x] = H(0), S = fe(), [C, w] = H(l);
	C !== l && (w(l), _(d.length), y(null));
	let T = p ? null : yt(d, g, m), E = T && T.start !== v ? T : null, { groups: D, loading: O, settled: k } = xt(E), A = D.flatMap((e) => e.options), j = E !== null;
	B(() => {
		rt();
	}, []), B(() => {
		if (!t || p) return;
		let e = requestAnimationFrame(() => h.current?.focus());
		return () => cancelAnimationFrame(e);
	}, [t]);
	let [ee, M] = H(null);
	B(() => {
		x(0), M(null);
	}, [E?.char, E?.query]), B(() => {
		if (ee === null) return;
		let e = A.findIndex((e) => e.id === ee);
		e >= 0 && e !== b && x(e);
	}, [A.map((e) => e.id).join("|")]);
	let N = V(!1);
	B(() => {
		N.current = !1;
	}, [E?.char, E?.query]), B(() => {
		N.current && k && (N.current = !1, A.length > 0 && L(A[Math.min(b, A.length - 1)]));
	}, [k]);
	let P = j ? A[Math.min(b, A.length - 1)] : void 0;
	B(() => {
		P?.to && P.perform && f(P.to);
	}, [P?.to, P?.perform]);
	let F = (e) => {
		x(e), M(A[e]?.id ?? null);
	};
	B(() => {
		T || (y(null), Z.leavePalette());
	}, [T]), B(() => {
		if (!l || !Z.inPalette()) return;
		let e = requestAnimationFrame(() => {
			let e = h.current;
			if (!e) return;
			e.focus();
			let t = e.value;
			e.setSelectionRange(t.lastIndexOf("/") + 1, t.length), _(t.length);
		});
		return () => cancelAnimationFrame(e);
	}, [l]);
	let I = (e, t) => {
		Z.draft(e), _(t), requestAnimationFrame(() => {
			h.current?.focus(), h.current?.setSelectionRange(t, t);
		});
	}, L = (e) => {
		if (!E) return;
		let t = d.slice(E.start + 1 + E.query.length), n = t ? d.slice(0, E.start) : d.slice(0, E.start).replace(/\n$/, "");
		if (Z.inPalette() && (e.perform || e.command || e.skill)) {
			Z.draft(n + t), _(n.length), Z.pickedFromPalette(!!e.perform && !at.has(e)), e.perform ? e.perform() : e.skill ? Z.set({ skills: {
				...Z.get().skills,
				[u]: e
			} }) : ne(e), e.perform && Z.get().mode === "closed" || requestAnimationFrame(() => h.current?.focus());
			return;
		}
		if (e.insert !== void 0) {
			I(n + e.insert + t, n.length + e.insert.length);
			return;
		}
		if (e.command) {
			I(n + t, n.length), ne(e);
			return;
		}
		if (e.perform || e.skill) {
			I(n + t, n.length), e.perform ? e.perform() : Z.set({ skills: {
				...Z.get().skills,
				[u]: e
			} });
			return;
		}
		let r = `@${e.label} `;
		I(n + r + t, n.length + r.length), Z.set({ attached: {
			...Z.get().attached,
			[u]: [...(Z.get().attached[u] ?? []).filter((t) => t.id !== e.id), e]
		} });
	}, ne = (e) => {
		let t = e.command.input ?? {};
		!e.command.load && !e.command.scope && tt(e.command.schema, t) && !e.command.destructive ? i(e, t, !1) : Z.command({
			option: e,
			values: {}
		});
	}, R = () => {
		let e = h.current?.selectionStart ?? d.length, t = e > 0 && !/\s/.test(d[e - 1]) ? " " : "";
		I(`${d.slice(0, e)}${t}@${d.slice(e)}`, e + t.length + 1);
	}, re = (e) => {
		if (!e.nativeEvent.isComposing) {
			if (j && A.length > 0) {
				if (e.key === "ArrowDown" || e.key === "ArrowUp") {
					e.preventDefault(), F((b + (e.key === "ArrowDown" ? 1 : -1) + A.length) % A.length);
					return;
				}
				if (e.key === "Enter" && !e.shiftKey || e.key === "Tab") {
					e.preventDefault(), k ? L(A[Math.min(b, A.length - 1)]) : N.current = !0;
					return;
				}
			}
			if (j && e.key === "Escape") {
				if (e.preventDefault(), !Z.inPalette()) y(E.start);
				else {
					Z.dismissPalette();
					let e = Z.get().drafts[u] ?? "";
					_(e.length), requestAnimationFrame(() => h.current?.setSelectionRange(e.length, e.length));
				}
			} else j && e.key === "Enter" && !e.shiftKey ? (e.preventDefault(), k ? Z.inPalette() || r() : N.current = !0) : e.key === "Enter" && !e.shiftKey && (e.preventDefault(), r());
		}
	}, ie = () => {
		Z.command(null), vt() || requestAnimationFrame(() => h.current?.focus());
	};
	return /* @__PURE__ */ W("div", {
		className: "relative",
		children: [j && /* @__PURE__ */ U(wt, {
			id: S,
			trigger: E,
			groups: D,
			loading: O,
			active: Math.min(b, Math.max(0, A.length - 1)),
			onActive: F,
			onPick: L
		}), /* @__PURE__ */ U("div", {
			className: "cms-thread-composer overflow-hidden rounded-lg border border-border bg-bg transition-colors focus-within:border-border-strong",
			children: p ? /* @__PURE__ */ U(Tt, {
				pending: p,
				busy: n,
				onCancel: ie,
				onRun: async (e, t) => {
					let n = await i(p.option, e, !0, t);
					return n === !0 && ie(), n;
				}
			}, p.option.id) : /* @__PURE__ */ W("form", {
				onSubmit: (e) => {
					e.preventDefault(), r();
				},
				children: [
					m && /* @__PURE__ */ U(St, { onAdd: R }),
					/* @__PURE__ */ U(te, {
						ref: h,
						value: d,
						onChange: (e) => {
							Z.draft(e.target.value), _(e.target.selectionStart);
						},
						onSelect: (e) => _(e.currentTarget.selectionStart),
						onKeyDown: re,
						rows: 2,
						placeholder: e,
						"aria-label": e,
						role: "combobox",
						"aria-autocomplete": "list",
						"aria-expanded": j,
						"aria-controls": j ? S : void 0,
						"aria-activedescendant": j && A.length > 0 ? `${S}-${b}` : void 0,
						className: "cms-thread-input max-h-52 min-h-0 resize-none border-0 bg-transparent px-3 pt-2.5 text-sm shadow-none focus:ring-0 focus-visible:outline-none"
					}),
					a
				]
			})
		})]
	});
}
// admin/src/Rename.tsx
function Dt({ id: e, title: t, onDone: n, className: r }) {
	let [i, a] = H(t), [o, s] = H(!1), c = async () => {
		let r = i.trim();
		if (!r || r === t) return n(null);
		s(!0);
		try {
			await h("threads/rename", {
				id: e,
				title: r
			}), p.invalidateQueries({ queryKey: ["threads/list"] }), n(r);
		} catch (e) {
			oe.error(e), s(!1);
		}
	};
	return /* @__PURE__ */ U("form", {
		className: R("min-w-0 flex-1", r),
		onSubmit: (e) => {
			e.preventDefault(), c();
		},
		onKeyDown: (e) => {
			e.key === "Escape" && (e.preventDefault(), e.stopPropagation(), n(null));
		},
		onBlur: (e) => {
			!o && !e.currentTarget.contains(e.relatedTarget) && c();
		},
		children: /* @__PURE__ */ U(D, {
			bare: !0,
			fields: [{
				handle: "title",
				type: "text",
				label: y("Rename Chat"),
				size: "sm",
				autofocus: !0,
				max: 120
			}],
			values: { title: i },
			disabled: o,
			onChange: (e, t) => a(String(t ?? ""))
		})
	});
}
// admin/src/History.tsx
var Ot = 30;
function kt() {
	let { working: e, thread: t, title: n } = Q(), r = ge({
		queryKey: ["threads/list", "pages"],
		initialPageParam: 0,
		queryFn: ({ pageParam: e }) => h("threads/list", {
			limit: Ot,
			offset: e
		}),
		getNextPageParam: (e, t) => e.length === Ot ? t.length * Ot : void 0
	}), i = r.data?.pages.flat() ?? [], a = t && r.data && !i.some((e) => e.id === t) ? [{
		id: t,
		title: n,
		updatedAt: null
	}, ...i] : i;
	return {
		history: r,
		chats: e?.thread ? [{
			id: e.thread,
			title: e.title,
			updatedAt: a.find((t) => t.id === e.thread)?.updatedAt ?? null
		}, ...a.filter((t) => t.id !== e.thread)] : a
	};
}
function At({ chat: e, remove: t, renaming: n, onRename: r }) {
	let { thread: i, working: a, drafts: o } = Q(), s = a?.thread === e.id, c = !!o[e.id]?.trim();
	return n ? /* @__PURE__ */ U("div", {
		"data-chat-row": e.id,
		className: "px-1 py-0.5",
		children: /* @__PURE__ */ U(Dt, {
			id: e.id,
			title: e.title,
			onDone: (t) => {
				r(!1), t && i === e.id && Z.set({ title: t }), requestAnimationFrame(() => document.querySelector(`[data-chat-row="${e.id}"] .cms-sidebar-row-main`)?.focus());
			}
		})
	}) : /* @__PURE__ */ U("div", {
		"data-chat-row": e.id,
		children: /* @__PURE__ */ U(P, {
			label: e.title || y("New Chat"),
			icon: "comment",
			title: `${e.title} · ${b(e.updatedAt)}`,
			onClick: () => Z.select(e.id),
			active: i === e.id,
			status: s || c ? /* @__PURE__ */ W(he, { children: [s && /* @__PURE__ */ U("span", {
				role: "status",
				"aria-label": y("Working…"),
				children: /* @__PURE__ */ U(F, { size: 12 })
			}), c && /* @__PURE__ */ U("span", { children: y("Draft") })] }) : void 0,
			actions: [{
				label: y("Rename Chat"),
				icon: "edit",
				onSelect: () => r(!0)
			}, {
				label: y("Delete Chat"),
				icon: "trash",
				danger: !0,
				quick: !0,
				disabled: s,
				onSelect: () => t(e)
			}]
		})
	});
}
function jt(e) {
	let { working: t } = Q(), n = V(null), r = x("threads/delete", {
		invalidates: ["threads/list"],
		onSuccess: (e, { id: t }) => {
			Z.deleted(t), oe.success(y("Chat deleted"));
			let r = n.current;
			setTimeout(() => (r ? document.querySelector(`[data-chat-row="${r}"] .cms-sidebar-row-main`) : document.querySelector(".cms-thread-input"))?.focus(), 120);
		},
		onError: oe.error
	});
	return async (i) => {
		if (t?.thread === i.id || r.isPending) return;
		let a = e.findIndex((e) => e.id === i.id);
		n.current = e[a + 1]?.id ?? e[a - 1]?.id ?? null, await re({
			title: y("Delete “{title}”?", { title: i.title || y("New Chat") }),
			description: y("This chat and its messages will be permanently deleted."),
			confirm: y("Delete Chat"),
			danger: !0
		}) && r.mutate({ id: i.id });
	};
}
function Mt() {
	let { history: e, chats: t } = kt(), n = jt(t), { drafts: r, working: i, thread: a, focusList: o } = Q(), [s, c] = H(null), l = V(null);
	B(() => {
		if (!o) return;
		let e = requestAnimationFrame(() => (l.current?.querySelector("[aria-current=\"page\"]") ?? l.current?.querySelector(".cms-sidebar-row-main"))?.focus());
		return () => cancelAnimationFrame(e);
	}, [o]);
	let u = i?.thread === null, d = r.new?.trim(), f = (/* @__PURE__ */ new Date()).setHours(0, 0, 0, 0), p = [
		{
			label: y("Today"),
			from: f
		},
		{
			label: y("Previous 7 Days"),
			from: f - 6048e5
		},
		{
			label: y("Older"),
			from: -Infinity
		}
	].map((e, n, r) => ({
		...e,
		chats: t.filter((t) => {
			let i = t.updatedAt ? new Date(t.updatedAt).getTime() : Date.now();
			return i >= e.from && (n === 0 || i < r[n - 1].from);
		})
	})).filter((e) => e.chats.length > 0), m = V(null);
	return B(() => {
		let t = m.current;
		if (!t) return;
		let n = new IntersectionObserver(([t]) => {
			t.isIntersecting && e.hasNextPage && !e.isFetchingNextPage && e.fetchNextPage();
		}, { rootMargin: "200px" });
		return n.observe(t), () => n.disconnect();
	}, [
		e.hasNextPage,
		e.isFetchingNextPage,
		e.fetchNextPage
	]), /* @__PURE__ */ W("nav", {
		ref: l,
		"aria-label": y("Chats"),
		className: "min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-4 pt-1",
		children: [
			(u || d && a !== null) && /* @__PURE__ */ U(P, {
				label: (u ? i.title : d) || y("New Chat"),
				onClick: () => Z.select(null),
				active: a === null,
				status: u ? /* @__PURE__ */ U("span", {
					role: "status",
					"aria-label": y("Working…"),
					children: /* @__PURE__ */ U(F, { size: 12 })
				}) : y("Draft"),
				actions: [!u && {
					label: y("Discard Draft"),
					icon: "close",
					quick: !0,
					onSelect: () => Z.set({ drafts: {
						...Z.get().drafts,
						new: ""
					} })
				}]
			}),
			p.map((e) => /* @__PURE__ */ W("section", {
				"aria-label": e.label,
				className: "mt-2 first:mt-0",
				children: [/* @__PURE__ */ U("h3", {
					className: "m-0 flex h-7 items-center px-2 text-xs font-medium text-faint",
					children: e.label
				}), /* @__PURE__ */ U("div", {
					className: "space-y-px",
					children: e.chats.map((e) => /* @__PURE__ */ U(At, {
						chat: e,
						remove: (e) => void n(e),
						renaming: s === e.id,
						onRename: (t) => c(t ? e.id : null)
					}, e.id))
				})]
			}, e.label)),
			e.isPending && /* @__PURE__ */ U("div", {
				className: "grid h-24 place-items-center text-faint",
				children: /* @__PURE__ */ U(F, {})
			}),
			e.isError && /* @__PURE__ */ U(N, {
				compact: !0,
				message: y("Couldn’t load your chats"),
				onRetry: () => void e.refetch(),
				retrying: e.isRefetching
			}),
			e.hasNextPage && /* @__PURE__ */ U("div", {
				ref: m,
				className: "grid h-10 place-items-center text-faint",
				children: e.isFetchingNextPage && /* @__PURE__ */ U(F, { size: 14 })
			})
		]
	});
}
function Nt() {
	return /* @__PURE__ */ U(L, {
		content: y("New Chat"),
		children: /* @__PURE__ */ U(k, {
			icon: "plus",
			label: y("New Chat"),
			title: void 0,
			onClick: () => Z.newChat()
		})
	});
}
// admin/src/Markdown.tsx
function Pt({ text: e }) {
	return /* @__PURE__ */ U("div", {
		className: "cms-md space-y-2.5 text-sm leading-[1.6] text-text",
		children: Ft(e)
	});
}
function Ft(e) {
	let t = e.replace(/\r\n/g, "\n").split("\n"), n = [], r = 0;
	for (; r < t.length;) {
		let e = t[r];
		if (!e.trim()) {
			r++;
			continue;
		}
		let i = e.match(/^\s*(```|~~~)\s*([\w-]*)/);
		if (i) {
			let e = [];
			for (r++; r < t.length && !t[r].trimStart().startsWith(i[1]);) e.push(t[r++]);
			r++, n.push(/* @__PURE__ */ U("pre", {
				className: "overflow-x-auto rounded-sm border border-border bg-sunken px-3 py-2 font-mono text-xs leading-relaxed text-text",
				children: /* @__PURE__ */ U("code", { children: e.join("\n") })
			}, n.length));
			continue;
		}
		let a = e.match(/^(#{1,4})\s+(.*)$/);
		if (a) {
			let e = a[1].length <= 2 ? "text-base" : "text-sm";
			n.push(/* @__PURE__ */ U("p", {
				className: `${e} pt-1 font-semibold tracking-[-0.01em] text-ink`,
				children: $(a[2])
			}, n.length)), r++;
			continue;
		}
		if (/^\s*\|.*\|\s*$/.test(e) && /^\s*\|?\s*:?-{2,}/.test(t[r + 1] ?? "")) {
			let i = (e) => e.trim().replace(/^\||\|$/g, "").split("|").map((e) => e.trim()), a = i(e), o = [];
			for (r += 2; r < t.length && /^\s*\|.*\|\s*$/.test(t[r]);) o.push(i(t[r++]));
			n.push(/* @__PURE__ */ U("div", {
				className: "overflow-x-auto rounded-sm border border-border",
				children: /* @__PURE__ */ W("table", {
					className: "w-full text-left text-xs",
					children: [/* @__PURE__ */ U("thead", {
						className: "bg-surface text-muted",
						children: /* @__PURE__ */ U("tr", { children: a.map((e, t) => /* @__PURE__ */ U("th", {
							className: "px-2.5 py-1.5 font-medium",
							children: $(e)
						}, t)) })
					}), /* @__PURE__ */ U("tbody", { children: o.map((e, t) => /* @__PURE__ */ U("tr", {
						className: "border-t border-border",
						children: e.map((e, t) => /* @__PURE__ */ U("td", {
							className: "px-2.5 py-1.5 align-top",
							children: $(e)
						}, t))
					}, t)) })]
				})
			}, n.length));
			continue;
		}
		if (/^\s*>/.test(e)) {
			let e = [];
			for (; r < t.length && /^\s*>/.test(t[r]);) e.push(t[r++].replace(/^\s*>\s?/, ""));
			n.push(/* @__PURE__ */ U("blockquote", {
				className: "border-l-2 border-border-strong pl-3 text-muted",
				children: Ft(e.join("\n"))
			}, n.length));
			continue;
		}
		let o = /^\s*[-*+]\s+/, s = /^\s*\d+[.)]\s+/;
		if (o.test(e) || s.test(e)) {
			let i = s.test(e), a = i ? s : o, c = [];
			for (; r < t.length && (a.test(t[r]) || /^\s{2,}\S/.test(t[r]) && c.length);) a.test(t[r]) ? c.push(t[r].replace(a, "")) : c[c.length - 1] += `\n${t[r].trim()}`, r++;
			let l = i ? "ol" : "ul";
			n.push(/* @__PURE__ */ U(l, {
				className: `${i ? "list-decimal" : "list-disc"} space-y-1 pl-5 marker:text-faint`,
				children: c.map((e, t) => /* @__PURE__ */ U("li", { children: $(e) }, t))
			}, n.length));
			continue;
		}
		let c = [];
		for (; r < t.length && t[r].trim() && !/^(\s*(```|~~~|>|[-*+]\s|\d+[.)]\s)|#{1,4}\s)/.test(t[r]);) c.push(t[r++]);
		c.length === 0 && c.push(t[r++]), n.push(/* @__PURE__ */ U("p", { children: $(c.join("\n")) }, n.length));
	}
	return n;
}
var It = /(`[^`]+`)|(\*\*[^*]+\*\*|__[^_]+__)|(\*[^*\s][^*]*\*|_[^_\s][^_]*_)|(\[[^\]]+\]\([^)\s]+\))|(\n)/g;
function $(e) {
	let t = [], n = 0;
	for (let r of e.matchAll(It)) {
		r.index > n && t.push(e.slice(n, r.index));
		let [i] = r, a = t.length;
		if (r[1]) {
			let e = /* @__PURE__ */ U("code", {
				className: "rounded-xs bg-sunken px-1 py-px font-mono text-xs",
				children: i.slice(1, -1)
			}, a);
			t.push(Lt(i.slice(1, -1)) === null ? e : /* @__PURE__ */ U(Rt, {
				href: i.slice(1, -1),
				children: e
			}, a));
		} else if (r[2]) t.push(/* @__PURE__ */ U("strong", {
			className: "font-semibold text-ink",
			children: $(i.slice(2, -2))
		}, a));
		else if (r[3]) t.push(/* @__PURE__ */ U("em", { children: $(i.slice(1, -1)) }, a));
		else if (r[4]) {
			let [, e, n] = i.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
			t.push(/* @__PURE__ */ U(Rt, {
				href: n,
				children: $(e)
			}, a));
		} else t.push(/* @__PURE__ */ U("br", {}, a));
		n = r.index + i.length;
	}
	return n < e.length && t.push(e.slice(n)), t;
}
function Lt(e) {
	let t = e.trim();
	if (t.startsWith(`${r.base}/`) || t === r.base) return t.slice(r.base.length) || "/";
	if (!/^\/(?!\/)[^\s]*$/.test(t) || t.includes("..")) return null;
	let n = t.split(/[?#]/)[0];
	return [...m.routes.all().map((e) => e.path), ...(o().views ?? []).map((e) => e.path)].filter((e) => e !== "/" && !e.includes("*")).some((e) => c(e, n)) ? t : null;
}
function Rt({ href: e, children: t }) {
	let n = Lt(e), i = n !== null;
	return i || /^(https?:\/\/|\/(?!\/)|mailto:)/i.test(e) ? /* @__PURE__ */ U("a", {
		href: i ? r.base + (n === "/" ? "" : n) : e,
		target: i ? void 0 : "_blank",
		rel: i ? void 0 : "noopener noreferrer",
		className: "text-ink underline decoration-border-strong underline-offset-2 hover:decoration-ink",
		onClick: (e) => {
			!i || e.metaKey || e.ctrlKey || (e.preventDefault(), l(n));
		},
		children: t
	}) : /* @__PURE__ */ U(he, { children: t });
}
// admin/src/transcript.ts
var zt = 0, Bt = () => `local-${++zt}`;
function Vt(e, t, n) {
	for (let r = e.length - 1; r >= 0; r--) {
		let i = e[r];
		if (i.role !== "answer") continue;
		let a = i.parts.findIndex((e) => e.type === "tool" && e.id === t);
		if (a >= 0) {
			let t = i.parts.slice();
			t[a] = {
				...t[a],
				...n
			};
			let o = e.slice();
			return o[r] = {
				...i,
				parts: t
			}, o;
		}
	}
	return e;
}
function Ht(e, t, n) {
	if (t === "tool_result") return Vt(e, n.id, {
		status: n.declined ? "declined" : n.ok ? "ok" : "error",
		...n.output === void 0 ? {} : { output: String(n.output).slice(0, 4e3) },
		...n.input === void 0 ? {} : { input: n.input },
		...n.surface ? { surface: n.surface } : {},
		...n.ability ? { ability: n.ability } : {}
	});
	if (t === "surface_used") return Vt(e, n.id, { used: !0 });
	let r = t === "text" || t === "thinking" ? {
		type: t,
		text: String(n.delta ?? "")
	} : t === "tool" ? {
		type: "tool",
		id: n.id,
		name: n.name,
		label: n.label ?? n.name,
		status: "running",
		...n.ability ? { ability: n.ability } : {}
	} : t === "notice" ? {
		type: "notice",
		tone: n.tone ?? "neutral",
		message: n.message ?? ""
	} : t === "view" ? {
		type: "view",
		view: n.view
	} : t === "surface" ? {
		type: "surface",
		surface: n.surface
	} : t === "approval" ? {
		type: "approval",
		calls: n.calls ?? []
	} : null;
	if (!r) return e;
	let i = e.slice(), a = i[i.length - 1];
	a?.role !== "answer" && (a = {
		id: Bt(),
		role: "answer",
		parts: []
	}, i.push(a));
	let o = a.parts.slice(), s = o[o.length - 1];
	if ((r.type === "text" || r.type === "thinking") && s?.type === r.type ? o[o.length - 1] = {
		...s,
		text: s.text + r.text
	} : o.push(r), i[i.length - 1] = {
		...a,
		parts: o
	}, r.type === "approval") for (let e of r.calls) i = Vt(i, e.id, {
		status: "awaiting",
		input: e.input
	});
	return i;
}
function Ut(e) {
	let t = e.findLast((e) => e.role !== "note");
	if (t?.role !== "answer") return [];
	let n = t.parts.findLast((e) => e.type === "approval");
	return n?.type === "approval" && !n.decided ? n.calls : [];
}
function Wt(e, t = !1, n = []) {
	let r = e.findLastIndex((e) => e.role === "answer"), i = e[r];
	if (i?.role !== "answer") return e;
	let a = i.parts.findLastIndex((e) => e.type === "approval" && !e.decided);
	if (a < 0) return e;
	let o = i.parts[a], s = e.slice();
	s[r] = {
		...i,
		parts: i.parts.map((e, t) => t === a ? {
			...o,
			decided: !0
		} : e)
	};
	for (let e of o.calls) s = Vt(s, e.id, { status: t || !n.includes(e.id) ? "declined" : "running" });
	return s;
}
var Gt = (e) => e.parts.filter((e) => e.type === "text").map((e) => e.text).join("\n\n");
function Kt(e) {
	try {
		let t = JSON.parse(e ?? "");
		return t && typeof t.to == "string" && t.to.startsWith("/") && !t.to.startsWith("//") ? {
			to: t.to,
			label: typeof t.label == "string" ? t.label : t.to
		} : null;
	} catch {
		return null;
	}
}
// admin/src/useThread.ts
function qt(e) {
	Z.get().mode === "full" && Z.set({ mode: "docked" }), l(e), window.matchMedia("(max-width: 767px)").matches && Z.close();
}
function Jt(t, n = 0) {
	let [r, o] = H([]), [c, l] = H(null), [u, d] = H(""), [f, m] = H(!1), [_, v] = H(!1), [b, x] = H(null), S = V(null), C = V(t), w = V(n);
	B(() => {
		if (t === C.current && n === w.current && (r.length || f) || (w.current = n, S.current?.abort(), S.current = null, m(!1), v(!1), C.current = t, o([]), d(""), l(null), x(null), !t)) return;
		let e = !1;
		return v(!0), h("threads/get", { id: t }).then((t) => {
			e || (o(t.turns), d(t.title), l(t.agent), Z.set({ title: t.title }));
		}).catch((n) => {
			e || (n.status === 404 ? Z.deleted(t) : x(n.message));
		}).finally(() => !e && v(!1)), () => {
			e = !0;
		};
	}, [t, n]), B(() => () => S.current?.abort(), []);
	let T = z(async (t, { shown: n, onAccepted: c, form: u = !1 } = {}) => {
		S.current?.abort();
		let f = new AbortController();
		S.current = f, m(!0), x(null);
		let h = {
			thread: C.current,
			title: Z.get().title || String(t.message ?? t.search ?? n?.text ?? y("New Chat"))
		};
		Z.set({ working: h }), n && o((e) => [...e, n]);
		let g = !1, _ = !1, v = null, b = typeof t.message == "string", w = t.edit?.turn, T = b && (!r.some((e) => e.role === "answer" && e.agent) || w !== void 0 && r.find((e) => e.role === "user")?.id === w);
		try {
			t.edit && gt(C.current);
			let e = b ? await ht(C.current) : null;
			if (f.signal.aborted) return {
				message: "",
				details: {}
			};
			await i("workspace/turn", {
				thread: C.current,
				...t,
				...e ? {
					context: e.context,
					agent: Z.get().options[C.current ?? "new"] ?? {}
				} : {}
			}, (t, n) => {
				if (!(f.signal.aborted || S.current !== f)) switch (t) {
					case "thread":
						C.current = n.id, e?.carry(n.id), h = {
							thread: n.id,
							title: n.title
						}, Z.set({ working: h }), d(n.title), Z.created(n.id, n.title), p.invalidateQueries({ queryKey: ["threads/list"] });
						break;
					case "turn": {
						let e = n.turn;
						e.role === "user" ? (_ = !0, o((t) => {
							let n = e.replaces ? t.findIndex((t) => t.id === e.replaces) : t.findLastIndex((e) => e.role === "user" && e.pending);
							return n < 0 ? [...t, e] : [
								...t.slice(0, n),
								e,
								...e.replaces ? [] : t.slice(n + 1)
							];
						}), e.replaces && c?.()) : o((t) => [...t, e]);
						break;
					}
					case "error":
						v = {
							message: n.message,
							details: n.details ?? {}
						};
						break;
					case "done":
						d(n.thread.title), l(n.agent ?? null), Z.set({ title: n.thread.title });
						break;
					default:
						if (t === "tool_result" && n.ok && n.ability === "admin/open") {
							let e = Kt(n.output);
							e && qt(e.to);
						}
						t === "tool_result" && n.mutated && (g = !0, p.invalidateQueries(), a.emit("content.changed")), o((e) => Ht(e, t, n));
				}
			}, f.signal);
		} catch (t) {
			f.signal.aborted || (v = {
				message: t instanceof e || t instanceof Error ? t.message : y("Something went wrong."),
				details: t instanceof e ? t.details : {}
			});
		} finally {
			if (v && !_ && o((e) => e.filter((e) => !(e.role === "user" && e.pending))), t.command && !v && (g = !0, p.invalidateQueries(), a.emit("content.changed")), g) try {
				await s();
			} catch {}
			Z.get().working === h && Z.set({ working: null }), S.current === f && (S.current = null, m(!1)), p.invalidateQueries({ queryKey: ["threads/list"] }), T && C.current && _ && J() && E(C.current);
		}
		return v && !(u && Object.keys(v.details).length) && x(v.message), v ?? !0;
	}, [r]), E = async (e) => {
		try {
			let { title: t } = await h("threads/rename", { id: e });
			C.current === e && (d(t), Z.set({ title: t })), p.invalidateQueries({ queryKey: ["threads/list"] });
		} catch {}
	}, D = (e, t, n = {}) => ({
		id: Bt(),
		role: "user",
		kind: e,
		text: t,
		pending: !0,
		...n
	}), O = z((e) => {
		let t = e.trim();
		if (!t) return;
		o((e) => Wt(e, !0));
		let n = Z.get(), r = n.skills[C.current ?? "new"], i = J() ? [...ft(g.get(), n).map((e) => ({
			label: e.label,
			...e.kind ? { kind: e.kind } : {},
			...e.icon ? { icon: e.icon } : {},
			...e.to && /^\/[A-Za-z0-9/_.-]{0,199}$/.test(e.to) ? { to: e.to } : {}
		})), ...r ? [{
			kind: "skill",
			label: r.label,
			...r.icon ? { icon: r.icon } : {}
		}] : []] : [];
		T(J() ? { message: t } : { search: t }, { shown: D(J() ? "message" : "search", t, i.length ? { attached: i } : {}) });
	}, [T]), k = z((e) => {
		let t = e.trim();
		t && (o((e) => Wt(e, !0)), T({ search: t }, { shown: D("search", t) }));
	}, [T]), A = z((e, t, n, r = !1, i) => T({ command: {
		ability: e,
		input: t,
		label: n,
		...i ? { detail: i } : {}
	} }, {
		shown: D("command", n, { command: {
			ability: e,
			label: n,
			input: t,
			...i ? { detail: i } : {}
		} }),
		form: r
	}), [T]), j = z(async (e, t, n) => {
		if (S.current || _ || !C.current || e.pending || !t.trim()) return !1;
		let r = J() && e.kind === "message" ? { message: t.trim() } : { search: t.trim() };
		return await T({
			...r,
			edit: {
				turn: e.id,
				original: e.text
			}
		}, { onAccepted: n }) === !0;
	}, [_, T]), ee = z((e) => {
		o((t) => Wt(t, !1, e)), T({ approve: e });
	}, [T]), M = z(() => {
		S.current?.abort(), S.current = null, m(!1), Z.set({ working: null }), o((e) => [...e.filter((e) => !(e.role === "user" && e.pending)), {
			id: Bt(),
			role: "note",
			text: y("Stopped. The step in progress still finishes on the server."),
			tone: "neutral"
		}]);
	}, []), N = z((e, t) => {
		if (S.current || Ut(r).length || !C.current || _) return;
		let n = r.flatMap((e) => e.role === "answer" ? e.parts : []).find((t) => t.type === "tool" && t.id === e);
		n?.type === "tool" && n.surface && !n.used && T({ action: {
			tool: e,
			...t
		} }, { shown: D("action", y("Selected an action in “{title}”.", { title: n.surface.title })) });
	}, [
		r,
		_,
		T
	]);
	return {
		renamed: z((e) => {
			d(e), Z.set({ title: e });
		}, []),
		turns: r,
		awaiting: Ut(r),
		state: c,
		title: u,
		busy: f,
		loading: _,
		error: b,
		send: O,
		search: k,
		command: A,
		edit: j,
		decide: ee,
		stop: M,
		interact: N,
		dismissError: () => x(null)
	};
}
// admin/src/Panel.tsx
var Yt = ue({}), Xt = window.matchMedia("(min-width: 1024px)"), Zt = () => me((e) => (Xt.addEventListener("change", e), () => Xt.removeEventListener("change", e)), () => Xt.matches);
function Qt() {
	ce("mod+j", y("Chat"));
	let { path: e } = S(), { mode: t, title: n } = Q(), r = Ve(), i = Ee(e);
	return pe(() => {
		let t = Z.get();
		i === void 0 ? (e !== t.contextPath && Z.set({
			contextPath: e,
			dismissed: [],
			selectedText: ""
		}), t.mode === "full" && Z.set({ mode: "docked" })) : Z.set({
			mode: "full",
			history: !1,
			...t.thread === i ? {} : {
				thread: i,
				prompt: null
			}
		});
	}, [e, i]), /* @__PURE__ */ U(E, {
		open: t !== "closed",
		full: t === "full",
		floating: r.chosen || r.required,
		label: n || y("New Chat"),
		children: /* @__PURE__ */ U($t, {
			open: t !== "closed",
			full: t === "full"
		})
	});
}
function $t({ open: t, full: n }) {
	let { thread: r, fresh: i, prompt: a, searching: o, drafts: s, options: c, focus: u, history: f, skills: p, commands: h } = Q();
	C(), me(m.panels.subscribe, m.panels.version);
	let g = Ve(), _ = Zt(), v = me((e) => {
		let t = window.matchMedia("(min-width: 768px)");
		return t.addEventListener("change", e), () => t.removeEventListener("change", e);
	}, () => window.matchMedia("(min-width: 768px)").matches), b = n && _, S = Jt(r, i), w = J(), E = Oe() === "ai" && !Ae() ? je() : null;
	B(() => Z.set({ awaiting: S.awaiting.length > 0 }), [S.awaiting.length]);
	let D = x("threads/delete", {
		invalidates: ["threads/list"],
		onSuccess: (e, { id: t }) => {
			Z.deleted(t), oe.success(y("Chat deleted"));
		},
		onError: oe.error
	}), O = r ?? "new", A = s[O] ?? "", [M, N] = H(0), [P, I] = H(null), [te, ne] = H(!1);
	B(() => ne(!1), [r]);
	let ie = V(null), se = V(!0);
	B(() => {
		!t || !a || S.busy || S.loading || D.isPending || P !== null || (Z.set({
			prompt: null,
			searching: !1
		}), o ? S.search(a) : S.send(a));
	}, [
		t,
		a,
		o,
		S,
		D.isPending,
		P
	]);
	let ce = V(u);
	B(() => {
		se.current = !0, I(null);
		let e = ce.current !== u;
		ce.current = u, t && (e || !vt()) && N((e) => e + 1);
	}, [
		r,
		t,
		u
	]), pe(() => {
		let e = ie.current;
		t && e && se.current && (e.scrollTop = e.scrollHeight);
	});
	let le = p[O], ue = !!A.trim() || !!le, z = S.busy || S.loading || D.isPending || P !== null, de = () => {
		!ue || z || E || (se.current = !0, S.send(A.trim() || le.label), Z.draft(""));
	}, fe = (e, t, n, r) => (se.current = !0, S.command(e.command.ability, t, e.label, n, r)), ge = async (t, n, r) => {
		se.current = !0;
		let i = await S.command(t, n, r.label, !1);
		if (i !== !0) throw new e(i.message, "invalid_input", 422, i.details);
		return i;
	}, _e = (e, t) => {
		let n = ae(e.form, t);
		Z.command({
			values: {},
			option: {
				id: `ask:${e.ability}:${Date.now()}`,
				label: n.title,
				icon: e.icon,
				command: {
					ability: e.ability,
					input: e.input ?? {},
					scope: t,
					confirm: n.confirm ?? e.label,
					load: async () => ({
						fields: n.fields,
						values: n.values ?? {}
					})
				}
			}
		});
	}, ve = /* @__PURE__ */ new Map();
	for (let e of S.turns) if (e.role === "answer") for (let t of e.parts) t.type === "tool" && t.surface && t.status === "ok" && ve.set(t.surface.id, t.id);
	let ye = {
		disabled: S.busy || S.loading || S.awaiting.length > 0 || P !== null,
		onAction: S.interact,
		surfaces: ve
	}, be = async () => {
		!r || S.busy || S.loading || D.isPending || await re({
			title: y("Delete “{title}”?", { title: S.title || y("New Chat") }),
			description: y("This chat and its messages will be permanently deleted."),
			confirm: y("Delete Chat"),
			danger: !0
		}) && D.mutate({ id: r });
	}, xe = !S.loading && !S.turns.length, G = S.title || y("Chat"), K = f && !b, q = {
		thread: r,
		agent: w,
		state: S.state,
		options: c[O] ?? {},
		setOption: Z.option,
		busy: S.busy,
		loading: S.loading
	}, Se = d("workspace.composer", q), Ce = (e) => {
		e.key !== "Escape" || e.defaultPrevented || document.querySelector("[role=\"dialog\"], [role=\"alertdialog\"], [role=\"menu\"], [role=\"listbox\"]") || (K ? Z.set({ history: !1 }) : n ? Z.minimize() : Z.close());
	}, we = !v || n ? [] : [...g.required ? [] : [{
		label: g.chosen ? y("Dock Beside the Page") : y("Detach"),
		icon: g.chosen ? "sidebar" : "detach",
		onSelect: () => Z.set({ detached: !g.chosen })
	}], {
		label: y("Full Size"),
		icon: "maximize",
		onSelect: () => Z.maximize()
	}], Te = !r || K ? [] : [{
		label: y("Rename Chat"),
		icon: "edit",
		disabled: S.loading,
		onSelect: () => ne(!0)
	}, {
		label: y("Delete Chat"),
		icon: "trash",
		danger: !0,
		disabled: S.busy || S.loading || D.isPending,
		onSelect: be
	}], Ee = [
		...we,
		...we.length && Te.length ? [{
			label: "",
			separator: !0
		}] : [],
		...Te
	];
	return /* @__PURE__ */ W("div", {
		className: "cms-thread flex h-full min-h-0",
		"data-full": n || void 0,
		onKeyDown: Ce,
		children: [b && /* @__PURE__ */ W("div", {
			className: "flex w-[260px] shrink-0 flex-col border-r border-border",
			children: [/* @__PURE__ */ W("div", {
				className: "flex h-12 shrink-0 items-center justify-between pl-[calc(1rem+var(--cms-sidebar-toggle,0px))] pr-2",
				children: [/* @__PURE__ */ U("h2", {
					className: "m-0 text-sm font-semibold text-ink",
					children: y("Chats")
				}), /* @__PURE__ */ U(Nt, {})]
			}), /* @__PURE__ */ U(Mt, {})]
		}), /* @__PURE__ */ W("section", {
			"aria-label": G,
			"data-empty": n && xe || void 0,
			className: "cms-thread-page relative flex min-w-0 flex-1 flex-col",
			children: [/* @__PURE__ */ W("header", {
				"data-dock-drag": !0,
				className: R("flex h-12 shrink-0 items-center gap-0.5 border-b border-border pr-2", n && !b ? "pl-[calc(0.75rem+var(--cms-sidebar-toggle,0px))]" : "pl-3"),
				children: [
					K && /* @__PURE__ */ U(L, {
						content: y("Back to Chat"),
						side: "bottom",
						children: /* @__PURE__ */ U(k, {
							icon: "arrow-left",
							label: y("Back to Chat"),
							title: void 0,
							className: "-ml-1 mr-0.5",
							onClick: () => Z.set({ history: !1 })
						})
					}),
					te && r && !K ? /* @__PURE__ */ U(Dt, {
						id: r,
						title: G,
						onDone: (e) => {
							ne(!1), e && S.renamed(e);
						}
					}) : /* @__PURE__ */ U("h2", {
						className: "m-0 min-w-0 flex-1 truncate text-sm font-medium text-ink",
						children: K ? y("Chats") : G
					}),
					!b && (r || !xe || K) && /* @__PURE__ */ U(Nt, {}),
					!b && r && !K && /* @__PURE__ */ U(L, {
						content: y("All Chats"),
						side: "bottom",
						children: /* @__PURE__ */ U(k, {
							icon: "history",
							label: y("All Chats"),
							title: void 0,
							onClick: () => Z.set({
								history: !0,
								focusList: (Z.get().focusList ?? 0) + 1
							})
						})
					}),
					Ee.length > 0 && /* @__PURE__ */ U(j, {
						trigger: /* @__PURE__ */ U(k, {
							icon: "more",
							label: y("Chat Actions"),
							disabled: D.isPending
						}),
						items: Ee
					}),
					n && /* @__PURE__ */ U(L, {
						content: y("Back to the Page"),
						side: "bottom",
						children: /* @__PURE__ */ U(k, {
							icon: "minimize",
							label: y("Back to the Page"),
							title: void 0,
							onClick: () => Z.minimize()
						})
					}),
					!n && /* @__PURE__ */ U(L, {
						content: y("Close"),
						shortcut: "mod+j",
						side: "bottom",
						children: /* @__PURE__ */ U(k, {
							icon: "close",
							label: y("Close"),
							title: void 0,
							onClick: () => Z.close()
						})
					})
				]
			}), K ? /* @__PURE__ */ U(Mt, {}) : /* @__PURE__ */ W(he, { children: [
				xe && !b && /* @__PURE__ */ U(Mt, {}),
				/* @__PURE__ */ U("div", {
					ref: ie,
					onScroll: (e) => {
						let t = e.currentTarget;
						se.current = t.scrollHeight - t.scrollTop - t.clientHeight < 48;
					},
					className: R("cms-thread-scroll min-h-0 overflow-y-auto overscroll-contain", xe && !b ? "shrink-0" : "flex-1"),
					children: S.loading ? /* @__PURE__ */ U("div", {
						className: "grid h-full place-items-center text-faint",
						children: /* @__PURE__ */ U(F, {})
					}) : S.turns.length === 0 ? /* @__PURE__ */ U(tn, { asking: !!w || !!E }) : /* @__PURE__ */ U(Yt.Provider, {
						value: {
							run: ge,
							ask: _e
						},
						children: /* @__PURE__ */ W("div", {
							className: "cms-thread-turns cms-thread-width space-y-6 py-5",
							children: [S.turns.map((e, t) => /* @__PURE__ */ U(nn, {
								turn: e,
								...ye,
								editing: P === t,
								onEditingChange: (e) => {
									Z.get().thread === r && I((n) => e ? t : n === t ? null : n);
								},
								editingDisabled: S.busy || S.loading || D.isPending,
								onEdit: S.edit
							}, `${r}:${e.id}`)), S.busy && /* @__PURE__ */ U(_n, { turns: S.turns })]
						})
					})
				}),
				S.error && /* @__PURE__ */ U("div", {
					className: "cms-thread-width w-full shrink-0 pb-2",
					children: /* @__PURE__ */ U(ee, {
						tone: "danger",
						onDismiss: S.dismissError,
						children: S.error
					})
				}),
				E && /* @__PURE__ */ U("div", {
					className: "cms-thread-width w-full shrink-0 pb-2",
					children: /* @__PURE__ */ U(ee, {
						tone: "info",
						icon: "sparkle",
						title: y("{name} isn’t set up yet", { name: E.label }),
						action: E.to ? /* @__PURE__ */ U(T, {
							size: "sm",
							onClick: () => l(E.to),
							children: y("Set Up")
						}) : /* @__PURE__ */ U(T, {
							size: "sm",
							variant: "secondary",
							onClick: () => ke("local"),
							children: y("Use Local")
						}),
						children: E.to ? null : y("Ask an administrator to set it up.")
					})
				}),
				S.awaiting.length > 0 && P === null && /* @__PURE__ */ U(hn, {
					calls: S.awaiting,
					onDecide: S.decide
				}),
				/* @__PURE__ */ U("div", {
					className: "cms-thread-footer cms-thread-width w-full shrink-0",
					children: /* @__PURE__ */ U(Et, {
						placeholder: S.awaiting.length ? y("Or say what to do instead…") : y(w || E ? "Ask anything, or / for a command" : "Search, or / for a command"),
						focus: M,
						busy: z,
						onSubmit: de,
						onCommand: fe,
						children: /* @__PURE__ */ W("div", {
							className: "flex items-center gap-2 px-2 pb-2",
							children: [/* @__PURE__ */ W("div", {
								className: "flex min-w-0 flex-1 items-center",
								children: [/* @__PURE__ */ U(en, {}), Se.map(({ id: e, component: t }) => /* @__PURE__ */ U(t, { ...q }, e))]
							}), S.busy && w ? /* @__PURE__ */ U(k, {
								icon: "stop",
								label: y("Stop"),
								variant: "secondary",
								onClick: S.stop
							}) : /* @__PURE__ */ U(k, {
								icon: "arrow-up",
								label: y(w ? "Send" : "Search"),
								variant: "primary",
								onClick: de,
								disabled: !ue || z || !!E || !!h[O]
							})]
						})
					})
				})
			] })]
		})]
	});
}
function en() {
	Q();
	let e = Ae() ?? je(), t = !e || Oe() === "local", n = /* @__PURE__ */ W("span", {
		className: "flex items-center gap-1",
		children: [/* @__PURE__ */ U(O, {
			name: t ? "desktop" : "sparkle",
			size: 12,
			className: "shrink-0"
		}), y(t ? "Local search" : "Assistant")]
	});
	return e ? /* @__PURE__ */ U(j, {
		side: "top",
		align: "start",
		className: "w-48",
		trigger: /* @__PURE__ */ W(T, {
			variant: "ghost",
			"data-mode": t ? "local" : "ai",
			"aria-label": y("Mode: {name}", { name: y(t ? "Local search" : "Assistant") }),
			className: R("shrink-0 !gap-1 !pl-2 !pr-1.5 !text-xs !font-normal hover:!text-text data-[popup-open]:bg-hover data-[popup-open]:!text-text", t ? "!text-muted" : "!text-text"),
			children: [n, /* @__PURE__ */ U(O, {
				name: "chevron-down",
				size: 12,
				className: "shrink-0 text-faint"
			})]
		}),
		items: [
			{
				label: y("Mode"),
				heading: !0
			},
			{
				label: y("Assistant"),
				icon: "sparkle",
				checked: !t,
				onSelect: () => ke("ai")
			},
			{
				label: y("Local search"),
				icon: "desktop",
				checked: t,
				onSelect: () => ke("local")
			}
		]
	}) : /* @__PURE__ */ U(L, {
		content: y("Searches and runs commands on this site"),
		children: /* @__PURE__ */ U("span", {
			tabIndex: 0,
			"data-mode": "local",
			className: "flex h-7 shrink-0 items-center rounded-sm px-2 text-xs text-muted outline-offset-1",
			children: n
		})
	});
}
function tn({ asking: e }) {
	return /* @__PURE__ */ U("div", {
		className: "cms-thread-welcome cms-thread-width flex min-h-full flex-col justify-end pb-3 pt-2",
		children: /* @__PURE__ */ U("h2", {
			className: "cms-thread-greeting m-0 font-semibold tracking-[-0.02em] text-ink",
			children: y(e ? "What should we work on?" : "What are you looking for?")
		})
	});
}
function nn({ turn: e, editing: t, onEditingChange: n, editingDisabled: r, onEdit: i, ...a }) {
	return e.role === "note" ? /* @__PURE__ */ W("p", {
		className: R("m-0 flex items-center gap-1.5 text-xs", e.tone === "warning" ? "text-warning" : "text-faint"),
		children: [
			/* @__PURE__ */ U(O, {
				name: e.tone === "warning" ? "warning" : "info",
				size: 13
			}),
			" ",
			e.text
		]
	}) : e.role === "user" ? /* @__PURE__ */ U(rn, {
		turn: e,
		editing: t,
		onEditingChange: n,
		editingDisabled: r,
		onEdit: i
	}) : /* @__PURE__ */ U(sn, {
		turn: e,
		...a
	});
}
function rn({ turn: e, editing: t, onEditingChange: n, editingDisabled: r, onEdit: i }) {
	let [a, o] = H(""), s = V(null), c = () => {
		n(!1), requestAnimationFrame(() => s.current?.focus());
	}, l = async () => {
		!r && a.trim() && a.trim() !== e.text && await i(e, a, c);
	};
	if (e.kind === "action") return /* @__PURE__ */ U("p", {
		className: "m-0 text-right text-xs text-faint",
		children: e.text
	});
	let u = !e.pending && (e.kind === "message" || e.kind === "search");
	return /* @__PURE__ */ W("div", {
		className: "cms-thread-message flex flex-col items-end gap-1",
		children: [
			e.attached && e.attached.length > 0 && !t && /* @__PURE__ */ U(cn, { items: e.attached }),
			t ? /* @__PURE__ */ W("form", {
				className: "cms-thread-message-editor w-full rounded-xl border border-border-strong bg-surface p-3",
				onSubmit: (e) => {
					e.preventDefault(), l();
				},
				children: [/* @__PURE__ */ U(te, {
					autoFocus: !0,
					"aria-label": y("Edit message"),
					value: a,
					onChange: (e) => o(e.target.value),
					maxLength: 2e4,
					disabled: r,
					rows: 2,
					className: "max-h-52 resize-none",
					onKeyDown: (e) => {
						e.nativeEvent.isComposing || (e.key === "Escape" && (e.preventDefault(), c()), e.key === "Enter" && !e.shiftKey && (e.preventDefault(), l()));
					}
				}), /* @__PURE__ */ W("div", {
					className: "mt-2 flex justify-end gap-2",
					children: [/* @__PURE__ */ U(T, {
						size: "sm",
						variant: "ghost",
						disabled: r,
						onClick: c,
						children: y("Cancel")
					}), /* @__PURE__ */ U(T, {
						type: "submit",
						size: "sm",
						variant: "primary",
						disabled: r || !a.trim() || a.trim() === e.text,
						children: y("Save & Send")
					})]
				})]
			}) : e.kind === "command" ? /* @__PURE__ */ W("div", {
				className: "cms-thread-bubble flex max-w-[85%] items-baseline gap-1.5 rounded-xl px-3.5 py-2 text-sm text-text",
				children: [
					/* @__PURE__ */ U("span", {
						className: "shrink-0 font-mono text-xs text-faint",
						children: "/"
					}),
					/* @__PURE__ */ U("span", {
						className: "shrink-0 font-medium",
						children: e.text
					}),
					(e.command?.detail ?? on(e)) && /* @__PURE__ */ U("span", {
						className: "min-w-0 truncate text-muted",
						children: e.command?.detail ?? on(e)
					})
				]
			}) : /* @__PURE__ */ W("div", {
				className: "cms-thread-bubble max-w-[85%] whitespace-pre-wrap break-words rounded-xl px-3.5 py-2 text-sm text-text",
				children: [e.kind === "search" && /* @__PURE__ */ U(O, {
					name: "search",
					size: 13,
					className: "-mt-0.5 mr-1.5 inline-block text-faint"
				}), e.text]
			}),
			!t && /* @__PURE__ */ W("div", {
				className: "cms-thread-message-actions flex items-center gap-0.5",
				children: [e.kind !== "command" && /* @__PURE__ */ U(ln, { text: e.text }), u && /* @__PURE__ */ U(L, {
					content: y("Edit message"),
					children: /* @__PURE__ */ U(k, {
						ref: s,
						icon: "edit",
						label: y("Edit message"),
						title: void 0,
						disabled: r,
						onClick: () => {
							o(e.text), n(!0);
						}
					})
				})]
			})
		]
	});
}
var an = /* @__PURE__ */ new Set([
	"collection",
	"namespace",
	"handle",
	"id",
	"entry",
	"locale",
	"parentId",
	"status"
]);
function on(e) {
	return Object.entries(e.command?.input ?? {}).filter(([e]) => !an.has(e)).map(([, e]) => e).filter((e) => typeof e == "string" && e.length > 0 && e.length < 80 && !/^[0-9a-hjkmnp-tv-z]{26}$/i.test(e) || typeof e == "number").slice(0, 3).join(" · ");
}
function sn({ turn: e, ...t }) {
	let n = Gt(e);
	return /* @__PURE__ */ W("div", {
		className: "cms-thread-message space-y-2",
		children: [e.parts.map((e, n) => /* @__PURE__ */ U(un, {
			part: e,
			...t
		}, e.type === "tool" ? e.id : n)), n.trim() && /* @__PURE__ */ U("div", {
			className: "cms-thread-message-actions flex items-center",
			children: /* @__PURE__ */ U(ln, { text: n })
		})]
	});
}
function cn({ items: e }) {
	return /* @__PURE__ */ U("div", {
		className: "flex max-w-[85%] flex-wrap justify-end gap-x-2 gap-y-0.5",
		children: e.map((e, n) => {
			let r = /* @__PURE__ */ W(he, { children: [/* @__PURE__ */ U(O, {
				name: e.icon ?? "file",
				size: 11,
				className: "shrink-0"
			}), /* @__PURE__ */ U("span", {
				className: "truncate",
				children: e.label
			})] }), i = "flex min-w-0 max-w-full items-center gap-1 rounded-xs text-xs text-faint no-underline";
			return e.to ? /* @__PURE__ */ U(t, {
				to: e.to,
				className: R(i, "hover:text-muted"),
				children: r
			}, n) : /* @__PURE__ */ U("span", {
				className: i,
				children: r
			}, n);
		})
	});
}
function ln({ text: e }) {
	let [t, n] = H(!1);
	B(() => {
		if (!t) return;
		let e = window.setTimeout(() => n(!1), 2e3);
		return () => window.clearTimeout(e);
	}, [t]);
	let r = y(t ? "Copied" : "Copy message");
	return /* @__PURE__ */ W(he, { children: [/* @__PURE__ */ U(L, {
		content: r,
		children: /* @__PURE__ */ U(k, {
			icon: t ? "check" : "copy",
			label: r,
			title: void 0,
			onClick: async () => {
				await ie(e, { failed: y("Could not copy the message. Try again.") }) && n(!0);
			}
		})
	}), /* @__PURE__ */ U("span", {
		role: "status",
		className: "sr-only",
		children: t ? y("Message copied") : ""
	})] });
}
function un({ part: e, disabled: t, onAction: r, surfaces: i }) {
	let { run: a, ask: o } = de(Yt);
	if (e.type === "text") return /* @__PURE__ */ U(Pt, { text: e.text });
	if (e.type === "thinking") return /* @__PURE__ */ U(dn, { text: e.text });
	if (e.type === "view") return /* @__PURE__ */ U("div", {
		className: "cms-thread-view min-w-0",
		children: /* @__PURE__ */ U(ne, {
			root: e.view,
			embedded: !0,
			run: a,
			ask: o
		})
	});
	if (e.type === "surface") return /* @__PURE__ */ U(I, {
		document: e.surface,
		disabled: !0
	});
	if (e.type === "notice") return /* @__PURE__ */ W("p", {
		className: R("m-0 flex items-center gap-1.5 text-xs", e.tone === "warning" || e.tone === "danger" ? "text-warning" : "text-faint"),
		children: [
			/* @__PURE__ */ U(O, {
				name: e.tone === "warning" || e.tone === "danger" ? "warning" : "info",
				size: 13
			}),
			" ",
			e.message
		]
	});
	if (e.type === "approval") return null;
	if (e.ability === "admin/open" && e.status === "ok") {
		let t = Kt(e.output);
		if (t) return /* @__PURE__ */ W("p", {
			className: "m-0 flex min-h-8 items-center gap-1.5 text-xs text-faint",
			children: [
				/* @__PURE__ */ U(O, {
					name: "arrow-right",
					size: 13,
					className: "shrink-0"
				}),
				/* @__PURE__ */ U("span", {
					className: "shrink-0",
					children: y("Opened")
				}),
				/* @__PURE__ */ U("a", {
					href: n(t.to),
					onClick: (e) => {
						e.metaKey || e.ctrlKey || (e.preventDefault(), qt(t.to));
					},
					className: "min-w-0 truncate text-muted underline decoration-border-strong underline-offset-2 hover:text-text",
					children: t.label
				})
			]
		});
	}
	return e.surface && e.status === "ok" ? i.get(e.surface.id) === e.id ? /* @__PURE__ */ U(I, {
		document: e.surface,
		disabled: t || e.used,
		onAction: (t) => r(e.id, t)
	}) : null : /* @__PURE__ */ U(pn, { part: e });
}
function dn({ text: e }) {
	let [t, n] = H(!1);
	return /* @__PURE__ */ W("div", { children: [/* @__PURE__ */ W(T, {
		variant: "ghost",
		size: "xs",
		onClick: () => n(!t),
		className: "-ml-1.5 !px-1.5 !font-normal !text-faint hover:!text-muted",
		"aria-expanded": t,
		children: [
			/* @__PURE__ */ U(O, {
				name: t ? "chevron-down" : "chevron-right",
				size: 11
			}),
			" ",
			y("Thought Process")
		]
	}), t && /* @__PURE__ */ U("p", {
		className: "m-0 mt-1.5 whitespace-pre-wrap border-l border-border pl-3 text-xs leading-relaxed text-muted",
		children: e
	})] });
}
var fn = {
	ok: "check",
	error: "x-circle",
	declined: "minus",
	awaiting: "pause"
};
function pn({ part: e }) {
	let [t, n] = H(!1), r = vn(e.input) || bn(e.input);
	return /* @__PURE__ */ W("div", {
		className: "rounded-sm border border-border",
		children: [/* @__PURE__ */ W(T, {
			variant: "ghost",
			size: "md",
			onClick: () => n(!t),
			"aria-expanded": t,
			className: "w-full !justify-start !gap-2 !rounded-none !px-2.5 !text-xs !font-normal",
			children: [
				e.status === "running" ? /* @__PURE__ */ U(F, { size: 12 }) : /* @__PURE__ */ U(O, {
					name: fn[e.status],
					size: 13,
					className: R(e.status === "ok" ? "text-success" : e.status === "error" ? "text-danger" : "text-faint")
				}),
				/* @__PURE__ */ U("span", {
					className: R("shrink-0 font-medium", e.status === "declined" ? "text-faint line-through" : "text-text"),
					children: e.label
				}),
				r && /* @__PURE__ */ U("span", {
					className: "min-w-0 flex-1 truncate text-faint",
					children: r
				}),
				/* @__PURE__ */ U(O, {
					name: t ? "chevron-down" : "chevron-right",
					size: 11,
					className: "ml-auto shrink-0 text-faint"
				})
			]
		}), t && /* @__PURE__ */ W("div", {
			className: "space-y-2 border-t border-border bg-surface px-2.5 py-2",
			children: [e.input !== void 0 && /* @__PURE__ */ U(mn, {
				label: y("Input"),
				value: JSON.stringify(e.input, null, 2)
			}), e.output && /* @__PURE__ */ U(mn, {
				label: e.status === "error" ? y("Error") : y("Result"),
				value: xn(e.output)
			})]
		})]
	});
}
function mn({ label: e, value: t }) {
	return /* @__PURE__ */ W("div", { children: [/* @__PURE__ */ U("div", {
		className: "cms-label mb-1",
		children: e
	}), /* @__PURE__ */ U("pre", {
		className: "m-0 max-h-56 overflow-auto whitespace-pre-wrap break-all font-mono text-2xs leading-relaxed text-muted",
		children: t
	})] });
}
function hn({ calls: e, onDecide: t }) {
	let n = e.some((e) => e.destructive);
	return /* @__PURE__ */ U("div", {
		className: "cms-thread-width w-full shrink-0 pb-2",
		children: /* @__PURE__ */ W("div", {
			className: "flex max-h-[40dvh] flex-col gap-2.5 overflow-y-auto rounded-xl border border-border-strong bg-surface p-3 shadow-sm",
			children: [
				/* @__PURE__ */ W("p", {
					className: "m-0 flex items-center gap-1.5 text-sm font-medium text-ink",
					children: [
						/* @__PURE__ */ U(O, {
							name: "shield",
							size: 14
						}),
						" ",
						e.length === 1 ? y("Allow this action?") : y("Allow these {count} actions?", { count: e.length })
					]
				}),
				/* @__PURE__ */ U("ul", {
					className: "m-0 flex list-none flex-col gap-2 p-0",
					children: e.map((e) => /* @__PURE__ */ U(gn, { call: e }, e.id))
				}),
				e.some((e) => e.untrusted) && /* @__PURE__ */ U("p", {
					className: "m-0 text-xs text-muted",
					children: y("After reading site content")
				}),
				/* @__PURE__ */ W("div", {
					className: "flex justify-end gap-1.5",
					children: [/* @__PURE__ */ U(T, {
						size: "sm",
						variant: "ghost",
						onClick: () => t([]),
						autoFocus: !0,
						children: y("Decline")
					}), /* @__PURE__ */ U(T, {
						size: "sm",
						variant: n ? "danger" : "primary",
						onClick: () => t(e.map((e) => e.id)),
						children: e.length === 1 ? e[0].label : y("Allow All")
					})]
				})
			]
		})
	});
}
function gn({ call: e }) {
	let [t, n] = H(!1), r = vn(e.input), i = yn(e.input);
	return /* @__PURE__ */ W("li", {
		className: "flex gap-2",
		children: [/* @__PURE__ */ U(O, {
			name: e.destructive ? "trash" : "edit",
			size: 13,
			className: R("mt-[3px] shrink-0", e.destructive ? "text-danger" : "text-muted")
		}), /* @__PURE__ */ W("div", {
			className: "min-w-0 flex-1",
			children: [
				/* @__PURE__ */ U("p", {
					className: "m-0 text-sm text-text",
					children: r || e.label
				}),
				/* @__PURE__ */ W(T, {
					variant: "ghost",
					size: "xs",
					onClick: () => n(!t),
					"aria-expanded": t,
					className: "-ml-1.5 !px-1.5 !font-normal !text-faint hover:!text-muted",
					children: [r ? e.label : y("Details"), /* @__PURE__ */ U(O, {
						name: t ? "chevron-down" : "chevron-right",
						size: 11
					})]
				}),
				t && /* @__PURE__ */ U("dl", {
					className: "mx-0 mb-0 mt-1.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 border-l border-border pl-2.5 text-xs",
					children: i.map(([e, t]) => /* @__PURE__ */ W(le, { children: [/* @__PURE__ */ U("dt", {
						className: "font-mono text-2xs leading-5 text-faint",
						children: e
					}), /* @__PURE__ */ U("dd", {
						className: "m-0 line-clamp-3 min-w-0 break-words text-muted",
						children: t
					})] }, e))
				})
			]
		})]
	});
}
function _n({ turns: e }) {
	let t = e[e.length - 1], n = t?.role === "answer" ? t.parts[t.parts.length - 1] : void 0;
	return n?.type === "text" || n?.type === "view" || n?.type === "tool" && n.status === "running" ? null : /* @__PURE__ */ W("p", {
		className: "m-0 flex items-center gap-2 text-xs text-faint",
		children: [
			/* @__PURE__ */ U(F, { size: 12 }),
			" ",
			y("Working…")
		]
	});
}
function vn(e) {
	let t = e && typeof e == "object" ? e.change_summary : void 0;
	return typeof t == "string" ? t.trim() : "";
}
function yn(e) {
	return !e || typeof e != "object" ? [] : Object.entries(e).filter(([e, t]) => e !== "change_summary" && t != null && t !== "").map(([e, t]) => [e, (typeof t == "string" ? t : JSON.stringify(t)).slice(0, 300)]);
}
function bn(e) {
	if (!e || typeof e != "object") return "";
	let t = e;
	for (let e of [
		"title",
		"name",
		"query",
		"q",
		"uri",
		"collection",
		"handle",
		"to",
		"id"
	]) if (typeof t[e] == "string" && t[e]) return String(t[e]).slice(0, 80);
	return "";
}
function xn(e) {
	try {
		return JSON.stringify(JSON.parse(e), null, 2);
	} catch {
		return e;
	}
}
m.panels.set("workspace", {
	slot: "shell.dock",
	component: Qt
}), m.panels.set("workspace-toggle", {
	slot: "topbar.end",
	component: He
}), m.panels.set("workspace-new-chat", {
	slot: "sidebar.start",
	component: st
}), m.entryActions.set("workspace-chat", {
	label: y("Chat"),
	icon: "comment",
	order: 0,
	when: () => window.matchMedia("(max-width: 639px)").matches,
	perform: () => Z.open()
}), m.routes.set("/chat/:id", {
	path: "/chat/:id",
	component: () => null,
	overlay: !0
}), a.on("chat.ask", (e) => Z.ask(e)), a.on("search.open", (e) => Z.palette(e?.from)), window.addEventListener("keydown", (e) => {
	(e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === "j" && (e.preventDefault(), Z.toggle());
});
